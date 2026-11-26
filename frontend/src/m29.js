/* ===== v52: Settings like Shopify — role permissions that really limit staff, a user page, languages (default + published),
   brand assets, a live Markets summary, and a store activity log that records what happens. ===== */
(function(){
var X=window,q=X.SX.q,qa=X.SX.qa,h=X.SX.h,A=X.ACT,SXS=X.SXS;
function sv(){try{save()}catch(e){}}
function tst(m){try{toast(m)}catch(e){}}
function set(k){S.set=S.set||{};return S.set[k]=S.set[k]||{}}
function sp(k){S.sp=S.sp||{};return S.sp[k]=S.sp[k]||{}}
function ub(id,show,dis,svA){return '<div class="s23unsaved" id="'+id+'"'+(show?'':' hidden')+'><span>Unsaved changes</span><button data-x="'+dis+'">Discard</button><button class="on" data-x="'+svA+'" id="'+id+'s">Save</button></div>'}
function showUb(id){var b=q('#'+id);if(b)b.hidden=false}

/* ---------- activity log: one place, fed by every saved change ---------- */
function LOG(){return S.log29=S.log29||[]}
function who(){return S.viewAs||S.email||'Store owner'}
function area(){var r=(location.hash||'#home').slice(1);try{var a=X.AREAS||{},k=r.split('-')[0];if(/^s-/.test(r))return 'Settings';if(/^(market|catalog|rollout)/.test(r))return 'Markets';if(/^order|draft|abandoned/.test(r))return 'Orders';if(/^product|collection|inventory|gift/.test(r))return 'Products';if(/^customer|segment|compan/.test(r))return 'Customers';if(/^discount/.test(r))return 'Discounts';if(/^theme|online-store|pages/.test(r))return 'Online store';if(/^content|mo-|menu|blog|files/.test(r))return 'Content';if(/^growth|campaign/.test(r))return 'Marketing';return a[k]||'Home'}catch(e){return 'Home'}}
X.log29=function(t,ar){LOG().unshift({t:String(t).slice(0,200),at:Date.now(),by:who(),area:ar||area()});if(LOG().length>500)S.log29=LOG().slice(0,500);sv()};
var LOGRX=/\b(saved|created|deleted|removed|updated|published|invited|added|archived|duplicated|enabled|disabled|turned on|turned off|activated|deactivated|merged|discarded|ended|cancelled|refunded|fulfilled|imported|exported)\b/i;
if(typeof toast==='function'){var T0=toast;X.toast=toast=function(m){try{if(m&&LOGRX.test(m)&&!/^(Copied|Downloaded|Changes discarded)/.test(m)&&S&&!document.body.classList.contains('locked'))X.log29(m)}catch(e){}return T0.apply(this,arguments)}}
var AL={q:'',a:'All'};
SXS.activity=function(){var L=LOG().concat((S.activity||[]).map(function(a){return{t:a.t,at:a.at,by:a.by||'',area:'Settings'}})).concat((S.act||[]).map(function(a){return{t:a.t,at:a.at,by:'',area:'Settings'}}));
 var seen={};L=L.filter(function(x){var k=x.t+'|'+x.at;if(seen[k])return false;seen[k]=1;return true}).sort(function(a,b){return b.at-a.at});
 var areas=['All'];L.forEach(function(x){if(areas.indexOf(x.area)<0)areas.push(x.area)});var qq=AL.q.toLowerCase(),R=L.filter(function(x){return (AL.a==='All'||x.area===AL.a)&&(!qq||x.t.toLowerCase().indexOf(qq)>-1||String(x.by).toLowerCase().indexOf(qq)>-1)});
 return '<div class="top"><h1>Store activity log</h1><button class="btn" data-x="st29csv">Export</button></div><div class="panel" style="padding:0"><div class="st29bar"><input id="st29q" placeholder="Search activity" value="'+h(AL.q)+'" aria-label="Search activity"><select id="st29a" aria-label="Area">'+areas.map(function(a){return '<option'+(a===AL.a?' selected':'')+'>'+h(a)+'</option>'}).join('')+'</select></div>'
  +(R.length?'<table class="st29t" data-p8="1"><thead><tr><th>Activity</th><th>Area</th><th>User</th><th>Date</th></tr></thead><tbody>'+R.slice(0,200).map(function(x){return '<tr><td>'+h(x.t)+'</td><td>'+h(x.area)+'</td><td>'+h(x.by||'—')+'</td><td class="mu">'+new Date(x.at).toLocaleString()+'</td></tr>'}).join('')+'</tbody></table>':'<p class="mu" style="padding:16px;margin:0">'+(L.length?'No activity matches.':'No activity yet. Changes you save in the admin show here.')+'</p>')+'</div>'};
document.addEventListener('input',function(e){if(e.target&&e.target.id==='st29q'){AL.q=e.target.value;var p=e.target.selectionStart;route();var i=q('#st29q');if(i){i.focus();try{i.setSelectionRange(p,p)}catch(x){}}}});
document.addEventListener('change',function(e){if(e.target&&e.target.id==='st29a'){AL.a=e.target.value;route()}});
A.st29csv=function(){var rows=[['Activity','Area','User','Date']].concat(LOG().map(function(x){return [x.t,x.area,x.by,new Date(x.at).toISOString()]}));X.xdl('activity-log.csv',rows.map(function(r){return r.map(function(v){v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')}).join('\n'),'text/csv')};

/* ---------- role permissions ---------- */
var AREAS=X.AREAS||{};
var DEFP={'Administrator':Object.keys(AREAS),'Developer':Object.keys(AREAS),'Store manager':Object.keys(AREAS).filter(function(a){return a!=='settings'&&a!=='pay'}),'Marketer':['growth','discounts','content','analytics','themes'],'Merchandiser':['products','content','themes','discounts'],'Customer support':['orders','customers'],'Online store editor':['themes','content'],'Cashier':['orders','products','customers'],'Sales associate':['orders','products','customers'],'Limited permissions':['orders']};
function rolePerm(n){var c=(S.rolePerm29||{})[n];return c?c.slice():(DEFP[n]||[]).slice()}
function staff(){var o=set('users');return o.staff=o.staff||[{email:S.email,role:'Owner'}]}
function userByEmail(e){return staff().filter(function(u){return u.email===e})[0]}
X.permOf=function(email){var u=userByEmail(email);if(!u)return null;if(u.st==='Suspended')return [];if(u.role==='Owner')return Object.keys(AREAS);if(u.perm29)return u.perm29.slice();return rolePerm(u.role)};
function permBoxes(sel,dis,attr){return '<div class="st29perm">'+Object.keys(AREAS).filter(function(k){return k!=='home'}).map(function(k){return '<label class="st29pk"><input type="checkbox" '+attr+'="'+k+'"'+(sel.indexOf(k)>-1?' checked':'')+(dis?' disabled':'')+'> '+h(AREAS[k])+'</label>'}).join('')+'</div>'}
function fixRoles(){try{if(typeof S==='undefined'||!S)return;if(!Array.isArray(S.roles)||!S.roles.length){S.roles=(typeof RL!=='undefined'?RL:[]).map(function(r){return{n:r[0],c:r[1],b:r[2]?1:0}})}}catch(e){}}
fixRoles();if(X.onRoute)X.onRoute(fixRoles);
function roleList(){fixRoles();try{return roles()}catch(e){return []}}
var RD=null;
X.roleForm=window.roleForm=function(i){var R=roleList(),r=i===undefined?null:R[i];RD={i:i===undefined?-1:i,n:r?r.n:'',c:r?r.c:'Store',b:r?!!r.b:false,p:r?rolePerm(r.n):[],dirty:i===undefined};location.hash='s-role';route()};
SXS.role=function(){if(!RD)return SXS.roles?SXS.roles():'';var isNew=RD.i<0,n=staff().filter(function(u){return u.role===RD.n}).length;
 return ub('st29rb',RD.dirty,'st29rdis','st29rsav')+'<div class="top"><h1><button class="lnk" data-r="s-users">Users</button> › <button class="lnk" data-r="s-roles">Roles</button> › '+h(isNew?'Add role':RD.n)+'</h1>'+(isNew||RD.b?'':'<button class="btn bad" data-x="st29rdel">Delete role</button>')+'</div>'
  +'<p class="err" id="st29re" role="alert"></p>'+(RD.b?'<div class="panel"><p class="mu" style="margin:0">Built-in roles can\'t be changed. Duplicate it as a new role to make your own.</p><button class="btn" data-x="st29rdup" style="margin-top:8px">Duplicate role</button></div>':'')
  +'<div class="panel"><label for="st29rn">Role name</label><input id="st29rn" maxlength="40" value="'+h(RD.n)+'"'+(RD.b?' disabled':'')+'><label for="st29rc">Category</label><select id="st29rc"'+(RD.b?' disabled':'')+'>'+['Organization','Store','Point of sale'].map(function(c){return '<option'+(c===RD.c?' selected':'')+'>'+c+'</option>'}).join('')+'</select>'+(isNew?'':'<p class="mu">'+n+' user'+(n===1?'':'s')+' with this role</p>')+'</div>'
  +'<div class="panel"><div class="top" style="margin:0 0 6px"><h3>Permissions</h3>'+(RD.b?'':'<span><button class="lnk" data-x="st29rall:1">Select all</button> · <button class="lnk" data-x="st29rall:0">Clear</button></span>')+'</div><p class="mu">Users with this role can open only these areas. Home is always available.</p>'+permBoxes(RD.p,RD.b,'data-st29rp')+'</div>'};
['input','change'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.target;if(!t)return;
 if(RD&&location.hash==='#s-role'){if(t.id==='st29rn'){RD.n=t.value;RD.dirty=true;showUb('st29rb')}else if(t.id==='st29rc'){RD.c=t.value;RD.dirty=true;showUb('st29rb')}else if(t.dataset&&t.dataset.st29rp&&ev==='change'){var k=t.dataset.st29rp,j=RD.p.indexOf(k);if(t.checked&&j<0)RD.p.push(k);if(!t.checked&&j>-1)RD.p.splice(j,1);RD.dirty=true;showUb('st29rb')}}
 if(UD&&location.hash==='#s-user'){if(t.id==='st29ur'&&ev==='change'){UD.role=t.value;if(!UD.custom)UD.p=rolePerm(UD.role);UD.dirty=true;route()}else if(t.id==='st29uc'&&ev==='change'){UD.custom=t.checked;if(!t.checked)UD.p=rolePerm(UD.role);UD.dirty=true;route()}else if(t.dataset&&t.dataset.st29up&&ev==='change'){var k2=t.dataset.st29up,j2=UD.p.indexOf(k2);if(t.checked&&j2<0)UD.p.push(k2);if(!t.checked&&j2>-1)UD.p.splice(j2,1);UD.dirty=true;showUb('st29ub')}}})});
A.st29rall=function(v){RD.p=v==='1'?Object.keys(AREAS).filter(function(k){return k!=='home'}):[];RD.dirty=true;route()};
A.st29rdis=function(){var i=RD.i;if(i<0){RD=null;location.hash='s-roles'}else{X.roleForm(i);tst('Changes discarded')}};
A.st29rdup=function(){var r=RD;RD={i:-1,n:'Copy of '+r.n,c:r.c,b:false,p:r.p.slice(),dirty:true};route()};
A.st29rsav=function(){var n=(RD.n||'').trim(),er=q('#st29re'),R=roleList();if(!n){er.textContent='Role name is required.';return}
 if(R.some(function(r,j){return j!==RD.i&&r.n.toLowerCase()===n.toLowerCase()})){er.textContent='A role called '+n+' already exists.';return}
 if(!RD.p.length){er.textContent='Choose at least one permission.';return}
 var pm=S.rolePerm29=S.rolePerm29||{};if(RD.i<0){R.push({n:n,c:RD.c,b:0});RD.i=R.length-1}else{var r=R[RD.i],old=r.n;if(old!==n){staff().forEach(function(u){if(u.role===old)u.role=n});delete pm[old]}r.n=n;r.c=RD.c}
 pm[n]=RD.p.slice();RD.n=n;RD.dirty=false;sv();tst('Role saved');route()};
A.st29rdel=function(){var R=roleList(),r=R[RD.i];if(!r)return;if(staff().some(function(u){return u.role===r.n})){q('#st29re').textContent='Give the users with this role another role first.';return}R.splice(RD.i,1);if(S.rolePerm29)delete S.rolePerm29[r.n];RD=null;sv();tst('Role deleted');location.hash='s-roles'};

/* ---------- user page ---------- */
var UD=null;
X.editUser=window.editUser=function(i){var u=staff()[i];if(!u)return;UD={i:i,email:u.email,role:u.role,st:u.st||'Active',custom:!!u.perm29,p:u.perm29?u.perm29.slice():(u.role==='Owner'?Object.keys(AREAS):rolePerm(u.role)),dirty:false};location.hash='s-user';route()};
SXS.user=function(){if(!UD)return SXS.users?SXS.users():'';var ow=UD.role==='Owner',R=roleList().filter(function(r){return r.c!=='Organization'||true});
 return ub('st29ub',UD.dirty,'st29udis','st29usav')+'<div class="top"><h1><button class="lnk" data-r="s-users">Users</button> › '+h(UD.email)+'</h1>'+(ow?'':'<span style="display:flex;gap:8px">'+(UD.st==='Invited'?'<button class="btn" data-x="st29uinv">Resend invite</button>':'')+'<button class="btn" data-x="st29usus">'+(UD.st==='Suspended'?'Reactivate':'Suspend')+'</button><button class="btn bad" data-x="st29urm">Remove user</button></span>')+'</div>'
  +'<div class="panel"><div class="st29uh"><span class="st29av">'+h((UD.email[0]||'?').toUpperCase())+'</span><div><b>'+h(UD.email)+'</b><br><span class="tag '+(UD.st==='Active'?'ok':'warn')+'">'+h(UD.st)+'</span></div></div></div>'
  +'<div class="panel"><h3>Role</h3>'+(ow?'<p class="mu" style="margin:0">Store owner — has full access. Transfer ownership to change this.</p>':'<label for="st29ur">Role</label><select id="st29ur">'+R.map(function(r){return '<option'+(r.n===UD.role?' selected':'')+'>'+h(r.n)+'</option>'}).join('')+'</select>')+'</div>'
  +(ow?'':'<div class="panel"><h3>Permissions</h3><label class="st29pk"><input type="checkbox" id="st29uc"'+(UD.custom?' checked':'')+'> Give this user custom permissions</label><p class="mu">'+(UD.custom?'Only for this user.':'From the '+h(UD.role)+' role.')+'</p>'+permBoxes(UD.p,!UD.custom,'data-st29up')+'</div>')};
A.st29udis=function(){X.editUser(UD.i);tst('Changes discarded')};
A.st29usav=function(){var u=staff()[UD.i];if(!u)return;u.role=UD.role;if(UD.custom)u.perm29=UD.p.slice();else delete u.perm29;S.staffPerm=S.staffPerm||{};delete S.staffPerm[u.email];UD.dirty=false;sv();tst('User '+u.email+' updated');route()};
A.st29usus=function(){var u=staff()[UD.i];u.st=u.st==='Suspended'?'Active':'Suspended';UD.st=u.st;sv();tst(u.email+(u.st==='Suspended'?' suspended':' reactivated'));route()};
A.st29uinv=function(){tst('Invite sent again to '+UD.email);try{X.API&&X.API.email&&X.API.email(UD.email,'You\'re invited to '+S.name,'You were invited to help run '+S.name+' on VendOm.','invite')}catch(e){}};
A.st29urm=function(){var u=staff()[UD.i];X.xmodal('Remove '+h(u.email)+'?','<p>They lose access to this store right away.</p>','Remove user',function(){staff().splice(UD.i,1);UD=null;sv();tst('User removed');location.hash='s-users';return 'keep'})};
/* staff permissions are enforced by route(); a suspended user gets Home only */
document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest||!/^#s-(users|roles)$/.test(location.hash))return;if(t.closest('input'))return;
 var r=t.closest('tr[data-ui]');if(r){e.stopPropagation();e.preventDefault();X.editUser(+r.dataset.ui);return}
 r=t.closest('tr[data-ri]');if(r){e.stopPropagation();e.preventDefault();X.roleForm(+r.dataset.ri);return}
 var b=t.closest('[data-ra="add"]');if(b){e.stopPropagation();e.preventDefault();X.roleForm()}},true);

/* ---------- languages ---------- */
var LANGS=[['en','English'],['ur','Urdu'],['ar','Arabic'],['fr','French'],['de','German'],['es','Spanish'],['it','Italian'],['pt','Portuguese'],['nl','Dutch'],['tr','Turkish'],['zh','Chinese'],['ja','Japanese'],['hi','Hindi'],['bn','Bengali'],['ms','Malay'],['ru','Russian'],['pa','Punjabi'],['fa','Persian'],['ko','Korean'],['sv','Swedish']];
function langs(){var o=set('langs');if(!o.langs||!o.langs.length)o.langs=[{name:'English',code:'en'}];o.langs.forEach(function(l){if(l.pub===undefined)l.pub=true});if(!o.def||!o.langs.some(function(l){return l.code===o.def}))o.def=o.langs[0].code;return o}
function mUse(code){try{return (X.MK28?X.MK28.list():[]).filter(function(m){return X.MK28.eff(m).dom.lang===code}).map(function(m){return m.name})}catch(e){return []}}
SXS.langs=function(){var o=langs();
 return '<div class="top"><h1>Languages</h1><button class="btn pri" data-x="st29ladd" id="st29la">Add language</button></div>'
  +'<div class="panel" style="padding:0"><table class="st29t" data-p8="1"><thead><tr><th>Language</th><th>Status</th><th>Markets</th><th></th></tr></thead><tbody>'+o.langs.map(function(l){var df=l.code===o.def,mu=mUse(l.code);return '<tr><td><b>'+h(l.name)+'</b> <span class="mu">'+h(l.code)+'</span>'+(df?' <span class="tag">Default</span>':'')+'</td><td><span class="tag '+(l.pub?'ok':'')+'">'+(l.pub?'Published':'Unpublished')+'</span></td><td class="mu">'+(mu.length?h(mu.join(', ')):'—')+'</td><td class="st29ra">'+(df?'':'<button class="btn" data-x="st29lpub:'+l.code+'">'+(l.pub?'Unpublish':'Publish')+'</button>'+(l.pub?'<button class="btn" data-x="st29ldef:'+l.code+'">Make default</button>':'')+'<button class="btn bad" data-x="st29lrm:'+l.code+'" aria-label="Remove '+h(l.name)+'">Remove</button>')+'</td></tr>'}).join('')+'</tbody></table></div>'
  +'<p class="mu">Customers see published languages in the language selector. Assign a language to a market in <a href="#markets">Markets</a>.</p>'};
A.st29ladd=function(){var o=langs(),av=LANGS.filter(function(l){return !o.langs.some(function(x){return x.code===l[0]})});
 X.xmodal('Add language',av.length?'<label for="st29ls">Language</label><select id="st29ls">'+av.map(function(l){return '<option value="'+l[0]+'">'+l[1]+'</option>'}).join('')+'</select><label class="st29pk"><input type="checkbox" id="st29lp"> Publish now</label>':'<p>Every language is already added.</p>',av.length?'Add':'',function(){var c=q('#st29ls').value,l=LANGS.filter(function(x){return x[0]===c})[0];o.langs.push({name:l[1],code:c,pub:q('#st29lp').checked});sv();tst(l[1]+' added')})};
A.st29lpub=function(c){var o=langs(),l=o.langs.filter(function(x){return x.code===c})[0];if(!l)return;if(l.pub&&mUse(c).length){tst('Used by '+mUse(c).join(', ')+'. Change those markets first.');return}l.pub=!l.pub;sv();tst(l.name+(l.pub?' published':' unpublished'));route()};
A.st29ldef=function(c){var o=langs(),l=o.langs.filter(function(x){return x.code===c})[0];if(!l||!l.pub)return;o.def=c;sv();tst(l.name+' is now the default language — saved');route()};
A.st29lrm=function(c){var o=langs(),l=o.langs.filter(function(x){return x.code===c})[0];if(!l)return;if(mUse(c).length){tst('Used by '+mUse(c).join(', ')+'. Change those markets first.');return}o.langs=o.langs.filter(function(x){return x!==l});sv();tst(l.name+' removed');route()};

/* ---------- markets summary ---------- */
SXS.markets=function(){var M=X.MK28?X.MK28.list():[],act=M.filter(function(m){return m.status==='Active'}).length;
 return '<div class="top"><h1>Markets</h1><a class="btn pri" href="#markets">Manage markets</a></div><div class="panel"><p class="mu" style="margin-top:0">'+act+' active of '+M.length+' market'+(M.length===1?'':'s')+' · backup region: <b>'+h(S.backup28||S.country||'')+'</b></p>'
  +M.map(function(m){var e=X.MK28.eff(m);return '<a class="st29mk" href="#market-'+m.id+'"><span><b>'+h(m.name)+'</b><small>'+h(m.type==='region'?(m.countries.length===1?m.countries[0]:m.countries.length+' countries and regions'):m.type)+'</small></span><span class="tag '+(m.status==='Active'?'ok':'')+'">'+h(m.status)+'</span><span class="mu">'+h(e.cur.cur)+'</span></a>'}).join('')+'</div>'};

/* ---------- brand ---------- */
var BD=null;
var SOC=[['facebook','Facebook'],['instagram','Instagram'],['tiktok','TikTok'],['x','X'],['youtube','YouTube'],['pinterest','Pinterest'],['linkedin','LinkedIn']];
function bdraft(){if(BD)return BD;var b=sp('brand');BD={logo:b.logo||'',sq:b.sq||'',cover:b.cover||'',c1:b.c1||'#2E6B4F',c1t:b.c1t||'#FFFFFF',c2:b.c2||'#F2C14E',c2t:b.c2t||'#111111',slogan:b.slogan||'',desc:b.desc||'',soc:Object.assign({},b.soc||{}),dirty:false};return BD}
function imgF(k,label,note){var v=BD[k];return '<div class="st29img"><div class="st29iv">'+(v?'<img src="'+h(v)+'" alt="'+h(label)+'">':'<span class="mu">No image</span>')+'</div><div><b>'+label+'</b><p class="mu">'+note+'</p><label class="btn st29up">Upload<input type="file" accept="image/*" data-st29img="'+k+'" hidden></label>'+(v?' <button class="btn" data-x="st29bimgx:'+k+'">Remove</button>':'')+'</div></div>'}
SXS.brand=function(){var b=bdraft();
 return ub('st29bb',b.dirty,'st29bdis','st29bsav')+'<div class="top"><h1>Brand</h1></div><p class="err" id="st29be" role="alert"></p>'
  +'<div class="panel"><h3>Logos</h3>'+imgF('logo','Default logo','Used on your store, checkout and emails. PNG, JPG or SVG, up to 1 MB.')+imgF('sq','Square logo','Used where a square is needed, like social profiles.')+'</div>'
  +'<div class="panel"><h3>Colors</h3><div class="st29cols">'+[['c1','Primary'],['c1t','Primary contrast'],['c2','Secondary'],['c2t','Secondary contrast']].map(function(c){return '<label class="st29col"><input type="color" data-st29c="'+c[0]+'" value="'+h(b[c[0]])+'"><span>'+c[1]+'<br><span class="mu">'+h(b[c[0]])+'</span></span></label>'}).join('')+'</div><div class="st29sw" style="background:'+h(b.c1)+';color:'+h(b.c1t)+'">Primary button</div><div class="st29sw" style="background:'+h(b.c2)+';color:'+h(b.c2t)+'">Secondary</div></div>'
  +'<div class="panel"><h3>Cover image</h3>'+imgF('cover','Cover image','A wide image that shows your brand, used on social and in some apps.')+'</div>'
  +'<div class="panel"><h3>Slogan and short description</h3><label for="st29bs">Slogan <span class="mu" id="st29bsn">'+b.slogan.length+'/80</span></label><input id="st29bs" maxlength="80" value="'+h(b.slogan)+'"><label for="st29bd">Short description <span class="mu" id="st29bdn">'+b.desc.length+'/150</span></label><textarea id="st29bd" maxlength="150" rows="3">'+h(b.desc)+'</textarea></div>'
  +'<div class="panel"><h3>Social links</h3>'+SOC.map(function(s){return '<label for="st29so-'+s[0]+'">'+s[1]+'</label><input id="st29so-'+s[0]+'" data-st29s="'+s[0]+'" placeholder="https://" value="'+h(b.soc[s[0]]||'')+'">'}).join('')+'</div>'};
function bdirty(){BD.dirty=true;showUb('st29bb')}
['input','change'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.target;if(!t||!BD||location.hash!=='#s-brand')return;
 if(t.dataset.st29c){BD[t.dataset.st29c]=t.value;bdirty();if(ev==='change')route()}else if(t.id==='st29bs'){BD.slogan=t.value;q('#st29bsn').textContent=t.value.length+'/80';bdirty()}else if(t.id==='st29bd'){BD.desc=t.value;q('#st29bdn').textContent=t.value.length+'/150';bdirty()}
 else if(t.dataset.st29s){BD.soc[t.dataset.st29s]=t.value.trim();bdirty()}
 else if(t.dataset.st29img&&ev==='change'&&t.files&&t.files[0]){var f=t.files[0],k=t.dataset.st29img;if(f.size>1048576){q('#st29be').textContent='That image is larger than 1 MB.';return}if(!/^image\//.test(f.type)){q('#st29be').textContent='Choose an image file.';return}var rd=new FileReader();rd.onload=function(){BD[k]=rd.result;BD.dirty=true;route()};rd.readAsDataURL(f)}})});
A.st29bimgx=function(k){BD[k]='';BD.dirty=true;route()};
A.st29bdis=function(){BD=null;route();tst('Changes discarded')};
A.st29bsav=function(){var b=BD,bad=SOC.filter(function(s){var v=b.soc[s[0]];return v&&!/^https?:\/\/\S+\.\S+/.test(v)});if(bad.length){q('#st29be').textContent=bad[0][1]+' link must start with https:// and be a full address.';return}
 var o=sp('brand');['logo','sq','cover','c1','c1t','c2','c2t','slogan','desc'].forEach(function(k){o[k]=b[k]});o.soc={};SOC.forEach(function(s){if(b.soc[s[0]])o.soc[s[0]]=b.soc[s[0]]});b.dirty=false;sv();tst('Brand saved');route()};
if(X.onRoute)X.onRoute(function(r){if(r!=='s-brand')BD=null;if(r!=='s-role'&&r!=='s-roles')null});

/* ---------- styles ---------- */
var css=document.createElement('style');css.id='st29css';css.textContent=[
'.st29bar{display:flex;gap:8px;padding:10px 12px;border-bottom:1px solid #EBEBEB}.st29bar input{flex:1}.st29bar select{width:auto}',
'.st29t{width:100%;border-collapse:collapse}.st29t th,.st29t td{text-align:left;padding:10px 12px;border-bottom:1px solid #F1F1F1;vertical-align:middle}.st29t th{font-size:12px;color:#616161;font-weight:550;background:#FAFAFA}',
'.st29ra{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}',
'.st29perm{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px 14px;margin-top:8px}.st29pk{display:flex;align-items:center;gap:8px;font-weight:450}.st29pk input{width:auto;margin:0}',
'.st29uh{display:flex;gap:12px;align-items:center}.st29av{width:40px;height:40px;border-radius:50%;background:#E3F1DF;color:#0C5132;display:flex;align-items:center;justify-content:center;font-weight:700}',
'.st29mk{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #F1F1F1;color:inherit;text-decoration:none}.st29mk span:first-child{flex:1;display:flex;flex-direction:column}.st29mk small{color:#616161}.st29mk:hover b{text-decoration:underline}',
'.st29img{display:flex;gap:14px;align-items:center;padding:10px 0;border-top:1px solid #F1F1F1}.st29img:first-of-type{border-top:0}.st29iv{width:96px;height:64px;border:1px dashed #C9CCCF;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#FAFAFA;flex:none}.st29iv img{max-width:100%;max-height:100%}.st29img p{margin:2px 0 6px}.st29up{display:inline-flex;cursor:pointer}',
'.st29cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}.st29col{display:flex;gap:8px;align-items:center}.st29col input{width:40px;height:40px;padding:0;border:1px solid #E3E3E3;border-radius:8px}',
'.st29sw{display:inline-block;margin:12px 8px 0 0;padding:8px 14px;border-radius:8px;font-weight:600}'
].join('\n');document.head.appendChild(css);
})();
