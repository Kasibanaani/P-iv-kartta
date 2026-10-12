// Tyylijärjestelmä: palettien luettavuus vaaleassa ja tummassa tilassa, valmiit tyylit, vanhojen projektien yhteensopivuus ja viedyn apin tyyli.
const S=require('./tyyli.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}

// 1) luettavuus: jokainen paletti, molemmat tilat, kaikki tarkistukset
const pals=S.pals();
console.log('paletteja',pals.length,'| tarkistuksia per tila',S.CHECKS.length);
let fails=[];
pals.forEach(id=>{const r=S.check(id);
  if(r.length!==(S.CHECKS.length+S.HUES.length*S.HCHECKS.length)*2){ok=false;console.log('FAIL tarkistuksia puuttuu',id,r.length);}
  r.forEach(c=>{if(!c.ok)fails.push(id+' '+c.tila+': '+c.mita+' '+c.r+':1 < '+c.min);});
  const txt=r.filter(c=>c.min>=4.5),lo=Math.min(...txt.map(c=>c.r));
  console.log('   '+id.padEnd(10)+' heikoin tekstikontrasti '+lo.toFixed(2)+':1');});
eq('kaikki paletit läpäisevät luettavuuden vaaleassa ja tummassa',fails,[]);
// jokaisessa paletissa on kaikki värit kummassakin tilassa
const need=['bg','cell','tint','label','label2','sep','line','seg','bar','accent','solid','on','fill','fill2','acc2','bg2','bg3','pat'];
eq('paletteissa kaikki värit',pals.filter(id=>{const p=S.pal(id);return need.some(k=>!p.L[k]||!p.D[k]);}),[]);
// tarkistus huomaa huonon yhdistelmän (itse testin testi)
eq('kontrastikaava: valkoinen mustalla 21:1, harmaa harmaalla 1:1',[Math.round(S.ratio(S.col('#fff'),S.col('#000'))),S.ratio(S.col('#777'),S.col('#777'))],[21,1]);
eq('läpinäkyvä väri lasketaan taustan päälle (puoliksi musta valkoisella = harmaa)',Math.abs(S.ratio(S.over(S.col('rgba(0,0,0,.5)'),S.col('#fff')),S.col('#fff'))-S.ratio(S.col('#808080'),S.col('#fff')))<0.05,true);

// 2) akselit ja valmiit tyylit
eq('kahdeksan akselia',S.AX,['paletti','muoto','pinta','tausta','fontti','tiheys','painikkeet','liike']);
const pre=S.presets();
eq('kaksitoista valmista tyyliä, nimet uniikit',[pre.length,new Set(pre.map(p=>p.n)).size],[12,12]);
eq('valmiiden tyylien kaikki arvot ovat olemassa',pre.filter(p=>S.AX.some(k=>!S.opt(k,p.s[k]))).map(p=>p.id),[]);
eq('esimerkkikuvan henkinen tyyli: lämmin paletti, pyöreä fontti, varjo',(p=>[p.s.paletti,p.s.fontti,p.s.pinta])(S.preset('aamurusko')),['aamu','pyorea','varjo']);
eq('valmiit tyylit ovat keskenään erilaisia',new Set(pre.map(p=>S.AX.map(k=>p.s[k]).join('|'))).size,12);

// 3) vanhat projektit ja virheelliset arvot
eq('ei tyyliä eikä väriä -> Perus',S.resolve({}),{preset:'perus',paletti:'sininen',muoto:'pyoristetty',pinta:'tasainen',tausta:'tasainen',fontti:'jarjestelma',tiheys:'normaali',painikkeet:'taytetty',liike:'kevyt'});
eq('vaiheen 1 tyyli ilman taustaa ja liikettä saa ne omasta valmiista tyylistään',(r=>[r.tausta,r.liike,S.label(r)])(S.resolve({style:{preset:'konsoli',paletti:'konsoli',muoto:'terava',pinta:'reunaviiva',fontti:'mono',tiheys:'tiivis',painikkeet:'aariviiva'}})),['pisteet','ei','Konsoli']);
eq('vanha korostusväri säilyy paletiksi',S.resolve({tint:'vihrea'}).paletti,'vihrea');
eq('vanha projekti näyttää Perus-tyyliltä, kun väri on sininen',S.label(S.resolve({tint:'sininen'})),'Perus');
eq('vanha projekti eri värillä: Perus (muokattu)',S.label(S.resolve({tint:'pinkki'})),'Perus (muokattu)');
const r=S.resolve({style:{preset:'konsoli',paletti:'eiole',muoto:'pilleri',pinta:7,fontti:'mono',tiheys:'tiivis',painikkeet:'aariviiva'}});
eq('tuntemattomat arvot korvataan Perus-tyylin arvoilla',[r.paletti,r.pinta,r.muoto],['sininen','tasainen','pilleri']);
eq('muokattu nimetään',S.label(r),'Konsoli (muokattu)');
eq('oma yhdistelmä',S.label(S.resolve({style:Object.assign({preset:''},S.preset('perus').s,{paletti:'meri'})})),'Oma yhdistelmä');
eq('piilotettu pohjapaletti ei kelpaa',S.resolve({style:{paletti:'apple'}}).paletti,'sininen');

// 4) CSS-muuttujat
const st=Object.assign({preset:'aamurusko'},S.preset('aamurusko').s);
const vl=S.vars(st,false),vd=S.vars(st,true);
eq('vaalea ja tumma tausta eri',[vl['--bg'],vd['--bg']],['#FBF3EA','#1A1411']);
eq('muoto, tiheys ja fontti mukana',[vl['--rr'],vl['--fs'],/rounded/.test(vl['--font'])],['20px','18px',true]);
eq('pinnan väriviittaus korvataan paletin värillä',S.vars(Object.assign({},st,{pinta:'reunaviiva'}),false)['--ring'],'inset 0 0 0 1.5px #9A8371');
eq('varjo tummassa tilassa vaihtuu',vd['--shadow']!==vl['--shadow'],true);
eq('kaikilla tyyleillä kaikki muuttujat',pre.map(p=>Object.keys(S.vars(Object.assign({},p.s),true)).length).every(n=>n===Object.keys(vl).length),true);

// 5) satunnainen ja viedyn apin osa
let rr=0.5;const rnd=()=>{rr=(rr*9301+49297)%233280/233280;return rr;};
const ra=S.random(rnd);eq('sekoitus antaa kelvollisen tyylin',S.AX.every(k=>!!S.opt(k,ra[k])),true);
const pk=S.pack(st);
eq('viety appi saa vain valitun paletin ja pohjan',Object.keys(pk.pal),['aamu']);
eq('viedyssä on yksi vaihtoehto per akseli',Object.keys(pk.ax).map(k=>pk.ax[k].length),[1,1,1,1,1,1,1]);
const pk2=S.pack(S.resolve({tint:'indigo'}));eq('Apple-paletin mukana pohja',Object.keys(pk2.pal).sort(),['apple','indigo']);
console.log('   viedyn tyylin koko',JSON.stringify(pk).length,'merkkiä');


// 6) vaihe 2: palikoiden sävyt, oma paletti, taustat
eq('seitsemän sävyä',S.HUES.length,7);
const hueFails=[];pals.forEach(id=>S.check(id).filter(c=>c.hue!==undefined&&!c.ok).forEach(c=>hueFails.push(id+' '+c.tila+' '+c.mita+' '+c.r)));
eq('kaikkien palettien kaikki sävyt läpäisevät luettavuuden',hueFails,[]);
console.log('   tarkistuksia per paletti (perus + sävyt, molemmat tilat)',S.check('sininen').length);
let seed=7;const rnd2=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const omat=[];for(let i=0;i<400;i++)omat.push('#'+Math.floor(rnd2()*16777215).toString(16).padStart(6,'0').toUpperCase());
omat.push('#000000','#FFFFFF','#808080','#FFFF00','#00FF00','#0000FF','#FF0000','#FF00FF','#00FFFF');
const omaFails=omat.filter(h=>S.checkPal(S.gen(h)).some(c=>!c.ok));
eq('oma paletti: 409 väriä (myös musta, valkoinen, harmaa ja puhtaat värit) läpäisee kaiken',omaFails,[]);
const so=S.resolve({style:Object.assign({},S.preset('perus').s,{preset:'perus',paletti:'oma',oma:'#3a7bd5'})});
eq('oma väri säilyy ja nimetään muokatuksi',[so.paletti,so.oma,S.label(so)],['oma','#3A7BD5','Perus (muokattu)']);
eq('virheellinen oma väri -> Perus-paletti',S.resolve({style:{paletti:'oma',oma:'sininen'}}).paletti,'sininen');
const vo=S.vars(so,false);eq('oman paletin muuttujat',[!!vo['--bg'],!!vo['--accent'],vo['--bg']!==S.vars(so,true)['--bg']],[true,true,true]);
eq('oman paletin vienti ei tarvitse palettitietoja',Object.keys(S.pack(so).pal),[]);
const sa=Object.assign({},S.preset('laguuni').s);const va=S.vars(sa,false);
eq('aallot: kuva on koodattu ja värit paletista',[/^url\("data:image\/svg\+xml,/.test(va['--bgimg']),va['--bgimg'].includes(encodeURIComponent(S.pal('meri').L.bg2))],[true,true]);
eq('läikät ja liukuväri käyttävät paletin taustasävyjä',[S.vars(Object.assign({},sa,{tausta:'laikat'}),true)['--bgimg'].includes(S.pal('meri').D.bg3),S.vars(Object.assign({},sa,{tausta:'liukuvari'}),false)['--bgimg'].includes(S.pal('meri').L.bg2)],[true,true]);
eq('palikan sävyn muuttujat',Object.keys(S.hueVars(sa,3,false)).sort(),['--acc2','--accent','--fill','--fill2','--on','--solid']);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
