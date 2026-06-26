"""
Final FINAL extractor - properly handles all data formats.
Key fixes:
- Wrap items arrays in [] for JSON parsing
- Handle enemy/encounter data using entityType/entity_id patterns
- Better UTF-8 handling for Chinese names
"""
import re, json, urllib.request, ssl, time
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAGES = {
    "cards": "/cards", "relics": "/relics", "potions": "/potions",
    "characters": "/characters", "enemies": "/enemies", "ancients": "/ancients",
    "encounters": "/encounters", "events": "/events", "enchantments": "/enchantments",
}

def fetch(url, retries=2):
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept-Language": "zh-CN,zh;q=0.9",
            })
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read().decode("utf-8", errors="replace")
        except Exception as e:
            if attempt < retries:
                time.sleep(2)
                continue
            raise

def extract_rsc_strings(html):
    strings = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        i = start
        chars = []
        while i < len(html):
            if html[i] == '\\':
                if i+1 < len(html):
                    n = html[i+1]
                    if n == '"': chars.append('"'); i += 2; continue
                    elif n == '\\': chars.append('\\'); i += 2; continue
                    elif n == 'n': chars.append('\n'); i += 2; continue
                    elif n == 't': chars.append('\t'); i += 2; continue
                    else: chars.append(html[i]); i += 1; continue
            elif html[i] == '"':
                rest = html[i:i+5]
                if rest.startswith('"])'): break
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
    """Try to parse a JSON value, return None on failure."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None

def extract_all_json_objects(text):
    """Extract all JSON objects with 'id' field from text."""
    objects = []
    i = 0
    while i < len(text):
        brace = text.find('{', i)
        if brace == -1:
            break
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

def extract_keyed_array(text, key):
    """Extract JSON array for pattern "key": [...] . Wraps in [] if needed."""
    pat = re.compile(r'"' + re.escape(key) + r'"\s*:\s*(\[.*?\])')
    objects = []
    for m in pat.findall(text):
        # Check if the array content is valid JSON already
        obj = parse_json(m)
        if obj and isinstance(obj, list):
            for item in obj:
                if isinstance(item, dict) and ("id" in item or "entityId" in item):
                    objects.append(item)
            continue
        
        # Try wrapping in array brackets
        inner = m.strip()
        if inner.startswith('[') and inner.endswith(']'):
            pass  # already wrapped
        wrapped = '[' + inner + ']' if not inner.startswith('[') else inner
        obj2 = parse_json(wrapped)
        if obj2 and isinstance(obj2, list):
            for item in obj2:
                if isinstance(item, dict) and ("id" in item or "entityId" in item):
                    objects.append(item)
    return objects

def is_metadata(obj):
    oid = str(obj.get("id", ""))
    if oid.startswith(("$", "I:", "S:", "L")):
        return True
    if re.match(r'^\d+$', oid):
        return True
    if len(oid) > 40:
        return True
    return False

def normalize(obj, page_name):
    """Normalize to consistent format."""
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
                 "nameEs", "namePt"):
            continue
        if v is not None and v != "$undefined":
            entry[k] = v
    
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
    
    # Extract from all strings using all strategies
    all_objs = {}
    for s in strings:
        for obj in extract_all_json_objects(s):
            if isinstance(obj, dict) and "id" in obj and not is_metadata(obj):
                all_objs[obj["id"]] = obj
    
    # Also try named arrays
    for key in ["items", "enchantments", "ancients", "events", "encounters", "enemies", "timeline", "enemyList"]:
        for obj in extract_keyed_array('\n'.join(strings), key):
            oid = obj.get("id") or obj.get("entityId", "")
            if oid and not is_metadata({"id": oid} if isinstance(oid, str) else {}):
                all_objs[oid] = obj
    
    # For characters specifically, try finding data in a different way
    if name == "characters" and len(all_objs) < 5:
        # Try finding the items array with wrapping
        combined = '\n'.join(strings)
        for m in re.finditer(r'"items"\s*:\s*\[', combined):
            arr_start = m.end()
            depth = 1
            i = arr_start
            while i < len(combined) and depth > 0:
                c = combined[i]
                if c == '[': depth += 1
                elif c == ']': depth -= 1
                elif c == '"':
                    i += 1
                    while i < len(combined):
                        if combined[i] == '\\': i += 2; continue
                        if combined[i] == '"': break
                        i += 1
                i += 1
            arr_raw = combined[arr_start:i-1]
            # Wrap in brackets
            wrapped = '[' + arr_raw + ']'
            items = parse_json(wrapped)
            if items and isinstance(items, list):
                for item in items:
                    if isinstance(item, dict) and "id" in item:
                        all_objs[item["id"]] = item
    
    # Similarly for enchantments
    if name == "enchantments" or name == "ancients":
        combined = '\n'.join(strings)
        for array_key in ["enchantments", "ancients"]:
            for m in re.finditer(r'"' + array_key + r'"\s*:\s*\[', combined):
                arr_start = m.end()
                depth = 1
                i = arr_start
                while i < len(combined) and depth > 0:
                    c = combined[i]
                    if c == '[': depth += 1
                    elif c == ']': depth -= 1
                    elif c == '"':
                        i += 1
                        while i < len(combined):
                            if combined[i] == '\\': i += 2; continue
                            if combined[i] == '"': break
                            i += 1
                    i += 1
                arr_raw = combined[arr_start:i-1]
                wrapped = '[' + arr_raw + ']'
                items = parse_json(wrapped)
                if items and isinstance(items, list):
                    for item in items:
                        oid = item.get("id") or item.get("entityId", "")
                        if oid and isinstance(item, dict):
                            all_objs[oid] = item
    
    result = [normalize(obj, name) for obj in all_objs.values()]
    
    cats = {}
    for r in result:
        cats[r["category"]] = cats.get(r["category"], 0) + 1
    
    # Filter: if this page has a specific expected category, only keep those
    expected = {"cards": "CARD", "relics": "RELIC", "potions": "POTION",
                "characters": "CHARACTER", "enemies": "ENEMIE",
                "ancients": "ANCIENT", "encounters": "ENCOUNTER",
                "events": "EVENT", "enchantments": "ENCHANT"}
    if name in expected:
        exp = expected[name]
        result = [r for r in result if r["category"] == exp]
    
    print(f"{len(result)} items - cats: {cats}")
    return result

def main():
    print("=" * 60)
    print("SlaytheSpire2.gg Database Extractor (v4)")
    print("=" * 60)
    
    total = 0
    for name, path in PAGES.items():
        data = run_page(name, path)
        if data:
            out = OUT_DIR / f"{name}.json"
            with open(out, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            total += len(data)
    
    print(f"\n{'='*60}")
    print(f"Total: {total} items saved")

if __name__ == "__main__":
    main()
