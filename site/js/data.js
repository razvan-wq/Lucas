/* Bistrița Alpină — catalog & store configuration.
   Everything marked TODO is a placeholder to replace with the real business details.
   Products, prices and specs below are DEMO data for the prototype. */
window.BA_DATA = (function () {
  const STORE = {
    name: 'Bistrița Alpină',
    legalName: 'TODO S.R.L.',            // TODO: company name
    cui: 'RO00000000',                    // TODO: CUI
    regCom: 'J06/0000/2020',              // TODO: Nr. Reg. Com.
    armsLicence: 'TODO',                  // TODO: autorizație armurier (IGPR)
    street: 'Strada TODO nr. 0',          // TODO
    city: 'Bistrița',
    county: 'Bistrița-Năsăud',
    zip: '420000',                        // TODO
    phone: '+40 7XX XXX XXX',             // TODO
    email: 'contact@bistrita-alpina.ro',  // TODO
    hours: { ro: 'Luni–Vineri 9:00–18:00 · Sâmbătă 9:00–14:00', en: 'Mon–Fri 9:00–18:00 · Sat 9:00–14:00' }, // TODO
    whatsapp: '40700000000',             // TODO: WhatsApp number, digits only
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bistri%C8%9Ba+Alpin%C4%83+Bistri%C8%9Ba',
    freeShippingOver: 500,   // lei — configurable
    shippingFee: 24.99,      // lei — configurable, set to the courier contract
    lockerFee: 14.99         // lei — configurable
  };

  // mode: 'ship'     → normal checkout, courier delivery
  //       'age18'    → courier delivery, buyer confirms 18+ (and ID check at delivery where the courier offers it)
  //       'licensed' → reserve online, documents checked, pay & collect in store
  const CATEGORIES = [
    { id: 'arme', mode: 'licensed', img: 'rifle-bolt',
      name: { ro: 'Arme de vânătoare', en: 'Hunting firearms' },
      blurb: { ro: 'Carabine și arme cu țeavă lisă. Rezervi online, ridici din magazin.', en: 'Rifles and shotguns. Reserve online, collect in store.' },
      subs: [{ id: 'carabine', ro: 'Carabine', en: 'Rifles' }, { id: 'lisa', ro: 'Arme cu țeavă lisă', en: 'Shotguns' }],
      facets: ['sub', 'brand', 'calibre', 'action', 'barrel'] },
    { id: 'munitie', mode: 'licensed', img: 'ammo-box',
      name: { ro: 'Muniție', en: 'Ammunition' },
      blurb: { ro: 'Cartușe cu glonț și cu alice de la producători de renume.', en: 'Rifle and shotgun cartridges from leading makers.' },
      subs: [{ id: 'glont', ro: 'Cartușe cu glonț', en: 'Rifle cartridges' }, { id: 'alice', ro: 'Cartușe cu alice', en: 'Shotgun cartridges' }],
      facets: ['sub', 'brand', 'calibre', 'bulletType', 'qty'] },
    { id: 'optica', mode: 'ship', img: 'scope',
      name: { ro: 'Optică', en: 'Optics' },
      blurb: { ro: 'Lunete, binocluri, termoviziune și telemetre.', en: 'Riflescopes, binoculars, thermal and rangefinders.' },
      subs: [{ id: 'lunete', ro: 'Lunete', en: 'Riflescopes' }, { id: 'binocluri', ro: 'Binocluri', en: 'Binoculars' }, { id: 'termo', ro: 'Termoviziune', en: 'Thermal imaging' }, { id: 'telemetre', ro: 'Telemetre', en: 'Rangefinders' }],
      facets: ['sub', 'brand', 'magnification', 'illuminated'] },
    { id: 'aer', mode: 'licensed', img: 'airgun',
      name: { ro: 'Arme cu aer comprimat', en: 'Air guns' },
      blurb: { ro: 'Categoria C: se vând pe bază de autorizație de procurare. Rezervi online, ridici din magazin.', en: 'Category C: sold against a police purchase authorisation. Reserve online, collect in store.' },
      subs: [], facets: ['brand', 'calibre'] },
    { id: 'cutite', mode: 'age18', img: 'knife',
      name: { ro: 'Cuțite', en: 'Knives' },
      blurb: { ro: 'Cuțite de vânătoare și de teren.', en: 'Hunting and field knives.' },
      subs: [], facets: ['brand', 'steel'] },
    { id: 'imbracaminte', mode: 'ship', img: 'jacket',
      name: { ro: 'Îmbrăcăminte', en: 'Clothing' },
      blurb: { ro: 'Geci, pantaloni, șepci și căciuli pentru orice anotimp.', en: 'Jackets, trousers and headwear for every season.' },
      subs: [{ id: 'geci', ro: 'Geci', en: 'Jackets' }, { id: 'pantaloni', ro: 'Pantaloni', en: 'Trousers' }, { id: 'sepci', ro: 'Șepci și căciuli', en: 'Headwear' }],
      facets: ['sub', 'brand', 'season', 'membrane'] },
    { id: 'incaltaminte', mode: 'ship', img: 'boots',
      name: { ro: 'Încălțăminte', en: 'Footwear' },
      blurb: { ro: 'Bocanci de munte și de vânătoare.', en: 'Mountain and hunting boots.' },
      subs: [], facets: ['brand', 'membrane', 'height'] },
    { id: 'accesorii', mode: 'ship', img: 'backpack',
      name: { ro: 'Accesorii', en: 'Accessories' },
      blurb: { ro: 'Rucsaci, trepiede și echipament de teren.', en: 'Packs, shooting sticks and field gear.' },
      subs: [], facets: ['brand'] }
  ];

  const P = (o) => Object.assign({ stock: 2, online: true, badges: [], specs: [], variants: null }, o);

  const PRODUCTS = [
    // ——— Arme
    P({ id: 'tikka-t3x-hunter', cat: 'arme', sub: 'carabine', brand: 'Tikka', name: 'T3x Hunter', img: 'rifle-bolt', price: 6990, stock: 3,
        attrs: { calibre: '.308 Win', action: 'bolt', barrel: '57 cm' }, badges: ['bestseller'],
        specs: [['calibre', '.308 Win'], ['action', 'bolt'], ['barrel', '57 cm'], ['capacity', '3 + 1'], ['weight', '3,1 kg'], ['stock', 'wood']],
        desc: { ro: 'Carabina cu închizător rotativ pe care o aleg vânătorii când contează precizia. Pat din lemn de nuc, trăgaci reglabil și un închizător care alunecă lin, cu cursă scurtă.', en: 'The bolt-action rifle hunters reach for when precision matters. Walnut stock, adjustable trigger and a smooth, short-throw bolt.' } }),
    P({ id: 'sauer-100-classic-xt', cat: 'arme', sub: 'carabine', brand: 'Sauer', name: '100 Classic XT', img: 'rifle-bolt-synthetic', price: 5490, stock: 2,
        attrs: { calibre: '.30-06 Spr.', action: 'bolt', barrel: '56 cm' },
        specs: [['calibre', '.30-06 Spr.'], ['action', 'bolt'], ['barrel', '56 cm'], ['capacity', '5 + 1'], ['weight', '3,2 kg'], ['thread', 'M15×1'], ['stock', 'synthetic']],
        desc: { ro: 'Pat sintetic rezistent la intemperii, țeavă filetată la gură și siguranță cu trei poziții. O carabină de lucru, făcută pentru teren greu.', en: 'Weatherproof synthetic stock, threaded muzzle and a three-position safety. A working rifle built for rough country.' } }),
    P({ id: 'blaser-r8-professional', cat: 'arme', sub: 'carabine', brand: 'Blaser', name: 'R8 Professional', img: 'rifle-bolt', price: 21900, stock: 1,
        attrs: { calibre: '9,3×62', action: 'straight', barrel: '58 cm' }, badges: ['new'],
        specs: [['calibre', '9,3×62'], ['action', 'straight'], ['barrel', '58 cm'], ['capacity', '3 + 1'], ['weight', '3,2 kg'], ['stock', 'synthetic']],
        desc: { ro: 'Închizător liniar și țevi interschimbabile: o singură armă, mai multe calibre. Armarea manuală adaugă un plus de siguranță la pândă și la goană.', en: 'Straight-pull action with interchangeable barrels: one rifle, several calibres. Manual cocking adds safety on stalks and driven hunts.' } }),
    P({ id: 'cz-600-lux', cat: 'arme', sub: 'carabine', brand: 'CZ', name: '600 Lux', img: 'rifle-bolt', price: 7290, oldPrice: 7890, lowest30: 7890, stock: 2,
        attrs: { calibre: '7×64', action: 'bolt', barrel: '60 cm' },
        specs: [['calibre', '7×64'], ['action', 'bolt'], ['barrel', '60 cm'], ['capacity', '4 + 1'], ['weight', '3,4 kg'], ['stock', 'wood']],
        desc: { ro: 'Linie clasică, pat din nuc cu obrăzar bavarez și ochire mecanică (înălțător și cătare). Calibrul 7×64 rămâne o alegere sigură pentru căprior și mistreț.', en: 'Classic lines, walnut stock with Bavarian cheekpiece and open sights. The 7×64 remains a dependable choice for roe deer and boar.' } }),
    P({ id: 'beretta-686-silver-pigeon', cat: 'arme', sub: 'lisa', brand: 'Beretta', name: '686 Silver Pigeon I', img: 'shotgun-ou', price: 11900, stock: 2,
        attrs: { calibre: '12/76', action: 'ou', barrel: '71 cm' }, badges: ['bestseller'],
        specs: [['gauge', '12/76'], ['action', 'ou'], ['barrel', '71 cm'], ['chokes', 'Optima HP'], ['weight', '3,3 kg'], ['stock', 'wood']],
        desc: { ro: 'Superpusa italiană de referință: echilibru excelent, basculă gravată și șocuri interschimbabile pentru vânătoarea la goană sau la pasaj.', en: 'The benchmark Italian over-under: superb balance, engraved receiver and interchangeable chokes for driven game and passage shooting.' } }),
    P({ id: 'browning-b525-hunter', cat: 'arme', sub: 'lisa', brand: 'Browning', name: 'B525 Hunter Light', img: 'shotgun-ou', price: 9490, stock: 1,
        attrs: { calibre: '12/76', action: 'ou', barrel: '71 cm' },
        specs: [['gauge', '12/76'], ['action', 'ou'], ['barrel', '71 cm'], ['chokes', 'Invector+'], ['weight', '3,0 kg'], ['stock', 'wood']],
        desc: { ro: 'Bascula din aliaj ușor reduce greutatea pentru zilele lungi în teren, fără să sacrifice robustețea mecanismului B25.', en: 'An alloy receiver trims weight for long days afield without giving up the toughness of the B25 action.' } }),
    P({ id: 'benelli-montefeltro', cat: 'arme', sub: 'lisa', brand: 'Benelli', name: 'Montefeltro Silver', img: 'shotgun-semi', price: 8290, stock: 0,
        attrs: { calibre: '12/76', action: 'semi', barrel: '66 cm' },
        specs: [['gauge', '12/76'], ['action', 'semi'], ['barrel', '66 cm'], ['capacity', '2 + 1'], ['weight', '3,1 kg'], ['stock', 'wood']],
        desc: { ro: 'Semiautomată cu sistem inerțial: curată, fiabilă și rapidă. Ideală pentru vânătoarea de păsări.', en: 'Inertia-driven semi-auto: clean, reliable and quick to swing. Built for upland and waterfowl.' } }),

    // ——— Muniție
    P({ id: 'rws-evolution-308', cat: 'munitie', sub: 'glont', brand: 'RWS', name: 'Evolution .308 Win 11,0 g', img: 'ammo-box', price: 329, stock: 14,
        attrs: { calibre: '.308 Win', bulletType: 'bonded', qty: '20' },
        specs: [['calibre', '.308 Win'], ['bulletWeight', '11,0 g / 170 gr'], ['bulletType', 'bonded'], ['qty', '20']],
        desc: { ro: 'Glonț cu deformare controlată și retenție mare de masă, pentru vânat mare la distanțe medii.', en: 'Controlled-expansion bullet with high weight retention for big game at medium range.' } }),
    P({ id: 'norma-oryx-3006', cat: 'munitie', sub: 'glont', brand: 'Norma', name: 'Oryx .30-06 Spr. 11,7 g', img: 'ammo-box', price: 279, stock: 9,
        attrs: { calibre: '.30-06 Spr.', bulletType: 'bonded', qty: '20' },
        specs: [['calibre', '.30-06 Spr.'], ['bulletWeight', '11,7 g / 180 gr'], ['bulletType', 'bonded'], ['qty', '20']],
        desc: { ro: 'Miez lipit de cămașă pentru penetrare adâncă. Un clasic pentru mistreț și cerb.', en: 'Bonded core for deep penetration. A classic for boar and red deer.' } }),
    P({ id: 'hornady-precision-hunter-65', cat: 'munitie', sub: 'glont', brand: 'Hornady', name: 'Precision Hunter 6.5 Creedmoor 143 gr', img: 'ammo-box', price: 299, stock: 6, badges: ['new'],
        attrs: { calibre: '6.5 Creedmoor', bulletType: 'polymer', qty: '20' },
        specs: [['calibre', '6.5 Creedmoor'], ['bulletWeight', '9,3 g / 143 gr'], ['bulletType', 'polymer'], ['qty', '20']],
        desc: { ro: 'Glonț ELD-X cu coeficient balistic ridicat, pentru focuri precise la distanțe mari.', en: 'High-BC ELD-X bullet for long, precise shots.' } }),
    P({ id: 'fiocchi-caccia-12-32', cat: 'munitie', sub: 'alice', brand: 'Fiocchi', name: 'Caccia 12/70 32 g nr. 5', img: 'shotshells', price: 89, stock: 30,
        attrs: { calibre: '12/70', bulletType: 'lead', qty: '25' },
        specs: [['gauge', '12/70'], ['load', '32 g'], ['shot', '5 (3,0 mm)'], ['qty', '25']],
        desc: { ro: 'Cartușe cu alice pentru fazan, rață și iepure. Grupaj uniform, recul moderat.', en: 'Shotshells for pheasant, duck and hare. Consistent pattern, moderate recoil.' } }),

    // ——— Optică
    P({ id: 'swarovski-z8i-2-3-18x56', cat: 'optica', sub: 'lunete', brand: 'Swarovski Optik', name: 'Z8i 2,3–18×56 P', img: 'scope', price: 14900, stock: 1, badges: ['bestseller'],
        attrs: { magnification: '2,3–18×', illuminated: 'yes' },
        specs: [['magnification', '2,3–18×'], ['objective', '56 mm'], ['tube', '30 mm'], ['reticle', '4A-I'], ['illuminated', 'yes'], ['plane', 'SFP']],
        desc: { ro: 'Zoom 8× și transmisie excepțională a luminii: de la goană în pădure la pândă la amurg, cu aceeași lunetă.', en: '8× zoom and exceptional light transmission: from driven hunts in the woods to dusk stalks with one scope.' } }),
    P({ id: 'zeiss-conquest-v4-3-12x56', cat: 'optica', sub: 'lunete', brand: 'Zeiss', name: 'Conquest V4 3–12×56', img: 'scope', price: 5490, oldPrice: 5990, lowest30: 5990, stock: 4,
        attrs: { magnification: '3–12×', illuminated: 'yes' },
        specs: [['magnification', '3–12×'], ['objective', '56 mm'], ['tube', '30 mm'], ['reticle', '60'], ['illuminated', 'yes'], ['plane', 'SFP']],
        desc: { ro: 'Obiectiv de 56 mm pentru lumină slabă și reticul iluminat cu punct fin. Un raport calitate-preț greu de egalat.', en: '56 mm objective for low light and a fine illuminated dot. Hard-to-beat value.' } }),
    P({ id: 'meopta-meostar-r2-2-5-15x56', cat: 'optica', sub: 'lunete', brand: 'Meopta', name: 'MeoStar R2 2,5–15×56 RD', img: 'scope', price: 6290, stock: 2,
        attrs: { magnification: '2,5–15×', illuminated: 'yes' },
        specs: [['magnification', '2,5–15×'], ['objective', '56 mm'], ['tube', '30 mm'], ['reticle', '4C RD'], ['illuminated', 'yes'], ['plane', 'SFP']],
        desc: { ro: 'Optică cehă de top, cu punct roșu iluminat și carcasă robustă, testată la recul puternic.', en: 'Top Czech glass with an illuminated red dot and a rugged, recoil-proven body.' } }),
    P({ id: 'swarovski-el-10x42', cat: 'optica', sub: 'binocluri', brand: 'Swarovski Optik', name: 'EL 10×42', img: 'binoculars', price: 10990, stock: 1,
        attrs: { magnification: '10×', illuminated: 'no' },
        specs: [['magnification', '10×'], ['objective', '42 mm'], ['prism', 'roof'], ['weight', '0,84 kg']],
        desc: { ro: 'Binoclul de referință pentru observarea vânatului: imagine clară până la margine și ergonomie fără cusur.', en: 'The reference binocular for game spotting: edge-to-edge sharpness and faultless ergonomics.' } }),
    P({ id: 'pulsar-axion-2-xq35-lrf', cat: 'optica', sub: 'termo', brand: 'Pulsar', name: 'Axion 2 XQ35 LRF', img: 'thermal', price: 7490, stock: 3, badges: ['new'],
        attrs: { magnification: '2,5–10×', illuminated: 'no' },
        specs: [['sensor', '384 × 288'], ['rangefinder', 'yes'], ['weight', '0,32 kg']],
        desc: { ro: 'Monocular termic compact cu telemetru integrat. Detectează și măsoară distanța într-un singur gest.', en: 'Compact thermal monocular with built-in rangefinder. Detect and range in one move.' } }),
    P({ id: 'leica-rangemaster-crf-2800', cat: 'optica', sub: 'telemetre', brand: 'Leica', name: 'Rangemaster CRF 2800.COM', img: 'rangefinder', price: 3490, stock: 2,
        attrs: { magnification: '7×', illuminated: 'no' },
        specs: [['magnification', '7×'], ['objective', '24 mm'], ['app', 'Bluetooth']],
        desc: { ro: 'Telemetru cu calcul balistic și conexiune Bluetooth la aplicația de pe telefon.', en: 'Rangefinder with ballistic calculation and Bluetooth link to the phone app.' } }),

    // ——— Aer comprimat
    P({ id: 'diana-panther-21', cat: 'aer', brand: 'Diana', name: 'Panther 21 4,5 mm', img: 'airgun', price: 899, stock: 5,
        attrs: { calibre: '4,5 mm' },
        specs: [['calibre', '4,5 mm'], ['action', 'break'], ['velocity', '≤ 220 m/s'], ['class', 'C'], ['weight', '3,0 kg']],
        desc: { ro: 'Armă cu aer comprimat cu țeavă basculantă, ușor de folosit, pentru tir la țintă în poligon.', en: 'Easy-to-use break-barrel air rifle for target shooting at the range.' } }),

    // ——— Cuțite
    P({ id: 'fallkniven-f1', cat: 'cutite', brand: 'Fällkniven', name: 'F1 Survival', img: 'knife', price: 899, stock: 4,
        attrs: { steel: 'laminated' },
        specs: [['blade', '9,7 cm'], ['steel', 'laminated'], ['sheath', 'zytel']],
        desc: { ro: 'Cuțitul de supraviețuire al piloților suedezi: lamă scurtă, extrem de robustă, ușor de ascuțit.', en: 'The Swedish Air Force survival knife: short, extremely tough blade that sharpens easily.' } }),
    P({ id: 'mora-kansbol', cat: 'cutite', brand: 'Morakniv', name: 'Kansbol', img: 'knife', price: 189, stock: 12,
        attrs: { steel: 'stainless' },
        specs: [['blade', '10,9 cm'], ['steel', 'stainless'], ['sheath', 'polymer']],
        desc: { ro: 'Cuțit de teren ușor, ideal pentru eviscerare și treburi de tabără.', en: 'Light field knife, ideal for dressing game and camp chores.' } }),

    // ——— Îmbrăcăminte
    P({ id: 'harkila-pro-hunter-jacket', cat: 'imbracaminte', sub: 'geci', brand: 'Härkila', name: 'Pro Hunter GTX Jacket', img: 'jacket', price: 3490, stock: 6,
        attrs: { season: 'all', membrane: 'goretex' }, variants: ['48', '50', '52', '54', '56', '58'],
        specs: [['membrane', 'goretex'], ['season', 'all'], ['fabric', 'silent']],
        desc: { ro: 'Geacă impermeabilă și silențioasă, cu buzunare pentru cartușe și guler înalt care oprește vântul.', en: 'Waterproof, silent jacket with cartridge pockets and a high collar for wind.' } }),
    P({ id: 'deerhunter-strike-trousers', cat: 'imbracaminte', sub: 'pantaloni', brand: 'Deerhunter', name: 'Strike Trousers', img: 'trousers', price: 599, stock: 8,
        attrs: { season: 'summer', membrane: 'none' }, variants: ['46', '48', '50', '52', '54', '56'],
        specs: [['season', 'summer'], ['fabric', 'stretch']],
        desc: { ro: 'Pantaloni elastici și respirabili pentru pânda de vară și deplasări lungi.', en: 'Stretchy, breathable trousers for summer stalks and long walks.' } }),
    P({ id: 'harkila-pro-hunter-cap', cat: 'imbracaminte', sub: 'sepci', brand: 'Härkila', name: 'Pro Hunter Cap', img: 'cap', price: 249, stock: 10,
        attrs: { season: 'all', membrane: 'goretex' }, variants: ['S/M', 'L/XL'],
        specs: [['membrane', 'goretex'], ['season', 'all']],
        desc: { ro: 'Șapcă impermeabilă cu apărători de urechi pliabile.', en: 'Waterproof cap with fold-down ear flaps.' } }),

    // ——— Încălțăminte
    P({ id: 'meindl-kansas-gtx', cat: 'incaltaminte', brand: 'Meindl', name: 'Kansas GTX', img: 'boots', price: 1590, stock: 5, badges: ['bestseller'],
        attrs: { membrane: 'goretex', height: 'high' }, variants: ['40', '41', '42', '43', '44', '45', '46', '47'],
        specs: [['membrane', 'goretex'], ['height', 'high'], ['upper', 'leather'], ['sole', 'Vibram']],
        desc: { ro: 'Bocanc înalt din piele, impermeabil, cu talpă Vibram pentru pante abrupte și teren umed.', en: 'High leather boot, waterproof, with a Vibram sole for steep, wet ground.' } }),
    P({ id: 'lowa-renegade-gtx-mid', cat: 'incaltaminte', brand: 'Lowa', name: 'Renegade GTX Mid', img: 'boots', price: 1290, stock: 7,
        attrs: { membrane: 'goretex', height: 'mid' }, variants: ['40', '41', '42', '43', '44', '45', '46'],
        specs: [['membrane', 'goretex'], ['height', 'mid'], ['upper', 'leather'], ['sole', 'Vibram']],
        desc: { ro: 'Bocancul de drumeție comod din prima zi. Ușor și stabil.', en: 'The hiking boot that is comfortable from day one. Light and supportive.' } }),

    // ——— Accesorii
    P({ id: 'ba-ridge-32-backpack', cat: 'accesorii', brand: 'Bistrița Alpină', name: 'Ridge 32 L Backpack', img: 'backpack', price: 449, stock: 9, badges: ['new'],
        specs: [['volume', '32 L'], ['fabric', 'silent'], ['weight', '1,2 kg']],
        desc: { ro: 'Rucsacul casei: material silențios, suport pentru armă și buzunar pentru sistemul de hidratare.', en: 'Our house pack: silent fabric, rifle carrier and a hydration sleeve.' } }),
    P({ id: 'primos-trigger-stick-gen3', cat: 'accesorii', brand: 'Primos', name: 'Trigger Stick Gen 3 Tall Tripod', img: 'tripod', price: 899, stock: 3,
        specs: [['height', '61–157 cm'], ['legs', '3']],
        desc: { ro: 'Trepied de tragere reglabil cu o singură mână. Stabilitate la pândă și la apropiere.', en: 'One-hand adjustable shooting tripod. Steady on the stand and when stalking.' } })
  ];

  // Romanian counties for the checkout address form.
  const COUNTIES = ['Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'];

  // Example orders for the owner dashboard (fictional, marked as demo in the UI).
  const ORDERS = [
    { id: 'BA-10421', date: '2026-10-11 09:12', name: 'Exemplu — Andrei M.', city: 'Cluj-Napoca', status: 'docs', type: 'reserve', total: 6990, items: [['tikka-t3x-hunter', 1]], permit: 'Seria A nr. 000000', docs: ['autorizatie-procurare.pdf'] },
    { id: 'BA-10420', date: '2026-10-11 08:40', name: 'Exemplu — Ioana P.', city: 'Bistrița', status: 'new', type: 'ship', total: 1838, items: [['meindl-kansas-gtx', 1], ['harkila-pro-hunter-cap', 1]], courier: 'Fan Courier' },
    { id: 'BA-10419', date: '2026-10-10 18:05', name: 'Exemplu — Mihai R.', city: 'Târgu Mureș', status: 'ready', type: 'ship', total: 5490, items: [['zeiss-conquest-v4-3-12x56', 1]], courier: 'Sameday easybox' },
    { id: 'BA-10418', date: '2026-10-10 15:31', name: 'Exemplu — Radu C.', city: 'Bistrița', status: 'pickup', type: 'reserve', total: 658, items: [['rws-evolution-308', 2]], permit: 'Seria A nr. 000000', docs: ['permis.jpg'] },
    { id: 'BA-10417', date: '2026-10-09 11:02', name: 'Exemplu — Elena D.', city: 'Suceava', status: 'shipped', type: 'ship', total: 3490, items: [['harkila-pro-hunter-jacket', 1]], courier: 'Fan Courier', awb: '2150000000' }
  ];

  return { STORE, CATEGORIES, PRODUCTS, COUNTIES, ORDERS };
})();
