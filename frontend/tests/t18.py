"""Merchant admin cleanup: real sessions on Home, menu arrows close, platform-only pages hidden from store owners."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright


def metric(pg, name):
    return pg.evaluate("""n=>{var m=[...document.querySelectorAll('#main .metric')].find(x=>x.querySelector('small').textContent===n);return m?m.querySelector('b').textContent:null}""", name)


def nav_text(pg):
    return pg.evaluate("document.querySelector('#nav').innerText")


with sync_playwright() as p:
    b, pg, errs = vt.launch(p)
    E = pg.evaluate
    vt.signup(pg, email='clean@example.com', store='Clean Shop', plan='grow')
    go(pg, 'home', 400)
    # ---- Home numbers are real
    ok('new store: 0 sessions', metric(pg, 'Sessions') == '0', metric(pg, 'Sessions'))
    ok('new store: 0 orders, $0.00 sales', metric(pg, 'Orders') == '0' and '0.00' in (metric(pg, 'Total sales') or ''))
    ok('new store: 0.0% conversion', metric(pg, 'Conversion rate') == '0.0%')
    ok('new store has no sample orders', E("S.orders.length") == 0)
    E("SF.open('home')"); pg.wait_for_timeout(300); E("SF.open('catalog')"); pg.wait_for_timeout(300)
    E("document.querySelector('#xsfclose')&&document.querySelector('#xsfclose').click()")
    go(pg, 'home', 400)
    ok('one storefront visit = 1 session (page views inside it do not add more)', metric(pg, 'Sessions') == '1', metric(pg, 'Sessions'))
    E("S.stats.last=Date.now()-31*60e3;save()"); E("SF.open('home')"); pg.wait_for_timeout(300)
    E("document.querySelector('#xsfclose')&&document.querySelector('#xsfclose').click()"); go(pg, 'home', 400)
    ok('a visit 30+ minutes later is a new session', metric(pg, 'Sessions') == '2', metric(pg, 'Sessions'))
    go(pg, 'analytics', 400)
    ok('Analytics shows the same sessions', 'Online store sessions\n2' in E("document.querySelector('#main').innerText"))

    # ---- menu arrow opens and closes, also while on a page inside that section
    go(pg, 'orders', 400)
    sub = "document.querySelector('#sub-orders').classList.contains('open')"
    ok('Orders section opens on its page', E(sub))
    pg.click('[data-navt="orders"]'); pg.wait_for_timeout(200)
    ok('arrow closes Orders while on Orders', not E(sub))
    pg.click('[data-navt="orders"]'); pg.wait_for_timeout(200)
    ok('arrow opens it again', E(sub))
    go(pg, 'orders-drafts', 300); pg.click('[data-navt="orders"]'); pg.wait_for_timeout(200)
    ok('arrow closes Orders while on a sub-page', not E(sub))
    pg.click('[data-navt="products"]'); pg.wait_for_timeout(200)
    ok('arrow opens another section', E("document.querySelector('#sub-products').classList.contains('open')"))
    pg.click('[data-navt="products"]'); pg.wait_for_timeout(200)
    ok('and closes it', not E("document.querySelector('#sub-products').classList.contains('open')"))
    go(pg, 'products', 300)
    ok('going to a new page opens its section', E("document.querySelector('#sub-products').classList.contains('open')"))

    # ---- store owner does not see platform-only or duplicate items
    E("Object.keys(NAV_CONFIG).forEach(()=>0);S.navOpen={'vendom-pay':true};save()"); go(pg, 'home', 300)
    pg.click('[data-navt="vendom-pay"]') if not E("document.querySelector('#sub-vendom-pay').classList.contains('open')") else None
    t = nav_text(pg)
    for w in ['Integrations (API keys)', 'Platform admin', 'Buyer wallet', 'Notifications outbox', 'Staff permissions', 'Shipping & taxes']:
        ok('owner menu has no "%s"' % w, w not in t)
    ok('App Store listed once (under Apps)', t.count('App Store') <= 1, t.count('App Store'))
    ok('owner keeps VendOm Pay KYC and payment links', 'Seller onboarding (KYC)' in t and 'Embed & payment links' in t)
    ok('no "Viewing as" switcher for owners', E("!document.querySelector('#xviewas')||getComputedStyle(document.querySelector('#xviewas')).display==='none'"))
    for r in ['pay-admin', 'integrations', 'pay-buyer', 'notifications-outbox']:
        go(pg, r, 400)
        ok('owner cannot open #%s' % r, E("location.hash") == '#home', E("location.hash"))
    # pages that moved out of the menu are still reachable from Settings
    go(pg, 's-shipping', 300)
    ok('shipping settings still there', 'hipping' in E("document.querySelector('#main').innerText"))
    go(pg, 's-users', 300)
    ok('users and roles still there', 'ole' in E("document.querySelector('#main').innerText"))

    # ---- the VendOm platform admin account still sees them
    E("U='admin@vendom.app'"); go(pg, 'home', 300)
    E("S.navOpen={'vendom-pay':true}"); go(pg, 'vendom-pay', 300)
    t = nav_text(pg)
    ok('platform admin sees Platform admin + Integrations', 'Platform admin' in t and 'Integrations (API keys)' in t, t[-300:])
    go(pg, 'pay-admin', 400)
    ok('platform admin can open #pay-admin', E("location.hash") == '#pay-admin')
    ok('no page errors', not errs, errs)
    b.close()
vt.done()
