// Selaintestit tietokoneleveyksillä 1440 (vaalea) ja 1280 px (tumma). Chromium, ei Safari eikä oikea kuuntelu.
'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const OUT=path.join(__dirname,'tulosteet');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(__dirname,'..','index.html'));
let checks=0,fails=0;
async function ok(name,fn){try{await fn();checks++;console.log('ok   '+name);}catch(e){fails++;console.log('FAIL '+name+'\n     '+String(e&&e.message||e).split('\n').slice(0,4).join('\n     '));}}
async function center(pg,sel){const b=await pg.locator(sel).boundingBox();return [b.x+b.width/2,b.y+b.height/2];}
async function dragV(pg,sel,dy){const [x,y]=await center(pg,sel);await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x,y+dy/2,{steps:4});await pg.mouse.move(x,y+dy,{steps:4});await pg.mouse.up();}
async function cable(pg,a,b){const [x,y]=await center(pg,'[data-jack="'+a+'"]'),[x2,y2]=await center(pg,'[data-jack="'+b+'"]');await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x2,y2,{steps:8});await pg.mouse.up();}

(async()=>{
  const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(html);});
  await new Promise(res=>server.listen(0,'127.0.0.1',res));const URL='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  for(const [W,H,scheme] of [[1440,900,'light'],[1280,800,'dark']]){
    console.log('--- '+W+' px, '+scheme);
    const ctx=await browser.newContext({viewport:{width:W,height:H},colorScheme:scheme,acceptDownloads:true});
    const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});pg.on('dialog',d=>d.accept());
    await pg.goto(URL);await pg.waitForSelector('.knob');
    await ok('paneeli: 33 potikkaa, 6 kytkintä, 24 pistoketta, mahtuu ruutuun',async()=>{
      assert.equal(await pg.textContent('.brand'),'Rumpusyntikka');
      assert.equal(await pg.$$eval('.knob',x=>x.length),33);assert.equal(await pg.$$eval('.sw',x=>x.length),6);assert.equal(await pg.$$eval('.jack',x=>x.length),24);
      const r=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.getElementById('panel').getBoundingClientRect().bottom]);
      assert(r[0]<=r[1],'vaakavieritys '+r);assert(r[2]<=H,'paneeli ei mahdu korkeussuunnassa: '+r[2]);
    });
    await pg.screenshot({path:path.join(OUT,W+'_alku.png')});
    await ok('potikan veto ylös nostaa arvoa ja näyttää taajuuden',async()=>{
      const v0=await pg.evaluate(()=>__rs.P().p.vco1Freq);await dragV(pg,'[data-id="vco1Freq"]',-60);
      const v1=await pg.evaluate(()=>__rs.P().p.vco1Freq);assert(v1>v0+0.2,v0+' → '+v1);
      assert(/Hz/.test(await pg.textContent('#readout')),await pg.textContent('#readout'));
    });
    await ok('kaksoisklikkaus palauttaa, rulla ja nuolinäppäin säätävät',async()=>{
      await pg.dblclick('[data-id="vco1Freq"]');assert.equal(await pg.evaluate(()=>__rs.P().p.vco1Freq),0.3);
      await pg.hover('[data-id="cutoff"]');await pg.mouse.wheel(0,-100);assert(Math.abs(await pg.evaluate(()=>__rs.P().p.cutoff)-0.56)<1e-9);
      await pg.focus('[data-id="vco1Eg"]');await pg.keyboard.press('ArrowDown');assert(Math.abs(await pg.evaluate(()=>__rs.P().p.vco1Eg)-0.48)<1e-9);
    });
    await ok('kaksisuuntainen potikka menee negatiiviseksi',async()=>{await dragV(pg,'[data-id="vcfEg"]',200);assert.equal(await pg.evaluate(()=>__rs.P().p.vcfEg),-1);});
    await ok('kytkin vaihtaa asentoa',async()=>{await pg.click('[data-id="seqPitchMod"] [data-swi="2"]');assert.equal(await pg.evaluate(()=>__rs.P().p.seqPitchMod),2);
      assert.equal(await pg.getAttribute('[data-id="seqPitchMod"] [data-swi="2"]','aria-pressed'),'true');});
    await ok('RUN/STOP: ääni käynnistyy AudioWorkletissa ja askelvalo kulkee, välilyönti pysäyttää',async()=>{
      await pg.click('#runBtn');await pg.waitForFunction(()=>__rs.running()&&__rs.step()>=1,null,{timeout:5000});
      const a=await pg.evaluate(()=>__rs.audio());assert.deepEqual(a,{ctx:'running',worklet:true,fallback:false});
      assert.equal(await pg.$$eval('.led.on',x=>x.length),1);
      await pg.locator('body').click({position:{x:5,y:H-5}});await pg.keyboard.press('Space');await pg.waitForFunction(()=>!__rs.running(),null,{timeout:3000});
    });
    await ok('ADVANCE siirtää askeleen',async()=>{const s=await pg.evaluate(()=>__rs.step());await pg.click('#advBtn');await pg.waitForFunction(s=>__rs.step()===(s+1)%8,s,{timeout:3000});});
    await ok('kaapeli: veto lähdöstä tuloon, piirtyy, klikkaus poistaa',async()=>{
      await cable(pg,'vcoEg','vcaCv');assert.deepEqual(await pg.evaluate(()=>__rs.P().cab),[['vcoEg','vcaCv']]);
      assert.equal(await pg.$$eval('#cables path[data-cab]',x=>x.length),1);
      await cable(pg,'trigO','adv');await cable(pg,'velO','vcaCv');
      assert.deepEqual(await pg.evaluate(()=>__rs.P().cab),[['trigO','adv'],['velO','vcaCv']],'tuloon mahtuu yksi kaapeli');
      await pg.screenshot({path:path.join(OUT,W+'_kaapelit.png')});
      const b=await pg.locator('#cables path[data-cab="0"]').boundingBox();
      await pg.evaluate(()=>document.querySelector('#cables path[data-cab="0"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
      assert.deepEqual(await pg.evaluate(()=>__rs.P().cab),[['velO','vcaCv']]);assert(b);
    });
    await ok('kaapelin veto tulosta tyhjään irrottaa sen',async()=>{
      const [x,y]=await center(pg,'[data-jack="vcaCv"]');await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x-300,y+300,{steps:6});await pg.mouse.up();
      assert.deepEqual(await pg.evaluate(()=>__rs.P().cab),[]);
    });
    await ok('pistokkeen päällä näkyy selitys',async()=>{await pg.hover('[data-jack="vcfMod"]');assert((await pg.textContent('#readout')).includes('kohina'));});
    await ok('säädöt ja kaapelit säilyvät uudelleenlatauksessa',async()=>{
      await cable(pg,'pitchO','fmAmt');await pg.waitForTimeout(400);await pg.reload();await pg.waitForSelector('.knob');
      const p=await pg.evaluate(()=>__rs.P());assert.equal(p.p.seqPitchMod,2);assert.equal(p.p.vcfEg,-1);assert.deepEqual(p.cab,[['pitchO','fmAmt']]);
      assert.equal(await pg.$$eval('#cables path[data-cab]',x=>x.length),1);
    });
    await ok('omat äänet: tallenna nimellä, muuta, avaa takaisin',async()=>{
      await pg.click('#soundBtn');await pg.fill('#sndName','Metallibassari');await pg.click('[data-a="saveNew"]');
      assert.equal((await pg.textContent('#soundBtn')).trim(),'Metallibassari ▾');await pg.click('[data-a="close"]');
      await dragV(pg,'[data-id="res"]',-80);assert((await pg.textContent('#soundBtn')).includes('•'));
      await pg.click('#soundBtn');await pg.click('.snd [data-a="load"]');
      assert.equal(await pg.evaluate(()=>__rs.P().p.res),0.15);assert.equal((await pg.textContent('#soundBtn')).trim(),'Metallibassari ▾');
      const d=await pg.evaluate(()=>__rs.D());assert.equal(d.omat.length,1);assert.equal(d.omat[0].patch.cab.length,1);
    });
    await ok('esimerkkiääni avautuu valikosta',async()=>{
      await pg.click('#soundBtn');await pg.click('[data-a="ex"][data-i="0"]');
      assert.equal((await pg.textContent('#soundBtn')).trim(),'Bassari ▾');const p=await pg.evaluate(()=>__rs.P());assert.equal(p.p.vco1Eg,0.55);assert.deepEqual(p.vel,[1,0,0.45,0,1,0,0.3,0.6]);
      assert.equal(await pg.evaluate(()=>__rs.D().omat.length),1,'esimerkki ei mene omiin ääniin');
      await pg.click('#soundBtn');await pg.click('[data-a="res"][data-i="2"]');
      assert.equal((await pg.textContent('#soundBtn')).trim(),'Bassari ja virveli ▾');assert.deepEqual(await pg.evaluate(()=>__rs.P().cab),[['pitchO','noise']]);
      assert.equal(await pg.$$eval('#cables path[data-cab]',x=>x.length),1);
      await pg.click('#soundBtn');await pg.click('.snd [data-a="load"]');
    });
    await ok('Tallenna ääni: .wav latautuu ja siinä on ääntä',async()=>{
      await pg.click('#wavBtn');await pg.selectOption('#wLoops','1');
      const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('#wGo')]);const f=path.join(OUT,W+'_aani.wav');await dl.saveAs(f);
      const b=fs.readFileSync(f);assert.equal(b.toString('latin1',0,4),'RIFF');assert.equal(dl.suggestedFilename(),'rumpusyntikka-metallibassari.wav');
      let mx=0;for(let i=44;i+1<b.length;i+=2)mx=Math.max(mx,Math.abs(b.readInt16LE(i)));assert(mx>1000,'huippu '+mx);
    });
    await ok('varmuuskopio: lataus ja tuonti tekstistä',async()=>{
      await pg.click('#backupBtn');const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-a="bkFile"]')]);
      const f=path.join(OUT,W+'_kopio.json');await dl.saveAs(f);const x=JSON.parse(fs.readFileSync(f,'utf8'));assert.equal(x.app,'rumpusyntikka');assert.equal(x.omat.length,1);
      x.omat.push({id:'t2',nm:'Toinen',patch:{p:{cutoff:0.2}}});x.nyky.p.cutoff=0.9;
      await pg.fill('#bkTa',JSON.stringify(x));await pg.click('[data-a="bkImpText"]');
      const d=await pg.evaluate(()=>__rs.D());assert.equal(d.omat.length,2);assert.equal(d.nyky.p.cutoff,0.9);assert.equal(d.omat[1].patch.p.vco1Lvl,0.8);
    });
    await ok('ohje ja ulkoasu aukeavat ja sulkeutuvat',async()=>{
      await pg.click('#helpBtn');assert(!(await pg.isHidden('#shade')));await pg.screenshot({path:path.join(OUT,W+'_ohje.png')});await pg.keyboard.press('Escape');assert(await pg.isHidden('#shade'));
      await pg.click('#apBtn');await pg.click('[data-a="ap-theme"][data-v="copper"]');await pg.click('[data-a="ap-mode"][data-v="'+(scheme==='light'?'light':'dark')+'"]');
      assert.equal(await pg.evaluate(()=>JSON.parse(localStorage.getItem('rumpusyntikka:appearance')).theme),'copper');await pg.click('[data-a="close"]');
    });
    await ok('tekstin kontrasti vähintään 4,5:1 (nimet ja selitteet)',async()=>{
      const r=await pg.evaluate(()=>{
        const lum=c=>{const m=c.match(/\d+(\.\d+)?/g).map(Number).slice(0,3).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2];};
        const bg=el=>{while(el){const c=getComputedStyle(el).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;el=el.parentElement;}return 'rgb(255,255,255)';};
        let worst=99,w='';document.querySelectorAll('.lab,.sec h3,.jl,.rowlab,.stn,.hint,.sw button').forEach(el=>{const a=lum(getComputedStyle(el).color),b=lum(bg(el));const c=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);if(c<worst){worst=c;w=el.className+' '+el.textContent.slice(0,20);}});return [worst,w];});
      assert(r[0]>=4.5,r.join(' '));
    });
    await pg.screenshot({path:path.join(OUT,W+'_loppu.png')});
    await ok('ei virheitä sivulla',async()=>{assert.deepEqual(errs,[]);});
    await ctx.close();
  }
  await browser.close();server.close();
  console.log(checks+' ok, '+fails+' virhettä');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
