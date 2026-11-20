// Kosketuspolku tietokoneen Chromiumissa: puhelin 390×844 ja 320×568, vaalea ja tumma.
// Asettelu, värin napautus, paikan valinta ja tyhjennys, tarkistus ja merkit, voitto, tappio, tilastot,
// rivin kopiointi, toistot pois, asetukset, tallennus ja uudelleenavaus, varmuuskopio tekstinä.
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tap(pg,sel,n=0){const l=pg.locator(sel).nth(n);const b=await l.boundingBox();if(!b)throw new Error('ei näy: '+sel);await pg.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await wait(60)}
const color=(pg,c)=>tap(pg,`#palette .col[data-c="${c}"]`);
const G=pg=>pg.evaluate(()=>JSON.parse(JSON.stringify(KUI.D.peli)));
async function fits(pg,L){
  const r=await pg.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect();const b=q('#board'),p=q('#palette'),a=q('#actions'),rows=q('#rows');
    const cur=document.querySelector('.row.cur .slot');const last=[...document.querySelectorAll('.row')].pop().getBoundingClientRect();
    return {sw:document.documentElement.scrollWidth,w:innerWidth,h:innerHeight,bb:b.bottom,pt:p.top,pb:p.bottom,at:a.top,ab:a.bottom,lastb:last.bottom,rowsb:rows.bottom+1,
      slot:cur?[cur.getBoundingClientRect().width,cur.getBoundingClientRect().height]:null,col:p.height,peg:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--peg'))}});
  ok(r.sw<=r.w,`${L}: ei vaakavieritystä`);ok(r.bb<=r.pt&&r.pb<=r.at&&r.ab<=r.h,`${L}: lauta, paletti ja napit mahtuvat ${JSON.stringify(r)}`);
  ok(r.lastb<=r.rowsb,`${L}: kaikki rivit näkyvät`);ok(r.peg>=18,`${L}: nappulat tarpeeksi isoja (${r.peg})`);
  if(r.slot)ok(r.slot[0]>=40&&r.slot[1]>=22,`${L}: paikka napautettava (${r.slot})`);
}
(async()=>{const br=await chromium.launch();
for(const [w,h,scheme] of [[390,844,'light'],[320,568,'dark']]){
  const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,colorScheme:scheme});const pg=await ctx.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));await pg.goto(URL);await wait(250);const L=`${w}×${h} ${scheme}`;
  let g=await G(pg);ok(g.cfg.mode==='klassinen'&&g.cfg.n===4&&g.cfg.k===6&&g.cfg.rows===10&&g.cfg.toisto,`${L}: oletus klassinen 4/6/10 toistoilla`);
  ok(await pg.locator('#palette .col').count()===6&&await pg.locator('.row').count()===10,`${L}: 6 väriä ja 10 riviä`);
  ok(await pg.locator('#secret .peg.hid').count()===4,`${L}: koodi piilossa`);
  await fits(pg,L);
  // täyttö: värit menevät järjestyksessä
  await pg.evaluate(()=>{KUI.D.peli.secret=[0,1,2,3]});
  ok(await pg.locator('#b-check').isDisabled(),`${L}: Tarkista pois käytöstä vajaalla rivillä`);
  await color(pg,1);await color(pg,0);g=await G(pg);ok(JSON.stringify(g.cur)==='[1,0,-1,-1]',`${L}: värit täyttyvät vasemmalta (${g.cur})`);
  // paikan valinta ja tyhjennys
  await tap(pg,'.row.cur .slot',0);g=await G(pg);ok(g.cur[0]===1&&await pg.evaluate(()=>KUI.S.cursor)===0,`${L}: täytetty paikka valitaan napautuksella`);
  await tap(pg,'.row.cur .slot',0);g=await G(pg);ok(g.cur[0]===-1,`${L}: valitun paikan napautus tyhjentää`);
  await color(pg,3);g=await G(pg);ok(g.cur[0]===3,`${L}: väri valittuun paikkaan`);
  await color(pg,5);await color(pg,5);g=await G(pg);ok(JSON.stringify(g.cur)==='[3,0,5,5]',`${L}: rivi täynnä (${g.cur})`);
  ok(!(await pg.locator('#b-check').isDisabled()),`${L}: Tarkista käytössä`);
  await tap(pg,'#b-check');await wait(450);g=await G(pg);
  ok(g.guesses.length===1&&JSON.stringify(g.cur)==='[-1,-1,-1,-1]',`${L}: arvaus kirjautui`);
  ok(await pg.locator('.row[data-r="0"] .fb i.b').count()===0&&await pg.locator('.row[data-r="0"] .fb i.w').count()===2,`${L}: merkit 0 täyttä + 2 rengasta`);
  ok((await pg.textContent('#status')).includes('Rivi 2 / 10'),`${L}: tila näyttää rivin 2`);
  // tyhjennä
  await color(pg,2);await tap(pg,'#b-clear');g=await G(pg);ok(g.cur.every(x=>x<0),`${L}: Tyhjennä`);
  // rivin kopiointi
  await tap(pg,'.row[data-r="0"]');g=await G(pg);ok(JSON.stringify(g.cur)==='[3,0,5,5]',`${L}: aiemman rivin napautus kopioi sen`);
  await tap(pg,'#b-clear');
  // tallennus: uudelleenavaus jatkaa samaa peliä
  await color(pg,4);await pg.reload();await wait(250);g=await G(pg);
  ok(g.guesses.length===1&&g.cur[0]===4&&JSON.stringify(g.secret)==='[0,1,2,3]',`${L}: keskeneräinen peli säilyy uudelleenavauksessa`);
  await tap(pg,'#b-clear');
  // voitto
  for(const c of [0,1,2,3])await color(pg,c);await tap(pg,'#b-check');await wait(1300);
  g=await G(pg);ok(g.done==='voitto',`${L}: oikea koodi voittaa`);
  ok(await pg.evaluate(()=>document.getElementById('d-end').open),`${L}: loppuikkuna aukeaa`);
  ok((await pg.textContent('#end-sub')).includes('rivillä 2'),`${L}: loppuikkuna kertoo rivin`);
  ok(await pg.locator('#secret .peg.hid').count()===0,`${L}: koodi paljastuu`);
  let s=await pg.evaluate(()=>KUI.D.tilastot.klassinen);ok(s.pelit===1&&s.voitot===1&&s.jakauma['2']===1,`${L}: tilasto kirjautui`);
  ok(await pg.locator('#end-dist .now').count()===1,`${L}: jakaumassa nykyinen rivi korostettu`);
  // katso lautaa → Uusi peli -nappi
  await tap(pg,'#d-end [data-close]');ok((await pg.textContent('#b-check'))==='Uusi peli',`${L}: pelin jälkeen nappi on Uusi peli`);
  ok(await pg.locator('#palette .col:disabled').count()===6,`${L}: paletti pois käytöstä pelin jälkeen`);
  await tap(pg,'#b-check');g=await G(pg);ok(!g.done&&g.guesses.length===0,`${L}: uusi peli alkoi`);
  // tappio
  await pg.evaluate(()=>{KUI.D.peli.secret=[5,5,5,5]});
  for(let i=0;i<10;i++){for(let c=0;c<4;c++)await pg.evaluate(()=>KUI.pick(0));await pg.evaluate(()=>KUI.check())}
  await wait(1100);g=await G(pg);ok(g.done==='tappio',`${L}: 10 väärää riviä on tappio`);
  ok((await pg.textContent('#end-title')).includes('Ei tällä kertaa'),`${L}: tappioikkuna`);
  s=await pg.evaluate(()=>KUI.D.tilastot.klassinen);ok(s.pelit===2&&s.voitot===1&&s.putki===0&&s.paras===1,`${L}: tappio tilastoissa`);
  await tap(pg,'#b-again');
  // uusi peli kesken pelin kysyy varmistuksen
  await pg.evaluate(()=>{for(const c of [0,1,2,3])KUI.pick(c);KUI.check()});await wait(300);
  await tap(pg,'#b-new');ok(await pg.evaluate(()=>document.getElementById('d-new').open),`${L}: uusi peli kesken kysyy varmistuksen`);
  await tap(pg,'#d-new [data-close]');g=await G(pg);ok(g.guesses.length===1,`${L}: peruutus säilyttää pelin`);
  await tap(pg,'#b-new');await tap(pg,'#b-newok');g=await G(pg);ok(g.guesses.length===0,`${L}: varmistus aloittaa alusta`);
  ok((await pg.evaluate(()=>KUI.D.tilastot.klassinen.pelit))===2,`${L}: keskeytetty ei mene tilastoihin`);
  // asetukset: Super ja toistot pois (ei arvauksia → vaihtuu heti)
  await tap(pg,'#b-set');ok(await pg.evaluate(()=>document.getElementById('d-set').open),`${L}: asetukset aukeavat`);
  await tap(pg,'#seg-mode button[data-mode="super"]');await tap(pg,'#sw-toisto');await tap(pg,'#d-set [data-close]');await wait(150);
  g=await G(pg);ok(g.cfg.mode==='super'&&g.cfg.n===5&&!g.cfg.toisto&&new Set(g.secret).size===5,`${L}: Super ilman toistoja heti`);
  ok(await pg.locator('#palette .col').count()===8&&await pg.locator('.row').count()===12,`${L}: Superissa 8 väriä ja 12 riviä`);
  await fits(pg,L+' Super');
  // toistot pois: sama väri siirtyy uuteen paikkaan
  await color(pg,2);await color(pg,2);g=await G(pg);ok(JSON.stringify(g.cur)==='[-1,2,-1,-1,-1]',`${L}: ilman toistoja väri siirtyy (${g.cur})`);
  // asetus kesken pelin: tulee voimaan uudessa pelissä
  await pg.evaluate(()=>{KUI.tapSlot(1);for(const c of [0,1,2,3,4])KUI.pick(c);KUI.check()});await wait(200);
  await tap(pg,'#b-set');await tap(pg,'#seg-mode button[data-mode="klassinen"]');
  ok(await pg.locator('#set-note').isVisible(),`${L}: muutos kesken pelin näyttää huomautuksen`);
  g=await G(pg);ok(g.cfg.mode==='super',`${L}: peli ei vaihdu kesken`);
  await tap(pg,'#b-setnew');g=await G(pg);ok(g.cfg.mode==='klassinen'&&!g.cfg.toisto,`${L}: Aloita uusi peli nyt`);
  // merkit ja ulkoasu
  await tap(pg,'#b-set');await tap(pg,'#sw-sym');ok(await pg.evaluate(()=>document.body.classList.contains('sym')),`${L}: merkit päälle`);
  await tap(pg,'#seg-ulko button[data-ulko="'+(scheme==='light'?'dark':'light')+'"]');
  const bg=await pg.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  ok(scheme==='light'?bg==='rgb(25, 25, 25)':bg==='rgb(243, 243, 243)',`${L}: ulkoasun vaihto (${bg})`);
  // varmuuskopio tekstinä
  const txt=await pg.evaluate(()=>KUI.exportText());
  await pg.evaluate(()=>{localStorage.clear()});await pg.reload();await wait(200);
  ok((await pg.evaluate(()=>KUI.D.tilastot.klassinen.pelit))===0,`${L}: tyhjä muisti`);
  await tap(pg,'#b-set');await pg.fill('#t-io',txt);await tap(pg,'#b-paste');
  ok((await pg.evaluate(()=>KUI.D.tilastot.klassinen.pelit))===2&&await pg.evaluate(()=>KUI.D.asetukset.symbolit),`${L}: varmuuskopio luettu tekstistä`);
  await pg.fill('#t-io','{"app":"muu"}');await tap(pg,'#b-paste');ok((await pg.textContent('#toast')).includes('ei ole'),`${L}: väärä teksti hylätään`);
  // taustan napautus sulkee ikkunan
  await pg.touchscreen.tap(w/2,5);await wait(100);ok(!(await pg.evaluate(()=>document.getElementById('d-set').open)),`${L}: taustan napautus sulkee`);
  ok(errs.length===0,`${L}: ei virheitä ${errs}`);
  await ctx.close();
}
await br.close();process.exit(virheet?1:0)})();
