"""Shopify parity: every core Shopify admin area exists and the main merchant + shopper flows work end to end.

Checks the admin navigation and settings against Shopify's, then runs a real order through the storefront:
variant picker -> cart -> discount code + gift card + tax at checkout -> order with a price snapshot ->
fulfil with tracking -> partial refund with restock -> customer record -> analytics, plus cancel, draft order,
storefront pages and search, global admin search, inventory, purchase orders, CSV export and staff roles.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright

# Shopify admin left nav (help.shopify.com "Navigating the Shopify admin") -> VendOm route ids
NAV = {
    'Home': 'home', 'Orders': 'orders', 'Products': 'products', 'Customers': 'customers', 'Marketing': 'growth',
    'Discounts': 'discounts', 'Content': 'content', 'Markets': 'markets', 'Finance': 'finance',
    'Analytics': 'analytics', 'Apps': 'apps', 'Online Store': 'themes', 'Settings': 's-general',
}
SUB = ['orders-drafts', 'orders-abandoned', 'products-collections', 'products-inventory', 'products-purchase-orders',
       'products-transfers', 'products-gift-cards', 'customers-segments', 'customers-companies', 'growth-campaigns',
       'growth-automations', 'growth-attribution', 'content-metaobjects', 'content-files', 'content-menus',
       'content-blog-posts', 'online-store-pages', 'markets-catalogs', 'finance-payouts', 'finance-billing',
       'analytics-reports', 'analytics-live-view', 'online-store-preferences']
# Shopify Settings pages -> a word that must appear on the VendOm page
SETTINGS = {
    's-general': 'Store', 's-plan': 'Plan', 's-billing': 'Bill', 's-users': 'Users', 's-payments': 'Pay',
    's-checkout': 'Checkout', 's-custaccounts': 'account', 's-shipping': 'Shipping', 's-taxes': 'Tax',
    's-locations': 'Location', 's-markets': 'Market', 's-apps': 'App', 's-domains': 'Domain',
    's-custevents': 'event', 's-brand': 'Brand', 's-notifs': 'otification', 's-custom': 'etafield',
    's-language': 'anguage', 's-privacy': 'rivacy', 's-policies': 'olic', 's-gift-cards': 'ift card',
    's-packing': 'acking', 's-activity': 'ctivity',
}


def txt(pg, sel='#main'):
    return pg.evaluate("(document.querySelector(%r)||document.body).innerText" % sel)


def sf(pg):
    return pg.evaluate("(document.querySelector('#xsf')||{innerText:''}).innerText")


with sync_playwright() as p:
    b, pg, errs = vt.launch(p)
    E = pg.evaluate
    vt.signup(pg, email='parity@example.com', store='Parity Shop', plan='advanced')
    ok('signed in to a fresh store', E("U") == 'parity@example.com' and E("S.name") == 'Parity Shop')
    # The trial keeps the storefront behind a password; buy the plan so the store is live like a paid Shopify store.
    E("S.sub9.status='active';S.sub9.trialEnds=0;S.online=S.online||{};S.online.password=false;S.online.live=true;save()")

    # ---------- 1. admin navigation matches Shopify ----------
    labels = E("NAV_CONFIG.filter(n=>n.id!=='--').map(n=>n.label)")
    for name, rid in NAV.items():
        ok('nav: ' + name, name in labels or any(n['id'] == rid for n in E("NAV_CONFIG")), labels)
    order = [l for l in labels if l in NAV]
    ok('nav order matches Shopify', order == [k for k in NAV if k in order], order)
    for r in list(NAV.values()) + SUB:
        e0 = len(errs); go(pg, r, 250)
        ok('page renders: ' + r, len(txt(pg)) > 60 and len(errs) == e0, errs[e0:])
    for r, w in SETTINGS.items():
        e0 = len(errs); go(pg, r, 250)
        t = txt(pg)
        ok('settings: ' + r, w.lower() in t.lower() and 'not found' not in t.lower()[:200] and len(errs) == e0, t[:160])

    # ---------- 2. catalog setup: product with variants, collection, discount, gift card, tax ----------
    pid = E("""(()=>{var id=S.nid++;S.products.push({id:id,name:'Parity Tee',price:20,cmp:25,stock:10,status:'Active',desc:'<p>Soft tee</p>',
      sku:'PT',tags:['tee'],cols:[],imgs:[],opts:[{name:'Size',vals:['S','M']}],
      vars:[{n:'S',price:20,qty:5,sku:'PT-S'},{n:'M',price:24,qty:5,sku:'PT-M'}]});save();return id})()""")
    E("S.disc2.push({id:'DPAR',code:'PARITY10',title:'10% off',type:'percent',value:10,min:0,auto:false,limit:0,once:false,used:0,starts:'',ends:'',on:true});save()")
    E("S.gc2.push({code:'GIFT-PARITY-0001',init:5,bal:5,cust:'',exp:'',on:true,status:'Active'});save()")
    E("S.taxR=S.taxR||{};S.taxR.inc=false;save()")

    # product admin: list + editor
    go(pg, 'products', 400)
    ok('product listed in admin', 'Parity Tee' in txt(pg))
    go(pg, 'product-%d' % pid, 500)
    t = txt(pg)
    ok('product editor: title, variants, SEO, inventory', all(w.lower() in t.lower() for w in ['Parity Tee', 'Variants', 'search engine', 'Inventory']), t[:300])

    # ---------- 3. storefront: home, catalog, search, product page with variant picker ----------
    E("SF.open('home')"); pg.wait_for_timeout(400)
    ok('storefront opens', pg.locator('#xsf').count() == 1 and len(sf(pg)) > 40)
    E("SF.open('catalog')"); pg.wait_for_timeout(300)
    ok('catalog lists the product', 'Parity Tee' in sf(pg))
    E("SF.go('search','Parity')"); pg.wait_for_timeout(300)
    ok('storefront search finds it', 'Parity Tee' in sf(pg), sf(pg)[:200])
    E("SF.open('product:%d')" % pid); pg.wait_for_timeout(400)
    ok('product page shows "From"/price and Size picker', 'Size' in sf(pg) and pg.locator('#xsf [data-sfopt]').count() >= 2)
    pg.click('#xsf [data-sfopt="0:M"]'); pg.wait_for_timeout(250)
    ok('choosing M shows the M price', '24.00' in sf(pg), sf(pg)[:300])
    pg.click('#xsf [data-sfbuy]'); pg.wait_for_timeout(400)
    cart = E("JSON.stringify(SF.cart())")
    ok('cart holds the M variant', 'Parity Tee' in cart or str(pid) in cart, cart)

    # ---------- 4. checkout: discount code, gift card, tax, card payment ----------
    E("SF.open('checkout')"); pg.wait_for_timeout(500)
    if pg.query_selector('#xk_country'):
        pg.select_option('#xk_country', label='United States'); pg.wait_for_timeout(300)
    for f in pg.query_selector_all('#xsf [data-ckf]'):
        if f.is_visible() and not f.input_value():
            tag = f.evaluate('e=>e.tagName')
            if tag == 'SELECT':
                opts = f.evaluate('e=>[...e.options].map(o=>o.value).filter(Boolean)')
                if opts: f.select_option(opts[0])
            else:
                f.fill('2125550100' if f.get_attribute('type') == 'tel' or 'hone' in (f.get_attribute('data-ckf') or '') else ('10001' if 'ZIP' in (f.get_attribute('data-ckf') or '').upper() or 'ostal' in (f.get_attribute('data-ckf') or '') else 'Test'))
    pg.fill('#xk_email', 'shopper@example.com')
    pg.fill('#xk_code', 'PARITY10'); pg.click('#xk_apply'); pg.wait_for_timeout(300)
    ok('discount code applied', 'PARITY10' in sf(pg) and '-' in sf(pg), sf(pg)[sf(pg).find('PARITY10')-200:][:600])
    pg.fill('#xk_code', 'NOPE-CODE'); pg.click('#xk_apply'); pg.wait_for_timeout(300)
    ok('bad code rejected with a message', 'code not found' in sf(pg), sf(pg)[-400:])
    pg.click('#xsf [data-sfrmcode="NOPE-CODE"]'); pg.wait_for_timeout(300)
    ok('bad code can be removed', 'code not found' not in sf(pg))
    pg.fill('#xk_code', 'GIFT-PARITY-0001'); pg.click('#xk_apply'); pg.wait_for_timeout(300)
    ok('gift card applied', 'Gift card' in sf(pg) or 'gift card' in sf(pg).lower(), sf(pg)[-500:])
    ok('tax line at checkout', 'Tax' in sf(pg), sf(pg)[-400:])
    for f in pg.query_selector_all('#xsf [data-ckf]'):
        if f.is_visible() and not f.input_value() and f.evaluate('e=>e.tagName') != 'SELECT':
            f.fill('Test')
    if pg.query_selector('#xk_num'):
        if pg.query_selector('#xk_cn'): pg.fill('#xk_cn', 'Test Shopper')
        pg.fill('#xk_num', '4242424242424242'); pg.fill('#xk_exp', '12/30'); pg.fill('#xk_cvc', '123')
    n0 = E("S.orders.length")
    pg.click('#xkpaybtn'); pg.wait_for_timeout(1500)
    ok('order placed', E("S.orders.length") == n0 + 1, E("(document.querySelector('#xkerr')||{}).innerText"))
    o = E("JSON.stringify(S.orders[S.orders.length-1])")
    import json
    o = json.loads(o)
    oid = o['id']
    line = (o.get('items') or [{}])[0]
    ok('order keeps variant + price snapshot', line.get('variant') == 'M' and abs(float(line.get('price', 0)) - 24) < 0.01, line)
    ok('order records discount', float(o.get('disc') or 0) > 0 and 'PARITY10' in (o.get('codes') or []), o.get('codes'))
    ok('order records tax', float(o.get('tax') or 0) > 0, o.get('tax'))
    ok('gift card balance used', E("S.gc2.find(g=>g.code==='GIFT-PARITY-0001').bal") < 5)
    ok('variant stock decreased', E("S.products.find(p=>p.id===%d).vars[1].qty" % pid) == 4)
    ok('thank-you page', 'Thank' in sf(pg) or 'thank' in sf(pg).lower(), sf(pg)[:200])
    E("var c=document.querySelector('#xsfclose');c&&c.click()")

    # ---------- 5. order management: detail, fulfil with tracking, partial refund with restock ----------
    go(pg, 'orders', 400)
    ok('order in the orders list', '#%s' % oid in txt(pg) or str(oid) in txt(pg))
    go(pg, 'order-%s' % oid, 500)
    t = txt(pg)
    ok('order detail page: items, totals, timeline, customer', all(w in t for w in ['Parity Tee', 'Subtotal', 'Timeline']) and 'shopper@example.com' in t, t[-700:])
    pg.click('[data-x="ofulfil:%s"]' % oid); pg.wait_for_timeout(300)
    pg.select_option('#xcar', 'TCS'); pg.fill('#xtrk', 'TCS123456'); pg.click('#xok'); pg.wait_for_timeout(400)
    ok('fulfilled with tracking', E("ORD.get(%s).ful" % oid) == 'Fulfilled' and 'TCS123456' in E("JSON.stringify(ORD.get(%s).fuls)" % oid))
    go(pg, 'order-%s' % oid, 400)
    pg.click('[data-x="orefund:%s"]' % oid); pg.wait_for_timeout(300)
    pg.fill('[data-rq="0"]', '1'); pg.dispatch_event('[data-rq="0"]', 'input'); pg.wait_for_timeout(100)
    pg.fill('#xramt', '5'); pg.fill('#xrrs', 'Too small'); pg.click('#xok'); pg.wait_for_timeout(400)
    ok('partial refund recorded', abs(float(E("ORD.get(%s).refunded" % oid)) - 5) < 0.01, E("ORD.get(%s).refunded" % oid))
    ok('refund restocked the variant', E("S.products.find(p=>p.id===%d).vars[1].qty" % pid) == 5, E("JSON.stringify([S.products.find(p=>p.id===%d).vars,ORD.get(%s).items])" % (pid, oid)))
    ok('timeline logs fulfil + refund', all(w in E("JSON.stringify(ORD.get(%s).tl)" % oid).lower() for w in ['fulfil', 'refund']), E("JSON.stringify(ORD.get(%s).tl)" % oid))
    # ---------- 6. customers ----------
    c = E("JSON.stringify(CU.byEmail('shopper@example.com')||null)")
    ok('customer created from checkout', c != 'null', c)
    if c != 'null':
        cid = json.loads(c)['id']
        go(pg, 'customer-%s' % cid, 400)
        ok('customer detail shows order history', str(oid) in txt(pg), txt(pg)[:300])
    go(pg, 'customers', 300)
    pg.click('#s23addc'); pg.wait_for_timeout(300)
    box = E("document.querySelector('#box').innerHTML")
    ok('add customer form', 'mail' in box)

    # ---------- 7. draft order -> order ----------
    E("closeM()")
    n0 = E("S.orders.length")
    go(pg, 'draft-new', 400)
    pg.click('[data-x="s23pick"]'); pg.wait_for_timeout(300); pg.locator('[data-pp]').first.check(); pg.click('#xok'); pg.wait_for_timeout(500)
    pg.click('#s23cs'); pg.wait_for_timeout(300); pg.locator('[data-x^="s23setcust:"]').first.click(); pg.wait_for_timeout(400)
    pg.click('#s23col'); pg.wait_for_timeout(200); pg.click('#s23paidopt'); pg.wait_for_timeout(300); pg.click('#xok'); pg.wait_for_timeout(600)
    ok('draft order converts to an order', E("S.orders.length") == n0 + 1)

    # cancel an unfulfilled order (the one just created from the draft)
    other = E("(S.orders.find(o=>o.ful==='Unfulfilled'&&!o.cancelled)||{}).id")
    if other:
        go(pg, 'order-%s' % other, 400); pg.click('#o31db'); pg.wait_for_timeout(200); pg.click('[data-x="ocancel:%s"]' % other); pg.wait_for_timeout(300)
        if pg.locator('#xok:visible').count(): pg.click('#xok'); pg.wait_for_timeout(300)
        ok('order cancelled', bool(E("ORD.get(%s).cancelled" % other)))
    else:
        ok('order cancelled', False, 'no unfulfilled order to cancel')


    # ---------- 8. analytics from real orders ----------
    go(pg, 'analytics', 400)
    t = txt(pg)
    ok('analytics computed from orders', 'computed from your orders' in t and 'Total sales' in t)
    ok('analytics shows the new product', 'Parity Tee' in t, t[:400])
    go(pg, 'analytics-reports', 300)
    ok('reports list', 'Sales' in txt(pg) and pg.locator('#main button, #main a').count() > 3)

    # ---------- 9. inventory, purchase order receive, CSV export ----------
    go(pg, 'products-inventory', 400)
    ok('inventory lists variants', 'Parity Tee' in txt(pg))
    go(pg, 'products-purchase-orders', 400)
    e0 = len(errs)
    rcv = pg.locator('#main [data-act-po], #main button:has-text("Mark received"), #main button:has-text("Receive")')
    if rcv.count():
        rcv.first.click(); pg.wait_for_timeout(300)
        if pg.locator('#xok:visible').count(): pg.click('#xok'); pg.wait_for_timeout(300)
    ok('purchase order receive works without errors', len(errs) == e0, errs[e0:])
    go(pg, 'products', 400)
    ok('product CSV export available', E("typeof window.exportProducts==='function'") and pg.locator('#main [data-x="pexport"], #main button:has-text("Export")').count() > 0)

    # ---------- 10. global search + staff roles + online store ----------
    pg.keyboard.press('Control+k'); pg.wait_for_timeout(300)
    inp = pg.locator('input:visible[placeholder*="earch"]').last
    if inp.count():
        inp.fill('Parity'); pg.wait_for_timeout(400)
    ok('global search finds the product', 'Parity Tee' in E("document.body.innerText"))
    pg.keyboard.press('Escape')
    go(pg, 's-users', 300)
    ok('staff and roles page', 'Role' in txt(pg) or 'role' in txt(pg))
    go(pg, 'themes', 400)
    ok('theme library + customize', 'Customize' in txt(pg) or 'Customise' in txt(pg))
    go(pg, 'content-menus', 300)
    ok('navigation menus', 'Main menu' in txt(pg) or 'main-menu' in txt(pg).lower())

    # ---------- 11. VendOm branding ----------
    whole = E("document.documentElement.outerHTML")
    ok('no old brand name left in the UI', 'Sellora' not in E("document.body.innerText"))
    go(pg, 's-payments', 400)
    ok('VendOm Payments in Settings › Payments', 'VendOm Payments' in txt(pg))
    ok('no page errors', not errs, errs)
    b.close()
vt.done()
