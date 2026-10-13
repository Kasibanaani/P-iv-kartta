// Versio 13: luku tai palikka. Toimintojen luvut (arvo, arvonnan rajat, todennäköisyys, siirron koordinaatit), ajastimen kesto ja
// toisto sekä sateen ja kohdelistan tahdit voivat olla palikan arvo {r: id}. Vanhat muodot muunnetaan. Palaa takaisin -toiminto.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const T=5000000;E.setNow(T);const at=s=>E.setNow(T+s*1000);
const P=E.newProject('V13');P.screens.push({id:'s2',n:'Peli',nav:false});
const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const vaikeus=add('slider','Vaikeus',{min:1,max:5,start:3});
const lisays=add('calc','Lisäys',{mode:'f',f:'[Vaikeus]*2'});
const pis=add('counter','Pisteet');const noppa=add('counter','Noppa');
const bonus=add('choice','Bonus');const teksti=add('input','Nimi');
const kello=add('timer','Kello',{dir:'down',len:{r:lisays.id},every:{r:vaikeus.id}});
const tik=add('counter','Tikit');kello.eact=[{do:'add',o:tik.id,v:1}];
const ikkuna=add('map','Ikkuna');P.maps=[{id:'k1',n:'M',w:20,h:20,fx:[]}];ikkuna.m='k1';
const sade=add('rain','Sade',{rate:{k:'ref',v:lisays.id},fall:{k:'num',v:5}});
const lista=add('items','Lista',{life:{k:'ref',v:'eiole'}});
const nappi=add('choice','Nappi',{act:[
  {do:'add',o:pis.id,v:{r:lisays.id}},
  {do:'add',o:pis.id,src:'o',from:vaikeus.id},
  {do:'rnd',o:noppa.id,lo:{r:vaikeus.id},hi:{r:vaikeus.id}},
  {do:'add',o:pis.id,v:100,p:{r:bonus.id}},
  {do:'warp',o:ikkuna.id,x:{r:vaikeus.id},y:2.6},
  {do:'set',o:pis.id,v:{r:teksti.id}},
  {do:'set',o:pis.id,v:{r:'eiole'}},
  {do:'back'}]});
eq('repair korjaa',E.repair(P),true);
eq('vanha toisen arvo -muoto → viittaus',nappi.act[1],{do:'add',o:pis.id,v:{r:vaikeus.id}});
eq('tekstikenttä ei kelpaa lukuun, puuttuva viittaus → oletus',[nappi.act[5].v,nappi.act[6].v],[0,0]);
eq('siirron y pyöristyy, x säilyy viittauksena',[nappi.act[4].x,nappi.act[4].y],[{r:vaikeus.id},3]);
eq('sateen vanha muoto muunnettu, kohdelistan puuttuva → oletus',[sade.rate,sade.fall,lista.life],[{r:lisays.id},5,30]);
eq('ajastimen kesto ja toisto viittauksina',[kello.len,kello.every],[{r:lisays.id},{r:vaikeus.id}]);
eq('Palaa takaisin säilyy',nappi.act[7],{do:'back'});
eq('toinen repair ei muuta',E.repair(P),false);
let C=E.compile(P);const val=(st,o)=>E.evaluate(C,st).R.value(o.id);
let st={sel:[],vals:{}};
eq('aikaraja lukee keston palikasta (Vaikeus 3 → 6 s)',val(st,kello),6);
st.vals[vaikeus.id]=5;eq('vaikeus 5 → 10 s',val(st,kello),10);
let out=E.change(C,st,E.metSet(C,st),[0,1,2,3,4,7].map(i=>nappi.act[i]));
eq('lisäys 10 + vaikeus 5, bonus 0 % ei osu',val(st,pis),15);
eq('arvonnan rajat palikasta (5–5)',val(st,noppa),5);
eq('siirto palikan arvoon',st.vals[ikkuna.id],{x:5.5,y:3.5});
eq('Palaa takaisin välittyy',out.back,true);
st.sel=[bonus.id];E.setRnd(()=>0.5);E.change(C,st,E.metSet(C,st),[nappi.act[3]]);eq('bonus valittu = 1 %: arvonta 0,5 ei osu',val(st,pis),15);
E.setRnd(()=>0.001);E.change(C,st,E.metSet(C,st),[nappi.act[3]]);eq('arvonta 0,1 % < 1 %: osuu',val(st,pis),115);E.setRnd(null);
// ajastin: kesto ja toisto palikasta tikityksessä ja pysäytyksessä (vaikeus 3 → kesto 6 s, toisto 3 s)
st={sel:[],vals:{[vaikeus.id]:3}};E.change(C,st,E.metSet(C,st),[{do:'tstart',o:kello.id}]);
at(3.5);let r=E.timerTick(C,st);eq('toisto joka 3 s: yksi tikki 3,5 s:ssa',r.acts.length,1);E.change(C,st,E.metSet(C,st),r.acts);
at(5);E.change(C,st,E.metSet(C,st),[{do:'tstop',o:kello.id}]);eq('pysäytetty 5 s:ssa',st.vals[kello.id].a,5);
E.change(C,st,E.metSet(C,st),[{do:'tstart',o:kello.id}]);at(7);r=E.timerTick(C,st);eq('kesto 6 s täyttyy: aika loppui, ei uutta tikkiä',[st.vals[kello.id].d,val(st,kello),r.acts.length],[1,0,0]);
E.change(C,st,E.metSet(C,st),[{do:'tstart',o:kello.id}]);at(100);E.change(C,st,E.metSet(C,st),[{do:'tstop',o:kello.id}]);eq('pysäytys rajaa kestoon (6 s)',st.vals[kello.id].a,6);
// viittaukset näkyvät
eq('usedBy: Vaikeus löytyy toiminnoista, ajastimesta ja laskusta',E.usedBy(P,vaikeus.id).map(id=>P.objs.find(o=>o.id===id).n).sort(),['Kello','Lisäys','Nappi']);
eq('usedBy: Lisäys löytyy ajastimesta, sateesta ja toiminnosta',E.usedBy(P,lisays.id).map(id=>P.objs.find(o=>o.id===id).n).sort(),['Kello','Nappi','Sade']);
// tarkkuus ×2 ei koske viittauksiin
E.mapScale(P,P.maps[0],2);eq('tarkkuus ×2: viittaus säilyy, luku skaalautuu',[nappi.act[4].x,nappi.act[4].y],[{r:vaikeus.id},7]);
// poisto: viittaukset siivoutuvat oletukseen
E.dropObj(P,lisays.id);eq('poistettu palikka → oletukset',[kello.len,sade.rate,nappi.act[0].v],[0,2.5,1]);
E.setNow(null);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
