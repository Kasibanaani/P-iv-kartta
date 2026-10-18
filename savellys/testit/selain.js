// Selaintestit tietokoneleveyksillä 1440 (vaalea) ja 1280 px (tumma). Chromium, ei Safari eikä oikea kuuntelu.
'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),vm=require('vm');
const OUT=path.join(__dirname,'tulosteet');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(path.join(__dirname,'..','index.html'));
const box={module:{},TextEncoder,TextDecoder,Math,Date,JSON};vm.createContext(box);vm.runInContext(/<script id="engine">([\s\S]*?)<\/script>/.exec(String(html))[1],box);const SV=box.module.exports;
let checks=0,fails=0;
async function ok(name,fn){try{await fn();checks++;console.log('ok   '+name);}catch(e){fails++;console.log('FAIL '+name+'\n     '+String(e&&e.message||e).split('\n').slice(0,30).join(' '));}}

(async()=>{
  const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(html);});
  await new Promise(res=>server.listen(0,'127.0.0.1',res));const URL='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  for(const [W,H,scheme] of [[1440,900,'light'],[1280,800,'dark']]){
    console.log('--- '+W+' px, '+scheme);
    const ctx=await browser.newContext({viewport:{width:W,height:H},colorScheme:scheme,acceptDownloads:true});
    const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    let dialogAnswer=null;pg.on('dialog',d=>{if(d.type()==='prompt'&&dialogAnswer!=null)d.accept(dialogAnswer);else d.accept();});
    await pg.goto(URL);await pg.waitForSelector('#roll');
    const box=async()=>pg.locator('#roll').boundingBox();
    // ruudun piste nuotin keskelle: tikki ja sävel
    const at=async(tick,s)=>{const b=await box();return pg.evaluate(([t,s,bx,by])=>{const v=__sv;return [bx+v.tx(t),by+v.ry(s)+v.rowH()/2];},[tick,s,b.x,b.y]);};
    const notes=()=>pg.evaluate(()=>__sv.track().nuotit.map(n=>[n.s,n.a,n.k]));

    await ok('aloitus: otsikko, yksi tyhjä raita, ei vaakavieritystä, kaikki napit näkyvissä',async()=>{
      assert.equal(await pg.textContent('.brand'),'Sävellyspaja');assert.equal(await pg.$$eval('.trk',x=>x.length),1);assert.equal((await notes()).length,0);
      const r=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,document.querySelector('#helpBtn').getBoundingClientRect().right,document.querySelector('.bar').getBoundingClientRect().height]);
      assert(r[0]<=r[1],'vaakavieritys '+r);assert(r[2]<=r[1],'Ohje-nappi ruudun ulkona '+r);
    });
    await ok('klikkaus tyhjään lisää nuotin ruudukkoon (C4, tahdin alku)',async()=>{
      await pg.evaluate(()=>{__sv.S.sx=0;__sv.render();});
      const [x,y]=await at(30,60);await pg.mouse.click(x,y);
      assert.deepEqual(await notes(),[[60,0,240]]);
      const [x2,y2]=await at(480+50,64);await pg.mouse.click(x2,y2);const [x3,y3]=await at(960+10,67);await pg.mouse.click(x3,y3);
      assert.deepEqual(await notes(),[[60,0,240],[64,480,240],[67,960,240]]);
    });
    await ok('nuotin veto siirtää ajassa ja sävelessä ruudukkoon',async()=>{
      const [x,y]=await at(480+60,64);const [x2,y2]=await at(720+60,65);
      await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x2,y2,{steps:6});await pg.mouse.up();
      assert.deepEqual(await notes(),[[60,0,240],[65,720,240],[67,960,240]]);
    });
    await ok('oikean reunan veto muuttaa pituutta ja uusi nuotti saa saman pituuden',async()=>{
      const [x,y]=await at(240-4,60);const [x2]=await at(480,60);
      await pg.mouse.move(x-2,y);await pg.mouse.down();await pg.mouse.move(x2-2,y,{steps:6});await pg.mouse.up();
      assert.deepEqual((await notes())[0],[60,0,480]);assert.equal(await pg.inputValue('#len'),'480');
    });
    await ok('kumoa ja tee uudelleen',async()=>{await pg.click('#undoBtn');assert.deepEqual((await notes())[0],[60,0,240]);await pg.click('#redoBtn');assert.deepEqual((await notes())[0],[60,0,480]);
      await pg.keyboard.press('Control+z');assert.deepEqual((await notes())[0],[60,0,240]);await pg.keyboard.press('Control+Shift+z');assert.deepEqual((await notes())[0],[60,0,480]);});
    await ok('alueen valinta ja transponointi nuolella (Shift = oktaavi)',async()=>{
      const [x,y]=await at(700,70),[x2,y2]=await at(1300,62);await pg.mouse.move(x,y);await pg.mouse.down();await pg.mouse.move(x2,y2,{steps:5});await pg.mouse.up();
      assert.equal(await pg.evaluate(()=>__sv.S.sel.length),2);await pg.keyboard.press('ArrowUp');await pg.keyboard.press('Shift+ArrowDown');
      assert.deepEqual(await notes(),[[60,0,480],[54,720,240],[56,960,240]]);
    });
    await ok('kaksoisklikkaus poistaa, Delete poistaa valitut',async()=>{
      const [x,y]=await at(1000,56);await pg.mouse.dblclick(x,y);assert.deepEqual(await notes(),[[60,0,480],[54,720,240]]);
      await pg.keyboard.press('Control+a');await pg.keyboard.press('Delete');assert.deepEqual(await notes(),[]);await pg.keyboard.press('Control+z');assert.equal((await notes()).length,2);});
    await ok('kopioi ja liitä aloituskohtaan, monista perään',async()=>{
      await pg.keyboard.press('Control+a');await pg.keyboard.press('Control+c');
      const b=await box();const [rx]=await at(1920,60);await pg.mouse.click(rx,b.y+10);
      assert.equal(await pg.evaluate(()=>__sv.S.pos),1920);await pg.keyboard.press('Control+v');
      assert.deepEqual(await notes(),[[60,0,480],[54,720,240],[60,1920,480],[54,2640,240]]);
      await pg.keyboard.press('Control+d');assert.equal((await notes()).length,6);});
    await ok('raidan lisäys: rummut, rivit soittimittain ja nuotti bassarin riville',async()=>{
      await pg.click('#addTrk');await pg.click('[data-a="newTrk"][data-v="rummut"]');assert.equal(await pg.$$eval('.trk',x=>x.length),2);
      assert.equal(await pg.evaluate(()=>__sv.track().aani),'rummut');
      const [x,y]=await at(0+20,36);await pg.mouse.click(x,y);const [x2,y2]=await at(480+20,38);await pg.mouse.click(x2,y2);
      assert.deepEqual(await notes(),[[36,0,120],[38,480,120]]);
      await pg.screenshot({path:path.join(OUT,W+'_rummut.png')});
    });
    await ok('raidan vaihto, mykistys ja äänen vaihto',async()=>{
      await pg.click('.trk >> nth=0');assert.equal(await pg.evaluate(()=>__sv.track().aani),'pluck');
      await pg.click('.trk >> nth=0 >> [data-a="mute"]');assert.equal(await pg.evaluate(()=>__sv.P().raidat[0].mute),true);
      await pg.selectOption('.trk >> nth=0 >> select','matto');assert.equal(await pg.evaluate(()=>__sv.P().raidat[0].aani),'matto');assert.equal(await pg.evaluate(()=>__sv.P().raidat[0].nimi),'Raita 1');
      await pg.click('.trk >> nth=0 >> [data-a="mute"]');
    });
    await ok('projektin asetukset: tempo, tahtilaji, sävellaji',async()=>{
      await pg.fill('#tempo','72');await pg.press('#tempo','Enter');await pg.selectOption('#tahti','6/8');await pg.selectOption('#juuri','9');await pg.selectOption('#asteikko','doori');
      const p=await pg.evaluate(()=>{const p=__sv.P();return [p.tempo,p.tahti,p.savel];});assert.deepEqual(p,[72,[6,8],{juuri:9,asteikko:'doori'}]);
      await pg.evaluate(()=>{__sv.S.sx=0;__sv.render();});await pg.screenshot({path:path.join(OUT,W+'_roll.png')});
    });
    await ok('soitto käynnistyy, soittokohta etenee, välilyönti pysäyttää',async()=>{
      await pg.click('#homeBtn');await pg.click('#playBtn');await pg.waitForFunction(()=>__sv.playing()&&__sv.playTick()>100,null,{timeout:5000});
      assert.equal(await pg.evaluate(()=>__sv.audio()),'running');
      await pg.locator('.brand').click();await pg.keyboard.press('Space');await pg.waitForFunction(()=>!__sv.playing(),null,{timeout:3000});});
    await ok('silmukka: viivaimen veto asettaa tahdit, soitto kääntyy alkuun',async()=>{
      const b=await box();const bar=await pg.evaluate(()=>SV.barTicks(__sv.P()));
      const [x0]=await at(0,60),[x1]=await at(bar,60);await pg.mouse.move(x0+3,b.y+10);await pg.mouse.down();await pg.mouse.move(x1,b.y+10,{steps:5});await pg.mouse.up();
      assert.deepEqual(await pg.evaluate(()=>__sv.P().silmukka),{on:true,a:0,b:1});
      await pg.evaluate(()=>{__sv.P().tempo=300;});await pg.click('#playBtn');
      await pg.waitForFunction(b=>{window.__mx=Math.max(window.__mx||0,__sv.playTick());return window.__mx>b*0.8&&__sv.playTick()<b*0.5;},bar,{timeout:6000,polling:20});
      await pg.keyboard.press('Space');await pg.fill('#tempo','71');await pg.press('#tempo','Enter');await pg.fill('#tempo','72');await pg.press('#tempo','Enter');
    });
    await ok('MIDI-vienti: lataus on luettava tiedosto, kaikki raidat mukana',async()=>{
      await pg.click('#midiBtn');const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-a="mAll"]')]);
      const f=path.join(OUT,W+'.mid');await dl.saveAs(f);const x=SV.readMidi(new Uint8Array(fs.readFileSync(f)));
      assert(!x.virhe,x.virhe);assert.equal(x.raidat.length,2);assert.equal(x.raidat[1].kanava,9);assert(Math.abs(x.tempo-72)<0.01);assert.deepEqual(x.tahti,[6,8]);
      assert.equal(x.raidat[0].nuotit.length,6);
      const [d2]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-a="mOne"] >> nth=1')]);assert(/rummut\.mid$/.test(d2.suggestedFilename()),d2.suggestedFilename());
      await pg.click('[data-a="close"]');});
    await ok('tallennus säilyy uudelleenlatauksessa',async()=>{await pg.waitForTimeout(400);await pg.reload();await pg.waitForSelector('#roll');
      const r=await pg.evaluate(()=>[__sv.P().raidat.length,__sv.P().raidat[0].nuotit.length,__sv.P().tempo]);assert.deepEqual(r,[2,6,72]);});
    await ok('uusi projekti, vaihto ja MIDI-tuonti uudeksi projektiksi',async()=>{
      dialogAnswer='Toinen';await pg.click('#projBtn');await pg.click('[data-a="pNew"]');assert.equal(await pg.evaluate(()=>__sv.P().nimi),'Toinen');
      assert.equal(await pg.evaluate(()=>__sv.D().projektit.length),2);
      await pg.setInputFiles('#midiIn',path.join(OUT,W+'.mid'));await pg.waitForFunction(()=>__sv.D().projektit.length===3);
      const r=await pg.evaluate(()=>[__sv.P().nimi,__sv.P().raidat.map(t=>t.aani),__sv.P().tempo]);assert.deepEqual(r,[String(W),['matto','rummut'],72]);dialogAnswer=null;});
    await ok('tekoälyn projekti tekstinä lisätään uutena',async()=>{
      const p={app:'savellys',ver:1,projekti:{nimi:'Tekoälyltä',tempo:80,raidat:[{nimi:'Melodia',aani:'lead',nuotit:[{s:69,a:0,k:480,v:90}]}]}};
      await pg.evaluate(t=>__sv.importText(t),JSON.stringify(p));const r=await pg.evaluate(()=>[__sv.P().nimi,__sv.P().raidat[0].aani,__sv.D().projektit.length]);assert.deepEqual(r,['Tekoälyltä','lead',4]);});
    await ok('vanha tai rikkinäinen tallennus ei kaada',async()=>{
      await pg.evaluate(()=>localStorage.setItem('savellys:v1',JSON.stringify({app:'savellys',ver:1,projektit:[{nimi:'Vanha',raidat:[{nuotit:[{s:60,a:0}]},'roska']}]})));
      await pg.reload();await pg.waitForSelector('#roll');assert.deepEqual(await pg.evaluate(()=>[__sv.P().nimi,__sv.P().raidat.length,__sv.P().raidat[0].nuotit[0].k]),['Vanha',1,480]);});
    await ok('dialogit: ohje, asetukset (teema vaihtuu), varmuuskopio, raidan valikko',async()=>{
      await pg.click('#helpBtn');assert(await pg.isVisible('#dlg h2'));await pg.keyboard.press('Escape');assert(await pg.isHidden('#shade'));
      await pg.click('#setBtn');await pg.click('[data-a="ap-theme"][data-v="lake"]');assert.equal(await pg.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()),scheme==='dark'?'#A8C8E7':'#386EA2');
      await pg.screenshot({path:path.join(OUT,W+'_asetukset.png')});await pg.click('[data-a="close"]');
      await pg.click('#backupBtn');const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-a="bkFile"]')]);assert(/savellys-varmuuskopio/.test(dl.suggestedFilename()));await pg.click('[data-a="close"]');
      await pg.click('.trk >> nth=0 >> [data-a="trkMenu"]');assert(/Raita/.test(await pg.textContent('#dlg h2')));await pg.click('[data-a="close"]');});
    await ok('ei virheitä konsolissa',async()=>{assert.deepEqual(errs,[]);});
    await ctx.close();
  }
  await browser.close();server.close();
  console.log((fails?'VIRHEITÄ ':'')+checks+'/'+(checks+fails)+' ok');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
