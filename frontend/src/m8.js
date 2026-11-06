/* ===== Sellora v31: Shopify parity layer (nav, index tables, save bar, breadcrumbs, empty states, search, new pages) ===== */
(function(){
var X=window,A=X.ACT=X.ACT||{};
function q(s,r){return (r||document).querySelector(s)}function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nr(){var r=location.hash.slice(1);return X._normRoute?X._normRoute(r):r}
function sv(){try{save()}catch(e){}}function tst(m){try{toast(m)}catch(e){}}
function so(k){S.sp=S.sp||{};return S.sp[k]=S.sp[k]||{}}
function card(t,b){return '<div class="xc spc"><h3 style="margin:0 0 10px;font-size:14px">'+t+'</h3>'+b+'</div>'}
function fl(l,id,v,t){return X.xfld?X.xfld(l,id,v,t):'<label>'+l+'</label><input class="xin" id="'+id+'" value="'+h(v)+'">'}
function vl(id){var e=document.getElementById(id);return e?(e.type==='checkbox'?e.checked:e.value.trim()):''}
function hd(t,b){return X.xhead?X.xhead(t,b):'<div class="xh"><h1>'+t+'</h1>'+(b||'')+'</div>'}
function empty(icon,t,d,btn){return '<div class="xempty"><div class="xei">'+icon+'</div><h2>'+t+'</h2><p>'+d+'</p>'+(btn||'')+'</div>'}

/* ---------- 1. NAV: Shopify order + sub-items ---------- */
var NC=X.NAV_CONFIG;
if(NC&&!NC._p8){NC._p8=1;
 var g=NC.filter(function(n){return n.id==='growth'})[0];
 if(g){g.label='Marketing';g.sub=[{id:'growth-campaigns',label:'Campaigns'},{id:'growth-automations',label:'Automations'},{id:'growth-attribution',label:'Attribution'},{id:'growth-autopilot',label:'Autopilot'}];
  /* Shopify order: Home, Orders, Products, Customers, Marketing, Discounts, Content, Markets, Finance, Analytics, Apps, Sales channels */
  var ix=function(id){return NC.findIndex(function(n){return n.id===id})};
  var mk=NC.splice(ix('growth'),1)[0];NC.splice(ix('discounts'),0,mk);
 }
 var an2=NC.filter(function(n){return n.id==='analytics'})[0];if(an2)an2.sub=[{id:'analytics-reports',label:'Reports'},{id:'analytics-live-view',label:'Live View'}];
 var os=NC.filter(function(n){return n.id==='themes'})[0];
 if(os)os.sub=[{id:'themes',label:'Themes'},{id:'online-store-preferences',label:'Preferences'}];
 var ct=NC.filter(function(n){return n.id==='content'})[0];if(ct&&ct.sub&&!ct.sub.some(function(s){return s.id==='online-store-pages'}))ct.sub.push({id:'online-store-pages',label:'Pages'});
 var cu=NC.filter(function(n){return n.id==='customers'})[0];if(cu&&cu.sub&&!cu.sub.some(function(s){return s.id==='customers-segments'}))cu.sub.unshift({id:'customers-segments',label:'Segments'});
 var fi=NC.filter(function(n){return n.id==='finance'})[0];if(fi&&fi.sub&&!fi.sub.some(function(s){return s.id==='finance-billing'}))fi.sub.push({id:'finance-billing',label:'Billing'});
}

/* ---------- 2. Data defaults ---------- */
function init(){if(!X.S)return;
 S.osPages=S.osPages||[{id:'pg1',title:'About us',handle:'about-us',body:'Hand-made sports gear from Sialkot since 1998.',vis:true,at:Date.now()},{id:'pg2',title:'Contact',handle:'contact',body:'Email or WhatsApp us any time.',vis:true,at:Date.now()},{id:'pg3',title:'Size guide',handle:'size-guide',body:'',vis:false,at:Date.now()}];
 S.autos=S.autos||[
  {id:'au1',name:'Abandoned checkout recovery',trig:'Checkout abandoned',steps:['Wait 1 hour','Send email','Wait 1 day','Send WhatsApp reminder'],on:true,sent:42,conv:6},
  {id:'au2',name:'Welcome new subscriber',trig:'Customer subscribes',steps:['Send welcome email with 10% code'],on:true,sent:118,conv:14},
  {id:'au3',name:'Win back lapsed customers',trig:'No order in 90 days',steps:['Send email','Wait 7 days','Send discount'],on:false,sent:0,conv:0},
  {id:'au4',name:'Thank-you after first order',trig:'First order placed',steps:['Wait 3 days','Ask for review'],on:false,sent:0,conv:0},
  {id:'au5',name:'Cash on delivery confirmation',trig:'COD order placed',steps:['Send WhatsApp confirm/cancel message','Auto-cancel if no reply in 24 hours'],on:false,sent:0,conv:0}];
 S.views=S.views||{};S.alerts=S.alerts||[{id:'al1',t:'3 orders are ready to fulfil',r:'orders',read:false},{id:'al2',t:'Finish identity checks (KYC) to receive payouts',r:'pay-onboarding',read:false},{id:'al3',t:'Low stock: Track Day Tee is out of stock',r:'products-inventory',read:false}];
 S.activity=S.activity||[];
}
X.p8init=init;

/* ---------- 3. New pages ---------- */
var V=X.V||window.V;
function pagesV(){init();var L=S.osPages;
 if(!L.length)return '<div class="xw">'+hd('Pages','<button class="btn pri" data-x="p8pg:">Add page</button>')+empty('📄','Add pages to your online store','Write clear page titles and content to improve search engine optimisation (SEO) and help customers find your site.','<button class="btn pri" data-x="p8pg:">Add page</button>')+'</div>';
 return '<div class="xw">'+hd('Pages','<button class="btn pri" data-x="p8pg:">Add page</button>')+'<div class="xc"><table class="tbl"><thead><tr><th>Title</th><th>Visibility</th><th>Content</th><th>Updated</th></tr></thead><tbody>'+L.map(function(p){return '<tr class="row" data-x="p8pg:'+p.id+'"><td><b>'+h(p.title)+'</b><div class="mu" style="font-size:12px">/pages/'+h(p.handle)+'</div></td><td><span class="pill '+(p.vis?'ok':'')+'">'+(p.vis?'Visible':'Hidden')+'</span></td><td>'+h((p.body||'').slice(0,60)||'—')+'</td><td>'+new Date(p.at).toLocaleDateString()+'</td></tr>'}).join('')+'</tbody></table></div></div>'}
A.p8pg=function(id){init();location.hash='online-store-page-'+(id||'new')};
function pageDetail(id){init();var p=S.osPages.filter(function(x){return x.id===id})[0]||{id:'',title:'',handle:'',body:'',vis:true,seo:''};
 return '<div class="xw">'+hd((p.id?h(p.title):'Add page'),'')+'<div class="xdet"><div class="xmain">'+card('Page',fl('Title','p8t',p.title)+'<label for="p8b">Content</label><textarea class="xin" id="p8b" rows="9">'+h(p.body)+'</textarea>')+card('Search engine listing',fl('Page title','p8st',p.seoT||p.title)+fl('Meta description','p8sd',p.seo||'')+fl('URL handle','p8h',p.handle))+'</div><div class="xside">'+card('Visibility','<label class="xchk"><input type="radio" name="p8v" id="p8vis" '+(p.vis?'checked':'')+'> Visible</label><label class="xchk"><input type="radio" name="p8v" '+(p.vis?'':'checked')+'> Hidden</label>')+card('Template','<select class="xin" id="p8tpl"><option>page</option><option>page.contact</option><option>page.faq</option></select>')+(p.id?'<button class="btn" style="color:#b42318" data-x="p8pgdel:'+p.id+'">Delete page</button>':'')+'</div></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn pri" data-x="p8pgsave:'+p.id+'">Save</button></div></div>'}
A.p8pgsave=function(id){var t=vl('p8t');if(!t)return tst('Title is required');var p=S.osPages.filter(function(x){return x.id===id})[0];if(!p){p={id:'pg'+Date.now()};S.osPages.unshift(p)}p.title=t;p.body=vl('p8b');p.seoT=vl('p8st');p.seo=vl('p8sd');p.handle=(vl('p8h')||t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');p.vis=vl('p8vis');p.at=Date.now();log('Page saved: '+t);sv();clean();tst('Page saved');location.hash='online-store-pages'};
A.p8pgdel=function(id){S.osPages=S.osPages.filter(function(x){return x.id!==id});sv();tst('Page deleted');location.hash='online-store-pages'};
function prefV(){init();var p=so('prefs');
 return '<div class="xw">'+hd('Preferences','')+'<div class="xdet"><div class="xmain">'+card('Title and meta description',fl('Homepage title','pf1',p.title||S.name||'')+fl('Homepage meta description','pf2',p.desc||''))+card('Social sharing image','<p class="mu">Shown when your store link is shared on WhatsApp, Facebook or X.</p>'+fl('Image URL','pf3',p.img||''))+card('Customer privacy','<label class="xchk"><input type="checkbox" id="pf4" '+(p.cookie!==false?'checked':'')+'> Show cookie banner to visitors in the EU and UK</label>')+card('Spam protection','<label class="xchk"><input type="checkbox" id="pf5" '+(p.captcha!==false?'checked':'')+'> Use a captcha on contact, comment and login forms</label>')+'</div><div class="xside">'+card('Password protection','<label class="xchk"><input type="checkbox" id="pf6" '+(p.pw?'checked':'')+'> Restrict access with a password</label>'+fl('Password','pf7',p.pwv||'')+fl('Message for visitors','pf8',p.pwm||'Opening soon'))+card('Google Analytics','<p class="mu">Connected through Apps › Google & GA4.</p>')+'</div></div><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn pri" data-x="p8pref">Save</button></div></div>'}
A.p8pref=function(){var p=so('prefs');p.title=vl('pf1');p.desc=vl('pf2');p.img=vl('pf3');p.cookie=vl('pf4');p.captcha=vl('pf5');p.pw=vl('pf6');p.pwv=vl('pf7');p.pwm=vl('pf8');if(p.pw&&!p.pwv)return tst('Enter a password');log('Online store preferences updated');sv();clean();tst('Preferences saved')};
function autoV(){init();var L=S.autos;
 return '<div class="xw">'+hd('Automations','<button class="btn pri" data-x="p8au:">Create automation</button>')+'<div class="xc"><table class="tbl"><thead><tr><th>Automation</th><th>Trigger</th><th>Status</th><th>Sent</th><th>Orders</th><th></th></tr></thead><tbody>'+L.map(function(a){return '<tr class="row"><td><b>'+h(a.name)+'</b><div class="mu" style="font-size:12px">'+h(a.steps.join(' → '))+'</div></td><td>'+h(a.trig)+'</td><td><span class="pill '+(a.on?'ok':'')+'">'+(a.on?'Active':'Off')+'</span></td><td>'+a.sent+'</td><td>'+a.conv+'</td><td><button class="btn" data-x="p8aut:'+a.id+'">'+(a.on?'Turn off':'Turn on')+'</button></td></tr>'}).join('')+'</tbody></table></div></div>'}
A.p8aut=function(id){var a=S.autos.filter(function(x){return x.id===id})[0];a.on=!a.on;log('Automation '+(a.on?'activated':'turned off')+': '+a.name);sv();route()};
A.p8au=function(){X.xmodal('Create automation',fl('Name','au1','')+'<label for="au2">Trigger</label><select class="xin" id="au2"><option>Checkout abandoned</option><option>Customer subscribes</option><option>Order placed</option><option>COD order placed</option><option>Order fulfilled</option><option>No order in 90 days</option><option>Product back in stock</option></select>'+fl('Steps (comma separated)','au3','Send email'),'Create',function(){if(!vl('au1'))return (q('#xme').textContent='Name required',false);S.autos.push({id:'au'+Date.now(),name:vl('au1'),trig:vl('au2'),steps:vl('au3').split(',').map(function(s){return s.trim()}).filter(Boolean),on:false,sent:0,conv:0});sv()})};
function billV(){var inv=S.invoices||[{n:'SB-1042',d:'Oct 1, 2026',amt:29,st:'Paid'},{n:'SB-1031',d:'Sep 1, 2026',amt:29,st:'Paid'}];
 return '<div class="xw">'+hd('Billing','')+'<div class="xdet"><div class="xmain">'+card('Bills','<table class="tbl"><thead><tr><th>Bill</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>'+inv.map(function(b){return '<tr><td>'+b.n+'</td><td>'+b.d+'</td><td>'+money(b.amt)+' <small>'+X.curL('USD')+'</small></td><td><span class="pill ok">'+b.st+'</span></td></tr>'}).join('')+'</tbody></table>')+'</div><div class="xside">'+card('Payment method','Sellora Pay wallet balance<br><span class="mu">Backup: card ending 4242</span>')+card('Plan','<b>'+h((S.plan||'Basic'))+'</b><br><a data-r="s-plan" href="#s-plan">Change plan</a>')+'</div></div></div>'}
if(V){V['online-store-pages']=pagesV;V['online-store-preferences']=prefV;V['growth-automations']=autoV;V['finance-billing']=billV}
if(X.PAGE)X.PAGE['online-store-page']=pageDetail;

/* ---------- 4. Settings additions ---------- */
var SX=X.SXS||{};
var SNEW=[['s-markets','Markets'],['s-apps','Apps and sales channels'],['s-brand','Brand'],['s-custevents','Customer events'],['s-giftcards','Gift cards'],['s-packing','Packing slip template'],['s-activity','Store activity log']];
SX.markets=function(){var m=(S.markets||[]);return '<h2>Markets</h2><p class="mu">Sell to different countries with their own currency, prices and domains.</p><div class="xc">'+(m.length?m.map(function(x){return '<div style="padding:8px 0;border-bottom:1px solid #eee"><b>'+h(x.name||x)+'</b> '+(x.cur?'— '+X.curL(x.cur):'')+'</div>'}).join(''):'Primary market: Pakistan — '+X.curL('PKR')+'<br>International — '+X.curL('USD'))+'<br><a href="#markets">Manage markets</a></div>'};
SX.apps=function(){var a=(S.apps||[]).filter(function(x){return x.installed||x.on});return '<h2>Apps and sales channels</h2><div class="xc"><b>Sales channels</b><br>Online Store · Point of Sale · WhatsApp catalogue<br><br><b>Installed apps</b><br>'+(a.length?a.map(function(x){return h(x.name)}).join(' · '):'Manage from the App Store.')+'<br><br><a href="#apps-marketplace">Visit the App Store</a></div>'};
SX.brand=function(){var b=so('brand');return '<h2>Brand</h2><div class="xc">'+fl('Slogan','br1',b.slogan||'')+fl('Short description','br2',b.desc||'')+fl('Logo URL','br3',b.logo||'')+fl('Primary colour','br4',b.c1||'#2E6B4F','color')+fl('Accent colour','br5',b.c2||'#F2C14E','color')+'<button class="btn pri" data-x="p8brand" style="margin-top:10px">Save</button></div>'};
A.p8brand=function(){var b=so('brand');b.slogan=vl('br1');b.desc=vl('br2');b.logo=vl('br3');b.c1=vl('br4');b.c2=vl('br5');log('Brand updated');sv();clean();tst('Brand saved')};
SX.custevents=function(){var c=so('pixels');return '<h2>Customer events</h2><p class="mu">Pixels that track what shoppers do in your store (page viewed, added to cart, checkout completed).</p><div class="xc">'+fl('Custom pixel name','ce1','')+'<label for="ce2">Code</label><textarea class="xin" id="ce2" rows="4" placeholder="analytics.subscribe(\'checkout_completed\', e => { ... })"></textarea><button class="btn pri" data-x="p8pix" style="margin-top:10px">Add pixel</button><br><br>'+((c.list||[]).map(function(p){return '<div>• '+h(p)+' <span class="pill ok">Connected</span></div>'}).join('')||'<span class="mu">No custom pixels yet.</span>')+'</div>'};
A.p8pix=function(){var c=so('pixels');if(!vl('ce1'))return tst('Name required');(c.list=c.list||[]).push(vl('ce1'));log('Pixel added: '+vl('ce1'));sv();clean();route()};
SX.giftcards=function(){var g=so('gcset');return '<h2>Gift cards</h2><div class="xc">'+fl('Gift cards expire after (months, 0 = never)','gc1',g.exp||0,'number')+'<label class="xchk"><input type="checkbox" id="gc2" '+(g.apple?'checked':'')+'> Allow adding to mobile wallets</label><button class="btn pri" data-x="p8gc" style="margin-top:10px">Save</button></div>'};
A.p8gc=function(){var g=so('gcset');g.exp=+vl('gc1')||0;g.apple=vl('gc2');sv();clean();tst('Gift card settings saved')};
SX.packing=function(){var p=so('packing');return '<h2>Packing slip template</h2><div class="xc"><textarea class="xin" id="pk1" rows="10" style="font-family:monospace">'+h(p.tpl||'<h1>{{ shop.name }}</h1>\n<p>Order {{ order.name }}</p>\n{% for line in order.lines %}<p>{{ line.qty }} × {{ line.title }}</p>{% endfor %}\n<p>Thank you for shopping with us!</p>')+'</textarea><div style="display:flex;gap:8px;margin-top:10px"><button class="btn" data-x="p8pkprev">Preview</button><button class="btn pri" data-x="p8pk">Save</button></div></div>'};
A.p8pk=function(){so('packing').tpl=q('#pk1').value;sv();clean();tst('Template saved')};
A.p8pkprev=function(){var o=(S.orders||[])[0]||{};var t=q('#pk1').value.replace(/{{\s*shop.name\s*}}/g,h(S.name||'Store')).replace(/{{\s*order.name\s*}}/g,'#'+(o.id||'1001')).replace(/{%[^%]*%}[\s\S]*?{%\s*endfor\s*%}/g,'<p>1 × Item</p>');var w=window.open('','_blank');if(w){w.document.write(t);w.document.close()}};
SX.activity=function(){init();return '<h2>Store activity log</h2><div class="xc">'+(S.activity.length?S.activity.slice(-50).reverse().map(function(a){return '<div style="padding:6px 0;border-bottom:1px solid #eee">'+h(a.t)+' <span class="mu" style="float:right">'+new Date(a.at).toLocaleString()+' · '+h(a.by)+'</span></div>'}).join(''):'<span class="mu">No activity yet.</span>')+'</div>'};
function log(t){init();S.activity.push({t:t,at:Date.now(),by:S.viewAs||'Owner'});if(S.activity.length>300)S.activity.shift()}X.p8log=log;

/* ---------- 5. Index tables: search, filter, sort, bulk select, saved views, empty state ---------- */
var BULK={products:[['Set as active','active'],['Set as draft','draft'],['Archive products','archived']]};
function rowsOf(t){return qa('tr',t).filter(function(r){return r.cells.length&&r.cells[0].tagName==='TD'})}
function enhance(r){
 qa('#main table').forEach(function(t,ti){if(t.dataset.p8||t.closest('#xsf,.xmodal,#box,.xdet .xside')||t.closest('[id^=x]')&&t.closest('[id^=x]').id!=='main')return;t.dataset.p8=1;
  var rows=rowsOf(t);var hr=q('tr',t);if(!hr||!q('th',hr))return;
  if(!rows.length){var ttl=(q('#main h1')||{}).textContent||'items';var b=q('#main .xh .btn.pri');var w=document.createElement('div');w.innerHTML=empty('🗂️','No '+h(ttl.toLowerCase())+' yet','When you add '+h(ttl.toLowerCase())+', they will appear here.',b?'<button class="btn pri" id="p8eb">'+h(b.textContent)+'</button>':'');t.style.display='none';t.parentNode.insertBefore(w.firstChild,t);var eb=q('#p8eb');if(eb)eb.onclick=function(){b.click()};return}
  if(rows.length<2)return;
  var heads=qa('th',hr).map(function(x){return x.textContent.trim()});
  /* filter on a column with few distinct values */
  var fcol=-1,fvals=[];heads.forEach(function(nm,ci){if(fcol>-1||!nm)return;var s={};rows.forEach(function(rw){var c=rw.cells[ci];if(c)s[c.textContent.trim()]=1});var k=Object.keys(s);if(k.length>1&&k.length<=6&&k.length<rows.length&&ci>0){fcol=ci;fvals=k}});
  var bar=document.createElement('div');bar.className='p8bar';
  bar.innerHTML='<input class="p8q" placeholder="Search and filter" aria-label="Search">'+(fcol>-1?'<select class="p8f" aria-label="Filter"><option value="">'+h(heads[fcol]||'Filter')+': all</option>'+fvals.map(function(v){return '<option>'+h(v)+'</option>'}).join('')+'</select>':'')+'<select class="p8s" aria-label="Sort"><option value="">Sort</option>'+heads.map(function(nm,ci){return nm?'<option value="'+ci+':1">'+h(nm)+' ↑</option><option value="'+ci+':-1">'+h(nm)+' ↓</option>':''}).join('')+'</select><button class="btn p8sv" title="Save this search as a view">Save view</button>';
  var sb=document.createElement('div');sb.className='p8bulk';sb.style.display='none';
  t.parentNode.insertBefore(bar,t);t.parentNode.insertBefore(sb,t);
  /* saved views as tabs */
  var vk=r+'#'+ti,views=S.views[vk]||[];if(views.length){var tb=document.createElement('div');tb.className='p8tabs';tb.innerHTML='<a class="on" data-v="">All</a>'+views.map(function(v,i){return '<a data-v="'+i+'">'+h(v.n)+' <span data-vd="'+i+'" title="Delete view">×</span></a>'}).join('');bar.parentNode.insertBefore(tb,bar);tb.onclick=function(e){var d=e.target.dataset.vd;if(d!=null){views.splice(+d,1);sv();route();return}var a=e.target.closest('[data-v]');if(!a)return;qa('a',tb).forEach(function(x){x.classList.toggle('on',x===a)});var v=views[+a.dataset.v]||{q:'',f:''};q('.p8q',bar).value=v.q;if(q('.p8f',bar))q('.p8f',bar).value=v.f;apply()}}
  /* checkboxes */
  var c0=document.createElement('th');c0.innerHTML='<input type="checkbox" class="p8all" aria-label="Select all">';c0.style.width='28px';hr.insertBefore(c0,hr.firstChild);
  rows.forEach(function(rw){var c=document.createElement('td');c.innerHTML='<input type="checkbox" class="p8c" aria-label="Select row">';c.onclick=function(e){e.stopPropagation()};rw.insertBefore(c,rw.firstChild)});
  function sel(){return rows.filter(function(rw){return q('.p8c',rw).checked})}
  function upd(){var s=sel();sb.style.display=s.length?'flex':'none';sb.innerHTML='<b>'+s.length+' selected</b><button class="btn" data-b="csv">Export selected</button>'+((BULK[r]||[]).map(function(b){return '<button class="btn" data-b="'+b[1]+'">'+b[0]+'</button>'}).join(''))+'<button class="btn" data-b="clr">Clear</button>'}
  t.addEventListener('change',function(e){if(e.target.classList.contains('p8all')){rows.forEach(function(rw){if(rw.style.display!=='none')q('.p8c',rw).checked=e.target.checked})}upd()});
  sb.onclick=function(e){var b=e.target.dataset.b;if(!b)return;var s=sel();
   if(b==='clr'){qa('.p8c,.p8all',t).forEach(function(x){x.checked=false});return upd()}
   if(b==='csv'){var csv=[heads.join(',')].concat(s.map(function(rw){return [].slice.call(rw.cells,1).map(function(c){return '"'+c.textContent.trim().replace(/"/g,'""')+'"'}).join(',')})).join('\n');var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=r+'-selected.csv';a.click();return tst('Exported '+s.length+' rows')}
   if(r==='products'){var names=s.map(function(rw){return rw.cells[1].textContent.trim()});var n=0;(S.products||[]).forEach(function(p){if(names.some(function(x){return x.indexOf(p.name)===0})){p.status=b.charAt(0).toUpperCase()+b.slice(1);n++}});log('Bulk status '+b+' on '+n+' products');sv();tst(n+' products updated');route()}};
  function apply(){var qq=q('.p8q',bar).value.toLowerCase(),fv=q('.p8f',bar)?q('.p8f',bar).value:'';rows.forEach(function(rw){var ok=(!qq||rw.textContent.toLowerCase().indexOf(qq)>-1)&&(!fv||rw.cells[fcol+1].textContent.trim()===fv);rw.style.display=ok?'':'none'})}
  q('.p8q',bar).oninput=apply;if(q('.p8f',bar))q('.p8f',bar).onchange=apply;
  q('.p8s',bar).onchange=function(){var v=this.value;if(!v)return;var p=v.split(':'),ci=+p[0]+1,d=+p[1],tb=rows[0].parentNode;rows.slice().sort(function(a,b){var x=a.cells[ci].textContent.trim(),y=b.cells[ci].textContent.trim(),nx=parseFloat(x.replace(/[^0-9.-]/g,'')),ny=parseFloat(y.replace(/[^0-9.-]/g,''));return (isNaN(nx)||isNaN(ny)?x.localeCompare(y):nx-ny)*d}).forEach(function(rw){tb.appendChild(rw)})};
  q('.p8sv',bar).onclick=function(){var qq=q('.p8q',bar).value,fv=q('.p8f',bar)?q('.p8f',bar).value:'';if(!qq&&!fv)return tst('Type a search or pick a filter first');var n=prompt('Name this view',qq||fv);if(!n)return;(S.views[vk]=S.views[vk]||[]).push({n:n,q:qq,f:fv});sv();route()};
 });
}

/* ---------- 6. Contextual save bar ---------- */
var dirty=false;
function clean(){dirty=false;var b=q('#p8save');if(b)b.classList.remove('on')}X.p8clean=clean;
function bar(){var b=q('#p8save');if(!b){b=document.createElement('div');b.id='p8save';b.innerHTML='<span>⚠ Unsaved changes</span><div><button class="btn" id="p8dis">Discard</button><button class="btn pri" id="p8sav">Save</button></div>';document.body.appendChild(b);
 q('#p8dis').onclick=function(){clean();route()};
 q('#p8sav').onclick=function(){var s=qa('#main button').filter(function(x){return /^(save|save changes|update)\b/i.test(x.textContent.trim())&&x.offsetParent})[0];if(s)s.click();else{sv();tst('Saved')}clean()}}return b}
document.addEventListener('input',mark,true);document.addEventListener('change',mark,true);
function mark(e){var t=e.target;if(!t.closest||!t.closest('#main')||t.closest('.p8bar,.p8bulk,table,#xsf,[data-xc]')||t.matches('[data-xc],.p8c,.p8all'))return;if(!qa('#main button').some(function(x){return /^(save|save changes|update)\b/i.test(x.textContent.trim())}))return;dirty=true;bar().classList.add('on')}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#main button');if(b&&/^(save|save changes|update|cancel)\b/i.test(b.textContent.trim()))setTimeout(clean,50)},true);

/* ---------- 7. Breadcrumb back arrow ---------- */
function parentOf(r){if(/^order-/.test(r))return ['orders','Orders'];if(/^customer-/.test(r))return ['customers','Customers'];if(/^report-/.test(r))return ['analytics-reports','Reports'];if(/^online-store-page-/.test(r))return ['online-store-pages','Pages'];if(r==='online-store-pages')return ['content','Content'];if(r==='productform')return ['products','Products'];
 var p=null;(NC||[]).forEach(function(n){(n.sub||[]).forEach(function(s){if(s.id===r&&n.id!==r)p=[n.id,n.label]})});return p}
function crumb(r){var p=parentOf(r),h1=q('#main h1');if(!p||!h1||q('#p8bk'))return;var a=document.createElement('a');a.id='p8bk';a.href='#'+p[0];a.title='Back to '+p[1];a.setAttribute('aria-label','Back to '+p[1]);a.textContent='←';h1.parentNode.insertBefore(a,h1);h1.parentNode.classList.add('p8hasbk')}

/* ---------- 8. Global search (Ctrl/Cmd+K) + alerts ---------- */
function openSearch(){var o=q('#p8srch');if(o)o.remove();o=document.createElement('div');o.id='p8srch';o.innerHTML='<div class="p8sbox"><input id="p8si" placeholder="Search orders, products, customers, pages, settings" autocomplete="off"><div id="p8sr"></div></div>';document.body.appendChild(o);o.onclick=function(e){if(e.target===o)o.remove()};var i=q('#p8si');i.focus();i.oninput=function(){res(i.value)};res('')}
function res(s){s=s.toLowerCase().trim();var out=[];
 (NC||[]).forEach(function(n){if(n.id!=='--'){out.push(['Page',n.label,n.id]);(n.sub||[]).forEach(function(x){out.push(['Page',n.label+' › '+x.label,x.id])})}});
 qa('.stn a').length||SNEW.concat([['s-general','General'],['s-payments','Payments'],['s-shipping','Shipping and delivery'],['s-taxes','Taxes and duties'],['s-checkout','Checkout']]).forEach(function(x){out.push(['Setting','Settings › '+x[1],x[0]])});
 (S.orders||[]).forEach(function(o){out.push(['Order','#'+o.id+' '+(o.email||''),'order-'+o.id])});
 (S.products||[]).forEach(function(p){out.push(['Product',p.name,'products'])});
 (S.cust||[]).forEach(function(c){out.push(['Customer',X.CU?X.CU.name(c):c.email,'customer-'+c.id])});
 var m=out.filter(function(x){return !s||x[1].toLowerCase().indexOf(s)>-1}).slice(0,12);
 q('#p8sr').innerHTML=m.length?m.map(function(x){return '<a href="#'+x[2]+'"><small>'+x[0]+'</small>'+h(x[1])+'</a>'}).join(''):'<p class="mu" style="padding:12px">No results for “'+h(s)+'”</p>';qa('#p8sr a').forEach(function(a){a.onclick=function(){q('#p8srch').remove()}})}
document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape'){var o=q('#p8srch');if(o)o.remove()}});
X.p8search=openSearch;
function topTools(){if(q('#p8top'))return;var d=document.createElement('div');d.id='p8top';d.innerHTML='<button id="p8sbtn" title="Search (Ctrl+K)">🔍 Search <kbd>Ctrl K</kbd></button><button id="p8bell" title="Alerts">🔔<span id="p8bn"></span></button>';document.body.appendChild(d);q('#p8sbtn').onclick=openSearch;q('#p8bell').onclick=function(){init();var a=S.alerts;X.xmodal('Alerts','<div>'+(a.length?a.map(function(x){return '<a href="#'+x.r+'" class="p8al'+(x.read?'':' un')+'" data-al="'+x.id+'">'+h(x.t)+'</a>'}).join(''):'<p class="mu">You are all caught up.</p>')+'</div>','Mark all as read',function(){a.forEach(function(x){x.read=true});sv()});qa('[data-al]').forEach(function(l){l.onclick=function(){a.forEach(function(x){if(x.id===l.dataset.al)x.read=true});sv();var c=q('#xcancel');if(c)c.click()}})}}
function bell(){init();var n=S.alerts.filter(function(x){return !x.read}).length,b=q('#p8bn');if(b)b.textContent=n?n:''}

/* ---------- 9. route hook ---------- */
if(X.onRoute)X.onRoute(function(r){init();clean();var sv2=q('#p8srch');if(sv2)sv2.remove();
 if(document.body.classList.contains('st')){var stn=q('.stn');if(stn&&!q('[data-r="s-markets"]',stn)){var ref=q('[data-r="s-policies"]',stn);ref=ref?ref.nextSibling:null;SNEW.forEach(function(x){var a=document.createElement('a');a.dataset.r=x[0];a.href='#'+x[0];a.textContent=x[1];if(x[0]===r)a.className='on';stn.insertBefore(a,ref)})}}
 topTools();bell();try{enhance(r)}catch(e){console.error(e)}try{crumb(r)}catch(e){console.error(e)}
 qa('#nav [data-r]').forEach(function(a){if(a.dataset.r==='growth')a.textContent=a.textContent.replace('Growth','Marketing')});
});
var css=document.createElement('style');css.textContent=
'.xdet{display:grid;grid-template-columns:minmax(0,2fr) minmax(240px,1fr);gap:16px;align-items:start}.xdet .xside{display:flex;flex-direction:column;gap:16px}.xdet .xc{margin:0 0 16px}@media(max-width:900px){.xdet{grid-template-columns:1fr}}'+
'.xchk{display:flex!important;gap:8px;align-items:center;margin:6px 0;font-weight:400}'+
'.xempty{text-align:center;padding:48px 20px;background:#fff;border:1px solid #e3e3e3;border-radius:12px;color:#111}.xempty .xei{font-size:44px}.xempty h2{margin:10px 0 6px;font-size:18px}.xempty p{max-width:420px;margin:0 auto 14px;color:#111}'+
'.p8bar{display:flex!important;gap:8px;flex-wrap:nowrap!important;align-items:center;margin:0 0 10px}.p8bar .p8q{flex:1 1 auto!important;width:auto!important;min-width:0!important;margin:0!important;min-width:180px;padding:7px 10px;border:1px solid #c8c8c8;border-radius:8px;background:#fff;color:#111}.p8bar select,.p8bar .btn{width:auto!important;min-width:0!important;max-width:200px!important;margin:0!important;flex:0 0 auto;padding:7px;border:1px solid #c8c8c8;border-radius:8px;background:#fff;color:#111}'+
'.p8bulk{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 10px;margin:0 0 8px;background:#fff;border:1px solid #111;border-radius:10px;color:#111}'+
'.p8tabs{display:flex;gap:4px;margin:0 0 8px;flex-wrap:wrap}.p8tabs a{padding:5px 12px;border-radius:8px;cursor:pointer;color:#111;border:1px solid #ddd;background:#fff}.p8tabs a.on{background:#111;color:#fff}.p8tabs span{margin-left:4px;opacity:.7}'+
'#p8save{position:fixed;top:0;left:0;right:0;z-index:300;background:#111;color:#fff;display:none;justify-content:space-between;align-items:center;padding:10px 20px;box-shadow:0 2px 8px rgba(0,0,0,.3)}#p8save.on{display:flex}#p8save div{display:flex;gap:8px}#p8save .btn{background:#fff!important;color:#111!important}#p8save .btn.pri{background:#2E6B4F!important;color:#fff!important;border-color:#2E6B4F!important}'+
'#p8bk{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:1px solid #c8c8c8;border-radius:8px;color:#111!important;text-decoration:none;margin-right:10px;font-size:16px;background:#fff}.p8hasbk{display:flex;align-items:center}.p8hasbk h1{flex:1}'+
'#p8top{position:fixed;bottom:16px;right:64px;z-index:60;display:flex;gap:6px}#p8top button{background:#fff;color:#111;border:1px solid #c8c8c8;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px}#p8top kbd{font-size:10px;border:1px solid #ccc;border-radius:4px;padding:0 4px;margin-left:4px}#p8bn{background:#b42318;color:#fff;border-radius:9px;font-size:10px;padding:0 5px;margin-left:3px}#p8bn:empty{display:none}body.st #p8top{display:none}'+
'#p8srch{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:400;display:flex;justify-content:center;padding-top:80px}.p8sbox{background:#fff;width:min(640px,92vw);border-radius:12px;overflow:hidden;align-self:flex-start;box-shadow:0 10px 40px rgba(0,0,0,.3)}#p8si{width:100%;box-sizing:border-box;padding:14px 16px;border:0;border-bottom:1px solid #ddd;font-size:16px;color:#111;outline:none}#p8sr a{display:block;padding:9px 16px;color:#111;text-decoration:none;border-bottom:1px solid #f0f0f0}#p8sr a:hover{background:#EEF6F1}#p8sr small{display:inline-block;min-width:70px;font-size:11px;color:#2E6B4F;font-weight:600}'+
'.p8al{display:block;padding:9px 6px;border-bottom:1px solid #eee;color:#111;text-decoration:none}.p8al.un{font-weight:700}.p8al.un:before{content:"● ";color:#2E6B4F}';
document.head.appendChild(css);
try{init()}catch(e){}
})();
