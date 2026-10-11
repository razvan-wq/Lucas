# Bistrița Alpină — online shop

Full handover (website, infrastructure, legal model, next steps): `HANDOVER.md`.

Prototype of a bilingual (Romanian first, English) online shop for a licensed hunting & outdoor store in Bistrița, Romania. The target production platform is Shopify (see `docs/plan.html` for the decision, its conditions and the Gomag fallback); this repo is the design and behaviour spec that a Shopify theme will be built from.

## Layout
- `site/` — the app. Plain HTML/CSS/vanilla JS, no build step, no dependencies.
  - `index.html` is a **fragment** (no doctype/head/body) because it is published as a claude.ai artifact, which adds the skeleton.
  - `js/data.js` — `STORE` config (business details marked `TODO`, shipping fees), categories, demo products, counties, demo orders.
  - `js/i18n.js` — all storefront UI strings, `ro` and `en` with identical keys. `js/info.js` — help/legal pages (drafts).
  - `js/app.js` — hash router, storefront views, cart, checkout. `js/admin.js` — owner dashboard (its own `TX` string table).
  - `css/app.css` — one token system, three palettes via `data-palette` (`ardezie` default, `brad`, `ghetar`).
  - `assets/` — SVG logo, hero, product line-art (rendered through CSS masks in the ink colour).
- `dist/bistrita-alpina-prototip.html` — single-file build; regenerate with `python3 tools/bundle.py` after any change in `site/`.
- `docs/plan.html` — platform, legal model, payments, AI photo pipeline, launch checklist.
- `tools/smoke.js` — Playwright smoke test (console errors, horizontal overflow, screenshots).

## Run and test
```
cd site && python3 -m http.server 8765      # then open http://localhost:8765/index.html
node tools/smoke.js /tmp/shots              # needs the server running and `npm i playwright`
python3 tools/bundle.py                     # rebuild the single-file version
```
Run `node --check` on edited JS files.

## Rules that must not break
- Every product has a sale mode from its category (`mode` in `CATEGORIES`): `ship`, `age18` or `licensed`. **Firearms, all ammunition and category C air guns are `licensed`**: reserve online, documents checked, pay and collect in store. They must never be shippable or payable online (Legea 295/2004; all Romanian couriers ban them). Night-vision sights, laser sights and suppressors must not be listed.
- Discounts show the lowest price of the last 30 days (`lowest30`). No fake reviews or ratings.
- Footer keeps the ANPC SAL link and the withdrawal page; no EU ODR/SOL link (closed July 2025).
- Every user-visible string goes through `t()` (storefront) or `x()` (admin) and exists in both `ro` and `en`. Romanian uses comma-below ș ț, never cedilla ş ţ.
- Code style: string templates, event delegation via `data-action`, localStorage wrapped in try/catch (the artifact sandbox may block it), no `alert/confirm/prompt`, only plain hash routes (`#p-<id>`, `#c-<cat>`, …).

## Open items
- Business details (`STORE` TODOs), real shipping fees, real catalogue and photos.
- Card processor approval (EuPlătesc / PayU / NETOPIA / BT) decides Shopify vs Gomag.
- Lawyer review of the reservation flow, terms, privacy and withdrawal flow. Product specs are demo data and partly unverified.
- Production AI pipeline (Photoroom + Claude API + EAN lookup) is simulated in `admin.js`.
