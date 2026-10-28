// Moottorin testit: säännöt (perft), FEN, SAN, pelin loppu, botti ja tehtävien ratkeavuus.
const SH=require('./engine.js');
const fs=require('fs');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
// perft-tunnetut arvot (chessprogramming.org)
const PERFT=[[SH.START,[20,400,8902,197281]],
 ['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',[48,2039,97862]],
 ['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',[14,191,2812,43238]],
 ['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',[6,264,9467]],
 ['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',[44,1486,62379]]];
for(const [f,ex] of PERFT){const p=SH.fromFen(f);ex.forEach((e,i)=>{const n=SH.perft(p,i+1);ok(n===e,`perft ${f} d${i+1}: ${n} ≠ ${e}`)});ok(SH.toFen(p)===f,'FEN säilyy perftin jälkeen '+f)}
ok(SH.fromFen('8/8/8/8/8/8/8/8 w - - 0 1')===null,'FEN ilman kuninkaita hylätään');
ok(SH.fromFen('7k/8/6K1/8/8/8/8/Q7 w - - 0 1')===null,'FEN, jossa vuorossa olematon on shakissa, hylätään');
// SAN ja takaisin
function play(s){const p=SH.fromFen(SH.START);for(const m of s.split(' ')){const mm=SH.fromSan(p,m);if(!mm)throw new Error('SAN '+m);ok(SH.san(p,mm).replace(/[+#]/g,'')===m.replace(/[+#]/g,''),'SAN '+m);SH.make(p,mm)}return p}
let p=play('e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3');
ok(SH.toFen(p)==='r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 b - - 0 9','Ruy Lopezin FEN '+SH.toFen(p));
p=play('f3 e5 g4 Qh4#');ok(SH.status(p)==='matti','narrin matti tunnistetaan');
p=SH.fromFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');ok(SH.status(p)==='patti','patti tunnistetaan');
ok(SH.status(SH.fromFen('8/8/4k3/8/8/3NK3/8/8 w - - 0 1'))==='materiaali','K+R vs K = ei mattia');
ok(SH.status(SH.fromFen('8/8/4k3/8/8/3RK3/8/8 w - - 0 1'))==='','K+T vs K jatkuu');
p=SH.fromFen(SH.START);['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1','f6g8'].forEach(u=>SH.make(p,SH.fromUci(p,u)));ok(SH.status(p)==='toisto','kolminkertainen toisto');
ok(SH.status(SH.fromFen('8/8/4k3/8/8/3RK3/8/8 w - - 100 80'))==='50','50 siirron sääntö');
// ohestalyönti ja korotus SANissa
p=SH.fromFen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');ok(SH.san(p,SH.fromUci(p,'e5d6'))==='exd6','ohestalyönti SAN');
p=SH.fromFen('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1');ok(SH.legal(p).filter(m=>m.pr).length===4,'korotus neljäksi nappulaksi');ok(SH.san(p,SH.fromUci(p,'b7b8q'))==='b8=Q+','korotus SAN shakilla');
// tarkennus: kaksi ratsua samaan ruutuun
p=SH.fromFen('4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1');ok(SH.san(p,SH.fromUci(p,'b1d2'))==='Nbd2','tarkennus linjalla');
// botti: jokainen taso antaa laillisen siirron, ja tasot 3–5 näkevät matin yhdellä siirrolla
const fens=[SH.START,'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4','6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1'];
for(let l=1;l<=5;l++)for(const f of fens){const q=SH.fromFen(f),t=Date.now(),r=SH.botMove(q,l);ok(r&&SH.legal(q).some(m=>SH.same(m,r.m)),`taso ${l} laillinen siirto`);ok(Date.now()-t<4500,`taso ${l} miettii alle 4,5 s (${Date.now()-t} ms)`);
  if(l>=3&&f!==SH.START){q.st=[];SH.make(q,r.m);ok(SH.status(q)==='matti',`taso ${l} löytää matin: ${f}`)}}
{const q=SH.fromFen('3q3k/6pp/8/4N3/8/8/6PP/6K1 w - - 0 1');const r=SH.search(q,{depth:30,ms:800});ok(SH.uci(r.m)==='e5f7','vihjehaku löytää ratsuhaarukan')}
// puolustaja pelaa pisimmän vastarinnan; Toisen pelaajan lyönnistä tulee materiaalia
{const q=SH.fromFen('4r2k/6pp/7N/3Q4/8/8/6PP/7K w - - 0 1');SH.make(q,SH.fromUci(q,'d5g8'));const d=SH.defend(q,1);ok(d&&SH.uci(d.m)==='e8g8','Philidor: puolustajan ainoa siirto Rxg8')}
// tehtävät: jokainen ratkeaa ilmoitetulla tavalla
const ui=fs.readFileSync('ui.js','utf8');const TEH=eval(ui.match(/var TEHTAVAT=(\[[\s\S]*?\]);\n/)[1]);
ok(TEH.length>=10,'vähintään 10 tehtävää');const ids=new Set();
for(const t of TEH){ok(!ids.has(t.id),'tehtävän id ainutlaatuinen '+t.id);ids.add(t.id);const q=SH.fromFen(t.fen);ok(q,'tehtävän FEN kelpaa '+t.id);if(!q)continue;
  if(t.laji==='matti'){ok(SH.mates(q,t.n),`${t.id}: matti ${t.n} siirrolla löytyy`);ok(t.n===1||!SH.mates(q,t.n-1),`${t.id}: ei lyhyempää mattia`)}
  else{const sc=SH.rootScores(q,4).sort((a,b)=>b.s-a.s);ok(t.ratkaisu.includes(SH.uci(sc[0].m)),`${t.id}: ratkaisu on moottorin paras (${SH.uci(sc[0].m)})`);ok(sc[0].s-sc[1].s>=300,`${t.id}: ratkaisu selvästi muita parempi`)}}
if(virheet){console.log(virheet+' virhettä');process.exit(1)}
