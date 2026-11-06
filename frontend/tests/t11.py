# t11: subscription plans, usage meters, overage settings, upgrade/downgrade, billing invoices, platform admin
from playwright.sync_api import sync_playwright
import json
res=[];errs=[]
def ok(n,c,x=''):res.append((n,bool(c)));print('PASS' if c else 'FAIL',n,'::',x)
def go(pg,h):pg.evaluate(f"location.hash='{h}';route()");pg.wait_for_timeout(350)
def okm(pg):pg.click('#xok') if pg.query_selector('#xok') else None;pg.wait_for_timeout(300)
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1400,'height':900})
  pg.on('pageerror',lambda e:errs.append(str(e)[:200]));pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:200]))
  pg.on('dialog',lambda d:d.accept())
  pg.goto('file:///workspace/sellora/sellora.html');pg.wait_for_timeout(800)
  go(pg,'s-plan');t=pg.inner_text('#main')
  ok('plan page loads with trial','Free trial' in t and 'Grow' in t,t[:120])
  for w in ['Usage this month','Compare plans','Grow','Basic','Advanced','Enterprise','Pakistani Rupee (PKR)','Sellora Pay card fee','Auto-pay overage','Stop at limit']: ok('plan page shows '+w,w in t)
  ok('9 usage meters',len(pg.query_selector_all('.m10bar'))==9)
  pg.click('[data-x="p10cur:PKR"]');pg.wait_for_timeout(300);ok('Rs 2,999 basic monthly','Rs 300' in pg.inner_text('#main'))
  pg.click('[data-x="p10int:annual"]');pg.wait_for_timeout(300);ok('annual price 20% off','Rs 2,880' in pg.inner_text('#main'))
  pg.click('[data-x="p10cur:USD"]');pg.wait_for_timeout(300);ok('USD prices','$2.15' in pg.inner_text('#main') or '$20.64' in pg.inner_text('#main'))
  pg.click('[data-x="p10cur:PKR"]');pg.click('[data-x="p10int:monthly"]');pg.wait_for_timeout(300)
  # trial blocks AI overage
  pg.evaluate("S.sub9.cur='PKR';S.use9.ai=249;save()");ok('trial blocks AI overage',pg.evaluate("window.meter9('ai',5)")==False);okm(pg)
  # start Basic
  go(pg,'s-plan');pg.click('[data-x="p10pick:basic"]');pg.wait_for_timeout(300);ok('upgrade modal shows charge','Rs 300' in pg.inner_text('body'));okm(pg)
  ok('now on Basic active',pg.evaluate("S.sub9.plan==='basic'&&S.sub9.status==='active'"))
  ok('plan invoice created',pg.evaluate("S.inv9.length===1&&S.inv9[0].tot===300"))
  # stop mode blocks
  pg.evaluate("S.use9={ai:99,whatsapp:0,orders:0,email:0};save()");ok('stop mode blocks at limit',pg.evaluate("window.meter9('ai',1)===true&&window.meter9('ai',1)===false"));okm(pg)
  ok('100% alert recorded',pg.evaluate("Object.keys(S.al9).some(k=>k.endsWith('100'))"))
  # auto mode + cap
  go(pg,'s-plan');pg.check('#m10a');pg.fill('#m10cap','100');pg.click('[data-x="p10set"]');pg.wait_for_timeout(300)
  ok('settings saved',pg.evaluate("S.sub9.mode==='auto'&&S.sub9.cap===100"))
  ok('auto mode allows overage',pg.evaluate("window.meter9('ai',50)"))
  pg.evaluate("S.use9.whatsapp=25;save()");go(pg,'s-plan')
  ok('projected overage AI 40 + WA 80 capped at 100','Rs 100' in pg.inner_text('#m10proj'),pg.inner_text('#m10proj'))
  ok('cap blocks extra beyond cap',pg.evaluate("window.meter9('whatsapp',1)")==False);okm(pg)
  ok('meter turns red at 100%','180, 35, 24' in pg.evaluate("getComputedStyle(document.querySelectorAll('.m10bar span')[0]).backgroundColor") or pg.evaluate("[...document.querySelectorAll('.m10bar span')].some(s=>s.style.background.includes('180'))"))
  # products hard cap
  ok('products hard limit (Basic 500)',pg.evaluate("(()=>{var s=S.plans9[1].q.products;S.plans9[1].q.products=S.products.length;var r=window.meter9('products',1);S.plans9[1].q.products=s;return r})()")==False);okm(pg)
  # billing run
  go(pg,'finance-billing');pg.click('[data-x="p10run"]');pg.wait_for_timeout(200);okm(pg)
  inv=pg.evaluate("S.inv9[0]");ok('month-end bill has overage + credit + plan',[l['k'] for l in inv['lines']]==['overage','overage','credit','plan'],json.dumps(inv['lines']))
  ok('bill total = cap 100 + plan 300',abs(inv['tot']-400)<0.01,inv['tot'])
  ok('counters reset',pg.evaluate("!S.use9.ai&&!S.use9.whatsapp"))
  t=pg.inner_text('#main');ok('billing page lists overage line','WhatsApp messages: 10 over' in t,t[:300])
  pg.click('[data-x^="p10inv:"]');pg.wait_for_timeout(300);ok('invoice detail modal','Total' in pg.inner_text('body'));pg.keyboard.press('Escape');pg.wait_for_timeout(200)
  # upgrade to grow (prorated) then downgrade
  go(pg,'s-plan');pg.click('[data-x="p10pick:grow"]');pg.wait_for_timeout(300);ok('prorated upgrade text','Prorated' in pg.inner_text('body'));okm(pg)
  ok('upgraded to grow',pg.evaluate("S.sub9.plan==='grow'"))
  go(pg,'s-plan');pg.click('[data-x="p10pick:basic"]');pg.wait_for_timeout(300);okm(pg)
  ok('downgrade pending',pg.evaluate("S.sub9.pending==='basic'&&S.sub9.plan==='grow'"));ok('pending banner','scheduled at period end' in pg.inner_text('#main'))
  pg.click('[data-x="p10undo"]');pg.wait_for_timeout(300);ok('cancel downgrade',pg.evaluate("!S.sub9.pending"))
  # admin edits
  go(pg,'admin-plans');ok('admin page','Platform admin' in pg.inner_text('#main'))
  pg.fill('#ap_1_pkr','349');pg.fill('#aq_1_orders','350');pg.click('[data-x="p10asave"]');pg.wait_for_timeout(300)
  ok('admin price saved',pg.evaluate("S.plans9[1].pkr===349&&S.plans9[1].q.orders===350"))
  go(pg,'s-plan');ok('plan table reflects admin change','Rs 349' in pg.inner_text('#main'))
  pg.reload();pg.wait_for_timeout(800);ok('persists after reload',pg.evaluate("S.sub9.plan==='grow'&&S.plans9[1].pkr===349&&S.inv9.length>=2"))
  ok('localStorage key sellora',pg.evaluate("!!localStorage.getItem('sellora')"))
  pg.evaluate("S.plans9=null;S.sub9=null;S.inv9=[];save()")
  ok('no console errors',not errs,errs[:3])
  b.close()
print(sum(1 for r in res if r[1]),'/',len(res))
json.dump(res,open('t11-results.json','w'))
