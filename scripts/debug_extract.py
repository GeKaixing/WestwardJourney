"""
Debug: Check why characters and enchantments aren't being extracted.
"""
import re
import json
import urllib.request

def fetch_html(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=30)
    return resp.read().decode("utf-8", errors="replace")

def extract_push_strings(html):
    """Extract raw push strings WITHOUT unescaping first."""
    strings = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        i = start
        in_escape = False
        while i < len(html):
            if html[i] == '\\':
                i += 2
                continue
            if html[i] == '"':
                rest = html[i:i+3]
                if rest.startswith('"]'):
                    strings.append(html[start:i])
                    break
            i += 1
    return strings

def check_page(name, path):
    url = f"https://slaythespire2.gg/zh{path}"
    html = fetch_html(url)
    strings = extract_push_strings(html)
    print(f"\n=== {name} ===")
    print(f"Push strings: {len(strings)}")
    
    for idx, s in enumerate(strings):
        if len(s) < 500:
            continue
        
        # Show the raw start (first 200 chars after unescaping)
        # Actually, let's look at the raw (still escaped) content
        # and search for the data patterns
        escaped_slash = '\\\\n'
        if '"items"' in s or 'enchantment' in s.lower() or 'title' in s:
            print(f"\n  Push {idx} ({len(s):,} chars):")
                
            # Try to detect data patterns
            for pattern in ['"items"', '"enchantments"', '"title"']:
                matches = re.findall(pattern, s)
                if matches:
                    pos = s.index(pattern)
                    print(f"    Found {pattern} at offset {pos}")
                    chunk = s[max(0,pos-50):pos+200]
                    print(f"    Context: {chunk.replace(escaped_slash, escaped_slash)}")
            
            # Show if "id" appears
            id_count = s.count('"id"')
            name_count = s.count('"name"')
            print(f"    'id' count: {id_count}, 'name' count: {name_count}")
            
            # Try extracting the items array
            if '"items"' in s:
                # Find the items array
                m = re.search(r'"items"\s*:\s*\[', s)
                if m:
                    arr_start = m.end()
                    depth = 1
                    i = arr_start
                    while i < len(s) and depth > 0:
                        c = s[i]
                        if c == '[':
                            depth += 1
                        elif c == ']':
                            depth -= 1
                        elif c == '"':
                            i += 1
                            while i < len(s):
                                if s[i] == '\\':
                                    i += 2
                                    continue
                                if s[i] == '"':
                                    break
                                i += 1
                        i += 1
                    arr_str = s[arr_start:i-1]
                    # Unescape
                    arr_str_unesc = arr_str.replace('\\"', '"').replace('\\\\', '\\')
                    try:
                        items = json.loads(arr_str_unesc)
                        print(f"    Parsed {len(items)} items from items array!")
                        for item in items[:3]:
                            print(f"      - {item.get('id')}: {item.get('name')}")
                    except json.JSONDecodeError as e:
                        print(f"    JSON parse error: {e}")
                        # Show first 300 chars
                        print(f"    First 300: {arr_str_unesc[:300]}")

if __name__ == "__main__":
    check_page("characters", "/characters")
    check_page("enchantments", "/enchantments")
