/* ===== Sellora v32: Sellora+ (beyond-Shopify features), free-theme library, two-column collection editor, RTL ===== */
(function(){
var X=window,A=X.ACT=X.ACT||{};
function q(s,r){return (r||document).querySelector(s)}function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function sv(){try{save()}catch(e){}}function tst(m){try{toast(m)}catch(e){}}
function hd(t,b){return '<div class="xh"><h1>'+t+'</h1>'+(b||'')+'</div>'}
function card(t,b,id){return '<div class="xc m9c"'+(id?' id="'+id+'"':'')+'><h3>'+t+'</h3>'+b+'</div>'}
function fl(l,id,v,t,ex){return '<label for="'+id+'">'+l+'</label><input class="xin" id="'+id+'" type="'+(t||'text')+'" value="'+h(v==null?'':v)+'" '+(ex||'')+'>'}
function se(l,id,o,v){return '<label for="'+id+'">'+l+'</label><select class="xin" id="'+id+'">'+o.map(function(x){var a=Array.isArray(x)?x:[x,x];return '<option value="'+h(a[0])+'"'+(String(a[0])===String(v)?' selected':'')+'>'+h(a[1])+'</option>'}).join('')+'</select>'}
function vl(id){var e=document.getElementById(id);return e?(e.type==='checkbox'?e.checked:String(e.value).trim()):''}
function num(id){var v=vl(id);if(v==='')return NaN;var n=Number(v);return isFinite(n)?n:NaN}
function pill(t,k){return '<span class="xpill '+(k||'')+'">'+h(t)+'</span>'}
function tbl(cols,rows,empty){return '<table class="xt m9t"><tr>'+cols.map(function(c){return '<th>'+c+'</th>'}).join('')+'</tr>'+(rows.length?rows.join(''):'<tr><td colspan="'+cols.length+'" class="xk">'+(empty||'Nothing here yet.')+'</td></tr>')+'</table>'}
function tr(a){return '<tr>'+a.map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}
function btn(l,x,pri){return '<button class="btn'+(pri?' pri':'')+'" data-x="'+x+'">'+l+'</button>'}
function uid9(p){return (p||'')+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function P(){S.plus=S.plus||{};var p=S.plus;['wa','cod','rfq','oem','ship','exp','live','sup','jobs','raw','badges','samples','aff','bank','ai'].forEach(function(k){if(!Array.isArray(p[k]))p[k]=[]});['tiers','fx'].forEach(function(k){if(!p[k]||typeof p[k]!=='object')p[k]={}});p.cfg=p.cfg||{};var d={wa:'',protect:true,round:'none',hs:'4203.29',inc:'FOB',lang:'en',sfLang:'en',moq:{}};Object.keys(d).forEach(function(k){if(p.cfg[k]===undefined)p.cfg[k]=d[k]});return p}
X.m9P=P;
function money9(n,c){c=c||'USD';try{return new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:c==='JPY'?0:2}).format(n)}catch(e){return c+' '+(+n).toFixed(2)}}
function curL(c){return X.curL?X.curL(c):c}
function err(id,m){var e=q('#'+id);if(e)e.textContent=m||'';return !m}
function prodOpts(){return (S.products||[]).map(function(p){return [p.id,p.name]})}
function pr(id){return (S.products||[]).filter(function(p){return String(p.id)===String(id)})[0]}
function ok(m){tst(m);sv();route()}
function pos(n){return isFinite(n)&&n>0&&n<1e9}
function whole(n,min,max){return isFinite(n)&&Math.floor(n)===n&&n>=min&&n<=max}
var EM=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
