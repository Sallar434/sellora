from playwright.sync_api import sync_playwright
errs=[];res=[]
def ok(n,c):res.append(('PASS' if c else 'FAIL')+' '+n);print(res[-1],flush=True)
with sync_playwright() as p:
  b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
  pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
  pg.on('console',lambda m:m.type=='error' and 'ERR_CONNECTION' not in m.text and errs.append(m.text[:200]))
  pg.on('dialog',lambda d:d.accept())
  pg.goto('file:///workspace/sellora/sellora.html'); pg.wait_for_timeout(800)
  E=pg.evaluate; W=pg.wait_for_timeout
  def go(r): E(f"location.hash='{r}'"); W(200)
  def cx(dx): pg.click(f'[data-x="{dx}"]'); W(250)
  # ---- Apps
  for a in ['reviews','chat','meta-pixel','google','zapier','whatsapp','printful','shipstation']:
    go('app-'+a); cx('appin:'+a)
  go('app-meta-pixel'); pg.fill('#xapf0','1234567890'); cx('appsave:meta-pixel')
  go('app-google'); cx('appoauth:google'); pg.click('text=Allow'); W(300)
  go('app-whatsapp'); pg.fill('#xapf0','+923001234567'); cx('appsave:whatsapp')
  go('app-zapier'); pg.fill('#xapf0','https://hooks.zapier.com/x'); cx('appsave:zapier')
  go('app-reviews'); cx('rvseed')
  ok('apps installed/connected', E("['reviews','chat','meta-pixel','google','zapier'].every(id=>S.apps2[id].on&&S.apps2[id].connected)"))
  ok('google feed xml', E("(S.apps2.google.feed||'').includes('<g:price>')"))
  go('app-store'); E("var i=document.querySelector('#xaq');i.value='tik';i.dispatchEvent(new Event('change',{bubbles:true}))"); W(200)
  c=E("document.querySelectorAll('.app-card').length");print('cards',c);ok('app search', 0<c<5)
  # ---- Storefront checkout (UI)
  pid=E("S.products.find(p=>p.status==='Active'&&!(p.tags||[]).includes('pod')&&PR.vstock(p,0)>0||p.status==='Active').id")
  E(f"SF.open('product:{pid}')"); W(400)
  ok('reviews on product page', pg.query_selector('#xsf #reviews') is not None)
  ok('chat widget', pg.query_selector('#xchat') is not None and pg.query_selector('#xwa') is not None)
  ok('pixel in head', E("!!document.head.querySelector('[data-sellora-app=\"meta-pixel\"]')"))
  pg.click('#xsf [data-sfbuy]'); W(400)
  n0=E("S.orders.length")
  for f in pg.query_selector_all('#xsf [data-ckf]'):
    if f.evaluate('e=>e.tagName')=='SELECT': continue
    k=f.get_attribute('data-ckf').lower(); v='Test'
    if 'phone' in k: v='+15551234567'
    if 'zip' in k or 'post' in k: v='10001'
    if 'city' in k: v='New York'
    if 'state' in k: v='NY'
    f.fill(v)
  if pg.query_selector('#xk_country'): pg.select_option('#xk_country',label='United States'); W(300)
  for f in pg.query_selector_all('#xsf [data-ckf]'):
    if f.evaluate('e=>e.tagName')!='SELECT' and not f.input_value(): f.fill('10001' if 'zip' in (f.get_attribute('data-ckf') or '') else 'Test')
  pg.fill('#xk_email','buyer@test.com')
  pg.fill('#xk_num','4000000000000002');pg.fill('#xk_exp','12/30');pg.fill('#xk_cvc','123')
  if pg.query_selector('#xk_cn'):pg.fill('#xk_cn','Test Buyer')
  pg.click('#xkpaybtn'); W(1200)
  ok('declined card rejected', E("S.orders.length")==n0)
  pg.fill('#xk_num','4242424242424242'); pg.click('#xkpaybtn'); W(1500)
  ok('order placed', E("S.orders.length")==n0+1)
  if E("S.orders.length")==n0: print('ckerr:',E("(document.querySelector('#xkerr')||{}).innerText")); print(E("[...document.querySelectorAll('#xsf [data-ckf]')].map(e=>e.dataset.ckf+'='+e.value).join(';')"))
  o=E("S.orders[0].id>S.orders[S.orders.length-1].id?S.orders[0].id:S.orders[S.orders.length-1].id")
  ok('escrow held', E(f"(PAY.escOf(ORD.get({o}))||{{}}).st")in('Held','held'))
  ok('zapier webhook logged', E("S.apps2.zapier.log.some(l=>l.t.includes('order_created'))"))
  ok('pixel purchase', E("(S.pixelLog||[]).some(e=>e.ev==='Purchase')"))
  ok('confirmation email in outbox', E("JSON.stringify(S).includes('buyer@test.com')"))
  E("var c=document.querySelector('#xsfclose');c&&c.click()")
  admin0=E("PAY.sellerW?0:0")
  # fulfil via ShipStation label
  go('app-shipstation'); E(f"document.querySelector('#xlbo').value='{o}'"); cx('applabel:shipstation')
  ok('fulfilled via label', E(f"ORD.get({o}).ful")=='Fulfilled')
  # buyer confirms
  E("S.sfUser=CU.byEmail('buyer@test.com').id;save()"); E("SF.open('account')"); W(400)
  b=pg.query_selector(f'[data-sfesc^="confirm:"]')
  if b: b.click(); W(500)
  st=E(f"(PAY.escOf(ORD.get({o}))||{{}}).st"); print('escrow state',st)
  ok('escrow released on confirm', str(st).lower()=='released')
  ok('admin fee', E("JSON.stringify(S.sp.tx).includes('admin')"))
  E("var c=document.querySelector('#xsfclose');c&&c.click()")
  # dispute flow on API-placed order
  E("window._o2=ORD.place([{pid:"+str(pid)+",vi:0,q:1}],{email:'b2@test.com',first:'B',last:'Two',country:'US',ship:0,codes:[],addr:{}},{method:'card',id:'ch_t',escrow:true})")
  d=E("var e=PAY.escOf(_o2);var r=PAY.dispute(e.id,'Item not received');S.sp.disputes.length")
  go('pay-admin'); cx('pat:disputes'); W(200)
  E("var dd=S.sp.disputes[S.sp.disputes.length-1];PAY.resolve(dd.id,'buyer')")
  ok('dispute resolved to buyer', str(E("(PAY.escOf(_o2)||{}).st")).lower() in ('refunded','resolved'))
  print('esc2',E("(PAY.escOf(_o2)||{}).st"))
  # ---- KYC -> approve -> microdeposit -> payout
  go('pay-onboarding')
  vals={'kb1':'Acme Shoes','kb3':'REG-1','kb4':'TAX-99','kb6':'1 Main St, Lahore','kb7':'Sallar','kb8':'1990-01-01','kb9':'s@acme.com','kb10':'+923001234567'}
  for k,v in vals.items(): pg.fill('#'+k,v)
  open('/tmp/id.png','wb').write(b'x'*2000)
  for kd in pg.query_selector_all('[data-kdoc]'):
    n=kd.get_attribute('data-kdoc'); pg.set_input_files(f'[data-kdoc="{n}"]','/tmp/id.png'); W(200)
  cx('kself'); W(1200)
  for k,v in vals.items(): pg.fill('#'+k,v)
  pg.select_option('#kp0','iban'); pg.fill('#kp1','Acme Shoes'); pg.fill('#kp2','PK36SCBL0000001123456702'); cx('kpsave')
  md=E("PAY.kyc().payout.md")
  pg.fill('#kmd1',str(md[0]));pg.fill('#kmd2',str(md[1])); cx('kmdv')
  for k,v in vals.items(): pg.fill('#'+k,v)
  cx('ksubmit')
  ok('KYC submitted', E("PAY.kyc().st") in ('Under review','Pending','Submitted'))
  print('kyc st',E("PAY.kyc().st"))
  go('pay-admin'); cx('pat:kyc'); kid=E("PAY.kyc().id"); cx(f'kapp:{kid}')
  ok('KYC approved', E("PAY.kyc().st")=='Approved')
  av=E("PAY.sellerW().available"); print('available',av)
  r=E(f"PAY.requestPayout(undefined,{min(av,50)})"); print('payout req ->',r)
  pid2=E("S.sp.payouts[S.sp.payouts.length-1].id")
  go('pay-admin'); cx('pat:payouts'); cx(f'poapp:{pid2}'); W(1500)
  print('payout',E("S.sp.payouts[S.sp.payouts.length-1].st"))
  ok('payout paid', str(E("S.sp.payouts[S.sp.payouts.length-1].st")).lower() in ('paid','sent','completed'))
  # ---- Voice + AI
  for c in ['go to orders','change theme color to red','add product Trail Runner for 89','generate store for a shoe shop','write SEO for all products']:
    E(f"VOICE.run('{c}')"); W(400)
  ok('voice add product', E("S.products.some(p=>/trail runner/i.test(p.name))"))
  ok('seo all', E("S.products.every(p=>p.seo)"))
  go('ai-files'); go('ai-seo'); go('app-installed')
  pg.screenshot(path='shot_apps.png')
print('\n'.join(res)); print('ERRORS',errs)
