"""Public door: sign in / create account, no auto-opened admin, local store claim."""
import json, os, time
from playwright.sync_api import sync_playwright

F = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sellora.html'))
R = []
def ok(n, c, d=''):
    R.append(bool(c))
    print(('PASS ' if c else 'FAIL ') + n + ((' :: ' + str(d)[:300]) if d and not c else ''), flush=True)

NOW = int(time.time() * 1000)
STORE = {
    'name': 'Vellacorsa', 'email': 'owner@example.com', 'country': 'Pakistan', 'cur': 'USD', 'plan': 'Grow',
    'rates': {'USD': 1, 'PKR': 280, 'EUR': .92, 'AED': 3.67, 'GBP': .79},
    'sym': {'USD': '$', 'PKR': 'Rs ', 'EUR': '€', 'AED': 'AED ', 'GBP': '£'},
    'products': [{'id': 9, 'name': 'Heritage Glove', 'price': 48, 'stock': 4, 'status': 'Active', 'desc': 'Kept from this browser.'}],
    'orders': [{'id': 1001, 'who': 'Ayesha Khan', 'total': 48, 'st': 'Paid', 'gw': 'Sellora Pay'}],
    'nid': 10, 'oid': 1004,
    'sub9': {'plan': 'grow', 'status': 'trialing', 'trialEnds': NOW + 4 * 86400000, 'start': NOW, 'interval': 'monthly', 'cur': 'PKR'},
    'online': {'password': True, 'live': False},
}
DB = {'a': {}, 's': 'owner@example.com', 'd': {'owner@example.com': STORE}}

def body(pg):
    return pg.inner_text('body')

def seed(pg, db):
    pg.goto(F); pg.wait_for_timeout(400)
    pg.evaluate("db=>localStorage.setItem('sellora', db)", json.dumps(db))
    pg.reload(); pg.wait_for_timeout(800)

with sync_playwright() as p:
    b = p.chromium.launch()
    # --- anonymous visitor, empty browser ---
    pg = b.new_page(viewport={'width': 1280, 'height': 800})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:240]))
    pg.goto(F); pg.wait_for_timeout(900)
    t = body(pg)
    ok('door shows Sign in and Create account', 'Sign in' in t and 'Create account' in t, t[:180])
    ok('auth overlay visible', pg.locator('#auth').is_visible() and pg.locator('#door-in').is_visible() and pg.locator('#door-up').is_visible())
    ok('admin shell hidden', not pg.locator('aside').is_visible())
    ok('no store name on the door', 'Vellacorsa' not in t and 'Heritage Glove' not in t)
    ok('no trial banner or view-as pill', 'Free trial' not in t and 'Viewing as' not in t and 'Grow' not in t)
    ok('empty browser does not write a store', pg.evaluate("localStorage.getItem('sellora')") in (None, 'null'))
    # short password
    pg.click('#door-up'); pg.wait_for_timeout(200)
    pg.fill('#a2', 'new@example.com'); pg.fill('#a3', 'short'); pg.click('#ab'); pg.wait_for_timeout(200)
    ok('short password rejected', '8 characters' in (pg.locator('#ae').inner_text() if pg.locator('#ae').count() else ''))
    # new account on a clean browser starts onboarding, not someone else's admin
    pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(500)
    ok('clean create account opens plan picker', pg.locator('.m13pick').count() == 1 and 'Vellacorsa' not in body(pg))
    ok('plans in Pakistani Rupee (PKR)', 'Pakistani Rupee (PKR)' in body(pg) and 'Basic' in body(pg) and 'Grow' in body(pg))
    pg.click('[data-m13p=grow]'); pg.wait_for_timeout(300)
    ok('store name step', pg.locator('#a1').count() == 1 and 'Grow' in pg.inner_text('#m13chosen'))
    pg.fill('#a1', 'Fresh Shop'); pg.click('#ab'); pg.wait_for_timeout(900)
    ok('own store admin', pg.evaluate('S.name') == 'Fresh Shop' and pg.evaluate('U') == 'new@example.com' and 'Fresh Shop' in body(pg))
    ok('trial started', pg.evaluate("S.sub9&&S.sub9.status==='trialing'&&S.sub9.plan==='grow'"))
    ok('trial banner after login', 'Free trial' in body(pg) and 'Grow' in body(pg))
    ok('did not inherit heritage product', not pg.evaluate("!!(S.products||[]).some(p=>p.name==='Heritage Glove')"))
    # theme library still opens
    pg.evaluate("location.hash='themes'"); pg.wait_for_timeout(700)
    th = body(pg)
    ok('themes page after login', 'Daybreak' in th or 'Online Store' in th or pg.locator('[data-te], [data-tp]').count() > 0, th[:200])
    pg.click('#so'); pg.wait_for_timeout(400)
    ok('sign out returns to the door', pg.locator('#door-in').is_visible() and 'Fresh Shop' not in body(pg))
    pg.reload(); pg.wait_for_timeout(800)
    ok('stays signed out after refresh', pg.locator('#door-in').is_visible() and 'Fresh Shop' not in body(pg) and not pg.evaluate('!!U'))
    ok('fresh shop kept for its account', pg.evaluate("(JSON.parse(localStorage.getItem('sellora')).d['new@example.com']||{}).name")=='Fresh Shop')
    pg.close()

    # --- browser that already has an unowned Vellacorsa store ---
    ctx = b.new_context(viewport={'width': 1280, 'height': 800})
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)[:240]))
    seed(pg, DB)
    t = body(pg)
    ok('unowned store stays behind the door', 'Sign in' in t and 'Create account' in t and 'Vellacorsa' not in t and 'Heritage Glove' not in t and 'Viewing as' not in t)
    ok('store data still in localStorage', pg.evaluate("JSON.parse(localStorage.getItem('sellora')).d['owner@example.com'].products[0].name")=='Heritage Glove')
    pg.click('#door-in'); pg.wait_for_timeout(200)
    pg.fill('#a2', 'owner@real.test'); pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(300)
    ok('sign in without an account fails', 'incorrect' in pg.locator('#ae').inner_text().lower() and 'Vellacorsa' not in body(pg))
    pg.click('#asw'); pg.wait_for_timeout(200)
    pg.fill('#a2', 'owner@real.test'); pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(1000)
    ok('first account claims the local store', pg.evaluate('S.name')=='Vellacorsa' and pg.evaluate("S.products.some(p=>p.name==='Heritage Glove')") and 'Vellacorsa' in body(pg))
    ok('claimed trial still Grow', pg.evaluate("S.sub9&&S.sub9.plan==='grow'&&S.sub9.status==='trialing'") and 'Grow' in body(pg))
    ok('session stored on that email', pg.evaluate("JSON.parse(localStorage.getItem('sellora')).session")=='owner@real.test')
    pg.click('#so'); pg.wait_for_timeout(400)
    pg.reload(); pg.wait_for_timeout(800)
    ok('signed-out refresh hides Vellacorsa', pg.locator('#door-in').is_visible() and 'Vellacorsa' not in body(pg) and 'Heritage Glove' not in body(pg))
    pg.click('#door-in'); pg.fill('#a2', 'owner@real.test'); pg.fill('#a3', 'nope-nope'); pg.click('#ab'); pg.wait_for_timeout(300)
    ok('wrong password stays out', 'incorrect' in pg.locator('#ae').inner_text().lower() and 'Vellacorsa' not in body(pg))
    pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(900)
    ok('sign in restores only that store', pg.evaluate('S.name')=='Vellacorsa' and pg.evaluate('U')=='owner@real.test')
    pg.click('#so'); pg.wait_for_timeout(300)
    pg.click('#door-up'); pg.wait_for_timeout(200)
    pg.fill('#a2', 'other@real.test'); pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(500)
    ok('second account gets plan picker, not Vellacorsa', pg.locator('.m13pick').count()==1 and 'Vellacorsa' not in body(pg) and 'Heritage Glove' not in body(pg))
    pg.click('[data-m13p=basic]'); pg.wait_for_timeout(250)
    pg.fill('#a1', 'Other Shop'); pg.click('#ab'); pg.wait_for_timeout(900)
    ok('second store is its own', pg.evaluate('S.name')=='Other Shop' and not pg.evaluate("S.products.some(p=>p.name==='Heritage Glove')"))
    ok('vellacorsa still saved for the first account', pg.evaluate("(JSON.parse(localStorage.getItem('sellora')).d['owner@real.test'].products||[]).some(p=>p.name==='Heritage Glove')"))
    pg.click('#so'); pg.wait_for_timeout(300)
    pg.click('#door-in'); pg.fill('#a2', 'owner@real.test'); pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(900)
    ok('first account still has Vellacorsa', pg.evaluate('S.name')=='Vellacorsa' and pg.evaluate("S.products.some(p=>p.name==='Heritage Glove')"))
    # theme editor opens
    pg.evaluate("location.hash='themes'"); pg.wait_for_timeout(800)
    if pg.locator('[data-te]').count():
        pg.locator('[data-te]').first.click(); pg.wait_for_timeout(500)
        ok('theme editor opens', pg.locator('#ov').is_visible() or 'Customize' in body(pg) or pg.locator('#edl, .ec, #ep').count()>0)
    else:
        ok('theme editor control present', 'Customize' in body(pg) or pg.locator('[data-tp]').count()>0, body(pg)[:220])
    ok('no page errors', not errs, errs[:4])
    b.close()

print('%d/%d passed' % (sum(R), len(R)))
raise SystemExit(0 if all(R) else 1)
