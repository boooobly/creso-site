"""Prepare faithful, lightweight web copies of curated portfolio photographs.

Requires Pillow. Originals are never overwritten. No content generation, object
removal, color replacement, or geometric distortion is performed.
"""

import argparse
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps, ImageStat

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True, help='Original site_images directory')
parser.add_argument('--output', type=Path, required=True, help='Separate directory for WebP versions')
args = parser.parse_args()

cases = json.loads((Path(__file__).parent / 'cases.json').read_text(encoding='utf-8'))
args.output.mkdir(parents=True, exist_ok=True)
report = []

for case in cases:
    for index, entry in enumerate(case['images'], start=1):
        source = args.source / entry['source']
        if not source.is_file():
            raise FileNotFoundError(source)
        target = args.output / f"{case['slug']}-{index:02d}.webp"
        with Image.open(source) as original:
            photo = ImageOps.exif_transpose(original)
            if photo.mode in ('RGBA', 'P'):
                photo = photo.convert('RGBA')
                canvas = Image.new('RGB', photo.size, 'white')
                canvas.paste(photo, mask=photo.getchannel('A'))
                photo = canvas
            else:
                photo = photo.convert('RGB')

            # A conservative correction only for clearly dark/light source frames.
            # Night signage retains its real illumination and surrounding darkness.
            luminance = ImageStat.Stat(photo.resize((64, 64)).convert('L')).mean[0]
            exposure = 1.0
            if luminance < 55:
                exposure = 1.06
            elif luminance > 205:
                exposure = 0.97
            if exposure != 1.0:
                photo = ImageEnhance.Brightness(photo).enhance(exposure)

            photo.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
            photo.save(target, 'WEBP', quality=84, method=6)
            report.append({
                'source': entry['source'],
                'web': target.name,
                'width': photo.width,
                'height': photo.height,
                'bytes': target.stat().st_size,
                'exposure': exposure,
            })

(args.output / 'preparation-report.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
)
print(f"Prepared {len(report)} faithful WebP copies; total {sum(row['bytes'] for row in report) / 1024 / 1024:.1f} MiB")
