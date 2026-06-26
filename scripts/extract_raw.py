"""
Extract and beautify the core card rendering functions from the minified webpack bundle.
"""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all the rendering functions and their full bodies
targets = [
    # (function_name, search_pattern_to_find_it)
    ("L — Main Canvas Render Component", r"function L\(e\)\{"),
    ("U — Stroke Text Renderer", r"function U\(e,t,a,r,s\)\{"),
    ("eo — Aspect-Fit Image", r"function eo\(e,t,a,r,s,n\)\{"),
    ("ed — Draw Image Region", r"function ed\(e,t,a,r,s,n,l\)\{"),
    ("ep — Image Filter (Color Matrix)", r"function ep\(e,t,a,r,s,n,l,o,i,d,c\)\{"),
    ("eh — Color Transform", r"function eh\(e,t,a,r,s,n,l,o,i,d\)\{"),
    ("ef — Shadow Text Renderer", r"function ef\(e,t,a,r,s\)\{"),
    ("en — Async Image Loader", r"function en\(e\)\{"),
    ("eb — Measure Icon Width", r"function eb\(e,t\)\{"),
    ("Layout Constants (J)", r"let J=\{"),
    ("Card Area (K)", r"let K=\{x:50,y:86,w:498,h:380\}"),
    ("Banners (B)", r"let B=\{x:24,y:94,w:550,h:420\}"),
    ("Energy Icon Pos (H)", r"let H=\{x:-32,y:-32\}"),
    ("Star Icon Pos (V)", r"let V=\{x:239,y:424,w:122,h:74\}"),
]

print("=" * 70)
print("RAW EXTRACTED FUNCTIONS FROM MINIFIED BUNDLE")
print("=" * 70)
results = {}

for name, pattern in targets:
    m = re.search(pattern, content)
    if not m:
        print(f"\n--- {name} --- NOT FOUND")
        continue
    
    start = m.start()
    idx = m.end() - 1
    # Find the matching closing brace
    if content[idx] == '(':
        # Find closing paren first
        depth = 1
        idx += 1
        while idx < len(content) and depth > 0:
            if content[idx] == '(': depth += 1
            elif content[idx] == ')': depth -= 1
            idx += 1
        # Now look for the function body brace
    if content[idx] == '{':
        depth = 1
        body_start = idx
        idx += 1
        while idx < len(content) and depth > 0:
            if content[idx] == '{': depth += 1
            elif content[idx] == '}': depth -= 1
            idx += 1
        body = content[start:idx]
        results[name] = body
        print(f"\n--- {name} ({len(body):,} bytes) ---")
        # Show the raw first 500 chars
        print(body[:500])
        print("...")
    else:
        # Try scanning ahead for the first brace
        while idx < len(content) and content[idx] != '{':
            idx += 1
        if idx < len(content) and content[idx] == '{':
            depth = 1
            body_start = idx
            idx += 1
            while idx < len(content) and depth > 0:
                if content[idx] == '{': depth += 1
                elif content[idx] == '}': depth -= 1
                idx += 1
            body = content[start:idx]
            results[name] = body

# Save raw extracted functions
with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_raw_functions.js', 'w', encoding='utf-8') as f:
    for name, body in results.items():
        f.write(f"// === {name} ===\n")
        f.write(body + "\n\n")

print(f"\n\nSaved {len(results)} functions to data/diy_raw_functions.js")
