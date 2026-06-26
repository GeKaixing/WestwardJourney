"""
Extract game data from Next.js RSC flight payload on slaythespire2.gg/zh.
Handles multiple data formats:
  - Format A: {"id","name","category"}  (cards, relics, potions)
  - Format B: {"id","nameEn","nameZh","entityType"}  (enemies, encounters, enchantments, events, ancients)
"""
import re
import json
import urllib.request
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PAGES = [
    ("cards",        "/cards"),
    ("relics",       "/relics"),
    ("potions",      "/potions"),
    ("characters",   "/characters"),
    ("enemies",      "/enemies"),
    ("ancients",     "/ancients"),
    ("encounters",   "/encounters"),
    ("events",       "/events"),
    ("enchantments", "/enchantments"),
    ("timelines",    "/timelines"),
]

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

def get_push_blocks(html):
    """Extract all self.__next_f.push([1, "...string..."]) blocks and unescape them."""
    blocks = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\s*\)\s*(?:</script>)?', html, re.DOTALL):
        raw = m.group(1)
        # Unescape JavaScript string escapes
        unescaped = raw.replace('\\"', '"').replace('\\\\', '\\')
        # Handle \n as actual newlines
        unescaped = unescaped.replace('\\n', '\n')
        blocks.append(unescaped)
    return blocks

def extract_objects_from_flight(flight_str):
    """
    Extract all JSON-like objects from the RSC flight data string.
    Uses a careful brace-matching approach.
    """
    objects = []
    i = 0
    while i < len(flight_str):
        # Find likely JSON object start: { followed by "key"
        brace = flight_str.find('{', i)
        if brace == -1:
            break
        
        # Check if this looks like a JSON object: { "..." : or {"id":
        if brace + 1 < len(flight_str) and flight_str[brace+1] == '"':
            # Try to parse from this brace
            depth = 0
            j = brace
            while j < len(flight_str):
                ch = flight_str[j]
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        candidate = flight_str[brace:j+1]
                        try:
                            obj = json.loads(candidate)
                            if isinstance(obj, dict) and "id" in obj:
                                objects.append(obj)
                        except (json.JSONDecodeError, ValueError):
                            pass
                        break
                elif ch == '"':
                    # Skip string content
                    j += 1
                    while j < len(flight_str):
                        if flight_str[j] == '\\':
                            j += 2
                            continue
                        if flight_str[j] == '"':
                            break
                        j += 1
                j += 1
            i = j + 1
        else:
            i = brace + 1
    
    return objects

def deduplicate(objects):
    seen = set()
    result = []
    for obj in objects:
        if obj["id"] not in seen:
            seen.add(obj["id"])
            result.append(obj)
    return result

def normalize_object(obj):
    """Normalize an object to standard format with id, name, category."""
    result = {"id": obj["id"]}
    
    # Get name from various possible keys
    name = (obj.get("nameZh") or obj.get("name") or 
            obj.get("nameEn") or obj.get("id"))
    result["name"] = name
    
    # Determine category
    cat = obj.get("category") or obj.get("entityType") or "UNKNOWN"
    result["category"] = cat
    
    # Include all other fields
    for k, v in obj.items():
        if k not in ("id", "category", "entityType", "name", "nameZh", "nameEn", "nameJa", "nameKo", "nameDe", "nameFr", "nameEs", "namePt"):
            # Skip undefined-looking values
            if v is not None and v != "$undefined":
                result[k] = v
    
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
    
    blocks = get_push_blocks(html)
    print(f"({len(blocks)} push blocks)", end=" ", flush=True)
    
    all_objects = []
    for block in blocks:
        objs = extract_objects_from_flight(block)
        all_objects.extend(objs)
    
    # Remove objects that are just metadata (no real data content)
    real_objects = []
    for obj in all_objects:
        # Skip React/RSC metadata objects
        if obj["id"].startswith("$") or obj["id"].startswith("I:"):
            continue
        if re.match(r'^\d+$', obj["id"]):  # pure numbers
            continue
        if len(obj["id"]) > 50:  # too long, likely a hash
            continue
        real_objects.append(obj)
    
    unique = deduplicate(real_objects)
    print(f"→ {len(unique)} objects")
    
    return unique

def main():
    print("=" * 60)
    print("SlaytheSpire2.gg RSC Data Extractor v2")
    print("=" * 60)
    
    for name, path in PAGES:
        print(f"\n[{name}]")
        if path == "/timelines":
            print("  Skipping (404)")
            continue
        objects = scrape_page(name, path)
        if objects:
            outpath = OUT_DIR / f"{name}.json"
            normalized = [normalize_object(o) for o in objects]
            with open(outpath, "w", encoding="utf-8") as f:
                json.dump(normalized, f, ensure_ascii=False, indent=2)
            print(f"  Saved {len(normalized)} items to {outpath}")
            sample = normalized[0]
            cats = {}
            for o in normalized:
                cats[o["category"]] = cats.get(o["category"], 0) + 1
            print(f"  Categories: {cats}")
            print(f"  Sample: {sample.get('id')} / {sample.get('name')} / {sample.get('category')}")


if __name__ == "__main__":
    main()
