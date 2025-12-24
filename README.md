# 5R Associates — Bilingual JSON‑Driven Static Site

A professional, bilingual (English/Kannada) static website for 5R Associates. All UI text is loaded from per‑page JSON files — no hard‑coded strings in HTML. Changes are versioned with Git and tagged releases.

## Structure
- `index.html`, `about.html`, `services.html`, `portfolio.html`, `contact.html`, `404.html`
- `assets/css/style.css`, `assets/js/contentLoader.js`
- `content/en/*.json`, `content/kn/*.json` (per‑page content)
- `data/portfolio.items.json`

## Content & i18n
- Elements use `data-i18n` and `data-i18n-attr` to map to JSON keys.
- Loader populates text from `content/<lang>/<page>.json`.
- Language toggle updates content without page reload and persists via localStorage.

## UX Highlights
- Tagline appears in the hero/page header (not in navbar).
- Services page uses vertical rectangular cards, including a separate MS/SS Fabrication card.
- Refreshed palette and modern shadows; improved “Where We Work” visibility.

## Run Locally
```powershell
cd "d:\VMB activity\AIPlayground\civil engineer(5R contractor)"
python -m http.server 8000
# Open http://localhost:8000/civil%20engineer(5R%20contractor)/index.html
```

## Deploy: GitHub Pages
1. Push to GitHub (`main` branch).
2. Settings → Pages:
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/ (root)`
3. Publish URL: `https://platformwithnb-byte.github.io/5r-associates/`

## Versioning
- Each approved change is committed and tagged: `vX.Y-YYYY.MM.DD-HH.MM.SS`.
- Latest: `v1.3` — tagline to hero, services as vertical cards, refreshed palette.
- `v1.3.1` — Added 404 page with i18n, updated docs.

## Notes
- All textual content is in JSON. Avoid editing strings directly in HTML.
- Services include Construction, Interior, Painting, MS/SS Fabrication, Renovations, Project Management.
