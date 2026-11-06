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
js='\n'.join(open('src/'+f,encoding='utf-8').read() for f in ['m1.js','m2.js','m3.js','m4.js','m5.js','m6a.js','m6b.js','m7.js','m8.js','m9.js','m10.js','m11.js','m12.js','m13.js','m14.js'])
js+="\n;try{route()}catch(e){console.error(e)}\n"
i=b.rfind('</body>');open('sellora.html','w',encoding='utf-8').write(b[:i]+'<script>\n/* Sellora v30 modules */\n'+js+'\n</script>\n'+b[i:])
print('built',len(b)+len(js))
# Show a store name only when this browser already has a real signed-in session.
h=open('sellora.html',encoding='utf-8').read()
old='<div class="store"><b id="sn"></b><span id="sd"></span></div>'
new='<div class="store"><b id="sn"></b><span id="sd"></span></div><script>(function(){var n="",host="";try{var db=JSON.parse(localStorage.getItem("sellora")||"null");if(db&&!db.out){var email=db.session||(db.s&&db.a&&db.a[db.s]?db.s:"");var st=email&&db.d&&db.d[email];if(st&&st.name){n=st.name;host=(String(n).toLowerCase().replace(/[^a-z0-9]+/g,"")||"mystore")+".sellora.app"}}}catch(e){}var sn=document.getElementById("sn"),sd=document.getElementById("sd");if(sn)sn.textContent=n;if(sd)sd.textContent=host})()</script>'
assert old in h; h=h.replace(old,new,1)
open('sellora.html','w',encoding='utf-8').write(h)

# connected build: same app + backend sync layer
h=open('sellora.html',encoding='utf-8').read();sj=open('connected/sync.js',encoding='utf-8').read();i=h.rfind('</body>')
open('sellora-connected.html','w',encoding='utf-8').write(h[:i]+'<script>\n'+sj+'\n</script>\n'+h[i:]);print('built connected')
