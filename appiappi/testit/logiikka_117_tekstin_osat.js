// Jonon 42f (suunnitelma 31 V6): tekstistä luettavat .päivä, .kello, .luku, .sanoja yleispalikalle, Tekstille, Listan riville
// ja ryhmän jäsenelle (jäsen.päivä). Päivä eri muodoissa, vuosi puuttuu → lähin tuleva (D3), ei päivää, monta päivää,
// ketju .päivä.viikonpäivä, kello vertailussa ja h.mm-näytössä, luku ei ota päivää eikä kelloa.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,21,12);var C={now:function(){return NOW;},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function yl(P,nm,t){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,0,Math.random()*900);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b;}
function f(P,t){var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,t)});KK.addNode(P,k.id,0,0);KK.repair(P);KK.tick(P,C);var v=E(P).val(k.id);KK.removeBlock(P,k.id);return v;}
var P=KK.newProject('t');
function osat(t){var b=yl(P,'X'+Math.floor(Math.random()*1e6),t),e=E(P);var r=[e.prop(b.id,'päivä'),e.prop(b.id,'kello'),e.prop(b.id,'luku'),e.prop(b.id,'sanoja')];KK.removeBlock(P,b.id);return r;}
var r=osat('Hammaslääkäri 24.10. klo 14');A.deepStrictEqual(r,[{d:'2026-10-24'},50400,null,4],JSON.stringify(r));
r=osat('Kokous 3.2.2027 kello 9.30, 12 osallistujaa');A.deepStrictEqual(r,[{d:'2027-02-03'},34200,12,6],JSON.stringify(r));
r=osat('Juhla 1.3. ja 5.3.');A.deepStrictEqual(r[0],{d:'2027-03-01'},'vuosi puuttuu → lähin tuleva');
r=osat('Eilinen 20.10.');A.deepStrictEqual(r[0],{d:'2027-10-20'},'mennyt päivä → ensi vuosi');
r=osat('Tänään 21.10. maksu');A.deepStrictEqual(r[0],{d:'2026-10-21'},'tämä päivä kelpaa');
r=osat('ISO 2026-12-24 kuusi');A.deepStrictEqual(r[0],{d:'2026-12-24'});
r=osat('Soita huomenna 18:45');A.deepStrictEqual([r[0],r[1]],[{d:'2026-10-22'},67500]);
r=osat('Osta 2,5 kg jauhoja');A.deepStrictEqual(r,[null,null,2.5,4]);
r=osat('Ei mitään');A.deepStrictEqual(r,[null,null,null,2]);
r=osat('31.2. ei ole päivä');A.strictEqual(r[0],null,'virheellinen päivä');
r=osat('');A.deepStrictEqual(r,[null,null,null,0]);
// kaavassa: ketju, vertailu, kellonaika näkyy h.mm
var m=yl(P,'Muistutus','Hammaslääkäri 24.10. klo 14');KK.tick(P,C);
A.strictEqual(f(P,'@muistutus.päivä.viikonpäivä'),'lauantai');A.strictEqual(f(P,'@muistutus.päivä = 24.10.2026'),true);
A.strictEqual(f(P,'@muistutus.kello >= klo 12'),true);A.strictEqual(f(P,'@muistutus.sanoja'),4);
var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'@muistutus.kello + 1800')});A.ok(KK.kaavaAika(k.f,P),'kello on kellonaika');KK.removeBlock(P,k.id);
A.ok(KK.omat(m).some(function(e){return e.n==='päivä';})&&KK.omat(m).some(function(e){return e.n==='sanoja';}),'omat-rekisterissä');
// näkymän Teksti
var tx=KK.addBlock(P,'teksti',{v:P.views[0].id});KK.setName(P,tx.id,'Kenttä');P.st[tx.id]='Lento 5.11. klo 7';KK.repair(P);KK.tick(P,C);
A.deepStrictEqual(E(P).prop(tx.id,'päivä'),{d:'2026-11-05'});A.strictEqual(E(P).prop(tx.id,'kello'),25200);
// Listan rivi
var li=KK.addBlock(P,'lista',{v:P.views[0].id,rivit:'Maito\nNeuvola 2.11. klo 10\nKolme sanaa tässä'});KK.setName(P,li.id,'Lista');KK.repair(P);KK.tick(P,C);
A.deepStrictEqual(E(P).prop(li.id,'rivi2.päivä'),{d:'2026-11-02'});A.strictEqual(E(P).prop(li.id,'rivi2.kello'),36000);A.strictEqual(E(P).prop(li.id,'rivi3.sanoja'),3);
A.strictEqual(E(P).prop(li.id,'rivi1.päivä'),null);A.strictEqual(E(P).prop(li.id,'rivi2.päivä.kuukausi'),11);
// ryhmän jäsen: päivämäärien ryhmä
var a=yl(P,'Tänne','Neuvola 21.10.'),b2=yl(P,'Huomen','Kauppa 22.10.');var g=yl(P,'Tanaan','kuuluu, kun jäsen.päivä = tänään');KK.tick(P,C);
var js=E(P).jkJasenet(KK.ylOma(P,g));A.ok(!KK.isErr(js),JSON.stringify(js));A.ok(js.indexOf(a.id)>=0&&js.indexOf(b2.id)<0,'jäsen.päivä = tänään: '+JSON.stringify(js));
// tallennusmuoto ennallaan: ei uusia kenttiä
A.ok(!('txpv' in m)&&!('päivä' in m));
console.log('ok');
