// Kosketuspolku tietokoneen Chromiumissa: puhelin 390×844 vaalea ja 320×568 tumma.
// Asettelu, piirto napautuksella ja vedolla (myös oikea kosketusveto), pyyhintä, kumoa, ämpäri, tatti, zoomaus,
// paletit, kaikki värit, vienti PNG:nä (tarkat pikselit), kuvat (uusi, vaihto, nimi, poisto), tallennus ja varmuuskopio.
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function tapXY(pg,x,y){await pg.touchscreen.tap(x,y);await wait(40)}
async function tap(pg,sel,n=0){const b=await pg.locator(sel).nth(n).boundingBox();if(!b)throw new Error('ei näy: '+sel);await tapXY(pg,b.x+b.width/2,b.y+b.height/2)}
// kuvan pikselin (x, y) keskipiste ruudulla
const cellXY=(pg,x,y)=>pg.evaluate(([x,y])=>{const r=document.getElementById('cv').getBoundingClientRect(),o=PUI.origin(),s=PUI.S.cell,d=PUI.S.dpr;
  return [r.left+(o[0]+(x+.5)*s)/d,r.top+(o[1]+(y+.5)*s)/d]},[x,y]);
const px=(pg,x,y)=>pg.evaluate(([x,y])=>{const W=PUI.W,v=W.px[y*W.w+x];return v?W.cols[v-1]:null},[x,y]);
const count=pg=>pg.evaluate(()=>PUI.W.px.filter(v=>v).length);
// oikea kosketusveto (CDP), jotta touch-action ja osoitintapahtumat kulkevat kuten puhelimessa
async function touchDrag(cdp,pts){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pts[0][0],y:pts[0][1],id:1}]});
  for(const p of pts.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p[0],y:p[1],id:1}]});await wait(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(40);
}
async function keyPos(pg){return pg.evaluate(()=>[...document.querySelectorAll('#panel .key,#joy,#zoom,#pal .sw')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.left)+','+Math.round(r.top)}).join('|'))}

(async()=>{const br=await chromium.launch();
for(const [w,h,scheme] of [[390,844,'light'],[320,568,'dark']]){
  const ctx=await br.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,colorScheme:scheme,deviceScaleFactor:2});
  const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(URL);await wait(250);const L=`${w}×${h} ${scheme}`;const cdp=await ctx.newCDPSession(pg);

  // asettelu
  const lay=await pg.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect();const st=q('#stage'),pal=q('#pal'),pan=q('#panel'),hd=q('header');
    const keys=[...document.querySelectorAll('.key,.sw,#joy,#zoom')].map(e=>e.getBoundingClientRect());
    return {sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,w:innerWidth,h:innerHeight,stH:st.height,
      order:hd.bottom<=st.top+1&&st.bottom<=pal.top+1&&pal.bottom<=pan.top+1&&pan.bottom<=innerHeight,
      minKey:Math.min(...keys.map(r=>r.height)),minW:Math.min(...keys.map(r=>r.width)),inside:keys.every(r=>r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight)}});
  ok(lay.sw<=lay.w&&lay.sh<=lay.h,`${L}: ei vieritystä (${lay.sw}×${lay.sh})`);
  ok(lay.order,`${L}: inforivi, kuva, paletti ja ohjaimet järjestyksessä ja ruudulla`);
  ok(lay.stH>=(h<600?220:400),`${L}: piirtoalue tarpeeksi iso (${lay.stH})`);
  ok(lay.minKey>=42&&lay.minW>=26&&lay.inside,`${L}: napit napautettavia ja ruudulla (${lay.minKey}×${lay.minW})`);
  ok((await pg.textContent('#title'))==='Kuva 1'&&(await pg.textContent('#info'))==='32 × 32',`${L}: inforivi`);
  ok(await pg.locator('#pal .sw[data-c]').count()===8,`${L}: paletissa 8 väriä + kaikki värit`);
  ok(await pg.evaluate(()=>PUI.S.zt===0&&PUI.S.cell===PUI.S.fit),`${L}: alussa koko kuva näkyy`);
  ok(await pg.evaluate(()=>getComputedStyle(document.getElementById('stage')).touchAction==='none'&&getComputedStyle(document.getElementById('cv')).touchAction==='none'),`${L}: Safarin eleet estetty piirtoalueella`);
  const pos0=await keyPos(pg);
  ok(await pg.locator('#b-undo').isDisabled()&&await pg.locator('#b-redo').isDisabled(),`${L}: kumoa ja tee uudelleen pois käytöstä alussa`);

  // napautus päälle ja pois
  const c0=await pg.evaluate(()=>PUI.D.asetukset.vari);
  let p=await cellXY(pg,3,4);await tapXY(pg,...p);
  ok(await px(pg,3,4)===c0,`${L}: napautus maalaa pikselin`);
  await tapXY(pg,...p);ok(await px(pg,3,4)===null,`${L}: saman värin napautus poistaa`);
  ok(await keyPos(pg)===pos0,`${L}: napit eivät liiku`);

  // veto (oikea kosketus): yhtenäinen viiva
  let a=await cellXY(pg,2,10),b=await cellXY(pg,20,16),pts=[];for(let i=0;i<=6;i++)pts.push([a[0]+(b[0]-a[0])*i/6,a[1]+(b[1]-a[1])*i/6]);
  await touchDrag(cdp,pts);
  let n=await count(pg);ok(n===19&&await px(pg,2,10)===c0&&await px(pg,20,16)===c0,`${L}: kosketusveto piirtää yhtenäisen viivan (${n})`);
  // veto maalatusta pikselistä pyyhkii
  a=await cellXY(pg,2,10);b=await cellXY(pg,11,13);
  await pg.mouse.move(...a);await pg.mouse.down();await pg.mouse.move(...b,{steps:8});await pg.mouse.up();await wait(40);
  n=await count(pg);ok(n>=8&&n<=10&&await px(pg,2,10)===null&&await px(pg,20,16)===c0&&await px(pg,11,13)===null,`${L}: maalatusta alkava veto pyyhkii (${n})`);
  // kumoa ja tee uudelleen
  await tap(pg,'#b-undo');ok(await count(pg)===19,`${L}: kumoa palauttaa pyyhityn`);
  await tap(pg,'#b-undo');ok(await count(pg)===0,`${L}: kumoa viivan`);
  await tap(pg,'#b-redo');ok(await count(pg)===19,`${L}: tee uudelleen`);
  ok(await keyPos(pg)===pos0,`${L}: napit eivät liiku kumotessa`);

  // väri paletista
  await tap(pg,'#pal .sw[data-c]',1);const c1=await pg.evaluate(()=>PUI.D.asetukset.vari);
  ok(c1!==c0&&await pg.getAttribute('#pal .sw[data-c]:nth-child(2)','aria-pressed')==='true',`${L}: värin valinta`);
  p=await cellXY(pg,20,16);await tapXY(pg,...p);ok(await px(pg,20,16)===c1,`${L}: eri värillä napautus vaihtaa värin, ei poista`);

  // ämpäri
  await tap(pg,'#b-fill');ok(await pg.getAttribute('#b-fill','aria-pressed')==='true',`${L}: ämpäri valittu`);
  p=await cellXY(pg,30,1);await tapXY(pg,...p);
  n=await count(pg);ok(n===1024,`${L}: ämpäri täyttää tyhjän alueen (${n})`);
  ok(await px(pg,30,1)===c1&&await px(pg,5,11)===c0,`${L}: ämpäri ei peitä toista väriä`);
  await tapXY(pg,...p);n=await count(pg);ok(n===18,`${L}: saman värin ämpäri tyhjentää alueen (${n})`);
  await tap(pg,'#b-undo');await tap(pg,'#b-undo');await tap(pg,'#b-fill');
  ok(await pg.getAttribute('#b-fill','aria-pressed')==='false'&&await count(pg)===19,`${L}: ämpäri pois, kumottu`);

  // zoomaussäädin
  const z=await pg.locator('#zoom').boundingBox();
  await pg.mouse.move(z.x+z.width/2,z.y+z.height-10);await pg.mouse.down();await pg.mouse.move(z.x+z.width/2,z.y+5,{steps:6});await pg.mouse.up();
  let S=await pg.evaluate(()=>({zt:PUI.S.zt,cell:PUI.S.cell,max:PUI.S.max,fit:PUI.S.fit}));
  ok(S.zt===1&&S.cell===S.max&&S.max>=S.fit*2,`${L}: säädin ylös = lähin zoomaus (${JSON.stringify(S)})`);
  ok(await pg.evaluate(()=>document.getElementById('mini').classList.contains('on')),`${L}: sijaintikartta näkyy zoomattuna`);
  ok(await pg.evaluate(()=>Number.isInteger(PUI.S.cell)),`${L}: ruudun pikselikoko kokonaisluku`);
  // tatti: oikealle ja alas, nopeus kasvaa etäisyyden mukaan
  const jb=await pg.locator('#joy').boundingBox(),jc=[jb.x+jb.width/2,jb.y+jb.height/2];
  const cam=()=>pg.evaluate(()=>[PUI.S.cx,PUI.S.cy]);
  let c=await cam();
  await pg.mouse.move(...jc);await pg.mouse.down();await pg.mouse.move(jc[0]+jb.width*0.16,jc[1],{steps:3});await wait(400);
  let c2=await cam();await pg.mouse.move(jc[0]+jb.width*0.45,jc[1]+jb.width*0.02,{steps:3});await wait(400);let c3=await cam();await pg.mouse.up();await wait(80);
  let c4=await cam();await wait(250);let c5=await cam();
  ok(c2[0]>c[0]&&Math.abs(c2[1]-c[1])<0.5,`${L}: tatti oikealle liikuttaa näkymää oikealle (${c} → ${c2})`);
  ok((c3[0]-c2[0])>(c2[0]-c[0])*1.5,`${L}: kauempana keskeltä nopeammin (${(c2[0]-c[0]).toFixed(2)} → ${(c3[0]-c2[0]).toFixed(2)})`);
  ok(c4[0]===c5[0],`${L}: irrotus pysäyttää`);
  ok(await pg.evaluate(()=>getComputedStyle(document.querySelector('#joy i')).transform==='none'),`${L}: tatti palaa keskelle`);
  // reunassa kamera pysähtyy
  await pg.mouse.move(...jc);await pg.mouse.down();await pg.mouse.move(jc[0]+jb.width*0.5,jc[1],{steps:2});await wait(2500);await pg.mouse.up();
  const lim=await pg.evaluate(()=>{const S=PUI.S,W=PUI.W,cv=document.getElementById('cv');const o=PUI.origin();return {right:o[0]+W.w*S.cell,cw:cv.width}});
  ok(lim.right>=lim.cw*0.74,`${L}: kuvan reuna ei katoa ruudulta (${JSON.stringify(lim)})`);
  // zoomattuna piirto osuu oikeaan pikseliin
  const tgt=await pg.evaluate(()=>{const S=PUI.S,o=PUI.origin(),cv=document.getElementById('cv');return [Math.floor((cv.width/2-o[0])/S.cell),Math.floor((cv.height/2-o[1])/S.cell)]});
  p=await cellXY(pg,...tgt);await tapXY(pg,...p);ok(await px(pg,...tgt)===c1,`${L}: zoomattuna napautus osuu pikseliin ${tgt}`);
  await tap(pg,'#b-undo');
  // takaisin koko kuvaan
  await pg.mouse.move(z.x+z.width/2,z.y+5);await pg.mouse.down();await pg.mouse.move(z.x+z.width/2,z.y+z.height-2,{steps:4});await pg.mouse.up();
  ok(await pg.evaluate(()=>PUI.S.zt===0&&!document.getElementById('mini').classList.contains('on')),`${L}: säädin alas = koko kuva, kartta piiloon`);

  // paletti-ikkuna
  await tap(pg,'#b-menu');await wait(300);ok(await pg.evaluate(()=>document.getElementById('d-menu').open),`${L}: valikko aukeaa`);
  ok(await pg.evaluate(()=>!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))),`${L}: ikkuna ei avaa näppäimistöä`);
  await tap(pg,'[data-open="d-pal"]');await wait(300);
  ok(await pg.locator('#pals .palrow').count()===4,`${L}: neljä palettia`);
  await tap(pg,'#pals .palrow[data-laji="kolmikko"]');
  let pal=await pg.evaluate(()=>[...document.querySelectorAll('#pal .sw[data-c]')].map(b=>b.dataset.c));
  ok(pal.length===8&&pal[1]===await pg.evaluate(()=>PUI.D.asetukset.vari)&&await pg.evaluate(()=>PUI.D.asetukset.laji)==='kolmikko',`${L}: paletin vaihto, valittu väri pysyy samalla paikalla`);
  await pg.evaluate(()=>{const i=document.getElementById('f-base');i.value='#c0392b';i.dispatchEvent(new Event('input',{bubbles:true}))});
  pal=await pg.evaluate(()=>[...document.querySelectorAll('#pal .sw[data-c]')].map(b=>b.dataset.c));
  ok(pal.includes('#c0392b')&&await pg.evaluate(()=>PUI.D.asetukset.pohja)==='#c0392b',`${L}: pohjaväri laskee uuden paletin`);
  await tap(pg,'#d-pal [data-back]');await wait(250);ok(await pg.evaluate(()=>document.getElementById('d-menu').open&&!document.getElementById('d-pal').open),`${L}: ‹ Valikko palaa valikkoon`);
  await tapXY(pg,w/2,20);await wait(200);ok(await pg.evaluate(()=>!document.querySelector('dialog[open]')),`${L}: napautus ikkunan ulkopuolelle sulkee`);
  ok(await count(pg)===19,`${L}: ulkopuolinen napautus ei piirtänyt`);

  // kaikki värit
  await pg.evaluate(()=>{const i=document.getElementById('f-free');i.value='#12ab34';i.dispatchEvent(new Event('input',{bubbles:true}))});
  ok(await pg.evaluate(()=>PUI.D.asetukset.vari==='#12ab34'&&document.getElementById('free-lbl').getAttribute('aria-pressed')==='true'),`${L}: oma väri valitaan`);
  await tap(pg,'#pal .sw[data-c]',0);await tap(pg,'#free-lbl');
  ok(await pg.evaluate(()=>PUI.D.asetukset.vari)==='#12ab34',`${L}: oman värin ruudun napautus valitsee sen uudelleen`);
  p=await cellXY(pg,0,0);await tapXY(pg,...p);ok(await px(pg,0,0)==='#12ab34',`${L}: oma väri piirtää`);

  // vienti: tarkat pikselit, läpinäkyvä tausta, kokonaislukusuurennos
  await tap(pg,'#b-menu');await wait(250);await tap(pg,'[data-open="d-share"]');await wait(400);
  ok((await pg.textContent('#share-size')).startsWith('1024 × 1024'),`${L}: oletuskoko Keski 1024`);
  const chkPng=async(scale,bg)=>pg.evaluate(async([scale,bg])=>{
    for(let i=0;i<50&&!PUI.S.blob;i++)await new Promise(r=>setTimeout(r,40));
    const bmp=await createImageBitmap(PUI.S.blob),c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;const x=c.getContext('2d');x.drawImage(bmp,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data,W=PUI.W,bad=[];
    if(c.width!==W.w*scale||c.height!==W.h*scale)return 'koko '+c.width+'×'+c.height;
    const hx=v=>v.toString(16).padStart(2,'0');
    for(let y=0;y<c.height;y+=1)for(let xx=0;xx<c.width;xx+=1){const i=(y*c.width+xx)*4,a=d[i+3];
      const col=W.px[Math.floor(y/scale)*W.w+Math.floor(xx/scale)];const want=col?W.cols[col-1]:bg;
      if(!want){if(a!==0)bad.push([xx,y,'a',a])}else if(a!==255||'#'+hx(d[i])+hx(d[i+1])+hx(d[i+2])!==want)bad.push([xx,y,a]);
      if(bad.length>3)return JSON.stringify(bad)}
    return bad.length?JSON.stringify(bad):'ok'},[scale,bg]);
  ok((await chkPng(32,null))==='ok',`${L}: PNG 1024 px läpinäkyvä, jokainen kuvapiste täsmälleen oikein`);
  await tap(pg,'#seg-tausta button[data-tausta="valk"]');await tap(pg,'#seg-koko button[data-koko="alkup"]');
  ok((await chkPng(1,'#ffffff'))==='ok',`${L}: PNG alkuperäinen koko valkoisella taustalla`);
  ok(await pg.evaluate(()=>PUI.shareName())==='kuva-1-32x32.png',`${L}: tiedostonimi`);
  await tap(pg,'#seg-koko button[data-koko="keski"]');await tap(pg,'#seg-tausta button[data-tausta="lapi"]');
  ok(!(await pg.locator('#b-share').isDisabled()),`${L}: Jaa-nappi käytössä`);
  await pg.keyboard.press('Escape');await wait(150);

  // kuvat: uusi, vaihto, nimi, poisto
  await tap(pg,'#b-menu');await wait(250);await tap(pg,'[data-open="d-works"]');await wait(300);
  ok(await pg.locator('#grid .thumb').count()===1,`${L}: yksi kuva galleriassa`);
  await tap(pg,'#seg-new button[data-n="16"]');await wait(250);
  ok(await pg.evaluate(()=>PUI.W.w===16&&PUI.D.teokset.length===2&&!document.querySelector('dialog[open]')),`${L}: uusi 16×16 kuva avautuu`);
  ok((await pg.textContent('#title'))==='Kuva 2'&&(await pg.textContent('#info'))==='16 × 16'&&await count(pg)===0,`${L}: uusi kuva tyhjä ja nimetty`);
  p=await cellXY(pg,15,15);await tapXY(pg,...p);ok(await px(pg,15,15)==='#12ab34',`${L}: 16×16 kuvan reunapikseli`);
  await tap(pg,'#b-menu');await wait(250);await tap(pg,'[data-open="d-works"]');await wait(300);
  await pg.fill('#t-name','Sydän');ok((await pg.textContent('#title'))==='Sydän',`${L}: nimen muutos`);
  await tap(pg,'#grid .thumb[aria-current="false"]');await wait(200);
  ok(await pg.evaluate(()=>PUI.W.w===32)&&await count(pg)===20,`${L}: vaihto takaisin ensimmäiseen kuvaan (${await pg.evaluate(()=>PUI.W.w)} ${await count(pg)})`);
  // tallennus: uudelleenavaus
  await pg.reload();await wait(300);
  ok(await pg.evaluate(()=>PUI.W.nimi==='Kuva 1'&&PUI.D.teokset.length===2&&PUI.D.asetukset.laji==='kolmikko'&&PUI.D.asetukset.pohja==='#c0392b')&&await count(pg)===20,`${L}: kuvat ja paletti säilyvät uudelleenavauksessa`);
  // poisto vahvistuksella
  await tap(pg,'#b-menu');await wait(250);await tap(pg,'[data-open="d-works"]');await wait(300);
  const delB=await pg.locator('#b-del').boundingBox();await tap(pg,'#b-del');
  const okB=await pg.locator('#b-delok').boundingBox();ok(Math.abs(okB.x-delB.x)>40,`${L}: Poista-vahvistus eri kohdassa kuin ensimmäinen napautus`);
  await tap(pg,'#b-delno');ok(await pg.evaluate(()=>PUI.D.teokset.length===2),`${L}: Peru ei poista`);
  await tap(pg,'#b-del');await tap(pg,'#b-delok');
  ok(await pg.evaluate(()=>PUI.D.teokset.length===1&&PUI.W.nimi==='Sydän'),`${L}: poisto ja seuraava kuva auki`);
  await pg.keyboard.press('Escape');

  // varmuuskopio tekstinä
  const t=await pg.evaluate(()=>PUI.exportText());
  await pg.evaluate(()=>{localStorage.clear()});await pg.reload();await wait(250);
  ok(await pg.evaluate(()=>PUI.D.teokset.length===1&&PUI.W.nimi==='Kuva 1'),`${L}: tyhjä aloitus`);
  ok(await pg.evaluate(t=>PUI.importText(t),t),`${L}: varmuuskopio luetaan`);
  ok(await pg.evaluate(()=>PUI.W.nimi==='Sydän'&&PUI.W.w===16&&PUI.D.asetukset.pohja==='#c0392b')&&await count(pg)===1,`${L}: varmuuskopio palauttaa kuvat`);
  ok(!(await pg.evaluate(()=>PUI.importText('{"app":"koodi"}'))),`${L}: vieras varmuuskopio hylätään`);

  ok(!errs.length,`${L}: ei sivuvirheitä ${errs.join(' | ')}`);
  await ctx.close();
}
await br.close();process.exit(virheet?1:0);
})().catch(e=>{console.log(e);process.exit(1)});
