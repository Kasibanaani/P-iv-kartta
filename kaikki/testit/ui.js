
/* 1.108 (Emil 18.11.2026): poistetut näkymät (vanha rivinäkymä, Aikaehdotukset, Vanhat puut, kierroslistat, ryhmät, Poissulkevat, Vaihepankki, Muistiinpanot listaan) eivät näy. Tiedot säilyvät ja toimivat; vanhat testit avaavat näkymät koukulla JuuriTesti.old(). */
var OLDUI=(function(){try{return localStorage.getItem('kaikki:vanhat')==='1';}catch(e){return false;}})();if(OLDUI)document.body.classList.add('oldui');
if(typeof document!=='undefined')(function(){
try{if(window.navigator.standalone)document.documentElement.classList.add('standalone');}catch(e){}
document.addEventListener('gesturestart',function(ev){ev.preventDefault();}); // Safari: ei nipistyszoomausta
'use strict';
var KEY='kaikki:v1';
/* Päivä- ja aikakentät suomalaiseen muotoon: näkyvä teksti kentän päällä, laitteen valitsin pysyy käytössä */
var VAL=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
function fiPick(inp){if(inp.dataset.fi||!inp.parentNode)return;inp.dataset.fi='1';var dt=inp.type==='date',w=document.createElement('span'),sh=document.createElement('span');
  w.className='fipick'+(dt?'':' t');sh.className='fishow';sh.setAttribute('aria-hidden','true');inp.parentNode.insertBefore(w,inp);w.appendChild(sh);w.appendChild(inp);
  function upd(){var v=VAL.get.call(inp),p=v.split('-');sh.textContent=v?(dt?(+p[2])+'.'+(+p[1])+'.'+p[0]:v.slice(0,5).replace(':','.')):(dt?'pp.kk.vvvv':'hh.mm');sh.classList.toggle('ph',!v);}
  Object.defineProperty(inp,'value',{configurable:true,get:function(){return VAL.get.call(inp);},set:function(v){VAL.set.call(inp,v);upd();}});
  inp.addEventListener('input',upd);inp.addEventListener('change',upd);
  inp.addEventListener('click',function(){try{if(inp.showPicker)inp.showPicker();}catch(e){}});upd();}
function fiAll(root){Array.prototype.forEach.call((root||document).querySelectorAll('input[type="date"],input[type="time"]'),fiPick);}
try{new MutationObserver(function(){fiAll();}).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function $(id){return document.getElementById(id);}
function nowIso(){return new Date().toISOString();}
function todayIso(){return isoD(new Date());}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function button(parent,txt,cls,fn){var b=el('button',cls||'btn',txt);b.type='button';if(fn)b.addEventListener('click',fn);parent.appendChild(b);return b;}

var data={K:[],k:null,cur:null,projects:[],notes:[],terms:[],words:{},trash:[],imp:[],reps:[],chk:[],grp:[],win:{},calv:null,lists:[],jl:null,ehdot:[],pk:[],pv:{on:[],c:{},d:{}},st:[],fl:{m:{},run:{}},cfg:{tint:'forest',mode:'auto',size:'normal',font:'system',edge:'soft',glass:'off',dur:'30'},meta:{lastExport:null,dirty:0}};
/* Projektit (kokonaisuudet): data.K. Aktiivisen projektin puut, muistiinpanot, termit ja tärkeät ovat data.*-kentissä. */
function kOf(){for(var i=0;i<data.K.length;i++)if(data.K[i].id===data.k)return data.K[i];return null;}
var KF=['cur','projects','notes','terms','words','trash','imp','reps','chk','grp','win','calv','lists','jl','ehdot','pk','pv','st','fl','cfg'];
var CFG0={tint:'forest',mode:'auto',size:'normal',font:'system',edge:'soft',glass:'off',dur:'30'};
function stashK(){var k=kOf();if(k)KF.forEach(function(f){k[f]=data[f];});}
function loadK(k){if(!Array.isArray(k.pk))k.pk=[];if(!k.pv||!Array.isArray(k.pv.on))k.pv={on:[],c:{},d:{}};if(!Array.isArray(k.st))k.st=[];if(!k.fl||!k.fl.m)k.fl={m:{},run:{}};if(!k.cfg)k.cfg=Object.assign({},data.cfg||CFG0);Object.keys(CFG0).forEach(function(c){if(typeof k.cfg[c]!=='string')k.cfg[c]=CFG0[c];});data.k=k.id;KF.forEach(function(f){data[f]=k[f];});}
function newK(name){return {id:uid('k'),name:clean(name).slice(0,80)||'Projekti',cur:null,projects:[],notes:[],terms:[],words:{},trash:[],imp:[],reps:[],chk:[],grp:[],win:{},calv:null,lists:[],jl:null,ehdot:[],pk:[],pv:{on:[],c:{},d:{}},st:[],fl:{m:{},run:{}},cfg:Object.assign({},data.cfg||CFG0)};}
function applyND(nd){data.K=nd.K;data.K.forEach(function(k){k.trash=purgeTrash(k.trash,Date.now());});loadK(data.K.filter(function(k){return k.id===nd.k;})[0]);}
try{var raw=JSON.parse(localStorage.getItem(KEY)||'null'),nd=normalizeData(raw);
  if(nd){applyND(nd);if(raw.meta)data.meta={lastExport:raw.meta.lastExport||null,dirty:raw.meta.dirty||0};
    /* 1.31: vanha tallennus ilman projektikohtaista seurantaa: viemättömät muutokset lasketaan tälle päivälle */
    if(data.meta.dirty>0&&!data.K.some(function(k){return k.chg;}))data.K.forEach(function(k){k.chg=todayIso();});}}catch(e){}
if(!data.K.length){var k0=newK('Projekti');data.K.push(k0);loadK(k0);}
var storeOk=true;
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});}catch(e){}
function snapshot(){stashK();return {app:'paatospuu',ver:VER,savedAt:nowIso(),kcur:data.k,kokonaisuudet:data.K.map(function(k){return {id:k.id,name:k.name,cur:k.cur,puut:k.projects,muistiinpanot:k.notes,termit:k.terms,termisanat:k.words,roskakori:k.trash,tarkeat:k.imp,toistuvat:k.reps,tarkistuslista:k.chk&&k.chk.length?k.chk:undefined,ryhmat:k.grp&&k.grp.length?k.grp:undefined,listat:k.lists&&k.lists.length?k.lists:undefined,jatkuvalista:k.jl||undefined,ehdot:k.ehdot&&k.ehdot.length?k.ehdot:undefined,pikat:k.pk&&k.pk.length?k.pk:undefined,paivanapit:pvOut(k.pv),yksinkertaisetPuut:k.st&&k.st.length?k.st:undefined,flow:flOut(k.fl),asetukset:k.cfg||undefined,aikavalit:k.win&&Object.keys(k.win).length?k.win:undefined,kalenteri:calvOut(k.calv),muokattu:k.mod||undefined,viety:k.ex||undefined,viematta:k.chg||undefined};}),cfg:data.cfg};}
/* 1.98: tekstien kuittausten kohdistus ja johdettu N.done ennen tallennusta ja piirtoa (muisti: vain muuttuneet muistiinpanot) */
var txMemo=typeof WeakMap!=='undefined'?new WeakMap():null;
function txAll(){var t=todayIso();(data.notes||[]).forEach(function(N){var k=t+'|'+N.text+'|'+N.date+'|'+JSON.stringify(N.pts||0)+'|'+JSON.stringify(N.tx||0)+'|'+(N.done||'')+'|'+JSON.stringify(N.rel||0)+JSON.stringify(N.bt||0)+JSON.stringify(N.rg||0);
  if(txMemo&&txMemo.get(N)===k)return;if(txSync(N,t)&&N.rep)repSignOff(data.reps,N,t);
  if(txMemo)txMemo.set(N,t+'|'+N.text+'|'+N.date+'|'+JSON.stringify(N.pts||0)+'|'+JSON.stringify(N.tx||0)+'|'+(N.done||'')+'|'+JSON.stringify(N.rel||0)+JSON.stringify(N.bt||0)+JSON.stringify(N.rg||0));});}
function save(){try{phaseEnsure(data);txAll();var o=snapshot();o.meta=data.meta;localStorage.setItem(KEY,JSON.stringify(o));storeOk=true;}catch(e){storeOk=false;}}
/* Muutosseuranta viennin pallerolle ja tuonnin varoitukselle (Emil 22.10.2026): mod = viimeisin muutos, chg = ensimmäisen viemättömän
   muutoksen päivä (paikallinen), ex = projektin viimeisin vienti. Koko appin vienti nollaa kaikkien chg:n, projektin vienti oman. */
function touch(){var P=proj(),k=kOf();if(P)rulesToText(P);if(k){k.mod=nowIso();if(!k.chg)k.chg=todayIso();}data.meta.dirty=(data.meta.dirty||0)+1;save();renderStatus();}
function proj(){for(var i=0;i<data.projects.length;i++)if(data.projects[i].id===data.cur)return data.projects[i];return null;}
if(!proj())data.cur=data.projects.length?data.projects[0].id:null;

/* ---- ulkoasu ---- */
/* 1.86 Värikone (Emil 25.10.2026, Appiestetiikat-artefaktista): pohjaväri, luonne, kylläisyys, kontrasti ja taustan vaaleus, laskenta OKLCH:ssa.
   Valmiit paletit ja vanhat teemat poistettiin (tallessa projektikansiossa, palautus versiosta 1.85.1). Tekstin vaaleutta siirretään, kunnes
   kontrasti on vähintään 4,5:1. Kuittaus pysyy kuusenvihreänä (h 172) ja poisto viininpunaisena (h 8), vain luonteeseen sovitettuna. */
function kLin(x){return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);}
function kGam(x){return x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055;}
function oklchRgb(L,C,h){var a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180),l=Math.pow(L+.3963377774*a+.2158037573*b,3),m=Math.pow(L-.1055613458*a-.0638541728*b,3),s=Math.pow(L-.0894841775*a-1.2914855480*b,3);
  return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.7076147010*s];}
function inGamut(v){return v.every(function(x){return x>=-1e-4&&x<=1+1e-4;});}
function hexOf(L,C,h){L=Math.max(0,Math.min(1,L));C=Math.max(0,C);var rgb=oklchRgb(L,C,h);
  if(!inGamut(rgb)){var lo=0,hi=C;for(var i=0;i<22;i++){var mid=(lo+hi)/2;if(inGamut(oklchRgb(L,mid,h)))lo=mid;else hi=mid;}rgb=oklchRgb(L,lo,h);}
  return '#'+rgb.map(function(x){var v=Math.round(Math.max(0,Math.min(1,kGam(Math.max(0,x))))*255).toString(16);return v.length<2?'0'+v:v;}).join('').toUpperCase();}
function lumHex(hx){var v=[1,3,5].map(function(i){return kLin(parseInt(hx.substr(i,2),16)/255);});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function crHex(a,b){var x=lumHex(a),y=lumHex(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function readable(L,C,h,bgs,min){min=min||4.5;var down=lumHex(bgs[0])>.18,x=hexOf(L,C,h),bad=function(){return bgs.some(function(b){return crHex(x,b)<min;});};
  for(var i=0;i<110&&bad();i++){L+=down?-.01:.01;x=hexOf(L,C,h);}return x;}
function onColor(bg,h){var d=readable(.22,.03,h,[bg]),w=readable(.985,.01,h,[bg]);return crHex(d,bg)>=crHex(w,bg)?d:w;}
var LUONNE=[['pastelli','Pastelli'],['murretut','Murretut voimakkaat'],['vahavari','Vähävärinen kontrasti'],['kaksi','Kaksivärinen']];
var POHJAT=[['Viini',8],['Puolukka',20],['Terrakotta',42],['Persikka',58],['Okra',78],['Sinappi',95],['Oliivi',115],['Sammal',135],['Kuusi',165],['Petroli',200],
  ['Meri',228],['Jää',240],['Sininen',258],['Indigo',278],['Laventeli',295],['Luumu',318],['Kanerva',335],['Ruusu',355],['Ebenpuu',250,.14],['Grafiitti',260,0]];
/* p = taustan vaaleus (vaalea asu) tai tummuus (tumma asu), 0–1; kontrasti k siirtää tekstiä ja viivoja taustasta poispäin */
function genPal(dark,H,ch,s,k,p){
  var m=s*2,n=({pastelli:.018,murretut:.014,vahavari:.006,kaksi:.045}[ch]||.014)*m,sm=Math.max(m,.55),N=function(L,c,dh){return hexOf(L,c==null?n:c,H+(dh||0));};
  var bgL,surfL,surf2L,sheetL,lineL,fgL,mutL;
  if(!dark){bgL=.86+.14*p;surfL=Math.min(.997,bgL+.035);surf2L=bgL-.04-.02*k;sheetL=surfL;lineL=bgL-.10-.06*k;fgL=.29-.15*k;mutL=.50-.08*k;}
  else{bgL=.30-.28*p;surfL=bgL+.055;surf2L=bgL+.10;sheetL=bgL+.08;lineL=bgL+.15+.03*k;fgL=.90+.08*k;mutL=.74;}
  var c={bg:N(bgL),surf:N(surfL,n*.7),surf2:N(surf2L),line:N(lineL,n*1.2)};
  c.sheet=N(sheetL,n*.8);c.sheetLine=dark?N(lineL+.06):c.line;
  var BG=[c.bg,c.surf,c.surf2,c.sheet];c.fg=readable(fgL,n*1.3,H,BG);c.mut=readable(mutL,n*1.6,H,BG);
  var ah=ch==='kaksi'?H+180:H,soft=function(L,cc,h){return hexOf(dark?bgL+.09:L,cc,h);};
  if(ch==='pastelli'){c.acc=hexOf(dark?.80:.85,.085*m,ah);c.accSoft=soft(.93,.035*m,ah);c.accTx=readable(dark?.80:.46,.12*m,ah,[c.surf,c.bg,c.accSoft]);c.hi=c.accTx;}
  else if(ch==='vahavari'){c.acc=dark?hexOf(.93,n,H):hexOf(.2,n,H);c.hi=readable(dark?.74:.50,.17*m,H,[c.surf],3);c.accSoft=soft(.94,.03*m,H);c.accTx=readable(dark?.76:.50,.15*m,H,[c.surf,c.bg,c.accSoft]);}
  else if(ch==='kaksi'){c.acc=hexOf(dark?.72:.60,.12*m,ah);c.hi=c.acc;c.accSoft=soft(.92,.04*m,ah);c.accTx=readable(dark?.76:.48,.12*m,ah,[c.surf,c.bg,c.accSoft]);}
  else{c.acc=hexOf(dark?.74:.60,.13*m,ah);c.accSoft=soft(.92,.04*m,ah);c.accTx=readable(dark?.78:.46,.12*m,ah,[c.surf,c.bg,c.accSoft]);c.hi=readable(dark?.74:.46,.11*m,H+150,[c.surf],3);}
  c.accFg=onColor(c.acc,ah);c.hiFg=onColor(c.hi,H);
  c.ok=hexOf(dark?.72:(ch==='pastelli'?.85:.50),((ch==='pastelli'&&!dark)?.07:.10)*sm,172);c.okFg=onColor(c.ok,172);
  c.dng=soft(.93,.04*sm,8);c.dngTx=readable(dark?.74:.46,(dark?.12:.15)*sm,8,[c.surf,c.bg,c.sheet,c.dng]);
  c.warnSoft=soft(.94,.04*sm,78);c.warn=readable(dark?.80:.52,.11*sm,75,[c.warnSoft,c.surf]);c.bar=c.bg;
  var ac=hexOf(dark?.62:.56,.11*sm,ch==='kaksi'?ah:H+(ch==='murretut'?150:0));
  var a=dark?[N(bgL+.07,n*1.5+.02),hexOf(.85,.09,85),N(bgL+.14,n*1.5+.02,20),hexOf(Math.max(bgL-.04,.05),n+.01,H),ac,hexOf(.95,.01,H)]
    :[N(.9,.04*m),hexOf(.86,.1,85),N(.78,.05*m,20),hexOf(.32,.04*m,H),ac,'#FFFFFF'];
  return {c:c,a:a,dot:dark?'rgba(255,255,255,.12)':'rgba(0,0,0,.10)'};}
/* Kaikki 0.61 (SUUNNITELMA: Ulkoasuvaihtoehdot, Emilin palaute 23.11.2026): valmis ilme Lehto (vaalea) ja Hiillos (tumma) värikoneen rinnalle.
   Pinnat ja teksti ovat kiinteät, aksentti ja otsikkofontti valitaan näytteistä. Kuittaus, virhe ja varoitus pysyvät omina väreinään aksentista riippumatta.
   Lehdossa ei vihreää väritystä (kuittauksen oma väri on toiminnallinen). Emil 23.11.2026: ilme on oletus; cfg.ilme='oma' palauttaa värikoneen. */
var ILME_D=[['koralli','Koralli','#F19979','#C9B4E8'],['laventeli','Laventeli','#B9A6F2','#E3C58A'],['sininen','Viileä sininen','#86B8EA','#C9B4E8']];
var ILME_L=[['sininen','Murrettu sininen','#3B5B82','#8F5A0E'],['luumu','Luumu','#7B3F66','#8F5A0E']];
/* Otsikkofontit: vain laitteen omia fontteja (ei latauksia). Ensimmäinen nimi on iPhonen fontti, perässä lähimmät varat muille laitteille. */
var ILME_F=[['ny','New York','ui-serif,"New York","Iowan Old Style",Georgia,serif'],['iowan','Iowan','"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif'],
  ['charter','Charter','Charter,"Bitstream Charter","Sitka Text",Cambria,Georgia,serif'],['didot','Didot','Didot,"Bodoni 72","Bodoni MT","Bodoni 72 Oldstyle",Georgia,serif'],
  ['avenir','Avenir Next','"Avenir Next",Avenir,"Century Gothic","Segoe UI",system-ui,sans-serif'],['system','Järjestelmä','']];
var ILME_HF={l:'avenir',d:'ny'};
function ilmeOn(cf){return (cf||{}).ilme!=='oma';}
function ilmeAcc(dark,cf){var A=dark?ILME_D:ILME_L,v=dark?cf.dacc:cf.lacc;return A.filter(function(x){return x[0]===v;})[0]||A[0];}
function ilmeFont(dark,cf){var v=(dark?cf.dhf:cf.lhf)||ILME_HF[dark?'d':'l'];return ILME_F.filter(function(x){return x[0]===v;})[0]||ILME_F[0];}
function hexMix(a,b,t){var o='#';for(var i=1;i<7;i+=2){var x=parseInt(a.substr(i,2),16),y=parseInt(b.substr(i,2),16),v=Math.round(x+(y-x)*t).toString(16);o+=(v.length<2?'0':'')+v;}return o.toUpperCase();}
/* Väri siirtyy tekstin väriä kohti, kunnes kontrasti kaikkia pintoja vasten on vähintään min */
function hexFit(x,to,bgs,min){min=min||4.5;for(var i=0;i<20&&bgs.some(function(b){return crHex(x,b)<min;});i++)x=hexMix(x,to,.08);return x;}
function ilmePal(dark,cf){var q=ilmeAcc(dark,cf),ac=q[2],P=genPal(dark,dark?60:75,'vahavari',.2,.5,.75),c=P.c,
    B=dark?{bg:'#222429',surf:'#2A2D33',surf2:'#33363D',sheet:'#2C2F35',line:'#41444C',sheetLine:'#4A4E57',fg:'#F3EBDD',mut:'#BDB4A6'}
      :{bg:'#F7F3EC',surf:'#FFFDF9',surf2:'#EEE8DE',sheet:'#FFFDF9',line:'#DDD6CA',sheetLine:'#DDD6CA',fg:'#26231F',mut:'#665F56'};
  Object.keys(B).forEach(function(k){c[k]=B[k];});c.bar=c.bg;
  var BG=[c.bg,c.surf,c.surf2,c.sheet];
  c.accSoft=hexMix(c.surf,ac,dark?.15:.12);c.acc=ac;c.accFg=dark?c.bg:'#FFFFFF';c.accTx=hexFit(ac,c.fg,BG.concat([c.accSoft]));
  c.hi=hexFit(q[3],c.fg,[c.surf,c.surf2]);c.hiFg=dark?c.bg:'#FFFFFF';
  c.ok=dark?'#5AB99D':'#00755D';c.okFg=dark?'#16211D':'#FFFFFF';
  c.dngTx=dark?'#FF8E9E':'#A3262F';c.dng=hexMix(c.surf,c.dngTx,dark?.16:.1);
  c.warn=dark?'#E8C36F':'#7F5300';c.warnSoft=hexMix(c.surf,dark?'#E8C36F':'#E0B04A',dark?.14:.2);
  P.dot=dark?'rgba(243,235,221,.10)':'rgba(38,35,31,.09)';return P;}
/* Vanhat valinnat (tint = teema, pal = paletti) muunnetaan lähimmiksi säätimiksi: [sävy, luonne, kylläisyys, kontrasti, vaaleus, tumma] */
var KMIG={"t:forest":[161,"murretut",31,50,75,0],"t:lake":[250,"murretut",39,50,74,0],"t:plum":[334,"murretut",31,50,73,0],"t:sand":[72,"murretut",34,50,73,0],"t:rose":[31,"murretut",41,50,73,0],"t:graphite":[90,"vahavari",15,50,74,0],"t:lagoon":[189,"murretut",27,50,74,0],"t:lavender":[299,"murretut",35,50,72,0],"t:olive":[120,"murretut",33,50,73,0],"t:copper":[58,"murretut",36,50,70,0],"usva":[289,"pastelli",55,50,73,0],"kirjo":[79,"murretut",52,50,50,0],"graafi":[268,"vahavari",85,50,100,0],"kuusikko":[175,"murretut",21,50,67,0],"halli":[46,"vahavari",54,50,30,0],"revontuli":[294,"murretut",41,50,32,1],"riso":[183,"kaksi",66,50,75,0],"grafiitti":[78,"vahavari",49,50,39,1],"satu0":[288,"kaksi",45,50,23,1],"satu1":[92,"murretut",28,50,25,1],"satu2":[322,"kaksi",33,50,26,1],"satu3":[253,"kaksi",43,50,28,1],"satu4":[307,"kaksi",51,50,13,1],"satu5":[67,"murretut",50,50,28,1],"satu6":[306,"murretut",26,50,20,1],"satu7":[287,"murretut",44,50,70,0],"vrk0":[86,"pastelli",58,50,78,0],"vrk1":[38,"murretut",51,50,17,1],"vrk2":[260,"kaksi",29,50,18,1],"vrk3":[271,"kaksi",30,50,37,1],"vrk4":[79,"vahavari",33,50,33,1],"vrk5":[14,"vahavari",64,50,35,1],"vrk6":[56,"murretut",46,50,25,1],"vrk7":[57,"murretut",52,50,16,1],"piki0":[250,"vahavari",25,50,100,1],"piki1":[175,"vahavari",28,50,100,1],"piki2":[82,"vahavari",32,50,100,1],"piki3":[299,"vahavari",32,50,100,1]};
/* Linkitetty vaalea ja tumma (Emil 25.10.2026): vaalean arvot ovat pohja, tumma seuraa niitä. Tumman oma arvo on avaimessa 'd'+avain,
   ja sen poisto palauttaa vaalean mukaiseksi. Tilakohtaisia ovat värit, nappien efekti sekä taustakuvan sumennus ja himmennys. */
var KKEYS=[['kh','h',161],['kc','ch','murretut'],['ks','s',31],['kk','k',50],['kp','p',75]],KSPEC=['kh','kc','ks','kk','kp','bfx','blur','dim'];
function kMig(cf){return cf.kh==null?(KMIG[cf.pal]||KMIG['t:'+(cf.tint||'forest')]||KMIG['t:forest']):null;}
function kRaw(cf,key,dark){if(dark&&cf['d'+key]!=null)return cf['d'+key];var m=kMig(cf),i=-1;KKEYS.forEach(function(q,j){if(q[0]===key)i=j;});
  if(i>=0&&m)return String(m[i]);return cf[key];}
function kVals(cf,dark){var o={};KKEYS.forEach(function(q){var v=kRaw(cf,q[0],dark);o[q[1]]=v==null||v===''?q[2]:v;});
  o.h=((+o.h||0)%360+360)%360;o.s=Math.max(0,Math.min(1,+o.s/100||0));o.k=Math.max(0,Math.min(1,+o.k/100||0));o.p=Math.max(0,Math.min(1,+o.p/100||0));
  if(!LUONNE.some(function(x){return x[0]===o.ch;}))o.ch='murretut';return o;}
/* Ensimmäinen säätö kirjoittaa muunnetut arvot auki ja poistaa vanhat avaimet; tummasta paletista tulee Tumma-tila */
function kFix(cf){var m=kMig(cf);if(m){KKEYS.forEach(function(q,i){cf[q[0]]=String(m[i]);});if(m[5]&&KMIG[cf.pal])cf.mode='dark';}delete cf.tint;delete cf.pal;}
function kOldDark(cf){var m=cf.kh==null&&KMIG[cf.pal];return !!(m&&m[5]);}

/* 1.82 Estetiikka (Emil 24.10.2026): Appiestetiikat-artefaktin muotokielet,
   nappimuunnelmat, kuittaustyyli ja kuvitus (paletit korvattiin värikoneella 1.86). Kaikki valitaan toisistaan irrallaan ja tallentuvat projektikohtaisesti. */
var ESTE_LOOKS=[{"id":"juuri","n":"Juuri"},{"id":"usva","n":"Usva","rb":16,"rc":20,"rs":26,"rch":999,"rk":"8px","bh":42,"edge":"none","fx":"shadow","ck":"fill","tab":"pill","hf":"rounded","bf":"rounded","caps":0,"hz":0,"cl":0},{"id":"kirjo","n":"Kirjo","rb":10,"rc":14,"rs":18,"rch":6,"rk":"6px","bh":40,"edge":"thick","fx":"offset","ck":"fill","tab":"block","hf":"system","bf":"system","caps":0,"hz":0,"cl":1},{"id":"graafi","n":"Graafi","rb":4,"rc":6,"rs":8,"rch":4,"rk":"3px","bh":40,"edge":"thin","fx":"flat","ck":"fill","tab":"line","hf":"system","bf":"system","caps":1,"hz":0,"cl":1},{"id":"kuusikko","n":"Kuusikko","rb":999,"rc":22,"rs":28,"rch":999,"rk":"50%","bh":44,"edge":"none","fx":"shadow","ck":"fill","tab":"pill","hf":"rounded","bf":"rounded","caps":0,"hz":0,"cl":0},{"id":"satu","n":"Satumetsä","rb":14,"rc":18,"rs":24,"rch":999,"rk":"50%","bh":42,"edge":"none","fx":"glow","ck":"fill","tab":"dot","hf":"serif","bf":"system","caps":0,"hz":0,"cl":0},{"id":"halli","n":"Halli","rb":2,"rc":3,"rs":4,"rch":2,"rk":"2px","bh":40,"edge":"thin","fx":"press","ck":"fill","tab":"line","hf":"mono","bf":"system","caps":1,"hz":1,"cl":1},{"id":"revontuli","n":"Revontuli","rb":12,"rc":16,"rs":22,"rch":999,"rk":"50%","bh":42,"edge":"thin","fx":"glass","ck":"line","tab":"dot","hf":"system","bf":"system","caps":0,"hz":0,"cl":0},{"id":"riso","n":"Riso","rb":8,"rc":10,"rs":16,"rch":999,"rk":"6px","bh":40,"edge":"none","fx":"offset","ck":"fill","tab":"block","hf":"system","bf":"system","caps":0,"hz":0,"cl":1},{"id":"grafiitti","n":"Grafiitti","rb":8,"rc":10,"rs":14,"rch":6,"rk":"5px","bh":40,"edge":"thin","fx":"flat","ck":"fill","tab":"line","hf":"system","bf":"system","caps":0,"hz":0,"cl":1},{"id":"piki","n":"Pikimusta","rb":10,"rc":12,"rs":18,"rch":8,"rk":"50%","bh":40,"edge":"thin","fx":"flat","ck":"fill","tab":"line","hf":"system","bf":"system","caps":0,"hz":0,"cl":1}];
var ESTE_ARTS=[["puu1","Puu: lehvä","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"70\"/><rect class=\"a2\" y=\"70\" width=\"300\" height=\"50\"/><circle class=\"a1\" cx=\"238\" cy=\"30\" r=\"13\"/><g class=\"a5\" opacity=\".7\"><circle cx=\"40\" cy=\"22\" r=\"1.1\"/><circle cx=\"90\" cy=\"40\" r=\"1\"/><circle cx=\"270\" cy=\"54\" r=\"1\"/></g><g class=\"a3 ln\" style=\"stroke-width:3\"><path d=\"M150 52L140 43M150 47L161 38\"/></g><path class=\"a3\" d=\"M146.5 70V40h7v30z\"/><g class=\"a4\"><circle cx=\"150\" cy=\"28\" r=\"19\"/><circle cx=\"133\" cy=\"38\" r=\"14\"/><circle cx=\"167\" cy=\"38\" r=\"14\"/></g><rect class=\"a3\" y=\"69\" width=\"300\" height=\"1.6\" opacity=\".55\"/><g class=\"a3 ln\" style=\"stroke-width:3.2\"><path d=\"M150 70C150 84 140 90 124 98M150 70C151 84 158 92 176 100M150 72C149 88 151 98 149 112\"/></g><g class=\"a3 ln\" style=\"stroke-width:1.8\"><path d=\"M147 72C140 79 128 80 116 80M153 72C160 78 172 78 184 83M137 91C132 98 128 104 128 110M164 94C170 100 172 106 172 112\"/></g></svg>"],["puu2","Puu: oksat ja juuret","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"70\"/><rect class=\"a2\" y=\"70\" width=\"300\" height=\"50\"/><circle class=\"a1\" cx=\"62\" cy=\"32\" r=\"11\"/><rect class=\"a3\" y=\"69\" width=\"300\" height=\"1.6\" opacity=\".55\"/><g class=\"a3 ln\" style=\"stroke-width:3.4\"><path d=\"M150 70V14M150 50L130 32M150 40L168 22M150 58L172 46\"/><path d=\"M150 70V114M150 82L128 96M150 90L170 106M150 78L174 86\"/></g><g class=\"a3 ln\" style=\"stroke-width:1.8\"><path d=\"M130 32L122 30M130 32L128 22M168 22L176 20M168 22L166 12M172 46L182 46M172 46L178 38\"/><path d=\"M128 96L118 96M128 96L124 106M170 106L180 108M170 106L170 116M174 86L184 84M174 86L182 94\"/></g><g class=\"a4\"><circle cx=\"122\" cy=\"30\" r=\"4\"/><circle cx=\"128\" cy=\"21\" r=\"4.5\"/><circle cx=\"176\" cy=\"20\" r=\"4\"/><circle cx=\"166\" cy=\"11\" r=\"4.5\"/><circle cx=\"182\" cy=\"46\" r=\"4\"/><circle cx=\"178\" cy=\"37\" r=\"4\"/><circle cx=\"150\" cy=\"12\" r=\"5\"/></g></svg>"],["puu3","Puu: taimi","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"70\"/><rect class=\"a2\" y=\"70\" width=\"300\" height=\"50\"/><circle class=\"a1\" cx=\"150\" cy=\"58\" r=\"30\" opacity=\".35\"/><circle class=\"a1\" cx=\"150\" cy=\"58\" r=\"18\" opacity=\".6\"/><rect class=\"a2\" y=\"70\" width=\"300\" height=\"50\"/><rect class=\"a3\" y=\"69\" width=\"300\" height=\"1.6\" opacity=\".55\"/><g class=\"a3 ln\" style=\"stroke-width:2.6\"><path d=\"M150 70C150 62 150 54 150 46\"/></g><path class=\"a4\" d=\"M150 50C138 50 130 42 128 32C140 32 149 38 150 50Z\"/><path class=\"a4\" d=\"M150 46C153 34 162 28 174 28C172 40 162 46 150 46Z\"/><g class=\"a3 ln\" style=\"stroke-width:2.4\"><path d=\"M150 70C150 82 146 92 148 112\"/></g><g class=\"a3 ln\" style=\"stroke-width:1.4\"><path d=\"M150 80C144 84 138 85 132 84M149 90C156 94 162 96 168 96M148 100C142 104 140 108 140 112\"/></g></svg>"],["puu4","Puu: juuristo","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"34\"/><rect class=\"a2\" y=\"34\" width=\"300\" height=\"86\"/><path class=\"a3\" d=\"M148 34V22h4v12z\"/><circle class=\"a4\" cx=\"150\" cy=\"17\" r=\"8\"/><circle class=\"a4\" cx=\"143\" cy=\"22\" r=\"5.5\"/><circle class=\"a4\" cx=\"157\" cy=\"22\" r=\"5.5\"/><rect class=\"a3\" y=\"33\" width=\"300\" height=\"1.4\" opacity=\".55\"/><g class=\"a3 ln\" style=\"stroke-width:3\"><path d=\"M150 34C150 50 132 60 104 70C84 77 70 88 62 104M150 34C150 52 170 62 196 72C216 80 230 92 236 108M150 36C150 60 150 84 150 112\"/></g><g class=\"a3 ln\" style=\"stroke-width:1.6\"><path d=\"M104 70C100 82 98 94 100 108M62 104C52 106 44 104 36 98M196 72C196 86 192 98 186 108M236 108C246 108 256 104 264 98M150 70C140 78 130 90 126 104M150 64C160 74 168 86 170 100M128 58C118 52 104 48 88 48M174 60C186 52 200 48 214 50\"/></g><g class=\"a1\"><circle cx=\"100\" cy=\"108\" r=\"2.2\"/><circle cx=\"36\" cy=\"98\" r=\"2.2\"/><circle cx=\"186\" cy=\"108\" r=\"2.2\"/><circle cx=\"264\" cy=\"98\" r=\"2.2\"/><circle cx=\"126\" cy=\"104\" r=\"2\"/><circle cx=\"170\" cy=\"100\" r=\"2\"/><circle cx=\"88\" cy=\"48\" r=\"2\"/><circle cx=\"214\" cy=\"50\" r=\"2\"/><circle cx=\"150\" cy=\"112\" r=\"2.2\"/></g></svg>"],["puu5","Puu: latvus","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"104\"/><rect class=\"a2\" y=\"104\" width=\"300\" height=\"16\"/><circle class=\"a1\" cx=\"252\" cy=\"26\" r=\"10\"/><path class=\"a3\" d=\"M143 104C146 90 146 76 147 62h6c1 14 1 28 4 42z\"/><g class=\"a3 ln\" style=\"stroke-width:3\"><path d=\"M150 78L128 62M150 72L172 56M150 66V40\"/></g><g class=\"a4\"><circle cx=\"150\" cy=\"34\" r=\"24\"/><circle cx=\"122\" cy=\"48\" r=\"20\"/><circle cx=\"178\" cy=\"46\" r=\"20\"/><circle cx=\"104\" cy=\"62\" r=\"12\"/><circle cx=\"196\" cy=\"60\" r=\"12\"/><circle cx=\"136\" cy=\"64\" r=\"13\"/><circle cx=\"166\" cy=\"64\" r=\"13\"/></g><g class=\"a5\" opacity=\".28\"><circle cx=\"140\" cy=\"24\" r=\"8\"/><circle cx=\"114\" cy=\"40\" r=\"5\"/><circle cx=\"170\" cy=\"36\" r=\"6\"/></g><g class=\"a3 ln\" style=\"stroke-width:2\"><path d=\"M144 104C138 108 130 110 120 110M156 104C162 108 170 110 180 110M150 104V116\"/></g></svg>"],["puu6","Puu: tunnus","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"120\"/><circle class=\"a2\" cx=\"150\" cy=\"60\" r=\"52\"/><path class=\"a3\" d=\"M98 60a52 52 0 0 0 104 0z\" opacity=\".3\"/><rect class=\"a3\" x=\"94\" y=\"59\" width=\"112\" height=\"1.6\"/><path class=\"a3\" d=\"M147.5 60V34h5v26z\"/><g class=\"a4 ln\" style=\"stroke-width:3\"><path d=\"M150 34V16M150 36L134 22M150 36L166 22M150 42L128 34M150 42L172 34\"/></g><g class=\"a4\"><circle cx=\"150\" cy=\"14\" r=\"4.5\"/><circle cx=\"133\" cy=\"21\" r=\"4\"/><circle cx=\"167\" cy=\"21\" r=\"4\"/><circle cx=\"127\" cy=\"34\" r=\"3.5\"/><circle cx=\"173\" cy=\"34\" r=\"3.5\"/></g><g class=\"a3 ln\" style=\"stroke-width:3\"><path d=\"M150 60V100M150 62L134 86M150 62L166 86M150 64L128 74M150 64L172 74\"/></g><g class=\"a1\"><circle cx=\"150\" cy=\"102\" r=\"3\"/><circle cx=\"133\" cy=\"88\" r=\"2.6\"/><circle cx=\"167\" cy=\"88\" r=\"2.6\"/><circle cx=\"126\" cy=\"75\" r=\"2.2\"/><circle cx=\"174\" cy=\"75\" r=\"2.2\"/></g></svg>"],["puu7","Puu: yhteys","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"66\"/><rect class=\"a2\" y=\"66\" width=\"300\" height=\"54\"/><circle class=\"a1\" cx=\"270\" cy=\"20\" r=\"8\"/><g class=\"a3\"><rect x=\"68\" y=\"44\" width=\"4\" height=\"22\" rx=\"1\"/><rect x=\"148\" y=\"38\" width=\"4\" height=\"28\" rx=\"1\"/><rect x=\"228\" y=\"48\" width=\"4\" height=\"18\" rx=\"1\"/></g><g class=\"a4\"><circle cx=\"70\" cy=\"38\" r=\"12\"/><circle cx=\"150\" cy=\"28\" r=\"16\"/><circle cx=\"230\" cy=\"42\" r=\"10\"/></g><rect class=\"a3\" y=\"65\" width=\"300\" height=\"1.4\" opacity=\".55\"/><g class=\"a3 ln\" style=\"stroke-width:2.4\"><path d=\"M70 66C70 84 100 92 150 92C200 92 230 84 230 66M150 66V92\"/></g><g class=\"a3 ln\" style=\"stroke-width:1.4;opacity:.8\"><path d=\"M70 74C80 100 120 106 150 106C180 106 220 100 230 74M150 92V114M40 66C44 80 56 86 70 86M230 80C250 86 262 84 272 76\"/></g><g class=\"a1\"><circle cx=\"150\" cy=\"92\" r=\"3\"/><circle cx=\"110\" cy=\"89\" r=\"2\"/><circle cx=\"190\" cy=\"89\" r=\"2\"/><circle cx=\"150\" cy=\"106\" r=\"2.2\"/></g></svg>"],["puu8","Puu: vuosirenkaat","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"120\"/><circle class=\"a2\" cx=\"150\" cy=\"64\" r=\"46\"/><g class=\"a3 ln\" style=\"stroke-width:1.4\"><circle cx=\"152\" cy=\"65\" r=\"7\"/><circle cx=\"151\" cy=\"65\" r=\"14\"/><circle cx=\"151\" cy=\"64\" r=\"21\"/><circle cx=\"150\" cy=\"64\" r=\"28\"/><circle cx=\"150\" cy=\"64\" r=\"35\"/><circle cx=\"150\" cy=\"64\" r=\"41.5\"/><path d=\"M152 65L176 44\"/></g><g class=\"a3 ln\" style=\"stroke-width:2.2\"><path d=\"M188 36C192 28 192 20 190 12\"/></g><path class=\"a4\" d=\"M190 18C182 18 176 12 175 6C183 6 189 10 190 18Z\"/><path class=\"a4\" d=\"M190 16C193 8 199 4 206 4C205 12 198 16 190 16Z\"/><circle class=\"a1\" cx=\"152\" cy=\"65\" r=\"2.4\"/></svg>"],["ruska","Ruska (omat värit)","<svg viewBox=\"0 0 300 120\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><rect fill=\"#2E3A3F\" width=\"300\" height=\"70\"/><rect fill=\"#4A3A2E\" y=\"70\" width=\"300\" height=\"50\"/><circle fill=\"#E8B05A\" cx=\"238\" cy=\"30\" r=\"12\"/><g fill=\"none\" stroke=\"#2A1E18\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M150 52L140 43M150 47L161 38\"/></g><path fill=\"#2A1E18\" d=\"M146.5 70V40h7v30z\"/><circle fill=\"#B5532E\" cx=\"133\" cy=\"38\" r=\"14\"/><circle fill=\"#D9823B\" cx=\"167\" cy=\"38\" r=\"14\"/><circle fill=\"#C8692F\" cx=\"150\" cy=\"28\" r=\"19\"/><circle fill=\"#E8B05A\" cx=\"142\" cy=\"22\" r=\"6\" opacity=\".55\"/><g fill=\"#D9823B\"><ellipse cx=\"186\" cy=\"58\" rx=\"3\" ry=\"1.6\" transform=\"rotate(30 186 58)\"/><ellipse cx=\"112\" cy=\"62\" rx=\"3\" ry=\"1.6\" transform=\"rotate(-25 112 62)\"/><ellipse cx=\"200\" cy=\"68\" rx=\"3\" ry=\"1.6\"/></g><rect fill=\"#1E1612\" y=\"69\" width=\"300\" height=\"1.6\"/><g fill=\"none\" stroke=\"#2A1E18\" stroke-width=\"3.2\" stroke-linecap=\"round\"><path d=\"M150 70C150 84 140 90 124 98M150 70C151 84 158 92 176 100M150 72C149 88 151 98 149 112\"/></g><g fill=\"none\" stroke=\"#2A1E18\" stroke-width=\"1.8\" stroke-linecap=\"round\"><path d=\"M147 72C140 79 128 80 116 80M153 72C160 78 172 78 184 83\"/></g></svg>"],["tihea","Tiheä kuusikko","<svg viewBox=\"0 0 400 360\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"400\" height=\"360\"/><circle class=\"a1\" cx=\"300\" cy=\"62\" r=\"20\"/><g class=\"a2\"><path d=\"M-10 130.5L-1.2 169.2L-6.8 169.2L4.6 201.8L-4.2 201.8L10.8 232.4L-30.8 232.4L-15.8 201.8L-24.6 201.8L-13.2 169.2L-18.8 169.2ZM4.8 107.2L14.5 153.3L8.3 153.3L20.9 192.1L11.3 192.1L27.8 228.5L-18.2 228.5L-1.6 192.1L-11.3 192.1L1.4 153.3L-4.8 153.3ZM21.5 126.9L31.5 166L25.1 166L38.2 199L28.2 199L45.3 229.9L-2.2 229.9L14.9 199L4.9 199L17.9 166L11.5 166ZM35.3 100L47.2 150.1L39.6 150.1L55.2 192.3L43.3 192.3L63.7 231.8L6.8 231.8L27.3 192.3L15.4 192.3L31 150.1L23.3 150.1ZM46.5 113.2L57.3 159.5L50.4 159.5L64.5 198.4L53.7 198.4L72.2 234.9L20.8 234.9L39.3 198.4L28.5 198.4L42.6 159.5L35.7 159.5ZM62.4 104.9L73.9 151.9L66.6 151.9L81.5 191.4L70.1 191.4L89.7 228.5L35.1 228.5L54.8 191.4L43.3 191.4L58.3 151.9L51 151.9ZM77.2 123.2L87.1 163.1L80.7 163.1L93.7 196.7L83.8 196.7L100.8 228.2L53.5 228.2L70.5 196.7L60.6 196.7L73.6 163.1L67.2 163.1ZM90.9 109.1L102.5 156.9L95.1 156.9L110.2 197.2L98.7 197.2L118.5 235L63.4 235L83.2 197.2L71.6 197.2L86.8 156.9L79.4 156.9ZM108.3 124.7L117.9 166.4L111.8 166.4L124.3 201.5L114.7 201.5L131.1 234.4L85.5 234.4L101.9 201.5L92.4 201.5L104.9 166.4L98.7 166.4ZM125.8 94.8L136.7 145.7L129.7 145.7L144 188.6L133.1 188.6L151.9 228.8L99.7 228.8L118.5 188.6L107.5 188.6L121.8 145.7L114.8 145.7ZM137.5 93.2L150 145.8L142 145.8L158.4 190L145.9 190L167.3 231.5L107.8 231.5L129.2 190L116.7 190L133 145.8L125 145.8ZM149.9 115.7L159.8 159.6L153.5 159.6L166.4 196.5L156.5 196.5L173.4 231.1L126.4 231.1L143.4 196.5L133.5 196.5L146.4 159.6L140.1 159.6ZM164.6 116L175.5 161.3L168.5 161.3L182.8 199.5L171.9 199.5L190.6 235.2L138.7 235.2L157.4 199.5L146.5 199.5L160.7 161.3L153.7 161.3ZM182 103.1L194.2 153.6L186.4 153.6L202.2 196.1L190.1 196.1L210.9 235.9L153.2 235.9L174 196.1L161.9 196.1L177.7 153.6L169.9 153.6ZM193.4 102.7L206 153.2L197.9 153.2L214.5 195.8L201.8 195.8L223.6 235.7L163.2 235.7L184.9 195.8L172.2 195.8L188.8 153.2L180.7 153.2ZM207.9 104L219.7 151.8L212.2 151.8L227.6 192L215.8 192L236.1 229.7L179.8 229.7L200 192L188.2 192L203.7 151.8L196.1 151.8ZM222.5 124.3L232.3 163.9L226 163.9L238.9 197.2L229.1 197.2L245.9 228.5L199.1 228.5L215.9 197.2L206.1 197.2L219 163.9L212.6 163.9ZM240.4 140L248.6 175.9L243.4 175.9L254 206.1L245.9 206.1L259.9 234.4L220.9 234.4L235 206.1L226.8 206.1L237.5 175.9L232.2 175.9ZM251.6 129.5L261.5 169.2L255.2 169.2L268.2 202.7L258.2 202.7L275.2 234.2L228 234.2L245 202.7L235.1 202.7L248 169.2L241.7 169.2ZM262 107.6L273.1 153.5L266 153.5L280.5 192.1L269.4 192.1L288.4 228.4L235.5 228.4L254.6 192.1L243.5 192.1L258 153.5L250.9 153.5ZM274.6 101.8L286.5 152.7L278.9 152.7L294.3 195.6L282.5 195.6L302.8 235.8L246.4 235.8L266.7 195.6L254.9 195.6L270.4 152.7L262.8 152.7ZM292.6 123.1L302.1 163.2L296 163.2L308.4 197L298.9 197L315.2 228.6L270 228.6L286.3 197L276.8 197L289.2 163.2L283.1 163.2ZM302.9 131.4L311.9 169.3L306.1 169.3L317.9 201.3L308.9 201.3L324.3 231.3L281.4 231.3L296.9 201.3L287.9 201.3L299.6 169.3L293.9 169.3ZM314.1 142.8L321.9 177.8L316.9 177.8L327.1 207.3L319.3 207.3L332.7 234.9L295.5 234.9L308.9 207.3L301.1 207.3L311.3 177.8L306.3 177.8ZM331.8 96.2L343.6 147.4L336 147.4L351.4 190.6L339.6 190.6L359.9 231L303.7 231L323.9 190.6L312.1 190.6L327.5 147.4L320 147.4ZM345.9 110.6L356.8 157L349.9 157L364.1 196.1L353.2 196.1L371.9 232.8L320 232.8L338.7 196.1L327.8 196.1L342 157L335 157ZM360.9 95L372.8 147.1L365.2 147.1L380.8 190.9L368.8 190.9L389.3 232.1L332.5 232.1L353 190.9L341 190.9L356.6 147.1L349 147.1ZM376.7 128.5L386.5 167.2L380.2 167.2L393.1 199.8L383.2 199.8L400.1 230.4L353.2 230.4L370.1 199.8L360.3 199.8L373.1 167.2L366.8 167.2ZM390.8 110.7L401 155.3L394.5 155.3L407.8 192.9L397.6 192.9L415.1 228.1L366.6 228.1L384 192.9L373.9 192.9L387.2 155.3L380.7 155.3ZM405.5 141.9L413.7 176.5L408.4 176.5L419.2 205.6L411 205.6L425.1 232.9L385.9 232.9L400 205.6L391.7 205.6L402.5 176.5L397.2 176.5Z\"/></g><rect class=\"a2\" y=\"228\" width=\"400\" height=\"132\"/><rect class=\"a5\" y=\"196\" width=\"400\" height=\"44\" opacity=\".22\"/><g class=\"a3\"><path d=\"M-14 114.1L2.2 181.6L-8.2 181.6L13 238.4L-3.2 238.4L24.6 291.7L-52.6 291.7L-24.8 238.4L-41 238.4L-19.8 181.6L-30.2 181.6ZM8.2 111.5L22.8 180.8L13.5 180.8L32.5 239.2L17.9 239.2L42.9 293.9L-26.4 293.9L-1.5 239.2L-16 239.2L3 180.8L-6.3 180.8ZM27 115.1L42.1 183.8L32.4 183.8L52.2 241.5L37 241.5L63 295.7L-9.1 295.7L16.9 241.5L1.7 241.5L21.5 183.8L11.8 183.8ZM50.4 115L65.5 181.7L55.9 181.7L75.5 237.9L60.5 237.9L86.3 290.6L14.6 290.6L40.4 237.9L25.3 237.9L45 181.7L35.4 181.7ZM72.2 130.6L85.9 192.2L77.1 192.2L95.1 244.1L81.3 244.1L104.9 292.8L39.5 292.8L63 244.1L49.3 244.1L67.2 192.2L58.5 192.2ZM94.7 101.9L111.4 172.7L100.7 172.7L122.5 232.3L105.8 232.3L134.4 288.2L55 288.2L83.6 232.3L66.9 232.3L88.7 172.7L78 172.7ZM121.5 131.2L136.4 191.4L126.9 191.4L146.3 242.2L131.4 242.2L156.9 289.8L86.2 289.8L111.6 242.2L96.8 242.2L116.2 191.4L106.7 191.4ZM142.4 140.2L156.3 197.7L147.4 197.7L165.5 246.1L151.6 246.1L175.4 291.5L109.4 291.5L133.2 246.1L119.3 246.1L137.4 197.7L128.5 197.7ZM161.6 131.4L176.6 191.9L167 191.9L186.6 242.9L171.6 242.9L197.3 290.7L125.9 290.7L151.6 242.9L136.6 242.9L156.2 191.9L146.6 191.9ZM184.9 98L201.2 170.7L190.8 170.7L212.1 232L195.8 232L223.7 289.4L146 289.4L174 232L157.7 232L179 170.7L168.6 170.7ZM210.7 98.5L226.8 171.9L216.5 171.9L237.5 233.7L221.4 233.7L249 291.6L172.4 291.6L200 233.7L183.9 233.7L204.9 171.9L194.6 171.9ZM230.1 117.7L246.2 183L235.9 183L256.9 238L240.9 238L268.4 289.5L191.8 289.5L219.4 238L203.3 238L224.3 183L214.1 183ZM258.2 139.2L272.3 196.6L263.3 196.6L281.8 244.9L267.6 244.9L291.9 290.2L224.5 290.2L248.8 244.9L234.6 244.9L253.1 196.6L244.1 196.6ZM283.9 102.4L299.3 174L289.4 174L309.5 234.2L294.2 234.2L320.5 290.8L247.3 290.8L273.6 234.2L258.3 234.2L278.4 174L268.5 174ZM305.4 102.5L321.4 173.8L311.2 173.8L332.1 233.9L316.1 233.9L343.6 290.2L267.2 290.2L294.7 233.9L278.7 233.9L299.6 173.8L289.4 173.8ZM328.4 126.1L344.2 188.9L334.1 188.9L354.7 241.7L338.9 241.7L366 291.3L290.8 291.3L317.9 241.7L302.1 241.7L322.7 188.9L312.6 188.9ZM348.3 155.3L361.6 208.6L353.1 208.6L370.5 253.5L357.2 253.5L380 295.5L316.6 295.5L339.4 253.5L326.1 253.5L343.5 208.6L335 208.6ZM378.1 129.5L394 192.6L383.8 192.6L404.6 245.8L388.7 245.8L416 295.6L340.3 295.6L367.5 245.8L351.6 245.8L372.4 192.6L362.2 192.6ZM398.8 110L415.6 180.2L404.8 180.2L426.8 239.3L410 239.3L438.8 294.7L358.7 294.7L387.6 239.3L370.7 239.3L392.7 180.2L382 180.2Z\"/></g><rect class=\"a3\" y=\"288\" width=\"400\" height=\"72\"/><g class=\"a4\"><path d=\"M-20 151.6L-0.5 232.6L-13 232.6L12.4 300.8L-7 300.8L26.3 364.7L-66.3 364.7L-33 300.8L-52.4 300.8L-27 232.6L-39.5 232.6ZM19.4 127.2L43.7 217.3L28.1 217.3L59.9 293.2L35.6 293.2L77.3 364.3L-38.6 364.3L3.1 293.2L-21.2 293.2L10.6 217.3L-5 217.3ZM58.3 105.3L85.7 204.9L68.2 204.9L104.1 288.9L76.6 288.9L123.7 367.5L-7.2 367.5L39.9 288.9L12.5 288.9L48.4 204.9L30.8 204.9ZM114.2 104.6L137 204.2L122.4 204.2L152.3 288L129.4 288L168.6 366.6L59.8 366.6L99 288L76.1 288L106 204.2L91.4 204.2ZM167.1 160.7L187.4 238.1L174.4 238.1L201 303.3L180.6 303.3L215.5 364.4L118.7 364.4L153.6 303.3L133.2 303.3L159.8 238.1L146.8 238.1ZM215.6 146.4L237.6 231.2L223.5 231.2L252.3 302.6L230.3 302.6L268.1 369.5L163.1 369.5L200.9 302.6L178.9 302.6L207.7 231.2L193.6 231.2ZM260.4 158.7L280.6 238.6L267.7 238.6L294.1 305.8L273.9 305.8L308.6 368.9L212.3 368.9L247 305.8L226.7 305.8L253.2 238.6L240.2 238.6ZM314.1 145.4L335.3 228.3L321.7 228.3L349.4 298.1L328.2 298.1L364.6 363.6L263.6 363.6L299.9 298.1L278.7 298.1L306.4 228.3L292.9 228.3ZM368.4 164.6L389.7 242L376.1 242L404 307.2L382.6 307.2L419.2 368.3L317.6 368.3L354.2 307.2L332.8 307.2L360.7 242L347.1 242Z\"/></g><path class=\"a4\" d=\"M0 350Q50.6 344.1 101.2 350.8Q152.7 344.6 204.3 348.6Q241 350.3 277.7 349.5Q319.6 353.3 361.4 347Q392.7 345.5 424.1 347.7V360H0Z\"/></svg>"],["lehto","Lehtimetsä","<svg viewBox=\"0 0 400 360\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"400\" height=\"360\"/><g class=\"a2\"><circle cx=\"251.6\" cy=\"149.3\" r=\"36.3\"/><circle cx=\"385.8\" cy=\"149.2\" r=\"38.6\"/><circle cx=\"2.2\" cy=\"127.2\" r=\"39\"/><circle cx=\"262.6\" cy=\"162.1\" r=\"24\"/><circle cx=\"187\" cy=\"109.7\" r=\"31.8\"/><circle cx=\"231.1\" cy=\"91\" r=\"25.9\"/><circle cx=\"107.4\" cy=\"163.3\" r=\"35.8\"/><circle cx=\"57\" cy=\"153.8\" r=\"24.5\"/><circle cx=\"249.3\" cy=\"100.1\" r=\"22\"/><circle cx=\"356\" cy=\"106.8\" r=\"25.9\"/><circle cx=\"402.6\" cy=\"159.8\" r=\"27.2\"/><circle cx=\"393.8\" cy=\"133.1\" r=\"34.2\"/><circle cx=\"76\" cy=\"165.3\" r=\"34.4\"/><circle cx=\"396\" cy=\"161.5\" r=\"27.4\"/><circle cx=\"141.7\" cy=\"103.3\" r=\"24.6\"/><circle cx=\"17.4\" cy=\"114.1\" r=\"32.9\"/><circle cx=\"-8.6\" cy=\"144.2\" r=\"28.1\"/><circle cx=\"120.2\" cy=\"155.5\" r=\"30.7\"/><circle cx=\"122.6\" cy=\"128.5\" r=\"34.7\"/><circle cx=\"13.9\" cy=\"168\" r=\"22.4\"/><circle cx=\"304.9\" cy=\"157.6\" r=\"22.3\"/><circle cx=\"320.9\" cy=\"119.3\" r=\"32.4\"/><circle cx=\"-6.2\" cy=\"93.7\" r=\"25.3\"/><circle cx=\"391.2\" cy=\"105.7\" r=\"35.6\"/><circle cx=\"380.5\" cy=\"165.4\" r=\"28.2\"/><circle cx=\"139\" cy=\"132\" r=\"36\"/><circle cx=\"35.4\" cy=\"149.9\" r=\"36.4\"/><circle cx=\"351.1\" cy=\"92.9\" r=\"39\"/><circle cx=\"28.3\" cy=\"117.3\" r=\"33\"/><circle cx=\"375.6\" cy=\"117.2\" r=\"38.6\"/><circle cx=\"219\" cy=\"115\" r=\"27.7\"/><circle cx=\"64.5\" cy=\"96.3\" r=\"24.7\"/><circle cx=\"279.5\" cy=\"169.7\" r=\"24.9\"/><circle cx=\"10.4\" cy=\"168.9\" r=\"31.6\"/><circle cx=\"160.5\" cy=\"109\" r=\"32.7\"/><circle cx=\"337\" cy=\"126.5\" r=\"29.6\"/><circle cx=\"13.4\" cy=\"163.3\" r=\"22.6\"/><circle cx=\"197.3\" cy=\"157.1\" r=\"24.4\"/><circle cx=\"297.3\" cy=\"166\" r=\"33.3\"/><circle cx=\"321\" cy=\"98.5\" r=\"29.8\"/></g><rect class=\"a2\" y=\"150\" width=\"400\" height=\"210\"/><g class=\"a3\"><rect x=\"58.6\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"59.7\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"116.4\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"117.9\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"150.8\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"161.5\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"181.3\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"181.4\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"191.6\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"195.3\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"291.8\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"337.9\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"340.9\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"390.4\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"395.4\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/><rect x=\"399.7\" y=\"150\" width=\"5\" height=\"150\" rx=\"1\"/></g><g class=\"a3\"><circle cx=\"393.1\" cy=\"160.2\" r=\"33\"/><circle cx=\"132.2\" cy=\"117.1\" r=\"28.9\"/><circle cx=\"318.4\" cy=\"179.4\" r=\"30.5\"/><circle cx=\"320.1\" cy=\"172\" r=\"36.5\"/><circle cx=\"268.9\" cy=\"170.8\" r=\"30.5\"/><circle cx=\"285.9\" cy=\"132.5\" r=\"32.7\"/><circle cx=\"313.3\" cy=\"165.3\" r=\"29.3\"/><circle cx=\"387.1\" cy=\"162\" r=\"34.5\"/><circle cx=\"-5.1\" cy=\"153.8\" r=\"28.5\"/><circle cx=\"272.1\" cy=\"147\" r=\"38.7\"/><circle cx=\"261.9\" cy=\"173.8\" r=\"30.3\"/><circle cx=\"260.5\" cy=\"169\" r=\"38.9\"/><circle cx=\"137\" cy=\"177.4\" r=\"39.7\"/><circle cx=\"279.1\" cy=\"188.1\" r=\"41.2\"/><circle cx=\"207.6\" cy=\"152.3\" r=\"27\"/><circle cx=\"341.4\" cy=\"185\" r=\"32.6\"/><circle cx=\"280.4\" cy=\"167.6\" r=\"37.1\"/><circle cx=\"62.2\" cy=\"172.4\" r=\"34.5\"/><circle cx=\"269.5\" cy=\"143.7\" r=\"35.2\"/><circle cx=\"315.4\" cy=\"160.9\" r=\"37\"/><circle cx=\"1.6\" cy=\"122.8\" r=\"31.9\"/><circle cx=\"263\" cy=\"127.5\" r=\"36.3\"/><circle cx=\"255\" cy=\"113.3\" r=\"32.5\"/><circle cx=\"85\" cy=\"114.3\" r=\"26.4\"/><circle cx=\"123.3\" cy=\"124.5\" r=\"27.5\"/><circle cx=\"5\" cy=\"147.2\" r=\"30.8\"/></g><path class=\"a3\" d=\"M0 290Q45.3 291.4 90.6 287.9Q143.2 282 195.7 289.2Q232.7 288.6 269.7 286.9Q320.5 288 371.2 286.3Q416.6 283.5 461.9 290.4V360H0Z\"/><g class=\"a3\"><rect x=\"135.7\" y=\"40\" width=\"14\" height=\"320\" rx=\"1\"/><rect x=\"232.4\" y=\"40\" width=\"14\" height=\"320\" rx=\"1\"/><rect x=\"327.4\" y=\"40\" width=\"14\" height=\"320\" rx=\"1\"/><rect x=\"383.3\" y=\"40\" width=\"14\" height=\"320\" rx=\"1\"/></g><g class=\"a3\"><circle cx=\"166\" cy=\"18.8\" r=\"42.8\"/><circle cx=\"145.2\" cy=\"-21.5\" r=\"41.9\"/><circle cx=\"226.8\" cy=\"27.4\" r=\"49.4\"/><circle cx=\"245.6\" cy=\"-8.9\" r=\"47.9\"/><circle cx=\"-9.6\" cy=\"-23.5\" r=\"41.3\"/><circle cx=\"248.4\" cy=\"-21.6\" r=\"42.6\"/><circle cx=\"364.3\" cy=\"-7.4\" r=\"38.6\"/></g><path class=\"a4\" d=\"M0 340Q35.7 337.5 71.3 342.8Q110.8 345.5 150.3 342.5Q195.2 337.1 240.1 342.9Q282.5 339 324.9 338.9Q379.5 339.9 434.1 338.7V360H0Z\"/><g class=\"a5\" opacity=\".7\"><ellipse cx=\"190.8\" cy=\"310.5\" rx=\"6.1\" ry=\"1.4\"/><ellipse cx=\"177.4\" cy=\"318.2\" rx=\"6.9\" ry=\"1.4\"/><ellipse cx=\"330.7\" cy=\"305.6\" rx=\"5.7\" ry=\"1.4\"/><ellipse cx=\"109.5\" cy=\"347.1\" rx=\"6.9\" ry=\"1.4\"/><ellipse cx=\"98.3\" cy=\"317\" rx=\"3.8\" ry=\"1.4\"/><ellipse cx=\"395.5\" cy=\"318.2\" rx=\"6\" ry=\"1.4\"/><ellipse cx=\"189.9\" cy=\"334\" rx=\"6\" ry=\"1.4\"/><ellipse cx=\"297.4\" cy=\"310.3\" rx=\"6.8\" ry=\"1.4\"/><ellipse cx=\"120.3\" cy=\"329\" rx=\"4.7\" ry=\"1.4\"/><ellipse cx=\"118.7\" cy=\"328.8\" rx=\"5.3\" ry=\"1.4\"/><ellipse cx=\"144.4\" cy=\"338.5\" rx=\"6\" ry=\"1.4\"/><ellipse cx=\"14.6\" cy=\"316.4\" rx=\"5.3\" ry=\"1.4\"/><ellipse cx=\"366.6\" cy=\"345\" rx=\"5.7\" ry=\"1.4\"/><ellipse cx=\"5.8\" cy=\"340\" rx=\"5.1\" ry=\"1.4\"/></g></svg>"],["kettu","Kettu kuusikossa","<svg viewBox=\"0 0 400 360\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"400\" height=\"360\"/><g class=\"a5\" opacity=\".75\"><circle cx=\"181.4\" cy=\"69.4\" r=\"1.3\"/><circle cx=\"186.6\" cy=\"63.4\" r=\"1.1\"/><circle cx=\"77\" cy=\"63.9\" r=\"1.1\"/><circle cx=\"314.3\" cy=\"15.8\" r=\"0.9\"/><circle cx=\"40.4\" cy=\"98.1\" r=\"1.2\"/><circle cx=\"21.3\" cy=\"118\" r=\"1.4\"/><circle cx=\"260\" cy=\"75.8\" r=\"0.8\"/><circle cx=\"10.9\" cy=\"65.8\" r=\"0.7\"/><circle cx=\"79.2\" cy=\"32.8\" r=\"0.7\"/><circle cx=\"185.9\" cy=\"55.7\" r=\"1.3\"/></g><path class=\"a1\" d=\"M84 44a22 22 0 1 0 16 38a17 17 0 1 1 -16 -38z\"/><g class=\"a2\"><path d=\"M-10 125.2L1.1 173L-6 173L8.5 213.3L-2.6 213.3L16.4 251.1L-36.4 251.1L-17.4 213.3L-28.5 213.3L-14 173L-21.1 173ZM10.6 125.4L22.5 172L14.9 172L30.5 211.4L18.6 211.4L39 248.2L-17.7 248.2L2.7 211.4L-9.2 211.4L6.3 172L-1.3 172ZM34.6 109.7L46.6 163.6L38.9 163.6L54.7 209.1L42.6 209.1L63.3 251.7L5.9 251.7L26.5 209.1L14.5 209.1L30.2 163.6L22.5 163.6ZM50.9 132.1L61.5 175.6L54.7 175.6L68.6 212.2L58 212.2L76.2 246.6L25.6 246.6L43.8 212.2L33.2 212.2L47.1 175.6L40.2 175.6ZM68.9 106.8L82.6 160.8L73.8 160.8L91.7 206.4L78 206.4L101.5 249.1L36.3 249.1L59.7 206.4L46 206.4L63.9 160.8L55.2 160.8ZM91.4 147.7L100.9 185.7L94.8 185.7L107.3 217.7L97.7 217.7L114.1 247.7L68.6 247.7L85 217.7L75.4 217.7L87.9 185.7L81.8 185.7ZM110.1 100.2L122.1 156.8L114.4 156.8L130.1 204.5L118.1 204.5L138.7 249.2L81.4 249.2L102 204.5L90 204.5L105.7 156.8L98 156.8ZM130.3 109.2L141.6 162L134.4 162L149.1 206.5L137.8 206.5L157.1 248.2L103.6 248.2L122.9 206.5L111.6 206.5L126.3 162L119.1 162ZM147.7 103.9L159.7 160.2L152 160.2L167.8 207.6L155.7 207.6L176.4 252.1L118.9 252.1L139.6 207.6L127.6 207.6L143.3 160.2L135.6 160.2ZM164.1 141.4L174 181.3L167.7 181.3L180.5 215L170.7 215L187.5 246.5L140.8 246.5L157.6 215L147.8 215L160.6 181.3L154.3 181.3ZM179.9 121.6L190.5 170.2L183.7 170.2L197.6 211.2L187 211.2L205.1 249.6L154.7 249.6L172.9 211.2L162.3 211.2L176.1 170.2L169.3 170.2ZM201.2 144.6L209.9 185.1L204.4 185.1L215.7 219.2L207 219.2L221.9 251.1L180.6 251.1L195.5 219.2L186.8 219.2L198.1 185.1L192.6 185.1ZM219.4 137.5L230.1 179.6L223.3 179.6L237.2 215L226.6 215L244.9 248.2L194 248.2L212.3 215L201.6 215L215.6 179.6L208.8 179.6ZM241.5 137.9L251.1 181.7L244.9 181.7L257.4 218.5L247.9 218.5L264.3 253.1L218.7 253.1L235.1 218.5L225.5 218.5L238 181.7L231.9 181.7ZM259.4 108.4L271 162.6L263.6 162.6L278.7 208.3L267.1 208.3L287 251.1L231.8 251.1L251.7 208.3L240.1 208.3L255.3 162.6L247.8 162.6ZM283.3 137.4L293.6 179.5L287 179.5L300.5 214.9L290.2 214.9L307.8 248.1L258.8 248.1L276.5 214.9L266.2 214.9L279.6 179.5L273 179.5ZM300.6 131.8L309.9 175.4L303.9 175.4L316.1 212.1L306.8 212.1L322.7 246.6L278.5 246.6L294.4 212.1L285.1 212.1L297.3 175.4L291.3 175.4ZM320.4 138.7L330.1 181.3L323.9 181.3L336.5 217.2L326.9 217.2L343.4 250.8L297.5 250.8L314 217.2L304.4 217.2L317 181.3L310.8 181.3ZM339 101.9L352.2 158.1L343.7 158.1L361 205.5L347.8 205.5L370.5 249.9L307.4 249.9L330.1 205.5L316.9 205.5L334.2 158.1L325.7 158.1ZM361.6 138.1L372 179.6L365.4 179.6L379 214.5L368.6 214.5L386.4 247.2L336.8 247.2L354.7 214.5L344.3 214.5L357.9 179.6L351.2 179.6ZM383.8 135L394.2 177.8L387.5 177.8L401.1 213.8L390.7 213.8L408.6 247.5L359.1 247.5L376.9 213.8L366.5 213.8L380.1 177.8L373.4 177.8ZM407.2 143.8L417.6 185.5L411 185.5L424.6 220.7L414.2 220.7L432 253.6L382.4 253.6L400.3 220.7L389.8 220.7L403.5 185.5L396.8 185.5Z\"/></g><rect class=\"a2\" y=\"246\" width=\"400\" height=\"114\"/><g class=\"a3\"><path d=\"M-10 121.5L4 188.2L-4.9 188.2L13.4 244.2L-0.6 244.2L23.4 296.8L-43.4 296.8L-19.4 244.2L-33.4 244.2L-15.1 188.2L-24 188.2ZM21.6 137.3L35.4 199.8L26.6 199.8L44.6 252.3L30.8 252.3L54.5 301.6L-11.2 301.6L12.4 252.3L-1.4 252.3L16.7 199.8L7.8 199.8ZM51.9 112.6L67.2 183.2L57.4 183.2L77.4 242.6L62.1 242.6L88.3 298.3L15.4 298.3L41.6 242.6L26.3 242.6L46.3 183.2L36.5 183.2ZM81.1 143.7L94.8 202.3L86 202.3L104 251.6L90.2 251.6L113.8 297.8L48.3 297.8L71.9 251.6L58.1 251.6L76.1 202.3L67.3 202.3ZM111.6 111.4L129.4 182.4L118 182.4L141.4 242.2L123.5 242.2L154.1 298.2L69.1 298.2L99.7 242.2L81.8 242.2L105.2 182.4L93.7 182.4ZM135.6 147.2L148.8 204.5L140.4 204.5L157.6 252.9L144.4 252.9L167 298.2L104.3 298.2L126.8 252.9L113.7 252.9L130.9 204.5L122.5 204.5Z\"/><path d=\"M290 138.4L304.4 199.4L295.2 199.4L313.9 250.8L299.6 250.8L324.2 299L255.8 299L280.4 250.8L266.1 250.8L284.8 199.4L275.6 199.4ZM313.3 131.4L329.9 196.7L319.3 196.7L341 251.6L324.4 251.6L352.8 303.1L273.8 303.1L302.2 251.6L285.6 251.6L307.3 196.7L296.7 196.7ZM341.9 109.2L357.6 182L347.5 182L368 243.2L352.3 243.2L379.2 300.7L304.6 300.7L331.4 243.2L315.8 243.2L336.2 182L326.2 182ZM364.2 152.2L378.1 209.6L369.2 209.6L387.3 258L373.5 258L397.2 303.3L331.2 303.3L355 258L341.1 258L359.2 209.6L350.4 209.6ZM395.9 149.8L409.2 207.3L400.6 207.3L418 255.7L404.7 255.7L427.5 301.1L364.2 301.1L387 255.7L373.7 255.7L391.1 207.3L382.6 207.3Z\"/></g><path class=\"a3\" d=\"M0 296Q38 301 75.9 293.9Q119.6 298.4 163.2 298Q211.7 298 260.1 297.5Q313 294.5 365.9 296.9Q418.4 299.7 470.9 295.6V360H0Z\"/><g transform=\"translate(176 270) scale(1.35)\"><g class=\"a1\"><path d=\"M18 44C6 46-2 40 2 32C4 28 10 30 10 34C11 39 15 41 20 40Z\"/><path d=\"M14 44C12 34 14 24 22 18L30 18C34 24 36 34 34 44Z\"/><path d=\"M22 20C20 14 22 9 27 8L29 1L32 8L35 2L36 10C38 12 42 14 46 16C44 18 40 19 36 20C33 22 27 23 22 20Z\"/></g><g class=\"a5\"><path d=\"M30 22C33 26 33 32 31 37C29 32 28 26 30 22Z\"/><path d=\"M2 32C4 28 10 30 10 34C7 33 4 33 2 32Z\"/></g><g class=\"a3\"><circle cx=\"36\" cy=\"13\" r=\"1\"/><circle cx=\"45.6\" cy=\"16\" r=\"1.1\"/></g></g><g class=\"a4\"><path d=\"M20 86L46.9 192.4L29.7 192.4L64.8 282L37.9 282L84 366L-44 366L2.1 282L-24.8 282L10.3 192.4L-6.9 192.4ZM386 66L414.6 180L396.3 180L433.6 276L405 276L454 366L318 366L367 276L338.4 276L375.7 180L357.4 180Z\"/></g><path class=\"a4\" d=\"M0 346Q49.8 348.9 99.5 346.3Q145.2 345.1 190.8 346.3Q236 342.6 281.2 346.6Q336.1 349 390.9 346.9Q430.6 347.9 470.3 346.3V360H0Z\"/></svg>"],["hirvi","Hirvi sumussa","<svg viewBox=\"0 0 400 360\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"400\" height=\"360\"/><circle class=\"a1\" cx=\"90\" cy=\"70\" r=\"26\"/><g class=\"a2\"><path d=\"M-10 122.4L1.2 166.5L-6 166.5L8.6 203.6L-2.5 203.6L16.6 238.5L-36.6 238.5L-17.5 203.6L-28.6 203.6L-14 166.5L-21.2 166.5ZM4.3 109.3L16 158.1L8.5 158.1L23.8 199.1L12.1 199.1L32.1 237.6L-23.5 237.6L-3.5 199.1L-15.2 199.1L0.1 158.1L-7.4 158.1ZM17.2 143.7L25.7 178.4L20.2 178.4L31.3 207.7L22.8 207.7L37.3 235.1L-2.9 235.1L11.6 207.7L3.1 207.7L14.2 178.4L8.7 178.4ZM31.2 119.5L42.1 163.2L35.1 163.2L49.3 200L38.5 200L57.1 234.5L5.4 234.5L24 200L13.1 200L27.3 163.2L20.4 163.2ZM50.8 129.9L59.6 171.7L54 171.7L65.5 207L56.7 207L71.9 240L29.7 240L44.9 207L36 207L47.6 171.7L41.9 171.7ZM69.3 99.4L81.6 150.3L73.7 150.3L89.8 193.1L77.5 193.1L98.5 233.2L40 233.2L61.1 193.1L48.8 193.1L64.9 150.3L57 150.3ZM85.8 95.9L98 148.3L90.2 148.3L106.2 192.4L93.9 192.4L114.9 233.7L56.6 233.7L77.6 192.4L65.3 192.4L81.3 148.3L73.5 148.3ZM104.8 112.5L114.7 158.9L108.4 158.9L121.2 197.9L111.4 197.9L128.3 234.5L81.3 234.5L98.2 197.9L88.4 197.9L101.3 158.9L95 158.9ZM124.3 126.3L133.6 169.5L127.7 169.5L139.8 205.9L130.5 205.9L146.5 240L102.2 240L118.1 205.9L108.8 205.9L121 169.5L115 169.5ZM142.8 108.7L153.2 158.3L146.6 158.3L160.2 200.2L149.8 200.2L167.6 239.4L118 239.4L135.9 200.2L125.5 200.2L139.1 158.3L132.4 158.3ZM157.8 145.4L165.7 180.6L160.7 180.6L171 210.2L163.1 210.2L176.7 238L138.9 238L152.5 210.2L144.6 210.2L154.9 180.6L149.9 180.6ZM177.5 129.5L187.8 170.8L181.2 170.8L194.6 205.6L184.3 205.6L202 238.2L153 238.2L170.6 205.6L160.3 205.6L173.8 170.8L167.2 170.8ZM191.4 121.8L201.8 166.6L195.2 166.6L208.8 204.3L198.4 204.3L216.3 239.7L166.5 239.7L184.4 204.3L174 204.3L187.6 166.6L180.9 166.6ZM206.3 134.9L214.8 174.2L209.3 174.2L220.5 207.3L212 207.3L226.6 238.3L185.9 238.3L200.6 207.3L192 207.3L203.2 174.2L197.7 174.2ZM223.1 118.7L232.7 163.4L226.6 163.4L239.1 201.1L229.5 201.1L246 236.4L200.2 236.4L216.7 201.1L207.1 201.1L219.6 163.4L213.5 163.4ZM240.4 98.7L251.9 150.3L244.5 150.3L259.7 193.8L248.1 193.8L267.9 234.6L212.8 234.6L232.7 193.8L221.1 193.8L236.2 150.3L228.8 150.3ZM259.6 115.3L269.1 160.5L263 160.5L275.4 198.5L265.9 198.5L282.2 234.2L237.1 234.2L253.3 198.5L243.9 198.5L256.2 160.5L250.2 160.5ZM277.7 128.3L286.7 169.1L280.9 169.1L292.7 203.5L283.7 203.5L299.2 235.7L256.1 235.7L271.6 203.5L262.6 203.5L274.4 169.1L268.6 169.1ZM294.7 108L304.9 156.1L298.4 156.1L311.7 196.5L301.5 196.5L319 234.5L270.4 234.5L287.9 196.5L277.7 196.5L291.1 156.1L284.5 156.1ZM314.6 96.7L326.7 148.2L319 148.2L334.8 191.5L322.7 191.5L343.4 232.2L285.8 232.2L306.6 191.5L294.5 191.5L310.3 148.2L302.5 148.2ZM332.1 127.7L342.7 169.6L335.9 169.6L349.8 204.8L339.2 204.8L357.4 237.9L306.9 237.9L325 204.8L314.4 204.8L328.3 169.6L321.5 169.6ZM348.8 124L358 165.6L352.1 165.6L364.1 200.7L355 200.7L370.7 233.6L327 233.6L342.7 200.7L333.5 200.7L345.5 165.6L339.7 165.6ZM362 138.2L371 174.5L365.3 174.5L377 205L368 205L383.5 233.7L340.6 233.7L356 205L347 205L358.8 174.5L353 174.5ZM378.3 109.1L390.5 158.6L382.7 158.6L398.7 200.3L386.5 200.3L407.4 239.4L349.3 239.4L370.2 200.3L358 200.3L373.9 158.6L366.1 158.6ZM390.7 96.4L403.4 148.2L395.3 148.2L411.9 191.9L399.2 191.9L420.9 232.7L360.6 232.7L382.3 191.9L369.6 191.9L386.2 148.2L378.1 148.2ZM409.4 112.4L419.4 159L413 159L426 198.4L416.1 198.4L433.1 235.2L385.8 235.2L402.8 198.4L392.9 198.4L405.9 159L399.5 159Z\"/></g><rect class=\"a2\" y=\"232\" width=\"400\" height=\"128\"/><rect class=\"a5\" y=\"206\" width=\"400\" height=\"40\" opacity=\".3\"/><g class=\"a3\"><path d=\"M-10 99.7L7.6 175.1L-3.7 175.1L19.3 238.5L1.7 238.5L31.9 297.9L-51.9 297.9L-21.7 238.5L-39.3 238.5L-16.3 175.1L-27.6 175.1ZM16.7 128.6L32.3 193.1L22.3 193.1L42.7 247.4L27.1 247.4L53.9 298.4L-20.6 298.4L6.2 247.4L-9.4 247.4L11 193.1L1 193.1ZM45.5 116.3L61.9 186.1L51.4 186.1L72.8 244.8L56.4 244.8L84.5 299.9L6.6 299.9L34.6 244.8L18.2 244.8L39.6 186.1L29.2 186.1ZM74.7 117L92 188L80.9 188L103.5 247.7L86.2 247.7L115.9 303.7L33.5 303.7L63.1 247.7L45.8 247.7L68.5 188L57.4 188ZM101 118.4L116.3 186.5L106.5 186.5L126.6 243.8L111.2 243.8L137.6 297.5L64.4 297.5L90.7 243.8L75.4 243.8L95.4 186.5L85.6 186.5Z\"/><path d=\"M300 95.9L317.8 173.6L306.4 173.6L329.6 239.1L311.8 239.1L342.3 300.5L257.7 300.5L288.2 239.1L270.4 239.1L293.6 173.6L282.2 173.6ZM332.9 120.9L350.1 189.2L339.1 189.2L361.6 246.7L344.4 246.7L373.9 300.6L291.9 300.6L321.5 246.7L304.2 246.7L326.7 189.2L315.7 189.2ZM362.5 102.2L381.6 176.9L369.4 176.9L394.3 239.9L375.2 239.9L407.9 298.9L317.1 298.9L349.8 239.9L330.7 239.9L355.6 176.9L343.4 176.9ZM394 120.6L410 188.4L399.8 188.4L420.7 245.4L404.7 245.4L432.1 298.8L355.9 298.8L383.4 245.4L367.4 245.4L388.3 188.4L378 188.4Z\"/></g><path class=\"a3\" d=\"M0 294Q43.1 291.5 86.2 294.3Q133.8 296.1 181.4 293.8Q222.5 294 263.6 294.1Q305.5 290.1 347.4 293.1Q402.1 296.6 456.8 293.9V360H0Z\"/><g transform=\"translate(140 206) scale(1.6)\"><g class=\"a3\"><path d=\"M8 22C10 14 22 12 34 14C40 10 46 10 50 14L52 30C46 34 20 34 10 32C6 30 6 26 8 22Z\"/><rect x=\"12\" y=\"29\" width=\"4.2\" height=\"27\" rx=\"1.2\"/><rect x=\"18\" y=\"29\" width=\"4.2\" height=\"27\" rx=\"1.2\"/><rect x=\"41\" y=\"28\" width=\"4.2\" height=\"28\" rx=\"1.2\"/><rect x=\"47\" y=\"28\" width=\"4.2\" height=\"28\" rx=\"1.2\"/><path d=\"M46 12C52 11 57 14 59 19L67 24C70 26 70 31 66 32L59 31C55 30 52 27 49 25Z\"/><path d=\"M54 27C54 31 55 34 53 36C51 33 51 30 51.5 27Z\"/><path d=\"M52 14C50 8 52 4 56 3L57 0L59 4L61 0L62 5L65 2L64 7C61 10 57 12 54 15Z\"/><path d=\"M50 13C46 9 44 5 45 1L47.5 4L49 0L50.5 5L52 11Z\"/></g></g><g class=\"a4\"><path d=\"M36 116L60.4 211L44.8 211L76.6 291L52.2 291L94 366L-22 366L19.8 291L-4.6 291L27.2 211L11.6 211ZM370 86L396 192.4L379.4 192.4L413.4 282L387.4 282L432 366L308 366L352.6 282L326.6 282L360.6 192.4L344 192.4Z\"/></g><path class=\"a4\" d=\"M0 348Q48.8 345.7 97.6 347.1Q140.5 349.6 183.5 346.1Q225.3 351.2 267.1 348.4Q321.9 344.8 376.7 349.6Q427.7 344.2 478.6 348.1V360H0Z\"/></svg>"],["pollo","Pöllö ja kuu","<svg viewBox=\"0 0 400 360\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"400\" height=\"360\"/><g class=\"a5\" opacity=\".75\"><circle cx=\"365.7\" cy=\"161.5\" r=\"1.3\"/><circle cx=\"37.6\" cy=\"102.7\" r=\"1\"/><circle cx=\"211.7\" cy=\"26.5\" r=\"0.8\"/><circle cx=\"178.4\" cy=\"41.5\" r=\"1\"/><circle cx=\"14.7\" cy=\"19.2\" r=\"1.2\"/><circle cx=\"169.3\" cy=\"89.6\" r=\"1.2\"/><circle cx=\"145\" cy=\"14.5\" r=\"1.2\"/><circle cx=\"234.8\" cy=\"113.6\" r=\"1.1\"/><circle cx=\"383.6\" cy=\"64.9\" r=\"1.2\"/><circle cx=\"148.8\" cy=\"99.4\" r=\"1.2\"/><circle cx=\"127.6\" cy=\"19.1\" r=\"1\"/><circle cx=\"285\" cy=\"102.5\" r=\"1\"/><circle cx=\"255.5\" cy=\"35\" r=\"0.8\"/><circle cx=\"131.1\" cy=\"139.6\" r=\"0.8\"/><circle cx=\"49.6\" cy=\"21.3\" r=\"0.7\"/><circle cx=\"112.5\" cy=\"99.5\" r=\"1.3\"/><circle cx=\"134\" cy=\"66\" r=\"0.9\"/><circle cx=\"123.9\" cy=\"133.3\" r=\"1.1\"/><circle cx=\"105.8\" cy=\"22.7\" r=\"1.2\"/><circle cx=\"280.8\" cy=\"141.7\" r=\"0.9\"/><circle cx=\"217.7\" cy=\"156.6\" r=\"1.1\"/><circle cx=\"373.7\" cy=\"32.6\" r=\"1.4\"/></g><circle class=\"a1\" cx=\"250\" cy=\"96\" r=\"44\"/><g class=\"a2\"><path d=\"M-10 206.5L-2.6 241.8L-7.3 241.8L2.3 271.5L-5.1 271.5L7.6 299.3L-27.6 299.3L-14.9 271.5L-22.3 271.5L-12.7 241.8L-17.4 241.8ZM14.1 179.4L25.7 226.7L18.3 226.7L33.5 266.5L21.9 266.5L41.8 303.8L-13.6 303.8L6.3 266.5L-5.3 266.5L9.9 226.7L2.5 226.7ZM39.6 187L50.4 231.4L43.5 231.4L57.6 268.8L46.8 268.8L65.4 303.9L13.8 303.9L32.4 268.8L21.5 268.8L35.7 231.4L28.8 231.4ZM59 160.3L70.5 213L63.2 213L78.2 257.4L66.7 257.4L86.4 299L31.7 299L51.4 257.4L39.9 257.4L54.9 213L47.6 213ZM75.8 184.3L86.7 227.3L79.7 227.3L93.9 263.6L83 263.6L101.7 297.6L49.9 297.6L68.6 263.6L57.7 263.6L71.9 227.3L64.9 227.3ZM101.3 196L110.3 234.3L104.5 234.3L116.2 266.6L107.3 266.6L122.6 296.8L80 296.8L95.3 266.6L86.4 266.6L98.1 234.3L92.4 234.3ZM119 185.3L128.8 229.8L122.5 229.8L135.4 267.3L125.6 267.3L142.4 302.5L95.6 302.5L112.5 267.3L102.6 267.3L115.5 229.8L109.2 229.8ZM139.2 164.5L150.8 215.8L143.4 215.8L158.5 259L146.9 259L166.7 299.6L111.8 299.6L131.5 259L120 259L135.1 215.8L127.7 215.8ZM164.1 172.5L176.1 222.1L168.5 222.1L184.1 264L172.1 264L192.6 303.2L135.7 303.2L156.2 264L144.2 264L159.8 222.1L152.2 222.1ZM184.3 178L195.6 225.4L188.3 225.4L203.1 265.2L191.8 265.2L211.2 302.6L157.4 302.6L176.7 265.2L165.4 265.2L180.2 225.4L173 225.4ZM202.7 194.5L212.4 234.3L206.2 234.3L218.9 267.8L209.2 267.8L225.9 299.3L179.5 299.3L196.2 267.8L186.4 267.8L199.1 234.3L192.9 234.3ZM224.2 185.1L233.8 229.8L227.7 229.8L240.1 267.4L230.6 267.4L247 302.6L201.5 302.6L217.9 267.4L208.3 267.4L220.8 229.8L214.7 229.8ZM246.5 193.8L256.6 234.4L250.2 234.4L263.3 268.5L253.2 268.5L270.4 300.5L222.6 300.5L239.8 268.5L229.8 268.5L242.9 234.4L236.5 234.4ZM265 159.1L277.3 211.3L269.4 211.3L285.5 255.4L273.2 255.4L294.3 296.6L235.8 296.6L256.8 255.4L244.5 255.4L260.6 211.3L252.7 211.3ZM286.4 198.7L295.4 237.4L289.7 237.4L301.3 270L292.4 270L307.7 300.5L265.2 300.5L280.5 270L271.6 270L283.2 237.4L277.5 237.4ZM306.9 170.1L317.8 218L310.8 218L325 258.3L314.2 258.3L332.7 296L281.1 296L299.7 258.3L288.9 258.3L303 218L296.1 218ZM330.8 205.8L338.8 242.7L333.7 242.7L344.2 273.8L336.2 273.8L350 302.9L311.6 302.9L325.4 273.8L317.4 273.8L327.9 242.7L322.7 242.7ZM353.6 200.9L362.2 238.4L356.7 238.4L367.9 270L359.3 270L374 299.6L333.2 299.6L347.9 270L339.3 270L350.5 238.4L345 238.4ZM370.4 174.9L381.9 222.4L374.5 222.4L389.5 262.3L378 262.3L397.7 299.8L343.2 299.8L362.8 262.3L351.4 262.3L366.3 222.4L359 222.4ZM391.8 182.4L401.8 227.2L395.4 227.2L408.4 264.9L398.5 264.9L415.6 300.2L368.1 300.2L385.2 264.9L375.2 264.9L388.2 227.2L381.8 227.2Z\"/></g><rect class=\"a2\" y=\"296\" width=\"400\" height=\"64\"/><path class=\"a3\" d=\"M-4 214C60 206 120 210 170 218C190 221 214 220 236 214L238 220C214 228 186 230 168 226C120 218 60 216 -4 222Z\"/><path class=\"a3\" d=\"M120 212C130 196 146 188 160 186L161 190C148 194 136 202 128 213Z\"/><g transform=\"translate(176 172) scale(1.15)\"><g class=\"a3\"><path d=\"M15 6C6 6 3 14 4 24C5 34 9 42 15 42C21 42 25 34 26 24C27 14 24 6 15 6Z\"/><path d=\"M6 10L3.5 1L11.5 7.5Z\"/><path d=\"M24 10L26.5 1L18.5 7.5Z\"/></g><g class=\"a2\"><circle cx=\"10.5\" cy=\"15\" r=\"5.6\"/><circle cx=\"19.5\" cy=\"15\" r=\"5.6\"/></g><g class=\"a1\"><circle cx=\"10.5\" cy=\"15\" r=\"3.1\"/><circle cx=\"19.5\" cy=\"15\" r=\"3.1\"/><path d=\"M15 18L13.6 21L15 23L16.4 21Z\"/><path d=\"M10 41.5h4v2h-4zM16 41.5h4v2h-4z\"/></g><g class=\"a3\"><circle cx=\"10.5\" cy=\"15\" r=\"1.5\"/><circle cx=\"19.5\" cy=\"15\" r=\"1.5\"/></g><g class=\"a2 ln\" style=\"stroke-width:1.1\"><path d=\"M10 28l2 2 2-2M16 28l2 2 2-2M13 33l2 2 2-2\"/></g></g><g class=\"a4\"><path d=\"M30 116L55.2 211L39.1 211L72 291L46.8 291L90 366L-30 366L13.2 291L-12 291L20.9 211L4.8 211ZM92 196L109.6 260.6L98.4 260.6L121.4 315L103.8 315L134 366L50 366L80.2 315L62.6 315L85.6 260.6L74.4 260.6ZM372 96L398 198.6L381.4 198.6L415.4 285L389.4 285L434 366L310 366L354.6 285L328.6 285L362.6 198.6L346 198.6Z\"/></g><path class=\"a4\" d=\"M0 344Q32.2 347.8 64.3 345.8Q106.8 346.8 149.2 344.9Q194.3 341.9 239.5 343.1Q278.2 342 316.9 346.3Q355.5 342.9 394 343.6Q444.4 343.8 494.8 344.3V360H0Z\"/></svg>"],["satu","Kuu ja kuuset","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5\"><path d=\"M44 18l1.6 4.2 4.2 1.6-4.2 1.6L44 29.6l-1.6-4.2-4.2-1.6 4.2-1.6z\"/><path d=\"M150 12l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z\"/><circle cx=\"98\" cy=\"30\" r=\"1.2\"/><circle cx=\"180\" cy=\"34\" r=\"1\"/><circle cx=\"270\" cy=\"20\" r=\"1.3\"/><circle cx=\"20\" cy=\"44\" r=\"1\"/><circle cx=\"128\" cy=\"44\" r=\"1\"/></g><path class=\"a1\" d=\"M240 16a20 20 0 1 0 14 34a16 16 0 1 1 -14 -34z\"/><g class=\"a2 rj\"><path d=\"M60 92L74 40L88 92Z\"/><path d=\"M86 94L96 56L106 94Z\"/><path d=\"M208 92L222 48L236 92Z\"/><path d=\"M262 94L276 36L290 94Z\"/></g><path class=\"a3\" d=\"M180 100V82l13-11 13 11v18z\"/><rect class=\"a1\" x=\"189\" y=\"85\" width=\"8\" height=\"8\" rx=\"1.5\"/><path class=\"a3\" d=\"M0 98C60 90 120 94 170 98S260 92 300 96V110H0Z\"/><g class=\"a3 rj\"><path d=\"M14 104L30 52L46 104Z\"/><path d=\"M240 104L252 66L264 104Z\"/></g><path class=\"a4\" d=\"M118 98a14 10 0 0 1 28 0z\"/><rect class=\"a5\" x=\"129\" y=\"98\" width=\"6\" height=\"9\" rx=\"3\"/><g class=\"a5\"><circle cx=\"126\" cy=\"92\" r=\"1.8\"/><circle cx=\"136\" cy=\"90\" r=\"1.4\"/></g></svg>"],["kuusikko","Kuusikko","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><circle class=\"a1\" cx=\"206\" cy=\"46\" r=\"24\"/><path class=\"a2\" d=\"M0 72C60 52 120 58 170 68S260 74 300 58V110H0Z\"/><g class=\"a3 rj\"><path d=\"M40 74L52 50L64 74Z\"/><path d=\"M64 76L77 46L90 76Z\"/><path d=\"M236 70L248 46L260 70Z\"/></g><path class=\"a3\" d=\"M0 88C70 74 140 80 200 88S280 92 300 84V110H0Z\"/><g class=\"a4 rj\"><path d=\"M22 98L38 60L54 98Z\"/><path d=\"M50 100L62 72L74 100Z\"/><path d=\"M252 98L266 64L280 98Z\"/><path d=\"M228 100L238 78L248 100Z\"/></g><g class=\"a4\"><circle cx=\"150\" cy=\"80\" r=\"11\"/><rect x=\"148\" y=\"84\" width=\"4\" height=\"16\" rx=\"2\"/><circle cx=\"172\" cy=\"86\" r=\"8\"/><rect x=\"170.5\" y=\"88\" width=\"3\" height=\"12\" rx=\"1.5\"/></g><path class=\"a5\" d=\"M0 102C80 95 200 97 300 102V110H0Z\"/></svg>"],["tunturi","Tunturi","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5\"><circle cx=\"40\" cy=\"30\" r=\"1.1\"/><circle cx=\"150\" cy=\"26\" r=\"1\"/><circle cx=\"180\" cy=\"44\" r=\"1.2\"/><circle cx=\"286\" cy=\"30\" r=\"1\"/><circle cx=\"20\" cy=\"50\" r=\"1\"/></g><circle class=\"a1\" cx=\"96\" cy=\"48\" r=\"16\"/><g class=\"a5 ln\" style=\"stroke-width:1.4\"><path d=\"M196 40l5 3 5-3M212 32l4 2.5 4-2.5\"/></g><path class=\"a2\" d=\"M0 110V78l38-30 26 20 40-36 46 40 28-18 50 34 32-22 40 26V110Z\"/><path class=\"a3\" d=\"M0 110V92l50-14 40 8 60-18 60 16 50-10 40 8V110Z\"/><path class=\"a4\" d=\"M222 102l11-17 11 17z\"/><circle class=\"a1\" cx=\"233\" cy=\"99\" r=\"2.2\"/></svg>"],["majakka","Majakka","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5\"><circle cx=\"40\" cy=\"30\" r=\"1\"/><circle cx=\"170\" cy=\"28\" r=\"1.2\"/><circle cx=\"280\" cy=\"64\" r=\"1\"/><circle cx=\"196\" cy=\"56\" r=\"1\"/></g><circle class=\"a1\" cx=\"236\" cy=\"40\" r=\"14\"/><path class=\"a1\" opacity=\".2\" d=\"M120 50L0 26V70Z\"/><path class=\"a3\" d=\"M80 110c6-10 20-14 40-14s40 4 50 14z\"/><path class=\"a3\" d=\"M108 110l4-54h16l4 54z\"/><path class=\"a3\" d=\"M107 46l13-9 13 9z\"/><rect class=\"a3\" x=\"110\" y=\"45\" width=\"20\" height=\"11\" rx=\"1.5\"/><rect class=\"a1\" x=\"114\" y=\"47\" width=\"12\" height=\"7\" rx=\"1\"/><path class=\"a4\" d=\"M110.6 72h18.8l.7 9h-20.2zM109.2 90h21.6l.7 9h-23z\"/><path class=\"a2\" d=\"M0 100c20-4 40 4 60 0s40-4 60 0 40 4 60 0 40-4 60 0 40 4 60 0V110H0Z\"/><g class=\"a1\" opacity=\".55\"><rect x=\"222\" y=\"103\" width=\"28\" height=\"2\" rx=\"1\"/><rect x=\"229\" y=\"107\" width=\"14\" height=\"2\" rx=\"1\"/></g></svg>"],["niitty","Kukkaniitty","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5\"><circle cx=\"140\" cy=\"26\" r=\"1\"/><circle cx=\"230\" cy=\"30\" r=\"1.2\"/><circle cx=\"270\" cy=\"50\" r=\"1\"/><circle cx=\"20\" cy=\"56\" r=\"1\"/></g><path class=\"a1\" d=\"M72 22a16 16 0 1 0 11 27a13 13 0 1 1 -11 -27z\"/><path class=\"a2\" d=\"M0 84C60 66 120 72 180 80S260 70 300 76V110H0Z\"/><path class=\"a3\" d=\"M0 98C80 90 200 92 300 96V110H0Z\"/><g class=\"a3 ln\" style=\"stroke-width:1.8\"><path d=\"M128 98V82M150 98V70M170 98V80M190 98V66M214 98V78M236 98V72M258 98V84\"/></g><g class=\"a4\"><circle cx=\"128\" cy=\"80\" r=\"4\"/><circle cx=\"150\" cy=\"68\" r=\"5\"/><circle cx=\"170\" cy=\"78\" r=\"4\"/><circle cx=\"190\" cy=\"64\" r=\"5.5\"/><circle cx=\"214\" cy=\"76\" r=\"4\"/><circle cx=\"236\" cy=\"70\" r=\"5\"/><circle cx=\"258\" cy=\"82\" r=\"3.5\"/></g><g class=\"a5\"><circle cx=\"150\" cy=\"68\" r=\"1.6\"/><circle cx=\"190\" cy=\"64\" r=\"1.8\"/><circle cx=\"236\" cy=\"70\" r=\"1.6\"/></g><g class=\"a1\"><circle cx=\"110\" cy=\"62\" r=\"1.6\"/><circle cx=\"176\" cy=\"52\" r=\"1.6\"/><circle cx=\"246\" cy=\"56\" r=\"1.6\"/><circle cx=\"40\" cy=\"74\" r=\"1.6\"/></g><g class=\"a1\" opacity=\".22\"><circle cx=\"110\" cy=\"62\" r=\"5\"/><circle cx=\"176\" cy=\"52\" r=\"5\"/><circle cx=\"246\" cy=\"56\" r=\"5\"/><circle cx=\"40\" cy=\"74\" r=\"5\"/></g></svg>"],["linna","Linna","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5\"><circle cx=\"40\" cy=\"30\" r=\"1\"/><circle cx=\"96\" cy=\"44\" r=\"1.2\"/><circle cx=\"200\" cy=\"28\" r=\"1\"/><circle cx=\"286\" cy=\"62\" r=\"1\"/></g><circle class=\"a1\" cx=\"252\" cy=\"42\" r=\"12\"/><g class=\"a2\"><rect x=\"20\" y=\"52\" width=\"60\" height=\"14\" rx=\"7\"/><rect x=\"36\" y=\"44\" width=\"28\" height=\"14\" rx=\"7\"/><rect x=\"214\" y=\"64\" width=\"54\" height=\"12\" rx=\"6\"/></g><path class=\"a3\" d=\"M0 110V100C60 92 240 92 300 100V110Z\"/><path class=\"a3\" d=\"M118 104V84h6v-6h6v6h6v-6h6v6h8V68l7-14 7 14v4h12V64l8-16 8 16v8h12V58l7-14 7 14v46z\"/><g class=\"a3 ln\" style=\"stroke-width:1.4\"><path d=\"M188 48V34\"/></g><path class=\"a4\" d=\"M188 34l11 4-11 4z\"/><g class=\"a1\"><rect x=\"161\" y=\"76\" width=\"4\" height=\"7\" rx=\"2\"/><rect x=\"186\" y=\"70\" width=\"4\" height=\"7\" rx=\"2\"/><rect x=\"210\" y=\"66\" width=\"4\" height=\"7\" rx=\"2\"/><rect x=\"194\" y=\"90\" width=\"8\" height=\"14\" rx=\"4\"/></g></svg>"],["tahdet","Tähtikartta","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5\"><circle cx=\"16\" cy=\"30\" r=\".9\"/><circle cx=\"140\" cy=\"24\" r=\"1\"/><circle cx=\"160\" cy=\"60\" r=\".8\"/><circle cx=\"276\" cy=\"28\" r=\"1\"/><circle cx=\"288\" cy=\"80\" r=\".8\"/><circle cx=\"128\" cy=\"78\" r=\".9\"/><circle cx=\"250\" cy=\"90\" r=\".8\"/></g><g class=\"a5 ln\" style=\"stroke-width:.8;opacity:.6\"><path d=\"M30 44L60 32L90 50L112 38L126 58M90 50L84 74L58 80\"/></g><g class=\"a5\"><circle cx=\"30\" cy=\"44\" r=\"2\"/><circle cx=\"60\" cy=\"32\" r=\"1.6\"/><circle cx=\"90\" cy=\"50\" r=\"2.2\"/><circle cx=\"112\" cy=\"38\" r=\"1.6\"/><circle cx=\"126\" cy=\"58\" r=\"1.8\"/><circle cx=\"84\" cy=\"74\" r=\"1.6\"/><circle cx=\"58\" cy=\"80\" r=\"2\"/></g><circle class=\"a4\" cx=\"220\" cy=\"56\" r=\"16\"/><ellipse class=\"a1 ln\" style=\"stroke-width:2.2\" cx=\"220\" cy=\"56\" rx=\"29\" ry=\"7\" transform=\"rotate(-14 220 56)\"/><path class=\"a3\" d=\"M0 110V100C80 92 220 92 300 100V110Z\"/></svg>"],["sienet","Sienimetsä","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a2 rj\"><path d=\"M20 96L34 50L48 96Z\"/><path d=\"M250 96L264 44L278 96Z\"/><path d=\"M226 98L236 64L246 98Z\"/></g><g class=\"a1\"><circle cx=\"70\" cy=\"48\" r=\"1.6\"/><circle cx=\"196\" cy=\"40\" r=\"1.6\"/><circle cx=\"150\" cy=\"30\" r=\"1.4\"/></g><g class=\"a1\" opacity=\".22\"><circle cx=\"70\" cy=\"48\" r=\"5\"/><circle cx=\"196\" cy=\"40\" r=\"5\"/><circle cx=\"150\" cy=\"30\" r=\"4\"/></g><path class=\"a3\" d=\"M0 98C70 92 220 92 300 98V110H0Z\"/><g class=\"a5\"><rect x=\"94\" y=\"72\" width=\"12\" height=\"30\" rx=\"6\"/><rect x=\"157\" y=\"84\" width=\"8\" height=\"18\" rx=\"4\"/><rect x=\"198\" y=\"90\" width=\"5\" height=\"12\" rx=\"2.5\"/></g><path class=\"a4\" d=\"M72 76a28 22 0 0 1 56 0z\"/><path class=\"a4\" d=\"M144 88a17 14 0 0 1 34 0z\"/><path class=\"a4\" d=\"M190 93a10 8 0 0 1 21 0z\"/><g class=\"a5\"><circle cx=\"88\" cy=\"66\" r=\"3\"/><circle cx=\"104\" cy=\"60\" r=\"2.4\"/><circle cx=\"116\" cy=\"70\" r=\"2.6\"/><circle cx=\"156\" cy=\"82\" r=\"1.8\"/><circle cx=\"168\" cy=\"80\" r=\"1.6\"/></g></svg>"],["usva","Pilvet","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><circle class=\"a1\" cx=\"226\" cy=\"42\" r=\"22\"/><g class=\"a4\"><rect x=\"36\" y=\"26\" width=\"64\" height=\"16\" rx=\"8\"/><rect x=\"54\" y=\"16\" width=\"30\" height=\"16\" rx=\"8\"/><rect x=\"146\" y=\"50\" width=\"48\" height=\"12\" rx=\"6\"/></g><path class=\"a2\" d=\"M0 78C50 58 100 60 150 74S250 92 300 70V110H0Z\"/><path class=\"a3\" d=\"M0 94C70 80 130 86 190 96S270 102 300 92V110H0Z\"/><path class=\"a5\" d=\"M0 104C90 97 200 99 300 104V110H0Z\"/></svg>"],["revontuli","Revontulet","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><defs><linearGradient id=\"@\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" style=\"stop-color:var(--a1)\"/><stop offset=\"1\" style=\"stop-color:var(--a2)\"/></linearGradient></defs><rect class=\"a0\" width=\"300\" height=\"110\"/><path fill=\"url(#@)\" opacity=\".55\" d=\"M0 52C60 20 110 58 170 30S260 8 300 24V42C250 30 220 60 170 54S60 40 0 72Z\"/><path fill=\"url(#@)\" opacity=\".28\" d=\"M0 34C70 10 120 40 180 18S260 4 300 10V22C250 18 220 46 170 40S70 26 0 50Z\"/><g class=\"a5\"><circle cx=\"30\" cy=\"16\" r=\"1\"/><circle cx=\"120\" cy=\"10\" r=\"1.2\"/><circle cx=\"210\" cy=\"50\" r=\"1\"/><circle cx=\"262\" cy=\"40\" r=\".9\"/><circle cx=\"86\" cy=\"64\" r=\".9\"/></g><path class=\"a3\" d=\"M0 110V82l40-24 26 16 34-28 40 32 30-14 46 28 30-18 54 26V110Z\"/><path class=\"a4\" d=\"M0 110V96l60-14 50 10 70-18 60 16 60-8V110Z\"/></svg>"],["kirjo","Paperileikkeet","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><circle class=\"a1\" cx=\"236\" cy=\"40\" r=\"26\"/><g class=\"a2\"><circle cx=\"146\" cy=\"22\" r=\"3\"/><circle cx=\"158\" cy=\"22\" r=\"3\"/><circle cx=\"170\" cy=\"22\" r=\"3\"/><circle cx=\"146\" cy=\"34\" r=\"3\"/><circle cx=\"158\" cy=\"34\" r=\"3\"/><circle cx=\"170\" cy=\"34\" r=\"3\"/></g><path class=\"a2\" d=\"M18 110V66a34 34 0 0 1 68 0V110Z\"/><path class=\"a5\" d=\"M86 110V84a20 20 0 0 1 40 0V110Z\"/><path class=\"a3\" d=\"M128 110C128 72 166 48 204 38C196 76 176 102 128 110Z\"/><path class=\"a4\" d=\"M204 110a44 44 0 0 1 88 0Z\"/></svg>"],["riso","Riso-muodot","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><defs><pattern id=\"@\" width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\"><circle cx=\"3\" cy=\"3\" r=\"1.1\" style=\"fill:var(--a5)\"/></pattern></defs><rect class=\"a0\" width=\"300\" height=\"110\"/><rect width=\"300\" height=\"110\" fill=\"url(#@)\" opacity=\".22\"/><g style=\"mix-blend-mode:multiply\"><circle class=\"a1\" cx=\"72\" cy=\"64\" r=\"34\"/><circle class=\"a2\" cx=\"106\" cy=\"72\" r=\"30\"/><circle class=\"a3\" cx=\"228\" cy=\"40\" r=\"22\"/><path class=\"a4\" d=\"M146 106C146 72 176 56 212 50C204 86 182 102 146 106Z\"/><path class=\"a1\" d=\"M236 108C242 80 262 70 290 66C286 92 268 104 236 108Z\"/><rect class=\"a3\" x=\"20\" y=\"16\" width=\"30\" height=\"8\" rx=\"4\"/></g></svg>"],["graafi","Korkeuskäyrät","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a5 ln\"><path d=\"M0 96C40 84 70 90 110 78S180 58 220 66 280 84 300 76\"/><path d=\"M0 104C50 94 80 100 120 90S190 72 230 80 280 94 300 88\"/><path d=\"M0 88C30 74 60 80 100 66S170 44 210 52 270 72 300 64\"/><path d=\"M0 80C34 64 64 70 96 56S164 32 204 40 266 62 300 54\"/><path d=\"M72 70V40M72 50l-9-7M72 56l10-9M72 44l6-6\"/></g><circle class=\"a1\" cx=\"232\" cy=\"28\" r=\"8\"/></svg>"],["grafiitti","Ympyrät","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a2 ln\"><circle cx=\"228\" cy=\"62\" r=\"16\"/><circle cx=\"228\" cy=\"62\" r=\"30\"/><circle cx=\"228\" cy=\"62\" r=\"44\"/><path d=\"M0 92H300\"/><path d=\"M40 92V60M56 92V48M72 92V66M88 92V54\"/></g><circle class=\"a1\" cx=\"228\" cy=\"62\" r=\"6\"/></svg>"],["halli","Halli","<svg viewBox=\"0 0 300 110\" preserveAspectRatio=\"xMidYMax slice\" aria-hidden=\"true\"><rect class=\"a0\" width=\"300\" height=\"110\"/><g class=\"a2 ln\" style=\"stroke-width:.6;opacity:.6\"><path d=\"M0 20H300M0 40H300M0 60H300M0 80H300M40 0V110M80 0V110M120 0V110M160 0V110M200 0V110M240 0V110M280 0V110\"/></g><path class=\"a3\" d=\"M0 110V72l24-16v16l24-16v16l24-16v16l24-16v16l20-13V110Z\"/><rect class=\"a3\" x=\"122\" y=\"34\" width=\"11\" height=\"76\"/><rect class=\"a1\" x=\"122\" y=\"42\" width=\"11\" height=\"5\"/><g class=\"a3 ln\" style=\"stroke-width:2.4\"><path d=\"M214 110V28M206 110h16M214 28H290M214 28l20 14M214 42h20M234 28v14M250 28v14M266 28v14M250 28l16 14M282 28V56\"/></g><rect class=\"a1\" x=\"276\" y=\"56\" width=\"12\" height=\"9\" rx=\"1\"/><g><rect class=\"a5\" x=\"150\" y=\"98\" width=\"56\" height=\"12\"/><path class=\"a1\" d=\"M150 110l12-12h8l-12 12zM166 110l12-12h8l-12 12zM182 110l12-12h8l-12 12zM198 110l8-8v8z\"/></g></svg>"]];

var ESTE_X=['--okbg','--okfg','--ehto','--ehto-bg','--k-g','--k-t','--k-q','--k-w','--ov','--ovbg','--hi','--hifg','--dlg','--dlgline','--shc','--dot',
  '--r-btn','--bh','--r-chip','--r-card','--r-sheet','--r-chk','--bline','--a0','--a1','--a2','--a3','--a4','--a5'];
var ESTE_D=['pal','bs','bh','be','bfx','rch','rc','rs','cl','ck','ckl','hf','caps','hz','tabst','art'];
function esteOf(id,L){return L.filter(function(x){return x.id===id;})[0]||null;}
function esteSet(k,v){if(v)root.dataset[k]=v;else delete root.dataset[k];}
/* 1.86 Omat taustakuvat (Emil 25.10.2026): tallessa laitteen IndexedDB:ssä (ei selaimen pientä muistia), pienennettynä enintään 2000 px:iin.
   Kuvat ovat yhteisiä kaikille projekteille ja kulkevat koko appin varmuuskopiossa (kuvat), eivät projektin viennissä. */
var OMAT=[],IDBP=null,artMsg='';
function idb(){if(!IDBP)IDBP=new Promise(function(ok,no){try{var r=indexedDB.open('juuri-kuvat',1);r.onupgradeneeded=function(){r.result.createObjectStore('kuvat',{keyPath:'id'});};
  r.onsuccess=function(){ok(r.result);};r.onerror=function(){no(r.error);};}catch(e){no(e);}});return IDBP;}
function idbDo(mode,fn){return idb().then(function(db){return new Promise(function(ok,no){var tx=db.transaction('kuvat',mode),q=fn(tx.objectStore('kuvat'));
  tx.oncomplete=function(){ok(q&&q.result);};tx.onerror=tx.onabort=function(){no(tx.error);};});});}
function okKuva(x){return !!(x&&typeof x.id==='string'&&/^img/.test(x.id)&&typeof x.data==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(x.data)&&+x.w>0&&+x.h>0);}
function omaOf(id){return OMAT.filter(function(x){return x.id===id;})[0]||null;}
function omaPack(o){return {id:o.id,nimi:String(o.nimi||'').slice(0,60),data:o.data,w:+o.w,h:+o.h,t:o.t||nowIso()};}
function omatLoad(){idbDo('readonly',function(s){return s.getAll();}).then(function(L){OMAT=(L||[]).filter(okKuva).sort(function(a,b){return a.t<b.t?-1:1;});
    if(String(data.cfg.art||'').indexOf('oma:')===0){artKey='';applyCfg();}if($('psheet').open&&psMode==='k')renderPkSet();}).catch(function(){});}
function omaAdd(file,done){var u=URL.createObjectURL(file),im=new Image();
  im.onload=function(){try{var s=Math.min(1,2000/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*s)),h=Math.max(1,Math.round(im.naturalHeight*s)),c=document.createElement('canvas');
      c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);URL.revokeObjectURL(u);
      var o=omaPack({id:uid('img'),nimi:String(file.name||'Oma kuva').replace(/\.[^.]*$/,''),data:c.toDataURL('image/jpeg',.85),w:w,h:h});
      idbDo('readwrite',function(st){st.put(o);}).then(function(){OMAT.push(o);done(o);},function(){done(null);});}catch(e){done(null);}};
  im.onerror=function(){URL.revokeObjectURL(u);done(null);};im.src=u;}
function omaDel(id,done){idbDo('readwrite',function(st){st.delete(id);}).then(function(){OMAT=OMAT.filter(function(x){return x.id!==id;});artKey='';done();},function(){done();});}
/* Varmuuskopion kuvat: puuttuvat lisätään, olemassa olevia ei kosketa */
function omatIn(L){if(!Array.isArray(L))return;var add=L.filter(function(x){return okKuva(x)&&!omaOf(x.id);}).map(omaPack);if(!add.length)return;
  idbDo('readwrite',function(st){add.forEach(function(o){st.put(o);});}).then(function(){OMAT=OMAT.concat(add);artKey='';applyCfg();},function(){});}
function fullExport(){var o=snapshot();if(OMAT.length)o.kuvat=OMAT.map(omaPack);return o;}
function kAsu(){var m=data.cfg.mode;return kEdit||(kOldDark(data.cfg)||m==='dark'?'dark':m==='light'?'light':(mq&&mq.matches?'dark':'light'));}
function kSet(key,val){var cf=data.cfg;kFix(cf);if(KSPEC.indexOf(key)>=0&&kAsu()==='dark')cf['d'+key]=val;else cf[key]=val;}
function applyEste(dark){var cf=data.cfg,kv=kVals(cf,dark),il=ilmeOn(cf),P=il?ilmePal(dark,cf):genPal(dark,kv.h,kv.ch,kv.s,kv.k,kv.p),LK=cf.look&&cf.look!=='juuri'?esteOf(cf.look,ESTE_LOOKS):null,c=P.c,
    eh=(c.hi!==c.accTx&&c.hi!==c.acc)?c.hi:c.ok;
  ESTE_X.forEach(function(x){root.style.removeProperty(x);});ESTE_D.forEach(function(k){delete root.dataset[k];});
  var v={'--bg':c.bg,'--cell':c.surf,'--label':c.fg,'--label2':c.mut,'--sep':c.line,'--accent':c.accTx,'--solid':c.acc,'--on-solid':c.accFg,'--fill':c.accSoft,'--fill2':c.surf2,
    '--seg':c.surf2,'--seg-on':c.surf,'--bar':c.bar,'--red':c.dngTx,'--okbg':c.ok,'--okfg':c.okFg,'--ehto':eh,'--ehto-bg':dark?'color-mix(in srgb,'+eh+' 30%,'+c.surf+')':eh,
    '--k-g':c.hi,'--k-t':c.ok,'--k-q':c.warn,'--k-w':c.dngTx,'--ov':c.warn,'--ovbg':c.warnSoft,'--hi':c.hi,'--hifg':c.hiFg,'--dlg':c.sheet,'--dlgline':c.sheetLine,
    '--app-shadow':dark?'rgba(0,0,0,.13)':'rgba(39,61,34,.055)','--dot':P.dot,'--shc':dark?'rgba(0,0,0,.45)':'rgba(0,0,0,.12)'};
  for(var i=0;i<6;i++)v['--a'+i]=P.a[i];
  esteSet('pal','kone');root.style.colorScheme=dark?'dark':'light';
  /* 0.61: ilme näkyy tyyleille (data-ilme) ja otsikkofontti muuttujana --hff; ilman ilmettä kumpaakaan ei ole, joten nykyinen ulkoasu ei muutu */
  root.style.removeProperty('--hff');esteSet('ilme',il?(dark?'hiillos':'lehto'):'');esteSet('hfont','');
  if(il){var hf=ilmeFont(dark,cf);if(hf[2]){esteSet('hfont',hf[0]);v['--hff']=hf[2];}v['--app-shadow']=dark?'rgba(0,0,0,.18)':'rgba(46,36,24,.06)';}
  function eff(x,lv){return x&&x!=='auto'?x:(LK&&lv!=null?String(lv):'');}
  var bs=eff(cf.bshape,LK&&LK.rb),bh=eff(cf.bsize,LK&&LK.bh+4),be=eff(cf.bedge,LK&&LK.edge),fx=eff(kRaw(cf,'bfx',dark),LK&&LK.fx),ck=eff(cf.ck,LK&&(LK.rk+'|'+LK.ck));
  if(bs){esteSet('bs','1');v['--r-btn']=(bs==='999'?'999':bs)+'px';}
  if(bh){esteSet('bh','1');v['--bh']=bh+'px';}
  if(be&&be!=='none'){esteSet('be',be);v['--bline']=be==='thin'?'var(--sep)':'var(--label)';}
  if(fx&&fx!=='flat')esteSet('bfx',fx);
  if(ck){var q=ck.split('|');esteSet('ck','1');v['--r-chk']=q[0];if(q[1]==='line')esteSet('ckl','1');}
  if(LK){esteSet('rch','1');v['--r-chip']=LK.rch+'px';esteSet('rc','1');v['--r-card']=LK.rc+'px';esteSet('rs','1');v['--r-sheet']=LK.rs+'px';
    if(LK.cl)esteSet('cl','1');if(LK.hf!=='system')esteSet('hf',LK.hf);if(LK.caps)esteSet('caps','1');if(LK.hz)esteSet('hz','1');if(LK.tab!=='pill')esteSet('tabst',LK.tab);root.dataset.edge='soft';}
  Object.keys(v).forEach(function(k){root.style.setProperty(k,v[k]);});
  artShow(cf,dark,P.a);
  return c.bg;}
/* 1.86 Taustakuva (Emil 25.10.2026): oma tai valmis kuva. Sumennus (Ei, Hento, Keskitaso, Vahva) lasketaan kerran kuvan koon ja värien mukaan
   piirtoalustalle, ei jatkuvasti. Himmennys on tilakohtainen kuten sumennus. Säätimen vedon aikana sumennettua kuvaa ei lasketa uudelleen. */
var BLUR=[0,1.5,6,16],koneLive=false,artKey='';
function artShow(cf,dark,pa){var ab=$('artband');if(!ab)return;var A=cf.art||'',own=A.indexOf('oma:')===0?omaOf(A.slice(4)):null,it=own?null:ESTE_ARTS.filter(function(x){return x[0]===A;})[0],on=!!(it||own);
  esteSet('art',own?'oma':A);ab.hidden=!on;ab.classList.toggle('atop',cf.artpos==='top');ab.parentNode.classList.toggle('hasart',on);
  var dm=kRaw(cf,'dim',dark);ab.style.setProperty('--dim',dm==null||dm===''?'.5':String((+dm||0)/100));
  if(!on){ab.textContent='';artKey='';return;}
  var bl=BLUR[+kRaw(cf,'blur',dark)||0]||0,key=A+'|'+bl+(bl&&it?'|'+pa.join(''):'');
  if(key!==artKey&&!(koneLive&&bl&&artKey.split('|')[0]===A)){artKey=key;ab.textContent='';
    if(it&&!bl){ab.innerHTML=esteSvg(it[2],'ab');var g=ab.firstElementChild,vb=String(g.getAttribute('viewBox')||'0 0 300 110').split(/\s+/);g.dataset.ar=(+vb[2])/(+vb[3])||2.7;}
    else{var cv=document.createElement('canvas'),vb2;cv.setAttribute('aria-hidden','true');cv._r=bl;
      if(own){cv.dataset.kind='photo';cv.dataset.ar=own.w/own.h;cv._img=function(w,h,cb){var im=new Image();im.onload=function(){cb(im);};im.src=own.data;};}
      else{vb2=(it[2].match(/viewBox="([^"]*)"/)||[])[1];vb2=String(vb2||'0 0 300 110').split(/\s+/);cv.dataset.ar=(+vb2[2])/(+vb2[3])||2.7;var src=it[2],cols=pa.slice(),r0=(src.match(/<rect([^>]*)>/)||[])[1]||'',fm=/fill="([^"]+)"/.exec(r0),cm=/class="a(\d)"/.exec(r0);cv.dataset.sky=fm?fm[1]:cm?pa[+cm[1]]:'';
        cv._img=function(w,h,cb){var im=new Image();im.onload=function(){cb(im);};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(artStand(src,cols,w,h));};}
      ab.appendChild(cv);}}
  artLay(true);}
/* Valmis kuva omana SVG-tiedostonaan: värit kirjoitetaan auki, koska kuvana piirretty SVG ei näe sivun muuttujia */
function artStand(svg,a,w,h){var css='';for(var i=0;i<6;i++)css+='.a'+i+'{fill:'+a[i]+';color:'+a[i]+'}';
  css+='.rj{stroke:currentColor;stroke-width:5;stroke-linejoin:round}.ln{fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round}';
  svg=esteSvg(svg,'ar').replace(/var\(--a(\d)\)/g,function(_,i){return a[+i];});
  return svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" ').replace(/(<svg[^>]*>)/,'$1<style>'+css+'</style>');}
/* Gaussin sumennuksen likiarvo kolmella laatikkosumennuksella; reunoilla reunan väri jatkuu, joten reunat eivät haalistu */
function blurCtx(x,w,h,sig){var d=x.getImageData(0,0,w,h),a=d.data,b=new Uint8ClampedArray(a.length),n=3,wI=Math.floor(Math.sqrt(12*sig*sig/n+1));if(wI%2===0)wI--;
  var mI=Math.round((12*sig*sig-n*wI*wI-4*n*wI-3*n)/(-4*wI-4));
  for(var i=0;i<n;i++){var r=((i<mI?wI:wI+2)-1)/2;if(r<1)continue;boxPass(a,b,w,h,r,4,w*4);boxPass(b,a,h,w,r,w*4,4);}
  x.putImageData(d,0,0);}
/* Yksi suunta: len pikseliä rivillä (askel st), rivejä cnt (askel rs) */
function boxPass(s,t,len,cnt,r,st,rs){var k=1/(2*r+1),L=len-1;
  for(var y=0;y<cnt;y++){var o=y*rs;for(var c=0;c<4;c++){var oc=o+c,acc=0,i;
    for(i=-r;i<=r;i++)acc+=s[oc+Math.min(L,Math.max(0,i))*st];
    for(var x=0;x<len;x++){t[oc+x*st]=acc*k;acc+=s[oc+Math.min(L,x+r+1)*st]-s[oc+Math.max(0,x-r)*st];}}}}
var artQ=null;
function artRaster(cv,w,H){var r=cv._r||0,sc=r<=2?Math.min(window.devicePixelRatio||1,2):r<=6?1:.5,cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(H*sc)),k=cw+'x'+ch;
  /* Pieni koon muutos (esim. osion alapalkin korkeus) ei laske kuvaa uudelleen: rajaus hoitaa (object-fit) */
  if(cv._k===k)return;var o=(cv._k||'').split('x');if(o.length===2&&Math.abs(cw/o[0]-1)<.2&&Math.abs(ch/o[1]-1)<.2)return;cv._k=k;clearTimeout(artQ);
  artQ=setTimeout(function(){cv._img(cw,ch,function(im){if(cv._k!==k)return;cv.width=cw;cv.height=ch;var x=cv.getContext('2d');x.drawImage(im,0,0,cw,ch);
    if(r)try{blurCtx(x,cw,ch,r*sc);}catch(e){}cv.dataset.done='1';});},cv.dataset.done?150:0);}
/* 1.85: taustakuvan koko ja kohta. Kuva täyttää kerroksen korkeuden (leveys kuvasuhteen mukaan, vähintään ruudun levyinen),
   ja osio valitsee kohdan: Muistio vasen reuna, Asiat oikea reuna, Päätöspuu keskellä. Ilman siirtymää ensimmäisellä kerralla ja koon muuttuessa. */
var artAt=null;
function artLay(now){var L=document.getElementById('artband');if(!L||L.hidden)return;var g=L.firstElementChild;if(!g)return;
  var ar=+g.dataset.ar||2.7,W=L.clientWidth,H0=L.clientHeight,photo=g.dataset.kind==='photo',top=L.classList.contains('atop'),H,w;if(!W||!H0)return;
  /* Maisema on noin kahden ruudun levyinen (neljä osiota liukuvat sen yli), ja taivaan väri jatkuu kuvan yläpuolelle.
     Oma kuva peittää koko taustan (yläosa-tilassa puolet), ja ylimenevä korkeus jää tasan ylä- ja alapuolelle. */
  if(photo){H=Math.round(Math.max(top?.5*H0:H0,W/ar));w=Math.max(W,Math.round(H*ar));g.style.bottom=top?'':Math.min(0,Math.round((H0-H)/2))+'px';}
  else{H=Math.min(H0,Math.round(Math.max(2*W/ar,.42*H0)));w=Math.max(W,Math.round(H*ar));}
  L.style.setProperty('--arth',H+'px');
  if(now)artAt=null;if(now||!L.style.backgroundColor){var r0=photo?null:g.tagName==='svg'?g.querySelector('rect'):null,c=r0?getComputedStyle(r0).fill:'';
    L.style.backgroundColor=c&&c.indexOf('url')<0?c:photo?'var(--bg)':g.dataset.sky||'var(--a0)';}
  var i=ROLL?rollIdx():-1,f=i<0?0.5:i/(ROLL.length-1),x=-Math.round((w-W)*f),k=w+'|'+H+'|'+x;
  if(g.tagName==='CANVAS')artRaster(g,w,H);
  if(artAt===k)return;var jump=now||!artAt||artAt.split('|')[0]!==String(w);artAt=k;
  if(jump)g.style.transition='none';g.style.width=w+'px';g.style.height=H+'px';g.style.transform='translateX('+x+'px)';
  if(jump){void g.getBoundingClientRect();g.style.transition='';}}
addEventListener('resize',function(){artLay(true);});
var esteN=0;function esteSvg(svg,pre){var id=pre+(++esteN);return svg.replace(/@/g,id);}
var MODES=[['auto','Laitteen mukaan'],['light','Vaalea'],['dark','Tumma']];
var root=document.documentElement,mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
/* Asetuksissa muokattava asu näytetään esikatseluna (kEdit), kunnes ikkuna suljetaan */
var kEdit=null;
function isDark(){if(kEdit)return kEdit==='dark';if(kOldDark(data.cfg)||data.cfg.mode==='dark')return true;if(data.cfg.mode==='light')return false;return !!(mq&&mq.matches);}
/* Kaikki 0.6: tekstikoko kertoimena --tz. Laitteen mukaan: iPhonen Safari antaa tyylille -apple-system-body käyttäjän tekstikoon (oletus 17 px);
   muilla selaimilla kerroin 1. Luetaan uudelleen, kun appi tulee esiin (asetus voi muuttua taustalla). */
var TZOPT=[['','Laitteen mukaan'],['0.9','Pieni'],['1','Normaali'],['1.15','Iso'],['1.3','Isompi']];
function tzDevice(){try{if(!(window.CSS&&CSS.supports&&CSS.supports('font','-apple-system-body')))return 1;var e=document.createElement('span');e.style.cssText='position:absolute;visibility:hidden;font:-apple-system-body';e.textContent='x';document.body.appendChild(e);
  var px=parseFloat(getComputedStyle(e).fontSize);e.remove();return px>0?Math.max(0.8,Math.min(2,px/17)):1;}catch(er){return 1;}}
function tzApply(){var v=+((data.cfg||{}).tz||0),z=v>0?v:tzDevice();document.documentElement.style.setProperty('--tz',String(Math.round(z*1000)/1000));}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&!(data.cfg||{}).tz)tzApply();});
function applyCfg(){var dark=isDark();
  document.body.classList.toggle('small',data.cfg.size==='small');
  /* Tyylin hienosäätö (Emil 22.10.2026): fontti, reunat ja lasisuus data-attribuutteina, säännöt CSS:ssä */
  root.dataset.font=data.cfg.font||'system';root.dataset.edge=data.cfg.edge||'soft';root.dataset.glass=data.cfg.glass||'off';tzApply();
  var ebg=applyEste(dark);
  var tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.setAttribute('content',ebg);}
if(mq){if(mq.addEventListener)mq.addEventListener('change',applyCfg);else if(mq.addListener)mq.addListener(applyCfg);}
applyCfg();

/* ---- runko ---- */
var main=$('main'),panels={use:$('p-use'),teach:$('p-teach'),notes:$('p-notes'),cal:$('p-cal'),set:$('p-set'),terms:$('p-terms'),puu:$('p-puu'),dash:$('p-dash'),sheets:$('p-sheets'),treeni:$('p-treeni')},tab='use',scrollPos={};
var MODE={treeni:'Treeni',sheets:'Taulukot',dash:'Kojelauta',puu:'Flow',use:'Vanhat puut',teach:'Rakentaminen',notes:'Muistio',list:'Listat',cal:'Kalenteri',set:'Asetukset',terms:'Asiat'};
function statusText(){return data.K.some(function(k){return k.chg;})?'Muutoksia viemättä':(data.meta.lastExport?'Viety '+whenTxt(data.meta.lastExport):'Tallessa laitteessa');}
/* Vanha tallennus piti päivän (VVVV-KK-PP), uusi aikaleiman */
function whenTxt(t){return !t?'ei vielä kertaakaan':/^\d{4}-\d\d-\d\d$/.test(t)?fiDate(t):stamp(t);}
function renderStatus(){var b=$('status'),t=todayIso();
  b.hidden=storeOk;b.textContent=storeOk?'':'Tallennus ei onnistu';$('xdot').hidden=!data.K.some(function(k){return staleK(k,t);});$('qx-dot').hidden=$('xdot').hidden;}
document.addEventListener('visibilitychange',function(){if(!document.hidden){if(relDay!==todayIso())render();renderStatus();if($('vsheet').open)renderVs();}});
setInterval(function(){if(relDay!==todayIso()&&!$('nsheet').open)render();},60000);
/* Vienti (Emil 22.10.2026): tasan kaksi vaihtoehtoa, molemmat JSON-tiedostona. */
function renderVs(){var k=kOf(),t=todayIso(),l=$('vs-rows');if(!k||!l)return;l.textContent='';
  var la=data.meta.lastExport,kw=k.ex&&(!la||k.ex>=la)?whenTxt(k.ex):la?whenTxt(la)+' (koko appin mukana)':whenTxt(null);
  $('vs-when').textContent='Viety viimeksi: koko appi '+whenTxt(data.meta.lastExport)+' · projekti '+kw;
  function row(id,title,sub,dot,fn){var b=el('button','row');b.type='button';b.id=id;var sp=el('span','t',title);sp.appendChild(el('small','',sub));b.appendChild(sp);
    if(dot){var d=el('span','xdot');d.setAttribute('aria-label','Viemättömiä muutoksia');b.appendChild(d);}b.addEventListener('click',fn);l.appendChild(b);}
  var others=data.K.filter(function(x){return x!==k&&staleK(x,t);}).map(function(x){return x.name;});
  row('vs-all','Koko appi',expName()+(others.length?' · viemättä myös: '+others.join(', '):''),data.K.some(function(x){return staleK(x,t);}),exportAll);
  row('vs-proj','Tämä projekti: '+k.name,expName(k.name),staleK(k,t),exportProj);}
function vsMsg(t){$('vs-msg').textContent=t||'';}
function vsText(txt,copyBtn){var out=$('vs-out');out.textContent='';var ta=el('textarea','mono');ta.readOnly=true;ta.value=txt;ta.setAttribute('aria-label','Vietävä sisältö');out.appendChild(ta);
  if(copyBtn){var b=button(out,'Kopioi teksti','btn',function(){copy(txt,b,ta);});b.style.marginTop='8px';}}
/* Vienti tekstinä ja tuonti samassa ikkunassa (1.50, ent. Asetukset ja Projekti-ikkuna) */
$('vs-txtall').addEventListener('click',function(){vsMsg('');vsText(JSON.stringify(snapshot(),null,1),true);markAll();});
$('vs-txtproj').addEventListener('click',function(){vsMsg('');var k=kOf(),now=nowIso();vsText(projTxt(),true);k.ex=now;k.chg=null;save();renderStatus();renderVs();});
$('impfilebtn').addEventListener('click',function(){$('impfile').click();});
$('impfile').addEventListener('change',function(){var fi=$('impfile'),f=fi.files&&fi.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){offerImport(String(rd.result||''));};rd.readAsText(f);fi.value='';});
$('imptextbtn').addEventListener('click',function(){$('impbox').hidden=false;$('imptext').focus();});
$('impcheck').addEventListener('click',function(){offerImport($('imptext').value);});
function exportAll(){$('vs-out').textContent='';shareFile(JSON.stringify(fullExport(),null,1),expName(),vsMsg,vsText,markAll);}
function exportProj(){$('vs-out').textContent='';stashK();var k=kOf(),now=nowIso();
  shareFile(JSON.stringify(projectFile(k,now),null,1),expName(k.name),vsMsg,vsText,function(){k.ex=now;k.chg=null;save();renderStatus();renderVs();});}
$('xbtn').addEventListener('click',function(){vsMsg('');$('vs-ziprow').hidden=!vOn();$('vs-out').textContent='';$('dataout').textContent='';setMsg('');$('impbox').hidden=true;renderVs();openSheet($('vsheet'));});
$('status').addEventListener('click',function(){openProj('k');setTimeout(function(){var h=$('sec-data');if(h)try{h.scrollIntoView({block:'start'});}catch(e){}},60);});
/* Yläpalkki = projekti, puu valitaan Käytön ja Opetuksen yläosasta (Emil 21.10.2026) */
function renderHead(){var k=kOf();$('tname').textContent=k?k.name:'Juuri';}
/* Kuvakkeet ohuina viivoina, ei emojimerkkejä (Emil 23.10.2026) */
function starSvg(on){return '<svg class="si" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"'+(on?' fill="currentColor"':'')+'/></svg>';}
var CHEV='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5"/></svg>';
/* Puun valinta ja Rakenna samassa rivissä ja samalla tyylillä kuin Muistioiden asiasanojen valinta (Emil 22.10.2026) */
function treeBar(p){var P=proj(),r=el('div','treebar'),b=button(r,'','treepick',function(){openProj('p');});b.id='treepick';b.setAttribute('aria-label','Vaihda puuta');
  b.appendChild(el('small','','Puu'));b.appendChild(el('span','',P?P.name:'Valitse puu'));b.insertAdjacentHTML('beforeend',CHEV);
  var rb=button(r,'','treepick',function(){showTab(tab==='teach'?'use':'teach');});rb.id='build';rb.setAttribute('aria-pressed',tab==='teach'?'true':'false');
  rb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4.4L16.6 4.2a1.6 1.6 0 0 1 2.3 0l.9.9a1.6 1.6 0 0 1 0 2.3L8.4 18.8 4 20z"/><path d="M14.5 6.3l3.2 3.2"/></svg>';rb.appendChild(el('span','','Rakenna'));
  if(tab==='teach'){var xb=button(r,'','treepick',openText);xb.id='opentext';xb.setAttribute('aria-label','Puun tekstikenttä');xb.appendChild(el('span','','Teksti'));}
  p.appendChild(r);return r;}
/* Ohjeet ovat i-napin takana (Emil 22.10.2026): yläpalkin i avaa näkymän ohjeen, ikkunan i oman ohjeensa. Näkymässä näkyy vain tila ja varoitus. */
var hintKey='paatospuu';
function setInfo(html,done,warn){var t=$('info-text');t.textContent='';
  if(tab==='teach'&&!warn){$('info').classList.add('empty');$('info-done').hidden=true;return;}
  $('info').classList.toggle('empty',!html&&!done);if(tab!=='notes')$('count').hidden=true;
  if(html){if(typeof html==='string')t.textContent=html;else t.appendChild(html);}$('info-done').hidden=!done;}
function showHelp(key){var H=HELP[key];if(!H)return;$('hs-h').textContent=H[0];$('hs-body').innerHTML=H[1];openSheet($('hsheet'));}
$('writing-guide-btn').addEventListener('click',showWritingGuide);
function writingMetricExample(){
  var spec=dashSpec();
  if(!spec||spec.err)return '';
  var table=dashEntryTables(spec)[0];
  if(!table)return '';
  return metricTextExample(dashEntryCols(table,dashCsv(VC.files[table.tiedosto].t).h));
}
function metricTextExample(columns){
  var parts=columns.slice(0,4).map(function(metric){
    var value='12,5';
    if(metric.laji==='asteikko')value=metric.min==null?'1':String(metric.min);
    if(metric.laji==='valinta')value=metric.arvot&&metric.arvot[0]?metric.arvot[0][1]:'';
    if(metric.laji==='kylla-ei')value='Kyllä';
    return value?(metric.nimi||metric.id)+' '+value+(metric.yksikko?' '+metric.yksikko:''):'';
  }).filter(Boolean);
  return parts.length?'Mittarit: '+parts.join('; '):'';
}
function showWritingGuide(){
  var host=$('writing-guide-examples'),metrics=writingMetricExample();
  host.textContent='';
  var examples=[
    ['Kalenteri','Kirjoita ajankohta muistiinpanon tekstiin. Voit käyttää myös suhteellista päivää tai toistuvaa ajankohtaa.',
      'to 26.11. klo 16–17\nhuomenna klo 9\njoka maanantai'],
    ['Muistiinpanon kentät','Kirjoita kentät Vault-tiedoston alkutietoihin, jotta rivinäkymä voi käyttää niitä sarakkeissa.',
      'tila: kesken\narvio: 7\nedistys: 40\nhinta: 120\nprioriteetti: 2'],
    ['Tunnisteet','Lisää tunniste tekstiin tai Vault-tiedoston tagit-kenttään. Molemmat näkyvät samassa rajauksessa.',
      '#remontti\n\ntagit: [remontti, piha]'],
    ['Liitetty teksti','Merkitse ulkopuolinen teksti ja tekoälylle tehtävä pyyntö näillä riveillä.',
      'Lähde: Kokouksen muistiinpanot\nTekoälylle: Poimi tekstistä sovitut tehtävät.'],
    ['Linkki muistiinpanoon','Käytä linkissä kohteen tiedostonimeä ilman .md-päätettä. Pystyviivan jälkeen voi antaa oman linkkitekstin.',
      '[[remonttisuunnitelma]]\n[[remonttisuunnitelma|Remontin suunnitelma]]']
  ];
  if(VC.files[TRE_SPEC])examples.push(['Treenisarja','Liitä rivi Treeni-osiossa tai käytä pikakomennossa URL-koodattuna #kirjaa=-linkkinä. Tarkista ennen kirjausta.',
    'Treenisarja: Pystypunnerrus; 8; 42,5']);
  if(metrics)examples.unshift(['Mittarit','Valitse Kojelaudasta Kirjaa mittarit → Kirjaa tekstinä. Erota mittarit puolipisteellä. Tarkista kentät ja tallenna.',metrics]);
  examples.forEach(function(example,i){
    var block=el('section','guide-example'),title=el('h3','',example[0]),field=el('textarea','mono');
    title.id='guide-example-'+i;
    field.setAttribute('aria-labelledby',title.id);field.readOnly=true;field.value=example[2];
    field.rows=Math.min(5,example[2].split('\n').length+1);
    block.appendChild(title);block.appendChild(el('p','sub',example[1]));block.appendChild(field);
    var row=el('div','btnrow'),msg=el('span','sub');msg.setAttribute('role','status');
    var b=button(row,'Kopioi','btn',function(){copy(field.value,b,field,msg);});
    b.setAttribute('aria-label','Kopioi esimerkki: '+example[0]);
    row.appendChild(msg);block.appendChild(row);host.appendChild(block);
  });
  openSheet($('writing-guide'));
}
$('hint').addEventListener('click',function(){showHelp(hintKey);});
document.addEventListener('click',function(ev){var b=ev.target.closest('[data-help]');if(b)showHelp(b.dataset.help);});
$('hs-close').addEventListener('click',function(){closeSheet($('hsheet'));});
/* 1.83 (Emil 24.10.2026): kaikki tekstiin kirjoitettavat kaavat löytyvät lähimmän i-napin takaa, ei tekstikenttien vierestä.
   Yhteiset osiot avautuvina laatikkoina ohjeen alussa; sama osio toistuu jokaisessa ohjeessa, jonka kentässä kaava toimii. */
var KA_AIKA='<details class="kv"><summary>Kaavat: ajankohdat tekstissä</summary><p>Kirjoita aika tekstiin, niin siitä tulee kalenterimerkintä. Kirjainkoko ja välimerkit sanan ympärillä eivät haittaa.</p><ul>'+
 '<li><b>Päivä:</b> <code>24.10.</code> (ilman vuotta seuraava tuleva), <code>24.10.26</code>, <code>24.10.2026</code>, <code>241026</code></li>'+
 '<li><b>Sana:</b> <code>eilen</code>, <code>tänään</code>, <code>huomenna</code>, <code>ylihuomenna</code></li>'+
 '<li><b>Viikonpäivä:</b> <code>perjantai</code> tai <code>perjantaina</code> = seuraava perjantai. Lyhenne <code>pe</code> toimii vain toisen aikaosan vieressä: <code>pe klo 10</code>, <code>pe 30.10.</code></li>'+
 '<li><b>Väli:</b> <code>1.7.–3.8.26</code> tai <code>1.7.26 – 3.8.26</code> = jokainen välin päivä. <code>2/27</code> = koko helmikuu 2027. <code>vk45</code> = viikko 45.</li>'+
 '<li><b>Jakso:</b> <code>tällä viikolla</code>, <code>ensi viikolla</code>, <code>tässä kuussa</code>, <code>ensi kuussa</code>, myös muodossa <code>ensi viikon aikana</code></li>'+
 '<li><b>Määrä:</b> <code>3 päivän päästä</code> ja <code>viikon kuluttua</code> ovat yksi päivä, <code>kahden viikon sisällä</code> ja <code>kuukauden aikana</code> jakso tästä päivästä. Yksiköt: päivän, vuorokauden, viikon, kuukauden, kuun. Luku numerona tai sanana (yhden–kymmenen).</li>'+
 '<li><b>Toistuva:</b> <code>tiistaisin</code>, <code>joka tiistai</code>, <code>joka toinen tiistai</code> (myös kolmas, neljäs), <code>kuun viimeinen viikko</code>, <code>kuun viimeiset 5 pv</code></li>'+
 '<li><b>Toiston alku ja loppu:</b> <code>perjantaisin klo 14 alkaen 1.11. vk 50 saakka</code>, <code>alkaen marraskuun 1. ja päättyen joulukuun 5. perjantaisin</code>. Sanat <code>alkaen</code>, <code>lähtien</code>, <code>päättyen</code>, <code>saakka</code>, <code>asti</code> missä järjestyksessä tahansa samassa virkkeessä; väliin saa tulla pilkkuja ja ja-sanoja. Ilman loppua toisto jatkuu vuoden loppuun. Jokainen kerta kuitataan erikseen; toisto yliviivataan, kun se päättyy, ja siitä tulee <i>Järjestelmäilmoitus</i>-muistiinpano. Listalla, joka näyttää muistiinpanot, toistuva on aina rivinä ja aukeaa joka kerta.</li>'+
 '<li><b>Kellonaika:</b> <code>klo 13</code>, <code>klo 13.30</code>, <code>klo 13:30</code>, <code>klo 13–16</code>, <code>klo13-16</code>, <code>kello 9</code>. Päivän perässä pelkkä luku käy: <code>torstaina 22–23</code>, <code>30.10. 9.30</code> (ei pilkkua väliin).</li>'+
 '<li><b>Monta aikaa samalle päivälle:</b> <code>pe klo 10 ja klo 14</code>, <code>to 9–10, 11–12</code>, <code>huomenna 9 ja 10</code>. Pelkkä kellonaika seuraavilla riveillä saa edellisen päivän: <code>Huomenna:</code> ja alle <code>klo 9 …</code>, <code>klo 12 …</code></li>'+
 '<li><b>Yhdistely:</b> välilyönnillä peräkkäin kirjoitetut osat ovat yksi ajankohta: <code>vk45 perjantai klo13-16</code>, <code>ensi viikolla tiistaina klo 9</code>. Pilkku ei katkaise (<code>30.10., klo 14</code>). Piste lauseen lopussa, huuto- tai kysymysmerkki ja rivinvaihto katkaisevat.</li>'+
 '<li><b>Vajaa aika</b> on seuraava mahdollinen kirjoitushetkestä: jo mennyt <code>klo 9</code> on huomenna, maanantaina jo mennyt <code>ma klo 9</code> ensi maanantaina.</li></ul>'+
 '<p>Suhteelliset sanat lukittuvat kirjoitushetkeen, ja kun päivä tulee, sana vaihtuu tekstissä (tänään, eilen, päiväys). Päiväykset lasketaan oikean kalenterin mukaan; kalenterista poistetulle päivälle osuva aika on harmaa. Aikalinkin napautus avaa valikon, jonka <i>Pura linkki</i> tekee ilmauksesta tavallista tekstiä.</p></details>';
var KA_SANA='<details class="kv"><summary>Kaavat: asiasanat tekstissä</summary><ul>'+
 '<li>Asiasanan <b>nimi</b> tekstissä tuo asiasanan: <code>Kipu</code>. Kirjainkoko ja välimerkit eivät vaikuta.</li>'+
 '<li><b>Opetettu sana</b> tuo sen myös. Osa sanaa riittää mistä kohdasta tahansa, joten opeta taipumaton alku: <code>koir</code> löytää koirien ja kotikoiran. Sanat opetetaan muistiinpanon <i>Liitä asiasanaan</i> -napilla, Asiat → Ehdot → Tunnistus tai Asiat tekstinä.</li>'+
 '<li><b>Poissulkeva sana</b> (Asiat tekstinä <code>!ei kipua</code>) estää asiasanan, vaikka nimi olisi tekstissä.</li>'+
 '<li><b>Päätelty:</b> ehto <i>Kun Kipu ja Kuume, niin Flunssa esiin</i> lisää Flunssan haaleampana, kun tekstissä on kipu ja kuume.</li>'+
 '<li>Tunnistuksen saa projektikohtaisesti pois: Valikko → Projekti → Muistio.</li></ul></details>';
var KA_MUIST='<details class="kv"><summary>Kaavat: muut muistiinpanossa</summary><ul>'+
 '<li><code>◆ Lisätty asiasanoista</code> on otsikko, jonka alle puun ilmoitukset kirjoittuvat. Osio lasketaan uudelleen joka muutoksella, joten kirjoita omat huomiot sen yläpuolelle.</li>'+
 '<li><code>▸ Kysymys</code> ja alla vastaus: nousee esiin -kysymyksen vastaus. Vastausta voi muokata rivin alla.</li>'+
 '<li><i>Liitä asiasanaan</i>: valitse tekstistä sana tai sen alku. Uuden asiasanan kenttään <code>Nimi*</code> tekee tärkeän.</li></ul></details>';
var KA_LISTA='<details class="kv"><summary>Kaavat: rivin kentät</summary><ul>'+
 '<li><b>Rajaa tai luo</b>: <code>Nimi</code> rajaa kohteita, ja Luo tekee uuden asiasanan riville. <code>Nimi*</code> tai tähtinappi tekee uudesta tärkeän. <code>#Nimi</code> tekee ryhmän: napauta jäsenet ja lopuksi ryhmää.</li>'+
 '<li><b>Rivin teksti</b> on muistiinpano: ajankohdat ja asiasanat tunnistuvat kuten muistiinpanossa (kaavat alla).</li>'+
 '<li><b>Rivin nimi</b> tekstissä: kun riville on valittu <i>Mainittu muistiinpanoissa</i>, avoin muistiinpano, jossa nimi mainitaan, nousee riville.</li></ul></details>';
var KA_EHTO='<details class="kv"><summary>Kaavat: ehdot</summary><ul>'+
 '<li>Kenttä <i>Asiasana tai "teksti"</i>: <code>Kipu</code> valitsee asiasanan tai tekee uuden, <code>Kipu*</code> tekee siitä tärkeän, <code>"lääk"</code> lainausmerkeissä on teksti (myös “ ” ja &#39;). Ryhmät ja aikasanat valitaan napauttamalla.</li>'+
 '<li>Tunnistus-näkymän kenttiin kirjoitetaan sanoja, joista asiasana tunnistuu. Osa sanaa riittää: <code>koir</code>.</li>'+
 '<li>Tekstinä (Asiat tekstinä, osio <code>Ehdot:</code>): <code>Kun Kipu ja Kuume, niin Flunssa esiin, Lepo pois.</code> <code>ja</code> = kaikki, <code>tai</code> = jokin. Ilman esiin tai pois = esiin. Ryhmä <code>#Oireet</code>, aikasanat <code>Myöhässä</code>, <code>Tänään</code>, <code>Huomenna</code> ja <code>Tällä viikolla</code>, teksti <code>"lääk"</code>.</li>'+
 '<li><code>Poissulkevat: Lepo, Lenkki.</code> on toisensa poissulkevien ehto.</li></ul></details>';
var KA_UUSI='<details class="kv"><summary>Kaavat: uusi asiasana</summary><ul>'+
 '<li><code>Kipu</code> tekee asiasanan, <code>Kipu*</code> tärkeän (tähti ei jää nimeen). Pidolla avatussa kentässä tärkeys tulee kohdasta.</li>'+
 '<li><code>#Oireet</code> tekee ryhmän: valitse jäsenet napauttamalla ja paina Valmis.</li>'+
 '<li>Samat toimivat Listan <i>Rajaa tai luo</i> -kentässä. Kaikki asiat kerralla tekstinä: Valikko → <i>Asiat tekstinä</i>, kaavat sen i-napissa.</li></ul></details>';
/* 1.91: tekstit erottimella */
var KA_TEKSTIT='<p><b>Useampi teksti samassa muistiinpanossa:</b> kolme viivaa <code>---</code> omalla rivillä tai kesken tekstin jakaa muistiinpanon teksteihin. Jokaisen tekstin ajat ja asiasanat ovat vain sen omia, eikä mikään periydy tekstistä toiseen (pelkkä kellonaika ei saa päivää edellisestä tekstistä). Kalenterimerkintä ja listan muistiinpanorivi näyttävät vain oman tekstinsä. Jokainen teksti kuitataan erikseen, ja Muistion kortissa jokaisella on oma ympyränsä. Ilman viivoja muistiinpano on yksi teksti kuten ennenkin. Tyhjä rivi ei jaa.</p>';
var HELP={
vaultzip:['Koko vault (ZIP)','<p>Tallentaa yhteen tiedostoon <b>Kaikki-vault.zip</b> kaikki vaultin tekstitiedostot kansioineen (muistiinpanot, kalenteri, ohjeet, arkisto, data), myös vielä lähettämättömät omat muutokset. Tiedostot ovat tavallista tekstiä, joten ne aukeavat millä tahansa laitteella ilman tätä appia.</p><p>Nimi on aina sama: kun tallennat iPhonen Tiedostoihin samaan kansioon, puhelin kysyy, korvataanko vanha. Päivämäärä ja tiedostojen määrä ovat ZIPin sisällä tiedostossa VARMUUSKOPIO.txt. Mukana eivät ole kuvat eivätkä yli 400 kt:n tiedostot.</p>'],
kojelauta:['Kojelauta','<p>Kojelauta piirtää kuvaajat vaultin <b>data</b>-kansion taulukoista. Mitä mittareita on, kertoo vaultin <b>data/mittarit.json</b>; luvut ovat taulukoissa kuten <b>data/paiva.csv</b>. Tekoäly lisää uuden mittarin vaultin ohjeen <b>ohjeet/data.md</b> mukaan, eikä appia tarvitse muuttaa.</p><p>Asteikot (esim. energia 1–5) näkyvät pisteinä ja 7 päivän keskiarvona, luvut (esim. paino) viivana, kyllä/ei-mittarit kertoina viikossa. Osoita tai napauta kuvaajaa nähdäksesi päivän arvon. Aikaväli valitaan alhaalta.</p>'],
vault:['GitHub-vault','<p>Kaikki tallentaa ensimmäisen projektin muistiinpanot yksityiseen GitHub-repoosi (vault), yksi tiedosto per muistiinpano. Tekoäly voi lukea ja kirjoittaa samoja tiedostoja, ja appi hakee muutokset itse, kun avaat sen.</p><p><b>Avain:</b> GitHubissa Settings → Developer settings → Fine-grained tokens. Repository access: vain vault-repo. Permissions: Contents = Read and write. Avain jää vain tämän selaimen muistiin.</p><p><b>Uusi muistiinpano</b> menee vaultin Inboxiin, josta tekoäly lajittelee sen oikeaan paikkaan. Poistettu muistiinpano siirtyy vaultissa arkistoon. Jos sama muistiinpano muuttuu samaan aikaan apissa ja GitHubissa, molemmat versiot säilyvät.</p><p>Valikon napin punainen piste: tallentamattomia muutoksia tai yhteysvirhe.</p>'],
vienti:['Vienti ja tuonti','<p>Puhelimella alapalkin vientinappi tekee suoraan tiedoston: <b>Vie projekti</b> tai <b>Vie kaikki (varmuuskopio)</b>. Tämä ikkuna, jossa on myös tuonti ja vienti tekstinä, on Valikossa kohdassa <b>Vienti ja tuonti</b> (tietokoneella yläpalkin vientinappi). Vientejä on kaksi, molemmat JSON-tiedostona: <b>Koko appi</b> (kaikki projektit ja asetukset, tiedosto <code>Juuri.json</code>) ja <b>Tämä projekti</b> (auki oleva projekti, tiedosto <code>Projektin nimi (Juuri).json</code>). Nimi on aina sama, joten tallentaessa voi valita <i>Korvaa</i>.</p><p>Ylärivi kertoo, milloin kumpikin on viety viimeksi. <b>Punainen pallero</b> tulee, kun jossain projektissa on muutoksia, joita ei ole viety, ja vuorokausi on vaihtunut ensimmäisen muutoksen jälkeen. Koko appin vienti kuittaa kaikki projektit, projektin vienti vain sen projektin. Pallero rivin vieressä kertoo, kumpi vienti sen kuittaa.</p><p><b>Tekstinä</b> on varalla: teksti tulee kenttään kopioitavaksi, ja se lasketaan viennin kuittaukseksi.</p><p><b>Tuo</b> tiedostosta tai tekstistä. Koko appin varmuuskopio korvaa kaiken tämän laitteen tiedon (ensin kysytään). Yksittäinen projekti lisätään uudeksi; jos sama projekti on jo appissa, valitset <i>Korvaa projekti</i> tai <i>Lisää kopiona</i>. Varoitus tulee, jos tiedosto on vanhempi kuin tällä laitteella tehdyt muutokset.</p>'],
puu:['Päätöspuu','<p>Yläreunan napit vaihtavat puuta, <b>+ Uusi puu</b> tekee uuden. Jokaisella puulla on omat tekijänsä.</p><p><b>Käyttö:</b> napauta tekijä, ja sen tuomat vaihtoehdot tulevat esiin. Polku näkyy ylhäällä; sen kohdan napautus palaa siihen. Puu päättyy lopetukseen: <b>Muistiinpanoksi</b> tallentaa polun Muistioon.</p><p><b>Rakenna:</b> lisää tekijät, napauta tekijä valituksi ja valitse, mitä se tuo näkyviin, onko se alku ja saako puu päättyä siihen.</p><p>Aiemmat puut ovat Valikossa kohdassa Vanhat puut.</p>'],
paatospuu:['Vanhat puut','<p><b>Puu ⌄</b> vaihtaa puuta ja avaa puun asetukset (muisti, eteneminen, lopuksi), uuden puun, kopion ja poiston. Yläreunan nimi vaihtaa projektia.</p><p><b>Rakenna</b> avaa puun rakentamisen: tekstikenttä, säännöt napauttamalla, rivien muokkaus, järjestys ja toisensa poissulkevat.</p><p><b>Kierros</b> käy puun läpi alusta. Alun vaihtoehdot näkyvät heti, ja ensimmäinen valinta (tai Jatka) aloittaa kierroksen. <b>Päivä ⌄</b> ennen sitä hakee sen päivän muistiinpanot valmiiksi mukaan. Ensimmäisen valinnan purku palaa alkuun ilman kierrosta. Valinta tuo näkyviin siihen liitetyt vaihtoehdot; <b>Jatka</b> ilman valintaa ohittaa askeleen. Valinnat ja poissulut muistuvat koko kierroksen, kunnes valinnan purkaa. Ryhmän poissulku sulkee pois myös sen jäsenet, ja toisensa poissulkevat menevät samassa askeleessa harmaiksi. <b>Peru askel</b> palaa, <b>Lopeta</b> tallentaa kierroksen muistiinpanoksi aikaleiman kanssa.</p><p>Tärkeysjärjestyksessä etenevä puu näyttää askeleessa tärkeimmän täyttymättömän merkityksen ehdot; Jatka ilman valintaa ohittaa sen.</p>'],
rakenna:['Rakentaminen','<p><b>Teksti</b> (Rakenna-napin vieressä) avaa puun tekstikentän: yksi rivi on yksi asia. Kaikki säännöt tallentuvat tekstiin =-lohkoina, joten koko puun voi kirjoittaa tai liittää tekstinä (ohje tekstikentän i-napista).</p><p><b>Säännöt</b> napauttamalla: napauta nappulaa, ryhmää tai Alkua. <b>Kerran</b> = valitse, mitä se tuo näkyviin (sininen). <b>Toisen kerran</b> = mitä se sulkee pois koko kierroksen ajaksi (punainen). <b>Kolmannen</b> = ehdot eli mistä se itse tulee näkyviin: <i>Yksi riittää</i> tai <i>Kaikki tarvitaan</i> (vihreä). Neljäs napautus tai Valmis lopettaa; muokkauksen aikana työkalurivillä näkyy muokattava rivi. Ilmoitus ja apukysymys menevät suoraan ehtoihin, koska ne eivät avaa mitään. Alku kertoo, mitkä näkyvät kierroksen alussa; opettamattomana kaikki, joita mikään ei tuo.</p><p><b>Muokkaa</b>: napauta riviä muokataksesi sen tekstiä, nuolet vaihtavat järjestystä. Nimen vaihto vie säännöt mukana. Tyhjäksi jätetty rivi poistuu.</p><p><b>Järjestys</b>: tähti merkitsee palikan tärkeäksi, tärkeät ovat ensin ja ylin on tärkein. Järjestä tärkeät painamalla riviä pitkään ja raahaamalla. Napauta palikkaa ja sitten muita sanoaksesi, että se on niitä tärkeämpi (ennen-sääntö). Tähti on sama kuin asiasanan tähti Muistiossa.</p><p><b>Poissulkevat</b> (toisensa poissulkevat): ryhmittely nappuloista, joista vain yksi voi olla valittuna samassa askeleessa. Seuraavassa askeleessa ne voivat taas tulla.</p><p>Ristiriitainen sääntö (kehä) hylätään, ja yläreuna kertoo ketjun.</p>'],
teksti:['Tekstikenttä','<p>Yksi rivi on yksi asia. Ylempi rivi on oletuksena tärkeämpi. Rivi saa värinsä heti, kun se on tulkittu; <span class="k-w">punainen</span> nimi on jo käytössä.</p><ul><li><code class="k-b">Koira</code> nappula. Tavuviiva nimessä vaihtaa riviä nappulan sisällä.</li><li><code class="k-g">#Eläimet: selitys</code> ryhmä. Ei näy käytössä; avaa jäsenensä ja voi avata tai sulkea pois toisen ryhmän.</li><li><code class="k-t">&gt;Perustelu: teksti</code> ilmoitus. Käytössä näkyy vain teksti, joka kertyy ruutuun ja muistiinpanoon.</li><li><code class="k-q">?Apu: kysymys</code> apukysymys. Näkyy pienenä ylhäällä vain sen askeleen ajan, ei muistiinpanoon.</li><li><code> // </code> tekstin sisällä vaihtaa kappaletta. Rivi, joka alkaa <code class="k-c">//</code>, on oma väliotsikko ja ohitetaan.</li></ul><p><b>Lohkot</b> alkavat =-rivillä, alla rivit, tyhjä rivi päättää:</p><ul><li><code class="k-rh">=Koira avaa:</code> sääntö, alle palikat riveittäin. Samoin <code>sulkee</code>, <code>vaatii kaikki</code>, <code>vaatii yhden</code> ja <code>ennen</code> (alla olevat ovat vähemmän tärkeitä). Myös <code class="k-rh">=Alku avaa:</code>, <code class="k-rh">=Toisensa poissulkevat:</code> ja <code class="k-rh">=Tärkeät:</code>.</li><li><code class="k-xh">=Eläimet:</code> asiasanalohko: sanat, joista palikka tunnistuu muistiinpanosta, <code>!</code> alussa poissulkeva. Lohko, joka ei ole palikka, on uusi asiasana.</li><li><code>=Koira kääntöpuoli:</code> teksti, joka kirjataan muistiinpanon Puuttuu-osioon, jos palikkaa tarjottiin mutta sitä ei valittu.</li></ul><p>Napautetut säännöt kirjoittuvat näihin lohkoihin, ja lohkojen muutokset näkyvät heti rakentamisessa. Kun vaihdat nimen rivin alusta, säännöt seuraavat mukana; usean rivin liittäminen kerralla ei vie viittauksia.</p>'],
rivi:['Rivin muokkaus','<p>Kirjoita rivi samassa muodossa kuin tekstikentässä: alussa <code>#</code> tekee ryhmän, <code>&gt;</code> ilmoituksen ja <code>?</code> apukysymyksen. Kaksoispiste erottaa nimen tekstistä. Kun nimi muuttuu, säännöt seuraavat mukana. Tyhjä rivi poistaa asian ja sen säännöt.</p>'],
lopetus:['Lopeta kierros','<p>Lisähuomio tallentuu muistiinpanon tekstiin, joten siihen kirjoitetut ajat ja asiasanat toimivat kuten muistiinpanossa.</p>'+KA_AIKA+'<p>Kierros tallentuu muistiinpanoksi: puun nimi, valinnat, ryhmät, ilmoitukset, lisähuomio ja aikaleima. Päivämäärä on valinnainen; kierrokselle valittu päivä on valmiina. Puun asetuksen <i>Lopuksi: Hoidettavat</i> kanssa muistiinpanoon tulee myös valitsematta jääneet tärkeysjärjestyksessä.</p><p>Ruksi palaa kierrokseen. <b>Lopeta tallentamatta</b> hylkää kierroksen (kaksi painallusta).</p>'],
muistiot:['Muistio',KA_AIKA+KA_SANA+KA_TEKSTIT+'<p><b>Avoimet</b>, <b>Kuitatut</b> ja <b>Toistuvat</b> (automaattisten muistutusten rekisteri). Osiot (Muistio, Kalenteri, Listat, Asiat) vaihtuvat alapalkin vasemman reunan napista: napautus vie seuraavaan, sivupyyhkäisy edelliseen. <b>Järjestys</b>-nappi kiertää napautuksesta: <i>Tulevat</i> seuraavan ajankohdan mukaan, <i>Uusimmat</i> muokkausajan mukaan, <i>Tärkeys</i> asiasanojen tärkeysjärjestyksen mukaan.</p><p><b>Asiasanat ⌄</b> suodattaa: valitse yksi tai useampi, ja <i>Jokin näistä</i> tai <i>Kaikki näistä</i>. Saman ikkunan alalaidasta <i>Muokkaa asiasanoja</i> avaa asiasanojen hallinnan (Listassa nappi <i>Asiasanat…</i>). Hakukenttä hakee sanalla; osa sanaa riittää.</p><p><b>Kuittaus kuuluu tekstille.</b> Kortin <b>ympyrä</b> kuittaa tekstin yhdellä napautuksella, ja uusi napautus palauttaa sen avoimeksi. Jos muistiinpano on jaettu teksteihin (<code>---</code>), jokaisella tekstillä on oma ympyränsä. Muistiinpano siirtyy Kuitattuihin, kun sen kaikki tekstit on kuitattu. Tekstissä, jossa on yksi aika, ympyrä ja kalenterin kuittaus ovat sama asia. Jos aikoja on useita, teksti on kuitattu, kun jokainen kerta on kuitattu, ja ympyrä kuittaa ne kaikki. Toistuvasta tekstistä ympyrä kuittaa avoinna olevan kerran, ja teksti valmistuu vasta toistuvuuden päätyttyä. Muokattu teksti pitää kuittauksensa, jos suurin osa sen sanoista on samoja.</p><p>Napautus muualle korttiin avaa muistiinpanon. Siellä ovat myös <b>Arkistoi</b>, Liitä asiasanaan ja Poista. Arkistoitu muistiinpano ei näy Muistiossa, kalenterissa eikä listoilla. Arkistointi kysyy varmistuksen, ja vahvistusnappi on eri kohdassa kuin Arkistoi. <b>Arkisto</b> ja <b>Roskakori</b> ovat Kuitattujen lopussa. Arkistosta palautetaan muistiinpanon ikkunasta, ja roskakorissa poistetut säilyvät 30 päivää, napautus palauttaa.</p><p><b>+</b> oikeassa alakulmassa tekee uuden: muistiinpanon, Listassa rivin ja Toistuvissa toistuvan.</p><p><b>Aikaehdotukset</b> (Listan yläreunassa): kuittaamattomat kohteet saavat tärkeysjärjestyksessä kellonajat kalenterin vapaista väleistä, joihin ne mahtuvat kokonaan; tälle päivälle mahtumattomat seuraaville päiville. Kalenteriin ei tule mitään ennen kuin napautat <b>+ Kalenteriin</b>, joka tekee tavallisen muistiinpanon. Ehdotuksia saavat vain kohteet, joiden asiasanalle on annettu kesto (Asiasanat → asiasana → <i>Listassa: kesto aikaehdotuksiin</i>). Jos mikään ei ole lauennut, aikoja ei ehdoteta, vaan rivit järjestyvät sen mukaan, missä järjestyksessä niiden seuraavat kohteet mahtuisivat kalenteriin. Aikaväli on viikonpäivän oma (oletus 8–16): kun aikaehdotukset ovat päällä, se näkyy kalenterissa pystyviivana, jonka päitä raahaamalla muutat kaikkia saman viikonpäivän päiviä.</p><p>Tietokoneella napsautus tyhjään kohtaan tekee uuden muistiinpanon (Listalla uuden rivin).</p>'],
suodatus:['Suodatus asiasanoilla','<p>Napauta asiasanoja. <b>Jokin näistä</b> näyttää muistiinpanot, joissa on vähintään yksi valituista. <b>Kaikki näistä</b> vaatii jokaisen. Luku ylhäällä kertoo, montako muistiinpanoa ehdoilla löytyy nykyisestä näkymästä (Avoimet tai Kuitatut). Puiden palikat näkyvät vain, jos ne osuvat johonkin muistiinpanoon. Valinta pysyy, kunnes tyhjennät sen.</p>'],
lista:['Lista',KA_LISTA+KA_AIKA+KA_SANA+'<p><b>Viikot</b> (oletus jatkuvalla Listalla, valinta Viikot / Rivit alapalkissa): rivi per listan rivi ja 14 tulevaa viikkoa. Ruudussa avointen määrä; punainen = tällä viikolla, keltainen = tulossa, vihreä = kuitattu. Viikon napautus avaa sen asiat: uusiutuvat kuittaukset (Asiat-taulukon välit), pikapäivät ja muistiinpanot, joissa rivin nimi mainitaan. OK kuittaa, uusi napautus perii. <b>Pika</b> tekee pikamuistiinpanon: rivi, asia (Asiat-taulukon Pika-sarake) ja päivät kuukaudesta. Aikaehdotukset ovat Lista-ikkunassa ja näkyvät Rivit-näkymässä.</p><p><b>Suljettu rivi</b> näyttää tärkeimmän kuittaamattoman kohteen napissa: napautus kuittaa sen suoraan, ja rivit järjestyvät uudelleen hetken päästä. Avatun rivin aikana järjestys pysyy paikallaan ja muuttuu, kun suljet rivin; siirtynyt rivi hehkuu hetken. Kierroslistan <b>Vain kuitattavat</b> (listan valitsimessa) piilottaa rivit, joihin ehdot eivät ole vielä tuoneet kohteita.</p><p><b>Listat:</b> alarivin valitsimesta vaihdetaan listaa ja luodaan uusia <b>kierroslistoja</b>. Kierroslista on rakenteeltaan sama kuin Lista, mutta ilman aikaa: kierros alkaa kaikki kuittaamattomina, ja tärkein kuittaamaton rivi nousee kärkeen (asioiden järjestys). Kuittaus ei uusiudu. Rivi on ryhmä: <i>Kaikki kuitattu</i> tai <i>Yksi kuitattu</i>; valmiin rivin tarpeettomat kohteet harmaantuvat ja rivi siirtyy loppuun. Keskeneräinen kierros säilyy. <i>Lopeta</i> tallentaa kierroksen muistiinpanoksi samassa muodossa kuin päätöspuun kierros (valinnat kuittausjärjestyksessä, Kunnossa, Hoidettavat ja ehtojen tuomat tekstit omina kappaleinaan) ja aloittaa alusta; valitsimen <i>Aloita alusta</i> tyhjentää kuittaukset ilman muistiinpanoa. Kumoa palauttaa.</p><p><b>Lista</b> on jatkuvia tarkistuskohteita varten, esim. <i>Keittiö</i>. Riviä ei kuitata koskaan pois: se pysyy, kunnes poistat sen (Muokkaa → Poista → varmistus).</p><p><b>Teksti on muistiinpano.</b> Kun rivin tekstiin kirjoittaa jotain, siitä tulee oikea muistiinpano Muistioon (listan kuvake ja rivin nimi), ja ajasta tulee kalenterimerkintä. Muokkaus kummassa tahansa näkyy molemmissa. Rivin poisto jättää muistiinpanon; tekstin tyhjennys vie muistiinpanon roskakoriin.</p><p><b>Poimii tekstit</b> (rivin muokkauksessa, aikaan perustuvalla listalla): valitse <i>Rivin nimi</i> ja asiasanoja. Jokainen muistiinpanon teksti, jossa nimi tai jokin valituista asiasanoista tunnistuu, tulee riville omaksi kohteekseen tärkeysjärjestyksessä (tärkein osuva asiasana). Ympyrä kuittaa tekstin, ja se on sama kuittaus kuin Muistiossa ja kalenterissa. Tekstin napautus avaa sen muokattavaksi, ja nuoli avaa muistiinpanon. Toistuva teksti on yksi kohde, josta kuitataan avoinna oleva kerta. Ajaton teksti avautuu listalla uudelleen asiasanan kuittausaikataulun mukaan, mutta Muistiossa se pysyy kuitattuna. Suljetulla rivillä näkyy tärkein avoin teksti. Avoin teksti nostaa riviä listassa kuten kuittaamaton kohde, saman tärkeyden mukaan. Muistiinpanon tulkinnassa lukee, mille riveille teksti menee (<i>Listalle:</i>). Arkistoitu muistiinpano ei tule riveille.</p><p><b>Kohteet</b> ovat napit: punainen odottaa kuittausta, vihreä on kuitattu, ja napautus vaihtaa tilan. Kaikki kohteet näkyvät aina. Rivin teksti näkyy ja on muokattavissa suoraan avatulla rivillä. Kohteita ovat käsin valitut asiasanat, tekstin laukaisemat asiasanat (merkki <i>tekstistä</i>) ja aika. Kuittaus <b>uusiutuu</b> asiasanan oman säännön mukaan (Asiat → asiasana → <i>Listassa</i>): aika edellisestä kuittauksesta, tietyt viikonpäivät, kuun päivät tai näitä yhdessä, jolloin aiempi ratkaisee. Kun aika on kulunut tai valittu päivä alkaa, kohde on taas kuittaamatta. Jos kuussa ei ole valittua päivää (esim. 31.), se on kuun viimeinen päivä. Rivin otsikossa näkyy vain kuittaamattomien määrä. Toistuvan kohteen napissa on ohut kiertonuoli; kertakohteessa ei merkkiä.</p><p><b>Tänään ja myöhässä olevat muistiinpanot</b> (kytkin listan valitsimessa, oletuksena pois): jokainen muistiinpano, jonka päivä on tänään tai myöhässä, näkyy listalla omana rivinään merkillä <i>muistiinpano</i>. Rivin nimi on muistiinpanon ensimmäinen rivi ja kohde Tänään tai Myöhässä. Avattuna teksti näkyy ja on muokattavissa. Kuittaus kuittaa vain sen päivän ajankohdan, sekä muistiinpanossa että kalenterissa. Kuitattu rivi jää listan pohjalle päivän loppuun; napautus peruu kuittauksen. Muistiinpano, joka on jo listan rivin teksti, ei tule kahdesti.</p><p><b>Ryhmät</b> ovat pikavalintoja. Ryhmän napautus liittää ryhmän riville, ja uusi napautus irrottaa sen. Jäsenet näkyvät rivillä yksittäisinä kohteina, ja ryhmän nimi näkyy niiden yläpuolella. Kun ryhmään lisätään tai siitä poistetaan jäsen, muutos näkyy heti kaikilla riveillä, joilla ryhmä on. Kirjoita <code>#Nimi</code> ja Luo, niin syntyy uusi ryhmä: napauta jäseniä ja lopuksi ryhmää, jolloin se lukittuu. <i>Ryhmät…</i> avaa ryhmien muokkauksen samalla tavalla. Puun ryhmät ovat mukana jäsenineen. Ilman #-merkkiä Luo tekee uuden asiasanan riville.</p><p><b>Mainittu muistiinpanoissa</b> on erikoiskohde. Kun se on valittu, avoin muistiinpano, jossa mainitaan rivin nimi (kirjainkoko ei vaikuta) ja jonka päivä on Myöhässä, Tänään tai Huomenna, näkyy rivillä omana punaisena nappinaan. Napautus kuittaa sen päivän, sama kuittaus kuin kalenterissa. Nuolinappi vie muistiinpanoon. Ilman tätä valintaa (rivillä tai liitetyssä ryhmässä) rivin nimi ei vaikuta mihinkään.</p><p><b>Aika</b> tulee tekstin päivistä: Myöhässä, Tänään tai Huomenna nostaa rivin tarkistettavaksi muista kuittauksista riippumatta. Sen kuittaus on sama kuin kalenterin ja muistiinpanon päivän kuittaus. Ilman valintaa kaikki kolme aikasanaa laukeavat itsestään. Jos valitset niistä osan riville tai liitettyyn ryhmään, vain valitut laukeavat (esim. pelkkä <i>Myöhässä</i>).</p><p>Mainittu ja aikasanat voi valita myös <b>ryhmän jäseneksi</b>, jolloin ne koskevat jokaista riviä, jolla ryhmä on.</p><p><b>Yksikin / kaikki:</b> rivi on tarkistettava joko kun yksikin kohde on kuittaamatta, tai vasta kun kaikki ovat.</p><p><b>Järjestys:</b> ensin rivit, joissa on tarkistettavaa (punainen <b>! N tarkistettavaa</b> ja lauenneet kohteet nimen alla), tärkeimmän kuittaamattoman asiasanan mukaan; tasatilanteessa ensin se, joka laukesi aiemmin. Tärkeys tulee Asiat-osion järjestyksestä. Sen jälkeen muut siinä järjestyksessä kuin ne seuraavaksi laukeavat.</p>'],
ehdot:['Ehdot',KA_EHTO+'<p><b>Viikonpäivät</b> ovat aikasanoja syyn valinnassa. Muistiinpanossa perjantai on totta, kun jokin sen ajoista osuu perjantaille (perjantaina, 30.10., perjantaisin). Jatkuvalla listalla se on totta perjantaisin. Samanniminen oma asiasana toimii edelleen omana asianaan.</p>'+'<p><b>Periaate:</b> kun asia 1 on totta, asia 2 tulee ajankohtaiseksi. Asia 1 voi olla asiasana, joka on kuitattu listassa (tai Muistiossa mainittu), ryhmä, aikasana tai teksti. Asia 2 tulee esiin: listassa kuittaamattomana, Muistiossa päätelty. Esiin tullut kuittaamaton ei itse laukaise seuraavaa ennen kuin se kuitataan.</p><p><b>Puun ehdot</b> (Puu: nimi) ovat päätöspuun säännöt samoina laatikkoina: <i>Jokin → Tuo</i> on avaa, <i>Jokin → Poissulkee</i> on sulkee, <i>Kaikki → Tuo</i> on vaatii kaikki ja <i>Poissulkevat</i> on toisensa poissulkevat. Ne vaikuttavat vain kyseisen puun kierrokseen, ja valinta toimii kuittauksena. Syyksi ja seuraukseksi käyvät puun palikat (Alku vain Jokin → Tuo -ehdon syyksi). Muutos näkyy heti Rakennassa ja puun tekstin sääntölohkoissa, ja sama toisin päin. Puu ei osaa Kaikki → Poissulkee -ehtoa, kahta Kaikki-ehtoa samalle palikalle eikä palikkaa, joka tulee sekä jostakin että kaikista syistä; ne estetään ja syy kerrotaan. Järjestys (ennen), kääntöpuolet ja tärkeät pysyvät Rakennassa.</p><p>Ehdot ovat projektin yhteisiä sääntöjä. Listakohtaisesti valitaan vain, ovatko ne käytössä (Listat-ikkunassa <i>Ehdot</i>). Ehto on pystysuunnassa kaksi laatikkoa: ylhäällä <b>syy</b>, alla <b>seuraus</b>. Laatikon napautus avaa sen alle valinnan; <i>Valmis</i> laatikon oikeassa reunassa sulkee sen.</p><p><b>Syy</b>: <i>Jokin</i> (yksi riittää) tai <i>Kaikki</i> (kaikkien pitää toteutua). Syyksi käyvät asiasanat (toteutuu, kun se on kuitattu jollain listan rivillä), <b>ryhmät</b> (toteutuu, kun jäsenistä jokin tai kaikki on kuitattu; sääntö valitaan ryhmän kortilla, ja ryhmä toteutuu vain listassa, jonka riville se on liitetty) ja <b>aikasanat</b> Myöhässä, Tänään, Huomenna ja Tällä viikolla (vain jatkuvalla listalla: jonkin rivin aika on nyt sellainen).</p><p>Välissä valitaan <b>Tuo</b> tai <b>Poissulkee</b>. <i>Tuo</i>: asiasana on listan riveillä piilossa, kunnes ehto täyttyy. <i>Poissulkee</i>: kuittaamaton asiasana harmaantuu rivin loppuun eikä estä rivin valmistumista. <b>Poissulkevat</b> on oma lajinsa ilman seurausta: kun yksi jäsen on kuitattu, muut jäävät pois.</p><p><b>Ristiriidat</b>: suoraa ristiriitaa ei voi tehdä (samat syyt tuovat ja vievät saman asian, syy omana seurauksenaan, poissulkevan jäsen tuo toisen jäsenen); muutos perutaan ja syy kerrotaan alhaalla. Sama ehto kahteen kertaan poistuu Valmiissa. Muut ristiriidat näkyvät huomautuksina (napautus avaa toisen ehdon). Poissulku voittaa aina. Jo kuitattu pysyy kuitattuna; <i>Aloita alusta</i> palauttaa lähtötilan.</p><p><b>Teksti</b> lainausmerkeissä (<i>“lääk”</i>) on syynä tekstiä, ei asiasanaa: se toteutuu, kun listan jonkin rivin tekstissä on se (tunnistus alusta kuten asiasanoilla) tai kun jokin ehto on tuonut sen. Seurauksena teksti näkyy listan yläpuolella ilmoituksena ja tallentuu <i>Lopeta</i>-muistiinpanoon. Kirjoita kenttään <i>Asiasana tai "teksti"</i>; aiemmin käytetyt tekstit ovat valittavina kohdassa Tekstit. Ehto ilman syytä ei jää talteen.</p><p><b>Tunnistus</b> (yhteenvedon lopussa) näyttää asiasanojen tunnistavat sanat ehtoina: <i>Kun tekstissä on jokin näistä, Tuo asiasana, Paitsi, kun…</i>. Napautus avaa muokkauksen.</p><p><b>Ryhmä rivillä</b> on toteamus: rivin kohteiksi tulevat vain ne jäsenet, jotka eivät ole saman listan muilla riveillä. Jos kaikki ovat muualla, rivi on valmis, kun ryhmä toteutuu.</p><p><b>Tekstinä</b> (Asiat tekstinä, lopussa): otsikkorivi <i>Ehdot:</i> ja rivit muotoa <i>Kun Kipu ja #Oireet, niin Lääkäri esiin, Odotus pois.</i> (<i>tai</i> = jokin) sekä <i>Poissulkevat: Lepo, Lenkki.</i> Ryhmä kirjoitetaan risuaidalla. Lohkojen järjestys on asioiden järjestys, ylin tärkein. Teksti on totuus: Valmis korvaa sanat, järjestyksen ja ehdot tekstin mukaisiksi.</p>'],
muistiinpano:['Muistiinpano',KA_AIKA+KA_SANA+KA_MUIST+KA_TEKSTIT+'<p>Kirjoita vapaasti. Tunnistetut ajankohdat korostuvat, ja asiasanan laukaiseva sana alleviivataan. Pisteviivalla alleviivattu sana on sanalinkki: sama sanan alku (5 kirjainta, lyhyt sana kokonaisena) löytyy jostain toisesta muistiinpanosta. Napautus näyttää ne, ja Älä linkitä estää sanan. Asetukset: Projekti → Muistio. Keltainen reunus kentän ympärillä kertoo, ettei tekstissä ole vielä yhtään päivää. Se on vain muistutus, muistiinpanon voi tallentaa ilmankin. Alla näkyy tulkinta: <i>Ajankohdat</i> ja <i>Asiasanat</i>. <b>Ajankohdat</b> ovat allekkain: ensin tulkittu aika, suluissa kirjoitettu muoto. Rivin pyöreä nappi kuittaa juuri sen ajankohdan, myös tulevan (sama kuittaus kuin kalenterissa ja listassa); toistuvasta kuitataan seuraava kerta. Alleviivatun kellonajan napautus avaa ajan valikon. <i>Päätelty</i> (haaleampi) tulee ehdoista: esim. ehto <i>Kun Kipu ja Kuume, niin Flunssa esiin</i> lisää Flunssan, kun tekstissä on kipu ja kuume. Päätelty asiasana toimii suodatuksessa ja tärkeydessä kuten muutkin.</p><p><b>Lukunäkymä</b> (kokeilu, Projekti → Muistio): vanha muistiinpano aukeaa lukittuna, ja ajat ja asiasanat näkyvät nappeina. Napautus muualle tekstiin avaa muokkauksen.</p><p>Valitse tekstistä sana ja paina <b>Liitä asiasanaan</b>, niin sana (tai sen taipumaton alku, esim. <code>koir</code>) opetetaan asiasanalle. Tekstiin ei tule mitään.</p><p>Päivämäärä- ja kellonaikakentät ovat varalla, jos aikaa ei kirjoiteta tekstiin. Tekstissä ilmaistu aika voittaa aina. Ilman loppuaikaa merkintä näkyy kalenterissa vartin mittaisena.</p><p>Jos muistiinpano osuu asiasanaan, jolla on <i>nousee esiin</i>, apukysymys tulee napin taakse ja vastaus kirjoittuu tekstin loppuun. Tyhjäksi jätetty muistiinpano poistuu.</p><p><b>Lisätty asiasanoista:</b> puu, jonka asetus on <i>Muistiinpanoissa: Lisää ilmoitukset</i>, toimii muistiinpanossa kuten kierroksella. Tunnistetut palikat ovat valittuja, ja puun säännöt (avaa, vaatii kaikki tai yhden, sulkee) kertovat, mitkä ilmoitukset tulevat. Niiden tekstit kirjoittuvat heti kirjoittaessa tekstin loppuun tyhjän rivin ja otsikon <code>◆ Lisätty asiasanoista</code> alle. Lisätty teksti on tavallista tekstiä ja voi itse laukaista asiasanoja. Osio lasketaan uudelleen joka muutoksella, joten omat muutokset sen sisällä eivät säily; kirjoita omat huomiot otsikon yläpuolelle.</p><p><b>Huomenna, perjantaina, 3 päivän päästä</b> ja muut suhteelliset sanat lukittuvat kirjoitushetkeen: muokkaus myöhemmin ei siirrä niitä. Kun päivä tulee, sana vaihtuu tekstissä itsestään: <i>tänään</i>, sitten <i>eilen</i> ja lopulta päiväys. Vaihtunut sana on katkoviivan sisällä; napauta sitä ja valitse <i>Historia</i>, niin näet alkuperäisen sanan ja kirjoitusajan. Itse kirjoitettua päiväystä ei muuteta koskaan.</p><p><b>Aikalinkki:</b> napautus tunnistettuun ajankohtaan avaa tekstin alle valikon. <i>Kuittaa</i> kuittaa sen päivän: teksti yliviivataan, ja kalenterissa merkintä näkyy kuitattuna (sama kuittaus toimii kalenterista päin). <i>Muokkaa aikaa</i> avaa päivän ja kellonajan: tallennus kirjoittaa tekstiin kiinteän päiväyksen (ei enää suhteellinen), ja muutos jää historiaan. <i>Historia</i> näyttää aiemmat muodot, <i>Samaan aikaan</i> päällekkäiset merkinnät. <i>Pura linkki</i> tekee ilmauksesta tavallista tekstiä, joka ei tee kalenterimerkintää ja näkyy harmaalla pisteviivalla. Se pysyy tavallisena, kunnes muokkaat sitä tai napautat <i>Palauta aikalinkiksi</i>.</p><p><b>Asiasanalinkki:</b> asiasanan laukaiseva sana on alleviivattu (sama sana tai asiasanaan opetettu sana). Napautus näyttää asiasanat, jotka sana laukaisee; valinta tallentaa muistiinpanon ja avaa Muistion sillä asiasanalla suodatettuna.</p><p><b>Sulkeminen:</b> ruksi tallentaa. <b>Kuittaa</b> (ja kuitatulle <i>Arkistoi</i>) on ikkunan alalaidassa vasemmalla, <b>Poista</b> oikealla. Poisto kysyy joka kerta varmistuksen: koko muistiinpano ja kaikki sen kalenterimerkinnät menevät roskakoriin. Päivä ja kellonajat ovat tekstikentän alla samalla rivillä; kellonaikakentät näkyvät vain, kun tekstissä ei ole kellonaikaa.</p>'],
toistuvat:['Toistuvat ja muistutukset','<p>Muistutuksesta tulee tavallinen muistiinpano, joten sen tekstin ajankohdat ja asiasanat toimivat kuten muistiinpanossa. Suhteelliset sanat lasketaan päivästä, jona muistutus syntyy.</p>'+KA_AIKA+KA_SANA+'<p>Automaattinen muistutus tulee avoimiin muistiinpanoihin eri värisenä. Uusi tulee vasta, kun edellinen on kuitattu. Asiasanat tunnistuvat tekstistä kuten muistiinpanoissa, ja järjestys tulee tärkeydestä.</p><p><b>Ajallaan</b>: <i>Tasavälein</i> laskee aina aloituspäivästä (kuun 31. ei valu 28. päivään), <i>Kuittauksesta</i> laskee seuraavan edellisen kuittauksesta. Myöhästyneistä tehdään vain viimeisin.</p><p><b>Jos ei tapahdu</b>: muistutus tulee, kun valittuja asiasanoja ei ole ollut kuitatuissa muistiinpanoissa tietyssä ajassa. <i>Jokin näistä</i> tai <i>Kaikki samassa</i> muistiinpanossa. Aika lasketaan myöhäisimmästä: osuvan muistiinpanon kuittaus, seurannan alku tai edellisen muistutuksen kuittaus.</p><p>Tyhjä teksti tai Poista (kaksi painallusta) poistaa; jo tulleet muistiinpanot jäävät.</p>'],
asiatteksti:['Asiat tekstinä','<p>Koko projektin asiasanat, tärkeät ja ehdot yhtenä tekstinä. Teksti on totuus: <b>Valmis</b> korvaa sanat, tärkeät ja ehdot tekstin mukaisiksi, <b>Peru</b> hylkää muutokset.</p><ul><li><code>=Kipu:</code> asiasanan lohko. Alle sanat riveittäin: sana, josta asiasana tunnistuu tekstistä (osa sanaa riittää, esim. <code>koir</code>). Tyhjä rivi päättää lohkon.</li><li><code>!ei kipua</code> lohkon rivillä on poissulkeva sana: se estää tunnistuksen.</li><li>Lohkojen järjestys tekstissä on asioiden järjestys, ylin tärkein.</li><li><code>Kipu</code> tai <code>Kipu*</code> omalla rivillään lohkon ulkopuolella on asiasana ilman sanoja.</li><li><code>Ehdot:</code> omalla rivillään aloittaa ehdot, jotka jatkuvat tekstin loppuun tai seuraavaan =-lohkoon:<ul><li><code>Kun Kipu ja Kuume, niin Flunssa esiin, Lepo pois.</code> <code>ja</code> = kaikki tarvitaan, <code>tai</code> = jokin riittää. Ilman sanaa esiin tai pois = esiin.</li><li>Syynä käyvät asiasana, ryhmä <code>#Oireet</code>, aikasana (<code>Myöhässä</code>, <code>Tänään</code>, <code>Huomenna</code>, <code>Tällä viikolla</code>) ja teksti lainausmerkeissä <code>"lääk"</code>. Seurauksena asiasana tai teksti.</li><li><code>Poissulkevat: Lepo, Lenkki.</code> Kun yksi on kuitattu, muut jäävät pois.</li></ul></li></ul><p>Uusi nimi luo asiasanan, ja puuttuva ryhmä tehdään tyhjänä. Puuttuva lohko tyhjentää asiasanan sanat, mutta asiasana jää. Puiden palikoiden säännöt ja =-lohkot muokataan puun tekstikentässä (Päätöspuu → Rakenna → Teksti).</p><p><b>Ohje tekoälylle</b> kopioi ohjeen, jonka voi liittää mille tahansa tekoälylle: se kertoo, mikä Juuri on, opettaa nämä kaavat ja sisältää kentän nykyisen tekstin. Tekoäly palauttaa koko tekstin koodilohkona; liitä se tähän kenttään ja paina Valmis (koodilohkon ```-rivit ohitetaan).</p>'],
asiasanat:['Asiasanat',KA_UUSI+KA_SANA+'<p><b>Uusi asiasana pidolla:</b> pidä sormea hetki luettelon kohdalla (ei rivin päällä), niin vihreä viiva näyttää kohdan. Vedä viiva oikeaan väliin ja nosta: kenttä aukeaa siihen. Uusi saa sen paikan. Reilu veto sivulle peruu. Rivin pito siirtää riviä.</p><p>Uuden asiasanan kenttään: <b>#Nimi</b> tekee listan ryhmän: valitse jäsenet napauttamalla ja paina Valmis. Ryhmät näkyvät omassa luettelossaan. <b>Poista asioita…</b> (Valikossa) avaa poistotilan: napauta poistettavat (omat asiasanat, ryhmät ja puiden palikat) ja vahvista <i>Poista valitut</i>. Palikka poistuu puusta sääntöineen.</p><p><b>Asiasanan kortti</b> kertoo Tunnistus-osiossa, mistä asia tulee ja mitä se tuo: <i>Tulee, kun tekstissä on</i>, <i>Ei, kun tekstissä on</i>, <i>Tulee, kun</i> / <i>Pois, kun</i> (ehdot) ja <i>Tuo</i>. Rivin napautus avaa sen ehtona, ja <i>+ Ehto tälle asialle</i> tekee uuden ehdon, jossa tämä asia on valmiina seurauksena. Sanoja muokataan vain ehtoina.</p><p>Asiasana tunnistuu muistiinpanosta nimestään ja liitetyistä sanoista. Sana löytyy osana mistä kohdasta tahansa, joten kirjoita vain se osa, joka ei taivu: <code>koir</code> löytää koirien ja kotikoiran. Isot kirjaimet ja välimerkit eivät vaikuta. Poissulkeva sana voittaa.</p><p>Jokainen päätöspuun palikka on itsestään asiasana (vähintään 3 kirjainta). Omat asiasanat ovat puista riippumattomia; samanniminen oma korvaa palikan. Asiasanat ja muistiinpanot ovat projektin yhteisiä kaikille sen puille.</p><p><b>Järjestys</b>: kaikki asiat ovat tärkeitä, ja järjestys ratkaisee: ylin on tärkein. Järjestä painamalla riviä pitkään ja raahaamalla. Muistiinpano saa tärkeimmän osumansa paikan (Muistio → Tärkeys).</p><p><b>Nousee esiin</b>: apukysymys tai asiasanan nimi tarjotaan muistiinpanossa, kun teksti osuu siihen. <b>Näytä kalenterissa</b>: nimi näkyy pienenä alaotsikkona viikkonauhan päivän alla ja päivän otsikossa.</p><p><b>Asiat tekstinä</b> (Valikossa): jokainen asiasana on lohko <code>=Nimi:</code> ja alle sanat riveittäin, <code>!</code> alussa poissulkeva, tyhjä rivi päättää. Uusi nimi luo asiasanan. Puuttuva lohko tyhjentää sanat, mutta asiasana jää. Puiden =-lohkot muokataan puun tekstikentässä.</p>'],
kalenteri:['Kalenteri',KA_AIKA+'<p>Projektin asetuksista (Projekti-ikkuna) voi poistaa viikonpäiviä ja lyhentää päivää alusta ja lopusta. Tekstin päiväykset lasketaan silti oikean kalenterin mukaan (huomenna on aina huominen). Jos päiväys osuu poistetulle päivälle, se jää ennalleen, mutta aikalinkki on harmaa ja tulkinnassa lukee <i>ei näy kalenterissa</i>; merkintä näkyy seuraavan näkyvän päivän Koko päivä -osiossa. Viikkonauha (ma–su) ja valitun päivän aikajana. Pyyhkäisy nauhalla vaihtaa viikkoa. Vaakatasossa viikon päivät ovat rinnakkain koko leveydellä. Puhelimella viikkonauha on alapalkin yllä. Päivärivin reunoilla olevat nuolet vaihtavat viikkoa ja valitsevat maanantain tai viikon ensimmäisen näkyvän päivän. <b>Tänään</b> palauttaa nykyiseen päivään. Kuukauden nimi avaa kuukausinäkymän, jossa päivän kohdalla on muistiinpanojen määrä. Pieni rengas päivän ruudussa kertoo, että päivällä on koko päivän merkintöjä; ne ovat aikajanan alla kohdassa <b>Koko päivä</b>.</p><p><b>Uusi merkintä:</b> <b>+</b> tekee merkinnän valitulle päivälle (tänään seuraavasta vartista, muina päivinä klo 9). Puhelimella <b>pidä sormea hetki</b> (noin neljännessekunti) tyhjässä kohdassa ja nosta: merkintä alkaa siitä kohdasta lähimpään varttiin. Pelkkä hipaisu tai vieritys ei tee mitään. Hiirellä napsautus mihin tahansa tekee merkinnän, ja vetämällä samalla liikkeellä valitset pituuden. Ilman loppuaikaa pituus on Asetusten oletuspituus. Tekstissä tai aikakentässä ilmaistu aika voittaa aina; +:lla tehdessä nappi <i>Myös kalenterin kohta</i> liittää kohdan mukaan, vaikka tekstissä on oma aika.</p><p>Napautus avaa muistiinpanon. Kalenterin kuittausruudusta kuitataan <b>vain se kohta</b> (päivä ja aika). Kun tekstin kaikki kerrat on kuitattu, teksti on kuitattu myös Muistiossa ja listoilla. Toistuva teksti valmistuu vasta toistuvuuden päätyttyä. Kuitattu jää kalenteriin haalennettuna ja katkoviivalla. <b>Arkistoitu</b> muistiinpano ei näy kalenterissa.</p><p><b>Pitkä painallus</b> nostaa merkinnän: siirrä 15 minuutin askelin, pudota viikkonauhan päivälle (päivä vaihtuu, kellonaika säilyy) tai Koko päivä -kohtaan (kellonaika pois). Koko päivän sirun voi raahata aikajanalle. Kulmaväkänen muuttaa loppuaikaa heti. Toistuva tai monen päivän merkintä ei siirry raahaamalla; muuta ajankohta tekstiin.</p><p>Merkintä on tavallinen muistiinpano: raahaus kirjoittaa ajan sinne, mistä se tuli (tekstiin tai kenttään). Leveällä ruudulla viikko näkyy sarakkeina.</p><p><b>Useita aikoja samalle päivälle:</b> jokainen kellonaika on oma merkintänsä, myös päällekkäiset ja sama aika kahdesti. Pelkkä kellonaika saa edellisen päivän myös seuraavilla riveillä (<code>Huomenna:</code> ja alle <code>klo 9 …</code>, <code>klo 12 …</code>), ja ketju jatkuu ilman klo-sanaa: <code>to 9–10, 11–12</code>, <code>huomenna 9 ja 10</code>.</p><p><b>Siirto</b> muuttaa tekstin aikaa samassa tyylissä kuin se oli kirjoitettu. Muutettu kohta on katkoviivan sisällä; napauta sitä muistiinpanossa, niin näet, mitä siinä oli aiemmin ja milloin se muutettiin.</p>'],
asetukset:['Asetukset','<p>Asetukset ovat Projekti-ikkunassa (Valikko → Projekti) ja koskevat vain sitä projektia, joten eri projekteilla voi olla eri tyyli. Uusi projekti saa aluksi nykyisen projektin asetukset: värit, vaalea/tumma, kuvitus, fontti, reunat, lasisuus, kalenterimerkinnän oletuspituus ja nappuloiden koko (pienet asettuvat vierekkäin).</p><p><b>Ilme</b>: oletuksena on valmis ilme <i>Lehto ja Hiillos</i>: Lehto on vaalea ja Hiillos tumma. Tila valitsee, kumpi on käytössä. Valitse kummallekin aksenttiväri ja otsikkofontti (napit näyttävät fontin). Valinta koskee vain tätä projektia. <i>Oma värisäätö</i> ottaa käyttöön alla olevan värikoneen entisillä arvoilla.</p><p><b>Värit</b>: värikone tekee koko appin värit yhdestä pohjaväristä. <i>Luonne</i> valitsee tyylin, <i>Kylläisyys</i> värien voimakkuuden, <i>Kontrasti</i> tekstin ja viivojen erottuvuuden ja <i>Taustan vaaleus</i> (tummassa <i>tummuus</i>) taustan sävyn. Tekstin luettavuus (vähintään 4,5:1) lasketaan aina automaattisesti.</p><p><b>Vaalea ja tumma</b>: tumma asu seuraa vaaleaa. Kun Tila on <i>Laitteen mukaan</i>, valitse <i>Muokattava asu</i>; appi näyttää sen, kunnes suljet ikkunan. Tummassa muuttamasi kohdat ovat tumman omia, ja <i>Vaalean mukaan</i> palauttaa kohdan. Tilakohtaisia ovat värit, nappien efekti sekä taustakuvan sumennus ja himmennys.</p><p><b>Taustakuva</b>: <i>+ Oma kuva</i> tuo kuvan puhelimesta. Omat kuvat ovat tällä laitteella kaikkien projektien käytössä ja kulkevat koko appin varmuuskopiossa, eivät projektin viennissä. Sumennus lasketaan kerran, kun kuva tai värit vaihtuvat.</p><p><b>Muistio</b>: <i>Asiasanojen tunnistus tekstistä</i> Pois = tässä projektissa muistiinpanojen ja listan rivien tekstistä ei tunnisteta asiasanoja eikä päätellä (asiasanat valitaan käsin listan riveille). <i>Muistiinpano aukeaa</i>: Muokattavana (oletus) tai Lukunäkymänä (kokeilu).</p><p><b>Tiedot</b> ovat vain tämän laitteen selaimen muistissa. Pikavienti on alapalkin vientinapissa, täysi vienti ja tuonti (myös tekstinä) Valikossa. Projektin nimi ja poisto ovat Valikon kohdassa Projekti, roskakori Muistioiden Kuitatuissa.</p>'],
projektit:['Projektit ja puut','<p><b>Käyttötila</b> piilottaa tästä projektista kaiken rakentelun: Asiat-osion, Rakenna-napin, rivien muokkauksen, listojen ja projektin asetukset. Listan rivi avautuu omaksi näkymäkseen, jossa tärkein avoin on ylimpänä; muualla avautuvat asiat odottavat, kunnes palaat (piste rivillä). Kytkin on tässä ikkunassa ja puhelimella myös Valikossa (Rakennustila palauttaa kaiken).</p><p><b>Ulkoasu ja Tiedot</b> (värit, vaalea/tumma, fontti, reunat, lasisuus, kalenterimerkinnän oletuspituus, nappuloiden koko) ovat tämän ikkunan alaosassa ja koskevat vain tätä projektia.</p><p><b>Kalenterin päivät</b> ja <b>näkyvä aika</b> (Nykyinen projekti) koskevat vain tätä projektia: napauta viikonpäivä pois käytöstä, ja valitse, mistä mihin päivä näkyy. Näkyvän ajan ulkopuolinen kellonaika näkyy päivän <i>Koko päivä</i> -osiossa. Pois käytöstä olevan päivän merkinnät näkyvät seuraavan käytössä olevan päivän Koko päivä -osiossa päivän nimen kanssa, joten mikään ei katoa. Aikaehdotukset eivät käytä pois olevia päiviä eivätkä piilotettuja tunteja.</p><p>Projektilla (esim. Mätsik Forest) on omat puut, muistiinpanot, asiasanat, tärkeät ja toistuvat. Napautus vaihtaa projektia. <i>Uusi projekti</i> luodaan nimellä. <b>Nykyinen projekti</b>: nimen vaihto ja poisto (kaksi painallusta, poistaa puut ja muistiinpanot). Projektin lisäys tiedostosta tai tekstistä ja vienti ovat Valikon kohdassa Vienti ja tuonti: lisäys ei korvaa mitään, ja saman niminen saa perään (2).</p><p>Puun asetukset: <b>Muisti</b> <i>Vain seuraava askel</i> tarjoaa vain viimeisen valinnan avaamat, <i>Kaikki mukana</i> pitää kerran avautuneet tarjolla, kunnes ne suljetaan pois tai avaaja puretaan. <b>Eteneminen</b> <i>Säännöt</i> etenee avaa-säännöin, <i>Tärkeysjärjestys</i> näyttää askeleessa tärkeimmän täyttymättömän merkityksen ehdot. <b>Lopuksi</b> <i>Hoidettavat</i> listaa kierroksen lopussa valitsematta jääneet tärkeysjärjestyksessä. <b>Muistiinpanoissa</b> <i>Lisää ilmoitukset</i>: puun säännöt toimivat muistiinpanoa kirjoittaessa, ja avautuvien ilmoitusten tekstit lisätään muistiinpanon loppuun (ohje muistiinpanon i-napista). Rakenna tällainen puu samoin kuin muutkin.</p>']
};
function syncChrome(){var tp=$('top');tp.dataset.mode=tab;tp.dataset.ed=(tab==='teach'&&ed&&(ed.m==='x'||ed.m==='c'))?ed.m:'';$('mode').textContent=MODE[tabKey()];
  $('nav').querySelectorAll('[data-tab]').forEach(function(button){
    if(ROLL0.indexOf(button.dataset.tab)>=0)button.hidden=ROLL.indexOf(button.dataset.tab)<0;
  });
  var lb=document.querySelector('.tab[data-tab="list"]'),dot=lb&&data.chk&&data.chk.some(function(r){return !r.l&&chkOpenN(r,new Date(),ctxOf(r))>0;}),od=lb&&lb.querySelector('.segdot');
  if(lb&&!!od!==!!dot){if(dot){var dd=el('i','segdot');dd.setAttribute('aria-hidden','true');lb.appendChild(dd);}else od.remove();lb.setAttribute('aria-label',dot?'Listat, tekemättä olevia':'Listat');}
  syncRoll(!!dot);}
/* 1.72 (Emil 24.10.2026): osiot rullataan vasemman alakulman napista. Napautus = seuraava, pyyhkäisy napin päällä = edellinen tai seuraava.
   Järjestys Muistio · Kalenteri · Listat · Asiat (suositus: Listat ja Asiat vierekkäin). Päätöspuu on Valikon takana. */
var ROLL0=['notes','cal','dash','sheets','treeni','list','puu','terms'],ROLL=ROLL0;/* Kaikki 0.7: Kojelauta kalenterin perään */
var SECTION_KEY='kaikki:piilotetut-osiot',hiddenSections=[];
try{
  var storedSections=JSON.parse(localStorage.getItem(SECTION_KEY)||'[]');
  if(Array.isArray(storedSections))hiddenSections=ROLL0.filter(function(k){return storedSections.indexOf(k)>=0;});
}catch(e){}
/* Käyttötila piilottaa Asiat, joten jätetään aina vähintään yksi muista osioista näkyviin. */
function sectionsFor(hidden,useMode){
  return ROLL0.filter(function(k){return (!useMode||k!=='terms')&&hidden.indexOf(k)<0;});
}
if(!sectionsFor(hiddenSections,true).length)hiddenSections=hiddenSections.filter(function(k){return k!=='notes';});
function showSectionSettings(){
  var list=$('section-settings-list');
  list.textContent='';
  ROLL0.forEach(function(k){
    var label=el('label'),box=el('input');
    box.type='checkbox';box.dataset.section=k;
    label.appendChild(box);label.appendChild(document.createTextNode(MODE[k]));
    list.appendChild(label);
    box.addEventListener('change',function(){
      var hidden=hiddenSections.filter(function(key){return key!==k;});
      if(!box.checked)hidden.push(k);
      if(sectionsFor(hidden,true).length){
        hiddenSections=hidden;
        try{localStorage.setItem(SECTION_KEY,JSON.stringify(hidden));}catch(e){}
        if(!box.checked&&tabKey()===k)showTab(sectionsFor(hidden,kt())[0]);
        else render();
      }
      syncSectionSettings();
    });
  });
  syncSectionSettings();openSheet($('section-settings'));
}
function syncSectionSettings(){
  var core=sectionsFor(hiddenSections,true);
  $('section-settings-list').querySelectorAll('input').forEach(function(box){
    box.checked=hiddenSections.indexOf(box.dataset.section)<0;
    box.disabled=core.length===1&&core[0]===box.dataset.section;
  });
}
$('section-settings-btn').addEventListener('click',showSectionSettings);
/* 1.101 (Emil 31.10.2026): käyttötila piilottaa rakentelun koko projektista; Asiat ei ole osiona mukana. */
function kt(){return !!(data.cfg&&data.cfg.kt==='on');}
function ktSet(on){if(on)data.cfg.kt='on';else delete data.cfg.kt;chkOpen={};chkFreeze=null;chkSeen=null;ktDone=false;save();if(on&&(tab==='teach'||tab==='terms'||tab==='set'))showTab(tab==='teach'?'use':sectionsFor(hiddenSections,true)[0]);else render();}
function rollIdx(){var k=tabKey();return ROLL.indexOf(k==='teach'?'use':k);}
function syncRoll(listDot){var k=tabKey(),i=rollIdx();crumbSync();var src=document.querySelector('#nav .tab[data-tab="'+(i<0?(k==='teach'?'use':k):ROLL[i])+'"] svg');$('roll-ic').innerHTML=src?src.outerHTML:'';
  $('roll-now').textContent=i<0?MODE[k==='teach'?'use':k]:MODE[ROLL[i]];$('roll-now').classList.toggle('long',$('roll-now').textContent.length>8);$('roll-next').textContent=MODE[ROLL[(i+1)%ROLL.length]];
  var d=$('roll-dots'),L=$('roll-let');d.textContent='';L.textContent='';ROLL.forEach(function(x,j){var e=el('i',j===i?'on':'');d.appendChild(e);L.appendChild(el('i',j===i?'on':'',MODE[x].charAt(0)));});
  $('roll').setAttribute('aria-label','Osio: '+$('roll-now').textContent+'. Valitse osio');$('roll').setAttribute('aria-haspopup','menu');$('roll').setAttribute('aria-controls','sectionpop');$('roll-dot').hidden=!listDot||k==='list'||ROLL.indexOf('list')<0;artLay();}
function rollTo(dir){var i=rollIdx(),n=i<0?(dir>0?0:ROLL.length-1):(i+dir+ROLL.length)%ROLL.length;showTab(ROLL[n]);var r=$('roll');r.classList.remove('slide');void r.offsetWidth;r.classList.add('slide');}
(function(){var r=$('roll'),sx=null,sw=false;r.addEventListener('touchstart',function(ev){sx=ev.touches[0].clientX;sw=false;},{passive:true});
  r.addEventListener('touchend',function(ev){if(sx===null)return;var dx=ev.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>28){sw=true;rollTo(dx<0?1:-1);}},{passive:true});
  r.addEventListener('click',function(){if(sw){sw=false;return;}sectionMenu();});})();
/* Valikko ja pikavienti: pieni ikkuna napin viereen. Napautus ulkopuolelle vain sulkee eikä tee muuta (Emil 24.10.2026). */
var popAnchor=null;
function popClose(){['qxpop','menupop','sectionpop','sortpop','wkpop','infop'].forEach(function(id){$(id).hidden=true;});$('roll').setAttribute('aria-expanded','false');$('menupop').textContent='';$('popbg').hidden=true;}
function anchoredMenu(id,anchor){popAnchor=anchor;popOpen(id);var m=$(id),a=anchor.getBoundingClientRect(),r=m.getBoundingClientRect(),vh=innerHeight;
  var left=Math.max(8,Math.min(a.left,innerWidth-r.width-8)),top=a.top-r.height-8;
  if(top<8)top=Math.min(vh-r.height-8,a.bottom+8);m.style.left=left+'px';m.style.top=Math.max(8,top)+'px';m.style.right='auto';m.style.bottom='auto';
  var b=m.querySelector('[aria-current="true"]')||m.querySelector('button:not(:disabled)');if(b)b.focus();}
function sectionMenu(){var m=$('sectionpop');m.textContent='';ROLL.forEach(function(k){var b=menuItem(m,'section-'+k,MODE[k],function(){showTab(k);$('roll').focus();});b.setAttribute('aria-current',tabKey()===k?'true':'false');});
  m.appendChild(el('div','msep'));menuItem(m,'section-settings-item','Osiot tällä laitteella',function(){$('roll').focus();showSectionSettings();});
  $('roll').setAttribute('aria-expanded','true');anchoredMenu('sectionpop',$('roll'));}
function sortMenu(anchor){var m=$('sortpop'),V=nvCur();if(viewLocked(noteViewPath(V)))return;
  m.textContent='';var modes=noteOrderEnabled()?SORTO.concat('own'):SORTO;
  modes.forEach(function(k){var b=menuItem(m,'sort-'+k,SORTN[k],function(){
    if(k==='own')noteOwnReset(V);
    else{noteBaseSet(V,k);activeScroller().scrollTop=0;render();}
    $('notesort').focus({preventScroll:true});
  });b.setAttribute('aria-current',noteBaseSort(V)===k?'true':'false');});anchoredMenu('sortpop',anchor);}
addEventListener('resize',function(){if(!$('sectionpop').hidden||!$('sortpop').hidden)popClose();});
document.addEventListener('keydown',function(e){var m=document.querySelector('.popm:not([hidden])');if(!m)return;if(e.key==='Escape'){e.preventDefault();popClose();if(popAnchor&&popAnchor.isConnected)popAnchor.focus();}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var bs=Array.prototype.slice.call(m.querySelectorAll('button')),i=bs.indexOf(document.activeElement);if(bs.length)bs[(i+(e.key==='ArrowDown'?1:bs.length-1))%bs.length].focus();}});
function popOpen(id){['qxpop','menupop','sectionpop','sortpop','wkpop','infop'].forEach(function(x){if(x!==id)$(x).hidden=true;});barSizes();$(id).hidden=false;$('popbg').hidden=false;}
$('popbg').addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();popClose();});
$('popbg').addEventListener('touchmove',function(ev){ev.preventDefault();},{passive:false});
function toast(m){if(!m)return;undoS=null;$('undo-t').textContent=m;$('undo-b').hidden=true;$('undo').hidden=false;clearTimeout(undoT);undoT=setTimeout(undoHide,3500);}
$('qx').addEventListener('click',function(){var k=kOf();$('qx-proj').textContent='Vie projekti'+(k?': '+k.name:'');popOpen('qxpop');});
function qxText(txt){vsMsg('Tiedoston tallennus ei onnistunut. Kopioi teksti.');$('dataout').textContent='';$('impbox').hidden=true;renderVs();openSheet($('vsheet'));vsText(txt,true);}
$('qx-all').addEventListener('click',function(){popClose();shareFile(JSON.stringify(fullExport(),null,1),expName(),toast,qxText,markAll);});
$('qx-proj').addEventListener('click',function(){popClose();stashK();var k=kOf(),now=nowIso();
  shareFile(JSON.stringify(projectFile(k,now),null,1),expName(k.name),toast,qxText,function(){k.ex=now;k.chg=null;save();renderStatus();});});
function menuItem(m,id,txt,fn,cls){var b=el('button',cls||'',txt);b.type='button';b.id=id;b.setAttribute('role','menuitem');b.addEventListener('click',function(){popClose();fn();});m.appendChild(b);return b;}
function openMenu(){var m=$('menupop'),k=kOf();m.textContent='';
  if(tab==='terms'){m.appendChild(el('div','mh','Asiat'));menuItem(m,'tt-open','Asiat tekstinä',function(){termCur='text';renderTerms();});
    menuItem(m,'tdel-mode','Poista asioita…',function(){termDel={};render();},'danger');m.appendChild(el('div','msep'));}
  m.appendChild(el('div','mh','Projekti'));
  menuItem(m,'m-proj',(k?k.name:'Projekti')+' ⌄',function(){openProj('k');});
  menuItem(m,'m-x','Vienti ja tuonti',function(){$('xbtn').click();});
  menuItem(m,'m-gh','GitHub-vault: '+vStatus(),function(){openGh();});
  if(vOn()){
    menuItem(m,'m-vreq','Pyydä tekoälyä järjestämään',function(){openVWork(true);});
    menuItem(m,'m-vwork','Tekoälylle',function(){openVWork(false);});
  }
  if(wide())menuItem(m,'m-sections','Osiot tällä laitteella',function(){$('section-settings-btn').click();});
  menuItem(m,'m-help','Ohje: '+(MODE[tabKey()]||''),function(){showHelp(hintKey);});
  menuItem(m,'m-writing-guide','Kirjoitusohje',showWritingGuide);
  menuItem(m,'m-mv','Muuttujat',function(){openMuuttujat(null);});
  menuItem(m,'m-observations','Havaintotaulukot',function(){openObservationView();});
  menuItem(m,'m-saatimet','Säätimet',openSaadinList);
  if(OLDUI)menuItem(m,'m-tree',tab==='use'||tab==='teach'?'Vanhat puut (auki)':'Vanhat puut',function(){showTab('use');});
  m.appendChild(el('div','msep'));menuItem(m,'m-kt',kt()?'Rakennustila':'Käyttötila',function(){ktSet(!kt());});
  if(wide()&&$('deskmenu')&&$('deskmenu').offsetParent){anchoredMenu('menupop',$('deskmenu'));return;}
  popOpen('menupop');}
$('menu').addEventListener('click',openMenu);
/* Kaikki 0.32 (Emil 22.11.2026, A0.9): tietokoneen yläpalkissa näkyvät vain päivitys, pikakirjaus ja Valikko; muut toiminnot Valikossa. */
$('deskmenu').addEventListener('click',function(e){e.stopPropagation();openMenu();});
/* Rakentaminen (ent. Opetus) on Päätöspuu-välilehden sisällä: tab 'teach' korostaa alapalkissa Päätöspuun (Emil 22.10.2026) */
var HKEY={treeni:'treeni',sheets:'taulukot',dash:'kojelauta',puu:'puu',use:'paatospuu',teach:'rakenna',notes:'muistiot',list:'lista',cal:'kalenteri',set:'asetukset',terms:'asiasanat'};
/* 1.66 (Emil 23.10.2026): Listat on oma päätoiminto alapalkissa (Muistiot · Kalenteri · Listat · Päätöspuu). Sisäisesti sama paneeli kuin
   Muistioilla (noteView 'chk'), mutta oma välilehti, otsikko, ohje ja vierityskohta. */
function tabKey(){return tab==='notes'&&noteView==='chk'?'list':tab;}
function activeScroller(){var list=tab==='notes'&&$('nlist');return list&&list.classList.contains('rv-scroll')?list:main;}
main.addEventListener('wheel',function(event){
  if(!['notes','dash','cal','sheets'].includes(tab)||event.ctrlKey||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;
  for(var node=event.target;node instanceof Element&&main.contains(node);node=node.parentElement){
    if(node.scrollWidth<=node.clientWidth+1||!['auto','scroll'].includes(getComputedStyle(node).overflowX))continue;
    if(event.deltaX<0?node.scrollLeft>1:node.scrollLeft<node.scrollWidth-node.clientWidth-1)return;
  }
  if(event.cancelable)event.preventDefault();
},{passive:false});
function showTab(t){scrollPos[tabKey()]=activeScroller().scrollTop;if(t==='list'){t='notes';noteView='chk';}else if(t==='notes'&&noteView==='chk')noteView='open';if(t!=='notes'||noteView!=='open')noteSelectionReset();tab=t;var nk=tabKey();hintKey=HKEY[nk];if(t==='teach')panels.use.textContent='';if(t==='use')panels.teach.textContent='';
  Object.keys(panels).forEach(function(k){panels[k].hidden=k!==t;});
  Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(b){b.setAttribute('aria-selected',b.dataset.tab===(t==='teach'?'use':nk)?'true':'false');});
  render();activeScroller().scrollTop=scrollPos[nk]||0;}
/* Pienet siirtymät (Emil 21.10.2026): sama rivi liukuu uuteen kohtaansa ja vaihtaa värinsä pehmeästi, uusi rivi häivyttyy esiin.
   Rivit tunnistetaan listan id:stä ja data-id:stä. Ei mitään, jos laite pyytää vähemmän liikettä tai näkymä vaihtui kokonaan. */
var animOn=false,RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
function animKey(e){var l=e.parentNode;return (l&&l.id||'')+'|'+e.dataset.id;}
function anim(fn){if(animOn||!document.body.animate||(RM&&RM.matches))return fn();animOn=true;var before={};
  try{Array.prototype.forEach.call(main.querySelectorAll('.rows > [data-id]'),function(e){var cs=getComputedStyle(e);before[animKey(e)]={r:e.getBoundingClientRect(),bg:cs.backgroundColor,c:cs.color};});}catch(x){}
  try{fn();}finally{animOn=false;}
  requestAnimationFrame(function(){var now=Array.prototype.slice.call(main.querySelectorAll('.rows > [data-id]')),hit=now.filter(function(e){return before[animKey(e)];});if(!hit.length)return;
    now.forEach(function(e){var b=before[animKey(e)];if(!b){e.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});return;}
      var r=e.getBoundingClientRect(),dx=b.r.left-r.left,dy=b.r.top-r.top,cs=getComputedStyle(e),k=[{},{}];
      if(Math.abs(dx)>1||Math.abs(dy)>1){k[0].transform='translate('+dx+'px,'+dy+'px)';k[1].transform='none';}
      if(b.bg!==cs.backgroundColor){k[0].backgroundColor=b.bg;k[1].backgroundColor=cs.backgroundColor;}
      if(b.c!==cs.color){k[0].color=b.c;k[1].color=cs.color;}
      if(Object.keys(k[0]).length)e.animate(k,{duration:200,easing:'cubic-bezier(.2,.8,.2,1)'});});});}
function render(){anim(render0);syncDock();}
/* Tietokone (vaihe 14, Emil 21.10.2026): sama appi leveällä ruudulla. Sivupalkki, viikkokalenteri, ikkunat keskellä ja
   Opetuksessa tekstikenttä aina auki oikealla: kirjoitus päivittää puun heti, napautetut säännöt päivittävät tekstin. */
var wideMq=window.matchMedia?window.matchMedia('(min-width:1000px)'):null;
function wide(){return !!(wideMq&&wideMq.matches);}
var landMq=window.matchMedia?window.matchMedia('(max-width:999px) and (orientation:landscape) and (max-height:520px)'):null;
function land(){return !!(landMq&&landMq.matches);}
if(landMq){var onLand=function(){calTop=null;render();barSizes();};if(landMq.addEventListener)landMq.addEventListener('change',onLand);else if(landMq.addListener)landMq.addListener(onLand);}
if(wideMq){var onWide=function(){calTop=null;render();};if(wideMq.addEventListener)wideMq.addEventListener('change',onWide);else if(wideMq.addListener)wideMq.addListener(onWide);}
var dockPid=null,dockT=0;
function syncDock(){var d=$('xsheet'),P=proj(),on=wide()&&tab==='teach'&&!!P,ta=$('xs-text');document.querySelector('.app').classList.toggle('docked',on);
  if(!on){if(d.classList.contains('dock')){d.classList.remove('dock');if(d.open)d.close();dockPid=null;}return;}
  if(!d.classList.contains('dock')){if(d.open)d.close();d.classList.add('dock');$('xs-msg').textContent='';d.show();dockPid=null;}
  if(P.id!==dockPid||(document.activeElement!==ta&&ta.value!==P.text)){ta.value=xsPrev=P.text;dockPid=P.id;paintCode();}}
function dockApply(){var P=proj(),ta=$('xs-text');if(!P||!$('xsheet').classList.contains('dock')||ta.value===P.text)return;P.text=ta.value;rulesFromText(P);var pt=parseText(P.text),o=orphans(P);touch();
  $('xs-msg').textContent=(pt.warnings.length?pt.warnings.join(' ')+' ':'')+(o.length?'Säännöt viittaavat nimiin, joita ei enää ole: '+o.join(', ')+'.':'');anim(render0);}
/* Toistuvien erät avoimiksi aina piirrettäessä (appia avattaessa ja näkymää vaihdettaessa) */
/* Suhteelliset sanat (1.36): päivän vaihtuessa tekstiin tänään, eilen tai päiväys. Ei lasketa viemättömäksi muutokseksi. */
var relDay=null;
function runRel(){
  var day=todayIso();if(relDay===day)return false;relDay=day;stashK();
  var changed=false;
  data.K.forEach(function(k){(k.notes||[]).forEach(function(note){
    if(!note.vp&&relSweep(note,day))changed=true;
  });});
  if(changed)save();
  return changed;
}
var RX_LOCAL_KEY='kaikki:toistoilmoitukset';
var localExpiries={};
try{localExpiries=JSON.parse(localStorage.getItem(RX_LOCAL_KEY)||'{}')||{};}catch(e){}
function runReps(){
  var day=todayIso(),now=nowIso(),made=repsDue(data.reps,data.notes,day,now,allTerms()),vaultCopies=new Map();
  termCache=null;
  var candidates=data.notes.map(function(note){
    if(!note.vp)return note;
    var key=[vRepo(),G.branch,note.vp].join('\n');
    var known=Array.isArray(localExpiries[key])?localExpiries[key]:[];
    var copy=Object.assign({},note,{rx:Array.from(new Set((note.rx||[]).concat(known)))});
    vaultCopies.set(key,copy);return copy;
  });
  var expired=recExpiries(candidates,day,now);
  if(expired.length){
    vaultCopies.forEach(function(note,key){if(note.rx.length)localExpiries[key]=note.rx;});
    try{localStorage.setItem(RX_LOCAL_KEY,JSON.stringify(localExpiries));}catch(e){}
  }
  if(!made.length&&!expired.length)return;
  data.notes=made.concat(expired,data.notes);
  if(made.length)touch();
  else save0();
}
function render0(){impAll();document.body.classList.toggle('kt',kt());ROLL=sectionsFor(hiddenSections,kt());phaseEnsure(data);txAll();runRel();runReps();setInfo();main.style.overscrollBehaviorY=tab==='cal'?'none':'';$('actbar').hidden=true;
  if(tab==='puu')renderPuu();else if(tab==='use')renderUse();else if(tab==='teach')renderTeach();else if(tab==='notes')renderNotes();else if(tab==='dash')renderDash();else if(tab==='sheets')renderSheets();else if(tab==='treeni')renderTreeni();else if(tab==='cal')renderCal();else if(tab==='terms')renderAsiat();else renderSettings();sbarSync();syncChrome();}
/* 1.73 (Emil 24.10.2026): puhelimella osion ohjainrivi siirretään alas alapalkin yläpuolelle. Rivi rakennetaan osioon kuten ennen ja siirretään
   joka piirrossa; tietokoneella se jää paikalleen. */
function sbarSync(){var s=$('sbar'),k=tabKey(),n=null;s.textContent='';$('pbar').dataset.sec=k;
  if(!wide()){if(k==='notes')n=$('noteview');else if(k==='list'){var c=$('chlist-pick');n=c&&c.closest('.plbar');}else if(k==='cal')n=document.querySelector('#calsticky .calhead');else if(k==='dash')n=$('dashrange');}
  if(n){var par=n.parentNode;s.appendChild(n);if(k==='notes'&&$('nviewbtn'))s.appendChild($('nviewbtn'));/* 0.10: Kortit/Rivit puhelimella alapalkissa */if(par&&par.id==='nbar'&&!par.children.length)par.hidden=true;}
  s.hidden=!n;barSizes();}
$('nav').addEventListener('click',function(ev){var b=ev.target.closest('[data-tab]');if(b)showTab(b.dataset.tab);});
/* 1.55 (I1): isot ikkunat täyttävät tilan yläpalkin ja alapalkin välissä. Otsikon edessä harmaana se, minne ruksi palaa
   (välilehti tai alla oleva ikkuna). Puhelimella 1.74:stä alkaen ikkunalla on oma alapalkki, jonka ‹-nappi sulkee kuten ruksi; osio ei vaihdu. */
/* 1.105 (Emil 18.11.2026): listojen ikkunat (Listat, rivin ikkuna) ovat pieniä ikkunoita päällä; ulkopuolinen napautus sulkee, ei ruksia */
var SMALL={csheet:1,dsheet:1,pksheet:1,wsheet:1,ksheet:1,pvsheet:1,gsheet:1,'vwork-sheet':1,'section-settings':1,'dash-entry':1,'quick-entry':1,'tre-text':1,'note-graph':1,'xy-picker':1,'note-batch-delete':1,'note-batch-tags':1,'sheet-edit':1,'sheet-new':1,'board-edit':1,'tag-migration':1,'writing-guide':1,'flow-text-preview':1};
function barSizes(){var t=$('top'),n=$('pbar').offsetParent?$('pbar'):$('nav'),r=document.documentElement.style;
  if(t)r.setProperty('--toph',Math.max(0,Math.round(t.getBoundingClientRect().bottom))+'px');
  if(typeof land==='function'&&land()){r.setProperty('--toph','0px');r.setProperty('--navh','0px');r.setProperty('--sbh','0px');return;}
  if(n)r.setProperty('--navh',Math.max(0,Math.round(innerHeight-n.getBoundingClientRect().top))+'px');
  var sb=$('sbar');r.setProperty('--sbh',(sb&&!sb.hidden&&sb.offsetParent?Math.max(0,Math.round(innerHeight-sb.getBoundingClientRect().top)):Math.max(0,Math.round(innerHeight-(n?n.getBoundingClientRect().top:innerHeight))))+'px');}
addEventListener('resize',barSizes);
/* 1.79: avoimet isot ikkunat avausjärjestyksessä (ei DOM-järjestyksessä), jotta päällimmäinen on viimeinen */
var sheetN=0;
function openBig(){return [].slice.call(document.querySelectorAll('dialog.big[open]')).sort(function(a,b){return (a._ord||0)-(b._ord||0);});}
function crumbOf(d){var open=openBig().filter(function(x){return x!==d;}),p=open[open.length-1];
  if(p){var h=p.querySelector('h2'),t=h?clean(h.textContent):'';if(t)return (t.length>24?t.slice(0,23)+'…':t)+' / ';}
  var b=$('nav').querySelector('[aria-selected="true"]');return b?clean(b.textContent)+' / ':'';}
function growTa(ta,ev){if(ta.id==='ns-text')return noteGrow(ev);if(ta.classList.contains('mono')||/vh/.test(ta.style.minHeight)||!ta.offsetParent)return;ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight+2,Math.round(innerHeight*.5))+'px';}
document.addEventListener('input',function(ev){if(ev.target.tagName==='TEXTAREA')growTa(ev.target,ev);},true);
/* 1.71 (Emil 24.10.2026): muistiinpanon kenttä alkaa viiden rivin korkuisena, sen alla on aina yksi tyhjä rivi, ja se kasvaa
   näppäimistön yläreunaan asti. Sen jälkeen kenttä vierii. Kentän ja näppäimistön väliin jää kapea tumma kaista (#kbgap). */
function noteGrow(ev){var ta=$('ns-text');if(!ta||!ta.offsetParent)return;
  /* 0.58: kirjoittaessa korkeus lasketaan uudelleen vain, jos teksti ei enää mahdu tai sitä poistettiin (height:auto pakotti joka merkillä koko sivun asettelun) */
  if(ev&&ev.inputType&&!/^delete/.test(ev.inputType)&&ta.style.height&&ta.scrollHeight<=ta.clientHeight){$('ns-hl').scrollTop=ta.scrollTop;return;}ta.style.minHeight=kbOpen()?'0':'';var cs=getComputedStyle(ta),lh=parseFloat(cs.lineHeight)||22,pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),
  v=window.visualViewport;ta.style.height='auto';var want=Math.max(5*lh+pad,ta.scrollHeight+lh),top=ta.getBoundingClientRect().top,
  cap=kbOpen()?v.offsetTop+v.height-top-14:want;/* Kaikki 0.4: ilman näppäimistöä kenttä kasvaa koko mittaansa, jolloin ikkuna vierii itse eikä teksti nyi (teksti piirtyy korostuskerroksesta) */ta.style.height=Math.round(Math.max(3*lh+pad,Math.min(want,cap)))+'px';
  $('ns-hl').scrollTop=ta.scrollTop;}
function kbGap(){var g=$('kbgap'),v=window.visualViewport,a=document.activeElement,on=!!(v&&kbOpen()&&a&&a.matches&&a.matches('textarea,input[type=text],input[type=search],input:not([type])'));
  g.hidden=!on;if(on)g.style.top=Math.round(v.offsetTop+v.height-8)+'px';}
if(window.visualViewport){['resize','scroll'].forEach(function(e){visualViewport.addEventListener(e,function(){kbGap();if(document.activeElement===$('ns-text'))noteGrow();});});}
document.addEventListener('focusin',function(){setTimeout(kbGap,350);});document.addEventListener('focusout',function(){setTimeout(kbGap,50);});
/* 1.61 (Emil 23.10.2026): ikkunan ollessa auki tausta ei vierity sen ala- tai yläpuolelta */
function modalSync(){document.documentElement.classList.toggle('modal',!!document.querySelector('dialog[open]:not(.dock)'));crumbSync();}
document.addEventListener('touchmove',function(ev){if(!document.documentElement.classList.contains('modal'))return;var t=ev.target;
  if(t.tagName==='DIALOG'||!t.closest||!t.closest('dialog[open]'))ev.preventDefault();},{passive:false});
/* 1.64 (Emil 23.10.2026): muistiinpanon tekstikenttä ei pomppaa yläpalkin alle, kun näppäimistö avautuu. Palkkien mitat jäädytetään
   näppäimistön ajaksi, ja kentän saadessa fokuksen sivun ja ikkunan vieritys palautetaan ennalleen; näppäimistö saa mieluummin peittää alareunan. */
function kbOpen(){var v=window.visualViewport;return !!v&&v.height<innerHeight*0.85;}
if(window.visualViewport){visualViewport.addEventListener('resize',function(){if(document.querySelector('dialog.big[open]')&&!kbOpen())barSizes();});
  visualViewport.addEventListener('scroll',function(){if(kbHold&&(window.scrollY||visualViewport.offsetTop))window.scrollTo(0,0);});}
var kbHold=0;
/* Kaikki tekstikentät: sivu ei saa siirtyä palkkien alle. Ikkunan sisäinen vieritys palautetaan, jos kentän yläreuna jäisi silloinkin
   näppäimistön yläpuolelle; muuten iOS saa vierittää, mutta kentän yläreuna ei jää yläpalkin alle. */
function kbKeep(ta){var d=ta.closest('dialog')||ta.closest('#main'),st=d?d.scrollTop:0,y0=ta.getBoundingClientRect().top,
  fix=function(){if(window.scrollY)window.scrollTo(0,0);if(!d)return;var v=window.visualViewport,vh=kbOpen()?v.height:innerHeight*0.55,top=d.getBoundingClientRect().top;
    if(d.scrollTop!==st&&y0<vh-48)d.scrollTop=st;else{var y=ta.getBoundingClientRect().top;if(y<top+4)d.scrollTop-=top+4-y;}};
  kbHold=Date.now();ta.addEventListener('focus',function f(){ta.removeEventListener('focus',f);[0,50,150,300,500,800].forEach(function(ms){setTimeout(fix,ms);});setTimeout(function(){kbHold=0;},900);});}
document.addEventListener('touchstart',function(ev){var t=ev.target;if(!t||!t.matches||t===document.activeElement)return;
  if(t.matches('textarea,input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]),[contenteditable]'))kbKeep(t);},{passive:true,capture:true});
function openSheet(d){d._ord=++sheetN;if(!SMALL[d.id]){d.classList.add('big');barSizes();var h=d.querySelector('h2');if(h)h.setAttribute('data-crumb',crumbOf(d));dbarSync(d);}
  if(d.showModal)d.showModal();else d.setAttribute('open','');modalSync();
  requestAnimationFrame(function(){[].forEach.call(d.querySelectorAll('textarea'),growTa);});}
function closeSheet(d){if(d.close)d.close();else d.removeAttribute('open');modalSync();}
/* 1.74: ison ikkunan oma alapalkki puhelimella. Ruksi (.sx) siirtyy palkkiin ‹ paluukohde -napiksi, tietokoneella se palaa otsikkoriville.
   Palkki on ikkunan ensimmäinen lapsi, jotta avautuva ikkuna antaa fokuksen paluunapille eikä tekstikentälle (ei näppäimistöä). */
function dbarSync(d){var x=d.querySelector('.sx');if(!x)return;var bar=d.querySelector(':scope>.dbar');
  if(!wide()){if(!bar){bar=el('div','dbar');bar.appendChild(el('span','sp'));var hb=button(bar,'i','pbtn dhelp',function(){var ib=d.querySelector('.hrow .ibtn');if(ib)ib.click();});hb.setAttribute('aria-label','Ohje');d.insertBefore(bar,d.firstChild);}
    var back=clean((crumbOf(d)||'').replace(/ \/ $/,''))||'Takaisin',l=x.querySelector('.sxl');if(!l){l=el('span','sxl');x.appendChild(l);}l.textContent='‹ '+back;x.setAttribute('aria-label','Takaisin: '+back);
    bar.insertBefore(x,bar.firstChild);bar.querySelector('.dhelp').hidden=!d.querySelector('.hrow .ibtn');}
  else if(bar&&x.parentNode===bar){var hr=d.querySelector('.hrow');if(hr)hr.appendChild(x);else d.insertBefore(x,d.firstChild);x.setAttribute('aria-label','Sulje');}}
/* 1.74: yläreunan pieni rivi kertoo myös avoimen ikkunan nimen (Projekti · Osio › Ikkuna) */
function crumbSync(){var k=tabKey(),k0=kOf(),t=(k0?k0.name:'Juuri')+' · '+(MODE[k]||''),o=openBig(),d=o[o.length-1];
  if(d){var h=d.querySelector('h2'),ht=h?clean(h.textContent):'';if(ht)t+=' › '+ht;}$('crumb').textContent=t;}
/* Ikkunan sulkeminen ohi napauttamalla tai Esc tallentaa samoin kuin Valmis */
function sheetDone(d){var ok=d.querySelector('[data-done]');if(ok)ok.click();else closeSheet(d);}
var SHEETS=['phsheet','wsheet','ehsheet','vsheet','psheet','xsheet','lsheet','ksheet','esheet','nsheet','tsheet','rsheet','hsheet','csheet','fsheet','pksheet','dsheet','pvsheet','gsheet','vwork-sheet','section-settings','dash-entry','quick-entry','tre-text','note-graph','xy-picker','note-batch-delete','note-batch-tags','sheet-edit','sheet-new','board-edit','tag-migration','writing-guide','flow-text-preview'];
SHEETS.forEach(function(id){var d=$(id);d.addEventListener('close',modalSync);d.addEventListener('click',function(ev){if(ev.target!==d||d.classList.contains('dock'))return;
    if(!d.classList.contains('big')||matchMedia('(max-width:999px)').matches){var q=d.getBoundingClientRect(),x=ev.clientX,y=ev.clientY;
      if(x>=q.left&&x<=q.right&&y>=q.top&&y<=q.bottom)return;sheetDone(d);return;}
    sheetDone(d);});
  d.addEventListener('cancel',function(ev){ev.preventDefault();sheetDone(d);});});
/* Sulkeminen oikean yläkulman ruksista (Emil 21.10.2026: alasveto sekoittui alla olevan tason raahaukseen). Ruksi toimii kuten Valmis. */
SHEETS.forEach(function(id){if(SMALL[id])return;var d=$(id),x=el('button','sx');x.type='button';x.setAttribute('aria-label','Sulje');
  x.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg>';x.addEventListener('click',function(){sheetDone(d);});var hr=d.querySelector('.hrow');if(hr)hr.appendChild(x);else d.insertBefore(x,d.firstChild);});
SHEETS.forEach(function(id){var h=$(id).querySelector('h2');if(h&&window.MutationObserver)new MutationObserver(function(){if($(id).open)crumbSync();}).observe(h,{childList:true,characterData:true,subtree:true});});
function firstProjForm(p){p.appendChild(el('h2','','Ensimmäinen päätöspuu'));
  p.appendChild(el('p','sub','Anna puulle nimi, sitten kirjoitat tai liität sisällön tekstikenttään.'));
  var r=el('div','addrow'),i=el('input');i.type='text';i.id='firstproj';i.placeholder='Nimi';i.autocomplete='off';r.appendChild(i);
  button(r,'Luo','btn solid',function(){newProject(i.value);});i.addEventListener('keydown',function(ev){if(ev.key==='Enter')newProject(i.value);});p.appendChild(r);}
function newProject(name){name=clean(name);if(!name)return false;var P={id:uid('p'),name:name.slice(0,80),text:'',rt:1,rules:{},mx:[],session:null};
  data.projects.push(P);data.cur=P.id;touch();renderHead();render();return true;}

/* ---- projektit ---- */
var psMode='k';
function openProj(m){psMode=m;renderProjSheet();openSheet($('psheet'));}
$('title').addEventListener('click',function(){openProj('k');});
function renderProjSheet(){var l=$('ps-list'),P=proj(),k0=kOf();l.textContent='';$('pk-kt').setAttribute('aria-checked',kt()?'true':'false');
  $('pk-wl').setAttribute('aria-checked',String(wlEnabled(data.cfg)));renderCalv();if(psMode==='k')renderPkSet();$('pk-name').value=k0?k0.name:'';$('pk-del').disabled=data.K.length<2;$('pk-mmsg').textContent='';$('ps-msg').textContent='';$('pk-msg').textContent='';$('psheet').dataset.m=psMode;$('ps-h').textContent=psMode==='k'?'Projekti':'Puut: '+((kOf()||{}).name||'');
  var kl=$('pk-list');kl.textContent='';data.K.forEach(function(k){var b=el('button','row'+(k.id===data.k?' sel':''));b.type='button';b.dataset.k=k.id;var t=el('span','t',k.name);
    var pj=k.id===data.k?data.projects:k.projects,nn=k.id===data.k?data.notes:k.notes;t.appendChild(el('small','',pj.length+(pj.length===1?' puu':' puuta')+' · '+nn.length+(nn.length===1?' muistiinpano':' muistiinpanoa')));b.appendChild(t);
    b.addEventListener('click',function(){if(k.id!==data.k){stashK();loadK(k);resetDraft();ed=null;termCache=null;noteFilter=[];save();applyCfg();renderHead();render();}closeSheet($('psheet'));});kl.appendChild(b);});
  data.projects.forEach(function(Q){var b=el('button','row'+(Q.id===data.cur?' sel':''));b.type='button';var t=el('span','t',Q.name);
    if(Q.session)t.appendChild(el('small','','kierros kesken'));b.appendChild(t);
    b.addEventListener('click',function(){if(data.cur!==Q.id){data.cur=Q.id;resetDraft();ed=null;save();render();}closeSheet($('psheet'));});l.appendChild(b);});
  $('ps-cur').hidden=!P;if(P){$('ps-name').value=P.name;Array.prototype.forEach.call(document.querySelectorAll('#ps-end button'),function(b){b.setAttribute('aria-pressed',(P.end==='hoid')===(b.dataset.end==='hoid')?'true':'false');});
    Array.prototype.forEach.call(document.querySelectorAll('#ps-mem button'),function(b){b.setAttribute('aria-pressed',(P.mem==='all')===(b.dataset.mem==='all')?'true':'false');});
    Array.prototype.forEach.call(document.querySelectorAll('#ps-flow button'),function(b){b.setAttribute('aria-pressed',(P.flow==='prio')===(b.dataset.flow==='prio')?'true':'false');});
    Array.prototype.forEach.call(document.querySelectorAll('#ps-notes button'),function(b){b.setAttribute('aria-pressed',(P.notes==='on')===(b.dataset.notes==='on')?'true':'false');});}}
Array.prototype.forEach.call(document.querySelectorAll('#ps-notes button'),function(b){b.addEventListener('click',function(){var P=proj();if(!P)return;if(b.dataset.notes==='on')P.notes='on';else delete P.notes;touch();renderProjSheet();});});
Array.prototype.forEach.call(document.querySelectorAll('#ps-flow button'),function(b){b.addEventListener('click',function(){var P=proj();if(!P)return;if(b.dataset.flow==='prio')P.flow='prio';else delete P.flow;resetDraft();touch();renderProjSheet();render();});});
Array.prototype.forEach.call(document.querySelectorAll('#ps-mem button'),function(b){b.addEventListener('click',function(){var P=proj();if(!P)return;if(b.dataset.mem==='all')P.mem='all';else delete P.mem;resetDraft();touch();renderProjSheet();render();});});
Array.prototype.forEach.call(document.querySelectorAll('#ps-end button'),function(b){b.addEventListener('click',function(){var P=proj();if(!P)return;if(b.dataset.end==='hoid')P.end='hoid';else delete P.end;touch();renderProjSheet();});});
$('pk-kt').addEventListener('click',function(){ktSet(!kt());renderProjSheet();});
$('pk-wl').addEventListener('click',function(){
  var enabled=!wlEnabled(data.cfg);
  data.cfg.wl=enabled?'on':'off';
  wlC=null;save();
  this.setAttribute('aria-checked',String(enabled));
  renderPkSet();
  if($('nsheet').open){$('ns-tm').hidden=true;paintHl();}
});
$('ps-add').addEventListener('click',function(){if(newProject($('ps-new').value)){$('ps-new').value='';renderProjSheet();}});
$('ps-new').addEventListener('keydown',function(ev){if(ev.key==='Enter'&&newProject($('ps-new').value)){$('ps-new').value='';renderProjSheet();}});
$('ps-name').addEventListener('change',function(){var P=proj(),n=clean($('ps-name').value);if(P&&n){P.name=n.slice(0,80);touch();renderHead();renderProjSheet();}});
$('ps-copy').addEventListener('click',function(){var P=proj();if(!P)return;
  var Q={id:uid('p'),name:(P.name+' (kopio)').slice(0,80),text:P.text,rt:1,rules:JSON.parse(JSON.stringify(P.rules||{})),mx:JSON.parse(JSON.stringify(P.mx||[])),need:JSON.parse(JSON.stringify(P.need||{})),order:JSON.parse(JSON.stringify(P.order||{})),end:P.end,mem:P.mem,flow:P.flow,notes:P.notes,session:null};rulesFromText(Q);
  data.projects.splice(data.projects.indexOf(P)+1,0,Q);data.cur=Q.id;resetDraft();ed=null;touch();renderHead();renderProjSheet();render();
  $('ps-msg').textContent='Kopio tehty ja avattu. Vaihda nimi yllä.';});
var delArm=0;
$('ps-del').addEventListener('click',function(){var P=proj();if(!P)return;
  if(Date.now()-delArm>4000){delArm=Date.now();$('ps-msg').textContent='Paina uudelleen poistaaksesi puun ”'+P.name+'” ja sen säännöt. Muistiinpanot säilyvät.';return;}
  delArm=0;data.projects=data.projects.filter(function(Q){return Q!==P;});data.cur=data.projects.length?data.projects[0].id:null;touch();renderHead();renderProjSheet();render();});
$('ps-close').addEventListener('click',function(){closeSheet($('psheet'));});
/* 1.86: esikatseltu asu palaa laitteen mukaiseksi, kun ikkuna suljetaan */
$('psheet').addEventListener('close',function(){if(kEdit){kEdit=null;applyCfg();}});
/* Projektin vienti ja lisäys (1.24): lisäys ei korvaa mitään, saman niminen saa perään (2). */
function addProjects(o){var L=projectsFromFile(o,todayIso());if(!L)return 0;stashK();var first=null;
  L.forEach(function(st){var base=st.name,nm=base,i=1;while(data.K.some(function(k){return k.name===nm;}))nm=base+' ('+(++i)+')';st.name=nm.slice(0,80);st.id=uid('k');st.mod=nowIso();st.chg=todayIso();data.K.push(st);if(!first)first=st;});
  loadK(first);resetDraft();ed=null;termCache=null;noteFilter=[];touch();renderHead();renderProjSheet();render();return L.length;}
function projTxt(){stashK();return JSON.stringify(projectFile(kOf(),nowIso()),null,1);}
function slug(t){return clean(t).toLowerCase().replace(/[^a-z0-9åäö]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'projekti';}
function addK(){var n=clean($('pk-new').value);if(!n)return;stashK();var k=newK(n);data.K.push(k);loadK(k);applyCfg();$('pk-new').value='';resetDraft();ed=null;termCache=null;noteFilter=[];touch();renderHead();renderProjSheet();render();$('pk-msg').textContent='Projekti ”'+k.name+'” luotu ja avattu. Puu valitaan ja luodaan Päätöspuun Puu ⌄ -napista.';}
$('pk-add').addEventListener('click',addK);$('pk-new').addEventListener('keydown',function(ev){if(ev.key==='Enter')addK();});
/* Kalenterin päivät ja näkyvä aika projektikohtaisesti (Emil 23.10.2026, 1.54): vain alku ja loppu, ei taukoja */
function renderCalv(){var v=data.calv||{s:0,e:1440,off:[]},box=$('pk-days');box.textContent='';
  [1,2,3,4,5,6,0].forEach(function(wd){var on=v.off.indexOf(wd)<0,b=button(box,WDS[wd],'chip',function(){var off=v.off.slice(),i=off.indexOf(wd);if(i<0)off.push(wd);else off.splice(i,1);if(off.length>6)return;setCalv({s:v.s,e:v.e,off:off});});b.dataset.wd=wd;b.setAttribute('aria-pressed',on?'true':'false');});
  [['pk-cs',0,23,v.s],['pk-ce',1,24,v.e]].forEach(function(a){var sel=$(a[0]);sel.textContent='';for(var h=a[1];h<=a[2];h++){var o=el('option','',h+'.00');o.value=h*60;sel.appendChild(o);}sel.value=String(a[3]);});}
function setCalv(c){data.calv=calvOf(c);touch();calTop=null;renderCalv();render();}
$('pk-cs').addEventListener('change',function(){var v=data.calv||{s:0,e:1440,off:[]},a=+this.value;setCalv({s:a,e:Math.max(v.e,a+60),off:v.off});});
$('pk-ce').addEventListener('change',function(){var v=data.calv||{s:0,e:1440,off:[]},b=+this.value;setCalv({s:Math.min(v.s,b-60),e:b,off:v.off});});
$('pk-name').addEventListener('change',function(){var k=kOf(),n=clean($('pk-name').value);if(k&&n){k.name=n.slice(0,80);touch();renderHead();renderProjSheet();render();}});
var kDelArm=0;
$('pk-del').addEventListener('click',function(){var k=kOf();if(!k||data.K.length<2)return;
  if(Date.now()-kDelArm>4000){kDelArm=Date.now();$('pk-mmsg').textContent='Paina uudelleen poistaaksesi projektin ”'+k.name+'”: sen puut, muistiinpanot ja asiasanat poistuvat. Ota varmuuskopio ensin.';return;}
  kDelArm=0;data.K=data.K.filter(function(x){return x!==k;});loadK(data.K[0]);resetDraft();ed=null;termCache=null;touch();renderHead();renderProjSheet();render();});

/* ---- tekstikenttä ---- */
var xsPrev='';
function openText(){var P=proj();if(!P)return;$('xs-text').value=xsPrev=P.text;$('xs-msg').textContent='';openSheet($('xsheet'));paintCode();}
/* Värit rivityypin mukaan. Kirjoitettava rivi värittyy vasta, kun kursorin edessä on välilyönti (sana valmis). */
function paintCode(ta,hl){if(!ta||!ta.nodeType){ta=$('xs-text');hl=$('xs-hl');}var txt=ta.value,cur=ta.selectionStart,pos=0,seen={},ls=txt.split('\n'),lk=lineKinds(txt);hl.textContent='';
  ls.forEach(function(line,i){var end=pos+line.length,k='',typing=cur>pos&&cur<=end&&/\S/.test(txt.charAt(cur-1));
    if(lk[i].k&&lk[i].k!=='c'&&!typing){var hk=lk[i].k==='xh'||lk[i].k==='rh',cls='k-'+lk[i].k+((!hk&&!(lk[i+1]&&lk[i+1].b===lk[i].b))?(lk[i].b&&lk[i].b.rule?' k-re':' k-xe'):'');
      var sx=el('span',cls,line);if(!hk)sx.appendChild(el('i','eol'));hl.appendChild(sx);if(i<ls.length-1)hl.appendChild(document.createTextNode('\n'));pos=end+1;return;}
    if(!typing){var t=line.trim();
      if(t.slice(0,2)==='//')k='c';else if(!lk[i].k){var p=parseLine(line);if(p){var id=keyOf(p.name);if(id&&id!==ALKU){k=seen[id]?'w':p.k;seen[id]=1;}}}}
    if(k&&k!=='b'){var sp=el('span','k-'+k);if(k==='t'||k==='q'){line.split(/(\s\/\/\s)/).forEach(function(part,j){if(j%2)sp.appendChild(el('span','k-c',part));else sp.appendChild(document.createTextNode(part));});}else sp.textContent=line;hl.appendChild(sp);}
    else hl.appendChild(document.createTextNode(line));
    if(i<ls.length-1)hl.appendChild(document.createTextNode('\n'));pos=end+1;});
  hl.appendChild(document.createTextNode('\u200b'));hl.scrollTop=ta.scrollTop;}
/* Palikan nimen vaihto kirjoittaessa vie sääntö- ja termilohkojen viittaukset mukana */
$('xs-text').addEventListener('input',function(){var ta=$('xs-text'),v=ta.value,r=renameLive(xsPrev,v);
  if(r){var pre=v.slice(0,ta.selectionStart).split('\n'),ln=pre.length-1,col=pre[ln].length,L=r.split('\n'),pos=0;for(var i=0;i<ln;i++)pos+=L[i].length+1;
    ta.value=r;ta.setSelectionRange(pos+col,pos+col);}
  xsPrev=ta.value;if($('xsheet').classList.contains('dock')){clearTimeout(dockT);dockT=setTimeout(dockApply,300);}});
['input','keyup','click','focus'].forEach(function(ev){$('xs-text').addEventListener(ev,paintCode);});
$('xs-text').addEventListener('scroll',function(){$('xs-hl').scrollTop=$('xs-text').scrollTop;});
$('xs-ok').addEventListener('click',function(){var P=proj();if(!P)return;P.text=$('xs-text').value;rulesFromText(P);var pt=parseText(P.text),o=orphans(P);touch();
  var m=pt.items.length+' riviä luettu.';if(pt.warnings.length)m+=' '+pt.warnings.join(' ');if(o.length)m+=' Säännöt viittaavat nimiin, joita ei enää ole: '+o.join(', ')+'.';
  closeSheet($('xsheet'));render();if(pt.warnings.length||o.length)setInfo(m,false,true);});
function copy(txt,b,ta,status){function report(message){(status||b).textContent=message;}
  function sel(){if(ta){ta.focus();ta.select();}report('Valittu, kopioi');}
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){report('Kopioitu');},sel);else sel();}catch(e){sel();}}

/* ---- käyttö ---- */
var draft={p:[],d:[]};
function resetDraft(){draft={p:[],d:[]};}
function renderUse(){var p=panels.use,P=proj();p.textContent='';
  if(!P){firstProjForm(p);return;}
  var pt=parseText(P.text);
  var tbr=treeBar(p);
  if(!pt.items.length){p.appendChild(subI('Puu ”'+P.name+'” on tyhjä.','Sisältö kirjoitetaan tekstikenttään: yksi rivi on yksi nappula.'));
    button(p,'Kirjoita puun sisältö','btn solid',function(){showTab('teach');if(!wide())openText();}).id='writetree';return;}
  var S=P.session,idle=!S;
  /* Kierros alkaa ensimmäisestä napautuksesta (Emil 23.10.2026, 1.50): alkuaskel näkyy heti, valinta tai Jatka aloittaa kierroksen.
     Päivä valitaan ennen sitä Puu-napin vieressä olevasta Päivä-napista; sen muistiinpanot tulevat valmiiksi mukaan. */
  if(idle){if(!ghost||ghost.pid!==P.id||ghost.text!==P.text)ghost=mkGhost(P,ghost&&ghost.pid===P.id?ghost.date:'');S=ghost.s;
    var dl=el('label','treepick daypick');dl.id='daypick';dl.appendChild(el('small','','Päivä'));if(ghost.date)dl.appendChild(el('span','',fiDate(ghost.date)));dl.insertAdjacentHTML('beforeend',CHEV);
    var di=el('input');di.type='date';di.id='startdate';di.dataset.fi='1';di.value=ghost.date;di.setAttribute('aria-label','Päivä, jota kierros koskee (valinnainen)');dl.appendChild(di);
    dl.setAttribute('aria-pressed',ghost.date?'true':'false');tbr.appendChild(dl);
    di.addEventListener('change',function(){ghost=mkGhost(P,di.value);resetDraft();render();});}
  var v=sessionView(P,S,draft),by=v.pt.by;
  if(v.qs.length){var qb=el('div','qbar');qb.id='qbar';v.qs.forEach(function(id){qb.appendChild(el('div','qline',bodyText(by[id].body)));});p.appendChild(qb);}
  if(!idle)setInfo(S.date?'Kierros päivälle '+fiDate(S.date):'Kierros alkoi '+stamp(S.start));
  else if(ghost.c){var c=ghost.c,sp=el('span','',c.notes?'Päivälle '+fiDate(ghost.date)+' on '+c.notes+(c.notes===1?' muistiinpano':' muistiinpanoa')+': mukaan tuli '+c.pre.length+(c.pre.length===1?' valinta tai ryhmä':' valintaa tai ryhmää')+' ja '+c.texts.length+(c.texts.length===1?' ilmoitus.':' ilmoitusta.'):'Päivälle '+fiDate(ghost.date)+' ei ole muistiinpanoja. Päivä tallentuu kierroksen loppuun.');sp.id='startinfo';setInfo(sp);}
  if(S.log.length){var lg=el('div','log');lg.id='log';S.log.forEach(function(id){var it=by[id];if(!it)return;
      if(lg.childNodes.length){var dv=el('div','divider');dv.appendChild(el('i'));lg.appendChild(dv);}lg.appendChild(el('div','tbox',bodyText(it.body)));});p.appendChild(lg);}
  var mem=v.sel.filter(function(x){return by[x]&&v.opts.indexOf(x)<0;});
  if(mem.length){var ch=el('div','chosen');ch.appendChild(el('b','','Muistissa:'));mem.forEach(function(x){ch.appendChild(el('span','',by[x].name));});p.appendChild(ch);}
  if(v.cur){var cm=el('div','curm');cm.id='curm';cm.appendChild(el('h2','',by[v.cur].name));if(by[v.cur].k==='g'&&by[v.cur].body)cm.appendChild(el('p','sub',by[v.cur].body));p.appendChild(cm);}
  var list=el('div','rows');list.id='opts';
  v.opts.forEach(function(id){var on=v.picked.indexOf(id)>=0,why=v.blocked[id],b=el('button','row'+(on?' sel':'')+(why?' dim':''));b.type='button';b.dataset.id=id;
    var t=el('span','t',shownName(by[id].name));if(why)t.appendChild(el('small','','ei käy yhteen: '+by[why].name));b.appendChild(t);
    if(why)b.setAttribute('aria-disabled','true');if(on&&v.sel.indexOf(id)>=0)b.appendChild(el('span','tag','valittu aiemmin'));
    b.addEventListener('click',function(){if(why)return;var S1=idle?goLive(P):P.session;draft=tapDraft(P,S1,draft,id);
      /* Ensimmäisen askeleen valinnan purku ilman päivää palauttaa alkutilaan ilman kierrosta */
      if(S1.steps.length<2&&!S1.date&&!draft.p.length&&!draft.d.length){P.session=null;ghost=null;}
      if(idle||!P.session)touch();var y=main.scrollTop;anim(function(){renderUse();main.scrollTop=y;});});list.appendChild(b);});
  if(v.opts.length)p.appendChild(list);
  else p.appendChild(el('p','msg','Ei enempää vaihtoehtoja. Lopeta kierros, niin se tallentuu muistiinpanoksi.'));
  $('actbar').hidden=false;$('act-go').disabled=!v.picked.length&&!v.cur;$('act-back').disabled=S.steps.length<2;}
var ghost=null;
function mkGhost(P,day){var c=day?dayCarry(P,data.notes,allTerms(),day):null;if(c)c.date=day;return {pid:P.id,text:P.text,date:day||'',c:c,s:newSession(P,nowIso(),c)};}
function goLive(P){if(!P.session&&ghost&&ghost.pid===P.id){P.session=ghost.s;P.session.start=nowIso();ghost=null;}return P.session;}
$('act-go').addEventListener('click',function(){var P=proj();if(!P)return;var S=P.session||(ghost&&ghost.pid===P.id?ghost.s:null);if(!S)return;
  if(commitStep(P,S,draft)){goLive(P);resetDraft();touch();anim(renderUse);main.scrollTop=0;}});
$('act-back').addEventListener('click',function(){var P=proj();if(!P||!P.session)return;var d=undoStep(P.session);if(d){draft=d;touch();anim(renderUse);}});
$('act-end').addEventListener('click',function(){var P=proj();if(P)goLive(P);$('es-date').value=(P&&P.session&&P.session.date)||'';$('es-note').value='';renderHoid(P);openSheet($('esheet'));});
function renderHoid(P){var box=$('es-hoid');box.textContent='';box.hidden=!(P&&P.session&&P.end==='hoid');if(box.hidden)return;
  var by=parseText(P.text).by,ho=hoidettavat(P,P.session);
  if(!ho.length){box.appendChild(el('p','sub','Kaikki on kunnossa: hoidettavaa ei jäänyt.'));return;}
  box.appendChild(el('h3','','Hoidettavat'));var ol=el('ol','hlist');ol.id='hlist';
  ho.forEach(function(h,i){var li=el('li',i?'':'next',(i?(i+1)+'. ':'Seuraavaksi: ')+by[h.id].name);if(h.jotta.length)li.appendChild(el('small','','jotta '+h.jotta.map(function(x){return by[x].name;}).join(', ')));ol.appendChild(li);});
  box.appendChild(ol);}
$('es-save').addEventListener('click',function(){var P=proj();if(!P||!P.session)return;var t=nowIso();
  data.notes.unshift({id:uid('n'),created:t,edited:t,text:sessionNote(P,P.session,$('es-note').value),date:$('es-date').value||''});
  P.session=null;resetDraft();touch();closeSheet($('esheet'));render();setInfo('Kierros tallentui muistiinpanoksi.');});
var dropArm=0;
$('es-drop').addEventListener('click',function(){var P=proj();if(!P)return;if(Date.now()-dropArm>4000){dropArm=Date.now();$('es-drop').textContent='Varmasti? Paina uudelleen';return;}
  dropArm=0;$('es-drop').textContent='Lopeta tallentamatta';P.session=null;resetDraft();touch();closeSheet($('esheet'));render();});

/* ---- opetus ----
   Rakenna: napauta lähdettä kerran = valitse mitä se tuo näkyviin, toisen kerran = mitä se sulkee pois,
   kolmannen = ehdot eli mistä se itse tulee näkyviin (yksi riittää / kaikki tarvitaan), neljännen = valmis.
   Ilmoitus ja apukysymys menevät suoraan ehtoihin, koska ne eivät avaa mitään.
   Muokkaa: napauta riviä ja muokkaa sen tekstiä. Toisensa poissulkevat: ryhmittely, joka pätee vain saman askeleen valinnoissa. */
var ed=null,teachMode='build',mxSel=null,ordSel=null;
function kindTag(k){return {g:'ryhmä',t:'ilmoitus',q:'apukysymys'}[k]||'';}
function kindCls(k){return {a:' alku',g:' grp',t:' txt',q:' qq'}[k]||'';}
function nameSpan(it){return el('span','t',it.k==='b'?shownName(it.name):it.name);}
function renderTeach(){var p=panels.teach,P=proj();p.textContent='';
  if(!P){firstProjForm(p);return;}
  treeBar(p);
  var pt=parseText(P.text),by=pt.by;if(ed&&ed.id!==ALKU&&!by[ed.id])ed=null;
  var seg=el('div','seg');seg.id='tmode';[['build','Säännöt'],['edit','Muokkaa'],['ord','Järjestys'],['mx','Poissulkevat']].forEach(function(m){var b=button(seg,m[1],'',function(){teachMode=m[0];ed=null;mxSel=null;ordSel=null;render();});b.className='';b.setAttribute('aria-pressed',teachMode===m[0]?'true':'false');b.dataset.tm=m[0];});
  /* Yksi työkalurivi (1.50): tilan valinta, ja muokkauksen aikana sen paikalla muokattava, ehtotila ja Valmis. Rivi on aina saman korkuinen. */
  var row=el('div','tbar');row.id='tbar';p.appendChild(row);
  var editing=(ed&&teachMode==='build')||(ordSel&&teachMode==='ord');if(!editing)row.appendChild(seg);
  var o=orphans(P);if(o.length){var c=el('div','card');c.appendChild(el('b','','Säännöt ilman riviä'));c.appendChild(el('p','','Säännöt viittaavat nimiin, joita tekstikentässä ei enää ole: '+o.join(', ')+'. Jos nimi muuttui tekstikentässä, säännöt eivät seuranneet. Palauta nimi tai poista säännöt.'));
    var r2=el('div','btnrow');button(r2,'Poista nämä säännöt','mini',function(){dropOrphans(P);touch();render();});c.appendChild(r2);p.appendChild(c);}
  if(!pt.items.length){p.appendChild(subI('Puu on tyhjä.','Kirjoita sisältö tekstikenttään.'));return;}
  if(editing){var eid=teachMode==='ord'?ordSel:ed.id,ei=eid===ALKU?{name:'Alku'}:by[eid];row.appendChild(el('span','tstate',ei?ei.name:''));
    if(!(ed&&ed.m==='c'&&teachMode==='build')){var dn=button(row,'Valmis','mini',function(){endEd();ordSel=null;render();});dn.id='ed-done';}}
  if(teachMode==='edit')return renderEdit(p,P,pt);
  if(teachMode==='mx')return renderMx(p,P,pt);
  if(teachMode==='ord')return renderOrd(p,P,pt);
  if(ed&&ed.m==='c'){var cs=el('div','seg cseg');cs.id='needmode';[[false,'Yksi riittää'],[true,'Kaikki tarvitaan']].forEach(function(m){var b=button(cs,m[1],'',function(){setNeedMode(P,pt,ed.id,m[0]);ed.all=m[0];touch();var y=main.scrollTop;render();main.scrollTop=y;});b.className='';b.dataset.need=m[0]?'all':'one';b.setAttribute('aria-pressed',ed.all===m[0]?'true':'false');});row.appendChild(cs);}
  var list=el('div','rows');list.id='tlist';
  var nodes=[{id:ALKU,k:'a',name:'Alku'}].concat(pt.items);
  nodes.forEach(function(it){var cls='row'+kindCls(it.k),st='',tag='';
    if(ed){if(it.id===ed.id){cls+=' ed'+(ed.m==='x'?' edx':ed.m==='c'?' edc':'');tag=ed.m==='x'?'sulkee pois…':ed.m==='c'?(ed.all?'tulee, kun kaikki…':'tulee, kun jokin…'):'tuo näkyviin…';}
      else if(ed.m==='c'){if(ed.all?needOf(P,ed.id).indexOf(it.id)>=0:ruleState(P,it.id,ed.id)==='o'){cls+=' rc';tag=ed.all?'ehto':'tuo tämän';}}
      else{st=ruleState(P,ed.id,it.id);if(st==='o'){cls+=' ro';tag='tuo näkyviin';}else if(st==='x'){cls+=' rx';tag='sulkee pois';}}}
    else{var r=rl(P,it.id),parts=[];if(it.k!=='t'&&it.k!=='q'){var on=it.id===ALKU?opensOf(P,pt.items,ALKU).length:r.o.length;if(on)parts.push('tuo '+on+(it.id===ALKU&&!r.o.length?' (opettamatta: kaikki, joita mikään ei tuo)':''));if(r.x.length)parts.push('sulkee '+r.x.length);}
      var nn=needOf(P,it.id).length;if(nn)parts.push('ehdot: kaikki '+nn);tag=parts.join(' · ');}
    var b=el('button',cls);b.type='button';b.dataset.id=it.id;var t=nameSpan(it);var kt=kindTag(it.k);if(kt)t.appendChild(el('small','',kt));b.appendChild(t);if(tag)b.appendChild(el('span','tag',tag));
    b.addEventListener('click',function(){teachTap(P,it);});list.appendChild(b);});
  p.appendChild(list);}
function endEd(){var P=proj();if(ed&&P&&P.need&&P.need[ed.id]&&!P.need[ed.id].length){delete P.need[ed.id];touch();}ed=null;}
$('info-done').addEventListener('click',function(){endEd();render();});
function hasNeed(P,id){return !!(P.need&&P.need[id]);}
function teachTap(P,it){
  if(!ed){ed=(it.k==='t'||it.k==='q')?{id:it.id,m:'c',all:hasNeed(P,it.id)}:{id:it.id,m:'o'};}
  else if(it.id===ed.id){if(ed.m==='o'&&it.id!==ALKU)ed.m='x';else if(ed.m==='x'){ed.m='c';ed.all=hasNeed(P,ed.id);}else endEd();}
  else if(it.id===ALKU){if(ed.m==='c'&&!ed.all){toggleRule(P,ALKU,ed.id,'o');touch();var y0=main.scrollTop;render();main.scrollTop=y0;}return;}
  else if(ed.m==='c'){if(it.k!=='b'&&(ed.all||it.k!=='g')){setInfo(ed.all?'Kaikki tarvitaan -ehdoiksi käyvät nappulat, koska vain ne valitaan kierroksella.':'Syyksi käyvät nappulat ja ryhmät.');return;}
    if(ed.all){var cy=needOf(P,ed.id).indexOf(it.id)<0?cycleIf(P,it.id,ed.id):null;if(cy){refuse(it.id,cy,pt0(P));return;}toggleNeed(P,ed.id,it.id);}else toggleRule(P,it.id,ed.id,'o');touch();}
  else{toggleRule(P,ed.id,it.id,ed.m);touch();}
  var y=main.scrollTop;render();main.scrollTop=y;}
function renderEdit(p,P,pt){
  var r=el('div','addrow'),i=el('input');i.type='text';i.id='newline';i.placeholder='Uusi rivi';i.autocomplete='off';r.appendChild(i);
  function add(){var l=parseLine(i.value);if(!l)return;var P2=proj();if(parseText(P2.text).by[keyOf(l.name)]){setInfo('Nimi ”'+l.name+'” on jo käytössä.');return;}
    P2.text=(P2.text.replace(/\s+$/,'')+(P2.text.trim()?'\n':'')+i.value.trim());touch();render();var n=$('newline');if(n)n.focus();}
  button(r,'Lisää','btn solid',add);i.addEventListener('keydown',function(ev){if(ev.key==='Enter')add();});p.appendChild(r);
  var list=el('div','rows');list.style.marginTop='12px';
  pt.items.forEach(function(it,k){var row=el('div','orow'),b=el('button','row'+kindCls(it.k));b.type='button';b.dataset.id=it.id;var t=nameSpan(it);
    if(it.body&&it.body!==it.name)t.appendChild(el('small','body',bodyText(it.body)));var kt=kindTag(it.k);b.appendChild(t);if(kt)b.appendChild(el('span','tag',kt));
    b.addEventListener('click',function(){openLine(it);});row.appendChild(b);
    [[-1,'↑','Siirrä ylös'],[1,'↓','Siirrä alas']].forEach(function(d){var m=button(row,d[1],'mv',function(){var P2=proj();P2.text=moveItem(P2.text,it.id,d[0]);touch();var y=main.scrollTop;render();main.scrollTop=y;});
      m.setAttribute('aria-label',d[2]+': '+it.name);m.dataset.move=it.id+'|'+d[0];if((d[0]<0&&k===0)||(d[0]>0&&k===pt.items.length-1))m.disabled=true;});
    list.appendChild(row);});
  p.appendChild(list);}
var lineIt=null,lineArm=0;
function openLine(it){lineIt=it;lineArm=0;$('ls-text').value=lineOf(it);$('ls-msg').textContent='';openSheet($('lsheet'));}
$('ls-ok').addEventListener('click',function(){var P=proj();if(!P||!lineIt)return;var raw=$('ls-text').value.replace(/\s*\n\s*/g,' ').trim(),l=parseLine(raw);
  if(!l){removeKey(P,lineIt.id);P.text=replaceLine(P.text,lineIt.line,null);touch();closeSheet($('lsheet'));render();return;}
  var nk=keyOf(l.name),pt=parseText(P.text);if(nk!==lineIt.id&&pt.by[nk]){$('ls-msg').textContent='Nimi ”'+l.name+'” on jo käytössä.';return;}
  P.text=replaceLine(P.text,lineIt.line,raw);if(nk!==lineIt.id){P.text=renameInText(P.text,lineIt.id,l.name);rulesFromText(P);}touch();closeSheet($('lsheet'));render();});

function pt0(P){return parseText(P.text);}
/* Ristiriitainen napautus hylätään: nappi värähtää ja ilmoitus näyttää ketjun */
function refuse(id,cy,pt){var nm=function(x){return pt.by[x]?pt.by[x].name:x;};setInfo('Ei käy, tulisi kehä: '+cy.map(nm).join(' → ')+'. Poista ensin jokin ketjun suhteista.',false,true);
  var b=document.querySelector('#tlist [data-id="'+(window.CSS&&CSS.escape?CSS.escape(id):id)+'"]');if(b){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');}}
/* Järjestys (Emil 21.10.2026): tähti merkitsee tärkeäksi, tärkeät ovat ensin ja niitä raahataan pitkällä painalluksella.
   Rivin napautus: ennen-sääntö (tämä on tärkeämpi kuin napautetut). Kaikki palikat näkyvät, myös ryhmät. */
function renderOrd(p,P,pt){var by=pt.by,ids=pt.items.map(function(it){return it.id;}),imp=(P.imp||[]).filter(function(x){return by[x];});
  if(ordSel&&!by[ordSel])ordSel=null;
  function star(it,on){var b=el('button','sbtn');b.innerHTML=starSvg(on);b.type='button';b.dataset.star=it.id;b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',(on?'Poista tärkeistä: ':'Merkitse tärkeäksi: ')+it.name);
    b.addEventListener('click',function(){var y=main.scrollTop;P.imp=on?imp.filter(function(x){return x!==it.id;}):imp.concat([it.id]);syncImp('a:'+it.id,!on);touch();render();main.scrollTop=y;});return b;}
  function rowOf(it,k,on){var d=el('div','drow');d.dataset.id=it.id;if(on)d.appendChild(el('span','num',(k+1)+'.'));var cls='row'+kindCls(it.k),tag='';
    if(ordSel){if(it.id===ordSel){cls+=' ed';tag='tärkeämpi kuin…';}else if(orderOf(P,ordSel).indexOf(it.id)>=0){cls+=' ro';tag='vähemmän tärkeä';}else if(orderOf(P,it.id).indexOf(ordSel)>=0)tag='tärkeämpi';}
    else{var n=orderOf(P,it.id).length;if(n)tag='ennen '+n;}
    var b=el('button',cls);b.type='button';b.dataset.id=it.id;var t=nameSpan(it),kt=kindTag(it.k);if(kt)t.appendChild(el('small','',kt));b.appendChild(t);if(tag)b.appendChild(el('span','tag',tag));
    b.addEventListener('click',function(){if(!ordSel)ordSel=it.id;else if(it.id===ordSel)ordSel=null;else{var cy=toggleOrder(P,ordSel,it.id);if(cy){refuse(it.id,cy,pt);return;}touch();}
      var y=main.scrollTop;render();main.scrollTop=y;});d.appendChild(b);d.appendChild(star(it,on));return d;}
  if(imp.length){p.appendChild(el('h3','','Tärkeät'));var il=el('div','rows');il.id='ordimp';imp.forEach(function(x,k){il.appendChild(rowOf(by[x],k,true));});p.appendChild(il);
    dragList(il,function(i,j){P.imp=moveToIdx(imp,imp[i],j);touch();var y=main.scrollTop;render();main.scrollTop=y;});}
  var rest=priorityList(P,pt,ids.filter(function(x){return imp.indexOf(x)<0;}));
  p.appendChild(el('h3','',imp.length?'Muut, järjestyksessä':'Järjestys nyt'));var list=el('div','rows');list.id='tlist';
  rest.forEach(function(x,k){list.appendChild(rowOf(by[x],k,false));});p.appendChild(list);}
function renderMx(p,P,pt){var by=pt.by;
  if(!mxSel){
    (P.mx||[]).forEach(function(set,i){var c=el('div','mxcard');c.appendChild(el('span','',set.map(function(x){return by[x]?by[x].name:x+' (puuttuu)';}).join(' · ')));
      button(c,'Poista','mini',function(){P.mx.splice(i,1);touch();render();});p.appendChild(c);c.style.marginBottom='8px';});
    if(!(P.mx||[]).length)p.appendChild(el('p','sub','Ei vielä ryhmittelyjä.'));
    button(p,'+ Uusi ryhmittely','btn solid',function(){mxSel=[];render();}).id='mxnew';return;}
  var list=el('div','rows');pt.items.filter(function(it){return it.k==='b';}).forEach(function(it){var on=mxSel.indexOf(it.id)>=0,b=el('button','row'+(on?' mxp':''));b.type='button';b.dataset.id=it.id;
    b.appendChild(el('span','t',it.name));b.addEventListener('click',function(){var i=mxSel.indexOf(it.id);if(i>=0)mxSel.splice(i,1);else mxSel.push(it.id);var y=main.scrollTop;render();main.scrollTop=y;});list.appendChild(b);});
  p.appendChild(list);var r=el('div','btnrow');
  button(r,'Tallenna','btn solid',function(){if(mxSel.length>1){if(!P.mx)P.mx=[];P.mx.push(mxSel.slice());touch();}mxSel=null;render();}).id='mxsave';
  button(r,'Peru','btn',function(){mxSel=null;render();});p.appendChild(r);}

/* ---- muistiinpanot ---- */
var SORTO=['next','new','prio'],SORTN={next:'Tulevat',new:'Uusimmat',prio:'Tärkeys',own:'Oma järjestys'};
var noteSort='next',noteFilter=[],noteAnd=false,noteQuery='',noteCur=null,noteArm=0,noteView='open';
var noteSortExplicit=false;
try{var oldSort=localStorage.getItem('kaikki:oma-jarjestys');noteSortExplicit=oldSort!==null;if(oldSort==='1')noteSort='own';}catch(e){}
/* 1.80: projektikohtainen tunnistus (asetus tun: pois = muistiinpanon tekstistä ei tunnisteta asiasanoja) ja päättely ehdoista */
function tunOn(){return (data.cfg||{}).tun!=='off';}
/* 1.102: sanalinkkien indeksi välimuistissa; lasketaan uudelleen, kun muistiinpanot tai asetukset muuttuvat */
var wlC=null;
function wlNow(){var c=data.cfg||{},len=0,ar=0;data.notes.forEach(function(n){len+=(n.text||'').length;if(n.arch)ar++;});var sig=data.notes.length+':'+len+':'+ar+':'+[c.wl,c.wlk,c.wlno,c.wlyes].join('|');
  if(!wlC||wlC.sig!==sig||wlC.notes!==data.notes){var O=wlOpt(c);wlC={sig:sig,notes:data.notes,O:O,I:wlIndex(data.notes,O)};}return wlC;}
function wlText(txt){if(!wlEnabled(data.cfg))return [];var W=wlNow();return wlHits(txt,W.I,W.O,noteCur?noteCur.id:null);}
function grpAll(){var G={},AT=null;(data.grp||[]).forEach(function(g){G[g.id]={m:g.m.filter(function(id){return !isSpec(id);}),all:g.all?1:0};});return G;}
function nInf(AT,text,N,today){if(!tunOn())return {ids:[],inf:[]};var SP=sepParts(text);
  /* 1.91: päättely teksti kerrallaan, tulokset yhteen */
  if(SP){var I=[],F=[];SP.forEach(function(p,i){var r=nInf(AT,p.t,N?partNote(N.text===text?N:{id:N.id,created:N.created,text:text,pts:N.pts,nl:N.nl,rel:N.rel,bt:N.bt,rg:N.rg},i):null,today);
      r.ids.forEach(function(id){if(I.indexOf(id)<0)I.push(id);});r.inf.forEach(function(id){if(F.indexOf(id)<0)F.push(id);});});
    return {ids:I,inf:F.filter(function(id){return I.indexOf(id)<0;})};}
  var ids=noteTerms(AT,text);if(!(data.ehdot||[]).length)return {ids:ids,inf:[]};
  var inf=inferTerms(data.ehdot,ids,text,{grp:grpAll(),tt:N?timeTermOf(N,today||todayIso()):null,tw:N?wdKeys(N,today||todayIso()):[]}).filter(function(id){return AT.some(function(t){return t.id===id;});});return {ids:ids,inf:inf};}
function allTerms(){
  var terms=withText(data.terms,data.projects).concat(autoTerms(data.projects,data.words,data.terms));
  if(data.notes.some(function(note){return note.rep==='rx';})&&!terms.some(function(term){return term.name===SYS_TERM;})){
    terms.push({id:'kaikki-local-rx',name:SYS_TERM,yes:[],no:[]});
  }
  return terms;
}
var termCache=null;
function termName(id){var l=termCache||allTerms();for(var i=0;i<l.length;i++)if(l[i].id===id)return l[i].name;return '';}
/* Muistiinpanon teksti kortissa: muuttuneet suhteelliset sanat katkoviivalla, alkuperäinen vihjeenä */
/* 1.56: kuitattu päivä (pts) yliviivattuna myös korteissa, kuten muistiinpanon tekstissä */
/* Kaikki 0.6: kortin teksti lyhennetään (lim merkkiä) ja tyhjät rivit tiivistetään, jotta pitkät vaultin tekstit eivät hidasta listaa */
var CARDLEN=360;function cardCut(t,lim){t=String(t||'').replace(/\n[ \t]*(?:\n[ \t]*)+/g,'\n');return lim&&t.length>lim?t.slice(0,lim):t;}
function relText(n,cls,lim){var d=el('div',cls||'nt'),txt=String(n.text||''),at=0,dn=((n.pts&&Object.keys(n.pts).length)||noteDates(n).some(function(o){return recEnded(o,todayIso());}));if(!(n.rel&&n.rel.length)&&!n.mv&&!dn){var pt=n.vp?VAULT.plainText(lim?txt.slice(0,lim*3):txt,vTitleOf):txt;d.textContent=lim?cardCut(pt,lim):pt;return d;}
  var L=n.rel&&n.rel.length?relMatch(n,relSpans(txt,parseDates(txt,new Date(n.created||Date.now())),true)).filter(function(m){return m.lock.w!==m.lock.o;}).map(function(m){return {s:m.sp.s,e:m.sp.e,t:'Kirjoitettu ”'+m.lock.o+'”'};}):[];
  mvSpans(n).forEach(function(m){L.push({s:m.s,e:m.e,t:mvLines(m.m).join('\n')});});
  if(dn)noteDates(n).forEach(function(o){if(o.s===undefined||!struck(n,o))return;var key=dateKey(o,n),w=whenSpan(o);L.push({s:w.s,e:Math.min(w.e,txt.length),c:'dn',t:key?'Kuitattu '+occLabel(key):'Päättynyt '+fiDate(o.R[1])});});
  var T=function(a,b){var x=txt.slice(a,b);return lim?cardCut(x):x;};if(lim&&txt.length>lim){txt=txt.slice(0,lim);L=L.filter(function(m){return m.e<=lim;});}
  L.sort(function(a,b){return a.s-b.s;}).forEach(function(m){if(m.s<at)return;
    d.appendChild(document.createTextNode(T(at,m.s)));var sp=el('span',m.c||'rel',txt.slice(m.s,m.e));sp.title=m.t;d.appendChild(sp);at=m.e;});
  d.appendChild(document.createTextNode(T(at)));return d;}
function renderNotes(){if(nbObs){nbObs.disconnect();nbObs=null;}if(nvTagObserver){nvTagObserver.disconnect();nvTagObserver=null;}var p=panels.notes,previous=$('nlist');
  var editorFocus=nvInline&&p.contains(nvInline.form)&&nvInline.form.contains(document.activeElement)?document.activeElement:null;
  var headFocus=previous&&previous.contains(document.activeElement)&&document.activeElement.closest('.rvhead .rvc,.rvsum .rvc');
  if(headFocus&&!nvFocusHead)nvFocusHead={key:headFocus.classList.contains('rv-add')?'+':(headFocus.closest('.rvsum')?'sum:':'')+headFocus.dataset.k,until:Date.now()+1000};
  var scroll=previous&&previous.classList.contains('rv-scroll')&&[previous.dataset.view,previous.scrollLeft,previous.scrollTop];
  p.textContent='';var today=todayIso();
  /* Kaikki 0.6 (Emil 22.11.2026): vaultin muistiinpanot ovat pysyviä, joten Muistiossa ei ole Avoimet/Kuitatut-jakoa; kuittaus kuuluu kalenterin päivälle */
  if(noteView==='done')noteView='open';p.classList.toggle('rows-wide',nvRows());p.classList.toggle('notes-wide',noteView==='open');var NS=data.notes.filter(function(n){return !n.arch;});
  var cn=$('count');cn.hidden=true;/* 1.71 (Emil): määrä ei kuulu yläpalkin tasolle */cn.textContent=NS.length+' kpl';cn.setAttribute('aria-label',NS.length+(NS.length===1?' muistiinpano':' muistiinpanoa'));
  var nb=el('div','nbar');nb.id='nbar';p.appendChild(nb);if(!nvRows())nbWatch(nb);
  if(noteView!=='chk'){var vs=el('div','seg');vs.id='noteview';[['open','Muistiinpanot','Kaikki'],['rep','Toistuvat','Toistuvat']].forEach(function(m){var b=button(vs,'','',function(){activeScroller().scrollTop=0;main.scrollTop=0;noteView=m[0];render();});b.appendChild(el('span','lg',m[1]));b.appendChild(el('span','sh',m[2]));b.setAttribute('aria-label',m[1]);b.className='';b.dataset.nv=m[0];b.setAttribute('aria-pressed',noteView===m[0]?'true':'false');
    /* Listan pallero (1.40) on 1.66:sta alkaen alapalkin Listat-napissa (syncChrome) */});nb.appendChild(vs);}
  if(noteView!=='open'||(noteSelectionMode&&noteSelectionProject!==data.k))noteSelectionReset();
  if(noteView==='rep'){cn.textContent=data.reps.length+' kpl';renderReps(p);noteFab(p);return;}if(noteView==='chk'){cn.textContent=listRows().length+' kpl';renderChk(p);noteFab(p);return;}
  var V=nvCur(),locked=viewLocked(noteViewPath(V));if(locked&&noteSelectionMode)noteSelectionReset();
  var AT=termCache=allTerms(),hits={},nt={},ni={};NS.forEach(function(n){var R=nInf(AT,n.text,n,today);nt[n.id]=R.ids.concat(R.inf);ni[n.id]=R.inf;nt[n.id].forEach(function(id){hits[id]=1;});});
  var tagNames=new Set();
  NS.forEach(function(n){
    noteTags(n).forEach(function(tag){tagNames.add(tag);nt[n.id].push('tag:'+tag);});
  });
  var tags=Array.from(tagNames).sort(function(a,b){return a.localeCompare(b,'fi');}).map(function(tag){
    return {id:'tag:'+tag,name:'#'+tag,tag:true};
  });
  var facets=AT.concat(tags);
  var facetIds=new Set(facets.map(function(t){return t.id;}));
  noteFilter=noteFilter.filter(function(id){return facetIds.has(id);});
  var shownT=AT.filter(function(t){return !t.auto||hits[t.id]||noteFilter.indexOf(t.id)>=0;}).concat(tags);
  /* Suodatus usealla asiasanalla omassa ikkunassa (Emil 22.10.2026): valintanappi samassa paikassa ja tyylissä kuin Päätöspuun Puu ⌄ ja Rakenna */
  var tb=el('div','treebar'),fb=button(tb,'','treepick',function(){fsCtx={NS:NS,T:shownT,nt:nt};renderFilter();openSheet($('fsheet'));});fb.id='filterpick';if($('fsheet').open)fsCtx={NS:NS,T:shownT,nt:nt};fb.setAttribute('aria-label','Suodata asiasanoilla ja tunnisteilla');
  fb.appendChild(el('small','','Asiasanat'));fb.appendChild(el('span','',filterLabel(facets)));fb.insertAdjacentHTML('beforeend',CHEV);fb.setAttribute('aria-pressed',noteFilter.length?'true':'false');
  /* Järjestys yhtenä nappina suodattimen vieressä (1.50): napautus kiertää Tulevat → Uusimmat → Tärkeys */
  var sort=noteBaseSort(V);
  var sb=button(tb,'','treepick',function(){sortMenu(this);});sb.id='notesort';sb.disabled=locked;sb.dataset.ns=sort;sb.setAttribute('aria-haspopup','menu');
  sb.setAttribute('aria-label','Järjestys: '+SORTN[sort]+'. Napauta vaihtaaksesi.');sb.insertAdjacentHTML('beforeend','<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 3.5v13M3.5 13.5l3 3 3-3M13.5 16.5v-13M10.5 6.5l3-3 3 3"/></svg>');sb.appendChild(el('span','',SORTN[sort]));
  /* 0.3: kenen kirjoittamat (vaultin lahde-kenttä) */
  if(vOn()||srcPre!=='std'){tb.classList.add('hassrc');var srb=button(tb,'','treepick',function(){srcMenu(this);});srb.id='srcpick';srb.setAttribute('aria-haspopup','menu');srb.setAttribute('aria-pressed',srcPre!=='std'?'true':'false');srb.setAttribute('aria-label','Kenen kirjoittamat: '+SRCN[srcPre]);
    srb.insertAdjacentHTML('beforeend','<svg class="srci" viewBox="0 0 20 20" aria-hidden="true"><circle cx="7" cy="7" r="2.6"/><path d="M2.5 16c.4-2.8 2.2-4.3 4.5-4.3s4.1 1.5 4.5 4.3"/><path d="M14.5 4.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>');}/* 0.4: ei tekstiä napissa, jottei yläpalkki muutu valinnan mukana (Emil 22.11.2026) */
  /* 0.10: Kortit / Rivit (laitekohtainen) */var vb=button(tb,'','treepick nvbtn',function(){activeScroller().scrollTop=0;main.scrollTop=0;nvSet(nvRows()?'cards':'rows');render();});vb.id='nviewbtn';vb.setAttribute('aria-pressed',nvRows()?'true':'false');vb.setAttribute('aria-label',nvRows()?'Rivinäkymä, vaihda korteiksi':'Korttinäkymä, vaihda riveiksi');
  vb.innerHTML=nvRows()?'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2"/><path d="M2.5 8h15M2.5 12.3h15M8 3.5v13"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3.5" width="14" height="5.5" rx="1.5"/><rect x="3" y="11" width="14" height="5.5" rx="1.5"/></svg>';
  var q=el('input');q.type='search';q.id='nsearch';q.placeholder='Hae';q.autocomplete='off';q.setAttribute('aria-label','Hae muistiinpanoista sanalla');q.value=noteQuery;tb.appendChild(q);
  q.addEventListener('input',function(){noteQuery=q.value;filterNotes();});nb.appendChild(tb);
  var dates=new Map();
  var l=(sort==='own'?notesInOwnOrder(NS,today,noteViewPath(V)):sort==='prio'?prioSort(NS,rankFn(AT,today),today):sortNotes(NS,sort,today,dates)).filter(function(n){return notePass(nt[n.id])&&nvPass(V,n);});
  var tools=el('div','rvbar');p.appendChild(tools);
  noteViewTools(tools,V,locked);
  if(!locked){var select=button(tools,noteSelectionMode?'Lopeta valinta':'Valitse','mini',function(){
    if(noteSelectionMode)noteSelectionReset();else{noteSelectionMode=true;noteSelectionProject=data.k;}
    render();$('note-select-toggle').focus({preventScroll:true});
  });
  select.id='note-select-toggle';select.setAttribute('aria-pressed',noteSelectionMode?'true':'false');}
  var list=el('div','nlist');list.id='nlist';
  if(nvRows()){list.classList.add('rv-scroll');list.tabIndex=0;list.setAttribute('role','region');list.setAttribute('aria-label','Muistiinpanojen rivit');list.appendChild(tools);rowsInto(list,l,today,dates,V,locked,sort);}else (nvActiveSort(V).length?nvSortList(l,nvActiveSort(V),V,today,Object.assign(formulaContext(),{group:l})):l).forEach(function(n){var kd=n.vp?VAULT.kindOf(n.vp,n.vfm):'oma',c=el('div','ncard'+(n.rep?' auto':'')+(kd!=='oma'?' src-'+(kd==='yhdessa'?'yhdessa':'tekoaly'):''));c.setAttribute('role','button');c.tabIndex=0;c.dataset.id=n.id;var nx=nextDate(n,today);
    /* Kaikki 0.6 (Emil 22.11.2026): kortti on esikatselu (otsikko ja kaksi riviä), ei kuittausympyrää; kuittaus tehdään kalenterissa.
       Kuka kirjoitti näkyy reunan raitana: oma ilman raitaa, yhdessä ja tekoäly omilla väreillään. */
    if(nx){var d=fromIsoW(nx.k);c.appendChild(el('div','nd'+(nx.k===today?' today':''),(nx.k===today?'Tänään ':'')+d+(nx.o.time?' klo '+nx.o.time.s.replace(/^0/,'').replace(':','.')+(nx.o.time.e?'–'+nx.o.time.e.replace(/^0/,'').replace(':','.'):''):'')+((nx.o.rec||(nx.o.b&&nx.o.b!==nx.o.a))?' · '+dateLabel(nx.o).replace(/ klo .*$/,''):'')+(hidDay(nx.k)?' · '+hidTxt(nx.k):'')));}
    c.appendChild(relText(n,'nt',CARDLEN));
    var f=el('div','nf');if(n.rep)f.appendChild(el('b','rtag',data.reps.some(function(R){return R.id===n.rep&&R.mode==='trig';})?'muistutus':'toistuva'));var lr=rowOf(n);if(lr)f.appendChild(el('b','rtag lst',lr.name||'Lista'));f.appendChild(el('span','',stamp(n.created)));if(kd!=='oma'){var sk=el('b','rtag src',{yhdessa:'yhdessä',tekoaly:'tekoäly',ohje:'tekoälylle'}[kd]);sk.classList.add('vh');f.appendChild(sk);}if(n.arch)f.appendChild(el('span','','arkistoitu'));
    nt[n.id].forEach(function(id){
      if(id.indexOf('tag:')===0){f.appendChild(el('i','','#'+id.slice(4)));return;}
      var ii=el('i',ni[n.id].indexOf(id)>=0?'inf':'',termName(id));if(ii.className)ii.title='päätelty';f.appendChild(ii);if(!locked&&!noteSelectionMode&&flowLink(id)){var wb=button(f,'Avaa työnkulku','dck',function(e){e.stopPropagation();startFlow(id,null,n);});wb.dataset.flow=id;wb.setAttribute('aria-label','Avaa työnkulku: '+termName(id));}});c.appendChild(f);
    if(noteSelectionMode)bindNoteSelection(c,n,c);
    else{c.addEventListener('click',function(){noteFromView(n,noteViewPath(V));});c.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&ev.target===c)noteFromView(n,noteViewPath(V));});}
    list.appendChild(c);});
  if(!l.length)(nvRows()?list:p).appendChild(noteFilter.length?el('p','sub','Valituilla rajauksilla ei ole muistiinpanoja.'):subI('Ei vielä muistiinpanoja.','Päättyneet kierrokset ja omat muistiinpanot tulevat tänne.'));
  p.appendChild(list);if(noteSelectionMode)addNoteSelectionActions(p);
  var footer=nvRows()?el('div','rv-footer'):p;if(footer!==p)list.appendChild(footer);
  var em=el('p','sub','Ei osumia.');em.id='nempty';em.hidden=true;footer.appendChild(em);
  filterNotes();if(!locked)noteMore(footer);noteFab(p);
  if(scroll&&list.dataset.view===scroll[0]){list.scrollLeft=scroll[1];list.scrollTop=scroll[2];}
  if(editorFocus?.isConnected)editorFocus.focus({preventScroll:true});
  else nvFocusHeadNow();
}
/* ---- Kaikki 0.10 (Emil 22.11.2026, suunnitelman kohta 2): muistiinpanot riveinä ja sarakkeina.
   Kortit / Rivit laitekohtaisesti (kaikki:nmode; oletus Rivit tietokoneella, Kortit puhelimella). Oletusnäkymä Kaikki muistiinpanot:
   otsikko, kansio, kuka kirjoitti, luotu, seuraava ajankohta. Muut näkymät ovat vaultin tiedostoja nakymat/<tunnus>.md (tyyppi: nakyma),
   joita tekoäly kirjoittaa: mista (kaikki | kansio = x | <kenttä> = arvo; useampi ;-merkillä), jarjestys (<kenttä> nouseva|laskeva) ja
   sarakkeet (- kenttä | laji | asetus). Lajit: teksti, siru, pvm, luku (asetus = yksikkö), palkki (asetus = min-max), kylla-ei.
   Sarakkeiden arvot muistiinpanon alkutiedoista (VAULT.fmGet); erikoiskentät otsikko, kansio, kuka, luotu, ajankohta. ---- */
function nvMode(){var v=null;try{v=localStorage.getItem('kaikki:nmode');}catch(e){}return v==='rows'||v==='cards'?v:(wide()?'rows':'cards');}
function nvRows(){return noteView==='open'&&nvMode()==='rows';}
function nvSet(v){try{localStorage.setItem('kaikki:nmode',v);}catch(e){}}
var NV_DEF={id:'',name:'Kaikki muistiinpanot',mista:[],cols:[{k:'otsikko'},{k:'kansio'},{k:'kuka'},{k:'luotu'},{k:'ajankohta'}],sort:[]};
var NV_W={takaisinlinkit:'minmax(104px,.8fr)',tunnisteet:'minmax(140px,1.1fr)',otsikko:'minmax(180px,1.6fr)',kansio:'minmax(110px,1fr)',kuka:'minmax(104px,.8fr)',luotu:'minmax(92px,.8fr)',ajankohta:'minmax(130px,1fr)',minigraafi:'130px',palkki:'130px',kylla:'64px',luku:'90px',prosentti:'90px',pvm:'130px',valinta:'minmax(120px,1fr)',tila:'minmax(120px,1fr)',monivalinta:'minmax(160px,1.2fr)',siru:'minmax(96px,.8fr)',teksti:'minmax(120px,1fr)'};
function nvFieldLabel(key){return nvVariableName(key)||NV_LAB[key]||(key.charAt(0).toUpperCase()+key.slice(1)).replace(/_/g,' ');}
var NV_LAB={takaisinlinkit:'Takaisinlinkit',tunnisteet:'Tunnisteet',otsikko:'Otsikko',kansio:'Kansio',kuka:'Kuka kirjoitti',luotu:'Luotu',ajankohta:'Seuraava ajankohta'};
function nvVariableName(key){
  var name=/^muuttuja\(("(?:[^"\\]|\\.)*")\)$/.exec(key);
  if(!name)return '';
  try{return nvValidVariable(JSON.parse(name[1]));}catch(e){return '';}
}
function nvValidVariable(value){
  var name=value.trim().normalize('NFC').replace(/\s+/g,' ');
  return MUUTTUJA.validName(name)&&!/^!/.test(name)?name:'';
}
function nvVariableColumn(name){return 'muuttuja('+JSON.stringify(name)+')';}
function nvLatestObservation(observations,name){
  var key=mvDefinition('variables',name).key,best=null,day='';
  observations.forEach(function(o){
    if(mvDefinition('variables',o.nimi).key!==key)return;
    var date=MUUTTUJA.moment(o.paivat[o.paivat.length-1]||'',o.kello);
    if(!best||date>=day){best=o;day=date;}
  });
  return best;
}
function nvObservationTie(observations,hit){
  if(!hit)return 0;
  var at=MUUTTUJA.moment(hit.paivat[hit.paivat.length-1]||'',hit.kello);
  var name=mvDefinition('variables',hit.nimi).key;
  var tied=observations.filter(function(o){return mvDefinition('variables',o.nimi).key===name&&MUUTTUJA.moment(o.paivat[o.paivat.length-1]||'',o.kello)===at;});
  return tied.some(function(o){return o.block;})?tied.length:1;
}
function nvVariableValue(note,name){
  var observations=MUUTTUJA.observe(note),hit=nvLatestObservation(observations,name),tied=nvObservationTie(observations,hit);
  return tied>1?tied+' arvoa':hit?.cellValue??hit?.arvo??'';
}
function viewColumnParts(text,separator){
  separator=separator||'|';
  var parts=[],quote=false,start=0;
  for(var i=0;i<text.length;i++){
    if(text[i]==='\\'&&quote){i++;continue;}
    if(text[i]==='"')quote=!quote;
    if(text[i]===separator&&!quote){parts.push(text.slice(start,i));start=i+1;}
  }
  parts.push(text.slice(start));
  return parts;
}
// Leveys on nimetty lisämääre. Laji ja yksikkö ovat edelleen sijaintiin perustuvia.
/* 0.81: nimetyt määreet laske= (yhteenvetorivi) ja 0.82: kalenteri= (päiväsarake kalenteriin) voivat olla missä kohdassa tahansa. */
var NV_LASKE=[['','Ei laskua'],['summa','Summa'],['keskiarvo','Keskiarvo'],['mediaani','Mediaani'],['min','Pienin'],['max','Suurin'],
  ['maara','Määrä'],['taytetyt','Täytetyt'],['tyhjat','Tyhjät'],['osuus-taytetty','% täytetty'],['osuus-kylla','Kyllä-osuus']];
function nvReadColumn(line){
  var parts=viewColumnParts(line),values=[parts[0].trim()],width=0,laske='',calendar=false;
  parts.slice(1).forEach(function(part){
    var token=part.trim();
    if(/^w\s*=/.test(token)){
      var match=/^w\s*=\s*(\d+)$/.exec(token),px=match?Number(match[1]):0;
      if(px>=60&&px<=700)width=px;
    }else if(/^laske\s*=/i.test(token)){
      var calc=token.replace(/^laske\s*=\s*/i,'').trim().toLowerCase();
      if(NV_LASKE.some(function(x){return x[0]&&x[0]===calc;}))laske=calc;
    }else if(/^kalenteri\s*=/i.test(token))calendar=/^kalenteri\s*=\s*(kylla|kyllä)$/i.test(token);
    else values.push(token);
  });
  var column={k:values[0],t:values[1]||'',o:values[2]||'',w:width,laske:laske,kal:calendar,extra:values.slice(3)};
  if(parts[1]&&/^w\s*=/.test(parts[1].trim()))column.legacyKey=column.k+'|'+parts[1].trim();
  return column;
}
function nvPutWidth(line,width){
  var parts=viewColumnParts(line);
  var found=false,kept=parts.filter(function(part,i){
    if(i===0||!/^\s*w\s*=/.test(part))return true;
    if(found||!width)return false;
    found=true;return true;
  }).map(function(part,i){
    if(i===0||!/^\s*w\s*=/.test(part))return part;
    return part.replace(/^(\s*w\s*=\s*).*?(\s*)$/,function(_,prefix,suffix){return prefix+width+suffix;});
  });
  var text=kept.join('|');
  if(width&&!found)return text+' | w='+width;
  return width?text:text.trimEnd();
}
function nvParse(path,md,kind){var S=VAULT.split(String(md||'').replace(/\r\n/g,'\n'));if(!S.fm)return null;var L=S.fm,g=function(k){return VAULT.fmGet(L,k);};if(g('tyyppi')!==(kind||'nakyma'))return null;
  var cols=[],inC=false;L.forEach(function(l){if(/^sarakkeet:\s*$/.test(l)){inC=true;return;}if(inC){var m=/^\s+-\s*(.+)$/.exec(l);if(m){var c=nvReadColumn(m[1]);if(c.k)cols.push(c);return;}if(/^\S/.test(l))inC=false;}});
  if(path===NOTE_ORDER_PATH&&!cols.length&&!g('mista')&&!g('jarjestys'))return null;
  if(!cols.length)cols=NV_DEF.cols.slice();if(!cols.some(function(c){return c.k==='otsikko';}))cols.unshift({k:'otsikko'});else cols.sort(function(a,b){return (b.k==='otsikko')-(a.k==='otsikko');});
  var mista=viewColumnParts(g('mista'),';').map(function(x){if(/^\s*kaikki\s*$/i.test(x))return {k:'kaikki',op:'=',v:''};var m=/^\s*(muuttuja\("(?:[^"\\]|\\.)*"\)|[a-z0-9_-]+)\s*(!=|>=|<=|=|>|<|~)\s*(.*?)\s*$/i.exec(x);return m?{k:m[1],op:m[2],v:m[3]}:null;}).filter(Boolean);
  return {id:path,name:g('otsikko')||path.replace(/^.*\//,'').replace(/\.md$/,''),mista:mista,cols:cols,sort:nvReadSort(g('jarjestys'))};}
function nvReadSort(text){
  return viewColumnParts(text,',').map(function(part){
    var rule=/^\s*(muuttuja\("(?:[^"\\]|\\.)*"\)|[a-z0-9_-]+)(?:\s+(nouseva|laskeva))?\s*$/i.exec(part);
    return rule?{k:rule[1],d:/^laskeva$/i.test(rule[2]||'')?-1:1}:null;
  }).filter(Boolean);
}
function nvSortText(sort){
  return sort.filter(function(rule){return rule.k;}).map(function(rule){
    return rule.k+' '+(rule.d<0?'laskeva':'nouseva');
  }).join(', ');
}
function nvViews(){if(!vOn()||!VC||!VC.files)return [];var out=[];Object.keys(VC.files).sort().forEach(function(p){if(!/^nakymat\/[^/]+\.md$/.test(p))return;var V=nvParse(p,VC.files[p].t);if(V)out.push(V);});return out;}
function nvCur(){var id=null;try{id=localStorage.getItem('kaikki:nview');}catch(e){}var V=nvViews().filter(function(v){return v.id===id;})[0];return V?nvPendView(V):NV_DEF;}
/* 0.80: odottava tai tallentuva oma muutos näkyy heti (esim. ＋ sarake). Ristiriita ja virhe näyttävät Vaultin version, ja valinta tehdään Näkymä-valikossa. */
function nvPendView(V){
  var e=vOn()&&NV_PEND[nvPendKey(V.id)];
  if(!e||e.D.kind==='taulukko'||(e.st!=='odottaa'&&e.st!=='tallentuu'))return V;
  var D=e.D,cols=D.cols.map(function(c){return Object.assign({},c);});
  if(!cols.some(function(c){return c.k==='otsikko';}))cols.unshift({k:'otsikko'});
  return Object.assign({},V,{name:String(D.name||'').trim()||V.name,cols:cols,
    mista:D.mista.filter(function(c){return c.k&&(c.k==='kaikki'||c.v!=='');}).map(function(c){return Object.assign({},c);}),
    sort:D.sort.filter(function(rule){return rule.k;}).map(function(rule){return Object.assign({},rule);})});
}
function nvPass(V,n){return V.mista.every(function(c){var op=c.op||'=',neg=op==='!=';if(c.k==='kaikki')return true;
  if(c.k==='kansio'){var hit=!!n.vp&&n.vp.indexOf(c.v.replace(/\/$/,'')+'/')===0;return neg?!hit:hit;}
  if(c.k==='tunniste'){var t=noteTags(n).indexOf(noteTagKey(c.v))>=0;return neg?!t:t;}
  var name=nvVariableName(c.k);
  var raw=name?nvVariableValue(n,name):VAULT.fmGet(n.vfm,c.k)||nvFieldOf(n,c.k);
  raw=raw==null?'':String(raw);
  if(op==='='||op==='!='){var eq=raw.toLocaleLowerCase('fi')===String(c.v).toLocaleLowerCase('fi');return neg?!eq:eq;}
  if(op==='~')return raw.toLocaleLowerCase('fi').indexOf(String(c.v).toLocaleLowerCase('fi'))>=0;
  var a=dashNum(raw),b=dashNum(c.v);if(a==null||b==null)return false;return op==='>'?a>b:op==='<'?a<b:op==='>='?a>=b:a<=b;});}
function nvRaw(n,k,today,formulas){
  if(k.startsWith('muuttuja(')){var name=nvVariableName(k);if(name)return nvVariableValue(n,name);}
  if(formulas&&k.charAt(0)==='=')return formulas.get().run(k,n,formulas.group);if(k==='otsikko')return noteTitle(n)||'(tyhjä)';if(k==='kansio')return n.vp&&n.vp.indexOf('/')>0?n.vp.replace(/\/[^/]*$/,''):(n.vp?'':'laite');
  if(k==='kuka')return n.vp?VAULT.kindOf(n.vp,n.vfm):'oma';if(k==='luotu')return n.created?isoD(new Date(n.created)):'';
  if(k==='tunnisteet')return noteTags(n);
  if(k==='takaisinlinkit'){
    var incoming=formulas&&formulas.linkIndex&&formulas.linkIndex.incoming.get(n.id);
    return incoming?incoming.size:0;
  }
  if(k==='ajankohta'){
    var dates=formulas&&formulas.upcoming;
    if(!dates)return nextDate(n,today);
    if(!dates.has(n))dates.set(n,nextDate(n,today));
    return dates.get(n);
  }
  var raw=n.vfm?VAULT.fmGet(n.vfm,k):'';
  if(!formulas)return raw;
  if(raw.charAt(0)==='=')return formulas.get().value(n,k);
  if(!raw&&formulas.allowed.has(k)){
    var found=formulas.get().values(n,k);
    if(found.error)return found;
    return found.value.map(formulaDisplay).join(' · ');
  }
  return raw;
}
function nvDate(iso){var d=fromIso(iso);return isNaN(d)?iso:d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();}
function nvCell(c,v,today,note,locked){var td=el('div','rvc'+(c.k==='otsikko'?' rvt':'')),t=c.t||'';
  if(v&&typeof v==='object'&&('error' in v||'value' in v)){
    if(v.error){td.classList.add('formula-error');td.textContent=v.error;td.title=v.error;return td;}
    v=typeof v.value==='number'?v.value:formulaDisplay(v.value);
  }
  if(c.k==='tunnisteet'){nvTagCell(td,v,locked);return td;}
  if(c.k==='takaisinlinkit'){
    if(!v||locked||noteSelectionMode){td.textContent=v||'–';return td;}
    var links=button(td,String(v),'rvchip rv-backlink',function(event){
      event.stopPropagation();nvOpenBacklinks(note,this);
    });
    links.setAttribute('aria-label','Takaisinlinkit: '+(noteTitle(note)||'Nimetön')+', '+v);
    links.setAttribute('aria-haspopup','menu');return td;
  }
  if(c.k==='kuka'){var lab={oma:'oma',yhdessa:'yhdessä',tekoaly:'tekoäly',ohje:'tekoälylle'}[v]||v;if(v!=='oma')td.appendChild(el('span','srcdot'+(v==='yhdessa'?'':' ai')));td.appendChild(el('span','',lab));return td;}
  if(c.k==='ajankohta'){if(v){var o=v.o,s=(v.k===today?'Tänään ':'')+fromIsoW(v.k)+(o.time?' klo '+o.time.s.replace(/^0/,'').replace(':','.'):'');td.appendChild(el('span',v.k===today?'rvtoday':'',s));}return td;}
  if(c.k==='luotu'){if(v)td.textContent=/^\d{4}-\d{2}-\d{2}$/.test(v)?nvDate(v):v;return td;}
  if(t==='pvm'){if(v)nvDateCell(td,v);return td;}
  if(t==='minigraafi'){
    var graph=nvGraph(nvGraphValues(v,c.o));if(graph)td.appendChild(graph);
    return td;
  }
  if(v===''||v==null)return td;
  if(t==='siru'){td.appendChild(el('span','rvchip',v));return td;}
  if(NV_CHOICE.includes(t)){nvChoiceCell(td,c,v);return td;}
  if(t==='kylla-ei'){var on=/^(kylla|kyllä|1|true|on)$/i.test(v);if(on)td.appendChild(okMark());else td.appendChild(el('span','rvno','Ei'));td.setAttribute('aria-label',on?'kyllä':'ei');return td;}
  if(t==='luku'||t==='prosentti'){var x=dashNum(v),unit=t==='prosentti'?'%':c.o;td.classList.add('rvnum');td.textContent=x==null?v:String(x).replace('.',',')+(unit?' '+unit:'');return td;}
  if(t==='palkki'){var r=/^\s*(-?[\d.]+)\s*-\s*(-?[\d.]+)\s*$/.exec(c.o||'')||[0,0,100],lo=+r[1],hi=+r[2],x2=dashNum(v);if(x2==null){td.textContent=v;return td;}
    var pc=Math.max(0,Math.min(1,(x2-lo)/((hi-lo)||1))),b=el('span','rvpb'),i=el('i');i.style.width=Math.round(pc*100)+'%';b.appendChild(i);td.appendChild(b);td.appendChild(el('small','',String(x2).replace('.',',')));td.setAttribute('aria-label',v+' / '+hi);return td;}
  td.textContent=v;return td;}
function nvTagFilter(tag){
  noteFilter=['tag:'+tag];noteQuery='';activeScroller().scrollTop=0;render();
  var filter=$('filterpick');if(filter)filter.focus({preventScroll:true});
}
function nvOpenBacklinks(note,anchor){
  var index=vLinkIndex(),ids=index.incoming.get(note.id),menu=$('sortpop');
  if(!ids||!ids.size)return;
  menu.textContent='';menu.setAttribute('aria-label','Takaisinlinkit');
  menu.appendChild(el('div','mh','Takaisinlinkit'));
  Array.from(ids,function(id){return index.byId.get(id);}).sort(function(a,b){
    return (noteTitle(a)||'').localeCompare(noteTitle(b)||'','fi');
  }).forEach(function(source,i){
    menuItem(menu,'rv-backlink-'+i,noteTitle(source)||'Nimetön',function(){openNote(source);});
  });
  anchoredMenu('sortpop',anchor);
}
function nvTagCell(td,tags,locked){
  td.classList.add('note-tag-cell');
  if(locked||noteSelectionMode){
    tags.forEach(function(tag){td.appendChild(el('span','rvchip','#'+tag));});
    return;
  }
  tags.forEach(function(tag){
    var chip=button(td,'#'+tag,'rvchip rv-tag',function(event){event.stopPropagation();nvTagFilter(tag);});
    chip.dataset.rvMeasure='';
  });
  if(tags.length){
    var more=button(td,'+'+tags.length,'rvchip rv-extra',function(event){
      event.stopPropagation();
      var anchor=this,menu=$('sortpop');menu.textContent='';menu.setAttribute('aria-label','Tunnisteet');
      menu.appendChild(el('div','mh','Tunnisteet'));
      tags.forEach(function(tag,i){menuItem(menu,'rv-tag-'+i,'#'+tag,function(){nvTagFilter(tag);});});
      anchoredMenu('sortpop',anchor);
    });
    more.dataset.rvMeasure='';more.style.minWidth=Math.max(3,String(tags.length).length+1)+'ch';more.setAttribute('aria-label','Näytä kaikki '+tags.length+' tunnistetta');
    more.setAttribute('aria-haspopup','menu');
  }
}
var nvTagObserver=null;
function nvFitTags(cells){
  var results=[];
  cells.forEach(function(cell){
    var more=cell.querySelector('.rv-extra');if(!more||!cell.clientWidth)return;
    var css=getComputedStyle(cell),gap=parseFloat(css.columnGap)||0;
    var available=cell.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
    var chips=Array.from(cell.querySelectorAll('.rv-tag')),widths=chips.map(function(chip){return chip.getBoundingClientRect().width;});
    var remaining=available-more.getBoundingClientRect().width,shown=0;
    if(widths.reduce(function(sum,w){return sum+w;},gap*(chips.length-1))<=available)shown=chips.length;
    else while(shown<chips.length&&widths[shown]+gap<=remaining){
      remaining-=widths[shown]+gap;shown++;
    }
    results.push({chips:chips,shown:shown,more:more});
  });
  results.forEach(function(result){
    var missing=result.chips.length-result.shown;
    result.chips.forEach(function(chip,i){chip.hidden=i>=result.shown;});
    result.more.hidden=!missing;
    if(missing)result.more.textContent='+'+missing;
  });
}
function nvWatchTags(list){
  var cells=list.querySelectorAll('.note-tag-cell'),visible=new Set(),intersection=null,resize=null;
  function fit(){if(list.isConnected)nvFitTags(visible);}
  if(typeof IntersectionObserver==='function'){
    intersection=new IntersectionObserver(function(entries){
      var added=[];
      entries.forEach(function(entry){
        if(entry.isIntersecting){visible.add(entry.target);added.push(entry.target);}
        else visible.delete(entry.target);
      });
      if(list.isConnected)nvFitTags(added);
    },{root:list,rootMargin:'144px 96px'});
    cells.forEach(function(cell){intersection.observe(cell);});
  }else{cells.forEach(function(cell){visible.add(cell);});requestAnimationFrame(fit);}
  if(typeof ResizeObserver==='function'){resize=new ResizeObserver(fit);resize.observe(list);}
  nvTagObserver={fit:fit,disconnect:function(){if(intersection)intersection.disconnect();if(resize)resize.disconnect();}};
}
function nvGraphValues(value,option){
  var ref=/^(data\/[a-z0-9_-]+\.csv):([a-z0-9_-]+)$/i.exec(String(option||value||''));
  if(ref){
    var file=VC.files[ref[1]];if(!file)return [];
    var table=dashCsv(file.t);if(table.h.indexOf(ref[2])<0)return [];
    return table.rows.map(function(row){return dashNum(row[ref[2]]);}).filter(function(n){return n!==null;}).slice(-120);
  }
  var text=String(value??'').trim().replace(/^\[|\]$/g,'');
  if(!text)return [];
  return text.split(text.indexOf(';')>=0?';':',').map(function(v){return dashNum(v.trim());}).filter(function(n){return n!==null;}).slice(-120);
}
function nvGraph(values){
  if(!values.length)return null;
  var ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','rv-spark');svg.setAttribute('viewBox','0 0 108 26');svg.setAttribute('role','img');
  var lo=Math.min.apply(null,values),hi=Math.max.apply(null,values),last=values[values.length-1];
  svg.setAttribute('aria-label','Minigraafi, '+values.length+' arvoa. Pienin '+formulaDisplay(lo)+', suurin '+formulaDisplay(hi)+', viimeisin '+formulaDisplay(last)+'.');
  function height(x){return hi===lo?13:23-20*(x-lo)/(hi-lo);}
  if(values.length===1){
    var circle=document.createElementNS(ns,'circle');circle.setAttribute('cx','54');circle.setAttribute('cy','13');circle.setAttribute('r','3');circle.setAttribute('fill','currentColor');svg.appendChild(circle);
  }else{
    var line=document.createElementNS(ns,'polyline');
    line.setAttribute('points',values.map(function(x,i){return (2+104*i/(values.length-1))+','+height(x);}).join(' '));
    line.setAttribute('fill','none');line.setAttribute('stroke','currentColor');line.setAttribute('stroke-width','2');line.setAttribute('stroke-linejoin','round');svg.appendChild(line);
  }
  return svg;
}
var nvSortOverrides=new Map(),nvNoteBaseSort=new Map();
function nvActiveSort(V){return nvSortOverrides.has(V.id)?[nvSortOverrides.get(V.id)].filter(Boolean):V.sort;}
function noteViewPath(V){return noteOrderEnabled()?(V.id||NOTE_ORDER_PATH):'';}
function noteBaseSort(V){
  if(!noteOrderEnabled())return noteSort==='own'?'next':noteSort;
  if(V.id)return nvNoteBaseSort.get(V.id)||'own';
  var file=VC.files[NOTE_ORDER_PATH];
  return !noteSortExplicit&&file&&noteOrderSection(file.t).paths.length?'own':noteSort;
}
function noteBaseSet(V,sort){
  if(V.id){nvNoteBaseSort.set(V.id,sort);return;}
  noteSort=sort;noteSortExplicit=true;
  try{localStorage.setItem('kaikki:oma-jarjestys',sort==='own'?'1':'0');}catch(e){}
}
function noteOwnReset(V){
  if(viewLocked(noteViewPath(V)))return;
  noteBaseSet(V,'own');nvSortOverrides.set(V.id,null);activeScroller().scrollTop=0;render();
}
function noteViewTools(bar,V,locked){
  var vb=button(bar,'','treepick',function(){
    var m=$('sortpop');m.textContent='';m.setAttribute('aria-label','Näkymä');
    [NV_DEF].concat(nvViews()).forEach(function(x){
      var b=menuItem(m,'nv-'+(x.id||'kaikki').replace(/[^a-z0-9]+/gi,'-'),x.name,function(){
        try{localStorage.setItem('kaikki:nview',x.id);}catch(e){}
        $('nlist').scrollTop=0;render();$('nvpick').focus({preventScroll:true});
      });b.setAttribute('aria-current',x.id===V.id?'true':'false');
    });
    if(noteOrderEnabled()&&!viewLocked(noteViewPath(V))){
      m.appendChild(el('div','msep'));
      if(noteBaseSort(V)!=='own'||nvActiveSort(V).length)menuItem(m,'nv-own-reset','Palauta oma järjestys',function(){noteOwnReset(V);$('nvpick').focus({preventScroll:true});});
      menuItem(m,'nv-new','+ Uusi näkymä',function(){nvEdit(null);});
      if(V.id&&V.id!==NOTE_ORDER_PATH)menuItem(m,'nv-edit','Muokkaa näkymää “'+V.name+'”',function(){nvEdit(V);});
      nvPendMenu(m);
    }anchoredMenu('sortpop',vb);
  });
  vb.id='nvpick';vb.setAttribute('aria-haspopup','menu');
  if(vOn()&&nvPendHere().some(function(e){return e.st==='virhe'||e.st==='ristiriita';})){
    vb.classList.add('nv-warn');vb.setAttribute('aria-description','Näkymän tallennus odottaa valintaa');
  }
  vb.appendChild(el('small','','Näkymä'));vb.appendChild(el('span','',V.name));vb.insertAdjacentHTML('beforeend',CHEV);
  if(noteOrderEnabled())viewLockButton(bar,'nv-lock',noteViewPath(V),'nakyma',locked);
}
function nvSortValue(value,column){
  if(column&&NV_CHOICE.includes(column.t)&&typeof value==='string'&&value.trim()){
    var first=column.t==='monivalinta'?nvMultiValues(value)[0]:value.trim(),at=nvChoiceFind(nvChoiceOpts(column),first);
    if(at)return at.i; // Emilin järjestys, tila ryhmittäin
  }
  if(value&&typeof value==='object'&&('value' in value||'error' in value))value=value.value;
  if(column&&column.t==='minigraafi'){var values=nvGraphValues(value,column.o);return values[values.length-1];}
  if(value&&typeof value==='object'&&value.k&&value.o)return value.k+' '+(value.o.time?value.o.time.s:'');
  if(Array.isArray(value))return value.join(', ');
  return value;
}
function nvSortList(list,sort,V,today,formulas){
  if(!sort.length)return list;
  var columns=sort.map(function(rule){return V.cols.find(function(c){return c.k===rule.k;});});
  return list.map(function(note,i){
    var values=sort.map(function(rule,j){
      var value=nvSortValue(nvRaw(note,rule.k,today,formulas),columns[j]);
      if(value==null||String(value).trim()==='')return null;
      var number=dashNum(value);
      if(number!==null)return number;
      var text=String(value),date=/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
      if(date){
        var iso=date[3]+'-'+date[2].padStart(2,'0')+'-'+date[1].padStart(2,'0');
        if(nvIsoField(iso))return iso;
      }
      return text;
    });
    return {n:note,values:values,i:i};
  }).sort(function(a,b){
    for(var j=0;j<sort.length;j++){
      var x=a.values[j],y=b.values[j];
      if(x===y)continue;
      if(x===null||y===null)return x===null?1:-1;
      var numericX=typeof x==='number',numericY=typeof y==='number';
      var difference=numericX&&numericY?x-y:
        numericX!==numericY?(numericX?-1:1):x.localeCompare(y,'fi',{numeric:true});
      if(difference)return difference*sort[j].d;
    }
    return a.i-b.i;
  }).map(function(entry){return entry.n;});
}
function rowsInto(list,l,today,dates,V,locked,baseSort){
  list.dataset.view=data.k+'|'+V.id;
  var L=l,formulas=formulaContext();
  var activeSort=nvActiveSort(V);
  formulas.upcoming=dates;formulas.group=l; // 0.81: sarakkeen kaavan SUMMA(kenttä) laskee näkymän rivit
  if(vOn()&&V.cols.concat(V.sort).some(function(c){return c.k==='takaisinlinkit';}))formulas.linkIndex=vLinkIndex();
  var baseOrder=L,rows=new Map(),headers=[];
  var path=noteViewPath(V),ownOrder=!locked&&noteOrderEnabled()&&baseSort==='own'&&!noteSelectionMode&&!noteFilter.length;
  var handles=[];
  function paintOrderHandles(){
    var sorted=activeSort.length>0,searching=!!normT(noteQuery).trim();
    handles.forEach(function(handle){handle.dataset.sorted=String(sorted);handle.hidden=sorted||searching;});
  }
  function paintSort(){
    headers.forEach(function(head){
      var rank=activeSort.findIndex(function(rule){return rule.k===head.column.k;});
      var direction=rank>=0?activeSort[rank].d:0,label=nvFieldLabel(head.column.k),sort=head.button;
      sort.setAttribute('aria-label',label+(direction===1?', nouseva järjestys':direction===-1?', laskeva järjestys':', järjestä')+
        (rank>=0&&activeSort.length>1?', lajitteluperuste '+(rank+1):''));
      sort.replaceChildren(el('span','',label));
      if(direction){var icon=el('span','rv-direction'+(direction===-1?' down':''));icon.setAttribute('aria-hidden','true');sort.appendChild(icon);}
      if(rank>=0&&activeSort.length>1){var priority=el('span','rv-sort-rank',String(rank+1));priority.setAttribute('aria-hidden','true');sort.appendChild(priority);}
    });
  }
  L=nvSortList(L,activeSort,V,today,formulas);
  var NL=nvLay(V); // Laitejärjestys kuuluu vain rivien piirtoon. Editori käyttää näkymän omia sarakkeita.
  var addColumn=nvCanAddColumn(V,locked);
  var tpl=NL.cols.map(function(c){var w=NL.w[nvKey(c)]||c.w;return w?w+'px':(NV_W[c.k]||NV_W[c.t==='kylla-ei'?'kylla':c.t]||NV_W.teksti);}).join(' ')+(addColumn?' 44px':'');list.style.setProperty('--rvcols',tpl);
  var hw=el('div','rvh'),hr=el('div','rvhead');
  NL.cols.forEach(function(c,i){
    var cell=el('div','rvc'+(c.k==='otsikko'?' rvt':''));
    if(locked){cell.appendChild(el('span','rv-head-label',nvFieldLabel(c.k)));cell.dataset.k=nvKey(c);hr.appendChild(cell);return;}
    var sort=button(cell,'','rv-head-sort',function(){
      var rank=activeSort.find(function(rule){return rule.k===c.k;}),override=nvSortOverrides.get(V.id);
      if(override&&override.k===c.k&&override.d===-1)nvSortOverrides.delete(V.id);
      else nvSortOverrides.set(V.id,{k:c.k,d:rank&&rank.d===1?-1:1});
      activeSort=nvActiveSort(V);
      paintOrderHandles();
      L=nvSortList(baseOrder,activeSort,V,today,formulas);
      var top=list.scrollTop,fragment=document.createDocumentFragment();
      L.forEach(function(n){fragment.appendChild(rows.get(n.id));});
      body.appendChild(fragment);list.scrollTop=top;paintSort();sort.focus({preventScroll:true});
    });
    sort.id='rv-head-sort-'+i;headers.push({column:c,button:sort});
    cell.dataset.k=nvKey(c);var rz=el('i','rv-rz');rz.setAttribute('aria-hidden','true');cell.appendChild(rz);nvHeadDrag(sort,cell,rz,V,c,list,hr);
    hr.appendChild(cell);
  });
  if(addColumn){
    var addCell=el('div','rvc rv-add'),add=button(addCell,'＋','rv-add-btn',function(){nvAddColumn(V,add);});
    add.id='rv-add-col';add.setAttribute('aria-label','Lisää sarake');add.setAttribute('aria-haspopup','dialog');add.title='Lisää sarake';
    hr.appendChild(addCell);
  }
  paintSort();hw.appendChild(hr);var body=el('div','rvb');list.append(hw,body);
  var actionCells=!locked&&NL.cols.some(function(c){return c.k==='tunnisteet'||c.k==='takaisinlinkit';});
  var sumEntries=NL.cols.some(function(c){return c.laske;})?[]:null;
  L.forEach(function(n){var r=el('div','rvr'+srcCls(n)),canEdit=!locked&&!noteSelectionMode&&nvCanEditNote(n),editable=false;
    r.dataset.id=n.id;r.setAttribute('role','button');r.tabIndex=0;
    var sumValues=sumEntries&&[];if(sumEntries)sumEntries.push({row:r,vals:sumValues});
    NL.cols.forEach(function(c,index){
      var raw=nvRaw(n,c.k,today,formulas);if(sumValues&&c.laske)sumValues[index]=raw;
      var td=nvCell(c,raw,today,n,locked);
      if(canEdit&&nvEditable(c,n)){
        nvBindCell(td,n,c,formulas.allowed,path,index);editable=true;
      }
      r.appendChild(td);
    });
    if(noteSelectionMode)bindNoteSelection(r,n,r.querySelector('.rvt')||r);
    else if(ownOrder&&noteOrderPath(n.vp)){
      var title=r.querySelector('.rvt'),handle=noteOrderHandle(r,n,body,path);
      r.removeAttribute('role');r.removeAttribute('tabindex');
      var open=el('button','note-order-open',title.textContent);open.type='button';
      open.addEventListener('click',function(event){if(!activeSort.length||!nvMultiClick(event,n,L))noteFromView(n,path);});
      handles.push(handle);title.textContent='';title.append(handle,open);
      r.addEventListener('click',function(ev){if(!ev.target.closest('button')&&(!activeSort.length||!nvMultiClick(ev,n,L)))noteFromView(n,path);});
    }else{
      if(actionCells||editable){
        var titleCell=r.querySelector('.rvt'),title=titleCell.textContent;
        r.removeAttribute('role');r.removeAttribute('tabindex');titleCell.textContent='';
        button(titleCell,title,'note-order-open',function(event){event.stopPropagation();if(locked||!nvMultiClick(event,n,L))noteFromView(n,path);});
      }
      r.addEventListener('click',function(ev){if(!locked&&nvMultiClick(ev,n,L))return;noteFromView(n,path);});
      r.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&ev.target===r)noteFromView(n,path);});
    }
    if(noteSelectionMode)r.addEventListener('click',function(ev){if(ev.shiftKey&&nvAnchor){ev.preventDefault();ev.stopImmediatePropagation();nvRange(n,L);}else nvAnchor=n.id;},true);
    rows.set(n.id,r);body.appendChild(r);});
  paintOrderHandles();
  if(NL.cols.some(function(c){return c.k==='tunnisteet';}))nvWatchTags(list);
  if(sumEntries)list.appendChild(nvSumRow(list,NL.cols,V,locked,sumEntries));
  if(V.mista.length&&!L.length)list.appendChild(el('p','sub','Näkymässä ei ole muistiinpanoja.'));}
/* Listojen avoin otsikko käyttää yläpalkin mitattua korkeutta. */
var nbObs=null;
function nbWatch(nb){
  function update(){if(nb.isConnected)document.documentElement.style.setProperty('--nbh',nb.getBoundingClientRect().height+'px');}
  if(nbObs)nbObs.disconnect();
  if(typeof ResizeObserver==='function'){nbObs=new ResizeObserver(update);nbObs.observe(nb);}
  requestAnimationFrame(update);
}
/* ---- Kaikki 0.31 (Emil 22.11.2026, A0.3–A0.6): rivinäkymän sarakkeet raahattaviksi ja monivalinta näkyväksi.
   Leveys otsikon oikeasta reunasta (kaksoisnapsautus sovittaa sisältöön), järjestys raahaamalla otsikkoa (Otsikko pysyy ensimmäisenä).
   Tallennus laitteelle (kaikki:nvlay:<näkymä>), koska puhelin ja tietokone tarvitsevat eri leveydet. Cmd/Ctrl-napsautus valitsee rivin ja
   avaa valintatilan, Shift-napsautus valitsee välin, tietokoneella osoitettaessa näkyy valintaruutu. ---- */
function nvKey(c){return c.k+(c.f?'|'+c.f:'')+(c.t?'|'+c.t:'');}
function nvLayGet(V){try{return JSON.parse(localStorage.getItem('kaikki:nvlay:'+(V.id||'kaikki'))||'null')||{};}catch(e){return {};}}
function nvLaySet(V,o){try{localStorage.setItem('kaikki:nvlay:'+(V.id||'kaikki'),JSON.stringify(o));}catch(e){}}
function nvLay(V){var o=nvLayGet(V),cols=V.cols.slice(),migrated=false;
  // Vanha versio käytti lajiksi tulkittua w-määrettä laiteasetuksen avaimessa.
  cols.forEach(function(c){
    var old=c.legacyKey;if(!old)return;
    var key=nvKey(c);
    if(o.w&&Object.hasOwn(o.w,old)){
      if(!Object.hasOwn(o.w,key))o.w[key]=o.w[old];
      delete o.w[old];migrated=true;
    }
    if(Array.isArray(o.order)&&o.order.includes(old)){
      o.order=o.order.map(function(k){return k===old?key:k;});migrated=true;
    }
  });
  if(migrated)nvLaySet(V,o);
  if(Array.isArray(o.order)){var rank={};o.order.forEach(function(k,i){rank[k]=i;});
    cols.sort(function(a,b){if(a.k==='otsikko')return -1;if(b.k==='otsikko')return 1;var x=rank[nvKey(a)],y=rank[nvKey(b)];return (x==null?999:x)-(y==null?999:y);});}
  return {cols:cols,w:o.w||{}};}
/* Kaikki 0.57 (korjaussuunnitelma 3, 23.11.2026): lajittelu, leveyden säätö ja siirto erillään.
   Yksi ele kerrallaan (nvGest), osoitin kaapataan ja ele päätetään kerran. Vapautus vahvistaa; pointercancel, kaappauksen menetys ja Esc
   palauttavat lähtötilan. Vain ensisijainen nappi. Leveys piirretään korkeintaan kerran ruutua kohti ja tallennetaan vasta vapautuksessa.
   Kosketuksella otsikkoriviltä vieritetään taulukkoa sivulle, pitkä painallus avaa sarakevalikon (myös hiiren oikea nappi ja
   näppäimistön ContextMenu / Shift+F10): siirto vasemmalle/oikealle, leveämmäksi/kapeammaksi ja oletusleveys. Siirron järjestyslogiikka
   (nvMove) on sama raahauksessa, sarakevalikossa ja näkymämuokkaimessa. ---- */
var nvGest=null;
function nvMove(arr,from,to){if(from<0||to<0||from>=arr.length||to>=arr.length||from===to)return arr;var x=arr.splice(from,1)[0];arr.splice(to,0,x);return arr;}
function nvHeadKeys(hr){return Array.prototype.map.call(hr.children,function(x){return x.dataset.k;}).filter(Boolean);}
function nvHeadFocus(key){var b=Array.prototype.filter.call(document.querySelectorAll('.rvhead .rvc'),function(x){return x.dataset.k===key;})[0];b=b&&b.querySelector('.rv-head-sort');if(b)try{b.focus({preventScroll:true});}catch(e){}}
function nvHeadRedo(key){renderNotes();sbarSync();nvHeadFocus(key);}
function nvHeadOrder(V,key,keys){var o=nvLayGet(V);o.order=keys;nvLaySet(V,o);nvHeadRedo(key);}
function nvHeadWidth(V,key,w){var o=nvLayGet(V);o.w=o.w||{};if(w==null)delete o.w[key];else o.w[key]=Math.max(60,Math.min(700,Math.round(w)));nvLaySet(V,o);nvHeadRedo(key);}
// Mittaa otsikko ja näkyvien rivien solut niiden omilla fonteilla ja sisennyksillä.
function nvFitColumn(V,c,list,hr,cell){
  var index=Array.prototype.indexOf.call(hr.children,cell);
  var tracks=getComputedStyle(hr).gridTemplateColumns.split(' ');
  var rowTracks=list.style.getPropertyValue('--rvcols');
  var scroll=list.scrollLeft,width=0;
  tracks[index]='max-content';
  try{
    list.style.setProperty('--rvcols',tracks.join(' '));
    list.classList.add('rv-fit-measure');
    width=cell.getBoundingClientRect().width;
    list.querySelectorAll('.rvr:not([hidden])').forEach(function(row){
      var item=row.children[index];
      if(item)width=Math.max(width,item.getBoundingClientRect().width);
    });
  }finally{
    list.classList.remove('rv-fit-measure');
    list.style.setProperty('--rvcols',rowTracks);list.scrollLeft=scroll;
  }
  nvHeadWidth(V,nvKey(c),Math.ceil(width));
}
function nvColMenu(V,c,list,hr,cell,anchor){var m=$('sortpop'),key=nvKey(c),keys=nvHeadKeys(hr),i=keys.indexOf(key),locked=c.k==='otsikko',label=nvFieldLabel(c.k),w=cell.getBoundingClientRect().width;
  m.textContent='';m.setAttribute('aria-label','Sarake '+label);m.appendChild(el('p','sub rvm-h',label+' · Tämän laitteen asetukset'));
  var a=menuItem(m,'rvm-left','Siirrä vasemmalle',function(){nvHeadOrder(V,key,nvMove(keys.slice(),i,i-1));});a.disabled=locked||i<=1;
  var b=menuItem(m,'rvm-right','Siirrä oikealle',function(){nvHeadOrder(V,key,nvMove(keys.slice(),i,i+1));});b.disabled=locked||i>=keys.length-1;
  var o=nvLayGet(V);
  if(Array.isArray(o.order)){
    menuItem(m,'rvm-view-order',V.id?'Käytä näkymän sarakejärjestystä':'Palauta sarakkeiden oletusjärjestys',function(){
      var layout=nvLayGet(V);
      delete layout.order;
      nvLaySet(V,layout);
      nvHeadRedo(key);
    });
  }
  if(nvSortOverrides.has(V.id)&&(nvSortOverrides.get(V.id)!==null||V.sort.length)){
    menuItem(m,'rvm-view-sort','Palauta näkymän lajittelu',function(){
      nvSortOverrides.delete(V.id);
      nvHeadRedo(key);
    });
  }
  if(noteOrderEnabled()&&(nvActiveSort(V).length||noteBaseSort(V)!=='own')){
    menuItem(m,'rvm-own-order','Palauta oma järjestys',function(){noteOwnReset(V);nvHeadFocus(key);});
  }
  m.appendChild(el('div','msep'));
  menuItem(m,'rvm-fit','Sovita sisältöön',function(){nvFitColumn(V,c,list,hr,cell);});
  menuItem(m,'rvm-wider','Leveämmäksi',function(){nvHeadWidth(V,key,w+40);});
  var n=menuItem(m,'rvm-narrower','Kapeammaksi',function(){nvHeadWidth(V,key,w-40);});n.disabled=w<=60;
  var d=menuItem(m,'rvm-default',c.w?'Käytä yhteistä leveyttä ('+c.w+' px)':'Oletusleveys',function(){nvHeadWidth(V,key,null);});d.disabled=!(o.w&&o.w[key]);
  if(nvCanCalc(V)){
    m.appendChild(el('div','msep'));m.appendChild(el('p','sub rvm-h','Kaikille laitteille'));
    var calc=menuItem(m,'rvm-calc','Yhteenveto: '+(c.laske?nvCalcName(c.laske):'ei laskua')+' …',function(){nvCalcMenu(V,c,anchor);});
    calc.setAttribute('aria-haspopup','menu');
    if(NV_CHOICE.includes(c.t)){var choices=menuItem(m,'rvm-choices','Valinnat …',function(){nvChoiceEdit(V,c);});choices.setAttribute('aria-haspopup','dialog');}
    if(c.t==='pvm'){
      var cal=menuItem(m,'rvm-kal',(c.kal?'✓ ':'')+'Näytä kalenterissa',function(){nvSetColumnMod(V,c,'kal',!c.kal);});
      cal.setAttribute('role','menuitemcheckbox');cal.setAttribute('aria-checked',c.kal?'true':'false');
    }
  }
  anchoredMenu('sortpop',anchor);}
function nvHeadDrag(sort,cell,rz,V,c,list,hr){var key=nvKey(c);
  function take(e,t){if(nvGest||e.button!==0||e.isPrimary===false)return false;nvGest={id:e.pointerId};try{t.setPointerCapture(e.pointerId);}catch(x){}return true;}
  function ons(t,h){window.addEventListener('pointermove',h.mv);window.addEventListener('pointerup',h.up);window.addEventListener('pointercancel',h.cancel);t.addEventListener('lostpointercapture',h.cancel);document.addEventListener('keydown',h.esc,true);}
  function offs(t,h,id){window.removeEventListener('pointermove',h.mv);window.removeEventListener('pointerup',h.up);window.removeEventListener('pointercancel',h.cancel);t.removeEventListener('lostpointercapture',h.cancel);document.removeEventListener('keydown',h.esc,true);
    try{if(t.hasPointerCapture&&t.hasPointerCapture(id))t.releasePointerCapture(id);}catch(x){}nvGest=null;}
  function mute(ms){sort.dataset.nodrop='1';clearTimeout(sort._nd);sort._nd=setTimeout(function(){delete sort.dataset.nodrop;},ms||0);}
  rz.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();if(!take(e,rz))return;
    var id=e.pointerId,x0=e.clientX,lx=x0,w0=cell.getBoundingClientRect().width,i=Array.prototype.indexOf.call(hr.children,cell),cols0=getComputedStyle(hr).gridTemplateColumns.split(' '),
      tl=list.style.getPropertyValue('--rvcols'),w=null,raf=0,h={};rz.classList.add('on');
    function paint(){raf=0;w=Math.max(60,Math.min(700,Math.round(w0+lx-x0)));var cs=cols0.slice();cs[i]=w+'px';var t=cs.join(' ');list.style.setProperty('--rvcols',t);}
    function fin(ok){if(raf){cancelAnimationFrame(raf);raf=0;if(ok&&lx!==x0)paint();}offs(rz,h,id);rz.classList.remove('on');
      if(ok&&w!=null){var o=nvLayGet(V);o.w=o.w||{};o.w[key]=w;nvLaySet(V,o);if(nvTagObserver)nvTagObserver.fit();}else{list.style.setProperty('--rvcols',tl);}}
    h.mv=function(ev){if(ev.pointerId!==id)return;lx=ev.clientX;if(!raf)raf=requestAnimationFrame(paint);};
    h.up=function(ev){if(ev.pointerId===id)fin(true);};h.cancel=function(ev){if(ev.pointerId===id)fin(false);};
    h.esc=function(ev){if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();fin(false);}};ons(rz,h);});
  rz.addEventListener('dblclick',function(e){e.stopPropagation();nvFitColumn(V,c,list,hr,cell);});
  // Pitkän painalluksen vapautus voi muuten napauttaa juuri avattua valikkoa tai sen taustaa.
  sort.addEventListener('touchend',function(e){
    if(e.cancelable&&sort.dataset.nodrop&&popAnchor===sort&&!$('sortpop').hidden)e.preventDefault();
  },{passive:false});
  sort.addEventListener('contextmenu',function(e){e.preventDefault();if(nvGest)return;nvColMenu(V,c,list,hr,cell,sort);});
  sort.addEventListener('keydown',function(e){if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();nvColMenu(V,c,list,hr,cell,sort);}});
  sort.addEventListener('pointerdown',function(e){
    if(e.pointerType==='touch'){if(nvGest||e.isPrimary===false)return;nvGest={id:e.pointerId};
      var id=e.pointerId,x0=e.clientX,y0=e.clientY,mode='',h={},lp=setTimeout(function(){if(mode)return;mode='menu';mute(800);nvColMenu(V,c,list,hr,cell,sort);},550);
      function tfin(){clearTimeout(lp);window.removeEventListener('pointermove',h.mv);window.removeEventListener('pointerup',h.up);window.removeEventListener('pointercancel',h.up);nvGest=null;if(mode==='pan'||mode==='menu')mute(400);}
      h.mv=function(ev){if(ev.pointerId!==id)return;var dx=ev.clientX-x0,dy=ev.clientY-y0;
        if(!mode&&(Math.abs(dx)>8||Math.abs(dy)>8)){clearTimeout(lp);mode='pan';}};
      h.up=function(ev){if(ev.pointerId===id)tfin();};
      window.addEventListener('pointermove',h.mv);window.addEventListener('pointerup',h.up);window.addEventListener('pointercancel',h.up);return;}
    if(c.k==='otsikko'||!take(e,sort))return;
    var id=e.pointerId,x0=e.clientX,on=false,cells=Array.prototype.slice.call(hr.children),target=null,h={};
    function clear(){cell.classList.remove('rv-drag');cells.forEach(function(x){x.classList.remove('rv-drop');});}
    function fin(ok){offs(sort,h,id);clear();if(!on)return;mute();if(!ok||!target)return;
      var keys=nvHeadKeys(hr),from=keys.indexOf(key),to=keys.indexOf(target.dataset.k);nvHeadOrder(V,key,nvMove(keys,from,to));}
    h.mv=function(ev){if(ev.pointerId!==id)return;if(!on&&Math.abs(ev.clientX-x0)<8)return;on=true;cell.classList.add('rv-drag');target=null;
      cells.forEach(function(x){x.classList.remove('rv-drop');var r=x.getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<r.right&&x!==cell&&x.dataset.k&&x.querySelector('.rv-head-sort')&&!x.classList.contains('rvt')){target=x;x.classList.add('rv-drop');}});};
    h.up=function(ev){if(ev.pointerId===id)fin(true);};h.cancel=function(ev){if(ev.pointerId===id)fin(false);};
    h.esc=function(ev){if(ev.key==='Escape'&&on){ev.preventDefault();ev.stopPropagation();fin(false);}};ons(sort,h);});
  sort.addEventListener('click',function(e){if(sort.dataset.nodrop){e.stopImmediatePropagation();e.preventDefault();}},true);}
var nvAnchor=null;
function nvMultiClick(ev,n,L){if(ev.metaKey||ev.ctrlKey){ev.preventDefault();noteSelectionMode=true;noteSelectionProject=data.k;noteSelection.add(n.id);nvAnchor=n.id;render();return true;}
  if(ev.shiftKey&&nvAnchor){ev.preventDefault();noteSelectionMode=true;noteSelectionProject=data.k;nvRange(n,L);return true;}nvAnchor=n.id;return false;}
function nvRange(n,L){var ids=L.map(function(x){return x.id;}),a=ids.indexOf(nvAnchor),b=ids.indexOf(n.id);if(a<0||b<0)return;
  for(var i=Math.min(a,b);i<=Math.max(a,b);i++)noteSelection.add(ids[i]);render();}
/* Kaikki 0.59 (Emil 23.11.2026): osoitettaessa ei enää näytetä valintaruutua; ruudut vain Valitse-napin jälkeen (ei pomppimista). */
/* ---- Kaikki 0.33 (Emil 22.11.2026, A0.7): näkymämuokkain apissa. Näkymä-valikosta + Uusi näkymä ja Muokkaa: pieni ikkuna, jossa nimi,
   ehdot (kansio, tunniste, tyyppi, kuka kirjoitti, omat kentät; = ≠ > < sisältää; kaikkien pitää päteä), järjestys ja sarakkeet (päälle/pois,
   järjestys nuolilla, näyttötapa ja asetus). Muutokset tallentuvat, kun ikkuna suljetaan (ulkopuolinen napautus tai ‹); Peru muutokset hylkää.
   Kirjoittaa saman `nakymat/<tunnus>.md`-muodon kuin tekoäly (vaultin ohjeet/appi.md), joten näkymät ovat samoja tiedostoja. ---- */
var NV_STD=['tyyppi','otsikko','kuvaus','luotu','lahde','nakyy','juuri','tagit','takaisinlinkit','muokattu','mista','jarjestys','sarakkeet','leveydet','taulukko'];
var NV_OPS=[['=','on'],['!=','ei ole'],['~','sisältää'],['>','suurempi kuin'],['<','pienempi kuin'],['>=','vähintään'],['<=','enintään']];
var NV_LAJIT=[['','teksti'],['siru','siru'],['valinta','valinta'],['monivalinta','monivalinta'],['tila','tila'],['pvm','päivä'],['luku','luku'],['prosentti','prosentti'],['palkki','palkki'],['kylla-ei','kyllä/ei'],['minigraafi','minigraafi']];
var NV_SYSTEM_FIELDS=new Set(NV_STD.concat(Object.keys(NV_LAB),['kuitattu','toistuu','seuraava','paivitetty']));
function nvUserKey(key){return /^[a-z][a-z0-9_-]*$/.test(key)&&!NV_SYSTEM_FIELDS.has(key)&&
  !Object.prototype.hasOwnProperty.call(Object.prototype,key);}
function nvAddField(host,draft,dialog){
  var area=el('div','nved-add-field'),label=el('label','','Kentän nimi'),row=el('div','nved-row');
  var input=el('input'),msg=el('p','sub');
  input.id='nved-new-field';input.type='text';input.maxLength=70;input.autocomplete='off';
  label.htmlFor=input.id;input.setAttribute('aria-describedby','nved-field-error');
  msg.id='nved-field-error';msg.setAttribute('role','status');msg.hidden=true;
  function add(){
    var key=input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_');
    if(!nvUserKey(key)||draft.cols.some(function(c){return c.k===key;})){
      msg.textContent=nvUserKey(key)?'Kenttä on jo tässä näkymässä.':'Aloita kirjaimella. Käytä kentän nimessä kirjaimia, numeroita, viivaa tai alaviivaa.';
      msg.hidden=false;input.setAttribute('aria-invalid','true');input.focus();return;
    }
    draft.cols.push({k:key,t:'',o:'',w:0});nvRenderEd();
    var col=Array.from(dialog.querySelectorAll('.nved-col')).find(function(item){return item.dataset.k===key;});
    if(col){(col.querySelector('select')||col.querySelector('input')).focus();col.scrollIntoView({block:'nearest'});}
  }
  input.addEventListener('input',function(){msg.hidden=true;input.removeAttribute('aria-invalid');});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229){e.preventDefault();add();}});
  row.appendChild(input);button(row,'Lisää kenttä','mini',add);area.append(label,row,msg);host.appendChild(area);
}
/* Kaikki 0.63: näkymän kenttä tallentuu muistiinpanoon ja esitystapa jää näkymään. */
function nvAddVariable(dialog,draft,variables){
  var area=el('div','nved-add-field'),label=el('label','','Tekstimuuttuja'),row=el('div','nved-row');
  var input=el('input'),names=el('datalist'),msg=el('p','sub');
  label.htmlFor=input.id='nved-variable';input.type='text';input.autocomplete='off';
  names.id='nved-variable-names';input.setAttribute('list',names.id);input.setAttribute('aria-describedby','nved-variable-error');
  variables.forEach(function(variable){var option=el('option');option.value=variable.nimi;names.appendChild(option);});
  msg.id='nved-variable-error';msg.setAttribute('role','status');msg.hidden=true;
  function add(){
    var name=nvValidVariable(input.value),id=MUUTTUJA.key(name);
    var exists=name&&draft.cols.some(function(col){return MUUTTUJA.key(nvVariableName(col.k))===id;});
    if(!name||exists){
      msg.textContent=name?'Muuttuja on jo tässä näkymässä.':'Anna muuttujan nimi ilman kaksoispistettä tai huutomerkkejä alussa.';
      msg.hidden=false;input.setAttribute('aria-invalid','true');input.focus();return;
    }
    var match=variables.find(function(variable){return variable.key===id;});
    var key=nvVariableColumn(match?match.nimi:name);
    draft.cols.push({k:key,t:'',o:'',w:0});nvRenderEd();
    var col=Array.from(dialog.querySelectorAll('.nved-col')).find(function(item){return item.dataset.k===key;});
    if(col)(col.querySelector('select')||col.querySelector('input')).focus();
  }
  input.addEventListener('input',function(){msg.hidden=true;input.removeAttribute('aria-invalid');});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing&&e.keyCode!==229){e.preventDefault();add();}});
  row.append(input,button(row,'Lisää muuttuja','mini',add));area.append(label,row,names,msg);dialog.appendChild(area);
}
function nvCanEditNote(note){
  return vOn()&&vK()&&vK().id===data.k&&note.vp&&!note.arch&&VAULT.visible(note.vp)&&
    !note.vp.startsWith('nakymat/')&&VAULT.kindOf(note.vp,note.vfm)!=='ohje';
}
function nvEditable(column,note){
  var name=nvVariableName(column.k);
  if(name)return column.t!=='minigraafi';
  return nvUserKey(column.k)&&column.t!=='minigraafi'&&VAULT.fmGet(note.vfm,column.k).charAt(0)!=='=';
}
var nvInline=null;
function nvBindCell(cell,note,column,allowed,viewPath,index){
  var value=cell.getAttribute('aria-label')||cell.textContent;
  cell.classList.add('rv-editable');
  var contents=Array.from(cell.childNodes);
  var edit=button(cell,'','rv-value',function(event){
    if(event.metaKey||event.ctrlKey||event.shiftKey)return;
    event.stopPropagation();nvOpenCell(note,column,allowed,edit,viewPath,wide()&&event.pointerType!=='touch');
  });
  if(contents.length)edit.append.apply(edit,contents);
  else{var empty=el('span','rv-value-empty','–');empty.setAttribute('aria-hidden','true');edit.appendChild(empty);}
  edit.dataset.field=column.k;edit.dataset.column=String(index);
  edit.setAttribute('aria-label',nvFieldLabel(column.k)+' · '+(noteTitle(note)||'Nimetön')+' · '+(value||'Tyhjä'));
  if(!wide())edit.setAttribute('aria-haspopup','dialog');
  edit.addEventListener('keydown',function(event){
    if(!wide()||event.isComposing||event.keyCode===229)return;
    var printable=Array.from(event.key).length===1&&
      (!(event.altKey||event.ctrlKey||event.metaKey)||event.getModifierState('AltGraph'));
    if(!printable&&event.key!=='F2')return;
    event.preventDefault();event.stopPropagation();
    nvOpenCell(note,column,allowed,edit,viewPath,true,printable?event.key:null); // F2 = tekstikenttä (myös päiväsarakkeessa)
  });
  if(wide()){
    var fill=el('span','rv-fill');fill.setAttribute('aria-hidden','true');fill.title='Vedä alas: sama arvo alempiin riveihin';cell.appendChild(fill);
    fill.addEventListener('pointerdown',function(event){nvFillDrag(event,fill,cell,note,column,allowed,viewPath,index);});
    fill.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();});
  }
  if(nvInline&&nvInline.id===note.id&&nvInline.key===column.k&&nvInline.column===edit.dataset.column&&
     nvInline.view===viewPath&&nvInline.repo===vRepo()&&nvInline.branch===G.branch)nvInline.attach(edit);
}
function nvObservedField(text,name,created){
  var doc=VAULT.split(text),offset=text.length-doc.body.length;
  var observations=MUUTTUJA.parse(doc.body,created),hit=nvLatestObservation(observations,name);
  if(nvObservationTie(observations,hit)>1)return null;
  function signature(o){return JSON.stringify([doc.body.slice(o.s,o.vs),doc.body.slice(o.ve,o.e),o.paivat]);}
  var shape=hit&&signature(hit);
  var target=hit&&JSON.stringify([shape,observations.filter(function(o){return o.key===hit.key&&o.s<=hit.s&&signature(o)===shape;}).length]);
  return {where:'muuttuja',target:target,value:hit?(hit.cellValue??hit.arvo):'',write:function(value){
    if(hit){
      var from=offset+(value?hit.vs:hit.s),to=offset+(value?hit.ve:hit.e);
      if(hit.block){
        if(!value&&hit.block.fields.length>1){from=offset+hit.removeFrom;to=offset+hit.removeTo;}
        if(value&&hit.unit&&MUUTTUJA.num(value)!==null)value+=' '+hit.unit;
        value=value?MUUTTUJA.fieldText(value,hit.literal,hit.block.syntax):'';
      }
      return text.slice(0,from)+value+text.slice(to);
    }
    if(!value)return text;
    var mark=MUUTTUJA.format(name,value);
    if(!mark)return {error:'Tarkista muuttujan nimi ja arvo.'};
    var addition='\n'+mark+'\n',prefix=text.endsWith('\n')?'':'\n';
    if(!MUUTTUJA.parse(doc.body+prefix+addition,created).some(function(o){return o.s>=doc.body.length&&mvDefinition('variables',o.nimi).key===mvDefinition('variables',name).key&&o.arvo===value;})){
      return {error:'Muuttujamerkintää ei voitu lisätä. Tarkista muistiinpanon lopussa olevat koodimerkit.'};
    }
    return text+prefix+addition;
  }};
}
function nvNoteField(text,key,allowed,created){
  if(!text||/^---\r\n/.test(text))return null;
  var name=nvVariableName(key);if(name)return nvObservedField(text,name,created);
  var doc=VAULT.split(text),fm=doc.fm||[],matches=[];
  fm.forEach(function(line,index){
    var m=/^([A-Za-z][A-Za-z0-9_-]*):([ \t]*)(.*)$/.exec(line);
    if(m&&m[1].toLowerCase()===key)matches.push({index:index,value:m[3].trim(),prefix:key+':'+(m[2]||' ')});
  });
  var rows=allowed.has(key)?KAAVA.bodyFields(doc.body,new Set([key])).filter(function(field){return !field.timed;}):[];
  if(matches.length+rows.length>1)return null;
  var head=matches[0],body=rows[0];
  if(head&&(/^[|>](?:[0-9+\-]*)$/.test(head.value)||(!head.value&&/^\s+\S/.test(fm[head.index+1]||''))))return null;
  if(body)return {where:'body',value:body.value.trim(),write:function(value){
    var lines=doc.body.match(/[^\r\n]*(?:\r\n|\n|$)/g),line=lines[body.index];
    if(value){
      var prefix=/^[ \t]*[A-Za-z][A-Za-z0-9_-]*:[ \t]*/.exec(line)[0],end=/\r?\n$/.exec(line);
      lines[body.index]=prefix+(prefix.endsWith(':')?' ':'')+value+(end?end[0]:'');
    }else lines.splice(body.index,1);
    return text.slice(0,text.length-doc.body.length)+lines.join('');
  }};
  return {where:'field',value:head?head.value:'',write:function(value){
    var lines=fm.slice();
    if(head){if(value)lines[head.index]=head.prefix+value;else lines.splice(head.index,1);}
    else if(value)lines.push(key+': '+value);
    return lines.length?'---\n'+lines.join('\n')+'\n---\n'+doc.body:doc.fm?'---\n\n---\n'+doc.body:doc.body;
  }};
}
function nvCellInput(column,value,inline){
  var field;
  if(column.t==='kylla-ei'){
    field=el('select');
    [['','Tyhjä'],['kylla','Kyllä'],['ei','Ei']].forEach(function(pair){
      var option=el('option','',pair[1]);option.value=pair[0];field.appendChild(option);
    });
    if(/^(kylla|kyllä|1|true|on)$/i.test(value))value='kylla';
    else if(/^(ei|0|false|off)$/i.test(value))value='ei';
    else if(value){var old=el('option','',value);old.value=value;field.appendChild(old);}
  }else{
    field=el('input');field.autocomplete='off';
    field.type=!inline&&column.t==='pvm'&&(!value||nvIsoField(value))?'date':'text';
    if(inline&&column.t==='pvm')field.placeholder='VVVV-KK-PP';
    if(['luku','prosentti','palkki'].includes(column.t))field.inputMode='decimal';
    field.enterKeyHint='done';
  }
  field.value=value;return field;
}
function nvIsoField(value){
  return /^\d{4}-\d{2}-\d{2}$/.test(value)&&dashDay(value)&&isoD(fromIso(value))===value;
}
/* 0.82: päiväsarakkeen arvo on yksi tai useampi päivä muodossa 2026-11-30, 2026-12-02 (järjestetty, ei toistoja). */
function nvIsoList(value){
  var parts=String(value||'').split(',').map(function(part){return part.trim();}).filter(Boolean);
  return parts.length&&parts.every(nvIsoField)?Array.from(new Set(parts)).sort():null;
}
function nvDayShort(iso){var d=fromIso(iso);return WDS[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1)+'.'+(d.getFullYear()!==new Date().getFullYear()?d.getFullYear():'');}
/* ---- Kaikki 0.83 (jäsennys A3.5, suunnitelman kohta 21.6): valinta, monivalinta ja tila.
   Sarakkeen asetus on valintalista Emilin järjestyksessä: `Idea:sininen, Työn alla:keltainen`. Tilassa kolme ryhmää vinoviivalla
   (ei aloitettu / kesken / valmis): `Ei aloitettu / Kesken, Odottaa / Valmis`; tyhjä asetus = nämä kolme. Arvo: `vaihe: Idea`,
   monivalinta `aiheet: [a, b]` (kuten tagit), tekstimuuttujassa samoin `!!Aiheet: [a, b]!!`. Tuntematon arvo näkyy harmaana
   katkoviivasiruna. Sirut ovat huurretta: läpikuultava värisävy, valoreuna ja hento reunus (Emil 24.11.). ---- */
var NV_CHOICE=['valinta','monivalinta','tila'];
var NV_COLORS=[['harmaa','#8a8f98'],['ruskea','#a0714f'],['oranssi','#dd8a2e'],['keltainen','#c9a227'],['vihreä','#3f9b6a'],
  ['sininen','#3b7dd8'],['violetti','#8a63d2'],['pinkki','#d0609a'],['punainen','#d1493f']];
var NV_TILA=[['Ei aloitettu','harmaa'],['Kesken','sininen'],['Valmis','vihreä']];
var nvChoiceCache=new WeakMap();
function nvColorHex(name){var x=NV_COLORS.find(function(c){return c[0]===name;});return x?x[1]:NV_COLORS[0][1];}
function nvChoiceName(text){
  var t=String(text||'').trim();
  if(/^".*"$/.test(t))try{return JSON.parse(t).trim();}catch(e){}
  return t;
}
function nvChoiceParse(c){
  var text=String(c.o||'').trim(),tila=c.t==='tila',out=[],seen=new Set(),k=0;
  if(tila&&!text)text=NV_TILA.map(function(g){return g[0];}).join(' / ');
  (tila?viewColumnParts(text,'/').slice(0,3):[text]).forEach(function(part,g){
    viewColumnParts(part,',').forEach(function(item){
      var raw=item.trim(),color='',cut=raw.lastIndexOf(':');
      if(cut>0&&NV_COLORS.some(function(x){return x[0]===raw.slice(cut+1).trim().toLowerCase();})){color=raw.slice(cut+1).trim().toLowerCase();raw=raw.slice(0,cut);}
      var name=nvChoiceName(raw),key=name.toLocaleLowerCase('fi');
      if(!name||seen.has(key))return;
      seen.add(key);out.push({n:name,v:color,g:tila?g:0});
    });
  });
  out.forEach(function(x,i){x.i=i;if(!x.v)x.v=tila?NV_TILA[x.g][1]:NV_COLORS[1+(k++)%(NV_COLORS.length-1)][0];});
  return out;
}
function nvChoiceOpts(c){var hit=nvChoiceCache.get(c);if(!hit||hit.o!==c.o||hit.t!==c.t){hit={o:c.o,t:c.t,list:nvChoiceParse(c)};nvChoiceCache.set(c,hit);}return hit.list;}
function nvChoiceFind(opts,name){var key=String(name||'').trim().toLocaleLowerCase('fi');return opts.find(function(x){return x.n.toLocaleLowerCase('fi')===key;})||null;}
function nvChoiceQuote(name){return /[,/:"\[\]|]/.test(name)?JSON.stringify(name):name;}
function nvChoiceText(list,tila){
  function one(x){return nvChoiceQuote(x.n)+':'+x.v;}
  if(!tila)return list.map(one).join(', ');
  return [0,1,2].map(function(g){return list.filter(function(x){return x.g===g;}).map(one).join(', ');}).join(' / ');
}
function nvMultiValues(value){
  var text=String(value||'').trim().replace(/^\[([\s\S]*)\]$/,'$1');
  return text?viewColumnParts(text,',').map(nvChoiceName).filter(Boolean):[];
}
function nvMultiText(list){return list.length?'['+list.map(nvChoiceQuote).join(', ')+']':'';}
function nvChoiceNorm(column,value){return column.t==='monivalinta'?nvMultiText(nvMultiValues(value)):String(value||'').trim();}
function nvChoiceChip(opts,name,cls){
  var hit=nvChoiceFind(opts,name),chip=el('span','rv-opt'+(hit?'':' rv-opt-unknown')+(cls?' '+cls:''),hit?hit.n:name);
  if(hit)chip.style.setProperty('--oc',nvColorHex(hit.v));
  return chip;
}
function nvChoiceCell(td,c,v){
  var opts=nvChoiceOpts(c),values=c.t==='monivalinta'?nvMultiValues(v):[String(v).trim()].filter(Boolean);
  td.classList.add('rv-chips');
  values.forEach(function(name){td.appendChild(nvChoiceChip(opts,name));});
  td.setAttribute('aria-label',values.join(', '));
}
/* Napautus avaa listan: valinnassa ja tilassa valinta tallentaa heti, monivalinnassa ruksit ja Valmis tai ulkopuolinen napautus.
   Uusi nimi lisätään myös sarakkeen valintalistaan (näkymätiedostoon), kun näkymää saa muokata. */
function nvChoiceSheet(o){
  var d=$('nvchoice');
  if(!d){d=el('dialog','nved');d.id='nvchoice';d.setAttribute('aria-labelledby','nvchoice-title');SMALL[d.id]=1;document.body.appendChild(d);
    d.addEventListener('click',function(e){if(e.target===d)closeSheet(d);});}
  var column=o.column,multi=column.t==='monivalinta',opts=nvChoiceOpts(column).map(function(x){return Object.assign({},x);}),added=[];
  var chosen=multi?nvMultiValues(o.value):[String(o.value||'').trim()].filter(Boolean);
  var heading=el('h2','',nvFieldLabel(column.k)),caption=el('p','sub',o.caption);heading.id='nvchoice-title';caption.id='nvchoice-note';
  var list=el('div','nvch-list');list.id='nvchoice-list';list.setAttribute('role','group');list.setAttribute('aria-labelledby',heading.id);
  var addRow=el('form','nved-row nvch-add'),input=el('input'),addLabel=el('label','vh',multi?'Uusi valinta':'Uusi valinta');
  input.id='nvchoice-new';input.type='text';input.autocomplete='off';input.maxLength=60;input.placeholder='Uusi valinta';addLabel.htmlFor=input.id;
  var msg=el('p','sub');msg.id='nvchoice-error';msg.setAttribute('aria-live','polite');
  var foot=el('div','nved-foot');
  function has(name){return chosen.some(function(x){return x.toLocaleLowerCase('fi')===name.toLocaleLowerCase('fi');});}
  function value(){
    if(!multi)return chosen[0]||'';
    var ordered=opts.filter(function(x){return has(x.n);}).map(function(x){return x.n;});
    chosen.forEach(function(x){if(!nvChoiceFind(opts,x))ordered.push(x);});
    return nvMultiText(ordered);
  }
  function paint(focus){
    list.textContent='';
    var extra=chosen.filter(function(x){return !nvChoiceFind(opts,x);}).map(function(x){return {n:x,unknown:true};});
    opts.concat(extra).forEach(function(x){
      var on=has(x.n),b=button(list,'','nvch-opt'+(on?' on':''),function(){
        if(multi){chosen=on?chosen.filter(function(y){return y.toLocaleLowerCase('fi')!==x.n.toLocaleLowerCase('fi');}):chosen.concat([x.n]);paint(x.n);}
        else{chosen=[x.n];closeSheet(d);}
      });
      b.dataset.name=x.n;b.setAttribute(multi?'aria-pressed':'aria-current',on?'true':'false');
      if(multi){var box=el('span','nvch-box');box.setAttribute('aria-hidden','true');box.textContent=on?'✓':'';b.appendChild(box);}
      b.appendChild(nvChoiceChip(opts,x.n));
      if(column.t==='tila'&&!x.unknown&&x.n.toLocaleLowerCase('fi')!==NV_TILA[x.g][0].toLocaleLowerCase('fi'))b.appendChild(el('small','',NV_TILA[x.g][0]));
      if(!multi&&on){var check=el('span','nvch-check','✓');check.setAttribute('aria-hidden','true');b.appendChild(check);}
      if(focus===x.n)requestAnimationFrame(function(){b.focus();});
    });
  }
  addRow.addEventListener('submit',function(e){
    e.preventDefault();
    var name=nvChoiceName(input.value);
    if(!name||/[|\[\]]/.test(name)||name.includes('!!')){msg.textContent='Anna nimi ilman pystyviivaa, hakasulkeita tai kahta huutomerkkiä.';input.setAttribute('aria-invalid','true');return;}
    var hit=nvChoiceFind(opts,name);
    if(!hit){hit={n:name,v:NV_COLORS[1+opts.filter(function(x){return x.g===(column.t==='tila'?1:0);}).length%(NV_COLORS.length-1)][0],g:column.t==='tila'?1:0};
      if(column.t==='tila')hit.v=NV_TILA[1][1];opts.push(hit);added.push(hit);}
    input.value='';msg.textContent='';input.removeAttribute('aria-invalid');
    if(multi){if(!has(hit.n))chosen.push(hit.n);paint(hit.n);}else{chosen=[hit.n];closeSheet(d);}
  });
  input.addEventListener('input',function(){msg.textContent='';input.removeAttribute('aria-invalid');});
  var addButton=el('button','mini','Lisää');addButton.type='submit';addRow.append(addLabel,input,addButton);
  button(foot,'Tyhjennä','btn',function(){chosen=[];if(multi)paint();else closeSheet(d);});
  if(o.edit)button(foot,'Muokkaa valintoja','btn',function(){chosen=null;closeSheet(d);o.edit();});
  if(multi){var done=button(foot,'Valmis','btn primary',function(){closeSheet(d);});done.id='nvchoice-done';}
  d.replaceChildren(heading,caption,list,addRow,msg,foot);paint();
  d.addEventListener('close',function(){
    if(chosen===null){o.done(null,[]);return;}
    o.done(value(),added.map(function(x){return x;}));
  },{once:true});
  openSheet(d);
  var current=list.querySelector('[aria-pressed="true"],[aria-current="true"]')||list.querySelector('button')||input;
  current.focus();
}
/* Sarakkeen valintalistan muokkaus: nimi, väri, tilassa ryhmä, järjestys ja poisto. Tallennus näkymätiedostoon kaikille laitteille. */
function nvChoiceEdit(V,c){
  if(!nvCanCalc(V))return;
  var d=$('nvchoice-edit');
  if(!d){d=el('dialog','nved');d.id='nvchoice-edit';d.setAttribute('aria-labelledby','nvchoice-edit-title');SMALL[d.id]=1;document.body.appendChild(d);}
  var tila=c.t==='tila',list=nvChoiceOpts(c).map(function(x){return {n:x.n,v:x.v,g:x.g};}),save=false;
  var heading=el('h2','','Valinnat · '+nvFieldLabel(c.k));heading.id='nvchoice-edit-title';
  var rows=el('div','nvch-rows');rows.id='nvchoice-rows';
  var msg=el('p','sub');msg.id='nvchoice-edit-error';msg.setAttribute('aria-live','polite');
  function paint(focusIndex,focusLabel){
    rows.textContent='';
    list.forEach(function(x,i){
      var r=el('div','nved-row nvch-row'),name=el('input'),color=el('select');
      name.type='text';name.value=x.n;name.maxLength=60;name.setAttribute('aria-label','Valinnan nimi '+(i+1));name.addEventListener('input',function(){x.n=name.value;});
      color.setAttribute('aria-label','Väri: '+(x.n||'valinta '+(i+1)));
      NV_COLORS.forEach(function(cc){var op=el('option','',cc[0]);op.value=cc[0];color.appendChild(op);});color.value=x.v;
      var dot=el('span','rv-opt nvch-dot','');dot.style.setProperty('--oc',nvColorHex(x.v));dot.setAttribute('aria-hidden','true');
      color.addEventListener('change',function(){x.v=color.value;dot.style.setProperty('--oc',nvColorHex(x.v));});
      r.append(dot,name,color);
      if(tila){var g=el('select');g.setAttribute('aria-label','Ryhmä: '+(x.n||'valinta '+(i+1)));NV_TILA.forEach(function(t,j){var op=el('option','',t[0]);op.value=String(j);g.appendChild(op);});
        g.value=String(x.g);g.addEventListener('change',function(){x.g=+g.value;});r.appendChild(g);}
      var up=button(r,'↑','mini nved-mv',function(){if(i>0){nvMove(list,i,i-1);paint(i-1,'Siirrä ylös');}});up.setAttribute('aria-label','Siirrä ylös');up.disabled=i===0;
      var dn=button(r,'↓','mini nved-mv',function(){if(i<list.length-1){nvMove(list,i,i+1);paint(i+1,'Siirrä alas');}});dn.setAttribute('aria-label','Siirrä alas');dn.disabled=i===list.length-1;
      var x2=button(r,'×','mini nved-x',function(){list.splice(i,1);paint(Math.min(i,list.length-1),'Valinnan nimi');});x2.setAttribute('aria-label','Poista valinta '+(x.n||i+1));
      rows.appendChild(r);
      if(i===focusIndex)requestAnimationFrame(function(){var t=Array.from(r.querySelectorAll('input,button,select')).find(function(el2){return (el2.getAttribute('aria-label')||'').startsWith(focusLabel)&&!el2.disabled;})||name;t.focus();});
    });
  }
  var add=button(el('div'),'+ Lisää valinta','mini',function(){list.push({n:'',v:tila?NV_TILA[1][1]:NV_COLORS[1+list.length%(NV_COLORS.length-1)][0],g:tila?1:0});paint(list.length-1,'Valinnan nimi');});
  add.id='nvchoice-edit-add';
  var foot=el('div','nved-foot');button(foot,'Peru','btn',function(){closeSheet(d);});
  var ok=button(foot,'Tallenna','btn primary',function(){
    var names=new Set(),clean=[];
    for(var x of list){var n=nvChoiceName(x.n);if(!n)continue;
      if(/[|\[\]]/.test(n)||n.includes('!!')){msg.textContent='Nimessä ei voi olla pystyviivaa, hakasulkeita tai kahta huutomerkkiä.';return;}
      var k=n.toLocaleLowerCase('fi');if(names.has(k)){msg.textContent='Valinta “'+n+'” on kahdesti.';return;}names.add(k);clean.push({n:n,v:x.v,g:x.g});}
    save=clean;closeSheet(d);
  });ok.id='nvchoice-edit-save';
  d.replaceChildren(heading,el('p','sub','Järjestys on sama kuin listassa. Nimen vaihto ei muuta muistiinpanoihin jo tallennettuja arvoja.'),rows,add,msg,foot);
  paint(0,'Valinnan nimi');
  d.addEventListener('close',function(){if(save)nvSetColumnMod(V,c,'o',nvChoiceText(save,tila));},{once:true});
  openSheet(d);
}
function nvDateCell(td,value){
  var list=nvIsoList(value);
  if(!list){td.textContent=value;return;}
  td.appendChild(el('span','',nvDayShort(list[0])));
  if(list.length>1){var more=el('span','rvchip rv-more','+'+(list.length-1));more.setAttribute('aria-hidden','true');td.appendChild(more);}
  td.setAttribute('aria-label',list.map(function(iso){return WD[fromIso(iso).getDay()]+' '+fiDate(iso);}).join(', '));
  td.title=list.map(nvDayShort).join(', ');
}
function nvCellPlace(button){
  return button&&{id:button.closest('.rvr').dataset.id,key:button.dataset.field,column:button.dataset.column};
}
function nvCellFind(place){
  if(!place)return null;
  var rows=document.querySelectorAll('#nlist .rvr:not([hidden])');
  var row=Array.from(rows).find(function(item){return item.dataset.id===place.id;});
  if(!row)return null;
  var cells=Array.from(row.querySelectorAll('.rv-value')).filter(function(item){return item.dataset.field===place.key;});
  return cells.find(function(item){return item.dataset.column===place.column;})||cells[0]||null;
}
function nvCellStep(anchor,direction){
  var cells=Array.from(document.querySelectorAll('#nlist .rvr:not([hidden]) .rv-value'));
  var index=cells.indexOf(anchor);return index<0?null:nvCellPlace(cells[index+direction]);
}
function nvHiddenDraft(){
  var b=$('nvcell-hidden-draft'),hidden=nvInline&&
    (!nvInline.form.isConnected||!!nvInline.form.closest('.rvr[hidden]'));
  if(!hidden){if(b)b.remove();return;}
  if(!b){
    var bar=panels.notes.querySelector('.rvbar');
    if(bar){b=button(bar,'Peru solumuutos','mini',function(){if(nvInline&&!nvInline.busy)nvInline.close(false);nvHiddenDraft();});b.id='nvcell-hidden-draft';}
  }
  if(b)b.disabled=nvInline.busy;
}
function nvCellError(column,variable,value){
  if(variable&&value.includes('!!'))return 'Arvon sisällä ei voi käyttää kahta huutomerkkiä.';
  if(!variable&&value.startsWith('='))return 'Anna arvo ilman yhtäsuuruusmerkkiä.';
  if(!value)return '';
  if(['luku','prosentti','palkki'].includes(column.t)&&
    (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(value)||dashNum(value)===null))return 'Anna luku, esimerkiksi 8 tai 7,5.';
  if(column.t==='pvm'&&!nvIsoList(value))return 'Anna päivämäärä muodossa VVVV-KK-PP. Erota useampi päivä pilkulla.';
  return '';
}
function nvOpenCell(note,column,allowed,anchor,viewPath,inline,first){
  if(tab!=='notes'||viewPath!==noteViewPath(nvCur())||viewLocked(viewPath)||!nvCanEditNote(note)||!nvEditable(column,note))return;
  var place=nvCellPlace(anchor),path=note.vp,repo=vRepo(),branch=G.branch,key=column.k;
  if(nvInline){
    if(nvInline.id===place.id&&nvInline.key===key&&nvInline.view===viewPath&&nvInline.repo===repo&&nvInline.branch===branch){
      nvInline.attach(anchor);nvInline.input.focus({preventScroll:true});return;
    }
    if(nvInline.changed()){
      toast('Tallenna tai peru keskeneräinen solumuutos ensin.');
      if(nvInline.input.isConnected)nvInline.input.focus({preventScroll:true});
      return;
    }
    nvInline.close(false);
  }
  if(!VC.files[path]){toast('Tallenna muistiinpano Vaultiin ensin.');return;}
  var variable=nvVariableName(key),base=nvNoteField(VC.files[path].t,key,allowed,note.created);
  if(!base||!variable&&base.value.startsWith('=')){toast('Kenttä avataan muokattavaksi muistiinpanon Tiedoista.');return;}
  var form=el('form',inline?'rv-cell-inline':''),input=nvCellInput(column,base.value,inline),initial=input.value;
  var msg=el('p'),actions=el('div','nved-foot'),d=null,busy=false,conflict=null,shownError=false;
  var state={...place,view:viewPath,repo:repo,branch:branch,form:form,input:input,attach:attach,close:finish,
    get busy(){return busy;},changed:function(){return busy||!!conflict||input.value!==initial;}};
  form.id='nvcell-form';input.id='nvcell-input';input.setAttribute('aria-describedby','nvcell-error');
  msg.id='nvcell-error';msg.setAttribute('aria-live','polite');
  var label=el('label',inline?'vh':'',inline?nvFieldLabel(key)+' · '+(noteTitle(note)||'Nimetön'):'Arvo');label.htmlFor=input.id;
  var cancel=button(actions,inline?'×':'Peru','btn',function(){finish(true);});
  if(inline)cancel.setAttribute('aria-label','Peru');
  var saveButton=el('button','btn primary',inline?'✓':'Tallenna');saveButton.type='submit';actions.appendChild(saveButton);
  if(inline)saveButton.setAttribute('aria-label','Tallenna');
  form.append(label,input,msg,actions);
  function attach(nextAnchor){
    if(anchor!==nextAnchor)anchor.hidden=false;
    anchor=nextAnchor;state.column=anchor.dataset.column;anchor.hidden=true;
    anchor.parentElement.appendChild(form);
  }
  function finish(refocus,next){
    if(inline){if(nvInline===state)nvInline=null;form.remove();anchor.hidden=false;}
    else if(d&&d.open){closeSheet(d);d.replaceChildren();}
    if(refocus)requestAnimationFrame(function(){
      if(tab!=='notes'||viewPath!==noteViewPath(nvCur()))return;
      var target=nvCellFind(next)||nvCellFind(state)||$('nlist');
      if(target)target.focus({preventScroll:!next});
    });
  }
  function showError(error,confirm){
    shownError=true;msg.textContent=error;
    saveButton.textContent=confirm?'Korvaa arvo':inline?'✓':'Tallenna';
    saveButton.toggleAttribute('data-conflict',!!confirm);
    if(inline)saveButton.setAttribute('aria-label',confirm?'Korvaa arvo':'Tallenna');
    if(form.isConnected)input.focus({preventScroll:true});
  }
  async function save(explicit,direction){
    if(busy)return;
    if(conflict&&!explicit){saveButton.focus({preventScroll:true});return;}
    if(!vOn()||vRepo()!==repo||G.branch!==branch){showError('Vault vaihtui. Avaa solu uudelleen.');return;}
    if(viewLocked(viewPath)){showError(VIEW_LOCKED);return;}
    var value=input.value.trim(),next=direction?nvCellStep(anchor,direction):null;
    if(column.t==='pvm'&&nvIsoList(value))value=nvIsoList(value).join(', ');
    if(value===initial&&!conflict){finish(true,next);return;}
    var error=nvCellError(column,variable,value);
    if(error){input.setAttribute('aria-invalid','true');showError(error,conflict);return;}
    if(vBusy){showError('Tallennus on käynnissä. Yritä hetken päästä uudelleen.',conflict);return;}
    vBusy=busy=true;saveButton.disabled=cancel.disabled=input.disabled=true;msg.textContent='Tallennetaan…';vRender();
    var list=$('nlist'),outer=activeScroller(),top=outer.scrollTop,left=list?list.scrollLeft:0;
    var failure='';
    try{
      var nextConflict=null,expected=conflict||base;
      var result=await vWriteText(path,function(text){
        if(viewLocked(viewPath))return {error:VIEW_LOCKED};
        var now=nvNoteField(text,key,allowed,variable?VAULT.noteOf(path,text).created:note.created);
        if(!now)return {error:'Kenttä on muuttunut tai esiintyy useasti. Tarkista muistiinpano.'};
        if(now.value===value)return text;
        if(now.value!==expected.value||now.where!==expected.where||now.target!==expected.target){
          nextConflict=now;return {error:'Kentän arvo on muuttunut toisaalla.'};
        }
        return now.write(value);
      },'appi: muistiinpanon kenttä '+key,{repo:repo,branch:branch});
      if(vRepo()!==repo||G.branch!==branch){failure='Vault vaihtui. Avaa solu uudelleen.';return;}
      if(result.file){VC.files[path]=result.file;vSaveC();vApply();}
      if(result.error){
        if(nextConflict)conflict=nextConflict;
        failure=result.error+(nextConflict?' Tallennettu arvo: '+(nextConflict.value||'tyhjä')+'.':'');return;
      }
      vAt=vClock();vMsg='';
      if(tab==='notes'&&viewPath===noteViewPath(nvCur())){
        activeScroller().scrollTop=top;var updated=$('nlist');if(updated)updated.scrollLeft=left;
      }
      finish(true,next);
    }catch(error){failure='Tallennus keskeytyi. Yritä uudelleen.';}
    finally{
      busy=vBusy=false;saveButton.disabled=cancel.disabled=input.disabled=false;
      if(failure)showError(failure,conflict);
      nvHiddenDraft();vRender();vFlush();
    }
  }
  form.addEventListener('click',function(event){event.stopPropagation();});
  form.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&!event.isComposing&&event.keyCode!==229){
      event.preventDefault();event.stopPropagation();if(!busy)finish(true);return;
    }
    if(event.target!==input||event.isComposing||event.keyCode===229){
      if(event.key==='Enter'&&(event.isComposing||event.keyCode===229))event.preventDefault();
      return;
    }
    if(event.key==='Enter'||inline&&event.key==='Tab'&&!conflict){
      event.preventDefault();event.stopPropagation();
      save(false,event.key==='Tab'?(event.shiftKey?-1:1):0);
    }
  });
  input.addEventListener('input',function(){if(!conflict)msg.textContent='';input.removeAttribute('aria-invalid');});
  form.addEventListener('submit',function(event){event.preventDefault();save(true,0);});
  if(inline&&first!=null){
    if(input.tagName==='SELECT'){
      var option=Array.from(input.options).find(function(x){return x.textContent.toLocaleLowerCase('fi').startsWith(first.toLocaleLowerCase('fi'));});
      if(option)input.value=option.value;
    }else input.value=first;
  }
  function show(){
    if(inline){
      if(!anchor.isConnected){var again=nvCellFind(state);if(!again){toast('Solu ei ole enää näkyvissä. Avaa se uudelleen.');return;}anchor=again;}
      nvInline=state;attach(anchor);
    }else{
      d=$('nvcell-edit');
      if(!d){d=el('dialog','nved');d.id='nvcell-edit';d.setAttribute('aria-labelledby','nvcell-title');SMALL[d.id]=1;document.body.appendChild(d);}
      var heading=el('h2','',nvFieldLabel(key)),caption=el('p','',noteTitle(note)||'Nimetön');
      heading.id='nvcell-title';caption.id='nvcell-note';form.setAttribute('aria-labelledby',heading.id);
      d.replaceChildren(heading,caption,form);
      d.onclick=function(event){if(event.target===d&&!busy)finish(true);};
      d.oncancel=function(event){event.preventDefault();if(!busy)finish(true);};
      openSheet(d);
    }
    input.focus({preventScroll:true});
  }
  /* 0.82 (suunnitelman kohta 21.5): päiväsarakkeen napautus avaa kuukausivalitsimen. Yksi tai useampi päivä; ulkopuolinen napautus
     sulkee ja tallentaa. Solueditori näytetään vain virheen tai ristiriidan kanssa. Kirjoittaminen ja F2 avaavat tekstikentän kuten ennen. */
  /* 0.83: valinta, monivalinta ja tila avautuvat listaan; kirjoittaminen ja F2 avaavat tekstikentän kuten ennen. */
  if(NV_CHOICE.includes(column.t)&&first===undefined){
    var V0=nvCur(),canEditView=V0.id===viewPath&&nvCanCalc(V0);
    var choiceBack=function(){requestAnimationFrame(function(){var target=anchor.isConnected?anchor:nvCellFind(state);if(target)target.focus({preventScroll:true});});};
    nvChoiceSheet({column:column,value:initial,caption:noteTitle(note)||'Nimetön',
      edit:canEditView?function(){var c0=V0.cols.find(function(x){return x.k===column.k;});if(c0)nvChoiceEdit(V0,c0);}:null,
      done:function(value,added){
        if(value===null)return;
        var addOptions=function(){
          if(!added.length||!canEditView)return;
          var V1=nvCur(),c1=V1.id===viewPath&&V1.cols.find(function(x){return x.k===column.k;});if(!c1)return;
          var now=nvChoiceOpts(c1),more=added.filter(function(a){return !nvChoiceFind(now,a.n);});
          if(more.length)nvSetColumnMod(V1,c1,'o',nvChoiceText(now.concat(more),c1.t==='tila'),false);
        };
        if(value===nvChoiceNorm(column,initial)){addOptions();choiceBack();return;}
        input.value=value;
        if(!anchor.isConnected){var again=nvCellFind(state);if(again)anchor=again;}
        shownError=false;
        save(true,0).then(function(){if(shownError&&!form.isConnected&&!(d&&d.open))show();addOptions();});
      }});
    return;
  }
  if(column.t==='pvm'&&first===undefined){
    var picked=(nvIsoList(initial)||[]).map(fiDate).join(', '),touched=false;
    if(input.type==='date')input.type='text'; // useampi päivä ei mahdu päivämääräkenttään
    var back=function(){requestAnimationFrame(function(){var target=anchor.isConnected?anchor:nvCellFind(state);if(target)target.focus({preventScroll:true});});};
    $('dsheet').addEventListener('close',function(){
      if(!touched){back();return;}
      input.value=Object.keys(dayTextDays(picked,new Date(),null)).sort().join(', ');
      // Verrataan päiviin, ei raakatekstiin: päälle ja pois napautettu päivä ei tyhjennä eikä kirjoita kenttää uudelleen.
      if(input.value===(nvIsoList(initial)||[]).join(', ')){input.value=initial;back();return;}
      if(!anchor.isConnected){var again=nvCellFind(state);if(again)anchor=again;}
      shownError=false;
      save(true,0).then(function(){if(shownError&&!form.isConnected&&!(d&&d.open))show();});
    },{once:true});
    dsOpen({base:new Date(),nl:null,caption:nvFieldLabel(key)+' · '+(noteTitle(note)||'Nimetön'),
      get:function(){return picked;},set:function(text){picked=text;touched=true;}});
    return;
  }
  show();
  if(input.type==='text'&&first==null)input.select();
}
function nvFieldOf(n,k,allowed){try{var f=KAAVA.fields(n,allowed||formulaContext().allowed),v=f.get(k);return v&&v.length?v[0]:'';}catch(e){return '';}}
function nvFieldNames(){var set={};try{formulaContext().allowed.forEach(function(k){set[k]=1;});}catch(e){}
  (data.notes||[]).forEach(function(n){(n.vfm||[]).forEach(function(l){var m=/^([a-z][a-z0-9_-]*):/.exec(l);if(m&&NV_STD.indexOf(m[1])<0)set[m[1]]=1;});});return Object.keys(set).sort();}
function nvSlug(name){var b=VAULT.slug?VAULT.slug(name):String(name||'nakyma').toLowerCase().replace(/[åä]/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');b=b||'nakyma';var p='nakymat/'+b+'.md',i=2;while(VC.files[p]||NV_PEND[nvPendKey(p)])p='nakymat/'+b+'-'+(i++)+'.md';return p;}
function nvText(D,old){var fm=['tyyppi: nakyma','otsikko: '+D.name,'kuvaus: '+(D.kuvaus||'Muistion näkymä, tehty Kaikki-apissa.'),'luotu: '+(D.luotu||todayIso()),'lahde: '+(D.lahde||'emil'),'nakyy: ei'];
  var mi=D.mista.filter(function(c){return c.k&&(c.k==='kaikki'||c.v!=='');}).map(function(c){return c.k==='kaikki'?'kaikki':c.k+' '+(c.op||'=')+' '+c.v;});if(mi.length)fm.push('mista: '+mi.join('; '));
  var sort=nvSortText(D.sort);if(sort)fm.push('jarjestys: '+sort);
  fm.push('sarakkeet:');D.cols.forEach(function(c){fm.push('  - '+nvColLine(c));});
  var body=old?VAULT.split(old).body:'# '+D.name+'\n';return '---\n'+fm.join('\n')+'\n---\n'+body;}
var nvDraft=null;
/* Näkymän luonnos editorille ja otsikkorivin ＋-sarakkeelle (0.80): sama perusta, odottava tallennus ja aloitustila. */
function nvColCopy(c){return {k:c.k,t:c.t||'',o:c.o||'',w:c.w||0,laske:c.laske||'',kal:!!c.kal};}
function nvDraftOf(V,kind,path,old){
  var sheet=kind==='taulukko',fm=old?VAULT.split(old).fm:null,pe=path?NV_PEND[nvPendKey(path)]:null;
  var D={path:path||null,old:old,cancel:false,kind:kind,repo:vRepo(),branch:G.branch,
    name:V?V.name:'Uusi näkymä',lahde:fm?VAULT.fmGet(fm,'lahde'):'emil',luotu:fm?VAULT.fmGet(fm,'luotu'):'',kuvaus:fm?VAULT.fmGet(fm,'kuvaus'):'',
    mista:(V?V.mista:[]).filter(function(c){return !sheet||c.k!=='kaikki';}).map(function(c){return {k:c.k,op:c.op||'=',v:c.v};}),
    sort:(V?V.sort:[]).map(function(rule){return {k:rule.k,d:rule.d};}),
    cols:(V?V.cols:NV_DEF.cols).map(nvColCopy)};
  if(pe){var P0=JSON.parse(JSON.stringify(pe.D));['name','mista','sort','cols'].forEach(function(k){D[k]=P0[k];});D.old=P0.old;D.prevSer=nvSer(P0);}
  D.start=JSON.stringify([D.name,D.mista,D.sort,D.cols]);
  return D;
}
function nvEdit(V,kind){
  var sheet=kind==='taulukko',path=V&&V.id,old=path&&VC.files[path]?VC.files[path].t:null;
  if(sheet){
    var current=old&&sgViewOf(path,old);
    if(!current){toast('Välilehti ei ole enää näkymä.');return;}
    V=current.view;
  }
  if(path&&viewLocked(path))return;
  var d=$('nvedit');
  if(!d){
    d=document.createElement('dialog');d.id='nvedit';d.setAttribute('aria-labelledby','nvedit-h');d.className='nved';document.body.appendChild(d);SMALL.nvedit=1;
    d.addEventListener('click',function(e){if(e.target===d&&nvDraft&&nvDraft.kind!=='taulukko')d.close();});
    d.addEventListener('close',function(){
      var saved=d.returnValue==='save';d.returnValue='';modalSync();
      if(nvDraft&&nvDraft.kind==='taulukko'&&!saved)nvDraft.cancel=true;
      nvSaveDraft();
    });
  }
  nvDraft=nvDraftOf(V,kind,path,old);
  nvRenderEd();openSheet(d);
  if(!V){var nm=$('nved-name');nm.focus();nm.select();}
}
function nvRenderEd(previousControl){var d=$('nvedit'),D=nvDraft;
  var previousRow=previousControl&&previousControl.closest('.nved-col');
  var scrollBefore=d.scrollTop;
  d.textContent='';var fields=nvFieldNames(),variables=mvRegistry();
  var h=el('div','hrow'),sheet=D.kind==='taulukko';
  var heading=el('h2','',sheet?'Muokkaa näkymävälilehteä':D.path?'Muokkaa näkymää':'Uusi näkymä');
  heading.id='nvedit-h';heading.tabIndex=-1;
  if(sheet)heading.setAttribute('autofocus','');
  h.appendChild(heading);d.appendChild(h);
  var nm=el('input');nm.id='nved-name';nm.type='text';nm.value=D.name;nm.setAttribute('aria-label','Näkymän nimi');nm.addEventListener('input',function(){D.name=nm.value;});d.appendChild(nm);
  d.appendChild(el('h3','','Näytä muistiinpanot, joissa'));var keys=[['kansio','kansio'],['tunniste','tunniste'],['tyyppi','tyyppi'],['lahde','kuka kirjoitti']].concat(fields.map(function(f){return [f,f];}),D.cols.filter(function(c){return nvVariableName(c.k);}).map(function(c){return [c.k,nvFieldLabel(c.k)];}));
  var cl=el('div','nved-conds');D.mista.forEach(function(c,i){var r=el('div','nved-row');
    var ks=el('select');ks.setAttribute('aria-label','Ehdon kenttä');keys.forEach(function(k){var o=el('option','',k[1]);o.value=k[0];ks.appendChild(o);});if(!keys.some(function(k){return k[0]===c.k;})){var o2=el('option','',c.k);o2.value=c.k;ks.appendChild(o2);}ks.value=c.k;ks.addEventListener('change',function(){c.k=ks.value;nvCount();});r.appendChild(ks);
    var os=el('select');os.setAttribute('aria-label','Vertailu');NV_OPS.forEach(function(o){var x=el('option','',o[1]);x.value=o[0];os.appendChild(x);});os.value=c.op||'=';os.addEventListener('change',function(){c.op=os.value;nvCount();});r.appendChild(os);
    var vi=el('input');vi.type='text';vi.value=c.v;vi.setAttribute('aria-label','Arvo');vi.addEventListener('input',function(){c.v=vi.value;nvCount();});r.appendChild(vi);
    var x=button(r,'×','mini nved-x',function(){D.mista.splice(i,1);nvRenderEd();});x.setAttribute('aria-label','Poista ehto');cl.appendChild(r);});
  if(!D.mista.length)cl.appendChild(el('p','sub','Kaikki muistiinpanot.'));d.appendChild(cl);
  var ab=button(d,'+ Lisää ehto','mini',function(){D.mista.push({k:'tunniste',op:'=',v:''});nvRenderEd();var r=d.querySelectorAll('.nved-conds .nved-row input');if(r.length)try{r[r.length-1].focus();}catch(e){}});ab.id='nved-addcond';
  d.appendChild(el('h3','','Lajittelu'));var sortEditor=el('div','nved-sort');
  nvSortEditor(sortEditor,D,fields);d.appendChild(sortEditor);
  d.appendChild(el('h3','','Sarakkeet · yhteinen järjestys'));
  if(D.path&&Array.isArray(nvLayGet({id:D.path}).order)){
    d.appendChild(el('p','sub','Tällä laitteella on oma sarakejärjestys. Vaihda yhteiseen järjestykseen sarakeotsikon valikosta.'));
  }
  var cand=['otsikko','kansio','kuka','luotu','ajankohta','tunnisteet','takaisinlinkit'].concat(fields);D.cols.forEach(function(c){if(cand.indexOf(c.k)<0)cand.push(c.k);});
  var on=D.cols.map(function(c){return c.k;}),order=on.concat(cand.filter(function(k){return on.indexOf(k)<0;})),cols=el('div','nved-cols');
  order.forEach(function(k,i){var c=D.cols.filter(function(x){return x.k===k;})[0],r=el('div','nved-col'+(c?'':' off'));r.dataset.k=k;
    var cb=el('input');cb.type='checkbox';cb.checked=!!c;cb.disabled=k==='otsikko';cb.setAttribute('aria-label','Näytä sarake '+(nvVariableName(k)||NV_LAB[k]||k));cb.addEventListener('change',function(){if(cb.checked){var ix=Math.min(D.cols.length,order.slice(0,i).filter(function(x){return D.cols.some(function(y){return y.k===x;});}).length);D.cols.splice(ix,0,{k:k,t:'',o:'',w:0});}else D.cols=D.cols.filter(function(x){return x.k!==k;});nvRenderEd(cb);});
    r.appendChild(cb);r.appendChild(el('span','nved-cn',nvFieldLabel(k)));
    if(c&&!sheet&&['otsikko','kansio','kuka','luotu','ajankohta','tunnisteet','takaisinlinkit'].indexOf(k)<0){var ls=el('select');ls.setAttribute('aria-label','Näyttötapa: '+(nvVariableName(k)||k));NV_LAJIT.forEach(function(l){var o=el('option','',l[1]);o.value=l[0];ls.appendChild(o);});ls.value=c.t||'';ls.addEventListener('change',function(){c.t=ls.value;nvRenderEd(ls);});r.appendChild(ls);
      if(c.t==='luku'||c.t==='palkki'){var oi=el('input');oi.type='text';oi.className='nved-opt';oi.placeholder=c.t==='palkki'?'0-100':'yksikkö';oi.value=c.o;oi.setAttribute('aria-label',c.t==='palkki'?'Väli':'Yksikkö');oi.addEventListener('input',function(){c.o=oi.value;});r.appendChild(oi);}
      if(NV_CHOICE.includes(c.t)){var ci2=el('input');ci2.type='text';ci2.className='nved-opt nved-choices';ci2.placeholder=c.t==='tila'?'Ei aloitettu / Kesken / Valmis':'Idea, Työn alla';ci2.value=c.o;ci2.setAttribute('aria-label','Valinnat: '+nvFieldLabel(k));ci2.addEventListener('input',function(){c.o=ci2.value.replace(/\|/g,'');});r.appendChild(ci2);}
      if(c.t==='pvm'){var kl=el('label','nved-kal'),kc=el('input');kc.type='checkbox';kc.checked=!!c.kal;kc.setAttribute('aria-label','Näytä kalenterissa: '+nvFieldLabel(k));
        kc.addEventListener('change',function(){c.kal=kc.checked;});kl.append(kc,el('span','','Kalenteriin'));kl.title='Näytä päivät kalenterissa';r.appendChild(kl);}}
    if(c&&k!=='otsikko'){var ci=D.cols.indexOf(c);var up=button(r,'↑','mini nved-mv',function(){if(ci>1){nvMove(D.cols,ci,ci-1);nvRenderEd(up);}});up.setAttribute('aria-label','Siirrä ylös');up.disabled=ci<=1;
      var dn=button(r,'↓','mini nved-mv',function(){if(ci<D.cols.length-1){nvMove(D.cols,ci,ci+1);nvRenderEd(dn);}});dn.setAttribute('aria-label','Siirrä alas');dn.disabled=ci>=D.cols.length-1;}
    cols.appendChild(r);});d.appendChild(cols);nvAddField(d,D,d);
  if(!sheet)nvAddVariable(d,D,variables);
  nvWidthEditor(d,D);
  var ft=el('div','nved-foot');var cnt=el('span','nved-count');cnt.id='nved-count';ft.appendChild(cnt);var cx=button(ft,'Peru muutokset','mini',function(){D.cancel=true;d.close();});cx.id='nved-cancel';button(ft,'Tallenna','mini',function(){d.close('save');});d.appendChild(ft);nvCount();
  if(previousRow){
    var row=Array.from(cols.children).find(function(item){return item.dataset.k===previousRow.dataset.k;});
    var controls=Array.from(row?row.querySelectorAll('input,select,button'):[]).filter(function(item){return !item.disabled;});
    var next=controls.find(function(item){return item.getAttribute('aria-label')===previousControl.getAttribute('aria-label');});
    next=next||controls.find(function(item){return item.classList.contains('nved-mv');})||controls[0];
    d.scrollTop=scrollBefore;
    if(next){next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'nearest'});}
  }
}
function nvSortEditor(host,draft,fields){
  var keys=Array.from(new Set(['otsikko','luotu','ajankohta','kansio','kuka','tunnisteet','takaisinlinkit']
    .concat(fields,draft.cols.map(function(c){return c.k;}),draft.sort.map(function(rule){return rule.k;}))))
    .filter(function(key){return /^[a-z0-9_-]+$/i.test(key)||nvVariableName(key);});
  var rules=draft.sort;
  function render(focusIndex,action){
    host.textContent='';
    var empty={k:'',d:1},used=new Set(rules.map(function(rule){return rule.k;}));
    var rows=rules.length?rules:[empty],nextKey=keys.find(function(k){return !used.has(k);});
    rows.forEach(function(rule,i){
      var row=el('div','nved-row nved-sortrow');
      var field=el('select'),direction=el('select');
      if(i===0)field.id='nved-sort';
      field.dataset.action='field';
      field.setAttribute('aria-label',i===0?'Järjestä kentän mukaan':'Lajittelukenttä '+(i+1));
      var options=rules.length<=1?[''].concat(keys):keys;
      options.forEach(function(key){
        var option=el('option','',key?nvFieldLabel(key):draft.kind==='taulukko'?'Oletusjärjestys':'Muistion oma järjestys');
        option.value=key;
        option.disabled=key!==rule.k&&used.has(key);
        field.appendChild(option);
      });
      field.value=rule.k;
      field.addEventListener('change',function(){
        if(!field.value)rules.splice(i,1);
        else if(rule===empty)rules.push({k:field.value,d:1});
        else rule.k=field.value;
        render(i,'field');
      });
      direction.setAttribute('aria-label',i===0?'Suunta':'Suunta '+(i+1));
      [['1','nouseva'],['-1','laskeva']].forEach(function(item){
        var option=el('option','',item[1]);option.value=item[0];direction.appendChild(option);
      });
      direction.value=String(rule.d);
      direction.disabled=rule===empty;
      direction.addEventListener('change',function(){rule.d=+direction.value;});
      row.append(field,direction);
      if(rule!==empty){
        var actions=el('div','nved-sort-actions');
        function move(symbol,step,name,actionName){
          var target=i+step;
          var control=button(actions,symbol,'mini',function(){
            nvMove(rules,i,target);render(target,actionName);
          });
          control.disabled=target<0||target>=rules.length;
          control.dataset.action=actionName;
          control.setAttribute('aria-label',name+' lajitteluperustetta '+(i+1));
        }
        move('↑',-1,'Nosta','up');
        move('↓',1,'Laske','down');
        var remove=button(actions,'×','mini',function(){
          rules.splice(i,1);render(Math.min(i,Math.max(0,rules.length-1)),'field');
        });
        remove.setAttribute('aria-label','Poista lajitteluperuste '+(i+1));
        row.appendChild(actions);
      }
      host.appendChild(row);
    });
    if(rules.length&&nextKey)button(host,'+ Lisää lajitteluperuste','mini',function(){
      rules.push({k:nextKey,d:1});render(rules.length-1,'field');
    });
    if(focusIndex!==undefined){
      var row=host.children[focusIndex];
      var control=row.querySelector('[data-action="'+action+'"]:not(:disabled)')||row.querySelector('select');
      control.focus();
    }
  }
  render();
}
function nvWidthEditor(dialog,draft){
  var section=el('details','nved-widths');
  section.appendChild(el('summary','','Yhteiset sarakeleveydet'));
  section.appendChild(el('p','sub','Anna leveydeksi 60–700 px tai jätä kenttä tyhjäksi, jolloin leveys säätyy automaattisesti.'));
  var row=el('div','nved-row'),select=el('select'),input=el('input');
  select.setAttribute('aria-label','Valitse sarake leveydelle');
  draft.cols.forEach(function(column){select.appendChild(el('option','',nvVariableName(column.k)||NV_LAB[column.k]||column.k));});
  input.type='number';input.min='60';input.max='700';input.step='1';input.inputMode='numeric';
  input.placeholder='Automaattinen';input.setAttribute('aria-label','Yhteinen leveys pikseleinä');
  var local=draft.path?(nvLayGet({id:draft.path}).w||{}):{};
  var copy=button(section,'','mini',function(){
    var column=draft.cols[select.selectedIndex];column.w=local[nvKey(column)];show();
  });
  function show(){
    var column=draft.cols[select.selectedIndex],px=local[nvKey(column)];
    input.value=column.w||'';copy.hidden=!px;
    if(px)copy.textContent='Kopioi tämän laitteen leveys ('+px+' px)';
  }
  input.addEventListener('input',function(){
    var column=draft.cols[select.selectedIndex];
    if(!input.value&&!input.validity.badInput)column.w=0;
    else if(input.validity.valid)column.w=input.valueAsNumber;
  });
  input.addEventListener('change',function(){
    var column=draft.cols[select.selectedIndex];
    if(Number.isFinite(input.valueAsNumber))column.w=Math.max(60,Math.min(700,Math.round(input.valueAsNumber)));
    show();
  });
  select.addEventListener('change',show);
  row.append(select,input,el('span','','px'));section.insertBefore(row,copy);
  dialog.appendChild(section);show();
}
function nvCount(){var c=$('nved-count');if(!c||!nvDraft)return;var V={mista:nvDraft.mista.filter(function(x){return x.k==='kaikki'||x.v!=='';})},n=(data.notes||[]).filter(function(x){return !x.arch&&nvPass(V,x);}).length;c.textContent=n+(n===1?' muistiinpano':' muistiinpanoa');}
/* ---- Kaikki 0.80 (jäsennys A3.2, suunnitelman kohta 21.2): uusi sarake Muistion otsikkoriviltä.
   Rivinäkymän otsikkorivin lopussa on ＋. Pieni ikkuna: tallennustapa (oletus tekstimuuttuja, Emil 24.11.: sarake on muuttuja; vaihtoehtona
   alkutietokenttä), nimi olemassa olevista tai uusi, samankaltaisen nimen ehdotus ja laji. Sarake lisätään näkymätiedoston loppuun samalla
   osapäivityksellä ja ristiriitavalinnalla kuin näkymäeditorissa (nvSaveDraft), ja odottava muutos näkyy heti (nvPendView). Oletusnäkymä
   Kaikki muistiinpanot on kiinteä, joten siellä sarake tallentuu uuteen näkymään, joka avautuu tallennuksen jälkeen. Muistiinpanoihin ei
   kirjoiteta mitään ennen kuin soluun annetaan arvo. ---- */
var nvFocusHead=null;
function nvCanAddColumn(V,locked){return !locked&&!noteSelectionMode&&noteOrderEnabled()&&!(V.id&&viewLocked(V.id));}
function nvFieldKey(name){return String(name||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'_');}
function mvStem(key){return String(key||'').replace(/\([^)]*\)/g,' ').replace(/[^0-9a-zåäöü]+/gi,' ').trim();}
function mvNear(a,b){
  if(Math.abs(a.length-b.length)>1)return false;
  var i=0,j=0,miss=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){i++;j++;continue;}
    if(++miss>1)return false;
    if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}
  }
  return miss+(a.length-i)+(b.length-j)<=1;
}
/* Samankaltainen nimi: sama nimi ilman sulkeita ja välimerkkejä (Uni / Uni (h)), sanan alku (Uni / Uni yöllä) tai yksi kirjain eri (Mieliala / Mielilaa ei, Mieliala / Mielialaa kyllä). */
function mvSimilar(name,names){
  var key=MUUTTUJA.key(name),stem=mvStem(key);
  if(!stem||names.some(function(g){return g.key===key;}))return [];
  return names.filter(function(g){
    var other=mvStem(g.key);if(!other)return false;
    if(other===stem)return true;
    if(Math.min(stem.length,other.length)>=3&&(other.startsWith(stem+' ')||stem.startsWith(other+' ')))return true;
    return Math.min(stem.length,other.length)>=4&&mvNear(stem,other);
  }).slice(0,3);
}
function nvAddColumn(V,anchor){
  if(!nvCanAddColumn(V,false))return;
  if(nvDraft){toast('Sulje näkymäeditori ensin.');return;}
  var d=$('nvcol-add');
  if(!d){
    d=el('dialog','nved');d.id='nvcol-add';d.setAttribute('aria-labelledby','nvcol-title');SMALL[d.id]=1;document.body.appendChild(d);
    d.addEventListener('click',function(e){if(e.target===d)closeSheet(d);});
  }
  var fresh=!V.id,variables=mvRegistry();
  var fields=nvFieldNames().filter(nvUserKey).map(function(k){return {nimi:k,key:k};});
  var heading=el('h2','','Uusi sarake'),info=el('p','sub',fresh?
    'Kaikki muistiinpanot on kiinteä oletusnäkymä. Sarake tallentuu uuteen näkymään, joka avautuu tallennuksen jälkeen.':'Näkymä: '+V.name);
  heading.id='nvcol-title';info.id='nvcol-info';
  var form=el('form');form.id='nvcol-form';form.noValidate=true;form.setAttribute('aria-labelledby',heading.id);
  function labelled(id,text,control){var box=el('div'),label=el('label','',text);control.id=id;label.htmlFor=id;box.append(label,control);form.appendChild(box);return box;}
  var viewName=el('input');viewName.type='text';viewName.value='Uusi näkymä';viewName.autocomplete='off';viewName.maxLength=80;
  if(fresh)labelled('nvcol-view','Uuden näkymän nimi',viewName);
  var source=el('select');[['muuttuja','Tekstiin muuttujana'],['kentta','Alkutietoihin kenttänä']].forEach(function(o){
    var option=el('option','',o[1]);option.value=o[0];source.appendChild(option);});
  var sourceHint=el('p','sub');sourceHint.id='nvcol-source-hint';source.setAttribute('aria-describedby',sourceHint.id);
  labelled('nvcol-source','Arvo tallentuu',source).appendChild(sourceHint);
  var name=el('input');name.type='text';name.autocomplete='off';name.maxLength=70;name.setAttribute('aria-describedby','nvcol-similar nvcol-error');
  var nameBox=labelled('nvcol-name','Nimi',name);
  var picks=el('div','nvcol-picks');picks.id='nvcol-picks';picks.setAttribute('role','group');picks.setAttribute('aria-label','Olemassa olevat nimet');nameBox.appendChild(picks);
  var similar=el('p','sub');similar.id='nvcol-similar';similar.setAttribute('aria-live','polite');nameBox.appendChild(similar);
  var type=el('select'),typeTouched=false;NV_LAJIT.forEach(function(l){var option=el('option','',l[1]);option.value=l[0];type.appendChild(option);});
  labelled('nvcol-type','Laji',type);
  var option=el('input');option.type='text';option.autocomplete='off';option.maxLength=40;
  var optionBox=labelled('nvcol-option','Yksikkö',option);
  var calendarBox=el('div','nvcol-check'),calendar=el('input'),calendarLabel=el('label','','Näytä päivät kalenterissa');
  calendar.type='checkbox';calendar.id='nvcol-calendar';calendarLabel.htmlFor=calendar.id;calendarBox.append(calendar,calendarLabel);form.appendChild(calendarBox);
  var msg=el('p');msg.id='nvcol-error';msg.setAttribute('aria-live','polite');form.appendChild(msg);
  var actions=el('div','nved-foot');button(actions,'Peru','btn',function(){closeSheet(d);});
  var submit=el('button','btn primary','Lisää sarake');submit.type='submit';actions.appendChild(submit);form.appendChild(actions);
  function names(){return source.value==='muuttuja'?variables:fields;}
  function pick(entry){
    name.value=entry.nimi;name.removeAttribute('aria-invalid');msg.textContent='';
    if(!typeTouched&&source.value==='muuttuja'){var last=entry.obs&&mvLast(entry);type.value=last&&last.x.o.luku!==null?'luku':'';}
    paint();name.focus();
  }
  function chips(host,list){list.forEach(function(entry){
    var chip=button(host,entry.nimi,'rvchip',function(){pick(entry);});chip.dataset.name=entry.nimi;
  });}
  function paint(){
    var query=MUUTTUJA.key(name.value),all=names(),exact=all.find(function(g){return g.key===(source.value==='muuttuja'?query:nvFieldKey(name.value));});
    var near=exact?[]:mvSimilar(name.value,all);
    sourceHint.textContent=source.value==='muuttuja'?'Solun arvo kirjoitetaan muistiinpanon tekstiin, esimerkiksi ((Uni (h) = 8)).':'Solun arvo kirjoitetaan muistiinpanon alkutietoihin, esimerkiksi uni: 8.';
    picks.textContent='';
    chips(picks,exact?[]:all.filter(function(g){return (!query||g.key.includes(query))&&!near.includes(g);}).slice(0,8));
    picks.hidden=!picks.children.length;
    similar.textContent='';
    if(near.length){
      similar.appendChild(document.createTextNode('Samankaltainen nimi on jo käytössä. Valitse se tai jatka uudella nimellä: '));
      chips(similar,near);
    }
    optionBox.hidden=!['luku','palkki'].concat(NV_CHOICE).includes(type.value);calendarBox.hidden=type.value!=='pvm';
    optionBox.querySelector('label').textContent=type.value==='palkki'?'Väli, esimerkiksi 0-10':type.value==='tila'?'Tilat ryhmittäin (tyhjä = Ei aloitettu / Kesken / Valmis)':
      NV_CHOICE.includes(type.value)?'Valinnat pilkulla, esimerkiksi Idea, Työn alla, Valmis':'Yksikkö';
    option.maxLength=NV_CHOICE.includes(type.value)?600:40;
  }
  function fail(text,control){msg.textContent=text;control=control||name;control.setAttribute('aria-invalid','true');control.focus();}
  source.addEventListener('change',function(){msg.textContent='';paint();});
  name.addEventListener('input',function(){name.removeAttribute('aria-invalid');msg.textContent='';
    var hit=source.value==='muuttuja'&&variables.find(function(g){return g.key===MUUTTUJA.key(name.value);});
    if(hit&&!typeTouched){var last=mvLast(hit);type.value=last&&last.x.o.luku!==null?'luku':'';}
    paint();});
  type.addEventListener('change',function(){typeTouched=true;paint();});
  option.addEventListener('input',function(){option.removeAttribute('aria-invalid');msg.textContent='';});
  form.addEventListener('submit',function(event){
    event.preventDefault();
    var key='',variable=source.value==='muuttuja';
    if(variable){
      var nm=nvValidVariable(name.value);
      if(!nm){fail('Anna muuttujan nimi ilman kaksoispistettä tai huutomerkkejä alussa.');return;}
      var id=MUUTTUJA.key(nm),match=variables.find(function(g){return g.key===id;});
      if(V.cols.some(function(c){return MUUTTUJA.key(nvVariableName(c.k))===id;})){fail('Muuttuja on jo tässä näkymässä.');return;}
      key=nvVariableColumn(match?match.nimi:nm);
    }else{
      key=nvFieldKey(name.value);
      if(!nvUserKey(key)){fail('Aloita kirjaimella. Käytä kentän nimessä kirjaimia, numeroita, viivaa tai alaviivaa.');return;}
      if(V.cols.some(function(c){return c.k===key;})){fail('Kenttä on jo tässä näkymässä.');return;}
    }
    var t=type.value,o=['luku','palkki'].concat(NV_CHOICE).includes(t)?option.value.trim():'';
    if(o.includes('|')){fail('Jätä pystyviiva pois.',option);return;}
    if(t==='palkki'&&o&&!/^\s*-?\d+(?:[.,]\d+)?\s*-\s*-?\d+(?:[.,]\d+)?\s*$/.test(o)){fail('Anna väli muodossa 0-10.',option);return;}
    if(t==='palkki')o=o.replace(/,/g,'.').replace(/\s+/g,'');
    if(NV_CHOICE.includes(t)&&o)o=nvChoiceText(nvChoiceParse({t:t,o:o}),t==='tila');
    var title=fresh?viewName.value.trim()||'Uusi näkymä':V.name;
    closeSheet(d);
    nvAddColumnSave(V,{k:key,t:t,o:o,w:0,laske:'',kal:t==='pvm'&&calendar.checked},title);
  });
  d.replaceChildren(heading,info,form);paint();openSheet(d);
  (fresh?viewName:name).focus();
}
function nvAddColumnSave(V,col,title){
  if(!vOn()||nvDraft)return;
  var path=V.id||null,old=path&&VC.files[path]?VC.files[path].t:null;
  if(path&&viewLocked(path)){toast(VIEW_LOCKED);return;}
  var D=nvDraftOf(path?V:null,undefined,path,old);
  if(!path){D.name=title;D.start='';}
  D.cols.push(col);
  nvDraft=D;nvSaveDraft();
  nvFocusHead={key:nvKey(col),until:Date.now()+15000};
  render();
}
/* Otsikkorivin kohdistus säilyy, kun rivit piirretään uudelleen (esim. taustatallennuksen jälkeen). */
function nvFocusHeadNow(){
  var want=nvFocusHead;if(!want)return;
  if(Date.now()>want.until){nvFocusHead=null;return;}
  var sum=want.key.startsWith('sum:'),key=sum?want.key.slice(4):want.key;
  var cell=Array.from(document.querySelectorAll(sum?'#nlist .rvsum .rvc':'#nlist .rvhead .rvc')).find(function(item){return key==='+'?item.classList.contains('rv-add'):item.dataset.k===key;});
  var target=cell&&cell.querySelector('button');if(!target)return;
  nvFocusHead=null;target.focus({preventScroll:true});cell.scrollIntoView({block:'nearest',inline:'nearest'});
}
/* ---- Kaikki 0.81 (jäsennys A3.3, suunnitelman kohta 21.3): yhteenvetorivi.
   Sarakevalikon Yhteenveto (tai yhteenvetorivin solu) valitsee laskun: summa, keskiarvo, mediaani, pienin, suurin, määrä, täytetyt,
   tyhjät, % täytetty tai kyllä-osuus. Valinta tallentuu näkymätiedoston sarakeriville määreenä | laske=summa (kaikille laitteille).
   Rivi näkyy taulukon alareunassa kiinteänä, kun jollain sarakkeella on lasku. Lasketaan näkyvät rivit: näkymän ehdot, asiasanasuodatin
   ja haku. Luvuissa tyhjät ja tekstit ohitetaan. Lasketut tulokset eivät tallennu mihinkään. ---- */
var NV_SUM_SHORT={'osuus-taytetty':'Täytetty','osuus-kylla':'Kyllä'};
function nvCalcModes(c){
  var plain=['otsikko','kansio','kuka','luotu','ajankohta','tunnisteet'].includes(c.k)||['pvm','siru','minigraafi','kylla-ei','valinta','monivalinta','tila'].includes(c.t);
  return NV_LASKE.map(function(x){return x[0];}).filter(function(mode){
    if(['summa','keskiarvo','mediaani','min','max'].includes(mode))return !plain;
    if(mode==='osuus-kylla')return c.t==='kylla-ei';
    if(c.k==='takaisinlinkit')return !['taytetyt','tyhjat','osuus-taytetty'].includes(mode); // 0 näkyy viivana, ei tyhjänä
    return true;
  });
}
function nvCalcName(mode){var x=NV_LASKE.find(function(item){return item[0]===mode;});return x?x[1]:'';}
function nvSumEmpty(v){
  if(v&&typeof v==='object'&&!Array.isArray(v)&&('value' in v||'error' in v))v='error' in v?'#':v.value;
  return v==null||v===''||Array.isArray(v)&&!v.length;
}
function nvSumNumber(v){
  if(v&&typeof v==='object'&&!Array.isArray(v)&&('value' in v||'error' in v)){if('error' in v)return null;v=v.value;}
  if(typeof v==='number')return Number.isFinite(v)?v:null;
  if(typeof v!=='string')return null;
  var text=v.trim();
  return /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text)?Number(text.replace(',','.')):null;
}
function nvSumCalc(mode,values){
  var count=values.length,filled=values.filter(function(v){return !nvSumEmpty(v);}).length;
  if(mode==='maara')return count;
  if(mode==='taytetyt')return filled;
  if(mode==='tyhjat')return count-filled;
  if(mode==='osuus-taytetty')return count?filled/count:null;
  if(mode==='osuus-kylla'){
    return count?values.filter(function(v){return /^(kylla|kyllä|1|true|on)$/i.test(String(v??'').trim());}).length/count:null;
  }
  var nums=values.map(nvSumNumber).filter(function(n){return n!==null;});
  if(!nums.length)return null;
  if(mode==='min')return Math.min.apply(null,nums);
  if(mode==='max')return Math.max.apply(null,nums);
  if(mode==='mediaani'){
    nums.sort(function(a,b){return a-b;});var mid=nums.length>>1;
    return nums.length%2?nums[mid]:(nums[mid-1]+nums[mid])/2;
  }
  var sum=nums.reduce(function(a,b){return a+b;},0);
  return mode==='keskiarvo'?sum/nums.length:sum;
}
function nvSumText(c,mode,value){
  if(value===null||!Number.isFinite(value))return '–';
  if(mode.startsWith('osuus-'))return String(Math.round(value*1000)/10).replace('.',',')+' %';
  if(['maara','taytetyt','tyhjat'].includes(mode))return String(value);
  var x=mode==='keskiarvo'?Math.round(value*100)/100:Number(value.toPrecision(12));
  if(Object.is(x,-0))x=0;
  var unit=c.t==='prosentti'?'%':c.t==='luku'?c.o:'';
  return String(x).replace('.',',')+(unit?' '+unit:'');
}
function nvCanCalc(V){return !!V.id&&noteOrderEnabled()&&!viewLocked(V.id)&&!noteSelectionMode;}
function nvSumRow(list,cols,V,locked,entries){
  var row=el('div','rvr rvsum'),edit=!locked&&nvCanCalc(V),cells=[];
  row.setAttribute('role','group');row.setAttribute('aria-label','Yhteenveto');row.id='rvsum';
  cols.forEach(function(c,i){
    var td=el('div','rvc'+(c.k==='otsikko'?' rvt':''));td.dataset.k=nvKey(c);row.appendChild(td);cells.push(td);
  });
  function paint(){
    var shown=entries.filter(function(entry){return !entry.row.hidden;});
    cols.forEach(function(c,i){
      var td=cells[i];td.textContent='';td.classList.remove('rvsum-edit');
      if(!c.laske){
        if(c.k==='otsikko')td.appendChild(el('span','rvsum-l','Yhteenveto'));
        return;
      }
      var value=nvSumCalc(c.laske,shown.map(function(entry){return entry.vals[i];})),text=nvSumText(c,c.laske,value);
      var name=NV_SUM_SHORT[c.laske]||nvCalcName(c.laske),label=nvFieldLabel(c.k)+': '+nvCalcName(c.laske)+' '+text;
      var host=td;
      if(edit){
        td.classList.add('rvsum-edit');
        host=button(td,'','rvsum-btn',function(){nvCalcMenu(V,c,host);});
        host.setAttribute('aria-label',label+'. Muuta laskua');host.setAttribute('aria-haspopup','menu');
      }else td.setAttribute('aria-label',label);
      host.title=label;
      host.append(el('span','rvsum-l',name),el('b','',text));
    });
  }
  list._sum=paint;paint();
  return row;
}
function nvCalcMenu(V,c,anchor){
  if(!nvCanCalc(V))return;
  var m=$('sortpop'),now=c.laske||'';
  m.textContent='';m.setAttribute('aria-label','Yhteenveto: '+nvFieldLabel(c.k));
  m.appendChild(el('p','sub rvm-h','Yhteenveto · '+nvFieldLabel(c.k)+' · kaikille laitteille'));
  nvCalcModes(c).forEach(function(mode){
    var item=menuItem(m,'rvm-calc-'+(mode||'ei'),(mode===now?'✓ ':'')+nvCalcName(mode),function(){nvSetCalc(V,c,mode);});
    item.setAttribute('aria-current',mode===now?'true':'false');
  });
  anchoredMenu('sortpop',anchor);
}
function nvSetCalc(V,c,mode){nvSetColumnMod(V,c,'laske',mode,(mode?'sum:':'')+nvKey(c));}
/* Yksi sarakkeen yhteinen asetus (laske, kal) näkymätiedostoon samalla osapäivityksellä kuin editorissa. */
function nvSetColumnMod(V,c,mod,value,focus){
  if(!nvCanCalc(V)||nvDraft)return;
  var old=VC.files[V.id]?VC.files[V.id].t:null,D=nvDraftOf(V,undefined,V.id,old);
  var col=D.cols.find(function(item){return item.k===c.k;});if(!col)return;
  if(mod==='kal'?!!col.kal===!!value:(col[mod]||'')===value)return;
  col[mod]=value;nvDraft=D;nvSaveDraft();
  if(focus!==false)nvFocusHead={key:focus||nvKey(c),until:Date.now()+15000};
  render();
}
/* ---- Kaikki 0.82 (jäsennys A3.4, suunnitelman kohta 21.5): päiväsarake kalenteriin. Sarakkeen asetus Näytä kalenterissa (| kalenteri=kylla,
   oletuksena pois, Emil 24.11.) näyttää näkymän muistiinpanojen päivät kalenterissa koko päivän merkintöinä. Ne ovat vain luettavia:
   napautus avaa muistiinpanon. Kuittaus, siirto ja toisto kuuluvat edelleen tekstin ajankohdille. ---- */
function nvCalendarDates(days){
  var out=new Map();
  if(!vOn()||!vK()||vK().id!==data.k)return out;
  var views=nvViews().filter(function(V){return V.cols.some(function(c){return c.kal&&c.t==='pvm';});});
  if(!views.length)return out;
  var want=new Set(days),seen=new Set(),today=todayIso(),notes=data.notes.filter(function(n){return !n.arch;});
  views.forEach(function(V){
    var cols=V.cols.filter(function(c){return c.kal&&c.t==='pvm';});
    notes.forEach(function(n){
      if(!nvPass(V,n))return;
      cols.forEach(function(c){
        (nvIsoList(nvRaw(n,c.k,today))||[]).forEach(function(iso){
          var id=n.id+'|'+MUUTTUJA.key(c.k)+'|'+iso;
          if(!want.has(iso)||seen.has(id))return;
          seen.add(id);
          if(!out.has(iso))out.set(iso,[]);
          out.get(iso).push({n:n,label:nvFieldLabel(c.k)});
        });
      });
    });
  });
  out.forEach(function(list){list.sort(function(a,b){return (noteTitle(a.n)||'').localeCompare(noteTitle(b.n)||'','fi')||a.label.localeCompare(b.label,'fi');});});
  return out;
}
function nvCalendarChips(host,items){
  var box=el('div','nvcal-list');
  items.forEach(function(x){
    var title=noteTitle(x.n)||'Nimetön',b=button(box,'','nvcal-chip',function(){openNote(x.n);});
    b.append(el('small','',x.label),el('span','',title));b.setAttribute('aria-label',x.label+': '+title+'. Avaa muistiinpano');
  });
  host.appendChild(box);return box;
}
/* ---- Kaikki 0.84 (jäsennys A3.6, suunnitelman kohta 21.4): täyttö alas Muistiossa.
   Tietokoneella muokattavan solun oikeassa alakulmassa on kahva. Alas vetäessä alemmat näkyvät rivit korostuvat ja määrä näkyy;
   vapautus kirjoittaa saman arvon kaikkiin (ei sarjoja), Esc peruu. Puhelimella: Valitse rivit → Täytä alas … → sarake; lähde on
   ylin valittu rivi. Kaikki muistiinpanot muuttuvat yhdessä Git-commitissa (vCommitFiles), ja Kumoa palauttaa ne yhdellä commitilla
   tavulleen, ellei tiedostoa ole sillä välin muutettu. Epäonnistunut täyttö ei muuta mitään, ja ikkuna listaa tallentumatta jääneet. ---- */
async function vCommitFiles(state,paths,build,message){
  async function request(endpoint,status,method,body){
    if(!vOn()||vRepo()!==state.repo||G.branch!==state.branch)throw new Error('Vault vaihtui tallennuksen aikana.');
    var result=await vApi(vUrl(endpoint),method,body);
    if(result.status!==status)throw new Error(result.status===0?'Ei yhteyttä GitHubiin.':'GitHub ei hyväksynyt muutosta ('+result.status+').');
    return result.j;
  }
  var branch=vEnc(state.branch);
  for(var attempt=0;attempt<3;attempt++){
    var head=await request('/git/ref/heads/'+branch,200),parent=head.object.sha,commit=await request('/git/commits/'+parent,200);
    var snapshot=await request('/git/trees/'+commit.tree.sha+'?recursive=1',200);
    if(snapshot.truncated)throw new Error('Vaultin tiedostolistaa ei saatu kokonaan.');
    var entries=new Map(snapshot.tree.filter(function(e){return e.type==='blob';}).map(function(e){return [e.path,e];}));
    var texts=new Map();
    for(var i=0;i<paths.length;i+=6){
      await Promise.all(paths.slice(i,i+6).map(async function(path){
        var entry=entries.get(path),cached=VC.files[path];
        if(!entry){texts.set(path,null);return;}
        texts.set(path,cached&&cached.sha===entry.sha?cached.t:b64d((await request('/git/blobs/'+entry.sha,200)).content));
      }));
    }
    var changes=build(texts);
    if(!changes.size)return {changes:changes,before:texts};
    var tree=await request('/git/trees',201,'POST',{base_tree:commit.tree.sha,tree:Array.from(changes,function(pair){
      return {path:pair[0],mode:(entries.get(pair[0])||{}).mode||'100644',type:'blob',content:pair[1]};
    })});
    var next=await request('/git/commits',201,'POST',{message:message,tree:tree.sha,parents:[parent]});
    var moved=await vApi(vUrl('/git/refs/heads/'+branch),'PATCH',{sha:next.sha,force:false});
    if(moved.status!==200){
      var now=await vApi(vUrl('/git/ref/heads/'+branch));
      if(now.status===200&&now.j.object&&now.j.object.sha===next.sha)moved={status:200};
      else if(now.status===200)continue; // toinen muutos ehti väliin: yritetään tuoreesta versiosta
      else throw new Error('Tallennuksen tilaa ei voitu varmistaa. Päivitä Vault ennen uutta muutosta.');
    }
    var after=await request('/git/trees/'+tree.sha+'?recursive=1',200);
    after.tree.forEach(function(e){if(changes.has(e.path))VC.files[e.path]={t:changes.get(e.path),sha:e.sha};});
    vAt=vClock();vSaveC();
    return {changes:changes,before:texts};
  }
  throw new Error('Vaultia muutettiin samaan aikaan. Yritä uudelleen.');
}
function nvFillColumns(V){
  return V.cols.filter(function(c){return (nvVariableName(c.k)||nvUserKey(c.k))&&c.t!=='minigraafi';});
}
function nvFillTargets(column,notes){
  return notes.filter(function(n){return nvCanEditNote(n)&&nvEditable(column,n)&&VC.files[n.vp];});
}
function nvFillValue(column,note,allowed){
  var file=VC.files[note.vp],field=file&&nvNoteField(file.t,column.k,allowed,note.created);
  return field?field.value:null;
}
var nvFillBusy=false;
async function nvFillRun(column,source,targets,viewPath){
  if(nvFillBusy||vBusy){toast('Vault synkronoi. Yritä hetken päästä uudelleen.');return;}
  if(viewLocked(viewPath)){toast(VIEW_LOCKED);return;}
  var allowed=formulaContext().allowed,value=nvFillValue(column,source,allowed),label=nvFieldLabel(column.k),variable=nvVariableName(column.k);
  if(value===null){toast('Lähdesolun arvoa ei voitu lukea.');return;}
  var notes=nvFillTargets(column,targets).filter(function(n){return n.id!==source.id;}),skipped=targets.length-notes.length;
  var waiting=notes.filter(function(n){var pending=vNotes().find(function(x){return x.vp===n.vp;});return VC.q[n.vp]||pending&&VAULT.mdOf(pending)!==VC.files[n.vp].t;});
  if(waiting.length){toast('Odota, että aiemmat muutokset tallentuvat ('+waiting.length+' muistiinpanoa), ja yritä uudelleen.');return;}
  if(!notes.length){toast('Valituissa riveissä ei ole täytettävää.');return;}
  var state={repo:vRepo(),branch:G.branch},byPath=new Map(notes.map(function(n){return [n.vp,n];}));
  nvFillBusy=vBusy=true;vRender();toast('Täytetään '+notes.length+' riviä …');
  try{
    var result=await vCommitFiles(state,Array.from(byPath.keys()),function(texts){
      var out=new Map();
      byPath.forEach(function(n,path){
        var text=texts.get(path);
        if(text==null)throw new Error('Muistiinpano “'+(noteTitle(n)||path)+'” puuttuu Vaultista.');
        var field=nvNoteField(text,column.k,allowed,variable?VAULT.noteOf(path,text).created:n.created);
        if(!field)throw new Error('Kenttä esiintyy useasti muistiinpanossa “'+(noteTitle(n)||path)+'”.');
        if(field.value===value)return;
        var next=field.write(value);
        if(typeof next!=='string')throw new Error(next.error||'Arvoa ei voitu kirjoittaa.');
        if(next!==text)out.set(path,next);
      });
      return out;
    },'appi: täyttö alas '+label+' ('+notes.length+')');
    vApply();render();
    var changed=result.changes.size;
    var message=changed?'Täytetty '+changed+' riviä: '+label+' = '+(value||'tyhjä')+(skipped?' · '+skipped+' ohitettiin':''):'Rivit olivat jo samat.';
    if(changed)nvFillUndoArm(state,result,message);else toast(message);
  }catch(error){
    nvFillFail(error.message,notes,function(){nvFillRun(column,source,targets,viewPath);});
  }finally{nvFillBusy=vBusy=false;vRender();vFlush();}
}
var nvFillUndo=null;
function nvFillUndoArm(state,result,message){
  var before=result.before,after=result.changes;
  var undo=async function(){
    nvFillUndo=null;
    if(nvFillBusy||vBusy){toast('Vault synkronoi. Kumoa ei onnistunut, yritä uudelleen hetken päästä.');return;}
    nvFillBusy=vBusy=true;vRender();var kept=[];
    try{
      var res=await vCommitFiles(state,Array.from(after.keys()),function(texts){
        var out=new Map();
        after.forEach(function(text,path){if(texts.get(path)===text)out.set(path,before.get(path));else kept.push(path);});
        return out;
      },'appi: kumoa täyttö ('+after.size+')');
      vApply();render();
      toast('Täyttö kumottu ('+res.changes.size+')'+(kept.length?' · '+kept.length+' muistiinpanoa oli muuttunut, ne jäivät ennalleen':'')+'.');
    }catch(error){toast('Kumoaminen ei onnistunut: '+error.message);}
    finally{nvFillBusy=vBusy=false;vRender();vFlush();}
  };
  nvFillUndo=undo;undoShow(undo,message);undoAt=Date.now();clearTimeout(undoT);
  undoT=setTimeout(function(){if(nvFillUndo===undo)nvFillUndo=null;undoHide();},8000);
}
document.addEventListener('keydown',function(event){
  if(!nvFillUndo||!(event.metaKey||event.ctrlKey)||event.shiftKey||event.key.toLowerCase()!=='z')return;
  if(event.target.closest&&event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  event.preventDefault();var run=nvFillUndo;undoHide();run();
});
function nvFillFail(message,notes,retry){
  var d=$('nvfill-fail');
  if(!d){d=el('dialog','nved');d.id='nvfill-fail';d.setAttribute('aria-labelledby','nvfill-fail-title');SMALL[d.id]=1;document.body.appendChild(d);}
  var h=el('h2','','Täyttö ei tallentunut');h.id='nvfill-fail-title';
  var list=el('ul','nvfill-list');list.id='nvfill-fail-list';
  notes.slice(0,12).forEach(function(n){list.appendChild(el('li','',noteTitle(n)||n.vp));});
  if(notes.length>12)list.appendChild(el('li','','ja '+(notes.length-12)+' muuta'));
  var foot=el('div','nved-foot');button(foot,'Sulje','btn',function(){closeSheet(d);});
  button(foot,'Yritä uudelleen','btn primary',function(){closeSheet(d);retry();}).id='nvfill-retry';
  d.replaceChildren(h,el('p','',message+' Mitään ei muutettu. Nämä '+notes.length+' muistiinpanoa jäivät täyttämättä:'),list,foot);
  openSheet(d);$('nvfill-retry').focus();
}
function nvFillDrag(event,handle,cell,note,column,allowed,viewPath,index){
  if(event.button!==0||event.isPrimary===false||nvGest||nvFillBusy)return;
  if(nvInline&&nvInline.changed()){toast('Tallenna tai peru keskeneräinen solumuutos ensin.');return;}
  event.preventDefault();event.stopPropagation();
  var list=$('nlist'),rows=Array.from(list.querySelectorAll('.rvb .rvr:not([hidden])')),from=rows.indexOf(cell.parentElement);
  if(from<0)return;
  var id=event.pointerId,y=event.clientY,targets=[],badge=el('div','rv-fill-badge'),raf=0,scroll=0,done=false;
  nvGest={id:id};try{handle.setPointerCapture(id);}catch(e){}
  badge.setAttribute('role','status');document.body.appendChild(badge);cell.classList.add('rv-fill-source');
  function paint(){
    raf=0;var to=from;
    for(var i=from+1;i<rows.length;i++){if(rows[i].getBoundingClientRect().top<=y)to=i;else break;}
    targets=rows.slice(from+1,to+1);
    rows.forEach(function(r,i){var c=r.children[index];if(c)c.classList.toggle('rv-fill-target',i>from&&i<=to);});
    badge.textContent=targets.length?'↓ '+targets.length+(targets.length===1?' rivi':' riviä'):'';
    badge.style.left=(lastX+14)+'px';badge.style.top=(y+10)+'px';
    var box=list.getBoundingClientRect();scroll=y>box.bottom-28?14:y<box.top+60&&list.scrollTop>0?-14:0;
    if(scroll)raf=requestAnimationFrame(function(){list.scrollTop+=scroll;paint();});
  }
  var lastX=event.clientX;
  function finish(ok){
    if(done)return;done=true;
    if(raf)cancelAnimationFrame(raf);
    window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);
    handle.removeEventListener('lostpointercapture',cancel);document.removeEventListener('keydown',esc,true);
    try{if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);}catch(e){}
    nvGest=null;badge.remove();cell.classList.remove('rv-fill-source');
    rows.forEach(function(r){var c=r.children[index];if(c)c.classList.remove('rv-fill-target');});
    if(!ok||!targets.length)return;
    var byId=new Map(data.notes.map(function(n){return [n.id,n];}));
    nvFillRun(column,note,targets.map(function(r){return byId.get(r.dataset.id);}).filter(Boolean),viewPath);
  }
  function move(e){if(e.pointerId!==id)return;y=e.clientY;lastX=e.clientX;if(!raf)raf=requestAnimationFrame(paint);}
  function up(e){if(e.pointerId===id)finish(true);}
  function cancel(e){if(!e||e.pointerId===undefined||e.pointerId===id)finish(false);}
  function esc(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);}}
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);
  handle.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',esc,true);
  paint();
}
/* Valintatila (myös puhelin): valitut rivit näkyvässä järjestyksessä, ylin on lähde. */
function nvFillDialog(){
  var V=nvCur(),viewPath=noteViewPath(V),cols=nvFillColumns(V),byId=new Map(data.notes.map(function(n){return [n.id,n];}));
  var rows=Array.from(document.querySelectorAll('#nlist .rvb .rvr:not([hidden])')).filter(function(r){return noteSelection.has(r.dataset.id);});
  var notes=rows.map(function(r){return byId.get(r.dataset.id);}).filter(Boolean);
  if(notes.length<2){toast('Valitse vähintään kaksi riviä: ylin on lähde.');return;}
  var d=$('nvfill');
  if(!d){d=el('dialog','nved');d.id='nvfill';d.setAttribute('aria-labelledby','nvfill-title');SMALL[d.id]=1;document.body.appendChild(d);
    d.addEventListener('click',function(e){if(e.target===d)closeSheet(d);});}
  var h=el('h2','','Täytä alas');h.id='nvfill-title';
  var label=el('label','','Sarake'),select=el('select');select.id='nvfill-column';label.htmlFor=select.id;
  cols.forEach(function(c,i){var o=el('option','',nvFieldLabel(c.k));o.value=String(i);select.appendChild(o);});
  var summary=el('p','sub');summary.id='nvfill-summary';summary.setAttribute('aria-live','polite');
  var allowed=formulaContext().allowed;
  function paint(){
    var c=cols[+select.value],value=nvFillValue(c,notes[0],allowed),ok=nvFillTargets(c,notes.slice(1)).length;
    summary.textContent='Lähde: '+(noteTitle(notes[0])||'Nimetön')+' ('+(value===null?'ei luettavissa':value===''?'tyhjä':value)+'). '+
      (value===''?'Tyhjentää ':'Kopioi arvon ')+ok+(ok===1?' muistiinpanoon':' muistiinpanoon')+(notes.length-1-ok?', '+(notes.length-1-ok)+' ohitetaan.':'.');
  }
  select.addEventListener('change',paint);
  var foot=el('div','nved-foot');button(foot,'Peru','btn',function(){closeSheet(d);});
  var go=button(foot,'Täytä','btn primary',function(){closeSheet(d);var c=cols[+select.value];noteSelectionReset();render();nvFillRun(c,notes[0],notes.slice(1),viewPath);});go.id='nvfill-go';
  var box=el('div','nvfill-field');box.append(label,select);
  d.replaceChildren(h,box,summary,foot);paint();openSheet(d);select.focus();
}
/* ---- Kaikki 0.55 (korjaussuunnitelma 1, 23.11.2026): näkymätiedoston turvallinen osapäivitys.
   Tallennus vertaa kolmea: avattu tiedosto (perusta, D.old), oma luonnos ja palvelimen tuorein tiedosto. Vain omat muutetut kentät
   (otsikko, mista, jarjestys, sarakkeet) kirjoitetaan tuoreimpaan tiedostoon; muut alkutiedot, kommentit, sarakkeiden lisämääreet ja
   runko säilyvät rivi riviltä. Saman kentän ristiriidassa palvelimen versio jää paikalleen ja oma odottaa valintaa Näkymä-valikossa.
   Jokainen tallennus on oma merkintänsä NV_PEND[repo|haara|polku] (ei yhteistä muuttujaa), säilyy laitteella (kaikki:nvpend) ja
   epäonnistunut odottaa uudelleenyritystä tai hylkäystä. ---- */
var NV_F=['otsikko','mista','jarjestys','sarakkeet'],NV_FLAB={otsikko:'nimi',mista:'ehdot',jarjestys:'järjestys',sarakkeet:'sarakkeet'};
function nvColCore(c){return c.k+(c.t?' | '+c.t+(c.o?' | '+c.o:''):'');}
function nvColLine(c){return nvColCore(c)+(c.laske?' | laske='+c.laske:'')+(c.kal?' | kalenteri=kylla':'')+(c.w?' | w='+c.w:'');}
function nvMods(c){return {w:c.w||0,laske:c.laske||'',kal:!!c.kal};}
/* Asettaa tai poistaa nimetyn määreen (laske, kalenteri) rivillä; muu rivi säilyy. */
function nvPutNamed(line,name,value){
  var parts=viewColumnParts(line),test=new RegExp('^\\s*'+name+'\\s*=','i'),found=false;
  var kept=parts.filter(function(part,i){if(i===0||!test.test(part))return true;if(found||!value)return false;found=true;return true;})
    .map(function(part,i){return i>0&&test.test(part)?part.replace(/^(\s*)[^=]*=.*?(\s*)$/,function(_,a,b){return a+name+'='+value+b;}):part;});
  var text=kept.join('|');
  if(value&&!found)return text.replace(/\s*$/,'')+' | '+name+'='+value;
  return text.replace(/\s+$/,'');
}
function nvPutMods(line,from,to){
  var a=nvMods(from),b=nvMods(to);
  if(a.w!==b.w)line=nvPutWidth(line,b.w);
  if(a.laske!==b.laske)line=nvPutNamed(line,'laske',b.laske);
  if(a.kal!==b.kal)line=nvPutNamed(line,'kalenteri',b.kal?'kylla':'');
  return line;
}
function nvSer(D,kind){
  var sheet=(kind||D.kind)==='taulukko';
  var conditions=(D.mista||[]).filter(function(c){
    return c.k&&(c.k==='kaikki'?!sheet:c.v!=='');
  }).map(function(c){return c.k==='kaikki'?'kaikki':c.k+' '+(c.op||'=')+' '+c.v;});
  return {otsikko:String(D.name||'').trim()||'Näkymä',
    mista:conditions.join('; ')||(sheet?'kaikki':''),
    jarjestys:nvSortText(D.sort),sarakkeet:(D.cols||[]).map(nvColLine)};
}
function nvSame(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function nvFmPut(L,k,v){var i=L.findIndex(function(l){return new RegExp('^'+k+':').test(l);});
  if(i>=0){if(v)L[i]=k+': '+v;else L.splice(i,1);return L;}if(!v)return L;
  var at=L.findIndex(function(l){return /^sarakkeet:\s*$/.test(l);});L.splice(at<0?L.length:at,0,k+': '+v);return L;}
function nvColsPut(L,cols){var a=L.findIndex(function(l){return /^sarakkeet:\s*$/.test(l);});
  if(a<0){return L.concat(['sarakkeet:']).concat(cols.map(function(c){return '  - '+nvColLine(c);}));}
  var b=a+1;while(b<L.length&&!/^\S/.test(L[b]))b++;
  var items=[],pre=[];L.slice(a+1,b).forEach(function(l){var m=/^(\s+-\s*)(.+)$/.exec(l);if(!m){pre.push(l);return;}
    var item=nvReadColumn(m[2]);items.push(Object.assign(item,{raw:l,ind:m[1],pre:pre,used:false}));pre=[];});
  var out=[];cols.forEach(function(c){var it=items.filter(function(x){return !x.used&&x.k===c.k;})[0];
    if(!it){out.push('  - '+nvColLine(c));return;}it.used=true;out=out.concat(it.pre);
    if(it.t===c.t&&(it.o===c.o||!c.t)){
      out.push(nvPutMods(it.raw,it,c));return;
    }
    var o=c.t?c.o:'',q=[c.k];if(c.t||it.extra.length)q.push(c.t);if(o||it.extra.length)q.push(o);
    var line=it.ind+q.concat(it.extra).join(' | ');out.push(nvPutMods(line,{},c));});
  items.forEach(function(x){if(!x.used)out=out.concat(x.pre);});out=out.concat(pre);
  return L.slice(0,a+1).concat(out).concat(L.slice(b));}
/* Leveys (0.62), laske (0.81) ja kalenteri (0.82) yhdistyvät sarakkeittain ja määreittäin, kun sarakkeet muuten ovat ennallaan. */
function nvMergeWidths(base,mine,theirs,force,previous){
  if(!nvSame(base.map(nvColCore),mine.map(nvColCore)))return null;
  var changes=mine.map(function(c,i){return {col:c,old:base[i]};}).filter(function(change){
    return !nvSame(nvMods(change.col),nvMods(change.old));
  });
  if(!changes.length)return null;
  var cols=theirs.slice();
  for(var change of changes){
    var name=change.col.k,index=cols.findIndex(function(c){return c.k===name;});
    if(index<0||cols.filter(function(c){return c.k===name;}).length!==1||
       mine.filter(function(c){return c.k===name;}).length!==1)return null;
    var remote=cols[index],mineMods=nvMods(change.col),oldMods=nvMods(change.old),remoteMods=nvMods(remote),next=Object.assign({},remote);
    for(var mod of Object.keys(mineMods)){
      if(mineMods[mod]===oldMods[mod])continue;
      if(remoteMods[mod]!==oldMods[mod]&&remoteMods[mod]!==mineMods[mod]&&!force&&
         !(previous||[]).includes(nvColLine(remote)))return {conflict:true};
      next[mod]=mineMods[mod];
    }
    cols[index]=next;
  }
  return {cols:cols};
}
/* Palauttaa {text} tai {conflict:[kentät]}. D.force = kentät, joissa oma voittaa; D.keep = kentät, joissa palvelimen versio jää. */
function nvMerge(D,cur){var path=D.path||D.newPath;
  if(!cur&&D.old==null)return {text:nvText(D,null)};
  var th=cur?nvParse(path,cur,D.kind):null,force=D.force||[];
  if(!th){if(NV_F.every(function(f){return force.indexOf(f)>=0;}))return {text:nvText(D,cur||D.old)};return {conflict:NV_F.slice()};}
  var original=nvParse(path,D.old,D.kind)||{name:'',mista:[],sort:[],cols:[]};
  var base=nvSer(original,D.kind),mine=nvSer(D),their=nvSer(th,D.kind),prev=D.prevSer||{},keep=D.keep||[],put=[],bad=[],writeCols=D.cols;
  NV_F.forEach(function(f){if(keep.indexOf(f)>=0||nvSame(mine[f],base[f])||nvSame(mine[f],their[f]))return;
    if(f==='sarakkeet'){
      var merged=nvMergeWidths(original.cols,D.cols,th.cols,force.includes(f),prev[f]);
      if(merged){if(merged.conflict)bad.push(f);else{writeCols=merged.cols;put.push(f);}return;}
    }
    if(force.indexOf(f)>=0||nvSame(their[f],base[f])||(f in prev&&nvSame(their[f],prev[f])))put.push(f);else bad.push(f);});
  if(bad.length)return {conflict:bad};if(!put.length)return {text:cur};
  var eol=cur.includes('\r\n')?'\r\n':'\n',S=VAULT.split(cur.replace(/\r\n/g,'\n')),L=S.fm.slice(),body=S.body;
  put.forEach(function(f){if(f==='sarakkeet')L=nvColsPut(L,writeCols);else L=nvFmPut(L,f,mine[f]);});
  if(put.indexOf('otsikko')>=0){var bl=body.split('\n'),h=bl.findIndex(function(l){return l.trim()!=='';});if(h>=0&&bl[h].trim()==='# '+their.otsikko){bl[h]='# '+mine.otsikko;body=bl.join('\n');}}
  return {text:['---'].concat(L,['---']).join(eol)+eol+body.replace(/\n/g,eol)};}
var NV_PEND={};
function nvPendKey(path,repo,branch){return (repo||vRepo())+'|'+(branch||G.branch)+'|'+path;}
function nvPendSave(){var a=Object.keys(NV_PEND).map(function(k){var e=NV_PEND[k];return {k:k,D:e.D,st:e.st==='tallentuu'?'odottaa':e.st,err:e.err||'',conflict:e.conflict||null};});
  try{if(a.length)localStorage.setItem('kaikki:nvpend',JSON.stringify(a));else localStorage.removeItem('kaikki:nvpend');}catch(e){}}
function nvPendLoad(){try{
  var pending=JSON.parse(localStorage.getItem('kaikki:nvpend')||'[]')||[];
  pending.forEach(function(e){
    if(!e||!e.k||!e.D)return;
    var draft=e.D;
    if(!Array.isArray(draft.sort)){
      var oldView=draft.old&&nvParse(draft.path,draft.old,draft.kind);
      // Vanha editori näytti valmiin monikenttälajittelun tyhjänä.
      draft.sort=draft.sort&&draft.sort.k?[draft.sort]:oldView&&oldView.sort.length>1?oldView.sort:[];
    }
    // Ennen versiota 0.62 jono ei tuntenut w-määrettä. Aiempi luonnos ei voi pyytää sen poistoa.
    if(draft.old&&draft.cols.some(function(c){return c.w===undefined;})){
      var base=nvParse(draft.path,draft.old,draft.kind);
      draft.cols.forEach(function(c){
        if(c.w!==undefined)return;
        var old=base&&base.cols.find(function(item){return item.k===c.k;});
        var parsed=nvReadColumn(nvColCore(c));
        c.t=parsed.t;c.o=parsed.o;c.w=old&&old.w||0;
      });
    }
    // Ennen versiota 0.81 luonnos ei tuntenut laske- ja kalenteri-määreitä. Aiempi luonnos ei voi pyytää niiden poistoa.
    if(draft.old&&draft.cols.some(function(c){return c.laske===undefined;})){
      var known=nvParse(draft.path,draft.old,draft.kind);
      draft.cols.forEach(function(c){
        if(c.laske!==undefined)return;
        var old=known&&known.cols.find(function(item){return item.k===c.k;});
        c.laske=old&&old.laske||'';c.kal=!!(old&&old.kal);
      });
    }
    NV_PEND[e.k]={D:draft,st:e.st,err:e.err,conflict:e.conflict,repo:draft.repo,branch:draft.branch};
  });
}catch(e){}}

nvPendLoad();
function nvPendHere(){return Object.keys(NV_PEND).filter(function(k){var e=NV_PEND[k];return vOn()&&e.D.repo===vRepo()&&e.D.branch===G.branch;}).map(function(k){return NV_PEND[k];});}
function nvSaveDraft(){var D=nvDraft;nvDraft=null;if(!D||D.cancel)return;D.name=String(D.name||'').trim()||'Näkymä';
  if(JSON.stringify([D.name,D.mista,D.sort,D.cols])===D.start&&D.path)return;
  if(!vOn()||vRepo()!==D.repo||G.branch!==D.branch){toast('Vault vaihtui. Näkymää ei tallennettu.');return;}
  try{D.sel=localStorage.getItem('kaikki:nview');}catch(e){D.sel=null;}
  if(!D.path)D.newPath=nvSlug(D.name);var k=nvPendKey(D.path||D.newPath,D.repo,D.branch);
  NV_PEND[k]={D:D,st:'odottaa'};nvPendSave();nvRunAll();}
var nvRunT=0;
function nvRunAll(){if(!vOn())return;if(vBusy){if(!nvRunT&&nvPendHere().some(function(x){return x.st==='odottaa';}))nvRunT=setTimeout(function(){nvRunT=0;nvRunAll();},1500);return;}var e=nvPendHere().filter(function(x){return x.st==='odottaa';})[0];if(e)nvRun(e);}
async function nvRun(e){var D=e.D,path=D.path||D.newPath,key=nvPendKey(path,D.repo,D.branch),conflict=null,taken=false,mine=function(){return NV_PEND[key]===e;};
  if(vBusy){nvRunAll();return;}vBusy=true;e.st='tallentuu';vRender();
  var sheet=D.kind==='taulukko',menu=sheet?'Taulukoiden ⋯-valikosta':'Näkymä-valikosta';
  try{
    var res=await vWriteText(path,function(cur){
      conflict=null;
      if(viewLockIn(cur))return {error:VIEW_LOCKED};
      if(sheet&&!sgViewOf(path,cur))return {error:'Välilehti ei ole enää näkymä.'};
      if(D.old==null&&cur){taken=true;return cur;}
      var m=nvMerge(D,cur);if(m.conflict){conflict=m.conflict;return cur;}return m.text;
    },'appi: '+(sheet?'näkymävälilehti ':'näkymä ')+D.name,D);
    if(!vOn()||vRepo()!==D.repo||G.branch!==D.branch)res={error:'Vault vaihtui tallennuksen aikana.'};
    if(res&&res.file){
      if(res.file.sha)VC.files[path]=res.file;else delete VC.files[path];
      vSaveC();
    }
    if(res&&!res.error&&res.file&&taken){if(mine()){delete NV_PEND[key];D.newPath=nvSlug(D.name);e.st='odottaa';NV_PEND[nvPendKey(D.newPath,D.repo,D.branch)]=e;}}
    else if(res&&!res.error&&res.file&&conflict){if(mine()){e.st='ristiriita';e.conflict=conflict;}toast('Näkymää “'+D.name+'” muutettiin toisaalla ('+conflict.map(function(f){return NV_FLAB[f];}).join(', ')+'). Valitse '+menu+'.');}
    else if(res&&!res.error&&res.file){e.done=true;if(mine())delete NV_PEND[key];var now=null;try{now=localStorage.getItem('kaikki:nview');}catch(x){}
      if(!sheet&&!nvDraft&&now===D.sel)try{localStorage.setItem('kaikki:nview',path);}catch(x){}toast('Näkymä “'+D.name+'” tallennettu.');}
    else{if(mine()){e.st='virhe';e.err=res&&res.error||'Tallennus epäonnistui.';}toast('Näkymää “'+D.name+'” ei tallennettu: '+(res&&res.error||'virhe')+' Luonnoksen löydät '+menu+'.');}}
  catch(x){if(mine()){e.st='virhe';e.err='Yhteys katkesi.';}toast('Näkymää “'+D.name+'” ei tallennettu: yhteys katkesi. Luonnoksen löydät '+menu+'.');}
  finally{vBusy=false;nvPendSave();vRender();vFlush();render();}}
function nvPendMenu(m,sheet){var A=nvPendHere().filter(function(e){return (e.D.kind==='taulukko')===!!sheet;});if(!A.length)return;m.appendChild(el('div','msep'));
  A.forEach(function(e,i){var D=e.D,id='nv-pend-'+i,lab=e.st==='ristiriita'?'muutettu toisaalla: '+(e.conflict||[]).map(function(f){return NV_FLAB[f];}).join(', '):e.st==='virhe'?'ei tallentunut'+(e.err?' ('+e.err+')':''):'tallentuu…';
    var t=el('p','sub nv-pend','Näkymä “'+D.name+'”: '+lab);t.id=id;t.setAttribute('role','status');m.appendChild(t);
    if(e.st==='virhe'){menuItem(m,id+'-retry','Yritä uudelleen',function(){e.st='odottaa';e.err='';nvPendSave();nvRunAll();});}
    if(e.st==='ristiriita'){menuItem(m,id+'-mine','Käytä omaa versiota',function(){D.force=(D.force||[]).concat(e.conflict||[]);e.st='odottaa';e.conflict=null;nvPendSave();nvRunAll();});
      menuItem(m,id+'-theirs','Pidä toisaalla tehty',function(){D.keep=(D.keep||[]).concat(e.conflict||[]);e.st='odottaa';e.conflict=null;nvPendSave();nvRunAll();});}
    if(e.st!=='tallentuu')menuItem(m,id+'-drop','Hylkää omat muutokset',function(){Object.keys(NV_PEND).forEach(function(k){if(NV_PEND[k]===e)delete NV_PEND[k];});nvPendSave();render();toast('Näkymän “'+D.name+'” muutokset hylätty.');});});}
/* Kaikki 0.6: Arkisto ja Roskakori listan lopussa pieninä nappeina (ennen Kuitattujen lopussa); napautus avaa ja sulkee */
var noteMoreOn='';
function noteMore(p){var A=data.notes.filter(function(n){return n.arch;}).length,T=data.trash.length,r=el('div','nmore');r.id='nmore';
  [['arch','Arkisto',A],['trash','Roskakori',T]].forEach(function(m){var b=button(r,m[1]+(m[2]?' ('+m[2]+')':''),'mini',function(){noteMoreOn=noteMoreOn===m[0]?'':m[0];render();});b.id='nmore-'+m[0];b.setAttribute('aria-expanded',noteMoreOn===m[0]?'true':'false');});
  p.appendChild(r);if(noteMoreOn==='arch')renderArch(p);else if(noteMoreOn==='trash')renderTrash(p);}
/* Arkisto Kuitattujen lopussa (1.98, Emil 29.10.2026): arkistoitu muistiinpano ei näy missään muualla. Napautus avaa, palautus ikkunasta. */
function renderArch(p){var A=data.notes.filter(function(n){return n.arch;});var th=el('h3','','Arkisto'+(A.length?' ('+A.length+')':''));th.id='sec-arch';p.appendChild(th);
  if(!A.length){p.appendChild(el('p','sub','Arkisto on tyhjä.'));return;}
  var tl=el('div','rows');tl.id='archlist';A.sort(function(a,b){return a.arch<b.arch?1:-1;}).forEach(function(n){var b=el('button','row');b.type='button';var sp=el('span','t',noteTitle(n)||'(tyhjä)');
      sp.appendChild(el('small','','Arkistoitu '+stamp(n.arch)));b.appendChild(sp);b.addEventListener('click',function(){openNote(n);});tl.appendChild(b);});p.appendChild(tl);}
/* Kelluva + (1.50, korvaa alapalkin): tekee näkymän mukaan muistiinpanon, listan rivin tai toistuvan */
var newBtn=$('newnote');
function noteFab(p){if(noteView==='open'&&viewLocked(noteViewPath(nvCur()))){$('hold').appendChild(newBtn);return;}if(noteView==='chk'&&(kt()||curList()&&curList().run)){$('hold').appendChild(newBtn);return;}var r=el('div','fabrow');newBtn.setAttribute('aria-label',noteView==='rep'?'Uusi toistuva':noteView==='chk'?'Uusi listan rivi':'Uusi muistiinpano');r.appendChild(newBtn);p.appendChild(r);}
/* Roskakori Kuitattujen lopussa (Emil 23.10.2026): poistetut muistiinpanot 30 päivää, napautus palauttaa */
function renderTrash(p){var th=el('h3','','Roskakori'+(data.trash.length?' ('+data.trash.length+')':''));th.id='sec-trash';p.appendChild(th);
  if(!data.trash.length){p.appendChild(el('p','sub','Roskakori on tyhjä.'));return;}
  iTo(p,'Napauta palauttaaksesi. Säilyy 30 päivää.');
  var tl=el('div','rows');tl.id='trash';data.trash.forEach(function(n){var b=el('button','row');b.type='button';var sp=el('span','t',noteTitle(n)||'(tyhjä)');
      sp.appendChild(el('small','','Poistettu '+stamp(n.deleted)+' · palauta'));b.appendChild(sp);b.addEventListener('click',function(){restore(n);render();});tl.appendChild(b);});p.appendChild(tl);
  var tr=el('div','btnrow');var eb=button(tr,'Tyhjennä roskakori','btn danger',function(){if(Date.now()-trashArm>4000){trashArm=Date.now();eb.textContent='Paina uudelleen: poistuu lopullisesti';return;}trashArm=0;data.trash=[];touch();render();});eb.id='trashempty';p.appendChild(tr);}
/* Kaikki 0.23: Oma järjestys käyttää Vaultin polkuja, jotka säilyvät muistiinpanoa muokattaessa. */
var NOTE_ORDER_PATH='nakymat/kaikki.md',NOTE_ORDER_HEADING='## Oma järjestys';
var VIEW_LOCKED='Näkymä on lukittu. Avaa lukitus ennen muokkausta.',viewLockChanging=false;
function viewLockLine(fm){return /^(kyllä|kylla)$/i.test(VAULT.fmGet(fm,'lukittu'));}
function viewLockIn(text){return viewLockLine(VAULT.split(String(text||'').replace(/\r\n/g,'\n')).fm);}
function viewLocked(path){return !!(path&&vOn()&&VC.files[path]&&viewLockIn(VC.files[path].t));}
function viewLockPatch(path,text,kind,locked){
  if(!text&&path===NOTE_ORDER_PATH&&locked){
    text='---\ntyyppi: nakyma\notsikko: Kaikki muistiinpanot\nnakyy: ei\n---\n# Kaikki muistiinpanot\n';
  }
  var eol=text.includes('\r\n')?'\r\n':'\n',lines=text.split(eol),doc=VAULT.split(lines.join('\n'));
  if(!doc.fm||VAULT.fmGet(doc.fm,'tyyppi')!==kind)return {error:'Näkymän tiedostoa ei löytynyt.'};
  if(viewLockLine(doc.fm)===locked)return text;
  var fm=VAULT.fmSet(doc.fm,'lukittu',locked?'kyllä':null);
  return lines.slice(0,1).concat(fm,lines.slice(doc.fm.length+1)).join(eol);
}
function viewLockButton(parent,id,path,kind,locked){
  var label=kind==='taulukko'?'Välilehden lukitus':'Näkymän lukitus';
  var b=button(parent,'','treepick view-lock',function(){viewLockToggle(path,kind,!locked,id);});
  b.id=id;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(locked));
  b.title=locked?'Avaa lukitus':'Lukitse näkymä';
  b.disabled=viewLockChanging;
  b.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="2"/><path d="'+
    (locked?'M7 9V6a3 3 0 0 1 6 0v3':'M7 9V6a3 3 0 0 1 5.8-1')+'"/></svg>';
}
async function viewLockToggle(path,kind,locked,id){
  if(vBusy||viewLockChanging||sgStructuralSave||sgFormula){toast('Odota tallennusta tai sulje kaavaluonnos ensin.');return;}
  var state={repo:vRepo(),branch:G.branch};viewLockChanging=true;
  if($(id))$(id).disabled=true;
  try{
    if(kind==='taulukko'&&locked&&sgPending(path)){
      await sgFlush(path);
      if(sgPending(path)){toast('Välilehden solut eivät vielä tallentuneet.');return;}
    }
    if(vBusy||!vOn()||state.repo!==vRepo()||state.branch!==G.branch)return;
    vBusy=true;vRender();
    try{
      var result=await vWriteText(path,function(text){return viewLockPatch(path,text,kind,locked);},
        locked?'appi: lukitse näkymä':'appi: avaa näkymän lukitus',state);
      if(!vOn()||state.repo!==vRepo()||state.branch!==G.branch)return;
      if(result.file&&result.file.sha){VC.files[path]=result.file;vSaveC();vAt=vClock();}
      if(result.error){toast(result.error);return;}
      toast(locked?'Näkymä lukittu.':'Näkymän lukitus avattu.');
    }finally{vBusy=false;vRender();vFlush();}
  }catch(e){toast('Lukituksen tallennus epäonnistui.');}
  finally{
    viewLockChanging=false;render();
    var current=$(id);if(current)current.focus({preventScroll:true});
    if(kind==='taulukko'&&!locked&&sgPending(path)&&!viewLocked(path))sgFlush(path);
  }
}
function noteFromView(note,path){
  if(!viewLocked(path)){openNote(note,null,null,path);return;}
  var dialog=$('view-note');
  if(!dialog){
    dialog=el('dialog','nved');dialog.id='view-note';dialog.setAttribute('aria-labelledby','view-note-title');
    SMALL[dialog.id]=1;document.body.appendChild(dialog);
    dialog.addEventListener('close',modalSync);
    var backdrop=false;
    function outside(event){
      if(event.target!==dialog)return false;
      var r=dialog.getBoundingClientRect();
      return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;
    }
    dialog.addEventListener('pointerdown',function(event){backdrop=outside(event);});
    dialog.addEventListener('click',function(event){if(backdrop&&outside(event))closeSheet(dialog);backdrop=false;});
  }
  dialog.textContent='';
  var title=el('h2','','Muistiinpanon esikatselu');title.id='view-note-title';
  var body=el('div','view-note-text',VAULT.plainText(note.text,vTitleOf));
  body.tabIndex=0;dialog.append(title,body);openSheet(dialog);
}
function noteOrderEnabled(){return vOn()&&vK()&&vK().id===data.k;}
function noteOrderPath(path){return typeof path==='string'&&VAULT.visible(path)&&!/[ \t\r\n]/.test(path);}
function noteOrderSection(text){
  var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',lines=text.split(eol);
  var start=lines.findIndex(function(line){return line.trim()===NOTE_ORDER_HEADING;});
  var end=start<0?-1:lines.findIndex(function(line,i){return i>start&&/^#{1,2}\s/.test(line);});
  if(start>=0&&end<0)end=lines.length;
  var paths=new Set();
  if(start>=0)lines.slice(start+1,end).forEach(function(line){
    var m=/^-\s+(.+?)\s*$/.exec(line);
    if(m&&noteOrderPath(m[1]))paths.add(m[1]);
  });
  return {lines:lines,eol:eol,start:start,end:end,paths:Array.from(paths)};
}
function notesInOwnOrder(notes,today,path){
  var file=VC.files[path],paths=noteOrderSection(file?file.t:'').paths;
  var rank=new Map();paths.forEach(function(path,i){rank.set(path,i);});
  return sortNotes(notes,'new',today).sort(function(a,b){
    return (rank.get(a.vp)??paths.length)-(rank.get(b.vp)??paths.length);
  });
}
function noteOrderPatch(text,defaultPaths,from,to,after){
  var section=noteOrderSection(text),paths=Array.from(new Set(section.paths.concat(defaultPaths)));
  if(paths.indexOf(from)<0||paths.indexOf(to)<0)return {error:'Rivit muuttuivat. Päivitä Muistio ja yritä uudelleen.'};
  var before=paths.indexOf(from);
  paths.splice(before,1);
  var insertion=paths.indexOf(to)+(after?1:0);
  if(insertion===before)return text;
  paths.splice(insertion,0,from);
  var block=paths.map(function(path){return '- '+path;}),eol=section.eol;
  if(section.start<0){
    if(!text)text=['---','tyyppi: nakyma','otsikko: Kaikki muistiinpanot','nakyy: ei','---','# Kaikki muistiinpanot',''].join(eol);
    return text+(text.endsWith(eol)?eol:eol+eol)+NOTE_ORDER_HEADING+eol+eol+block.join(eol)+eol;
  }
  var lines=section.lines;
  var preserved=lines.slice(section.start+1,section.end).filter(function(line){
    var m=/^-\s+(.+?)\s*$/.exec(line);return line.trim()&&(!m||!noteOrderPath(m[1]));
  });
  return lines.slice(0,section.start+1).concat([''],preserved,block,[''],lines.slice(section.end)).join(eol);
}
async function noteOrderMove(n,target,after,path){
  if(vBusy||viewLocked(path)||!noteOrderEnabled()||!target||!noteOrderPath(n.vp)||!noteOrderPath(target.vp)||n===target){
    if(vBusy)toast('Vault synkronoi. Yritä hetken kuluttua.');return;
  }
  var V=nvCur();if(noteViewPath(V)!==path)return;
  var paths=notesInOwnOrder(data.notes.filter(function(note){return !note.arch&&noteOrderPath(note.vp)&&nvPass(V,note);}),todayIso(),path).map(function(note){return note.vp;});
  var repo=vRepo(),branch=G.branch;
  vBusy=true;vRender();
  try{
    var result=await vWriteText(path,function(text){
      if(viewLockIn(text))return {error:VIEW_LOCKED};
      if(!text&&path!==NOTE_ORDER_PATH)return {error:'Näkymää ei löytynyt.'};
      return noteOrderPatch(text,paths,n.vp,target.vp,after);
    },
      'appi: muistiinpanojen oma järjestys',{repo:repo,branch:branch});
    if(!vOn()||vRepo()!==repo||G.branch!==branch)return;
    if(result.error){if(result.file){VC.files[path]=result.file;vSaveC();render();}toast(result.error);return;}
    VC.files[path]=result.file;vSaveC();vAt=vClock();
    render();
    var row=Array.from(document.querySelectorAll('#nlist [data-id]')).find(function(r){return r.dataset.id===n.id;});
    var handle=row&&row.querySelector('.note-order-handle');
    if(handle&&!handle.hidden)handle.focus({preventScroll:true});
    toast('Oma järjestys tallennettu.');
  }catch(e){toast('Järjestystä ei voitu tallentaa. Tarkista Vaultin yhteys.');}
  finally{vBusy=false;vRender();vFlush();}
}
function noteOrderHandle(row,n,list,path){
  var handle=el('button','note-order-handle'),drag=null,marker=null;
  handle.type='button';handle.setAttribute('aria-label','Siirrä '+(noteTitle(n)||'riviä')+' nuolinäppäimillä tai raahaamalla');
  handle.innerHTML='<svg viewBox="0 0 16 20" aria-hidden="true"><circle cx="5" cy="5" r="1.4"/><circle cx="11" cy="5" r="1.4"/><circle cx="5" cy="10" r="1.4"/><circle cx="11" cy="10" r="1.4"/><circle cx="5" cy="15" r="1.4"/><circle cx="11" cy="15" r="1.4"/></svg>';
  function candidates(){
    return Array.from(list.children).filter(function(r){return !r.hidden&&r.querySelector('.note-order-handle:not([hidden])');});
  }
  function noteOf(target){return data.notes.find(function(note){return note.id===target.dataset.id;});}
  function clear(){
    if(marker)marker.classList.remove('order-before','order-after');
    marker=null;drag=null;
  }
  handle.addEventListener('click',function(event){event.stopPropagation();});
  handle.addEventListener('keydown',function(event){
    if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
    event.preventDefault();
    var after=event.key==='ArrowDown',all=candidates(),target=all[all.indexOf(row)+(after?1:-1)];
    if(target)noteOrderMove(n,noteOf(target),after,path);
  });
  handle.addEventListener('pointerdown',function(event){
    if(drag||event.button>0||vBusy)return;
    drag={id:event.pointerId,y:event.clientY};handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove',function(event){
    if(!drag||event.pointerId!==drag.id)return;
    if(Math.abs(event.clientY-drag.y)<5){if(marker)marker.classList.remove('order-before','order-after');marker=null;return;}
    var others=candidates().filter(function(r){return r!==row;});
    if(!others.length)return;
    var target=others.find(function(r){
      var q=r.getBoundingClientRect();return event.clientY<q.top+q.height/2;
    });
    drag.after=!target;
    if(marker)marker.classList.remove('order-before','order-after');
    marker=target||others[others.length-1];
    marker.classList.add(drag.after?'order-after':'order-before');
    var scroller=activeScroller(),bounds=scroller.getBoundingClientRect();
    if(event.clientY<bounds.top+48)scroller.scrollTop-=12;
    if(event.clientY>bounds.bottom-48)scroller.scrollTop+=12;
  });
  handle.addEventListener('pointerup',function(event){
    if(!drag||event.pointerId!==drag.id)return;
    var target=marker&&noteOf(marker),after=drag.after;
    clear();if(target)noteOrderMove(n,target,after,path);
  });
  handle.addEventListener('pointercancel',clear);
  handle.addEventListener('lostpointercapture',clear);
  return handle;
}
var noteSelectionMode=false,noteSelectionProject=null,noteSelection=new Set(),noteBatchPending=[];
function noteSelectionReset(){noteSelectionMode=false;noteSelectionProject=null;noteSelection.clear();}
function noteSelectionCount(){
  var count=$('note-select-count');
  if(!count)return;
  var visible=new Set(Array.from(document.querySelectorAll('#nlist [data-id]:not([hidden])')).map(function(row){return row.dataset.id;}));
  noteSelection.forEach(function(id){if(!visible.has(id))noteSelection.delete(id);});
  count.textContent='Valittu '+noteSelection.size;
  $('note-batch-archive').disabled=$('note-batch-open').disabled=!noteSelection.size;
  var tagButton=$('note-batch-tag-open');
  if(tagButton)tagButton.disabled=!data.notes.some(function(n){return noteSelection.has(n.id)&&noteBatchTaggable(n);});
}
function bindNoteSelection(row,n,target){
  row.removeAttribute('role');row.removeAttribute('tabindex');row.classList.add('note-selectable');
  var label=el('label','note-select-check'),input=el('input');
  input.type='checkbox';input.checked=noteSelection.has(n.id);
  input.setAttribute('aria-label','Valitse '+(noteTitle(n)||'muistiinpano'));
  label.appendChild(input);target.insertBefore(label,target.firstChild);
  row.classList.toggle('note-selected',input.checked);
  label.addEventListener('click',function(ev){ev.stopPropagation();});
  row.addEventListener('click',function(){input.click();});
  input.addEventListener('change',function(){
    if(input.checked)noteSelection.add(n.id);else noteSelection.delete(n.id);
    row.classList.toggle('note-selected',input.checked);noteSelectionCount();
  });
}
function noteBatchApply(notes,trash){
  if(!notes.length||noteSelectionProject!==data.k)return;
  if(trash)moveNotesToTrash(notes);
  else{
    var undo=undoArm(notes),time=nowIso();
    notes.forEach(function(n){n.arch=time;});touch();undoShow(undo,'Arkistoitu '+notes.length);
  }
  noteSelectionReset();render();$('note-select-toggle').focus();
}
function addNoteSelectionActions(panel){
  var bar=el('div','note-select-actions'),count=el('span');
  count.id='note-select-count';count.setAttribute('role','status');bar.appendChild(count);
  function chosen(){return data.notes.filter(function(n){return !n.arch&&noteSelection.has(n.id);});}
  button(bar,'Arkistoi','btn',function(){noteBatchApply(chosen(),false);}).id='note-batch-archive';
  button(bar,'Poista','btn',function(){
    noteBatchPending=chosen().map(function(n){return {id:n.id,edit:n.edited,text:n.text};});
    $('note-batch-summary').textContent=noteBatchPending.length===1?'Valittu muistiinpano siirretään roskakoriin.':noteBatchPending.length+' valittua muistiinpanoa siirretään roskakoriin.';
    openSheet($('note-batch-delete'));
  }).id='note-batch-open';
  if(noteOrderEnabled())button(bar,'Lisää tunniste','btn',function(){openNoteBatchTags(chosen());}).id='note-batch-tag-open';
  if(nvRows()&&noteOrderEnabled()&&nvFillColumns(nvCur()).length)button(bar,'Täytä alas …','btn',function(){nvFillDialog();}).id='note-batch-fill';
  if(wide()&&nvRows())$('nlist').insertBefore(bar,document.querySelector('.rvh'));
  else if(wide())panel.insertBefore(bar,$('nlist'));
  else panel.appendChild(bar);
}
var noteBatchTagScope=null;
function noteBatchTaggable(n){
  return !n.arch&&!!n.vp&&VAULT.visible(n.vp)&&VAULT.kindOf(n.vp,n.vfm)!=='ohje';
}
function openNoteBatchTags(notes){
  var paths=notes.filter(noteBatchTaggable).map(function(n){return n.vp;});
  if(!paths.length)return;
  noteBatchTagScope={repo:vRepo(),branch:G.branch,project:data.k,paths:paths};
  $('note-batch-tag-count').textContent=paths.length===1?'1 muistiinpano':paths.length+' muistiinpanoa';
  var input=$('note-batch-tag-input');
  input.value='';$('note-batch-tag-status').textContent='';
  openSheet($('note-batch-tags'));input.focus();
}
$('note-batch-tag-cancel').addEventListener('click',function(){closeSheet($('note-batch-tags'));});
$('note-batch-tag-form').addEventListener('submit',async function(event){
  event.preventDefault();
  var scope=noteBatchTagScope,dialog=$('note-batch-tags'),msg=$('note-batch-tag-status');
  var input=$('note-batch-tag-input'),tag=noteTagKey(input.value);
  if(!tag){msg.textContent='Anna yksi tunniste, esimerkiksi remontti tai työ-vapaa.';return;}
  if(!scope||!noteOrderEnabled()||data.k!==scope.project||vRepo()!==scope.repo||G.branch!==scope.branch)return;
  if(vBusy){msg.textContent='Vault synkronoi. Yritä uudelleen hetken kuluttua.';return;}
  var controls=Array.from(dialog.querySelectorAll('button,input'));
  controls.forEach(function(c){c.disabled=true;});
  vBusy=true;vRender();msg.textContent='Tallennetaan…';
  var added=0,failed=[];
  try{
    for(var path of scope.paths){
      var changed=false;
      try{
        var result=await vWriteText(path,function(text){
          changed=false;
          if(!text)return {error:'Muistiinpanoa ei löytynyt.'};
          var note=VAULT.noteOf(path,text.replace(/\r\n/g,'\n'));
          if(!noteBatchTaggable(note))return {error:'Muistiinpano ei ole enää valittavissa.'};
          if(noteTags(note).includes(tag))return text;
          if(!addTagsToNote(note,[tag]).length)return {error:'Tunnistekentän muotoa ei tunnistettu.'};
          var eol=text.includes('\r\n')?'\r\n':'\n';
          var header=/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(text);
          changed=true;
          return ['---'].concat(note.vfm,['---','']).join(eol)+text.slice(header?header[0].length:0);
        },'appi: tunniste valittuihin muistiinpanoihin',scope);
        if(result.error){failed.push(path);continue;}
        if(result.file)VC.files[path]=result.file;
        if(changed)added++;
      }catch(e){failed.push(path);}
    }
    vSaveC();vApply();render();
    if(failed.length){
      scope.paths=failed;
      msg.textContent='Tallennettu '+added+'. '+failed.length+' muistiinpanoa jäi odottamaan. Voit yrittää uudelleen.';
      return;
    }
    closeSheet(dialog);
    toast(added?'Tunniste lisättiin '+added+' muistiinpanoon.':'Tunniste oli jo valituissa muistiinpanoissa.');
    var again=$('note-batch-tag-open');if(again)again.focus();
  }finally{
    controls.forEach(function(c){c.disabled=false;});
    vBusy=false;vRender();vFlush();
  }
});
$('note-batch-cancel').addEventListener('click',function(){closeSheet($('note-batch-delete'));});
$('note-batch-delete').addEventListener('close',function(){noteBatchPending=[];});
$('note-batch-confirm').addEventListener('click',function(){
  var original=new Map(noteBatchPending.map(function(n){return [n.id,n];}));
  var notes=data.notes.filter(function(n){var before=original.get(n.id);return before&&!n.arch&&n.edited===before.edit&&n.text===before.text;});
  closeSheet($('note-batch-delete'));
  if(notes.length!==original.size){toast('Jokin valituista muistiinpanoista muuttui. Tarkista valinta uudelleen.');return;}
  noteBatchApply(notes,true);
});
function notePass(ids){if(!noteFilter.length)return true;var f=function(id){return ids.indexOf(id)>=0;};return noteAnd?noteFilter.every(f):noteFilter.some(f);}
function paintNoteTags(note,ta){
  var host=$('ns-tags'),tags=ta.readOnly&&note&&!note._vaultEdit?noteTags(note):[];
  host.textContent='';
  host.hidden=!tags.length;
  tags.forEach(function(tag){
    var inferred=(note.autoTags||[]).indexOf(tag)>=0&&noteTags({text:note.text}).indexOf(tag)<0;
    var chip=button(host,'#'+tag,inferred?'chip auto-note-tag':'chip',function(){
      var back=backArm();
      $('ns-ok').click();
      if(data.notes.indexOf(note)>=0)back.n=note;
      noteFilter=['tag:'+tag];noteQuery='';noteView='open';
      showTab('notes');activeScroller().scrollTop=0;backShow(back);
    });
    if(inferred)chip.setAttribute('aria-label','#'+tag+', automaattinen tunniste');
  });
}
function noteAutoTags(note){
  var rules=vOn()&&vK()&&vK().id===data.k&&VC.files['pohjat/tunnisteet.md'];
  if(!rules)return;
  function words(s){return ' '+(String(s).normalize('NFC').toLocaleLowerCase('fi').match(/[\p{L}\p{M}\p{N}]+/gu)||[]).join(' ')+' ';}
  var text=words(note.text),old=noteTags(note),found=new Set();
  rules.t.split(/\r?\n/).forEach(function(line){
    var rule=/^\s*(?:-\s+)?#([^:\s]+):\s*(.+)$/.exec(line);
    var tag=rule&&noteTagKey(rule[1]);
    if(!tag||old.indexOf(tag)>=0)return;
    if(rule[2].split(',').some(function(word){
      var key=words(word);
      return key.trim()&&text.indexOf(key)>=0;
    }))found.add(tag);
  });
  var added=addTagsToNote(note,found);
  if(added.length)note.autoTags=Array.from(new Set((Array.isArray(note.autoTags)?note.autoTags:[]).concat(added)));
}
function addTagsToNote(note,tags){
  var old=noteTags(note),added=Array.from(new Set(tags)).filter(function(tag){return old.indexOf(tag)<0;});
  if(!added.length)return [];
  var fm=VAULT.split(VAULT.mdOf(note)).fm,current=VAULT.fmGet(fm,'tagit');
  if(current&&!/^\[.*\]$/.test(current))return [];
  var raw=current.slice(1,-1).trim();
  note.vfm=VAULT.fmSet(fm,'tagit','['+(raw?raw+', ':'')+added.join(', ')+']');
  return added;
}
function filterLabel(AT){if(!noteFilter.length)return 'Kaikki';var nm={};AT.forEach(function(t){nm[t.id]=t.name;});return noteFilter.map(function(id){return nm[id]||'?';}).join(noteAnd?' ja ':' tai ');}
var fsCtx=null;
function renderFilter(){var C=fsCtx;if(!C)return;var n=C.NS.filter(function(x){return notePass(C.nt[x.id]);}).length,fc=$('fs-count');fc.textContent='';
  fc.appendChild(el('b','',String(n)));fc.appendChild(document.createTextNode((n===1?' muistiinpano':' muistiinpanoa')+(noteFilter.length?' valituilla rajauksilla':' näkymässä')));
  Array.prototype.forEach.call($('fs-mode').children,function(b){b.setAttribute('aria-pressed',(b.dataset.fm==='all')===noteAnd?'true':'false');});
  var c=$('fs-chips'),tagHeading=false;c.textContent='';C.T.forEach(function(t){
    if(t.tag&&!tagHeading){c.appendChild(el('h3','tag-filter-heading','Tunnisteet'));tagHeading=true;}
    var b=button(c,t.name,'chip',function(){var i=noteFilter.indexOf(t.id);if(i<0)noteFilter.push(t.id);else noteFilter.splice(i,1);renderFilter();render();});b.dataset.tid=t.id;b.setAttribute('aria-pressed',noteFilter.indexOf(t.id)>=0?'true':'false');
    if(t.tag)return;
    var ib=button(c,'i','ibtn',function(){openTerm(t.id,function(){render();renderFilter();});});ib.dataset.tinfo=t.id;ib.setAttribute('aria-label','Asiasana: '+t.name);
    var w=el('span','chipw');c.insertBefore(w,b);w.appendChild(b);w.appendChild(ib);});
  if(!C.T.length)c.appendChild(el('p','sub','Ei vielä asiasanoja, jotka osuisivat muistiinpanoihin.'));
  $('fs-clear').hidden=!noteFilter.length;$('fs-migrate-tags').hidden=!noteOrderEnabled()||!data.terms.length||viewLocked(noteViewPath(nvCur()));}
Array.prototype.forEach.call($('fs-mode').children,function(b){b.addEventListener('click',function(){noteAnd=b.dataset.fm==='all';renderFilter();render();});});
$('fs-clear').addEventListener('click',function(){noteFilter=[];renderFilter();render();});
/* Sanahaku: osa sanaa riittää, isot kirjaimet ja välimerkit eivät vaikuta. Suodattaa näkyvät kortit uudelleen piirtämättä. */
function migrationCandidates(){
  if(!noteOrderEnabled())return [];
  var candidates=withText(data.terms,data.projects).filter(function(term){return !isSpec(term.id)&&term.name!==SYS_TERM;}).map(function(term){
    var tag=noteTagKey(term.name.normalize('NFC').replace(/[^\p{L}\p{N}\p{M}]+/gu,'-').replace(/^-+|-+$/g,''));
    return {term:term,tag:tag,notes:[]};
  }).filter(function(item){return item.tag;});
  var byId=new Map(candidates.map(function(item){return [item.term.id,item];})),terms=candidates.map(function(item){return item.term;});
  vNotes().forEach(function(note){
    if(note.arch||note.rep==='rx'||(note.vp&&(!VAULT.visible(note.vp)||VAULT.kindOf(note.vp,note.vfm)==='ohje')))return;
    var tags=new Set(noteTags(note)),fm=VAULT.fmGet(note.vfm,'tagit');
    if(fm&&!/^\[.*\]$/.test(fm))return;
    noteTerms(terms,note.text).forEach(function(id){
      var item=byId.get(id);if(!tags.has(item.tag))item.notes.push(note);
    });
  });
  return candidates;
}
function openTagMigration(){
  if(viewLocked(noteViewPath(nvCur())))return;
  var list=$('tag-migration-items'),msg=$('tag-migration-msg'),save=$('tag-migration-save'),candidates=migrationCandidates();
  list.textContent='';save.disabled=true;msg.textContent='';
  candidates.forEach(function(item){
    var label=el('label','tag-migration-item'),input=el('input'),name=el('span','',item.term.name);
    input.type='checkbox';input.value=item.term.id;input.disabled=!item.notes.length;
    name.appendChild(el('small','','#'+item.tag+' · '+item.notes.length+' muistiinpanoa'));
    label.append(input,name);list.appendChild(label);
  });
  if(!candidates.length)msg.textContent='Tuotavia Asioita ei löytynyt.';
  openSheet($('tag-migration'));
}
$('fs-migrate-tags').addEventListener('click',openTagMigration);
$('tag-migration-cancel').addEventListener('click',function(){closeSheet($('tag-migration'));});
$('tag-migration-items').addEventListener('change',function(){
  $('tag-migration-save').disabled=!this.querySelector('input:checked');
});
$('tag-migration-form').addEventListener('submit',async function(event){
  event.preventDefault();
  var dialog=$('tag-migration'),msg=$('tag-migration-msg'),viewPath=noteViewPath(nvCur());
  if(viewLocked(viewPath)){msg.textContent=VIEW_LOCKED;return;}
  var ids=new Set(Array.from($('tag-migration-items').querySelectorAll('input:checked')).map(function(input){return input.value;}));
  if(!ids.size||!noteOrderEnabled())return;
  if(vBusy){msg.textContent='Vault synkronoi. Yritä hetken kuluttua.';return;}
  var scope={repo:vRepo(),branch:G.branch,project:data.k};
  var controls=Array.from(dialog.querySelectorAll('input:not([disabled]),button:not([disabled])'));
  controls.forEach(function(control){control.disabled=true;});msg.textContent='Haetaan tuoreet muistiinpanot…';
  try{
    var fresh=await vRefresh();
    if(!fresh||!noteOrderEnabled()||vRepo()!==scope.repo||G.branch!==scope.branch||scope.project!==data.k){
      msg.textContent='Muistiinpanojen päivitys epäonnistui. Yritä uudelleen.';return;
    }
    if(viewLocked(viewPath)){msg.textContent=VIEW_LOCKED;return;}
    var changes=new Map();
    migrationCandidates().filter(function(item){return ids.has(item.term.id);}).forEach(function(item){
      item.notes.forEach(function(note){
        if(!changes.has(note))changes.set(note,[]);
        changes.get(note).push(item.tag);
      });
    });
    var stamped=nowIso(),count=0;
    changes.forEach(function(tags,note){
      if(addTagsToNote(note,tags).length){note.edited=stamped;count++;}
    });
    if(count){touch();vCollect();}
    closeSheet(dialog);render();renderFilter();
    toast(count?'Tunnisteet lisättiin '+count+' muistiinpanoon.':'Muistiinpanoissa oli jo valitut tunnisteet.');
  }catch(e){msg.textContent='Tunnisteiden tuonti keskeytyi. Tarkista yhteys.';}
  finally{controls.forEach(function(control){control.disabled=false;});}
});
var noteSearchText=new WeakMap();
function filterNotes(){var w=normT(noteQuery).trim(),n=0,byId={};if(w)data.notes.forEach(function(x){byId[x.id]=x;});Array.prototype.forEach.call(document.querySelectorAll('#nlist [data-id]'),function(c){
  var N=w?byId[c.dataset.id]:null;
  var cached=N&&noteSearchText.get(N);
  if(N&&(!cached||cached.text!==N.text)){cached={text:N.text,normal:normT(N.text)};noteSearchText.set(N,cached);}
  var ok=!w||cached&&cached.normal.includes(w);
  if(c.hidden!==!ok)c.hidden=!ok;
  if(ok)n++;
  var handle=c.querySelector('.note-order-handle');if(handle)handle.hidden=!!w||handle.dataset.sorted==='true';
  if(!ok&&noteSelection.delete(c.dataset.id)){var box=c.querySelector('.note-select-check input');if(box)box.checked=false;c.classList.remove('note-selected');}
  });nvHiddenDraft();noteSelectionCount();var sumList=$('nlist');if(sumList&&sumList._sum)sumList._sum();var e=$('nempty');if(e)e.hidden=n>0||!document.querySelectorAll('#nlist [data-id]').length;}
function fromIsoW(iso){var p=iso.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);return WDS[d.getDay()]+' '+fiDate(iso);}
/* Kuittaus ja arkistointi (Emil 22.10.2026): kuitattu jää kalenteriin erinäköisenä, arkistointi on erillinen toinen valinta. */
/* 1.61: kuittauksen peruminen palauttaa vain kokonaiskuittauksen; ajankohtien kuittaukset (pts) säilyvät */
/* 1.61: yksi tallennusreitti muistiinpanon tekstille kaikista kirjoituspaikoista (ikkuna, listan rivi):
   puretut linkit siivotaan, suhteelliset ajat lukitaan, siirtohistoria siivotaan, muokkausaika päivittyy */
function noteWrite(N,tx,t){N.text=tx;N.edited=t||nowIso();nlClean(N);lockRel(N,new Date());mvClean(N);return N;}
/* Kumoa (1.61, Emil 23.10.2026): kuittaus palautetaan täsmälleen edelliseen tilaansa. Kohteet = muutettavat oliot/taulukot. */
var undoS=null,undoT=0;
function undoArm(objs){return objs.filter(Boolean).map(function(o){return {o:o,c:JSON.parse(JSON.stringify(o))};});}
function undoShow(snap,msg){undoS=snap;$('undo-b').hidden=false;$('undo-t').textContent=msg;$('undo').hidden=false;clearTimeout(undoT);undoT=setTimeout(undoHide,5000);}
function undoHide(){clearTimeout(undoT);undoS=null;$('undo').hidden=true;}
$('undo-b').addEventListener('click',function(ev){ev.stopPropagation();var S=undoS;undoHide();if(!S)return;if(typeof S==='function'){S();return;}S.forEach(function(x){var o=x.o,c=x.c;
  if(Array.isArray(o)){o.length=0;c.forEach(function(v){o.push(v);});}else{Object.keys(o).forEach(function(k){delete o[k];});Object.keys(c).forEach(function(k){o[k]=c[k];});}});touch();render();});
document.addEventListener('pointerdown',function(ev){if(undoS&&!ev.target.closest('#undo'))setTimeout(function(){if(undoS&&Date.now()-undoAt>400)undoHide();},0);},true);var undoAt=0;
/* 1.98: kuittaus kuuluu tekstille. txToggle(n,i) kuittaa tai palauttaa tekstin i (Muistion ympyrä, muistiinpanon ikkuna). */
function txToggle(n,i){var t=todayIso();if(txSet(n,i,!txOn(n,i,t),nowIso(),t)&&n.rep)repSignOff(data.reps,n,t);touch();}
var noteOcc=null;
function occLabel(k){var p=k.replace(/#\d+$/,'').split(' ');return fiDate(p[0])+(p[1]?' klo '+fmtTime(p[1]):'');}
function okState(b,on){b.setAttribute('aria-pressed',on?'true':'false');if(on)b.setAttribute('aria-label','Kuitattu, napauta palauttaaksesi');else b.removeAttribute('aria-label');}
function stateRow(n){var r=$('ns-staterow');r.hidden=!n;if(!n)return;
  /* 1.98: arkistointi on muistiinpanon oma päätös ja aina tarjolla; kuittaus kuuluu tekstille (usean tekstin muistiinpanossa ympyrät kortissa) */
  $('ns-arch').hidden=false;$('ns-arch').textContent=n.arch?'Palauta arkistosta':'Arkistoi';$('ns-done').hidden=false;
  if(noteOcc){var on=ptDone(n,noteOcc);$('ns-done').textContent=on?'✓ Kuitattu':'Kuittaa '+occLabel(noteOcc);okState($('ns-done'),on);return;}
  if(noteParts(n.text).length>1){$('ns-done').hidden=true;return;}
  var t0=txOn(n,0,todayIso());$('ns-done').textContent=t0?'✓ Kuitattu':'Kuittaa';okState($('ns-done'),t0);}
$('ns-done').addEventListener('click',function(){if(!noteCur)return;
  if(noteOcc){calOk(noteCur,noteOcc);stateRow(noteCur);foundInfo();paintHl();return;}
  txToggle(noteCur,0);stateRow(noteCur);});
/* Sama poiston varmistus listan riville ja toistuvalle (1.39.3): laatikko Poista-rivin paikalle, varmistus vasemmalla, Peruuta oikealla */
function delAsk(btn,title,txt,ok){var row=btn.parentNode;delReset(row.parentNode);
  var box=el('div','delbox');box.setAttribute('role','alertdialog');box.appendChild(el('b','',title));box.appendChild(el('p','',txt));var bs=el('div','delbtns');
  button(bs,'Poista','btn danger delok',function(){box.remove();row.hidden=false;ok();});button(bs,'Peruuta','btn delno',function(){box.remove();row.hidden=false;});box.appendChild(bs);
  row.hidden=true;row.parentNode.insertBefore(box,row.nextSibling);try{box.scrollIntoView({block:'nearest'});}catch(e){}}
function delReset(d){Array.prototype.forEach.call(d.querySelectorAll('.delbox:not(#ns-delbox)'),function(b){b.remove();});Array.prototype.forEach.call(d.querySelectorAll('.delrow:not(#ns-delrow)'),function(r){r.hidden=false;});}
/* Poisto (Emil 22.10.2026): varmistus joka kerta, ja varmistusnappi eri kohdassa kuin Poista (Peruuta on sen paikalla), ettei tuplanapautus poista */
$('ns-del').addEventListener('click',function(){$('ns-delrow').hidden=true;$('ns-delbox').hidden=false;try{$('ns-delbox').scrollIntoView({block:'nearest'});}catch(e){}});
$('ns-delno').addEventListener('click',function(){$('ns-delbox').hidden=true;$('ns-delrow').hidden=false;});
$('ns-delok').addEventListener('click',function(){if(noteCur)toTrash(noteCur);noteCur=null;draftClear();closeSheet($('nsheet'));render();});
/* Arkistointi (Emil 29.10.2026): varmistus, ja Arkistoi-vahvistus eri kohdassa kuin ensimmäinen napautus. Palautus ilman varmistusta. */
$('ns-arch').addEventListener('click',function(){if(!noteCur)return;if(noteCur.arch){delete noteCur.arch;touch();stateRow(noteCur);render();return;}
  $('ns-delrow').hidden=true;$('ns-archbox').hidden=false;try{$('ns-archbox').scrollIntoView({block:'nearest'});}catch(e){}});
$('ns-archno').addEventListener('click',function(){$('ns-archbox').hidden=true;$('ns-delrow').hidden=false;});
$('ns-archok').addEventListener('click',function(){$('ns-archbox').hidden=true;$('ns-delrow').hidden=false;if(!noteCur)return;var n=noteCur;$('ns-ok').click();if(data.notes.indexOf(n)<0)return;var U=undoArm([n]);n.arch=nowIso();touch();render();undoAt=Date.now();undoShow(U,'Arkistoitu');});
var noteOpenView='';
function openNote(n,pre,occ,viewPath){noteCur=n;noteOpenView=viewPath||'';var file=n&&n._vaultEdit;
  $('nsheet').classList.toggle('vwork-file',!!file);$('ns-vmsg').hidden=true;$('ns-vmsg').textContent='';
  nsNl=n&&n.nl?n.nl.map(function(x){return {w:x.w,at:x.at};}):[];$('ns-tm').hidden=true;$('ns-delbox').hidden=true;$('ns-archbox').hidden=true;$('ns-delrow').hidden=!n||!!file;noteArm=0;noteOcc=n&&occ?occ:null;stateRow(file?null:n);$('ns-ov').hidden=true;linkSel='';$('ns-linkbox').hidden=true;$('ns-linkrow').hidden=true;$('ns-pop').hidden=true;$('ns-text').value=n?n.text:'';$('ns-date').value=n?(n.date||''):'';$('ns-ts').value=n&&n.time?n.time.s:'';$('ns-te').value=n&&n.time?n.time.e:'';$('ns-stamp').textContent=n?'Luotu '+stamp(n.created)+(n.edited!==n.created?' · muokattu '+stamp(n.edited):''):'Uusi';
  /* kalenterista: valmiiksi päivä ja ajankohta (Emil 21.10.2026) */
  $('ns-h').textContent=file?file.title:!n&&pre?'Uusi kalenterimerkintä':'Muistiinpano';if(!n&&pre){$('ns-date').value=pre.date||'';$('ns-ts').value=pre.s||'';$('ns-te').value=pre.e||'';}
  notePin=!n&&pre&&pre.s?{s:pre.s,e:pre.e||'',on:false}:n&&n.pin&&n.time?{s:n.time.s,e:n.time.e||'',on:true}:null;
  /* 1.80 lukunäkymä (kokeilu, asetus Muistio → Muistiinpano aukeaa): vanha muistiinpano aukeaa lukittuna, linkit napin näköisinä; napautus tekstiin avaa muokkauksen */
  var rd=!!n&&!file&&!!clean(n.text)&&((data.cfg||{}).read||'read')==='read';/* Kaikki 0.2: lukunäkymä oletuksena */$('ns-text').readOnly=rd;$('nsheet').classList.toggle('reading',rd);if(rd)$('ns-stamp').textContent+=' · napauta tekstiä muokataksesi';
  nsDt(!!(n&&(n.date||(n.time&&n.time.s)))||!!(!n&&pre&&(pre.date||pre.s)));nsMenuClose();nsDateClose();
  foundInfo();openSheet($('nsheet'));nsMorePlace();paintHl();noteGrow();
  /* 1.71 (Emil 24.10.2026): uusi muistiinpano aukeaa kursori kentässä ja näppäimistö auki. iPhone avaa näppäimistön vain, kun fokus annetaan samassa napautuksessa. */
  if(!n){var ta=$('ns-text');kbKeep(ta);try{ta.focus({preventScroll:true});}catch(e){ta.focus();}}}
/* Kaikki 0.9 (Emil 22.11.2026): muistiinpanoikkunassa tila tekstille. Ylärivillä yksi siru: seuraava ajankohta (kuitattuna väkänen, useampi +N)
   tai Tiedot (asiasanat) tai + Päivä. Siru avaa pienen ikkunan, jossa päivä- ja aikarivi sekä Ajankohdat ja asiasanat (ennen tekstin alla).
   Luotu ja muokattu ⋯-valikon ylärivillä. */
function nsWhen(N,ds,TI){var b=$('ns-when'),today=todayIso(),nx=ds.length?nextDate(N,today):null,o=nx?nx.o:(ds[0]||null),k=nx?nx.k:(o&&o.R?o.R[0]:null);b.textContent='';b.classList.remove('ok','add');
  b.dataset.hasDate=k?'1':'';
  var custom=(noteCur&&noteCur.vfm||[]).some(function(line){return nvUserKey(line.split(':',1)[0]);});
  b.dataset.hasDetails=custom||(TI&&TI.ids&&TI.ids.length)||!$('ns-pinrow').hidden||!$('ns-poprow').hidden?'1':'';
  if(k){var t=(k===today?'Tänään ':'')+fromIsoW(k)+(o.time?' klo '+o.time.s.replace(/^0/,'').replace(':','.')+(o.time.e?'–'+o.time.e.replace(/^0/,'').replace(':','.'):''):'');
    var ok=!!noteCur&&ptDone(noteCur,calendarOccurrenceKey(N,k,o,null,ds));if(ok){b.appendChild(okMark());b.classList.add('ok');}b.appendChild(el('span','',t));if(ds.length>1)b.appendChild(el('small','',' +'+(ds.length-1)));
    b.setAttribute('aria-label','Ajankohta: '+t+(ok?', kuitattu':'')+(ds.length>1?', yhteensä '+ds.length:''));}
  else nsChipEmpty();
}
function nsChipEmpty(){
  var b=$('ns-when');if(b.dataset.hasDate)return;
  var details=!!(b.dataset.hasDetails||linkSel);
  b.textContent='';b.classList.toggle('add',!details);
  b.appendChild(el('span','',details?'Tiedot':'+ Päivä'));
  b.setAttribute('aria-label',details?'Tiedot':'Lisää päivä tai aika');
}
function nsDateOpen(){
  var pop=$('ns-datepop'),a=$('ns-when'),text=$('ns-text');
  linkRow();nsInfo();pop.hidden=false;$('ns-datebg').hidden=false;a.setAttribute('aria-expanded','true');nsDt(true);
  if(document.activeElement===text)text.blur();
  var r=a.getBoundingClientRect(),w=Math.min(440,innerWidth-24),left=Math.max(12,Math.min(r.left,innerWidth-w-12));
  var top=Math.max(12,Math.min(r.bottom+6,innerHeight-174));
  pop.style.width=w+'px';pop.style.left=left+'px';pop.style.top=top+'px';
  pop.style.maxHeight=Math.min(innerHeight-top-10,Math.round(innerHeight*.7))+'px';
  var r2=pop.getBoundingClientRect();if(Math.abs(r2.left-left)>1||Math.abs(r2.top-top)>1){pop.style.left=(2*left-r2.left)+'px';pop.style.top=(2*top-r2.top)+'px';}
}
function nsDateClose(){$('ns-datepop').hidden=true;$('ns-datebg').hidden=true;$('ns-when').setAttribute('aria-expanded','false');}
(function(){
  var pop=$('ns-datepop');
  ['ns-dtrow','ns-pinrow','ns-found','ns-ov','ns-linkrow','ns-linkbox','ns-poprow','ns-pop'].forEach(function(id){pop.appendChild($(id));});
  var info=el('div','nsinfo');info.id='ns-info';pop.appendChild(info);
})();
function nsRevealDetail(detail){
  $('ns-tm').hidden=true;
  if($('ns-datepop').hidden)nsDateOpen();
  detail.scrollIntoView({block:'nearest'});
}
/* Kaikki 0.34 (Emil 22.11.2026, kohta 17.4): Tiedot-osio. Muistiinpanon alkutiedot (metatieto) pieninä riveinä tekstikentän ulkopuolella:
   kuittaukset, tunnisteet, omat kentät ym. Omia kenttiä voi muokata; tekstissä olevan sovitun kenttärivin (esim. hinta: 120) voi siirtää tietoihin. */
var NSI_LOCK={tyyppi:1,lahde:1,luotu:1,juuri:1,otsikko:1,kuitattu:1,nakyy:1};
var NSI_LAB={kuitattu:'Kuitattu',tagit:'Tunnisteet',tyyppi:'Tyyppi',lahde:'Kuka kirjoitti',luotu:'Luotu',kuvaus:'Kuvaus',muokattu:'Muokattu',otsikko:'Otsikko'};
function nsInfo(){var box=$('ns-info');if(!box)return;box.textContent='';var n=noteCur;if(!n||!n.vfm)return;
  var rows=[],allowed=new Set();try{allowed=formulaContext().allowed;}catch(e){}
  n.vfm.forEach(function(l){var m=/^([A-Za-z0-9_-]+):\s?(.*)$/.exec(l);if(!m||m[1]==='juuri')return;rows.push([m[1],m[2]]);});
  var pk=n.pts&&typeof n.pts==='object'?Object.keys(n.pts).sort():[];if(pk.length&&!rows.some(function(r){return r[0]==='kuitattu';}))rows.push(['kuitattu',pk.join(', ')]);
  var body=[];String(n.text||'').split('\n').forEach(function(l,i){var m=/^\s*([a-z][a-z0-9_-]*):\s*(\S.*)$/.exec(l);if(m&&allowed.has(m[1]))body.push({i:i,k:m[1],v:m[2].trim()});});
  if(!rows.length&&!body.length)return;box.appendChild(el('div','fh','Tiedot'));
  rows.forEach(function(r){var row=el('div','nsi-row');row.appendChild(el('span','nsi-k',NSI_LAB[r[0]]||r[0]));
    if(NSI_LOCK[r[0]]){var v=r[0]==='kuitattu'?r[1].split(',').map(function(x){x=x.trim();var d=x.slice(0,10);return fiDate(d)+(x.length>10?' klo '+fmtTime(x.slice(11,16)):'');}).join(', '):r[0]==='lahde'?({emil:'oma'}[r[1]]||r[1]):r[1];row.appendChild(el('span','nsi-v',v));}
    else{var inp=el('input','nsi-in');inp.type='text';inp.value=r[1];inp.setAttribute('aria-label',NSI_LAB[r[0]]||r[0]);inp.addEventListener('change',function(){if(!noteCur)return;noteCur.vfm=VAULT.fmSet(noteCur.vfm,r[0],inp.value.trim()===''?null:inp.value.trim());touch();nsInfo();});row.appendChild(inp);}
    box.appendChild(row);});
  if(body.length){box.appendChild(el('div','fh','Tekstissä'));body.forEach(function(b){var row=el('div','nsi-row');row.appendChild(el('span','nsi-k',b.k));row.appendChild(el('span','nsi-v',b.v));
    var mv=button(row,'Siirrä tietoihin','mini nsi-mv',function(){var ta=$('ns-text'),L=ta.value.split('\n');if(!noteCur||L[b.i]===undefined)return;L.splice(b.i,1);ta.value=L.join('\n');noteCur.text=ta.value;noteCur.edited=nowIso();ta.dispatchEvent(new Event('input',{bubbles:true}));
      noteCur.vfm=VAULT.fmSet(noteCur.vfm,b.k,b.v);touch();foundInfo();nsInfo();});mv.setAttribute('aria-label','Siirrä '+b.k+' tietoihin');box.appendChild(row);});}}
$('ns-when').addEventListener('click',function(e){e.stopPropagation();if(!$('ns-datepop').hidden){nsDateClose();return;}nsDateOpen();});
$('ns-datebg').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();nsDateClose();});
/* Esc sulkee ensin auki olevan pikkuikkunan (ajankohdat tai ⋯), ei koko muistiinpanoa */
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(!$('ns-datepop').hidden){e.preventDefault();e.stopPropagation();nsDateClose();$('ns-when').focus();}else if(!$('ns-menu').hidden){e.preventDefault();e.stopPropagation();nsMenuClose();$('ns-more').focus();}},true);
$('nsheet').addEventListener('cancel',function(e){if(!$('ns-datepop').hidden||!$('ns-menu').hidden){e.preventDefault();nsDateClose();nsMenuClose();}});
/* Kaikki 0.6 (Emil 22.11.2026): muistiinpanon lisätoiminnot yhden ⋯-napin takana, jotta teksti saa koko tilan.
   Valikko on ikkunan sisällä (ikkuna on päällimmäisenä); ulkopuolinen napautus sulkee eikä mene läpi. Päivä- ja aikarivi näkyy, kun se on käytössä. */
function nsDt(on){$('ns-dtrow').classList.toggle('off',!on);}
function nsMorePlace(){var d=$('nsheet'),b=$('ns-more'),bar=d.querySelector(':scope>.dbar');if(!wide()&&bar){var h=bar.querySelector('.dhelp');if(b.parentNode!==bar||b.nextSibling!==h)bar.insertBefore(b,h);}
  else{var hr=d.querySelector('.hrow');if(b.parentNode!==hr)hr.insertBefore(b,hr.querySelector('.ibtn'));}}
function nsMenuClose(){$('ns-menu').hidden=true;$('ns-menubg').hidden=true;$('ns-more').setAttribute('aria-expanded','false');}
function nsMenuItem(m,id,txt,fn,cls){var b=el('button',cls||'',txt);b.type='button';b.id=id;b.setAttribute('role','menuitem');b.addEventListener('click',function(){nsMenuClose();fn();});m.appendChild(b);return b;}
function nsMenu(){var m=$('ns-menu'),n=noteCur;m.textContent='';if(n)m.appendChild(el('div','mh nsstamp','Luotu '+stamp(n.created)+(n.edited&&n.edited!==n.created?' · muokattu '+stamp(n.edited):'')));
  if(n&&noteOcc){var on=ptDone(n,noteOcc);nsMenuItem(m,'nsm-ok',on?'Kumoa kuittaus':'OK '+occLabel(noteOcc),function(){$('ns-done').click();});}
  nsMenuItem(m,'nsm-dt','Päivä ja aika',function(){nsDt(true);nsDateOpen();});
  if(n&&vOn()&&n.vp&&!n.arch&&VAULT.visible(n.vp)&&VAULT.kindOf(n.vp,n.vfm)!=='ohje')
    nsMenuItem(m,'nsm-graph','Paikallinen graafi',function(){graphOpen(n);});
  if(n){nsMenuItem(m,'nsm-arch',n.arch?'Palauta arkistosta':'Arkistoi',function(){$('ns-arch').click();});
    nsMenuItem(m,'nsm-del','Poista',function(){$('ns-del').click();},'danger');}
  if(n&&n.vp&&vOn()&&VAULT.visible(n.vp)&&/^[a-z0-9-]+$/.test(VAULT.linkSlug(n.vp)))
    nsMenuItem(m,'nsm-vreq','Pyydä tekoälyä järjestämään',function(){var msg=$('ns-vmsg');
      msg.textContent=vRequest('[['+VAULT.linkSlug(n.vp)+']]');msg.hidden=false;});
  if(vOn()&&vK()&&vK().id===data.k&&metricNoteLines($('ns-text').value).length)
    nsMenuItem(m,'nsm-metrics','Kirjaa mittaririvi',openNoteMetricEntry);
  if(!m.querySelector('button'))return;
  var a=$('ns-more').getBoundingClientRect();m.hidden=false;$('ns-menubg').hidden=false;$('ns-more').setAttribute('aria-expanded','true');var r=m.getBoundingClientRect();
  var left=Math.max(8,Math.min(a.right-r.width,innerWidth-r.width-8)),top=a.top-r.height-8;if(top<8)top=Math.min(innerHeight-r.height-8,a.bottom+8);
  top=Math.max(8,top);m.style.right='auto';m.style.bottom='auto';m.style.left=left+'px';m.style.top=top+'px';
  /* ikkuna voi olla kiinteän sijoittelun vertailukohta (tietokoneella keskitetty laatikko): oikaistaan mitatulla erotuksella */
  var r2=m.getBoundingClientRect();if(Math.abs(r2.left-left)>1||Math.abs(r2.top-top)>1){m.style.left=(2*left-r2.left)+'px';m.style.top=(2*top-r2.top)+'px';}
  var f=m.querySelector('button');if(f)f.focus({preventScroll:true});}
$('ns-more').addEventListener('click',function(e){e.stopPropagation();if(!$('ns-menu').hidden){nsMenuClose();return;}nsMenu();});
$('ns-menubg').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();nsMenuClose();});
$('ns-menu').addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();nsMenuClose();$('ns-more').focus();}});
/* Liitä termiin: tekstistä valittu sana (tai sen osa) lisätään termin sanaksi. Kirjoittaa termin ikkunaan (data), ei puun tekstiin. */
var linkSel='';
function selWord(){var ta=$('ns-text'),a=ta.selectionStart,b=ta.selectionEnd;return a!==b?clean(ta.value.slice(Math.min(a,b),Math.max(a,b))).slice(0,80):'';}
function linkRow(){
  var word=selWord();
  if(word)linkSel=word;else if($('ns-datepop').hidden)linkSel='';
  $('ns-linkrow').hidden=!linkSel||!$('ns-linkbox').hidden;
  if(linkSel)$('ns-link').textContent='Liitä ”'+(linkSel.length>24?linkSel.slice(0,24)+'…':linkSel)+'” asiasanaan';
  nsChipEmpty();
}
['select','keyup','mouseup','touchend'].forEach(function(ev){$('ns-text').addEventListener(ev,function(){setTimeout(linkRow,0);});});
document.addEventListener('selectionchange',function(){if(document.activeElement===$('ns-text'))linkRow();});
$('ns-link').addEventListener('mousedown',function(ev){ev.preventDefault();});
$('ns-link').addEventListener('click',function(){$('ns-word').value=linkSel;renderLinkTerms();$('ns-linkbox').hidden=false;$('ns-linkrow').hidden=true;});
$('ns-linkclose').addEventListener('click',function(){$('ns-linkbox').hidden=true;linkRow();});
function addTermWord(id,w){w=clean(w);if(!w)return false;var raw=null;data.terms.forEach(function(t){if(t.id===id)raw=t;});
  if(raw){if(raw.yes.indexOf(w)<0)raw.yes.push(w);}
  else{var t=null;allTerms().forEach(function(x){if(x.id===id)t=x;});termCache=null;if(!t||!t.key)return false;var cur=data.words[t.key]||{yes:[],no:[]};if(cur.yes.indexOf(w)<0)cur.yes=cur.yes.concat([w]);/* 1.61: muut asetukset (uusiutuminen, kesto, lisätieto, päivän otsikko) säilyvät */var nw=Object.assign({},cur,{yes:cur.yes,no:cur.no||[]});data.words[t.key]=nw;}
  touch();return true;}
function linkDone(name){$('ns-linkbox').hidden=true;setTimeout(function(){foundInfo();paintHl();},0);$('ns-found').insertBefore(el('p','sub','Liitetty asiasanaan '+name+'.'),$('ns-found').firstChild);}
function renderLinkTerms(){var c=$('ns-terms');c.textContent='';var AT=allTerms();termCache=null;
  AT.forEach(function(t){button(c,t.name,'chip',function(){if(addTermWord(t.id,$('ns-word').value))linkDone(t.name);}).dataset.tid=t.id;});}
$('ns-newok').addEventListener('click',function(){var sn=starName($('ns-newterm').value),n=sn.name,w=clean($('ns-word').value);if(!n||!w)return;var t=null;
  data.terms.forEach(function(x){if(keyOf(x.name)===keyOf(n))t=x;});if(!t){t={id:uid('t'),name:n.slice(0,60),yes:[],no:[]};data.terms.push(t);}if(sn.imp)syncImp(t.id,true);
  addTermWord(t.id,w);$('ns-newterm').value='';linkDone(t.name);});
/* Apukysymykset nousevat esiin: rivi "N apukysymystä" vain osumista. Vastaus kirjoittuu heti tekstin loppuun. */
function popList(){var txt=$('ns-text').value,ps=popTerms(allTerms(),txt);termCache=null;return ps;}
function popRow(){var ps=popList(),open=!$('ns-pop').hidden;$('ns-poprow').hidden=!ps.length||open;if(ps.length)$('ns-popbtn').textContent=ps.length+(ps.length===1?' apukysymys':' apukysymystä');}
$('ns-popbtn').addEventListener('click',function(){renderPop();$('ns-pop').hidden=false;$('ns-poprow').hidden=true;});
function renderPop(){var box=$('ns-pop'),ta=$('ns-text');box.textContent='';
  popList().forEach(function(t){var q=t.ask||t.name,c=el('div','card qcard');c.appendChild(el('b','',q));var a=el('textarea');a.rows=2;a.style.marginTop='8px';a.setAttribute('aria-label','Vastaus: '+q);a.value=getAnswer(ta.value,q)||'';a.dataset.q=q;
    function put(v){ta.value=setAnswer(ta.value,q,v);paintHl();foundInfo();}
    a.addEventListener('input',function(){put(a.value);});c.appendChild(a);
    var r=el('div','btnrow');button(r,'Kyllä','mini',function(){a.value='Kyllä';put('Kyllä');});c.appendChild(r);box.appendChild(c);});
  var r2=el('div','btnrow');button(r2,'Sulje kysymykset','mini',function(){box.hidden=true;popRow();});box.appendChild(r2);}
/* Kalenterin +:sta (Emil 22.10.2026): jos tekstissä on oma aika, yksi nappi liittää myös kalenterin kohdan merkinnäksi. Painamatta ei lisää. */
var notePin=null;
function pinOn(){return !!(notePin&&notePin.on&&$('ns-timerow').hidden);}
function pinRow(){var show=!!notePin&&$('ns-timerow').hidden,b=$('ns-pin');$('ns-pinrow').hidden=!show;if(!show)return;
  b.textContent=(notePin.on?'✓ ':'+ ')+'Myös kalenterin kohta klo '+fmtTime(notePin.s)+(notePin.e?'–'+fmtTime(notePin.e):'');b.setAttribute('aria-pressed',notePin.on?'true':'false');}
$('ns-pin').addEventListener('click',function(){if(!notePin)return;notePin.on=!notePin.on;foundInfo();});
/* Tekstin päivän kuitattava kohta: seuraava tuleva päivä, tai mennyt päivä, jos ajankohta on ohi */
function dateKey(o,N,cache,dates,selectedDay){
  var t=todayIso(),k=selectedDay&&occursOn(o,selectedDay)?selectedDay:null;
  if(!k)k=plain(o)?nextOcc(o,t)||o.R[1]:o.R&&!recEnded(o,t)?prevOcc(o,t)||nextOcc(o,t):null;
  return k?calendarOccurrenceKey(N,k,o,cache,dates):null;
}
/* 1.93: tekstissä yliviivataan kuitattu kerta; toistuva vasta, kun sen aikaväli on päättynyt */
function struck(N,o){if(!plain(o)&&o.R)return recEnded(o,todayIso());var k=dateKey(o,N);return !!(k&&N.pts&&N.pts[k]);}
function foundInfo(){if(noteCur&&noteCur._vaultEdit){$('ns-pinrow').hidden=true;$('ns-poprow').hidden=true;return;}
  var txt=$('ns-text').value,N=relLive({text:txt,created:noteCur?noteCur.created:nowIso(),date:$('ns-date').value}),f=$('ns-found');f.textContent='';
  $('ns-timerow').hidden=parseDates(txt,new Date(N.created),nsNl).some(function(o){return o.time;});if(!$('ns-timerow').hidden&&$('ns-ts').value)N.time={s:$('ns-ts').value,e:$('ns-te').value};
  pinRow();if(pinOn()){N.time={s:notePin.s,e:notePin.e};N.pin=1;}
  var ds=noteDates(N),TI=nInf(allTerms(),txt,N),ts=TI.ids;termCache=null;popRow();
  $('ns-text').classList.toggle('nodate',!!clean(txt)&&!ds.length);nsWhen(N,ds,TI);
  var ovs=ovHits(N);termCache=null;
  /* 1.90 (Emil 26.10.2026): ajankohdat allekkain tekstin kokoisina, muotoiltu aika ensin ja kirjoitettu muoto suluissa.
     Jokaisella rivillä oma kuittausnappi, myös tulevalla (sama kuittaus kuin kalenterissa ja listan aikakohteessa). Toistuvasta kuitataan seuraava kerta. */
  if(ds.length){f.appendChild(el('div','fh','Ajankohdat'));var dl=el('div','dlist'),keys=new Map(),selectedDay=noteOcc&&noteOcc.slice(0,10);dl.id='ns-dlist';ds.forEach(function(o){var h=ovs.filter(function(x){return x.o.src===o.src&&x.o.a===o.a&&x.o.s===o.s;})[0],row=el('div','drow'),
      key=noteCur?dateKey(o,N,keys,ds,selectedDay):null;
      /* Kaikki 0.6 (Emil 22.11.2026): muistiinpanossa ei kuitata; kalenterissa kuitattu päivä näkyy tässä vihreänä väkäsenä */
      if(key){var on=!!(noteCur.pts&&noteCur.pts[key]),cb=el('span','dckv'+(on?' on':''));if(on){cb.appendChild(okMark());cb.setAttribute('role','img');cb.setAttribute('aria-label','Kuitattu kalenterissa');}row.appendChild(cb);}
      else row.appendChild(el('span','dck0'));
      var i=el('i',h?'ov':'');i.appendChild(el('b','',dateLabel(o)));i.appendChild(el('span','dsrc',' ('+o.src+')'+(o.locked&&o.locked.w!==o.locked.o?' · kirjoitettu ”'+o.locked.o+'”':'')+(h?' · päällekkäin':'')+(key&&!plain(o)?(key.slice(0,10)<=todayIso()?' · kerta ':' · seuraava ')+occLabel(key):'')+(!key&&recEnded(o,todayIso())?' · päättynyt':'')));if(!key&&recEnded(o,todayIso()))i.classList.add('dend');
      if(h){i.setAttribute('role','button');i.tabIndex=0;i.addEventListener('click',function(){showOv($('ns-ov').hidden?h:null);});}
      else if(o.s!==undefined){i.className='tml';i.setAttribute('role','button');i.tabIndex=0;i.addEventListener('click',function(){var c=whenSpan(o).s,m=tmAt(c);if(m)tmPop(m,i.getBoundingClientRect().top,c);});}
      if(hidNote(o)){i.classList.add('hd');i.lastChild.appendChild(document.createTextNode(' · '+hidTxt(o.a)));}row.appendChild(i);dl.appendChild(row);});f.appendChild(dl);}
  if(ts.length){f.appendChild(document.createTextNode('Asiasanat: '));var hs=termHits(allTerms(),txt),seen={};termCache=null;
    ts.forEach(function(id){var ws=[];hs.forEach(function(h){var w=txt.slice(h.s,h.e);if(h.id===id&&ws.indexOf(w)<0)ws.push(w);});seen[id]=1;var ti=el('i','th',(ws.length?ws.join(', ')+' → ':'')+termName(id));ti.setAttribute('role','button');ti.tabIndex=0;ti.dataset.tid=id;
      var go=function(){openTerm(id,function(){termCache=null;foundInfo();paintHl();});};ti.addEventListener('click',go);ti.addEventListener('keydown',function(ev){if(ev.key==='Enter')go();});f.appendChild(ti);if(flowLink(id))button(f,'Avaa työnkulku','dck',function(){startNoteFlow(id);}).dataset.flow=id;});}
  /* 1.80: päätellyt asiasanat (ehdoista) haaleampina, napautus avaa kortin */
  if(TI.inf.length){f.appendChild(el('br'));f.appendChild(document.createTextNode('Päätelty: '));TI.inf.forEach(function(id){var ti=el('i','th inf',termName(id));ti.setAttribute('role','button');ti.tabIndex=0;ti.dataset.tid=id;
      var go=function(){openTerm(id,function(){termCache=null;foundInfo();paintHl();});};ti.addEventListener('click',go);ti.addEventListener('keydown',function(ev){if(ev.key==='Enter')go();});f.appendChild(ti);if(flowLink(id))button(f,'Avaa työnkulku','dck',function(){startNoteFlow(id);}).dataset.flow=id;});termCache=null;}
  var lr=rowOf(noteCur);if(lr){f.appendChild(el('br'));button(f,'Listassa: '+(lr.name||'rivi'),'dck',function(){$('ns-ok').click();openChk(lr);}).id='ns-lst';}
  /* 1.99: mille listan riveille teksti menee (rivin Poimii tekstit) */
  var LT=listTargets(txt);if(LT.length){var lp=el('p','sub','Listalle: '+LT.join(', '));lp.id='ns-listalle';f.appendChild(lp);}}
function listTargets(txt){if(!clean(txt))return [];var AT=allTerms(),PT=tunOn()?partTerms(AT,txt):noteParts(txt).map(function(){return [];}),N={text:txt},out=[];termCache=null;
  (data.chk||[]).forEach(function(r){if(r.l||!r.px||(noteCur&&r.nid===noteCur.id))return;if(noteParts(txt).some(function(p,i){return pxMatch(r,N,i,PT[i]||[]).length;}))out.push(r.name||'(nimetön)');});return out;}
/* Tunnistetut ajankohdat korostetaan tekstin taakse heti, kun niiden perään on kirjoitettu välilyönti tai rivinvaihto */
/* Termin laukaiseva sana alleviivataan samoin heti, kun sana on valmis (perässä jokin muu kuin kirjain). */
/* Päällekkäiset: jokaiselle kellonajalliselle ajankohdalle saman päivän muut (ei tämä muistiinpano, ei kuitatut) aikavälin osuessa yhteen */
/* Esikatselu lukitsee kuten tallennus: vanhat lukot kopiona, uusi suhteellinen sana tähän hetkeen */
function relLive(N){N.nl=nsNl;if(noteCur&&noteCur.rel)N.rel=noteCur.rel.map(function(L){return {w:L.w,o:L.o,at:L.at,d:L.d};});lockRel(N,new Date());return N;}
function liveN(){var N={text:$('ns-text').value,created:noteCur?noteCur.created:nowIso(),date:$('ns-date').value};relLive(N);
  if(!$('ns-timerow').hidden&&$('ns-ts').value)N.time={s:$('ns-ts').value,e:$('ns-te').value};if(pinOn()){N.time={s:notePin.s,e:notePin.e};N.pin=1;}return N;}
function ovHits(N){var out=[],others=calNotes().filter(function(n){return n!==noteCur;}),dur=durMin();
  noteDates(N).forEach(function(o){if(!o.time||!o.a)return;var s0=toMin(o.time.s),e0=o.time.e?toMin(o.time.e):s0+dur;if(e0<=s0)e0=Math.min(1440,s0+dur);
    var L=dayEntries(others,o.a,dur).timed.filter(function(x){return x.s<e0&&s0<x.e&&!ptDone(x.n,occKey(o.a,x.o));});if(L.length)out.push({o:o,list:L});});
  return out;}
var ovNow=[],relNow=[],mvNow=[];
function showOv(h){var b=$('ns-ov');b.textContent='';if(!h){b.hidden=true;return;}
  b.appendChild(el('b','','Samaan aikaan '+fiDate(h.o.a)+':'));
  h.list.forEach(function(x){b.appendChild(el('div','',(calTitle(x.n,x.o)||'(tyhjä)')+' · klo '+fmtTime(fromMin(x.s))+'–'+fmtTime(fromMin(x.e))+(x.open?' (oletuspituus)':'')));});b.hidden=false;nsRevealDetail(b);}
/* Kalenterissa muutettu aika: napautus näyttää historian (1.39) */
function mvLines(m){return m.h.map(function(x,i){return stamp(x.at)+': ”'+x.t+'” → ”'+(i+1<m.h.length?m.h[i+1].t:m.w)+'”';});}
function showMv(m){var b=$('ns-ov');if(b.hidden)b.textContent='';b.appendChild(el('b','relh','Muutettu kalenterissa:'));mvLines(m).forEach(function(l){b.appendChild(el('div','',l));});b.hidden=false;}
/* Muuttunut suhteellinen sana: napautus näyttää alkuperäisen ja kirjoitushetken */
function showRel(L){var b=$('ns-ov');if(b.hidden)b.textContent='';b.appendChild(el('b','relh','Kirjoitettu '+stamp(L.at)+':'));b.appendChild(el('div','','”'+L.o+'” → '+fromIsoW(L.d)));b.hidden=false;}
/* Aikalinkin valikko (Emil 23.10.2026, 1.52): napautus tunnistettuun ajankohtaan avaa valikon tekstin alle.
   Kuittaa (sama kuittaus kuin kalenterissa), Muokkaa aikaa (kiinteäksi päiväykseksi), Historia, Samaan aikaan, Pura linkki (tavallista tekstiä, kunnes muokataan). */
var nsNl=[],tmEdit=false;
function tmAt(c){var MV=mvAt(c);if(MV)return $('ns-text').readOnly?{mv:MV}:null;var N=liveN(),o=noteDates(N).filter(function(x){if(x.s===undefined)return false;var w=whenSpan(x);return c>=w.s&&c<=w.e;})[0];if(o)return {o:o};
  var m=nlSpans($('ns-text').value,nsNl).filter(function(x){return c>=x.s&&c<=x.e;})[0];if(m)return {nl:m};
  /* Asiasanalinkki (Emil 23.10.2026, 1.53): sana, joka laukaisee asiasanoja */
  var txt=$('ns-text').value,H=(tunOn()?termHits(allTerms(),txt):[]).filter(function(h){return c>=h.s&&c<=h.e;}),ids=[];termCache=null;H.forEach(function(h){if(ids.indexOf(h.id)<0)ids.push(h.id);});
  if(ids.length)return {terms:ids,w:txt.slice(H[0].s,H[0].e)};
  var W=wlText(txt).filter(function(h){return h.e<txt.length&&c>=h.s&&c<=h.e;})[0];return W?{wl:W}:null;}
/* Kaikki 0.58 (Emil 23.11.2026): valikko kelluu napsautuskohdan vieressä eikä työnnä tekstiä tai ikkunaa (ennen se lisättiin tekstin alle
   asetteluun, jolloin ikkuna pomppasi kursoria linkin kohdalle napsautettaessa). Muokatessa ilman taustaa, jotta seuraava napsautus osuu tekstiin. */
function tmOpen(y){var ta=$('ns-text'),c=ta.selectionStart,b=$('ns-tm');if(ta.selectionEnd!==c){b.hidden=true;return;}var h=tmAt(c);tmEdit=false;$('ns-ov').hidden=true;
  if(!h){b.hidden=true;return;}if(y==null){var r=ta.getBoundingClientRect();y=Math.max(r.top,Math.min(r.bottom,innerHeight/2));}
  tmCur=h;tmPos=c;b.classList.add('pop','float');renderTm(h);if(b.hidden)return;tmPlace(y);}
function tmPlace(y){var b=$('ns-tm'),H=b.offsetHeight,top=y+28;if(top+H>innerHeight-12)top=Math.max(12,y-H-20);b.style.top=top+'px';}
function tmRefresh(){paintHl();foundInfo();var ta=$('ns-text'),pop=$('ns-tm').classList.contains('pop');renderTm(tmAt(pop?tmPos:ta.selectionStart));}
function renderTm(h){var b=$('ns-tm');b.textContent='';if(!h){b.hidden=true;return;}var ta=$('ns-text'),txt=ta.value,r=el('div','btnrow');
  if(h.mv){var o=h.mv,k=mvDefinition('variables',o.nimi).key,G=mvRegistry().find(function(g){return g.key===k;}),n=G?G.obs.length:1;b.appendChild(el('b','mvh',o.kohde||o.nimi));
    (o.block?o.block.fields:[o]).forEach(function(field){
      var kind=field.totuus!=null?'totuusarvo':field.luku===null?'teksti':'luku';
      b.appendChild(el('p','mvinfo',(o.block?field.nimi:'Arvo')+': '+field.arvo+' ('+kind+')'));
    });
    b.appendChild(el('p','mvinfo',o.paivat.length?(o.paivat.length>1?'Päivät: ':'Päivä: ')+mvDays(o)+(o.lahde==='merkintä'?' · merkinnästä':' · osion tekstistä'):o.block?'Päivätön':'Päivätön: '+(o.syy==='monta'?'osiossa on useita päiviä.':'osiossa ei ole päivää.')));
    button(r,n+(n===1?' merkintä':' merkintää')+' muuttujalla','mini',function(){b.hidden=true;openMuuttujat(k);}).id='tm-mv';b.appendChild(r);b.hidden=false;return;}
  if(h.terms){b.appendChild(el('b','','”'+h.w+'” → muistiinpanot asiasanalla'));
    h.terms.forEach(function(id){button(r,termName(id)||'?','mini tmterm',function(){var B=backArm(),tx=$('ns-text').value;$('ns-ok').click();B.n=noteCur&&noteCur.text===tx?noteCur:data.notes.filter(function(x){return x.text===tx;})[0]||null;noteFilter=[id];noteView='open';showTab('notes');activeScroller().scrollTop=0;render();backShow(B);}).dataset.tid=id;});termCache=null;b.appendChild(r);b.hidden=false;return;}
  if(h.wl){var W=h.wl,NS=data.notes.filter(function(n){return W.ids.indexOf(n.id)>=0;}).sort(function(a,b){return String(b.edited||b.created||'')<String(a.edited||a.created||'')?-1:1;});
    b.appendChild(el('b','','”'+W.w+'” → '+NS.length+(NS.length===1?' muu muistiinpano':' muuta muistiinpanoa')));
    function go(fn){var B=backArm(),tx=$('ns-text').value;$('ns-tm').hidden=true;$('ns-ok').click();B.n=noteCur&&noteCur.text===tx?noteCur:data.notes.filter(function(x){return x.text===tx;})[0]||null;fn();backShow(B);}
    NS.slice(0,6).forEach(function(n){var t=clean(String(n.text||'').split('\n')[0])||'(tyhjä)';button(b,t,'mini tmnote',function(){go(function(){openNote(n);});}).dataset.nid=n.id;});
    if(NS.length>6)button(r,'Kaikki ('+NS.length+')','mini',function(){go(function(){noteQuery=W.key.replace(/^=/,'');noteFilter=[];noteView='open';showTab('notes');activeScroller().scrollTop=0;render();});}).id='tm-wlall';
    if(!kt())button(r,'Tee asiasanaksi','mini',function(){var nm=clean(W.w);var t=data.terms.filter(function(x){return keyOf(x.name)===keyOf(nm);})[0];
      if(!t){t={id:uid('t'),name:nm.slice(0,60),yes:W.key.charAt(0)==='='?[]:[W.key],no:[]};data.terms.push(t);}touch();termCache=null;tmRefresh();}).id='tm-wlterm';
    button(r,'Älä linkitä','mini',function(){var c=data.cfg||(data.cfg={});c.wlno=clean((c.wlno||'')+' '+clean(W.w).toLowerCase());save();touch();$('ns-tm').hidden=true;paintHl();}).id='tm-wlno';
    b.appendChild(r);b.hidden=false;return;}
  if(h.nl){b.appendChild(el('b','','Tavallista tekstiä: ”'+h.nl.m.w+'”'));
    button(r,'Palauta aikalinkiksi','mini',function(){nsNl=nsNl.filter(function(x){return x!==h.nl.m;});tmRefresh();}).id='tm-relink';b.appendChild(r);b.hidden=false;return;}
  var o=h.o,w=whenSpan(o),key=noteCur?dateKey(o,liveN(),null,null,noteOcc&&noteOcc.slice(0,10)):null;
  b.appendChild(el('b','',txt.slice(w.s,w.e)+' → '+dateLabel(o)+(hidNote(o)?' · '+hidTxt(o.a):'')));
  if(key){var on=!!(noteCur.pts&&noteCur.pts[key]),kb=button(r,on?'Kuitattu '+occLabel(key)+' ✓':'Kuittaa '+occLabel(key),'mini okbtn',function(){calOk(noteCur,key);stateRow(noteCur);tmRefresh();});kb.id='tm-done';kb.setAttribute('aria-pressed',on?'true':'false');}
  var one=!o.rec&&o.a===o.b;if(one)button(r,'Muokkaa aikaa','mini',function(){tmEdit=!tmEdit;renderTm(h);}).id='tm-edit';
  var rl=relNow.filter(function(m){return m.sp.s>=w.s&&m.sp.e<=w.e;})[0],mm=mvNow.filter(function(m){return m.s<w.e&&w.s<m.e;})[0],ov=ovNow.filter(function(x){return x.o.s===o.s&&x.o.e===o.e;})[0];
  if(rl||mm)button(r,'Historia','mini',function(){var x=$('ns-ov');x.textContent='';x.hidden=true;if(rl)showRel(rl.lock);if(mm)showMv(mm.m);nsRevealDetail(x);}).id='tm-hist';
  if(ov)button(r,'Samaan aikaan ('+ov.list.length+')','mini',function(){showOv(ov);}).id='tm-ov';
  button(r,'Pura linkki','mini',function(){nsNl=nsNl.concat([{w:txt.slice(w.s,w.e),at:nowIso()}]);$('ns-ov').hidden=true;tmRefresh();}).id='tm-unlink';
  b.appendChild(r);
  if(tmEdit&&one){var ed=el('div','tmed'),di=el('input'),si=el('input'),ei=el('input');di.type='date';di.id='tm-date';di.value=o.a;si.type='time';si.id='tm-s';ei.type='time';ei.id='tm-e';
    si.value=o.time?o.time.s:'';ei.value=o.time&&o.time.e?o.time.e:'';si.setAttribute('aria-label','Alkaa');ei.setAttribute('aria-label','Päättyy');ed.appendChild(di);ed.appendChild(si);ed.appendChild(ei);b.appendChild(ed);
    var er=el('div','btnrow');er.style.marginTop='8px';button(er,'Peru','mini',function(){tmEdit=false;renderTm(h);});
    button(er,'Tallenna aika','mini okbtn',function(){var T={text:ta.value,date:$('ns-date').value,mv:noteCur&&noteCur.mv?noteCur.mv:undefined},msg=setWhen(T,o,di.value,si.value,si.value?ei.value:'');
      if(msg){b.appendChild(el('p','msg warn',msg));return;}ta.value=T.text;$('ns-date').value=T.date||'';if(noteCur&&T.mv)noteCur.mv=T.mv;tmEdit=false;b.hidden=true;b.textContent='';
      syncAdds();paintHl();foundInfo();}).id='tm-save';b.appendChild(er);}
  b.hidden=false;}
$('ns-text').addEventListener('click',function(){var ta=this;if(!ta.readOnly)return;if(ta.selectionStart===ta.selectionEnd&&tmAt(ta.selectionStart))return;
  ta.readOnly=false;$('nsheet').classList.remove('reading');ta.removeAttribute('aria-describedby');$('ns-formula-results').hidden=true;kbKeep(ta);try{ta.focus({preventScroll:true});}catch(e){ta.focus();}});
$('ns-text').addEventListener('click',function(ev){var y=ev.clientY;setTimeout(function(){tmOpen(y);},0);});
document.addEventListener('pointerdown',function(ev){var b=$('ns-tm');if(b.hidden||!b.classList.contains('float'))return;if(b.contains(ev.target)||ev.target===$('ns-text'))return;b.hidden=true;tmEdit=false;},true);
/* 1.64 (Emil 23.10.2026): puhelimella tekstin aika- ja asiasanalinkki toimii kuin nappi. Lyhyt napautus linkkiin ei vie kursoria
   eikä avaa näppäimistöä (touchend estetään), vaan avaa valikon päälle; tausta lukittuu ja ulkopuolen napautus sulkee.
   Vieritys alkaa linkin päältäkin normaalisti. Hiirellä ennallaan. Kohta haetaan väripinnan (ns-hl) osien sijainneista. */
function hlOffsetAt(x,y){var hl=$('ns-hl'),at=0,hit=-1;Array.prototype.forEach.call(hl.childNodes,function(n){var len=n.nodeType===1&&n.dataset.sourceLength?Number(n.dataset.sourceLength):(n.textContent||'').replace(/​/g,'').length;
    if(hit<0&&n.nodeType===1){var R=n.getClientRects();for(var i=0;i<R.length;i++){var r=R[i];if(x>=r.left-2&&x<=r.right+2&&y>=r.top-3&&y<=r.bottom+3){hit=at+Math.max(0,Math.min(len-1,Math.floor(len/2)));break;}}}at+=len;});return hit;}
var tmTouch=null;
$('ns-text').addEventListener('touchstart',function(ev){var t=ev.touches[0];tmTouch=ev.touches.length===1?{x:t.clientX,y:t.clientY,at:Date.now()}:null;},{passive:true});
$('ns-text').addEventListener('touchmove',function(ev){if(!tmTouch)return;var t=ev.touches[0];if(Math.abs(t.clientX-tmTouch.x)>8||Math.abs(t.clientY-tmTouch.y)>8)tmTouch=null;},{passive:true});
$('ns-text').addEventListener('touchend',function(ev){var T=tmTouch;tmTouch=null;if(!T||Date.now()-T.at>600)return;/* 0.58: muokatessa napautus vie kursorin eikä sulje näppäimistöä (ikkuna pomppasi); valikko kelluu click-tapahtumasta */if(!this.readOnly)return;var c=hlOffsetAt(T.x,T.y);if(c<0)return;var h=tmAt(c);if(!h)return;
  ev.preventDefault();if(document.activeElement===this)this.blur();tmPop(h,T.y,c);},{passive:false});
function tmPop(h,y,c){var b=$('ns-tm');tmEdit=false;$('ns-ov').hidden=true;tmCur=h;tmPos=c;b.classList.remove('float');b.classList.add('pop');renderTm(h);if(b.hidden)return;$('ns-tmbg').hidden=false;
  var H=b.offsetHeight,top=y+28;if(top+H>innerHeight-12)top=Math.max(12,y-H-20);b.style.top=top+'px';}
var tmCur=null,tmPos=-1;
function tmSync(){var b=$('ns-tm');if(b.hidden){b.classList.remove('pop','float');b.style.top='';}$('ns-tmbg').hidden=b.hidden||!b.classList.contains('pop')||b.classList.contains('float');}
new MutationObserver(tmSync).observe($('ns-tm'),{attributes:true,attributeFilter:['hidden']});
$('ns-tmbg').addEventListener('click',function(ev){ev.preventDefault();$('ns-tm').hidden=true;tmEdit=false;});
$('ns-tmbg').addEventListener('touchmove',function(ev){ev.preventDefault();},{passive:false});
$('ns-text').addEventListener('input',function(){$('ns-tm').hidden=true;tmEdit=false;});
/* 1.81 (Emil 24.10.2026): päiväykset lasketaan aina oikean kalenterin mukaan. Jos päiväys osuu projektin kalenterista poistetulle
   viikonpäivälle, se jää ennalleen, mutta aikalinkki on harmaa ja tulkinnassa lukee, ettei päivä näy kalenterissa (merkintä näkyy seuraavan päivän Koko päivä -osiossa). */
function hidDay(iso){var v=data.calv;return !!(v&&v.off&&v.off.length&&iso)&&v.off.indexOf(fromIso(iso).getDay())>=0;}
function hidNote(o){return !!o&&o.a===o.b&&!o.rec&&hidDay(o.a);}
function formulaDisplay(value){
  return typeof value==='boolean'?(value?'kyllä':'ei'):typeof value==='number'?String(value).replace('.',','):String(value??'');
}
function formulaContext(override){
  var doc=vOn()&&VC.files['ohjeet/muistiinpanot.md'],allowed=KAAVA.allowedFields(doc&&doc.t),engine=null;
  function tables(){
    if(engine)return engine;
    var known=new Set(data.notes.map(function(n){return n.vp;}));
    var live=data.notes.filter(function(n){return !n.arch;});
    if(override)live=live.map(function(n){return n.id===override.id?override:n;});
    var notes=live.slice();
    if(vOn()&&vK()&&vK().id===data.k)Object.keys(VC.files).forEach(function(path){
      if(!VAULT.visible(path)||known.has(path)||/^nakymat\/|^taulukot\//.test(path))return;
      var file=VC.files[path],pending=VC.q[path];
      if(pending&&pending.del||VAULT.kindOf(path,VAULT.split(file.t).fm)==='ohje')return;
      var note=VAULT.noteOf(path,file.t);if(!note.arch)notes.push(note);
    });
    if(override&&!notes.includes(override))notes.push(override);
    var sheets=sheetFiles();sgFillViews(sheets,notes,allowed);engine=TAULUKKO.create(sheets,notes,allowed);return engine;
  }
  return {allowed:allowed,get:function(){return tables().formulas;},tables:tables};
}
function noteFormulaSpans(text){
  if(text.indexOf('{=')<0)return [];
  var spans=[],pattern=/```[\s\S]*?(?:```|$)|`[^`\r\n]*`|\{(=(?:"(?:[^"\\\r\n]|\\["\\])*"|[^}"\r\n])*)\}/g,match;
  while((match=pattern.exec(text))){
    if(match[1])spans.push({start:match.index,end:pattern.lastIndex,source:match[1]});
  }
  return spans;
}
function paintFormulaSpans(text,ta,flags){
  var results=$('ns-formula-results');
  results.textContent='';results.hidden=true;ta.removeAttribute('aria-describedby');
  var spans=ta.readOnly?noteFormulaSpans(text):[],computed=new Map();
  if(!spans.length)return computed;
  var source=noteCur?Object.assign({},noteCur,{text:text}):{text:text},context=formulaContext(source).get(),terms=[];
  spans.forEach(function(span){
    var result=context.run(span.source,source),label=result.error||formulaDisplay(result.value);
    span.result=label;span.error=!!result.error;terms.push(label);computed.set(span.start,span);
    for(var i=span.start;i<span.end;i++)flags[i]=65536+span.start;
  });
  results.textContent='Kaavojen tulokset: '+terms.join(', ');results.hidden=false;ta.setAttribute('aria-describedby','ns-formula-results');
  return computed;
}
/* Kaikki 0.65 (Emil 23.11.2026): tekstimuuttujat !!nimi: arvo!! näkyviin. Muokatessa !! haaleana ja nimi ja arvo katkoviivalla alleviivattuina
   (sama leveys kuin tekstikentässä), lukutilassa !! piilossa, kevyt pohja ja arvo lihavoituna. Lukutilassa napautus avaa pienen infoikkunan
   (nimi, arvo, päivät ja niiden lähde, päivättömän syy); muokatessa ikkuna pysyy suljettuna. Muuttujat-luettelo kokoaa kaikki merkinnät. */
var MVBIT=1073741824;
function mvBase(){return new Date(noteCur?noteCur.created:nowIso());}
function mvAt(c){
  var matches=MUUTTUJA.parse($('ns-text').value,mvBase()).filter(function(o){return c>=o.s&&c<o.e;});
  return matches.find(function(o){return c>=o.ns&&c<o.ve;})||matches[0]||null;
}
function mvEl(txt,o){var w=el('span','mvr'),cuts=[[o.s,o.s+2,'mvm']],at=o.s;
  if(o.ds>=0)cuts.push([o.ds,o.de,'mvd']);
  (o.block?o.block.fields:[o]).forEach(function(f){cuts.push([f.ns,f.ne,'mvn'],[f.vs,f.ve,'mvv']);});
  if(o.block&&o.block.id)cuts.push([o.block.idS,o.block.idE,'mvm']);
  cuts.sort(function(a,b){return a[0]-b[0];});
  cuts.push([o.e-2,o.e,'mvm']);w.dataset.sourceLength=String(o.e-o.s);
  cuts.forEach(function(c){if(c[0]>at)w.appendChild(el('span','mvc',txt.slice(at,c[0])));w.appendChild(el('span',c[2],txt.slice(c[0],c[1])));at=c[1];});return w;}
function mvDay(iso){var d=fromIso(iso);return WDS[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();}
function mvDays(o){return o.paivat.length?o.paivat.map(mvDay).join(', ')+(o.kello?' klo '+o.kello:''):'päivätön';}
/* Kaikki tämän projektin muistiinpanot (myös suodattimen piilottamat Vaultin tiedostot, kuten kaavoissa); ei arkistoituja eikä tekoälyn ohjeita */
function mvNotes(){var notes=data.notes.filter(function(n){return !n.arch;}),known=new Set(data.notes.map(function(n){return n.vp;}));
  if(vOn()&&vK()&&vK().id===data.k)Object.keys(VC.files).forEach(function(path){
    if(!VAULT.visible(path)||known.has(path)||/^nakymat\/|^taulukot\//.test(path))return;var file=VC.files[path],pending=VC.q[path];
    if(pending&&pending.del||VAULT.kindOf(path,VAULT.split(file.t).fm)==='ohje')return;var n=VAULT.noteOf(path,file.t);if(!n.arch)notes.push(n);});
  if(noteCur&&$('nsheet').open&&!noteCur._vaultEdit)notes=notes.map(function(n){return n===noteCur?Object.assign({},n,{text:$('ns-text').value}):n;});
  return notes;}
function mvRegistry(notes){
  var by=new Map();
  function add(name,obs){
    var definition=mvDefinition('variables',name),key=definition.key;
    if(key&&!by.has(key))by.set(key,{nimi:definition.name,key:key,obs:[]});
    if(key&&obs)by.get(key).obs.push.apply(by.get(key).obs,obs);
  }
  MUUTTUJA.luettelo(notes||mvNotes()).forEach(function(g){add(g.nimi,g.obs);});
  mvCatalog().variables.forEach(function(def){add(def.name);});
  if(vOn()&&vK()&&vK().id===data.k)nvViews().forEach(function(view){
    view.cols.forEach(function(col){
      add(nvVariableName(col.k));
    });
  });
  if(vOn())Object.values(observationViews()).forEach(function(view){
    view.columns.map(function(column){return column.name;}).concat(view.variable||[]).forEach(function(name){
      add(name);
    });
  });
  return Array.from(by.values()).sort(function(a,b){return a.nimi.localeCompare(b.nimi,'fi');});
}
function mvSubjects(notes){
  var by=new Map();
  function add(name){var d=mvDefinition('subjects',name);if(d.key&&!by.has(d.key))by.set(d.key,d.name);}
  mvCatalog().subjects.forEach(function(def){add(def.name);});
  (notes||mvNotes()).forEach(function(n){MUUTTUJA.observe(n).forEach(function(o){add(o.kohde);});});
  if(vOn()){
    mvbCards().forEach(function(row){add(row[10]);});
    Object.values(observationViews()).forEach(function(view){(view.subjects||[]).forEach(add);});
  }
  return Array.from(by.values()).sort(function(a,b){return a.localeCompare(b,'fi');});
}
function mvLast(G){var best=null;G.obs.forEach(function(x){var d=x.o.paivat[x.o.paivat.length-1]||'';if(!best||d>best.d)best={d:d,x:x};});return best;}
function mvTitle(n){return noteTitle(n)||(n.vp?VAULT.linkSlug(n.vp):'')||'Nimetön';}
function mvOpenNote(n,d){closeSheet(d);var N=data.notes.indexOf(n)>=0?n:(n.vp?vNoteOf(n.vp.replace(/\.md$/i,'')):null)||data.notes.filter(function(x){return x.id===n.id;})[0];
  if(!N){toast('Muistiinpanoa ei voi avata (piilotettu tai arkistoitu).');return;}
  if($('nsheet').open){if(noteCur===N)return;$('ns-ok').click();}openNote(N);}
function openMuuttujat(key){var d=$('mv-sheet');
  if(!d){d=el('dialog');d.id='mv-sheet';d.setAttribute('aria-labelledby','mv-title');SMALL[d.id]=1;document.body.appendChild(d);d.onclick=function(e){if(e.target===d)closeSheet(d);};}
  var L=mvRegistry(),G=key?L.filter(function(g){return g.key===key;})[0]:null;d.textContent='';
  var h=el('h2','',G?G.nimi:'Muuttujat');h.id='mv-title';d.appendChild(h);
  if(!G){button(d,'Havaintotaulukot','btn',function(){closeSheet(d);openObservationView();});
    if(vOn())button(d,'Kohde- ja muuttujamääritykset','btn',function(){closeSheet(d);openMvCatalog();});}
  if(G){var back=button(d,'‹ Muuttujat','mini',function(){openMuuttujat(null);});back.id='mv-back';
    var nums=G.obs.map(function(x){return x.o.luku;}).filter(function(v){return v!==null;}),sum=el('p','sub mvsum',G.obs.length+(G.obs.length===1?' merkintä':' merkintää'));
    if(nums.length)sum.textContent+=' · luvut: '+nums.length+' · keskiarvo '+formulaDisplay(Math.round(nums.reduce(function(a,b){return a+b;},0)/nums.length*100)/100)+' · pienin '+formulaDisplay(Math.min.apply(null,nums))+' · suurin '+formulaDisplay(Math.max.apply(null,nums));
    d.appendChild(sum);
    var rows=G.obs.slice().sort(function(a,b){var x=a.o.paivat[a.o.paivat.length-1]||'',y=b.o.paivat[b.o.paivat.length-1]||'';return x===y?0:!x?1:!y?-1:x<y?1:-1;}),list=el('div','mvlist');list.id='mv-obs';
    rows.forEach(function(x){var b=button(list,'','btn mvrow',function(){mvOpenNote(x.n,d);});b.appendChild(el('b','',x.o.arvo));
      b.appendChild(el('span','mvwhen',mvDays(x.o)));b.appendChild(el('span','mvsrc',mvTitle(x.n)));b.setAttribute('aria-label',G.nimi+' '+x.o.arvo+', '+mvDays(x.o)+', '+mvTitle(x.n));});
    d.appendChild(list);
  }else if(!L.length)d.appendChild(el('p','sub','Ei muuttujia. Kirjaa tekstiin esimerkiksi ((Uni (h) = 8)).'));
  else{var list2=el('div','mvlist');list2.id='mv-list';
    L.forEach(function(g){var last=mvLast(g),b=button(list2,'','btn mvrow',function(){openMuuttujat(g.key);});b.dataset.key=g.key;b.appendChild(el('b','',g.nimi));
      b.appendChild(el('span','mvwhen',g.obs.length+(g.obs.length===1?' merkintä':' merkintää')));
      if(last)b.appendChild(el('span','mvsrc','viimeisin '+last.x.o.arvo+(last.d?' · '+mvDay(last.d):' · päivätön')));});
    d.appendChild(list2);}
  if(!d.open)openSheet(d);var f=d.querySelector('#mv-back,.mvrow');if(f)try{f.focus({preventScroll:true});}catch(e){}}
var OBSERVATION_VIEWS='data/havaintonakymat.json';
var OBSERVATION_AXES={kohde:'Kohde',kirjaus:'Kirjaus',paiva:'Päivä',viikko:'Viikko',muuttuja:'Muuttuja'};
var OBSERVATION_CATALOG='data/havaintomaaritykset.json',mvCatalogFile,mvCatalogValue={subjects:[],variables:[]};
function mvCatalogRead(text){
  if(!text)return {version:1,subjects:[],variables:[]};
  try{
    var doc=JSON.parse(text);
    return doc.version===1&&['subjects','variables'].every(function(kind){
      return Array.isArray(doc[kind])&&doc[kind].every(function(x){
        return x&&typeof x.id==='string'&&typeof x.name==='string'&&Array.isArray(x.aliases)&&x.aliases.every(function(a){return typeof a==='string';});
      });
    })?doc:null;
  }catch(e){return null;}
}
function mvCatalog(){
  var file=vOn()&&VC.files[OBSERVATION_CATALOG];
  if(file!==mvCatalogFile){
    var doc=mvCatalogRead(file?.t)||{subjects:[],variables:[]};
    mvCatalogFile=file;mvCatalogValue=doc;
  }
  return mvCatalogValue;
}
function mvDefinition(kind,name){
  var key=MUUTTUJA.key(name),parts=MUUTTUJA.unitParts(name);
  if(key){
    var definitions=mvCatalog()[kind];
    function named(def,n){return [def.name].concat(def.aliases).some(function(alias){return MUUTTUJA.key(alias)===n;});}
    var def=definitions.find(function(x){return named(x,key);});
    if(!def&&kind==='variables'&&parts.unit){
      var matches=definitions.filter(function(x){
        return MUUTTUJA.unitKey(x.unit||MUUTTUJA.unitParts(x.name).unit)===MUUTTUJA.unitKey(parts.unit)&&
          [x.name].concat(x.aliases).some(function(n){return MUUTTUJA.key(MUUTTUJA.unitParts(n).name)===MUUTTUJA.key(parts.name);});
      });
      if(matches.length===1)def=matches[0];
    }
    if(def)return Object.assign({key:def.id},def);
  }
  return {key:key,name:name||''};
}
function openMvCatalog(kind,id){
  kind=kind||'subjects';
  var d=$('mv-catalog');
  if(!d){d=el('dialog','nved');d.id='mv-catalog';d.setAttribute('aria-labelledby','mv-catalog-title');SMALL[d.id]=1;document.body.appendChild(d);}
  var definitions=mvCatalog()[kind],current=definitions.find(function(def){return def.id===id;}),busy=false;
  d.textContent='';d.onclick=function(e){if(e.target===d&&!busy)closeSheet(d);};
  var h=el('h2','','Kohde- ja muuttujamääritykset');h.id='mv-catalog-title';d.appendChild(h);
  var form=el('form','obs-form'),msg=el('p','msg');msg.setAttribute('role','status');
  function field(label,input){
    var l=el('label','',label);input.id=uid('mc');input.name=input.id;l.htmlFor=input.id;
    var w=el('div','obs-field');w.append(l,input);form.appendChild(w);return input;
  }
  function select(values,value){
    var s=el('select');values.forEach(function(pair){var o=el('option','',pair[1]);o.value=pair[0];s.appendChild(o);});s.value=value;return s;
  }
  function input(label,value){var i=el('input');i.value=value||'';return field(label,i);}
  var type=field('Laji',select([['subjects','Kohde'],['variables','Muuttuja']],kind));
  type.onchange=function(){openMvCatalog(type.value);};
  var entry=field('Määritys',select([['','Uusi määritys']].concat(definitions.map(function(def){return [def.id,def.name];})),id||''));
  entry.onchange=function(){openMvCatalog(kind,entry.value);};
  var name=input('Nimi',current?.name),description=input('Kuvaus',current?.description);
  var unit=kind==='variables'?input('Yksikkö',current?.unit):null;
  var actions=el('div','btnrow'),save=el('button','btn primary','Tallenna');save.type='submit';actions.appendChild(save);
  button(actions,'Sulje','btn',function(){if(!busy)closeSheet(d);});
  form.append(actions,msg);d.appendChild(form);
  form.onsubmit=async function(e){
    e.preventDefault();if(busy||vBusy)return;
    var title=name.value.trim();
    if(!MUUTTUJA.validName(title)||kind==='subjects'&&(/^[#@]|[|"@]/.test(title))){msg.textContent='Tarkista nimi.';return;}
    var aliases=current?current.aliases.concat(current.name===title?[]:[current.name]):[];
    var next={id:id||uid('def-'),name:title,aliases:Array.from(new Set(aliases)).filter(function(a){return MUUTTUJA.key(a)!==MUUTTUJA.key(title);}),
      description:description.value.trim(),unit:unit?.value.trim()||''};
    busy=vBusy=true;sheetDialogControls(d,true);msg.textContent='Tallennetaan…';
    try{
      var r=await sheetSaveFile(OBSERVATION_CATALOG,function(text){
        var doc=mvCatalogRead(text);if(!doc)return {error:'Määritystiedoston muoto on virheellinen.'};
        var old=doc[kind].find(function(x){return x.id===next.id;});
        if(JSON.stringify(old)!==JSON.stringify(current))return {error:'Määritystä muokattiin muualla. Avaa se uudestaan.'};
        var taken=new Set(doc[kind].filter(function(x){return x.id!==next.id;}).flatMap(function(x){return [x.name].concat(x.aliases);}).map(MUUTTUJA.key));
        if([next.name].concat(next.aliases).some(function(a){return taken.has(MUUTTUJA.key(a));}))return {error:'Nimi on jo toisen määrityksen käytössä.'};
        doc[kind]=doc[kind].filter(function(x){return x.id!==next.id;}).concat(next);
        return JSON.stringify(doc,null,2)+'\n';
      },'appi: havaintomääritys',{repo:vRepo(),branch:G.branch});
      if(r.error){msg.textContent=r.error;return;}
      openMvCatalog(kind,next.id);toast('Määritys tallennettu.');
    }catch(error){msg.textContent='Tarkista Vaultin yhteys ja yritä uudelleen.';}
    finally{busy=vBusy=false;sheetDialogControls(d,false);vRender();vFlush();}
  };
  if(!d.open)openSheet(d);
}
function observationViewData(text){
  if(!text)return {};
  try{
    var doc=JSON.parse(text);
    if(doc.version!==1||!doc.views||Array.isArray(doc.views)||typeof doc.views!=='object')return null;
    return Object.fromEntries(Object.entries(doc.views).filter(function(pair){
      var v=pair[1];return v&&typeof v.name==='string'&&Array.isArray(v.columns)&&Array.isArray(v.subjects)&&
        v.columns.every(function(c){return c&&typeof c.name==='string';})&&v.subjects.every(function(s){return typeof s==='string';});
    }));
  }catch(e){return null;}
}
function observationViews(){return observationViewData(vOn()&&VC.files[OBSERVATION_VIEWS]?.t)||{};}
function openObservationView(id){
  var d=$('observation-view');
  if(!d){
    d=el('dialog','nved');d.id='observation-view';d.setAttribute('aria-labelledby','observation-title');SMALL[d.id]=1;document.body.appendChild(d);
  }
  var views=observationViews(),saved=views[id],busy=false;
  var V=saved?JSON.parse(JSON.stringify(saved)):{name:'',rowAxis:'kohde',colAxis:'valitut',subjects:[],columns:[],
    mode:'arvo',variable:'',start:'',end:'',tag:'',noteTag:''};
  var notes=mvNotes(),subjects=mvSubjects(notes),variables=mvRegistry(notes).map(function(g){return g.nimi;});
  d.textContent='';d.onclick=function(e){if(e.target===d&&!busy)closeSheet(d);};
  var h=el('h2','','Havaintotaulukot');h.id='observation-title';d.appendChild(h);
  var form=el('form','obs-form'),msg=el('p','msg'),result=el('div','obs-result'),sources=el('div','obs-sources');
  msg.setAttribute('role','status');sources.setAttribute('aria-live','polite');
  function field(host,label,input){
    var l=el('label','',label);input.id=uid('ob');input.name=input.id;l.htmlFor=input.id;
    var wrap=el('div','obs-field');wrap.append(l,input);host.appendChild(wrap);return input;
  }
  function select(options,value){
    var s=el('select');options.forEach(function(pair){var o=el('option','',pair[1]);o.value=pair[0];s.appendChild(o);});s.value=value;return s;
  }
  function input(type,value){var elInput=el('input');elInput.type=type;elInput.value=value||'';return elInput;}
  function watch(element,key){element.addEventListener('input',function(){V[key]=element.value;paint();});return element;}
  var existing=field(form,'Tallennettu näkymä',select([['','Uusi näkymä']].concat(Object.keys(views).map(function(k){return [k,views[k].name];})),id||''));
  existing.onchange=function(){openObservationView(existing.value);};
  watch(field(form,'Näkymän nimi',input('text',V.name)),'name');
  var grid=el('div','obs-grid');form.appendChild(grid);
  var axes=Object.entries(OBSERVATION_AXES);
  var rowAxis=watch(field(grid,'Yksi rivi per',select(axes,V.rowAxis)),'rowAxis');
  var colAxis=watch(field(grid,'Sarakkeet',select([['valitut','Valitut muuttujat']].concat(axes.filter(function(pair){return pair[0]!=='kirjaus';})),V.colAxis)),'colAxis');
  watch(field(grid,'Alkupäivä',input('date',V.start)),'start');
  watch(field(grid,'Loppupäivä',input('date',V.end)),'end');
  watch(field(grid,'Havainnon tunniste',input('text',V.tag)),'tag');
  watch(field(grid,'Muistiinpanon tunniste',input('text',V.noteTag)),'noteTag');
  var names=el('textarea');names.rows=2;names.value=V.subjects.join('\n');field(form,'Kohteet · yksi per rivi',names);
  names.oninput=function(){V.subjects=Array.from(new Set(names.value.split('\n').map(function(s){return s.trim();}).filter(Boolean)));paint();};
  var chosen=field(form,'Lisää olemassa oleva kohde',select([['','Valitse kohde']].concat(subjects.map(function(s){return [s,s];})),''));chosen.onchange=function(){
    if(chosen.value&&!V.subjects.some(function(s){return MUUTTUJA.key(s)===MUUTTUJA.key(chosen.value);}))V.subjects.push(chosen.value);
    names.value=V.subjects.join('\n');chosen.value='';paint();
  };
  var options=Object.entries(MVB_LASKE),list=el('datalist');list.id='observation-vars';
  variables.forEach(function(v){var option=el('option');option.value=v;list.appendChild(option);});form.appendChild(list);
  function variableInput(value){var i=input('text',value);i.setAttribute('list',list.id);return i;}
  var pivot=el('div','obs-grid');form.appendChild(pivot);
  watch(field(pivot,'Muuttuja (tyhjä = kaikki)',variableInput(V.variable)),'variable');
  watch(field(pivot,'Solun esitystapa',select(options,V.mode)),'mode');
  var columns=el('div','obs-columns');form.appendChild(columns);
  var add=button(form,'Lisää sarake','btn',function(){V.columns.push({name:'',title:'',mode:'arvo'});paintColumns();paint();columns.lastChild.querySelector('input').focus();});
  function paintColumns(){
    columns.replaceChildren();V.columns.forEach(function(c,i){
      var row=el('div','obs-grid');columns.appendChild(row);
      var name=field(row,'Muuttuja',variableInput(c.name)),title=field(row,'Sarakeotsikko',input('text',c.title)),mode=field(row,'Esitystapa',select(options,c.mode));
      [[name,'name'],[title,'title'],[mode,'mode']].forEach(function(pair){pair[0].oninput=function(){c[pair[1]]=pair[0].value;paint();};});
      var remove=button(row,'Poista sarake','mini',function(){V.columns.splice(i,1);paintColumns();paint();});
      remove.setAttribute('aria-label','Poista sarake '+(i+1));
    });
  }
  var actions=el('div','btnrow');
  if(vOn()){
    button(actions,'Tallenna näkymä','btn primary',save);
    button(actions,'Kohde- ja muuttujamääritykset','btn',function(){closeSheet(d);openMvCatalog();});
  }
  button(actions,'Sulje','btn',function(){if(!busy)closeSheet(d);});
  form.append(actions,msg);form.onsubmit=function(e){e.preventDefault();};d.append(form,result,sources);
  function showSources(points){
    sources.replaceChildren(el('h3','','Solun kirjaukset'));
    points.forEach(function(p){
      button(sources,[p.a,p.o.kohde,p.d,p.o.kello,mvTitle(p.n)].filter(Boolean).join(' · '),'btn',function(){mvOpenNote(p.n,d);});
    });
  }
  function paint(){
    pivot.hidden=V.colAxis==='valitut';add.hidden=columns.hidden=!pivot.hidden;
    result.replaceChildren();sources.replaceChildren();msg.textContent='';
    if(V.start&&V.end&&V.start>V.end){msg.textContent='Alkupäivän tulee olla ennen loppupäivää.';return;}
    if(rowAxis.value===colAxis.value){msg.textContent='Valitse riveille ja sarakkeille eri ulottuvuudet.';return;}
    if(V.colAxis!=='valitut'&&V.rowAxis!=='muuttuja'&&V.colAxis!=='muuttuja'&&!V.variable.trim()){
      msg.textContent='Valitse muuttuja, jotta solu laskee yhdenlaista arvoa.';return;
    }
    var model=observationMatrix(notes,V,mvDefinition);
    if(!model.cols.length||!model.rows.length){result.appendChild(el('p','sub','Valitse sarakkeet ja rajaa havaintoja.'));return;}
    var table=el('table','obs-table'),head=el('thead'),body=el('tbody'),line=el('tr');
    function heading(container,label,scope){var cell=el('th','',label);cell.scope=scope;container.appendChild(cell);}
    heading(line,OBSERVATION_AXES[V.rowAxis],'col');
    model.cols.forEach(function(pair){heading(line,pair[1].title,'col');});head.appendChild(line);
    model.rows.forEach(function(pair){
      var r=pair[1],tr=el('tr');heading(tr,r.label,'row');
      model.cols.forEach(function(entry){
        var td=el('td'),points=r.cells.get(entry[0])||[],value=MUUTTUJA.summary(points,entry[1].mode);
        if(points.length)button(td,mvbFmt(value),'btn obs-cell',function(){showSources(points);});
        else td.textContent=mvbFmt(value);
        tr.appendChild(td);
      });body.appendChild(tr);
    });
    table.append(head,body);result.appendChild(table);
  }
  async function save(){
    if(busy||vBusy)return;
    if(!V.name.trim()){msg.textContent='Anna näkymälle nimi.';return;}
    if(V.start&&V.end&&V.start>V.end||V.rowAxis===V.colAxis){msg.textContent='Tarkista näkymän rajaus ja ulottuvuudet.';return;}
    var key=id||uid('hv'),next=Object.assign({},V,{name:V.name.trim(),columns:V.columns.filter(function(c){return c.name.trim();})});
    var context={repo:vRepo(),branch:G.branch};
    busy=vBusy=true;sheetDialogControls(d,true);msg.textContent='Tallennetaan…';
    try{
      var r=await sheetSaveFile(OBSERVATION_VIEWS,function(text){
        var current=observationViewData(text);
        if(!current)return {error:'Havaintonäkymien tiedosto on virheellinen.'};
        if(JSON.stringify(current[key])!==JSON.stringify(saved))return {error:'Näkymää muokattiin muualla. Avaa se uudelleen.'};
        current[key]=next;return JSON.stringify({version:1,views:current},null,2)+'\n';
      },'appi: havaintonäkymä',context);
      if(r.error){msg.textContent=r.error;return;}
      openObservationView(key);toast('Havaintonäkymä tallennettu.');
    }catch(e){msg.textContent='Tarkista Vaultin yhteys ja yritä uudelleen.';}
    finally{busy=vBusy=false;sheetDialogControls(d,false);vRender();vFlush();}
  }
  paintColumns();paint();
  if(!d.open)openSheet(d);
}
function hidTxt(iso){return 'ei näy kalenterissa ('+WDS[fromIso(iso).getDay()]+')';}
function paintHl(){var ta=$('ns-text'),hl=$('ns-hl'),txt=ta.value,N={text:txt,created:noteCur?noteCur.created:nowIso()},f=[],i;hl.textContent='';
  paintNoteTags(noteCur,ta);
  if(noteCur&&noteCur._vaultEdit){
    $('ns-formula-results').hidden=true;ta.removeAttribute('aria-describedby');return;
  }
  for(i=0;i<=txt.length;i++)f.push(0);
  var LV=null,lv=function(){return LV||(LV=liveN());};if(!nsFast)ovNow=ovHits(lv());termCache=null;
  parseDates(txt,new Date(N.created),nsNl).forEach(function(o){if(!/\s/.test(txt.charAt(o.e)))return;var ov=ovNow.some(function(h){return h.o.s===o.s&&h.o.e===o.e;});for(var k=o.s;k<o.e;k++)f[k]|=ov?5:1;});
  (tunOn()?termHits(allTerms(),txt):[]).forEach(function(h){if(h.e>=txt.length||LETTER.test(txt.charAt(h.e)))return;for(var k=h.s;k<h.e;k++)f[k]|=2;});termCache=null;
  /* 1.52: kuitattu päivä yliviivattuna, purettu linkki omalla merkillään */
  var LD=null,ld=function(){return LD||(LD=noteDates(lv()));};if(noteCur)ld().forEach(function(o){if(o.s===undefined||!struck({pts:noteCur.pts||{}},o))return;var w=whenSpan(o);for(var k=w.s;k<w.e&&k<txt.length;k++)f[k]|=16;});
  nlSpans(txt,nsNl).forEach(function(m){for(var k=m.s;k<m.e;k++)f[k]|=32;});
  if(data.calv&&data.calv.off.length)ld().forEach(function(o){if(o.s===undefined||!hidNote(o))return;var w=whenSpan(o);for(var k=w.s;k<w.e&&k<txt.length;k++)if(f[k]&1)f[k]|=64;});
  var LN=relLive({text:txt,created:N.created});relNow=relMatch(LN,relSpans(txt,parseDates(txt,new Date(N.created),nsNl),true)).filter(function(m){return m.lock.w!==m.lock.o;});
  relNow.forEach(function(m){for(var k=m.sp.s;k<m.sp.e;k++)f[k]|=8;});
  mvNow=mvSpans({text:txt,mv:noteCur&&noteCur.mv});mvNow.forEach(function(m){for(var k=m.s;k<m.e;k++)f[k]|=8;});
  /* 1.102: sanalinkki vain sanaan, jossa ei ole mitään muuta merkintää (aika, asiasana, purettu linkki, historia); kirjoitettava sana linkittyy vasta, kun se on valmis */
  wlText(txt).forEach(function(h){if(h.e>=txt.length)return;for(var k=h.s;k<h.e;k++)if(f[k])return;for(k=h.s;k<h.e;k++)f[k]|=128;});
  /* Kaikki 0.2: markdown-merkit haaleina kirjoittaessa, lukunäkymässä piilossa (teksti näkyy tästä kerroksesta, ks. #ns-text) */
  VAULT.mdMarks(txt).forEach(function(m){for(var k=m.s;k<m.e&&k<txt.length;k++)f[k]|=m.v;});
  /* 0.5: linkit. 8192 = linkki, 16384 = näkyvä teksti (alias), 32768 = nimi, jonka tilalle lukunäkymässä otsikko */
  VAULT.links(txt).forEach(function(L){var k;for(k=L.s;k<L.e;k++)f[k]=(f[k]&(512|1024|4096))|8192|256;/* linkki on yksi kokonaisuus: ei sanalinkkejä tai muita merkintöjä sen sisällä */if(L.alias){for(k=L.as;k<L.ae;k++){f[k]&=~256;f[k]|=16384;}}else for(k=L.ss;k<L.se;k++){f[k]&=~256;f[k]|=32768;}});
  if(noteCur&&noteCur.vh){var e1=txt.indexOf('\n');if(e1<0)e1=txt.length;for(var k1=0;k1<e1;k1++)f[k1]|=512;}/* vaultin #-otsikko = ensimmäinen rivi */
  /* 0.65: tekstimuuttuja on yksi kokonaisuus: ei aika-, sana- tai muita merkintöjä sisällä */
  var MVS=new Map();MUUTTUJA.parse(txt,new Date(N.created)).forEach(function(o){MVS.set(o.s,o);for(var k=o.s;k<o.e;k++)f[k]=MVBIT+o.s;});
  var computed=paintFormulaSpans(txt,ta,f),hlFs=null;
  var st=0;for(i=1;i<=txt.length;i++){if(i===txt.length||f[i]!==f[st]){var part=txt.slice(st,i),v=f[st];
      var formula=computed.get(st);
      if(formula){
        var piece=el('span',formula.error?'formula-result formula-error':'formula-result');
        piece.dataset.sourceLength=String(part.length);
        piece.append(el('span','formula-source',part),el('span','formula-result-text',formula.result));
        hl.appendChild(piece);st=i;continue;
      }
      if(v>=MVBIT&&MVS.has(v-MVBIT)){hl.appendChild(mvEl(txt,MVS.get(v-MVBIT)));st=i;continue;}
      if(!v)hl.appendChild(document.createTextNode(part));else hl.appendChild(el(v&1?'mark':'span',((v&2?'th ':'')+(v&4?'ov ':'')+(v&8?'rel ':'')+(v&16?'dn ':'')+(v&32?'nl ':'')+(v&64?'hd ':'')+(v&128?'wl ':'')+(v&256?'mdm ':'')+(v&512?'mdh ':'')+(v&1024?'mdb ':'')+(v&2048?'mdl ':'')+(v&4096?'mdq ':'')+(v&8192?'lk ':'')+(v&16384?'lka ':'')+(v&32768?'lks':'')).trim(),part));
      if(v&32768){var lse=hl.lastChild;lse.dataset.t=vTitleOf(part.trim())||part;lse.style.setProperty('--fs',hlFs||(hlFs=getComputedStyle(hl).fontSize));if(!vNoteOf(part.trim()))lse.classList.add('lkx');}st=i;}}
  hl.appendChild(document.createTextNode('\u200b'));hl.scrollTop=ta.scrollTop;}
/* Asiasanojen lisäykset kirjoittaessa: osio tekstin lopussa päivittyy, kursori pysyy paikallaan */
function syncAdds(){if(noteCur&&noteCur._vaultEdit)return false;var ta=$('ns-text'),v=applyAdds(ta.value,data.projects,allTerms());termCache=null;if(v===ta.value)return false;var a=ta.selectionStart,b=ta.selectionEnd;ta.value=v;try{ta.setSelectionRange(Math.min(a,v.length),Math.min(b,v.length));}catch(e){}return true;}
$('ns-text').addEventListener('input',function(){syncAdds();});
/* Luonnos (1.61): auki olevan muistiinpanon teksti talteen kirjoittaessa ja appin mennessä taustalle. Ei tee muistiinpanoa;
   palautuu ikkunaan seuraavalla avauksella, ja vasta ruksi tallentaa sen. Valmis, tyhjennys ja poisto pyyhkivät luonnoksen. */
var DKEY='kaikki:luonnos',draftT=0;
function draftSave(){clearTimeout(draftT);if(!$('nsheet').open||(noteCur&&noteCur._vaultEdit))return;var k=kOf(),txt=$('ns-text').value;
  if(noteCur?noteCur.text===txt&&(noteCur.date||'')===($('ns-date').value||''):!txt.trim()){draftClear();return;}
  try{localStorage.setItem(DKEY,JSON.stringify({k:k?k.id:null,id:noteCur?noteCur.id:null,text:txt,date:$('ns-date').value||'',view:noteOpenView||undefined,at:nowIso()}));}catch(e){}}
function draftClear(){clearTimeout(draftT);try{localStorage.removeItem(DKEY);}catch(e){}}
function draftRestore(){var d=null;try{d=JSON.parse(localStorage.getItem(DKEY)||'null');}catch(e){}if(!d||typeof d.text!=='string'||viewLocked(d.view))return false;
  var k=kOf();if(!k||d.k!==k.id)return false;var n=d.id?data.notes.filter(function(x){return x.id===d.id;})[0]:null;if(d.id&&!n){draftClear();return false;}
  openNote(n||null,null,null,d.view);$('ns-text').value=d.text;$('ns-date').value=d.date||'';syncAdds();paintHl();foundInfo();setInfo('Keskeneräinen muistiinpano palautettu. Ruksi tallentaa sen.');return true;}
$('ns-text').addEventListener('input',function(){clearTimeout(draftT);draftT=setTimeout(draftSave,700);});
document.addEventListener('visibilitychange',function(){if(document.hidden)draftSave();});addEventListener('pagehide',draftSave);
/* Kaikki 0.58 (Emil 23.11.2026: kirjoittaminen hetkittäin viiveistä): näppäilyllä piirretään vain teksti korostuksineen. Päällekkäiset menot
   (ovHits jäsensi joka merkillä kaikkien muistiinpanojen päivät) ja tekstin alla olevat tiedot (foundInfo) lasketaan, kun kirjoitus pysähtyy. */
var nsFast=false,nsIdleT=0;
function nsIdleSoon(){clearTimeout(nsIdleT);var N=noteCur;nsIdleT=setTimeout(function(){nsIdleT=0;if(!$('nsheet').open||noteCur!==N)return;paintHl();foundInfo();},300);}
function nsIdleNow(){if(!nsIdleT)return;clearTimeout(nsIdleT);nsIdleT=0;paintHl();foundInfo();}
$('ns-text').addEventListener('input',function(){nsFast=true;try{paintHl();}finally{nsFast=false;}nsIdleSoon();});$('ns-text').addEventListener('scroll',function(){$('ns-hl').scrollTop=$('ns-text').scrollTop;});
$('ns-date').addEventListener('change',foundInfo);$('ns-ts').addEventListener('change',foundInfo);$('ns-te').addEventListener('change',foundInfo);
function timeVal(){if(pinOn())return {s:notePin.s,e:notePin.e||''};var a=$('ns-ts').value;return a&&!$('ns-timerow').hidden?{s:a,e:$('ns-te').value&&$('ns-te').value>a?$('ns-te').value:''}:null;}
function sameTime(a,b){return (a?a.s+'-'+a.e:'')===(b?b.s+'-'+b.e:'');}
$('ns-ok').addEventListener('click',function(){
  if(viewLocked(noteOpenView)){draftSave();toast(VIEW_LOCKED);return;}
  nsIdleNow();var txt=$('ns-text').value;
  if(noteCur&&noteCur._vaultEdit){if(!vSaveWorkFile(noteCur,txt))return;noteCur=null;closeSheet($('nsheet'));render();return;}
  syncAdds();txt=$('ns-text').value;if(!txt.trim()){if(noteCur)toTrash(noteCur);draftClear();closeSheet($('nsheet'));render();return;}var t=nowIso();
  var tv=timeVal();if(noteCur&&noteCur.text===txt&&(noteCur.date||'')===($('ns-date').value||'')&&sameTime(noteCur.time,tv)&&!!noteCur.pin===pinOn()&&JSON.stringify(noteCur.nl||[])===JSON.stringify(nsNl)){draftClear();closeSheet($('nsheet'));render();return;}
  var previous=noteCur?noteCur.text:'';
  if(!noteCur){noteCur={id:uid('n'),created:t,text:txt};data.notes.unshift(noteCur);}noteCur.date=$('ns-date').value||'';if(tv)noteCur.time=tv;else delete noteCur.time;if(pinOn())noteCur.pin=1;else delete noteCur.pin;if(nsNl.length)noteCur.nl=nsNl.slice();else delete noteCur.nl;noteWrite(noteCur,txt,t);
  var savedNote=noteCur;noteAutoTags(savedNote);draftClear();touch();closeSheet($('nsheet'));render();
  writeNewNoteMetric(savedNote,previous);
});


/* 1.65 (Emil 23.10.2026, arvion 12C): linkin seuraamisen jälkeen ‹ Takaisin palaa edelliseen näkymään, rajaukseen, vierityskohtaan ja
   avoinna olleeseen muistiinpanoon (ilman näppäimistöä). Nappi vasemmalla alapalkin yllä; poistuu käytettäessä tai välilehteä vaihdettaessa. */
var backS=null;
function backArm(){return {tab:tab,nv:noteView,f:noteFilter.slice(),and:noteAnd,q:noteQuery,st:activeScroller().scrollTop,occ:noteOcc};}
function backShow(B){backS=B;$('back').hidden=false;}
function backHide(){backS=null;$('back').hidden=true;}
$('back').addEventListener('click',function(){var B=backS;backHide();if(!B)return;noteView=B.nv;noteFilter=B.f;noteAnd=B.and;noteQuery=B.q;showTab(B.tab==='notes'&&B.nv==='chk'?'list':B.tab);activeScroller().scrollTop=B.st;
  if(B.n&&data.notes.indexOf(B.n)>=0)openNote(B.n,null,B.occ);});
$('nav').addEventListener('click',function(ev){if(ev.target.closest('[data-tab]'))backHide();},true);$('roll').addEventListener('click',backHide,true);
newBtn.addEventListener('click',function(){if(tab==='notes'&&noteView==='open'&&viewLocked(noteViewPath(nvCur())))return;if(tab==='notes'&&noteView==='rep')openRep(null);else if(tab==='notes'&&noteView==='chk')openChk(null);else openNote(null);});
/* ---- tarkistuslista (Emil 22.10.2026, 1.38) ----
   Rivit näkyvät myös kalenterissa omalla merkillään (☰); siirto kalenterissa muuttaa rivin tekstin aikaa. Kalenterin kuittaus on vain kalenterin kerros. */
/* Tietokoneella (hiiri) napsautus Muistioiden tyhjään kohtaan tekee uuden (Emil 22.10.2026, 1.39). Puhelimella ei. */
var FINE=window.matchMedia?window.matchMedia('(hover:hover) and (pointer:fine)'):null;
main.addEventListener('click',function(ev){if(tab!=='notes'||!FINE||!FINE.matches)return;var t=ev.target;
  if(t!==main&&t!==panels.notes&&!(t.id&&/^(nlist|chlist|replist)$/.test(t.id)))return;newBtn.click();});
/* 1.41: muistiinpano on juuri. Kalenteri näyttää vain muistiinpanot; listan riviin liitetty muistiinpano saa merkin ☰ ja rivin nimen. */
function calNotes(){return data.notes;}
function rowOf(n){if(!n)return null;for(var i=0;i<(data.chk||[]).length;i++)if(data.chk[i].nid===n.id)return data.chk[i];return null;}
function noteOf(r){if(r&&typeof r.runtext==='string')return {text:r.runtext,created:r.created,edited:r.edited,date:''};if(!r||!r.nid)return null;for(var i=0;i<data.notes.length;i++)if(data.notes[i].id===r.nid)return data.notes[i];return null;}
function isChk(n){return !!rowOf(n);}
function calTitle(n,o){var r=rowOf(n);if(r&&r.name)return r.name;var P=o?sepParts(n.text):null;return noteTitle(P?partNote(n,partIx(P,o)):n);}
/* 1.91: listan muistiinpanorivin tai Mainitun teksti */
function partTitle(N,i){return noteTitle(i!==undefined?partNote(N,i):N);}
/* Rivin konteksti: tekstin laukaisemat asiasanat ja aikakohde (samat säännöt kuin muistiinpanolla) */
var ctxAT=null;
function evMap(AT){var m={};AT.forEach(function(t){var r=evRule({ev:t.ev,wd:t.wd,md:t.md});if(r)m[t.id]=r;});return m;}
/* Linkitettyjen ryhmien jäsenet (1.46): listan ryhmä (g…) tai puun ryhmä (a:…) */
function grpMembers(gid,AT){var g=(data.grp||[]).filter(function(x){return x.id===gid;})[0];if(g)return g.m.filter(function(id){return isSpec(id)||AT.some(function(t){return t.id===id;});});
  var t=AT.filter(function(x){return x.id===gid&&x.auto&&x.kind==='g';})[0];return t?treeGroupMembers(t,AT):[];}
function grpName(gid,AT){var g=(data.grp||[]).filter(function(x){return x.id===gid;})[0];if(g)return g.name;var t=AT.filter(function(x){return x.id===gid;})[0];return t?t.name:null;}
function rowGm(r,AT){var out=[];(r.g||[]).forEach(function(gid){grpMembers(gid,AT).forEach(function(id){if(out.indexOf(id)<0)out.push(id);});});return out;}
function chkCtx(r,today){today=today||todayIso();var AT=ctxAT||allTerms(),N=noteOf(r),ev=evMap(AT),G=rowGm(r,AT),
    zs=(r.it||[]).map(function(x){return x.id;}).concat(G).filter(function(id){return id.slice(0,2)==='z:';}),
    M=chkMentions(r,data.notes,today,G.indexOf('m:men')>=0),c={ev:ev,mn:M.mn,mnz:M.mnz,gm:G.filter(function(id){return !isSpec(id);})};if(!N||gone(N,today))return c;
  var T=chkTime(N,today,zs);c.tt=tunOn()?noteTerms(AT,N.text):[];c.nc=ms(N.created);c.z=T.z;c.nz=T.nz;return c;}
function chkRk(){return impRanks(data.imp,rankTerms(),data.projects);}
function termOf(id){var A=ctxAT||termCache||allTerms();for(var i=0;i<A.length;i++)if(A[i].id===id)return A[i];return null;}
function itemName(id){return termName(id)||timeName(id)||'?';}
function chkCal(r){var N=noteOf(r)||{},k=Object.keys(N.pts||{}).sort();if(!k.length)return '';return 'Kuitattu '+occLabel(k[k.length-1])+(k.length>1?' (+'+(k.length-1)+')':'');}
/* Uusiutuminen sanoin: "uusiutuu 7 pv, ma to, kuun 1., 15." (viikonpäivät maanantaista alkaen) */
function renewTxt(t){var p=[],e=evDays(t&&t.ev),w=evWd(t&&t.wd),m=evMd(t&&t.md);if(e)p.push(e+' pv');
  if(w.length)p.push([1,2,3,4,5,6,0].filter(function(n){return w.indexOf(n)>=0;}).map(function(n){return WDS[n];}).join(' '));if(m.length)p.push('kuun '+m.join('., ')+'.');return p.length?'uusiutuu '+p.join(', '):'';}
/* Voimassaoloajat (Emil 22.10.2026, 1.40): kuittaus raukeaa, kun aika on kulunut */
var EVS=[[0,'ei vanhene'],[1,'1 pv'],[2,'2 pv'],[3,'3 pv'],[6,'6 pv'],[7,'7 pv'],[13,'13 pv'],[14,'14 pv'],[30,'30 pv'],[60,'60 pv'],[90,'90 pv'],[180,'180 pv'],[365,'365 pv']];
var chkOpen={},chkFreeze=null,chkGlow=null,chkPrev=null,chkFzT=0,chkSeen=null,ktDone=false;
/* Rivin otsikossa vain kuittaamattomien määrä (Emil 22.10.2026, 1.43) */
function chkStatus(r,now,cx){var n=chkOpenN(r,now,cx);return n?n+' kuittaamatta':'';}
var chkInfo={};
/* Kierroslistat (Emil 23.10.2026, 1.62): useampi lista. Jatkuva Lista pysyy ennallaan; kierroslista on sama rakenne ilman aikaa.
   Kierros alkaa kaikki kuittaamattomina, tärkein kuittaamaton nousee kärkeen (sama tähtijärjestys kuin muualla), kuittaus ei uusiudu.
   Rivi on ryhmä: "Kaikki kuitattu" (ja) tai "Yksi kuitattu" (tai). Valmiin tai-rivin muut kohteet harmaina, valmis rivi loppuun.
   Keskeneräinen kierros säilyy tallennuksessa. Alusta = kaikki kuittaamattomiksi; Lopeta = muistiinpano + alusta. Kumoa palauttaa. */
/* Valittu lista muistetaan laitteella projektikohtaisesti */
var chkLists={};
function listKey(){var k=kOf();return 'paatospuu:lista:'+(k?k.id:'');}
function curList(){var k=kOf(),id=k?chkLists[k.id]:null;if(k&&id===undefined){try{id=localStorage.getItem(listKey())||null;}catch(e){id=null;}chkLists[k.id]=id;}
  return (data.lists||[]).filter(function(x){return x.id===id;})[0]||null;}
function setList(id){var k=kOf();if(k)chkLists[k.id]=id||null;try{if(id)localStorage.setItem(listKey(),id);else localStorage.removeItem(listKey());}catch(e){}}
function listRows(){var L=curList();return data.chk.filter(function(r){return (r.l||null)===(L?L.id:null);});}
/* 1.78 (Emil 24.10.2026): ryhmä rivillä on toteamus. Rivin kohteiksi tulevat vain ne jäsenet, jotka eivät ole saman listan muilla riveillä. */
function elseIds(r){var o={};data.chk.forEach(function(q){if(q===r||(q.l||null)!==(r.l||null))return;(q.it||[]).forEach(function(x){if(!x.t&&!x.g)o[x.id]=1;});});return o;}
/* 1.105 (Emil 18.11.2026): tarkistuslistoja voi olla useita. Lista (jatkuva tai uusi Ajassa-lista, aj) uusiutuu Asiat-taulukon välien mukaan.
   Listan tarkistuskohteet valitaan listakohtaisesti (tk = asiasanojen id:t; jatkuvalla listalla data.jl.tk); sama asia voi olla monella listalla,
   ja sen väli ja tärkeys ovat yhteiset. Rivillä ovat oletuksena kaikki listan kohteet; rivi voi ruksia pois (r.ei). Työnkulkulistat ennallaan. */
function listById(lid){return lid?(data.lists||[]).filter(function(x){return x.id===lid;})[0]||null:null;}
function ajOf(lid){var L=listById(lid);return !!(L&&L.aj&&!L.wf&&!L.run);}
function jatL(L){return !L||(!!L.aj&&!L.wf&&!L.run);}
function tkOk(L){return jatL(L);}
function rowTk(r){if(!r||r.mu||String(r.id).slice(0,3)==='mu:')return null;var L=listById(r.l);if(r.l&&(!L||!tkOk(L)))return null;var C=condCfg(r.l||null);if(!C||!Array.isArray(C.tk))return null;
  var A={};(ctxAT||termCache||allTerms()).forEach(function(t){if(!t.time)A[t.id]=1;});return C.tk.filter(function(id){return A[id];});}
function termOnce(id){var T=termOf(id);if(!T)return false;if(T.auto){var w=data.words[T.key];return !!(w&&w.once);}return !!realTerm(T).once;}
/* Siirto kerran: listan nykyiset käsin valitut kohteet ovat listan tarkistuskohteet; rivi, jolla kohdetta ei ollut, ruksii sen pois (ei muutu). */
function tkInit(L){if(!tkOk(L))return;var lid=L?L.id:null,C=condCfg(lid);if(C&&Array.isArray(C.tk))return;
  var rows=data.chk.filter(function(r){return (r.l||null)===lid&&!r.mu;}),ids=[];
  rows.forEach(function(r){(r.it||[]).forEach(function(x){if(x.t||x.g||x.id.slice(0,2)==='z:'||isSpec(x.id))return;if(ids.indexOf(x.id)<0)ids.push(x.id);});});
  var ord=orderedTerms().map(function(t){return t.id;});ids.sort(function(a,b){var i=ord.indexOf(a),j=ord.indexOf(b);return (i<0?1e9:i)-(j<0?1e9:j);});
  if(!C){if(lid)return;C={};data.jl=C;}C.tk=ids;
  rows.forEach(function(r){var have={};(r.it||[]).forEach(function(x){if(!x.t&&!x.g)have[x.id]=1;});var ei=ids.filter(function(id){return !have[id];});if(ei.length)r.ei=ei;else delete r.ei;});save();}
function tkSet(lid,id,on){var C=condCfg(lid);if(!C){if(lid)return;C={};data.jl=C;}var T=(C.tk||[]).filter(function(x){return x!==id;});if(on)T.push(id);
  var ord=orderedTerms().map(function(t){return t.id;});T.sort(function(a,b){var i=ord.indexOf(a),j=ord.indexOf(b);return (i<0?1e9:i)-(j<0?1e9:j);});C.tk=T;
  if(on)data.chk.forEach(function(r){if((r.l||null)===lid&&r.ei){r.ei=r.ei.filter(function(x){return x!==id;});if(!r.ei.length)delete r.ei;}});touch();}
function workflowOf(lid){return (data.lists||[]).some(function(L){return L.id===lid&&L.wf;});}
function ctxOf0(r,today){var c=chkCtx(r,today);if(!workflowOf(r.l)&&r.g&&r.g.length&&c.gm.length){var O=elseIds(r);c.gm=c.gm.filter(function(id){return !O[id];});}if(!r.l||ajOf(r.l))return c;return {ev:{},mn:[],mnz:null,gm:c.gm,tt:c.tt||[],nc:c.nc,kier:1,workflow:workflowOf(r.l)};}
/* Listan ehdot (1.67): jatkuvan listan ehdot projektin kentässä jl, kierroslistan omassa listassa. Tulos välimuistissa tallennuskertaan ja minuuttiin. */
function condCfg(lid){return lid?(data.lists||[]).filter(function(x){return x.id===lid;})[0]||null:data.jl;}
var condC={};
function condOf(lid,today){var C=condCfg(lid);if(!C||!C.eh||!(data.ehdot||[]).length)return null;var key=data.k+'|'+lid+'|'+(data.meta.dirty||0)+'|'+today+'|'+Math.floor(Date.now()/60000);
  if(condC[key])return condC[key];var rows=data.chk.filter(function(r){return (r.l||null)===(lid||null);});condC={};
  return condC[key]=chkCond(data.ehdot,rows,function(r){return ctxOf0(r,today);},new Date(),{workflow:workflowOf(lid),grp:grpOf(rows),tk:lid?{}:timeKeys(rows,today),tx:rows.map(function(r){var N=noteOf(r);return {n:normT((r.name||'')+' '+(N&&!gone(N,today)?N.text:''))};})});}
/* 1.78: listan ryhmät (vain riveille liitetyt) jäsenineen ja Jokin/Kaikki-sääntöineen; aikasanat, jotka jatkuvan listan rivien ajoista ovat nyt voimassa */
function grpOf(rows){var G={},AT=ctxAT||allTerms();rows.forEach(function(r){var p=phaseOf(data,r.sg),ids=(r.g||[]).concat(p&&p.aliases||[]);ids.forEach(function(gid){if(G[gid])return;var g=(data.grp||[]).filter(function(x){return x.id===gid;})[0];
  G[gid]={m:grpMembers(gid,AT).filter(function(id){return !isSpec(id);}),all:g&&g.all?1:0};});});return G;}
function timeKeys(rows,today){var o={};o['z:'+fromIso(today).getDay()]=1;rows.forEach(function(r){var N=noteOf(r);if(!N||gone(N,today))return;var t=timeTermOf(N,today);if(!t)return;o[t]=1;if(t!=='z:late')o['z:week']=1;});return o;}
var gstC={};
function grpStat(lid,today){var key=data.k+'|'+lid+'|'+(data.meta.dirty||0)+'|'+today+'|'+Math.floor(Date.now()/60000);if(gstC[key])return gstC[key];gstC={};
  var rows=data.chk.filter(function(r){return (r.l||null)===(lid||null);}),G=grpOf(rows),K={},now=new Date();if(!Object.keys(G).length)return gstC[key]={G:G,ok:{}};
  rows.forEach(function(r){chkView(r,ctxOf0(r,today),now).forEach(function(v){if(v.ok&&!v.z)K[v.id]=1;});});var A=null;if(workflowOf(lid)){A={};K={};var C=condOf(lid,today);rows.forEach(function(r){var c=ctxOf0(r,today);if(C){c.hid=C.hid;c.off=C.off;}chkItems(r,c,now).forEach(function(v){A[v.id]=1;if(v.ok)K[v.id]=1;});});}return gstC[key]={G:G,ok:grpHit(G,K,A)};}
function ctxOf(r,today){today=today||todayIso();var c=ctxOf0(r,today),K=condOf(r.l||null,today);if(K){c.hid=K.hid;c.off=K.off;}var TK=rowTk(r);if(TK)c.tk=TK;
  if(r.g&&r.g.length){var S=grpStat(r.l||null,today);c.gs=r.g.filter(function(gid){return S.G[gid];}).map(function(gid){return {id:gid,ok:!!S.ok[gid]};});}return c;}

function flowOrigin(L){var a=L.run,r=data.chk.filter(function(r){return r.id===a.r;})[0],n=data.notes.filter(function(n){return n.id===a.n;})[0];return r?(r.name||(noteOf(r)?noteTitle(noteOf(r)):'')||'Listan rivi'):n?'Muistiinpano: '+noteTitle(n):'Poistunut lähtökohta';}
function flowLink(tid){var t=termOf(tid);return t&&t.wflow||'';}
function flowSource(r,tid,n){var x=r&&(r.it||[]).filter(function(x){return x.id===tid;})[0],L=r&&(data.lists||[]).filter(function(L){return L.id===r.l;})[0];return r?{r:r.id,prev:x&&x.ok||'',epoch:L&&L.epoch||''}:n?{n:n.id}:{};}
function startFlow(tid,r,n){var src=flowSource(r,tid,n),res=flowStart(data,tid,flowLink(tid),src,uid('w'),nowIso());if(res.error){toast(res.error);return;}
  termCache=null;ctxAT=null;SHEETS.forEach(function(id){if($(id).open)closeSheet($(id));});termSolo=null;termCur=null;setList(res.list.id);noteView='chk';chkOpen={};data.chk.filter(function(r){return r.l===res.list.id;}).forEach(function(r){chkOpen[r.id]=1;});chkFreeze=null;touch();showTab('list');render();}
function startNoteFlow(tid){$('ns-ok').click();if(noteCur&&data.notes.some(function(n){return n.id===noteCur.id;}))startFlow(tid,null,noteCur);}
function flowReturn(L){var a=L.run,r=data.chk.filter(function(r){return r.id===a.r;})[0];if(r){setList(r.l||null);noteView='chk';chkOpen[r.id]=1;}else if(a.n&&data.notes.some(function(n){return n.id===a.n;})){noteView='open';}else{setList(a.tpl);noteView='chk';}render();}

function kierReset(L,end){if(L.run&&L.run.done){toast('Suoritus on jo valmis.');return;}var rows=data.chk.filter(function(r){return r.l===L.id;}),U=undoArm(rows.concat([data.notes,L],L.run?[data.chk.filter(function(r){return r.id===L.run.r;})[0]]:[]));
  if(end&&L.wf&&!workflowReady(rows,new Date(),function(r){return ctxOf(r,todayIso());})){toast('Työnkulussa on vielä kuitattavaa. Voit jatkaa myöhemmin.');return;}
  if(end&&L.run){var result=flowFinish(data,L,nowIso(),function(r){return ctxOf(r,todayIso());},flowLink);if(result.error){toast(result.error);return;}}
  if(end){var now=new Date(),today=todayIso(),rk=chkRk(),ok=[],ho=[],skip=[];ctxAT=allTerms();
    chkSort(rows,rk,today,now,function(r){return ctxOf(r,today);}).forEach(function(r){var cx=ctxOf(r,today),V=chkItems(r,cx,now),nm=r.name||(noteOf(r)?noteTitle(noteOf(r)):'')||'rivi';
      var k=V.filter(function(v){return v.ok;}).map(function(v){return itemName(v.id);}),m=V.filter(function(v){return !v.ok;}).map(function(v){return itemName(v.id);});
      if(L.wf&&!V.some(function(v){return v.ok;})){skip.push(nm);return;}if(chkDone(r,now,cx))ok.push(nm+(k.length?' ('+k.join(', ')+')':''));else ho.push(nm+(m.length?' ('+m.join(', ')+')':''));});ctxAT=null;
    /* 1.88 (Emil 25.10.2026): sama muoto kuin päätöspuun kierroksella: nimi, valinnat (kuittausjärjestyksessä), Kunnossa, Hoidettavat ja ehtojen tuomat tekstit omina kappaleinaan */
    var lines=[L.name];if(L.run)lines.push('Työnkulku: '+itemName(L.run.tid)+(L.run.r?(L.run.credited?' · lähtökohta kuitattu':' · lähtökohtaa ei kuitattu (poistunut tai muuttunut)'):' · vapaaehtoinen suoritus'));var KS=condOf(L.id,today),va=[];rows.forEach(function(r){(r.it||[]).forEach(function(x){if(x.ok&&x.id.slice(0,2)!=='z:')va.push(x);});});
    va.sort(function(a,b){return a.ok<b.ok?-1:a.ok>b.ok?1:0;});va=va.map(function(x){return itemName(x.id);}).filter(function(n,i,A){return A.indexOf(n)===i;});
    if(skip.length)lines.push('Ei aktivoitunut: '+skip.join(', '));if(va.length)lines.push('Valinnat: '+va.join(' → '));if(ok.length)lines.push('Kunnossa: '+ok.join(', '));if(ho.length)lines.push('Hoidettavat: '+ho.map(function(h,i){return (i+1)+'. '+h;}).join(', '));
    var tx=lines.join('\n');if(KS&&KS.say&&KS.say.length)tx+='\n\n'+KS.say.join('\n\n');
    var t=nowIso();data.notes.unshift({id:uid('n'),created:t,edited:t,text:tx,date:''});}
  if(!L.run||!end){L.epoch=uid('e');rows.forEach(function(r){(r.it||[]).forEach(function(x){delete x.ok;});});}touch();if(L.run&&end)flowReturn(L);else render();undoAt=Date.now();undoShow(U,end?(L.run&&L.run.r&&!L.run.credited?'Työnkulku valmis. Lähtökohta muuttui, joten sitä ei kuitattu.':'Kierros tallennettu muistiinpanoksi'):'Kierros alussa');}
/* Vaihepankki käyttää samaa avattavaa rivirakennetta kuin työnkulkulista. */
function phaseUses(id){var names=[],seen={};(data.chk||[]).forEach(function(r){if(r.sg!==id)return;var L=(data.lists||[]).filter(function(L){return L.id===r.l;})[0];var key=r.l||'',name=L?L.name:'Lista';if(!seen[key]){seen[key]=1;names.push(name);}});return names;}
function openPhaseBank(pick){phaseEnsure(data);phaseBankPick=!!pick;renderPhaseBank();openSheet($('phsheet'));}
function renderPhaseBank(){var b=$('ph-body');b.textContent='';$('ph-h').textContent=phaseBankPick?'Lisää vaihe':'Vaihepankki';
  iTo(b,phaseBankPick?'Valitse valmis vaihe tai luo uusi. Kuittaukset alkavat tyhjinä.':'Projektin yhteiset vaiheet. Avaa rivi nähdäksesi asiasanat ja valmistumissäännön.');
  var add=el('div','btnrow');button(add,'+ Uusi vaihe','btn',function(){closeSheet($('phsheet'));openChk(null,null,!phaseBankPick,true);}).id='ph-new';b.appendChild(add);
  var list=el('div','chlist');list.id='phase-list';(data.grp||[]).filter(function(g){return g.phase;}).forEach(function(g){var c=el('div','crow'+(phaseOpen[g.id]?' open':''));c.dataset.gid=g.id;
    var hd=button(c,'','chd',function(){phaseOpen[g.id]=!phaseOpen[g.id];renderPhaseBank();});hd.setAttribute('aria-expanded',phaseOpen[g.id]?'true':'false');hd.appendChild(el('span','cn',g.name));hd.appendChild(el('span','cs',g.m.length+' asiasanaa'));hd.insertAdjacentHTML('beforeend',CHEV);
    if(phaseOpen[g.id]){var body=el('div','cbody'),pills=el('div','cpills');g.m.forEach(function(id){var chip=el('span','cpill',itemName(id));pills.appendChild(chip);});body.appendChild(pills);body.appendChild(el('p','sub',g.all?'Kaikki aktiiviset kuitattu':'Yksi kuitattu'));var uses=phaseUses(g.id);body.appendChild(el('p','sub','Käytössä '+uses.length+' listassa'+(uses.length?': '+uses.join(', '):'')));
      button(body,'Muokkaa yhteistä vaihetta','mini',function(){openChk(null,g.id,true);}).classList.add('ph-edit');
      if(!uses.length)button(body,'Poista vaihe','mini dangerline',function(){var btn=this;delAsk(btn,'Poistetaanko vaihe?','Vaihe ei ole käytössä millään listalla.',function(){data.grp=data.grp.filter(function(x){return x!==g;});touch();renderPhaseBank();});}).classList.add('ph-delete');c.appendChild(body);}
    if(phaseBankPick){var ar=el('div','cquick');button(ar,'Lisää listaan','mini',function(){var L=curList();if(!L||!L.wf)return;var r=phaseAttach(data,g.id,uid('c'),L.id,nowIso());chkOpen[r.id]=1;touch();closeSheet($('phsheet'));render();}).classList.add('ph-add');c.appendChild(ar);}list.appendChild(c);});b.appendChild(list);
  if(!list.children.length)b.appendChild(el('p','sub','Ei vielä vaiheita. Uusi työnkulkurivi luo vaiheen tänne.'));}
function savePhaseForm(){var nm=clean($('ks-name').value).slice(0,120),members=chkIt.filter(function(x){return !isSpec(x.id);}).map(function(x){return x.id;});
  if(!nm&&!members.length){closeSheet($('ksheet'));return;}if(!nm){$('ks-msg').textContent='Anna vaiheelle nimi.';return;}
  var g=phaseOf(data,chkPhaseId);if(!g){g={id:uid('g'),name:nm,m:[],phase:1};data.grp.push(g);}g.name=nm;g.m=members.filter(function(id,i,a){return a.indexOf(id)===i;});if(chkAny)delete g.all;else g.all=1;
  var r=chkCur;if(!chkPhaseBank&&!r){var L=curList();if(!L)return;r=phaseAttach(data,g.id,uid('c'),L.id,nowIso());chkOpen[r.id]=1;}
  if(r){r.sg=g.id;chkSetText(r,$('ks-text').value);r.edited=nowIso();}phaseEnsure(data);touch();closeSheet($('ksheet'));if($('phsheet').open)renderPhaseBank();render();}

var wsNew=false;
function openLists(){$('ws-new').value='';wsNew=false;renderLists();openSheet($('wsheet'));}
function renderLists(){var c=$('ws-list'),L=curList();c.textContent='';
  [{id:null,name:'Lista',sub:'Jatkuva, ajan mukaan uusiutuva'}].concat((data.lists||[]).map(function(x){return {id:x.id,name:x.name,sub:x.aj&&!x.wf&&!x.run?'Ajan mukaan uusiutuva':x.run?(x.run.done?'Valmis suoritus':'Keskeneräinen suoritus')+' · '+itemName(x.run.tid)+' · '+flowOrigin(x)+' · '+stamp(x.created):'Kierros'};})).forEach(function(x){
    var b=el('button','row'+((L?L.id:null)===x.id?' sel':''));b.type='button';b.dataset.l=x.id||'';var t=el('span','t',x.name);t.appendChild(el('small','',x.sub+' · '+data.chk.filter(function(r){return (r.l||null)===x.id;}).length+' riviä'));b.appendChild(t);
    b.addEventListener('click',function(){setList(x.id);closeSheet($('wsheet'));render();});c.appendChild(b);});
  var cu=$('ws-cur');cu.textContent='';
  if(L&&L.run){cu.appendChild(L.run.done?subI('Valmis suoritus.','Kuittaukset säilyvät tässä.'):subI('Erillinen suoritus.','Voit poistua ja jatkaa myöhemmin. Pohjan rivivalikoima on käynnistyshetkeltä; yhteisten vaiheiden muutokset ja projektin ehdot päivittyvät myös tähän.'));var bar=el('div','btnrow');button(bar,'Takaisin lähtökohtaan','btn',function(){closeSheet($('wsheet'));flowReturn(L);}).id='ws-source';if(!L.run.done)button(bar,'Aloita tämä suoritus alusta','mini',function(){closeSheet($('wsheet'));kierReset(L,false);}).id='chk-reset';cu.appendChild(bar);var dr=el('div','delrow');cu.appendChild(dr);var del=button(dr,'Poista suoritus','mini dangerline',function(){delAsk(del,'Poistetaanko suoritus?','Lähtökohta jää ennalleen. Valmistumisen yhteenveto säilyy muistiinpanoissa.',function(){data.chk=data.chk.filter(function(r){return r.l!==L.id;});data.lists=data.lists.filter(function(x){return x!==L;});touch();closeSheet($('wsheet'));flowReturn(L);});});del.id='ws-del';return;}
  /* Ehdot (1.67, 1.71): listalla vain pieni kytkin. Ehtoja muokataan Asiasanat-ikkunan Ehdoista. */
  var C=condCfg(L?L.id:null),on=!!(C&&C.eh),eh=el('div','lrow tglrow'),et=el('label','fl','Ehdot');et.htmlFor='ws-eh';eh.appendChild(et);
  var es=el('button','tgl');es.type='button';es.id='ws-eh';es.setAttribute('role','switch');es.setAttribute('aria-checked',on?'true':'false');es.setAttribute('aria-label','Ehdot käytössä');
  es.addEventListener('click',function(){var X=condCfg(L?L.id:null);if(!X){X={};data.jl=X;}if(X.eh)delete X.eh;else X.eh=1;touch();renderLists();});eh.appendChild(es);cu.appendChild(eh);
  /* 1.88 (Emil 25.10.2026): tänään ja myöhässä olevat muistiinpanot listan riveiksi. Kuittaus kuittaa vain sen päivän ajankohdan. */
  var mo=!!(C&&C.mu),mr=el('div','lrow tglrow'),mt=el('label','fl','Tänään ja myöhässä olevat muistiinpanot');mt.htmlFor='ws-mu';mr.appendChild(mt);
  var ms2=el('button','tgl');ms2.type='button';ms2.id='ws-mu';ms2.setAttribute('role','switch');ms2.setAttribute('aria-checked',mo?'true':'false');ms2.setAttribute('aria-label','Tuo tänään ja myöhässä olevat muistiinpanot');
  ms2.addEventListener('click',function(){var X=condCfg(L?L.id:null);if(!X){X={};data.jl=X;}if(X.mu)delete X.mu;else X.mu=1;touch();renderLists();});mr.appendChild(ms2);if(OLDUI||mo)cu.appendChild(mr);
  /* 1.104: Aikaehdotukset (1.49) alapalkista tänne; näkyvät Rivit-näkymässä */
  if(!L&&OLDUI){var pr=el('div','lrow tglrow'),pt=el('label','fl','Aikaehdotukset (Rivit-näkymässä)');pt.htmlFor='chplan-t';pr.appendChild(pt);var pb=el('button','tgl');pb.type='button';pb.id='chplan-t';pb.setAttribute('role','switch');
    pb.setAttribute('aria-checked',planOn()?'true':'false');pb.setAttribute('aria-label','Aikaehdotukset');pb.addEventListener('click',function(){data.cfg.plan=planOn()?'off':'on';save();renderLists();render();});pr.appendChild(pb);cu.appendChild(pr);}
  /* 1.105 (Emil 18.11.2026): listan tarkistuskohteet. Valitut ovat kaikilla listan riveillä; rivi voi ruksia pois (ruudun ikkunan Valitse asiat). */
  if(tkOk(L)){tkInit(L);var C2=condCfg(L?L.id:null),TK=C2&&C2.tk?C2.tk:[],tkb=el('div','wstk'),th=el('h3','','Tarkistuskohteet');tkb.appendChild(th);cu.appendChild(tkb);iTo(tkb,'Valitut asiat ovat tämän listan kaikilla riveillä. Rivin ruudussa Valitse asiat jättää asian pois siltä riviltä. Välit ja tärkeysjärjestys ovat Asiat-taulukossa ja yhteiset kaikille listoille.');
    var tw=el('div','chips');tw.id='ws-tk';orderedTerms().forEach(function(t){if(t.time||(t.auto&&t.kind==='g'))return;var on=TK.indexOf(t.id)>=0,b=button(tw,t.name,'chip',function(){tkSet(L?L.id:null,t.id,!on);renderLists();render();});b.dataset.tid=t.id;b.setAttribute('aria-pressed',on?'true':'false');});
    if(wsNew){var nw=el('span','pknew'),ni2=el('input');ni2.type='text';ni2.id='ws-tknew';ni2.placeholder='Uusi asia';ni2.autocomplete='off';ni2.setAttribute('enterkeyhint','done');nw.appendChild(ni2);
      var go2=function(){var n=clean(ni2.value).slice(0,60);wsNew=false;if(n){var ex=allTerms().filter(function(t){return keyOf(t.name)===keyOf(n);})[0];if(!ex){ex={id:uid('t'),name:n,yes:[],no:[]};data.terms.push(ex);termCache=null;}tkSet(L?L.id:null,ex.id,true);}renderLists();render();};
      ni2.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();go2();}});button(nw,'Lisää','mini',go2).id='ws-tknewok';tw.appendChild(nw);setTimeout(function(){try{ni2.focus({preventScroll:true});}catch(e){}},0);}
    else{var nb2=button(tw,'+ Uusi','pklink',function(){wsNew=true;renderLists();});nb2.id='ws-tkadd';}tkb.appendChild(tw);
    if(jatL(L)&&OLDUI){var rv=el('div','lrow tglrow'),rt=el('label','fl','Vanha rivinäkymä');rt.htmlFor='ws-rows';rv.appendChild(rt);var rb=el('button','tgl');rb.type='button';rb.id='ws-rows';rb.setAttribute('role','switch');rb.setAttribute('aria-checked',listView()==='r'?'true':'false');rb.setAttribute('aria-label','Vanha rivinäkymä');
      rb.addEventListener('click',function(){setListView(listView()==='r'?'g':'r');renderLists();});rv.appendChild(rb);cu.appendChild(rv);}}
  if(!L)return;
  if(!L.run){var aj=el('div','lrow tglrow'),at=el('label','fl','Ajan mukaan uusiutuva (Ruudut ja Viikot)');at.htmlFor='ws-aj';aj.appendChild(at);var ab=el('button','tgl');ab.type='button';ab.id='ws-aj';ab.setAttribute('role','switch');ab.setAttribute('aria-checked',L.aj&&!L.wf?'true':'false');ab.setAttribute('aria-label','Ajan mukaan uusiutuva');
    ab.addEventListener('click',function(){if(L.aj&&!L.wf)delete L.aj;else{L.aj=1;delete L.wf;}touch();renderLists();render();});aj.appendChild(ab);cu.appendChild(aj);}
  var wf=el('div','lrow tglrow'),wt=el('label','fl','Työnkulku: perustilat ja valmistumisen tarkistus');wt.htmlFor='ws-wf';wf.appendChild(wt);var wb=el('button','tgl');wb.type='button';wb.id='ws-wf';wb.setAttribute('role','switch');wb.setAttribute('aria-label','Työnkulku');wb.setAttribute('aria-checked',L.wf?'true':'false');wb.addEventListener('click',function(){if(L.wf)delete L.wf;else{L.wf=1;L.eh=1;}touch();renderLists();render();});wf.appendChild(wb);if(OLDUI||L.wf)cu.appendChild(wf);
  var wfi=subI('','Työnkulussa perustilaiset näkyvät ilman kuittausta. Ehdot aktivoivat kohdat. Voit sulkea listan ja jatkaa myöhemmin.');wfi.classList.add('ws-wfi');if(OLDUI||L.wf)cu.appendChild(wfi);
  /* 1.77: Vain kuitattavat. Rivi näkyy vasta, kun siinä on kuitattavaa (ehdot tuovat kohteita esiin), kuten päätöspuussa. */
  var vk=el('div','lrow tglrow'),vt=el('label','fl','Vain kuitattavat');vt.htmlFor='ws-vk';vk.appendChild(vt);var vs=el('button','tgl');vs.type='button';vs.id='ws-vk';vs.setAttribute('role','switch');vs.setAttribute('aria-checked',L.vk?'true':'false');vs.setAttribute('aria-label','Vain rivit, joissa on kuitattavaa');
  vs.addEventListener('click',function(){if(L.vk)delete L.vk;else L.vk=1;touch();renderLists();});vk.appendChild(vs);vk.hidden=!!L.wf;if(OLDUI||L.vk)cu.appendChild(vk);
  cu.appendChild(el('h3','','Tämä kierroslista'));var ar=el('div','btnrow');button(ar,'Aloita alusta','mini',function(){closeSheet($('wsheet'));kierReset(L,false);}).id='chk-reset';button(ar,'Lopeta ja tallenna muistiinpanoksi','mini',function(){closeSheet($('wsheet'));kierReset(L,true);}).id='ws-end';cu.appendChild(ar);var lr=el('div','lrow');lr.appendChild(el('label','fl','Nimi'));var ni=el('input');ni.type='text';ni.id='ws-name';ni.value=L.name;lr.appendChild(ni);cu.appendChild(lr);
  ni.addEventListener('change',function(){var v=clean(ni.value).slice(0,80);if(v&&v!==L.name){L.name=v;touch();renderLists();}});
  var dr=el('div','delrow'),db=button(dr,'Poista lista','mini dangerline',function(){delAsk(db,'Poistetaanko '+L.name+'?','Lista ja sen rivit poistuvat. Rivien tekstit jäävät muistiinpanoiksi Muistioon.',function(){
    data.chk=data.chk.filter(function(r){return r.l!==L.id;});data.lists=data.lists.filter(function(x){return x!==L;});setList(null);touch();closeSheet($('wsheet'));render();});});db.id='ws-del';cu.appendChild(dr);
  /* Ajassa uusiutuvalla listalla ei ole kierroksen eikä työnkulun valintoja */
  if(jatL(L)){['ws-wf','ws-vk'].forEach(function(id){var x=$(id);if(x)x.closest('.lrow').hidden=true;});var ar0=$('chk-reset');if(ar0){var bx=ar0.closest('.btnrow');bx.hidden=true;if(bx.previousSibling&&bx.previousSibling.tagName==='H3')bx.previousSibling.hidden=true;}var it0=cu.querySelector('.ws-wfi');if(it0)it0.hidden=true;}
  var end=$('ws-end');if(end&&L.wf){end.textContent='Kuittaa työnkulku ja tallenna';end.disabled=!workflowReady(listRows(),new Date(),function(r){return ctxOf(r,todayIso());});}}
/* Ehtojen ikkuna (Emil 23.10.2026, 1.67; 1.69 projektin yhteiset): ylhäällä ehdot kahtena sarakkeena (Kun kuitataan | Silloin), napautus avaa
   muokattavaksi. Muokkaus: Kun kuitataan = laukaisijat (Jokin näistä / Kaikki näistä), Silloin = napautus kiertää esiin → pois → ei mitään.
   Kaikki projektin asiasanat, tähdelliset ensin; + Uusi asiasana (nimen lopun * = tärkeä). Listalla vain kytkin, ovatko ehdot käytössä. */
var ehCur=null,ehL=null;
/* 1.89: ehP = puu, jonka ehtoja muokataan (null = projektin ehdot), ehTL = sen ehdot muokkauksen ajan. Jokainen muutos kirjoitetaan puun säännöiksi ja tekstiin. */
var ehP=null,ehTL=null;
var EHC={get ehdot(){return ehP?ehTL:(data.ehdot||(data.ehdot=[]));},set ehdot(v){if(ehP){ehTL=v;ehWrite();}else data.ehdot=v;}};
function ehTreeP(){return ehP?(data.projects||[]).filter(function(P){return P.id===ehP;})[0]||null:null;}
function ehWrite(){var P=ehTreeP();if(!P)return;ehTree(P,ehTL);rulesToText(P);}
var ehPN=null;function pName(k){if(k===ALKU)return 'Alku';var P=ehTreeP()||ehPN,it=P&&parseText(P.text).by[k];return it?it.name:k;}
function openEh(){ehCur=null;ehSolo=false;renderEh();openSheet($('ehsheet'));}
function ehTerms(){var o=[],seen={};allTerms().forEach(function(t){if(!t.name||t.kind==='g'||isSpec(t.id)||t.id.slice(0,2)==='z:'||seen[keyOf(t.name)])return;seen[keyOf(t.name)]=1;o.push(t.id);});termCache=null;
  EHC.ehdot.forEach(function(e){e.k.concat(e.on,e.off).forEach(function(id){if(o.indexOf(id)<0&&termName(id))o.push(id);});});
  var rk=chkRk(),st=o.filter(function(id){return rk[id]!==undefined;}).sort(function(a,b){return rk[a]-rk[b];}),ot=o.filter(function(id){return rk[id]===undefined;}).sort(function(a,b){return termName(a).localeCompare(termName(b),'fi');});
  return {st:st,ot:ot};}
/* 1.79: ehto ilman syytä ei tee mitään, joten se ei jää talteen */
function ehClean(){EHC.ehdot=EHC.ehdot.filter(function(e){return e.k.length;});}
/* 1.78 (Emil 24.10.2026): ehto pystysuuntaisina laatikkoina. Syylaatikko (Jokin / Kaikki / Poissulkevat), välissä Tuo / Poissulkee, alla seurauslaatikko
   (Poissulkevilla ei seurausta). Laatikon napautus avaa sen alle valinnan; syyksi käyvät myös ryhmät ja aikasanat. Suora ristiriita estetään heti
   (muutos perutaan ja syy kerrotaan), kaksoiskappale poistetaan Valmiissa, muut ristiriidat näkyvät huomautuksina. */
var ehPick='k',ehVerbs={},ehStash={},ehOpenT={};
function ehRow(e,i,E,go){var r=el('button','ehr');r.type='button';r.dataset.eh=e.id;r.appendChild(el('span','ehn',String(i+1)));var R=el('span','ehtx');
  if(e.ty==='x'){R.appendChild(el('span','ehk','Poissulkevat'));R.appendChild(el('span','ehoff',e.k.map(ehNm).join(' · ')||'(ei jäseniä)'));}
  else{R.appendChild(el('span','ehk',ehName(e.k,e.all)));var v=ehVerb(e),L=e[v];R.appendChild(el('span',v==='on'?'ehon':'ehoff',L.length?(v==='on'?'tuo ':'poissulkee ')+L.map(ehNm).join(', '):'(ei seurausta)'));}
  var I=ehIssues(E,e,ehNm);if(I.notes.length)R.appendChild(el('span','ehwarn',I.notes.length===1?'1 huomautus':I.notes.length+' huomautusta'));
  r.appendChild(R);r.addEventListener('click',go);return r;}
function ehRef(id){if(id.slice(0,2)==='q:')return {q:1,name:id.slice(2)};if(id.slice(0,2)==='p:')return {p:1,name:pName(id.slice(2))};var g=(data.grp||[]).filter(function(x){return x.id===id;})[0];if(g)return {g:1,name:g.name};var zn=timeName(id);if(zn)return {z:1,name:zn};var n=termName(id);return n?{name:n}:null;}
function ehNm(id){var r=ehRef(id);return r?r.q?'“'+r.name+'”':(r.g?'#':'')+r.name:'?';}
/* Teksti kirjoitetaan lainausmerkkeihin (myös iOS:n kaarevat); muuten nimi on asiasana */
function qOf(v){var m=/^\s*["“”„«»']\s*(.*?)\s*["“”„«»']?\s*$/.exec(v);return m&&clean(m[1])?'q:'+clean(m[1]).slice(0,80):null;}
function ehName(ids,all){return ids.map(ehNm).join(all?' ja ':' tai ')||'(ei syytä)';}
function ehVerb(e){return e.off.length&&!e.on.length?'off':e.on.length?'on':ehVerbs[e.id]||'on';}
function ehTry(e,fn){var b0=JSON.parse(JSON.stringify(e));fn();var I=ehIssues(EHC.ehdot,e,ehNm),TP=ehTreeP();if(TP&&!I.block)I.block=treeEhBlock(TP,EHC.ehdot,e,ehNm);
  if(I.block){Object.keys(e).forEach(function(k){delete e[k];});Object.keys(b0).forEach(function(k){e[k]=b0[k];});toast(I.block);renderEh();return false;}if(TP)ehWrite();touch();renderEh();return true;}
function ehLeave(){var e=ehCur&&EHC.ehdot.filter(function(x){return x.id===ehCur;})[0];ehCur=null;
  if(e){var I=ehIssues(EHC.ehdot,e,ehNm);if(I.dup>=0){EHC.ehdot=EHC.ehdot.filter(function(x){return x!==e;});toast('Sama ehto on jo (ehto '+(I.dup+1)+'), tätä ei tallennettu.');}}ehClean();if(ehP)ehWrite();touch();}
function renderEh(){if(!ehCur){ehP=null;ehTL=null;}var C=EHC,b=$('eh-body');b.textContent='';$('eh-h').textContent=ehCur?(ehP?'Puun ehto':'Ehto'):'Ehdot';if(typeof crumbSync==='function')crumbSync();
  if(!ehCur){C.ehdot.forEach(function(e,i){b.appendChild(ehRow(e,i,C.ehdot,function(){ehCur=e.id;ehPick=e.k.length?'':'k';renderEh();}));});
    if(!C.ehdot.length)b.appendChild(el('p','msg','Ei vielä ehtoja.'));
    var ar=el('div','btnrow');button(ar,'+ Ehto','mini okbtn',function(){var e={id:uid('e'),k:[],on:[],off:[]};C.ehdot.push(e);ehCur=e.id;ehPick='k';touch();renderEh();}).id='eh-add';b.appendChild(ar);
    /* 1.89: päätöspuiden säännöt samoina ehtoina, puuhun rajattuina (vaikuttavat vain puun kierrokseen) */
    (data.projects||[]).forEach(function(P){var TE=treeEh(P);ehPN=P;var dt=el('details','tsec ehtree');dt.dataset.p=P.id;if(ehOpenT[P.id])dt.open=true;
      dt.addEventListener('toggle',function(){if(dt.open)ehOpenT[P.id]=1;else delete ehOpenT[P.id];});var sm=el('summary');sm.appendChild(el('b','','Puu: '+P.name));
      sm.appendChild(el('span','tsv',TE.length?TE.length+(TE.length===1?' ehto':' ehtoa'):'ei ehtoja'));dt.appendChild(sm);
      TE.forEach(function(e,i){dt.appendChild(ehRow(e,i,TE,function(){ehP=P.id;ehTL=treeEh(P);ehCur=ehTL[i].id;ehPick='';renderEh();}));});
      var ar2=el('div','btnrow');button(ar2,'+ Ehto puuhun','mini',function(){ehP=P.id;ehTL=treeEh(P);var e={id:'pe'+ehTL.length+'n',k:[],on:[],off:[]};ehTL.push(e);ehCur=e.id;ehPick='k';renderEh();}).dataset.p=P.id;dt.appendChild(ar2);b.appendChild(dt);});ehPN=null;
    /* 1.79: asiasanojen tunnistussanat ehtoina (Kun "sana", niin Asiasana) */
    var WT=allTerms().filter(function(t){return t.kind!=='g'&&((t.yes&&t.yes.length)||(t.no&&t.no.length));});termCache=null;
    if(WT.length){var dt=el('details','tsec');dt.id='eh-tun';var sm=el('summary');sm.appendChild(el('b','','Tunnistus'));sm.appendChild(el('span','tsv',WT.length+(WT.length===1?' asiasana':' asiasanaa')));dt.appendChild(sm);
      WT.forEach(function(t){var r=el('button','ehr');r.type='button';r.dataset.w=t.id;r.appendChild(el('span','ehn',''));var R=el('span','ehtx');
        R.appendChild(el('span','ehk',(t.yes||[]).map(function(w){return '“'+w+'”';}).join(' tai ')||'(nimi)'));R.appendChild(el('span','ehon','tuo '+t.name));
        if(t.no&&t.no.length)R.appendChild(el('span','ehoff','paitsi '+t.no.map(function(w){return '“'+w+'”';}).join(', ')));r.appendChild(R);
        r.addEventListener('click',function(){ehCur='w:'+t.id;renderEh();});dt.appendChild(r);});b.appendChild(dt);}
    return;}
  if(ehCur.slice(0,2)==='w:'){renderEhW(b,ehCur.slice(2));return;}
  var e=C.ehdot.filter(function(x){return x.id===ehCur;})[0];if(!e){ehCur=null;renderEh();return;}var T=ehTerms(),X=e.ty==='x',v=ehVerb(e);
  var TP=ehTreeP();
  function picker(h){var secs=[['Asiat',T.st],['Muut',T.ot]];
    if(TP){var its=parseText(TP.text).items.map(function(it){return 'p:'+it.id;});secs=[['Palikat',(h==='k'&&!X&&!e.all&&ehVerb(e)==='on'?['p:'+ALKU]:[]).concat(its)]];}
    else if(h==='k'&&!X){secs.push(['Ryhmät',(data.grp||[]).map(function(g){return g.id;})]);secs.push(['Aika (jatkuva lista)',TIME_TERMS.map(function(t){return t.id;})]);secs.push(['Viikonpäivät',WD_TERMS.map(function(t){return t.id;})]);}
    if(!TP&&!(h==='k'&&X)){var QS=[];C.ehdot.forEach(function(f){f.k.concat(f.on,f.off).forEach(function(id){if(id.slice(0,2)==='q:'&&QS.indexOf(id)<0)QS.push(id);});});secs.push(['Tekstit',QS]);}
    var w0=el('div','ehpick');w0.id='eh-pick';secs.forEach(function(g){if(!g[1].length)return;w0.appendChild(el('div','ehsub',g[0]));var w=el('div','ehps');w.dataset.sec=h;
      g[1].forEach(function(id){var L=h==='k'?e.k:e[v],on=L.indexOf(id)>=0,R=ehRef(id)||{name:'?'},p=button(w,'','ehp'+(on?' sel':''),function(){ehTry(e,function(){var L2=h==='k'?e.k:e[v],i=L2.indexOf(id);if(i>=0)L2.splice(i,1);else L2.push(id);});});
        if(R.g)p.appendChild(el('i','gi'));p.appendChild(document.createTextNode(R.q?'“'+R.name+'”':R.name));p.dataset.tid=id;p.setAttribute('aria-pressed',on?'true':'false');});w0.appendChild(w);});
    if(TP){w0.appendChild(el('p','sub','Palikat tehdään Rakennassa.'));return w0;}
    var nr=el('div','addrow');nr.style.marginTop='8px';var ni=el('input');ni.type='text';ni.id='eh-new';ni.placeholder=h==='k'&&X?'Uusi asiasana':'Asiasana tai "teksti"';ni.setAttribute('aria-label',ni.placeholder);ni.autocomplete='off';nr.appendChild(ni);
    /* 1.79: lainausmerkeissä teksti, muuten asiasana (olemassa oleva tai uusi; * lopussa = tärkeä). Lisätty valitaan samalla tähän laatikkoon. */
    var addT=function(){var q=h==='k'&&X?null:qOf(ni.value),id=q;if(!id){var sn=starName(ni.value.replace(/^["“”„«»']+|["“”„«»']+$/g,''));if(!sn.name)return;var t=allTerms().filter(function(x){return keyOf(x.name)===keyOf(sn.name)&&x.kind!=='g';})[0];termCache=null;
        if(!t){t={id:uid('t'),name:sn.name.slice(0,60),yes:[],no:[]};data.terms.push(t);}if(sn.imp)syncImp(t.id,true);id=t.id;}
      var L=h==='k'?e.k:e[v];if(L.indexOf(id)>=0){touch();renderEh();}else ehTry(e,function(){(h==='k'?e.k:e[v]).push(id);});var f=$('eh-new');if(f)f.focus();};
    button(nr,'Lisää','btn',addT).id='eh-newb';ni.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();addT();}});w0.appendChild(nr);return w0;}
  function chips(h,L,cls,ph){var c=el('button','ehchips');c.type='button';c.id=h==='k'?'eh-k':'eh-t';c.setAttribute('aria-expanded',ehPick===h?'true':'false');
    L.forEach(function(id){var R=ehRef(id)||{name:'?'},s=el('span','ehc'+(cls?' '+cls:'')+(R.q?' q':''));if(R.g)s.appendChild(el('i','gi'));s.appendChild(document.createTextNode(R.q?'“'+R.name+'”':R.name));c.appendChild(s);});
    if(!L.length)c.appendChild(el('span','ehph',ph));c.appendChild(el('span','ehed',ehPick===h?'Sulje':'Muuta'));
    c.addEventListener('click',function(){ehPick=ehPick===h?'':h;renderEh();});return c;}
  /* Syylaatikko */
  var bk=el('div','ehbox'+(ehPick==='k'?' act':''));bk.id='eh-cause';var sg=el('div','seg');sg.id='eh-ty';
  if(TP)b.appendChild(el('p','sub ehtp','Puu: '+TP.name+'. Vaikuttaa vain tämän puun kierrokseen.'));
  [['tai','Jokin'],['ja','Kaikki']].concat(OLDUI||X?[['x','Poissulkevat']]:[]).forEach(function(m){var cur=X?'x':e.all?'ja':'tai';button(sg,m[1],'',function(){if(m[0]===cur)return;ehTry(e,function(){
      if(m[0]==='x'){ehStash[e.id]={k:e.k.slice(),on:e.on,off:e.off};e.ty='x';e.on=[];e.off=[];delete e.all;e.k=e.k.filter(function(id){var R=ehRef(id);return R&&!R.g&&!R.z;});}
      else{if(X){delete e.ty;var S=ehStash[e.id];if(S){e.on=S.on;e.off=S.off;e.k=S.k;}}if(m[0]==='ja')e.all=1;else delete e.all;}});}).setAttribute('aria-pressed',m[0]===cur?'true':'false');});
  bk.appendChild(sg);bk.appendChild(chips('k',e.k,'',X?'Valitse toisensa poissulkevat asiat':'Valitse syyt'));b.appendChild(bk);if(ehPick==='k')b.appendChild(picker('k'));
  if(!X){var vs=el('div','seg ehverb');vs.id='eh-verb';[['on','Tuo'],['off','Poissulkee']].forEach(function(m){button(vs,m[1],'',function(){if(m[0]===v)return;ehTry(e,function(){var L=e[v];e[v]=[];e[m[0]]=L;ehVerbs[e.id]=m[0];});}).setAttribute('aria-pressed',m[0]===v?'true':'false');});b.appendChild(vs);
    var bt=el('div','ehbox eff'+(ehPick==='t'?' act':''));bt.id='eh-eff';bt.appendChild(chips('t',e[v],v==='on'?'on':'off',v==='on'?'Valitse, mitä tulee esiin':'Valitse, mitä jää pois'));b.appendChild(bt);if(ehPick==='t')b.appendChild(picker('t'));}
  else iTo(b,TP?'Kun yksi näistä on valittu, muut jäävät pois kierrokselta.':'Kun yksi näistä on kuitattu, muut jäävät pois kaikilta listan riveiltä.');
  /* Huomautukset: napautus avaa toisen ehdon */
  ehIssues(C.ehdot,e,ehNm).notes.forEach(function(n){var nb=button(b,'Huom: '+n.txt,'ehnote',function(){ehLeave();ehCur=n.id;ehPick='';renderEh();});nb.dataset.eh=n.id;});
  var br=el('div','btnrow');br.style.marginTop='12px';button(br,'Valmis','mini okbtn',function(){ehLeave();if(ehSolo){ehBack();return;}renderEh();}).id='eh-done';b.appendChild(br);
  var dr=el('div','delrow'),db=button(dr,'Poista ehto','mini dangerline',function(){delAsk(db,'Poistetaanko ehto?',TP?'Ehto poistuu puusta '+TP.name+'.':'Ehto poistuu kaikilta listoilta.',function(){C.ehdot=C.ehdot.filter(function(x){return x!==e;});ehCur=null;touch();if(ehSolo){ehBack();return;}renderEh();});});db.id='eh-del';b.appendChild(dr);}
$('eh-ok').addEventListener('click',function(){ehLeave();ehP=null;ehTL=null;if(ehSolo){ehBack();return;}closeSheet($('ehsheet'));render();});
/* 1.105: Lista = ajassa uusiutuva tarkistuslista (Ruudut ja Viikot), Kierros = entinen kierros- ja työnkulkulista */
function addList(aj){var v=clean($('ws-new').value).slice(0,80);if(!v)return;var L=aj===true?{id:uid('l'),name:v,created:nowIso(),aj:1,tk:[]}:{id:uid('l'),name:v,created:nowIso(),wf:1,eh:1};data.lists=(data.lists||[]).concat([L]);setList(L.id);touch();closeSheet($('wsheet'));render();}
$('ws-add').addEventListener('click',function(){addList(false);});$('ws-add-aj').addEventListener('click',function(){addList(true);});$('ws-new').addEventListener('keydown',function(ev){if(ev.key==='Enter')addList(false);});
$('ws-ok').addEventListener('click',function(){var n=$('ws-name');if(n)n.dispatchEvent(new Event('change'));closeSheet($('wsheet'));render();});
/* Listasta tehty varaus (1.61, Emil 23.10.2026): kun Aikaehdotuksista tehty kalenterimerkintä kuitataan (kohta tai koko muistiinpano),
   alkuperäinen listan kohde kuittaantuu samalla hetkellä. Sama kuittaus siirretään vain kerran (n.pl.ok), joten kohteen voi purkaa käsin. */
function planSync(now,CX){var ch=false;data.notes.forEach(function(n){if(!n.pl)return;var t=n.done||'';Object.keys(n.pts||{}).forEach(function(k){if(n.pts[k]>t)t=n.pts[k];});
    if(!t||t<=(n.pl.ok||''))return;var r=data.chk.filter(function(x){return x.id===n.pl.r;})[0];n.pl.ok=t;ch=true;if(!r||flowLink(n.pl.i))return;
    var x=(r.it||[]).filter(function(y){return y.id===n.pl.i;})[0];if(!x){var v=chkView(r,CX[r.id],now).filter(function(y){return y.id===n.pl.i;})[0];x={id:n.pl.i};if(v&&v.t)x.t=1;if(v&&v.g)x.g=1;r.it=(r.it||[]).concat([x]);}
    if(!x.ok||x.ok<t)x.ok=t;});return ch;}
/* Tuleva kuittaamaton varaus kohteelle: "tänään 17.30" tai "ti 24.10. 17.30" */
function planVar(today){var o={};data.notes.forEach(function(n){if(!n.pl||n.done||n.arch||!n.date||n.date<today||(n.pts&&Object.keys(n.pts).length))return;var k=n.pl.r+'|'+n.pl.i;if(o[k]&&o[k].d<=n.date)return;
    o[k]={d:n.date,t:(n.date===today?'tänään':fromIsoW(n.date))+(n.time&&n.time.s?' '+fmtTime(n.time.s):'')};});Object.keys(o).forEach(function(k){o[k]=o[k].t;});return o;}
/* 1.88 (Emil 25.10.2026): listan kytkin mu tuo tänään ja myöhässä olevat muistiinpanot omiksi riveikseen (ei tallenneta riveiksi).
   Kohde on Tänään tai Myöhässä; kuittaus kuittaa vain sen ajankohdan (N.pts, sama kuin kalenterissa). Tänään kuitattu jää rivinä pohjalle päivän loppuun.
   Muistiinpano, joka on jo listan rivin teksti, ei tule kahdesti. */
function muRows(rows,today,CX){var C=condCfg((curList()||{}).id||null);if(!C||!C.mu)return [];var has={},out=[];rows.forEach(function(r){if(r.nid)has[r.nid]=1;});
  /* 1.91: jokainen teksti on oma rivinsä (r.pi), ja sen kuittaus koskee vain sen aikoja */
  data.notes.forEach(function(N0){if(gone(N0,today)||has[N0.id])return;var SP=sepParts(N0.text);(SP||[0]).forEach(function(q,i){var NP=SP?partNote(N0,i):N0,DA=noteDates(NP),D=DA.filter(plain),N={id:N0.id,created:N0.created,text:NP.text,pts:N0.pts,_ds:D};
    /* 1.93: toistuva teksti on listalla aina, tavallisena toistuvana kohteena: avoinna viimeisimmästä kerrasta kuittaukseen asti */
    DA.forEach(function(o,k){if(plain(o)||!o.R||recEnded(o,today))return;var key=recKey(o,today);if(!key)return;var wid=o.wds&&o.wds.length?'z:'+o.wds[0]:'z:today',
        r2={id:'mu:'+N0.id+(SP?':'+i:'')+':t'+k,nid:N0.id,name:'',created:N0.created,it:[{id:wid}],mu:1,rt:1},c2={ev:{},mn:[],mnz:null,gm:[],tt:[],nc:ms(N0.created)};if(SP)r2.pi=i;
      var kd=key.slice(0,10),ok=!!(N0.pts&&N0.pts[key]);
      if(kd<=today&&!ok)c2.z={id:wid,keys:[key],since:fromIso(kd).getTime()};
      else{var nk=kd>today?kd:nextOcc(o,isoD(addDays(fromIso(today),1)));c2.zd={id:wid,keys:ok?[key]:[],tx:ok&&kd===today?'kuitattu tänään':nk?'seuraava '+occLabel(occKey(nk,o)):'kuitattu'};}
      CX[r2.id]=c2;out.push(r2);});
    if(!D.length)return;
    var r={id:'mu:'+N0.id+(SP?':'+i:''),nid:N0.id,name:'',created:N0.created,it:[{id:'z:late'},{id:'z:today'}],mu:1},T=chkTime(N,today,['z:late','z:today']),c={ev:{},mn:[],mnz:null,gm:[],tt:[],nc:ms(N0.created)};if(SP)r.pi=i;
    if(T.z){c.z=T.z;CX[r.id]=c;out.push(r);return;}
    var dk=Object.keys(N0.pts||{}).filter(function(k){var d=new Date(N0.pts[k]),di=k.slice(0,10);return !isNaN(d)&&isoD(d)===today&&di<=today&&(D.some(function(o){return occursOn(o,di)&&occKey(di,o)===k.replace(/#\d+$/,'');}));});
    if(dk.length){c.zd={id:dk.some(function(k){return k.slice(0,10)===today;})?'z:today':'z:late',keys:dk};CX[r.id]=c;out.push(r);}});});return out;}
function renderChk(p){tkInit(curList());var now=new Date(),today=todayIso(),list=el('div','chlist');list.id='chlist';termCache=allTerms();ctxAT=termCache;var CX={};
  data.chk.forEach(function(r){if(r.nid&&!noteOf(r))delete r.nid;CX[r.id]=ctxOf(r,today);});var rk=chkRk();if(planSync(now,CX)){save();data.chk.forEach(function(r){CX[r.id]=ctxOf(r,today);});}var PV=planVar(today);
  var LC=curList(),JL=jatL(LC),ROWS=listRows(),MU=muRows(ROWS,today,CX);
  /* 1.99: rivin poimimat tekstit (vain aikaan perustuvalla listalla). Poimittu teksti ei tule samalle listalle erikseen muistiinpanorivinä. */
  var PKS={},PKD={},TOC={},EVM=evMap(termCache),pkT=function(N){if(!TOC[N.id])TOC[N.id]=tunOn()?partTerms(termCache,N.text):noteParts(N.text).map(function(){return [];});return TOC[N.id];};
  if(JL)ROWS.forEach(function(r){if(!r.px)return;PKS[r.id]=rowPicks(r,data.notes,pkT,today,now,EVM,rk);PKS[r.id].forEach(function(x){PKD[x.nid+'|'+x.pi]=1;});});
  MU=MU.filter(function(r){return !(PKD[r.nid+'|'+(r.pi===undefined?0:r.pi)]);});var MD=MU.filter(function(r){return CX[r.id].zd;});
  var SR=chkSort(ROWS.concat(MU.filter(function(r){return !CX[r.id].zd;})),rk,today,now,function(r){return CX[r.id];},PKS).concat(MD),LV=JL&&listView()!=='r',PL=JL&&!LV&&planOn()?planNow(now,today,CX,rk):null;
  /* ⏱ päällä eikä mikään ole lauennut: rivit siinä järjestyksessä, jossa niiden seuraavat kohteet mahtuisivat kalenteriin (1.49) */
  if(PL&&PL.dry){var fo={};PL.list.forEach(function(it,i){if(fo[it.r.id]===undefined)fo[it.r.id]=i;});SR=SR.map(function(r,i){return {r:r,i:i};}).sort(function(a,b){var x=fo[a.r.id],y=fo[b.r.id];x=x===undefined?1e9+a.i:x;y=y===undefined?1e9+b.i:y;return x-y;}).map(function(o){return o.r;});}
  /* 1.77: avatun rivin aikana järjestys pysyy (kuittaus ei siirrä rivejä alta pois) */
  if(chkFreeze){var fzp={};chkFreeze.forEach(function(id,i){fzp[id]=i;});SR=SR.map(function(r,i){return {r:r,i:i};}).sort(function(a,b){var x=fzp[a.r.id],y=fzp[b.r.id];x=x===undefined?1e6+a.i:x;y=y===undefined?1e6+b.i:y;return x-y;}).map(function(o){return o.r;});}
  var ORD=SR.map(function(r){return r.id;}),GL=chkGlow,PRV=chkPrev,DUEN={},FOC=kt()?Object.keys(chkOpen).filter(function(id){return ORD.indexOf(id)>=0;})[0]||null:null;chkGlow=null;chkPrev=null;var VK=!!(LC&&LC.vk&&!LC.wf),hidN=0;
  var pb0=el('div','plbar'),pbl=el('div','plgrp');pb0.appendChild(pbl);var lb0=button(pbl,'','treepick',openLists);lb0.id='chlist-pick';lb0.appendChild(el('span','',LC?LC.name:'Lista'));lb0.insertAdjacentHTML('beforeend',CHEV);lb0.setAttribute('aria-label','Valitse lista');
  if(LC&&LC.wf&&!LC.run)button(pbl,'Vaihepankki','mini',function(){openPhaseBank(false);}).id='phase-bank';
  if(wide())button(pbl,'Asiasanat…','mini',openTerms).id='chterms';
  if(LC&&!JL){var ready=workflowReady(ROWS,now,function(r){return CX[r.id];}),end=button(pb0,LC.wf?'Kuittaa työnkulku':'Lopeta','mini',function(){kierReset(LC,true);});end.id='chk-end';end.disabled=!!(LC.run&&LC.run.done)||!!(LC.wf&&!ready);if(LC.run){end.textContent=LC.run.done?'Suoritus valmis':'Valmis — kuittaa työnkulku';button(pb0,'Takaisin lähtökohtaan','mini',function(){flowReturn(LC);}).id='flow-back';}end.title=end.disabled?'Käsittele avoimet kohdat ennen kuittausta':'';}
  else{/* 1.104: Viikot / Rivit ja pikamuistiinpano alapalkissa; Aikaehdotukset siirtyi Lista-ikkunaan */
    var pk=button(pbl,'Pika','mini',function(){openPika();});pk.id='pika-open';pk.setAttribute('aria-haspopup','dialog');pk.setAttribute('aria-label','Pikamuistiinpano');pb0.appendChild(el('i','brk'));
    var lvs=el('div','seg calv');lvs.id='listview';lvs.setAttribute('role','group');lvs.setAttribute('aria-label','Listan näkymä');
    [['g','Ruudut','Rd'],['w','Viikot','Vk']].forEach(function(o){var b=el('button');b.type='button';b.dataset.v=o[0];b.appendChild(el('span','lg',o[1]));b.appendChild(el('span','sh',o[2]));b.setAttribute('aria-label',o[1]);
      b.setAttribute('aria-pressed',listView()===o[0]?'true':'false');b.addEventListener('click',function(){if(listView()!==o[0])setListView(o[0]);});lvs.appendChild(b);});pb0.appendChild(lvs);}
  if(!FOC)($('nbar')||p).appendChild(pb0);
  if(PL&&!FOC)renderPlan(p,PL,today);
  if(LV&&!FOC){if(listView()==='w')renderWeeks(p,ROWS,CX,rk,today,now);else renderTiles(p,ROWS,CX,rk,today,now);termCache=null;ctxAT=null;return;}
  lwPopHide();
  SR.forEach(function(r){var cx=CX[r.id],V=chkView(r,cx,now).concat(cx.zd?[{id:cx.zd.id,x:null,ok:true,since:null,z:1,keys:cx.zd.keys,zd:1}]:[]).sort(function(a,b){return (a.off?1:0)-(b.off?1:0);}),D=chkDue(r,now,cx),RD=LC&&!JL&&chkDone(r,now,cx),
    /* Tärkein kuittaamaton (Emil 23.10.2026, 1.68): täytetty punainen; tähtijärjestys, tasatilanteessa varhaisin lauennut, sitten järjestys. Kuittauksen jälkeen seuraava. */
    TOP=(D.slice().sort(function(a,b){var x=rk[a.id]===undefined?Infinity:rk[a.id],y=rk[b.id]===undefined?Infinity:rk[b.id];if(x!==y)return x<y?-1:1;var p=a.since===null?Infinity:a.since,q=b.since===null?Infinity:b.since;return p-q;})[0]||{}).id,due=D.length>0,open=!!chkOpen[r.id],N=noteOf(r),c=el('div','crow'+(due?' due':'')+(open?' open':'')+(r.mu?' mu':''));c.dataset.id=r.id;
    if(due)DUEN[r.id]=1;if(FOC){if(r.id===FOC)list.appendChild(focusView());return;}
    /* 1.77 Vain kuitattavat (kierroslista): rivi, jossa ei ole yhtään näkyvää kohdetta (ehdot eivät ole vielä tuoneet), on piilossa */
    if(VK&&!open&&!V.some(function(v){return !v.off;})){hidN++;return;}
    if(GL===r.id&&PRV&&PRV.indexOf(r.id)!==ORD.indexOf(r.id))c.classList.add('glow');
    var hd=el('button','chd');hd.type='button';hd.setAttribute('aria-expanded',open?'true':'false');
    var hn=el('span','cn');hn.appendChild(el('span','',r.name||(N?partTitle(N,r.pi):'')||'(nimetön)'));if(r.mu)hn.appendChild(el('small','cmu','muistiinpano'));
    var gsT=!V.some(function(v){return !v.z;})&&cx.gs&&cx.gs.length?(chkDone(r,now,cx)?'toteutunut':'odottaa'):'';
    var PK=PKS[r.id]||[],PKo=PK.filter(function(x){return x.st==='open';}),cst=cx.zd?(cx.zd.tx||'kuitattu tänään'):chkStatus(r,now,cx)||(cx.workflow?(V.some(function(v){return v.ok;})?'Valmis':'Perustila'):gsT);
    /* 1.99: avoimet tekstit tilaan: ”2 tekstiä” omana tai kohteiden tilan perään */
    if(PKo.length)cst=(cst?cst+' · ':'')+PKo.length+(PKo.length===1?' teksti':' tekstiä');
    if(kt()&&chkSeen&&due&&!chkSeen[r.id]){var nw=el('i','ktnew');nw.setAttribute('aria-label','uutta');hn.appendChild(nw);}
    hd.appendChild(hn);hd.appendChild(el('span','cs'+(due||PKo.length?' late':''),cst));hd.insertAdjacentHTML('beforeend',CHEV);
    hd.addEventListener('click',function(){if(kt()){chkOpen={};chkOpen[r.id]=1;chkFreeze=ORD;chkSeen=DUEN;ktDone=false;render();main.scrollTop=0;return;}if(chkOpen[r.id]){delete chkOpen[r.id];if(!Object.keys(chkOpen).length){chkFreeze=null;chkGlow=r.id;chkPrev=ORD;}}else{chkOpen[r.id]=1;chkFreeze=ORD;}render();});c.appendChild(hd);
    /* 1.77: suljetulla rivillä tärkein kuittaamaton kohde nappina; kuittaus suoraan, järjestys muuttuu 0,6 s myöhemmin */
    if(!open&&TOP&&!(LC&&RD)&&!(LC&&LC.run&&LC.run.done)){var tv=V.filter(function(v){return v.id===TOP&&!v.ok;})[0];if(tv){var qw=el('div','cquick'),qb=el('button','cpill ctop','');qb.type='button';qb.dataset.tid=tv.id;
      var qn=vName(tv),qr=isRep(tv);qb.textContent=qn;if(qr)qb.insertBefore(repMark(),qb.firstChild);qb.setAttribute('aria-label','Tärkein, kuittaa: '+qn+(qr?', toistuva':''));qb.addEventListener('click',function(){chkFreeze=chkFreeze||ORD;hit(tv);clearTimeout(chkFzT);
        chkFzT=setTimeout(function(){if(!Object.keys(chkOpen).length){chkFreeze=null;chkGlow=r.id;chkPrev=ORD;}if(tab==='notes'&&noteView==='chk')render();},600);});qw.appendChild(qb);c.appendChild(qw);}}
    if(!open&&PKo.length){var sm=el('button','ctxsum');sm.type='button';var N1=data.notes.filter(function(n){return n.id===PKo[0].nid;})[0];sm.appendChild(el('span','',N1?partTitle(N1,noteParts(N1.text).length>1?PKo[0].pi:undefined).slice(0,60):''));if(PKo.length>1)sm.appendChild(el('small','',' +'+(PKo.length-1)));
      sm.setAttribute('aria-label','Tekstit: '+PKo.length+' avoinna. Avaa rivi.');sm.addEventListener('click',function(){chkOpen[r.id]=1;chkFreeze=ORD;render();});c.appendChild(sm);}
    function isRep(v){return !v.z&&!v.mn&&!!evRule(evOf(v.x||{id:v.id},cx));}
    function vName(v){var MN=v.mn?data.notes.filter(function(n){return n.id===v.mn;})[0]:null;return MN?partTitle(MN,v.mp).slice(0,48)||'(muistiinpano)':itemName(v.id);}
    function hit(v){if(LC&&LC.run&&LC.run.done)return;if(v.base||v.off||(LC&&RD&&!v.ok))return;var x=v.x,MN=v.mn?data.notes.filter(function(n){return n.id===v.mn;})[0]:null;
      /* Aikakohde kuittaa saman päivän kalenterissa (sama tila kuin kalenterin ja muistiinpanon kuittaus) */
      if(v.z){var NN=MN||N,U0=undoArm([NN]),P=NN.pts||(NN.pts={}),t=nowIso();v.keys.forEach(function(k){if(v.zd)delete P[k];else P[k]=t;});if(v.zd&&!Object.keys(P).length)delete NN.pts;touch();render();undoAt=Date.now();undoShow(U0,v.zd?'Kuittaus peruttu':'Kuitattu');return;}
      if(!v.ok&&flowLink(v.id)){startFlow(v.id,r);return;}
      var U=undoArm([r]);if(!x){x={id:v.id};if(v.t)x.t=1;if(v.g)x.g=1;r.it=(r.it||[]).concat([x]);}toggleItem(x,undefined,evOf(x,cx));touch();render();undoAt=Date.now();undoShow(U,x.ok?'Kuitattu':'Kuittaus peruttu');}
    /* 1.101 (Emil 31.10.2026): käyttötilassa avattu rivi on oma näkymänsä. Se, minkä avasit, on se, mitä teet: järjestys elää vain tässä
       (tärkein avoin ylimpänä), muualla ajastimesta tai ehdoista avautuvat odottavat paluuta (piste rivillä). Valmiin jälkeen palataan itse. */
    function focusView(){var w=el('div','kfoc');w.id='kfoc';w.dataset.row=r.id;var hd2=el('div','kfhd'),ln=LC?LC.name:'Lista';
      var bk=button(hd2,'','kfback',back);bk.id='kf-back';bk.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4L6.5 10l6 6"/></svg>';bk.appendChild(el('span','',ln));bk.setAttribute('aria-label','Takaisin: '+ln);
      var IT=[],ix=0;V.forEach(function(v){if(v.base||v.off)return;IT.push({v:v,ok:!!v.ok,rk:rk[v.id]===undefined?1e9:rk[v.id],i:ix++,nm:vName(v),sub:isRep(v)?'toistuva':''});});
      (PKS[r.id]||[]).forEach(function(x){var Nn=data.notes.filter(function(n){return n.id===x.nid;})[0];if(!Nn)return;var m=1e9;x.ids.forEach(function(id){if(rk[id]!==undefined&&rk[id]<m)m=rk[id];});
        var sb=x.st==='wait'&&x.next?'seuraava '+fiDate(x.next):x.key?occLabel(x.key):'';IT.push({x:x,N:Nn,ok:x.st==='done',wait:x.st==='wait',rk:m,i:ix++,nm:partTitle(Nn,noteParts(Nn.text).length>1?x.pi:undefined).slice(0,90)||'(teksti)',sub:sb});});
      var OP=IT.filter(function(t){return !t.ok&&!t.wait;}).sort(function(a,b){return a.rk-b.rk||a.i-b.i;}),WT=IT.filter(function(t){return t.wait;}),DN=IT.filter(function(t){return t.ok;});
      var tl=el('div','kftl');tl.appendChild(el('b','',r.name||(N?partTitle(N,r.pi):'')||'(nimetön)'));tl.appendChild(el('span','kfn',DN.length+'/'+IT.length));hd2.appendChild(tl);
      var br=el('div','kfbar'),bi=el('i');bi.style.width=(IT.length?Math.round(100*DN.length/IT.length):0)+'%';br.appendChild(bi);hd2.appendChild(br);w.appendChild(hd2);
      function rowB(t,first){var b=el('button','kfr'+(t.ok?' ok':'')+(first?' kf1':''));b.type='button';b.dataset.id=t.v?'v:'+t.v.id:'x:'+t.x.nid+'|'+t.x.pi;
        b.innerHTML='<span class="kfc"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.3 3.3L15.2 7"/></svg></span>';var s2=el('span','kft');s2.appendChild(el('span','',t.nm));if(t.sub)s2.appendChild(el('small','',t.sub));b.appendChild(s2);
        b.setAttribute('aria-pressed',t.ok?'true':'false');b.setAttribute('aria-label',(t.ok?'Kuitattu: ':first?'Tärkein, kuittaa: ':'Kuittaa: ')+t.nm);
        if(t.wait||(t.v&&LC&&LC.run&&LC.run.done))b.disabled=true;
        b.addEventListener('click',function(){if(t.v){hit(t.v);return;}var x=t.x,Nn=t.N,d=todayIso(),U=undoArm([Nn,data.reps]);if(txSet(Nn,x.pi,x.st!=='done',nowIso(),d)&&Nn.rep)repSignOff(data.reps,Nn,d);touch();render();undoAt=Date.now();undoShow(U,x.st!=='done'?'Kuitattu':'Kuittaus peruttu');});return b;}
      if(OP.length){var L1=el('div','kflist rows');L1.id='kflist';OP.forEach(function(t,i){L1.appendChild(rowB(t,i===0));});w.appendChild(L1);}
      else{var dn=el('div','kfdone');dn.id='kf-done';dn.appendChild(el('b','',WT.length?'Avoimet tehty':'Valmis'));button(dn,'Takaisin: '+ln,'btn solid',back).id='kf-done-back';w.appendChild(dn);}
      if(WT.length){var L2=el('div','kflist');WT.forEach(function(t){L2.appendChild(rowB(t,false));});w.appendChild(L2);}
      if(DN.length){var mb=button(w,ktDone?'Piilota tehdyt':'Tehty ('+DN.length+')','kfmore',function(){ktDone=!ktDone;render();});mb.id='kf-more';mb.setAttribute('aria-expanded',ktDone?'true':'false');
        if(ktDone){var L3=el('div','kflist');DN.forEach(function(t){L3.appendChild(rowB(t,false));});w.appendChild(L3);}}
      function back(){delete chkOpen[r.id];chkFreeze=null;chkGlow=r.id;chkPrev=ORD;ktDone=false;render();main.scrollTop=0;}
      return w;}
    if(open){var b=el('div','cbody'),pl=el('div','cpills'),inf=el('div','cinfo');
      /* Kohteet tiiviinä nappeina; kuvaus aukeaa vain pienestä ⓘ-napista (Emil 22.10.2026, 1.43) */
      V.forEach(function(v){var x=v.x,ok=v.ok,MN=v.mn?data.notes.filter(function(n){return n.id===v.mn;})[0]:null,nm=MN?partTitle(MN,v.mp).slice(0,48)||'(muistiinpano)':itemName(v.id),T=MN?null:termOf(v.id),w=el('span','cpw');
        var pb=el('button','cpill'+(v.base?' base':'')+(ok?' ok':'')+(v.z?' ctime':'')+(MN?' cmen':'')+((LC&&!ok&&RD)||v.off?' cno':'')+(!ok&&v.id===TOP?' ctop':''),'');pb.type='button';pb.disabled=!!(v.base||v.off||(LC&&!ok&&RD));pb.dataset.tid=v.id;pb.setAttribute('aria-pressed',ok?'true':'false');pb.setAttribute('aria-label',(ok?'Kuitattu: ':v.id===TOP?'Tärkein, kuittaa: ':'Kuittaa: ')+nm+(isRep(v)?', toistuva':''));
        if(isRep(v))pb.appendChild(repMark());if(MN)pb.appendChild(el('small','cmz',itemName(v.id)));pb.appendChild(document.createTextNode(nm));if(!ok&&PV[r.id+'|'+v.id])pb.appendChild(el('small','cvar','varattu '+PV[r.id+'|'+v.id]));
        if(T&&T.wflow&&!ok&&!v.base){pb.appendChild(el('small','cstate','avaa työnkulku'));pb.setAttribute('aria-label','Avaa työnkulku: '+nm);}if(LC&&LC.run&&LC.run.done)pb.disabled=true;
        if(v.base){pb.setAttribute('aria-label',nm+', perustila, odottaa ehtoa');pb.appendChild(el('small','cstate','odottaa ehtoa'));}pb.addEventListener('click',function(){hit(v);});w.appendChild(pb);
        /* Mainitun muistiinpanon linkki: vie Muistioon ja avaa sen */
        /* Linkki kohdenapin sisällä (Emil 23.10.2026, 1.52.1): oma napautusalue, ei kuittaa */
        if(MN){var lb=el('span','clink');lb.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13l6-6M8 7h5v5"/></svg>';lb.setAttribute('role','button');lb.tabIndex=0;lb.setAttribute('aria-label','Avaa muistiinpano: '+nm);
          var go=function(ev){ev.stopPropagation();ev.preventDefault();noteView='open';showTab('notes');render();openNote(MN);};lb.addEventListener('click',go);lb.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' ')go(ev);});pb.appendChild(lb);}
        var key=r.id+'|'+v.id;
        if(false&&T&&T.info){var ib=el('button','cib','i');ib.type='button';ib.setAttribute('aria-label','Kuvaus: '+nm);ib.setAttribute('aria-expanded',chkInfo[key]?'true':'false');
          ib.addEventListener('click',function(){if(chkInfo[key])delete chkInfo[key];else chkInfo[key]=1;render();});w.appendChild(ib);
          if(chkInfo[key]){var d=el('div','cdesc');d.appendChild(el('b','',nm));d.appendChild(document.createTextNode(' '+T.info));inf.appendChild(d);}}
        pl.appendChild(w);});
      /* Linkitetyt ryhmät mainintana nappien yläpuolella (1.46) */
      /* 1.78: ryhmä toteamuksena: nimi, sääntö (jokin/kaikki) ja onko toteutunut tällä listalla */
      (cx.gs||[]).forEach(function(s){var gn=grpName(s.id,ctxAT),g=(data.grp||[]).filter(function(x){return x.id===s.id;})[0];if(!gn)return;var cg=el('div','cgrp'+(s.ok?' gok':''));cg.dataset.gid=s.id;cg.appendChild(el('i','gi'));
        cg.appendChild(document.createTextNode(gn));cg.appendChild(el('small','',(g&&g.all?'kaikki':'jokin')+' · '+(s.ok?'toteutunut':'ei vielä')));b.appendChild(cg);});
      b.appendChild(pl);if(inf.childNodes.length)b.appendChild(inf);if(PK.length)b.appendChild(pickList(r,PK,today));
      /* Muokkaa tiiviisti nappien perään (Emil 22.10.2026, 1.45) */
      if(!r.mu&&!(LC&&LC.run)){var eb=button(pl,'Muokkaa','cedit',function(){openChk(r);});eb.setAttribute('aria-label','Muokkaa riviä');}
      /* Teksti suoraan näkyvissä ja muokattavissa (1.45): sama muistiinpano kuin Muistiossa; tyhjä ei tee muistiinpanoa */
      /* 1.91: tekstin rivillä vain sen teksti; muutos kirjoitetaan muistiinpanoon sen kohdalle */
      var PP=r.pi!==undefined&&N?sepParts(N.text):null,pp=PP&&PP[r.pi];
      var ta=el('textarea','cta');ta.value=pp?pp.t:N?N.text:'';ta.placeholder='Teksti';ta.setAttribute('aria-label','Rivin teksti');ta.rows=Math.min(8,Math.max(2,ta.value.split('\n').length+1));
      if(LC&&LC.run&&LC.run.done)ta.disabled=true;ta.addEventListener('change',function(){var v=ta.value;if(pp){var cur=sepParts(N.text),c2=cur&&cur[r.pi];if(c2&&c2.t===pp.t)v=N.text.slice(0,c2.s)+v.replace(/^\s+|\s+$/g,'')+N.text.slice(c2.e);else v=N.text;}chkSetText(r,v);render();});b.appendChild(ta);c.appendChild(b);}
    list.appendChild(c);});
  termCache=null;ctxAT=null;
  if(!ROWS.length&&!MU.length)p.appendChild(kt()?el('p','sub','Ei rivejä.'):subI('Ei vielä rivejä.','+ oikeassa alakulmassa lisää rivin.'));
  /* 1.79: ehtojen tuomat tekstit listan ilmoituksina (Lopeta tallentaa ne muistiinpanoon) */
  var KS=condOf(LC?LC.id:null,today);if(KS&&KS.say&&!FOC){var sy=el('div','chsay');sy.id='chk-say';KS.say.forEach(function(t){sy.appendChild(el('p','',t));});p.appendChild(sy);}
  p.appendChild(list);
  if(hidN&&!FOC){var hn2=el('p','sub',hidN+(hidN===1?' rivi odottaa':' riviä odottaa')+' ehtoja (Vain kuitattavat).');hn2.id='chk-hid';p.appendChild(hn2);}}
/* 1.99: rivin poimimat tekstit avatulla rivillä tärkeysjärjestyksessä. Ympyrä kuittaa tekstin (sama kuin Muistiossa ja kalenterissa),
   tekstin napautus avaa sen muokattavaksi tähän (muutos kirjoittuu muistiinpanoon sen kohdalle), nuoli avaa muistiinpanon. */
var pickEd={};
function pickList(r,PK,today){var box=el('div','ctexts');box.dataset.row=r.id;
  PK.forEach(function(x){var N=data.notes.filter(function(n){return n.id===x.nid;})[0];if(!N)return;var P=noteParts(N.text),q=P[x.pi];if(!q)return;var key=r.id+'|'+x.nid+'|'+x.pi;
    var d=el('div','ctx'+(x.st==='done'?' ok':'')+(x.st==='wait'?' wait':''));d.dataset.nid=x.nid;d.dataset.pi=x.pi;
    var ck=el('button','ncheck');ck.type='button';ck.setAttribute('aria-pressed',x.st==='done'?'true':'false');ck.disabled=x.st==='wait';ck.setAttribute('aria-label',x.st==='done'?'Kuitattu, napauta palauttaaksesi':x.st==='wait'?'Ei vielä kuitattavissa':'Kuittaa teksti');
    ck.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.3 3.3L15.2 7"/></svg>';
    ck.addEventListener('click',function(){var t=todayIso(),U=undoArm([N,data.reps]);if(txSet(N,x.pi,x.st!=='done',nowIso(),t)&&N.rep)repSignOff(data.reps,N,t);touch();render();undoAt=Date.now();undoShow(U,x.st!=='done'?'Kuitattu':'Kuittaus peruttu');});d.appendChild(ck);
    var w=el('div','cxw');
    if(pickEd[key]){var ta=el('textarea','cta');ta.value=q.t;ta.rows=Math.min(8,Math.max(2,q.t.split('\n').length+1));ta.setAttribute('aria-label','Tekstin muokkaus');
      var qt=q.t;ta.addEventListener('change',function(){var cur=noteParts(N.text)[x.pi];if(!cur||cur.t!==qt){render();return;}var v=ta.value.replace(/^\s+|\s+$/g,''),nt=P.length>1?N.text.slice(0,cur.s)+v+N.text.slice(cur.e):v;
        if(!clean(nt)){render();return;}if(nt===N.text)return;noteWrite(N,nt,nowIso());qt=v;touch();});
      /* Poistuminen vaihtaa kentän takaisin tekstiksi paikallaan ja hetken viiveellä (ei koko listan piirtoa eikä siirtymää kesken napautuksen, joten samalla napautettu nuoli tai ympyrä toimii) */
      ta.addEventListener('blur',function(){delete pickEd[key];setTimeout(function(){var c2=noteParts(N.text)[x.pi];if(ta.parentNode)ta.parentNode.replaceChild(txBtn(c2?c2.t:q.t),ta);},350);});w.appendChild(ta);setTimeout(function(){try{ta.focus({preventScroll:true});}catch(e){}},0);}
    else w.appendChild(txBtn(q.t));
    function txBtn(t){var tb=el('button','cxt');tb.type='button';tb.textContent=t;tb.setAttribute('aria-label','Muokkaa tekstiä');tb.addEventListener('click',function(){pickEd={};pickEd[key]=1;render();});return tb;}
    var mt=x.st==='wait'&&x.next?'seuraava '+fiDate(x.next):x.st==='done'?'kuitattu tänään':x.key?occLabel(x.key):'',nm=x.ids.map(termName).filter(Boolean).join(', ');mt=mt&&nm?mt+' · '+nm:mt||nm;if(mt)w.appendChild(el('small','cxm',mt));d.appendChild(w);
    var lb=el('button','clink');lb.type='button';lb.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13l6-6M8 7h5v5"/></svg>';lb.setAttribute('aria-label','Avaa muistiinpano');
    lb.addEventListener('click',function(){noteView='open';showTab('notes');render();openNote(N);});d.appendChild(lb);box.appendChild(d);});
  return box;}
/* Aikaehdotukset (Emil 23.10.2026, 1.49): ⏱ listan yläreunassa. Vapaat välit päivän kalenterista viikonpäivän aikavälin sisällä;
   tänään vasta nykyhetkestä. Jo kalenteriin viety kohde (muistiinpano, jossa pl) ei saa uutta ehdotusta samalle päivälle. */
function planOn(){return data.cfg.plan==='on';}
function planNow(now,today,CX,rk){var used={},nm=now.getHours()*60+now.getMinutes();
  data.notes.forEach(function(n){if(n.pl&&n.date)used[n.pl.r+'|'+n.pl.i+'|'+n.date]=1;});
  var days=[];function day(i){if(days[i])return days[i];var iso=isoD(addDays(fromIso(today),i)),E=dayEntries(calNotes(),iso,durMin());
    var V=data.calv,wd=fromIso(iso).getDay(),W=winOf(data.win,wd);if(V){W={s:Math.max(W.s,V.s),e:Math.min(W.e,V.e)};if(V.off.indexOf(wd)>=0||W.e<=W.s)W={s:0,e:0};}
    return days[i]={iso:iso,win:W,from:i?0:Math.ceil(nm/5)*5,busy:E.timed.map(function(x){return [x.s,x.e];})};}
  var anyUsed=function(r,v){for(var i=0;i<14;i++)if(used[r.id+'|'+v.id+'|'+isoD(addDays(fromIso(today),i))])return true;return false;};
  return chkPlan(data.chk.filter(function(r){return !r.l;}),rk,now,function(r){return CX[r.id];},{n:14,day:day,dur:function(id){return durOf(termOf(id),0);},skip:anyUsed});}
function planDay(iso,today){var d=fromIso(iso),dd=Math.round((d-fromIso(today))/864e5);return dd===0?'Tänään':dd===1?'Huomenna':WD[d.getDay()].charAt(0).toUpperCase()+WD[d.getDay()].slice(1)+' '+d.getDate()+'.'+(d.getMonth()+1)+'.';}
function renderPlan(p,PL,today){var w=el('div','plan');w.id='chplan';
  /* Ei laatikkoa, kun ehdotettavaa ei ole (Emil 23.10.2026: "Kaikki kuitattu" johti harhaan) */
  if(PL.dry||(!PL.list.length&&!PL.miss))return;
  var last=null;PL.list.forEach(function(it){if(it.d!==last){last=it.d;w.appendChild(el('h3','pld',planDay(it.d,today)));}
    var row=el('div','plrow');row.dataset.k=it.k;row.appendChild(el('span','plt',fmtTime(fromMin(it.s))+'–'+fmtTime(fromMin(it.e))));
    var nm=el('span','pln',itemName(it.v.id));if(it.r.name)nm.appendChild(el('small','',it.r.name));row.appendChild(nm);
    var b=button(row,'+ Kalenteriin','mini',function(){planAdd(it);});b.setAttribute('aria-label','Kalenteriin: '+itemName(it.v.id)+' '+planDay(it.d,today)+' klo '+fmtTime(fromMin(it.s)));w.appendChild(row);});
  if(PL.miss)w.appendChild(el('p','sub',PL.miss+' ei mahdu kahden viikon aikaväleihin.'));p.appendChild(w);}
/* Ehdotus kalenteriin: tavallinen muistiinpano päivällä ja ajalla (kaikki kalenterimerkinnät ovat muistiinpanoja) */
function planAdd(it){var t=nowIso(),N={id:uid('n'),created:t,edited:t,text:'Tarkistuslistasta: '+(it.r.name||'lista')+' – '+itemName(it.v.id),date:it.d,time:{s:fromMin(it.s),e:fromMin(it.e)},pl:{r:it.r.id,i:it.v.id}};
  data.notes.unshift(N);touch();render();}
/* Aikavälin viiva kalenterin kellonaikasarakkeessa (1.49), näkyy vain kun aikaehdotukset ovat päällä. Päiden raahaus 15 min askelin;
   muutos koskee kaikkia saman viikonpäivän päiviä. */
function winBar(area,day){var wd=fromIso(day).getDay(),w=winOf(data.win,wd),bar=el('div','winbar'),lb=el('b','');bar.id='winbar';bar.appendChild(lb);
  function pos(){var a=Math.max(w.s,CVs),z=Math.max(a,Math.min(w.e,CVe));bar.style.top=yOf(a)+'px';bar.style.height=((z-a)/60*HOURPX)+'px';lb.textContent=fmtTime(fromMin(w.s))+'–'+fmtTime(fromMin(w.e));}
  ['s','e'].forEach(function(end){var h=el('span','winh '+end);h.dataset.end=end;h.setAttribute('aria-label',end==='s'?'Aikavälin alku':'Aikavälin loppu');bar.appendChild(h);
    h.addEventListener('touchstart',function(e){e.stopPropagation();},{passive:true});
    h.addEventListener('pointerdown',function(ev){ev.preventDefault();ev.stopPropagation();try{h.setPointerCapture(ev.pointerId);}catch(e){}var y0=ev.clientY,m0=w[end];bar.classList.add('drag');
      function mv(e){e.stopPropagation();var m=Math.round((m0+(e.clientY-y0)/HOURPX*60)/STEP)*STEP;if(end==='s')m=Math.max(0,Math.min(w.e-STEP,m));else m=Math.min(1440,Math.max(w.s+STEP,m));w[end]=m;pos();}
      function up(e){e.stopPropagation();h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);
        if(!data.win)data.win={};data.win[String(wd)]={s:w.s,e:w.e};touch();render();}
      h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);});});
  pos();area.appendChild(bar);}
/* Rivin teksti muistiinpanoon: ei-tyhjä luo tai päivittää, tyhjennys vie roskakoriin (sama sääntö kuin ikkunassa) */
function chkSetText(r,tx){if(typeof r.runtext==='string'){r.runtext=String(tx||'').replace(/\s+$/,'');r.edited=nowIso();touch();return;}tx=String(tx||'').replace(/\s+$/,'');var N=noteOf(r),t=nowIso();
  if(clean(tx)){if(!N){N={id:uid('n'),created:t,edited:t,text:tx,date:''};data.notes.unshift(N);r.nid=N.id;noteWrite(N,tx,t);touch();}
    else if(N.text!==tx){noteWrite(N,tx,t);touch();}}
  else if(N){toTrash(N);delete r.nid;touch();}}
var chkCur=null,chkIt=[],chkAny=false,chkOcc=null,chkMen=false,chkStar=true,chkGrp=[],chkPx={},chkPxMode=false;
var chkPhaseMode=false,chkPhaseId=null,chkPhaseBank=false,phaseBankPick=false,phaseOpen={};
function openChk(r,phaseId,bank,skipPick){
  if(!r&&!phaseId&&curList()&&curList().run){toast('Muokkaa työnkulkupohjan vaiheita alkuperäisessä listassa.');return;}
  if(!r&&!phaseId&&!bank&&!skipPick&&curList()&&curList().wf){openPhaseBank(true);return;}
  chkPhaseId=phaseId||(r&&r.sg)||null;chkPhaseBank=!!bank;var pg=phaseOf(data,chkPhaseId);chkPhaseMode=!!pg||!!bank||!!(curList()&&curList().wf&&!r)||!!(r&&workflowOf(r.l));
  chkCur=r;chkOcc=null;chkGrp=r&&r.g?r.g.slice():[];chkStar=true;$('ks-star').setAttribute('aria-pressed','true');$('ks-star').innerHTML=starSvg(true);chkMen=!!(r&&r.men);chkPx=r&&r.px?{n:r.px.n?1:0,t:(r.px.t||[]).slice()}:{n:0,t:[]};chkPxMode=false;chkGEd=false;chkGA=null;chkIt=r?(r.it||[]).map(function(x){var y={id:x.id};['ok','ev','at','t','g'].forEach(function(k){if(x[k])y[k]=x[k];});return y;}):[];chkAny=!!(r&&r.any);var KL=r?!!(r.l&&!ajOf(r.l)):!jatL(curList());chkEi=r&&r.ei?r.ei.slice():[];$('ks-anyl').textContent=KL?'Rivi valmis, kun':'Tarkistettavaa, kun';$('ks-any').children[0].textContent=KL?'Kaikki kuitattu':'Yksikin kuittaamatta';$('ks-any').children[1].textContent=KL?'Yksi kuitattu':'Kaikki kuittaamatta';
  var N=noteOf(r);$('ks-name').value=r?r.name:'';$('ks-text').value=N?N.text:'';$('ks-find').value='';$('ks-msg').textContent='';$('ks-del').hidden=!r;delReset($('ksheet'));
  var dl=$('ks-names');dl.textContent='';allTerms().forEach(function(t){var o=el('option');o.value=t.name;dl.appendChild(o);});termCache=null;
  if(chkPhaseMode){chkGrp=[];chkMen=false;chkAny=pg?!pg.all:!!(r&&r.any);chkIt=(pg?pg.m:[]).map(function(id){return {id:id};});if(pg)$('ks-name').value=pg.name;$('ks-anyl').textContent='Vaihe valmis, kun';$('ks-any').children[0].textContent='Kaikki aktiiviset kuitattu';$('ks-any').children[1].textContent='Yksi kuitattu';}
  $('ks-text').hidden=chkPhaseBank;document.querySelector('label[for="ks-text"]').hidden=chkPhaseBank;$('ks-found').hidden=chkPhaseBank;
  var sh=$('ks-shared');sh.textContent='';if(chkPhaseMode){var uses=phaseUses(chkPhaseId);sh.appendChild(el('p','sub',pg?'Yhteinen vaihe · käytössä '+uses.length+' listassa'+(uses.length?': '+uses.join(', '):'')+'. Muutos päivittyy kaikkiin esiintymiin, myös keskeneräisiin.':'Uusi vaihe tallentuu projektin vaihepankkiin.'));
    if(pg&&r)button(sh,'Tee oma versio','mini',function(){var pending=$('ks-text').value,ng={id:uid('g'),name:(clean($('ks-name').value)||pg.name)+' (oma)',m:chkIt.filter(function(x){return !isSpec(x.id);}).map(function(x){return x.id;}),phase:1};if(!chkAny)ng.all=1;if(pg.aliases)ng.aliases=pg.aliases.slice();data.grp.push(ng);r.sg=ng.id;phaseEnsure(data);touch();openChk(r);$('ks-text').value=pending;}).id='ks-phase-copy';}
  $('ks-h').textContent=chkPhaseMode?'Yhteinen vaihe':'Tarkistuslista';document.querySelector('#ksheet [data-help]').dataset.help=chkPhaseMode?'vaiheet':'lista';chkForm();openSheet($('ksheet'));}
/* Ryhmät (Emil 22.10.2026, 1.42): ryhmä on pikavalinta. Napautus lisää kaikki jäsenet riville yksittäisiksi kohteiksi (tai poistaa, jos kaikki ovat jo mukana);
   ryhmä ei itse näy rivillä, ja jokaisen kohteen asetukset ovat omansa. Puun ryhmien jäsenet tulevat puusta, listan ryhmät tehdään täällä:
   Ryhmät… → napauta ryhmää (aktiivinen) → napauta jäseniä → napauta ryhmää uudelleen (lukittuu). */
var chkGEd=false,chkGA=null,chkEi=[];
function chkLid(){return chkCur?(chkCur.l||null):(curList()?curList().id:null);}
function chkTk(){if(chkPhaseMode)return null;var lid=chkLid(),L=listById(lid);if(lid&&(!L||!tkOk(L)))return null;var C=condCfg(lid);return C&&Array.isArray(C.tk)?C.tk:null;}
function treeGroupMembers(t,AT){var out=[],seen={};(data.projects||[]).forEach(function(P){var pt=parseText(P.text),g=pt.by[t.key];if(!g||g.k!=='g')return;
    (function walk(k){if(seen[k])return;seen[k]=1;opensOf(P,pt.items,k).forEach(function(x){var it=pt.by[x];if(!it)return;if(it.k==='g'){walk(x);return;}
      var m=AT.filter(function(y){return (y.key||keyOf(y.name))===x;})[0];if(m&&out.indexOf(m.id)<0)out.push(m.id);});})(t.key);});return out;}
function chkGroups(AT){var L=[];(data.grp||[]).filter(function(g){return !g.phase;}).forEach(function(g){L.push({id:g.id,name:g.name,own:g,m:g.m.filter(function(id){return isSpec(id)||AT.some(function(t){return t.id===id;});})});});
  AT.forEach(function(t){if(t.auto&&t.kind==='g'){var m=treeGroupMembers(t,AT);if(m.length&&!L.some(function(x){return keyOf(x.name)===keyOf(t.name);}))L.push({id:t.id,name:t.name,m:m});}});return L;}
function chkGroupRow(AT){var box=$('ks-g');box.textContent='';box.hidden=chkPhaseMode||!OLDUI;if(chkPhaseMode||!OLDUI){$('ks-gmsg').hidden=true;return;}var G=chkGroups(AT),act=chkGA&&(data.grp||[]).filter(function(g){return g.id===chkGA;})[0];if(!act)chkGA=null;
  /* Ryhmä on rivillä elävä linkki (Emil 22.10.2026, 1.46): napautus liittää tai irrottaa; jäsenmuutokset näkyvät kaikilla riveillä, joilla ryhmä on */
  G.forEach(function(g){if(chkGEd&&!g.own)return;var all=chkGrp.indexOf(g.id)>=0;
    var b=button(box,g.name+(chkGEd?'':' ('+g.m.length+')'),'chip kgrp',function(){
      if(chkGEd){chkGA=chkGA===g.id?null:g.id;chkForm();return;}
      if(all)chkGrp=chkGrp.filter(function(x){return x!==g.id;});else chkGrp=chkGrp.concat([g.id]);chkForm();});
    b.dataset.gid=g.id;b.setAttribute('aria-pressed',(chkGEd?chkGA===g.id:all)?'true':'false');});
  var eb=button(box,chkGEd?'Ryhmät valmis':'Ryhmät…','chip gedit',function(){chkGEd=!chkGEd;chkGA=null;chkForm();});eb.id='ks-gedit';
  if(chkGEd&&chkGA)button(box,'Poista ryhmä','chip gedit',function(){var g=act;delAsk(this,'Poistetaanko ryhmä '+g.name+'?','Ryhmä poistuu. Riveille jo lisätyt kohteet jäävät.',function(){data.grp=data.grp.filter(function(x){return x!==g;});chkGA=null;touch();chkForm();});}).id='ks-gdel';
  var gm=$('ks-gmsg');gm.hidden=!chkGEd;gm.textContent=act?'Ryhmän '+act.name+' jäsenet: napauta asiasanoja, lopuksi ryhmää.':'Napauta ryhmää muokataksesi sen jäseniä.';}
/* Luo (Emil 22.10.2026): #Nimi tekee ryhmän ja avaa sen jäsenten valinnan, muu teksti uuden asiasanan, joka tulee riville kohteeksi */
$('ks-new').addEventListener('click',function(){var v=clean($('ks-find').value);if(!v)return;$('ks-find').value='';
  if((chkPhaseMode||!OLDUI)&&v.charAt(0)==='#'){v=clean(v.slice(1));}
  if(v.charAt(0)==='#'){var nm=clean(v.slice(1)).slice(0,80);if(!nm){chkForm();return;}var g=(data.grp||[]).filter(function(x){return !x.phase&&keyOf(x.name)===keyOf(nm);})[0];
    if(!g){g={id:uid('g'),name:nm,m:[]};data.grp=(data.grp||[]).concat([g]);touch();}chkGEd=true;chkGA=g.id;chkForm();return;}
  var sn=starName(v);v=sn.name;if(!v){chkForm();return;}var t=allTerms().filter(function(x){return keyOf(x.name)===keyOf(v);})[0];termCache=null;if(!t){t={id:uid('t'),name:v.slice(0,60),yes:[],no:[]};data.terms.push(t);if(chkStar||sn.imp)syncImp(t.id,true);touch();}else if(sn.imp){syncImp(t.id,true);touch();}
  var GA=chkGA&&(data.grp||[]).filter(function(g){return g.id===chkGA;})[0];
  if(GA){if(GA.m.indexOf(t.id)<0)GA.m=GA.m.concat([t.id]);touch();}else if(chkTk()){tkSet(chkLid(),t.id,true);chkEi=chkEi.filter(function(x){return x!==t.id;});}else if(!chkIt.some(function(y){return y.id===t.id&&!y.t;})){chkIt=chkIt.filter(function(y){return y.id!==t.id;});chkIt.push({id:t.id,at:nowIso()});}chkForm();});
/* Nimen lopun * merkitsee uuden asiasanan tärkeäksi (Emil 22.10.2026, 1.45); tähti ei jää nimeen */
function starName(n){n=clean(n);var m=/\s*\*+$/.test(n);return {name:m?clean(n.replace(/\s*\*+$/,'')):n,imp:m};}
/* Tähti (1.45): Luo-napilla tehty uusi asiasana tulee oletuksena tärkeäksi (tärkeiden loppuun) */
$('ks-star').addEventListener('click',function(){chkStar=!chkStar;this.setAttribute('aria-pressed',chkStar?'true':'false');this.innerHTML=starSvg(chkStar);});
$('ks-find').addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();$('ks-new').click();}});
function chkForm(){var box=$('ks-f'),q=clean($('ks-find').value||'').toLowerCase();box.textContent='';press('ks-any','ka',chkAny?'1':'0');
  var AT=allTerms(),GA=chkGA&&(data.grp||[]).filter(function(g){return g.id===chkGA;})[0];chkGroupRow(AT);GA=chkGA?GA:null;
  /* 1.99 (Emil 29.10.2026): Poimii tekstit on oma valintansa (aikaan perustuvan listan riveillä): rivin nimi ja asiasanat, joiden tekstit tulevat riville */
  var pxOk=!chkPhaseMode&&jatL(chkCur?listById(chkCur.l):curList());$('ks-mode').hidden=!pxOk;$('ks-fl').hidden=pxOk;if(!pxOk)chkPxMode=false;press('ks-mode','km',chkPxMode?'1':'0');
  var ps=$('ks-pxsum'),pn=(chkPx.n?['rivin nimi']:[]).concat((chkPx.t||[]).map(termName).filter(Boolean));ps.hidden=!pxOk||!pn.length;ps.textContent='Poimii tekstit: '+pn.join(', ');
  if(chkPxMode){$('ks-g').hidden=true;$('ks-gmsg').hidden=true;var nb=button(box,'Rivin nimi','chip kmen',function(){chkPx.n=chkPx.n?0:1;chkForm();});nb.id='ks-pxn';nb.setAttribute('aria-pressed',chkPx.n?'true':'false');
    orderedTerms().forEach(function(t){if(t.time||(t.auto&&t.kind==='g')||(q&&t.name.toLowerCase().indexOf(q)<0))return;var on=(chkPx.t||[]).indexOf(t.id)>=0;
      var b=button(box,t.name,'chip',function(){chkPx.t=on?chkPx.t.filter(function(x){return x!==t.id;}):(chkPx.t||[]).concat([t.id]);chkForm();});b.dataset.px=t.id;b.setAttribute('aria-pressed',on?'true':'false');});}
  else{
  /* Erikoiskohde Mainittu (1.44) */
  /* Erikoiskohteet (1.44, 1.51): Mainittu ja aikasanat. Aikasanat laukeavat tekstistä ilman valintaa; valinta rajaa laukeamisen valittuihin.
     Aktiivisessa ryhmässä napautus liittää jäseneksi tai irrottaa. */
  (chkPhaseMode||chkTk()?[]:SPEC).forEach(function(x){if(q&&q.charAt(0)!=='#'&&x.name.toLowerCase().indexOf(q)<0)return;var men=x.id==='m:men',on=GA?GA.m.indexOf(x.id)>=0:men?chkMen:chkIt.some(function(y){return y.id===x.id;});
    var b=button(box,x.name,'chip kmen',function(){if(GA){GA.m=on?GA.m.filter(function(z){return z!==x.id;}):GA.m.concat([x.id]);touch();}
      else if(men)chkMen=!chkMen;else if(on)chkIt=chkIt.filter(function(y){return y.id!==x.id;});else chkIt.push({id:x.id,at:nowIso()});chkForm();});
    if(men&&!GA)b.id='ks-men';b.dataset.tid=x.id;b.setAttribute('aria-pressed',on?'true':'false');});
  orderedTerms().forEach(function(t){if(t.time||(q&&q.charAt(0)!=='#'&&t.name.toLowerCase().indexOf(q)<0))return;
    /* Ryhmä ei ole kohde: puun ryhmät ovat ryhmärivillä. Aktiivinen ryhmä: napautus liittää jäseneksi tai irrottaa (tallentuu heti) */
    if(t.auto&&t.kind==='g')return;
    if(GA){var mem=GA.m.indexOf(t.id)>=0,gb=button(box,t.name,'chip',function(){if(mem)GA.m=GA.m.filter(function(x){return x!==t.id;});else GA.m=GA.m.concat([t.id]);touch();chkForm();});
      gb.dataset.tid=t.id;gb.setAttribute('aria-pressed',mem?'true':'false');return;}
    var TKL=chkTk();if(TKL){var inT=TKL.indexOf(t.id)>=0,onT=inT&&chkEi.indexOf(t.id)<0;
      var tb2=button(box,t.name,'chip',function(){if(onT)chkEi.push(t.id);else{chkEi=chkEi.filter(function(x){return x!==t.id;});if(!inT)tkSet(chkLid(),t.id,true);}chkForm();});tb2.dataset.tid=t.id;tb2.setAttribute('aria-pressed',onT?'true':'false');return;}
    var on=chkIt.some(function(y){return y.id===t.id&&!y.t&&!y.g;});
    var b=button(box,t.name,'chip',function(){var y=chkIt.filter(function(y){return y.id===t.id;})[0];if(on)chkIt=chkIt.filter(function(z){return z!==y;});else if(y){delete y.t;delete y.g;}else chkIt.push({id:t.id,at:nowIso()});chkForm();});b.dataset.tid=t.id;b.setAttribute('aria-pressed',on?'true':'false');});}
  var N0=noteOf(chkCur),N={text:$('ks-text').value,created:N0?N0.created:nowIso()},ds=noteDates(N),f=$('ks-found'),tt=clean(N.text)&&tunOn()?noteTerms(allTerms(),N.text):[];f.textContent='';termCache=null;
  if(ds.length){f.appendChild(document.createTextNode('Kalenteriin: '));ds.forEach(function(o){var hi=hidNote(o);f.appendChild(el('i',hi?'hd':'',o.src+' → '+dateLabel(o)+(hi?' · '+hidTxt(o.a):'')));});}
  if(tt.length){if(ds.length)f.appendChild(el('br'));f.appendChild(document.createTextNode('Tekstistä: '));tt.forEach(function(id){f.appendChild(el('i','',termName(id)));});}
  if(clean(N.text)){if(f.childNodes.length)f.appendChild(el('br'));f.appendChild(el('span','sub',N0?'Teksti on myös muistiinpano Muistiossa.':'Tekstistä tulee myös muistiinpano Muistioon.'));}
  if(N0&&N0.mv)mvSpans(N0).forEach(function(m){f.appendChild(el('br'));f.appendChild(document.createTextNode('Muutettu kalenterissa: '+mvLines(m.m).join('; ')));});
  $('ks-occrow').hidden=true;}
Array.prototype.forEach.call($('ks-any').children,function(b){b.addEventListener('click',function(){chkAny=b.dataset.ka==='1';chkForm();});});
Array.prototype.forEach.call($('ks-mode').children,function(b){b.addEventListener('click',function(){chkPxMode=b.dataset.km==='1';chkForm();});});
$('ks-text').addEventListener('input',chkForm);$('ks-find').addEventListener('input',chkForm);
$('ks-ok').addEventListener('click',function(){if(chkPhaseMode){savePhaseForm();return;}var nm=clean($('ks-name').value).slice(0,120),tx=$('ks-text').value.replace(/\s+$/,''),N=noteOf(chkCur);
  var PX=chkPx&&(chkPx.n||(chkPx.t||[]).length)?(function(){var o={};if(chkPx.n)o.n=1;if((chkPx.t||[]).length)o.t=chkPx.t.slice();return o;})():null;
  if(!nm&&!clean(tx)&&!chkIt.length&&!chkMen&&!chkGrp.length&&!PX&&!(chkTk()&&chkTk().length)){if(chkCur){data.chk=data.chk.filter(function(x){return x!==chkCur;});touch();}closeSheet($('ksheet'));render();return;}
  var t=nowIso(),r=chkCur;if(!r){r={id:uid('c'),created:t};var L0=curList();if(L0)r.l=L0.id;data.chk.push(r);chkOpen[r.id]=1;}
  /* Muistiinpano on juuri (1.41): ei-tyhjä teksti on oikea muistiinpano; tyhjennetty teksti vie muistiinpanon roskakoriin */
  chkSetText(r,tx);
  if(r.name!==nm||JSON.stringify(r.it||[])!==JSON.stringify(chkIt)||!!r.any!==chkAny||!!r.men!==chkMen||JSON.stringify(r.g||[])!==JSON.stringify(chkGrp)||JSON.stringify(r.px||null)!==JSON.stringify(PX)||JSON.stringify(r.ei||[])!==JSON.stringify(chkTk()?chkEi:(r.ei||[]))){if(PX)r.px=PX;else delete r.px;if(chkTk()){if(chkEi.length)r.ei=chkEi.slice();else delete r.ei;}r.name=nm;r.it=chkIt;if(chkGrp.length)r.g=chkGrp.slice();else delete r.g;delete r.f;delete r.text;if(chkAny)r.any=1;else delete r.any;if(chkMen)r.men=1;else delete r.men;r.edited=t;touch();}closeSheet($('ksheet'));render();});
$('ks-del').addEventListener('click',function(){if(!chkCur)return;delAsk($('ks-del'),'Poistetaanko rivi?','Rivi kohteineen poistuu listalta. Sen teksti jää muistiinpanoksi Muistioon kalenterimerkintöineen.',function(){data.chk=data.chk.filter(function(x){return x!==chkCur;});closeSheet($('ksheet'));touch();render();});});
/* ---- toistuvat ---- */
function renderReps(p){
  var list=el('div','nlist');list.id='replist';var today=todayIso(),AT=allTerms();termCache=null;
  data.reps.forEach(function(R){var c=el('div','ncard auto');c.setAttribute('role','button');c.tabIndex=0;c.dataset.id=R.id;c.appendChild(el('div','nt',R.text||'(tyhjä)'));
    var trig=R.mode==='trig',open=data.notes.some(function(n){return n.rep===R.id&&!n.done;}),nx=trig?trigNext(R,data.notes,AT):repNext(R),f=el('div','nf');
    f.appendChild(el('b','rtag',trig?trigLabel(R)+': '+trigNames(R,AT):repLabel(R)));
    f.appendChild(el('span','',open?'Avoinna nyt':nx?(trig?'Tulee aikaisintaan ':'Seuraava ')+fromIsoW(nx>today?nx:today):'Seuraava, kun edellinen kuitataan'));c.appendChild(f);
    c.addEventListener('click',function(){openRep(R);});list.appendChild(c);});
  if(!data.reps.length)p.appendChild(subI('Ei vielä automaattisia.','Paina + Uusi.'));p.appendChild(list);}
function trigNames(R,AT){var nm={};AT.forEach(function(t){nm[t.id]=t.name;});
  return (R.terms||[]).map(function(id){return nm[id]||'(poistunut asiasana)';}).join(R.all?' ja ':' tai ')||'(ei asiasanoja)';}
var repCur=null,repArm=0,REP_INT=[['1d','Joka päivä'],['2d','2 päivän välein'],['3d','3 päivän välein'],['1w','Joka viikko'],['2w','2 viikon välein'],['3w','3 viikon välein'],['4w','4 viikon välein'],['1m','Joka kuukausi'],['2m','2 kuukauden välein'],['3m','3 kuukauden välein'],['6m','6 kuukauden välein'],['1y','Joka vuosi'],['own','Oma väli…']];
(function(){var sel=$('rs-int');REP_INT.forEach(function(o){var x=document.createElement('option');x.value=o[0];x.textContent=o[1];sel.appendChild(x);});})();
function pressed(id,key){var b=$(id).querySelector('[aria-pressed="true"]');return b?b.dataset[key]:'';}
function press(id,key,v){Array.prototype.forEach.call($(id).children,function(b){b.setAttribute('aria-pressed',b.dataset[key]===v?'true':'false');});}
function repMode(){return pressed('rs-kind','rk')==='trig'?'trig':pressed('rs-mode','rm');}
function repForm(){var own=$('rs-int').value==='own',mode=repMode(),after=mode==='after',trig=mode==='trig';$('rs-own').hidden=!own;
  $('rs-trig').hidden=!trig;$('rs-repw').hidden=trig;$('rs-h').textContent=trig?'Muistutus, jos ei tapahdu':'Toistuva muistutus';
  $('rs-intl').textContent=trig?'Jos ei ole tapahtunut':'Väli';
  Array.prototype.forEach.call($('rs-int').options,function(o){var m=REP_INT.filter(function(x){return x[0]===o.value;})[0];if(o.value==='own')return;var n=o.value.slice(0,-1),u=o.value.slice(-1);
    o.textContent=trig?n+' '+TRIG_UNITS[u]:after?n+' '+REP_UNITS[u][+n>1?1:0]+' kuittauksesta':m[1];});
  $('rs-startl').textContent=trig?'Seuranta alkaa':after?'Ensimmäinen kerta':'Aloituspäivä (ensimmäinen kerta)';if(trig)renderTrigTerms();}
var repSel=[];
function renderTrigTerms(){var c=$('rs-terms'),q=normT($('rs-tfind').value).trim(),AT=allTerms();termCache=null;c.textContent='';var ids={};
  AT.forEach(function(t){ids[t.id]=1;if(q&&normT(t.name).trim().indexOf(q)<0&&repSel.indexOf(t.id)<0)return;
    var b=button(c,t.name,'chip',function(){var i=repSel.indexOf(t.id);if(i<0)repSel.push(t.id);else repSel.splice(i,1);b.setAttribute('aria-pressed',i<0?'true':'false');$('rs-msg').textContent='';});
    b.dataset.tid=t.id;b.setAttribute('aria-pressed',repSel.indexOf(t.id)>=0?'true':'false');});
  repSel.forEach(function(id){if(ids[id])return;var b=button(c,'(poistunut asiasana)','chip',function(){repSel=repSel.filter(function(x){return x!==id;});renderTrigTerms();});b.setAttribute('aria-pressed','true');});
  if(!AT.length)c.appendChild(subI('Ei vielä asiasanoja.','Ne tulevat puista ja Asiasanat-ikkunasta.'));}
$('rs-tfind').addEventListener('input',renderTrigTerms);
function openRep(R){repCur=R;repArm=0;$('rs-msg').textContent='';$('rs-text').value=R?R.text:'';var v=R?R.n+R.unit:'1w';
  $('rs-int').value=REP_INT.some(function(x){return x[0]===v;})?v:'own';$('rs-n').value=R?R.n:2;$('rs-unit').value=R?R.unit:'d';$('rs-start').value=R?R.start:todayIso();
  var trig=!!R&&R.mode==='trig';press('rs-kind','rk',trig?'trig':'rep');press('rs-mode','rm',R&&R.mode==='after'?'after':'every');press('rs-all','ra',R&&R.all?'1':'0');
  repSel=trig?(R.terms||[]).slice():[];$('rs-tfind').value='';
  $('rs-del').hidden=!R;delReset($('rsheet'));repForm();openSheet($('rsheet'));}
[['rs-mode','rm'],['rs-kind','rk'],['rs-all','ra']].forEach(function(g){Array.prototype.forEach.call($(g[0]).children,function(b){b.addEventListener('click',function(){press(g[0],g[1],b.dataset[g[1]]);repForm();});});});
$('rs-int').addEventListener('change',repForm);
$('rs-ok').addEventListener('click',function(){var t=$('rs-text').value.replace(/\s+$/,''),iv=$('rs-int').value,n,u;
  if(iv==='own'){n=Math.max(1,Math.min(999,Math.round(+$('rs-n').value)||1));u=$('rs-unit').value;}else{n=+iv.slice(0,-1);u=iv.slice(-1);}
  var st=/^\d{4}-\d\d-\d\d$/.test($('rs-start').value)?$('rs-start').value:todayIso();
  if(!clean(t)){if(repCur)data.reps=data.reps.filter(function(x){return x!==repCur;});closeSheet($('rsheet'));touch();render();return;}
  var mode=repMode();if(mode==='trig'&&!repSel.length){$('rs-msg').textContent='Valitse vähintään yksi asiasana.';return;}
  var R=repCur||{id:uid('t'),created:nowIso()};R.text=t;R.mode=mode;R.n=n;R.unit=u;if(R.start!==st){R.start=st;delete R.lastDue;}
  if(mode==='trig'){R.terms=repSel.slice();R.all=pressed('rs-all','ra')==='1';}else{delete R.terms;delete R.all;}if(!repCur)data.reps.push(R);
  closeSheet($('rsheet'));touch();render();});
$('rs-del').addEventListener('click',function(){if(!repCur)return;delAsk($('rs-del'),'Poistetaanko toistuva?','Uusia ei enää tule. Jo tulleet muistiinpanot jäävät.',function(){data.reps=data.reps.filter(function(x){return x!==repCur;});closeSheet($('rsheet'));touch();render();});});
$('terms').addEventListener('click',function(){closeSheet($('fsheet'));openTerms();});
/* ---- kalenteri ----
   Viikkonauha (ma–su) ja valitun päivän aikajana. Pitkä painallus (350 ms) nostaa merkinnän ja siirtää sitä 15 min askelin,
   kulmaväkänen muuttaa loppuaikaa heti. Lyhyt napautus avaa muistiinpanon. */
var calDay=null,calTop=null,HOURPX=48,LONG=350,STEP=15,CVs=0,CVe=1440,CVoff=[];
/* Projektin kalenterinäkymä (1.54): näkyvä päivä CVs–CVe ja pois käytöstä olevat viikonpäivät (Projekti-ikkuna) */
function calvNow(){var v=data.calv;CVs=v?v.s:0;CVe=v?v.e:1440;CVoff=v?v.off:[];}
function yOf(m){return (m-CVs)/60*HOURPX;}
function dayOff(iso){return CVoff.indexOf(fromIso(iso).getDay())>=0;}
/* Päivän merkinnät näkyvään aikaan; pois käytöstä olevien edeltävien päivien merkinnät tulevat koko päivän merkinnöiksi (od = oma päivä) */
function dayView(d){var E=clipDay(dayEntries(calNotes(),d,durMin()),data.calv?{s:CVs,e:CVe}:null);
  for(var k=1;k<7;k++){var o=isoD(addDays(fromIso(d),-k));if(!dayOff(o))break;var F=dayEntries(calNotes(),o,durMin());F.timed.concat(F.untimed).forEach(function(x){x.od=o;E.untimed.push(x);});}
  return E;}
function hourLines(tl){tl.style.height=yOf(CVe)+'px';for(var hh=Math.ceil(CVs/60);hh<CVe/60;hh++){var r=el('div','hr');r.style.top=yOf(hh*60)+'px';r.appendChild(el('b','',hh+'.00'));tl.appendChild(r);}}
function nowLine(a){var nw=new Date(),m=nw.getHours()*60+nw.getMinutes();if(m<CVs||m>CVe)return;var nl=el('div','now');nl.style.top=yOf(m)+'px';a.appendChild(nl);}
/* 1.88 (Emil 25.10.2026): toistuva kohde (asiasanalla uusiutuminen) saa ohuen kiertonuolen, kertaluontoinen ei mitään */
function repMark(){var s=el('span','crep');s.setAttribute('aria-hidden','true');s.innerHTML='<svg viewBox="0 0 16 16" width="13" height="13"><path d="M13 8a5 5 0 1 1-1.6-3.7M13.2 2.6v3h-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';return s;}
/* Kaikki 0.6 (Emil 22.11.2026): kalenterin merkinnän kuittaus suoraan ympyrästä. Merkintä ei katoa eikä yliviivaudu; ympyrä muuttuu vihreäksi väkäseksi.
   Kuittaus on päivän kerran (pts), joten se kulkee vaultiin muistiinpanon juuri-rivillä kuten ennenkin. Päivitys paikallaan, jottei mikään hypi. */
function calOk(n,key){var P=n.pts||(n.pts={});if(P[key])delete P[key];else if(n.done&&!P[key]){delete n.done;n.tx=[];}else P[key]=nowIso();if(!Object.keys(P).length)delete n.pts;
  txSync(n,todayIso());touch();return ptDone(n,key);}
var CKSVG='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.3 3.3L15.2 7"/></svg>';
function calCk(cls,n,key,tt,onSet){var b=el('button',cls);b.type='button';b.innerHTML=CKSVG;function st(on){b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',(on?'Kuitattu: ':'Kuittaa: ')+tt);}
  st(ptDone(n,key));b.addEventListener('pointerdown',function(e){e.stopPropagation();});b.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();var on=calOk(n,key);st(on);if(onSet)onSet(on);});return b;}
function srcCls(n){var k=n&&n.vp?VAULT.kindOf(n.vp,n.vfm):'oma';return k==='oma'?'':' src-'+(k==='yhdessa'?'yhdessa':'tekoaly');}
function okMark(){var s=el('span','okm');s.setAttribute('aria-hidden','true');s.innerHTML='<svg viewBox="0 0 16 16" width="11" height="11"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';return s;}
function udayChip(box,x,d){
  var od=x.od||d,key=occKey(od,x.o),title=calTitle(x.n,x.o)||'(tyhjä)';
  var label=x.od?WDS[fromIso(od).getDay()]+' '+fromIso(od).getDate()+'.'+(fromIso(od).getMonth()+1)+'. · '+title:title;
  var wrap=el('span','uline'+srcCls(x.n));box.appendChild(wrap);
  var b=button(wrap,label,'chip'+(ptDone(x.n,key)?' done':'')+(isChk(x.n)?' lst':''));
  b.dataset.id=x.n.id;b.title=label;
  wrap.appendChild(calCk('wck',x.n,key,title,function(on){b.classList.toggle('done',on);}));
  return b;
}
function durMin(){var d=+data.cfg.dur;return [15,30,45,60].indexOf(d)>=0?d:30;}

function weekStart(iso){var d=fromIso(iso);return addDays(d,-((d.getDay()+6)%7));}
function calSet(iso){calDay=iso;render();}
function calWeekStep(delta){calSet(isoD(addDays(weekStart(calDay),7*delta)));}
function renderCal(){var p=panels.cal,today=todayIso();p.textContent='';if(!calDay)calDay=today;calvNow();
  for(var q=0;q<7&&dayOff(calDay);q++)calDay=isoD(addDays(fromIso(calDay),1));
  var ws=weekStart(calDay),days=[];for(var i=0;i<7;i++){var di=isoD(addDays(ws,i));if(!dayOff(di))days.push(di);}
  var dl=fromIso(calDay),MON=['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'];
  var AT=allTerms(),ct=calTerms(AT,calNotes(),calDay);termCache=null;
  /* 1.60 (Emil): kalenterin kelluva + poistettu; uusi merkintä pitämällä (puhelin) tai napsauttamalla/vetämällä (kone) aikajanalla. 1.59 (Emil): päiväteksti kalenterin palkin yläpuolelta pois, palkki alkaa heti ylhäältä eikä vieritys paljasta mitään sen yläpuolelta */
  setInfo('');
  var top=el('div','calsticky');top.id='calsticky';p.appendChild(top);
  var h=el('div','calhead'),compact=!wide()&&!land(),weekNav=compact?el('div','calweek-nav'):h;
  function weekArrow(text,label,step){button(weekNav,text,'mini calweek-step',function(){calWeekStep(step);}).setAttribute('aria-label',label);}
  weekArrow('‹','Edellinen viikko',-1);
  var t=el('h2',compact?'calweek-month':'');
  var tb=button(t,'','mtitle',openMonth);tb.id='calmonth';tb.setAttribute('aria-label','Kuukausi');
  var mn=MON[dl.getMonth()],mt=el('span','mt');
  mt.appendChild(document.createTextNode(mn.charAt(0).toUpperCase()+mn.slice(1)));
  mt.appendChild(el('span','yr',' '+dl.getFullYear()));
  mt.appendChild(el('span','wk',' · vk '+isoWeekNo(ws)));
  tb.appendChild(mt);
  tb.insertAdjacentHTML('beforeend','<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5"/></svg>');
  (compact?top:h).appendChild(t);
  var tdb=button(h,'Tänään','mini',function(){calTop=null;calSet(today);});tdb.id='caltoday';tdb.disabled=calDay===today;
  if(!compact)weekArrow('›','Seuraava viikko',1);
  var cvs=el('div','seg calv');cvs.id='calview';cvs.setAttribute('role','group');cvs.setAttribute('aria-label','Kalenterin näkymä');
  [['w','Viikko','Vk'],['d',wide()||land()?'Aikajana':'Päivä','Pv']].forEach(function(o){var b=button(cvs,'','',function(){if(calView()!==o[0])setCalView(o[0]);});b.className='';b.dataset.v=o[0];
    b.setAttribute('aria-pressed',calView()===o[0]?'true':'false');b.setAttribute('aria-label',o[1]);b.appendChild(el('span','lg',o[1]));b.appendChild(el('span','sh',o[2]));});
  h.appendChild(cvs);top.appendChild(h);
  var g=el('div','calgrid');g.id='week';g.style.gridTemplateColumns='repeat('+days.length+',minmax(0,1fr))';
  days.forEach(function(d,i){var b=button(g,'','cday'+(d===today?' today':'')+(d===calDay?' on':'')+(notesOnDay(calNotes(),d,true).length?' has':''),function(){calSet(d);});
    b.dataset.day=d;b.setAttribute('aria-pressed',d===calDay?'true':'false');b.appendChild(el('small','',WDS[fromIso(d).getDay()]));b.appendChild(document.createTextNode(fromIso(d).getDate()));
    if(dayView(d).untimed.length){var ad=el('i','adot');ad.title='Koko päivän merkintöjä';b.appendChild(ad);b.classList.add('hasad');}
    var c2=calTerms(AT,calNotes(),d);if(c2.length){var sub=el('i','csub',c2[0]+(c2.length>1?' +'+(c2.length-1):''));b.appendChild(sub);b.classList.add('hassub');b.title=c2.join(', ');}});
  if(compact){weekNav.appendChild(g);weekArrow('›','Seuraava viikko',1);top.appendChild(weekNav);}else top.appendChild(g);
  /* pyyhkäisy viikkonauhalla vaihtaa viikkoa */
  var sx=null;g.addEventListener('touchstart',function(ev){sx=ev.touches[0].clientX;},{passive:true});
  g.addEventListener('touchend',function(ev){if(sx===null)return;var dx=ev.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)calWeekStep(dx<0?1:-1);});
  if(calView()==='w'){renderWeekList(p,top,days,today);return;}
  if(wide()||land()){renderWeek(p,top,days,today);return;}
  var E=dayView(calDay);
  /* Koko päivän merkinnät (Emil 22.10.2026) aikajanan alla, ei yläreunassa */
  var u=el('div','allday');u.id='untimed';u.appendChild(el('h3','','Koko päivä'));if(E.untimed.length){E.untimed.forEach(function(x){var c=udayChip(u,x,calDay);if(!x.od)chipDrag(c,x);else c.addEventListener('click',function(){openNote(x.n,null,occKey(x.od,x.o));});});}
  var fieldDay=nvCalendarDates([calDay]).get(calDay);if(fieldDay)nvCalendarChips(u,fieldDay);
  var tl=el('div','tl');tl.id='timeline';hourLines(tl);
  var area=el('div','area');tl.appendChild(area);areaNew(area,calDay);if(planOn())winBar(area,calDay);
  if(calDay===today)nowLine(area);
  E.timed.forEach(function(x){area.appendChild(evBox(x));});
  p.appendChild(tl);if(u)p.appendChild(u);
  if(!E.timed.length&&!E.untimed.length&&!fieldDay)p.insertBefore(el('p','sub','Ei merkintöjä tälle päivälle.'),tl);
  requestAnimationFrame(function(){if(calTop===null){calTop=main.scrollTop+tl.getBoundingClientRect().top-main.getBoundingClientRect().top+Math.max(0,yOf(420))-top.offsetHeight-6;}main.scrollTop=calTop;});}
/* + kelluu kalenterin oikeassa alakulmassa (Emil 22.10.2026); tekstissä tai kentässä ilmaistu aika voittaa aina. */
/* +:n alkuaika (1.35, yläreunan viivatoiminto poistettu): tänään seuraava vartti nykyhetkestä, muina päivinä 9.00 */
/* Uusi merkintä aikajanalta (Emil 22.10.2026): hiirellä painallus mihin tahansa ja veto venyttää pituuden (lähin vartti);
   kosketuksella lyhyt pito (0,25 s) paikallaan tuo oman värisen viivan pyöristettyyn aikaan. Viivaa voi raahata ylös ja alas
   (vieritys lukossa), nosto avaa merkinnän viivan kohtaan. Reilu veto sivulle peruu: viiva katoaa eikä mitään avaudu.
   Pelkkä hipaisu tai vieritys ennen pitoaikaa ei tee mitään. */
var HOLDX=56;
var HOLD=250;
function areaNew(a,day){var st=null;
  function minAt(cy){var r=a.getBoundingClientRect();return Math.max(CVs,Math.min(CVe-STEP,CVs+Math.round((cy-r.top)/HOURPX*60/STEP)*STEP));}
  function paint(){var s=Math.min(st.m,st.e),e=Math.max(st.m,st.e);if(!st.drag)e=Math.min(1440,s+durMin());st.g.style.top=yOf(s)+'px';st.g.style.height=Math.max(18,(e-s)/60*HOURPX-2)+'px';st.g.textContent=fmtTime(fromMin(s))+'–'+fmtTime(fromMin(e));}
  a.addEventListener('pointerdown',function(ev){if(ev.button>0||(ev.target!==a&&!ev.target.classList.contains('now')))return;
    var m=minAt(ev.clientY);st={m:m,e:m,y0:ev.clientY,x0:ev.clientX,t0:Date.now(),mouse:ev.pointerType==='mouse',g:null,drag:false};
    if(st.mouse){ev.preventDefault();try{a.setPointerCapture(ev.pointerId);}catch(e){}st.g=el('div','evghost new');a.appendChild(st.g);paint();return;}
    var pid=ev.pointerId,s1=st;st.timer=setTimeout(function(){if(st!==s1)return;st.on=true;st.l=el('div','holdline');st.l.appendChild(el('b'));a.appendChild(st.l);line();try{a.setPointerCapture(pid);}catch(e){}},HOLD);});
  function line(){st.l.style.top=yOf(st.m)+'px';st.l.firstChild.textContent=Math.floor(st.m/60)+'.'+pad(st.m%60);}
  a.addEventListener('touchmove',function(ev){if(st&&(st.on||st.dead))ev.preventDefault();},{passive:false});
  a.addEventListener('contextmenu',function(ev){if(st)ev.preventDefault();});
  a.addEventListener('pointermove',function(ev){if(!st)return;
    if(st.mouse){var e=minAt(ev.clientY);if(Math.abs(ev.clientY-st.y0)>4)st.drag=true;st.e=e>=st.m?Math.max(st.m+STEP,e):e;paint();}
    else if(st.dead)return;
    else if(st.on){ev.preventDefault();var dx=Math.abs(ev.clientX-st.x0);if(dx>HOLDX){st.l.remove();st.l=null;st.on=false;st.dead=true;return;}
      st.l.classList.toggle('fade',dx>HOLDX/2);st.m=minAt(ev.clientY);line();}
    else if(Math.abs(ev.clientY-st.y0)>8||Math.abs(ev.clientX-st.x0)>8){clearTimeout(st.timer);st=null;}});
  function done(cancel){if(!st)return;var s0=st;st=null;clearTimeout(s0.timer);if(s0.g)s0.g.remove();if(s0.l)s0.l.remove();if(cancel||s0.dead)return;if(!s0.mouse&&!s0.on)return;
    if(!s0.mouse)s0.e=s0.m;
    var s=Math.min(s0.m,s0.e),e=Math.max(s0.m,s0.e);openNote(null,{date:day,s:fromMin(s),e:s0.drag&&e>s?fromMin(e):''});}
  a.addEventListener('pointerup',function(){done(false);});a.addEventListener('pointercancel',function(){done(true);});}
/* Tietokone (vaihe 14): viikko seitsemänä sarakkeena. Ajattomat päivän sarakkeen yläosassa, merkinnän voi raahata toiselle päivälle ja kellonajalle. */
function renderWeek(p,top,days,today){$('week').classList.add('wk7');var nd=days.length;
  var ur=el('div','untwk');ur.id='untimed';ur.style.gridTemplateColumns='repeat('+nd+',minmax(0,1fr))';var DV={},FD=nvCalendarDates(days);days.forEach(function(d){DV[d]=dayView(d);var c=el('div','ucell'+(d===calDay?' on':''));c.dataset.day=d;
    DV[d].untimed.forEach(function(x){x.day=x.od||d;var b=udayChip(c,x,d);if(!x.od)chipDrag(b,x);else b.addEventListener('click',function(){openNote(x.n,null,occKey(x.od,x.o));});});if(FD.has(d))nvCalendarChips(c,FD.get(d));ur.appendChild(c);});
  var tl=el('div','tl wk');tl.id='timeline';hourLines(tl);
  days.forEach(function(d,i){var a=el('div','area dcol'+(d===calDay?' on':'')+(d===today?' today':''));a.dataset.day=d;a.style.left='calc(44px + (100% - 44px) / '+nd+' * '+i+')';a.style.width='calc((100% - 44px) / '+nd+')';areaNew(a,d);
    if(d===today)nowLine(a);
    DV[d].timed.forEach(function(x){x.day=d;a.appendChild(evBox(x));});tl.appendChild(a);});
  p.appendChild(tl);var uh=el('h3','alldayh','Koko päivä');p.appendChild(uh);p.appendChild(ur);
  requestAnimationFrame(function(){if(calTop===null){calTop=main.scrollTop+tl.getBoundingClientRect().top-main.getBoundingClientRect().top+Math.max(0,yOf(420))-top.offsetHeight-6;}main.scrollTop=calTop;});}
/* 1.103 (Emil 15.11.2026, Mätsik Forestin linja): kalenterin oletus on Viikko. Päivät otsikkoina, päivän merkinnät tärkeysjärjestyksessä
   (asiasanojen tähtijärjestys, sitten kellonaika). Napautus avaa pienen ikkunan (OK, Avaa muistiinpano), ulkopuolinen napautus sulkee.
   OK on sama kuittaus kuin muualla (N.pts). Kuitattu jää paikalleen himmeänä. Päivä (tietokoneella Aikajana) on valinta, muistetaan laitteella.
   Viikkonauhan päivä vierittää päivän otsikon nauhan alle. */
var calV=null,wkKeep=null;
function hm(m){return fromMin(m).replace(/^0/,'').replace(':','.');}
function calView(){if(calV===null){try{calV=localStorage.getItem('kaikki:calview');}catch(e){}if(calV!=='d')calV='w';}return calV;}
function setCalView(v){calV=v==='d'?'d':'w';try{localStorage.setItem('kaikki:calview',calV);}catch(e){}calTop=null;main.scrollTop=0;render();}
function renderWeekList(p,top,days,today){var AT=allTerms(),rk=rankFn(AT,today),box=el('div','wklist');box.id='wklist';termCache=null;
  /* Viikon perään seuraavan viikon päivät, jotta tulevat päivät näkyvät myös sunnuntaina */
  var ws2=addDays(weekStart(calDay),7),nx=[];for(var i=0;i<7;i++){var di=isoD(addDays(ws2,i));if(!dayOff(di))nx.push(di);}
  var recorded=quickCalendarRows(days.concat(nx)),fieldDays=nvCalendarDates(days.concat(nx));
  days.concat(['|'],nx).forEach(function(d){if(d==='|'){box.appendChild(el('h3','wkdiv','Vk '+isoWeekNo(ws2)));return;}var E=dayView(d),L=E.timed.concat(E.untimed),dt=fromIso(d),sec=el('section','wkday'+(d===today?' today':'')+(d===calDay?' on':''));sec.dataset.day=d;
    var h=el('h3','wkh');h.appendChild(el('b','',(d===today?'Tänään, ':'')+WDS[dt.getDay()]+' '+dt.getDate()+'.'+(dt.getMonth()+1)+'.'));pvChip(h,d);sec.appendChild(h);
    L.forEach(function(x){x.rk=rk(x.n);x.key=occKey(x.od||d,x.o);x.ok=ptDone(x.n,x.key);x.tt=calTitle(x.n,x.o)||'(tyhjä)';});
    L.sort(function(a,b){if(a.rk!==b.rk)return a.rk<b.rk?-1:1;var sa=a.timed?a.s:1e4,sb=b.timed?b.s:1e4;return sa-sb;});
    if(!L.length&&!recorded.has(d)&&!fieldDays.has(d))sec.classList.add('empty');
    L.forEach(function(x){var b=el('button','wrow'+(x.ok?' done':'')+(isChk(x.n)?' lst':'')+srcCls(x.n));b.type='button';b.dataset.id=x.n.id;b.dataset.key=x.key;
      b.appendChild(el('span','wt',x.timed?hm(x.s):x.od?WDS[fromIso(x.od).getDay()]+' '+fromIso(x.od).getDate()+'.':''));
      b.appendChild(el('span','wtt',x.tt));if(x.o&&!plain(x.o))b.appendChild(repMark());
      b.setAttribute('aria-label',(x.timed?hm(x.s)+' ':'')+x.tt+(x.ok?', kuitattu':''));
      b.addEventListener('click',function(){wkPop(b,x);});var wl=el('div','wline');wl.appendChild(b);wl.appendChild(calCk('wck',x.n,x.key,x.tt,function(on){x.ok=on;b.classList.toggle('done',on);b.setAttribute('aria-label',(x.timed?hm(x.s)+' ':'')+x.tt+(on?', kuitattu':''));}));sec.appendChild(wl);});
    if(recorded.has(d))sec.appendChild(el('p','wk-recorded','Kirjattu: '+recorded.get(d).join(', ')));
    if(fieldDays.has(d))nvCalendarChips(sec,fieldDays.get(d));
    box.appendChild(sec);});
  p.appendChild(box);
  requestAnimationFrame(function(){if(wkKeep!==null){main.scrollTop=wkKeep;wkKeep=null;return;}var s=box.querySelector('.wkday.on');
    if(!s||s===box.firstChild){main.scrollTop=0;return;}main.scrollTop+=s.getBoundingClientRect().top-top.getBoundingClientRect().bottom-2;});}
function wkPop(b,x){var m=$('wkpop');m.textContent='';m.appendChild(el('div','mh',x.tt+(x.timed?' · '+hm(x.s):'')));
  var ok=ptDone(x.n,x.key);
  menuItem(m,'wk-ok',ok?'Kumoa kuittaus':'OK',function(){
    calOk(x.n,x.key);wkKeep=main.scrollTop;render();});
  menuItem(m,'wk-open','Avaa muistiinpano',function(){openNote(x.n,null,x.key);});
  anchoredMenu('wkpop',b);}
/* Kuukausi-ikkuna (Emil 21.10.2026): päivän kohdalla vain sitä koskevien muistiinpanojen määrä. Napautus vie päivään. */
var monCur=null,MONN=['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'];
function openMonth(){var d=fromIso(calDay||todayIso());monCur=new Date(d.getFullYear(),d.getMonth(),1);renderMonth();openSheet($('csheet'));}
function renderMonth(){var g=$('cs-grid'),today=todayIso();g.textContent='';$('cs-h').textContent=MONN[monCur.getMonth()]+' '+monCur.getFullYear();
  /* Vakaa ikkuna (Emil 22.10.2026): viikonpäivät otsikossa, ruudukko aina 6 viikkoa */
  var lead=(monCur.getDay()+6)%7;for(var k=0;k<lead;k++)g.appendChild(el('span','mpad'));
  var y=monCur.getFullYear(),m=monCur.getMonth(),n=new Date(y,m+1,0).getDate();
  for(var i=1;i<=n;i++){(function(iso,i){var c=notesOnDay(calNotes(),iso,true).length,b=button(g,'','mday'+(iso===today?' today':'')+(iso===calDay?' on':''),function(){calDay=iso;calTop=null;closeSheet($('csheet'));render();});
    b.dataset.day=iso;b.appendChild(el('b','',String(i)));b.appendChild(el('small','',c?String(c):''));b.setAttribute('aria-label',fiDate(iso)+(c?', '+c+(c===1?' muistiinpano':' muistiinpanoa'):''));})(isoD(new Date(y,m,i)),i);}
  for(var q=lead+n;q<42;q++)g.appendChild(el('span','mpad'));}
/* 1.103 (Emil 15.11.2026, Mätsik 1.8): muistiinpanon Päivät-nappi avaa kuukausinäkymän ilman näppäimistöä. Napautus lisää päivän tekstiin
   (pp.kk.vvvv, pilkulla edellisen päiväyksen perään), toinen napautus poistaa sen tekstistä. Ei OK-nappia: ulkopuolinen napautus tai ruksi sulkee.
   Teksti on totuus: valittuina näkyvät tekstin yksittäiset päiväykset. Ruudukko on aina 6 viikkoa, joten koko ei vaihdu. */
var dsCur=null,dsSrc=null;
/* 1.104: lähde on muistiinpanon tekstikenttä tai pikamuistiinpano (dsSrc = {get, set, base, nl}) */
function dsBase(){return dsSrc?dsSrc.base:noteCur&&noteCur.created?new Date(noteCur.created):new Date();}
function dsNl(){return dsSrc?dsSrc.nl:noteCur&&noteCur.nl;}
function dsText(){return dsSrc?dsSrc.get():$('ns-text').value;}
function dsDays(t){return dayTextDays(t,dsBase(),dsNl());}
function dsToggle(iso){var t=dayTextToggle(dsText(),iso,dsBase(),dsNl());
  if(dsSrc)dsSrc.set(t);else{var ta=$('ns-text');ta.value=t;ta.dispatchEvent(new Event('input',{bubbles:true}));}renderDays();}
function renderDays(){var g=$('ds-grid'),today=todayIso(),D=dsDays(dsText());g.textContent='';$('ds-h').textContent=MONN[dsCur.getMonth()]+' '+dsCur.getFullYear();
  var lead=(dsCur.getDay()+6)%7;for(var k=0;k<lead;k++)g.appendChild(el('span','mpad'));
  var y=dsCur.getFullYear(),m=dsCur.getMonth(),n=new Date(y,m+1,0).getDate();
  for(var i=1;i<=n;i++){(function(iso,i){var on=!!D[iso],b=button(g,'','mday'+(iso===today?' today':'')+(on?' on':''),function(){dsToggle(iso);});b.dataset.day=iso;b.appendChild(el('b','',String(i)));b.appendChild(el('small','',''));
    b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',fiDate(iso));})(isoD(new Date(y,m,i)),i);}
  for(var q=lead+n;q<42;q++)g.appendChild(el('span','mpad'));}
function dsOpen(src){dsSrc=src||null;var cap=$('ds-cap');cap.textContent=dsSrc&&dsSrc.caption||'';cap.hidden=!cap.textContent;
  if(cap.textContent)$('dsheet').setAttribute('aria-describedby','ds-cap');else $('dsheet').removeAttribute('aria-describedby');var D=Object.keys(dsDays(dsText())).sort(),d=D.length?fromIso(D[D.length-1]):new Date();dsCur=new Date(d.getFullYear(),d.getMonth(),1);renderDays();openSheet($('dsheet'));}
$('ns-days').addEventListener('click',function(){dsOpen(null);});
$('ds-prev').addEventListener('click',function(){dsCur=new Date(dsCur.getFullYear(),dsCur.getMonth()-1,1);renderDays();});
$('ds-next').addEventListener('click',function(){dsCur=new Date(dsCur.getFullYear(),dsCur.getMonth()+1,1);renderDays();});
$('cs-prev').addEventListener('click',function(){monCur=new Date(monCur.getFullYear(),monCur.getMonth()-1,1);renderMonth();});
$('cs-next').addEventListener('click',function(){monCur=new Date(monCur.getFullYear(),monCur.getMonth()+1,1);renderMonth();});
/* ---- 1.104 Viikot ja pikamuistiinpano (Emil 15.11.2026: Mätsik Forestin lista Juureen) ----
   Listat-osion jatkuvalla Listalla oletus on Viikot: rivi per listan rivi, nimi jäädytettynä, 14 viikkoa kuluvasta eteenpäin (vierivät sivuttain
   yhdessä otsikkorivin kanssa). Ruudussa avointen määrä; punainen = avointa kuluvalla viikolla, keltainen = tulevalla, vihreä = kuitattu, tyhjä = ei mitään.
   Viikon napautus avaa rivin alle viikon asiat tärkeysjärjestyksessä: uusiutuvat kuittaukset, pikapäivät ja muistiinpanot, joissa mainitaan rivin
   nimi (yksittäiset päivät). OK kuittaa; kuitattu jää paikalleen himmeänä, uusi napautus perii. Ulkopuolinen napautus sulkee eikä tee muuta.
   Rivit-näkymä on entinen lista. Valinta muistetaan laitteella. */
var lstV=null,lwOpen=null,lwX=0,NW=14;
/* 1.105: Ruudut (g, oletus), Viikot (w) ja vanha rivinäkymä (r, Lista-ikkunasta) */
function listView(){if(lstV===null){try{lstV=localStorage.getItem('kaikki:listview');}catch(e){}if(lstV!=='r'&&lstV!=='w')lstV='g';}if(lstV==='r'&&!OLDUI)lstV='g';return lstV;}
/* 1.105: testien koukku näkymän valintaan (ei käyttöliittymää). 1.108: old() avaa poistetut näkymät vanhoja testejä varten */
/* ---- Kaikki 0.1: GitHub-vault (Emil 22.11.2026) ----
   Ensimmäisen projektin (data.K[0]) muistiinpanot = vaultin näkyvät .md-tiedostot (VAULT.visible). Haku: puu + muuttuneet tiedostot.
   Tallennus: save() -> vQueue() vertaa muistiinpanoja välimuistiin ja jonottaa muuttuneet tiedostot; vFlush() vie ne yksi kerrallaan.
   Poistettu muistiinpano siirtyy vaultissa arkisto/-kansioon (vaultin sääntö: mitään ei poisteta). Ristiriita: GitHubin versio voittaa
   ja oma versio tallentuu viereen nimellä …-ristiriita-HHMM.md, joten mitään ei katoa. Avain vain tämän selaimen muistissa (kaikki:gh). */
var GKEY='kaikki:gh',VKEY='kaikki:vault';
var G={repo:'Kasibanaani/vault123',token:'',branch:'main'};
try{var g0=JSON.parse(localStorage.getItem(GKEY)||'null');if(g0){G.repo=g0.repo||G.repo;G.token=g0.token||'';G.branch=g0.branch||'main';}}catch(e){}
var VC={files:{},known:{},q:{}};
try{var v0=JSON.parse(localStorage.getItem(VKEY)||'null');if(v0&&v0.files){VC.files=v0.files;VC.known=v0.known||{};VC.q=v0.q||{};}}catch(e){}
var vBusy=false,vMsg='',vAt='',vTimer=0,vApplying=false,vLastErr='';
/* 0.3: lähdesuodatin (kaikki:lahde = SRCP-avain). Muutos vie ensin omat muutokset jonoon, sitten näkymä lasketaan välimuistista uudelleen. */
var srcPre='std';try{srcPre=localStorage.getItem('kaikki:lahde')||'std';}catch(e){}
function setSrc(k){srcPre=VAULT.SRCP[k]?k:'std';try{localStorage.setItem('kaikki:lahde',srcPre);}catch(e){}clearTimeout(vTimer);if(vOn())vCollect();vApply();activeScroller().scrollTop=0;render();}
var SRCN={std:'Kaikki sisältö',oma:'Vain omat',emil:'Omat ja yhdessä tehdyt',ai:'Tekoälyn kirjoittamat',ohje:'Tekoälylle (ohjeet)',all:'Kaikki, myös tekoälylle'};
var SRCS={std:'Kaikki',oma:'Omat',emil:'Omat + yhdessä',ai:'Tekoäly',ohje:'Tekoälylle',all:'Kaikki + ohjeet'};
function srcMenu(anchor){var m=$('sortpop');m.textContent='';m.setAttribute('aria-label','Kenen kirjoittamat');['std','oma','emil','ai','ohje','all'].forEach(function(k){var b=menuItem(m,'src-'+k,SRCN[k],function(){setSrc(k);var f=$('srcpick');if(f)f.focus();});b.setAttribute('aria-current',srcPre===k?'true':'false');if(k==='ai'||k==='emil')b.insertBefore(el('span','srcdot'+(k==='ai'?' ai':'')),b.firstChild);/* 0.6: raidan värin selite */});anchoredMenu('sortpop',anchor);}
/* 0.3: päivitys. Nappi yläpalkissa vie omat muutokset ja hakee GitHubista; auki ollessa haku minuutin välein (vain kun mitään ei odota lähtöä). */
function vRefresh(){if(!vOn())return Promise.resolve(false);clearTimeout(vTimer);return Promise.resolve(vCollect()).then(function(){return vPull();}).then(function(ok){if(ok)vCollect();return ok;});}
setInterval(function(){if(vOn()&&!vBusy&&document.visibilityState==='visible'&&!Object.keys(VC.q).length)vPull();},60000);
function vSaveC(){try{localStorage.setItem(VKEY,JSON.stringify(VC));}catch(e){vMsg='Laitteen muisti on täynnä: muutokset eivät säily välimuistissa.';}}
function vSaveG(){try{localStorage.setItem(GKEY,JSON.stringify(G));}catch(e){}}
function vOn(){return !!(G.repo&&G.token);}
function vRepo(){return String(G.repo||'').trim().replace(/\s+/g,'').replace(/^https?:\/\/(www\.)?github\.com\//,'').replace(/\.git$/,'').replace(/\/+$/,'');}
function vUrl(p){return 'https://api.github.com/repos/'+vRepo()+p;}
function vEnc(p){return p.split('/').map(encodeURIComponent).join('/');}
function b64e(s){return btoa(unescape(encodeURIComponent(s)));}
function b64d(b){return decodeURIComponent(escape(atob(String(b).replace(/\s/g,''))));}
function vApi(url,method,body){method=method||'GET';var u=method==='GET'?url+(url.indexOf('?')<0?'?':'&')+'t='+Date.now():url,h={'Authorization':'Bearer '+G.token,'Accept':'application/vnd.github+json'};if(body)h['Content-Type']='application/json';
  var req;try{req=fetch(u,{method:method,headers:h,body:body?JSON.stringify(body):undefined});}catch(e){vLastErr=String(e&&e.message||e);return Promise.resolve({status:0,j:{}});}
  return req.then(function(r){return r.text().then(function(t){var j={};try{j=JSON.parse(t);}catch(e){}return {status:r.status,j:j};});},function(e){vLastErr=String(e&&e.message||e);return {status:0,j:{}};});}
function vErr(st){if(st===0)return 'Ei yhteyttä GitHubiin. Muutokset odottavat ja lähtevät, kun yhteys palaa.'+(vLastErr?' Selaimen ilmoitus: '+vLastErr:'');return ({401:'Avain ei kelpaa tai se on vanhentunut.',403:'Avaimella ei ole oikeutta tähän repoon. Tarvitaan Contents: Read and write.',404:'Repoa ei löydy, tai avaimella ei ole pääsyä siihen.'})[st]||('GitHub vastasi virheellä '+st+'.');}
function vK(){return data.K[0];}
function vNotes(){var k=vK();return k&&k.id===data.k?data.notes:(k?k.notes:[]);}
function vTrash(){var k=vK();return k&&k.id===data.k?data.trash:(k?k.trash:[]);}
function vStatus(){if(!vOn())return 'ei käytössä';if(vBusy)return 'tallennetaan…';var n=Object.keys(VC.q).length;if(vMsg&&/Avain|oikeutta|löydy|virhee/.test(vMsg))return 'virhe';if(n)return n+' odottaa';return vAt?'ajan tasalla '+vAt:'ajan tasalla';}
function vClock(){var d=new Date();return pad(d.getHours())+'.'+pad(d.getMinutes());}
/* Muuttuneiden tiedostojen haku: koko puu yhdellä pyynnöllä, sisältö vain muuttuneista */
function vPull(){if(!vOn()||vBusy)return Promise.resolve(false);vBusy=true;vRender();
  return vApi(vUrl('/git/trees/'+encodeURIComponent(G.branch||'main')+'?recursive=1')).then(function(r){
    if(r.status===404||r.status===409){vBusy=false;vMsg=r.status===409?'':vErr(404);vRender();return r.status===409;}  // 409 = tyhjä repo
    if(r.status!==200||!Array.isArray(r.j.tree)){vBusy=false;vMsg=vErr(r.status);vRender();return false;}
    var want=r.j.tree.filter(function(t){return t.type==='blob'&&/\.(md|csv|json)$/i.test(t.path)&&(t.size||0)<400000;}),seen={},todo=[];
    want.forEach(function(t){seen[t.path]=1;var c=VC.files[t.path];if(!c||c.sha!==t.sha)todo.push(t);});
    var viewsChanged=todo.some(function(item){return /^nakymat\//.test(item.path);});
    Object.keys(VC.files).forEach(function(p){if(!seen[p]&&!VC.q[p]){if(/^nakymat\//.test(p))viewsChanged=true;delete VC.files[p];}});
    var i=0;function next(){if(i>=todo.length)return Promise.resolve();var batch=todo.slice(i,i+6);i+=6;
      return Promise.all(batch.map(function(t){return vApi(vUrl('/git/blobs/'+t.sha)).then(function(b){if(b.status===200&&typeof b.j.content==='string'){try{VC.files[t.path]={sha:t.sha,t:b64d(b.j.content)};}catch(e){}}});})).then(next);}
    return next().then(function(){vBusy=false;vMsg='';vAt=vClock();vSaveC();vApply();vRender();
      if($('nsheet').open&&noteCur&&viewLocked(noteOpenView)){
        draftSave();closeSheet($('nsheet'));noteFromView(noteCur,noteOpenView);
      }else if($('nsheet').open&&$('ns-text').readOnly)paintHl();
      if(tab==='sheets'||tab==='dash'||tab==='treeni'||tab==='notes'&&viewsChanged)render();
      if($('note-graph').open)graphBuild();
      if(Object.values(VC.q).some(function(o){return o.direct;}))vFlush();
      return true;});});}
/* Välimuisti -> muistiinpanot (vain tiedostot, joilla ei ole lähtemättömiä omia muutoksia) */
function vApply(){var notes=vNotes(),by={},ch=false;notes.forEach(function(N){if(N.vp)by[N.vp]=N;});
  Object.keys(VC.files).forEach(function(p){if(VC.q[p]||!VAULT.shown(p,VC.files[p].t,srcPre))return;var md=VC.files[p].t,N=by[p];
    if(!N){if(VC.known[p])return;var M=VAULT.noteOf(p,md);if(notes.some(function(x){return x.id===M.id;}))M.id=uid('v');notes.push(M);VC.known[p]=1;ch=true;return;}
    VC.known[p]=1;if(VAULT.mdOf(N)===md)return;if(noteCur===N&&$('nsheet').open)return;var M2=VAULT.noteOf(p,md);Object.keys(N).forEach(function(k){if(k!=='id')delete N[k];});Object.keys(M2).forEach(function(k){if(k!=='id')N[k]=M2[k];});ch=true;});
  for(var i=notes.length-1;i>=0;i--){var N=notes[i];if(!N.vp||VC.q[N.vp])continue;var F=VC.files[N.vp];
    if((!F&&VC.known[N.vp])||(F&&!VAULT.shown(N.vp,F.t,srcPre))){delete VC.known[N.vp];notes.splice(i,1);ch=true;}}
  vSaveC();if(ch){vApplying=true;try{save0();render();}finally{vApplying=false;}}return ch;}
/* Muistiinpanot -> jono */
function vQueue(){if(!vOn()||vApplying)return;clearTimeout(vTimer);vTimer=setTimeout(vCollect,900);}
function vTaken(p){return !!(VC.files[p]||VC.q[p]||vNotes().some(function(N){return N.vp===p;}));}
function vCollect(){if(!vOn())return;var notes=vNotes(),has={},n=0;
  notes.forEach(function(N){if(N.rep==='rx')return;/* Juuren järjestelmäilmoitukset jäävät laitteelle */if(!N.vp){N.vp=VAULT.newPath(N,vTaken);var S=VAULT.noteOf(N.vp,VAULT.mdOf(N));N.vfm=S.vfm;N.vpre=S.vpre;N.vpost=S.vpost;N.vh=S.vh;}
    has[N.vp]=1;if(VC.q[N.vp]&&VC.q[N.vp].direct)return;var md=VAULT.mdOf(N),c=VC.files[N.vp];
    if(VC.q[N.vp]&&!VC.q[N.vp].del){if(VC.q[N.vp].t!==md){VC.q[N.vp].t=md;n++;}}else if(!c||c.t!==md){VC.q[N.vp]={t:md,base:c?c.sha:null};n++;}VC.known[N.vp]=1;});
  Object.keys(VC.known).forEach(function(p){if(has[p])return;var c=VC.files[p];delete VC.known[p];
    if(VC.q[p]&&VC.q[p].direct)return;
    if(VC.q[p]&&!c){delete VC.q[p];return;}if(!c)return;var a='arkisto/'+p;if(VC.files[a]||VC.q[a])a=a.replace(/\.md$/,'-'+Date.now().toString(36)+'.md');
    VC.q[a]={t:c.t,base:null};VC.q[p]={del:1,base:c.sha};n++;});
  vSaveC();if(n)save0();vRender();return vFlush();}
function vFlush(){if(!vOn()||vBusy)return Promise.resolve();var ps=Object.keys(VC.q).sort(function(a,b){return (VC.q[a].del?1:0)-(VC.q[b].del?1:0);});if(!ps.length){openPendingMetricLink();nvRunAll();return Promise.resolve();}
  var p=ps[0],o=VC.q[p];vBusy=true;vRender();
  var req=o.requests?vWriteRequests(o.requests,2):o.del?vApi(vUrl('/contents/'+vEnc(p)),'DELETE',{message:'appi: arkistoon '+p,sha:o.base,branch:G.branch}):
    vApi(vUrl('/contents/'+vEnc(p)),'PUT',{message:'appi: '+(o.base?'muokkaus ':'uusi ')+p,content:b64e(o.t),sha:o.base||undefined,branch:G.branch});
  return req.then(function(r){vBusy=false;
    if(r.status===200||r.status===201){if(o.del)delete VC.files[p];else VC.files[p]={sha:r.j.content.sha,t:o.requests?r.t:o.t};if(VC.q[p]===o)delete VC.q[p];else if(VC.q[p])VC.q[p].base=o.del?null:r.j.content.sha;
      vMsg='';vAt=vClock();vSaveC();if(o.direct)vApply();vRender();return vFlush();}
    if(!o.requests&&(r.status===409||r.status===422||(o.del&&r.status===404)))return vConflict(p,o).then(function(again){vRender();if(again!==false)return vFlush();});
    vMsg=r.error||vErr(r.status);vRender();});}
function vConflict(p,o){return vApi(vUrl('/contents/'+vEnc(p)+'?ref='+encodeURIComponent(G.branch))).then(function(r){
    if(r.status===404){if(o.del){delete VC.q[p];delete VC.files[p];}else{o.base=null;}vSaveC();return;}
    if(r.status!==200){vMsg=vErr(r.status);if(o.direct)return false;delete VC.q[p];vSaveC();return;}
    var rt=b64d(r.j.content);VC.files[p]={sha:r.j.sha,t:rt};
    if(o.del||rt===o.t){delete VC.q[p];vSaveC();return;}
    var d=new Date(),cp=p.replace(/\.md$/,'')+'-ristiriita-'+pad(d.getHours())+pad(d.getMinutes())+'.md';
    while(VC.files[cp]||VC.q[cp])cp=cp.replace(/\.md$/,'-'+Date.now().toString(36)+'.md');
    VC.q[cp]={t:o.t,base:null,direct:o.direct};delete VC.q[p];vSaveC();vApply();
    toast('Muistiinpanoa oli muutettu GitHubissa samaan aikaan. Molemmat versiot säilyivät.');});}
/* Kaikki 0.11: huoltopyyntö lisätään tuoreeseen tiedostoon ja tallennetaan sen SHA:lla. */
var VREQUESTS='yllapito/pyynnot.md';
function vRequestTemplate(){return '---\ntyyppi: loki\notsikko: Huoltopyynnöt\nkuvaus: Emilin tekoälylle jättämät huoltopyynnöt.\nluotu: '+todayIso()+'\nlahde: emil\nnakyy: ei\n---\n# Huoltopyynnöt\n\n## Avoimet\n\n## Tehdyt\n';}
function vRequestText(md,rows){
  var eol=md.indexOf('\r\n')>=0?'\r\n':'\n',lines=md.split(eol);
  var open=lines.findIndex(function(line){return /^## Avoimet\s*$/.test(line);});
  var done=lines.findIndex(function(line,i){return i>open&&/^## Tehdyt\s*$/.test(line);});
  if(open<0||done<0)return null;
  var next=lines.findIndex(function(line,i){return i>open&&/^#{1,2} /.test(line);});
  if(next!==done)return null;
  var current=lines.slice(open+1,done),at=done;
  while(at>open+1&&!lines[at-1].trim())at--;
  return lines.slice(0,at).concat(rows.filter(function(row){return current.indexOf(row)<0;}),lines.slice(at)).join(eol);
}
function vWriteRequests(rows,retries){
  var url=vUrl('/contents/'+vEnc(VREQUESTS));
  return vApi(url+'?ref='+encodeURIComponent(G.branch)).then(function(r){
    if(r.status!==200&&r.status!==404)return r;
    var sha=r.j.sha,md=r.status===200?b64d(r.j.content):vRequestTemplate(),updated=vRequestText(md,rows);
    if(updated===null)return {status:422,error:'Huoltopyynnöt odottavat: pyyntötiedoston otsikoita Avoimet ja Tehdyt ei tunnistettu.'};
    if(sha&&updated===md)return {status:200,j:{content:{sha:sha}},t:md};
    return vApi(url,'PUT',{message:'appi: huoltopyyntö',content:b64e(updated),sha:sha,branch:G.branch}).then(function(result){
      if(retries&&(result.status===409||result.status===422))return vWriteRequests(rows,retries-1);
      result.t=updated;return result;
    });
  });
}
function vRequest(target){
  var queued=VC.q[VREQUESTS],file=VC.files[VREQUESTS];
  if(!vOn())return 'Ota GitHub-vault käyttöön ensin.';
  if(queued&&!queued.requests)return 'Pyyntötiedoston muokkaus odottaa synkronointia. Pyydä sen jälkeen uudelleen.';
  var row='- [ ] '+todayIso()+' · Järjestä · '+target;
  var rows=queued?queued.requests.slice():[];
  if(rows.indexOf(row)<0)rows.push(row);
  var md=vRequestText(file?file.t:vRequestTemplate(),rows);
  if(md===null)return 'Pyyntötiedoston otsikoita Avoimet ja Tehdyt ei tunnistettu.';
  VC.q[VREQUESTS]={t:md,direct:true,requests:rows};
  vSaveC();vRender();vFlush();
  return 'Huoltopyyntö lisätty synkronointijonoon.';
}
function vWorkFile(path){
  if(!/\.md$/i.test(path)||/(^|\/)[_.]/.test(path))return false;
  if(path===QUICK_PRESETS)return true;
  if(/^yllapito\/(?:loki|pyynnot)(?:-ristiriita-[a-z0-9-]+)?\.md$/i.test(path))return true;
  return (VAULT.visible(path)||/^ohjeet\//.test(path))&&VAULT.kindOf(path,VAULT.split(VC.files[path].t).fm)==='ohje';
}
function openVWork(requestOnly){
  var actions=$('vwork-actions'),list=$('vwork-files'),d=$('vwork-sheet');
  $('vwork-title').textContent=requestOnly?'Pyydä tekoälyä järjestämään':'Tekoälylle';
  actions.textContent='';list.textContent='';
  [['Saapuneet','inbox'],['Koko vault','koko vault']].forEach(function(pair){
    var label=requestOnly?pair[0]:'Pyydä järjestämään: '+pair[0].toLowerCase();
    button(actions,label,'btn',function(){var msg=vRequest(pair[1]);closeSheet(d);toast(msg);});
  });
  if(!requestOnly)Object.keys(VC.files).filter(vWorkFile).sort().forEach(function(path){
    var md=VAULT.split(VC.files[path].t);
    var title=path===QUICK_PRESETS?'Pikakirjauksen esiasetukset':VAULT.fmGet(md.fm,'otsikko')||VAULT.linkSlug(path);
    var b=button(list,title,'btn',function(){
      if(VC.q[path]){b.textContent='Odottaa synkronointia: '+title;return;}
      var current=VC.files[path];if(!current)return;
      var body=VAULT.split(current.t).body,n=VAULT.noteOf(path,current.t);
      n.text=body;
      n._vaultEdit={path:path,title:title,base:current.sha,prefix:current.t.slice(0,current.t.length-body.length)};
      closeSheet(d);openNote(n);
    });
    b.title=path;
  });
  openSheet(d);
}
function vSaveWorkFile(n,body){
  if(n.text.replace(/\r\n?/g,'\n')===body)return true;
  var file=n._vaultEdit,md=file.prefix+body,msg=$('ns-vmsg');
  if(!vOn()||VC.q[file.path]||(file.path===VREQUESTS&&vRequestText(md,[])===null)){
    msg.textContent=!vOn()?'GitHub-vault ei ole käytössä.':VC.q[file.path]?'Tiedoston aiempi muutos odottaa synkronointia.':'Säilytä pyyntötiedoston otsikot Avoimet ja Tehdyt.';
    msg.hidden=false;return false;
  }
  VC.q[file.path]={t:md,base:file.base,direct:true};
  vSaveC();vRender();vFlush();return true;
}
/* Asetukset: Valikko -> GitHub-vault */
function vRender(){$('vworkbtn').hidden=!vOn();$('quick-entry-mobile').hidden=$('quick-entry-desktop').hidden=!vOn();var s=$('gs-status');if(s)s.textContent=vStatus()+(vMsg?' · '+vMsg:'');document.querySelectorAll('.vref').forEach(function(rb){rb.hidden=!vOn();rb.classList.toggle('spin',vBusy);rb.classList.toggle('err',/Avain|oikeutta|löydy|virhee|yhteyttä/.test(vMsg));rb.setAttribute('aria-label','Päivitä GitHubista ('+vStatus()+')');});var qx=$('qx');if(qx)qx.hidden=vOn();var vw=vOn()&&(!!Object.keys(VC.q).length||/Avain|oikeutta|löydy|virhee/.test(vMsg));['menu','ghbtn','deskmenu'].forEach(function(id){var b=$(id);if(b)b.classList.toggle('vwait',vw);});var gb=$('ghbtn');if(gb)gb.setAttribute('aria-label','GitHub-vault: '+vStatus());}
/* 0.6.1 (Emil 22.11.2026): tietokoneella Valikkoa ei ole, joten GitHub-vault avautuu yläpalkin pilvinapista */
$('ghbtn').addEventListener('click',function(){openGh();});
function openGh(){$('gs-repo').value=G.repo;$('gs-tok').value=G.token;$('gs-msg').textContent='';vRender();openSheet($('gsheet'));}
$('vworkbtn').addEventListener('click',function(){openVWork(false);});
$('gs-save').addEventListener('click',function(){G.repo=$('gs-repo').value.trim();/* 0.2: avaimesta pois kaikki muu kuin kirjaimet, numerot, _ ja - (näkymättömät merkit liitettäessä kaatavat pyynnön) */G.token=$('gs-tok').value.replace(/[^A-Za-z0-9_-]/g,'');$('gs-tok').value=G.token;var m=$('gs-msg');m.textContent='Tarkistetaan…';
  vApi(vUrl('')).then(function(r){if(r.status!==200){m.textContent=vErr(r.status)+' (Repo: '+vRepo()+', avain '+G.token.length+' merkkiä.)';return;}
    if(!r.j.private){m.textContent='Repo on julkinen: kaikki näkisivät muistiinpanosi. Vaihda se yksityiseksi tai valitse toinen.';return;}
    G.branch=r.j.default_branch||'main';vSaveG();m.textContent='Yhteys toimii. '+r.j.full_name+' on yksityinen. Haetaan muistiinpanot…';
    vPull().then(function(ok){m.textContent=ok?'Valmis. Muistiinpanot haettu.':vMsg;if(ok)openPendingMetricLink();vCollect();});});});
$('gs-pull').addEventListener('click',function(){vPull().then(function(){vCollect();});});
$('gs-off').addEventListener('click',function(){G.token='';vSaveG();vRender();$('gs-tok').value='';$('gs-msg').textContent='Yhteys pois. Muistiinpanot jäävät tälle laitteelle.';});
var save0=save;save=function(){save0();vQueue();};
document.addEventListener('visibilitychange',function(){if(!vOn())return;if(document.visibilityState==='visible')vPull().then(function(){vCollect();});else{clearTimeout(vTimer);vCollect();}});
window.addEventListener('online',function(){if(vOn())vFlush();});
document.querySelectorAll('.vref').forEach(function(b){b.addEventListener('click',function(){vRefresh().then(function(ok){toast(ok?'Ajan tasalla '+vAt:(vMsg||'Päivitys ei onnistunut.'));});});});
function vStart(){
  vRender();
  if(vOn())vPull().then(function(ok){if(ok)openPendingMetricLink();vCollect();});
  else if(metricLinkText)toast('Yhdistä GitHub-vault, jotta voit tarkistaa mittarilinkin.');
}
/* 0.5: [[linkki]] -> muistiinpano (tiedostonimen mukaan koko vaultista), lukunäkymässä napautus avaa sen */
function vNoteOf(slug){slug=String(slug||'').toLowerCase();if(!slug)return null;var L=vNotes(),i;for(i=0;i<L.length;i++)if(L[i].vp&&VAULT.linkSlug(L[i].vp).toLowerCase()===slug)return L[i];
  for(i=0;i<L.length;i++)if(L[i].vp&&L[i].vp.replace(/\.md$/i,'').toLowerCase()===slug)return L[i];return null;}
/* Wikilinkkien hakemisto palvelee paikallista graafia ja takaisinlinkkejä. */
var vLinkCache=null;
function vLinkIndex(){
  var notes=vNotes(),signature=notes.map(function(n){
    return [n.id,n.vp,n.text,!!n.arch,!!n.vp&&VAULT.visible(n.vp)&&VAULT.kindOf(n.vp,n.vfm)!=='ohje'];
  });
  if(vLinkCache&&vLinkCache.signature.length===signature.length&&signature.every(function(s,i){
    return s.every(function(value,j){return value===vLinkCache.signature[i][j];})&&vLinkCache.notes[i]===notes[i];
  }))return vLinkCache;
  var slugs=new Map(),paths=new Map(),byId=new Map(),incoming=new Map(),outgoing=new Map();
  notes.forEach(function(note,i){
    if(!note.vp)return;
    var slug=VAULT.linkSlug(note.vp).toLowerCase(),path=note.vp.replace(/\.md$/i,'').toLowerCase();
    if(!slugs.has(slug))slugs.set(slug,note);
    if(!paths.has(path))paths.set(path,note);
    if(!signature[i][3]&&signature[i][4]){
      byId.set(note.id,note);incoming.set(note.id,new Set());outgoing.set(note.id,new Set());
    }
  });
  byId.forEach(function(note){
    var formulas=noteFormulaSpans(note.text);
    VAULT.links(note.text).forEach(function(link){
      if(formulas.some(function(f){return link.s>=f.start&&link.s<f.end;}))return;
      var key=link.slug.toLowerCase(),target=slugs.get(key)||paths.get(key);
      if(!target||target.id===note.id||!byId.has(target.id))return;
      outgoing.get(note.id).add(target.id);incoming.get(target.id).add(note.id);
    });
  });
  vLinkCache={signature:signature,notes:notes.slice(),byId:byId,incoming:incoming,outgoing:outgoing};
  return vLinkCache;
}
var graphState=null,graphCanvas=$('note-graph-canvas'),graphPointer=null;
function graphNeighbors(index,id){
  return new Set([...(index.outgoing.get(id)||[]),...(index.incoming.get(id)||[])]);
}
function graphOpen(note){
  var filter=$('note-graph-filter');filter.textContent='';
  function option(value,name){var o=el('option','',name);o.value=value;filter.appendChild(o);}
  option('','Kaikki linkit');
  nvViews().forEach(function(view){option(view.id,view.name);});
  graphState={root:note.id,selected:note.id,depth:1,zoom:1,x:0,y:0,positions:new Map()};
  openSheet($('note-graph'));graphBuild();
}
function graphBuild(){
  var state=graphState;if(!state||!$('note-graph').open)return;
  var index=vLinkIndex(),root=index.byId.get(state.root),view=nvViews().find(function(v){return v.id===$('note-graph-filter').value;});
  state.index=index;
  var nodes=new Map(),level=[state.root];
  if(root){
    nodes.set(state.root,0);
    for(var depth=1;depth<=state.depth;depth++){
      var next=[];
      level.forEach(function(id){graphNeighbors(index,id).forEach(function(neighbor){
        if(nodes.has(neighbor)||view&&!nvPass(view,index.byId.get(neighbor)))return;
        nodes.set(neighbor,depth);next.push(neighbor);
      });});
      level=next;
    }
  }
  state.count=nodes.size;state.nodes=new Map(Array.from(nodes).slice(0,72));
  if(!state.nodes.has(state.selected))state.selected=state.root;
  $('note-graph-depth1').setAttribute('aria-pressed',String(state.depth===1));
  $('note-graph-depth2').setAttribute('aria-pressed',String(state.depth===2));
  var list=$('note-graph-list');list.textContent='';
  if(state.count>72)list.appendChild(el('p','sub','Näytetään 72 / '+state.count+' muistiinpanoa.'));
  state.nodes.forEach(function(depth,id){
    if(!depth)return;
    var note=index.byId.get(id),b=button(list,noteTitle(note)||'Nimetön','mini',function(){graphSelect(id);});
    b.dataset.noteId=id;b.setAttribute('aria-pressed',String(id===state.selected));
    b.addEventListener('dblclick',function(){graphGo(id);});
  });
  graphSelect(state.selected);
}
function graphSelect(id){
  var state=graphState;if(!state)return;
  state.selected=id;
  var note=state.index.byId.get(id),links=graphNeighbors(state.index,id).size;
  $('note-graph-preview').textContent=note?(noteTitle(note)||'Nimetön')+' · '+links+(links===1?' yhteys':' yhteyttä'):'Muistiinpano ei ole enää näkyvissä.';
  $('note-graph-open').disabled=!note||id===state.root;
  $('note-graph-list').querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.noteId===id));});
  graphDraw();
}
function graphGo(id){
  if(!graphState||id===graphState.root)return;
  var note=vLinkIndex().byId.get(id);
  if(!note){graphBuild();return;}
  closeSheet($('note-graph'));
  if($('nsheet').open)$('ns-ok').click();
  if(!$('nsheet').open)openNote(note);
}
function graphDraw(){
  var state=graphState,canvas=graphCanvas;if(!state||!$('note-graph').open)return;
  var width=canvas.clientWidth,height=canvas.clientHeight,ratio=Math.min(window.devicePixelRatio||1,2);
  if(!width||!height)return;
  if(canvas.width!==Math.round(width*ratio))canvas.width=Math.round(width*ratio);
  if(canvas.height!==Math.round(height*ratio))canvas.height=Math.round(height*ratio);
  var ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  ctx.translate(width/2+state.x,height/2+state.y);ctx.scale(state.zoom,state.zoom);
  var colors=getComputedStyle(canvas),accent=colors.getPropertyValue('--accent').trim(),label=colors.getPropertyValue('--label').trim();
  var positions=new Map(),index=state.index,radius=Math.min(width,height)/2-27;
  var first=[],second=[];
  state.nodes.forEach(function(depth,id){if(!depth)positions.set(id,{x:0,y:0});else (depth===1?first:second).push(id);});
  function ring(ids,factor){
    ids.forEach(function(id,i){
      var angle=(2*Math.PI*i/ids.length)-Math.PI/2;
      positions.set(id,{x:Math.cos(angle)*radius*factor,y:Math.sin(angle)*radius*factor});
    });
  }
  ring(first,second.length?.58:.82);ring(second,.94);state.positions=positions;
  ctx.strokeStyle=label;ctx.globalAlpha=.31;ctx.lineWidth=1;
  positions.forEach(function(p,id){
    index.outgoing.get(id).forEach(function(other){
      var target=positions.get(other);if(!target)return;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(target.x,target.y);ctx.stroke();
    });
  });
  ctx.globalAlpha=1;ctx.font='12px system-ui';ctx.textAlign='center';ctx.textBaseline='top';
  positions.forEach(function(p,id){
    var note=index.byId.get(id),kind=VAULT.kindOf(note.vp,note.vfm),selected=id===state.selected;
    p.r=id===state.root?9:Math.min(9,4+Math.sqrt(graphNeighbors(index,id).size));
    ctx.fillStyle=id===state.root?accent:kind==='yhdessa'?colors.getPropertyValue('--srcy').trim():kind==='tekoaly'?colors.getPropertyValue('--srcai').trim():label;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,2*Math.PI);ctx.fill();
    if(selected){ctx.strokeStyle=accent;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,p.r+4,0,2*Math.PI);ctx.stroke();}
    if(selected||id===state.root||positions.size<=9){
      var title=noteTitle(note)||'Nimetön';ctx.fillStyle=label;
      ctx.fillText(title.length>25?title.slice(0,24)+'…':title,p.x,p.y+p.r+4,135);
    }
  });
}
function graphZoom(factor){
  if(!graphState)return;
  graphState.zoom=Math.max(.55,Math.min(3,graphState.zoom*factor));graphDraw();
}
function graphHit(event){
  var state=graphState,r=graphCanvas.getBoundingClientRect(),hit=null,distance=Infinity;
  state.positions.forEach(function(p,id){
    var d=Math.hypot(event.clientX-r.left-r.width/2-state.x-p.x*state.zoom,
      event.clientY-r.top-r.height/2-state.y-p.y*state.zoom);
    if(d<=Math.max(12,p.r*state.zoom+4)&&d<distance){hit=id;distance=d;}
  });
  return hit;
}
$('note-graph-depth1').addEventListener('click',function(){graphState.depth=1;graphBuild();});
$('note-graph-depth2').addEventListener('click',function(){graphState.depth=2;graphBuild();});
$('note-graph-filter').addEventListener('change',graphBuild);
$('note-graph-open').addEventListener('click',function(){graphGo(graphState.selected);});
$('note-graph-plus').addEventListener('click',function(){graphZoom(1.2);});
$('note-graph-minus').addEventListener('click',function(){graphZoom(1/1.2);});
$('note-graph-reset').addEventListener('click',function(){
  graphState.zoom=1;graphState.x=graphState.y=0;graphDraw();
});
$('note-graph').addEventListener('close',function(){graphState=null;graphPointer=null;});
window.addEventListener('resize',graphDraw);
graphCanvas.addEventListener('wheel',function(event){
  if(!graphState||event.ctrlKey||event.metaKey)return;
  event.preventDefault();graphZoom(event.deltaY>0?1/1.12:1.12);
},{passive:false});
graphCanvas.addEventListener('pointerdown',function(event){
  if(!graphState||event.button!==0||graphPointer)return;
  graphPointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:graphState.x,startY:graphState.y,moved:false};
  graphCanvas.setPointerCapture(event.pointerId);
});
graphCanvas.addEventListener('pointermove',function(event){
  var drag=graphPointer;if(!graphState||!drag||event.pointerId!==drag.id)return;
  var dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  drag.moved=true;graphState.x=drag.startX+dx;graphState.y=drag.startY+dy;graphDraw();
});
graphCanvas.addEventListener('pointerup',function(event){
  var drag=graphPointer;if(!graphState||!drag||event.pointerId!==drag.id)return;
  graphPointer=null;if(drag.moved)return;
  var hit=graphHit(event);if(hit)graphSelect(hit);
});
graphCanvas.addEventListener('lostpointercapture',function(){graphPointer=null;});
graphCanvas.addEventListener('dblclick',function(event){var hit=graphHit(event);if(hit)graphGo(hit);});

function vTitleOf(slug){var N=vNoteOf(slug);return N?noteTitle(N):'';}
function vLinkTap(ev,x,y){var ta=$('ns-text');if(!ta.readOnly)return false;var c=hlOffsetAt(x,y);if(c<0)return false;
  var MV=mvAt(c);if(MV){ev.preventDefault();ev.stopImmediatePropagation();if(document.activeElement===ta)ta.blur();tmPop({mv:MV},y,c);return true;}
  if(noteFormulaSpans(ta.value).some(function(f){return c>=f.start&&c<f.end;}))return false;
  var L=VAULT.links(ta.value).filter(function(l){return c>=l.s&&c<l.e;})[0];if(!L)return false;var N=vNoteOf(L.slug);
  ev.preventDefault();ev.stopImmediatePropagation();if(!N){toast('Muistiinpanoa ”'+L.slug+'” ei löydy (ehkä piilotettu tai arkistoitu).');return true;}
  openNote(N);return true;}
var vLT=null;
$('ns-text').addEventListener('touchstart',function(ev){var t=ev.touches[0];vLT=ev.touches.length===1?{x:t.clientX,y:t.clientY,at:Date.now()}:null;},{passive:true,capture:true});
$('ns-text').addEventListener('touchmove',function(ev){if(!vLT)return;var t=ev.touches[0];if(Math.abs(t.clientX-vLT.x)>8||Math.abs(t.clientY-vLT.y)>8)vLT=null;},{passive:true,capture:true});
$('ns-text').addEventListener('touchend',function(ev){var T=vLT;vLT=null;if(!T||Date.now()-T.at>600)return;vLinkTap(ev,T.x,T.y);},{passive:false,capture:true});
$('ns-text').addEventListener('click',function(ev){vLinkTap(ev,ev.clientX,ev.clientY);},true);
window.KaikkiTesti={lsSync:function(){return lsSync();},reps:function(){return data.reps;},chk:function(){return data.chk;},lists:function(){return data.lists;},vault:function(){return VC;},gh:function(){return G;},pull:function(){return vPull();},collect:function(){clearTimeout(vTimer);vCollect();},flush:function(){return vFlush();},notes:function(){return vNotes();},status:function(){return vStatus();},src:function(k){setSrc(k);},refresh:function(){return vRefresh();},render:function(){render();},tz:function(v){if(v==null)delete data.cfg.tz;else data.cfg.tz=v;applyCfg();render();}};
window.JuuriTesti={setListView:function(v){if(v==='r')oldOn();setListView(v);},listView:function(){return listView();},old:function(){oldOn();render();}};
function oldOn(){OLDUI=true;try{localStorage.setItem('kaikki:vanhat','1');}catch(e){}document.body.classList.add('oldui');}
function setListView(v){lstV=v==='r'||v==='w'?v:'g';lwSel=false;try{localStorage.setItem('kaikki:listview',lstV);}catch(e){}lwOpen=null;chkOpen={};chkFreeze=null;main.scrollTop=0;render();}
function dm(iso){var d=fromIso(iso);return d.getDate()+'.'+(d.getMonth()+1)+'.';}
/* Pikamuistiinpanot: {it: asiasana, r?: listan rivi}; päivät ovat tekstissä (teksti on totuus) */
function pikaNotes(rid){return data.notes.filter(function(N){return N.pika&&(N.pika.r||'')===(rid||'')&&!N.arch;});}
function pikaDays(N){return Object.keys(dayTextDays(N.text,new Date(N.created||Date.now()),N.nl)).sort();}
function rowPika(r){var out=[];pikaNotes(r.id).forEach(function(N){pikaDays(N).forEach(function(iso){out.push({it:N.pika.it,iso:iso,done:N.done||(N.pts&&N.pts[iso])||null,nid:N.id});});});return out;}
/* Muistiinpanot, joissa mainitaan rivin nimi, ja rivin oma teksti: yksittäiset päivät viikoittain */
function rowNoteDays(r,m0,today){var out=[],nm=clean(r.name||'');if(!nm&&!r.nid)return out;var t0=m0,t1=isoD(addDays(fromIso(m0),7*NW));
  data.notes.forEach(function(N){if(N.pika||gone(N,today))return;if(N.id!==r.nid&&!(nm&&hasWord(N.text,nm)))return;
    noteDates(N).forEach(function(x){if(!plain(x)||x.R[0]!==x.R[1])return;var iso=x.R[0],key=occKey(iso,x);if(iso>=t1)return;var dn=ptDone(N,key);if(iso<t0&&dn)return;
      out.push({N:N,iso:iso,key:key,time:x.time&&x.time.s?x.time.s:'',done:dn});});});return out;}
function lwToggleItem(r,id,v){var x=(r.it||[]).filter(function(y){return y.id===id;})[0];if(!x){x={id:id};if(v&&v.t)x.t=1;if(v&&v.g)x.g=1;r.it=(r.it||[]).concat([x]);}return x;}
/* 1.105 (Emil 18.11.2026): Viikot kuten Mätsikissä. Rivi on kortti: nimi lihavoituna, tärkein avoin asia ja +N, alla viikkoruudut
   (viikkonumero ja avointen määrä), jotka vierivät sivuttain yhdessä. Kortin reunaviiva: punainen = avointa tällä viikolla, keltainen = tulossa.
   Ruutu: punainen = avointa tällä viikolla, keltainen = tulossa, ohut reuna = vain muistiinpanoja, vihreä = kuitattu, katkoviiva = ei mitään.
   Viikon napautus avaa sen asiat ikkunaan päälle; ulkopuolinen napautus sulkee. */
function lwWeeks(r,cx,now,today,m0){var W=wkRow(r,cx,now,today,rowPika(r),NW),ND=rowNoteDays(r,m0,today);
  ND.forEach(function(x){var k=wkIdx(m0,x.iso);if(k<0){k=0;}if(k>=NW)return;var o={k:'n',N:x.N,iso:x.iso,key:x.key,time:x.time};if(x.done)o.ok=x.done;else if(x.iso<today)o.late=x.iso;W[k].it.push(o);if(x.done)W[k].d++;else W[k].n++;});
  return W;}
function rkv(rk,id){var v=rk[id];return v===undefined?1e5:v;}
function lwRkOf(rk,e){return e.k==='n'?1e6:rkv(rk,e.id);}
function lwTop(w,rk){return w.it.filter(function(e){return !e.ok;}).sort(function(a,b){return lwRkOf(rk,a)-lwRkOf(rk,b)||((a.iso||a.due||'')<(b.iso||b.due||'')?-1:1);});}
function lwName(e){return e.k==='n'?(calTitle(e.N)||'(muistiinpano)'):itemName(e.id);}
function lwTone(w,k){if(w.n){if(k===0)return 'red';return w.it.every(function(e){return e.ok||e.k==='n';})?'inf':'yel';}return w.d?'ok':'';}
function rowNm(r){var N0=noteOf(r);return r.name||(N0?partTitle(N0,r.pi):'')||'(nimetön)';}
function renderWeeks(p,ROWS,CX,rk,today,now){var m0=monOf(today),wrap=el('div','lwv');wrap.id='lwk';var tin=el('div','lwin');wrap.appendChild(tin);
  if(!ROWS.length){p.appendChild(subI('Ei vielä rivejä.','+ oikeassa alakulmassa lisää rivin. Rivin asiat tulevat listan tarkistuskohteista (Lista ⌄).'));lwPopHide();return;}
  var OPEN=null;
  ROWS.forEach(function(r){var cx=CX[r.id],W=lwWeeks(r,cx,now,today,m0),nm=rowNm(r),T=lwTop(W[0],rk),later=W.slice(1).some(function(w){return w.n;});
    var card=el('div','lwr'+(W[0].n?' crit':later?' warn':''));card.dataset.id=r.id;
    var nb=el('button','lwn');nb.type='button';nb.appendChild(el('b','',nm));nb.appendChild(el('span','',T.length?lwName(T[0]):'Kunnossa'));nb.appendChild(el('small','',T.length>1?'+'+(T.length-1):''));
    nb.setAttribute('aria-label','Rivin ikkuna: '+nm);nb.addEventListener('click',function(){openChk(r);});card.appendChild(nb);
    var cs=el('div','lwcs');W.forEach(function(w,k){var tn=lwTone(w,k),on=!!(lwOpen&&!lwOpen.g&&lwOpen.r===r.id&&lwOpen.k===k),wk=isoWeekNo(fromIso(w.mon)),b=el('button','lwc'+(tn?' '+tn:'')+(k===0?' cur':''));
      b.type='button';b.dataset.w=String(k);b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',nm+', vk '+wk+': '+(w.n?w.n+' avoinna':w.d?'kuitattu':'ei mitään'));
      b.appendChild(el('b','',String(wk)));if(w.n)b.appendChild(el('small','',String(w.n)));
      b.addEventListener('click',function(ev){ev.stopPropagation();lwOpen={r:r.id,k:k,keep:{}};render();});cs.appendChild(b);if(on)OPEN={r:r,cx:cx,w:w,k:k};});
    card.appendChild(cs);tin.appendChild(card);});
  p.appendChild(wrap);wrap.scrollLeft=lwX;wrap.addEventListener('scroll',function(){lwX=wrap.scrollLeft;},{passive:true});
  if(OPEN){var mon=fromIso(OPEN.w.mon),sun=addDays(mon,6);lwPopShow(weekPanel(OPEN.r,OPEN.cx,OPEN.w,OPEN.k,rk,today,{head:rowNm(OPEN.r)+' · Vk '+isoWeekNo(mon)+' · '+mon.getDate()+'.'+(mon.getMonth()+1)+'.–'+sun.getDate()+'.'+(sun.getMonth()+1)+'.'}),'Viikon asiat','w'+OPEN.r.id+OPEN.k);}else lwPopHide();}
/* 1.105 (Emil 18.11.2026): Ruudut. Rivit ruutuina kaksi rinnakkain, aina samassa paikassa. Väri kertoo kiireen (sävy) ja painoarvon (voimakkuus):
   heti = avointa tällä viikolla (myöhässä tai erääntyy), voimakkuus tärkeimmän avoimen asian sijasta rivin asioiden tärkeysjärjestyksessä
   (ylin kolmannes vahvin); tulossa = ensi viikolla; kunnossa; ei asioita. Napautus avaa ikkunan: heti tarkistettavat OK:lla, Myöhemmin,
   Päivä (pikapäivät tälle riville), Valitse asiat (rivin poissulku) ja rivin teksti. Ruudun väri ja teksti päivittyvät, kun ikkuna suljetaan. */
var lwSel=false;
function lwRank(r,cx,now,rk){return chkItems(r,cx,now).map(function(v){return v.id;}).sort(function(a,b){return rkv(rk,a)-rkv(rk,b);});}
function tileTone(W,ids,rk){var T=lwTop(W[0],rk);if(T.length){var t=T[0];if(t.k==='n')return 'hot1';var i=ids.indexOf(t.id),n=Math.max(ids.length,1);if(i<0)return 'hot1';return i<n/3?'hot3':i<2*n/3?'hot2':'hot1';}
  if(W[1]&&W[1].n)return 'soon';if(ids.length||W.some(function(x){return x.n||x.d;}))return 'ok';return 'none';}
function renderTiles(p,ROWS,CX,rk,today,now){var m0=monOf(today),g=el('div','rtg');g.id='rtiles';var OPEN=null;
  if(!ROWS.length){p.appendChild(subI('Ei vielä rivejä.','+ oikeassa alakulmassa lisää rivin. Rivin asiat tulevat listan tarkistuskohteista (Lista ⌄).'));lwPopHide();return;}
  ROWS.forEach(function(r){var cx=CX[r.id],W=lwWeeks(r,cx,now,today,m0),ids=lwRank(r,cx,now,rk),on=!!(lwOpen&&lwOpen.g&&lwOpen.r===r.id),nm=rowNm(r),S;
    if(on&&lwOpen.snap)S=lwOpen.snap;else{var T=lwTop(W[0],rk),nx=null;for(var k=1;k<W.length;k++)if(W[k].n){nx=W[k];break;}var tn=tileTone(W,ids,rk);
      S={tn:tn,top:T.length?lwName(T[0])+(T.length>1?' +'+(T.length-1):''):'',bt:T.length?T.length+' heti':nx?'seur. vk '+isoWeekNo(fromIso(nx.mon)):tn==='none'?'ei asioita':'kunnossa'};if(on)lwOpen.snap=S;}
    var b=el('button','rtile t-'+S.tn+(on?' sel':''));b.type='button';b.dataset.id=r.id;b.dataset.tone=S.tn;b.appendChild(el('b','',nm));b.appendChild(el('span','rtop',S.top));b.appendChild(el('span','rbt',S.bt));
    b.setAttribute('aria-label',nm+': '+S.bt+(S.top?', '+S.top:''));
    b.addEventListener('click',function(){lwOpen={r:r.id,g:1,keep:{}};lwSel=false;render();});g.appendChild(b);if(on)OPEN={r:r,cx:cx,W:W};});
  p.appendChild(g);
  if(OPEN)lwPopShow(tilePanel(OPEN.r,OPEN.cx,OPEN.W,rk,today,now),'Rivin asiat','g'+OPEN.r.id);else lwPopHide();}
function tilePanel(r,cx,W,rk,today,now){var TK=rowTk(r),nm=rowNm(r),pv=jatL(curList());
  if(lwSel&&TK){var pn=el('div','lwx rtx');pn.id='lwx';var hd=el('div','lwxh rth');hd.appendChild(el('b','',nm));var sb=button(hd,'Valmis','pklink',function(ev){ev.stopPropagation();lwSel=false;render();});sb.id='rt-sel';pn.appendChild(hd);
    var E={};(r.ei||[]).forEach(function(id){E[id]=1;});
    if(!TK.length)pn.appendChild(subI('Listalla ei ole tarkistuskohteita.','Tarkistuskohteet valitaan Lista ⌄ -ikkunasta.','sub lwnone'));
    TK.slice().sort(function(a,b){return rkv(rk,a)-rkv(rk,b);}).forEach(function(id){var line=el('div','lwe'+(E[id]?' off':''));line.dataset.id=id;var tb=el('span','lwt');tb.appendChild(el('span','t',itemName(id)));tb.appendChild(el('small','',E[id]?'ei tällä rivillä':'mukana'));line.appendChild(tb);
      var cb=el('button','rtchk');cb.type='button';cb.dataset.id=id;cb.setAttribute('aria-pressed',E[id]?'false':'true');cb.setAttribute('aria-label','Mukana: '+itemName(id));
      cb.addEventListener('click',function(ev){ev.stopPropagation();var L=(r.ei||[]).filter(function(x){return x!==id;});if(!E[id])L.push(id);if(L.length)r.ei=L;else delete r.ei;r.edited=nowIso();lwOpen.snap=null;touch();render();});line.appendChild(cb);pn.appendChild(line);});
    return pn;}
  var pn2=weekPanel(r,cx,W[0],0,rk,today,{head:nm,sel:TK?function(){lwSel=true;render();}:null,pv:pv,none:'Ei heti tarkistettavaa.'});pn2.classList.add('rtx');
  /* Myöhemmin: kuitatut asiat seuraavan erääntymisen mukaan ja tulevat pikapäivät, tärkeysjärjestyksessä */
  var shown={};W[0].it.forEach(function(e){if(e.k==='i')shown[e.id]=1;});var LT=[];
  chkItems(r,cx,now).forEach(function(v){if(shown[v.id]||!v.ok)return;var ev=v.x?evOf(v.x,cx):0,t=renewAt(v.x.ok,ev),T0=termOf(v.id);
    LT.push({id:v.id,k:'i',sub:t<Infinity?'erääntyy vk '+isoWeekNo(new Date(t))+' ('+dm(isoD(new Date(t)))+')':(termOnce(v.id)?'tehty kerran ':'kuitattu ')+dm(isoD(new Date(v.x.ok)))});});
  W.slice(1).forEach(function(w){w.it.forEach(function(e){if(e.k==='p'&&!e.ok)LT.push({id:e.id,k:'p',sub:'pikapäivä '+WDS[fromIso(e.iso).getDay()]+' '+dm(e.iso)});});});
  LT.sort(function(a,b){return rkv(rk,a.id)-rkv(rk,b.id);});
  if(LT.length){pn2.appendChild(el('div','lwxh rtlat','Myöhemmin'));LT.forEach(function(x){var line=el('div','lwe later');line.dataset.id=x.id;var tb=el('button','lwt');tb.type='button';tb.appendChild(el('span','t',itemName(x.id)));tb.appendChild(el('small','',x.sub));
    tb.addEventListener('click',function(){openChk(r);});line.appendChild(tb);if(pv){var pb=button(line,'Päivä','mini rtpv',function(ev){ev.stopPropagation();pkRow=r.id;pikaPick(x.id);});pb.setAttribute('aria-label','Pikapäivät: '+itemName(x.id));}line.appendChild(el('span','okgap'));pn2.appendChild(line);});}
  /* Rivin oma teksti: luku ensin, napautus avaa rivin ikkunan */
  var N0=noteOf(r),tx=el('button','rttx');tx.type='button';tx.id='rt-text';tx.appendChild(el('small','','Teksti'));tx.appendChild(el('span','',N0?clean(N0.text).slice(0,220):'Ei tekstiä'));if(!N0)tx.classList.add('empty');
  tx.addEventListener('click',function(){openChk(r);});tx.setAttribute('aria-label','Rivin teksti ja asetukset');pn2.appendChild(tx);
  return pn2;}
/* Ikkuna päälle (Listojen Viikot ja Ruudut): alareunan arkki, ulkopuolinen napautus sulkee eikä tee muuta. Ei ruksia. */
function lwPopShow(node,lab,key){var o=$('lwpop');if(!o){o=el('div','lwpbg');o.id='lwpop';document.body.appendChild(o);
    o.addEventListener('click',function(ev){if(ev.target!==o)return;ev.preventDefault();ev.stopPropagation();lwOpen=null;lwSel=false;lwPopHide();render();});}
  var d0=o.firstChild,st=d0&&o._key===key?d0.scrollTop:0;o.textContent='';var d=el('div','lwpd');d.setAttribute('role','dialog');d.setAttribute('aria-label',lab);d.appendChild(node);o.appendChild(d);o.hidden=false;o._key=key;d.scrollTop=st;}
function lwPopHide(){var o=$('lwpop');if(o&&!o.hidden){o.hidden=true;o.textContent='';o._key=null;}}
function weekPanel(r,cx,w,k,rk,today,opt){opt=opt||{};var pn=el('div','lwx'),mon=fromIso(w.mon),sun=addDays(mon,6);pn.id='lwx';
  var hd=el('div','lwxh rth');hd.appendChild(el('b','',opt.head||('Vk '+isoWeekNo(mon)+' · '+mon.getDate()+'.'+(mon.getMonth()+1)+'.–'+sun.getDate()+'.'+(sun.getMonth()+1)+'.')));
  if(opt.sel){var sb=button(hd,'Valitse asiat','pklink',function(ev){ev.stopPropagation();opt.sel();});sb.id='rt-sel';}pn.appendChild(hd);
  var keep=lwOpen.keep,L=w.it.slice(),seen={};L.forEach(function(e){seen[e.k+'|'+e.id+'|'+(e.iso||'')+'|'+(e.key||'')]=1;});
  Object.keys(keep).forEach(function(q){if(!seen[q])L.push(keep[q]);});
  function rkOf(e){if(e.k==='n')return 1e6;var v=rk[e.id];return v===undefined?1e5:v;}
  L.sort(function(a,b){var x=rkOf(a),y=rkOf(b);if(x!==y)return x-y;var p=a.iso||a.due||'',q=b.iso||b.due||'';return p<q?-1:p>q?1:0;});
  if(!L.length)pn.appendChild(el('p','sub lwnone',opt.none||'Ei mitään tällä viikolla.'));
  L.forEach(function(e){var q=e.k+'|'+e.id+'|'+(e.iso||'')+'|'+(e.key||''),line=el('div','lwe'+(e.ok?' done':'')),nm,sub;line.dataset.k=e.k;line.dataset.id=e.k==='n'?e.N.id:e.id;
    if(e.k==='n'){nm=calTitle(e.N)||'(muistiinpano)';sub=WDS[fromIso(e.iso).getDay()]+' '+dm(e.iso)+(e.time?' klo '+fmtTime(e.time):'')+(e.late&&!e.ok?' · myöhässä':'');}
    else if(e.k==='p'){nm=itemName(e.id);sub='pikapäivä '+WDS[fromIso(e.iso).getDay()]+' '+dm(e.iso)+(e.late&&!e.ok?' · myöhässä':'');}
    else{nm=itemName(e.id);var once=termOnce(e.id);sub=e.ok?'kuitattu '+dm(isoD(new Date(e.ok))):e.due?'uusiutuu '+WDS[fromIso(e.due).getDay()]+' '+dm(e.due):once?'kerran':e.late?'myöhässä '+dm(e.late):'kuittaamatta';}
    var tb=el('button','lwt');tb.type='button';tb.appendChild(el('span','t',nm));tb.appendChild(el('small','',sub));
    if(e.k!=='i'){var NN=e.N||data.notes.filter(function(n){return n.id===e.nid;})[0];if(NN)tb.addEventListener('click',function(){openNote(NN,null,e.key||e.iso);});else tb.disabled=true;}
    else tb.addEventListener('click',function(){openChk(r);});
    line.appendChild(tb);
    if(opt.pv&&e.k!=='n'){var pb=button(line,'Päivä','mini rtpv',function(ev){ev.stopPropagation();pkRow=r.id;pikaPick(e.id);});pb.setAttribute('aria-label','Pikapäivät: '+nm);}
    /* 1.109: asian Flow rivikohtaisesti; ei pakollinen. Punainen, kun asia on tarkistettavana; vihreä, kun kuljettu loppuun (OK kuitataan silti erikseen) */
    if(e.k!=='n'&&stById(flData().m[e.id])){var gr=flGreen(r,e.id),fb=button(line,'Flow','mini rtfl'+(gr?' green':e.ok?'':' due'),function(ev){ev.stopPropagation();flOpen(r,e.id);});fb.dataset.fl=e.id;fb.setAttribute('aria-pressed',gr?'true':'false');fb.setAttribute('aria-label','Flow: '+nm+(gr?' (valmis)':''));}
    var ob=button(line,e.ok?'Kuitattu':'OK','mini okbtn',function(ev){ev.stopPropagation();lwOk(r,cx,e,q,today);});ob.setAttribute('aria-pressed',e.ok?'true':'false');ob.setAttribute('aria-label',(e.ok?'Peru kuittaus: ':'Kuittaa: ')+nm);
    pn.appendChild(line);});
  return pn;}
/* OK: asia kuitataan riville (väli alkaa alusta). Pikapäivä kuitataan kalenterissa samoin kuin muistiinpanon päivä, ja se aloittaa saman asian välin
   alusta, jos asia on rivillä. Muistiinpanon päivä = kalenterin kuittaus. Uusi napautus palauttaa entisen. */
function lwOk(r,cx,e,q,today){var keep=lwOpen.keep,K=keep[q],now=nowIso();
  function itemSet(id,undo){var V=chkItems(r,cx,new Date()).filter(function(v){return v.id===id;})[0];if(!V&&!undo)return null;var x=lwToggleItem(r,id,V);var prev=x.ok||null;if(undo){if(undo.prev)x.ok=undo.prev;else delete x.ok;}else x.ok=now;r.edited=now;return prev;}
  if(e.ok&&K){/* peruutus */
    if(e.k==='i')itemSet(e.id,{prev:K.prev});
    else{var N=e.N||data.notes.filter(function(n){return n.id===e.nid;})[0],key=e.key||e.iso;if(N&&N.pts){delete N.pts[key];if(!Object.keys(N.pts).length)delete N.pts;}if(e.k==='p'&&K.iprev!==undefined)itemSet(e.id,{prev:K.iprev});}
    delete keep[q];touch();render();return;}
  if(e.ok){/* kuitattu jo aiemmin: peru */
    if(e.k==='i'){var x=(r.it||[]).filter(function(y){return y.id===e.id;})[0];if(x)delete x.ok;}
    else{var N2=e.N||data.notes.filter(function(n){return n.id===e.nid;})[0],k2=e.key||e.iso;if(N2&&N2.pts){delete N2.pts[k2];if(!Object.keys(N2.pts).length)delete N2.pts;}}
    touch();render();return;}
  var o={};for(var f in e)o[f]=e[f];o.ok=now;
  if(e.k==='i'){o.prev=itemSet(e.id);}
  else{var N3=e.N||data.notes.filter(function(n){return n.id===e.nid;})[0],k3=e.key||e.iso;if(N3){(N3.pts||(N3.pts={}))[k3]=now;}if(e.k==='p'){var ip=itemSet(e.id);if(ip!==null)o.iprev=ip;}}
  keep[q]=o;touch();render();}
/* Ulkopuolinen napautus sulkee avatun viikon eikä tee muuta (Mätsik 1.5) */
document.addEventListener('click',function(ev){if(!lwOpen)return;var t=ev.target;if(!t||!t.closest||!main.contains(t))return;if(t.closest('.lwx,.lwc,.ib'))return;
  ev.preventDefault();ev.stopPropagation();lwOpen=null;render();},true);
/* Pikamuistiinpano (Mätsik 1.6–1.8, 1.14): rivi (jos listalla on rivejä) ja asia, jonka jälkeen kuukausivalitsin. Yksi muistiinpano riviä ja asiaa kohden:
   ”Kettu Lääkkeet 18.11.2026, 25.11.2026”. 1.108: napit ovat listan tarkistuskohteet. ”+ Uusi” lisää asiasanan listan tarkistuskohteeksi. */
var pkRow=null,pkNew=false;
function openPika(rid){pkRow=rid===undefined?pkRow:rid;pkNew=false;renderPika();openSheet($('pksheet'));}
function pikaRows(){var L=curList(),lid=jatL(L)&&L?L.id:null;return data.chk.filter(function(r){return (r.l||null)===lid&&!r.mu;});}
function pikaNote(rid,tid){return data.notes.filter(function(N){return N.pika&&N.pika.it===tid&&(N.pika.r||'')===(rid||'');})[0]||null;}
function pikaPrefix(rid,tid){var r=data.chk.filter(function(x){return x.id===rid;})[0];return ((r&&r.name?r.name+' ':'')+itemName(tid)).trim();}
function pikaPick(tid){var rid=pkRow||'',pre=pikaPrefix(rid,tid);
  dsOpen({base:new Date(),nl:null,get:function(){var N=pikaNote(rid,tid);return N?N.text:pre;},
    set:function(t){var N=pikaNote(rid,tid),now=nowIso();if(!N){N={id:uid('n'),created:now,edited:now,text:t,date:'',pika:{it:tid}};if(rid)N.pika.r=rid;data.notes.unshift(N);}else noteWrite(N,t,now);
      if(!Object.keys(dayTextDays(t,new Date(N.created),N.nl)).length&&clean(t)===clean(pre))data.notes=data.notes.filter(function(x){return x!==N;});touch();}});}
function renderPika(){var b=$('pika-body'),R=pikaRows(),T=pikaTerms();b.textContent='';if(pkRow&&!R.some(function(r){return r.id===pkRow;}))pkRow=null;
  if(vOn()&&vK()&&vK().id===data.k)button(b,'Muuttujat','mini',function(){openQuickEntry('muuttujat');});
  if(R.length){var h=el('div','pkl');h.appendChild(el('b','','Rivi'));if(!pkRow)h.appendChild(el('span','pkhint','valitse ensin rivi'));b.appendChild(h);
    var rw=el('div','pkchips');rw.id='pika-rows';R.forEach(function(r){var on=pkRow===r.id,c=button(rw,r.name||'(nimetön)','mini',function(){pkRow=on?null:r.id;renderPika();});c.dataset.r=r.id;c.setAttribute('aria-pressed',on?'true':'false');});b.appendChild(rw);}
  var h2=el('div','pkl');h2.appendChild(el('b','','Asia'));h2.appendChild(ib('Napit ovat listan tarkistuskohteet Asioiden järjestyksessä; himmeät valittu rivi on jättänyt pois. + Uusi lisää listaan uuden tarkistuskohteen. Napautus avaa kuukauden: päivän napautus lisää sen muistiinpanoon, toinen napautus poistaa. Päivät näkyvät kalenterissa ja Viikoissa tarkistettavina.'));b.appendChild(h2);
  var aw=el('div','pkchips');aw.id='pika-items';var need=R.length&&!pkRow;
  T.forEach(function(t){var off=pikaOff(t.id),c=button(aw,t.name,'mini',function(){if(need||off)return;pikaPick(t.id);});c.dataset.t=t.id;c.setAttribute('aria-disabled',need||off?'true':'false');});
  if(pkNew){var w=el('span','pknew'),i=el('input');i.type='text';i.id='pika-newin';i.placeholder='Uusi asia';i.autocomplete='off';i.setAttribute('enterkeyhint','done');w.appendChild(i);
    var go=function(){var n=clean(i.value).slice(0,60);pkNew=false;if(!n){renderPika();return;}var ex=data.terms.filter(function(t){return keyOf(t.name)===keyOf(n);})[0];
      if(!ex){ex={id:uid('t'),name:n,yes:[],no:[]};data.terms.push(ex);termCache=null;}tkSet(pikaLid(),ex.id,true);touch();renderPika();};
    i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();go();}});button(w,'Lisää','mini',go).id='pika-newok';aw.appendChild(w);setTimeout(function(){try{i.focus({preventScroll:true});}catch(e){}},0);}
  else{var nb=button(aw,'+ Uusi','pklink',function(){pkNew=true;renderPika();});nb.id='pika-new';}
  b.appendChild(aw);
  /* Valitun rivin pikapäivät kiinteän korkuisessa laatikossa (ei pomppimista) */
  var lb=el('div','pkdates');lb.id='pika-dates';var NS=pikaNotes(pkRow||'');
  NS.forEach(function(N){var D=pikaDays(N);if(!D.length)return;var rb=el('button','pkd');rb.type='button';rb.dataset.t=N.pika.it;rb.appendChild(el('b','',itemName(N.pika.it)));
    var ds=el('span','pkds');D.forEach(function(iso,i){if(i)ds.appendChild(document.createTextNode(', '));ds.appendChild(el('span',N.pts&&N.pts[iso]?'dn':'',dm(iso)));});rb.appendChild(ds);rb.addEventListener('click',function(){if(need)return;pikaPick(N.pika.it);});lb.appendChild(rb);});
  if(!lb.children.length)lb.appendChild(el('p','sub','Ei pikapäiviä'+(pkRow?' tällä rivillä.':'.')));b.appendChild(lb);}
$('dsheet').addEventListener('close',function(){if(dsSrc){dsSrc=null;if($('pksheet').open)renderPika();render();}});
function isoWeekNo(d){var t=new Date(d.getFullYear(),d.getMonth(),d.getDate()+3-((d.getDay()+6)%7)),j=new Date(t.getFullYear(),0,4);return 1+Math.round(((t-j)/864e5-3+((j.getDay()+6)%7))/7);}
function evPos(b,x,s,e){var vs=Math.max(s,Math.min(CVs,e-STEP)),ve=Math.min(e,Math.max(CVe,s+STEP));b.style.top=yOf(vs)+'px';b.style.height=Math.max(20,(ve-vs)/60*HOURPX-2)+'px';b.classList.toggle('short',(e-s)<45);
  function lab(m){return fromMin(m).replace(/^0/,'').replace(':','.');}
  b.querySelector('span').textContent=lab(s)+(x.open&&!b.classList.contains('rs')&&e-s===x.e-x.s?'':'–'+lab(e));}
function evBox(x){var b=el('div','ev'+(ptDone(x.n,occKey(x.day||calDay,x.o))?' done':'')+(isChk(x.n)?' lst':'')+srcCls(x.n));b.dataset.id=x.n.id;b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('aria-label',calTitle(x.n,x.o));
  b.style.left='calc('+(x.col/x.cols*100)+'% + 2px)';b.style.width='calc('+(100/x.cols)+'% - 4px)';
  b.appendChild(el('b','',calTitle(x.n,x.o)||'(tyhjä)'));b.appendChild(el('span'));b.appendChild(calCk('evck',x.n,occKey(x.day||calDay,x.o),calTitle(x.n,x.o)||'(tyhjä)',function(on){b.classList.toggle('done',on);}));var gr=el('i','grip');gr.setAttribute('aria-hidden','true');b.appendChild(gr);evPos(b,x,x.s,x.e);
  var st=null;
  function y(ev){return ev.clientY;}
  function snap(m){return Math.round(m/STEP)*STEP;}
  function moveTo(ev){
    st.lx=ev.clientX;st.ly=y(ev);var r=main.getBoundingClientRect();
    if(y(ev)<r.top+50)main.scrollTop-=8;else if(y(ev)>r.bottom-50)main.scrollTop+=8;
    var dm=snap((y(ev)-st.y0+main.scrollTop-st.sc)/HOURPX*60);
    if(st.mode==='move'){
      dropMark(ev.clientX,y(ev),x.day||calDay);
      var len=x.e-x.s,at=Math.max(Math.min(CVs,x.s),Math.min(Math.max(CVe,x.e)-len,x.s+dm));
      st.s=at;st.e=at+len;evPos(st.ghost,x,st.s,st.e);
      var area=b.parentElement.getBoundingClientRect(),timeline=b.closest('#timeline').getBoundingClientRect();
      var left=b.parentElement.classList.contains('dcol')?Math.max(timeline.left+44,Math.min(timeline.right-st.rect.width,st.rect.left+ev.clientX-st.x0)):st.rect.left;
      st.ghost.style.left=left+'px';st.ghost.style.top=(area.top+parseFloat(st.ghost.style.top))+'px';
    }else{
      st.s=x.s;st.e=Math.max(x.s+STEP,Math.min(1440,snap(x.e+dm)));evPos(b,x,st.s,st.e);
    }
  }
  function lift(mode,ev){
    st.mode=mode;st.on=true;
    if(mode==='move'){
      st.rect=b.getBoundingClientRect();st.ghost=b.cloneNode(true);st.ghost.inert=true;
      st.ghost.removeAttribute('role');st.ghost.removeAttribute('tabindex');st.ghost.setAttribute('aria-hidden','true');
      delete st.ghost.dataset.id;st.ghost.querySelectorAll('[id]').forEach(function(e){e.removeAttribute('id');});
      st.ghost.classList.add('lift','calendar-drag-preview');
      Object.assign(st.ghost.style,{left:st.rect.left+'px',top:st.rect.top+'px',width:st.rect.width+'px'});
      document.body.appendChild(st.ghost);b.classList.add('drag-origin');
    }else b.classList.add('rs');
    try{b.setPointerCapture(ev.pointerId);}catch(e){}
  }
  b.addEventListener('pointerdown',function(ev){if(ev.button>0||!ev.isPrimary||ev.target.closest('button'))return;st={y0:y(ev),x0:ev.clientX,sc:main.scrollTop,on:false,s:x.s,e:x.e};
    if(ev.target===gr){ev.preventDefault();lift('size',ev);return;}
    var pe=ev;st.timer=setTimeout(function(){if(st&&!st.on)lift('move',pe);},LONG);});
  /* hiirellä raahaus alkaa heti liikkeestä, kosketuksella pitkästä painalluksesta */
  b.addEventListener('pointermove',function(ev){if(!st)return;var lim=ev.pointerType==='mouse'?4:8;if(!st.on){if(Math.abs(y(ev)-st.y0)>lim||Math.abs(ev.clientX-st.x0)>lim){clearTimeout(st.timer);if(ev.pointerType==='mouse')lift('move',ev);else{st=null;return;}}else return;}ev.preventDefault();moveTo(ev);});
  b.addEventListener('touchmove',function(ev){if(st&&st.on)ev.preventDefault();},{passive:false});
  function end(ev,cancel){if(!st)return;clearTimeout(st.timer);var s0=st;st=null;
    if(!s0.on){if(!cancel)openNote(x.n,null,occKey(x.day||calDay,x.o));return;}
    b.classList.remove('drag-origin','rs');if(s0.ghost)s0.ghost.remove();
    var dz=s0.mode==='move'&&s0.lx!==undefined?dropAt(s0.lx,s0.ly):null;dropMark(-1,-1);
    if(!cancel&&dz&&dz.col&&dz.day!==(x.day||calDay)){
      var why=moveDay(x.n,x.o,dz.day,{s:fromMin(s0.s),e:x.open?'':fromMin(s0.e)});
      if(why){setInfo(why,false,true);return;}
      x.n.edited=nowIso();calDay=dz.day;calTop=main.scrollTop;touch();render();return;
    }
    if(!cancel&&dz&&(dz.untimed||dz.cell)){dropTo(x,dz);return;}
    if(cancel||(s0.mode==='move'&&!dz)||(s0.s===x.s&&s0.e===x.e)){evPos(b,x,x.s,x.e);return;}
    moveEntry(x,s0.s,s0.e,s0.mode==='move'&&x.open);x.n.edited=nowIso();calTop=main.scrollTop;touch();render();}
  b.addEventListener('pointerup',function(ev){end(ev,false);});b.addEventListener('pointercancel',function(ev){end(ev,true);});
  b.addEventListener('lostpointercapture',function(ev){end(ev,true);});
  b.addEventListener('contextmenu',function(ev){ev.preventDefault();});
  b.addEventListener('keydown',function(ev){if(ev.target===b&&ev.key==='Enter')openNote(x.n,null,occKey(x.day||calDay,x.o));});
  return b;}

/* Vaihe 7b: pudotus viikkonauhan päivälle siirtää päivän, pudotus ajattomien nauhaan (tai päivän otsikkoon) poistaa kellonajan.
   Kohde haetaan sormen kohdalta; raahattava ja haamu eivät ota osumia. */
function dropAt(cx,cy){var e=document.elementFromPoint(cx,cy);if(!e)return null;var d=e.closest('#week .cday');if(d)return {day:d.dataset.day,cell:true};
  var uc=e.closest('.ucell');if(uc)return {untimed:true,day:uc.dataset.day};
  if(e.closest('#untimed'))return {untimed:true};
  var col=e.closest('.dcol');if(col){var cr=col.getBoundingClientRect();return {col:true,day:col.dataset.day,min:Math.max(CVs,Math.min(CVe-60,CVs+Math.round((cy-cr.top)/HOURPX*60/STEP)*STEP))};}var a=e.closest('#timeline');if(a){var r=a.querySelector('.area').getBoundingClientRect();return {min:Math.max(CVs,Math.min(CVe-60,CVs+Math.round((cy-r.top)/HOURPX*60/STEP)*STEP))};}return null;}
function dropMark(cx,cy,from){var z=cx<0?null:dropAt(cx,cy),other=!!(z&&z.day&&z.day!==from);
  Array.prototype.forEach.call(document.querySelectorAll('#week .cday'),function(c){c.classList.toggle('drop',!!(z&&!z.col&&!z.untimed&&z.day===c.dataset.day));});
  Array.prototype.forEach.call(document.querySelectorAll('.dcol,.ucell'),function(c){c.classList.toggle('drop',!!(z&&z.day===c.dataset.day&&(other||!from)&&(c.classList.contains('dcol')?z.col:!z.col)));});
  var st=$('untimed');if(st)st.classList.toggle('drop',!!(z&&z.untimed));return !!(z&&((z.day&&!(z.col&&!other))||z.untimed));}
function dropTo(x,z){var N=x.n,from=x.day||calDay;
  if(z.col){if(z.day!==from){var w2=moveDay(N,x.o,z.day);if(w2){setInfo(w2,false,true);return;}}else if(x.timed)return;
    if(!x.timed){ptMv(N,occKey(z.day,{dup:x.o&&x.o.dup}),occKey(z.day,{time:{s:fromMin(z.min)},dup:x.o&&x.o.dup}));N.time={s:fromMin(z.min),e:''};}N.edited=nowIso();touch();calDay=z.day;calTop=main.scrollTop;render();return;}
  if(z.untimed&&z.day&&z.day!==from)z={day:z.day};
  /* Pudotus saman päivän ruutuun viikkonauhalla = koko päivän merkinnäksi (kellonaika pois) */
  if(z.day&&!z.untimed){if(z.day===from){if(x.timed){clearTime(N,x.o);N.edited=nowIso();touch();render();}return;}var why=moveDay(N,x.o,z.day);if(why){setInfo(why,false,true);return;}N.edited=nowIso();touch();calDay=z.day;render();return;}
  if(z.untimed){if(!x.timed)return;clearTime(N,x.o);N.edited=nowIso();touch();render();return;}
  if(z.min!==undefined&&!x.timed){ptMv(N,occKey(from,{dup:x.o&&x.o.dup}),occKey(from,{time:{s:fromMin(z.min)},dup:x.o&&x.o.dup}));N.time={s:fromMin(z.min),e:''};N.edited=nowIso();touch();calTop=main.scrollTop;render();}}
/* Ajattoman sirun raahaus: pitkä painallus nostaa haamun, joka seuraa sormea */
function chipDrag(b,x){var st=null;b.style.webkitTouchCallout='none';
  b.addEventListener('pointerdown',function(ev){if(ev.button>0)return;var pe=ev;st={x0:ev.clientX,y0:ev.clientY,on:false};
    function up(){if(!st)return;st.on=true;var g=el('div','evghost',b.textContent);g.style.left=(pe.clientX-60)+'px';g.style.top=(pe.clientY-18)+'px';document.body.appendChild(g);st.g=g;b.classList.add('lift');try{b.setPointerCapture(pe.pointerId);}catch(e){}}
    st.up=up;st.timer=setTimeout(up,LONG);});
  b.addEventListener('pointermove',function(ev){if(!st)return;var lim=ev.pointerType==='mouse'?4:8;if(!st.on){if(Math.abs(ev.clientX-st.x0)>lim||Math.abs(ev.clientY-st.y0)>lim){clearTimeout(st.timer);if(ev.pointerType==='mouse')st.up();else{st=null;return;}}else return;}
    ev.preventDefault();st.lx=ev.clientX;st.ly=ev.clientY;st.g.style.left=(ev.clientX-60)+'px';st.g.style.top=(ev.clientY-18)+'px';dropMark(ev.clientX,ev.clientY);});
  b.addEventListener('touchmove',function(ev){if(st&&st.on)ev.preventDefault();},{passive:false});
  function end(cancel){if(!st)return;clearTimeout(st.timer);var s0=st;st=null;if(!s0.on){if(!cancel)openNote(x.n,null,occKey(x.day||calDay,x.o));return;}
    s0.g.remove();b.classList.remove('lift');var z=!cancel&&s0.lx!==undefined?dropAt(s0.lx,s0.ly):null;dropMark(-1,-1);if(z)dropTo(x,z);}
  b.addEventListener('pointerup',function(){end(false);});b.addEventListener('pointercancel',function(){end(true);});
  b.addEventListener('contextmenu',function(ev){ev.preventDefault();});}
/* Roskakori ja kuittaus */
function moveNotesToTrash(notes){
  var moved=new Set(notes),deleted=nowIso(),today=todayIso();
  notes.forEach(function(n){
    if(n.rep&&!n.done)repSignOff(data.reps,n,today);
    data.trash.unshift(Object.assign({},n,{deleted:deleted}));
  });
  data.notes=data.notes.filter(function(n){return !moved.has(n);});touch();
}
function toTrash(n){moveNotesToTrash([n]);}
function restore(n){data.trash=data.trash.filter(function(x){return x!==n;});var c={};Object.keys(n).forEach(function(k){if(k!=='deleted')c[k]=n[k];});data.notes.unshift(c);touch();}
/* Tärkeät: aikatermit, omat termit ja puiden termit. Vain tärkeiksi merkityt ovat järjestyksessä (data.imp), muut perivät tai jäävät ilman. */
function rankTerms(){return TIME_TERMS.map(function(t){return {id:t.id,name:t.name,time:true,yes:[],no:[]};}).concat(data.terms,autoTerms(data.projects,data.words,data.terms));}
/* Tähti on sama kaikkialla (Emil 21.10.2026): palikan tähti puun Järjestyksessä ja sen termin tähti Termit-ikkunassa kulkevat yhdessä.
   Järjestykset pysyvät erillisinä: puun järjestys on puun oma, muistiinpanojen yhteinen. Uusi tähti menee loppuun. */
/* 1.107 (Emil 18.11.2026): tähdet pois, kaikki asiat ovat tärkeitä. Asiat-taulukon järjestys on tärkeysjärjestys: jokainen oma asia (ei aikasanat)
   on järjestyksessä (data.imp), uusi asia tulee loppuun. */
var impSig='';
function impAll(force){var sig=data.k+'|'+data.terms.length+'|'+Object.keys(data.words||{}).length+'|'+data.projects.map(function(P){return (P.text||'').length;}).join(',')+'|'+(data.imp||[]).length;if(!force&&sig===impSig)return;
  var all=rankTerms().filter(function(t){return !t.time;}),ids=all.map(function(t){return t.id;}),cur=(data.imp||[]).filter(function(id){return ids.indexOf(id)>=0||isSpec(id)||String(id).slice(0,2)==='z:';}),add=ids.filter(function(id){return cur.indexOf(id)<0;});
  var ch=add.length||cur.length!==(data.imp||[]).length;if(ch){data.imp=cur.concat(add);termCache=null;save();}impSig=data.k+'|'+data.terms.length+'|'+Object.keys(data.words||{}).length+'|'+data.projects.map(function(P){return (P.text||'').length;}).join(',')+'|'+data.imp.length;}
function syncImp(tid,on){var i=data.imp.indexOf(tid);if(on&&i<0)data.imp=data.imp.concat([tid]);if(!on&&i>=0)data.imp=data.imp.filter(function(x){return x!==tid;});
  if(tid.slice(0,2)!=='a:')return;var k=tid.slice(2);data.projects.forEach(function(P){if(!parseText(P.text).by[k])return;var l=P.imp||[],j=l.indexOf(k);
    if(on&&j<0)P.imp=l.concat([k]);else if(!on&&j>=0)P.imp=l.filter(function(x){return x!==k;});else return;rulesToText(P);});}
function orderedTerms(){var a=rankTerms(),i=impList(a);return i.concat(a.filter(function(t){return i.indexOf(t)<0;}));}
function impList(all){var by={};all.forEach(function(t){by[t.id]=t;});return (data.imp||[]).filter(function(id){return by[id];}).map(function(id){return by[id];});}
function rankFn(AT,today){var rk=impRanks(data.imp,rankTerms(),data.projects);
  return function(n){var R=nInf(AT,n.text,n,today),ids=R.ids.concat(R.inf),r=Infinity,z=timeTermOf(n,today);if(z)ids.push(z);ids.forEach(function(id){if(rk[id]!==undefined&&rk[id]<r)r=rk[id];});return r;};}
/* Raahaus pitkällä painalluksella: rivi nousee, muut väistävät. Pudotus listan ulkopuolelle tai keskeytys palauttaa paikalleen. */
function dragList(l,onDrop,fixed){var rows=Array.prototype.slice.call(l.children);
  rows.forEach(function(row,i){var st=null,fired=false;if(fixed&&fixed(row,i))return;
    function shift(j){rows.forEach(function(r,k){if(k===i)return;var h=st.rects[i].height+8;r.style.transform=(j!==null&&k>i&&k<=j)?'translateY(-'+h+'px)':(j!==null&&k<i&&k>=j)?'translateY('+h+'px)':'';});}
    function end(cancel){if(!st)return;clearTimeout(st.timer);var s0=st;st=null;if(!s0.on)return;row.classList.remove('lift');rows.forEach(function(r){r.style.transform='';});
      if(!cancel&&s0.j!==null&&s0.j!==i)onDrop(i,s0.j);}
    row.addEventListener('pointerdown',function(ev){if(ev.button>0)return;fired=false;var pe=ev;st={y0:ev.clientY,x0:ev.clientX,on:false,j:null};
      st.timer=setTimeout(function(){if(!st)return;st.on=fired=true;st.j=i;st.rects=rows.map(function(r){return r.getBoundingClientRect();});row.classList.add('lift');try{row.setPointerCapture(pe.pointerId);}catch(e){}},LONG);});
    row.addEventListener('pointermove',function(ev){if(!st)return;if(!st.on){if(Math.abs(ev.clientY-st.y0)>8||Math.abs(ev.clientX-st.x0)>8){clearTimeout(st.timer);st=null;}return;}
      ev.preventDefault();row.style.transform='translateY('+(ev.clientY-st.y0)+'px)';var y=ev.clientY,a=st.rects[0].top,z=st.rects[rows.length-1].bottom;
      if(y<a-40||y>z+40)st.j=null;else{var j=0;st.rects.forEach(function(r,k){if(k!==i&&y>r.top+r.height/2)j++;});st.j=j;}shift(st.j);});
    row.addEventListener('touchmove',function(ev){if(st&&st.on)ev.preventDefault();},{passive:false});
    row.addEventListener('pointerup',function(){end(false);});row.addEventListener('pointercancel',function(){end(true);});
    row.addEventListener('lostpointercapture',function(){end(true);});
    row.addEventListener('click',function(ev){if(fired){ev.stopPropagation();ev.preventDefault();fired=false;}},true);
    row.addEventListener('contextmenu',function(ev){ev.preventDefault();});});}

/* ---- Kaikki 0.35 (Emil 22.11.2026, kohta 17.2, sekamalli): Listat ja Toistuvat vaultiin, jotta kuittaukset synkkaavat laitteiden välillä.
   Listat, listojen rivit, Asiat ja ryhmät: `listat/listat.json`. Toistuvat: yksi luettava tiedosto per muistutus `toistuvat/<nimi>.md`
   (alkutiedoissa toisto, laji, alku, viimeksi tullut ja tehty; teksti rungossa; muut kentät `kaikki: {json}`), poisto = `poistettu: pvm`.
   Yhdistäminen kolmisuuntaisesti tunnisteen mukaan: pohja = viimeksi synkattu (laitteella kaikki:sync:pohja). Muutos vain toisella puolella
   voittaa; molemmilla → GitHubin versio voittaa. Rivien muistiinpanoviittaus kulkee tiedostopolkuna (nvp). Vain ensimmäinen projekti.
   Ennen ensimmäistä synkkaa laitteen tiedot varmuuskopioon (kaikki:sync:varmuus). ---- */
var LS_PATH='listat/listat.json',LS_DIR='toistuvat/',LS_BASE='kaikki:sync:pohja',LS_ARR=['lists','chk','terms','grp'],lsTimer=0,lsRun=false;
var LS_UNIT={d:'päivä',w:'viikko',m:'kuukausi',y:'vuosi'},LS_UNITR={'päivä':'d','päivää':'d','pv':'d','viikko':'w','viikkoa':'w','vk':'w','kuukausi':'m','kuukautta':'m','kk':'m','vuosi':'y','vuotta':'y','v':'y'};
function lsMine(){return vOn()&&vK()&&vK().id===data.k;}
function lsBase(){try{return JSON.parse(localStorage.getItem(LS_BASE)||'null');}catch(e){return null;}}
function lsBaseSet(o){try{localStorage.setItem(LS_BASE,JSON.stringify(o));}catch(e){}}
function lsOut(k,x){if(k!=='chk'||!x||!x.nid)return x;var c=JSON.parse(JSON.stringify(x)),N=null;for(var i=0;i<data.notes.length;i++)if(data.notes[i].id===x.nid){N=data.notes[i];break;}if(N&&N.vp){c.nvp=N.vp;delete c.nid;}return c;}
function lsIn(k,x){if(k!=='chk'||!x||!x.nvp)return x;var c=JSON.parse(JSON.stringify(x));for(var i=0;i<data.notes.length;i++)if(data.notes[i].vp===x.nvp){c.nid=data.notes[i].id;break;}return c;}
function lsLocal(){var o={};LS_ARR.forEach(function(k){o[k]=(data[k]||[]).map(function(x){return lsOut(k,x);});});o.words=data.words||{};return o;}
function lsMap(arr){var m={};(arr||[]).forEach(function(x){if(x&&x.id!=null)m[x.id]=JSON.stringify(x);});return m;}
function lsMerge3(B,L,R){var b=lsMap(B),l=lsMap(L),r=lsMap(R),ids=[],seen={},out=[],conf=0;
  (R||[]).concat(L||[]).forEach(function(x){if(x&&x.id!=null&&!seen[x.id]){seen[x.id]=1;ids.push(x.id);}});
  ids.forEach(function(id){var bb=b[id],ll=l[id],rr=r[id],v;if(ll===rr)v=ll;else if(ll===bb)v=rr;else if(rr===bb)v=ll;else{v=rr!==undefined?rr:ll;conf++;}if(v!==undefined)out.push(JSON.parse(v));});
  return {arr:out,conf:conf};}
function lsMergeObj(B,L,R){B=B||{};L=L||{};R=R||{};var o={},conf=0;Object.keys(Object.assign({},R,L)).forEach(function(k){var bb=JSON.stringify(B[k]),ll=JSON.stringify(L[k]),rr=JSON.stringify(R[k]),v;
    if(ll===rr)v=L[k];else if(ll===bb)v=R[k];else if(rr===bb)v=L[k];else{v=R[k]!==undefined?R[k]:L[k];conf++;}if(v!==undefined)o[k]=v;});return {obj:o,conf:conf};}
function lsMergeAll(B,L,R){B=B||{};R=R||{};var M={},c=0;LS_ARR.forEach(function(k){var x=lsMerge3(B[k],L[k],R[k]);M[k]=x.arr;c+=x.conf;});var w=lsMergeObj(B.words,L.words,R.words);M.words=w.obj;c+=w.conf;return {M:M,conf:c};}
/* toistuva <-> luettava tiedosto */
function repMd(R,old){var t=String(R.text||''),title=(t.split('\n').filter(function(x){return x.trim();})[0]||'Toistuva').replace(/^#+\s*/,'').slice(0,80),rest={};
  Object.keys(R).forEach(function(k){if(['text','n','unit','mode','start','lastDue','lastDone','created'].indexOf(k)<0)rest[k]=R[k];});
  var fm=['tyyppi: toistuva','otsikko: '+title,'kuvaus: Toistuva muistutus Kaikki-appista.','luotu: '+String(R.created||nowIso()).slice(0,10),'lahde: emil','nakyy: ei',
    'toisto: '+(R.n||1)+' '+(LS_UNIT[R.unit]||R.unit||'päivä'),'laji: '+(R.mode==='trig'?'jos-ei-tapahdu':'ajallaan')];
  if(R.start)fm.push('alku: '+R.start);if(R.lastDue)fm.push('viimeksi: '+R.lastDue);if(R.lastDone)fm.push('tehty: '+R.lastDone);if(R.del)fm.push('poistettu: '+R.del);
  fm.push('kaikki: '+JSON.stringify(rest));return '---\n'+fm.join('\n')+'\n---\n'+t.replace(/\s+$/,'')+'\n';}
function repOf(md){var S=VAULT.split(md);if(!S.fm||VAULT.fmGet(S.fm,'tyyppi')!=='toistuva')return null;var g=function(k){return VAULT.fmGet(S.fm,k);},R={};
  try{R=JSON.parse(g('kaikki')||'{}')||{};}catch(e){R={};}var to=/^(\d+)\s*(\S+)$/.exec(g('toisto')||'');if(to){R.n=+to[1];R.unit=LS_UNITR[to[2].toLowerCase()]||to[2];}
  R.mode=g('laji')==='jos-ei-tapahdu'?'trig':'rep';if(g('alku'))R.start=g('alku');if(g('viimeksi'))R.lastDue=g('viimeksi');if(g('tehty'))R.lastDone=g('tehty');if(g('poistettu'))R.del=g('poistettu');
  R.created=g('luotu')||R.created;R.text=S.body.replace(/^\s+/,'').replace(/\s+$/,'').replace(/^#\s+/,'');return R;}
function lsRemoteReps(){var out={},paths={};Object.keys(VC.files).forEach(function(p){if(p.indexOf(LS_DIR)!==0||!/\.md$/.test(p))return;var R=repOf(VC.files[p].t);if(R){if(!R.id)R.id='tv'+VAULT.idOf(p);out[R.id]=R;paths[R.id]=p;}});return {reps:out,paths:paths};}
function lsRepKey(R){var c=Object.assign({},R);delete c.created;return JSON.stringify(Object.keys(c).sort().reduce(function(o,k){o[k]=c[k];return o;},{}));}
function lsSchedule(ms){clearTimeout(lsTimer);lsTimer=setTimeout(lsSync,ms==null?1500:ms);}
async function lsSync(){if(!lsMine())return;if(vBusy||lsRun){lsSchedule(2000);return;}lsRun=true;var state={repo:vRepo(),branch:G.branch};
  try{var base=lsBase();if(!base){try{localStorage.setItem('kaikki:sync:varmuus',JSON.stringify({aika:nowIso(),lists:data.lists,chk:data.chk,terms:data.terms,grp:data.grp,words:data.words,reps:data.reps}));}catch(e){}base={};}
    var local=lsLocal(),res=null,conf=0;vBusy=true;vRender();
    var w=await vWriteText(LS_PATH,function(text){var R={};try{R=text?JSON.parse(text):{};}catch(e){R={};}var x=lsMergeAll(base,local,R);res=x.M;conf=x.conf;
      if(!text&&!LS_ARR.some(function(k){return res[k].length;})&&!Object.keys(res.words||{}).length)return text;/* ei tyhjää tiedostoa: pelkkä haku ei kirjoita */
      var out=JSON.stringify(Object.assign({versio:1,huom:'Kaikki-appin listat, listojen rivit, Asiat ja ryhmät. Appi yhdistää laitteiden muutokset.'},res),null,1)+'\n';return out===text?text:out;},'appi: listat',state);
    if(w&&w.file&&w.file.sha){VC.files[LS_PATH]=w.file;vSaveC();}
    if(res){var changed=false;LS_ARR.forEach(function(k){var next=res[k].map(function(x){return lsIn(k,x);});if(JSON.stringify(next.map(function(x){return lsOut(k,x);}))!==JSON.stringify(local[k])){data[k]=next;changed=true;}});
      if(JSON.stringify(res.words)!==JSON.stringify(local.words)){data.words=res.words;changed=true;}base=Object.assign({},base,res);}
    /* toistuvat */
    var RR=lsRemoteReps(),bR=base.reps||{},lR={},mR={},ids={};(data.reps||[]).forEach(function(R){lR[R.id]=R;ids[R.id]=1;});Object.keys(RR.reps).forEach(function(id){ids[id]=1;});
    Object.keys(ids).forEach(function(id){var b=bR[id],l=lR[id]?lsRepKey(lR[id]):(b&&!RR.reps[id]?undefined:undefined),r=RR.reps[id]?lsRepKey(RR.reps[id]):undefined,ll=lR[id]?lsRepKey(lR[id]):undefined,v;
      if(ll===r)v=lR[id]||RR.reps[id];else if(ll===b)v=RR.reps[id];else if(r===b)v=lR[id]||(b?{id:id,del:todayIso(),_gone:1}:undefined);else{v=RR.reps[id]||lR[id];conf++;}
      if(v)mR[id]=v;});
    var newBR={};for(var id in mR){var R=mR[id];if(R._gone){var old=RR.reps[id];if(old&&!old.del){R=Object.assign({},old,{del:todayIso()});}else{delete mR[id];continue;}mR[id]=R;}
      var k=lsRepKey(R);newBR[id]=k;var path=RR.paths[id];if(!path||lsRepKey(RR.reps[id])!==k){if(!path){var b0='toistuvat/'+(VAULT.slug(String(R.text||'toistuva').split('\n')[0])||'toistuva');path=b0+'.md';var i2=2;while(VC.files[path]&&!(RR.paths[id]===path))path=b0+'-'+(i2++)+'.md';}
        var wr=await vWriteText(path,function(cur){return repMd(R,cur);},'appi: toistuva '+String(R.text||'').split('\n')[0].slice(0,40),state);if(wr&&wr.file){VC.files[path]=wr.file;vSaveC();}}}
    var nextReps=Object.keys(mR).map(function(id){return mR[id];}).filter(function(R){return !R.del;}).map(function(R){var c=Object.assign({},R);delete c._gone;return c;});
    var order={};(data.reps||[]).forEach(function(R,i){order[R.id]=i;});nextReps.sort(function(a,b){return (order[a.id]==null?1e9:order[a.id])-(order[b.id]==null?1e9:order[b.id]);});
    if(JSON.stringify(nextReps)!==JSON.stringify(data.reps||[])){data.reps=nextReps;changed=true;}
    base.reps=newBR;lsBaseSet(base);
    if(changed){save0();render();}if(conf)toast(conf+' kohtaa muuttui molemmilla laitteilla; GitHubin versio jäi voimaan.');
  }catch(e){}finally{lsRun=false;vBusy=false;vRender();}}
(function(){var vPull0=vPull;vPull=function(){return vPull0.apply(this,arguments).then(function(ok){if(ok)lsSchedule(300);return ok;});};
  var save1=save;save=function(){save1();if(lsMine())lsSchedule(1500);};})();
/* ---- Kaikki 0.8 (Emil 22.11.2026): koko vault yhdeksi ZIP-tiedostoksi, aina sama nimi (uusi korvaa vanhan).
   Sisältö: välimuistin tiedostot (VC.files) + lähtemättömät omat muutokset (VC.q) uusimpana; poistetut pois. Pakkaamaton ZIP (stored), CRC-32, UTF-8-nimet. ---- */
var ZIPNAME='Kaikki-vault.zip';
function vZipFiles(){
  var files=Object.create(null),notes=vNotes();
  Object.keys(VC.files).forEach(function(path){files[path]=VC.files[path].t;});
  Object.keys(VC.q).forEach(function(path){
    var pending=VC.q[path];
    if(pending.del)delete files[path];
    else if(typeof pending.t==='string')files[path]=pending.t;
  });
  /* Varmuuskopio lukee luonnokset muuttamatta muistion polkuja tai Vaultin jonoa. */
  var used=new Set(notes.map(function(note){return note.vp;}));
  notes.forEach(function(note){
    if(note.rep==='rx')return;
    var path=note.vp,pending=VC.q[path];
    if(pending&&(pending.direct||pending.del))return;
    if(path){files[path]=VAULT.mdOf(note);return;}
    path=VAULT.newPath(note,function(candidate){
      return used.has(candidate)||candidate in VC.files||candidate in VC.q;
    });
    used.add(path);
    files[path]=VAULT.mdOf(Object.assign({},note,{vp:path}));
  });
  return files;
}
var CRCT=null;function crc32(b){if(!CRCT){CRCT=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;CRCT[n]=c>>>0;}}
  var x=0xFFFFFFFF;for(var i=0;i<b.length;i++)x=CRCT[(x^b[i])&255]^(x>>>8);return (x^0xFFFFFFFF)>>>0;}
function zipMake(F,now){var enc=new TextEncoder(),parts=[],cen=[],off=0,d=now||new Date(),
    tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),dt=((Math.max(1980,d.getFullYear())-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  function hdr(sz){return new DataView(new ArrayBuffer(sz));}
  Object.keys(F).sort().forEach(function(p){var nm=enc.encode(p),data=enc.encode(F[p]),c=crc32(data);
    var h=hdr(30);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,tm,true);h.setUint16(12,dt,true);
    h.setUint32(14,c,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),nm,data);
    var e=hdr(46);e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x0800,true);e.setUint16(10,0,true);e.setUint16(12,tm,true);e.setUint16(14,dt,true);
    e.setUint32(16,c,true);e.setUint32(20,data.length,true);e.setUint32(24,data.length,true);e.setUint16(28,nm.length,true);e.setUint32(42,off,true);
    cen.push(new Uint8Array(e.buffer),nm);off+=30+nm.length+data.length;});
  var cs=cen.reduce(function(t,a){return t+a.length;},0),n=Object.keys(F).length,z=hdr(22);z.setUint32(0,0x06054b50,true);z.setUint16(8,n,true);z.setUint16(10,n,true);z.setUint32(12,cs,true);z.setUint32(16,off,true);
  return new Blob(parts.concat(cen,[new Uint8Array(z.buffer)]),{type:'application/zip'});}
function vZip(){if(!vOn())return;
  if(vBusy){vsMsg('Vault synkronoi. Vie varmuuskopio, kun synkronointi on valmis.');return;}
  var F=vZipFiles(),n=Object.keys(F).length,now=new Date();
  F['VARMUUSKOPIO.txt']='Kaikki-appin varmuuskopio GitHub-vaultista\nRepo: '+G.repo+'\nTehty: '+fiDate(isoD(now))+' klo '+now.getHours()+'.'+pad(now.getMinutes())+'\nTiedostoja: '+n+'\nTila: '+vStatus()+'\n';
  var blob=zipMake(F,now),done=function(t){vsMsg(t);};vsMsg('Kootaan '+n+' tiedostoa…');
  function link(){try{var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=ZIPNAME;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},8000);done(ZIPNAME+' ladattu ('+n+' tiedostoa).');}catch(e){done('Tallennus ei onnistunut tässä selaimessa.');}}
  /* tietokone (Chrome, Edge): tallennusikkuna, jossa vanhan saa korvattua samalla nimellä */
  if(wide()&&window.showSaveFilePicker){window.showSaveFilePicker({suggestedName:ZIPNAME,types:[{description:'ZIP',accept:{'application/zip':['.zip']}}]}).then(function(h){return h.createWritable().then(function(w){return w.write(blob).then(function(){return w.close();});});})
      .then(function(){done(ZIPNAME+' tallennettu ('+n+' tiedostoa).');},function(e){if(e&&e.name==='AbortError')done('Tallennus peruttiin.');else link();});return;}
  try{var file=new File([blob],ZIPNAME,{type:'application/zip'});if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file]}).then(function(){done(ZIPNAME+' annettu tallennettavaksi ('+n+' tiedostoa).');},function(e){if(e&&e.name==='AbortError')done('Tallennus peruttiin.');else link();});return;}}catch(e){}
  link();}
$('vs-zip').addEventListener('click',vZip);
/* ---- Kaikki 0.7 (Emil 22.11.2026): Kojelauta. Kuvaajat vaultin data-kansiosta: data/mittarit.json kertoo taulukot ja sarakkeet,
   data/<taulukko>.csv luvut (vaultin ohje ohjeet/data.md). Vain päivämääräavaimiset taulukot. Lajit: asteikko = pisteet ja 7 päivän keskiarvo,
   valinta = viiva tunnisteen mukaan, luku = viiva, kylla-ei = kertoja viikossa pylväinä. Omat SVG-kuvaajat, ei kirjastoja. ---- */
var DASHR=[['30','30 pv','30'],['90','3 kk','3kk'],['365','Vuosi','v'],['all','Kaikki','∞']];
function dashRange(){var v=null;try{v=localStorage.getItem('kaikki:dashr');}catch(e){}return DASHR.some(function(r){return r[0]===v;})?v:'90';}
function dashSpec(){var f=VC&&VC.files&&VC.files['data/mittarit.json'];if(!f)return null;try{var j=JSON.parse(f.t);return j&&Array.isArray(j.taulukot)?j:null;}catch(e){return {err:1};}}
function dashCsv(t){var L=String(t||'').replace(/\r/g,'').split('\n').filter(function(x){return x.trim();});if(!L.length)return {h:[],rows:[]};
  var h=L[0].split(',').map(function(x){return x.trim();});return {h:h,rows:L.slice(1).map(function(l){var c=l.split(','),o={};h.forEach(function(k,i){o[k]=(c[i]||'').trim();});return o;})};}
function dashNum(v){if(v===''||v==null)return null;var n=+String(v).replace(',','.');return isFinite(n)?n:null;}
function dashDay(iso){return /^\d{4}-\d{2}-\d{2}$/.test(iso||'')?iso:null;}
function dashFmt(n,c){if(n==null)return '–';var s=(Math.round(n*10)/10).toString().replace('.',',');if(c.laji==='valinta'){var a=(c.arvot||[]).filter(function(x){return String(x[0])===String(n);})[0];if(a)return a[1];}
  if(c.laji==='kylla-ei')return n?'kyllä':'ei';return s+(c.yksikko?' '+c.yksikko:'');}
function dashShort(iso){var d=fromIso(iso);return d.getDate()+'.'+(d.getMonth()+1)+'.';}
/* 0.13: päivän mittarit tallennetaan nykyiseen CSV-muotoon. */
function dashEntryCols(table,headers){
  var columns=Array.isArray(table.sarakkeet)?table.sarakkeet:[];
  return columns.filter(function(c){
    return c&&/^[a-z][a-z0-9_-]*$/.test(c.id)&&headers.indexOf(c.id)>0&&
      c.kaytossa!==false&&c.kirjaus!==false&&['asteikko','valinta','luku','kylla-ei'].indexOf(c.laji)>=0;
  });
}
function dashEntryTables(spec){
  return spec.taulukot.filter(function(table){
    if(!table||!/^data\/[a-z0-9_-]+\.csv$/.test(table.tiedosto)||!VC.files[table.tiedosto])return false;
    var headers=dashCsv(VC.files[table.tiedosto].t).h;
    return headers[0]==='pvm'&&(!table.avain||table.avain==='pvm')&&dashEntryCols(table,headers).length>0;
  });
}
function dashEntryField(fields,col,old){
  var select=col.laji==='valinta'||col.laji==='kylla-ei',input=el(select?'select':'input'),row=el('div');
  input.id='dash-metric-'+col.id;input.name=col.id;input.dataset.metric=col.id;
  var label=el('label','fl',(col.nimi||col.id)+(col.yksikko?' ('+col.yksikko+')':''));
  label.htmlFor=input.id;row.appendChild(label);row.appendChild(input);fields.appendChild(row);
  if(select){
    var options=col.laji==='kylla-ei'?[['1','Kyllä'],['0','Ei']]:(Array.isArray(col.arvot)?col.arvot:[]);
    [['','—']].concat(options).forEach(function(pair){
      if(!Array.isArray(pair)||/[,\r\n"]/.test(String(pair[0])))return;
      var option=el('option','',String(pair[1]));option.value=String(pair[0]);input.appendChild(option);
    });
  }else{
    input.type='number';
    input.inputMode=col.laji==='asteikko'?'numeric':'decimal';
    input.step=col.laji==='asteikko'?'1':'any';
    if(col.min!=null)input.min=col.min;
    if(col.max!=null)input.max=col.max;
  }
  input.value=old;
  if(!select){
    var pair=el('div','xy-field');row.insertBefore(pair,input);pair.appendChild(input);
    var pick=button(pair,'XY','btn',function(){
      openXY(col.nimi||col.id,input.value,xyDashPref(col),function(value,pref){
        var valid=metricTextValue(value,col);
        if(valid===null){$('xy-msg').textContent='Arvo ei sovi mittarin rajaukseen.';return false;}
        input.value=valid;
        try{localStorage.setItem('kaikki:xy:'+col.id,JSON.stringify(pref));}catch(e){}
        return true;
      });
    });
    pick.setAttribute('aria-label','Valitse '+(col.nimi||col.id)+' XY-pädillä');
  }
  return {field:input,before:old,displayed:input.value};
}
function dashPatchDay(csv,day,edits){
  var eol=csv.indexOf('\r\n')>=0?'\r\n':'\n',lines=csv.split(eol);
  var headers=lines[0].split(',').map(function(k){return k.trim();});
  if(headers[0]!=='pvm'||new Set(headers).size!==headers.length)return {error:'Mittaritaulukon otsikot ovat muuttuneet.'};
  var match=-1,insert=lines.length;
  for(var i=1;i<lines.length;i++){
    var key=lines[i].split(',',1)[0].trim();
    if(key===day){
      if(match>=0)return {error:'Taulukossa on samalle päivälle kaksi riviä.'};
      match=i;
    }else if(dashDay(key)&&key>day&&insert===lines.length)insert=i;
  }
  var cells=match>=0?lines[match].split(','):[day],changed=false;
  for(i=0;i<edits.length;i++){
    var edit=edits[i],index=headers.indexOf(edit.id);
    if(index<1)return {error:'Mittarin sarake on muuttunut.'};
    var current=(cells[index]||'').trim();
    if(current===edit.after)continue;
    if(current!==edit.before)return {conflict:true,error:'Sama mittari muuttui GitHubissa. Tarkista tuoreet arvot ennen tallentamista.'};
    cells[index]=edit.after;changed=true;
  }
  if(!changed)return {text:csv};
  while(cells.length<headers.length)cells.push('');
  if(match>=0)lines[match]=cells.join(',');
  else{
    while(insert>1&&!lines[insert-1].trim())insert--;
    lines.splice(insert,0,cells.join(','));
  }
  return {text:lines.join(eol)};
}
async function dashWriteDay(path,day,edits,repo,branch){
  var url=vUrl('/contents/'+vEnc(path));
  for(var attempt=0;attempt<3;attempt++){
    if(vRepo()!==repo||G.branch!==branch)return {error:'GitHub-vault vaihtui tallennuksen aikana.'};
    var result=await vApi(url+'?ref='+encodeURIComponent(branch));
    if(result.status!==200)return {error:vErr(result.status)};
    var current={sha:result.j.sha,t:b64d(result.j.content)};
    var patch=dashPatchDay(current.t,day,edits);
    if(patch.error)return {error:patch.error,conflict:patch.conflict,file:current};
    if(patch.text===current.t)return {file:current};
    if(vRepo()!==repo||G.branch!==branch)return {error:'GitHub-vault vaihtui tallennuksen aikana.'};
    var put=await vApi(url,'PUT',{message:'appi: päivän mittarit',content:b64e(patch.text),sha:current.sha,branch:branch});
    if(put.status===200||put.status===201)return {file:{sha:put.j.content.sha,t:patch.text}};
    if(put.status!==409&&put.status!==422)return {error:vErr(put.status)};
  }
  return {error:'Taulukkoa päivitettiin samanaikaisesti. Yritä uudelleen.'};
}
/* Kaikki 0.18: Vaultin pikakirjaus. Valinnat kerätään ennen tallennusta. */
var QUICK_PRESETS='pohjat/pikakirjaus.md',quickDraft=null;
function quickPresets(){
  var file=VC.files[QUICK_PRESETS],list=[],mode='',seen=new Set();
  if(!file)return list;
  file.t.split(/\r?\n/).forEach(function(line){
    var heading=/^##\s+(.+?)\s*$/.exec(line);
    if(heading){mode=metricTextKey(heading[1]);return;}
    var item=/^-\s+(.+)$/.exec(line);
    if(!item||(mode!=='seuranta'&&mode!=='muistutus'&&mode!=='muuttujat'))return;
    if(mode==='muuttujat'){
      var variable=quickVariableName(item[1]),variableKey='muuttujat:'+MUUTTUJA.key(variable);
      if(variable&&!seen.has(variableKey)){
        seen.add(variableKey);list.push({mode:mode,key:variableKey,name:variable,source:line});
      }
      return;
    }
    var parts=item[1].split('|').map(function(p){return p.trim();});
    var name=parts[0],kind=mode==='seuranta'?metricTextKey(parts[1]):'';
    var key=mode+':'+metricTextKey(name);
    if(!name||seen.has(key))return;
    var tags=noteTags({text:parts.slice(mode==='seuranta'?2:1).join(' ')});
    seen.add(key);
    list.push({mode:mode,key:key,name:name,kind:kind,tags:tags,source:line,
      unit:parts.slice(2).join(' ').replace(/#[^\s]+/g,'').trim(),choices:(parts[1]||'').replace(/^valinta:\s*/i,'').split(',').map(function(v){return v.trim();}).filter(Boolean)});
  });
  return list;
}
function quickVariableName(text){
  try{var name=JSON.parse(text);return typeof name==='string'?nvValidVariable(name):'';}catch(e){return '';}
}
function quickMetric(preset){
  var spec=dashSpec(),matches=[];
  var key=metricTextKey(preset.name);
  (spec&&spec.taulukot?dashEntryTables(spec):[]).forEach(function(table){
    var path=table.tiedosto,headers=dashCsv(VC.files[path].t).h;
    dashEntryCols(table,headers).forEach(function(col){
      if(metricTextKey(col.nimi)===key||metricTextKey(col.id)===key)matches.push({path:path,col:col});
    });
  });
  if(matches.length===1)return matches[0];
  if(matches.length>1)return null;
  var id=VAULT.slug(preset.name,60),doc=VC.files['ohjeet/muistiinpanot.md'];
  if(!doc||!KAAVA.allowedFields(doc.t).has(id))return null;
  var known={tila:{laji:'valinta',arvot:[['luonnos','Luonnos'],['valmis','Valmis'],['odottaa-emilia','Odottaa Emilia']]},
    arvio:{laji:'asteikko',min:1,max:10},edistys:{laji:'luku',min:0,max:100},hinta:{laji:'luku'},prioriteetti:{laji:'asteikko',min:1,max:3}};
  var col=known[id]||{laji:'teksti'};
  return {path:'',col:Object.assign({id:id},col),field:true};
}
function quickDayPath(day){return 'paivat/'+day.slice(0,4)+'/'+day+'.md';}
function quickDayRows(text){
  var lines=String(text||'').split(/\r?\n/),active=false,rows=[];
  lines.forEach(function(line){
    if(/^#{1,2}\s/.test(line)){active=line.trim()==='## Pikakirjaukset';return;}
    if(!active)return;
    var match=/^- klo \d\d\.\d\d · ([a-z][a-z0-9-]*): (.+)$/.exec(line);
    if(match)rows.push(match[1]+' '+match[2].replace(/(?:\s+#[^\s]+)+$/,''));
  });
  return rows;
}
function quickDayPatch(text,day,edits){
  var eol=text.indexOf('\r\n')>=0?'\r\n':'\n';
  if(!text)text=['---','tyyppi: paiva','otsikko: '+day,'luotu: '+todayIso(),'lahde: emil','---','# '+day,''].join(eol);
  var ids=edits.some(function(e){return e.id;})?new Set(MUUTTUJA.marks(text,fromIso(day)).map(function(b){return b.id;})):null;
  var lines=text.split(eol),add=edits.filter(function(e){return e.id?!ids.has(e.id):lines.indexOf(e.line)<0;}).map(function(e){return e.line;});
  if(!add.length)return text;
  var section=lines.findIndex(function(line){return line.trim()==='## Pikakirjaukset';});
  if(section<0)return text+(text.endsWith(eol)?eol:eol+eol)+'## Pikakirjaukset'+eol+eol+add.join(eol)+eol;
  var end=lines.findIndex(function(line,i){return i>section&&/^#{1,2}\s/.test(line);});
  if(end<0)end=lines.length;
  while(end>section+1&&!lines[end-1].trim())end--;
  lines.splice.apply(lines,[end,0].concat(add));
  return lines.join(eol)+(lines[lines.length-1]?eol:'');
}
async function vWriteText(path,patch,message,draft){
  var url=vUrl('/contents/'+vEnc(path));
  for(var attempt=0;attempt<3;attempt++){
    if(!vOn()||vRepo()!==draft.repo||G.branch!==draft.branch)return {error:'Vault vaihtui tallennuksen aikana.'};
    var pending=vNotes().find(function(note){return note.vp===path;});
    if(VC.q[path]||(pending&&VC.files[path]&&VAULT.mdOf(pending)!==VC.files[path].t)){
      return {error:'Tälle tiedostolle on aiempi paikallinen muutos. Yritä synkronoinnin jälkeen uudelleen.'};
    }
    var get=await vApi(url+'?ref='+encodeURIComponent(draft.branch));
    if(get.status!==200&&get.status!==404)return {error:vErr(get.status)};
    var text=get.status===200?b64d(get.j.content):'',sha=get.status===200?get.j.sha:undefined;
    var next=patch(text);
    if(next===text)return {file:{t:text,sha:sha}};
    if(typeof next!=='string')return Object.assign({file:sha?{t:text,sha:sha}:null},next);
    if(!vOn()||vRepo()!==draft.repo||G.branch!==draft.branch)return {error:'Vault vaihtui tallennuksen aikana.'};
    var put=await vApi(url,'PUT',{message:message,content:b64e(next),sha:sha,branch:draft.branch});
    if(put.status===200||put.status===201)return {file:{t:next,sha:put.j.content.sha}};
    if(put.status!==409&&put.status!==422)return {error:vErr(put.status)};
  }
  return {error:'Tiedostoa muokattiin samaan aikaan. Yritä uudelleen.'};
}
function quickCalendarRows(days){
  var rows=new Map(),visible=new Set(days),spec=vOn()&&dashSpec();
  if(!vOn()||vK().id!==data.k)return rows;
  days.forEach(function(day){
    var file=VC.files[quickDayPath(day)],values=file&&quickDayRows(file.t);
    if(values&&values.length)rows.set(day,values);
  });
  var training=VC.files[TRE_CSV],counts=new Map();
  if(training)dashCsv(training.t).rows.forEach(function(row){
    if(visible.has(row.pvm))counts.set(row.pvm,(counts.get(row.pvm)||0)+1);
  });
  counts.forEach(function(n,day){
    if(!rows.has(day))rows.set(day,[]);
    rows.get(day).push('Treeni '+n+(n===1?' sarja':' sarjaa'));
  });
  if(!spec||!spec.taulukot)return rows;
  dashEntryTables(spec).forEach(function(table){
    var csv=dashCsv(VC.files[table.tiedosto].t),cols=dashEntryCols(table,csv.h);
    csv.rows.forEach(function(row){
      if(!visible.has(row.pvm))return;
      cols.forEach(function(col){
        var raw=row[col.id],value=metricTextValue(metricTextKey(raw),col);
        if(value===null)return;
        var label=col.nimi||col.id;
        if(col.laji==='valinta'){
          var found=col.arvot.find(function(pair){return String(pair[0])===value;});
          if(found)label+=' '+found[1];
        }else if(col.laji==='kylla-ei'){if(value==='0')label+=' ei';}
        else label+=' '+value.replace('.',',')+(col.yksikko?' '+col.yksikko:'');
        if(!rows.has(row.pvm))rows.set(row.pvm,[]);
        rows.get(row.pvm).push(label);
      });
    });
  });
  return rows;
}
function quickCellKey(metric,day){return (metric.path||quickDayPath(day))+'|'+day+'|'+metric.col.id;}
function quickStage(preset,metric,day,raw){
  var msg=$('quick-msg'),key=quickCellKey(metric,day);
  var value=metric.col.laji==='teksti'?String(raw).trim():metricTextValue(metricTextKey(raw),metric.col);
  if(value===null||!value||/[\r\n]/.test(value)){msg.textContent='Arvo ei sovi kentän määrittelyyn.';return;}
  var edit={day:day,path:metric.path||quickDayPath(day),id:metric.col.id,after:value};
  if(metric.field){
    edit.line='- klo '+vClock()+' · '+metric.col.id+': '+value+preset.tags.map(function(tag){return ' #'+tag;}).join('');
  }else{
    var row=dashCsv(VC.files[metric.path].t).rows.find(function(r){return r.pvm===day;})||{};
    var old=quickDraft.edits.get(key);
    edit.before=old?old.before:row[metric.col.id]||'';
  }
  quickDraft.edits.set(key,edit);
  quickRender();msg.textContent=preset.name+' · '+raw;
  var target=Array.from($('quick-picks').children).find(function(b){return b.dataset.key===preset.key;});
  if(target)target.focus();
}
function quickValues(preset){
  var day=$('quick-day').value,host=$('quick-values'),msg=$('quick-msg'),metric=quickMetric(preset);
  if(!dashDay(day)||isoD(fromIso(day))!==day){msg.textContent='Valitse kirjauspäivä.';return;}
  if(!metric){msg.textContent='Tarkista mittarin nimi Kojelaudasta tai kentän nimi Vaultin Omat kentät -luettelosta.';return;}
  var stage=function(v){quickStage(preset,metric,day,v);};
  var kind=preset.kind,match=/^(-?\d+)\s*[-–]\s*(-?\d+)$/.exec(kind);
  if(kind==='kyllä'||kind==='kylla'){stage('kyllä');return;}
  var xy=xyPresetPref(kind);
  if(xy){
    openXY(preset.name,quickDraft.edits.get(quickCellKey(metric,day))?.after,xy,async function(value,pref){
      if(metric.col.laji!=='teksti'&&metricTextValue(value,metric.col)===null){
        $('xy-msg').textContent='Arvo ei sovi kentän rajaukseen.';return false;
      }
      if(pref.max!==xy.max||pref.dec!==xy.dec){
        if(!await saveQuickXY(preset,pref))return false;
      }
      stage(value);return true;
    });
    return;
  }
  host.textContent='';host.hidden=false;msg.textContent='';
  var grid=el('div','quick-grid');host.appendChild(grid);
  if(match&&+match[1]<=+match[2]&&+match[2]-+match[1]<=20){
    for(var n=+match[1];n<=+match[2];n++)(function(value){button(grid,value,'btn',function(){stage(value);});})(String(n));
  }else if(kind.indexOf('valinta:')===0&&preset.choices.length){
    preset.choices.forEach(function(value){button(grid,value,'btn',function(){stage(value);});});
  }else if(kind==='luku'||match){
    var output=el('output','quick-number','0');output.setAttribute('aria-live','polite');
    output.setAttribute('aria-label',preset.name+(preset.unit?' ('+preset.unit+')':''));
    host.insertBefore(output,grid);
    var input='';
    ['1','2','3','4','5','6','7','8','9','−','0',',','Pyyhi','OK'].forEach(function(key){
      button(grid,key,'btn',function(){
        if(key==='OK'){stage(input);return;}
        if(key==='Pyyhi')input=input.slice(0,-1);
        else if(key==='−'){if(!input)input='-';}
        else if(key!==','||input.indexOf(',')<0){if(input.length<16)input+=key;}
        output.textContent=input||'0';
      });
    });
  }else{
    host.hidden=true;
    msg.textContent='Esiasetuksen arvolajia ei tunnistettu.';
    return;
  }
  var first=grid.querySelector('button');if(first)first.focus();
}
function quickReminder(preset){
  var notes=vNotes(),note=notes.find(function(n){return !n.arch&&n.quickReminder===preset.key;});
  var base=note?new Date(note.created):new Date(),previous=note?note.text:'';
  var draft=previous||preset.name+preset.tags.map(function(tag){return ' #'+tag;}).join('');
  var start=draft,daySheet=$('dsheet'),repo=vRepo(),branch=G.branch;
  daySheet.addEventListener('close',function(){
    if(draft===start||!vOn()||vRepo()!==repo||G.branch!==branch)return;
    if(note){
      if(note.text!==previous){toast('Muistutus muuttui muualla. Avaa päivät uudelleen.');return;}
      noteWrite(note,draft);
    }else{
      if(!Object.keys(dayTextDays(draft,base,null)).length)return;
      var now=base.toISOString();
      notes.unshift({id:uid('n'),created:now,edited:now,text:draft,date:'',quickReminder:preset.key});
    }
    touch();render();
  },{once:true});
  dsOpen({base:base,nl:note&&note.nl,get:function(){return draft;},set:function(text){draft=text;}});
}
function quickVariableValue(preset){
  var draft=quickDraft,day=$('quick-day').value,host=$('quick-values'),msg=$('quick-msg');
  if(!dashDay(day)||isoD(fromIso(day))!==day){msg.textContent='Valitse kirjauspäivä.';return;}
  host.textContent='';host.hidden=false;msg.textContent='';
  var label=el('label','fl','Arvo · '+preset.name),input=el('input'),actions=el('div','btnrow');
  input.id='quick-variable-value';input.type='text';input.required=true;label.htmlFor=input.id;
  var subjectLabel=el('label','fl','Kohde (valinnainen)'),subject=el('input'),subjects=el('datalist');
  subject.id='quick-observation-subject';subjectLabel.htmlFor=subject.id;subjects.id='quick-observation-subjects';
  subject.setAttribute('list',subjects.id);subject.value=preset.subject||'';
  mvSubjects().forEach(function(name){var option=el('option');option.value=name;subjects.appendChild(option);});
  function restore(){
    delete host.dataset.variable;quickRender();
    var b=Array.from($('quick-picks').children).find(function(b){return b.dataset.key===preset.key;});
    if(b)b.focus();
  }
  button(actions,'Peru arvo','btn',restore);
  var apply=el('button','btn solid','Lisää kirjaus');apply.type='submit';actions.appendChild(apply);
  host.append(label,input,subjectLabel,subject,subjects,el('p','sub','Päivämuistiinpano · '+mvDay(day)),actions);
  host.dataset.variable=preset.key;
  host.onsubmit=function(event){
    event.preventDefault();
    var value=input.value.trim();
    var id=typeof crypto.randomUUID==='function'?'qh'+crypto.randomUUID():uid('qh');
    var mark=MUUTTUJA.format(preset.name,value,subject.value.trim(),day,preset.tag,id);
    if(!mark){msg.textContent='Tarkista kohteen nimi ja kirjattava arvo.';return;}
    draft.edits.set(id,{day:day,path:quickDayPath(day),after:value,line:'- '+mark,id:id,preset:preset.key});
    restore();msg.textContent=preset.name+' · '+value;
  };
  input.focus();
}
function quickRender(){
  var note=$('quick-controls-note');if(note)note.remove();
  if(quickDraft.mode==='napit'){quickControls();return;}
  var host=$('quick-picks'),tracking=quickDraft.mode==='seuranta',variables=quickDraft.mode==='muuttujat';
  $('quick-values').onsubmit=null;delete $('quick-values').dataset.variable;$('quick-variable-form').hidden=true;
  host.textContent='';$('quick-values').hidden=true;$('quick-new-form').hidden=true;$('quick-new').hidden=false;$('quick-msg').textContent='';
  $('quick-day-row').hidden=!tracking&&!variables;
  $('quick-track').setAttribute('aria-pressed',String(tracking));
  $('quick-remind').setAttribute('aria-pressed',String(!tracking&&!variables));
  $('quick-variables').hidden=!vK()||vK().id!==data.k;
  $('quick-variables').setAttribute('aria-pressed',String(variables));
  $('quick-controls').hidden=$('quick-variables').hidden;$('quick-controls').setAttribute('aria-pressed','false');
  quickDraft.presets.filter(function(preset){return preset.mode===quickDraft.mode;}).forEach(function(preset){
    var b=button(host,preset.name,'btn',function(){
      if(variables)quickVariableValue(preset);else if(tracking)quickValues(preset);else quickReminder(preset);
    });
    if(variables)b.setAttribute('aria-pressed',String(Array.from(quickDraft.edits.values()).some(function(e){return e.preset===preset.key&&e.day===$('quick-day').value;})));
    b.dataset.key=preset.key;
    if(tracking){
      var metric=quickMetric(preset),day=$('quick-day').value;
      b.setAttribute('aria-pressed',metric&&quickDraft.edits.has(quickCellKey(metric,day))?'true':'false');
    }
  });
  if(tracking&&VC.files[TRE_SPEC])button(host,'Treenisarja','btn',async function(){
    await saveQuickEntry();
    if(!$('quick-entry').open)openTreText('');
  }).id='quick-treeni';
  if(!host.childElementCount)$('quick-msg').textContent=variables?'Lisää nappi valitsemalla olemassa oleva tekstimuuttuja.':'Esiasetuksia ei löytynyt tiedostosta pohjat/pikakirjaus.md.';
}
function openQuickEntry(requested,preset){
  if(!vOn())return;
  var mode='seuranta';try{mode=localStorage.getItem('kaikki:quick-mode');}catch(e){}
  if(requested==='muuttujat')mode=requested;
  if(mode!=='muistutus'&&((mode!=='muuttujat'&&mode!=='napit')||!vK()||vK().id!==data.k))mode='seuranta';
  quickDraft={presets:quickPresets(),mode:mode,edits:new Map(),repo:vRepo(),branch:G.branch};
  if(preset)quickDraft.presets=quickDraft.presets.concat(preset);
  $('quick-day').value=todayIso();quickRender();openSheet($('quick-entry'));
  if(preset)quickVariableValue(preset);
}
function quickMode(mode){
  quickDraft.mode=mode;try{localStorage.setItem('kaikki:quick-mode',mode);}catch(e){}
  quickRender();
}
async function saveQuickEntry(){
  var draft=quickDraft,dialog=$('quick-entry'),msg=$('quick-msg');
  if(!draft||draft.saving)return;
  if(!$('quick-new-form').hidden||!$('quick-variable-form').hidden||$('quick-values').dataset.variable){quickRender();return;}
  if(!draft.edits.size){closeSheet(dialog);return;}
  if(!vOn()||vRepo()!==draft.repo||G.branch!==draft.branch||vBusy){
    msg.textContent='Vault synkronoi tai yhteys on vaihtunut. Yritä uudelleen.';return;
  }
  var groups=new Map();
  draft.edits.forEach(function(edit,key){
    var group=edit.path+'|'+edit.day;
    if(!groups.has(group))groups.set(group,[]);
    groups.get(group).push({key:key,edit:edit});
  });
  var controls=Array.from(dialog.querySelectorAll('button,input'));
  controls.forEach(function(control){control.disabled=true;});
  draft.saving=true;vBusy=true;vRender();msg.textContent='Tallennetaan…';
  try{
    for(var pairs of groups.values()){
      var edit=pairs[0].edit;
      var changes=pairs.map(function(pair){return pair.edit;});
      var result=edit.line?
        await vWriteText(edit.path,function(text){return quickDayPatch(text,edit.day,changes);},'appi: päivän pikakirjaukset',draft):
        await dashWriteDay(edit.path,edit.day,changes,draft.repo,draft.branch);
      if(result.file&&vRepo()===draft.repo&&G.branch===draft.branch){VC.files[edit.path]=result.file;vSaveC();}
      if(result.error){
        if(result.conflict)pairs.forEach(function(pair){draft.edits.delete(pair.key);});
        quickRender();
        msg.textContent=result.error+(result.conflict?' Valitse kyseisen päivän arvot uudelleen.':'');
        return;
      }
      pairs.forEach(function(pair){draft.edits.delete(pair.key);});
    }
    vAt=vClock();vApply();closeSheet(dialog);render();toast('Pikakirjaukset tallennettu.');
  }catch(e){msg.textContent='Pikakirjaus odottaa. Tarkista yhteys ja yritä uudelleen.';}
  finally{draft.saving=false;vBusy=false;controls.forEach(function(control){control.disabled=false;});vRender();vFlush();}
}
function quickPresetPatch(text,mode,name,line){
  var heading=mode==='seuranta'?'Seuranta':mode==='muuttujat'?'Muuttujat':'Muistutus',eol=text.indexOf('\r\n')>=0?'\r\n':'\n';
  var lines=text.split(eol),start=lines.findIndex(function(s){return metricTextKey(s)==='## '+mode;});
  if(start<0)return (text?text.replace(/\s*$/,'')+eol+eol:'')+'## '+heading+eol+line+eol;
  var end=lines.findIndex(function(s,i){return i>start&&/^#{1,2}\s/.test(s);});
  if(end<0)end=lines.length;
  if(lines.slice(start+1,end).some(function(s){
    var item=/^-\s+(.+)$/.exec(s);
    if(!item)return false;
    return mode==='muuttujat'?MUUTTUJA.key(quickVariableName(item[1]))===MUUTTUJA.key(name):
      metricTextKey(item[1].split('|')[0])===metricTextKey(name);
  })){
    return {error:'Tämänniminen nappi on jo olemassa.'};
  }
  while(end>start+1&&!lines[end-1].trim())end--;
  lines.splice(end,0,line);
  return lines.join(eol)+(lines[lines.length-1]?eol:'');
}
/* 0.89 (jäsennys A6.2): säätimet pikakirjauksessa. Nappi kirjoittaa heti (ei odota Valmis-painiketta), Kumoa näkyy reunassa. */
function quickControls(){
  var host=$('quick-picks'),msg=$('quick-msg');
  $('quick-values').onsubmit=null;delete $('quick-values').dataset.variable;$('quick-variable-form').hidden=true;
  host.textContent='';$('quick-values').hidden=true;$('quick-new-form').hidden=true;$('quick-new').hidden=false;msg.textContent='';
  $('quick-day-row').hidden=true;
  ['quick-track','quick-remind','quick-variables'].forEach(function(id){$(id).setAttribute('aria-pressed','false');});
  $('quick-variables').hidden=$('quick-controls').hidden=!vK()||vK().id!==data.k;
  $('quick-controls').setAttribute('aria-pressed','true');
  saadinItems().filter(function(it){return it.pikakirjaus;}).forEach(function(it){
    var b=button(host,it.nimi,'btn',function(){saadinPress(it,msg);});
    b.disabled=!!it.virhe;b.title=saadinSummary(it);b.setAttribute('aria-label','Kirjaa: '+it.nimi);
  });
  if(!host.childElementCount)msg.textContent='Ei vielä nappeja. Tee säädin napista + Uusi nappi.';
  else{var note=el('p','sub quick-controls-note','Napit kirjaavat heti. Kumoa näkyy hetken näytön reunassa.');note.id='quick-controls-note';host.after(note);}
}
$('quick-new').addEventListener('click',function(){
  if(quickDraft.mode==='napit'){openSaadinEdit(null,{after:function(){if($('quick-entry').open)quickRender();}});return;}
  if(quickDraft.mode==='muuttujat'){
    var select=$('quick-variable-name'),available=mvRegistry().filter(function(group){
      return !quickDraft.presets.some(function(preset){return preset.mode==='muuttujat'&&mvDefinition('variables',preset.name).key===group.key;});
    });
    if(!available.length){$('quick-msg').textContent='Valittavia tekstimuuttujia ei ole. Luo muuttuja Muistiossa.';return;}
    select.replaceChildren();
    available.forEach(function(group){var option=el('option','',group.nimi);option.value=group.nimi;select.appendChild(option);});
    $('quick-values').hidden=true;delete $('quick-values').dataset.variable;$('quick-new').hidden=true;$('quick-msg').textContent='';
    $('quick-variable-form').hidden=false;select.focus();return;
  }
  var form=$('quick-new-form');form.reset();form.hidden=false;$('quick-new').hidden=true;
  $('quick-new-track').hidden=quickDraft.mode!=='seuranta';$('quick-new-choices-row').hidden=true;
  $('quick-values').hidden=true;$('quick-msg').textContent='';$('quick-new-name').focus();
});
function quickCancelNew(){quickRender();$('quick-new').focus();}
$('quick-new-cancel').addEventListener('click',quickCancelNew);
$('quick-variable-cancel').addEventListener('click',quickCancelNew);
$('quick-new-kind').addEventListener('change',function(){$('quick-new-choices-row').hidden=this.value!=='valinta';});
$('quick-new-form').addEventListener('submit',async function(ev){
  ev.preventDefault();
  var draft=quickDraft,form=ev.currentTarget,msg=$('quick-msg'),name=$('quick-new-name').value.trim(),tracking=draft.mode==='seuranta';
  var kind=metricTextKey($('quick-new-kind').value),choices=$('quick-new-choices').value.trim();
  var rawTags=$('quick-new-tags').value.trim(),tags=rawTags?rawTags.split(/[\s,]+/).map(noteTagKey):[];
  if(!name||/[|\r\n]/.test(name)||tags.some(function(tag){return !tag;})||(tracking&&kind==='valinta'&&(!choices||/[|\r\n]/.test(choices)))){
    msg.textContent='Tarkista nimi, valinnat ja tunnisteet.';return;
  }
  if(tracking&&!quickMetric({name:name})){
    msg.textContent='Valitse olemassa olevan mittarin tai sovitun kentän nimi.';return;
  }
  var fields=[name];
  if(tracking)fields.push(kind==='valinta'?'valinta: '+choices:kind);
  if(tags.length)fields.push(tags.map(function(tag){return '#'+tag;}).join(' '));
  await quickSavePreset(draft,name,'- '+fields.join(' | '));
});
$('quick-variable-form').addEventListener('submit',function(event){
  event.preventDefault();
  var name=$('quick-variable-name').value;
  if(name)quickSavePreset(quickDraft,name,'- '+JSON.stringify(name));
});
async function quickSavePreset(draft,name,line){
  var msg=$('quick-msg');
  if(vBusy||draft.saving){msg.textContent='Vault synkronoi. Yritä uudelleen.';return;}
  var controls=Array.from($('quick-entry').querySelectorAll('button,input,select'));
  controls.forEach(function(control){control.disabled=true;});
  vBusy=true;draft.saving=true;msg.textContent='Tallennetaan…';vRender();
  try{
    var result=await vWriteText(QUICK_PRESETS,function(text){return quickPresetPatch(text,draft.mode,name,line);},'appi: uusi pikakirjausnappi',draft);
    if(result.error){msg.textContent=result.error;return;}
    if(!vOn()||vRepo()!==draft.repo||G.branch!==draft.branch)return;
    VC.files[QUICK_PRESETS]=result.file;vSaveC();
    draft.presets=quickPresets();quickRender();$('quick-new').focus();
  }catch(error){msg.textContent='Nappia ei voitu tallentaa. Tarkista yhteys.';}
  finally{draft.saving=false;vBusy=false;controls.forEach(function(control){control.disabled=false;});vRender();vFlush();}
}
['quick-entry-desktop','quick-entry-mobile'].forEach(function(id){$(id).addEventListener('click',openQuickEntry);});
$('quick-track').addEventListener('click',function(){quickMode('seuranta');});
$('quick-remind').addEventListener('click',function(){quickMode('muistutus');});
$('quick-variables').addEventListener('click',function(){quickMode('muuttujat');});
$('quick-controls').addEventListener('click',function(){quickMode('napit');});
$('quick-day').addEventListener('change',quickRender);
$('quick-done').addEventListener('click',saveQuickEntry);
$('quick-values').addEventListener('submit',function(ev){ev.preventDefault();});
/* Kaikki 0.20: sama lukuvalitsin eri kirjauspaikoissa. */
var xyState=null;
function xyPresetPref(kind){
  var m=/^xy\s+0-(10|100|1000)(?:\s+,(0|1|01))?$/.exec(kind);
  return m?{max:Number(m[1]),dec:m[2]==='01'?2:m[2]==='1'?1:0}:null;
}
function xyDashPref(col){
  try{
    var pref=JSON.parse(localStorage.getItem('kaikki:xy:'+col.id)||'null');
    if(pref&&[10,100,1000].indexOf(pref.max)>=0&&[0,1,2].indexOf(pref.dec)>=0)return pref;
  }catch(e){}
  return {max:col.max==null?1000:col.max<=10?10:col.max<=100?100:1000,dec:0};
}
function xyShow(ready){
  var state=xyState;
  var value=state.whole+(state.whole>=state.max?0:state.fraction/Math.pow(10,state.dec));
  $('xy-output').textContent=value.toFixed(state.dec).replace('.',',');
  $('xy-actions').classList.toggle('dragging',!ready);
  $('xy-msg').textContent='';
}
function xyRender(){
  var state=xyState,host=$('xy-controls');
  host.textContent='';
  function strip(label,max,initial,onValue){
    var row=el('label','xy-strip',label),input=el('input');
    input.type='range';input.min='0';input.max=String(max);input.step='1';input.value=String(initial);
    input.addEventListener('input',function(){onValue(Number(input.value));xyShow(true);});
    row.appendChild(input);host.appendChild(row);
  }
  function surface(label,read,write){
    var heading=el('div','xy-controls-label',label),plane=el('div','xy-surface'),dot=el('span','xy-dot'),bubble=el('span','xy-bubble');
    plane.tabIndex=0;plane.setAttribute('role','group');
    plane.setAttribute('aria-label',label+'. Valitse nuolinäppäimillä.');
    dot.setAttribute('aria-hidden','true');bubble.setAttribute('aria-hidden','true');bubble.hidden=true;plane.append(dot,bubble);host.append(heading,plane);
    function draw(){
      var n=read()%100;
      dot.style.left=((n%10+.5)*10)+'%';dot.style.top=((9-Math.floor(n/10)+.5)*10)+'%';
    }
    var active=null,before=0;
    function choose(event){
      var rect=plane.getBoundingClientRect();
      var x=Math.max(0,Math.min(9,Math.floor((event.clientX-rect.left)/rect.width*10)));
      var y=Math.max(0,Math.min(9,Math.floor((event.clientY-rect.top)/rect.height*10)));
      write((9-y)*10+x);draw();xyShow(false);
      bubble.textContent=$('xy-output').textContent;bubble.hidden=false;
      bubble.style.left=Math.max(20,Math.min(80,(x+.5)*10))+'%';
      bubble.style.top=((y<3?y+3:y-2)*10)+'%';
    }
    plane.addEventListener('pointerdown',function(event){
      if(state.saving||active!==null||event.button>0)return;
      event.preventDefault();plane.focus({preventScroll:true});active=event.pointerId;before=read();
      plane.setPointerCapture(active);choose(event);
    });
    plane.addEventListener('pointermove',function(event){if(event.pointerId===active)choose(event);});
    plane.addEventListener('pointerup',function(event){
      if(event.pointerId!==active)return;choose(event);active=null;bubble.hidden=true;xyShow(true);
    });
    function cancel(event){
      if(event.pointerId!==active)return;
      write(before);active=null;bubble.hidden=true;draw();xyShow(true);
    }
    plane.addEventListener('pointercancel',cancel);
    plane.addEventListener('lostpointercapture',cancel);
    plane.addEventListener('keydown',function(event){
      var movement={ArrowLeft:-1,ArrowRight:1,ArrowUp:10,ArrowDown:-10}[event.key];
      if(!movement||state.saving)return;
      event.preventDefault();write(Math.max(0,Math.min(99,read()+movement)));draw();xyShow(true);
    });
    draw();
  }
  if(state.max===10)strip('Kokonaisosa',10,state.whole,function(n){state.whole=n;});
  else{
    if(state.max===1000)strip('Sadat',9,Math.min(9,Math.floor(state.whole/100)),function(n){
      state.whole=n*100+state.whole%100;
    });
    surface('Kymmenet ja ykköset',function(){return state.whole%100;},function(n){state.whole=Math.min(state.max-100,Math.floor(state.whole/100)*100)+n;});
    button(host,String(state.max),'mini',function(){state.whole=state.max;state.fraction=0;xyRender();xyShow(true);$('xy-ok').focus();});
  }
  if(state.dec===1)strip('Desimaali',9,state.fraction,function(n){state.fraction=n;if(state.whole===state.max&&n)state.whole--;});
  if(state.dec===2)surface('Sadasosat',function(){return state.fraction;},function(n){state.fraction=n;if(state.whole===state.max&&n)state.whole--;});
}
function openXY(label,value,pref,accept){
  var number=Number(value),scale=Math.pow(10,pref.dec);
  if(!Number.isFinite(number))number=0;
  var units=Math.max(0,Math.min(pref.max*scale,Math.round(number*scale)));
  xyState={max:pref.max,dec:pref.dec,whole:Math.floor(units/scale),fraction:units%scale,accept:accept};
  $('xy-title').textContent=label;$('xy-max').value=String(pref.max);$('xy-dec').value=String(pref.dec);
  xyRender();xyShow(true);openSheet($('xy-picker'));
}
['xy-max','xy-dec'].forEach(function(id){$(id).addEventListener('change',function(){
  var state=xyState,dec=Number($('xy-dec').value),max=Number($('xy-max').value);
  var scale=Math.pow(10,dec),oldValue=state.whole+state.fraction/Math.pow(10,state.dec);
  var units=Math.min(max*scale,Math.round(oldValue*scale));
  state.max=max;state.dec=dec;state.whole=Math.floor(units/scale);state.fraction=units%scale;
  xyRender();xyShow(true);
});});
$('xy-cancel').addEventListener('click',function(){closeSheet($('xy-picker'));});
$('xy-picker').addEventListener('close',function(){xyState=null;});
$('xy-ok').addEventListener('click',async function(){
  var state=xyState,dialog=$('xy-picker');
  if(!state||state.saving)return;
  var value=$('xy-output').textContent.replace(',','.');
  state.saving=true;var ctl=Array.from(dialog.querySelectorAll('button,select,input'));
  ctl.forEach(function(c){c.disabled=true;});
  try{if(await state.accept(value,{max:state.max,dec:state.dec})&&dialog.open)closeSheet(dialog);}
  finally{state.saving=false;ctl.forEach(function(c){c.disabled=false;});}
});
async function saveQuickXY(preset,pref){
  var draft=quickDraft,msg=$('xy-msg');
  if(vBusy||draft.saving){msg.textContent='Vault synkronoi. Yritä uudelleen.';return false;}
  var end=pref.dec===2?' ,01':pref.dec===1?' ,1':'';
  var parts=preset.source.split('|'),original=preset.source;
  parts[1]=' xy 0-'+pref.max+end+(parts.length>2?' ':'');
  var next=parts.join('|');
  vBusy=true;draft.saving=true;vRender();
  try{
    var result=await vWriteText(QUICK_PRESETS,function(text){
      var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',lines=text.split(eol);
      var index=lines.indexOf(original);
      if(index<0||lines.lastIndexOf(original)!==index)return {error:'Esiasetus muuttui. Avaa pikakirjaus uudelleen.'};
      lines[index]=next;return lines.join(eol);
    },'appi: pikakirjausnapin XY-tarkkuus',draft);
    if(result.error){msg.textContent=result.error;return false;}
    if(!vOn()||vRepo()!==draft.repo||G.branch!==draft.branch)return false;
    VC.files[QUICK_PRESETS]=result.file;vSaveC();draft.presets=quickPresets();return true;
  }catch(e){msg.textContent='Tarkkuuden tallennus epäonnistui. Yritä uudelleen.';return false;}
  finally{vBusy=false;draft.saving=false;vRender();vFlush();}
}
/* ---- Kaikki 0.88 (jäsennys A6.1, Emil 24.11.2026): säätimet. Säädin tehdään kerran editorissa (Valikko → Säätimet) ja sitä
   painetaan missä vain. Kertanappi kirjoittaa heti yhden rivin ja näyttää reunassa Kumoa-napin noin 6 sekuntia. Tiedostomuoto: SAADIN. */
var SAADIN_PATH='pohjat/saatimet.md',saadinUndoT=0,saadinUndoState=null;
function saadinDoc(){var f=vOn()&&VC.files[SAADIN_PATH];return SAADIN.parse(f?f.t:'');}
function saadinItems(){return saadinDoc().items;}
function saadinById(id){return saadinItems().find(function(it){return it.tunnus===id;})||null;}
function saadinNewId(nimi){var used=saadinItems().map(function(x){return x.tunnus;}),base=SAADIN.slug(nimi)||'saadin',id=base,n=2;
  while(used.includes(id))id=base+'-'+(n++);return id;}
function saadinDayTemplate(day){return ['---','tyyppi: paiva','otsikko: '+day,'luotu: '+todayIso(),'lahde: emil','---','# '+day,''].join('\n');}
function saadinOwnPath(it){return 'inbox/saadin-'+it.tunnus+'.md';}
/* Minne säädin kirjoittaa: {path, dayNote, template, label} tai {error}. Kadonnutta muistiinpanoa ei luoda uudelleen. */
function saadinTarget(it,day){
  if(it.minne==='paiva')return {path:quickDayPath(day),dayNote:true,template:saadinDayTemplate(day),label:'päivän muistiinpano '+mvDay(day)};
  if(it.minne==='oma'){
    var own=vNoteOf('saadin-'+it.tunnus),path=own&&own.vp||saadinOwnPath(it);
    return {path:path,label:'oma muistiinpano '+it.nimi,template:['---','tyyppi: muistiinpano','otsikko: '+it.nimi,
      'kuvaus: Säätimen '+it.nimi+' kirjaukset.','luotu: '+todayIso(),'lahde: emil','---','# '+it.nimi,''].join('\n')};
  }
  var n=vNoteOf(it.linkki);
  if(!n||!n.vp||n.arch)return {error:'Muistiinpanoa [['+it.linkki+']] ei löydy. '+it.nimi+' ei kirjoittanut mitään.'};
  return {path:n.vp,label:mvTitle(n)};
}
function saadinSummary(it){
  if(it.virhe)return it.virhe;
  var what=[];
  if(it.teksti)what.push('”'+it.teksti+'”');
  if(it.muuttuja)what.push(it.muuttuja+(it.arvo?' = '+it.arvo:' (arvo kysytään)'));
  if(!it.muuttuja&&it.aikaleima)what.push('aikaleima');
  var where=it.minne==='teksti'?'[['+it.linkki+']]':it.minne==='oma'?'oma muistiinpano':'päivän muistiinpano';
  return what.join(' + ')+' → '+where+' · '+SAADIN.AJAT[it.aika].replace(/ \(.*\)$/,'').toLowerCase()+(it.tapa==='paivita'?' · päivittää':'');
}
function saadinMoment(it,o){
  if(it.aika==='kysy')return {day:o.day,clock:o.clock||''};
  if(it.aika==='kalenteri')return {day:calDay||todayIso(),clock:''};
  var d=new Date();
  return {day:isoD(d),clock:it.aika==='nyt'?pad(d.getHours())+':'+pad(d.getMinutes()):''};
}
/* Painallus. Kysyy arvon tai päivän tarvittaessa, muuten kirjoittaa heti. */
function saadinPress(it,status){
  function say(t){if(status)status.textContent=t;else toast(t);}
  if(!vOn()){say('Yhdistä Vault ensin.');return;}
  if(it.virhe){say(it.nimi+': '+it.virhe);return;}
  var need={value:!!it.muuttuja&&!it.arvo,day:it.aika==='kysy'};
  if(need.value||need.day){saadinAsk(it,need);return;}
  return saadinRun(it,{value:it.arvo,status:status});
}
async function saadinRun(it,o){
  var m=saadinMoment(it,o),T=saadinTarget(it,m.day),status=o.status;
  function say(t){if(status)status.textContent=t;else toast(t);}
  if(T.error){say(T.error);return false;}
  if(vBusy){say('Vault synkronoi. Yritä hetken päästä.');return false;}
  var id=typeof crypto.randomUUID==='function'?'qh'+crypto.randomUUID():uid('qh');
  var line=SAADIN.record(it,{day:m.day,clock:m.clock,value:o.value,dayNote:!!T.dayNote,id:id});
  if(!line){say('Tarkista arvo: '+it.nimi+'.');return false;}
  var ctx={repo:vRepo(),branch:G.branch},before=null;
  vBusy=true;vRender();
  try{
    var r=await vWriteText(T.path,function(text){
      var w=SAADIN.write(text,it,line,{dayNote:T.dayNote,template:T.template});before=w.before;return w.text;
    },'appi: säädin '+it.nimi,ctx);
    if(r.error){say(r.error);return false;}
    if(r.file&&vRepo()===ctx.repo&&G.branch===ctx.branch){VC.files[T.path]=r.file;vSaveC();}
    vAt=vClock();vApply();render();
    if(status)status.textContent=it.nimi+' kirjattu: '+T.label+'.';
    saadinUndoShow({it:it,path:T.path,before:before,after:line,ctx:ctx,label:T.label});
    return true;
  }catch(e){say('Kirjaus ei onnistunut. Tarkista yhteys ja yritä uudelleen.');return false;}
  finally{vBusy=false;vRender();vFlush();}
}
/* Kumoa näytön reunassa: ei peitä sisältöä eikä vie kohdistusta. Avoimen ikkunan päällä nappi siirtyy ikkunan sisään. */
function saadinTopDialog(){
  var open=Array.from(document.querySelectorAll('dialog[open]'));
  open.sort(function(a,b){return (b._ord||0)-(a._ord||0);});return open[0]||null;
}
function saadinUndoPlace(){
  var box=$('saadin-undo');if(!box||box.hidden)return;
  var host=saadinTopDialog()||document.body;if(box.parentNode!==host)host.appendChild(box);
}
function saadinUndoShow(st){
  var box=$('saadin-undo');
  if(!box){
    box=el('div');box.id='saadin-undo';box.setAttribute('role','status');
    var said=el('span','vh');said.id='saadin-undo-said';
    var b=el('button','','Kumoa');b.type='button';b.id='saadin-undo-b';b.addEventListener('click',saadinUndo);
    box.append(said,b);document.body.appendChild(box);
  }
  saadinUndoState=st;box.hidden=false;saadinUndoPlace();
  $('saadin-undo-said').textContent=st.it.nimi+' kirjattu.';
  $('saadin-undo-b').setAttribute('aria-label','Kumoa: '+st.it.nimi);
  box.classList.remove('pulse');void box.offsetWidth;box.classList.add('pulse');
  clearTimeout(saadinUndoT);saadinUndoT=setTimeout(saadinUndoExpire,6000);
}
/* Kohdistettu nappi ei katoa käsistä: piilotus odottaa, kunnes kohdistus lähtee napista. */
function saadinUndoExpire(){
  var b=$('saadin-undo-b');
  if(b&&document.activeElement===b){b.addEventListener('blur',function(){saadinUndoT=setTimeout(saadinUndoExpire,1500);},{once:true});return;}
  saadinUndoHide();
}
function saadinUndoHide(){clearTimeout(saadinUndoT);saadinUndoState=null;var box=$('saadin-undo');if(box)box.hidden=true;}
document.addEventListener('close',function(){setTimeout(saadinUndoPlace,0);},true);
async function saadinUndo(){
  var st=saadinUndoState;if(!st)return;saadinUndoHide();
  if(vBusy){toast('Vault synkronoi. Poista kirjaus tarvittaessa muistiinpanosta.');return;}
  vBusy=true;vRender();
  try{
    var r=await vWriteText(st.path,function(text){
      var u=SAADIN.undo(text,st.before,st.after);
      return u===null?{error:'Kirjausta oli jo muutettu, joten sitä ei kumottu.'}:u;
    },'appi: kumoa säädin '+st.it.nimi,st.ctx);
    if(r.error){toast(r.error);return;}
    if(vRepo()===st.ctx.repo&&G.branch===st.ctx.branch){VC.files[st.path]=r.file;vSaveC();}
    vAt=vClock();vApply();render();toast(st.it.nimi+': kirjaus kumottu.');
  }catch(e){toast('Kumoaminen ei onnistunut. Tarkista yhteys.');}
  finally{vBusy=false;vRender();vFlush();}
}
/* Arvo ja päivä, kun säädin kysyy ne. */
function saadinAsk(it,need){
  var d=$('saadin-ask');
  if(!d){d=el('dialog','nved dash-config');d.id='saadin-ask';d.setAttribute('aria-labelledby','saadin-ask-title');SMALL[d.id]=1;
    document.body.appendChild(d);d.addEventListener('close',modalSync);}
  var busy=false;dashEditorDismiss(d,function(){return busy;});d.replaceChildren();
  var h=el('h2','',it.nimi);h.id='saadin-ask-title';d.appendChild(h);
  var form=el('form','mvb-form'),value=null,day=null,clock=null;
  function field(label,input,id){var w=el('div','dash-field'),l=el('label','',label);input.id=id;l.htmlFor=id;w.append(l,input);form.appendChild(w);return input;}
  if(need.value){value=field('Arvo · '+it.muuttuja,el('input'),'saadin-ask-value');value.type='text';value.autocomplete='off';value.required=true;}
  if(need.day){
    day=field('Päivä',el('input'),'saadin-ask-day');day.type='date';day.value=todayIso();day.required=true;
    clock=field('Kellonaika (valinnainen)',el('input'),'saadin-ask-clock');clock.type='time';
  }
  var where=el('p','sub');form.appendChild(where);
  function show(){var T=saadinTarget(it,day&&dashDay(day.value)?day.value:todayIso());where.textContent=T.error||'Kirjoittaa: '+T.label;}
  if(day)day.addEventListener('change',show);show();
  var msg=el('p','msg');msg.setAttribute('aria-live','polite');form.appendChild(msg);
  var foot=el('div','dash-editor-footer');button(foot,'Peru','btn',function(){closeSheet(d);});
  var ok=el('button','btn primary','Kirjaa');ok.type='submit';foot.appendChild(ok);form.appendChild(foot);
  form.addEventListener('submit',async function(e){
    e.preventDefault();if(busy)return;
    if(day&&(!dashDay(day.value)||isoD(fromIso(day.value))!==day.value)){msg.textContent='Valitse päivä.';return;}
    busy=true;sheetDialogControls(d,true);msg.textContent='Kirjataan…';
    var done=await saadinRun(it,{value:value?value.value:it.arvo,day:day&&day.value,clock:clock&&clock.value,status:msg});
    busy=false;sheetDialogControls(d,false);
    if(done){closeSheet(d);saadinUndoPlace();}
  });
  d.appendChild(form);openSheet(d);(value||day).focus();
}
/* Editori. it = tiedostosta luettu säädin tai null. o = {preset: esitäyttö, legacy: vanhan pikakirjausnapin rivi, after(säädin)} */
function openSaadinEdit(it,o){
  o=o||{};var d=$('saadin-edit');
  if(!d){d=el('dialog','nved dash-config');d.id='saadin-edit';d.setAttribute('aria-labelledby','saadin-edit-title');SMALL[d.id]=1;
    document.body.appendChild(d);d.addEventListener('close',modalSync);}
  var busy=false;dashEditorDismiss(d,function(){return busy;});d.replaceChildren();
  var h=el('h2','',it?'Muokkaa säädintä':'Uusi säädin');h.id='saadin-edit-title';d.appendChild(h);
  var S0=Object.assign({nimi:'',tunnus:'',laji:'kertanappi',teksti:'',muuttuja:'',arvo:'',kohde:'',tag:'',aikaleima:false,tapa:'lisaa',
    minne:'paiva',linkki:'',aika:'nyt',pikakirjaus:true,muut:[]},it||o.preset||{});
  var form=el('form','mvb-form saadin-form');
  function group(name){var f=el('fieldset');f.appendChild(el('legend','',name));form.appendChild(f);return f;}
  function field(where,label,ctl,id){var w=el('div','dash-field'),l=el('label','',label);ctl.id=id;l.htmlFor=id;w.append(l,ctl);where.appendChild(w);return ctl;}
  function inp(v,ph){var i=el('input');i.type='text';i.value=v||'';i.autocomplete='off';if(ph)i.placeholder=ph;return i;}
  function sel(map,v,soon){var s=el('select');Object.keys(map).forEach(function(k){var op=el('option','',map[k]);op.value=k;s.appendChild(op);});
    (soon||[]).forEach(function(t){var op=el('option','',t+' (tulossa)');op.disabled=true;s.appendChild(op);});s.value=v;return s;}
  function check(where,label,on,id){var w=el('label','saadin-check'),c=el('input');c.type='checkbox';c.checked=!!on;c.id=id;w.append(c,document.createTextNode(' '+label));where.appendChild(w);return c;}
  var g1=group('Säädin'),g2=group('Mitä kirjoitetaan'),g3=group('Minne ja milloin');
  var fName=field(g1,'Nimi',inp(S0.nimi,'esim. Kahvi'),'saadin-name');fName.maxLength=80;fName.required=true;
  field(g1,'Laji',sel(SAADIN.LAJIT,'kertanappi',['Pohjaan jäävä nappi','Liukusäädin','XY-pädi']),'saadin-kind');
  if(it)g1.appendChild(el('p','sub','Tunnus: '+it.tunnus+' (kojelauta ja muut käyttöpaikat viittaavat tähän)'));
  var cText=check(g2,'Teksti',!!S0.teksti,'saadin-has-text'),fText=field(g2,'Teksti',inp(S0.teksti,'esim. Kahvi juotu'),'saadin-text');
  var cVar=check(g2,'Muuttuja',!!S0.muuttuja,'saadin-has-var');
  var fVar=field(g2,'Muuttuja',inp(S0.muuttuja,'esim. Kahvi (kpl)'),'saadin-var'),vl=el('datalist');vl.id='saadin-vars';
  mvRegistry().forEach(function(g){var op=el('option');op.value=g.nimi;vl.appendChild(op);});g2.appendChild(vl);fVar.setAttribute('list',vl.id);
  var fVal=field(g2,'Arvo (tyhjä = kysytään joka kerta)',inp(S0.arvo,''),'saadin-value');
  var fSub=field(g2,'Kohde (valinnainen)',inp(S0.kohde,''),'saadin-subject'),sl=el('datalist');sl.id='saadin-subjects';
  mvSubjects().forEach(function(n){var op=el('option');op.value=n;sl.appendChild(op);});g2.appendChild(sl);fSub.setAttribute('list',sl.id);
  var fTag=field(g2,'Havaintotunniste (valinnainen)',inp(S0.tag,'esim. ravinto'),'saadin-tag');
  var cStamp=check(g2,'Aikaleima',S0.aikaleima||!!S0.muuttuja,'saadin-has-stamp'),stampNote=el('p','sub'),stampWas=!!S0.aikaleima;g2.appendChild(stampNote);
  cStamp.addEventListener('change',function(){if(!cVar.checked)stampWas=cStamp.checked;});
  var fMode=field(g3,'Lisää vai päivitä',sel(SAADIN.TAVAT,S0.tapa),'saadin-mode');
  var fWhere=field(g3,'Minne',sel(SAADIN.MINNE,S0.minne),'saadin-where');
  var pick=el('div','saadin-pick'),fFind=el('input'),found=el('div','saadin-found'),chosen=el('p','sub'),linkki=S0.linkki;
  fFind.type='search';fFind.id='saadin-find';fFind.placeholder='Hae otsikolla';fFind.autocomplete='off';
  var fl=el('label','','Hae muistiinpano');fl.htmlFor=fFind.id;found.setAttribute('aria-label','Hakutulokset');
  pick.append(fl,fFind,found,chosen);g3.appendChild(pick);
  var fWhen=field(g3,'Aika',sel(SAADIN.AJAT,S0.aika),'saadin-when');
  var cQuick=check(g3,'Näytä pikakirjauksessa',S0.pikakirjaus!==false,'saadin-quick');
  var preview=el('p','sub saadin-preview');preview.setAttribute('aria-live','polite');form.appendChild(preview);
  function chosenText(){var n=linkki&&vNoteOf(linkki);chosen.textContent=!linkki?'Ei valittua muistiinpanoa.':n?'Valittu: '+mvTitle(n)+' ([['+linkki+']])':'[['+linkki+']] ei löydy.';}
  function search(){
    found.replaceChildren();var q=fFind.value.trim().toLocaleLowerCase('fi');if(!q)return;
    vNotes().filter(function(n){return n.vp&&!n.arch&&(mvTitle(n).toLocaleLowerCase('fi').includes(q)||n.vp.toLowerCase().includes(q));})
      .slice(0,8).forEach(function(n){
        var b=button(found,'','btn mvrow',function(){linkki=VAULT.linkSlug(n.vp);fFind.value='';found.replaceChildren();chosenText();draw();fFind.focus();});
        b.append(el('b','',mvTitle(n)),el('span','mvsrc',n.vp));
      });
    if(!found.childElementCount)found.appendChild(el('p','sub','Ei osumia.'));
  }
  fFind.addEventListener('input',search);
  function draft(){
    return {nimi:fName.value.trim(),tunnus:it?it.tunnus:'',laji:'kertanappi',teksti:cText.checked?fText.value.trim():'',
      muuttuja:cVar.checked?fVar.value.trim():'',arvo:cVar.checked?fVal.value.trim():'',kohde:cVar.checked?fSub.value.trim():'',
      tag:cVar.checked?fTag.value.trim().replace(/^#/,''):'',aikaleima:!cVar.checked&&cStamp.checked,tapa:fMode.value,minne:fWhere.value,
      linkki:fWhere.value==='teksti'?linkki:'',aika:fWhen.value,pikakirjaus:cQuick.checked,muut:S0.muut||[]};
  }
  function draw(){
    fText.closest('.dash-field').hidden=!cText.checked;
    [fVar,fVal,fSub,fTag].forEach(function(f){f.closest('.dash-field').hidden=!cVar.checked;});
    cStamp.disabled=cVar.checked;cStamp.checked=cVar.checked||stampWas;
    stampNote.textContent=cVar.checked?'Muuttujan kirjauksessa aika on aina havaintolohkossa.':'';
    pick.hidden=fWhere.value!=='teksti';if(!pick.hidden)chosenText();
    var D=draft(),now=new Date(),day=isoD(now),T=D.minne==='paiva';
    if(!D.nimi)D.nimi='Säädin';if(!D.tunnus)D.tunnus=saadinNewId(D.nimi);
    var line=SAADIN.record(D,{day:day,clock:D.aika==='nyt'?pad(now.getHours())+':'+pad(now.getMinutes()):'',value:D.arvo||'ARVO',dayNote:T,id:''});
    var where=D.minne==='teksti'?(linkki?'[['+linkki+']]':'valittu muistiinpano'):D.minne==='oma'?'oma muistiinpano (inbox)':'päivän muistiinpano, osio Pikakirjaukset';
    preview.textContent=line&&(D.teksti||D.muuttuja||D.aikaleima)?'Esimerkki: '+line.replace(/\bARVO\b/,'‹arvo›')+' → '+where:'Valitse, mitä säädin kirjoittaa.';
  }
  [cText,cVar,cStamp,fMode,fWhere,fWhen].forEach(function(c){c.addEventListener('change',draw);});
  [fName,fText,fVar,fVal,fSub,fTag].forEach(function(c){c.addEventListener('input',draw);});
  draw();
  var msg=el('p','msg');msg.id='saadin-msg';msg.setAttribute('aria-live','polite');form.appendChild(msg);
  var foot=el('div','dash-editor-footer');
  async function save(del){
    if(busy)return;if(vBusy||!vOn()){msg.textContent=vOn()?'Vault synkronoi. Yritä hetken päästä.':'Yhdistä Vault ensin.';return;}
    var next=null;
    if(!del){
      next=draft();
      if(!it)next.tunnus=saadinNewId(next.nimi);
      var bad=SAADIN.check(next);if(bad){msg.textContent=bad;return;}
    }
    busy=true;vBusy=true;vRender();sheetDialogControls(d,true);msg.textContent='Tallennetaan…';
    var ctx={repo:vRepo(),branch:G.branch};
    try{
      var r=await vWriteText(SAADIN_PATH,function(text){return SAADIN.patch(text,it,next);},del?'appi: säädin pois':'appi: säädin '+next.nimi,ctx);
      if(r.error){msg.textContent=r.error;return;}
      VC.files[SAADIN_PATH]=r.file;vSaveC();
      if(o.legacy&&!del){
        var q=await vWriteText(QUICK_PRESETS,function(text){
          var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',L=text.split(eol),i=L.indexOf(o.legacy);
          if(i<0)return text;L.splice(i,1);return L.join(eol);
        },'appi: pikakirjausnappi säätimeksi',ctx);
        if(q.error)toast('Säädin tallennettiin, mutta vanha nappi jäi pikakirjaukseen: '+q.error);
        else{VC.files[QUICK_PRESETS]=q.file;vSaveC();}
      }
      closeSheet(d);render();toast(del?'Säädin poistettu. Kirjaukset säilyvät muistiinpanoissa.':'Säädin tallennettu.');
      if(o.after)o.after(del?null:saadinById(next.tunnus));
    }catch(e){msg.textContent='Säädintä ei voitu tallentaa. Tarkista Vaultin yhteys.';}
    finally{busy=false;vBusy=false;sheetDialogControls(d,false);vRender();vFlush();}
  }
  if(it)button(foot,'Poista säädin','btn danger',function(){save(true);}).id='saadin-del';
  button(foot,'Peru','btn',function(){closeSheet(d);});
  var ok=el('button','btn primary','Tallenna');ok.type='submit';ok.id='saadin-save';foot.appendChild(ok);form.appendChild(foot);
  form.addEventListener('submit',function(e){e.preventDefault();save(false);});
  d.appendChild(form);openSheet(d);try{fName.focus({preventScroll:true});}catch(e){}
}
/* Valikko → Säätimet: luettelo, painallus, editori ja vanhat pikakirjausnapit. */
function openSaadinList(){
  var d=$('saadin-list');
  if(!d){d=el('dialog','nved dash-config');d.id='saadin-list';d.setAttribute('aria-labelledby','saadin-list-title');SMALL[d.id]=1;
    document.body.appendChild(d);d.addEventListener('close',modalSync);}
  dashEditorDismiss(d,function(){return false;});
  function draw(){
    d.replaceChildren();var h=el('h2','','Säätimet');h.id='saadin-list-title';d.appendChild(h);
    if(!vOn()){d.appendChild(el('p','sub','Säätimet tallentuvat Vaultiin. Yhdistä Vault ensin.'));button(d,'Sulje','btn',function(){closeSheet(d);});return;}
    d.appendChild(el('p','sub','Säädin tehdään kerran ja sitä käytetään missä vain. Kertanappi kirjoittaa heti, ja Kumoa näkyy hetken näytön reunassa.'));
    var msg=el('p','msg');msg.id='saadin-list-msg';msg.setAttribute('aria-live','polite');
    var list=el('div','saadin-list'),items=saadinItems();
    items.forEach(function(it){
      var row=el('div','saadin-row');
      var open=button(row,'','btn mvrow',function(){openSaadinEdit(it,{after:draw});});
      open.append(el('b','',it.nimi),el('span','mvsrc',saadinSummary(it)));open.setAttribute('aria-label','Muokkaa: '+it.nimi);
      var press=button(row,'Kirjaa','btn',function(){saadinPress(it,msg);});press.setAttribute('aria-label','Kirjaa: '+it.nimi);press.disabled=!!it.virhe;
      list.appendChild(row);
    });
    if(!items.length)list.appendChild(el('p','sub','Ei vielä säätimiä.'));
    d.append(list,msg);
    button(d,'+ Uusi säädin','btn',function(){openSaadinEdit(null,{after:draw});}).id='saadin-new';
    var old=quickPresets();
    if(old.length){
      var box=el('details','saadin-legacy');box.appendChild(el('summary','','Pikakirjauksen vanhat napit ('+old.length+')'));
      box.appendChild(el('p','sub','Muuttujanapin voi muuttaa säätimeksi: arvo ja päivä kysytään kuten ennen. Seuranta- ja muistutusnapit toimivat pikakirjauksessa entiseen tapaan.'));
      old.forEach(function(p){
        var row=el('div','saadin-row');
        row.appendChild(el('span','saadin-old',(p.mode==='muuttujat'?'Muuttuja: ':p.mode==='seuranta'?'Seuranta: ':'Muistutus: ')+p.name+(p.kind?' · '+p.kind:'')));
        if(p.mode==='muuttujat')button(row,'Tee säätimeksi','btn',function(){
          openSaadinEdit(null,{legacy:p.source,after:draw,preset:{nimi:p.name,muuttuja:p.name,aika:'kysy'}});
        }).setAttribute('aria-label','Tee säätimeksi: '+p.name);
        box.appendChild(row);
      });
      d.appendChild(box);
    }
    button(d,'Sulje','btn',function(){closeSheet(d);});
  }
  draw();if(!d.open)openSheet(d);
}
/* Kaikki 0.45: Treeni käyttää Vaultin nykyisiä liikkeitä ja kirjaa yhden CSV-rivin per sarja. */
var TRE_CSV='data/treeni.csv',TRE_SPEC='data/treeni-liikkeet.json';
var TRE_COLS=['pvm','klo','treeni','liike','liike_id','sarja','kg','toistot'];
var treMode='kirjaa',trePick='',treSession=null,treDraft=null,treSaving=false,treMessage='';
try{treSession=JSON.parse(localStorage.getItem('kaikki:treeni-kerta')||'null');}catch(e){}
function treData(){
  var file=VC.files[TRE_SPEC],data;
  try{data=file&&JSON.parse(file.t);}catch(e){return {error:'Liikkeiden tiedostoa ei voitu lukea.'};}
  if(!data||!Array.isArray(data.liikkeet)||!Array.isArray(data.ryhmat))return {error:vBusy?'Haetaan treenitietoja…':'Vaultin liiketiedostoa ei löytynyt.'};
  var csv=VC.files[TRE_CSV],parsed=dashCsv(csv?csv.t:TRE_COLS.join(','));
  if(TRE_COLS.some(function(key){return !parsed.h.includes(key);}))return {error:'Treenitaulukon sarakkeita ei tunnistettu.'};
  return {moves:data.liikkeet.filter(function(move){return move&&move.id&&move.nimi;}),
    groups:data.ryhmat,settings:data.asetukset||{},rows:parsed.rows};
}
function treRecallSession(rows,day){
  if(treSession&&treSession.day===day&&treSession.repo===vRepo()&&treSession.branch===G.branch)return treSession.id;
  var last=rows.filter(function(row){return row.pvm===day;}).pop();
  return last&&last.treeni||'kaikki-'+day;
}
function treNewSession(day){
  treSession={day:day,id:uid('treeni'),repo:vRepo(),branch:G.branch};
  try{localStorage.setItem('kaikki:treeni-kerta',JSON.stringify(treSession));}catch(e){}
  treDraft=null;treMessage='';renderTreeni();
}
function treSets(rows,session,move){
  return rows.filter(function(r){return r.treeni===session&&r.liike_id===move;});
}
function treNextSet(rows){
  return 1+rows.reduce(function(max,row){var n=Number(row.sarja);return Number.isSafeInteger(n)?Math.max(max,n):max;},0);
}
function treOneRep(kg,reps){return kg*(1+reps/30);}
function treStep(move){return dashNum(move.askel)>0?dashNum(move.askel):2.5;}
function treEstimate(previous,move){
  if(!previous.length)return null;
  var valid=previous.filter(function(r){return dashNum(r.kg)!==null&&dashNum(r.toistot)>0;});
  if(!valid.length)return null;
  var kg=Math.max.apply(null,valid.map(function(r){return dashNum(r.kg);}));
  var step=treStep(move),ideal=dashNum(move.tideal),max=dashNum(move.tmax);
  if(ideal>0){
    var best=Math.max.apply(null,valid.map(function(r){return treOneRep(dashNum(r.kg),dashNum(r.toistot));}));
    var proposed=Math.round(best/(1+ideal/30)/step)*step;
    return Math.max(0,Math.min(kg+2*step,Math.max(kg-step,proposed)));
  }
  if(max>0&&valid.filter(function(r){return dashNum(r.kg)===kg;}).every(function(r){return dashNum(r.toistot)>=max;}))return kg+step;
  return kg;
}
function treGroupsOf(value){
  return (Array.isArray(value)?value:String(value||'').split(',')).map(function(group){return String(group).trim();}).filter(Boolean);
}
function treTable(parent,label,headers,rows){
  var wrap=el('div','tre-table'),table=el('table'),head=table.createTHead().insertRow(),body=table.createTBody();
  wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',label);
  headers.forEach(function(h){var cell=el('th','',h);cell.scope='col';head.appendChild(cell);});
  rows.forEach(function(values){var row=body.insertRow();values.forEach(function(value,index){
    var cell=el(index===0?'th':'td','',value==null||value===''?'–':String(value));
    if(index===0)cell.scope='row';row.appendChild(cell);
  });});
  wrap.appendChild(table);parent.appendChild(wrap);
  if(!rows.length)parent.appendChild(el('p','sub','Ei merkintöjä.'));
}
function treNumber(parent,label,key,draft,step,min,max){
  var box=el('div','tre-field'),l=el('label','',label),line=el('div','tre-steps'),input=el('input');
  input.id='tre-'+key;input.type='text';input.inputMode=step===1?'numeric':'decimal';input.value=draft[key];
  input.autocomplete='off';l.htmlFor=input.id;box.appendChild(l);box.appendChild(line);parent.appendChild(box);
  function adjust(direction){
    var number=dashNum(input.value),next=number===null?Math.max(min,step):Math.max(min,Math.min(max,number+direction*step));
    input.value=String(Math.round(next*1000)/1000).replace('.',',');draft[key]=input.value;draft.pending=null;
  }
  var minus=button(line,'−','btn',function(){adjust(-1);});minus.setAttribute('aria-label',label+' vähemmän');
  line.appendChild(input);
  var plus=button(line,'+','btn',function(){adjust(1);});plus.setAttribute('aria-label',label+' lisää');
  input.addEventListener('input',function(){draft[key]=input.value;draft.pending=null;});
}
function renderTreeni(){
  var panel=panels.treeni;panel.textContent='';
  if(!vOn()){panel.appendChild(el('p','sub','Yhdistä GitHub-vault, jotta voit kirjata treenejä.'));return;}
  var model=treData(),bar=el('div','seg tre-nav');panel.appendChild(bar);
  [['kirjaa','Kirjaa'],['liikkeet','Liikkeet'],['ryhmat','Lihasryhmät'],['seuranta','Seuranta']].forEach(function(item){
    var b=button(bar,item[1],'',function(){treMode=item[0];main.scrollTop=0;renderTreeni();});
    b.id='tre-nav-'+item[0];b.setAttribute('aria-pressed',String(treMode===item[0]));
  });
  if(model.error){panel.appendChild(el('p','sub',model.error));return;}
  if(treMode==='seuranta'){renderTreeniStats(panel,model);return;}
  if(treMode==='liikkeet'){
    treTable(panel,'Liikkeet',['Liike','Pääkohde','Sivukohde','Toistot','Sarjat / kerta','Sarjat / jakso','Painoaskel'],
      model.moves.map(function(m){
        var ideal=dashNum(m.tideal),range=[m.tmin,m.tmax].filter(function(x){return x!=null&&x!=='';}).join('–');
        return [m.nimi,treGroupsOf(m.paa).join(', '),treGroupsOf(m.sivu).join(', '),
          range+(ideal?(range?' · ':'')+'ideaali '+ideal:''),m.skerta,m.sjakso==null?null:m.sjakso+' / '+(m.sjaksoPv||model.settings.jakso||7)+' pv',treStep(m)+' kg'];
      }));
    return;
  }
  if(treMode==='ryhmat'){
    var goals=model.settings.tavoitteet||{};
    treTable(panel,'Lihasryhmät',['Lihasryhmä','Sarjat / jakso','Jakso'],model.groups.map(function(name){
      var goal=goals[name];
      return [name,goal&&goal.n,goal&&goal.pv?goal.pv+' pv':''];
    }));
    return;
  }
  var moves=model.moves.filter(function(move){return !move.arkisto;});
  if(!moves.length){panel.appendChild(el('p','sub','Vaultissa ei ole käytössä olevia liikkeitä.'));return;}
  var day=todayIso(),session=treRecallSession(model.rows,day);
  var top=el('div','tre-top');top.appendChild(el('strong','',fromIsoW(day)));
  var actions=el('div','tre-top');top.appendChild(actions);
  var text=button(actions,'Kirjaa tekstinä','mini',function(){openTreText('');});text.disabled=treSaving;
  var start=button(actions,'Uusi treeni','mini',function(){treNewSession(day);});
  start.disabled=treSaving||!model.rows.some(function(r){return r.treeni===session;});
  panel.appendChild(top);
  var move=moves.find(function(m){return m.id===trePick;})||moves[0];trePick=move.id;
  var list=el('div','tre-moves');panel.appendChild(list);
  moves.forEach(function(item){
    var sets=treSets(model.rows,session,item.id);
    var b=button(list,item.nimi,'chip',function(){trePick=item.id;treMessage='';renderTreeni();});
    b.dataset.move=item.id;b.setAttribute('aria-pressed',String(item.id===move.id));b.disabled=treSaving;
    if(sets.length)b.appendChild(el('small','',String(sets.length)));
  });
  var todaySets=treSets(model.rows,session,move.id),previousRows=model.rows.filter(function(r){return r.liike_id===move.id&&r.treeni!==session&&r.pvm<=day;});
  var last=previousRows[previousRows.length-1],previous=last?treSets(previousRows,last.treeni,move.id):[];
  var seq=treNextSet(todaySets),suggestion=treEstimate(previous,move);
  if(!treDraft||treDraft.session!==session||treDraft.move!==move.id||treDraft.repo!==vRepo()){
    var recent=todaySets[todaySets.length-1];
    treDraft={repo:vRepo(),session:session,move:move.id,kg:recent?recent.kg:suggestion==null?'':String(Math.round(suggestion*1000)/1000),
      reps:recent?recent.toistot:String(dashNum(move.tideal)||last&&last.toistot||dashNum(move.tmax)||'')};
  }
  var form=el('form','tre-entry'),head=el('div','tre-top');form.id='tre-entry';
  head.appendChild(el('strong','',move.nimi));
  head.appendChild(el('span','','Sarja '+seq+(dashNum(move.skerta)>0?' / '+move.skerta:'')));
  form.appendChild(head);
  if(previous.length){
    var details=previous.map(function(r){return dashFmt(dashNum(r.kg),{})+' × '+r.toistot;}).join(', ');
    form.appendChild(el('p','sub tre-last','Viimeksi '+fiDate(last.pvm)+' · '+details));
  }
  if(suggestion!==null&&!todaySets.length)form.appendChild(el('p','sub tre-last','Painoehdotus '+dashFmt(suggestion,{yksikko:'kg'})));
  var fields=el('div','tre-fields'),draft=treDraft;form.appendChild(fields);
  treNumber(fields,'Toistot','reps',draft,1,1,999);
  treNumber(fields,'Paino (kg)','kg',draft,treStep(move),0,9999);
  var logged=el('div','tre-saved');todaySets.forEach(function(r){logged.appendChild(el('span','rvchip',r.sarja+'. '+dashFmt(dashNum(r.kg),{})+' × '+r.toistot));});
  if(todaySets.length)form.appendChild(logged);
  var message=el('p','sub tre-message',treMessage);message.id='tre-message';message.setAttribute('role','status');form.appendChild(message);
  var save=el('button','btn solid',treSaving?'Tallennetaan…':'Kirjaa sarja');save.type='submit';save.id='tre-save';form.appendChild(save);
  if(treSaving)form.querySelectorAll('button,input').forEach(function(control){control.disabled=true;});
  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(treSaving||vBusy){message.textContent='Vault synkronoi. Yritä hetken kuluttua.';return;}
    var kg=dashNum(draft.kg),reps=dashNum(draft.reps);
    if(kg===null||kg<0||kg>9999||!Number.isInteger(reps)||reps<1||reps>999){
      message.textContent='Tarkista paino ja toistojen määrä.';return;
    }
    var now=new Date(),values={pvm:day,klo:pad(now.getHours())+':'+pad(now.getMinutes()),treeni:session,
      liike:String(move.nimi).replace(/[,\r\n]+/g,' '),liike_id:move.id,sarja:String(seq),kg:String(kg),toistot:String(reps)};
    if(Object.values(values).some(function(value){return /[,\r\n]/.test(value);})){message.textContent='Liikkeen tunnistetta ei voitu tallentaa.';return;}
    if(!draft.pending)draft.pending=values;
    treWriteSet(draft);
  });
  panel.appendChild(form);
}
async function treWriteSet(draft){
  var values=draft.pending,scope={repo:vRepo(),branch:G.branch};
  treSaving=true;vBusy=true;treMessage='';vRender();renderTreeni();
  var conflict=false;
  try{
    var result=await vWriteText(TRE_CSV,function(text){
      var parsed=dashCsv(text||TRE_COLS.join(','));
      if(TRE_COLS.some(function(key){return !parsed.h.includes(key);}))return {error:'Treenitaulukon sarakkeita ei tunnistettu.'};
      var current=treSets(parsed.rows,values.treeni,values.liike_id),same=current.find(function(row){return row.sarja===values.sarja;});
      if(same&&TRE_COLS.every(function(key){return same[key]===values[key];}))return text;
      if(same||treNextSet(current)!==Number(values.sarja)){
        conflict=true;return {error:'Tähän liikkeeseen kirjattiin samaan aikaan uusi sarja. Tarkista sarjat ennen uutta kirjausta.'};
      }
      var eol=text.includes('\r\n')?'\r\n':'\n';
      var prior=text||TRE_COLS.join(',')+eol;
      return prior+(prior.endsWith('\n')?'':eol)+parsed.h.map(function(key){return values[key]||'';}).join(',')+eol;
    },'appi: treenisarja',scope);
    if(vRepo()!==scope.repo||G.branch!==scope.branch)return;
    if(result.file){VC.files[TRE_CSV]=result.file;vAt=vClock();vSaveC();}
    if(result.error){treMessage=result.error;if(conflict)draft.pending=null;return;}
    draft.pending=null;treMessage='Sarja '+values.sarja+' kirjattu.';
  }catch(e){treMessage='Tallennusta ei voitu vahvistaa. Sama sarja on valmis uudelleenyritykseen.';}
  finally{treSaving=false;vBusy=false;vRender();vFlush();if(tab==='treeni')renderTreeni();}
}
function treProgress(parent,label,value,max,detail){
  var row=el('div','tre-goal'),head=el('div','tre-top'),bar=el('progress');
  head.append(el('strong','',label),el('span','',detail));row.appendChild(head);
  bar.max=max;bar.value=Math.min(max,Math.max(0,value));bar.setAttribute('aria-label',label);row.appendChild(bar);
  parent.appendChild(row);
}
function treHistoryByMove(rows){
  var history=new Map();
  rows.forEach(function(row){
    var kg=dashNum(row.kg),reps=dashNum(row.toistot);
    if(kg===null||kg<0||!(reps>0)||!row.treeni||!dashDay(row.pvm))return;
    if(!history.has(row.liike_id))history.set(row.liike_id,new Map());
    var visits=history.get(row.liike_id),key=row.treeni,old=visits.get(key),value=treOneRep(kg,reps);
    if(!old||value>old.value)visits.set(key,{day:row.pvm,value:value});
  });
  return history;
}
function renderTreeniStats(panel,model){
  var day=todayIso(),start=addDays(weekStart(day),-77),first=isoD(start);
  var all=model.rows.filter(function(row){return dashDay(row.pvm)&&row.pvm<=day;});
  var counts=new Map(),weekTotals=Array(12).fill(0),visible=all.filter(function(row){return row.pvm>=first;});
  visible.forEach(function(row){counts.set(row.pvm,(counts.get(row.pvm)||0)+1);});
  panel.appendChild(el('h3','','Treenipäivät · 12 viikkoa'));
  var heat=el('div','tre-heat'),bars=el('div','tre-weeks');
  heat.setAttribute('role','img');heat.setAttribute('aria-label',counts.size+' treenipäivää 12 viikossa');
  for(var week=0;week<12;week++){
    for(var d=0;d<7;d++){
      var iso=isoD(addDays(start,week*7+d)),n=counts.get(iso)||0,cell=el('span','tre-day');
      cell.classList.toggle('tre-future',iso>day);cell.dataset.level=String(Math.min(4,n?Math.ceil(n/3):0));
      cell.title=fiDate(iso)+' · '+n+' sarjaa';cell.style.gridColumn=String(week+1);cell.style.gridRow=String(d+1);
      weekTotals[week]+=n;heat.appendChild(cell);
    }
  }
  panel.appendChild(heat);panel.appendChild(el('h3','','Viikon sarjat'));
  var max=Math.max(1,...weekTotals);
  weekTotals.forEach(function(n,i){
    var weekDate=addDays(start,i*7),column=el('div','tre-week');
    var plot=el('span','tre-week-plot');
    plot.setAttribute('role','img');plot.setAttribute('aria-label','Viikko '+isoWeekNo(weekDate)+', '+n+' sarjaa');
    var fill=el('i');fill.style.height=(100*n/max)+'%';plot.appendChild(fill);
    column.append(plot,el('span','',String(isoWeekNo(weekDate))));bars.appendChild(column);
  });
  panel.appendChild(bars);
  panel.appendChild(el('p','sub','Tällä viikolla '+weekTotals[11]+' sarjaa'));
  var moves=model.moves.filter(function(move){return !move.arkisto;}),groups=model.settings.tavoitteet||{};
  var history=treHistoryByMove(all),charts=el('div','tre-stats');
  moves.forEach(function(move){
    var visits=history.get(move.id);
    if(!visits)return;
    var values=Array.from(visits.values()).filter(function(visit){return visit.day>=first;})
      .sort(function(a,b){return a.day.localeCompare(b.day);}).map(function(visit){return visit.value;});
    if(!values.length)return;
    var row=el('div','tre-stat'),line=nvGraph(values);
    row.append(el('strong','',move.nimi),line,el('span','',dashFmt(values[values.length-1],{yksikko:'kg'})));
    charts.appendChild(row);
  });
  if(charts.children.length){panel.appendChild(el('h3','','Arvioitu maksimi · 12 viikkoa'));panel.appendChild(charts);}
  var targets=el('div','tre-stats'),side=dashNum(model.settings.sivu);
  if(side===null)side=0.5;
  var moveGroups=new Map(moves.map(function(move){return [move.id,{main:treGroupsOf(move.paa),side:treGroupsOf(move.sivu)}];}));
  function windowStart(length){return isoD(addDays(fromIso(day),1-(Number.isInteger(length)&&length>0?length:7)));}
  model.groups.forEach(function(name){
    var goal=groups[name];
    if(!goal||!(dashNum(goal.n)>0))return;
    var since=windowStart(dashNum(goal.pv)||dashNum(model.settings.jakso)),total=0;
    all.forEach(function(row){
      var m=moveGroups.get(row.liike_id);if(!m||row.pvm<since)return;
      if(m.main.includes(name))total++;
      else if(m.side.includes(name))total+=side;
    });
    treProgress(targets,name,total,dashNum(goal.n),dashFmt(total,{})+' / '+dashFmt(dashNum(goal.n),{})+' sarjaa');
  });
  moves.forEach(function(move){
    var goal=dashNum(move.sjakso);
    if(goal>0){
      var since=windowStart(dashNum(move.sjaksoPv)||dashNum(model.settings.jakso));
      var total=all.filter(function(row){return row.liike_id===move.id&&row.pvm>=since;}).length;
      treProgress(targets,move.nimi,total,goal,total+' / '+goal+' sarjaa');
    }
    var visits=Array.from((history.get(move.id)||new Map()).values()).sort(function(a,b){return a.day.localeCompare(b.day);});
    (Array.isArray(move.goals)?move.goals:[]).forEach(function(g){
      if(!g||!(dashNum(g.kg)>0)||!(dashNum(g.rep)>0))return;
      var desired=treOneRep(dashNum(g.kg),dashNum(g.rep)),latest=visits.slice(-2);
      var current=latest.length?Math.max.apply(null,latest.map(function(v){return v.value;})):0;
      var startDay=g.luotu&&Number.isFinite(new Date(g.luotu).getTime())?isoD(new Date(g.luotu)):null;
      var before=startDay?visits.filter(function(v){return v.day<=startDay;}).slice(-2):[];
      var base=before.length?Math.max.apply(null,before.map(function(v){return v.value;})):visits.length?visits[0].value:0;
      var reached=all.some(function(row){return row.liike_id===move.id&&dashNum(row.kg)>=g.kg&&dashNum(row.toistot)>=g.rep;});
      var percent=reached?100:current>=desired?99:base>=desired?0:Math.max(0,Math.round(100*(current-base)/(desired-base)));
      var label=move.nimi+' · '+dashFmt(dashNum(g.kg),{yksikko:'kg'})+' × '+g.rep;
      treProgress(targets,label,percent,100,reached?'Saavutettu':percent+' %');
    });
  });
  if(targets.children.length){panel.appendChild(el('h3','','Tavoitteet'));panel.appendChild(targets);}
}

function openTreText(text){
  var dialog=$('tre-text'),input=$('tre-text-input');
  if(!dialog.open)openSheet(dialog);
  input.value=String(text||'').replace(/^\s*treenisarja:\s*/i,'');
  $('tre-text-status').textContent='';input.focus();
}
$('tre-text-cancel').addEventListener('click',function(){closeSheet($('tre-text'));});
$('tre-text-form').addEventListener('submit',function(e){
  e.preventDefault();
  var model=treData(),msg=$('tre-text-status');
  if(model.error){msg.textContent=model.error;return;}
  if(treSaving){msg.textContent='Aiempi treenisarja tallentuu vielä.';return;}
  var parts=$('tre-text-input').value.trim().replace(/^treenisarja:\s*/i,'').split(';');
  var name=metricTextKey(parts[0]),reps=dashNum((parts[1]||'').trim()),kg=dashNum((parts[2]||'').trim());
  if(parts.length!==3||!name||!Number.isInteger(reps)||reps<1||reps>999||kg===null||kg<0||kg>9999){
    msg.textContent='Anna liike, toistot ja paino puolipisteillä erotettuna.';return;
  }
  var moves=model.moves.filter(function(move){return !move.arkisto&&(metricTextKey(move.nimi)===name||metricTextKey(move.id)===name);});
  if(moves.length!==1){msg.textContent=moves.length?'Useampi liike vastaa nimeä. Käytä liikkeen tunnusta.':'Liikettä ei löytynyt.';return;}
  var move=moves[0];trePick=move.id;treMode='kirjaa';treMessage='';
  treDraft={repo:vRepo(),session:treRecallSession(model.rows,todayIso()),move:move.id,kg:String(kg),reps:String(reps)};
  closeSheet($('tre-text'));showTab('treeni');
  $('tre-save').focus();
});

HELP.treeni=['Treeni','<p>Valitse liike, säädä toistot ja paino ja napauta Kirjaa sarja. Painoehdotus käyttää edellistä treenikertaa. Voit aloittaa samalle päivälle uuden kerran painamalla Uusi treeni. Sarjat tallentuvat Vaultiin ja näkyvät kalenterin Kirjattu-rivillä. Tekstirivin voi myös avata pikakirjauksesta tai #kirjaa=-linkillä.</p>'];

/* Kaikki 0.26: Taulukot-osio. */
var sheetState=null,sheetCreateState=null,sheetPath='';
try{sheetPath=localStorage.getItem('kaikki:taulukko')||'';}catch(e){}
/* 0.37: jäsennetyt taulukot muistiin; uusi jäsennys vain, kun taulukkotiedostot, jono tai omat muutokset (SGP) muuttuvat */
var SFC={sig:null,v:null},SGV=0;
function sheetFiles(){
  if(!vOn())return [];
  var ks=Object.keys(VC.files).filter(TAULUKKO.pathOk).sort(),sig=SGV+'|'+ks.map(function(p){var q=VC.q[p];return p+':'+VC.files[p].sha+(q?':q'+(q.del?'d':String(q.t||'').length):'');}).join(',');
  if(SFC.sig===sig)return SFC.v;var v=sheetFiles0(ks);SFC={sig:sig,v:v};return v;}
function sheetFiles0(keys){
  return keys.map(function(path){
    var queued=VC.q[path],file=VC.files[path];if(queued&&queued.del)return null;var text=queued&&queued.t||file.t,vt=sgViewOf(path,text);if(vt)return vt;
    var t=TAULUKKO.parse(path,text);return t?sgOverlay(t):null;
  }).filter(Boolean);
}
/* 0.38 (A3.1): välilehti voi olla näkymä muistiinpanoista. Alkutiedoissa `mista:` (ja `sarakkeet:`, `jarjestys:`) samassa muodossa kuin
   nakymat/-tiedostoissa; rivit tulevat muistiinpanoista vain luku -soluina, kaavasarake `- =hinta*1.24 | luku | €` lasketaan riveittäin.
   Arvot täytetään formulaContext().tables()-kutsussa, joten muut välilehdet ja kojelauta voivat viitata niihin kuten tavallisiin soluihin. */
function sgViewOf(path,text){var S=VAULT.split(text.replace(/\r\n/g,'\n'));if(!S.fm||VAULT.fmGet(S.fm,'tyyppi')!=='taulukko')return null;
  if(!VAULT.fmGet(S.fm,'mista')&&!S.fm.some(function(l){return /^sarakkeet:\s*$/.test(l);}))return null;
  var V=nvParse(path,text,'taulukko'),parts=path.match(/^taulukot\/([^/]+)\/([^/.]+)\.md$/i);if(!V||!parts)return null;
  return {path:path,book:parts[1],id:parts[2],name:VAULT.fmGet(S.fm,'otsikko')||parts[2],bookName:VAULT.fmGet(S.fm,'taulukko')||parts[1],locked:viewLockLine(S.fm),view:V,
    head:V.cols.map(function(c){return c.k.charAt(0)==='='?c.k:(NV_LAB[c.k]||(c.k.charAt(0).toUpperCase()+c.k.slice(1)));}),rows:[],notes:[],divider:V.cols.map(function(){return '---';}),lines:text.split('\n')};}
function sgViewCell(v){if(v==null)return '';if(typeof v==='object'&&!Array.isArray(v)){if('error' in v&&v.error)return String(v.error);if('value' in v)v=v.value;else if(v.k)return v.k;}
  if(Array.isArray(v))return v.map(function(x){return typeof x==='string'?'#'+x:formulaDisplay(x);}).join(' ');
  var t=typeof v==='number'?String(v):typeof v==='boolean'?(v?'kyllä':'ei'):String(v);return t.charAt(0)==='='?' '+t:t;}
function sgFillViews(sheets,notes,allowed){var vs=sheets.filter(function(s){return s.view;});if(!vs.length)return;
  var base=KAAVA.create(notes,allowed,function(){throw {code:'#PUUTTUU'};}),fx={allowed:allowed,get:function(){return base;}},today=todayIso();
  if(vs.some(function(sheet){
    return sheet.view.cols.concat(sheet.view.sort).some(function(col){return col.k==='takaisinlinkit';});
  }))fx.linkIndex=vLinkIndex();
  vs.forEach(function(s){var V=s.view,L=notes.filter(function(n){return !n.arch&&nvPass(V,n);});fx.group=L;L=nvSortList(L,V.sort,V,today,fx);s.notes=L;
    s.rows=L.map(function(n){return V.cols.map(function(c){var v;try{v=nvRaw(n,c.k,today,fx);}catch(e){v={error:'#ARVO!'};}return sgViewCell(v);});});});}
function sheetSet(path){
  sheetPath=path;try{localStorage.setItem('kaikki:taulukko',path);}catch(e){}
}
function sheetError(status,text){status.textContent=text;}
function sheetSaveFile(path,patch,message,context){
  return vWriteText(path,function(text){return viewLockIn(text)?{error:VIEW_LOCKED}:patch(text);},message,context).then(function(result){
    if(!vOn()||vRepo()!==context.repo||G.branch!==context.branch)return {error:'Vault vaihtui tallennuksen aikana.'};
    if(result.file){VC.files[path]=result.file;vSaveC();vAt=vClock();}
    return result;
  });
}
function sheetDialogControls(dialog,on){
  dialog.querySelectorAll('button,input,select').forEach(function(control){control.disabled=on;});
}
function sheetEdit(table,row,col){
  var raw=row<0?table.head[col]:table.rows[row][col],address=TAULUKKO.column(col)+(row+1);
  sheetState={table:table,row:row,col:col,raw:raw,repo:vRepo(),branch:G.branch};
  $('sheet-edit-title').textContent=row<0?'Sarake '+TAULUKKO.column(col):'Solu '+address;
  $('sheet-value').value=raw;$('sheet-edit-msg').textContent='';
  openSheet($('sheet-edit'));$('sheet-value').focus();$('sheet-value').select();
}
function editCellSnapshot(table,state,value){
  var head=table.head.slice(),rows=table.rows.map(function(row){return row.slice();});
  if(state.row<0)head[state.col]=value;else rows[state.row][state.col]=value;
  return TAULUKKO.replace(table,head,rows,table.divider);
}
$('sheet-edit-cancel').addEventListener('click',function(){closeSheet($('sheet-edit'));});
$('sheet-new-cancel').addEventListener('click',function(){closeSheet($('sheet-new'));});
$('sheet-edit-form').addEventListener('submit',async function(event){
  event.preventDefault();
  var state=sheetState,dialog=$('sheet-edit'),msg=$('sheet-edit-msg'),value=$('sheet-value').value.trim();
  if(state.raw===value){closeSheet(dialog);return;}
  if(vBusy){sheetError(msg,'Vault synkronoi. Yritä uudelleen.');return;}
  vBusy=true;vRender();sheetDialogControls(dialog,true);msg.textContent='Tallennetaan…';
  try{
    var result=await sheetSaveFile(state.table.path,function(text){
      var latest=TAULUKKO.parse(state.table.path,text);
      if(!latest||state.col>=latest.head.length||(state.row>=0&&!latest.rows[state.row]))return {error:'Taulukon rakenne muuttui.'};
      var current=state.row<0?latest.head[state.col]:latest.rows[state.row][state.col];
      if(current===value)return text;
      if(current!==state.raw)return {error:'Sama solu muuttui toisella laitteella.',conflict:true};
      return editCellSnapshot(latest,state,value);
    },'appi: taulukon solu',state);
    if(result.conflict){
      var path=state.table.path.replace(/\.md$/,'-ristiriita-'+Date.now().toString(36)+'.md');
      var contents=editCellSnapshot(state.table,state,value);
      var copy=await sheetSaveFile(path,function(current){return current?{error:'Ristiriitakopio on jo olemassa.'}:contents;},'appi: taulukon ristiriitakopio',state);
      if(copy.error){sheetError(msg,result.error+' '+copy.error);return;}
      sheetSet(path);closeSheet(dialog);render();toast('Molemmat solun versiot säilyivät. Omasi on ristiriitakopiossa.');return;
    }
    if(result.error){sheetError(msg,result.error);return;}
    closeSheet(dialog);render();
    var cell=$('sheet-cell-'+state.row+'-'+state.col);if(cell)cell.focus({preventScroll:true});
  }catch(e){sheetError(msg,'Taulukkoa ei voitu tallentaa. Tarkista yhteys.');}
  finally{sheetDialogControls(dialog,false);vBusy=false;vRender();vFlush();}
});
function sgViewFm(L){var out=[],inC=false,m=VAULT.fmGet(L,'mista');out.push('mista: '+(m||'kaikki'));if(VAULT.fmGet(L,'jarjestys'))out.push('jarjestys: '+VAULT.fmGet(L,'jarjestys'));
  L.forEach(function(l){if(/^sarakkeet:\s*$/.test(l)){inC=true;out.push(l);return;}if(inC){if(/^\s+-/.test(l)){out.push(l);return;}inC=false;}});return out;}
function showSheetCreate(table){
  var dialog=$('sheet-new');
  sheetCreateState={table:table,repo:vRepo(),branch:G.branch};
  $('sheet-new-title').textContent=table?'Uusi välilehti':'Uusi taulukko';
  $('sheet-book-name').readOnly=!!table;
  $('sheet-book-name').value=table?table.bookName:'';
  $('sheet-tab-name').value='';$('sheet-new-msg').textContent='';
  var src=$('sheet-src');src.length=1;nvViews().forEach(function(V){var o=document.createElement('option');o.value=V.id;o.textContent='Näkymä: '+V.name+' (rivit muistiinpanoista)';src.appendChild(o);});src.value='';
  openSheet(dialog);$(table?'sheet-tab-name':'sheet-book-name').focus();
}
$('sheet-new-form').addEventListener('submit',async function(event){
  event.preventDefault();
  var state=sheetCreateState,dialog=$('sheet-new'),msg=$('sheet-new-msg');
  var bookName=$('sheet-book-name').value.trim(),name=$('sheet-tab-name').value.trim();
  var book=state.table?state.table.book:VAULT.slug(bookName,64),id=VAULT.slug(name,64);
  if(!book||!id){sheetError(msg,'Anna taulukolle ja välilehdelle nimi.');return;}
  if(vBusy){sheetError(msg,'Vault synkronoi. Yritä uudelleen.');return;}
  var path='taulukot/'+book+'/'+id+'.md';
  var vsrc=$('sheet-src').value,vf=vsrc&&VC.files[vsrc],vfm=vf?VAULT.split(vf.t).fm||[]:null;
  var content=vfm?['---','tyyppi: taulukko','otsikko: '+name,'taulukko: '+bookName,'lahde: emil','luotu: '+todayIso()].concat(sgViewFm(vfm),['---','# '+name,'','Rivit tulevat muistiinpanoista näkymän ehdoilla (alkutiedot mista, jarjestys, sarakkeet).','']).join('\n'):
    ['---','tyyppi: taulukko','otsikko: '+name,'taulukko: '+bookName,'lahde: emil','luotu: '+todayIso(),'---','# '+name,'',
    TAULUKKO.joinRow(['A','B','C']),TAULUKKO.joinRow(['---','---','---']),TAULUKKO.joinRow(['','','']),''].join('\n');
  vBusy=true;vRender();sheetDialogControls(dialog,true);msg.textContent='Tallennetaan…';
  try{
    var result=await sheetSaveFile(path,function(text){return text?{error:'Samanniminen välilehti on jo olemassa.'}:content;},'appi: uusi taulukon välilehti',state);
    if(result.error){sheetError(msg,result.error);return;}
    sheetSet(path);closeSheet(dialog);render();
  }catch(e){sheetError(msg,'Välilehteä ei voitu tallentaa. Tarkista yhteys.');}
  finally{sheetDialogControls(dialog,false);vBusy=false;vRender();vFlush();}
});
async function sheetGrow(table,kind){
  if(vBusy){toast('Vault synkronoi. Yritä uudelleen.');return;}
  var state={repo:vRepo(),branch:G.branch};
  vBusy=true;vRender();
  try{
    var result=await sheetSaveFile(table.path,function(text){
      var latest=TAULUKKO.parse(table.path,text);
      if(!latest)return {error:'Taulukkoa ei löytynyt.'};
      var head=latest.head.slice(),rows=latest.rows.map(function(row){return row.slice();}),divider=latest.divider.slice();
      if(kind==='row'){
        if(rows.length>=500)return {error:'Välilehden 500 rivin raja tuli vastaan.'};
        rows.push(head.map(function(){return '';}));
      }else{
        if(head.length>=64)return {error:'Välilehden 64 sarakkeen raja tuli vastaan.'};
        head.push(TAULUKKO.column(head.length));divider.push('---');rows.forEach(function(row){row.push('');});
      }
      return TAULUKKO.replace(latest,head,rows,divider);
    },'appi: taulukon '+(kind==='row'?'uusi rivi':'uusi sarake'),state);
    if(result.error){toast(result.error);return;}render();
  }catch(e){toast('Taulukkoa ei voitu päivittää.');}
  finally{vBusy=false;vRender();vFlush();}
}
function sheetExport(table,model){
  function cell(value){
    var text=String(value??'');
    if(typeof value==='string'&&/^[\s]*[=+\-@]/.test(text))text="'"+text;
    return '"'+text.replace(/"/g,'""')+'"';
  }
  var lines=[table.head.map(cell).join(',')];
  table.rows.forEach(function(row,i){lines.push(row.map(function(_,j){
    var result=model.value(table,i,j);return cell(result.error||result.value);
  }).join(','));});
  var url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'})),a=el('a');
  a.href=url;a.download=table.id+'.csv';document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},8000);
}
/* ---- Kaikki 0.30 (Emil 22.11.2026, suunnitelma A0.1–A0.3): Taulukot kuin Sheets.
   Solut muokataan ruudukossa: valinta napsautuksella, nuolet, Enter muokkaa ja vahvistaa (alas), Tab oikealle, Esc peru, kirjoittaminen aloittaa,
   Delete tyhjentää, alue vetämällä tai Shift+nuoli, ⌘C/⌘X/⌘V (sarkaineroteltu, myös Sheetsistä), ⌘Z/⇧⌘Z. Kaavarivi näyttää valitun solun.
   Puhelimella napautus valitsee ja toinen napautus muokkaa. Muutokset kerätään (SGP) ja tallennetaan erinä vaultiin 0,9 s tauon jälkeen;
   samaan soluun toisella laitteella tullut muutos säilyy, ja oma arvo menee ristiriitakopioon kuten 0.26:ssa. Sarakkeen leveys raahataan
   otsikon reunasta (kaksoisnapsautus sovittaa) ja tallennetaan alkutietoihin `leveydet:`. Kompakti ruudukko käyttää koko leveyden. ---- */
var SGD=false;window.addEventListener('pointerup',function(){SGD=false;});
var SGP={},SGU=[],SGR=[],SG={path:'',r:0,c:0,r2:0,c2:0,edit:null},SGW={};
/* Lukumuodot kuuluvat välilehden alkutietoihin. Avain on muoto, arvo on lista soluista tai alueista. */
var SG_FORMATS={yleinen:'Yleinen',luku:'Luku',euro:'Euro (€)',prosentti:'Prosentti (%)',
  'h-min':'Tunnit ja minuutit (h min)', 'mm:ss':'Minuutit ja sekunnit (mm:ss)', paivat:'Kesto päivinä',
  'pvm-lyhyt':'Päivämäärä ja viikonpäivä (ma 30.11.)',pvm:'Päivämäärä (30.11.2026)'};
var SG_FORMAT_DECIMALS=['luku','euro','prosentti','paivat'],SG_FORMATTERS={},sgFormatCache=new WeakMap();
var sgFormatSaving=false,sgMigrationTried=new Set();
function sgFormatKey(path){return 'kaikki:sg-format:'+sgDisplayKey(path);}
function sgLegacyFormats(key){
  var formats={};
  try{
    var old=JSON.parse(localStorage.getItem(key));
    if(old&&typeof old==='object'&&!Array.isArray(old))Object.entries(old).forEach(function(pair){
      var m=/^(\d+),(\d+)$/.exec(pair[0]),f=pair[1];
      if(m&&+m[1]<500&&+m[2]<64&&Array.isArray(f)&&['luku','euro','prosentti'].includes(f[0])&&
         Number.isInteger(f[1])&&f[1]>=0&&f[1]<=6)formats[pair[0]]=f[0]+':'+f[1];
    });
  }catch(e){}
  return formats;
}
function sgFormatRange(text){
  var match=/^([a-z]{1,2}[1-9]\d*)(?:\s*:\s*([a-z]{1,2}[1-9]\d*))?$/i.exec(text.trim());
  if(!match)return null;
  var a=TAULUKKO.address(match[1]),b=match[2]?TAULUKKO.address(match[2]):a;
  return {r1:Math.min(a.row,b.row),r2:Math.max(a.row,b.row),c1:Math.min(a.col,b.col),c2:Math.max(a.col,b.col)};
}
function sgFormatRead(t){
  var cached=sgFormatCache.get(t.lines);if(cached)return cached;
  var fm=VAULT.split(t.lines.join('\n')).fm,rows=(fm||[]).filter(function(line){return /^lukumuodot[ \t]*:/.test(line);});
  var state={shared:!!rows.length,formats:{}};
  if(rows.length)try{
    var groups=JSON.parse(rows[0].slice(rows[0].indexOf(':')+1));
    if(rows.length!==1||!groups||typeof groups!=='object'||Array.isArray(groups))throw new Error();
    Object.entries(groups).forEach(function(pair){
      var f=pair[0],m=/^(.*):([0-6])$/.exec(f),ranges=pair[1];
      if(!(m&&SG_FORMAT_DECIMALS.includes(m[1])||['yleinen','h-min','mm:ss','pvm-lyhyt','pvm'].includes(f))||!Array.isArray(ranges))throw new Error();
      ranges.forEach(function(address){
        var sel=typeof address==='string'&&sgFormatRange(address);
        if(!sel||sel.r2>=500||sel.c2>=64)throw new Error();
        for(var r=sel.r1;r<=sel.r2;r++)for(var c=sel.c1;c<=sel.c2;c++){
          var k=r+','+c;if(state.formats[k])throw new Error();state.formats[k]=f;
        }
      });
    });
  }catch(e){state.formats={};state.error='Välilehden lukumuodot ovat virheelliset. Tarkista lukumuodot-rivi Vaultissa.';}
  sgFormatCache.set(t.lines,state);return state;
}
function sgFormats(t){
  var saved=sgFormatRead(t);
  if(saved.error)return saved.formats;
  var legacy=sgLegacyFormats(sgFormatKey(t.path));
  return Object.keys(legacy).length?Object.assign(legacy,saved.formats):saved.formats;
}
function sgFormatText(t,formats){
  var groups={},bottom=0;
  var rows=new Map();
  Object.entries(formats).forEach(function(pair){
    var pos=pair[0].split(',').map(Number),r=pos[0],c=pos[1];
    if(!rows.has(r))rows.set(r,[]);
    rows.get(r)[c]=pair[1];bottom=Math.max(bottom,r);
  });
  for(var r=0;r<=bottom;r++){
    var row=rows.get(r)||[];
    for(var c=0;c<row.length;c++){
      var f=row[c];if(!f)continue;
      var start=c;
      while(row[c+1]===f)c++;
      (groups[f]||(groups[f]=[])).push(sgAddress(r,start)+(c===start?'':':'+sgAddress(r,c)));
    }
  }
  var lines=t.lines.slice(),end=VAULT.split(lines.join('\n')).fm.length+1;
  var idx=lines.slice(1,end).findIndex(function(line){return /^lukumuodot[ \t]*:/.test(line);});
  lines.splice(idx<0?end:idx+1,idx<0?0:1,'lukumuodot: '+JSON.stringify(groups));
  var text=lines.join(t.eol);
  return new TextEncoder().encode(text).length<400000?text:{error:'Lukumuodot eivät mahdu Vaultin välilehtitiedostoon. Valitse pienempi alue.'};
}
function sgFormatted(value,format){
  if(format==='pvm'||format==='pvm-lyhyt'){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return formulaDisplay(value);
    var date=new Date(value+'T00:00:00Z');
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)return formulaDisplay(value);
    var day=date.getUTCDate()+'.'+(date.getUTCMonth()+1)+'.';
    return format==='pvm'?day+value.slice(0,4):['su','ma','ti','ke','to','pe','la'][date.getUTCDay()]+' '+day;
  }
  if(typeof value!=='number'||!Number.isFinite(value)||!format||format==='yleinen')return formulaDisplay(value);
  if(format==='h-min'||format==='mm:ss'){
    var whole=Math.round(Math.abs(value)*(format==='h-min'?60:1));
    if(!Number.isSafeInteger(whole))return formulaDisplay(value);
    var sign=value<0&&whole?'−':'',major=Math.floor(whole/60),minor=whole%60;
    return format==='h-min'?sign+major+' h '+minor+' min':sign+pad(major)+':'+pad(minor);
  }
  var parts=format.split(':'),kind=parts[0],places=+parts[1],formatter=SG_FORMATTERS[format];
  if(!formatter)formatter=SG_FORMATTERS[format]=new Intl.NumberFormat('fi-FI',{
    style:kind==='euro'?'currency':kind==='prosentti'?'percent':'decimal',currency:'EUR',
    minimumFractionDigits:places,maximumFractionDigits:places
  });
  return formatter.format(value)+(kind==='paivat'?' pv':'');
}
function sgCellText(result,formats,row,col){
  return result.error||sgFormatted(result.value,formats&&formats[row+','+col]);
}
async function sgSaveFormats(path,cells,field,legacy){
  if(vBusy||sgStructuralSave||sgFormatSaving)return 'Vault synkronoi. Yritä hetken päästä uudelleen.';
  var key=sgFormatKey(path),state={repo:vRepo(),branch:G.branch};
  vBusy=sgFormatSaving=true;vRender();sgStatusPaint();
  try{
    var result=await sheetSaveFile(path,function(text){
      var t=TAULUKKO.parse(path,text);
      if(!t)return {error:'Muokattavaa välilehteä ei löytynyt.'};
      var saved=sgFormatRead(t);if(saved.error)return {error:saved.error};
      // Jaettu muoto voittaa samassa osoitteessa, myös kun se on palautettu yleiseksi.
      var formats=Object.assign({},legacy,saved.formats);
      if(!cells&&saved.shared&&Object.keys(formats).length===Object.keys(saved.formats).length)return text;
      for(var cell of cells||[]){
        var k=cell.k,pos=k.split(',').map(Number),target=cell[field],current=formats[k]||null;
        if(current==='yleinen')current=null;
        if(pos[0]>=t.rows.length||pos[1]>=t.head.length)return {error:'Taulukon alue muuttui. Avaa Lukumuoto uudelleen.'};
        if(current!==cell[field==='a'?'b':'a']&&current!==target){
          return {error:'Lukumuotoa muutettiin toisaalla. Avaa Lukumuoto uudelleen.'};
        }
        formats[k]=target||'yleinen';
      }
      return sgFormatText(t,formats);
    },cells?'appi: taulukon lukumuodot':'appi: siirrä laitteen lukumuodot',state);
    if(result.error)return result.error;
    try{localStorage.removeItem(key);}catch(e){}
    return '';
  }catch(e){return 'Lukumuotoa ei voitu tallentaa. Tarkista yhteys.';}
  finally{vBusy=sgFormatSaving=false;vRender();vFlush();if(tab==='sheets')sgRefresh();}
}
function sgMigrateFormat(t,retry){
  var key=sgFormatKey(t.path);
  if(vBusy||sgStructuralSave||sgFormatSaving||(!retry&&sgMigrationTried.has(key)))return;
  var legacy=sgLegacyFormats(key);if(!Object.keys(legacy).length)return;
  sgMigrationTried.add(key);
  sgSaveFormats(t.path,null,'a',legacy).then(function(error){
    if(error)toast('Vanhoja lukumuotoja ei siirretty. '+error);
  });
}
function sgOverlay(t){var P=SGP[t.path];if(t.locked||!P||!Object.keys(P.edits).length)return t;var head=t.head.slice(),rows=t.rows.map(function(r){return r.slice();}),div=t.divider.slice();
  Object.keys(P.edits).forEach(function(k){var a=k.split(','),r=+a[0],c=+a[1];while(c>=head.length&&head.length<64){head.push(TAULUKKO.column(head.length));div.push('---');rows.forEach(function(x){x.push('');});}
    if(c>=head.length)return;if(r<0){head[c]=P.edits[k];return;}while(r>=rows.length&&rows.length<500)rows.push(head.map(function(){return '';}));if(r<rows.length)rows[r][c]=P.edits[k];});
  return Object.assign({},t,{head:head,rows:rows,divider:div});}
function sgOrig(path){var q=VC.q[path],f=VC.files[path];return f?TAULUKKO.parse(path,q&&q.t||f.t):null;}
function sgRawOf(t,r,c){if(!t)return '';if(r<0)return t.head[c]||'';return (t.rows[r]||[])[c]||'';}
function sgPending(path){var P=SGP[path];return P?Object.keys(P.edits).length:0;}
var sgStructuralSave=false;
function sgRecord(path,cells,formatKey){
  SGU.push({path:path,cells:cells,formatKey:formatKey});
  if(SGU.length>200)SGU.shift();
  SGR=[];
}
function sgSet(t,cells,noUndo){if(!t||t.locked||sgStructuralSave)return false;if(t&&t.view){var e=$('sg-status');if(e)e.textContent='Näkymän rivit tulevat muistiinpanoista: avaa muistiinpano Enterillä.';return false;}var P=SGP[t.path]||(SGP[t.path]={edits:{},base:{},timer:0,saving:false}),rec=[];var o=sgOrig(t.path);
  cells.forEach(function(x){if(x.c<0||x.c>=64||x.r>=500)return;var k=x.r+','+x.c,cur=sgRawOf(t,x.r,x.c),v=String(x.v==null?'':x.v);if(!noUndo)v=v.replace(/\r?\n/g,' ').replace(/\|/g,'¦');if(cur===v)return;
    if(!(k in P.base))P.base[k]=x.base??sgRawOf(o,x.r,x.c);P.edits[k]=v;rec.push({r:x.r,c:x.c,b:cur,a:v});});
  if(!rec.length)return false;SGV++;if(!noUndo)sgRecord(t.path,rec);
  clearTimeout(P.timer);P.timer=setTimeout(function(){sgFlush(t.path);},900);sgRefresh();return true;}
function sgStatusText(path){if(sgStructuralSave)return 'Tallennetaan rakennetta…';if(sgFormatSaving)return 'Tallennetaan lukumuotoa…';var n=sgPending(path),P=SGP[path];return P&&P.err?P.err:n?(P&&P.saving?'Tallennetaan…':'Tallentamatta '+n):'Tallennettu';}
async function sgFlush(path){var P=SGP[path];if(!P||!Object.keys(P.edits).length||!vOn())return;
  if(vBusy||P.saving){clearTimeout(P.timer);P.timer=setTimeout(function(){sgFlush(path);},1500);return;}
  var edits=Object.assign({},P.edits),base=Object.assign({},P.base),state={repo:vRepo(),branch:G.branch},conf=[];P.saving=true;P.err='';vBusy=true;vRender();sgStatusPaint();
  try{
    var res=await sheetSaveFile(path,function(text){var L=TAULUKKO.parse(path,text);if(!L)return {error:'Taulukkoa ei löytynyt.'};
      var head=L.head.slice(),rows=L.rows.map(function(r){return r.slice();}),div=L.divider.slice();conf=[];
      Object.keys(edits).forEach(function(k){var a=k.split(','),r=+a[0],c=+a[1];while(c>=head.length&&head.length<64){head.push(TAULUKKO.column(head.length));div.push('---');rows.forEach(function(x){x.push('');});}
        if(c>=head.length)return;if(r>=0)while(r>=rows.length&&rows.length<500)rows.push(head.map(function(){return '';}));if(r>=rows.length)return;
        var cur=r<0?head[c]:rows[r][c];if(cur!==base[k]&&cur!==edits[k]){conf.push(k);return;}if(r<0)head[c]=edits[k];else rows[r][c]=edits[k];});
      return TAULUKKO.replace(L,head,rows,div);},'appi: taulukon solut ('+Object.keys(edits).length+')',state);
    if(res.error){P.err=res.error;return;}
    Object.keys(edits).forEach(function(k){if(P.edits[k]===edits[k]&&conf.indexOf(k)<0){delete P.edits[k];delete P.base[k];}});SGV++;
    if(conf.length){var mine=TAULUKKO.parse(path,res.file.t),cp=path.replace(/\.md$/,'-ristiriita-'+Date.now().toString(36)+'.md');
      var h2=mine.head.slice(),r2=mine.rows.map(function(r){return r.slice();});conf.forEach(function(k){var a=k.split(','),r=+a[0],c=+a[1];if(r<0)h2[c]=edits[k];else if(r2[r])r2[r][c]=edits[k];delete P.edits[k];delete P.base[k];});
      var contents=TAULUKKO.replace(mine,h2,r2,mine.divider);var copy=await sheetSaveFile(cp,function(cur){return cur?{error:'Ristiriitakopio on jo olemassa.'}:contents;},'appi: taulukon ristiriitakopio',state);
      if(!copy.error){sheetSet(cp);toast(conf.length+' solua muuttui toisella laitteella. Niissä on toisen laitteen arvo; omasi ovat ristiriitakopiossa.');}}
  }catch(e){P.err='Tallennus ei onnistunut. Yritetään uudelleen.';clearTimeout(P.timer);P.timer=setTimeout(function(){P.err='';sgFlush(path);},5000);}
  finally{P.saving=false;vBusy=false;vRender();vFlush();if(tab==='sheets')render();else sgStatusPaint();}}
function sgFlushAll(){Object.keys(SGP).forEach(function(p){clearTimeout(SGP[p].timer);sgFlush(p);});}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')sgFlushAll();});
/* 0.40 (A3.3): rivien ja sarakkeiden lisäys, poisto ja siirto. Kohde on valinnan rivit tai sarakkeet. Muutos kirjoitetaan välilehteen
   kerralla; kaavojen viittaukset päivitetään samassa välilehdessä, muissa välilehdissä ja kojelaudan korteissa (TAULUKKO.remap). */
function sgSel(axis){var row=axis==='row';return row?[Math.max(0,Math.min(SG.r,SG.r2)),Math.max(SG.r,SG.r2)]:[Math.min(SG.c,SG.c2),Math.max(SG.c,SG.c2)];}
function sgStructMenu(m,t,axis){var row=axis==='row',a=sgSel(axis),lo=a[0],hi=a[1],n=hi-lo+1,N=row?t.rows.length:t.head.length;if(lo<0)return;
  var what=row?(n>1?'rivit '+(lo+1)+'–'+(hi+1):'rivi '+(lo+1)):(n>1?'sarakkeet '+TAULUKKO.column(lo)+'–'+TAULUKKO.column(hi):'sarake '+TAULUKKO.column(lo));
  var many=n>1?n+(row?' riviä':' saraketta'):(row?'rivi':'sarake');m.appendChild(el('div','msep'));
  menuItem(m,'sgs-'+axis+'-ib','Lisää '+many+(row?' yläpuolelle':' vasemmalle'),function(){sgStruct(t,axis,'ib');});
  menuItem(m,'sgs-'+axis+'-ia','Lisää '+many+(row?' alapuolelle':' oikealle'),function(){sgStruct(t,axis,'ia');});
  if(lo>0)menuItem(m,'sgs-'+axis+'-up',row?'Siirrä ylös':'Siirrä vasemmalle',function(){sgStruct(t,axis,'up');});
  if(hi<N-1)menuItem(m,'sgs-'+axis+'-dn',row?'Siirrä alas':'Siirrä oikealle',function(){sgStruct(t,axis,'dn');});
  if(row||n<N){var d=el('button','sgs-del','Poista '+what);d.type='button';d.id='sgs-'+axis+'-del';d.setAttribute('role','menuitem');
    d.addEventListener('click',function(){if(!d.dataset.ok){d.dataset.ok='1';d.textContent='Vahvista: poista '+what;d.classList.add('danger');return;}popClose();sgStruct(t,axis,'del');});m.appendChild(d);}}
function sgMapArr(arr,map,len,fill){var out=[];for(var j=0;j<len;j++)out.push(null);arr.forEach(function(v,i){var j=map(i);if(j>=0&&j<len)out[j]=v;});return out.map(function(v,j){return v===null?fill(j):v;});}
function sgOwnFn(target,host,sheets){
  return function(name){
    if(name===null)return host.path===target.path;
    var key=name.toLocaleLowerCase('fi').replace(/\.md$/,'');
    var matches=sheets.filter(function(s){return s.path.replace(/\.md$/,'').toLocaleLowerCase('fi')===key||s.id.toLocaleLowerCase('fi')===key;});
    var sameBook=matches.filter(function(s){return s.book===host.book;});
    if(sameBook.length)matches=sameBook;
    return matches.length===1&&matches[0].path===target.path;
  };
}
/* Kaikki 0.41: rakenne ja kaikki taulukkoviittaukset julkaistaan yhdessä commitissa. */
async function sgStructureCommit(state,path,base,build){
  async function request(endpoint,status,method,body){
    if(!vOn()||vRepo()!==state.repo||G.branch!==state.branch)throw new Error('Vault vaihtui tallennuksen aikana.');
    var result=await vApi(vUrl(endpoint),method,body);
    if(result.status!==status)throw new Error('Taulukkomuutosta ei julkaistu. Tarkista yhteys ja yritä uudelleen.');
    return result.j;
  }
  var branch=vEnc(state.branch),head=await request('/git/ref/heads/'+branch,200);
  var parent=head.object.sha,commit=await request('/git/commits/'+parent,200);
  var snapshot=await request('/git/trees/'+commit.tree.sha+'?recursive=1',200);
  if(snapshot.truncated)throw new Error('Vaultin tiedostolistaa ei saatu kokonaan. Taulukkoa ei muutettu.');
  var entries=snapshot.tree.filter(function(entry){return entry.type==='blob'&&TAULUKKO.pathOk(entry.path);});
  var target=entries.find(function(entry){return entry.path===path;});
  if(!target||target.sha!==base)throw new Error('Välilehti muuttui toisella laitteella. Näkymä päivitetään.');
  var files=new Map();
  for(var i=0;i<entries.length;i+=6){
    await Promise.all(entries.slice(i,i+6).map(async function(entry){
      var cached=VC.files[entry.path];
      var text=cached&&cached.sha===entry.sha?cached.t:b64d((await request('/git/blobs/'+entry.sha,200)).content);
      files.set(entry.path,{t:text,sha:entry.sha,mode:entry.mode||'100644'});
    }));
  }
  var changes=build(files);
  if(!changes.size)return;
  var tree=await request('/git/trees',201,'POST',{base_tree:commit.tree.sha,tree:Array.from(changes,function(pair){
    return {path:pair[0],mode:files.get(pair[0]).mode,type:'blob',content:pair[1]};
  })});
  var next=await request('/git/commits',201,'POST',{message:'appi: taulukon rakenne ja viittaukset',tree:tree.sha,parents:[parent]});
  try{
    await request('/git/refs/heads/'+branch,200,'PATCH',{sha:next.sha,force:false});
  }catch(error){
    var current;
    try{current=await request('/git/ref/heads/'+branch,200);}
    catch(e){throw new Error('Tallennuksen tilaa ei voitu varmistaa. Päivitä Vault ennen uutta muutosta.');}
    if(current.object.sha!==next.sha)throw new Error('Taulukkomuutosta ei voitu vahvistaa. Tarkista päivitetty taulukko ennen uutta muutosta.');
  }
  tree.tree.forEach(function(entry){
    if(changes.has(entry.path))VC.files[entry.path]={t:changes.get(entry.path),sha:entry.sha};
  });
  vAt=vClock();vSaveC();
}
async function sgStruct(t,axis,op,destination){
  if(t.locked||t.view||sgDisplayKey(t.path)===SGX.displayKey&&SGX.order)return;
  if(vBusy||sgStructuralSave){toast('Vault synkronoi. Yritä hetken päästä uudelleen.');return;}
  var path=t.path,a=sgSel(axis);
  if(SG.edit)sgCommit(SG.edit.val,true);
  sgStructuralSave=true;sgStatusPaint();
  try{
    for(var pending of Object.keys(SGP).filter(sgPending)){
      await sgFlush(pending);
      if(sgPending(pending)){toast('Solujen muutokset eivät vielä tallentuneet. Yritä uudelleen.');return;}
    }
    if(vBusy||SG.path!==path)return;
    t=sheetFiles().find(function(sheet){return sheet.path===path;});
    if(!t||t.view||!VC.files[path])return;
    await sgSaveStructure(t,axis,op,a,destination);
  }finally{
    sgStructuralSave=false;
    var formula=$('sg-fx'),active=sgTable();
    if(formula)formula.readOnly=!!(active&&(active.view||active.locked));
    sgStatusPaint();
  }
}
async function sgSaveStructure(t,axis,op,a,destination){
  var path=t.path;
  var row=axis==='row',lo=a[0],hi=a[1],n=hi-lo+1,N=row?t.rows.length:t.head.length,map,move=false,len=N,sel;
  if(op==='ib'||op==='ia'){var k=op==='ib'?lo:hi+1;if(N+n>(row?500:64)){toast(row?'Välilehden 500 rivin raja tulee vastaan.':'Välilehden 64 sarakkeen raja tulee vastaan.');return;}
    map=function(i){return i>=k?i+n:i;};len=N+n;sel=[k,k+n-1];}
  else if(op==='del'){map=function(i){return i<lo?i:i<=hi?-1:i-n;};len=N-n;sel=[Math.min(lo,Math.max(0,len-1)),Math.min(lo,Math.max(0,len-1))];}
  else if(op==='move'){
    if(lo!==hi||!Number.isInteger(destination)||destination<0||destination>=N||destination===lo)return;
    move=true;sel=[destination,destination];
    map=function(i){
      if(i===lo)return destination;
      if(i>lo&&i<=destination)return i-1;
      if(i<lo&&i>=destination)return i+1;
      return i;
    };
  }
  else if(op==='up'){if(lo<=0)return;move=true;map=function(i){return i===lo-1?hi:(i>=lo&&i<=hi)?i-1:i;};sel=[lo-1,hi-1];}
  else{if(hi>=N-1)return;move=true;map=function(i){return i===hi+1?lo:(i>=lo&&i<=hi)?i+1:i;};sel=[lo+1,hi+1];}
  var state={repo:vRepo(),branch:G.branch},base=VC.files[path].sha;
  var widths=row?null:sgMapArr(sgWidths(t),map,len,function(){return 110;});
  vBusy=true;vRender();
  try{
    await sgStructureCommit(state,path,base,function(files){
      var changes=new Map(),sheets=[],boards=[];
      files.forEach(function(file,p){
        var sheet=sgViewOf(p,file.t)||TAULUKKO.parse(p,file.t);
        if(sheet)sheets.push(sheet);
        else if(/\/_nakyma\.md$/.test(p)){
          var board=TAULUKKO.parse(p,file.t,'kojelauta');
          if(board&&board.head.join('|')===BOARD_HEAD.join('|'))boards.push(board);
        }
      });
      var target=sheets.find(function(sheet){return sheet.path===path;});
      if(!target||target.view)throw new Error('Muokattavaa välilehteä ei löytynyt.');
      if(target.locked)throw new Error(VIEW_LOCKED);
      sheets.filter(function(sheet){return !sheet.view;}).concat(boards).forEach(function(sheet){
        var own=sgOwnFn(target,sheet,sheets),head=sheet.head,div=sheet.divider,rows=sheet.rows;
        var isTarget=sheet.path===path,isBoard=boards.includes(sheet),changed=isTarget;
        if(isTarget&&row){
          rows=sgMapArr(rows,map,len,function(){return head.map(function(){return '';});});
          if(!rows.length)rows=[head.map(function(){return '';})];
        }else if(isTarget){
          head=sgMapArr(head,map,len,TAULUKKO.column);
          sheet.head.forEach(function(h,i){var j=map(i);if(j>=0&&h===TAULUKKO.column(i))head[j]=TAULUKKO.column(j);});
          div=sgMapArr(div,map,len,function(){return '---';});
          rows=rows.map(function(r){return sgMapArr(r,map,len,function(){return '';});});
        }
        rows=rows.map(function(r){return r.map(function(cell,i){
          if(isBoard&&i!==3)return cell;
          var next=TAULUKKO.remap(isBoard?'='+cell:cell,own,axis,map,move);
          if(isBoard)next=next.slice(1);
          if(next!==cell)changed=true;
          return next;
        });});
        if(!changed)return;
        var text=TAULUKKO.replace(sheet,head,rows,div);
        if(isTarget&&widths){
          var split=VAULT.split(text.replace(/\r\n/g,'\n'));
          var line='leveydet: '+widths.join(', '),idx=split.fm.findIndex(function(l){return /^leveydet:/.test(l);});
          if(idx<0)split.fm.push(line);else split.fm[idx]=line;
          var eol=sheet.eol;
          text=['---'].concat(split.fm,['---']).join(eol)+eol+split.body.replace(/\r?\n/g,eol);
        }
        if(text!==files.get(sheet.path).t)changes.set(sheet.path,text);
      });
      return changes;
    });
    if(widths)delete SGW[path];
    SGU=SGU.filter(function(x){return x.path!==path;});SGR=SGR.filter(function(x){return x.path!==path;});SGV++;
    if(SG.path===path){
      if(row){SG.r=sel[0];SG.r2=sel[1];}else{SG.c=sel[0];SG.c2=sel[1];}
    }
  }catch(error){toast(error.message||'Taulukkomuutoksen tilaa ei voitu varmistaa.');}
  finally{
    vBusy=false;vRender();
    await vPull();
    vFlush();render();
  }
}
function sgToCard(t){var r1=Math.max(0,Math.min(SG.r,SG.r2)),r2=Math.max(SG.r,SG.r2),c1=Math.min(SG.c,SG.c2),c2=Math.max(SG.c,SG.c2),one=r1===r2&&c1===c2;
  var cell=TAULUKKO.column(c1)+(r1+1)+(one?'':':'+TAULUKKO.column(c2)+(r2+1));formulaContext().tables();
  openBoardCard(t.book,sheetFiles().filter(function(s){return s.book===t.book;}),null,{sheet:t.id,cell:cell,kind:one?'luku':'minigraafi'});boardRangeSync();
  var h=t.head[c1];if(h&&h!==TAULUKKO.column(c1))$('board-card-title').value=h;}
function sgViewStatus(t){return 'Näkymä · '+t.rows.length+(t.rows.length===1?' muistiinpano':' muistiinpanoa');}
function sgStatusPaint(){var e=$('sg-status'),t=SG.path&&sgTable();if(e&&SG.path)e.textContent=t&&t.view?sgViewStatus(t):sgStatusText(SG.path);}
async function sgUndo(redo){if(sgStructuralSave||sgFormatSaving)return;var A=redo?SGR:SGU,B=redo?SGU:SGR,x=A[A.length-1];if(!x)return;
  var t=sheetFiles().find(function(s){return s.path===x.path;});
  if(t&&t.locked)return;
  if(!t||(x.formatKey&&x.formatKey!==sgFormatKey(t.path))){A.pop();return;}
  if(x.formatKey){
    var error=await sgSaveFormats(t.path,x.cells,redo?'a':'b',{});
    if(error){toast(error);return;}
    var wrap=$('sg-wrap');if(wrap&&SG.path===t.path)wrap.focus({preventScroll:true});
  }else sgSet(t,x.cells.map(function(c){return {r:c.r,c:c.c,v:redo?c.a:c.b};}),true);
  A.splice(A.indexOf(x),1);
  if(redo||B===SGR)B.push(x);
}
function sgWidths(t){if(SGW[t.path])return SGW[t.path];var fm=VAULT.split(t.lines.join('\n')).fm,w=(VAULT.fmGet(fm,'leveydet')||'').split(',').map(function(x){return parseInt(x,10);});
  return t.head.map(function(_,j){return (t.view&&t.view.cols[j].w)||(w[j]>=40&&w[j]<=800?w[j]:(j===0?160:110));});}
async function sgSaveWidths(t,ws){if(vBusy){setTimeout(function(){sgSaveWidths(t,ws);},1500);return;}var state={repo:vRepo(),branch:G.branch};vBusy=true;vRender();
  try{await sheetSaveFile(t.path,function(text){var S=VAULT.split(text);if(!S.fm)return text;var L=VAULT.fmSet(S.fm,'leveydet',ws.join(', '));if(L.join('\n')===S.fm.join('\n'))L=S.fm.concat(['leveydet: '+ws.join(', ')]);
      if(!L.some(function(l){return /^leveydet:/.test(l);}))L=L.concat(['leveydet: '+ws.join(', ')]);return '---\n'+L.join('\n')+'\n---\n'+S.body;},'appi: taulukon sarakeleveydet',state);delete SGW[t.path];}
  catch(e){}finally{vBusy=false;vRender();vFlush();}}
/* 0.68: kaavan luonnos pysyy lähtösolussa myös silloin, kun ruudukko näyttää toista välilehteä. */
var sgFormula=null,sgFormulaInput=null;
function sgAddress(r,c){return TAULUKKO.column(c)+(r+1);}
function sgFormulaControls(){
  var tools=$('sg-formula-tools'),fx=$('sg-fx'),d=sgFormula;
  if(!tools)return;
  var t=sgTable(),input=sgFormulaInput&&sgFormulaInput.isConnected?sgFormulaInput:fx;
  var canPick=t&&!t.locked&&!t.view&&!sgStructuralSave&&SG.r>=0&&!!t.rows[SG.r]&&(d?d.value:input.value).trimStart().startsWith('=');
  var picking=d&&d.picking;
  tools.hidden=!d&&!canPick;
  $('sg-pick').hidden=!!picking||!canPick;
  $('sg-pick-range').hidden=!picking;
  $('sg-pick-range').setAttribute('aria-pressed',picking&&d.range?'true':'false');
  $('sg-pick-use').hidden=!picking;
  $('sg-pick-use').disabled=!picking||!d.preview;
  $('sg-pick-back').hidden=!picking;
  $('sg-formula-save').hidden=!d||!!picking;
  $('sg-formula-cancel').hidden=!d;
  var info=$('sg-formula-info'),message='';
  if(d){
    message='Kaava: '+d.name+' · '+sgAddress(d.r,d.c);
    if(picking)message+=d.preview?' · Viite: '+t.name+' · '+d.preview.label+(SGX.order&&d.preview.r!==d.preview.r2?' · Alkuperäiset rivit':''):
      d.range?' · Valitse alueen alku- ja loppusolu.':' · Valitse solu tai alue.';
    else if(d.mark)message+=' · Viite: '+d.mark.name+' · '+d.mark.label;
  }
  if(info.textContent!==message)info.textContent=message;
  $('sg-more').disabled=!!d;
  var tabAdd=document.querySelector('.sg-tabadd');if(tabAdd)tabAdd.disabled=!!d||!!t?.locked;
  var lock=$('sg-lock');if(lock)lock.disabled=!!d||viewLockChanging;
  document.querySelectorAll('.sg-tab:not(.sg-tabadd),.sg-book').forEach(function(b){b.disabled=!!d&&!picking;});
}
function sgFormulaTools(panel){
  var tools=el('div','sg-formula-tools');tools.id='sg-formula-tools';tools.hidden=true;
  function action(id,label,fn){
    var b=button(tools,label,'btn',fn);b.id=id;return b;
  }
  var pick=action('sg-pick','Valitse solu',sgPickStart);
  pick.addEventListener('pointerdown',function(e){e.preventDefault();});
  action('sg-pick-range','Valitse alue',function(){
    sgFormula.range=!sgFormula.range;sgFormulaControls();
    if(sgFormula.preview)$('sg-wrap').focus({preventScroll:true});
  });
  action('sg-pick-use','Käytä viitettä',function(){sgPickReturn(true);});
  action('sg-pick-back','Kaavariville',function(){sgPickReturn(false);});
  action('sg-formula-save','Tallenna kaava',function(){sgFormulaFinish(true);});
  action('sg-formula-cancel','Peru',function(){sgFormulaFinish(false);});
  var info=el('span','sg-formula-info');info.id='sg-formula-info';info.setAttribute('role','status');
  tools.appendChild(info);panel.appendChild(tools);
  tools.addEventListener('keydown',function(e){
    if(sgFormula&&e.key==='Escape'){e.preventDefault();e.stopPropagation();sgFormulaFinish(false);}
  });
}
function sgPickStart(){
  var t=sgTable(),input=sgFormulaInput&&sgFormulaInput.isConnected?sgFormulaInput:$('sg-fx');
  if(!t||t.view||!t.rows[SG.r]||sgStructuralSave||!input.value.trimStart().startsWith('='))return;
  if(!sgFormula)sgFormula={path:t.path,name:t.name,repo:vRepo(),branch:G.branch,r:SG.r,c:SG.c,base:sgRawOf(t,SG.r,SG.c)};
  var d=sgFormula;
  d.value=input.value;d.start=input.selectionStart;d.end=input.selectionEnd;
  d.picking=true;d.range=false;d.preview=null;d.mark=null;
  SG.edit=null;var wrap=$('sg-wrap'),inline=wrap.querySelector('.sg-ed');if(inline)inline.remove();
  var fx=$('sg-fx');fx.value=d.value;fx.readOnly=true;fx.dataset.formulaDraft='true';sgFormulaInput=fx;
  sgPaint(true);wrap.focus({preventScroll:true});
}
function sgPickCell(t,r,c,extend){
  var d=sgFormula;
  if(!t.rows[r]||c<0||c>=t.head.length)return;
  if(!extend||!d.preview){SG.r=r;SG.c=c;}
  SG.r2=r;SG.c2=c;
  sgPickPreview(t);
  sgPaint();
}
function sgPickPreview(t){
  var r=Math.min(SG.r,SG.r2),r2=Math.max(SG.r,SG.r2),c=Math.min(SG.c,SG.c2),c2=Math.max(SG.c,SG.c2);
  sgFormula.preview={path:t.path,name:t.name,r:r,c:c,r2:r2,c2:c2,
    label:sgAddress(r,c)+(r===r2&&c===c2?'':':'+sgAddress(r2,c2))};
}
function sgFormulaOrigin(d){
  var same=vOn()&&d.repo===vRepo()&&d.branch===G.branch;
  return same&&sheetFiles().find(function(t){return t.path===d.path&&!t.view&&t.rows[d.r]&&d.c<t.head.length;});
}
function sgFormulaGoBack(d){
  if(!sgFormulaOrigin(d))return false;
  sheetSet(d.path);Object.assign(SG,{path:d.path,r:d.r,r2:d.r,c:d.c,c2:d.c,edit:null});
  return true;
}
function sgPickReturn(use){
  var d=sgFormula,p=d.preview,t=sgTable();
  if(use&&(!p||!t||p.path!==t.path||!t.rows[p.r2]||p.c2>=t.head.length))return;
  if(!sgFormulaGoBack(d)){toast('Lähtösolua ei enää löydy. Voit kopioida kaavan kaavariviltä.');return;}
  if(use){
    var prefix=t.path===d.path?'':'[['+t.path.replace(/\.md$/,'')+']]!';
    var ref=prefix+p.label;
    d.value=d.value.slice(0,d.start)+ref+d.value.slice(d.end);
    d.start+=ref.length;d.end=d.start;d.mark=p;
  }
  d.picking=false;d.preview=null;
  render();sgPaint();
  var fx=$('sg-fx');fx.focus({preventScroll:true});fx.setSelectionRange(d.start,d.end);
}
function sgFormulaFinish(save){
  var d=sgFormula,t=sgFormulaOrigin(d);
  if(save&&t?.locked){toast(VIEW_LOCKED);return;}
  if(save&&(!t||sgStructuralSave)){toast('Kaavaa ei voitu tallentaa tähän soluun.');return;}
  sgFormula=null;sgFormulaGoBack(d);render();
  if(save)sgSet(t,[{r:d.r,c:d.c,v:d.value.trim(),base:d.base}]);
  sgPaint();var wrap=$('sg-wrap');if(wrap)wrap.focus({preventScroll:true});
}
function renderSheets(){
  var p=panels.sheets,files=sheetFiles(),focus=document.activeElement,had=p.contains(focus),ow=$('sg-wrap'),osc=ow?[ow.scrollTop,ow.scrollLeft]:null;
  var caret=sgFormula&&focus===$('sg-fx')?[focus.selectionStart,focus.selectionEnd]:null,oldPath=SGX.path;
  if(sgFormula&&(!vOn()||sgFormula.repo!==vRepo()||sgFormula.branch!==G.branch))sgFormula=null;
  if(SGX.resize)SGX.resize.disconnect();
  p.textContent='';
  if(!vOn()){p.appendChild(el('p','sub','Yhdistä GitHub-vault, jotta voit käyttää taulukoita.'));return;}
  var active=files.find(function(s){return s.path===sheetPath;})||files[0];
  var top=el('div','sg-top');p.appendChild(top);
  var bk=button(top,'','treepick sg-book',function(){
    if(!active&&!nvPendHere().some(function(e){return e.D.kind==='taulukko';})){showSheetCreate(null);return;}
    var m=$('sortpop');m.textContent='';m.setAttribute('aria-label','Taulukko');var seen={};
    files.forEach(function(s){if(seen[s.book])return;seen[s.book]=1;var b=menuItem(m,'sgb-'+s.book,s.bookName,function(){sheetSet(s.path);render();});b.setAttribute('aria-current',active&&s.book===active.book?'true':'false');});
    if(!sgFormula)menuItem(m,'sgb-new','Uusi taulukko…',function(){showSheetCreate(null);});if(!active)nvPendMenu(m,true);anchoredMenu('sortpop',bk);});
  bk.setAttribute('aria-haspopup','menu');bk.setAttribute('aria-label','Taulukko: '+(active?active.bookName:'ei taulukoita'));bk.appendChild(el('span','',active?active.bookName:'Uusi taulukko'));bk.insertAdjacentHTML('beforeend',CHEV);
  if(!active){sgFormula=null;return;}
  if(SG.path!==active.path){SG={path:active.path,r:0,c:0,r2:0,c2:0,edit:null};if(sgFormula)sgFormula.preview=null;}if(active.view)formulaContext().tables();if(active.view||active.locked)SG.edit=null;
  var R=active.rows.length,C=active.head.length,model=formulaContext().tables(),displayKey=sgDisplayKey(active.path);
  var display=!active.view&&sgDisplaySettings.get(displayKey),order=display?sgDisplayOrder(active,model,display):null;
  var N=order?order.length:R,positions=order?new Map(order.map(function(row,i){return [row,i];})):null;
  if(order){
    if(!positions.has(SG.r))SG.r=SG.r2=order[0]??-1;
    else if(!positions.has(SG.r2))SG.r2=SG.r;
  }else{
    if(SGX.order&&SG.r<0)SG.r=SG.r2=0;
    SG.r=Math.min(SG.r,Math.max(0,R-1));SG.r2=Math.min(SG.r2,Math.max(0,R-1));
  }
  SG.c=Math.min(SG.c,C-1);SG.c2=Math.min(SG.c2,C-1);
  var addr=el('span','sg-addr');addr.id='sg-addr';top.appendChild(addr);
  var fx=el('input','sg-fx');fx.id='sg-fx';fx.type='text';fx.autocomplete='off';fx.setAttribute('autocapitalize','off');fx.spellcheck=false;fx.setAttribute('aria-label','Kaava tai arvo');top.appendChild(fx);
  var st=el('span','sg-status',active.view?sgViewStatus(active):sgStatusText(active.path));st.id='sg-status';st.setAttribute('aria-live','polite');top.appendChild(st);
  var mb=button(top,'','treepick sg-more',function(){var m=$('sortpop');m.textContent='';m.setAttribute('aria-label','Taulukon toiminnot');
    if(active.locked){menuItem(m,'sgm-csv','Vie CSV',function(){sheetExport(sgTable(),formulaContext().tables());});anchoredMenu('sortpop',mb);return;}
    menuItem(m,'sgm-freeze','Jäädytä rivit ja sarakkeet…',sgFreezeOpen);
    if(active.view)menuItem(m,'sgm-view-edit','Muokkaa näkymävälilehteä',function(){nvEdit(active.view,'taulukko');});
    else{
      sgDisplayMenu(m,SG.c);
      if(SG.r>=0&&sgCanUseSourceRange())menuItem(m,'sgm-format','Lukumuoto…',sgFormatOpen);
      var formatKey=sgFormatKey(active.path);
      if(sgMigrationTried.has(formatKey)&&Object.keys(sgLegacyFormats(formatKey)).length){
        menuItem(m,'sgm-format-import','Synkronoi vanhat lukumuodot',function(){sgMigrateFormat(active,true);});
      }
      var undo=SGU[SGU.length-1],redo=SGR[SGR.length-1];
      if(undo&&undo.formatKey===formatKey)menuItem(m,'sgm-format-undo','Kumoa lukumuoto',function(){sgUndo(false);});
      if(redo&&redo.formatKey===formatKey)menuItem(m,'sgm-format-redo','Tee lukumuoto uudelleen',function(){sgUndo(true);});
      if(!SGX.order&&active.rows.length>1&&SG.c===SG.c2&&Math.min(SG.r,SG.r2)>=0&&Math.min(SG.r,SG.r2)<active.rows.length-1){
        menuItem(m,'sgm-fill','Täytä alas…',function(){sgFillOpen();});
      }
      if(!SGX.order){menuItem(m,'sgm-row','+ Rivi loppuun',function(){sheetGrow(active,'row');});menuItem(m,'sgm-col','+ Sarake loppuun',function(){sheetGrow(active,'column');});}
    }
    menuItem(m,'sgm-tab','+ Välilehti',function(){showSheetCreate(active);});
    if(sgCanUseSourceRange())menuItem(m,'sgm-card','Kortiksi kojelautaan',function(){sgToCard(active);});
    if(!active.view&&!SGX.order){sgStructMenu(m,active,'row');sgStructMenu(m,active,'col');}menuItem(m,'sgm-csv','Vie CSV',function(){sheetExport(sgTable(),formulaContext().tables());});
    menuItem(m,'sgm-new','Uusi taulukko…',function(){showSheetCreate(null);});nvPendMenu(m,true);anchoredMenu('sortpop',mb);});
  mb.id='sg-more';mb.setAttribute('aria-haspopup','menu');mb.setAttribute('aria-label','Taulukon toiminnot');mb.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4.5" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="15.5" cy="10" r="1.6"/></svg>';
  viewLockButton(top,'sg-lock',active.path,'taulukko',active.locked);
  sgFormulaTools(p);
  if(display){
    var bar=el('div','sg-view-bar'),count=el('span','',N+' / '+R+' riviä');
    count.setAttribute('role','status');bar.appendChild(count);
    if(!active.locked){var reset=button(bar,'Palauta oma järjestys','btn',function(){sgDisplayApply(displayKey,null);});reset.id='sg-display-reset';}
    p.appendChild(bar);
  }
  var ws=sgWidths(active);
  var wrap=el('div','sg-wrap'+(active.view||active.locked?' sg-ro':''));wrap.id='sg-wrap';fx.readOnly=!!active.view||active.locked||!N;if(active.view)fx.title='Rivit tulevat muistiinpanoista';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',active.name);
  var table=el('table','sg');table.setAttribute('role','grid');var cg=el('colgroup');cg.appendChild(el('col','sg-rnc'));ws.forEach(function(w){var c=el('col');c.style.width=w+'px';cg.appendChild(c);});table.appendChild(cg);table.style.width=ws.reduce(function(a,w){return a+w;},40)+'px';
  var thead=el('thead'),hr=el('tr');hr.appendChild(el('th','sg-corner'));
  active.head.forEach(function(title,j){var th=el('th','sg-ch');th.dataset.c=j;th.dataset.r=-1;var L=TAULUKKO.column(j);th.appendChild(el('b','',L));if(title&&title!==L)th.appendChild(el('span','sg-col-title',title));
    th.setAttribute('aria-label','Sarake '+L+(title&&title!==L?', '+title:''));if(!active.locked&&(!active.view||!active.view.cols[j].w)){
      var rz=el('i','sg-rz');rz.dataset.c=j;rz.setAttribute('aria-hidden','true');th.appendChild(rz);
    }
    if(display){
      var sort=display.sort&&display.sort.col===j?display.sort.dir:0,filter=display.filters.has(j);
      if(sort)th.setAttribute('aria-sort',sort===1?'ascending':'descending');
      if(sort||filter){
        var mark=el('span','sg-view-mark',(sort===1?'↑':sort===-1?'↓':'')+(filter?' ·':''));
        mark.setAttribute('aria-hidden','true');th.appendChild(mark);
      }
      if(filter)th.setAttribute('aria-label',th.getAttribute('aria-label')+', suodatettu');
    }
    hr.appendChild(th);});
  thead.appendChild(hr);table.appendChild(thead);
  var tb=el('tbody'),v=N>SGVIRT,keep=SGX.path===active.path,pins=sgFreezeRead(active);
  pins.rows=Math.min(pins.rows,N);
  SGX={path:active.path,total:R,count:N,v:v,a:0,b:N,rh:keep&&SGX.rh||28,hh:keep&&SGX.hh||30,raf:0,
    body:tb,prefix:v?pins.rows:0,pins:pins,fr:0,fc:0,left:0,order:order,positions:positions,displayKey:displayKey};
  if(v){var st0=osc&&keep?osc[0]:0,top0=Math.floor(st0/SGX.rh);if(!osc&&sgPosition(SG.r)>0)top0=Math.max(0,sgPosition(SG.r)-10);var a0=Math.max(0,top0-SGBUF),b0=Math.min(N,top0+Math.ceil(innerHeight/SGX.rh)+SGBUF);sgFill(tb,active,model,a0,b0);}
  else sgFill(tb,active,model,0,N);
  table.appendChild(tb);wrap.appendChild(table);p.appendChild(wrap);
  if(order&&!N)p.appendChild(el('p','sub sg-view-empty','Suodatukseen ei ole osumia.'));
  var tabs=el('div','sg-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Välilehdet');
  files.filter(function(s){return s.book===active.book;}).forEach(function(sheet){var b=button(tabs,sheet.name+(sheet.id.indexOf('-ristiriita-')>=0?' · ristiriitakopio':''),'sg-tab',function(){sgFlushAll();sheetSet(sheet.path);render();});b.setAttribute('aria-pressed',sheet.path===active.path?'true':'false');});
  if(!active.locked){var nt=button(tabs,'+','sg-tab sg-tabadd',function(){showSheetCreate(active);});nt.setAttribute('aria-label','Uusi välilehti');}p.appendChild(tabs);
  var firstRow=tb.querySelector('tr:not(.sg-sp)');
  SGX.hh=thead.offsetHeight||SGX.hh;
  if(firstRow&&firstRow.offsetHeight&&firstRow.offsetHeight!==SGX.rh){SGX.rh=firstRow.offsetHeight;if(v)sgFill(tb,active,model,SGX.a,SGX.b);}
  if(pins.rows||pins.cols){
    sgFreezeLayout(wrap,table,ws);
    if(typeof ResizeObserver==='function'){
      SGX.resize=new ResizeObserver(function(){if($('sg-wrap')===wrap)sgFreezeLayout(wrap,table,sgWidths(active));});
      SGX.resize.observe(wrap);
    }
  }
  if(v||pins.rows||pins.cols)wrap.addEventListener('scroll',sgScroll,{passive:true});
  if(v&&!osc&&sgPosition(SG.r)>0)wrap.scrollTop=sgPosition(SG.r)*SGX.rh-60;
  if(osc&&(!sgFormula||oldPath===active.path)){wrap.scrollTop=osc[0];wrap.scrollLeft=osc[1];}
  sgBind(active,wrap,table,fx,addr);sgPaint(true);
  if(sgFormula){
    fx.readOnly=sgFormula.picking;fx.value=sgFormula.value;fx.dataset.formulaDraft='true';
    if(caret){fx.focus({preventScroll:true});fx.setSelectionRange(caret[0],caret[1]);}
    else if(had)wrap.focus({preventScroll:true});
  }else if(SG.edit)sgEditOpen(SG.edit.val,true);else if(had||document.activeElement===document.body)try{wrap.focus({preventScroll:true});}catch(e){}
  if(!active.locked&&!active.view&&!sgFormula)sgMigrateFormat(active);
}
/* 0.37: iso taulukko (yli SGVIRT riviä) virtualisoidaan: DOMissa vain näkyvät rivit ja puskuri, ylä- ja alapuolella tyhjät välirivit
   oikean korkuisina. Vieritys vaihtaa ikkunan. Pienet taulukot piirretään kokonaan. */
var SGVIRT=200,SGBUF=40,SGX={path:null,total:0,v:false,a:0,b:0,rh:28,hh:30,raf:0};
/* 0.76: näytön rivi viittaa aina alkuperäiseen taulukkoriviin. */
var sgDisplaySettings=new Map(),sgCollator=new Intl.Collator('fi',{numeric:true,sensitivity:'base'});
function sgDisplayKey(path){return JSON.stringify([vRepo().toLowerCase(),G.branch,path]);}
function sgFilterText(value){return String(value??'').trim().normalize('NFC').toLocaleLowerCase('fi');}
function sgDisplayOrder(t,model,settings){
  var rules=Array.from(settings.filters).filter(function(pair){return pair[0]<t.head.length;});
  var sort=settings.sort&&settings.sort.col<t.head.length?settings.sort:null,entries=[];
  t.rows.forEach(function(_,row){
    var pass=rules.every(function(pair){
      var rule=pair[1],result=model.value(t,row,pair[0]),text=sgFilterText(result.error||formulaDisplay(result.value));
      if(rule.mode==='empty')return !text;
      if(rule.mode==='filled')return !!text;
      if(rule.mode==='equal')return !result.error&&typeof result.value==='number'&&rule.number!==null?
        result.value===rule.number:text===rule.text;
      return text.includes(rule.text);
    });
    if(!pass)return;
    var result=sort&&model.value(t,row,sort.col),value=result&&!result.error?result.value:null;
    entries.push({row:row,value:value==null||String(value).trim()===''?null:value});
  });
  if(sort)entries.sort(function(a,b){
    var x=a.value,y=b.value;
    if(x===y)return a.row-b.row;
    if(x===null||y===null)return x===null?1:-1;
    var xn=typeof x==='number',yn=typeof y==='number';
    var cmp=xn&&yn?x-y:xn!==yn?(xn?-1:1):sgCollator.compare(formulaDisplay(x),formulaDisplay(y));
    return cmp*sort.dir||a.row-b.row;
  });
  return entries.map(function(entry){return entry.row;});
}
function sgPosition(row){return SGX.positions?(SGX.positions.get(row)??-1):row;}
function sgSourceAt(index){return index>=0&&index<SGX.count?(SGX.order?SGX.order[index]:index):-1;}
function sgSelectDisplayedColumn(col){
  SG.c=SG.c2=col;SG.r=sgSourceAt(0);SG.r2=sgSourceAt(SGX.count-1);
}
function sgSelectionBounds(){
  var a=sgPosition(SG.r),b=sgPosition(SG.r2);
  return [Math.min(a,b),Math.max(a,b)];
}
function sgSelectedRows(){
  if(SG.r<0)return !SGX.order||SGX.count?[-1]:[];
  var bounds=sgSelectionBounds(),rows=[];
  for(var p=Math.max(0,bounds[0]);p<=Math.min(bounds[1],SGX.count-1);p++)rows.push(sgSourceAt(p));
  return rows;
}
function sgCanUseSourceRange(){
  if(!SGX.count)return false;
  if(!SGX.order)return true;
  var rows=sgSelectedRows(),lo=Math.min(SG.r,SG.r2),hi=Math.max(SG.r,SG.r2);
  return rows.length===hi-lo+1&&rows.every(function(row){return row>=lo&&row<=hi;});
}
function sgDisplayMenu(menu,col){
  menuItem(menu,'sgm-display','Sarake '+TAULUKKO.column(col)+' · Suodata ja lajittele…',function(){sgDisplayOpen(col);});
}
function sgDisplayApply(key,settings){
  if(settings&&(settings.sort||settings.filters.size))sgDisplaySettings.set(key,settings);
  else sgDisplaySettings.delete(key);
  var wrap=$('sg-wrap');if(wrap)wrap.scrollTop=0;
  render();
  SG.r=SG.r2=sgSourceAt(0);SG.c2=SG.c;
  sgPaint(true);
  wrap=$('sg-wrap');if(wrap)wrap.focus({preventScroll:true});
}
function sgDisplayOpen(col){
  var t=sgTable();
  if(!t||t.locked||t.view||sgFormula||sgStructuralSave||col<0||col>=t.head.length)return;
  var key=sgDisplayKey(t.path),settings=sgDisplaySettings.get(key),rule=settings&&settings.filters.get(col),d=$('sg-display-dialog');
  if(!d){
    d=el('dialog');d.id='sg-display-dialog';d.setAttribute('aria-labelledby','sg-display-title');
    SMALL[d.id]=1;document.body.appendChild(d);
  }
  d.textContent='';
  var letter=TAULUKKO.column(col),name=t.head[col],title=el('h2','','Sarake '+letter+(name&&name!==letter?' · '+name:''));
  title.id='sg-display-title';
  var form=el('form'),sort=el('select'),mode=el('select'),value=el('input'),msg=el('p','msg'),actions=el('div','btnrow');
  msg.setAttribute('role','status');
  function field(node,id,label,options){
    node.id=id;
    var l=el('label','fl',label);l.htmlFor=id;form.append(l,node);
    options.forEach(function(pair){var option=el('option','',pair[1]);option.value=pair[0];node.appendChild(option);});
    return l;
  }
  field(sort,'sg-display-sort','Lajittelu',[['0','Ei lajittelua tässä sarakkeessa'],['1','Nouseva'],['-1','Laskeva']]);
  field(mode,'sg-display-mode','Suodatus',[['','Kaikki arvot'],['contains','Sisältää tekstin'],['equal','On yhtä suuri kuin'],['empty','On tyhjä'],['filled','Sisältää arvon']]);
  var valueLabel=field(value,'sg-display-value','Etsittävä arvo',[]);
  sort.value=settings&&settings.sort&&settings.sort.col===col?settings.sort.dir:0;
  mode.value=rule?rule.mode:'';value.value=rule?rule.input:'';
  value.maxLength=300;value.autocomplete='off';
  function update(){
    var needed=mode.value==='contains'||mode.value==='equal';
    value.hidden=valueLabel.hidden=!needed;value.disabled=!needed;value.required=needed;
  }
  mode.addEventListener('change',update);update();
  button(actions,'Peru','btn',function(){closeSheet(d);});
  var apply=el('button','btn solid','Käytä');apply.type='submit';actions.appendChild(apply);
  form.append(msg,actions);d.append(title,form);
  d.onclick=function(e){
    if(e.target!==d)return;
    var box=d.getBoundingClientRect();
    if(e.clientX<box.left||e.clientX>=box.right||e.clientY<box.top||e.clientY>=box.bottom)closeSheet(d);
  };
  d.oncancel=function(e){e.preventDefault();closeSheet(d);};
  d.addEventListener('close',function(){var w=$('sg-wrap');if(w)w.focus({preventScroll:true});},{once:true});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var current=sgTable();
    if(tab!=='sheets'||!current||current.locked||current.view||sgStructuralSave||sgDisplayKey(current.path)!==key||current.head[col]!==name){
      msg.textContent='Sarake muuttui. Avaa valikko uudelleen.';return;
    }
    var input=value.value.trim();
    if(value.required&&!input){msg.textContent='Anna etsittävä arvo.';return;}
    var latest=sgDisplaySettings.get(key),filters=new Map(latest&&latest.filters),order=latest&&latest.sort;
    if(mode.value)filters.set(col,{mode:mode.value,input:input,text:sgFilterText(input),number:dashNum(input)});
    else filters.delete(col);
    if(+sort.value)order={col:col,dir:+sort.value};
    else if(order&&order.col===col)order=null;
    closeSheet(d);sgDisplayApply(key,{filters:filters,sort:order});
  });
  openSheet(d);sort.focus({preventScroll:true});
}
var SG_FREEZE_ROWS=5,SG_FREEZE_COLS=3;
function sgFreezeKey(path){return 'kaikki:sg-freeze:'+JSON.stringify([vRepo().toLowerCase(),G.branch,path]);}
function sgFreezeRead(t){
  var choice=null;
  try{choice=JSON.parse(localStorage.getItem(sgFreezeKey(t.path)));}catch(e){}
  return {
    rows:sgFreezeCount(choice&&choice.rows,Math.min(t.rows.length,SG_FREEZE_ROWS)),
    cols:sgFreezeCount(choice&&choice.cols,Math.min(t.head.length,SG_FREEZE_COLS))
  };
}
function sgFreezeCount(n,max){return Number.isInteger(n)?Math.max(0,Math.min(n,max)):0;}
function sgFreezeColumns(tr,count){
  for(var c=0;c<Math.min(tr.cells.length-1,SG_FREEZE_COLS);c++){
    var cell=tr.cells[c+1],pinned=c<count;
    cell.classList.toggle('sg-pc',pinned);
    cell.classList.toggle('sg-pc-edge',c===count-1);
    if(pinned)cell.style.setProperty('--sg-pin-left','var(--sg-col-'+c+')');
    else cell.style.removeProperty('--sg-pin-left');
  }
}
function sgFreezeLayout(w,table,widths){
  if(!w.clientWidth||!w.clientHeight)return;
  var grid=SGX,left=table.tHead.rows[0].cells[0].offsetWidth||40,cols=0;
  for(;cols<grid.pins.cols;cols++){
    var end=left+widths[cols],room=cols+1<widths.length?64:0;
    if(end+room>w.clientWidth)break;
    table.style.setProperty('--sg-col-'+cols,left+'px');left=end;
  }
  if(cols!==grid.fc){
    sgFreezeColumns(table.tHead.rows[0],cols);
    sgVisibleRows(0,grid.count-1,function(p){sgFreezeColumns(sgTr(sgSourceAt(p)),cols);});
  }
  grid.fc=cols;grid.left=left;
  var rows=grid.pins.rows;
  if(grid.count>rows&&w.scrollHeight>w.clientHeight)
    rows=Math.min(rows,Math.max(0,Math.floor((w.clientHeight-grid.hh-56)/grid.rh)));
  for(var r=0;r<grid.pins.rows;r++){
    var tr=sgTr(sgSourceAt(r));
    tr.classList.toggle('sg-pr',r<rows);
    tr.classList.toggle('sg-pr-edge',r===rows-1);
    if(r<rows)tr.style.setProperty('--sg-pin-top',(grid.hh+r*grid.rh)+'px');
  }
  grid.fr=rows;
  table.classList.toggle('sg-freezing',!!(rows||cols));
  if(SG.edit)sgEditFollow(w);
}
function sgFreezeOpen(){
  var t=sgTable();
  if(!t||sgFormula||sgStructuralSave)return;
  var key=sgFreezeKey(t.path),pins=sgFreezeRead(t),d=$('sg-freeze-dialog');
  if(!d){
    d=el('dialog');d.id='sg-freeze-dialog';d.setAttribute('aria-labelledby','sg-freeze-title');
    SMALL[d.id]=1;document.body.appendChild(d);
  }
  d.textContent='';
  var title=el('h2','','Jäädytä rivit ja sarakkeet'),form=el('form'),rows=el('select'),cols=el('select');
  var msg=el('p','msg'),actions=el('div','btnrow');
  title.id='sg-freeze-title';msg.setAttribute('role','status');
  function addField(input,id,text,max,value){
    input.id=id;
    var label=el('label','fl',text);label.htmlFor=id;
    for(var i=0;i<=max;i++){
      var option=el('option','',i?String(i):'Ei jäädytystä');option.value=i;input.appendChild(option);
    }
    input.value=value;form.append(label,input);
  }
  addField(rows,'sg-freeze-rows','Ensimmäiset rivit',Math.min(t.rows.length,SG_FREEZE_ROWS),pins.rows);
  addField(cols,'sg-freeze-cols','Vasemman reunan sarakkeet',Math.min(t.head.length,SG_FREEZE_COLS),pins.cols);
  button(actions,'Peru','btn',function(){closeSheet(d);});
  var apply=el('button','btn solid','Käytä');apply.type='submit';actions.appendChild(apply);
  form.append(el('p','sub','Asetus tallentuu tälle selaimelle. Pienessä tilassa jäädytetään vain niin monta riviä ja saraketta kuin vierityksen rinnalle mahtuu.'),msg,actions);
  d.append(title,form);
  d.onclick=function(e){
    if(e.target!==d)return;
    var box=d.getBoundingClientRect();
    if(e.clientX<box.left||e.clientX>=box.right||e.clientY<box.top||e.clientY>=box.bottom)closeSheet(d);
  };
  d.oncancel=function(e){e.preventDefault();closeSheet(d);};
  d.addEventListener('close',function(){var w=$('sg-wrap');if(w)w.focus({preventScroll:true});},{once:true});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var current=sgTable();
    if(tab!=='sheets'||!current||current.path!==t.path||sgFreezeKey(t.path)!==key||sgStructuralSave||
       +rows.value>current.rows.length||+cols.value>current.head.length){
      msg.textContent='Välilehti muuttui. Avaa jäädytys uudelleen.';return;
    }
    var next={rows:+rows.value,cols:+cols.value};
    try{
      if(next.rows||next.cols)localStorage.setItem(key,JSON.stringify(next));
      else localStorage.removeItem(key);
    }catch(error){msg.textContent='Jäädytystä ei voitu tallentaa tässä selaimessa.';return;}
    closeSheet(d);render();
  });
  openSheet(d);rows.focus({preventScroll:true});
}
function sgRowEl(model,t,i,formats){var tr=el('tr'),rn=el('th','sg-rn',String(i+1));rn.dataset.r=i;tr.appendChild(rn);
  t.rows[i].forEach(function(_,j){var res=model.value(t,i,j),txt=sgCellText(res,formats,i,j),td=el('td',(res.error?'sg-err':'')+(typeof res.value==='number'&&!res.error?' n':''),txt);
    td.dataset.r=i;td.dataset.c=j;td.setAttribute('role','gridcell');td.setAttribute('aria-label','Solu '+TAULUKKO.column(j)+(i+1)+(txt?', '+txt:''));tr.appendChild(td);});
  if(SGX.fc)sgFreezeColumns(tr,SGX.fc);return tr;}
function sgSpacer(C,h){var tr=el('tr','sg-sp'),th=el('th');th.colSpan=C+1;th.style.height=h+'px';tr.appendChild(th);tr.setAttribute('aria-hidden','true');return tr;}
function sgFill(tb,t,model,a,b){
  var f=document.createDocumentFragment(),formats=!t.view&&sgFormats(t),prefix=SGX.prefix;
  if(SGX.v){
    a=Math.max(prefix,a);
    while(tb.rows.length>prefix)tb.lastElementChild.remove();
    for(var p=tb.rows.length;p<prefix;p++)tb.appendChild(sgRowEl(model,t,sgSourceAt(p),formats));
    f.appendChild(sgSpacer(t.head.length,(a-prefix)*SGX.rh));
  }else tb.textContent='';
  for(var i=a;i<b;i++)f.appendChild(sgRowEl(model,t,sgSourceAt(i),formats));
  if(SGX.v)f.appendChild(sgSpacer(t.head.length,(SGX.count-b)*SGX.rh));
  tb.appendChild(f);SGX.a=a;SGX.b=b;
}
function sgTr(r){
  var tb=SGX.body;r=sgPosition(r);
  if(!tb||r<0||r>=SGX.prefix&&(r<SGX.a||r>=SGX.b))return null;
  return tb.rows[r<SGX.prefix?r:r-SGX.a+SGX.prefix+(SGX.v?1:0)];
}
function sgVisibleRows(first,last,visit){
  for(var r=Math.max(first,0);r<=Math.min(last,SGX.prefix-1);r++)visit(r);
  for(var r=Math.max(first,SGX.a);r<=Math.min(last,SGX.b-1);r++)visit(r);
}
function sgWinTo(w,t,top){var R=SGX.count,vis=Math.ceil((w.clientHeight||innerHeight)/SGX.rh),a=Math.max(0,top-SGBUF),b=Math.min(R,top+vis+SGBUF);
  a=Math.max(SGX.prefix,a);
  if(a===SGX.a&&b===SGX.b)return false;sgFill(SGX.body,t,formulaContext().tables(),a,b);return true;}
function sgScroll(){
  if(SGX.raf)return;
  var grid=SGX;
  grid.raf=requestAnimationFrame(function(){
    grid.raf=0;
    var w=$('sg-wrap'),t=sgTable();
    if(grid!==SGX||!w||!t||t.path!==grid.path||tab!=='sheets')return;
    if(grid.v){
      var top=Math.floor(Math.max(0,w.scrollTop-grid.hh)/grid.rh),bot=Math.ceil((w.scrollTop+w.clientHeight)/grid.rh);
      if((grid.a>grid.prefix&&top<grid.a+10)||(grid.b<grid.count&&bot>grid.b-10)){
        if(sgWinTo(w,t,top))sgPaint(true);
      }
    }
    if(SG.edit&&(sgPosition(SG.r)<grid.fr||SG.c<grid.fc))sgEditFollow(w);
  });
}
/* 0.37: muokkauksen jälkeen päivitetään vain solujen arvot (sama rakenne), muuten koko taulukko */
function sgRefresh(){var w=$('sg-wrap'),t=sgTable();if(!w||!t||tab!=='sheets'){render();return;}
  var trs=w.querySelectorAll('tbody tr:not(.sg-sp)'),hs=w.querySelectorAll('thead th.sg-ch');if(SGX.path!==t.path||SGX.total!==t.rows.length||trs.length!==SGX.prefix+SGX.b-SGX.a||hs.length!==t.head.length){render();return;}
  var model=formulaContext().tables(),formats=!t.view&&sgFormats(t);
  if(SGX.order){
    var order=sgDisplayOrder(t,model,sgDisplaySettings.get(SGX.displayKey));
    if(order.length!==SGX.count||order.some(function(row,index){return row!==SGX.order[index];})){
      SG.r2=SG.r;SG.c2=SG.c;render();return;
    }
  }
  for(var k=0;k<trs.length;k++){var tds=trs[k].children,i=+tds[0].dataset.r;for(var j=0;j<t.head.length;j++){var td=tds[j+1];if(!td)continue;var res=model.value(t,i,j),txt=sgCellText(res,formats,i,j);
      if(td.textContent!==txt){td.textContent=txt;td.setAttribute('aria-label','Solu '+TAULUKKO.column(j)+(i+1)+(txt?', '+txt:''));}
      var n=typeof res.value==='number'&&!res.error;if(td.classList.contains('n')!==n)td.classList.toggle('n',n);if(td.classList.contains('sg-err')!==!!res.error)td.classList.toggle('sg-err',!!res.error);}}
  t.head.forEach(function(title,j){var th=hs[j],L=TAULUKKO.column(j),sp=th.querySelector('.sg-col-title'),want=title&&title!==L?title:'';if((sp?sp.textContent:'')!==want){if(sp)sp.remove();if(want)th.insertBefore(el('span','sg-col-title',want),th.querySelector('.sg-rz'));}});
  sgStatusPaint();sgPaint(true);}
function sgCell(r,c){var w=$('sg-wrap'),t=w&&w.querySelector('table.sg');if(!t)return null;
  var row=r<0?t.tHead&&t.tHead.rows[0]:sgTr(r),e=row&&row.cells[c+1];return e&&+e.dataset.c===c?e:null;}
function sgPaint(still){var w=$('sg-wrap');if(!w)return;var t=sheetFiles().find(function(s){return s.path===SG.path;});if(!t)return;
  var bounds=sgSelectionBounds(),c1=Math.min(SG.c,SG.c2),c2=Math.max(SG.c,SG.c2);
  var d=sgFormula,picking=d&&d.picking,skipToEnd=picking||SGX.order&&SG.r!==SG.r2;
  var vr=skipToEnd?SG.r2:SG.r,vc=skipToEnd?SG.c2:SG.c,vp=sgPosition(vr);
  Array.prototype.forEach.call(w.querySelectorAll('.sg-sel,.sg-act,.sg-hl'),function(e){e.classList.remove('sg-sel','sg-act','sg-hl');});
  if(!picking||!SGX.order)sgVisibleRows(bounds[0],bounds[1],function(p){
    var tr=sgTr(sgSourceAt(p));
    for(var c=c1;c<=c2;c++){var e=tr.cells[c+1];if(e)e.classList.add('sg-sel');}
    tr.cells[0].classList.add('sg-hl');
  });
  if(!still&&SGX.v&&vp>=0&&vp<SGX.count&&!sgTr(vr)){
    var first=Math.max(0,vp-Math.floor(w.clientHeight/SGX.rh/2));
    w.scrollTop=first*SGX.rh;sgWinTo(w,t,first);return sgPaint();
  }
  var a=sgCell(SG.r,SG.c);if(a&&(!picking||d.preview))a.classList.add('sg-act');
  var visible=sgCell(vr,vc);if(visible&&!still){
    var wr=w.getBoundingClientRect(),ar=visible.getBoundingClientRect(),top=wr.top+w.clientTop+SGX.hh+(SGX.fr||0)*SGX.rh;
    var left=wr.left+w.clientLeft+(SGX.left||40),bottom=wr.top+w.clientTop+w.clientHeight,right=wr.left+w.clientLeft+w.clientWidth;
    if(vp>=SGX.fr){if(ar.top<top)w.scrollTop-=top-ar.top;else if(ar.bottom>bottom)w.scrollTop+=ar.bottom-bottom;}
    if(vc>=SGX.fc){if(ar.left<left)w.scrollLeft-=left-ar.left;else if(ar.right>right)w.scrollLeft+=ar.right-right;}
  }
  for(var c3=c1;c3<=c2;c3++){var h=sgCell(-1,c3);if(h)h.classList.add('sg-hl');}
  var ad=$('sg-addr');
  if(ad){
    var address=SG.r<0?TAULUKKO.column(SG.c):sgAddress(SG.r,SG.c);
    if(SG.r!==SG.r2||SG.c!==SG.c2)address+=SGX.order&&!sgCanUseSourceRange()?
      ' · '+(bounds[1]-bounds[0]+1)+' riviä':':'+sgAddress(SG.r2,SG.c2);
    ad.textContent=address;
  }
  w.querySelectorAll('.sg-origin,.sg-reference').forEach(function(cell){
    cell.classList.remove('sg-origin','sg-reference');cell.removeAttribute('aria-selected');
  });
  if(d){
    var origin=d.path===t.path&&sgCell(d.r,d.c);
    if(origin)origin.classList.add('sg-origin');
    var mark=picking?d.preview:d.mark;
    if(mark&&mark.path===t.path){
      sgVisibleRows(0,SGX.count-1,function(p){
        var row=sgSourceAt(p);if(row<mark.r||row>mark.r2)return;
        var tr=sgTr(row);
        for(var j=mark.c;j<=mark.c2;j++){var cell=tr.cells[j+1];if(cell){cell.classList.add('sg-reference');cell.setAttribute('aria-selected','true');}}
      });
    }
  }
  var fx=$('sg-fx');if(fx&&document.activeElement!==fx&&!SG.edit&&!d)fx.value=SGX.order&&!SGX.count?'':sgRawOf(t,SG.r,SG.c);
  sgFillPaint(w,t);
  sgFormulaControls();}
function sgTable(){return sheetFiles().find(function(s){return s.path===SG.path;});}
/* Lukumuoto vaikuttaa ruudukon esitykseen soluosoitteen mukaan. */
function sgFormatOpen(){
  var t=sgTable();
  if(!t||t.locked||t.view||!t.rows.length||sgStructuralSave||sgFormula||SG.r<0||!sgCanUseSourceRange())return;
  var key=sgFormatKey(t.path),first=sgAddress(Math.min(SG.r,SG.r2),Math.min(SG.c,SG.c2));
  var last=sgAddress(Math.max(SG.r,SG.r2),Math.max(SG.c,SG.c2)),d=$('sg-format-dialog');
  if(!d){
    d=el('dialog');d.id='sg-format-dialog';d.setAttribute('aria-labelledby','sg-format-title');
    SMALL[d.id]=1;document.body.appendChild(d);
  }
  d.textContent='';
  var title=el('h2','','Lukumuoto'),form=el('form'),range=el('input'),kind=el('select'),places=el('select');
  var sample=el('p','sub'),msg=el('p','msg'),actions=el('div','btnrow');
  title.id='sg-format-title';
  range.value=first===last?first:first+':'+last;range.required=true;range.autocomplete='off';
  range.setAttribute('autocapitalize','characters');range.spellcheck=false;range.maxLength=24;
  function addField(text,id,input){
    var label=el('label','fl',text);label.htmlFor=input.id=id;form.append(label,input);
  }
  addField('Solu tai alue','sg-format-range',range);
  addField('Muoto','sg-format-kind',kind);
  addField('Desimaalit','sg-format-places',places);
  Object.keys(SG_FORMATS).forEach(function(value){var op=el('option','',SG_FORMATS[value]);op.value=value;kind.appendChild(op);});
  for(var i=0;i<=6;i++){var op=el('option','',String(i));op.value=i;places.appendChild(op);}
  var before=sgFormats(t),saved=before[Math.min(SG.r,SG.r2)+','+Math.min(SG.c,SG.c2)];
  var savedParts=saved&&saved!=='mm:ss'?saved.split(':'):null;
  kind.value=savedParts?savedParts[0]:saved||'yleinen';places.value=savedParts?.[1]??2;
  sample.setAttribute('aria-live','polite');msg.setAttribute('role','status');
  button(actions,'Peru','btn',function(){closeSheet(d);});
  var apply=el('button','btn solid','Käytä');apply.type='submit';actions.appendChild(apply);
  var hint=el('p','sub');form.append(sample,hint,msg,actions);d.append(title,form);
  var examples={'h-min':8.5,'mm:ss':85,paivat:2.5,'pvm-lyhyt':'2026-11-30',pvm:'2026-11-30'};
  var units={'h-min':'Syötä tunnit lukuna.','mm:ss':'Syötä sekunnit lukuna.',paivat:'Syötä päivät lukuna.','pvm-lyhyt':'Syötä päivä muodossa VVVV-KK-PP.',pvm:'Syötä päivä muodossa VVVV-KK-PP.'};
  function format(){return kind.value==='yleinen'?null:kind.value+(SG_FORMAT_DECIMALS.includes(kind.value)?':'+places.value:'');}
  function paint(){
    places.disabled=!SG_FORMAT_DECIMALS.includes(kind.value);
    sample.textContent='Esimerkki · '+sgFormatted(examples[kind.value]??0.256,format());
    hint.textContent=(units[kind.value]?units[kind.value]+' ':'')+'Tallentuu Vaultiin ja näkyy muilla laitteilla.';
  }
  kind.addEventListener('change',function(){places.value=kind.value==='prosentti'?0:2;paint();});
  places.addEventListener('change',paint);
  range.addEventListener('input',function(){msg.textContent='';});
  var saving=false;
  d.onclick=function(e){if(e.target===d&&!saving)closeSheet(d);};
  d.oncancel=function(e){e.preventDefault();if(!saving)closeSheet(d);};
  d.addEventListener('close',function(){var wrap=$('sg-wrap');if(wrap)wrap.focus({preventScroll:true});},{once:true});
  form.addEventListener('submit',async function(e){
    e.preventDefault();
    if(saving)return;
    var current=sgTable();
    if(!current||current.path!==t.path||current.view||sgFormatKey(t.path)!==key||sgStructuralSave){
      msg.textContent='Taulukko vaihtui. Avaa lukumuoto uudelleen.';return;
    }
    var sel=sgFormatRange(range.value);
    if(!sel||sel.r2>=current.rows.length||sel.c2>=current.head.length){
      msg.textContent='Anna taulukossa oleva solu tai alue, esimerkiksi A1:B3.';return;
    }
    var after=format(),cells=[],r1=sel.r1,r2=sel.r2,c1=sel.c1,c2=sel.c2;
    for(var r=r1;r<=r2;r++)for(var c=c1;c<=c2;c++){
      var k=r+','+c,previous=before[k]||null;
      if(previous==='yleinen')previous=null;
      if(previous!==after)cells.push({k:k,b:previous,a:after});
    }
    if(cells.length){
      saving=true;sheetDialogControls(d,true);msg.textContent='Tallennetaan Vaultiin…';
      var error=await sgSaveFormats(t.path,cells,'a',sgLegacyFormats(key));
      saving=false;sheetDialogControls(d,false);paint();
      if(error){msg.textContent=error;apply.focus({preventScroll:true});return;}
      sgRecord(t.path,cells,key);
    }
    if(sgPosition(r1)>=0&&sgPosition(r2)>=0){SG.r=r1;SG.r2=r2;SG.c=c1;SG.c2=c2;}
    closeSheet(d);sgRefresh();sgPaint();
  });
  paint();openSheet(d);kind.focus({preventScroll:true});
}
var sgFillGesture=null;
function sgFillPaint(w,t){
  var old=w.querySelector('.sg-fill-handle'),cell=!t.locked&&!t.view&&!SGX.order&&!sgFormula&&!SG.edit&&!sgStructuralSave&&SG.r>=0&&SG.r===SG.r2&&SG.c===SG.c2&&SG.r<t.rows.length-1&&sgCell(SG.r,SG.c);
  if(old&&old.parentNode!==cell){old.remove();old=null;}
  if(cell&&!old){
    var handle=button(cell,'','sg-fill-handle',function(e){e.stopPropagation();if(e.detail===0)sgFillOpen();});
    handle.setAttribute('aria-label','Täytä alas solusta '+sgAddress(SG.r,SG.c));
    handle.addEventListener('pointerdown',function(e){sgFillDrag(e,handle,w,t);});
  }
  w.querySelectorAll('.sg-fill-target').forEach(function(td){td.classList.remove('sg-fill-target');});
  var drag=sgFillGesture;
  if(drag&&drag.wrap===w)sgVisibleRows(drag.row+1,drag.end,function(r){
    var td=sgCell(r,drag.col);if(td)td.classList.add('sg-fill-target');
  });
}
function sgFillDrag(e,handle,wrap,t){
  if(e.pointerType!=='mouse'||e.button!==0||!e.isPrimary||sgFillGesture)return;
  e.preventDefault();e.stopPropagation();
  var drag={wrap:wrap,row:SG.r,col:SG.c,end:SG.r},id=e.pointerId,y=e.clientY,frame=0;
  sgFillGesture=drag;handle.setPointerCapture(id);
  function update(){
    frame=0;
    var bounds=wrap.getBoundingClientRect(),step=y>bounds.bottom-22?18:y<bounds.top+24?-18:0;
    var before=wrap.scrollTop;if(step)wrap.scrollTop+=step;
    var x=Math.max(bounds.left+42,Math.min(e.clientX,bounds.right-2));
    var point=document.elementFromPoint(x,Math.max(bounds.top+33,Math.min(y,bounds.bottom-3)));
    var cell=point&&point.closest('#sg-wrap td');
    if(cell&&+cell.dataset.r>=0){
      var end=Math.max(drag.row,Math.min(+cell.dataset.r,t.rows.length-1));
      if(end!==drag.end){drag.end=end;sgPaint(true);}
    }
    if(wrap.scrollTop!==before&&wrap.isConnected)frame=requestAnimationFrame(update);
  }
  function move(ev){if(ev.pointerId===id){y=ev.clientY;if(!frame)frame=requestAnimationFrame(update);}}
  function stop(ev){
    if(ev.type==='keydown'?ev.key!=='Escape':ev.pointerId!==id)return;
    if(ev.type==='keydown'){ev.preventDefault();ev.stopPropagation();}
    if(ev.type==='pointerup'){y=ev.clientY;if(frame)cancelAnimationFrame(frame);update();}
    if(frame)cancelAnimationFrame(frame);
    handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',stop);
    handle.removeEventListener('pointercancel',stop);handle.removeEventListener('lostpointercapture',stop);
    document.removeEventListener('keydown',stop,true);sgFillGesture=null;sgPaint(true);
    if(ev.type==='pointerup'&&drag.end>drag.row&&wrap.isConnected)sgFillOpen(drag.end);
  }
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',stop);
  handle.addEventListener('pointercancel',stop);handle.addEventListener('lostpointercapture',stop);
  document.addEventListener('keydown',stop,true);
}
function sgFillOpen(end){
  var table=sgTable(),row=Math.min(SG.r,SG.r2),col=SG.c;
  if(!table||table.locked||table.view||SGX.order||sgStructuralSave||sgFormula||col!==SG.c2||row<0||row>=table.rows.length-1)return;
  var d=$('sg-fill-dialog');
  if(!d){d=el('dialog');d.id='sg-fill-dialog';d.setAttribute('aria-labelledby','sg-fill-title');SMALL[d.id]=1;document.body.appendChild(d);}
  var state={repo:vRepo(),branch:G.branch},raw=sgRawOf(table,row,col),last=table.rows.length,busy=false,plan=[];
  d.textContent='';
  var h=el('h2','','Täytä alas');h.id='sg-fill-title';
  var form=el('form'),label=el('label','fl','Viimeinen rivi'),input=el('input'),preview=el('p','sub'),msg=el('p','msg'),actions=el('div','btnrow');
  input.type='number';input.id='sg-fill-last';input.min=row+2;input.max=last;input.step=1;input.required=true;input.value=(end??Math.max(row+1,SG.r,SG.r2))+1;
  label.htmlFor=input.id;preview.id='sg-fill-preview';preview.setAttribute('role','status');msg.setAttribute('role','status');
  var cancel=button(actions,'Peru','btn',function(){closeSheet(d);});
  var apply=el('button','btn solid','Täytä');apply.type='submit';actions.appendChild(apply);
  form.append(el('p','sub','Lähdesolu '+sgAddress(row,col)),label,input,preview,msg,actions);d.append(h,form);
  function paint(){
    plan=[];apply.disabled=true;preview.textContent='';
    if(!input.checkValidity())return;
    for(var r=row+1;r<input.valueAsNumber;r++){
      var value=KAAVA.fillDown(raw,r-row);
      if(value===null){preview.textContent='Kaava tai viittaustapa ei sovi automaattiseen täyttöön.';return;}
      plan.push({r:r,c:col,b:sgRawOf(table,r,col),a:value});
    }
    var first=plan[0],end=plan[plan.length-1],name=sgAddress(first.r,col)+(first===end?'':':'+sgAddress(end.r,col));
    preview.textContent=name+' · '+plan.length+(plan.length===1?' solu':' solua')+'\n'+sgAddress(first.r,col)+' = '+(first.a||'tyhjä')+
      (first!==end&&first.a!==end.a?'\n'+sgAddress(end.r,col)+' = '+(end.a||'tyhjä'):'');
    apply.disabled=false;msg.textContent='';
  }
  input.addEventListener('input',paint);
  d.onclick=function(e){if(e.target===d&&!busy)closeSheet(d);};
  d.oncancel=function(e){e.preventDefault();if(!busy)closeSheet(d);};
  d.addEventListener('close',function(){var w=$('sg-wrap');if(w)w.focus({preventScroll:true});},{once:true});
  form.addEventListener('submit',async function(e){
    e.preventDefault();if(busy||apply.disabled)return;
    if(vBusy||!vOn()||vRepo()!==state.repo||G.branch!==state.branch){msg.textContent='Odota Vaultin synkronointia ja yritä uudelleen.';return;}
    var cells=plan.filter(function(x){return x.a!==x.b;});
    if(!cells.length){closeSheet(d);return;}
    busy=true;apply.disabled=cancel.disabled=input.disabled=true;msg.textContent='Tallennetaan…';
    try{
      if(sgPending(table.path))await sgFlush(table.path);
      if(sgPending(table.path)||vBusy){msg.textContent='Taulukossa on vielä odottavia muutoksia. Yritä uudelleen.';return;}
      vBusy=true;sgStructuralSave=true;vRender();
      try{
        var result=await sheetSaveFile(table.path,function(text){
          var current=TAULUKKO.parse(table.path,text);
          if(!current||current.rows.length!==last||current.head.length!==table.head.length||sgRawOf(current,row,col)!==raw||
             plan.some(function(x){return sgRawOf(current,x.r,x.c)!==x.b;})){
            return {error:'Lähdesolu tai kohdealue muuttui. Avaa täyttö uudelleen.'};
          }
          var rows=current.rows.map(function(r){return r.slice();});
          cells.forEach(function(x){rows[x.r][col]=x.a;});
          return TAULUKKO.replace(current,current.head,rows,current.divider);
        },'appi: täytä taulukon solut alas',state);
        if(result.error){msg.textContent=result.error;return;}
        sgRecord(table.path,cells);SGV++;SG.r2=plan[plan.length-1].r;
        closeSheet(d);
      }finally{vBusy=false;sgStructuralSave=false;vRender();vFlush();if(tab==='sheets')render();}
    }catch(error){msg.textContent='Täyttöä ei voitu tallentaa. Yritä uudelleen.';}
    finally{busy=false;apply.disabled=cancel.disabled=input.disabled=false;}
  });
  paint();openSheet(d);input.focus({preventScroll:true});
}

function sgMove(dr,dc,ext){var t=sgTable();if(!t)return;var C=t.head.length,at=sgPosition(ext?SG.r2:SG.r);
  var r=sgSourceAt(Math.max(0,Math.min(SGX.count-1,at+dr))),c=Math.max(0,Math.min(C-1,(ext?SG.c2:SG.c)+dc));
  if(sgFormula&&sgFormula.picking){sgPickCell(t,r,c,ext);return;}
  if(ext){SG.r2=r;SG.c2=c;}else{SG.r=SG.r2=r;SG.c=SG.c2=c;}sgPaint();}
function sgEditFollow(w){
  var inp=w.querySelector('.sg-ed'),cell=sgCell(SG.r,SG.c);
  if(!inp||!cell)return;
  var wr=w.getBoundingClientRect(),cr=cell.getBoundingClientRect();
  inp.style.left=(cr.left-wr.left-w.clientLeft+w.scrollLeft)+'px';
  inp.style.top=(cr.top-wr.top-w.clientTop+w.scrollTop)+'px';
  inp.style.width=Math.max(cr.width,140)+'px';inp.style.height=cr.height+'px';
  inp.style.zIndex=SGX.fr||SGX.fc?(sgPosition(SG.r)<SGX.fr||SG.c<SGX.fc?'8':'2'):'';
}
function sgEditOpen(val,keep){if(sgStructuralSave||SGX.order&&!SGX.count)return;var t=sgTable(),cell=sgCell(SG.r,SG.c),w=$('sg-wrap');if(!t||!cell||!w)return;if(t.view){SG.edit=null;if(val!=null){sgSet(t,[]);return;}var n=SG.r>=0&&t.notes[SG.r];if(n)noteFromView(n,t.path);return;}if(t.locked)return;var old=w.querySelector('.sg-ed');if(old)old.remove();
  var raw=sgRawOf(t,SG.r,SG.c),inp=el('input','sg-ed');inp.type='text';inp.autocomplete='off';inp.spellcheck=false;inp.setAttribute('autocapitalize','off');inp.setAttribute('aria-label','Muokkaa solua '+TAULUKKO.column(SG.c)+(SG.r+1));
  inp.value=val==null?raw:val;SG.edit={val:inp.value};w.appendChild(inp);sgEditFollow(w);
  var fx=$('sg-fx');if(fx)fx.value=inp.value;
  inp.addEventListener('focus',function(){sgFormulaInput=inp;sgFormulaControls();});
  inp.addEventListener('input',function(){SG.edit.val=inp.value;if(fx)fx.value=inp.value;sgFormulaControls();});
  inp.addEventListener('keydown',function(e){if(e.isComposing)return;if(e.key==='Enter'){e.preventDefault();if(e.altKey&&!$('sg-pick').hidden){sgPickStart();return;}sgCommit(inp.value);sgMove(1,0);}else if(e.key==='Tab'){e.preventDefault();sgCommit(inp.value);sgMove(0,e.shiftKey?-1:1);}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sgCancel();}else if((e.key==='ArrowUp'||e.key==='ArrowDown')&&val!=null&&!keep){e.preventDefault();sgCommit(inp.value);sgMove(e.key==='ArrowUp'?-1:1,0);}});
  inp.addEventListener('blur',function(){setTimeout(function(){if(SG.edit&&document.activeElement!==inp&&document.activeElement!==$('sg-fx')&&inp.isConnected)sgCommit(inp.value,true);},0);});
  try{inp.focus({preventScroll:true});var n=inp.value.length;inp.setSelectionRange(n,n);}catch(e){}}
function sgCommit(v,keepFocus){var t=sgTable();var ed=SG.edit;SG.edit=null;var w=$('sg-wrap'),inp=w&&w.querySelector('.sg-ed');if(inp)inp.remove();
  if(t&&ed!==null)sgSet(t,[{r:SG.r,c:SG.c,v:String(v).trim()}]);if(!keepFocus){var w2=$('sg-wrap');if(w2)try{w2.focus({preventScroll:true});}catch(e){}}sgPaint();}
function sgCancel(){SG.edit=null;var w=$('sg-wrap'),inp=w&&w.querySelector('.sg-ed');if(inp)inp.remove();if(w)try{w.focus({preventScroll:true});}catch(e){}sgPaint();}
function sgRangeCells(){
  var c1=Math.min(SG.c,SG.c2),c2=Math.max(SG.c,SG.c2),out=[];
  sgSelectedRows().forEach(function(r){for(var c=c1;c<=c2;c++)out.push({r:r,c:c});});
  return out;
}
function sgCopyText(t){
  var c1=Math.min(SG.c,SG.c2),c2=Math.max(SG.c,SG.c2);
  return sgSelectedRows().map(function(r){
    var row=[];for(var c=c1;c<=c2;c++)row.push(sgRawOf(t,r,c));
    return row.join('\t');
  }).join('\n');
}
/* Otsikon napautus valitsee sarakkeen; vasta sivuttainen liike aloittaa siirron. */
function sgColumnDrag(e,t,wrap,header){
  var from=+header.dataset.c,pointer=e.pointerId,startX=e.clientX,x=startX;
  var moving=false,destination=from,marker=null,frame=0;
  var headers=Array.from(wrap.querySelectorAll('.sg-ch'));
  function clearMarker(){
    if(marker)marker.classList.remove('sg-drop-before','sg-drop-after');
    marker=null;
  }
  function target(){
    var box=wrap.getBoundingClientRect(),left=box.left+40,right=box.right-1;
    var pos=Math.min(right,Math.max(left,x));
    var next=headers.find(function(cell){
      var r=cell.getBoundingClientRect();
      return pos>=r.left&&pos<r.right;
    });
    clearMarker();destination=next?+next.dataset.c:from;
    if(next&&destination!==from){
      marker=next;
      marker.classList.add(destination<from?'sg-drop-before':'sg-drop-after');
    }
  }
  function scroll(){
    if(!wrap.isConnected){finish(false);return;}
    var box=wrap.getBoundingClientRect(),edge=28,step=0;
    if(x<box.left+40+edge)step=-Math.min(16,(box.left+40+edge-x)/2);
    else if(x>box.right-edge)step=Math.min(16,(x-box.right+edge)/2);
    if(step){
      var before=wrap.scrollLeft;
      wrap.scrollLeft+=step;
      if(wrap.scrollLeft!==before)target();
    }
    frame=requestAnimationFrame(scroll);
  }
  function move(ev){
    if(ev.pointerId!==pointer)return;
    x=ev.clientX;
    if(!moving){
      if(Math.abs(x-startX)<7)return;
      moving=true;wrap.classList.add('sg-moving');
      frame=requestAnimationFrame(scroll);
    }
    target();
  }
  function finish(save){
    cancelAnimationFrame(frame);clearMarker();wrap.classList.remove('sg-moving');
    header.removeEventListener('pointermove',move);header.removeEventListener('pointerup',end);
    header.removeEventListener('lostpointercapture',cancel);document.removeEventListener('keydown',key,true);
    if(header.hasPointerCapture(pointer))header.releasePointerCapture(pointer);
    if(save&&moving&&destination!==from&&SG.path===t.path){
      SG.c=SG.c2=from;
      sgStruct(t,'col','move',destination);
    }
  }
  function end(ev){if(ev.pointerId===pointer)finish(true);}
  function cancel(ev){if(ev.pointerId===pointer)finish(false);}
  function key(ev){if(ev.key==='Escape'&&moving){ev.preventDefault();ev.stopPropagation();finish(false);}}
  header.setPointerCapture(pointer);
  header.addEventListener('pointermove',move);header.addEventListener('pointerup',end);
  header.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',key,true);
}
function sgBind(t,wrap,table,fx,addr){
  var lastTap=null,pickTouch=false;
  wrap.addEventListener('pointerdown',function(e){
    if(sgFormula){
      var target=e.target.closest('td');pickTouch=e.pointerType!=='mouse';
      if(sgFormula.picking&&target&&!pickTouch&&e.button===0){
        sgPickCell(t,+target.dataset.r,+target.dataset.c,e.shiftKey||sgFormula.range);SGD=true;
        wrap.focus({preventScroll:true});e.preventDefault();
      }
      return;
    }
    if(e.button!==0)return;
    var rz=e.target.closest('.sg-rz');if(rz){sgResize(e,t,+rz.dataset.c);return;}
    var cell=e.target.closest('td,th.sg-ch,th.sg-rn');if(!cell||e.target.closest('.sg-ed,.sg-fill-handle'))return;var r=+cell.dataset.r,c=cell.dataset.c==null?null:+cell.dataset.c;
    if(SG.edit){var inp=wrap.querySelector('.sg-ed');sgCommit(inp?inp.value:SG.edit.val,true);if(r>=0&&sgPosition(r)<0)return;}
    if(cell.classList.contains('sg-rn')){SG.r=SG.r2=r;SG.c=0;SG.c2=t.head.length-1;sgPaint();return;}
    if(r<0){
      sgSelectDisplayedColumn(c);sgPaint(!!SGX.order);
      if(!t.locked&&!t.view&&!SGX.order&&!sgStructuralSave&&e.pointerType==='mouse'&&e.button===0)sgColumnDrag(e,t,wrap,cell);
      return;
    }
    var touch=e.pointerType!=='mouse';
    if(touch){if(SG.r===r&&SG.c===c&&SG.r2===r&&SG.c2===c&&lastTap&&Date.now()-lastTap<4000){sgEditOpen(null,true);return;}lastTap=Date.now();SG.r=SG.r2=r;SG.c=SG.c2=c;sgPaint();return;}
    if(e.shiftKey){SG.r2=r;SG.c2=c;}else{SG.r=SG.r2=r;SG.c=SG.c2=c;}sgPaint();SGD=true;try{$('sg-wrap').focus({preventScroll:true});}catch(er){}e.preventDefault();});
  wrap.addEventListener('click',function(e){
    var cell=e.target.closest('td');
    if(sgFormula&&sgFormula.picking&&pickTouch&&cell)sgPickCell(t,+cell.dataset.r,+cell.dataset.c,sgFormula.range);
    pickTouch=false;
  });
  wrap.addEventListener('pointermove',function(e){if(!SGD||e.pointerType!=='mouse')return;
    if(sgFormula&&!(e.buttons&1)){SGD=false;return;}
    var cell=document.elementFromPoint(e.clientX,e.clientY);cell=cell&&cell.closest&&cell.closest('#sg-wrap td');if(!cell)return;
    var r=+cell.dataset.r,c=+cell.dataset.c;if(r!==SG.r2||c!==SG.c2){
      if(sgFormula){if(sgFormula.picking)sgPickCell(t,r,c,true);return;}
      SG.r2=r;SG.c2=c;sgPaint();
    }});
  wrap.addEventListener('contextmenu',function(e){if(sgFormula){e.preventDefault();return;}var h=e.target.closest('th.sg-ch,th.sg-rn');if(!h||t.view)return;e.preventDefault();if(t.locked)return;var row=h.classList.contains('sg-rn'),i=row?+h.dataset.r:+h.dataset.c;
    if(row&&SGX.order)return;
    if(row){SG.r=SG.r2=i;SG.c=0;SG.c2=t.head.length-1;}
    else sgSelectDisplayedColumn(i);
    sgPaint(true);
    var m=$('sortpop');m.textContent='';m.setAttribute('aria-label',row?'Rivin toiminnot':'Sarakkeen toiminnot');
    if(!row)sgDisplayMenu(m,i);
    if(!SGX.order)sgStructMenu(m,t,row?'row':'col');
    if(m.firstChild&&m.firstChild.className==='msep')m.firstChild.remove();anchoredMenu('sortpop',h);});
  wrap.addEventListener('dblclick',function(e){if(sgFormula||e.target.closest('.sg-fill-handle'))return;var rz=e.target.closest('.sg-rz');if(rz){sgFit(t,+rz.dataset.c);return;}var hd=e.target.closest('th.sg-ch');if(hd){SG.r=SG.r2=-1;SG.c=SG.c2=+hd.dataset.c;sgEditOpen(null,true);return;}var cell=e.target.closest('td');if(!cell)return;SG.r=SG.r2=+cell.dataset.r;SG.c=SG.c2=+cell.dataset.c;sgEditOpen(null,true);});
  wrap.addEventListener('keydown',function(e){if(e.target!==wrap)return;var k=e.key,meta=e.metaKey||e.ctrlKey;
    var mv={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[k];
    if(sgFormula){
      if(k==='Escape'){e.preventDefault();e.stopPropagation();sgFormulaFinish(false);}
      else if(k==='Enter'){e.preventDefault();if(!sgFormula.picking)sgFormulaFinish(true);else{
        if(!sgFormula.preview&&t.rows[SG.r])sgPickCell(t,SG.r,SG.c,false);sgPickReturn(true);
      }}
      else if(mv&&sgFormula.picking){
        e.preventDefault();
        if(e.shiftKey&&!sgFormula.preview)sgPickCell(t,SG.r,SG.c,false);
        sgMove(mv[0],mv[1],e.shiftKey);
      }
      return;
    }
    if(mv){e.preventDefault();sgMove(mv[0],mv[1],e.shiftKey);return;}
    if(t.locked&&!(k==='Enter'&&t.view))return;
    if(meta&&(k==='z'||k==='Z')){e.preventDefault();sgUndo(e.shiftKey);return;}if(meta&&(k==='y'||k==='Y')){e.preventDefault();sgUndo(true);return;}
    if(!t.view&&(k==='ContextMenu'||k==='F10'&&e.shiftKey)){e.preventDefault();sgDisplayOpen(SG.c);return;}
    if(meta&&(k==='a'||k==='A')){e.preventDefault();sgSelectDisplayedColumn(0);SG.c2=t.head.length-1;sgPaint();return;}
    if(!SGX.count&&SGX.order)return;
    if(k==='Enter'||k==='F2'){e.preventDefault();sgEditOpen(null,true);return;}
    if(k==='Tab'){e.preventDefault();sgMove(0,e.shiftKey?-1:1);return;}
    if(k==='Delete'||k==='Backspace'){e.preventDefault();sgSet(sgTable(),sgRangeCells().map(function(x){return {r:x.r,c:x.c,v:''};}));return;}
    if(k.length===1&&!meta&&!e.altKey){e.preventDefault();sgEditOpen(k);}});
  wrap.addEventListener('copy',function(e){if(SG.edit||sgFormula)return;e.preventDefault();e.clipboardData.setData('text/plain',sgCopyText(sgTable()));});
  wrap.addEventListener('cut',function(e){if(SG.edit||sgFormula||SGX.order&&!SGX.count)return;e.preventDefault();if(t.locked)return;
    var current=sgTable();
    e.clipboardData.setData('text/plain',sgCopyText(current));sgSet(current,sgRangeCells().map(function(x){return {r:x.r,c:x.c,v:''};}));});
  wrap.addEventListener('paste',function(e){if(SG.edit||sgFormula)return;var txt=(e.clipboardData||window.clipboardData).getData('text/plain');if(!txt)return;e.preventDefault();if(t.locked)return;sgPasteText(sgTable(),txt);});
  fx.addEventListener('focus',function(e){
    sgFormulaInput=fx;fx.readOnly=sgFormula?sgFormula.picking:sgStructuralSave||t.locked||!!t.view||!SGX.count;
    if(!sgFormula&&e.relatedTarget!==$('sg-pick'))fx.value=SG.edit?SG.edit.val:SGX.count?sgRawOf(sgTable(),SG.r,SG.c):'';
    sgFormulaControls();
  });
  fx.addEventListener('keydown',function(e){
    if(e.isComposing||t.locked&&!sgFormula||sgStructuralSave||!SGX.count&&!sgFormula)return;
    if(!$('sg-pick').hidden){
      if(e.key==='Enter'&&e.altKey){e.preventDefault();sgPickStart();return;}
      if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();$('sg-pick').focus();return;}
    }
    if(sgFormula){
      if(e.key==='Enter'){e.preventDefault();if(sgFormula.picking)sgPickReturn(true);else sgFormulaFinish(true);}
      else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sgFormulaFinish(false);}
      return;
    }
    if(e.key==='Enter'){e.preventDefault();SG.edit={val:fx.value};sgCommit(fx.value);sgMove(1,0);}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();fx.value=sgRawOf(sgTable(),SG.r,SG.c);sgCancel();}
  });
  fx.addEventListener('input',function(){
    if(sgFormula&&!sgFormula.picking){sgFormula.value=fx.value;sgFormula.mark=null;sgPaint(true);return;}
    var inp=wrap.querySelector('.sg-ed');if(inp){inp.value=fx.value;SG.edit.val=fx.value;}sgFormulaControls();
  });
  fx.addEventListener('blur',function(e){
    // Kaavaluonnoksen sulkeminen poistaa tämän kentän ja voi laukaista blur-tapahtuman.
    if(t.locked||!fx.isConnected||fx.dataset.formulaDraft||e.relatedTarget===$('sg-pick')||!SGX.count)return;
    if(!SG.edit&&fx.value!==sgRawOf(sgTable(),SG.r,SG.c)){SG.edit={val:fx.value};sgCommit(fx.value,true);}
  });
}
function sgPasteText(t,txt){
  var lines=String(txt).replace(/\r/g,'').replace(/\n$/,'').split('\n').map(function(line){return line.split('\t');});
  var order=SGX.order,start=sgPosition(SG.r),r=SG.r,c=SG.c,cells=[];
  var lastCol=c+Math.max.apply(null,lines.map(function(line){return line.length;}))-1;
  if(order&&(start<0||start+lines.length>SGX.count||lastCol>=t.head.length)){
    toast('Liitettävä alue ei mahdu näkyviin soluihin.');return;
  }
  lines.forEach(function(line,i){line.forEach(function(v,j){cells.push({r:order?order[start+i]:r+i,c:c+j,v:v});});});
  if(sgSet(t,cells)){
    if(order===SGX.order){SG.r2=order?order[start+lines.length-1]:Math.min(r+lines.length-1,499);SG.c2=lastCol;}
    sgPaint();
  }
}
function sgTW(ws){
  var w=$('sg-wrap'),tb=w&&w.querySelector('table.sg');if(!tb)return;
  tb.style.width=ws.reduce(function(a,w){return a+w;},40)+'px';
  if(SGX.pins.cols)sgFreezeLayout(w,tb,ws);
}
function sgFit(t,c){if(t.locked||sgStructuralSave)return;var ws=sgWidths(t).slice(),col=document.querySelectorAll('#sg-wrap col')[c+1],mx=48;
  Array.prototype.forEach.call(document.querySelectorAll('#sg-wrap [data-c="'+c+'"]'),function(td){var m=document.createElement('span');m.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font:inherit';m.textContent=td.textContent;td.appendChild(m);mx=Math.max(mx,m.offsetWidth+20);m.remove();});
  ws[c]=Math.min(600,mx);SGW[t.path]=ws;if(col)col.style.width=ws[c]+'px';sgTW(ws);sgSaveWidths(t,ws);}
function sgResize(e,t,c){e.preventDefault();e.stopPropagation();if(t.locked||sgStructuralSave)return;var ws=sgWidths(t).slice(),x0=e.clientX,w0=ws[c],col=document.querySelectorAll('#sg-wrap col')[c+1];
  function mv(ev){ws[c]=Math.max(40,Math.min(800,Math.round(w0+ev.clientX-x0)));if(col)col.style.width=ws[c]+'px';sgTW(ws);}
  function up(){window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);if(ws[c]!==w0){SGW[t.path]=ws;sgSaveWidths(t,ws);}}
  window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);}
HELP.taulukot=['Taulukot','<p>Napsauta solua (puhelimella napauta), kirjoita ja paina Enter. Nuolet siirtävät, Tab oikealle, Esc peruu, Delete tyhjentää. Alueen voi valita vetämällä tai Shift+nuolilla, ja ⌘C ja ⌘V kopioivat ja liittävät myös Sheetsistä. ⌘Z kumoaa. Ylärivin kaavarivi näyttää valitun solun. Sarakkeen paikkaa siirretään vetämällä otsikosta hiirellä tai valitsemalla siirto ⋯-valikosta. Leveyttä muutetaan otsikon reunasta vetämällä; kaksoisnapsautus sovittaa. Puhelimella toinen napautus samaan soluun aloittaa muokkauksen.</p><p>Kaava alkaa =-merkillä. Paina kaavaa kirjoittaessa Valitse solu (Alt+Enter) ja valitse viite samalta tai toiselta välilehdeltä. Puhelimella Valitse alue antaa napauttaa alku- ja loppusolua. Käytä viitettä lisää osoitteen kaavarivin kursorin kohdalle. Tallenna kaava tai paina Enter. Esc peruu muokkauksen. Voit myös kirjoittaa viittauksen, esimerkiksi B1:B4 tai [[valilehti]]!B1. Muistiinpanoon viitataan [[muistiinpano]].kenttä.</p>'];
function metricTextKey(text){return String(text||'').trim().toLocaleLowerCase('fi').replace(/\s+/g,' ');}
function metricTextValue(raw,col){
  if(col.laji==='kylla-ei'){
    if(['kyllä','kylla','1'].indexOf(raw)>=0)return '1';
    if(raw==='ei'||raw==='0')return '0';
    return null;
  }
  if(col.laji==='valinta'){
    var options=Array.isArray(col.arvot)?col.arvot:[];
    var found=options.find(function(pair){return Array.isArray(pair)&&(raw===metricTextKey(pair[0])||raw===metricTextKey(pair[1]));});
    return found&&!/[,\r\n"]/.test(String(found[0]))?String(found[0]):null;
  }
  var unit=metricTextKey(col.yksikko);
  if(unit&&raw.endsWith(' '+unit))raw=raw.slice(0,-unit.length-1);
  if(!/^-?\d+(?:[.,]\d+)?$/.test(raw))return null;
  var number=Number(raw.replace(',','.'));
  if(!Number.isFinite(number)||(col.laji==='asteikko'&&!Number.isInteger(number)))return null;
  if((col.min!=null&&number<Number(col.min))||(col.max!=null&&number>Number(col.max)))return null;
  return String(number);
}
function metricTextParse(text,columns,defaultDay){
  var input=metricTextKey(text),day=defaultDay||todayIso();
  input=input.replace(/^mittarit:\s*/,'');
  var relative=/^(tänään|eilen)(?:\s+|$)/.exec(input);
  if(relative){
    if(relative[1]==='eilen')day=isoD(addDays(fromIso(day),-1));
    input=input.slice(relative[0].length);
  }else{
    var iso=/^(\d{4}-\d{2}-\d{2})(?:\s+|$)/.exec(input);
    var fi=/^(\d{1,2})\.(\d{1,2})\.(\d{4})?(?:\s+|$)/.exec(input);
    if(iso||fi){
      day=iso?iso[1]:(fi[3]||day.slice(0,4))+'-'+pad(Number(fi[2]))+'-'+pad(Number(fi[1]));
      if(isoD(fromIso(day))!==day)return {error:'Päivämäärää ei tunnistettu.'};
      input=input.slice((iso||fi)[0].length);
    }
  }
  input=input.replace(/^mittarit:\s*/,'');
  var items=input.split(';').map(function(part){return part.trim();}).filter(Boolean),values=new Map();
  if(!items.length)return {error:'Kirjoita mittarin nimi ja arvo.'};
  for(var i=0;i<items.length;i++){
    var item=items[i],matches=[];
    columns.forEach(function(column){
      [column.id,column.nimi].forEach(function(name){
        var key=metricTextKey(name);
        if(key&&item.indexOf(key)===0&&/^[ :=]/.test(item.slice(key.length,key.length+1)))
          matches.push({key:key,column:column});
      });
    });
    matches.sort(function(a,b){return b.key.length-a.key.length;});
    var match=matches[0];
    if(!match)return {error:'Mittaria ei tunnistettu: '+item};
    if(matches.some(function(m){return m.key.length===match.key.length&&m.column.id!==match.column.id;}))
      return {error:'Mittarin nimi on moniselitteinen: '+match.key};
    var id=match.column.id,raw=item.slice(match.key.length).replace(/^[ :=]+/,'').trim();
    var value=metricTextValue(raw,match.column);
    if(value===null)return {error:'Tarkista arvo mittarille '+(match.column.nimi||id)+'.'};
    if(values.has(id))return {error:'Mittari on kirjoitettu kahdesti: '+(match.column.nimi||id)};
    values.set(id,value);
  }
  return {day:day,values:values};
}
function takeMetricLink(){
  try{
    var url=new URL(location.href),fragment=new URLSearchParams(url.hash.slice(1));
    var text=fragment.get('kirjaa')||url.searchParams.get('kirjaa');
    if(!text)return '';
    if(fragment.has('kirjaa')){fragment.delete('kirjaa');url.hash=fragment.toString();}
    url.searchParams.delete('kirjaa');
    try{history.replaceState(history.state,'',url.href);}catch(e){}
    return text;
  }catch(e){return '';}
}
var metricLinkText=takeMetricLink();
window.addEventListener('hashchange',function(){
  var incoming=takeMetricLink();if(incoming){metricLinkText=incoming;openPendingMetricLink();}
});
function openPendingMetricLink(){
  if(!metricLinkText||vBusy||!vOn())return;
  if(/^\s*treenisarja:/i.test(metricLinkText)){
    var training=metricLinkText;metricLinkText='';openTreText(training);return;
  }
  var spec=dashSpec(),tables=spec&&!spec.err?dashEntryTables(spec):[];
  if(!tables.length){toast('Mittarilinkki tarvitsee päiväkohtaisen mittaritaulukon.');return;}
  var text=metricLinkText;metricLinkText='';
  showDashEntry(tables,text);
}
function metricNoteLines(text){
  return String(text||'').split('\n').map(function(line,index){return {text:line,index:index};}).filter(function(line){
    return /^\s*mittarit:\s*\S/i.test(line.text)&&!/\s✓\s*$/.test(line.text);
  });
}
function markMetricLine(text,line){
  var lines=text.split('\n');
  lines[line.index]=line.text.trimEnd()+' ✓';
  return lines.join('\n');
}
function metricDayOfNote(note,date){
  if(date&&dashDay(date))return date;
  var created=note&&new Date(note.created);
  return created&&!isNaN(created.getTime())?isoD(created):todayIso();
}
function openNoteMetricEntry(){
  var box=$('ns-text'),source=box.value,line=metricNoteLines(source)[0],spec=dashSpec();
  var tables=spec&&!spec.err?dashEntryTables(spec):[];
  if(!line||!tables.length){
    var msg=$('ns-vmsg');msg.textContent='Mittaririvi tarvitsee päiväkohtaisen mittaritaulukon.';msg.hidden=false;return;
  }
  showDashEntry(tables,line.text,{day:metricDayOfNote(noteCur,$('ns-date').value),mark:function(){
    if(!$('nsheet').open||box.value!==source)return;
    box.value=markMetricLine(source,line);$('ns-ok').click();
  }});
}
async function writeNewNoteMetric(note,previous){
  if(!vOn()||!vK()||vK().id!==data.k)return;
  var source=note.text,lines=metricNoteLines(source),old=metricNoteLines(previous);
  var added=lines.filter(function(line){return !old.some(function(p){return p.text===line.text;});});
  if(!added.length)return;
  if(added.length!==1||vBusy){
    toast('Mittaririvi odottaa. Avaa muistiinpanon ⋯ → Kirjaa mittaririvi.');return;
  }
  var spec=dashSpec(),table=spec&&!spec.err&&dashEntryTables(spec)[0];
  if(!table){toast('Mittaririvi odottaa päiväkohtaista mittaritaulukkoa.');return;}
  var path=table.tiedosto,csv=dashCsv(VC.files[path].t),line=added[0];
  var parsed=metricTextParse(line.text,dashEntryCols(table,csv.h),metricDayOfNote(note,note.date));
  if(parsed.error){toast(parsed.error);return;}
  var oldRow=csv.rows.find(function(row){return row.pvm===parsed.day;})||{},edits=[];
  parsed.values.forEach(function(value,id){edits.push({id:id,before:oldRow[id]||'',after:value});});
  var repo=vRepo(),branch=G.branch;
  vBusy=true;vRender();
  try{
    var result=await dashWriteDay(path,parsed.day,edits,repo,branch);
    if(result.file&&vRepo()===repo&&G.branch===branch){VC.files[path]=result.file;vSaveC();}
    if(result.error){toast(result.error);return;}
    if(note.text===source&&vNotes().indexOf(note)>=0){
      var marked=markMetricLine(source,line);
      if(noteCur===note&&$('nsheet').open&&$('ns-text').value!==source){
        toast('Mittarit tallennettu. Muistiinpanossa on vielä muokkaamaton kuittaus.');return;
      }
      noteWrite(note,marked);touch();
      if(noteCur===note&&$('nsheet').open){$('ns-text').value=marked;foundInfo();paintHl();}
    }
    vAt=vClock();render();toast('Muistiinpanon mittarit tallennettu.');
  }catch(e){toast('Mittaririvi jäi odottamaan. Yritä muistiinpanon ⋯-valikosta.');}
  finally{vBusy=false;vRender();vFlush();}
}
function showDashEntry(tables,seed,origin){
  if(vBusy){toast('Vault synkronoi. Yritä hetken kuluttua.');return;}
  var dialog=$('dash-entry'),form=$('dash-entry-form'),day=$('dash-entry-day'),pick=$('dash-entry-table');
  var fields=$('dash-entry-fields'),msg=$('dash-entry-msg'),save=$('dash-entry-save'),reload=$('dash-entry-reload'),inputs=[],parsedKeys=new Set();
  var textInput=$('dash-entry-text'),textOptions=$('dash-entry-text-options'),parse=$('dash-entry-parse');
  textOptions.open=!!seed;textInput.value=seed||'';
  day.value=origin?origin.day:todayIso();pick.textContent='';$('dash-entry-table-row').hidden=tables.length<2;
  tables.forEach(function(T,i){var o=el('option','',T.nimi||T.id);o.value=i;pick.appendChild(o);});
  function showFields(){
    var T=tables[+pick.value],file=VC.files[T.tiedosto],data=dashCsv(file&&file.t);
    var old=data.rows.find(function(row){return row.pvm===day.value;})||{};
    fields.textContent='';msg.textContent='';reload.hidden=true;parsedKeys.clear();
    var cols=dashEntryCols(T,data.h);
    textInput.placeholder=metricTextExample(cols);
    inputs=cols.map(function(col){return dashEntryField(fields,col,old[col.id]||'');});
  }
  function fillFromText(){
    var T=tables[+pick.value],file=VC.files[T.tiedosto],headers=dashCsv(file&&file.t).h;
    var parsed=metricTextParse(textInput.value,dashEntryCols(T,headers),day.value);
    if(parsed.error){parsedKeys.clear();msg.textContent=parsed.error;return;}
    day.value=parsed.day;showFields();
    inputs.forEach(function(input){
      if(parsed.values.has(input.field.name)){
        input.field.value=parsed.values.get(input.field.name);parsedKeys.add(input.field.name);
      }
    });
    msg.textContent='Tarkista päivämäärä ja kentät ennen tallentamista.';
  }
  parse.onclick=fillFromText;
  day.onchange=pick.onchange=reload.onclick=showFields;
  form.onsubmit=async function(event){
    event.preventDefault();
    if(vBusy||!vOn()){msg.textContent='Vaultin yhteys tai synkronointi estää tallennuksen juuri nyt.';return;}
    var edits=inputs.filter(function(input){return input.field.value!==input.displayed||(origin&&parsedKeys.has(input.field.name));}).map(function(input){
      return {id:input.field.name,before:input.before,after:input.field.value};
    });
    if(!edits.length){msg.textContent='Kirjauksia ei muutettu.';return;}
    var path=tables[+pick.value].tiedosto,repo=vRepo(),branch=G.branch,when=day.value;
    var controls=[day,pick,save,parse,textInput].concat(inputs.map(function(input){return input.field;}));
    controls.forEach(function(control){control.disabled=true;});
    vBusy=true;vRender();msg.textContent='Tallennetaan…';reload.hidden=true;
    try{
      var result=await dashWriteDay(path,when,edits,repo,branch);
      if(result.file&&vRepo()===repo&&G.branch===branch){VC.files[path]=result.file;vSaveC();}
      if(result.error){msg.textContent=result.error;reload.hidden=!result.conflict;return;}
      vAt=vClock();vMsg='';closeSheet(dialog);
      if(origin&&parsedKeys.size)origin.mark();
      render();toast('Päivän mittarit tallennettu.');
    }catch(e){msg.textContent='Mittareita ei voitu tallentaa. Tarkista vaultin yhteys.';}
    finally{controls.forEach(function(control){control.disabled=false;});vBusy=false;vRender();vFlush();}
  };
  showFields();if(seed)fillFromText();openSheet(dialog);
}
/* Kaikki 0.27: taulukkosolujen kojelautakortit. */
var BOARD_HEAD=['id','otsikko','laji','solu','min','max'],boardState=null,boardBook='';
var BOARD_KINDS=['luku','palkki','teksti','kytkin','liukusaadin','minigraafi'];
try{boardBook=localStorage.getItem('kaikki:korttitaulukko')||'';}catch(e){}
function boardPath(book){return 'taulukot/'+book+'/_nakyma.md';}
function boardFile(book,text){return TAULUKKO.parse(boardPath(book),text,'kojelauta');}
function boardCards(book){
  var cached=VC.files[boardPath(book)],layout=cached&&boardFile(book,cached.t);
  if(!layout||layout.head.join('|')!==BOARD_HEAD.join('|'))return [];
  return layout.rows.filter(function(row){return row[0]&&row[1]&&BOARD_KINDS.indexOf(row[2])>=0;});
}
/* 0.39 (A3.2): kortin kohde voi olla alue `[[valilehti]]!B1:B30` (minigraafi). Alueen loppu rajataan olemassa oleviin riveihin,
   jotta näkymävälilehden muuttuva rivimäärä ei riko korttia. */
function boardTarget(files,ref){
  var match=/^\[\[([a-z0-9_-]+)\]\]!([A-Z]+[1-9]\d*)(?::([A-Z]+[1-9]\d*))?$/i.exec(ref||'');
  if(!match)return null;
  var sheet=files.find(function(file){return file.id===match[1];}),address=TAULUKKO.address(match[2]),to=match[3]?TAULUKKO.address(match[3]):null;
  if(!sheet||!address||(match[3]&&!to))return null;
  if(to){var r1=Math.min(address.row,to.row),r2=Math.max(address.row,to.row),c1=Math.min(address.col,to.col),c2=Math.max(address.col,to.col);
    if(c1>=sheet.head.length)return null;return {sheet:sheet,address:{row:r1,col:c1},to:{row:Math.min(r2,Math.max(0,sheet.rows.length-1)),col:Math.min(c2,sheet.head.length-1)},range:true};}
  if(!sheet.rows[address.row]||address.col>=sheet.head.length)return null;
  return {sheet:sheet,address:address};
}
function boardRef(target){var a=target.address,s=TAULUKKO.column(a.col)+(a.row+1);return target.range?s+':'+TAULUKKO.column(target.to.col)+(target.to.row+1):s;}
function boardValues(model,target){var out=[];if(!target.sheet.rows.length)return out;for(var r=target.address.row;r<=target.to.row;r++)for(var c=target.address.col;c<=target.to.col;c++){var v=model.value(target.sheet,r,c);if(!v.error){var n=dashNum(v.value);if(n!==null)out.push(n);}}return out.slice(-200);}
function boardPatch(text,book,existing,row,remove){
  if(!text){
    if(existing||remove)return {error:'Korttia ei löydy. Päivitä Vault.'};
    return ['---','tyyppi: kojelauta','otsikko: Kojelauta','lahde: emil','---','# Kojelauta','','## Kortit','',
      TAULUKKO.joinRow(BOARD_HEAD),TAULUKKO.joinRow(BOARD_HEAD.map(function(){return '---';})),TAULUKKO.joinRow(row),''].join('\n');
  }
  var layout=boardFile(book,text);
  if(!layout||layout.head.join('|')!==BOARD_HEAD.join('|'))return {error:'Kojelaudan tiedosto on eri muodossa.'};
  var rows=layout.rows.slice(),index=rows.findIndex(function(r){return r[0]===row[0];});
  if(existing){
    if(index<0||rows[index].join('\0')!==existing.join('\0'))return {error:'Korttia muutettiin muualla. Avaa kortti uudelleen.'};
    if(remove)rows.splice(index,1);else rows[index]=row;
  }else{
    if(index>=0)return {error:'Kortin tunnus on jo käytössä.'};
    if(rows.length>=500)return {error:'Korttien määrä on täynnä.'};
    rows.push(row);
  }
  return TAULUKKO.replace(layout,layout.head,rows,layout.divider);
}
function boardRangeSync(){
  var kind=$('board-card-kind').value;
  $('board-card-range').hidden=kind!=='palkki'&&kind!=='liukusaadin';
}
function openBoardCard(book,files,card,preset){
  boardState={book:book,files:files,card:card,repo:vRepo(),branch:G.branch,direct:!!preset};
  var pick=$('board-card-sheet'),target=card&&boardTarget(files,card[3]);pick.textContent='';
  files.forEach(function(file){var option=el('option','',file.name);option.value=file.id;pick.appendChild(option);});
  if(target)pick.value=target.sheet.id;
  $('board-edit-title').textContent=card?'Muokkaa korttia':'Lisää kortti';
  $('board-card-title').value=card?card[1]:'';
  $('board-card-kind').value=card?card[2]:'luku';
  $('board-card-cell').value=target?(card[3].split('!')[1]||boardRef(target)):'';
  if(preset){pick.value=preset.sheet;$('board-card-cell').value=preset.cell;$('board-card-kind').value=preset.kind;}
  $('board-card-min').value=card&&card[4]!==''?card[4]:'0';
  $('board-card-max').value=card&&card[5]!==''?card[5]:'100';
  $('board-edit-msg').textContent='';$('board-edit-delete').hidden=!card;
  var layout=$('board-layout-settings');layout.replaceChildren();
  if(card)dashLayoutOptions(layout,dashTileKey('table',book,card[0]));
  boardRangeSync();openSheet($('board-edit'));$('board-card-title').focus();
}
$('board-card-kind').addEventListener('change',boardRangeSync);
$('board-edit-cancel').addEventListener('click',function(){closeSheet($('board-edit'));});
$('board-edit-form').addEventListener('submit',async function(event){
  event.preventDefault();
  var s=boardState,dialog=$('board-edit'),msg=$('board-edit-msg');
  var title=$('board-card-title').value.trim(),kind=$('board-card-kind').value;
  var ref='[['+$('board-card-sheet').value+']]!'+$('board-card-cell').value.trim().toUpperCase();
  var target=boardTarget(s.files,ref),min=$('board-card-min').valueAsNumber,max=$('board-card-max').valueAsNumber;
  if(!title||!target){msg.textContent='Anna otsikko ja valitse olemassa oleva solu.';return;}
  if(!!target.range!==(kind==='minigraafi')){msg.textContent=kind==='minigraafi'?'Minigraafi tarvitsee alueen, esim. B1:B30.':'Tämä näyttötapa tarvitsee yhden solun. Alueelle valitse Minigraafi.';return;}
  if(!$('board-card-range').hidden&&(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)){msg.textContent='Anna kelvollinen minimi ja sitä suurempi maksimi.';return;}
  if(vBusy||(!mvbUnlocked&&!s.direct)){msg.textContent='Vault synkronoi tai kortit ovat lukittuina.';return;}
  var row=[s.card?s.card[0]:uid('k'),title,kind,ref,$('board-card-range').hidden?'':String(min),$('board-card-range').hidden?'':String(max)];
  sheetDialogControls(dialog,true);vBusy=true;vRender();msg.textContent='Tallennetaan…';
  try{
    var result=await sheetSaveFile(boardPath(s.book),function(text){return boardPatch(text,s.book,s.card,row);},'appi: kojelautakortti',s);
    if(result.error){msg.textContent=result.error;return;}
    closeSheet(dialog);if(s.direct)toast('Kortti lisätty kojelautaan.');render();
  }catch(e){msg.textContent='Korttia ei voitu tallentaa. Tarkista Vaultin yhteys.';}
  finally{vBusy=false;sheetDialogControls(dialog,false);vRender();vFlush();}
});
$('board-edit-delete').addEventListener('click',async function(){
  var s=boardState,d=$('board-edit'),msg=$('board-edit-msg');
  if(!s?.card||vBusy||!mvbUnlocked)return;
  vBusy=true;sheetDialogControls(d,true);msg.textContent='Poistetaan…';
  try{
    var result=await sheetSaveFile(boardPath(s.book),function(text){return boardPatch(text,s.book,s.card,s.card,true);},'appi: poista kojelautakortti',s);
    if(result.error){msg.textContent=result.error;return;}
    closeSheet(d);render();toast('Kortti poistettu.');
  }catch(e){msg.textContent='Korttia ei voitu poistaa. Tarkista Vaultin yhteys.';}
  finally{vBusy=false;sheetDialogControls(d,false);vRender();vFlush();}
});
async function boardSaveValue(book,target,value){
  if(vBusy||!mvbUnlocked){toast('Kortit ovat lukittuina tai Vault synkronoi.');render();return;}
  var sheet=target.sheet,a=target.address,raw=sheet.rows[a.row][a.col];
  var state={row:a.row,col:a.col,repo:vRepo(),branch:G.branch};
  vBusy=true;vRender();
  try{
    var result=await sheetSaveFile(sheet.path,function(text){
      var latest=TAULUKKO.parse(sheet.path,text);
      if(!latest||!latest.rows[a.row]||a.col>=latest.head.length)return {error:'Kohdesolu puuttuu.'};
      var current=latest.rows[a.row][a.col];
      if(current===value)return text;
      if(current!==raw||current.startsWith('='))return {error:'Kohdesolu muuttui. Tarkista tuore arvo.'};
      return editCellSnapshot(latest,state,value);
    },'appi: kojelaudan ohjaus',state);
    if(result.error)toast(result.error);
    render();
  }catch(e){toast('Solun arvoa ei voitu tallentaa.');render();}
  finally{vBusy=false;vRender();vFlush();}
}
function renderBoardCard(card,book,files,model,locked){
  var article=el('article','board-card'),name=card[1],kind=card[2],target=boardTarget(files,card[3]);
  article.appendChild(el('h3','',name));
  if(kind==='minigraafi'){var vals=target&&target.range?boardValues(model,target):null,gr=vals&&nvGraph(vals);
    if(!target||!target.range)article.appendChild(el('p','board-error','#PUUTTUU'));
    else{if(gr){gr.classList.add('board-spark');gr.setAttribute('preserveAspectRatio','none');article.appendChild(gr);}article.appendChild(el('output','',vals.length?formulaDisplay(vals[vals.length-1]):'–'));}
    dashTile(article,dashTileKey('table',book,card[0]),name,'Muokkaa korttia ',function(){openBoardCard(book,files,card);});
    return article;}
  var result=target?model.value(target.sheet,target.address.row,target.address.col):{error:'#PUUTTUU'};
  var n=dashNum(result.value),min=dashNum(card[4])??0,max=dashNum(card[5])??100;
  var editable=!locked&&target&&!target.sheet.locked&&!result.error&&!target.sheet.rows[target.address.row][target.address.col].startsWith('=');
  if(result.error)article.appendChild(el('p','board-error',result.error));
  else if(kind==='luku'||kind==='teksti'){
    article.appendChild(el('p',kind==='luku'?'board-number':'',formulaDisplay(result.value)||'–'));
  }else if(kind==='palkki'){
    var meter=el('meter');meter.min=min;meter.max=max;meter.value=n??min;meter.setAttribute('aria-label',name);
    article.append(meter,el('output','',n==null?'–':formulaDisplay(n)));
  }else if(kind==='kytkin'){
    var label=el('label','board-control'),control=el('input'),on=result.value===true||/^(1|kyllä|kylla|true)$/i.test(result.value);
    control.type='checkbox';control.setAttribute('role','switch');control.checked=on;control.disabled=!editable;control.setAttribute('aria-label',name);
    control.addEventListener('change',function(){boardSaveValue(book,target,control.checked?'1':'0');});
    label.append(control,el('span','',on?'Päällä':'Pois'));article.appendChild(label);
  }else{
    var slider=el('input'),output=el('output','',n==null?'–':formulaDisplay(n));
    slider.type='range';slider.min=min;slider.max=max;slider.step=Number.isInteger(min)&&Number.isInteger(max)?'1':'0.1';
    slider.value=n??min;slider.disabled=!editable;slider.setAttribute('aria-label',name);
    slider.addEventListener('input',function(){output.textContent=formulaDisplay(Number(slider.value));});
    slider.addEventListener('change',function(){boardSaveValue(book,target,slider.value);});
    article.append(slider,output);
  }
  dashTile(article,dashTileKey('table',book,card[0]),name,'Muokkaa korttia ',function(){openBoardCard(book,files,card);});
  return article;
}
function dashboardBooks(files){
  var books=new Map();files.forEach(function(file){if(!books.has(file.book))books.set(file.book,file.bookName);});
  if(books.size&&!books.has(boardBook))boardBook=(files.find(function(file){return file.path===sheetPath;})||files[0]).book;
  return books;
}
var DASH_LAYOUT='data/kojelauta-asettelu.json';
function dashTileKey(type,book,id){return JSON.stringify([type,book,id]);}
function dashIcon(host,icon,label,action){
  var control=button(host,icon,'dash-icon',action);
  control.setAttribute('aria-label',label);control.title=label;return control;
}
function dashEditorDismiss(dialog,isBusy){
  dialog.onclick=function(event){
    if(event.target!==dialog||isBusy())return;
    var r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeSheet(dialog);
  };
  dialog.oncancel=function(event){if(isBusy())event.preventDefault();};
}
function renderDashAt(focus){
  var top=main.scrollTop;render();
  if(tab!=='dash')return;
  main.scrollTop=top;
  if(focus&&$(focus))$(focus).focus({preventScroll:true});
}
function dashLayoutRead(text){
  if(!text)return {version:1,items:{}};
  try{
    var d=JSON.parse(text);
    return d&&d.version===1&&d.items&&typeof d.items==='object'&&!Array.isArray(d.items)?d:null;
  }catch(e){return null;}
}
function dashLayout(){return dashLayoutRead(VC.files[DASH_LAYOUT]?.t)?.items||{};}
function dashSize(value,defaultValue){return Number.isInteger(value)?Math.max(1,Math.min(4,value)):defaultValue;}
function dashTileSize(tile,width,height){
  tile.style.setProperty('--tile-width',width);
  tile.style.setProperty('--tile-width-phone',Math.min(2,width));
  tile.style.setProperty('--tile-height',height===1?'0px':(height*105)+'px');
}
function dashArrange(grid){
  var layout=dashLayout(),tiles=Array.from(grid.children);
  function rank(tile,i){var n=layout[tile.dataset.tile]?.order;return Number.isInteger(n)?n:i;}
  tiles.map(function(tile,i){return {tile:tile,rank:rank(tile,i)};}).sort(function(a,b){return a.rank-b.rank;}).forEach(function(pair){
    var p=layout[pair.tile.dataset.tile]||{};
    dashTileSize(pair.tile,dashSize(p.width,2),dashSize(p.height,1));grid.appendChild(pair.tile);
  });
}
async function dashSaveLayout(changes){
  if(!mvbUnlocked||vBusy){toast('Odota, että Vault on synkronoitu.');return false;}
  var before=dashLayout(),context={repo:vRepo(),branch:G.branch};
  vBusy=true;vRender();
  try{
    var r=await sheetSaveFile(DASH_LAYOUT,function(text){
      var current=dashLayoutRead(text);
      if(!current)return {error:'Kojelaudan asettelutiedosto on virheellinen.'};
      var keys=Object.keys(changes);
      if(keys.some(function(k){return JSON.stringify(before[k])!==JSON.stringify(current.items[k]);}))
        return {error:'Samaa ruutua aseteltiin toisella laitteella. Päivitä ja yritä uudelleen.'};
      keys.forEach(function(k){current.items[k]=Object.assign({},current.items[k],changes[k]);});
      return JSON.stringify(current,null,2)+'\n';
    },'appi: kojelaudan asettelu',context);
    if(r.error){toast(r.error);return false;}
    return true;
  }catch(e){toast('Asettelua ei voitu tallentaa. Tarkista Vaultin yhteys.');return false;}
  finally{vBusy=false;renderDashAt();vRender();vFlush();}
}
function dashMoveTile(key,target,after){
  var grid=panels.dash.querySelector('.dash-grid');
  if(!grid||key===target)return;
  var keys=Array.from(grid.children).map(function(t){return t.dataset.tile;});
  var index=keys.indexOf(key);
  if(index<0||!keys.includes(target))return;
  keys.splice(index,1);keys.splice(keys.indexOf(target)+(after?1:0),0,key);
  if(keys[index]===key)return;
  var changes={};keys.forEach(function(id,i){changes[id]={order:i};});
  return dashSaveLayout(changes);
}
function dashTile(card,key,title,label,edit){
  card.classList.add('dash-tile');card.dataset.tile=key;
  if(!mvbUnlocked)return;
  card.dataset.editing='';var tools=el('div','dash-tile-tools');
  var move=dashIcon(tools,'⠿','Siirrä '+title,edit);move.classList.add('dash-handle');
  dashIcon(tools,'⚙︎',label+title,edit);
  card.prepend(tools);
  var resize=dashIcon(card,'◢','Muuta kokoa · '+title,edit);resize.classList.add('dash-handle','dash-resize');
  dashTilePointer(move,card,false);dashTilePointer(resize,card,true);
}
function dashTilePointer(handle,tile,resize){
  var drag=null,suppress=false;
  handle.addEventListener('pointerdown',function(event){
    if(!event.isPrimary||event.button!==0||vBusy)return;
    var grid=tile.parentElement,layout=dashLayout()[tile.dataset.tile]||{},compact=grid.clientWidth<800&&innerWidth<820;
    var cols=compact?2:4,width=Math.min(cols,dashSize(layout.width,2)),height=dashSize(layout.height,1);
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,grid:grid,cols:cols,width:width,height:height,origWidth:width,origHeight:height};
    suppress=false;handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove',function(event){
    if(!drag||event.pointerId!==drag.id)return;
    var dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!suppress&&Math.hypot(dx,dy)<6)return;
    suppress=true;tile.classList.add('dash-lift');
    if(resize){
      drag.width=Math.min(drag.cols,dashSize(drag.origWidth+Math.round(dx/(drag.grid.clientWidth/drag.cols)),drag.origWidth));
      drag.height=dashSize(drag.origHeight+Math.round(dy/105),drag.origHeight);
      dashTileSize(tile,drag.width,drag.height);return;
    }
    if(drag.target)drag.target.classList.remove('dash-drop');
    var hit=document.elementFromPoint(event.clientX,event.clientY)?.closest('.dash-tile');
    drag.target=hit&&hit.parentElement===drag.grid&&hit!==tile?hit:null;
    if(drag.target){
      var rect=hit.getBoundingClientRect();drag.after=Math.abs(dx)>Math.abs(dy)?event.clientX>rect.left+rect.width/2:event.clientY>rect.top+rect.height/2;
      hit.classList.add('dash-drop');
    }
  });
  function finish(event,cancel){
    if(!drag||event.pointerId!==drag.id)return;
    var done=drag;drag=null;tile.classList.remove('dash-lift');
    if(done.target)done.target.classList.remove('dash-drop');
    if(!suppress)return;
    var key=tile.dataset.tile;
    if(cancel){if(resize)dashArrange(done.grid);return;}
    if(resize){
      if(done.width===done.origWidth&&done.height===done.origHeight){dashArrange(done.grid);return;}
      var change={height:done.height};
      if(done.width!==done.origWidth)change.width=done.width;
      dashSaveLayout({[key]:change}).then(function(ok){if(!ok&&done.grid.isConnected)dashArrange(done.grid);});
    }else if(done.target)dashMoveTile(key,done.target.dataset.tile,done.after);
  }
  handle.addEventListener('pointerup',function(event){finish(event,false);});
  handle.addEventListener('pointercancel',function(event){finish(event,true);});
  handle.addEventListener('lostpointercapture',function(event){finish(event,true);});
  handle.addEventListener('click',function(event){if(suppress){suppress=false;event.preventDefault();event.stopImmediatePropagation();}},true);
}
function dashLayoutOptions(host,key){
  var d=el('details');d.appendChild(el('summary','','Asettelu'));host.appendChild(d);
  var controls=el('fieldset');controls.appendChild(el('legend','','Ruutukoko ja paikka'));d.appendChild(controls);
  var row=dashLayout()[key]||{},box=el('div','btnrow');
  [['width','Leveys',2],['height','Korkeus',1]].forEach(function(spec){
    var wrap=el('div','dash-field'),label=el('label','',spec[1]),select=el('select');
    select.id=uid('dsize');label.htmlFor=select.id;
    for(var n=1;n<=4;n++){var option=el('option','',String(n));option.value=n;select.appendChild(option);}
    select.value=dashSize(row[spec[0]],spec[2]);wrap.append(label,select);controls.appendChild(wrap);
    select.onchange=async function(){if(!await dashSaveLayout({[key]:{[spec[0]]:+select.value}}))select.value=dashSize(dashLayout()[key]?.[spec[0]],spec[2]);};
  });
  [-1,1].forEach(function(step){button(box,step<0?'Siirrä edemmäs':'Siirrä taakse','btn',function(){
    var children=Array.from(panels.dash.querySelectorAll('.dash-grid > .dash-tile'));
    var at=children.findIndex(function(tile){return tile.dataset.tile===key;}),target=children[at+step];
    if(at>=0&&target)dashMoveTile(key,target.dataset.tile,step>0);
  });});
  d.appendChild(box);
}
/* Kojelaudan omat ruudut. Vanhat tekstimuuttujaruudut luetaan ilman lähdesaraketta. */
var MVB_PATH='data/kojelauta.md',MVB_HEAD=['id','otsikko','muuttuja','laske','aika','tunniste','kansio','yksikko','nayta'],
  MVB_SOURCE_HEAD=MVB_HEAD.concat('lahde'),MVB_FILTER_HEAD=MVB_SOURCE_HEAD.concat('kohde','havaintotunniste','alku','loppu','kirjaa'),mvbUnlocked=false,mvbSrcOpen=null;
var MVB_LASKE={arvo:'Arvo',viimeisin:'Viimeisin',luettelo:'Luettelo',summa:'Summa',keskiarvo:'Keskiarvo',min:'Pienin',max:'Suurin',maara:'Määrä'},
  MVB_AIKA=[['','Kaikki'],['7','7 pv'],['30','30 pv'],['90','90 pv'],['365','Vuosi'],['oma','Valittu ajanjakso']],
  MVB_KINDS=[['','Havaintolohko'],['kentta','Muistiinpanon kenttä'],['tarkistuslista','Tämän päivän asiat'],['saadin','Säädin']];
function mvbSplit(line){var t=String(line||'').trim();if(t.length<2||t.charAt(0)!=='|'||t.charAt(t.length-1)!=='|')return null;t=t.slice(1,-1);var out=[],cur='';
  for(var i=0;i<t.length;i++){var c=t.charAt(i);if(c==='\\'&&i+1<t.length){cur+=t.charAt(++i);continue;}if(c==='|'){out.push(cur.trim());cur='';continue;}cur+=c;}out.push(cur.trim());return out;}
function mvbParse(text){
  var eol=String(text).indexOf('\r\n')>=0?'\r\n':'\n',lines=String(text).split(eol);
  for(var i=0;i<lines.length-1;i++){
    var h=mvbSplit(lines[i]),dv=mvbSplit(lines[i+1]);
    if(!h||!dv||dv.length!==h.length||!dv.every(function(x){return /^:?-{3,}:?$/.test(x);}))continue;
    var header=h.join('|').toLowerCase(),extended=header===MVB_SOURCE_HEAD.join('|')||header===MVB_FILTER_HEAD.join('|');
    if(!extended&&header!==MVB_HEAD.join('|'))continue;
    var rows=[],e=i+2;
    while(e<lines.length){
      var row=mvbSplit(lines[e]);if(!row)break;
      while(row.length<MVB_FILTER_HEAD.length)row.push('');
      rows.push(row);e++;
    }
    return {lines:lines,eol:eol,start:i,end:e,rows:rows,extended:extended};
  }
  return null;
}
function mvbKind(row){return row[9]||'';}
function mvbCards(){
  var f=vOn()&&VC.files[MVB_PATH],doc=f&&mvbParse(f.t);
  return doc?doc.rows.filter(function(row){
    var kind=mvbKind(row);
    return row[0]&&(kind==='tarkistuslista'||(row[2]&&(kind===''||kind==='kentta'||kind==='saadin')));
  }):[];
}
function mvbTable(rows,extended){
  var head=rows.some(function(row){return row.slice(10).some(Boolean);})?MVB_FILTER_HEAD:extended?MVB_SOURCE_HEAD:MVB_HEAD;
  return [TAULUKKO.joinRow(head),TAULUKKO.joinRow(head.map(function(){return '---';}))]
    .concat(rows.map(function(row){return TAULUKKO.joinRow(row.slice(0,head.length));}));
}
function mvbPatch(text,existing,row,del){
  if(!text){
    if(del||existing)return {error:'Ruutua ei löydy. Päivitä Vault.'};
    return ['---','tyyppi: kojelauta','otsikko: Kojelaudan ruudut','kuvaus: Kaikki-apin kojelaudan ruudut (ohjeet/appi.md).','nakyy: ei','lahde: emil','---','# Kojelaudan ruudut','']
      .concat(mvbTable([row],!!mvbKind(row)),['']).join('\n');
  }
  var doc=mvbParse(text);if(!doc)return {error:'Kojelaudan tiedosto on eri muodossa.'};
  var rows=doc.rows.slice(),ix=rows.findIndex(function(r){return r[0]===(existing?existing[0]:row[0]);});
  if(existing){
    if(ix<0||rows[ix].join('\0')!==existing.join('\0'))return {error:'Ruutua muutettiin muualla. Avaa se uudelleen.'};
    if(del)rows.splice(ix,1);else rows[ix]=row;
  }else{
    if(ix>=0)return {error:'Ruudun tunnus on jo käytössä.'};
    if(rows.length>=200)return {error:'Ruutuja on jo enimmäismäärä.'};
    rows.push(row);
  }
  return doc.lines.slice(0,doc.start).concat(mvbTable(rows,doc.extended||!!mvbKind(row)),doc.lines.slice(doc.end)).join(doc.eol);
}
function mvbFmt(v,unit){if(v===null||v===undefined||v==='')return '–';if(typeof v!=='number')return String(v);unit=String(unit||'').trim();
  if(unit==='h min'){var neg=v<0,m=Math.round(Math.abs(v)*60),h=Math.floor(m/60);m-=h*60;return (neg?'−':'')+(h?h+' h':'')+(h&&m?' ':'')+(m||!h?m+' min':'');}
  return formulaDisplay(Math.round(v*100)/100).replace(/^-/,'−')+(unit?' '+unit:'');}
function mvbSub(R,res){var a=MVB_AIKA.find(function(x){return x[0]===String(R[4]||'');});
  var period=R[4]==='oma'?[R[12],R[13]].filter(Boolean).map(mvDay).join(' – '):a?a[1].toLowerCase():'kaikki';
  return [MVB_LASKE[res.laske].toLowerCase(),period,res.pisteet+(res.pisteet===1?' havainto':' havaintoa'),R[10],R[5]?'#'+R[5]:'',
    R[11]?'#'+R[11]:'',R[6]?R[6].replace(/^\/+|\/+$/g,'')+'/':''].filter(Boolean).join(' · ');
}
function mvbPlot(res,unit,name){var S=res.sarja;if(!S.length)return null;var vals=S.filter(function(p){return p.v!==null;}).map(function(p){return p.v;});if(!vals.length)return null;
  var W=320,H=96,L=30,Rr=8,Tp=8,B=18,iw=W-L-Rr,ih=H-Tp-B,lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals),pad=(hi-lo)*0.15||1;lo=Math.min(lo-pad,lo>=0&&lo-pad<0?0:lo-pad);hi+=pad;
  function X(i){return L+(S.length>1?i/(S.length-1)*iw:iw/2);}function Y(v){return Tp+(1-(v-lo)/(hi-lo))*ih;}
  var s='<svg class="dsvg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+h_(name)+': '+vals.length+' päivää, joilla arvo">';
  [lo,hi].forEach(function(v){var y=Y(v).toFixed(1);s+='<line class="dg" x1="'+L+'" x2="'+(W-Rr)+'" y1="'+y+'" y2="'+y+'"/><text class="dt" x="'+(L-4)+'" y="'+(+y+3.5)+'" text-anchor="end">'+h_(formulaDisplay(Math.round(v*10)/10))+'</text>';});
  s+='<text class="dt" x="'+L+'" y="'+(H-4)+'">'+dashShort(S[0].d)+'</text><text class="dt" x="'+(W-Rr)+'" y="'+(H-4)+'" text-anchor="end">'+dashShort(S[S.length-1].d)+'</text>';
  var seg='';S.forEach(function(p,i){if(p.v===null){seg+=' ';return;}var prev=i&&S[i-1].v!==null;seg+=(prev?'L':'M')+X(i).toFixed(1)+' '+Y(p.v).toFixed(1);});
  s+='<path class="dln" d="'+seg.trim()+'"/>';S.forEach(function(p,i){if(p.v!==null)s+='<circle class="dpt" cx="'+X(i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="2.6"><title>'+h_(dashShort(p.d)+' '+mvbFmt(p.v,unit))+'</title></circle>';});
  var w=el('div','dplot');w.innerHTML=s+'</svg>';return w;}
function mvbTitle(R){return R[1]||(mvbKind(R)==='tarkistuslista'?'Tämän päivän asiat':mvbKind(R)==='kentta'?R[2]:mvbKind(R)==='saadin'?(saadinById(R[2])||{nimi:R[2]}).nimi:mvDefinition('variables',R[2]).name);}
function mvbTile(card,row){
  dashTile(card,dashTileKey('observation','',row[0]),mvbTitle(row),'Muokkaa ruutua ',function(){openMvbCard(row);});
}
function mvbCloseSources(restoreFocus){
  if(mvbSrcOpen===null)return;
  mvbSrcOpen=null;
  var toggle=panels.dash.querySelector('.mvb-srcbtn[aria-expanded="true"]');
  if(!toggle)return;
  var list=$(toggle.getAttribute('aria-controls')),hadFocus=list.contains(document.activeElement);
  toggle.setAttribute('aria-expanded','false');
  list.hidden=true;list.replaceChildren();
  if(restoreFocus||hadFocus)toggle.focus({preventScroll:true});
}
document.addEventListener('click',function(event){
  if(tab!=='dash'||mvbSrcOpen===null||!(event.target instanceof Element)||event.target.closest('dialog'))return;
  var toggle=panels.dash.querySelector('.mvb-srcbtn[aria-expanded="true"]');
  if(!toggle||!toggle.closest('.mvb-card').contains(event.target))mvbCloseSources(false);
},true);
document.addEventListener('keydown',function(event){
  if(event.key==='Escape'&&!event.defaultPrevented&&tab==='dash'&&mvbSrcOpen!==null&&!document.querySelector('dialog[open]')){
    event.preventDefault();mvbCloseSources(true);
  }
});
function mvbSourceControl(card,actions,R,sources,title){
  var list=el('div','mvb-src');
  list.id=uid('mvbsrc');list.tabIndex=0;list.hidden=true;
  list.setAttribute('role','region');
  list.setAttribute('aria-label','Lähteet: '+title);
  var toggle=button(actions,'Lähteet ('+sources.length+')','mini mvb-srcbtn',function(){
    if(!list.hidden){mvbCloseSources(false);return;}
    mvbCloseSources(false);mvbSrcOpen=R[0];show();
  });
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls',list.id);
  function show(){
    list.hidden=false;toggle.setAttribute('aria-expanded','true');
    sources.slice().sort(function(a,b){
      var x=a.o.paivat[a.o.paivat.length-1]||'',y=b.o.paivat[b.o.paivat.length-1]||'';
      return x===y?0:!x?1:!y?-1:x<y?1:-1;
    }).forEach(function(x){
      var b=button(list,'','btn mvrow',function(){
        var note=data.notes.indexOf(x.n)>=0?x.n:(x.n.vp?vNoteOf(x.n.vp.replace(/\.md$/i,'')):null);
        if(!note){toast('Muistiinpanoa ei voi avata (piilotettu tai arkistoitu).');return;}
        openNote(note);
      });
      b.append(el('b','',mvbKind(R)==='kentta'&&x.o.luku!==null?formulaDisplay(x.o.luku):x.o.arvo),
        el('span','mvwhen',mvDays(x.o)),el('span','mvsrc',mvTitle(x.n)));
    });
    list.scrollTop=0;
  }
  card.appendChild(list);
  if(mvbSrcOpen===R[0])show();
}
function mvbCard(R,notes,today,fields){
  var card=el('section','dcard mvb-card'),title=mvbTitle(R),res=MUUTTUJA.ruutu(notes,{
    muuttuja:R[2],laske:R[3],aika:R[4],tunniste:R[5],kansio:R[6],lahde:mvbKind(R),
    kohde:R[10],havaintotunniste:R[11],alku:R[12],loppu:R[13]
  },today,fields,mvDefinition),unit=R[7]||(mvbKind(R)===''?mvDefinition('variables',R[2]).unit:'');
  card.dataset.id=R[0];
  var h=el('div','dch'),nm=el('b','',title);h.appendChild(nm);h.appendChild(el('span','dval',mvbFmt(res.arvo,res.laske==='maara'?'':unit)));card.appendChild(h);
  var sub=el('small','dwhen mvb-sub',mvbSub(R,res));card.appendChild(sub);
  if(R[8]==='kuvaaja'){var pl=mvbPlot(res,res.laske==='maara'?'':unit,title);card.appendChild(pl||el('p','dnone','Ei päivättyjä lukuja tällä välillä.'));}
  if(res.lahteet.length||R[14]==='kylla'){
    var row=el('div','btnrow mvb-acts');card.appendChild(row);
    if(res.lahteet.length)mvbSourceControl(card,row,R,res.lahteet,title);
    if(R[14]==='kylla')button(row,'Kirjaa arvo','btn',function(){
      openQuickEntry('muuttujat',{mode:'muuttujat',name:mvDefinition('variables',R[2]).name,
        key:'ruutu:'+R[0],subject:mvDefinition('subjects',R[10]).name,tag:R[11]});
    });
  }
  mvbTile(card,R);return card;}
function mvbChecklist(R,entries,today){
  var card=el('section','dcard mvb-card'),h=el('div','dch'),tag=noteTagKey(R[5]),
    dir=String(R[6]||'').trim().replace(/^\/+|\/+$/g,'');
  card.dataset.id=R[0];
  card.dataset.kind='tarkistuslista';
  h.appendChild(el('b','',mvbTitle(R)));card.appendChild(h);
  var matches=entries.filter(function(x){
    if(dir&&!(x.n.vp||'').startsWith(dir+'/'))return false;
    if(!tag)return true;
    var parts=noteParts(x.n.text),section=parts[partIx(parts,x.o)];
    return noteTags({vfm:x.n.vfm,text:section?section.t:'',created:x.n.created}).includes(tag);
  });
  mvbTile(card,R);
  if(!matches.length){
    card.appendChild(el('p','dnone','Ei tämän päivän asioita.'));return card;
  }
  var list=el('div','mvb-checklist');
  matches.forEach(function(x){
    var title=calTitle(x.n,x.o)||'(tyhjä)',key=occKey(today,x.o),done=ptDone(x.n,key),
      line=el('div','wline mvb-check'),id=JSON.stringify([x.n.id,key]);
    var link=button(line,'','wrow'+(done?' done':''),function(){openNote(x.n,null,key);});
    if(x.timed)link.appendChild(el('span','wt',hm(x.s)));
    link.appendChild(el('span','wtt',title));
    var ck=calCk('wck',x.n,key,title,function(on){
      /* Sama kerta voi näkyä useassa suodatetussa ruudussa. Päivitä kaikki ilman uudelleenpiirtoa. */
      var rows=card.closest('.mvb').querySelectorAll('.mvb-check');
      rows.forEach(function(row){
        if(row.dataset.occ!==id)return;
        row.firstChild.classList.toggle('done',on);
        row.lastChild.setAttribute('aria-pressed',on?'true':'false');
        row.lastChild.setAttribute('aria-label',(on?'Kuitattu: ':'Kuittaa: ')+title);
      });
    });
    line.dataset.occ=id;
    line.appendChild(ck);list.appendChild(line);
  });
  card.appendChild(list);return card;
}
/* 0.89 (jäsennys A6.2): säädin kojelaudan ruutuna. Ruutu viittaa säätimen tunnukseen (data/kojelauta.md, lahde = saadin). */
function mvbSaadin(R){
  var card=el('section','dcard mvb-card saadin-card'),it=saadinById(R[2]);
  card.dataset.id=R[0];card.dataset.kind='saadin';
  if(R[1])card.appendChild(el('div','dch')).appendChild(el('b','',R[1]));
  if(!it)card.appendChild(el('p','dnone','Säädintä '+R[2]+' ei löydy. Valitse ruudulle toinen säädin.'));
  else{
    var b=button(card,it.nimi,'btn saadin-press',function(){saadinPress(it,null);});
    b.disabled=!!it.virhe;b.setAttribute('aria-label','Kirjaa: '+it.nimi);
    card.appendChild(el('small','dwhen',saadinSummary(it)));
  }
  mvbTile(card,R);return card;
}
function renderDashboardTiles(panel){
  if(!vOn()||!vK()||vK().id!==data.k)return;
  var section=el('section','mvb'),toolbar=el('div','dash-toolbar'),grid=el('div','dash-grid');
  section.setAttribute('aria-label','Kojelaudan ruudut');
  var sheets=sheetFiles(),books=dashboardBooks(sheets);
  if(books.size>1){
    var pick=el('select');pick.setAttribute('aria-label','Korttien taulukko');
    books.forEach(function(name,id){var option=el('option','',name);option.value=id;pick.appendChild(option);});
    pick.value=boardBook;pick.onchange=function(){boardBook=pick.value;try{localStorage.setItem('kaikki:korttitaulukko',boardBook);}catch(e){}renderDashAt();};
    toolbar.appendChild(pick);
  }
  var mode=dashIcon(toolbar,mvbUnlocked?'✓':'⚙︎',mvbUnlocked?'Valmis':'Muokkaa ruutuja',function(){
    mvbUnlocked=!mvbUnlocked;renderDashAt('mvb-lock');
  });
  mode.id='mvb-lock';mode.setAttribute('aria-pressed',String(mvbUnlocked));
  if(mvbUnlocked)dashIcon(toolbar,'+','Lisää ruutu',function(){openMvbCard(null);}).id='mvb-add';
  var cards=mvbCards(),today=todayIso(),notes,fields,entries;
  cards.forEach(function(row){
    if(mvbKind(row)==='saadin'){grid.appendChild(mvbSaadin(row));return;}
    if(mvbKind(row)==='tarkistuslista'){
      if(!entries){var day=dayEntries(calNotes(),today,durMin());entries=day.timed.concat(day.untimed);}
      grid.appendChild(mvbChecklist(row,entries,today));return;
    }
    if(!notes)notes=mvNotes();
    if(mvbKind(row)==='kentta'&&!fields)fields=formulaContext().get();
    grid.appendChild(mvbCard(row,notes,today,fields));
  });
  if(books.size){
    var local=sheets.filter(function(sheet){return sheet.book===boardBook;});
    boardCards(boardBook).forEach(function(card){grid.appendChild(renderBoardCard(card,boardBook,local,formulaContext().tables(),!mvbUnlocked));});
  }
  dashArrange(grid);section.append(toolbar,grid);panel.appendChild(section);
  /* Sticky-alueen pitää ulottua myös CSV-mittareiden loppuun. */
  panel.insertBefore(toolbar,section);return grid;
}
function mvbFieldNames(){
  var allowed=formulaContext().allowed,found=new Set(allowed);
  mvNotes().forEach(function(n){KAAVA.fields(n,allowed).forEach(function(_,name){found.add(name);});});
  nvViews().forEach(function(view){view.cols.forEach(function(col){found.add(col.k);});});
  return Array.from(found).filter(nvUserKey).sort(function(a,b){return a.localeCompare(b,'fi');});
}
function openMvbCard(R){var d=$('mvb-edit');
  if(!d){d=el('dialog','nved dash-config');d.id='mvb-edit';d.setAttribute('aria-labelledby','mvb-edit-title');SMALL[d.id]=1;document.body.appendChild(d);d.addEventListener('close',modalSync);}
  d.textContent='';var busy=false,h=el('h2','',R?'Muokkaa ruutua':'Uusi ruutu');h.id='mvb-edit-title';d.appendChild(h);
  dashEditorDismiss(d,function(){return busy;});
  var form=el('form','mvb-form'),names=mvRegistry().map(function(g){return g.nimi;});
  function group(name){var f=el('fieldset');f.appendChild(el('legend','',name));form.appendChild(f);return f;}
  var base=group('Sisältö'),filters=group('Rajaukset'),display=group('Esitys');
  function field(id,label,ctl){
    var where=['mvb-kind','mvb-saadin','mvb-var','mvb-field','mvb-title','mvb-subject'].includes(id)?base:
      ['mvb-laske','mvb-unit','mvb-show','mvb-write'].includes(id)?display:filters;
    var wrap=el('div','dash-field'),l=el('label','',label);l.htmlFor=id;ctl.id=id;ctl.name=id;wrap.append(l,ctl);where.appendChild(wrap);return ctl;
  }
  function sel(opts,val){var s=el('select');opts.forEach(function(o){var op=el('option','',o[1]);op.value=o[0];s.appendChild(op);});s.value=val;return s;}
  function inp(val,ph){var i=el('input');i.type='text';i.value=val||'';if(ph)i.placeholder=ph;i.autocomplete='off';return i;}
  var kind=R?mvbKind(R):'',options=MVB_KINDS.slice(),books=sheetFiles();
  if(!R&&books.length)options.push(['taulukko','Taulukon solu tai alue']);
  if(!R&&dashCsvTiles(true).length)options.push(['mittari','Palauta mittariruutu']);
  var fKind=field('mvb-kind','Ruudun tyyppi',sel(options,kind));
  var fSaadin=field('mvb-saadin','Säädin',el('select'));
  function saadinOptions(pick){
    var cur=pick||fSaadin.value||(R&&kind==='saadin'?R[2]:'');fSaadin.replaceChildren();
    saadinItems().forEach(function(it){var op=el('option','',it.nimi+(it.virhe?' (korjattava)':''));op.value=it.tunnus;fSaadin.appendChild(op);});
    if(cur&&!saadinById(cur)){var lost=el('option','',cur+' (ei löydy)');lost.value=cur;fSaadin.prepend(lost);}
    var add=el('option','','+ Uusi säädin…');add.value='__uusi';fSaadin.appendChild(add);
    fSaadin.value=cur&&Array.from(fSaadin.options).some(function(o){return o.value===cur;})?cur:fSaadin.options[0].value;
  }
  saadinOptions();
  fSaadin.addEventListener('change',function(){
    if(fSaadin.value!=='__uusi')return;
    var prev=Array.from(fSaadin.options).find(function(o){return o.value!=='__uusi';});fSaadin.value=prev?prev.value:'';
    openSaadinEdit(null,{after:function(it){saadinOptions(it&&it.tunnus);refill();}});
  });
  var vOpts=names.map(function(n){return [n,n];}),varName=R?mvDefinition('variables',R[2]).name:'';
  if(R&&kind===''&&names.every(function(n){return MUUTTUJA.key(n)!==MUUTTUJA.key(varName);}))vOpts.unshift([varName,varName+' (ei merkintöjä)']);
  var fieldNames=mvbFieldNames(),fieldOpts=fieldNames.map(function(n){return [n,n];});
  if(R&&kind==='kentta'&&!fieldNames.includes(R[2]))fieldOpts.unshift([R[2],R[2]+' (ei merkintöjä)']);
  var cur=R&&kind===''?(vOpts.find(function(o){return MUUTTUJA.key(o[0])===MUUTTUJA.key(varName);})||[])[0]:'';
  var fVar=field('mvb-var','Muuttuja',sel(vOpts.length?vOpts:[['','Ei tekstimuuttujia']],cur||((vOpts[0]||[])[0]||''))),
    fField=field('mvb-field','Muistiinpanon kenttä',sel(fieldOpts.length?fieldOpts:[['','Ei muistiinpanon kenttiä']],R&&kind==='kentta'?R[2]:((fieldOpts[0]||[])[0]||''))),
    fTit=field('mvb-title','Otsikko',inp(R?R[1]:'','')),
    fLas=field('mvb-laske','Lasku',sel(Object.keys(MVB_LASKE).map(function(k){return [k,MVB_LASKE[k]];}),R&&MVB_LASKE[R[3]]?R[3]:'viimeisin')),
    fAik=field('mvb-aika','Aikaväli',sel(MVB_AIKA,R&&MVB_AIKA.some(function(a){return a[0]===R[4];})?R[4]:'')),
    fTag=field('mvb-tag','Tunniste (valinnainen)',inp(R?R[5]:'','esim. arki')),fDir=field('mvb-dir','Kansio (valinnainen)',inp(R?R[6]:'','esim. paivat')),
    fUni=field('mvb-unit','Yksikkö (valinnainen)',inp(R?R[7]:'','esim. h, kg, h min')),fNay=field('mvb-show','Näytä',sel([['luku','Luku'],['kuvaaja','Luku ja päiväkuvaaja']],R&&R[8]==='kuvaaja'?'kuvaaja':'luku'));
  var subjects=mvSubjects(),selected=R?mvDefinition('subjects',R[10]).name:'';
  if(selected&&!subjects.includes(selected))subjects.unshift(selected);
  var fSubject=field('mvb-subject','Kohde',sel([['','Kaikki kohteet']].concat(subjects.map(function(s){return [s,s];})),selected)),
    fOwnTag=field('mvb-obs-tag','Havainnon tunniste (valinnainen)',inp(R?R[11]:'','')),
    fStart=field('mvb-start','Alkupäivä',inp(R?R[12]:'','')),fEnd=field('mvb-end','Loppupäivä',inp(R?R[13]:'','')),
    fWrite=field('mvb-write','Kirjausnappi',sel([['','Piilossa'],['kylla','Lisää kirjaus päivämuistiinpanoon']],R?R[14]:''));
  fStart.type=fEnd.type='date';
  var dl=el('datalist');dl.id='mvb-units';['h','min','h min','kg','km','€','%','kpl'].forEach(function(u){var o=el('option');o.value=u;dl.appendChild(o);});form.appendChild(dl);fUni.setAttribute('list','mvb-units');
  function refill(){
    var type=fKind.value,checklist=type==='tarkistuslista',control=type==='saadin',fixed=checklist||control;
    var custom=fAik.value==='oma'&&!fixed;
    [[fSaadin,!control],[fVar,type!==''],[fField,type!=='kentta'],[fLas,fixed],[fAik,fixed],[fUni,fixed],[fNay,fixed],[fTag,control],[fDir,control],
      [fSubject,type!==''],[fOwnTag,type!==''],[fWrite,type!==''],[fStart,!custom],[fEnd,!custom]].forEach(function(pair){
      pair[0].closest('.dash-field').hidden=pair[1];
    });
    form.querySelectorAll('fieldset').forEach(function(f){var fs=f.querySelectorAll('.dash-field');f.hidden=fs.length>0&&Array.from(fs).every(function(x){return x.hidden;});});
    var chosen=control&&saadinById(fSaadin.value);
    fTit.placeholder=checklist?'Tämän päivän asiat':control?(chosen?chosen.nimi:''):type==='kentta'?fField.value:fVar.value;
  }
  fKind.onchange=function(){
    if(fKind.value==='mittari'){closeSheet(d);openDashCsvTile();return;}
    if(fKind.value==='taulukko'){
      dashboardBooks(books);closeSheet(d);
      openBoardCard(boardBook,books.filter(function(sheet){return sheet.book===boardBook;}),null);return;
    }
    refill();
  };
  [fVar,fField,fAik,fSaadin].forEach(function(input){input.addEventListener('change',refill);});refill();
  if(R)dashLayoutOptions(form,dashTileKey('observation','',R[0]));
  var msg=el('p','msg');msg.id='mvb-msg';msg.setAttribute('aria-live','polite');form.appendChild(msg);
  var foot=el('div','dash-editor-footer');
  async function save(del){if(busy)return;if(vBusy){msg.textContent='Vault synkronoi. Yritä hetken päästä.';return;}
    var type=fKind.value,control=type==='saadin',checklist=type==='tarkistuslista'||control,
      source=type==='tarkistuslista'?'':control?(fSaadin.value==='__uusi'?'':fSaadin.value):type==='kentta'?fField.value:fVar.value;
    var tag=control?'':fTag.value.trim(),tagKey=noteTagKey(tag);
    if(!del&&type!=='tarkistuslista'&&!source){msg.textContent=control?'Valitse säädin tai tee uusi.':type==='kentta'?'Valitse muistiinpanon kenttä.':'Valitse tekstimuuttuja tai vaihda ruudun tyyppiä.';return;}
    if(!del&&tag&&!tagKey){msg.textContent='Anna yksi tunniste, esimerkiksi arki.';return;}
    var ownTag=noteTagKey(fOwnTag.value),custom=fAik.value==='oma'&&!checklist;
    if(!del&&type===''&&fOwnTag.value.trim()&&!ownTag){msg.textContent='Anna havainnolle yksi tunniste.';return;}
    if(!del&&custom&&(!fStart.value||!fEnd.value||fStart.value>fEnd.value)){msg.textContent='Valitse alku- ja loppupäivä oikeassa järjestyksessä.';return;}
    var row=[R?R[0]:uid('r'),fTit.value.trim(),source,checklist?'':fLas.value,checklist?'':fAik.value,
      tagKey,control?'':fDir.value.trim().replace(/^\/+|\/+$/g,''),checklist?'':fUni.value.trim(),checklist?'':fNay.value,type,
      type===''?fSubject.value:'',type===''?ownTag:'',custom?fStart.value:'',custom?fEnd.value:'',type===''?fWrite.value:''];
    busy=true;vBusy=true;vRender();sheetDialogControls(d,true);msg.textContent='Tallennetaan…';
    try{var r=await sheetSaveFile(MVB_PATH,function(text){return mvbPatch(text,R,row,del);},del?'appi: kojelaudan ruutu pois':'appi: kojelaudan ruutu',{repo:vRepo(),branch:G.branch});
      if(r&&r.error){msg.textContent=r.error;return;}closeSheet(d);if(del&&mvbSrcOpen===row[0])mvbCloseSources(false);render();toast(del?'Ruutu poistettu.':'Ruutu tallennettu.');}
    catch(e){msg.textContent='Ruutua ei voitu tallentaa. Tarkista Vaultin yhteys.';}
    finally{busy=false;vBusy=false;sheetDialogControls(d,false);vRender();vFlush();}}
  if(R){var del=button(foot,'Poista ruutu','btn danger',function(){save(true);});del.id='mvb-del';}
  button(foot,'Peru','btn',function(){closeSheet(d);});
  var ok=el('button','btn primary','Tallenna');ok.type='submit';ok.id='mvb-save';foot.appendChild(ok);form.appendChild(foot);
  form.addEventListener('submit',function(e){e.preventDefault();save(false);});d.appendChild(form);openSheet(d);try{fKind.focus({preventScroll:true});}catch(e){}}
function dashCsvTiles(hidden){
  var spec=dashSpec(),items=dashLayout(),out=[];
  (spec?.taulukot||[]).forEach(function(table){
    var file=VC.files[table.tiedosto];if(!file)return;
    var csv=dashCsv(file.t);
    (table.sarakkeet||[]).forEach(function(column){
      if(!column?.id||column.kaytossa===false||column.kuvaaja===false||!csv.h.includes(column.id))return;
      var key=dashTileKey('csv',table.id,column.id);
      if(!!items[key]?.hidden===hidden)out.push({key:key,table:table,column:column,csv:csv});
    });
  });
  return out;
}
function openDashCsvTile(tile){
  var d=$('csv-tile-edit');
  if(!d){d=el('dialog','nved dash-config');d.id='csv-tile-edit';SMALL[d.id]=1;
    d.setAttribute('aria-labelledby','csv-tile-title');document.body.appendChild(d);d.addEventListener('close',modalSync);}
  var busy=false;dashEditorDismiss(d,function(){return busy;});
  d.replaceChildren();
  var title=el('h2','',tile?(tile.column.nimi||tile.column.id):'Palauta mittariruutu');
  title.id='csv-tile-title';d.appendChild(title);
  async function save(item,hidden){
    if(busy)return;
    busy=true;sheetDialogControls(d,true);
    var saved=await dashSaveLayout({[item.key]:{hidden:hidden}});
    busy=false;if(saved){closeSheet(d);return;}
    sheetDialogControls(d,false);
  }
  if(tile){
    dashLayoutOptions(d,tile.key);
    button(d,'Poista kojelaudalta','btn danger',function(){save(tile,true);});
  }else dashCsvTiles(true).forEach(function(item){
    button(d,item.column.nimi||item.column.id,'btn',function(){save(item,false);});
  });
  button(d,'Sulje','btn',function(){closeSheet(d);});openSheet(d);
}
function renderDash(){var p=panels.dash;p.textContent='';setInfo('');
  var dashboard=renderDashboardTiles(p);
  var bar=el('div','seg dashr');bar.id='dashrange';bar.setAttribute('role','group');bar.setAttribute('aria-label','Aikaväli');var cur=dashRange();
  DASHR.forEach(function(r){var b=button(bar,'','',function(){try{localStorage.setItem('kaikki:dashr',r[0]);}catch(e){}render();});b.className='';b.dataset.r=r[0];b.setAttribute('aria-pressed',cur===r[0]?'true':'false');b.setAttribute('aria-label',r[1]);b.appendChild(el('span','lg',r[1]));b.appendChild(el('span','sh',r[2]));});
  var top=el('div','dashtop');top.appendChild(bar);p.appendChild(top);
  if(!vOn()){p.appendChild(subI('Kojelauta näyttää GitHub-vaultin luvut. Yhdistä vault ensin.','Valikko → GitHub-vault (tietokoneella yläpalkin pilvi).'));return;}
  var S=dashSpec();if(!S){p.appendChild(subI('Vaultissa ei ole mittareita.','Kojelauta lukee vaultin tiedoston data/mittarit.json. Pyydä tekoälyä lisäämään mittari vaultin ohjeen ohjeet/data.md mukaan.'));return;}
  if(S.err){p.appendChild(el('p','sub','Tiedostoa data/mittarit.json ei voitu lukea (virheellinen muoto).'));return;}
  var tables=dashEntryTables(S);
  if(tables.length)button(top,'Kirjaa mittarit','btn',function(){showDashEntry(tables);}).id='dash-entry-open';
  var today=todayIso(),from=cur==='all'?null:isoD(addDays(fromIso(today),-(+cur-1)));
  var visible=dashCsvTiles(false),grid=dashboard||el('div','dgrid');
  visible.forEach(function(item){
    var T=item.table,c=item.column,D=item.csv,key=T.avain||D.h[0],points=[];
    D.rows.forEach(function(r){var value=dashNum(r[c.id]);if(dashDay(r[key])&&value!==null)points.push({d:r[key],v:value});});
    points.sort(function(a,b){return a.d.localeCompare(b.d);});
    var card=dashCard(T,c,points,from,today);
    if(dashboard)dashTile(card,item.key,c.nimi||c.id,'Muokkaa mittariruutua ',function(){openDashCsvTile(item);});
    grid.appendChild(card);
  });
  if(dashboard)dashArrange(grid);else p.appendChild(grid);
  if(!visible.length&&!dashCsvTiles(true).length)p.appendChild(el('p','sub','Mittareiden taulukoita ei löytynyt vaultista.'));}
function dashCard(T,c,all,from,today){var card=el('section','dcard');card.dataset.c=c.id;var h=el('div','dch');var nm=el('b','',c.nimi||c.id);h.appendChild(nm);
  var last=all.length?all[all.length-1]:null,val=el('span','dval',last?dashFmt(last.v,c):'–'),wh=el('small','dwhen',last?(last.d===today?'tänään':dashShort(last.d)):'');h.appendChild(val);h.appendChild(wh);card.appendChild(h);
  var pts=all.filter(function(x){return !from||x.d>=from;});
  if(!pts.length){card.appendChild(el('p','dnone','Ei kirjauksia tällä välillä.'));return card;}
  var x0=from||pts[0].d,x1=today>pts[pts.length-1].d?today:pts[pts.length-1].d,span=Math.max(1,Math.round((fromIso(x1)-fromIso(x0))/864e5));
  var W=320,H=120,L=30,R=8,Tp=8,B=18,iw=W-L-R,ih=H-Tp-B;function X(d){return L+Math.round((fromIso(d)-fromIso(x0))/864e5)/span*iw;}
  var lo,hi;if(c.laji==='asteikko'){lo=+c.min||0;hi=c.max!=null?+c.max:5;}else if(c.laji==='valinta'){var ids=(c.arvot||[]).map(function(a){return +a[0];}).filter(isFinite);lo=Math.min.apply(null,ids.length?ids:[0]);hi=Math.max.apply(null,ids.length?ids:[1]);}
  else if(c.laji==='kylla-ei'){lo=0;hi=7;}else{lo=Math.min.apply(null,pts.map(function(x){return x.v;}));hi=Math.max.apply(null,pts.map(function(x){return x.v;}));var pad=(hi-lo)*0.15||1;lo-=pad;hi+=pad;}
  if(hi<=lo)hi=lo+1;function Y(v){return Tp+(1-(v-lo)/(hi-lo))*ih;}
  var s='<svg class="dsvg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+h_(c.nimi||c.id)+': '+pts.length+' kirjausta">';
  [lo,hi].forEach(function(v,i){var yy=Y(v).toFixed(1);s+='<line class="dg" x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'"/><text class="dt" x="'+(L-4)+'" y="'+(+yy+3.5)+'" text-anchor="end">'+h_(c.laji==='kylla-ei'?(i?'7/vk':'0'):dashFmt(Math.round(v*10)/10,{laji:c.laji==='valinta'?'valinta':'luku',arvot:c.arvot}))+'</text>';});
  s+='<text class="dt" x="'+L+'" y="'+(H-4)+'">'+dashShort(x0)+'</text><text class="dt" x="'+(W-R)+'" y="'+(H-4)+'" text-anchor="end">'+dashShort(x1)+'</text>';
  var hit=[];
  if(c.laji==='kylla-ei'){var wk={};pts.forEach(function(x){var ws=isoD(weekStart(x.d));(wk[ws]||(wk[ws]={n:0,k:0})).k++;if(x.v)wk[ws].n++;});
    var bw=Math.max(3,Math.min(18,iw*7/span-3));Object.keys(wk).sort().forEach(function(ws){var xx=Math.max(L,X(ws)),y=Y(wk[ws].n);s+='<rect class="dbr" x="'+xx.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,Tp+ih-y).toFixed(1)+'" rx="2"/>';hit.push({x:xx+bw/2,t:'vk '+isoWeekNo(fromIso(ws))+': '+wk[ws].n+' / '+wk[ws].k});});}
  else{var line=pts.map(function(x,i){return (i?'L':'M')+X(x.d).toFixed(1)+' '+Y(x.v).toFixed(1);}).join('');
    if(c.laji==='asteikko'){var avg=[];pts.forEach(function(x){var a=isoD(addDays(fromIso(x.d),-6)),w=all.filter(function(q){return q.d>=a&&q.d<=x.d;});avg.push({d:x.d,v:w.reduce(function(t,q){return t+q.v;},0)/w.length});});
      s+='<path class="dln soft" d="'+line+'"/>'+pts.map(function(x){return '<circle class="dpt" cx="'+X(x.d).toFixed(1)+'" cy="'+Y(x.v).toFixed(1)+'" r="2.6"/>';}).join('');
      s+='<path class="dln" d="'+avg.map(function(x,i){return (i?'L':'M')+X(x.d).toFixed(1)+' '+Y(x.v).toFixed(1);}).join('')+'"/>';
      pts.forEach(function(x,i){hit.push({x:X(x.d),t:dashShort(x.d)+' '+dashFmt(x.v,c)+' · ka '+String(Math.round(avg[i].v*10)/10).replace('.',',')});});}
    else{s+='<path class="dln" d="'+line+'"/>'+(pts.length<=60?pts.map(function(x){return '<circle class="dpt" cx="'+X(x.d).toFixed(1)+'" cy="'+Y(x.v).toFixed(1)+'" r="2.6"/>';}).join(''):'');
      pts.forEach(function(x){hit.push({x:X(x.d),t:dashShort(x.d)+' '+dashFmt(x.v,c)});});}}
  s+='<line class="dcur" x1="0" x2="0" y1="'+Tp+'" y2="'+(Tp+ih)+'" visibility="hidden"/></svg>';
  var wrap=el('div','dplot');wrap.innerHTML=s;card.appendChild(wrap);
  /* osoitus tai napautus näyttää lähimmän arvon otsikkorivillä; poistuessa takaisin viimeisimpään */
  var sv=wrap.firstChild,cl=sv.querySelector('.dcur'),v0=val.textContent,w0=wh.textContent;
  function at(ev){var r=sv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*W,best=null;hit.forEach(function(q){if(!best||Math.abs(q.x-x)<Math.abs(best.x-x))best=q;});if(!best)return;
    cl.setAttribute('x1',best.x);cl.setAttribute('x2',best.x);cl.setAttribute('visibility','visible');val.textContent=best.t;wh.textContent='';card.classList.add('hov');}
  function off(){cl.setAttribute('visibility','hidden');val.textContent=v0;wh.textContent=w0;card.classList.remove('hov');}
  sv.addEventListener('pointermove',at);sv.addEventListener('pointerdown',at);sv.addEventListener('pointerleave',off);
  return card;}
function h_(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
/* ---- 1.106 päivän napit (Emil 18.11.2026): kalenterin päivälle Päiväkartan tapaan ----
   Napit = Asiat-taulukon Päivä-sarakkeessa merkityt asiat taulukon järjestyksessä. Päivän otsikon nappi avaa pienen ikkunan: napautus valitsee
   asian tälle päivälle, palkki ja prosentti kertovat, kuinka todennäköisesti valitset sen tämän päivän muiden valintojen ja viikonpäivän perusteella
   (myös kahden tekijän yhdistelmät), nuoli kun valinnat nostivat tai laskivat arviota. Ulkopuolinen napautus sulkee. */
var pvDay=null;
function pvData(){if(!data.pv||!Array.isArray(data.pv.on))data.pv={on:[],c:{},d:{}};return data.pv;}
function pvOn(id){return pvData().on.indexOf(id)>=0;}
function pvTerms(){var all=rankTerms().filter(function(t){return !t.time;}),imp=impList(all);return imp.concat(all.filter(function(t){return imp.indexOf(t)<0;})).filter(function(t){return pvOn(t.id);});}
function pvSel(day){var T=pvData();return (T.d[day]||[]).filter(function(id){return pvOn(id);});}
function pvChip(h,d){if(!pvData().on.length)return;var S=pvSel(d),b=button(h,'','pvday',function(ev){ev.stopPropagation();pvOpen(d);});b.dataset.day=d;
  var nm=S.map(itemName).filter(Boolean);b.appendChild(el('span','',nm.length?nm.join(', '):'Päivä'));b.setAttribute('aria-label','Päivän napit: '+(nm.length?nm.join(', '):'ei valintoja'));if(nm.length)b.classList.add('on');}
function pvOpen(d){pvDay=d;renderPv();openSheet($('pvsheet'));}
function renderPv(){var b=$('pv-body'),d=pvDay,T=pvTerms(),V=pvData(),S=pvSel(d),dt=fromIso(d);b.textContent='';
  $('pv-h').textContent=WDS[dt.getDay()]+' '+dt.getDate()+'.'+(dt.getMonth()+1)+'.';
  if(!T.length){b.appendChild(el('p','sub','Ei päivän nappeja. Merkitse asiat Asiat-taulukon Päivä-sarakkeeseen.'));return;}
  var w=el('div','pvopts');w.id='pv-opts';
  T.forEach(function(t){var on=S.indexOf(t.id)>=0,L=pvLift(V,d,S,t.id),o=button(w,'','pvopt',function(){pvToggle(V,d,t.id);touch();renderPv();render();});o.dataset.t=t.id;
    o.setAttribute('aria-pressed',on?'true':'false');o.appendChild(el('span','t',t.name));var pc=el('span','pct');
    if(L){o.style.setProperty('--f',L.p.toFixed(3));if(L.dir){var ar=el('i',L.dir>0?'up':'dn',L.dir>0?'↑':'↓');pc.appendChild(ar);}pc.appendChild(document.createTextNode(Math.round(L.p*100)+' %'));
      o.setAttribute('aria-label',t.name+(on?', valittu':'')+', arvio '+Math.round(L.p*100)+' %');}
    else{pc.textContent='–';o.setAttribute('aria-label',t.name+(on?', valittu':'')+', arvio puuttuu');}o.appendChild(pc);});
  b.appendChild(w);
  var n=Object.keys(V.d).filter(function(x){return x!==d&&V.d[x].length;}).length;
  var h=el('div','pvfoot');h.appendChild(el('span','sub',n<3?'Arvio alkaa, kun kirjattuja päiviä on 3 (nyt '+n+').':'Arvio '+n+' muun päivän perusteella.'));
  h.appendChild(ib('Palkki ja prosentti: kuinka todennäköisesti valitset asian tälle päivälle sen perusteella, mitä olet jo valinnut, viikonpäivän ja kahden tekijän yhdistelmien mukaan muina kirjattuina päivinä. Nuoli: tämän päivän valinnat nostivat tai laskivat arviota vähintään 5 %-yksikköä. Napit valitaan Asiat-taulukon Päivä-sarakkeessa.'));b.appendChild(h);}
/* ---- 1.109 Flow (Emil 19.11.2026; ent. yksinkertainen Päätöspuu 1.106) ----
   Flow on allekkaisia ruutupareja: vasemmalla syyruutu (Aloitus / Tai / Ja / Poissulkevat / Lopetus), oikealla seurausruutu (tuo näkyviin).
   Ensimmäinen pari on aina Aloitus. Ruudun asiat ovat kehystettyjä nappeja; ruudun + lisää asian. Muokkaus pienissä ikkunoissa (stPop),
   jotka sulkeutuvat ulkopuolisesta napautuksesta. Käytössä näkyvät vaihtoehdot ovat nappeina rinnakkain ja allekkain; valinta tuo säännöt voimaan.
   Asialle voi valita Flow'n Asiat-osiossa; Ruudun ikkunan Flow-nappi kulkee sen rivikohtaisesti (data.fl.run['rivi|asia']). */
var stCur=null,stBuild=false,stNewOn=false,stDelArm=null,stAssign=null;
var ST_NAME={a:'Aloitus',tai:'Tai',ja:'Ja',x:'Poissulkevat',end:'Lopetus, jokin',endja:'Lopetus, kaikki',os:'Osio päättyy, jokin',osja:'Osio päättyy, kaikki'},ST_SHORT={tai:'Tai',ja:'Ja',x:'Pois',end:'Loppu tai',endja:'Loppu ja',os:'Osio tai',osja:'Osio ja'},ST_ROLL=['tai','ja','x','end','endja','os','osja'],ST_LG=['tai','ja','x'];
function stKey(r){return r.ty==='end'||r.ty==='os'?r.ty+(r.lg==='ja'?'ja':''):r.ty;}
/* 1.111: ohuet viivakuvakkeet ruutuparin työkaluihin (kopioi, poista) */
var ST_SVG={cp:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 2.5v6a2 2 0 0 0 2 2h7.5M10.5 7.5l3 3-3 3"/></svg>',del:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9M6.8 7v4.5M9.2 7v4.5"/></svg>'};
function stTrees(){if(!Array.isArray(data.st))data.st=[];return data.st;}
function stTree(){var L=stTrees();var t=L.filter(function(x){return x.id===stCur;})[0]||L[0]||null;stCur=t?t.id:null;return t;}
function stById(id){return stTrees().filter(function(x){return x.id===id;})[0]||null;}
function stName(t,id){var f=t.f.filter(function(x){return x.id===id;})[0];return f?f.n:'';}
function stEnds(t){var E={};t.r.forEach(function(x){if(x.ty==='end')x.c.forEach(function(y){E[y]=1;});});return E;}
function stAddTree(n){n=clean(n).slice(0,80);if(!n)return;var t=stNorm([{id:uid('s'),name:n,r:[]}])[0];stTrees().push(t);stCur=t.id;stBuild=true;
  if(stAssign){flData().m[stAssign]=t.id;stAssign=null;}touch();render();}
function flData(){if(!data.fl||typeof data.fl!=='object')data.fl={m:{},run:{}};if(!data.fl.m)data.fl.m={};if(!data.fl.run)data.fl.run={};return data.fl;}
/* Pieni ikkuna päälle: ulkopuolinen napautus sulkee, ei ruksia. Kortti on yläosassa, joten näppäimistö ei työnnä sitä. */
var stPopOn=null;
function stPop(build,key,onClose){var o=$('stpop');if(!o){o=el('div','stpbg');o.id='stpop';document.body.appendChild(o);
    o.addEventListener('click',function(ev){if(ev.target!==o)return;ev.preventDefault();ev.stopPropagation();stPopClose();});}
  stPopOn={build:build,key:key,close:onClose||null};stPopDraw();}
function stPopDraw(){var o=$('stpop');if(!o||!stPopOn)return;var d0=o.firstChild,sc=d0&&o._key===stPopOn.key?d0.scrollTop:0;o.textContent='';var d=el('div','stpd');d.setAttribute('role','dialog');
  stPopOn.build(d);o.appendChild(d);o.hidden=false;o._key=stPopOn.key;d.scrollTop=sc;}
function stPopClose(){var o=$('stpop'),f=stPopOn&&stPopOn.close;stPopOn=null;if(o){o.hidden=true;o.textContent='';o._key=null;}if(f)f();render();}
function stFocus(id){setTimeout(function(){var x=$(id);if(x)try{x.focus({preventScroll:true});}catch(e){}},0);}
var FLOW_TEXT_EXAMPLE=[
  '- Onko minulla puoli tuntia?',
  '  - On',
  '    - Mitä teen ensin?',
  '      - Käyn kävelyllä.',
  '      - Luen yhden luvun.',
  '  - Ei',
  '    - Päätän seuraavan pienen askeleen.'
].join('\n');
function readFlowText(text){
  var lines=String(text).split(/\r?\n/),root=null,parents=[],size=0;
  function failure(row,message){return {error:'Rivi '+(row+1)+'. '+message};}
  for(var i=0;i<lines.length;i++){
    var line=lines[i];
    if(!line.trim()||(!root&&/^#\s/.test(line)))continue;
    var match=/^( *)(?:-|\*|\+)[ \t]+(\S.*)$/.exec(line);
    if(!match)return failure(i,'Kirjoita jokainen kohta luetteloviivan jälkeen.');
    var depth=match[1].length/2;
    if(depth%1||depth>parents.length||depth>16)return failure(i,'Sisennä kaksi välilyöntiä kutakin tasoa kohti.');
    if(++size>150)return failure(i,'Kokeiluun mahtuu enintään 150 kohtaa.');
    var node={text:match[2].trim(),children:[]};
    if(depth===0){
      if(root)return failure(i,'Puulla voi olla yksi aloituskohta.');
      root=node;
    }else{
      var next=parents[depth-1].children;
      if(depth%2===0&&next.length)return failure(i,'Vastauksella voi olla yksi seuraava kysymys tai lopputulos.');
      next.push(node);
    }
    parents.length=depth;parents.push(node);
  }
  return root&&root.children.length?{root:root}:{error:'Kirjoita aloituskysymys ja vähintään yksi sisennetty vaihtoehto.'};
}
function renderFlowTextTree(nodes){
  var list=el('ol');
  nodes.forEach(function(node){
    var row=el('li','',node.text);
    if(node.children.length)row.appendChild(renderFlowTextTree(node.children));
    list.appendChild(row);
  });
  return list;
}
function openFlowText(){
  var d=$('flow-text-preview'),source=$('flow-text-source'),feedback=$('flow-text-feedback'),run=$('flow-text-run');
  var step=$('flow-text-step'),choices=$('flow-text-choices'),back=$('flow-text-back'),restart=$('flow-text-restart');
  var path=[];
  source.value=FLOW_TEXT_EXAMPLE;feedback.textContent='';run.hidden=true;
  function show(){
    var node=path[path.length-1];
    step.textContent=node.text;choices.textContent='';
    node.children.forEach(function(child){
      button(choices,child.text,'btn',function(){path.push(child.children[0]||child);show();});
    });
    back.hidden=restart.hidden=path.length<2;
    step.focus();
  }
  $('flow-text-read').onclick=function(){
    var parsed=readFlowText(source.value);
    feedback.textContent=parsed.error||'';
    run.hidden=!!parsed.error;
    if(parsed.error)return;
    var tree=$('flow-text-tree');tree.textContent='';tree.appendChild(renderFlowTextTree([parsed.root]));
    path=[parsed.root];show();
  };
  back.onclick=function(){path.pop();show();};
  restart.onclick=function(){path.length=1;show();};
  source.oninput=function(){run.hidden=true;feedback.textContent='';};
  openSheet(d);
}
function renderPuu(){var p=panels.puu;p.textContent='';var L=stTrees(),t=stTree();setInfo('');
  var bar=el('div','stbar');var tw=el('div','pkchips stpicks');tw.id='st-trees';
  L.forEach(function(x){var b=button(tw,x.name,'mini',function(){stCur=x.id;stDelArm=null;render();});b.dataset.s=x.id;b.setAttribute('aria-pressed',t&&x.id===t.id?'true':'false');});
  if(stNewOn||!L.length){var w=el('span','pknew'),i=el('input');i.type='text';i.id='st-newtree';i.placeholder='Uuden Flow’n nimi';i.autocomplete='off';i.setAttribute('enterkeyhint','done');w.appendChild(i);
    var go=function(){stNewOn=false;stAddTree(i.value);};i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();go();}});button(w,'Luo','mini',go).id='st-newtreeok';tw.appendChild(w);
    if(L.length||stAssign)stFocus('st-newtree');}
  else{var nb=button(tw,'+ Uusi Flow','pklink',function(){stNewOn=true;render();});nb.id='st-addtree';}
  bar.appendChild(tw);
  if(t){var rb=button(bar,'Rakenna','mini stbuild',function(){stBuild=!stBuild;stDelArm=null;render();});rb.id='st-build';rb.setAttribute('aria-pressed',stBuild?'true':'false');}
  p.appendChild(bar);
  var preview=el('div','btnrow');
  button(preview,'Kokeile tekstipuuta','btn',openFlowText).id='flow-text-open';
  p.appendChild(preview);
  if(!t){p.appendChild(subI('Ei vielä Flow’ta.','Anna nimi. Rakenna-tilassa lisätään ruutupareja: syyt vasemmalle, niiden tuomat vaihtoehdot oikealle.'));return;}
  if(stBuild)stBuildView(p,t);
  else{var w2=el('div','stuse');stUseView(w2,t,t.p,function(s){t.p=s;touch();render();});p.appendChild(w2);
    var dn=stVis(t,t.p).done,r=el('div','btnrow stfoot');
    if(dn)button(r,'Muistiinpanoksi','btn',function(){var N={id:uid('n'),created:nowIso(),edited:nowIso(),text:t.name+': '+stPath(t,t.p),date:''};data.notes.unshift(N);t.p=[];touch();render();toast('Muistiinpano tehty');}).id='st-note';
    if(t.p.length)button(r,'Alusta','btn',function(){t.p=[];touch();render();}).id='st-reset';p.appendChild(r);}}
/* Käyttö: näkyvät vaihtoehdot nappeina; valitut painettuina. Lopetuksen valinta päättää (Valmis näkyy polun kanssa). */
function stUseView(p,t,sel,set){var V=stVis(t,sel),E=stEnds(t);
  if(!V.vis.length){p.appendChild(subI('Flow ”'+t.name+'” on vielä tyhjä.','Rakenna-tilassa Aloitus-ruutuun tulevat ensimmäiset vaihtoehdot.'));return;}
  var w=el('div','stopts');w.id='st-opts';
  /* 1.112: uuden parin tuomat vaihtoehdot pienen välin päähän, välissä parin miniotsikko, jos se on annettu */
  var prev=null,RH={},ps=0;t.r.forEach(function(x){RH[x.id]=x.h||'';});
  /* 1.113: osio näkyy vasta edellisen päätyttyä ohuena väliotsikkona; aiemmat osiot jäävät näkyviin */
  function sdiv(s){var d=el('div','stsec');d.dataset.s=s.i;d.appendChild(el('span','',s.ot||''));if(!s.ot)d.classList.add('blank');w.appendChild(d);}
  if(V.secs[0]&&V.secs[0].ot)sdiv(V.secs[0]);
  V.vis.forEach(function(id){var sr=V.src[id]||'',sc=V.sec[id]||0;while(ps<sc){ps++;var s=V.secs.filter(function(q){return q.i===ps;})[0];if(s)sdiv(s);prev=null;}
    if(prev!==null&&sr!==prev){var g=el('div','stgap'+(RH[sr]?' h':''),RH[sr]||'');w.appendChild(g);}prev=sr;
    var on=V.sel.indexOf(id)>=0,b=button(w,'','stopt'+(E[id]?' end':''),function(){set(stPick(t,V.sel,id));});b.dataset.f=id;b.setAttribute('aria-pressed',on?'true':'false');b.appendChild(el('span','t',stName(t,id)));});
  var last=V.secs.length?V.secs[V.secs.length-1].i:0;while(ps<last){ps++;var s2=V.secs.filter(function(q){return q.i===ps;})[0];if(s2)sdiv(s2);}
  p.appendChild(w);
  var st=el('p','stend'+(V.done?' on':''));st.id='st-end';st.textContent=V.done?'Valmis: '+stPath(t,V.sel):V.sel.length?stPath(t,V.sel):'';p.appendChild(st);}
/* Rakenna: ruutuparit allekkain. Syyruudun otsikon napautus vaihtaa lajia; ruudun + lisää asian; asian napautus avaa sen ikkunan. */
function stBuildView(p,t){var E=stEnds(t),list=el('div','strules');list.id='st-rules';
  function nrid(){var i=1;while(t.r.some(function(x){return x.id==='r'+i;}))i++;return 'r'+i;}
  t.r.forEach(function(r,ri){var row=el('div','strule');row.dataset.r=r.id;var solo=r.ty==='end'||r.ty==='os',k=stKey(r),arm=stDelArm==='r:'+r.id;if(solo)row.classList.add('solo');
    /* Emil 19.11. klo 7.36: laji vaihtuu ruudun yläkulman pienestä napista, joka rullaa vaihtoehdot läpi (ei valikkoa).
       1.111: Aloitusruutu sisältää aloitusvaihtoehdot ja rullaa Tai/Ja/Pois; Lopetus rullaa Loppu tai / Loppu ja. */
    var L=el('div','stbox ty-'+r.ty);L.dataset.ty=r.ty;var hb=el('div','stbh');
    if(r.ty==='a')hb.appendChild(el('b','',ri>0?'Osion aloitus':'Aloitus'));
    if(arm){var ok=button(hb,'Poista pari','sttyc stdelok',function(){t.r=t.r.filter(function(x){return x!==r;});stTop(t);stDelArm=null;t.p=stVis(t,t.p).sel;touch();render();});ok.id='st-rdelok';}
    else if(r.ty==='a'){var lb=button(hb,ST_SHORT[r.lg],'sttyc ty-'+r.lg,function(){r.lg=ST_LG[(ST_LG.indexOf(r.lg)+1)%ST_LG.length];stDelArm=null;t.p=stVis(t,t.p).sel;touch();render();});
      lb.dataset.ty=r.lg;lb.setAttribute('aria-label','Aloituksen laji: '+ST_NAME[r.lg]+'. Napautus vaihtaa.');}
    else{var tyb=button(hb,ST_SHORT[k],'sttyc ty-'+r.ty,function(){var nk=ST_ROLL[(ST_ROLL.indexOf(k)+1)%ST_ROLL.length];
        var ns=/^(end|os)/.test(nk),was=r.ty==='end'||r.ty==='os';
        if(ns){r.ty=nk.replace('ja','');r.lg=/ja$/.test(nk)?'ja':'tai';if(!was){r.e0=r.e.length?r.e:r.e0;r.e=[];}}
        else{r.ty=nk;delete r.lg;if(was&&!r.e.length&&r.e0)r.e=r.e0;}
        /* osionvaihdosta pois: tyhjä osion aloitus sen perästä poistuu */
        if(k.indexOf('os')===0&&!/^os/.test(nk)){var nx=t.r[t.r.indexOf(r)+1];if(nx&&nx.ty==='a'&&!nx.c.length&&!nx.e.length&&!nx.ot&&!nx.h)t.r.splice(t.r.indexOf(nx),1);}
        stTop(t);stDelArm=null;t.p=stVis(t,t.p).sel;touch();render();});
      tyb.dataset.ty=k;tyb.setAttribute('aria-label','Ruudun laji: '+ST_NAME[k]+'. Napautus vaihtaa.');}
    /* 1.111: kopio sisältöineen heti alle; poisto: tyhjä pari heti, muuten vahvistus ruudun vasemmasta kulmasta (eri kohta) */
    var tools=el('span','sttools');
    if(r.ty!=='a'){var db=button(tools,'','sticon stdelp'+(arm?' on':''),function(){if(!r.c.length&&!r.e.length){t.r=t.r.filter(function(x){return x!==r;});stTop(t);stDelArm=null;touch();render();return;}
        stDelArm=arm?null:'r:'+r.id;render();});db.innerHTML=ST_SVG.del;db.setAttribute('aria-label',arm?'Peruuta poisto':'Poista ruutupari');db.setAttribute('aria-pressed',arm?'true':'false');db.dataset.r=r.id;}
    hb.appendChild(tools);L.appendChild(hb);
    /* 1.113: osion otsikko aloitusruudussa (näkyy käytössä ohuena väliotsikkona) */
    if(r.ty==='a'){var ob=button(L,r.ot||(ri>0?'+ osion otsikko':'+ otsikko'),'sthd stot'+(r.ot?' on':''),function(){stHeadPop(t,r,'ot');});ob.dataset.r=r.id;ob.setAttribute('aria-label','Osion otsikko (valinnainen): '+(r.ot||'ei otsikkoa'));}
    stChips(L,t,r,'c',E);
    row.appendChild(L);
    if(!solo){var R=el('div','stbox eff');var h2=el('div','stbh');h2.appendChild(el('b','','Tuo näkyviin'));
      /* 1.112: nuoli kopioi oikean ruudun sisällön uuden parin vasemmaksi ruuduksi heti alle (mitä tästä seuraa) */
      var ct=el('span','sttools'),cb=button(ct,'','sticon stcopy',function(){if(!r.e.length)return;t.r.splice(t.r.indexOf(r)+1,0,{id:nrid(),ty:'tai',c:r.e.slice(),e:[]});stDelArm=null;touch();render();toast('Uusi pari: seuraukset syiksi');});
      cb.innerHTML=ST_SVG.cp;cb.setAttribute('aria-label','Kopioi seuraukset uuden parin syiksi');cb.dataset.r=r.id;cb.disabled=!r.e.length;h2.appendChild(ct);R.appendChild(h2);
      /* 1.112: valinnainen miniotsikko, näkyy käytössä tämän parin tuomien vaihtoehtojen yllä */
      var hi=button(R,r.h||'+ otsikko','sthd'+(r.h?' on':''),function(){stHeadPop(t,r);});hi.setAttribute('aria-label','Miniotsikko (valinnainen): '+(r.h||'ei otsikkoa'));hi.dataset.r=r.id;
      stChips(R,t,r,'e',E);row.appendChild(R);}
    list.appendChild(row);});
  /* 1.111 (Emil 19.11.2026): pitkä painallus nostaa ruutuparin raahattavaksi; Aloitus pysyy ensimmäisenä */
  dragList(list,function(i,j){var m=t.r[i];if(!m)return;t.r.splice(i,1);t.r.splice(j,0,m);stTop(t);stDelArm=null;t.p=stVis(t,t.p).sel;touch();render();});
  p.appendChild(list);
  var ad=el('div','staddrow');var ab=button(ad,'+ Ruutupari','btn stadd',function(){var i=1;while(t.r.some(function(x){return x.id==='r'+i;}))i++;t.r.push({id:'r'+i,ty:'tai',c:[],e:[]});touch();render();
    setTimeout(function(){var m=main;m.scrollTop=m.scrollHeight;},0);});ab.id='st-addrule';p.appendChild(ad);
  var tb=el('div','stsel sttree');var tr2=el('div','lrow'),tl=el('label','fl','Flow’n nimi');tl.htmlFor='st-tname';tr2.appendChild(tl);var ti=el('input');ti.type='text';ti.id='st-tname';ti.value=t.name;ti.autocomplete='off';
  ti.addEventListener('change',function(){var n=clean(ti.value).slice(0,80);if(n){t.name=n;touch();render();}});tr2.appendChild(ti);tb.appendChild(tr2);
  var dr2=el('div','btnrow stdel');var db2=button(dr2,stDelArm==='tree'?'Peruuta':'Poista Flow','btn',function(){stDelArm=stDelArm==='tree'?null:'tree';render();});db2.id='st-tdel';
  if(stDelArm==='tree'){dr2.appendChild(el('span','sp'));button(dr2,'Poista','btn danger',function(){var F=flData();Object.keys(F.m).forEach(function(k){if(F.m[k]===t.id)delete F.m[k];});data.st=stTrees().filter(function(x){return x!==t;});stCur=null;stDelArm=null;stBuild=false;touch();render();}).id='st-tdelok';}
  tb.appendChild(dr2);p.appendChild(tb);}
/* 1.112: miniotsikon muokkaus pienessä ikkunassa (kenttä 16 px, ettei iPhone zoomaa); tyhjä poistaa otsikon */
function stHeadPop(t,r,key){key=key||'h';stPop(function(d){d.appendChild(el('div','stph',key==='ot'?'Osion otsikko (valinnainen)':'Miniotsikko (valinnainen)'));var a=el('div','addrow'),i=el('input');i.type='text';i.id='st-head';i.value=r[key]||'';i.placeholder='Tyhjä = ei otsikkoa';i.autocomplete='off';i.setAttribute('enterkeyhint','done');a.appendChild(i);
    var go=function(){var v=clean(i.value).slice(0,60);if(v)r[key]=v;else delete r[key];touch();};i.addEventListener('input',go);i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();go();stPopClose();}});d.appendChild(a);stFocus('st-head');},'hd'+key+r.id);}
function stChips(box,t,r,side,E){var w=el('div','stchips');(r[side]||[]).forEach(function(id){var b=button(w,stName(t,id),'stchip'+(E[id]?' end':''),function(){stItemPop(t,r,side,id);});b.dataset.f=id;});
  var pb=button(w,'+','stchip stplus',function(){stAddPop(t,r,side);});pb.setAttribute('aria-label','Lisää asia: '+(side==='e'?'tuo näkyviin':ST_NAME[r.ty]));pb.dataset.side=side;box.appendChild(w);}
/* Asian lisäys ruutuun: kenttä uudelle ja Flow’n olemassa olevat asiat napautettavina */
function stAddPop(t,r,side){stPop(function(d){d.appendChild(el('div','stph',(side==='e'?'Tuo näkyviin':ST_NAME[r.ty])+': lisää asia'));
    var a=el('div','addrow'),i=el('input');i.type='text';i.id='st-new';i.placeholder='Uusi asia';i.autocomplete='off';i.setAttribute('enterkeyhint','done');a.appendChild(i);
    var add=function(){var x=stItem(t,i.value);if(!x)return;if(r[side].indexOf(x.id)<0)r[side].push(x.id);t.p=stVis(t,t.p).sel;touch();i.value='';stPopDraw();stFocus('st-new');};
    i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();add();}});button(a,'Lisää','btn',add).id='st-newok';d.appendChild(a);
    var w=el('div','pkchips stexist');w.id='st-exist';t.f.forEach(function(f){var on=r[side].indexOf(f.id)>=0,b=button(w,f.n,'mini',function(){if(on)r[side]=r[side].filter(function(y){return y!==f.id;});else r[side].push(f.id);t.p=stVis(t,t.p).sel;touch();stPopDraw();});b.dataset.f=f.id;b.setAttribute('aria-pressed',on?'true':'false');});
    if(t.f.length)d.appendChild(w);stFocus('st-new');},'add'+r.id+side);}
function stItemPop(t,r,side,id){stDelArm=null;stPop(function(d){var f=t.f.filter(function(x){return x.id===id;})[0];if(!f){stPopClose();return;}
    var a=el('div','addrow'),i=el('input');i.type='text';i.id='st-name';i.value=f.n;i.autocomplete='off';i.setAttribute('aria-label','Asian nimi');a.appendChild(i);
    i.addEventListener('change',function(){var n=clean(i.value).slice(0,120);if(n){f.n=n;touch();}});d.appendChild(a);
    var br=el('div','btnrow');button(br,'Pois ruudusta','btn',function(){r[side]=r[side].filter(function(y){return y!==id;});t.p=stVis(t,t.p).sel;touch();stPopClose();}).id='st-out';d.appendChild(br);
    var dr=el('div','btnrow stdel');var db=button(dr,stDelArm==='item'?'Peruuta':'Poista koko Flow’sta','btn',function(){stDelArm=stDelArm==='item'?null:'item';stPopDraw();});db.id='st-del';
    if(stDelArm==='item'){dr.appendChild(el('span','sp'));button(dr,'Poista','btn danger',function(){stDel(t,id);stDelArm=null;touch();stPopClose();}).id='st-delok';}d.appendChild(dr);},'it'+r.id+side+id,function(){stDelArm=null;});}
/* Asian Flow (Asiat-osio): valinta olemassa olevista, ei Flow’ta, tai + Uusi Flow, joka vie Flow-osioon ja liittää uuden tähän asiaan */
function flPick(tid,name){stPop(function(d){d.appendChild(el('div','stph','Flow: '+name));var F=flData(),cur=F.m[tid]||null,w=el('div','pkchips');w.id='fl-trees';
    stTrees().forEach(function(t){var b=button(w,t.name,'mini',function(){if(cur===t.id)delete F.m[tid];else F.m[tid]=t.id;touch();stPopClose();});b.dataset.s=t.id;b.setAttribute('aria-pressed',cur===t.id?'true':'false');});
    var nb=button(w,'+ Uusi Flow','pklink',function(){stAssign=tid;stNewOn=true;stBuild=false;stPopOn=null;var o=$('stpop');if(o){o.hidden=true;o.textContent='';}showTab('puu');});nb.id='fl-new';d.appendChild(w);
    if(cur){var r=el('div','btnrow');button(r,'Ei Flow’ta','btn',function(){delete F.m[tid];touch();stPopClose();}).id='fl-none';d.appendChild(r);}},'fl'+tid);}
/* Rivin asian Flow: kulku on rivikohtainen. Kuittaus (OK) kulun alkamisen jälkeen aloittaa seuraavan kulun alusta. Valmis = vihreä; jälki muistiinpanoksi. */
function flOkAt(r,tid){var x=(r.it||[]).filter(function(y){return y.id===tid;})[0];return x&&x.ok||'';}
function flRun(r,tid){var F=flData(),k=r.id+'|'+tid,R=F.run[k],ok=flOkAt(r,tid);if(R&&ok&&R.t&&ok>R.t){delete F.run[k];R=null;}return R||null;}
function flGreen(r,tid){var R=flRun(r,tid);return !!(R&&R.d);}
function flOpen(r,tid){var t=stById(flData().m[tid]);if(!t)return;
  stPop(function(d){var hd=el('div','stph');hd.appendChild(el('b','',rowNm(r)+' · '+itemName(tid)));hd.appendChild(el('span','stphs',' '+t.name));d.appendChild(hd);var R=flRun(r,tid);
    stUseView(d,t,R?R.s:[],function(s){var F=flData(),k=r.id+'|'+tid,X=F.run[k]||(F.run[k]={s:[],t:nowIso()});X.s=s;if(!X.t)X.t=nowIso();
      var dn=stVis(t,s).done;if(dn&&!X.d){X.d=nowIso();var N={id:uid('n'),created:X.d,edited:X.d,text:rowNm(r)+' '+itemName(tid)+': '+stPath(t,s),date:''};data.notes.unshift(N);toast('Flow valmis');}
      else if(!dn&&X.d)delete X.d;if(!s.length&&!X.d)delete F.run[k];touch();stPopDraw();});
    if(R&&R.s.length){var b=el('div','btnrow');button(b,'Alusta','btn',function(){delete flData().run[r.id+'|'+tid];touch();stPopDraw();}).id='fl-reset';d.appendChild(b);}},'run'+r.id+tid);}
/* ---- termit ---- */
var termCur=null,termArm=0,termSec={tun:1};
var termDel=null;
function openTerms(){termSolo=null;termCur=null;termDel=null;if($('tsheet').open)closeSheet($('tsheet'));showTab('terms');}
/* Yksi asiasanakortti kaikkialta (1.56, suunnitelma C2): muistiinpanon asiasanan nimi ja suodattimen sirun i avaavat saman kortin.
   Valmis tai ruksi palaa sinne, mistä kortti avattiin (back), ei Asiasanat-luetteloon. */
var termSolo=null;
function openTerm(id,back){var t=allTerms().filter(function(x){return x.id===id;})[0];termCache=null;if(!t)return;termSolo=back||function(){};termCur=t;termArm=0;termDel=null;renderTerms();openSheet($('tsheet'));}
function termDone(){var f=termSolo;termSolo=null;termCur=null;closeSheet($('tsheet'));f();}
/* Asiasanojen poisto, myös puun palikat (a:avain): rivi pois puun tekstistä ja säännöistä kaikissa puissa, joissa se on (1.44.2) */
function delTermIds(ids){
  ids.forEach(function(id){if(id.slice(0,2)!=='a:')return;var k=id.slice(2);delete data.words[k];data.projects.forEach(function(P){var it=parseText(P.text).by[k];if(!it)return;
    removeKey(P,k);P.text=replaceLine(P.text,it.line,null);if(P.rt===1&&typeof rulesToText==='function')rulesToText(P);});});data.terms=data.terms.filter(function(t){return ids.indexOf(t.id)<0;});data.grp=(data.grp||[]).filter(function(g){return ids.indexOf(g.id)<0;});
  data.imp=data.imp.filter(function(x){return ids.indexOf(x)<0;});data.pk=(data.pk||[]).filter(function(x){return ids.indexOf(x)<0;});if(data.pv)data.pv.on=data.pv.on.filter(function(x){return ids.indexOf(x)<0;});if(data.fl&&data.fl.m)ids.forEach(function(x){delete data.fl.m[x];});(data.grp||[]).forEach(function(g){g.m=g.m.filter(function(x){return ids.indexOf(x)<0;});});
  data.chk.forEach(function(r){r.it=(r.it||[]).filter(function(x){return ids.indexOf(x.id)<0;});});}
function lines(s){return String(s||'').split(/\r?\n/).map(clean).filter(Boolean);}
var KINDN={b:'nappula',g:'ryhmä',t:'ilmoitus',q:'apukysymys',x:'tekstilohko',k:'kääntöpuoli'};
function termRow(t,extra,tab){var r=el('button','row'+(t.auto&&t.kind==='g'?' grp':t.auto&&t.kind==='t'?' txt':''));r.type='button';r.dataset.id=t.id;var s=el('span','t',t.name);
  var info=[];if(t.auto)info.push(KINDN[t.kind]+' · '+t.proj);if(t.yes.length)info.push(t.yes.length+(t.yes.length===1?' sana':' sanaa'));if(t.no.length)info.push(t.no.length+(t.no.length===1?' poissulkeva':' poissulkevaa'));if(renewTxt(t)&&!(tab&&!evWd(t.wd).length&&!evMd(t.md).length&&EVC.some(function(o){return o[0]===evDays(t.ev);})))info.push(renewTxt(t));
  if(extra)info.unshift(extra);if(info.length||!tab)s.appendChild(el('small','',info.join(' · ')||'vain oma nimi'));r.appendChild(s);
  r.addEventListener('click',function(){termCur=t;termArm=0;renderTerms();});return r;}
function termsList(b,inPanel){var SC=inPanel?main:$('tsheet');termCache=null;
    var a=el('div','addrow'),i=el('input');i.type='text';i.id='newterm';i.placeholder='Uusi asiasana';i.autocomplete='off';a.appendChild(i);
    function add(){var n=clean(i.value);if(!n)return;
      /* #Nimi tekee listan ryhmän (1.44.1) ja avaa sen jäsenten valinnan */
      if(n.charAt(0)==='#'&&!OLDUI)n=clean(n.slice(1));
      if(n.charAt(0)==='#'){var gn=clean(n.slice(1)).slice(0,80);if(!gn)return;var g=(data.grp||[]).filter(function(x){return keyOf(x.name)===keyOf(gn);})[0];
        if(!g){g={id:uid('g'),name:gn,m:[]};data.grp=(data.grp||[]).concat([g]);touch();}termCur={grp:g};renderTerms();return;}
      var sn=starName(n);if(!sn.name)return;var t={id:uid('t'),name:sn.name.slice(0,60),yes:[],no:[]};data.terms.push(t);if(sn.imp)syncImp(t.id,true);touch();termCur=t;renderTerms();}
    button(a,'Lisää','btn solid',add);i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();add();}});b.appendChild(a);
    /* 1.72: puhelimella osiossa Asiat tekstinä ja Poista ovat Valikossa, osiossa näkyy vain Ehdot (ja poistotilassa Peruuta). Tietokoneella napit osiossa. */
    var tr=el('div','btnrow'),dk=!inPanel||wide();if(OLDUI)button(tr,'Vaihepankki','btn',function(){openPhaseBank(false);}).id='tt-phases';if(dk)button(tr,inPanel?'Asiat tekstinä':'Asiasanat tekstinä','btn',function(){termCur='text';renderTerms();}).id='tt-open';button(tr,'Ehdot'+(inPanel?' ('+(data.ehdot||[]).length+')':''),'btn',function(){if($('tsheet').open)closeSheet($('tsheet'));openEh();}).id='tt-eh';
    if(dk||termDel)button(tr,termDel?'Peruuta poisto':'Poista…','btn'+(termDel?'':' dangerline'),function(){termDel=termDel?null:{};renderTerms();}).id='tdel-mode';if(inPanel){var tin=ib('Flow: asian oma Flow (vapaaehtoinen); Ruuduissa nappi on punainen, kun asia on tarkistettava, ja vihreä, kun Flow on käyty. Kerran: asia tarkistetaan kerran, ja se on tarkistettavana, kunnes se on tehty. Päivä: asia on kalenterin päivän nappi. Muut napit: kuittaus uusiutuu valitun ajan päästä kuittauksesta. Uusi napautus poistaa valinnan. Napit vierivät kaikilla asioilla yhdessä. Kahva siirtää asiaa: ylempi on tärkeämpi. Viikonpäivät, kuun päivät ja muut välit valitaan asiasanan kortilta.');tin.id='tinfo-ib';tr.appendChild(tin);}b.appendChild(tr);
    /* Poistotila (Emil 22.10.2026, 1.44.1): valitse useita omia asiasanoja ja ryhmiä, vahvista Poista valitut -napista (varmistus eri kohtaan) */
    if(termDel){var nsel=Object.keys(termDel).length,dr=el('div','btnrow');var db=button(dr,'Poista valitut ('+nsel+')','btn danger',function(){if(!nsel)return;
        delAsk(db,'Poistetaanko '+nsel+(nsel===1?' valittu?':' valittua?'),'Valitut poistuvat myös listan riveiltä, ryhmistä ja tärkeistä. Puun palikat poistuvat puusta sääntöineen. Muistiinpanojen teksti ei muutu.',function(){
          delTermIds(Object.keys(termDel));termDel=null;touch();renderTerms();});});db.id='tdel-ok';db.disabled=!nsel;b.appendChild(dr);
      var pl=el('div','rows');pl.id='tdel-list';
      var DA=autoTerms(data.projects,data.words,data.terms).filter(function(t){return data.projects.some(function(P){return parseText(P.text).by[t.key];});});
      (data.grp||[]).filter(function(g){return !g.phase;}).map(function(g){return {id:g.id,name:g.name,sub:'listan ryhmä',g:1};}).concat(data.terms.map(function(t){return {id:t.id,name:t.name,sub:'oma asiasana'};}),
        DA.map(function(t){return {id:t.id,name:t.name,sub:KINDN[t.kind]+' · '+t.proj};})).forEach(function(x){
        var on=!!termDel[x.id],r=el('button','row');r.type='button';r.dataset.id=x.id;r.setAttribute('aria-pressed',on?'true':'false');var sp=el('span','t',x.name);if(x.g)sp.insertBefore(el('i','gi'),sp.firstChild);sp.appendChild(el('small','',x.sub));r.appendChild(sp);r.appendChild(el('span','stars',on?'✓':''));
        r.addEventListener('click',function(){var y=SC.scrollTop;if(termDel[x.id])delete termDel[x.id];else termDel[x.id]=1;renderTerms();SC.scrollTop=y;});pl.appendChild(r);});
      b.appendChild(pl);return;}
    /* Listan ryhmät (1.44.1): pikavalintoja, jotka lisäävät jäsenensä listan riville */
    if(OLDUI&&(data.grp||[]).some(function(g){return !g.phase;})){b.appendChild(el('h3','','Ryhmät'));var gl=el('div','rows');gl.id='grplist';
      data.grp.filter(function(g){return !g.phase;}).forEach(function(g){var r=el('button','row tgrp');r.type='button';r.dataset.id=g.id;var sp=el('span','t',g.name);sp.insertBefore(el('i','gi'),sp.firstChild);sp.appendChild(el('small','',g.m.length+(g.m.length===1?' jäsen':' jäsentä')));r.appendChild(sp);
        r.addEventListener('click',function(){termCur={grp:g};renderTerms();});gl.appendChild(r);});b.appendChild(gl);}
    impAll(true);var all=rankTerms(),imp=impList(all);
    /* Tähti suoraan rivillä (1.50, korvaa Valitse tärkeät / OK): napautus merkitsee tai poistaa heti */
    function tstar(t){var on=data.imp.indexOf(t.id)>=0,sb=el('button','sbtn');sb.innerHTML=starSvg(on);sb.type='button';sb.dataset.tstar=t.id;sb.setAttribute('aria-pressed',on?'true':'false');
      sb.setAttribute('aria-label',(on?'Poista tärkeistä: ':'Merkitse tärkeäksi: ')+t.name);sb.addEventListener('pointerdown',function(ev){ev.stopPropagation();});
      sb.addEventListener('click',function(ev){ev.stopPropagation();var y=SC.scrollTop;syncImp(t.id,!on);touch();renderTerms();SC.scrollTop=y;});return sb;}
    function tTime(t){var r=el('div','row');r.dataset.id=t.id;var sp=el('span','t',t.name);sp.appendChild(el('small','','aikasana'));r.appendChild(sp);return r;}
    {var il=el('div','rows');il.id='implist';
      imp.forEach(function(t,k){var row=el('div','drow');row.dataset.id=t.id;if(!inPanel)row.appendChild(el('span','num',(k+1)+'.'));row.appendChild(t.time?tTime(t):termRow(t,'',inPanel));if(inPanel)tabRow(row,t,true);il.appendChild(row);});
      function impDrop(i,j){var ids=imp.map(function(t){return t.id;});data.imp=moveToIdx(ids,ids[i],j);touch();var y=SC.scrollTop;renderTerms();SC.scrollTop=y;}
      /* 1.109: ei otsikkoriviä; valinnat lukevat napeissa */
      if(imp.length){b.appendChild(il);dragList(il,impDrop);if(inPanel){il.classList.add('tcards','hscroll');gripDrag(il,impDrop);tcardFit(il);}}
      else b.appendChild(subI('Ei vielä asioita.',inPanel?'Kirjoita uusi asia yläreunan kenttään tai pidä sormea tässä.':'Kirjoita uusi asia yläreunan kenttään.','sub impnone'));
      var rk=impRanks(data.imp,all,data.projects);
      var l=el('div','rows');l.id='termlist';
      all.forEach(function(t){if(imp.indexOf(t)>=0||t.time)return;var ex=rk[t.id]!==undefined&&imp[rk[t.id]]?'perii '+(rk[t.id]+1)+'. '+imp[rk[t.id]].name:'';var w=el('div','drow');w.appendChild(termRow(t,ex,inPanel));if(inPanel)tabRow(w,t,false);l.appendChild(w);});
      b.appendChild(l);if(inPanel){l.classList.add('tscroll','hscroll');l.setAttribute('role','region');l.setAttribute('aria-label','Muut ja uusiutuminen');tabSync(b);b._imp=imp;if(!b._hold){b._hold=1;termHold(b,SC);}if(!l.children.length)l.hidden=true;b.appendChild(tr);}}
    /* 1.103 (Emil 15.11.2026, Mätsik Forestin taulukko): Asiat-osiossa tärkeysjärjestys ja kuittauksen uusiutuminen samassa taulukossa.
       Nimi pysyy paikallaan, välit (1 pv … 12 kk) ovat sarakkeina ja vierivät sivuttain yhdessä otsikkorivin kanssa. Yksi valinta per rivi,
       uusi napautus poistaa. Tärkeät-rivit raahataan kahvasta (myös pito toimii kuten ennen). Taulukosta ei voi poistaa asiasanaa. */
    /* 1.109 (Emil 19.11.2026, Mätsikin tapaan): asia otsikkona, sen alla valinnat nappeina, joissa valinnan nimi. Valintarivit vierivät yhdessä. */
    function tabRow(row,t,grip){var fx=el('div','tfix');while(row.firstChild)fx.appendChild(row.firstChild);
      if(grip){var g=el('button','tgrip');g.type='button';g.setAttribute('aria-label','Siirrä: '+t.name);fx.insertBefore(g,fx.firstChild);}
      row.classList.add('trow','tcard');row.appendChild(fx);var c=tcells(t);c.classList.add('tstrip');row.appendChild(c);}
    function tcells(t){var c=el('div','tcells');if(t.time){c.classList.add('none');return c;}var v=termEvOf(t);
      /* 1.109: Flow-valinta (asian Flow); nimi napissa */
      var fid=flData().m[t.id],ft=fid&&stById(fid),fb=button(c,ft?'Flow: '+ft.name:'Flow','evc flc',function(ev){ev.stopPropagation();flPick(t.id,t.name);});fb.dataset.fl=t.id;fb.setAttribute('aria-pressed',ft?'true':'false');fb.addEventListener('pointerdown',function(ev){ev.stopPropagation();});c.appendChild(el('span','tsep'));
      /* 1.104 (Emil 15.11.2026, Mätsik 1.14): Pika-sarake ensimmäisenä. Ruksi tekee asiasta pikamuistiinpanon napin (napit taulukon järjestyksessä). */
      /* 1.105 (Emil 18.11.2026): Kerran = ei uusiudu; asia on tarkistettavana, kunnes se on kuitattu kerran */
      var oo=termOnce(t.id),ob=button(c,'Kerran','evc',function(ev){ev.stopPropagation();var y=SC.scrollTop;termOnceSet(t,!oo);renderTerms();SC.scrollTop=y;});ob.dataset.ev='once';
      ob.setAttribute('aria-pressed',oo?'true':'false');ob.setAttribute('aria-label',t.name+': tarkistetaan kerran');ob.addEventListener('pointerdown',function(ev){ev.stopPropagation();});
      /* 1.106 (Emil 18.11.2026): Päivä = asia on kalenterin päivän nappi */
      var vo=pvOn(t.id),vb=button(c,'Päivä','evc pvc',function(ev){ev.stopPropagation();var y=SC.scrollTop;pvSet(pvData(),t.id,!vo,todayIso());touch();renderTerms();SC.scrollTop=y;});vb.dataset.pv=t.id;
      vb.setAttribute('aria-pressed',vo?'true':'false');vb.setAttribute('aria-label',t.name+': päivän nappi kalenterissa');vb.addEventListener('pointerdown',function(ev){ev.stopPropagation();});
      EVC.forEach(function(o){var bb=button(c,o[1],'evc',function(ev){ev.stopPropagation();var y=SC.scrollTop;termEvSet(t,v===o[0]?0:o[0]);renderTerms();SC.scrollTop=y;});
        bb.dataset.ev=String(o[0]);bb.setAttribute('aria-pressed',v===o[0]?'true':'false');bb.setAttribute('aria-label',t.name+': uusiutuu '+o[1]+' kuittauksesta');
        bb.addEventListener('pointerdown',function(ev){ev.stopPropagation();});});return c;}
    function tabHead(){var w=el('div','thead');w.id='thead';var r=el('div','trow thr tscroll hscroll'),fx=el('div','tfix');fx.appendChild(el('span','thl','Asia'));
      fx.appendChild(ib('Kerran: asia tarkistetaan kerran, ja se on tarkistettavana, kunnes se on tehty. Päivä: asia on kalenterin päivän nappi (palkki kertoo, kuinka todennäköisesti valitset sen). Muut sarakkeet: kuittaus uusiutuu valitun ajan päästä kuittauksesta. Uusi napautus poistaa valinnan. Kahva siirtää riviä: ylempi on tärkeämpi. Viikonpäivät, kuun päivät ja muut välit valitaan asiasanan kortilta.'));
      r.appendChild(fx);var c=el('div','tcells');c.appendChild(el('span','evh','Kerran'));c.appendChild(el('span','evh','Päivä'));EVC.forEach(function(o){c.appendChild(el('span','evh',o[1]));});r.appendChild(c);w.appendChild(r);return w;}
    if(!inPanel){var r2=el('div','btnrow');button(r2,'Valmis','btn',function(){closeSheet($('tsheet'));render();}).dataset.done='1';b.appendChild(r2);}return;}
/* 1.103: uusiutumisvälit taulukon sarakkeina; muut arvot (esim. 30 pv) näkyvät rivin pienessä tekstissä */
/* 1.110 (Emil 19.11.2026): yksi yhteinen vierivä taulukko (kuten Mätsik): koko lista vierii sivuttain kerralla, asian nimi on liimattu vasempaan reunaan. Ei rivikohtaista synkkausta, joten napit eivät nyi. */
function tcardFit(il){il.style.setProperty('--tcw',il.clientWidth+'px');il.scrollLeft=tabX;il.addEventListener('scroll',function(){tabX=il.scrollLeft;},{passive:true});}
addEventListener('resize',function(){var il=document.querySelector('#implist.tcards');if(il)il.style.setProperty('--tcw',il.clientWidth+'px');});
var EVC=[[1,'1 pv'],[7,'1 vk'],[14,'2 vk'],[21,'3 vk'],[28,'4 vk'],[60,'2 kk'],[90,'3 kk'],[180,'6 kk'],[365,'12 kk']],tabX=0;
/* 1.104: pikanapit (data.pk = asiasanojen id:t); järjestys tulee taulukosta (pikaTerms) */
function pikaOn(id){return (data.pk||[]).indexOf(id)>=0;}
function pikaSet(id,on){var L=(data.pk||[]).filter(function(x){return x!==id;});if(on)L.push(id);data.pk=L;touch();}
/* 1.108 (Emil 18.11.2026): Pika-sarake poistettu; napit ovat listan tarkistuskohteet (valitulla rivillä ilman sen pois ruksittuja) taulukon järjestyksessä */
function pikaLid(){var L=curList();return jatL(L)&&L?L.id:null;}
function pikaTerms(){var C=condCfg(pikaLid()),tk=C&&Array.isArray(C.tk)?C.tk:[];
  var all=rankTerms().filter(function(t){return !t.time;}),imp=impList(all);return imp.concat(all.filter(function(t){return imp.indexOf(t)<0;})).filter(function(t){return tk.indexOf(t.id)>=0;});}
/* Rivin pois ruksimat näkyvät himmeinä paikallaan (napit eivät liiku rivin valinnasta) */
function pikaOff(tid){var r=pkRow?data.chk.filter(function(x){return x.id===pkRow;})[0]:null;return !!(r&&r.ei&&r.ei.indexOf(tid)>=0);}
function termEvOf(t){if(t.time)return 0;if(t.auto){var w=data.words[t.key];return evDays(w&&w.ev);}return evDays(realTerm(t).ev);}
function termOnceSet(t,on){if(t.auto){var w=data.words[t.key]||(data.words[t.key]={yes:[],no:[]});if(on){w.once=1;delete w.ev;delete w.wd;delete w.md;}else delete w.once;}
  else{var r=realTerm(t);if(on){r.once=1;delete r.ev;delete r.wd;delete r.md;}else delete r.once;}termCache=null;touch();}
function termEvSet(t,v){if(v){if(t.auto){if(data.words[t.key])delete data.words[t.key].once;}else delete realTerm(t).once;}if(t.auto){var w=data.words[t.key]||(data.words[t.key]={yes:[],no:[]});if(v)w.ev=v;else{delete w.ev;if(!(w.yes||[]).length&&!(w.no||[]).length&&Object.keys(w).length<=2)delete data.words[t.key];}}
  else{var r=realTerm(t);if(v)r.ev=v;else delete r.ev;}termCache=null;touch();}
/* Taulukon osat vierivät sivuttain yhdessä; sijainti säilyy uudelleenpiirrossa */
function tabSync(b){var L=Array.prototype.slice.call(b.querySelectorAll('.tscroll')),lock=false;
  L.forEach(function(x){x.scrollLeft=tabX;x.addEventListener('scroll',function(){if(lock)return;lock=true;tabX=x.scrollLeft;L.forEach(function(y){if(y!==x)y.scrollLeft=tabX;});lock=false;},{passive:true});});}
/* Kahvasta raahaus alkaa heti (ei pitoa), kuten Mätsikissä. Muut rivit väistävät; pudotus listan ulkopuolelle palauttaa. */
function gripDrag(l,onDrop){var rows=Array.prototype.slice.call(l.children);
  rows.forEach(function(row,i){var g=row.querySelector('.tgrip');if(!g)return;var st=null;
    function shift(j){rows.forEach(function(r,k){if(k===i)return;var h=st.rects[i].height+(st.gap||0);r.style.transform=(j!==null&&k>i&&k<=j)?'translateY(-'+h+'px)':(j!==null&&k<i&&k>=j)?'translateY('+h+'px)':'';});}
    function end(cancel){if(!st)return;var s0=st;st=null;row.classList.remove('lift');rows.forEach(function(r){r.style.transform='';});if(!cancel&&s0.j!==null&&s0.j!==i)onDrop(i,s0.j);}
    g.addEventListener('pointerdown',function(ev){if(ev.button>0)return;ev.preventDefault();ev.stopPropagation();st={y0:ev.clientY,j:i,rects:rows.map(function(r){return r.getBoundingClientRect();})};
      st.gap=rows.length>1?Math.max(0,st.rects[1].top-st.rects[0].bottom):0;row.classList.add('lift');try{g.setPointerCapture(ev.pointerId);}catch(e){}});
    g.addEventListener('pointermove',function(ev){if(!st)return;ev.preventDefault();var y=ev.clientY;row.style.transform='translateY('+(y-st.y0)+'px)';var a=st.rects[0].top,z=st.rects[rows.length-1].bottom;
      if(y<a-40||y>z+40)st.j=null;else{var j=0;st.rects.forEach(function(r,k){if(k!==i&&y>r.top+r.height/2)j++;});st.j=j;}shift(st.j);
      var mr=main.getBoundingClientRect();if(y<mr.top+60)main.scrollTop-=8;else if(y>mr.bottom-60)main.scrollTop+=8;});
    g.addEventListener('pointerup',function(){end(false);});g.addEventListener('pointercancel',function(){end(true);});g.addEventListener('lostpointercapture',function(){end(true);});
    g.addEventListener('click',function(ev){ev.stopPropagation();});});}
/* 1.103 (Emil 15.11.2026, Mätsik 1.13): pieni i-nappi siinä kohdassa, missä ohjetta tarvitaan. Napautus avaa ohjeen pieneen ikkunaan
   napin viereen, ulkopuolinen napautus sulkee eikä tee muuta. */
function subI(t,h,cls){var p=el('p',cls||'sub',t);p.appendChild(ib(h));return p;}
/* i viimeisimmän otsikon perään; ilman otsikkoa pieni rivi, jossa on vain i */
function iTo(par,h){var hs=par.querySelectorAll(':scope>h2,:scope>h3,:scope>.hrow>h2'),x=hs[hs.length-1];if(x){x.appendChild(ib(h));return;}par.appendChild(subI('',h));}
function ib(txt){var b=el('button','ib','i');b.type='button';b.setAttribute('aria-label','Ohje');b.addEventListener('pointerdown',function(ev){ev.stopPropagation();});
  b.addEventListener('click',function(ev){ev.stopPropagation();ev.preventDefault();var m=$('infop');m.textContent='';m.appendChild(el('p','',txt));anchoredMenu('infop',b);});return b;}
/* 1.75 (Emil 24.10.2026): uusi asiasana pidolla, kuten kalenterissa. Pito (0,25 s) muualla kuin Tärkeät-rivin päällä tuo vihreän
   viivan lähimpään väliin; viivaa vedetään ylös ja alas (vieritys lukossa), reilu veto sivulle peruu. Nosto avaa kentän viivan kohtaan.
   Tärkeät-alueella uusi saa tähden ja sen sijan, Muut-alueella se tulee ilman tähteä. Tärkeät-rivin pito siirtää riviä kuten ennen. */
function termHold(b,SC){var st=null,fired=false,kill=false;
  function slots(){var o=[],il=$('implist'),tl=$('termlist'),rs=il?Array.prototype.slice.call(il.children):[];
    rs.forEach(function(r,k){var q=r.getBoundingClientRect();o.push({k:k,y:q.top-4,x:q,lb:'Uusi tähän'});});
    if(rs.length){var q=rs[rs.length-1].getBoundingClientRect();o.push({k:rs.length,y:q.bottom+4,x:q,lb:'Uusi tähän'});}
    else{var e=b.querySelector('.impnone');if(e){var q2=e.getBoundingClientRect();o.push({k:0,y:q2.top+q2.height/2,x:q2,lb:'Uusi tähän'});}}
    if(tl&&!tl.hidden){var q3=tl.getBoundingClientRect();o.push({k:-1,y:q3.top-4,x:q3,lb:'Muut'});}return o;}
  function near(y){var best=null;st.sl.forEach(function(s){if(!best||Math.abs(s.y-y)<Math.abs(best.y-y))best=s;});return best;}
  function line(){var s=st.s;st.l.style.top=Math.round(s.y-1)+'px';st.l.style.left=Math.round(s.x.left)+'px';st.l.style.width=Math.round(s.x.width)+'px';st.l.firstChild.textContent=s.lb;}
  function done(cancel){if(!st)return;var s0=st;st=null;clearTimeout(s0.timer);if(s0.l)s0.l.remove();if(s0.on||s0.dead)kill=true;if(cancel||s0.dead||!s0.on)return;ask(s0.s);}
  function ask(s){var w=el('div','tnew'),i=el('input');i.type='text';i.placeholder='Uusi asiasana';i.autocomplete='off';i.setAttribute('enterkeyhint','done');i.id='tnew-in';w.appendChild(i);
    var il=$('implist'),tl=$('termlist');if(s.k>=0&&il){if(il.children[s.k])il.insertBefore(w,il.children[s.k]);else il.appendChild(w);}
    else if(s.k>=0)b.insertBefore(w,b.querySelector('.impnone'));else tl.parentNode.insertBefore(w,tl);
    var ok=false;function go(){if(ok)return;ok=true;var n=clean(i.value).replace(/\*+$/,'').trim().slice(0,60),y=SC.scrollTop;
      if(n&&allTerms().some(function(t){return keyOf(t.name)===keyOf(n);}))toast('Asiasana on jo: '+n);else if(n){var t={id:uid('t'),name:n,yes:[],no:[]};data.terms.push(t);
        if(s.k>=0){var ids=(b._imp||[]).map(function(x){return x.id;}).concat([t.id]);data.imp=moveToIdx(ids,t.id,s.k).concat(data.imp.filter(function(x){return ids.indexOf(x)<0;}));}touch();}
      render();SC.scrollTop=y;}
    i.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();go();}else if(ev.key==='Escape'){i.value='';go();}});i.addEventListener('blur',go);
    kbKeep(i);i.focus({preventScroll:true});}
  b.addEventListener('pointerdown',function(ev){fired=false;if(ev.button>0||ev.pointerType==='mouse'||termDel)return;var t=ev.target;
    if(t.closest('input,textarea,.sbtn,.addrow,.btnrow,#grplist,.tnew,#tdel-list,.delbox,.tgrip,.evc,.thead,.ib'))return;
    var dr=t.closest('#implist .drow');if(dr&&t.closest('.row'))return;if(dr)ev.stopPropagation();
    fired=false;var pid=ev.pointerId,s1={y0:ev.clientY,x0:ev.clientX,on:false,dead:false};st=s1;
    st.timer=setTimeout(function(){if(st!==s1)return;st.on=fired=true;st.sl=slots();if(!st.sl.length){st=null;return;}st.s=near(st.y0);st.l=el('div','tline');st.l.appendChild(el('b'));document.body.appendChild(st.l);line();
      try{b.setPointerCapture(pid);}catch(e){}},HOLD);},true);
  b.addEventListener('pointermove',function(ev){if(!st)return;
    if(st.dead)return;
    if(st.on){ev.preventDefault();var dx=Math.abs(ev.clientX-st.x0);if(dx>HOLDX){st.l.remove();st.l=null;st.on=false;st.dead=true;return;}st.l.classList.toggle('fade',dx>HOLDX/2);st.s=near(ev.clientY);line();}
    else if(Math.abs(ev.clientY-st.y0)>8||Math.abs(ev.clientX-st.x0)>8){clearTimeout(st.timer);st=null;}});
  b.addEventListener('touchmove',function(ev){if(st&&(st.on||st.dead))ev.preventDefault();},{passive:false});
  b.addEventListener('pointerup',function(){done(false);});b.addEventListener('pointercancel',function(){done(true);});
  /* pidon jälkeen selain ei saa tehdä nostosta napautusta (se veisi fokuksen uudesta kentästä) */
  b.addEventListener('touchend',function(ev){if(kill){kill=false;ev.preventDefault();}},{passive:false});b.addEventListener('touchstart',function(){kill=false;},{passive:true});
  b.addEventListener('contextmenu',function(ev){if(st)ev.preventDefault();});
  b.addEventListener('click',function(ev){if(fired){fired=false;ev.stopPropagation();ev.preventDefault();}},true);}
/* 1.72 (Emil 24.10.2026): Asiat on oma pääosionsa. Luettelo piirretään osioon; asiasanan kortti, ryhmä ja Asiat tekstinä aukeavat ikkunaan.
   Kun ikkunan Valmis palauttaa luetteloon (termCur=null), ikkuna sulkeutuu ja osio piirretään uudelleen. */
function renderAsiat(){var p=panels.terms;p.textContent='';termsList(p,true);}
function renderTerms(){var b=$('ts-body');
  if(!termCur&&tab==='terms'&&!termSolo){if($('tsheet').open)closeSheet($('tsheet'));render();return;}
  b.textContent='';termCache=null;$('ts-help').dataset.help='asiasanat';
  if(!termCur){$('ts-h').textContent='Asiasanat';termsList(b,false);return;}
  if(!$('tsheet').open)openSheet($('tsheet'));
  if(termCur==='text'){renderTermsText(b);return;}
  if(termCur.grp){renderGroupEd(b,termCur.grp);return;}
  var t=termCur;$('ts-h').textContent=t.auto?t.name:'Asiasana';
  var n=null;
  if(t.auto)b.appendChild(subI(KINDN[t.kind].charAt(0).toUpperCase()+KINDN[t.kind].slice(1)+' puussa '+t.proj+'.','Nimeä muutetaan puun tekstissä.'));
  else{b.appendChild(el('label','fl','Nimi (tyhjä poistaa asiasanan)'));n=el('input');n.type='text';n.id='tname-in';n.value=t.name;b.appendChild(n);}
  /* Lisätieto ja uusiutuminen (Emil 22.10.2026, 1.43): kuvaus aukeaa listassa ⓘ-napista, uusiutumisaika pätee asiasanaan kaikilla riveillä */
  /* 1.61 (Emil 23.10.2026): kortti avautuviin osioihin Tunnistus, Lista ja Muut; suljetun osion otsikossa yhteenveto. Avoimet osiot muistuvat. */
  function tsec(id,title){var d=el('details','tsec');d.id='tsec-'+id;if(termSec[id])d.open=true;var sm=el('summary');sm.appendChild(el('b','',title));var sv=el('span','tsv');sm.appendChild(sv);d.appendChild(sm);
    d.addEventListener('toggle',function(){if(d.open)termSec[id]=1;else delete termSec[id];});b.appendChild(d);return {d:d,sv:sv};}
  var S1=tsec('tun','Tunnistus'),S2=tsec('lista','Listassa'),S3=tsec('muut','Muut'),d1=S1.d,d2=S2.d,d3=S3.d;
  /* 1.79 (Emil 24.10.2026): sanakentät pois kortilta. Tunnistus-osio kertoo, mistä asia tulee ja mitä se tuo; rivin napautus avaa Ehdot-ikkunan */
  var tib=el('div','tinfo');tib.id='t-info';d1.appendChild(tib);tInfoRef={box:tib,t:t,sv:S1.sv};tInfo();
  var kfl=el('label','fl','Kuittaustapa');kfl.appendChild(ib('Työnkulku avautuu kuittauksen sijaan. Vasta valmis suoritus kuittaa listan kyseisen kohdan. Muistiinpanosta avaaminen on vapaaehtoista. Pohjaksi valitaan Listoihin rakennettu työnkulku.'));d2.appendChild(kfl);var flowSel=el('select');flowSel.id='tflow';var plain=el('option','','Suora kuittaus');plain.value='';flowSel.appendChild(plain);(data.lists||[]).filter(function(L){return L.wf&&!L.run;}).forEach(function(L){var op=el('option','',L.name);op.value=L.id;flowSel.appendChild(op);});if(t.wflow&&!Array.prototype.some.call(flowSel.options,function(o){return o.value===t.wflow;})){var missing=el('option','','Poistunut työnkulku — valitse uusi');missing.value=t.wflow;flowSel.appendChild(missing);}flowSel.value=t.wflow||'';d2.appendChild(flowSel);
  var ufl=el('label','fl','Kuittaus uusiutuu');ufl.appendChild(ib('Kuittaus raukeaa valitun ajan päästä tai valitun viikon- tai kuun päivän alkaessa. Jos kuussa ei ole valittua päivää, se on kuun viimeinen. Kun molemmat on valittu, aiempi ratkaisee. Yleisimmät välit voi valita myös Asiat-osion taulukosta.'));d2.appendChild(ufl);var evs=el('select');evs.id='tev';var evv=t.ev||0,evh=false;
  EVS.forEach(function(o){var op=el('option','',o[0]?o[1]+' kuittauksesta':'ei uusiudu');op.value=String(o[0]);if(o[0]===evv)evh=true;evs.appendChild(op);});
  if(!evh){var op0=el('option','',evv+' pv kuittauksesta');op0.value=String(evv);evs.appendChild(op0);}evs.value=String(evv);d2.appendChild(evs);
  /* 1.87 (Emil 25.10.2026): aikavälin lisäksi tai sijaan tiettyinä viikonpäivinä ja kuun päivinä; aiempi ratkaisee */
  var wdv=evWd(t.wd),mdv=evMd(t.md);
  function dpick(id,label,vals,arr,txt){d2.appendChild(el('label','fl',label));var g=el('div','dpick');g.id=id;
    vals.forEach(function(n){var bb=button(g,txt(n),'',function(){var i=arr.indexOf(n);if(i<0)arr.push(n);else arr.splice(i,1);bb.setAttribute('aria-pressed',i<0?'true':'false');tsum();});
      bb.className='';bb.dataset.v=String(n);bb.setAttribute('aria-pressed',arr.indexOf(n)>=0?'true':'false');});d2.appendChild(g);}
  dpick('twd','Uusiutuu myös viikonpäivinä',[1,2,3,4,5,6,0],wdv,function(n){return WDS[n];});
  var md31=[];for(var q=1;q<=31;q++)md31.push(q);dpick('tmd','Uusiutuu myös kuun päivinä',md31,mdv,String);
  /* Hoitamisen kesto aikaehdotuksiin (Emil 23.10.2026, 1.49); oletus on kalenterin oletuspituus */
  d2.appendChild(el('label','fl','Kesto aikaehdotuksiin'));var dus=el('select');dus.id='tdur';var duv=durOf(t,0),duh=false;
  [0,5,10,15,20,30,45,60,90,120,180,240].forEach(function(m){var op=el('option','',m?(m<60?m+' min':(m/60)+' h'):'ei aikaehdotuksia');op.value=String(m);if(m===duv)duh=true;dus.appendChild(op);});
  if(!duh){var op1=el('option','',duv+' min');op1.value=String(duv);dus.appendChild(op1);}dus.value=String(duv);d2.appendChild(dus);
  var r=el('div','btnrow');
  var pop=!!t.pop,ps=el('div','seg');ps.id='tpop';
  [[false,'Ei nouse esiin'],[true,'Nousee esiin muistiinpanosta']].forEach(function(m){var bb=button(ps,m[1],'',function(){pop=m[0];Array.prototype.forEach.call(ps.children,function(c){c.setAttribute('aria-pressed',c===bb?'true':'false');});});bb.className='';bb.dataset.pop=m[0]?'1':'0';bb.setAttribute('aria-pressed',pop===m[0]?'true':'false');});
  d3.appendChild(el('label','fl','Kun muistiinpano osuu tähän asiasanaan'));d3.appendChild(ps);
  d3.appendChild(el('label','fl','Lisätieto'));var inf=el('textarea');inf.id='tinfo';inf.value=t.info||'';inf.style.minHeight='64px';d3.appendChild(inf);
  var cal=!!t.cal,cs=el('div','seg');cs.id='tcal';cs.style.marginTop='8px';
  [[false,'Ei kalenterissa'],[true,'Näytä kalenterissa']].forEach(function(m){var bb=button(cs,m[1],'',function(){cal=m[0];Array.prototype.forEach.call(cs.children,function(c){c.setAttribute('aria-pressed',c===bb?'true':'false');});});bb.className='';bb.dataset.cal=m[0]?'1':'0';bb.setAttribute('aria-pressed',cal===m[0]?'true':'false');});
  d3.appendChild(cs);
  function tsum(){
    var e=+evs.value,u=+dus.value;S2.sv.textContent=[flowSel.value?'työnkulku':'',renewTxt({ev:e,wd:wdv,md:mdv}),u?'kesto '+dus.options[dus.selectedIndex].text:''].filter(Boolean).join(' · ');
    S3.sv.textContent=[pop?'nousee esiin':'',clean(inf.value)?'lisätieto':'',cal?'kalenterissa':''].filter(Boolean).join(' · ');}
  [inf].forEach(function(e){e.addEventListener('input',tsum);});[evs,dus,flowSel].forEach(function(e){e.addEventListener('change',tsum);});[ps,cs].forEach(function(e){e.addEventListener('click',function(){setTimeout(tsum,0);});});tsum();
  var tb=button(r,'Valmis','btn solid',function(){var W0=wordsOf(t),ys=W0.yes,xs=W0.no;
    var EX={wflow:flowSel.value,ev:+evs.value,wd:wdv,md:mdv,info:inf.value,dur:+dus.value};
    if(t.auto){var dflt=t.kind==='q';if(ys.length||xs.length||pop!==dflt||cal||EX.wflow||hasRenew(EX)||durOf(EX,0)||clean(EX.info)){data.words[t.key]={yes:ys,no:xs};if(pop!==dflt)data.words[t.key].pop=pop;if(cal)data.words[t.key].cal=true;termExtra(data.words[t.key],EX);}else delete data.words[t.key];}
    else{t=realTerm(t);var nn=clean(n.value);if(nn){t.name=nn.slice(0,60);t.yes=ys;t.no=xs;if(pop)t.pop=true;else delete t.pop;if(cal)t.cal=true;else delete t.cal;delete t.ev;delete t.wd;delete t.md;delete t.info;delete t.dur;delete t.wflow;termExtra(t,EX);}else data.terms=data.terms.filter(function(q){return q!==t;});}
    touch();if(termSolo){termDone();return;}termCur=null;renderTerms();});tb.id='tok';tb.dataset.done='1';
  /* Poisto kortista (1.56): sama varmistus kuin Poista…-tilassa */
  var dr=el('div','delrow'),db=button(dr,'Poista','mini dangerline',function(){
    delAsk(db,'Poistetaanko '+t.name+'?',t.auto?'Palikka poistuu puusta sääntöineen sekä listan riveiltä, ryhmistä ja tärkeistä. Muistiinpanojen teksti ei muutu.':'Asiasana poistuu myös listan riveiltä, ryhmistä ja tärkeistä. Muistiinpanojen teksti ei muutu.',function(){
      delTermIds([t.id]);touch();if(termSolo){termDone();return;}termCur=null;renderTerms();});});db.id='tdel1';
  b.appendChild(r);b.appendChild(dr);}

/* 1.79: asiasanan tunnistussanat ehtoina. Oma asiasana: t.yes/t.no; puun palikka: data.words[key]. */
var tInfoRef=null;
function realTerm(t){return t.auto?t:data.terms.filter(function(x){return x.id===t.id;})[0]||t;}
function wordsOf(t){if(t.auto){var w=data.words[t.key]||{};return {yes:strs(w.yes),no:strs(w.no)};}var r=realTerm(t);return {yes:strs(r.yes),no:strs(r.no)};}
function setWords(t,yes,no){if(t.auto){var w=data.words[t.key]||(data.words[t.key]={yes:[],no:[]});w.yes=yes;w.no=no;}else{var r=realTerm(t);r.yes=yes;r.no=no;if(r!==t){t.yes=yes;t.no=no;}}termCache=null;touch();}
function tInfo(){var R=tInfoRef;if(!R||!R.box.isConnected)return;var box=R.box,t=R.t,tid=t.id,W=wordsOf(t),n=0;box.textContent='';
  var q=function(a){return a.map(function(w){return '“'+w+'”';}).join(', ');};
  function line(lab,val,id,fn){var b=button(box,'','tiline',fn);b.appendChild(el('span','til',lab));b.appendChild(el('span','tiv',val));if(id)b.id=id;n++;return b;}
  var tb0=blockTerms(data.projects)[keyOf(t.name)];if(tb0&&(tb0.yes.length||tb0.no.length))box.appendChild(el('p','sub','Puun tekstistä (muokataan tekstikentän =-lohkossa): '+tb0.yes.join(', ')+(tb0.no.length?' · poissulkevat: '+tb0.no.join(', '):'')));
  line('Tulee, kun tekstissä on',W.yes.length?'nimi tai '+q(W.yes):'nimi','ti-yes',function(){openEhAt('w:'+tid);});
  if(W.no.length)line('Ei, kun tekstissä on',q(W.no),'ti-no',function(){openEhAt('w:'+tid);});
  EHC.ehdot.forEach(function(e){var go=function(){openEhAt(e.id);};if(e.ty==='x'){if(e.k.indexOf(tid)>=0&&e.k.length>1)line('Pois, kun kuitattu',e.k.filter(function(x){return x!==tid;}).map(ehNm).join(' tai '),null,go);return;}
    if(e.on.indexOf(tid)>=0)line('Tulee, kun',ehName(e.k,e.all),null,go);if(e.off.indexOf(tid)>=0)line('Pois, kun',ehName(e.k,e.all),null,go);
    if(e.k.indexOf(tid)>=0&&(e.on.length||e.off.length))line(e.on.length?'Tuo':'Poissulkee',(e.on.length?e.on:e.off).map(ehNm).join(', '),null,go);});
  var a=button(box,'+ Ehto tälle asialle','tlink',function(){var e={id:uid('e'),k:[],on:[tid],off:[]};EHC.ehdot.push(e);touch();openEhAt(e.id,'k');});a.id='t-addeh';a.textContent='+ Mikä aktivoi tämän?';var out=button(box,'+ Mitä tämän kuittaus aktivoi?','tlink',function(){ehP=null;ehTL=null;var e={id:uid('e'),k:[tid],on:[],off:[]};EHC.ehdot.push(e);touch();openEhAt(e.id,'t');});out.id='t-addeh-out';
  if(R.sv)R.sv.textContent=W.yes.length||W.no.length?(W.yes.length?W.yes.length+(W.yes.length===1?' sana':' sanaa'):'')+(W.no.length?(W.yes.length?' · ':'')+W.no.length+' poissulkevaa':''):'';}
/* Ehdot-ikkuna kortin päälle: Valmis ja paluu palaavat korttiin */
var ehSolo=false;
function openEhAt(id,pick){ehCur=id;ehSolo=true;ehPick=pick||'';renderEh();openSheet($('ehsheet'));}
function ehBack(){ehSolo=false;closeSheet($('ehsheet'));if($('tsheet').open)tInfo();else render();}
/* Tunnistus ehtona: Kun tekstissä on (jokin) → Tuo asiasana; Paitsi, kun tekstissä on. Sana tunnistetaan alusta. */
function renderEhW(b,tid){var t=allTerms().filter(function(x){return x.id===tid;})[0];termCache=null;if(!t){ehCur=null;renderEh();return;}$('eh-h').textContent='Tunnistus';
  function part(lab,key,id,ph){var bx=el('div','ehbox act');bx.appendChild(el('div','ehlab',lab));var W=wordsOf(t),w=el('div','ehps');w.id=id;
    W[key].forEach(function(word){var p=button(w,'“'+word+'”','ehp sel',function(){var W2=wordsOf(t);W2[key]=W2[key].filter(function(x){return x!==word;});setWords(t,W2.yes,W2.no);renderEh();});p.dataset.w=word;p.setAttribute('aria-label','Poista '+word);});
    if(!W[key].length)w.appendChild(el('span','ehph',key==='yes'?'Vain nimi':'Ei sanoja'));bx.appendChild(w);
    var nr=el('div','addrow');var ni=el('input');ni.type='text';ni.id=id+'-in';ni.placeholder=ph;ni.setAttribute('aria-label',ph);ni.autocomplete='off';ni.setAttribute('autocapitalize','off');nr.appendChild(ni);
    var add=function(){var v=clean(ni.value.replace(/["“”„«»]/g,'')).toLowerCase();if(!v)return;var W2=wordsOf(t);if(W2[key].indexOf(v)<0)W2[key].push(v);setWords(t,W2.yes,W2.no);renderEh();var f=$(id+'-in');if(f)f.focus();};
    button(nr,'Lisää','btn',add).id=id+'-b';ni.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();add();}});bx.appendChild(nr);b.appendChild(bx);}
  part('Kun tekstissä on jokin näistä (tai nimi)','yes','ehw-y','Uusi sana');
  b.appendChild(el('div','ehvl','Tuo'));var bt=el('div','ehbox eff');var c=el('div','ehchips');c.appendChild(el('span','ehc on',t.name));bt.appendChild(c);b.appendChild(bt);
  part('Paitsi, kun tekstissä on','no','ehw-n','Uusi poissulkeva sana');
  iTo(b,'Sana tunnistetaan alusta: “lääk” löytää myös lääkärin. Tunnistus koskee muistiinpanoja ja listan rivien tekstejä.');
  var br=el('div','btnrow');br.style.marginTop='12px';button(br,'Valmis','mini okbtn',function(){ehLeave();if(ehSolo){ehBack();return;}renderEh();}).id='eh-done';b.appendChild(br);}
/* Ryhmän muokkaus Asiasanoissa (1.44.1): nimi (tyhjä poistaa) ja jäsenet napauttamalla */
function renderGroupEd(b,g){if(g.phase){termCur=null;termSolo=null;closeSheet($('tsheet'));openChk(null,g.id,true);return;}$('ts-h').textContent='Ryhmä';
  b.appendChild(el('label','fl','Nimi (tyhjä poistaa ryhmän)'));var n=el('input');n.type='text';n.id='gname-in';n.value=g.name;b.appendChild(n);
  b.appendChild(el('label','fl','Jäsenet: napauta asiasanoja'));var box=el('div','chips');box.id='gmem';box.style.marginTop='8px';
  SPEC.concat(orderedTerms().filter(function(t){return !t.time&&!(t.auto&&t.kind==='g');})).forEach(function(t){var on=g.m.indexOf(t.id)>=0,c=button(box,t.name,isSpec(t.id)?'chip kmen':'chip',function(){if(g.m.indexOf(t.id)>=0)g.m=g.m.filter(function(x){return x!==t.id;});else g.m=g.m.concat([t.id]);touch();
      c.setAttribute('aria-pressed',g.m.indexOf(t.id)>=0?'true':'false');});c.dataset.tid=t.id;c.setAttribute('aria-pressed',on?'true':'false');});termCache=null;
  b.appendChild(box);
  /* 1.78: ryhmän oma sääntö. Ryhmä toteutuu listassa (johon se on liitetty), kun jäsenistä jokin tai kaikki on kuitattu; laukaisee ehdot */
  b.appendChild(el('label','fl','Toteutuu listassa, kun jäsenistä on kuitattu'));var ga=el('div','seg');ga.id='g-all';
  [[0,'Jokin'],[1,'Kaikki']].forEach(function(m){button(ga,m[1],'',function(){if(m[0])g.all=1;else delete g.all;touch();Array.prototype.forEach.call(ga.children,function(c,i){c.setAttribute('aria-pressed',!!g.all===!!i?'true':'false');});}).setAttribute('aria-pressed',!!g.all===!!m[0]?'true':'false');});
  b.appendChild(ga);var r=el('div','btnrow');
  var ok=button(r,'Valmis','btn solid',function(){var nn=clean(n.value).slice(0,80);if(nn)g.name=nn;else data.grp=data.grp.filter(function(x){return x!==g;});touch();termCur=null;renderTerms();});ok.id='gok';ok.dataset.done='1';b.appendChild(r);}
/* Termit tekstinä: kaikkien termien sanat yhdessä kentässä. Valmis lukee lohkot takaisin. */
function termNames(){var nm={};autoTerms(data.projects,data.words,data.terms).forEach(function(t){nm[t.key]=t.name;});return nm;}
/* 1.70: tekstin luku. Teksti on totuus: sanat, tärkeät (tähti, järjestys) ja ehdot korvautuvat tekstin mukaisiksi.
   Aikasanojen tähdet (eivät ole tekstissä) säilyvät paikoillaan. Ehdossa tuntematon nimi tekee uuden asiasanan. */
function termsTextIn(txt){var AT=allTerms(),names=AT.map(function(t){return t.name;}).filter(Boolean).concat((data.grp||[]).map(function(g){return '#'+g.name;}),TIME_TERMS.concat(WD_TERMS).map(function(t){return t.name;})),X=textExtras(txt,names);termCache=null;
  termsFromText(X.body,data,termNames());termCache=null;
  /* 1.78: syynä "#Ryhmä" (puuttuva tehdään tyhjänä) ja aikasanat nimellä */
  var idOf=function(n){var q=qOf(n);if(q)return q;if(n.charAt(0)==='#'&&clean(n.slice(1))){var gn=clean(n.slice(1)).slice(0,80),g=(data.grp||[]).filter(function(x){return keyOf(x.name)===keyOf(gn);})[0];if(!g){g={id:uid('g'),name:gn,m:[]};data.grp=(data.grp||[]).concat([g]);}return g.id;}
    var z=TIME_TERMS.filter(function(x){return keyOf(x.name)===keyOf(n);})[0];if(z)return z.id;
    var k=keyOf(n),t=allTerms().filter(function(x){return x.name&&keyOf(x.name)===k&&x.kind!=='g';})[0];termCache=null;if(t)return t.id;
    /* 1.91: viikonpäivä aikasanana, ellei samannimistä omaa asiasanaa ole */
    z=WD_TERMS.filter(function(x){return keyOf(x.name)===k;})[0];if(z)return z.id;
    t={id:uid('t'),name:clean(n).slice(0,60),yes:[],no:[]};data.terms.push(t);return t.id;};
  /* 1.107: ei tähtiä – lohkojen järjestys on asioiden järjestys */
  var ni=[];X.order.forEach(function(n){var k=keyOf(n),g=allTerms().filter(function(x){return x.name&&keyOf(x.name)===k;})[0];termCache=null;var id=g?g.id:idOf(n);if(id.slice(0,2)==='z:')return;if(ni.indexOf(id)<0)ni.push(id);});
  var old=data.imp||[];old.forEach(function(id){if(!isSpec(id)&&id.slice(0,2)!=='z:'&&ni.indexOf(id)<0)syncImp(id,false);});ni.forEach(function(id){syncImp(id,true);});
  var sp=[];old.forEach(function(id,i){if(isSpec(id)||id.slice(0,2)==='z:')sp.push([i,id]);});var res=ni.slice();sp.forEach(function(x){res.splice(Math.min(x[0],res.length),0,x[1]);});data.imp=res;
  if(X.ehdot)data.ehdot=((condsIn({ehdot:X.ehdot.map(function(e,i){var o={id:uid('e')+i,k:e.k.map(idOf),on:e.on.map(idOf),off:e.off.map(idOf)};if(e.all)o.all=1;if(e.ty)o.ty=e.ty;return o;})})||{}).ehdot||[]);
  else data.ehdot=[];termCache=null;}
function renderTermsText(b){$('ts-h').textContent='Asiasanat tekstinä';$('ts-help').dataset.help='asiatteksti';
  var w=el('div','hlwrap'),hl=el('div','hl mono'),ta=el('textarea','mono');hl.id='tt-hl';hl.setAttribute('aria-hidden','true');ta.id='tt-text';ta.style.minHeight='46vh';
  ta.setAttribute('aria-label','Asiasanat tekstinä');ta.autocomplete='off';ta.setAttribute('autocapitalize','off');ta.spellcheck=false;
  ta.value=termsToText(data.terms,data.words,termNames(),{plain:1,stars:(data.imp||[]).filter(function(id){return !isSpec(id)&&id.slice(0,2)!=='z:'&&termName(id);}).map(termName),
    ehdot:(data.ehdot||[]).map(function(e){var f=function(a){return a.filter(ehRef).map(ehNm);};return {k:f(e.k),all:e.all,ty:e.ty,on:f(e.on),off:f(e.off)};})});w.appendChild(hl);w.appendChild(ta);b.appendChild(w);
  function paint(){paintCode(ta,hl);}['input','keyup','click','focus'].forEach(function(ev){ta.addEventListener(ev,paint);});ta.addEventListener('scroll',function(){hl.scrollTop=ta.scrollTop;});
  var r=el('div','btnrow');button(r,'Peru','btn',function(){termCur=null;renderTerms();});
  /* 1.92: tekoälyohje leikepöydälle; jos kopiointi ei onnistu, ohje näkyy valittuna kenttänä */
  var ai=button(r,'Ohje tekoälylle','btn',function(){var t=aiOhje({text:ta.value,grp:(data.grp||[]).map(function(g){return g.name;})}),x=$('tt-ai');
    if(!x){x=el('textarea','mono');x.id='tt-ai';x.readOnly=true;x.setAttribute('aria-label','Ohje tekoälylle');x.style.minHeight='30vh';x.hidden=true;b.appendChild(x);}x.value=t;
    copy(t,ai,{focus:function(){x.hidden=false;x.focus();},select:function(){x.select();}});});ai.id='tt-ai-b';
  var ok=button(r,'Valmis','btn solid',function(){termsTextIn(ta.value);touch();termCur=null;renderTerms();});ok.id='tt-ok';ok.dataset.done='1';b.appendChild(r);
  setTimeout(paint,0);}

/* ---- asetukset, vienti ja tuonti ---- */
var pendingImport=null,pendingKuvat=null,trashArm=0;
function setMsg(t,warn){var m=$('datamsg');if(!m)return;m.textContent=t||'';m.className='msg'+(warn?' warn':'');}
/* 1.63 (Emil 23.10.2026): asetukset ovat projektikohtaisia ja ne ovat Projekti-ikkunassa (yläpalkin projektin nimi). Alapalkissa ei Asetuksia. */
function renderSettings(){var p=panels.set;p.textContent='';setInfo(statusText());setUi(p,function(){render();});}
function renderPkSet(){var p=$('pk-set');p.textContent='';setUi(p,function(){render();renderPkSet();},true);}
function setUi(p,again,inSheet){var H=inSheet?'h3':'h2';
  p.appendChild(el(H,'','Ulkoasu'));if(inSheet)p.appendChild(el('p','sub','Koskee vain tätä projektia.'));
  /* 1.86 Värikone (Emil 25.10.2026): tila, muokattava asu ja värisäätimet. Tilakohtaiset kohdat kirjoitetaan muokattavalle asulle. */
  var cf=data.cfg,asu=kAsu(),dk=asu==='dark',kv=kVals(cf,dk);
  function rerun(){save();applyCfg();again();}
  function kLab(key,label){var w=el('div','kl'),l=el('label','fl',label);w.appendChild(l);
    if(dk&&KSPEC.indexOf(key)>=0&&data.cfg['d'+key]!=null){var r=button(w,'Vaalean mukaan','kback',function(){delete data.cfg['d'+key];rerun();});r.dataset.k=key;}p.appendChild(w);}
  function slider(key,id,max,val,fmt,cls){var w=el('div','ksl'),i=document.createElement('input'),o=document.createElement('output');i.type='range';i.id=id;i.min=0;i.max=max;i.step=1;i.value=val;
    if(cls)i.className=cls;i.setAttribute('aria-label',id);o.textContent=fmt(val);
    i.addEventListener('input',function(){kSet(key,String(i.value));o.textContent=fmt(+i.value);koneLive=true;applyCfg();koneLive=false;if(cls)i.style.setProperty('--kh',hexOf(.68,.13,+i.value));});
    i.addEventListener('change',rerun);w.appendChild(i);w.appendChild(o);p.appendChild(w);return i;}
  function pct(v){return v+' %';}
  p.appendChild(el('label','fl','Tila'));var seg=el('div','seg');seg.id='set-mode';
  MODES.forEach(function(m){var b=button(seg,m[1],'',function(){kFix(data.cfg);data.cfg.mode=m[0];kEdit=null;rerun();});b.className='';b.dataset.v=m[0];b.setAttribute('aria-pressed',(kOldDark(cf)?'dark':cf.mode||'auto')===m[0]?'true':'false');});p.appendChild(seg);
  function cfgChips(key,label,opts,dflt){var sp=KSPEC.indexOf(key)>=0;if(sp)kLab(key,label);else p.appendChild(el('label','fl',label));var g=el('div','chips este');g.id='set-'+key;
    var cur=(sp?kRaw(data.cfg,key,dk):data.cfg[key])||dflt;
    opts.forEach(function(m){var b=button(g,m[1],'chip',function(){if(sp)kSet(key,m[0]);else data.cfg[key]=m[0];if(m[2])m[2]();rerun();});b.dataset.v=m[0];b.setAttribute('aria-pressed',cur===m[0]?'true':'false');});p.appendChild(g);}
  /* 0.61: valmis ilme Lehto ja Hiillos. Kun se on valittu, värikoneen säätimet eivät ole käytössä, ja niiden arvot säilyvät paluuta varten. */
  var il=ilmeOn(cf),md=kOldDark(cf)?'dark':cf.mode||'auto';
  p.appendChild(el('label','fl','Ilme'));var ig=el('div','chips este');ig.id='set-ilme';
  [['lh','Lehto ja Hiillos'],['oma','Oma värisäätö']].forEach(function(m){var b=button(ig,m[1],'chip',function(){kFix(data.cfg);if(m[0]==='oma')data.cfg.ilme='oma';else delete data.cfg.ilme;kEdit=null;rerun();});
    b.dataset.v=m[0];b.setAttribute('aria-pressed',(il?'lh':'oma')===m[0]?'true':'false');});p.appendChild(ig);
  if(il){iTo(p,'Lehto on vaalea ja Hiillos tumma asu. Tila valitsee, kumpi on käytössä; Laitteen mukaan vaihtaa niitä laitteen asetuksen mukaan.');
    [['l','lacc','Lehdon aksentti',ILME_L],['d','dacc','Hiilloksen aksentti',ILME_D]].forEach(function(q){if(md===(q[0]==='l'?'dark':'light'))return;
      p.appendChild(el('label','fl',q[2]));var g=el('div','chips este');g.id='set-'+q[1];var cur=ilmeAcc(q[0]==='d',data.cfg)[0];
      q[3].forEach(function(x){var b=button(g,'','chip',function(){data.cfg[q[1]]=x[0];rerun();});b.dataset.v=x[0];var sw=el('span','sw');sw.style.background=x[2];b.appendChild(sw);
        b.appendChild(document.createTextNode(x[1]));b.setAttribute('aria-pressed',cur===x[0]?'true':'false');});p.appendChild(g);});
    [['l','lhf','Lehdon otsikkofontti'],['d','dhf','Hiilloksen otsikkofontti']].forEach(function(q){if(md===(q[0]==='l'?'dark':'light'))return;
      p.appendChild(el('label','fl',q[2]));var g=el('div','chips este hfs');g.id='set-'+q[1];var cur=ilmeFont(q[0]==='d',data.cfg)[0];
      ILME_F.forEach(function(x){var b=button(g,x[1],'chip',function(){data.cfg[q[1]]=x[0];rerun();});b.dataset.v=x[0];if(x[2])b.style.fontFamily=x[2];
        b.setAttribute('aria-pressed',cur===x[0]?'true':'false');});p.appendChild(g);});}
  if(!il){
  if((cf.mode||'auto')==='auto'&&!kOldDark(cf)){p.appendChild(el('label','fl','Muokattava asu'));var es=el('div','seg');es.id='set-asu';
    [['light','Vaalea asu'],['dark','Tumma asu']].forEach(function(m){var b=button(es,m[1],'',function(){kEdit=m[0];applyCfg();again();});b.className='';b.dataset.v=m[0];b.setAttribute('aria-pressed',asu===m[0]?'true':'false');});p.appendChild(es);}
  if(dk)iTo(p,'Tumma asu seuraa vaaleaa. Muuttamasi kohdat ovat tumman omia; Vaalean mukaan palauttaa kohdan.');
  kLab('kh','Pohjaväri');
  var hs=slider('kh','k-h',359,Math.round(kv.h),function(v){return v+'°';},'hue'),stops=[];for(var hh=0;hh<=360;hh+=30)stops.push(hexOf(.68,.13,hh));
  hs.style.background='linear-gradient(90deg,'+stops.join(',')+')';hs.style.setProperty('--kh',hexOf(.68,.13,kv.h));
  var sws=el('div','chips este');sws.id='set-kh';
  POHJAT.forEach(function(q,i){var b=button(sws,'','chip',function(){kSet('kh',String(q[1]));if(q[2]!=null)kSet('ks',String(Math.round(q[2]*100)));else if(kVals(data.cfg,dk).s<.2)kSet('ks','50');rerun();});
    b.dataset.v=String(i);var sw=el('span','sw');sw.style.background=hexOf(.6,q[2]==null?.13:q[2]*.26,q[1]);b.appendChild(sw);b.appendChild(document.createTextNode(q[0]));
    b.setAttribute('aria-pressed',Math.round(kv.h)===q[1]&&(q[2]==null||Math.abs(kv.s-q[2])<.01)?'true':'false');});p.appendChild(sws);
  cfgChips('kc','Luonne',LUONNE,'');
  kLab('ks','Kylläisyys');slider('ks','k-s',100,Math.round(kv.s*100),pct);
  kLab('kk','Kontrasti');slider('kk','k-k',100,Math.round(kv.k*100),pct);
  kLab('kp',dk?'Taustan tummuus':'Taustan vaaleus');slider('kp','k-p',100,Math.round(kv.p*100),pct);
  }
  cfgChips('look','Muotokieli',ESTE_LOOKS.map(function(L){return [L.id,L.n,function(){data.cfg.font=L.bf||'system';}];}),'juuri');
  var AU=['auto','Muotokielen mukaan'];
  cfgChips('bshape','Nappien muoto',[AU,['2','Terävä'],['8','Pehmeä'],['14','Pyöreä'],['999','Pilleri']],'auto');
  cfgChips('bsize','Nappien koko',[AU,['36','Tiivis'],['44','Normaali'],['52','Iso']],'auto');
  cfgChips('bedge','Nappien reuna',[AU,['none','Ei reunaa'],['thin','Ohut'],['thick','Paksu'],['under','Alaviiva']],'auto');
  cfgChips('bfx','Nappien efekti',[AU,['flat','Litteä'],['shadow','Varjo'],['press','Painuma'],['glass','Lasi'],['offset','Siirtymä'],['glow','Hehku'],['sheen','Kiilto']],'auto');
  cfgChips('ck','Kuittaus',[AU,['50%|fill','Ympyrä'],['6px|fill','Pyöristetty'],['2px|fill','Neliö'],['50%|line','Rengas, viiva'],['6px|line','Laatikko, viiva']],'auto');
  /* Kuvitus: valmiit kuvat ja tällä laitteella tallessa olevat omat kuvat (yhteisiä kaikille projekteille) */
  p.appendChild(el('label','fl','Kuvitus'));var ag=el('div','chips arts esvg');ag.id='set-art';
  [['','Ei kuvitusta',''],['kuvio','Pelkkä kuvio','']].concat(ESTE_ARTS).concat(OMAT.map(function(o){return ['oma:'+o.id,o.nimi||'Oma kuva','',o];})).forEach(function(a){
    var b=button(ag,'','chip',function(){data.cfg.art=a[0];rerun();});b.dataset.v=a[0];
    var t=el('span','athumb'+(a[0]==='kuvio'?' dots':''));if(a[2])t.innerHTML=esteSvg(a[2],'at');if(a[3]){var im=document.createElement('img');im.src=a[3].data;im.alt='';t.appendChild(im);}
    b.appendChild(t);b.appendChild(document.createTextNode(a[1]));b.setAttribute('aria-pressed',(data.cfg.art||'')===a[0]?'true':'false');});
  var fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.hidden=true;fi.id='art-file';
  var add=button(ag,'+ Oma kuva','chip',function(){fi.click();});add.id='art-add';p.appendChild(ag);p.appendChild(fi);
  var am=el('p','msg',artMsg);am.id='art-msg';am.hidden=!artMsg;p.appendChild(am);artMsg='';
  fi.addEventListener('change',function(){var f=fi.files&&fi.files[0];if(!f)return;add.disabled=true;add.textContent='Ladataan…';
    omaAdd(f,function(o){if(o)data.cfg.art='oma:'+o.id;else artMsg='Kuvaa ei voitu lukea tai tallentaa.';rerun();});});
  var own=String(data.cfg.art||'').indexOf('oma:')===0?omaOf(data.cfg.art.slice(4)):null,artOn=!!own||ESTE_ARTS.some(function(x){return x[0]===data.cfg.art;});
  if(own){var dr=el('div','btnrow kdel');dr.id='art-del';button(dr,'Poista kuva laitteelta…','btn',function(){dr.textContent='';dr.appendChild(el('span','sub','Kuva poistuu tältä laitteelta kaikista projekteista.'));
      button(dr,'Peru','btn',function(){again();});var x=button(dr,'Poista','btn danger',function(){omaDel(own.id,function(){if(data.cfg.art==='oma:'+own.id)data.cfg.art='';rerun();});});x.id='art-delok';});p.appendChild(dr);}
  if(artOn){cfgChips('artpos','Kuvituksen paikka',[['','Koko tausta'],['top','Yläosa, häivytys']],'');
    cfgChips('blur','Taustakuvan sumennus',[['','Ei'],['1','Hento'],['2','Keskitaso'],['3','Vahva']],'');
    cfgChips('dim','Taustakuvan himmennys',[['0','Ei'],['25','Kevyt'],['','Normaali'],['70','Vahva']],'');}

  /* Tyylin hienosäätö (Emil 22.10.2026) */
  function cfgSeg(key,label,opts,dflt){p.appendChild(el('label','fl',label));var g=el('div','seg');g.id='set-'+key;
    opts.forEach(function(m){var b=button(g,m[1],'',function(){data.cfg[key]=m[0];save();applyCfg();again();});b.className='';b.dataset.v=m[0];b.setAttribute('aria-pressed',(data.cfg[key]||dflt)===m[0]?'true':'false');});p.appendChild(g);}
  cfgSeg('font','Fontti',[['system','Järjestelmä'],['rounded','Pyöreä'],['serif','Antiikva'],['mono','Tasalevyinen']],'system');
  /* Kaikki 0.6 (Emil 22.11.2026): tekstin koko muistiinpanoissa ja kalenterin listassa; Laitteen mukaan = iPhonen Asetukset → Näyttö → Tekstin koko */
  cfgSeg('tz','Tekstin koko',TZOPT,'');
  if(!data.cfg.look||data.cfg.look==='juuri')cfgSeg('edge','Reunat',[['soft','Pehmeät'],['sharp','Kulmikkaat'],['line','Viivat']],'soft');
  cfgSeg('glass','Lasisuus',[['off','Peittävä'],['on','Lasinen']],'off');
  cfgSeg('dur','Kalenterimerkinnän oletuspituus',[['15','15 min'],['30','30 min'],['45','45 min'],['60','60 min']],'30');
  cfgSeg('size','Nappuloiden koko',[['normal','Normaali'],['small','Pieni']],'normal');
  /* 1.80 (Emil 24.10.2026): tunnistus projektikohtaisesti ja lukunäkymä kokeiluna */
  p.appendChild(el(H,'','Muistio'));
  cfgSeg('tun','Asiasanojen tunnistus tekstistä',[['on','Päällä'],['off','Pois']],'on');
  if(!inSheet)cfgSeg('wl','Automaattiset sanalinkit',[['on','Päällä'],['off','Pois']],'on');
  if(wlEnabled(data.cfg)){cfgSeg('wlk','Sanan alusta verrataan',[['5','5 kirjainta'],['4','4 kirjainta']],'5');
    [['wlno','Ei linkitetä (sanat välilyönnein)'],['wlyes','Linkitetään aina (ohittaa eston)']].forEach(function(x){p.appendChild(el('label','fl',x[1]));var ta=el('textarea');ta.id='set-'+x[0];ta.rows=2;ta.value=data.cfg[x[0]]||'';
      ta.addEventListener('change',function(){var v=clean(ta.value.replace(/[\s,;]+/g,' '));if(v)data.cfg[x[0]]=v;else delete data.cfg[x[0]];save();touch();});p.appendChild(ta);});}
  cfgSeg('read','Muistiinpano aukeaa',[['edit','Muokattavana'],['read','Lukunäkymänä']],'read');
  var h=el(H,'','Tiedot');h.id='sec-data';p.appendChild(h);
  p.appendChild(subI('Tiedot ovat vain tällä laitteella.','Vie varmuuskopio aika ajoin alapalkin vientinapista; tuonti on Valikossa.'));
  var ac=0;data.projects.forEach(function(P){ac+=parseText(P.text).items.length;});var k=kOf();
  p.appendChild(el('p','foot','Projekteja '+data.K.length+'. Tässä projektissa ('+(k?k.name:'')+') puita '+data.projects.length+', rivejä '+ac+', muistiinpanoja '+data.notes.length+', omia asiasanoja '+data.terms.length+'. Koko appi viety: '+whenTxt(data.meta.lastExport)+'.'+(data.K.some(function(x){return x.chg;})?' Sen jälkeen on tehty muutoksia.':'')));
  if(!inSheet)p.appendChild(el('p','foot','Projektin nimi ja poisto: Valikko → Projekti (tietokoneella yläpalkin projektin nimi). Roskakori: Muistio → Kuitatut.'));else p.appendChild(el('p','foot','Roskakori: Muistio → Kuitatut.'));}
function markAll(){stashK();data.K.forEach(function(k){k.chg=null;});data.meta.lastExport=nowIso();data.meta.dirty=0;save();renderStatus();renderVs();}
/* Tiedoston anto: jakoikkuna, latauslinkki tai varalla teksti. msg(teksti), text(teksti) näyttää kopioitavan, done() kun annettu. */
function shareFile(txt,name,msg,text,done){
  function fallback(){msg('Tiedoston tallennus ei ole käytettävissä tässä näkymässä. Kopioi alla oleva teksti ja tallenna se tiedostoksi tai muistiinpanoon.');text(txt);}
  function linkSave(){try{var url=URL.createObjectURL(new Blob([txt],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},5000);msg('Tiedosto '+name+' annettu tallennettavaksi. Jos mitään ei tapahtunut, käytä alla olevaa vientiä tekstinä.');if(done)done();}catch(e){fallback();}}
  try{var f=new File([txt],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).then(function(){msg('Tiedosto '+name+' annettu tallennettavaksi.');if(done)done();},
        function(err){if(err&&err.name==='AbortError')msg('Vienti peruttiin.');else linkSave();});return;}}catch(e){}
  linkSave();}
/* Vanhentuneen tuonnin varoitus (Emil 22.10.2026): tiedosto on viety ennen tämän laitteen viimeisintä muutosta */
function olderThan(saved,mod){if(!mod||typeof saved!=='string'||!saved||saved>=mod)return '';
  return 'Varoitus: tiedosto on viety '+stamp(saved)+', mutta tätä on muutettu tällä laitteella sen jälkeen ('+stamp(mod)+'). Tuonti hävittää myöhemmät muutokset.';}
function sameK(pr){var n=clean(pr.name||'');return data.K.filter(function(k){return typeof pr.id==='string'&&k.id===pr.id;})[0]||data.K.filter(function(k){return n&&k.name===n;})[0]||null;}
function replaceK(k,o){var L=projectsFromFile(o,todayIso());if(!L)return false;stashK();var st=L[0];KF.forEach(function(f){if(f!=='trash')k[f]=st[f];});k.name=st.name;k.mod=nowIso();k.chg=null;
  if(k.id===data.k){loadK(k);applyCfg();}resetDraft();ed=null;termCache=null;noteFilter=[];save();renderHead();renderStatus();render();return true;}
function cnt(K,f){return K.reduce(function(a,k){return a+k[f].length;},0);}
function offerImport(txt){var out=$('dataout');out.textContent='';pendingImport=null;var o=looseJson(txt);
  if(o&&o.app==='paatospuu'&&(o.laji==='projekti'||o.projekti)){setMsg('');var c0=el('div','confirm'),pr=o.projekti||{},same=sameK(pr),r0=el('div','btnrow');
    function added(){var n=addProjects(o);out.textContent='';setMsg(n?'Projekti lisätty ja avattu.':'Projektia ei voitu lukea.',!n);}
    if(!same){c0.appendChild(el('p','','Tämä on yksittäinen projekti, ei koko varmuuskopio. Se lisätään uudeksi projektiksi, mitään ei korvata.'));button(r0,'Lisää projekti','btn solid',added).id='impadd';}
    else{c0.appendChild(el('p','','Projekti ”'+same.name+'” on jo tässä appissa. Korvaa se tiedoston sisällöllä tai lisää tiedosto erillisenä kopiona.'));
      var old=olderThan(o.savedAt,same.mod);if(old){var w=el('p','msg warn',old);w.id='impold';c0.appendChild(w);}
      button(r0,'Korvaa projekti','btn'+(old?'':' solid'),function(){var ok=replaceK(same,o);out.textContent='';setMsg(ok?'Projekti ”'+same.name+'” korvattu tiedoston sisällöllä.':'Projektia ei voitu lukea.',!ok);}).id='imprep';
      button(r0,'Lisää kopiona','btn',added).id='impadd';}
    button(r0,'Peru','btn',function(){out.textContent='';});c0.appendChild(r0);out.appendChild(c0);return;}
  var nd=normalizeData(o);
  if(!nd){setMsg('Sisältö ei ole Juuren varmuuskopio.',true);return;}
  pendingImport=nd;pendingKuvat=o.kuvat;setMsg('');var c=el('div','confirm');stashK();
  var newest=data.K.reduce(function(a,k){return k.mod&&k.mod>a?k.mod:a;},''),old=olderThan(o.savedAt,newest);
  c.appendChild(el('p','','Varmuuskopiossa on '+nd.K.length+(nd.K.length===1?' projekti':' projektia')+', '+cnt(nd.K,'projects')+' puuta ja '+cnt(nd.K,'notes')+' muistiinpanoa. Tämän laitteen nykyiset tiedot ('+(stashK(),data.K.length)+(data.K.length===1?' projekti':' projektia')+', '+cnt(data.K,'projects')+' puuta, '+cnt(data.K,'notes')+' muistiinpanoa) korvataan.'));if(old){var w=el('p','msg warn',old);w.id='impold';c.appendChild(w);}
  var r=el('div','btnrow');button(r,'Korvaa tiedot','btn solid',function(){var o2=pendingImport;if(!o2)return;applyND(o2);omatIn(pendingKuvat);data.K.forEach(function(k){k.chg=null;});data.meta.dirty=0;resetDraft();ed=null;save();applyCfg();pendingImport=null;renderHead();renderStatus();render();setMsg('Tiedot tuotu.');}).id='impok';
  button(r,'Peru','btn',function(){pendingImport=null;out.textContent='';});c.appendChild(r);out.appendChild(c);}

HELP.lista[1]='<p><b>Työnkulku</b> (Listan asetuksista): perustilainen asiasana näkyy mutta ei ole kuitattavissa. Ehdot aktivoivat sen. Rivillä yksi kuittaus tai kaikki aktiiviset kuittaukset riittävät; perustilaiset saavat jäädä väliin. Kuittaa työnkulku on käytettävissä vasta kun vaaditut kohdat on käsitelty. Keskeneräisen voi sulkea ja jatkaa myöhemmin. Uudet kierroslistat ovat työnkulkuja, vanhoissa toiminnon voi kytkeä päälle. Vanhan kierroslistan Lopeta säilyy entisellään.</p>'+HELP.lista[1];
HELP.ehdot[1]=HELP.ehdot[1].replace('asiasana on listan riveillä piilossa, kunnes ehto täyttyy','asiasana odottaa työnkulussa perustilassa, kunnes ehto aktivoi sen kuitattavaksi. Vanhassa kierrostavassa se on siihen asti piilossa');
HELP.muistiot[1]=HELP.muistiot[1].replace('napautus vie seuraavaan, sivupyyhkäisy edelliseen','napautus avaa valikon napin lähelle, sivupyyhkäisy vaihtaa viereiseen osioon').replace('kiertää napautuksesta','avaa suoran valinnan');
HELP.vaiheet=['Vaihepankki','<p>Työnkulun rivi on yhteisen vaiheen esiintymä. Uusi rivi luo vaiheen pankkiin; valmis vaihe voidaan lisätä muihin listoihin. Pankissa avattava rivi näyttää jäsenet ja säännön. Nimi, jäsenet ja valmistumissääntö muuttuvat kaikissa käyttökohteissa heti. Rivin teksti ja kuittaukset ovat sen omia. Poistettu jäsen säilyttää aiemman kuittauksensa piilossa; palautettu jäsen saa sen takaisin samalla kierroksella. Tee oma versio irrottaa vain tämän rivin uuteen vaiheeseen. Rivin poisto ei poista vaihetta pankista.</p>'];
HELP.lista[1]+='<p><b>Työnkulku kuittaustapana:</b> valitse asiasanan Listassa-osiossa työnkulkupohja. Asiasanan painaminen listalla käynnistää erillisen suorituksen tai jatkaa saman lähtökohdan keskeneräistä. Vain valmis suoritus kuittaa lähtökohdan. Takaisin lähtökohtaan jättää suorituksen kesken. Listanvalitsimesta löytyvät myös valmiit suoritukset ja niiden poistaminen. Kalenterimerkinnän kuittaaminen ei ohita työnkulkuvaatimusta. Uusiutuva tarkistus tarvitsee uuden suorituksen.</p>';
HELP.asiasanat[1]+='<p><b>Kuittaustapa</b> valitaan kortin Listassa-osiossa. Voit valita suoran kuittauksen tai Listoihin rakennetun työnkulun. Muistiinpanon asiasanan Avaa työnkulku on vapaaehtoinen: se ei kuittaa muistiinpanoa. Jokaisen lähtökohdan kuittaukset ovat erilliset. Suoritukseen tulevat pohjan vaiheet ja tekstit käynnistyshetkeltä, mutta yhteisten vaiheiden muokkaukset ja projektin ehdot päivittyvät myös keskeneräisiin. Poistunut tai muuttunut lähtökohta ei saa vanhan suorituksen kuittausta. Saman työnkulun sisäkkäinen kehä estetään.</p>';
fiAll();renderStatus();renderHead();showTab(sectionsFor(hiddenSections,kt())[0]);draftRestore();omatLoad();vStart();
})();
