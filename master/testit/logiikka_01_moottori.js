// Masterin moottori: kaavat, ehdot, poissulku, pullonkaula, laskut, kehät, nimen vaihto, seuranta ja Päätöskartan tuonti.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function ev(src,vars){const a=E.parse(src);return E.evalAst(a,n=>vars[n]===undefined?null:vars[n]);}
eq('summa',ev('SUMMA([A];[B])',{A:2,B:3}),5);
eq('keskiarvo ohittaa tyhjän',ev('KESKIARVO([A];[B];[C])',{A:2,B:4,C:null}),3);
eq('desimaalipilkku ja laskujärjestys',ev('1,5+2*3',{}),7.5);
eq('pilkku erottimena',ev('SUMMA([A],[B])',{A:1,B:1}),2);
eq('jos ja vertailu',ev('JOS([A]<4;"matala";"korkea")',{A:3}),'matala');
eq('sisäkkäinen jos',ev('JOS([A]<4;"matala";JOS([A]<7;"keski";"korkea"))',{A:8}),'korkea');
eq('nollalla jako tyhjä',ev('[A]/0',{A:1}),null);
eq('pyöristys',ev('PYÖRISTÄ(10/3;1)',{}),3.3);
eq('englanninkieliset',ev('ROUND(AVERAGE(1;2);0)+MAX(1;5)',{}),7);
eq('lukumäärä',ev('LUKUMÄÄRÄ([A];[B];[C])',{A:1,B:0,C:1}),2);
eq('rajaa ja negatiivinen',ev('RAJAA(-[A];0;10)',{A:5}),0);
eq('teksti yhdistyy',ev('"Vire "&[A]',{A:6.5}),'Vire 6,5');
eq('viittaukset',E.refs(E.parse('SUMMA([Energia];[Mieli ala])*[Energia]')),['Energia','Mieli ala']);
for(const bad of ['SUMMA(1;','[A','FOO(1)','1 2','Energia+1']){let m='';try{E.parse(bad);}catch(e){m=e.message;}console.log('   virheviesti',JSON.stringify(bad),'->',m);if(!m)ok=false;}
eq('muotoilu',[E.fmt(3.14159),E.fmt(3.14159,1),E.fmt(null),E.fmt(5),E.fmt(-0.001,1)],['3,14','3,1','–','5','0,0']);

// projekti
const P=E.newProject('Testi');const s=P.screens[0].id;
const add=(t,n,x)=>{const o=E.newObj(P,t,s,n);if(x&&x.f!==undefined)o.mode='f';Object.assign(o,x||{});P.objs.push(o);return o;};
const en=add('slider','Energia',{start:5}),mi=add('slider','Mieliala',{start:5});
const vire=add('calc','Vire',{f:'KESKIARVO([Energia];[Mieliala])',show:'bar'});
const mat=add('cond','Matala vire',{req:[{o:vire.id,op:'lt',v:4}]});
const liik=add('choice','Liikuin'),kav=add('choice','Kävely',{req:[{o:mat.id,op:'on'}]}),soi=add('choice','Soitto',{req:[{o:mat.id,op:'on'}],hl:[{o:liik.id,op:'off'}]});
E.setEx(P,kav.id,soi.id,true);
const txt=add('text','Pieni askel',{body:'Vireesi on {Vire}. {Tuntematon}',req:[{o:mat.id,op:'on'}]});
const hyv=add('calc','Hyvät',{f:'LUKUMÄÄRÄ([Liikuin];[Kävely];[Soitto])',show:'number'});
E.repair(P);
let C=E.compile(P),R=E.evaluate(C,{sel:[],vals:{}});
eq('alussa vire 5, ehto ei täyty, kävely lukittu',[R.R.value(vire.id),R.st[mat.id].met,R.st[kav.id].s,R.st[txt.id].s],[5,false,'lock','hide']);
eq('puuttuu-teksti',E.needText(C,R.st[kav.id].need),'Matala vire täyttyy');
R=E.evaluate(C,{sel:[],vals:{[en.id]:2,[mi.id]:3}});
eq('matala vire: tekstit ja valinnat näkyviin, suositus kun ei liikuttu',[R.R.value(vire.id),R.st[mat.id].met,R.st[kav.id].s,R.st[soi.id].s,R.st[soi.id].hl,R.st[txt.id].s],[2.5,true,'open','open',true,'show']);
eq('teksti täyttyy arvoilla',E.fill(C,R.R,P.objs.find(o=>o.id===txt.id).body),'Vireesi on 2,5. {Tuntematon}');
R=E.evaluate(C,{sel:[kav.id,soi.id],vals:{[en.id]:2,[mi.id]:3}});
eq('poissulku: uusin voittaa',[R.sel,R.st[kav.id].s],[[soi.id],'excl']);
R=E.evaluate(C,{sel:[liik.id,soi.id],vals:{[en.id]:9,[mi.id]:9}});
eq('kun vire nousee, soitto putoaa pois valinnoista',[R.sel,R.removed.map(x=>x.why)],[[liik.id],['lost']]);
eq('lukumäärä',R.R.value(hyv.id),1);
// piilossa oleva säädin on tyhjä
const sl2=add('slider','Ahdistus',{req:[{o:mat.id,op:'on'}],start:7});const tot=add('calc','Yhteensä',{f:'SUMMA([Ahdistus];[Energia])'});E.repair(P);C=E.compile(P);
R=E.evaluate(C,{sel:[],vals:{[en.id]:9,[mi.id]:9}});eq('piilossa oleva säädin ei ole mukana',[R.R.value(sl2.id),R.R.value(tot.id)],[null,9]);
R=E.evaluate(C,{sel:[],vals:{[en.id]:1,[mi.id]:1}});eq('näkyvä säädin on mukana',[R.R.value(sl2.id),R.R.value(tot.id)],[7,8]);
// kehä
const k1=add('calc','K1',{f:'[K2]+1'}),k2=add('calc','K2',{f:'[K1]+1'});E.repair(P);C=E.compile(P);R=E.evaluate(C,{});
eq('kehä havaitaan',Object.keys(R.err).filter(k=>/Kehä/.test(R.err[k])).sort(),[k1.id,k2.id].sort());
const bad=add('calc','Rikki',{f:'[Olematon]+1'});E.repair(P);C=E.compile(P);R=E.evaluate(C,{});eq('tuntematon nimi',R.err[bad.id],'Tuntematon nimi: [Olematon].');
// nimen vaihto päivittää viittaukset
E.rename(P,vire.id,'Vireys');eq('nimen vaihto',[P.objs.find(o=>o.id===txt.id).body,P.objs.find(o=>o.id===vire.id).n],['Vireesi on {Vireys}. {Tuntematon}','Vireys']);
E.rename(P,en.id,'mieliala');eq('nimi ei voi olla sama kuin toisella',P.objs.find(o=>o.id===en.id).n,'mieliala 2');
// pullonkaula
const Q=E.newProject('PK');const qs=Q.screens[0].id;const qa=(t,n,x)=>{const o=E.newObj(Q,t,qs,n);Object.assign(o,x||{});Q.objs.push(o);return o;};
const a=qa('choice','A',{b:true}),b=qa('choice','B'),t2=qa('text','T');Q.screens.push({id:'s2',n:'Toinen'});const c2=E.newObj(Q,'choice','s2','C');Q.objs.push(c2);E.repair(Q);
let QC=E.compile(Q),QR=E.evaluate(QC,{});eq('pullonkaula: vain samassa ruudussa',[QR.st[b.id].s,QR.st[t2.id].s,QR.st[c2.id].s],['lock','hide','open']);
QR=E.evaluate(QC,{sel:[a.id]});eq('pullonkaula valittu',[QR.st[b.id].s,QR.st[t2.id].s],['open','show']);
// lajin vaihto
E.setType(Q,a.id,'text');eq('valinta tekstiksi: pullonkaula pois',[Q.objs[0].t,Q.objs[0].b],['text',undefined]);
// satunnainen
let r=E.randomState(QC,()=>0.5);console.log('   satunnainen tila',JSON.stringify(r));
// päivät
const days={'2026-10-01':{sel:[liik.id],vals:{[en.id]:8,[mi.id]:6}},'2026-10-02':{sel:[soi.id],vals:{[en.id]:2,[mi.id]:2}},'2026-10-03':{sel:[],vals:{[en.id]:3,[mi.id]:1}}};
C=E.compile(P);const S=E.dayStats(C,days);
eq('seuranta',[S.n,S.items[liik.id].sel,S.items[liik.id].poss,S.items[soi.id].sel,S.items[soi.id].poss,S.items[mat.id].met,S.items[vire.id].cnt,S.items[vire.id].min,S.items[vire.id].max],[3,1,3,1,2,2,3,2,7]);
const co=E.cooc(C,days,mat.id);eq('yhteydet: matala vire',[co.withA,co.without,co.items[liik.id].a,co.items[en.id].a.sum/co.items[en.id].a.cnt],[2,1,{sel:0,poss:2,sum:0,cnt:0},2.5]);
// päätöskartan tuonti
const pk=E.fromPaatoskartta({paatoskartta:'puu',nimi:'Työpäivä',tekijat:[{nimi:'Ma'},{nimi:'Ti'},{nimi:'Päivä',nakymaton:true,pullonkaula:true,riittaa:['Ma','Ti']},{nimi:'Tiimi'},{nimi:'Valmistaudu',vaatii:['Tiimi'],suosittelijat:['Tiimi'],huomio:'Lue lista'},{nimi:'Ohje',teksti:'Tiimi alkaa',vaatii:['Tiimi']}],ei_sovi_yhteen:[['Ma','Ti']]});
const PP=pk.project;eq('päätöskartta: lajit ja säännöt',PP.objs.map(o=>[o.n,o.t,!!o.b,o.req.length,o.suf.length,(o.hl||[]).length,(o.ex||[]).length,o.note||o.body||'']),[['Ma','choice',false,0,0,0,1,''],['Ti','choice',false,0,0,0,1,''],['Päivä','cond',true,0,2,0,0,''],['Tiimi','choice',false,0,0,0,0,''],['Valmistaudu','choice',false,1,0,1,0,'Lue lista'],['Ohje','text',false,1,0,0,0,'Tiimi alkaa']]);
const PC=E.compile(PP);let PR=E.evaluate(PC,{});eq('päätöskartta: alussa vain päivät',PP.objs.filter(o=>PR.st[o.id].s==='open').map(o=>o.n),['Ma','Ti']);
PR=E.evaluate(PC,{sel:[PP.objs[0].id,PP.objs[3].id]});eq('päätöskartta: ma + tiimi',PP.objs.map(o=>o.n+':'+PR.st[o.id].s+(PR.st[o.id].hl?'!':'')),['Ma:sel','Ti:excl','Päivä:cond','Tiimi:sel','Valmistaudu:open!','Ohje:show']);
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');process.exit(ok?0:1);
