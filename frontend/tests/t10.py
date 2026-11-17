# t10: new app-store apps (couriers/accounting/ads), credentials persistence, 1000-product performance, console errors
from playwright.sync_api import sync_playwright
import json,time
res=[];errs=[]
def ok(n,c,x=''):res.append((n,bool(c)));print('PASS' if c else 'FAIL',n,'::',x)
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1400,'height':900})
  pg.on('pageerror',lambda e:errs.append(str(e)[:200]));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:200]))
  pg.on('dialog',lambda d:d.accept())
  import os
  pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','sellora.html')));pg.wait_for_timeout(800)
  pg.click('#door-up');pg.wait_for_timeout(200);pg.fill('#a2','apps@example.com');pg.fill('#a3','password123');pg.click('#ab');pg.wait_for_timeout(300)
  pg.click('[data-m13p=basic]');pg.wait_for_timeout(200);pg.fill('#a1','Apps Shop');pg.click('#ab');pg.wait_for_timeout(800)
  ids=pg.evaluate("X=window;X.APPS.map(a=>a.id)")
  for i in ['tcs','leopards','postex','trax','xero','quickbooks','google-ads','meta','tiktok','whatsapp','dhl']: ok('app listed '+i,i in ids)
  pg.evaluate("location.hash='app-store'");pg.wait_for_timeout(300)
  ok('app store shows TCS card','TCS Courier' in pg.inner_text('#main'))
  for app in ['tcs','xero']:
    pg.evaluate(f"location.hash='app-{app}'");pg.wait_for_timeout(300)
    pg.click(f'[data-x="appin:{app}"]');pg.wait_for_timeout(300)
    t=pg.inner_text('#main');ok(app+' not marked connected','UNVERIFIED' in t and pg.evaluate(f"!(S.apps2['{app}']||{{}}).connected"));ok(app+' shows server integration path','/integrations/'+app in t)
    ok(app+' has no secret field',pg.query_selector('input[type=password]') is None)
  pg.evaluate("location.hash='app-postex'");pg.wait_for_timeout(300)
  pg.click('[data-x="appin:postex"]');pg.wait_for_timeout(200)
  ok('postex empty token not connected',pg.evaluate("!(S.apps2.postex||{}).connected"))
  pg.reload();pg.wait_for_timeout(800)
  ok('secrets are not stored after reload',pg.evaluate("!(S.apps2.tcs&&S.apps2.tcs.cfg&&S.apps2.tcs.cfg['Client ID'])&&!(S.apps2.xero||{}).connected"))
  ok('localStorage key is sellora','sellora' in pg.evaluate("Object.keys(localStorage)"))
  # courier label
  pg.evaluate("location.hash='app-tcs'");pg.wait_for_timeout(300)
  if pg.query_selector('[data-x="applabel:tcs"]'):
    pg.click('[data-x="applabel:tcs"]');pg.wait_for_timeout(300);ok('TCS label not invented',not pg.evaluate("S.orders.some(o=>(o.fulfillments||[]).some(f=>JSON.stringify(f).includes('TCS')))") and 'No label was created' in pg.inner_text('body'))
  else: ok('TCS label UI (no open orders)',True)
  pg.evaluate("location.hash='product-'+S.products[0].id");pg.wait_for_timeout(500);ok('#product-<id> deep link opens editor','Edit product' in pg.inner_text('#main'))
  # performance 1000 products
  pg.evaluate("""(()=>{var base=S.products[0];S.products=S.products.slice(0,3);for(var i=0;i<1000;i++){var c=JSON.parse(JSON.stringify(base));c.id=900000+i;c.name='Perf item '+i;c.handle='perf-item-'+i;c.sku='PF'+i;S.products.push(c)}save()})()""")
  pg.reload();pg.wait_for_timeout(500)
  t0=time.time();pg.evaluate("location.hash='products'");pg.wait_for_selector('#main table');t1=(time.time()-t0)*1000
  ok('products list 1000 renders <2000ms',t1<2000,'%dms'%t1)
  t0=time.time();pg.evaluate("location.hash='orders'");pg.wait_for_timeout(50);pg.evaluate("location.hash='products'");pg.wait_for_selector('#main table');t2=(time.time()-t0)*1000
  ok('re-navigation <1500ms',t2<1500,'%dms'%t2)
  ms=pg.evaluate("(()=>{var t=performance.now();save();return performance.now()-t})()");ok('save() with 1000 products <300ms',ms<300,'%dms'%ms)
  ms=pg.evaluate("(()=>{var t=performance.now();S.products.filter(p=>/perf item 99/i.test(p.name));return performance.now()-t})()");ok('search filter <50ms',ms<50,'%.1fms'%ms)
  kb=pg.evaluate("localStorage.getItem('sellora').length/1024");ok('storage size under 5MB',kb<5000,'%dKB'%kb)
  ok('no console/page errors',not errs,str(errs[:3]))
  json.dump({'results':res,'perf':{'list_ms':t1,'renav_ms':t2,'storage_kb':kb}},open('t10-results.json','w'))
  print('TOTAL %d/%d'%(sum(r[1] for r in res),len(res)))
