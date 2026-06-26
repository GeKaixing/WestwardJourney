"""Find the actual template URLs used by the web renderer."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the F() function that looks up backgrounds/frames/banners
# It searches by id pattern: bg_{type}_{color}, frame_{type}_{rarity}, etc.
# The actual image URLs might be constructed elsewhere

# Look for where template images are actually loaded (src = ...)
for m in re.finditer(r'\.src\s*=\s*["\']([^"\']+)["\']', content):
    url = m.group(1)
    if 'template' in url.lower() or 'frame' in url.lower() or 'card' in url.lower():
        print(f"  {url}")

# Look for the function that loads backgrounds
print("\n=== Background/frame/banner loading ===")
for m in re.finditer(r'(?:background|frame|banner)s?\s*(?::|is)\s*(?:\[|{)', content):
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 300)
    ctx = content[start:end]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ')
    print(f"\n  at {m.start()}: {clean}")
