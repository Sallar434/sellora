"""Analytics (v57): dashboard with date range, comparison, metric cards, sales over time, breakdown, channel donut, AOV, products, sessions, conversion — all from real orders."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vt
from vt import ok, go
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b, pg, errs = vt.launch(p, viewport={'width': 1280, 'height': 900}); E = pg.evaluate
    vt.signup(pg, email='an37@x.pk', store='Noor Lawn')
    E("""(function(){var p={id:S.nid++,name:'Lawn Kurta',price:40,stock:99,status:'Active',desc:'',cols:[],tags:[],imgs:[],vars:[],opts:[],seo:{}};S.products.push(p);
      var a=ORD.place([{pid:p.id,vi:-1,q:2}],{email:'a@x.pk',first:'A',last:'X',country:'Pakistan'},{method:'Card'});
      var b=ORD.place([{pid:p.id,vi:-1,q:1}],{email:'a@x.pk',first:'A',last:'X',country:'Pakistan'},{method:'Card'});b.at=Date.now()-10*864e5;
      var c=ORD.place([{pid:p.id,vi:-1,q:1}],{email:'z@x.pk',first:'Z',last:'Y',country:'Pakistan'},{method:'Card'});c.at=Date.now()-60*864e5;
      ORD.refund(a,[0],false,false,10,'damaged');save()})()""")
    go(pg, 'home', 300); go(pg, 'analytics', 800)
    t = pg.inner_text('#main')
    ok('dashboard sections', all(w in t for w in ['Gross sales', 'Returning customer rate', 'Orders fulfilled', 'Total sales over time', 'Total sales breakdown', 'Total sales by sales channel', 'Average order value over time', 'Total sales by product', 'Online store sessions', 'Conversion rate']))
    ok('last 30 days counts 2 orders', E("[...document.querySelectorAll('.an34m')][3].querySelector('b').textContent") == '2')
    ok('gross sales = $120', E("[...document.querySelectorAll('.an34m')][0].querySelector('b').textContent") == '$120.00')
    ok('sales reversals show the refund', '-$10.00' in pg.inner_text('.an34bt') or '−$10.00' in pg.inner_text('.an34bt') or '$-10.00' in pg.inner_text('.an34bt'), pg.inner_text('.an34bt'))
    ok('returning customer rate is 100% (A ordered twice)', E("[...document.querySelectorAll('.an34m')][1].querySelector('b').textContent") == '100%')
    ok('charts are drawn', pg.locator('svg.an34ch').count() == 3)
    pg.select_option('#an34r', '90'); pg.wait_for_timeout(400)
    ok('90 days counts 3 orders', E("[...document.querySelectorAll('.an34m')][3].querySelector('b').textContent") == '3')
    pg.select_option('#an34r', 'today'); pg.wait_for_timeout(400)
    ok('today counts 1 order, hourly axis', E("[...document.querySelectorAll('.an34m')][3].querySelector('b').textContent") == '1' and ('AM' in pg.inner_text('#main') or 'PM' in pg.inner_text('#main')))
    ok('range change does not raise the unsaved bar', not E("(document.querySelector('#p8save')||{classList:{contains:()=>false}}).classList.contains('on')"))
    pg.click('.an34bt a >> text=Net sales'); pg.wait_for_timeout(500)
    ok('breakdown rows open reports', E("location.hash") == '#analytics-reports')
    b.close()
vt.done(errs)
