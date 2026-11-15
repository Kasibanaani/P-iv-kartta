// Kosketuspolku tietokoneen Chromiumissa: puhelin 390×844 ja 320×568, iPad 820×1180 ja 1180×820.
// Asettelu, napautussiirto, vapaudet, itsemurhan esto, peru, Kaappaus-Go-voitto, Go:n passit ja laskenta,
// uusi peli valintaikkunasta (tasoitus), ulkoasut, tallennus.
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tapPt(pg,i){const [x,y]=await pg.evaluate(i=>GOUI.ptClient(i),i);await pg.touchscreen.tap(x,y);await wait(60)}
async function tapEl(pg,sel){await pg.locator(sel).first().scrollIntoViewIfNeeded();const b=await pg.locator(sel).first().boundingBox();if(!b)throw new Error('ei näy: '+sel);await pg.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await wait(120)}
const st=pg=>pg.evaluate(()=>({moves:GOUI.D.peli.moves.slice(),phase:GOUI.D.peli.phase,turn:GOUI.S.turn,dead:GOUI.D.peli.dead.length,stones:document.querySelectorAll('#board .stones .st:not(.leave)').length}));
(async()=>{const br=await chromium.launch();
for(const [w,h] of [[390,844],[320,568],[820,1180],[1180,820]]){
  const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<500});const pg=await ctx.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));await pg.goto(URL);await wait(300);const L=w+'×'+h;
  // ensimmäinen avaus: Kaappaus-Go 9×9
  let s=await st(pg);ok(s.moves.length===0&&await pg.evaluate(()=>GOUI.D.peli.cfg.mode)==='kaappaus','oletus on Kaappaus-Go');
  // asettelu
  const lay=await pg.evaluate(()=>{const b=document.getElementById('board').getBoundingClientRect(),a=document.getElementById('actions').getBoundingClientRect(),p=document.getElementById('p2').getBoundingClientRect();
    return {sw:document.documentElement.scrollWidth,w:innerWidth,h:innerHeight,b:[b.left,b.top,b.right,b.bottom],a:a.bottom,p:p.top,bs:b.width}});
  ok(lay.sw<=lay.w&&lay.b[0]>=0&&lay.b[2]<=lay.w&&lay.b[3]<=lay.h&&lay.a<=lay.h&&lay.p>=0,`${L}: lauta ja napit mahtuvat ${JSON.stringify(lay)}`);
  ok(lay.bs>=Math.min(w,h)*0.6,`${L}: lauta on riittävän iso (${lay.bs}px)`);
  // 7×7 Go ilman komia testeihin
  await pg.evaluate(()=>GOUI.newGame({n:5,mode:'go',komi:0.5}));
  // napautus asettaa kiven
  await tapPt(pg,12);s=await st(pg);ok(s.moves[0]===12&&s.stones===1&&s.turn===2,`${L}: napautus asettaa kiven keskelle`);
  // napautus kiveen näyttää vapaudet
  await tapPt(pg,12);ok((await pg.locator('#board .lp').count())===4,`${L}: kiven napautus näyttää 4 vapautta`);
  ok((await pg.textContent('#toast')).includes('4 vapautta'),`${L}: vapauksien määrä tekstinä`);
  s=await st(pg);ok(s.moves.length===1,`${L}: kiveen napautus ei ole siirto`);
  // itsemurha: valkea 1, musta 5... asema: musta 1 ja 5, valkea yrittää kulmaan 0
  await pg.evaluate(()=>GOUI.newGame({n:5,mode:'go'}));
  for(const i of [1,20,5])await tapPt(pg,i);
  await tapPt(pg,0);s=await st(pg);ok(s.moves.length===3,`${L}: itsemurha estetään`);
  ok((await pg.textContent('#toast')).includes('Itsemurha'),`${L}: itsemurhasta kerrotaan`);
  // atari-vihje: valkea kivi 24, musta 23 → valkealla vapaus 19
  await pg.evaluate(()=>GOUI.newGame({n:5,mode:'go'}));for(const i of [23,24])await tapPt(pg,i);
  ok(await pg.evaluate(()=>GOUI.disp[24].el.classList.contains('atari')),`${L}: atarissa oleva kivi merkitään`);
  ok((await pg.locator('#board .lib').count())===1,`${L}: atarin viimeinen vapaus merkitään`);
  // peru
  await tapEl(pg,'#b-undo');s=await st(pg);ok(s.moves.length===1&&s.stones===1&&s.turn===2,`${L}: peru poistaa viimeisen kiven`);
  // Kaappaus-Go: voitto ja tulosikkuna
  await pg.evaluate(()=>GOUI.newGame({n:5,mode:'kaappaus',target:1}));for(const i of [1,0,5])await tapPt(pg,i);
  await wait(900);s=await st(pg);ok(s.phase==='ohi',`${L}: kaappaus päättää pelin`);
  ok(await pg.isVisible('#dlg-res')&&(await pg.textContent('#restitle')).includes('voitti'),`${L}: voittajaikkuna`);
  await tapEl(pg,'#r-again');s=await st(pg);ok(s.moves.length===0&&s.phase==='peli'&&!(await pg.isVisible('#dlg-res')),`${L}: uusi peli samoilla asetuksilla`);
  // Go: passit, kuollut kivi, tulos
  await pg.evaluate(()=>GOUI.newGame({n:5,mode:'go',komi:0.5}));
  for(const i of [2,3,7,8,12,13,17,18,22,23,1,0])await tapPt(pg,i);  // muurit ja valkean kivi mustan alueella
  await tapEl(pg,'#b-pass');await tapEl(pg,'#b-pass');s=await st(pg);ok(s.phase==='laske',`${L}: kaksi passia = laskenta ${s.phase}`);
  await tapPt(pg,0);s=await st(pg);ok(s.dead===1,`${L}: kuollut kivi merkitään napauttamalla`);
  ok((await pg.textContent('#p1')).includes('Pisteet 15'),`${L}: mustan pisteet näkyvät laskennassa`);
  await tapEl(pg,'#b-finish');await wait(200);ok((await pg.textContent('#restitle')).includes('4,5'),`${L}: tulos 4,5 pistettä: `+await pg.textContent('#restitle'));
  await pg.evaluate(()=>document.getElementById('dlg-res').close());
  // tallennus säilyy
  await pg.reload();await wait(300);s=await st(pg);ok(s.phase==='ohi'&&s.dead===1&&s.moves.length===14,`${L}: peli säilyy uudelleenavauksessa ${JSON.stringify(s)}`);
  // uusi peli valintaikkunasta: Go 7×7, tasoitus 2
  await tapEl(pg,'#b-new');ok(await pg.isVisible('#dlg-new'),`${L}: uuden pelin ikkuna`);
  await tapEl(pg,'#s-mode [data-v=go]');await tapEl(pg,'#s-n [data-v="7"]');await tapEl(pg,'#s-h [data-v="2"]');await tapEl(pg,'#b-start');
  s=await st(pg);const c=await pg.evaluate(()=>GOUI.D.peli.cfg);ok(c.n===7&&c.mode==='go'&&c.handicap===2&&s.stones===2&&s.turn===2,`${L}: Go 7×7 tasoituksella 2 ${JSON.stringify(c)}`);
  // ulkoasut
  await tapEl(pg,'#b-look');ok((await pg.locator('#looks .look').count())===5,`${L}: viisi ulkoasua`);
  for(const id of ['sumi','leikki','kosmos','riso','kaya']){await tapEl(pg,`#looks .look[data-id=${id}]`);
    const r=await pg.evaluate(()=>({cls:document.body.className,n:document.querySelectorAll('#board .stones .st').length}));ok(r.cls.includes('t-'+id)&&r.n===2,`${L}: ulkoasu ${id} ${JSON.stringify(r)}`)}
  await pg.evaluate(()=>document.getElementById('dlg-look').close());
  // pelaa jokaisella ulkoasulla siirto ja kaappaus (animaatiot, ei virheitä)
  for(const id of ['kaya','sumi','leikki','kosmos','riso']){await pg.evaluate(id=>{GOUI.setTheme(id);GOUI.newGame({n:5,mode:'kaappaus',target:3})},id);
    for(const i of [1,0,5,12])await tapPt(pg,i);s=await st(pg);ok(s.moves.length===4,`${L}: ${id}: siirrot ja kaappaus`)}
  await wait(900);
  ok(errs.length===0,`${L}: sivuvirheet ${errs.join(' | ')}`);
  await ctx.close()}
await br.close();if(virheet){console.log(virheet+' virhettä');process.exit(1)}})();
