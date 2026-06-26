"""
Comprehensive data extractor for slaythespire2.gg/zh.
Handles ALL data formats found in the RSC flight payloads.
"""
import re
import json
import urllib.request
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")
OUT_DIR.mkdir(parents=True, exist_ok=True)

ALL_PAGES = {
    "cards": "/cards",
    "relics": "/relics",
    "potions": "/potions",
    "characters": "/characters",
    "enemies": "/enemies",
    "ancients": "/ancients",
    "encounters": "/encounters",
    "events": "/events",
    "enchantments": "/enchantments",
}

def fetch_html(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")

def unescape_flight(data: str) -> str:
    """Unescape JavaScript string escapes from RSC flight payload."""
    return data.replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')

def extract_push_blocks(html):
    """Extract RSC flight string chunks from __next_f.push calls."""
    blocks = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        # Find the matching closing "]) or "]\n...)
        i = start
        in_escape = False
        while i < len(html):
            if in_escape:
                in_escape = False
                i += 1
                continue
            if html[i] == '\\':
                in_escape = True
                i += 1
                continue
            if html[i] == '"':
                rest = html[i:i+6]
                if rest.startswith('"])'):
                    i += 3
                    break
                if rest.startswith('"]'):
                    j = i + 2
                    while j < len(html) and html[j] in ' \n\r\t':
                        j += 1
                    if j < len(html) and html[j] == ')':
                        i = j + 1
                        break
            i += 1
        
        raw = html[start:i-3] if html[i-3:i] == '")' else html[start:i]
        blocks.append(unescape_flight(raw))
    return blocks

def extract_objects_v1(text):
    """
    Extract individual JSON objects with "id" field from text.
    Looks for {...} JSON objects.
    """
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

def extract_objects_v2(text):
    """
    Handle special formats:
    - Characters: {"category":"CHARACTER","items":[{...},...],...}
    - Enchantments: {"enchantments":[{...},...],...}
    - Enemies/Encounters: items with entityType
    """
    objects = []
    
    # Pattern 1: items arrays (characters)
    for m in re.finditer(r'"items"\s*:\s*\[', text):
        start = m.end()
        depth = 1
        i = start
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
            items = json.loads(text[start:i-1])
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict) and "id" in item:
                        objects.append(item)
        except (json.JSONDecodeError, ValueError):
            pass
    
    # Pattern 2: named arrays like "enchantments", "events", "ancients" etc.
    for key in ["enchantments", "ancients", "events", "encounters", "timeline"]:
        pattern = r'"' + re.escape(key) + r'"\s*:\s*\['
        for m in re.finditer(pattern, text):
            start = m.end()
            depth = 1
            i = start
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
                items = json.loads(text[start:i-1])
                if isinstance(items, list):
                    for item in items:
                        if isinstance(item, dict) and "id" in item:
                            objects.append(item)
            except (json.JSONDecodeError, ValueError):
                pass
    
    return objects

def deduplicate(objects):
    seen = set()
    result = []
    for obj in objects:
        if obj["id"] not in seen:
            seen.add(obj["id"])
            result.append(obj)
    return result

def normalize(objects, page_name):
    """Normalize objects: ensure id, name, category fields exist."""
    result = []
    for obj in objects:
        entry = {"id": obj["id"]}
        
        # Name
        name = (obj.get("nameZh") or obj.get("name") or 
                obj.get("title") or obj.get("nameEn") or obj["id"])
        entry["name"] = name
        
        # Category/type
        cat = (obj.get("category") or obj.get("entityType") or 
               obj.get("type") or page_name.upper().rstrip("S"))
        entry["category"] = cat
        
        # Copy all other fields
        for k, v in obj.items():
            if k not in ("id", "category", "entityType", "type", "title"):
                if v is not None and v != "$undefined":
                    entry[k] = v
        
        result.append(entry)
    return result

def scrape_page(name, path):
    url = f"https://slaythespire2.gg/zh{path}"
    print(f"  Fetching {url} ...", end=" ", flush=True)
    
    try:
        html = fetch_html(url)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}")
        return []
    except Exception as e:
        print(f"Error: {e}")
        return []
    
    print(f"{len(html):,} bytes", end=" ", flush=True)
    blocks = extract_push_blocks(html)
    print(f"({len(blocks)} blocks)", end=" ", flush=True)
    
    all_objects = []
    for block in blocks:
        all_objects.extend(extract_objects_v1(block))
        all_objects.extend(extract_objects_v2(block))
    
    # Filter out non-data objects
    real = []
    for obj in all_objects:
        oid = obj["id"]
        if oid.startswith("$") or oid.startswith("I:") or oid.startswith("S:"):
            continue
        if re.match(r'^\d+$', oid):
            continue
        if len(oid) > 50:
            continue
        real.append(obj)
    
    unique = deduplicate(real)
    print(f"→ {len(unique)} unique objects")
    
    normalized = normalize(unique, name)
    
    # Show stats
    cats = {}
    for o in normalized:
        cats[o["category"]] = cats.get(o["category"], 0) + 1
    print(f"  Categories: {cats}")
    if normalized:
        s = normalized[0]
        print(f"  Sample: {s.get('id')} / {s.get('name')} / {s.get('category')}")
    
    return normalized

def main():
    print("=" * 60)
    print("SlaytheSpire2.gg RSC Extractor v3 (Final)")
    print("=" * 60)
    
    for name, path in ALL_PAGES.items():
        print(f"\n[{name}]")
        objects = scrape_page(name, path)
        if objects:
            outpath = OUT_DIR / f"{name}.json"
            with open(outpath, "w", encoding="utf-8") as f:
                json.dump(objects, f, ensure_ascii=False, indent=2)
            print(f"  → Saved {len(objects)} items")

    # Also crawl individual card/enemy/etc pages for missing data?
    print("\n" + "=" * 60)
    print("Done! See data/ directory.")

if __name__ == "__main__":
    main()
