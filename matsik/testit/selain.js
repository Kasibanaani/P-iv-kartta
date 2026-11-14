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
  want('eläin avautuu: alapalkissa takaisin, 4 vaihetta ja plus',(await pg.locator('h1').first().innerText()).includes('Kettu')&&await pg.locator('#bar [data-act=home]').count()===1&&await pg.locator('#bar .stb').count()===4&&await pg.locator('#bar [data-act=kaynti]').count()===1);
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
  want('sykli: valinnat näkyvät heti ilman muokkausnappia',await pg.locator('#sec-toimet [data-syk=vk1]').count()>=5&&await pg.locator('[data-act=slotedit],[data-act=slotok]').count()===0);
  await pg.fill('#sec-toimet input[data-syal]',iso(new Date()));await pg.locator('#sec-toimet input[data-syal]').dispatchEvent('change');
  want('syklin alkupäivä suoraan sivulla',(await pg.evaluate(A+'.toimet.alku'))===iso(new Date()));
  await tap('[data-syk=vk1][data-v=lahi]');await tap('[data-syk=vk1][data-v=paino]');
  await tap('[data-act=slotsel][data-k=vk2]');await tap('[data-syk=vk2][data-v=laak]');
  want('laatikot tallentuivat',JSON.stringify(await pg.evaluate(A+'.toimet.sykli.vk1'))==='["lahi","paino"]'&&JSON.stringify(await pg.evaluate(A+'.toimet.sykli.vk2'))==='["laak"]');
  want('nauhassa tilapisteet: vk1 kaksi sovittavaa',await pg.locator('.slotb[data-k=vk1] .dot.miss').count()===2&&await pg.locator('.slotb[data-k=vk2] .dot').count()===1);
  want('Nyt-kortti: sovittava käynti ensin, Sovi-nappi',/sovittava/.test(await hj())&&await pg.locator('#hjc .nrow [data-act=sovi]').count()===1&&((await HJ()).match(/sovittava/g)||[]).length===3);
  await tap('#hjc [data-act=sovi]');
  want('Sovi avaa muistiinpanon valmiilla alulla',(await pg.locator('#nt').inputValue())==='Kettu lähikäynti ');
  await pg.locator('#nt').press('End');await pg.locator('#nt').pressSequentially('huomenna klo 14');await tap('.sheet [data-act=close]');
  want('käynti tallentui ilman tallenna-nappia',await pg.evaluate(D+'.muistio.length')===1);
  await tap('[data-act=slotsel][data-k=vk1]');
  want('lähikäynti sovittu: herjoista jää paino ja lääkäri',((await HJ()).match(/sovittava/g)||[]).length===2&&await pg.locator('.slotb[data-k=vk1] .dot.plan').count()===1);
  await tap('#bar [data-act=kaynti]');want('plus avaa muistiinpanon eläimen nimellä',(await pg.locator('#nt').inputValue())==='Kettu ');
  await pg.locator('#nt').press('End');await pg.locator('#nt').pressSequentially('paino 41');await tap('.sheet [data-act=close]');
  want('muistion mittaus täyttää painon ja näkyy lääkeseurannassa',await pg.locator('.slotb[data-k=vk1] .dot.ok').count()===1&&(await pg.locator('#sec-seuranta .rr').innerText()).includes('41')&&((await HJ()).match(/sovittava/g)||[]).length===1);
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
  await tap('.lr:has-text("Siili") .ot[data-k=esitiedot]');want('saman rivin toinen ruutu vaihtaa osion',(await pg.locator('#lp .lph b').innerText())==='Esitiedot'&&await pg.locator('#lp .lci').count()===5);
  await tap('#lp [data-key="esitiedot.perhe"][data-v=ei]');want('Ei nostaa asian muistutukseksi',(await SH()).includes('Ei kunnossa: Esitiedot · Perhe')&&(await pg.evaluate(D+'.asiakkaat[1].kuit["esitiedot.perhe"].v'))==='ei');
  await tap('#lp [data-key="esitiedot.perhe"][data-v=ei]');want('uusi napautus tyhjentää kuittauksen',!(await SH()).includes('Ei kunnossa'));
  await tap('.lr:has-text("Siili") .ot[data-k=tavoitteet]');want('tavoitteet: 9 kohtaa (taso × taho)',await pg.locator('#lp .lci').count()===9);
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
  want('muistiinpano tallentui tauon jälkeen',await pg.evaluate(D+'.muistio.length')===3);
  await pg.locator('#newnote').fill('Kettu soitto tänään klo 9 kuulumiset, äiti mukana');await pg.locator('#newnote').blur();await pg.waitForTimeout(150);
  want('poistuminen tallentaa samaan muistiinpanoon',await pg.evaluate(D+'.muistio.length')===3&&(await pg.evaluate(D+'.muistio[2].text')).includes('äiti'));
  want('kenttä tyhjenee ja muistiinpano listalla',(await pg.locator('#newnote').inputValue())===''&&await pg.locator('.note mark').count()>=1);
  /* kalenteri */
  await tap('#roll');await tap('.pop [data-nav=kalenteri]');await pg.waitForTimeout(150);
  const today=iso(new Date());
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
  await tap('#roll');await tap('.pop [data-nav=asiakkaat]');await tap('.nl:has-text("Kettu")');await tap('[data-act=slotsel][data-k=vk3]');
  want('oma sisältö valittavissa laatikossa',await pg.locator('[data-syk=vk3]',{hasText:'Ryhmäkäynti'}).count()===1);
  await tap('[data-syk=vk3]:has-text("Ryhmäkäynti")');
  want('oma sisältö herjaa',(await HJ()).includes('Ryhmäkäynti sovittava'));
  await tap('#bar [data-act=home]');await tap('#roll');await tap('.pop [data-nav=valikko]');await tap('[data-act=vsub][data-k=luettelot]');await tap('#lc-sisallot .lrow:has-text("Ryhmäkäynti") [data-act=leopen]');
  want('käyttömäärä näkyy ennen poistoa',(await pg.locator('#lc-sisallot .ledit').innerText()).includes('Käytössä 1'));
  await tap('#lc-sisallot [data-act=delask]');await tap('#lc-sisallot [data-act=delyes]');
  want('poisto poistaa myös eläimen syklistä',await pg.evaluate(D+'.asetukset.sisallot.length')===10&&JSON.stringify(await pg.evaluate(D+'.asiakkaat[0].toimet.sykli.vk3'))==='[]');
  /* säännöt (0.8) */
  await tap('#bar [data-act=vback]');await tap('[data-act=vsub][data-k=saannot]');
  await tap('[data-act=samove][data-id=puu][data-d="-1"]');await tap('[data-act=saset][data-id=puu][data-v=kiire]');
  want('sääntö siirtyy ylös ja muuttuu kiireelliseksi',JSON.stringify(await pg.evaluate(D+".asetukset.saannot.map(r=>r.id).indexOf('puu')"))==='5'&&(await pg.evaluate(D+".asetukset.saannot.find(r=>r.id==='puu').tila"))==='kiire'&&(await pg.locator('#saannot .srow').nth(5).innerText()).includes('Puuttuvat'));
  await tap('[data-act=sareset]');want('oletukset palautuvat',(await pg.evaluate(D+".asetukset.saannot.map(r=>r.id).join()"))==='t1,sykli1,t2,sykli,t3,ohj,puu,vanha');
  await tap('[data-act=portaat][data-v="0"]');want('portaat pois',(await pg.evaluate(D+'.asetukset.portaat'))===false);
  want('ei vaakavieritystä (säännöt)',!await wide());
  await tap('#roll');await tap('.pop [data-nav=asiakkaat]');
  const [dl]=await Promise.all([pg.waitForEvent('download'),tap('#bar [data-act=vie]')]);
  want('pikavienti alapalkista',await pg.evaluate('MF.FILE')==='Mätsik Forest.json'&&['Mätsik Forest.json','download'].includes(dl.suggestedFilename()));
  const ftxt=fs.readFileSync(await dl.path(),'utf8'),o=JSON.parse(ftxt);want('vientimuoto',o.app==='matsik'&&o.data.asiakkaat[0].nimi==='Kettu'&&o.data.muistio.length===4);
  await pg.evaluate('localStorage.clear()');await pg.reload();await pg.waitForTimeout(150);await tap('#roll');await tap('.pop [data-nav=valikko]');await tap('[data-act=vsub][data-k=tiedot]');
  await tap('[data-act=tuoteksti]');await pg.fill('#tt',ftxt);await tap('[data-act=ttok]');await tap('[data-act=tuook]');
  want('tuonti palautti eläimet',await pg.locator('.lr').count()===2);
  want('ei sivuvirheitä',!errs.length);if(errs.length)console.log(errs);
  await ctx.close();return bad;}
(async()=>{let b;try{b=await chromium.launch();}catch(e){b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});}
  let bad=[];for(const [w,h,t] of [[390,844,true],[320,640,true],[1280,800,false]])bad=bad.concat(await run(b,w,h,t));
  await b.close();process.exit(bad.length?1:0);})();
