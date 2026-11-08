"""Click the admin links a new seller can see and record empty or broken pages."""
import os, json
from playwright.sync_api import sync_playwright
F = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sellora.html'))
rows = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 800})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:180]))
    pg.goto(F)
    pg.wait_for_timeout(500)
    pg.click('#door-up')
    pg.fill('#a2', 'nav18@example.com')
    pg.fill('#a3', 'password123')
    pg.click('#ab')
    pg.wait_for_timeout(250)
    pg.click('[data-m13p=basic]')
    pg.fill('#a1', 'Nav Shop')
    pg.click('#ab')
    pg.wait_for_timeout(700)
    ids = pg.evaluate("""() => {
      var out=[];
      document.querySelectorAll('#nav a, #nav button, [data-r]').forEach(function(el){
        var id=el.getAttribute('data-r')||el.getAttribute('data-x')||(el.getAttribute('href')||'').replace('#','');
        var label=(el.innerText||'').trim().slice(0,60);
        if(id&&label) out.push({id:id,label:label});
      });
      var seen={}; return out.filter(function(x){if(seen[x.id])return false; seen[x.id]=1; return true});
    }""")
    for item in ids:
        before = len(errs)
        pg.evaluate("(id) => { location.hash=id }", item['id'])
        pg.wait_for_timeout(180)
        info = pg.evaluate("""() => {
          var main=document.querySelector('#main');
          var text=(main&&main.innerText||'').replace(/\\s+/g,' ').trim();
          return {len:text.length, text:text.slice(0,140), hash:location.hash, missing:!!(main&&/Page not found/.test(main.innerText))};
        }""")
        rows.append({'id': item['id'], 'label': item['label'], 'len': info['len'], 'missing': info['missing'], 'error': errs[before:before+1], 'sample': info['text']})
    pg.screenshot(path='/opt/cursor/artifacts/setup-desktop.png', full_page=False)
    b.close()
bad = [r for r in rows if r['missing'] or r['len']<20 or r['error']]
print('LINKS', len(rows), 'THIN_OR_MISSING', len(bad))
for r in bad:
    print('BAD', r['id'], r['label'], r['len'], r['missing'], r['error'], r['sample'][:80])
json.dump({'count': len(rows), 'bad': bad, 'rows': rows}, open('/tmp/nav-audit.json','w'), indent=2)
print('errors', errs[:6])
