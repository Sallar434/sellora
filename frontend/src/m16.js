/* Admin and editor continuity: extra templates, preview cart, schemes, honest local actions.
   Provider calls stay on the server. This file never sends an API key. */
(function(){
var X=window;
var LOCAL=' Local commands only. No AI provider was called.';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function persist(){try{save()}catch(e){}}
function pages(){return {page:'Page',blog:'Blog',search:'Search',cart:'Cart',lookbook:'Lookbook'}}
function ensurePages(t){
  if(!t||typeof initT!=='function')return t;
  initT(t);
  if(typeof P5!=='undefined')Object.keys(pages()).forEach(function(k){if(P5.indexOf(k)<0)P5.push(k)});
  if(typeof PGS!=='undefined')Object.keys(pages()).forEach(function(k){PGS[k]=pages()[k]});
  var dfl={
    page:[['heading',{h:'Page'}],['pagecontent',{txt:''}]],
    blog:[['heading',{h:'Journal'}],['bloglist',{}]],
    search:[['heading',{h:'Search'}],['searchbody',{}]],
    cart:[['heading',{h:'Cart'}],['cartbody',{}]],
    lookbook:[['heading',{h:'Lookbook'}],['collection',{n:8,cols:2}]]
  };
  Object.keys(dfl).forEach(function(k){if(!t.pg[k]||!t.pg[k].length)t.pg[k]=dfl[k].map(function(a){return {id:typeof uid==='function'?uid():('p'+Math.random().toString(36).slice(2)),type:a[0],hide:false,s:Object.assign({},a[1])}})});
  t.schemes=t.schemes||[{name:'Paper',bg:'#FFFFFF',fg:'#111111',pad:32},{name:'Ink',bg:'#111111',fg:'#FFFFFF',pad:36},{name:'Forest',bg:'#2E6B4F',fg:'#FFFFFF',pad:32}];
  return t;
}
function paint(html,s){
  if(!html||!s||!s.s)return html;
  var extra='';
  if(s.s.fg)extra+=';color:'+String(s.s.fg).replace(/[^#a-zA-Z0-9(),.%\s-]/g,'');
  if(s.s.pad!=null&&s.s.pad!=='')extra+=';padding:'+(+s.s.pad||0)+'px 40px';
  if(!extra)return html;
  return html.replace(/<([a-z0-9]+)([^>]*\sdata-sid="[^"]*"[^>]*)>/i,function(full,tag,attrs){
    if(/style="/i.test(attrs))return '<'+tag+attrs.replace(/style="([^"]*)"/i,'style="$1'+extra+'"')+'>';
    return '<'+tag+attrs+' style="'+extra.slice(1)+'">';
  });
}
function productBy(id){return (S.products||[]).filter(function(p){return String(p.id)===String(id)})[0]}
function installSections(){
  if(typeof SCH==='undefined'||typeof RN==='undefined')return;
  Object.keys(SCH).forEach(function(k){
    if(!SCH[k].some(function(f){return f[0]==='fg'}))SCH[k].push(['fg','Text color','c','','tx']);
    if(!SCH[k].some(function(f){return f[0]==='pad'}))SCH[k].push(['pad','Padding','r',32,[0,120]]);
  });
  LBL.bloglist='Blog posts';LBL.searchbody='Search results';LBL.cartbody='Cart lines';
  SCH.bloglist=SCH.bloglist||[['h','Heading','t','Journal'],['bg','Background','c','','bg'],['fg','Text color','c','','tx'],['pad','Padding','r',32,[0,120]]];
  SCH.searchbody=SCH.searchbody||SCH.bloglist;
  SCH.cartbody=SCH.cartbody||SCH.bloglist;
  function chosen(s){return productBy(s.s&&s.s.pid)|| (S.products||[]).filter(function(p){return p.status==='Active'})[0]}
  var prevFeat=RN.feat_product, prevHi=RN.prod_highlight, prevHot=RN.prod_hotspots;
  if(prevFeat)RN.feat_product=function(t,s,c){var p=chosen(s);if(p){var keep=S.products;S.products=[p].concat(keep.filter(function(x){return x!==p}));try{return prevFeat(t,s,c)}finally{S.products=keep}}return prevFeat(t,s,c)};
  if(prevHi)RN.prod_highlight=function(t,s,c){var p=chosen(s);var html=prevHi(t,s,c);if(p&&html)html=html.replace(/Product title|Engineered Performance Tee|Track Day Tee/g,esc(p.name));return html};
  if(prevHot)RN.prod_hotspots=function(t,s,c){var p=chosen(s);var html=prevHot(t,s,c);if(p&&html)html=html.replace('Shop the look','Shop the look · '+esc(p.name));return html};
  RN.bloglist=function(t,s){var posts=(S.blogPosts||[]).filter(function(p){return p.status!=='Hidden'});var body=posts.length?posts.map(function(p){return '<article style="padding:12px 0;border-bottom:1px solid #ddd"><h3 style="margin:0"><a data-edpost="'+esc(p.id)+'" style="cursor:pointer">'+esc(p.title)+'</a></h3><p style="margin:4px 0 0">'+esc(String(p.body||'').replace(/<[^>]+>/g,' ').slice(0,180))+'</p></article>'}).join(''):'<p>No posts are stored for this store.</p>';return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<h2>'+esc((s.s&&s.s.h)||'Journal')+'</h2>'+body)};
  RN.searchbody=function(t,s){var q=(typeof E!=='undefined'&&E&&E.preview&&E.preview.q)||'';var items=(S.products||[]).filter(function(p){return p.status==='Active'&&(!q||String(p.name).toLowerCase().indexOf(q.toLowerCase())>=0)});var list=items.length?items.map(function(p){return '<a data-pid="'+esc(p.id)+'" style="display:block;padding:8px 0;cursor:pointer">'+esc(p.name)+'</a>'}).join(''):'<p>No stored products match.</p>';return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<label>Search the catalog<input data-edsearch="1" value="'+esc(q)+'" aria-label="Search the catalog"></label>'+list)};
  RN.cartbody=function(t,s){var lines=(typeof E!=='undefined'&&E&&E.previewCart)||[];var html=lines.length?lines.map(function(l){var p=productBy(l.id);return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd"><span>'+esc(p?p.name:'Removed product')+' × '+l.q+'</span><span>'+(p&&typeof money==='function'?money(p.price*l.q):'')+'</span></div>'}).join(''):'<p>The preview cart is empty. Use Add to cart on a product card. Nothing is charged.</p>';return (typeof wrap==='function'?wrap:function(s,h){return '<section class="sx" data-sid="'+s.id+'">'+h+'</section>'})(s,'<h2 data-cartlines="1">Cart</h2>'+html+'<p><a data-edpg="home" style="cursor:pointer">Continue browsing</a></p>')};
  Object.keys(RN).forEach(function(type){var prev=RN[type];if(!prev||prev._m16)return;var next=function(t,s,c){var html='';try{html=prev(t,s,c)||''}catch(e){html=''}html=html.replace(/<a data-pg="catalog">Blog<\/a>/g,'<a data-pg="blog">Blog</a>').replace(/<a data-pg="catalog">Search<\/a>/g,'<a data-pg="search">Search</a>').replace(/<a data-pg="catalog">Cart<\/a>/g,'<a data-pg="cart">Cart</a>');return paint(html,s)};next._m16=1;RN[type]=next});
}
function snapshot(){try{var t=live();if(!t)return;S.ai15=S.ai15||{};S.ai15.undo=S.ai15.undo||[];S.ai15.undo.unshift(JSON.stringify({pg:t.pg,hdr:t.hdr,ftr:t.ftr}));S.ai15.undo=S.ai15.undo.slice(0,8)}catch(e){}}
function undo(){var t=live();var raw=(S.ai15&&S.ai15.undo||[])[0];if(!t||!raw)return {handled:true,source:'local',reply:'Nothing to undo.'+LOCAL};var data=JSON.parse(raw);t.pg=data.pg;t.hdr=data.hdr;t.ftr=data.ftr;S.ai15.undo.shift();persist();return {handled:true,source:'local',built:true,reply:'Restored the previous theme sections.'+LOCAL}}
function blocked(text){
  var t=text.toLowerCase();
  if(/\b(refund|payout|charge the|capture payment)\b/.test(t))return 'Refunds and charges are not run from the assistant.';
  if(/\b(send email|send sms|whatsapp|newsletter blast)\b/.test(t))return 'Outbound messages are not sent from the assistant.';
  if(/\b(go live|publish the store|remove the password)\b/.test(t))return 'Publishing stays on Plans and needs a paid plan. Nothing was published.';
  if(/\b(buy a domain|purchase|subscribe to|open an account)\b/.test(t))return 'This assistant does not make purchases or open third-party accounts.';
  return '';
}
function label(r){
  if(!r)return r;
  r.source='local';r.provider='local';
  if(r.handled&&r.reply&&r.reply.indexOf('No AI provider was called')<0)r.reply=r.reply+LOCAL;
  return r;
}
function ordersOf(list,from,to){
  var rows=(list||[]).filter(function(o){if(o.demo)return false;var t=o.at||null;if(t==null)return from==null&&to==null;if(from!=null&&t<from)return false;if(to!=null&&t>to)return false;return true});
  function pay(o){var s=String(o.st||o.status||'').toLowerCase();var f=String(o.financial||'').toLowerCase();if(f==='paid'||f==='held'||/\bpaid\b|\bfulfilled\b/.test(s))return 'paid';if(f==='pending'||f==='unpaid'||/unpaid/.test(s))return 'unpaid';if(/refund/.test(f+s))return 'refunded';return 'unknown'}
  function ful(o){var s=String(o.st||o.status||o.fulfillment||'').toLowerCase();if(/partial/.test(s))return 'partial';if(/\bfulfilled\b|\bshipped\b/.test(s))return 'fulfilled';if(/unfulfilled|\bpaid\b/.test(s))return 'unfulfilled';return 'unknown'}
  function del(o){if(o.delivered===true)return 'delivered';if(o.delivered===false)return 'undelivered';var s=String(o.st||o.status||'').toLowerCase();if(/\bundelivered\b|\bnot delivered\b/.test(s))return 'undelivered';if(/\bdelivered\b/.test(s))return 'delivered';return 'unknown'}
  var out={source:'stored-records',count:rows.length,cancelled:0,payment:{paid:0,unpaid:0,refunded:0,unknown:0},fulfillment:{fulfilled:0,unfulfilled:0,partial:0,unknown:0},delivery:{delivered:0,undelivered:0,unknown:0}};
  rows.forEach(function(o){if(/cancel/.test(String(o.st||o.status||'').toLowerCase()))out.cancelled++;out.payment[pay(o)]++;out.fulfillment[ful(o)]++;out.delivery[del(o)]++});
  return out;
}
function seoFor(pg,arg){
  var origin='https://'+(typeof slug==='function'?slug():'store')+'.sellora.app';
  var path=pg==='product'&&arg?'/products/'+arg:pg==='collection'&&arg?'/collections/'+encodeURIComponent(arg):pg==='page'&&arg?'/pages/'+arg:'/'+(pg==='home'?'':pg);
  var title=S.name||'Store', desc='';
  if(pg==='product'){var p=(S.products||[]).filter(function(x){return String(x.id)===String(arg)||x.handle===arg})[0];if(p){title=((p.seo&&p.seo.t)||p.name)+' | '+S.name;desc=(p.seo&&p.seo.d)||String(p.desc||'').replace(/<[^>]+>/g,' ').slice(0,155)}}
  else if(pg==='page'){var pgd=(S.pages||[]).filter(function(x){return x.h===arg})[0];if(pgd){title=pgd.t+' | '+S.name;desc=String(pgd.b||'').replace(/<[^>]+>/g,' ').slice(0,155)}}
  else title=(S.seoTitle||S.name)+' | '+S.name;
  if(!desc)desc=S.seoDesc||'';
  var faq=(S.pages||[]).filter(function(p){return p.h==='faq'&&p.faq&&p.faq.length})[0];
  var jsonld={'@context':'https://schema.org','@type':'WebSite',name:S.name,url:origin};
  if(faq)jsonld={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.faq.map(function(f){return {'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}})};
  return {title:title,description:desc,canonical:origin+path,jsonld:jsonld};
}
function applySeo(pg,arg){
  var seo=seoFor(pg,arg);
  var root=document.getElementById('xsf')||document.getElementById('shp');
  if(!root)return seo;
  var old=root.querySelector('#seo-meta');if(old)old.remove();
  var d=document.createElement('div');d.id='seo-meta';d.setAttribute('data-title',seo.title);d.setAttribute('data-canonical',seo.canonical);d.setAttribute('data-description',seo.description);
  var sc=document.createElement('script');sc.type='application/ld+json';sc.textContent=JSON.stringify(seo.jsonld);d.appendChild(sc);root.prepend(d);
  return seo;
}
function voiceListen(done){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return done({state:'unsupported',message:'Voice input is not available in this browser. Type your request instead.'});
  var finished=false;
  function once(r){if(finished)return;finished=true;done(r)}
  try{var rec=new SR();rec.lang='en-US';rec.interimResults=false;
    var timer=setTimeout(function(){try{rec.abort()}catch(e){}once({state:'error',message:'The microphone did not respond. Type your request instead.'})},1200);
    rec.onresult=function(e){clearTimeout(timer);once({state:'heard',text:e.results[0][0].transcript})};
    rec.onerror=function(e){clearTimeout(timer);var code=e&&e.error;var state=code==='not-allowed'||code==='service-not-allowed'?'denied':'error';var msg=state==='denied'?'Microphone permission was denied. Type your request instead.':'The microphone could not be used ('+(code||'error')+'). Type your request instead.';once({state:state,message:msg})};
    rec.start();
  }catch(err){once({state:'unsupported',message:'Voice input is not available in this browser. Type your request instead.'})}
}
function mountVoice(){
  var mic=document.getElementById('qmic');if(!mic||mic._m16)return;mic._m16=1;
  mic.onclick=function(){var st=document.getElementById('qvstat');voiceListen(function(r){if(st)st.textContent=r.message||('Heard: '+r.text);if(r.state==='heard'&&X.AIBuild){var q=document.getElementById('q');if(q)q.value=r.text;X.AIBuild.handle(r.text,'voice')}})};
}
function decorate(){
  if(typeof E==='undefined'||!E||!E.open)return;
  var body=document.querySelector('#edl .erb');if(!body||body.querySelector('.m16extra'))return;
  var sec=typeof secOf==='function'?secOf(E.open):null;if(!sec||!sec.s)return;
  var schemes=(E.t.schemes||[]).map(function(s){return '<option>'+esc(s.name)+'</option>'}).join('');
  var products=(S.products||[]).map(function(p){return '<option value="'+esc(p.id)+'"'+(String(sec.s.pid)===String(p.id)?' selected':'')+'>'+esc(p.name)+'</option>'}).join('');
  var pick=/feat_product|prod_highlight|prod_hotspots|featured|feat_col/.test(sec.type)?'<label class="m16extra">Product<select data-m16pid="'+esc(sec.id)+'"><option value="">Catalog default</option>'+products+'</select></label>':'';
  body.insertAdjacentHTML('afterbegin','<label class="m16extra">Color scheme<select data-m16scheme="'+esc(sec.id)+'"><option value="">Custom</option>'+schemes+'</select></label>'+pick);
}
function width(mode){
  var ep=document.getElementById('ep');if(!ep)return;
  ep.style.maxWidth=mode==='mobile'?'390px':'none';
  ep.style.margin=mode==='mobile'?'0 auto':'';
  ep.setAttribute('data-preview',mode);
  if(E&&E.t){E.t.ts=E.t.ts||{};E.t.ts.preview=mode;persist()}
}
function toolbar(){
  var bar=document.querySelector('#ov .ovt');if(!bar||document.getElementById('m16view'))return;
  bar.insertAdjacentHTML('beforeend','<span id="m16view" style="display:inline-flex;gap:6px"><button type="button" class="btn" data-m16w="desktop">Desktop</button><button type="button" class="btn" data-m16w="mobile">Mobile</button></span>');
  if(E&&E.preview&&E.preview.col){
    var col=(S.collections||[]).filter(function(c){return c.title===E.preview.col})[0];
    if(col&&!document.getElementById('m16tpl'))bar.insertAdjacentHTML('beforeend','<label id="m16tpl">Template <select data-m16tpl="1"><option '+(col.template!=='lookbook'?'selected':'')+'>collection</option><option '+(col.template==='lookbook'?'selected':'')+'>lookbook</option></select></label>');
  }
}
document.addEventListener('click',function(e){
  var t=e.target;if(!t||!t.closest)return;
  var w=t.closest('[data-m16w]');if(w){width(w.getAttribute('data-m16w'));return}
  var atc=t.closest('#ep .atc');if(atc&&typeof E!=='undefined'&&E){var card=atc.closest('[data-pid]');var id=card&&card.getAttribute('data-pid');if(!id)return;e.preventDefault();e.stopPropagation();E.previewCart=E.previewCart||[];var line=E.previewCart.filter(function(l){return String(l.id)===String(id)})[0];if(line)line.q++;else E.previewCart.push({id:id,q:1});try{toast('Added to the preview cart. Nothing was charged.')}catch(err){}if(E.pg==='cart')try{rp()}catch(err){}return}
  var post=t.closest('[data-edpost]');if(post&&E){e.preventDefault();var bp=(S.blogPosts||[]).filter(function(p){return String(p.id)===post.getAttribute('data-edpost')})[0];E.preview=E.preview||{};E.preview.post=bp||null;return}
},true);
document.addEventListener('change',function(e){
  var t=e.target;if(!t||typeof E==='undefined'||!E)return;
  if(t.dataset&&t.dataset.m16scheme){var sec=typeof secOf==='function'?secOf(t.dataset.m16scheme):null;var scheme=(E.t.schemes||[]).filter(function(s){return s.name===t.value})[0];if(sec&&scheme){sec.s.bg=scheme.bg;sec.s.fg=scheme.fg;sec.s.pad=scheme.pad;sec.s.scheme=scheme.name;persist();try{lp();rp()}catch(err){}}}
  if(t.dataset&&t.dataset.m16pid){var s2=typeof secOf==='function'?secOf(t.dataset.m16pid):null;if(s2){s2.s.pid=t.value;persist();try{rp()}catch(err){}}}
  if(t.dataset&&t.dataset.m16tpl){var col=(S.collections||[]).filter(function(c){return c.title===E.preview.col})[0];if(col){col.template=t.value;ensurePages(E.t);E.pg=t.value==='lookbook'?'lookbook':'collection';persist();try{lp();rp()}catch(err){}}}
},true);
document.addEventListener('input',function(e){
  var t=e.target;if(!t)return;
  if(t.dataset&&t.dataset.edsearch&&typeof E!=='undefined'&&E){E.preview=E.preview||{};E.preview.q=t.value;try{rp()}catch(err){}}
  if(t.dataset&&t.dataset.sk&&typeof E!=='undefined'&&E)setTimeout(function(){persist()},40);
},true);
if(X.AIBuild&&X.AIBuild.handle&&!X.AIBuild.handle._m16){
  var h0=X.AIBuild.handle;
  var wrapped=function(text,source){
    var raw=String(text||'').trim();
    var block=blocked(raw);
    if(block)return {handled:true,applied:false,source:'local',provider:'local',reply:block+LOCAL};
    if(/^undo\b/i.test(raw))return undo();
    if(/\b(delete|remove|wipe)\b/i.test(raw)&&/\b(all|every)\b/i.test(raw)){
      if(!/^confirm:/i.test(raw))return {handled:true,applied:false,needsConfirm:true,source:'local',provider:'local',reply:'Nothing was deleted. Say “confirm: '+raw+'” to delete stored records.'};
    }
    if(/\b(build|redesign|generate)\b/i.test(raw)&&/\b(website|store|shop)\b/i.test(raw))snapshot();
    var r=h0(raw.replace(/^confirm:\s*/i,''),source||'text');
    return label(r);
  };
  wrapped._m16=1;X.AIBuild.handle=wrapped;
  X.AIBuild.orders=ordersOf;X.AIBuild.seo=seoFor;X.AIBuild.undo=undo;X.AIBuild.voiceListen=voiceListen;
}
if(typeof edit==='function'&&!edit._m16){var ed0=edit;var edn=function(id){var t=typeof th==='function'?th(id):null;if(t)ensurePages(t);var r=ed0(id);setTimeout(toolbar,0);return r};edn._m16=1;edit=edn}
if(typeof lp==='function'&&!lp._m16){var lp0=lp;var lpn=function(){lp0();try{decorate();toolbar()}catch(e){}};lpn._m16=1;lp=lpn}
if(typeof rp==='function'&&!rp._m16){var rpA=rp;var rpB=function(){try{rpA()}catch(e){console.error(e)}if(typeof E==='undefined'||!E)return;var pg=E.pg;if(!pg||pg==='home'||pg==='signin')return;var el=document.getElementById('ep');if(!el||typeof sf!=='function')return;try{var t=E.t;if(t)ensurePages(t);el.innerHTML=sf(t,pg,E.preview&&E.preview.pid);el.setAttribute('data-m16pg',pg)}catch(e){el.setAttribute('data-m16pg','err')}};rpB._m16=1;rp=rpB}
if(X.AIBuild&&X.AIBuild.previewTo&&!X.AIBuild.previewTo._m16){var pv0=X.AIBuild.previewTo;var pv1=function(d){if(typeof E!=='undefined'&&E&&E.t)ensurePages(E.t);var r=pv0(d);try{rp()}catch(e){}return r};pv1._m16=1;X.AIBuild.previewTo=pv1}
if(X.SF&&X.SF.go&&!X.SF.go._m16){var g0=X.SF.go;var gn=function(to){var r=g0(to);try{var p=String(to||'home').split(':');applySeo(p[0],p.slice(1).join(':'))}catch(e){}return r};gn._m16=1;X.SF.go=gn;if(X.SF.open){var o0=X.SF.open;X.SF.open=function(pg){return gn(pg||'home')}}}
if(X.onRoute)X.onRoute(function(r){
  mountVoice();
  try{var t=typeof live==='function'?live():null;if(t)ensurePages(t)}catch(e){}
  var main=document.getElementById('main');if(!main)return;
  if((r==='orders'||r==='orders-all')&&!document.getElementById('m16orders')){
    var sum=ordersOf(S.orders||[]);
    var box=document.createElement('div');box.id='m16orders';box.className='panel';
    box.innerHTML='<h3>Stored orders</h3><p>Placed '+sum.count+' · Cancelled '+sum.cancelled+' · Paid '+sum.payment.paid+' · Unpaid '+sum.payment.unpaid+' · Payment unknown '+sum.payment.unknown+' · Fulfilled '+sum.fulfillment.fulfilled+' · Unfulfilled '+sum.fulfillment.unfulfilled+' · Delivered '+sum.delivery.delivered+' · Undelivered '+sum.delivery.undelivered+' · Delivery unknown '+sum.delivery.unknown+'.</p><p class="mu">These numbers are counted from orders saved in this store. Delivery unknown means the record does not say whether it was delivered.</p>';
    main.insertBefore(box,main.firstChild);
  }
  if(r==='integrations'&&!document.getElementById('m16int')){
    var note=document.createElement('div');note.id='m16int';note.className='panel';
    note.innerHTML='<h3>Provider status</h3><p>Live connections are <b>UNVERIFIED</b> until the API server is configured. Keys are not stored in this browser for the assistant, and this page does not mark a provider connected.</p><ul><li>DeepSeek — set DEEPSEEK_API_KEY on the server. Not configured here.</li><li>Claude — optional, set ANTHROPIC_API_KEY on the server. Not configured here.</li><li>Carrier tracking — set TRACKING_API_URL on the server. Not configured, so tracking is not shown as live.</li></ul><p class="mu">A pasted key in an older form is not a health check and is not used by the assistant.</p>';
    main.insertBefore(note,main.firstChild);
  }
});
if(typeof sf==='function'&&!sf._m16){var sf0=sf;var sf1=function(t,pg,pid){if(t&&pg&&t.pg&&t.pg[pg]&&/^(cart|blog|search|page|lookbook)$/.test(pg)){ensurePages(t);var ctx={pg:pg,pid:pid},rd=function(a){return (a||[]).filter(function(s){return !s.hide}).map(function(s){var f=RN[s.type];return f?f(t,s,ctx):''}).join('')};return '<div class="sf" style="--b:'+t.bg+';--t:'+t.tx+';--a:'+t.ac+';--r:'+(t.rad||0)+'px">'+rd(t.hdr)+rd(t.pg[pg])+rd(t.ftr)+'</div>'}return sf0.apply(this,arguments)};sf1._m16=1;sf=sf1}
installSections();
var css=document.createElement('style');css.textContent='.m16extra{display:block;margin:0 0 8px}.m16extra select{width:100%}#ep[data-preview="mobile"]{box-shadow:0 0 0 8px #111;border-radius:16px}#m16orders,#m16int{margin:0 0 12px}';document.head.appendChild(css);
})();
