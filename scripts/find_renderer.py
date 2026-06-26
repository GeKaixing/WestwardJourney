"""
Find the complete draw pipeline and reconstruct it in readable form.
Focus on finding: the render function that ties everything together.
"""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Strategy: find the large code block (3500+ chars) that contains the most canvas operations
# and references the draw helpers (U, ef, eo, ep, eh, ed)

helper_refs = re.findall(r'[^a-zA-Z](U|ef|eo|ep|eh|ed|en|eb)\s*\(', content)
print(f"Helper function references: {len(helper_refs)}")

# Find all code between braces that's over 3000 chars and has many helper calls
# Look for patterns like: = useCallback(async () => {
# or = useMemo(() => {
# or function draw(...)

# Find async functions
for m in re.finditer(r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\()\s*\(', content):
    name = m.group(1)
    start = m.start()
    # Find the arrow => or function body
    body_start = content.find('{', m.end())
    if body_start == -1 or body_start > start + 500:
        continue
    
    depth = 1
    i = body_start + 1
    while i < len(content) and depth > 0:
        if content[i] == '{': depth += 1
        elif content[i] == '}': depth -= 1
        i += 1
    
    body = content[start:i]
    
    # Skip small functions
    if len(body) < 2000: continue
    
    # Count canvas operations
    ops = sum(body.count(op) for op in ['getContext', 'drawImage', 'fillText', 'measureText', 
                                          'clearRect', 'createElement("canvas")', 'save()', 'restore()'])
    helpers = len(re.findall(r'(?:U|ef|eo|ep|eh|ed|en|eb)\s*\(', body))
    
    line_count = body.count('\n') + 1
    print(f"\n{name} ({len(body):,} bytes, ~{line_count} lines)")
    print(f"  Canvas ops: {ops}, Helper calls: {helpers}")
    print(f"  Starts at offset {start}")
    print(f"  First 200: {body[:200]}")

# Also search for the render call itself
print("\n\n=== Render pipeline call chain ===")
# Look for the main canvas rendering block - the one with the most draw calls
# by scanning for the area with highest density of draw operations

positions = []
for op in ['drawImage(', 'fillText(', 'fillStyle', 'font =', 'save()', 'restore()',
           'translate(', 'rotate(', 'clearRect(', 'measureText(', 'getContext(']:
    idx = 0
    while True:
        idx = content.find(op, idx)
        if idx == -1: break
        positions.append((idx, op))
        idx += 1

# Sort by position
positions.sort()

# Find the biggest gap-free zone with many draw ops
# Scan windows of 5000 chars
window = 5000
max_density = 0
max_start = 0
for i in range(0, len(content) - window, 1000):
    count = sum(1 for p, _ in positions if i <= p < i + window)
    if count > max_density:
        max_density = count
        max_start = i

print(f"\nDensest 5000-char window: offset {max_start} ({max_density} operations)")

# Extract a readable portion around this area
chunk = content[max_start:max_start+5000]
# Show the operations found
chunk_ops = [(p, op) for p, op in positions if max_start <= p < max_start + 5000]
print(f"\nOperations in this region:")
for p, op in chunk_ops[:30]:
    offset_in_chunk = p - max_start
    ctx = chunk[max(0, offset_in_chunk-40):offset_in_chunk+len(op)+60]
    ctx = ctx.replace('\\n', ' ').replace('  ', ' ').strip()
    if len(ctx) > 150: ctx = ctx[:150] + '...'
    print(f"  +{offset_in_chunk:5d}: {op:15s} ...{ctx}...")
