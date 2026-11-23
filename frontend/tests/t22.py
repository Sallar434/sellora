"""A new store starts empty and honest: no sample products, orders, customers, collections, apps, alerts or invented numbers; all countries at sign-up; VendOm AI never names the AI company."""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright

FAKE = ['Zainab Bibi', 'Hamza Tariq', 'Usman Ghani', 'Fatima Noor', 'Summer Essentials', 'Motorsports', 'Classic tee', 'Race Day Gloves', 'Apex', 'Sallar Raza', '14.8K', '64.2%', '2m 14s', '+14.2%', '$14.80', '62% of sales', 'card ending 4242', 'kamran@', 'GIFT-DEMO', 'WELCOME10', 'Vellacorsa', 'act_99', 'G-7X982', 'WABA-', '3 orders are ready']
with sync_playwright() as p:
    b, pg, errs = vt.launch(p)
    E = pg.evaluate
    pg.goto(vt.URL); pg.wait_for_timeout(600); pg.click('#door-up'); pg.wait_for_timeout(200)
    names = E("[...document.querySelectorAll('#a-country option')].map(o=>o.textContent)")
    ok('sign-up lists every country (200+)', len(names) >= 240 and all(c in names for c in ['Pakistan', 'Zimbabwe', 'Iceland', 'Peru', 'Fiji', 'Kenya', 'Bolivia']), len(names))
    ok('Pakistan first, the rest A–Z', names[0] == 'Pakistan' and E("[...document.querySelectorAll('#a-country option')].map(o=>o.textContent).slice(1).every((n,i,a)=>!i||a[i-1].localeCompare(n)<=0)"))
    vt.signup(pg, email='clean@x.pk', store='My Store')
    for k in ['products', 'orders', 'collections', 'draftOrders', 'abandonedCheckouts', 'checkoutsList', 'purchaseOrders', 'transfers', 'giftCards', 'companies', 'blogPosts', 'filesList', 'installedApps', 'disc2', 'gc2', 'cust', 'alerts', 'payoutsList']:
        ok('new store has no sample ' + k, E("(S['%s']||[]).length" % k) == 0, E("JSON.stringify(S['%s']).slice(0,120)" % k))
    nav = json.loads(E("JSON.stringify(NAV_CONFIG)")); routes = []
    for n in nav:
        if n['id'] != '--': routes.append(n['id'])
        routes += [s['id'] for s in n.get('sub', [])]
    seen = []
    for r in routes + ['s-general', 's-plan', 's-billing', 'finance-billing']:
        go(pg, r, 250); t = E("(document.querySelector('#main')||{}).innerText||''")
        bad = [f for f in FAKE if f in t]
        if bad: seen.append((r, bad))
    ok('no invented names or numbers on any page', not seen, seen)
    ok('meta, google and whatsapp start disconnected', E("!(S.metaPixel&&S.metaPixel.account&&S.metaPixel.account.connected)&&!(S.googleChannel&&S.googleChannel.account&&S.googleChannel.account.connected)&&!(S.whatsapp&&S.whatsapp.business&&S.whatsapp.business.enabled)"))
    go(pg, 'orders-checkouts', 300)
    ok('checkouts page: real counts, no simulate button for sellers', 'Simulate checkout' not in E("document.querySelector('#main').innerText") and '—' in E("document.querySelector('#main').innerText"))
    go(pg, 'ai-assistant', 400)
    t = E("document.querySelector('#main').innerText")
    ok('VendOm AI shows its own model name (Advanced plan → Pro)', 'VendOm AI Pro' in t, t[:300])
    ok('no AI company names on the AI page', not re.search(r'deepseek|kimi|claude|anthropic|moonshot|openai', t, re.I), t[:300])
    pg.fill('#ai16q', 'how are sales this month?'); pg.press('#ai16q', 'Enter'); pg.wait_for_timeout(400)
    ok('answer says 0 orders for a new store', '0 orders' in E("S.ai16.log.slice(-1)[0].text"))
    ok('no page errors', not errs, errs)
    b.close()
vt.done()
