# Curated portfolio import

`cases.json` is the reviewed mapping of real source photographs to cases. The
source directory is supplied by the owner and is not part of the repository.
The 2026-09-26 review found 286 image/design files and one PDF. It selected
153 photographs for 88 cases; 133 image/design files were excluded. The
existing Prisma `PortfolioItem`/`MediaAsset` and public Vercel Blob store remain
the source of truth for the website.

The visual standard is faithful documentary photography: retain all lettering,
logos, structure, materials and surroundings. `prepare.py` applies EXIF
orientation, resizes to at most 1800 px, gently brightens only clearly dark
frames, and encodes WebP at quality 84. It never changes a sign or generates
content. Originals are untouched. The output directory must be separate and
is ignored by Git.

```powershell
python scripts/portfolio/prepare.py --source 'C:\Users\vleko\Desktop\Сайт\site_images' --output 'scripts/audit-results/portfolio-2026-09-26/web'
node scripts/portfolio/import.mjs --dry-run
node --env-file=.env.vercel-production scripts/portfolio/import.mjs
node --env-file=.env.vercel-production scripts/portfolio/verify.mjs
```

The importer resumes Blob uploads from the ignored `upload-state.json`, then
upserts media assets and cases by their stable URLs and slugs. It preserves
unrelated cases, merges two earlier alternate-angle cases into matching new
ones, and keeps a distinct earlier computer-club sign as a published case.
Use `--force-upload` after editing any selected source photograph or processing
settings so changed WebP files replace the stored versions.
The verification script checks all curated database records, alt text, and
public image responses.
