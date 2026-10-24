// Moottori (versio 2, yksi auto): kartta, tarjoukset, hyväksyntä, reitti paikkoina, automaattinen nouto ja vienti, kapasiteetti pakettien mukaan,
// reitti vain pelaajan napauttamista paikoista (enintään 10), Nollaa reitti, riittävä tarjonta, autotasot lainalla, maine, kulut, konkurssi, pelin lopetus, tallennus ja tasapaino.
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
let G=fresh();const M=G.M,co=M.blds.filter(b=>b.kind==='yritys'&&b.col<C.CO_BASE),homes=M.blds.filter(b=>b.kind==='talo');
G.acc=0;
eq('alussa: auto varikolla, kassa, maine 0, 4 paikkaa',[G.car.c===PP.door(G,M.depot),G.cash,G.maine,PP.cap(G)],[true,C.START_CASH,0,4]);
eq('aluksi tarjolla '+C.CO_BASE+' ensimmäistä yritystä',PP.companies(G),C.CO_BASE);
// hyväksyntä ei lisää reitille mitään; pelaaja napauttaa paikat itse
let o=mk(G,co[0],homes[0]);eq('tarjous ei ole reitillä',G.car.route.length,0);
tr('napautus hyväksyy',PP.accept(G,o.id));eq('hyväksyntä ei lisää reitille mitään',G.car.route.length,0);
run(G,5);tr('ilman reittiä auto odottaa varikolla',G.car.c===PP.door(G,M.depot)&&G.car.n<0);
tr('nouto reitille',PP.addPlace(G,PP.door(G,o.from))===true);tr('vienti reitille',PP.addPlace(G,PP.door(G,o.to))===true);
const c0=G.cash;for(let i=0;i<4000&&PP.ord(G,o.id);i++)PP.step(G,0.05);
tr('paketti perillä, kassa kasvoi',!PP.ord(G,o.id)&&G.cash>c0-5);eq('maine +1',G.maine,1);
tr('tyhjä auto jää paikalleen',(()=>{const c=G.car.c;run(G,5);return G.car.c===c&&G.car.n<0&&!G.car.route.length;})());
// reitti: enintään 10 paikkaa, nollaus jättää nykyisen kohteen
G=fresh();const rc=[];for(let i=0;i<M.road.length&&rc.length<12;i+=7)if(M.road[i]&&!rc.includes(i))rc.push(i);
eq('10 paikkaa menee, 11. ei',rc.slice(0,11).map(c=>PP.addPlace(G,c)),Array(10).fill(true).concat(['full']));
eq('reitissä 10 paikkaa napautusjärjestyksessä',G.car.route,rc.slice(0,10));
G=fresh();PP.addPlace(G,rc[0]);eq('sama paikka kahdesti peräkkäin ei mene',PP.addPlace(G,rc[0]),'same');
tr('rakennus ei kelpaa paikaksi',PP.addPlace(G,M.bld.findIndex(x=>x>=0))==='bad');
G=fresh();rc.slice(0,5).forEach(c=>PP.addPlace(G,c));const first=G.car.route[0];
tr('Nollaa reitti: vain nykyinen kohde jää',PP.resetRoute(G)&&G.car.route.length===1&&G.car.route[0]===first);
for(let i=0;i<4000&&G.car.route.length;i++)PP.step(G,0.05);run(G,3);
tr('auto ajaa nykyiseen kohteeseen ja jää sinne',G.car.c===first&&G.car.n<0);
G=fresh();PP.resetRoute(G);eq('tyhjän reitin nollaus ei tee mitään',G.car.route.length,0);
// hyväksytty jää odottamaan, jos noutoa ei ole reitillä
G=fresh();const w=mk(G,co[1],homes[1]);PP.accept(G,w.id);PP.addPlace(G,PP.door(G,w.to));
for(let i=0;i<4000&&G.car.route.length;i++)PP.step(G,0.05);eq('vienti ilman noutoa: keikka odottaa',PP.ord(G,w.id).state,'hyvaksytty');
// tarjontaa riittää: aina jokunen tarjous enemmän kuin auto ehtii hoitaa
for(const seed of [1,2,3]){const g=PP.newGame(seed);let s=0,n=0,low=0;for(let t=0;t<10*60;t+=0.25){PP.bot(g,PP.cap(g)*20);PP.step(g,0.25);
  if(t>60){const k=g.orders.filter(q=>q.state==='tarjous').length;s+=k;n++;if(!k)low++;}}
  console.log('   tarjouksia auki keskimäärin '+(s/n).toFixed(1)+' (siemen '+seed+', botti ottaa kaiken minkä ehtii)');
  tr('tarjouksia jää yli botinkin jälkeen (siemen '+seed+')',s/n>=2&&low/n<0.1);}
// kapasiteetti pakettimäärän mukaan
G=fresh();const big=mk(G,co[0],homes[3],5);tr('liian iso keikka ei mahdu pieneen autoon',!PP.accept(G,big.id));
const x3=mk(G,co[0],homes[3],3),x2=mk(G,co[0],homes[4],2);PP.accept(G,x3.id);PP.accept(G,x2.id);PP.addPlace(G,PP.door(G,co[0].id));
for(let i=0;i<4000&&PP.pk(G,G.car.load)===0;i++)PP.step(G,0.05);
eq('3+2 pakettia samasta paikasta: vain 3 mahtuu',[PP.pk(G,G.car.load),PP.ord(G,x2.id).state],[3,'hyvaksytty']);
[homes[3].door,co[0].door,homes[4].door].forEach(c=>PP.addPlace(G,c));
for(let i=0;i<8000&&(PP.ord(G,x3.id)||PP.ord(G,x2.id));i++)PP.step(G,0.05);
tr('pelaaja ajaa uudestaan noutoon: molemmat hoituvat',!PP.ord(G,x3.id)&&!PP.ord(G,x2.id));
// tarjous vanhenee ilman haittaa
G=fresh();const e=mk(G,co[0],homes[0]);e.exp=G.t+2;run(G,3);eq('vanhentunut tarjous poistuu, maine ennallaan',[PP.ord(G,e.id),G.maine],[null,0]);
// maine ei laske ja kasvattaa tarjontaa
G=fresh();G.maine=0;const r0=PP.offerRate(G),m0=PP.maxOffers(G),s0=PP.maxSize(G);G.maine=60;
tr('maine kasvattaa tarjontaa, yrityksiä ja keikkojen kokoa',PP.offerRate(G)>r0&&PP.maxOffers(G)>m0&&PP.companies(G)>C.CO_BASE&&PP.maxSize(G)>s0);
// isompi auto lainalla
G=fresh();G.cash=T[1].raja-1;tr('laina vaatii kassaa',!PP.upgrade(G));G.cash=T[1].raja;tr('isompi auto',PP.upgrade(G));
eq('käsiraha pois, paikat ja kulut kasvoivat',[G.cash,PP.cap(G),PP.costs(G)],[T[1].raja-T[1].kasi,T[1].cap,T[1].kulu]);
tr('tasot kasvavat kahdella paikalla',T.every((t,i)=>!i||t.cap===T[i-1].cap+2));
// kulut ja konkurssi
G=fresh();const cc=G.cash;run(G,60);eq('kulut minuutissa',Math.round(cc-G.cash),T[0].kulu);
G=fresh();G.cash=1;run(G,5);tr('kassa miinuksella = konkurssi heti',G.over);
// pelin lopetus
G=fresh();const f1=mk(G,co[1],homes[5]),f2=mk(G,co[2],homes[6]);PP.accept(G,f1.id);
tr('lopetus',PP.endGame(G));eq('tarjoukset pois, hyväksytty täydennettiin reitille',[PP.ord(G,f2.id),G.car.route.length>0],[null,true]);
tr('reittiä ei voi muuttaa',!PP.resetRoute(G)&&PP.addPlace(G,G.car.route[0])==='bad');
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
tr('alussa pieni auto tekee voittoa (botti, joka ottaa parhaat)',p00>0&&p00<T[0].kulu*3);tr('iso auto ei kannata alussa',p30<p00);tr('iso auto kannattaa isolla maineella',p3h>p0h*1.15);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
