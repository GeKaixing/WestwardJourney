"""Find where template images are loaded/manifested."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Search for where t.backgrounds / t.frames / t.banners is populated
# Look for "backgrounds" followed by image loading 
for m in re.finditer(r'backgrounds["\']?\s*[:=]\s*\[', content):
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 500)
    ctx = content[start:end]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
    print(f"--- backgrounds array at {m.start()} ---")
    print(f"  {clean}")
    print()

# Also look for id patterns like "bg_" 
for m in re.finditer(r'id["\']?\s*[:=]\s*["\']bg_', content):
    start = max(0, m.start() - 50)
    end = min(len(content), m.end() + 200)
    ctx = content[start:end]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
    print(f"--- bg_ ID at {m.start()} ---")
    print(f"  {clean}")
    print()

# Look for "manifest" or "assetManifest"
for kw in ['manifest', 'assetList', 'templates', 'imageList', 'textures']:
    for m in re.finditer(kw, content):
        start = max(0, m.start() - 80)
        end = min(len(content), m.end() + 200)
        ctx = content[start:end]
        clean = ctx.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
        if any(ext in clean for ext in ['webp', 'png', 'jpg', 'src']):
            print(f"--- '{kw}' at {m.start()} ---")
            print(f"  {clean}")
            print()
