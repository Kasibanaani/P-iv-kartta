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
KK.setOmi(P,ki.id,'rasti',true);KK.tick(P,C);e=E(P);A.strictEqual(e.val(li.id,'v'),1);A.strictEqual(e.prop(ki.id,'rasti'),true);A.strictEqual(e.prop(ko.id,'rasti'),false);
A.strictEqual(e.prop(li.id,'rivi2.rastitettu'),true);
var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'#eläimet.rasti.summa')});KK.addNode(P,k.id,0,0);KK.repair(P);KK.tick(P,C);A.strictEqual(E(P).val(k.id),1,'#eläimet.rasti.summa');
KK.setOmi(P,ko.id,'rasti',true);KK.setOmi(P,le.id,'rasti',true);KK.tick(P,C);A.strictEqual(E(P).val(li.id,'all'),true,'kaikki rastitettu');
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
// Jonon 42e2: 113:n ra:-avain luetaan (repair siirtää .rasti-käyttöarvoksi)
li.ryh=J;KK.repair(P);P.st={};P.st['ra:'+ki.id]=true;KK.repair(P);A.ok(!P.st['ra:'+ki.id]);KK.tick(P,C);A.strictEqual(E(P).prop(ki.id,'rasti'),true,'vanha ra: luetaan');
// .rasti asetettavissa säännöllä
P.st={};var sa=yl(P,'Sääntö1','jos 1 = 1 niin @koira.rasti = kyllä');KK.tick(P,C);A.strictEqual(E(P).prop(ko.id,'rasti'),true,'sääntö asettaa .rasti');A.strictEqual(E(P).val(li.id,'v'),1);KK.removeBlock(P,sa.id);KK.repair(P);
// rivijäsenet (D1): käytössä lisätty rivi kuuluu ryhmään käyttötietona
P.st={};P.st['jkr:'+J]=[{id:'q1',tx:'Hevonen'},{id:'q2',tx:'5',c:true}];KK.repair(P);KK.tick(P,C);e=E(P);
A.strictEqual(e.val(li.id,'n'),5,'3 palikkaa + 2 rivijäsentä');A.strictEqual(e.val(li.id,'v'),1);A.strictEqual(e.prop(li.id,'rivi4.teksti'),'Hevonen');
var f2=function(t){var k2=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,t)});KK.addNode(P,k2.id,0,0);KK.repair(P);KK.tick(P,C);var v=E(P).val(k2.id);KK.removeBlock(P,k2.id);KK.repair(P);return v;};
A.strictEqual(f2('#eläimet'),5);A.ok(/Hevonen, 5$/.test(f2('#eläimet.jäsenet')),f2('#eläimet.jäsenet'));A.strictEqual(f2('#eläimet.rasti.summa'),1);A.strictEqual(E(P).val(g.id),5,'ryhmäpalikan määrä');
var P3=JSON.parse(JSON.stringify(P));KK.repair(P3);A.strictEqual(P3.st['jkr:'+J].length,2,'tallennus');P.st['jkr:'+J].push({id:3});KK.repair(P);A.strictEqual(P.st['jkr:'+J].length,2,'rikkinäinen rivi pois');
P.st={};KK.tick(P,C);A.strictEqual(E(P).val(li.id,'n'),3,'Palauta poistaa rivijäsenet');
console.log('ok');
