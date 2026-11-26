"""Theme library v45: the old themes are gone; 468 original free VendOm themes, each with its own design; names are VendOm's own."""
import sys as _s,os as _o;_s.path.insert(0,_o.path.dirname(_o.path.abspath(__file__)));import vt
import re
from playwright.sync_api import sync_playwright
P=0;F=0
def ok(c,m):
    global P,F
    if c:P+=1
    else:F+=1;print('FAIL',m)
OLD=['dawn','ember','tide','orchard','noir','bloom','slate','sunset','mint','ink','aurora','sand','s-daybreak','s-renew','s-serene','s-meridian','s-folio']
# names used by Shopify's own and Theme Store themes must not be reused
BAN=['Dawn','Refresh','Sense','Craft','Crave','Studio','Taste','Colorblock','Ride','Origin','Publisher','Spotlight','Trade','Horizon','Impulse','Prestige','Symmetry','Focal','Warehouse','Empire','Motion','Impact','Broadcast','Pipeline','Stiletto','Concept','Be Yours','Kiln','Nectar','Haven','Opal','Summit','Doodle','Torque','Apex','Shopify']
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    vt.open_app(pg,vt.URL);pg.wait_for_timeout(800)
    E=pg.evaluate
    lib=E("V21_LIB.map(L=>({id:L.id,name:L.name,sig:[L.hero,L.hdr,L.card,L.fp].join('/'),pal:[L.bg,L.tx,L.ac].join(),lay:L.lay,demo:L.demo}))")
    ok(len(lib)>=468,'468 themes in the library (%d)'%len(lib))
    ok(len(set(t['name'] for t in lib))==len(lib),'every theme has its own name')
    ok(len(set(t['sig'] for t in lib))==len(lib),'every theme has its own layout + header + card + font combination')
    ok(len(set(t['pal'] for t in lib))==len(lib),'every theme has its own colours')
    for t in lib: ok(t['name'] not in BAN and not re.search('Shopify',t['name']),'own name '+t['name'])
    ids=E("S.themes.map(t=>t.id)")
    ok(not any(o in ids for o in OLD),'old themes removed from the store')
    ok(E("S.themes.every(t=>t.v21||!t.free)"),'only new themes (or seller copies) remain')
    ok(E('S.live')=='v-kestrel' or E("S.themes.some(t=>t.id===S.live)"),'a new theme is live')
    # render each theme with demo data and compare
    n0=E("S.products.length");nm=E("S.name")
    html=E("V21_LIB.map(L=>V21_preview(L.id))")
    ok(all(len(h)>2000 for h in html),'all themes render')
    ok(len(set(html))==len(html),'all rendered previews differ')
    ok(E("S.products.length")==n0 and E("S.name")==nm and not E("S.products.some(p=>p.id>=900000)"),'demo products never leak into the store')
    # an old theme comes back from old saved data -> removed again, a new theme goes live
    E("S.themes.push({id:'ember',name:'Ember',free:true,pg:{home:[]},hdr:[],ftr:[]});S.live='ember';V21_mig()")
    ok(E("S.themes.some(t=>t.id===S.live&&t.v21)") and not E("S.themes.some(t=>t.id==='ember')"),'store on a removed theme moves to a new theme')
    ok(not errs,'no page errors '+str(errs))
    b.close()
print('TOTAL %d/%d'%(P,P+F))
_s.exit(0 if F==0 else 1)
