"""VendOm AI bar (v59): one bar for typing, voice typing, voice messages and talk mode; conversation panel; Home ask box and old mic removed."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1280, 'height': 900}); E = pg.evaluate
    vt.signup(pg, email='ai39@x.pk', store='Noor Lawn')
    go(pg, 'home', 800)
    ok('Home ask box is gone', not pg.locator('#main .ask').is_visible())
    ok('old floating mic is gone', not pg.locator('#vmic').is_visible())
    ok('one AI bar with type, mic, record, talk and send', all(pg.locator(s).is_visible() for s in ['#ai36q', '#ai36mic', '#ai36rec', '#ai36talk', '.ai36go']))
    pg.click('#ai36q'); pg.wait_for_timeout(200)
    ok('focusing the bar opens the conversation with tips', pg.locator('#ai36p').is_visible() and 'add a product' in pg.inner_text('#ai36p'))
    pg.fill('#ai36q', 'add a product called Lawn Kurta for 40'); pg.press('#ai36q', 'Enter'); pg.wait_for_timeout(800)
    ok('typed request runs: product created', E("S.products.some(p=>/lawn kurta/i.test(p.name))"), E("S.products.map(p=>p.name)"))
    ok('conversation shows the request and the reply', 'Lawn Kurta' in pg.inner_text('#ai36log') and pg.locator('.ai36m.a').count() >= 1)
    pg.fill('#ai36q', 'go to orders'); pg.press('#ai36q', 'Enter'); pg.wait_for_timeout(800)
    ok('navigation requests work', E("location.hash") == '#orders')
    pg.click('#ai36mic'); pg.wait_for_timeout(300)
    ok('mic gives voice typing or a clear message', pg.inner_text('#ai36s') != '' or E("document.querySelector('#ai36mic').getAttribute('aria-pressed')") == 'true')
    pg.click('#ai36clr'); pg.wait_for_timeout(200)
    ok('Clear empties the conversation', pg.locator('.ai36m').count() == 0)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    ok('Escape closes the panel', not pg.locator('#ai36p').is_visible())
    pg.set_viewport_size({'width': 390, 'height': 844}); go(pg, 'home', 600)
    ok('AI bar is on phones too and fits', pg.locator('#ai36q').is_visible() and E("document.documentElement.scrollWidth<=392"))
    b.close()
vt.done(errs)
