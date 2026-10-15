// Versio 6.9: monta ketjua. Ketjuilla on omat nimet (ainutlaatuiset), ne etenevät toisistaan riippumatta, sama painike voi
// käynnistää monta, pois päältä laitettu ketju pysähtyy heti eikä käynnisty, takaisin päälle laitettu ei käynnisty itsestään,
// ja ketjulista kertoo tilat.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
var P=KK.newProject('monta');var btn=KK.addBlock(P,'nappi',{beh:'kerta'}),nb=KK.addNode(P,btn.id,-400,0),lst=KK.addBlock(P,'lista');
function chain(nm,y,kesto){var k=KK.addBlock(P,'ketju',{nm:nm}),w=KK.addNode(P,k.id,0,y);var t=KK.addBlock(P,'ajastin',{kesto:kesto}),r=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:k.nm});
  var nt=KK.addNode(P,t.id,10,y+40,w.id),nr=KK.addNode(P,r.id,10,y+100,w.id);KK.addLink(P,nt.id,'e',nr.id,'e');KK.addLink(P,nb.id,'e',w.id,'e');return k;}
var a=chain('Aamu',0,5),b=chain('Ilta',300,10),c=chain('Aamu',600,1);
A.strictEqual(c.nm,'Aamu 2','nimet ainutlaatuisia');
function rows(){return KK.listRows(P,lst.id).map(function(r){return r.tx;});}
KK.press(P,btn.id,C);A.strictEqual(KK.chainList(P).filter(function(x){return x.run;}).length,3,'sama painike käynnisti kaikki');
NOW+=1000;KK.chainPoll(P,C);A.deepStrictEqual(rows(),['Aamu 2']);
NOW+=4000;KK.chainPoll(P,C);A.deepStrictEqual(rows(),['Aamu 2','Aamu']);
// pois päältä kesken: pysähtyy heti seuraavassa tickissä
b.off=true;KK.tick(P,C);A.strictEqual(P.st[b.id].run,false);NOW+=10000;KK.chainPoll(P,C);A.deepStrictEqual(rows(),['Aamu 2','Aamu'],'Ilta ei jatkunut');
var L=KK.chainList(P);A.deepStrictEqual(L.map(function(x){return x.nm;}),['Aamu','Aamu 2','Ilta']);A.strictEqual(L[2].off,true);A.strictEqual(L[0].n,1);A.strictEqual(L[0].steps,2);
// pois päältä ei käynnisty
KK.press(P,btn.id,C);A.strictEqual(P.st[b.id].run,false);A.strictEqual(P.st[a.id].run,true);
// takaisin päälle: ei käynnisty itsestään, vaan vasta seuraavasta käynnistyksestä
b.off=false;KK.tick(P,C);A.strictEqual(P.st[b.id].run,false);
NOW+=10000;KK.chainPoll(P,C);KK.press(P,btn.id,C);A.strictEqual(P.st[b.id].run,true);
// ketjut toisistaan riippumatta: yhden pysäytys ei koske muita
KK.chainStop(P,a.id,C);A.strictEqual(P.st[b.id].run,true);A.strictEqual(P.st[c.id].run,true);
// nimen vaihto: ketju löytyy viitteellä, kaavassa ketju.arvo = käynnissä
KK.setName(P,b.id,'Yö');A.strictEqual(b.vt,'yö');var kv=KK.addBlock(P,'kaava');KK.addNode(P,kv.id,800,0);kv.f=KK.kaavaToIds(P,'yö');A.strictEqual(KK.Ev(P,C).val(kv.id),true,'kaava näkee, onko ketju käynnissä');
console.log('logiikka_17_ketjut ok');
