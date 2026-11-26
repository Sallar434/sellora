/* ===== v57: Analytics dashboard like the owner's Shopify guide — date range + comparison + currency chips, metric cards
   with sparklines, total sales over time (vs previous period), total sales breakdown, sales by channel (donut),
   average order value over time, sales by product, sessions and conversion. All from the store's own orders and visits. ===== */
(function(){
var X=window,q=X.SX.q,h=X.SX.h,A=X.ACT,U=X.S23;
var ic=U.ic;
function M(n){try{return money(n)}catch(e){return '$'+(+n||0).toFixed(2)}}
var DAY=864e5,AN=X._an34=X._an34||{range:'30'};
var RANGES=[['today','Today'],['yesterday','Yesterday'],['7','Last 7 days'],['30','Last 30 days'],['90','Last 90 days'],['year','This year']];
function bounds(r){var n=new Date(),d0=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime();
 if(r==='today')return{s:d0,e:d0+DAY,step:DAY/24,n:24,hourly:1};if(r==='yesterday')return{s:d0-DAY,e:d0,step:DAY/24,n:24,hourly:1};
 if(r==='year'){var y=new Date(n.getFullYear(),0,1).getTime(),days=Math.ceil((d0+DAY-y)/DAY);return{s:y,e:d0+DAY,step:DAY,n:days}}
 var k=+r;return{s:d0+DAY-k*DAY,e:d0+DAY,step:DAY,n:k}}
function prevOf(b){var len=b.e-b.s;return{s:b.s-len,e:b.s,step:b.step,n:b.n,hourly:b.hourly}}
function ords(){return (S.orders||[]).filter(function(o){return o&&o.items&&!o.cancelled})}
function inB(o,b){var t=o.at||0;return t>=b.s&&t<b.e}
function chan(o){return o.channel||(o.pos?'Point of Sale':o.draft?'Draft orders':'Online Store')}
function agg(b){var L=ords().filter(function(o){return inB(o,b)}),r={L:L,n:L.length,gross:0,disc:0,rev:0,ship:0,tax:0,ful:0,ser:[],aov:[],cnt:[]};for(var i=0;i<b.n;i++){r.ser.push(0);r.cnt.push(0)}
 L.forEach(function(o){r.gross+=+o.sub||0;r.disc+=+o.disc||0;r.rev+=+o.refunded||0;r.ship+=+o.shipAmt||0;r.tax+=+o.tax||0;if(o.ful==='Fulfilled')r.ful++;var i=Math.min(b.n-1,Math.floor(((o.at||0)-b.s)/b.step));r.ser[i]+=(+o.total||0)-(+o.refunded||0);r.cnt[i]++});
 r.aov=r.ser.map(function(v,i){return r.cnt[i]?v/r.cnt[i]:0});r.net=r.gross-r.disc-r.rev;r.total=r.net+r.ship+r.tax;
 var cs={},all={};ords().forEach(function(o){var k=o.cid||o.email;if(k)all[k]=(all[k]||0)+1});L.forEach(function(o){var k=o.cid||o.email;if(k)cs[k]=1});var ks=Object.keys(cs);r.ret=ks.length?ks.filter(function(k){return all[k]>1}).length/ks.length*100:0;
 var se=(S.sess24||[]).filter(function(s){return s.at>=b.s&&s.at<b.e});r.sess=se.length;r.sser=[];for(var j=0;j<b.n;j++)r.sser.push(0);se.forEach(function(s){r.sser[Math.min(b.n-1,Math.floor((s.at-b.s)/b.step))]++});r.conv=r.sess?Math.min(100,r.n/r.sess*100):0;return r}
function spark(a){var mx=Math.max.apply(null,a.concat([0])),n=a.length;if(!mx)return '<svg class="an34sp" viewBox="0 0 60 20" aria-hidden="true"><path d="M0 19H60" stroke="#C9CCCF" fill="none"/></svg>';return '<svg class="an34sp" viewBox="0 0 60 20" aria-hidden="true"><path d="M'+a.map(function(v,i){return (n>1?i*60/(n-1):0).toFixed(1)+' '+(19-v/mx*17).toFixed(1)}).join(' L')+'" stroke="#2C9CD6" stroke-width="1.5" fill="none"/></svg>'}
function nice(v){if(v<=0)return 1;var p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return (f<=1?1:f<=2?2:f<=5?5:10)*p}
function xlab(b,i){var t=b.s+i*b.step,d=new Date(t);return b.hourly?((d.getHours()%12)||12)+' '+(d.getHours()<12?'AM':'PM'):d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function line(b,cur,prev,fmt,label){var W=560,H=200,PL=44,PB=24,mx=nice(Math.max.apply(null,cur.concat(prev).concat([0]))),n=cur.length,x=function(i){return PL+(n>1?i*(W-PL-8)/(n-1):0)},y=function(v){return 8+(H-PB-8)*(1-v/mx)};
 var path=function(a){return 'M'+a.map(function(v,i){return x(i).toFixed(1)+' '+y(v).toFixed(1)}).join(' L')};
 var g='';for(var k=0;k<=4;k++){var v=mx*k/4;g+='<line x1="'+PL+'" x2="'+(W-8)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#EBEBEB"/><text x="'+(PL-6)+'" y="'+(y(v)+4)+'" text-anchor="end" font-size="10" fill="#616161">'+h(fmt(v))+'</text>'}
 var step=Math.max(1,Math.ceil(n/6)),xl='';for(var i=0;i<n;i+=step)xl+='<text x="'+x(i)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" fill="#616161">'+h(xlab(b,i))+'</text>';
 return '<svg class="an34ch" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+h(label)+'">'+g+xl+'<path d="'+path(prev)+'" stroke="#9ED2EE" stroke-width="1.6" stroke-dasharray="4 4" fill="none"/><path d="'+path(cur)+'" stroke="#2C9CD6" stroke-width="2" fill="none"/></svg>'}
function donut(parts,total){var C=2*Math.PI*42,off=0,cols=['#2C9CD6','#7FC6EA','#B9E0F4','#1B6E99','#DDEFFA'],seg=parts.map(function(p,i){var len=total?p[1]/total*C:0,s='<circle r="42" cx="60" cy="60" fill="none" stroke="'+cols[i%5]+'" stroke-width="16" stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 60 60)"/>';off+=len;return s}).join('');
 return '<div class="an34do"><svg viewBox="0 0 120 120" width="150" height="150" role="img" aria-label="Total sales by sales channel">'+(total?seg:'<circle r="42" cx="60" cy="60" fill="none" stroke="#EBEBEB" stroke-width="16"/>')+'<text x="60" y="64" text-anchor="middle" font-size="13" font-weight="700" fill="#303030">'+h(M(total))+'</text></svg><ul>'+parts.map(function(p,i){return '<li><i style="background:'+cols[i%5]+'"></i>'+h(p[0])+'<b>'+h(M(p[1]))+'</b></li>'}).join('')+'</ul></div>'}
function delta(c,p){if(!c&&!p)return '<span class="an34dl">—</span>';if(!p)return '<span class="an34dl up">New</span>';var d=(c-p)/p*100;return '<span class="an34dl '+(d>=0?'up':'dn')+'">'+(d>=0?'↑':'↓')+Math.abs(d).toFixed(0)+'%</span>'}
V.analytics=function(){var b=bounds(AN.range),pb=prevOf(b),r=agg(b),p=agg(pb),cur=S.cur||'USD',now=new Date();
 var ch={};r.L.forEach(function(o){var k=chan(o);ch[k]=(ch[k]||0)+(+o.total||0)-(+o.refunded||0)});var chs=Object.keys(ch).map(function(k){return [k,ch[k]]}).sort(function(a,b){return b[1]-a[1]});
 var pr={};r.L.forEach(function(o){(o.items||[]).forEach(function(l){pr[l.name]=(pr[l.name]||0)+(+l.price||0)*(+l.q||0)})});var prs=Object.keys(pr).map(function(k){return [k,pr[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5),pmax=prs.length?prs[0][1]:0;
 var card=function(l,v,a,c,pv){return '<a class="an34m" data-x="go:analytics-reports"><small>'+l+'</small><div><b>'+v+'</b>'+delta(c,pv)+'</div>'+spark(a)+'</a>'};
 var rl=RANGES.filter(function(x){return x[0]===AN.range})[0][1];
 var br=[['Gross sales',r.gross],['Discounts',-r.disc],['Sales reversals',-r.rev],['Net sales',r.net],['Shipping charges',r.ship],['Return fees',0],['Taxes',r.tax],['Total sales',r.total]];
 var pbr={'Gross sales':p.gross,'Discounts':-p.disc,'Sales reversals':-p.rev,'Net sales':p.net,'Shipping charges':p.ship,'Return fees':0,'Taxes':p.tax,'Total sales':p.total};
 return '<div class="s23w an34"><div class="an34hd"><h1>'+ic('chart',18)+' Analytics</h1><span class="s23mut">Data computed from your orders · refreshed today at '+now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+'</span><span style="flex:1"></span><button class="btn" data-x="go:analytics-live-view">Live View</button><button class="btn pri" data-x="go:analytics-reports">New exploration</button></div>'
  +'<div class="an34chips"><label class="an34chip">'+ic('clock',14)+'<select id="an34r" data-xc="1" aria-label="Date range">'+RANGES.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===AN.range?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label><span class="an34chip">Compared to previous '+(b.hourly?'day':'period')+'</span><span class="an34chip">'+h(cur)+'</span></div>'
  +'<div class="an34ms">'+card('Gross sales',M(r.gross),r.ser,r.gross,p.gross)+card('Returning customer rate',r.ret.toFixed(0)+'%',r.cnt,r.ret,p.ret)+card('Orders fulfilled',r.ful,r.cnt,r.ful,p.ful)+card('Orders',r.n,r.cnt,r.n,p.n)+'</div>'
  +'<div class="an34g"><section class="s23c an34c an34wide"><h3>Total sales over time</h3><b class="an34big">'+M(r.total)+'</b>'+line(b,r.ser,p.ser,function(v){return M(v).replace(/\.00$/,'')},'Total sales over time')+'<div class="an34lg"><span><i></i>'+h(rl)+'</span><span><i class="pv"></i>Previous period</span></div></section>'
  +'<section class="s23c an34c"><h3>Total sales breakdown</h3><table class="an34bt">'+br.map(function(x){return '<tr'+(/Net sales|Total sales/.test(x[0])?' class="an34em"':'')+'><td><a data-x="go:analytics-reports">'+x[0]+'</a></td><td class="r">'+M(x[1])+'</td><td class="r">'+delta(Math.abs(x[1]),Math.abs(pbr[x[0]]))+'</td></tr>'}).join('')+'</table></section>'
  +'<section class="s23c an34c"><h3>Total sales by sales channel</h3>'+donut(chs.length?chs:[['Online Store',0]],r.total)+'</section>'
  +'<section class="s23c an34c"><h3>Average order value over time</h3><b class="an34big">'+M(r.n?(r.gross-r.disc)/r.n:0)+'</b>'+line(b,r.aov,p.aov,function(v){return M(v).replace(/\.00$/,'')},'Average order value over time')+'</section>'
  +'<section class="s23c an34c"><h3>Total sales by product</h3>'+(prs.length?prs.map(function(x){return '<div class="an34bar"><span>'+h(x[0])+'</span><div><i style="width:'+(pmax?Math.max(4,x[1]/pmax*100):0)+'%"></i><b>'+M(x[1])+'</b></div></div>'}).join(''):'<p class="s23mut">No sales in this date range.</p>')+'</section>'
  +'<section class="s23c an34c"><h3>Online store sessions</h3><b class="an34big">'+r.sess+'</b>'+line(b,r.sser,p.sser,function(v){return v%1?v.toFixed(2).replace(/0$/,''):String(v)},'Sessions over time')+'</section>'
  +'<section class="s23c an34c"><h3>Conversion rate</h3><b class="an34big">'+r.conv.toFixed(1)+'%</b><p class="s23mut">'+r.n+' order'+(r.n===1?'':'s')+' from '+r.sess+' session'+(r.sess===1?'':'s')+' '+delta(r.conv,p.conv)+'</p></section>'
  +'</div></div>'};
document.addEventListener('change',function(e){if(e.target&&e.target.id==='an34r'){AN.range=e.target.value;route()}});
if(!U.svg.chart)U.svg.chart='<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
var css=document.createElement('style');css.textContent=['.an34hd{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}.an34hd h1{display:flex;gap:6px;align-items:center;font-size:20px;margin:0}',
'.an34chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.an34chip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #E3E3E3;border-radius:8px;padding:4px 10px;font-weight:550;font-size:13px}.an34chip select{border:0!important;background:transparent!important;font:inherit;width:auto!important;padding:0!important;height:auto!important;box-shadow:none!important}',
'.an34ms{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.an34m{background:#fff;border:1px solid #E3E3E3;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;color:inherit;text-decoration:none;cursor:pointer}.an34m:hover{border-color:#B5B5B5}.an34m small{font-weight:600}.an34m div{display:flex;align-items:baseline;gap:8px}.an34m b{font-size:16px;color:#303030}.an34m small{color:#303030}.an34sp{width:70px;height:20px}',
'.an34dl{font-size:12px;color:#616161}.an34dl.up{color:#29845A}.an34dl.dn{color:#C70A24}',
'.an34g{display:grid;grid-template-columns:2fr 1fr;gap:12px}.an34c{padding:12px 14px;min-width:0}.an34c h3{margin:0 0 4px;font-size:14px}.an34big{display:block;font-size:20px;margin-bottom:6px}.an34ch{width:100%;height:auto}',
'.an34lg{display:flex;gap:14px;justify-content:center;font-size:12px;color:#616161}.an34lg i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2C9CD6;margin-right:5px}.an34lg i.pv{background:#9ED2EE}',
'.an34bt{width:100%;border-collapse:collapse}.an34bt td{padding:7px 4px;border-bottom:1px solid #F1F1F1}.an34bt a{color:#005BD3;cursor:pointer}.an34bt .r{text-align:right}.an34em td{font-weight:650}',
'.an34do{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.an34do ul{list-style:none;margin:0;padding:0;flex:1;min-width:140px}.an34do li{display:flex;gap:6px;align-items:center;padding:4px 0}.an34do li i{width:10px;height:10px;border-radius:3px}.an34do li b{margin-left:auto}',
'.an34bar{margin:8px 0}.an34bar span{display:block;font-size:12px;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.an34bar div{display:flex;align-items:center;gap:8px}.an34bar i{height:18px;background:#2C9CD6;border-radius:4px;display:block}.an34bar b{font-size:12px;white-space:nowrap}',
'@media(max-width:1000px){.an34g{grid-template-columns:1fr}.an34ms{grid-template-columns:1fr 1fr}}'].join('\n');document.head.appendChild(css);
})();
