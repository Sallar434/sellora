/* Beginner setup, locale, import guard, health, and order insights. */
(function(){
var X=window,P=X.SelloraPlatform;
if(!P)return;
function esc(s){return P.escapeHtml(s)}
function persist(){try{save()}catch(e){}}
function locale(){return (S&&S.locale)||'en'}
function t(key){return P.resolveText(locale(),key)}
function applyLocale(){
  var parsed=P.parseLocale(locale());
  var lang=parsed.ok?parsed.language:'en';
  document.documentElement.lang=parsed.ok?parsed.canonical:'en';
  document.documentElement.dir=P.directionFor(lang);
  if(S&&S.plus&&S.plus.cfg&&(lang==='en'||lang==='ur'||lang==='ar'))S.plus.cfg.lang=lang;
}
function stepButton(step){
  if(step.id==='addProduct')return '<button class="btn pri" type="button" data-m17go="products">'+esc(t('next.addProductBtn').text)+'</button>';
  if(step.id==='finishListing')return '<button class="btn pri" type="button" data-m17go="products">'+esc(t('next.finishBtn').text)+'</button>';
  if(step.id==='launch')return '<button class="btn pri" type="button" data-m17go="setup">'+esc(t('next.launchBtn').text)+'</button>';
  if(step.id==='payment')return '<button class="btn" type="button" data-m17go="setup">'+esc(t('next.paymentBtn').text)+'</button>';
  return '';
}
function nextPanel(){
  var step=P.nextStep(S||{});
  var phrase=t('next.'+step.id);
  var note=phrase.status==='fallback'?'<p class="mu">'+esc(t('locale.fallback').text)+'</p>':'';
  return '<section id="m17next" class="panel" style="margin:0 0 16px"><h2 id="m17step" data-step="'+esc(step.id)+'" data-status="'+esc(phrase.status)+'" style="font-size:18px;margin:0 0 8px">'+esc(phrase.text)+'</h2>'+note+stepButton(step)+'</section>';
}
function honestHome(html){
  var rep=P.salesInsights((S&&S.orders)||[],{timeZone:(S&&S.tz)||'UTC',sourceNote:'This browser store. It is not the server database.'});
  var bits=Object.keys(rep.currencies).map(function(c){return c+': '+rep.currencies[c].count+' · '+P.formatMoney(rep.currencies[c].total,c,locale()).text}).join(' · ')||'No stored orders in this browser.';
  var metrics='<div class="metrics" id="m17metrics"><div class="metric"><small>Stored orders</small><b>'+rep.count+'</b></div><div class="metric"><small>By currency</small><b style="font-size:14px;font-weight:600">'+esc(bits)+'</b></div></div><p class="mu" id="m17src">Orders saved in this browser. They are not the server database, and different currencies are not added together.</p>';
  var i=html.indexOf('<div class="metrics">');
  if(i>=0){var depth=0,j=i;for(;j<html.length;j++){if(html.slice(j,j+4)==='<div')depth++;else if(html.slice(j,j+6)==='</div>'){depth--;if(depth===0){j+=6;break}}}html=html.slice(0,i)+metrics+html.slice(j)}
  else html=metrics+html;
  html=html.replace('Connect local and international gateways and turn on Sellora Pay.','Card checkout is not connected. This page does not start a live charge.');
  html=html.replace('Search a name, connect it and get free SSL.','You can look up a name. Buying a domain is not included.');
  html=html.replace('Let AI write the description for you.','Add a name, price, and photo. A provider is not called from this page.');
  return nextPanel()+html;
}
if(typeof V!=='undefined'&&V.home&&!V.home._m17){var h0=V.home;var h1=function(){return honestHome(h0())};h1._m17=1;V.home=h1}
V.setup=function(){
  var step=P.nextStep(S||{});
  var langs=P.LOCALES.map(function(l){return '<option value="'+esc(l.id)+'"'+(l.id===locale()?' selected':'')+'>'+esc(l.native+' · '+l.name)+(l.coverage==='verified'?'':' · English words')+'</option>'}).join('');
  var ready=P.readiness().map(function(r){return '<li><b>'+esc(r.id)+'</b> — '+esc(r.state)+'. '+esc(r.note)+(r.env.length?' Needs '+esc(r.env.join(', '))+'.':'')+'</li>'}).join('');
  var sizes=(S.sizes||[]).map(function(r,i){return '<li>'+esc(r.region)+' '+esc(r.label)+': '+esc(r.value)+' <button type="button" class="btn" data-m17sz="'+i+'">Remove</button></li>'}).join('')||'<li>No size labels yet.</li>';
  var health=(S._health17&&S._health17.findings||[]).map(function(f){return '<li data-kind="'+esc(f.verified)+'">'+esc(f.detail)+'</li>'}).join('')||'<li>Not checked yet.</li>';
  var paid=S.sub9&&S.sub9.status==='active';
  var cur=S.cur||'USD',pay=S.checkoutCur||cur;
  var money=P.formatMoney(0,cur,locale()).text;
  var conv=P.convertMoney(10,cur,pay,S.fxRate||null);
  return '<div class="xw" id="m17setup"><h1>Setup</h1>'+nextPanel()
    +'<div class="panel"><h2>Launch checks</h2><ul><li>'+(paid?'A paid plan is active. Use the Plans page to publish.':esc(t('publish.blocked').text))+'</li><li>'+esc(t('next.payment').text)+'</li></ul><p class="mu">Shown amount format: '+esc(money)+'. Checkout currency is '+esc(pay)+' and display currency is '+esc(cur)+'.</p><p class="mu">'+(conv.ok&&conv.converted?'Converted with '+esc(conv.source)+' as of '+esc(conv.asOf)+'.':esc(conv.error||'No conversion was applied.'))+'</p></div>'
    +'<details class="panel"><summary>Language</summary><label for="m17lang">Language for this browser</label><select id="m17lang">'+langs+'</select><p class="mu">Verified languages have these setup phrases translated. The others stay in English and say so. This is not every language, and voice is only offered for the verified list.</p><button class="btn pri" type="button" id="m17save">Save language</button></details>'
    +'<details class="panel"><summary id="m17healthsum">'+esc(t('health.title').text)+'</summary><button class="btn" type="button" id="m17health">Check this store</button><ul id="m17findings">'+health+'</ul><p class="mu">External sites are not opened. A phone layout is called a possible issue until a browser measures it.</p></details>'
    +'<details class="panel"><summary>Regions, sizes, and providers</summary><p class="mu">'+esc(t('import.approve').text)+'</p><ul>'+ready+'</ul><h3>Size labels</h3><p class="mu">'+esc(P.sizeChart(S.sizes||[]).note)+'</p><form id="m17size"><label>Region <input id="m17sr" required></label> <label>Label <input id="m17sl" required></label> <label>Value <input id="m17sv" required></label> <button class="btn" type="submit">Add label</button></form><ul>'+sizes+'</ul></details></div>';
};
function saveLocale(id){
  var parsed=P.parseLocale(id);
  if(!parsed.ok){try{toast(parsed.error)}catch(e){}return}
  S.locale=parsed.language;
  S.tz=S.tz||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  persist();applyLocale();
  try{toast('Language saved')}catch(e){}
  if(typeof route==='function')route();
}
document.addEventListener('click',function(e){
  var tEl=e.target&&e.target.closest?e.target:null;if(!tEl)return;
  var go=tEl.closest('[data-m17go]');
  if(go){e.preventDefault();location.hash=go.getAttribute('data-m17go');return}
  if(tEl.id==='m17save'){var sel=document.getElementById('m17lang');if(sel)saveLocale(sel.value);return}
  if(tEl.id==='m17health'){S._health17=P.healthCheck(S,S._mobile17||null);persist();if(typeof route==='function')route();return}
  var rm=tEl.closest('[data-m17sz]');
  if(rm){S.sizes.splice(+rm.getAttribute('data-m17sz'),1);persist();if(typeof route==='function')route();return}
  if(tEl.closest&&tEl.closest('#addo')){
    e.preventDefault();e.stopImmediatePropagation();
    var p=(S.products||[])[0];
    if(!p){try{toast('Add a product before saving a sample order.')}catch(err){}return}
    S.orders=S.orders||[];S.oid=S.oid||1000;
    S.orders.push({id:S.oid++,who:'Sample',total:p.price,st:'Paid',pay:'Paid',ful:'Unfulfilled',gw:'Sample',demo:true,cur:S.cur||'USD',at:Date.now()});
    persist();try{toast('Sample order saved. It is not counted as a sale.')}catch(err){}
    if(typeof route==='function')route();
  }
  var gw=tEl.closest('[data-g]');
  if(gw){e.preventDefault();e.stopImmediatePropagation();try{toast('This switch does not connect a processor. Nothing was charged.')}catch(err){}}
},true);
document.addEventListener('submit',function(e){
  if(!e.target||e.target.id!=='m17size')return;
  e.preventDefault();
  S.sizes=S.sizes||[];
  S.sizes.push({region:document.getElementById('m17sr').value,label:document.getElementById('m17sl').value,value:document.getElementById('m17sv').value});
  persist();if(typeof route==='function')route();
});
if(window.NAV_CONFIG&&!NAV_CONFIG.some(function(n){return n.id==='setup'}))NAV_CONFIG.splice(1,0,{id:'setup',label:'Setup',icon:'store'});
if(X.m13read&&!X.m13read._m17){var read0=X.m13read;var read1=function(text){var res=read0(text),n=0;(res.items||[]).forEach(function(it){['name','desc','sku','vendor'].forEach(function(k){var c=P.neutralizeFormula(it[k]||'');if(c.neutralized){it[k]=c.value;n++}})});res.neutralized=n;return res};read1._m17=1;X.m13read=read1}
if(X.AIBuild&&X.AIBuild.handle&&!X.AIBuild.handle._m17){
  var prev=X.AIBuild.handle;
  var LOCAL=' Local commands only. No AI provider was called.';
  X.AIBuild.handle=function(text,source){
    var raw=String(text||'').trim();
    if(/\b(set|switch|change) language\b/i.test(raw)){
      var name=(raw.match(/\b(urdu|arabic|english|french|spanish|german|hindi)\b/i)||[])[1];
      var map={urdu:'ur',arabic:'ar',english:'en',french:'fr',spanish:'es',german:'de',hindi:'hi'};
      if(!name||!map[name.toLowerCase()])return {handled:true,applied:false,source:'local',provider:'local',reply:'Name a language such as Urdu, Arabic, French, or Hindi.'+LOCAL};
      saveLocale(map[name.toLowerCase()]);
      var info=P.LOCALES.filter(function(l){return l.id===map[name.toLowerCase()]})[0];
      return {handled:true,applied:true,source:'local',provider:'local',reply:(info.coverage==='verified'?'Language saved.':'Language saved. The setup phrases for this language are still English.')+LOCAL};
    }
    if(/\b(health check|broken links|missing images)\b/i.test(raw)){
      var report=P.healthCheck(S,null);
      return {handled:true,applied:false,source:'local',provider:'local',reply:(report.findings.map(function(f){return f.detail}).join(' ')||'No stored problems found.')+LOCAL};
    }
    if(/\b(how are sales|sales insight|sales report)\b/i.test(raw)){
      var sales=P.salesInsights(S.orders||[],{timeZone:(S&&S.tz)||'UTC',sourceNote:'browser'});
      return {handled:true,applied:false,source:'local',provider:'local',reply:sales.suggestions.map(function(s){return s.text}).join(' ')+' Source: this browser, not the server database.'+LOCAL};
    }
    if(/\btranslate\b/i.test(raw))return {handled:true,applied:false,translated:false,blocked:'missing-provider',source:'local',provider:'local',reply:'Not translated. No provider key is configured on the server. You can type a translation and approve it yourself.'+LOCAL};
    if(/\bbulk alt\b/i.test(raw)){
      var ids=(S.products||[]).map(function(p){return p.id});
      var dry=P.bulkDryRun(S.products||[],ids,{alt:'use-name'});
      if(!/^confirm:/i.test(raw))return {handled:true,applied:false,needsConfirm:true,source:'local',provider:'local',reply:'Preview only: '+(dry.diffs||[]).length+' alt text change(s). Prices and SKUs stay the same. Say “confirm: bulk alt” to apply.'+LOCAL};
      var applied=P.bulkApply(S.products,dry);S.bulkUndo=S.bulkUndo||[];if(applied.ok)S.bulkUndo.unshift(applied.undo);persist();
      return {handled:true,applied:true,source:'local',provider:'local',reply:'Applied '+(applied.applied||0)+' alt text change(s). Say “undo bulk” to put the old text back.'+LOCAL};
    }
    if(/^undo bulk\b/i.test(raw)){var stack=S.bulkUndo||[],last=stack.shift();if(last)P.bulkUndo(S.products,last);persist();return {handled:true,applied:!!last,source:'local',provider:'local',reply:(last?'Bulk edit undone.':'Nothing to undo.')+LOCAL}}
    return prev(raw,source);
  };
  X.AIBuild.handle._m17=1;
}
if(X.onRoute)X.onRoute(function(){try{applyLocale()}catch(e){}});
var css=document.createElement('style');
css.textContent='#m17setup details{margin:0 0 12px;padding:12px}#m17setup summary{cursor:pointer;font-weight:700}#m17setup input,#m17setup select{max-width:100%;font-size:16px}#m17next .btn{margin-top:8px}@media(max-width:760px){body{flex-direction:column!important}aside{width:100%!important;height:auto!important;position:relative!important}nav{flex-direction:row!important;overflow-x:auto}main{width:100%!important}#m17metrics{display:block}#m17setup form{display:grid;gap:8px}}';
document.head.appendChild(css);
})();
