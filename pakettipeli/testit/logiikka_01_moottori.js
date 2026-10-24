// Moottori (versio 2, yksi auto): kartta, tarjoukset, hyväksyntä, reitti paikkoina, automaattinen nouto ja vienti, kapasiteetti pakettien mukaan,
// hyväksyttyjen täydennys reitin perään, autotasot lainalla, maine, kulut, konkurssi, pelin lopetus, tallennus ja tasapaino.
const PP=require('./pp.js'),C=PP.C,T=PP.TIERS;
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function tr(l,c){eq(l,!!c,true);}
for(const seed of [1,7,123,99999,424242]){const M=PP.genMap(seed),dd=M.blds[M.depot].door;
  tr('kartta '+seed+': kaikki rakennukset tavoitettavissa',M.blds.every(b=>b.door>=0&&PP.dist(M,dd,b.door)<999));
  eq('kartta '+seed+': '+C.COMPANIES+' yritystä ja varikko',[M.blds.filter(b=>b.kind==='yritys').length,M.blds.filter(b=>b.kind==='varikko').length],[C.COMPANIES,1]);
  tr('kartta '+seed+': tieverkko tiheä (vähintään 40 % ruuduista tietä)',Array.from(M.road).filter(Boolean).length>=0.4*C.W*C.H*0.9);}
eq('sama siemen = sama kartta',Array.from(PP.genMap(5).road).join(''),Array.from(PP.genMap(5).road).join(''));
function run(G,s){for(let t=0;t<s;t+=0.05)PP.step(G,0.05);}
function fresh(seed){const G=PP.newGame(seed||7);G.orders=[];G.acc=-1e9;return G;}
function mk(G,from,to,n){const o=PP.spawn(G)||(()=>{throw new Error('ei tarjousta')})();o.from=from.id;o.to=to.id;o.col=from.col;o.n=n||1;o.exp=G.t+1e6;o.pay=10*o.n;return o;}
let G=fresh();const M=G.M,co=M.blds.filter(b=>b.kind==='yritys'&&b.col<4),homes=M.blds.filter(b=>b.kind==='talo');
G.acc=0;
eq('alussa: auto varikolla, kassa, maine 0, 4 paikkaa',[G.car.c===PP.door(G,M.depot),G.cash,G.maine,PP.cap(G)],[true,C.START_CASH,0,4]);
eq('aluksi tarjolla vain 4 ensimmäistä yritystä',PP.companies(G),4);
// hyväksyntä lisää reitin perään, auto noutaa ja vie
let o=mk(G,co[0],homes[0]);eq('tarjous ei ole reitillä',G.car.route.length,0);
tr('napautus hyväksyy',PP.accept(G,o.id));tr('reitille nouto ja vienti',G.car.route.length===2&&G.car.route[0]===PP.door(G,o.from)&&G.car.route[1]===PP.door(G,o.to));
const c0=G.cash;for(let i=0;i<4000&&PP.ord(G,o.id);i++)PP.step(G,0.05);
tr('paketti perillä, kassa kasvoi',!PP.ord(G,o.id)&&G.cash>c0-5);eq('maine +1',G.maine,1);
tr('tyhjä auto jää paikalleen',(()=>{const c=G.car.c;run(G,5);return G.car.c===c&&G.car.n<0;})());
// reitin nollaus ja täydennys
G=fresh();const a=mk(G,co[1],homes[1]),b=mk(G,co[2],homes[2]);PP.accept(G,a.id);PP.accept(G,b.id);
PP.clearRoute(G);eq('Uusi reitti tyhjentää',G.car.route.length,0);
PP.addPlace(G,PP.door(G,b.from));PP.ensure(G);
eq('valittu paikka ensin, puuttuvat perään',G.car.route[0],PP.door(G,b.from));
const sim=PP.simulate(G,G.car.route);tr('täydennetyllä reitillä kaikki hoituu',!sim.load.length&&!sim.missing.length);
G=fresh();const d1=mk(G,co[1],homes[1]),d2=mk(G,co[2],homes[2]);PP.accept(G,d1.id);PP.accept(G,d2.id);const nxt=G.car.route[0];
tr('Uusi reitti: vain seuraava piste jää',PP.keepNext(G)&&G.car.route.length===1&&G.car.route[0]===nxt);
const rc=[];for(let i=0;i<M.road.length&&rc.length<10;i+=5)if(M.road[i])rc.push(i);
PP.applyDraft(G,rc);eq('luonnos (10 paikkaa) seuraavan pisteen perään',G.car.route.slice(0,11),[nxt].concat(rc).slice(0,11));
tr('luonnoksen jälkeen kaikki hyväksytyt hoituvat',(()=>{const s=PP.simulate(G,G.car.route);return !s.load.length&&!s.missing.length;})());
G=fresh();PP.keepNext(G);run(G,3);tr('ilman uutta reittiä auto odottaa',G.car.n<0&&!G.car.route.length);
tr('tiepiste kelpaa paikaksi',PP.addPlace(G,M.road.findIndex(x=>x)));tr('rakennus ei kelpaa paikaksi',!PP.addPlace(G,M.bld.findIndex(x=>x>=0)));
// kapasiteetti pakettimäärän mukaan
G=fresh();const big=mk(G,co[0],homes[3],5);tr('liian iso keikka ei mahdu pieneen autoon',!PP.accept(G,big.id));
const x3=mk(G,co[0],homes[3],3),x2=mk(G,co[0],homes[4],2);PP.accept(G,x3.id);PP.accept(G,x2.id);
for(let i=0;i<4000&&PP.pk(G,G.car.load)===0;i++)PP.step(G,0.05);
eq('3+2 pakettia samasta paikasta: vain 3 mahtuu',[PP.pk(G,G.car.load),PP.ord(G,x2.id).state],[3,'hyvaksytty']);
for(let i=0;i<8000&&(PP.ord(G,x3.id)||PP.ord(G,x2.id));i++)PP.step(G,0.05);
tr('molemmat hoidettiin lopulta (nouto lisättiin uudelleen)',!PP.ord(G,x3.id)&&!PP.ord(G,x2.id));
// tarjous vanhenee ilman haittaa
G=fresh();const e=mk(G,co[0],homes[0]);e.exp=G.t+2;run(G,3);eq('vanhentunut tarjous poistuu, maine ennallaan',[PP.ord(G,e.id),G.maine],[null,0]);
// maine ei laske ja kasvattaa tarjontaa
G=fresh();G.maine=0;const r0=PP.offerRate(G),m0=PP.maxOffers(G),s0=PP.maxSize(G);G.maine=60;
tr('maine kasvattaa tarjontaa, yrityksiä ja keikkojen kokoa',PP.offerRate(G)>r0&&PP.maxOffers(G)>m0&&PP.companies(G)>4&&PP.maxSize(G)>s0);
// isompi auto lainalla
G=fresh();G.cash=T[1].raja-1;tr('laina vaatii kassaa',!PP.upgrade(G));G.cash=T[1].raja;tr('isompi auto',PP.upgrade(G));
eq('käsiraha pois, paikat ja kulut kasvoivat',[G.cash,PP.cap(G),PP.costs(G)],[T[1].raja-T[1].kasi,T[1].cap,T[1].kulu]);
tr('tasot kasvavat kahdella paikalla',T.every((t,i)=>!i||t.cap===T[i-1].cap+2));
// kulut ja konkurssi
G=fresh();const cc=G.cash;run(G,60);eq('kulut minuutissa',Math.round(cc-G.cash),T[0].kulu);
G=fresh();G.cash=1;run(G,5);tr('kassa miinuksella = konkurssi heti',G.over);
// pelin lopetus
G=fresh();const f1=mk(G,co[1],homes[5]),f2=mk(G,co[2],homes[6]);PP.accept(G,f1.id);PP.clearRoute(G);
tr('lopetus',PP.endGame(G));eq('tarjoukset pois, hyväksytty reitillä',[PP.ord(G,f2.id),G.car.route.length>0],[null,true]);
tr('reittiä ei voi muuttaa',!PP.clearRoute(G)&&!PP.addPlace(G,G.car.route[0]));
for(let i=0;i<8000&&!G.final;i++)PP.step(G,0.05);tr('lopputulos syntyi',G.final&&G.final.del===1&&G.final.cash===G.cash);
// tallennus
G=PP.newGame(11);for(let i=0;i<600;i++){PP.bot(G);PP.step(G,0.25);}
const R=PP.repair(JSON.parse(JSON.stringify(PP.save(G))));
eq('tallennus ja palautus',[R.t,R.cash,R.tier,R.orders.length,R.car.c,R.seed],[G.t,G.cash,G.tier,G.orders.length,G.car.c,G.seed]);
tr('palautettu peli jatkuu',(()=>{PP.step(R,5);return R.t>G.t;})());
eq('väärä tiedosto ja versio 1 hylätään',[PP.repair({app:'muu'}),PP.repair({app:'pakettipeli',ver:1,peli:{seed:3,cars:[]}})],[null,null]);
const R2=PP.repair({app:'pakettipeli',ver:2,peli:{seed:3,car:{c:-5,n:-1,route:[-1],load:[]},orders:[]}});
tr('puuttuvat kentät ja virheellinen sijainti korjataan',R2&&R2.cash===C.START_CASH&&R2.car.c===PP.door(R2,R2.M.depot)&&!R2.car.route.length);
// tasapaino botilla
function sim2(tier,maine,seed){const g=PP.newGame(seed);g.cash=1e6;g.tier=tier;for(let t=0;t<15*60;t+=0.25){g.maine=maine;PP.bot(g,PP.cap(g)*20);PP.step(g,0.25);}return (g.cash-1e6)/15;}
const av=(t,m)=>[1,2,3].map(s=>sim2(t,m,s)).reduce((a,b)=>a+b)/3;
const p00=av(0,0),p30=av(3,0),p0h=av(0,100),p3h=av(3,100);
console.log('   tasapaino (tulos/min): pieni auto maine 0 '+p00.toFixed(0)+', maine 100 '+p0h.toFixed(0)+'; kuorma-auto maine 0 '+p30.toFixed(0)+', maine 100 '+p3h.toFixed(0));
tr('alussa pieni auto tekee pientä voittoa',p00>0&&p00<T[0].kulu*1.5);tr('iso auto liian aikaisin = tappio',p30<0);tr('iso auto kannattaa isolla maineella',p3h>p0h);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
