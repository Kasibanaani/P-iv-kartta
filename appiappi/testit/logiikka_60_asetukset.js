// Appi-appi 26 (L2): logiikkapalikoiden asetukset (sisäänmenon nykyinen arvo kentästä tai nuolesta) luettavina
// ominaisuuksina rekisterissä omat(b): ajastin.kesto, muutos.alku/.loppu/.kesto, toista.kerrat, satu.min/.max/.p1…,
// käyrä.x/.t/.xmin/.xmax/.ymin/.ymax/.p1…
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,10,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function val(P,id){return KK.Ev(P,C).val(id);}
function kaava(P,f){var b=KK.addBlock(P,'kaava');KK.addNode(P,b.id,-600,0);b.f=KK.kaavaToIds(P,f);return b;}
function blk(P,k,props){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,0,0);return {b:b,n:n};}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+' → '+b.b.nm);return l;}
function f(P,s){var k=kaava(P,s);KK.repair(P);return val(P,k.id);}
function names(b){return KK.omat(b).map(function(e){return e.n;});}

var P=KK.newProject('asetukset');

// Ajastin: kesto sekunteina yksiköstä riippumatta; nuolesta luettu arvo voittaa kentän
var aj=blk(P,'ajastin',{nm:'Muna',kesto:3,yks:'min'});KK.repair(P);
A.ok(names(aj.b).indexOf('kesto')>=0,'ajastin.kesto rekisterissä');
A.strictEqual(f(P,'muna.kesto'),180,'3 min = 180 s');
var src=blk(P,'muisti',{nm:'Aika',v:'45'});link(P,src,'v',aj,'k');KK.repair(P);
A.strictEqual(f(P,'muna.kesto'),2700,'nuolesta luku palikan yksikössä: 45 min');
aj.b.kesto='';var aj2=blk(P,'ajastin',{nm:'Tyhjä',kesto:''});KK.repair(P);
A.ok(KK.isErr(f(P,'tyhjä.kesto')),'tyhjä kesto on virhe');
var ak=blk(P,'ajastin',{nm:'Herätys',tapa:'klo',klo:'11.00'});KK.repair(P);
A.strictEqual(f(P,'herätys.kesto'),3600,'klo-tapa: aika seuraavaan kellonaikaan');

// Muutos ajassa: alku, loppu, kesto (yksikkö sekunneiksi)
var mu=blk(P,'muutos',{nm:'Liuku',a:5,b:15,kesto:2,yks:'min'});KK.repair(P);
['alku','loppu','kesto','edistyminen','kulunut'].forEach(function(n){A.ok(names(mu.b).indexOf(n)>=0,'muutos.'+n);});
A.strictEqual(f(P,'liuku.alku'),5);A.strictEqual(f(P,'liuku.loppu'),15);A.strictEqual(f(P,'liuku.kesto'),120);
A.strictEqual(f(P,'liuku.kulunut'),0,'kulunut ennallaan');
var lo=blk(P,'muisti',{nm:'Loppu',v:'99'});link(P,lo,'v',mu,'b');KK.repair(P);A.strictEqual(f(P,'liuku.loppu'),99,'loppu nuolesta');

// Toista: kerrat (vain N kertaa -tavassa)
var to=blk(P,'toista',{nm:'Kolmesti',kerrat:3});KK.repair(P);
A.strictEqual(f(P,'kolmesti.kerrat'),3);A.strictEqual(f(P,'kolmesti.kierros'),0,'kierros ennallaan');
var kn=blk(P,'muisti',{nm:'Montako',v:'7'});link(P,kn,'v',to,'k');KK.repair(P);A.strictEqual(f(P,'kolmesti.kerrat'),7);
var tr=blk(P,'toista',{nm:'Riveille',tapa:'rivit'});KK.repair(P);A.ok(names(tr.b).indexOf('kerrat')<0,'riveille ei kerrat');

// Satunnaisluku: min ja max (myös pienin/suurin), painot vain muotojakaumassa
var sa=blk(P,'satu',{nm:'Noppa',min:1,max:6});KK.repair(P);
A.ok(names(sa.b).indexOf('min')>=0&&names(sa.b).indexOf('p1')<0,'tasainen: min, ei painoja');
A.strictEqual(f(P,'noppa.min'),1);A.strictEqual(f(P,'noppa.max'),6);A.strictEqual(f(P,'noppa.pienin'),1);A.strictEqual(f(P,'noppa.suurin'),6);
var yl=blk(P,'muisti',{nm:'Yläraja',v:'20'});link(P,yl,'v',sa,'max');KK.repair(P);A.strictEqual(f(P,'noppa.max'),20,'max nuolesta');
sa.b.jak='muoto';sa.b.pn=3;sa.b.pw=[10,50,90];KK.repair(P);
A.ok(names(sa.b).indexOf('p3')>=0&&names(sa.b).indexOf('p4')<0,'kolme painoa');A.strictEqual(f(P,'noppa.p3'),90);

// Käyrä: rajat, syöte, kohta ja portaat
var ky=blk(P,'kayra',{nm:'Kaari',a:'5',xmin:0,xmax:10,ymin:0,ymax:100,pn:3,pw:[0,50,100]});KK.repair(P);
['x','t','xmin','xmax','ymin','ymax','p1','p3'].forEach(function(n){A.ok(names(ky.b).indexOf(n)>=0,'käyrä.'+n);});
A.strictEqual(f(P,'kaari.xmax'),10);A.strictEqual(f(P,'kaari.ymax'),100);A.strictEqual(f(P,'kaari.xloppu'),10,'muu nimi');
A.strictEqual(f(P,'kaari.x'),5);A.strictEqual(f(P,'kaari.kohta'),0.5);A.strictEqual(f(P,'kaari.p2'),50);
var xr=blk(P,'muisti',{nm:'Leveys',v:'20'});link(P,xr,'v',ky,'xmax');KK.repair(P);A.strictEqual(f(P,'kaari.xmax'),20,'raja nuolesta');

// Rekisterin calc-arvo on sama kuin kaavan (tarkastelijan Ominaisuudet-osio käyttää calcProp:ia)
var E=KK.Ev(P,C);A.strictEqual(E.calcProp(aj.b.id,'kesto'),2700);A.strictEqual(E.calcProp(mu.b.id,'kesto'),120);A.strictEqual(E.calcProp(to.b.id,'kerrat'),7);
A.strictEqual(E.calcProp(sa.b.id,'min'),1);A.strictEqual(E.calcProp(ky.b.id,'xmax'),20);
A.strictEqual(E.calcProp(mu.b.id,'kulunut'),0);A.strictEqual(E.calcProp(to.b.id,'kierros'),0);

// Kehä: kaava, joka lukee toista.kerrat ja ohjaa samaa kohtaa, antaa virheen eikä jää silmukkaan
var P2=KK.newProject('kehä');var t2=blk(P2,'toista',{nm:'T',kerrat:2});var kk=kaava(P2,'t.kerrat + 1');var kn2=KK.addNode(P2,kk.id,-600,40);
A.ok(KK.addLink(P2,kn2.id,'v',t2.n.id,'k'),'nuoli kaavasta');KK.repair(P2);
A.ok(KK.isErr(val(P2,kk.id)),'kehä on virhe');

// Ominaisuuksia ei voi ohjata o_-kohdalla (ohjaus on sisäänmenon nuoli)
[aj,mu,to,sa,ky].forEach(function(x){KK.omat(x.b).forEach(function(e){if(['kesto','alku','loppu','kerrat','min','max','xmin','xmax'].indexOf(e.p)>=0)A.ok(!e.o,x.b.nm+'.'+e.p+' ei o_');});});
console.log('ok logiikka_60_asetukset');
