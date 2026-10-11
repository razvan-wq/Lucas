const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node22/lib/node_modules/playwright'); } })();
const fs = require('fs');
const SITE = require('path').join(__dirname, '..', 'site', 'index.html');
const OUT = process.argv[2] || require('os').tmpdir();
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [name, vp] of [['desk', { width: 1366, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errs.push(name + ' console: ' + m.text()); });
    page.on('response', (r) => { if (r.status() >= 400) errs.push(name + ' 404 ' + r.url()); }); page.on('pageerror', (e) => errs.push(name + ' pageerror: ' + e.message));
    await page.route('**/index.html', (r) => r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}</style></head><body>' + fs.readFileSync(SITE, 'utf8') + '</body></html>' }));
    const routes = (process.argv[3] || 'home,c-arme,p-tikka-t3x-hunter,c-optica,checkout,admin,admin-orders,admin-stock,admin-add,info-arme').split(',');
    for (const r of routes) {
      await page.goto('http://localhost:8765/index.html#' + r);
      if (r === 'checkout') { await page.evaluate(() => { localStorage.setItem('ba_cart', JSON.stringify([{id:'tikka-t3x-hunter',qty:1,size:''},{id:'meindl-kansas-gtx',qty:1,size:'43'}])); }); await page.reload(); }
      await page.waitForTimeout(700);
      const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ow > 0) errs.push(name + ' ' + r + ' horizontal overflow ' + ow + 'px');
      await page.screenshot({ path: `${OUT}/${name}-${r}.png`, fullPage: process.argv[4] === 'full' });
    }
    await ctx.close();
  }
  await b.close();
  console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
})();
