// Pelin säännöt: kartta, vihollisten kulku ja esteiden kierto, banaani, vesimeloni, kolot, pisteytys, elämät, vaikeustasot, pelaajien pisteet.
const E=require('./vv.js');const {W,TYPES,LEVELS,LEVEL_IDS,BAN,MEL,HOLE,LIVES,MIN_GAP,rngOf,makeMap,newGame,spawnOne,stepGame,fire,select,newData,normalize,recordGame,cleanPlayer}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function check(label,cond,extra){if(!cond)ok=false;console.log((cond?'ok  ':'FAIL')+' '+label+(extra?'  '+extra:''));}
const DT=1/60,none=()=>0.5;
// tyhjä kenttä ilman esteitä ja ilman uusia vihollisia
function bare(lv,H){const G=newGame(lv||'tavallinen',H||150,rngOf(1));G.obst=[];G.spawnT=1e9;return G;}
function run(G,sec,r){const ev=[];for(let i=0;i<Math.round(sec*60)&&!G.over;i++)ev.push(...stepGame(G,DT,r||none));return ev;}
function put(G,type,x,y){const e=spawnOne(G,none,type,x,y);e.amp=0;return e;}

// ---------- kartta ----------
let bad=0,counts=new Set();
for(let s=1;s<=400;s++){const H=[110,150,190][s%3],o=makeMap(H,rngOf(s));counts.add(o.length);
  for(let i=0;i<o.length;i++){const a=o[i];if(a.y<H*0.18-0.01||a.y>H*0.68+0.01)bad++;
    const left=a.x-a.r,right=W-(a.x+a.r);if((left>0.01&&left<MIN_GAP-0.01)||(right>0.01&&right<MIN_GAP-0.01))bad++;
    for(let j=i+1;j<o.length;j++)if(Math.hypot(a.x-o[j].x,a.y-o[j].y)-a.r-o[j].r<MIN_GAP-0.01)bad++;}}
check('arvotut kartat: esteitä 4–7, väleistä mahtuu aina läpi, esteet eivät ole alareunassa eivätkä tulosuunnan suulla',bad===0&&[...counts].every(n=>n>=3&&n<=7),'esteiden määrät: '+[...counts].sort().join(', '));
eq('sama siemen antaa saman kartan',JSON.stringify(makeMap(150,rngOf(7))),JSON.stringify(makeMap(150,rngOf(7))));
check('eri siemen antaa eri kartan',JSON.stringify(makeMap(150,rngOf(7)))!==JSON.stringify(makeMap(150,rngOf(8))));

// ---------- viholliset kiertävät esteet eivätkä jää jumiin ----------
let stuck=0,inside=0,out=0,slow=0,n=0;
for(let s=1;s<=200;s++){const r=rngOf(s),H=[110,150,190][s%3],G=newGame('tavallinen',H,r);G.lives=1e9;G.spawnT=1e9;
  for(const type of ['perus','nopea','jarea'])for(let i=0;i<15;i++)spawnOne(G,r,type,2+r()*96,-5);
  let t=0;while(G.enemies.length&&t<60){stepGame(G,DT,r);t+=DT;
    for(const e of G.enemies){if(e.x<e.r-0.01||e.x>W-e.r+0.01)out++;for(const o of G.obst)if(Math.hypot(e.x-o.x,e.y-o.y)<o.r+e.r-0.01)inside++;}}
  stuck+=G.enemies.length;n+=45;if(t>40)slow++;}
check('200 kartalla 9000 vihollista: kukaan ei jää jumiin, mene esteen sisään tai kentän ulkopuolelle',stuck===0&&inside===0&&out===0&&slow===0,'jumissa '+stuck+', sisällä '+inside+', ulkona '+out);
let minx=99,maxx=0;
let G=bare(),e=put(G,'perus',50,-5);e.amp=0.8;for(let i=0;i<600;i++){stepGame(G,DT,none);minx=Math.min(minx,e.x);maxx=Math.max(maxx,e.x);}
check('vihollisen reitti mutkittelee sivusuunnassa',maxx-minx>3,'vaihteluväli '+(maxx-minx).toFixed(1));
G=bare();put(G,'perus',50,0);put(G,'nopea',30,0);put(G,'jarea',70,0);run(G,5);
eq('nopea kulkee pisimmälle, järeä lyhimmälle',G.enemies.slice().sort((a,b)=>b.y-a.y).map(x=>x.type),['nopea','perus','jarea']);
const G110=bare('tavallinen',110),G190=bare('tavallinen',190);put(G110,'perus',50,0);put(G190,'perus',50,0);run(G110,6);run(G190,6);
eq('matka-aika ei riipu näytön korkeudesta',[(G110.enemies[0].y/G110.H).toFixed(3)],[(G190.enemies[0].y/G190.H).toFixed(3)]);

// ---------- banaani ----------
G=bare();e=put(G,'perus',50,60);
eq('banaani lähtee eläimestä napautettuun suuntaan',[fire(G,50,100).k,G.shots[0].dx,G.shots[0].dy,G.sel],['ban',0,-1,'ban']);
let ev=run(G,0.6);eq('banaani jatkaa napautetun kohdan ohi ja osuu takana olevaan',[ev.map(x=>x.k),G.enemies.length,G.score,G.kills],[['hit'],0,1,1]);
G=bare();put(G,'perus',50,60);put(G,'perus',50,40);fire(G,50,100);run(G,0.8);
eq('banaani osuu vain ensimmäiseen radallaan',[G.enemies.length,Math.round(G.enemies[0].y)<60,G.shots.length],[1,true,0]);
G=bare();put(G,'perus',80,60);fire(G,50,60);ev=run(G,1.5);eq('ohi mennyt banaani lentää kentältä pois ja vie pisteen',[ev.map(x=>x.k),G.enemies.length,G.shots.length,G.score,G.misses],[['miss'],1,0,-1,1]);
G=bare();G.obst=[{x:50,y:80,r:6}];put(G,'perus',50,55);fire(G,50,40);ev=run(G,1);
eq('kivi pysäyttää banaanin, ja sekin on ohi mennyt banaani',[ev.map(x=>x.k),G.enemies.length,G.shots.length,G.score],[['poof','miss'],1,0,-1]);
eq('lataus: toinen banaani ei lähde heti, mutta 0,3 sekunnin päästä lähtee',[fire(G,20,20).k,fire(G,20,20).k,(run(G,BAN.cd+0.02),fire(G,20,20).k)],['ban','wait','ban']);
// järeä kestää kolme banaania
G=bare();e=put(G,'jarea',50,40);e.spd=0;let hits=[];for(let i=0;i<3;i++){fire(G,50,40);hits.push(...run(G,0.9).map(x=>x.k));hits.push(e.hp);}
eq('järeään pitää osua banaanilla kolmesti; osuma riittää, eli kaatamaton osuma ei vie pistettä',[hits,G.enemies.length,G.score,G.misses],[['dent',2,'dent',1,'hit',0],0,TYPES.jarea.pts,0]);
G=bare();put(G,'perus',30,60).spd=0;put(G,'nopea',70,60).spd=0;fire(G,30,60);run(G,1);fire(G,70,60);run(G,1);eq('banaanilla kaadettu antaa tyyppinsä pisteet: tavallinen 1, nopea 2',G.score,3);

// ---------- vesimeloni ----------
G=bare();G.obst=[{x:50,y:90,r:7}];put(G,'jarea',50,60).spd=0;put(G,'perus',56,64).spd=0;put(G,'perus',50,30).spd=0;
select(G,'mel');eq('elefantti heittää vesimelonin',[fire(G,50,60).k,G.sel,G.shots[0].k],['mel','mel','mel']);
ev=run(G,0.5);eq('meloni on vielä ilmassa: mihinkään ei ole osuttu',[ev.length,G.enemies.length],[0,3]);
ev=run(G,1);eq('meloni putoaa napautettuun kohtaan kiven yli: järeäkin kaatuu kerrasta, kauempana oleva säilyy',[ev.map(x=>x.k),G.enemies.map(x=>Math.round(x.y)),G.score,ev[0].n,ev[0].pts],[['splat','splash','splash'],[30],4,2,4]);
// vesimelonin pisteet: kerralla kaatuneiden määrä toiseen potenssiin, vihollisen tyypistä riippumatta
{const got=[];for(let n=0;n<=5;n++){const g=bare();const ty=['perus','nopea','jarea','perus','nopea'];for(let i=0;i<n;i++)put(g,ty[i],46+i*2,60).spd=0;select(g,'mel');fire(g,50,60);run(g,2);got.push(g.score);}
  eq('vesimelonin pisteet: 0, 1, 4, 9, 16, 25 sen mukaan, montako kaatuu kerralla; tyhjään pudonnut meloni ei vie pisteitä',got,[0,1,4,9,16,25]);}
G=bare();select(G,'mel');eq('elefantin lataus kestää pidempään kuin simpanssin',[fire(G,50,30).k,fire(G,50,30).k,(run(G,BAN.cd+0.05),fire(G,50,30).k),(run(G,MEL.cd),fire(G,50,30).k)],['mel','wait','wait','mel']);
G=bare();select(G,'mel');fire(G,50,20);const far=G.shots[0].dur;G=bare();select(G,'mel');fire(G,50,120);check('kauas heitetty meloni on ilmassa pidempään',far>G.shots[0].dur&&far<2,far.toFixed(2)+' s ja '+G.shots[0].dur.toFixed(2)+' s');
G=bare();put(G,'perus',50,60).spd=0;select(G,'mel');fire(G,50,60+MEL.r+4);run(G,2);eq('pläsähdyksen ulkopuolella oleva säilyy',G.enemies.length,1);

// ---------- myyrän kolot ----------
G=bare();G.obst=[{x:20,y:50,r:6}];select(G,'mole');
eq('koloa ei voi kaivaa kiveen',[fire(G,20,50).k,G.holesLeft,G.holes.length],['blocked',3,0]);
eq('kolo tulee napautettuun kohtaan ja laskuri vähenee',[fire(G,50,70).k,G.holesLeft,G.holes.map(h=>[h.x,h.y]),G.sel],['hole',2,[[50,70]],'mole']);
put(G,'jarea',50,50);put(G,'perus',70,50);ev=run(G,6);
eq('koloon kävelevä vihollinen putoaa pois pelistä, mutta pisteitä siitä ei saa; vierestä kulkeva jatkaa',[ev.filter(x=>x.k==='hole').length,G.enemies.map(x=>x.type),G.score,G.kills,G.holes.length],[1,['perus'],0,1,1]);
fire(G,30,90);eq('kolmannen kolon jälkeen myyrä vaihtuu simpanssiin eikä sitä voi enää valita',[fire(G,80,90).k,G.holesLeft,G.sel,select(G,'mole'),G.sel],['hole',0,'ban',false,'ban']);
G=bare();select(G,'mole');fire(G,50,G.H);check('kolo ei mene kotirajan alle',G.holes[0].y<=G.homeY-HOLE.r);

// ---------- elämät ja pelin loppu ----------
G=bare();put(G,'nopea',20,G.homeY-2);ev=run(G,0.5);eq('rajan yli päässyt vihollinen vie elämän',[ev.map(x=>x.k),G.lives,G.enemies.length,G.over],[['life'],LIVES-1,0,false]);
put(G,'nopea',20,G.homeY-2);put(G,'nopea',60,G.homeY-2);ev=run(G,0.5);
eq('kolmas elämä päättää pelin',[ev.map(x=>x.k).sort(),G.lives,G.over],[['life','life','over'],0,true]);
eq('päättyneessä pelissä ei voi ampua eikä aika kulje',[fire(G,50,50).k,stepGame(G,1,none).length,select(G,'mel')],['none',0,false]);
G=bare();G.paused=true;put(G,'perus',50,50);const y0=G.enemies[0].y;stepGame(G,1,none);eq('tauolla mikään ei liiku eikä ammu',[G.enemies[0].y,fire(G,50,50).k],[y0,'none']);

// ---------- vaikeustasot ----------
const rate={},speed={};
for(const lv of Object.keys(LEVELS)){const r=rngOf(5),g=newGame(lv,150,r);g.lives=1e9;let c=[];for(let m=0;m<3;m++){const s0=g.seq;for(let i=0;i<3600;i++)stepGame(g,DT,r);c.push(g.seq-s0);g.enemies=[];}rate[lv]=c;
  const b=bare(lv);speed[lv]=+put(b,'perus',50,0).spd.toFixed(2);}
console.log('     vihollisia minuutissa (1., 2. ja 3. minuutti): '+Object.keys(rate).map(l=>l+' '+rate[l].join('/')).join(', '));
check('vaikeampi taso tuo enemmän ja nopeampia vihollisia',rate.helppo[0]<rate.tavallinen[0]&&rate.tavallinen[0]<rate.vaikea[0]&&speed.helppo<speed.tavallinen&&speed.tavallinen<speed.vaikea,JSON.stringify(speed));
check('tahti kiihtyy pelin edetessä joka tasolla',Object.keys(rate).every(l=>rate[l][2]>rate[l][0]));
{const r=rngOf(9),g=newGame('vaikea',150,r),types={};g.lives=1e9;for(let i=0;i<3600;i++){stepGame(g,DT,r);g.enemies.forEach(x=>types[x.type]=1);}
  eq('kaikkia kolmea vihollistyyppiä tulee',Object.keys(types).sort(),['jarea','nopea','perus']);}
// ryhmät: joskus tulee monta kerralla lähekkäin
{const r=rngOf(4),g=newGame('tavallinen',150,r);g.lives=1e9;let groups=0;for(let i=0;i<7200;i++){const s0=g.seq;stepGame(g,DT,r);if(g.seq-s0>=2)groups++;g.enemies=g.enemies.filter(x=>x.y<100);}
  check('vihollisia tulee välillä ryhminä',groups>=3,groups+' ryhmää kahdessa minuutissa');}

// ---------- suuntaa antava: simuloitu pelaaja, joka napauttaa alinta vihollista tietyin välein ja osuu muutaman yksikön tarkkuudella ----------
function bot(lv,every,seed){const r=rngOf(seed),g=newGame(lv,150,r);let wait=0;
  while(!g.over&&g.t<600){stepGame(g,DT,r);wait-=DT;if(wait>0)continue;
    const vis=g.enemies.filter(x=>x.y>4);if(!vis.length)continue;const tg=vis.reduce((a,b)=>b.y>a.y?b:a);
    const near=vis.filter(x=>Math.hypot(x.x-tg.x,x.y-tg.y)<MEL.r).length;
    select(g,near>=3&&g.cdMel<=0?'mel':'ban');const k=fire(g,tg.x+(r()-0.5)*5,tg.y+(g.sel==='mel'?6:0)+(r()-0.5)*5).k;if(k!=='wait')wait=every;}
  return {t:g.t,score:g.score};}
const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)],botRes={};
for(const every of [0.9,0.55]){botRes[every]={};for(const lv of Object.keys(LEVELS)){const rs=[];for(let s=1;s<=15;s++)rs.push(bot(lv,every,s));botRes[every][lv]=[Math.round(med(rs.map(x=>x.t))),med(rs.map(x=>x.score))];}
  console.log('     simuloitu pelaaja, napautus '+every+' s välein: '+Object.keys(LEVELS).map(l=>l+' '+botRes[every][l][0]+' s ja '+botRes[every][l][1]+' pistettä').join('; '));}
check('simuloitu pelaaja pärjää helpolla pisimpään ja vaikealla lyhyimmän ajan, ja nopeampi pelaaja pidempään',[0.9,0.55].every(e=>botRes[e].helppo[0]>botRes[e].tavallinen[0]&&botRes[e].tavallinen[0]>botRes[e].vaikea[0])&&LEVEL_IDS.every(l=>botRes[0.55][l][0]>=botRes[0.9][l][0]));
check('jokainen peli päättyy: nopeakaan simuloitu pelaaja ei kestä helpolla kymmentä minuuttia',botRes[0.55].helppo[0]<600);

// ---------- pelaajat ja pisteet ----------
let d=newData();d.players.push(cleanPlayer({id:'p1',name:' Aino '}),cleanPlayer({id:'p2',name:'Toinen'}));d.cur='p1';d.pseq=2;
eq('ensimmäinen peli on ennätys, huonompi ei',[recordGame(d,'p1','tavallinen',12),recordGame(d,'p1','tavallinen',7),recordGame(d,'p1','vaikea',3)],[true,false,true]);
eq('jokainen pelaaja kerää omat pisteensä',d.players,[{id:'p1',name:'Aino',total:22,games:3,best:{helppo:0,tavallinen:12,vaikea:3}},{id:'p2',name:'Toinen',total:0,games:0,best:{helppo:0,tavallinen:0,vaikea:0}}]);
eq('miinukselle jäänyt peli kirjautuu peliksi mutta ei vähennä kokonaispisteitä eikä ole ennätys',[recordGame(d,'p2','helppo',-4),d.players[1].total,d.players[1].games,d.players[1].best.helppo],[false,0,1,0]);d.players[1].games=0;
eq('tuntematon pelaaja tai taso ei kirjaudu',[recordGame(d,'p9','helppo',5),recordGame(d,'p1','outo',5)],[false,false]);
eq('tallennus kiertää muuttumatta',JSON.stringify(normalize(JSON.parse(JSON.stringify(d)))),JSON.stringify(d));
eq('rikkinäinen tallennus siistitään',normalize({players:[{id:'p3',name:'A',total:-5,best:{helppo:'4'}},{id:'x',name:'B'},{id:'p3',name:'tupla'},null],cur:'p9',lv:'outo'}),{v:1,pseq:3,players:[{id:'p3',name:'A',total:0,games:0,best:{helppo:4,tavallinen:0,vaikea:0}}],cur:'p3',lv:'tavallinen'});
eq('vieras sisältö hylätään',[normalize(null),normalize({games:[]}),normalize('x')],[null,null,null]);

console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
