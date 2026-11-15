/* Mätsik Forest 0.8: käyttö selaimessa. Eläimet, Nyt-kortti ja portaat, lukutila ja muokkausarkki (Seuraava samassa kentässä, näppäimistö), syklinauha ja Sovi, mittaus muistiosta, tavoitekartta, työjono, Valikon alasivut ja säännöt, eläinlista vierivänä ruudukkona (0.9), listan tarkistusnäkymä ja ankkuri (1.0),
   osiot vaiheittain, käyntisykli, muokattavat luettelot, käynti muistiosta, herjat, tahojen tavoitteet tasoittain, seuranta ja arviointikierros,
   periaatteet, mittarit, ohjauksen arvio, haasteet, muistion automaattitallennus,
   alapalkin osionappi ja pikavienti, Juuren mallinen kalenteri (pito ja viiva, siirto, keston venytys, päivän vaihto pudottamalla, kuukausi),
   tuonti, ei vaakavieritystä. 390 ja 320 px kosketuksella, 1280 hiirellä. */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const U=process.env.MFU||'file://'+path.resolve(__dirname,'..','index.html'),D="JSON.parse(localStorage.getItem('matsik:v1')).data";
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
async function run(b,w,h,touch){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch,acceptDownloads:true}),pg=await ctx.newPage(),errs=[],bad=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  const want=(l,c)=>{console.log('  '+l.padEnd(56)+(c?'ok':'VIRHE'));if(!c)bad.push(l);};
  const tap=async s=>{const l=pg.locator(s).first();if(touch)await l.tap();else await l.click();await pg.waitForTimeout(80);};
  const wide=()=>pg.evaluate('document.documentElement.scrollWidth>innerWidth+1');
  const hj=()=>pg.locator('#hjc').innerText();
  const cdp=touch?await ctx.newCDPSession(pg):null;
  async function touchSeq(pts,holdMs){/* pts: [[x,y],...]; pito ensimmäisessä pisteessä */
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pts[0][0],y:pts[0][1]}]});await pg.waitForTimeout(holdMs);
    for(const p of pts.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p[0],y:p[1]}]});await pg.waitForTimeout(40);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pg.waitForTimeout(150);}
  async function drag(pts,holdMs){if(touch)return touchSeq(pts,holdMs);await pg.mouse.move(pts[0][0],pts[0][1]);await pg.mouse.down();await pg.waitForTimeout(holdMs);
    for(const p of pts.slice(1)){await pg.mouse.move(p[0],p[1],{steps:4});}await pg.mouse.up();await pg.waitForTimeout(150);}
  console.log('leveys',w);
  await pg.goto(U);await pg.waitForTimeout(200);
  const HJ=()=>pg.evaluate("(()=>{const d=MF.repair(JSON.parse(localStorage.getItem('matsik:v1')).data);const a=d.asiakkaat.find(x=>x.nimi==='Kettu');return a?MF.herjat(a,d,MF.iso(new Date())).map(x=>x.teksti).join('|'):'';})()");
  const A=D+".asiakkaat[0]";
  want('otsikko Eläimet ja tyhjän listan ohje',(await pg.locator('h1').first().innerText())==='Eläimet'&&await pg.locator('.empty').count()===1);
  want('plusnappi alapalkissa, ei yläpalkissa',await pg.locator('#bar [data-act=uusi]').count()===1&&await pg.locator('.hd [data-act=uusi]').count()===0);
  await tap('#bar [data-act=uusi]');await pg.fill('#nn','Kettu');await tap('[data-act=uusiok]');
  want('eläin avautuu: alapalkissa takaisin, 4 vaihetta ja plus',(await pg.locator('h1').first().innerText()).includes('Kettu')&&await pg.locator('#bar [data-act=home]').count()===1&&await pg.locator('#bar .stb').count()===4&&await pg.locator('#bar [data-act=pika]').count()===1);
  want('Nyt-kortti: tulosyy ensin, syy ja Kuittaa-nappi',(await hj()).includes('Tulosyy puuttuu')&&(await hj()).includes('Ensin, koska')&&await pg.locator('#hjc [data-act=goto][data-o=tulosyy]').count()===1);
  want('portaat: vain vaiheen 1 puutteet',await pg.locator('.stb[data-v="1"] .dot.warn').count()===1&&await pg.locator('.stb[data-v="2"] .dot.ok').count()===1&&!(await HJ()).includes('Diagnoosit'));
  want('1.2: eläimen sivulla ei tekstikenttiä eikä lisäysnappeja, osiot kuitataan OK / Ei',await pg.locator('.main textarea, .main input:not([type=date])').count()===0&&await pg.locator('.adds').count()===0&&await pg.locator('#sec-esitiedot .lci').count()===5&&await pg.locator('#sec-tulosyy [data-act=kuit]').count()===2);
  /* kuittaukset ja arkki valinnoille (1.2) */
  await tap('#hjc [data-act=goto]');await tap('#sec-tulosyy [data-v=ok]');
  want('tulosyy kuitattu OK ilman tekstiä',(await pg.evaluate(A+'.kuit.tulosyy.v'))==='ok'&&!(await HJ()).includes('Tulosyy puuttuu')&&await pg.locator('#sec-tulosyy [data-v=ok][aria-pressed=true]').count()===1);
  await tap('#sec-esitiedot [data-key="esitiedot.perhe"][data-v=ei]');
  want('Ei nostaa muistutuksen ja osio korostuu',(await HJ()).includes('Ei kunnossa: Esitiedot · Perhe')&&await pg.locator('#sec-esitiedot .ck.warn').count()===1);
  await tap('#sec-esitiedot [data-key="esitiedot.perhe"][data-v=ok]');want('OK kumoaa Ei:n',!(await HJ()).includes('Ei kunnossa'));
  await tap('#sec-tarve .rr[data-s=tarve]');want('valinnat avautuvat arkkiin ilman tekstikenttää: 1 / 4',(await pg.locator('#ed-n').innerText())==='1 / 4'&&await pg.locator('.sheet textarea, .sheet input[type=text]').count()===0);
  await tap('[data-act=edgo][data-d="1"]');await tap('.sheet [data-seg$=".q2"][data-v=kylla]');
  want('Seuraava vaihtaa valintaan 2 / 4 ja valinta tallentuu',(await pg.locator('#ed-n').innerText())==='2 / 4'&&(await pg.evaluate(A+'.tarve.q2'))==='kylla');
  await pg.evaluate("document.documentElement.style.setProperty('--vvh','380px');document.documentElement.classList.add('kb')");await pg.waitForTimeout(50);
  want('näppäimistö auki: arkki näkyvän alueen sisällä, alapalkki piiloon',await pg.evaluate("document.querySelector('.sheet .pn').getBoundingClientRect().bottom<=381&&getComputedStyle(document.getElementById('bar')).display==='none'"));
  await pg.evaluate("document.documentElement.style.removeProperty('--vvh');document.documentElement.classList.remove('kb')");
  await tap('.sheet .x');
  await tap('#sec-vahvuudet [data-v=ok]');
  want('portaat: vaihe 1 valmis, vaiheen 2 puutteet näkyvät',(await HJ()).includes('Diagnoosit puuttuvat'));
  await tap('#sec-diagnoosit [data-act=ed]');want('diagnoosit valitaan luettelosta, ei tekstikenttää',await pg.locator('.sheet input, .sheet textarea').count()===0&&(await pg.locator('.sheet').innerText()).includes('Diagnoosiluettelo on tyhjä'));
  await tap('.sheet .x');await tap('#sec-diagnoosit [data-v=ok]');want('diagnoosit kuitattu',!(await HJ()).includes('Diagnoosit puuttuvat'));
  /* hoitotoimet ja syklinauha */
  want('välit: 6 vaihtoehtoa, valinnat näkyvät heti ilman muokkausnappia',await pg.locator('#sec-toimet .slotb').count()===6&&await pg.locator('#sec-toimet [data-syk=v1]').count()>=5&&await pg.locator('[data-act=slotedit],[data-act=slotok]').count()===0);
  await pg.fill('#sec-toimet input[data-syal]',iso(new Date()));await pg.locator('#sec-toimet input[data-syal]').dispatchEvent('change');
  want('välien alkupäivä suoraan sivulla',(await pg.evaluate(A+'.toimet.alku'))===iso(new Date()));
  const nS=async()=>((await HJ()).match(/varattava/g)||[]).length;
  await tap('[data-syk=v1][data-v=lahi]');await tap('[data-act=slotsel][data-k=k2]');await tap('[data-syk=k2][data-v=paino]');await tap('[data-act=slotsel][data-k=v4]');await tap('[data-syk=v4][data-v=laak]');
  want('välit tallentuivat',JSON.stringify(await pg.evaluate(A+'.toimet.vali'))==='{"lahi":"v1","paino":"k2","laak":"v4"}');
  want('toisen välin sisältö näkyy himmeänä välin kanssa',await pg.locator('[data-syk=v4][data-v=lahi].muu').count()===1);
  await tap('[data-syk=v4][data-v=lahi]');await tap('[data-syk=v4][data-v=lahi]');want('napautus siirtää ja toinen poistaa',JSON.stringify(await pg.evaluate(A+'.toimet.vali'))==='{"paino":"k2","laak":"v4"}');
  await tap('[data-act=slotsel][data-k=v1]');await tap('[data-syk=v1][data-v=lahi]');
  want('nauhassa tilapisteet',await pg.locator('.slotb[data-k=v1] .dot.miss').count()===1&&await pg.locator('.slotb[data-k=k2] .dot').count()===1&&await pg.locator('.slotb[data-k=v4] .dot').count()===1);
  want('viikoittainen: nykyinen ja 2 seuraavaa viikkoa näkyvissä',await pg.locator('#sec-toimet .sli').count()===3+2);
  want('1.12: oletuslistassa tason 1 tavoiterivit ylinnä, joten puuttuvat tavoitteet nousevat käyntien edelle',/^Tavoitteet puuttuvat/.test(await hj()));
  await pg.evaluate(()=>{const S=JSON.parse(localStorage.getItem('matsik:v1')),J=MF.jarj(MF.repair(S.data));S.data.asetukset.jarj=J.filter(k=>k.charAt(0)==='s').concat(J.filter(k=>k.charAt(0)!=='s'));localStorage.setItem('matsik:v1',JSON.stringify(S));});
  await pg.reload();await pg.waitForTimeout(200);await tap('.nl:has-text("Kettu")');
  want('Nyt-kortti: varattava käynti ensin, Sovi-nappi',/Lähikäynti varattava/.test(await hj())&&await pg.locator('#hjc .nrow [data-act=sovi]').count()===1&&await nS()===5);
  await tap('#hjc [data-act=sovi]');
  want('Sovi avaa muistiinpanon valmiilla alulla',(await pg.locator('#nt').inputValue())==='Kettu lähikäynti ');
  await pg.locator('#nt').press('End');await pg.locator('#nt').pressSequentially('huomenna klo 14');await tap('.sheet [data-act=close]');
  want('käynti tallentui ilman tallenna-nappia',await pg.evaluate(D+'.muistio.length')===1);
  want('lähikäynti sovittu: jakso hoidettu',await nS()===4&&await pg.locator('#sec-toimet .sli .dot.plan').count()===1);
  await tap('#sec-toimet .sli [data-act=vok]');want('OK kuittaa jakson ilman merkintää',await nS()===3&&await pg.locator('#sec-toimet .sli [data-act=vok]:has-text("Kuitattu")').count()===1);
  await tap('#sec-toimet .sli [data-act=vok]:has-text("Kuitattu")');want('kuittauksen voi perua',await nS()===4);
  await tap('#bar [data-act=pika]');want('plus avaa pikamuistiinpanon, eläin valittuna',(await pg.locator('.sheet [data-act=pikaa][aria-pressed=true]').innerText())==='Kettu'&&await pg.locator('.sheet [data-act=pikai]').count()===6&&await pg.locator('.sheet .gear').count()===1);
  await tap('.sheet [data-act=pikai][data-id=resepti]');
  const pkb=await pg.locator('.pkd').boundingBox();
  want('kuukausivalitsin aukeaa heti, ei näppäimistöä',await pg.locator('.pkd .pcd').count()===42&&await pg.locator('.pkd input, .pkd textarea').count()===0&&pkb.x>=0&&pkb.x+pkb.width<=w+0.5);
  const pdA=new Date();pdA.setDate(1);pdA.setDate(9);const pdB=new Date(pdA);pdB.setDate(10);const pdC=new Date(pdA);pdC.setDate(16);
  await tap('.pcd[data-d="'+iso(pdA)+'"]');await tap('.pcd[data-d="'+iso(pdB)+'"]');
  const pkb2=await pg.locator('.pkd').boundingBox();
  want('monta päivää samaan muistiinpanoon, valitsin pysyy paikallaan',(await pg.evaluate(D+'.muistio.filter(n=>n.pika).length'))===1&&(await pg.evaluate(D+'.muistio.find(n=>n.pika).pika.pv.length'))===2&&await pg.locator('.pcd[aria-pressed=true]').count()===2&&Math.abs(pkb2.y-pkb.y)<1&&Math.abs(pkb2.height-pkb.height)<1);
  await tap('.pcd[data-d="'+iso(pdB)+'"]');await tap('.pcd[data-d="'+iso(pdC)+'"]');
  want('toinen napautus poistaa päivän',JSON.stringify(await pg.evaluate(D+'.muistio.find(n=>n.pika).pika.pv'))===JSON.stringify([iso(pdA),iso(pdC)]));
  const pm0=await pg.locator('.pcm span').innerText();await tap('[data-act=pikam][data-d="1"]');
  want('kuukauden vaihto, ruudukko saman kokoinen',(await pg.locator('.pcm span').innerText())!==pm0&&await pg.locator('.pcd').count()===42&&Math.abs((await pg.locator('.pkd').boundingBox()).height-pkb.height)<1);
  await tap('[data-act=pikam][data-d="-1"]');
  await pg.mouse.click(4,4);await pg.waitForTimeout(120);
  want('ulkopuolinen napautus sulkee valitsimen, päivät luettelona',await pg.locator('.pkd').count()===0&&await pg.locator('.sheet [data-act=pikai]').count()===6&&/Reseptiuusinta: /.test(await pg.locator('.pks').innerText())&&await pg.locator('.pks [data-lp]').count()===1);
  await tap('.sheet [data-act=pikai][data-id=resepti]');
  want('uudelleen avattaessa valitut päivät näkyvät',await pg.locator('.pcd[aria-pressed=true]').count()===2);
  await pg.mouse.click(4,4);await pg.waitForTimeout(120);
  await pg.locator('.pks [data-lp]').dispatchEvent('pointerdown');await pg.waitForTimeout(700);
  want('pitkä painallus näyttää vahvistuksen eri kohdassa',await pg.locator('.pks [data-act=lpyes]').count()===1&&await pg.locator('.pks [data-act=lpno]').count()===1);
  await tap('.pks [data-act=lpno]');want('Peru jättää muistiinpanon',await pg.locator('.pks [data-lp]').count()===1);
  await pg.locator('.pks [data-lp]').dispatchEvent('pointerdown');await pg.waitForTimeout(700);const nm0=await pg.evaluate(D+'.muistio.length');await tap('.pks [data-act=lpyes]');
  want('vahvistus poistaa pikamuistiinpanon',await pg.evaluate(D+'.muistio.length')===nm0-1&&await pg.locator('.pks [data-lp]').count()===0);
  const pd3=new Date();pd3.setDate(pd3.getDate()+3);
  await tap('.sheet [data-act=pikai][data-id=soitto]');await tap('.pcd[data-d="'+iso(pd3)+'"]');await pg.mouse.click(4,4);await pg.waitForTimeout(120);
  want('päivätty pikamuistiinpano näkyy kalenterissa',await pg.evaluate("MF.allEntries(MF.repair(JSON.parse(localStorage.getItem('matsik:v1')).data),MF.iso(new Date())).some(e=>/Kettu soitto/.test(e.rivi))"));
  await tap('.sheet [data-act=pikavapaa]');want('Vapaa teksti avaa muistiinpanon eläimen nimellä',(await pg.locator('#nt').inputValue())==='Kettu ');
  await pg.locator('#nt').press('End');await pg.locator('#nt').pressSequentially('paino 41');await tap('.sheet [data-act=close]');
  want('muistion mittaus täyttää painon ja näkyy lääkeseurannassa',await pg.locator('.slotb[data-k=k2] .dot.ok').count()===1&&(await pg.locator('#sec-seuranta .rr').innerText()).includes('41')&&await nS()===3);
  await tap('.stb[data-v="3"]');await pg.waitForTimeout(400);
  want('vaihenappi vierittää vaiheeseen 3',(w>=900||await pg.evaluate("document.getElementById('vh-3').getBoundingClientRect().top<220"))&&await pg.locator('.stb[data-v="3"][aria-current=true]').count()===1);
  /* tavoitekartta */
  want('tavoitekartassa ei hoidon syitä',await pg.locator('.syys, [data-act=syyadd]').count()===0);
  want('tavoitekartta 3 × 3',await pg.locator('.gmap .cell').count()===9);
  await pg.locator('[data-act=cell][data-c="2:vanh"]').scrollIntoViewIfNeeded();const cy0=await pg.locator('[data-act=cell][data-c="2:vanh"]').evaluate(e=>e.getBoundingClientRect().top);
  await tap('[data-act=cell][data-c="2:vanh"]');want('ankkuri: painettu ruutu pysyy paikallaan',Math.abs((await pg.locator('[data-act=cell][data-c="2:vanh"]').evaluate(e=>e.getBoundingClientRect().top))-cy0)<2);
  want('ruutu aukeaa kartan alle kuittausrivin kanssa',(await pg.locator('.cellh').first().innerText()).includes('Vanhemmat')&&await pg.locator('.lci [data-key="tavoitteet.2.vanh"]').count()===2&&await pg.locator('[data-act=tavadd][data-lv="2"][data-th=vanh]').count()===1);
  await tap('.lci [data-key="tavoitteet.2.vanh"][data-v=ok]');want('ruutu kuitattu OK',(await pg.evaluate(A+'.kuit["tavoitteet.2.vanh"].v'))==='ok'&&(await pg.locator('.cell[data-c="2:vanh"]').innerText()).includes('OK'));
  await tap('[data-act=tavadd][data-lv="2"][data-th=vanh]');
  want('painettu ruutu näkyy korostettuna arkin yläpuolella',await pg.locator('.cell.anc').count()===1&&await pg.evaluate("document.querySelector('.cell.anc').getBoundingClientRect().bottom<=document.querySelector('#sheet .pn').getBoundingClientRect().top")&&(await pg.locator('.cell.anc').innerText()).includes('Alussa')&&await pg.locator('.sheet textarea').count()===0);
  want('uusi tavoite tasolle 2 vanhemmille',JSON.stringify(await pg.evaluate(A+'.tavoitteet.map(t=>[t.taso,t.taho])'))==='[[2,"vanh"]]');
  await tap('[data-act=edgo][data-d="1"]');await tap('[data-act=edgo][data-d="1"]');await tap('.sheet [data-seg$=".taho"][data-v=lapsi]');
  want('taho vaihtuu arkissa',JSON.stringify(await pg.evaluate(A+'.tavoitteet.map(t=>[t.taso,t.taho])'))==='[[2,"lapsi"]]');
  await tap('.eda [data-act=close]');
  want('tavoite näkyy oikeassa ruudussa ja ruutu seuraa',(await pg.locator('.cell[data-c="2:lapsi"]').innerText()).includes('Alussa')&&await pg.locator('.cell[data-c="2:lapsi"][aria-pressed=true]').count()===1);
  await tap('[data-pp=CPS]');want('periaate valittu tasolla 2',JSON.stringify(await pg.evaluate(A+'.periaatteet'))==='["CPS"]');
  await tap('.gc [data-act=ed][data-f=seur]');await tap('.sheet [data-seg$=".real"][data-v=e]');want('seuranta Ei herjaa',(await HJ()).includes('Ei realistinen: Hoitosuhde'));
  await tap('.sheet [data-seg$=".real"][data-v=e]');want('uusi napautus poistaa valinnan',!(await HJ()).includes('Ei realistinen'));await tap('.eda [data-act=close]');
  await tap('.gc [data-act=arvioi]');for(const p of ['lapsi','vanh','tyont'])await tap(`[data-act=aper][data-p=${p}][data-v=k]`);
  await tap('[data-act=aperok]');await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aopt][data-i="1"]');
  want('kierros päätyy psykoedukaatioon',(await pg.locator('.res').innerText()).includes('Psykoedukaatio'));
  await tap('[data-act=abak]');want('takaisin toimii',(await pg.locator('.q').innerText())==='Ymmärretäänkö, miksi juuri näitä asioita tarvitaan?');
  await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aok]');
  want('toimenpide muistutuksena ja tavoitekortilla',(await HJ()).includes('Psykoedukaatio')&&await pg.locator('.gc [data-act=tehty]').count()===1);
  await tap('.gc [data-act=tehty]');want('tehty poistaa muistutuksen',!(await HJ()).includes('Psykoedukaatio'));
  /* mittarit, haasteet, ohjaus */
  await tap('#sec-mittarit .rr[data-s=mtr]');await tap('[data-act=edgo][data-d="1"]');await pg.fill('#edm','36');await tap('.sheet [data-act=mtrkirj]');
  want('mittarin kirjaus arkissa',(await pg.evaluate(A+'.mittarit.fit.arvot[0].arvo'))==='36'&&(await pg.locator('#ed-b').innerText()).includes('36'));
  await tap('.eda [data-act=close]');want('mittarit lukutilassa',(await pg.locator('#sec-mittarit .rr').innerText()).includes('FIT'));
  want('haasteille ei lisäysnappia',await pg.locator('[data-act=hstadd]').count()===0);
  await tap('#sec-haasteet [data-v=ei]');want('haasteet Ei kunnossa',(await HJ()).includes('Ei kunnossa: Haasteet ja niiden ohjaus'));
  await tap('.rr[data-s=ohj]');want('ohjauksen arviossa ei tekstikenttää',await pg.locator('.sheet textarea, #ohj-lisa').count()===0);await tap('[data-act=ohjkirj][data-v=oikea]');
  want('ohjauksen arvio kirjattu',(await pg.evaluate(A+'.ohjaus[0].tulos'))==='oikea'&&(await pg.locator('#sec-tarve').innerText()).includes('Oikea yksikkö')&&await pg.locator('.sheet').count()===0);
  want('ei vaakavieritystä (eläin)',!await wide());
  await tap('#bar [data-act=home]');
  want('lista avautuu viikkonäkymään',await pg.locator('.ot.wk').count()===14&&await pg.locator('[data-act=lmode][data-v=vk][aria-pressed=true]').count()===1);
  await tap('[data-act=lmode][data-v=os]');
  want('lista: rivi, 14 osioruutua, ei suodattimia',await pg.locator('.lr').count()===1&&await pg.locator('.lr .ot').count()===14&&await pg.locator('[data-act=lf]').count()===0);
  want('ruutujen tilat: täytetty, tyhjä ja ensimmäinen tehtävä',await pg.locator('.ot.ok[data-k=tulosyy]').count()===1&&await pg.locator('.ot.tyh[data-k=kehitys]').count()===1&&await pg.locator('.ot.eka[data-k=toimet]').count()===1&&await pg.locator('.ot.eka').count()===1);
  await tap('#bar [data-act=uusi]');await pg.fill('#nn','Siili');await tap('[data-act=uusiok]');await tap('#bar [data-act=home]');
  want('järjestys: tärkein tekemätön asia ensin (Kettu ennen uutta Siiliä)',(await pg.locator('.nl b').allInnerTexts()).join()==='Kettu,Siili'&&await pg.locator('.lr:has-text("Siili") .ot.eka[data-k=tulosyy].puu').count()===1);
  const nx0=(await pg.locator('.nl').first().boundingBox()).x;await pg.locator('#tbl').evaluate(e=>e.scrollLeft=e.scrollWidth);await pg.waitForTimeout(100);
  want('ruudut vierivät yhdessä, nimet pysyvät',w>=900||(Math.abs((await pg.locator('.nl').first().boundingBox()).x-nx0)<4&&(await pg.locator('.lr').nth(0).locator('.ot[data-k=tulosyy]').boundingBox()).x<0&&(await pg.locator('.lr').nth(1).locator('.ot[data-k=tulosyy]').boundingBox()).x<0));
  want('ei vaakavieritystä (lista vieritettynä)',!await wide());
  await pg.locator('#tbl').evaluate(e=>e.scrollLeft=0);
  /* tarkistusnäkymä (1.0) */
  const SH=()=>pg.evaluate("(()=>{const d=MF.repair(JSON.parse(localStorage.getItem('matsik:v1')).data);const a=d.asiakkaat.find(x=>x.nimi==='Siili');return MF.herjat(a,d,MF.iso(new Date())).map(x=>x.teksti).join('|');})()");
  const ry0=await pg.locator('.lr:has-text("Siili")').evaluate(e=>e.getBoundingClientRect().top);
  await tap('.lr:has-text("Siili") .ot[data-k=tulosyy]');
  want('ruutu avaa osion tarkistuslistan rivin alle, rivi pysyy',await pg.locator('#lp').count()===1&&(await pg.locator('#lp .lph b').innerText())==='Tulosyy'&&await pg.locator('#lp [data-act=kuit]').count()===2&&
    Math.abs((await pg.locator('.lr:has-text("Siili")').evaluate(e=>e.getBoundingClientRect().top))-ry0)<2&&await pg.locator('.lr:has-text("Siili") + .lp').count()===1);
  const by0=await pg.locator('#lp [data-key=tulosyy][data-v=ok]').evaluate(e=>e.getBoundingClientRect().top);
  await tap('#lp [data-key=tulosyy][data-v=ok]');
  want('OK kuittaa ilman tekstiä: muistutus pois, ruutu vihreä, nappi paikallaan',!(await SH()).includes('Tulosyy puuttuu')&&await pg.locator('.lr:has-text("Siili") .ot.ok[data-k=tulosyy]').count()===1&&
    await pg.locator('#lp [data-key=tulosyy][data-v=ok][aria-pressed=true]').count()===1&&Math.abs((await pg.locator('#lp [data-key=tulosyy][data-v=ok]').evaluate(e=>e.getBoundingClientRect().top))-by0)<2);
  want('rivien järjestys ei muutu, kun osio on auki',(await pg.locator('.nl b').allInnerTexts()).join()==='Kettu,Siili');
  await tap('.lr:has-text("Siili") .ot[data-k=esitiedot]');want('ulkopuolinen napautus vain sulkee',await pg.locator('#lp').count()===0);
  await tap('.lr:has-text("Siili") .ot[data-k=esitiedot]');want('toinen ruutu avaa osion',(await pg.locator('#lp .lph b').innerText())==='Esitiedot'&&await pg.locator('#lp .lci').count()===5);
  await tap('#lp [data-key="esitiedot.perhe"][data-v=ei]');want('Ei nostaa asian muistutukseksi',(await SH()).includes('Ei kunnossa: Esitiedot · Perhe')&&(await pg.evaluate(D+'.asiakkaat[1].kuit["esitiedot.perhe"].v'))==='ei');
  await tap('#lp [data-key="esitiedot.perhe"][data-v=ei]');want('uusi napautus tyhjentää kuittauksen',!(await SH()).includes('Ei kunnossa'));
  await tap('.lr:has-text("Siili") .ot[data-k=tavoitteet]');await tap('.lr:has-text("Siili") .ot[data-k=tavoitteet]');want('tavoitteet: 9 kohtaa (taso × taho)',await pg.locator('#lp .lci').count()===9);
  want('ei vaakavieritystä (tarkistusnäkymä)',!await wide());
  await tap('#lp [data-act=lclose]');want('sulku',await pg.locator('#lp').count()===0);
  await tap('.lr:has-text("Kettu") .ot[data-k=haasteet]');await tap('#lp [data-act=goto]');await pg.waitForTimeout(500);
  want('Avaa eläin vie eläimen kyseiseen osioon',(await pg.locator('h1').first().innerText()).includes('Kettu')&&await pg.evaluate("(()=>{const r=document.getElementById('sec-haasteet').getBoundingClientRect();return r.top>=0&&r.top<innerHeight/2;})()"));
  await tap('#bar [data-act=home]');
  want('ei vaakavieritystä (lista)',!await wide());
  /* osionappi */
  await tap('#roll');want('osiovalikko aukeaa alhaalta',await pg.locator('.pop [data-nav]').count()===4);
  await tap('.pop [data-nav=muistio]');want('muistio auki, valikko kiinni',(await pg.locator('h1').first().innerText())==='Muistio'&&await pg.locator('.pop').count()===0);
  await pg.locator('#newnote').fill('Kettu soitto tänään klo 9 kuulumiset');await pg.waitForTimeout(1500);
  want('muistiinpano tallentui tauon jälkeen',await pg.evaluate(D+'.muistio.length')===4);
  await pg.locator('#newnote').fill('Kettu soitto tänään klo 9 kuulumiset, äiti mukana');await pg.locator('#newnote').blur();await pg.waitForTimeout(150);
  want('poistuminen tallentaa samaan muistiinpanoon',await pg.evaluate(D+'.muistio.length')===4&&(await pg.evaluate(D+'.muistio[3].text')).includes('äiti'));
  want('kenttä tyhjenee ja muistiinpano listalla',(await pg.locator('#newnote').inputValue())===''&&await pg.locator('.note mark').count()>=1);
  /* kalenteri */
  await tap('#roll');await tap('.pop [data-nav=kalenteri]');await pg.waitForTimeout(150);
  const today=iso(new Date());
  want('1.9: kalenterin oletus viikkonäkymä, tänään otsikkona, sitten Tällä viikolla',await pg.locator('.ag').count()===1&&await pg.locator('[data-act=calmode][data-v=vk][aria-pressed=true]').count()===1&&
    (await pg.locator('.agh').first().innerText()).includes('tänään')&&(await pg.locator('.agh').nth(1).innerText()).startsWith('Tällä viikolla')&&!await wide());
  const hb=async()=>JSON.stringify(await pg.evaluate(()=>['.calhead','#roll','#bar [data-act=calmode][data-v=vk]','#bar [data-act=calmode][data-v=aj]','#bar [data-act=calprev]','#bar [data-act=caltoday]','#bar [data-act=calnext]'].map(q=>{const r=document.querySelector(q).getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];})));
  const hb0=await hb(),hbv=JSON.parse(hb0);
  await tap('#bar [data-act=calmode][data-v=aj]');
  want('1.11: näkymän valinta alapalkissa, mikään ei liiku näkymää vaihtaessa',(await hb())===hb0&&hbv[0][3]<=32&&await pg.locator('.calsticky [data-act=calmode]').count()===0&&
    hbv.slice(1).every((r,k,A)=>r[1]===A[0][1]&&(k===0||A[k-1][0]+A[k-1][2]<=r[0]+2))&&hbv[6][0]+hbv[6][2]<=w&&await pg.locator('#bar [data-act=vie]').count()===0&&!await wide());
  want('kalenterin aikajana ja viikkonauha',await pg.locator('#timeline').count()===1&&await pg.locator('#week .cday').count()===7);
  want('tämän päivän merkintä aikajanalla klo 9',await pg.locator('.ev').count()>=1);
  const area=pg.locator(touch?'.area':`.area[data-day="${today}"]`).first(),ab=await area.boundingBox();
  const y13=await pg.evaluate(()=>document.querySelector('.area').getBoundingClientRect().top+13*48);
  await pg.evaluate(y=>window.scrollTo(0,window.scrollY+y-300),y13);await pg.waitForTimeout(100);
  let ay=await pg.evaluate(()=>document.querySelector('.area').getBoundingClientRect().top),x0=ab.x+ab.width/2;
  if(touch){await touchSeq([[x0,ay+13*48+5],[x0,ay+13*48+30],[x0,ay+14*48+5]],380);}
  else{await pg.mouse.click(x0,ay+14*48+5);await pg.waitForTimeout(150);}
  const nt=await pg.locator('#nt').inputValue().catch(()=> '');
  want('uusi merkintä aikajanalta avaa muistiinpanon klo 14',/klo 14\.00–14\.30/.test(nt));
  await pg.locator('#nt').press('End');await pg.locator('#nt').pressSequentially('Siili neuvottelu');await tap('.sheet [data-act=close]');
  want('uusi merkintä näkyy',await pg.locator('.ev:has-text("Siili neuvottelu")').count()===1);
  if(touch){await touchSeq([[x0,ay+18*48+5],[x0,ay+18*48+20],[x0+90,ay+18*48+20]],380);want('sivuveto peruu viivan',await pg.locator('.sheet').count()===0);}
  /* siirto 1 h alas ja keston venytys */
  ay=await pg.evaluate(()=>document.querySelector('.area').getBoundingClientRect().top);
  let eb=await pg.locator('.ev:has-text("Siili neuvottelu")').boundingBox();
  await drag([[eb.x+eb.width/2,eb.y+6],[eb.x+eb.width/2,eb.y+30],[eb.x+eb.width/2,eb.y+6+48]],touch?450:30);
  let txt=await pg.evaluate(D+".muistio.find(n=>/Siili/.test(n.text)).text");
  want('siirto kirjoittaa ajan tekstiin (15.00–15.30)',/klo 15\.00–15\.30/.test(txt));
  eb=await pg.locator('.ev:has-text("Siili neuvottelu") .grip').boundingBox();
  await drag([[eb.x+eb.width/2,eb.y+eb.height/2],[eb.x+eb.width/2,eb.y+eb.height/2+24]],30);
  txt=await pg.evaluate(D+".muistio.find(n=>/Siili/.test(n.text)).text");want('kahva pidentää (15.00–16.00)',/klo 15\.00–16\.00/.test(txt));
  /* pudotus toiselle päivälle viikkonauhalla */
  const other=await pg.evaluate(t=>[...document.querySelectorAll('#week .cday')].map(b=>b.dataset.day).find(d=>d!==t),today);
  const cb=await pg.locator(`#week .cday[data-day="${other}"]`).boundingBox();eb=await pg.locator('.ev:has-text("Siili neuvottelu")').boundingBox();
  await drag([[eb.x+eb.width/2,eb.y+10],[eb.x+eb.width/2,eb.y+40],[cb.x+cb.width/2,cb.y+cb.height/2]],touch?450:30);
  txt=await pg.evaluate(D+".muistio.find(n=>/Siili/.test(n.text)).text");const od=new Date(other);
  want('pudotus päivälle siirtää päivän',txt.includes(od.getDate()+'.'+(od.getMonth()+1)+'.')&&/klo 15\.00–16\.00/.test(txt));
  await tap('[data-act=month]');want('kuukausi-ikkuna',await pg.locator('.mday').count()>=28);await tap('.mday.today');
  want('kuukaudesta päivään',await pg.locator('.sheet').count()===0);
  await tap('#bar [data-act=calnext]');want('alapalkin › vaihtaa viikon',await pg.locator('#bar [data-act=caltoday]:not([disabled])').count()===1);
  await tap('#bar [data-act=caltoday]');
  want('ei vaakavieritystä (kalenteri)',!await wide());
  /* asetukset, pikavienti, tuonti */
  await tap('#roll');await tap('.pop [data-nav=valikko]');
  want('Valikko alasivuina',await pg.locator('.mrow[data-act=vsub]').count()===5);
  await tap('[data-act=vsub][data-k=ulkoasu]');want('alasivulla ‹ Valikko alapalkissa',await pg.locator('#bar [data-act=vback]').count()===1);
  await tap('[data-set=teema][data-v=kuutamo]');
  want('teema vaihtui',(await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()"))==='#141a2e');
  want('ei vaakavieritystä (valikko)',!await wide());
  /* muokattavat luettelot (0.3) */
  await tap('#bar [data-act=vback]');await tap('[data-act=vsub][data-k=luettelot]');
  await tap('#lc-sisallot [data-act=leadd]');await pg.fill('#le-n','Ryhmäkäynti');await pg.fill('#le-sanat','ryhmä');
  want('muokkaus auki, ei vaakavieritystä',await pg.locator('#lc-sisallot .ledit').count()===1&&!await wide());
  await tap('#lc-sisallot [data-act=leok]');
  want('oma sisältö tallentui luetteloon',await pg.evaluate(D+'.asetukset.sisallot.slice(-1)[0].n')==='Ryhmäkäynti'&&(await pg.locator('#lc-sisallot').innerText()).includes('Ryhmäkäynti'));
  await tap('#lc-muodot [data-act=leadd]');await tap('#lc-muodot [data-act=leok]');
  want('tyhjä uusi muoto ei jää luetteloon',await pg.evaluate(D+'.asetukset.muodot.length')===5);
  await tap('#lc-mittarit [data-act=leadd]');await pg.fill('#le-n','SDQ');await pg.fill('#le-mita','Vahvuudet ja vaikeudet');await tap('#lc-mittarit [data-act=leok]');
  want('oma mittari luetteloon',(await pg.evaluate(D+'.asetukset.mittarit.slice(-1)[0].mita'))==='Vahvuudet ja vaikeudet');
  await pg.fill('#pplist','CPS\nFIT\nMentalisaatio');want('periaateluettelo tallentui',(await pg.evaluate(D+'.asetukset.periaatteet.length'))===3);
  await tap('#roll');await tap('.pop [data-nav=asiakkaat]');await tap('.nl:has-text("Kettu")');await tap('[data-act=slotsel][data-k=v3]');
  want('oma sisältö valittavissa',await pg.locator('[data-syk=v3]',{hasText:'Ryhmäkäynti'}).count()===1);
  await tap('[data-syk=v3]:has-text("Ryhmäkäynti")');
  want('oma sisältö herjaa',(await HJ()).includes('Ryhmäkäynti varattava'));
  await tap('#bar [data-act=home]');await tap('#roll');await tap('.pop [data-nav=valikko]');await tap('[data-act=vsub][data-k=luettelot]');await tap('#lc-sisallot .lrow:has-text("Ryhmäkäynti") [data-act=leopen]');
  want('käyttömäärä näkyy ennen poistoa',(await pg.locator('#lc-sisallot .ledit').innerText()).includes('Käytössä 1'));
  await tap('#lc-sisallot [data-act=delask]');await tap('#lc-sisallot [data-act=delyes]');
  want('poisto poistaa myös eläimen väleistä',await pg.evaluate(D+'.asetukset.sisallot.length')===10&&Object.keys(await pg.evaluate(D+'.asiakkaat[0].toimet.vali')).length===3);
  /* säännöt (0.8) */
  await tap('#bar [data-act=vback]');want('1.12: Muistutusten säännöt -sivua ei enää ole',await pg.locator('[data-act=vsub][data-k=saannot]').count()===0);await tap('[data-act=vsub][data-k=valit]');
  await tap('[data-act=portaat][data-v="0"]');want('portaat pois',(await pg.evaluate(D+'.asetukset.portaat'))===false);
  want('ei vaakavieritystä (säännöt)',!await wide());
  await tap('#roll');await tap('.pop [data-nav=asiakkaat]');
  const [dl]=await Promise.all([pg.waitForEvent('download'),tap('#bar [data-act=vie]')]);
  want('pikavienti alapalkista',await pg.evaluate('MF.FILE')==='Mätsik Forest.json'&&['Mätsik Forest.json','download'].includes(dl.suggestedFilename()));
  const ftxt=fs.readFileSync(await dl.path(),'utf8'),o=JSON.parse(ftxt);want('vientimuoto',o.app==='matsik'&&o.data.asiakkaat[0].nimi==='Kettu'&&o.data.muistio.length===5);
  await pg.evaluate('localStorage.clear()');await pg.reload();await pg.waitForTimeout(150);await tap('#roll');await tap('.pop [data-nav=valikko]');await tap('[data-act=vsub][data-k=tiedot]');
  await tap('[data-act=tuoteksti]');await pg.fill('#tt',ftxt);await tap('[data-act=ttok]');await tap('[data-act=tuook]');
  want('tuonti palautti eläimet',await pg.locator('.lr').count()===2);
  /* viikkonäkymä (1.5) */
  want('oletuksena viikot: 14 viikkoa, kuluva ensin viikkonumerona',await pg.locator('.lr').first().locator('.ot.wk').count()===14&&(await pg.locator('.lr').first().locator('.ot.wk b').first().innerText())===String(await pg.evaluate('MF.isoWeek(MF.iso(new Date()))')));
  await pg.evaluate(()=>{const S=JSON.parse(localStorage.getItem('matsik:v1')),d=new Date();d.setDate(d.getDate()+7);S.data.muistio.push({id:'wq',text:'Kettu neuvottelu koulun kanssa '+d.getDate()+'.'+(d.getMonth()+1)+'. klo 13\nOta lomake mukaan.',tila:{},created:new Date().toISOString(),edited:new Date().toISOString()});localStorage.setItem('matsik:v1',JSON.stringify(S));});
  await pg.reload();await pg.waitForTimeout(200);
  const ord0=(await pg.locator('.nl b').allInnerTexts()).join();
  await tap('.lr:has-text("Kettu") .ot.wk >> nth=1');
  want('viikon lista rivin alle, muistiinpano mukana',await pg.locator('.lr:has-text("Kettu") + .lp').count()===1&&(await pg.locator('#lp .lph b').innerText()).startsWith('Vk ')&&await pg.locator('#lp .nlink:has-text("neuvottelu")').count()===1);
  await tap('#lp .nlink:has-text("neuvottelu")');want('pikakatselu päällimmäisenä',(await pg.locator('#qv').innerText()).includes('Ota lomake mukaan'));
  await pg.mouse.click(4,200);await pg.waitForTimeout(150);want('ulkopuolinen napautus sulkee vain pikakatselun',await pg.locator('#qv').count()===0&&await pg.locator('#lp').count()===1);
  await tap('#lp .lci:has(.nlink:has-text("neuvottelu")) [data-act=tila]');want('muistiinpano kuitattu OK, lista pysyy auki',(await pg.evaluate(D+".muistio.find(n=>n.id==='wq').tila"))[Object.keys(await pg.evaluate(D+".muistio.find(n=>n.id==='wq').tila"))[0]]==='toteutui'&&await pg.locator('#lp').count()===1);
  if(await pg.locator('#lp [data-act=vok]').count())await tap('#lp [data-act=vok]');
  want('järjestys pysyy, kun viikko on auki',(await pg.locator('.nl b').allInnerTexts()).join()===ord0);
  await tap('.lr:has-text("Siili") .nl');want('napautus ulkopuolelle sulkee eikä avaa eläintä',await pg.locator('#lp').count()===0&&(await pg.locator('h1').first().innerText())==='Eläimet');
  want('ei vaakavieritystä (viikot)',!await wide());
  const wi=await pg.evaluate(()=>{const m=d=>{d=new Date(d.getFullYear(),d.getMonth(),d.getDate());d.setDate(d.getDate()-((d.getDay()+6)%7));return d;},t=new Date(),p=new Date();p.setDate(p.getDate()+3);return Math.round((m(p)-m(t))/864e5/7);});
  await tap('.lr:has-text("Kettu") .ot.wk >> nth='+wi);
  want('pikamuistiinpanon päivä viikon listassa',await pg.locator('#lp [data-lp^="pd:"]').count()===1&&/soitto/.test(await pg.locator('#lp [data-lp^="pd:"]').innerText()));
  await pg.locator('#lp [data-lp^="pd:"]').dispatchEvent('pointerdown');await pg.waitForTimeout(700);
  want('pitkä painallus listassa: Poista päivä',await pg.locator('#lp [data-act=lpday]').count()===1&&await pg.locator('#lp [data-act=lpno]').count()===1);
  await tap('#lp [data-act=lpday]');
  want('päivä poistettu, ainoan päivän muistiinpano pois',await pg.locator('#lp [data-lp^="pd:"]').count()===0&&(await pg.evaluate(D+'.muistio.filter(n=>n.pika).length'))===0);
  await pg.mouse.click(4,200);await pg.waitForTimeout(150);
  await tap('#bar [data-act=pika]');want('listalta pikamuistiinpano ilman valittua eläintä',await pg.locator('.sheet [data-act=pikaa][aria-pressed=true]').count()===0&&await pg.locator('.sheet [data-act=pikai][disabled]').count()===6);
  const py0=await pg.locator('.sheet [data-act=pikai]').first().evaluate(e=>e.getBoundingClientRect().top);await tap('.sheet [data-act=pikaa]');
  want('eläimen valinta ei siirrä asianappeja',Math.abs((await pg.locator('.sheet [data-act=pikai]').first().evaluate(e=>e.getBoundingClientRect().top))-py0)<1&&await pg.locator('.pkh').count()===0);
  await tap('.sheet [data-act=pikanew]');await pg.fill('#pknew','Kotikäynti');await pg.press('#pknew','Enter');
  want('uusi valinta suoraan ikkunasta ilman päivää',await pg.locator('.sheet [data-act=pikai]').count()===7&&await pg.locator('.sheet [data-act=pikai]:has-text("Kotikäynti")').count()===1&&await pg.locator('#pkdate').count()===0&&(await pg.evaluate(D+'.asetukset.pikat.length'))===7);
  await tap('.sheet .gear');want('ratas vie pikanappien asetuksiin',await pg.locator('#lc-pikat').count()===1&&await pg.locator('.sheet').count()===0);
  /* 1.9: oletusväli, pikapäivä tarkistettavana, OK kalenterin viikkonäkymästä nollaa välin */
  await tap('#bar [data-act=vback]');await tap('[data-act=vsub][data-k=valit]');
  want('1.12: yksi lista: 33 riviä, 8 sarakeotsikkoa, ei näppäimistöä eikä poistoa',await pg.locator('.vt').count()===1&&await pg.locator('#vl .vtr[data-row]').count()===33&&await pg.locator('#vlh .vth').count()===8&&await pg.locator('#vl .vtc').count()===10*6+23*5&&
    await pg.locator('#app input').count()===0&&await pg.locator('.vt [data-act^=del], .vt [data-act=leopen]').count()===0&&!await wide());
  want('tuotu järjestys säilyy (käynnit siirretty aiemmin kärkeen)',(await pg.locator('#vl .vtr[data-row]').evaluateAll(R=>R.map(r=>r.dataset.row.charAt(0)).join('')))==='s'.repeat(10)+'t'.repeat(9)+'o'.repeat(14));
  want('1.13: ohjeteksti i-napin takana, ei pitkiä ohjekappaleita',await pg.locator('.hd .ib').count()===1&&(await pg.locator('#app p.meta').allInnerTexts()).every(t=>t.length<60));
  const jj0=JSON.stringify(await pg.evaluate(D+'.asetukset.jarj||[]'));
  await tap('.hd .ib');want('i avaa ohjeen päälle',(await pg.locator('#infop .infd').innerText()).includes('raahaa')&&(await pg.locator('h1').first().innerText()).startsWith('Tarkistusvälit'));
  await pg.mouse.click(4,300);await pg.waitForTimeout(100);want('ulkopuolinen napautus sulkee ohjeen eikä tee muuta',await pg.locator('#infop .infd').count()===0&&JSON.stringify(await pg.evaluate(D+'.asetukset.jarj||[]'))===jj0&&(await pg.locator('h1').first().innerText()).startsWith('Tarkistusvälit'));
  await pg.evaluate(()=>window.scrollTo(0,700));await pg.waitForTimeout(80);
  want('sarakeotsikot jäädytetty yläreunaan',await pg.evaluate(()=>{const h=document.getElementById('vlh').getBoundingClientRect(),hd=document.querySelector('.hd').getBoundingClientRect();return Math.abs(h.top-hd.bottom)<2&&h.bottom<hd.bottom+40;}));
  want('otsikot vierivät sivuttain taulukon mukana',await pg.evaluate(async()=>{const t=document.getElementById('vl'),h=document.getElementById('vlh');t.scrollLeft=50;await new Promise(r=>setTimeout(r,60));const ok=h.scrollLeft===t.scrollLeft;t.scrollLeft=0;await new Promise(r=>setTimeout(r,60));return ok;}));
  await pg.evaluate(()=>window.scrollTo(0,0));
  const vdrag=async(from,to,after)=>{await pg.locator(from).scrollIntoViewIfNeeded();const a=await pg.locator(from+' .vgrip').boundingBox();await pg.mouse.move(a.x+a.width/2,a.y+a.height/2);await pg.mouse.down();
    for(let n=0;n<400;n++){const b=await pg.locator(to).evaluate(e=>{const r=e.getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(e).transform).m42;return {y:r.top-m,height:r.height};}),ty=after?b.y+b.height+4:b.y-4,vh=pg.viewportSize().height;
      if(ty>=95&&ty<=vh-145){for(let k=1;k<=4;k++)await pg.mouse.move(a.x+a.width/2,a.y+(ty-a.y)*k/4);break;}
      await pg.mouse.move(a.x+a.width/2,ty<95?60:vh-100);await pg.waitForTimeout(40);}
    await pg.mouse.up();await pg.waitForTimeout(80);};
  const vtap=async q=>{await pg.locator(q).evaluate(e=>{e.scrollIntoView({block:'center'});const t=document.getElementById('vl');t.scrollLeft=Math.max(0,e.offsetLeft+e.offsetWidth+4-t.clientWidth);});await tap(q);};
  const vc='#vl .vtc[data-id="s:verk"]',vtop=q=>pg.locator(q).evaluate(e=>e.getBoundingClientRect().top-document.getElementById('vl').getBoundingClientRect().top);
  await pg.locator(vc+'[data-v=k3]').scrollIntoViewIfNeeded();const vy0=await vtop(vc+'[data-v=k3]');
  await vtap(vc+'[data-v=v2]');await vtap(vc+'[data-v=k3]');
  want('yksi väli per asia, ruutu paikallaan',(await pg.evaluate(D+".asetukset.sisallot.find(x=>x.id==='verk').ov"))==='k3'&&await pg.locator(vc+'[aria-pressed=true]').count()===1&&Math.abs((await vtop(vc+'[data-v=k3]'))-vy0)<1);
  await vtap('#vl .vtc[data-id="s:lahi"][data-v=v1]');await vtap('#vl .vtc[data-id="s:lahi"][data-v=v1]');want('uusi napautus poistaa välin',!(await pg.evaluate(D+".asetukset.sisallot.find(x=>x.id==='lahi').ov")));
  await vtap('#vl .vtc[data-id="o:tulosyy"][data-v=k6]');want('osion väli samasta listasta',(await pg.evaluate(D+'.asetukset.valit.tulosyy'))===6&&await pg.locator('#vl .vtc[data-id="o:tulosyy"][aria-pressed=true]').count()===1);
  await vtap('#vl .vtc[data-id="o:tulosyy"][data-v=k12]');
  await vtap('#vl .vtc[data-id="t:1.tyont"][data-v=v4]');
  want('tavoitteella oma väli (4 vk = 1 kk), viikkovälejä ei tarjota',(await pg.evaluate(D+'.asetukset.tavValit["1.tyont"]'))===1&&await pg.locator('#vl .vtc[data-id="t:1.lapsi"][data-v=k3][aria-pressed=true]').count()===1&&await pg.locator('#vl .vtc[data-id="t:1.lapsi"][data-v=v1]').count()===0);
  want('nimisarake pysyy, kun taulukkoa vieritetään',await pg.evaluate(()=>{const t=document.getElementById('vl');t.scrollLeft=60;const n=t.querySelectorAll('.vtn')[1];const ok=Math.abs(n.getBoundingClientRect().left-t.getBoundingClientRect().left)<1;t.scrollLeft=0;return ok;}));
  await pg.evaluate(()=>{document.getElementById('vl').scrollLeft=0;});
  const sx0=await pg.evaluate(()=>{const t=document.getElementById('vl');t.scrollLeft=40;return t.scrollLeft;});await tap('#vl .vtc[data-id="o:koulu"][data-v=v4]');
  want('sivuvieritys säilyy, kun ruutua napautetaan',(await pg.evaluate(()=>document.getElementById('vl').scrollLeft))===sx0);await pg.evaluate(()=>{document.getElementById('vl').scrollLeft=0;});
  await vdrag('#vl .vtr[data-row="t:1.lapsi"]','#vl .vtr[data-row="s:lahi"]');
  want('raahaus yli lajirajan: tason 1 tavoite käyntien edelle',(await pg.evaluate(D+'.asetukset.jarj.slice(0,2).join()'))==='t:1.lapsi,s:lahi'&&(await pg.locator('#vl .vtr[data-row]').first().getAttribute('data-row'))==='t:1.lapsi'&&(await pg.evaluate(D+'.asetukset.jarj.length'))===33);
  await vdrag('#vl .vtr[data-row="o:ohjaus"]','#vl .vtr[data-row="s:lahi"]');
  want('pitkä raahaus listan lopusta alkuun (sivu vierii mukana)',(await pg.evaluate(D+".asetukset.jarj.indexOf('o:ohjaus')"))===(await pg.evaluate(D+".asetukset.jarj.indexOf('s:lahi')"))-1&&(await pg.evaluate(D+".asetukset.jarj.indexOf('o:ohjaus')"))<6);
  const EV=f=>pg.evaluate("(()=>{const d=MF.repair(JSON.parse(localStorage.getItem('matsik:v1')).data),a=d.asiakkaat.find(x=>x.nimi==='Kettu'),t=MF.iso(new Date());return ("+f+")(d,a,t);})()");
  want('oletusväli koskee eläintä ilman omaa valintaa',(await EV("(d,a)=>MF.effVali(a,d).verk"))==='k3');
  const nmon=await EV("(d,a,t)=>MF.addDays(MF.monday(t),7)");
  await tap('#bar [data-act=pika]');await tap('.sheet [data-act=pikaa]:has-text("Kettu")');await tap('.sheet [data-act=pikai][data-id=verkosto]');
  if(!await pg.locator('.pcd[data-d="'+nmon+'"]').count())await tap('[data-act=pikam][data-d="1"]');
  await tap('.pcd[data-d="'+nmon+'"]');await pg.mouse.click(4,4);await pg.waitForTimeout(120);await tap('.sheet [data-act=close]');
  want('pikapäivä on tarkistettava päivä, ei varaus',(await EV("(d,a,t)=>MF.herjat(a,d,t).map(x=>x.teksti).join('|')")).includes('Verkosto tarkistettava '+(+nmon.slice(8))+'.'+(+nmon.slice(5,7))+'.'));
  await tap('#roll');await tap('.pop [data-nav=kalenteri]');await pg.waitForTimeout(150);await tap('#bar [data-act=calnext]');
  const ar='.agi:has-text("Kettu · Verkosto")';
  want('viikkonäkymässä päivän alla, tarkistettava',await pg.locator(ar).count()===1&&(await pg.locator(ar).innerText()).includes('tarkistettava')&&(await pg.locator(ar).evaluate(e=>{let p=e.previousElementSibling;while(p&&!p.classList.contains('agh'))p=p.previousElementSibling;return p?p.textContent:'';})).startsWith('ma '));
  const at0=await pg.locator(ar).evaluate(e=>e.getBoundingClientRect().top);
  await tap(ar);want('napautus avaa ikkunan OK-napilla',await pg.locator('#agp [data-act=tila][data-ok]').count()===1);
  await tap('#agp [data-act=tila][data-ok]');want('OK kuittaa heti, ikkuna pysyy auki',await pg.locator('#agp [data-act=tila][aria-pressed=true]').count()===1);
  await pg.mouse.click(4,4);await pg.waitForTimeout(150);
  want('ulkopuolinen napautus sulkee, rivi himmeänä samassa kohdassa',await pg.locator('#agp').count()===0&&await pg.locator(ar+'.done').count()===1&&Math.abs((await pg.locator(ar).evaluate(e=>e.getBoundingClientRect().top))-at0)<1);
  want('OK nollaa välin: seuraava vasta 3 kk tarkistuksesta',JSON.stringify(await EV("(d,a,t)=>{const L=MF.lists(d),E=MF.allEntries(d,t);return MF.chain(a,'verk','k3',E,t,L,MF.derivedFor(a,d,t)).map(c=>[c.w,c.st]);}"))===JSON.stringify([[nmon,'ok']])&&
    !(await EV("(d,a,t)=>MF.herjat(a,d,t).map(x=>x.teksti).join('|')")).includes('Verkosto'));
  want('ei vaakavieritystä (kalenterin viikko)',!await wide());
  want('ei sivuvirheitä',!errs.length);if(errs.length)console.log(errs);
  await ctx.close();return bad;}
(async()=>{let b;try{b=await chromium.launch();}catch(e){b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});}
  let bad=[];for(const [w,h,t] of [[390,844,true],[320,640,true],[1280,800,false]])bad=bad.concat(await run(b,w,h,t));
  await b.close();process.exit(bad.length?1:0);})();
