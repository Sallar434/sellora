from playwright.sync_api import sync_playwright
import json
U='http://127.0.0.1:8777/sellora.html#';st=open('t9-state.json').read()
L=[('plus-whatsapp','1. WhatsApp ordering'),('plus-cod','2. COD risk scoring & OTP verification'),('plus-wholesale','3. Wholesale / RFQ with MOQ and price tiers'),('plus-oem','4. OEM / custom builder with proof approval'),('plus-couriers','5. Pakistan couriers: airway bills & COD reconciliation'),('plus-export','6. Export docs: commercial invoice, packing list, HS codes, Incoterms'),('plus-pricing','7. Fixed per-currency pricing with rounding'),('plus-protection','8. Sellora Pay buyer protection badge'),('plus-live','9. Live selling'),('plus-language','10. Urdu / Arabic (RTL)'),('plus-workshops','11. Workshops: job work & raw-material WIP'),('plus-compliance','12. Compliance badges & sample requests'),('plus-affiliates','13. Affiliates'),('plus-bank','14. Bank transfer reminders & matching'),('plus-ai','15. AI listings in EN / UR / AR'),
('themes','Theme library: Sellora equivalents of all Shopify free themes'),('app-store','App store (incl. TCS, Leopards, PostEx, Trax, Xero, QuickBooks, Google Ads)'),('app-meta','App settings: Facebook & Instagram Shop'),('app-tcs','App settings: TCS Courier (keys masked, server integration)'),('app-xero','App settings: Xero'),('app-whatsapp','App settings: WhatsApp Business')]
with sync_playwright() as p:
  b=p.chromium.launch();c=b.new_context(viewport={'width':1366,'height':860});pg=c.new_page()
  pg.goto(U+'home');pg.evaluate("s=>{localStorage.setItem('sellora',s)}",st);pg.reload();pg.wait_for_timeout(800)
  pg.evaluate("S.plus.cfg.lang='en';S.plus.cfg.sfLang='en';save()");pg.reload();pg.wait_for_timeout(700)
  ids=pg.evaluate("({p:S.products[0].id,o:S.orders[0].id,c:S.cust[0].id,col:((S.collections||[])[0]||{}).id})");print(ids)
  L+= [('product-%s'%ids['p'],'Product detail: two-column layout + save bar'),('order-%s'%ids['o'],'Order detail: two-column layout'),('customer-%s'%ids['c'],'Customer detail: two-column layout'),('colx-%s'%ids['col'],'Collection detail: two-column layout + save bar')]
  out=[]
  for i,(r,t) in enumerate(L):
    pg.goto(U+r);pg.wait_for_timeout(500)
    if r=='app-tcs' and pg.query_selector('[data-x="appin:tcs"]'):
      pg.click('[data-x="appin:tcs"]');pg.wait_for_timeout(200)
      for k,v in enumerate(['CL-1001','sellora','secret-pass','CC-01']):pg.fill('#xapf%d'%k,v)
      pg.click('[data-x="appsave:tcs"]');pg.wait_for_timeout(300)
    f='shots10/%02d-%s.png'%(i,r);pg.screenshot(path=f);out.append((f,t))
  # RTL admin + storefront
  pg.evaluate("S.plus.cfg.lang='ur';S.plus.cfg.sfLang='ur';save()");pg.goto(U+'home');pg.reload();pg.wait_for_timeout(700);pg.screenshot(path='shots10/90-rtl-admin.png');out.append(('shots10/90-rtl-admin.png','Urdu RTL admin'))
  json.dump(out,open('shots10/index.json','w'));print(len(out))
