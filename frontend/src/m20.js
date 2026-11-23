/* ===== v44: Finance like Shopify's, "Switch to VendOm Payments", VendOm Payments account unlocks the VendOm+ tools ===== */
(function(){
var X=window,q=X.SX.q,h=X.SX.h,A=X.ACT;
function money(n,c){try{return new Intl.NumberFormat(undefined,{style:'currency',currency:c||S.cur||'USD'}).format(+n||0)}catch(e){return (c||'')+' '+(+n||0).toFixed(2)}}

/* the VendOm+ tools, now part of a VendOm Payments account */
var TOOLS=[['plus-whatsapp','WhatsApp ordering','Take orders in WhatsApp with a share link and catalogue.','chat'],['plus-cod','COD verification','Confirm cash-on-delivery buyers before you ship.','check'],['plus-wholesale','Wholesale & RFQ','Bulk price tiers and quote requests.','box'],['plus-oem','Custom / OEM builder','Let buyers design made-to-order products.','tool'],['plus-couriers','Pakistan couriers','Book TCS, Leopards, PostEx and more.','truck'],['plus-export','Export documents','Invoices and packing lists for shipping abroad.','doc'],['plus-pricing','Currency pricing','Show prices in each buyer’s currency.','coin'],['plus-protection','Buyer protection','Show the protection badge at checkout.','shield'],['plus-live','Video & live selling','Sell during live videos.','video'],['plus-workshops','Workshops & materials','Track job work sent to workshops.','tool'],['plus-compliance','Compliance & samples','Sample requests and certificates.','doc'],['plus-affiliates','Resellers & affiliates','Partner codes and commissions.','users'],['plus-bank','Bank transfers','Match bank payments to orders.','bank'],['plus-ai','AI listings','Create a product from one photo.','spark'],['plus-language','Language & RTL','Urdu and Arabic admin and store.','globe']];
var IC={chat:'<path d="M4 5h16v11H8l-4 4z"/>',check:'<path d="M5 12l4 4 10-10"/>',box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',tool:'<path d="M14 6a4 4 0 0 0 5 5l-8 8-3-3z"/>',truck:'<path d="M2 6h11v10H2zM13 10h5l3 3v3h-8"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M9 12h6M9 16h6"/>',coin:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"/>',shield:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M21 20c0-2-1-4-3-5"/>',bank:'<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',chev:'<path d="M9 6l6 6-6 6"/>'};
function ic(k,s){return '<svg viewBox="0 0 24 24" width="'+(s||18)+'" height="'+(s||18)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[k]||'')+'</svg>'}
function acct(){return S.vpay&&S.vpay.active?S.vpay:null}
X.vpayAccount=acct;X.VPAY_TOOLS=TOOLS;

/* ---------- menu: Finance has Payouts only; no VendOm+ group ---------- */
function tidyNav(){try{var NC=X.NAV_CONFIG||[];for(var i=NC.length-1;i>=0;i--){var n=NC[i];if(n.id==='--'&&n.label==='VendOm+')NC.splice(i,1);else if(n.id==='vendom-pay'){n.admin=1;n.label='VendOm Pay (platform)'}}}catch(e){}try{var f=(X.NAV_CONFIG||[]).filter(function(n){return n.id==='finance'})[0];if(f&&f.sub)f.sub=f.sub.filter(function(s){return s.id!=='finance-billing'})}catch(e){}}
tidyNav();
X.onRoute(function(r){tidyNav();var m=q('#m9nav');if(m)m.remove();
 if(/^plus-/.test(r)){var h1=q('#main h1');if(h1&&!q('#vp-back')){var a=document.createElement('a');a.id='vp-back';a.href='#s-payments';a.className='vp-back';a.innerHTML='← VendOm Payments';h1.parentNode.insertBefore(a,h1)}}});

/* ---------- Finance (like Shopify's) ---------- */
function balances(){var w=X.PAY&&X.PAY.sellerW?X.PAY.sellerW():null,cur=S.cur||'USD',main=w?(+w.available||0)+(+w.pending||0):0;
 var list=[cur].concat(['USD','EUR','GBP','AED'].filter(function(c){return c!==cur})).slice(0,4);
 return {main:main,cur:cur,list:list.map(function(c){return [c,c===cur?main:0]})}}
function taxRegions(){var t=S.taxes||S.taxRegions||[];var n=Array.isArray(t)?t.length:Object.keys(t||{}).length;return n||1}
V.finance=function(){var b=balances(),a=acct(),fl={USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',AED:'🇦🇪',PKR:'🇵🇰',AUD:'🇦🇺',CAD:'🇨🇦',INR:'🇮🇳',SAR:'🇸🇦'};
 return '<div class="fin20"><div class="fin20-main"><div class="fin20-top"><h1>Finance</h1><div class="fin20-doc"><button class="btn" id="fin20-docs" data-x="fin20docs">Documents ▾</button><div class="fin20-menu" id="fin20-menu" hidden><a data-x="go:finance-payouts">Payout statements</a><a data-x="fin20csv">Sales summary (CSV)</a><a data-x="go:s-billing">Bills from VendOm</a></div></div></div>'
  +'<h2 class="fin20-h">Payout balance <span title="Money from your sales that VendOm Payments will send to your bank.">'+ic('info',16)+'</span></h2>'
  +'<div class="fin20-card fin20-bal"><div><b id="fin20-total">'+money(b.main,b.cur)+'</b><a data-x="go:finance-payouts" class="fin20-link">View payouts</a></div><div class="fin20-curs">'+b.list.map(function(c){return '<div class="fin20-cur"><span>'+(fl[c[0]]||'')+' '+c[0]+'</span><b>'+money(c[1],c[0])+'</b></div>'}).join('')+'</div></div>'
  +(a?'<div class="fin20-card fin20-promo" id="fin20-promo"><h3>VendOm Payments is on</h3><p>Your payments, payouts and VendOm Payments tools are in Settings › Payments.</p><button class="btn" data-x="go:s-payments">Manage VendOm Payments</button></div>'
   :'<div class="fin20-card fin20-promo" id="fin20-promo"><div class="fin20-pbody"><h3>Manage your business finances in VendOm</h3><p>Switch to VendOm Payments to get paid faster and offer a better checkout experience.</p><button class="btn" id="fin20-switch" data-x="go:s-payments">Switch to VendOm Payments</button></div><div class="fin20-pfoot">'+ic('info',16)+' Changing payment providers may briefly pause sales while you switch.</div></div>')
  +'<p class="fin20-learn">Learn more about <a data-x="go:s-payments">VendOm Finance</a></p></div>'
  +'<div class="fin20-side"><h3>Taxes</h3><a class="fin20-row" data-x="go:s-taxes">Collecting in '+taxRegions()+' region'+(taxRegions()===1?'':'s')+' '+ic('chev',16)+'</a></div></div>'};
A.fin20docs=function(){var m=q('#fin20-menu');if(m)m.hidden=!m.hidden};
A.fin20csv=function(){var rows=[['Order','Date','Total','Payment']].concat((S.orders||[]).map(function(o){return [o.id,new Date(o.at||o.date||Date.now()).toISOString().slice(0,10),o.total,o.pay||'']}));var csv=rows.map(function(r){return r.map(function(x){return '"'+String(x).replace(/"/g,'""')+'"'}).join(',')}).join('\n');var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='sales-summary.csv';a.click()};

/* ---------- Settings › Payments: VendOm Payments account + tools ---------- */
function panel(){var a=acct();
 if(!a)return '<div class="panel vp20" id="vp20"><div class="vp20-head">'+X.VENDOM_LOGO_MARK()+'<div><h3>VendOm Payments</h3><p class="mu">Accept cards, wallets, bank transfers and cash on delivery, get paid to your bank, and unlock VendOm’s selling tools: WhatsApp ordering, COD checks, couriers, wholesale and more.</p></div></div>'
  +'<button class="btn pri" id="vp20-create" data-x="vp20create">Create VendOm Payments account</button><span class="xk" style="margin-left:8px">Free. Takes about 2 minutes.</span>'
  +'<div class="vp20-tools vp20-locked">'+TOOLS.map(function(t){return '<div class="vp20-tool" title="Create your account to use this">'+ic(t[3])+'<div><b>'+h(t[1])+'</b><span>'+h(t[2])+'</span></div></div>'}).join('')+'</div></div>';
 var k=X.PAY&&X.PAY.kyc?X.PAY.kyc():{st:'Not started'};
 return '<div class="panel vp20" id="vp20"><div class="vp20-head">'+X.VENDOM_LOGO_MARK()+'<div><h3>VendOm Payments <span class="vp20-pill">Active</span></h3><p class="mu">'+h(a.biz)+' · '+h(a.country)+' · opened '+new Date(a.at).toLocaleDateString()+'</p></div></div>'
  +(k.st==='Approved'?'':'<div class="vp20-note">'+ic('info',16)+' <span>To receive payouts, verify your business and add your bank account.</span> <button class="btn" data-x="go:pay-onboarding">Verify business</button></div>')
  +'<h4 class="vp20-sub">Your VendOm Payments tools</h4><div class="vp20-tools">'+TOOLS.map(function(t){return '<a class="vp20-tool" data-x="go:'+t[0]+'" data-vtool="'+t[0]+'">'+ic(t[3])+'<div><b>'+h(t[1])+'</b><span>'+h(t[2])+'</span></div></a>'}).join('')+'</div>'
  +'<p style="margin:12px 0 0"><button class="btn" data-x="go:vendom-pay">Open wallet</button> <button class="btn" data-x="go:finance-payouts">Payouts</button> <button class="btn" data-x="go:pay-embed">Payment links</button> <button class="btn" data-x="go:pay-onboarding">Business verification</button></p></div>'}
X.VENDOM_LOGO_MARK=function(){return '<svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true"><circle cx="32" cy="17" r="10" fill="none" stroke="#5DB346" stroke-width="5"/><path d="M10 24h44l-3.2 31a5 5 0 0 1-5 4.5H18.2a5 5 0 0 1-5-4.5z" fill="#0E3B2E"/><path d="M22 32l10 18 10-18" stroke="#FFFFFF" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
var P1=V.payments;V.payments=function(){var s=P1();var i=s.indexOf('<div class="panel">');return i>-1?s.slice(0,i)+panel()+s.slice(i):s+panel()};

var COUNTRIES=function(){try{return (X.ALL_COUNTRIES||[]).length?X.ALL_COUNTRIES:null}catch(e){return null}};
A.vp20create=function(){var c=S.country||'Pakistan',k=X.PAY&&X.PAY.kyc?X.PAY.kyc():null,b=(k&&k.biz)||{};
 X.xmodal('Create your VendOm Payments account','<div class="xf vp20-form"><label for="vp-biz">Business or store name</label><input class="xin" id="vp-biz" value="'+h(b.name&&b.name!=='My Store'?b.name:(S.name&&S.name!=='My Store'?S.name:''))+'">'
  +'<label for="vp-owner">Your full name</label><input class="xin" id="vp-owner" value="'+h(b.owner||'')+'" autocomplete="name">'
  +'<label for="vp-type">Business type</label><select class="xin" id="vp-type"><option>Individual / sole proprietor</option><option>Partnership</option><option>Private limited company</option><option>Other company</option></select>'
  +'<label for="vp-country">Country</label><input class="xin" id="vp-country" value="'+h(b.country||c)+'">'
  +'<label for="vp-phone">Mobile / WhatsApp number</label><input class="xin" id="vp-phone" type="tel" placeholder="+92 300 1234567" value="'+h(b.phone||'')+'" autocomplete="tel">'
  +'<label for="vp-email">Email for payment updates</label><input class="xin" id="vp-email" type="email" value="'+h(b.email||S.email||'')+'" autocomplete="email">'
  +'<label class="xchk" style="margin-top:10px"><input type="checkbox" id="vp-terms"> I agree to the VendOm Payments terms and confirm the details are correct</label><p id="vp-err" style="color:#b42318;min-height:18px;margin:6px 0 0"></p></div>','Create account',function(){
  var g=function(id){return ((q('#'+id)||{}).value||'').trim()},e=q('#vp-err'),biz=g('vp-biz'),own=g('vp-owner'),ph=g('vp-phone').replace(/[\s-]/g,''),em=g('vp-email'),co=g('vp-country');
  var bad=!biz?'Enter your business or store name':!own?'Enter your full name':!co?'Enter your country':!/^\+?\d{9,15}$/.test(ph)?'Enter a valid mobile number, e.g. +923001234567':!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)?'Enter a valid email':!(q('#vp-terms')||{}).checked?'Tick the box to agree to the terms':'';
  if(bad){if(e)e.textContent=bad;return false}
  S.vpay={active:true,at:Date.now(),biz:biz,owner:own,type:g('vp-type'),country:co,phone:ph,email:em};
  if(k){k.biz=Object.assign({},k.biz||{},{name:biz,owner:own,type:g('vp-type'),country:co,phone:ph,email:em});(k.log=k.log||[]).push({t:'VendOm Payments account created',at:Date.now()})}
  S.plus=S.plus||{};S.plus.cfg=S.plus.cfg||{};if(!S.plus.cfg.wa)S.plus.cfg.wa=ph; // WhatsApp ordering starts with this number
  try{X.API.email(em,'Your VendOm Payments account is ready','Hi '+own+',\n\nYour VendOm Payments account for '+biz+' is open. You can now use WhatsApp ordering, COD verification, couriers, wholesale and the other VendOm Payments tools.\n\nTo receive payouts, verify your business and add your bank account in Settings > Payments.\n\nVendOm','vpay_welcome')}catch(x){}
  save();toast('VendOm Payments account created');setTimeout(route,0)})};

/* the tools need an account */
TOOLS.forEach(function(t){var f=V[t[0]];if(!f)return;V[t[0]]=function(){if(acct())return f.apply(this,arguments);
 return '<div class="xw"><div class="xh"><h1>'+h(t[1])+'</h1></div><div class="xc vp20-gate">'+ic(t[3],28)+'<h3>'+h(t[1])+' is part of VendOm Payments</h3><p class="mu">'+h(t[2])+' Create a free VendOm Payments account to use it.</p><button class="btn pri" data-x="go:s-payments">Set up VendOm Payments</button></div></div>'}});

/* ---------- styles ---------- */
var css=document.createElement('style');css.id='m20css';css.textContent=[
'.fin20{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:32px;max-width:1180px;margin:0 auto;padding:8px 8px 40px}',
'.fin20-top{display:flex;align-items:center;justify-content:space-between;margin:8px 0 22px}.fin20-top h1{font-size:26px;margin:0}',
'.fin20-doc{position:relative}.fin20-menu{position:absolute;right:0;top:110%;background:#fff;border:1px solid #E3E3E3;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px;min-width:200px;z-index:20}.fin20-menu a{display:block;padding:8px 10px;border-radius:7px;cursor:pointer;color:#1A1A1A;font-size:13px}.fin20-menu a:hover{background:rgba(0,0,0,.06)}',
'.fin20-h{font-size:16px;font-weight:650;margin:0 0 10px;display:flex;align-items:center;gap:6px}.fin20-h span{color:#616161;display:inline-flex}',
'.fin20-card{background:#fff;border:1px solid #E3E3E3;border-radius:14px;margin-bottom:16px;overflow:hidden}',
'.fin20-bal{display:grid;grid-template-columns:200px minmax(0,1fr);gap:16px;padding:18px 18px}.fin20-bal>div:first-child{display:flex;flex-direction:column;justify-content:space-between;gap:24px}.fin20-bal b#fin20-total{font-size:19px}',
'.fin20-link{color:#005BD3;cursor:pointer;font-size:14px}.fin20-link:hover{text-decoration:underline}',
'.fin20-curs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.fin20-cur{background:#F7F7F7;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:20px;font-size:13px}.fin20-cur b{font-size:14px}',
'.fin20-pbody{padding:44px 24px 30px;text-align:center}.fin20-promo h3{margin:0 0 6px;font-size:17px}.fin20-promo p{margin:0 0 16px;color:#303030}.fin20-promo>h3,.fin20-promo>p,.fin20-promo>button{margin-left:22px;margin-right:22px}.fin20-promo>h3{margin-top:20px}.fin20-promo>button{margin-bottom:20px}',
'.fin20-pbody .btn{background:#E3E3E3!important;border:0!important;color:#1A1A1A!important;font-weight:600}.fin20-pbody .btn:hover{background:#D4D4D4!important}',
'.fin20-pfoot{background:#F7F7F7;border-top:1px solid #EBEBEB;padding:14px;text-align:center;color:#616161;font-size:13px;display:flex;justify-content:center;align-items:center;gap:6px}',
'.fin20-learn{color:#303030;font-size:14px;margin:8px 0 0 20px}.fin20-learn a{text-decoration:underline;cursor:pointer;color:inherit}',
'.fin20-side{padding-top:64px}.fin20-side h3{font-size:14px;margin:0 0 12px}.fin20-row{display:flex;justify-content:space-between;align-items:center;color:#005BD3;cursor:pointer;font-size:14px;padding:4px 0}',
'@media (max-width:900px){.fin20{grid-template-columns:1fr;gap:0}.fin20-side{padding-top:0}.fin20-bal{grid-template-columns:1fr}.fin20-curs{grid-template-columns:repeat(2,minmax(0,1fr))}}',
'.vp20{border:1px solid #E3E3E3}.vp20-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}.vp20-head h3{margin:0 0 4px;display:flex;align-items:center;gap:8px}.vp20-head p{margin:0}',
'.vp20-pill{background:#CDFEE1;color:#0C5132;border-radius:8px;padding:2px 8px;font-size:12px;font-weight:600}',
'.vp20-note{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#FFF5EA;border:1px solid #FFD6A4;border-radius:10px;padding:10px 12px;margin:0 0 12px;font-size:13px}',
'.vp20-sub{margin:14px 0 8px;font-size:14px}',
'.vp20-tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin-top:12px}.vp20-tool{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid #EBEBEB;border-radius:10px;background:#fff;color:#1A1A1A;cursor:pointer;text-decoration:none}.vp20-tool svg{flex:none;color:#0E3B2E;margin-top:2px}.vp20-tool b{display:block;font-size:13px}.vp20-tool span{display:block;font-size:12px;color:#616161;margin-top:2px}',
'a.vp20-tool:hover{background:rgba(0,0,0,.04);border-color:#D4D4D4}.vp20-locked .vp20-tool{opacity:.55;cursor:default}',
'.vp20-gate{text-align:center;padding:40px 20px}.vp20-gate svg{color:#0E3B2E}.vp20-gate h3{margin:10px 0 6px}',
'.vp-back{display:inline-block;color:#005BD3;font-size:13px;margin:0 0 6px;text-decoration:none}.vp-back:hover{text-decoration:underline}',
'.vp20-form label{display:block;margin-top:8px}','#m9nav{display:none!important}'
].join('');document.head.appendChild(css);
})();
