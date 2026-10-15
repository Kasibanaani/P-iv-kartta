// Versio 7.6: ajastin kellonaikaan ja ketjun käynnistys projektia avattaessa.
// Kellonaika: seuraava kerta aloituksen jälkeen (tänään tai huomenna), kesäajan vaihde, virheelliset ajat, päivittäinen
// toisto, eikä kiinni jääneitä kierroksia tehdä, kun appi on ollut kiinni monta päivää. Avaus: käynnistyy kerran,
// pois päältä ei käynnisty, käynnissä oleva jatkaa ennallaan (tai aloittaa alusta asetuksen mukaan).
process.env.TZ='Europe/Helsinki';
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function mk(){var P=KK.newProject('k');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista');return {P:P,k:k,w:w,lst:lst};}
function S(X,props,x,y){var b=KK.addBlock(X.P,props.k,props);return KK.addNode(X.P,b.id,x||0,y||0,X.w.id);}
function L(X,a,b,p){return KK.addLink(X.P,a.id,p||'e',b.id,'e');}
function rows(X){return KK.listRows(X.P,X.lst.id).map(function(r){return r.tx;});}
function at(d,h,m){return new Date(2026,9,d,h,m||0,0).getTime();}

// Kellonajan lukeminen
A.deepStrictEqual(KK.parseKlo('7'),{h:7,m:0});A.deepStrictEqual(KK.parseKlo('07:30'),{h:7,m:30});A.deepStrictEqual(KK.parseKlo(' 23.59 '),{h:23,m:59});
['24.00','7.5','7.60','','aamu',null].forEach(function(s){A.strictEqual(KK.parseKlo(s),null,String(s));});
// Seuraava kerta: tänään, jos kello ei ole vielä ohi; muuten huomenna. Tasan sama hetki → huomenna.
A.strictEqual(KK.nextClock(at(15,6,0),{h:7,m:0}),at(15,7));A.strictEqual(KK.nextClock(at(15,9,0),{h:7,m:0}),at(16,7));
A.strictEqual(KK.nextClock(at(15,7,0),{h:7,m:0}),at(16,7));A.strictEqual(KK.nextClock(at(31,23,30),{h:0,m:15}),new Date(2026,10,1,0,15).getTime(),'kuukauden vaihde');
// Kesäaika päättyy 25.10.2026: kello 7.00 on silti 7.00 paikallista aikaa (väli 23 h eikä 22 h).
var dst=KK.nextClock(at(24,9,0),{h:7,m:0});A.strictEqual(new Date(dst).getHours(),7);A.strictEqual(dst-at(24,9,0),23*3600000);

// Ajastin kellonaikaan: kesto ja kuvaus
var X=mk(),P=X.P;var tn=S(X,{k:'ajastin',tapa:'klo',klo:'7.00'}),tb=P.b[tn.p];
A.strictEqual(KK.timerMs(P,tb.id,C),22*3600000,'9.00 → huomenna 7.00');A.strictEqual(KK.timerLabel(P,tb,C),'klo 7.00');
tb.klo='';A.ok(/kirjoita kellonaika/.test(KK.timerMs(P,tb.id,C).err));A.strictEqual(KK.timerLabel(P,tb,C),'klo ?');
tb.klo='25.00';A.ok(/ei kelpaa/.test(KK.timerMs(P,tb.id,C).err));
A.ok(KK.chainIssues(P,X.k.id,C).some(function(x){return !x.info&&/ei kelpaa/.test(x.t);}),'virhe näkyy ennen ajoa');
KK.chainStart(P,X.k.id,C);A.ok(/ei kelpaa/.test(P.st[X.k.id].err),'virheellinen kellonaika pysäyttää ketjun');
tb.tapa='kesto';tb.kesto=10;A.strictEqual(KK.timerMs(P,tb.id,C),10000,'kesto-tapa toimii ennallaan');A.strictEqual(KK.timerLabel(P,tb,C),'10 s');
// Korjaus: vanha ajastin ilman tapaa saa tavan kesto ja toimii ennallaan; rikkinäinen tapa → kesto.
var old=KK.addBlock(P,'ajastin',{kesto:5});KK.addNode(P,old.id,0,200,X.w.id);delete old.tapa;delete old.klo;KK.repair(P);A.strictEqual(old.tapa,'kesto');A.strictEqual(KK.timerMs(P,old.id,C),5000);
tb.tapa='jotain';tb.klo=7;KK.repair(P);A.strictEqual(tb.tapa,'kesto');A.strictEqual(tb.klo,'');

// Päivittäinen herätys 3 kertaa: toista → ajastin klo 7.00 → rivi → takaisin toistoon; lopuksi ”loppu”.
X=mk();P=X.P;var to=S(X,{k:'toista',kerrat:3}),aj=S(X,{k:'ajastin',tapa:'klo',klo:'7.00'},0,60),he=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'Herätys'},0,120),lo=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'loppu'},260,60);
L(X,to,aj,'e');L(X,aj,he);L(X,he,to);L(X,to,lo,'m');
A.ok(!KK.chainIssues(P,X.k.id,C).some(function(x){return !x.info;}));
NOW=at(15,9);KK.chainStart(P,X.k.id,C);var cs=P.st[X.k.id];A.deepStrictEqual(rows(X),[]);A.strictEqual(cs.tk[0].u,at(16,7),'odottaa huomiseen 7.00');
A.strictEqual(KK.Ev(P,C).val(aj.p,'j'),22*3600,'jäljellä sekunteina');
NOW=at(16,6,59);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),[]);
// ”Appi suljetaan” (JSON-kierros) ja avataan 7.00: herätys kerran, seuraava huomenna.
P=KK.repair(JSON.parse(JSON.stringify(P)));X.P=P;NOW=at(16,7);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['Herätys']);A.strictEqual(P.st[X.k.id].tk[0].u,at(17,7));
// Appi kiinni viisi päivää: avattaessa yksi herätys (ei viittä), ja seuraava on vasta huomenna 7.00.
NOW=at(22,12);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['Herätys','Herätys'],'ei kiinni jääneitä kierroksia');A.strictEqual(P.st[X.k.id].tk[0].u,at(23,7));
NOW=at(23,7,0);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['Herätys','Herätys','Herätys','loppu']);A.strictEqual(P.st[X.k.id].run,false);

// Käynnisty, kun projekti avataan
X=mk();P=X.P;S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'Avattu'});
A.ok(KK.chainIssues(P,X.k.id,C).some(function(x){return /Mikään ei vielä käynnistä/.test(x.t);}));
A.strictEqual(KK.chainOpen(P,C),0,'ilman asetusta ei käynnisty');A.deepStrictEqual(rows(X),[]);
X.k.avaus=true;A.ok(!KK.chainIssues(P,X.k.id,C).some(function(x){return /Mikään ei vielä käynnistä/.test(x.t);}),'avaus on käynnistäjä');
A.strictEqual(KK.chainOpen(P,C),1);A.deepStrictEqual(rows(X),['Avattu']);A.strictEqual(P.st[X.k.id].n,1);
KK.chainOpen(P,C);A.deepStrictEqual(rows(X),['Avattu','Avattu'],'käynnistyy aina, kun projekti avataan');
X.k.off=true;A.strictEqual(KK.chainOpen(P,C),0);A.strictEqual(rows(X).length,2,'pois päältä ei käynnisty');X.k.off=false;
// Käynnissä oleva ketju (odottaa ajastinta): ”jatkaa ennallaan” ohittaa avauksen, ”aloittaa alusta” aloittaa alusta.
X=mk();P=X.P;X.k.avaus=true;var a1=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'A'}),t1=S(X,{k:'ajastin',kesto:1,yks:'h'},0,60),b1=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'B'},0,120);L(X,a1,t1);L(X,t1,b1);
NOW=at(15,9);KK.chainOpen(P,C);var u0=P.st[X.k.id].tk[0].u;A.deepStrictEqual(rows(X),['A']);
NOW=at(15,9,30);A.strictEqual(KK.chainOpen(P,C),0);A.strictEqual(P.st[X.k.id].tk[0].u,u0,'ajastin jatkaa ennallaan');A.deepStrictEqual(rows(X),['A']);
X.k.uusi='alusta';KK.chainOpen(P,C);A.deepStrictEqual(rows(X),['A','A']);A.strictEqual(P.st[X.k.id].tk[0].u,at(15,10,30),'alusta: uusi tunti');
// Korjaus: avaus pysyy kyllä/ei-tietona, puuttuva pysyy puuttuvana.
X.k.avaus='x';KK.repair(P);A.strictEqual(X.k.avaus,true);var k3=KK.addBlock(P,'ketju');KK.repair(P);A.strictEqual(k3.avaus,undefined);
console.log('logiikka_25_kello_avaus ok');
