/* ===== Sellora v30: core layer (API, data, orders, customers, pricing, storefront) ===== */
(function(){
var X=window;

var CURN={USD:'US Dollar',PKR:'Pakistani Rupee',EUR:'Euro',AED:'UAE Dirham',GBP:'British Pound',CAD:'Canadian Dollar',AUD:'Australian Dollar',INR:'Indian Rupee',SAR:'Saudi Riyal',JPY:'Japanese Yen',CNY:'Chinese Yuan',CHF:'Swiss Franc',SGD:'Singapore Dollar',HKD:'Hong Kong Dollar',NZD:'New Zealand Dollar',SEK:'Swedish Krona',NOK:'Norwegian Krone',DKK:'Danish Krone',TRY:'Turkish Lira',BDT:'Bangladeshi Taka',QAR:'Qatari Riyal',KWD:'Kuwaiti Dinar',BHD:'Bahraini Dinar',OMR:'Omani Rial',MYR:'Malaysian Ringgit',IDR:'Indonesian Rupiah',THB:'Thai Baht',ZAR:'South African Rand',NGN:'Nigerian Naira',EGP:'Egyptian Pound',BRL:'Brazilian Real',MXN:'Mexican Peso',KRW:'South Korean Won',PHP:'Philippine Peso',LKR:'Sri Lankan Rupee',PLN:'Polish Zloty'};
var _dn=null;try{_dn=new Intl.DisplayNames(['en'],{type:'currency'})}catch(e){}
X.CURN=CURN;
X.curName=function(c){c=String(c||(window.S&&S.cur)||'USD').toUpperCase();var n=null;try{n=_dn&&_dn.of(c)}catch(e){}if(!n||n===c)n=CURN[c]||c;return n};
X.curL=function(c){c=String(c||(window.S&&S.cur)||'USD').toUpperCase();return X.curName(c)+' ('+c+')'};
/* compact: amount with tooltip + small label */
X.mC=function(u,c){var L=X.curL(c);return '<span title="'+L+'">'+money(u)+'</span> <small class="xcurl" style="opacity:.6;font-size:10px;white-space:nowrap">'+(S.cur||'USD')+'</small>'};
/* full: amount — Name (CODE) */
X.mF=function(u,c){return money(u)+' <span class="xcurl" style="opacity:.7;font-size:.8em;font-weight:400">— '+X.curL(c)+'</span>'};
X.mT=function(u,c){return money(u)+' — '+X.curL(c)};
/* rewrite currency <option>s everywhere */
function curOpt(o){if(o.dataset.cn)return;var t=o.textContent.trim(),m=/^([A-Z]{3})(?:\s*[\(\-–·].*)?$/.exec(t);if(!m)return;var c=m[1];if(!(CURN[c]||(window.S&&S.rates&&S.rates[c])))return;if(!o.hasAttribute('value'))o.setAttribute('value',o.value||c);o.textContent=X.curL(c);o.dataset.cn=1}
function curScan(r){(r.querySelectorAll?[].slice.call(r.querySelectorAll('option')):[]).forEach(curOpt)}
X.curScan=curScan;
try{new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.tagName==='OPTION')curOpt(n);else curScan(n)})})}).observe(document.documentElement,{childList:true,subtree:true});curScan(document)}catch(e){}
function q(s,r){return (r||document).querySelector(s)}function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
var _n=0;function id(p){_n++;return (p||'')+Date.now().toString(36).toUpperCase()+_n}
function D(t){return new Date(t).toLocaleString()}function Dd(t){return new Date(t).toLocaleDateString()}
function r2(v){return Math.round(v*100)/100}
function h(s){return esc(s==null?'':String(s))}
X.SX={q:q,qa:qa,id:id,D:D,Dd:Dd,r2:r2,h:h};
/* ---------- ALL COUNTRIES ---------- */
var MORE='Afghanistan,Albania,Algeria,Andorra,Angola,Antigua and Barbuda,Armenia,Azerbaijan,Bahamas,Barbados,Belarus,Belize,Benin,Bhutan,Bolivia,Bosnia and Herzegovina,Botswana,Brunei,Burkina Faso,Burundi,Cambodia,Cameroon,Cape Verde,Central African Republic,Chad,Comoros,Congo,Costa Rica,Cote d\'Ivoire,Cuba,Djibouti,Dominica,Dominican Republic,DR Congo,Ecuador,El Salvador,Equatorial Guinea,Eritrea,Eswatini,Ethiopia,Fiji,Gabon,Gambia,Georgia,Ghana,Grenada,Guatemala,Guinea,Guinea-Bissau,Guyana,Haiti,Honduras,Iran,Iraq,Jamaica,Jordan,Kazakhstan,Kiribati,Kosovo,Kyrgyzstan,Laos,Lebanon,Lesotho,Liberia,Libya,Macau SAR,Madagascar,Malawi,Maldives,Mali,Marshall Islands,Mauritania,Mauritius,Micronesia,Moldova,Monaco,Mongolia,Montenegro,Mozambique,Myanmar,Namibia,Nauru,Nicaragua,Niger,North Macedonia,Palau,Palestine,Panama,Papua New Guinea,Paraguay,Peru,Puerto Rico,Rwanda,Saint Kitts and Nevis,Saint Lucia,Saint Vincent and the Grenadines,Samoa,San Marino,Sao Tome and Principe,Senegal,Serbia,Seychelles,Sierra Leone,Solomon Islands,Somalia,South Sudan,Sudan,Suriname,Syria,Taiwan,Tajikistan,Tanzania,Timor-Leste,Togo,Tonga,Trinidad and Tobago,Tunisia,Turkmenistan,Tuvalu,Uganda,Ukraine,Uruguay,Uzbekistan,Vanuatu,Vatican City,Venezuela,Yemen,Zambia,Zimbabwe'.split(',');
try{MORE.forEach(function(c){if(ALLC.indexOf(c)<0)ALLC.push(c)})}catch(e){}
/* ---------- API LAYER (pluggable) ---------- */
var PROV={email:{n:'Email (SendGrid/Mailgun/SMTP relay)',f:['endpoint','key','from']},sms:{n:'SMS / OTP (Twilio etc.)',f:['endpoint','key','from']},payments:{n:'Card acquirer API (powers Sellora Pay)',f:['endpoint','key','secret']},payouts:{n:'Payout rails (Wise/Payoneer/bank API)',f:['endpoint','key']},fx:{n:'FX rates (openexchangerates etc.)',f:['endpoint','key']},kyc:{n:'KYC / ID verification (Onfido/Sumsub)',f:['endpoint','key']},llm:{n:'AI / LLM (OpenAI-compatible)',f:['endpoint','key','model']},shipping:{n:'Shipping labels/tracking (ShipStation/EasyPost)',f:['endpoint','key']}};
function ic(){return S.integrations=S.integrations||{}}
function live(){return false}
function post(k,path,body){var c=ic()[k];return fetch(c.endpoint.replace(/\/$/,'')+(path||''),{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify(body)}).then(function(r){return r.json()})}
function logApi(k,act,ok,info){(S.apiLog=S.apiLog||[]).unshift({k:k,act:act,mode:live(k)?'live':'test',ok:ok,info:info||'',at:Date.now()});S.apiLog.length=Math.min(S.apiLog.length,200)}
X.API={PROV:PROV,live:live,cfg:ic,
 email:function(to,subject,body,kind){var m={id:id('M'),ch:'email',to:to,subject:subject,body:body,kind:kind||'general',at:Date.now(),status:live('email')?'sent':'queued'};(S.outbox=S.outbox||[]).unshift(m);logApi('email','send '+(kind||''),1,to);if(live('email'))post('email','/send',{to:to,from:ic().email.from,subject:subject,text:body}).catch(function(){m.status='failed'});save();return Promise.resolve(m)},
 sms:function(to,text,kind){var m={id:id('M'),ch:'sms',to:to,subject:'SMS',body:text,kind:kind||'sms',at:Date.now(),status:live('sms')?'sent':'queued'};(S.outbox=S.outbox||[]).unshift(m);logApi('sms','send',1,to);if(live('sms'))post('sms','/messages',{to:to,body:text}).catch(function(){});save();return Promise.resolve(m)},
 otp:{_c:{},send:function(dest){var c=String(100000+((Date.now()/7|0)%900000));this._c[dest]=c;if(/@/.test(dest))X.API.email(dest,'Your verification code','Your Sellora code is '+c,'otp');else X.API.sms(dest,'Your Sellora code is '+c,'otp');return c},verify:function(dest,c){return this._c[dest]&&this._c[dest]===String(c).trim()}},
 fxRates:function(){return S.rates},
 fx:function(amt,from,to){var R=S.rates;if(!R[from]||!R[to])return amt;return r2(amt/R[from]*R[to])},
 refreshFx:function(){if(!live('fx')){logApi('fx','refresh',1,'using stored demo rates');toast('FX rates refreshed');return Promise.resolve(S.rates)}return fetch(ic().fx.endpoint+'?app_id='+ic().fx.key).then(function(r){return r.json()}).then(function(j){if(j.rates)Object.keys(S.rates).forEach(function(k){if(j.rates[k])S.rates[k]=j.rates[k]});save();return S.rates})},
 charge:function(o){logApi('payments','charge',0,o.amount+' '+o.cur);return Promise.resolve({ok:false,live:false,simulated:true,processor:'none',error:'No card processor is connected. Nothing was charged.'})},
 refund:function(){return Promise.resolve({ok:false,live:false,simulated:true,processor:'none',error:'No card processor is connected. Nothing was refunded.'})},
 payout:function(){return Promise.resolve({ok:false,live:false,simulated:true,processor:'none',error:'No payout provider is connected. Nothing was sent.'})},
 microDeposits:function(acct){var a=[0.11+((acct.length*7)%40)/100,0.09+((acct.length*13)%50)/100].map(r2);logApi('payouts','micro-deposits',1,a.join(','));return a},
 kycCheck:function(){return Promise.resolve({ok:false,live:false,error:'No identity provider is configured. Nothing was verified.'})},
 track:function(carrier,num){var u={DHL:'https://www.dhl.com/track?id=',FedEx:'https://www.fedex.com/fedextrack/?trknbr=',UPS:'https://www.ups.com/track?tracknum=',USPS:'https://tools.usps.com/go/TrackConfirmAction?tLabels=',TCS:'https://www.tcsexpress.com/track/',Leopards:'https://www.leopardscourier.com/tracking/'}[carrier];return u?u+encodeURIComponent(num):''},
 llm:function(prompt,sys){if(!live('llm'))return Promise.resolve(null);logApi('llm','complete',1,prompt.slice(0,40));var c=ic().llm;return fetch(c.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.key},body:JSON.stringify({model:c.model||'gpt-4o-mini',messages:[{role:'system',content:sys||'You are an ecommerce copywriter.'},{role:'user',content:prompt}]})}).then(function(r){return r.json()}).then(function(j){return j.choices&&j.choices[0].message.content||null}).catch(function(){return null})},
 app:function(appId,act){logApi('app:'+appId,act,0,'');return Promise.resolve({ok:false,live:false,simulated:true,error:'This app is not connected. Nothing was sent.'})}
};
/* clipboard fallback */
X.copyText=function(t){function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}try{if(navigator.clipboard)navigator.clipboard.writeText(t).catch(fb);else fb()}catch(e){fb()}toast('Copied')};
try{if(navigator.clipboard){var _w=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=function(t){return _w(t).catch(function(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()})}}}catch(e){}
/* ---------- MIGRATION ---------- */
function fixStr(o){if(typeof o==='string'){if(/[\u00c2-\u00f4][\u0080-\u20ff]/.test(o)){try{return decodeURIComponent(escape(o.replace(/[\u20ac\u2122\u2022\u2019\u201c\u201d\u2013\u2014\u0161\u017e]/g,function(c){var m={'\u20ac':'\x80','\u2122':'\x99','\u2022':'\x95','\u2019':'\x92','\u201c':'\x93','\u201d':'\x94','\u2013':'\x96','\u2014':'\x97','\u0161':'\x9a','\u017e':'\x9e'};return m[c]})))}catch(e){return o}}return o}if(Array.isArray(o))return o.map(fixStr);if(o&&typeof o==='object'){Object.keys(o).forEach(function(k){o[k]=fixStr(o[k])})}return o}
X.migrate=function(){if(!S)return;if((S.v30||0)<1){fixStr(S);S.v30=1}
 ['CAD','AUD','INR','SAR','JPY','CNY'].forEach(function(c,i){if(!S.rates[c]){S.rates[c]=[1.37,1.52,83.2,3.75,151,7.2][i];S.sym[c]=['CA$','A$','₹','SAR ','¥','CN¥'][i]}});
 S.products.forEach(function(p){p.vars=p.vars||[];p.opts=p.opts||[];p.imgs=p.imgs||[];p.tags=p.tags||[];p.sku=p.sku||('SKU-'+p.id);p.handle=p.handle||slugify(p.name);p.seo=p.seo||{}});
 S.cust=S.cust||[];
 S.orders.forEach(function(o){if(o.v30)return;o.v30=1;var p0=S.products.filter(function(p){return Math.abs(p.price-o.total)<.01})[0]||S.products[0];
  o.items=(o.items&&o.items.length?o.items:[{id:p0.id,q:1}]).map(function(it){var p=prod(it.id)||p0;return{pid:p.id,vi:-1,name:p.name,variant:'',sku:p.sku,price:+p.price,q:it.q||1,rq:0}});
  var sub=o.items.reduce(function(a,i){return a+i.price*i.q},0);o.sub=r2(sub);o.disc=0;o.shipAmt=r2(Math.max(0,o.total-sub));o.tax=0;o.refunded=0;o.cur=o.cur||'USD';o.at=o.at||Date.now()-86400000*(1004-o.id+1);
  o.pay=o.st==='Refunded'?'Refunded':'Paid';o.ful=o.st==='Fulfilled'?'Fulfilled':'Unfulfilled';o.fuls=o.fuls||[];o.tl=[{at:o.at,t:'Order placed'}];o.notes='';o.tags=[];
  var c=custByEmail(o.email)||custByName(o.who);if(!c){var nm=(o.who||'Guest').split(' ');c=addCust({first:nm[0],last:nm.slice(1).join(' '),email:o.email||(slugify(o.who||'guest')+'@example.com')})}o.cid=c.id;o.email=c.email;statusOf(o)});
 if(!S.disc2){S.disc2=[{id:'D1',code:'WELCOME10',title:'10% off first order',type:'percent',value:10,min:0,auto:false,limit:0,once:true,used:0,starts:'',ends:'',on:true},{id:'D2',code:'FREESHIP100',title:'Free shipping over $100',type:'freeship',value:0,min:100,auto:true,limit:0,used:0,starts:'',ends:'',on:true},{id:'D3',code:'BOGO',title:'Buy 2 get 1 free',type:'bogo',value:100,buy:2,get:1,min:0,auto:false,limit:100,used:0,starts:'',ends:'',on:true},{id:'D4',code:'SAVE5',title:'$5 off orders over $40',type:'fixed',value:5,min:40,auto:false,limit:50,used:0,starts:'',ends:'2027-12-31',on:true}]}
 if(!S.gc2)S.gc2=[{code:'GIFT-DEMO-50',init:50,bal:50,exp:'2027-12-31',cust:'',on:true}];
 if(!S.zones)S.zones=[{id:'Z1',name:'Domestic',countries:[S.country||'Pakistan'],rates:[{n:'Standard',p:2,days:'2-4 days'},{n:'Express',p:6,days:'1-2 days'}]},{id:'Z2',name:'North America',countries:['United States','Canada','Mexico'],rates:[{n:'Standard',p:12,days:'6-10 days',free:150},{n:'Express',p:28,days:'3-5 days'}]},{id:'Z3',name:'Europe & UK',countries:'Austria,Belgium,Bulgaria,Croatia,Cyprus,Czechia,Denmark,Estonia,Finland,France,Germany,Greece,Hungary,Ireland,Italy,Latvia,Lithuania,Luxembourg,Malta,Netherlands,Poland,Portugal,Romania,Slovakia,Slovenia,Spain,Sweden,Norway,Switzerland,United Kingdom,Iceland'.split(','),rates:[{n:'Standard',p:10,days:'5-8 days'},{n:'Express',p:24,days:'2-4 days'}]},{id:'Z4',name:'Gulf',countries:['United Arab Emirates','Saudi Arabia','Qatar','Bahrain','Oman','Kuwait'],rates:[{n:'Standard',p:8,days:'3-6 days'}]},{id:'Z5',name:'Rest of world',countries:['*'],rates:[{n:'International',p:18,days:'7-14 days'}]}];
 if(!S.pickup)S.pickup={on:true,fee:0,locs:[{name:'Shop location',addr:'Main Boulevard, Lahore',hours:'Usually ready in 2-4 hours'}]};
 if(!S.taxR)S.taxR={'Pakistan':17,'United States':7.25,'Canada':13,'United Kingdom':20,'Germany':19,'France':20,'India':18,'United Arab Emirates':5,'Saudi Arabia':15,'Australia':10,'Japan':10,'*':0,inc:false,ship:false};
 S.pages=S.pages||[{h:'about',t:'About us',b:'We make performance gear for drivers and track-day fans.'},{h:'faq',t:'FAQ',b:'Shipping takes 2-14 days depending on region. Returns accepted within 30 days.'},{h:'shipping',t:'Shipping policy',b:'We ship worldwide via tracked couriers.'},{h:'refund',t:'Refund policy',b:'30-day returns. Funds are held in Sellora Pay escrow until you confirm receipt.'}];
 (S.blogPosts||[]).forEach(function(b){b.body=b.body||('<p>'+h(b.title)+' — an article from the '+h(S.name)+' team.</p>');b.handle=b.handle||slugify(b.title)});
 S.outbox=S.outbox||[];S.stats=S.stats||{views:0,days:{}};S.staffPerm=S.staffPerm||{};S.carts=S.carts||[];
 if(S.integrations)Object.keys(S.integrations).forEach(function(k){var c=S.integrations[k];if(!c||typeof c!=='object')return;['key','secret','endpoint','token','password'].forEach(function(f){if(c[f])delete c[f]})});
 if(S.apps2)Object.keys(S.apps2).forEach(function(id){var a=S.apps2[id];if(!a)return;a.connected=false;if(a.token)delete a.token;var cfg=a.cfg||{};Object.keys(cfg).forEach(function(f){if(/token|secret|key|password/i.test(f))delete cfg[f]})});
};
function slugify(t){return String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}X.slugify=slugify;
/* ---------- CUSTOMERS ---------- */
function custByEmail(e){return e?S.cust.filter(function(c){return c.email.toLowerCase()===String(e).toLowerCase()})[0]:null}
function custByName(n){return S.cust.filter(function(c){return (c.first+' '+c.last).trim()===n})[0]}
function addCust(o){var c={id:id('C'),first:o.first||'',last:o.last||'',email:(o.email||'').trim(),phone:o.phone||'',tags:o.tags||[],addrs:o.addrs||[],note:o.note||'',mkt:!!o.mkt,pw:o.pw||'',created:Date.now()};S.cust.push(c);return c}
function hash(s){var h1=5381;for(var i=0;i<s.length;i++)h1=((h1<<5)+h1+s.charCodeAt(i))|0;return 'h'+(h1>>>0).toString(16)}
X.CU={byEmail:custByEmail,add:addCust,hash:hash,get:function(i){return S.cust.filter(function(c){return c.id===i})[0]},orders:function(c){return S.orders.filter(function(o){return o.cid===c.id})},name:function(c){return ((c.first||'')+' '+(c.last||'')).trim()||c.email}};
/* ---------- PRICING ENGINE ---------- */
function vprice(p,vi){var v=vi>-1&&p.vars[vi];return v&&v.price!==''&&v.price!=null?+v.price:+p.price}
function vstock(p,vi){var v=vi>-1&&p.vars[vi];if(v)return v.qty===''?0:+v.qty;if(p.vars.length)return p.vars.reduce(function(a,v){return a+(+v.qty||0)},0);return +p.stock||0}
function adjStock(p,vi,d){if(vi>-1&&p.vars[vi]){p.vars[vi].qty=Math.max(0,(+p.vars[vi].qty||0)+d);p.stock=vstock(p,-1)}else p.stock=Math.max(0,(+p.stock||0)+d)}
X.PR={vprice:vprice,vstock:vstock,adjStock:adjStock};
function zoneFor(c){return S.zones.filter(function(z){return z.countries.indexOf(c)>-1})[0]||S.zones.filter(function(z){return z.countries.indexOf('*')>-1})[0]}
function taxRate(c){var t=S.taxR;return t[c]!=null?+t[c]:(+t['*']||0)}
function discValid(d,sub,email){var n=Date.now();if(!d.on)return 'This code is not active.';if(d.starts&&new Date(d.starts)>n)return 'This code is not active yet.';if(d.ends&&new Date(d.ends+'T23:59:59')<n)return 'This code has expired.';if(d.limit&&d.used>=d.limit)return 'This code has reached its usage limit.';if(d.min&&sub<d.min)return 'Spend '+money(d.min)+' to use this code.';if(d.once&&email&&S.orders.some(function(o){return o.email===email&&(o.codes||[]).indexOf(d.code)>-1}))return 'You already used this code.';return ''}
/* cart: [{pid,vi,q}] ctx:{country,ship:'Standard'|'pickup',codes:[],gc:'',email} */
X.quote=function(cart,ctx){ctx=ctx||{};var lines=cart.map(function(c){var p=prod(c.pid);if(!p)return null;return{pid:p.id,vi:c.vi,name:p.name,variant:c.vi>-1&&p.vars[c.vi]?p.vars[c.vi].n:'',sku:(c.vi>-1&&p.vars[c.vi]&&p.vars[c.vi].sku)||p.sku,price:vprice(p,c.vi),q:c.q,rq:0}}).filter(Boolean);
 var sub=r2(lines.reduce(function(a,l){return a+l.price*l.q},0)),disc=0,applied=[],errs=[],freeShip=false;
 var codes=(ctx.codes||[]).map(function(c){return c.toUpperCase()});
 S.disc2.forEach(function(d){var use=d.auto?!discValid(d,sub,ctx.email):codes.indexOf(d.code.toUpperCase())>-1;if(!use)return;var e=discValid(d,sub,ctx.email);if(e){errs.push(d.code+': '+e);return}
  var a=0;if(d.type==='percent')a=sub*d.value/100;else if(d.type==='fixed')a=Math.min(sub,+d.value);else if(d.type==='freeship')freeShip=true;else if(d.type==='bogo'){var units=[];lines.forEach(function(l){for(var i=0;i<l.q;i++)units.push(l.price)});units.sort(function(a,b){return a-b});var grp=(+d.buy||1)+(+d.get||1),free=Math.floor(units.length/grp)*(+d.get||1);for(var i=0;i<free;i++)a+=units[i]*(d.value||100)/100}
  a=r2(Math.min(a,sub-disc));applied.push({code:d.code,title:d.title,amt:a,type:d.type});disc+=a});
 codes.forEach(function(c){if(!S.disc2.some(function(d){return d.code.toUpperCase()===c})&&!S.gc2.some(function(g){return g.code===c}))errs.push(c+': code not found.')});
 var opts=[],z=zoneFor(ctx.country||S.country);if(z)z.rates.forEach(function(r){opts.push({n:r.n,p:(freeShip||(r.free&&sub>=r.free))?0:+r.p,days:r.days})});if(S.pickup.on)S.pickup.locs.forEach(function(l){opts.push({n:'Pickup: '+l.name,p:+S.pickup.fee||0,days:l.hours,pickup:true})});
 var sel=opts.filter(function(o){return o.n===ctx.ship})[0]||opts[0]||{n:'None',p:0},ship=sel.p,rate=taxRate(sel.pickup?S.country:(ctx.country||S.country)),base=sub-disc+(S.taxR.ship?ship:0),tax=S.taxR.inc?r2(base-base/(1+rate/100)):r2(base*rate/100);
 var total=r2(sub-disc+ship+(S.taxR.inc?0:tax)),gc=null,gcAmt=0;var gcode=(ctx.gc||'').toUpperCase()||codes.filter(function(c){return S.gc2.some(function(g){return g.code===c})})[0];
 if(gcode){gc=S.gc2.filter(function(g){return g.code===gcode})[0];if(!gc)errs.push('Gift card not found.');else if(!gc.on||gc.bal<=0)errs.push('Gift card has no balance.');else if(gc.exp&&new Date(gc.exp)<Date.now())errs.push('Gift card expired.');else gcAmt=r2(Math.min(gc.bal,total))}
 return{lines:lines,sub:sub,disc:r2(disc),applied:applied,errs:errs,shipOpts:opts,ship:sel,shipAmt:ship,taxRate:rate,tax:tax,total:total,gc:gcAmt?gc.code:'',gcAmt:gcAmt,due:r2(total-gcAmt)}};
/* ---------- ORDERS ---------- */
function statusOf(o){o.st=o.cancelled?'Cancelled':o.pay==='Refunded'?'Refunded':o.ful==='Fulfilled'?'Fulfilled':o.pay==='Partially refunded'?'Partially refunded':'Paid';return o.st}
function tl(o,t){(o.tl=o.tl||[]).push({at:Date.now(),t:t})}
X.ORD={statusOf:statusOf,tl:tl,get:function(i){return S.orders.filter(function(o){return String(o.id)===String(i)})[0]},
 place:function(cart,ctx,pay){var Q=X.quote(cart,ctx),c=custByEmail(ctx.email);if(!c)c=addCust({first:ctx.first,last:ctx.last,email:ctx.email,phone:ctx.phone,mkt:ctx.mkt});if(ctx.addr&&!c.addrs.some(function(a){return JSON.stringify(a)===JSON.stringify(ctx.addr)}))c.addrs.push(ctx.addr);
  var o={id:S.oid++,v30:1,who:X.CU.name(c),email:c.email,cid:c.id,items:Q.lines,sub:Q.sub,disc:Q.disc,codes:Q.applied.map(function(a){return a.code}),gc:Q.gc,gcAmt:Q.gcAmt,shipAmt:Q.shipAmt,shipM:Q.ship.n,tax:Q.tax,taxRate:Q.taxRate,total:Q.total,refunded:0,cur:ctx.cur||'USD',fxRate:S.rates[ctx.cur||'USD']||1,gw:pay.method||'Sellora Pay',charge:pay.id,at:Date.now(),pay:'Paid',ful:'Unfulfilled',fuls:[],tl:[],notes:ctx.note||'',tags:[],ship:{country:ctx.country,vals:ctx.vals||{},addr:ctx.addr},market:ctx.cur};
  o.items.forEach(function(l){var p=prod(l.pid);if(p)adjStock(p,l.vi,-l.q)});
  Q.applied.forEach(function(a){var d=S.disc2.filter(function(x){return x.code===a.code})[0];if(d)d.used++});
  if(Q.gc){var g=S.gc2.filter(function(x){return x.code===Q.gc})[0];g.bal=r2(g.bal-Q.gcAmt)}
  tl(o,'Order placed by '+o.who+' · paid '+money(o.total)+' via '+o.gw+(o.cur!=='USD'?' (charged in '+o.cur+')':''));statusOf(o);S.orders.push(o);
  S.carts=S.carts.filter(function(a){return a.email!==c.email});
  if(X.PAY&&pay.escrow!==false)X.PAY.onOrder(o,ctx);
  X.API.email(o.email,'Order #'+o.id+' confirmed','Hi '+(c.first||'')+',\nThanks for your order #'+o.id+'.\n'+o.items.map(function(l){return l.q+' × '+l.name+(l.variant?' ('+l.variant+')':'')+' — '+money(l.price*l.q)}).join('\n')+'\nTotal: '+money(o.total)+'\n'+(X.PAY?'Your payment is held safely in Sellora Pay escrow until you confirm delivery.':''),'order_confirmation');
  (X.HOOKS||[]).forEach(function(f){try{f('order',o)}catch(e){}});save();return o},
 fulfill:function(o,qtys,carrier,num,notify){var items=[];o.items.forEach(function(l,i){var n=Math.min(+qtys[i]||0,l.q-(l.fq||0)-(l.rq||0));if(n>0){l.fq=(l.fq||0)+n;items.push({i:i,q:n})}});if(!items.length)return toast('Nothing to fulfil'),false;
  var f={id:id('F'),at:Date.now(),carrier:carrier,num:num,url:X.API.track(carrier,num),items:items};o.fuls.push(f);var rem=o.items.some(function(l){return (l.fq||0)+(l.rq||0)<l.q});o.ful=rem?'Partially fulfilled':'Fulfilled';tl(o,'Fulfilled '+items.reduce(function(a,b){return a+b.q},0)+' item(s)'+(num?' · '+carrier+' '+num:''));statusOf(o);
  if(notify)X.API.email(o.email,'Your order #'+o.id+' is on the way','Carrier: '+carrier+'\nTracking: '+num+'\n'+(f.url||''),'shipping_confirmation');if(X.PAY)X.PAY.onShip(o);save();return true},
 refund:function(o,qtys,restock,shipRef,amount,reason){var max=r2(o.total-o.refunded);amount=r2(Math.min(+amount||0,max));if(amount<=0)return toast('Enter an amount to refund'),false;
  o.items.forEach(function(l,i){var n=Math.min(+qtys[i]||0,l.q-(l.rq||0));if(n>0){l.rq=(l.rq||0)+n;if(restock){var p=prod(l.pid);if(p)adjStock(p,l.vi,n)}}});
  o.refunded=r2(o.refunded+amount);o.pay=o.refunded>=o.total-0.001?'Refunded':'Partially refunded';(o.refunds=o.refunds||[]).push({at:Date.now(),amt:amount,reason:reason||'',restock:!!restock});
  tl(o,'Refunded '+money(amount)+(restock?' · items restocked':'')+(reason?' · '+reason:''));X.API.refund(o.charge,amount);if(X.PAY)X.PAY.onRefund(o,amount);statusOf(o);
  X.API.email(o.email,'Refund for order #'+o.id,'We refunded '+money(amount)+' to your original payment method.','refund');save();return true},
 cancel:function(o,restock,reason){if(o.cancelled)return;var rem=r2(o.total-o.refunded);if(rem>0)X.ORD.refund(o,o.items.map(function(l){return l.q-(l.rq||0)}),restock,true,rem,reason||'Order cancelled');o.cancelled=Date.now();tl(o,'Order cancelled'+(reason?': '+reason:''));statusOf(o);X.API.email(o.email,'Order #'+o.id+' cancelled','Your order was cancelled and refunded.','cancel');save()}
};
})();
