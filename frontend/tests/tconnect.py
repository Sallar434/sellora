"""Sign in through the API and confirm a new store has no seeded demo records."""
import os, time, urllib.request
from playwright.sync_api import sync_playwright
API = 'http://127.0.0.1:4017'
WEB = 'http://127.0.0.1:4173/sellora.html'
for _ in range(40):
    try:
        urllib.request.urlopen(API + '/health', timeout=1)
        break
    except Exception:
        time.sleep(0.25)
else:
    raise SystemExit('API did not start')
R = []
def ok(n, c, d=''):
    R.append(bool(c))
    print(('PASS ' if c else 'FAIL ') + n + ((' :: ' + str(d)[:300]) if d and not c else ''), flush=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 800})
    pg.add_init_script("window.SELLORA_API=%r" % API)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:240]))
    pg.goto(WEB)
    pg.wait_for_timeout(600)
    pg.click('#door-up')
    pg.fill('#a2', 'fresh-connect@example.com')
    pg.fill('#a3', 'password123')
    pg.click('#ab')
    pg.wait_for_timeout(400)
    pg.click('[data-m13p=basic]')
    pg.wait_for_timeout(200)
    pg.fill('#a1', 'Fresh Connect')
    pg.click('#ab')
    pg.wait_for_timeout(1200)
    text = pg.inner_text('body')
    ok('signed into the named store', 'Fresh Connect' in text, text[:180])
    for banned in ['Ayesha Khan', 'Usman Ghani', 'Fatima Noor', 'Race Day Gloves', '61.8%', 'Sessions 34']:
        ok('no demo text ' + banned, banned not in text)
    ok('sessions are not a number', 'Not connected' in text or 'Sessions' not in pg.inner_text('#main'))
    stored = pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('sellora')||'{}'))")
    ok('password is not in localStorage', 'password123' not in stored)
    ok('no page errors', not errs, errs[:2])
    os.makedirs('/opt/cursor/artifacts', exist_ok=True)
    pg.screenshot(path='/opt/cursor/artifacts/fresh-account.png', full_page=False)
    b.close()
print('%d/%d passed' % (sum(R), len(R)))
raise SystemExit(0 if all(R) else 1)
