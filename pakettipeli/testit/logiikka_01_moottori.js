// Moottori: kartta, reitinhaku, tilaukset, kapasiteettisääntö, ennakkotilaus, maine, kulut, päivän lopetus, tallennus.
const PP=require('./pp.js'),C=PP.C;
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function tr(l,c){eq(l,!!c,true);}
// kartta: deterministinen, kaikki ovet samassa tieverkossa, varikko ja yritykset olemassa
for(const seed of [1,7,123,99999,424242]){const M=PP.genMap(seed),dd=M.blds[M.depot].door;
  tr('kartta '+seed+': kaikki rakennukset tavoitettavissa varikolta',M.blds.every(b=>b.door>=0&&PP.dist(M,dd,b.door)<999));
  eq('kartta '+seed+': '+C.COMPANIES+' yritystä ja yksi varikko',[M.blds.filter(b=>b.kind==='yritys').length,M.blds.filter(b=>b.kind==='varikko').length],[C.COMPANIES,1]);}
eq('sama siemen = sama kartta',Array.from(PP.genMap(5).road).join(''),Array.from(PP.genMap(5).road).join(''));
tr('eri siemen = eri kartta',Array.from(PP.genMap(5).road).join('')!==Array.from(PP.genMap(6).road).join(''));
// apu: pakotettu tilaus
function mk(G,from,to,pre){const o=PP.spawn(G);o.from=from.id;o.to=to.id;o.col=from.col;if(pre){o.ready=G.t+30;}else o.ready=G.t;
  const d=PP.dist(G.M,from.door,to.door);o.due=o.ready+C.PATIENCE+d/C.SPEED*C.PATIENCE_K;o.pay=Math.round(C.PAY_BASE+C.PAY_PER*d);return o;}
function run(G,s){for(let t=0;t<s;t+=0.05)PP.step(G,0.05);}
let G=PP.newGame(7);G.rate=0;const M=G.M,co=M.blds.filter(b=>b.kind==='yritys'),homes=M.blds.filter(b=>b.kind==='talo');
eq('alussa yksi auto varikolla, kassa ja maine',[G.cars.length,G.cars[0].c===PP.depotDoor(G),G.cash,G.maine],[1,true,C.START_CASH,C.START_MAINE]);
// nouto + vienti
let o=mk(G,co[0],homes[0]);const c=G.cars[0];
tr('tilauksen anto autolle',PP.assign(G,c.id,o.id));
eq('reitille nouto ja vienti',c.stops.map(s=>s.k),['n','v']);
tr('samaa tilausta ei voi antaa kahdesti',!PP.assign(G,c.id,o.id));
const cash0=G.cash;let t0=G.t;
for(let i=0;i<4000&&o.state!=='valmis';i++){PP.step(G,0.05);o=G.orders.find(q=>q.id===o.id)||{state:'valmis'};}
tr('paketti toimitettiin ja kassa kasvoi (miinus kulut)',G.cash>cash0-C.KULU);
tr('nopea toimitus nosti mainetta',G.maine>C.START_MAINE);
eq('toimituksia 1',G.tot.del,1);
// juoksevat kulut
G=PP.newGame(7);G.rate=0;let cc=G.cash;run(G,60);eq('kulut minuutissa = autot × KULU',Math.round(cc-G.cash),C.KULU);
// auton osto ja myynti
G=PP.newGame(7);G.rate=0;tr('auton osto',PP.buyCar(G));eq('kassa ostosta',G.cash,C.START_CASH-C.CAR_PRICE);eq('kaksi autoa',G.cars.length,2);
tr('tyhjän auton myynti',PP.sellCar(G));eq('kassa myynnistä',G.cash,C.START_CASH-C.CAR_PRICE+C.SELL_BACK);tr('viimeistä ei myydä',!PP.sellCar(G));
G.cash=10;tr('ei osteta ilman rahaa',!PP.buyCar(G));
// kapasiteetti: täysi auto siirtää noudon loppuun
G=PP.newGame(7);G.rate=0;const car=G.cars[0];
const os=[];for(let i=0;i<C.CAP;i++){const q=mk(G,co[1],homes[1]);os.push(q);PP.assign(G,car.id,q.id);}
const extra=mk(G,co[1],homes[2]);PP.assign(G,car.id,extra.id);
// järjestetään niin, että ylimääräinen nouto on heti ensimmäisten noutojen jälkeen
car.stops=car.stops.filter(s=>s.k==='n').concat(car.stops.filter(s=>s.k==='v'));
eq('suunnitelma näyttää ylityksen',Math.max(...PP.loadPlan(car)),C.CAP+1);
for(let i=0;i<4000&&car.load.length<C.CAP;i++)PP.step(G,0.05);
run(G,1);
eq('täynnä: ylimääräinen nouto ja sen vienti listan loppuun',car.stops.slice(-2).map(s=>[s.k,s.o]),[['n',extra.id],['v',extra.id]]);
eq('kyydissä enintään kapasiteetti',car.load.length<=C.CAP,true);
// vienti ei voi olla ennen noutoa, kyydissä olevan vientiä ei poisteta
const vi=car.stops.findIndex(s=>s.k==='v'&&car.load.includes(s.o));
tr('kyydissä olevan paketin vientiä ei voi poistaa',!PP.removeStop(G,car.id,vi));
const ni=car.stops.findIndex(s=>s.k==='n');
tr('vientiä ei voi siirtää noutonsa eteen',!PP.moveStop(G,car.id,ni+1,-1)||car.stops[ni].k!=='v');
tr('noudon poisto palauttaa tilauksen avoimeksi',PP.removeStop(G,car.id,ni)&&PP.ord(G,extra.id).car==null);
tr('tiepiste lisätään ja poistetaan',PP.addPoint(G,car.id,PP.depotDoor(G))&&PP.removeStop(G,car.id,car.stops.length-1));
tr('tiepistettä ei lisätä muualle kuin tielle',!PP.addPoint(G,car.id,M.bld.findIndex(b=>b>=0)));
// ennakkotilaus: auto odottaa noutopaikalla
G=PP.newGame(7);G.rate=0;const pre=mk(G,co[2],homes[3],true);PP.assign(G,G.cars[0].id,pre.id);
run(G,20);eq('ennakkotilausta ei noudeta ennen aikaa',PP.ord(G,pre.id).state,'odottaa');
run(G,20);tr('ennakkotilaus noudettu, kun kello kului',['kyydissa','valmis',undefined].includes((PP.ord(G,pre.id)||{}).state));
// peruuntuminen ja myöhästyminen laskevat mainetta
G=PP.newGame(7);G.rate=0;const f=mk(G,co[3],homes[4]);const m0=G.maine;run(G,f.due-G.t+0.5);
eq('noutamaton tilaus peruuntui',PP.ord(G,f.id),null);eq('maine putosi peruuntumisesta',Math.round(m0-G.maine),C.MAINE_FAIL);
// ruuhkavuoto: liikaa avoimia tilauksia
G=PP.newGame(7);G.rate=0;for(let i=0;i<6;i++)mk(G,co[i%co.length],homes[i]);const mq=G.maine;run(G,30);
tr('ruuhka (6 avointa, 1 auto) valuttaa mainetta',G.maine<mq-0.5);
// maine kertoimena ja hintana
eq('maine-kerroin 100/70/0',[PP.factor(100),Math.round(PP.factor(70)*100)/100,PP.factor(0)],[1,0.49,0]);
eq('hinta maineella 100/50',[PP.priceF(100),PP.priceF(50)],[1,0.75]);
G=PP.newGame(7);G.maine=0;G.rate=12;run(G,60);eq('maine 0: ei tilauksia',G.tot.del+G.orders.length,0);tr('maine palautuu hitaasti',G.maine>0.5&&G.maine<=C.REGEN_TO);
// päivän lopetus
G=PP.newGame(7);G.rate=0;const a1=mk(G,co[0],homes[5]),a2=mk(G,co[1],homes[6]);PP.assign(G,G.cars[0].id,a1.id);PP.addPoint(G,G.cars[0].id,PP.depotDoor(G));
tr('päivän lopetus',PP.endDay(G));eq('antamaton peruuntui ilman mainehaittaa',[PP.ord(G,a2.id).state,G.tot.canc],['peruttu',0]);
eq('tiepisteet pois',G.cars[0].stops.some(s=>s.k==='p'),false);tr('reittiä ei voi muuttaa',!PP.removeStop(G,G.cars[0].id,0));
for(let i=0;i<6000&&!G.summary;i++)PP.step(G,0.05);
tr('yhteenveto syntyi, kun ajot loppuivat',G.summary&&G.summary.del===1);
tr('uusi päivä jatkuu',PP.newDay(G)&&G.day===2&&!G.summary);
// kaatuminen
G=PP.newGame(7);G.rate=0;G.cash=5;run(G,10);tr('kassa miinuksella = peli loppui',G.over);
// tallennus ja vanhan muodon korjaus
G=PP.newGame(11);G.rate=3;for(let i=0;i<600;i++){PP.bot(G);PP.step(G,0.25);}
const d=JSON.parse(JSON.stringify(PP.save(G)));const R=PP.repair(d);
eq('tallennus ja palautus säilyttää tilan',[R.t,R.cash,R.cars.length,R.orders.length,R.seed],[G.t,G.cash,G.cars.length,G.orders.length,G.seed]);
tr('palautettu peli jatkuu',(()=>{PP.step(R,5);return R.t>G.t;})());
eq('väärä tiedosto hylätään',[PP.repair({app:'muu'}),PP.repair(null)],[null,null]);
const old={app:'pakettipeli',ver:1,peli:{seed:3,cars:[{id:1,c:-5,n:-1,f:0,stops:[{k:'p',c:-1}],load:[]}],orders:[]}};
const R2=PP.repair(old);tr('puuttuvat kentät täydennetään ja virheellinen sijainti korjataan',R2&&R2.cash===C.START_CASH&&R2.cars[0].c===PP.depotDoor(R2)&&!R2.cars[0].stops.length);
// tasapaino: botti yhdellä autolla kohtuutahdilla tekee ohuen voiton, ylikuorma vie tappiolle
function sim(cars,rate,seed){const g=PP.newGame(seed);g.cash=1e6;for(let i=1;i<cars;i++)PP.buyCar(g);g.cash=1e6;g.rate=rate;for(let t=0;t<20*60;t+=0.25){PP.bot(g);PP.step(g,0.25);}return (g.cash-1e6)/20;}
const good=[1,2,3].map(s=>sim(1,2,s)).reduce((a,b)=>a+b)/3,bad=[1,2,3].map(s=>sim(1,8,s)).reduce((a,b)=>a+b)/3;
console.log('   tasapaino: 1 auto 2/min '+good.toFixed(1)+'/min, 1 auto 8/min '+bad.toFixed(1)+'/min');
tr('1 auto, 2/min: pieni voitto',good>0&&good<C.KULU*0.6);tr('1 auto, 8/min: tappiota',bad<0);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
