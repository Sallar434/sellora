"""VendOm Pay Protection vs direct payments, buyer accounts, ship-now, not received (shipping cost kept), deadlines, methods by country."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b, pg, errs = vt.launch(p)
    E = pg.evaluate
    vt.signup(pg, email='seller@shop.pk', store='Noor Lawn', plan='advanced')
    E("S.sub9.status='active';S.online=S.online||{};S.online.password=false;S.online.live=true;save()")
    E("S.products.push({id:S.nid++,name:'Lawn Suit',price:25,stock:50,status:'Active',desc:'',vars:[],opts:[],imgs:[],tags:[]});save()")
    pid = E("S.products[0].id")
    W = pg.wait_for_timeout
    sf = lambda: E("(document.querySelector('#xsf')||{innerText:''}).innerText")

    # ---- seller picks how buyers pay
    go(pg, 'vendom-pay', 500)
    ok('VendOm Pay page shows the three payment modes', all(w in E("document.querySelector('#main').innerText") for w in ['How buyers pay', 'Buyer chooses', 'Always protected', 'Direct only']))
    ok('default is "buyer chooses"', E("PAY.sp().cfg.mode") == 'choice')

    def checkout(email, protect=None, pw=None, country='Pakistan'):
        E("S.sfCart=[];SFX_=0;save()")
        E("SF.open('product:%d')" % pid); W(300); pg.click('#xsf [data-sfbuy]'); W(400)
        if pg.query_selector('#xk_country'): pg.select_option('#xk_country', label=country); W(300)
        for f in pg.query_selector_all('#xsf [data-ckf]'):
            if f.evaluate('e=>e.tagName') == 'SELECT':
                if not f.input_value():
                    opts = f.evaluate('e=>[...e.options].map(o=>o.value).filter(Boolean)')
                    if opts: f.select_option(opts[0])
                continue
            if f.input_value(): continue
            k = (f.get_attribute('data-ckf') or '').lower()
            f.fill('+923001234567' if 'phone' in k else '54000' if ('post' in k or 'zip' in k) else 'Lahore' if 'city' in k else 'Test')
        pg.fill('#xk_email', email)
        if protect is not None and pg.query_selector('#xk_prot') and pg.is_checked('#xk_prot') != protect: pg.click('#xk_prot'); W(300)
        if pw and pg.query_selector('#xk_pw'): pg.fill('#xk_pw', pw)
        if pg.query_selector('#xk_num'):
            if pg.query_selector('#xk_cn'): pg.fill('#xk_cn', 'Test Buyer')
            pg.fill('#xk_num', '4242424242424242'); pg.fill('#xk_exp', '12/30'); pg.fill('#xk_cvc', '123')
        n0 = E("S.orders.length"); pg.click('#xkpaybtn'); W(1300)
        err = E("(document.querySelector('#xkerr')||{}).innerText||''")
        o = E("S.orders.length>%d?S.orders[S.orders.length-1].id:null" % n0)
        E("var c=document.querySelector('#xsfclose');c&&c.click()")
        return o, err

    # ---- direct payment (guest, protection off)
    sw0 = E("PAY.sellerW().available")
    o1, err = checkout('guest@x.pk', protect=False)
    ok('guest pays directly', o1 is not None and not E("ORD.get(%s).protected" % o1), err)
    ok('direct: no hold, seller paid at once (minus fee)', E("!PAY.escOf(ORD.get(%s))" % o1) and E("PAY.sellerW().available") > sw0)
    # ---- protection needs a buyer account
    E("S.sfUser=null;save()")
    o2, err = checkout('amna@x.pk', protect=True)
    ok('protection without a password is refused', o2 is None and 'password' in err.lower(), err)
    o2, err = checkout('amna@x.pk', protect=True, pw='password123')
    ok('protected order placed with a new buyer account', o2 is not None and E("ORD.get(%s).protected" % o2) and E("!!S.sfUser"), err)
    e2 = "PAY.escOf(ORD.get(%s))" % o2
    ok('money held, ship-by date set', E(e2 + ".st") == 'Held' and E(e2 + ".shipBy") > E("Date.now()") and not E(e2 + ".shippedAt"))
    ok('seller told to ship now (email + alert)', E("JSON.stringify(S).includes('Payment secured for order #%s')" % o2))
    # ---- seller ships with their courier cost
    go(pg, 'order-%s' % o2, 500)
    ok('order shows the protection panel', 'VendOm Pay Protection' in E("document.querySelector('#main').innerText") and 'Ship by' in E("document.querySelector('#main').innerText"))
    pg.click('[data-x="ofulfil:%s"]' % o2); W(300)
    ok('fulfil asks for the seller shipping cost', pg.locator('#xshipc').count() == 1)
    pg.fill('#xshipc', '3'); pg.fill('#xtrk', 'TCS123'); pg.click('#xok'); W(400)
    ok('shipped: release date set, cost recorded', E(e2 + ".shippedAt") and E(e2 + ".shipCost") == 3 and E(e2 + ".releaseAt") > E("Date.now()"))
    ok('buyer asked to confirm delivery', E("JSON.stringify(S).includes('Did you receive order #%s?')" % o2))
    # ---- buyer: not received
    E("SF.open('account')"); W(400)
    ok('account shows Confirm / Not received / Other problem', pg.locator('[data-sfesc^="notrec:"]').count() >= 1 and pg.locator('[data-sfesc^="confirm:"]').count() >= 1)
    pg.click('[data-sfesc="notrec:%s"]' % E(e2 + ".id")); W(400)
    ok('report opens a "not received" case for the seller', E(e2 + ".st") == 'Disputed' and E("S.sp.disputes[0].kind") == 'not_received')
    E("var c=document.querySelector('#xsfclose');c&&c.click()")
    # ---- seller: parcel came back
    total = E("ORD.get(%s).total" % o2); sw1 = E("PAY.sellerW().available")
    go(pg, 'order-%s' % o2, 500); pg.click('[data-x="pay16ret:%s"]' % o2); W(500)
    ok('buyer refunded minus the shipping cost', abs(E("ORD.get(%s).refunded" % o2) - (total - 3)) < 0.01, E("ORD.get(%s).refunded" % o2))
    ok('seller gets the shipping cost (no fee)', abs(E("PAY.sellerW().available") - sw1 - 3) < 0.01, E("PAY.sellerW().available") - sw1)
    ok('case closed', E("S.sp.disputes[0].st") == 'Resolved' and E("S.sp.disputes[0].out") == 'not_received')
    # ---- buyer confirms a normal protected order
    o3, err = checkout('amna@x.pk', protect=True)
    E3 = "PAY.escOf(ORD.get(%s))" % o3
    E("ORD.fulfill(ORD.get(%s),[1],'TCS','T3',false)" % o3)
    E("SF.open('account')"); W(300); pg.click('[data-sfesc="confirm:%s"]' % E(E3 + ".id")); W(300)
    ok('confirm releases the money to the seller', E(E3 + ".st") == 'Released')
    E("var c=document.querySelector('#xsfclose');c&&c.click()")
    # ---- deadlines
    o4, err = checkout('amna@x.pk', protect=True)
    E("PAY.escOf(ORD.get(%s)).shipBy=Date.now()-1000;PAY.tick()" % o4)
    ok('not shipped in time → cancelled and refunded in full', E("!!ORD.get(%s).cancelled" % o4) and abs(E("ORD.get(%s).refunded-ORD.get(%s).total" % (o4, o4))) < 0.01)
    o5, err = checkout('amna@x.pk', protect=True)
    E5 = "PAY.escOf(ORD.get(%s))" % o5
    E("ORD.get(%s)._shipCost=2;ORD.fulfill(ORD.get(%s),[1],'TCS','T5',false)" % (o5, o5))
    E("PAY.notReceived(%s.id,'')" % E5)
    E("S.sp.disputes[0].respondBy=Date.now()-1000;PAY.tick()")
    ok('seller silent → settled: buyer refunded minus shipping', abs(E("ORD.get(%s).refunded" % o5) - (E("ORD.get(%s).total" % o5) - 2)) < 0.01)
    o6, err = checkout('amna@x.pk', protect=True)
    r = E("PAY.notReceived(PAY.escOf(ORD.get(%s)).id,'')" % o6)
    ok('not received before shipping → full refund', r['outcome'] == 'refunded_in_full' and E("!!ORD.get(%s).cancelled" % o6))
    E("PAY.escOf(ORD.get(%s))" % o6)
    # ---- shipped orders release only after the window, never before shipping
    o7, err = checkout('amna@x.pk', protect=True)
    E7 = "PAY.escOf(ORD.get(%s))" % o7
    E("PAY.tick()")
    ok('unshipped order is never auto-released', E(E7 + ".st") == 'Held')
    # ---- always protected / direct only
    go(pg, 'vendom-pay', 400); pg.click('[data-xc="pay16mode:direct"]'); W(200)
    ok('switch to direct only', E("PAY.sp().cfg.mode") == 'direct')
    E("S.sfUser=null;save()")
    o8, err = checkout('walkin@x.pk')
    ok('direct only: no protection box, paid to seller', o8 is not None and not E("ORD.get(%s).protected" % o8))
    go(pg, 'vendom-pay', 400); pg.click('[data-xc="pay16mode:protected"]'); W(200)
    E("S.sfUser=null;save()")
    o9, err = checkout('new@x.pk', pw='password123')
    ok('always protected: guest must create an account, order protected', o9 is not None and E("ORD.get(%s).protected" % o9) and E("!!S.sfUser"), err)
    # ---- international methods by country
    E("S.sfCart=[];save()"); E("SF.open('product:%d')" % pid); W(300); pg.click('#xsf [data-sfbuy]'); W(400)
    pg.select_option('#xk_country', label='Netherlands'); W(300)
    ok('Netherlands buyer sees iDEAL', 'iDEAL' in sf(), [E('SFX_k=SF.state.ck&&SF.state.ck.country'), sf()[sf().find('International'):][:200]])
    pg.select_option('#xk_country', label='Pakistan'); W(300)
    ok('Pakistan buyer sees JazzCash and Easypaisa', 'JazzCash' in sf() and 'Easypaisa' in sf())
    ok('no page errors', not errs, errs)
    b.close()
vt.done()
