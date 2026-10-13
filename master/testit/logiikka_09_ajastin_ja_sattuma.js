// Versio 12: ajastin (sekuntikello ja aikaraja, toistuva tapahtuma, aika loppuu, aikasakko), sattuma (arvo, valitse satunnaisesti,
// todennäköisyys), ennätys, arvo toisesta tekijästä, tyhjänä alkava laskuri ja ruudun piilotus alapalkista.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
let T=1000000;E.setNow(T);const at=s=>E.setNow(T+s*1000);
const P=E.newProject('V12');P.screens.push({id:'s2',n:'Peli',nav:false},{id:'s3',n:'Tulokset',nav:true});
const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const kello=add('timer','Kello');
const raja=add('timer','Raja',{dir:'down',len:30,every:10});
const pis=add('counter','Pisteet');const tik=add('counter','Tikit');
raja.eact=[{do:'add',o:tik.id,v:1}];raja.act=[{do:'msg',t:'Aika loppui'}];
const ennatys=add('counter','Ennätys',{start:'',keep:true});
const paras=add('counter','Paras',{start:'',keep:true});
const loki=add('log','Ajat');
const kaynnissa=add('cond','Käynnissä',{req:[{o:raja.id,op:'run'}]});
const loppui=add('cond','Loppui',{req:[{o:raja.id,op:'end'}]});loppui.act=[{do:'add',o:pis.id,v:100}];
const tahti=add('calc','Tahti',{mode:'f',f:'RAJAA(8-[Kello]/10;3;8)'});
const noppa=add('counter','Noppa');const sl=add('slider','Säädin',{min:0,max:10});
const a=add('choice','A'),b=add('choice','B'),c=add('choice','C');
const rikki={do:'best',o:ennatys.id,from:'eiole',dir:'max'};
const nappi=add('choice','Nappi',{act:[{do:'tstart',o:kello.id},{do:'add',o:pis.id,v:1,p:250},{do:'pick',l:[a.id,'x',b.id,b.id,pis.id]},rikki,{do:'rnd',o:noppa.id,lo:'2',hi:'x'}]});
eq('repair korjaa',E.repair(P),true);
eq('väärä ennätys poistui, todennäköisyys 250 pois',nappi.act.map(x=>x.do+(x.p!==undefined?':'+x.p:'')),['tstart','add','pick','rnd']);
eq('valitse satunnaisesti: vain valinnat kerran',nappi.act[2].l,[a.id,b.id]);
eq('arvonnan rajat luvuiksi',[nappi.act[3].lo,nappi.act[3].hi],[2,6]);
eq('piilotettu ruutu säilyy, turha nav pois',P.screens.map(s=>s.nav),[undefined,false,undefined]);
eq('ajastimen oletuskentät',[kello.dir,kello.len,kello.every,kello.show,kello.dec],['up',0,0,'number',1]);
let C=E.compile(P);
const val=(st,o)=>E.evaluate(C,st).R.value(o.id);
let st={sel:[],vals:{}};
eq('pysähdyksissä: arvo 0 ja aikaraja täynnä',[val(st,kello),val(st,raja)],[0,30]);
eq('tyhjänä alkava laskuri on tyhjä',val(st,ennatys),null);
eq('ehto käy ei täyty',E.evaluate(C,st).R.on(kaynnissa.id),false);
// käynnistys toiminnolla ja ajan kulku
let before=E.metSet(C,st);E.change(C,st,before,[{do:'tstart',o:raja.id},{do:'tstart',o:kello.id}]);
eq('käynnistyi: käy-ehto täyttyy',E.evaluate(C,st).R.on(kaynnissa.id),true);
at(12.5);
eq('12,5 s: kello ja aikaraja',[val(st,kello),val(st,raja)],[12.5,17.5]);
eq('laskettu arvo lukee kelloa',val(st,tahti),6.75);
let r=E.timerTick(C,st);
eq('tikitys: yksi toistuva tapahtuma',r.acts.map(x=>x.do),['add']);
E.change(C,st,E.metSet(C,st),r.acts);
eq('tikit 1',val(st,tik),1);
eq('sama hetki uudelleen: ei uutta',E.timerTick(C,st).acts.length,0);
// pysäytys ja jatko
E.change(C,st,E.metSet(C,st),[{do:'tstop',o:kello.id}]);at(20);
eq('pysäytetty kello ei kulje',val(st,kello),12.5);
eq('ehto pysähdyksissä',E.evaluate(C,st).R.holds({o:kello.id,op:'stop'}),true);
E.change(C,st,E.metSet(C,st),[{do:'tstart',o:kello.id}]);at(22);
eq('jatkuu siitä mihin jäi',val(st,kello),14.5);
// aikasakko ja lisäaika
E.change(C,st,E.metSet(C,st),[{do:'add',o:kello.id,v:5},{do:'add',o:raja.id,v:3}]);
eq('sakko sekuntikelloon +5, aikarajaan lisäaika +3',[val(st,kello),val(st,raja)],[19.5,11]);
// toistuvat tapahtumat taustalta palatessa: enintään viisi kerrallaan
at(29);r=E.timerTick(C,st);eq('20 s ylitetty: yksi tapahtuma lisää',r.acts.length,1);E.change(C,st,E.metSet(C,st),r.acts);
// aika loppuu: toiminto, päättynyt-ehto ja sen toiminto
at(40);r=E.timerTick(C,st);
eq('aika loppui: loppu ilman tikkiä samalla hetkellä (tikit 10 s ja 20 s)',r.acts.map(x=>x.do),['msg']);
let out=E.change(C,st,before=E.metSet(C,{sel:[],vals:Object.assign({},st.vals,{[raja.id]:{r:1,t:T,a:0,k:2,d:0}})}),r.acts);
eq('viesti ja Loppui-ehdon toiminto',[out.msg,val(st,pis)],['Aika loppui',100]);
eq('aikaraja 0 ja pysähtyi',[val(st,raja),E.evaluate(C,st).R.holds({o:raja.id,op:'end'}),E.evaluate(C,st).R.holds({o:raja.id,op:'run'})],[0,true,false]);
eq('päättynyt ei tikitä enää',E.timerTick(C,st).acts.length,0);
// uusi kierros: käynnistys päättyneestä alkaa alusta
E.change(C,st,E.metSet(C,st),[{do:'tstart',o:raja.id}]);eq('uusi kierros alusta',val(st,raja),30);
// ennätys ja arvo toisesta tekijästä
E.change(C,st,E.metSet(C,st),[{do:'tstop',o:kello.id},{do:'best',o:ennatys.id,from:kello.id,dir:'min'},{do:'best',o:paras.id,from:pis.id,dir:'max'},{do:'log',o:loki.id,src:'o',from:kello.id}]);
const k1=val(st,kello);eq('ennätys = kellon aika, paras = pisteet, aika kirjattu',[val(st,ennatys),val(st,paras),E.logList(st.vals[loki.id]).map(x=>x.v)],[k1,100,[k1]]);
E.change(C,st,E.metSet(C,st),[{do:'clear',o:kello.id},{do:'tstart',o:kello.id}]);at(43);
E.change(C,st,E.metSet(C,st),[{do:'tstop',o:kello.id},{do:'best',o:ennatys.id,from:kello.id,dir:'min'}]);
eq('nopeampi aika (3 s) korvaa ennätyksen',val(st,ennatys),3);
E.change(C,st,E.metSet(C,st),[{do:'add',o:pis.id,v:-50},{do:'best',o:paras.id,from:pis.id,dir:'max'}]);
eq('huonompi tulos ei korvaa',val(st,paras),100);
E.change(C,st,E.metSet(C,st),[{do:'set',o:sl.id,src:'o',from:pis.id},{do:'add',o:noppa.id,src:'o',from:tik.id}]);
eq('aseta ja lisää toisen arvosta (säädin rajautuu)',[val(st,sl),val(st,noppa)],[10,2]);
E.change(C,st,E.metSet(C,st),[{do:'reset'}]);
eq('Alusta: ennätykset säilyvät, kello nollautuu',[val(st,ennatys),val(st,paras),val(st,kello)],[3,100,0]);
// sattuma
let seq=[0,0.5,0.99,0.2];E.setRnd(()=>seq.shift());
st={sel:[],vals:{}};
E.change(C,st,E.metSet(C,st),[{do:'rnd',o:noppa.id,lo:1,hi:6},{do:'rnd',o:noppa.id,lo:6,hi:1},{do:'pick',l:[a.id,b.id,c.id]},{do:'add',o:pis.id,v:1,p:30}]);
eq('arvonta 1..6 (0 → 1, 0,5 → 4), valitse satunnaisesti C, todennäköisyys 30 % osui',[val(st,noppa),st.sel,val(st,pis)],[4,[c.id],1]);
E.setRnd(()=>0.31);E.change(C,st,E.metSet(C,st),[{do:'add',o:pis.id,v:1,p:30}]);eq('todennäköisyys 30 %: 0,31 ei osu',val(st,pis),1);
E.setRnd(()=>0.9);E.change(C,st,E.metSet(C,st),[{do:'rnd',o:sl.id,lo:0,hi:10}]);eq('säädin arvotaan',val(st,sl),9);
E.setRnd(null);
// viittaukset ja säännöt
eq('ehtolause käy / päättynyt tekstinä',[E.clauseText(C,{o:raja.id,op:'run'}),E.clauseText(C,{o:raja.id,op:'end'}),E.clauseText(C,{o:raja.id,op:'on'})],['Raja käy','Raja on päättynyt','Raja täyttyy (käy)']);
eq('ajastimeen voi viitata, sateeseen ei',[E.refable(P,null).some(o=>o.id===raja.id),E.opsFor({t:'rain'}).length],[true,0]);
eq('usedBy: kello löytyy toiminnoista ja kaavasta',E.usedBy(P,kello.id).map(id=>P.objs.find(o=>o.id===id).n).sort(),['Nappi','Tahti']);
// tilan siivous: ajastimen tila kelpaa
st={sel:[],vals:{[raja.id]:{r:1,t:T,a:0,k:0,d:0},[kello.id]:5}};P.state=st;E.repair(P);eq('ajastimen tila säilyy, väärä muoto pois',Object.keys(P.state.vals),[raja.id]);
// vanhat projektit eivät muutu
const V=E.newProject('vanha');const vo=E.newObj(V,'choice','s1','x');V.objs.push(vo);E.repair(V);eq('vanha projekti ei muutu',E.repair(V),false);
E.setNow(null);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
