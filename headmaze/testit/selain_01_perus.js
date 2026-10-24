// Käy appin läpi puhelinleveydellä: välilehdet, uloshengitys oikeilla painalluksilla (kello siirretään testikoukulla) ja yhden ruudun asettelu,
// palkki elää käytön mukaan, tilastot ja varmuuskopio, puhekuplan väkänen, Minä-polku loppuun, Sokkelo-peli tatilla. 390 ja 320 px.
'use strict';
const {chromium}=require('playwright');const path=require('path');
const U='file://'+path.resolve(__dirname,'..','index.html');
const fails=[];function chk(l,c,x){console.log((c?'ok   ':'FAIL ')+l+(c||x===undefined?'':' | '+JSON.stringify(x)));if(!c)fails.push(l);}
const shot=n=>path.join(__dirname,'tulosteet',n);
const NOSCROLL=sel=>`(()=>{const s=document.querySelector('${sel}'),n=document.querySelector('nav').getBoundingClientRect();return {sec:s.scrollHeight<=s.clientHeight+1,doc:document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth,navBottom:Math.round(n.bottom)===innerHeight}})()`;
async function run(b,w,h,full){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true}),pg=await ctx.newPage(),errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(U);await pg.waitForTimeout(300);
  await pg.evaluate(()=>{window.T=100;__hm.setClock(()=>T);__hm.setPauseScale(0.002)});
  chk(w+': välilehdet Minä · Harjoitukset · Sokkelo, Harjoitukset auki',(await pg.locator('nav button').allInnerTexts()).join()==='Minä,Harjoitukset,Sokkelo'&&await pg.getAttribute('nav [data-tab="harj"]','aria-selected')==='true');
  await pg.screenshot({path:shot('hm'+w+'_0_harjoitukset.png')});
  await pg.click('#go-ulos');await pg.waitForTimeout(150);
  await pg.screenshot({path:shot('hm'+w+'_1_ulos.png')});
  let ns=await pg.evaluate(NOSCROLL('#p-ulos'));
  if(w<h)chk(w+': uloshengitys mahtuu ruutuun, alapalkki kiinni alareunassa',ns.sec&&ns.doc&&ns.navBottom,ns);  // vaakataso vain pelille
  chk(w+': napissa lukee Aloita painamalla tästä',(await pg.innerText('#hold')).startsWith('Aloita painamalla tästä'));
  chk(w+': palkki alkaa 10 sekunnista',(await pg.innerText('#tgt'))==='palkki 10,0 s');
  const hb=await pg.locator('#hold').boundingBox();
  if(w<h)chk(w+': nappi alhaalla (alaosa alle 90 px alapalkin yläpuolella)',(await pg.evaluate(()=>document.querySelector('nav').getBoundingClientRect().top))-(hb.y+hb.height)<90);
  const cx=hb.x+hb.width/2,cy=hb.y+hb.height/2;
  async function breath(d,u,s){await pg.evaluate(t=>{T=t},d);await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.waitForTimeout(50);
    await pg.evaluate(t=>{T=t},u);await pg.waitForTimeout(80);if(s)await pg.screenshot({path:shot(s)});await pg.mouse.up();await pg.waitForTimeout(40);}
  chk('Valmis piilossa ennen ensimmäistä painallusta',!await pg.isVisible('#done'));
  if(full){
    await breath(110,121,'hm_2_palkki_taynna.png');
    chk('palkki täyttyi',await pg.evaluate(()=>document.getElementById('barfill').style.width)==='100%');
    chk('painalluksen jälkeen napissa Pidä pohjassa',(await pg.innerText('#hold')).startsWith('Pidä pohjassa'));
    await breath(123,134);await breath(135,139);
    chk('lyhyt uloshengitys: palkki jää vajaaksi',await pg.getAttribute('#bar','class')==='short');
    await breath(141,153);
    await pg.evaluate(()=>{T=500});
    await pg.click('#done');await pg.waitForTimeout(150);await pg.screenshot({path:shot('hm_3_tulos.png')});
    const d=await pg.evaluate(()=>__hm.data()),s=d.sessions[0];
    chk('tallentui: ulos, irti, kesto 110→153',JSON.stringify([s.out,s.inn,s.dur])==='[[11,11,4,12],[2,1,2],43]',s);
    chk('palkki hakee heti keskiarvon tasolle: 10 → 9,5 × 1,05 = 10,0',d.target===10,d.target);
    chk('tulos näkyy ylhäällä, suhde 38/5 = 7,60',await pg.innerText('#sum .big')==='7,60');
    ns=await pg.evaluate(NOSCROLL('#p-ulos'));chk('tuloksen kanssakin mahtuu ruutuun',ns.sec&&ns.doc,ns);
    chk('napissa taas Aloita painamalla tästä',(await pg.innerText('#hold')).startsWith('Aloita painamalla tästä'));
    // toinen harjoitus pidemmillä uloshengityksillä: palkki nousee heti
    for(const [a,c] of [[200,220],[222,244],[246,266]])await breath(a,c);
    await pg.click('#done');await pg.waitForTimeout(100);
    chk('palkki nousee heti keskiarvoon: 20,7 × 1,05 = 21,7',await pg.evaluate(()=>__hm.data().target)===21.7,await pg.evaluate(()=>__hm.data().target));
    chk('Valmis jää ruudun sisään',await pg.evaluate(()=>{const r=document.getElementById('done').getBoundingClientRect();return r.right<=innerWidth}));
    // puhekupla
    const tails=await pg.evaluate(()=>{const r=new Set();for(let i=0;i<40;i++){__hm.say('idle');r.add(document.getElementById('say').classList.contains('c'));}return [...r]});
    chk('puhekuplan väkänen vaihtuu pilven puolelle, kun pilvi puhuu',tails.length===2,tails);
    // tilastot
    await pg.click('nav [data-tab="harj"]');await pg.click('#go-tilastot');await pg.waitForTimeout(100);await pg.screenshot({path:shot('hm_4_tilastot.png'),fullPage:true});
    const tiles=await pg.innerText('#tiles');chk('tilastot: 2 harjoitusta, palkkia ei voi säätää käsin',tiles.trim().startsWith('2')&&await pg.locator('#tminus,#tplus').count()===0,tiles);
    chk('tallennus kerrottu',(await pg.innerText('#p-tilastot')).includes('Kaikki tallentuu tähän puhelimeen'));
    await pg.click('#cpy');const txt=await pg.inputValue('#txt');
    await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(200);
    await pg.click('#go-tilastot');await pg.click('#pst');await pg.fill('#txt',txt);
    pg.once('dialog',dl=>dl.accept());await pg.click('#pst');await pg.waitForTimeout(200);
    chk('varmuuskopio tekstinä takaisin',await pg.evaluate(()=>[__hm.data().sessions.length,__hm.data().target].join())==='2,21.7');
    await pg.reload();await pg.waitForTimeout(200);
    chk('säilyy uudelleenlatauksessa',await pg.evaluate(()=>__hm.data().sessions.length)===2);
    // Harjoitukset-sivu, kasvi ja uudet harjoitukset
    await pg.evaluate(()=>{window.T=900;__hm.setClock(()=>T)});
    await pg.click('nav [data-tab="harj"]');await pg.waitForTimeout(100);await pg.screenshot({path:shot('hm_9_harjoitukset.png'),fullPage:true});
    chk('Harjoitukset: tilastot linkkinä otsikon vieressä, kasvi ja kymmenen harjoitusta',await pg.isVisible('.hrow #go-tilastot')&&await pg.isVisible('#kasvi-svg')&&(await pg.locator('#p-harj button.card').count())===10);
    chk('kasvi on saanut uloshengitykset (11+11+4+12+20+22+20 = 100 s)',(await pg.innerText('#kasvi-txt')).includes('1 min 40 s')&&await pg.evaluate(()=>__hm.data().puhallus)===100,await pg.innerText('#kasvi-txt'));
    // Pilvikyyti
    await pg.click('#go-pilvi');await pg.waitForTimeout(100);
    await pg.click('#pv-ok');chk('Pilvikyyti: tyhjä ajatus ei lähde',await pg.isVisible('#pv-write'));
    await pg.fill('#pv-txt','en ehdi mitään');await pg.click('#pv-ok');await pg.waitForTimeout(100);
    chk('Pilvikyyti: ajatus pilven alla, puhallusnappi alhaalla',(await pg.innerText('#pv-thought'))==='en ehdi mitään'&&await pg.isVisible('#pv-hold'));
    let pb=await pg.locator('#pv-hold').boundingBox();
    await pg.evaluate(()=>{T=1000});await pg.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2);await pg.mouse.down();await pg.waitForTimeout(60);
    await pg.evaluate(()=>{T=1003});await pg.waitForTimeout(120);await pg.screenshot({path:shot('hm_10_pilvi.png')});await pg.mouse.up();
    chk('Pilvikyyti: pilvi liikkui puolet, mutta ei ole vielä perillä',await pg.isVisible('#pv-hold'));
    await pg.evaluate(()=>{T=1010});await pg.mouse.down();await pg.waitForTimeout(60);await pg.evaluate(()=>{T=1014});await pg.waitForTimeout(150);await pg.mouse.up();
    chk('Pilvikyyti: perillä, laskuri 1, ajatusta ei tallennettu, puhallus kertyi',await pg.isVisible('#pv-new')&&await pg.evaluate(()=>__hm.data().pilvi.n)===1&&!(await pg.evaluate(()=>localStorage.getItem('headmaze:v1'))).includes('ehdi')&&await pg.evaluate(()=>__hm.data().puhallus)>=106,await pg.evaluate(()=>__hm.data().puhallus));
    // Lajittelija
    await pg.click('#p-pilvi [data-back]');await pg.click('#go-laji');await pg.waitForTimeout(100);
    ns=await pg.evaluate(NOSCROLL('#p-laji'));chk('Lajittelija mahtuu ruutuun',ns.sec&&ns.doc,ns);
    await pg.evaluate(()=>{T=2000});
    for(const l of ['ajatus','ajatus','tunne','keho','ajatus'])await pg.click('#lj-btns [data-l="'+l+'"]');
    await pg.evaluate(()=>{T=2090});await pg.click('#lj-done');await pg.waitForTimeout(100);await pg.screenshot({path:shot('hm_11_lajittelu.png')});
    const lj=await pg.evaluate(()=>__hm.data().laji[0]);
    chk('Lajittelija: tallentui 3 ajatusta, 1 tunne, 1 keho, 90 s',JSON.stringify(lj.c)==='{"ajatus":3,"tunne":1,"aistimus":0,"keho":1}'&&lj.dur===90,lj);
    chk('Lajittelija: yhteenveto näkyy',(await pg.innerText('#lj-main')).includes('5 havaintoa'));
    // Odotus
    await pg.click('#p-laji [data-back]');await pg.click('#go-odotus');await pg.waitForTimeout(100);
    await pg.evaluate(()=>{T=3000});await pg.click('#od-start');await pg.evaluate(()=>{T=3016});await pg.waitForTimeout(100);
    chk('Odotus: 16 s → 75,0 %',(await pg.innerText('#od-pct'))==='75,0 %',await pg.innerText('#od-pct'));
    await pg.evaluate(()=>{T=3400});await pg.waitForTimeout(100);await pg.screenshot({path:shot('hm_12_odotus.png')});
    chk('Odotus: 400 s → 99,99… %, ei selityksiä',(await pg.innerText('#od-pct')).startsWith('99,9999999')&&(await pg.innerText('#od-note'))==='');
    chk('Odotus: aurinko ja pilvi alhaalla, nappi Päätä harjoitus',await pg.isVisible('#crew')&&!await pg.isVisible('header')&&(await pg.innerText('#od-stop'))==='Päätä harjoitus');
    ns=await pg.evaluate(NOSCROLL('#p-odotus'));chk('Odotus mahtuu ruutuun',ns.sec&&ns.doc,ns);
    const labels=[];for(let i=0;i<9;i++){await pg.click('#od-stop');labels.push(await pg.innerText('#od-stop'));}
    chk('Odotus: nappi vaihtaa tekstiään 9 kertaa, viimeisenä Luovutan, harjoitus jatkuu',labels[8]==='Luovutan'&&new Set(labels).size===9&&await pg.isVisible('#od-stop')&&!labels.slice(0,8).some(l=>/luovu/i.test(l)),labels);
    await pg.screenshot({path:shot('hm_12b_odotus_nappi.png')});
    await pg.click('#od-stop');
    chk('Odotus: vasta Luovutan päättää, tallentuu pisimpänä',await pg.evaluate(()=>__hm.data().odotus.best)===400&&(await pg.innerText('#od-note')).startsWith('Lopetit kohdassa'));
    await pg.click('#p-odotus [data-back]');
    // Minä loppuun
    await pg.evaluate(()=>__hm.setPauseScale(0.002));
    await pg.click('nav [data-tab="mina"]');await pg.waitForTimeout(200);
    chk('Minä alkaa kysymyksellä',(await pg.innerText('#steps')).includes('kuka olet?'));
    await pg.click('[data-go]');chk('tyhjä vastaus ei etene',await pg.locator('.step').count()===1);
    let guard=0,answers=0;
    while(!(await pg.locator('[data-again]').count())&&guard++<80){
      const L=pg.locator('.step:last-child');await pg.waitForTimeout(40);
      if(await L.locator('.ctl[hidden]').count()){await pg.waitForTimeout(60);continue;}
      if(await L.locator('textarea').count()){await L.locator('textarea').fill(answers++?'Joku muu':'Emil');await L.locator('[data-go]').click();continue;}
      if(await L.locator('.chip').count()){const multi=await L.locator('[data-go]').count();const n=await pg.locator('.step').count();await L.locator('.chip').first().click();if(multi&&await pg.locator('.step').count()===n)await pg.locator('.step:last-child [data-go]').click();continue;}
      if(await L.locator('[data-go]').count())await L.locator('[data-go]').click();
    }
    await pg.waitForTimeout(400);await pg.screenshot({path:shot('hm_5_mina.png')});
    const quotes=await pg.locator('.quote').allInnerTexts();
    chk('Minä-polku loppuun asti',await pg.locator('.step').count()===await pg.evaluate(()=>39)||await pg.locator('[data-again]').count()===1,await pg.locator('.step').count());
    chk('vastaukset lainataan takaisin (myös molemmat myöhemmin)',quotes.join('|')==='Emil|Emil|Joku muu',quotes);
    chk('tyhjä profiilikortti',(await pg.innerText('.prof')).includes('—'));
    chk('Minä ei tallenna vastauksia',!(await pg.evaluate(()=>localStorage.getItem('headmaze:v1'))).includes('Emil'));
    await pg.click('[data-again]');chk('Alusta tyhjentää',await pg.locator('.step').count()===1);
  }
  // Sokkelo
  await pg.click('nav [data-tab="peli"]');await pg.waitForTimeout(250);
  await pg.screenshot({path:shot('hm'+w+'_6_sokkelo_alku.png')});
  chk(w+': viisi karttaa, hipat 1–5 ja 6-7 (2 oletuksena), kolme vaikeustasoa (Normaali oletuksena)',(await pg.locator('#maps .chip').count())===5&&(await pg.locator('#nhip .chip').count())===6&&await pg.getAttribute('#nhip [data-nh="2"]','aria-pressed')==='true'&&(await pg.locator('#taso .chip').allInnerTexts()).join()==='Helppo,Normaali,Vaikea'&&await pg.getAttribute('#taso [data-taso="normaali"]','aria-pressed')==='true');
  await pg.click('#start');await pg.waitForTimeout(150);
  const land=w>h;
  if(!land){chk(w+': pystyssä pyydetään kääntämään vaakaan',await pg.isVisible('#o-rot'));await pg.click('#rotok');await pg.waitForTimeout(100);}
  chk(w+': kierroksen aikana ei alapalkkia eikä aurinkoa ja pilveä',!await pg.isVisible('nav')&&!await pg.isVisible('header'));
  const geo=await pg.evaluate(()=>{const z=document.getElementById('zoomw').getBoundingClientRect(),j=document.getElementById('joy').getBoundingClientRect(),m=document.getElementById('minic').getBoundingClientRect(),c=document.getElementById('zoom');
    return {full:Math.round(z.width)===innerWidth&&Math.round(z.height)===innerHeight,joyLeft:j.left>=20&&j.left<100&&innerHeight-j.bottom>=15&&innerHeight-j.bottom<60,mini:m.left<40&&m.top<30&&m.width<=120,noscroll:document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth}});
  chk(w+': peli koko ruudulla, tatti vasemmassa alakulmassa irti kulmasta, pikkukartta vasemmassa yläkulmassa',geo.full&&geo.joyLeft&&geo.mini&&geo.noscroll,geo);
  const tiles=await pg.evaluate(()=>{const c=document.getElementById('zoom'),k=c.width/c.clientWidth;return null});
  const g0=await pg.evaluate(()=>{const G=__hm.game();return [G.p.x,G.p.y,G.S.length]});
  chk(w+': peli alkoi, kaksi hippaa',g0[2]===2);
  const j=await pg.locator('#joy').boundingBox();
  await pg.mouse.move(j.x+j.width/2,j.y+j.height/2);await pg.mouse.down();await pg.mouse.move(j.x+j.width/2+60,j.y+j.height/2,{steps:4});
  await pg.waitForTimeout(600);
  const jv=await pg.evaluate(()=>__hm.joy());
  await pg.screenshot({path:shot('hm'+w+'_7_sokkelo_peli.png')});
  await pg.mouse.up();
  const g1=await pg.evaluate(()=>{const G=__hm.game();return [G.p.x,G.p.y,G.rings.length,G.over]});
  chk(w+': tatti oikealle liikuttaa hahmoa oikealle',jv.x>0.9&&(g1[0]>g0[0]+0.5||g1[3])&&Math.abs(g1[1]-g0[1])<0.2,[jv,g0,g1]);
  const pal=await pg.evaluate(()=>{const G=__hm.game(),e=document.getElementById('ebar').getBoundingClientRect(),m=document.getElementById('minic'),x=m.getContext('2d').getImageData(0,0,m.width,m.height).data;let g=0;for(let i=0;i<x.length;i+=4)if(x[i+1]>150&&x[i]<170&&x[i+2]<110)g++;
    return {n:G.pallot.length,E:G.E,bar:e.width>60&&e.top<40,green:g}});
  chk(w+': kuusi palluraa, palkki ylhäällä keskellä ja laskee, pallurat näkyvät pikkukartassa',pal.n===6&&pal.E<1&&pal.E>0.9&&pal.bar&&pal.green>6,pal);
  const view=await pg.evaluate(()=>__hm.viewTiles());
  chk(w+': ruudulla noin neljäsosa kartasta (300 ruutua ± 10 %)',Math.abs(view-300)<30,view);
  await pg.evaluate(()=>{__hm.stop();const G=__hm.game();G.S[0].x=G.p.x-3;G.S[0].y=G.p.y;G.S[0].dir=0;__hm.stepGame(1/60,{x:0,y:0});});
  await pg.screenshot({path:shot('hm'+w+'_8_valokeila.png')});
  await pg.evaluate(()=>{const G=__hm.game();G.S[0].x=G.p.x+0.3;G.S[0].y=G.p.y;__hm.stepGame(1/60,{x:0,y:0});__hm.over();});
  await pg.waitForTimeout(50);
  chk(w+': kiinni → otsikko Kiinni jäit, pallurat isona',(await pg.innerText('#otitle'))==='Kiinni jäit'&&/^\d+ ●$/.test(await pg.innerText('#otime')));
  await pg.click('#again');await pg.waitForTimeout(80);
  await pg.evaluate(()=>{__hm.stop();const G=__hm.game();const q=G.pallot[0];G.S.forEach(s=>{s.x=-50;s.y=-50});G.p.x=q.x;G.p.y=q.y;__hm.stepGame(1/60,{x:0,y:0});});
  const pk=await pg.evaluate(()=>{const G=__hm.game();return [G.kerätty,G.pallot.length,G.E]});
  chk(w+': pallura kerätään: määrä 1, uusi tilalle, palkki täydentyi',pk[0]===1&&pk[1]===6&&pk[2]>0.99,pk);
  await pg.evaluate(()=>{const G=__hm.game();G.E=0.0001;__hm.stepGame(1/60,{x:0,y:0});__hm.over();});await pg.waitForTimeout(50);
  chk(w+': palkki nollassa → Palkki loppui, ennätys = 1 pallura',(await pg.innerText('#otitle'))==='Palkki loppui'&&(await pg.innerText('#otime'))==='1 ●'&&await pg.evaluate(()=>__hm.data().peli.best['talo:2:normaali'])===1,await pg.evaluate(()=>__hm.data().peli.best));
  await pg.waitForTimeout(10);
  chk(w+': kiinni → ilmoitus ja repliikki, sitten Kartat palauttaa alapalkin',await pg.isVisible('#o-over')&&(await pg.innerText('#oline')).length>3);
  await pg.click('#tomaps');await pg.waitForTimeout(50);
  chk(w+': Kartat: takaisin valikkoon',await pg.isVisible('nav')&&await pg.isVisible('#o-start'));
  await pg.click('nav [data-tab="harj"]');
  await ctx.close();return errs;
}
(async()=>{const b=await chromium.launch();let e=await run(b,390,760,true);e=e.concat(await run(b,320,568,false));e=e.concat(await run(b,844,390,false));e=e.concat(await run(b,568,320,false));
  chk('ei JS-virheitä',!e.length,e);await b.close();console.log(fails.length?'VIRHEITÄ':'KAIKKI OK');process.exit(fails.length?1:0);})();
