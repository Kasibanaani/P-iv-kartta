// Pelaa puhelinleveydellä oikeilla napautuksilla: ohje, auton valinta, noudon napautus, tiepiste, järjestyksen muutos,
// vastaanotto, auton osto ja myynti, päivän lopetus ja yhteenveto, valikko ja teema, varmuuskopio tekstinä, jatkuminen uudelleenlatauksen jälkeen. Lopuksi 320 px.
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
  chk(w+': ei vaakavieritystä, alapalkki ruudussa',await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.getElementById('bEnd').getBoundingClientRect().bottom<=innerHeight));
  const cvb=await pg.locator('#cv').boundingBox();
  const tapAt=async(x,y)=>{await pg.mouse.click(cvb.x+x,cvb.y+y);await pg.waitForTimeout(120);};
  await pg.screenshot({path:shot('pp'+w+'_1_alku.png')});
  if(!full){chk(w+': yläpalkin luvut eivät mene päällekkäin',await pg.evaluate(()=>{const r=[...document.querySelectorAll('.st span')].map(e=>e.getBoundingClientRect());return r.every((a,i)=>!r[i+1]||a.right<=r[i+1].left+1);}));
    await ctx.close();return errs;}
  // tilaus valmiiksi ja auto valitaan napauttamalla
  const oid=await pg.evaluate(()=>{const G=__pp.G;G.rate=0;const o=__pp.PP.spawn(G);o.ready=G.t;return o.id;});
  await pg.waitForTimeout(100);
  const carP=await pg.evaluate(()=>{const h=__pp.hits.find(q=>q.k==='car');return [h.x,h.y+8];});
  await tapAt(carP[0],carP[1]);
  chk('auton napautus valitsee auton ja hidastaa',await pg.evaluate(()=>__pp.sel===1&&document.getElementById('bot').classList.contains('car')&&document.getElementById('speedtag').textContent==='Hidastettu'));
  const pick=await pg.evaluate(id=>{const h=__pp.hits.find(q=>q.k==='n'&&q.o===id);return [h.x,h.y];},oid);
  await tapAt(pick[0],pick[1]);
  chk('noudon napautus antaa tilauksen autolle',await pg.evaluate(id=>__pp.PP.ord(__pp.G,id).car===1&&__pp.G.cars[0].stops.length===2,oid));
  chk('paneelissa nouto ja vienti',(await pg.locator('#cList .stop').count())===2);
  // tiepiste: napautetaan tieruutua
  const road=await pg.evaluate(()=>{const G=__pp.G,M=G.M;for(let i=0;i<M.road.length;i++)if(M.road[i]&&i!==G.cars[0].c&&!__pp.hits.some(h=>{const p=__pp.cxy(i);return Math.hypot(h.x-p[0],h.y-p[1])<h.r+4;}))return __pp.cxy(i);});
  await tapAt(road[0],road[1]);
  chk('tien napautus lisää tiepisteen',await pg.evaluate(()=>__pp.G.cars[0].stops.map(s=>s.k).join()==='n,v,p'));
  await pg.screenshot({path:shot('pp'+w+'_2_auto.png')});
  await pg.click('#cList .stop:nth-child(3) button[data-a="u"]');
  chk('järjestyksen muutos ▲',await pg.evaluate(()=>__pp.G.cars[0].stops.map(s=>s.k).join()==='n,p,v'));
  await pg.click('#cList .stop:nth-child(2) button[data-a="x"]');
  chk('tiepisteen poisto ✕',await pg.evaluate(()=>__pp.G.cars[0].stops.map(s=>s.k).join()==='n,v'));
  await pg.click('#cDone');
  chk('Valmis poistaa valinnan',await pg.evaluate(()=>__pp.sel===null&&!document.getElementById('bot').classList.contains('car')));
  // vastaanotto
  await pg.click('#rPlus');await pg.click('#rPlus');
  chk('vastaanotto +0,2',await pg.evaluate(()=>Math.abs(__pp.G.rate-0.2)<1e-9)&&(await pg.innerText('#rVal'))==='0,2/min');
  // osto ja myynti
  await pg.evaluate(()=>{__pp.G.cash=2000;__pp.stats(true);});
  await pg.click('#bBuy');chk('auton osto',await pg.evaluate(()=>__pp.G.cars.length===2&&Math.round(__pp.G.cash)<=1500));
  await pg.waitForTimeout(1100);
  chk('kulut/min näyttää kaksi autoa',(await pg.innerText('#sOut'))===String(2*40));
  await pg.click('#bSell');chk('tyhjän auton myynti',await pg.evaluate(()=>__pp.G.cars.length===1));
  // päivän lopetus pikakelauksella
  await pg.click('#bEnd');await pg.click('#dlg button[data-x="end"]');await pg.waitForTimeout(150);
  chk('päivä päättyy: pikakelaus',await pg.evaluate(()=>__pp.G.ending)&&(await pg.innerText('#speedtag'))==='Pikakelaus 8×');
  await pg.waitForFunction(()=>__pp.G.summary,null,{timeout:30000});await pg.waitForTimeout(300);
  chk('yhteenveto näkyy ja toimitus laskettu',(await pg.innerText('#dlg')).includes('Päivä 1 päättyi')&&await pg.evaluate(()=>__pp.G.summary.del===1));
  await pg.screenshot({path:shot('pp'+w+'_3_yhteenveto.png')});
  await pg.click('#dlg button[data-x="day"]');chk('päivä 2 alkaa',(await pg.innerText('#sDay'))==='Päivä 2');
  // valikko, teema ja varmuuskopio
  await pg.click('#bMenu');chk('valikko pysäyttää pelin',await pg.evaluate(()=>{const t=__pp.G.t;return new Promise(r=>setTimeout(()=>r(__pp.G.t===t),300));}));
  await pg.click('#dlg button[data-t="tumma"]');chk('tumma teema',await pg.evaluate(()=>document.documentElement.dataset.theme==='dark'));
  await pg.click('#dlg button[data-x="txt"]');const txt=await pg.inputValue('#dlg textarea');
  chk('varmuuskopio tekstinä',JSON.parse(txt).app==='pakettipeli');
  await pg.click('#dlg button[data-x="close"]');
  await pg.waitForTimeout(400);await pg.screenshot({path:shot('pp'+w+'_4_tumma.png')});
  // jatkuu uudelleenlatauksen jälkeen
  const before=await pg.evaluate(()=>{__pp.store();return [__pp.G.seed,__pp.G.day];});
  await pg.reload();await pg.waitForTimeout(400);
  chk('peli jatkuu tallennuksesta, ohjetta ei näytetä uudelleen',JSON.stringify(await pg.evaluate(()=>[__pp.G.seed,__pp.G.day]))===JSON.stringify(before)&&!(await pg.isVisible('#ovl.on')));
  // palautus tekstistä
  await pg.click('#bMenu');await pg.click('#dlg button[data-x="imptxt"]');await pg.fill('#impt',txt);await pg.click('#dlg button[data-x="impgo"]');
  chk('palautus tekstistä',await pg.evaluate(()=>__pp.G.day===2&&!document.getElementById('ovl').classList.contains('on')));
  // kaatuminen
  await pg.evaluate(()=>{__pp.G.cash=0.1;});await pg.waitForTimeout(800);
  chk('kassa loppui: pelin loppu',(await pg.innerText('#dlg')).includes('Kassa loppui'));
  await pg.click('#dlg button[data-x="new2"]');chk('uusi peli',await pg.evaluate(()=>!__pp.G.over&&__pp.G.day===1));
  await ctx.close();return errs;
}
(async()=>{const b=await chromium.launch();
  const e1=await run(b,390,844,true),e2=await run(b,320,568,false);
  chk('ei virheitä konsolissa',!e1.length&&!e2.length,e1.concat(e2));
  await b.close();console.log(fails.length?'VIRHEITÄ '+fails.length:'KAIKKI OK');process.exit(fails.length?1:0);})();
