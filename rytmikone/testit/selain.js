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
    assert.deepEqual(await pg.$$eval('#tabs button',b=>b.map(x=>x.textContent)),['Nauhoita','Otot','Asetukset']);
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
  for(const tab of ['rec','takes','set']){
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
  await ok('ei JavaScript-virheitä (320 px)',async()=>{assert.deepEqual(e2,[]);});
  await browser.close();server.close();
  console.log('\n'+checks+' ok, '+fails+' virhettä');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
