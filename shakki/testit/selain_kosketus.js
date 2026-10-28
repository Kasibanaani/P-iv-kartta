// Kosketuspolku tietokoneen Chromiumissa iPad-kokoisina (1180×820 vaaka, 820×1180 pysty) ja puhelimena 390 px:
// napautussiirto, vetosiirto, botti vastaa, peru, korotus, tehtävä väärin ja oikein, matti kahdella, tallennus, ulkoasu.
const {chromium}=require('playwright');const path=require('path');
const SH=require('./engine.js');
const URL='file://'+path.resolve(__dirname,'../index.html');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tap(pg,x,y){await pg.touchscreen.tap(x,y);await wait(60)}
async function sq(pg,n){return pg.evaluate(n=>SHUI.sqCenter(n),n)}
async function tapSq(pg,n){const [x,y]=await sq(pg,n);await tap(pg,x,y)}
async function dragSq(pg,cdp,a,b){const [x0,y0]=await sq(pg,a),[x1,y1]=await sq(pg,b);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});
  for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/8,y:y0+(y1-y0)*i/8}]});await wait(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(1200)} // ihmisen tahti: heti vedon perään tuleva napautus tulkittaisiin tuplanapautukseksi
const st=pg=>pg.evaluate(()=>({uci:SHUI.D.peli.uci.slice(),think:SHUI.G.think,over:SHUI.G.over,sel:SHUI.sel}));
async function until(pg,f,ms=8000){const t=Date.now();while(Date.now()-t<ms){if(await pg.evaluate(f))return true;await wait(50)}return false}
(async()=>{const br=await chromium.launch();
for(const [w,h] of [[1180,820],[820,1180],[390,844]]){
  const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<500});const pg=await ctx.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));await pg.goto(URL);await wait(300);const cdp=await ctx.newCDPSession(pg);const L=w+'×'+h;
  // ei vaakavieritystä, lauta ja napit näkyvissä
  const lay=await pg.evaluate(()=>{const b=document.getElementById('board').getBoundingClientRect(),n=document.getElementById('b-new').getBoundingClientRect();return {sw:document.documentElement.scrollWidth,w:innerWidth,h:innerHeight,b:[b.left,b.top,b.right,b.bottom],n:n.bottom}});
  ok(lay.sw<=lay.w&&lay.b[0]>=0&&lay.b[2]<=lay.w&&lay.b[3]<=lay.h&&lay.n<=lay.h,`${L}: lauta ja napit mahtuvat ruutuun ${JSON.stringify(lay)}`);
  // tason valinta: helppo botti nopeuttaa testiä
  await pg.evaluate(()=>SHUI.startNew({vastus:'botti',taso:2,oma:'w'}));await wait(100);
  // 1 napautus: e2 → pisteet → e4
  await tapSq(pg,'e2');let s=await st(pg);ok(s.sel===SH.sqOf('e2'),`${L}: napautus valitsee nappulan`);
  ok(await pg.locator('.dotm').count()===2,`${L}: kaksi pistettä e-sotilaalle`);
  await tapSq(pg,'e4');s=await st(pg);ok(s.uci[0]==='e2e4',`${L}: napautussiirto e4 ${s.uci}`);
  ok(await until(pg,()=>SHUI.D.peli.uci.length===2),`${L}: botti vastaa`);
  // 2 veto: g1 → f3
  await dragSq(pg,cdp,'g1','f3');s=await st(pg);ok(s.uci[2]==='g1f3',`${L}: vetosiirto Nf3 ${s.uci}`);
  ok(await until(pg,()=>SHUI.D.peli.uci.length===4),`${L}: botti vastaa toiseen`);
  // laiton veto palaa paikalleen
  await dragSq(pg,cdp,'a2','a6');s=await st(pg);ok(s.uci.length===4,`${L}: laiton veto ei siirrä`);
  // 3 peru: kaksi puolisiirtoa
  await tap(pg,...await pg.evaluate(()=>{const r=document.getElementById('b-undo').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}));
  s=await st(pg);ok(s.uci.length===2&&!s.think,`${L}: peru vie omaan vuoroon ${s.uci}`);
  // 4 tallennus säilyy uudelleenlatauksessa
  await pg.reload();await wait(300);s=await st(pg);ok(s.uci.length===2,`${L}: peli säilyy uudelleenavauksessa`);
  // 5 korotus valintaikkunasta
  // korotusasema tallennuksen kautta
  await pg.evaluate(()=>{localStorage.setItem('shakki.v1',JSON.stringify({app:'shakki',ver:1,peli:{fen0:'4k3/1P6/8/8/8/8/8/4K3 w - - 0 1',uci:[],vastus:'kaveri',taso:3,oma:'w'}}))});
  await pg.reload();await wait(300);
  await tapSq(pg,'b7');await tapSq(pg,'b8');ok(await pg.isVisible('#promo'),`${L}: korotusikkuna aukeaa`);
  ok(await pg.locator('#promobox button').count()===4,`${L}: neljä korotusvaihtoehtoa`);
  const kb=await pg.locator('#promobox button').nth(1).boundingBox();await tap(pg,kb.x+kb.width/2,kb.y+kb.height/2);
  s=await st(pg);ok(s.uci[0]==='b7b8r',`${L}: korotus torniksi ${s.uci}`);
  // 6 tehtävät: väärä siirto perutaan, oikea ratkaisee
  await tap(pg,...await pg.evaluate(()=>{const r=document.getElementById('tab-teht').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}));
  ok(await pg.locator('.pitem').count()>=10,`${L}: tehtävälista näkyy`);
  await pg.locator('.pitem[data-id=takarivi]').scrollIntoViewIfNeeded();const it=await pg.locator('.pitem[data-id=takarivi]').boundingBox();await tap(pg,it.x+it.width/2,it.y+it.height/2);
  ok((await pg.textContent('#t-ohje')).includes('Valkea'),`${L}: tehtävän ohje`);
  await tapSq(pg,'d1');await tapSq(pg,'d5');ok((await pg.textContent('#t-fb')).includes('Ei ihan'),`${L}: väärä siirto huomataan`);
  ok(await until(pg,()=>SHUI.T.p.st.length===0&&!SHUI.T.busy,3000),`${L}: väärä siirto perutaan`);
  await tapSq(pg,'d1');await tapSq(pg,'d8');ok((await pg.textContent('#t-fb')).includes('Matti'),`${L}: oikea ratkaisu`);
  ok(await pg.evaluate(()=>!!SHUI.D.ratk.takarivi),`${L}: ratkaistu merkitään`);
  // 7 matti kahdella: Philidor, puolustaja vastaa, sitten matti; lauta käännetty mustalle? (valkea siirtää → valkea alhaalla)
  await pg.evaluate(()=>SHUI.startTask('philidor'));await wait(50);
  await tapSq(pg,'d5');await tapSq(pg,'g8');ok(await until(pg,()=>SHUI.T.p.st.length===2&&!SHUI.T.busy,3000),`${L}: puolustaja vastaa`);
  await tapSq(pg,'h6');await tapSq(pg,'f7');ok(await pg.evaluate(()=>SHUI.T.done&&!!SHUI.D.ratk.philidor),`${L}: matti kahdella ratkaistu`);
  // mustan tehtävä: lauta käännetään
  await pg.evaluate(()=>SHUI.startTask('narri'));await wait(50);const [hx,hy]=await sq(pg,'h4');const [ax,ay]=await sq(pg,'a1');ok(hy>ay-1e9&&ax>hx,`${L}: mustan tehtävässä lauta käännetty`);
  await tapSq(pg,'d8');await tapSq(pg,'h4');ok(await pg.evaluate(()=>SHUI.T.done),`${L}: mustan matti`);
  // Näytä ratkaisu ei merkitse ratkaistuksi
  await pg.evaluate(()=>SHUI.startTask('legal'));await wait(50);
  await pg.click('#t-show');ok(await until(pg,()=>SHUI.T.p.st.length===2&&!SHUI.T.busy,4000),`${L}: näytä ratkaisu tekee siirron`);
  ok(await pg.evaluate(()=>!SHUI.D.ratk.legal),`${L}: näytetty ei ole ratkaistu`);
  // 8 valikko: teema ja tumma tila
  await pg.click('#b-menu');ok(await pg.isVisible('#sheet'),`${L}: valikko aukeaa`);
  await pg.click('[data-theme=lake]');await pg.click('[data-mode=dark]');
  ok(await pg.evaluate(()=>document.documentElement.getAttribute('data-theme')==='dark'&&JSON.parse(localStorage.getItem('shakki:appearance')).theme==='lake'),`${L}: ulkoasu tallentuu`);
  await pg.click('#m-x');
  ok(errs.length===0,`${L}: ei virheitä sivulla ${errs}`);
  await ctx.close()}
// mattipeli loppuun: valkea tekee narrin matin kaverille
{const ctx=await br.newContext({viewport:{width:1180,height:820},hasTouch:true});const pg=await ctx.newPage();await pg.goto(URL);
  await pg.evaluate(()=>SHUI.startNew({vastus:'kaveri'}));for(const [a,b] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]){await tapSq(pg,a);await tapSq(pg,b)}
  ok(await pg.isVisible('#over')&&(await pg.textContent('#over-t')).includes('Matti'),'pelin loppu näytetään');
  ok((await pg.evaluate(()=>SHUI.pgn())).includes('1. f3 e5 2. g4 Qh4# 0-1'),'PGN-vienti');await ctx.close()}
await br.close();
if(virheet){console.log(virheet+' virhettä');process.exit(1)}})();
