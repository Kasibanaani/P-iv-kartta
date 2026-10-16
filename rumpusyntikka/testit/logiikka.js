// Äänimoottorin testit Nodella: moottori luetaan index.html:n lohkosta <script id="engine">.
// Testit mittaavat ääntä numeroina (taso, taajuus, kesto). Ne eivät kerro, miltä ääni kuulostaa.
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const code=/<script id="engine">([\s\S]*?)<\/script>/.exec(html)[1];
const RS=new Function(code+';return RS;')();
const SR=48000;
let n=0,fails=0;
function ok(name,fn){try{fn();n++;console.log('ok   '+name);}catch(e){fails++;console.log('FAIL '+name+'\n     '+String(e&&e.message||e).split('\n')[0]);}}
function patch(p,extra){const d=RS.defaults();Object.assign(d.p,p||{});return Object.assign(d,extra||{});}
// Ajaa moottoria sekunteja; f(e, i) kutsutaan ennen jokaista 64 näytteen lohkoa. Palauttaa äänen ja halutut lähdöt.
function run(pt,sec,f,taps){
  const e=RS.create(SR);e.loadNow(pt);const N=Math.round(sec*SR),out=new Float32Array(N),tp={};(taps||[]).forEach(k=>tp[k]=new Float32Array(N));
  const OI={vca:0,vcaEg:1,vcfEg:2,vcoEg:3,vco1:4,vco2:5,trigO:6,velO:7,pitchO:8};
  for(let i=0;i<N;i+=1){if(i%64===0&&f)f(e,i);e.process(out.subarray(i,i+1),1);for(const k in tp)tp[k][i]=e.out[OI[k]];}
  return {out,tp,e};
}
function rms(a,s,t){s=Math.round(s*SR);t=Math.round(t*SR);let x=0;for(let i=s;i<t;i++)x+=a[i]*a[i];return Math.sqrt(x/Math.max(1,t-s));}
function peak(a){let m=0;for(const x of a)m=Math.max(m,Math.abs(x));return m;}
function zcHz(a,s,t){s=Math.round(s*SR);t=Math.round(t*SR);let c=0;for(let i=s+1;i<t;i++)if(a[i-1]<0&&a[i]>=0)c++;return c/((t-s)/SR);}
function knobFor(hz){return Math.log2(hz/4)/11;}
const trig0=(e,i)=>{if(i===0)e.trigger();};

ok('alkuasetus: kaikki säätimet, 8 askelta, ei kaapeleita',()=>{
  const d=RS.defaults();assert.equal(Object.keys(d.p).length,RS.PAR.length);assert.equal(d.pitch.length,8);assert.equal(d.vel.length,8);assert.deepEqual(d.cab,[]);
  assert.equal(RS.JACKS.filter(j=>j[2]==='i').length,15);assert.equal(RS.JACKS.filter(j=>j[2]==='o').length,9);
});
ok('korjaus: roska → alkuasetus, rajat, kytkimet kokonaisluvuiksi',()=>{
  assert.deepEqual(RS.repair(null),RS.defaults());assert.deepEqual(RS.repair('x'),RS.defaults());
  const r=RS.repair({p:{cutoff:5,vco1Eg:-3,seqPitchMod:2.7,sync:'1',tempo:'abc',outo:1},pitch:[2,-2,'x'],vel:[-1]});
  assert.equal(r.p.cutoff,1);assert.equal(r.p.vco1Eg,-1);assert.equal(r.p.seqPitchMod,2);assert.equal(r.p.sync,1);assert.equal(r.p.tempo,RS.defaults().p.tempo);
  assert.equal(r.p.outo,undefined);assert.deepEqual(r.pitch.slice(0,3),[1,-1,0]);assert.equal(r.vel[0],0);assert.equal(r.vel[1],0.7);
});
ok('korjaus: kaapeli vain lähdöstä tuloon, yksi kaapeli per tulo',()=>{
  const r=RS.repair({cab:[['vcoEg','vcaCv'],['vca','vcaCv'],['trig','vca'],['vco1','nope'],'x',['velO','tempo']]});
  assert.deepEqual(r.cab,[['vcoEg','vcaCv'],['velO','tempo']]);
});
ok('hiljaa, kun sekvensseri on pysäytetty eikä mitään laukaista',()=>{const r=run(patch(),0.5);assert(peak(r.out)<1e-3,peak(r.out));});
ok('TRIGGER soittaa iskun, joka vaimenee',()=>{
  const r=run(patch({vcaDecay:0.4}),1.5,trig0);const a=rms(r.out,0,0.05),b=rms(r.out,1.2,1.5);
  assert(a>0.05,'isku '+a);assert(b<a/100,'häntä '+b+' / '+a);
});
ok('VCA DECAY pidentää ääntä',()=>{
  const lyh=run(patch({vcaDecay:0.3}),1,trig0),pit=run(patch({vcaDecay:0.7}),1,trig0);
  assert(rms(pit.out,0.3,0.5)>rms(lyh.out,0.3,0.5)*10);
});
ok('sekvensseri: askelia tempon mukaan, kahdeksan askeleen kierto',()=>{
  const steps=[];const e=RS.create(SR);e.loadNow(patch({tempo:0.5}));e.onStep=i=>steps.push(i);e.run(true);
  const b=new Float32Array(128);for(let i=0;i<SR*3/128;i++)e.process(b,128);
  const expect=RS.stepRate(0.5)*3;assert(Math.abs(steps.length-expect)<=1.01,steps.length+' vs '+expect);
  assert.deepEqual(steps.slice(0,10),[0,1,2,3,4,5,6,7,0,1]);
});
ok('velocity skaalaa voimakkuuden: 0 = hiljaa, puolikas hiljaisempi',()=>{
  const v=x=>{const r=run(patch({},{vel:[x,x,x,x,x,x,x,x]}),0.3,(e,i)=>{if(i===0)e.advance();});return rms(r.out,0,0.1);};
  const t0=v(0),t35=v(0.35),t7=v(0.7);assert(t0<1e-4,'0: '+t0);assert(t35<t7*0.8&&t35>t7*0.1,t35+' / '+t7);
});
ok('VCO 1 EG AMOUNT: sävel putoaa iskussa, nollalla ei',()=>{
  const f=amt=>{const r=run(patch({vco1Eg:amt,vco1Freq:knobFor(60),vcoDecay:0.4}),0.6,trig0,['vco1']);return [zcHz(r.tp.vco1,0.002,0.02),zcHz(r.tp.vco1,0.4,0.6)];};
  const [a,b]=f(0.6);assert(a>b*2,a+' → '+b);assert(Math.abs(b-60)<6,'perussävel '+b);
  const [c,d]=f(0);assert(Math.abs(c-d)<15,c+' vs '+d);
});
ok('SEQ PITCH MOD: VCO 1&2, OFF ja VCO 2',()=>{
  const m=sw=>{const r=run(patch({seqPitchMod:sw,vco1Eg:0,vco2Eg:0,vco1Freq:knobFor(200),vco2Freq:knobFor(300)},{pitch:[0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4]}),0.4,(e,i)=>{if(i===0)e.advance();},['vco1','vco2']);
    return [zcHz(r.tp.vco1,0.1,0.4),zcHz(r.tp.vco2,0.1,0.4)];};
  const [a1,a2]=m(0),[b1,b2]=m(1),[c1,c2]=m(2);
  assert(Math.abs(a1-400)<10&&Math.abs(a2-600)<12,'1&2: '+a1+' '+a2);assert(Math.abs(b1-200)<6&&Math.abs(b2-300)<6,'OFF: '+b1+' '+b2);assert(Math.abs(c1-200)<6&&Math.abs(c2-600)<12,'VCO 2: '+c1+' '+c2);
});
ok('1→2 FM muuttaa VCO 2:n aaltoa',()=>{
  const w=fm=>run(patch({fm,vco1Eg:0,vco1Freq:knobFor(150),vco2Freq:knobFor(400)}),0.2,null,['vco2']).tp.vco2;
  const a=w(0),b=w(0.6);let d=0;for(let i=0;i<a.length;i++)d+=(a[i]-b[i])**2;assert(Math.sqrt(d/a.length)>1,'ero '+Math.sqrt(d/a.length));
});
ok('HARD SYNC lukitsee VCO 2:n VCO 1:n jaksoon',()=>{
  const per=s=>{const x=run(patch({sync:s,vco1Eg:0,vco1Freq:knobFor(200),vco2Freq:knobFor(517)}),0.3,null,['vco2']).tp.vco2;let d=0;for(let i=4800;i<14000;i++)d+=Math.abs(x[i]-x[i+240]);return d/9200;};
  const on=per(1),off=per(0);assert(on<0.15&&off>1,'sync '+on+' ilman '+off);
});
ok('suodin: matala cutoff vaimentaa kohinaa, HP päästää korkeat',()=>{
  const lvl=(c,mode)=>{const r=run(patch({vco1Lvl:0,noiseLvl:0.8,cutoff:c,vcfEg:0,vcfMode:mode,vcaDecay:1,res:0}),0.3,trig0);return rms(r.out,0.05,0.3);};
  const lo=lvl(0.25,0),hi=lvl(0.95,0),hp=lvl(0.25,1);assert(hi>lo*4,'LP '+lo+' / '+hi);assert(hp>lo*4,'HP '+hp+' / LP '+lo);
});
ok('RESONANCE yläpäässä: suodin soi itsekseen ilman lähteitä',()=>{
  const s=res=>{const r=run(patch({vco1Lvl:0,vco2Lvl:0,noiseLvl:0,cutoff:0.6,vcfEg:0,res,vcaDecay:1}),1,trig0);return [rms(r.out,0.5,1),zcHz(r.out,0.5,1)];};
  const [a,f]=s(1),[b]=s(0);assert(a>0.02,'itseoskillointi '+a);assert(b<1e-3,'ilman resonanssia '+b);
  const fc=RS.cutHz(0.6);assert(f>fc*0.3&&f<fc*1.5,'sävel '+f+' Hz, cutoff '+fc);
});
ok('kaapeli VCO EG → VCA CV: ääni seuraa pitkää sävelverhokäyrää',()=>{
  const p={vcaDecay:0.05,vcoDecay:0.75};const ilman=run(patch(p),0.8,trig0),kanssa=run(patch(p,{cab:[['vcoEg','vcaCv']]}),0.8,trig0);
  assert(rms(kanssa.out,0.3,0.6)>rms(ilman.out,0.3,0.6)*50);
});
ok('kaapeli TRIGGER → ADV/CLOCK: sekvenssi hyppii kaksi askelta',()=>{
  const steps=[];const e=RS.create(SR);e.loadNow(patch({},{cab:[['trigO','adv']]}));e.onStep=i=>steps.push(i);
  const b=new Float32Array(64);e.advance();for(let i=0;i<50;i++)e.process(b,64);e.advance();for(let i=0;i<50;i++)e.process(b,64);
  assert.deepEqual(steps,[0,1,2,3]);
});
ok('kaapeli VELOCITY → TEMPO nopeuttaa sekvenssiä',()=>{
  const c=cab=>{let k=0;const e=RS.create(SR);e.loadNow(patch({tempo:0.4},{cab}));e.onStep=()=>k++;e.run(true);const b=new Float32Array(128);for(let i=0;i<SR*2/128;i++)e.process(b,128);return k;};
  const a=c([]),b=c([['velO','tempo']]);assert(b>a*5,a+' → '+b);
});
ok('kaapeli ulkoinen kello RUN/STOP-tuloon: nouseva reuna käynnistää',()=>{
  const e=RS.create(SR);e.loadNow(patch({},{cab:[['trigO','run']]}));const b=new Float32Array(64);e.trigger();for(let i=0;i<20;i++)e.process(b,64);assert.equal(e.running,true);
});
ok('ei NaN:ia eikä ylitystä satunnaisilla säädöillä ja kaapeleilla',()=>{
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const ins=RS.JACKS.filter(j=>j[2]==='i').map(j=>j[0]),outs=RS.JACKS.filter(j=>j[2]==='o').map(j=>j[0]);
  for(let k=0;k<25;k++){const p={};RS.PAR.forEach(d=>{p[d[0]]=d[3]==='b'?rnd()*2-1:d[3]==='k'?rnd():Math.floor(rnd()*(d[3]==='s3'?3:2));});
    const cab=[];for(let c=0;c<4;c++)cab.push([outs[Math.floor(rnd()*outs.length)],ins[Math.floor(rnd()*ins.length)]]);
    const r=run(RS.repair({p,cab,pitch:[1,-1,0.5,-0.5,1,-1,0,0],vel:[1,0,1,0.5,1,0.2,1,1]}),0.25,(e,i)=>{if(i===0)e.run(true);});
    for(const x of r.out)assert(Number.isFinite(x)&&Math.abs(x)<=1,'kierros '+k+': '+x);}
});
ok('render ja .wav: oikea pituus ja otsake',()=>{
  const p=patch({tempo:0.6}),d=RS.render(p,SR,2,1),expect=2*8/RS.stepRate(0.6)+1;
  assert(Math.abs(d.length/SR-expect)<0.01,d.length/SR+' vs '+expect);assert(peak(d)>0.05);
  const w=Buffer.from(RS.wav(d,SR));assert.equal(w.toString('latin1',0,4),'RIFF');assert.equal(w.readUInt32LE(24),SR);assert.equal(w.readUInt32LE(40),d.length*2);
});
ok('nopeus: tieto (ei raja)',()=>{const t=Date.now();RS.render(patch(),SR,1,0.5);const s=8/RS.stepRate(patch().p.tempo)+0.5;console.log('     '+nf((Date.now()-t)/1000/s*100)+' % reaaliajasta tällä koneella');});
function nf(x){return x.toFixed(1);}
console.log((fails?'FAIL ':'')+n+' ok, '+fails+' virhettä');
process.exit(fails?1:0);
