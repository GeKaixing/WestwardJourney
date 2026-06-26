"""
Inspect specific RSC payloads for characters and enchantments.
"""
import re
import urllib.request
from pathlib import Path

OUT_DIR = Path(r"C:\Users\admin\Desktop\WestwardJourney\data")

def inspect_page(name, path):
    url = f"https://slaythespire2.gg/zh{path}"
    print(f"\n=== {name} ===")
    
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=30)
    html = resp.read().decode("utf-8", errors="replace")
    print(f"HTML size: {len(html):,} bytes")
    
    # Find all push blocks
    pattern = re.compile(r'self\.__next_f\.push\(\[1,\s*"')
    blocks = []
    for m in pattern.finditer(html):
        start = m.end()
        depth = 1
        i = start
        while i < len(html) and depth > 0:
            if html[i] == '\\':
                i += 2
                continue
            if html[i] == '"':
                # Check end
                rest = html[i:i+6]
                if rest.startswith('"]\n') or rest.startswith('"])'):
                    depth = 0
                    break
            i += 1
        raw = html[start:i]
        unescaped = raw.replace('\\"', '"').replace('\\\\', '\\')
        blocks.append(unescaped)
    
    print(f"Push blocks: {len(blocks)}")
    
    # For each block, look for interesting data
    for bidx, block in enumerate(blocks):
        # Skip if too short
        if len(block) < 500:
            continue
        
        # Check for relevant keywords
        keywords = []
        if name == "characters":
            keywords = ["startingHp", "startingDeck", "maxEnergy", "startingRelic", 
                        "ironclad", "silent", "defect", "necrobinder", "regent",
                        "铁甲战士", "静默猎手", "故障机器人"]
        else:
            keywords = ["enchantment", "enchant", "附魔", "Enchant"]
        
        found = [k for k in keywords if k.lower() in block.lower()]
        if found:
            print(f"\nBlock {bidx} ({len(block):,} chars) - keywords: {found}")
            # Show around the first keyword
            first_kw = found[0]
            idx = block.lower().index(first_kw.lower())
            show = block[max(0, idx-200):idx+500]
            print(f"  Context: {show}")
            print()


if __name__ == "__main__":
    inspect_page("characters", "/characters")
    inspect_page("enchantments", "/enchantments")
