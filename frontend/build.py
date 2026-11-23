b=open('base.html',encoding='utf-8').read()
b=b.replace("+'   ').repeat(8)","+'   ').repeat(4)")
_o="+'   ').repeat(4))+'</div></div>'"
assert _o in b
b=b.replace(_o,_o+"+'<div class=\"mqh\" style=\"font-size:'+v(s,'mqs')+'px\">'+esc(v(s,'mq'))+'</div>'")
b=b.replace('</style>','.mqh{display:none;font-weight:800;line-height:1.15;padding:0 24px;overflow-wrap:anywhere;text-wrap:balance}.thumb .mqo{display:none}.thumb .mqh{display:block;font-size:64px!important}@media(max-width:600px){.mqo{display:none}.mqh{display:block;font-size:clamp(28px,9vw,44px)!important}}@media(prefers-reduced-motion:reduce){.mqo{display:none}.mqh{display:block}}main{padding-bottom:72px}aside{padding-bottom:70px!important}#xviewas{position:fixed!important;left:10px!important;right:auto!important;bottom:10px!important;width:172px!important}#xviewas select{max-width:100%}@media(max-width:700px){#xviewas{display:none}#xsf [style*="grid-template-columns:1.3fr 1fr"],#xsf [style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr!important}#xsf header{padding:10px 14px!important;gap:10px!important}#xsf header form,#xsf header input{width:100%}}#xsf header nav{flex-direction:row!important;gap:14px}#xsf input[type=checkbox]{width:auto!important;display:inline-block;margin:0 6px 0 0;vertical-align:middle}#xsf header nav a{padding:0;color:inherit}#xsf header select{width:auto!important;min-width:0!important;max-width:200px}</style>',1)
b=b.replace('</style>',open('src/theme.css',encoding='utf-8').read()+'</style>',1)
b=b.replace("window.addEventListener('hashchange',route);route();","window.addEventListener('hashchange',function(){route()});")
k='// 4. Enhanced Nav Renderer'
if k in b: b=b.replace(k,'window.NAV_CONFIG=NAV_CONFIG;window._normRoute=function(r){return normRoute(r)};\n'+k,1)

b=b.replace("var SECTIONS_CATALOG = [","var SECTIONS_CATALOG = window.SECTIONS_CATALOG = [",1)
b=b.replace('\u00f0\u0178\u201c\x81','\U0001F4C1').replace('\u00f0\u0178\u0152\x8d','\U0001F30D')
js='\n'.join(open('src/'+f,encoding='utf-8').read() for f in ['m1.js','m2.js','m3.js','m4.js','m5.js','m6a.js','m6b.js','m7.js','m8.js','m9.js','m10.js','m11.js','m12.js','m13.js','m14.js','m15.js','m16.js','m17.js','m18.js'])
js+="\n;try{route()}catch(e){console.error(e)}\n"
i=b.rfind('</body>');open('vendom.html','w',encoding='utf-8').write(b[:i]+'<script>\n/* VendOm v30 modules */\n'+js+'\n</script>\n'+b[i:])
print('built',len(b)+len(js))
# Show a store name only when this browser already has a real signed-in session.
h=open('vendom.html',encoding='utf-8').read()
old='<div class="store"><b id="sn"></b><span id="sd"></span></div>'
new='<div class="store"><b id="sn"></b><span id="sd"></span></div><script>(function(){var n="",host="";try{var db=JSON.parse(localStorage.getItem("vendom")||"null");if(db&&!db.out){var email=db.session||(db.s&&db.a&&db.a[db.s]?db.s:"");var st=email&&db.d&&db.d[email];if(st&&st.name){n=st.name;host=(String(n).toLowerCase().replace(/[^a-z0-9]+/g,"")||"mystore")+".vendom.app"}}}catch(e){}var sn=document.getElementById("sn"),sd=document.getElementById("sd");if(sn)sn.textContent=n;if(sd)sd.textContent=host})()</script>'
assert old in h; h=h.replace(old,new,1)
open('vendom.html','w',encoding='utf-8').write(h)

# connected build: same app + backend sync layer
h=open('vendom.html',encoding='utf-8').read();sj=open('connected/sync.js',encoding='utf-8').read();i=h.rfind('</body>')
open('vendom-connected.html','w',encoding='utf-8').write(h[:i]+'<script>\n'+sj+'\n</script>\n'+h[i:]);print('built connected')
# keep the backend's copy in step with this build
import shutil;shutil.copyfile('vendom-connected.html','../backend/frontend/vendom-connected.html');shutil.copyfile('connected/sync.js','../backend/frontend/sync.js')
# Small pages so the site root and the old Sellora link open VendOm even if vercel.json is not applied
_stub='<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>VendOm</title><meta http-equiv="refresh" content="0; url=vendom.html"><script>location.replace("vendom.html"+location.hash)</script></head><body><a href="vendom.html">Open VendOm</a></body></html>\n'
for _n in ['index.html','sellora.html','sellora-connected.html']:
    open(_n,'w',encoding='utf-8').write(_stub if _n!='sellora-connected.html' else _stub.replace('vendom.html','vendom-connected.html'))
