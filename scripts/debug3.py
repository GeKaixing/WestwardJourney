"""
Quick fix: correct expected category names and check characters extraction.
"""
import re, json, urllib.request
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")

def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0", "Accept-Language": "zh-CN,zh;q=0.9"
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")

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
    try: return json.loads(text)
    except: return None

# Check characters raw  
html = fetch("https://slaythespire2.gg/zh/characters")
strings = extract_rsc_strings(html)

# Find items array and print what we get
combined = '\n'.join(strings)
for m in re.finditer(r'"items"\s*:\s*\[', combined):
    arr_start = m.end()  # After '['
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
    print(f"Items array raw length: {len(arr_raw)}")
    print(f"Wrapped length: {len(wrapped)}")
    items = parse_json(wrapped)
    if items and isinstance(items, list):
        print(f"Parsed {len(items)} items!")
        for item in items:
            print(f"  id={item.get('id')}, name={item.get('name')}, cat={item.get('category')}")
    else:
        print(f"Parse failed")
        # Show first 500 chars
        print(wrapped[:500])
    break
else:
    print("No items array found!")
