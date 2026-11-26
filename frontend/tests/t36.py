"""Customers (v56): Add customer opens a full New customer page with overview, language, phone code, consent, address, tax, notes, tags and a save bar; pop-ups close on page change."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1280, 'height': 900}); E = pg.evaluate
    vt.signup(pg, email='cu36@x.pk', store='Noor Lawn')
    E("CU.add({first:'Old',last:'One',email:'old@x.pk'});save()")
    go(pg, 'home', 300); go(pg, 'customers', 700)
    pg.click('#main button:has-text("Add customer") >> nth=0'); pg.wait_for_timeout(600)
    ok('Add customer opens the New customer page', E("location.hash") == '#customers-new' and 'New customer' in pg.inner_text('#main'))
    t = pg.inner_text('#main')
    ok('page has overview, address, tax, notes and tags', all(w in t for w in ['Customer overview', 'Language', 'Phone number', 'Default address', 'Tax details', 'Notes', 'Tags']))
    ok('three consent boxes and the consent note', pg.locator('[data-cu33c]').count() == 3 and 'ask your customers for permission' in t)
    ok('phone code follows the store country', E("document.querySelector('#cu33-dial').value") == '+92')
    pg.click('#cu33sv'); pg.wait_for_timeout(200)
    ok('needs a name, email or phone', 'Add a name, email or phone' in pg.inner_text('#cu33err'))
    pg.fill('#cu33-first', 'Sana'); pg.wait_for_timeout(100)
    ok('save bar shows on the new page', pg.locator('#cu33ub').is_visible())
    pg.fill('#cu33-email', 'old@x.pk'); pg.click('#cu33sv'); pg.wait_for_timeout(200)
    ok('email must be unique', 'already exists' in pg.inner_text('#cu33err'))
    pg.fill('#cu33-email', 'sana@x.pk'); pg.check('[data-cu33c="mSms"]'); pg.click('#cu33sv'); pg.wait_for_timeout(200)
    ok('SMS consent needs a phone', 'Marketing consent needs' in pg.inner_text('#cu33err'))
    pg.fill('#cu33-phone', '3001234567'); pg.check('[data-cu33c="mEmail"]')
    pg.fill('#cu33-a-a1', '5 Canal Rd'); pg.fill('#cu33-a-city', 'Lahore')
    pg.fill('#cu33-tag', 'VIP'); pg.press('#cu33-tag', 'Enter'); pg.wait_for_timeout(300)
    ok('tag added on the form', 'VIP' in pg.inner_text('.o31tags'))
    pg.fill('#cu33-note', 'Prefers WhatsApp'); pg.click('#cu33sv'); pg.wait_for_timeout(700)
    c = E("JSON.stringify(S.cust.find(c=>c.email==='sana@x.pk'))")
    ok('customer created with phone, consent, address, note and tags', '"phone":"+92 3001234567"' in c and '"mkt":true' in c and '"mktSms":true' in c and '5 Canal Rd' in c and 'Prefers WhatsApp' in c and 'VIP' in c, c[:300])
    ok('opens the new customer profile', E("location.hash").startswith('#customer-') and 'Sana' in pg.inner_text('#main'))
    go(pg, 'customers', 500); E("ACT.ocom&&0"); E("X=window;X.xmodal('Test','<p>x</p>','OK',function(){})"); pg.wait_for_timeout(200)
    go(pg, 'orders', 500)
    ok('a pop-up closes when the page changes', not pg.locator('#modal').is_visible())
    b.close()
vt.done(errs)
