from playwright.sync_api import sync_playwright
import json,sys
R=json.load(open('routes.json'))+['settings','s-integrations','sellora-pay','pay-onboarding','pay-buyer','pay-embed','pay-admin','ai-builder','ai-seo','ai-files','app-store','app-installed','app-meta','app-reviews','app-chat','shipping-zones','notifications-outbox','integrations','staff-access','orders-abandoned','products-gift-cards','report-sales','report-inventory','nonexistent-xyz']
errs=[];clk='click' in sys.argv
with sync_playwright() as p:
  b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
  cur={'r':''}
  pg.on('pageerror',lambda e:errs.append((cur['r'],'PE',str(e)[:200])))
  pg.on('console',lambda m:m.type=='error' and errs.append((cur['r'],'CE',m.text[:200])))
  pg.on('dialog',lambda d:d.accept())
  pg.goto('file:///workspace/sellora/sellora.html'); pg.wait_for_timeout(800)
  for r in R:
    cur['r']=r
    pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(150)
    if clk:
      n=len(pg.query_selector_all('#main [data-x]'))
      for i in range(min(n,30)):
        pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(60)
        els=pg.query_selector_all('#main [data-x]')
        if i>=len(els):break
        dx=els[i].get_attribute('data-x')
        if any(k in dx for k in ['del','appun','reset','cancel']):continue
        cur['r']=r+' '+dx
        try: els[i].click(timeout=500)
        except Exception: pass
        pg.wait_for_timeout(80);pg.keyboard.press('Escape')
        pg.evaluate("typeof closeM=='function'&&closeM();document.querySelectorAll('.xmo').forEach(m=>m.remove())")
      cur['r']=r
  print('main text 404:',pg.evaluate("location.hash='nonexistent-xyz';document.querySelector('#main').innerText.slice(0,60)"))
  for e in errs: print(e)
  print('N errors',len(errs))
