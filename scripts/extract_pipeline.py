"""Extract full DIY card generator source code and document the rendering pipeline."""
import re, json

with open(r'C:\Users\admin\Desktop\WestwardJourney\data\_diy_9716.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Save the full chunk
with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_generator_9716.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Now try to extract the key functions from module 29716
# Module 29716 starts where we find "29716:" and continues until the next module or end
m = re.search(r"29716:\([^)]+\)=>\{", content)
if m:
    # Find matching brace
    start = m.start()
    depth = 0
    i = m.end() - 1
    while i < len(content):
        c = content[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                module_code = content[start:i+1]
                with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_module_29716.js', 'w', encoding='utf-8') as f:
                    f.write(module_code)
                print(f"Module 29716: {len(module_code):,} bytes")
                break
        i += 1

# Also try to find the en helper (image loading)
for name, chunk_id in [("en (image loader)", 240), ("card rendering helpers", None)]:
    m2 = re.search(r"240\d+:\(e,t,a\)=>", content)
    if m2:
        start2 = m2.start()
        depth = 0
        i = m2.end() - 1
        while i < min(len(content), start2 + 5000):
            c = content[i]
            if c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    mod = content[start2:i+1]
                    with open(r'C:\Users\admin\Desktop\WestwardJourney\data\diy_module_240.js', 'w', encoding='utf-8') as f:
                        f.write(mod)
                    print(f"Module 240: {len(mod):,} bytes")
                    break
            i += 1
        break

print("\nDone. Saved chunk files.")

# Now reconstruct the rendering pipeline for documentation
print("\n" + "="*70)
print("CARD GENERATION PIPELINE RECONSTRUCTION")
print("="*70)
print("""
The DIY Card Generator works as follows:

1. ASSET LOADING
   - Fetches card frame templates (STS1 or STS2 style) from CDN assets
   - Loads energy icons, star icons, and background images
   - Uses Canvas 2D API for all rendering

2. TEMPLATE SYSTEM
   Templates are organized by:
   - game (sts1 / sts2)
   - cardType (attack / skill / power / curse / status / etc.)
   - cardColor (red / green / blue / purple / yellow / colorless)
   - cardRarity (basic / common / uncommon / rare / shop / ancient / curse / status / special)
   
   Each combination maps to:
   - background image (card art frame)
   - banner image (title bar / description box)
   - frames (border overlays)

3. CANVAS RENDERING (1024x1424 canvas -> 512x712 PNG)
   Layout constants:
   - Card art area: x=50, y=86, w=498, h=380
   - Title Y: 33, Cost Y offset: 12
   - Description: center Y=610, line height=42
   - Banners: x=24, y=94, w=550, h=420
   - Energy icon: x=-50, y=38
   - Star icon: x=239, y=424, w=122, h=74
   - Thieving Hopper mode: canvasSize=1024, cardCenter=(500,530), cardWidth=295, rot=-5deg

4. DRAW ORDER
   a) Draw background/frame image (card type + rarity based)
   b) Draw card art image (user uploaded or default)
   c) Draw banner overlays (title bar, description box)
   d) Draw energy cost (with special green color for upgraded)
   e) Draw card name (with KreonBold font)
   f) Draw description text (with line wrapping)
   g) Draw type/rarity indicators (small icons/text)

5. IMAGE PROCESSING FUNCTIONS
   - ep(): Background removal (chroma key / color matrix)
   - eh(): Image color transformation with opacity
   - eo(): Aspect-ratio-preserved image fitting
   - ef(): Text rendering with shadow
   - U(): Text rendering with stroke (outline)

6. EXPORT
   - canvas.toBlob() -> PNG download
   - Optional: "Stolen by Hopper" effect (Thieving Hopper enemy overlay)
""")

# Also check for the URL pattern of template assets
template_urls = set()
for m2 in re.finditer(r'(https://[^"]*?(?:card|template|frame|banner|background)[^"]*)', content, re.I):
    template_urls.add(m2.group(1))
print("\nTemplate asset URLs found:")
for url in sorted(template_urls)[:20]:
    print(f"  {url}")
