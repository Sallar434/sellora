import os,json,re
from playwright.sync_api import sync_playwright
P=0;F=0
def ok(c,m):
    global P,F
    if c:P+=1
    else:F+=1;print('FAIL',m)
IDS=['s-daybreak','s-renew','s-serene','s-hearthwork','s-munchbox','s-gallery','s-palate','s-blockparty','s-throttle','s-source','s-folio','s-limelight','s-ledgerline']
OLD=['dawn','ember','tide','orchard','noir','bloom','slate','sunset','mint','ink','aurora','sand']
BAN=['Dawn','Refresh','Sense','Craft','Crave','Studio','Taste','Colorblock','Ride','Origin','Publisher','Spotlight','Trade','Horizon','Shopify']
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+os.path.abspath('sellora.html'));pg.wait_for_timeout(800)
    th=pg.evaluate("S.themes.map(t=>({id:t.id,name:t.name,tag:t.tag,desc:t.desc,free:t.free,st:[t.font,t.lay,t.rad,t.bg,t.ac].join('|'),home:t.pg.home.map(s=>s.type),hdr:JSON.stringify(t.hdr.map(s=>s.s)),ftr:JSON.stringify(t.ftr.map(s=>s.s)),prod:JSON.stringify((t.pg.product||[]).map(s=>s.s))}))")
    ids=[t['id'] for t in th]
    ok(not any(o in ids for o in OLD),'original themes removed')
    ok(all(i in ids for i in IDS),'13 specialty themes present')
    ok(all(t['free'] for t in th),'library only has free themes')
    ok(pg.evaluate('S.live')=='s-daybreak','default theme is Daybreak')
    for t in th:
        ok(t['name'] not in BAN and not re.search('Shopify',t['name']),'name not trademarked '+t['name'])
        ok(bool(t['tag']) and t['desc'].startswith('Best for'),'tag/best-for '+t['id'])
    S={t['id']:t for t in th if t['id'] in IDS}
    for k in ['home','st','hdr','ftr','prod']:
        vals=[json.dumps(S[i][k]) if k=='home' else S[i][k] for i in IDS]
        ok(len(set(vals))==len(IDS),'distinct '+k+' across 13 themes')
    # render each storefront and compare
    html={}
    for i in IDS:
        html[i]=pg.evaluate("(function(){var t=S.themes.find(x=>x.id==='%s');var o=sf(t,'home');return typeof o==='string'?o:(o&&o.outerHTML)||''})()"%i)
        ok(len(html[i])>500,'renders '+i)
    ok(len(set(html.values()))==len(IDS),'rendered storefronts all differ')
    pg.evaluate("location.hash='#themes'");pg.wait_for_timeout(500)
    body=pg.inner_text('body')
    ok('Layout like' not in body,'no Layout-like label')
    ok('Wholesale' in body and 'Single product' in body,'tags shown in library')
    # migration from removed theme
    pg.evaluate("(function(){var d=JSON.parse(localStorage.getItem('sellora'));(d.stores||[]).forEach(function(){});})()")
    pg.evaluate("S.themes.push({id:'ember',name:'Ember',free:true,pg:{home:[]},hdr:[],ftr:[]});S.live='ember';X=window;window.m14mig()")
    ok(pg.evaluate('S.live')=='s-daybreak' and not pg.evaluate("S.themes.some(t=>t.id==='ember')"),'store on removed theme migrated to Daybreak')
    ok(not errs,'no page errors '+str(errs))
    b.close()
print('TOTAL %d/%d'%(P,P+F))
