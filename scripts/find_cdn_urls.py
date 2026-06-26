"""Find all image URLs in the DIY card generator JS bundle."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all URLs pointing to img.slaythespire2.gg
urls = set()
for m in re.finditer(r'https?://[^"\')\s,;]+(?:png|webp|jpg|jpeg)', content):
    urls.add(m.group(0))

print(f"Found {len(urls)} asset URLs:")
for u in sorted(urls):
    print(f"  {u}")

# Also check the search path construction code
for m in re.finditer(r'(diy-card-templates|templateKey|assets/(?:icons|enemies)/)', content):
    start = max(0, m.start() - 80)
    end = min(len(content), m.end() + 120)
    ctx = content[start:end]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ')
    print(f"\n  Context for '{m.group(1)}':")
    print(f"    {clean}")
