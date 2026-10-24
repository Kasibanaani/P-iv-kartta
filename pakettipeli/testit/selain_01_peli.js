// Pelaa puhelinleveydellä oikeilla napautuksilla: ohje, tarjouksen hyväksyntä, Uusi reitti (hidastus, nollaus, paikat järjestyksessä, Valmis täydentää),
// isompi auto lainalla, pelin lopetus pikakelauksella, valikko ja teema, varmuuskopio, jatkuminen uudelleenlatauksen jälkeen, konkurssi. Lopuksi 320 px.
'use strict';
const {chromium}=require('playwright');const path=require('path');
const U='file://'+path.resolve(__dirname,'..','index.html');
const fails=[];function chk(l,c,x){console.log((c?'ok   ':'FAIL ')+l+(c||x===undefined?'':' | '+JSON.stringify(x)));if(!c)fails.push(l);}
const shot=n=>path.join(__dirname,'tulosteet',n);
async function run(b,w,h,full){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true}),pg=await ctx.newPage(),errs=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(U);await pg.waitForTimeout(300);
  chk(w+': ohje näkyy ensimmäisellä kerralla',await pg.isVisible('#ovl.on'));
  await pg.click('#dlg button.pri');await pg.waitForTimeout(200);
  chk(w+': ei vaakavieritystä, napit ruudussa',await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.getElementById('bMenu').getBoundingClientRect().bottom<=innerHeight));
  chk(w+': yläpalkin luvut eivät mene päällekkäin',await pg.evaluate(()=>{const r=[...document.querySelectorAll('.st span')].map(e=>e.getBoundingClientRect());return r.every((a,i)=>!r[i+1]||a.right<=r[i+1].left+1);}));
  const cvb=await pg.locator('#cv').boundingBox();
  const tapAt=async(p)=>{await pg.mouse.click(cvb.x+p[0],cvb.y+p[1]);await pg.waitForTimeout(120);};
  await pg.screenshot({path:shot('pp'+w+'_1_alku.png')});
  if(!full){await ctx.close();return errs;}
  // kaksi tarjousta valmiiksi; ensimmäinen hyväksytään napauttamalla
  const ids=await pg.evaluate(()=>{const G=__pp.G;G.orders=[];G.acc=-1e9;const a=__pp.PP.spawn(G),b=__pp.PP.spawn(G);[a,b].forEach(o=>{o.n=1;o.exp=G.t+1e5;});return [a.id,b.id];});
  await pg.waitForTimeout(150);
  const hit=async(id,k)=>pg.evaluate(([id,k])=>{const h=__pp.hits.find(q=>q.o===id&&q.k===k);return [h.x,h.y];},[id,k]);
  await tapAt(await hit(ids[0],'n'));
  chk('tarjouksen napautus hyväksyy ja lisää reitille',await pg.evaluate(id=>__pp.PP.ord(__pp.G,id).state==='hyvaksytty'&&__pp.G.car.route.length===2,ids[0]));
  // Uusi reitti: nollaus, hidastus, paikat järjestyksessä
  await pg.click('#bRoute');await pg.waitForTimeout(150);
  chk('Uusi reitti tyhjentää reitin ja hidastaa',await pg.evaluate(()=>__pp.editing&&__pp.G.car.route.length===0)&&(await pg.innerText('#speedtag'))==='Hidastettu');
  await tapAt(await hit(ids[1],'n'));
  chk('muokatessa tarjouksen napautus hyväksyy ja lisää vain noudon',await pg.evaluate(id=>{const G=__pp.G;return __pp.PP.ord(G,id).state==='hyvaksytty'&&G.car.route.length===1&&G.car.route[0]===__pp.PP.door(G,__pp.PP.ord(G,id).from);},ids[1]));
  const road=await pg.evaluate(()=>{const G=__pp.G,M=G.M;for(let i=0;i<M.road.length;i++)if(M.road[i]&&!__pp.hits.some(h=>{const p=__pp.cxy(i);return Math.hypot(h.x-p[0],h.y-p[1])<h.r+6;}))return __pp.cxy(i);});
  await tapAt(road);
  chk('tien napautus lisää paikan',await pg.evaluate(()=>__pp.G.car.route.length===2));
  await pg.screenshot({path:shot('pp'+w+'_2_reitti.png')});
  await pg.click('#bRoute');await pg.waitForTimeout(150);
  chk('Valmis täydentää puuttuvat hyväksytyt perään',await pg.evaluate(()=>{const G=__pp.G,s=__pp.PP.simulate(G,G.car.route);return !__pp.editing&&G.car.route.length>=4&&!s.load.length&&!s.missing.length;}));
  // isompi auto lainalla
  chk('isompi auto pois käytöstä ilman kassaa',await pg.isDisabled('#bUp'));
  await pg.evaluate(()=>{__pp.G.cash=900;__pp.stats(true);});await pg.click('#bUp');await pg.click('#dlg button[data-x="up"]');
  chk('isompi auto: 6 paikkaa, käsiraha pois, kulut ylös',await pg.evaluate(()=>__pp.PP.cap(__pp.G)===6&&Math.round(__pp.G.cash)<=650&&__pp.PP.costs(__pp.G)===38));
  await pg.waitForTimeout(1100);chk('kulut/min yläpalkissa',(await pg.innerText('#sOut'))==='38');
  // lopetus pikakelauksella
  await pg.click('#bEnd');await pg.click('#dlg button[data-x="end"]');await pg.waitForTimeout(150);
  chk('lopetus: pikakelaus ja napit lukossa',await pg.evaluate(()=>__pp.G.ending)&&(await pg.innerText('#speedtag'))==='Pikakelaus 8×'&&await pg.isDisabled('#bRoute'));
  await pg.waitForFunction(()=>__pp.G.final,null,{timeout:40000});await pg.waitForTimeout(300);
  chk('lopputulos näkyy ja molemmat toimitettu',(await pg.innerText('#dlg')).includes('Peli päättyi')&&await pg.evaluate(()=>__pp.G.final.del===2));
  await pg.screenshot({path:shot('pp'+w+'_3_loppu.png')});
  await pg.click('#dlg button[data-x="new2"]');chk('uusi peli',await pg.evaluate(()=>!__pp.G.final&&__pp.G.tier===0));
  // valikko, teema, varmuuskopio
  await pg.click('#bMenu');chk('valikko pysäyttää pelin',await pg.evaluate(()=>{const t=__pp.G.t;return new Promise(r=>setTimeout(()=>r(__pp.G.t===t),300));}));
  chk('ennätys kirjattu',(await pg.innerText('#dlg')).includes('Paras lopputulos'));
  await pg.click('#dlg button[data-t="tumma"]');chk('tumma teema',await pg.evaluate(()=>document.documentElement.dataset.theme==='dark'));
  await pg.click('#dlg button[data-x="txt"]');const txt=await pg.inputValue('#dlg textarea');chk('varmuuskopio tekstinä',JSON.parse(txt).ver===2);
  await pg.click('#dlg button[data-x="close"]');await pg.waitForTimeout(400);await pg.screenshot({path:shot('pp'+w+'_4_tumma.png')});
  const before=await pg.evaluate(()=>{__pp.store();return __pp.G.seed;});
  await pg.reload();await pg.waitForTimeout(400);
  chk('peli jatkuu tallennuksesta, ohjetta ei näytetä uudelleen',await pg.evaluate(()=>__pp.G.seed)===before&&!(await pg.isVisible('#ovl.on')));
  await pg.click('#bMenu');await pg.click('#dlg button[data-x="imptxt"]');await pg.fill('#impt',txt);await pg.click('#dlg button[data-x="impgo"]');
  chk('palautus tekstistä',await pg.evaluate(()=>!document.getElementById('ovl').classList.contains('on')));
  await pg.evaluate(()=>{__pp.G.cash=0.1;});await pg.waitForTimeout(800);
  chk('konkurssi',(await pg.innerText('#dlg')).includes('Konkurssi'));
  await ctx.close();return errs;
}
(async()=>{const b=await chromium.launch();
  // vanhan version (v1) tallennus ei kaada appia, ennätys ja teema siirtyvät
  const c0=await b.newContext({viewport:{width:390,height:844}}),p0=await c0.newPage(),e0=[];p0.on('pageerror',e=>e0.push(String(e)));
  await c0.addInitScript(()=>{localStorage.clear();localStorage.setItem('pakettipeli:v1',JSON.stringify({app:'pakettipeli',ver:1,peli:{seed:5,cars:[]},ennatykset:{kassa:1234},asetukset:{teema:'tumma',ohje:true}}));});
  await p0.goto(U);await p0.waitForTimeout(300);
  chk('v1-tallennus: uusi peli, ennätys ja teema säilyvät',!e0.length&&await p0.evaluate(()=>document.documentElement.dataset.theme==='dark'&&__pp.G&&!__pp.G.cars));
  await c0.close();
  const e1=await run(b,390,844,true),e2=await run(b,320,568,false);
  chk('ei virheitä konsolissa',!e1.length&&!e2.length,e1.concat(e2));
  await b.close();console.log(fails.length?'VIRHEITÄ '+fails.length:'KAIKKI OK');process.exit(fails.length?1:0);})();
