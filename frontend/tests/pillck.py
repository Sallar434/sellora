import os,sys,json
from playwright.sync_api import sync_playwright
F=sys.argv[1] if len(sys.argv)>1 else 'sellora.html'
URL='file://'+os.path.abspath(F)
JS=r"""()=>{function rgb(s){var m=s.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]}
function bg(e){while(e){var c=rgb(getComputedStyle(e).backgroundColor);if(c.length<4||c[3]>0.5)return c.slice(0,3);e=e.parentElement}return[255,255,255]}
function L(c){c=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
var out=[];document.querySelectorAll('main button,main .pill,main [role=tab],main .tab,main .chip,main .badge,main a.btn,#ov button').forEach(e=>{var r=e.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(e).visibility=='hidden')return;if(e.closest('#xsf'))return;
var t=(e.innerText||'').trim();var hasIcon=e.querySelector('svg,img')||e.getAttribute('aria-label')||e.title;
var cs=getComputedStyle(e);var fg=rgb(cs.color).slice(0,3),b=bg(e);var a=L(fg),c=L(b);var cr=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);
if((!t&&!hasIcon)||(t&&cr<3)||(t&&+cs.opacity<.5))out.push({t:t.slice(0,30),cls:e.className.slice?e.className.slice(0,40):'',fg:cs.color,bg:b.join(','),cr:+cr.toFixed(2)})});
document.querySelectorAll('main input[type=checkbox]:not(.tg)').forEach(e=>{var r=e.getBoundingClientRect();if(r.width&&(r.width>22||getComputedStyle(e).appearance=='none'))out.push({t:'checkbox',cls:e.className,w:r.width,ap:getComputedStyle(e).appearance})});return out}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':800},color_scheme='dark');pg.goto(URL);pg.wait_for_timeout(900)
    routes=pg.evaluate("Object.keys(V)");bad={}
    for r in routes:
        pg.evaluate("location.hash='%s'"%r);pg.wait_for_timeout(180)
        x=pg.evaluate(JS)
        if x:bad[r]=x
    print('routes',len(routes),'bad',len(bad));print(json.dumps(bad,indent=0)[:6000])
    sys.exit(1 if bad else 0)
