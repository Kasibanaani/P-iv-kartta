// Sokkelo-peli: kartat, näkeminen valokeilalla, seinät estävät, ääni, takaa-ajo, hukkaaminen ja eri suuntiin hajaantuminen, kiinni jääminen, ei jumiutumista.
const H=require('./hm.js');const C=H.consts;
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function check(l,c,x){if(!c)ok=false;console.log((c?'ok  ':'FAIL')+' '+l+(x!==undefined?'  '+x:''));}
eq('viisi karttaa',H.MAPS.map(m=>m.id),['talo','halli','toimisto','kaytavat','kartano']);
for(const m of H.MAPS){const M=H.parseMap(m),d=H.bfsDist(M,M.start.x,M.start.y);
  check(m.nimi+': suorakulmio, aloitus ja kaksi hippaa, kaikkialle pääsee, huoneita ja aukkoja',m.k.every(r=>r.length===M.w)&&M.start&&M.seek.length===2&&M.floor.every(k=>d[k]>=0)&&M.rooms>=4&&M.doors.length>=8,'huoneita '+M.rooms+', aukkoja '+M.doors.length);}
// pieni koekartta
const T={id:'t',nimi:'t',k:['############','#P.........#','#.........S#','#....#.....#','#....#.....#','#..........#','############']};
H.MAPS.push(T);
const M=H.parseMap(T);
eq('säde osuu seinään',Math.round(H.castRay(M,1.5,3.5,1,0,20)*100)/100,3.5);
check('seinä estää näköyhteyden',!H.clearLine(M,3.5,3.5,8.5,3.5)&&H.clearLine(M,3.5,1.5,8.5,1.5));
function game(px,py,sx,sy,dir){const G=H.newGame('t',1,5);G.p.x=px;G.p.y=py;const s=G.S[0];s.x=sx;s.y=sy;s.dir=dir;s.nextStop=99;s.path=[];return G;}
let G=game(6.5,1.5,1.5,1.5,0),s=G.S[0];
check('valokeilan keskellä: näkee',H.seeFactor(G.M,s,G.p)>0.9);
s.dir=Math.PI;check('selän takana: ei näe',H.seeFactor(G.M,s,G.p)===0);
s.dir=0;G.p.x=9.5;G.p.y=3.5;s.x=2.5;s.y=3.5;check('seinän takana: ei näe',H.seeFactor(G.M,s,G.p)===0);
G=game(8.5,1.5,1.5,1.5,0);s=G.S[0];
for(let i=0;i<20;i++)H.stepGame(G,1/60,{x:0,y:0});
check('näkee → huutomerkki ja takaa-ajo',s.state==='chase'&&s.mark==='!'&&G.ev.includes('spotted'));
// juoksu kohti pelaajaa samalla nopeudella kuin pelaaja
const d0=Math.hypot(s.x-G.p.x,s.y-G.p.y);for(let i=0;i<30;i++)H.stepGame(G,1/60,{x:0,y:0});
check('juoksee täyttä vauhtia',d0-Math.hypot(s.x-G.p.x,s.y-G.p.y)>C.RUN*0.5*0.8,(d0-Math.hypot(s.x-G.p.x,s.y-G.p.y)).toFixed(2));
for(let i=0;i<600&&!G.over;i++)H.stepGame(G,1/60,{x:0,y:0});
check('paikallaan oleva jää kiinni',G.over&&G.ev.includes('caught'));
// reunalla liikkumatta: huomataan hitaammin kuin keskellä liikkuessa
function noticeTime(px,py,dir,mag){const G=game(px,py,1.5,5.5,dir),s=G.S[0];let t=0;while(s.state!=='chase'&&t<3){s.x=1.5;s.y=5.5;s.dir=dir;s.path=[];H.stepGame(G,1/60,{x:0,y:0});t+=1/60;}return t;}
const tEdge=noticeTime(5.5,5.5,-0.6,0),tMid=noticeTime(5.5,5.5,0,0);
check('valokeilan reunalla liikkumatta huomaa hitaammin',tEdge>tMid*1.8,'reuna '+tEdge.toFixed(2)+' s, keskellä '+tMid.toFixed(2)+' s');
// ääni
eq('ääni v6: hiipiminen (0,3) alle 1,5, puolivauhti 1,7–2,7, täysi juoksu 8,5–9,5 ruutua',[H.noiseRadius(0.3)<1.5,H.noiseRadius(0.5)>1.7&&H.noiseRadius(0.5)<2.7,H.noiseRadius(1)>8.5&&H.noiseRadius(1)<9.5],[true,true,true]);
{const n=new Set();for(let sd=1;sd<=30;sd++){const G=H.newGame('talo','67',sd,'normaali');n.add(G.S.length);}eq('6-7: arpa antaa kuusi tai seitsemän',[...n].sort(),[6,7]);}
{const G=H.newGame('talo',1,4,'normaali');G.S[0].x=-50;G.S[0].y=-50;
 eq('keräily: kuusi palluraa, kaukana pelaajasta (vähintään 4 askelta)',[G.pallot.length,G.pallot.every(q=>Math.hypot(q.x-G.p.x,q.y-G.p.y)>=2)],[6,true]);
 for(let i=0;i<600;i++)H.stepGame(G,1/60,{x:0,y:0});
 eq('normaali: 10 s → palkki 0,8',Math.round(G.E*100)/100,0.8);
 const q=G.pallot[2];G.p.x=q.x;G.p.y=q.y;H.stepGame(G,1/60,{x:0,y:0});
 eq('pallura: +0,22, uusi tilalle vähintään 8 askeleen päähän',[Math.round(G.E*100)/100,G.kerätty,G.pallot.length,Math.hypot(G.pallot[5].x-G.p.x,G.pallot[5].y-G.p.y)>=3],[1,1,6,true]);
 for(let i=0;i<60*49&&!G.over;i++)H.stepGame(G,1/60,{x:0,y:0});eq('palkki ei vielä lopu 49 s:ssa',G.over,false);
 for(let i=0;i<60*3&&!G.over;i++)H.stepGame(G,1/60,{x:0,y:0});eq('palkki loppuu: peli päättyy nälkään',[G.over,G.why],[true,'nalka']);}
eq('ilman vaikeustasoa (vanhat testit): ei palluroita eikä laskua',(()=>{const G=H.newGame('talo',2,3);for(let i=0;i<600;i++)H.stepGame(G,1/60,{x:0,y:0});return [G.pallot.length,G.E]})(),[0,1]);
eq('äänen kantama: hiipiminen lyhyt, juoksu pitkä',[H.noiseRadius(0.2)<1.2,H.noiseRadius(1)>5.5],[true,true]);
G=game(4.5,1.5,8.5,1.5,0);s=G.S[0];
for(let i=0;i<40;i++)H.stepGame(G,1/60,{x:0.15,y:0});
check('hiipiminen kaukana: ei kuulu',s.state==='wander'&&!G.ev.includes('heard'));
G=game(3.5,5.5,7.5,5.5,0);s=G.S[0];
for(let i=0;i<5;i++)H.stepGame(G,1/60,{x:0,y:-1});
check('kova juoksu: kuuluu, kysymysmerkki ja lähtee äänen suuntaan',s.state==='hear'&&s.mark==='?'&&s.path.length>0);
// hukkaaminen: kaksi hippaa lähtee eri aukkoihin
const G2=H.newGame('talo',2,11),[a,b]=G2.S;
[a,b].forEach(o=>{o.x=16.5;o.y=13.5+(o===a?-1:1)*0.0;o.last={x:20.5,y:11.5};o.lastV={x:1,y:0};o.state='chase';});
a.y=10.5;b.y=15.5;
H.startSearch(G2,a);H.startSearch(G2,b);
check('hukattuaan: haku oviaukon kautta, eri hipat eri aukkoihin',a.state==='search'&&b.state==='search'&&a.door&&b.door&&a.door!==b.door,a.door&&b.door?JSON.stringify([a.door.x,a.door.y,b.door.x,b.door.y]):'');
check('arvaus suosii pelaajan kulkusuuntaa (oikealle)',a.door.x>=20);
// pitkä simulaatio: hipat eivät jää jumiin eivätkä mene seinän sisään
let bad=0,still=0,runs=0;
for(const m of H.MAPS.slice(0,5))for(let seed=1;seed<=6;seed++){const G=H.newGame(m.id,2,seed);G.p.x=-50;G.p.y=-50; // pelaaja pois kartalta: hipat vaeltavat
  const mv=G.S.map(()=>0),pos=G.S.map(o=>[o.x,o.y]);
  for(let i=0;i<60*120;i++){H.stepGame(G,1/60,{x:0,y:0});if(i%60===0)G.S.forEach((o,j)=>{mv[j]+=Math.hypot(o.x-pos[j][0],o.y-pos[j][1]);pos[j]=[o.x,o.y];if(H.hitsWall(G.M,o.x,o.y,0.25))bad++;});}
  mv.forEach(v=>{runs++;if(v<60)still++;});}
check('60 hippaa × 2 min: ei seinien sisällä, kaikki liikkuvat (> 60 ruutua)',bad===0&&still===0,'seinässä '+bad+', paikallaan '+still+'/'+runs);
// vaeltelu ei ole robottimaista: pysähdyksiä ja katselua
G=H.newGame('talo',2,3);G.p.x=-50;let looks=0,bursts=0;for(let i=0;i<60*120;i++){H.stepGame(G,1/60,{x:0,y:0});G.S.forEach(o=>{if(o.state==='look')looks++;if(o.burst>0)bursts++;});}
check('vaeltaessa välillä pysähtyy katselemaan ja välillä pyrähtää',looks>60*6&&bursts>60*4,'katselu '+(looks/60).toFixed(0)+' s, pyrähdys '+(bursts/60).toFixed(0)+' s');
// harhautus: heitto valokeilaan houkuttelee hipan suoraan sinne, latautuu 20 s
{G=game(10.5,2.5,6.5,1.5,Math.PI);s=G.S[0];
 const k=H.heittoKohde(G,-0.765,0),f=H.heita(G,-0.765,0),f2=H.heita(G,-0.765,0);
 for(let i=0;i<40;i++)H.stepGame(G,1/60,{x:0,y:0});
 check('heitto lentää, hippa näkee osuman ja lähtee suoraan sinne, toista ei heti',f&&!f2&&k.x<3&&s.state==='hear'&&s.mark==='!'&&s.path.length>0&&Math.hypot(s.path[s.path.length-1].x-k.x,s.path[s.path.length-1].y-k.y)<1.2&&G.rings.some(r=>r.kova),JSON.stringify([k,s.state,s.mark]));}
{G=H.newGame('t',1,5);G.S=[];H.heita(G,1,0);for(let i=0;i<60*19;i++)H.stepGame(G,1/60,{x:0,y:0});const a=G.lataus;for(let i=0;i<70;i++)H.stepGame(G,1/60,{x:0,y:0});
 eq('latauspalkki täyttyy 20 sekunnissa',[a<1,G.lataus,H.heita(G,1,0)],[true,1,true]);}
{G=game(1.5,1.5,4.5,1.5,Math.PI);s=G.S[0];s.state='chase';s.last={x:1.5,y:1.5};s.seenT=G.t;s.path=[];s.repl=0;
 G.heitot.push({x0:9.5,y0:5.5,x:9.5,y:5.5,t:0,T:0.01,maassa:false});H.stepGame(G,1/60,{x:0,y:0});
 check('jahtaava hippa, joka näkee pelaajan, ei välitä harhautuksesta',s.state==='chase'||G.over);}
// kuiskausnappi: vain jahti lähellä, viipyy hetken, ei muuta peliä
{const G=H.newGame('talo',1,5),s=G.S[0];s.x=-50;s.y=-50;s.state='wander';H.stepGame(G,1/60,{x:0,y:0});
 const a=H.uhka(G);s.x=G.p.x+4;s.y=G.p.y;s.state='chase';s.last={x:G.p.x,y:G.p.y};s.seenT=G.t;s.path=[];s.repl=0;H.stepGame(G,1/60,{x:0,y:0});const b=H.uhka(G);
 s.state='search';for(let i=0;i<30;i++){s.x=-50;s.y=-50;s.state='search';H.stepGame(G,1/60,{x:0,y:0});}const c=H.uhka(G);
 for(let i=0;i<60;i++){s.x=-50;s.y=-50;s.state='search';H.stepGame(G,1/60,{x:0,y:0});}
 eq('kuiskaus: ei vaeltaessa, näkyy jahdissa, viipyy 1,2 s',[a,b,c,H.uhka(G)],[false,true,true,false]);}
eq('loppukommentin sävy kuiskausten mukaan',[0,1,2,3,6,7,30].map(H.irtiLaji),['peli_irti0','peli_irti1','peli_irti1','peli_irti2','peli_irti2','peli_irti3','peli_irti3']);
check('loppukommentteja noin sata, En jäänyt -repliikkejä tusina',(()=>{const L=H.LINES;const n=['peli_irti0','peli_irti1','peli_irti2','peli_irti3'].reduce((t,k)=>t+L[k].length,0);return n>=95&&L.peli_enjaanyt.length>=10})());
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
