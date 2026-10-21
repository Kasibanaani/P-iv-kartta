// Jonon 42b (F47 V2, suunnitelma 31): Listan rastisarake valinnaiseksi. b.rasti === false: rastitettuja 0, kaikki ei,
// rivi.rastitettu ei, myöhässä ja seuraava laskevat kaikki rivit; tallennetut rastit säilyvät ja palaavat, kun sarake
// palaa. Puuttuva kenttä = rasti päällä (vanhat projektit ennallaan). Tallennus ja lataus.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,15,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function V(P,f){var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,-400,Math.random()*1000);k.f=KK.kaavaToIds(P,f);return E(P).val(k.id);}
var P=KK.newProject('r');var li=KK.addBlock(P,'lista',{nm:'Tehtävät'});KK.repair(P);
P.st[li.id]={rows:[{id:'r1',tx:'Osta maito',c:true,d:''},{id:'r2',tx:'Soita',c:true,d:'2026-10-10'},{id:'r3',tx:'Siivoa',c:false,d:'2026-10-20'}]};
A.strictEqual(li.rasti,undefined,'uusi Lista ilman kenttää');
A.strictEqual(E(P).val(li.id),2,'oletus: rasti päällä, arvo = rastitettuja');A.strictEqual(V(P,'tehtävät.myöhässä'),0);A.strictEqual(V(P,'tehtävät.rivi1.rastitettu'),true);
li.rasti=false;KK.repair(P);
A.strictEqual(E(P).val(li.id),0,'ilman rastia rastitettuja 0');A.strictEqual(V(P,'tehtävät.rastitettuja'),0);A.strictEqual(V(P,'tehtävät.kaikki'),false);
A.strictEqual(V(P,'tehtävät.rivi1.rastitettu'),false);A.strictEqual(V(P,'tehtävät.rivejä'),3);A.strictEqual(V(P,'tehtävät.rivi2'),'Soita');
A.strictEqual(V(P,'tehtävät.myöhässä'),1,'myöhässä laskee myös ennen rastitetun');A.deepStrictEqual(V(P,'tehtävät.seuraava'),{d:'2026-10-20'});
A.deepStrictEqual(KK.listNyt(P,li.id).map(function(r){return r.c;}),[false,false,false]);
A.deepStrictEqual(KK.listRows(P,li.id).map(function(r){return r.c;}),[true,true,false],'tallennetut rastit säilyvät');
// tallennus ja lataus
var Q=JSON.parse(JSON.stringify(P));KK.repair(Q);A.strictEqual(Q.b[li.id].rasti,false);A.strictEqual(KK.Ev(Q,C).val(li.id),0);
li.rasti=true;KK.repair(P);A.strictEqual(E(P).val(li.id),2,'sarake palaa: rastit palaavat');
console.log('logiikka_112_lista_rasti ok');
