"""Find all relative asset URLs and the template path construction."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all /assets/ URLs (relative paths)
urls = set()
for m in re.finditer(r'["\'](/assets/[^"\']+(?:png|webp|jpg|jpeg))["\']', content):
    urls.add(m.group(1))

print("=== Asset URLs found in source ===")
for u in sorted(urls):
    print(f"  {u}")

# Find template construction - look for "diy-card-templates"
print("\n=== Template path construction ===")
for m in re.finditer(r'diy-card-templates', content):
    ctx = content[max(0, m.start()-200):min(len(content), m.end()+200)]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
    print(f"  ...{clean}...")
    print()

# Also check the assets domain
for m in re.finditer(r'(img\.|assets\.|cdn\.)', content):
    start = max(0, m.start()-100)
    end = min(len(content), m.end()+100)
    ctx = content[start:end]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ')
    if any(ext in clean for ext in ['png', 'webp', 'http']):
        print(f"  Asset domain: {clean}")
