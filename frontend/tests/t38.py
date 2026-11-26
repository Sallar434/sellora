"""Online Store page (v58): title, Public/Private status, View store, live theme preview with domain and Edit theme, Schedule changes card."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1280, 'height': 900}); E = pg.evaluate
    vt.signup(pg, email='os38@x.pk', store='Noor Lawn')
    go(pg, 'themes', 1200)
    ok('title is Online Store', E("document.querySelector('.v21p .xh h1').textContent") == 'Online Store')
    ok('status menu shows Private during the trial', E("document.querySelector('#os35s').value") == 'private')
    ok('header has View store', 'View store' in pg.inner_text('.v21p .xh'))
    ok('preview shows the domain and theme', 'noorlawn.vendom.app' in pg.inner_text('.os35meta'))
    btn = pg.locator('.os35cur button:has-text("Edit theme")')
    ok('Edit theme is readable', btn.count() == 1 and E("getComputedStyle(document.querySelector('.os35cur .v21acts .btn.pri')).color") == 'rgb(17, 17, 17)')
    pg.click('#os35sch button'); pg.wait_for_timeout(500)
    ok('Schedule changes opens Rollouts', E("location.hash") == '#markets-rollouts')
    go(pg, 'themes', 900); btn = pg.locator('.os35cur button:has-text("Edit theme")'); btn.click(); pg.wait_for_timeout(1200)
    ok('Edit theme opens the theme editor', 'Hero banner' in pg.inner_text('body') or 'Header' in pg.inner_text('body'))
    b.close()
vt.done(errs)
