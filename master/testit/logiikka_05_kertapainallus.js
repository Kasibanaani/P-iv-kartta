// Versio 7: palautuva painike, jonka yksi painallus riittää (once). Painike palautuu, mutta jää painetuksi
// sääntöjen ja pullonkaulan kannalta, kunnes Alusta, Tyhjennä tai Poista valinta nollaa sen.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('V7');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const kys=add('text','Kysymys',{body:'Kuka olet?'});
const vas=add('input','Vastaus');
const nappi=add('choice','Vastaa',{beh:'hold',once:true,b:true,req:[{o:vas.id,op:'filled'}]});
const jatko=add('text','Jatko',{body:'Katso kirjoittamaasi'});
const a=add('choice','Mielestäni',{beh:'hold',once:true}),b=add('choice','En tiedä',{beh:'hold',once:true});
const ehto=add('cond','Vastattu',{suf:[{o:a.id,op:'on'},{o:b.id,op:'on'}],b:true});
const loppu=add('text','Loppu',{body:'Loppu'});
const vanha=add('choice','Vanha pito',{beh:'hold',b:true});
const piilo=add('text','Piilo',{body:'Pullonkaulan takana'});
const pis=add('counter','Pisteet');ehto.act=[{do:'add',o:pis.id,v:1}];
E.repair(P);const C=E.compile(P);
const vis=(st)=>{const R=E.evaluate(C,st);return P.objs.filter(o=>o.t!=='cond'&&o.t!=='counter'&&(R.st[o.id].s==='show'||R.st[o.id].s==='open'||R.st[o.id].s==='sel')).map(o=>o.n+(R.st[o.id].done?'✓':''));};
eq('alussa vain kysymys ja kenttä',vis({sel:[],vals:{}}),['Kysymys','Vastaus']);
let st={sel:[],vals:{[vas.id]:'Emil'}};
eq('kirjoitettu: painike näkyy, jatko ei',vis(st),['Kysymys','Vastaus','Vastaa']);
// painallus kuten puhelimessa: merkitään ja muutos ajetaan
let before=E.metSet(C,st);st.vals[nappi.id]=1;E.change(C,st,before,nappi.act||[],nappi.id);
let before2=E.metSet(C,st);E.change(C,st,before2,[],null); // irrotus
eq('painettu ja irrotettu: pullonkaula aukeaa pysyvästi',vis(st),['Kysymys','Vastaus','Vastaa✓','Jatko','Mielestäni','En tiedä']);
eq('valintoja ei jää pohjaan',st.sel,[]);
eq('arvo laskuissa on 1',E.evaluate(C,st).R.value(nappi.id),1);
// toinen pullonkaula: ehto täyttyy kertapainalluksella ja ehdon toiminto laukeaa kerran
before=E.metSet(C,st);st.vals[b.id]=1;E.change(C,st,before,[],b.id);E.change(C,st,E.metSet(C,st),[],null);
eq('En tiedä painettu: ehto täyttyy, loppu näkyy',vis(st).slice(-3),['En tiedä✓','Loppu','Vanha pito']);
eq('ehdon toiminto laukesi kerran',E.counterVal(pis,st.vals[pis.id]),1);
before=E.metSet(C,st);E.change(C,st,before,[],b.id);E.change(C,st,E.metSet(C,st),[],null);
eq('uusi painallus ei laukaise ehtoa uudelleen',E.counterVal(pis,st.vals[pis.id]),1);
// tavallinen palautuva painike pullonkaulana aukeaa vain pidettäessä
eq('vanha pito: piilo ei näy irrotettuna',vis(st).indexOf('Piilo'),-1);
eq('vanha pito: piilo näkyy pidettäessä',vis({sel:st.sel.concat([vanha.id]),vals:st.vals}).indexOf('Piilo')>=0,true);
// säännön näkyvyys: jos kenttä tyhjennetään, painike lukittuu ja jatko katoaa (kuten valinnalla)
const st2={sel:[],vals:Object.assign({},st.vals,{[vas.id]:''})};
eq('kenttä tyhjäksi: painettu painike ei enää avaa',vis(st2),['Kysymys','Vastaus']);
// Tyhjennä, Poista valinta, Valitse ja Alusta
let s3=JSON.parse(JSON.stringify(st));E.applyActs(C,s3,[{do:'clear',o:nappi.id}],{});eq('Tyhjennä nollaa painalluksen',nappi.id in s3.vals,false);
s3=JSON.parse(JSON.stringify(st));E.applyActs(C,s3,[{do:'unselect',o:a.id},{do:'unselect',o:b.id}],{});eq('Poista valinta nollaa painalluksen',b.id in s3.vals,false);
s3={sel:[],vals:{[vas.id]:'x'}};E.applyActs(C,s3,[{do:'select',o:nappi.id}],{});eq('Valitse merkitsee painetuksi',s3.vals[nappi.id],1);
s3=JSON.parse(JSON.stringify(st));E.applyActs(C,s3,[{do:'reset'}],{});eq('Alusta nollaa',[s3.sel,Object.keys(s3.vals)],[[],[]]);
// asetus vaikuttaa vain palautuvaan painikkeeseen
const t=JSON.parse(JSON.stringify(P));const ta=t.objs.find(o=>o.n==='Mielestäni');ta.beh='toggle';const Ct=E.compile(t);
eq('jää valituksi -valinta ei käytä painallusmerkintää',Ct&&E.evaluate(Ct,{sel:[],vals:{[a.id]:1}}).R.on(a.id),false);
// repair: kenttä vain valinnalle, tila säilyy
const r=JSON.parse(JSON.stringify(P));r.objs.find(o=>o.n==='Loppu').once=true;r.objs.find(o=>o.n==='En tiedä').once='kyllä';r.state={sel:[],vals:{[a.id]:1,[pis.id]:2}};
E.repair(r);eq('repair: once vain valinnalle ja totuusarvona',[r.objs.find(o=>o.n==='Loppu').once,r.objs.find(o=>o.n==='En tiedä').once],[undefined,true]);
eq('repair: painallusmerkintä säilyy tilassa',r.state.vals[a.id],1);
eq('säännön teksti',E.clauseText(C,{o:a.id,op:'on'}),'Mielestäni on painettu');
// lajin vaihto säilyttää asetuksen, jos laji pysyy valintana
eq('päiväseuranta laskee painetun valituksi',E.dayStats(C,{'2026-10-13':{sel:[],vals:st.vals}}).items[b.id].sel,1);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
