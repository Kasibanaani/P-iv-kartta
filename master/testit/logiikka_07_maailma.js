// Versio 9: maailmat. Maailma on ruudukko (P.maps), jolla on esteitä ja tekijöitä; Maailma-kenttä (t:'map') näyttää yhden maailman.
// Tarkistaa: vanha projekti ei muutu, siivous (ruudut maailman sisällä, säännöt ja toiminnot olemassa oleviin), Siirrä hahmo,
// aloituskohta (ruutu tai viimeisin sijainti samassa tai toisessa kentässä), viittaukset ja poistot.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V9');E.repair(P);
eq('vanha projekti ei saa maailmoja',('maps' in P),false);
const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const M=E.newMap(P);
const avain=add('choice','Avain'),pis=add('counter','Pisteet'),mets=add('map','Metsä');
eq('uusi maailma ja kenttä',[M.id,M.w,M.h,mets.m,mets.h,mets.w,mets.start],['k1',24,18,'k1',320,100,{k:'xy',x:0,y:0}]);
const ovi=E.newFx(M,'wall');ovi.cells=['1,1','1,1','99,0','x'];ovi.req=[{o:avain.id,op:'off'},{o:mets.id,op:'on'}];
const npc=E.newFx(M,'zone');npc.cells=['2,2'];npc.act=[{do:'add',o:pis.id,v:1},{do:'warp',o:mets.id,x:3.7,y:-2},{do:'select',o:'eiole'}];
E.repair(P);
eq('ruudut: tuplat, maailman ulkopuoliset ja rikkinäiset pois',ovi.cells,['1,1']);
eq('säännöt: maailmakenttään ei voi viitata',ovi.req,[{o:avain.id,op:'off'}]);
eq('toiminnot: puuttuva kohde pois, siirron ruutu kokonaisluvuksi',npc.act,[{do:'add',o:pis.id,v:1},{do:'warp',o:mets.id,x:4,y:0}]);
eq('oletukset: este näkyy, tekijä näkymätön, laukeaa astuessa',[ovi.vis,npc.vis,npc.trig],[true,false,'enter']);
const C=E.compile(P),st={sel:[],vals:{}};
eq('kenttä näkyy',E.evaluate(C,st).st[mets.id].s,'show');
E.applyActs(C,st,npc.act,{});
eq('toiminnot: pisteet ja siirto ruudun keskelle',[st.vals[pis.id],st.vals[mets.id]],[1,{x:4.5,y:0.5}]);
eq('aloitus ruudusta',E.mapStart(P,mets,st.vals),{x:0.5,y:0.5});
mets.start={k:'last',x:2,y:2};E.repair(P);
eq('viimeisin sijainti: oma kenttä oletuksena',[mets.start.o,E.mapStart(P,mets,st.vals)],[mets.id,{x:4.5,y:0.5}]);
eq('viimeisin sijainti puuttuu: varalla oleva ruutu',E.mapStart(P,mets,{}),{x:2.5,y:2.5});
const luola=add('map','Luola',{start:{k:'last',o:mets.id}});E.repair(P);
eq('toisen kentän viimeisin sijainti',E.mapStart(P,luola,st.vals),{x:4.5,y:0.5});
eq('sijainti pysyy maailman sisällä',E.mapStart(P,luola,{[mets.id]:{x:500,y:-3}}),{x:23.5,y:0.5});
eq('viittaukset: toinen kenttä ja tekijät',[E.usedBy(P,mets.id),E.fxUsing(P,avain.id).map(x=>x.f.id),E.fxUsing(P,pis.id).map(x=>x.f.id)],[[luola.id],[ovi.id],[npc.id]]);
eq('maailmakenttä ei ole säännöissä valittavissa eikä pullonkaula',[E.refable(P,null).some(o=>o.t==='map'),E.canB(mets),E.opsFor(mets)],[false,false,[]]);
E.applyActs(C,st,[{do:'reset'}],{});eq('Alusta palauttaa hahmon aloitukseen',mets.id in st.vals,false);
M.w=4;E.repair(P);eq('maailman pienennys poistaa ulkopuoliset ruudut',[ovi.cells,npc.cells],[['1,1'],['2,2']]);M.w=1;E.repair(P);eq('pienin koko on 3 ruutua',[M.w,npc.cells],[3,['2,2']]);
E.dropObj(P,mets.id);eq('kentän poisto: toinen kenttä palaa omaan, siirto poistuu',[luola.start.o,npc.act.length],[luola.id,1]);
P.state.vals[luola.id]={x:1,y:2};E.repair(P);eq('sijainti tilassa kelpaa',P.state.vals[luola.id],{x:1,y:2});
P.state.vals[luola.id]={x:'a'};E.repair(P);eq('rikkinäinen sijainti pois',luola.id in P.state.vals,false);
P.maps=[];E.repair(P);eq('maailman poisto: kenttä ilman maailmaa',luola.m,'');
const P2=JSON.parse(JSON.stringify(P));P2.maps='rikki';E.repair(P2);eq('rikkinäinen maps-kenttä korjautuu',P2.maps,[]);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
