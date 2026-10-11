/* Bistrița Alpină storefront — hash-routed single-page app, no dependencies. */
(function () {
  'use strict';
  const D = window.BA_DATA;
  const I18N = window.BA_I18N;
  const STORE = D.STORE;

  // ——— persistence (per-viewer convenience only; the page works without it)
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ba_' + k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem('ba_' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };

  const S = {
    lang: store.get('lang', 'ro'),
    palette: store.get('palette', 'ardezie'),
    cart: store.get('cart', []),
    added: store.get('added', []),
    stockEdits: store.get('stockEdits', {}),
    orders: store.get('orders', null),
    cookie: store.get('cookie', null),
    notice: store.get('notice', true),
    filters: {}, price: { min: '', max: '' }, inStock: false, sort: 'featured', query: '',
    filterCat: null, mobileFilters: false,
    co: { ship: 'courier', pay: 'card' }, coErrors: {}, lastOrder: store.get('lastOrder', null),
    pdpImg: 0, pdpSize: null, pdpQty: 1
  };
  if (!S.orders) S.orders = D.ORDERS.slice();

  // ——— helpers
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = () => S.lang;
  function t(key, vars) {
    let s = (I18N[S.lang] && I18N[S.lang][key]) ?? I18N.ro[key] ?? key;
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  const fmtNum = (n) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const fmt = (n) => fmtNum(n) + ' lei';
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const products = () => D.PRODUCTS.concat(S.added).map((p) => {
    const e = S.stockEdits[p.id];
    return e ? Object.assign({}, p, e) : p;
  }).filter((p) => p.online !== false);
  const allProducts = () => D.PRODUCTS.concat(S.added).map((p) => Object.assign({}, p, S.stockEdits[p.id] || {}));
  const byId = (id) => allProducts().find((p) => p.id === id);
  const cat = (id) => D.CATEGORIES.find((c) => c.id === id);
  const modeOf = (p) => p.mode || (cat(p.cat) || {}).mode || 'ship';
  const catName = (id) => (cat(id) ? cat(id).name[L()] : id);
  const subName = (c, sid) => { const s = (cat(c) || { subs: [] }).subs.find((x) => x.id === sid); return s ? s[L()] : sid; };
  const val = (v) => { const k = 'v_' + v; const r = t(k); return r === k ? v : r; };
  // search: both languages + sub-category, diacritic-insensitive; "luneta" also finds "lunete"
  const haystack = (p, withDesc) => { const c = cat(p.cat) || { name: {}, subs: [] }; const s = c.subs.find((x) => x.id === p.sub) || {}; return norm([p.brand, p.name, c.name.ro, c.name.en, s.ro, s.en, Object.values(p.attrs || {}).join(' '), withDesc ? (p.desc || {})[L()] : ''].join(' ')); };
  const hasWord = (hay, w) => hay.includes(w) || (w.length > 4 && hay.includes(w.replace(/[aeiou]+$/, '')));
  const matches = (hay, q) => norm(q).split(/\s+/).filter(Boolean).every((w) => hasWord(hay, w));
  const facetVal = (p, f) => (f === 'sub' ? p.sub : f === 'brand' ? p.brand : (p.attrs || {})[f]);
  const facetLabel = (c, f, v) => (f === 'sub' ? subName(c, v) : (['action', 'bulletType', 'illuminated', 'season', 'membrane', 'height', 'steel'].includes(f) ? val(v) : v));

  function icon(name, cls) {
    const P = {
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      bag: '<path d="M5.5 8h13l-1 12.5h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
      x: '<path d="M6 6l12 12M18 6 6 18"/>',
      truck: '<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
      store: '<path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M3 9h18M9.5 20v-6h5v6"/>',
      doc: '<path d="M6.5 3h7.5l4.5 4.5V21h-12z"/><path d="M14 3v4.5h4.5M9.5 12.5h5M9.5 16.5h5"/>',
      shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
      phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      pin: '<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
      check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      minus: '<path d="M5 12h14"/>',
      filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
      down: '<path d="m6 9 6 6 6-6"/>',
      right: '<path d="m9 6 6 6-6 6"/>',
      left: '<path d="m15 6-6 6 6 6"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.8"/>',
      spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
      box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
      list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
      chart: '<path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/>',
      home: '<path d="M3 11l9-7 9 7v9H3z"/><path d="M9.5 20v-5.5h5V20"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
      upload: '<path d="M12 15V4M7 9l5-5 5 5M4 20h16"/>',
      chat: '<path d="M4 5h16v11H9l-5 4z"/>',
      lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
      card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
      cash: '<rect x="2.5" y="6.5" width="19" height="11" rx="1.5"/><circle cx="12" cy="12" r="2.5"/>',
      bank: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
      locker: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M5 9h14M5 15h14M15 6h1M15 12h1M15 18h1"/>',
      alert: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
      palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="16" cy="10" r="1.3"/><path d="M12 21a2.5 2.5 0 0 1 0-5h2a3 3 0 0 0 3-3"/>',
      eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
      edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
      print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>'
    };
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  }

  function pimg(p, cls) {
    if (p.photo) return '<img class="pimg-photo ' + (cls || '') + '" src="' + p.photo + '" alt="' + esc(p.brand + ' ' + p.name) + '">';
    return '<div class="pimg ' + (cls || '') + '" role="img" aria-label="' + esc(p.brand + ' ' + p.name) + '" style="-webkit-mask-image:url(\'assets/products/' + p.img + '.svg\');mask-image:url(\'assets/products/' + p.img + '.svg\')"></div>';
  }

  // ——— cart
  const cartKey = (i) => i.id + '|' + (i.size || '');
  function saveCart() { store.set('cart', S.cart); updateCartCount(); }
  function addToCart(id, qty, size) {
    const ex = S.cart.find((i) => i.id === id && (i.size || '') === (size || ''));
    const p = byId(id); const max = p && p.stock > 0 ? p.stock : 99;
    if (ex) ex.qty = Math.min(max, ex.qty + qty); else S.cart.push({ id, qty: Math.min(max, qty), size: size || '' });
    saveCart();
  }
  function cartLines() { return S.cart.map((i) => ({ ...i, p: byId(i.id) })).filter((i) => i.p); }
  function cartTotals(method) {
    const lines = cartLines();
    const ship = lines.filter((l) => modeOf(l.p) !== 'licensed');
    const res = lines.filter((l) => modeOf(l.p) === 'licensed');
    const shipSub = ship.reduce((a, l) => a + l.p.price * l.qty, 0);
    const resSub = res.reduce((a, l) => a + l.p.price * l.qty, 0);
    let fee = 0;
    if (ship.length) {
      const m = method || 'courier';
      if (m === 'pickup' || shipSub >= STORE.freeShippingOver) fee = 0;
      else fee = m === 'locker' ? STORE.lockerFee : STORE.shippingFee;
    }
    return { lines, ship, res, shipSub, resSub, fee, payNow: shipSub + fee, count: lines.reduce((a, l) => a + l.qty, 0) };
  }
  function updateCartCount() {
    const n = cartTotals().count;
    $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  }

  // ——— layout chrome
  function header() {
    const navCats = D.CATEGORIES.map((c) => {
      const subs = c.subs.length ? '<div class="mega"><div class="mega-inner"><div class="mega-col"><a class="mega-all" href="#c-' + c.id + '">' + esc(c.name[L()]) + ' ' + icon('arrow') + '</a>' +
        c.subs.map((s) => '<a href="#c-' + c.id + '" data-action="sub" data-cat="' + c.id + '" data-sub="' + s.id + '">' + esc(s[L()]) + '</a>').join('') +
        '</div><p class="mega-blurb">' + esc(c.blurb[L()]) + '</p><div class="mega-art">' + pimg({ img: c.img, brand: '', name: c.name[L()] }) + '</div></div></div>' : '';
      return '<li class="nav-item' + (c.subs.length ? ' has-mega' : '') + '"><a href="#c-' + c.id + '">' + esc(c.name[L()]) + '</a>' + subs + '</li>';
    }).join('');
    return '' +
      (S.notice ? '<div class="demo-bar"><span>' + t('demoNotice') + '</span><button class="link-btn" data-action="hide-notice">' + t('dismiss') + '</button></div>' : '') +
      '<div class="topbar"><div class="wrap topbar-in"><span>' + icon('store') + t('topPickup') + '</span><span class="hide-sm">' + icon('truck') + t('topShip') + '</span><span class="topbar-right hide-sm">' + icon('phone') + esc(STORE.phone) + '</span></div></div>' +
      '<header class="site-header"><div class="wrap header-in">' +
        '<button class="icon-btn show-md" data-action="open-menu" aria-label="' + t('menu') + '">' + icon('menu') + '</button>' +
        '<a class="brand" href="#home" aria-label="Bistrița Alpină — ' + t('home') + '"><span class="logo-mark"></span><span class="brand-text"><b>Bistrița Alpină</b><small>' + (L() === 'ro' ? 'Vânătoare și outdoor' : 'Hunting & outdoor') + '</small></span></a>' +
        '<form class="search" role="search" data-form="search"><label class="sr" for="q">' + t('search') + '</label>' + icon('search') + '<input id="q" name="q" type="search" autocomplete="off" placeholder="' + t('searchPh') + '" value="' + esc(S.query) + '"><div class="suggest" hidden></div></form>' +
        '<div class="header-actions">' +
          '<button class="lang" data-action="lang" aria-label="Language">' + icon('globe') + '<span>' + (L() === 'ro' ? 'EN' : 'RO') + '</span></button>' +
          '<a class="icon-btn hide-sm" href="#admin" title="' + t('owner') + '" aria-label="' + t('owner') + '">' + icon('user') + '</a>' +
          '<button class="icon-btn cart-btn" data-action="open-cart" aria-label="' + t('cart') + '">' + icon('bag') + '<span class="count" data-cart-count hidden>0</span></button>' +
        '</div>' +
      '</div>' +
      '<nav class="catnav" aria-label="' + t('shopByCat') + '"><div class="wrap"><ul>' + navCats + '</ul></div></nav>' +
      '</header>';
  }

  function footer() {
    const cats = D.CATEGORIES.map((c) => '<li><a href="#c-' + c.id + '">' + esc(c.name[L()]) + '</a></li>').join('');
    return '<footer class="site-footer"><div class="wrap">' +
      '<div class="foot-grid">' +
        '<div class="foot-brand"><span class="logo-mark lg"></span><p class="foot-name">Bistrița Alpină</p><p>' + (L() === 'ro' ? 'Echipamente de vânătoare și outdoor' : 'Hunting and outdoor equipment') + '</p>' +
          '<p class="foot-contact">' + icon('pin') + esc(STORE.street) + ', ' + esc(STORE.city) + '<br>' + icon('phone') + esc(STORE.phone) + '<br>' + icon('clock') + esc(STORE.hours[L()]) + '</p></div>' +
        '<div><h4>' + t('fShop') + '</h4><ul>' + cats + '</ul></div>' +
        '<div><h4>' + t('fHelp') + '</h4><ul><li><a href="#info-arme">' + t('fBuyGuide') + '</a></li><li><a href="#info-livrare">' + t('fDelivery') + '</a></li><li><a href="#info-retur">' + t('fReturns') + '</a></li><li><a href="#info-contact">' + t('fContact') + '</a></li></ul></div>' +
        '<div><h4>' + t('fCompany') + '</h4><ul><li><a href="#info-termeni">' + t('fTerms') + '</a></li><li><a href="#info-gdpr">' + t('fPrivacy') + '</a></li><li><a href="https://anpc.ro" target="_blank" rel="noopener">' + t('fAnpc') + '</a></li><li><a href="https://reclamatiisal.anpc.ro/" target="_blank" rel="noopener">' + t('fSal') + '</a></li><li><a href="#info-retragere">' + t('fWithdraw') + '</a></li></ul></div>' +
      '</div>' +
      '<div class="foot-legal"><span>© 2026 ' + esc(STORE.legalName) + ' · CUI ' + esc(STORE.cui) + ' · ' + esc(STORE.regCom) + ' · ' + (L() === 'ro' ? 'Autorizație armurier' : 'Dealer licence') + ' ' + esc(STORE.armsLicence) + '</span>' +
        '<span class="pay-marks"><span>VISA</span><span>Mastercard</span><span>Ramburs</span></span></div>' +
      '</div></footer>';
  }

  function paletteSwitcher() {
    const pals = [['ardezie', ['#2E3438', '#8C6421', '#F2F3F0']], ['brad', ['#1E3327', '#C2410C', '#F0F2EC']], ['ghetar', ['#1B2A38', '#A4522B', '#EDF1F3']]];
    return '<div class="palette-dock" id="palette-dock"><button class="palette-toggle" data-action="toggle-palette" aria-expanded="false">' + icon('palette') + '<span>' + t('palette') + '</span></button>' +
      '<div class="palette-panel" hidden><p class="palette-title">' + t('palette') + '</p>' + pals.map(([id, c]) =>
        '<button class="pal-opt' + (S.palette === id ? ' on' : '') + '" aria-pressed="' + (S.palette === id) + '" data-action="palette" data-pal="' + id + '"><span class="sw">' + c.map((x) => '<i style="background:' + x + '"></i>').join('') + '</span>' + t('pal_' + id) + '</button>').join('') +
      '</div></div>';
  }

  function cookieBanner() {
    if (S.cookie) return '';
    return '<div class="cookie" role="dialog" aria-label="Cookies"><p>' + t('cookieText') + ' <a href="#info-gdpr">' + t('fPrivacy') + '</a></p><div class="cookie-btns"><button class="btn btn-ghost sm" data-action="cookie" data-v="essential">' + t('cookieReject') + '</button><button class="btn btn-primary sm" data-action="cookie" data-v="all">' + t('cookieAccept') + '</button></div></div>';
  }

  // ——— product card
  function priceHTML(p, big) {
    const sale = p.oldPrice && p.oldPrice > p.price;
    return '<div class="price' + (big ? ' big' : '') + '"><span class="now' + (sale ? ' sale' : '') + '">' + fmt(p.price) + '</span>' + (sale ? '<s>' + fmt(p.oldPrice) + '</s>' : '') + '</div>';
  }
  function unitHTML(p) {
    const q = p.cat === 'munitie' && p.attrs && parseInt(p.attrs.qty, 10);
    return q ? '<span class="per-unit">' + t('perUnit', { p: fmt(p.price / q) }) + '</span>' : '';
  }
  function deliveryEstimate() {
    // 1–3 working days from today; orders after 14:00 start tomorrow
    const d = new Date(); if (d.getHours() >= 14) d.setDate(d.getDate() + 1);
    const add = (n) => { const x = new Date(d); let k = 0; while (k < n) { x.setDate(x.getDate() + 1); if (x.getDay() % 6) k++; } return x; };
    const f = new Intl.DateTimeFormat(S.lang === 'ro' ? 'ro-RO' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    return f.format(add(1)) + ' – ' + f.format(add(3));
  }
  function stockHTML(p) {
    if (p.stock <= 0) return '<span class="stock out">' + t('outOfStock') + '</span>';
    if (p.stock <= 2) return '<span class="stock low">' + t('lowStock', { n: p.stock }) + '</span>';
    return '<span class="stock ok">' + t('inStock') + '</span>';
  }
  function card(p) {
    const m = modeOf(p);
    const sale = p.oldPrice && p.oldPrice > p.price;
    const badges = (sale ? ['sale'] : []).concat(p.badges || []).slice(0, 2).map((b) => '<span class="badge b-' + b + '">' + t('badge_' + b) + '</span>').join('');
    const meta = [p.attrs && p.attrs.calibre, p.attrs && p.attrs.barrel, p.attrs && p.attrs.magnification, p.attrs && p.attrs.qty ? p.attrs.qty + ' ' + t('pcs') : ''].filter(Boolean).join(' · ');
    const modeChip = m === 'licensed' ? '<span class="mode-chip lic" title="' + esc(t('mode_licensed_t')) + '">' + icon('doc') + t('licensedBadge') + '</span>' : m === 'age18' ? '<span class="mode-chip age">' + t('age18Badge') + '</span>' : '';
    return '<article class="card">' +
      '<a class="card-media" href="#p-' + p.id + '" tabindex="-1" aria-hidden="true">' + pimg(p) + (badges ? '<div class="card-badges">' + badges + '</div>' : '') + '</a>' +
      '<div class="card-body">' +
        '<div class="card-brand">' + esc(p.brand) + modeChip + '</div>' +
        '<h3 class="card-title"><a href="#p-' + p.id + '">' + esc(p.name) + '</a></h3>' +
        (meta ? '<div class="card-meta">' + esc(meta) + '</div>' : '<div class="card-meta">&nbsp;</div>') +
        '<div class="card-foot"><div>' + priceHTML(p) + unitHTML(p) + '</div>' + stockHTML(p) + '</div>' +
      '</div></article>';
  }

  // ——— views
  function viewHome() {
    const ps = products();
    const newIn = ps.filter((p) => (p.badges || []).includes('new')).concat(ps.filter((p) => !(p.badges || []).includes('new'))).slice(0, 8);
    const best = ps.filter((p) => (p.badges || []).includes('bestseller')).slice(0, 4);
    const counts = (cid) => ps.filter((p) => p.cat === cid).length;
    const brands = ['Blaser', 'Sauer', 'Tikka', 'Beretta', 'Browning', 'Benelli', 'CZ', 'Swarovski Optik', 'Zeiss', 'Meopta', 'Leica', 'Pulsar', 'RWS', 'Norma', 'Härkila', 'Meindl'];
    return '' +
      '<section class="hero"><div class="hero-art" data-hero></div><div class="wrap hero-in">' +
        '<p class="eyebrow">' + t('heroEyebrow') + '</p>' +
        '<h1>' + t('heroTitle') + '</h1>' +
        '<p class="lead">' + t('heroLead') + '</p>' +
        '<div class="hero-ctas"><a class="btn btn-primary" href="#c-arme">' + t('heroCta1') + icon('arrow') + '</a><a class="btn btn-light" href="#c-optica">' + t('heroCta2') + '</a></div>' +
        '<ul class="hero-facts"><li>' + icon('store') + t('topPickup') + '</li><li>' + icon('shield') + t('trust1t') + '</li><li>' + icon('truck') + t('trust2t') + '</li></ul>' +
      '</div></section>' +

      '<section class="wrap section"><div class="section-head"><h2>' + t('shopByCat') + '</h2></div><div class="cat-grid">' +
        D.CATEGORIES.map((c) => '<a class="cat-tile" href="#c-' + c.id + '"><div class="cat-art">' + pimg({ img: c.img, brand: '', name: c.name[L()] }) + '</div><div class="cat-txt"><h3>' + esc(c.name[L()]) + '</h3><span>' + counts(c.id) + ' ' + (counts(c.id) === 1 ? t('product') : t('products')) + '</span></div>' + (c.mode === 'licensed' ? '<span class="mode-chip lic">' + icon('doc') + t('licensedBadge') + '</span>' : '') + '</a>').join('') +
      '</div></section>' +

      '<section class="how"><div class="wrap how-in"><div class="how-head"><h2>' + t('howTitle') + '</h2><p>' + t('howLead') + '</p><a class="text-link" href="#info-arme">' + t('howMore') + icon('arrow') + '</a></div>' +
        '<ol class="steps">' + [1, 2, 3].map((n) => '<li><span class="step-n">' + n + '</span><div><h3>' + t('how' + n + 't') + '</h3><p>' + t('how' + n + 'd') + '</p></div></li>').join('') + '</ol>' +
      '</div></section>' +

      '<section class="wrap section"><div class="section-head"><h2>' + t('newIn') + '</h2><a class="text-link" href="#search" data-action="all">' + t('viewAll') + icon('arrow') + '</a></div><div class="grid">' + newIn.map(card).join('') + '</div></section>' +

      '<section class="wrap section"><div class="section-head"><h2>' + t('bestsellers') + '</h2></div><div class="grid">' + best.map(card).join('') + '</div></section>' +

      '<section class="trust"><div class="wrap trust-grid">' + [['shield', 1], ['truck', 2], ['box', 3], ['chat', 4]].map(([ic, n]) => '<div class="trust-item">' + icon(ic) + '<div><h3>' + t('trust' + n + 't') + '</h3><p>' + t('trust' + n + 'd') + '</p></div></div>').join('') + '</div></section>' +

      '<section class="wrap section brands"><h2 class="sr">' + t('brandsTitle') + '</h2><p class="eyebrow center">' + t('brandsTitle') + '</p><ul class="brand-row">' + brands.map((b) => '<li>' + esc(b) + '</li>').join('') + '</ul></section>' +

      visitBlock();
  }

  function visitBlock() {
    return '<section class="visit"><div class="wrap visit-in"><div class="visit-txt"><h2>' + t('visitTitle') + '</h2><p class="lead">' + t('visitLead') + '</p>' +
      '<dl class="visit-dl"><div><dt>' + icon('pin') + t('address') + '</dt><dd>' + esc(STORE.street) + ', ' + esc(STORE.city) + ', ' + esc(STORE.county) + '</dd></div>' +
      '<div><dt>' + icon('clock') + t('hours') + '</dt><dd>' + esc(STORE.hours[L()]) + '</dd></div>' +
      '<div><dt>' + icon('phone') + t('phone') + '</dt><dd><span class="sel">' + esc(STORE.phone) + '</span> <button class="link-btn" data-action="copy" data-v="' + esc(STORE.phone) + '">' + t('copy') + '</button></dd></div>' +
      '<div><dt>' + icon('chat') + t('email') + '</dt><dd><span class="sel">' + esc(STORE.email) + '</span></dd></div></dl>' +
      '<a class="btn btn-outline" href="' + STORE.mapsUrl + '" target="_blank" rel="noopener">' + icon('pin') + t('openMaps') + '</a></div>' +
      '<div class="visit-art"><div class="sign"><span class="logo-mark xl"></span><p class="sign-name">Bistrița Alpină</p><p class="sign-tag">Echipamente de vânătoare și outdoor</p></div></div>' +
      '</div></section>';
  }

  // listing
  function filteredList(base, c) {
    let list = base;
    for (const f in S.filters) {
      if (f === '_mode') continue;
      const set = S.filters[f];
      if (set && set.size) list = list.filter((p) => set.has(facetVal(p, f)));
    }
    const mn = parseFloat(S.price.min), mx = parseFloat(S.price.max);
    if (!isNaN(mn)) list = list.filter((p) => p.price >= mn);
    if (!isNaN(mx)) list = list.filter((p) => p.price <= mx);
    if (S.inStock) list = list.filter((p) => p.stock > 0);
    if (S.filters._mode && S.filters._mode.size) list = list.filter((p) => S.filters._mode.has(modeOf(p) === 'licensed' ? 'licensed' : 'ship'));
    const sorted = list.slice();
    if (S.sort === 'asc') sorted.sort((a, b) => a.price - b.price);
    else if (S.sort === 'desc') sorted.sort((a, b) => b.price - a.price);
    else if (S.sort === 'new') sorted.sort((a, b) => ((b.badges || []).includes('new') ? 1 : 0) - ((a.badges || []).includes('new') ? 1 : 0));
    return sorted;
  }

  function facetsHTML(base, c, facets) {
    const groups = facets.map((f) => {
      const vals = {};
      base.forEach((p) => { const v = facetVal(p, f); if (v) vals[v] = (vals[v] || 0) + 1; });
      const keys = Object.keys(vals).sort((a, b) => a.localeCompare(b, 'ro', { numeric: true }));
      if (keys.length < 2 && !(S.filters[f] && S.filters[f].size)) return '';
      const set = S.filters[f] || new Set();
      return '<fieldset class="facet"><legend>' + t('facet_' + f) + '</legend>' + keys.map((v) =>
        '<label class="check"><input type="checkbox" data-facet="' + f + '" value="' + esc(v) + '"' + (set.has(v) ? ' checked' : '') + '><span>' + esc(facetLabel(c, f, v)) + '</span><em>' + vals[v] + '</em></label>').join('') + '</fieldset>';
    }).join('');
    const hasLic = base.some((p) => modeOf(p) === 'licensed'), hasShip = base.some((p) => modeOf(p) !== 'licensed');
    const ms = S.filters._mode || new Set();
    const modeGroup = hasLic && hasShip ? '<fieldset class="facet"><legend>' + t('fulfilment') + '</legend>' + ['ship', 'licensed'].map((m) =>
      '<label class="check"><input type="checkbox" data-facet="_mode" value="' + m + '"' + (ms.has(m) ? ' checked' : '') + '><span>' + t('f_' + m) + '</span></label>').join('') + '</fieldset>' : '';
    return '<fieldset class="facet"><legend>' + t('price') + '</legend><div class="price-range"><label><span class="sr">' + t('min') + '</span><input id="pmin" type="number" inputmode="numeric" min="0" placeholder="' + t('min') + '" value="' + esc(S.price.min) + '" data-price="min"></label><span>–</span><label><span class="sr">' + t('max') + '</span><input id="pmax" type="number" inputmode="numeric" min="0" placeholder="' + t('max') + '" value="' + esc(S.price.max) + '" data-price="max"></label><span class="unit">lei</span></div></fieldset>' +
      '<label class="toggle"><input type="checkbox" id="instock" data-instock' + (S.inStock ? ' checked' : '') + '><span class="tg"></span>' + t('inStockOnly') + '</label>' +
      modeGroup + groups;
  }

  function activeChips(c) {
    const chips = [];
    for (const f in S.filters) (S.filters[f] || new Set()).forEach((v) => chips.push('<button class="chip" data-action="unfacet" data-f="' + f + '" data-v="' + esc(v) + '">' + esc(f === '_mode' ? t('f_' + v) : facetLabel(c, f, v)) + icon('x') + '</button>'));
    if (S.price.min || S.price.max) chips.push('<button class="chip" data-action="unprice">' + esc((S.price.min || '0') + ' – ' + (S.price.max || '∞')) + ' lei' + icon('x') + '</button>');
    if (S.inStock) chips.push('<button class="chip" data-action="uninstock">' + t('inStockOnly') + icon('x') + '</button>');
    return chips.length ? '<div class="chips">' + chips.join('') + '<button class="link-btn" data-action="clear-filters">' + t('clearAll') + '</button></div>' : '';
  }

  function viewListing(cid) {
    const c = cid ? cat(cid) : null;
    if (S.filterCat !== (cid || 'search:' + S.query)) { S.filters = {}; S.price = { min: '', max: '' }; S.inStock = false; S.filterCat = cid || 'search:' + S.query; if (S.pendingSub) { S.filters.sub = new Set([S.pendingSub]); S.pendingSub = null; } }
    let base;
    if (c) base = products().filter((p) => p.cat === c.id);
    else if (S.query) {
      base = products().filter((p) => matches(haystack(p, true), S.query));
    } else base = products();
    const facets = c ? c.facets : ['brand'];
    const list = filteredList(base, c);
    const title = c ? c.name[L()] : S.query ? t('resultsFor', { q: esc(S.query) }) : t('allProducts');
    const sortSel = '<label class="sort"><span>' + t('sort') + '</span><select id="sort" data-sort>' + [['featured', 'sortFeatured'], ['asc', 'sortPriceAsc'], ['desc', 'sortPriceDesc'], ['new', 'sortNew']].map(([v, k]) => '<option value="' + v + '"' + (S.sort === v ? ' selected' : '') + '>' + t(k) + '</option>').join('') + '</select></label>';
    return '<div class="wrap page">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="#home">' + t('home') + '</a>' + icon('right') + '<span>' + title + '</span></nav>' +
      '<div class="list-head"><div><h1>' + title + '</h1>' + (c ? '<p class="muted">' + esc(c.blurb[L()]) + '</p>' : '') + '</div>' +
        (c && c.mode === 'licensed' ? '<div class="lic-note">' + icon('doc') + '<p>' + t('mode_licensed_d') + ' <a href="#info-arme">' + t('howMore') + '</a></p></div>' : '') + '</div>' +
      (c && c.subs.length ? '<div class="sub-pills">' + c.subs.map((s) => { const on = S.filters.sub && S.filters.sub.has(s.id); return '<button class="pill' + (on ? ' on' : '') + '" aria-pressed="' + !!on + '" data-action="facet-pill" data-f="sub" data-v="' + s.id + '">' + esc(s[L()]) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="list-layout">' +
        '<aside class="filters' + (S.mobileFilters ? ' open' : '') + '" aria-label="' + t('filters') + '"><div class="filters-head"><h2>' + t('filters') + '</h2><button class="icon-btn show-md" data-action="close-filters" aria-label="' + t('dismiss') + '">' + icon('x') + '</button></div><div class="filters-body">' + facetsHTML(base, c && c.id, facets) + '</div><div class="filters-foot show-md"><button class="btn btn-primary block" data-action="close-filters">' + t('showResults', { n: list.length }) + '</button></div></aside>' +
        '<div class="list-main"><div class="toolbar"><button class="btn btn-outline sm show-md" data-action="open-filters">' + icon('filter') + t('filters') + '</button><span class="muted count-txt">' + list.length + ' ' + (list.length === 1 ? t('product') : t('products')) + '</span>' + sortSel + '</div>' +
          activeChips(c && c.id) +
          (list.length ? '<div class="grid">' + list.map(card).join('') + '</div>' : '<div class="empty"><p><b>' + t('noResults') + '</b></p><p class="muted">' + t('noResultsHint') + '</p><button class="btn btn-outline" data-action="clear-filters">' + t('clearAll') + '</button></div>') +
        '</div>' +
      '</div></div>';
  }

  // product page
  function viewProduct(id) {
    const p = byId(id);
    if (!p) return '<div class="wrap page empty"><h1>404</h1><p><a href="#home">' + t('backToShop') + '</a></p></div>';
    const c = cat(p.cat);
    const m = modeOf(p);
    if (S.pdpFor !== id) { S.pdpFor = id; S.pdpImg = 0; S.pdpSize = null; S.pdpQty = 1; }
    const views = [['studio', t('studioHint')], ['zoom', t('zoomHint')], ['scene', t('sceneHint')]];
    const gallery = '<div class="gallery"><div class="g-main v-' + views[S.pdpImg][0] + '">' + (views[S.pdpImg][0] === 'scene' ? '<div class="g-scene" data-hero></div>' : '') + pimg(p) +
      '<div class="card-badges">' + ((p.oldPrice && p.oldPrice > p.price) ? '<span class="badge b-sale">' + t('badge_sale') + '</span>' : '') + (p.badges || []).map((b) => '<span class="badge b-' + b + '">' + t('badge_' + b) + '</span>').join('') + '</div></div>' +
      '<div class="g-thumbs" role="tablist">' + views.map((v, i) => '<button role="tab" aria-selected="' + (i === S.pdpImg) + '" class="g-thumb v-' + v[0] + (i === S.pdpImg ? ' on' : '') + '" data-action="pdp-img" data-i="' + i + '" aria-label="' + v[1] + '">' + pimg(p) + '<span>' + v[1] + '</span></button>').join('') + '</div></div>';
    const modeBox = '<div class="mode-box m-' + m + '">' + icon(m === 'licensed' ? 'doc' : m === 'age18' ? 'shield' : 'truck') + '<div><b>' + t('mode_' + m + '_t') + '</b><p>' + t('mode_' + m + '_d') + '</p></div></div>';
    const sizes = p.variants ? '<div class="field"><span class="label">' + t('size') + (S.pdpSize ? ': <b>' + esc(S.pdpSize) + '</b>' : '') + '</span><div class="sizes" role="radiogroup" aria-label="' + t('size') + '">' + p.variants.map((v) => '<button role="radio" aria-checked="' + (S.pdpSize === v) + '" class="size' + (S.pdpSize === v ? ' on' : '') + '" data-action="size" data-v="' + esc(v) + '">' + esc(v) + '</button>').join('') + '</div><p class="err" id="size-err" hidden>' + t('chooseSize') + '</p></div>' : '';
    const buy = p.stock > 0
      ? '<div class="buy-row"><div class="qty" role="group" aria-label="' + t('qty') + '"><button data-action="qty" data-d="-1" aria-label="-">' + icon('minus') + '</button><input id="pdp-qty" type="number" min="1" max="' + p.stock + '" value="' + S.pdpQty + '" inputmode="numeric" aria-label="' + t('qty') + '"><button data-action="qty" data-d="1" aria-label="+">' + icon('plus') + '</button></div>' +
        '<button class="btn btn-primary grow" data-action="pdp-add" data-id="' + p.id + '">' + icon(m === 'licensed' ? 'doc' : 'bag') + (m === 'licensed' ? t('reserve') : t('addToCart')) + '</button></div>'
      : '<form class="notify" data-form="notify"><label class="sr" for="notify-email">' + t('emailL') + '</label><input id="notify-email" type="email" required placeholder="' + t('emailL') + '"><button class="btn btn-outline">' + t('notifyMe') + '</button></form>';
    const specLabel = (k) => { const r = t('s_' + k); return r === 's_' + k ? esc(k) : r; };
    const specRows = (p.specs || []).map(([k, v]) => { if (k === '_raw') { const i = String(v).indexOf(': '); k = String(v).slice(0, i); v = String(v).slice(i + 2); } return '<tr><th>' + specLabel(k) + '</th><td>' + esc(val(v)) + '</td></tr>'; }).join('');
    const related = products().filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const sale = p.oldPrice && p.oldPrice > p.price;
    return '<div class="wrap page pdp">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="#home">' + t('home') + '</a>' + icon('right') + '<a href="#c-' + c.id + '">' + esc(c.name[L()]) + '</a>' + (p.sub ? icon('right') + '<span>' + esc(subName(c.id, p.sub)) + '</span>' : '') + '</nav>' +
      '<div class="pdp-grid">' + gallery +
        '<div class="pdp-info">' +
          '<p class="pdp-brand">' + esc(p.brand) + '</p><h1>' + esc(p.name) + '</h1>' +
          '<p class="pdp-sku">' + t('sku') + ' <span>' + esc(p.id.toUpperCase().slice(0, 18)) + '</span>' + (p.attrs && p.attrs.calibre ? ' · ' + esc(p.attrs.calibre) : '') + '</p>' +
          priceHTML(p, true) + '<p class="vat">' + t('vat') + (unitHTML(p) ? ' · ' + unitHTML(p) : '') + '</p>' +
          (sale && p.lowest30 ? '<p class="omnibus">' + t('lowest30', { p: fmt(p.lowest30) }) + '</p>' : '') +
          modeBox + (p.cat === 'munitie' ? '<p class="note">' + icon('alert') + t('ammoNote') + '</p>' : '') + sizes +
          '<div class="stock-line">' + stockHTML(p) + (p.stock > 0 ? '<span class="muted">' + icon('store') + t('inStore') + ': ' + p.stock + ' ' + t('pcs') + '</span>' : '') + (p.stock > 0 && m !== 'licensed' ? '<span class="muted">' + icon('truck') + t('deliveryEst', { d: deliveryEstimate() }) + '</span>' : '') + '</div>' +
          buy +
          '<div class="ask-row"><a class="ask" href="https://wa.me/' + STORE.whatsapp + '?text=' + encodeURIComponent(p.brand + ' ' + p.name) + '" target="_blank" rel="noopener">' + icon('chat') + t('whatsapp') + '</a><a class="ask" href="#info-contact">' + icon('phone') + t('askArmourer') + '</a></div>' +
          '<div class="acc">' +
            '<details open><summary>' + t('description') + icon('down') + '</summary><div class="acc-body"><p>' + esc((p.desc || {})[L()] || '') + '</p></div></details>' +
            (specRows ? '<details open><summary>' + t('specs') + icon('down') + '</summary><div class="acc-body"><table class="specs">' + specRows + '</table></div></details>' : '') +
            (m === 'licensed' ? '<details><summary>' + t('docsNeeded') + icon('down') + '</summary><div class="acc-body"><ul class="ticks">' + t('docsList') + '</ul><a class="text-link" href="#info-arme">' + t('howMore') + icon('arrow') + '</a></div></details>' : '') +
            '<details><summary>' + t('delivery') + icon('down') + '</summary><div class="acc-body"><p>' + (m === 'licensed' ? t('deliveryTextLicensed') : t('deliveryText', { free: fmt(STORE.freeShippingOver) })) + '</p></div></details>' +
            '<details><summary>' + t('reviews') + icon('down') + '</summary><div class="acc-body"><p class="muted">' + t('noReviews') + '</p></div></details>' +
          '</div>' +
        '</div>' +
      '</div>' +
      (related.length ? '<section class="section"><div class="section-head"><h2>' + t('related') + '</h2></div><div class="grid">' + related.map(card).join('') + '</div></section>' : '') +
      (p.stock > 0 ? '<div class="sticky-buy show-sm"><div>' + priceHTML(p) + '</div><button class="btn btn-primary" data-action="pdp-add" data-id="' + p.id + '">' + (m === 'licensed' ? t('reserve') : t('addToCart')) + '</button></div>' : '') +
      '</div>';
  }

  // cart drawer
  function cartLineHTML(l) {
    return '<li class="cl"><a href="#p-' + l.p.id + '" class="cl-img" data-action="close-cart-nav" tabindex="-1" aria-hidden="true">' + pimg(l.p) + '</a><div class="cl-info"><a href="#p-' + l.p.id + '" class="cl-name" data-action="close-cart-nav"><b>' + esc(l.p.brand) + '</b> ' + esc(l.p.name) + '</a>' + (l.size ? '<span class="muted">' + t('size') + ': ' + esc(l.size) + '</span>' : '') +
      '<div class="cl-row"><div class="qty sm"><button data-action="cart-qty" data-k="' + esc(cartKey(l)) + '" data-d="-1" aria-label="-">' + icon('minus') + '</button><span>' + l.qty + '</span><button data-action="cart-qty" data-k="' + esc(cartKey(l)) + '" data-d="1" aria-label="+">' + icon('plus') + '</button></div><span class="cl-price">' + fmt(l.p.price * l.qty) + '</span></div>' +
      '<button class="link-btn sm" data-action="cart-remove" data-k="' + esc(cartKey(l)) + '">' + t('remove') + '</button></div></li>';
  }
  function cartDrawer() {
    const T = cartTotals();
    let body;
    if (!T.lines.length) {
      body = '<div class="cart-empty">' + icon('bag', 'xl') + '<p><b>' + t('cartEmpty') + '</b></p><p class="muted">' + t('cartEmptyHint') + '</p><div class="pill-wrap">' + D.CATEGORIES.slice(0, 6).map((c) => '<a class="pill" href="#c-' + c.id + '" data-action="close-cart-nav">' + esc(c.name[L()]) + '</a>').join('') + '</div></div>';
    } else {
      const left = Math.max(0, STORE.freeShippingOver - T.shipSub);
      const pct = Math.min(100, (T.shipSub / STORE.freeShippingOver) * 100);
      body = (T.ship.length ? '<div class="free-bar"><p>' + (left > 0 ? t('toFree', { p: '<b>' + fmt(left) + '</b>' }) : icon('check') + t('freeReached')) + '</p><div class="bar"><i style="width:' + pct + '%"></i></div></div>' : '') +
        (T.ship.length ? '<h3 class="cart-group">' + icon('truck') + t('groupShip') + '</h3><ul class="cl-list">' + T.ship.map(cartLineHTML).join('') + '</ul>' : '') +
        (T.res.length ? '<h3 class="cart-group">' + icon('doc') + t('groupReserve') + '</h3><p class="note">' + t('reserveNote') + '</p><ul class="cl-list">' + T.res.map(cartLineHTML).join('') + '</ul>' : '');
    }
    const foot = T.lines.length ? '<div class="cart-foot">' +
      (T.ship.length ? '<div class="sum-row"><span>' + t('subtotal') + '</span><b>' + fmt(T.shipSub) + '</b></div><div class="sum-row muted"><span>' + t('shipping') + '</span><span>' + (T.shipSub >= STORE.freeShippingOver ? t('free') : t('calcAtCheckout')) + '</span></div>' : '') +
      (T.res.length ? '<div class="sum-row"><span>' + t('payInStore') + '</span><b>' + fmt(T.resSub) + '</b></div>' : '') +
      '<a class="btn btn-primary block" href="#checkout" data-action="close-cart-nav">' + icon('lock') + t('checkout') + '</a><button class="link-btn center" data-action="close-cart">' + t('continueShopping') + '</button></div>' : '';
    return '<div class="drawer-scrim" data-action="close-cart"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="' + t('yourCart') + '"><div class="drawer-head"><h2>' + t('yourCart') + (T.count ? ' <span class="muted">(' + T.count + ')</span>' : '') + '</h2><button class="icon-btn" data-action="close-cart" aria-label="' + t('dismiss') + '">' + icon('x') + '</button></div><div class="drawer-body">' + body + '</div>' + foot + '</aside>';
  }

  // checkout
  function field(id, label, opts) {
    opts = opts || {};
    const v = S.co[id] == null ? '' : S.co[id];
    const err = S.coErrors[id];
    const input = opts.type === 'select'
      ? '<select id="co-' + id + '" data-co="' + id + '"' + (err ? ' aria-invalid="true" aria-describedby="e-' + id + '"' : '') + '><option value="">' + esc(opts.placeholder || '') + '</option>' + opts.options.map((o) => '<option' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>'
      : '<input id="co-' + id + '" data-co="' + id + '" type="' + (opts.type || 'text') + '"' + (opts.ac ? ' autocomplete="' + opts.ac + '"' : '') + (opts.im ? ' inputmode="' + opts.im + '"' : '') + ' value="' + esc(v) + '"' + (err ? ' aria-invalid="true" aria-describedby="e-' + id + '"' : '') + '>';
    return '<div class="field' + (opts.wide ? ' wide' : '') + (err ? ' has-err' : '') + '"><label for="co-' + id + '">' + label + (opts.optional ? '' : '') + '</label>' + input + (opts.hint && !err ? '<p class="hint">' + opts.hint + '</p>' : '') + (err ? '<p class="err" id="e-' + id + '">' + icon('alert') + t(err) + '</p>' : '') + '</div>';
  }
  function radioCard(name, value, title, desc, ic, extra) {
    const on = S.co[name] === value;
    return '<label class="rcard' + (on ? ' on' : '') + '"><input type="radio" name="' + name + '" value="' + value + '" data-co-radio="' + name + '"' + (on ? ' checked' : '') + '>' + icon(ic) + '<span class="rc-txt"><b>' + title + '</b><small>' + desc + '</small></span>' + (extra ? '<span class="rc-extra">' + extra + '</span>' : '') + '</label>';
  }
  function checkbox(id, html) {
    const err = S.coErrors[id];
    return '<label class="check big' + (err ? ' has-err' : '') + '"><input type="checkbox" id="co-' + id + '" data-co-check="' + id + '"' + (S.co[id] ? ' checked' : '') + (err ? ' aria-invalid="true" aria-describedby="e-' + id + '"' : '') + '><span>' + html + '</span></label>' + (err ? '<p class="err" id="e-' + id + '">' + icon('alert') + t(err) + '</p>' : '');
  }
  function viewCheckout() {
    const T = cartTotals(S.co.ship);
    if (!T.lines.length) return '<div class="wrap page"><div class="empty">' + icon('bag', 'xl') + '<h1>' + t('cartEmpty') + '</h1><a class="btn btn-primary" href="#home">' + t('backToShop') + '</a></div></div>';
    const hasShip = T.ship.length > 0, hasRes = T.res.length > 0;
    const needAge = T.lines.some((l) => modeOf(l.p) === 'age18');
    let n = 0;
    const step = (title, body) => '<section class="co-step"><h2><span class="step-n">' + (++n) + '</span>' + title + '</h2>' + body + '</section>';
    const contact = step(t('stepContact'), '<div class="form-grid">' +
      field('first', t('firstName'), { ac: 'given-name' }) + field('last', t('lastName'), { ac: 'family-name' }) +
      field('email', t('emailL'), { type: 'email', ac: 'email', im: 'email' }) + field('phone', t('phoneL'), { type: 'tel', ac: 'tel', im: 'tel', hint: t('phoneHint') }) +
      '</div>' + '<label class="check"><input type="checkbox" data-co-check="company"' + (S.co.company ? ' checked' : '') + '><span>' + t('company') + '</span></label>' +
      (S.co.company ? '<div class="form-grid">' + field('companyName', t('companyName'), { ac: 'organization' }) + field('cui', t('cuiL')) + '</div>' : ''));
    const lockerFeeTxt = T.shipSub >= STORE.freeShippingOver ? t('free') : fmt(STORE.lockerFee);
    const courierFeeTxt = T.shipSub >= STORE.freeShippingOver ? t('free') : fmt(STORE.shippingFee);
    const delivery = hasShip ? step(t('stepDelivery'), '<div class="rcards">' +
      radioCard('ship', 'courier', t('courierHome'), t('courierHomeD'), 'truck', courierFeeTxt) +
      radioCard('ship', 'locker', t('locker'), t('lockerD'), 'locker', lockerFeeTxt) +
      radioCard('ship', 'pickup', t('pickup'), t('pickupD'), 'store', t('free')) + '</div>' +
      (S.co.ship === 'courier' ? '<div class="form-grid">' + field('county', t('county'), { type: 'select', options: D.COUNTIES, placeholder: t('chooseCounty') }) + field('city', t('city'), { ac: 'address-level2' }) + field('street', t('street'), { ac: 'street-address', wide: true }) + field('zip', t('zip'), { ac: 'postal-code', im: 'numeric' }) + '</div>' : '') +
      (S.co.ship === 'locker' ? '<div class="locker-pick">' + icon('locker') + '<div><b>' + t('lockerPick') + '</b><p class="muted">' + t('lockerPickD') + '</p></div></div>' : '') +
      (S.co.ship === 'pickup' ? '<div class="locker-pick">' + icon('pin') + '<div><b>' + esc(STORE.street) + ', ' + esc(STORE.city) + '</b><p class="muted">' + esc(STORE.hours[L()]) + '</p></div></div>' : '')) : '';
    const docs = hasRes ? step(t('stepDocs'), '<p class="note">' + icon('doc') + t('docsIntro') + '</p><div class="form-grid">' +
      field('permit', t('permitNo')) + field('permitExp', t('permitExp'), { type: 'date' }) +
      '<div class="field wide' + (S.coErrors.authFile ? ' has-err' : '') + '"><span class="label">' + t('authUpload') + '</span><label class="file"><input type="file" id="co-authFile" accept="image/*,application/pdf" data-co-file="authFile" aria-label="' + esc(t('authUpload')) + '"' + (S.coErrors.authFile ? ' aria-invalid="true" aria-describedby="e-authFile"' : '') + '>' + icon('upload') + '<span>' + (S.co.authFile ? esc(S.co.authFile) : t('chooseFile')) + '</span></label><p class="hint">' + t('authUploadHint') + '</p>' + (S.coErrors.authFile ? '<p class="err" id="e-authFile">' + icon('alert') + t(S.coErrors.authFile) + '</p>' : '') + '</div>' +
      '</div>' + checkbox('docsOk', t('docsConsent'))) : '';
    const payment = step(t('stepPayment'), (hasShip ? '<div class="rcards">' +
      radioCard('pay', 'card', t('payCard'), t('payCardD'), 'card') +
      radioCard('pay', 'cod', t('payCod'), t('payCodD'), 'cash') +
      radioCard('pay', 'op', t('payOp'), t('payOpD'), 'bank') + '</div>' : '') +
      (hasRes ? '<p class="note">' + icon('store') + t('payReserveInfo') + '</p>' : '') +
      '<div class="consents">' + (needAge ? checkbox('age', t('age18')) : '') + checkbox('terms', t('terms')) +
      '<label class="check"><input type="checkbox" data-co-check="news"' + (S.co.news ? ' checked' : '') + '><span>' + t('newsletter') + '</span></label></div>');
    const btnLabel = hasShip && hasRes ? t('placeBoth') : hasRes ? t('placeReserve') : t('placeOrder');
    const summary = '<aside class="co-summary"><div class="co-sum-in"><div class="co-sum-head"><h2>' + t('orderSummary') + '</h2><button class="link-btn" data-action="open-cart">' + t('edit') + '</button></div>' +
      (hasShip ? '<p class="cart-group">' + icon('truck') + t('groupShip') + '</p><ul class="sum-lines">' + T.ship.map((l) => '<li><div class="sl-img">' + pimg(l.p) + '<span>' + l.qty + '</span></div><span class="sl-name">' + esc(l.p.brand + ' ' + l.p.name) + (l.size ? ' · ' + esc(l.size) : '') + '</span><b>' + fmt(l.p.price * l.qty) + '</b></li>').join('') + '</ul>' : '') +
      (hasRes ? '<p class="cart-group">' + icon('doc') + t('groupReserve') + '</p><ul class="sum-lines">' + T.res.map((l) => '<li><div class="sl-img">' + pimg(l.p) + '<span>' + l.qty + '</span></div><span class="sl-name">' + esc(l.p.brand + ' ' + l.p.name) + '</span><b>' + fmt(l.p.price * l.qty) + '</b></li>').join('') + '</ul>' : '') +
      '<div class="sum-rows">' + (hasShip ? '<div class="sum-row"><span>' + t('subtotal') + '</span><span>' + fmt(T.shipSub) + '</span></div><div class="sum-row"><span>' + t('shipping') + '</span><span>' + (T.fee ? fmt(T.fee) : t('free')) + '</span></div><div class="sum-row total"><span>' + t('payNow') + '</span><b>' + fmt(T.payNow) + '</b></div>' : '') +
      (hasRes ? '<div class="sum-row' + (hasShip ? '' : ' total') + '"><span>' + t('payInStore') + '</span><b>' + fmt(T.resSub) + '</b></div>' : '') + '<p class="vat">' + t('vat') + '</p></div>' +
      '<button class="btn btn-primary block lg" data-action="place">' + icon('lock') + btnLabel + '</button>' +
      (Object.keys(S.coErrors).length ? '<p class="err center">' + icon('alert') + t('fixErrors') + '</p>' : '') +
      '</div></aside>';
    return '<div class="wrap page checkout"><div class="co-head"><h1>' + t('secureCheckout') + '</h1><p class="muted">' + icon('lock') + t('guestNote') + '</p></div><form class="co-grid" data-form="checkout" novalidate><div class="co-main">' + contact + delivery + docs + payment + '</div>' + summary + '</form></div>';
  }

  function validateCheckout() {
    const T = cartTotals(S.co.ship);
    const e = {};
    const req = (k) => { if (!String(S.co[k] || '').trim()) e[k] = 'required'; };
    ['first', 'last', 'email', 'phone'].forEach(req);
    if (S.co.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(S.co.email).trim())) e.email = 'invalidEmail';
    if (S.co.phone && String(S.co.phone).replace(/[^\d]/g, '').length < 9) e.phone = 'invalidPhone';
    if (S.co.company) { req('companyName'); req('cui'); }
    if (T.ship.length && S.co.ship === 'courier') ['county', 'city', 'street'].forEach(req);
    if (T.res.length) { req('permit'); req('permitExp'); if (!S.co.docsOk) e.docsOk = 'mustAccept'; if (T.res.some((l) => l.p.cat === 'arme' || l.p.cat === 'aer') && !S.co.authFile) e.authFile = 'required'; }
    if (T.lines.some((l) => modeOf(l.p) === 'age18') && !S.co.age) e.age = 'mustAccept';
    if (!S.co.terms) e.terms = 'mustAccept';
    return e;
  }

  function placeOrder() {
    S.coErrors = validateCheckout();
    if (Object.keys(S.coErrors).length) {
      render();
      const first = $('.has-err input, .has-err select, .check.has-err input');
      if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      return;
    }
    const T = cartTotals(S.co.ship);
    const id = 'BA-' + (Math.max(10421, ...S.orders.map((o) => parseInt(o.id.slice(3), 10) || 0)) + 1);
    const now = new Date(); const p2 = (n) => String(n).padStart(2, '0');
    const date = now.getFullYear() + '-' + p2(now.getMonth() + 1) + '-' + p2(now.getDate()) + ' ' + p2(now.getHours()) + ':' + p2(now.getMinutes());
    const name = S.co.first.trim() + ' ' + (S.co.last || '').trim().charAt(0) + '.';
    const city = T.ship.length && S.co.ship === 'courier' ? S.co.city : STORE.city;
    if (T.ship.length) S.orders.unshift({ id: id + (T.res.length ? '-L' : ''), date, name, city, status: 'new', type: 'ship', total: T.payNow, items: T.ship.map((l) => [l.p.id, l.qty]), courier: S.co.ship === 'locker' ? 'Sameday easybox' : S.co.ship === 'pickup' ? (L() === 'ro' ? 'Ridicare magazin' : 'Store pickup') : 'Fan Courier', pay: S.co.pay, mine: true });
    if (T.res.length) S.orders.unshift({ id: id + (T.ship.length ? '-R' : ''), date, name, city, status: 'docs', type: 'reserve', total: T.resSub, items: T.res.map((l) => [l.p.id, l.qty]), permit: S.co.permit, docs: S.co.authFile ? [S.co.authFile] : [], mine: true });
    // decrement stock locally so the owner dashboard reflects it
    T.lines.forEach((l) => { const cur = byId(l.p.id); S.stockEdits[l.p.id] = Object.assign({}, S.stockEdits[l.p.id], { stock: Math.max(0, cur.stock - l.qty) }); });
    store.set('stockEdits', S.stockEdits);
    store.set('orders', S.orders);
    S.lastOrder = { id, first: S.co.first, email: S.co.email, phone: S.co.phone, ship: T.ship.length > 0, res: T.res.length > 0 };
    store.set('lastOrder', S.lastOrder);
    S.cart = []; saveCart(); S.coErrors = {};
    ['terms', 'age', 'docsOk', 'authFile', 'permit', 'permitExp'].forEach((k) => { delete S.co[k]; });
    location.hash = '#done';
  }

  function viewDone() {
    const o = S.lastOrder;
    if (!o) return viewHome();
    return '<div class="wrap page done"><div class="done-card">' + '<span class="done-ic">' + icon('check') + '</span>' +
      '<h1>' + t('thanks', { name: esc(o.first) }) + '</h1><p class="order-no">' + t('orderNo', { id: o.id }) + '</p>' +
      (o.ship ? '<div class="done-row">' + icon('truck') + '<p>' + t('doneShip', { email: '<b>' + esc(o.email) + '</b>' }) + '</p></div>' : '') +
      (o.res ? '<div class="done-row">' + icon('doc') + '<p>' + t('doneReserve', { phone: '<b>' + esc(o.phone) + '</b>' }) + '</p></div><div class="done-row">' + icon('store') + '<p>' + t('bringDocs') + '</p></div>' : '') +
      '<div class="done-btns"><a class="btn btn-primary" href="#home">' + t('backToShop') + '</a><button class="btn btn-outline" data-action="noop">' + t('createAccount') + '</button></div></div></div>';
  }

  // info pages (working drafts, to be reviewed before launch)
  function viewInfo(key) {
    const C = window.BA_INFO || {};
    const page = C[key];
    if (!page) return '<div class="wrap page empty"><h1>404</h1><p><a href="#home">' + t('backToShop') + '</a></p></div>';
    const body = page[L()] || page.ro;
    return '<div class="wrap page info"><nav class="crumbs"><a href="#home">' + t('home') + '</a>' + icon('right') + '<span>' + t('info_' + key + '_t') + '</span></nav>' +
      '<article class="prose"><h1>' + t('info_' + key + '_t') + '</h1>' + (key !== 'contact' ? '<p class="draft">' + icon('edit') + t('draftNote') + '</p>' : '') + body +
      (key === 'retragere' ? '<form class="withdraw" data-form="withdraw" novalidate><div class="form-grid"><div class="field"><label for="w-order">' + (L() === 'ro' ? 'Număr comandă' : 'Order number') + '</label><input id="w-order" required placeholder="BA-10421"></div><div class="field"><label for="w-email">' + t('emailL') + '</label><input id="w-email" type="email" required autocomplete="email"></div></div><button class="btn btn-primary">' + (L() === 'ro' ? 'Mă retrag din contract' : 'Withdraw from the contract') + '</button></form>' : '') +
      (key === 'contact' ? '<p><a class="btn btn-outline" href="https://wa.me/' + STORE.whatsapp + '" target="_blank" rel="noopener">' + icon('chat') + t('whatsapp') + '</a></p>' : '') + '</article>' +
      (key === 'contact' ? visitBlock() : '') + '</div>';
  }

  // mobile menu
  function mobileMenu() {
    return '<div class="drawer-scrim" data-action="close-menu"></div><aside class="drawer left" role="dialog" aria-modal="true" aria-label="' + t('menu') + '"><div class="drawer-head"><a class="brand" href="#home" data-action="close-menu"><span class="logo-mark"></span><span class="brand-text"><b>Bistrița Alpină</b></span></a><button class="icon-btn" data-action="close-menu" aria-label="' + t('dismiss') + '">' + icon('x') + '</button></div><div class="drawer-body"><ul class="m-nav">' +
      D.CATEGORIES.map((c) => '<li><a href="#c-' + c.id + '" data-action="close-menu"><span class="m-art">' + pimg({ img: c.img, brand: '', name: '' }) + '</span>' + esc(c.name[L()]) + icon('right') + '</a></li>').join('') +
      '</ul><ul class="m-links"><li><a href="#info-arme" data-action="close-menu">' + icon('doc') + t('fBuyGuide') + '</a></li><li><a href="#info-contact" data-action="close-menu">' + icon('pin') + t('fContact') + '</a></li><li><a href="#admin" data-action="close-menu">' + icon('user') + t('owner') + '</a></li><li><button class="link-btn" data-action="lang">' + icon('globe') + (L() === 'ro' ? 'English' : 'Română') + '</button></li></ul></div></aside>';
  }

  // ——— router & render
  function route() { return (location.hash || '#home').slice(1) || 'home'; }
  let heroSVG = null, lastRoute = null;
  function render() {
    const r = route();
    document.documentElement.lang = S.lang;
    document.documentElement.setAttribute('data-palette', S.palette);
    const isAdmin = r.startsWith('admin');
    let main;
    if (isAdmin && window.BA_ADMIN) main = window.BA_ADMIN.view(r);
    else if (r === 'home') main = viewHome();
    else if (r.startsWith('c-')) main = viewListing(r.slice(2));
    else if (r === 'search') main = viewListing(null);
    else if (r.startsWith('p-')) main = viewProduct(r.slice(2));
    else if (r === 'checkout') main = viewCheckout();
    else if (r === 'done') main = viewDone();
    else if (r.startsWith('info-')) main = viewInfo(r.slice(5));
    else main = viewHome();
    const app = $('#app');
    const sameRoute = lastRoute === r;
    const focusKey = sameRoute ? focusSelector(document.activeElement) : null;
    const oldToast = $('.toast'); const toastHTML = oldToast && !oldToast.hidden ? oldToast.innerHTML : '';
    app.className = isAdmin ? 'is-admin' : '';
    app.innerHTML = (isAdmin ? '' : header()) + '<main id="main">' + main + '</main>' + (isAdmin ? '' : footer()) +
      '<div id="cart-root"' + (S.cartOpen ? '' : ' hidden') + '>' + (S.cartOpen ? cartDrawer() : '') + '</div>' +
      '<div id="menu-root"' + (S.menuOpen ? '' : ' hidden') + '>' + (S.menuOpen ? mobileMenu() : '') + '</div>' +
      paletteSwitcher() + (isAdmin ? '' : cookieBanner()) + '<div class="toast" role="status" aria-live="polite"' + (toastHTML ? '>' + toastHTML : ' hidden>') + '</div>';
    document.title = titleFor(r);
    updateCartCount();
    mountHero();
    if (!sameRoute) { jumpTo(0); lastRoute = r; }
    else if (focusKey) { const el = $(focusKey); if (el) el.focus({ preventScroll: true }); }
    if (isAdmin && window.BA_ADMIN && window.BA_ADMIN.after) window.BA_ADMIN.after(r);
  }
  // instant scroll (html has scroll-behavior:smooth, which would animate every route change)
  function jumpTo(y) { const h = document.documentElement; h.style.scrollBehavior = 'auto'; window.scrollTo(0, y); h.style.scrollBehavior = ''; }
  // a selector that finds "the same" control after a re-render, so keyboard users keep their place
  function focusSelector(el) {
    if (!el || el === document.body || !el.closest || !el.closest('#app')) return null;
    if (el.id) return '#' + CSS.escape(el.id);
    const keys = ['action', 'id', 'k', 'd', 'i', 'v', 'f', 'to', 'pal', 'coRadio', 'coCheck', 'admOnline', 'spec', 'part', 'facet'];
    const attrs = keys.filter((k) => el.dataset[k] != null).map((k) => '[data-' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + '="' + CSS.escape(el.dataset[k]) + '"]');
    if (el.name && el.type === 'radio') attrs.push('[name="' + CSS.escape(el.name) + '"][value="' + CSS.escape(el.value) + '"]');
    if (!attrs.length) return null;
    const scope = el.closest('.drawer') ? '.drawer ' : el.closest('.sticky-buy') ? '.sticky-buy ' : el.closest('.buy-row') ? '.buy-row ' : '';
    return scope + el.tagName.toLowerCase() + attrs.join('');
  }
  function titleFor(r) {
    if (r.startsWith('p-')) { const p = byId(r.slice(2)); if (p) return p.brand + ' ' + p.name + ' · Bistrița Alpină'; }
    if (r.startsWith('c-')) return catName(r.slice(2)) + ' · Bistrița Alpină';
    if (r.startsWith('admin')) return t('owner') + ' · Bistrița Alpină';
    return 'Bistrița Alpină';
  }
  function mountHero() {
    const slots = $$('[data-hero]');
    if (!slots.length) return;
    const put = () => slots.forEach((s) => { s.innerHTML = heroSVG || ''; });
    if (heroSVG !== null) return put();
    fetch('assets/hero.svg').then((r) => (r.ok ? r.text() : '')).then((txt) => { heroSVG = txt.replace(/<\?xml[^>]*>/, ''); put(); }).catch(() => { heroSVG = ''; });
  }
  function rerenderDrawer() {
    const root = $('#cart-root');
    const k = root.contains(document.activeElement) ? focusSelector(document.activeElement) : null;
    root.hidden = !S.cartOpen;
    root.innerHTML = S.cartOpen ? cartDrawer() : '';
    document.body.classList.toggle('lock', !!(S.cartOpen || S.menuOpen));
    if (S.cartOpen) { const el = (k && $(k)) || $('.drawer .icon-btn', root); if (el) el.focus(); }
  }
  function toast(msg) {
    const el = $('.toast'); if (!el) return;
    el.innerHTML = icon('check') + msg; el.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { const t2 = $('.toast'); if (t2) t2.hidden = true; }, 2600);
  }

  // ——— search suggestions
  function suggest(q) {
    const box = $('.suggest'); if (!box) return;
    const nq = norm(q).trim();
    if (nq.length < 2) { box.hidden = true; return; }
    const hits = products().filter((p) => matches(haystack(p), nq)).slice(0, 6);
    const cats = D.CATEGORIES.filter((c) => matches(norm(c.name.ro + ' ' + c.name.en), nq)).slice(0, 2);
    if (!hits.length && !cats.length) { box.innerHTML = '<p class="sg-empty">' + t('noResults') + '</p>'; box.hidden = false; return; }
    box.innerHTML = cats.map((c) => '<a class="sg-cat" href="#c-' + c.id + '">' + icon('list') + esc(c.name[L()]) + '</a>').join('') +
      hits.map((p) => '<a class="sg-item" href="#p-' + p.id + '"><span class="sg-img">' + pimg(p) + '</span><span><small>' + esc(p.brand) + '</small>' + esc(p.name) + '</span><b>' + fmt(p.price) + '</b></a>').join('');
    box.hidden = false;
  }

  // ——— events
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-action]');
    if (!ev.target.closest('.search')) { const b = $('.suggest'); if (b) b.hidden = true; }
    if (!ev.target.closest('#palette-dock')) closePalette();
    if (!a) return;
    const act = a.dataset.action;
    const H = {
      'lang': () => { S.lang = S.lang === 'ro' ? 'en' : 'ro'; store.set('lang', S.lang); S.menuOpen = false; document.body.classList.toggle('lock', !!S.cartOpen); render(); },
      'palette': () => { S.palette = a.dataset.pal; store.set('palette', S.palette); document.documentElement.setAttribute('data-palette', S.palette); $$('.pal-opt').forEach((b) => { b.classList.toggle('on', b.dataset.pal === S.palette); b.setAttribute('aria-pressed', String(b.dataset.pal === S.palette)); }); },
      'toggle-palette': () => { const pp = $('.palette-panel'); pp.hidden = !pp.hidden; a.setAttribute('aria-expanded', String(!pp.hidden)); },
      'hide-notice': () => { S.notice = false; store.set('notice', false); const d = $('.demo-bar'); if (d) d.remove(); },
      'cookie': () => { S.cookie = a.dataset.v; store.set('cookie', S.cookie); const c = $('.cookie'); if (c) c.remove(); },
      'open-cart': () => { S.cartOpen = true; rerenderDrawer(); },
      'close-cart': () => closeCart(true),
      'close-cart-nav': () => { S.cartOpen = false; document.body.classList.remove('lock'); setTimeout(() => { rerenderDrawer(); if (route() === 'checkout') render(); }, 0); },
      'open-menu': () => { S.menuOpen = true; const r = $('#menu-root'); r.hidden = false; r.innerHTML = mobileMenu(); document.body.classList.add('lock'); const b = $('.drawer .icon-btn', r); if (b) b.focus(); },
      'close-menu': () => closeMenu(!a.closest('a')),
      'open-filters': () => { S.mobileFilters = true; $('.filters').classList.add('open'); document.body.classList.add('lock'); const b = $('.filters-head .icon-btn'); if (b) b.focus(); },
      'close-filters': () => closeFilters(true),
      'sub': () => { S.pendingSub = a.dataset.sub; S.filterCat = null; if (location.hash === '#c-' + a.dataset.cat) { ev.preventDefault(); render(); } },
      'all': () => { S.query = ''; S.filterCat = null; },
      'facet-pill': () => { toggleFacet(a.dataset.f, a.dataset.v); render(); },
      'unfacet': () => { toggleFacet(a.dataset.f, a.dataset.v); render(); },
      'unprice': () => { S.price = { min: '', max: '' }; render(); },
      'uninstock': () => { S.inStock = false; render(); },
      'clear-filters': () => { S.filters = {}; S.price = { min: '', max: '' }; S.inStock = false; render(); },
      'pdp-img': () => { S.pdpImg = +a.dataset.i; render(); },
      'size': () => { S.pdpSize = a.dataset.v; render(); },
      'qty': () => { const inp = $('#pdp-qty'); const p = byId(S.pdpFor); S.pdpQty = Math.max(1, Math.min(p.stock, (+inp.value || 1) + (+a.dataset.d))); inp.value = S.pdpQty; },
      'pdp-add': () => {
        const p = byId(a.dataset.id);
        if (p.variants && !S.pdpSize) { const e = $('#size-err'); if (e) { e.hidden = false; e.scrollIntoView({ block: 'center', behavior: 'smooth' }); } return; }
        const q = Math.max(1, Math.min(p.stock, +($('#pdp-qty') || {}).value || 1));
        addToCart(p.id, q, S.pdpSize);
        S.cartOpen = true; rerenderDrawer();
      },
      'cart-qty': () => { const l = S.cart.find((i) => cartKey(i) === a.dataset.k); const p = byId(l.id); l.qty = Math.max(1, Math.min(p.stock || 99, l.qty + (+a.dataset.d))); saveCart(); rerenderDrawer(); if (route() === 'checkout') render(); },
      'cart-remove': () => { S.cart = S.cart.filter((i) => cartKey(i) !== a.dataset.k); saveCart(); rerenderDrawer(); if (route() === 'checkout') render(); },
      'place': () => { ev.preventDefault(); placeOrder(); },
      'copy': () => { const v = a.dataset.v; const done = () => { a.textContent = t('copied'); setTimeout(() => { a.textContent = t('copy'); }, 1500); }; try { navigator.clipboard.writeText(v).then(done, () => { selectText(a.previousElementSibling); }); } catch (e) { selectText(a.previousElementSibling); } },
      'noop': () => toast(L() === 'ro' ? 'Disponibil în magazinul live' : 'Available in the live shop')
    };
    if (H[act]) H[act]();
    else if (window.BA_ADMIN && window.BA_ADMIN.onAction) window.BA_ADMIN.onAction(act, a, ev);
  });
  function closePalette() { const pp = $('.palette-panel'); if (pp && !pp.hidden) { pp.hidden = true; $('.palette-toggle').setAttribute('aria-expanded', 'false'); } }
  function closeCart(refocus) { if (!S.cartOpen) return; S.cartOpen = false; rerenderDrawer(); if (refocus) { const b = $('.cart-btn'); if (b) b.focus({ preventScroll: true }); } }
  function closeMenu(refocus) { if (!S.menuOpen) return; S.menuOpen = false; const r = $('#menu-root'); r.hidden = true; r.innerHTML = ''; document.body.classList.remove('lock'); if (refocus) { const b = $('[data-action=open-menu]'); if (b) b.focus({ preventScroll: true }); } }
  function closeFilters(refocus) { if (!S.mobileFilters) return; S.mobileFilters = false; const fl = $('.filters'); if (fl) fl.classList.remove('open'); document.body.classList.remove('lock'); if (refocus) { const b = $('[data-action=open-filters]'); if (b) b.focus({ preventScroll: true }); } }
  function selectText(el) { if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  function toggleFacet(f, v) {
    const set = S.filters[f] || (S.filters[f] = new Set());
    if (set.has(v)) set.delete(v); else set.add(v);
  }

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.dataset.facet) { toggleFacet(el.dataset.facet, el.value); refreshListing(); }
    else if (el.dataset.price) { S.price[el.dataset.price] = el.value; refreshListing(); }
    else if ('instock' in el.dataset) { S.inStock = el.checked; refreshListing(); }
    else if ('sort' in el.dataset) { S.sort = el.value; refreshListing(); }
    else if (el.dataset.coRadio) { S.co[el.dataset.coRadio] = el.value; delete S.coErrors[el.dataset.coRadio]; render(); }
    else if (el.dataset.coCheck) { S.co[el.dataset.coCheck] = el.checked; delete S.coErrors[el.dataset.coCheck]; if (el.dataset.coCheck === 'company' || S.coErrors && Object.keys(S.coErrors).length) render(); }
    else if (el.dataset.coFile) { S.co[el.dataset.coFile] = el.files[0] ? el.files[0].name : ''; delete S.coErrors[el.dataset.coFile]; render(); }
    else if (el.dataset.co && el.tagName === 'SELECT') { S.co[el.dataset.co] = el.value; if (S.coErrors[el.dataset.co]) { delete S.coErrors[el.dataset.co]; render(); } }
    else if (window.BA_ADMIN && window.BA_ADMIN.onChange) window.BA_ADMIN.onChange(el, ev);
  });
  function refreshListing() {
    // Swap only the results, pills and sheet footer: the filter controls stay in place, so focus,
    // a click that is still in progress, the sheet's scroll and the page scroll are all preserved.
    const r = route();
    if (!(r.startsWith('c-') || r === 'search') || !$('.list-main')) return render();
    const fk = focusSelector(document.activeElement);
    const tpl = document.createElement('div');
    tpl.innerHTML = viewListing(r === 'search' ? null : r.slice(2));
    ['.list-main', '.sub-pills', '.filters-foot'].forEach((sel) => { const a = $(sel), b = $(sel, tpl); if (a && b) a.replaceWith(b); });
    if (fk && !document.activeElement.closest('#app')) { const el = $(fk); if (el) el.focus({ preventScroll: true }); }
    const pmin = $('#pmin'), pmax = $('#pmax');
    if (pmin && document.activeElement !== pmin) pmin.value = S.price.min;
    if (pmax && document.activeElement !== pmax) pmax.value = S.price.max;
  }

  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.id === 'q') suggest(el.value);
    else if (el.id === 'pdp-qty') { const p = byId(S.pdpFor); const n = parseInt(el.value, 10); if (p && n > 0) S.pdpQty = Math.min(p.stock, n); }
    else if (el.dataset.co) { S.co[el.dataset.co] = el.value; if (S.coErrors[el.dataset.co]) { delete S.coErrors[el.dataset.co]; el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); const f = el.closest('.field'); if (f) { f.classList.remove('has-err'); const e = f.querySelector('.err'); if (e) e.remove(); } if (!Object.keys(S.coErrors).length) { const sm = $('.co-sum-in > .err'); if (sm) sm.remove(); } } }
    else if (window.BA_ADMIN && window.BA_ADMIN.onInput) window.BA_ADMIN.onInput(el, ev);
  });

  document.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = ev.target.dataset.form;
    if (f === 'search') { S.query = $('#q').value.trim(); S.filterCat = null; if (location.hash === '#search') render(); else location.hash = '#search'; }
    else if (f === 'withdraw') {
      const o = $('#w-order'), e = $('#w-email');
      if (!o.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.value)) { [o, e].forEach((i) => i.setAttribute('aria-invalid', String(!i.value.trim() || (i === e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.value))))); return; }
      ev.target.outerHTML = '<p class="note ok">' + icon('check') + (L() === 'ro' ? 'Am înregistrat cererea de retragere pentru comanda ' + esc(o.value) + '. Confirmarea și instrucțiunile de retur vin pe e-mail.' : 'Withdrawal request recorded for order ' + esc(o.value) + '. Confirmation and return instructions are on their way by email.') + '</p>';
    }
    else if (f === 'notify') { ev.target.outerHTML = '<p class="note ok">' + icon('check') + t('notifyDone') + '</p>'; }
    else if (f === 'checkout') placeOrder();
    else if (window.BA_ADMIN && window.BA_ADMIN.onSubmit) window.BA_ADMIN.onSubmit(ev.target, ev);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      closeCart(true); closeMenu(true); closeFilters(true);
      const b = $('.suggest'); if (b) b.hidden = true;
      closePalette();
    }
  });

  window.addEventListener('hashchange', () => {
    S.menuOpen = false; S.cartOpen = false; S.mobileFilters = false; document.body.classList.remove('lock');
    render();
  });

  // shared API for the owner dashboard
  window.BA = { S, D, t, fmt, esc, icon, pimg, store, byId, allProducts, products, cat, catName, subName, modeOf, render, toast, val };

  render();
})();
