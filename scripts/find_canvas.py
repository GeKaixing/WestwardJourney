"""Find card generation code in the DIY card JS chunk."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find canvas-related code
for pat_name, pattern in [
    ("createElement canvas", r'createElement\(["\']canvas["\']\)'),
    ("getContext", r'getContext\(["\']2d["\']\)'),
    ("toDataURL", r'toDataURL\([^)]+\)'),
    ("fillText", r'fillText\([^;]{0,200}'),
    ("drawImage", r'drawImage\([^;]{0,250}'),
    ("canvas.width", r'canvas\.width[^;]{0,100}'),
    ("canvas.height", r'canvas\.height[^;]{0,100}'),
]:
    matches = re.findall(pattern, content)
    if matches:
        print(f"\n=== {pat_name} ({len(matches)} matches) ===")
        for m in matches[:5]:
            clean = m.replace('\\n', ' ').replace('\\t', ' ').replace('  ', ' ')
            if len(clean) > 300:
                clean = clean[:300] + '...'
            # Show context around the match
            idx = content.index(m) if len(m) > 10 else -1
            if idx > 0:
                ctx = content[max(0,idx-50):idx+len(m)+50]
                ctx = ctx.replace('\\n', ' ').replace('  ', ' ')
                if len(ctx) > 400:
                    ctx = ctx[:400] + '...'
                print(f"  {ctx}")
            else:
                print(f"  {clean}")
            print()
