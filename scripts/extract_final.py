"""
Final working extractor for slaythespire2.gg RSC flight data.
The key: JS string payload has escaped quotes (\") that must be preserved.
"""
import re
import json
import urllib.request
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAGES = {
    "cards": "/cards", "relics": "/relics", "potions": "/potions",
    "characters": "/characters", "enemies": "/enemies", "ancients": "/ancients",
    "encounters": "/encounters", "events": "/events", "enchantments": "/enchantments",
}

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "zh-CN,zh;q=0.9"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")

def extract_rsc_strings(html):
    """
    Extract the JS string content from each self.__next_f.push([1, "..."]) call.
    Handles JS escape sequences: \" -> ", \\ -> \, etc.
    """
    strings = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        i = start
        chars = []
        while i < len(html):
            if html[i] == '\\':
                # JS escape sequence
                if i + 1 < len(html):
                    esc = html[i+1]
                    if esc == '"':
                        chars.append('"')
                        i += 2
                        continue
                    elif esc == '\\':
                        chars.append('\\')
                        i += 2
                        continue
                    elif esc == 'n':
                        chars.append('\n')
                        i += 2
                        continue
                    elif esc == 't':
                        chars.append('\t')
                        i += 2
                        continue
                    else:
                        chars.append(html[i])
                        i += 1
                        continue
            elif html[i] == '"':
                # End of JS string (check for "]) or "]\n...)
                rest = html[i:i+5]
                if rest.startswith('"])'):
                    break
                if rest.startswith('"]'):
                    j = i + 2
                    while j < len(html) and html[j] in ' \n\r\t':
                        j += 1
                    if j < len(html) and html[j] == ')':
                        break
                chars.append(html[i])
            else:
                chars.append(html[i])
            i += 1
        
        strings.append(''.join(chars))
    
    return strings

def extract_json_objects(text):
    """Extract all JSON objects from text using brace matching."""
    objects = []
    i = 0
    while i < len(text):
        brace = text.find('{', i)
        if brace == -1:
            break
        if brace + 1 < len(text) and text[brace+1] == '"':
            depth = 0
            j = brace
            while j < len(text):
                c = text[j]
                if c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
                    if depth == 0:
                        try:
                            obj = json.loads(text[brace:j+1])
                            if isinstance(obj, dict) and "id" in obj:
                                objects.append(obj)
                        except (json.JSONDecodeError, ValueError):
                            pass
                        break
                elif c == '"':
                    j += 1
                    while j < len(text):
                        if text[j] == '\\':
                            j += 2
                            continue
                        if text[j] == '"':
                            break
                        j += 1
                j += 1
            i = j + 1
        else:
            i = brace + 1
    return objects

def extract_items_arrays(text):
    """
    Extract objects from special array structures:
    - {"items": [{...}, ...]}  (characters, etc.)
    - {"enchantments": [{...}, ...]}  (enchantments)
    - {"ancients": [{...}, ...]} etc.
    """
    objects = []
    
    for key_pattern in ['"items"', '"enchantments"', '"ancients"', '"events"', '"encounters"', '"enemies"', '"timeline"']:
        for m in re.finditer(key_pattern + r'\s*:\s*\[', text):
            arr_start = m.end()
            depth = 1
            i = arr_start
            while i < len(text) and depth > 0:
                c = text[i]
                if c == '[':
                    depth += 1
                elif c == ']':
                    depth -= 1
                elif c == '"':
                    i += 1
                    while i < len(text):
                        if text[i] == '\\':
                            i += 2
                            continue
                        if text[i] == '"':
                            break
                        i += 1
                i += 1
            
            try:
                items = json.loads(text[arr_start:i-1])
                if isinstance(items, list):
                    for item in items:
                        if isinstance(item, dict) and "id" in item:
                            objects.append(item)
            except (json.JSONDecodeError, ValueError):
                pass
    
    return objects

def run_page(name, path):
    url = f"https://slaythespire2.gg/zh{path}"
    print(f"  {name} ...", end=" ", flush=True)
    try:
        html = fetch(url)
    except Exception as e:
        print(f"FAIL: {e}")
        return []
    
    strings = extract_rsc_strings(html)
    
    all_obj = []
    for s in strings:
        all_obj.extend(extract_json_objects(s))
        all_obj.extend(extract_items_arrays(s))
    
    # Filter metadata
    real = [o for o in all_obj 
            if not o["id"].startswith(("$", "I:", "S:", "L")) 
            and not re.match(r'^\d+$', o["id"])
            and len(o["id"]) < 40]
    
    # Deduplicate keeping last occurrence (which has more data)
    seen = {}
    for o in real:
        seen[o["id"]] = o
    real = list(seen.values())
    
    # Normalize
    result = []
    for o in real:
        entry = {"id": o["id"]}
        entry["name"] = o.get("nameZh") or o.get("name") or o.get("title") or o.get("nameEn") or o["id"]
        entry["category"] = o.get("category") or o.get("entityType") or name.upper().rstrip("S")
        for k, v in o.items():
            if k not in ("id", "category", "entityType", "name", "nameZh", "nameEn", 
                        "nameJa", "nameKo", "nameDe", "nameFr", "nameEs", "namePt", "title"):
                if v is not None and v != "$undefined":
                    entry[k] = v
        result.append(entry)
    
    cats = {}
    for r in result:
        cats[r["category"]] = cats.get(r["category"], 0) + 1
    print(f"{len(result)} items - cats: {cats}")
    
    return result

def main():
    print("=" * 60)
    print("Extracting slaythespire2.gg database (fixed RSC parser)")
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
    print(f"Total: {total} items saved to {OUT_DIR}")

if __name__ == "__main__":
    main()
