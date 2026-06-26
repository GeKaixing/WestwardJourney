"""
Final FINAL FINAL extractor.
Key insight: \n in JS strings stays as \n (literal backslash-n) for JSON validity.
"""
import re, json, urllib.request, time
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAGES = {
    "cards": "/cards", "relics": "/relics", "potions": "/potions",
    "characters": "/characters", "enemies": "/enemies", "ancients": "/ancients",
    "encounters": "/encounters", "events": "/events", "enchantments": "/enchantments",
}

EXPECTED_CATS = {
    "cards": "CARD", "relics": "RELIC", "potions": "POTION",
    "characters": "CHARACTER", "enemies": "ENEMIE",
    "ancients": "ANCIENT", "encounters": "ENCOUNTER",
    "events": "EVENT", "enchantments": "ENCHANTMENT",
}

def fetch(url, retries=2):
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0", "Accept-Language": "zh-CN,zh;q=0.9"
            })
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read().decode("utf-8", errors="replace")
        except Exception as e:
            if attempt < retries:
                time.sleep(3)
                continue
            raise

def extract_rsc_strings(html):
    """
    Extract JS string content from __next_f.push([1, "..."]) calls.
    Converts JS escape sequences:
      \" -> "    (unescaped quote for JSON)
      \\ -> \    (unescaped backslash)
      \n -> LITERAL \n (stays as backslash-n for JSON validity)
    """
    strings = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        i = start
        chars = []
        while i < len(html):
            if html[i] == '\\':
                if i+1 < len(html):
                    n = html[i+1]
                    if n == '"':          # \" -> "
                        chars.append('"')
                        i += 2; continue
                    elif n == '\\':        # \\ -> \
                        chars.append('\\')
                        i += 2; continue
                    elif n == 'n':         # \n -> keep as literal \n
                        chars.append('\\')
                        chars.append('n')
                        i += 2; continue
                    elif n == 't':         # \t -> tab
                        chars.append('\t')
                        i += 2; continue
                    else:
                        chars.append(html[i])
                        i += 1; continue
            elif html[i] == '"':
                # Check end of JS string
                rest = html[i:i+5]
                if rest.startswith('"])'):
                    break
                if rest.startswith('"]'):
                    j = i+2
                    while j < len(html) and html[j] in ' \n\r\t': j += 1
                    if j < len(html) and html[j] == ')': break
                chars.append(html[i])
            else:
                chars.append(html[i])
            i += 1
        strings.append(''.join(chars))
    return strings

def parse_json(text):
    try: return json.loads(text)
    except: return None

def is_metadata(obj):
    oid = str(obj.get("id", ""))
    if oid.startswith(("$", "I:", "S:", "L")): return True
    if re.match(r'^\d+$', oid): return True
    if len(oid) > 40: return True
    return False

def extract_all_json_objects(text):
    """Extract all JSON dicts with 'id' field from text."""
    objects = []
    i = 0
    while i < len(text):
        brace = text.find('{', i)
        if brace == -1: break
        if brace+1 < len(text) and text[brace+1] == '"':
            depth = 0
            j = brace
            while j < len(text):
                c = text[j]
                if c == '{': depth += 1
                elif c == '}':
                    depth -= 1
                    if depth == 0:
                        obj = parse_json(text[brace:j+1])
                        if obj and isinstance(obj, dict):
                            objects.append(obj)
                        break
                elif c == '"':
                    j += 1
                    while j < len(text):
                        if text[j] == '\\': j += 2; continue
                        if text[j] == '"': break
                        j += 1
                j += 1
            i = j + 1
        else:
            i = brace + 1
    return objects

def extract_named_array(text, array_key):
    """
    Extract objects from "array_key": [...content...] 
    Returns list of dicts with "id" field.
    """
    results = []
    pattern = r'"' + re.escape(array_key) + r'"\s*:\s*\['
    for m in re.finditer(pattern, text):
        arr_start = m.end()  # position after '['
        depth = 1
        i = arr_start
        while i < len(text) and depth > 0:
            c = text[i]
            if c == '[': depth += 1
            elif c == ']': depth -= 1
            elif c == '"':
                i += 1
                while i < len(text):
                    if text[i] == '\\': i += 2; continue
                    if text[i] == '"': break
                    i += 1
            i += 1
        arr_raw = text[arr_start:i-1]
        wrapped = '[' + arr_raw + ']'
        items = parse_json(wrapped)
        if items and isinstance(items, list):
            for item in items:
                if isinstance(item, dict) and ("id" in item or "entityId" in item):
                    results.append(item)
    return results

def normalize(obj, page_name):
    entry = {"id": obj.get("id") or obj.get("entityId", "")}
    entry["name"] = (obj.get("nameZh") or obj.get("name") or 
                     obj.get("title") or obj.get("nameEn") or entry["id"])
    cat = obj.get("category") or obj.get("entityType") or ""
    if not cat:
        cat = page_name.upper().rstrip("S")
    entry["category"] = cat
    
    for k, v in obj.items():
        if k in ("id", "entityId", "category", "entityType", "name", "title",
                 "nameZh", "nameEn", "nameJa", "nameKo", "nameDe", "nameFr",
                 "nameEs", "namePt"): continue
        if v is not None and v != "$undefined": entry[k] = v
    return entry

def run_page(name, path):
    url = f"https://slaythespire2.gg/zh{path}"
    print(f"  {name} ...", end=" ", flush=True)
    try:
        html = fetch(url)
    except Exception as e:
        print(f"FAIL: {e}")
        return []
    
    strings = extract_rsc_strings(html)
    combined = ''.join(strings)
    
    # Strategy 1: Extract all individual JSON objects with "id"
    raw_objs = extract_all_json_objects(combined)
    
    # Strategy 2: Extract from named arrays (items, enchantments, etc.)
    for key in ["items", "enchantments", "ancients", "events", "encounters", "enemies", "timeline"]:
        raw_objs.extend(extract_named_array(combined, key))
    
    # Deduplicate by id
    deduped = {}
    for obj in raw_objs:
        oid = obj.get("id") or obj.get("entityId", "")
        if oid and not is_metadata({"id": oid}):
            deduped[oid] = obj
    
    # Normalize
    normalized = [normalize(obj, name) for obj in deduped.values()]
    
    # Filter by expected category
    exp = EXPECTED_CATS.get(name)
    if exp:
        filtered = [r for r in normalized if r["category"] == exp]
    else:
        filtered = normalized
    
    # Count categories for display
    cats = {}
    for r in normalized:
        cats[r["category"]] = cats.get(r["category"], 0) + 1
    
    print(f"{len(filtered)} items filtered (total raw: {cats})")
    return filtered

def main():
    print("=" * 60)
    print("SlaytheSpire2.gg Database Extractor (v5)")
    print("=" * 60)
    
    for name, path in PAGES.items():
        data = run_page(name, path)
        if data:
            out = OUT_DIR / f"{name}.json"
            with open(out, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
