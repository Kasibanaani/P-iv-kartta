// Jonon harjoitukset selaimessa: Typerä kynä, Ratkaistava vai elettävä, Koanikone, Hiljaisuus, Tarkkailijan jäljillä, Meditoija.
// Jokainen mahtuu ruutuun (paitsi Tarkkailija, joka vierii kuten Minä). Tekstejä ei tallenneta. 390 ja 320 px.
'use strict';
const {chromium}=require('playwright');const path=require('path');
const U='file://'+path.resolve(__dirname,'..','index.html');
const fails=[];function chk(l,c,x){console.log((c?'ok   ':'FAIL ')+l+(c||x===undefined?'':' | '+JSON.stringify(x)));if(!c)fails.push(l);}
const shot=n=>path.join(__dirname,'tulosteet',n);
const NOSCROLL=sel=>`(()=>{const s=document.querySelector('${sel}');return {sec:s.scrollHeight<=s.clientHeight+1,doc:document.documentElement.scrollHeight<=innerHeight+1}})()`;
async function run(b,w,h){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true}),pg=await ctx.newPage(),errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(U);await pg.waitForTimeout(300);
  await pg.evaluate(()=>{window.T=100;__hm.setClock(()=>T);__hm.setPauseScale(0.002)});
  const D=()=>pg.evaluate(()=>__hm.data().muut),store=()=>pg.evaluate(()=>localStorage.getItem('headmaze:v1'));
  const back=async v=>{await pg.click('#p-'+v+' [data-back]');await pg.waitForTimeout(60);};
  const open=async v=>{await pg.click('#go-'+v);await pg.waitForTimeout(120);};
  async function holdBtn(sel,t0,t1){const bb=await pg.locator(sel).boundingBox();await pg.evaluate(t=>{T=t},t0);await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.waitForTimeout(40);await pg.evaluate(t=>{T=t},t1);await pg.mouse.up();await pg.waitForTimeout(60);}

  // Typerä kynä
  await open('kyna');
  await pg.click('#kn-ok');chk(w+' kynä: tyhjä ei lähde',await pg.isVisible('#kn-a'));
  await pg.fill('#kn-txt','Kaikki on taas myöhässä');await pg.click('#kn-ok');
  chk(w+' kynä: kääritty kerran',(await pg.innerText('#kn-out'))==='Huomaan ajattelevani, että kaikki on taas myöhässä.');
  chk(w+' kynä: aurinko ja pilvi lähtevät yläreunasta, otsikkorivi piiloon',!await pg.isVisible('header')&&await pg.isVisible('#crew'));
  await pg.waitForTimeout(80);
  const crew=await pg.evaluate(()=>{const c=document.getElementById('crew').getBoundingClientRect(),a=document.getElementById('kn-act').getBoundingClientRect();return {near:a.top-c.bottom<30&&a.top-c.bottom>-5,landed:document.getElementById('crew').className,ct:c.top,cb:c.bottom,at:a.top}});
  chk(w+' kynä: laskeutuivat napin yläpuolelle',crew.near,crew);
  for(let i=0;i<7;i++)await pg.click('#kn-more');
  chk(w+' kynä: kahdeksan kerrosta, ohje kertoo kerroksen ja painamisen',(await pg.innerText('#kn-out')).split('huomaan ajattelevani').length===8&&(await pg.innerText('#kn-note')).startsWith('Kerros 8.'));
  chk(w+' kynä: nappi Ajattelen vieläkin',(await pg.innerText('#kn-more'))==='Ajattelen vieläkin');
  const said=await pg.innerText('#crew-say');
  chk(w+' kynä: kupla on napin vieressä ja puhuu kynän repliikkejä',said.length>5&&(await pg.innerText('#say'))!==said);
  for(let i=0;i<60;i++)await pg.click('#kn-more');
  const fit=await pg.evaluate(()=>{const b=document.getElementById('kn-b'),a=document.getElementById('kn-act').getBoundingClientRect();return {fs:parseFloat(b.style.fontSize),inner:b.scrollHeight>b.clientHeight,btnIn:a.bottom<=document.querySelector('nav').getBoundingClientRect().top+1}});
  let ns=await pg.evaluate(NOSCROLL('#p-kyna'));
  chk(w+' kynä: 68 kerrosta – fontti pieneni 11 px:iin, sivu ei vieri, napit näkyvät',fit.fs===11&&ns.sec&&ns.doc&&fit.btnIn,[fit,ns]);
  await pg.screenshot({path:shot('hj'+w+'_1_kyna.png')});
  let m=await D();chk(w+' kynä: laskuri 1, syvin 68, tekstiä ei tallennettu',m.kyna===1&&m.kynaSyvin===68&&!(await store()).includes('myöhässä'),m);
  await back('kyna');chk(w+' kynä: poistuttaessa otsikkorivi palaa',await pg.isVisible('header'));

  // Ratkaistava vai elettävä
  await open('ratk');
  ns=await pg.evaluate(NOSCROLL('#p-ratk'));chk(w+' huoli mahtuu ruutuun',ns.sec&&ns.doc,ns);
  await pg.screenshot({path:shot('hj'+w+'_2_huoli.png')});
  await pg.click('[data-r="ratk"]');chk(w+' huoli: tyhjä ei etene',await pg.isVisible('#rk-a'));
  await pg.fill('#rk-txt','ehdinkö hoitaa laskut');await pg.click('[data-r="ratk"]');
  chk(w+' ratkaistava: kysyy yhtä askelta',(await pg.innerText('#rk-msg')).includes('pieni seuraava askel')&&await pg.isVisible('#rk-step'));
  await pg.fill('#rk-step','avaan pankin huomenna');await pg.click('#rk-ok');
  chk(w+' ratkaistava: valmis, uusi huoli -nappi',await pg.isVisible('#rk-new')&&(await D()).ratk===1);
  await pg.click('#rk-new');await pg.fill('#rk-txt','maailman tila');await pg.click('[data-r="en"]');
  chk(w+' en tiedä → elettävä, pidä pohjassa',(await pg.innerText('#rk-msg')).startsWith('Jos et tiedä')&&await pg.isVisible('#rk-hold'));
  ns=await pg.evaluate(NOSCROLL('#p-ratk'));chk(w+' elettävä mahtuu ruutuun',ns.sec&&ns.doc,ns);
  const p0=await pg.evaluate(()=>__hm.data().puhallus);
  await holdBtn('#rk-hold',200,207.5);
  chk(w+' elettävä: ”Se on edelleen tässä”, puhallus kertyi 7,5 s',(await pg.innerText('#rk-msg')).startsWith('Se on edelleen tässä. Ja niin olet sinäkin.')&&(await pg.evaluate(()=>__hm.data().puhallus))-p0===7.5&&(await D()).elett===1);
  await pg.screenshot({path:shot('hj'+w+'_3_elettava.png')});
  chk(w+' huoli: tekstejä ei tallennettu',!/laskut|pankin|maailman/.test(await store()));
  await back('ratk');

  // Koanikone
  await open('koani');
  chk(w+' koanikone: ei keskitekstiä eikä muita nappeja, aurinko ja pilvi laskeutuvat ilman tyhjää kuplaa',!(await pg.locator('#ko-txt,#ko-en,#ko-next').count())&&await pg.isVisible('#crew')&&!await pg.isVisible('header')&&await pg.evaluate(()=>{const c=document.getElementById('crew'),cl=c.className;c.className='fly';const v=getComputedStyle(document.getElementById('crew-say')).visibility;c.className=cl;return v})==='hidden');
  await pg.waitForTimeout(150);
  const jab=await pg.innerText('#crew-say');chk(w+' koanikone: laskeuduttuaan piikki',jab.length>10,jab);
  await pg.waitForTimeout(400);
  const k1=await pg.innerText('#crew-say');chk(w+' koanikone: sitten kupla sanoo koanin',k1!==jab&&k1.length>5,k1);
  ns=await pg.evaluate(NOSCROLL('#p-koani'));chk(w+' koanikone mahtuu ruutuun',ns.sec&&ns.doc,ns);
  const longest=require(path.resolve(__dirname,'hm.js')).KOANIT.reduce((a,x)=>x.length>a.length?x:a,'');
  const kfit=await pg.evaluate(t=>{const b=document.getElementById('crew-say'),old=b.textContent;b.textContent=t;const r=document.getElementById('crew').getBoundingClientRect(),h=document.getElementById('ko-hold').getBoundingClientRect(),tb=document.querySelector('#p-koani .topbar').getBoundingClientRect(),ok=r.bottom<=h.top+1&&r.top>=tb.bottom-1;b.textContent=old;return ok},longest);
  chk(w+' pisinkin koani mahtuu kuplaan napin yläpuolelle',kfit,longest);
  await holdBtn('#ko-hold',300,312);chk(w+' koani: 12 s → 12 / 20 s, ei vielä Seuraava',(await pg.innerText('#ko-hold')).includes('12 / 20 s'));
  await pg.screenshot({path:shot('hj'+w+'_4_koani.png')});
  await holdBtn('#ko-hold',320,328.5);chk(w+' koani: yhteensä 20,5 s → nappi Seuraava',(await pg.innerText('#ko-hold')).startsWith('Seuraava'));
  const pz=await pg.evaluate(()=>__hm.data().puhallus);
  await pg.click('#ko-hold');await pg.waitForTimeout(60);
  chk(w+' Seuraava: uusi koani kuplaan, nappi taas 0 / 20 s',(await pg.innerText('#crew-say'))!==k1&&(await D()).koani===2&&(await pg.innerText('#ko-hold')).includes('0 / 20 s'));
  await back('koani');chk(w+' koanikone: poistuttaessa otsikkorivi palaa',await pg.isVisible('header'));

  // Hiljaisuus
  await open('hilj');
  await pg.evaluate(()=>{T=1000});await pg.click('#hl-start');
  chk(w+' hiljaisuus alkaa: Huomasin-nappi, 1:00',await pg.isVisible('#hl-huom')&&(await pg.innerText('#hl-time'))==='1:00');
  await pg.click('#hl-huom');await pg.click('#hl-huom');await pg.click('#hl-huom');
  await pg.evaluate(()=>{T=1030});await pg.waitForTimeout(100);
  chk(w+' puolivälissä 0:30, aurinko on jo keskeyttänyt',(await pg.innerText('#hl-time'))==='0:30'&&(await pg.innerText('#hl-n'))==='3');
  ns=await pg.evaluate(NOSCROLL('#p-hilj'));chk(w+' hiljaisuus mahtuu ruutuun',ns.sec&&ns.doc,ns);
  await pg.screenshot({path:shot('hj'+w+'_5_hiljaisuus.png')});
  await pg.evaluate(()=>{T=1061});await pg.waitForTimeout(100);
  const hn=await pg.innerText('#hl-note');
  chk(w+' minuutti ohi: yhteenveto, huomattu 3',hn==='Minuutti on ohi. Huomasit mielesi puhuvan 3 kertaa.'&&(await D()).hilj===1&&(await D()).huom===3,hn);
  await back('hilj');

  // Tarkkailijan jäljillä
  await open('tark');
  chk(w+' tarkkailija alkaa',(await pg.locator('#tk-steps .step').count())===1);
  for(let i=0;i<20;i++){
    const L=pg.locator('#tk-steps .step:last-child');await pg.waitForTimeout(60);
    if(await L.locator('[data-again]').count())break;
    if(await L.locator('.chip').count())await L.locator('.chip').first().click();
    else await L.locator('[data-go]').click();
  }
  await pg.waitForTimeout(300);
  chk(w+' tarkkailija loppuun, laskuri 1, Minä koskematon',(await pg.locator('#tk-steps .step').count())===10&&(await D()).tark===1&&(await pg.locator('#steps .step').count())===0);
  await pg.screenshot({path:shot('hj'+w+'_6_tarkkailija.png')});
  await back('tark');

  // Meditoija
  await pg.evaluate(()=>{__hm.setPauseScale(1);T=5000});
  await open('medit');
  chk(w+' meditoija: ajatuskupla heti',(await pg.locator('.bub').count())===1&&(await pg.locator('.bub').innerText()).length>2);
  await pg.waitForTimeout(4200);
  const nb=await pg.locator('.bub').count();chk(w+' toinen kupla 2,5–4 s päästä, korkeintaan 3',nb>=2&&nb<=3,nb);
  ns=await pg.evaluate(NOSCROLL('#p-medit'));chk(w+' meditoija mahtuu ruutuun',ns.sec&&ns.doc,ns);
  const geo=await pg.evaluate(()=>{const s=document.getElementById('md-svg').getBoundingClientRect(),c=document.getElementById('md-scene').getBoundingClientRect();return {svgIn:s.bottom<=c.bottom+1&&s.top>=c.top&&s.height>120,bubsIn:[...document.querySelectorAll('.bub')].every(b=>{const r=b.getBoundingClientRect();return r.left>=c.left-1&&r.right<=c.right+1&&r.top>=c.top-1})}});
  chk(w+' meditoija ja kuplat näkymän sisällä',geo.svgIn&&geo.bubsIn,geo);
  await pg.screenshot({path:shot('hj'+w+'_7_meditoija.png')});
  await pg.evaluate(()=>{T=5090});await back('medit');
  m=await D();chk(w+' meditoijan aika tallentui 90 s',m.medit===1&&m.meditSek===90,m);
  await pg.evaluate(()=>{__hm.setPauseScale(0.002)});

  // Tilastot
  await open('tilastot');await pg.screenshot({path:shot('hj'+w+'_8_tilastot.png'),fullPage:true});
  chk(w+' tilastoissa uudet laskurit',(await pg.innerText('#tiles')).includes('minuuttia meditoijan seurassa')&&(await pg.innerText('#tiles')).includes('1 / 1'));
  // tallennus säilyy uudelleenlatauksessa
  await pg.reload();await pg.waitForTimeout(200);
  m=await D();chk(w+' laskurit säilyvät latauksen yli',m.kyna===1&&m.elett===1&&m.hilj===1&&m.tark===1&&m.medit===1,m);
  await ctx.close();return errs;
}
(async()=>{const b=await chromium.launch();let e=await run(b,390,760);e=e.concat(await run(b,320,568));
  chk('ei JS-virheitä',!e.length,e);await b.close();console.log(fails.length?'VIRHEITÄ':'KAIKKI OK');process.exit(fails.length?1:0);})();
