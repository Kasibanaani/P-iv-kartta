
/* ===================== MOOTTORI (ei DOMia, testattavissa nodella) =====================
   Projekti = yksi päätöspuu. Sisältö on tekstikenttä P.text, rivi per asia:
     tavallinen rivi      = nappula (valittava vaihtoehto)
     #Nimi: selitys       = ryhmä (näkymätön käytössä; aktivoituu ja avaa tai sulkee kuten nappula)
     >Nimi: teksti        = ilmoitus (teksti tulee kierroksen ruutuun, nimi näkyy vain opetuksessa)
     tyhjä tai //…        = ohitetaan; " // " tekstin sisällä = kappaleenvaihto
   Säännöt ovat erillään tekstistä, avaimena nimi pienillä kirjaimilla:
     P.rules[lähde] = {o:[avaa], x:[sulkee pois]}; lähde on nappula, ryhmä tai Alku (ALKU).
     P.mx = [[nappuloita]]: toisensa poissulkevat. Pätevät vain saman askeleen valinnoissa, eivät muistu.
   Kierros (yksi läpikäynti): S.steps = [{p:valitut, d:puretut}], ensimmäinen askel on Alku.
     Tarjolla = vain edellisen askeleen valintojen (ja niiden aktivoimien ryhmien) suoraan avaamat.
     Valinnat ja niiden poissulut muistuvat kierroksen ajan, kunnes valinta puretaan. Poissulku voittaa aina.
     Ryhmä avaa jäsenensä; ryhmän poissulku sulkee pois myös sen jäsenet. */
var VER=2,ALKU='__alku';
function clean(s){return String(s==null?'':s).replace(/\s+/g,' ').trim();}
function keyOf(s){return clean(s).toLowerCase();}
function parseLine(line){var s=String(line==null?'':line).trim();if(!s||s.slice(0,2)==='//'||s.charAt(0)==='=')return null;
  var k='b',c0=s.charAt(0);if(c0==='#')k='g';else if(c0==='>')k='t';else if(c0==='?')k='q';
  if(k!=='b')s=s.slice(1).trim();
  if(!s)return null;var name=s,body='';
  if(k!=='b'){var i=s.indexOf(':');if(i>0){name=s.slice(0,i);body=s.slice(i+1).trim();}}
  name=clean(name);if((k==='t'||k==='q')&&!body)body=s;
  return {k:k,name:name,body:body};}
function lineOf(it){var p={g:'#',t:'>',q:'?'}[it.k]||'';
  if((it.k==='t'||it.k==='q')&&it.body===it.name)return p+it.body;
  return p+it.name+(it.k!=='b'&&it.body?': '+it.body:'');}
function bodyText(s){return String(s||'').split(/\s+\/\/\s+/).join('\n\n');}
/* Termilohko: rivi "=Nimi:" ja sen alla sanat riveittäin ("!" alussa = poissulkeva) tyhjään riviin asti.
   Lohkon rivit eivät ole palikoita. Palauttaa jokaiselle riville lajin: xh otsikko, xw sana, xn poissulkeva, c kommentti, '' muu. */
function lineKinds(text){var out=[],blk=null;
  String(text||'').split(/\r?\n/).forEach(function(line,n){var t=line.trim(),m;
    if(!t){blk=null;out.push({k:''});return;}
    if((m=IMP_RE.exec(t))){blk={rule:true,rel:'imp',src:'',items:[],line:n};out.push({k:'rh',b:blk});if(clean(m[1]))blk.items.push(itemName(m[1]));return;}
    if((m=MX_RE.exec(t))){blk={rule:true,rel:'mx',src:'',items:[],line:n};out.push({k:'rh',b:blk});if(clean(m[1]))blk.items.push(itemName(m[1]));return;}
    if((m=RULE_RE.exec(t))&&clean(m[1])){blk={rule:true,rel:RELS[m[2].toLowerCase().replace(/\s+/,' ')],src:clean(m[1]),items:[],line:n};out.push({k:'rh',b:blk});if(clean(m[3]))blk.items.push(blk.rel==='flip'?clean(m[3]):itemName(m[3]));return;}
    if((m=/^=([^:]+):(.*)$/.exec(t))&&clean(m[1])){blk={name:clean(m[1]),yes:[],no:[],line:n};out.push({k:'xh',b:blk});if(clean(m[2]))blk.yes.push(clean(m[2]));return;}
    if(t.slice(0,2)==='//'){out.push({k:'c'});return;}
    if(blk&&blk.rule){blk.items.push(blk.rel==='flip'?clean(t):itemName(t));out.push({k:'rw',b:blk});return;}
    if(blk){if(t.charAt(0)==='!'){if(clean(t.slice(1)))blk.no.push(clean(t.slice(1)));out.push({k:'xn',b:blk});}else{blk.yes.push(clean(t));out.push({k:'xw',b:blk});}return;}
    out.push({k:''});});
  return out;}
function blocksOf(text){var out=[];lineKinds(text).forEach(function(l){if(l.k==='xh')out.push(l.b);});return out;}
/* Säännöt tekstissä (Emil 21.10.2026): lohko "=Koira avaa:" ja kohteet riveittäin, tyhjä rivi päättää lohkon.
   avaa, sulkee, vaatii kaikki, vaatii yhden (= jokainen rivi avaa tämän), ennen (rivit ovat vähemmän tärkeitä) ja
   "=Toisensa poissulkevat:". Lähde Alku = kierroksen alku. Teksti on totuus: P.rules, need, order ja mx luetaan siitä,
   ja napautus kirjoittaa muutoksen takaisin lohkoon (olemassa oleva lohko paikallaan, uusi tekstin loppuun). */
var RELS={'avaa':'o','sulkee':'x','vaatii kaikki':'need','vaatii yhden':'one','ennen':'ord','kääntöpuoli':'flip'},RELW={o:'avaa',x:'sulkee',need:'vaatii kaikki',one:'vaatii yhden',ord:'ennen',flip:'kääntöpuoli'};
var IMP_RE=/^=\s*tärkeät\s*:(.*)$/i;
var RULE_RE=/^=(.+?)\s+(avaa|sulkee|vaatii\s+kaikki|vaatii\s+yhden|ennen|kääntöpuoli)\s*:(.*)$/i,MX_RE=/^=\s*toisensa\s+poissulkevat\s*:(.*)$/i;
function itemName(s){var p=parseLine(s);return p?p.name:clean(s);}
function srcKey(s){var k=keyOf(itemName(s));return k==='alku'?ALKU:k;}
function ruleBlocks(text){var out=[];lineKinds(text).forEach(function(l){if(l.k==='rh')out.push(l.b);});return out;}
/* "=Tärkeät:" (Emil 21.10.2026): puun tähdellä merkityt palikat järjestyksessä. Ne ovat puun järjestyksessä ensin. */
function rulesOf(text){var M={rules:{},need:{},order:{},mx:[],flip:{},imp:[]};
  function add(s,f,d){if(!s||!d||s===d||d===ALKU||(s===ALKU&&f==='x'))return;var r=M.rules[s]||(M.rules[s]={o:[],x:[]});if(r[f].indexOf(d)<0)r[f].push(d);}
  ruleBlocks(text).forEach(function(b){var s=srcKey(b.src),ks=[];
    /* kääntöpuoli: rivit ovat tekstiä, eivät palikoita */
    if(b.rel==='flip'){if(s&&s!==ALKU){var fl=M.flip[s]||(M.flip[s]=[]);b.items.forEach(function(x){x=clean(x);if(x&&fl.indexOf(x)<0)fl.push(x);});}return;}b.items.forEach(function(x){var k=srcKey(x);if(k&&k!==ALKU&&ks.indexOf(k)<0)ks.push(k);});
    if(b.rel==='imp'){ks.forEach(function(k){if(M.imp.indexOf(k)<0)M.imp.push(k);});}
    else if(b.rel==='mx'){if(ks.length>1)M.mx.push(ks);}
    else if(b.rel==='o'||b.rel==='x')ks.forEach(function(d){add(s,b.rel,d);});
    else if(b.rel==='one')ks.forEach(function(c){add(c,'o',s);});
    else if(s&&s!==ALKU){var N=b.rel==='need'?M.need:M.order,l=N[s]||(N[s]=[]);ks.forEach(function(d){if(d!==s&&l.indexOf(d)<0)l.push(d);});}});
  Object.keys(M.order).forEach(function(k){if(!M.order[k].length)delete M.order[k];});
  return M;}
function canonR(M){var r={};Object.keys(M.rules||{}).sort().forEach(function(k){var x=M.rules[k]||{},o=(x.o||[]).slice().sort(),y=(x.x||[]).slice().sort();if(o.length||y.length)r[k]=[o,y];});
  function mp(N,keep){var o={};Object.keys(N||{}).sort().forEach(function(k){var l=Array.isArray(N[k])?N[k].slice().sort():[];if(l.length||keep)o[k]=l;});return o;}
  return JSON.stringify([r,mp(M.need,true),mp(M.order),(M.mx||[]).map(function(x){return x.slice().sort();}),mp(M.flip),M.imp||[]]);}
/* Kirjoittaa projektin säännöt tekstin lohkoihin */
function writeRules(text,P){var L=String(text||'').split(/\r?\n/),lk=lineKinds(text),pt=parseText(text),names={},ex=[],one={},want={},order=[];
  pt.items.forEach(function(it){names[it.id]=it.name;});
  lk.forEach(function(l,n){if(l.k==='rh'){l.b.end=n;ex.push(l.b);}else if(l.k==='rw')l.b.end=n;});
  ex.forEach(function(b){[b.src].concat(b.rel==='flip'?[]:b.items).forEach(function(x){var k=srcKey(x);if(k&&!names[k])names[k]=itemName(x);});if(b.rel==='one')one[srcKey(b.src)]=1;});
  function nm(k){return k===ALKU?'Alku':(names[k]||k);}
  function put(key,head,ks,keep,raw){want[key]={head:head,items:raw?ks.slice():ks.map(nm),keep:keep};order.push(key);}
  var srcs=[ALKU].concat(pt.items.map(function(it){return it.id;}));
  [P.rules,P.need,P.order,one,P.flip].forEach(function(N){Object.keys(N||{}).sort().forEach(function(k){if(srcs.indexOf(k)<0)srcs.push(k);});});
  srcs.forEach(function(s){var r=rl(P,s),h='='+nm(s)+' ';
    var o=r.o.filter(function(t){return s===ALKU||!one[t];});if(o.length)put(s+'|o',h+'avaa:',o);
    if(s!==ALKU&&r.x.length)put(s+'|x',h+'sulkee:',r.x);
    if(s!==ALKU&&P.need&&Array.isArray(P.need[s]))put(s+'|need',h+'vaatii kaikki:',P.need[s],true);
    if(one[s])put(s+'|one',h+'vaatii yhden:',srcs.filter(function(k){return k!==ALKU&&rl(P,k).o.indexOf(s)>=0;}));
    if(s!==ALKU&&orderOf(P,s).length)put(s+'|ord',h+'ennen:',orderOf(P,s));
    if(s!==ALKU&&P.flip&&Array.isArray(P.flip[s])&&P.flip[s].length)put(s+'|flip',h+'kääntöpuoli:',P.flip[s],false,true);});
  (P.mx||[]).forEach(function(set,i){if(set.length>1)put('mx|'+i,'=Toisensa poissulkevat:',set);});
  if((P.imp||[]).length)put('imp','=Tärkeät:',P.imp);
  var used={},edits=[],mi=0;
  ex.forEach(function(b){var key=b.rel==='mx'?'mx|'+(mi++):b.rel==='imp'?'imp':srcKey(b.src)+'|'+b.rel,w=want[key];
    if(w&&!used[key]&&(w.items.length||w.keep)){used[key]=1;edits.push({a:b.line,z:b.end,l:[w.head].concat(w.items)});}else edits.push({a:b.line,z:b.end,l:null});});
  for(var i=edits.length-1;i>=0;i--){var e=edits[i],a=e.a,z=e.z;
    if(e.l)L.splice.apply(L,[a,z-a+1].concat(e.l));
    else{if(z+1<L.length&&!L[z+1].trim())z++;else if(a>0&&!L[a-1].trim())a--;L.splice(a,z-a+1);}}
  var add=order.filter(function(k){return !used[k]&&(want[k].items.length||want[k].keep);});
  if(add.length){while(L.length&&!L[L.length-1].trim())L.pop();add.forEach(function(k){if(L.length)L.push('');L.push(want[k].head);want[k].items.forEach(function(x){L.push(x);});});}
  return L.join('\n');}
/* Teksti -> säännöt, ja säännöt -> teksti vain, jos ne eroavat (napautus) */
function rulesFromText(P){var M=rulesOf(P.text);P.rules=M.rules;P.need=M.need;P.order=M.order;P.mx=M.mx;P.flip=M.flip;P.imp=M.imp;return P;}
function rulesToText(P){if(canonR(rulesOf(P.text))!==canonR(P))P.text=writeRules(P.text,P);return P;}
/* Nimen vaihto tekstissä: sääntölohkojen ja termilohkojen viittaukset seuraavat */
function renameInText(text,a,nn){var L=String(text||'').split(/\r?\n/),lk=lineKinds(text);
  function sw(x){return srcKey(x)===a?nn:x;}
  lk.forEach(function(l,n){var t=L[n],ind=/^\s*/.exec(t)[0],u=t.trim(),m;
    if(l.k==='rh'){if((m=MX_RE.exec(u))||(m=IMP_RE.exec(u)))L[n]=ind+u.slice(0,u.indexOf(':')+1)+(clean(m[1])?' '+sw(clean(m[1])):'');
      else if((m=RULE_RE.exec(u)))L[n]=ind+'='+sw(clean(m[1]))+' '+m[2]+':'+(clean(m[3])?' '+sw(clean(m[3])):'');}
    else if(l.k==='rw'&&l.b.rel!=='flip'&&srcKey(u)===a)L[n]=ind+nn;
    else if(l.k==='xh'&&(m=/^=([^:]+):(.*)$/.exec(u))&&keyOf(m[1])===a)L[n]=ind+'='+nn+':'+m[2];});
  return L.join('\n');}
/* Kirjoittaessa: jos vain yksi palikkarivi muuttui ja sen nimi vaihtui, viittaukset seuraavat. Palauttaa uuden tekstin tai null. */
function renameLive(oldT,newT){var a=String(oldT||'').split('\n'),b=String(newT||'').split('\n'),d=-1;if(a.length!==b.length)return null;
  for(var i=0;i<a.length;i++)if(a[i]!==b[i]){if(d>=0)return null;d=i;}
  if(d<0)return null;var po=parseText(oldT),pn=parseText(newT),io=null,inn=null;
  po.items.forEach(function(it){if(it.line===d)io=it;});pn.items.forEach(function(it){if(it.line===d)inn=it;});
  if(!io||!inn||io.id===inn.id||pn.by[io.id]||po.by[inn.id])return null;
  var r=renameInText(newT,io.id,inn.name);return r===newT?null:r;}
function parseText(text){var items=[],by={},warn=[],lk=lineKinds(text);
  String(text||'').split(/\r?\n/).forEach(function(line,n){if(lk[n].k)return;var p=parseLine(line);if(!p)return;var id=keyOf(p.name);
    if(!id||id===ALKU)return;
    if(by[id]){warn.push('Rivi '+(n+1)+': nimi ”'+p.name+'” on jo käytössä, joten rivi ohitettiin.');return;}
    p.id=id;p.line=n;by[id]=p;items.push(p);});
  return {items:items,by:by,warnings:warn};}
function rl(P,id){var r=P.rules&&P.rules[id];return r&&Array.isArray(r.o)&&Array.isArray(r.x)?r:{o:[],x:[]};}
function ruleOf(P,id){if(!P.rules||typeof P.rules!=='object')P.rules={};var r=P.rules[id];
  if(!r||!Array.isArray(r.o)||!Array.isArray(r.x))r=P.rules[id]={o:(r&&Array.isArray(r.o))?r.o:[],x:(r&&Array.isArray(r.x))?r.x:[]};return r;}
function ruleState(P,src,dst){var r=rl(P,src);return r.o.indexOf(dst)>=0?'o':(r.x.indexOf(dst)>=0?'x':'');}
/* Lisää tai poistaa säännön src -> dst tilassa mode ('o' avaa, 'x' sulkee pois). Sama kohde ei voi olla molemmissa. */
function toggleRule(P,src,dst,mode){if(!src||!dst||src===dst||dst===ALKU)return null;if(src===ALKU&&mode==='x')return null;
  var r=ruleOf(P,src),a=mode==='x'?r.x:r.o,b=mode==='x'?r.o:r.x,i=a.indexOf(dst),j=b.indexOf(dst);
  if(j>=0)b.splice(j,1);if(i>=0)a.splice(i,1);else a.push(dst);
  if(!r.o.length&&!r.x.length)delete P.rules[src];
  return i>=0?'':mode;}
/* Alku: opetetut aloitusvaihtoehdot, tai jos Alkua ei ole opetettu, kaikki joita mikään ei avaa */
/* Alku ilman omia sääntöjä avaa kaiken, mitä mikään ei avaa. Kaikki tarvitaan -merkityksen avaa sen ehto, ei Alku.
   skip: tärkeysjärjestyksessä etenevällä kierroksella merkitysten ehdot tulevat merkitys kerrallaan, eivät Alusta. */
function opensOf(P,items,s,skip){var r=rl(P,s);if(s!==ALKU||r.o.length)return r.o;
  var opened={};Object.keys(P.rules||{}).forEach(function(k){if(k!==ALKU)rl(P,k).o.forEach(function(x){opened[x]=1;});});
  Object.keys(P.need||{}).forEach(function(k){if(needOf(P,k).length)opened[k]=1;});if(skip)Object.keys(skip).forEach(function(k){opened[k]=1;});
  return items.filter(function(it){return !opened[it.id];}).map(function(it){return it.id;});}
/* Poissulku: suljettu ryhmä sulkee pois myös kaikki jäsenensä (ja jäsenryhmiensä jäsenet) */
function addExcl(P,pt,excl,y){if(excl[y])return;excl[y]=1;var it=pt.by[y];if(it&&it.k==='g')opensOf(P,pt.items,y).forEach(function(z){addExcl(P,pt,excl,z);});}
/* Ryhmät, jotka lähteet aktivoivat suoraan tai toisten ryhmien kautta, ellei niitä ole suljettu pois.
   Aktivoituneen ryhmän poissulut lisätään samalla excl-joukkoon. */
function reachGroups(P,pt,srcs,excl){var g=[],q=srcs.slice(),seen={};srcs.forEach(function(x){seen[x]=1;});
  while(q.length){var s=q.shift();opensOf(P,pt.items,s).forEach(function(x){var it=pt.by[x];if(it&&it.k==='g'&&!seen[x]&&!excl[x]){seen[x]=1;g.push(x);q.push(x);
      rl(P,x).x.forEach(function(y){addExcl(P,pt,excl,y);});}});}
  return g;}
/* Kierroksen muistamat valinnat: askel = {p:[valitut], d:[poistetut]}. Valinta muistuu, kunnes se puretaan. */
function replay(steps){var sel=[];(steps||[]).forEach(function(st){sel=sel.filter(function(x){return st.d.indexOf(x)<0;});st.p.forEach(function(x){if(x!==ALKU&&sel.indexOf(x)<0)sel.push(x);});});return sel;}
function exclOf(P,pt,sel){var excl={};sel.forEach(function(s){rl(P,s).x.forEach(function(y){addExcl(P,pt,excl,y);});});reachGroups(P,pt,sel,excl);return excl;}
function stepsOf(S){return (S&&Array.isArray(S.steps)&&S.steps.length)?S.steps:[{p:[ALKU],d:[]}];}
/* Ehdot (taaksepäin opetettu): P.need[seuraus] = syyt, joiden kaikkien pitää olla valittuina tällä kierroksella.
   Seuraus tulee näkyviin askeleessa, jossa viimeinenkin syy on valittu (koko kierroksen valinnat lasketaan).
   "Yksi riittää" tallentuu tavallisena avaa-sääntönä jokaiselle syylle, joten sillä ei ole omaa muotoa. */
function needOf(P,id){var n=P.need&&P.need[id];return Array.isArray(n)?n:[];}
function needOpen(P,sel,lastP){var out=[];Object.keys(P.need||{}).forEach(function(d){var n=needOf(P,d);
  if(n.length&&n.every(function(x){return sel.indexOf(x)>=0;})&&n.some(function(x){return lastP.indexOf(x)>=0;}))out.push(d);});return out;}
function setNeed(P,id,list){if(!P.need||typeof P.need!=='object')P.need={};if(list&&list.length)P.need[id]=list.slice();else delete P.need[id];}
/* Ehtotila: yksi riittää <-> kaikki tarvitaan. Syyt siirtyvät muodosta toiseen. */
function causesOf(P,pt,id){var out=[];Object.keys(P.rules||{}).forEach(function(k){if(k!==ALKU&&rl(P,k).o.indexOf(id)>=0&&pt.by[k]&&pt.by[k].k==='b')out.push(k);});return out;}
function setNeedMode(P,pt,id,all){if(all){if(needOf(P,id).length)return;var c=causesOf(P,pt,id);c.forEach(function(k){toggleRule(P,k,id,'o');});setNeed(P,id,c);if(!c.length)P.need[id]=[];}
  else{var n=needOf(P,id);n.forEach(function(k){if(ruleState(P,k,id)!=='o')toggleRule(P,k,id,'o');});if(P.need)delete P.need[id];}}
function toggleNeed(P,id,src){if(!src||src===id||src===ALKU)return;var n=needOf(P,id).slice(),i=n.indexOf(src);if(i>=0)n.splice(i,1);else n.push(src);if(!P.need)P.need={};P.need[id]=n;}
/* Arvojärjestys: P.order[palikka] = sitä vähemmän tärkeät. Ilman sääntöä ratkaisee rivijärjestys.
   Järjestys ja kaikki tarvitaan -ehdot ovat yhdessä suunnattu verkko (a ennen b). Kehä on ristiriita, joten
   sen synnyttävä napautus hylätään ja ketju näytetään. */
function orderOf(P,id){var o=P.order&&P.order[id];return Array.isArray(o)?o:[];}
function edgesOf(P){var E={};function add(a,b){(E[a]=E[a]||[]).push(b);}
  Object.keys(P.order||{}).forEach(function(a){orderOf(P,a).forEach(function(b){add(a,b);});});
  Object.keys(P.need||{}).forEach(function(d){needOf(P,d).forEach(function(s){add(s,d);});});return E;}
function pathOf(E,a,b){var prev={},q=[a],seen={};seen[a]=1;
  while(q.length){var x=q.shift();if(x===b){var p=[b];while(p[0]!==a)p.unshift(prev[p[0]]);return p;}(E[x]||[]).forEach(function(y){if(!seen[y]){seen[y]=1;prev[y]=x;q.push(y);}});}
  return null;}
/* Jos uusi suhde a ennen b loisi kehän, palauttaa ketjun [a, b, …, a], muuten null */
function cycleIf(P,a,b){if(a===b)return [a,a];var p=pathOf(edgesOf(P),b,a);return p?[a].concat(p):null;}
function toggleOrder(P,id,less){if(!id||!less||id===less)return null;var o=orderOf(P,id).slice(),i=o.indexOf(less);
  if(i>=0){o.splice(i,1);}else{var c=cycleIf(P,id,less);if(c)return c;o.push(less);}
  if(!P.order||typeof P.order!=='object')P.order={};if(o.length)P.order[id]=o;else delete P.order[id];return null;}
/* Tärkeysjärjestys joukolle ids: verkon (myös välillisten) suhteiden mukaan, muuten rivijärjestys */
function priorityList(P,pt,ids){var st=(P.imp||[]).filter(function(x){return ids.indexOf(x)>=0;});
  return st.concat(priorityRest(P,pt,ids.filter(function(x){return st.indexOf(x)<0;})));}
function priorityRest(P,pt,ids){var E=edgesOf(P),line={},inS={},before={};pt.items.forEach(function(it,k){line[it.id]=k;});ids.forEach(function(x){inS[x]=1;before[x]=0;});
  var reach={};ids.forEach(function(a){var seen={},st=(E[a]||[]).slice();while(st.length){var y=st.pop();if(seen[y])continue;seen[y]=1;(E[y]||[]).forEach(function(z){st.push(z);});}
    reach[a]=ids.filter(function(b){return b!==a&&seen[b];});reach[a].forEach(function(b){before[b]++;});});
  var out=[],left=ids.slice();while(left.length){var ready=left.filter(function(x){return !before[x];});if(!ready.length)ready=left.slice();
    ready.sort(function(x,y){return (line[x]||0)-(line[y]||0);});var x=ready[0];out.push(x);left.splice(left.indexOf(x),1);reach[x].forEach(function(b){before[b]--;});}
  return out;}
/* Hoidettavat kierroksen lopussa: valitsematta jääneet nappulat (ei poissuljetut) tärkeysjärjestyksessä.
   jotta = myöhemmät hoidettavat, joiden kaikki tarvitaan -ehto vaatii tämän. */
function hoidettavat(P,S){var v=sessionView(P,S),ids=v.pt.items.filter(function(it){return it.k==='b'&&v.sel.indexOf(it.id)<0&&!v.excl[it.id];}).map(function(it){return it.id;});
  return priorityList(P,v.pt,ids).map(function(id){return {id:id,jotta:ids.filter(function(d){return needOf(P,d).indexOf(id)>=0;})};});}
/* Kierroksen tilanne. draft = tämän askeleen keskeneräiset muutokset {p:uudet valinnat, d:puretut}.
   Tarjolla = vain edellisen askeleen valintojen (ja niiden ryhmien) suoraan avaamat, miinus poissuljetut.
   Aiemmin valittu näkyy valmiiksi valittuna. Saman askeleen poissulut ja toisensa poissulkevat näkyvät harmaina (blocked). */
/* Merkitys = palikka, jolla on kaikki tarvitaan -ehdot, tai tähdellä merkitty ryhmä (osat = sen jäsenet) */
function partsOf(P,pt,d){var n=needOf(P,d),it=pt.by[d];if(n.length)return n;if(!it||(P.imp||[]).indexOf(d)<0)return [];
  return it.k==='g'?rl(P,d).o.filter(function(x){return pt.by[x];}):it.k==='b'?[d]:[];}
function meaningsOf(P,pt){return priorityList(P,pt,pt.items.filter(function(it){return partsOf(P,pt,it.id).length;}).map(function(it){return it.id;}));}
function sessionView(P,S,draft){var pt=parseText(P.text),steps=stepsOf(S),last=steps[steps.length-1];draft=draft||{p:[],d:[]};
  var committed=replay(steps),base=committed.filter(function(x){return draft.d.indexOf(x)<0;}),excl=exclOf(P,pt,base);
  var open={},cur=null,skip=null;
  /* Eteneminen tärkeysjärjestyksessä (P.flow 'prio'): askel tarjoaa tärkeimmän täyttymättömän merkityksen ehdot.
     Askel muistaa merkityksensä (st.m), joten Jatka ilman valintaa ohittaa sen. */
  if(P.flow==='prio'){var passed={};steps.forEach(function(st){if(st.m)passed[st.m]=1;});skip={};
    meaningsOf(P,pt).forEach(function(d){var n=partsOf(P,pt,d),grp=!needOf(P,d).length;n.forEach(function(c){skip[c]=1;});
      if(!cur&&!passed[d]&&!excl[d]&&!n.every(function(c){return base.indexOf(c)>=0||(grp&&excl[c]);}))cur=d;});
    if(cur)partsOf(P,pt,cur).forEach(function(c){open[c]=1;});}
  function from(lastP){var srcs=lastP.filter(function(x){return x===ALKU||(pt.by[x]&&(pt.by[x].k==='b'||pt.by[x].k==='g'));});
    var nd=needOpen(P,base,lastP).filter(function(x){return !excl[x];}),gs=nd.filter(function(x){return pt.by[x]&&pt.by[x].k==='g';});
    nd.forEach(function(x){open[x]=1;});gs.forEach(function(g){rl(P,g).x.forEach(function(y){addExcl(P,pt,excl,y);});});
    srcs.concat(gs,reachGroups(P,pt,srcs.concat(gs),excl)).forEach(function(s){opensOf(P,pt.items,s,skip).forEach(function(x){open[x]=1;});});}
  /* Muisti 'all': kaikkien askelten (yhä voimassa olevien) valintojen avaamat pysyvät tarjolla */
  /* Tärkeysjärjestyksessä Alku odottaa, kunnes merkitykset on käyty: sitten sen avaamat tulevat tarjolle */
  function srcs(l){return P.flow!=='prio'?l:cur?l.filter(function(x){return x!==ALKU;}):(l.indexOf(ALKU)<0?[ALKU].concat(l):l);}
  if(P.mem==='all')steps.forEach(function(st){from(srcs(st.p.filter(function(x){return x===ALKU||base.indexOf(x)>=0;})));});else from(srcs(last.p));
  /* Tärkeysjärjestyksessä muiden merkitysten osat odottavat omaa vuoroaan */
  if(cur){var cp=partsOf(P,pt,cur);Object.keys(skip).forEach(function(c){if(cp.indexOf(c)<0)delete open[c];});}
  var opts=[],texts=[],qs=[];
  pt.items.forEach(function(it){if(!open[it.id]||excl[it.id])return;if(it.k==='b')opts.push(it.id);else if(it.k==='t')texts.push(it.id);else if(it.k==='q')qs.push(it.id);});
  var picked=opts.filter(function(x){return (base.indexOf(x)>=0)||draft.p.indexOf(x)>=0;});
  return {opts:opts,texts:texts,qs:qs,excl:excl,sel:base,picked:picked,blocked:blockedNow(P,opts,picked),pt:pt,cur:cur};}
/* Saman askeleen ristiriidat: mitkä tarjolla olevista eivät käy yhteen jo merkittyjen kanssa */
function blockedNow(P,opts,picked){var out={};
  opts.forEach(function(id){if(picked.indexOf(id)>=0)return;var why=null;
    picked.forEach(function(p){if(why)return;
      if(rl(P,p).x.indexOf(id)>=0||rl(P,id).x.indexOf(p)>=0)why=p;
      else (P.mx||[]).forEach(function(set){if(!why&&set.indexOf(p)>=0&&set.indexOf(id)>=0)why=p;});});
    if(why)out[id]=why;});
  return out;}
/* Napautus käytössä: palauttaa uuden draftin */
function tapDraft(P,S,draft,id){var v=sessionView(P,S,draft),d={p:draft.p.slice(),d:draft.d.slice()};if(v.opts.indexOf(id)<0)return d;
  if(v.picked.indexOf(id)>=0){var i=d.p.indexOf(id);if(i>=0)d.p.splice(i,1);else d.d.push(id);}
  else if(!v.blocked[id]){var j=d.d.indexOf(id);if(j>=0)d.d.splice(j,1);else d.p.push(id);}
  return d;}
/* Kierros voi koskea päivää: sen päivän muistiinpanojen termit, jotka ovat tämän puun rivejä, tulevat valmiiksi mukaan.
   Nappulat ja ryhmät valituiksi alkuaskeleeseen (avaavat ja sulkevat kuten valinta), ilmoitukset ruutuun. */
/* cal=true: kalenteriin myös kuitatut, mutta ei arkistoituja (Emil 22.10.2026). Muuten vain avoimet (kierros päivälle). */
function notesOnDay(notes,date,cal){return (notes||[]).filter(function(n){return !n.arch&&!(!cal&&n.done)&&noteDates(n).some(function(o){return occursOn(o,date);});});}
function dayCarry(P,notes,terms,date){var pt=parseText(P.text),pre=[],tx=[],src=date?notesOnDay(notes,date):[],byId={};
  (terms||[]).forEach(function(t){byId[t.id]=t;});
  src.forEach(function(n){noteTerms(terms,n.text).forEach(function(id){var t=byId[id],it=t&&t.auto?pt.by[t.key]:null;if(!it)return;
    if(it.k==='q')return;var l=it.k==='t'?tx:pre;if(l.indexOf(it.id)<0)l.push(it.id);});});
  return {notes:src.length,pre:pre,texts:tx};}
function newSession(P,now,day){var S={start:now,steps:[{p:[ALKU].concat(day&&day.pre||[]),d:[]}],log:(day&&day.texts||[]).slice(),logAt:[]};
  if(day&&day.date)S.date=day.date;addTexts(P,S);return S;}
function addTexts(P,S){var v=sessionView(P,S);v.texts.forEach(function(t){if(S.log.indexOf(t)<0)S.log.push(t);});return v;}
function commitStep(P,S,draft){var v=sessionView(P,S,draft);if(!v.picked.length&&!v.cur)return false;
  var st={p:v.picked.slice(),d:draft.d.filter(function(x){return v.sel.indexOf(x)<0;})};if(v.cur)st.m=v.cur;
  S.logAt.push(S.log.length);S.steps.push(st);addTexts(P,S);return true;}
/* Askeleen peruminen: palauttaa sen askeleen draftin, jotta valinnat voi korjata */
function undoStep(S){if(!S||S.steps.length<2)return null;var st=S.steps.pop(),n=S.logAt.pop();if(typeof n==='number')S.log.length=Math.min(S.log.length,n);
  var before=replay(S.steps);return {p:st.p.filter(function(x){return before.indexOf(x)<0;}),d:st.d.slice()};}
/* Kaikki ryhmät, jotka kierroksen aikana aktivoituivat (Alku mukaan lukien) */
function sessionGroups(P,S,pt){pt=pt||parseText(P.text);var steps=stepsOf(S),out=[];
  steps.forEach(function(st,i){var excl=exclOf(P,pt,replay(steps.slice(0,i+1)));
    var sel=replay(steps.slice(0,i+1)),sp=st.p.filter(function(x){return x===ALKU||(pt.by[x]&&(pt.by[x].k==='b'||pt.by[x].k==='g'));});
    sp=sp.concat(needOpen(P,sel,st.p).filter(function(x){return !excl[x]&&pt.by[x]&&pt.by[x].k==='g';}));
    sp.concat(reachGroups(P,pt,sp,excl)).forEach(function(g){if(pt.by[g]&&pt.by[g].k==='g'&&out.indexOf(g)<0)out.push(g);});});
  return out;}
/* Kierroksella tarjolla olleet palikat: jokaisen askeleen näkymä uudelleen */
function offeredIds(P,S){var steps=stepsOf(S),out=[];
  steps.forEach(function(st,i){sessionView(P,{steps:steps.slice(0,i+1)}).opts.forEach(function(x){if(out.indexOf(x)<0)out.push(x);});});return out;}
/* Puuttuu (kääntöpuolet): merkitys, jonka ehtoja tarjottiin mutta joka ei täyttynyt, ja tarjolla ollut palikka, jota ei valittu
   eikä suljettu pois. Merkitykset tärkeysjärjestyksessä ehtoineen, sitten muut rivijärjestyksessä. */
function flipMissing(P,S){var F=P.flip||{},v=sessionView(P,S),off=offeredIds(P,S),out=[],done={};
  function add(id){if(done[id])return;done[id]=1;(F[id]||[]).forEach(function(t){if(out.indexOf(t)<0)out.push(t);});}
  function miss(id){return off.indexOf(id)>=0&&v.sel.indexOf(id)<0&&!v.excl[id];}
  if(!Object.keys(F).length)return out;
  meaningsOf(P,v.pt).forEach(function(d){var n=needOf(P,d);if(!n.length)return;if(v.excl[d]||n.every(function(c){return v.sel.indexOf(c)>=0;})||!n.some(function(c){return off.indexOf(c)>=0;}))return;
    add(d);n.forEach(function(c){if(miss(c))add(c);});});
  v.pt.items.forEach(function(it){if(miss(it.id))add(it.id);});return out;}
function sessionNote(P,S,extra){var v=sessionView(P,S),by=v.pt.by,lines=[P.name];function nm(x){return by[x]?by[x].name:x;}
  var path=stepsOf(S).slice(1).filter(function(st){return st.p.length||st.d.length;}).map(function(st){return st.p.map(nm).join(', ')+(st.d.length?' (pois: '+st.d.map(nm).join(', ')+')':'');});
  if(S.date)lines.push('Päivä: '+fiDate(S.date));
  var pre=stepsOf(S)[0].p.filter(function(x){return x!==ALKU&&by[x]&&by[x].k==='b';});if(pre.length)lines.push('Päivän muistiinpanoista: '+pre.map(nm).join(', '));
  if(path.length)lines.push('Valinnat: '+path.join(' → '));
  var gs=sessionGroups(P,S,v.pt);if(gs.length)lines.push('Ryhmät: '+gs.map(nm).join(', '));
  if(P.end==='hoid'){var ok=v.sel.filter(function(x){return by[x]&&by[x].k==='b';}),ho=hoidettavat(P,S);if(ok.length)lines.push('Kunnossa: '+ok.map(nm).join(', '));
    if(ho.length)lines.push('Hoidettavat: '+ho.map(function(h,i){return (i+1)+'. '+nm(h.id)+(h.jotta.length?' (jotta '+h.jotta.map(nm).join(', ')+')':'');}).join(', '));}
  var fm=flipMissing(P,S);if(fm.length)lines.push('Puuttuu:\n'+fm.join('\n'));
  var tx=S.log.filter(function(t){return by[t];}).map(function(t){return bodyText(by[t].body);});
  var out=lines.join('\n');if(tx.length)out+='\n\n'+tx.join('\n\n');if(clean(extra))out+='\n\n'+String(extra).trim();
  return out;}
/* Nimen vaihto tai poisto: säännöt ja ryhmittelyt seuraavat */
function renameKey(P,a,b){if(a===b)return;var R=P.rules||{};
  if(R[a]){var r=ruleOf(P,b);R[a].o.forEach(function(x){if(r.o.indexOf(x)<0&&x!==b)r.o.push(x);});R[a].x.forEach(function(x){if(r.x.indexOf(x)<0&&x!==b)r.x.push(x);});delete R[a];}
  Object.keys(R).forEach(function(k){['o','x'].forEach(function(f){var l=R[k][f],i=l.indexOf(a);if(i>=0){if(l.indexOf(b)<0&&k!==b)l[i]=b;else l.splice(i,1);}});});
  (P.mx||[]).forEach(function(set){var i=set.indexOf(a);if(i>=0){if(set.indexOf(b)<0)set[i]=b;else set.splice(i,1);}});
  P.mx=(P.mx||[]).filter(function(s){return s.length>1;});
  if(P.imp){var ii=P.imp.indexOf(a);if(ii>=0){if(P.imp.indexOf(b)<0)P.imp[ii]=b;else P.imp.splice(ii,1);}}
  [P.need||{},P.order||{}].forEach(function(N){if(N[a]){if(!N[b])N[b]=N[a];delete N[a];}
  Object.keys(N).forEach(function(k){var l=N[k],i=l.indexOf(a);if(i>=0){if(l.indexOf(b)<0&&k!==b)l[i]=b;else l.splice(i,1);}});});
}
function removeKey(P,a){var R=P.rules||{};delete R[a];
  Object.keys(R).forEach(function(k){R[k].o=R[k].o.filter(function(x){return x!==a;});R[k].x=R[k].x.filter(function(x){return x!==a;});if(!R[k].o.length&&!R[k].x.length)delete R[k];});
  P.mx=(P.mx||[]).map(function(s){return s.filter(function(x){return x!==a;});}).filter(function(s){return s.length>1;});
  if(P.imp)P.imp=P.imp.filter(function(x){return x!==a;});
  [P.need||{},P.order||{}].forEach(function(N){delete N[a];Object.keys(N).forEach(function(k){N[k]=N[k].filter(function(x){return x!==a;});});});}
/* Rivin siirto: vaihtaa paikkaa edellisen tai seuraavan asian kanssa (tyhjät rivit ja kommentit pysyvät paikallaan) */
function moveItem(text,id,dir){var pt=parseText(text),i=-1;pt.items.forEach(function(it,k){if(it.id===id)i=k;});var j=i+dir;
  if(i<0||j<0||j>=pt.items.length)return text;var l=String(text||'').split(/\r?\n/),a=pt.items[i].line,b=pt.items[j].line,x=l[a];l[a]=l[b];l[b]=x;return l.join('\n');}
/* Nappulan nimi näytölle: tavuviivan jälkeen rivinvaihto samassa nappulassa */
function shownName(n){return String(n||'').replace(/-(?=\S)/g,'-\n');}
function replaceLine(text,n,line){var l=String(text||'').split(/\r?\n/);if(line===null)l.splice(n,1);else l[n]=line;return l.join('\n');}
/* Säännöt, jotka viittaavat nimiin, joita tekstikentässä ei enää ole */
function orphans(P){var by=parseText(P.text).by,out={};
  Object.keys(P.rules||{}).forEach(function(k){if(k!==ALKU&&!by[k])out[k]=1;rl(P,k).o.concat(rl(P,k).x).forEach(function(x){if(!by[x])out[x]=1;});});
  (P.mx||[]).forEach(function(s){s.forEach(function(x){if(!by[x])out[x]=1;});});
  Object.keys(P.need||{}).forEach(function(k){if(!by[k])out[k]=1;needOf(P,k).forEach(function(x){if(!by[x])out[x]=1;});});
  Object.keys(P.order||{}).forEach(function(k){if(!by[k])out[k]=1;orderOf(P,k).forEach(function(x){if(!by[x])out[x]=1;});});
  (P.imp||[]).forEach(function(x){if(!by[x])out[x]=1;});
  return Object.keys(out);}
function dropOrphans(P){orphans(P).forEach(function(k){removeKey(P,k);});}

/* ---- muistiinpanot: termit ----
   Termi = {name, yes:[sanoja], no:[sanoja]}. Sana tai lause on yksi rivi (välilyönti kuuluu sanaan). Vertailussa isot ja pienet
   kirjaimet ovat samat ja välimerkit katoavat (ne pysyvät muistiinpanossa). Sana löytyy osana mistä kohdasta tahansa
   (Emil 21.10.2026): "koir" löytää koirien ja kotikoiran. Termin nimi lasketaan itsestään kyllä-sanaksi. Poissulku voittaa. */
function normT(s){return ' '+String(s==null?'':s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()+' ';}
/* Lyhyt oma nimi (alle 3 kirjainta, esim. JO) tunnistuu vain kokonaisena sanana (Emil 22.10.2026, 1.43): ”jo” ei osu sanaan ”jokainen”. Merkki WW alussa = kokonainen sana. */
var WW='\u0001';
function hasWord(text,p){var whole=p.charAt(0)===WW,w=normT(whole?p.slice(1):p).trim();if(!w)return false;var t=typeof text==='string'?normT(text):text.n;return t.indexOf(whole?' '+w+' ':w)>=0;}
/* Termien osumat tekstissä alkuperäisinä kohtina {s,e,id}, laajennettuna koko sanaan. Vain termit, jotka ovat päällä. */
var LETTER=/[\p{L}\p{N}]/u;
function termHits(terms,text){var SP=sepParts(text);if(SP){var all=[];SP.forEach(function(p){termHits(terms,p.t).forEach(function(h){all.push({s:h.s+p.s,e:h.e+p.s,id:h.id});});});return all.sort(function(a,b){return a.s-b.s||b.e-a.e;});}
  text=String(text||'');var n='',map=[],sp=true;
  for(var i=0;i<text.length;i++){var ch=text.charAt(i);if(LETTER.test(ch)){var lo=ch.toLowerCase();if(lo.length!==1)lo=ch;n+=lo;map.push(i);sp=false;}else if(!sp){n+=' ';map.push(i);sp=true;}}
  var T={n:' '+n.trim()+' '},out=[];
  (terms||[]).forEach(function(t){if(!termOn(t,T))return;termWords(t).forEach(function(w){var whole=w.charAt(0)===WW;w=normT(whole?w.slice(1):w).trim();if(!w)return;
    for(var k=n.indexOf(w);k>=0;k=n.indexOf(w,k+1)){if(whole&&((k>0&&n.charAt(k-1)!==' ')||(k+w.length<n.length&&n.charAt(k+w.length)!==' ')))continue;var s0=map[k],e0=map[k+w.length-1]+1;while(s0>0&&LETTER.test(text.charAt(s0-1)))s0--;while(e0<text.length&&LETTER.test(text.charAt(e0)))e0++;out.push({s:s0,e:e0,id:t.id});}});});
  return out.sort(function(a,b){return a.s-b.s||b.e-a.e;});}
/* Päätöspuun palikan nimi toimii terminä vasta vähintään 3 kirjaimella (Emil 21.10.2026), muuten se osuisi melkein joka sanaan */
function termWords(t){var sh=normT(t.name).replace(/ /g,'').length<3,nm=t.auto&&sh?[]:[sh?WW+t.name:t.name];return nm.concat(t.also||[],t.yes||[],t.tyes||[]);}
function termOn(term,text){if(typeof text==='string')text={n:normT(text)};
  var yes=termWords(term).some(function(w){return hasWord(text,w);});
  if(!yes)return false;return !(term.no||[]).concat(term.tno||[]).some(function(w){return hasWord(text,w);});}
/* Päätöspuiden rivit termeinä: jokaisen nappulan, ilmoituksen ja ryhmän nimi on termi kaikista projekteista
   (sama nimi kerran). Sanat tallessa nimen avaimella words[avain]={yes,no}. Samanniminen oma termi korvaa. */
/* Termilohkojen sanat kaikista puista nimen avaimella {name,yes,no,projs}. Sanat lasketaan yhteen. */
function blockTerms(projects){var bt={};(projects||[]).forEach(function(P){blocksOf(P.text).forEach(function(b){var k=keyOf(b.name),x=bt[k]||(bt[k]={name:b.name,yes:[],no:[],projs:[]});
  b.yes.forEach(function(w){if(x.yes.indexOf(w)<0)x.yes.push(w);});b.no.forEach(function(w){if(x.no.indexOf(w)<0)x.no.push(w);});if(x.projs.indexOf(P.name)<0)x.projs.push(P.name);});});return bt;}
/* Omat termit + niiden lohkosanat (kopioina, alkuperäiset ennallaan) */
function withText(manual,projects){var bt=blockTerms(projects);return (manual||[]).map(function(t){var b=bt[keyOf(t.name)];if(!b)return t;var c={};Object.keys(t).forEach(function(k){c[k]=t[k];});c.tyes=b.yes;c.tno=b.no;return c;});}
function autoTerms(projects,words,manual){var out=[],seen={},bt=blockTerms(projects);(manual||[]).forEach(function(t){seen[keyOf(t.name)]=1;});
  (projects||[]).forEach(function(P){parseText(P.text).items.forEach(function(it){if(seen[it.id])return;if(it.k==='t'&&it.body===it.name&&it.name.length>40)return;seen[it.id]=1;
    var w=(words&&words[it.id])||{};var tm={id:'a:'+it.id,key:it.id,name:it.name,yes:strs(w.yes),no:strs(w.no),auto:true,kind:it.k,proj:P.name};
    /* Apukysymys nousee esiin muistiinpanosta oletuksena, muut vain valittaessa */
    tm.pop=typeof w.pop==='boolean'?w.pop:it.k==='q';if(w.cal===true)tm.cal=true;termExtra(tm,w);if(it.k==='q')tm.ask=clean(bodyText(it.body));
    if(it.k==='t'&&it.body!==it.name){var f=clean(bodyText(it.body).split('\n\n')[0]);if(f)tm.also=[f];} // ilmoitus tunnistuu myös tekstistään, joka on kierroksen muistiinpanossa
    if(bt[it.id]){tm.tyes=bt[it.id].yes;tm.tno=bt[it.id].no;}
    out.push(tm);});});
  /* Kääntöpuolen teksti on termi (Emil 21.10.2026): se perii palikkansa tärkeyden */
  (projects||[]).forEach(function(P){var F=rulesOf(P.text).flip;Object.keys(F).forEach(function(src){F[src].forEach(function(txt){var k=keyOf(txt);if(seen[k])return;seen[k]=1;var w=(words&&words[k])||{};
    out.push({id:'k:'+k,key:k,name:txt,yes:strs(w.yes),no:strs(w.no),auto:true,kind:'k',proj:P.name,pop:w.pop===true,cal:w.cal===true});});});});
  /* Lohko, joka ei ole palikka eikä oma termi, on uusi termi (Emil 21.10.2026) */
  Object.keys(bt).forEach(function(k){if(seen[k])return;seen[k]=1;var b=bt[k],w=(words&&words[k])||{};
    out.push({id:'x:'+k,key:k,name:b.name,yes:strs(w.yes),no:strs(w.no),tyes:b.yes,tno:b.no,auto:true,kind:'x',proj:b.projs.join(', '),pop:w.pop===true,cal:w.cal===true});});
  out.forEach(function(t){termExtra(t,(words||{})[t.key]||{});});return out;}
/* Termit tekstinä: omat termit ja puiden termien sanat lohkoina "=Nimi:" (sanat riveittäin, "!" poissulkeva).
   Lukiessa lohko korvaa termin sanat; puuttuva lohko tyhjentää ne (termi jää). Uusi nimi: palikan termi tai uusi oma termi. */
function termsToText(terms,words,names,opt){var out=[],B={},ord=[];opt=opt||{};var st={};(opt.stars||[]).forEach(function(n){st[keyOf(n)]=1;});
  function blk(n,y,x){var k=keyOf(n);if(B[k])return;B[k]=['='+n+(st[k]&&!opt.plain?'*':'')+':'].concat(y||[],(x||[]).map(function(w){return '!'+w;})).join('\n');ord.push(k);}
  (terms||[]).forEach(function(t){blk(t.name,t.yes,t.no);});
  Object.keys(words||{}).forEach(function(k){var w=words[k];if((w.yes||[]).length||(w.no||[]).length)blk((names&&names[k])||k,w.yes,w.no);});
  /* Tähdelliset ensin tärkeysjärjestyksessä (myös puun palikat ilman omia sanoja), sitten muut */
  (opt.stars||[]).forEach(function(n){if(!B[keyOf(n)])blk(n,[],[]);});
  var sk=(opt.stars||[]).map(keyOf);ord=sk.filter(function(k,i){return B[k]&&sk.indexOf(k)===i;}).concat(ord.filter(function(k){return sk.indexOf(k)<0;}));
  out=ord.map(function(k){return B[k];});
  if(opt.ehdot&&opt.ehdot.length)out.push(['Ehdot:'].concat(ehdotText(opt.ehdot)).join('\n'));
  return out.join('\n\n');}
/* 1.70 (Emil 23.10.2026): sama teksti kertoo myös tärkeät ja ehdot. "=Nimi*:" = tärkeä, tähdellisten järjestys tekstissä = tärkeysjärjestys.
   Osio "Ehdot:" (tekstin loppuun tai seuraavaan =-lohkoon), rivit muotoa "Kun A ja B, niin X esiin, Y pois." ("tai" = jokin näistä; ilman
   sanaa esiin/pois = esiin). Nimet tunnistetaan ensin tunnetuista nimistä (pisin ensin), joten nimessä saa olla "ja"; muuten jaetaan sanoista. */
function ehTok(str,names){var s0=clean(str),out=[],ops=[],low=s0.toLowerCase(),i=0,N=(names||[]).map(function(n){return clean(n);}).filter(Boolean).sort(function(a,b){return b.length-a.length;});
  while(i<s0.length){var hit=null;for(var j=0;j<N.length;j++){var n=N[j].toLowerCase();if(low.substr(i,n.length)===n){var rest=low.slice(i+n.length);if(!rest||/^\s+(ja|tai)\s+/.test(rest)||/^\s*$/.test(rest)){hit=s0.substr(i,n.length);break;}}}
    if(!hit){var m=/^(.*?)(\s+(ja|tai)\s+|$)/i.exec(s0.slice(i));hit=m[1];}
    if(clean(hit))out.push(clean(hit));i+=hit.length;var mo=/^\s+(ja|tai)\s+/i.exec(s0.slice(i));if(mo){ops.push(mo[1].toLowerCase());i+=mo[0].length;}else break;}
  return {items:out,all:ops.length>0&&ops.every(function(o){return o==='ja';})};}
function textExtras(txt,names){var L=String(txt||'').split(/\r?\n/),body=[],stars=[],order=[],E=null,inE=false,blk=false;
  L.forEach(function(line){var t=line.trim(),m;
    if(t.slice(0,3)==='```')return;
    if(/^ehdot\s*:\s*$/i.test(t)){inE=true;E=E||[];return;}
    if(inE&&t.charAt(0)==='=')inE=false;
    if(inE&&(m=/^poissulkevat\s*:\s*(.+?)\.?$/i.exec(t))){var px={k:[],on:[],off:[],ty:'x'};m[1].split(',').forEach(function(part){ehTok(part,names).items.forEach(function(x){if(px.k.indexOf(x)<0)px.k.push(x);});});if(px.k.length>1)E.push(px);return;}
    if(inE){if((m=/^kun\s+(.+?)\s*,\s*niin\s+(.+?)\.?$/i.exec(t))){var k=ehTok(m[1],names),e={k:k.items,on:[],off:[]};if(k.all&&k.items.length>1)e.all=1;
        m[2].split(',').forEach(function(part){var q=/^(.*?)\s+(esiin|pois)$/i.exec(clean(part)),nm=q?q[1]:clean(part),w=q&&q[2].toLowerCase()==='pois'?'off':'on';
          ehTok(nm,names).items.forEach(function(x){if(e[w].indexOf(x)<0)e[w].push(x);});});
        if(e.k.length&&(e.on.length||e.off.length))E.push(e);return;}if(!t)return;inE=false;}
    if(!t){blk=false;body.push(line);return;}
    if((m=/^=(.*?)\s*\*+\s*:(.*)$/.exec(t))&&clean(m[1])){stars.push(clean(m[1]));order.push(clean(m[1]));body.push('='+clean(m[1])+':'+m[2]);blk=true;return;}
    if((m=/^=([^:]+):/.exec(t))){if(clean(m[1]))order.push(clean(m[1]));blk=true;body.push(line);return;}
    if(blk||t.slice(0,2)==='//'){body.push(line);return;}
    /* Pelkkä nimi lohkon ulkopuolella (myös "=Nimi" ilman kaksoispistettä) on asiasana; tähti perässä = tärkeä */
    var nm=clean(t.replace(/^=/,'')),st=/\*+$/.test(nm);nm=clean(nm.replace(/\s*\*+$/,''));if(!nm)return;if(st)stars.push(nm);order.push(nm);body.push('='+nm+':');body.push('');});
  return {body:body.join('\n'),stars:stars,order:order,ehdot:E};}
/* 1.78: samojen syiden Tuo- ja Poissulkee-ehdot yhdelle riville, kuten ennen */
function ehdotText(E){var M=[],ix={};(E||[]).forEach(function(e){if(e.ty==='x'){M.push(e);return;}var key=JSON.stringify([e.k,e.all?1:0]);if(ix[key]===undefined){ix[key]=M.length;M.push({k:e.k,all:e.all,on:e.on.slice(),off:e.off.slice()});return;}
    var m=M[ix[key]];e.on.forEach(function(x){if(m.on.indexOf(x)<0)m.on.push(x);});e.off.forEach(function(x){if(m.off.indexOf(x)<0)m.off.push(x);});});E=M;return (E||[]).filter(function(e){return e.k.length&&(e.ty==='x'?e.k.length>1:e.on.length||e.off.length);}).map(function(e){if(e.ty==='x')return 'Poissulkevat: '+e.k.join(', ')+'.';var r=e.on.map(function(n){return n+' esiin';}).concat(e.off.map(function(n){return n+' pois';}));
  return 'Kun '+e.k.join(e.all?' ja ':' tai ')+', niin '+r.join(', ')+'.';});}
function termsFromText(txt,D,names){var bs={},ks=[];blocksOf(txt).forEach(function(b){var k=keyOf(b.name),x=bs[k];if(!x){x=bs[k]={name:b.name,yes:[],no:[]};ks.push(k);}
    b.yes.forEach(function(w){if(x.yes.indexOf(w)<0)x.yes.push(w);});b.no.forEach(function(w){if(x.no.indexOf(w)<0)x.no.push(w);});});
  (D.terms||[]).forEach(function(t){var b=bs[keyOf(t.name)];t.yes=b?b.yes:[];t.no=b?b.no:[];if(b)b.done=1;});
  Object.keys(D.words||{}).forEach(function(k){var w=D.words[k],b=bs[k];if(b&&!b.done){w.yes=b.yes;w.no=b.no;b.done=1;}else{w.yes=[];w.no=[];}
    if(!w.yes.length&&!w.no.length&&typeof w.pop!=='boolean'&&!w.cal&&!hasRenew(w)&&!durOf(w,0)&&!(typeof w.info==='string'&&clean(w.info)))delete D.words[k];});
  ks.forEach(function(k){var b=bs[k];if(b.done)return;
    if(names&&names[k]){if(b.yes.length||b.no.length)D.words[k]={yes:b.yes,no:b.no};}
    else D.terms.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:b.name.slice(0,60),yes:b.yes,no:b.no});});
  return D;}
/* Tekoälyohje (Emil 26.10.2026, 1.92): kopioitava ohje, jolla mikä tahansa tekoäly osaa tehdä Asiat tekstinä -muotoa. Esimerkin tulkinta
   lasketaan samalla jäsentimellä (textExtras, blocksOf, ehdotText) kuin tuonti, ja aikasanat ja viikonpäivät tulevat TIME_TERMS- ja WD_TERMS-luetteloista, joten ohje pysyy
   ajan tasalla. ctx = {text: projektin nykyinen teksti, grp: ryhmien nimet}. */
var AI_ESIM='Kuume\n=Kipu:\nkipu\nsärky\n!ei kipua\n\n=Lääkäri:\nlääkär\nvastaanot\n\nLepo\nLenkki\nApteekki\n\nEhdot:\nKun Kipu ja Kuume, niin Lääkäri esiin, Lenkki pois.\nKun Kuume tai #Oireet, niin Lepo esiin.\nKun Myöhässä tai Perjantai, niin Apteekki esiin.\nKun "rokot", niin Lääkäri esiin.\nPoissulkevat: Lepo, Lenkki.';
function aiOhje(ctx){ctx=ctx||{};var tn=TIME_TERMS.map(function(t){return t.name;}),wd=WD_TERMS.map(function(t){return t.name;}),nm=['Kipu','Kuume','Lääkäri','Lepo','Lenkki','Apteekki','#Oireet'].concat(tn,wd),
    X=textExtras(AI_ESIM,nm),B=blocksOf(X.body),q=function(a){return a.join(', ');},sel=[];
  B.forEach(function(b){sel.push('- Asiasana '+b.name+(b.yes.length?': tunnistuu sanoista '+q(b.yes):': ei omia sanoja, tunnistuu nimestään')+(b.no.length?'; estyy, jos tekstissä on '+q(b.no):'')+'.');});
  if(X.order.length)sel.push('- Järjestys tärkeimmästä alkaen: '+q(X.order)+'.');
  (X.ehdot||[]).forEach(function(e,i){var r=ehdotText([e])[0];
    if(e.ty==='x'){sel.push('- "'+r+'" Kun yksi näistä on kuitattu, muut jäävät pois.');return;}
    sel.push('- "'+r+'" Kun '+(e.k.length>1?(e.all?'kaikki ('+q(e.k)+') ovat':'jokin ('+q(e.k)+') on'):e.k[0]+' on')+' totta, '+
      [e.on.length?q(e.on)+' tulee esiin':'',e.off.length?q(e.off)+' jää pois':''].filter(Boolean).join(' ja ')+'.');});
  var cur=String(ctx.text||'').trim();
  return ['# Ohje: Juuri-appin asiasanat, tärkeysjärjestys ja ehdot tekstinä','',
  'Autat minua suunnittelemaan sisältöä Juuri-appiin. Et tunne appia ennestään, joten tässä kaikki tarvittava.','',
  '## Mikä Juuri on',
  'Juuri on puhelinappi muistiinpanoille, kalenterille ja tarkistuslistoille. Muistiinpano on vapaata tekstiä. Appi tunnistaa tekstistä ajat (kalenteriin) ja asiasanat. Asiasana on lyhyt nimi asialle, esimerkiksi Kipu tai Kauppa. Listoissa kuitataan asiasanoja. Tärkeysjärjestys määrää, missä järjestyksessä asiat näkyvät ja tulevat vuoroon. Ehdot ovat syy–seuraus-sääntöjä: kun asia 1 on totta (asiasana kuitattu listassa tai mainittu muistiinpanossa), asia 2 tulee esiin tai jää pois.','',
  '## Muoto',
  '- Pelkkä nimi omalla rivillään on asiasana.',
  '- Asiasanojen järjestys tekstissä on tärkeysjärjestys: ylin on tärkein. Kaikki asiat ovat tärkeitä, järjestys ratkaisee. Kirjoita siis asiat ylhäältä alas tärkeysjärjestyksessä.',
  '- =Nimi: aloittaa lohkon. Lohkon riveillä ovat sanat, joista appi tunnistaa asiasanan muistiinpanosta. Osa sanaa riittää mistä kohdasta tahansa, joten käytä taipumatonta alkua: koir löytää sanat koira, koirien ja kotikoira. Nimi itse tunnistuu aina.',
  '- !sana lohkon rivillä on poissulkeva sana: jos se on tekstissä, asiasanaa ei tunnisteta.',
  '- Tyhjä rivi päättää lohkon.',
  '- Ehdot: omalla rivillään aloittaa ehdot. Ne jatkuvat tekstin loppuun tai seuraavaan =-lohkoon, yksi ehto riville:',
  '  Kun <syyt>, niin <seuraus> esiin, <seuraus> pois.',
  '  - ja syiden välissä = kaikki tarvitaan, tai = jokin riittää. Samassa ehdossa ei voi olla sekä ja että tai: kirjoita silloin kaksi riviä.',
  '  - esiin tai pois tulee seurauksen perään. Ilman sanaa seuraus tulee esiin. Useampi seuraus pilkuilla erotettuna.',
  '  - Syynä käyvät asiasana, ryhmä #Nimi (toteutuu jäsentensä kuittauksista; jäsenet valitaan appissa), aikasanat '+q(tn)+' (jonkin listarivin aika on nyt sellainen), viikonpäivät '+q(wd)+' (totta, kun muistiinpanon aika osuu sille päivälle, esim. perjantaina tai perjantaisin; jatkuvalla listalla sinä päivänä; samanniminen oma asiasana voittaa) ja teksti lainausmerkeissä "sana". Seurauksena asiasana tai teksti lainausmerkeissä.',
  '  - Poissulkevat: A, B, C. on oma lajinsa: kun yksi on kuitattu, muut jäävät pois. Vähintään kaksi nimeä.',
  '- Ehdon uusi nimi luo asiasanan. Älä käytä nimissä sanoja ja tai tai, äläkä pilkkuja tai kaksoispisteitä. Saman ehdon ristiriidan (sama syy tuo ja vie saman asian) appi hylkää.','',
  '## Esimerkki','```',AI_ESIM,'```','','Appi lukee esimerkin näin:'].concat(sel,['',
  '## Miten vastaat',
  '- Suunnittele kanssani ensin, mitä asiasanoja, tärkeysjärjestystä ja ehtoja tarvitsen. Kysy, jos jokin on epäselvää.',
  '- Kun teksti on valmis, anna se yhtenä koodilohkona (```) ilman muuta sisältöä lohkon sisällä. Liitän sen appin kohtaan Valikko → Asiat tekstinä ja painan Valmis.',
  '- Teksti on totuus: se korvaa appin kaikki asiasanojen sanat, järjestyksen ja ehdot. Palauta siis aina koko teksti, myös se, mitä ei muuteta. Asiasanaa, joka puuttuu tekstistä, ei poisteta, mutta sen sanat poistuvat ja se siirtyy järjestyksen loppuun.',
  '- Kirjoita nimet ja sanat samalla kielellä kuin minä. Pidä nimet lyhyinä.','',
  '## Nykyinen sisältö'],
  cur?['Tämä on appissani nyt. Muokkaa tätä ja palauta kokonaisena:','```',cur,'```']:['Appissa ei ole vielä asiasanoja. Aloitetaan tyhjästä.'],
  (ctx.grp&&ctx.grp.length)?['','Ryhmät, joita voi käyttää syinä: '+ctx.grp.map(function(g){return '#'+g;}).join(', ')+'.']:[]).join('\n');}
/* Esiin nousevat: termit, joilla pop ja jotka osuvat tekstiin. Kysymys = apukysymyksen teksti tai termin nimi. */
/* Asiasanat lisäävät tekstiä muistiinpanoon (Emil 22.10.2026): puu, jolla on asetus notes:'on', toimii muistiinpanossa kuten kierroksella.
   Tunnistetut palikat ovat valittuja; avaa-, vaatii kaikki- ja sulkee-säännöt (sama rakentaminen kuin päätöspuussa) kertovat,
   mitkä ilmoitukset tulevat näkyviin. Niiden tekstit kirjoitetaan muistiinpanon loppuun otsikon ADD_H alle. Sulkeutuva joukko: ei silmukkaa. */
var ADD_H='◆ Lisätty asiasanoista';
function noteAdds(P,keys){var pt=parseText(P.text),S={},open={},X={},ch=true;(keys||[]).forEach(function(k){if(pt.by[k]){S[k]=1;open[k]=1;}});
  while(ch){ch=false;Object.keys(open).forEach(function(s){var r=rl(P,s);r.x.forEach(function(x){X[x]=1;});
      r.o.forEach(function(o){if(!open[o]&&!X[o]&&pt.by[o]){open[o]=1;ch=true;}});});
    pt.items.forEach(function(it){var n=needOf(P,it.id);if(n.length&&!open[it.id]&&!X[it.id]&&n.every(function(x){return open[x];})){open[it.id]=1;ch=true;}});}
  return pt.items.filter(function(it){return it.k==='t'&&open[it.id]&&!X[it.id]&&!S[it.id];}).map(function(it){return bodyText(it.body);});}
/* Lisäysosio tekstin lopussa: tyhjä rivi, otsikko, tekstit. Osio päättyy tekstin loppuun tai ▸-riviin. Lasketaan uudelleen joka muutoksella. */
function splitAdds(text){var L=String(text||'').split('\n'),i=-1;for(var k=0;k<L.length;k++)if(clean(L[k])===ADD_H){i=k;break;}
  if(i<0)return {base:String(text||''),after:[]};var j=i+1;while(j<L.length&&L[j].slice(0,2)!=='▸ ')j++;var base=L.slice(0,i).join('\n');if(base.slice(-1)==='\n')base=base.slice(0,-1);
  return {base:base,after:L.slice(j)};}
function applyAdds(text,projects,terms){var sp=splitAdds(text),trees=(projects||[]).filter(function(P){return P.notes==='on';});if(!trees.length)return sp.after.length?sp.base+'\n\n'+sp.after.join('\n'):sp.base;
  /* Kasvava joukko: lisätty teksti voi laukaista lisää, mutta ei poistaa jo tullutta (muuten osio värähtelisi, esim. lisätty sana sulkisi pois oman lähteensä) */
  var cur=sp.base,out=[],n=0;while(n++<8){var keys=noteTerms(terms,cur).filter(function(id){return id.slice(0,2)==='a:';}).map(function(id){return id.slice(2);}),grew=false;
    trees.forEach(function(P){noteAdds(P,keys).forEach(function(t){if(out.indexOf(t)<0){out.push(t);grew=true;}});});
    cur=out.length?sp.base+(sp.base?'\n\n':'')+ADD_H+'\n'+out.join('\n\n'):sp.base;if(!grew)break;}
  return sp.after.length?cur+'\n\n'+sp.after.join('\n'):cur;}
function popTerms(terms,text){return (terms||[]).filter(function(t){return t.pop&&termInText(t,text);});}
/* Vastaukset muistiinpanon lopussa: rivi "▸ Kysymys" ja vastaus sen alla seuraavaan ▸-riviin asti */
function ansIdx(L,q){var h='▸ '+clean(q);for(var i=0;i<L.length;i++)if(clean(L[i])===h)return i;return -1;}
function ansEnd(L,i){var j=i+1;while(j<L.length&&L[j].slice(0,2)!=='▸ ')j++;return j;}
function getAnswer(text,q){var L=String(text||'').split('\n'),i=ansIdx(L,q);if(i<0)return null;return L.slice(i+1,ansEnd(L,i)).join('\n').replace(/\s+$/,'');}
function setAnswer(text,q,ans){var L=String(text||'').split('\n'),i=ansIdx(L,q),h='▸ '+clean(q);ans=String(ans||'').replace(/\s+$/,'');
  if(i<0)return ans?String(text||'').replace(/\s+$/,'')+(String(text||'').trim()?'\n\n':'')+h+'\n'+ans:String(text||'');
  var before=L.slice(0,i),after=L.slice(ansEnd(L,i));while(before.length&&!before[before.length-1].trim())before.pop();
  var mid=ans?(before.length?['']:[]).concat([h],ans.split('\n')):[];return before.concat(mid,after.length&&(before.length||mid.length)?['']:[],after).join('\n');}
/* Tekstit (Emil 26.10.2026, 1.91): muistiinpano jakautuu teksteihin erottimen kohdalta, omalla rivillä tai kesken tekstin. Erotin = vähintään
   kolme viivaa peräkkäin; pitkä viiva (—) lasketaan kahdeksi, koska iPhone tekee kahdesta viivasta pitkän. Tyhjä rivi ei erota.
   Asiasanat ja ajat tunnistetaan teksti kerrallaan, eivätkä ne periydy. Tekstejä ei tallenneta: ne lasketaan aina tekstistä, joten erottimen
   lisäys tai poisto ei hukkaa kuittauksia (pts on avattu päivästä ja ajasta) eikä lukkoja (haetaan sanasta).
   sepParts: null, jos erotinta ei ole; muuten [{s,e,t}] ilman reunojen välilyöntejä, tyhjät pois. */
function sepParts(text){text=String(text||'');var out=[],re=/[-\u2010-\u2015]+/g,m,at=0,any=false;
  function push(a,b){while(a<b&&/\s/.test(text.charAt(a)))a++;while(b>a&&/\s/.test(text.charAt(b-1)))b--;if(b>a)out.push({s:a,e:b,t:text.slice(a,b)});}
  while((m=re.exec(text))){var w=0;for(var i=0;i<m[0].length;i++)w+=/[\u2014\u2015]/.test(m[0].charAt(i))?2:1;if(w<3)continue;any=true;push(at,m.index);at=m.index+m[0].length;}
  if(!any)return null;push(at,text.length);return out;}
function noteParts(text){return sepParts(text)||[{s:0,e:String(text||'').length,t:String(text||'')}];}
/* Ajankohdan teksti: sen tekstin indeksi, jossa ajan ilmaus on (kentän päivä ja kalenterin kohta ensimmäiseen) */
function partIx(P,o){var k=0;if(!o||o.s===undefined)return 0;for(var i=0;i<P.length;i++)if(P[i].s<=o.s)k=i;return k;}
/* Yksi teksti muistiinpanon kaltaisena: oma teksti ja vain sen ajat; kuittaukset (pts) samat kuin muistiinpanolla */
function partNote(N,i,today){var P=sepParts(N&&N.text);if(!P||!P[i])return N;var D=noteDates(N).filter(function(o){return partIx(P,o)===i;}),dn=N.done;
  if(today){var at=partAt(N,i,today);dn=at&&isoD(new Date(at))<today?at:undefined;}
  return {id:N.id,created:N.created,edited:N.edited,text:P[i].t,pts:N.pts,done:dn,arch:N.arch,nl:N.nl,_ds:D,_pi:i};}
/* ---- 1.102 (Emil 31.10.2026): sanalinkit muistiinpanojen välille ----
   Sanan avain = k (oletus 5) ensimmäistä kirjainta; lyhyempi sana (3..k-1 kirjainta) vain kokonaisena, alle 3 ei koskaan.
   Linkki syntyy, kun sama avain on jossain toisessa arkistoimattomassa muistiinpanossa. Esto: valmis lista (sanan avaimena, joten olisi estää myös olisivat),
   yleisyysraja (avain yli 30 %:ssa muistiinpanoista ja vähintään 6:ssa) ja oma lista; oma sallinta ohittaa molemmat. */
var WL_STOP=('että mutta koska kuin kun sitten joka jotka jonka joita jossa josta johon mikä mitä mitään mikään missä mistä mihin miksi miten milloin kuka ketä '+
  'tämä tämän tässä tästä tähän tätä nämä näitä näiden näissä niin myös vain ehkä aina kaikki kaiken kaikkia kaikille joku jotain jotakin jotenkin joten vaikka kanssa '+
  'ollut olla olen olet olin olit oli olisi olisin olisit olemme olette ovat olivat olleet olleen ollaan oltava olevan oleva on ei en et emme ette eivät eikä enää jopa vielä jälkeen ennen '+
  'kautta välillä itse hänen heidän meidän teidän minun sinun minä sinä hän me te he mä sä se ne sen niiden niitä niissä niistä niihin siis sitä siinä siitä siihen sille sillä '+
  'siellä sinne sieltä täällä tänne täältä tuo tuon tuota tuossa tuolla noin näin kuten taas sekä kuitenkin melko aika ihan vähän paljon hyvin tosi vaan jos tai ja koko '+
  'voi voisi voida voin voit voisin pitää pitäisi pitänyt täytyy tarvitsee saa saada sain sai saisi tulee tulla tuli menee mennä meni tehdä tehnyt tekee teen tein '+
  'yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän kymmenen toinen toisen toista ensin ensi viime nyt heti jo yhä taas uudestaan '+
  'tänään huomenna eilen ylihuomenna kello').split(' ');
function wlKey(w,k){w=String(w||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');k=k||5;if(w.length<3||/^\p{N}+$/u.test(w))return '';return w.length>=k?w.slice(0,k):'='+w;}
function wlWords(text){var out=[],t=String(text||''),re=/[\p{L}\p{N}]+/gu,m;while((m=re.exec(t)))out.push({s:m.index,e:m.index+m[0].length,w:m[0]});return out;}
function wlSet(str,k){var o={};String(str||'').split(/[\s,;]+/).forEach(function(w){var q=wlKey(w,k);if(q)o[q]=1;});return o;}
/* Asetukset cfg: wl ('off' = pois), wlk ('4'/'5'), wlno ja wlyes (sanoja välilyönnein tai riveittäin) */
function wlEnabled(cfg){return !cfg||cfg.wl!=='off';}
function wlOpt(cfg){cfg=cfg||{};var k=cfg.wlk==='4'?4:5,stop={};WL_STOP.forEach(function(w){var q=wlKey(w,k);if(q)stop[q]=1;});return {on:wlEnabled(cfg),k:k,stop:stop,no:wlSet(cfg.wlno,k),yes:wlSet(cfg.wlyes,k)};}
function wlOk(w,O){var key=wlKey(w,O.k);if(!key)return '';if(O.yes[key])return key;if(O.no[key]||O.stop[key])return '';return key;}
/* Indeksi: avain -> muistiinpanojen id:t (kukin kerran), n = arkistoimattomien määrä */
function wlIndex(notes,O){var df={},n=0;(notes||[]).forEach(function(N){if(!N||N.arch||!N.text)return;n++;var seen={};
  wlWords(N.text).forEach(function(x){var key=wlOk(x.w,O);if(!key||seen[key])return;seen[key]=1;(df[key]||(df[key]=[])).push(N.id);});});return {df:df,n:n};}
function wlCommon(ids,I,key,O){return !O.yes[key]&&ids.length>=6&&ids.length>0.3*I.n;}
/* Sanalinkit tekstissä {s,e,w,key,ids}; ids = muut muistiinpanot (oma selfId pois) */
function wlHits(text,I,O,selfId){var out=[];if(!O.on)return out;wlWords(text).forEach(function(x){var key=wlOk(x.w,O);if(!key)return;var all=I.df[key];if(!all||wlCommon(all,I,key,O))return;
  var ids=all.filter(function(id){return id!==selfId;});if(ids.length)out.push({s:x.s,e:x.e,w:x.w,key:key,ids:ids});});return out;}
/* ---- 1.98 (Emil 29.10.2026): kuittaus kuuluu tekstille, ei muistiinpanolle ----
   Muistiinpanolla ei ole omaa kuittausta: N.done on johdettu (kaikki sen tekstit kuitattu), N.arch on oma päätös ja piilottaa kaiken.
   Tekstin kuittaus: toistuva teksti kuitataan kerta kerrallaan (pts) ja valmistuu vasta loppupäivän jälkeen; ajallinen kerta-teksti on
   kuitattu, kun sen kaikki kerrat on kuitattu (pts, sama kuin kalenterissa); ajaton teksti kuitataan omalla merkinnällään N.tx.
   N.tx = [{t: tekstin sisältö kuittaushetkellä, i: sen paikka, ok: aika}]. Tekstejä ei tallenneta, joten kuittaus kohdistetaan
   sisällön mukaan: sama teksti tai teksti, jonka sanoista suurin osa on samoja, pitää kuittauksensa. Vanha muoto: ei tx-kenttää ja
   done = kaikki tekstit kuitattu (siirto txMigrate). */
function txWords(t){return normT(t).trim().split(' ').filter(Boolean);}
function txSim(a,b){if(a===b)return 1;var A=txWords(a),B=txWords(b);if(!A.length||!B.length)return 0;var m={},n=0;B.forEach(function(w){m[w]=(m[w]||0)+1;});A.forEach(function(w){if(m[w]){m[w]--;n++;}});return n/Math.max(A.length,B.length);}
/* Ajattomien tekstien kuittaukset nykyisille teksteille: [ok|''] tekstin indeksin mukaan */
function txBase(N){var P=noteParts(N.text),out=P.map(function(){return '';});if(!Array.isArray(N.tx)){if(N.done)return P.map(function(){return N.done;});return out;}
  var cand=[];N.tx.forEach(function(e,k){P.forEach(function(p,i){var sc=txSim(e.t,p.t);if(sc>=0.6)cand.push({k:k,i:i,sc:sc+(e.i===i?0.01:0)});});});
  cand.sort(function(a,b){return b.sc-a.sc;});var ue={};cand.forEach(function(c){if(ue[c.k]||out[c.i])return;ue[c.k]=1;out[c.i]=N.tx[c.k].ok;});return out;}
function txWrite(N,base){var P=noteParts(N.text);N.tx=[];base.forEach(function(ok,i){if(ok&&P[i])N.tx.push({t:P[i].t,i:i,ok:ok});});}
/* Tekstin ajat: rec = toistuva, ended = kaikki toistuvat päättyneet, keys = kerta-aikojen kuittausavaimet (enintään 62 päivää) */
function partInfo(N,i,today){var P=noteParts(N.text),out={rec:false,ended:true,keys:[],long:false,dated:false};
  var dates=noteDates(N),keys=new Map();
  dates.forEach(function(o){if(P.length>1&&partIx(P,o)!==i)return;out.dated=true;
    if(!plain(o)){out.rec=true;if(!recEnded(o,today))out.ended=false;return;}
    var d=fromIso(o.R[0]),k=0;while(isoD(d)<=o.R[1]){if(++k>62){out.long=true;break;}var key=calendarOccurrenceKey(N,isoD(d),o,keys,dates);if(out.keys.indexOf(key)<0)out.keys.push(key);d=addDays(d,1);}});
  if(out.long)out.keys=[];return out;}
/* Tekstin kuittausaika ('' = avoin) */
function partAt(N,i,today,base){var f=partInfo(N,i,today);base=base||txBase(N);
  if(f.rec){if(f.ended){var e='';noteDates(N).forEach(function(o){if(!plain(o)&&o.R&&o.R[1]>e)e=o.R[1];});return base[i]||(e?fromIso(e).toISOString():'x');}return base[i]||'';}
  if(f.keys.length){var m='';for(var k=0;k<f.keys.length;k++){var v=N.pts&&N.pts[f.keys[k]];if(!v)return '';if(v>m)m=v;}return m;}
  return base[i]||'';}
/* Vanha muoto: kuitattu muistiinpano → kaikki tekstit kuitattuja; ajallisille kerta-teksteille kuittaukset kertoihin */
function txMigrate(N,today){if(Array.isArray(N.tx))return;var P=noteParts(N.text);if(N.done){P.forEach(function(p,i){var f=partInfo(N,i,today);if(f.rec||!f.keys.length)return;
    f.keys.forEach(function(k){var Q=N.pts||(N.pts={});if(!Q[k])Q[k]=N.done;});});txWrite(N,P.map(function(){return N.done;}));}else N.tx=[];}
/* Kohdistaa tallennetut kuittaukset nykyisiin teksteihin ja johtaa N.done:n. Palauttaa true, jos muistiinpano tuli juuri kokonaan kuitatuksi. */
function txSync(N,today){txMigrate(N,today);var base=txBase(N),P=noteParts(N.text),was=!!N.done,all=true,m='';
  P.forEach(function(p,i){var a=partAt(N,i,today,base);if(!a)all=false;else if(a>m)m=a;});
  P.forEach(function(p,i){var f=partInfo(N,i,today);if(f.keys.length||(f.rec&&!f.ended))base[i]=f.rec&&base[i]?base[i]:'';});txWrite(N,base);
  if(all&&clean(N.text)){if(!N.done)N.done=m&&m!=='x'?m:new Date().toISOString();}else delete N.done;return !was&&!!N.done;}
/* Tekstin kuittaus tai sen peruutus (Muistio, lista): toistuvasta kuitataan avoinna oleva kerta, kerta-tekstistä kaikki kerrat, ajattomasta teksti */
function txSet(N,i,on,at,today){txMigrate(N,today);var f=partInfo(N,i,today),Q=N.pts||(N.pts={});
  if(f.rec&&!f.ended){var key=null;noteDates(N).forEach(function(o){if(key||plain(o)||(noteParts(N.text).length>1&&partIx(noteParts(N.text),o)!==i))return;if(o.R&&!recEnded(o,today))key=recKey(o,today,N);});
    if(key){if(on)Q[key]=at;else delete Q[key];}if(!on){var b0=txBase(N);b0[i]='';txWrite(N,b0);}}
  else if(f.keys.length){f.keys.forEach(function(k){if(on){if(!Q[k])Q[k]=at;}else delete Q[k];});}
  else{var b=txBase(N);b[i]=on?at:'';txWrite(N,b);}
  if(!Object.keys(Q).length)delete N.pts;return txSync(N,today);}
/* Toistuvan tekstin avoinna olevan kerran kuittaus (Muistion ympyrä näyttää sen) */
function txOn(N,i,today){var f=partInfo(N,i,today);if(f.rec&&!f.ended){var on=false,P=noteParts(N.text);noteDates(N).forEach(function(o){if(plain(o)||(P.length>1&&partIx(P,o)!==i)||!o.R||recEnded(o,today))return;var k=recKey(o,today,N);if(k&&N.pts&&N.pts[k])on=true;});return on;}return !!partAt(N,i,today);}
/* ---- 1.99 (Emil 29.10.2026): listarivi poimii tekstejä ----
   row.px = {n:1 = rivin nimi tekstissä, t:[asiasanojen id:t]}. Jokainen muistiinpanon teksti, jossa rivin nimi tai jokin valituista
   asiasanoista tunnistuu, on rivillä oma kohteensa (kerran per rivi). Kuittaus on tekstin oma (txSet), sama kuin Muistiossa ja kalenterissa.
   Toistuva teksti on yksi kohde, jonka avoinna oleva kerta kuitataan (toistuva voittaa saman tekstin kerta-ajan). Ajaton teksti uusiutuu
   listalla tunnistetun asiasanan kuittausaikataulun mukaan (ev: tärkein osuva, jolla on sääntö); Muistiossa se pysyy kuitattuna.
   termsOf(i) = tekstin i asiasanat. Palauttaa [{nid,pi,st:'open'|'done'|'wait',at,key,ids,rank,sort}] järjestettynä. */
function pxMatch(row,N,i,ids){var px=row.px||{},P=noteParts(N.text),hit=[];if(px.n&&clean(row.name)&&termOn({id:'r',name:row.name,yes:[],no:[]},{n:normT(P[i].t)}))hit.push('');
  (px.t||[]).forEach(function(id){if(ids.indexOf(id)>=0)hit.push(id);});return hit;}
function rowPicks(row,notes,termsOf,today,now,ev,rk){var out=[];if(!row||!row.px||!(row.px.n||(row.px.t||[]).length))return out;now=now||new Date();
  (notes||[]).forEach(function(N){if(N.arch||N.id===row.nid||!clean(N.text))return;var P=noteParts(N.text),T=termsOf(N);
    P.forEach(function(p,i){var hit=pxMatch(row,N,i,T[i]||[]);if(!hit.length)return;var f=partInfo(N,i,today),r=Infinity,R=null;
      hit.forEach(function(id){var k=id&&rk&&rk[id]!==undefined?rk[id]:Infinity;if(k<r)r=k;if(id&&ev&&ev[id]&&!R)R=ev[id];});
      var it={nid:N.id,pi:i,ids:hit.filter(Boolean),rank:r,sort:N.created||''},A;
      if(f.rec&&!f.ended){var key=null;noteDates(N).forEach(function(o){if(key||plain(o)||(P.length>1&&partIx(P,o)!==i)||!o.R||recEnded(o,today))return;key=recKey(o,today,N);});
        if(!key)return;var kd=key.slice(0,10),ok=N.pts&&N.pts[key];it.key=key;it.sort=kd;
        if(!ok&&kd<=today)it.st='open';else if(ok&&isoD(new Date(ok))===today){it.st='done';it.at=ok;}else{it.st='wait';var nx=kd>today?kd:null;
          if(!nx)noteDates(N).forEach(function(o){if(nx||plain(o)||(P.length>1&&partIx(P,o)!==i)||!o.R)return;nx=nextOcc(o,isoD(addDays(fromIso(today),1)));});it.next=nx;}}
      else{A=partAt(N,i,today);if(f.keys.length)it.sort=f.keys[0].slice(0,10);
        if(!A)it.st='open';else if(!f.keys.length&&!f.rec&&R&&!itemOk({ok:A},now,R))it.st='open';
        else if(isoD(new Date(A))===today){it.st='done';it.at=A;}else return;}
      out.push(it);});});
  var so={open:0,wait:1,done:2};return out.sort(function(a,b){return so[a.st]-so[b.st]||(a.rank<b.rank?-1:a.rank>b.rank?1:0)||(a.sort<b.sort?-1:a.sort>b.sort?1:0);});}
/* Listalta poistunut: arkistoitu tai kuitattu ennen tätä päivää (tänään kuitattu näkyy päivän loppuun) */
function gone(N,today){return !!N&&(!!N.arch||(!!N.done&&isoD(new Date(N.done))<today));}
function noteTerms(terms,text){var T=noteParts(text).map(function(p){return {n:normT(p.t)};});
  return (terms||[]).filter(function(t){return T.some(function(x){return termOn(t,x);});}).map(function(t){return t.id;});}
/* Asiasanat teksteittäin: [[id…] per teksti] */
function partTerms(terms,text){return noteParts(text).map(function(p){var T={n:normT(p.t)};return (terms||[]).filter(function(t){return termOn(t,T);}).map(function(t){return t.id;});});}
function termInText(t,text){return noteParts(text).some(function(p){return termOn(t,{n:normT(p.t)});});}

/* ---- päivämäärät ----
   Pohjahetki on muistiinpanon luontihetki, joten myöhempi muokkaus ei siirrä "perjantaita". */
function pad(n){return n<10?'0'+n:''+n;}
function isoD(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function dayOf(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function fromIso(s){var p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
var WD=['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'],WDS=['su','ma','ti','ke','to','pe','la'];
var NUMW={yhden:1,kahden:2,kolmen:3,neljän:4,viiden:5,kuuden:6,seitsemän:7,kahdeksan:8,yhdeksän:9,kymmenen:10},EVERYW={toinen:2,kolmas:3,'neljäs':4};
/* ---- ajankohdat tekstistä ----
   Teksti pilkotaan sanoiksi. Välilyönnillä peräkkäin olevat tunnistetut sanat muodostavat yhden ajankohdan, jossa osat
   tarkentavat toisiaan (vk43 perjantai klo13-16 = viikon 43 perjantai klo 13–16). Tunnistamaton sana, rivinvaihto tai
   välimerkki sanan perässä katkaisee. Jos samaa osaa tulee toinen (kaksi päivämäärää, kaksi kellonaikaa), alkaa uusi ajankohta.
   Ajankohta: R = [alku, loppu] päivät (väli = jokainen välin päivä), wds = viikonpäivät, every = joka n:s viikko,
   mon = 'lw' (kuun viimeinen täysi ma–su-viikko) tai luku (kuun viimeiset n päivää), time = {s,e}. Ilman R:ää toistuva
   ajankohta alkaa pohjapäivästä (from). Pohja on muistiinpanon luontihetki. */
function mkDate(y,m,d){var x=new Date(y,m-1,d);return (x.getMonth()===m-1&&x.getDate()===d)?x:null;}
function yr(v){return v?(v.length===2?2000+(+v):+v):null;}
var MONP=['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu'];
function dayNoYear(b,m,d){var x=mkDate(b.getFullYear(),m,d);if(x&&x<b)x=mkDate(b.getFullYear()+1,m,d);return x;}
function oneDate(w,b){var m=/^(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})?$/.exec(w),x;
  if(m){x=m[3]?mkDate(yr(m[3]),+m[2],+m[1]):dayNoYear(b,+m[2],+m[1]);return x?{x:x,y:!!m[3],d:+m[1],m:+m[2]}:null;}
  m=/^(\d{2})(\d{2})(\d{2})$/.exec(w);if(m){x=mkDate(2000+(+m[3]),+m[2],+m[1]);return x?{x:x,y:true}:null;}
  return null;}
function rangeOf(l,r,b){var A=oneDate(l,b),B=oneDate(r,b);if(!A||!B)return null;var a=A.x,e=B.x;
  if(!A.y){a=mkDate(e.getFullYear(),A.m,A.d);if(a&&a>e)a=mkDate(e.getFullYear()-1,A.m,A.d);}
  return a&&a<=e?[a,e]:null;}
function timeOf(w){var m=/^(\d{1,2})(?:[.:](\d{2}))?(?:[-–](\d{1,2})(?:[.:](\d{2}))?)?$/.exec(w);if(!m||+m[1]>24||(m[3]&&+m[3]>24)||(m[2]&&+m[2]>59)||(m[4]&&+m[4]>59))return null;
  return {s:pad(+m[1])+':'+(m[2]||'00'),e:m[3]?pad(+m[3])+':'+(m[4]||'00'):''};}
var WDA=['su','ma','ti','ke','to','pe','la'];
function wdOf(w){var m=/^(maanantai|tiistai|keskiviikko|torstai|perjantai|lauantai|sunnuntai)(na|sin|isin|t|hin|sta|lta|lle|n|ksi)?$/.exec(w);if(m&&m[2]==='isin'&&m[1]!=='keskiviikko')m=null;return m?{d:WD.indexOf(m[1]),sin:m[2]==='sin'||m[2]==='isin',base:!m[2]}:null;}
function isoWeek(y,n){var j=new Date(y,0,4),mon=addDays(j,-((j.getDay()+6)%7));return addDays(mon,7*(n-1));}
function tokensOf(text){var out=[],re=/\S+/g,m,prev=0,src=String(text||'');
  while((m=re.exec(src))){var raw=m[0],s=m.index,e=s+raw.length,w=raw,brk=false,nl=/\n/.test(src.slice(prev,s));prev=e;
    /* Välimerkit ja erikoismerkit sanan ympäriltä eivät estä tunnistusta (Emil 22.10.2026). Pilkku ym. katkaisee sanaparin (klo, 14),
       mutta ei ajankohtaa: ”24.10., klo 14” on yksi ajankohta. Lause päättyy vain pisteeseen, huutoon tai kysymykseen (hard). */
    var hard=false;if(/[\p{L}\p{N}]/u.test(w)){
      while(/^[^\p{L}\p{N}+]/u.test(w)){w=w.slice(1);s++;}
      while(/[^\p{L}\p{N}.]$/u.test(w)){if(/[!?]$/.test(w))hard=true;w=w.slice(0,-1);e--;brk=true;}
      if(/\.{2,}$/.test(w)){w=w.replace(/\.+$/,function(x){e-=x.length;return '';});brk=hard=true;}
      if(/^\d{1,2}\.\d{1,2}\.(\d{2}|\d{4})\.$/.test(w)){w=w.slice(0,-1);e--;brk=hard=true;}
      else if(/\.$/.test(w)&&!/^\d{1,2}\.\d{1,2}\.(\d{2}|\d{4})?$/.test(w)&&!/\d\.$/.test(w)){w=w.slice(0,-1);e--;brk=hard=true;}
      while(/[^\p{L}\p{N}.]$/u.test(w)){w=w.slice(0,-1);e--;brk=true;}}
    out.push({w:w.toLowerCase(),s:s,e:e,brk:brk,hard:hard,nl:nl});}
  return out;}
/* Yrittää tunnistaa ajankohdan osan kohdasta i. Palauttaa {n: käytetyt sanat, sp: osa} tai null. */
function specAt(tk,i,b){var w=tk[i].w,n1=tk[i+1]&&!tk[i].brk?tk[i+1].w:null,n2=n1!==null&&tk[i+2]&&!tk[i+1].brk?tk[i+2].w:null,n3=n2!==null&&tk[i+3]&&!tk[i+2].brk?tk[i+3].w:null,m,x,r;
  function R(a,e){return {R:[a,e||a]};}
  if(w==='ensi'&&(n1==='viikolla'||(n1==='viikon'&&n2==='aikana'))){x=addDays(b,((1-b.getDay()+7)%7)||7);return {n:n1==='viikolla'?2:3,sp:R(x,addDays(x,6))};}
  if((w==='tällä'&&n1==='viikolla')||(w==='tämän'&&n1==='viikon'&&n2==='aikana'))return {n:w==='tällä'?2:3,sp:R(b,addDays(b,(7-b.getDay())%7))};
  if((w==='ensi'&&n1==='kuussa')||(w==='ensi'&&n1==='kuun'&&n2==='aikana'))return {n:n1==='kuussa'?2:3,sp:R(new Date(b.getFullYear(),b.getMonth()+1,1),new Date(b.getFullYear(),b.getMonth()+2,0))};
  if((w==='tässä'&&n1==='kuussa')||(w==='tämän'&&n1==='kuun'&&n2==='aikana'))return {n:w==='tässä'?2:3,sp:R(b,new Date(b.getFullYear(),b.getMonth()+1,0))};
  if(w==='kuun'&&n1==='viimeinen'&&n2==='viikko')return {n:3,sp:{mon:'lw'}};
  if(w==='kuun'&&(n1==='viimeiset'||n1==='viimeisenä'||n1==='viimeisinä')){if(n2&&(m=/^(\d+)pv$/.exec(n2)))return {n:3,sp:{mon:+m[1]}};if(n2&&/^\d+$/.test(n2)&&(n3==='pv'||n3==='päivää'))return {n:4,sp:{mon:+n2}};}
  var num=null,k=0;if(/^\d+$/.test(w)){num=+w;k=1;}else if(NUMW[w]){num=NUMW[w];k=1;}
  var u=k?n1:w,rel=k?n2:n1;
  if(/^(päivän|vuorokauden|viikon|kuukauden|kuun)$/.test(u||'')&&/^(sisällä|sisään|aikana|päästä|kuluttua)$/.test(rel||'')){var nn=num||1,end;
    end=(u==='kuukauden'||u==='kuun')?new Date(b.getFullYear(),b.getMonth()+nn,b.getDate()):addDays(b,u==='viikon'?7*nn:nn);
    return {n:k+2,sp:(rel==='päästä'||rel==='kuluttua')?R(end):R(b,end)};}
  if(w==='joka'){var ev=1,j=1;if(n1&&EVERYW[n1]){ev=EVERYW[n1];j=2;}var ww=tk[i+j]&&(j===1||!tk[i+1].brk)?wdOf(tk[i+j].w):null;if(ww)return {n:j+1,sp:{wd:ww.d,rec:true,every:ev}};}
  if((w==='klo'||w==='kello')&&n1&&(x=timeOf(n1.replace(/\.$/,''))))return {n:2,sp:{time:x}};
  if((m=/^(?:klo|kello)(\d.*)$/.exec(w))&&(x=timeOf(m[1].replace(/\.$/,''))))return {n:1,sp:{time:x}};
  if(n1&&/^[-–—]$/.test(n1)&&n2&&(r=rangeOf(w,n2,b)))return {n:3,sp:R(r[0],r[1])};
  if((m=/^(.+?)[-–—](.+)$/.exec(w))&&(r=rangeOf(m[1],m[2],b)))return {n:1,sp:R(r[0],r[1])};
  if((x=oneDate(w,b)))return {n:1,sp:R(x.x)};
  if((m=/^(\d{1,2})\/(\d{4}|\d{2})$/.exec(w))&&+m[1]>=1&&+m[1]<=12){var y=yr(m[2]);return {n:1,sp:R(new Date(y,+m[1]-1,1),new Date(y,+m[1],0))};}
  /* 1.93 (Emil 26.10.2026): kuukauden nimi (marraskuun 1., 1. marraskuuta), viikko välilyönnillä (vk 50, viikko 50) ja pe:nä */
  if((m=/^(tammi|helmi|maalis|huhti|touko|kesä|heinä|elo|syys|loka|marras|joulu)kuun$/.exec(w))&&n1&&(r=/^(\d{1,2})\.?$/.exec(n1))&&(x=dayNoYear(b,MONP.indexOf(m[1])+1,+r[1])))return {n:2,sp:R(x)};
  if((m=/^(\d{1,2})\.$/.exec(w))&&n1&&(r=/^(tammi|helmi|maalis|huhti|touko|kesä|heinä|elo|syys|loka|marras|joulu)kuuta$/.exec(n1))&&(x=dayNoYear(b,MONP.indexOf(r[1])+1,+m[1])))return {n:2,sp:R(x)};
  if(/^(vk|viikko|viikon|viikolle|viikkoon)$/.test(w)&&n1&&/^\d{1,2}$/.test(n1)&&+n1>=1&&+n1<=53&&((n2&&(RB_S[n2]||RB_E[n2]))||(i>0&&(RB_S[tk[i-1].w]||RB_E[tk[i-1].w])))){x=isoWeek(b.getFullYear(),+n1);if(addDays(x,6)<b)x=isoWeek(b.getFullYear()+1,+n1);return {n:2,sp:R(x,addDays(x,6))};}
  if((m=/^(ma|ti|ke|to|pe|la|su):(nä|na|n|stä|sta|hin|lle|ksi)$/.exec(w)))return {n:1,sp:{wd:WDA.indexOf(m[1])}};
  if((m=/^vk(\d{1,2})$/.exec(w))&&+m[1]>=1&&+m[1]<=53){x=isoWeek(b.getFullYear(),+m[1]);if(addDays(x,6)<b)x=isoWeek(b.getFullYear()+1,+m[1]);return {n:1,sp:R(x,addDays(x,6))};}
  if(w==='eilen')return {n:1,sp:R(addDays(b,-1))};if(w==='tänään')return {n:1,sp:R(b)};if(w==='huomenna')return {n:1,sp:R(addDays(b,1))};if(w==='ylihuomenna')return {n:1,sp:R(addDays(b,2))};
  if((x=wdOf(w)))return {n:1,sp:{wd:x.d,rec:x.sin}};
  if(WDA.indexOf(w)>=0)return {n:1,sp:{wd:WDA.indexOf(w),abbr:true}}; // ma–su kelpaa vain toisen osan vieressä (parseDates)
  return null;}
function occursOn(o,iso){if(o.R&&(iso<o.R[0]||iso>o.R[1]))return false;if(!o.R&&o.from&&iso<o.from)return false;
  var d=fromIso(iso);if(o.wds&&o.wds.length&&o.wds.indexOf(d.getDay())<0)return false;
  if(o.every>1){var diff=Math.round((d-fromIso(o.anchor))/864e5);if(diff<0||Math.round(diff/7)%o.every)return false;}
  if(o.mon){var dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
    if(o.mon==='lw'){var last=new Date(d.getFullYear(),d.getMonth(),dim),L=dim-last.getDay();if(d.getDate()>L||d.getDate()<L-6)return false;}
    else if(d.getDate()<=dim-o.mon)return false;}
  return true;}
function plain(o){return o.R&&!(o.wds&&o.wds.length)&&!o.mon;}
/* Toistuvuuden alku ja loppu (Emil 26.10.2026, 1.93): toistuva ajankohta (perjantaisin, joka toinen ma, kuun viimeinen viikko) saa samasta
   virkkeestä alun (alkaen, lähtien) ja lopun (päättyen, saakka, asti) missä järjestyksessä tahansa. Väliin saa tulla pilkkuja ja ja-sanoja,
   muttei muuta; piste tai rivinvaihto katkaisee. Rajaksi kelpaa päivä tai viikko (vk 50 saakka = viikon loppuun). Ilman loppua toisto
   päättyy kirjoitusvuoden lopussa. o.R = [alku, loppu], o.end = 1, jos loppu on kirjoitettu. */
var RB_S={'alkaen':1,'lähtien':1},RB_E={'päättyen':1,'saakka':1,'asti':1},RB_F={'ja':1,'sekä':1};
function recBounds(out,tk,b,text){var drop={},mk={};
  function chunkAt(k,end){for(var q=0;q<out.length;q++){var P=out[q];if(!drop[q]&&(end?P.i1:P.i0)===k&&P.R&&plain(P)&&P.i0!==undefined)return q;}return -1;}
  function filler(w){return RB_S[w]||RB_E[w]||RB_F[w];}
  out.forEach(function(o,oi){if(drop[oi]||plain(o)||o.R||o.i0===undefined)return;var C=[],j,q;
    for(j=o.i1+1;j<tk.length;){if(tk[j-1].hard||tk[j].nl)break;if(filler(tk[j].w)){j++;continue;}q=chunkAt(j,false);if(q<0)break;C.push(q);j=out[q].i1+1;}
    for(j=o.i0-1;j>=0;){if(tk[j].hard||tk[j+1].nl)break;if(filler(tk[j].w)){j--;continue;}q=chunkAt(j,true);if(q<0)break;C.push(q);j=out[q].i0-1;}
    C.sort(function(x,y){return out[x].i0-out[y].i0;});var st=null,en=null,S=o.s,E=o.e;
    C.forEach(function(q){var P=out[q],bi=P.i0-1,ai=P.i1+1,bw=bi>=0&&!mk[bi]&&!tk[bi].hard&&!tk[P.i0].nl?tk[bi].w:'',aw=ai<tk.length&&!tk[P.i1].hard&&!tk[ai].nl?tk[ai].w:'',k='';
      if(RB_S[bw]||RB_E[bw]){k=RB_S[bw]?'s':'e';mk[bi]=1;}else if(RB_S[aw]||RB_E[aw]){k=RB_S[aw]?'s':'e';mk[ai]=1;}
      if(!k)return;if(k==='s'&&st===null)st=P.R[0];else if(k==='e'&&en===null)en=P.R[1];else return;drop[q]=1;
      S=Math.min(S,P.s,bi>=0&&mk[bi]?tk[bi].s:P.s);E=Math.max(E,P.e,ai<tk.length&&mk[ai]?tk[ai].e:P.e);});
    var a=st||o.from||isoD(b),e=en||(fromIso(a).getFullYear()+'-12-31');if(e<a)return;
    o.R=[a,e];delete o.from;if(en)o.end=1;else o.dflt=1;if(st)o.st=1;o.s=S;o.e=E;o.src=text.slice(S,E);if(o.every>1)o.anchor=nextOcc({R:o.R,wds:o.wds,mon:o.mon},a);o.a=nextOcc(o,a);if(!o.a){drop[oi]=1;return;}o.b=lastOcc(o);o.rec=true;});
  return out.filter(function(o,i){return !drop[i];});}
/* Ensimmäinen esiintymä päivänä from tai myöhemmin (iso) tai null */
function nextOcc(o,from){var st=from;if(o.R&&o.R[0]>st)st=o.R[0];if(!o.R&&o.from&&o.from>st)st=o.from;
  if(plain(o))return st<=o.R[1]?st:null;
  var d=fromIso(st),lim=o.R?o.R[1]:isoD(addDays(d,800));
  for(var k=0;k<800;k++){var s=isoD(d);if(s>lim)return null;if(occursOn(o,s))return s;d=addDays(d,1);}return null;}
/* 1.93: toistuvan kuittaus koskee aina yhtä kertaa. Avoinna on viimeisin kerta tänään tai ennen (kunnes kuitataan), muuten seuraava. */
function prevOcc(o,from){if(!o.R)return null;var d=fromIso(from<o.R[1]?from:o.R[1]);for(var k=0;k<800;k++){var s=isoD(d);if(s<o.R[0])return null;if(occursOn(o,s))return s;d=addDays(d,-1);}return null;}
function recKey(o,today,N){var k=prevOcc(o,today)||nextOcc(o,today);return k?calendarOccurrenceKey(N,k,o):null;}
function recEnded(o,today){return !plain(o)&&!!o.R&&o.R[1]<today;}
/* Päättyneestä toistuvuudesta ilmoitus (Emil 26.10.2026): automaattinen muistiinpano, jossa järjestelmän asiasana. N.rx = ilmoitetut. */
var SYS_TERM='Järjestelmäilmoitus';
function recExpiries(notes,today,now){var made=[];(notes||[]).forEach(function(N){if(N.arch||N.rep==='rx')return;/* 1.98: päättynyt toistuva on johdetusti kuitattu, ilmoitus silti (N.rx estää toiston) */noteDates(N).forEach(function(o){if(!recEnded(o,today))return;var k=clean(o.src)+'|'+o.R[1];
    if((N.rx||[]).indexOf(k)>=0)return;N.rx=(N.rx||[]).concat([k]);var t=clean(String(N.text||'').split('\n')[0]).slice(0,80);
    made.push({id:'n'+Date.parse(now).toString(36)+made.length+Math.random().toString(36).slice(2,6),created:now,edited:now,date:today,rep:'rx',text:SYS_TERM+': toistuvuus päättyi '+fiDate(o.R[1])+'.\n'+clean(o.src)+(t?' ('+t+')':'')});});});
  return made;}
function lastOcc(o){if(!o.R)return null;var d=fromIso(o.R[1]);for(var k=0;k<800;k++){var s=isoD(d);if(s<o.R[0])return null;if(occursOn(o,s))return s;d=addDays(d,-1);}return null;}
/* Vajaa ajanilmaus (Emil 21.10.2026): viikonpäivä tai pelkkä kellonaika on aina seuraava mahdollinen kirjoitushetkestä (nm = luontihetken
   minuutit). Mennyt aika samana päivänä siirtyy viikolla (viikonpäivä) tai päivällä (pelkkä kello); käynnissä oleva väli jää tälle päivälle. */
function timePast(t,nm){if(!t||nm===null||nm===undefined)return false;var p=function(x){var q=String(x).split(':');return (+q[0])*60+(+q[1]||0);};return (t.e?p(t.e):p(t.s))<=nm;}
function finishChunk(c,b,text,nm){var bi=isoD(b),o={s:c.s,e:c.e,src:text.slice(c.s,c.e)},past=timePast(c.time,nm);
  if(c.R)o.R=[isoD(c.R[0]),isoD(c.R[1])];if(c.time){o.time=c.time;o.ts=c.ts;o.te=c.te;}if(c.mon)o.mon=c.mon;
  if(c.wds.length){o.wds=c.wds;var rec=c.rec||c.every>1;
    if(!rec&&!c.R&&!c.mon){var best=null;c.wds.forEach(function(d){var k=(d-b.getDay()+7)%7;if(k===0&&past)k=7;var x=addDays(b,k);if(!best||x<best)best=x;});o.R=[isoD(best),isoD(best)];delete o.wds;}
    else if(c.every>1){o.every=c.every;}}
  if(!o.R&&!o.wds&&!o.mon){if(past)bi=isoD(addDays(b,1));o.R=[bi,bi];o.bare=true;} // pelkkä kellonaika: pohjapäivä, mennyt huomenna
  if(!o.R)o.from=bi;
  if(o.every>1)o.anchor=nextOcc({R:o.R,from:o.from,wds:o.wds,mon:o.mon},o.R?o.R[0]:bi);
  o.a=nextOcc(o,o.R?o.R[0]:bi);if(!o.a)return null;
  o.b=o.R?(plain(o)?o.R[1]:lastOcc(o)):null;o.rec=!plain(o)&&!(o.R&&o.a===o.b);
  return o;}
/* Kaikki 0.6 (Emil 22.11.2026, nopeus): jäsennetty tulos muistissa tekstin, pohjahetken ja lukitusten mukaan. Sama syöte antaa aina saman tuloksen;
   kutsuja saa oman kopion, koska tuloksia muokataan (noteDates). Ilman tätä kalenteri jäsensi jokaisen tekstin uudelleen jokaiselle päivälle. */
var PDC=new Map();
function pdClone(v){if(Array.isArray(v))return v.map(pdClone);if(v&&typeof v==='object'){if(v instanceof Date)return new Date(v.getTime());var o={};for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k))o[k]=pdClone(v[k]);return o;}return v;}
function parseDates(text,base,nl){if(!(base instanceof Date)||isNaN(base.getTime()))return parseDates0(text,base,nl);var k=String(text==null?'':text)+'\u0001'+base.getTime()+'\u0001'+(nl&&nl.length?JSON.stringify(nl):'');
  var c=PDC.get(k);if(!c){c=parseDates0(text,base,nl);if(PDC.size>4000)PDC.clear();PDC.set(k,c);}return pdClone(c);}
function parseDates0(text,base,nl){var SP=sepParts(text);if(!SP)return parseDates1(text,base,nl);var out=[];
  SP.forEach(function(p){parseDates1(p.t,base,nl).forEach(function(o){['s','e','ts','te'].forEach(function(k){if(o[k]!==undefined)o[k]+=p.s;});out.push(o);});});
  return out.sort(function(x,y){return x.a<y.a?-1:x.a>y.a?1:0;});}
function parseDates1(text,base,nl){var bd=base||new Date(),b=dayOf(bd),nm=isNaN(bd.getTime())?null:bd.getHours()*60+bd.getMinutes(),tk=tokensOf(text),out=[],c=null,i=0;text=String(text||'');
  /* Useita kellonaikoja samalle päivälle (Emil 22.10.2026): ”pe klo 10 ja klo 14” = kaksi ajankohtaa perjantaille. Pelkkä kellonaika
     saa edellisen yhden päivän ajankohdan päivän, myös seuraavilla riveillä ja lauseissa (1.39: niin monta kuin tekstissä on),
     kunnes tulee uusi päivä. */
  var pd=null,tt=-1;
  /* Kellonajan perässä pilkulla tai ja-sanalla jatkuva aika ilman klo-sanaa (1.39): ”klo 9–10, 11–12” ja ”klo 9 ja 10”.
     Pilkun jälkeen vain väli tai minuutit (”klo 9, 3 kertaa” ei ole aika). */
  function chainT(j){var t=tk[j];if(tt<0||!t||t.nl||!/^\d/.test(t.w))return null;var w=t.w;
    if(j===tt){if(!/[-–.:]/.test(w))return null;return timeOf(w);}
    if(j===tt+1&&/^(ja|sekä|tai)$/i.test(tk[tt].w)&&!tk[tt].nl)return timeOf(w);return null;}
  function close(){if(c){if(c.time&&!c.R&&!c.wds.length&&!c.mon&&pd){c.R=pd.R;c.wds=pd.wds.slice();c.rec=pd.rec;c.every=pd.every;if(pd.mon)c.mon=pd.mon;}
      if((c.R&&c.R[0]===c.R[1])||c.wds.length)pd={R:c.R,wds:c.wds.slice(),rec:c.rec,every:c.every,mon:c.mon};var o=finishChunk(c,b,text,nm);if(o){o.i0=c.i0;o.i1=c.i1;out.push(o);}}c=null;}
  /* Kellonaika ilman klo-sanaa (Emil 22.10.2026): numero tai väli heti päivää tarkoittavan ilmauksen perässä pelkällä välilyönnillä
     (torstaina 22-23, 24.10. 9.30) on kellonaika, jos se on kelvollinen 24 tunnin aika. Pilkku tai piste välissä estää. */
  function bareT(j){var t=tk[j];return j>0&&t&&!t.nl&&!tk[j-1].brk&&/^\d/.test(t.w)?timeOf(t.w):null;}
  while(i<tk.length){if(tk[i].nl)close();var r=specAt(tk,i,b),x;
    if(!r&&c&&!c.time&&(c.R||c.wds.length)&&(x=bareT(i)))r={n:1,sp:{time:x}};
    if(!r&&(!c||c.time)&&(x=chainT(i)))r={n:1,sp:{time:x}};
    if(r&&r.sp.abbr&&!c){var nx=!tk[i].hard&&tk[i+1]&&!tk[i+1].nl?specAt(tk,i+1,b):null;if(!nx&&bareT(i+1))nx={sp:{}};if(!nx||nx.sp.abbr)r=null;}
    if(!r){close();i++;continue;}
    var sp=r.sp,last=tk[i+r.n-1];
    if(c&&((sp.R&&c.R)||(sp.time&&c.time)||(sp.mon&&c.mon)||(sp.wd!==undefined&&c.time&&i>0&&/\.$/.test(tk[i-1].w))))close();
    /* 1.93: toistuva viikonpäivä ja yksittäinen päivä eivät yhdisty (perjantaisin 5.12. asti = raja, ei ajankohta) */
    var bnd=!!(sp.R&&((tk[i+r.n]&&!last.hard&&(RB_S[tk[i+r.n].w]||RB_E[tk[i+r.n].w]))||(i>0&&(RB_S[tk[i-1].w]||RB_E[tk[i-1].w]))));
    if(c&&((sp.rec&&c.R&&(+c.R[0]===+c.R[1]||c.bnd))||(sp.R&&(bnd||+sp.R[0]===+sp.R[1])&&(c.rec||c.every>1))))close();
    if(!c)c={s:tk[i].s,e:last.e,wds:[],every:1,rec:false,i0:i,bnd:bnd};c.i1=i+r.n-1;
    if(sp.R)c.R=sp.R;if(sp.time){c.time=sp.time;c.ts=tk[i].s;c.te=last.e;}if(sp.mon)c.mon=sp.mon;
    if(sp.wd!==undefined){if(c.wds.indexOf(sp.wd)<0)c.wds.push(sp.wd);if(sp.rec)c.rec=true;if(sp.every>1)c.every=sp.every;}
    c.e=last.e;i+=r.n;if(sp.time)tt=last.hard?-1:i;if(last.hard)close();}
  close();out=recBounds(out,tk,b,text);
  /* Puretut aikalinkit (Emil 23.10.2026, 1.52): N.nl:n kohdat ovat tavallista tekstiä, kunnes niitä muokataan */
  if(nl&&nl.length){var NR=nlSpans(text,nl);out=out.filter(function(o){if(o.s===undefined)return true;var a=o.ts!==undefined?Math.min(o.s,o.ts):o.s,e=o.te!==undefined?Math.max(o.e,o.te):o.e;return !NR.some(function(r){return a<r.e&&r.s<e;});});}
  return out.sort(function(x,y){return x.a<y.a?-1:x.a>y.a?1:0;});}
/* Suhteellisten aikojen lukitus (Emil 22.10.2026, versio 1.36). Suhteellinen yhden päivän ilmaus (huomenna, perjantaina, 3 päivän päästä,
   tänään) lukitaan kirjoitushetkeensä: N.rel = [{w: sana nyt tekstissä, o: alkuperäinen, at: kirjoitusaika, d: päivä}]. Muokkaus ei siirrä
   lukittua päivää, uusi suhteellinen sana lukitaan omaan hetkeensä. Kun päivä vaihtuu, sana päivitetään tekstiin (tänään, eilen, päiväys).
   Itse kirjoitettuja päivämääriä ei muuteta koskaan. */
function relSpans(text,objs,all){var out=[];text=String(text||'');
  (objs||[]).forEach(function(o){if(o.s===undefined||o.bare||o.rec||!o.R||o.mon||o.a!==o.b)return;var x=/\d{1,2}\.\d{1,2}\.|\d{1,2}\.\d{1,2}\b|vk\d/i.test(String(o.src||''));if(x&&!all)return;
    var s=-1,e=-1;tokensOf(text.slice(o.s,o.e)).forEach(function(t){var ts=o.s+t.s,te=o.s+t.e;if(o.ts!==undefined&&ts>=o.ts&&te<=o.te)return;if(s<0)s=ts;e=te;});
    if(s>=0)out.push({s:s,e:e,w:text.slice(s,e),d:o.a,o:o,x:x});});
  return out;}
/* Lukitut sanat tekstin suhteellisiin kohtiin järjestyksessä: palauttaa [{sp, lock}] */
function relMatch(N,spans){var used={},out=[];(spans||[]).forEach(function(sp){var L=N.rel||[];for(var k=0;k<L.length;k++)if(!used[k]&&L[k].w===sp.w){used[k]=1;out.push({sp:sp,lock:L[k]});return;}});return out;}
/* Päiväykseksi jo muuttunut sana pysyy lukossa (alkuperäinen näkyy napautuksella), mutta itse kirjoitettu päiväys ei saa lukkoa. */
function lockRel(N,now){var D=parseDates(MUUTTUJA.mask(N.text,null,N.created||now),now,N.nl),spans=relSpans(N.text,D,true),old=(N.rel||[]).slice(),out=[];
  spans.forEach(function(sp){for(var k=0;k<old.length;k++)if(old[k]&&old[k].w===sp.w){out.push(old[k]);old[k]=null;return;}
    if(!sp.x)out.push({w:sp.w,o:sp.w,at:now.toISOString(),d:sp.d});});
  if(out.length)N.rel=out;else delete N.rel;
  /* Pelkkä kellonaika (Emil 23.10.2026, 1.47): seuraava mahdollinen kirjoitushetkestä, ei muistiinpanon luontihetkestä.
     N.bt = [{w: ajan teksti, d: päivä, at}]; lukko säilyy muokatessa, uusi aika lukitaan omaan hetkeensä. Teksti ei muutu. */
  var ob=(N.bt||[]).slice(),bo=[];D.forEach(function(o){if(!o.bare)return;var w=bareKey(o);
    for(var k=0;k<ob.length;k++)if(ob[k]&&ob[k].w===w){bo.push(ob[k]);ob[k]=null;return;}bo.push({w:w,d:o.a,at:now.toISOString()});});
  if(bo.length)N.bt=bo;else delete N.bt;
  /* Jakso (Emil 23.10.2026, 1.48): ensi viikolla, tässä kuussa, kahden viikon sisällä, vk45 … lasketaan kirjoitushetkestä.
     N.rg = [{w: jakson teksti, a, b, at}]; sama periaate kuin pelkällä kellonajalla. Toistuva ei lukitu. */
  var og=(N.rg||[]).slice(),go=[];D.forEach(function(o){if(o.bare||o.rec||!o.R||o.a===o.b)return;var w=bareKey(o);
    for(var k=0;k<og.length;k++)if(og[k]&&og[k].w===w){go.push(og[k]);og[k]=null;return;}go.push({w:w,a:o.R[0],b:o.R[1],at:now.toISOString()});});
  if(go.length)N.rg=go;else delete N.rg;return N;}
function bareKey(o){return clean(String(o.src||'')).toLowerCase().replace(/[.,;:!?]+$/,'');}
var RELWD=/^(maanantai|tiistai|keskiviikko|torstai|perjantai|lauantai|sunnuntai)(na)?$|^(ma|ti|ke|to|pe|la|su)$/i;
function relWord(L,today){var wd=isoD(new Date(L.at));if(wd===today)return L.o;var t=fromIso(today),dd=Math.round((fromIso(L.d)-t)/864e5);
  if(dd===0)return 'tänään';if(dd===-1)return 'eilen';if(dd===1)return 'huomenna';if(dd===2)return 'ylihuomenna';
  if(dd>0&&dd<7&&RELWD.test(L.o))return L.o;var x=fromIso(L.d);return WDS[x.getDay()]+' '+x.getDate()+'.'+(x.getMonth()+1)+'.'+x.getFullYear();}
/* Päivän vaihtuessa: lukitut sanat tekstiin. Palauttaa true, jos teksti muuttui. Lukko, jonka sanaa ei enää ole, poistuu. */
function relSweep(N,today){if(!N.rel||!N.rel.length)return false;var M=relMatch(N,relSpans(N.text,parseDates(MUUTTUJA.mask(N.text,null,N.created),new Date(N.created||Date.now()),N.nl),true)),txt=String(N.text),ch=false;
  N.rel=M.map(function(m){return m.lock;});if(!N.rel.length){delete N.rel;return false;}
  M.sort(function(a,b){return b.sp.s-a.sp.s;}).forEach(function(m){var w=relWord(m.lock,today);if(w!==m.lock.w){txt=txt.slice(0,m.sp.s)+w+txt.slice(m.sp.e);m.lock.w=w;ch=true;}});
  if(ch)N.text=txt;return ch;}
function noteDates(N){if(N._ds)return N._ds.map(function(o){var c={};Object.keys(o).forEach(function(k){c[k]=o[k];});return c;});var source=N.text;
  if(/^paivat\/\d{4}\/\d{4}-\d\d-\d\d\.md$/.test(N.vp||'')){
    var active=false;
    source=String(source||'').split('\n').map(function(line,index){
      if(/^#{1,2}\s/.test(line))active=line.trim()==='## Pikakirjaukset';
      if((index===0&&line.trim()===N.vp.slice(-13,-3))||(active&&/^- klo \d\d\.\d\d · .+$/.test(line)))return line.replace(/\S/g,' ');
      return line;
    }).join('\n');
  }
  /* 0.88: säätimen aikaleimarivi "- 2026-11-24 klo 12.30 · teksti" on kirjaus, ei kalenterin ajankohta. */
  if(/^- \d{4}-\d\d-\d\d(?: klo \d\d\.\d\d)? · /m.test(source||''))source=String(source).replace(/^- \d{4}-\d\d-\d\d(?: klo \d\d\.\d\d)? · /gm,function(x){return x.replace(/\S/g,' ');});
  /* 0.65: tekstimuuttujan !!…!! päivät ovat havainnon päiviä, eivät kalenterin ajankohtia */
  var d=parseDates(MUUTTUJA.mask(source,null,N.created),new Date(N.created||Date.now()),N.nl);
  if(N.rel&&N.rel.length)relMatch(N,relSpans(N.text,d,true)).forEach(function(m){var o=m.sp.o;o.R=[m.lock.d,m.lock.d];o.a=o.b=m.lock.d;o.locked=m.lock;});
  if(N.rg&&N.rg.length){var gu={};d.forEach(function(o){if(o.bare||o.rec||!o.R||o.a===o.b)return;var w=bareKey(o);for(var k=0;k<N.rg.length;k++)if(!gu[k]&&N.rg[k].w===w){gu[k]=1;o.R=[N.rg[k].a,N.rg[k].b];o.a=N.rg[k].a;o.b=N.rg[k].b;return;}});}
  if(N.bt&&N.bt.length){var bu={};d.forEach(function(o){if(!o.bare)return;var w=bareKey(o);for(var k=0;k<N.bt.length;k++)if(!bu[k]&&N.bt[k].w===w){bu[k]=1;o.R=[N.bt[k].d,N.bt[k].d];o.a=o.b=N.bt[k].d;return;}});}
  /* pelkkä kellonaika ja päivämääräkenttä: aika koskee kentän päivää */
  if(N.date)d.forEach(function(o){if(o.bare){o.R=[N.date,N.date];o.a=o.b=N.date;}});
  if(N.date&&!d.some(function(o){return plain(o)&&o.R[0]===N.date&&o.R[1]===N.date;}))d.push({R:[N.date,N.date],a:N.date,b:N.date,src:'päivämäärä'});
  /* Kellonaikakenttä (N.time) koskee ajankohtia, joilla ei ole omaa aikaa tekstissä */
  if(N.time&&N.time.s)d.forEach(function(o){if(!o.time)o.time={s:N.time.s,e:N.time.e||''};});
  /* Kalenterin +:sta liitetty kohta (Emil 22.10.2026): oma ajankohta tekstin aikojen lisäksi */
  if(N.pin&&N.date&&N.time&&N.time.s&&!d.some(function(o){return o.ts===undefined&&o.time&&o.R&&o.R[0]===N.date&&o.R[1]===N.date;}))
    d.push({R:[N.date,N.date],a:N.date,b:N.date,time:{s:N.time.s,e:N.time.e||''},src:'kalenterin kohta',pin:true});
  return d;}
/* ---- kalenteri ----
   Päivän merkinnät: aikajanalle ne, joilla on kellonaika (tekstistä tai kentästä), muut ajattomina.
   Raahaus kirjoittaa ajan sinne, mistä se tuli: tekstin "klo …" korvataan, muuten kenttä N.time. */
function toMin(t){var p=String(t||'').split(':');return (+p[0])*60+(+p[1]||0);}
function fromMin(m){m=Math.max(0,Math.min(1440,Math.round(m)));return pad(Math.floor(m/60))+':'+pad(m%60);}
function fmtTime(t){var p=String(t).split(':');return (+p[0])+(p[1]&&p[1]!=='00'?'.'+p[1]:'');}
/* Otsikko kalenteriin: ensimmäinen rivi ilman tunnistettuja ajankohtia */
function noteTitle(N){var t=String(N.text||'');parseDates(MUUTTUJA.mask(t,null,N.created),new Date(N.created||Date.now()),N.nl).sort(function(a,b){return b.s-a.s;}).forEach(function(o){t=t.slice(0,o.s)+t.slice(o.e);});
  var l=t.split('\n').map(function(x){return clean(x).replace(/^[\s,.;:–-]+|[\s,;:–-]+$/g,'');}).filter(Boolean);return VAULT.mdPlain(l[0]||clean(String(N.text||'').split('\n')[0]));}
/* dur = oletuspituus minuutteina ilman loppuaikaa (Asetukset, oletus 30). Jokainen saman päivän kellonaika on oma merkintänsä,
   myös sama kellonaika kahdesti (1.39, Emil: niin monta kuin tekstissä on, päällekkäisinäkin). */
/* Kohtakohtainen kuittaus kalenterista (Emil 22.10.2026): kohta = päivä ja alkuaika. N.pts = {kohta: kuittausaika}.
   Kalenteri on oma kerroksensa (Emil 22.10.2026): kalenterin kuittaus on aina vain ”huomioitu kalenterin osalta”. Koko muistiinpano kuitataan Muistiosta. */
function occKey(iso,o){return iso+(o&&o.time&&o.time.s?' '+o.time.s:'')+(o&&o.dup?'#'+o.dup:'');}
function occList(N){var out=[],fin=true,dates=noteDates(N),keys=new Map();dates.forEach(function(o){if(!plain(o)){fin=false;return;}var d=fromIso(o.R[0]),k=0;
    while(isoD(d)<=o.R[1]){if(++k>62){fin=false;break;}var key=calendarOccurrenceKey(N,isoD(d),o,keys,dates);if(out.indexOf(key)<0)out.push(key);d=addDays(d,1);}});
  return fin&&out.length?out:null;}
function ptDone(N,key){return !!(N.done||(N.pts&&N.pts[key]));}
/* Sama kalenterikerta kojelaudalla ja Muistiossa. Ensimmäisen ajan avain säilyy vanhassa muodossa. */
function calendarOccurrences(N,iso,dates){
  var os=(dates||noteDates(N)).filter(function(o){return occursOn(o,iso);});
  if(!os.length)return [];
  var P=noteParts(N.text),timedParts=new Set(),untimedParts=new Set(),seen=new Map(),out=[];
  os.forEach(function(o){if(o.time)timedParts.add(partIx(P,o));});
  os.forEach(function(o){
    var part=partIx(P,o);
    if(!o.time){
      if(timedParts.has(part)||untimedParts.has(part))return;
      untimedParts.add(part);
    }
    var key=o.time?o.time.s:'',dup=seen.get(key)||0;
    seen.set(key,dup+1);
    out.push({original:o,occ:dup?Object.assign({},o,{dup:dup}):o});
  });
  return out;
}
function calendarOccurrenceKey(N,iso,o,cache,dates){
  if(!N||o.dup||(dates&&dates.length<2))return occKey(iso,o);
  var entries=cache&&cache.get(iso);
  if(!entries){entries=calendarOccurrences(N,iso,dates);if(cache)cache.set(iso,entries);}
  var hit=entries.find(function(x){
    var a=x.original;
    return a===o||(a.s===o.s&&a.e===o.e&&a.src===o.src&&a.pin===o.pin);
  });
  return occKey(iso,hit?hit.occ:o);
}
function dayEntries(notes,iso,dur){var timed=[],untimed=[];dur=dur||30;
  (notes||[]).forEach(function(N){
    if(N.arch)return;
    calendarOccurrences(N,iso).forEach(function(entry){
      var o=entry.occ;
      if(!o.time){untimed.push({n:N,o:o});return;}
      var start=toMin(o.time.s),end=o.time.e?toMin(o.time.e):start+dur;
      if(end<=start)end=Math.min(1440,start+dur);
      timed.push({n:N,o:o,s:start,e:end,open:!o.time.e,timed:true});
    });
  });
  timed.sort(function(a,b){return a.s-b.s||b.e-a.e;});
  /* päällekkäiset rinnakkain: sarake ja ryhmän sarakkeiden määrä */
  var grp=[],end=-1;function flush(){var cols=0;grp.forEach(function(x){cols=Math.max(cols,x.col+1);});grp.forEach(function(x){x.cols=cols;});grp=[];}
  timed.forEach(function(x){if(x.s>=end)flush();var used={};grp.forEach(function(y){if(y.e>x.s)used[y.col]=1;});var c=0;while(used[c])c++;x.col=c;grp.push(x);end=Math.max(end,x.e);});flush();
  return {timed:timed,untimed:untimed};}
/* Uusi aika tekstiin samassa tyylissä: klo-sanalla, jos alkuperäisessä oli, muuten ilman (1.39). */
function timeTok(tok,s,e){var dot=/\.$/.test(tok)?'.':'';return (/^klo/i.test(tok)?tok.slice(0,3)+' ':'')+fmtTime(s)+(e?'–'+fmtTime(e):'')+dot;}
function setTimeText(text,o,s,e){return text.slice(0,o.ts)+timeTok(text.slice(o.ts,o.te),s,e)+text.slice(o.te);}
/* Siirtohistoria (Emil 22.10.2026, 1.39): kalenterissa muutettu ajan ilmaus muistaa aiemmat muotonsa.
   N.mv = [{w: teksti nyt, h:[{t: aiempi teksti, at: muutosaika}]}]; uusi siirto jatkaa samaa historiaa. Muokkauksessa kadonnut poistuu (mvClean). */
function mvAdd(N,oldW,newW,at){if(oldW===newW)return;var L=N.mv||(N.mv=[]),m=L.filter(function(x){return x.w===oldW;})[0];
  if(m){m.h.push({t:oldW,at:at});m.w=newW;}else L.push({w:newW,h:[{t:oldW,at:at}]});}
function mvClean(N){if(!N.mv)return N;var t=String(N.text||'');N.mv=N.mv.filter(function(m){return m.w&&mvAt(t,m.w,0)>=0;});if(!N.mv.length)delete N.mv;return N;}
/* Tekstin kohdat, joiden aikaa on siirretty: [{s,e,m}] */
function mvAt(t,w,i){i=t.indexOf(w,i);while(i>=0&&(/[\p{L}\p{N}]/u.test(t.charAt(i-1)||' ')||/[\p{L}\p{N}]/u.test(t.charAt(i+w.length)||' ')))i=t.indexOf(w,i+1);return i;}
function mvSpans(N){var t=String(N.text||''),out=[],used={};(N.mv||[]).forEach(function(m){var i=mvAt(t,m.w,0);while(i>=0&&used[i])i=mvAt(t,m.w,i+1);if(i<0)return;used[i]=1;out.push({s:i,e:i+m.w.length,m:m});});return out;}
/* Puretut aikalinkit (1.52): N.nl = [{w: teksti, at}]; sama haku kuin siirtohistoriassa. Muokattu teksti ei enää osu, joten se tunnistetaan taas. */
function nlSpans(t,nl){t=String(t||'');var out=[],used={};(nl||[]).forEach(function(m){var i=mvAt(t,m.w,0);while(i>=0&&used[i])i=mvAt(t,m.w,i+1);if(i<0)return;used[i]=1;out.push({s:i,e:i+m.w.length,m:m});});return out;}
function nlClean(N){if(!N.nl)return N;var t=String(N.text||'');N.nl=N.nl.filter(function(m){return m.w&&mvAt(t,m.w,0)>=0;});if(!N.nl.length)delete N.nl;return N;}
/* Ajan muokkaus tekstistä (1.52): koko ilmaus (päivä ja kellonaika) korvataan kiinteällä päiväyksellä, ja muutos jää historiaan.
   Vain yhden päivän ajankohta; palauttaa syyn tai ''. */
function whenSpan(o){return {s:o.ts!==undefined?Math.min(o.s,o.ts):o.s,e:o.te!==undefined?Math.max(o.e,o.te):o.e};}
function setWhen(N,o,iso,s,e,now){if(!o||o.s===undefined)return 'Ei ajankohtaa tekstissä.';if(o.rec||o.a!==o.b)return 'Toistuva tai monen päivän ajankohta muutetaan kirjoittamalla.';
  if(!iso)return 'Valitse päivä.';var t=String(N.text||''),w=whenSpan(o),old=t.slice(w.s,w.e),nw=fiDate(iso)+(s?' klo '+fmtTime(s)+(e?'–'+fmtTime(e):''):'');
  if(N.date===o.a)N.date=iso;mvAdd(N,old,nw,(now||new Date()).toISOString());N.text=t.slice(0,w.s)+nw+t.slice(w.e);return '';}
/* Uusi aika merkinnälle (minuutit). Kesto ilman loppuaikaa säilyy avoimena, ellei kokoa muuteta. */
/* 1.61: kalenterin kuittaus kulkee siirron mukana (Emil 23.10.2026: siirretty kuitattu pysyy kuitattuna) */
function ptMv(N,a,b){if(!N||!N.pts||a===b||!N.pts[a])return;var v=N.pts[a];delete N.pts[a];N.pts[b]=v;}
function moveEntry(x,s,e,keepOpen){var S=fromMin(s),E=keepOpen?'':fromMin(e),N=x.n,D=x.day||(x.o&&x.o.a);
  if(D)ptMv(N,occKey(D,x.o&&x.o.time?x.o:{time:N.time,dup:x.o&&x.o.dup}),occKey(D,{time:{s:S},dup:x.o&&x.o.dup}));
  if(x.o&&x.o.ts!==undefined){var old=N.text.slice(x.o.ts,x.o.te),nw=timeTok(old,S,E);N.text=setTimeText(N.text,x.o,S,E);mvAdd(N,old.replace(/\.$/,''),nw.replace(/\.$/,''),new Date().toISOString());}else N.time={s:S,e:E};return N;}
/* Vaihe 7b: siirto toiselle päivälle (pudotus viikkonauhan päivälle). Vain yhden päivän ajankohta siirtyy: tekstin päivä
   korvataan uudella päivämäärällä samassa kohdassa (kellonaika säilyy), kenttäpäivä vaihtuu. Toistuva tai monen päivän ei siirry: palauttaa syyn. */
function moveDay(N,o,iso,time){if(!o)return 'Ei ajankohtaa.';if(o.rec||o.a!==o.b)return 'Toistuva tai monen päivän merkintä ei siirry. Muuta ajankohta tekstiin.';
  ptMv(N,occKey(o.a,o),occKey(iso,time?{time:time,dup:o.dup}:o));
  if(time&&o.ts!==undefined)return setWhen(N,o,iso,time.s,time.e);
  if(time)N.time=time;
  if(o.s===undefined){N.date=iso;return '';}
  var t=N.text,tok=(o.ts!==undefined&&o.ts>=o.s&&o.te<=o.e)?t.slice(o.ts,o.te):'';
  if(N.date===o.a)N.date=iso;var nw=fiDate(iso)+(tok?' '+tok:'');mvAdd(N,t.slice(o.s,o.e),nw,new Date().toISOString());N.text=t.slice(0,o.s)+nw+t.slice(o.e);return '';}
/* Aikajanalta takaisin ajattomaksi: tekstin kellonaika pois (pelkkä kellonaika korvataan päivällä), muuten kenttä pois */
function clearTime(N,o){var D=o&&o.a||N.date;if(D)ptMv(N,occKey(D,o&&o.time?o:{time:N.time}),occKey(D,{dup:o&&o.dup}));
  if(o&&o.ts!==undefined){var t=N.text;
    if(o.ts<=o.s&&o.te>=o.e){N.text=t.slice(0,o.s)+fiDate(o.a)+t.slice(o.e);return N;}
    var a=t.slice(0,o.ts).replace(/[ \t]+$/,''),b=t.slice(o.te).replace(/^[ \t]+/,'');N.text=a+(a&&b&&!/^[\n.,;:!?)]/.test(b)?' ':'')+b;return N;}
  delete N.time;return N;}
/* Päivän alaotsikot: Näytä kalenterissa -termit, joihin päivän muistiinpanot osuvat */
function calTerms(terms,notes,iso){var cal=(terms||[]).filter(function(t){return t.cal;}),hit=[];if(!cal.length)return hit;
  notesOnDay(notes,iso,true).forEach(function(n){var P=sepParts(n.text);noteParts(n.text).forEach(function(p,i){if(P&&!noteDates(partNote(n,i)).some(function(o){return occursOn(o,iso);}))return;
    var T={n:normT(p.t)};cal.forEach(function(t){if(hit.indexOf(t.name)<0&&termOn(t,T))hit.push(t.name);});});});return hit;}
/* Seuraava ajankohta tänään tai myöhemmin. Toistuva ja monen päivän muistiinpano siirtyy seuraavaan, kun edellinen on mennyt. */
function nextDate(N,today){var best=null;noteDates(N).forEach(function(o){var k=nextOcc(o,today);if(k&&(!best||k<best.k))best={k:k,o:o,a:o.a,b:o.b};});return best;}
function dateLabel(o){var p=[];
  if(o.a&&o.a===o.b&&(o.wds||o.mon))p.push(WDS[fromIso(o.a).getDay()]+' '+fiDate(o.a));
  else if(o.R&&!(o.wds||o.mon)){p.push(o.R[0]===o.R[1]?WDS[fromIso(o.R[0]).getDay()]+' '+fiDate(o.R[0]):fiDate(o.R[0])+'–'+fiDate(o.R[1]));}
  else{if(o.wds)p.push('joka '+(o.every>1?o.every+'. ':'')+o.wds.map(function(d){return WDS[d];}).join(', '));
    if(o.mon)p.push(o.mon==='lw'?'kuun viimeinen viikko':'kuun viimeiset '+o.mon+' pv');
    if(o.R){if(!o.dflt)p.push(fiDate(o.R[0])+'–'+fiDate(o.R[1]));else if(o.st)p.push(fiDate(o.R[0])+' alkaen');}}
  if(o.time)p.push('klo '+o.time.s.replace(/^0/,'').replace(':','.')+(o.time.e?'–'+o.time.e.replace(/^0/,'').replace(':','.'):''));
  return p.join(' ');}
function sortNotes(notes,mode,today,upcoming){var l=notes.slice();
  function ed(n){return n.edited||n.created||'';}
  if(mode==='next'){var key={};l.forEach(function(n){var x=nextDate(n,today);if(upcoming)upcoming.set(n,x);key[n.id]=x?x.k:null;});
    l.sort(function(a,b){var ka=key[a.id],kb=key[b.id];if(ka&&kb)return ka<kb?-1:ka>kb?1:(ed(a)<ed(b)?1:-1);if(ka)return -1;if(kb)return 1;return ed(a)<ed(b)?1:ed(a)>ed(b)?-1:0;});}
  else l.sort(function(a,b){return ed(a)<ed(b)?1:ed(a)>ed(b)?-1:0;});
  return l;}
/* ---- tärkeysjärjestys (Emil 21.10.2026) ----
   Yksi järjestys kaikille termeille = Termit-luettelon järjestys (order = id-lista; puuttuvat oletusjärjestyksessä perään).
   Aikatermit tulevat muistiinpanolle itsestään ajankohdasta, kukin vain tarkimpana. Muistiinpano saa tärkeimmän osuvan termin paikan. */
var TIME_TERMS=[{id:'z:late',name:'Myöhässä'},{id:'z:today',name:'Tänään'},{id:'z:tomorrow',name:'Huomenna'},{id:'z:week',name:'Tällä viikolla'}];
/* Erikoisjäsenet (Emil 23.10.2026, 1.51): aikasanat ja Mainittu voi valita riville tai listan ryhmään */
/* 1.91 (Emil 26.10.2026): viikonpäivät aikasanoina ehtojen syyksi. Muistiinpanossa (päättely) totta, kun jokin sen ajoista osuu
   viikonpäivälle (perjantaina, 30.10., perjantaisin); jatkuvalla listalla totta sinä viikonpäivänä. id z:0–z:6 = getDay. */
var WD_TERMS=['Sunnuntai','Maanantai','Tiistai','Keskiviikko','Torstai','Perjantai','Lauantai'].map(function(n,i){return {id:'z:'+i,name:n};});
WD_TERMS.push(WD_TERMS.shift());
function wdKeys(N,today){var o={};noteDates(N).forEach(function(x){if(x.wds&&x.wds.length){x.wds.forEach(function(d){o['z:'+d]=1;});return;}var k=nextOcc(x,today)||x.a;if(k)o['z:'+fromIso(k).getDay()]=1;});return Object.keys(o);}
function timeName(id){var z=TIME_TERMS.concat(WD_TERMS).filter(function(t){return t.id===id;})[0];return z?z.name:'';}
var SPEC=[{id:'m:men',name:'Mainittu muistiinpanoissa'}].concat(TIME_TERMS.slice(0,3));
function isSpec(id){return SPEC.some(function(x){return x.id===id;});}
function timeTermOf(N,today){var ds=noteDates(N);if(!ds.length)return null;var nx=nextDate(N,today);if(!nx)return 'z:late';
  var t=fromIso(today);if(nx.k===today)return 'z:today';if(nx.k===isoD(addDays(t,1)))return 'z:tomorrow';if(nx.k<=isoD(addDays(t,(7-t.getDay())%7)))return 'z:week';return null;}
function fullOrder(order,ids){var out=[],seen={},has={};ids.forEach(function(id){has[id]=1;});
  (order||[]).forEach(function(id){if(has[id]&&!seen[id]){seen[id]=1;out.push(id);}});ids.forEach(function(id){if(!seen[id]){seen[id]=1;out.push(id);}});return out;}
function moveInOrder(order,ids,id,dir){var l=fullOrder(order,ids),i=l.indexOf(id),j=i+dir;if(i<0||j<0||j>=l.length)return l;l[i]=l[j];l[j]=id;return l;}
/* Tärkeät (Emil 21.10.2026): imp = tärkeiksi merkittyjen termien id:t järjestyksessä, muut eivät ole järjestyksessä.
   Merkitsemätön termi perii tärkeän merkityksen paikan, jos se on sen ehto (vaatii kaikki), ryhmän jäsen tai kääntöpuoli
   (myös välillisesti). Oma merkintä voittaa. Palauttaa {termin id: sija}. */
function impRanks(imp,terms,projects){var own={},R={},byName={},pts=(projects||[]).map(function(P){return {P:P,pt:parseText(P.text),F:rulesOf(P.text).flip};});
  (imp||[]).forEach(function(id,i){if(own[id]===undefined)own[id]=i;});
  (terms||[]).forEach(function(t){var k=keyOf(t.name);if(byName[k]===undefined)byName[k]=t.id;});
  function kids(k){var out=[];pts.forEach(function(x){if(!x.pt.by[k])return;
    needOf(x.P,k).forEach(function(c){out.push(c);});if(x.pt.by[k].k==='g')rl(x.P,k).o.forEach(function(c){out.push(c);});
    (x.F[k]||[]).forEach(function(t){out.push(keyOf(t));});});return out;}
  (imp||[]).forEach(function(id,i){var t=null;(terms||[]).forEach(function(q){if(q.id===id)t=q;});if(!t)return;
    var q=kids(keyOf(t.name)),seen={};while(q.length){var c=q.shift();if(seen[c])continue;seen[c]=1;var cid=byName[c];
      if(cid!==undefined&&own[cid]===undefined&&R[cid]===undefined)R[cid]=i;q=q.concat(kids(c));}});
  Object.keys(own).forEach(function(id){R[id]=own[id];});return R;}
/* Raahaus: id kohtaan j */
function moveToIdx(list,id,j){var l=list.filter(function(x){return x!==id;});j=Math.max(0,Math.min(l.length,j));l.splice(j,0,id);return l;}
function prioSort(notes,rankOf,today){var r={},k={};notes.forEach(function(n){r[n.id]=rankOf(n);var x=nextDate(n,today);k[n.id]=x?x.k:'';});
  function ed(n){return n.edited||n.created||'';}
  return notes.slice().sort(function(a,b){var ra=r[a.id],rb=r[b.id];if(ra!==rb)return ra<rb?-1:1;
    if(ra!==Infinity&&k[a.id]!==k[b.id]){if(!k[a.id])return 1;if(!k[b.id])return -1;return k[a.id]<k[b.id]?-1:1;}
    return ed(a)<ed(b)?1:ed(a)>ed(b)?-1:0;});}
/* Tarkistuslista (Emil 22.10.2026, versiot 1.40–1.41). Rivi = {id, name, nid?, created, edited, it:[kohde], any?}.
   Muistiinpano on juuri (1.41): rivin teksti on oikea muistiinpano (nid), josta tulevat kalenterimerkinnät ja kalenterin kuittaukset (N.pts).
   Kohde {id, ok?: kuittausaika, ev?: voimassa päivinä, at?: lisätty, t?: 1 = tekstin laukaisema}: kuittaus raukeaa ev päivän päästä.
   Kohteita ovat käsin valitut asiasanat, tekstin laukaisemat asiasanat (ctx.tt) ja aika (ctx.z: Myöhässä/Tänään/Huomenna tekstin päivistä;
   aikakohteen kuittaus = saman päivän kalenterikuittaus). Riviä ei kuitata koskaan, vain kohteet. Aika nostaa riviä kuittauksista riippumatta.
   Järjestys (Emil): tarkistettavat ensin tärkeimmän kuittaamattoman asiasanan mukaan, tasatilanteessa se, joka laukesi kuittaamattomaksi ensin;
   muut sen mukaan, mikä laukeaa seuraavaksi, tärkeydestä riippumatta. Ei kääntöpuolta. */
/* Uusiutumissääntö (1.87, Emil 25.10.2026): päivät edellisestä kuittauksesta (ev) ja/tai tietyt viikonpäivät (wd, 0 = su) ja kuun päivät (md, 1–31).
   Kuittaus raukeaa ensimmäisenä näistä: ev päivän kuluttua tai valitun päivän alkaessa (keskiyöllä) kuittauspäivän jälkeen.
   Kuun päivä, jota kuussa ei ole (esim. 31.), osuu kuun viimeiseen päivään. Pelkkä luku = vanha muoto (päivät). */
function evWd(v){return (Array.isArray(v)?v:[]).map(Number).filter(function(x,i,A){return x>=0&&x<=6&&x===Math.floor(x)&&A.indexOf(x)===i;}).sort();}
function evMd(v){return (Array.isArray(v)?v:[]).map(Number).filter(function(x,i,A){return x>=1&&x<=31&&x===Math.floor(x)&&A.indexOf(x)===i;}).sort(function(a,b){return a-b;});}
function evRule(r){if(!r)return null;if(typeof r==='number')return r>0?{ev:r,wd:[],md:[]}:null;var o={ev:r.ev>0?r.ev:0,wd:evWd(r.wd),md:evMd(r.md)};return o.ev||o.wd.length||o.md.length?o:null;}
function dayHit(d,r){if(r.wd.indexOf(d.getDay())>=0)return true;if(!r.md.length)return false;var last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),n=d.getDate();
  return r.md.some(function(x){return Math.min(x,last)===n;});}
function renewAt(ok,rule){var r=evRule(rule),t=ms(ok);if(!r||!t)return Infinity;var m=r.ev?t+r.ev*864e5:Infinity;
  if(r.wd.length||r.md.length){var d=new Date(t);d.setHours(0,0,0,0);for(var i=0;i<62;i++){d.setDate(d.getDate()+1);if(d.getTime()>=m)break;if(dayHit(d,r)){m=d.getTime();break;}}}
  return m;}
function itemOk(x,now,ev){ev=ev===undefined?x&&x.ev:ev;if(!x||!x.ok)return false;if(!evRule(ev))return true;return renewAt(x.ok,ev)>(now||new Date()).getTime();}
function itemUntil(x,ev){ev=ev===undefined?x&&x.ev:ev;var t=x&&x.ok?renewAt(x.ok,ev):Infinity;return t<Infinity?isoD(new Date(t)):null;}
/* Uusiutumisaika: asiasanan oma (ctx.ev = {id: sääntö}, 1.43, 1.87); vanhassa muodossa kohteen ev */
function evOf(x,ctx){if(!x||(ctx&&ctx.kier))return 0;return ctx&&ctx.ev&&ctx.ev[x.id]?ctx.ev[x.id]:x.ev||0;}
function ms(s){var t=s?new Date(s).getTime():NaN;return isNaN(t)?0:t;}
/* Rivin näkyvät kohteet: [{id, x (tallennettu kohde tai null), ok, since (ms, milloin tuli tarkistettavaksi), t?, z?, keys?}] */
function chkView(row,ctx,now){ctx=ctx||{};var tt=ctx.tt||[],gm=ctx.gm||[],out=[],seen={};
  function add(x,id,t,g){if(ctx.hid&&ctx.hid[id]&&!ctx.workflow){seen[id]=1;return;}var ev=x?evOf(x,ctx):0,ok=itemOk(x,now,ev),since=null;if(!ok)since=x&&x.ok&&ev?renewAt(x.ok,ev):t?(ctx.nc||ms(row.created)):ms(x&&x.at||row.created);
    var base=!!(ctx.workflow&&ctx.hid&&ctx.hid[id]);var v={id:id,x:x,ok:base?false:ok,since:since};if(base)v.base=1;if(t)v.t=1;if(g)v.g=1;if(!ok&&ctx.off&&ctx.off[id])v.off=1;out.push(v);seen[id]=1;}
  /* Kohde näkyy, jos se on valittu käsin, tai sen lähde (teksti t, linkitetty ryhmä g, 1.46) laukaisee sen yhä */
  /* 1.105 (Emil 18.11.2026): listan tarkistuskohteet (ctx.tk) ovat kaikilla riveillä, paitsi rivin pois ruksimat (row.ei) */
  var EI={};if(ctx.tk)(row.ei||[]).forEach(function(id){EI[id]=1;});
  (row.it||[]).forEach(function(x){if(x.id.slice(0,2)==='z:'||seen[x.id]||EI[x.id]||(ctx.tk&&!x.t&&!x.g&&ctx.tk.indexOf(x.id)<0))return;if((x.t||x.g)&&!(x.t&&tt.indexOf(x.id)>=0)&&!(x.g&&gm.indexOf(x.id)>=0))return;add(x,x.id,x.t&&tt.indexOf(x.id)>=0,x.g);});
  (ctx.tk||[]).forEach(function(id){if(id.slice(0,2)==='z:'||seen[id]||EI[id])return;add(null,id,0,0);});
  gm.forEach(function(id){if(id.slice(0,2)==='z:'||seen[id])return;add(null,id,0,1);});
  tt.forEach(function(id){if(id.slice(0,2)==='z:'||seen[id])return;add(null,id,1);});
  if(ctx.z){var z={id:ctx.z.id,x:null,ok:false,since:ctx.z.since,z:1,keys:ctx.z.keys};out.push(z);}
  /* Mainittu (1.44): avoimen muistiinpanon aikakohde, kun siinä mainitaan rivin nimi; toimii kuten aika */
  (ctx.mn||[]).forEach(function(m){var q={id:m.z.id,x:null,ok:false,since:m.z.since,z:1,keys:m.z.keys,mn:m.nid};if(m.pi!==undefined)q.mp=m.pi;out.push(q);});
  return out;}
function chkItems(row,ctx,now){return chkView(row,ctx,now).filter(function(v){return !v.z&&!v.off&&!v.base;});}
/* Listan ehdot (Emil 23.10.2026, 1.67): E = [{id, k:[laukaisevat asiasanat], all (1 = kaikki näistä, muuten jokin), on:[esiin], off:[pois]}].
   Ehto täyttyy, kun sen laukaisijat on kuitattu jollain listan rivillä (näkyvä, voimassa oleva kuittaus). Jonkin ehdon esiin tuoma asiasana on
   piilossa (hid), kunnes jokin sitä tuova ehto täyttyy. Poissulku voittaa: poissuljettu kuittaamaton kohde (off) ei estä rivin valmistumista
   ja näkyy harmaana; kuitattu pysyy. Lasketaan kiintopisteeseen, koska esiin tullut ja kuitattu voi laukaista seuraavan. cx(r) = rivin ctx. */
/* 1.78 (Emil 24.10.2026): syynä myös ryhmä (o.grp = {ryhmän id: {m:[jäsenet], all}}; vain listan omille riveille liitetyt ryhmät) ja aikasana
   (o.tk = {z:late|z:today|z:tomorrow|z:week: 1}, vain jatkuvalla listalla). Ehdon laji ty:'x' = Poissulkevat: kun yksi jäsen on kuitattu, muut ovat pois. */
function grpHit(G,K,active){var o={};Object.keys(G||{}).forEach(function(id){var g=G[id],m=(g.m||[]).filter(function(id){return !active||active[id];});if(m.length&&(g.all?m.every(function(x){return K[x];}):m.some(function(x){return K[x];})))o[id]=1;});return o;}
function chkCond(E,rows,cx,now,o){o=o||{};var tg={},shown={},off={},hid={},i,j;(E||[]).forEach(function(e){(e.on||[]).forEach(function(id){tg[id]=1;});});
  for(i=0;i<Math.max(20,E.length*2+2);i++){hid={};Object.keys(tg).forEach(function(id){if(!shown[id])hid[id]=1;});var K={},active={};
    rows.forEach(function(r){var c=cx(r)||{},d={};for(j in c)d[j]=c[j];d.hid=hid;d.off=null;chkView(r,d,now).forEach(function(v){if(!v.base&&!v.z&&!v.off)active[v.id]=1;if(v.ok&&!v.z&&!v.gs&&!v.base)K[v.id]=1;});});
    var GH=grpHit(o.grp,K,o.workflow?active:null);Object.keys(GH).forEach(function(id){K[id]=1;});Object.keys(o.tk||{}).forEach(function(id){K[id]=1;});
    /* 1.79: teksti syynä ("q:sana"): löytyy listan rivien teksteistä tai listan jo esiin tuomista teksteistä (ketjuttuu); tunnistus alusta kuten asiasanoilla */
    var TX=(o.tx||[]).concat(Object.keys(shown).filter(function(id){return id.slice(0,2)==='q:';}).map(function(id){return {n:normT(id.slice(2))};}));
    (E||[]).forEach(function(e){(e.k||[]).forEach(function(id){if(id.slice(0,2)==='q:'&&!K[id]&&TX.some(function(t){return hasWord(t,id.slice(2));}))K[id]=1;});});
    var sh={},of={},n0=Object.keys(shown).length;(E||[]).forEach(function(e){var k=e.k||[];if(!k.length)return;
      if(e.ty==='x'){k.forEach(function(a){if(K[a])k.forEach(function(b){if(b!==a)of[b]=1;});});return;}
      var f=e.all?k.every(function(id){return K[id];}):k.some(function(id){return K[id];});
      if(f){(e.on||[]).forEach(function(id){sh[id]=1;});(e.off||[]).forEach(function(id){of[id]=1;});}});
    var stable=JSON.stringify(Object.keys(sh).sort())===JSON.stringify(Object.keys(shown).sort());shown=sh;off=of;if(stable)break;}
  hid={};Object.keys(tg).forEach(function(id){if(!shown[id])hid[id]=1;});var R={hid:hid,off:off},say=Object.keys(shown).filter(function(id){return id.slice(0,2)==='q:'&&!off[id];}).map(function(id){return id.slice(2);});
  /* Teksti seurauksena (1.79): listan ilmoitus (say), ei kohde */
  if(say.length)R.say=say;return R;}
/* Ehtojen tallennusmuoto: {eh:1 (käytössä), ehdot:[…]} */
function condsIn(c){if(!c||typeof c!=='object')return null;var E=[];(Array.isArray(c.ehdot)?c.ehdot:[]).forEach(function(e){if(!e||typeof e!=='object')return;
    var u=function(a){var o=[];(Array.isArray(a)?a:[]).forEach(function(x){if(typeof x==='string'&&o.indexOf(x)<0)o.push(x);});return o;},k=u(e.k),on=u(e.on),of=u(e.off).filter(function(x){return on.indexOf(x)<0;});
    if(!k.length&&!on.length&&!of.length)return;var X={id:typeof e.id==='string'?e.id:'e'+E.length,k:k,on:on,off:of};if(e.ty==='x'){X.ty='x';X.on=[];X.off=[];E.push(X);return;}if(e.all)X.all=1;
    /* 1.78: yksi ehto = yksi seuraus (Tuo tai Poissulkee); vanha ehto, jossa on molemmat, jaetaan kahdeksi */
    if(on.length&&of.length){var Y={id:X.id+'p',k:k.slice(),on:[],off:of};if(X.all)Y.all=1;X.off=[];E.push(X);E.push(Y);return;}E.push(X);});
  if(!c.eh&&!E.length)return null;var o={ehdot:E};if(c.eh)o.eh=1;return o;}
/* 1.80 (Emil 24.10.2026): päättely muistiinpanossa. Syinä tekstistä tunnistetut asiasanat (ids), teksti "q:…" muistiinpanon tekstissä,
   ryhmä (o.grp, jäsenistä jokin/kaikki tunnistettu) ja aikasana (o.tt = muistiinpanon aikasana). Ehtojen tuomat asiasanat ovat päätellyt
   (palautetaan ehtojen järjestyksessä); Poissulkee poistaa päätellyistä, ei tekstistä tunnistettua. Poissulkevat eivät koske muistiinpanoa. */
function inferTerms(E,ids,txt,o){o=o||{};var tn={n:normT(txt||'')},base={},add=[],i;ids.forEach(function(id){base[id]=1;});
  for(i=0;i<10;i++){var K={},j;for(j in base)K[j]=1;add.forEach(function(id){K[id]=1;});if(o.tt){K[o.tt]=1;if(o.tt!=='z:late')K['z:week']=1;}(o.tw||[]).forEach(function(id){K[id]=1;});var G=grpHit(o.grp,K);for(j in G)K[j]=1;
    var on=[],of={};(E||[]).forEach(function(e){if(e.ty==='x'||!(e.k||[]).length)return;var hit=function(id){return K[id]||(id.slice(0,2)==='q:'&&hasWord(tn,id.slice(2)));};
      if(e.all?e.k.every(hit):e.k.some(hit)){(e.on||[]).forEach(function(id){if(id.slice(0,2)!=='q:'&&on.indexOf(id)<0)on.push(id);});(e.off||[]).forEach(function(id){of[id]=1;});}});
    var n=on.filter(function(id){return !base[id]&&!of[id];});if(n.join('|')===add.join('|'))break;add=n;}
  return add;}
/* 1.78 ristiriidat (Emil 24.10.2026): estetään vain suorat (samat syyt tuovat ja vievät saman, syy omana seurauksenaan, Poissulkevien jäsen tuo
   toisen jäsenen) ja kaksoiskappaleet (dup = aiemman saman ehdon indeksi). Muut näytetään huomautuksina; poissulku voittaa. nm(id) = nimi. */
/* 1.89 (Emil 26.10.2026): päätöspuun säännöt samoina ehtoina kuin listoissa, puuhun rajattuina. Tallennettu muoto on yhä puun teksti
   (sääntölohkot) ja P.rules/P.need/P.mx; treeEh näyttää ne ehtoina ja ehTree kirjoittaa ehdot takaisin. Palikka on ehdossa 'p:'+avain (Alku 'p:'+ALKU).
   avaa = Jokin → Tuo (lähteet, joilla on samat kohteet, ovat yksi ehto), sulkee = Jokin → Poissulkee, vaatii kaikki = Kaikki → Tuo,
   toisensa poissulkevat = Poissulkevat. Järjestys (ennen), kääntöpuoli ja tärkeät pysyvät puun omina. */
function treeEh(P){var E=[],R=P.rules||{},pt=parseText(P.text),keys=[ALKU].concat(pt.items.map(function(it){return it.id;})),n=0;
  Object.keys(R).concat(Object.keys(P.need||{})).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});
  function pk(k){return 'p:'+k;}function grp(f,all){var G={},ord=[];keys.forEach(function(s){var l=f(s);if(!l.length)return;var g=JSON.stringify(l.slice().sort());
      if(!G[g]){G[g]={k:[],t:l.slice()};ord.push(g);}G[g].k.push(s);});return ord.map(function(g){return G[g];});}
  grp(function(s){return rl(P,s).o;}).forEach(function(g){E.push({id:'pe'+(n++),k:g.k.map(pk),on:g.t.map(pk),off:[]});});
  grp(function(s){return s===ALKU?[]:rl(P,s).x;}).forEach(function(g){E.push({id:'pe'+(n++),k:g.k.map(pk),on:[],off:g.t.map(pk)});});
  var N={},no=[];keys.forEach(function(d){var c=needOf(P,d);if(!c.length)return;var g=JSON.stringify(c.slice().sort());if(!N[g]){N[g]={k:c.slice(),t:[]};no.push(g);}N[g].t.push(d);});
  no.forEach(function(g){E.push({id:'pe'+(n++),k:N[g].k.map(pk),all:1,on:N[g].t.map(pk),off:[]});});
  (P.mx||[]).forEach(function(s){if(s.length>1)E.push({id:'pe'+(n++),k:s.map(pk),on:[],off:[],ty:'x'});});
  return E;}
/* Ehdot takaisin puun säännöiksi. Tyhjä vaatii kaikki -merkintä (Rakennassa kesken) säilyy. */
function ehTree(P,E){var R={},N={},M=[];function k(id){return id.slice(0,2)==='p:'?id.slice(2):null;}
  Object.keys(P.need||{}).forEach(function(d){if(!needOf(P,d).length)N[d]=[];});
  (E||[]).forEach(function(e){var ks=e.k.map(k).filter(Boolean);if(!ks.length)return;
    if(e.ty==='x'){ks=ks.filter(function(s){return s!==ALKU;});if(ks.length>1)M.push(ks);return;}
    if(e.all){e.on.map(k).forEach(function(d){if(!d||d===ALKU)return;var l=N[d]||(N[d]=[]);ks.forEach(function(s){if(s!==d&&s!==ALKU&&l.indexOf(s)<0)l.push(s);});});return;}
    ks.forEach(function(s){var r=R[s]||(R[s]={o:[],x:[]});e.on.map(k).forEach(function(d){if(d&&d!==s&&d!==ALKU&&r.o.indexOf(d)<0)r.o.push(d);});
      if(s!==ALKU)e.off.map(k).forEach(function(d){if(d&&d!==s&&d!==ALKU&&r.x.indexOf(d)<0&&r.o.indexOf(d)<0)r.x.push(d);});if(!r.o.length&&!r.x.length)delete R[s];});});
  P.rules=R;P.need=N;P.mx=M;return P;}
/* Puun ehdon esteet: muodot, joita puu ei osaa (Kaikki vain tuo, palikka tulee joko jostakin tai kaikista syistä, yksi Kaikki-ehto per palikka,
   Alku vain Jokin-ehdon syynä) ja kehä (vaatii kaikki ja ennen ovat yhdessä suunnattu verkko). Palauttaa syyn tai ''. */
function treeEhBlock(P,E,e,nm){if(!e.k.length)return '';var A='p:'+ALKU;
  if(e.k.indexOf(A)>=0&&(e.ty==='x'||e.all||e.off.length))return 'Alku käy syyksi vain Jokin-ehdossa, joka tuo.';
  if(e.all&&e.off.length)return 'Puussa Kaikki-ehto voi vain tuoda.';
  var S={},cf=null;(E||[]).forEach(function(f){if(f.ty==='x'||f.all)return;f.k.forEach(function(s){var o=S[s]||(S[s]={on:{},off:{}});f.on.forEach(function(d){o.on[d]=1;});f.off.forEach(function(d){o.off[d]=1;});});});
  Object.keys(S).forEach(function(s){if(!cf)Object.keys(S[s].on).forEach(function(d){if(!cf&&S[s].off[d])cf=[s,d];});});
  if(cf)return nm(cf[0])+' ei voi sekä tuoda että poissulkea: '+nm(cf[1])+'.';
  var c=null;(E||[]).forEach(function(f){if(c||f===e||f.ty==='x'||!f.k.length)return;e.on.forEach(function(d){if(!c&&f.on.indexOf(d)>=0&&(e.all||f.all)&&e.ty!=='x')c=[f,d];});});
  if(c)return c[0].all&&e.all?nm(c[1])+' tulee jo toisesta Kaikki-ehdosta. Puussa palikalla on yksi Kaikki-ehto.':nm(c[1])+' tulee jo '+(c[0].all?'Kaikki':'Jokin')+'-ehdosta. Puussa palikka tulee joko jostakin syystä tai kaikista.';
  var Q={rules:{},need:{},order:P.order,mx:[],text:P.text};ehTree(Q,E);var G=edgesOf(Q),cy=null;Object.keys(G).forEach(function(a){if(cy)return;(G[a]||[]).forEach(function(b){if(!cy&&pathOf(G,b,a))cy=[a,b];});});
  return cy?'Kehä: '+nm('p:'+cy[0])+' ja '+nm('p:'+cy[1])+' vaatisivat toisensa.':'';}
function ehSame(a,b){return a.length===b.length&&a.every(function(x){return b.indexOf(x)>=0;});}
function ehCauseTxt(e,nm){return e.k.map(nm).join(e.ty==='x'?', ':e.all?' ja ':' tai ');}
function ehIssues(E,e,nm){var r={block:'',notes:[],dup:-1};if(!e.k.length)return r;
  E.forEach(function(f,i){if(f!==e&&r.dup<0&&f.k.length&&(f.ty||'')===(e.ty||'')&&ehSame(f.k,e.k)&&!!f.all===!!e.all&&ehSame(f.on,e.on)&&ehSame(f.off,e.off))r.dup=i;});
  var single=function(f,a){return f.k.indexOf(a)>=0&&(f.k.length===1||!f.all);};
  if(e.ty!=='x'){var own=e.k.filter(function(x){return e.on.indexOf(x)>=0||e.off.indexOf(x)>=0;})[0];if(own){r.block=nm(own)+' ei voi olla oman ehtonsa seuraus.';return r;}}
  E.forEach(function(f,i){if(r.block||f===e||!f.k.length)return;var n=i+1;
    if(e.ty!=='x'&&f.ty!=='x'&&ehSame(f.k,e.k)&&!!f.all===!!e.all){var c=e.on.filter(function(x){return f.off.indexOf(x)>=0;}).concat(e.off.filter(function(x){return f.on.indexOf(x)>=0;}))[0];
      if(c){var fo=f.on.indexOf(c)>=0;r.block='Ristiriita: ehto '+n+' '+(fo?'tuo':'vie')+' '+nm(c)+(fo?' esiin':' pois')+' samoilla syillä.';return;}}
    var X=e.ty==='x'?e:f.ty==='x'?f:null,O=X===e?f:e;if(!X||O.ty==='x')return;
    var a=X.k.filter(function(m){return single(O,m);}),b=O.on.filter(function(m){return X.k.indexOf(m)>=0&&a.some(function(q){return q!==m;});})[0];
    if(b){var q=a.filter(function(m){return m!==b;})[0];r.block='Ristiriita: '+nm(q)+' ja '+nm(b)+' ovat poissulkevia, mutta '+(X===e?'ehto '+n+' tuo':'tämä ehto tuo')+' '+nm(b)+', kun '+nm(q)+'.';}});
  if(r.block)return r;
  E.forEach(function(f,i){if(f===e||!f.k.length)return;var n=i+1,t=function(s){r.notes.push({id:f.id,n:n,txt:s});};
    if(e.ty==='x'){if(f.ty!=='x')f.on.forEach(function(x){if(e.k.indexOf(x)>=0)t('Ehto '+n+' tuo '+nm(x)+', kun '+ehCauseTxt(f,nm)+'. Jos toinen poissulkevista on kuitattu, '+nm(x)+' jää pois.');});return;}
    e.on.forEach(function(x){if(f.ty==='x'){if(f.k.indexOf(x)>=0)t('Ehto '+n+': '+nm(x)+' on poissulkeva ('+ehCauseTxt(f,nm)+'). Poissulku voittaa.');}else if(f.off.indexOf(x)>=0)t('Ehto '+n+' vie '+nm(x)+' pois, kun '+ehCauseTxt(f,nm)+'. Poissulku voittaa.');});
    e.off.forEach(function(x){if(f.ty!=='x'&&f.on.indexOf(x)>=0)t('Ehto '+n+' tuo '+nm(x)+' esiin, kun '+ehCauseTxt(f,nm)+'. Tämä poissulku voittaa.');});});
  return r;}
function chkDone(row,now,ctx){if(ctx&&(ctx.z||(ctx.mn&&ctx.mn.length)))return false;var L=chkItems(row,ctx,now);
  /* 1.78: rivi, jonka kaikki ryhmän jäsenet ovat listan muilla riveillä, on pelkkä toteamus: valmis, kun ryhmä toteutuu */
  if(!L.length){if(ctx&&ctx.workflow)return true;var G=ctx&&ctx.gs||[];if(!G.length)return true;var g=G.filter(function(x){return x.ok;}).length;return row.any?g>0:g===G.length;}var n=L.filter(function(v){return v.ok;}).length;return row.any?n>0:n===L.length;}
function workflowReady(rows,now,ctxOf){return rows.every(function(r){return chkDone(r,now,ctxOf(r));});}
/* 1.104 Viikot (Emil 15.11.2026, Mätsik 1.5/1.9/1.14): rivin asiat viikoittain kuluvasta viikosta eteenpäin (nW viikkoa).
   Asia osuu viikolle, jolloin sen kuittaus uusiutuu (renewAt); kuittaamaton ja myöhässä oleva kuluvalle viikolle. Kuluvalla viikolla kuitattu
   näkyy kuluvalla viikolla kuitattuna. Pikapäivät PK = [{it, iso, done, nid}]: päivän viikolle, kuittaamaton mennyt kuluvalle viikolle.
   Tulos: [{mon, n (avoimet), d (kuitatut), it:[{k:'i'|'p', id, due?, late?, ok?, iso?, nid?}]}] */
function monOf(iso){var d=fromIso(iso);return isoD(addDays(d,-((d.getDay()+6)%7)));}
function wkIdx(m0,iso){return Math.round((fromIso(monOf(iso))-fromIso(m0))/(7*864e5));}
function wkRow(r,cx,now,today,PK,nW){var m0=monOf(today),W=[],t0=fromIso(m0).getTime();nW=nW||14;
  for(var i=0;i<nW;i++)W.push({mon:isoD(addDays(fromIso(m0),7*i)),n:0,d:0,it:[]});
  chkItems(r,cx,now).forEach(function(v){var ev=v.x?evOf(v.x,cx):0,okT=v.x&&v.x.ok?ms(v.x.ok):0;
    if(!v.ok){var lt=v.since&&v.since<fromIso(today).getTime();W[0].it.push({k:'i',id:v.id,late:lt?isoD(new Date(v.since)):null});W[0].n++;return;}
    if(okT>=t0){W[0].it.push({k:'i',id:v.id,ok:v.x.ok});W[0].d++;}
    var t=renewAt(v.x.ok,ev);if(t===Infinity)return;var due=isoD(new Date(t)),k=wkIdx(m0,due);if(k<0)k=0;
    if(k<nW){W[k].it.push({k:'i',id:v.id,due:due});W[k].n++;}});
  (PK||[]).forEach(function(p){var k=wkIdx(m0,p.iso);if(k<0){if(p.done)return;k=0;}if(k>=nW)return;var o={k:'p',id:p.it,iso:p.iso,nid:p.nid};
    if(p.done)o.ok=p.done;else if(p.iso<today)o.late=p.iso;W[k].it.push(o);if(p.done)W[k].d++;else W[k].n++;});
  return W;}
/* Viikon ruudun tila: red = avointa kuluvalla viikolla, yel = avointa tulevalla, ok = kaikki kuitattu, '' = ei mitään */
function wkTone(w,k){return w.n?(k===0?'red':'yel'):w.d?'ok':'';}
/* Päivä tekstiin tai tekstistä (1.103:n Päivät-valitsimen sääntö): pp.kk.vvvv pilkulla edellisen päiväyksen perään tai ensimmäisen rivin loppuun;
   olemassa oleva yksittäinen päiväys poistetaan erottimineen. */
function dayTextDays(t,base,nl){var o={};parseDates(t,base,nl).forEach(function(x){if(plain(x)&&x.R[0]===x.R[1]&&!o[x.R[0]])o[x.R[0]]=x;});return o;}
function dayTextToggle(t,iso,base,nl){var D=dayTextDays(t,base,nl),x=D[iso];
  if(x){var a=x.s,b=x.e;if(/,\s*$/.test(t.slice(0,a))&&a>0){a=t.slice(0,a).replace(/,\s*$/,'').length;}else if(/^\s*,\s*/.test(t.slice(b)))b+=t.slice(b).match(/^\s*,\s*/)[0].length;
    return (t.slice(0,a)+t.slice(b)).replace(/[ \t]{2,}/g,' ');}
  var d=fromIso(iso),tok=d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear(),last=null;Object.keys(D).forEach(function(k){if(!last||D[k].e>last.e)last=D[k];});
  if(last)return t.slice(0,last.e)+', '+tok+t.slice(last.e);var nl2=t.indexOf('\n'),e=nl2<0?t.length:nl2,head=t.slice(0,e).replace(/\s+$/,'');return head+(head?' ':'')+tok+t.slice(e);}
function chkDue(row,now,ctx){var V=chkView(row,ctx,now);if(chkDone(row,now,ctx)){return V.filter(function(v){return v.z;});}return V.filter(function(v){return !v.ok&&!v.off&&!v.base;});}
function chkRank(row,rk,today,now,ctx){var r=Infinity;chkDue(row,now,ctx).forEach(function(v){var k=rk[v.id];if(k!==undefined&&k<r)r=k;});return r;}
/* Tasatilanne: milloin tärkeimmän arvoinen kohde laukesi (varhaisin ensin) */
function chkSince(row,rk,now,ctx){var r=chkRank(row,rk,null,now,ctx),s=Infinity;chkDue(row,now,ctx).forEach(function(v){var k=rk[v.id];if((r===Infinity||k===r)&&v.since!==null&&v.since<s)s=v.since;});return s;}
/* Seuraava laukeaminen (ms) tai Infinity: kohteen kuittauksen raukeaminen tai tekstin seuraava päivä */
function chkNext(row,now,ctx){var m=ctx&&ctx.nz?ctx.nz:Infinity;if(ctx&&ctx.mnz&&ctx.mnz<m)m=ctx.mnz;chkItems(row,ctx,now).forEach(function(v){var x=v.x,ev=evOf(x,ctx);if(v.ok&&ev){var t=renewAt(x.ok,ev);if(t<m)m=t;}});return m;}
function chkOpenN(row,now,ctx){return chkDue(row,now,ctx).length;}
/* Aikaehdotukset (Emil 23.10.2026, 1.49): lista ehdottaa lauenneille (kuittaamattomille) kohteille kellonajat vapaista väleistä.
   Kalenteriin ei kirjoiteta mitään itsestään. Aikaväli on viikonpäivän oma (win = {0–6: {s,e}} minuutteina, 0 = sunnuntai), oletus 8–16.
   Kohteet tärkeysjärjestyksessä riviin katsomatta (tasatilanteessa varhaisin lauennut), kukin ensimmäiseen väliin, johon se mahtuu
   kokonaan; peräkkäin mahtuu useita. Tälle päivälle mahtumattomat saavat ajan seuraavilta päiviltä (o.day(i), enintään o.n päivää).
   Jos mikään ei ole lauennut (dry), aikoja ei ehdoteta: samalla laskulla saadaan vain rivien järjestys (seuraavat kohteet). */
var WIN0={s:480,e:960};
/* Kalenterin näkymä projektikohtaisesti (Emil 23.10.2026, 1.54): calv = {s,e: näkyvä päivä minuutteina (tasatunnit), off: [0–6] pois käytöstä olevat viikonpäivät (0 = su)}.
   Vain alku ja loppu, ei taukoja keskelle. null = koko vuorokausi, kaikki päivät. */
function calvOf(c){if(!c||typeof c!=='object')return null;var a=Math.round(+c.s/60)*60,b=Math.round(+c.e/60)*60,off=(Array.isArray(c.off)?c.off:[]).map(Number).filter(function(x,i,A){return x>=0&&x<=6&&x===Math.floor(x)&&A.indexOf(x)===i;}).sort();
  if(!(a>=0&&b<=1440&&b>a)){a=0;b=1440;}if(off.length>6)off=off.slice(0,6);if(a===0&&b===1440&&!off.length)return null;return {s:a,e:b,off:off};}
function calvOut(c){c=calvOf(c);return c||undefined;}
/* Päivän merkinnät näkyvään aikaan: kokonaan näkyvän ajan ulkopuoliset kellonajat koko päivän merkinnöiksi (osittain näkyvä rajataan piirrettäessä) */
function clipDay(E,v){if(!v)return E;var t=[],u=E.untimed.slice();E.timed.forEach(function(x){if(x.e<=v.s||x.s>=v.e)u.push(x);else t.push(x);});return {timed:t,untimed:u};}
function winOf(win,wd){var w=win&&win[String(wd)];return w&&w.e>w.s?{s:w.s,e:w.e}:{s:WIN0.s,e:WIN0.e};}
function durOf(T,def){var d=Math.round(+(T&&T.dur));return d>=5&&d<=720?d:def;}
function planSlots(items,busy,win,from){var B=(busy||[]).map(function(b){return [b[0],b[1]];}),out={},lo=Math.max(win.s,from||0);
  items.forEach(function(it){var d=it.dur;if(!(d>0))return;B.sort(function(a,b){return a[0]-b[0];});var t=lo;
    for(var i=0;i<=B.length;i++){var nb=i<B.length?B[i]:[win.e,win.e];if(nb[1]<=t)continue;
      if(nb[0]-t>=d){out[it.k]={s:t,e:t+d};B.push([t,t+d]);return;}t=Math.max(t,nb[1]);if(t+d>win.e)return;}});
  return out;}
function chkPlan(rows,rk,now,ctxOf,o){var due=[],pre=[];
  rows.forEach(function(r){var c=ctxOf?ctxOf(r):null;chkItems(r,c,now).forEach(function(v){var it={k:r.id+'|'+v.id,r:r,v:v,dur:o.dur(v.id),rank:rk[v.id]===undefined?Infinity:rk[v.id],since:v.since===null?Infinity:v.since};if(!(it.dur>0))return;
    if(!v.ok){if(!(o.skip&&o.skip(r,v)))due.push(it);return;}var ev=evOf(v.x,c),ra=ev?renewAt(v.x.ok,ev):Infinity;if(ra<Infinity){it.since=ra;pre.push(it);}});});
  var dry=!due.length,left=(dry?pre:due).sort(function(a,b){return a.rank!==b.rank?(a.rank<b.rank?-1:1):a.since-b.since;}),out=[];
  for(var i=0;i<(o.n||14)&&left.length;i++){var D=o.day(i),P=planSlots(left,D.busy,D.win,D.from),rest=[];
    left.forEach(function(it){var q=P[it.k];if(q){it.d=D.iso;it.s=q.s;it.e=q.e;out.push(it);}else rest.push(it);});left=rest;}
  out.sort(function(a,b){return a.d!==b.d?(a.d<b.d?-1:1):a.s-b.s;});return {list:out,miss:left.length,dry:dry};}
/* 1.100: pk = rivin poimimat tekstit (rowPicks). Avoin teksti tekee rivistä avoimen ja nostaa sitä tekstin asiasanan tärkeydellä;
   tasatilanteessa varhaisempi päivä ensin. Odottava toistuva teksti tuo seuraavan päivänsä odottavien järjestykseen. */
function chkSort(rows,rk,today,now,ctxOf,pk){var r={},d={},s={},nx={},ix={};rows.forEach(function(x,i){var c=ctxOf?ctxOf(x):null;r[x.id]=chkRank(x,rk,today,now,c);d[x.id]=chkOpenN(x,now,c)?0:1;s[x.id]=chkSince(x,rk,now,c);nx[x.id]=chkNext(x,now,c);ix[x.id]=i;
    var P=pk&&pk[x.id];if(!P||!P.length)return;var pd=function(t){var m=/^\d{4}-\d\d-\d\d/.test(t||'')?fromIso(t.slice(0,10)).getTime():Infinity;return isNaN(m)?Infinity:m;};
    P.forEach(function(q){if(q.st==='open'){var k=q.rank,t=pd(q.sort);if(d[x.id]||k<r[x.id]){r[x.id]=k;s[x.id]=t;}else if(k===r[x.id]&&t<s[x.id])s[x.id]=t;d[x.id]=0;}
      else if(q.st==='wait'&&q.next){var t2=pd(q.next);if(t2<nx[x.id])nx[x.id]=t2;}});});
  return rows.slice().sort(function(a,b){if(d[a.id]!==d[b.id])return d[a.id]-d[b.id];
    if(!d[a.id]){if(r[a.id]!==r[b.id])return r[a.id]<r[b.id]?-1:1;if(s[a.id]!==s[b.id])return s[a.id]<s[b.id]?-1:1;}
    else if(nx[a.id]!==nx[b.id])return nx[a.id]<nx[b.id]?-1:1;return ix[a.id]-ix[b.id];});}
/* Aikakohde tekstin päivistä: Myöhässä (kuittaamaton mennyt päivä) > Tänään > Huomenna. keys = kuitattavat kohdat (N.pts).
   nz = milloin seuraava tuleva päivä muuttuu Huomenna-kohteeksi. Kuitattu muistiinpano (done) ei laukaise. */
function chkTime(N,today,allow){var out={z:null,nz:null};if(!N||gone(N,today))return out;var tm=isoD(addDays(fromIso(today),1)),B={'z:late':[],'z:today':[],'z:tomorrow':[]},late=Infinity;
  noteDates(N).forEach(function(o){var k=nextOcc(o,today);
    if(k){var key=occKey(k,o);if(ptDone(N,key))return;if(k===today)B['z:today'].push(key);else if(k===tm)B['z:tomorrow'].push(key);else{var t=addDays(fromIso(k),-1).getTime();if(out.nz===null||t<out.nz)out.nz=t;}return;}
    if(plain(o)){var e=o.R[1],key2=occKey(e,o);if(ptDone(N,key2))return;B['z:late'].push(key2);var t2=addDays(fromIso(e),1).getTime();if(t2<late)late=t2;}});
  var T=fromIso(today).getTime();
  /* Valitut aikasanat (1.51): jos rivi tai sen ryhmä valitsee aikasanoja, vain ne laukeavat; ilman valintaa kaikki */
  if(allow&&allow.length)Object.keys(B).forEach(function(k){if(allow.indexOf(k)<0)B[k]=[];});
  if(B['z:late'].length)out.z={id:'z:late',keys:B['z:late'],since:late};else if(B['z:today'].length)out.z={id:'z:today',keys:B['z:today'],since:T};
  else if(B['z:tomorrow'].length)out.z={id:'z:tomorrow',keys:B['z:tomorrow'],since:T};return out;}
/* Mainittu (Emil 22.10.2026, 1.44): rivin erikoiskohde (row.men). Avoin muistiinpano (ei rivin omaa), jossa mainitaan rivin nimi
   (sama tunnistus kuin asiasanalla) ja jonka päivä on Myöhässä, Tänään tai Huomenna, on rivillä oma aikakohteensa.
   Palauttaa {mn:[{nid, z}], mnz: seuraava tuleva laukeaminen tai null}. Ilman valintaa nimi ei vaikuta mihinkään. */
function chkMentions(row,notes,today,on){var out={mn:[],mnz:null};if(!(row.men||on)||!clean(row.name))return out;var T={id:'m',name:row.name,yes:[],no:[]};
  (notes||[]).forEach(function(N){if(gone(N,today)||N.id===row.nid)return;var SP=sepParts(N.text);noteParts(N.text).forEach(function(p,i){if(!termOn(T,p.t))return;
    var t=chkTime(SP?partNote(N,i,today):N,today),m={nid:N.id,z:t.z};if(SP)m.pi=i;if(t.z)out.mn.push(m);else if(t.nz!==null&&(out.mnz===null||t.nz<out.mnz))out.mnz=t.nz;});});
  return out;}
/* Kohteen napautus listalla: tehty ↔ tekemättä (rauennut kuittaus kuitataan uudelleen) */
function toggleItem(x,now,ev){if(itemOk(x,now,ev))delete x.ok;else x.ok=(now||new Date()).toISOString();return x;}
/* Toistuvat muistutukset (vaihe 11, Emil 21.10.2026). Rekisteri R={id,text,mode,n,unit,start,lastDue?,lastDone?}:
   mode 'every' = tasavälein aloituspäivästä, 'after' = n yksikköä edellisestä kuittauksesta. unit d/w/m/y.
   Erä on tavallinen muistiinpano {rep:R.id, date:eräpäivä}. Uutta ei tehdä, jos edellinen on kuittaamatta; myöhästyneistä tehdään vain viimeisin. */
var REP_UNITS={d:['päivä','päivää'],w:['viikko','viikkoa'],m:['kuukausi','kuukautta'],y:['vuosi','vuotta']};
function addUnit(iso,n,unit){var d=fromIso(iso);if(unit==='d')d=addDays(d,n);else if(unit==='w')d=addDays(d,7*n);
  else{var mm=unit==='y'?12*n:n,day=d.getDate(),x=new Date(d.getFullYear(),d.getMonth()+mm,1),last=new Date(x.getFullYear(),x.getMonth()+1,0).getDate();d=new Date(x.getFullYear(),x.getMonth(),Math.min(day,last));}
  return isoD(d);}
function repNext(R){var n=Math.max(1,+R.n||1);if(R.mode==='after'){if(!R.lastDue)return R.start;return R.lastDone?addUnit(R.lastDone,n,R.unit):null;}
  /* tasavälein: aina aloituspäivästä laskien, ettei kuun loppu valu (31. → 28. → 28.) */
  var k=0,d=R.start;while(R.lastDue&&d<=R.lastDue&&k<5000)d=addUnit(R.start,++k*n,R.unit);return d;}
function repLabel(R){var n=Math.max(1,+R.n||1),u=REP_UNITS[R.unit]||REP_UNITS.d;
  return R.mode==='after'?(n===1?'1 '+u[0]:n+' '+u[1])+' kuittauksesta':(n===1?'Joka '+(R.unit==='d'?'päivä':R.unit==='w'?'viikko':R.unit==='m'?'kuukausi':'vuosi'):n+' '+u[1]+' välein');}
/* Laukaisimet (vaihe 12, Emil 21.10.2026): mode 'trig', terms=[termi-id], all=true jos kaikki samassa muistiinpanossa.
   Muistutus tulee, kun n yksikköön ei ole kuitattu muistiinpanoa, jossa termiehto täyttyy. Aika lasketaan viimeisimmästä
   osuvasta kuittauksesta, seurannan alusta tai edellisen automaattisen muistiinpanon kuittauksesta (myöhäisin). */
var TRIG_UNITS={d:'päivään',w:'viikkoon',m:'kuukauteen',y:'vuoteen'};
function trigHit(R,n,AT){var ts=R.terms||[];if(!ts.length)return false;
  return partTerms(AT,n.text).some(function(ids){return R.all?ts.every(function(t){return ids.indexOf(t)>=0;}):ts.some(function(t){return ids.indexOf(t)>=0;});});}
function trigLast(R,notes,AT){var L=R.start;if(R.lastDone&&R.lastDone>L)L=R.lastDone;
  (notes||[]).forEach(function(n){if(!n.done||n.rep===R.id)return;var d=isoD(new Date(n.done));if(d>L&&trigHit(R,n,AT))L=d;});return L;}
function trigNext(R,notes,AT){return addUnit(trigLast(R,notes,AT),Math.max(1,+R.n||1),R.unit);}
function trigLabel(R){var n=Math.max(1,+R.n||1);return 'Jos ei '+n+' '+(TRIG_UNITS[R.unit]||TRIG_UNITS.d);}
function repsDue(reps,notes,today,now,AT){var made=[];(reps||[]).forEach(function(R){
    if((notes||[]).some(function(n){return n.rep===R.id&&!n.done;}))return;
    var d=R.mode==='trig'?(AT?trigNext(R,notes,AT):null):repNext(R);if(!d||d>today)return;
    if(R.mode==='every'){var k=0;while(k++<5000){var Y={start:R.start,n:R.n,unit:R.unit,lastDue:d},nx=repNext(Y);if(nx>today)break;d=nx;}}
    var N={id:'r'+R.id+'-'+d,created:now,edited:now,text:R.text,date:d,rep:R.id};R.lastDue=d;made.push(N);});
  return made;}
function repSignOff(reps,N,iso){if(!N||!N.rep)return;(reps||[]).forEach(function(R){if(R.id===N.rep)R.lastDone=iso;});}
/* Roskakori: poistetut säilyvät 30 päivää */
function purgeTrash(trash,now){var lim=now-30*864e5;return (trash||[]).filter(function(n){return new Date(n.deleted).getTime()>=lim;});}
function fiDate(iso){var p=String(iso).split('-');return (+p[2])+'.'+(+p[1])+'.'+p[0];}
function stamp(ts){var d=new Date(ts);return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()+' klo '+d.getHours()+'.'+pad(d.getMinutes());}

/* ---- tallennusmuoto ----
   {app:'paatospuu', ver, savedAt, cur, projektit:[{id,name,text,rt,rules,mx,need?,order?,flip?,end?,mem?,flow?,session:{start,steps:[{p,d,m?}],date?,log,logAt}}] (rt:1 = säännöt luetaan tekstistä, rules ym. ovat kopio), muistiinpanot:[{id,created,edited,text,date,time?:{s,e},done?:kuittausaika}], roskakori:[muistiinpano+deleted], tarkeat:[tärkeiden termien id:t järjestyksessä] (1.18:n jarjestys jätetään lukematta),
    termit:[{id,name,yes,no}], termisanat:{nimi:{yes,no}}, cfg:{tint,mode}} */
function normMv(a){if(!Array.isArray(a))return null;var L=a.filter(function(m){return m&&typeof m.w==='string'&&m.w&&Array.isArray(m.h);}).map(function(m){return {w:m.w,h:m.h.filter(function(x){return x&&typeof x.t==='string'&&typeof x.at==='string';}).map(function(x){return {t:x.t,at:x.at};})};}).filter(function(m){return m.h.length;});return L.length?L:null;}
/* Asiasanan lisätiedot (1.43): ev = uusiutuu päivän päästä kuittauksesta (listan kohteena), info = kuvaus, joka aukeaa listassa ⓘ-napista */
function evDays(v){var n=Math.round(+v);return n>0&&n<10000?n:0;}
function hasRenew(w){return !!(w&&(evDays(w.ev)||evWd(w.wd).length||evMd(w.md).length));}
function termExtra(T,src){if(typeof src.wflow==='string'&&src.wflow)T.wflow=src.wflow;var e=evDays(src.ev),wd=evWd(src.wd),md=evMd(src.md);if(e)T.ev=e;if(wd.length)T.wd=wd;if(md.length)T.md=md;var du=Math.round(+src.dur);if(du>=5&&du<=720)T.dur=du;if(typeof src.info==='string'&&clean(src.info))T.info=String(src.info).replace(/\s+$/,'').slice(0,2000);if((src.once===true||src.once===1)&&!e&&!wd.length&&!md.length)T.once=1;return T;}
function strs(a){return Array.isArray(a)?a.filter(function(x){return typeof x==='string';}):[];}
/* Versio 2 (vaihe 10, Emil 21.10.2026): kokonaisuudet = projektit, joissa on useita puita ja omat muistiinpanot, termit ja tärkeät.
   Versio 1 (kaikki ylätasolla, puut kentässä projektit) luetaan yhdeksi projektiksi. Palauttaa myös aktiivisen projektin kentät ylätasolla. */
function normalizeData(o){if(!o||typeof o!=='object'||o.app!=='paatospuu')return null;
  var K=[];(Array.isArray(o.kokonaisuudet)?o.kokonaisuudet:[]).forEach(function(k){if(!k||typeof k!=='object'||typeof k.id!=='string'||K.some(function(x){return x.id===k.id;}))return;
    var st=normSet(k);st.id=k.id;var kc=cfgOf(k.asetukset);if(kc)st.cfg=kc;st.name=clean(k.name).slice(0,80)||'Projekti';
    if(typeof k.muokattu==='string')st.mod=k.muokattu;if(typeof k.viety==='string')st.ex=k.viety;if(typeof k.viematta==='string'&&/^\d{4}-\d\d-\d\d$/.test(k.viematta))st.chg=k.viematta;K.push(st);});
  if(!K.length){var st=normSet(o);st.id='k1';st.name='Projekti';K.push(st);}
  var kc=K.some(function(x){return x.id===o.kcur;})?o.kcur:K[0].id,a=K.filter(function(x){return x.id===kc;})[0];
  var out={K:K,k:kc,cur:a.cur,projects:a.projects,notes:a.notes,terms:a.terms,words:a.words,trash:a.trash,imp:a.imp,reps:a.reps,chk:a.chk,grp:a.grp,win:a.win,calv:a.calv,lists:a.lists,jl:a.jl,ehdot:a.ehdot,pk:a.pk,pv:a.pv,st:a.st,fl:a.fl,cfg:{}};
  out.cfg=cfgOf(o.cfg)||{};
  /* 1.63 (Emil 23.10.2026): asetukset ovat projektikohtaisia (asetukset). Vanhassa tallennuksessa kaikki projektit saavat yhteiset asetukset. */
  K.forEach(function(k){if(!k.cfg)k.cfg=cfgOf(o.cfg)||{};});out.cfg=a.cfg;
  return out;}
/* 1.86: tint ja pal luetaan vain vanhan valinnan muuntamiseksi värikoneelle; kh–kp värikone, d-alkuiset tumman asun omat arvot */
var CFGK=['tint','mode','size','font','edge','glass','dur','plan','tun','read','pal','look','bshape','bsize','bedge','bfx','ck','art','artpos',
  'kh','kc','ks','kk','kp','blur','dim','dkh','dkc','dks','dkk','dkp','dbfx','dblur','ddim','kt','wl','wlk','wlno','wlyes','tz','ilme','lacc','dacc','lhf','dhf'];
function cfgOf(c){if(!c||typeof c!=='object')return null;var o={};CFGK.forEach(function(k){if(typeof c[k]==='string')o[k]=c[k];});return o;}
/* Yksittäisen projektin tiedosto (1.24): {app:'paatospuu', laji:'projekti', projekti:{name, puut, muistiinpanot, termit, ...}}.
   Tunnisteet saavat puuttua (tekoälyn kirjoittama, ks. PROJEKTIMUOTO.md); puun säännöt ovat tekstissä. Myös koko varmuuskopiosta
   saa projektit lisättäviksi. Palauttaa normalisoidut projektit (ilman id:tä) tai null. */
function projectsFromFile(o,today){if(!o||typeof o!=='object'||o.app!=='paatospuu')return null;
  var one=o.laji==='projekti'||!!o.projekti,list=o.projekti&&typeof o.projekti==='object'?[o.projekti]:Array.isArray(o.kokonaisuudet)?o.kokonaisuudet:[o],out=[];
  list.forEach(function(k){if(!k||typeof k!=='object')return;var c=fillIds(k,one,today||isoD(new Date())),st=normSet(c),kc=cfgOf(k.asetukset);if(kc)st.cfg=kc;st.name=clean(k.name).slice(0,80)||'Projekti';
    if(!st.projects.some(function(P){return P.id===st.cur;}))st.cur=st.projects.length?st.projects[0].id:null;out.push(st);});
  return out.length?out:null;}
function fillIds(k,one,today){var c={},n=0;Object.keys(k).forEach(function(f){c[f]=k[f];});
  ['puut','muistiinpanot','termit','toistuvat','tarkistuslista','ryhmat'].forEach(function(f){if(!Array.isArray(c[f]))return;c[f]=c[f].map(function(x){if(!x||typeof x!=='object')return x;var y={};Object.keys(x).forEach(function(q){y[q]=x[q];});
    if(typeof y.id!=='string'||!y.id)y.id=f.charAt(0)+'_'+(++n);if(f==='puut'&&one&&y.rt===undefined)y.rt=1;if(f==='toistuvat'&&!y.start)y.start=today;return y;});});
  return c;}
/* Vientitiedoston nimi aina sama (Emil 22.10.2026): projekti = ”Nimi (Juuri).json”, koko appi = ”Juuri.json” (nimi Juuri, Emil 22.10.2026; app-tunniste paatospuu ennallaan, joten vanhat varmuuskopiot käyvät). Tiedostonimeen
   kelpaamattomat merkit jätetään pois, jotta puhelin tarjoaa korvaamista. */
var APPNAME='Kaikki';
function safeName(t){return String(t||'').replace(/[\\\/:*?"<>|\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().replace(/^\.+|\.+$/g,'').slice(0,80);}
function expName(name){return name===undefined||name===null?APPNAME+'.json':(safeName(name)||'Projekti')+' ('+APPNAME+').json';}
/* Pallero: viemättömiä muutoksia ja vuorokausi on vaihtunut ensimmäisen viemättömän muutoksen jälkeen */
function staleK(k,today){return !!(k&&k.chg&&k.chg<today);}
function projectFile(k,now){return {app:'paatospuu',laji:'projekti',ver:VER,savedAt:now,projekti:{id:k.id,name:k.name,muokattu:k.mod||undefined,cur:k.cur,puut:k.projects,muistiinpanot:k.notes,termit:k.terms,termisanat:k.words,tarkeat:k.imp,toistuvat:k.reps,tarkistuslista:k.chk&&k.chk.length?k.chk:undefined,ryhmat:k.grp&&k.grp.length?k.grp:undefined,listat:k.lists&&k.lists.length?k.lists:undefined,jatkuvalista:k.jl||undefined,ehdot:k.ehdot&&k.ehdot.length?k.ehdot:undefined,pikat:k.pk&&k.pk.length?k.pk:undefined,paivanapit:pvOut(k.pv),yksinkertaisetPuut:k.st&&k.st.length?k.st:undefined,flow:flOut(k.fl),asetukset:k.cfg||undefined,aikavalit:k.win&&Object.keys(k.win).length?k.win:undefined,kalenteri:calvOut(k.calv)}};}
/* 1.95: yhteinen vaihe ja sen rivikohtainen suoritus. Idempotentti siirto vanhoille työnkulkuriveille. */
function phaseOf(S,id){return (S.grp||[]).filter(function(g){return g.id===id&&g.phase;})[0]||null;}
function phaseLegacyMembers(S,id){var old=(S.grp||[]).filter(function(g){return g.id===id;})[0];if(old)return old.m||[];
  if(id.slice(0,2)!=='a:')return [];var key=id.slice(2),out=[],seen={},AT=withText(S.terms||[],S.projects||[]).concat(autoTerms(S.projects||[],S.words||{},S.terms||[]));
  (S.projects||[]).forEach(function(P){var pt=parseText(P.text),g=pt.by[key];if(!g||g.k!=='g')return;(function walk(k){if(seen[k])return;seen[k]=1;opensOf(P,pt.items,k).forEach(function(x){var it=pt.by[x];if(!it)return;if(it.k==='g'){walk(x);return;}var t=AT.filter(function(t){return (t.key||keyOf(t.name))===x;})[0];if(t&&out.indexOf(t.id)<0)out.push(t.id);});})(key);});return out;}
function phaseEnsure(S){S.grp=S.grp||[];var changed=false;
  (S.chk||[]).forEach(function(r){var wf=(S.lists||[]).some(function(L){return L.id===r.l&&L.wf;}),g=phaseOf(S,r.sg);if(!wf&&!r.sg)return;
    if(!g){var m=[],add=function(id){if(typeof id==='string'&&!isSpec(id)&&m.indexOf(id)<0)m.push(id);};
      (r.it||[]).forEach(function(x){if(!x.t&&(r.sg||!x.g))add(x.id);});(r.g||[]).forEach(function(id){phaseLegacyMembers(S,id).forEach(add);});
      var id=r.sg||'v:'+r.id;while(S.grp.some(function(g){return g.id===id;}))id+='x';g={id:id,name:r.name||'Vaihe',m:m,phase:1};if(r.g&&r.g.length)g.aliases=r.g.slice();if(!r.any)g.all=1;S.grp.push(g);r.sg=id;changed=true;}
    var any=g.all?0:1;if(r.name!==g.name||!!r.any!==!!any||JSON.stringify(r.g||[])!==JSON.stringify([g.id]))changed=true;
    r.name=g.name;r.g=[g.id];if(any)r.any=1;else delete r.any;
    (r.it||[]).forEach(function(x){if(g.m.indexOf(x.id)>=0&&!x.g){x.g=1;changed=true;}});
  });return changed;}
function phaseAttach(S,gid,id,lid,at){var g=phaseOf(S,gid);if(!g)return null;var r={id:id,l:lid,sg:g.id,name:g.name,g:[g.id],created:at,edited:at,it:[]};if(!g.all)r.any=1;S.chk=S.chk||[];S.chk.push(r);return r;}


/* 1.96: pohja on tavallinen työnkulkulista; suoritus saa omat rivit ja lähtökohteen. */
function flowFind(S,tid,src,tpl){src=src||{};return (S.lists||[]).filter(function(L){var x=L.run;return x&&!x.done&&(!tpl||x.tpl===tpl)&&x.tid===tid&&(x.r||'')===(src.r||'')&&(x.n||'')===(src.n||'')&&(x.prev||'')===(src.prev||'')&&(x.epoch||'')===(src.epoch||'');})[0]||null;}
function flowStart(S,tid,tpl,src,id,at){src=src||{};var old=flowFind(S,tid,src,tpl);if(old)return {list:old,resume:1};
  var T=(S.lists||[]).filter(function(L){return L.id===tpl&&L.wf&&!L.run;})[0];if(!T)return {error:'Työnkulkupohjaa ei löydy. Valitse uusi asiasanan asetuksista.'};
  var source=(S.chk||[]).filter(function(r){return r.id===src.r;})[0],parent=source&&(S.lists||[]).filter(function(L){return L.id===source.l;})[0],seen={};
  while(parent&&parent.run){if(seen[parent.id]||parent.run.tpl===tpl)return {error:'Tämä työnkulku on jo avoinna tässä ketjussa. Sisäkkäinen kehä estettiin.'};seen[parent.id]=1;var r=(S.chk||[]).filter(function(r){return r.id===parent.run.r;})[0];parent=r&&(S.lists||[]).filter(function(L){return L.id===r.l;})[0];}
  phaseEnsure(S);var rows=(S.chk||[]).filter(function(r){return r.l===tpl;});if(!rows.length)return {error:'Työnkulkupohjassa ei ole vaiheita.'};
  var L={id:id,name:T.name,created:at,wf:1,run:{tpl:tpl,tid:tid}};if(T.eh)L.eh=1;['r','n','prev','epoch'].forEach(function(k){if(typeof src[k]==='string')L.run[k]=src[k];});S.lists.push(L);
  rows.forEach(function(r,i){var n=(S.notes||[]).filter(function(n){return n.id===r.nid;})[0],c=phaseAttach(S,r.sg,id+':'+i,id,at);if(c)c.runtext=n?n.text:r.runtext||'';});return {list:L};}
function flowFinish(S,L,at,ctxOf,linked){if(!L||!L.run||L.run.done)return {error:'Suoritus on jo valmis.'};var rows=(S.chk||[]).filter(function(r){return r.l===L.id;});
  if(!rows.length||!workflowReady(rows,new Date(at),ctxOf))return {error:'Työnkulussa on vielä kuitattavaa.'};
  var a=L.run,r=(S.chk||[]).filter(function(r){return r.id===a.r;})[0],x=r&&(r.it||[]).filter(function(x){return x.id===a.tid;})[0],P=r&&(S.lists||[]).filter(function(L){return L.id===r.l;})[0],credited=false;
  if(r&&linked(a.tid)===a.tpl&&(P&&P.epoch||'')===(a.epoch||'')&&(x&&x.ok||'')===(a.prev||'')&&!(P&&P.run&&P.run.done)){
    var c=ctxOf(r),v=chkItems(r,c,new Date(at)).filter(function(v){return v.id===a.tid&&!v.ok;})[0];if(v&&!(r.l&&r.any&&chkDone(r,new Date(at),c))){if(!x){x={id:a.tid};if(v.g)x.g=1;if(v.t)x.t=1;r.it.push(x);}x.ok=at;r.edited=at;credited=true;}}
  a.done=at;if(credited)a.credited=1;return {credited:credited};}

function normSet(o){var out={cur:typeof o.cur==='string'?o.cur:null,projects:[],notes:[],terms:[],words:{}},ids={};
  (Array.isArray(o.puut)?o.puut:Array.isArray(o.projektit)?o.projektit:[]).forEach(function(p){if(!p||typeof p.id!=='string'||ids[p.id])return;ids[p.id]=1;
    var P={id:p.id,name:clean(p.name)||'Nimetön',text:typeof p.text==='string'?p.text:'',rules:{},mx:[],session:null};
    if(p.rules&&typeof p.rules==='object')Object.keys(p.rules).forEach(function(k){var r=p.rules[k];if(!r)return;var o2=strs(r.o),x2=strs(r.x);if(o2.length||x2.length)P.rules[k]={o:o2,x:x2};});
    (Array.isArray(p.mx)?p.mx:[]).forEach(function(s){s=strs(s);if(s.length>1)P.mx.push(s);});
    if(p.need&&typeof p.need==='object'){P.need={};Object.keys(p.need).forEach(function(k){var n=strs(p.need[k]);if(n.length)P.need[k]=n;});}
    if(p.order&&typeof p.order==='object'){P.order={};Object.keys(p.order).forEach(function(k){var n=strs(p.order[k]);if(n.length)P.order[k]=n;});}
    if(p.end==='hoid')P.end='hoid';if(p.mem==='all')P.mem='all';if(p.flow==='prio')P.flow='prio';if(p.notes==='on')P.notes='on';
    /* Versiosta 1.16 säännöt ovat tekstissä (rt:1). Vanha tallennus: säännöt kirjoitetaan tekstiin kerran. */
    if(p.rt===1)rulesFromText(P);else P.text=writeRules(P.text,P);P.rt=1;
    var S=p.session;if(S&&Array.isArray(S.steps)&&S.steps.length){P.session={start:String(S.start||new Date().toISOString()),steps:S.steps.map(function(st){if(Array.isArray(st))return {p:strs(st),d:[]};var o3={p:strs(st&&st.p),d:strs(st&&st.d)};if(st&&typeof st.m==='string')o3.m=st.m;return o3;}).filter(function(st,i){return st.p.length||(i>0&&st.m);}),date:/^\d{4}-\d\d-\d\d$/.test(S.date||'')?S.date:undefined,log:strs(S.log),logAt:Array.isArray(S.logAt)?S.logAt.filter(function(n){return typeof n==='number';}):[]};}
    out.projects.push(P);});
  (Array.isArray(o.muistiinpanot)?o.muistiinpanot:[]).forEach(function(n){if(!n||typeof n.id!=='string'||typeof n.text!=='string')return;
    out.notes.push({id:n.id,created:String(n.created||new Date().toISOString()),edited:String(n.edited||n.created||new Date().toISOString()),text:n.text,date:/^\d{4}-\d\d-\d\d$/.test(n.date||'')?n.date:''});
    if(n.time&&/^\d\d:\d\d$/.test(n.time.s||''))out.notes[out.notes.length-1].time={s:n.time.s,e:/^\d\d:\d\d$/.test(n.time.e||'')?n.time.e:''};
    if(typeof n.done==='string'&&n.done)out.notes[out.notes.length-1].done=n.done;
    if(typeof n.arch==='string'&&n.arch)out.notes[out.notes.length-1].arch=n.arch;
    if(Array.isArray(n.tx))out.notes[out.notes.length-1].tx=n.tx.filter(function(e){return e&&typeof e.t==='string'&&typeof e.ok==='string'&&e.ok;}).map(function(e){return {t:e.t,i:typeof e.i==='number'?e.i:0,ok:e.ok};});
    if(n.pin===1||n.pin===true)out.notes[out.notes.length-1].pin=1;
    if(Array.isArray(n.rel)){var rl=n.rel.filter(function(L){return L&&typeof L.w==='string'&&typeof L.o==='string'&&typeof L.at==='string'&&/^\d{4}-\d\d-\d\d$/.test(String(L.d));}).map(function(L){return {w:L.w,o:L.o,at:L.at,d:L.d};});if(rl.length)out.notes[out.notes.length-1].rel=rl;}
    if(n.pts&&typeof n.pts==='object'){var pts={};Object.keys(n.pts).forEach(function(k){if(typeof n.pts[k]==='string')pts[k]=n.pts[k];});if(Object.keys(pts).length)out.notes[out.notes.length-1].pts=pts;}
    if(typeof n.rep==='string'&&n.rep)out.notes[out.notes.length-1].rep=n.rep;
    if(Array.isArray(n.rx)){var rx=strs(n.rx);if(rx.length)out.notes[out.notes.length-1].rx=rx;}
    if(n.pika&&typeof n.pika.it==='string'){var pq={it:n.pika.it};if(typeof n.pika.r==='string')pq.r=n.pika.r;out.notes[out.notes.length-1].pika=pq;}
    if(Array.isArray(n.nl)){var nl=n.nl.filter(function(L){return L&&typeof L.w==='string'&&L.w&&typeof L.at==='string';}).map(function(L){return {w:L.w,at:L.at};});if(nl.length)out.notes[out.notes.length-1].nl=nl;}
    if(Array.isArray(n.bt)){var bt=n.bt.filter(function(L){return L&&typeof L.w==='string'&&typeof L.at==='string'&&/^\d{4}-\d\d-\d\d$/.test(String(L.d));}).map(function(L){return {w:L.w,d:L.d,at:L.at};});if(bt.length)out.notes[out.notes.length-1].bt=bt;}if(n.pl&&typeof n.pl.r==='string'&&typeof n.pl.i==='string'){out.notes[out.notes.length-1].pl={r:n.pl.r,i:n.pl.i};if(typeof n.pl.ok==='string')out.notes[out.notes.length-1].pl.ok=n.pl.ok;}if(Array.isArray(n.rg)){var rg=n.rg.filter(function(L){return L&&typeof L.w==='string'&&typeof L.at==='string'&&/^\d{4}-\d\d-\d\d$/.test(String(L.a))&&/^\d{4}-\d\d-\d\d$/.test(String(L.b));}).map(function(L){return {w:L.w,a:L.a,b:L.b,at:L.at};});if(rg.length)out.notes[out.notes.length-1].rg=rg;}var mv=normMv(n.mv);if(mv)out.notes[out.notes.length-1].mv=mv;
    /* Kaikki 0.1: vaultin kentät (VAULT) */if(typeof n.vp==='string'&&n.vp){var VN=out.notes[out.notes.length-1];VN.vp=n.vp;VN.vfm=Array.isArray(n.vfm)?strs(n.vfm):null;VN.vpre=typeof n.vpre==='string'?n.vpre:'';VN.vpost=typeof n.vpost==='string'?n.vpost:'\n';VN.vh=!!n.vh;if(n.vnofm)VN.vnofm=true;}});
  var ISO=/^\d{4}-\d\d-\d\d$/;out.reps=[];(Array.isArray(o.toistuvat)?o.toistuvat:[]).forEach(function(R){if(!R||typeof R.id!=='string'||typeof R.text!=='string'||!ISO.test(R.start||''))return;
    var X={id:R.id,text:R.text,mode:R.mode==='after'||R.mode==='trig'?R.mode:'every',n:Math.max(1,Math.min(999,Math.round(+R.n)||1)),unit:REP_UNITS[R.unit]?R.unit:'d',start:R.start,created:String(R.created||'')};
    if(ISO.test(R.lastDue||''))X.lastDue=R.lastDue;if(ISO.test(R.lastDone||''))X.lastDone=R.lastDone;
    if(X.mode==='trig'){X.terms=(Array.isArray(R.terms)?R.terms:[]).filter(function(t){return typeof t==='string';});X.all=R.all===true;}out.reps.push(X);});
  out.chk=[];(Array.isArray(o.tarkistuslista)?o.tarkistuslista:[]).forEach(function(c){if(!c||typeof c.id!=='string'||out.chk.some(function(x){return x.id===c.id;}))return;
    var now=new Date().toISOString(),X={id:c.id,name:clean(c.name).slice(0,120),created:String(c.created||now),edited:String(c.edited||c.created||now),it:[]};
    /* 1.38:n tekijät (f) muuttuvat kohteiksi; koko rivin kuittaus kuittaa ne */
    var src=Array.isArray(c.it)?c.it:Array.isArray(c.f)?c.f.map(function(x){return x&&{id:x.id,ok:x.id&&String(x.id).slice(0,2)!=='z:'&&typeof c.ok==='string'?c.ok:undefined};}):[];
    src.forEach(function(x){if(!x||typeof x.id!=='string'||X.it.some(function(y){return y.id===x.id;}))return;var Y={id:x.id};if(typeof x.ok==='string'&&x.ok)Y.ok=x.ok;var ev=Math.round(+x.ev);if(ev>0&&ev<10000)Y.ev=ev;
      if(typeof x.at==='string'&&x.at)Y.at=x.at;if(x.t===1||x.t===true)Y.t=1;if(x.g===1||x.g===true)Y.g=1;X.it.push(Y);});
    var gl=strs(c.g).filter(function(x,i,a){return a.indexOf(x)===i;});if(gl.length)X.g=gl;
    if(typeof c.sg==='string'&&c.sg)X.sg=c.sg;if(typeof c.runtext==='string')X.runtext=c.runtext;if(c.any===true||c.any===1)X.any=1;if(typeof c.l==='string'&&c.l)X.l=c.l;if(Array.isArray(c.ei)){var ei=strs(c.ei).filter(function(x,i,a){return a.indexOf(x)===i;});if(ei.length)X.ei=ei;}if(c.men===true||c.men===1)X.men=1;if(c.px&&typeof c.px==='object'){var px={};if(c.px.n===1||c.px.n===true)px.n=1;var pt=strs(c.px.t).filter(function(x,i,a){return a.indexOf(x)===i;});if(pt.length)px.t=pt;if(px.n||px.t)X.px=px;}
    /* 1.41: muistiinpano on juuri. Vanhan rivin teksti, ajat ja kalenterikuittaukset siirtyvät omaksi muistiinpanokseen. */
    if(typeof c.nid==='string'&&out.notes.some(function(n){return n.id===c.nid;}))X.nid=c.nid;
    else if(typeof c.text==='string'&&clean(c.text)){var N={id:'n'+c.id,created:X.created,edited:X.edited,text:c.text,date:/^\d{4}-\d\d-\d\d$/.test(c.date||'')?c.date:''};
      if(c.time&&/^\d\d:\d\d$/.test(c.time.s||''))N.time={s:c.time.s,e:/^\d\d:\d\d$/.test(c.time.e||'')?c.time.e:''};
      if(c.pts&&typeof c.pts==='object'){var q={};Object.keys(c.pts).forEach(function(k){if(typeof c.pts[k]==='string')q[k]=c.pts[k];});if(Object.keys(q).length)N.pts=q;}
      var mv2=normMv(c.mv);if(mv2)N.mv=mv2;while(out.notes.some(function(n){return n.id===N.id;}))N.id+='x';out.notes.push(N);X.nid=N.id;}
    out.chk.push(X);});
  /* Listan ryhmät (Emil 22.10.2026, 1.42): pikavalinta, joka lisää jäsenensä riville yksittäisiksi kohteiksi. {id, name, m:[asiasanojen id:t]} */
  out.grp=[];(Array.isArray(o.ryhmat)?o.ryhmat:[]).forEach(function(g){if(!g||typeof g.id!=='string'||!clean(g.name)||out.grp.some(function(x){return x.id===g.id;}))return;
    var m=[];strs(g.m).forEach(function(id){if((id.slice(0,2)!=='z:'||isSpec(id))&&m.indexOf(id)<0)m.push(id);});var G={id:g.id,name:clean(g.name).slice(0,80),m:m};if(g.all)G.all=1;if(g.phase)G.phase=1;if(Array.isArray(g.aliases))G.aliases=strs(g.aliases);out.grp.push(G);});
  /* Kierroslistat (Emil 23.10.2026, 1.62): {id, name, created}. Rivi kuuluu kierroslistaan kentällä l; ilman sitä se on jatkuvalla listalla. */
  out.ehdot=[];var mergeE=function(E){(E||[]).forEach(function(e){var k=JSON.stringify([e.k,e.all?1:0,e.on,e.off,e.ty||'']);if(out.ehdot.some(function(x){return x.id===e.id||JSON.stringify([x.k,x.all?1:0,x.on,x.off,x.ty||''])===k;}))return;out.ehdot.push(e);});};
  mergeE((condsIn({ehdot:o.ehdot})||{}).ehdot);
  out.lists=[];(Array.isArray(o.listat)?o.listat:[]).forEach(function(L){if(!L||typeof L.id!=='string'||!clean(L.name)||out.lists.some(function(x){return x.id===L.id;}))return;var X={id:L.id,name:clean(L.name).slice(0,80),created:typeof L.created==='string'?L.created:''},C=condsIn(L);if(C){if(C.eh)X.eh=1;mergeE(C.ehdot);}if(typeof L.epoch==='string')X.epoch=L.epoch;if(L.run&&typeof L.run.tpl==='string'&&typeof L.run.tid==='string'){X.run={tpl:L.run.tpl,tid:L.run.tid};['r','n','prev','epoch','done'].forEach(function(k){if(typeof L.run[k]==='string')X.run[k]=L.run[k];});if(L.run.credited)X.run.credited=1;}if(L.wf)X.wf=1;if(L.vk)X.vk=1;if(L.mu)X.mu=1;if(L.aj)X.aj=1;if(Array.isArray(L.tk))X.tk=strs(L.tk).filter(function(x,i,a){return a.indexOf(x)===i;});out.lists.push(X);});
  /* 1.69 (Emil 23.10.2026): ehdot ovat projektin yhteisiä (ehdot), listalla vain kytkin eh. 1.67:n listakohtaiset ehdot yhdistetään. */
  var J=condsIn(o.jatkuvalista),JL={};if(J&&J.eh)JL.eh=1;if(o.jatkuvalista&&o.jatkuvalista.mu)JL.mu=1;if(o.jatkuvalista&&Array.isArray(o.jatkuvalista.tk))JL.tk=strs(o.jatkuvalista.tk).filter(function(x,i,a){return a.indexOf(x)===i;});out.jl=Object.keys(JL).length?JL:null;if(J)mergeE(J.ehdot);
  out.chk.forEach(function(r){if(r.l&&!out.lists.some(function(L){return L.id===r.l;}))delete r.l;});
  /* 1.46: ryhmä on rivillä elävä linkki (row.g). Vanha kertalisäys tunnistetaan: jos rivillä on käsin kaikki listan ryhmän jäsenet, ryhmä linkitetään ja jäsenet merkitään ryhmästä tulleiksi. */
  out.chk.forEach(function(r){out.grp.forEach(function(g){if(g.phase||!g.m.length||(r.g||[]).indexOf(g.id)>=0)return;
    if(!g.m.every(function(id){return r.it.some(function(x){return x.id===id&&!x.t;});}))return;r.g=(r.g||[]).concat([g.id]);r.it.forEach(function(x){if(g.m.indexOf(x.id)>=0)x.g=1;});});});
  (Array.isArray(o.termit)?o.termit:[]).forEach(function(t){if(!t||typeof t.id!=='string'||!clean(t.name))return;var T2={id:t.id,name:clean(t.name),yes:strs(t.yes),no:strs(t.no)};if(t.pop===true)T2.pop=true;if(t.cal===true)T2.cal=true;termExtra(T2,t);out.terms.push(T2);});
  if(o.termisanat&&typeof o.termisanat==='object')Object.keys(o.termisanat).forEach(function(k){var w=o.termisanat[k];if(!w)return;var y=strs(w.yes),n=strs(w.no);if(y.length||n.length||typeof w.pop==='boolean'||w.cal===true||w.wflow||hasRenew(w)||w.once||durOf(w,0)||(typeof w.info==='string'&&clean(w.info))){out.words[k]={yes:y,no:n};if(typeof w.pop==='boolean')out.words[k].pop=w.pop;if(w.cal===true)out.words[k].cal=true;termExtra(out.words[k],w);}});
  /* roskakori: samat kentät kuin muistiinpanolla + deleted */
  out.trash=[];(Array.isArray(o.roskakori)?o.roskakori:[]).forEach(function(n){if(!n||typeof n.id!=='string'||typeof n.text!=='string'||typeof n.deleted!=='string')return;
    var T={id:n.id,created:String(n.created||n.deleted),edited:String(n.edited||n.created||n.deleted),text:n.text,date:/^\d{4}-\d\d-\d\d$/.test(n.date||'')?n.date:'',deleted:n.deleted};
    if(n.time&&/^\d\d:\d\d$/.test(n.time.s||''))T.time={s:n.time.s,e:/^\d\d:\d\d$/.test(n.time.e||'')?n.time.e:''};if(typeof n.done==='string'&&n.done)T.done=n.done;out.trash.push(T);});
  /* Aikaehdotusten aikaväli viikonpäivittäin (1.49): {0–6: {s,e}} minuutteina */
  out.win={};if(o.aikavalit&&typeof o.aikavalit==='object')Object.keys(o.aikavalit).forEach(function(k){var w=o.aikavalit[k];if(!/^[0-6]$/.test(k)||!w)return;var a=Math.round(+w.s),b=Math.round(+w.e);if(a>=0&&b<=1440&&b>a)out.win[k]={s:a,e:b};});
  out.calv=calvOf(o.kalenteri);
  /* 1.104 (Emil 15.11.2026, Mätsik 1.14): pikamuistiinpanon napit = Asiat-taulukon Pika-sarakkeessa merkityt asiat */
  out.pk=strs(o.pikat).filter(function(x,i,a){return a.indexOf(x)===i;});
  /* 1.106: päivän napit ja yksinkertaiset puut */
  out.pv=pvNorm(o.paivanapit);out.st=stNorm(o.yksinkertaisetPuut);out.fl=flNorm(o.flow);
  /* 1.18:n koko järjestys (jarjestys) jää pois: 1.19 alkaen vain tärkeät (tarkeat) ovat järjestyksessä */
  out.imp=strs(o.tarkeat).filter(function(x,i,a){return a.indexOf(x)===i;});
  if(!out.projects.some(function(P){return P.id===out.cur;}))out.cur=out.projects.length?out.projects[0].id:null;
  /* 1.44.1: #-alkuinen oma asiasana oli tarkoitettu ryhmäksi (Emil 22.10.2026): siitä tulee listan ryhmä */
  out.terms=out.terms.filter(function(t){if(t.name.charAt(0)!=='#')return true;var gn=clean(t.name.slice(1)).slice(0,80);if(!gn)return true;
    if(!out.grp.some(function(g){return keyOf(g.name)===keyOf(gn);}))out.grp.push({id:'g'+t.id,name:gn,m:[]});out.imp=out.imp.filter(function(x){return x!==t.id;});return false;});
  /* 1.43: uusiutumisaika on asiasanan oma (Emil 22.10.2026). Rivin kohteen vanha ev siirtyy asiasanalle, jos sillä ei vielä ole omaa. */
  out.chk.forEach(function(r){r.it.forEach(function(x){if(!x.ev)return;var id=x.id,ev=x.ev;delete x.ev;var o2=null;
    if(id.slice(0,2)==='a:'){var k=id.slice(2);o2=out.words[k]||(out.words[k]={yes:[],no:[]});}else o2=out.terms.filter(function(t){return t.id===id;})[0];
    if(o2&&!o2.ev&&evDays(ev))o2.ev=evDays(ev);});});
  phaseEnsure(out);return out;}
/* 1.106 (Emil 18.11.2026): päivän napit kalenterin päivälle (Päiväkartan tapaan). Napit ovat Asiat-taulukon Päivä-sarakkeessa merkittyjä asiasanoja.
   Tallennus projektissa: paivanapit {napit:[asiasanan id], alkaen:{id: päivä, jolloin nappi otettiin käyttöön}, paivat:{päivä:[valitut id:t]}}. */
function pvUq(x,i,a){return a.indexOf(x)===i;}
function pvNorm(o){var v={on:[],c:{},d:{}};if(!o||typeof o!=='object')return v;
  v.on=strs(o.napit).filter(pvUq);
  if(o.alkaen&&typeof o.alkaen==='object')Object.keys(o.alkaen).forEach(function(k){if(/^\d{4}-\d\d-\d\d$/.test(o.alkaen[k]||''))v.c[k]=o.alkaen[k];});
  if(o.paivat&&typeof o.paivat==='object')Object.keys(o.paivat).forEach(function(d){if(!/^\d{4}-\d\d-\d\d$/.test(d))return;var L=strs(o.paivat[d]).filter(pvUq);if(L.length)v.d[d]=L;});
  return v;}
function pvOut(v){if(!v||(!(v.on||[]).length&&!Object.keys(v.d||{}).length))return undefined;return {napit:v.on||[],alkaen:v.c||{},paivat:v.d||{}};}
function pvWd(d){var p=d.split('-');return 'w:'+((new Date(+p[0],+p[1]-1,+p[2]).getDay()+6)%7);}
/* Ennuste: P(asia j valitaan päivälle day | päivän muut valinnat sel ja viikonpäivä). Laskennassa ovat muut kirjatut päivät (vähintään yksi valinta),
   alkaen siitä päivästä, jona j tuli napiksi. Yksittäinen tekijä siirtää j:n perustasoa sen mukaan, kuinka usein j on toteutunut tekijän kanssa
   (kuten Päiväkartassa). Lisäksi jokainen kahden tekijän yhdistelmä (myös viikonpäivä) katsotaan erikseen: niiltä päiviltä, joina molemmat olivat,
   lasketaan j:n osuus, joka kutistetaan yksittäisten tekijöiden arvioon päin. Kun yhdistelmäpäiviä kertyy, yhdistelmä painaa enemmän, joten
   ennuste tunnistaa tapaukset, joissa vasta kaksi tekijää yhdessä vaikuttaa kolmanteen. null = liian vähän tietoa (alle 3 päivää). */
var PV_MIN=3;
function pvLg(p){p=Math.min(0.999,Math.max(0.001,p));return Math.log(p/(1-p));}
function pvSg(x){return 1/(1+Math.exp(-x));}
function pvP(v,day,sel,j){var c0=v.c[j]||'',rows=[];
  Object.keys(v.d).forEach(function(d){var L=v.d[d];if(d===day||!L.length||(c0&&d<c0))return;var s={};L.forEach(function(x){s[x]=1;});s[pvWd(d)]=1;rows.push(s);});
  var N=rows.length;if(N<PV_MIN)return null;
  function cnt(fs){var n=0,k=0;rows.forEach(function(s){for(var i=0;i<fs.length;i++)if(!s[fs[i]])return;n++;if(s[j])k++;});return [n,k];}
  var F=sel.filter(function(x){return x!==j;}).filter(pvUq).concat([pvWd(day)]),K=cnt([])[1],base=(K+0.5)/(N+1),lb=pvLg(base);
  function single(fs){var s=0,m=0;fs.forEach(function(f){var c=cnt([f]);if(c[0]<PV_MIN)return;var q=(c[1]+2*base)/(c[0]+2);s+=Math.max(-1.8,Math.min(1.8,pvLg(q)-lb));m++;});return m?lb+s*Math.pow(m,-0.35):lb;}
  var W=4,S=single(F)*W;
  for(var a=0;a<F.length;a++)for(var b=a+1;b<F.length;b++){var c=cnt([F[a],F[b]]);if(c[0]<2)continue;var q=(c[1]+4*pvSg(single([F[a],F[b]])))/(c[0]+4);S+=pvLg(q)*c[0];W+=c[0];}
  return pvSg(S/W);}
/* Nuoli: valinnat nostivat tai laskivat arviota vähintään 5 %-yksikköä pelkkään viikonpäivään verrattuna */
function pvLift(v,day,sel,j){var p=pvP(v,day,sel,j);if(p===null)return null;var o=sel.filter(function(x){return x!==j;});var p0=o.length?pvP(v,day,[],j):p,d=p-p0;return {p:p,p0:p0,dir:d>=0.05?1:d<=-0.05?-1:0};}
function pvToggle(v,day,id){var L=(v.d[day]||[]).slice(),i=L.indexOf(id);if(i<0)L.push(id);else L.splice(i,1);if(L.length)v.d[day]=L;else delete v.d[day];return v;}
function pvSet(v,id,on,today){var L=v.on.filter(function(x){return x!==id;});if(on){L.push(id);if(!v.c[id])v.c[id]=today;}v.on=L;return v;}
/* 1.106 (Emil 18.11.2026): yksinkertainen Päätöspuu. Puulla on omat tekijät; Rakenna valitsee alkutekijät, mitä kunkin tekijän napautus tuo näkyviin
   ja mihin puu saa päättyä. Käytössä napautettu tekijä tuo seuraavat; puu päättyy lopetustekijään. Tallennus projektissa: yksinkertaisetPuut
   [{id, name, f:[{id, n}], a:[alkutekijät], to:{tekijä:[tuo näkyviin]}, e:[lopetukset], p:[käytön polku]}]. */
/* 1.109 (Emil 19.11.2026): ruutupuu. Puu on sääntöpareja: syyruutu (laji) ja seurausruutu. Lajit: a = Aloitus (vain seuraus: näkyy heti),
   tai = jokin syy valittu tuo seuraukset, ja = kaikki syyt valittu tuo seuraukset, x = Poissulkevat (ei seurausta: kun yksi on valittu,
   muut piiloutuvat), end = Lopetus (ei seurausta: valinta päättää puun). Säännöt määräävät vain näkyvyyden; poissulku voittaa.
   Muoto: {id, name, f:[{id, n}], r:[{id, ty, c:[syyt], e:[seuraukset]}], p:[käytön valinnat]}. 1.106:n muoto (a, to, e) muunnetaan.
   1.111 (Emil 19.11.2026): Aloitusruutu sisältää itse aloitusvaihtoehdot (c näkyy heti) ja sillä on laji lg = tai/ja/x kuten muillakin ruuduilla
   (seuraukset e, kun jokin/kaikki valittu; x = vain yksi). Lopetuksella lg = tai (jokin päättää) tai ja (kaikki valittuina päättää). Poissulkevilla
   voi olla seurauksia (jokin valittu tuo ne). 1.109:n aloitus (c tyhjä, e = aloitusvaihtoehdot, ei lg) muunnetaan. */
/* 1.113 (Emil 19.11.2026): osiot. os = osionvaihtoruutu (lopetus vain siihenastiselle, lg tai/ja). Sitä seuraava pari on osion aloitus
   (ty a, valinnainen otsikko ot). Seuraava osio näkyy vasta, kun edellinen on päättynyt; aiemmat osiot jäävät näkyviin. Osion säännöt tuovat
   vaihtoehtoja vain omaan osioonsa, mutta syinä kelpaavat aiempien osioiden valinnat, ja poissulku vaikuttaa kaikissa osioissa. */
var ST_TY=['a','tai','ja','x','end','os'];
function stNorm(a){var out=[];(Array.isArray(a)?a:[]).forEach(function(t){if(!t||typeof t.id!=='string'||out.some(function(x){return x.id===t.id;}))return;
  var f=[],ids={};(Array.isArray(t.f)?t.f:[]).forEach(function(x){if(!x||typeof x.id!=='string'||typeof x.n!=='string'||ids[x.id])return;ids[x.id]=1;f.push({id:x.id,n:x.n.slice(0,120)});});
  function ok(L){return strs(L).filter(function(x){return ids[x];}).filter(pvUq);}
  var r=[],rid=0;function nid(){rid++;while(r.some(function(x){return x.id==='r'+rid;}))rid++;return 'r'+rid;}
  if(Array.isArray(t.r))t.r.forEach(function(x){if(!x||ST_TY.indexOf(x.ty)<0)return;var o={id:typeof x.id==='string'&&!r.some(function(y){return y.id===x.id;})?x.id:nid(),ty:x.ty,c:ok(x.c),e:x.ty==='end'||x.ty==='os'?[]:ok(x.e)};
    if(o.ty==='a'){if(['tai','ja','x'].indexOf(x.lg)<0){o.c=ok(x.e);o.e=[];o.lg='tai';}else o.lg=x.lg;}
    if(o.ty==='end'||o.ty==='os')o.lg=x.lg==='ja'?'ja':'tai';
    if(typeof x.h==='string'&&x.h.trim()&&o.ty!=='end'&&o.ty!=='os')o.h=x.h.trim().slice(0,60);
    if(o.ty==='a'&&typeof x.ot==='string'&&x.ot.trim())o.ot=x.ot.trim().slice(0,60);
    r.push(o);});
  else{/* 1.106: alkutekijät, "tuo näkyviin" ja lopetukset */
    r.push({id:nid(),ty:'a',lg:'tai',c:ok(t.a),e:[]});
    if(t.to&&typeof t.to==='object')f.forEach(function(x){var L=ok(t.to[x.id]).filter(function(y){return y!==x.id;});if(L.length)r.push({id:nid(),ty:'tai',c:[x.id],e:L});});
    var E=ok(t.e);if(E.length)r.push({id:nid(),ty:'end',lg:'tai',c:E,e:[]});}
  if(!r.length||r[0].ty!=='a'){var A=r.filter(function(x){return x.ty==='a';})[0];if(A&&!r.some(function(x){return x.ty==='os';}))r=[A].concat(r.filter(function(x){return x!==A;}));}
  var o2={id:t.id,name:(typeof t.name==='string'&&t.name.trim()?t.name.trim():'Puu').slice(0,80),f:f,r:r,p:[]};stTop(o2,nid);o2.p=stVis(o2,ok(t.p)).sel;out.push(o2);});return out;}
/* Näkyvyys valinnoista. Valinta, joka ei ole enää näkyvissä, putoaa pois (toistetaan, kunnes vakaa). Järjestys: ensiesiintyminen sääntöjen järjestyksessä. */
function stExcl(x){return x.ty==='x'||(x.ty==='a'&&x.lg==='x');}
function stVis(t,sel){sel=(sel||[]).slice();var R=t.r||[];
  /* osiot: säännöt jaetaan osionvaihtoruutujen kohdalta */
  var SC=[{r:[],os:null}];R.forEach(function(x){if(x.ty==='os'){SC[SC.length-1].os=x;SC.push({r:[],os:null});}else SC[SC.length-1].r.push(x);});
  var vis,src,sec,shown;
  for(var guard=0;guard<50;guard++){var S={};sel.forEach(function(x){S[x]=1;});var V={},ord=[];src={};sec={};shown=[];
    var si=0;function add(L,rid){L.forEach(function(x){if(!V[x]){V[x]=1;ord.push(x);src[x]=rid;sec[x]=si;}});}
    function has(y){return S[y]&&V[y];}
    for(si=0;si<SC.length;si++){var Q=SC[si];shown.push(si);
      Q.r.forEach(function(x){if(x.ty==='a')add(x.c,'');});
      var ch=true;while(ch){ch=false;Q.r.forEach(function(x){if(x.ty==='end'||!x.e.length)return;var lg=x.ty==='a'?x.lg:x.ty,hit=lg!=='ja'?x.c.some(has):x.c.length&&x.c.every(has);
        if(hit){var n0=ord.length;add(x.e,x.id);if(ord.length>n0)ch=true;}});}
      var o=Q.os;if(!o||!o.c.length||!(o.lg==='ja'?o.c.every(has):o.c.some(has)))break;}
    /* Poissulku voittaa (kaikissa osioissa): valitun jäsenen ryhmätoverit piiloon */
    var H={};R.forEach(function(x){if(!stExcl(x))return;var s=x.c.filter(has);if(s.length)x.c.forEach(function(y){if(s.indexOf(y)<0)H[y]=1;});});
    vis=ord.filter(function(x){return !H[x];});var nsel=sel.filter(function(x){return vis.indexOf(x)>=0;});
    if(nsel.length===sel.length)break;sel=nsel;}
  var done=shown.some(function(i){return SC[i].r.some(function(x){if(x.ty!=='end'||!x.c.length)return false;var f=function(y){return sel.indexOf(y)>=0;};return x.lg==='ja'?x.c.every(f):x.c.some(f);});});
  var secs=shown.map(function(i){var A=SC[i].r[0];return {i:i,ot:A&&A.ty==='a'&&A.ot||'',rid:A?A.id:''};});
  return {vis:vis,sel:sel,done:done,src:src,sec:sec,secs:secs};}
/* 1.112 (Emil 19.11.2026): aloitusruutu on aina ylimmän parin vasen ruutu. Raahaus ylimmäksi tekee parista aloituksen; entinen aloitus saa lajinsa
   tavalliseksi ruuduksi (Tai/Ja/Pois). Lopetus ylimmäksi: aloitus Tai, sen tallessa olleet seuraukset palaavat. */
function stTop(t,nid){var R=t.r||(t.r=[]);
  /* 1.113: aloitus on ylimmän parin ja jokaisen osionvaihtoruudun jälkeisen parin vasen ruutu; viimeisen osionvaihdon perään tulee tyhjä aloitus */
  if(R.length&&R[R.length-1].ty==='os'||!R.length){var i0=1;while(R.some(function(y){return y.id==='r'+i0;}))i0++;R.push({id:nid?nid():'r'+i0,ty:'a',lg:'tai',c:[],e:[]});}
  R.forEach(function(x,i){var st=i===0||R[i-1].ty==='os';
    if(st&&x.ty!=='a'){var lg=['tai','ja','x'].indexOf(x.ty)>=0?x.ty:'tai';if((x.ty==='end'||x.ty==='os')&&!x.e.length&&x.e0)x.e=x.e0;x.ty='a';x.lg=lg;}
    else if(!st&&x.ty==='a'){x.ty=x.lg||'tai';delete x.lg;}});return t;}
/* Napautus: valitsee tai perii. Poissulkevan jäsenen valinta perii saman ryhmän muut valinnat. */
function stPick(t,sel,id){sel=(sel||[]).slice();var i=sel.indexOf(id);if(i>=0){sel.splice(i,1);return stVis(t,sel).sel;}
  (t.r||[]).forEach(function(x){if(stExcl(x)&&x.c.indexOf(id)>=0)sel=sel.filter(function(y){return y===id||x.c.indexOf(y)<0;});});
  sel.push(id);return stVis(t,sel).sel;}
function stDone(t,p){return stVis(t,p).done;}
function stItem(t,n){n=String(n||'').trim().slice(0,120);if(!n)return null;var k=n.toLowerCase(),x=t.f.filter(function(y){return y.n.toLowerCase()===k;})[0];if(x)return x;
  var i=t.f.length+1;while(t.f.some(function(y){return y.id==='f'+i;}))i++;x={id:'f'+i,n:n};t.f.push(x);return x;}
function stDel(t,id){t.f=t.f.filter(function(x){return x.id!==id;});(t.r||[]).forEach(function(x){x.c=x.c.filter(function(y){return y!==id;});x.e=x.e.filter(function(y){return y!==id;});});
  t.p=stVis(t,(t.p||[]).filter(function(x){return x!==id;})).sel;return t;}
/* Puun valintojen polku tekstiksi valintajärjestyksessä */
function stPath(t,sel){var N={};t.f.forEach(function(x){N[x.id]=x.n;});return (sel||[]).map(function(x){return N[x]||'?';}).join(' → ');}
/* 1.109 Flow: asialle puu (m: asia → puu) ja rivikohtainen kulku (run['rivi|asia'] = {s:[valinnat], d:valmistumisaika}) */
function flNorm(o){var m={},run={};o=o&&typeof o==='object'?o:{};if(o.m&&typeof o.m==='object')Object.keys(o.m).forEach(function(k){if(typeof o.m[k]==='string')m[k]=o.m[k];});
  if(o.run&&typeof o.run==='object')Object.keys(o.run).forEach(function(k){var v=o.run[k];if(!v||typeof v!=='object')return;var x={s:strs(v.s)};if(typeof v.d==='string')x.d=v.d;if(typeof v.t==='string')x.t=v.t;run[k]=x;});return {m:m,run:run};}
function flOut(f){return f&&(Object.keys(f.m||{}).length||Object.keys(f.run||{}).length)?{m:f.m,run:f.run}:undefined;}
function looseJson(txt){var s=String(txt||''),a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<=a)return null;s=s.slice(a,b+1);
  try{return JSON.parse(s);}catch(e){}try{return JSON.parse(s.replace(/[“”„]/g,'"'));}catch(e){}return null;}
function noteTagKey(value){
  var key=String(value||'').trim().replace(/^['"]|['"]$/g,'').replace(/^#/,'').normalize('NFC').toLocaleLowerCase('fi');
  return /^[\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:-[\p{L}\p{N}][\p{L}\p{N}\p{M}]*)*$/u.test(key)&&/\p{L}/u.test(key)?key:'';
}
function noteTags(note){
  var tags=new Set();
  var text=MUUTTUJA.maskModern(note.text||'',note.created).replace(/```[\s\S]*?(?:```|$)|`[^`\n]*`/g,' ');
  var pattern=/(^|[^\p{L}\p{N}\p{M}#_/@&=-])#([\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:-[\p{L}\p{N}][\p{L}\p{N}\p{M}]*)*)(?![\p{L}\p{N}\p{M}_-])/gu,hit;
  function add(value){var tag=noteTagKey(value);if(tag)tags.add(tag);}
  while((hit=pattern.exec(text)))add(hit[2]);
  var fm=VAULT.fmGet(note.vfm,'tagit');
  if(/^\[.*\]$/.test(fm))fm.slice(1,-1).split(',').forEach(add);
  return Array.from(tags);
}

/* Kaikki 0.24: kentät ja kaavat. Jäsennyksen operaattoritasot noudattavat Kytköskartan mallia.
   Arviointi käyttää vain annettua muistiinpanoaineistoa eikä kirjoita mitään. */
var KAAVA=(function(){
  var cmp=new Set(['=','==','!=','<>','≠','<','>','<=','>=','≤','≥']);
  var groups=new Set(['SUMMA','KESKIARVO','MÄÄRÄ','MIN','MAX']);
  var number=/^[+-]?\d+(?:[.,]\d+)?$/;
  function key(value){return String(value||'').normalize('NFC').toLocaleLowerCase('fi');}
  function fail(code){throw {code:code};}
  function optNumber(x){
    var n=typeof x==='number'?x:number.test(x)?Number(String(x).replace(',','.')):NaN;
    return Number.isFinite(n)?n:null;
  }
  function numeric(x){var n=optNumber(x);if(n===null)fail('#ARVO!');return n;}
  function finite(n){if(!Number.isFinite(n))fail('#ARVO!');return n;}
  function tokens(source,visit){
    var end=String(source||'').trimEnd(),text=end.trimStart().replace(/^=(?!=)\s*/,''),out=[],match;
    if(text.length>4096)fail('#KAAVA!');
    while(text&&(text=text.trimStart())){
      if(out.length>=512)fail('#KAAVA!');
      if((match=/^\[\[([^\[\]\r\n]+)\]\]!([A-Z]+[1-9]\d*)(?::([A-Z]+[1-9]\d*))?/i.exec(text))){
        out.push({type:'cell',sheet:match[1].trim(),from:match[2],to:match[3]});
      }else if((match=/^([A-Z]+[1-9]\d*):([A-Z]+[1-9]\d*)/i.exec(text))){
        out.push({type:'cell',from:match[1],to:match[2]});
      }else if((match=/^\[\[([^\[\]\r\n]+)\]\]\.([\p{L}_][\p{L}\p{N}_]*(?:-[\p{L}_][\p{L}\p{N}_]*)*)/u.exec(text))){
        out.push({type:'ref',note:key(match[1].trim()),name:key(match[2])});
      }else if((match=/^"((?:[^"\\\r\n]|\\["\\])*)"/.exec(text))){
        out.push({type:'value',value:match[1].replace(/\\(["\\])/g,'$1')});
      }else if((match=/^\d+(?:[.,]\d+)?/.exec(text))){
        out.push({type:'value',value:numeric(match[0])});
      }else if((match=/^[\p{L}_][\p{L}\p{N}_]*(?:-[\p{L}_][\p{L}\p{N}_]*)*/u.exec(text))){
        out.push({type:'name',name:key(match[0])});
      }else if((match=/^(>=|<=|!=|<>|==|[=<>≥≤≠+\-−*×/÷();])/.exec(text))){
        out.push({type:'symbol',value:({'−':'-','×':'*','÷':'/'}[match[0]]||match[0])});
      }else fail('#KAAVA!');
      if(visit)visit(out[out.length-1],match,end.length-text.length,text.slice(match[0].length));
      text=text.slice(match[0].length);
    }
    return out;
  }
  function parse(input,visit){
    var t=tokens(input,visit),pos=0;
    function take(symbol){
      if(t[pos]&&t[pos].type==='symbol'&&t[pos].value===symbol){pos++;return true;}
      return false;
    }
    function requireSymbol(s){if(!take(s))fail('#KAAVA!');}
    function atom(){
      if(take('-'))return {type:'neg',value:atom()};
      if(take('+'))return {type:'pos',value:atom()};
      if(take('(')){var value=compare();requireSymbol(')');return value;}
      var item=t[pos++];
      if(!item||item.type==='symbol')fail('#KAAVA!');
      if(item.type!=='name'||!take('('))return item;
      var args=[];
      if(!take(')')){
        do{args.push(compare());}while(take(';'));
        requireSymbol(')');
      }
      return {type:'call',name:item.name.toLocaleUpperCase('fi'),args:args};
    }
    function level(next,allowed){
      return function(){
        var a=next();
        while(t[pos]&&t[pos].type==='symbol'&&allowed.indexOf(t[pos].value)>=0){
          var op=t[pos++].value;a={type:'binary',op:op,left:a,right:next()};
        }
        return a;
      };
    }
    var term=level(atom,['*','/']),sum=level(term,['+','-']);
    function compare(){
      var left=sum();
      if(t[pos]&&t[pos].type==='symbol'&&cmp.has(t[pos].value)){
        return {type:'compare',op:t[pos++].value,left:left,right:sum()};
      }
      return left;
    }
    var result=compare();
    if(pos!==t.length)fail('#KAAVA!');
    return result;
  }
  function allowedFields(text){
    var lines=String(text||'').split(/\r?\n/),active=false,fields=new Set();
    lines.forEach(function(line){
      /* 0.33: vaultin ohjeessa otsikko on ### ja rivi ilman lihavointia; hyväksytään molemmat */
      if(/^#{1,3}\s/.test(line))active=/^#{2,3} Omat kentät(?:\s*\(|\s*$)/.test(line);
      if(active&&/^-\s+(?:\*\*)?Sovitut kentät:(?:\*\*)?/.test(line)){
        var listed=line.replace(/^-\s+(?:\*\*)?Sovitut kentät:(?:\*\*)?/,'');
        Array.from(listed.matchAll(/`([a-z][a-z0-9_-]*)`/g)).forEach(function(m){fields.add(m[1]);});
      }
    });
    return fields;
  }
  function fields(note,allowed){
    var out=new Map();
    function add(name,value){
      if(!value||!value.trim())return;
      name=key(name);
      if(!out.has(name))out.set(name,[]);
      out.get(name).push(value.trim());
    }
    (note.vfm||[]).forEach(function(line){
      var m=/^([A-Za-z][A-Za-z0-9_-]*):[ \t]*(.+)$/.exec(line);
      if(m&&m[1]!=='juuri')add(m[1],m[2]);
    });
    bodyFields(note.text,allowed).forEach(function(field){add(field.key,field.value);});
    return out;
  }
  function bodyFields(text,allowed){
    var out=[],fenced='';
    String(text||'').split(/\r?\n/).forEach(function(line,index){
      var fence=/^\s*(`{3,}|~{3,})/.exec(line);
      if(fence){
        if(!fenced)fenced=fence[1];else if(fence[1][0]===fenced[0]&&fence[1].length>=fenced.length)fenced='';
        return;
      }
      if(fenced)return;
      var m=/^[ \t]*(- klo \d\d\.\d\d · )?([a-z][a-z0-9_-]*):[ \t]*(.+)$/i.exec(line);
      if(m&&allowed.has(key(m[2])))out.push({key:key(m[2]),value:m[1]?m[3].replace(/(?:\s+#[^\s]+)+$/,''):m[3],index:index,timed:!!m[1]});
    });
    return out;
  }
  function compareValues(a,b,op){
    var x=optNumber(a),y=optNumber(b),numericPair=x!==null&&y!==null;
    if(numericPair){a=x;b=y;}
    else if(['>','<','<=','>=','≤','≥'].indexOf(op)>=0)fail('#ARVO!');
    else if(typeof a==='string'&&typeof b==='string'){a=key(a);b=key(b);}
    if(op==='='||op==='==')return a===b;
    if(op==='!='||op==='<>'||op==='≠')return a!==b;
    if(op==='<')return a<b;
    if(op==='>')return a>b;
    if(op==='<='||op==='≤')return a<=b;
    return a>=b;
  }
  /* 0.81: run(lähde, muistiinpano, rivit) rajaa kaavan omat ryhmäfunktiot (SUMMA(kenttä) jne.) annettuihin riveihin, esim. näkymän
     riveihin. Muistiinpanojen kenttäkaavat lasketaan aina koko aineistosta, joten sama kenttä on sama arvo joka näkymässä. */
  function create(notes,allowed,readCell){
    var data=new Map(),byName=new Map(),known=new Set(allowed),memo=new Map(),active=new Map(),scope=notes.slice(),group=null;
    function rawFields(n){
      if(!data.has(n))data.set(n,fields(n,allowed));
      return data.get(n);
    }
    scope.forEach(function(n){
      rawFields(n).forEach(function(_,k){known.add(k);});
      if(!n.vp)return;
      var path=key(n.vp.replace(/\.md$/i,'')),base=path.split('/').pop();
      [path].concat(base===path?[]:[base]).forEach(function(name){
        if(!byName.has(name))byName.set(name,[]);
        byName.get(name).push(n);
      });
    });
    function values(n,name){
      name=key(name);
      if(!n)return [];
      if(!memo.has(n))memo.set(n,new Map());
      if(!active.has(n))active.set(n,new Set());
      var seen=active.get(n),cache=memo.get(n);
      if(seen.has(name))fail('#KEHÄ');
      if(cache.has(name))return cache.get(name);
      if(seen.size>128)fail('#KEHÄ');
      seen.add(name);
      try{
        var result=(rawFields(n).get(name)||[]).map(function(raw){
          if(/^=/.test(raw)){var outer=group;group=null;try{return evaluate(parse(raw),n);}finally{group=outer;}}
          if(/^"/.test(raw)){var literal=parse(raw);if(literal.type==='value')return literal.value;}
          var num=optNumber(raw);
          if(num!==null)return num;
          return raw;
        });
        cache.set(name,result);return result;
      }finally{seen.delete(name);}
    }
    function scalar(n,name){
      var v=values(n,name);
      if(!v.length)fail(known.has(name)?'#PUUTTUU':'#NIMI?');
      if(v.length>1)fail('#ARVO!');
      return v[0];
    }
    function filterText(node){
      if(node.type==='name')return node.name;
      if(node.type==='value')return node.value;
      if(node.type==='neg'||node.type==='pos')return numeric(filterText(node.value))*(node.type==='neg'?-1:1);
      if(node.type==='binary'&&node.op==='/')return filterText(node.left)+'/'+filterText(node.right);
      fail('#KAAVA!');
    }
    function predicate(condition){
      if(condition.type!=='compare'||condition.left.type!=='name')fail('#KAAVA!');
      var field=condition.left.name,op=condition.op,right=filterText(condition.right);
      if(field==='tunniste'){
        if(op!=='='&&op!=='==')fail('#KAAVA!');
        var tag=noteTagKey(right);
        return function(n){return noteTags(n).indexOf(tag)>=0;};
      }
      if(field==='kansio'){
        if(op!=='='&&op!=='==')fail('#KAAVA!');
        var path=key(right).replace(/\/$/,'')+'/';
        return function(n){return key(n.vp).startsWith(path);};
      }
      if(!known.has(field))fail('#NIMI?');
      return function(n){return values(n,field).some(function(v){return compareValues(v,right,op);});};
    }
    function aggregate(name,items){
      if(name==='MÄÄRÄ')return items.length;
      var nums=items.map(optNumber).filter(function(n){return n!==null;});
      if(!nums.length&&name!=='SUMMA')fail('#PUUTTUU');
      if(name==='MIN')return nums.reduce(function(a,b){return Math.min(a,b);},Infinity);
      if(name==='MAX')return nums.reduce(function(a,b){return Math.max(a,b);},-Infinity);
      var sum=nums.reduce(function(a,b){return a+b;},0);
      return finite(name==='KESKIARVO'?sum/nums.length:sum);
    }
    function call(ast,note){
      var name=ast.name,args=ast.args,first=args[0];
      if(groups.has(name)){
        if(first&&first.type==='name'&&!(note&&note.sheet&&/^[a-z]+[1-9]\d*$/.test(first.name))&&args.slice(1).every(function(a){return a.type==='compare';})){
          if(!known.has(first.name))fail('#NIMI?');
          var items=[],conditions=args.slice(1).map(predicate);
          (group||scope).forEach(function(n){
            if(conditions.every(function(test){return test(n);}))values(n,first.name).forEach(function(value){items.push(value);});
          });
          return aggregate(name,items);
        }
        return aggregate(name,args.flatMap(function(a){return evaluate(a,note);}).filter(function(v){return v!=='';}));
      }
      if(name==='JOS'){
        if(args.length!==3)fail('#KAAVA!');
        var condition=evaluate(first,note);
        return evaluate(condition?args[1]:args[2],note);
      }
      if(name==='PYÖRISTÄ'){
        if(args.length<1||args.length>2)fail('#KAAVA!');
        var n=numeric(evaluate(first,note)),d=args.length===2?numeric(evaluate(args[1],note)):0;
        if(!Number.isInteger(d)||Math.abs(d)>12)fail('#ARVO!');
        var scale=Math.pow(10,d);
        return finite(Math.sign(n)*Math.round((Math.abs(n)+Number.EPSILON)*scale)/scale);
      }
      if(name==='YHDISTÄ')return args.map(function(a){return String(evaluate(a,note));}).join('');
      fail('#NIMI?');
    }
    function evaluate(ast,note){
      if(ast.type==='value')return ast.value;
      if(ast.type==='cell'){
        if(!readCell)fail('#PUUTTUU');
        return readCell(note,ast);
      }
      if(ast.type==='name'){
        if(readCell&&note&&note.sheet&&/^[a-z]+[1-9]\d*$/.test(ast.name))return readCell(note,{from:ast.name});
        return scalar(note,ast.name);
      }
      if(ast.type==='ref'){
        var files=byName.get(ast.note.replace(/\.md$/i,''))||[];
        if(files.length!==1)fail(files.length?'#ARVO!':'#PUUTTUU');
        return scalar(files[0],ast.name);
      }
      if(ast.type==='call')return call(ast,note);
      if(ast.type==='neg'||ast.type==='pos')return numeric(evaluate(ast.value,note))*(ast.type==='neg'?-1:1);
      var a=evaluate(ast.left,note),b=evaluate(ast.right,note);
      if(ast.type==='compare')return compareValues(a,b,ast.op);
      a=numeric(a);b=numeric(b);
      if(ast.op==='/'&&b===0)fail('#JAKO/0!');
      return finite(ast.op==='+'?a+b:ast.op==='-'?a-b:ast.op==='*'?a*b:a/b);
    }
    function safe(fn){
      try{return {value:fn()};}catch(e){return {error:e&&e.code||'#KAAVA!'};}
    }
    return {
      run:function(source,note,rows){return safe(function(){
        var outer=group;group=Array.isArray(rows)?rows:null;
        try{var result=evaluate(parse(source),note);}finally{group=outer;}
        if(Array.isArray(result))fail('#ARVO!');return result;
      });},
      value:function(note,field){return safe(function(){return scalar(note,key(field));});},
      values:function(note,field){return safe(function(){return values(note,key(field));});}
    };
  }
  function fillDown(source,offset){
    if(!source.startsWith('='))return source;
    var changes=[];
    function move(ref){
      var a=/^([A-Z]{1,2})([1-9]\d*)$/i.exec(ref),row=a&&Number(a[2])+offset;
      if(!a||!Number.isSafeInteger(row)||row<1)fail('#VIITTAUS');
      return a[1]+row;
    }
    try{
      parse(source,function(token,match,start,rest){
        if(token.type==='cell'){
          var prefix=token.sheet?match[0].slice(0,match[0].lastIndexOf('!')+1):'';
          changes.push({start:start,end:start+match[0].length,value:prefix+move(token.from)+(token.to?':'+move(token.to):'')});
        }else if(token.type==='name'&&!/^\s*\(/.test(rest)){
          if(/^[a-z]+[1-9]\d*$/i.test(token.name))changes.push({start:start,end:start+match[0].length,value:move(match[0])});
          else if(/^[a-z]+[1-9]\d*-/.test(token.name))fail('#VIITTAUS');
        }
      });
      for(var i=changes.length-1;i>=0;i--){
        var c=changes[i];source=source.slice(0,c.start)+c.value+source.slice(c.end);
      }
      return source;
    }catch(e){return null;}
  }
  return {create:create,fields:fields,allowedFields:allowedFields,bodyFields:bodyFields,fillDown:fillDown};
})();

/* Kaikki 0.26: Markdown-taulukot ja solujen laskenta. */
var TAULUKKO=(function(){
  function pathOk(path){return /^taulukot\/[a-z0-9_-]+\/[a-z0-9_-]+\.md$/i.test(path);}
  function splitRow(line){
    var text=line.trim(),out=[],value='',leading=text[0]==='|',ended=false;
    for(var i=leading?1:0;i<text.length;i++){
      ended=text[i]==='|';
      if(text[i]==='\\'&&(text[i+1]==='|'||text[i+1]==='\\'))value+=text[++i];
      else if(ended){out.push(value.trim());value='';}
      else value+=text[i];
    }
    if(!leading&&!out.length)return null;
    if(!ended)out.push(value.trim());
    return out.length?out:null;
  }
  function parse(path,text,kind){
    if(!pathOk(path))return null;
    var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',lines=text.split(eol);
    var fm=VAULT.split(lines.join('\n')).fm;
    if(VAULT.fmGet(fm,'tyyppi')!==(kind||'taulukko'))return null;
    for(var start=(fm?fm.length+2:0);start<lines.length-1;start++){
      var head=splitRow(lines[start]),divider=splitRow(lines[start+1]);
      if(!head||!divider||head.length!==divider.length||head.length>64||!divider.every(function(d){return /^:?-{3,}:?$/.test(d);}))continue;
      var rows=[],end=start+2;
      while(end<lines.length){
        var row=splitRow(lines[end]);
        if(!row||rows.length>=500||row.length>head.length)break;
        while(row.length<head.length)row.push('');
        rows.push(row);end++;
      }
      var parts=path.match(/^taulukot\/([^/]+)\/([^/.]+)\.md$/i);
      return {path:path,book:parts[1],id:parts[2],name:VAULT.fmGet(fm,'otsikko')||parts[2],
        bookName:VAULT.fmGet(fm,'taulukko')||parts[1],locked:/^(kyllä|kylla)$/i.test(VAULT.fmGet(fm,'lukittu')),head:head,rows:rows,divider:divider,
        lines:lines,start:start,end:end,eol:eol};
    }
    return null;
  }
  function joinRow(cells){
    return '| '+cells.map(function(v){return String(v??'').replace(/\\/g,'\\\\').replace(/\|/g,'\\|');}).join(' | ')+' |';
  }
  function replace(sheet,head,rows,divider){
    var lines=[joinRow(head),joinRow(divider)].concat(rows.map(joinRow));
    return sheet.lines.slice(0,sheet.start).concat(lines,sheet.lines.slice(sheet.end)).join(sheet.eol);
  }
  function column(i){
    var out='';
    do{out=String.fromCharCode(65+i%26)+out;i=Math.floor(i/26)-1;}while(i>=0);
    return out;
  }
  function address(label){
    var m=/^([A-Z]{1,2})([1-9]\d*)$/i.exec(label);
    if(!m)return null;
    var c=0;
    m[1].toUpperCase().split('').forEach(function(ch){c=c*26+ch.charCodeAt(0)-64;});
    return {col:c-1,row:Number(m[2])-1};
  }
  function create(sheets,notes,allowed){
    var engine=KAAVA.create(notes,allowed,readCell),memo=new Map(),active=new Set();
    function value(sheet,row,col){
      if(!sheet.rows[row]||col<0||col>=sheet.head.length)return {error:'#PUUTTUU'};
      var key=sheet.path+'!'+column(col)+(row+1);
      if(active.has(key))return {error:'#KEHÄ'};
      if(active.size>=128)return {error:'#KEHÄ'};
      if(memo.has(key))return memo.get(key);
      var raw=sheet.rows[row][col],result;
      active.add(key);
      try{
        if(raw.charAt(0)==='=')result=engine.run(raw,{sheet:sheet});
        else if(/^[+-]?\d+(?:[.,]\d+)?$/.test(raw))result={value:Number(raw.replace(',','.'))};
        else result={value:raw};
      }finally{active.delete(key);}
      memo.set(key,result);return result;
    }
    function readCell(scope,ref){
      var sheet=scope&&scope.sheet;
      if(ref.sheet){
        var key=ref.sheet.toLocaleLowerCase('fi').replace(/\.md$/,'');
        var matches=sheets.filter(function(s){return s.path.replace(/\.md$/,'').toLocaleLowerCase('fi')===key||s.id.toLocaleLowerCase('fi')===key;});
        if(sheet){
          var same=matches.filter(function(s){return s.book===sheet.book;});
          if(same.length)matches=same;
        }
        if(matches.length!==1)throw {code:matches.length?'#ARVO!':'#PUUTTUU'};
        sheet=matches[0];
      }
      var first=address(ref.from),last=ref.to&&address(ref.to);
      if(!sheet||!first||(ref.to&&!last))throw {code:'#PUUTTUU'};
      function at(row,col){var cell=value(sheet,row,col);if(cell.error)throw {code:cell.error};return cell.value;}
      if(!last)return at(first.row,first.col);
      var lowR=Math.min(first.row,last.row),highR=Math.max(first.row,last.row);
      var lowC=Math.min(first.col,last.col),highC=Math.max(first.col,last.col),out=[];
      if(highR>=sheet.rows.length||highC>=sheet.head.length)throw {code:'#PUUTTUU'};
      for(var r=lowR;r<=highR;r++)for(var c=lowC;c<=highC;c++)out.push(at(r,c));
      return out;
    }
    return {formulas:engine,value:value};
  }
  /* 0.40 (A3.3): rivien tai sarakkeiden lisäys, poisto ja siirto kirjoittaa kaavojen viittaukset uudelleen. own(sheetName|null) kertoo, osoittaako
     viittaus muutettuun välilehteen (null = kaavan oma välilehti). map(i) antaa uuden indeksin tai -1 (poistettu). Alueen päät siirtyvät
     ensimmäiseen ja viimeiseen jäljelle jäävään; jos alueesta ei jää mitään tai yksittäinen solu poistuu, tilalle tulee #VIITTAUS (kaava
     näyttää virheen). move=true: siirrossa alueet pysyvät ennallaan, yksittäiset solut seuraavat. Lainausmerkkien sisältö ei muutu. */
  function remap(formula,own,axis,map,move){
    var src=String(formula||'');if(src.charAt(0)!=='=')return src;
    var out='',text=src.slice(1),m,changed=false;
    function one(ref){var a=address(ref);if(!a)return ref;var i=axis==='row'?a.row:a.col,j=map(i);if(j<0)return null;if(j===i)return ref;changed=true;
      return axis==='row'?column(a.col)+(j+1):column(j)+(a.row+1);}
    function span(from,to){var a=address(from),b=address(to);if(!a||!b)return from+':'+to;var lo=axis==='row'?Math.min(a.row,b.row):Math.min(a.col,b.col),hi=axis==='row'?Math.max(a.row,b.row):Math.max(a.col,b.col);
      if(move)return from+':'+to;var first=-1,last=-1;for(var i=lo;i<=hi;i++){var j=map(i);if(j>=0){if(first<0)first=j;last=j;}}if(first<0){changed=true;return null;}
      var A={row:Math.min(a.row,b.row),col:Math.min(a.col,b.col)},B={row:Math.max(a.row,b.row),col:Math.max(a.col,b.col)};
      if(axis==='row'){A.row=first;B.row=last;}else{A.col=first;B.col=last;}var res=column(A.col)+(A.row+1)+':'+column(B.col)+(B.row+1);if(res!==from+':'+to)changed=true;return res;}
    while(text.length){
      if((m=/^\s+/.exec(text))){out+=m[0];}
      else if((m=/^\[\[([^\[\]\r\n]+)\]\]!([A-Z]+[1-9]\d*)(?::([A-Z]+[1-9]\d*))?/i.exec(text))){
        if(own(m[1].trim())){var r=m[3]?span(m[2],m[3]):one(m[2]);out+=r===null?'#VIITTAUS':'[['+m[1]+']]!'+r;if(r===null)changed=true;}else out+=m[0];}
      else if((m=/^([A-Z]+[1-9]\d*):([A-Z]+[1-9]\d*)/i.exec(text))){if(own(null)){var r2=span(m[1],m[2]);out+=r2===null?'#VIITTAUS':r2;}else out+=m[0];}
      else if((m=/^\[\[([^\[\]\r\n]+)\]\]\.[\p{L}_][\p{L}\p{N}_-]*/u.exec(text))){out+=m[0];}
      else if((m=/^"(?:[^"\\\r\n]|\\["\\])*"/.exec(text))){out+=m[0];}
      else if((m=/^[\p{L}_][\p{L}\p{N}_]*(?:-[\p{L}_][\p{L}\p{N}_]*)*/u.exec(text))){
        if(/^[A-Z]{1,3}[1-9]\d*$/i.test(m[0])&&!/^\s*\(/.test(text.slice(m[0].length))&&own(null)){var r3=one(m[0]);if(r3===null){out+='#VIITTAUS';changed=true;}else out+=r3;}else out+=m[0];}
      else{m=[text.charAt(0)];out+=m[0];}
      text=text.slice(m[0].length);
    }
    return changed?'='+out:src;
  }
  return {parse:parse,pathOk:pathOk,replace:replace,column:column,address:address,create:create,joinRow:joinRow,remap:remap};
})();
/* Kaikki 0.65 (Emil 23.11.2026, SUUNNITELMA Tulevien ominaisuuksien jono kohta 3): tekstimuuttujat.
   !!nimi: arvo!! tai !!päivät: nimi: arvo!!. Päivättömässä muodossa ensimmäinen kaksoispiste erottaa nimen ja arvon (arvossa saa olla
   kaksoispisteitä). Päivätty muoto: ensimmäistä kaksoispistettä edeltävä osa on kokonaan päivämääriä (Kaikin tunnistus + VVVV-KK-PP),
   erottimia ja täytesanoja, ja sen jälkeen tulee vielä nimi: arvo. Avaavan !!:n jälkeen ei saa olla välilyöntiä (muuten "Hienoa!! Huom: x!!"
   tulkittaisiin muuttujaksi). Koodilohkot ja `koodi` ohitetaan, keskeneräinen merkintä on tavallista tekstiä, rivinvaihto katkaisee.
   Päivät: ensin merkinnän omat, muuten osion (---) tavallisesta tekstistä yksi yksiselitteinen päivä, muuten päivätön (syy 'ei' tai 'monta').
   Merkinnän omassa päivässä vuodeton d.m. (ilman viikonpäivää), joka osuisi luontipäivän jälkeiseen aikaan, saa edellisen vuoden: havainto ei
   koske tulevaa (kalenteri tulkitsee 1.4. marraskuussa ensi huhtikuuksi). Osion tekstin päivät tulkitaan kuten kalenterissa. */
var MUUTTUJA=(function(){
  var FILL={ja:1,sekä:1,seka:1,tai:1,myös:1,and:1,pv:1,päivinä:1,päivänä:1};
  function code(t){var out=[],re=/```[\s\S]*?(?:```|$)|`[^`\r\n]*`/g,m;while((m=re.exec(t))){out.push([m.index,re.lastIndex]);if(!m[0].length)re.lastIndex++;}return out;}
  function inCode(C,i){for(var k=0;k<C.length;k++)if(i>=C[k][0]&&i<C[k][1])return C[k];return null;}
  /* Raakamerkinnät {s,e} (e = sulkevan !!:n jälkeen) */
  function legacyMarks(text,C){var out=[],i=0;
    while((i=text.indexOf('!!',i))>=0){var c=inCode(C,i);if(c){i=c[1];continue;}
      var j=text.indexOf('!!',i+2),nl=text.indexOf('\n',i+2);if(j<0)break;
      if(nl>=0&&nl<j){i=nl;continue;}
      var inner=text.slice(i+2,j);
      if(!inner||/^[\s!]/.test(inner)||inner.indexOf(':')<0||inCode(C,j)){i+=2;continue;}
      out.push({s:i,e:j+2});i=j+2;}
    return out;}
  var quotedName='"(?:\\\\.|[^"\\\\\\r\\n])*"';
  function blockParts(text,start,end,separator){
    var parts=[],at=start;
    var re=new RegExp(quotedName+'|\\[\\[[^\\r\\n]*?\\]\\]|'+(separator===','?',':'\\|'),'g');
    var head=/^\s*(?:(?:#[\p{L}\p{N}-]+|\^[a-z0-9-]+)(?=\s*(?:,|$))|(?:"(?:\\.|[^"\\\r\n])*"|[^\s,:=|][^,:=|\r\n]*?)\s*=)/u;
    text.slice(start,end).replace(re,function(token,index,input){
      if(token===separator&&(separator!==','||head.test(input.slice(index+1)))){
        parts.push({s:at,e:start+index});at=start+index+1;
      }
      return token;
    });
    parts.push({s:at,e:end});return parts;
  }
  function validName(name){return !!name&&!/[:\r\n]|!!|\(\(|\)\)/.test(name);}
  function outside(text,pattern){
    var re=new RegExp(quotedName+'|\\[\\[[^\\r\\n]*?\\]\\]|'+pattern,'g'),m,out=[];
    while((m=re.exec(text)))if(m[0].length===1)out.push(m.index);
    return out;
  }
  function decoded(value){
    if(value[0]!=='"')return value;
    try{var parsed=JSON.parse(value);return typeof parsed==='string'?parsed:'';}catch(e){return '';}
  }
  function observationDate(text,base){
    var raw=text.trim(),iso=/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d:\d\d))?$/.exec(raw);
    if(iso){
      if(!okIso(+iso[1],+iso[2],+iso[3])||iso[4]&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(iso[4]))return null;
      return {day:raw.slice(0,10),clock:iso[4]||''};
    }
    var dates=parseDates(raw,base),hit=dates[0];
    if(dates.length!==1||hit.s!==0||hit.e!==raw.length||hit.rec||hit.a!==hit.b||hit.time?.e)return null;
    return {day:hit.a,clock:hit.time?.s||''};
  }
  function commaHead(text,start,end,base){
    var content=text.slice(start,end),equals=outside(content,'=')[0];
    if(equals===undefined)return null;
    var commas=outside(content.slice(0,equals),','),first=0,date=null,ds=-1,de=-1;
    for(var i=commas.length-1;i>=0;i--){
      date=observationDate(content.slice(0,commas[i]),base);
      if(date){first=commas[i]+1;ds=start+content.search(/\S/);de=start+commas[i];break;}
    }
    var before=content.slice(first,equals),colon=outside(before,':')[0],subject='';
    if(colon!==undefined){
      var raw=before.slice(0,colon).trim();
      if(raw[0]!=='"'&&/[,:=|@]/.test(raw))return null;
      subject=decoded(raw);
      if(!validName(subject))return null;
      first+=colon+1;
    }else if(!date&&commas.length&&content.trim()[0]!=='"')return null;
    return {body:start+first,subject:subject,dates:date?[date.day]:[],clock:date?.clock||'',ds:ds,de:de};
  }
  function pipeHead(text,parts){
    var head=text.slice(parts[0].s,parts[0].e).trim(),subject='',stamp='',dates=[],ds=-1,de=-1;
    var date=/^(?:(.*?)\s+)?@(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)(?:\s*,\s*(\d{4}-\d{2}-\d{2}(?:\s*,\s*\d{4}-\d{2}-\d{2})*))?$/.exec(head);
    if(date){
      subject=(date[1]||'').trim();stamp=date[2].slice(11);
      if(subject&&!validName(subject)||stamp&&(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(stamp)||date[3]))return null;
      dates=[date[2].slice(0,10)].concat(date[3]?date[3].split(/\s*,\s*/):[]);
      if(!dates.every(function(day){var v=day.split('-').map(Number);return okIso(v[0],v[1],v[2]);}))return null;
      ds=text.indexOf('@',parts[0].s);de=parts[0].e;parts.shift();
    }else if(parts.length>1&&validName(head)&&!/^[@#]/.test(head)){
      subject=head;parts.shift();
    }
    return {subject:subject,dates:dates,clock:stamp,ds:ds,de:de};
  }
  function unitParts(name){
    var m=/^(.+?)\s+\(([^()]+)\)$/.exec(name||'');
    return m?{name:m[1],unit:m[2].trim()}:{name:name||'',unit:''};
  }
  function quantity(value){
    return /^([+−-]?\d+(?:[.,]\d+)?)\s*([a-zA-Zµμ°%€$][a-zA-Zµμ°%€$\d³²/]*(?:\s*\/\s*\d+\s*[a-zA-Zµμ\d]+)?)$/u.exec(value);
  }
  function unitKey(unit){return String(unit||'').replace(/\s+/g,'').normalize('NFC');}
  function blockFields(text,parts,mode,body){
    var fields=[],tags=[],id='',idS=-1,idE=-1,seen=new Set();
    for(var i=0;i<parts.length;i++){
      var part=parts[i],raw=text.slice(part.s,part.e),trim=raw.trim();
      var tag=/^#([\p{L}\p{N}-]+)$/u.exec(trim);
      if(tag){var t=noteTagKey(tag[1]);if(!t)return null;tags.push(t);continue;}
      if(/^\^[a-z0-9-]+$/.test(trim)&&!id){id=trim.slice(1);idS=part.s-1;idE=part.e;continue;}
      var delimiter=outside(raw,mode==='comma'?'=':':')[0];
      if(delimiter===undefined)return null;
      var rawName=raw.slice(0,delimiter).trim(),name=decoded(rawName),value=raw.slice(delimiter+1).trim();
      var literal=value[0]==='"',ns=part.s+raw.indexOf(rawName),vs=part.s+delimiter+1+raw.slice(delimiter+1).search(/\S/),ve=vs+value.length;
      if(literal)value=decoded(value);
      if(!validName(name)||!value||/[\r\n]/.test(value)||mode==='comma'&&rawName[0]!=='"'&&/[,=]/.test(name))return null;
      var q=mode==='comma'&&!literal&&quantity(value),unit='',cellValue=value,number=literal?null:num(value);
      if(q){
        unit=q[2];var existing=unitParts(name).unit;
        if(!existing||unitKey(existing)===unitKey(unit)){
          if(!existing)name+=' ('+unit+')';
          cellValue=q[1];number=num(cellValue);
        }else unit='';
      }
      if(seen.has(key(name)))return null;
      seen.add(key(name));fields.push({ns:ns,ne:ns+rawName.length,vs:vs,ve:ve,nimi:name,key:key(name),arvo:value,
        cellValue:cellValue,unit:unit,literal:literal,luku:number,
        totuus:!literal&&/^(true|false)$/i.test(value)?value.toLowerCase()==='true':null,
        removeFrom:part.s>body?part.s-1:part.s,removeTo:part.s>body?part.e:part.e+1});
    }
    return fields.length?{fields:fields,tags:tags,id:id,idS:idS,idE:idE}:null;
  }
  function modernBlock(text,start,end,base){
    var a=start+2,b=end-2,legacy=blockParts(text,a,b,'|'),head,parts,body=a,mode='pipe';
    var raw=text.slice(a,b),newHead=legacy.length===1&&commaHead(text,a,b,base);
    if(legacy.length===1&&!newHead){
      var equal=outside(raw,'=')[0],comma=outside(raw,',')[0];
      if(equal!==undefined&&comma!==undefined&&comma<equal){
        var dateText=raw.slice(0,comma).trim();
        if(parseDates(dateText,base).length||/^\d{1,4}[.\/-]|^(klo|kello|joka)\b/i.test(dateText))return null;
      }
    }
    if(newHead){
      var equalAt=outside(raw,'=')[0],before=raw.slice(0,equalAt);
      /* Lyhyt vanha kenttä voi sisältää yhtälön. Uudessa nimetyssä lohkossa ” = ” erottaa kentän ja arvon. */
      if(newHead.ds>=0||!newHead.subject||/\s/.test(raw[equalAt-1])&&/\s/.test(raw[equalAt+1])||!before.includes(':')){
        head=newHead;body=head.body;parts=blockParts(text,body,b,',');mode='comma';
      }
    }
    if(!head){parts=legacy;head=pipeHead(text,parts);}
    if(!head)return null;
    var data=blockFields(text,parts,mode,body);if(!data)return null;
    return {s:start,e:end,syntax:mode,fields:data.fields,kohde:head.subject,kohdeKey:key(head.subject),paivat:uniq(head.dates),
      kello:head.clock,tagit:uniq(data.tags),ds:head.ds,de:head.de,id:data.id,idS:data.idS,idE:data.idE};
  }
  function marks(text,base){text=String(text||'');
    base=base instanceof Date?base:new Date(base||Date.now());if(isNaN(base.getTime()))base=new Date();
    var C=text.indexOf('`')>=0?code(text):[],blocks=[],start=-1,m;
    var re=/"(?:\\.|[^"\\\r\n])*"|\[\[[^\r\n]*?\]\]|\(\(|\)\)|\r?\n[ \t]*\r?\n/g;
    if(text.includes('(('))while((m=re.exec(text))){
      var token=m[0],skip=inCode(C,m.index);
      if(skip){start=-1;re.lastIndex=Math.max(m.index+1,skip[1]);continue;}
      if(token==='(('){start=m.index;continue;}
      if(token==='))'){
        if(start>=0){var block=modernBlock(text,start,re.lastIndex,base);if(block)blocks.push(block);}
        start=-1;
      }else if(token[0]==='\n'||token[0]==='\r')start=-1;
    }
    var legacy=legacyMarks(text,C).filter(function(old){return !blocks.some(function(block){return old.s<block.e&&block.s<old.e;});});
    return legacy.concat(blocks).sort(function(a,b){return a.s-b.s;});
  }
  function mask(text,found,base){text=String(text==null?'':text);if(text.indexOf('!!')<0&&text.indexOf('((')<0)return text;var M=found||marks(text,base);if(!M.length)return text;var out='',at=0;
    M.forEach(function(m){out+=text.slice(at,m.s)+text.slice(m.s,m.e).replace(/[^\n]/g,' ');at=m.e;});return out+text.slice(at);}
  function num(v){var t=String(v).trim().replace(/−/g,'-');return /^[+-]?\d+(?:[.,]\d+)?$/.test(t)?Number(t.replace(',','.')):null;}
  function key(n){return String(n||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('fi');}
  function okIso(y,m,d){var x=new Date(y,m-1,d);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d;}
  /* Päivät tekstistä: {d: [iso], amb: true jos jakso tai toistuva, spans} */
  function daysIn(t,base,past){var out=[],amb=false,sp=[],re=/\b(\d{4})-(\d{2})-(\d{2})\b/g,m,masked=t;
    while((m=re.exec(t))){if(okIso(+m[1],+m[2],+m[3]))out.push(m[0]);sp.push([m.index,re.lastIndex]);masked=masked.slice(0,m.index)+m[0].replace(/./g,' ')+masked.slice(re.lastIndex);}
    var b0=base instanceof Date&&!isNaN(base.getTime())?base:new Date(),lim=isoD(addDays(b0,1));
    parseDates(masked,b0).forEach(function(o){if(o.bare||!o.R||o.s===undefined)return;sp.push([o.s,o.e]);
      if(o.rec||o.a!==o.b){amb=true;return;}var a=o.a,src=t.slice(o.s,o.e);
      if(past&&a>lim&&/\d{1,2}\.\d{1,2}\./.test(src)&&!/\d{1,2}\.\d{1,2}\.\s*\d{2,4}/.test(src)&&!/[a-zåäö]{2}/i.test(src))a=String(+a.slice(0,4)-1)+a.slice(4);
      out.push(a);});
    return {d:out,amb:amb,sp:sp};}
  function uniq(a){var o=[];a.forEach(function(x){if(o.indexOf(x)<0)o.push(x);});return o.sort();}
  /* Onko etuosa kokonaan päivämääriä, erottimia ja täytesanoja? Palauttaa päivät tai null. */
  function headDays(head,base){if(!/\d|eilen|tänään|tanaan|toissa|huomenna/i.test(head))return null;var D=daysIn(head,base,true);if(!D.d.length||D.amb)return null;
    var rest=head.split('');D.sp.forEach(function(p){for(var k=p[0];k<p[1];k++)rest[k]=' ';});
    var ok=rest.join('').split(/[\s,;&+\/.\-–—]+/).every(function(w){return !w||FILL[w.toLocaleLowerCase('fi')];});
    return ok?uniq(D.d):null;}
  function sections(text){var SP=sepParts(text);return SP&&SP.length?SP:[{s:0,e:text.length,t:text}];}
  /* Havainnot: {s,e, nimi, key, arvo, luku, paivat, lahde:'merkintä'|'osio'|'', syy:''|'ei'|'monta', ds,de (päiväosa), ns,ne, vs,ve} */
  function parse(text,created){text=String(text||'');if(text.indexOf('!!')<0&&text.indexOf('((')<0)return [];
    var base=created instanceof Date?created:new Date(created||Date.now());if(isNaN(base.getTime()))base=new Date();
    var M=marks(text,base);if(!M.length)return [];
    var masked=mask(text,M),secs=sections(masked),secDay={};
    function secOf(i){for(var k=0;k<secs.length;k++)if(i>=secs[k].s&&i<secs[k].e)return k;var best=0;secs.forEach(function(p,k){if(p.s<=i)best=k;});return best;}
    function dayOfSec(k){if(secDay[k])return secDay[k];var D=daysIn(secs[k].t,base),u=uniq(D.d);
      return (secDay[k]=D.amb||u.length>1?{d:[],syy:'monta'}:u.length?{d:u,syy:''}:{d:[],syy:'ei'});}
    var out=[];
    M.forEach(function(m){
      if(m.fields){m.fields.forEach(function(field){
        out.push(Object.assign({s:m.s,e:m.e,block:m,kohde:m.kohde,kohdeKey:m.kohdeKey,kello:m.kello,tagit:m.tagit,
          paivat:m.paivat,lahde:m.paivat.length?'merkintä':'',syy:'',ds:m.ds,de:m.de},field));
      });return;}
      var cs=m.s+2,inner=text.slice(cs,m.e-2),c1=inner.indexOf(':'),head=inner.slice(0,c1),rest=inner.slice(c1+1),days=null,ds=-1,de=-1;
      var c2=rest.indexOf(':');
      if(c2>=0&&(days=headDays(head,base))){ds=cs;de=cs+c1+1;var off=c1+1;inner=rest;c1=c2;cs+=off;head=inner.slice(0,c1);rest=inner.slice(c1+1);}
      var nimi=head.trim(),arvo=rest.trim();if(!nimi||!arvo)return;
      var lead=head.length-head.replace(/^\s+/,'').length,vlead=rest.length-rest.replace(/^\s+/,'').length;
      var o={s:m.s,e:m.e,nimi:nimi,key:key(nimi),arvo:arvo,luku:num(arvo),paivat:[],lahde:'',syy:'',ds:ds,de:de,
        ns:cs+lead,ne:cs+lead+nimi.length,vs:cs+c1+1+vlead,ve:cs+c1+1+vlead+arvo.length};
      if(days){o.paivat=days;o.lahde='merkintä';}
      else{var S=dayOfSec(secOf(m.s));o.paivat=S.d.slice();o.lahde=S.d.length?'osio':'';o.syy=S.syy;}
      out.push(o);});
    return out;}
  /* Luettelo muistiinpanoista [{text, created, …}] → [{nimi, key, obs:[{n: muistiinpano, o: havainto}]}] nimen mukaan */
  var observations=new WeakMap();
  function observe(note){
    var previous=observations.get(note);
    if(previous&&previous.text===note.text&&previous.created===note.created)return previous.values;
    var values=parse(note.text,note.created);
    observations.set(note,{text:note.text,created:note.created,values:values});
    return values;
  }
  function luettelo(notes){var by=new Map();(notes||[]).forEach(function(n){observe(n).forEach(function(o){
      if(!by.has(o.key))by.set(o.key,{nimi:o.nimi,key:o.key,obs:[]});
      by.get(o.key).obs.push({n:n,o:o});
    });});
    return Array.from(by.values()).sort(function(a,b){return a.nimi.localeCompare(b.nimi,'fi');});}
  /* 0.66: kojelaudan muuttujaruutu. R = {muuttuja, laske: viimeisin|summa|keskiarvo|min|max|maara, aika: ''|päiviä, tunniste, kansio}.
     Piste = havainnon yksi päivä (päivätön havainto = yksi piste ilman päivää, mukana vain aikavälillä Kaikki). Tyhjä merkintä ei synny
     (jäsennys ohittaa), kirjattu nolla lasketaan. Määrä laskee myös tekstiarvot. Viimeisin = myöhäisin päivä (päivätön viimeisenä).
     Sarja: päivän arvo = summa (summa), määrä (maara) tai keskiarvo (muut); puuttuva päivä = null (aukko kuvaajassa). */
  function fieldText(value,literal,mode){
    var comma=mode==='comma'&&value.includes(',')&&num(value)===null&&!quantity(value);
    return literal||comma||/[|"\r\n]|\(\(|\)\)|\)$/.test(value)||mode!=='comma'&&value.includes('=')?JSON.stringify(value):value;
  }
  function format(name,value,subject,stamp,tag,id){
    if(!validName(name)||subject&&!validName(subject)||!value||/[\r\n]/.test(value))return '';
    var date=/^(\d{4}-\d\d-\d\d)(?:[ T](\d\d:\d\d))?$/.exec(stamp||'');
    var prefix=date?fiDate(date[1])+(date[2]?' klo '+date[2].replace(':','.'):'')+', ':stamp?stamp+', ':'';
    var title=subject?(/[,:=|@"]/.test(subject)?JSON.stringify(subject):subject)+': ':'';
    var field=/[,=|"]/.test(name)?JSON.stringify(name):name;
    return '(('+prefix+title+field+' = '+fieldText(value,false,'comma')+(tag?', #'+tag:'')+(id?', ^'+id:'')+'))';
  }
  function sameTarget(observation,subject){return (observation.kohdeKey||'')===key(subject);}
  function moment(day,clock){return day+(clock?' '+clock:'');}
  function summary(points,mode){
    if(mode==='maara')return points.length;
    if(!points.length)return null;
    if(mode==='arvo')return points.length===1?points[0].v??points[0].a:points.length+' arvoa';
    if(mode==='luettelo')return points.map(function(p){return p.a;}).join(', ');
    if(mode==='viimeisin'){
      var last=points.reduce(function(a,b){return a.when>=b.when?a:b;});
      var tied=points.filter(function(p){return p.when===last.when;});
      return tied.length===1?last.v??last.a:tied.length+' arvoa';
    }
    var nums=points.map(function(p){return p.v;}).filter(Number.isFinite);
    if(!nums.length)return null;
    if(mode==='min')return nums.reduce(function(a,b){return Math.min(a,b);});
    if(mode==='max')return nums.reduce(function(a,b){return Math.max(a,b);});
    var sum=nums.reduce(function(a,b){return a+b;},0);
    return mode==='summa'?sum:sum/nums.length;
  }
  var LASKE=['arvo','viimeisin','luettelo','summa','keskiarvo','min','max','maara'];
  function fieldObservation(n,name,fields){
    var result=fields.value(n,name);
    if(result.error||result.value===null||result.value===undefined)return [];
    var value=String(result.value).trim();
    if(!value)return [];
    var day=n.date||(/^paivat\/\d{4}\/(\d{4}-\d{2}-\d{2})\.md$/.exec(n.vp||'')||[])[1];
    if(!day&&n.created){var date=new Date(n.created);if(!isNaN(date.getTime()))day=isoD(date);}
    var number=typeof result.value==='number'?result.value:num(value);
    return [{key:key(name),arvo:value,luku:Number.isFinite(number)?number:null,paivat:day?[day]:[]}];
  }
  function ruutu(notes,R,today,fields,resolve){
    var k0=key(R.muuttuja),tag=String(R.tunniste||'').trim().replace(/^#/,''),dir=String(R.kansio||'').trim().replace(/^\/+|\/+$/g,'');
    var fromField=R.lahde==='kentta';
    if(resolve&&!fromField)k0=resolve('variables',R.muuttuja).key;
    var laske=LASKE.indexOf(R.laske)>=0?R.laske:'viimeisin',N=Math.max(0,Math.floor(+R.aika||0)),from=N?isoD(addDays(fromIso(today),-(N-1))):'';
    if(tag&&typeof noteTagKey==='function')tag=noteTagKey(tag)||tag.toLocaleLowerCase('fi');
    var start=R.alku||from,stop=R.loppu||(N?today:''),subject=resolve?resolve('subjects',R.kohde).key:key(R.kohde),
      ownTag=noteTagKey(R.havaintotunniste),pts=[],src=[];
    (notes||[]).forEach(function(n){if(dir&&String(n.vp||'').indexOf(dir+'/')!==0)return;
      if(tag&&noteTags(n).indexOf(tag)<0)return;
      var observations=fromField?(fields?fieldObservation(n,R.muuttuja,fields):[]):observe(n);
      observations.forEach(function(o){
        var v=resolve&&!fromField?resolve('variables',o.nimi).key:o.key,
          s=resolve?resolve('subjects',o.kohde).key:o.kohdeKey;
        if(v!==k0||subject&&s!==subject||ownTag&&!(o.tagit||[]).includes(ownTag))return;
        var used=false;(o.paivat.length?o.paivat:['']).forEach(function(d){
        if((start||stop)&&(!d||start&&d<start||stop&&d>stop))return;pts.push({d:d,v:o.luku,a:o.arvo,when:moment(d,o.kello),n:n,o:o});used=true;});if(used)src.push({n:n,o:o});});});
    var nums=pts.filter(function(p){return p.v!==null;}).map(function(p){return p.v;}),last=null,val=null;
    pts.forEach(function(p){if(!last||p.when>=last.when)last=p;});
    function sum(a){return a.reduce(function(x,y){return x+y;},0);}
    function numericResult(values,mode){
      if(!values.length)return null;
      if(mode==='summa')return sum(values);
      if(mode==='min')return values.reduce(function(a,b){return Math.min(a,b);});
      if(mode==='max')return values.reduce(function(a,b){return Math.max(a,b);});
      return sum(values)/values.length;
    }
    if(laske==='viimeisin'&&!pts.some(function(p){return p.o.block;}))val=last?(last.v!==null?last.v:last.a):null;
    else val=summary(pts,laske);
    var days=pts.filter(function(p){return p.d;}).map(function(p){return p.d;}).sort(),sarja=[];
    if(days.length){var a=start||days[0],b=stop||(today>days[days.length-1]?today:days[days.length-1]);
      if(isoD(addDays(fromIso(b),-365))>a)a=isoD(addDays(fromIso(b),-365));
      for(var d=a;d<=b;d=isoD(addDays(fromIso(d),1))){var P=pts.filter(function(p){return p.d===d;}),V=P.filter(function(p){return p.v!==null;}).map(function(p){return p.v;});
         var v=P.some(function(p){return p.o.block;})?summary(P,laske):laske==='maara'?(P.length||null):fromField&&laske==='viimeisin'&&P.length
           ?P[P.length-1].v:numericResult(V,fromField||laske==='summa'?laske:'keskiarvo');
         sarja.push({d:d,v:Number.isFinite(v)?v:null});}}
    return {arvo:val,laske:laske,pisteet:pts.length,luvut:nums.length,viimeisin:last,lahteet:src,sarja:sarja};}
  function maskModern(text,base){return text&&text.includes('((')?mask(text,marks(text,base).filter(function(m){return m.fields;})):text;}
  return {marks:marks,mask:mask,maskModern:maskModern,parse:parse,observe:observe,luettelo:luettelo,num:num,key:key,ruutu:ruutu,LASKE:LASKE,
    format:format,fieldText:fieldText,unitParts:unitParts,unitKey:unitKey,sameTarget:sameTarget,moment:moment,summary:summary,validName:validName};
})();
function observationMatrix(notes,view,resolve){
  resolve=resolve||function(_,name){return {key:MUUTTUJA.key(name),name:name};};
  function subject(name){return resolve('subjects',name);}
  function field(name){return resolve('variables',name);}
  var subjects=new Set(view.subjects.map(function(n){return subject(n).key;})),rows=new Map(),cols=new Map();
  var pivot=view.colAxis!=='valitut',variable=field(view.variable).key,tag=noteTagKey(view.tag),noteTag=noteTagKey(view.noteTag);
  function axis(kind,o,d,record){
    if(kind==='kirjaus')return [record,[o.kohde||'Kirjaus',d,o.kello].filter(Boolean).join(' · ')];
    if(kind==='kohde')return [subject(o.kohde).key,subject(o.kohde).name||'Kohteeton'];
    if(kind==='muuttuja')return [field(o.nimi).key,field(o.nimi).name];
    if(!d)return ['','Päivätön'];
    var day=kind==='viikko'?monOf(d):d;
    return [day,kind==='viikko'?'Viikko alkaen '+fiDate(day):fiDate(day)];
  }
  function addRow(key,label){if(!rows.has(key))rows.set(key,{label:label,cells:new Map()});return rows.get(key);}
  if(view.rowAxis==='kohde')view.subjects.forEach(function(name){addRow(subject(name).key,subject(name).name);});
  if(pivot&&view.colAxis==='kohde')view.subjects.forEach(function(name){cols.set(subject(name).key,{title:subject(name).name,mode:view.mode});});
  if(!pivot)view.columns.forEach(function(c,i){if(c.name.trim())cols.set(i,{title:c.title||c.name,mode:c.mode});});
  notes.forEach(function(note,index){
    if(noteTag&&!noteTags(note).includes(noteTag))return;
    MUUTTUJA.observe(note).forEach(function(o){
      if(subjects.size&&!subjects.has(subject(o.kohde).key)||tag&&!(o.tagit||[]).includes(tag)||pivot&&variable&&field(o.nimi).key!==variable)return;
      var points=o.paivat.length?o.paivat:[''];
      points.forEach(function(d){
        if((view.start||view.end)&&(!d||view.start&&d<view.start||view.end&&d>view.end))return;
        var record=index+':'+o.s,ax=axis(view.rowAxis,o,d,record);
        var row=addRow(ax[0],ax[1]),matches=[];
        if(pivot){var c=axis(view.colAxis,o,d,record);cols.set(c[0],{title:c[1],mode:view.mode});matches=[c[0]];}
        else view.columns.forEach(function(c,j){if(field(c.name).key===field(o.nimi).key)matches.push(j);});
        matches.forEach(function(k){
          if(!row.cells.has(k))row.cells.set(k,[]);
          row.cells.get(k).push({a:o.arvo,v:o.luku,when:MUUTTUJA.moment(d,o.kello),n:note,o:o,d:d});
        });
      });
    });
  });
  function order(a,b){return a[0]===''?1:b[0]===''?-1:a[0]<b[0]?-1:a[0]>b[0]?1:0;}
  return {rows:Array.from(rows).sort(order),cols:pivot?Array.from(cols).sort(order):Array.from(cols)};
}
if(typeof module!=='undefined')module.exports={observationMatrix:observationMatrix,MUUTTUJA:MUUTTUJA,KAAVA:KAAVA,TAULUKKO:TAULUKKO,pvNorm:pvNorm,pvOut:pvOut,pvWd:pvWd,pvP:pvP,pvLift:pvLift,pvToggle:pvToggle,pvSet:pvSet,stNorm:stNorm,stVis:stVis,stTop:stTop,stPick:stPick,stDone:stDone,stDel:stDel,stItem:stItem,stPath:stPath,flNorm:flNorm,flOut:flOut,monOf:monOf,wkIdx:wkIdx,wkRow:wkRow,wkTone:wkTone,dayTextDays:dayTextDays,dayTextToggle:dayTextToggle,wlKey:wlKey,wlWords:wlWords,wlOpt:wlOpt,wlOk:wlOk,wlIndex:wlIndex,wlHits:wlHits,WL_STOP:WL_STOP,flowFind:flowFind,flowStart:flowStart,flowFinish:flowFinish,phaseEnsure:phaseEnsure,phaseOf:phaseOf,phaseAttach:phaseAttach,workflowReady:workflowReady,prevOcc:prevOcc,recKey:recKey,recEnded:recEnded,recExpiries:recExpiries,dateLabel:dateLabel,aiOhje:aiOhje,AI_ESIM:AI_ESIM,TIME_TERMS:TIME_TERMS,wdKeys:wdKeys,WD_TERMS:WD_TERMS,treeEh:treeEh,sepParts:sepParts,noteParts:noteParts,partIx:partIx,partNote:partNote,txSim:txSim,txBase:txBase,txSync:txSync,txSet:txSet,txOn:txOn,partAt:partAt,partInfo:partInfo,gone:gone,rowPicks:rowPicks,partTerms:partTerms,ehTree:ehTree,treeEhBlock:treeEhBlock,inferTerms:inferTerms,ehIssues:ehIssues,grpHit:grpHit,ehTok:ehTok,textExtras:textExtras,ehdotText:ehdotText,chkCond:chkCond,condsIn:condsIn,chkItems:chkItems,WIN0:WIN0,winOf:winOf,calvOf:calvOf,clipDay:clipDay,durOf:durOf,planSlots:planSlots,chkPlan:chkPlan,VER:VER,ALKU:ALKU,parseLine:parseLine,lineOf:lineOf,bodyText:bodyText,parseText:parseText,lineKinds:lineKinds,blocksOf:blocksOf,rulesOf:rulesOf,writeRules:writeRules,rulesFromText:rulesFromText,rulesToText:rulesToText,canonR:canonR,renameInText:renameInText,renameLive:renameLive,blockTerms:blockTerms,withText:withText,rl:rl,ruleState:ruleState,toggleRule:toggleRule,needOf:needOf,orderOf:orderOf,cycleIf:cycleIf,toggleOrder:toggleOrder,priorityList:priorityList,hoidettavat:hoidettavat,termWords:termWords,needOpen:needOpen,setNeedMode:setNeedMode,toggleNeed:toggleNeed,causesOf:causesOf,
  sessionView:sessionView,moveItem:moveItem,shownName:shownName,blockedNow:blockedNow,tapDraft:tapDraft,replay:replay,exclOf:exclOf,newSession:newSession,notesOnDay:notesOnDay,dayCarry:dayCarry,commitStep:commitStep,undoStep:undoStep,sessionNote:sessionNote,sessionGroups:sessionGroups,renameKey:renameKey,removeKey:removeKey,
  replaceLine:replaceLine,orphans:orphans,dropOrphans:dropOrphans,hasWord:hasWord,normT:normT,termHits:termHits,popTerms:popTerms,termsToText:termsToText,termsFromText:termsFromText,getAnswer:getAnswer,setAnswer:setAnswer,termOn:termOn,noteTerms:noteTerms,autoTerms:autoTerms,parseDates:parseDates,occursOn:occursOn,nextOcc:nextOcc,dateLabel:dateLabel,tokensOf:tokensOf,noteDates:noteDates,dayEntries:dayEntries,moveEntry:moveEntry,setTimeText:setTimeText,toMin:toMin,fromMin:fromMin,fmtTime:fmtTime,noteTitle:noteTitle,nextDate:nextDate,
  noteAdds:noteAdds,applyAdds:applyAdds,relSpans:relSpans,lockRel:lockRel,relWord:relWord,relSweep:relSweep,mvAdd:mvAdd,mvClean:mvClean,mvSpans:mvSpans,nlSpans:nlSpans,nlClean:nlClean,setWhen:setWhen,whenSpan:whenSpan,timeTok:timeTok,chkRank:chkRank,chkSort:chkSort,chkView:chkView,chkSince:chkSince,chkTime:chkTime,chkMentions:chkMentions,chkDue:chkDue,itemOk:itemOk,renewAt:renewAt,itemUntil:itemUntil,chkDone:chkDone,chkNext:chkNext,chkOpenN:chkOpenN,toggleItem:toggleItem,occKey:occKey,occList:occList,ptDone:ptDone,safeName:safeName,expName:expName,staleK:staleK,splitAdds:splitAdds,ADD_H:ADD_H,sortNotes:sortNotes,TIME_TERMS:TIME_TERMS,SPEC:SPEC,isSpec:isSpec,timeTermOf:timeTermOf,fullOrder:fullOrder,moveDay:moveDay,clearTime:clearTime,calTerms:calTerms,addUnit:addUnit,repNext:repNext,repLabel:repLabel,repsDue:repsDue,trigHit:trigHit,trigLast:trigLast,trigNext:trigNext,trigLabel:trigLabel,repSignOff:repSignOff,moveInOrder:moveInOrder,prioSort:prioSort,impRanks:impRanks,moveToIdx:moveToIdx,meaningsOf:meaningsOf,offeredIds:offeredIds,flipMissing:flipMissing,purgeTrash:purgeTrash,fiDate:fiDate,stamp:stamp,isoD:isoD,normalizeData:normalizeData,projectsFromFile:projectsFromFile,projectFile:projectFile,looseJson:looseJson};
/* ---- Kaikki 0.1 (Emil 22.11.2026): vault = muistiinpanot GitHubin repossa, yksi .md-tiedosto per muistiinpano ----
   Juuren muistiinpano N <-> vaultin tiedosto. N.vp = polku, N.vfm = alkutietojen rivit sellaisinaan, N.vpre/N.vpost = rungon
   alku- ja lopputyhjä, N.vh = runko alkoi "# "-otsikolla (Juuressa ensimmäinen rivi on otsikko ilman #:ia), N.vnofm = ei alkutietoja.
   Juuren omat lisätiedot (kuittaukset, kiinnitykset, päivä, aika …) kulkevat alkutietojen rivillä "juuri: {json}".
   Tärkein ehto: mdOf(noteOf(p, md)) === md, jotta pelkkä lukeminen ei koskaan kirjoita GitHubiin. Ohje vaultissa: ohjeet/appi.md. */
var VAULT=(function(){
var HIDE=/^(ohjeet|pohjat|yllapito|arkisto|data|liitteet|taulukot|toistuvat|listat)\//;
function visible(p){p=String(p||'');return /\.md$/i.test(p)&&p.indexOf('/')>0&&!HIDE.test(p)&&!/(^|\/)[_.]/.test(p);}
function split(md){md=String(md==null?'':md);var m=/^---\n([\s\S]*?)\n---(\n|$)/.exec(md);if(!m)return {fm:null,body:md};return {fm:m[1].split('\n'),body:md.slice(m[0].length)};}
function fmGet(L,k){if(!L)return '';for(var i=0;i<L.length;i++){var m=/^([A-Za-z0-9_-]+):[ \t]?(.*)$/.exec(L[i]);if(m&&m[1]===k)return m[2].trim();}return '';}
function fmSet(L,k,v){var out=[],done=false;(L||[]).forEach(function(l){var m=/^([A-Za-z0-9_-]+):/.exec(l);if(m&&m[1]===k){if(v!==null&&!done)out.push(k+': '+v);done=true;return;}out.push(l);});
  if(!done&&v!==null)out.push(k+': '+v);return out;}
function pad(n){return n<10?'0'+n:''+n;}
function dayIso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function noon(iso){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(String(iso||''));return m?new Date(+m[1],+m[2]-1,+m[3],12,0,0).toISOString():'';}
var CORE={id:1,text:1,created:1,edited:1,vp:1,vh:1,vpre:1,vpost:1,vfm:1,vnofm:1};
function empty(v){return v===undefined||v===null||v===''||v===false||(Array.isArray(v)&&!v.length)||(typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length);}
function extras(N,c0){var o={};Object.keys(N).filter(function(k){return !CORE[k]&&k.charAt(0)!=='_'&&!empty(N[k]);}).sort().forEach(function(k){o[k]=N[k];});
  if(N.created&&N.created!==c0)o.c=N.created;if(N.edited&&N.edited!==N.created)o.e=N.edited;return Object.keys(o).length?o:null;}
function hash(s){var h=5381;s=String(s);for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36);}
function idOf(p){return 'v'+hash(p);}
function dateOfPath(p){var m=/(\d{4})-(\d\d)-(\d\d)[^/]*\.md$/.exec(String(p||''));return m?m[1]+'-'+m[2]+'-'+m[3]:'';}
function created0(fm,path){return noon(fmGet(fm,'luotu'))||noon(dateOfPath(path))||new Date(2026,0,1,12).toISOString();}
/* Tiedosto -> Juuren muistiinpano */
function noteOf(path,md){var S=split(md),body=S.body,pre=/^\s*/.exec(body)[0],rest=body.slice(pre.length),post=/\s*$/.exec(rest)[0],core=rest.slice(0,rest.length-post.length),vh=/^# /.test(core);
  var N={id:idOf(path),vp:path,vfm:S.fm,vpre:pre,vpost:post,vh:vh,text:vh?core.slice(2):core};if(!S.fm)N.vnofm=true;
  N.created=created0(S.fm,path);N.edited=N.created;
  var j=fmGet(S.fm,'juuri');if(j){try{var o=JSON.parse(j);if('done' in o)N._hd=1;Object.keys(o).forEach(function(k){if(k==='c')N.created=String(o.c);else if(k==='e')N.edited=String(o.e);else if(!CORE[k])N[k]=o[k];});}catch(e){}}
  /* Kaikki 0.34 (Emil 22.11.2026, kohta 17): luettava kuittausrivi `kuitattu: 2026-11-22 16:00, 2026-11-29`. Lukee myös vanhan juuri.pts:n. */
  var kv=fmGet(S.fm,'kuitattu');if(kv){var P=N.pts&&typeof N.pts==='object'?N.pts:{};kv.split(',').map(function(x){return x.trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(?:klo\s+)?(\d{1,2})[.:](\d{2})/,function(a,d,h,mi){return d+' '+(h.length<2?'0'+h:h)+':'+mi;});}).filter(Boolean).forEach(function(k){if(!P[k]){var m=/^(\d{4}-\d{2}-\d{2})(?: (\d{1,2}:\d{2}))?/.exec(k);P[k]=m?m[1]+'T'+(m[2]?(m[2].length<5?'0'+m[2]:m[2]):'12:00')+':00':k;}});if(Object.keys(P).length)N.pts=P;N._kv=1;}
  N._pts0=JSON.stringify(N.pts||null);
  if(!N.edited)N.edited=N.created;return N;}
function kvKeys(kv){return String(kv||'').split(',').map(function(x){return x.trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(?:klo\s+)?(\d{1,2})[.:](\d{2})/,function(a,d,h,mi){return d+' '+(h.length<2?'0'+h:h)+':'+mi;});}).filter(Boolean).sort();}
function titleLine(t){var l=String(t||'').split('\n').filter(function(x){return x.trim();})[0]||'';return l.replace(/^#+\s*/,'').replace(/\s+/g,' ').trim().slice(0,80);}
/* Juuren muistiinpano -> tiedosto. Uusi (ei vfm:ää): Inbox-muistiinpano, jonka alkutiedot appi omistaa. */
function mdOf(N){var fm=N.vfm?N.vfm.slice():null,body=(N.vpre||'')+(N.vh?'# ':'')+(N.text||'')+(N.vpost===undefined?'\n':N.vpost);
  if(!fm&&!N.vnofm)fm=['tyyppi: inbox','otsikko: '+titleLine(N.text),'kuvaus: ','luotu: '+dayIso(new Date(N.created||Date.now())),'lahde: emil'];
  else if(fm&&fmGet(fm,'tyyppi')==='inbox'&&fmGet(fm,'lahde')==='emil'&&fmGet(fm,'otsikko')!==titleLine(N.text))fm=fmSet(fm,'otsikko',titleLine(N.text));
  var x=extras(N,created0(fm,N.vp)),pk=N.pts&&typeof N.pts==='object'?Object.keys(N.pts).sort():[],kvNew=N._kv||JSON.stringify(N.pts||null)!==N._pts0;
  /* Valmis-tila johdetaan myös päättyneestä toistosta ilman kuittausriviä. */
  if(x&&x.done&&(N.vp||(fm&&pk.length))&&!N._hd){
    var legacyDone=false;
    try{legacyDone=Object.prototype.hasOwnProperty.call(JSON.parse(fmGet(fm,'juuri')||'{}'),'done');}catch(e){}
    if(!legacyDone){delete x.done;if(!Object.keys(x).length)x=null;}
  }
  if(fm&&kvNew){if(pk.length){if(x){delete x.pts;if(!Object.keys(x).length)x=null;}var kc=fmGet(fm,'kuitattu'),kn=kvKeys(kc);if(kn.join(', ')!==pk.join(', '))fm=fmSet(fm,'kuitattu',pk.join(', '));}else fm=fmSet(fm,'kuitattu',null);}
  if(!fm){if(!x)return body;fm=[];}
  fm=fmSet(fm,'juuri',x?JSON.stringify(x):null);
  return '---\n'+fm.join('\n')+'\n---\n'+body;}
function slug(s,max){s=String(s||'').toLowerCase().replace(/[äå]/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');s=s.slice(0,max||40).replace(/-+$/,'');return s;}
/* Uuden muistiinpanon polku: inbox/VVVV-KK-PP-HHMM-alku.md, yksilöllinen */
function newPath(N,taken){var d=new Date(N.created||Date.now()),base='inbox/'+dayIso(d)+'-'+pad(d.getHours())+pad(d.getMinutes()),s=slug(titleLine(N.text),32),p=base+(s?'-'+s:'')+'.md',i=2;
  while(taken(p))p=base+(s?'-'+s:'')+'-'+(i++)+'.md';return p;}
/* 0.2: nakyy: ei = tekoälyn työmuistiinpano, ei näy apissa */
/* 0.3 (Emil 22.11.2026): muistiinpanon laji alkutiedoista. lahde emil (tai puuttuu) = oma, emil+… = yhdessä, muu = tekoäly.
   Tekoälylle = ohjeet/-kansio, nakyy: ei tai tyyppi: ohje (luokka voittaa lähteen). Oletuksena piilossa, näkyy suodattimella. */
var KINDS={oma:'Omat',yhdessa:'Yhdessä tehdyt',tekoaly:'Tekoälyn kirjoittamat',ohje:'Tekoälylle'};
var SRCP={std:['oma','yhdessa','tekoaly'],oma:['oma'],emil:['oma','yhdessa'],ai:['tekoaly'],ohje:['ohje'],all:['oma','yhdessa','tekoaly','ohje']};
function srcOf(L){var s=fmGet(L,'lahde').toLowerCase().replace(/\s+/g,'');if(!s||s==='emil'||/^\{\{/.test(s))return 'oma';return /(^|\+)emil(\+|$)/.test(s)?'yhdessa':'tekoaly';}
function kindOf(p,L){if(/^ohjeet\//.test(String(p||''))||fmGet(L,'nakyy').toLowerCase()==='ei'||fmGet(L,'tyyppi').toLowerCase()==='ohje')return 'ohje';return srcOf(L);}
function seen(p){p=String(p||'');return visible(p)||(/^ohjeet\/.+\.md$/i.test(p)&&!/(^|\/)[_.]/.test(p));}
function shown(p,md,pre){if(!seen(p))return false;return (SRCP[pre]||SRCP.std).indexOf(kindOf(p,split(md).fm))>=0;}
/* 0.2: markdown-merkit tekstissä: {s,e,v} v = 256 merkki, 512 otsikkorivi, 1024 lihavoitu, 2048 luettelomerkki */
function mdMarks(t){var out=[],lines=String(t||'').split('\n'),s=0;lines.forEach(function(L){var h=/^(#{1,6} )/.exec(L),li=/^(\s*)([-*+]) /.exec(L),q=/^(\s*>\s?)/.exec(L),b=/\*\*([^*\n]+?)\*\*/g,x;
    if(h){out.push({s:s,e:s+h[1].length,v:256});out.push({s:s+h[1].length,e:s+L.length,v:512});}
    else if(q)out.push({s:s,e:s+q[1].length,v:256|4096});/* 0.2.1/0.3: lainausmerkki > = tekoälyn lisäys; lukunäkymässä pieni ✦ */
    else if(li)out.push({s:s+li[1].length,e:s+li[1].length+2,v:256|2048});
    while((x=b.exec(L))){var a=s+x.index,n=x[1].length;out.push({s:a,e:a+2,v:256});out.push({s:a+2,e:a+2+n,v:1024});out.push({s:a+2+n,e:a+4+n,v:256});}
    s+=L.length+1;});return out;}
/* 0.5: vaultin linkit [[nimi]] ja [[nimi|teksti]] (Emil 22.11.2026). {s,e,slug,alias,ss,se,as,ae} */
function links(t){var out=[],re=/\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g,m;t=String(t||'');while((m=re.exec(t))){var s0=m.index,sl=m[1],al=m[2];
    out.push({s:s0,e:s0+m[0].length,slug:sl.trim(),alias:al?al.trim():'',ss:s0+2,se:s0+2+sl.length,as:al?s0+3+sl.length:-1,ae:al?s0+3+sl.length+al.length:-1});}return out;}
function linkSlug(p){return String(p||'').replace(/^.*\//,'').replace(/\.md$/i,'');}
/* Kortin teksti ilman merkkejä: ## pois, luettelo pisteeksi, ** pois, linkki otsikoksi (title(slug) tai nimi) */
function plainText(t,title){return String(t||'').replace(/\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g,function(x,a,b){return b?b.trim():((title&&title(a.trim()))||a.trim());})
  .split('\n').map(function(L){return L.replace(/^(\s*)#{1,6}\s+/,'$1').replace(/^(\s*)[-*+]\s+/,'$1• ').replace(/^\s*>\s?/,'').replace(/\*\*([^*]+?)\*\*/g,'$1');}).join('\n');}
function mdPlain(l){l=String(l||'').replace(/\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g,function(x,a,b){return (b||a).trim();});return String(l||'').replace(/^\s*>\s?/,'').replace(/^\s*#{1,6}\s+/,'').replace(/^\s*[-*+]\s+/,'').replace(/\*\*([^*]+?)\*\*/g,'$1');}
return {links:links,linkSlug:linkSlug,plainText:plainText,shown:shown,kindOf:kindOf,srcOf:srcOf,KINDS:KINDS,SRCP:SRCP,mdMarks:mdMarks,mdPlain:mdPlain,visible:visible,split:split,fmGet:fmGet,fmSet:fmSet,noteOf:noteOf,mdOf:mdOf,idOf:idOf,slug:slug,newPath:newPath,titleLine:titleLine,extras:extras};
})();
if(typeof module!=='undefined')module.exports.VAULT=VAULT;
/* ---- Kaikki 0.88 (jäsennys A6.1, Emil 24.11.2026): säätimet ----
   Tiedosto pohjat/saatimet.md: jokainen säädin on "## Nimi" -otsikko ja sen alla rivejä "- avain: arvo". Tuntemattomat rivit säilyvät.
   Avaimet: tunnus (a-z, 0-9, -; puuttuva = nimestä), laji (kertanappi), teksti, muuttuja, arvo (puuttuva = kysytään joka kerta),
   kohde, havaintotunniste, aikaleima (kylla/ei), tapa (lisaa/paivita), minne (paiva, oma tai [[tiedostonimi]]),
   aika (nyt, paiva, kysy, kalenteri) ja pikakirjaus (kylla/ei, 0.89).
   Kirjaus on yksi listarivi. Muuttuja kirjoitetaan havaintolohkona (MUUTTUJA.format), jonka aika on lohkossa. Pelkkä teksti saa
   aikaleiman alkuun: päivän muistiinpanossa "klo 12.30 · ", muualla "2026-11-24 klo 12.30 · " (kalenteri ohittaa nämä, noteDates).
   Päivitä-tapa tunnistaa oman rivinsä säätimen tunnuksesta: lohkossa ", ^tunnus))", tekstirivin lopussa " ^tunnus". */
var SAADIN=(function(){
  var KEYS=['tunnus','laji','teksti','muuttuja','arvo','kohde','havaintotunniste','aikaleima','tapa','minne','aika','pikakirjaus'];
  var LAJIT={kertanappi:'Kertanappi'},TAVAT={lisaa:'Lisää uusi rivi',paivita:'Päivitä edellinen'},
    MINNE={paiva:'Päivän muistiinpano',teksti:'Valittu muistiinpano',oma:'Oma muistiinpano'},
    AJAT={nyt:'Nyt (päivä ja kellonaika)',paiva:'Vain päivä',kysy:'Kysy päivä joka kerta',kalenteri:'Kalenterissa valittu päivä'};
  var PIKA='## Pikakirjaukset';
  function slugOf(s){return String(s||'').toLowerCase().replace(/[äå]/g,'a').replace(/ö/g,'o').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40).replace(/-+$/,'');}
  function okId(t){return /^[a-z0-9][a-z0-9-]{0,59}$/.test(String(t||''));}
  function okName(n){n=String(n||'');return !!n.trim()&&n.length<=80&&!/[\r\n]/.test(n);}
  function yes(v,def){v=String(v||'').trim().toLowerCase();return v?v==='kylla'||v==='kyllä'||v==='on'||v==='true':def;}
  function linkOf(v){var m=/^\[\[([^\[\]|#\r\n]+)\]\]$/.exec(String(v||'').trim());return m?m[1].trim():'';}
  /* {eol, lines, items:[{nimi, s, e, raw, rows, muut, …asetukset, virhe}]} */
  function parse(text){
    text=String(text||'');var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',lines=text.split(eol),items=[],cur=null,i=0;
    if(lines[0]==='---'){for(i=1;i<lines.length&&lines[i]!=='---';i++);i++;}
    function close(at){if(cur){cur.e=at;while(cur.e>cur.s+1&&!lines[cur.e-1].trim())cur.e--;cur.raw=lines.slice(cur.s,cur.e).join('\n');cur=null;}}
    for(;i<lines.length;i++){
      var h=/^##\s+(.+?)\s*$/.exec(lines[i]);
      if(h){close(i);cur={nimi:h[1],s:i,e:lines.length,rows:{},muut:[]};items.push(cur);continue;}
      if(/^#\s/.test(lines[i])){close(i);continue;}
      if(!cur)continue;
      var r=/^-\s+([a-z]+)\s*:(.*)$/.exec(lines[i]);
      if(r&&KEYS.indexOf(r[1])>=0&&!(r[1] in cur.rows))cur.rows[r[1]]=r[2].trim();
      else if(lines[i].trim())cur.muut.push(lines[i]);
    }
    close(lines.length);
    var seen={};
    items.forEach(function(it){
      var R=it.rows;
      it.tunnus=R.tunnus||slugOf(it.nimi);
      it.laji=String(R.laji||'kertanappi').toLowerCase();
      it.teksti=R.teksti||'';it.muuttuja=R.muuttuja||'';it.arvo=R.arvo||'';it.kohde=R.kohde||'';
      it.tag=String(R.havaintotunniste||'').replace(/^#/,'').trim();
      it.aikaleima=yes(R.aikaleima,false);
      it.tapa=R.tapa==='paivita'||R.tapa==='päivitä'?'paivita':'lisaa';
      var minne=String(R.minne||'paiva').trim();
      it.linkki=linkOf(minne);it.minne=it.linkki?'teksti':minne==='oma'?'oma':'paiva';
      it.aika=AJAT[R.aika]?R.aika:'nyt';
      it.pikakirjaus=yes(R.pikakirjaus,true);
      it.virhe=!okId(it.tunnus)?'Tunnus puuttuu tai on virheellinen.':seen[it.tunnus]?'Sama tunnus on kahdella säätimellä.':
        !LAJIT[it.laji]?'Lajia '+it.laji+' ei vielä ole.':minne&&!it.linkki&&minne!=='oma'&&minne!=='paiva'?'Kohde '+minne+' ei ole tuttu.':'';
      if(okId(it.tunnus))seen[it.tunnus]=(seen[it.tunnus]||0)+1;
    });
    items.forEach(function(it){if(!it.virhe&&seen[it.tunnus]>1)it.virhe='Sama tunnus on kahdella säätimellä.';});
    return {eol:eol,lines:lines,items:items};
  }
  /* Säätimen rivit tiedostoon. Tuntemattomat rivit (muut) säilyvät lopussa. */
  function lines(it){
    var out=['## '+it.nimi.trim(),'- tunnus: '+it.tunnus,'- laji: '+(it.laji||'kertanappi')];
    if(it.teksti)out.push('- teksti: '+it.teksti);
    if(it.muuttuja){out.push('- muuttuja: '+it.muuttuja);if(it.arvo)out.push('- arvo: '+it.arvo);
      if(it.kohde)out.push('- kohde: '+it.kohde);if(it.tag)out.push('- havaintotunniste: '+it.tag);}
    else if(it.aikaleima)out.push('- aikaleima: kylla');
    out.push('- tapa: '+(it.tapa||'lisaa'),'- minne: '+(it.minne==='teksti'?'[['+it.linkki+']]':it.minne==='oma'?'oma':'paiva'),'- aika: '+(it.aika||'nyt'));
    if(it.pikakirjaus===false)out.push('- pikakirjaus: ei');
    return out.concat(it.muut||[]);
  }
  function check(it){
    if(!okName(it.nimi))return 'Anna säätimelle nimi (enintään 80 merkkiä).';
    if(!okId(it.tunnus))return 'Tunnus saa sisältää pieniä kirjaimia a–z, numeroita ja väliviivoja.';
    if(!it.teksti&&!it.muuttuja&&!it.aikaleima)return 'Valitse, mitä säädin kirjoittaa.';
    if(/[\r\n]/.test(it.teksti+it.muuttuja+it.arvo+it.kohde))return 'Rivinvaihto ei käy säätimen kenttiin.';
    if(it.muuttuja&&!MUUTTUJA.validName(it.muuttuja))return 'Muuttujan nimessä ei voi olla kaksoispistettä.';
    if(it.kohde&&!MUUTTUJA.validName(it.kohde))return 'Kohteen nimessä ei voi olla kaksoispistettä.';
    if(it.tag&&!/^[\p{L}\p{N}-]+$/u.test(it.tag))return 'Havaintotunniste on yksi sana ilman #-merkkiä.';
    if(it.muuttuja&&it.arvo&&!MUUTTUJA.format(it.muuttuja,it.arvo,it.kohde,'',it.tag,''))return 'Tarkista arvo.';
    if(it.minne==='teksti'&&!it.linkki)return 'Valitse muistiinpano, johon säädin kirjoittaa.';
    return '';
  }
  /* Uusi, muutettu (old = tiedostosta luettu) tai poistettu (next null) säädin. Palauttaa tekstin tai {error}. */
  function patch(text,old,next){
    text=String(text||'');
    if(next){var bad=check(next);if(bad)return {error:bad};}
    if(!text.trim()){
      if(old)return {error:'Säädintä ei enää löydy. Avaa säätimet uudelleen.'};
      return ['---','tyyppi: pohja','otsikko: Säätimet','kuvaus: Kaikki-apin napit ja muut säätimet. Muoto: ohjeet/appi.md.','nakyy: ei','lahde: emil','---','# Säätimet','']
        .concat(lines(next),['']).join('\n');
    }
    var doc=parse(text),L=doc.lines.slice(),eol=doc.eol;
    var at=old?doc.items.findIndex(function(it){return it.tunnus===old.tunnus;}):-1;
    if(old&&(at<0||doc.items[at].raw!==old.raw))return {error:'Säädintä muutettiin muualla. Avaa se uudelleen.'};
    if(next&&doc.items.some(function(it,i){return i!==at&&it.tunnus===next.tunnus;}))return {error:'Tunnus '+next.tunnus+' on jo toisella säätimellä.'};
    if(old){
      var cut=doc.items[at];
      if(next)L.splice.apply(L,[cut.s,cut.e-cut.s].concat(lines(next)));
      else{var end=cut.e;while(end<L.length&&!L[end].trim())end++;L.splice(cut.s,end-cut.s);}
    }else{
      while(L.length&&!L[L.length-1].trim())L.pop();
      L.push('');L=L.concat(lines(next));L.push('');
    }
    var out=L.join(eol);
    return out.endsWith(eol)?out:out+eol;
  }
  /* Kirjausrivi. c = {day: 'VVVV-KK-PP', clock: 'HH:MM' tai '', value, dayNote, id}. Palauttaa '' jos arvo ei kelpaa. */
  function record(it,c){
    var block='';
    if(it.muuttuja){
      block=MUUTTUJA.format(it.muuttuja,String(c.value==null?'':c.value).trim(),it.kohde,c.day+(c.clock?' '+c.clock:''),it.tag,
        it.tapa==='paivita'?it.tunnus:c.id||'');
      if(!block)return '';
    }
    var text=String(it.teksti||'').trim(),prefix='';
    if(!block&&it.aikaleima){
      if(!text)text=it.nimi.trim();
      var klo=c.clock?'klo '+c.clock.replace(':','.'):'';
      prefix=c.dayNote?(klo?klo+' · ':''):c.day+(klo?' '+klo:'')+' · ';
    }
    var line='- '+prefix+text+(block?(text?' ':'')+block:'');
    if(!block&&it.tapa==='paivita')line+=' ^'+it.tunnus;
    return line;
  }
  function ownRe(id){return new RegExp('(?:, \\^'+id+'\\)\\)| \\^'+id+'\\s*$)');}
  function own(L,id){for(var i=L.length-1;i>=0;i--)if(ownRe(id).test(L[i]))return i;return -1;}
  /* Kirjoittaa rivin tekstiin. o = {dayNote, template (tyhjälle tiedostolle)}. Palauttaa {text, before (korvattu rivi tai null)}. */
  function write(text,it,line,o){
    text=String(text||'');o=o||{};
    if(!text&&o.template)text=o.template;
    var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',L=text.split(eol);
    if(it.tapa==='paivita'){
      var i=own(L,it.tunnus);
      if(i>=0){var before=L[i];if(before===line)return {text:text,before:before};L[i]=line;return {text:L.join(eol),before:before};}
    }
    if(o.dayNote){
      var s=L.findIndex(function(x){return x.trim()===PIKA;});
      if(s<0){var t=text.replace(/\s*$/,'');return {text:(t?t+eol+eol:'')+PIKA+eol+eol+line+eol,before:null};}
      var e=L.findIndex(function(x,k){return k>s&&/^#{1,2}\s/.test(x);});if(e<0)e=L.length;
      while(e>s+1&&!L[e-1].trim())e--;
      if(e===s+1){L.splice(e,0,'',line);}else L.splice(e,0,line);
      var out=L.join(eol);return {text:L[L.length-1]?out+eol:out,before:null};
    }
    while(L.length&&!L[L.length-1].trim())L.pop();
    if(L.length&&!/^\s*- /.test(L[L.length-1]))L.push('');
    L.push(line);
    return {text:L.join(eol)+eol,before:null};
  }
  /* Kumoa: palauttaa tekstin tai null, jos kirjoitettua riviä ei enää ole. */
  function undo(text,before,after){
    text=String(text||'');var eol=text.indexOf('\r\n')>=0?'\r\n':'\n',L=text.split(eol),i=L.lastIndexOf(after);
    if(i<0)return null;
    if(before===null||before===undefined)L.splice(i,1);else L[i]=before;
    return L.join(eol);
  }
  return {parse:parse,lines:lines,check:check,patch:patch,record:record,write:write,undo:undo,own:own,slug:slugOf,okId:okId,
    LAJIT:LAJIT,TAVAT:TAVAT,MINNE:MINNE,AJAT:AJAT};
})();
if(typeof module!=='undefined')module.exports.SAADIN=SAADIN;
