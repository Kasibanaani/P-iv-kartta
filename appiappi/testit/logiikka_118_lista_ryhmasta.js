// Jonon 42e (suunnitelma 31 V3): Listan rivit ryhmästä (b.ryh). Rivit = jäsenet (tagi, kuuluu, kun -rivi), teksti = arvo,
// rasti = jäsenen .rasti (käyttötieto), listan rastitettuja/rivejä/kaikki, rivi1.teksti, #ryhmä.rasti.summa, Poista joukosta
// poistaa rivin, tallennus säilyttää lähteen, poistettu ryhmä → lähde pois, vanha Lista ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,21,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function yl(P,nm,t){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,0,Math.random()*900);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b;}
var P=KK.newProject('l');
var g=yl(P,'Eläimet','kuuluu, kun jäsen sisältää "lehmä"'),ko=yl(P,'Koira','Koira haukkuu\n#eläimet'),ki=yl(P,'Kissa','Kissa naukuu\n#eläimet'),le=yl(P,'Lehmä','Lehmä ammuu');
var J=KK.jkFind(P,'eläimet');A.ok(J&&KK.ylOma(P,g)===J);
var li=KK.addBlock(P,'lista',{v:P.views[0].id,ryh:J});KK.setName(P,li.id,'Lista');KK.repair(P);KK.tick(P,C);
var e=E(P);A.strictEqual(e.val(li.id,'n'),3,'kolme jäsentä riveinä');A.strictEqual(e.prop(li.id,'rivi1.teksti'),'Koira haukkuu');
var rows=KK.listNyt(P,li.id,{jk:e.jkJasenet,val:e.val});A.deepStrictEqual(rows.map(function(r){return r.id;}),[ko.id,ki.id,le.id]);A.ok(rows.every(function(r){return r.jm;}));
A.deepStrictEqual(KK.listRows(P,li.id).map(function(r){return r.id;}),[ko.id,ki.id],'ilman arviointia vain tagit');
// rasti
P.st['ra:'+ki.id]=true;KK.tick(P,C);e=E(P);A.strictEqual(e.val(li.id,'v'),1);A.strictEqual(e.prop(ki.id,'rasti'),true);A.strictEqual(e.prop(ko.id,'rasti'),false);
A.strictEqual(e.prop(li.id,'rivi2.rastitettu'),true);
var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'#eläimet.rasti.summa')});KK.addNode(P,k.id,0,0);KK.repair(P);KK.tick(P,C);A.strictEqual(E(P).val(k.id),1,'#eläimet.rasti.summa');
P.st['ra:'+ko.id]=true;P.st['ra:'+le.id]=true;KK.tick(P,C);A.strictEqual(E(P).val(li.id,'all'),true,'kaikki rastitettu');
// Poista joukosta → rivi pois
P.st['jk:'+J]={};P.st['jk:'+J][ko.id]=false;KK.tick(P,C);A.strictEqual(E(P).val(li.id,'n'),2);
// Palauta (käyttötieto pois) → rastit ja poistot pois
P.st={};KK.tick(P,C);A.strictEqual(E(P).val(li.id,'n'),3);A.strictEqual(E(P).val(li.id,'v'),0);
// tallennus ja vanha muoto
var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.b[li.id].ryh,J);
var vanha=KK.addBlock(P,'lista',{v:P.views[0].id,rivit:'a\nb'});KK.repair(P);KK.tick(P,C);A.ok(!vanha.ryh);A.strictEqual(E(P).val(vanha.id,'n'),2);
li.ryh='j999';KK.repair(P);A.ok(!li.ryh,'tuntematon ryhmä → lähde pois');
// .rasti omat-rekisterissä yleispalikalle, ei muille
A.ok(KK.omat(ko).some(function(x){return x.n==='rasti';}));A.ok(!KK.omat(vanha).some(function(x){return x.n==='rasti';}));
console.log('ok');
