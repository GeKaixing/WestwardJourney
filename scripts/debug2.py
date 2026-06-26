"""
Debug remaining extraction issues.
"""
import re, json, urllib.request, ssl

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "zh-CN,zh;q=0.9"})
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
        return r.read().decode("utf-8", errors="replace")

def extract_rsc_strings(html):
    strings = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
        start = m.end()
        i = start
        chars = []
        while i < len(html):
            if html[i] == '\\':
                if i + 1 < len(html):
                    esc = html[i+1]
                    if esc == '"': chars.append('"'); i += 2; continue
                    elif esc == '\\': chars.append('\\'); i += 2; continue
                    elif esc == 'n': chars.append('\n'); i += 2; continue
                    else: chars.append(html[i]); i += 1; continue
            elif html[i] == '"':
                rest = html[i:i+5]
                if rest.startswith('"])'): break
                if rest.startswith('"]'):
                    j = i + 2
                    while j < len(html) and html[j] in ' \n\r\t': j += 1
                    if j < len(html) and html[j] == ')': break
                chars.append(html[i])
            else:
                chars.append(html[i])
            i += 1
        strings.append(''.join(chars))
    return strings

# Check characters page for the items array
print("=== CHARACTERS ===")
html = fetch("https://slaythespire2.gg/zh/characters")
strings = extract_rsc_strings(html)
print(f"RSC strings: {len(strings)}")

for idx, s in enumerate(strings):
    if len(s) < 500: continue
    
    # Check for items array
    if '"items"' in s:
        print(f"\nString {idx}: contains 'items' ({len(s):,} chars)")
        m = re.search(r'"items"\s*:\s*\[', s)
        if m:
            arr_start = m.end()
            depth = 1
            i = arr_start
            while i < len(s) and depth > 0:
                c = s[i]
                if c == '[': depth += 1
                elif c == ']': depth -= 1
                elif c == '"':
                    i += 1
                    while i < len(s):
                        if s[i] == '\\': i += 2; continue
                        if s[i] == '"': break
                        i += 1
                i += 1
            arr_str = s[arr_start:i-1]
            try:
                items = json.loads(arr_str)
                print(f"  Items array parsed: {len(items)} items")
                for item in items[:5]:
                    print(f"    id={item.get('id')}, name={item.get('name')}")
            except json.JSONDecodeError as e:
                print(f"  JSON error: {e}")
                # Show first 300 chars
                print(f"  Raw start: {arr_str[:300]}")
    
    # Check for 'title' (enchantments)
    if '"title"' in s:
        print(f"\nString {idx}: contains 'title' ({len(s):,} chars)")
        # Show context around first 'title'
        pos = s.index('"title"')
        print(f"  Context: {s[max(0,pos-100):pos+200]}")

# Check enchantments
print("\n\n=== ENCHANTMENTS ===")
html2 = fetch("https://slaythespire2.gg/zh/enchantments")
strings2 = extract_rsc_strings(html2)
print(f"RSC strings: {len(strings2)}")

for idx, s in enumerate(strings2):
    if '"title"' in s:
        print(f"\nString {idx}: contains 'title' ({len(s):,} chars)")
        # Find enchantments array
        if '"enchantments"' in s:
            m = re.search(r'"enchantments"\s*:\s*\[', s)
            if m:
                arr_start = m.end()
                depth = 1
                i = arr_start
                while i < len(s) and depth > 0:
                    c = s[i]
                    if c == '[': depth += 1
                    elif c == ']': depth -= 1
                    elif c == '"':
                        i += 1
                        while i < len(s):
                            if s[i] == '\\': i += 2; continue
                            if s[i] == '"': break
                            i += 1
                    i += 1
                arr_str = s[arr_start:i-1]
                try:
                    items = json.loads(arr_str)
                    print(f"  Enchantments array parsed: {len(items)} items")
                    for item in items[:5]:
                        print(f"    id={item.get('id')}, title={item.get('title')}")
                except json.JSONDecodeError as e:
                    print(f"  JSON error: {e}")
                    print(f"  Raw: {arr_str[:500]}")
            else:
                print("  'enchantments' key found but not followed by : [")
        else:
            # Find the structure with 'title'
            pos = s.index('"title"')
            print(f"  title context: {s[max(0,pos-200):pos+300]}")

# Check enemies - count unique IDs vs actual objects
print("\n\n=== ENEMIES CHECK ===")
html3 = fetch("https://slaythespire2.gg/zh/enemies")
strings3 = extract_rsc_strings(html3)
print(f"RSC strings: {len(strings3)}")

# Count enemy-related objects
id_count = 0
enemy_ids = set()
for s in strings3:
    for o_match in re.finditer(r'\{[^}]*"id"[^}]*\}', s):
        try:
            obj = json.loads(o_match.group(0))
            if isinstance(obj, dict) and "id" in obj:
                enemy_ids.add(obj["id"])
        except:
            pass
print(f"Total unique IDs in enemies page: {len(enemy_ids)}")
print(f"Sample IDs: {list(enemy_ids)[:10]}")
