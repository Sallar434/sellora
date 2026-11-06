/* ===== Sellora v36: plan picker at signup, 4-day trial, publish gating, closed store on expiry, Shopify-style product CSV ===== */
(function(){
var X=window,A=X.ACT=X.ACT||{};
function q(s){return document.querySelector(s)}function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function sv(){try{save()}catch(e){}}function tst(m){try{toast(m)}catch(e){}}
var DAY=864e5,TRIAL=4;
var PL=[{c:'basic',n:'Basic',t:'For new sellers',pkr:300,f:['500 products','150 orders / month','1 staff account','Sellora Pay checkout']},
 {c:'grow',n:'Grow',t:'For growing shops',pkr:600,f:['2,000 products','400 orders / month','3 staff accounts','Abandoned-cart WhatsApp'],pop:1},
 {c:'advanced',n:'Advanced',t:'Everything a small/medium seller needs',pkr:1000,f:['Unlimited products','1,000 orders / month','10 staff accounts','Advanced reports']},
 {c:'enterprise',n:'Enterprise',t:'Custom contract',pkr:4999,f:['Custom limits','Dedicated support','Custom contract'],custom:1}];
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function pr(p,iv){return iv==='annual'?p.pkr*12*0.8:p.pkr}
/* ---- subscription state ---- */
function sub(){var s=S&&S.sub9;if(!s)return null;if(s.status==='trialing'){if(s.start&&s.trialEnds>s.start+TRIAL*DAY)s.trialEnds=s.start+TRIAL*DAY;if(s.trialEnds<=Date.now())s.status='expired'}return s}
function paid(){var s=sub();return !s||s.status==='active'}
function dead(){var s=sub();return !!s&&s.status==='expired'}
function left(){var s=sub();return s&&s.trialEnds?Math.max(0,Math.ceil((s.trialEnds-Date.now())/DAY)):0}
X.m13={sub:sub,paid:paid,dead:dead,left:left};
function BK(){var b=X.SelloraBackend;return b&&b.on&&b.on()?b:null}
function api(m,p,b){var k=BK();if(!k)return Promise.resolve(null);return k.api(m,'/api/stores/'+k.cfg().storeId+p,b).catch(function(e){return null})}
/* ---- plan picker (new users, before the signup form) ---- */
var IV='monthly';
function picker(){return '<div class="acard m13pick"><div class="brand" style="color:#111">'+((q('.brand')||{}).innerHTML||'Sellora')+'</div><h2>Choose your plan</h2>'
 +'<p class="m13sub">Every plan starts with a <b>4-day free trial</b>. Build your whole store for free — buy the plan when you are ready to publish.</p>'
 +'<div class="m13row"><span class="m13cur">Currency: <b>Pakistani Rupee (PKR)</b></span><div class="seg m13iv" role="group" aria-label="Billing period"><button type="button" class="'+(IV==='monthly'?'on':'')+'" data-iv="monthly">Monthly</button><button type="button" class="'+(IV==='annual'?'on':'')+'" data-iv="annual">Annual · save 20%</button></div></div>'
 +'<div class="m13cards">'+PL.map(function(p){return '<div class="m13card'+(p.pop?' pop':'')+'">'+(p.pop?'<span class="m13badge">Most popular</span>':'')+'<h3>'+p.n+'</h3><div class="m13t">'+h(p.t)+'</div><div class="m13pr">'+(p.custom?'from ':'')+rs(pr(p,p.custom?'monthly':IV))+'<small>/'+(IV==='annual'&&!p.custom?'year':'month')+'</small></div>'+(IV==='annual'&&!p.custom?'<div class="m13t">'+rs(p.pkr*0.8)+' a month, billed yearly</div>':'<div class="m13t">&nbsp;</div>')+'<ul>'+p.f.map(function(f){return '<li>'+h(f)+'</li>'}).join('')+'</ul>'+(p.custom?'<a class="btn" href="mailto:sales@sellora.app">Contact sales</a>':'<button type="button" class="btn pri" data-m13p="'+p.c+'">Start 4-day free trial</button>')+'</div>'}).join('')+'</div>'
 +'<p class="m13sub" style="margin-top:14px">No payment needed for the trial. Already have an account? <a href="#" id="m13in">Sign in</a></p></div>'}
if(X.authView){var AV=X.authView;X.authView=authView=function(m){if(m==='in'||m==='gate'||m==='up'||m==='store')return AV.apply(this,arguments);var a=q('#auth');if(!a)return;a.style.display='flex';a.innerHTML=picker();
 qa('[data-iv]').forEach(function(b){b.onclick=function(){IV=b.dataset.iv;X.authView('plan')}});
 qa('[data-m13p]').forEach(function(b){b.onclick=function(){X._obPlan={plan:b.dataset.m13p,iv:IV};if(X.afterPlanPick){X.afterPlanPick();return}AV('up')}});
 var li=q('#m13in');if(li)li.onclick=function(e){e.preventDefault();X.authView('in')}}}
if(typeof fresh==='function'){var FR=fresh;fresh=function(n,e){FR.apply(this,arguments);var ob=X._obPlan||{plan:'grow',iv:'monthly'},t=Date.now();S.sub9={plan:ob.plan,status:'trialing',trialEnds:t+TRIAL*DAY,interval:ob.iv,cur:'PKR',mode:'stop',cap:'',pay:'wallet',pending:null,start:t,end:t+TRIAL*DAY};S.use9={};S.inv9=[];S.online={password:true,live:false};var P=PL.filter(function(x){return x.c===ob.plan})[0];if(P)S.plan=P.n;X._obPlan=null;setTimeout(function(){api('POST','/billing/trial',{plan:ob.plan,interval:ob.iv})},400)}}
/* ---- closed store: only the plan page ---- */
var OK_DEAD=/^(s-plan|finance-billing)$/;
if(typeof route==='function'){var R0=route;route=function(){if(typeof U!=='undefined'&&U&&S&&dead()){var r=location.hash.slice(1);if(!OK_DEAD.test(r)){history.replaceState(null,'','#s-plan')}}document.body.classList.toggle('m13dead',!!(typeof U!=='undefined'&&U&&S&&dead()));return R0.apply(this,arguments)}}
function signout(){document.body.classList.remove('m13dead');if(typeof endSession==='function'){endSession();return}try{save()}catch(e){}U=null;try{DB.s=null;DB.session=null;DB.out=1;persist()}catch(e){}location.hash='';if(X.authView)X.authView('gate')}
A.m13out=signout;
/* storefront offline when closed */
if(typeof sf==='function'){var SF0=sf;sf=function(){if(dead())return '<div class="sf m13off"><div><h1>Store unavailable</h1><p>This store is currently closed. Please check back later.</p></div></div>';return SF0.apply(this,arguments)}}
/* ---- banners ---- */
X.onRoute&&X.onRoute(function(r){var m=q('#main');if(!m||!S||!S.sub9)return;var o=q('#m13ban');if(o)o.remove();var s=sub(),d=document.createElement('div');d.id='m13ban';
 var nm=(PL.filter(function(x){return x.c===s.plan})[0]||{n:'Grow'}).n;
 if(s.status==='trialing'){var n=left();d.className='m13ban';d.innerHTML='<span><b>Free trial · '+n+' day'+(n===1?'':'s')+' left</b> on '+h(nm)+'. Build everything you like — buy a plan to publish your store.</span><button class="btn pri" data-x="m13buy">Buy plan</button>'}
 else if(s.status==='expired'){d.className='m13ban m13ded';d.innerHTML='<span><b>Your 4-day trial has ended and your store is closed.</b> The storefront shows “Store unavailable” and the admin is locked. Buy any plan below to reopen it — all your products, orders and settings are kept.</span><button class="btn" data-x="m13out">Sign out</button>'}
 if(d.className)m.insertBefore(d,m.firstChild);
 if(r==='themes'&&!q('#m13live')){var c=document.createElement('div');c.className='xc m13live';c.id='m13live';var live=S.online&&S.online.live;c.innerHTML='<h3>Online store status</h3><p>'+(live?'<span class="pill ok">Live</span> Your store is published and open to everyone.':'<span class="pill" style="background:#F2C14E;color:#111">Password page on</span> Visitors see a password page until you go live.')+'</p>'+(live?'':'<button class="btn pri" data-x="m13golive">Remove password &amp; go live</button>');var at=m.querySelector('h1,h2');(at&&at.parentNode===m?m:at?at.parentNode:m).insertBefore(c,at?at.nextSibling:null)}});
/* ---- publish gating ---- */
function gate(what){X.xmodal('Buy a plan to publish','<p>'+h(what)+' needs a paid plan. During your free trial you can build and test everything, but the store stays private behind its password page.</p><p class="mu">'+(sub().status==='trialing'?left()+' day'+(left()===1?'':'s')+' left in your trial.':'')+'</p>','Buy plan',function(){setTimeout(A.m13buy,50)})}
X.m13gate=gate;
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.m9pub,[data-tl],[data-x="m13golive"],[data-x^="p11pub"],[data-x^="tpub"]');if(!b||paid())return;e.preventDefault();e.stopImmediatePropagation();gate(b.matches('[data-tl]')?'Publishing a theme':'Going live')},true);
A.m13golive=function(){if(!paid())return gate('Going live');S.online=S.online||{};S.online.live=true;S.online.password=false;sv();api('POST','/online-store/publish');tst('Your store is live');route()};
A.m13buy=function(){var s=sub();if(!s)return;S.pv9int=s.interval;S.pv9cur='PKR';A.p10pick(s.plan==='starter'?'grow':s.plan)};
/* ---- products CSV (Shopify columns) ---- */
var COLS=['Handle','Title','Body (HTML)','Vendor','Type','Tags','Published','Option1 Name','Option1 Value','Option2 Name','Option2 Value','Option3 Name','Option3 Value','Variant SKU','Variant Price','Variant Compare At Price','Variant Inventory Qty','Image Src','SEO Title','SEO Description','Status'];
function esc(v){v=String(v==null?'':v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function toCsv(rows){return rows.map(function(r){return r.map(esc).join(',')}).join('\r\n')}
function parse(t){t=String(t).replace(/^\uFEFF/,'');var out=[],row=[],f='',Q=false;for(var i=0;i<t.length;i++){var c=t[i];if(Q){if(c==='"'&&t[i+1]==='"'){f+='"';i++}else if(c==='"')Q=false;else f+=c}else if(c==='"')Q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);out.push(row);row=[];f=''}else f+=c}if(f||row.length){row.push(f);out.push(row)}return out}
function slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function rowsFor(ps){var R=[COLS];ps.forEach(function(p){var vs=p.vars&&p.vars.length?p.vars:[null];vs.forEach(function(v,k){var f=k===0,vals=v?String(v.n).split(' / '):[];var on=function(i){return vals[i]?((p.opts||[])[i]||{}).name||('Option'+(i+1)):''};
 R.push([p.handle||slug(p.name),f?p.name:'',f?p.desc||'':'',f?p.vendor||'':'',f?p.type||'':'',f?(p.tags||[]).join(', '):'',f?String(p.status==='Active'):'',v?on(0):f?'Title':'',v?vals[0]||'':f?'Default Title':'',v?on(1):'',v?vals[1]||'':'',v?on(2):'',v?vals[2]||'':'',v?v.sku||'':p.sku||'',(+(v?v.price:p.price)||0).toFixed(2),f&&p.cmp?(+p.cmp).toFixed(2):'',v?v.qty||0:p.stock||0,(p.imgs||[])[k]||'',f?(p.seo||{}).t||'':'',f?(p.seo||{}).d||'':'',f?String(p.status||'Active').toLowerCase():''])})});return R}
X.exportProducts=function(ps){return toCsv(rowsFor(ps||S.products))};
X.m13csv={cols:COLS,parse:parse,rows:rowsFor};
function dl(name,text){var b=new Blob([text],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function visIds(){return qa('#main tr.row[data-p]').filter(function(r){return r.offsetParent!==null}).map(function(r){return +r.dataset.p})}
function selIds(){return qa('#main tr.row[data-p] input.p8c:checked').map(function(i){return +i.closest('tr').dataset.p})}
function srch(){var t=((q('#main .p8q')||{}).value||'').trim().toLowerCase();return S.products.filter(function(p){return !t||[p.name,p.handle,p.sku,(p.tags||[]).join(' '),p.vendor,p.type].join(' ').toLowerCase().indexOf(t)>-1})}
A.pexport=function(){var ns=selIds().length,qv=((q('#main .p8q')||{}).value||'').trim();
 X.xmodal('Export products','<fieldset class="m13fs"><legend>Export</legend><label><input type="radio" name="m13sc" value="page" checked> Current page ('+visIds().length+')</label><label><input type="radio" name="m13sc" value="all"> All products ('+S.products.length+')</label><label><input type="radio" name="m13sc" value="sel"'+(ns?'':' disabled')+'> Selected ('+ns+')</label><label><input type="radio" name="m13sc" value="q"'+(qv?'':' disabled')+'> Search results'+(qv?' for “'+h(qv)+'” ('+srch().length+')':'')+'</label></fieldset><fieldset class="m13fs"><legend>Export as</legend><label><input type="radio" name="m13fm" value="excel" checked> CSV for Excel, Numbers or other spreadsheet programs</label><label><input type="radio" name="m13fm" value="plain"> Plain CSV file</label></fieldset>','Export products',function(){
  var sc=(q('[name=m13sc]:checked')||{}).value,fm=(q('[name=m13fm]:checked')||{}).value,ids=sc==='page'?visIds():sc==='sel'?selIds():null;var ps=sc==='all'?S.products:sc==='q'?srch():S.products.filter(function(p){return ids.indexOf(p.id)>-1});
  var t=X.exportProducts(ps);dl('products_export.csv',(fm==='excel'?'\uFEFF':'')+t);X._m13last={scope:sc,format:fm,count:ps.length,text:t};tst('Exported '+ps.length+' product'+(ps.length===1?'':'s'))})};
var SAMPLE=toCsv([COLS,['classic-tee','Classic Tee','<p>Soft cotton tee</p>','Sellora','Shirts','cotton, summer','true','Size','S','Color','Black','','','TEE-S-BLK','1499.00','1999.00','25','https://example.com/tee.jpg','Classic Tee','Soft cotton tee','active'],['classic-tee','','','','','','','Size','M','Color','Black','','','TEE-M-BLK','1499.00','','30','','','','']]);
X.m13read=function(text){var all=parse(text),hd=(all.shift()||[]).map(function(x){return x.trim().toLowerCase()}),errs=[],items={},order=[],last='',n=0;
 var ix=function(){for(var i=0;i<arguments.length;i++){var k=hd.indexOf(arguments[i]);if(k>-1)return k}return -1};
 if(ix('handle','title')<0)return{rows:0,items:[],errors:[{row:1,message:'The file needs a Handle or Title column. Download the sample template to see the format.'}]};
 all.forEach(function(r,i){if(!r.some(function(c){return c.trim()}))return;n++;var line=i+2,g=function(){var k=ix.apply(null,arguments);return k>-1?(r[k]||'').trim():''};
  var hh=slug(g('handle')||g('title')||last);if(!hh){errs.push({row:line,message:'Missing Handle and Title'});return}last=hh;var it=items[hh],isNew=!it;
  if(!it){it=items[hh]={handle:hh,name:'',desc:'',tags:[],imgs:[],vars:[],opts:[],seo:{}};order.push(hh)}
  var bad=false,num=function(v,lb){if(!v)return null;var x=Number(v.replace(/,/g,''));if(!isFinite(x)||x<0){errs.push({row:line,message:lb+' “'+v+'” is not a valid number'});bad=true;return null}return x};
  if(g('title'))it.name=g('title');if(g('body (html)','body','description'))it.desc=g('body (html)','body','description');if(g('vendor'))it.vendor=g('vendor');if(g('type'))it.type=g('type');
  if(g('tags'))it.tags=g('tags').split(/[,;]/).map(function(x){return x.trim()}).filter(Boolean);var st=g('status').toLowerCase(),pb=g('published').toLowerCase();
  if(st){if(['active','draft','archived'].indexOf(st)<0){errs.push({row:line,message:'Status “'+g('status')+'” must be active, draft or archived'});bad=true}else it.status=st[0].toUpperCase()+st.slice(1)}else if(pb&&!it.status)it.status=pb==='true'?'Active':'Draft';
  if(g('image src'))it.imgs.push(g('image src'));if(g('seo title'))it.seo.t=g('seo title');if(g('seo description'))it.seo.d=g('seo description');
  var vp=num(g('variant price','price'),'Variant Price'),cm=num(g('variant compare at price','compare at price','compare at'),'Compare At Price'),qt=num(g('variant inventory qty','inventory qty','variant qty','stock'),'Inventory Qty');
  if(isNew&&!g('title')&&!g('handle')){errs.push({row:line,message:'Missing Title'});bad=true}
  if(bad){it._bad=1;return}
  if(cm!=null)it.cmp=cm;if(it.price==null&&vp!=null)it.price=vp;
  [1,2,3].forEach(function(k){var nm=g('option'+k+' name');if(nm&&!it.opts[k-1])it.opts[k-1]={name:nm,vals:''}});
  var vals=[1,2,3].map(function(k){return g('option'+k+' value')}).filter(Boolean);if(vals.length===1&&vals[0]==='Default Title')vals=[];
  if(vals.length){vals.forEach(function(v,k){var o=it.opts[k]||(it.opts[k]={name:'Option'+(k+1),vals:''});if(String(o.vals).split(',').map(function(s){return s.trim()}).indexOf(v)<0)o.vals=(o.vals?o.vals+', ':'')+v});it.vars.push({n:vals.join(' / '),price:vp!=null?vp:it.price||0,qty:qt||0,sku:g('variant sku','sku')})}
  else{it.stock=qt||0;it.sku=g('variant sku','sku')}});
 var list=order.map(function(k){return items[k]});list.forEach(function(it){it.opts=it.opts.filter(Boolean);if(!it.name)it.name=it.handle});return{rows:n,items:list,errors:errs}};
function apply(res,over){var add=0,up=0,skip=0,bad=0;res.items.forEach(function(it){if(it._bad){bad++;return}var p=S.products.filter(function(x){return x.handle===it.handle})[0];if(p&&!over){skip++;return}
 var d={name:it.name,handle:it.handle,desc:it.desc,status:it.status||'Active',price:it.price||0,cmp:it.cmp,tags:it.tags,imgs:it.imgs,vars:it.vars,opts:it.opts,seo:it.seo,vendor:it.vendor,type:it.type,sku:it.sku||(it.vars[0]||{}).sku||''};
 d.stock=it.vars.length?it.vars.reduce(function(a,v){return a+(+v.qty||0)},0):it.stock||0;
 if(p){Object.keys(d).forEach(function(k){if(d[k]!==undefined)p[k]=d[k]});up++}else{d.id=S.nid++;d.cols=[];S.products.push(d);add++}});sv();return{added:add,updated:up,skipped:skip,bad:bad}}
X.m13apply=apply;
A.pimport=function(){var cur=null;
 X.xmodal('Import products by CSV','<div class="m13drop" id="m13drop" tabindex="0"><b>Drag and drop a CSV file here</b><span>or</span><label class="btn" for="m13file">Choose file</label><input type="file" id="m13file" accept=".csv,text/csv" class="m13hid"></div><p class="mu"><a href="#" id="m13tpl">Download a sample CSV template</a> to see the columns (Shopify format works too).</p><label class="m13chk"><input type="checkbox" id="m13over" checked> Overwrite products with the same handle (existing values are replaced)</label><div id="m13prev"></div>','Import products',function(){if(!cur){tst('Choose a CSV file first');return false}var r=apply(cur,q('#m13over')?q('#m13over').checked:true);X._m13res=r;
  var k=BK();if(k&&X._m13text)api('POST','/products/import?overwrite='+(X._m13over!==false),X._m13text);
  tst('Imported '+r.added+' new, updated '+r.updated+(r.skipped?', skipped '+r.skipped:'')+(r.bad?', '+r.bad+' bad row'+(r.bad>1?'s':'')+' left out':''));route()});
 var go=q('#mdl .pri, #ov .pri');function prev(text){cur=X.m13read(text);X._m13text=text;var e=cur.errors,ok=cur.items.filter(function(i){return !i._bad});
  q('#m13prev').innerHTML='<div class="m13pv"><p><b>'+cur.rows+' row'+(cur.rows===1?'':'s')+'</b> · '+ok.length+' product'+(ok.length===1?'':'s')+' ready'+(e.length?' · <span class="m13err">'+e.length+' error'+(e.length>1?'s':'')+'</span>':' · no errors')+'</p>'+(e.length?'<ul class="m13errs">'+e.slice(0,20).map(function(x){return '<li>Row '+x.row+': '+h(x.message)+'</li>'}).join('')+'</ul><p class="mu">Rows with errors are skipped. Fix them and import again if needed.</p>':'')
  +'<table class="xt"><tr><th>Handle</th><th>Title</th><th>Variants</th><th>Price</th><th>Action</th></tr>'+cur.items.slice(0,8).map(function(i){var ex=S.products.some(function(p){return p.handle===i.handle});return '<tr><td>'+h(i.handle)+'</td><td>'+h(i.name)+'</td><td>'+(i.vars.length||1)+'</td><td>'+(i.price!=null?rs(i.price):'')+'</td><td>'+(i._bad?'<span class="m13err">Skipped (error)</span>':ex?'Update':'Create')+'</td></tr>'}).join('')+'</table></div>'}
 X.m13prev=prev;
 function rd(f){if(!f)return;var r=new FileReader();r.onload=function(){prev(r.result)};r.readAsText(f)}
 q('#m13file').onchange=function(){rd(this.files[0])};var dz=q('#m13drop');
 ['dragenter','dragover'].forEach(function(t){dz.addEventListener(t,function(e){e.preventDefault();dz.classList.add('on')})});dz.addEventListener('dragleave',function(){dz.classList.remove('on')});dz.addEventListener('drop',function(e){e.preventDefault();dz.classList.remove('on');rd(e.dataTransfer.files[0])});
 q('#m13over').onchange=function(){X._m13over=this.checked};
 q('#m13tpl').onclick=function(e){e.preventDefault();dl('product_template.csv','\uFEFF'+SAMPLE);X._m13tpl=SAMPLE}};
})();
