// Jonon 1x (kartoitus 13 S1–S3, S5): sama ryhmä antaa saman luvun (#eläin, ryhmäpalikan arvo, ryhmän ikkuna) myös käytössä
// lisätyllä tai poistetulla jäsenellä; ryhmän ikkuna ei laske käsin vedettyä jäsentä kahdesti; vanha 90–92-yleispalikka ei muutu
// avaamalla ja vahvistamalla; nimi itsestään.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,19,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function yl(P,nm,t){var b=KK.addBlock(P,'arvo',{yl:1});N(P,b);if(nm)KK.setName(P,b.id,nm);if(t!=null){KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);}KK.repair(P);return b;}
function kaava(P,f){var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,f)});N(P,k);KK.repair(P);return k;}
function evf(P,f){var k=kaava(P,f);KK.tick(P,C);var v=E(P).val(k.id);KK.removeBlock(P,k.id);return v;}
function ikkuna(P,o){var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=KK.addNode(P,w.id,600,0);wn.w=300;wn.h=200;w.wr=o.id;KK.repair(P);return {w:w,wn:wn};}

// --- S1: kolme lukua samaksi ---
(function(){var P=KK.newProject('s1');var el=yl(P,'Eläin'),ko=yl(P,'Koira','4\n#eläin'),ki=yl(P,'Kissa','6\n#eläin'),hi=yl(P,'Hiiri','1');
  var W=ikkuna(P,el),g=KK.ylOma(P,el);KK.tick(P,C);
  A.strictEqual(E(P).val(el.id),2);A.strictEqual(evf(P,'#eläin'),2);A.strictEqual(E(P).val(W.w.id),10);
  P.st['jk:'+g]={};P.st['jk:'+g][hi.id]=true;KK.tick(P,C);
  A.strictEqual(E(P).val(el.id),3,'Lisää joukkoon näkyy ryhmäpalikan arvossa');A.strictEqual(evf(P,'#eläin'),3);A.strictEqual(evf(P,'#eläin.summa'),11);
  A.strictEqual(E(P).val(W.w.id),11,'ikkuna laskee käytössä lisätyn');
  delete P.st['jk:'+g][hi.id];P.st['jk:'+g][ko.id]=false;KK.tick(P,C);
  A.strictEqual(E(P).val(el.id),1);A.strictEqual(evf(P,'#eläin'),1);A.strictEqual(evf(P,'#eläin.summa'),6);
  A.strictEqual(E(P).val(W.w.id),6,'poistetun esiintymä ei laske');
  A.strictEqual(P.lg.n.filter(function(n){return n.g===W.wn.id&&n.p===ko.id;}).length,1,'esiintymä jää (himmeänä), linkkirivi ennallaan');
  P.st['jk:'+g][ki.id]=false;KK.tick(P,C);A.strictEqual(E(P).val(el.id),0,'kaikki poistettu käytössä: 0, ei tyhjä');
  // Joukko-palikan Ota mukaan / Vain jos näkyvät myös: Vain jos rajaa
  delete P.st['jk:'+g];var pj=KK.addBlock(P,'pjoukko',{jj:g,vjf:KK.kaavaToIds(P,'jäsen.arvo > 5')});N(P,pj);KK.repair(P);KK.tick(P,C);
  var js=E(P).jkJasenet(g);A.ok(!KK.isErr(js)&&js.length===1,'Vain jos: '+JSON.stringify(js));{A.strictEqual(E(P).val(el.id),1);A.strictEqual(E(P).val(W.w.id),6,'Vain jos rajaa ikkunaa');}
})();

// --- S2: käsin vedetty jäsen kerran ---
(function(){var P=KK.newProject('s2');var el=yl(P,'Eläin'),ko=yl(P,'Koira','4\n#eläin'),ki=yl(P,'Kissa','6\n#eläin');
  var w=KK.addBlock(P,'ikkuna',{m:'sum'}),wn=KK.addNode(P,w.id,600,0);wn.w=300;wn.h=200;KK.addNode(P,ko.id,620,60,wn.id);KK.repair(P);
  w.wr=el.id;KK.repair(P);KK.tick(P,C);
  A.strictEqual(P.lg.n.filter(function(n){return n.g===wn.id&&n.p===ko.id;}).length,1,'ei toista esiintymää käsin vedetylle');
  A.strictEqual(E(P).val(w.id),10);
  // kaksi saman palikan solmua (vanha projekti): lasketaan kerran
  var x=KK.addNode(P,ki.id,620,160,wn.id);KK.tick(P,C);A.strictEqual(E(P).val(w.id),10,'sama palikka kerran');
  // käsin vedetyn poisto ei irrota ryhmästä
  var kn=P.lg.n.filter(function(n){return n.g===wn.id&&n.p===ko.id;})[0];A.ok(!kn.wa);KK.removeNode(P,kn.id);KK.repair(P);
  A.ok(KK.ylJasenet(P,el).indexOf(ko.id)>=0,'käsin vedetyn poisto ei irrota');A.strictEqual(P.lg.n.filter(function(n){return n.g===wn.id&&n.p===ko.id&&n.wa;}).length,1,'tilalle esiintymä');
})();

// --- S3: vanha yleispalikka ei muutu avaamalla ja vahvistamalla ---
(function(){var P=KK.newProject('s3');var k=kaava(P,'15 + 15');KK.setName(P,k.id,'Kaava1');KK.jkLuo(P,'kolikot');var J=KK.jkFind(P,'kolikot');
  var c=KK.addBlock(P,'arvo',{v:'2'});N(P,c);KK.setTunnus(P,c.id,'@'+c.vt+' #kolikot');
  // 90–92: pelkkä viite ja pelkkä ryhmä tallentuivat kaavana {#id} ja {%j}
  var a=KK.addBlock(P,'kaava',{yl:1,f:'{#'+k.id+'}'});N(P,a);var b=KK.addBlock(P,'kaava',{yl:1,f:'{%'+J+'}'});N(P,b);var bl=KK.addBlock(P,'kaava',{yl:1,ty:'viite',f:'{#'+k.id+'}'});N(P,bl);KK.repair(P);KK.tick(P,C);
  A.strictEqual(E(P).val(a.id),30);A.strictEqual(E(P).val(b.id),1);A.strictEqual(KK.ylLaji(P,a),'kaava','lajimerkki ei ole Arvo');A.strictEqual(KK.ylLaji(P,b),'ryhma');
  A.strictEqual(KK.ylTeksti(P,a,'@'),'= @kaava1');A.strictEqual(KK.ylTeksti(P,b,'@'),'#kolikot.jäseniä');
  [a,b,bl].forEach(function(y){var t=KK.ylTeksti(P,y,'@');KK.ylAseta(P,y,t,'@');KK.ylNimiItse(P,y,t);var r=KK.ylLinkit(P,y,t);A.strictEqual(r.err,'');KK.repair(P);});KK.tick(P,C);
  A.strictEqual(E(P).val(a.id),30,'= @kaava1 lukee yhä arvon');A.strictEqual(E(P).val(b.id),1,'#kolikot.jäseniä on yhä määrä');A.strictEqual(E(P).val(bl.id),30,'lukittu Viite kelpaa');A.strictEqual(bl.yer,undefined);
  A.ok(!k.jkt,'Kaava1 ei liity mihinkään ryhmään');A.ok(!b.jkt,'palikka ei liity kolikoihin');A.deepStrictEqual(E(P).jkJasenet(J),[c.id]);
  A.strictEqual(KK.ylTeksti(P,a,'§'),'= §kaava1');A.strictEqual(KK.ylTeksti(P,a,'{'),'= {kaava1}');
})();

// --- S5: nimi itsestään ---
(function(){var P=KK.newProject('s5');function kirj(y,t){KK.ylAseta(P,y,t,'@');KK.ylNimiItse(P,y,t);KK.ylLinkit(P,y,t);KK.repair(P);return y.nm;}
  var a=yl(P),b=yl(P),c=yl(P),d=yl(P);
  A.strictEqual(kirj(a,'Hei maailma'),'Hei');A.strictEqual(a.vt,'hei','viite seuraa nimeä');
  A.strictEqual(kirj(b,'= 1 + 2'),'Kaava');A.strictEqual(kirj(c,'= 3 * 3'),'Kaava 2');
  A.strictEqual(kirj(a,'Moi kaikki'),'Moi','nimi seuraa kirjoitusta, kun sitä ei ole itse annettu');
  A.strictEqual(kirj(d,'42'),'Arvo','luku: lajin nimi');
  KK.setName(P,d.id,'Oma nimi');A.strictEqual(kirj(d,'Hei taas'),'Oma nimi','itse annettu nimi ei muutu');
  var e=yl(P);A.strictEqual(kirj(e,'@hei @moi'),'Ryhmä','pelkät jäsenet: Ryhmä');A.ok(KK.ylOma(P,e));A.strictEqual(KK.ylTeksti(P,a,'@'),'Moi kaikki\n#ryhmä','jäsenet saavat ryhmän nimen, ei #arvo2');
  var f=yl(P);A.strictEqual(kirj(f,'#ryhmä.summa'),'Ryhmä summa','ryhmän luvusta ryhmä ja kooste');A.notStrictEqual(KK.ylOma(P,f),KK.ylOma(P,e),'ei ota luettavaa ryhmää omakseen');
  var h=yl(P);A.strictEqual(kirj(h,'Pisteet: #ryhmä.jäseniä'),'Pisteet');
})();
console.log('korjaukset 1x ok');
