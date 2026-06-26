"""Extract and reconstruct the card generation logic from the DIY card JS chunk."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The card generation code is in module 29716 - the main page component
# Let me find key functions by looking for function signatures

# Find the main render function (drawCard or similar)
# Look for "function e" patterns with canvas operations nearby
print("=" * 60)
print("DIY CARD GENERATOR - Core Rendering Functions")
print("=" * 60)

# Find all functions containing canvas operations
func_starts = []
for m in re.finditer(r'(function\s+\w+\s*\([^)]+\))\s*\{', content):
    func_name = m.group(1)
    start = m.start()
    # Get function body (crudely by counting braces up to a point)
    depth = 0
    i = m.end() - 1
    while i < min(len(content), start + 8000):
        if content[i] == '{': depth += 1
        elif content[i] == '}': 
            depth -= 1
            if depth == 0:
                body = content[m.start():i+1]
                # Check if this function uses canvas
                if any(kw in body for kw in ['getContext', 'toDataURL', 'canvas', 'drawImage', 'fillText']):
                    func_starts.append((start, func_name, len(body), body))
                break
        i += 1

# Sort by position
func_starts.sort(key=lambda x: x[0])

print(f"\nFound {len(func_starts)} canvas-related functions:")
for _, name, size, body in func_starts:
    # Show first 200 chars of each
    clean = body[:200].replace('\\n', ' ').replace('\\t', ' ')
    print(f"\n{name} ({size:,} bytes)")
    print(f"  {clean}...")

# Now let me look at the layout constants
print("\n" + "=" * 60)
print("LAYOUT CONSTANTS & CONFIGURATION")
print("=" * 60)
for pat in [r'let J=\{[^}]+descLineHeight[^}]+}', r'let J=\{[^}]+thievingHopper[^}]+}',
            r'titleY:[\d.]+', r'costYOffset:[\d.]+', r'descCenterY:[\d.]+',
            r'descLineHeight:[\d.]+', r'canvasSize:[\d.]+']:
    matches = re.findall(pat, content)
    for m in matches:
        print(f"  {m}")
