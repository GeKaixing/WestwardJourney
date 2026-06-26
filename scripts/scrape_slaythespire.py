"""
Scrape all data from slaythespire2.gg/zh — extract embedded JSON from Next.js RSC payloads
and save as structured JSON files in the project data/ directory.
"""
import json
import re
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

BASE_URL = "https://slaythespire2.gg/zh"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

PAGES = {
    "cards":       "/cards",
    "relics":      "/relics",
    "potions":     "/potions",
    "characters":  "/characters",
    "enemies":     "/enemies",
    "ancients":    "/ancients",       # 先古
    "encounters":  "/encounters",      # 遭遇
    "events":      "/events",          # 事件
    "enchantments":"/enchantments",    # 附魔
    "timelines":   "/timelines",       # 时间线
}

def fetch_page(url: str) -> str:
    """Fetch page HTML with a browser-like User-Agent."""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}", file=sys.stderr)
        return ""


def extract_json_objects(html: str) -> list:
    """
    Extract JavaScript array/object literal chunks from __next_f.push(...) calls.
    Try multiple strategies:
    1. Find `self.__next_f.push([` ... `])` blocks
    2. Within each block, find JSON-like objects ({...}) that contain "id" and "name"
    3. Parse each found object
    """
    objects = []
    
    # Strategy 1: Find all __next_f.push([...]) blocks
    push_pattern = re.compile(
        r"self\.__next_f\.push\(\[(?:[^[\]]|\[[^\]]*\])*\]\)",
        re.DOTALL
    )
    
    for match in push_pattern.finditer(html):
        block = match.group(0)
        
        # Strategy 2: Within each block, extract JSON-like objects
        # Look for objects that start with {"id":"..."}
        obj_pattern = re.compile(
            r'\{(?:[^{}]|"(?:\\.|[^"\\])*"|\{(?:[^{}]|"(?:\\.|[^"\\])*")*\})*\}',
            re.DOTALL
        )
        
        for obj_match in obj_pattern.finditer(block):
            raw = obj_match.group(0)
            try:
                obj = json.loads(raw)
                if isinstance(obj, dict) and "id" in obj and "name" in obj:
                    objects.append(obj)
            except (json.JSONDecodeError, ValueError):
                continue
    
    # De-duplicate by id
    seen = set()
    unique = []
    for obj in objects:
        if obj["id"] not in seen:
            seen.add(obj["id"])
            unique.append(obj)
    
    return unique


def extract_data_from_html(html: str) -> dict:
    """
    Alternative: extract data from the big data array that's pushed as the last
    large __next_f.push call. The data appears to be pushed as an array of objects.
    Look for the pattern: `,[{"id":"...","name":"...",...},{...}],` 
    """
    result = {}
    
    # Try to find the main data array - it's typically a large JSON array pushed
    # in a single __next_f.push call. Look for arrays of objects with "id" fields.
    
    # Strategy: find all large JSON arrays in push calls
    array_pattern = re.compile(
        r'\[\[\{"id":"[^"]+","name":"[^"]+".*?\]\]',
        re.DOTALL
    )
    
    for match in array_pattern.finditer(html):
        raw = match.group(0)
        # Extract just the inner array (remove enclosing [[ and ]])
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                # First element might be metadata/config, rest is data
                for item in data:
                    if isinstance(item, dict) and "id" in item and "name" in item:
                        result[item["id"]] = item
        except (json.JSONDecodeError, ValueError):
            continue
    
    return result


def extract_all_objects(html: str) -> list:
    """Extract all data objects using multiple strategies."""
    objects = []
    
    # Strategy A: Find __next_f.push blocks with large JSON arrays
    # Pattern: self.__next_f.push(["X", [...big array of objects...]])
    push_blocks = re.finditer(
        r'self\.__next_f\.push\(\s*\[\s*("[^"]*")\s*,\s*(\[.*?\])\s*\]\s*\)',
        html,
        re.DOTALL
    )
    
    for pb in push_blocks:
        key = pb.group(1)
        array_str = pb.group(2)
        try:
            items = json.loads(array_str)
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict) and "id" in item and "name" in item:
                        objects.append(item)
        except (json.JSONDecodeError, ValueError):
            pass
    
    # Strategy B: Find all JSON object literals within push calls
    # More aggressive: find all top-level {}-delimited objects
    if not objects:
        # Walk through the HTML character by character looking for { sequences
        i = 0
        while i < len(html):
            if html[i] == '{':
                depth = 0
                j = i
                while j < len(html):
                    if html[j] == '{':
                        depth += 1
                    elif html[j] == '}':
                        depth -= 1
                        if depth == 0:
                            chunk = html[i:j+1]
                            try:
                                obj = json.loads(chunk)
                                if isinstance(obj, dict) and "id" in obj and "name" in obj:
                                    objects.append(obj)
                            except (json.JSONDecodeError, ValueError):
                                pass
                            break
                    elif html[j] == '"':
                        # Skip string literals
                        j += 1
                        while j < len(html):
                            if html[j] == '\\':
                                j += 2
                                continue
                            if html[j] == '"':
                                break
                            j += 1
                    j += 1
                i = j + 1
            else:
                i += 1
    
    # De-duplicate
    seen = set()
    unique = []
    for obj in objects:
        if obj["id"] not in seen:
            seen.add(obj["id"])
            unique.append(obj)
    
    return unique


def scrape_page(name: str, path: str) -> list:
    """Scrape a single page and return list of extracted objects."""
    url = f"{BASE_URL}{path}"
    print(f"  Fetching {url} ...", end=" ", flush=True)
    html = fetch_page(url)
    if not html:
        print("FAILED")
        return []
    
    objects = extract_all_objects(html)
    print(f"found {len(objects)} objects")
    return objects


def save_data(name: str, objects: list):
    """Save extracted objects to a JSON file."""
    filepath = DATA_DIR / f"{name}.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(objects, f, ensure_ascii=False, indent=2)
    print(f"  Saved to {filepath}")


def main():
    print("=" * 60)
    print("Scraping SlaytheSpire2.gg/zh database")
    print("=" * 60)
    
    total = 0
    for name, path in PAGES.items():
        print(f"\n[{name}] {path}")
        objects = scrape_page(name, path)
        if objects:
            save_data(name, objects)
            total += len(objects)
        else:
            # Try with -all suffix or alternative URL
            print(f"  No objects found on first try, checking raw HTML structure...")
            # Save a sample of the HTML for debugging
            sample_path = DATA_DIR / f"_{name}_sample.html"
            html = fetch_page(f"{BASE_URL}{path}")
            if html:
                with open(sample_path, "w", encoding="utf-8") as f:
                    f.write(html[:50000])
                print(f"  Saved HTML sample to {sample_path}")
    
    print(f"\n{'=' * 60}")
    print(f"Total: {total} objects saved to {DATA_DIR}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
