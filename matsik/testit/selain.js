/* Mätsik Forest 0.1: käyttö selaimessa. Uusi asiakas, osiot, käynti muistiosta, herjojen päivittyminen, tavoite ja arviointikierros,
   kalenterin Toteutui, asetukset, vienti ja tuonti, ei vaakavieritystä. 390 ja 320 px kosketuksella, 1280 hiirellä. */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const U=process.env.MFU||'file://'+path.resolve(__dirname,'..','index.html'),D="JSON.parse(localStorage.getItem('matsik:v1')).data";
async function run(b,w,h,touch){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch,acceptDownloads:true}),pg=await ctx.newPage(),errs=[],bad=[];
  pg.on('pageerror',e=>errs.push(String(e)));
  const want=(l,c)=>{console.log('  '+l.padEnd(52)+(c?'ok':'VIRHE'));if(!c)bad.push(l);};
  const tap=async s=>{const l=pg.locator(s).first();if(touch)await l.tap();else await l.click();await pg.waitForTimeout(80);};
  const wide=()=>pg.evaluate('document.documentElement.scrollWidth>innerWidth+1');
  const hj=()=>pg.locator('#hjc').innerText();
  console.log('leveys',w);
  await pg.goto(U);await pg.waitForTimeout(200);
  want('tyhjä lista ohjeineen',await pg.locator('.empty').count()===1);
  await tap('[data-act=uusi]');await pg.fill('#nn','Kettu');await tap('[data-act=uusiok]');
  want('asiakas avautuu',(await pg.locator('h1').allInnerTexts()).includes('Kettu'));
  want('herjat: tulosyy puuttuu',(await hj()).includes('Tulosyy puuttuu'));
  await tap('#sec-tulosyy summary');await pg.fill('#tulosyy-t','Koulupoissaolot ja ahdistus');await pg.locator('#tulosyy-t').dispatchEvent('change');
  want('tulosyy tallentui ja herja poistui',!(await hj()).includes('Tulosyy puuttuu'));
  await tap('#sec-toimet summary');await tap('[data-seg="toimet.tiheys"][data-v="1/vk"]');
  want('1/vk: kaksi viikkoherjaa',((await hj()).match(/ei ole sovittu käyntiä/g)||[]).length===2);
  await tap('[data-act=kaynti]');await pg.locator('#nt').pressSequentially('perhekäynti ti 10.11.2099 klo 14 lääkäri');await tap('[data-act=ntok]');
  want('käynti muistioon',await pg.evaluate(D+'.muistio.length')===1);
  await tap('#sec-tavoitteet summary');await tap('[data-act=syyadd]');await pg.locator('textarea[data-b$=".haitta"]').fill('Ei pääse kouluun');
  await tap('[data-act=tavadd]');await pg.locator('textarea[data-b$=".lapsi"]').fill('Käyn koulussa kolme päivää viikossa');
  await tap('[data-seg$=".taso"][data-v="2"]');
  want('taso vaihtui',await pg.evaluate(D+'.asiakkaat[0].tavoitteet[0].taso')===2);
  await tap('.goal [data-act=arvioi]');
  for(const p of ['lapsi','vanh','tyont'])await tap(`[data-act=aper][data-p=${p}][data-v=k]`);
  await tap('[data-act=aperok]');await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aopt][data-i="1"]');
  want('kierros päätyy psykoedukaatioon',(await pg.locator('.res').innerText()).includes('Psykoedukaatio'));
  await tap('[data-act=abak]');want('takaisin toimii',(await pg.locator('.q').innerText())==='Ymmärretäänkö, miksi juuri näitä asioita tarvitaan?');
  await tap('[data-act=aopt][data-i="1"]');await tap('[data-act=aok]');
  want('toimenpide herjana',(await hj()).includes('Psykoedukaatio'));
  await tap('#hjc [data-act=tehty]');want('tehty poistaa herjan',!(await hj()).includes('Psykoedukaatio'));
  want('ei vaakavieritystä (asiakas)',!await wide());
  await pg.screenshot({path:`/tmp/mf_asiakas_${w}.png`,fullPage:true});
  await tap('[data-act=home]');want('listalla Kettu',await pg.locator('.row').count()===1);
  want('ei vaakavieritystä (lista)',!await wide());
  await pg.screenshot({path:`/tmp/mf_lista_${w}.png`});
  await tap('[data-nav=muistio]');await pg.fill('#newnote','Kettu soitto 1.11. kuulumiset');await tap('[data-act=notesave]');
  want('muistiinpano ja nimi korostettu',await pg.locator('.note mark').count()>=1);
  await tap('[data-nav=kalenteri]');want('menneelle käynnille Toteutui-nappi',await pg.locator('[data-act=tila][data-v=toteutui]').count()>=1);
  await tap('[data-act=tila][data-v=toteutui]');want('toteutui tallentui',(await pg.locator('.main').innerText()).includes('Toteutui'));
  want('ei vaakavieritystä (kalenteri)',!await wide());
  await pg.screenshot({path:`/tmp/mf_kal_${w}.png`});
  await tap('[data-nav=valikko]');await tap('[data-set=teema][data-v=kuutamo]');await tap('[data-set=shape][data-v="999"]');
  want('teema vaihtui',(await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()"))==='#141a2e');
  want('ei vaakavieritystä (valikko)',!await wide());
  const [dl]=await Promise.all([pg.waitForEvent('download'),tap('[data-act=vie]')]);
  want('vientitiedoston nimi',await pg.evaluate('MF.FILE')==='Mätsik Forest.json'&&['Mätsik Forest.json','download'].includes(dl.suggestedFilename())); /* testiselain antaa ä-kirjaimelliselle nimelle nimen download */
  const txt=fs.readFileSync(await dl.path(),'utf8'),o=JSON.parse(txt);want('vientimuoto',o.app==='matsik'&&o.data.asiakkaat[0].nimi==='Kettu');
  await pg.evaluate('localStorage.clear()');await pg.reload();await pg.waitForTimeout(150);await tap('[data-nav=valikko]');
  await tap('[data-act=tuoteksti]');await pg.fill('#tt',txt);await tap('[data-act=ttok]');await tap('[data-act=tuook]');
  want('tuonti palautti asiakkaan',await pg.locator('.row').count()===1);
  want('ei sivuvirheitä',!errs.length);if(errs.length)console.log(errs);
  await ctx.close();return bad;}
(async()=>{let b;try{b=await chromium.launch();}catch(e){b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});}
  let bad=[];for(const [w,h,t] of [[390,844,true],[320,640,true],[1280,800,false]])bad=bad.concat(await run(b,w,h,t));
  await b.close();process.exit(bad.length?1:0);})();
