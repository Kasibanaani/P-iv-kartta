// Versio 16: Ketjut-kanvaasi. Palikat, sanat (JA, TAI, EI, vähintään), ikkunat (sulut), laskut ja vertailut, arvot, JOS (niin/muuten),
// KUN (tapahtuma + ehdot), toiminnot nuolten päässä, nimetty tulos (Ehto-palikka), palikan tapahtumat nuolina, ajastimen tapahtuma, kehä ja siivous.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V16');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const A=add('choice','A'),B=add('choice','B'),Cc=add('choice','C');
const saa=add('slider','Säädin',{min:0,max:10,start:5});const pis=add('counter','Pisteet');const ansa=add('trig','Ansa');const astu=add('choice','Astu',{beh:'hold',act:[{do:'fire',o:ansa.id}]});
const louk=add('counter','Loukussa');const tulos=add('cond','Tulos');const laske=add('choice','Laske',{beh:'hold'});const tl=add('counter','Tulosluku');
const kello=add('timer','Kello',{dir:'down',len:3});const aika=add('counter','Aika');const ceet=add('counter','Ceet');const teksti=add('input','Vastaus');
let q=0;const N=(k,x)=>{q++;return Object.assign({id:'n'+q,k:k,x:q*10,y:0,g:''},x||{});},L=(f,fp,t,tp)=>{q++;return {id:'l'+q,f:f,fp:fp,t:t,tp:tp};};
const w1=N('w',{m:'or',w:300,h:200}),na=N('p',{o:A.id,g:w1.id}),nb=N('p',{o:B.id,g:w1.id}),nc=N('p',{o:Cc.id,g:w1.id}),nt=N('p',{o:tulos.id});
const w2=N('w',{m:'and',w:260,h:150}),ns=N('p',{o:saa.id,g:w2.id}),n3=N('c',{v:3,g:w2.id}),nle=N('op',{op:'le',g:w2.id});
const nt2=N('p',{o:tulos.id}),gja=N('g',{m:'and'}),jos=N('jos'),aplus=N('a',{a:{do:'add',o:pis.id,v:1}}),amsg=N('a',{a:{do:'msg',t:'Ei enää'}});
const nansa=N('p',{o:ansa.id}),ns2=N('p',{o:saa.id}),nne=N('op',{op:'ne',b:7}),kun=N('kun'),aloukku=N('a',{a:{do:'add',o:louk.id,v:1}});
const nlaske=N('p',{o:laske.id}),np=N('p',{o:pis.id}),nadd=N('op',{op:'add',b:10}),aset=N('a',{a:{do:'set',o:tl.id,v:0}});
const nkello=N('p',{o:kello.id}),aaika=N('a',{a:{do:'add',o:aika.id,v:1}}),nc2=N('p',{o:Cc.id}),aceet=N('a',{a:{do:'add',o:ceet.id,v:1}});
const nv=N('p',{o:teksti.id}),nkis=N('c',{v:'kissa'}),neq=N('op',{op:'eq'});
P.kv={n:[w1,na,nb,nc,nt,w2,ns,n3,nle,nt2,gja,jos,aplus,amsg,nansa,ns2,nne,kun,aloukku,nlaske,np,nadd,aset,nkello,aaika,nc2,aceet,nv,nkis,neq],l:[
  L(w1.id,'v',nt.id,'c'),                                   // TAI-ikkuna → Tulos
  L(ns.id,'v',nle.id,'a'),L(n3.id,'v',nle.id,'b'),          // ikkunassa Säädin ≤ 3
  L(nt2.id,'v',gja.id,'in'),L(w2.id,'v',gja.id,'in'),L(gja.id,'v',jos.id,'c'),L(jos.id,'e',aplus.id,'e'),L(jos.id,'m',amsg.id,'e'),
  L(nansa.id,'act',kun.id,'e'),L(ns2.id,'v',nne.id,'a'),L(nne.id,'v',kun.id,'c'),L(kun.id,'e',aloukku.id,'e'),
  L(nlaske.id,'act',aset.id,'e'),L(np.id,'v',nadd.id,'a'),L(nadd.id,'v',aset.id,'v'),
  L(nkello.id,'act',aaika.id,'e'),L(nc2.id,'v',aceet.id,'e'),
  L(nv.id,'v',neq.id,'a'),L(nkis.id,'v',neq.id,'b')],seq:q};
const json0=JSON.stringify(P.kv);E.repair(P);eq('repair: kelvollinen kanvaasi säilyy',JSON.stringify(P.kv),json0);
let C=E.compile(P);const R=st=>E.evaluate(C,st).R;let st={sel:[],vals:{}};
const step=(acts,hold)=>E.change(C,st,E.metSet(C,st,hold),acts,hold);
eq('alussa: ikkunat, tulos ja JOS eivät ole totta',[R(st).kv(w1.id),R(st).kv(w2.id),R(st).met(tulos.id),R(st).kv(jos.id)],[0,0,false,0]);
eq('ikkunan tulos: Säädin ja 3 menevät vertailuun, vain vertailu lasketaan',[R(st).kv(nle.id),R(st).kv(ns.id),R(st).kv(n3.id)],[0,5,3]);
st.sel=[B.id];eq('B valittu: TAI-ikkuna totta, Tulos täyttyy (myös arvioinnissa)',[R(st).kv(w1.id),R(st).met(tulos.id),E.evaluate(C,st).st[tulos.id].met,R(st).kv(nt2.id)],[1,true,true,1]);
let out=step([{do:'set',o:saa.id,v:2}]);eq('säädin 2: JA totta → JOS alkaa päteä → NIIN Pisteet +1',[R(st).kv(w2.id),R(st).kv(jos.id),R(st).value(pis.id)],[1,1,1]);
out=step([{do:'set',o:saa.id,v:3}]);eq('säädin 3: yhä totta, ei uutta laukeamista',R(st).value(pis.id),1);
out=step([{do:'set',o:saa.id,v:6}]);eq('säädin 6: JOS lakkaa → MUUTEN näyttää viestin',[R(st).kv(jos.id),out.msg],[0,'Ei enää']);
out=step([{do:'unselect',o:B.id}]);out=step([{do:'set',o:saa.id,v:1}]);eq('B pois: säädin 1 ei riitä yksin',[R(st).kv(jos.id),R(st).value(pis.id)],[0,1]);
// KUN: tapahtuma menee läpi vain, kun ehdot pätevät
eq('Ansan tapahtumassa on kanvaasin nuoli',E.evActs(C,ansa,'act'),[{do:'kv',o:ansa.id,f:'act'}]);
step(E.evActs(C,astu,'act'));eq('KUN Ansa laukeaa, säädin 1 ≠ 7 → Loukussa +1',R(st).value(louk.id),1);
step([{do:'set',o:saa.id,v:7}]);step(E.evActs(C,astu,'act'));eq('säädin 7: Ansa laukeaa, mutta KUN ei päästä läpi',[R(st).value(louk.id),R(st).value(ansa.id)],[1,1]);
step([{do:'set',o:saa.id,v:4}]);step(E.evActs(C,astu,'act'));eq('säädin 4: taas loukkuun',R(st).value(louk.id),2);
// lasku nuolen päässä toiminnon arvona
st.vals[pis.id]=5;step(E.evActs(C,laske,'act'));eq('Laske: Tulosluku = Pisteet + 10',[R(st).kv(nadd.id),R(st).value(tl.id)],[15,15]);
// arvo, joka alkaa olla totta, laukaisee toiminnon
step([{do:'select',o:Cc.id}]);step([{do:'unselect',o:Cc.id}]);step([{do:'select',o:Cc.id}]);eq('C valitaan kahdesti: Ceet +1 kummallakin kerralla',R(st).value(ceet.id),2);
// ajastimen tapahtuma
E.setNow(1000);step([{do:'tstart',o:kello.id}]);E.setNow(4500);const tk=E.timerTick(C,st);eq('ajastimen aika loppuu: tapahtuma kulkee nuolta pitkin',tk.acts,[{do:'kv',o:kello.id,f:'act'}]);
step(tk.acts);eq('Aika +1',R(st).value(aika.id),1);E.setNow(null);
// vertailu tekstiin, sanat
st.vals[teksti.id]='Kissa';eq('teksti = ”kissa” (kirjainkoko ei haittaa)',R(st).kv(neq.id),1);
const P2=JSON.parse(JSON.stringify(P));const g=P2.kv.n.find(n=>n.id===gja.id);const C2=()=>E.compile(P2);
const val=(m,n)=>{g.m=m;if(n)g.n=n;else delete g.n;return E.run(C2(),[B.id],{[saa.id]:9}).kv(g.id);};
eq('sanat: JA, TAI, vähintään 1, vähintään 2, EI (Tulos totta, ikkuna ei)',[val('and'),val('or'),val('min',1),val('min',2),val('not')],[0,1,1,0,0]);
const val3=(m,n,sel)=>{const P3=JSON.parse(JSON.stringify(P));const w=P3.kv.n.find(x=>x.id===w1.id);w.m=m;if(n!==undefined)w.n=n;return E.run(E.compile(P3),sel,{}).kv(w.id);};
eq('ikkunat: VAIN YKSI (A / A+B), ENINTÄÄN 1 (A+B / A), TÄSMÄLLEEN 2 (A+B / A+B+C)',[val3('one',undefined,[A.id]),val3('one',undefined,[A.id,B.id]),val3('max',1,[A.id,B.id]),val3('max',1,[A.id]),val3('eq',2,[A.id,B.id]),val3('eq',2,[A.id,B.id,Cc.id])],[1,0,0,1,1,0]);
// JOS- ja KUN-ikkunat
{const P4=E.newProject('V16b');const ad=(t,n,x)=>{const o=E.newObj(P4,t,'s1',n);Object.assign(o,x||{});P4.objs.push(o);return o;};
 const a=ad('choice','A'),b=ad('choice','B'),hit=ad('choice','Osu',{beh:'hold'}),on=ad('counter','Niin'),mu=ad('counter','Muuten'),ku=ad('counter','Kun');
 P4.kv={n:[{id:'n1',k:'w',x:0,y:0,g:'',m:'one',j:'jos',w:300,h:200},{id:'n2',k:'p',x:10,y:60,g:'n1',o:a.id},{id:'n3',k:'p',x:10,y:100,g:'n1',o:b.id},
   {id:'n4',k:'a',x:400,y:0,g:'',a:{do:'add',o:on.id,v:1}},{id:'n5',k:'a',x:400,y:80,g:'',a:{do:'add',o:mu.id,v:1}},
   {id:'n6',k:'w',x:0,y:300,g:'',m:'and',j:'kun',w:300,h:150},{id:'n7',k:'p',x:10,y:360,g:'n6',o:a.id},{id:'n8',k:'p',x:-300,y:300,g:'',o:hit.id},{id:'n9',k:'a',x:400,y:300,g:'',a:{do:'add',o:ku.id,v:1}}],
  l:[{id:'l10',f:'n1',fp:'e',t:'n4',tp:'e'},{id:'l11',f:'n1',fp:'m',t:'n5',tp:'e'},{id:'l12',f:'n8',fp:'act',t:'n6',tp:'e'},{id:'l13',f:'n6',fp:'e',t:'n9',tp:'e'}],seq:13};
 const j0=JSON.stringify(P4.kv);E.repair(P4);eq('JOS- ja KUN-ikkuna kelpaavat sellaisenaan',JSON.stringify(P4.kv),j0);
 const C4=E.compile(P4),s4={sel:[],vals:{}},R4=()=>E.evaluate(C4,s4).R,st4=(acts)=>E.change(C4,s4,E.metSet(C4,s4),acts);
 st4([{do:'select',o:a.id}]);eq('JOS VAIN YKSI: A → NIIN',[R4().value(on.id),R4().value(mu.id)],[1,0]);
 st4([{do:'select',o:b.id}]);eq('A ja B: ei enää vain yksi → MUUTEN',[R4().value(on.id),R4().value(mu.id)],[1,1]);
 st4(E.evActs(C4,hit,'act'));eq('KUN-ikkuna: Osu, A valittu → läpi',R4().value(ku.id),1);
 st4([{do:'unselect',o:a.id}]);st4(E.evActs(C4,hit,'act'));eq('KUN-ikkuna: Osu ilman A:ta → ei läpi',R4().value(ku.id),1);}
// kehä ei kaada: Tulos-palikka myös omassa ikkunassaan
const nt3=N('p',{o:tulos.id,g:w1.id});P.kv.n.push(nt3);E.repair(P);C=E.compile(P);st.sel=[];
const rk=R(st);eq('kehä merkitään eikä kaada',[rk.met(tulos.id),Object.keys(rk.kcyc).length>0],[false,true]);
// siivous
P.kv.l.push(L(nansa.id,'act',nle.id,'a'),L(nt.id,'v','n999','in'),L(n3.id,'v',nle.id,'a'),{id:'x',f:na.id,fp:'v',t:gja.id,tp:'in'});
P.kv.n.push(N('p',{o:'o999'}),N('zz'),N('a',{a:{do:'set',o:A.id,v:1,huu:1}}));w2.g=w1.id;w1.g=w2.id;
E.repair(P);const ids=P.kv.l.map(l=>l.id);
eq('siivous: tapahtuma ei käy lukupaikkaan, puuttuva kohde ja kelvoton tunniste pois',[P.kv.l.some(l=>l.t==='n999'||l.id==='x'),P.kv.l.some(l=>l.f===nansa.id&&l.t===nle.id),ids.length===new Set(ids).size],[false,false,true]);
eq('siivous: yhden nuolen paikkaan jää uusin',P.kv.l.filter(l=>l.t===nle.id&&l.tp==='a').map(l=>l.f),[n3.id]);
const lastA=P.kv.n[P.kv.n.length-1];eq('siivous: tuntematon palikka ja laji pois, toiminnon väärä kohde ja ylimääräinen kenttä pois',[P.kv.n.some(n=>n.o==='o999'||n.k==='zz'),lastA.a],[false,{do:'set',v:1}]);
eq('siivous: ikkunat eivät voi olla sisäkkäin kehänä',[w1.g===w2.id&&w2.g===w1.id],[false]);
E.dropObj(P,saa.id);eq('palikan poisto vie sen solmut ja nuolet',[P.kv.n.some(n=>n.o===saa.id),P.kv.l.some(l=>l.f===ns.id||l.f===ns2.id)],[false,false]);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
