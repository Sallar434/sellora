/* ===== v50: Step 1 of the admin rebuild — real alerts popover, store menu, and a Shopify-style Home
   (date range, metric cards with trend lines, things to do, live visitors, recent activity). ===== */
(function(){
var X=window,A=X.ACT=X.ACT||{};
function q(s){return document.querySelector(s)}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function sv(){try{save()}catch(e){}}
function mon(n){try{return money(n)}catch(e){return '$'+(+n||0).toFixed(2)}}
var DAY=864e5;
function ago(t){var s=Math.max(0,(Date.now()-t)/1000);if(s<60)return 'Just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<DAY/1000)return Math.floor(s/3600)+' h ago';var d=Math.floor(s/86400);return d===1?'Yesterday':d<7?d+' days ago':new Date(t).toLocaleDateString()}
function orders(){return (S.orders||[]).filter(function(o){return o&&!o.cancelled})}
function prods(){return S.products||[]}
function carts(){return (S.carts||[]).filter(function(c){return !c.recovered})}
function sess(){return S.sess24||[]}
function oAt(o){return o.at||o.date||0}

/* ---------- alerts: built from the store's real state, never sample data ---------- */
function alerts(){var a=[],uf=orders().filter(function(o){return o.v30&&o.pay!=='Refunded'&&o.ful!=='Fulfilled'}).length,
 oos=prods().filter(function(p){return p.status==='Active'&&(+p.stock||0)<=0&&!(p.vars&&p.vars.length)}),
 low=prods().filter(function(p){var s=+p.stock||0;return p.status==='Active'&&s>0&&s<=5&&!(p.vars&&p.vars.length)}),ab=carts().length,m=X.m13;
 if(uf)a.push({id:'uf',sig:uf,t:uf+' order'+(uf>1?'s':'')+' to fulfil',d:'Paid orders waiting to be shipped.',r:'orders',k:'warn'});
 if(oos.length)a.push({id:'oos',sig:oos.map(function(p){return p.id}).join(),t:oos.length+' product'+(oos.length>1?'s are':' is')+' out of stock',d:oos.slice(0,3).map(function(p){return p.name}).join(', '),r:'products-inventory',k:'crit'});
 if(low.length)a.push({id:'low',sig:low.map(function(p){return p.id+':'+p.stock}).join(),t:low.length+' product'+(low.length>1?'s are':' is')+' low on stock',d:low.slice(0,3).map(function(p){return p.name+' ('+p.stock+')'}).join(', '),r:'products-inventory',k:'warn'});
 if(ab)a.push({id:'ab',sig:ab,t:ab+' abandoned checkout'+(ab>1?'s':''),d:'Send a recovery message to win the sale back.',r:'orders-abandoned',k:'info'});
 try{if(m&&m.sub()&&!m.paid()){var l=m.left();a.push({id:'trial',sig:l,t:m.dead()?'Your trial has ended':'Trial ends in '+l+' day'+(l===1?'':'s'),d:'Pick a plan to publish your store.',r:'s-plan',k:m.dead()?'crit':'info'})}}catch(e){}
 if(!prods().length)a.push({id:'np',sig:1,t:'Add your first product',d:'Your store has no products yet.',r:'products',k:'info'});
 var rd=S.alRead27||{};a.forEach(function(x){x.read=rd[x.id]===String(x.sig)});return a}
function unread(){return alerts().filter(function(x){return !x.read}).length}
function badge(){var n=unread(),b=q('#vtop-bn'),o=q('#p8bn');if(b)b.textContent=n?n:'';if(o)o.textContent=n?n:''}
function markAll(){var rd=S.alRead27=S.alRead27||{};alerts().forEach(function(x){rd[x.id]=String(x.sig)});sv();badge()}
var ICN={crit:'<span class="h27dot crit"></span>',warn:'<span class="h27dot warn"></span>',info:'<span class="h27dot info"></span>'};
function closePops(){var p=q('#h27pop');if(p)p.remove();var b=q('#vtop-bell');if(b)b.setAttribute('aria-expanded','false')}
function openAlerts(){var ex=q('#h27pop');closePops();if(ex)return;var sd=q('#vtop-dd');if(sd&&!sd.hidden){sd.hidden=true;var sb=q('#vtop-store');if(sb)sb.setAttribute('aria-expanded','false')}var a=alerts(),b=q('#vtop-bell');if(!b)return;
 var d=document.createElement('div');d.id='h27pop';d.className='h27pop';d.setAttribute('role','dialog');d.setAttribute('aria-label','Alerts');
 d.innerHTML='<div class="h27ph"><b>Alerts</b>'+(a.some(function(x){return !x.read})?'<button type="button" class="h27lnk" id="h27all">Mark all as read</button>':'')+'</div>'
  +(a.length?a.map(function(x){return '<a class="h27al'+(x.read?'':' un')+'" href="#'+x.r+'" data-al27="'+x.id+'">'+ICN[x.k]+'<span><b>'+h(x.t)+'</b><small>'+h(x.d)+'</small></span></a>'}).join(''):'<div class="h27none"><b>You\'re all caught up</b><small>New alerts about orders, stock and your plan show here.</small></div>');
 document.body.appendChild(d);var r=b.getBoundingClientRect();var W=Math.min(360,innerWidth-16);if(r.top>innerHeight/2){d.style.bottom=Math.max(8,innerHeight-r.top+8)+'px';d.style.top='auto';d.style.left=Math.min(Math.max(8,r.left),innerWidth-W-8)+'px';d.style.maxHeight=Math.max(200,r.top-24)+'px'}else{d.style.top=(r.bottom+8)+'px';d.style.right=Math.max(8,innerWidth-r.right)+'px'}b.setAttribute('aria-expanded','true');
 var all=d.querySelector('#h27all');if(all)all.onclick=function(e){e.stopPropagation();markAll();closePops();openAlerts()};
 Array.prototype.forEach.call(d.querySelectorAll('[data-al27]'),function(el){el.onclick=function(){var x=a.filter(function(y){return y.id===el.dataset.al27})[0];if(x){(S.alRead27=S.alRead27||{})[x.id]=String(x.sig);sv()}closePops();badge()}});
 d.onclick=function(e){e.stopPropagation()}}
document.addEventListener('click',function(e){if(q('#h27pop')&&!e.target.closest('#vtop-bell'))closePops()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&q('#h27pop')){closePops();var b=q('#vtop-bell');if(b)b.focus()}});
function wireTop(){var b=q('#vtop-bell');if(b&&!b.dataset.h27){b.dataset.h27=1;b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');b.onclick=function(e){e.stopPropagation();openAlerts()}}
 var o=q('#p8bell');if(o&&!o.dataset.h27){o.dataset.h27=1;o.onclick=function(e){e.stopPropagation();openAlerts()}}
 var sbt=q('#vtop-store');if(sbt&&!sbt.dataset.h27){sbt.dataset.h27=1;sbt.addEventListener('click',closePops)}
 var dd=q('#vtop-dd');if(dd&&!dd.dataset.h27){dd.dataset.h27=1;var hd=document.createElement('div');hd.className='h27ddh';dd.insertBefore(hd,dd.firstChild);
  var pref=document.createElement('a');pref.setAttribute('role','menuitem');pref.href='#online-store-preferences';pref.textContent='Online store preferences';var st=dd.querySelector('a[href="#s-general"]');if(st)dd.insertBefore(pref,st.nextSibling)}
 var hd2=dd&&dd.querySelector('.h27ddh');if(hd2){var dom=S.domain||((typeof slug==='function'?slug():'store')+'.vendom.app');hd2.innerHTML='<b>'+h(S.name||'My Store')+'</b><small>'+h(dom)+'</small>'}
 badge()}
wireTop();if(X.onRoute)X.onRoute(function(){wireTop()});setInterval(badge,4000);
X.H27={alerts:alerts,unread:unread,open:openAlerts};

/* ---------- Home ---------- */
var HM=X.HM27={days:30};
var RANGES=[[1,'Today'],[7,'Last 7 days'],[30,'Last 30 days'],[90,'Last 90 days']];
function series(days){var now=new Date(),end=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime()+DAY,n=days===1?24:days,step=days===1?DAY/24:DAY,start=end-n*step,
  s={sales:[],orders:[],sess:[],start:start,step:step,n:n};for(var i=0;i<n;i++){s.sales.push(0);s.orders.push(0);s.sess.push(0)}
 orders().forEach(function(o){var t=oAt(o);if(t>=start&&t<end){var i=Math.floor((t-start)/step);s.sales[i]+=(o.total||0)-(o.refunded||0);s.orders[i]++}});
 sess().forEach(function(v){if(v.at>=start&&v.at<end)s.sess[Math.floor((v.at-start)/step)]++});return s}
function sum(a){return a.reduce(function(x,y){return x+y},0)}
function prevTotals(days){var s=series(days*2),half=s.n/2;return{sales:sum(s.sales.slice(0,half)),orders:sum(s.orders.slice(0,half)),sess:sum(s.sess.slice(0,half))}}
function spark(a,id){var mx=Math.max.apply(null,a.concat([0])),w=120,ht=32,n=a.length;if(!mx)return '<svg class="h27sp" viewBox="0 0 '+w+' '+ht+'" aria-hidden="true"><path d="M0 '+(ht-1)+'H'+w+'" stroke="#C9CCCF" stroke-width="1.5" fill="none"/></svg>';
 var pts=a.map(function(v,i){return (n>1?i*w/(n-1):0).toFixed(1)+' '+(ht-2-(v/mx)*(ht-6)).toFixed(1)}).join(' L');return '<svg class="h27sp" viewBox="0 0 '+w+' '+ht+'" aria-hidden="true"><path d="M'+pts+'" stroke="#005BD3" stroke-width="1.8" fill="none" stroke-linejoin="round"/></svg>'}
function delta(cur,prev){if(!prev&&!cur)return '<span class="h27dl">—</span>';if(!prev)return '<span class="h27dl up">New</span>';var p=(cur-prev)/prev*100;return '<span class="h27dl '+(p>=0?'up':'dn')+'">'+(p>=0?'↑':'↓')+' '+Math.abs(p).toFixed(0)+'%</span>'}
function live(){var t=Date.now()-5*60*1000;return sess().filter(function(v){return v.at>=t}).length}
function todo(){var t=[],uf=orders().filter(function(o){return o.v30&&o.pay!=='Refunded'&&o.ful!=='Fulfilled'}),ab=carts(),oos=prods().filter(function(p){return p.status==='Active'&&(+p.stock||0)<=0&&!(p.vars&&p.vars.length)}),dr=prods().filter(function(p){return p.status==='Draft'});
 if(uf.length)t.push(['orders',uf.length+' order'+(uf.length>1?'s':'')+' to fulfil','box']);
 if(ab.length)t.push(['orders-abandoned',ab.length+' abandoned checkout'+(ab.length>1?'s':'')+' to recover','cart']);
 if(oos.length)t.push(['products-inventory',oos.length+' product'+(oos.length>1?'s':'')+' out of stock','tag']);
 if(dr.length)t.push(['products',dr.length+' draft product'+(dr.length>1?'s':'')+' not on sale yet','tag']);return t}
function activity(){var ev=[];orders().forEach(function(o){ev.push({at:oAt(o),t:'Order #'+o.id+' placed by '+(o.who||'a customer'),s:mon(o.total||0),r:'order-'+o.id,k:'order'});(o.tl||[]).forEach(function(x){if(!/^Order placed/.test(x.t))ev.push({at:x.at,t:'Order #'+o.id+': '+x.t,r:'order-'+o.id,k:'tl'})})});
 (S.cust||[]).forEach(function(c){if(c.created)ev.push({at:c.created,t:'New customer: '+(((c.first||'')+' '+(c.last||'')).trim()||c.email),r:'customers',k:'cust'})});
 (S.orders||[]).filter(function(o){return o.cancelled}).forEach(function(o){ev.push({at:o.cancelledAt||oAt(o),t:'Order #'+o.id+' was cancelled',r:'order-'+o.id,k:'tl'})});
 return ev.filter(function(e){return e.at}).sort(function(a,b){return b.at-a.at}).slice(0,8)}
function homeBlock(){var d=HM.days,s=series(d),p=prevTotals(d),sales=sum(s.sales),on=sum(s.orders),se=sum(s.sess),cv=se?Math.min(100,on/se*100):0,aov=on?sales/on:0,lv=live(),T=todo(),ev=activity();
 var card=function(lbl,val,dl,sp){return '<button type="button" class="h27m metric" data-x="go:analytics"><small>'+lbl+'</small><div class="h27mv"><b>'+val+'</b>'+dl+'</div>'+sp+'</button>'};
 return '<div class="h27" id="h27home"><div class="h27bar"><label class="h27rng"><span class="sr">Date range</span><select id="h27days" aria-label="Date range">'+RANGES.map(function(r){return '<option value="'+r[0]+'"'+(r[0]===d?' selected':'')+'>'+r[1]+'</option>'}).join('')+'</select></label><span class="h27ch">All channels</span>'
  +'<a class="h27live" href="#analytics-live-view"><i class="'+(lv?'on':'')+'"></i>'+lv+' live visitor'+(lv===1?'':'s')+'</a></div>'
  +'<div class="h27ms">'+card('Sessions',se,delta(se,p.sess),spark(s.sess))+card('Total sales',mon(sales),delta(sales,p.sales),spark(s.sales))+card('Orders',on,delta(on,p.orders),spark(s.orders))+card('Conversion rate',cv.toFixed(1)+'%','<span class="h27dl">AOV '+mon(aov)+'</span>','')+'</div>'
  +'<div class="h27two"><section class="h27c"><h3>Things to do</h3>'+(T.length?T.map(function(x){return '<a class="h27todo" href="#'+x[0]+'"><span>'+h(x[1])+'</span><span aria-hidden="true">›</span></a>'}).join(''):'<p class="h27mu">Nothing needs your attention right now.</p>')+'</section>'
  +'<section class="h27c"><div class="h27ch3"><h3>Recent activity</h3><a href="#orders" class="h27lnk">View orders</a></div>'+(ev.length?'<ul class="h27feed">'+ev.map(function(e){return '<li><a href="#'+e.r+'"><span class="h27fd '+e.k+'"></span><span class="h27ft">'+h(e.t)+(e.s?' · <b>'+h(e.s)+'</b>':'')+'</span><time>'+ago(e.at)+'</time></a></li>'}).join('')+'</ul>':'<p class="h27mu">Orders, customers and fulfilments will appear here as they happen.</p>')+'</section></div></div>'}
var HO=V.home;V.home=function(){var out=HO.apply(this,arguments);try{var old=homeMetrics();var blk=homeBlock();if(out.indexOf(old)>=0)out=out.replace(old,blk);else{var i=out.indexOf('<div class="metrics">');if(i>=0){var j=out.indexOf('</div></div>',i);out=out.slice(0,i)+blk+out.slice(j+12)}else out=blk+out}}catch(e){console.error('h27',e)}return out};
document.addEventListener('change',function(e){if(e.target&&e.target.id==='h27days'){HM.days=+e.target.value;var el=q('#h27home');if(el){el.outerHTML=homeBlock()}}});
setInterval(function(){if((location.hash||'#home')==='#home'){var l=q('.h27live');if(l){var n=live();l.innerHTML='<i class="'+(n?'on':'')+'"></i>'+n+' live visitor'+(n===1?'':'s')}}},15000);

/* ---------- styles (Polaris-like: light grey canvas, white cards, subtle borders) ---------- */
var css=document.createElement('style');css.id='h27css';css.textContent=[
'.h27pop{position:fixed;z-index:120;width:360px;max-width:calc(100vw - 16px);max-height:70vh;overflow:auto;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.06);font:13px Inter,system-ui,sans-serif;color:#303030;animation:h27in .14s ease-out}',
'@keyframes h27in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.h27pop{animation:none}}',
'.h27ph{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #EBEBEB}.h27ph b{font-size:14px}',
'.h27lnk{background:none;border:0;color:#005BD3;font:inherit;cursor:pointer;padding:0;text-decoration:none}.h27lnk:hover{text-decoration:underline}',
'.h27al{display:flex;gap:10px;padding:10px 14px;text-decoration:none;color:inherit;border-bottom:1px solid #F1F1F1}.h27al:hover,.h27al:focus-visible{background:#F7F7F7}.h27al span{display:flex;flex-direction:column;gap:2px}.h27al small{color:#616161}.h27al:not(.un) b{font-weight:500;color:#616161}',
'.h27dot{width:8px;height:8px;border-radius:50%;flex:none;margin-top:5px;background:#8A8A8A}.h27dot.crit{background:#E22C38}.h27dot.warn{background:#E8A000}.h27dot.info{background:#005BD3}.h27al:not(.un) .h27dot{background:#D4D4D4}',
'.h27none{padding:24px 14px;text-align:center;display:flex;flex-direction:column;gap:4px}.h27none small{color:#616161}',
'.h27ddh{padding:10px 12px 8px;border-bottom:1px solid #EBEBEB;margin-bottom:4px;display:flex;flex-direction:column}.h27ddh small{color:#616161}',
'.h27{margin:0 0 18px}.h27bar{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}',
'.h27rng select{height:32px;border:1px solid #D4D4D4;border-radius:8px;background:#fff;padding:0 28px 0 10px;font:inherit;font-weight:550;color:#303030}',
'.h27ch{color:#616161;font-size:12px}',
'.h27live{margin-left:auto;display:inline-flex;align-items:center;gap:6px;color:#303030;text-decoration:none;font-weight:550}.h27live i{width:8px;height:8px;border-radius:50%;background:#B5B5B5}.h27live i.on{background:#29845A;box-shadow:0 0 0 3px rgba(41,132,90,.2)}',
'.h27ms{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border:1px solid #E3E3E3;border-radius:12px;overflow:hidden}',
'.h27m{all:unset;box-sizing:border-box;cursor:pointer;padding:12px 14px;display:flex;flex-direction:column;gap:4px;border-right:1px solid #EBEBEB;min-width:0}.h27m:last-child{border-right:0}.h27m:hover{background:#FAFAFA}.h27m:focus-visible{outline:2px solid #005BD3;outline-offset:-2px}',
'.h27m small{color:#616161;font-size:12px;text-decoration:underline dotted #B5B5B5;text-underline-offset:3px}.h27mv{display:flex;align-items:baseline;gap:8px}.h27mv b{font-size:18px;font-weight:650}',
'.h27dl{font-size:12px;color:#616161}.h27dl.up{color:#29845A}.h27dl.dn{color:#C70A24}.h27sp{width:100%;height:32px}',
'.h27two{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.h27c{background:#fff;border:1px solid #E3E3E3;border-radius:12px;padding:14px 16px}.h27c h3{margin:0 0 8px;font-size:14px}.h27ch3{display:flex;justify-content:space-between;align-items:baseline}',
'.h27todo{display:flex;justify-content:space-between;padding:9px 10px;margin:0 -10px;border-radius:8px;color:#303030;text-decoration:none;font-weight:550}.h27todo:hover{background:#F7F7F7}',
'.h27mu{color:#616161;margin:4px 0}.h27feed{list-style:none;margin:0;padding:0}.h27feed a{display:flex;gap:10px;align-items:center;padding:7px 0;color:#303030;text-decoration:none;border-bottom:1px solid #F1F1F1}.h27feed li:last-child a{border-bottom:0}.h27feed a:hover .h27ft{text-decoration:underline}',
'.h27ft{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.h27feed time{color:#616161;font-size:12px;flex:none}.h27fd{width:8px;height:8px;border-radius:50%;background:#005BD3;flex:none}.h27fd.cust{background:#29845A}.h27fd.tl{background:#8A8A8A}',
'.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
'@media(max-width:800px){.h27ms{grid-template-columns:1fr 1fr}.h27m:nth-child(2){border-right:0}.h27m:nth-child(-n+2){border-bottom:1px solid #EBEBEB}.h27two{grid-template-columns:1fr}}'
].join('\n');document.head.appendChild(css);
})();
