/* Owner dashboard: photo-to-listing flow, orders, stock. Prototype — AI steps are simulated in the browser. */
(function () {
  'use strict';
  const TX = {
    ro: {
      title: 'Panou proprietar', viewShop: 'Vezi magazinul', demo: 'Date demo',
      navHome: 'Azi', navAdd: 'Adaugă produs', navOrders: 'Comenzi', navStock: 'Stoc',
      hello: 'Bună dimineața', todayLead: 'Ce ai de făcut azi în magazin.',
      kNew: 'Comenzi noi de pregătit', kDocs: 'Rezervări cu documente de verificat', kLow: 'Produse cu stoc redus', kOpen: 'Valoare comenzi deschise',
      quickAdd: 'Adaugă un produs nou', quickAddD: 'Fă o poză cu telefonul. Restul îl completează asistentul AI: fundal, titlu, descriere în română și engleză, specificații.',
      start: 'Începe',
      todo: 'De rezolvat', todoDocs: '{n} {rez} verificarea permisului', todoNew: '{n} {com} de împachetat', todoLow: '{n} {prod} aproape de epuizare', allDone: 'Nimic urgent. Bună treabă.',
      // add flow
      addTitle: 'Adaugă produs', addLead: 'O poză clară, pe orice fundal. Ține produsul întreg în cadru.',
      takePhoto: 'Fotografiază produsul', orUpload: 'sau alege o poză din galerie',
      tryDemo: 'Încearcă cu o poză demo', tips: 'Sfaturi: lumină naturală, fără reflexii, o poză și cu eticheta sau codul de bare.',
      p1: 'Elimin fundalul', p1d: 'Photoroom API',
      p2: 'Aplic fundal de studio, umbră și încadrare', p2d: 'Format pătrat 1200 px, WebP',
      p3: 'Recunosc produsul și codul de bare', p3d: 'Claude (viziune) + căutare EAN',
      p4: 'Scriu titlul și descrierea în română și engleză', p4d: 'Claude API',
      p5: 'Completez categoria și specificațiile', p5d: 'Pe baza catalogului producătorului',
      simulated: 'În prototip pașii AI sunt simulați. În magazinul live rulează automat, în 10–20 de secunde.',
      review: 'Verifică și publică', reviewLead: 'Asistentul a completat câmpurile. Tu verifici prețul și stocul.',
      before: 'Original', after: 'Editat AI',
      fCat: 'Categorie', fSub: 'Subcategorie', fBrand: 'Marcă', fName: 'Denumire produs', fPrice: 'Preț de vânzare (lei)', fOld: 'Preț vechi (opțional, pentru reducere)',
      fStock: 'Bucăți în magazin', fEan: 'Cod EAN / cod de bare', fDescRo: 'Descriere în română', fDescEn: 'Descriere în engleză', fSpecs: 'Specificații',
      fMode: 'Mod de vânzare', fOnline: 'Vizibil în magazinul online', aiFilled: 'completat de AI', regen: 'Rescrie cu AI', addSpec: 'Adaugă rând',
      publish: 'Publică acum', saveDraft: 'Salvează ciornă', needPrice: 'Introdu prețul de vânzare', needName: 'Introdu denumirea', needStock: 'Introdu stocul',
      published: 'Produs publicat', publishedD: '„{name}” este acum live în categoria {cat}.', seeLive: 'Vezi produsul în magazin', addAnother: 'Adaugă alt produs',
      draftSaved: 'Ciornă salvată',
      // orders
      ordersTitle: 'Comenzi și rezervări', all: 'Toate',
      st_new: 'Nouă', st_ready: 'Pregătită', st_shipped: 'Expediată', st_docs: 'Documente de verificat', st_pickup: 'Gata de ridicare', st_collected: 'Ridicată', st_rejected: 'Respinsă',
      typeShip: 'Livrare', typeReserve: 'Rezervare',
      items: 'Produse', customer: 'Client', courier: 'Curier', awb: 'AWB', permit: 'Permis', docs: 'Documente încărcate', none: 'niciunul',
      aPack: 'Marchează pregătită', aAwb: 'Generează AWB', aApprove: 'Documente în regulă', aReject: 'Respinge', aCollected: 'Marchează ridicată', aInvoice: 'Emite factura',
      awbDone: 'AWB generat. În magazinul live se tipărește eticheta Fan Courier / Sameday.', invoiceDone: 'În magazinul live factura se emite automat prin SmartBill sau Oblio și se trimite în e-Factura.',
      approved: 'Clientul primește SMS: rezervarea e gata de ridicare.', rejected: 'Clientul primește e-mail cu motivul respingerii.',
      noOrders: 'Nicio comandă în această listă.',
      // stock
      stockTitle: 'Stoc', searchStock: 'Caută după nume, marcă sau cod', product: 'Produs', category: 'Categorie', price: 'Preț', qty: 'Stoc', online: 'Online',
      low: 'stoc redus', saved: 'Salvat'
    },
    en: {
      title: 'Owner dashboard', viewShop: 'View shop', demo: 'Demo data',
      navHome: 'Today', navAdd: 'Add product', navOrders: 'Orders', navStock: 'Stock',
      hello: 'Good morning', todayLead: 'What needs doing in the shop today.',
      kNew: 'New orders to pack', kDocs: 'Reservations awaiting document check', kLow: 'Low-stock products', kOpen: 'Open order value',
      quickAdd: 'Add a new product', quickAddD: 'Take a photo with your phone. The AI assistant does the rest: background, title, Romanian and English description, specs.',
      start: 'Start',
      todo: 'To do', todoDocs: '{n} {rez} awaiting licence check', todoNew: '{n} {com} to pack', todoLow: '{n} {prod} running low', allDone: 'Nothing urgent. Nice work.',
      addTitle: 'Add product', addLead: 'One clear photo on any background. Keep the whole product in frame.',
      takePhoto: 'Photograph the product', orUpload: 'or choose a photo from your gallery',
      tryDemo: 'Try with a demo photo', tips: 'Tips: natural light, no glare, plus one shot of the label or barcode.',
      p1: 'Removing the background', p1d: 'Photoroom API',
      p2: 'Adding studio background, shadow and framing', p2d: 'Square 1200 px, WebP',
      p3: 'Recognising the product and barcode', p3d: 'Claude (vision) + EAN lookup',
      p4: 'Writing the title and description in Romanian and English', p4d: 'Claude API',
      p5: 'Filling in category and specifications', p5d: 'From the manufacturer catalogue',
      simulated: 'In the prototype the AI steps are simulated. In the live shop they run automatically in 10–20 seconds.',
      review: 'Review and publish', reviewLead: 'The assistant filled in the fields. You check price and stock.',
      before: 'Original', after: 'AI edited',
      fCat: 'Category', fSub: 'Subcategory', fBrand: 'Brand', fName: 'Product name', fPrice: 'Selling price (lei)', fOld: 'Previous price (optional, for a sale)',
      fStock: 'Units in store', fEan: 'EAN / barcode', fDescRo: 'Romanian description', fDescEn: 'English description', fSpecs: 'Specifications',
      fMode: 'How it sells', fOnline: 'Visible in the online shop', aiFilled: 'AI filled', regen: 'Rewrite with AI', addSpec: 'Add row',
      publish: 'Publish now', saveDraft: 'Save draft', needPrice: 'Enter the selling price', needName: 'Enter the product name', needStock: 'Enter the stock',
      published: 'Product published', publishedD: '“{name}” is now live in {cat}.', seeLive: 'See it in the shop', addAnother: 'Add another product',
      draftSaved: 'Draft saved',
      ordersTitle: 'Orders and reservations', all: 'All',
      st_new: 'New', st_ready: 'Packed', st_shipped: 'Shipped', st_docs: 'Documents to check', st_pickup: 'Ready to collect', st_collected: 'Collected', st_rejected: 'Rejected',
      typeShip: 'Delivery', typeReserve: 'Reservation',
      items: 'Items', customer: 'Customer', courier: 'Courier', awb: 'Tracking', permit: 'Licence', docs: 'Uploaded documents', none: 'none',
      aPack: 'Mark packed', aAwb: 'Create shipping label', aApprove: 'Documents OK', aReject: 'Reject', aCollected: 'Mark collected', aInvoice: 'Issue invoice',
      awbDone: 'Label created. In the live shop this prints the Fan Courier / Sameday label.', invoiceDone: 'In the live shop the invoice is issued automatically via SmartBill or Oblio and sent to e-Factura.',
      approved: 'The customer gets an SMS: reservation ready to collect.', rejected: 'The customer gets an email with the reason.',
      noOrders: 'No orders in this list.',
      stockTitle: 'Stock', searchStock: 'Search by name, brand or code', product: 'Product', category: 'Category', price: 'Price', qty: 'Stock', online: 'Online',
      low: 'low stock', saved: 'Saved'
    }
  };
  const A = { step: 'capture', orderFilter: 'all', open: null, stockQ: '', compare: 'after', progress: 0, f: null, errors: {} };

  const B = () => window.BA;
  const x = (k, v) => { const s = (TX[B().S.lang] || TX.ro)[k] || TX.ro[k] || k; return v ? Object.keys(v).reduce((a, n) => a.split('{' + n + '}').join(v[n]), s) : s; };

  function shell(r, body) {
    const { icon, S } = B();
    const nav = [['admin', 'home', 'navHome'], ['admin-add', 'camera', 'navAdd'], ['admin-orders', 'list', 'navOrders'], ['admin-stock', 'box', 'navStock']];
    const docsN = S.orders.filter((o) => o.status === 'docs').length;
    return '<div class="adm">' +
      '<header class="adm-top"><a class="brand" href="#admin"><span class="logo-mark"></span><span class="brand-text"><b>Bistrița Alpină</b><small>' + x('title') + '</small></span></a>' +
      '<div class="adm-top-r"><span class="demo-chip hide-sm">' + x('demo') + '</span><button class="lang" data-action="lang">' + icon('globe') + '<span>' + (S.lang === 'ro' ? 'EN' : 'RO') + '</span></button><a class="btn btn-outline sm" href="#home">' + icon('eye') + '<span class="hide-sm">' + x('viewShop') + '</span></a></div></header>' +
      '<div class="adm-body"><nav class="adm-nav" aria-label="' + x('title') + '">' + nav.map(([h, ic, k]) => '<a href="#' + h + '" class="' + (r === h ? 'on' : '') + '"' + (r === h ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + x(k) + '</span>' + (h === 'admin-orders' && docsN ? '<em>' + docsN + '</em>' : '') + '</a>').join('') + '</nav>' +
      '<div class="adm-main">' + body + '</div></div></div>';
  }

  // ——— overview
  function vHome() {
    const { S, fmt, icon, allProducts } = B();
    const nNew = S.orders.filter((o) => o.status === 'new').length;
    const nDocs = S.orders.filter((o) => o.status === 'docs').length;
    const low = allProducts().filter((p) => p.stock <= 1);
    const open = S.orders.filter((o) => ['new', 'ready', 'docs', 'pickup'].includes(o.status)).reduce((a, o) => a + o.total, 0);
    const tile = (n, k, href, tone) => '<a class="kpi ' + (tone || '') + '" href="' + href + '"><b>' + n + '</b><span>' + x(k) + '</span></a>';
    const todos = [];
    const ro = S.lang === 'ro';
    const pl = (n, one, many, manyDe) => (n === 1 ? one : ro && (n === 0 || n % 100 >= 20 || n % 100 === 0) && manyDe ? manyDe : many);
    if (nDocs) todos.push(['doc', x('todoDocs', { n: nDocs, rez: ro ? pl(nDocs, 'rezervare așteaptă', 'rezervări așteaptă', 'de rezervări așteaptă') : pl(nDocs, 'reservation', 'reservations') }), 'docs']);
    if (nNew) todos.push(['box', x('todoNew', { n: nNew, com: ro ? pl(nNew, 'comandă', 'comenzi', 'de comenzi') : pl(nNew, 'order', 'orders') }), 'new']);
    if (low.length) todos.push(['alert', x('todoLow', { n: low.length, prod: ro ? pl(low.length, 'produs', 'produse', 'de produse') : pl(low.length, 'product', 'products') }), 'stock']);
    return '<div class="adm-head"><h1>' + x('hello') + '</h1><p class="muted">' + x('todayLead') + '</p></div>' +
      '<a class="quick-add" href="#admin-add"><span class="qa-ic">' + icon('camera') + '</span><span><b>' + x('quickAdd') + '</b><small>' + x('quickAddD') + '</small></span><span class="btn btn-primary sm">' + x('start') + icon('arrow') + '</span></a>' +
      '<div class="kpis">' + tile(nNew, 'kNew', '#admin-orders', nNew ? 'warn' : '') + tile(nDocs, 'kDocs', '#admin-orders', nDocs ? 'crit' : '') + tile(low.length, 'kLow', '#admin-stock', low.length ? 'warn' : '') + tile(fmt(open), 'kOpen', '#admin-orders') + '</div>' +
      '<section class="panel"><h2>' + x('todo') + '</h2>' + (todos.length ? '<ul class="todo">' + todos.map(([ic, txt, f]) => '<li><button data-action="adm-goto" data-f="' + f + '">' + icon(ic) + '<span>' + txt + '</span>' + icon('right') + '</button></li>').join('') + '</ul>' : '<p class="muted">' + x('allDone') + '</p>') + '</section>';
  }

  // ——— add product
  const PIPE = ['p1', 'p2', 'p3', 'p4', 'p5'];
  function vAdd() {
    const { icon, esc, D, S } = B();
    if (A.step === 'capture') {
      return '<div class="adm-head"><h1>' + x('addTitle') + '</h1><p class="muted">' + x('addLead') + '</p></div>' +
        '<div class="capture">' +
          '<label class="shoot"><input type="file" id="adm-photo" accept="image/*" capture="environment" data-adm-photo>' + icon('camera', 'xl') + '<b>' + x('takePhoto') + '</b><small>' + x('orUpload') + '</small></label>' +
          '<button class="btn btn-outline block" data-action="adm-demo">' + icon('spark') + x('tryDemo') + '</button>' +
          '<p class="muted small">' + x('tips') + '</p>' +
        '</div>';
    }
    if (A.step === 'processing') {
      return '<div class="adm-head"><h1>' + x('addTitle') + '</h1></div><div class="proc">' +
        '<div class="proc-img">' + (A.orig ? '<img src="' + A.orig + '" alt="">' : '') + '<div class="scan"></div></div>' +
        '<ol class="pipe">' + PIPE.map((k, i) => '<li class="' + (i < A.progress ? 'done' : i === A.progress ? 'run' : '') + '"><span class="pi">' + (i < A.progress ? icon('check') : '<i></i>') + '</span><span><b>' + x(k) + '</b><small>' + x(k + 'd') + '</small></span></li>').join('') + '</ol>' +
        '<p class="muted small">' + icon('spark') + x('simulated') + '</p></div>';
    }
    if (A.step === 'done') {
      const p = A.lastPublished;
      return '<div class="done-card adm-done"><span class="done-ic">' + icon('check') + '</span><h1>' + x('published') + '</h1><p>' + x('publishedD', { name: esc(p.brand + ' ' + p.name), cat: esc(B().catName(p.cat)) }) + '</p>' +
        '<div class="done-btns"><a class="btn btn-primary" href="#p-' + p.id + '">' + x('seeLive') + '</a><button class="btn btn-outline" data-action="adm-again">' + icon('camera') + x('addAnother') + '</button></div></div>';
    }
    // review
    const f = A.f;
    const c = B().cat(f.cat);
    const err = (k) => (A.errors[k] ? '<p class="err">' + icon('alert') + A.errors[k] + '</p>' : '');
    const ai = '<span class="ai-tag">' + icon('spark') + x('aiFilled') + '</span>';
    const inp = (k, label, type, tag, extra) => '<div class="field' + (A.errors[k] ? ' has-err' : '') + '"><label for="af-' + k + '">' + label + (tag ? ai : '') + '</label><input id="af-' + k + '" data-af="' + k + '" type="' + (type || 'text') + '"' + (type === 'number' ? ' inputmode="decimal" min="0"' : '') + ' value="' + esc(f[k] == null ? '' : f[k]) + '"' + (extra || '') + '>' + err(k) + '</div>';
    const modeName = { licensed: B().t('mode_licensed_t'), age18: B().t('mode_age18_t'), ship: B().t('mode_ship_t') }[c.mode];
    return '<div class="adm-head"><h1>' + x('review') + '</h1><p class="muted">' + x('reviewLead') + '</p></div>' +
      '<form class="review" data-form="adm-publish" novalidate>' +
        '<div class="rv-media"><div class="rv-img">' + '<img src="' + (A.compare === 'after' ? A.processed : A.orig) + '" alt="">' + '</div>' +
          '<div class="seg" role="tablist"><button type="button" role="tab" aria-selected="' + (A.compare === 'before') + '" class="' + (A.compare === 'before' ? 'on' : '') + '" data-action="adm-compare" data-v="before">' + x('before') + '</button><button type="button" role="tab" aria-selected="' + (A.compare === 'after') + '" class="' + (A.compare === 'after' ? 'on' : '') + '" data-action="adm-compare" data-v="after">' + icon('spark') + x('after') + '</button></div>' +
          '<div class="mode-box m-' + c.mode + ' sm">' + icon(c.mode === 'licensed' ? 'doc' : c.mode === 'age18' ? 'shield' : 'truck') + '<div><b>' + x('fMode') + ': ' + modeName + '</b></div></div>' +
        '</div>' +
        '<div class="rv-fields">' +
          '<div class="form-grid">' +
            '<div class="field"><label for="af-cat">' + x('fCat') + ai + '</label><select id="af-cat" data-af="cat">' + D.CATEGORIES.map((k) => '<option value="' + k.id + '"' + (k.id === f.cat ? ' selected' : '') + '>' + esc(k.name[S.lang]) + '</option>').join('') + '</select></div>' +
            (c.subs.length ? '<div class="field"><label for="af-sub">' + x('fSub') + '</label><select id="af-sub" data-af="sub">' + c.subs.map((s) => '<option value="' + s.id + '"' + (s.id === f.sub ? ' selected' : '') + '>' + esc(s[S.lang]) + '</option>').join('') + '</select></div>' : '<div></div>') +
            inp('brand', x('fBrand'), 'text', true) + inp('name', x('fName'), 'text', true) +
            inp('price', x('fPrice'), 'number', false, ' step="0.01" placeholder="0,00"') + inp('oldPrice', x('fOld'), 'number', false, ' step="0.01"') +
            inp('stock', x('fStock'), 'number', false, ' step="1"') + inp('ean', x('fEan'), 'text', true, ' inputmode="numeric"') +
          '</div>' +
          '<div class="field"><label for="af-descRo">' + x('fDescRo') + ai + '</label><textarea id="af-descRo" data-af="descRo" rows="4">' + esc(f.descRo) + '</textarea></div>' +
          '<div class="field"><label for="af-descEn">' + x('fDescEn') + ai + '</label><textarea id="af-descEn" data-af="descEn" rows="4">' + esc(f.descEn) + '</textarea></div>' +
          '<button type="button" class="link-btn" data-action="adm-regen">' + icon('spark') + x('regen') + '</button>' +
          '<fieldset class="specs-edit"><legend>' + x('fSpecs') + ai + '</legend>' + f.specs.map((s, i) => '<div class="spec-row"><input aria-label="label" data-spec="' + i + '" data-part="0" value="' + esc(s[0]) + '"><input aria-label="value" data-spec="' + i + '" data-part="1" value="' + esc(s[1]) + '"><button type="button" class="icon-btn sm" data-action="adm-spec-del" data-i="' + i + '" aria-label="remove">' + icon('x') + '</button></div>').join('') +
            '<button type="button" class="link-btn" data-action="adm-spec-add">' + icon('plus') + x('addSpec') + '</button></fieldset>' +
          '<label class="toggle"><input type="checkbox" id="af-online" data-af-check="online"' + (f.online ? ' checked' : '') + '><span class="tg"></span>' + x('fOnline') + '</label>' +
          '<div class="rv-actions"><button type="button" class="btn btn-outline" data-action="adm-draft">' + x('saveDraft') + '</button><button class="btn btn-primary">' + icon('upload') + x('publish') + '</button></div>' +
        '</div>' +
      '</form>';
  }

  function processImage(src, isSvg) {
    // Square studio composition: soft backdrop, centred product, contact shadow.
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const N = 1000, c = document.createElement('canvas'); c.width = c.height = N;
        const g = c.getContext('2d');
        const bg = g.createRadialGradient(N / 2, N * 0.42, N * 0.05, N / 2, N / 2, N * 0.75);
        bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#e6e8e6');
        g.fillStyle = bg; g.fillRect(0, 0, N, N);
        const iw = img.naturalWidth || 800, ih = img.naturalHeight || 600;
        const s = Math.min((N * 0.82) / iw, (N * 0.72) / ih);
        const w = iw * s, h = ih * s, x0 = (N - w) / 2, y0 = (N - h) / 2 - N * 0.02;
        g.save(); g.fillStyle = 'rgba(0,0,0,0.16)'; g.filter = 'blur(18px)';
        g.beginPath(); g.ellipse(N / 2, y0 + h + N * 0.015, w * 0.42, N * 0.025, 0, 0, Math.PI * 2); g.fill(); g.restore();
        if (isSvg) {
          // tint the line-art to a product-like charcoal
          const off = document.createElement('canvas'); off.width = w; off.height = h;
          const o = off.getContext('2d'); o.drawImage(img, 0, 0, w, h); o.globalCompositeOperation = 'source-in'; o.fillStyle = '#2a2f31'; o.fillRect(0, 0, w, h);
          g.drawImage(off, x0, y0);
        } else {
          g.save(); g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
          g.drawImage(img, x0, y0, w, h); g.restore();
        }
        let out; try { out = c.toDataURL('image/jpeg', 0.84); } catch (e) { out = src; }
        resolve(out);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  const SAMPLE = {
    cat: 'optica', sub: 'binocluri', brand: 'Meopta', name: 'MeoPro Optika HD 10×42', price: '', oldPrice: '', stock: '', ean: '',
    descRo: 'Binoclu compact cu sticlă HD și tratament MeoBright pentru imagini luminoase la răsărit și la apus. Corp etanș umplut cu azot, ușor de ținut cu o mână. Ideal pentru observarea vânatului la pândă.',
    descEn: 'Compact binocular with HD glass and MeoBright coatings for bright views at dawn and dusk. Nitrogen-filled, waterproof body that is easy to hold in one hand. Ideal for spotting game from the high seat.',
    specs: [['Mărire', '10×'], ['Obiectiv', '42 mm'], ['Prisme', 'Roof'], ['Etanșare', 'Umplut cu azot']], online: true
  };
  const GENERIC = {
    cat: 'accesorii', sub: '', brand: '', name: '', price: '', oldPrice: '', stock: '1', ean: '',
    descRo: 'Descriere generată de AI pe baza fotografiei. Verifică și ajustează detaliile înainte de publicare.',
    descEn: 'AI-generated description based on the photo. Check and adjust the details before publishing.',
    specs: [['Material', ''], ['Greutate', '']], online: true
  };

  function runPipeline(orig, isSvg, preset) {
    A.step = 'processing'; A.orig = orig; A.progress = 0; A.errors = {};
    B().render();
    const procP = processImage(orig, isSvg);
    let i = 0;
    const tick = () => {
      i++; A.progress = i;
      if (B().S && location.hash === '#admin-add') B().render();
      if (i < PIPE.length) setTimeout(tick, 650);
      else procP.then((out) => { A.processed = out; A.f = JSON.parse(JSON.stringify(preset)); A.compare = 'after'; A.step = 'review'; B().render(); });
    };
    setTimeout(tick, 650);
  }

  function publish() {
    const f = A.f, e = {};
    if (!String(f.name || '').trim()) e.name = x('needName');
    if (!(parseFloat(f.price) > 0)) e.price = x('needPrice');
    if (String(f.stock).trim() === '' || isNaN(parseInt(f.stock, 10))) e.stock = x('needStock');
    A.errors = e;
    if (Object.keys(e).length) { B().render(); const el = document.querySelector('.review .has-err input'); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } return; }
    const { S, store } = B();
    const slug = (f.brand + '-' + f.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36).slice(-4);
    const price = parseFloat(f.price), old = parseFloat(f.oldPrice);
    const p = {
      id: slug, cat: f.cat, sub: f.sub || undefined, brand: f.brand || 'Bistrița Alpină', name: f.name, photo: A.processed, img: 'box',
      price, oldPrice: old > price ? old : undefined, lowest30: old > price ? old : undefined, stock: parseInt(f.stock, 10), online: !!f.online,
      badges: ['new'], attrs: {}, specs: f.specs.filter((s) => s[0] && s[1]).map((s) => ['_raw', s[0] + ': ' + s[1]]),
      desc: { ro: f.descRo, en: f.descEn }
    };
    S.added.unshift(p);
    try { store.set('added', S.added); } catch (err) { /* large photo: keep in memory only */ }
    A.lastPublished = p; A.step = 'done';
    B().render();
  }

  // ——— orders
  const FLOW = { ship: ['new', 'ready', 'shipped'], reserve: ['docs', 'pickup', 'collected'] };
  function vOrders() {
    const { S, fmt, icon, esc, byId } = B();
    const filters = ['all', 'docs', 'new', 'ready', 'pickup', 'shipped'];
    const list = S.orders.filter((o) => A.orderFilter === 'all' || o.status === A.orderFilter);
    const count = (st) => S.orders.filter((o) => st === 'all' || o.status === st).length;
    const pill = (st) => '<span class="st st-' + st + '">' + x('st_' + st) + '</span>';
    const row = (o) => {
      const open = A.open === o.id;
      const items = o.items.map(([id, q]) => { const p = byId(id); return p ? '<li><span class="oi-img">' + B().pimg(p) + '</span><span>' + q + ' × ' + esc(p.brand + ' ' + p.name) + '</span><b>' + fmt(p.price * q) + '</b></li>' : ''; }).join('');
      let actions = '';
      if (o.status === 'new') actions = '<button class="btn btn-primary sm" data-action="adm-st" data-id="' + o.id + '" data-to="ready">' + icon('box') + x('aPack') + '</button>';
      if (o.status === 'ready') actions = '<button class="btn btn-primary sm" data-action="adm-st" data-id="' + o.id + '" data-to="shipped">' + icon('print') + x('aAwb') + '</button>';
      if (o.status === 'docs') actions = '<button class="btn btn-primary sm" data-action="adm-st" data-id="' + o.id + '" data-to="pickup">' + icon('check') + x('aApprove') + '</button><button class="btn btn-ghost sm" data-action="adm-st" data-id="' + o.id + '" data-to="rejected">' + x('aReject') + '</button>';
      if (o.status === 'pickup') actions = '<button class="btn btn-primary sm" data-action="adm-st" data-id="' + o.id + '" data-to="collected">' + icon('check') + x('aCollected') + '</button>';
      if (o.type === 'ship' && o.status !== 'new') actions += '<button class="btn btn-ghost sm" data-action="adm-invoice">' + icon('doc') + x('aInvoice') + '</button>';
      return '<li class="order' + (open ? ' open' : '') + (o.status === 'docs' ? ' attn' : '') + '"><button class="order-sum" data-action="adm-open" data-id="' + o.id + '" aria-expanded="' + open + '">' +
        '<span class="o-type">' + icon(o.type === 'reserve' ? 'doc' : 'truck') + '</span>' +
        '<span class="o-main"><b>' + esc(o.id) + '</b><small>' + esc(o.name) + ' · ' + esc(o.city) + '</small></span>' +
        '<span class="o-date">' + esc(o.date.slice(5)) + '</span>' + pill(o.status) + '<span class="o-total">' + fmt(o.total) + '</span>' + icon('down', 'chev') + '</button>' +
        (open ? '<div class="order-det"><div class="od-cols"><div><h4>' + x('items') + '</h4><ul class="oi">' + items + '</ul></div><div class="od-meta">' +
          '<p><span>' + x('customer') + '</span>' + esc(o.name) + ', ' + esc(o.city) + '</p>' +
          (o.type === 'ship' ? '<p><span>' + x('courier') + '</span>' + esc(o.courier || '') + '</p>' + (o.awb ? '<p><span>' + x('awb') + '</span><code>' + esc(o.awb) + '</code></p>' : '') : '') +
          (o.type === 'reserve' ? '<p><span>' + x('permit') + '</span>' + esc(o.permit || '') + '</p><p><span>' + x('docs') + '</span>' + (o.docs && o.docs.length ? o.docs.map((d) => '<a class="doc-chip" href="#admin-orders" data-action="noop-doc">' + icon('doc') + esc(d) + '</a>').join(' ') : x('none')) + '</p>' : '') +
          '</div></div><div class="od-actions">' + actions + '</div></div>' : '') + '</li>';
    };
    return '<div class="adm-head"><h1>' + x('ordersTitle') + '</h1></div>' +
      '<div class="seg-scroll"><div class="filters-row">' + filters.map((f) => '<button class="pill' + (A.orderFilter === f ? ' on' : '') + '" data-action="adm-of" data-f="' + f + '">' + (f === 'all' ? x('all') : x('st_' + f)) + ' <em>' + count(f) + '</em></button>').join('') + '</div></div>' +
      (list.length ? '<ul class="orders">' + list.map(row).join('') + '</ul>' : '<p class="muted empty">' + x('noOrders') + '</p>');
  }

  // ——— stock
  function vStock() {
    const { allProducts, fmt, icon, esc, catName } = B();
    const q = A.stockQ.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const list = allProducts().filter((p) => !q || (p.brand + ' ' + p.name + ' ' + p.id).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
    return '<div class="adm-head"><h1>' + x('stockTitle') + '</h1></div>' +
      '<div class="stock-search">' + icon('search') + '<label class="sr" for="adm-sq">' + x('searchStock') + '</label><input id="adm-sq" type="search" placeholder="' + x('searchStock') + '" value="' + esc(A.stockQ) + '" data-adm-sq></div>' +
      '<div class="table-wrap"><table class="stock-table"><thead><tr><th>' + x('product') + '</th><th class="hide-sm">' + x('category') + '</th><th class="num">' + x('price') + '</th><th>' + x('qty') + '</th><th>' + x('online') + '</th></tr></thead><tbody>' +
      list.map((p) => '<tr class="' + (p.stock <= 1 ? 'low' : '') + '"><td><div class="st-prod"><span class="st-img">' + B().pimg(p) + '</span><span><small>' + esc(p.brand) + '</small>' + esc(p.name) + (p.stock <= 1 ? '<em class="low-tag">' + x('low') + '</em>' : '') + '</span></div></td>' +
        '<td class="hide-sm">' + esc(catName(p.cat)) + '</td><td class="num">' + fmt(p.price) + '</td>' +
        '<td><div class="qty sm"><button data-action="adm-stock" data-id="' + p.id + '" data-d="-1" aria-label="-">' + icon('minus') + '</button><span>' + p.stock + '</span><button data-action="adm-stock" data-id="' + p.id + '" data-d="1" aria-label="+">' + icon('plus') + '</button></div></td>' +
        '<td><label class="toggle sm"><input type="checkbox" data-adm-online="' + p.id + '"' + (p.online !== false ? ' checked' : '') + ' aria-label="' + x('online') + '"><span class="tg"></span></label></td></tr>').join('') +
      '</tbody></table></div>';
  }

  // ——— public API used by app.js
  window.BA_ADMIN = {
    view(r) {
      const body = r === 'admin-add' ? vAdd() : r === 'admin-orders' ? vOrders() : r === 'admin-stock' ? vStock() : vHome();
      return shell(r, body);
    },
    onAction(act, el, ev) {
      const { S, store, toast } = B();
      const H = {
        'adm-demo': () => runPipeline('assets/products/binoculars.svg', true, SAMPLE),
        'adm-again': () => { A.step = 'capture'; B().render(); },
        'adm-compare': () => { A.compare = el.dataset.v; B().render(); },
        'adm-regen': () => { A.f.descRo = A.f.descRo.replace(/\.$/, '') + '. Livrat cu husă și curea de transport.'; A.f.descEn = A.f.descEn.replace(/\.$/, '') + '. Supplied with case and carry strap.'; B().render(); toast(x('aiFilled')); },
        'adm-spec-add': () => { A.f.specs.push(['', '']); B().render(); },
        'adm-spec-del': () => { A.f.specs.splice(+el.dataset.i, 1); B().render(); },
        'adm-draft': () => toast(x('draftSaved')),
        'adm-goto': () => { const f = el.dataset.f; if (f === 'stock') location.hash = '#admin-stock'; else { A.orderFilter = f; location.hash = '#admin-orders'; } },
        'adm-of': () => { A.orderFilter = el.dataset.f; A.open = null; B().render(); },
        'adm-open': () => { A.open = A.open === el.dataset.id ? null : el.dataset.id; B().render(); },
        'adm-st': () => {
          const o = S.orders.find((z) => z.id === el.dataset.id); o.status = el.dataset.to;
          if (o.status === 'shipped') { o.awb = '21' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'); toast(x('awbDone')); }
          else if (o.status === 'pickup') toast(x('approved'));
          else if (o.status === 'rejected') toast(x('rejected'));
          store.set('orders', S.orders); B().render();
        },
        'adm-invoice': () => toast(x('invoiceDone')),
        'noop-doc': () => { ev.preventDefault(); toast(S.lang === 'ro' ? 'În magazinul live documentul se deschide securizat.' : 'In the live shop the document opens securely.'); },
        'adm-stock': () => { const p = B().byId(el.dataset.id); S.stockEdits[p.id] = Object.assign({}, S.stockEdits[p.id], { stock: Math.max(0, p.stock + (+el.dataset.d)) }); store.set('stockEdits', S.stockEdits); B().render(); }
      };
      if (H[act]) H[act]();
    },
    onChange(el) {
      const { S, store, toast } = B();
      if ('admPhoto' in el.dataset && el.files && el.files[0]) {
        const fr = new FileReader();
        fr.onload = () => runPipeline(fr.result, false, GENERIC);
        fr.readAsDataURL(el.files[0]);
      } else if (el.dataset.af === 'cat') { A.f.cat = el.value; const c = B().cat(el.value); A.f.sub = c.subs[0] ? c.subs[0].id : ''; B().render(); }
      else if (el.dataset.af === 'sub') A.f.sub = el.value;
      else if (el.dataset.afCheck) A.f[el.dataset.afCheck] = el.checked;
      else if (el.dataset.admOnline) { S.stockEdits[el.dataset.admOnline] = Object.assign({}, S.stockEdits[el.dataset.admOnline], { online: el.checked }); store.set('stockEdits', S.stockEdits); toast(x('saved')); }
    },
    onInput(el) {
      if (el.dataset.af && A.f) { A.f[el.dataset.af] = el.value; if (A.errors[el.dataset.af]) { delete A.errors[el.dataset.af]; const fl = el.closest('.field'); if (fl) { fl.classList.remove('has-err'); const e = fl.querySelector('.err'); if (e) e.remove(); } } }
      else if (el.dataset.spec != null && A.f) A.f.specs[+el.dataset.spec][+el.dataset.part] = el.value;
      else if ('admSq' in el.dataset) { A.stockQ = el.value; const pos = el.selectionStart; B().render(); const n = document.getElementById('adm-sq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    },
    onSubmit(form) { if (form.dataset.form === 'adm-publish') publish(); },
    after() {}
  };
})();
