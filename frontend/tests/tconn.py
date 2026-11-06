from playwright.sync_api import sync_playwright
import json,urllib.request
errs=[]
def api(p,tok=None,m='GET',b=None):
  rq=urllib.request.Request('http://localhost:4000'+p,method=m,data=json.dumps(b).encode() if b else None,headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+tok} if tok else {})});return json.load(urllib.request.urlopen(rq))
with sync_playwright() as p:
  b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
  pg.on('pageerror',lambda e:errs.append(('PE',str(e)[:200])))
  pg.on('console',lambda m:m.type=='error' and 'net::ERR' not in m.text and errs.append(('CE',m.text[:200])))
  pg.goto('file:///workspace/sellora/sellora-connected.html'); pg.wait_for_timeout(800)
  pg.evaluate("location.hash='integrations'"); pg.wait_for_timeout(300)
  print('offline label:',pg.inner_text('#sbk-st'))
  pg.fill('#sbk-url','http://localhost:4000');pg.fill('#sbk-em','owner@example.com');pg.fill('#sbk-pw','password123');pg.click('#sbk-go');pg.wait_for_timeout(2500)
  print('status:',pg.evaluate('SelloraBackend.status()'))
  names=pg.evaluate("S.products.filter(p=>p._rid).map(p=>p.name)");print('pulled from server:',names)
  pg.evaluate("S.products.push({id:S.nid++,name:'Headless Neck Brace',price:49.99,stock:7,status:'Active',desc:'x'});save()"); pg.wait_for_timeout(3000)
  pg.screenshot(path='shots2/connected-integrations.png')
  tok=api('/api/auth/login',m='POST',b={'email':'owner@example.com','password':'password123'})['accessToken']
  sid=api('/api/stores',tok)[0]['id']; prods=api(f'/api/stores/{sid}/products',tok)
  nb=[x for x in prods if x['title']=='Headless Neck Brace'];print('server has new product:',[(x['price'],x['variants'][0]['inventory']) for x in nb])
  print('snapshot saved:', 'frontendState' in api(f'/api/stores/{sid}',tok)['settings'])
  api(f'/api/stores/{sid}/products/{nb[0]["id"]}',tok,'PATCH',{'title':'Neck Brace (server edit)'})
  pg2=pg;pg2.reload();pg2.wait_for_timeout(2500)
  print('reload sees server edit:', pg2.evaluate("S.products.some(p=>p.name==='Neck Brace (server edit)')"))
  pg2.evaluate("S.products=S.products.filter(p=>p.name!=='Neck Brace (server edit)');save()");pg2.wait_for_timeout(2500)
  print('deleted on server:', not any(x['id']==nb[0]['id'] for x in api(f'/api/stores/{sid}/products',tok)))
  pg2.evaluate("location.hash='integrations'");pg2.wait_for_timeout(300);pg2.click('#sbk-off');pg2.wait_for_timeout(300)
  print('after disconnect:',pg2.inner_text('#sbk-st'))
print('errors:',errs)
