// Käy appin läpi puhelinleveydellä: hengitysharjoitus oikeilla painalluksilla (kello siirretään testikoukulla), palkki, tulos,
// tallennus ja palkin piteneminen, tilastot, varmuuskopio tekstinä, Minä-polku loppuun. Lopuksi 320 px.
'use strict';
const {chromium}=require('playwright');const path=require('path');
const U='file://'+path.resolve(__dirname,'..','index.html');
const fails=[];function chk(l,c,x){console.log((c?'ok   ':'FAIL ')+l+(c||x===undefined?'':' | '+JSON.stringify(x)));if(!c)fails.push(l);}
const shot=n=>path.join(__dirname,'tulosteet',n);
async function run(b,w,h,full){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true}),pg=await ctx.newPage(),errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(U);await pg.waitForTimeout(300);
  await pg.evaluate(()=>{window.T=100;__hm.setClock(()=>T)});
  await pg.screenshot({path:shot('hm'+w+'_1_alku.png')});
  chk(w+': ei vaakavieritystä, nappi mahtuu ruutuun',await pg.evaluate(()=>[document.documentElement.scrollWidth<=innerWidth,document.getElementById('hold').getBoundingClientRect().bottom<=innerHeight].join())==='true,true');
  chk(w+': aurinko puhuu',(await pg.innerText('#say')).length>5);
  if(!full){await ctx.close();return errs;}
  const bx=await pg.locator('#hold').boundingBox(),cx=bx.x+bx.width/2,cy=bx.y+bx.height/2;
  async function breath(d,u,s){await pg.evaluate(t=>{T=t},d);await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.waitForTimeout(50);
    await pg.evaluate(t=>{T=t},u);await pg.waitForTimeout(80);if(s)await pg.screenshot({path:shot(s)});await pg.mouse.up();await pg.waitForTimeout(40);}
  chk('Valmis piilossa ennen ensimmäistä painallusta',!await pg.isVisible('#done'));
  await breath(110,117,'hm_2_palkki_taynna.png');
  chk('palkki täyttyi',await pg.evaluate(()=>document.getElementById('barfill').style.width)==='100%');
  await breath(119,126);await breath(127,129);
  chk('lyhyt uloshengitys: palkki jää vajaaksi',await pg.getAttribute('#bar','class')==='short');
  await breath(131,138);
  chk('laskuri',await pg.innerText('#count')==='Uloshengityksiä 4 · palkki täynnä 3',await pg.innerText('#count'));
  await pg.evaluate(()=>{T=500});   // pitkä odotus ennen Valmista ei vaikuta
  await pg.click('#done');await pg.waitForTimeout(100);await pg.screenshot({path:shot('hm_3_tulos.png'),fullPage:true});
  const d=await pg.evaluate(()=>__hm.data()),s=d.sessions[0];
  chk('tallentui: ulos, irti, kesto 110→138',JSON.stringify([s.out,s.inn,s.dur])==='[[7,7,2,7],[2,1,2],28]',s);
  chk('palkki piteni 6 → 6,3 (3/4 täynnä)',d.target===6.3&&(await pg.innerText('#tgt')).includes('6,3 s'));
  chk('tulos näyttää suhteen 23/5 = 4,60',await pg.innerText('#sum .big')==='4,60');
  chk('selaimen muistissa',await pg.evaluate(()=>JSON.parse(localStorage.getItem('headmaze:v1')).sessions.length)===1);
  await pg.click('nav [data-tab="tilastot"]');await pg.waitForTimeout(100);await pg.screenshot({path:shot('hm_4_tilastot.png'),fullPage:true});
  const tiles=await pg.innerText('#tiles');chk('tilastot: 1 harjoitus, paras suhde',tiles.trim().startsWith('1')&&tiles.includes('4,60'),tiles);
  await pg.click('#tplus');chk('palkki + 0,5',await pg.evaluate(()=>__hm.data().target)===6.8);
  await pg.click('#cpy');const txt=await pg.inputValue('#txt');
  await pg.reload();await pg.waitForTimeout(200);
  chk('säilyy uudelleenlatauksessa',await pg.evaluate(()=>__hm.data().sessions.length)===1);
  await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(200);
  await pg.click('nav [data-tab="tilastot"]');await pg.click('#pst');await pg.fill('#txt',txt);
  pg.once('dialog',dl=>dl.accept());await pg.click('#pst');await pg.waitForTimeout(200);
  chk('varmuuskopio tekstinä takaisin',await pg.evaluate(()=>[__hm.data().sessions.length,__hm.data().target].join())==='1,6.8');
  await pg.click('nav [data-tab="mina"]');await pg.waitForTimeout(200);
  chk('Minä alkaa kysymyksellä',(await pg.innerText('#steps')).includes('kuka olet?'));
  await pg.click('[data-go]');chk('tyhjä vastaus ei etene',await pg.locator('.step').count()===1);
  await pg.fill('.step textarea','Emil');await pg.click('[data-go]');await pg.waitForTimeout(100);
  chk('vastaus lainataan takaisin',await pg.innerText('.quote')==='Emil');
  await pg.click('.step:last-child .chip >> nth=1');await pg.click('.step:last-child .chip >> nth=0');
  chk('monivalinta vaatii valinnan',await pg.isDisabled('.step:last-child [data-go]'));
  await pg.click('.step:last-child .chip >> nth=0');await pg.click('.step:last-child .chip >> nth=3');await pg.click('.step:last-child [data-go]');
  await pg.click('.step:last-child [data-go]');await pg.waitForTimeout(700);
  await pg.screenshot({path:shot('hm_5_mina.png'),fullPage:true});
  chk('polku loppuun: 6 kohtaa','minuutena'.length&&(await pg.innerText('.step:last-child')).includes('minuutena')&&await pg.locator('.step').count()===6);
  chk('Minä ei tallenna vastausta',!(await pg.evaluate(()=>localStorage.getItem('headmaze:v1'))).includes('Emil'));
  await pg.click('[data-again]');chk('Alusta tyhjentää',await pg.locator('.step').count()===1&&await pg.inputValue('.step textarea')==='');
  await ctx.close();return errs;
}
(async()=>{const b=await chromium.launch();let e=await run(b,390,760,true);e=e.concat(await run(b,320,568,false));
  chk('ei JS-virheitä',!e.length,e);await b.close();console.log(fails.length?'VIRHEITÄ':'KAIKKI OK');process.exit(fails.length?1:0);})();
