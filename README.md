# Bistrița Alpină — online shop prototype

Bilingual (RO/EN) prototype for a licensed hunting & outdoor shop in Bistrița: storefront, compliant checkout (courier items vs. reserve-and-collect for firearms, ammunition and air guns), and an owner dashboard with a photo → AI → publish flow. Products, prices and orders are demo data.

- `dist/bistrita-alpina-prototip.html` — the whole prototype in one file; open it in a browser.
- `site/` — source (no build step, no dependencies). Serve it with `python3 -m http.server` from `site/` and open `index.html`.
- `docs/plan.html` — platform recommendation, legal model, payments, AI pipeline, palettes, launch checklist.
- `tools/bundle.py` — rebuilds the single-file version after editing `site/`.

Business details to fill in are marked `TODO` in `site/js/data.js` (`STORE`).
