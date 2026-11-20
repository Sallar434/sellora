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
    """Open the app and create a store through the Sign in / Create account door."""
    pg.goto(URL); pg.wait_for_timeout(800)
    pg.click('#door-up'); pg.wait_for_timeout(200)
    pg.fill('#a2', email); pg.fill('#a3', 'password123'); pg.click('#ab'); pg.wait_for_timeout(400)
    pg.click('[data-m13p=%s]' % plan); pg.wait_for_timeout(300)
    pg.fill('#a1', store); pg.click('#ab'); pg.wait_for_timeout(900)

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
