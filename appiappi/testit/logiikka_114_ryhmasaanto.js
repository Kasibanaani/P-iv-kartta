// Jonon 42c (suunnitelma 31 V7): ryhmäpalikan rivi kuuluu, kun ehto. Teksti, jossa on sana, kuuluu ryhmään (kirjainkoosta
// välittämättä, myös myöhemmin tehty); kirjoitus säilyy muokattaessa; virheellinen rivi näkyy virheenä; ryhmän ikkunaan säännön
// jäsenet toisintoina (wk), ikkunan summa seuraa; toisinnon poisto rajaa pois, kunnes riviä muutetaan; tallennus ja kehä.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,21,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*500);}
function kirj(P,b,t){KK.ylAseta(P,b,t,'@');KK.ylNimiItse(P,b,t);var r=KK.ylLinkit(P,b,t);KK.repair(P);return r;}
function yl(P,nm,t){var b=KK.addBlock(P,'arvo',{yl:1});N(P,b);if(nm)KK.setName(P,b.id,nm);if(t!=null)kirj(P,b,t);return b;}
function ikkuna(P,o){var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,600,0);wn.w=300;wn.h=200;w.wr=o.id;KK.repair(P);return {w:w,wn:wn};}
function wk(P,wn){return P.lg.n.filter(function(n){return n.g===wn.id&&n.wa&&n.wk;}).map(function(n){return n.p;}).sort();}

// 1. Teksti, jossa on sana koira, kuuluu ryhmään.
(function(){var P=KK.newProject('a');var a=yl(P,'Musta','Musta koira'),b=yl(P,'Kissa','Kissa'),c=yl(P,'Hauva','KOIRA haukkuu');
  var g=yl(P,'Koirat','kuuluu, kun jäsen sisältää "koira"');A.ok(!g.yer,'ei virhettä: '+g.yer);A.ok(g.jku,'sääntö tallessa');
  var J=KK.ylOma(P,g);A.ok(J,'palikalla on oma ryhmä');KK.tick(P,C);
  A.deepStrictEqual(E(P).jkJasenet(J).slice().sort(),[a.id,c.id].sort(),'koira-tekstit jäseniä');
  var inf=E(P).jkInfo(J);A.strictEqual(inf.why[a.id].t,'sk');A.strictEqual(inf.why[b.id].t,'skei');A.ok(!inf.why[g.id],'ryhmäpalikka ei ole oma ehdokas');
  A.strictEqual(KK.jkSyy(inf.why[a.id]),'kuuluu, kun -rivi pätee');
  var d=yl(P,'Rekku','Rekku on koira');KK.tick(P,C);A.ok(E(P).jkJasenet(J).indexOf(d.id)>=0,'myöhemmin tehty');
  A.ok(/kuuluu, kun jäsen sisältää "koira"/.test(KK.ylTeksti(P,g,'@')),'kirjoitus säilyy: '+KK.ylTeksti(P,g,'@'));
  var f=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'#koirat')});N(P,f);KK.repair(P);KK.tick(P,C);A.strictEqual(E(P).val(f.id),3,'#koirat = määrä');
  A.strictEqual(E(P).prop(a.id,'joukot'),'koirat','joukot-ominaisuus');
  // tallennus ja takaisin
  var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.b[g.id].jku,g.jku);KK.tick(P2,C);A.strictEqual(E(P2).jkJasenet(J).length,3);
  // sääntö pois → jäsenet pois
  kirj(P,g,'');KK.tick(P,C);A.ok(!g.jku);A.strictEqual(E(P).jkJasenet(J).length,0);})();

// 2. Virheellinen rivi.
(function(){var P=KK.newProject('b');var g=yl(P,'Ryhmä','kuuluu, kun jäsen sisältää');A.ok(!g.jku,'ei tallennu');A.ok(/Ryhmän sääntö/.test(g.yer||''),'virhe: '+g.yer);
  var h=yl(P,'Toinen','kuuluu, kun jäsen > 1\nkuuluu, kun jäsen < 5');A.ok(/vain yksi/.test(h.yer||''),'kaksi riviä: '+h.yer);
  var t=yl(P,'Teksti','Kuuluu kun sataa');A.ok(!t.jku&&!t.yer,'ilman pilkkua teksti');})();

// 3. Ryhmän ikkuna: säännön jäsenet toisintoina, summa, poisto rajaa pois.
(function(){var P=KK.newProject('c');var a=yl(P,'A','4'),b=yl(P,'B','6'),c=yl(P,'C','8');var g=yl(P,'Isot','kuuluu, kun jäsen > 5');
  var W=ikkuna(P,g);KK.tick(P,C);A.deepStrictEqual(wk(P,W.wn),[b.id,c.id].sort(),'toisinnot');A.strictEqual(E(P).val(W.w.id),14,'summa');
  kirj(P,c,'3');KK.tick(P,C);A.deepStrictEqual(wk(P,W.wn),[b.id],'ei enää jäsen → toisinto pois');A.strictEqual(E(P).val(W.w.id),6);
  var n=P.lg.n.filter(function(x){return x.g===W.wn.id&&x.wk&&x.p===b.id;})[0];KK.removeNode(P,n.id);KK.repair(P);KK.tick(P,C);
  A.deepStrictEqual(g.jkx,[b.id],'rajattu pois');A.deepStrictEqual(wk(P,W.wn),[]);A.strictEqual(E(P).jkInfo(KK.ylOma(P,g)).why[b.id].t,'pois');
  A.ok(KK.nodesOfBlock(P,b.id).length>=1,'palikka säilyy');
  kirj(P,g,'kuuluu, kun jäsen > 2');KK.tick(P,C);A.ok(!g.jkx,'rivin muutos palauttaa');A.deepStrictEqual(wk(P,W.wn),[a.id,b.id,c.id].sort());A.strictEqual(E(P).val(W.w.id),13);
  // tagi ja sääntö yhtä aikaa: tagi voittaa, ei kahta toisintoa
  kirj(P,g,'kuuluu, kun jäsen > 2\n@A');KK.tick(P,C);var as=P.lg.n.filter(function(x){return x.g===W.wn.id&&x.p===a.id;});A.strictEqual(as.length,1);A.ok(!as[0].wk,'tagi ei ⚡');})();

// 4. Kehä ei kaada.
(function(){var P=KK.newProject('d');var a=yl(P,'A','4');var g=yl(P,'Kehä','kuuluu, kun jäsen > #kehä.summa');KK.tick(P,C);
  var J=KK.ylOma(P,g);var r=E(P).jkJasenet(J);A.ok(KK.isErr(r)||Array.isArray(r),'ei kaadu');})();
console.log('ok');
