"""Parse manifests and download all atlas images."""
import json, urllib.request, os

base_dir = r'C:\Users\admin\Desktop\WestwardJourney\frontend\public'

for manifest_name in ['diy-card-assets-sts2', 'diy-card-assets']:
    manifest_path = os.path.join(base_dir, manifest_name, 'manifest.json')
    out_dir = os.path.join(base_dir, manifest_name)
    os.makedirs(out_dir, exist_ok=True)
    
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    print(f"\n=== {manifest_name} ===")
    print(f"  Regions: {len(manifest.get('regions', {}))}")
    print(f"  Atlases: {manifest.get('atlases', [])}")
    print(f"  Fonts: {manifest.get('fonts', {})}")
    print(f"  TypePlaque: {manifest.get('typePlaque', 'none')}")
    
    # Show some sample region IDs to understand the naming
    regions = manifest.get('regions', {})
    sample_ids = [k for k in regions.keys()][:10]
    print(f"  Sample region IDs: {sample_ids}")
    
    # Download all atlases
    for i, atlas_url in enumerate(manifest.get('atlases', [])):
        # The URL may be relative or absolute
        if atlas_url.startswith('/'):
            full_url = f'https://slaythespire2.gg{atlas_url}'
        elif atlas_url.startswith('http'):
            full_url = atlas_url
        else:
            full_url = f'https://slaythespire2.gg/{atlas_url}'
        
        # Determine local filename
        local_name = os.path.basename(atlas_url.split('?')[0])
        if not local_name:
            local_name = f'atlas_{i}.webp'
        
        local_path = os.path.join(out_dir, local_name)
        
        print(f"  Downloading atlas {i}: {local_name} ...", end=' ', flush=True)
        try:
            req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=60)
            with open(local_path, 'wb') as f:
                f.write(resp.read())
            size = os.path.getsize(local_path)
            print(f'{size:,} bytes')
        except Exception as e:
            print(f'FAIL: {e}')
    
    # Download typePlaque
    tp = manifest.get('typePlaque')
    if tp:
        tp_url = f'https://slaythespire2.gg{tp}' if tp.startswith('/') else tp
        tp_name = os.path.basename(tp.split('?')[0])
        local_tp = os.path.join(out_dir, tp_name)
        print(f"  Downloading typePlaque: {tp_name} ...", end=' ', flush=True)
        try:
            req = urllib.request.Request(tp_url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=30)
            with open(local_tp, 'wb') as f:
                f.write(resp.read())
            print(f'{os.path.getsize(local_tp):,} bytes')
        except Exception as e:
            print(f'FAIL: {e}')
    
    # Download fonts
    fonts = manifest.get('fonts', {})
    for font_key, font_url in fonts.items():
        if font_url.startswith('/'):
            font_full = f'https://slaythespire2.gg{font_url}'
        else:
            font_full = font_url
        font_name = os.path.basename(font_url.split('?')[0])
        local_font = os.path.join(out_dir, font_name)
        print(f"  Downloading font {font_key}: {font_name} ...", end=' ', flush=True)
        try:
            req = urllib.request.Request(font_full, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=30)
            with open(local_font, 'wb') as f:
                f.write(resp.read())
            print(f'{os.path.getsize(local_font):,} bytes')
        except Exception as e:
            print(f'FAIL: {e}')
