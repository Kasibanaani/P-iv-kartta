// Moottorin testit (node): korjaus, piirto, viiva, täyttö, kumoa, paletit ja vienti.
const P=require('./engine.js');
let virheet=0;const ok=(c,m)=>{if(!c){virheet++;console.log('  VIRHE:',m)}};
const rnd=(()=>{let s=12345;return()=>(s=(s*1103515245+12345)%2147483648)/2147483648})();
const hex=()=>'#'+[0,0,0].map(()=>Math.floor(rnd()*256).toString(16).padStart(2,'0')).join('');

// korjaus ja oletukset
let D=P.repair(null);
ok(D.app==='pikseli'&&D.ver===P.VER&&D.teokset.length===1,'tyhjästä yksi kuva');
let w=D.teokset[0];ok(w.w===32&&w.h===32&&w.px.length===1024&&w.px.every(v=>v===0)&&w.cols.length===0,'oletuskuva 32×32 tyhjä');
ok(D.valittu===w.id&&D.asetukset.vari===D.asetukset.pohja,'valittu kuva ja väri');
ok(P.repair({app:'muu',teokset:[{w:4,h:4}]}).teokset[0].w===32,'vieras sovellus ohitetaan');
D=P.repair({app:'pikseli',asetukset:{ulko:'dark',ruudukko:false,pohja:'#ABC',laji:'kolmikko',vari:'nope',vienti:{koko:'iso',tausta:'musta'}},
  teokset:[{id:'a',w:2,h:2,cols:['#ff0000','bad'],px:[1,2,3,'x']},{id:'a',w:3,h:1,px:[0,0,0]},{w:0,h:5},null],valittu:'zzz'});
ok(D.teokset.length===2,'virheelliset kuvat pois ('+D.teokset.length+')');
ok(JSON.stringify(D.teokset[0].px)==='[1,2,0,0]'&&D.teokset[0].cols[1]==='#000000','virheelliset pikselit läpinäkyviksi, rikkinäinen väri mustaksi');
ok(D.teokset[1].id!=='a','tuplatunniste vaihdetaan');
ok(D.valittu===D.teokset[0].id,'puuttuva valinta → ensimmäinen');
const a=D.asetukset;ok(a.ulko==='dark'&&a.ruudukko===false&&a.pohja==='#aabbcc'&&a.laji==='kolmikko'&&a.vari==='#aabbcc'&&a.vienti.koko==='iso'&&a.vienti.tausta==='musta','asetukset luetaan ja korjataan');
ok(P.nextName({teokset:[{nimi:'Kuva 1'},{nimi:'Kuva 3'}]})==='Kuva 2','seuraava vapaa nimi');

// piirto, vedon tila, kumoa
w=P.newWork(4,3,'T');let ch=[];
ok(P.setPx(w,5,'#112233',ch)&&P.colorAt(w,5)==='#112233','pikseli päälle');
ok(!P.setPx(w,5,'#112233',ch),'sama väri ei muutu');
ok(P.strokeMode(w,5,'#112233')==='pois'&&P.strokeMode(w,5,'#000000')==='paalle'&&P.strokeMode(w,0,'#112233')==='paalle','vedon tila aloituspikselin mukaan');
P.setPx(w,6,'#445566',ch);P.setPx(w,5,null,ch);ok(P.colorAt(w,5)===null&&w.cols.length===2,'pyyhintä');
P.undo(w,ch);ok(w.px.every(v=>v===0),'kumoa palauttaa');P.redo(w,ch);ok(P.colorAt(w,6)==='#445566'&&P.colorAt(w,5)===null,'tee uudelleen');

// viiva: päätepisteet ja yhtenäisyys
for(let k=0;k<300;k++){const x0=Math.floor(rnd()*40)-5,y0=Math.floor(rnd()*40)-5,x1=Math.floor(rnd()*40)-5,y1=Math.floor(rnd()*40)-5;const L=P.line(x0,y0,x1,y1);
  let good=L[0][0]===x0&&L[0][1]===y0&&L[L.length-1][0]===x1&&L[L.length-1][1]===y1&&L.length===Math.max(Math.abs(x1-x0),Math.abs(y1-y0))+1;
  for(let i=1;i<L.length&&good;i++)good=Math.abs(L[i][0]-L[i-1][0])<=1&&Math.abs(L[i][1]-L[i-1][1])<=1;
  if(!good){ok(false,'viiva '+[x0,y0,x1,y1]);break}}

// täyttö
w=P.newWork(5,5,'F');ch=[];
for(let y=0;y<5;y++)P.setPx(w,y*5+2,'#000000',ch);           // pystyseinä keskellä
P.setPx(w,0,'#000000',ch);P.setPx(w,6,'#000000',ch);           // vinottainen nurkka
ch=[];let n=P.fill(w,4,4,'#ff0000',ch);ok(n===10&&ch.length===10,'täyttö pysähtyy seinään ('+n+')');
ok(P.colorAt(w,1)===null,'vinottain ei vuoda');
n=P.fill(w,4,0,'#ff0000',[]);ok(n===10&&P.colorAt(w,4)===null,'saman värin täyttö tyhjentää alueen');
ok(P.fill(w,9,9,'#ff0000',[])===0,'kuvan ulkopuolelta ei mitään');

// värit ja paletit
let rt=0;for(let k=0;k<400;k++){const h=hex(),l=P.hexToOklch(h);if(P.oklchToHex(l[0],l[1],l[2])===h)rt++}
ok(rt===400,'OKLCH edestakaisin tarkasti ('+rt+'/400)');
for(let k=0;k<60;k++){const b=k===0?'#808080':k===1?'#000000':k===2?'#ffffff':hex(),ps=P.palettes(b);
  ok(ps.length===4&&ps.map(p=>p.id).join()==='portaat,vasta,vieri,kolmikko','neljä palettia '+b);
  ps.forEach(p=>ok(p.varit.length===8&&p.varit.every(c=>/^#[0-9a-f]{6}$/.test(c)),p.id+' 8 kelvollista väriä '+b));
  ps.forEach(p=>ok(p.varit.includes(b),p.id+' sisältää pohjavärin '+b));
  const Ls=ps[0].varit.map(c=>P.hexToOklch(c)[0]);ok(Ls.every((v,i)=>i===0||v>=Ls[i-1]-1e-9),'sävyportaat tummasta vaaleaan '+b+' '+Ls.map(v=>v.toFixed(2)));
}
// sävyn kierto: sinisellä pohjalla tummin on violetimpi kuin pohja, vaalein kohti keltaista
const pb=P.palettes('#3d7ee0')[0].varit.map(c=>P.hexToOklch(c)),H0=P.hexToOklch('#3d7ee0')[2];
ok(pb[0][2]>H0+5,'varjo kiertyy kohti violettia ('+pb[0][2].toFixed(0)+' vs '+H0.toFixed(0)+')');
ok(pb[7][2]<H0,'valo kiertyy pois sinisestä ('+pb[7][2].toFixed(0)+')');

// vienti: vain kokonaislukusuurennos
ok(P.exportScale(32,32,'alkup')===1&&P.exportScale(32,32,'pieni')===16&&P.exportScale(32,32,'keski')===32&&P.exportScale(32,32,'iso')===64,'32 px: 1/16/32/64');
ok(P.exportScale(24,24,'keski')===43&&P.exportScale(64,64,'keski')===16&&P.exportScale(16,16,'iso')===128,'24 ja 64 ja 16 px');
w=P.newWork(2,1,'E');P.setPx(w,0,'#0a0b0c',[]);
ok(JSON.stringify(P.rgbaAt(w,0,null))==='[10,11,12,255]'&&JSON.stringify(P.rgbaAt(w,1,null))==='[0,0,0,0]'&&JSON.stringify(P.rgbaAt(w,1,'#ffffff'))==='[255,255,255,255]','vientivärit ja tausta');

process.exit(virheet?1:0);
