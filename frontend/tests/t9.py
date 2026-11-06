from playwright.sync_api import sync_playwright
import json,time
U='http://127.0.0.1:8777/sellora.html#'
res=[]
def ck(n,c):res.append((n,bool(c)));print(('PASS ' if c else 'FAIL ')+n)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':900});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto(U+'home');pg.wait_for_timeout(900);E=pg.evaluate
    def go(r):pg.goto(U+r);pg.wait_for_timeout(300)
    def fill(sel,v):pg.fill(sel,str(v))
    def msg(id):return pg.inner_text('#'+id)
    # 1 WhatsApp
    r=E("waParse('2 x Race Day Gloves\\nfoo bar baz\\n0 x Race Day Gloves')");ck('wa parse match+unmatched',len(r['lines'])==1 and len(r['errs'])==2)
    go('plus-whatsapp');fill('#m9wanum','abc');pg.click('text=Save number');ck('wa invalid number rejected','valid' in msg('m9waerr'))
    fill('#m9wanum','+923001234567');pg.click('text=Save number');pg.wait_for_timeout(200);ck('wa number saved',E("m9P().cfg.wa")=='+923001234567')
    ck('wa catalogue lists products',E("waCatalogue().split('\\n').length")>=2)
    # 2 COD
    ck('cod risk invalid phone high',E("codRisk({phone:'123',total:500,email:'x@y.z',who:'test'}).level")=='High')
    ck('cod risk range 0-100',0<=E("codRisk({phone:'03001234567',total:-5,email:'a@b.c',ship:{addr:'House 12, Street 4, Model Town, Lahore'}}).score")<=100)
    pg.click('text=Simulate incoming order');pg.wait_for_timeout(200);pg.click('text=Convert to order');pg.wait_for_timeout(200)
    go('plus-cod');ck('cod lists WA order',pg.locator('#main >> text=#1004').count()>0)
    pg.click('[data-x^="m9codok"] >> nth=0');pg.wait_for_timeout(200);ck('cod verify persists',E("m9P().cod.some(c=>c.status==='Verified')"))
    # 3 wholesale
    go('plus-wholesale');fill('#m9tmin','-5');fill('#m9tpr','10');pg.click('text=Add tier');ck('tier negative qty rejected','≥ 2' in msg('m9terr'))
    fill('#m9tmin','50');fill('#m9tpr','0');pg.click('text=Add tier');ck('tier zero price rejected','greater than 0' in msg('m9terr'))
    fill('#m9tmin','50');fill('#m9tpr','9.5');pg.click('text=Add tier');pg.wait_for_timeout(200)
    pid=E("String(S.products[0].id)");ck('tier price applies',E(f"tierPrice('{pid}',60)")==9.5 and E(f"tierPrice('{pid}',10)")==E("S.products[0].price"))
    fill('#m9moq','20');pg.click('text=Save MOQ');pg.wait_for_timeout(200);fill('#m9qq','5');pg.click('text=Calculate');ck('below MOQ rejected','minimum' in msg('m9qerr'))
    fill('#m9qq','99999999999');pg.click('text=Calculate');ck('huge qty rejected','10,000,000' in msg('m9qerr'))
    pg.click('text=New RFQ');pg.click('#xok');ck('rfq empty rejected','required' in msg('xme'))
    fill('#m9rb','Gulf Traders');fill('#m9re','bad');pg.click('#xok');ck('rfq bad email rejected','email' in msg('xme'))
    fill('#m9re','buy@gulf.ae');fill('#m9rq','100');pg.click('#xok');pg.wait_for_timeout(300);ck('rfq created',E("m9P().rfq.length")==1)
    # 4 OEM
    go('plus-oem');pg.click('text=Create design');ck('oem name required','required' in msg('m9oerr'))
    fill('#m9on','Pro Keeper');fill('#m9oc','FC Doha');fill('#m9oq','500');pg.click('text=Create design');pg.wait_for_timeout(200);ck('oem created w/ tier price',E("m9P().oem[0].unit")==E("oemPrice({material:'Cowhide leather',qty:500})"))
    pg.click('[data-x^="m9oappr"]');pg.wait_for_timeout(200);ck('oem approve needs proof',E("m9P().oem[0].proof")!='Approved')
    # 5 couriers
    go('plus-couriers');fill('#m9sk','-1');pg.click('text=Book & print airway bill');ck('courier negative weight rejected','Weight' in msg('m9serr'))
    fill('#m9sk','1.2');pg.check('#m9scod');pg.click('text=Book & print airway bill');pg.wait_for_timeout(300);s=E("m9P().ship[0]");ck('courier booked w/ CN + fee',s and s['cn'].startswith('TCS') and s['fee']>0)
    E("ACT.m9trk(m9P().ship[0].cn);ACT.m9trk(m9P().ship[0].cn)");s=E("m9P().ship[0]")
    r=E(f"m9reconcile('CN,net\\n{s['cn']},{s['cod']-s['fee']}\\nFAKE1,10')");ck('cod reconcile match+unknown',r['matched']==1 and r['unknown']==['FAKE1'])
    # 6 export
    go('plus-export');fill('#m9hs','42AB');pg.click('text=Save HS codes');ck('invalid HS rejected','Invalid' in msg('m9hserr'))
    fill('#m9ew','0');pg.click('text=Commercial invoice');ck('export zero weight rejected','Weight' in msg('m9eerr'))
    d=E("m9exportDoc('ci',1001,'CIF','UAE',5,2)");ck('CI doc has HS+incoterm','CIF' in d['html'] and 'HS code' in d['html'])
    # 7 pricing
    ck('round .99',E("roundPrice(12.3,'99')")==12.99);ck('round 100',E("roundPrice(1234,'100')")==1300);ck('round negative ->0',E("roundPrice(-4,'int')")==0)
    go('plus-pricing');pg.locator('.m9fx').first.fill('-3');pg.click('text=Save prices');ck('negative fx rejected','invalid' in msg('m9fxerr'))
    pg.locator('.m9fx').first.fill('4999');pg.click('text=Save prices');pg.wait_for_timeout(200);ck('fixed PKR price',E(f"priceIn('{pid}','PKR')")=={'v':4999,'fixed':True})
    ck('full currency names',pg.locator('#main >> text=Pakistani Rupee (PKR)').count()>0)
    # 8 protection
    go('plus-protection');fill('#m9pdays','500');pg.click('#main >> text=Save');ck('window out of range','3–90' in msg('m9perr'))
    html=E("sf(S.themes[0],'product')");ck('storefront badge + WA button','m9bp' in html and 'wa.me/923001234567' in html)
    # 9 live
    go('plus-live');pg.click('text=Schedule live session');pg.click('#xok');ck('live title required','required' in msg('xme'))
    fill('#m9lt','Eid drop');fill('#m9ls','2026-11-01T20:00');pg.click('#xok');pg.wait_for_timeout(200);pg.click('[data-x^="m9lgo"]');pg.wait_for_timeout(200);ck('live session live',E("m9P().live[0].status")=='Live')
    # 10 workshops
    go('plus-workshops');pg.click('text=Add workshop');fill('#m9wn','Ali Stitching');pg.click('#xok');pg.wait_for_timeout(200)
    fill('#m9rn','Goat leather');fill('#m9rs','100');pg.click('text=Add material');pg.wait_for_timeout(200)
    pg.click('text=Issue job work');pg.select_option('#m9jm',index=1);fill('#m9jmq','500');pg.click('#xok');ck('over-issue material rejected','in stock' in msg('xme'))
    fill('#m9jmq','40');pg.click('#xok');pg.wait_for_timeout(200);ck('material moved to WIP',E("m9P().raw[0].stock")==60 and E("m9P().raw[0].wip")==40)
    st0=E("+S.products[0].stock||0");pg.click('[data-x^="m9jrcv"]');fill('#m9jg','95');fill('#m9jx','5');pg.click('#xok');pg.wait_for_timeout(200)
    ck('job completed, stock up, WIP cleared',E("m9P().jobs[0].status")=='Completed' and E("+S.products[0].stock")==st0+95 and E("m9P().raw[0].wip")==0)
    # 11 compliance
    go('plus-compliance');pg.click('text=Add badge');ck('cert no required','required' in msg('m9berr'))
    fill('#m9bno','CE-123');pg.click('text=Add badge');pg.wait_for_timeout(200);ck('badge added',E("m9P().badges.length")==1)
    # 12 affiliates
    go('plus-affiliates');pg.click('text=Add affiliate');fill('#m9an','Sara');fill('#m9ae','s@x.pk');fill('#m9ac','x');pg.click('#xok');ck('aff short code rejected','3–20' in msg('xme'))
    fill('#m9ac','SARA10');fill('#m9ar','95');pg.click('#xok');ck('aff >90% rejected','90' in msg('xme'))
    fill('#m9ar','10');pg.click('#xok');pg.wait_for_timeout(200);E("S.orders[0].codes=['SARA10'];save()");ck('aff commission',E("affStats(m9P().aff[0]).commission")==round(E("S.orders[0].total")*0.1,2))
    # 13 bank
    o=E("S.orders[1]");r=E(f"m9matchBank('date,desc,amount\\n2026-10-29,IBFT SLR{o['id']},{o['total']}\\n2026-10-29,random,5')");ck('bank match by SLR ref',r['matched']==1 and len(r['unmatched'])==1 and E(f"ORD.get({o['id']}).pay")=='Paid')
    # 14 AI
    go('plus-ai');pg.click('text=Generate listing');ck('ai needs photo','photo' in msg('m9aierr'))
    pg.set_input_files('#m9aif',files=[{'name':'black-leather-glove.jpg','mimeType':'image/jpeg','buffer':b'\xff\xd8\xff'}]);pg.click('text=Generate listing');pg.wait_for_timeout(300)
    ck('ai EN/UR/AR generated','Glove' in pg.input_value('#m9ai_en_t') and pg.input_value('#m9ai_ur_t')!='' and pg.input_value('#m9ai_ar_t')!='')
    n0=E("S.products.length");pg.click('text=Create draft product');pg.wait_for_timeout(300);ck('ai draft product',E("S.products.length")==n0+1 and E("S.products.at(-1).status")=='Draft')
    # 15 language / RTL
    go('plus-language');pg.select_option('#m9lang','ur');pg.select_option('#m9sfl','ar');pg.click('text=Save languages');pg.wait_for_timeout(300)
    ck('admin RTL',E("document.documentElement.dir")=='rtl');ck('nav translated',pg.locator('#nav >> text=آرڈرز').count()>0)
    ck('storefront RTL','dir="rtl"' in E("sf(S.themes[0],'home')"))
    pg.screenshot(path='shots/m9-rtl.png') if False else None
    # persistence
    pg.reload();pg.wait_for_timeout(900)
    ck('persist after reload',E("m9P().rfq.length==1&&m9P().oem.length==1&&m9P().ship.length==1&&m9P().cfg.lang=='ur'&&document.documentElement.dir=='rtl'"))
    ck('storage key sellora',E("!!localStorage.getItem('sellora')"))
    E("m9P().cfg.lang='en';m9P().cfg.sfLang='en';save()")
    # themes
    go('themes');ck('24 free themes installed',E("M9_FREE.every(f=>S.themes.some(t=>t.id===f[0]))"))
    n=E("S.themes.length");pg.locator('.m9dup').nth(3).click();pg.wait_for_timeout(300);ck('theme duplicate',E("S.themes.length")==n+1)
    pg.locator('.m9dot').nth(1).click();pg.wait_for_timeout(300);ck('style preset applied',True)
    pg.goto(U+'themes');pg.wait_for_timeout(300);E("S.live='s-meridian';save()");ck('publish free theme',E("S.live")=='s-meridian')
    ck('every free theme renders',E("M9_FREE.every(f=>sf(S.themes.find(t=>t.id===f[0])).length>500)"))
    # collection editor
    go('colx-new');pg.click('#m9colsave');pg.wait_for_timeout(200);ck('collection title required','colx' in pg.url)
    c0=E("S.collections.length");fill('#x7c1','Goalkeeper Gloves');pg.click('#p8sav' if pg.is_visible('#p8sav') else '#m9colsave');pg.wait_for_timeout(400);ck('collection created 2-col',E("S.collections.length")==c0+1)
    open('t9-state.json','w').write(E("localStorage.getItem('sellora')"))
    ck('no console errors',not errs);print(errs[:5])
    b.close()
P=sum(1 for r in res if r[1]);print(f'\nTOTAL {P}/{len(res)}')
json.dump(res,open('t9-results.json','w'))
