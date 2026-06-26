"""Find the main card drawing function by following the call graph."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The main rendering is done via a render() function or callback that uses useCallback/useMemo
# Look for large function bodies that reference multiple canvas ops

# Find all function-like patterns with large bodies near canvas operations
print("=== Looking for the main draw function ===")

# The main drawing happens inside a useCallback or render function
# Find patterns like: return(...canvas...) with extensive drawing

# Let me find where the actual card composition happens
# Pattern: multiple image draws + text draws + canvas ops
for pat in [
    r'await\s+en\([^)]+\)',   # image loading
    r'\.drawImage\([^)]+\)',   # each draw call  
    r'\.fillText\([^)]+\)',    # each text call
    r'let\s+\w+\s*=\s*document\.createElement\(["\']canvas["\']\)',  # canvas creation
    r'canvas\.toBlob',          # export
]:
    matches = re.findall(pat, content)
    print(f"  {pat[:40]}: {len(matches)} matches")

# Now find the largest chunk of code that contains most canvas operations
# This is likely the main rendering function
canvas_ops = ['createElement("canvas")', 'getContext("2d")', 'drawImage(', 'fillText(', 
              'toDataURL(', 'toBlob(', 'measureText(', 'clearRect(', 
              'font =', 'textBaseline =', 'fillStyle =', 'strokeStyle =']

# Find all occurrences with positions
positions = []
for op in canvas_ops:
    idx = 0
    while True:
        idx = content.find(op, idx)
        if idx == -1: break
        positions.append(idx)
        idx += 1

positions.sort()
print(f"\nTotal canvas operations: {len(positions)}")

# Cluster - find where most operations are concentrated
if positions:
    min_pos = min(positions)
    max_pos = max(positions)
    # The main drawing is likely in a 5000-15000 byte range
    # Split into buckets of 2000 bytes
    bucket_size = 2000
    buckets = {}
    for p in positions:
        bucket = ((p - min_pos) // bucket_size) * bucket_size + min_pos
        buckets[bucket] = buckets.get(bucket, 0) + 1
    
    # Find the densest bucket
    densest = max(buckets, key=buckets.get)
    print(f"\nDensest operation cluster: offset {densest} ({buckets[densest]} ops)")
    
    # Find the first and last operation in this area
    cluster_ops = [p for p in positions if abs(p - densest) < bucket_size]
    cluster_start = min(cluster_ops) - 200
    cluster_end = max(cluster_ops) + 200
    
    print(f"Cluster range: {cluster_start} to {cluster_end}")
    
    # Extract this region
    region = content[cluster_start:cluster_end]
    # Find the nearest function boundary
    # Look for "function" before cluster_start
    pre = content[max(0, cluster_start-3000):cluster_start]
    func_matches = list(re.finditer(r'=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)\s*\{', pre))
    if func_matches:
        last_func = func_matches[-1]
        func_start = max(0, cluster_start - 3000) + last_func.start()
        # Find the matching closing brace
        # Go back to the start of the assignment
        assign_start = max(0, func_start - 50)
        while assign_start > 0 and content[assign_start] not in ';{\n':
            assign_start -= 1
        assign_start = max(0, assign_start)
        
        print(f"\nFunction likely starts at offset {assign_start}")
        print("="*60)
        print(content[assign_start:assign_start+500])
        print("...")
