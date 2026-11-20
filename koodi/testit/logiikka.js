// Moottorin testit: vastausmerkit (myös toistuvat värit), salainen koodi, arvaukset, tilastot, tallennuksen korjaus.
const K=require('./engine.js');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// tunnetut tapaukset
const T=[
 [[0,1,2,3],[0,1,2,3],{b:4,w:0}],
 [[0,1,2,3],[3,2,1,0],{b:0,w:4}],
 [[0,0,1,1],[1,1,0,0],{b:0,w:4}],
 [[0,0,1,1],[0,1,0,1],{b:2,w:2}],
 [[0,0,0,1],[0,0,0,0],{b:3,w:0}],   // ylimääräinen väri ei anna valkoista
 [[0,1,2,3],[0,0,0,0],{b:1,w:0}],
 [[1,2,3,4],[0,0,0,0],{b:0,w:0}],
 [[0,1,1,2],[1,0,0,1],{b:0,w:3}],
 [[5,5,4,4],[4,5,5,5],{b:1,w:2}],
 [[0,1,2,3,4],[4,3,2,1,0],{b:1,w:4}],
];
for(const [s,g,e] of T)ok(eq(K.score(s,g),e),`score ${s} / ${g} = ${JSON.stringify(K.score(s,g))}, odotettu ${JSON.stringify(e)}`);
// vertailu suoraviivaiseen laskentaan
function naive(s,g){let b=0;const S=s.slice(),G=g.slice();for(let i=0;i<S.length;i++)if(S[i]===G[i]){b++;S[i]=-1;G[i]=-2}
 let w=0;for(let i=0;i<G.length;i++){if(G[i]<0)continue;const j=S.indexOf(G[i]);if(j>=0){w++;S[j]=-1}}return {b,w}}
let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648};
for(let t=0;t<5000;t++){const n=t%2?5:4,k=t%2?8:6;const s=[],g=[];for(let i=0;i<n;i++){s.push(Math.floor(rnd()*k));g.push(Math.floor(rnd()*k))}
 if(!eq(K.score(s,g),naive(s,g))){ok(false,`satunnainen ${s} / ${g}`);break}
 const sc=K.score(s,g);ok(sc.b+sc.w<=n,'merkkejä enintään paikkojen verran')}
// symmetria
ok(eq(K.score([0,0,1,2],[2,0,0,3]),K.score([2,0,0,3],[0,0,1,2])),'score on symmetrinen');
// salainen koodi
for(let t=0;t<300;t++){const c=K.cfgFor(t%2?'super':'klassinen',false);const s=K.newSecret(c,rnd);ok(s.length===c.n&&new Set(s).size===c.n&&s.every(x=>x>=0&&x<c.k),'ilman toistoja kaikki eri')}
const cfg=K.cfgFor('klassinen',true);let dup=0;for(let t=0;t<300;t++){const s=K.newSecret(cfg,rnd);ok(s.every(x=>x>=0&&x<6),'väri välillä');if(new Set(s).size<4)dup++}
ok(dup>50,'toistoilla tulee toistuvia värejä ('+dup+'/300)');
ok(eq(K.cfgFor('xx'),{mode:'klassinen',n:4,k:6,rows:10,toisto:true}),'tuntematon tila → klassinen');
ok(K.MODES.super.n===5&&K.MODES.super.k===8&&K.MODES.super.rows===12,'Super 5/8/12');
// peli: voitto
let g=K.newGame('klassinen',true,rnd);g.secret=[1,2,3,3];
ok(K.guess(g,[1,2,-1,3]).why==='vajaa','vajaa rivi hylätään');ok(g.guesses.length===0,'hylätty ei kirjaudu');
let r=K.guess(g,[3,3,1,2]);ok(r.ok&&eq(r.sc,{b:0,w:4})&&!r.done,'arvaus kirjautuu');ok(eq(g.cur,[-1,-1,-1,-1]),'nykyinen rivi tyhjenee');
r=K.guess(g,[1,2,3,3]);ok(r.done==='voitto'&&g.done==='voitto','oikea koodi voittaa');
ok(K.guess(g,[0,0,0,0]).why==='ohi','pelin jälkeen ei arvata');
// tappio 10 rivillä
g=K.newGame('klassinen',true);g.secret=[0,0,0,0];for(let i=0;i<9;i++)ok(!K.guess(g,[1,1,1,1]).done,'ei vielä ohi '+i);
ok(K.guess(g,[1,1,1,1]).done==='tappio','10. väärä rivi on tappio');
// toistot pois
g=K.newGame('klassinen',false,rnd);ok(K.guess(g,[0,0,1,2]).why==='toisto','toistot pois: sama väri hylätään');
// voitto viimeisellä rivillä
g=K.newGame('klassinen',true);g.secret=[0,1,2,3];for(let i=0;i<9;i++)K.guess(g,[5,5,5,5]);ok(K.guess(g,[0,1,2,3]).done==='voitto','voitto viimeisellä rivillä on voitto');
// tilastot
const st=K.emptyStats();g.done='voitto';g.guesses=new Array(4);K.record(st,g);K.record(st,g);ok(st.pelit===2&&st.voitot===2&&st.putki===2&&st.paras===2&&st.jakauma['4']===2,'tilastot voitosta');
g.done='tappio';K.record(st,g);ok(st.pelit===3&&st.putki===0&&st.paras===2,'tappio katkaisee putken');
// korjaus
let d=K.repair(null);ok(d.app==='koodi'&&d.ver===1&&d.peli.secret.length===4&&d.asetukset.tila==='klassinen','tyhjä → oletukset');
d=K.repair({asetukset:{tila:'super',toisto:false,symbolit:true,ulko:'dark'},peli:{cfg:{mode:'super',toisto:false},secret:[0,1,2,3,4],guesses:[[4,3,2,1,0],[0,0,1,2,3],[1,2,3,4,5]],cur:[7,-1,99,'x',2]},tilastot:{super:{pelit:3,voitot:9,putki:2,paras:1,jakauma:{'3':2,'x':5,'40':1}}}});
ok(d.asetukset.tila==='super'&&!d.asetukset.toisto&&d.asetukset.symbolit&&d.asetukset.ulko==='dark','asetukset säilyvät');
ok(d.peli.guesses.length===1,'peli pelataan uudelleen ja pysähtyy laittomaan riviin (toisto)');
ok(eq(d.peli.cur,[7,-1,-1,-1,2]),'nykyisen rivin kelvolliset värit säilyvät, muut tyhjenevät');
ok(d.tilastot.super.voitot===3&&d.tilastot.super.paras===2&&eq(d.tilastot.super.jakauma,{'3':2}),'tilastot korjataan');
d=K.repair({peli:{cfg:{mode:'klassinen',toisto:true},secret:[0,1,2,3],guesses:[[0,1,2,3],[1,1,1,1]],cur:[1,2,3,4]}});
ok(d.peli.done==='voitto'&&d.peli.guesses.length===1,'voitettu peli pysyy voitettuna');
d=K.repair({peli:{cfg:{mode:'klassinen',toisto:true},secret:[0,1,2,3],guesses:[],cur:[1,-1,9,2]}});
ok(eq(d.peli.cur,[1,-1,-1,2]),'nykyisen rivin virheelliset värit tyhjenevät');
d=K.repair({peli:{cfg:{mode:'klassinen'},secret:[0,1,2,9]}});ok(d.peli.secret.every(x=>x<6)&&d.peli.guesses.length===0,'virheellinen koodi → uusi peli');
d=K.repair('roskaa');ok(d.app==='koodi','roska → oletukset');
process.exit(virheet?1:0);
