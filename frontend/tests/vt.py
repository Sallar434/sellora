"""Shared helpers for the VendOm Playwright suites.

Run from anywhere: python3 frontend/tests/<suite>.py [path/to/vendom.html]
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].endswith('.html') else os.path.join(HERE, '..', 'vendom.html')
URL = 'file://' + os.path.abspath(APP)
R = []

def ok(name, cond, detail=''):
    R.append((name, bool(cond)))
    print(('PASS ' if cond else 'FAIL ') + name + ((' :: ' + str(detail)[:300]) if detail and not cond else ''), flush=True)
    return bool(cond)

def launch(p, **kw):
    b = p.chromium.launch()
    pg = b.new_page(viewport=kw.pop('viewport', {'width': 1400, 'height': 900}), accept_downloads=True, **kw)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('dialog', lambda d: d.accept())
    return b, pg, errs

def signup(pg, email='owner@example.com', store='Parity Shop', plan='advanced'):
    """Create a store through the public onboarding: landing → email + password → email code → plan → (skip payment) → goals → name the store on Home."""
    pg.goto(URL); pg.wait_for_timeout(800)
    pg.click('#door-up'); pg.wait_for_timeout(200)
    pg.fill('#a2', email); pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(400)
    verify_email(pg, email)
    pg.click('[data-m13p=%s]' % plan); pg.wait_for_timeout(300)
    pg.click('#ob-skip'); pg.wait_for_timeout(200)          # payment can wait until the trial ends
    pg.click('#ab'); pg.wait_for_timeout(900)               # "What can we help you do?" → Continue
    if store and store != 'My Store':
        pg.evaluate("location.hash='home'"); pg.wait_for_timeout(300)
        pg.click('#home-name'); pg.fill('#home-name-in', store); pg.click('#home-name-save'); pg.wait_for_timeout(300)

def verify_email(pg, email):
    code = pg.evaluate("e=>DB.ver[e].code", email.lower())
    pg.fill('#a-code', code); pg.click('#ab'); pg.wait_for_timeout(400)

def go(pg, route, wait=350):
    pg.evaluate("location.hash=%r" % route); pg.wait_for_timeout(wait)

def done(errs=()):
    if errs: print('page errors:', errs)
    n = sum(1 for _, c in R if c)
    print('%d/%d passed' % (n, len(R)))
    sys.exit(0 if n == len(R) and not errs else 1)

import hashlib, json as _json
_PW = hashlib.sha256(b'password123').hexdigest()

def open_app(pg, url=None, email='owner@example.com'):
    """Go to the app; if nobody is signed in, sign in to the built-in demo store (Vellacorsa)."""
    url = url or URL
    pg.goto(url); pg.wait_for_timeout(700)
    if pg.evaluate("typeof U!=='undefined'&&!!U"):
        return
    pg.evaluate("""([e,h])=>{var s=DB.d[e]||JSON.parse(TPL);var now=Date.now();
      DB.a[e]=h;DB.d[e]=s;DB.session=e;DB.s=e;delete DB.out;persist()}""", [email, _PW])
    pg.goto(url); pg.reload(); pg.wait_for_timeout(900)

def path_url(name):
    return 'file://' + os.path.abspath(os.path.join(HERE, '..', name))

def finish_store(pg, name=None):
    """After the plan: skip payment, continue past goals, then name the store on Home."""
    pg.click('#ob-skip'); pg.wait_for_timeout(200)
    pg.click('#ab'); pg.wait_for_timeout(900)
    if name and name != 'My Store':
        pg.evaluate("location.hash='home'"); pg.wait_for_timeout(300)
        pg.click('#home-name'); pg.fill('#home-name-in', name); pg.click('#home-name-save'); pg.wait_for_timeout(300)
