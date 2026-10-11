"""Build dist/bistrita-alpina-prototip.html: the whole prototype in one file (CSS, JS and SVG art inlined)."""
import base64, json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE, OUT = ROOT / 'site', ROOT / 'dist' / 'bistrita-alpina-prototip.html'

def data_uri(p):
    return 'data:image/svg+xml;base64,' + base64.b64encode(p.read_bytes()).decode()

html = (SITE / 'index.html').read_text(encoding='utf-8')
css = (SITE / 'css' / 'app.css').read_text(encoding='utf-8').replace("url('../assets/logo-mark.svg')", "url('" + data_uri(SITE / 'assets' / 'logo-mark.svg') + "')")
assets = {f'assets/products/{p.name}': data_uri(p) for p in sorted((SITE / 'assets' / 'products').glob('*.svg'))}
hero = re.sub(r'<\?xml[^>]*>', '', (SITE / 'assets' / 'hero.svg').read_text(encoding='utf-8'))
html = html.replace('<link rel="stylesheet" href="css/app.css">', '<style>\n' + css + '\n</style>')
boot = '<script>window.BA_ASSETS=' + json.dumps(assets) + ';window.BA_HERO=' + json.dumps(hero) + ';</script>\n'
def inline(m):
    return '<script>\n' + (SITE / m.group(1)).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>'
first = html.index('<script src=')
html = html[:first] + boot + html[first:]
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline, html)
OUT.write_text('<!doctype html>\n<html lang="ro">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>[hidden]{display:none!important}</style>\n</head>\n<body>\n' + html + '\n</body>\n</html>\n', encoding='utf-8')
print(OUT, round(OUT.stat().st_size / 1024), 'KB')
