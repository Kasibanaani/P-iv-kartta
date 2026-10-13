// Versio 2: tekstikenttä, laskuri, valikoista koottu arvo (yhdistelmä ja jos–niin), painallustavat ja kun–niin-toiminnot.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V2');P.screens.push({id:'s2',n:'Toinen'});const add=(t,n,x,s)=>{const o=E.newObj(P,t,s||'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const en=add('slider','Energia',{start:6}),mi=add('slider','Mieliala',{start:2});
const su=add('calc','Summa',{agg:{op:'sum',ids:[]}}); su.agg.ids=[en.id,mi.id];
const ka=add('calc','Ka',{agg:{op:'avg',ids:[en.id,mi.id]}}),er=add('calc','Erotus',{agg:{op:'diff',ids:[en.id,mi.id]}}),ja=add('calc','Jako',{agg:{op:'div',ids:[en.id,mi.id]}});
const nimi=add('input','Mikä auttoi',{ph:'Kirjoita'});
const pis=add('counter','Pisteet',{start:0,max:3,keep:true});
const a=add('choice','A'),b=add('choice','B',{beh:'hold'});
const tila=add('calc','Tila',{mode:'if',cases:[{when:[{o:ka.id,op:'lt',v:4}],out:{k:'txt',v:'matala'}},{when:[{o:ka.id,op:'ge',v:7},{o:a.id,op:'on'}],out:{k:'txt',v:'hyvä'}}],els:{k:'ref',v:su.id}});
const kirj=add('cond','Kirjoitettu',{req:[{o:nimi.id,op:'filled'}],act:[{do:'add',o:pis.id,v:1},{do:'msg',t:'Kiitos! Pisteet {Pisteet}.'}]});
const has=add('cond','Mainitsee kävelyn',{req:[{o:nimi.id,op:'has',v:'kävel'}]});
const pito=add('text','Pidossa',{body:'Näkyy vain pidettäessä',req:[{o:b.id,op:'on'}]});
a.act=[{do:'set',o:en.id,v:9},{do:'goto',s:'s2'}];a.lact=[{do:'clear',o:nimi.id},{do:'reset'}];
E.repair(P);let C=E.compile(P),R=E.evaluate(C,{sel:[],vals:{}});
eq('yhdistelmät',[R.R.value(su.id),R.R.value(ka.id),R.R.value(er.id),R.R.value(ja.id)],[8,4,4,3]);
eq('jos–niin: muuten viittaus',R.R.value(tila.id),8);
R=E.evaluate(C,{sel:[],vals:{[en.id]:1,[mi.id]:2}});eq('jos–niin: ensimmäinen pätevä rivi',R.R.value(tila.id),'matala');
R=E.evaluate(C,{sel:[a.id],vals:{[en.id]:9,[mi.id]:8}});eq('jos–niin: kaksi ehtoa',R.R.value(tila.id),'hyvä');
R=E.evaluate(C,{sel:[],vals:{[en.id]:9,[mi.id]:8}});eq('jos–niin: toinen ehto puuttuu',R.R.value(tila.id),17);
eq('kaavaksi',[E.toFormula(P,su),E.toFormula(P,er),E.toFormula(P,tila)],['SUMMA([Energia];[Mieliala])','[Energia]-[Mieliala]','JOS([Ka]<4;"matala";JOS(JA([Ka]>=7;[A]<>0);"hyvä";[Summa]))']);
// kaavaksi muunnettu antaa saman tuloksen
const t2=JSON.parse(JSON.stringify(P));const tt=t2.objs.find(o=>o.n==='Tila');tt.mode='f';tt.f=E.toFormula(P,tila);const C2=E.compile(t2);
for(const v of [[1,2],[9,8],[5,5]]){for(const s of [[],[a.id]]){const st={sel:s,vals:{[en.id]:v[0],[mi.id]:v[1]}};eq('kaava = valikot '+v+' '+s,E.evaluate(C2,st).R.value(tt.id),E.evaluate(C,st).R.value(tila.id));}}
// tekstikenttä
R=E.evaluate(C,{sel:[],vals:{}});eq('tekstikenttä tyhjä',[R.R.value(nimi.id),R.st[kirj.id].met,R.st[nimi.id].s],['',false,'show']);
R=E.evaluate(C,{sel:[],vals:{[nimi.id]:'Kävelin järven ympäri'}});eq('kirjoitettu ja sisältää',[R.st[kirj.id].met,R.st[has.id].met],[true,true]);
eq('lauseet',[E.clauseText(C,{o:nimi.id,op:'filled'}),E.clauseText(C,{o:nimi.id,op:'has',v:'kävel'}),E.clauseText(C,{o:nimi.id,op:'eq',v:'5'})],['Mikä auttoi on kirjoitettu','Mikä auttoi sisältää ”kävel”','Mikä auttoi on ”5”']);
// laskuri
eq('laskuri alkuarvo ja raja',[E.counterVal(pis,undefined),E.counterVal(pis,7)],[0,3]);
// toiminnot: kirjoittaminen täyttää ehdon -> pisteet +1 ja viesti
let st={sel:[],vals:{}};let before=E.metSet(C,st);st.vals[nimi.id]='Kävely';let out=E.change(C,st,before,[]);
eq('ehto alkaa täyttyä: toiminnot',[st.vals[pis.id],out.msg],[1,'Kiitos! Pisteet {Pisteet}.']);
before=E.metSet(C,st);st.vals[nimi.id]='Kävely ja uinti';out=E.change(C,st,before,[]);eq('jo täyttynyt ei laukea uudelleen',st.vals[pis.id],1);
before=E.metSet(C,st);st.vals[nimi.id]='';E.change(C,st,before,[]);before=E.metSet(C,st);st.vals[nimi.id]='x';E.change(C,st,before,[]);eq('uudelleen täyttyminen laukeaa',st.vals[pis.id],2);
// valinnan toiminnot
before=E.metSet(C,st);st.sel=st.sel.concat([a.id]);out=E.change(C,st,before,a.act);eq('valinnan toiminnot',[st.vals[en.id],out.goto],[9,'s2']);
before=E.metSet(C,st);out=E.change(C,st,before,a.lact);eq('pitkä painallus: tyhjennä ja alusta (pisteet säilyvät)',[st.sel,st.vals[nimi.id],st.vals[pis.id],st.vals[en.id]],[[],undefined,2,undefined]);
// painike, joka palautuu: näkyy vain pidettäessä
R=E.evaluate(C,{sel:[],vals:{}});eq('pito ei päällä',R.st[pito.id].s,'hide');R=E.evaluate(C,{sel:[b.id],vals:{}});eq('pidettäessä',R.st[pito.id].s,'show');
eq('valitse-toiminto ei valitse palautuvaa',(()=>{const s={sel:[],vals:{}};E.applyActs(C,s,[{do:'select',o:b.id}],{});return s.sel;})(),[]);
// korjaus siivoaa
const Q=JSON.parse(JSON.stringify(P));const qo=n=>Q.objs.find(o=>o.n===n);qo('A').act.push({do:'add',o:qo('Energia').id,v:1},{do:'goto',s:'eiole'},{do:'huu'});qo('A').beh='outo';qo('Tila').cases[0].when.push({o:qo('Pidossa').id,op:'on'},{o:qo('Mikä auttoi').id,op:'ge',v:1});qo('Summa').agg.ids.push('x',qo('Pidossa').id);qo('Energia').act=[{do:'reset'}];
eq('korjaus muuttaa',E.repair(Q),true);eq('  siivottu',[qo('A').act.length,qo('A').beh,qo('Tila').cases[0].when.length,qo('Summa').agg.ids.length,qo('Energia').act],[2,'toggle',1,2,undefined]);
eq('käyttäjät',E.usedBy(P,pis.id).map(x=>P.objs.find(o=>o.id===x).n),['Kirjoitettu']);
eq('käyttäjät: koottu arvo ja toiminto',E.usedBy(P,en.id).map(x=>P.objs.find(o=>o.id===x).n),['Summa','Ka','Erotus','Jako','A']);
eq('lajit',Object.keys(E.TYPES),['choice','slider','input','text','calc','counter','log','cond','wish','map']);
// toive tekoälylle: ei arvoa, ei sääntöjä, ei viitattavissa; kohde siivotaan
const W=E.newProject('T');const wa=E.newObj(W,'slider','s1','A');W.objs.push(wa);const ww=E.newObj(W,'wish','s1','Toive');Object.assign(ww,{about:wa.id,body:'Isompi',req:[{o:wa.id,op:'ge',v:1}],status:'outo'});W.objs.push(ww);
eq('toive siivotaan',[E.repair(W),ww.req,ww.status,ww.about===wa.id],[true,undefined,'auki',true]);
eq('toivetta ei voi käyttää ehdoissa',[E.refable(W,'x').map(o=>o.n),E.opsFor(ww)],[['A'],[]]);
eq('toiveen tila',E.evaluate(E.compile(W),{}).st[ww.id],{s:'wish'});
E.dropObj(W,wa.id);eq('kohde poistettu',ww.about,'');
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');process.exit(ok?0:1);
