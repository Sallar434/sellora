"""Admin shell + Home (v50): real alerts popover, store menu, Home date range, metric cards, things to do, live visitors, recent activity."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1440, 'height': 1000}); E = pg.evaluate
    vt.signup(pg, email='shell@x.pk', store='Noor Lawn')
    go(pg, 'home', 900)
    ok('new store has no fake alerts', not any('ready to fulfil' in a['t'] for a in E("H27.alerts()")))
    ok('new store alerts are real: trial and no products', set(a['id'] for a in E("H27.alerts()")) == {'trial', 'np'}, E("H27.alerts().map(a=>a.id)"))
    ok('bell badge shows unread count', pg.inner_text('#vtop-bn') == '2')
    pg.click('#vtop-bell'); pg.wait_for_timeout(300)
    ok('bell opens an alerts popover (not a modal)', pg.locator('#h27pop').is_visible() and pg.get_attribute('#vtop-bell', 'aria-expanded') == 'true')
    pg.click('#h27all'); pg.wait_for_timeout(300)
    ok('mark all as read clears the badge', pg.inner_text('#vtop-bn') == '' and pg.locator('#h27pop .h27al.un').count() == 0)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    ok('Escape closes the popover', pg.locator('#h27pop').count() == 0)
    pg.click('#vtop-bell'); pg.wait_for_timeout(200); pg.mouse.click(700, 600); pg.wait_for_timeout(200)
    ok('clicking outside closes it', pg.locator('#h27pop').count() == 0)
    pg.click('#vtop-store'); pg.wait_for_timeout(200)
    ok('store menu shows store name and domain', 'Noor Lawn' in pg.inner_text('.h27ddh') and 'vendom.app' in pg.inner_text('.h27ddh'))
    ok('store menu has preferences, settings, plan, sign out', all(pg.locator('#vtop-dd ' + s).count() == 1 for s in ['a[href="#online-store-preferences"]:not([data-vt])', 'a[href="#s-general"]', 'a[href="#s-plan"]', '#vtop-out']))
    pg.click('#vtop-bell'); pg.wait_for_timeout(200)
    ok('opening alerts closes the store menu', E("document.querySelector('#vtop-dd').hidden") and pg.locator('#h27pop').count() == 1)
    pg.click('#vtop-store'); pg.wait_for_timeout(200)
    ok('opening the store menu closes alerts', pg.locator('#h27pop').count() == 0 and not E("document.querySelector('#vtop-dd').hidden"))
    pg.mouse.click(700, 600)
    # real data
    E("""(function(){var now=Date.now();S.products.push({id:S.nid++,name:'Lawn Kurta',price:35,stock:0,status:'Active',desc:'',cols:[],tags:[],imgs:[],vars:[],opts:[],seo:{}});
      S.products.push({id:S.nid++,name:'Silk Dupatta',price:20,stock:3,status:'Active',desc:'',cols:[],tags:[],imgs:[],vars:[],opts:[],seo:{}});
      S.orders.push({id:S.oid++,v30:1,who:'Ayesha Khan',email:'a@x.pk',items:[],sub:40,total:40,refunded:0,at:now-3600e3,pay:'Paid',ful:'Unfulfilled',tl:[{at:now-3600e3,t:'Order placed'}]});
      S.orders.push({id:S.oid++,v30:1,who:'Bilal',email:'b@x.pk',items:[],sub:60,total:60,refunded:0,at:now-40*864e5,pay:'Paid',ful:'Fulfilled',tl:[]});
      S.sess24=(S.sess24||[]).concat([{at:now-60e3,src:'direct',type:'direct'},{at:now-2*864e5,src:'google',type:'organic'}]);save()})()""")
    go(pg, 'orders', 300); go(pg, 'home', 900)
    ids = set(a['id'] for a in E("H27.alerts()"))
    ok('alerts follow the store: orders to fulfil, out of stock, low stock', {'uf', 'oos', 'low'} <= ids, ids)
    ok('badge counts only new alerts', pg.inner_text('#vtop-bn') == '3', pg.inner_text('#vtop-bn'))
    ok('Home has a date range picker', pg.locator('#h27days option').count() == 4 and E("document.querySelector('#h27days').value") == '30')
    ok('four metric cards with trend lines', pg.locator('.h27m').count() == 4 and pg.locator('.h27m svg').count() == 3)
    ok('30-day numbers come from real orders', '$40.00' in pg.inner_text('.h27ms') or 'Rs' in pg.inner_text('.h27ms'), pg.inner_text('.h27ms'))
    ok('orders card shows 1 in 30 days', E("[...document.querySelectorAll('.h27m')][2].querySelector('b').textContent") == '1')
    pg.select_option('#h27days', '90'); pg.wait_for_timeout(300)
    ok('changing the range recomputes (90 days = 2 orders)', E("[...document.querySelectorAll('.h27m')][2].querySelector('b').textContent") == '2')
    ok('live visitors from the last 5 minutes', '1 live visitor' in pg.inner_text('.h27live'))
    ok('things to do lists real work', all(w in pg.inner_text('.h27two') for w in ['1 order to fulfil', '1 product out of stock']))
    ok('recent activity shows the order', 'Order #' in pg.inner_text('.h27feed') and 'Ayesha Khan' in pg.inner_text('.h27feed'))
    pg.click('.h27todo >> text=to fulfil'); pg.wait_for_timeout(600)
    ok('things to do links open the page', E("location.hash") == '#orders')
    go(pg, 'home', 700); pg.click('.h27m >> nth=1'); pg.wait_for_timeout(600)
    ok('metric card opens Analytics', E("location.hash") == '#analytics')
    pg.set_viewport_size({'width': 390, 'height': 844}); go(pg, 'home', 800)
    ok('Home fits a phone', E("document.documentElement.scrollWidth<=392"), E("document.documentElement.scrollWidth"))
    b.close()
vt.done(errs)
