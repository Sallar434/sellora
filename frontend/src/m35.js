/* ===== v58: Online Store page like the owner's Shopify guide — "Online Store" title with a Public/Private status menu,
   View store and a … menu; the live theme as a large preview with domain, theme name and Edit theme on it;
   a "Schedule changes" card that opens Rollouts. The theme library and Theme Store stay below. ===== */
(function(){
var X=window;
function q(s,r){return (r||document).querySelector(s)}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function dom(){return S.domain||((typeof slug==='function'?slug():'store')+'.vendom.app')}
function isLive(){return !!(S.online&&S.online.live)}
function apply(){if(location.hash!=='#themes')return;var m=q('#main');if(!m||q('#os35bar'))return;
 var hd=q('.v21p .xh',m);if(!hd)return;var h1=q('h1',hd);if(h1)h1.textContent='Online Store';
 var lv=isLive(),bar=document.createElement('div');bar.id='os35bar';bar.className='os35bar';
 bar.innerHTML='<label class="os35st"><span class="os35dot'+(lv?' on':'')+'" aria-hidden="true"></span><select id="os35s" data-xc="1" aria-label="Online store status"><option value="public"'+(lv?' selected':'')+'>Public</option><option value="private"'+(lv?'':' selected')+'>Private</option></select></label>';
 var btns=hd.querySelector('div');if(btns){btns.insertBefore(bar,btns.firstChild);var vs=Array.prototype.filter.call(btns.querySelectorAll('button'),function(b){return /View your store/.test(b.textContent)})[0];if(vs)vs.textContent='View store'}
 var lc=q('#m13live');if(lc)lc.classList.add('os35hide');
 var cur=q('.v21cur',m);if(cur&&!cur.classList.contains('os35cur')){cur.classList.add('os35cur');var info=q('.v21cur-i',cur);if(info){var nm=(q('h2',info)||{}).textContent||'';var meta=document.createElement('div');meta.className='os35meta';var t=(typeof X.live==='function'?X.live():null);meta.innerHTML='<b>'+h(dom())+'</b><span>'+h(nm)+' · '+(lv?'Public':'Private')+(t&&t.saved?' · Last saved '+h(new Date(t.saved).toLocaleString()):'')+'</span>';info.insertBefore(meta,info.firstChild);
   var cz=Array.prototype.filter.call(info.querySelectorAll('button'),function(b){return /Customize/.test(b.textContent)})[0];if(cz)cz.textContent='Edit theme'}}
 if(!q('#os35sch')){var sc=document.createElement('section');sc.id='os35sch';sc.className='os35sch';sc.innerHTML='<div><h3>Schedule changes to your online store</h3><p>Prepare catalog and discount changes for launches, events or sales, then let them go live at the time you choose.</p><button class="btn" data-x="go:markets-rollouts">Create rollout</button></div>';var after=cur||hd;after.parentNode.insertBefore(sc,after.nextSibling)}}
document.addEventListener('change',function(e){if(!e.target||e.target.id!=='os35s')return;var v=e.target.value;
 if(v==='public'){var b=q('[data-x="m13golive"]');if(b){b.click()}else{location.hash='online-store-preferences'}}else{location.hash='online-store-preferences';try{toast('Turn on password protection to make your store private')}catch(x){}}
 setTimeout(function(){var s=q('#os35s');if(s)s.value=isLive()?'public':'private'},300)});
if(X.onRoute)X.onRoute(function(){setTimeout(function(){try{apply()}catch(e){console.error('os35',e)}},0)});
var css=document.createElement('style');css.textContent=['.os35bar{display:inline-flex}.os35st{display:inline-flex;align-items:center;gap:6px;border:1px solid #D4D4D4;border-radius:8px;background:#fff;padding:0 8px;height:32px;font-weight:550}.os35st select{border:0!important;background:transparent!important;font:inherit;width:auto!important;padding:0!important;height:auto!important;box-shadow:none!important}',
'.os35dot{width:8px;height:8px;border-radius:50%;background:#B5B5B5}.os35dot.on{background:#29845A}.os35hide{display:none!important}',
'.os35cur{position:relative;display:block!important;padding:0!important;overflow:hidden;border-radius:16px!important}.os35cur .v21cur-p{width:100%!important;max-width:none!important}',
'.os35cur .v21cur-i{position:absolute;left:0;right:0;bottom:0;padding:40px 18px 14px!important;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff;display:flex!important;align-items:flex-end;gap:12px;flex-wrap:wrap}',
'.os35cur .v21cur-i h2,.os35cur .v21cur-i .mu,.os35cur .v21live{display:none!important}.os35meta{flex:1;display:flex;flex-direction:column;gap:2px;min-width:200px}.os35meta b{font-size:18px}.os35meta span{opacity:.85;font-size:13px}',
'.os35cur .v21acts{display:flex;gap:6px}.os35cur .v21acts .btn{background:rgba(255,255,255,.92)!important;color:#111!important;border-color:transparent!important}.os35cur .v21acts .btn.pri,html body .os35cur .v21acts button.btn.pri{background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;font-weight:650}',
'.os35sch{background:#fff;border:1px solid #E3E3E3;border-radius:12px;padding:14px 16px;margin:12px 0}.os35sch h3{margin:0 0 4px;font-size:14px}.os35sch p{margin:0 0 10px;color:#616161}'].join('\n');document.head.appendChild(css);
})();
/* ---- v58b: theme editor section list like the Shopify guide: clean rows, actions on hover/focus, blue Add section ---- */
(function(){var css=document.createElement('style');css.textContent=['.er .erh{display:flex;align-items:center;gap:4px;border-radius:8px;padding:2px 4px;position:relative}'+
'.er .el{flex:1 1 auto!important;min-width:0!important;width:auto!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.er .erh:hover,.er .erh:focus-within{background:#F1F1F1}',
'.er .egrip{opacity:0;cursor:grab;color:#8A8A8A}.er .erh:hover .egrip,.er .erh:focus-within .egrip{opacity:1}',
'.er .el{flex:1;text-align:left;font-size:13px!important;font-weight:450!important;background:none!important;border:0!important;padding:6px 4px!important}',
'.er .eri{display:none;gap:2px;flex:none}.er .erh:hover .eri,.er .erh:focus-within .eri{display:inline-flex}',
'.er .eri button{border:0!important;background:none!important;width:24px;height:24px;border-radius:6px;padding:0!important;color:#4A4A4A;cursor:pointer}.er .eri button:hover{background:#E3E3E3!important}',
'@media(hover:none){.er .eri,.er .egrip{opacity:1}}'].join('\n');document.head.appendChild(css);
 function blue(){Array.prototype.forEach.call(document.querySelectorAll('a,button'),function(b){if(/^\s*\+\s*Add section\s*$/.test(b.textContent)&&!b.dataset.os35){b.dataset.os35=1;b.classList.add('os35add');b.innerHTML='<span aria-hidden="true">⊕</span> Add section'}})}
 var c2=document.createElement('style');c2.textContent='.os35add{color:#005BD3!important;text-decoration:none!important;font-weight:550;display:inline-flex;gap:6px;align-items:center;padding:6px 4px}.os35add:hover{text-decoration:underline!important}';document.head.appendChild(c2);
 new MutationObserver(function(){try{blue()}catch(e){}}).observe(document.body,{childList:true,subtree:true})})();
