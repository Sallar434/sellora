from playwright.sync_api import sync_playwright
import re,json
errs=[]
with sync_playwright() as p:
  b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
  pg.on('pageerror',lambda e:errs.append(('PAGEERR',pg.url.split('#')[-1],str(e)[:160])))
  pg.on('console',lambda m:m.type=='error' and errs.append(('CONSOLE',pg.url.split('#')[-1],m.text[:160])))
  pg.on('dialog',lambda d:d.accept())
  pg.goto('file:///workspace/sellora/s.html'); pg.wait_for_timeout(800)
  print('HASH',pg.url.split('#')[-1]); print(pg.inner_text('body')[:600])
  # try signup
  for sel in ['input[type=email]','input[type=password]','input[type=text]']:
    for el in pg.query_selector_all(sel):
      try: el.fill('test@x.com' if 'email' in sel else 'Passw0rd!23')
      except: pass
  for t in ['Create','Sign up','Continue','Start','Log in','Sign in']:
    btn=pg.query_selector(f'button:has-text("{t}")')
    if btn:
      try: btn.click(timeout=1500); pg.wait_for_timeout(500); print('clicked',t)
      except Exception as e: pass
  print('AFTER',pg.url.split('#')[-1]); print(pg.inner_text('body')[:500])
  hrefs=sorted(set(pg.eval_on_selector_all('a[href^="#"],[data-r],[data-route]','els=>els.map(e=>e.getAttribute("href")||e.dataset.r||e.dataset.route)')))
  print('ROUTES',hrefs)
  json.dump(hrefs,open('routes.json','w'))
  pg.context.storage_state(path='st.json')
  ls=pg.evaluate("localStorage.getItem('sellora')"); print('LS',(ls or '')[:300])
print(errs)
