// Moottorin testit: tunnistus, velocity, verhokäyrän pakkaus, kalibroinnit, MIDI-tiedosto ja tallennusmuodon korjaus.
// Moottori luetaan suoraan index.html:n lohkosta <script id="engine">.
'use strict';
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const src=html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const mod={exports:{}};new Function('module',src)(mod);const RK=mod.exports;
let ok=true;
function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function check(label,cond,extra){if(!cond)ok=false;console.log((cond?'ok  ':'FAIL')+' '+label+(extra!==undefined?'  '+extra:''));}

// Synteettinen verhokäyrä: hiljaisuus -70 dB, iskut [aika s, huippu dB], vaimeneminen 1 dB/ms.
const HZ=375;
function env(dur,hits,floor,hz){hz=hz||HZ;const n=Math.round(dur*hz),e=new Float32Array(n).fill(floor===undefined?-70:floor);
  hits.forEach(([t,pk])=>{const i0=Math.round(t*hz);for(let i=i0;i<n;i++){const v=pk-(i-i0)/hz*1000*0.25;if(v<=e[i])break;e[i]=v;}});return e;}

// ---------- tunnistus ----------
const S={portti:-36,hiljaisin:-36,kovin:-6,kayra:'tasainen',esto:60,hyst:6,ikkuna:20};
let e=env(4,[[0.5,-6],[1,-20],[1.5,-30],[2,-40],[2.5,-10]]);
let h=RK.detect(e,HZ,S);
eq('neljä portin ylittävää iskua löytyy, portin alle jäävä ei',h.map(x=>Math.round(x.i/HZ*100)/100),[0.5,1,1.5,2.5]);
eq('huippu mitataan iskun alusta',h.map(x=>Math.round(x.peak)),[-6,-20,-30,-10]);
eq('velocity: kovin = 127, portin taso = 1',h.map(x=>RK.velocity(x.peak,S)),[127,68,26,110]);
// esto: kaksi iskua 40 ms välein -> yksi; 80 ms välein -> kaksi
e=env(1,[[0.2,-10],[0.24,-10]]);
// toinen isku nousee vaimenevan päälle: ilman laskua portin alle se ei voi laukaista (hystereesi)
eq('kaksi iskua 40 ms välein ilman väliin jäävää hiljaisuutta = yksi isku',RK.detect(e,HZ,S).length,1);
e=new Float32Array(Math.round(HZ)).fill(-70);
[[0.2,-10],[0.24,-10],[0.4,-10]].forEach(([t,pk])=>{const i=Math.round(t*HZ);for(let k=0;k<4;k++)e[i+k]=pk;});
eq('lyhyet iskut 40 ms välein: esto 60 ms poistaa toisen',RK.detect(e,HZ,S).map(x=>Math.round(x.i/HZ*100)/100),[0.2,0.4]);
eq('esto 0 ms: kaikki kolme',RK.detect(e,HZ,Object.assign({},S,{esto:0})).length,3);
eq('esto 300 ms: vain ensimmäinen',RK.detect(e,HZ,Object.assign({},S,{esto:300})).length,1);
// eston aikana noussut ääni ei laukaise eston päätyttyä
e=new Float32Array(Math.round(HZ)).fill(-70);for(let i=Math.round(0.2*HZ);i<Math.round(0.21*HZ);i++)e[i]=-10;for(let i=Math.round(0.23*HZ);i<Math.round(0.4*HZ);i++)e[i]=-12;
eq('eston aikana alkanut pitkä ääni ei tee iskua eston päätyttyä',RK.detect(e,HZ,S).length,1);
// hystereesi: taso heiluu portin ympärillä
e=new Float32Array(200).fill(-70);for(let i=10;i<190;i++)e[i]=(i%10<5)?-34:-38;
eq('portin ympärillä heiluva taso: hystereesi 6 dB -> yksi isku',RK.detect(e,HZ,Object.assign({},S,{esto:0})).length,1);
eq('hystereesi 0 dB -> monta',RK.detect(e,HZ,Object.assign({},S,{esto:0,hyst:0})).length>5,true);
// mittausikkuna: huippu tulee myöhemmin kuin ylitys
e=new Float32Array(100).fill(-70);e[10]=-30;e[11]=-20;e[12]=-8;e[13]=-9;for(let i=14;i<40;i++)e[i]=-50;
eq('mittausikkuna 20 ms näkee 2 lohkoa myöhemmän huipun',Math.round(RK.detect(e,HZ,S)[0].peak),-8);
eq('mittausikkuna 1 ms näkee vain ylityksen',Math.round(RK.detect(e,HZ,Object.assign({},S,{ikkuna:1}))[0].peak),-30);
eq('kohinaportti -25 dB: hiljaiset jäävät pois',RK.detect(env(4,[[0.5,-6],[1,-20],[1.5,-30]]),HZ,Object.assign({},S,{portti:-25})).length,2);

// ---------- velocity ----------
eq('velocity ei mene alle 1 eikä yli 127',[RK.velocity(-90,S),RK.velocity(0,S)],[1,127]);
const mid={...S,hiljaisin:-40,kovin:0};
eq('käyrät: korosta hiljaisia > tasainen > korosta kovia keskellä',[RK.velocity(-20,{...mid,kayra:'hiljaiset'}),RK.velocity(-20,mid),RK.velocity(-20,{...mid,kayra:'kovat'})],[84,64,40]);
eq('fitRange: alue kattaa iskut',RK.fitRange([{peak:-31.2},{peak:-8.3},{peak:-15}]),{hiljaisin:-31.5,kovin:-8});
eq('fitRange: yksi isku ei riitä',RK.fitRange([{peak:-10}]),null);

// ---------- säätöjen korjaus ----------
eq('puuttuvat säädöt -> oletukset',RK.settings({}),{portti:-36,hiljaisin:-36,kovin:-6,kayra:'tasainen',esto:60,hyst:6,ikkuna:20});
eq('virheelliset arvot rajataan ja kovin pysyy hiljaisinta suurempana',RK.settings({portti:'x',hiljaisin:-5,kovin:-20,kayra:'outo',esto:-3,hyst:99,ikkuna:0}),{portti:-36,hiljaisin:-5,kovin:-4,kayra:'tasainen',esto:0,hyst:40,ikkuna:1});

// ---------- pakkaus ----------
const raw=Float32Array.from([-96,-70.2,-36,-0.4,0,-120,5]);
eq('verhokäyrän pakkaus säilyttää 0,5 dB tarkkuudella',Array.from(RK.decEnv(RK.encEnv(raw))),[-96,-70,-36,-0.5,0,-96,5]);
check('pitkä otto pakkautuu (3 min = 1 tavu/lohko)',RK.encEnv(new Float32Array(180*HZ)).length<=Math.ceil(180*HZ/3)*4);
eq('rikkinäinen base64 -> tyhjä',RK.decEnv('***').length,0);
eq('desibelit',[RK.db(1),RK.db(0.5).toFixed(2),RK.db(0),RK.db(1e-9)],[0,'-6.02',-96,-96]);
eq('nuottien nimet (Logic: C3 = 60)',[RK.noteName(36),RK.noteName(60),RK.noteLabel(38),RK.noteLabel(100)],['C1','C3','38 · D1 · Virveli','100 · E6']);

// ---------- oton iskut ajassa ----------
const T=RK.newTake({hz:HZ,alku:-0.5,viive:100,s:S,env:RK.encEnv(env(3,[[0.4,-10],[1.6,-10]]))});
const th=RK.takeHits(T);
eq('iskun aika = alku + paikka - viive (ennen alkua negatiivinen)',th.map(x=>Math.round(x.t*1000)),[-200,1000]);

// ---------- kalibroinnit ----------
const clicks=[0,1,2,3,4,5,6,7].map(k=>10+k*0.667);
let r=RK.calibrate(clicks.map((c,k)=>c+0.18+(k%2?0.01:-0.01)),clicks);
eq('viivekalibrointi: mediaani 180 ms, 8/8',[r.ok,r.ms,r.n,r.hajonta],[true,180,8,10]);
r=RK.calibrate([clicks[0]+0.2,clicks[1]+0.2,clicks[2]+0.2],clicks);
eq('viivekalibrointi: liian vähän taputuksia',[r.ok,r.n],[false,3]);
r=RK.calibrate([8,9,clicks[0]+0.1,clicks[1]+0.1,clicks[2]+0.1,clicks[3]+0.1,clicks[3]+0.15,30],clicks);
eq('viivekalibrointi: ylimääräiset iskut eivät sotke, yksi isku käytetään kerran',[r.ok,r.ms,r.n],[true,100,4]);
const ng=RK.noiseGate(env(2,[],-55));
eq('hiljaisuuden kalibrointi: kohina -55 dB -> portti -47 dB',ng,{kohina:-55,portti:-47});
eq('hiljaisuuden kalibrointi: tyhjä -> null',RK.noiseGate(new Float32Array(0)),null);

// ---------- MIDI ----------
function readMidi(u){
  const b=Buffer.from(u);let o=0;const s=n=>{const x=b.toString('latin1',o,o+n);o+=n;return x;},u32=()=>{const x=b.readUInt32BE(o);o+=4;return x;},u16=()=>{const x=b.readUInt16BE(o);o+=2;return x;};
  if(s(4)!=='MThd')throw Error('MThd');u32();const fmt=u16(),nt=u16(),div=u16(),tracks=[];
  for(let t=0;t<nt;t++){if(s(4)!=='MTrk')throw Error('MTrk');const len=u32(),end=o+len;let tick=0,run=0;const ev=[];
    const vl=()=>{let v=0,c;do{c=b[o++];v=v*128+(c&127);}while(c&128);return v;};
    while(o<end){tick+=vl();let st=b[o];if(st&128)o++;else st=run;
      if(st===0xFF){const ty=b[o++],l=vl();ev.push({tick,meta:ty,data:[...b.slice(o,o+l)]});o+=l;}
      else{run=st;const d1=b[o++],d2=b[o++];ev.push({tick,st,d1,d2});}}
    tracks.push(ev);}
  return {fmt,nt,div,tracks};
}
function proj(o){const p=RK.newProject('Testi');Object.assign(p,o||{});return p;}
// MIDI-testeissä 400 lohkoa/s, jotta ajat osuvat tasan lohkoihin (oikeasti 48000/128 = 375)
const tk=(times,note,o)=>Object.assign(RK.newTake({hz:400,alku:0,viive:0,s:S,env:RK.encEnv(env(4,times.map(t=>[t,-6]),-70,400))}),{nuotti:note},o||{});
let p=proj({tempo:120,otot:[tk([0.5,1,1.5],36),tk([1,2],38)]});
let m=readMidi(RK.midi(p));
let on=m.tracks[0].filter(x=>x.st===0x99),off=m.tracks[0].filter(x=>x.st===0x89);
eq('MIDI: formaatti 0, yksi raita, 480 tikkiä/neljännes',[m.fmt,m.nt,m.div],[0,1,480]);
eq('MIDI: tempo 120 BPM = 500000 µs',m.tracks[0].find(x=>x.meta===0x51).data,[7,161,32]);
eq('MIDI: tahtilaji 4/4',m.tracks[0].find(x=>x.meta===0x58).data.slice(0,2),[4,2]);
eq('MIDI: projektin nimi raidan nimenä',Buffer.from(m.tracks[0].find(x=>x.meta===0x03).data).toString(),'Testi');
eq('MIDI: nuotit oikeilla tikeillä (0,5 s = 480) ja kanavalla 10',on.map(x=>[x.tick,x.d1]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),[[480,36],[960,36],[960,38],[1440,36],[1920,38]]);
eq('MIDI: velocity 127 kovimmasta',on.map(x=>x.d2),[127,127,127,127,127]);
eq('MIDI: 1/16-nuotti = 120 tikkiä',off.map(x=>x.tick).sort((a,b)=>a-b),[600,1080,1080,1560,2040]);
eq('MIDI: raita päättyy End of Track -merkintään',m.tracks[0][m.tracks[0].length-1].meta,0x2F);
p.tempo=90;p.pituus='1/8';m=readMidi(RK.midi(p));on=m.tracks[0].filter(x=>x.st===0x99);
eq('MIDI: tempo 90 -> 0,5 s = 360 tikkiä, 1/8 = 240',[on[0].tick,m.tracks[0].filter(x=>x.st===0x89)[0].tick-on[0].tick],[360,240]);
p=proj({raidat:'omat',otot:[tk([0.5],36,{nimi:'Bassari'}),tk([1],38,{nimi:'Virveli'}),tk([1.5],42,{nimi:'Pois',mukana:false})]});
m=readMidi(RK.midi(p));
eq('MIDI: oma raita per otto -> formaatti 1, tempo-raita + 2 mukana olevaa',[m.fmt,m.nt],[1,3]);
eq('MIDI: raitojen nimet ottojen nimistä',m.tracks.slice(1).map(t=>Buffer.from(t.find(x=>x.meta===0x03).data).toString()),['Bassari','Virveli']);
eq('MIDI: tempo-raidalla ei nuotteja',m.tracks[0].filter(x=>x.st).length,0);
// päällekkäiset ja samat iskut
p=proj({pituus:'1/8',otot:[tk([0.5,0.7],36),tk([0.5],36,{s:{...S,kovin:0}})]});
m=readMidi(RK.midi(p));on=m.tracks[0].filter(x=>x.st===0x99);off=m.tracks[0].filter(x=>x.st===0x89);
eq('MIDI: sama sävel samalla tikillä -> yksi nuotti, kovempi velocity jää',on.map(x=>[x.tick,x.d2]),[[480,127],[672,127]]);
eq('MIDI: nuotti päättyy saman sävelen seuraavaan iskuun (off ennen on samalla tikillä)',m.tracks[0].filter(x=>x.st).map(x=>[x.tick,x.st]),[[480,0x99],[672,0x89],[672,0x99],[912,0x89]]);
// ennen alkua
p=proj({otot:[Object.assign(tk([0.2,0.5,1.5],36),{alku:-1})]});
const st=RK.exportNotes(p);
eq('ennen alkua tulleet iskut jäävät pois ja lasketaan',[st.n,st.pois],[1,2]);
eq('pitkä delta-aika (vlq)',RK.vlq(0x0FFFFFFF),[0xFF,0xFF,0xFF,0x7F]);
eq('vlq 0 ja 128',[RK.vlq(0),RK.vlq(128)],[[0],[0x81,0]]);

// ---------- tallennusmuoto ----------
const nd=RK.newData();
eq('uusi tieto: yksi projekti, ei viivettä, oletusnuotti 36',[nd.app,nd.ver,nd.projektit.length,nd.viive,nd.uusiNuotti,nd.cur===nd.projektit[0].id],['rytmikone',1,1,null,36,true]);
eq('repair: roska -> uusi tieto',[RK.repair(null).projektit.length,RK.repair([1,2]).projektit.length,RK.repair('x').app],[1,1,'rytmikone']);
const bad={app:'rytmikone',ver:1,cur:'zz',viive:'150',esi:[{nimi:'Koti',s:{portti:-40}},null],projektit:[{id:'a',nimi:'',tempo:'abc',pituus:'1/3',raidat:'x',otot:[{id:'t',env:'<<',nuotti:300,s:{esto:-5}},{id:'t',mukana:false}]},{id:'a'}]};
const fx=RK.repair(bad);
eq('repair: puuttuvat ja väärät kentät korjataan',[fx.cur,fx.viive,fx.esi.length,fx.esi[0].s.portti,fx.projektit[0].nimi,fx.projektit[0].tempo,fx.projektit[0].pituus,fx.projektit[0].raidat],['a',150,1,-40,'Projekti 1',120,'1/16','yksi']);
eq('repair: otot korjataan, rikkinäinen env tyhjäksi, tunnisteet uniikeiksi',[fx.projektit[0].otot[0].env,fx.projektit[0].otot[0].nuotti,fx.projektit[0].otot[0].s.esto,fx.projektit[0].otot[1].mukana,fx.projektit[0].otot[0].id!==fx.projektit[0].otot[1].id,fx.projektit[0].id!==fx.projektit[1].id],['',127,0,false,true,true]);
const round=RK.repair(JSON.parse(JSON.stringify(Object.assign(RK.newData(),{viive:120}))));
eq('repair: kelvollinen tieto säilyy ennallaan',round.viive,120);
const pd=RK.newData();pd.projektit[0].otot.push(tk([0.5],36));const back=RK.repair(JSON.parse(JSON.stringify(pd)));
eq('tallennus ja luku: iskut ja nuotit säilyvät',RK.exportNotes(back.projektit[0]).n,1);

console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');process.exit(ok?0:1);
