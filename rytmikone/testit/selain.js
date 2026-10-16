// Selaintestit puhelinleveyksillä 390 ja 320 px (Chromium, ei oikea iPhone).
// Valemikrofoni soittaa testin tekemää äänitiedostoa, jossa on tunnetut iskut (toistuu 4 s välein):
// 0,5 s ja 1,0 s kova (-1 dB), 1,5 s keskikova (-6 dB), 2,0 s hiljainen (-26 dB), taustakohina noin -60 dB.
'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const OUT=path.join(__dirname,'tulosteet');fs.mkdirSync(OUT,{recursive:true});
const SR=48000;
function wav(file,sec,hits,noise){
  const n=sec*SR,b=Buffer.alloc(44+n*2);let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*2-1;};
  b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
  b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){let x=noise*rnd();for(const [t,a] of hits){const k=i-Math.round(t*SR);if(k>=0&&k<SR*0.03)x+=a*Math.sin(k/SR*2*Math.PI*220)*Math.exp(-k/(SR*0.006));}
    b.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(x*32767))),44+i*2);}
  fs.writeFileSync(file,b);
}
const MIC=path.join(OUT,'mikki.wav'),SONG=path.join(OUT,'biisi.wav');
wav(MIC,4,[[0.5,0.9],[1.0,0.9],[1.5,0.5],[2.0,0.05]],0.001);
wav(SONG,2,[[0.2,0.3]],0.0);
const SAMPLE=path.join(OUT,'sample.wav');wav(SAMPLE,0.3,[[0.0,0.8]],0.0);
function readWav(f){const b=fs.readFileSync(f);let mx=0;for(let i=44;i+1<b.length;i+=2)mx=Math.max(mx,Math.abs(b.readInt16LE(i)));return {riff:b.toString('latin1',0,4),sr:b.readUInt32LE(24),sec:b.readUInt32LE(40)/2/b.readUInt32LE(24),max:mx};}
const html=fs.readFileSync(path.join(__dirname,'..','index.html'));
let checks=0,fails=0;
async function ok(name,fn){try{await fn();checks++;console.log('ok   '+name);}catch(e){fails++;console.log('FAIL '+name+'\n     '+String(e&&e.message||e).split('\n').slice(0,4).join('\n     '));}}
function readMidi(u){const b=Buffer.from(u);if(b.toString('latin1',0,4)!=='MThd')throw Error('ei MIDI');return {fmt:b.readUInt16BE(8),nt:b.readUInt16BE(10),notes:(b.toString('latin1').match(/\x99/g)||[]).length};}

(async()=>{
  const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end(html);});
  await new Promise(res=>server.listen(0,'127.0.0.1',res));const URL='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+MIC,'--autoplay-policy=no-user-gesture-required']});
  const fits=async(pg,label)=>{const r=await pg.evaluate(()=>[document.documentElement.scrollWidth,innerWidth,(()=>{const e=document.getElementById('editor');return e.hidden?0:e.scrollWidth-e.clientWidth;})()]);assert(r[0]<=r[1]&&r[2]<=0,label+' leveys '+JSON.stringify(r));};

  // ---------- 390 px, vaalea ----------
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,colorScheme:'light',acceptDownloads:true});
  await ctx.grantPermissions(['microphone']);
  const pg=await ctx.newPage(),errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>d.accept());
  await pg.goto(URL);await pg.waitForSelector('#recBtn');
  await ok('aloitus: nimi, kolme välilehteä, projekti, ei vaakavieritystä',async()=>{
    assert.equal(await pg.textContent('.brand'),'Rytmikone');
    assert.deepEqual(await pg.$$eval('#tabs button',b=>b.map(x=>x.textContent)),['Nauhoita','Otot','Äänet','Asetukset']);
    assert.equal(await pg.textContent('#projBtn'),'Projekti 1 ▾');await fits(pg,'aloitus');
    const r=await pg.locator('#recBtn').boundingBox();assert(r.width>=120&&r.height>=120,JSON.stringify(r));
  });
  await pg.screenshot({path:path.join(OUT,'390_nauhoita.png'),fullPage:true});
  await ok('esilaskenta päällä oletuksena, viive kalibroimatta näkyy varoituksena',async()=>{
    assert.equal(await pg.getAttribute('[data-k="esilasku"]','aria-pressed'),'true');
    assert((await pg.textContent('#v-rec')).includes('Viivettä ei ole kalibroitu'));
  });
  await ok('tempo: +/- ja kirjoitus',async()=>{
    await pg.click('[data-act="tempo"][data-d="1"]');assert.equal(await pg.evaluate(()=>__rk.P().tempo),121);
    await pg.fill('#tempo','96,5');await pg.press('#tempo','Tab');assert.equal(await pg.evaluate(()=>__rk.P().tempo),96.5);
    await pg.fill('#tempo','120');await pg.press('#tempo','Tab');
  });
  await ok('hiljaisuuden kalibrointi asettaa portin kohinan yläpuolelle',async()=>{
    // valemikrofoni ei ole hiljaa (iskuja), joten tarkistetaan vain, että mittaus valmistuu ja portti muuttuu järkeväksi
    await pg.click('[data-act="quiet"]');await pg.waitForFunction(()=>!__rk.job(),null,{timeout:6000});
    const s=await pg.evaluate(()=>__rk.D().oletus);assert(s.portti>=-80&&s.portti<=-6,JSON.stringify(s));
    assert((await pg.textContent('#v-rec')).includes('→ portti'));
    await pg.evaluate(()=>{const d=__rk.D();d.oletus.portti=-36;d.oletus.hiljaisin=-36;});
  });
  await ok('nauhoitus ilman esilaskentaa: iskut tunnistetaan, editori aukeaa',async()=>{
    await pg.click('[data-k="esilasku"]');assert.equal(await pg.evaluate(()=>__rk.P().esilasku),false);
    await pg.click('#recBtn');await pg.waitForFunction(()=>__rk.job()==='rec');
    assert(await pg.evaluate(()=>document.body.classList.contains('busy')));
    await pg.waitForTimeout(4300);
    const live=await pg.textContent('#recInfo');assert(/[1-9]\d* iskua/.test(live),live);
    await pg.click('#recBtn');await pg.waitForSelector('#editor:not([hidden])');
    const T=await pg.evaluate(()=>{const T=__rk.P().otot[0];return {n:T.nimi,ref:T.ref,alku:T.alku,viive:T.viive,len:__rk.envOf(T).length/T.hz,hits:RK.takeHits(T,__rk.envOf(T)).map(h=>[Math.round(h.t*100)/100,h.v])};});
    assert.equal(T.n,'Otto 1');assert.equal(T.ref,'');assert.equal(T.alku,0);assert.equal(T.viive,0);
    assert(T.len>3.8&&T.len<5.5,'kesto '+T.len);
    // 4 s jakso: kovat 0,5 ja 1,0, keskikova 1,5 ylittävät portin -36 dB; hiljainen -26 dB myös; jaksoja 1–2
    assert(T.hits.length>=4&&T.hits.length<=9,JSON.stringify(T.hits));
    const gaps=T.hits.slice(1).map((h,i)=>Math.round((h[0]-T.hits[i][0])*10)/10);
    assert(gaps.filter(g=>g===0.5).length>=2,'välit '+JSON.stringify(gaps));
    const hard=T.hits.filter(h=>h[1]>=120).length,soft=T.hits.filter(h=>h[1]<60).length;assert(hard>=1&&soft>=1,JSON.stringify(T.hits));
    assert(!(await pg.evaluate(()=>document.body.classList.contains('busy'))));
    console.log('     iskut [aika s, velocity]: '+JSON.stringify(T.hits));
  });
  await pg.screenshot({path:path.join(OUT,'390_editori.png'),fullPage:false});
  await ok('editori: portti nostetaan -> hiljaiset iskut pois, tilasto päivittyy',async()=>{
    const before=await pg.evaluate(()=>{const T=__rk.P().otot[0];return RK.takeHits(T,__rk.envOf(T)).length;});
    await pg.$eval('[data-s="portti"]',e=>{e.value='-12';e.dispatchEvent(new Event('input',{bubbles:true}));});
    const after=await pg.evaluate(()=>{const T=__rk.P().otot[0];return RK.takeHits(T,__rk.envOf(T)).length;});
    assert(after<before&&after>=1,before+' -> '+after);
    assert.equal(await pg.textContent('#eStats div b'),String(after));
    assert.equal(await pg.textContent('#o-portti'),'−12 dB');
    assert.equal(await pg.evaluate(()=>__rk.D().oletus.portti),-12,'seuraavan oton oletus seuraa säätöä');
    await pg.$eval('[data-s="portti"]',e=>{e.value='-36';e.dispatchEvent(new Event('input',{bubbles:true}));});
  });
  await ok('editori: sovita velocity, käyrä, nuotti, nimi, esiasetus',async()=>{
    await pg.click('[data-act="fit"]');const s=await pg.evaluate(()=>__rk.P().otot[0].s);assert(s.kovin>s.hiljaisin&&s.kovin<=0,JSON.stringify(s));
    const vs=await pg.evaluate(()=>{const T=__rk.P().otot[0];return RK.takeHits(T,__rk.envOf(T)).map(h=>h.v);});assert(Math.max(...vs)===127&&Math.min(...vs)<=2,JSON.stringify(vs));
    await pg.click('[data-act="curve"][data-v="hiljaiset"]');assert.equal(await pg.evaluate(()=>__rk.P().otot[0].s.kayra),'hiljaiset');
    await pg.selectOption('#eNote','38');assert.equal(await pg.evaluate(()=>__rk.P().otot[0].nuotti),38);assert.equal(await pg.inputValue('#eNoteNum'),'38');
    await pg.fill('#eNoteNum','77');await pg.press('#eNoteNum','Tab');assert.equal(await pg.evaluate(()=>__rk.P().otot[0].nuotti),77);assert.equal(await pg.inputValue('#eNote'),'77');
    await pg.selectOption('#eNote','38');
    await pg.fill('#eName','Virveli');assert.equal(await pg.evaluate(()=>__rk.P().otot[0].nimi),'Virveli');
    await pg.fill('#ePresetName','Olohuone');await pg.click('[data-act="presetSave"]');assert.deepEqual(await pg.evaluate(()=>__rk.D().esi.map(e=>e.nimi)),['Olohuone']);
  });
  await ok('editori: lähennys, siirto vetämällä, koko otto',async()=>{
    const v0=await pg.evaluate(()=>[__rk.edit().v0,__rk.edit().v1]);
    await pg.click('[data-act="zoom"][data-z="0.5"]');await pg.click('[data-act="zoom"][data-z="0.5"]');
    const v1=await pg.evaluate(()=>[__rk.edit().v0,__rk.edit().v1]);assert(Math.abs((v1[1]-v1[0])-(v0[1]-v0[0])/4)<0.01,JSON.stringify([v0,v1]));
    const b=await pg.locator('#wave').boundingBox();await pg.mouse.move(b.x+b.width*0.8,b.y+50);await pg.mouse.down();await pg.mouse.move(b.x+b.width*0.2,b.y+50,{steps:5});await pg.mouse.up();
    const v2=await pg.evaluate(()=>__rk.edit().v0);assert(v2>v1[0]+0.1,v1[0]+' -> '+v2);
    await pg.click('[data-act="zoomAll"]');const v3=await pg.evaluate(()=>[__rk.edit().v0,__rk.edit().v1]);assert(v3[0]===0&&Math.abs(v3[1]-(v0[1]))<0.01);
    await fits(pg,'editori');
  });
  await ok('Valmis sulkee editorin, viimeisin otto näkyy Nauhoita-välilehdellä',async()=>{
    await pg.click('[data-act="edClose"]');assert(await pg.locator('#editor').isHidden());
    assert((await pg.textContent('#v-rec')).includes('Virveli'));
  });
  await ok('esilaskenta + viive: nollakohta ja siirto tallentuvat ottoon',async()=>{
    await pg.evaluate(()=>{__rk.D().viive=50;});
    await pg.click('[data-k="esilasku"]');await pg.selectOption('#newNote','36');
    await pg.click('#recBtn');await pg.waitForFunction(()=>__rk.job()==='rec');await pg.waitForTimeout(3200);
    await pg.click('#recBtn');await pg.waitForSelector('#editor:not([hidden])');
    const T=await pg.evaluate(()=>{const T=__rk.P().otot[1];return {ref:T.ref,alku:T.alku,viive:T.viive,nuotti:T.nuotti,s:T.s.portti};});
    // esilaskenta 4 × 0,5 s + 0,4 s: kaappaus alkoi noin 2,4 s ennen nollakohtaa
    assert.equal(T.ref,'lasku');assert.equal(T.viive,50);assert.equal(T.nuotti,36);assert(T.alku<-2.2&&T.alku>-2.8,'alku '+T.alku);
    assert((await pg.textContent('#eStats')).includes('ennen alkua'));
    await pg.click('[data-act="edClose"]');
  });
  await ok('biisi: lataus, nauhoitus pysähtyy biisin loppuun, otto merkitään biisin tahtiin',async()=>{
    await pg.setInputFiles('#songFile',SONG);await pg.waitForFunction(()=>__rk.song());
    assert.equal((await pg.evaluate(()=>__rk.song())).name,'biisi.wav');assert((await pg.textContent('#v-rec')).includes('biisi.wav'));
    assert.equal(await pg.locator('[data-k="esilasku"]').count(),0,'esilaskenta piiloon biisin kanssa');
    await pg.click('#recBtn');await pg.waitForFunction(()=>__rk.job()==='rec');
    await pg.waitForSelector('#editor:not([hidden])',{timeout:8000});
    const T=await pg.evaluate(()=>{const T=__rk.P().otot[2];return {ref:T.ref,alku:T.alku,len:__rk.envOf(T).length/T.hz};});
    assert.equal(T.ref,'biisi');assert(T.alku<-0.2&&T.alku>-0.7,'alku '+T.alku);assert(T.len>2.3&&T.len<3.6,'kesto '+T.len);
    assert.equal(await pg.evaluate(()=>__rk.P().biisi),'biisi.wav');
    await pg.click('[data-act="edClose"]');
  });
  await ok('Otot: lista, mukana-valinta, vienti lataa MIDI-tiedoston',async()=>{
    await pg.click('#tabs [data-tab="takes"]');assert.equal(await pg.locator('.take').count(),3);
    await fits(pg,'otot');
    const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-act="exportDl"]')]);
    assert.equal(dl.suggestedFilename(),'Projekti 1.mid');const f=path.join(OUT,'vienti.mid');await dl.saveAs(f);
    const m=readMidi(fs.readFileSync(f)),n=await pg.evaluate(()=>RK.exportNotes(__rk.P(),__rk.envOf).n);
    assert.equal(m.fmt,0);assert.equal(m.notes,n);assert(n>0);
    await pg.click('.take .tog');assert.equal(await pg.evaluate(()=>__rk.P().otot[0].mukana),false);
    const n2=await pg.evaluate(()=>RK.exportNotes(__rk.P(),__rk.envOf).n);assert(n2<n);
    assert.equal(await pg.textContent('.stat div b'),'2/3');
    await pg.click('[data-act="pset"][data-v="omat"]');await pg.click('[data-act="pset"][data-v="1/32"]');
    const [dl2]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-act="exportDl"]')]);await dl2.saveAs(f);
    const m2=readMidi(fs.readFileSync(f));assert.deepEqual([m2.fmt,m2.nt,m2.notes],[1,3,n2]);
  });
  await pg.screenshot({path:path.join(OUT,'390_otot.png'),fullPage:true});
  // ---------- vaihe 2 ----------
  await ok('esikuuntelu: Kuuntele soittaa mukana olevat otot biisin kanssa, aika etenee, Pysäytä',async()=>{
    await pg.click('[data-act="play"][data-scope="proj"]');await pg.waitForFunction(()=>__rk.play()&&__rk.play().pos>0.3,null,{timeout:4000});
    const st=await pg.evaluate(()=>__rk.play()),n=await pg.evaluate(()=>RK.playNotes(__rk.P(),__rk.envOf).length);
    assert.equal(st.n,n);assert.equal(st.take,null);assert.equal(st.song,true);assert(n>0);
    assert.equal(await pg.textContent('[data-act="play"]'),'■ Pysäytä');assert(/^\d:\d\d,\d \/ \d:\d\d,\d$/.test(await pg.textContent('#playTime')),await pg.textContent('#playTime'));
    await pg.click('[data-act="play"]');assert.equal(await pg.evaluate(()=>__rk.play()),null);assert.equal(await pg.textContent('[data-act="play"]'),'▶ Kuuntele');
  });
  await ok('esikuuntelu: Biisin kanssa pois -> vain rummut; soitto loppuu itsestään',async()=>{
    await pg.click('[data-act="playSong"]');assert.equal(await pg.getAttribute('[data-act="playSong"]','aria-pressed'),'false');
    await pg.click('[data-act="play"]');await pg.waitForFunction(()=>__rk.play());assert.equal((await pg.evaluate(()=>__rk.play())).song,false);
    const end=(await pg.evaluate(()=>__rk.play())).end;await pg.waitForFunction(()=>!__rk.play(),null,{timeout:(end+3)*1000});
    await pg.click('[data-act="playSong"]');
  });
  await ok('äänitiedosto: .wav tehdään ja ladataan, rummut kuuluvat',async()=>{
    await pg.click('[data-act="wav"]');await pg.waitForSelector('[data-act="wavDl"]',{timeout:15000});
    const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-act="wavDl"]')]);assert.equal(dl.suggestedFilename(),'Projekti 1 rytmi.wav');
    const f=path.join(OUT,'rytmi.wav');await dl.saveAs(f);const w=readWav(f),last=await pg.evaluate(()=>{const a=RK.playNotes(__rk.P(),__rk.envOf);return a[a.length-1].t;});
    assert.equal(w.riff,'RIFF');assert.equal(w.sr,44100);assert(Math.abs(w.sec-(last+2.5))<0.05,w.sec+' vs '+last);assert(w.max>2000,'hiljainen: '+w.max);
    await fits(pg,'otot + wav');
  });
  await ok('Äänet: projektin nuotit perusäänillä, ääni-ikkuna, säätö, tyypin vaihto, palautus',async()=>{
    await pg.click('#tabs [data-tab="snd"]');await fits(pg,'äänet');
    const rows=await pg.$$eval('#v-snd .card:first-child .list-row .open',b=>b.map(x=>x.textContent));
    assert.equal(rows.length,2,JSON.stringify(rows));assert(rows[0].startsWith('38')&&rows[0].includes('Virveli · perusääni'),rows[0]);assert(rows[1].includes('Bassari · perusääni'),rows[1]);
    await pg.click('[data-act="audition"][data-n="36"]');
    await pg.click('[data-act="sndEdit"][data-n="36"]');assert(await pg.isVisible('#sheet'));
    assert.equal(await pg.locator('[data-act="sndType"]').count(),8);assert.equal(await pg.getAttribute('[data-act="sndType"][aria-pressed="true"]','data-v'),'bassari');
    assert.equal(await pg.locator('#sheet input[type=range]').count(),6);assert(await pg.isHidden('#sndReset'));assert.equal(await pg.locator('#sheet .sl .help').count(),0,'oletusarvo ei saa näkyä ohjeena');
    await pg.$eval('[data-snd="savel"]',e=>{e.value='80';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));});
    assert.deepEqual(await pg.evaluate(()=>[__rk.D().aanet[36].tyyppi,__rk.D().aanet[36].p.savel]),['bassari',80]);assert.equal(await pg.textContent('#os-savel'),'80 Hz');assert(await pg.isVisible('#sndReset'));
    await pg.click('[data-act="sndType"][data-v="tomi"]');assert.deepEqual(await pg.evaluate(()=>Object.keys(__rk.D().aanet[36].p)),['savel','isku','kesto','voim']);
    assert.equal(await pg.locator('#sheet input[type=range]').count(),4);
    await pg.click('[data-act="sndReset"]');assert.equal(await pg.evaluate(()=>__rk.D().aanet[36]),undefined);
    await pg.click('[data-act="sndType"][data-v="hihat"]');await pg.click('#sheet [data-act="sheetClose"]');assert(await pg.isHidden('#shade'));
    assert((await pg.textContent('#v-snd')).includes('Hi-hat'));
  });
  await ok('Äänet: muun nuotin ääni näkyy omana listanaan',async()=>{
    await pg.selectOption('#sndOther','49');assert.equal(await pg.getAttribute('[data-act="sndType"][aria-pressed="true"]','data-v'),'pelti');
    await pg.click('[data-act="sndType"][data-v="kello"]');await pg.click('#shade',{position:{x:10,y:10}});assert(await pg.isHidden('#shade'));
    const t=await pg.textContent('#v-snd');assert(t.includes('Muut omat äänet')&&t.includes('49 · C#2 · Crash')&&t.includes('Kello'),t.slice(0,400));
  });
  await ok('jokainen äänityyppi tuottaa äänen, joka vaimenee keston jälkeen; hiljainen isku on hiljaisempi',async()=>{
    const r=await pg.evaluate(async()=>{const D=__rk.D(),out={};
      for(const k of RK.TYYPIT.filter(k=>k!=='sample')){D.aanet[60]=RK.repairSound({tyyppi:k},60);const kesto=D.aanet[60].p.kesto,sr=22050;
        const peak=async v=>{const b=await __rk.renderNotes([{t:0.05,n:60,v}],0.05+kesto/1000+0.4,sr),d=b.getChannelData(0),cut=Math.round((0.05+kesto/1000+0.15)*sr);let p=0,tail=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(i<cut){if(a>p)p=a;}else if(a>tail)tail=a;}return [p,tail];};
        const [p,tail]=await peak(127),[q]=await peak(30);out[k]=[Math.round(p*1000)/1000,Math.round(tail*10000)/10000,Math.round(q*1000)/1000];}
      delete D.aanet[60];return out;});
    console.log('     [huippu, hännän huippu, hiljaisen iskun huippu]: '+JSON.stringify(r));
    Object.keys(r).forEach(k=>{const [p,tail,q]=r[k];assert(p>0.03,k+' liian hiljaa '+p);assert(tail<0.01,k+' ei vaimene '+tail);assert(q<p*0.6,k+' velocity ei vaikuta '+q+'/'+p);});
  });
  await ok('sämple: lisäys nuotin ääni-ikkunasta, tallentuu selaimen tietokantaan ja säilyy uudelleenlatauksessa',async()=>{
    await pg.click('[data-act="sndEdit"][data-n="38"]');await pg.click('[data-act="sndType"][data-v="sample"]');
    assert((await pg.textContent('#sheet')).includes('Lisää sämple tiedostona'));
    const [fc]=await Promise.all([pg.waitForEvent('filechooser'),pg.click('[data-act="samplePick"][data-n="38"]')]);await fc.setFiles(SAMPLE);
    await pg.waitForFunction(()=>__rk.D().samplet.length===1&&__rk.D().aanet[38]&&__rk.D().aanet[38].sample===__rk.D().samplet[0].id,null,{timeout:5000});
    const sm=await pg.evaluate(()=>__rk.D().samplet[0]);assert.equal(sm.nimi,'sample.wav');assert(sm.kesto>0.25&&sm.kesto<0.35,JSON.stringify(sm));
    assert.equal(await pg.inputValue('#sndSample'),sm.id);assert(!(await pg.textContent('#sheet')).includes('puuttuu'));
    await pg.click('#sheet [data-act="sheetClose"]');assert((await pg.textContent('#v-snd')).includes('Sämple: sample.wav'));
    await pg.waitForTimeout(500);await pg.reload();await pg.waitForSelector('#recBtn');await pg.click('#tabs [data-tab="snd"]');
    assert.equal(await pg.evaluate(id=>__rk.sbuf(id),sm.id),false,'puskuri ei ole muistissa ennen soittoa');
    const pk=await pg.evaluate(async()=>{const b=await __rk.renderNotes([{t:0.02,n:38,v:127}],0.5,22050),d=b.getChannelData(0);let p=0;for(const x of d)p=Math.max(p,Math.abs(x));return p;});
    assert(pk>0.1,'sämple ei soi: '+pk);assert.equal(await pg.evaluate(id=>__rk.sbuf(id),sm.id),true);
    await pg.waitForFunction(()=>/sample\.wav[\s\S]*kt/.test(document.getElementById('v-snd').textContent),null,{timeout:3000});
    await fits(pg,'äänet + sämple');
  });
  await pg.screenshot({path:path.join(OUT,'390_aanet.png'),fullPage:true});
  await ok('sämple puuttuu tietokannasta: varoitus ja perusääni',async()=>{
    await pg.evaluate(()=>{const D=__rk.D();D.samplet.push({id:'eiole',nimi:'kadonnut.wav',kesto:1,koko:1000});D.aanet[39]={tyyppi:'sample',sample:'eiole',p:{savel:0,voim:80}};});
    await pg.click('#tabs [data-tab="takes"]');await pg.click('#tabs [data-tab="snd"]');await pg.waitForTimeout(300);
    const t=await pg.textContent('#v-snd');assert(t.includes('Ääni puuttuu tästä selaimesta'),t.slice(0,600));
    const pk=await pg.evaluate(async()=>{const b=await __rk.renderNotes([{t:0.02,n:39,v:127}],0.5,22050),d=b.getChannelData(0);let p=0;for(const x of d)p=Math.max(p,Math.abs(x));return p;});
    assert(pk>0.03,'perusääni ei soi: '+pk);
    await pg.evaluate(()=>{const D=__rk.D();D.samplet.pop();delete D.aanet[39];});
  });
  await ok('sämplen poisto palauttaa nuotin perusääneen',async()=>{
    await pg.click('#tabs [data-tab="takes"]');await pg.click('#tabs [data-tab="snd"]');
    await pg.click('[data-act="sampleDel"]');assert.deepEqual(await pg.evaluate(()=>[__rk.D().samplet.length,__rk.D().aanet[38]]),[0,undefined]);
    assert((await pg.textContent('#v-snd')).includes('Virveli · perusääni'));
  });
  await ok('editori: Kuuntele soittaa vain tämän oton, toistokohta näkyy, säätö muuttaa soittoa heti',async()=>{
    await pg.evaluate(()=>{const e=new Float32Array(375*6).fill(-70);for(let k=0;k<10;k++){const i=Math.round((0.3+k*0.5)*375);for(let j=0;j<15;j++)e[i+j]=(k%2?-20:-3)-j;}__rk.addTake(e,{nimi:'Soitto',nuotti:42});});
    await pg.click('#tabs [data-tab="takes"]');await pg.click('.take .open >> nth=3');await pg.waitForSelector('#editor:not([hidden])');
    assert.equal(await pg.textContent('#eSound'),'Hi-hat');
    await pg.click('#editor [data-act="play"]');await pg.waitForFunction(()=>__rk.play()&&__rk.play().pos>0.5);
    const st=await pg.evaluate(()=>__rk.play()),id=await pg.evaluate(()=>__rk.edit().id);assert.equal(st.take,id);assert.equal(st.n,10);
    await pg.waitForFunction(()=>!document.getElementById('phead').hidden);
    await pg.$eval('[data-s="portti"]',e=>{e.value='-8';e.dispatchEvent(new Event('input',{bubbles:true}));});
    await pg.waitForFunction(()=>__rk.play()&&__rk.play().n===5,null,{timeout:2000});
    await pg.click('[data-act="edDel"]');assert(await pg.locator('#editor').isHidden());assert.equal(await pg.evaluate(()=>__rk.play()),null);
    assert.equal(await pg.evaluate(()=>__rk.P().otot.length),3);
  });
  await ok('tiedot säilyvät uudelleenlatauksessa',async()=>{
    const a=await pg.evaluate(()=>JSON.stringify(__rk.D().projektit));await pg.waitForTimeout(500);await pg.reload();await pg.waitForSelector('#recBtn');
    assert.equal(await pg.evaluate(()=>JSON.stringify(__rk.D().projektit)),a);
  });
  await ok('projektit: uusi, vaihto, nimen muutos, poisto',async()=>{
    await pg.click('#projBtn');await pg.click('[data-act="projNew"]');assert.equal(await pg.textContent('#projBtn'),'Projekti 2 ▾');
    assert.equal(await pg.evaluate(()=>__rk.P().otot.length),0);
    await pg.click('#tabs [data-tab="takes"]');assert((await pg.textContent('#v-takes')).includes('Ei vielä ottoja'));
    await pg.fill('#pName','Biisi B');assert.equal(await pg.textContent('#projBtn'),'Biisi B ▾');
    await pg.click('[data-act="export"]');assert((await pg.textContent('#toast')).includes('Ei vietäviä nuotteja'));
    await pg.click('#projBtn');assert.equal(await pg.locator('.plist button').count(),2);await pg.click('.plist button >> nth=0');
    assert.equal(await pg.evaluate(()=>__rk.P().otot.length),3);
    await pg.click('#projBtn');await pg.click('.plist button >> nth=1');await pg.click('[data-act="projDel"]');
    assert.equal(await pg.evaluate(()=>__rk.D().projektit.length),1);
  });
  await ok('Asetukset: viive käsin, esiasetus näkyy ja poistuu, mikrofonin testi',async()=>{
    await pg.click('#tabs [data-tab="set"]');await fits(pg,'asetukset');
    await pg.fill('#viiveIn','140');await pg.press('#viiveIn','Tab');assert.equal(await pg.evaluate(()=>__rk.D().viive),140);
    await pg.fill('#viiveIn','');await pg.press('#viiveIn','Tab');assert.equal(await pg.evaluate(()=>__rk.D().viive),null);
    assert((await pg.textContent('#v-set')).includes('Olohuone'));
    await pg.click('[data-act="mic"]');await pg.waitForFunction(()=>/kanava/.test(document.getElementById('micInfo').textContent),null,{timeout:4000});
    const info=await pg.textContent('#micInfo'),set=await pg.textContent('#micSet');
    assert(/mono|stereo/.test(info),info);assert(set.includes('Kaiunpoisto pois')&&set.includes('automaattinen taso pois'),set);
    console.log('     mikrofonin testi: '+info+' | '+set);
    await pg.click('[data-act="micStop"]');assert.equal(await pg.evaluate(()=>__rk.job()),null);
    await pg.click('[data-act="presetDel"]');assert.equal(await pg.evaluate(()=>__rk.D().esi.length),0);
  });
  await ok('viivekalibrointi valmistuu ja näyttää tuloksen',async()=>{
    await pg.click('[data-act="cal"]');assert(await pg.isVisible('#calInfo'));
    await pg.waitForFunction(()=>!__rk.job(),null,{timeout:12000});
    const t=await pg.textContent('#v-set');assert(/Mitattu viive|Taputuksia löytyi/.test(t),t.slice(0,300));
    console.log('     kalibroinnin tulos valemikillä: '+(t.match(/Mitattu viive[^.]*|Taputuksia löytyi[^.]*/)||[''])[0]);
  });
  await ok('ulkoasu: kymmenen teemaa, tumma tila tallentuu',async()=>{
    assert.equal(await pg.locator('[data-ap-theme]').count(),10);
    await pg.click('[data-ap-theme="lake"]');await pg.click('[data-ap-mode="dark"]');
    assert.deepEqual(await pg.evaluate(()=>[localStorage.getItem('rytmikone:appearance'),document.documentElement.style.getPropertyValue('--bg')]),['{"theme":"lake","mode":"dark"}','#151B22']);
    await pg.click('[data-ap-theme="forest"]');await pg.click('[data-ap-mode="light"]');
  });
  await ok('varmuuskopio: teksti ulos ja takaisin, tiedosto ulos ja sisään',async()=>{
    await pg.click('[data-act="textOut"]');const txt=await pg.inputValue('#txt');assert(JSON.parse(txt).app==='rytmikone');
    await pg.evaluate(()=>{__rk.P().otot=[];});
    await pg.click('[data-act="textIn"]');await pg.fill('#txt',txt);await pg.click('[data-act="textImport"]');
    assert.equal(await pg.evaluate(()=>__rk.P().otot.length),3);
    await pg.click('[data-act="textIn"]');await pg.fill('#txt','{"app":"muu"}');await pg.click('[data-act="textImport"]');assert((await pg.textContent('#toast')).includes('ei ole Rytmikoneen'));
    const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-act="backup"]')]);const f=path.join(OUT,'varmuus.json');await dl.saveAs(f);
    assert(/^rytmikone-varmuuskopio-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()));
    await pg.evaluate(()=>{__rk.P().otot=[];});await pg.setInputFiles('#importFile',f);await pg.waitForFunction(()=>__rk.P().otot.length===3);
  });
  await ok('rikkinäinen tallennus ei kaada appia',async()=>{
    await pg.evaluate(()=>localStorage.setItem('rytmikone:v1','{rikki'));await pg.reload();await pg.waitForSelector('#recBtn');
    assert.equal(await pg.evaluate(()=>localStorage.getItem('rytmikone:v1:rikki')),'{rikki');assert.equal(await pg.evaluate(()=>__rk.D().projektit.length),1);
  });
  await ok('ei JavaScript-virheitä (390 px)',async()=>{assert.deepEqual(errs,[]);});
  await ctx.close();

  // ---------- 320 px, tumma, testitiedolla ----------
  const c2=await browser.newContext({viewport:{width:320,height:568},deviceScaleFactor:2,hasTouch:true,isMobile:true,colorScheme:'dark'});
  await c2.grantPermissions(['microphone']);
  const p2=await c2.newPage(),e2=[];p2.on('pageerror',e=>e2.push(e.message));
  await p2.goto(URL);await p2.waitForSelector('#recBtn');
  await p2.evaluate(()=>{const e=new Float32Array(375*30).fill(-70);for(let k=0;k<60;k++){const i=Math.round((0.25+k*0.48)*375);for(let j=0;j<20;j++)e[i+j]=-4-(k%7)*4-j;}
    __rk.addTake(e,{nimi:'Pitkä nimi joka ei saa rikkoa asettelua kapealla ruudulla'});__rk.addTake(e,{nuotti:42});});
  for(const tab of ['rec','takes','snd','set']){
    await ok('320 px tumma: '+tab+' mahtuu leveyteen',async()=>{await p2.click('#tabs [data-tab="'+tab+'"]');await fits(p2,tab);});
    await p2.screenshot({path:path.join(OUT,'320_'+tab+'.png'),fullPage:true});
  }
  await ok('320 px: editori mahtuu, 60 iskua, kuvaaja piirtyy',async()=>{
    await p2.click('#tabs [data-tab="takes"]');await p2.click('.take .open >> nth=0');await p2.waitForSelector('#editor:not([hidden])');
    await fits(p2,'editori');assert.equal(await p2.textContent('#eStats div b'),'60');
    const painted=await p2.evaluate(()=>{const c=document.getElementById('wave'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;});assert(painted>1000,painted);
    const tb=await p2.locator('[data-act="edClose"]').boundingBox();assert(tb.height>=44);
  });
  await p2.screenshot({path:path.join(OUT,'320_editori.png')});
  await ok('320 px: välilehdet ja ääni-ikkuna mahtuvat',async()=>{
    await p2.click('[data-act="edClose"]');await p2.click('#tabs [data-tab="snd"]');
    const tabs=await p2.$$eval('#tabs button',b=>b.map(x=>x.scrollWidth<=x.clientWidth+1));assert(tabs.every(Boolean),JSON.stringify(tabs));
    await p2.click('[data-act="sndEdit"][data-n="36"]');await fits(p2,'ääni-ikkuna');
    const sw=await p2.evaluate(()=>{const s=document.getElementById('sheet');return s.scrollWidth-s.clientWidth;});assert(sw<=0,'paneeli '+sw);
  });
  await p2.screenshot({path:path.join(OUT,'320_aani.png')});
  await ok('ei JavaScript-virheitä (320 px)',async()=>{assert.deepEqual(e2,[]);});
  await browser.close();server.close();
  console.log('\n'+checks+' ok, '+fails+' virhettä');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
