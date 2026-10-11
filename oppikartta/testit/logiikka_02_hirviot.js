// Hirviöpeli: vuorot, osuma, häviö vain väärällä vastauksella, uuden kortin vapaa virhe, vaikeustasot simuloituna.
const E=require('./ok.js');const {LEVELS,newRound,stepRound,nearestMon,dangerNow,cleanRound}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function check(label,cond,extra){if(!cond)ok=false;console.log((cond?'ok  ':'FAIL')+' '+label+(extra?'  '+extra:''));}
function rngOf(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seq=list=>{let i=0;return()=>list[i++%list.length];};

// ---------- perusvuorot ilman satunnaisuutta: rng 0.99 = hidas hirviö, pisin väli ----------
let r=()=>0.99,R=newRound('tavallinen',10,r);
eq('alussa yksi hirviö lähtöpaikassa',[R.mons.length,R.mons[0].d,R.mons[0].v,R.cd],[1,6,1,3]);
let ev=stepRound(R,false,false,r);eq('väärä vastaus: hirviö askeleen lähemmäs, ei osumaa',[ev.hit,ev.moved,R.mons[0].d,R.miss,R.hits],[null,true,5,1,0]);
ev=stepRound(R,false,true,r);eq('uuden kortin väärä vastaus: mikään ei liiku eikä virhettä lasketa',[ev.moved,R.mons[0].d,R.miss,R.turn],[false,5,1,2]);
ev=stepRound(R,true,false,r);eq('oikea vastaus: lähin hirviö pois, tilalle uusi lähtöpaikkaan',[ev.hit.id,R.hits,R.mons.map(m=>m.d)],[1,1,[6]]);
// kaksi peräkkäin: oikea osuu lähimpään, toinen jatkaa
R=newRound('tavallinen',10,r);stepRound(R,false,false,r);stepRound(R,false,false,r);stepRound(R,false,false,r);
eq('kolmen virheen jälkeen kentällä kaksi: 3 ja 6 askeleen päässä',R.mons.map(m=>m.d),[3,6]);
ev=stepRound(R,true,false,r);eq('oikea vastaus vie lähimmän, takana ollut astuu lähemmäs',[ev.hit.id,R.mons.map(m=>m.d)],[1,[5]]);
// häviö
R=newRound('tavallinen',10,r);let n=0;while(!R.over){ev=stepRound(R,false,false,r);n++;}
eq('kuusi virhettä peräkkäin tyhjältä kentältä päättää pelin',[n,R.over,ev.caught.id,ev.caught.d],[6,'loss',1,0]);
eq('päättynyt peli ei enää liiku',[stepRound(R,true,false,r).moved,R.hits],[false,0]);
// voitto
R=newRound('helppo',10,r);n=0;while(!R.over){ev=stepRound(R,true,false,r);n++;}
eq('kymmenen oikeaa: voitto ja kenttä tyhjenee',[n,R.over,R.hits,R.mons.length],[10,'win',10,0]);
// nopea hirviö: rng 0 = nopea, lyhin väli
r=()=>0;R=newRound('tavallinen',10,r);eq('nopea hirviö kulkee kaksi askelta',[R.mons[0].v,(stepRound(R,false,false,r),R.mons[0].d)],[2,4]);
eq('vaara näkyy ennen ratkaisevaa virhettä',[dangerNow(R),(stepRound(R,false,false,r),dangerNow(R))],[false,true]);
// oikean vastauksen jälkeen hirviö pysähtyy viereen eikä saa kiinni
R={lv:'tavallinen',len:10,hits:0,miss:0,turn:0,seq:2,lane:0,cd:3,mons:[{id:1,d:1,v:1,x:0},{id:2,d:2,v:2,x:1}],over:''};
ev=stepRound(R,true,false,()=>0.99);eq('oikea vastaus ei koskaan päätä peliä häviöön',[ev.over,R.mons.map(m=>m.d)],['',[1]]);
ev=stepRound(R,false,false,()=>0.99);eq('seuraava virhe päättää',[ev.over,ev.caught.id],['loss',2]);
// tallennetun kierroksen siivous
eq('kesken oleva kierros säilyy latauksessa',cleanRound({lv:'vaikea',len:20,hits:3,miss:1,turn:5,seq:4,lane:1,cd:2,mons:[{id:4,d:3,v:2,x:-1}]}),{lv:'vaikea',len:20,hits:3,miss:1,turn:5,seq:4,lane:1,cd:2,mons:[{id:4,d:3,v:2,x:-1}],over:''});
eq('rikkinäinen tai päättynyt kierros hylätään',[cleanRound({lv:'x',len:10,mons:[]}),cleanRound({lv:'helppo',len:10,over:'win',mons:[]}),cleanRound(null)],[null,null,null]);

// ---------- satunnaispelit: virheetön peli voittaa aina, pelkät virheet häviävät aina ----------
const rng=rngOf(2026);let bad=0,tot=0,minLoss=99,maxLoss=0;
for(const lv of Object.keys(LEVELS))for(const len of [10,20])for(let i=0;i<3000;i++){
  let A=newRound(lv,len,rng),t=0;while(!A.over&&t<200){stepRound(A,true,false,rng);t++;if(!A.mons.length&&!A.over)bad++;}tot++;if(A.over!=='win'||t!==len)bad++;
  let B=newRound(lv,len,rng);t=0;while(!B.over&&t<200){stepRound(B,false,false,rng);t++;}if(B.over!=='loss'||t>LEVELS[lv].D)bad++;minLoss=Math.min(minLoss,t);maxLoss=Math.max(maxLoss,t);}
check('virheetön peli voittaa aina täsmälleen pituutensa mittaisena, kenttä ei ole koskaan tyhjä, pelkät virheet häviävät',bad===0,'('+tot+' peliä joka lajia, häviö '+minLoss+'–'+maxLoss+' virheellä)');
// häviö vain väärällä vastauksella, myös sekapelissä
bad=0;for(const lv of Object.keys(LEVELS))for(let i=0;i<3000;i++){const A=newRound(lv,20,rng);while(!A.over){const right=rng()<0.6,e=stepRound(A,right,false,rng);if(e.over==='loss'&&right)bad++;if(A.mons.some(m=>m.d<0||m.d>LEVELS[lv].D))bad++;}}
check('sekapeleissä häviö tulee vain väärästä vastauksesta ja hirviöt pysyvät kentällä',bad===0);

// ---------- vaikeustasot: voittojen osuus eri osaamisella (simuloitu, 4000 peliä per ruutu) ----------
function win(lv,len,p){const g=rngOf(7+len+Math.round(p*100));let w=0;const N=4000;for(let i=0;i<N;i++){const A=newRound(lv,len,g);while(!A.over)stepRound(A,g()<p,false,g);if(A.over==='win')w++;}return Math.round(100*w/N);}
const tbl={};for(const lv of Object.keys(LEVELS)){tbl[lv]={};for(const len of [10,20])tbl[lv][len]=[0.9,0.8,0.7,0.6,0.5].map(p=>win(lv,len,p));}
console.log('     oikein  90% 80% 70% 60% 50%');for(const lv of Object.keys(tbl))for(const len of [10,20])console.log('     '+(lv+' '+len).padEnd(14)+tbl[lv][len].map(x=>String(x).padStart(3)).join(' '));
check('taso vaikeutuu järjestyksessä helppo > tavallinen > vaikea',[10,20].every(len=>[0,1,2,3,4].every(i=>tbl.helppo[len][i]>=tbl.tavallinen[len][i]&&tbl.tavallinen[len][i]>=tbl.vaikea[len][i])));
check('pidempi peli on vaikeampi',Object.keys(tbl).every(lv=>[0,1,2,3,4].every(i=>tbl[lv][10][i]>=tbl[lv][20][i])));
check('helppo: 60 % oikein voittaa yleensä; vaikea: 60 % oikein häviää yleensä',tbl.helppo[10][3]>=85&&tbl.vaikea[10][3]<=45);

console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
