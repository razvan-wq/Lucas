# Bistrița Alpină — project handover

Everything needed to understand and continue the Bistrița Alpină online shop. The short version for Claude Code is `CLAUDE.md`; this file explains the whole picture. The decision document with sources is `docs/plan.html` (open it in a browser).

Status on 11 Oct 2026: **working prototype**, not yet a live shop. Products, prices, orders and specs are demo data. Business details are placeholders marked `TODO`.

---

## 1. The business and the goal

- **Shop:** Bistrița Alpină — *Echipamente de vânătoare și outdoor*, a hunting and outdoor store in Bistrița (Bistrița-Năsăud county), Romania.
- **Goal:** an online shop in Romanian and English that is easy to buy from, has a proper checkout, and lets a non-technical owner add stock by taking a photo on the phone (AI edits the image and writes the listing), then manage orders and stock.
- **Reference studied:** guns.com (navigation, category filters, spec tables, trust signals). US-only parts (FFL transfers, financing, auctions) were dropped.

## 2. What the prototype does

Open `dist/bistrita-alpina-prototip.html` in a browser (works offline), or serve `site/` (see section 4).

**Storefront**
- Home: hero, categories, "how to buy a firearm online" in 3 steps, new and popular products, trust strip, brands, shop visit block.
- 8 categories: firearms, ammunition, optics, air guns, knives, clothing, footwear, accessories.
- Category pages with hunting-specific filters (calibre, action, barrel length, bullet type, magnification, membrane…), price range, in-stock toggle, sale-mode filter, sort, removable filter chips, mobile filter sheet.
- Search with suggestions; ignores diacritics and searches both languages.
- Product page: 3 gallery views (studio, detail, in the field), price with "lowest price in 30 days" on discounts, price per cartridge for ammunition, sale-mode box, stock in store, estimated delivery date, size selector, spec table, documents needed, delivery and returns, WhatsApp and contact links, related products, mobile sticky buy bar.
- **Split cart:** courier items and reservations are shown separately, with a free-delivery progress bar.
- **Checkout** (guest, no account): contact, delivery (courier, easybox locker, store pickup), a documents step for reservations (licence number and expiry, purchase-authorisation upload), payment (card, cash on delivery, bank transfer), 18+ confirmation, terms and newsletter consents, company-invoice fields (CUI), inline validation, confirmation page.
- Help and legal pages (drafts): how to buy a firearm, delivery, returns, withdrawal form, terms, privacy, contact.
- RO/EN switch, 3 colour palettes (button at bottom left), cookie banner, demo notice.

**Owner dashboard** (person icon, or `#admin`)
- **Today:** tasks, KPI tiles, big "Add product" button.
- **Add product:** photo or demo photo, then a 5-step AI pipeline (background removal, studio background and shadow, product recognition, RO+EN copy, category and specs; *simulated in the prototype*), then a review screen (before/after image, AI-filled fields marked, price/stock required), then Publish. The product goes live in the shop immediately.
- **Orders:** filters by status; reservations go *documents to check → ready to collect → collected* (or rejected); courier orders go *new → packed → shipped (AWB)*; invoice button.
- **Stock:** search, +/− per product, show/hide online, low-stock highlight.

The dashboard stores everything in the browser only (localStorage). There is no server or database yet.

## 3. The rule the whole design depends on (Romanian law)

| Product | How it sells |
|---|---|
| Firearms (category B), essential parts | **Reserve online → documents checked → pay and collect in store** |
| All ammunition | Same, only for guns listed on the buyer's permit, within the quantity on the permit |
| Air guns ≤ 220 m/s (category C) | Same; they need a police purchase authorisation |
| Knives | Ship by courier; 18+ (shop policy, no statutory age found) |
| Optics, clothing, boots, accessories | Normal checkout and courier delivery |
| Night-vision sights, laser sights, suppressors | **Do not list**; banned for private persons |

Basis (Legea 295/2004, 2014 republication; later amendments and implementing norms not read):
- The buyer needs an *autorizație de procurare* from the county police, valid 90 days and extendable once.
- The dealer (*armurier*) writes the sale onto it.
- The buyer registers the gun with the police within 3 working days.
- The ammunition limit for hunting arms is 300 per weapon per calibre.
- Fan Courier, Sameday, Cargus, DPD and GLS all ban firearms and ammunition.
- EU Directive 2021/555, Art. 8, requires a licensed dealer to check identity and authorisation before or at delivery.

**A lawyer or IPJ Bistrița-Năsăud must confirm the flow before launch.**

In code, each category has a `mode` (`ship`, `age18`, `licensed`) in `site/js/data.js`. The cart, checkout and product pages behave from that field, so a rifle can never enter the courier checkout.

Other legal points built in:
- 14-day withdrawal (OUG 34/2014), with a withdrawal form page (OUG 18/2026 requires an online withdrawal button).
- ANPC SAL link (reclamatiisal.anpc.ro); no EU ODR/SOL link, since that platform closed on 20 July 2025.
- The lowest price of the last 30 days is shown on discounts.
- Cookie consent.
- No fake reviews: product pages say no verified reviews yet.

## 4. Code and how to run it

Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies.

```
site/
  index.html        page fragment (no <html>/<head>; the claude.ai artifact publisher adds them)
  css/app.css       design tokens + 3 palettes (data-palette: ardezie, brad, ghetar), all styles
  js/data.js        STORE config, CATEGORIES (with mode + filters), PRODUCTS, COUNTIES, demo ORDERS
  js/i18n.js        storefront strings, ro + en, same keys
  js/info.js        help/legal page texts
  js/admin.js       owner dashboard (own string table TX)
  js/app.js         router, views, cart, checkout, events; exposes window.BA for admin.js
  assets/           logo-mark.svg, hero.svg, products/*.svg (line art drawn through CSS masks)
dist/bistrita-alpina-prototip.html   single-file build (everything inlined)
docs/plan.html                       decision document with sources
tools/bundle.py                      rebuilds dist/ from site/
tools/smoke.js                       Playwright smoke test
```

Run:
```
cd site && python3 -m http.server 8765        # open http://localhost:8765/index.html
python3 tools/bundle.py                       # after editing site/, rebuild the single file
npm i playwright && node tools/smoke.js /tmp/shots   # smoke test (server must be running)
```

How it works:
- **Routes** are hash tokens: `#home`, `#c-<category>`, `#search`, `#p-<product-id>`, `#checkout`, `#done`, `#info-<page>`, `#admin`, `#admin-add`, `#admin-orders`, `#admin-stock`.
- `render()` rebuilds the page from state `S`. Clicks are handled by one listener on `data-action` attributes. Focus is restored after re-render.
- Text goes through `t('key')` (storefront) or `x('key')` (admin). Add every new key in **both** `ro` and `en`. Romanian uses ș ț with a comma below, never ş ţ.
- **Business details:** edit `STORE` in `site/js/data.js` (name, CUI, Reg. Com., dealer licence, address, phone, WhatsApp, email, hours, shipping fees, free-delivery threshold).
- **Adding a demo product:** add an object to `PRODUCTS` (id, cat, sub, brand, name, img, price, stock, attrs for filters, specs as `[key, value]` pairs with a matching `s_<key>` label in i18n, desc ro/en, optional oldPrice/lowest30, variants for sizes).

Quality checks done: an automated suite ran 3,134 checks at phone and desktop sizes, in both languages, including with browser storage blocked. Also done: WCAG AA contrast in all three palettes, keyboard focus on every control, and touch targets of at least 44 px. Not tested: a real iPhone (Safari) and screen readers.

## 5. Production infrastructure (recommended)

**Platform: Shopify, Grow plan.** It is the strongest phone-based product workflow: camera, barcode scanner, background removal in the mobile media editor, and Sidekick AI descriptions (Romanian support unverified). A Romanian gun shop, armesimunitie.ro, already runs on Shopify with weapons and ammunition as pickup only.

| Piece | Choice | Notes |
|---|---|---|
| Shop platform | Shopify Grow | 279 lei/month billed annually, or 369 lei monthly; 1% fee on sales through an outside payment gateway |
| Card payments | **Undecided: ask in writing first** | Shopify Payments excludes weapons. NETOPIA lists hunting/weapon goods as not accepted. PayU Romania unverified. EuPlătesc doesn't list weapons but has no Shopify app. Ask EuPlătesc, PayU, NETOPIA and Banca Transilvania whether they accept the whole store. |
| Fallback platform | Gomag Advanced | €37/month + VAT, with EuPlătesc, e-Factura, couriers and eMAG built in. Use it if only EuPlătesc/BT accept the store and online cards are essential. |
| Without card approval | Shopify still works | Cash on delivery, bank transfer, pay in store (how armesimunitie.ro runs) |
| Invoicing + e-Factura | SmartBill app (from $17.99/month) or Oblio (official, free) | Test in the trial that invoices reach ANAF e-Factura automatically (unverified) |
| Courier labels (AWB) | Expedly (from $14.99/month: FAN, Sameday, Cargus, lockers) or Fluxsales | |
| Reservations + document upload | Shopify form app or custom theme code | App choice not made yet |
| In-store POS | Keep the existing card terminal | Shopify POS card payments likely need Shopify Payments (unverified) |
| Translation | Shopify Translate & Adapt | Romanian quality unverified |

**Turning the prototype into the real shop:** build a custom Shopify theme (Liquid) that copies this design. That means the category filters, split cart, reservation flow with document upload, sale mode by product type, and RO/EN. The prototype is the spec.

**AI photo-to-listing pipeline (production)**
1. Owner photographs the product and scans the barcode.
2. **Photoroom API** removes the background ($0.02/image) or adds an AI studio background and shadow ($0.10/image).
3. **EAN lookup** (EAN-Search.org: 5,000 lookups for €19/month) gets brand and model.
4. **Claude API** writes the RO+EN title, description, category and specs as structured output, flagging uncertain specs as "verifică".
5. Owner checks price and stock, then publishes through the Shopify Admin API.

Estimated cost per product, with 3 photos: about $0.17 + €0.004 (token counts estimated). Start with Shopify's free built-in tools first. Build the custom app (a phone web page calling Photoroom and Claude) only if Sidekick's Romanian is weak. Don't use generative image models for packshots: they can alter engravings and reticles.

**Marketing limits:**
- Google Merchant Center and Meta both prohibit firearms, ammunition and scopes/sights in shopping ads, and Meta prohibits weapon sales in its shops.
- Exclude those from feeds; advertise clothing, boots, binoculars and gear, with 18+ targeting on Meta.
- Whether binoculars and handheld thermals count as "optics" for Meta is unverified.

## 6. What is demo or unverified

- Products, prices, stock, demo orders and customer names are fictional examples. Several specs are unverified against manufacturer pages (e.g. Meindl Kansas boot height, Blaser R8 capacity).
- Shop policies shown on the site need the owner's confirmation:
  - same-working-day call-back
  - 14-day reservation hold
  - 1–3 day delivery
  - free delivery over 500 lei
  - shipping fees 24,99 / 14,99 lei
  - 18+ for knives
  - help with used guns and with sourcing models that aren't listed
- The logo was redrawn as SVG from photos of the shop sign. Use the original files if they exist.

## 7. Next steps, in order

1. **Owner:** company name, CUI, Reg. Com., address, phone, WhatsApp, email, hours, dealer licence number → `STORE` in `data.js`.
2. **Owner:** written answers from EuPlătesc, PayU, NETOPIA and BT. This decides Shopify vs Gomag.
3. **Owner:** choose a palette (recommended: *Ardezie și alamă*, slate and brass, which matches the sign) and confirm the shop policies above.
4. **Lawyer:**
   - Confirm the reservation flow.
   - Terms and privacy, including retention of permit scans.
   - The withdrawal button format (two-step confirmation? unverified).
   - The cash limit for paying for expensive guns in store (believed to be 10,000 lei/day, unverified).
5. **Shopify trial:** test Sidekick in Romanian, SmartBill e-Factura and Expedly labels.
6. **Build** the Shopify theme from this prototype; set up the reservation form; configure couriers, invoicing and payments.
7. **Load the real catalogue** with the photo workflow.
8. **Domain, SSL, Google Business Profile, analytics with consent.** Launch.
