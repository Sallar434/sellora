"""100-customer simulation (v40): a merchant sets up a real store (10+ products with variants, low stock, a draft, an
Urdu-named product, discount codes, a gift card, markets with a catalog), then 100 different shoppers browse, search,
add to cart, try valid / invalid / expired / used-up codes, sign up, abandon checkouts, hit sold-out and low-stock
items, and buy: 25+ through the real storefront checkout UI, the rest through the order API (ORD.place).
Then the merchant side is checked against an independent Python model of every order: order count and totals,
stock never negative and equal to what was sold, customers without duplicates, abandoned checkouts, Home and
Analytics numbers, fulfilment and refunds from the order page, XSS-safe rendering, and no JS errors.
"""
import sys, os, json, math, random, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright

T0 = time.time()
RNG = random.Random(40)


def r2(n):  # JS Math.round(n*100)/100 for the positive amounts we use
    return math.floor(n * 100 + 0.5) / 100


def near(a, b, tol=0.011):
    return abs(float(a) - float(b)) <= tol


# ---------------------------------------------------------------- store model (mirrors what the merchant configured)
TAX = {'Pakistan': 17, 'United States': 7.25, 'Canada': 13, 'United Kingdom': 20, 'India': 18, 'United Arab Emirates': 5, 'Saudi Arabia': 15}
def ship_for(country, sub):
    if country == 'Pakistan': return 2
    if country in ('United States', 'Canada'): return 0 if sub >= 150 else 12
    if country in ('United Kingdom', 'Germany'): return 10
    if country in ('United Arab Emirates', 'Saudi Arabia'): return 8
    return 18

INDIA_ADJ = 5  # India catalog: +5 %

# ---------------------------------------------------------------- 100 shoppers
FIRST = {
    'Pakistan': [('عائشہ', 'خان'), ('Bilal', 'Raza'), ('Sana', 'Ali'), ('محمد', 'عمران'), ('Hira', 'Qureshi'), ('Usman', 'Tariq'), ('فاطمہ', 'زہرا'), ('Ahmed', "O'Brien-Malik"), ('Zainab', 'Butt'), ('Hamza', 'Sheikh')],
    'India': [('प्रिया', 'शर्मा'), ('Rahul', 'Verma'), ('Ananya', 'Iyer'), ('Arjun', 'Nair'), ('Kavya', 'Reddy'), ('Vikram', 'Singh')],
    'Bangladesh': [('রহিম', 'উদ্দিন'), ('Nusrat', 'Jahan'), ('Tanvir', 'Hasan'), ('Farzana', 'Akter')],
    'Sri Lanka': [('සුනිල්', 'පෙරේරා'), ('Kumari', 'Fernando'), ('Nimal', 'Silva'), ('தமிழ்', 'செல்வன்')],
    'United Arab Emirates': [('Omar', 'Al Mansoori'), ('Layla', 'Haddad')],
    'United States': [('Emily', 'Johnson'), ('José', 'Muñoz')],
    'United Kingdom': [('Oliver', 'Smith'), ('Chloë', 'Brontë')],
    'Nepal': [('Sita', 'Gurung')],
    'Canada': [('Liam', 'Tremblay')],
}
PHONE = {'Pakistan': '+92 300 {:07d}', 'India': '+91 98{:08d}', 'Bangladesh': '+880 171{:07d}', 'Sri Lanka': '+94 77 {:07d}',
         'United Arab Emirates': '+971 50 {:07d}', 'United States': '+1 212 555 {:04d}', 'United Kingdom': '+44 7700 {:06d}', 'Nepal': '+977 98{:08d}', 'Canada': '+1 416 555 {:04d}'}
CITY = {'Pakistan': ['Lahore', 'Karachi', 'Islamabad', 'پشاور'], 'India': ['Mumbai', 'Delhi', 'Bengaluru'], 'Bangladesh': ['Dhaka', 'চট্টগ্রাম'], 'Sri Lanka': ['Colombo', 'Kandy'],
        'United Arab Emirates': ['Dubai'], 'United States': ['New York'], 'United Kingdom': ['London'], 'Nepal': ['Kathmandu'], 'Canada': ['Toronto']}
MIX = ['Pakistan'] * 35 + ['India'] * 20 + ['Bangladesh'] * 15 + ['Sri Lanka'] * 10 + ['United Arab Emirates'] * 5 + ['United States'] * 5 + ['United Kingdom'] * 5 + ['Nepal'] * 3 + ['Canada'] * 2
CUSTS = []
for i, ctry in enumerate(MIX):
    f, l = FIRST[ctry][i % len(FIRST[ctry])]
    mail = 'shopper%03d@%s' % (i, ['gmail.com', 'yahoo.com', 'outlook.pk', 'example.lk', 'mail.bd'][i % 5])
    if i % 9 == 4: mail = 'Shopper%03d+eid@Gmail.com' % i      # mixed case + plus-addressing
    CUSTS.append({'i': i, 'first': f, 'last': l, 'email': mail, 'country': ctry,
                  'phone': PHONE[ctry].format(1000 + i * 37), 'city': CITY[ctry][i % len(CITY[ctry])],
                  'addr': 'House %d, Street %d' % (i + 1, i % 17 + 1), 'zip': '%05d' % (54000 + i), 'region': 'Punjab' if ctry == 'Pakistan' else 'Region %d' % (i % 4)})
CUSTS[7]['first'] = '<img src=x onerror="window.__xss=1">'   # hostile name: must render as text everywhere
CUSTS[8]['last'] = '"><svg onload=window.__xss=2>'

with sync_playwright() as p:
    b, pg, errs = vt.launch(p)
    E = pg.evaluate
    cons = []
    pg.on('console', lambda m: cons.append(m.text[:300]) if m.type == 'error' else None)

    # ================================================================ 1. merchant sets up the store
    vt.signup(pg, email='qa40@x.pk', store='Noor Bazaar', plan='advanced')
    ok('merchant signed in to a fresh store', E("U") == 'qa40@x.pk' and E("S.name") == 'Noor Bazaar' and E("S.orders.length") == 0)
    E("S.sub9.status='active';S.sub9.trialEnds=0;S.online=S.online||{};S.online.password=false;S.online.live=true;save()")
    P = E("""(function(){function add(o){var p=Object.assign({id:S.nid++,handle:'',cmp:0,status:'Active',desc:'',cols:[],tags:[],imgs:[],vars:[],opts:[],seo:{},sku:''},o);if(!p.handle)p.handle=slugify(p.name)||('p'+p.id);S.products.push(p);return p.id}
      var r={kurta:add({name:'Lawn Kurta',price:40,stock:200,sku:'LK',tags:['lawn','summer']}),
        dupatta:add({name:'Silk Dupatta',price:25,stock:150,sku:'SD',cols:['Accessories']}),
        khussa:add({name:'Khussa Shoes',price:30,stock:83,sku:'KS',opts:[{name:'Size',vals:['S','M','L']}],vars:[{n:'S',price:30,qty:40,sku:'KS-S'},{n:'M',price:32,qty:40,sku:'KS-M'},{n:'L',price:34,qty:3,sku:'KS-L'}]}),
        chai:add({name:'Chai Masala',price:5,stock:500,sku:'CM',tags:['tea']}),
        attar:add({name:'Rose Attar',price:15,stock:4,sku:'RA'}),
        lamp:add({name:'Brass Lamp',price:60,stock:1,sku:'BL'}),
        ajrak:add({name:'Ajrak Shawl',price:45,stock:0,sku:'AS'}),
        pashmina:add({name:'Pashmina Wrap',price:120,stock:40,sku:'PW',opts:[{name:'Color',vals:['Grey','Maroon']}],vars:[{n:'Grey',price:120,qty:20,sku:'PW-G'},{n:'Maroon',price:130,qty:20,sku:'PW-M'}]}),
        draft:add({name:'Secret Draft Kurta',price:99,stock:50,status:'Draft',sku:'SDK'}),
        mug:add({name:'Truck Art Mug',price:12,stock:0,oos:true,sku:'TAM'}),
        cup:add({name:'چائے کپ',price:8,stock:100,sku:'URD-CUP',tags:['tea','urdu']}),
        bangles:add({name:'Glass Bangles',price:6,stock:300,sku:'GB'})};
      save();return r})()""")
    STOCK0 = {(P['kurta'], -1): 200, (P['dupatta'], -1): 150, (P['khussa'], 0): 40, (P['khussa'], 1): 40, (P['khussa'], 2): 3,
              (P['chai'], -1): 500, (P['attar'], -1): 4, (P['lamp'], -1): 1, (P['ajrak'], -1): 0, (P['pashmina'], 0): 20, (P['pashmina'], 1): 20,
              (P['draft'], -1): 50, (P['mug'], -1): 0, (P['cup'], -1): 100, (P['bangles'], -1): 300}
    PRICE = {(P['kurta'], -1): 40, (P['dupatta'], -1): 25, (P['khussa'], 0): 30, (P['khussa'], 1): 32, (P['khussa'], 2): 34, (P['chai'], -1): 5,
             (P['attar'], -1): 15, (P['lamp'], -1): 60, (P['ajrak'], -1): 45, (P['pashmina'], 0): 120, (P['pashmina'], 1): 130, (P['draft'], -1): 99,
             (P['mug'], -1): 12, (P['cup'], -1): 8, (P['bangles'], -1): 6}
    STOCK = dict(STOCK0)
    go(pg, 'products', 500)
    ok('admin product list shows the catalog incl. the Urdu product', all(n in pg.inner_text('#main') for n in ['Lawn Kurta', 'Khussa Shoes', 'چائے کپ', 'Secret Draft Kurta']))

    # discounts (Shopify-style v25 records, as the discount editor saves them), a gift card, markets + catalog
    E("""(function(){var n=Date.now(),base={v25:1,kind:'order',method:'code',elig:'all',eligList:[],min:'none',combine:{product:false,order:false,shipping:false},starts:n-864e5,ends:0,on:true,used:0};
      function d(o){S.disc2.push(Object.assign({},base,o))}
      d({id:'deid',code:'EID20',title:'Eid 20% off',valType:'%',value:20});
      d({id:'dflat',code:'FLAT5',title:'$5 off over $30',valType:'fixed',value:5,min:'amount',minVal:30});
      d({id:'dold',code:'OLD10',title:'Old 10%',valType:'%',value:10,starts:n-30*864e5,ends:n-864e5});
      d({id:'dlim',code:'LIMIT3',title:'First 3 buyers 10%',valType:'%',value:10,limitTotal:true,limitN:3});
      d({id:'donce',code:'ONCE15',title:'15% once per customer',valType:'%',value:15,oncePerCustomer:true});
      S.gc2.push({code:'GIFT-EID-0001',init:20,bal:20,cust:'',exp:'',on:true,status:'Active'});
      S.marketsList.push({id:'mkin',name:'India',type:'region',countries:['India'],status:'Active',created:n,cust:{cur:{cur:'INR',rate:'auto',round:false,local:false},cat:['catin']}});
      S.marketsList.push({id:'mkbd',name:'Bangladesh',type:'region',countries:['Bangladesh'],status:'Active',created:n,cust:{cur:{cur:'BDT',rate:'auto',round:false,local:false}}});
      S.cat28=S.cat28||[];S.cat28.push({id:'catin',title:'India prices',status:'Active',adj:ADJ_PCT,excl:[],prices:{}});
      MK28.list().forEach(function(m){try{m.currency=MK28.eff(m).cur.cur}catch(e){}});save()})()""".replace('ADJ_PCT', str(INDIA_ADJ)))
    ok('India catalog price used for India (+5%)', near(E("MK28.price(S.products.find(p=>p.id===%d),'India')" % P['kurta']), 42))
    ok('Pakistan keeps the store price', near(E("MK28.price(S.products.find(p=>p.id===%d),'Pakistan')" % P['kurta']), 40))
    go(pg, 'discounts', 500)
    t = pg.inner_text('#main')
    ok('discount list shows active + expired codes', 'EID20' in t and 'OLD10' in t and 'Expired' in t, t[:300])
    go(pg, 'markets', 600)
    ok('markets list shows India and Bangladesh', 'India' in pg.inner_text('#main') and 'Bangladesh' in pg.inner_text('#main'))

    # ---------------------------------------------------------------- expected-order model
    MODEL = []      # one dict per order the app should have
    CODE_USED = {'LIMIT3': 0}
    ONCE_USED = set()
    GC = {'bal': 20.0}

    def unit(pid, vi, ctry):
        b0 = PRICE[(pid, vi)]
        return r2(b0 * (1 + INDIA_ADJ / 100)) if ctry == 'India' else b0

    def expect(cart, c, codes=(), gc=None):
        ctry = c['country']
        sub = r2(sum(unit(pid, vi, ctry) * q for pid, vi, q in cart))
        disc = 0.0
        for code in codes:
            if code == 'EID20': disc = r2(sub * 0.20)
            elif code == 'FLAT5' and sub >= 30: disc = 5.0
            elif code == 'LIMIT3' and CODE_USED['LIMIT3'] < 3: disc = r2(sub * 0.10)
            elif code == 'ONCE15' and c['email'].lower().strip() not in ONCE_USED: disc = r2(sub * 0.15)
        ship = ship_for(ctry, sub)
        tax = r2((sub - disc) * TAX.get(ctry, 0) / 100)
        total = r2(sub - disc + ship + tax)
        gca = 0.0
        if gc and GC['bal'] > 0: gca = r2(min(GC['bal'], total))
        return {'sub': sub, 'disc': disc, 'ship': ship, 'tax': tax, 'total': total, 'gcAmt': gca}

    def commit(cart, c, codes, gc, exp, oid):
        if 'LIMIT3' in codes and exp['disc'] > 0: CODE_USED['LIMIT3'] += 1
        if 'ONCE15' in codes and exp['disc'] > 0: ONCE_USED.add(c['email'].lower().strip())
        if exp['gcAmt']: GC['bal'] = r2(GC['bal'] - exp['gcAmt'])
        for pid, vi, q in cart: STOCK[(pid, vi)] -= q
        MODEL.append(dict(exp, id=oid, email=c['email'].strip().lower(), cart=cart, country=c['country'], refunded=0.0, cancelled=False))

    def api_order(c, cart, codes=(), gc=None, method='VendOm Pay'):
        exp = expect(cart, c, codes, gc)
        ctx = {'email': c['email'], 'first': c['first'], 'last': c['last'], 'phone': c['phone'], 'country': c['country'],
               'codes': list(codes) + ([gc] if gc else []), 'addr': {'line': c['addr'], 'city': c['city'], 'region': c['region'], 'zip': c['zip'], 'country': c['country']}}
        o = E("([cart,ctx,m])=>{var t=performance.now();var o=ORD.place(cart.map(x=>({pid:x[0],vi:x[1],q:x[2]})),ctx,{method:m,id:'ch_api'});return {id:o.id,sub:o.sub,disc:o.disc,ship:o.shipAmt,tax:o.tax,total:o.total,gcAmt:o.gcAmt,ms:performance.now()-t}}",
              [[list(x) for x in cart], ctx, method])
        commit(cart, c, codes, gc, exp, o['id'])
        return o, exp

    # ================================================================ 2. storefront helpers
    def sft():
        return E("(document.querySelector('#xsf')||{innerText:''}).innerText")

    def new_visitor():  # a different shopper on this device: empty cart, signed out, no checkout in progress
        E("var x=document.querySelector('#xsf');x&&x.remove();S.sfCart=[];S.sfUser=null;SF.state.ck=null;SF.state.sel=null;S.sfCur='USD';save()")

    def browse(c, k):
        E("SF.open('home')"); pg.wait_for_timeout(120)
        E("SF.go('catalog')"); pg.wait_for_timeout(80)
        if k % 3 == 0:
            pg.fill('#xsf #xsfq', ['kurta', 'tea', 'khussa', 'چائے'][k % 4]); pg.press('#xsf #xsfq', 'Enter'); pg.wait_for_timeout(120)
            E("SF.go('catalog')"); pg.wait_for_timeout(80)

    def add_ui(pid, opt=None, qty=1):
        E("SF.go('catalog')"); pg.wait_for_timeout(60)
        pg.click('#xsf [data-sf="product:%d"] >> nth=0' % pid); pg.wait_for_timeout(100)
        if opt:
            pg.click('#xsf [data-sfopt="0:%s"]' % opt); pg.wait_for_timeout(80)
        pg.fill('#xsf #xsfqty', str(qty))
        pg.click('#xsf [data-sfadd]'); pg.wait_for_timeout(100)

    def to_checkout(c):
        E("SF.go('cart')"); pg.wait_for_timeout(80)
        pg.click('#xsf [data-sf="checkout"] >> nth=0'); pg.wait_for_timeout(150)
        if pg.locator('#xk_country').count() == 0:
            return False
        if pg.eval_on_selector('#xk_country', 'e=>e.value') != c['country']:
            pg.select_option('#xk_country', c['country']); pg.wait_for_timeout(120)
        pg.fill('#xk_email', c['email'])
        for f in pg.query_selector_all('#xsf [data-ckf]'):
            lab = f.get_attribute('data-ckf') or ''
            tag = f.evaluate('e=>e.tagName')
            if tag == 'SELECT':
                opts = f.evaluate('e=>[...e.options].map(o=>o.value).filter(Boolean)')
                f.select_option(c['region'] if c['region'] in opts else opts[0]); continue
            if tag == 'TEXTAREA': continue
            L = lab.lower()
            v = (c['first'] if L == 'first name' else c['last'] if L == 'last name' else c['phone'] if 'phone' in L else
                 c['addr'] if any(w in L for w in ['address', 'street', 'building']) else c['city'] if L in ('city', 'town or city', 'suburb') else
                 c['zip'] if any(w in L for w in ['postal', 'zip', 'postcode', 'pin code']) else c['region'] if any(w in L for w in ['state', 'province', 'county', 'region']) else
                 ('Area 1' if '(optional)' not in (f.get_attribute('placeholder') or '') else ''))
            if v: f.fill(v)
        pg.locator('#xk_email').dispatch_event('blur'); pg.wait_for_timeout(60)
        return True

    def robot():
        if pg.locator('#xsfsignup .pfc-x').count(): pg.check('#xsfsignup .pfc-x')

    def apply_code(code):
        pg.fill('#xk_code', code); pg.click('#xk_apply'); pg.wait_for_timeout(120)

    def remove_code(code):
        pg.click('#xsf [data-sfrmcode="%s"]' % code); pg.wait_for_timeout(120)

    def pay(method='card', card='4242424242424242'):
        if method != 'card':
            pg.check('#xsf input[name=xkpay][value=%s]' % method); pg.wait_for_timeout(120)
        if method == 'card' and pg.locator('#xk_num').count():
            pg.fill('#xk_cn', 'Card Holder'); pg.fill('#xk_num', card); pg.fill('#xk_exp', '12/30'); pg.fill('#xk_cvc', '123')
        if method in ('jazzcash', 'easypaisa'): pg.fill('#xk_mw', '0300 1234567')
        if method == 'bank': pg.fill('#xk_bn', 'Account Holder')
        n0 = E("S.orders.length")
        E("var e=document.querySelector('#xkerr');if(e)e.textContent=''")
        pg.click('#xkpaybtn')
        try:
            pg.wait_for_function("n=>S.orders.length>n||SF.state.pg==='thanks'||((document.querySelector('#xkerr')||{}).textContent||'').trim().length>0", arg=n0, timeout=4000)
        except Exception:
            pass
        pg.wait_for_timeout(60)
        if E("S.orders.length") > n0 and E("SF.state.pg") == 'thanks':
            return E("S.orders[S.orders.length-1].id"), ''
        return None, E("(document.querySelector('#xkerr')||{}).textContent||''")

    def ui_buy(c, items, codes=(), method='card', expect_codes_ok=True):
        """items: [(pid, optLabel|None, vi, qty)] -> places an order through the storefront UI and checks it against the model."""
        for pid, opt, vi, q in items: add_ui(pid, opt, q)
        if not to_checkout(c): return None, 'no checkout'
        for code in codes: apply_code(code)
        cart = [(pid, vi, q) for pid, opt, vi, q in items]
        exp = expect(cart, c, codes)
        shown = sft()
        oid, err = pay(method)
        if not oid and codes and ('LIMIT3' in err or 'ONCE15' in err or 'not active' in err or 'already' in err):
            for code in codes: remove_code(code)
            codes = []; exp = expect(cart, c, codes)
            oid, err = pay(method)
        if oid:
            commit(cart, c, codes, None, exp, oid)
            o = E("ORD.get(%s)" % oid)
            ok('UI order #%s (%s, %s) totals match the model' % (oid, c['country'], '+'.join(codes) or 'no code'),
               near(o['sub'], exp['sub']) and near(o['disc'], exp['disc']) and near(o['shipAmt'], exp['ship']) and near(o['tax'], exp['tax']) and near(o['total'], exp['total']),
               {'app': [o['sub'], o['disc'], o['shipAmt'], o['tax'], o['total']], 'model': exp})
        return oid, err

    # ================================================================ 3. storefront shoppers (UI)
    t_ui = time.time()
    sf_orders = []
    # 3a. catalog / search / draft visibility (first visitor)
    new_visitor(); E("SF.open('home')"); pg.wait_for_timeout(300)
    ok('storefront opens with the store name', 'Noor Bazaar' in sft())
    E("SF.go('catalog')"); pg.wait_for_timeout(150); cat = sft()
    ok('catalog lists active products, hides the draft', 'Lawn Kurta' in cat and 'چائے کپ' in cat and 'Secret Draft Kurta' not in cat, cat[:400])
    ok('sold-out product is badged Sold out', 'Sold out' in cat)
    pg.fill('#xsf #xsfq', 'چائے'); pg.press('#xsf #xsfq', 'Enter'); pg.wait_for_timeout(200)
    ok('search in Urdu finds the Urdu product', 'چائے کپ' in sft(), sft()[:300])
    E("SF.go('search:draft')"); pg.wait_for_timeout(150)
    ok('search does not leak the draft product', 'Secret Draft Kurta' not in sft())
    E("SF.go('search:KS-M')"); pg.wait_for_timeout(150)
    ok('search by variant SKU finds only that product', E("[...document.querySelectorAll('#xsf [data-sf^=\"product:\"]')].length") == 1 and 'Khussa Shoes' in sft())
    E("SF.go('search:undefined')"); pg.wait_for_timeout(150)
    mtxt = E("(document.querySelector('#xsf main')||document.querySelector('#xsf')).innerText")
    ok('search for "undefined" returns nothing', E("document.querySelectorAll('#xsf [data-sf^=\"product:\"]').length") == 0, E("[...document.querySelectorAll('#xsf [data-sf^=\"product:\"]')].map(e=>e.innerText.split('\\n')[0])"))
    E("SF.open('product:%d')" % P['draft']); pg.wait_for_timeout(150)
    ok('draft product URL shows Product not found', 'Product not found' in sft())
    E("SF.open('product:%d')" % P['ajrak']); pg.wait_for_timeout(150)
    ok('sold-out product: Add to cart disabled', E("!!document.querySelector('#xsf [data-sfadd]').disabled"))
    E("SF.open('product:%d')" % P['attar']); pg.wait_for_timeout(150)
    pg.fill('#xsf #xsfqty', '5'); pg.click('#xsf [data-sfadd]'); pg.wait_for_timeout(150)
    ok('low stock: asking for 5 of 4 is refused', E("SF.cart().length") == 0)
    E("SF.open('product:%d')" % P['khussa']); pg.wait_for_timeout(150)
    pg.click('#xsf [data-sfopt="0:L"]'); pg.wait_for_timeout(100)
    ok('variant L shows its price and low stock', '34.00' in sft() and '3 in stock' in sft(), sft()[:400])

    # 3b. 28 shoppers who buy through the storefront UI
    UI_IDX = list(range(0, 28))
    plan = {
        0: ([(P['kurta'], None, -1, 2)], ['EID20'], 'card'),
        1: ([(P['khussa'], 'M', 1, 1), (P['chai'], None, -1, 3)], [], 'jazzcash'),
        2: ([(P['dupatta'], None, -1, 1)], ['FLAT5'], 'card'),          # $25 < $30 minimum -> refused, removed
        3: ([(P['pashmina'], 'Maroon', 1, 1)], ['LIMIT3'], 'card'),
        4: ([(P['cup'], None, -1, 4)], [], 'card'),
        5: ([(P['bangles'], None, -1, 10)], ['ONCE15'], 'card'),
        6: ([(P['attar'], None, -1, 2)], [], 'bank'),
        7: ([(P['kurta'], None, -1, 1)], [], 'card'),                     # hostile first name
        8: ([(P['chai'], None, -1, 1)], [], 'card'),                      # hostile last name
        9: ([(P['khussa'], 'L', 2, 2)], ['OLD10'], 'card'),               # expired code -> removed
    }
    for k in UI_IDX:
        c = CUSTS[k]
        new_visitor(); browse(c, k)
        items, codes, meth = plan.get(k, ([(RNG.choice([P['kurta'], P['dupatta'], P['chai'], P['bangles'], P['cup']]), None, -1, RNG.randint(1, 3))], [RNG.choice(['', '', 'EID20', 'LIMIT3'])], RNG.choice(['card', 'card', 'jazzcash'])))
        codes = [x for x in codes if x]
        if meth == 'jazzcash' and c['country'] != 'Pakistan': meth = 'card'
        bad = [x for x in codes if x in ('FLAT5', 'OLD10')] if k in (2, 9) else []
        if k == 9:  # also try a code that does not exist
            for it in items: add_ui(it[0], it[1], it[3])
            to_checkout(c); apply_code('NOTACODE')
            ok('unknown code rejected with a message', 'code not found' in sft())
            remove_code('NOTACODE'); apply_code('OLD10')
            ok('expired code rejected', E("SF.state.ck.codes.includes('OLD10')") and ('not active' in sft() or 'expired' in sft().lower()), sft()[-500:])
            ok('expired code message says "expired"', 'expired' in sft().lower(), [l for l in sft().split('\n') if 'OLD10' in l])
            oid, err = pay('card')
            ok('checkout blocked while a rejected code is applied', oid is None and err, err)
            remove_code('OLD10')
            cart = [(it[0], it[2], it[3]) for it in items]; exp = expect(cart, c, [])
            oid, err = pay('card')
            if oid: commit(cart, c, [], None, exp, oid)
            ok('after removing the expired code the order goes through', bool(oid), err); sf_orders.append(oid); continue
        if k == 2:
            for it in items: add_ui(it[0], it[1], it[3])
            to_checkout(c); apply_code('FLAT5')
            ok('minimum-spend code refused under $30', 'Spend' in sft(), sft()[-400:])
            remove_code('FLAT5')
            cart = [(it[0], it[2], it[3]) for it in items]; exp = expect(cart, c, [])
            oid, err = pay('card')
            if oid: commit(cart, c, [], None, exp, oid)
            sf_orders.append(oid); ok('order without the refused code placed', bool(oid), err); continue
        if k == 10:  # declined card, then a good card
            items = [(P['dupatta'], None, -1, 2)]
            for it in items: add_ui(it[0], it[1], it[3])
            to_checkout(c)
            oid, err = pay('card', card='4000000000000002')
            ok('declined card shows an error and places no order', oid is None and 'declin' in err.lower(), err)
            ok('declined payment saved as an abandoned checkout', E("S.carts.some(a=>a.email===%r&&/Payment failed/.test(a.reason)&&!a.recovered)" % c['email']))
            cart = [(P['dupatta'], -1, 2)]; exp = expect(cart, c, [])
            oid, err = pay('card')
            if oid: commit(cart, c, [], None, exp, oid)
            ok('retry with a good card succeeds and recovers the checkout', bool(oid) and E("S.carts.some(a=>a.email===%r&&a.recovered==%s)" % (c['email'], oid or 0)), err)
            sf_orders.append(oid); continue
        if k == 11:  # two codes that do not combine
            items = [(P['kurta'], None, -1, 1)]
            for it in items: add_ui(it[0], it[1], it[3])
            to_checkout(c); apply_code('EID20'); apply_code('FLAT5')
            ok('second non-combinable code is refused with a reason', 'combined' in sft(), sft()[-400:])
            remove_code('FLAT5')
            cart = [(P['kurta'], -1, 1)]; exp = expect(cart, c, ['EID20'])
            oid, err = pay('card')
            if oid: commit(cart, c, ['EID20'], None, exp, oid)
            ok('order with the better code only', bool(oid) and near(E("ORD.get(%s).disc" % oid), exp['disc']), err); sf_orders.append(oid); continue
        if k == 12:  # creates an account first, then buys signed in
            E("SF.go('account')"); pg.wait_for_timeout(120)
            pg.fill('#xs1', c['first']); pg.fill('#xs2', c['last']); pg.fill('#xs3', c['email']); pg.fill('#xs4', 'secret12345'); robot(); pg.click('#xsfsignup button:has-text("Create account")'); pg.wait_for_timeout(200)
            ok('shopper creates an account', E("!!S.sfUser") and E("CU.byEmail(%r).pw" % c['email']) != '')
        if k == 13:  # tries to sign up again with an email that already has an account
            E("SF.go('account')"); pg.wait_for_timeout(120)
            pg.fill('#xs1', 'X'); pg.fill('#xs2', 'Y'); pg.fill('#xs3', CUSTS[12]['email'].upper()); pg.fill('#xs4', 'other12345'); robot(); pg.click('#xsfsignup button:has-text("Create account")'); pg.wait_for_timeout(200)
            ok('duplicate account (different case) refused', 'exists' in sft() and not E("S.sfUser"), sft()[-300:])
        if k == 14:  # race: the last Brass Lamp is in the cart, someone else buys it first
            add_ui(P['lamp'], None, 1)
            to_checkout(c)
            api_order(CUSTS[60], [(P['lamp'], -1, 1)])
            oid, err = pay('card')
            ok('cart item sold out meanwhile: checkout refuses', oid is None and 'stock' in err.lower(), err)
            E("S.sfCart=[];SF.state.ck=null;save()"); sf_orders.append(None)
            items, codes, meth = [(P['chai'], None, -1, 2)], [], 'card'
        if k == 15:  # merchant turns the product to Draft while it is in the cart
            add_ui(P['dupatta'], None, 1)
            E("S.products.find(p=>p.id===%d).status='Draft';save()" % P['dupatta'])
            to_checkout(c)
            n0 = E("S.orders.length"); oid, err = pay('card')
            ok('product drafted while in cart: checkout refuses it', oid is None, 'order #%s placed for a draft product' % oid)
            if oid: commit([(P['dupatta'], -1, 1)], c, [], None, expect([(P['dupatta'], -1, 1)], c, []), oid)
            E("S.products.find(p=>p.id===%d).status='Active';save()" % P['dupatta'])
            sf_orders.append(oid); continue
        if k == 16:  # pre-order product (continue selling when out of stock)
            items, codes, meth = [(P['mug'], None, -1, 2)], [], 'card'
        oid, err = ui_buy(c, items, codes, meth)
        sf_orders.append(oid)
        if not oid: ok('UI shopper %d checks out' % k, False, err)
    ui_ok = [o for o in sf_orders if o]
    ok('at least 20 orders placed through the storefront UI', len(ui_ok) >= 20, len(ui_ok))
    ui_secs = time.time() - t_ui

    # bank transfer must not be marked as paid before the money arrives
    bank = [m for m in MODEL if m['id'] == sf_orders[6]]
    if bank:
        bo = E("ORD.get(%s)" % bank[0]['id'])
        ok('bank-transfer order is pending until the transfer arrives (not "Paid")', bo['pay'] != 'Paid', 'pay=%s gw=%s' % (bo['pay'], bo['gw']))
    # signed-in buyer's order appears in their account
    o12 = sf_orders[12]
    if o12:
        E("S.sfUser=CU.byEmail(%r).id;save();SF.open('account')" % CUSTS[12]['email']); pg.wait_for_timeout(200)
        ok('signed-in buyer sees the order in My account', ('#%s' % o12) in sft() or str(o12) in sft(), sft()[:300])
    # address capture for countries on the default form (Bangladesh / Sri Lanka)
    bdo = [m for m in MODEL if m['country'] in ('Bangladesh', 'Sri Lanka') and m['id'] in ui_ok]
    if bdo:
        a = E("ORD.get(%s).ship.addr" % bdo[0]['id'])
        ok('UI order (%s) keeps postal code and region in the shipping address' % bdo[0]['country'], a.get('zip') and a.get('region'), a)

    # guest buyer later creates an account: must confirm an emailed code
    g = CUSTS[1]; new_visitor(); E("SF.open('account')"); pg.wait_for_timeout(150)
    pg.fill('#xs1', g['first']); pg.fill('#xs2', g['last']); pg.fill('#xs3', g['email']); pg.fill('#xs4', 'short'); robot()
    pg.click('#xsfsignup button:has-text("Create account")'); pg.wait_for_timeout(150)
    ok('password under 8 characters refused', '8' in E("document.querySelector('#xserr').textContent") and not E("S.sfUser"))
    ok('signup placeholder states the real minimum (8)', '(min 6)' not in (pg.get_attribute('#xs4', 'placeholder') or ''), pg.get_attribute('#xs4', 'placeholder'))
    pg.fill('#xs4', 'guestpass99'); robot(); pg.click('#xsfsignup button:has-text("Create account")'); pg.wait_for_timeout(200)
    ok('guest email asks for a 6-digit emailed code', pg.locator('#xs6').count() == 1 and not E("S.sfUser"), E("document.querySelector('#xserr').textContent"))
    code = E("(S.outbox.find(m=>m.kind==='account_code'&&m.to===%r)||{body:''}).body.match(/\\d{6}/)" % g['email'])
    pg.fill('#xs6', '000000'); robot(); pg.click('#xsfsignup button:has-text("Create account")'); pg.wait_for_timeout(150)
    ok('wrong code refused', not E("S.sfUser") and 'not right' in E("document.querySelector('#xserr').textContent"))
    if code:
        pg.fill('#xs6', code[0]); robot(); pg.click('#xsfsignup button:has-text("Create account")'); pg.wait_for_timeout(200)
    ok('right code creates the account on the existing customer (no duplicate)', bool(code) and E("S.sfUser") == E("CU.byEmail(%r).id" % g['email']) and E("S.cust.filter(c=>c.email.toLowerCase()===%r).length" % g['email'].lower()) == 1)
    ok('guest buyer who typed email first keeps their name on the customer record', E("CU.byEmail(%r).first" % CUSTS[0]['email']) == CUSTS[0]['first'], E("JSON.stringify(CU.byEmail(%r))" % CUSTS[0]['email'])[:200])
    nn = E("([ids])=>ids.filter(i=>{var o=ORD.get(i);var c=o&&CU.get(o.cid);return c&&!c.first}).length", [[o for o in sf_orders if o]])
    ok('storefront buyers have their name on the customer record', nn == 0, '%d of %d storefront buyers have no name' % (nn, len([o for o in sf_orders if o])))
    ok('order shows the buyer name, not the email', E("ORD.get(%s).who" % sf_orders[0]) != CUSTS[0]['email'], E("ORD.get(%s).who" % sf_orders[0]))

    # 3c. 8 shoppers who abandon checkout (two of them come back and buy)
    ABANDON = list(range(28, 36))
    for k in ABANDON:
        c = CUSTS[k]
        new_visitor(); browse(c, k)
        if k % 3 == 0: add_ui(P['khussa'], 'S', 1)
        else: add_ui(P['kurta'], None, 1)
        to_checkout(c)
        pg.click('#xsfclose'); pg.wait_for_timeout(150)
    ab = E("S.carts.filter(a=>!a.recovered).map(a=>a.email)")
    ok('8 abandoned checkouts recorded', all(CUSTS[k]['email'] in ab for k in ABANDON), ab)
    go(pg, 'orders-abandoned', 600)
    t = pg.inner_text('#main')
    ok('abandoned checkouts page lists them by name', all(CUSTS[k]['first'] in t for k in ABANDON), t[:400])
    for k in (28, 29):  # come back and buy
        c = CUSTS[k]; new_visitor()
        oid, err = ui_buy(c, [(P['chai'], None, -1, 1)], [], 'card')
        ok('returning shopper %d buys; checkout marked recovered' % k, bool(oid) and E("S.carts.some(a=>a.email===%r&&a.recovered)" % c['email']), err)
        ui_ok.append(oid)
    # same shopper, different email case, abandons twice -> one entry
    c = dict(CUSTS[30]); new_visitor(); add_ui(P['cup'], None, 1); c['email'] = c['email'].upper(); to_checkout(c); pg.click('#xsfclose'); pg.wait_for_timeout(120)
    ok('abandoning again with the email in capitals does not duplicate the checkout', E("S.carts.filter(a=>a.email.toLowerCase()===%r&&!a.recovered).length" % CUSTS[30]['email'].lower()) == 1,
       E("S.carts.filter(a=>a.email.toLowerCase()===%r).map(a=>a.email)" % CUSTS[30]['email'].lower()))

    # ================================================================ 4. the rest buy through the order API
    t_api = time.time(); api_ms = []
    POOL = [(P['kurta'], -1), (P['dupatta'], -1), (P['khussa'], 0), (P['khussa'], 1), (P['chai'], -1), (P['pashmina'], 0), (P['cup'], -1), (P['bangles'], -1)]
    for k in range(36, 100):
        c = CUSTS[k]
        n_orders = 2 if k % 10 == 0 else 1
        for j in range(n_orders):
            cart = []
            for _ in range(RNG.randint(1, 3)):
                pid, vi = RNG.choice(POOL)
                if any(x[0] == pid and x[1] == vi for x in cart): continue
                cart.append((pid, vi, RNG.randint(1, 3)))
            codes = [RNG.choice(['', '', '', 'EID20', 'FLAT5', 'LIMIT3', 'ONCE15', 'OLD10'])]
            codes = [x for x in codes if x]
            cc = dict(c)
            if j == 1: cc['email'] = c['email'].upper()          # same person, capitals on the second order
            if k == 37: cc['email'] = '  ' + c['email'] + ' '     # stray whitespace from an integration
            gc = 'GIFT-EID-0001' if k in (40, 41) else None
            o, exp = api_order(cc, cart, codes, gc)
            api_ms.append(o['ms'])
            if k < 46 or not all(near(o[x], exp[x]) for x in ['sub', 'disc', 'ship', 'tax', 'total', 'gcAmt']):
                ok('API order #%s (%s, %s) totals match the model' % (o['id'], c['country'], '+'.join(codes) or 'no code'),
                   all(near(o[x], exp[x]) for x in ['sub', 'disc', 'ship', 'tax', 'total', 'gcAmt']), {'app': o, 'model': exp})
    api_secs = time.time() - t_api
    ok('LIMIT3 used exactly 3 times', E("S.disc2.find(d=>d.code==='LIMIT3').used") == 3, E("S.disc2.find(d=>d.code==='LIMIT3').used"))
    ok('expired OLD10 never applied', E("S.orders.filter(o=>(o.codes||[]).includes('OLD10')).length") == 0)
    ok('ONCE15 used at most once per customer', E("(()=>{var m={};S.orders.forEach(o=>{if((o.codes||[]).includes('ONCE15')){var e=o.email.toLowerCase();m[e]=(m[e]||0)+1}});return Object.values(m).every(n=>n===1)})()"))
    ok('gift card balance never negative and used once', near(E("S.gc2.find(g=>g.code==='GIFT-EID-0001').bal"), GC['bal']) and E("S.gc2.find(g=>g.code==='GIFT-EID-0001').bal") >= 0)

    # out-of-stock / bad input through the API
    n0 = E("S.orders.length"); st0 = E("S.products.find(p=>p.id===%d).stock" % P['ajrak'])
    try:
        E("ORD.place([{pid:%d,vi:-1,q:2}],{email:'oos@x.pk',first:'Out',last:'Stock',country:'Pakistan'},{method:'card'})" % P['ajrak'])
        threw = False
    except Exception:
        threw = True
    placed = E("S.orders.length") > n0
    ok('API refuses an order for a sold-out product (Ajrak Shawl, stock 0)', threw or not placed, 'order #%s placed; stock %s -> %s' % (E("S.orders[S.orders.length-1].id"), st0, E("S.products.find(p=>p.id===%d).stock" % P['ajrak'])))
    if placed:
        MODEL.append(dict(expect([(P['ajrak'], -1, 2)], {'country': 'Pakistan', 'email': 'oos@x.pk'}), id=E("S.orders[S.orders.length-1].id"), email='oos@x.pk', cart=[(P['ajrak'], -1, 2)], country='Pakistan', refunded=0.0, cancelled=False))
        STOCK[(P['ajrak'], -1)] -= 2
    n0 = E("S.orders.length")
    try:
        E("ORD.place([{pid:%d,vi:-1,q:1}],{email:'draftbuyer@x.pk',first:'D',last:'B',country:'Pakistan'},{method:'card'})" % P['draft']); threw = False
    except Exception:
        threw = True
    placed = E("S.orders.length") > n0
    ok('API refuses an order for a draft product', threw or not placed)
    if placed:
        MODEL.append(dict(expect([(P['draft'], -1, 1)], {'country': 'Pakistan', 'email': 'draftbuyer@x.pk'}), id=E("S.orders[S.orders.length-1].id"), email='draftbuyer@x.pk', cart=[(P['draft'], -1, 1)], country='Pakistan', refunded=0.0, cancelled=False))
        STOCK[(P['draft'], -1)] -= 1
    n0 = E("S.orders.length")
    try:
        E("ORD.place([{pid:%d,vi:-1,q:1}],{email:'novariant@x.pk',first:'N',last:'V',country:'Pakistan'},{method:'card'})" % P['khussa']); threw = False
    except Exception:
        threw = True
    placed = E("S.orders.length") > n0
    ok('API refuses a variant product without a variant', threw or not placed, 'placed at $%s; parent stock now %s, variants unchanged' % (E("S.orders[S.orders.length-1].sub"), E("S.products.find(p=>p.id===%d).stock" % P['khussa'])))
    if placed:
        MODEL.append(dict(expect([(P['kurta'], -1, 0)], {'country': 'Pakistan', 'email': 'novariant@x.pk'}), id=E("S.orders[S.orders.length-1].id"), email='novariant@x.pk', cart=[], country='Pakistan', refunded=0.0, cancelled=False))
        MODEL[-1].update(sub=30.0, disc=0.0, ship=2, tax=r2(30 * .17), total=r2(30 + 2 + 30 * .17))

    # ================================================================ 5. merchant verification
    orders = E("S.orders.map(o=>({id:o.id,total:o.total,sub:o.sub,disc:o.disc,tax:o.tax,ship:o.shipAmt,refunded:o.refunded,cancelled:!!o.cancelled,email:o.email,cid:o.cid}))")
    ok('order count matches (%d)' % len(MODEL), len(orders) == len(MODEL), (len(orders), len(MODEL)))
    ok('order ids are unique', len(set(o['id'] for o in orders)) == len(orders))
    byid = {o['id']: o for o in orders}
    mism = [(m['id'], m['total'], byid.get(m['id'], {}).get('total')) for m in MODEL if not near(byid.get(m['id'], {}).get('total', -1), m['total'])]
    ok('every order total equals the model', not mism, mism[:6])
    gross = r2(sum(m['total'] for m in MODEL))
    ok('sum of order totals = model ($%.2f)' % gross, near(sum(o['total'] for o in orders), gross, 0.05), sum(o['total'] for o in orders))

    # stock
    st = E("S.products.map(p=>({id:p.id,stock:p.stock,vars:p.vars.map(v=>+v.qty)}))")
    neg = [(s['id'], s['stock'], s['vars']) for s in st if s['stock'] < 0 or any(v < 0 for v in s['vars'])]
    ok('stock never negative', not neg, neg)
    def app_stock(pid, vi):
        s = [x for x in st if x['id'] == pid][0]
        return s['vars'][vi] if vi > -1 else s['stock']
    smism = [(k, STOCK[k], app_stock(*k)) for k in STOCK if app_stock(*k) != max(0, STOCK[k]) and not (k[0] == P['mug'])]
    ok('stock decreased exactly by what was sold', not smism, smism)
    over = [(k, STOCK[k]) for k in STOCK if STOCK[k] < 0 and k[0] != P['mug']]
    ok('no product was oversold (sold more than was in stock)', not over, ['pid %d vi %d short by %d' % (k[0], k[1], -v) for k, v in over])
    ok('parent stock of variant products = sum of variants', all(s['stock'] == sum(s['vars']) for s in st if s['vars']), [(s['id'], s['stock'], sum(s['vars'])) for s in st if s['vars'] and s['stock'] != sum(s['vars'])])

    # customers
    cl = E("S.cust.map(c=>c.email)")
    low = [e.strip().lower() for e in cl]
    dups = sorted(set(e for e in low if low.count(e) > 1))
    ok('no duplicate customers (case / whitespace-insensitive)', not dups, dups)
    expected_emails = set(m['email'] for m in MODEL) | set(CUSTS[k]['email'].lower() for k in ABANDON) | {CUSTS[12]['email'].lower()}
    ok('every buyer / abandoner has a customer record', expected_emails <= set(low), sorted(expected_emails - set(low))[:5])
    ok('customer count = distinct shoppers (%d)' % len(expected_emails), len(set(low)) == len(expected_emails), (len(set(low)), len(expected_emails), sorted(set(low) - expected_emails)))
    ok('stray-whitespace email stored trimmed', not any(e != e.strip() for e in cl), [e for e in cl if e != e.strip()])
    ok('every order linked to an existing customer', E("S.orders.every(o=>S.cust.some(c=>c.id===o.cid))"))
    multi = CUSTS[40]['email'].lower()
    ok('repeat buyer (2 orders, second in capitals) has both orders on one record', E("CU.orders(CU.byEmail(%r)).length" % multi) == len([m for m in MODEL if m['email'] == multi]))
    go(pg, 'customers', 800)
    t = pg.inner_text('#main')
    ok('customers page renders Unicode names', 'عائشہ' in t or 'প্রিয়া' in t or 'রহিম' in t or 'प्रिया' in t, t[:300])
    cid = E("CU.byEmail(%r).id" % CUSTS[0]['email'])
    go(pg, 'customer-%s' % cid, 500)
    ok('customer page shows Urdu name and order', 'عائشہ' in pg.inner_text('#main') and str(sf_orders[0]) in pg.inner_text('#main'), pg.inner_text('#main')[:300])

    # admin lists
    go(pg, 'orders', 900)
    t = pg.inner_text('#main')
    ok('orders list strip shows the order count', ('Orders\n%d' % len(orders)) in E("(document.querySelector('.o31stats')||{}).innerText||''"), E("(document.querySelector('.o31stats')||{}).innerText||''"))
    ok('newest order first', ('#%s' % orders[-1]['id']) in pg.inner_text('#main tbody tr >> nth=0'))
    for r in ['orders', 'customers', 'orders-abandoned', 'home', 'analytics', 'products-inventory', 'order-%s' % sf_orders[7], 'order-%s' % sf_orders[8], 'customer-%s' % E("CU.byEmail(%r).id" % CUSTS[7]['email'])]:
        go(pg, r, 500)
    ok('hostile customer names are rendered as text (no XSS)', not E("window.__xss"), E("window.__xss"))

    # fulfil / refund / cancel from the order page
    fo = ui_ok[0]
    go(pg, 'order-%s' % fo, 600)
    pg.click('[data-x="ofulfil:%s"]' % fo); pg.wait_for_timeout(300)
    pg.select_option('#xcar', 'TCS'); pg.fill('#xtrk', 'TCS40001'); pg.click('#xok'); pg.wait_for_timeout(400)
    ok('order fulfilled with tracking', E("ORD.get(%s).ful" % fo) == 'Fulfilled' and 'TCS40001' in E("JSON.stringify(ORD.get(%s).fuls)" % fo))
    # partial refund with restock: 1 unit of line 0
    ro = [m for m in MODEL if m['cart'] and m['cart'][0][2] >= 2 and m['id'] != fo][0]
    rid = ro['id']; pid, vi, q = ro['cart'][0]
    go(pg, 'order-%s' % rid, 600)
    pg.click('[data-x="orefund:%s"]' % rid); pg.wait_for_timeout(300)
    pg.fill('[data-rq="0"]', '1'); pg.dispatch_event('[data-rq="0"]', 'input'); pg.wait_for_timeout(100)
    suggested = float(pg.input_value('#xramt') or 0)
    pg.fill('#xrrs', 'Damaged'); pg.click('#xok'); pg.wait_for_timeout(400)
    line_val = E("ORD.get(%s).items[0].price" % rid)
    exp_ref = r2(line_val * (1 - ro['disc'] / ro['sub']) + ro['tax'] * (line_val * (1 - ro['disc'] / ro['sub'])) / (ro['sub'] - ro['disc'])) if ro['sub'] else 0
    ok('partial refund recorded', near(E("ORD.get(%s).refunded" % rid), suggested) and suggested > 0, (E("ORD.get(%s).refunded" % rid), suggested))
    ok('suggested refund for 1 unit = unit price after discount + its tax', near(suggested, exp_ref, 0.02), {'suggested': suggested, 'expected': exp_ref, 'order': ro})
    ro['refunded'] = E("ORD.get(%s).refunded" % rid); STOCK[(pid, vi)] += 1
    ok('refund restock value correct', E("(()=>{var p=S.products.find(p=>p.id===%d);return %d>-1?+p.vars[%d].qty:p.stock})()" % (pid, vi, vi)) == max(0, STOCK[(pid, vi)]))
    # full refund via the dialog on another order (all qty + shipping)
    fr = [m for m in MODEL if m['id'] not in (fo, rid) and m['cart'] and not m['cancelled'] and m['disc'] > 0][0]
    go(pg, 'order-%s' % fr['id'], 600)
    pg.click('[data-x="orefund:%s"]' % fr['id']); pg.wait_for_timeout(300)
    for j, (pid2, vi2, q2) in enumerate(fr['cart']):
        pg.fill('[data-rq="%d"]' % j, str(q2)); pg.dispatch_event('[data-rq="%d"]' % j, 'input')
    pg.check('#xrs'); pg.dispatch_event('#xrs', 'change'); pg.wait_for_timeout(100)
    full_sugg = float(pg.input_value('#xramt') or 0)
    ok('refunding every item + shipping suggests the full order total', near(full_sugg, fr['total'], 0.02), {'suggested': full_sugg, 'total': fr['total'], 'sub': fr['sub'], 'disc': fr['disc'], 'ship': fr['ship'], 'tax': fr['tax']})
    pg.fill('#xramt', str(fr['total'])); pg.click('#xok'); pg.wait_for_timeout(400)
    ok('full refund marks the order Refunded', E("ORD.get(%s).pay" % fr['id']) == 'Refunded')
    fr['refunded'] = fr['total']
    for pid2, vi2, q2 in fr['cart']: STOCK[(pid2, vi2)] += q2
    # cancel with restock
    co = [m for m in MODEL if m['id'] not in (fo, rid, fr['id']) and m['cart'] and not m['cancelled']][5]
    go(pg, 'order-%s' % co['id'], 600)
    pg.click('#o31db'); pg.wait_for_timeout(200); pg.click('[data-x="ocancel:%s"]' % co['id']); pg.wait_for_timeout(300)
    if pg.locator('#xok:visible').count(): pg.click('#xok'); pg.wait_for_timeout(400)
    ok('order cancelled and refunded', E("!!ORD.get(%s).cancelled" % co['id']) and near(E("ORD.get(%s).refunded" % co['id']), co['total']))
    co['cancelled'] = True; co['refunded'] = co['total']
    for pid2, vi2, q2 in co['cart']: STOCK[(pid2, vi2)] += q2
    st = E("S.products.map(p=>({id:p.id,stock:p.stock,vars:p.vars.map(v=>+v.qty)}))")
    smism = [(k, STOCK[k], app_stock(*k)) for k in STOCK if app_stock(*k) != max(0, STOCK[k]) and k[0] != P['mug']]
    ok('stock correct after refunds and cancellation', not smism, smism)

    # Home + Analytics numbers vs the model
    live = [m for m in MODEL if not m['cancelled']]
    net_sales = r2(sum(m['total'] - m['refunded'] for m in live))
    def num(s):
        s = ''.join(ch for ch in s if ch.isdigit() or ch in '.-')
        try: return float(s)
        except ValueError: return None
    go(pg, 'home', 800)
    cards = E("[...document.querySelectorAll('.h27m')].map(b=>[b.querySelector('small').innerText,b.querySelector('b').innerText])")
    hc = dict(cards)
    ok('Home: Orders = %d' % len(live), num(hc.get('Orders', '')) == len(live), hc)
    ok('Home: Total sales = $%.2f' % net_sales, near(num(hc.get('Total sales', '')) or 0, net_sales, 0.02), hc)
    todo = pg.inner_text('#main')
    ok('Home: things to do lists abandoned checkouts and out-of-stock', 'abandoned checkout' in todo and 'out of stock' in todo, todo[:500])
    go(pg, 'analytics', 900)
    ac = dict(E("[...document.querySelectorAll('.an34m')].map(a=>[a.querySelector('small').innerText,a.querySelector('b').innerText])"))
    ac.update(dict(E("[...document.querySelectorAll('.an34bt tr')].map(r=>[r.cells[0].innerText.trim(),r.cells[1].innerText])")))
    ok('Analytics: Orders = %d' % len(live), num(ac.get('Orders', '')) == len(live), ac)
    ok('Analytics: Total sales = $%.2f' % net_sales, near(num(ac.get('Total sales', '')) or 0, net_sales, 0.02), ac)
    ok('Analytics: top products include Lawn Kurta', 'Lawn Kurta' in pg.inner_text('#main'))
    # tax-inclusive store: analytics total must still equal the money taken
    E("S.taxR.inc=true;save()")
    tc = {'email': 'incl@x.pk', 'first': 'Inc', 'last': 'Lusive', 'country': 'Pakistan'}
    io = E("(()=>{var o=ORD.place([{pid:%d,vi:-1,q:1}],{email:'incl@x.pk',first:'Inc',last:'Lusive',country:'Pakistan'},{method:'card'});return {id:o.id,total:o.total,tax:o.tax}})()" % P['kurta'])
    E("S.taxR.inc=false;save()")
    go(pg, 'home', 300); go(pg, 'analytics', 800)
    ac2 = dict(E("[...document.querySelectorAll('.an34bt tr')].map(r=>[r.cells[0].innerText.trim(),r.cells[1].innerText])"))
    ok('tax-inclusive order: analytics Total sales grows by the order total ($%.2f), not total+tax' % io['total'],
       near((num(ac2.get('Total sales', '')) or 0) - net_sales, io['total'], 0.02), {'before': net_sales, 'after': ac2.get('Total sales'), 'order': io})
    E("ORD.cancel(ORD.get(%s),true,'test')" % io['id'])

    # markets: BDT market currency
    E("SF.open('home')"); pg.wait_for_timeout(200)
    curs = E("[...document.querySelectorAll('#xsf #xsfcur option')].map(o=>o.value||o.textContent)")
    ok('storefront offers the Bangladesh market currency (BDT) or the market editor warns it has no rate', 'BDT' in curs or E("S.rates.BDT>0"), curs)
    E("document.querySelector('#xsfclose').click()"); pg.wait_for_timeout(200)

    # ================================================================ 6. performance + errors
    ls = E("Object.keys(localStorage).reduce((a,k)=>a+k.length+(localStorage.getItem(k)||'').length,0)")
    sv = E("(()=>{var t=performance.now();for(var i=0;i<5;i++)save();return (performance.now()-t)/5})()")
    rt = {}
    for r in ['orders', 'customers', 'analytics', 'home', 'orders-abandoned']:
        rt[r] = E("r=>{location.hash='#'+r;var t=performance.now();route();return Math.round(performance.now()-t)}", r)
    print('PERF: %d orders, %d customers, localStorage %.1f KB, save() %.1f ms, ORD.place avg %.1f ms (max %.1f), UI phase %.0fs, API phase %.1fs, renders ms %s, total %.0fs'
          % (len(orders), len(cl), ls / 1024, sv, sum(api_ms) / max(1, len(api_ms)), max(api_ms or [0]), ui_secs, api_secs, rt, time.time() - T0))
    ok('localStorage under 4 MB with 100 customers', ls < 4 * 1024 * 1024, ls)
    ok('save() under 50 ms', sv < 50, sv)
    ok('admin pages render under 300 ms each', all(v < 300 for v in rt.values()), rt)
    ok('no JS page errors', not errs, errs[:5])
    ok('no console errors', not cons, cons[:5])
    b.close()
vt.done()
