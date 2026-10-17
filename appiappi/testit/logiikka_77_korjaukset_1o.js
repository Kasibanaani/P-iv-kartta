// Jonon 1o (kartoitus 6): Peliohjaimen tapahtuma irrotettu, Liikkeen kääntyvyys, liukkaus, kiihtyminen ja jarrutus
// ominaisuuksina (rekisteri, kaava, Aseta, vaikutus liikkeeseen), kuvasilmukka jatkuu, kun kello alkaa käydä kuvan
// lopun tickissä, ja käy kun -ehto, jonka tapahtuma muuttaa, käynnistää kellon samassa tickissä. Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o||{});N(P,b);return b;}
function L(P,a,ap,b,bp){var l=KK.addLink(P,N(P,a).id,ap,N(P,b).id,bp);A.ok(l,'nuoli '+ap+' → '+bp);return l;}
function kaava(P,f){var b=LB(P,'kaava');b.f=KK.kaavaToIds(P,f);return b;}
function run(P,s,dt){dt=dt||0.02;var act=false;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;act=KK.frame(P,dt,C);}return act;}
function near(a,b,e,m){A.ok(Math.abs(a-b)<=e,(m||'')+': '+a+' ≠ '+b+' (±'+e+')');}

// --- 1. Peliohjain: napin nousu on irrotettu kuten Painikkeella; sisäinen kohta ir pysyy ---
var P=KK.newProject('o');var oh=LB(P,'pohj');KK.repair(P);
var ir=KK.portsBase(oh).outs.filter(function(o){return o.p==='ir';})[0];A.ok(ir,'kohta ir');A.strictEqual(ir.n,'irrotettu');
var nap=KK.addBlock(P,'nappi',{v:P.views[0].id,beh:'pida'});A.ok(KK.portsBase(nap).outs.some(function(o){return o.n==='irrotettu';}),'Painikkeella sama nimi');

// --- 2. Liikkeen vauhdin asetukset rekisterissä ---
P=KK.newProject('l');var vw=P.views[0].id;
var auto=KK.addBlock(P,'muoto',{v:vw});auto.x=0;auto.y=0;auto.w=20;auto.h=20;
var li=LB(P,'liike',{o:auto.id,ohj:'auto'});KK.setName(P,li.id,'Auto');KK.repair(P);
['kääntyvyys','kaantyvyys','liukkaus','kiihtyminen','jarrutus','kitka'].forEach(function(n){var e=KK.omFind(li,n);A.ok(e,'autolla '+n);A.ok(e.o,n+' on ohjattava');});
A.strictEqual(E(P).omiNum(li.id,'kääntyvyys',-1),180,'kääntyvyys oletus 180');
A.strictEqual(E(P).omiNum(li.id,'liukkaus',-1),0);A.strictEqual(E(P).omiNum(li.id,'kiihtyminen',-1),0);A.strictEqual(E(P).omiNum(li.id,'jarrutus',-1),0);
var la=KK.addBlock(P,'liike',{ohj:'tatti'});A.ok(!KK.omFind(la,'kääntyvyys'),'kääntyvyys vain autolla');A.ok(KK.omFind(la,'kiihtyminen')&&KK.omFind(la,'liukkaus'));
var lr=KK.addBlock(P,'liike',{ohj:'reitti'});A.ok(KK.omFind(lr,'kiihtyminen')&&KK.omFind(lr,'jarrutus'),'reitillä kiihtyminen ja jarrutus');A.ok(!KK.omFind(lr,'liukkaus'),'reitti ei liu\'u');
var lu=KK.addBlock(P,'liike',{ohj:'ruutu'});['kiihtyminen','jarrutus','liukkaus','kääntyvyys'].forEach(function(n){A.ok(!KK.omFind(lu,n),'ruutuliikkeellä ei '+n);});
// Perusarvo paneelista näkyy kaavassa.
li.ka='1,5';li.kaa=90;KK.repair(P);var kv=kaava(P,'auto.kiihtyminen + auto.kääntyvyys');A.strictEqual(E(P).val(kv.id),91.5,'kaava lukee perusarvot');
delete li.ka;li.kaa=180;KK.repair(P);

// --- 3. Vaikutus: kaasu ja ohjaus nuolista ---
var kaa=LB(P,'muisti',{v:1}),ohj=LB(P,'muisti',{v:0});L(P,kaa,'v',li,'kaa');L(P,ohj,'v',li,'ohj');KK.repair(P);
function nop(){return E(P).val(li.id,'nop');}
function alusta(){KK.liikeAlkuun(P,li.id);KK.resetOmi(P,li.id,'kiihtyminen');KK.resetOmi(P,li.id,'jarrutus');KK.resetOmi(P,li.id,'liukkaus');KK.resetOmi(P,li.id,'kääntyvyys');KK.setVal(P,kaa.id,1,C);KK.setVal(P,ohj.id,0,C);}
run(P,0.1);near(nop(),200,0.5,'kiihtyminen 0: heti huippuun');
alusta();A.ok(KK.setOmi(P,li.id,'kiihtyminen',2),'Aseta kiihtyminen');A.strictEqual(E(P).omiNum(li.id,'kiihtyminen',-1),2);
run(P,0.5);near(nop(),50,3,'kiihtyminen 2 s: puolessa sekunnissa neljännes');
// Jarrutus: kaasu pois, jarrutus 1 s → 0,5 s:ssa puolet.
KK.resetOmi(P,li.id,'kiihtyminen');run(P,0.2);near(nop(),200,0.5);KK.setOmi(P,li.id,'jarrutus',1);KK.setVal(P,kaa.id,0,C);run(P,0.5);near(nop(),100,4,'jarrutus 1 s');
// Kääntyvyys: 0 = ei käänny, 360 = kaksi kertaa niin paljon kuin 180.
function kaanto(k){alusta();run(P,0.3);if(k!=null)KK.setOmi(P,li.id,'kääntyvyys',k);var h0=E(P).val(li.id,'suu');KK.setVal(P,ohj.id,1,C);run(P,0.2);var d=((E(P).val(li.id,'suu')-h0)%360+360)%360;KK.setVal(P,ohj.id,0,C);return d;}
var k180=kaanto(null),k0=kaanto(0),k360=kaanto(360);
near(k180,36,1,'180 °/s × 0,2 s');near(k0,0,1e-9,'kääntyvyys 0');near(k360,2*k180,1,'kääntyvyys 360');
// Liukkaus 100: todellinen nopeus seuraa viiveellä.
alusta();KK.setOmi(P,li.id,'liukkaus',100);run(P,0.1);A.ok(nop()<30,'liukkaalla vauhti tulee viiveellä: '+nop());
// Nuoli kohtaan o_kiihtyminen ohjaa jatkuvasti (kohta avautuu Ominaisuudet-osiosta: b.ohk).
alusta();li.ohk=['kiihtyminen'];KK.repair(P);var k4=LB(P,'muisti',{v:4});L(P,k4,'v',li,'o_kiihtyminen');A.strictEqual(E(P).omiNum(li.id,'kiihtyminen',-1),4,'nuoli voittaa');
run(P,0.5);near(nop(),25,3,'kiihtyminen 4 s nuolesta');
A.ok(!li.hasOwnProperty('kiihtyminen'),'ei uutta tallennuskenttää');

// --- 4. Kuvasilmukka: kello alkaa käydä samassa kuvassa, jossa viimeinen liike pysähtyy ---
P=KK.newProject('k');vw=P.views[0].id;var pal=KK.addBlock(P,'muoto',{v:vw});pal.x=0;pal.y=0;pal.w=20;pal.h=20;
var pl=LB(P,'liike',{o:pal.id});pl.kit=100;KK.setName(P,pl.id,'Pallo');
var ke=LB(P,'kello');KK.setName(P,ke.id,'Kello');KK.repair(P);var eh=kaava(P,'pallo.liikkuu = ei');L(P,eh,'v',ke,'c');
var kun=LB(P,'kun'),kk=kaava(P,'kello.kulunut >= 1');L(P,kk,'v',kun,'c');var m=LB(P,'muisti',{v:0}),t=LB(P,'tee',{do:'lisaa',o:m.id,v:1});L(P,kun,'e',t,'e');KK.repair(P);
KK.tick(P,C);A.ok(P.st[ke.id]&&P.st[ke.id].run,'pallo ei liiku: kello käy');
KK.kelloKomento(P,ke.id,'x',C);KK.kelloKomento(P,ke.id,'n',C);KK.setOmi(P,pl.id,'vauhtix',100);T+=20;KK.frame(P,0.02,C);A.ok(!P.st[ke.id].run,'liikkuu: kello seis');
var act=true,i=0;while(i<100&&!(P.st[ke.id]&&P.st[ke.id].run)){T+=20;act=KK.frame(P,0.02,C);i++;}
A.ok(P.st[ke.id].run,'pysähtyi, kello käynnistyi');A.ok(act,'sama kuva palauttaa käynnissä: kuvasilmukka jatkuu');A.ok(KK.aikaKay(P));
run(P,1.1);A.strictEqual(E(P).val(m.id),1,'KUN kello >= 1 laukesi kuvasilmukassa');

// --- 5. Käy kun -ehto, jonka tapahtuma muuttaa saman tickin aikana ---
P=KK.newProject('e');var a=LB(P,'muisti',{v:0}),lip=LB(P,'muisti',{v:0});KK.setName(P,a.id,'A');KK.setName(P,lip.id,'Lippu');
var ku=LB(P,'kun'),kx=kaava(P,'a > 5');L(P,kx,'v',ku,'c');var as=LB(P,'tee',{do:'aseta',o:lip.id,v:1});L(P,ku,'e',as,'e');
var k2=LB(P,'kello');KK.setName(P,k2.id,'K2');var e2=kaava(P,'lippu = 1');KK.repair(P);L(P,e2,'v',k2,'c');KK.repair(P);KK.tick(P,C);
A.ok(!(P.st[k2.id]&&P.st[k2.id].run));KK.setVal(P,a.id,10,C);KK.tick(P,C);A.strictEqual(E(P).val(lip.id),1,'KUN asetti lipun');
A.ok(P.st[k2.id]&&P.st[k2.id].run,'kello käynnistyi samassa tickissä');A.ok(KK.aikaKay(P));

console.log('ok: irrotettu, Liikkeen vauhdin asetukset ohjattavina, kello herättää kuvasilmukan, käy kun samassa tickissä');
