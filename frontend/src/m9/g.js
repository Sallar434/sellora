/* ---------- CSS ---------- */
if(!document.getElementById('m9css')){var st=document.createElement('style');st.id='m9css';st.textContent=
'.m9nav{margin-top:10px;border-top:1px solid #333;padding-top:8px}.m9navh{color:#F2C14E;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding:6px 12px;cursor:pointer}.m9nav .m9nl{display:none;color:#fff;font-size:13px;padding:5px 12px 5px 20px;text-decoration:none;border-radius:6px}.m9nav.open .m9nl,.m9nav:hover .m9nl{display:block}.m9nav .m9nl.on{background:#2E6B4F}'
+'.xdet{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:16px;align-items:start}.xdet .xmain,.xdet .xside{display:flex;flex-direction:column;gap:16px;min-width:0}@media(max-width:900px){.xdet{grid-template-columns:1fr}}'
+'.m9c{overflow-x:auto}.m9c h3{margin:0 0 10px}.m9c label{display:block;font-size:13px;margin:8px 0 4px}.m9t{width:100%;font-size:13px}.m9t td,.m9t th{padding:6px 8px;vertical-align:top;text-align:start}.m9pre{white-space:pre-wrap;margin:0;font:12px/1.4 inherit;max-width:260px}.m9row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.m9big{font-size:20px;font-weight:700;margin:8px 0}.m9sw{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:middle;border:1px solid #999}.m9prev{display:flex;align-items:center;gap:12px;margin:10px 0}.m9ol{padding-inline-start:18px;line-height:1.7}.m9fx{width:90px;min-width:70px}'
+'.m9bp{display:flex;flex-direction:column;gap:4px;border:1px solid #2E6B4F;border-inline-start:4px solid #F2C14E;background:#f1f8f4;color:#14281d;border-radius:8px;padding:10px 14px;font-size:13px;margin-top:10px}.m9wab{display:inline-block;margin-top:10px;background:#25D366;color:#fff;font-weight:600;border-radius:8px;padding:10px 16px;text-decoration:none}'
+'.m9ai3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}@media(max-width:900px){.m9ai3{grid-template-columns:1fr}}.m9langprev{border:1px dashed #ccc;border-radius:8px;padding:12px}.m9pre+.acts{margin-top:4px}.m9pre{}.m9dot{width:22px;height:22px;border-radius:50%;border:2px solid #111;margin-inline-end:6px;cursor:pointer;padding:0}div.m9pre{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin:6px 0}.m9bk{text-decoration:none;color:inherit;margin-inline-end:6px}'
+'body.m9rtl .m9t td,body.m9rtl .m9t th{text-align:right}body.m9rtl #main{direction:rtl}body.m9rtl .xh{flex-direction:row-reverse}body.m9nosb #p8save{display:none!important}';
document.head.appendChild(st)}

/* deep link: #product-<id> opens the two-column product editor */
function m9deep(){var m=location.hash.match(/^#product-(\d+)$/);if(m&&typeof X.pEdit==='function'){X.pEdit(+m[1]);return true}if(m&&typeof pEdit==='function'){pEdit(+m[1]);return true}}
window.addEventListener('hashchange',m9deep);setTimeout(m9deep,0);
/* ---------- boot ---------- */
X.onRoute(function(r){var no=/^plus-/.test(r);document.body.classList.toggle('m9nosb',no);if(no&&X.p8clean)X.p8clean()});
X.onRoute(function(){try{themeMig()}catch(e){console.error(e)}});
try{themeMig()}catch(e){}
})();
