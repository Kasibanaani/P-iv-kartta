// Hirviösokkelo selaimessa: pelivalinta Sokkelo-välilehdellä, teleportti, hirviö, loppuruutu ja ennätys. Vaakataso 844 ja 568 px, pystyssä 390 px.
'use strict';
const {chromium}=require('playwright');const path=require('path');
const U='file://'+path.resolve(__dirname,'..','index.html');
const fails=[];function chk(l,c,x){console.log((c?'ok   ':'FAIL ')+l+(c||x===undefined?'':' | '+JSON.stringify(x)));if(!c)fails.push(l);}
const shot=n=>path.join(__dirname,'tulosteet',n);
async function run(b,w,h){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true}),pg=await ctx.newPage(),errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(U);await pg.waitForTimeout(300);
  await pg.click('nav [data-tab="peli"]');await pg.waitForTimeout(250);
  chk(w+': kaksi peliä valittavana, Hipat oletuksena',(await pg.locator('#pelit button').allInnerTexts()).join()==='Hipat,Hirviö'&&await pg.getAttribute('#pelit [data-peli="hippa"]','aria-pressed')==='true');
  await pg.click('#pelit [data-peli="hirvio"]');await pg.waitForTimeout(100);
  chk(w+': Hirviö valittu: kartta-, hippa- ja tasovalinnat piiloon, oma kuvaus, tallentuu',!(await pg.isVisible('#maps'))&&!(await pg.isVisible('#taso'))&&/Hirviö tietää/.test(await pg.innerText('#pdesc'))&&await pg.evaluate(()=>__hm.data().peli.laji)==='hirvio');
  chk(w+': aloitusruutu mahtuu',await pg.evaluate(()=>{const o=document.getElementById('o-start');return o.scrollHeight<=o.clientHeight+1}));
  await pg.screenshot({path:shot('hv'+w+'_1_valinta.png')});
  await pg.click('#start');await pg.waitForTimeout(150);
  if(h>w){await pg.click('#rotok');await pg.waitForTimeout(100);}
  const g=await pg.evaluate(()=>{__hm.stop();const G=__hm.game();return {laji:G.laji,hv:G.hv,tele:G.tele.length,ebar:getComputedStyle(document.getElementById('ebar')).display,joy2:getComputedStyle(document.getElementById('joy2')).display,vt:__hm.viewTiles(),ala:G.M.w*G.M.h}});
  chk(w+': peli alkaa arvotussa sokkelossa, teleporttipari, ei palkkia eikä heittotattia',g.laji==='hirvio'&&g.hv>=0&&g.hv<10&&g.tele===2&&g.ebar==='none'&&g.joy2==='none',g);
  chk(w+': ruudulla noin puolet sokkelosta',g.vt/g.ala>0.4&&g.vt/g.ala<0.56,g);
  await pg.evaluate(()=>{__hm.stepGame(1/60,{x:0,y:0});});
  await pg.screenshot({path:shot('hv'+w+'_2_peli.png')});
  const tp=await pg.evaluate(()=>{const G=__hm.game(),a=G.tele[0],b=G.tele[1];G.p.x=a.x;G.p.y=a.y;__hm.stepGame(1/60,{x:0,y:0});return {k:G.kerätty,ok:Math.hypot(G.p.x-b.x,G.p.y-b.y)<0.01,hud:document.getElementById('hud').textContent}});
  chk(w+': teleporttiin → toiseen päähän, piste näkyy',tp.k===1&&tp.ok&&/1 ◎/.test(tp.hud),tp);
  await pg.evaluate(()=>{for(let i=0;i<20;i++)__hm.stepGame(1/60,{x:0,y:0});});
  await pg.screenshot({path:shot('hv'+w+'_3_teleportti.png')});
  await pg.evaluate(()=>{const G=__hm.game(),s=G.S[0];G.t=5;s.x=G.p.x+0.3;s.y=G.p.y;__hm.stepGame(1/60,{x:0,y:0});__hm.over();});await pg.waitForTimeout(50);
  chk(w+': hirviö saa kiinni → Kiinni jäit, teleportit pisteinä, ennätys tallessa',(await pg.innerText('#otitle'))==='Kiinni jäit'&&(await pg.innerText('#otime'))==='1 ◎'&&/sokkelo \d+/.test(await pg.innerText('#obest'))&&await pg.evaluate(()=>__hm.data().peli.best.hirvio)===1&&await pg.isVisible('#enjaa'),[await pg.innerText('#otitle'),await pg.innerText('#otime'),await pg.innerText('#obest'),await pg.evaluate(()=>__hm.data().peli.best)]);
  await pg.screenshot({path:shot('hv'+w+'_4_loppu.png')});
  await pg.click('#tomaps');await pg.waitForTimeout(80);
  chk(w+': Kartat: valinta muistaa Hirviön ja näyttää ennätyksen',await pg.getAttribute('#pelit [data-peli="hirvio"]','aria-pressed')==='true'&&/Ennätys: 1 teleportti/.test(await pg.innerText('#best')));
  await pg.click('#pelit [data-peli="hippa"]');await pg.waitForTimeout(80);
  chk(w+': takaisin Hippoihin: valinnat näkyvät',await pg.isVisible('#maps')&&await pg.isVisible('#taso')&&/palluroita/.test(await pg.innerText('#pdesc')));
  await ctx.close();return errs;
}
(async()=>{const b=await chromium.launch();let e=await run(b,844,390);e=e.concat(await run(b,568,320));e=e.concat(await run(b,390,760));
  chk('ei JS-virheitä',!e.length,e);await b.close();console.log(fails.length?'VIRHEITÄ':'KAIKKI OK');process.exit(fails.length?1:0);})();
