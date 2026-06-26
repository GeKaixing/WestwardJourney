"""Find template URL patterns from the DIY page's RSC data."""
import re

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_card.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract RSC strings
for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*"', html):
    start = m.end()
    i = start
    chars = []
    while i < len(html):
        if html[i] == '\\':
            if i+1 < len(html):
                n = html[i+1]
                if n == '"': chars.append('"'); i += 2; continue
                elif n == '\\': chars.append('\\'); i += 2; continue
                elif n == 'n': chars.append('\\n'); i += 2; continue
                else: chars.append(html[i]); i += 1; continue
        elif html[i] == '"':
            rest = html[i:i+5]
            if rest.startswith('"]):'): break
            if rest.startswith('"]'): break
            chars.append(html[i])
        else:
            chars.append(html[i])
        i += 1
    rsc = ''.join(chars)
    if rsc.count('/assets') > 2:
        # Find all /assets paths
        for m2 in re.finditer(r'/assets/[^"\')\s,;]+(?:png|webp|jpg|jpeg)', rsc):
            print(f"  {m2.group(0)}")
