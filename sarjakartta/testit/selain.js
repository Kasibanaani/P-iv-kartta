'use strict';
// Sarjakartta: selaintestit puhelinleveyksillä 390 ja 320 px (Chromium, ei oikea iPhone).
const {chromium}=require('playwright');
const assert=require('assert'),path=require('path'),fs=require('fs'),http=require('http');
(async()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'));
  const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(html)});
  await new Promise(res=>server.listen(8767,'127.0.0.1',res));
  const browser=await chromium.launch(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{});
  let n=0;
  for(const [w,h,scheme] of [[390,844,'light'],[320,568,'dark']]){
    const ctx=await browser.newContext({viewport:{width:w,height:h},colorScheme:scheme,acceptDownloads:true});
    const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
    const ok=async(nimi,f)=>{await f();n++;console.log('OK '+w+' '+nimi)};
    const S=()=>p.evaluate(()=>TK.S());
    const os=async id=>{if(await p.locator('[data-act=vback]').count())await p.click('[data-act=vback]');await p.click('[data-act=osiot]');await p.click('[data-act=osio][data-id='+id+']')};
    const ulos=()=>p.mouse.click(4,4);
    const toast=async()=>(await p.locator('#toast').isVisible())?await p.textContent('#toast'):'';
    const xy=async sel=>{const b=await p.locator(sel).first().boundingBox();return [Math.round(b.x),Math.round(b.y)]};
    const leveys=async()=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'vaakavieritys');
    const uusi=async nimi=>{await p.click('[data-act=uusi]');await p.keyboard.type(nimi);await p.keyboard.press('Enter')};
    const cell=(nimi,arvo)=>p.locator('#vl .vtc[aria-label="'+nimi+': '+arvo+'"]');
    const id=async nimi=>(await S()).ryhmat.find(g=>g.nimi===nimi).id;
    await p.goto('http://127.0.0.1:8767/');
    await ok('tyhjä tila: pieni inforivi, alapalkki alhaalla, ei välilehtipalkkia, plus avaa ryhmän lisäyksen',async()=>{
      assert((await p.textContent('#app')).includes('Ei lihasryhmiä'));
      const hd=await p.locator('#hd').boundingBox(),bar=await p.locator('#bar').boundingBox();assert(hd.height<=40,'inforivi '+hd.height);assert(Math.abs(bar.y+bar.height-h)<2);
      assert.equal(await p.locator('#hd [data-act]:not(.ib)').count(),0,'toimintonappi ylhäällä');
      await p.click('[data-act=plus]');assert.equal(await p.evaluate(()=>document.activeElement.id),'uusi-nimi');await ulos();await leveys()});
    await ok('lihasryhmän lisäys: Enter tallentaa, ulkopuolinen napautus tallentaa, tupla estetään, ei OK-nappeja',async()=>{
      await p.click('[data-act=uusi]');await p.keyboard.type('Rinta');await p.keyboard.press('Enter');assert.equal((await S()).ryhmat[0].nimi,'Rinta');
      await os('ryhmat');await p.click('[data-act=uusi]');await p.keyboard.type('Selkä');await ulos();assert.equal((await S()).ryhmat.length,2);assert.equal(await p.locator('.pkd').count(),0);
      await p.click('[data-act=uusi]');await p.keyboard.type('selkä');await p.keyboard.press('Enter');assert((await toast()).includes('on jo olemassa'));assert.equal((await S()).ryhmat.length,2);
      await p.fill('#uusi-nimi','Jalat');await p.keyboard.press('Enter');await uusi('Olkapäät');
      assert.deepEqual((await S()).ryhmat.map(g=>g.nimi),['Rinta','Selkä','Jalat','Olkapäät']);
      assert.equal(await p.locator('.pkd button:has-text("OK"),button:has-text("Tallenna")').count(),0);
      const v=(await S()).ryhmat.map(g=>g.v);assert.equal(new Set(v).size,4,'eri värit');await leveys()});
    await ok('taulukko: tavoite ja kuormitus ruuduilla, toinen napautus poistaa, mikään ei liiku, summa päivittyy',async()=>{
      await cell('Rinta',12).evaluate(e=>{const v=document.getElementById('vl');v.scrollLeft=e.offsetLeft-v.clientWidth/2});await p.waitForTimeout(50);const a=await xy('#vl .vtn >> nth=1'),b=await xy('[data-act=uusi]'),sl=await p.evaluate(()=>document.getElementById('vl').scrollLeft);
      await cell('Rinta',12).click();assert.equal((await S()).ryhmat[0].tavoite,12);assert.equal(await cell('Rinta',12).getAttribute('aria-pressed'),'true');
      assert.deepEqual(await xy('#vl .vtn >> nth=1'),a);assert.deepEqual(await xy('[data-act=uusi]'),b);assert.equal(await p.evaluate(()=>document.getElementById('vl').scrollLeft),sl,'vieritys nollautui');
      await cell('Rinta',12).click();assert.equal((await S()).ryhmat[0].tavoite,0);await cell('Rinta',12).click();
      await cell('Rinta',14).click();assert.equal((await S()).ryhmat[0].tavoite,14,'yksi valinta per rivi');assert.equal(await p.locator('#vl .vtr[data-row] >> nth=0').locator('.vtc[aria-pressed=true]').count(),1);
      for(const [nm,v] of [['Selkä',14],['Jalat',20],['Olkapäät',8]]){await cell(nm,v).scrollIntoViewIfNeeded();await cell(nm,v).click()}
      await p.click('[data-act=attrs]');await p.click('[data-act=attr][data-id=kuorma]');
      for(const [nm,v] of [['Rinta','1,5'],['Selkä','1,5'],['Jalat',2],['Olkapäät',1]]){await p.locator('#vl .vtc[aria-label="'+nm+': '+v+'"]').scrollIntoViewIfNeeded();await p.locator('#vl .vtc[aria-label="'+nm+': '+v+'"]').click()}
      assert.deepEqual((await S()).ryhmat.map(g=>[g.tavoite,g.kuorma]),[[14,1.5],[14,1.5],[20,2],[8,1]]);
      assert((await p.textContent('#gsum')).includes('56')&&(await p.textContent('#gsum')).includes('90'),await p.textContent('#gsum'));assert.equal(await p.locator('#vl input').count(),0,'taulukossa ei kenttiä');await leveys()});
    await ok('järjestys raahaamalla kahvasta',async()=>{const g=await p.locator('#vl .vgrip >> nth=0').boundingBox(),r2=await p.locator('#vl .vtr[data-row] >> nth=1').boundingBox();
      await p.mouse.move(g.x+g.width/2,g.y+g.height/2);await p.mouse.down();await p.mouse.move(g.x+g.width/2,r2.y+r2.height-4,{steps:6});await p.mouse.up();
      assert.deepEqual((await S()).ryhmat.map(x=>x.nimi),['Selkä','Rinta','Jalat','Olkapäät']);
      const g2=await p.locator('#vl .vgrip >> nth=1').boundingBox(),r1=await p.locator('#vl .vtr[data-row] >> nth=0').boundingBox();
      await p.mouse.move(g2.x+g2.width/2,g2.y+g2.height/2);await p.mouse.down();await p.mouse.move(g2.x+g2.width/2,r1.y+3,{steps:6});await p.mouse.up();
      assert.deepEqual((await S()).ryhmat.map(x=>x.nimi),['Rinta','Selkä','Jalat','Olkapäät']);assert.equal(await p.evaluate(()=>getComputedStyle(document.querySelector('.vgrip')).touchAction),'none')});
    await ok('ryhmän nimi: napautus avaa ikkunan, muutos tallentuu ulkopuolisesta napautuksesta, tupla estetään',async()=>{
      await p.click('#vl .vnm >> nth=2');await p.fill('#ry-nimi','Jalat ja pakarat');await ulos();assert.equal((await S()).ryhmat[2].nimi,'Jalat ja pakarat');
      await p.click('#vl .vnm >> nth=2');await p.fill('#ry-nimi','rinta');await p.keyboard.press('Enter');assert((await toast()).includes('on jo olemassa'));assert.equal((await S()).ryhmat[2].nimi,'Jalat ja pakarat');await p.fill('#ry-nimi','Jalat');await p.keyboard.press('Enter');
      assert.equal((await S()).ryhmat[2].nimi,'Jalat');assert.equal(await p.locator('.pkd').count(),0)});
    await ok('ohje vain i-napin takana, ulkopuolinen napautus sulkee eikä mene läpi',async()=>{
      assert(!(await p.textContent('#app')).includes('Raahaa riviä kahvasta'));const b=await p.locator('[data-act=uusi]').boundingBox();
      await p.click('#hd .ib');assert((await p.textContent('.pkd')).includes('Raahaa'));await p.mouse.click(b.x+b.width/2,b.y+b.height/2);assert.equal(await p.locator('.pkd').count(),0);assert.equal((await S()).ryhmat.length,4)});
    const T0=Date.now();
    await ok('+ Sarja: ikkuna alhaalla, 1 napautus pääasiallinen, 2 osittainen, 3 pois, ulkopuolinen napautus tallentaa',async()=>{
      await os('treeni');const pb=await xy('[data-act=plus]'),ob=await xy('[data-act=osiot]');
      await p.click('[data-act=plus]');assert.equal(await p.locator('.gb').count(),4);const pk=await p.locator('.pkd').boundingBox(),bar=await p.locator('#bar').boundingBox();assert(pk.y+pk.height<=bar.y+1,'ikkuna peittää alapalkin');
      const R=await id('Rinta'),Sk=await id('Selkä');
      await p.click('.gb[data-id="'+R+'"]');let s=(await S()).sarjat;assert.equal(s.length,1);assert.equal(s[0].r[R],1);assert((await p.textContent('.gb[data-id="'+R+'"]')).includes('1'));
      await p.click('.gb[data-id="'+R+'"]');assert.equal((await S()).sarjat[0].r[R],0.5);assert((await p.textContent('.gb[data-id="'+R+'"]')).includes('½'));
      await p.click('.gb[data-id="'+R+'"]');assert.equal(Object.keys((await S()).sarjat[0].r).length,0);
      await p.click('.gb[data-id="'+R+'"]');await p.click('.gb[data-id="'+Sk+'"]');await p.click('.gb[data-id="'+Sk+'"]');
      await ulos();s=(await S()).sarjat;assert.equal(s.length,1);assert.deepEqual(s[0].r,{[R]:1,[Sk]:0.5});assert(s[0].t>=T0-1000&&s[0].t<=Date.now(),'aikaleima');
      assert.equal(await p.locator('.pkd').count(),0);assert.deepEqual(await xy('[data-act=plus]'),pb);assert.deepEqual(await xy('[data-act=osiot]'),ob);
      assert.equal(await p.locator('.sr').count(),1);assert((await p.textContent('.sr')).includes('Rinta')&&(await p.textContent('.sr')).includes('Selkä½'));await leveys()});
    await ok('tyhjä sarja ei tallennu; Treenin taulukko näyttää tänään, 14 pv ja viimeksi',async()=>{
      await p.click('[data-act=plus]');await ulos();assert.equal((await S()).sarjat.length,1);
      await p.click('[data-act=plus]');const R=await id('Rinta');await p.click('.gb[data-id="'+R+'"]');await p.click('.gb[data-id="'+R+'"]');await p.click('.gb[data-id="'+R+'"]');await ulos();assert.equal((await S()).sarjat.length,1,'tyhjennetty sarja poistuu');
      const rows=await p.locator('.gt .gr').allTextContents();assert(/Rinta\s*1\s*1\/14\s*tänään/.test(rows[0].replace(/\s+/g,' ').replace('1 1/14','1 1/14'))||rows[0].includes('tänään'),rows[0]);
      assert(rows[1].includes('0,5')&&rows[1].includes('tänään'),rows[1]);assert(rows[2].includes('–'),rows[2]);
      assert((await p.textContent('#hd .meta')).includes('1,5 sarjaa'),await p.textContent('#hd .meta'))});
    await ok('muistiinpano: kynä avaa kentän kursorilla, teksti tallentuu ulkopuolisesta napautuksesta ja näkyy listassa',async()=>{
      await p.click('[data-act=plus]');await p.click('[data-act=note]');assert.equal(await p.evaluate(()=>document.activeElement.id),'ed-m');await p.keyboard.type('Vasen käsi väsyi');await ulos();
      let s=(await S()).sarjat;assert.equal(s.length,2,'pelkkä muistiinpano tallentuu');
      await p.click('.sr >> nth=0');await p.click('[data-act=note]');assert.equal(await p.inputValue('#ed-m'),'');
      await p.click('.sr >> nth=1').catch(()=>{});
      await ulos();
      const R=await id('Jalat');await p.click('[data-act=plus]');await p.click('.gb[data-id="'+R+'"]');await p.click('[data-act=note]');await p.keyboard.type('Rankka');await p.click('[data-act=note]');assert.equal(await p.locator('.gb').count(),4);await ulos();
      assert((await p.textContent('#app')).includes('Rankka'));assert.equal((await S()).sarjat.filter(x=>x.m==='Rankka').length,1)});
    await ok('kuten edellinen: yksi napautus kopioi edellisen sarjan ryhmät; muistiinpanon kursori menee loppuun',async()=>{
      const n0=(await S()).sarjat.length;await p.click('[data-act=plus]');const k=p.locator('[data-act=kuten]');assert.equal(await k.count(),1);assert((await k.textContent()).includes('Jalat'));
      await k.click();assert.equal(await p.locator('[data-act=kuten]').count(),0,'piiloutuu kun sarjassa on ryhmiä');assert.equal(await p.locator('.gb.f').count(),1);await ulos();
      const s=(await S()).sarjat;assert.equal(s.length,n0+1);const last=s.filter(x=>Object.keys(x.r).length).slice(-2);assert.deepEqual(last[1].r,last[0].r);
      await p.click('.sr:has-text("Rankka")');await p.click('[data-act=note]');const sel=await p.evaluate(()=>{const e=document.getElementById('ed-m');return [e.selectionStart,e.selectionEnd,e.value.length]});assert.deepEqual(sel,[6,6,6],'koko teksti valittuna');
      await p.keyboard.type(', hyvä');await ulos();assert.equal((await S()).sarjat.filter(x=>x.m==='Rankka, hyvä').length,1)});
    await ok('sarjan korjaus: rivi avaa ikkunan, aika ja päivä muokattavissa, poisto vahvistuksella eri kohdassa',async()=>{
      const k=await p.locator('.sr').count();await p.click('.sr >> nth=0');
      assert((await p.textContent('.pkd')).includes('Sarja'));await p.click('[data-act=aika]');assert.equal(await p.locator('#ed-pv').count(),1);
      const d=new Date(Date.now()-2*864e5),ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      await p.fill('#ed-pv',ds);await p.fill('#ed-aika','08:15');await ulos();
      const m=(await S()).sarjat.filter(x=>new Date(x.t).getHours()===8&&new Date(x.t).getMinutes()===15);assert.equal(m.length,1);assert.equal(await p.locator('.sr').count(),k-1,'siirtyi pois tämän päivän listalta');
      await p.click('.sr >> nth=0');const del=await p.locator('[data-act=del]').boundingBox();await p.click('[data-act=del]');
      const pe=await p.locator('.cf [data-act=popkiinni]').boundingBox(),po=await p.locator('.cf [data-act=del2]').boundingBox();assert(pe.x<po.x,'Peru vasemmalla');
      assert(!(del.x+del.width/2>po.x&&del.x+del.width/2<po.x+po.width&&del.y+del.height/2>po.y&&del.y+del.height/2<po.y+po.height),'vahvistus samassa kohdassa');
      const n0=(await S()).sarjat.length;await ulos();assert.equal((await S()).sarjat.length,n0,'ulkopuolinen napautus poisti');
      await p.click('.sr >> nth=0');await p.click('[data-act=del]');await p.click('.cf [data-act=del2]');assert.equal((await S()).sarjat.length,n0-1)});
    // deterministinen aineisto: tunnetut päivät, täydet ja puolikkaat
    await ok('summat: osittainen on puoli, kuorma = sarjat × kerroin, liukuva 14 pv',async()=>{
      const R=await id('Rinta'),Sk=await id('Selkä');
      await p.evaluate(([R,Sk])=>{const S=TK.S(),n=TK.paiva(Date.now());S.sarjat=[];const mk=(d,r)=>{const t=new Date((n-d)*864e5);const x=new Date();x.setDate(x.getDate()-d);x.setHours(18,0,0,0);S.sarjat.push({id:'t'+S.sarjat.length,t:x.getTime(),r,m:''})};
        mk(0,{[R]:1});mk(0,{[R]:1,[Sk]:.5});mk(1,{[R]:.5});mk(3,{[Sk]:1});mk(10,{[R]:1});mk(13,{[Sk]:1});mk(14,{[R]:1});mk(20,{[R]:1,[Sk]:1});TK.S().sarjat.sort((a,b)=>a.t-b.t);TK.save();TK.render()},[R,Sk]);
      const t=await p.evaluate(([R,Sk])=>{const n=TK.paiva(Date.now());return [TK.sum(R,n,n),TK.sum(R,n-13,n),TK.sum(R,n-14,n-14),TK.sum(Sk,n-13,n),TK.sum(null,n-13,n),TK.sum(R,n-13,n,1),TK.sum(null,n-13,n,1)]},[R,Sk]);
      assert.deepEqual(t,[2,3.5,1,2.5,6,5.25,9]);
      await os('treeni');const rows=await p.locator('.gt .gr').allTextContents();assert(rows[0].replace(/\s/g,'').includes('23,5/14'),rows[0]);assert(rows[1].replace(/\s/g,'').includes('0,52,5/14'),rows[1])});
    await ok('jaksot: sarakkeina kahden viikon jaksot, nimet ja otsikot paikallaan, arvot täsmäävät',async()=>{
      await os('jaksot');const hs=await p.locator('.jh b').allTextContents();assert(hs.length>=5);
      const last=hs[hs.length-1],wk=await p.evaluate(()=>{const a=TK.pStart(TK.pIdx(TK.paiva(Date.now())));return [TK.isoW(a),TK.isoW(a+7)]});assert.equal(last,wk[0]+'–'+wk[1]);
      assert(Math.abs((await p.evaluate(()=>document.getElementById('vl').scrollLeft))-(await p.evaluate(()=>document.getElementById('vl').scrollWidth-document.getElementById('vl').clientWidth)))<3,'ei viimeisessä sarakkeessa');
      const R=await id('Rinta'),exp=await p.evaluate(R=>{const a=TK.pStart(TK.pIdx(TK.paiva(Date.now())));return TK.sum(R,a,a+13)},R);
      assert((await p.textContent('.vtr[data-row],.vtr:has(.dot) >> nth=0')).length>0);
      const txt=await p.locator('#vl .vtr:has-text("Rinta") .jc >> nth=-1').textContent();assert.equal(txt,exp?String(exp).replace('.',','):'–');
      const nx=await xy('#vl .vtr:has-text("Rinta") .vtn');await p.evaluate(()=>{document.getElementById('vl').scrollLeft=0});await p.waitForTimeout(60);
      assert.deepEqual(await xy('#vl .vtr:has-text("Rinta") .vtn'),nx,'nimisarake liikkui');assert.equal(await p.evaluate(()=>document.getElementById('vlh').scrollLeft),0,'otsikot eivät seuraa');
      await p.evaluate(()=>{document.getElementById('vl').scrollLeft=1e5});await leveys()});
    await ok('jaksot: sarakeotsikko avaa jakson viikoittain, ruutu ryhmän päivittäin, ikkuna sulkeutuu ulkopuolelta',async()=>{
      await p.click('.jh >> nth=-1');assert((await p.textContent('.pkd')).includes('Yht'));assert((await p.textContent('.pkd')).includes('Rinta'));await ulos();assert.equal(await p.locator('.pkd').count(),0);
      await p.click('#vl .vtr:has-text("Rinta") .jc >> nth=-1');assert.equal(await p.locator('.pkd svg rect.gc').count()>0,true);assert.equal(await p.locator('.pkd svg text:has-text("M")').count()>=2,true);await ulos()});
    await ok('graafit: päivä 14, viikko 12, kuukausi 12 palkkipaikkaa; yhteensä täsmää; ryhmävalinta ja kuorma',async()=>{
      await os('graafit');
      for(const [sc,nn] of [['pv',14],['vk',12],['kk',12]]){await p.click('[data-act=gscale][data-id='+sc+']');assert.equal(await p.locator('#app .chart .hit').count(),nn,sc);assert.equal(await p.locator('.bsg button.on').getAttribute('data-id'),sc)}
      await p.click('[data-act=gscale][data-id=pv]');const kvT=await p.locator('.kv b >> nth=0').textContent();assert.equal(kvT,'6');
      assert.equal(await p.locator('.chart .tl').count(),1,'tavoiteviiva');
      const R=await id('Rinta');await p.click('.chips [data-act=selg][data-id="'+R+'"]');assert.equal(await p.locator('.chips button.on').count(),1);assert.equal((await p.locator('.kv b >> nth=0').textContent()),'3,5');
      assert.equal(await p.locator('#app .chart rect.gc').evaluateAll(r=>new Set(r.map(x=>x.getAttribute('style'))).size),1,'yksi väri');
      await p.click('[data-act=met][data-id=k]');assert.equal((await p.locator('.kv b >> nth=0').textContent()),'5,3');await p.click('[data-act=met][data-id=s]');
      await p.click('.chips button.on');assert.equal(await p.locator('.chips button.on').textContent(),'Kaikki');assert.equal(await p.locator('#app .chart rect.gc').evaluateAll(r=>new Set(r.map(x=>x.getAttribute('style'))).size),2,'pinottu ryhmittäin');
      assert.equal(await p.locator('.hb').count(),4);await leveys()});
    await ok('graafit: palkin napautus avaa erittelyn, jonka summa täsmää; vk ja kk',async()=>{
      await p.click('.hit >> nth=-1');assert.equal(await p.locator('.pkd .tt').first().textContent(),'Yhteensä');assert.equal(await p.locator('.pkd .tt >> nth=1').textContent(),'2,5');await ulos();assert.equal(await p.locator('.pkd').count(),0);
      await p.click('[data-act=gscale][data-id=vk]');await p.click('.hit >> nth=-1');const tx=await p.locator('.pkd .tt >> nth=1').textContent();assert.equal(tx.replace(',','.')>0,true);await ulos();
      await p.click('[data-act=gscale][data-id=kk]');await p.click('.hit >> nth=-1');assert((await p.textContent('.pkd')).includes('Yhteensä'));await ulos();await p.click('[data-act=gscale][data-id=pv]')});
    await ok('tavoitteet: palkit, puuttuva määrä ja aikamerkki täsmäävät',async()=>{
      await os('tavoite');const R=await id('Rinta');
      const e=await p.evaluate(R=>{const n=TK.paiva(Date.now()),a=TK.pStart(TK.pIdx(n));return {v:TK.sum(R,a,a+13),el:(n-a+1)/14}},R);
      const t=await p.textContent('.tg >> nth=0');assert(t.includes('Rinta'));assert(t.includes('Puuttuu '+String(14-e.v).replace('.',',')),t);
      const m=await p.evaluate(()=>{const g=document.querySelector('.gbar'),u=g.querySelector('u');return u.offsetLeft/g.offsetWidth});assert(Math.abs(m-e.el)<.02,m+' vs '+e.el);
      assert.equal(await p.locator('.tg .gbar').count(),5);assert((await p.textContent('#app')).includes('Kokonaiskuormitus'));assert((await p.textContent('#app')).includes('Liukuva 14 pv'));
      await p.evaluate(R=>{const S=TK.S(),n=TK.paiva(Date.now()),a=TK.pStart(TK.pIdx(n));for(let i=0;i<16;i++){const d=new Date((a+1)*864e5+43200e3);d.setHours(9,i,0,0);S.sarjat.push({id:'z'+i,t:Date.now()-(n-a-1)*864e5+i*6e4,r:{[R]:1},m:''})}TK.save();TK.render()},R);
      assert((await p.textContent('.tg >> nth=0')).includes('Täynnä'));await leveys()});
    await ok('jakson alku vaihtuu asetuksista ja siirtää rajat',async()=>{
      const a0=await p.evaluate(()=>TK.pStart(TK.pIdx(TK.paiva(Date.now()))));
      await p.click('[data-act=valikko]');await p.click('[data-act=vsub][data-id=asetukset]');const cur=await p.locator('.seg button.on').getAttribute('data-id');
      assert(/vk \d+–\d+/.test(await p.textContent('.seg button.on')));await p.click('.seg button:not(.on)');const a1=await p.evaluate(()=>TK.pStart(TK.pIdx(TK.paiva(Date.now()))));assert.equal(Math.abs(a1-a0),7,'raja siirtyy viikolla');
      await p.click('.seg button:not(.on)');assert.equal(await p.evaluate(()=>TK.pStart(TK.pIdx(TK.paiva(Date.now())))),a0);assert.equal(await p.locator('.seg button.on').getAttribute('data-id'),cur);assert.equal(await p.locator('#app input').count(),0)});
    await ok('alapalkin nappien paikat eivät muutu osiosta toiseen; ulkoasu',async()=>{
      await p.click('[data-act=vback]');const v0=await xy('[data-act=viejson]'),m0=await xy('[data-act=valikko]');
      for(const o of ['treeni','jaksot','graafit','tavoite','ryhmat']){await os(o);assert.deepEqual(await xy('[data-act=viejson]'),v0,o);assert.deepEqual(await xy('[data-act=valikko]'),m0,o);assert.equal((await xy('#bar .roll'))[0],8,o);await leveys()}
      await p.click('[data-act=valikko]');await p.click('[data-act=vsub][data-id=ulkoasu]');await p.click('[data-act=vari][data-id=lake]');await p.click('[data-act=tila][data-id=dark]');assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'dark');
      const on=await p.evaluate(()=>{const e=document.querySelector('.seg button.on'),c=getComputedStyle(e),b=getComputedStyle(document.body);return [c.backgroundColor,b.color]});assert.equal(on[0],on[1],'valittu = käänteisväri');
      await p.click('[data-act=tila][data-id=auto]');await leveys()});
    await ok('punainen pallero muistuttaa viennistä; pikavienti suoraan alapalkista nimellä sarjakartta.json; tuonti vahvistuksella',async()=>{
      await p.click('[data-act=vback]');assert.equal(await p.locator('#bar .xdot').count(),1);
      const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bar [data-act=viejson]')]);assert.equal(dl.suggestedFilename(),'sarjakartta.json');
      const f=await dl.path(),d=JSON.parse(fs.readFileSync(f,'utf8'));assert.equal(d.app,'sarjakartta');assert.equal(d.data.ryhmat.length,4);assert((await S()).as.viety);assert.equal(await p.locator('#bar .xdot').count(),0);assert.equal(await p.locator('.pkd').count(),0,'ikkuna välissä');
      const tmp=path.join(require('os').tmpdir(),'sk-test-'+w+'.json');fs.writeFileSync(tmp,JSON.stringify({app:'sarjakartta',ver:1,data:{ryhmat:[{id:'a',nimi:'Vatsa'}],sarjat:[{id:'x',t:Date.now(),r:{a:1}}]}}));
      await p.click('[data-act=valikko]');await p.click('[data-act=vsub][data-id=varmuus]');const vb=await p.locator('[data-act=vback]').boundingBox();assert(vb.x<12&&vb.y>h-70);
      await p.setInputFiles('#pikafile',tmp);await p.waitForSelector('[data-act=tuojson2]');await ulos();assert.equal((await S()).ryhmat.length,4,'ulkopuolinen napautus toi');
      await p.setInputFiles('#pikafile',[]);await p.setInputFiles('#pikafile',tmp);await p.waitForSelector('[data-act=tuojson2]');await p.click('[data-act=tuojson2]');
      const s=await S();assert.deepEqual(s.ryhmat.map(g=>g.nimi),['Vatsa']);assert.equal(s.ryhmat[0].kuorma,1);assert.equal(s.sarjat.length,1);await p.click('[data-act=vback]');await os('treeni');assert(await p.locator('.gt .gr').count()===1)});
    await ok('arkistointi: käytetty ryhmä arkistoituu ja palautuu, käyttämätön poistuu; poisto vahvistuksella',async()=>{
      await os('ryhmat');await uusi('Turha');await p.click('#vl .vnm:has-text("Turha")');await p.click('[data-act=delr]');await ulos();assert.equal((await S()).ryhmat.length,2);
      await p.click('#vl .vnm:has-text("Turha")');await p.click('[data-act=delr]');await p.click('.cf [data-act=delr2]');assert.equal((await S()).ryhmat.length,1);
      await p.click('#vl .vnm:has-text("Vatsa")');await p.click('[data-act=delr]');await p.click('.cf [data-act=delr2]');const s=await S();assert.equal(s.ryhmat[0].arkisto,true);assert.equal(s.sarjat.length,1);
      assert((await p.textContent('#app')).includes('Arkistoidut'));await p.click('[data-act=restore]');assert(!(await S()).ryhmat[0].arkisto)});
    await ok('kenttien teksti vähintään 16 px, alapalkin napit vähintään 44 px, ei emojeja',async()=>{
      const tark=async v=>{const pienet=await p.evaluate(()=>[...document.querySelectorAll('input:not([type=file]),textarea,select')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).map(e=>e.id));assert.deepEqual(pienet,[],v);
        const matalat=await p.evaluate(()=>[...document.querySelectorAll('#bar button')].filter(e=>e.getBoundingClientRect().height<44).map(e=>e.dataset.act));assert.deepEqual(matalat,[],v);
        assert(!/[☀-➿\u{1F000}-\u{1FAFF}]/u.test((await p.innerText('body')).replace(/[→✓×−½‹–]/g,'')),'emoji '+v)};
      await os('treeni');await p.click('[data-act=plus]');await tark('sarja');await p.click('[data-act=aika]');await tark('aika');await p.click('[data-act=note]');await tark('muistiinpano');await ulos();
      await os('ryhmat');await p.click('[data-act=uusi]');await tark('uusi');await ulos();await p.click('[data-act=valikko]');await p.click('[data-act=vsub][data-id=varmuus]');await tark('varmuus');
      assert((await p.getAttribute('meta[name=viewport]','content')).includes('maximum-scale=1'))});
    await ok('päivän vaihtuessa näkymä päivittyy itsestään (appi taustalta takaisin)',async()=>{
      await os('treeni');const h0=await p.textContent('#hd h1');
      await p.evaluate(()=>{window.__now=Date.now;Date.now=()=>window.__now()+864e5;document.dispatchEvent(new Event('visibilitychange'))});
      const h1=await p.textContent('#hd h1');assert.notEqual(h1,h0);assert.equal(await p.locator('.sr').count(),0,'uusi päivä alkaa tyhjänä');
      await p.evaluate(()=>{Date.now=window.__now;document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await p.textContent('#hd h1'),h0)});
    await ok('vanhan tai rikkinäisen tallennuksen korjaus ja pysyvyys uudelleenlatauksessa',async()=>{
      const a=await S();await p.reload();const b=await S();assert.deepEqual(JSON.parse(JSON.stringify(b.ryhmat)),JSON.parse(JSON.stringify(a.ryhmat)));assert.equal(b.sarjat.length,a.sarjat.length);
      await p.evaluate(()=>localStorage.setItem('sarjakartta.v1',JSON.stringify({ryhmat:[{id:'q',nimi:'Rinta',kuorma:-3,tavoite:'x'}],sarjat:[{t:Date.now(),r:{q:7,zzz:1}},{t:'x'}],as:{gs:'ei'}})));await p.reload();
      const s=await S();assert.equal(s.ryhmat[0].kuorma,1);assert.equal(s.ryhmat[0].tavoite,0);assert.deepEqual(s.sarjat.map(x=>x.r),[{}]);assert.equal(s.as.gs,'pv');assert([0,1].includes(s.as.j0));
      await os('jaksot');await os('graafit');await os('tavoite')});
    assert.deepEqual(errs,[]);await ctx.close();
  }
  console.log(n+' selaintestiä läpi');await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
