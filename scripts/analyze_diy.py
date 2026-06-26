"""Analyze DIY card page RSC data and JS chunks."""
import re, json
from pathlib import Path

BASE = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")

# 1. Check RSC data in HTML
with open(BASE / "diy_card.html", "r", encoding="utf-8") as f:
    html = f.read()

# Extract RSC string blocks
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
                elif n == 'n': chars.append('\\n'); i += 2; continue
                else: chars.append(html[i]); i += 1; continue
        elif html[i] == '"':
            rest = html[i:i+5]
            if rest.startswith('"]):'): break
            if rest.startswith('"]'): break
            chars.append(html[i])
        else:
            chars.append(html[i])
        i += 1
    rsc = ''.join(chars)
    if len(rsc) < 100: continue
    
    # Look for diy-related data
    for kw in ["diy", "cardType", "rarity", "canvas", "drawCard", "cardGenerator"]:
        if kw in rsc.lower():
            idx = rsc.lower().index(kw)
            print(f"RSC found '{kw}': ...{rsc[max(0,idx-80):idx+150]}...")
            print()
            break

# 2. Look at JS chunks for card generation code
print("=" * 60)
print("Searching JS chunks for card generation logic...")
print("=" * 60)

for fpath in sorted(BASE.glob("_diy_*.js")):
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    
    keywords = ["canvas", "drawImage", "cardGenerator", "createCard", "generateCard",
                "fillText", "toDataURL", "font", "diycard", "diyCard"]
    found = [kw for kw in keywords if kw in content.lower()]
    if found:
        print(f"\n{fpath.name} ({len(content):,} bytes):")
        print(f"  Keywords: {found}")
        
        # Try to find function/class names
        for pat in [r"(?:function|class)\s+(\w+)", r"(\w+)\s*=\s*(?:function|\(\)\s*=>)"]:
            names = set(re.findall(pat, content))
            diy_names = [n for n in names if any(k in n.lower() for k in ["card", "draw", "canvas", "render", "image", "png", "diy"])]
            if diy_names:
                print(f"  Relevant names: {diy_names[:10]}")
