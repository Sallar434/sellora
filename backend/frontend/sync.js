/* Sellora backend sync layer. Off by default, so the app behaves exactly like sellora.html (localStorage only).
   When a Backend URL is connected: login via /api/auth, products two-way via REST, full app state snapshot saved to
   store settings (PATCH /api/stores/:id), orders/customers pulled read-only. localStorage stays as offline cache. */
(function(){
var K='sellora_backend',C={};try{C=JSON.parse(localStorage.getItem(K))||{}}catch(e){}
function sv(){localStorage.setItem(K,JSON.stringify(C))}
function on(){return !!(C.url&&C.token&&C.storeId)}
function api(m,p,b,retry){return fetch(C.url.replace(/\/$/,'')+p,{method:m,headers:Object.assign({'Content-Type':'application/json'},C.token?{Authorization:'Bearer '+C.token}:{}),body:b?JSON.stringify(b):undefined}).then(function(r){
  if(r.status===401&&C.refresh&&!retry)return api('POST','/api/auth/refresh',{refreshToken:C.refresh},1).then(function(t){C.token=t.accessToken;C.refresh=t.refreshToken;sv();return api(m,p,b,1)});
  if(r.status===204)return null;return r.json().then(function(j){if(!r.ok)throw new Error(j.error||('HTTP '+r.status));return j})})}
var st={status:on()?'connecting':'off',last:'',err:''};
function msg(s,e){st.status=s;st.err=e||'';st.last=new Date().toLocaleTimeString();var el=document.getElementById('sbk-st');if(el)el.textContent=label()}
function label(){return st.status==='off'?'Not connected: data is stored in this browser only':st.status==='ok'?'Connected to '+C.url+' (store '+(C.handle||C.storeId)+'), last sync '+st.last:st.status==='err'?'Backend unreachable ('+st.err+'), working offline from local cache':'Syncing…'}
var toR=function(p){return{title:p.name||'Untitled',price:Math.round((+p.price||0)*100),description:p.desc||'',status:p.status==='Draft'||p.status==='draft'?'draft':'active',variants:[{title:'Default',inventory:+p.stock||0}]}};
var sig=function(p){return JSON.stringify([p.name,p.price,p.stock,p.status,p.desc])};
function pull(){if(!on())return Promise.resolve();msg('syncing');
  return Promise.all([api('GET','/api/stores/'+C.storeId),api('GET','/api/stores/'+C.storeId+'/products'),api('GET','/api/stores/'+C.storeId+'/orders').catch(function(){return[]}),api('GET','/api/stores/'+C.storeId+'/customers').catch(function(){return[]})]).then(function(a){
    var store=a[0],snap=(store.settings||{}).frontendState;
    if(snap&&snap._ts>(S._ts||0)){Object.keys(S).forEach(function(k){delete S[k]});Object.assign(S,snap)}
    S.products=S.products||[];var byR={};S.products.forEach(function(p){if(p._rid)byR[p._rid]=p});
    a[1].forEach(function(rp){var v=(rp.variants||[])[0]||{},lp=byR[rp.id],d={name:rp.title,price:rp.price/100,stock:(rp.variants||[]).reduce(function(s,x){return s+(x.inventory||0)},0),status:rp.status==='draft'?'Draft':'Active',desc:rp.description||''};
      if(lp)Object.assign(lp,d);else{d.id=S.nid=(S.nid||1000)+1;d._rid=rp.id;S.products.push(d);lp=d}lp._sig=sig(lp)});
    var live={};a[1].forEach(function(r){live[r.id]=1});S.products=S.products.filter(function(p){return !p._rid||live[p._rid]});
    S.backendOrders=a[2];S.backendCustomers=a[3];C.known=Object.keys(live);sv();
    if(window.DB&&window.U){DB.d[U]=S;origPersist()}msg('ok');try{route()}catch(e){}})
  .catch(function(e){msg('err',e.message)})}
var busy=0,again=0;
function push(){if(!on())return;if(busy){again=1;return}busy=1;S._ts=Date.now();var ps=[];
  (S.products||[]).forEach(function(p){if(!p._rid)ps.push(api('POST','/api/stores/'+C.storeId+'/products',toR(p)).then(function(r){p._rid=r.id;p._sig=sig(p)}));
    else if(p._sig!==sig(p)){var b=toR(p);delete b.variants;ps.push(api('PATCH','/api/stores/'+C.storeId+'/products/'+p._rid,b).then(function(){p._sig=sig(p)}))}});
  var now={};(S.products||[]).forEach(function(p){if(p._rid)now[p._rid]=1});
  (C.known||[]).forEach(function(id){if(!now[id])ps.push(api('DELETE','/api/stores/'+C.storeId+'/products/'+id).catch(function(){}))});
  Promise.all(ps).then(function(){C.known=(S.products||[]).filter(function(p){return p._rid}).map(function(p){return p._rid});sv();
    var snap=JSON.parse(JSON.stringify(S));delete snap.backendOrders;delete snap.backendCustomers;
    return api('PATCH','/api/stores/'+C.storeId,{settings:{frontendState:snap}})}).then(function(){msg('ok');origPersist()})
  .catch(function(e){msg('err',e.message)}).then(function(){busy=0;if(again){again=0;push()}})}
var origPersist=window.persist,tm;
window.persist=function(){origPersist();if(on()){clearTimeout(tm);tm=setTimeout(push,1200)}};
function connect(){var url=document.getElementById('sbk-url').value.trim(),em=document.getElementById('sbk-em').value.trim(),pw=document.getElementById('sbk-pw').value;
  if(!/^https?:\/\//.test(url)){toast('Enter a backend URL like http://localhost:4000');return}C={url:url};msg('syncing');
  api('POST','/api/auth/login',{email:em,password:pw}).then(function(r){C.token=r.accessToken;C.refresh=r.refreshToken;return api('GET','/api/stores')}).then(function(ss){
    if(!ss.length)throw new Error('This account has no store');C.storeId=ss[0].id;C.handle=ss[0].handle;sv();return pull()}).then(function(){if(st.status==='ok'){toast('Connected to backend');push()}})
  .catch(function(e){C={};sv();msg('err',e.message);toast('Connect failed: '+e.message)})}
function disconnect(){if(C.refresh)api('POST','/api/auth/logout',{refreshToken:C.refresh}).catch(function(){});C={};sv();msg('off');toast('Disconnected. Using browser storage only');try{route()}catch(e){}}
var h=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function card(){return '<div class="xc" id="sbk"><h3>Sellora backend (REST API)</h3><p class="mu">Leave empty to keep everything in this browser. Connect to a running Sellora API to load and save your store on the server.</p>'
 +(on()?'<p id="sbk-st">'+h(label())+'</p><p class="xk">Server orders: '+((S.backendOrders||[]).length)+' · customers: '+((S.backendCustomers||[]).length)+'</p><button class="btn" id="sbk-sync">Sync now</button> <button class="btn" id="sbk-off">Disconnect</button>'
 :'<div class="xg"><div><label>Backend URL</label><input id="sbk-url" placeholder="http://localhost:4000" value="'+h(C.url||'')+'"></div><div><label>Email</label><input id="sbk-em" autocomplete="username"></div><div><label>Password</label><input id="sbk-pw" type="password" autocomplete="current-password"></div></div><p id="sbk-st" class="xk">'+h(label())+'</p><button class="btn pri" id="sbk-go" style="margin-top:8px">Connect</button>')+'</div>'}
var V0=V.integrations;V.integrations=function(){return V0.apply(this,arguments).replace('<div class="xc">',card()+'<div class="xc">')};
document.addEventListener('click',function(e){var t=e.target&&e.target.id;if(t==='sbk-go')connect();else if(t==='sbk-off')disconnect();else if(t==='sbk-sync')pull().then(push)});
window.SelloraBackend={pull:pull,push:push,on:on,api:function(m,p,b){return api(m,p,b)},status:function(){return st},cfg:function(){return{url:C.url,storeId:C.storeId}}};
if(on())pull();
})();
