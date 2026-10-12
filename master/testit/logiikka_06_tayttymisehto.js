// Versio 8: täyttymisehto. Tekstikentällä, säätimellä, laskurilla, lasketulla arvolla ja kirjauksella on oma kyllä/ei
// (fill tai lajin oletus). Sääntö 'on' = täyttyy. Pullonkaula kaikille paitsi tekstille ja toiveelle. Laskun osa 1/0 (agg.bin).
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V8');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const vas=add('input','Vastaus',{b:true});
const jatko=add('text','Jatko',{body:'Kiitos'});
const pis=add('counter','Pisteet');
const ene=add('slider','Energia',{start:5});
const sana=add('input','Sana',{fill:{op:'has',v:'metsä'}});
const tavoite=add('counter','Tavoite',{fill:{op:'ge',v:5}});
const kirj=add('log','Kirjaus');
const yht=add('calc','Valmiina',{agg:{op:'sum',ids:[],bin:[]}});
const ehto=add('cond','Kaikki',{req:[{o:pis.id,op:'on'},{o:sana.id,op:'on'}]});
const kaukana=add('text','Kaukana',{req:[{o:tavoite.id,op:'off'}]});
yht.agg.ids=[vas.id,pis.id,ene.id,sana.id];yht.agg.bin=[vas.id,sana.id,pis.id];
E.repair(P);const C=E.compile(P);
const R=st=>E.evaluate(C,st).R;
const vis=st=>{const X=E.evaluate(C,st);return P.objs.filter(o=>['show','open','sel'].includes(X.st[o.id].s)).map(o=>o.n);};
eq('pullonkaulana tekstikenttä: alussa vain se',vis({sel:[],vals:{}}),['Vastaus']);
eq('kirjoitettu: loput näkyvät',vis({sel:[],vals:{[vas.id]:'hei'}}),['Vastaus','Jatko','Pisteet','Energia','Sana','Tavoite','Kirjaus','Valmiina','Kaukana']);
let st={sel:[],vals:{[vas.id]:'hei'}};
eq('oletukset: laskuri 0 ei täyty, säädin lähtöarvossa ei täyty, kirjaus tyhjä ei täyty',[R(st).on(pis.id),R(st).on(ene.id),R(st).on(kirj.id)],[false,false,false]);
st={sel:[],vals:{[vas.id]:'hei',[pis.id]:1,[ene.id]:7,[kirj.id]:[{t:1,v:3}]}};
eq('oletukset täyttyvät',[R(st).on(pis.id),R(st).on(ene.id),R(st).on(kirj.id)],[true,true,true]);
eq('oma täyttymisehto: sisältää sanan',[R(st).on(sana.id),R({sel:[],vals:{[vas.id]:'x',[sana.id]:'Kävely metsässä'}}).on(sana.id)],[false,true]);
eq('ehto täyttyy tekijöiden täyttymisistä',R({sel:[],vals:{[vas.id]:'x',[pis.id]:2,[sana.id]:'metsä'}}).met(ehto.id),true);
eq('ei täyty -sääntö',[vis({sel:[],vals:{[vas.id]:'x',[tavoite.id]:4}}).includes('Kaukana'),vis({sel:[],vals:{[vas.id]:'x',[tavoite.id]:5}}).includes('Kaukana')],[true,false]);
eq('lasku: tekstit 1/0, laskuri 1/0, säädin arvona',R({sel:[],vals:{[vas.id]:'x',[pis.id]:3,[ene.id]:7,[sana.id]:'metsä'}}).value(yht.id),1+1+7+1);
eq('piilossa oleva kenttä ei täyty',R({sel:[],vals:{[sana.id]:'metsä'}}).on(sana.id),false);
eq('lauseet',[E.clauseText(C,{o:tavoite.id,op:'on'}),E.clauseText(C,{o:vas.id,op:'on'}),E.clauseText(C,{o:ene.id,op:'off'}),E.clauseText(C,{o:kirj.id,op:'on'})],
  ['Tavoite täyttyy (on vähintään 5)','Vastaus täyttyy (on kirjoitettu)','Energia ei täyty (ei ole 5)','Kirjaus täyttyy (on kirjattu)']);
eq('mitä puuttuu: pullonkaula',E.needText(C,E.evaluate(C,{sel:[],vals:{}}).st[jatko.id].need),'Vastaus täyttyy (on kirjoitettu)');
eq('sisältää ei ole kaavoissa: ei kaavaa',E.toFormula(P,yht),null);
const t2=JSON.parse(JSON.stringify(P));t2.objs.find(o=>o.n==='Valmiina').agg.bin=[vas.id];
eq('kaavaksi 1/0-osalla',E.toFormula(t2,t2.objs.find(o=>o.n==='Valmiina')),'SUMMA(JOS([Vastaus]<>"";1;0);[Pisteet];[Energia];[Sana])');
eq('ehdon kaava täyttymisehdolla',E.toFormula(P,{mode:'if',cases:[{when:[{o:tavoite.id,op:'off'}],out:{k:'num',v:1}}],els:{k:'num',v:0}}),'JOS(EI([Tavoite]>=5);1;0)');
// kaava = valikot, kun 1/0-osa on kaavaksi muunnettavissa
const C2=E.compile(t2),f2=JSON.parse(JSON.stringify(t2)),fy=f2.objs.find(o=>o.n==='Valmiina');fy.mode='f';fy.f=E.toFormula(t2,t2.objs.find(o=>o.n==='Valmiina'));const C3=E.compile(f2);
for(const vals of [{[vas.id]:'x',[pis.id]:3,[ene.id]:7},{[vas.id]:'',[pis.id]:0}])eq('kaava = valikot '+JSON.stringify(vals),E.evaluate(C3,{sel:[],vals}).R.value(fy.id),E.evaluate(C2,{sel:[],vals}).R.value(fy.id));
// repair
const r=JSON.parse(JSON.stringify(P));r.objs.find(o=>o.n==='Jatko').fill={op:'filled'};r.objs.find(o=>o.n==='Jatko').b=true;r.objs.find(o=>o.n==='Pisteet').fill={op:'on'};
r.objs.find(o=>o.n==='Tavoite').fill.x=1;r.objs.find(o=>o.n==='Valmiina').agg.bin.push('o999');r.objs.find(o=>o.n==='Pisteet').b=true;
E.repair(r);eq('repair: täyttymisehto vain sopiville ja kelvollisella vertailulla',[r.objs.find(o=>o.n==='Jatko').fill,r.objs.find(o=>o.n==='Jatko').b,r.objs.find(o=>o.n==='Pisteet').fill,r.objs.find(o=>o.n==='Tavoite').fill,r.objs.find(o=>o.n==='Pisteet').b],[undefined,undefined,undefined,{op:'ge',v:5},true]);
eq('repair: 1/0-osat vain mukana olevista',r.objs.find(o=>o.n==='Valmiina').agg.bin,[vas.id,sana.id,pis.id]);
eq('vanha projekti ilman uusia kenttiä ei muutu',(()=>{const q=E.newProject('x');const a=E.newObj(q,'calc',q.screens[0].id,'A');q.objs.push(a);E.repair(q);return E.repair(q);})(),false);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
