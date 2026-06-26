"""Deep dive: find the main card drawing pipeline and full source code."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("=" * 60)
print("CARD RENDERING PIPELINE")
print("=" * 60)

# Find where the main draw function is called or defined
# The function ep is likely image processing (background removal)
# Let me find the broader rendering flow

# Find the description text rendering (unique text)
for pat in ['ureText', 'descCenterY', 'thievingHopper', 'measureText', 'cardWidth']:
    matches = re.findall(r'.{0,50}' + pat + r'.{0,200}', content)
    if matches:
        print(f"\n=== {pat} ===")
        for m in matches[:4]:
            clean = m.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
            if len(clean) > 300:
                clean = clean[:300] + '...'
            print(f"  {clean}")

# Find the use of card templates (URLs or image loading)
print("\n" + "=" * 60)
print("TEMPLATE LOADING & IMAGE URLS")
print("=" * 60)
for pat in ['diy-card-templates', 'cardTemplate', 'card/template', '/images/', '.webp', 'png']:
    matches = re.findall(r'[^;]{0,30}' + re.escape(pat) + r'[^;]{0,100}', content)
    if matches:
        print(f"\n  {pat}:")
        for m in matches[:5]:
            clean = m.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
            print(f"    {clean}")

# Find where card type/rarity templates are chosen
print("\n" + "=" * 60)
print("TEMPLATE SELECTION LOGIC")
print("=" * 60)
for pat in ['templateMap', 'frameMap', 'cardType', 'rarity', 'STS2', 'STS1']:
    matches = re.findall(r'[^;]{0,30}' + re.escape(pat) + r'[^;]{0,100}', content)
    if matches:
        print(f"\n  {pat}:")
        for m in matches[:8]:
            clean = m.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
            print(f"    {clean}")
