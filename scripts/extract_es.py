"""Find the manifest/asset loading system code."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the es function (manifest loader - from output: "es=function(){...")
m = re.search(r'es=function\(\)\{', content)
if m:
    start = m.start()
    depth = 0
    i = m.end() - 1
    while i < min(len(content), start + 12000):
        c = content[i]
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                block = content[start:i+1]
                clean = block.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
                print(f"es function ({len(block):,} bytes):")
                print(clean[:4000])
                print("...")
                break
        i += 1

# Also find where images are preloaded/requested
print("\n\n=== Image preloading ===")
for m in re.finditer(r'(?:new\s+Image|\.src\s*=|preload|prefetch|fetch\(|XMLHttpRequest)', content):
    ctx = content[max(0, m.start()-80):min(len(content), m.end()+150)]
    clean = ctx.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
    print(f"\n  {m.group(0)} at {m.start()}:")
    print(f"    {clean}")
