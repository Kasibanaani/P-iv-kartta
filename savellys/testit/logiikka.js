// Moottorin testit nodella: rakenne ja korjaus, työkalut, soittojärjestys, MIDI-vienti ja -luku.
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const src=/<script id="engine">([\s\S]*?)<\/script>/.exec(html)[1];
const box={module:{},TextEncoder,TextDecoder,Math,Date,JSON};vm.createContext(box);vm.runInContext(src,box);const SV=box.module.exports;
let n=0,fails=0;
function ok(name,fn){try{fn();n++;console.log('ok   '+name);}catch(e){fails++;console.log('FAIL '+name+'\n     '+String(e&&e.stack||e).split('\n').slice(0,3).join('\n     '));}}
const eq=(a,b,m)=>assert.deepStrictEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);

ok('uusi projekti: yksi tyhjä raita, ei valmista sisältöä',()=>{const p=SV.newProject('X');assert.equal(p.raidat.length,1);assert.equal(p.raidat[0].nuotit.length,0);assert.equal(p.tempo,100);eq(p.tahti,[4,4]);});
ok('korjaus: roska ei kaada, puuttuvat kentät täytetään',()=>{
  [null,1,'x',[],{raidat:'x'},{raidat:[null,{},{nuotit:[null,{s:'a'},{s:200,a:-5},{s:60,a:10,k:0,v:300}]}]}].forEach(x=>{const p=SV.repair(x);assert(Array.isArray(p.raidat));assert(p.tempo>=20);});
  const p=SV.repair({raidat:[{aani:'outo',nuotit:[{s:60,a:10,k:0,v:300},{s:200,a:-5}]}]});
  assert.equal(p.raidat[0].aani,'pluck');eq(p.raidat[0].nuotit,[{s:60,a:10,k:1,v:127},{s:127,a:0,k:480,v:100}].sort((a,b)=>a.a-b.a));
});
ok('korjaus: sama raidan tunniste kahdesti saa uuden',()=>{const p=SV.repair({raidat:[{id:'a'},{id:'a'}]});assert.notEqual(p.raidat[0].id,p.raidat[1].id);});
ok('korjaus säilyttää kelvollisen projektin ennallaan',()=>{const a=SV.newProject('A');a.raidat[0].nuotit=[{s:60,a:0,k:240,v:90}];a.silmukka={on:true,a:2,b:6};a.tahti=[6,8];a.savel={juuri:9,asteikko:'doori'};eq(SV.repair(JSON.parse(JSON.stringify(a))),a);});
ok('tahdin pituus ja paikka tekstinä',()=>{const p=SV.newProject();assert.equal(SV.barTicks(p),1920);p.tahti=[6,8];assert.equal(SV.barTicks(p),1440);assert.equal(SV.beatTicks(p),240);assert.equal(SV.posText(p,1440+480),'2.3');});
ok('nuottien nimet ja asteikko',()=>{assert.equal(SV.noteName(60),'C4');assert.equal(SV.noteName(70),'B4');assert.equal(SV.noteName(71),'H4');
  const p=SV.newProject();p.savel={juuri:9,asteikko:'molli'};assert(SV.inScale(p,72));assert(!SV.inScale(p,73));eq(SV.scaleOf(p),[9,11,0,2,4,5,7]);});
ok('transponointi pysyy rajoissa',()=>{const a=[{s:5,a:0,k:1,v:1},{s:125,a:0,k:1,v:1}];SV.transpose(a,-12);assert.equal(a[0].s,0);SV.transpose(a,24);assert.equal(a[1].s,127);});
ok('asteikon askel: C-duurissa E → G kahdella askeleella, F♯ → G yhdellä',()=>{const p=SV.newProject();p.savel={juuri:0,asteikko:'duuri'};const a=[{s:64},{s:66}];SV.scaleStep(p,[a[0]],2);SV.scaleStep(p,[a[1]],1);assert.equal(a[0].s,67);assert.equal(a[1].s,67);
  const b=[{s:67}];SV.scaleStep(p,b,-3);assert.equal(b[0].s,62);});
ok('kvantisointi: alku ja loppu ruudukkoon, ei nollapituutta',()=>{const a=[{s:60,a:130,k:20,v:1},{s:60,a:350,k:200,v:1}];SV.quantize(a,120);eq(a.map(x=>[x.a,x.k]),[[120,120],[360,240]]);});
ok('päällekkäiset samat sävelet lyhenevät, samassa kohdassa pidempi jää',()=>{const r=SV.fixOverlaps([{s:60,a:0,k:960,v:1},{s:60,a:480,k:480,v:2},{s:60,a:480,k:100,v:3},{s:62,a:0,k:960,v:1}]);
  eq(r.map(x=>[x.s,x.a,x.k]),[[60,0,480],[62,0,960],[60,480,480]]);});
ok('soittojärjestys: väli, mykistys ja soolo',()=>{const p=SV.newProject();const a=SV.newTrack('pluck'),b=SV.newTrack('basso');p.raidat=[a,b];
  a.nuotit=[{s:60,a:0,k:1,v:1},{s:62,a:480,k:1,v:1}];b.nuotit=[{s:36,a:240,k:1,v:1}];
  eq(SV.schedule(p,0,481).map(e=>e.n.s),[60,36,62]);eq(SV.schedule(p,1,480).map(e=>e.n.s),[36]);
  b.mute=true;eq(SV.schedule(p,0,1000).map(e=>e.n.s),[60,62]);b.mute=false;b.solo=true;eq(SV.schedule(p,0,1000).map(e=>e.n.s),[36]);});
ok('kanavat: rummut 10, muut järjestyksessä ohi kanavan 10',()=>{const p=SV.newProject();p.raidat=[];for(let i=0;i<12;i++)p.raidat.push(SV.newTrack(i===3?'rummut':'pluck'));
  const c=SV.channels(p);eq(p.raidat.map(t=>c[t.id]),[0,1,2,9,3,4,5,6,7,8,10,11]);});
function sample(){const p=SV.newProject('Testi');p.tempo=90;p.tahti=[3,4];p.savel={juuri:9,asteikko:'molli'};
  const m=SV.newTrack('matto','Matto'),l=SV.newTrack('lead','Melodia'),d=SV.newTrack('rummut','Rytmi');p.raidat=[m,l,d];
  m.nuotit=[{s:57,a:0,k:1440,v:80},{s:60,a:0,k:1440,v:80},{s:64,a:0,k:1440,v:80}];l.nuotit=[{s:69,a:0,k:240,v:100},{s:72,a:240,k:240,v:110},{s:71,a:480,k:960,v:90}];
  d.nuotit=[{s:36,a:0,k:120,v:120},{s:42,a:240,k:60,v:70},{s:38,a:480,k:120,v:100}];return p;}
ok('MIDI-vienti: tyyppi 1, otsikko ja raitamäärä',()=>{const b=SV.midi(sample());assert.equal(String.fromCharCode(b[0],b[1],b[2],b[3]),'MThd');assert.equal(b[9],1);assert.equal(b[11],4);assert.equal(b[12]<<8|b[13],480);});
ok('MIDI: viety ja luettu takaisin on sama (nuotit, tempo, tahtilaji, nimet, rummut kanavalla 10)',()=>{const p=sample(),x=SV.readMidi(SV.midi(p));
  assert(!x.virhe,x.virhe);assert(Math.abs(x.tempo-90)<0.01);eq(x.tahti,[3,4]);assert.equal(x.raidat.length,3);
  eq(x.raidat.map(r=>r.nimi),['Matto','Melodia','Rytmi']);assert.equal(x.raidat[2].kanava,9);
  x.raidat.forEach((r,i)=>eq(r.nuotit,p.raidat[i].nuotit.slice().sort((a,b)=>a.a-b.a||a.s-b.s)));
  const q=SV.fromMidi(x,'Takaisin');eq(q.raidat.map(t=>t.aani),['matto','lead','rummut']);assert.equal(q.tahteja,1);});
ok('MIDI: yhden raidan vienti',()=>{const p=sample(),x=SV.readMidi(SV.midi(p,[p.raidat[1].id]));assert.equal(x.raidat.length,1);assert.equal(x.raidat[0].nimi,'Melodia');assert.equal(x.raidat[0].nuotit.length,3);});
ok('MIDI: tyhjä raita ei kaada, ääkköset nimessä säilyvät',()=>{const p=SV.newProject('Hämärä');p.raidat[0].nimi='Äänimatto';const b=SV.midi(p);assert(b.length>40);const x=SV.readMidi(b);assert(x.virhe);
  p.raidat[0].nuotit=[{s:60,a:0,k:10,v:1}];assert.equal(SV.readMidi(SV.midi(p)).raidat[0].nimi,'Äänimatto');});
ok('MIDI-luku: muu kuin MIDI ja rikkinäinen tiedosto antavat virheen',()=>{assert(SV.readMidi(new Uint8Array([1,2,3])).virhe);const b=SV.midi(sample());const cut=SV.readMidi(b.slice(0,60));assert(cut.virhe||cut.raidat);});
ok('MIDI-luku: tyyppi 0, juokseva status, nuotti päälle nollavoimalla = pois, eri PPQ skaalautuu',()=>{
  const ev=[0x00,0x90,60,100, 0x60,60,0, 0x00,0x91,64,90, 0x60,0x81,64,0, 0x00,0xFF,0x2F,0];
  const trk=[0x4D,0x54,0x72,0x6B,0,0,0,ev.length].concat(ev),hd=[0x4D,0x54,0x68,0x64,0,0,0,6,0,0,0,1,0,96];
  const x=SV.readMidi(new Uint8Array(hd.concat(trk)));assert(!x.virhe,x.virhe);assert.equal(x.raidat.length,2);
  eq(x.raidat[0].nuotit,[{s:60,a:0,k:480,v:100}]);eq(x.raidat[1].nuotit,[{s:64,a:480,k:480,v:90}]);});
ok('arvaa ääni: GM-soitin ja sävelkorkeus',()=>{assert.equal(SV.guessSound({kanava:0,ohjelma:89,nuotit:[]}),'matto');assert.equal(SV.guessSound({kanava:0,ohjelma:null,nuotit:[{s:30},{s:40}]}),'basso');assert.equal(SV.guessSound({kanava:9,nuotit:[]}),'rummut');});
ok('vlq',()=>{eq(SV.vlq(0),[0]);eq(SV.vlq(127),[127]);eq(SV.vlq(128),[0x81,0]);eq(SV.vlq(0x0FFFFFFF),[0xFF,0xFF,0xFF,0x7F]);});
console.log((fails?'VIRHEITÄ ':'')+n+'/'+(n+fails)+' ok');process.exit(fails?1:0);
