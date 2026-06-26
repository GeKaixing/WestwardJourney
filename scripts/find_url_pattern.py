"""Find how template URLs are constructed in the JS."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Search for URL construction involving template keywords
for pat in ['template', 'background', 'frame.webp', 'banner.webp', '_background', '_frame', '_banner']:
    for m in re.finditer(pat, content):
        start = max(0, m.start() - 150)
        end = min(len(content), m.end() + 150)
        ctx = content[start:end]
        clean = ctx.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
        print(f"\n--- '{pat}' at offset {m.start()} ---")
        print(f"  {clean}")
        if len(clean) > 500:
            break
