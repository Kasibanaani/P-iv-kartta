/* Mätsik Forest 0.8: käyttö selaimessa. Eläimet, Nyt-kortti ja portaat, lukutila ja muokkausarkki (Seuraava samassa kentässä, näppäimistö), syklinauha ja Sovi, mittaus muistiosta, tavoitekartta, työjono, Valikon alasivut ja säännöt,
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
  want('Nyt-kortti: tulosyy ensin, syy ja Lisää-nappi',(await hj()).includes('Tulosyy puuttuu')&&(await hj()).includes('Ensin, koska')&&await pg.locator('#hjc [data-act=ed][data-s=tulosyy]').count()===1);
  want('portaat: vain vaiheen 1 puutteet',await pg.locator('.stb[data-v="1"] .dot.warn').count()===1&&await pg.locator('.stb[data-v="2"] .dot.ok').count()===1&&!(await HJ()).includes('Diagnoosit'));
  want('tyhjät osiot lisäysnappeina vaiheen lopussa',await pg.locator('#vh-1 .adds .chipb').count()>=5);
  /* muokkausarkki */
  await tap('#hjc [data-act=ed]');
  want('arkki aukeaa, kenttä valmiina kirjoittamaan',await pg.locator('.sheet.eds #edf').count()===1&&await pg.evaluate("document.activeElement&&document.activeElement.id")==='edf');
  await pg.locator('#edf').fill('Koulupoissaolot ja ahdistus');await tap('.eda [data-act=close]');
  want('tulosyy tallentui ja näkyy lukutilassa',(await pg.evaluate(A+'.tulosyy.t'))==='Koulupoissaolot ja ahdistus'&&(await pg.locator('#sec-tulosyy .rr').innerText()).includes('Koulupoissaolot')&&!(await HJ()).includes('Tulosyy puuttuu'));
  await tap('.adds [data-s=esitiedot]');want('monikenttäinen osio: 1 / 5',(await pg.locator('#ed-n').innerText())==='1 / 5');
  await pg.locator('#edf').fill('Kotona äidin kanssa');await pg.evaluate("window.__ta=document.getElementById('edf')");await tap('[data-act=edgo][data-d="1"]');
  want('Seuraava vaihtaa kentän samassa tekstikentässä',(await pg.locator('#ed-n').innerText())==='2 / 5'&&await pg.evaluate("window.__ta===document.getElementById('edf')&&document.activeElement===window.__ta")&&(await pg.locator('#edf').inputValue())==='');
  await pg.locator('#edf').fill('Äiti ja isä');await tap('[data-act=edgo][data-d="-1"]');
  want('Edellinen palauttaa ensimmäisen kentän arvon',(await pg.locator('#edf').inputValue())==='Kotona äidin kanssa');
  await tap('.eda [data-act=close]');
  want('esitiedot tallentuivat, rivi näyttää molemmat',(await pg.evaluate(A+'.esitiedot.perhe'))==='Äiti ja isä'&&/Asuminen.*Perhe/.test(await pg.locator('#sec-esitiedot .rr').innerText()));
  await tap('#sec-esitiedot .rr');want('lukutilan rivi avaa arkin',await pg.locator('.sheet.eds #edf').count()===1);
  await pg.evaluate("document.documentElement.style.setProperty('--vvh','380px');document.documentElement.classList.add('kb')");await pg.waitForTimeout(50);
  want('näppäimistö auki: arkki näkyvän alueen sisällä, alapalkki piiloon',await pg.evaluate("document.querySelector('.sheet .pn').getBoundingClientRect().bottom<=381&&getComputedStyle(document.getElementById('bar')).display==='none'"));
  await pg.evaluate("document.documentElement.style.removeProperty('--vvh');document.documentElement.classList.remove('kb')");
  await tap('.sheet .x');
  await tap('.adds [data-s=vahvuudet]');await pg.locator('#edf').fill('Piirtää hyvin');await tap('.eda [data-act=close]');
  want('portaat: vaihe 1 valmis, vaiheen 2 puutteet näkyvät',(await HJ()).includes('Diagnoosit puuttuvat'));
  await tap('.adds [data-s=diagnoosit]');await pg.fill('#dg-new','Ahdistuneisuus');await tap('.sheet [data-act=dgadd]');
  want('diagnoosi lisätty, arkki pysyy auki',await pg.locator('.sheet [data-dg][aria-pressed=true]').count()===1&&(await pg.evaluate(A+'.diagnoosit.v.length'))===1);
  await tap('.eda [data-act=close]');want('diagnoosit lukutilassa',await pg.locator('#sec-diagnoosit .rr').count()===1);
  /* hoitotoimet ja syklinauha */
  await tap('#sec-toimet .bh [data-act=ed]');await pg.fill('#edf',iso(new Date()));await pg.locator('#edf').dispatchEvent('change');await tap('.eda [data-act=close]');
  await tap('[data-act=slotedit][data-k=vk1]');await tap('[data-syk=vk1][data-v=lahi]');await tap('[data-syk=vk1][data-v=paino]');await tap('[data-act=slotok]');
  await tap('[data-act=slotsel][data-k=vk2]');await tap('[data-act=slotedit][data-k=vk2]');await tap('[data-syk=vk2][data-v=laak]');await tap('[data-act=slotok]');
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
  await tap('[data-act=syyadd]');await pg.locator('#edf').fill('Ei pääse kouluun');await tap('.eda [data-act=close]');
  want('hoidon syy tallentui',(await pg.evaluate(A+'.syyt[0].haitta'))==='Ei pääse kouluun'&&await pg.locator('.syys [data-s=syy]').count()===1);
  want('tavoitekartta 3 × 3',await pg.locator('.gmap .cell').count()===9);
  await tap('[data-act=cell][data-c="2:vanh"]');want('ruutu aukeaa kartan alle',(await pg.locator('.cellh').first().innerText()).includes('Vanhemmat')&&await pg.locator('[data-act=tavadd][data-lv="2"][data-th=vanh]').count()===1);
  await tap('[data-act=tavadd][data-lv="2"][data-th=vanh]');await pg.locator('#edf').fill('Käyn koulussa kolme päivää viikossa');
  want('uusi tavoite tasolle 2 vanhemmille',JSON.stringify(await pg.evaluate(A+'.tavoitteet.map(t=>[t.taso,t.taho])'))==='[[2,"vanh"]]');
  await tap('[data-act=edgo][data-d="1"]');await tap('.sheet [data-seg$=".taho"][data-v=lapsi]');
  want('taho vaihtuu arkissa',JSON.stringify(await pg.evaluate(A+'.tavoitteet.map(t=>[t.taso,t.taho])'))==='[[2,"lapsi"]]');
  await tap('.eda [data-act=close]');
  want('tavoite näkyy oikeassa ruudussa ja ruutu seuraa',(await pg.locator('.cell[data-c="2:lapsi"]').innerText()).includes('Käyn koulussa')&&await pg.locator('.cell[data-c="2:lapsi"][aria-pressed=true]').count()===1);
  await tap('[data-pp=CPS]');want('periaate valittu tasolla 2',JSON.stringify(await pg.evaluate(A+'.periaatteet'))==='["CPS"]');
  await tap('.gc [data-act=ed][data-f=seur]');await tap('.sheet [data-seg$=".real"][data-v=e]');want('seuranta Ei herjaa',(await HJ()).includes('Ei realistinen: Käyn koulussa'));
  await tap('.sheet [data-seg$=".real"][data-v=e]');want('uusi napautus poistaa valinnan',!(await HJ()).includes('Ei realistinen'));await tap('.eda [data-act=close]');
  await tap('.gc [data-act=arvioi]');for(const p of ['lapsi','vanh','tyont'])await tap(`[data-act=aper][data-p=${p}][data-v=k]`);
  await tap('[data-act=aperok]');await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aopt][data-i="1"]');
  want('kierros päätyy psykoedukaatioon',(await pg.locator('.res').innerText()).includes('Psykoedukaatio'));
  await tap('[data-act=abak]');want('takaisin toimii',(await pg.locator('.q').innerText())==='Ymmärretäänkö, miksi juuri näitä asioita tarvitaan?');
  await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aok]');
  want('toimenpide muistutuksena ja tavoitekortilla',(await HJ()).includes('Psykoedukaatio')&&await pg.locator('.gc [data-act=tehty]').count()===1);
  await tap('.gc [data-act=tehty]');want('tehty poistaa muistutuksen',!(await HJ()).includes('Psykoedukaatio'));
  /* mittarit, haasteet, ohjaus */
  await tap('.adds [data-s=mtr]');await tap('[data-act=edgo][data-d="1"]');await pg.fill('#edm','36');await tap('.sheet [data-act=mtrkirj]');
  want('mittarin kirjaus arkissa',(await pg.evaluate(A+'.mittarit.fit.arvot[0].arvo'))==='36'&&(await pg.locator('#ed-b').innerText()).includes('36'));
  await tap('.eda [data-act=close]');want('mittarit lukutilassa',(await pg.locator('#sec-mittarit .rr').innerText()).includes('FIT'));
  await tap('[data-act=hstadd]');await pg.locator('#edf').fill('Riitely naapurin kanssa');await tap('.eda [data-act=close]');
  want('haaste ilman ohjausta herjaa',(await HJ()).includes('Valitse, mihin haaste ohjataan'));
  await tap('.rr[data-s=hst]');await tap('[data-act=edgo][data-d="1"]');await tap('.sheet [data-seg^="hst:"][data-v=sos]');await tap('[data-act=edgo][data-d="1"]');await tap('.sheet [data-act=hstoh]');
  want('haaste ohjattu sosiaalityöhön',(await pg.evaluate(A+'.haasteet[0].ohjaus'))==='sos'&&!!(await pg.evaluate(A+'.haasteet[0].ohjattu'))&&!(await HJ()).includes('haaste ohjataan'));
  await tap('.eda [data-act=close]');
  await tap('.rr[data-s=ohj]');await pg.fill('#ohj-lisa','Hoito osuu oikeaan');await tap('[data-act=ohjkirj][data-v=oikea]');
  want('ohjauksen arvio kirjattu',(await pg.evaluate(A+'.ohjaus[0].tulos'))==='oikea'&&(await pg.locator('#sec-tarve').innerText()).includes('Oikea yksikkö')&&await pg.locator('.sheet').count()===0);
  want('ei vaakavieritystä (eläin)',!await wide());
  await tap('#bar [data-act=home]');want('listalla Kettu yhdellä rivillä',await pg.locator('.row').count()===1&&(await pg.locator('.row').boundingBox()).height<70);
  await tap('[data-act=lf][data-g=kay]');want('rajaus: työjono kaikilta eläimiltä',await pg.locator('.qrow').count()>=1&&await pg.locator('.row').count()===0&&await pg.locator('.qrow [data-act=sovi]').count()>=1);
  await tap('[data-act=lf][data-g=""]');
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
  await tap('#roll');await tap('.pop [data-nav=asiakkaat]');await tap('[data-act=open]');await tap('[data-act=slotsel][data-k=vk3]');await tap('[data-act=slotedit][data-k=vk3]');
  want('oma sisältö valittavissa laatikossa',await pg.locator('[data-syk=vk3]',{hasText:'Ryhmäkäynti'}).count()===1);
  await tap('[data-syk=vk3]:has-text("Ryhmäkäynti")');await tap('[data-act=slotok]');
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
  want('tuonti palautti eläimen',await pg.locator('.row').count()===1);
  want('ei sivuvirheitä',!errs.length);if(errs.length)console.log(errs);
  await ctx.close();return bad;}
(async()=>{let b;try{b=await chromium.launch();}catch(e){b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});}
  let bad=[];for(const [w,h,t] of [[390,844,true],[320,640,true],[1280,800,false]])bad=bad.concat(await run(b,w,h,t));
  await b.close();process.exit(bad.length?1:0);})();
