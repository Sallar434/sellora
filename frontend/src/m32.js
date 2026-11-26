/* ===== v55: Products list header like the owner's Shopify guide — View as (market prices), Import, Export,
   More actions (Bulk edit, Quick add, Move your store), Add product. ===== */
(function(){
var X=window;
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var VA=X._p32=X._p32||{country:''};
function byText(t){return qa('#main button, #main a.btn').filter(function(b){return b.textContent.trim()===t})[0]}
function fmt(v,country){try{var m=X.MK28.marketFor(country),c=m?X.MK28.eff(m).cur.cur:(S.cur||'USD'),r=(S.rates||{})[c]||1,rb=(S.rates||{})[S.cur||'USD']||1,n=v/rb*r;return new Intl.NumberFormat('en',{style:'currency',currency:c,maximumFractionDigits:/PKR|JPY|INR/.test(c)?0:2}).format(n)}catch(e){return (+v).toFixed(2)}}
function regroup(){if(location.hash!=='#products')return;var add=byText('Add product');if(!add||q('#p32more'))return;var bar=add.parentNode;
 var imp=byText('Import CSV'),exp=byText('Export CSV'),bulk=byText('Bulk edit'),quick=byText('Quick add'),move=byText('Move your store');
 var wrap=document.createElement('div');wrap.className='p32bar';
 var countries=[];try{X.MK28.list().forEach(function(m){if(m.status==='Active'&&m.type==='region')m.countries.forEach(function(c){if(countries.indexOf(c)<0)countries.push(c)})})}catch(e){}
 var va=document.createElement('label');va.className='p32va';va.innerHTML='<span>View as</span><select id="p32va" data-xc="1" aria-label="View prices as a customer in"><option value="">Store prices</option>'+countries.sort().map(function(c){return '<option'+(c===VA.country?' selected':'')+'>'+h(c)+'</option>'}).join('')+'</select>';wrap.appendChild(va);
 if(imp){imp.textContent='Import';wrap.appendChild(imp)}if(exp){exp.textContent='Export';wrap.appendChild(exp)}
 var mw=document.createElement('div');mw.className='o31mw';mw.innerHTML='<button class="btn" id="p32more" aria-haspopup="true" type="button">More actions ▾</button><div class="o31pop" id="p32mp" hidden></div>';var pop=q('#p32mp',mw);
 [bulk,quick,move].forEach(function(b){if(b){b.classList.remove('btn','pri');pop.appendChild(b)}});wrap.appendChild(mw);
 wrap.appendChild(add);bar.appendChild(wrap);qa('#main .xh > div, #main .top > div, #xpbar').forEach(function(d){if(d!==wrap&&!d.children.length)d.remove()});
 q('#p32more',mw).onclick=function(e){e.stopPropagation();pop.hidden=!pop.hidden};
 applyView()}
function applyView(){if(location.hash!=='#products')return;var c=VA.country;var th=qa('#main thead th, #main tr:first-child th').filter(function(t){return /^Price/.test(t.textContent.trim())})[0];if(th)th.textContent=c?'Price in '+c:'Price';
 qa('#main tbody tr, #main tr[data-pid], #main tr.row').forEach(function(tr){var pid=+(tr.dataset.pid||tr.dataset.p||(tr.querySelector('[data-pid]')||{}).dataset&&(tr.querySelector('[data-pid]')||{}).dataset.pid);var p=(S.products||[]).filter(function(x){return x.id===pid})[0];
  if(!p){var nm=(tr.querySelector('td:nth-child(2)')||{}).textContent;p=(S.products||[]).filter(function(x){return nm&&nm.trim()===x.name})[0]}if(!p)return;
  var cells=tr.querySelectorAll('td'),pc=cells[cells.length-1];if(!pc)return;if(!pc.dataset.p32)pc.dataset.p32=pc.innerHTML;
  if(!c){pc.innerHTML=pc.dataset.p32;tr.classList.remove('p32un');return}
  var av=X.MK28.avail(p,c);pc.innerHTML=av?h(fmt(X.MK28.price(p,c),c)):'<span class="p32na">Unpublished</span>';tr.classList.toggle('p32un',!av)})}
document.addEventListener('change',function(e){if(e.target&&e.target.id==='p32va'){VA.country=e.target.value;applyView()}});
document.addEventListener('click',function(e){var p=q('#p32mp');if(p&&!p.hidden&&!e.target.closest('#p32more'))p.hidden=true});
if(X.onRoute)X.onRoute(function(){setTimeout(function(){try{regroup()}catch(e){console.error('p32',e)}},0)});
var css=document.createElement('style');css.textContent='.p32bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;margin-left:auto}.p32va{display:inline-flex;align-items:center;gap:6px;border:1px solid #D4D4D4;border-radius:8px;padding:0 8px;background:#fff;height:32px;font-weight:550}.p32va select{border:0!important;background:transparent!important;font:inherit;width:auto!important;padding:0!important;height:auto!important;box-shadow:none!important}#p32mp a,#p32mp button{border:0;background:none;text-align:left;padding:8px 10px;border-radius:6px;font:inherit;cursor:pointer;color:inherit;display:block;width:100%}#p32mp a:hover,#p32mp button:hover{background:#F1F1F1}.p32un td{color:#8A8A8A}.p32na{background:#EBEBEB;border-radius:6px;padding:1px 6px;font-size:12px;color:#616161}';document.head.appendChild(css);
})();
