// Jonon 1y (kartoitus 14 S1–S3): (a) paletin Kello = nyt.aika on laskettava kellonaika, ja kaava, jossa on viite
// kellonaikakaavaan, näkyy kellonaikana (kehä katkaistaan); (b) luettava nimi kaikille palikoille (seuraa uudelleennimeämistä,
// peliohjaimen oma nimi ja taulukon sarake Nimi ennallaan); (c) laattalajin nimen vaihto päivittää kaavojen .määrä-polut ja
// "Vanha"-tekstit kaavoissa, joissa on .laji tai .laatta (myös Säännön osat), muut tekstit ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,21,12,15,30);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function E(P){return KK.Ev(P,C);}
function Y(P,t,nm){var y=KK.addBlock(P,'arvo',{yl:1});N(P,y);KK.ylAseta(P,y,t,'@');if(nm)KK.setName(P,y.id,nm);KK.repair(P);return y;}
// (a)
(function(){var P=KK.newProject('a');var k=Y(P,'= nyt.aika','Kello');
  A.strictEqual(E(P).val(k.id),12*3600+15*60,'minuutin tarkkuus');A.ok(KK.kaavaAika(k.f,P));
  var v=Y(P,'= @kello >= klo 12');A.strictEqual(E(P).val(v.id),true);
  var t=Y(P,'= @kello + 3600');A.strictEqual(E(P).val(t.id),13*3600+15*60);A.ok(KK.kaavaAika(t.f,P),'viite kellonaikaan + luku');
  A.strictEqual(KK.kloTxt(E(P).val(t.id)),'13.15');
  var a=Y(P,'= @b + 1','A');var b=Y(P,'= @a + 1','B');A.strictEqual(KK.kaavaAika(a.f,P),false,'kehä ei jumita');
  var n=Y(P,'= @kello.nimi');A.ok(!KK.kaavaAika(n.f,P),'.nimi ei ole kellonaika');
  var vanha=Y(P,'= nyt');A.strictEqual(typeof E(P).val(vanha.id),'string','vanha = nyt ennallaan tekstinä');})();
// (b)
(function(){var P=KK.newProject('b');var x=KK.addBlock(P,'muoto',{v:P.views[0].id});KK.setName(P,x.id,'Vihollinen');
  var k=Y(P,'= @vihollinen.nimi');A.strictEqual(E(P).val(k.id),'Vihollinen');
  KK.setName(P,x.id,'Peto');KK.repair(P);A.strictEqual(E(P).val(k.id),'Peto','seuraa uudelleennimeämistä');
  var t=KK.addBlock(P,'taulu',{});N(P,t);KK.setName(P,t.id,'Ostokset');KK.addCol(t,'Nimi','teksti');KK.repair(P);
  var tk=Y(P,'= @ostokset.nimi');A.ok(KK.isErr(E(P).val(tk.id)),'sarake Nimi voittaa (valitse rivi)');
  A.ok(KK.omat(P.b[k.id]).some(function(e){return e.n==='nimi';}),'nimi rekisterissä');})();
// (c)
(function(){var P=KK.newProject('c');var b=KK.addBlock(P,'laatat',{v:P.views[0].id});b.rk=32;b.lh2=1;b.lw=3;b.lrt=['kk#'];b.lj=[{c:'#',n:'Seinä',t:'kiintea',hue:0},{c:'k',n:'Kolikko',t:'lapi',hue:3,il:true}];N(P,b);KK.setName(P,b.id,'Kartta');KK.repair(P);
  var m=Y(P,'= @kartta.määrä.kolikko');A.strictEqual(E(P).val(m.id),2);
  var s=Y(P,'= tapahtuma.laji = "Kolikko"');var muu=Y(P,'= "Kolikko"');
  var sa=Y(P,'jos @kartta.määrä.kolikko < 1 niin @kartta.näkyy = ei');
  var n=KK.ltNimeaKaavat(P,b.id,'Kolikko','Raha');b.lj[1]=Object.assign({},b.lj[1],{n:'Raha'});KK.repair(P);
  A.strictEqual(n,3,'kolme kaavaa muuttui');A.strictEqual(E(P).val(m.id),2,'polku seuraa');
  A.ok(/"Raha"/.test(s.f),'teksti .laji-kaavassa');A.ok(/"Kolikko"/.test(muu.f),'muu teksti ennallaan');
  A.ok(/määrä\.raha/.test(JSON.stringify(sa.sa)),'Säännön osa');A.strictEqual(KK.ltNimeaKaavat(P,b.id,'Raha','Raha'),0);})();
console.log('logiikka_113_kartoitus14 ok');
