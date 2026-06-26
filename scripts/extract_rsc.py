"""
Extract game data from Next.js RSC (React Server Components) flight payload.
The data is embedded in self.__next_f.push([1, "... huge JS string ..."]) calls.
"""
import re
import json
import sys
from pathlib import Path

HTML_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")
OUT_DIR = HTML_DIR

PAGES = [
    "cards", "relics", "potions", "characters",
    "enemies", "ancients", "encounters", "events",
    "enchantments", "timelines"
]

def fetch_full_html(name):
    """Download full HTML for a page using urllib"""
    import urllib.request
    url = f"https://slaythespire2.gg/zh/{name}"
    outpath = HTML_DIR / f"_{name}_full.html"
    
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }
    )
    print(f"  Fetching {url} ...", end=" ", flush=True)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            html = resp.read().decode("utf-8", errors="replace")
        with open(outpath, "w", encoding="utf-8") as f:
            f.write(html)
        size = len(html)
        print(f"{size:,} bytes")
        return html
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}")
        return ""
    except Exception as e:
        print(f"Error: {e}")
        return ""

def extract_data_from_flight(html):
    """
    Extract JSON objects from the RSC flight payload.
    The last push block contains the actual game data in a format like:
    ...card_id,{"id":"card_id","name":"...",...},...
    
    Strategy: find all JSON object patterns {key:value, ...} that have "id" and "name" fields.
    In the RSC format, these appear after specific markers.
    """
    objects = []
    
    # Find all __next_f.push([1, "...content..."]) blocks
    # The content has escaped quotes inside JS strings
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        # The string content ends with "]) 
        # But we need to be careful about escaped quotes inside
        depth = 1
        i = start
        while i < len(html) and depth > 0:
            if html[i] == '\\':
                i += 2  # skip escaped char
                continue
            if html[i] == '"':
                # Check if this ends the string: "]) or "]\n])
                remaining = html[i:i+5]
                if remaining.startswith('"])'):
                    depth = 0
                    break
                if remaining.startswith('"]'):
                    # Check if followed by )
                    j = i + 2
                    while j < len(html) and html[j] in ' \n\r\t':
                        j += 1
                    if j < len(html) and html[j] == ')':
                        depth = 0
                        break
            i += 1
        
        # Extract the raw string content (unescape it)
        raw_content = html[start:i]
        # Unescape: \\" -> ", \\n -> \n, \\\\ -> \\
        unescaped = raw_content.replace('\\"', '"').replace('\\\\', '\\')
        # But don't unescape \\n in the whole thing - the RSC data uses literal \n as newlines
        
        # Find all JSON-like objects in this content
        # Look for { ... id": "..." ... name": "..." ... }
        # These appear as stringified JSON in the RSC format
        
        # Strategy: find all substrings that are valid JSON objects with "id" fields
        obj_start = 0
        while True:
            # Find next '{' that's likely the start of a JSON object
            brace_idx = unescaped.find('{', obj_start)
            if brace_idx == -1:
                break
            
            # Try to parse from this position
            depth = 0
            j = brace_idx
            while j < len(unescaped):
                if unescaped[j] == '{':
                    depth += 1
                elif unescaped[j] == '}':
                    depth -= 1
                    if depth == 0:
                        candidate = unescaped[brace_idx:j+1]
                        try:
                            obj = json.loads(candidate)
                            if isinstance(obj, dict) and "id" in obj and "name" in obj:
                                objects.append(obj)
                        except (json.JSONDecodeError, ValueError):
                            pass
                        obj_start = j + 1
                        break
                elif unescaped[j] == '"':
                    # Skip string
                    j += 1
                    while j < len(unescaped):
                        if unescaped[j] == '\\':
                            j += 2
                            continue
                        if unescaped[j] == '"':
                            break
                        j += 1
                j += 1
            else:
                # Never closed - move past the opening brace
                obj_start = brace_idx + 1
    
    # De-duplicate by id
    seen = set()
    unique = []
    for obj in objects:
        if obj["id"] not in seen:
            seen.add(obj["id"])
            unique.append(obj)
    
    return unique


def main():
    print("=" * 60)
    print("SlaytheSpire2.gg RSC Data Extractor")
    print("=" * 60)
    
    for name in PAGES:
        print(f"\n[{name}]")
        html = fetch_full_html(name)
        if not html:
            continue
        
        objects = extract_data_from_flight(html)
        print(f"  Extracted {len(objects)} objects")
        
        if objects:
            outpath = OUT_DIR / f"{name}.json"
            with open(outpath, "w", encoding="utf-8") as f:
                json.dump(objects, f, ensure_ascii=False, indent=2)
            print(f"  Saved to {outpath}")
            # Print first object as sample
            sample = objects[0]
            print(f"  Sample: id={sample.get('id')}, name={sample.get('name')}, category={sample.get('category')}")


if __name__ == "__main__":
    main()
