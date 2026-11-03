/* Mätsik Forest 0.2: käyttö selaimessa. Eläimet, osiot, käynti muistiosta, herjat, tavoite ja arviointikierros, muistion automaattitallennus,
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
  want('otsikko Eläimet ja tyhjän listan ohje',(await pg.locator('h1').first().innerText())==='Eläimet'&&await pg.locator('.empty').count()===1);
  want('plusnappi alapalkissa, ei yläpalkissa',await pg.locator('#bar [data-act=uusi]').count()===1&&await pg.locator('.hd [data-act=uusi]').count()===0);
  await tap('#bar [data-act=uusi]');await pg.fill('#nn','Kettu');await tap('[data-act=uusiok]');
  want('eläin avautuu, Takaisin alapalkissa',(await pg.locator('h1').allInnerTexts()).includes('Kettu')&&await pg.locator('#bar [data-act=home]').count()===1);
  want('herjat: tulosyy puuttuu',(await hj()).includes('Tulosyy puuttuu'));
  await tap('#sec-tulosyy summary');await pg.fill('#tulosyy-t','Koulupoissaolot ja ahdistus');await pg.locator('#tulosyy-t').dispatchEvent('change');
  want('tulosyy tallentui ja herja poistui',!(await hj()).includes('Tulosyy puuttuu'));
  await tap('#sec-toimet summary');await tap('[data-seg="toimet.tiheys"][data-v="1/vk"]');
  want('1/vk: kaksi viikkoherjaa',((await hj()).match(/ei ole sovittu käyntiä/g)||[]).length===2);
  await tap('[data-act=kaynti]');await pg.locator('#nt').pressSequentially('perhekäynti ti 10.11.2099 klo 14 lääkäri');await tap('.sheet [data-act=close]');
  want('käynti tallentui ilman tallenna-nappia',await pg.evaluate(D+'.muistio.length')===1);
  await tap('#sec-tavoitteet summary');await tap('[data-act=syyadd]');await pg.locator('textarea[data-b$=".haitta"]').fill('Ei pääse kouluun');
  await tap('[data-act=tavadd]');await pg.locator('textarea[data-b$=".lapsi"]').fill('Käyn koulussa kolme päivää viikossa');
  await tap('[data-seg$=".taso"][data-v="2"]');want('taso vaihtui',await pg.evaluate(D+'.asiakkaat[0].tavoitteet[0].taso')===2);
  await tap('.goal [data-act=arvioi]');for(const p of ['lapsi','vanh','tyont'])await tap(`[data-act=aper][data-p=${p}][data-v=k]`);
  await tap('[data-act=aperok]');await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aopt][data-i="1"]');
  want('kierros päätyy psykoedukaatioon',(await pg.locator('.res').innerText()).includes('Psykoedukaatio'));
  await tap('[data-act=abak]');want('takaisin toimii',(await pg.locator('.q').innerText())==='Ymmärretäänkö, miksi juuri näitä asioita tarvitaan?');
  await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aok]');
  want('toimenpide herjana',(await hj()).includes('Psykoedukaatio'));
  await tap('#hjc [data-act=tehty]');want('tehty poistaa herjan',!(await hj()).includes('Psykoedukaatio'));
  want('ei vaakavieritystä (eläin)',!await wide());
  await tap('#bar [data-act=home]');want('listalla Kettu',await pg.locator('.row').count()===1);
  want('ei vaakavieritystä (lista)',!await wide());
  await pg.screenshot({path:`/tmp/mf_lista_${w}.png`});
  /* osionappi */
  await tap('#roll');want('osiovalikko aukeaa alhaalta',await pg.locator('.pop [data-nav]').count()===4);
  await tap('.pop [data-nav=muistio]');want('muistio auki, valikko kiinni',(await pg.locator('h1').first().innerText())==='Muistio'&&await pg.locator('.pop').count()===0);
  await pg.locator('#newnote').fill('Kettu soitto tänään klo 9 kuulumiset');await pg.waitForTimeout(1500);
  want('muistiinpano tallentui tauon jälkeen',await pg.evaluate(D+'.muistio.length')===2);
  await pg.locator('#newnote').fill('Kettu soitto tänään klo 9 kuulumiset, äiti mukana');await pg.locator('#newnote').blur();await pg.waitForTimeout(150);
  want('poistuminen tallentaa samaan muistiinpanoon',await pg.evaluate(D+'.muistio.length')===2&&(await pg.evaluate(D+'.muistio[1].text')).includes('äiti'));
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
  await pg.screenshot({path:`/tmp/mf_kal_${w}.png`});
  /* asetukset, pikavienti, tuonti */
  await tap('#roll');await tap('.pop [data-nav=valikko]');await tap('[data-set=teema][data-v=kuutamo]');
  want('teema vaihtui',(await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()"))==='#141a2e');
  want('ei vaakavieritystä (valikko)',!await wide());
  await tap('#roll');await tap('.pop [data-nav=asiakkaat]');
  const [dl]=await Promise.all([pg.waitForEvent('download'),tap('#bar [data-act=vie]')]);
  want('pikavienti alapalkista',await pg.evaluate('MF.FILE')==='Mätsik Forest.json'&&['Mätsik Forest.json','download'].includes(dl.suggestedFilename()));
  const ftxt=fs.readFileSync(await dl.path(),'utf8'),o=JSON.parse(ftxt);want('vientimuoto',o.app==='matsik'&&o.data.asiakkaat[0].nimi==='Kettu'&&o.data.muistio.length===3);
  await pg.evaluate('localStorage.clear()');await pg.reload();await pg.waitForTimeout(150);await tap('#roll');await tap('.pop [data-nav=valikko]');
  await tap('[data-act=tuoteksti]');await pg.fill('#tt',ftxt);await tap('[data-act=ttok]');await tap('[data-act=tuook]');
  want('tuonti palautti eläimen',await pg.locator('.row').count()===1);
  want('ei sivuvirheitä',!errs.length);if(errs.length)console.log(errs);
  await ctx.close();return bad;}
(async()=>{let b;try{b=await chromium.launch();}catch(e){b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});}
  let bad=[];for(const [w,h,t] of [[390,844,true],[320,640,true],[1280,800,false]])bad=bad.concat(await run(b,w,h,t));
  await b.close();process.exit(bad.length?1:0);})();
