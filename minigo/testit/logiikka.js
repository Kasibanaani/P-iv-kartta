// Moottorin testit: kaappaus, itsemurha, ko, passit, Kaappaus-Go, alueen laskenta, kuolleet kivet, tasoitus, korjaus.
const GO=require('./engine.js');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
// asema riveistä: X musta, O valkea, . tyhjä
function pos(rows,turn){const n=rows.length,s=GO.fresh({n:n===5?5:n===7?7:9});s.n=n;
  rows.forEach((r,y)=>r.replace(/ /g,'').split('').forEach((ch,x)=>{s.b[y*n+x]=ch==='X'?1:ch==='O'?2:0}));s.turn=turn||1;return s}
const at=(n,x,y)=>y*n+x;
const go={n:5,mode:'go',komi:0.5},kp={n:5,mode:'kaappaus',target:1};

// 1 yksittäisen kiven kaappaus kulmassa
let s=pos(['O....','X....','.....','.....','.....']);
let r=GO.play(s,go,at(5,1,0));ok(r.ok&&r.captured.length===1&&r.s.b[0]===0&&r.s.cap[1]===1,'kulmakivi kaapataan');
// 2 ryhmän kaappaus
s=pos(['OO...','XXX..','.....','.....','.....']);r=GO.play(s,go,at(5,2,0));ok(r.ok&&r.captured.length===2&&r.s.cap[1]===2,'kahden kiven ryhmä kaapataan');
// 3 itsemurha kielletty
s=pos(['.O...','O....','.....','.....','.....']);r=GO.play(s,go,0);ok(!r.ok&&r.err==='itsemurha','itsemurha estetään');
// ryhmän itsemurha
s=pos(['X.O..','OO...','.....','.....','.....']);r=GO.play(s,go,1);ok(!r.ok&&r.err==='itsemurha','ryhmän itsemurha estetään');
// kaappaava siirto ei ole itsemurha
s=pos(['.OX..','OX...','.....','.....','.....']);r=GO.play(s,go,0);ok(r.ok&&r.captured.length>=1&&r.s.b[0]===1,'kaappaava siirto sallitaan, vaikka vapaudet olisivat ensin nolla');
// varattu
s=pos(['X....','.....','.....','.....','.....']);r=GO.play(s,go,0);ok(!r.ok&&r.err==='varattu','varattuun ei voi pelata');
// 4 ko
s=pos(['.XO..','XO.O.','.XO..','.....','.....']);
r=GO.play(s,go,at(5,2,1));ok(r.ok&&r.captured.length===1,'ko: musta kaappaa');
let s2=r.s;r=GO.play(s2,go,at(5,1,1));ok(!r.ok&&r.err==='ko','ko: välitön takaisinkaappaus estetään');
r=GO.play(s2,go,24);r=GO.play(r.s,go,20);r=GO.play(r.s,go,at(5,1,1));ok(r.ok&&r.captured.length===1,'ko: muualle pelaamisen jälkeen saa kaapata');
// passin jälkeen ko vapautuu
r=GO.pass(s2,go);r=GO.pass(r.s,go);ok(r.ok&&r.s.over,'');
let sk=GO.pass(s2,go).s;r=GO.play(GO.play(sk,go,24).s,go,at(5,1,1));ok(r.ok,'ko vapautuu, kun välissä on passi ja siirto');
let sp=GO.pass(s2,go).s;sp=GO.pass(sp,go);ok(sp.ok&&sp.s.over&&sp.s.over.why==='laske','kaksi passia Gossa = laskenta');
// 5 Kaappaus-Go: ensimmäinen kaappaus voittaa
let rp=GO.replay(kp,[1,0,5]);ok(rp.applied===3&&rp.s.over&&rp.s.over.winner===1,'Kaappaus-Go: musta voittaa ensimmäisellä kaappauksella');
ok(!GO.play(rp.s,kp,10).ok,'pelin loputtua ei voi pelata');
rp=GO.replay({n:5,mode:'kaappaus',target:3},[1,0,5]);ok(!rp.s.over&&rp.s.cap[1]===1,'tavoite 3: yksi kaappaus ei riitä');
rp=GO.replay(kp,[-1,-1]);ok(rp.s.over&&rp.s.over.winner===0,'Kaappaus-Go: kaksi passia ilman kaappauksia = tasapeli');
// 6 alueen laskenta
let b=pos(['..XO.','..XO.','..XO.','..XO.','..XO.']).b;
let sc=GO.score(b,5,[],0.5);ok(sc.black===15&&sc.white===10.5&&sc.winner===1&&sc.margin===4.5,'alue: '+JSON.stringify([sc.black,sc.white]));
b=pos(['O.XO.','..XO.','..XO.','..XO.','..XO.']).b;
sc=GO.score(b,5,[],0.5);ok(sc.black===5&&sc.white===11.5,'vihollisen kivi tekee alueesta puolueettoman '+JSON.stringify([sc.black,sc.white]));
let dead=GO.toggleDead(b,5,[],0);ok(dead.length===1&&dead[0]===0,'kuollut kivi merkitään');
sc=GO.score(b,5,dead,0.5);ok(sc.black===15&&sc.white===10.5,'kuollut kivi lasketaan vastustajan alueeksi');
ok(GO.toggleDead(b,5,dead,0).length===0,'toinen napautus palauttaa elävaksi');
dead=GO.toggleDead(b,5,[],3);ok(dead.length===5,'koko ryhmä merkitään kerralla');
sc=GO.score(new Int8Array(25),5,[],7);ok(sc.black===0&&sc.white===7&&sc.terr[0]===25,'tyhjä lauta on puolueeton');
// 7 tasoitus
let h=GO.fresh({n:9,mode:'go',handicap:3});ok(h.turn===2&&[24,56,60].every(i=>h.b[i]===1)&&h.b.reduce((a,x)=>a+x,0)===3,'tasoitus 3 kiveä tähtipisteisiin, valkea aloittaa');
ok(GO.handicapPoints(9,5).length===5&&GO.handicapPoints(9,5)[4]===40,'tasoitus 5 sisältää keskipisteen');
ok(GO.cfgOf({n:5,handicap:4}).handicap===2&&GO.cfgOf({n:7,handicap:9}).handicap===4,'tasoitus rajataan laudan mukaan');
ok(GO.handicapList(5).join()==='0,2'&&GO.handicapList(9).join()==='0,2,3,4,5','tasoitusvalinnat');
ok(GO.hoshi(9).length===5&&GO.hoshi(5).length===1&&GO.hoshi(19).length===9&&GO.hoshi(13).length===9,'tähtipisteet');
// 13 ja 19 toimivat moottorissa
rp=GO.replay({n:19,mode:'go'},[0,1,19,20,-1,-1]);ok(rp.applied===6&&rp.s.over,'19×19 toimii moottorissa');
// 8 atarit
s=pos(['XO...','.....','.....','.....','.....']);let a=GO.ataris(s.b,5);ok(a.stones.indexOf(0)>=0&&a.libs.indexOf(5)>=0&&a.stones.indexOf(1)<0,'atari: kulmakivi ja sen viimeinen vapaus '+JSON.stringify(a));
// 9 korjaus
let g=GO.repairGame({cfg:{n:5,mode:'go'},moves:[0,0,1,'x',2]});ok(g.moves.join()==='0','laiton siirto katkaisee: '+g.moves);
g=GO.repairGame(null);ok(g.cfg.n===9&&g.moves.length===0&&g.phase==='peli','tyhjä tieto = uusi peli');
g=GO.repairGame({cfg:{n:'7',mode:'go',komi:'x'},moves:[-1,-1],phase:'ohi',dead:[3]});ok(g.cfg.n===7&&g.cfg.komi===0.5&&g.phase==='ohi'&&g.dead.length===0,'passit + ohi säilyy, kuollut tyhjässä pisteessä poistetaan');
g=GO.repairGame({cfg:{n:5,mode:'go'},moves:[0,-1,-1],phase:'peli'});ok(g.phase==='laske','kahden passin jälkeen vaihe on laskenta');
g=GO.repairGame({cfg:{n:5,mode:'kaappaus'},moves:[1,0,5],phase:'peli'});ok(g.phase==='ohi','voitettu peli on ohi');
ok(GO.cfgOf({n:11}).n===9&&GO.cfgOf({mode:'x'}).mode==='go','tuntemattomat arvot korjataan');
// 10 satunnaispelit: säännöt pitävät (ei vapaudettomia ryhmiä laudalla)
let rnd=1;const R=()=>(rnd=(rnd*16807)%2147483647)/2147483647;
for(let k=0;k<200;k++){const n=[5,7,9][k%3];let st=GO.fresh({n});for(let m=0;m<n*n*3;m++){const i=Math.floor(R()*n*n);const q=GO.play(st,{n,mode:'go'},i);if(q.ok)st=q.s}
  let bad=false;for(let i=0;i<n*n;i++)if(st.b[i]&&!GO.group(st.b,n,i).libs.length)bad=true;ok(!bad,'satunnaispeli '+k+': laudalla ryhmä ilman vapauksia')}
if(virheet){console.log(virheet+' virhettä');process.exit(1)}
