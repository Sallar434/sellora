/* ===== v56: New customer page like the owner's Shopify guide (overview, language, phone with country code,
   email/SMS/WhatsApp consent, default address, tax details, notes, tags, save bar). Pop-ups close when the page changes. ===== */
(function(){
var X=window,q=X.SX.q,qa=X.SX.qa,h=X.SX.h,A=X.ACT,U=X.S23;
var ic=U.ic,card=U.card;
function sv(){try{save()}catch(e){}}
function tst(m){try{toast(m)}catch(e){}}
var DIAL={'Pakistan':'+92','United States':'+1','United Kingdom':'+44','United Arab Emirates':'+971','Saudi Arabia':'+966','India':'+91','Canada':'+1','Australia':'+61','Germany':'+49','France':'+33','Italy':'+39','Spain':'+34','Netherlands':'+31','Turkey':'+90','Qatar':'+974','Kuwait':'+965','Bahrain':'+973','Oman':'+968','Bangladesh':'+880','Malaysia':'+60','Singapore':'+65','China':'+86','Japan':'+81','South Africa':'+27','Egypt':'+20','Nigeria':'+234','Kenya':'+254','Sri Lanka':'+94','Ireland':'+353','Sweden':'+46','Norway':'+47','Denmark':'+45','Poland':'+48','Brazil':'+55','Mexico':'+52'};
function countries(){try{return U.countries().slice().sort()}catch(e){return Object.keys(DIAL).sort()}}
function langs(){try{var o=(S.set&&S.set.langs)||{},L=(o.langs||[{name:'English',code:'en'}]).filter(function(l){return l.pub!==false});return {L:L.length?L:[{name:'English',code:'en'}],def:o.def||'en'}}catch(e){return {L:[{name:'English',code:'en'}],def:'en'}}}

/* close pop-ups when the page changes (not when the same page redraws) */
addEventListener('hashchange',function(){var m=q('#modal');if(m&&getComputedStyle(m).display!=='none'&&typeof closeM==='function'){try{closeM()}catch(e){}}});

/* Add customer → full page */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#main button,#main a');if(!b||!/^#customers$/.test(location.hash))return;if(/^\s*Add customer\s*$/.test(b.textContent)){e.preventDefault();e.stopPropagation();X._cu33=null;location.hash='customers-new'}},true);

function draft(){if(X._cu33)return X._cu33;var lg=langs();X._cu33={first:'',last:'',lang:lg.def,email:'',dial:DIAL[S.country]||'+92',phone:'',mEmail:false,mSms:false,mWa:false,addr:{country:S.country||'Pakistan',first:'',last:'',company:'',a1:'',a2:'',city:'',zip:'',phone:''},tax:'collect',note:'',tags:[],dirty:false};return X._cu33}
function inp(k,lbl,v,type,ph){return '<div class="cu33f"><label class="s23lb" for="cu33-'+k+'">'+lbl+'</label><input class="s23in" id="cu33-'+k+'" data-cu33="'+k+'" type="'+(type||'text')+'" value="'+h(v||'')+'"'+(ph?' placeholder="'+h(ph)+'"':'')+'></div>'}
V['customers-new']=function(){var d=draft(),lg=langs(),a=d.addr,dials=Object.keys(DIAL).sort();
 var cb=function(k,t){return '<label class="d25r cu33m"><input type="checkbox" data-cu33c="'+k+'"'+(d[k]?' checked':'')+'> '+t+'</label>'};
 return '<div class="s23w"><div class="s23unsaved" id="cu33ub"><span>Unsaved customer</span><button data-x="cu33dis">Discard</button><button class="on" data-x="cu33save" id="cu33sv">Save</button></div>'
  +'<div class="s23top"><button class="s23back" data-x="go:customers" aria-label="Back to customers">'+ic('back')+'</button><span class="s23crumb">'+ic('user',14)+' <a data-x="go:customers">Customers</a></span></div>'
  +'<h1 class="cu33h1">New customer</h1><p class="pf-err" id="cu33err" role="alert"></p>'
  +'<div class="cu33grid"><div class="cu33main">'
  +'<h3 class="cu33st">Customer overview</h3><section class="s23c cu33c">'+inp('first','First name',d.first)+inp('last','Last name',d.last)
  +'<div class="cu33f"><label class="s23lb" for="cu33-lang">Language</label><select class="s23in" id="cu33-lang" data-cu33="lang">'+lg.L.map(function(l){return '<option value="'+h(l.code)+'"'+(l.code===d.lang?' selected':'')+'>'+h(l.name)+(l.code===lg.def?' [Default]':'')+'</option>'}).join('')+'</select><p class="s23sm">This customer will receive notifications in this language.</p></div>'
  +inp('email','Email',d.email,'email')
  +'<div class="cu33f"><label class="s23lb" for="cu33-phone">Phone number</label><div class="cu33ph"><select class="s23in" id="cu33-dial" data-cu33="dial" aria-label="Country code">'+dials.map(function(c){return '<option value="'+DIAL[c]+'"'+(DIAL[c]===d.dial&&c===(Object.keys(DIAL).filter(function(x){return DIAL[x]===d.dial})[0])?' selected':'')+'>'+h(c)+' ('+DIAL[c]+')</option>'}).join('')+'</select><input class="s23in" id="cu33-phone" data-cu33="phone" type="tel" value="'+h(d.phone)+'"></div></div>'
  +cb('mEmail','Customer agreed to receive marketing emails.')+cb('mSms','Customer agreed to receive SMS marketing text messages.')+cb('mWa','Customer agreed to receive WhatsApp marketing messages.')
  +'<p class="cu33note">You should ask your customers for permission before you subscribe them to your marketing emails, SMS, or WhatsApp messages.</p></section>'
  +'<h3 class="cu33st">Default address</h3><p class="s23sm" style="margin-top:-4px">The primary address of this customer</p><section class="s23c cu33c"><div class="cu33f"><label class="s23lb" for="cu33-a-country">Country/region</label><select class="s23in" id="cu33-a-country" data-cu33a="country">'+countries().map(function(c){return '<option'+(c===a.country?' selected':'')+'>'+h(c)+'</option>'}).join('')+'</select></div>'
  +'<div class="cu33two">'+['first:First name','last:Last name'].map(function(x){var p=x.split(':');return '<div class="cu33f"><label class="s23lb" for="cu33-a-'+p[0]+'">'+p[1]+'</label><input class="s23in" id="cu33-a-'+p[0]+'" data-cu33a="'+p[0]+'" value="'+h(a[p[0]])+'"></div>'}).join('')+'</div>'
  +['company:Company','a1:Address','a2:Apartment, suite, etc'].map(function(x){var p=x.split(':');return '<div class="cu33f"><label class="s23lb" for="cu33-a-'+p[0]+'">'+p[1]+'</label><input class="s23in" id="cu33-a-'+p[0]+'" data-cu33a="'+p[0]+'" value="'+h(a[p[0]])+'"></div>'}).join('')
  +'<div class="cu33two">'+['city:City','zip:Postal code'].map(function(x){var p=x.split(':');return '<div class="cu33f"><label class="s23lb" for="cu33-a-'+p[0]+'">'+p[1]+'</label><input class="s23in" id="cu33-a-'+p[0]+'" data-cu33a="'+p[0]+'" value="'+h(a[p[0]])+'"></div>'}).join('')+'</div>'
  +'<div class="cu33f"><label class="s23lb" for="cu33-a-phone">Phone</label><input class="s23in" id="cu33-a-phone" data-cu33a="phone" type="tel" value="'+h(a.phone)+'"></div></section>'
  +'<h3 class="cu33st">Tax details</h3><section class="s23c cu33c"><div class="cu33f"><label class="s23lb" for="cu33-tax">Tax settings</label><select class="s23in" id="cu33-tax" data-cu33="tax"><option value="collect"'+(d.tax==='collect'?' selected':'')+'>Collect tax</option><option value="none"'+(d.tax==='none'?' selected':'')+'>Don\'t collect tax</option></select></div></section>'
  +'</div><div class="cu33side"><section class="s23c cu33c"><div class="o31sh"><h3>Notes</h3></div><textarea class="s23in" id="cu33-note" data-cu33="note" rows="3" placeholder="Notes are private and won\'t be shared with the customer.">'+h(d.note)+'</textarea></section>'
  +'<section class="s23c cu33c"><div class="o31sh"><h3>Tags</h3></div><div class="o31tags">'+d.tags.map(function(t,i){return '<span class="o31tag">'+h(t)+'<button data-x="cu33tx:'+i+'" aria-label="Remove tag '+h(t)+'">×</button></span>'}).join('')+'</div><input class="s23in" id="cu33-tag" placeholder="Add a tag and press Enter" aria-label="Add tag"></section></div></div></div>'};
function dirty(){var d=draft();d.dirty=true;var b=q('#cu33ub');if(b)b.hidden=false}
['input','change'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.target;if(!t||location.hash!=='#customers-new'||!X._cu33)return;var d=X._cu33;
 if(t.dataset.cu33){d[t.dataset.cu33]=t.value;dirty()}else if(t.dataset.cu33a){d.addr[t.dataset.cu33a]=t.value;if(t.dataset.cu33a==='country'&&DIAL[t.value]&&!d.phone){d.dial=DIAL[t.value]}dirty()}else if(t.dataset.cu33c&&ev==='change'){d[t.dataset.cu33c]=t.checked;dirty()}})});
document.addEventListener('keydown',function(e){var t=e.target;if(t&&t.id==='cu33-tag'&&e.key==='Enter'){e.preventDefault();var v=t.value.trim(),d=draft();if(v&&d.tags.map(function(x){return x.toLowerCase()}).indexOf(v.toLowerCase())<0)d.tags.push(v);d.dirty=true;route();var n=q('#cu33-tag');if(n)n.focus()}});
A.cu33tx=function(i){var d=draft();d.tags.splice(+i,1);d.dirty=true;route()};
A.cu33dis=function(){X._cu33=null;location.hash='customers';tst('Changes discarded')};
A.cu33save=function(){var d=draft(),er=q('#cu33err'),fail=function(m){if(er)er.textContent=m;tst(m);return false};
 d.email=(d.email||'').trim().toLowerCase();d.first=(d.first||'').trim();d.last=(d.last||'').trim();d.phone=(d.phone||'').replace(/[^\d]/g,'');
 if(!d.first&&!d.last&&!d.email&&!d.phone)return fail('Add a name, email or phone number.');
 if(d.email&&!/^\S+@\S+\.\S+$/.test(d.email))return fail('Enter a valid email address.');
 if(d.email&&(S.cust||[]).some(function(c){return (c.email||'').toLowerCase()===d.email}))return fail('A customer with this email already exists.');
 if(d.phone&&d.phone.length<6)return fail('Enter a valid phone number.');
 if((d.mEmail&&!d.email)||((d.mSms||d.mWa)&&!d.phone))return fail('Marketing consent needs an email (for email) or a phone number (for SMS and WhatsApp).');
 var a=d.addr,hasA=a.a1||a.city||a.zip||a.company;
 var c=X.CU.add({first:d.first,last:d.last,email:d.email,phone:d.phone?d.dial+' '+d.phone:'',mkt:d.mEmail,tags:d.tags.slice(),note:d.note,addrs:hasA?[{first:a.first||d.first,last:a.last||d.last,company:a.company,a1:a.a1,a2:a.a2,city:a.city,zip:a.zip,country:a.country,phone:a.phone}]:[]});
 c.lang=d.lang;c.mktSms=!!d.mSms;c.mktWa=!!d.mWa;c.taxExempt=d.tax==='none';if(c.taxExempt)c.tax='none';
 X._cu33=null;sv();tst('Customer created');location.hash='customer-'+c.id};
if(!U.svg.user)U.svg.user='<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>';
var css=document.createElement('style');css.textContent='.cu33h1{font-size:20px;margin:4px 0 8px}.cu33grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px}.cu33main,.cu33side{display:flex;flex-direction:column;gap:8px;min-width:0}.cu33st{margin:8px 0 2px;font-size:14px}.cu33c{padding:12px 14px}.cu33f{margin-bottom:10px}.cu33two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cu33ph{display:flex;gap:8px}.cu33ph select{width:auto!important;max-width:45%}.cu33m{display:flex;gap:8px;align-items:center;margin:6px 0}.cu33m input{width:auto;margin:0}.cu33note{margin:10px -14px -12px;padding:10px 14px;background:#F7F7F7;border-top:1px solid #EBEBEB;border-radius:0 0 12px 12px;color:#303030}@media(max-width:900px){.cu33grid{grid-template-columns:1fr}.cu33two{grid-template-columns:1fr}}';document.head.appendChild(css);
})();
