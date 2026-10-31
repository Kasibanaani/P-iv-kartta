'use strict';
// Treenikartta: selaintestit puhelinleveyksillä 390 ja 320 px (Chromium, ei oikea iPhone).
const {chromium}=require('playwright');
const assert=require('assert'),path=require('path'),fs=require('fs'),http=require('http');
const DAY=864e5;
function aineisto(){
  const L=[{id:'a',nimi:'Penkkipunnerrus',tmin:6,tideal:8,tmax:10,askel:2.5,paa:'Rinta',sivu:'Ojentajat',skerta:3,sjakso:6,goals:[]},
    {id:'b',nimi:'Kyykky',tideal:6,askel:2.5,paa:'Etureidet',goals:[]},{id:'c',nimi:'Vinopenkki',tideal:10,askel:2,paa:'rinta',sjakso:4,goals:[]}];
  const T=[];const now=Date.now();let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  for(let d=60;d>=1;d-=2+Math.floor(rnd()*2)){const al=now-d*DAY;const ss=[];let t=al+3e5;
    for(const id of (rnd()<.5?['a','b','c']:['b','a','c'])){const base={a:60,b:90,c:20}[id]+(60-d)*.15;for(let i=0;i<3;i++){ss.push({id:'s'+T.length+id+i,liike:id,t,kg:Math.round(base/2.5)*2.5,toistot:6+Math.floor(rnd()*5)});t+=150000}}
    T.push({id:'t'+d,alku:al,loppu:t,sarjat:ss})}
  return {app:'treenikartta',ver:3,liikkeet:L,treenit:T,auki:null,as:{jakso:7,sivu:.5,tauko:3,tila:'auto',vari:'forest',koko:'normaali',tavoitteet:{Rinta:{n:10,pv:7}}}};
}
(async()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'));
  const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(html)});
  await new Promise(res=>server.listen(8766,'127.0.0.1',res));
  const browser=await chromium.launch(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{});
  let n=0;
  for(const [w,h,scheme] of [[390,844,'light'],[320,568,'dark']]){
    const ctx=await browser.newContext({viewport:{width:w,height:h},colorScheme:scheme,acceptDownloads:true});
    const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
    const ok=async(nimi,f)=>{await f();n++;console.log('OK '+w+' '+nimi)};
    const leveys=async()=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'vaakavieritys');
    await p.goto('http://127.0.0.1:8766/');
    await ok('tyhjä tila ohjaa lisäämään liikkeen',async()=>{assert((await p.textContent('#app')).includes('Lisää ensin omat liikkeesi'));await leveys()});
    await ok('liikkeen lisäys',async()=>{await p.click('text=Lisää liike');await p.fill('#f-nimi','Leuanveto');await p.fill('#f-tideal','8');await p.click('[data-act=savel]');
      assert.equal(await p.evaluate(()=>TK.S().liikkeet[0].nimi),'Leuanveto')});
    await ok('sarja: + Sarja, paino OK, toistot OK, kursori kentässä',async()=>{await p.click('nav [data-tab=treeni]');await p.click('text=Leuanveto');await p.click('text=+ Sarja 1');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'in-kg');await p.keyboard.type('10');await p.click('[data-act=okkg]');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'in-rep');assert.equal(await p.inputValue('#in-rep'),'8');await p.click('[data-act=okrep]');
      const S=await p.evaluate(()=>TK.S());assert.equal(S.treenit.length,1);assert.equal(S.treenit[0].sarjat[0].kg,10);assert(S.treenit[0].alku<=S.treenit[0].sarjat[0].t)});
    await ok('myöhässä kirjattu sarja ja lepoajan korjaus',async()=>{await p.click('text=+ Sarja 2');await p.click('[data-act=myoh]');await p.fill('#in-lepo','3:00');await p.click('[data-act=okkg]');await p.click('[data-act=okrep]');
      const s=await p.evaluate(()=>TK.S().treenit[0].sarjat);assert(s[1].t-s[0].t<=180000+1000);});
    await ok('lopetusnappi vahvistuksella',async()=>{await p.click('button.lopeta');await p.click('button.lopeta.sure');assert(await p.evaluate(()=>!!TK.S().treenit[0].loppu))});
    await ok('pikavienti tallentaa JSON-tiedoston',async()=>{await p.click('[data-act=pika]');const [dl]=await Promise.all([p.waitForEvent('download'),p.click('.sheet [data-act=viejson]')]);
      assert(/^treenikartta-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()));const f=await dl.path();const d=JSON.parse(fs.readFileSync(f,'utf8'));assert.equal(d.app,'treenikartta');assert.equal(d.data.liikkeet[0].nimi,'Leuanveto');
      assert(await p.evaluate(()=>!!TK.S().as.viety))});
    const tmp=path.join(require('os').tmpdir(),'tk-test-'+w+'.json');fs.writeFileSync(tmp,JSON.stringify({app:'treenikartta',ver:3,data:aineisto()}));
    await ok('pikatuonti JSON-tiedostosta vahvistuksella',async()=>{await p.setInputFiles('#pikafile',tmp);await p.waitForSelector('[data-act=pikatuo2]');assert((await p.textContent('.sheet')).includes('3 liikettä'));await p.click('[data-act=pikatuo2]');
      const S=await p.evaluate(()=>TK.S());assert.equal(S.liikkeet.length,3);assert.deepEqual(S.ryhmat,['Rinta','Ojentajat','Etureidet'],'ryhmät koottu, rinta=Rinta');assert.equal(S.liikkeet[2].paa,'Rinta');assert.equal(S.as.tauko,2,'vanha 3 h oletus muuttuu 2 h:ksi');assert(await p.evaluate(()=>!document.querySelector('.sheet')))});
    await ok('painoehdotus tähtää ideaaliin',async()=>{const e=await p.evaluate(()=>TK.ehdotus(TK.S().liikkeet[0]));assert(e&&e.kg>0&&/ideaali 8/.test(e.syy),JSON.stringify(e));await p.click('text=Penkkipunnerrus');await leveys()});
    await ok('automaattinen päättyminen viimeisen sarjan aikaan',async()=>{const t0=await p.evaluate(()=>{const S=TK.S(),t0=Date.now()-3*3600e3;S.treenit.push({id:'auto',alku:t0,loppu:null,sarjat:[{id:'z',liike:'a',t:t0+60000,kg:60,toistot:8}]});return t0});await p.click('nav [data-tab=historia]');await p.click('nav [data-tab=treeni]');
      assert.equal(await p.evaluate(()=>TK.S().treenit.find(x=>x.id==='auto').loppu),t0+60000);assert(!(await p.textContent('#app')).includes('Treeni alkoi'))});
    await ok('liikkeen tavoite ja ennuste',async()=>{await p.click('nav [data-tab=liikkeet]');await p.click('text=Muokkaa >> nth=0');await p.fill('#g-kg','80');await p.fill('#g-rep','8');await p.fill('#g-pvm','2027-06-01');await p.click('[data-act=addgoal]');await p.click('[data-act=savel]');
      await p.click('nav [data-tab=seuranta]');const t=await p.textContent('#app');assert(t.includes('Tavoite 80 kg × 8'));assert(/Aikataulussa|Jäljessä/.test(t));await leveys()});
    await ok('ryhmän tavoite 10 pv: korvattavat rastilla, rasti pois = ennallaan',async()=>{await p.click('nav [data-tab=liikkeet]');await p.click('#subnav [data-id=ryhmat]');await p.click('.lrow:has-text("Rinta") [data-act=gedit]');
      await p.fill('#gf-n','14');await p.fill('#gf-pv','10');await p.fill('#b-tideal','9');await p.click('[data-act=gsave]');assert(await p.locator('.chk').count()>=2);
      await p.click('.chk:has-text("Penkkipunnerrus: ideaali") input');await p.click('[data-act=gsave]');
      const S=await p.evaluate(()=>TK.S());assert.deepEqual(S.as.tavoitteet.Rinta,{n:14,pv:10});assert.equal(S.liikkeet[0].tideal,8);assert.equal(S.liikkeet[2].tideal,9);assert.equal(S.liikkeet[2].sjaksoPv,10);await leveys()});
    await ok('kaikkien ryhmien tavoite kerralla',async()=>{await p.click('#subnav [data-id=kaikki]');await p.fill('#k-n','12');await p.click('[data-act=ksave]');if(await p.locator('[data-act=ksave]:has-text("Käytä")').count())await p.click('[data-act=ksave]');
      const t=await p.evaluate(()=>TK.S().as.tavoitteet);assert.equal(t.Etureidet.n,12);assert.equal(t.Ojentajat.n,12)});
    await ok('seuranta: lihasryhmät ja yhteydet',async()=>{await p.click('nav [data-tab=seuranta]');await p.click('#subnav [data-id=ryhmat]');assert((await p.textContent('#app')).includes('Etureidet'));await p.click('#subnav [data-id=yhteydet]');assert((await p.textContent('#app')).includes('Kertatasolla'));await leveys()});
    await ok('tekstituonti esikatselulla ja tuplien ohitus',async()=>{await p.click('nav [data-tab=asetukset]');const txt='2026-09-01 17:05\nPenkkipunnerrus: 50x8x3, 52,5x7\nMaastaveto: 100kg x 5 @17:30\n';
      await p.fill('#tt',txt);await p.click('[data-act=tuo]');assert((await p.textContent('.draft')).includes('Maastaveto'));const ennen=await p.evaluate(()=>TK.S().treenit.length);await p.click('[data-act=tuo2]');
      const S=await p.evaluate(()=>TK.S());assert.equal(S.treenit.length,ennen+1);const t=S.treenit.find(x=>x.tuotu);assert.deepEqual(t.sarjat.map(s=>s.kg),[50,50,50,52.5,100]);
      await p.fill('#tt',txt);await p.click('[data-act=tuo]');assert((await p.textContent('.err')).includes('Ei uusia'))});
    await ok('ohje tekoälylle sisältää muodon ja liikkeiden nimet',async()=>{await p.click('[data-act=aiohje]');const o=await p.inputValue('#out');assert(o.includes('60x8x3')&&o.includes('Penkkipunnerrus'))});
    await ok('teemat ja tumma tila',async()=>{await p.click('[data-act=vari][data-id=lake]');await p.click('[data-act=tila][data-id=dark]');assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'dark');await leveys()});
    await ok('lihasryhmät luettelona: lisäys, kirjainkoko ei ratkaise, valinta valikosta',async()=>{
      await p.click('nav [data-tab=liikkeet]');await p.click('#subnav [data-id=ryhmat]');
      await p.fill('#r-uusi','Hauikset');await p.click('[data-act=radd]');
      await p.fill('#r-uusi','hauikset');await p.click('[data-act=radd]');assert((await p.textContent('.err')).includes('on jo olemassa'));
      await p.fill('#r-uusi','rinta');await p.click('[data-act=radd]');assert((await p.textContent('.err')).includes('Rinta'));
      const r=await p.evaluate(()=>TK.S().ryhmat);assert.equal(r.filter(x=>x.toLowerCase()==='hauikset').length,1);
      await p.click('#subnav [data-id=liikkeet]');await p.click('text=Lisää liike');await p.fill('#f-nimi','Hauiskääntö');
      await p.selectOption('#f-paa','Hauikset');await p.click('.chips [data-act=sivut]:has-text("Ojentajat")');
      assert(await p.locator('.chips [data-act=sivut]:has-text("Hauikset")').isDisabled(),'pääkohde ei voi olla sivukohde');
      await p.click('[data-act=savel]');const l=await p.evaluate(()=>TK.S().liikkeet.find(x=>x.nimi==='Hauiskääntö'));assert.equal(l.paa,'Hauikset');assert.equal(l.sivu,'Ojentajat');
      await p.click('text=Lisää liike');await p.fill('#f-nimi','hauiskääntö');await p.click('[data-act=savel]');assert((await p.textContent('.err')).includes('on jo olemassa'));await p.click('[data-act=cancell]');await leveys()});
    await ok('ryhmän uudelleennimeäminen ja poisto päivittävät liikkeet',async()=>{await p.click('#subnav [data-id=ryhmat]');await p.click('.lrow:has-text("Hauikset") [data-act=gedit]');
      await p.fill('#gf-nimi','Hauis');await p.click('[data-act=gsave]');
      let S=await p.evaluate(()=>TK.S());assert(S.ryhmat.includes('Hauis'));assert.equal(S.liikkeet.find(x=>x.nimi==='Hauiskääntö').paa,'Hauis');
      await p.click('.lrow:has-text("Hauis") [data-act=gedit]');await p.click('[data-act=rdel]');await p.click('[data-act=rdel2]');
      S=await p.evaluate(()=>TK.S());assert(!S.ryhmat.includes('Hauis'));assert.equal(S.liikkeet.find(x=>x.nimi==='Hauiskääntö').paa,'')});
    await ok('alavälilehdet ovat alareunassa',async()=>{await p.click('nav [data-tab=seuranta]');const sb=await p.locator('#subnav').boundingBox(),nb=await p.locator('nav').boundingBox();assert(sb.y+sb.height<=nb.y+1&&sb.y>h*0.6,JSON.stringify([sb,nb]));
      await p.click('nav [data-tab=treeni]');assert(await p.locator('#subnav').isHidden())});
    await ok('kenttien teksti vähintään 16 px (iPhone ei zoomaa)',async()=>{for(const v of ['treeni','liikkeet','asetukset']){await p.click('nav [data-tab='+v+']');if(v==='liikkeet'){await p.click('#subnav [data-id=liikkeet]');await p.click('text=Muokkaa >> nth=0')}if(v==='treeni'){await p.click('.exhead >> nth=0');if(await p.locator('[data-act=addset]').count())await p.click('[data-act=addset]')}
      const pienet=await p.evaluate(()=>[...document.querySelectorAll('input:not([type=file]):not([type=checkbox]),textarea,select')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).map(e=>e.id));assert.deepEqual(pienet,[],v)}
      assert((await p.getAttribute('meta[name=viewport]','content')).includes('maximum-scale=1'))});
    await ok('tiedot säilyvät uudelleenlatauksessa',async()=>{const a=await p.evaluate(()=>TK.S().treenit.length);await p.reload();assert.equal(await p.evaluate(()=>TK.S().treenit.length),a)});
    assert.deepEqual(errs,[]);await ctx.close();
  }
  console.log(n+' selaintestiä läpi');await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
