/* ===== v42: approved admin design — dark top bar with the VendOm logo (K1), light side menu, white cards, Inter ===== */
(function(){
var X=window;
var LOGO_W='<svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true"><circle cx="32" cy="17" r="10" fill="none" stroke="#A6E37A" stroke-width="5"/><path d="M10 24h44l-3.2 31a5 5 0 0 1-5 4.5H18.2a5 5 0 0 1-5-4.5z" fill="#FFFFFF"/><path d="M22 32l10 18 10-18" fill="none" stroke="#0B2A21" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var LOGO_G='<svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true"><circle cx="32" cy="17" r="10" fill="none" stroke="#5DB346" stroke-width="5"/><path d="M10 24h44l-3.2 31a5 5 0 0 1-5 4.5H18.2a5 5 0 0 1-5-4.5z" fill="#0E3B2E"/><path d="M22 32l10 18 10-18" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
X.VENDOM_LOGO={white:LOGO_W,green:LOGO_G};
try{if(typeof NAV_ICONS!=='undefined'&&!NAV_ICONS.growth)NAV_ICONS.growth='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14v-4l13-6v16l-13-6z"/><path d="M7 15v4"/></svg>'}catch(e){}
/* favicon + app icon */
function icon(rel,href,type){var l=document.querySelector('link[rel="'+rel+'"]');if(!l){l=document.createElement('link');l.rel=rel;document.head.appendChild(l)}if(type)l.type=type;l.href=href}
var FAV='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#0E3B2E"/><circle cx="32" cy="19" r="8" fill="none" stroke="#A6E37A" stroke-width="6"/><path d="M15 25h34l-2.5 23a4 4 0 0 1-4 3.5H21.5a4 4 0 0 1-4-3.5z" fill="#FFFFFF"/></svg>');
icon('icon',FAV,'image/svg+xml');
var meta=document.querySelector('meta[name="theme-color"]');if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta)}meta.content='#1A1A1A';
/* font */
if(!document.getElementById('vfont')){var f=document.createElement('link');f.id='vfont';f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';document.head.appendChild(f)}

/* top bar */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function initials(n){return String(n||'My Store').split(/\s+/).filter(Boolean).slice(0,2).map(function(w){return w[0].toUpperCase()}).join('')}
function mount(){var t=document.getElementById('vtop');var name=(typeof S!=='undefined'&&S&&S.name)||'My Store';
 if(!t){t=document.createElement('header');t.id='vtop';document.body.insertBefore(t,document.body.firstChild);
  t.innerHTML='<button type="button" id="vtop-menu" aria-label="Open menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg></button>'
   +'<a class="vtop-logo" href="#home" aria-label="VendOm home">'+LOGO_W+'<span>Vend<b>Om</b></span></a>'
   +'<button type="button" id="vtop-search" aria-label="Search (Ctrl K)"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L17 17"/></svg><span>Search</span><kbd>Ctrl K</kbd></button>'
   +'<span class="vtop-gap"></span>'
   +'<button type="button" id="vtop-bell" aria-label="Alerts"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 8a5 5 0 0 1 10 0c0 5 2 6 2 6H3s2-1 2-6"/><path d="M8.5 17h3"/></svg><i id="vtop-bn"></i></button>'
   +'<div class="vtop-store"><button type="button" id="vtop-store" aria-haspopup="true" aria-expanded="false"><span class="vtop-av"></span><span class="vtop-sn"></span></button><div id="vtop-dd" role="menu" hidden><a role="menuitem" href="#online-store-preferences" data-vt="view">View your store</a><a role="menuitem" href="#s-general">Store settings</a><a role="menuitem" href="#s-plan">Plan and billing</a><button type="button" role="menuitem" id="vtop-out">Sign out</button></div></div>';
  var sb=document.getElementById('p8sbtn'),bl=document.getElementById('p8bell');
  t.querySelector('#vtop-search').onclick=function(){var b=document.getElementById('p8sbtn');if(b)b.click()};
  t.querySelector('#vtop-bell').onclick=function(){var b=document.getElementById('p8bell');if(b)b.click()};
  var dd=t.querySelector('#vtop-dd'),st=t.querySelector('#vtop-store');
  st.onclick=function(e){e.stopPropagation();dd.hidden=!dd.hidden;st.setAttribute('aria-expanded',!dd.hidden)};
  document.addEventListener('click',function(){if(!dd.hidden){dd.hidden=true;st.setAttribute('aria-expanded','false')}});
  dd.querySelector('[data-vt=view]').onclick=function(e){e.preventDefault();dd.hidden=true;try{SF.open('home')}catch(x){}};
  t.querySelector('#vtop-out').onclick=function(){dd.hidden=true;var so=document.getElementById('so');if(so)so.click();else if(typeof endSession==='function')endSession()};
  t.querySelector('#vtop-menu').onclick=function(e){e.stopPropagation();var o=document.body.classList.toggle('mnav-open');this.setAttribute('aria-expanded',o)};
 }
 t.querySelector('.vtop-av').textContent=initials(name);t.querySelector('.vtop-sn').textContent=name;
 var n=document.getElementById('p8bn'),vb=document.getElementById('vtop-bn');if(vb)vb.textContent=n?n.textContent:'';
 var br=document.querySelector('aside .brand');if(br&&!br.dataset.v){br.dataset.v=1;br.innerHTML=LOGO_G+'<span>Vend<b>Om</b></span>'}}
mount();if(X.onRoute)X.onRoute(function(){mount()});setInterval(function(){var n=document.getElementById('p8bn'),vb=document.getElementById('vtop-bn');if(n&&vb&&vb.textContent!==n.textContent)vb.textContent=n.textContent},1500);

/* styles */
var css=document.createElement('style');css.id='v42css';css.textContent=[
':root{--v-bg:#F1F1F1;--v-card:#FFFFFF;--v-ink:#303030;--v-mu:#616161;--v-line:#E3E3E3;--v-nav:#EBEBEB;--v-top:#1A1A1A;--v-btn:#303030;--v-green:#5DB346;--v-forest:#0E3B2E;--v-link:#005BD3}',
'body:not(.locked){font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important;font-size:13px;color:var(--v-ink);background:var(--v-bg)!important;padding-top:56px}',
'body.locked #vtop{display:none}html{scroll-padding-top:72px}#ov{z-index:90!important}#modal{z-index:95!important}#toast{z-index:100!important}#xsf{z-index:92!important}',
'#vtop{position:fixed;top:0;left:0;right:0;height:56px;z-index:75;background:var(--v-top);display:flex;align-items:center;gap:12px;padding:0 12px 0 16px;box-sizing:border-box;font-family:Inter,system-ui,sans-serif}',
'#vtop button{font:inherit;cursor:pointer}',
'#vtop-menu{display:none;width:40px;height:40px;border:0;background:transparent;color:#E3E3E3;border-radius:8px;align-items:center;justify-content:center}',
'.vtop-logo{display:flex;align-items:center;gap:8px;text-decoration:none;width:212px;flex:none}.vtop-logo span{color:#FFFFFF;font-weight:700;font-size:16px;letter-spacing:-.02em}.vtop-logo b{color:#A6E37A;font-weight:700}',
'#vtop-search{flex:0 1 480px;margin:0 auto;height:34px;display:flex;align-items:center;gap:8px;background:#303030;border:1px solid #4A4A4A;border-radius:10px;color:#B5B5B5;padding:0 10px;font-size:13px;text-align:left}#vtop-search span{flex:1}#vtop-search kbd{font:inherit;font-size:11px;color:#9A9A9A;border:0;background:none}#vtop-search:hover{border-color:#6A6A6A}',
'.vtop-gap{flex:0 0 auto}',
'#vtop-bell{position:relative;width:34px;height:34px;border:0;border-radius:9px;background:#303030;color:#E3E3E3;display:flex;align-items:center;justify-content:center}#vtop-bn:not(:empty){position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;border-radius:8px;background:#E51C00;color:#fff;font-size:10px;font-style:normal;font-weight:600;line-height:16px;text-align:center;padding:0 3px;box-sizing:border-box}',
'.vtop-store{position:relative}#vtop-store{height:34px;display:flex;align-items:center;gap:8px;border:0;background:#303030;border-radius:9px;padding:0 10px 0 4px;color:#E3E3E3;font-size:13px;max-width:220px}.vtop-sn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vtop-av{width:26px;height:26px;border-radius:7px;background:#E3F3D6;color:var(--v-forest);font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none}',
'#vtop-dd{position:absolute;right:0;top:40px;min-width:200px;background:#fff;border-radius:12px;box-shadow:0 4px 18px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.06);padding:6px;display:flex;flex-direction:column}#vtop-dd[hidden]{display:none}#vtop-dd a,#vtop-dd button{display:block;text-align:left;padding:8px 10px;border-radius:8px;color:var(--v-ink);text-decoration:none;border:0;background:none;font-size:13px}#vtop-dd a:hover,#vtop-dd button:hover{background:#F1F1F1}',
/* hide the old floating search/bell (the top bar drives them) and the old phone bar */
'body:not(.locked) #p8top{opacity:0;pointer-events:none;bottom:auto;top:-200px}#mtop{display:none!important}',
/* side menu */
'body:not(.locked) aside{background:var(--v-nav)!important;color:var(--v-ink)!important;border-right:1px solid var(--v-line);top:56px!important;height:calc(100vh - 56px)!important;width:240px!important;padding:10px 8px!important;box-sizing:border-box}',
'body:not(.locked) aside .brand{display:none}',
'body:not(.locked) aside .nav-head{border-radius:8px;min-height:32px;background:transparent!important;box-shadow:none}',
'body:not(.locked) aside .nav-link,body:not(.locked) aside .nav-link *,body:not(.locked) aside .nav-sub a,body:not(.locked) aside a{color:var(--v-ink)!important;-webkit-text-fill-color:currentColor!important;font-weight:500;font-size:13px}body:not(.locked) aside .nav-icon{color:#4A4A4A!important}',
'body:not(.locked) aside .nav-link{padding:6px 10px!important;gap:10px}body:not(.locked) aside .nav-icon svg{width:16px!important;height:16px!important;stroke-width:1.8}',
'body:not(.locked) aside .nav-head:hover{background:#E3E3E3!important}',
'body:not(.locked) aside .nav-head.on,body:not(.locked) aside .nav-head.sub-on{background:#FFFFFF!important;box-shadow:0 1px 0 rgba(0,0,0,.06)}body:not(.locked) aside .nav-head.on .nav-link,body:not(.locked) aside .nav-head.on .nav-link *,body:not(.locked) aside .nav-head.sub-on .nav-link,body:not(.locked) aside .nav-head.sub-on .nav-link *{font-weight:650;color:#1A1A1A!important}',
'body:not(.locked) aside .nav-arrow{color:#8A8A8A!important;background:transparent!important}',
'body:not(.locked) aside .nav-sub{border-left:0!important;margin:2px 0 4px 18px!important}body:not(.locked) aside .nav-sub a{display:block;padding:5px 10px!important;border-radius:7px;color:var(--v-mu)!important}body:not(.locked) aside nav a,body:not(.locked) aside .nav-sub a{box-shadow:none!important;outline:none}body:not(.locked) aside nav a:hover,body:not(.locked) aside .nav-sub a:hover,body:not(.locked) aside .nav-sub a:focus-visible{background:rgba(0,0,0,.06)!important;color:#1A1A1A!important}body:not(.locked) aside nav a:active,body:not(.locked) aside .nav-sub a:active{background:rgba(0,0,0,.09)!important}body:not(.locked) aside .nav-sub a.on,body:not(.locked) aside nav .nav-sub a.on{color:#1A1A1A!important;font-weight:650;background:rgba(0,0,0,.08)!important;box-shadow:none!important}',
'body:not(.locked) aside .grp{color:var(--v-mu)!important;font-size:12px;font-weight:600;padding:12px 10px 4px!important;text-transform:none!important;letter-spacing:0!important}',
'body:not(.locked) aside .store{color:var(--v-ink)!important;background:#FFFFFF!important;border-radius:10px;padding:10px!important;margin:8px 4px!important;box-shadow:0 1px 0 rgba(0,0,0,.06)}body:not(.locked) aside .store b{color:#1A1A1A!important}body:not(.locked) aside .store span{color:var(--v-mu)!important}body:not(.locked) aside .store .lnk,body:not(.locked) aside .store a{color:var(--v-link)!important}',
'body:not(.locked) aside .m9navh,body:not(.locked) aside [class*=navh]{color:var(--v-mu)!important;font-size:12px!important;letter-spacing:0!important;text-transform:none!important}body:not(.locked) aside .btn{background:#FFFFFF!important;color:var(--v-ink)!important;border:1px solid #D4D4D4!important}',
/* page */
'body:not(.locked) main{background:var(--v-bg)}',
'body:not(.locked) main h1{font-size:20px!important;font-weight:650!important;letter-spacing:-.01em;color:#1A1A1A}',
'body:not(.locked) main h2{font-size:15px;font-weight:650;color:#1A1A1A}body:not(.locked) main h3{font-size:14px;font-weight:650;color:#1A1A1A}',
'body:not(.locked) main a:not(.btn):not([data-sf]){color:var(--v-link)}',
'body:not(.locked) main .xc,body:not(.locked) main .panel,body:not(.locked) main .card,body:not(.locked) main .stat-card,body:not(.locked) main .metrics,body:not(.locked) main .ob-sc,body:not(.locked) main .lp-card{background:var(--v-card)!important;border:0!important;border-radius:12px!important;box-shadow:0 1px 0 rgba(0,0,0,.07),0 0 0 1px rgba(0,0,0,.06)!important}',
'body:not(.locked) main .metrics{overflow:hidden}body:not(.locked) main .metric{background:transparent!important;border:0!important;border-right:1px solid #EBEBEB!important;border-radius:0!important;box-shadow:none!important}body:not(.locked) main .metric:last-child{border-right:0!important}body:not(.locked) main .metric small{color:var(--v-mu);font-weight:500;font-size:13px}body:not(.locked) main .metric b{font-size:20px;font-weight:650;color:#1A1A1A}',
'body:not(.locked) main .btn,body:not(.locked) #box .btn{font:inherit;font-size:13px;font-weight:550;height:auto;min-height:30px;padding:5px 12px;border-radius:8px;background:#FFFFFF;color:var(--v-ink);border:1px solid #D4D4D4;box-shadow:0 1px 0 rgba(0,0,0,.05);cursor:pointer}',
'body:not(.locked) main .btn:hover,body:not(.locked) #box .btn:hover{background:#F7F7F7}',
'body:not(.locked) main .btn.pri,body:not(.locked) #box .btn.pri{background:var(--v-btn)!important;color:#FFFFFF!important;border-color:var(--v-btn)!important;box-shadow:inset 0 -1px 0 #000}',
'body:not(.locked) main .btn.pri:hover,body:not(.locked) #box .btn.pri:hover{background:#1A1A1A!important}',
'body:not(.locked) main .btn.bad{color:#8E1F0B!important;border-color:#E0B2A8!important}',
'body:not(.locked) main input:not([type=checkbox]):not([type=radio]),body:not(.locked) main select,body:not(.locked) main textarea,body:not(.locked) #box input:not([type=checkbox]):not([type=radio]),body:not(.locked) #box select,body:not(.locked) #box textarea{font:inherit;font-size:13px;border:1px solid #8A8A8A;border-radius:8px;background:#FDFDFD;color:var(--v-ink)}',
'body:not(.locked) main input:focus,body:not(.locked) main select:focus,body:not(.locked) main textarea:focus,body:not(.locked) #box input:focus{outline:2px solid #005BD3;outline-offset:1px}',
'body:not(.locked) main table{font-size:13px}body:not(.locked) main th{background:#F7F7F7;color:var(--v-mu);font-weight:550;font-size:12px}body:not(.locked) main td{border-color:#EBEBEB!important}',
'body:not(.locked) main tr.row:hover,body:not(.locked) main tbody tr:hover{background:#F7F7F7}',
'body:not(.locked) main .tag,body:not(.locked) main .pill{border-radius:8px!important;font-size:12px;font-weight:550;padding:2px 8px}',
'body:not(.locked) .m13ban{background:#FFF5D8!important;border:1px solid #F0DB9B!important;border-radius:12px!important;color:#4F3A00!important}body:not(.locked) .m13ban .btn{background:#FFFFFF!important;color:var(--v-ink)!important;border:1px solid #C9B064!important}',
'body:not(.locked) #box{border-radius:14px!important;font-family:Inter,system-ui,sans-serif}',
'body:not(.locked) #toast{background:#1A1A1A;border-radius:10px;font-size:13px}',
/* welcome home in the new style */
'body:not(.locked) .ob-home{text-align:left;padding:4px 0 0}body:not(.locked) .ob-home h1{font-size:20px!important}body:not(.locked) .ob-home h2{font-size:15px!important;font-weight:500!important;color:var(--v-mu)!important;margin-top:4px}body:not(.locked) .ob-name{color:#1A1A1A;font-weight:650}body:not(.locked) .ob-sci{font-size:20px}',
/* phone */
'@media(max-width:760px){#vtop-menu{display:flex}.vtop-logo{width:auto}#vtop-search{flex:0 0 40px;width:40px;padding:0;justify-content:center;margin-left:auto}#vtop-search span,#vtop-search kbd{display:none}.vtop-sn{display:none}#vtop-store{padding:0 4px}',
' body:not(.locked) aside{top:56px!important;height:calc(100% - 56px)!important}',
' body:not(.locked) main,body:not(.locked) #main{padding:16px 12px 80px!important}}'].join('');document.head.appendChild(css);
})();
