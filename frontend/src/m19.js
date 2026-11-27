/* ===== v43: "Move your store": copy products, variants, images and collections from Shopify, WooCommerce, Wix, Squarespace or any site ===== */
(function(){
var X=window,q=X.SX.q,h=X.SX.h,A=X.ACT;
function be(){var b=X.VendOmBackend;return b&&b.status&&b.status().status==='ok'&&b.cfg().storeId?b:null}
function head(t){return '<div class="xh"><h1>'+t+'</h1></div>'}
function money(n){try{return String(X.mF(n)).replace(/<[^>]+>/g,'').trim()}catch(e){return (+n).toFixed(2)}}
var state={scan:null,busy:false,err:'',done:null};
function slug(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,'').trim().replace(/[\s_]+/g,'-').replace(/-+/g,'-').slice(0,80)||'item'}
function strip(s){return X.safeHTML?X.safeHTML(s):String(s||'').replace(/<[^>]*>/g,'')}
function origin(u){u=String(u||'').trim();if(!u)throw new Error('Paste the link of your old store');if(!/^https?:\/\//i.test(u))u='https://'+u;var o;try{o=new URL(u)}catch(e){throw new Error('That does not look like a website link')}if(/^(localhost|127\.|10\.|192\.168\.|0\.)/.test(o.hostname))throw new Error('Use the public link of your store');return o.origin}

/* nav: Products › Move your store */
try{var p=(X.NAV_CONFIG||[]).filter(function(n){return n.id==='products'})[0];if(p&&!p.sub.some(function(s){return s.id==='products-import'}))p.sub.push({id:'products-import',label:'Move your store'})}catch(e){}
X.onRoute(function(r){if(r!=='products')return;var bar=q('#xpbar');if(bar&&!q('#xpmove',bar)){var b=document.createElement('button');b.className='btn';b.id='xpmove';b.dataset.x='go:products-import';b.textContent='Move your store';bar.insertBefore(b,bar.firstChild)}});

/* ---------- browser-only scanners (Shopify and WooCommerce allow this from the browser) ---------- */
function j(url){return fetch(url,{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})}
function shopify(o){var out={platform:'shopify',origin:o,store:{},products:[],collections:[],warnings:[]};
 return j(o+'/meta.json').then(function(m){out.store={name:m.name,currency:m.currency}},function(){}).then(function(){
  function page(n){return j(o+'/products.json?limit=250&page='+n).then(function(d){var L=d.products||[];L.forEach(function(p){var opts=(p.options||[]).filter(function(x){return x.name&&!(x.name==='Title'&&(x.values||[]).join()==='Default Title')});
   var vars=(p.variants||[]).filter(function(v){return v.title!=='Default Title'}).map(function(v){return{n:v.title,price:+v.price||0,qty:0,sku:v.sku||''}});var v0=(p.variants||[])[0]||{};
   out.products.push({handle:p.handle,name:p.title,desc:strip(p.body_html),vendor:p.vendor||'',type:p.product_type||'',tags:typeof p.tags==='string'?p.tags.split(',').map(function(t){return t.trim()}).filter(Boolean):(p.tags||[]),imgs:(p.images||[]).map(function(i){return i.src}).filter(Boolean),opts:opts.map(function(x){return{name:x.name,vals:(x.values||[]).join(', ')}}),vars:vars,price:+v0.price||0,cmp:+v0.compare_at_price||0,sku:vars.length?'':(v0.sku||'')})});
   return L.length===250&&n<40?page(n+1):null})}
  return page(1)}).then(function(){return j(o+'/collections.json?limit=250').then(function(d){var C=(d.collections||[]).filter(function(c){return c.handle!=='all'&&c.handle!=='frontpage'});
   return C.reduce(function(pr,c){return pr.then(function(){return j(o+'/collections/'+c.handle+'/products.json?limit=250').then(function(cp){out.collections.push({handle:c.handle,title:c.title,desc:strip(c.description),pic:(c.image||{}).src||'',products:(cp.products||[]).map(function(x){return x.handle})})},function(){out.collections.push({handle:c.handle,title:c.title,desc:strip(c.description),pic:'',products:[]})})})},Promise.resolve())},function(){})}).then(function(){return out})}
function woo(o){var out={platform:'woocommerce',origin:o,store:{},products:[],collections:[],warnings:[]},cats={};
 function page(n){return j(o+'/wp-json/wc/store/v1/products?per_page=100&page='+n).then(function(L){if(!Array.isArray(L))return;L.forEach(function(p){var pr=p.prices||{},d=Math.pow(10,pr.currency_minor_unit==null?2:pr.currency_minor_unit),price=(+pr.price||0)/d,reg=(+pr.regular_price||0)/d,hd=p.slug||slug(p.name);
  out.products.push({handle:hd,name:p.name,desc:strip(p.description||p.short_description),vendor:'',type:'',tags:(p.tags||[]).map(function(t){return t.name}),imgs:(p.images||[]).map(function(i){return i.src}).filter(Boolean),opts:(p.attributes||[]).filter(function(a){return a.has_variations}).map(function(a){return{name:a.name,vals:(a.terms||[]).map(function(t){return t.name}).join(', ')}}),vars:[],price:price,cmp:reg>price?reg:0,sku:p.sku||''});
  (p.categories||[]).forEach(function(c){var k=c.slug||slug(c.name);(cats[k]=cats[k]||{handle:k,title:c.name,desc:'',pic:'',products:[]}).products.push(hd)})});return L.length===100&&n<40?page(n+1):null})}
 return page(1).then(function(){out.collections=Object.keys(cats).map(function(k){return cats[k]});return out})}
function scanLocal(o){return j(o+'/products.json?limit=1').then(function(d){if(d&&Array.isArray(d.products))return shopify(o);throw 0}).catch(function(e){if(e&&e.platform)return e;
 return j(o+'/wp-json/wc/store/v1/products?per_page=1').then(function(d){if(Array.isArray(d))return woo(o);throw 0})}).catch(function(e){if(e&&e.platform)return e;throw new Error('This browser could not read that store. Shopify and WooCommerce stores usually work here. For Wix, Squarespace, BigCommerce and other sites, VendOm reads them from the server (Settings › Connect to the VendOm server), or export your products to a CSV file and import it.')})}

/* ---------- copy a scan into this store (browser) ---------- */
function importLocal(s,over){var res={created:0,updated:0,skipped:0,cols:0},byH={};S.collections=S.collections||[];S.cols=S.cols||[];
 s.products.forEach(function(r){var p=S.products.filter(function(x){return x.handle===r.handle})[0];if(p&&!over){res.skipped++;byH[r.handle]=p;return}
  if(!p){p={id:S.nid++,handle:r.handle,stock:0,status:'Active',cols:[],seo:{}};S.products.push(p);res.created++}else res.updated++;
  p.name=r.name;p.desc=r.desc;p.price=r.price;p.cmp=r.cmp||0;p.tags=r.tags;p.imgs=r.imgs.slice(0,12);p.opts=r.opts;p.vars=r.vars;p.sku=r.sku;p.vendor=r.vendor;p.type=r.type;p.from=s.origin;byH[r.handle]=p});
 s.collections.forEach(function(c){var ex=S.collections.filter(function(x){return x.handle===c.handle})[0];if(!ex){ex={id:Date.now()+Math.floor(Math.random()*1e4),title:c.title,handle:c.handle,desc:c.desc,type:'Manual',rules:[],pic:c.pic};S.collections.push(ex);res.cols++}
  if(S.cols.indexOf(c.title)<0)S.cols.push(c.title);c.products.forEach(function(hd){var p=byH[hd];if(p){p.cols=p.cols||[];if(p.cols.indexOf(c.title)<0)p.cols.push(c.title)}})});
 if(s.store.name&&(!S.name||S.name==='My Store'))S.migratedName=s.store.name;
 save();return res}

/* ---------- page ---------- */
V['products-import']=function(){var s=state.scan,b=be(),d=state.done;
 var steps='<ol class="xk" style="margin:6px 0 0 18px;padding:0;line-height:1.7"><li>Paste the link of your old store</li><li>VendOm reads it and shows what it found</li><li>Choose options and press <b>Copy to VendOm</b></li></ol>';
 var form='<div class="xc"><p style="margin-top:0">Copy your store from <b>Shopify, WooCommerce, Wix, Squarespace, BigCommerce</b> or any other website. VendOm copies your <b>products, prices, variants, SKUs, photos, tags and collections</b>.</p>'+steps
  +'<label for="mv-url" style="display:block;margin-top:14px">Your old store link</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input class="xin" id="mv-url" placeholder="yourstore.com or yourstore.myshopify.com" style="flex:1;min-width:220px" value="'+h(state.url||'')+'"><button class="btn pri" id="mv-scan" data-x="mvscan"'+(state.busy?' disabled':'')+'>'+(state.busy?'Reading your store…':'Scan store')+'</button></div>'
  +'<label class="xchk" style="display:block;margin-top:10px"><input type="checkbox" id="mv-own"'+(state.own?' checked':'')+'> I own this store or have permission to copy it</label>'
  +'<p id="mv-err" style="color:#b42318;min-height:18px;margin:6px 0 0">'+h(state.err)+'</p>'
  +'<p class="xk" style="margin:4px 0 0">'+(b?'Your store is connected to the VendOm server, so any website can be read and photos are copied to VendOm.':'This browser can read Shopify and WooCommerce stores. Other platforms are read by the VendOm server once your store is connected to it.')+' Prefer a file? <a href="#" data-x="pimport">Import a CSV</a> (Shopify CSV works).</p></div>';
 var prev='';if(s){prev='<div class="xc" id="mv-prev"><h3 style="margin-top:0">Found on '+h(s.origin.replace(/^https?:\/\//,''))+' · '+h({shopify:'Shopify',woocommerce:'WooCommerce',generic:'Website'}[s.platform]||s.platform)+'</h3>'
  +'<div style="display:flex;gap:24px;flex-wrap:wrap;margin:6px 0 12px"><div><b style="font-size:22px" id="mv-np">'+s.counts.products+'</b><div class="xk">products</div></div><div><b style="font-size:22px" id="mv-nc">'+s.counts.collections+'</b><div class="xk">collections</div></div><div><b style="font-size:22px">'+s.counts.images+'</b><div class="xk">photos</div></div></div>'
  +(s.sample.length?'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:12px">'+s.sample.map(function(p){return '<div style="border:1px solid #e3e3e3;border-radius:8px;overflow:hidden;background:#fff">'+(p.image?'<img src="'+h(p.image)+'" alt="" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#f1f1f1">':'<div style="aspect-ratio:1;background:#f1f1f1"></div>')+'<div style="padding:6px 8px;font-size:12px"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+h(p.title)+'</b>'+money(p.price)+'</div></div>'}).join('')+'</div>':'')
  +(s.collections.length?'<p class="xk" style="margin:0 0 10px">Collections: '+s.collections.slice(0,12).map(function(c){return h(c.title)+' ('+c.products+')'}).join(', ')+'</p>':'')
  +s.warnings.map(function(w){return '<p style="color:#8a6100;margin:0 0 8px">'+h(w)+'</p>'}).join('')
  +'<label class="xchk" style="display:block"><input type="checkbox" id="mv-over"> Replace products I already have with the same handle</label>'
  +(b?'<label class="xchk" style="display:block"><input type="checkbox" id="mv-img" checked> Copy photos to VendOm (recommended, so they keep working after you close the old store)</label><label class="xchk" style="display:block"><input type="checkbox" id="mv-draft"> Import as drafts so I can check them before they go live</label>':'')
  +'<button class="btn pri" id="mv-go" data-x="mvrun" style="margin-top:10px"'+(s.counts.products||s.counts.collections?'':' disabled')+'>Copy to VendOm</button></div>'}
 var done=d?'<div class="xc" id="mv-done" style="border-left:4px solid #5DB346"><h3 style="margin-top:0">Your store was copied</h3><p style="margin:0 0 8px">'+d.created+' products added'+(d.updated?', '+d.updated+' updated':'')+(d.skipped?', '+d.skipped+' already here (skipped)':'')+' · '+d.cols+' collections'+(d.copied!=null?' · '+d.copied+' photos copied':'')+'.</p><p class="xk" style="margin:0 0 10px">Next: pick a theme and add your logo and colours so the store looks like your old one, then point your domain to VendOm.</p><button class="btn pri" data-x="go:products">View products</button> <button class="btn" data-x="go:products-collections">View collections</button> <button class="btn" data-x="go:themes">Choose a theme</button></div>':'';
 return '<div class="xw">'+head('Move your store')+done+form+prev
  +'<div class="xc"><h3 style="margin-top:0">What gets copied</h3><table class="xt"><tr><th>Item</th><th>Copied</th></tr>'
  +[['Products, descriptions, prices, sale prices','Yes'],['Variants (size, colour), SKUs','Yes'],['Product photos','Yes'],['Tags, vendor, product type','Yes'],['Collections and which products are in them','Yes'],['Store name','Yes'],['Customers and past orders','Export a CSV from your old platform and import it in Customers'],['Theme design','Not copied exactly. Pick a VendOm theme and add your logo, colours and banners'],['Domain','Point your domain to VendOm in Settings › Domains']].map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>'}).join('')+'</table></div></div>'};

function setErr(m){state.err=m||'';var e=q('#mv-err');if(e)e.textContent=state.err}
A.mvscan=function(){var raw=(q('#mv-url')||{}).value||'',own=(q('#mv-own')||{}).checked;state.url=raw;state.own=own;state.done=null;var o;
 try{o=origin(raw)}catch(e){setErr(e.message);return}if(!own){setErr('Tick the box to confirm you own this store or have permission to copy it');return}
 state.busy=true;state.err='';state.scan=null;route();var b=be();
 var job=b?b.api('POST','/api/stores/'+b.cfg().storeId+'/migrate/scan',{url:o,owner:true}).then(function(r){r.remote=1;return r})
  :scanLocal(o).then(function(s){state.local=s;return{platform:s.platform,origin:s.origin,store:s.store,counts:{products:s.products.length,collections:s.collections.length,images:s.products.reduce(function(n,p){return n+p.imgs.length},0)},sample:s.products.slice(0,8).map(function(p){return{title:p.name,price:p.price,image:p.imgs[0]}}),collections:s.collections.map(function(c){return{title:c.title,products:c.products.length}}),warnings:s.products.length?[]:['No products were found. Export them to CSV from your old platform and import the file.']}});
 job.then(function(r){if(r.remote)r.sample=r.sample.map(function(p){return{title:p.title,price:p.price/100,image:p.image}});state.scan=r},function(e){state.err=e.message||'Could not read that store'}).then(function(){state.busy=false;route()})};
A.mvrun=function(){var s=state.scan;if(!s)return;var over=!!(q('#mv-over')||{}).checked,b=be(),btn=q('#mv-go');if(btn){btn.disabled=true;btn.textContent='Copying…'}
 if(s.remote&&b){b.api('POST','/api/stores/'+b.cfg().storeId+'/migrate/import',{overwrite:over,copyImages:!!(q('#mv-img')||{}).checked,status:(q('#mv-draft')||{}).checked?'draft':'active'}).then(function(r){state.done={created:r.products.created,updated:r.products.updated,skipped:r.products.skipped,cols:r.collections.created,copied:r.images.copied};state.scan=null;return b.pull()}).catch(function(e){state.err=e.message}).then(function(){route()});return}
 var r=importLocal(state.local,over);state.done=r;state.scan=null;state.local=null;toast('Copied '+(r.created+r.updated)+' products');route()};
})();
