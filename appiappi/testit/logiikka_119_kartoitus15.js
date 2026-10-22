// Jono 1z (kartoitus 15 S1–S5): Arvon käyttöarvo (ka:, Palauta poistaa, repair), muokattava/laskeva jäsen, rivijäsenen
// tekstin osat ja nimi ryhmän koosteissa, tekstin osat tekstiominaisuuden perään, piirroksen nimen vaihto kaavoissa ja
// Toiminnoissa, Kuvan kuva-kohta piirroksen nimellä, kellonaika ryhmän koosteessa.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,22,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function yl(P,nm,t){var b=KK.addBlock(P,'arvo',{yl:1});KK.addNode(P,b.id,0,Math.random()*900);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b;}
function kv(P,t){var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,t)});KK.addNode(P,k.id,0,Math.random()*900);KK.repair(P);KK.tick(P,C);return k;}

// S1: käyttöarvo ja muokattavuus
(function(){var P=KK.newProject('a');var g=yl(P,'Tehtävät','@x'),x=yl(P,'Pyykit','Pyykit\n#tehtävät'),f=yl(P,'Summa','= 2 + 3\n#tehtävät'),
    m=KK.addBlock(P,'muisti',{yl:1});KK.addNode(P,m.id,0,0);KK.setName(P,m.id,'Muistio');KK.ylAseta(P,m,'muistiin','@');KK.repair(P);
  A.ok(KK.lsMuokattava(P,x.id),'Arvo-jäsen muokattava');A.ok(!KK.lsMuokattava(P,f.id),'kaava on lukurivi');A.ok(KK.lsMuokattava(P,'q1'),'rivijäsen muokattava');
  A.ok(!KK.lsMuokattava(P,g.id),'ryhmäpalikka on lukurivi');
  var kel=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'nyt.aika')});KK.addNode(P,kel.id,0,0);A.ok(!KK.lsMuokattava(P,kel.id),'kello lukurivi');
  A.ok(KK.kaAseta(P,x.id,'Pyykit pesty'));A.ok(!KK.kaAseta(P,f.id,'7'),'kaava ei saa käyttöarvoa');KK.tick(P,C);
  A.strictEqual(E(P).val(x.id),'Pyykit pesty','käyttöarvo näkyy');A.ok(/^Pyykit$/.test(KK.ylTeksti(P,x,'@').split('\n')[0]),'kirjoitus ennallaan');
  KK.kaAseta(P,x.id,'12');KK.tick(P,C);A.strictEqual(E(P).val(x.id),12,'luku luetaan lukuna');
  var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.st['ka:'+x.id],'12','tallennus säilyttää');
  P2.st['ka:'+f.id]='9';P2.st['ka:zz']='1';P2.st['ka:'+m.id]=3;KK.repair(P2);A.ok(!('ka:'+f.id in P2.st)&&!('ka:zz' in P2.st)&&!('ka:'+m.id in P2.st),'repair siivoaa');
  KK.clearVal(P,x.id);KK.tick(P,C);A.strictEqual(E(P).val(x.id),'Pyykit','Palauta alkuarvoon');
  KK.kaAseta(P,x.id,'muuta');P.st={};KK.tick(P,C);A.strictEqual(E(P).val(x.id),'Pyykit','Palauta (käyttötieto pois)');})();

// S3 a: rivijäsenen tekstin osat ja nimi koosteissa
(function(){var P=KK.newProject('b');var g=yl(P,'Tehtävät','@h'),h=yl(P,'Hammas','Hammaslääkäri 24.10. klo 14\n#tehtävät');var J=KK.ylOma(P,g);
  P.st['jkr:'+J]=[{id:'q1',tx:'Soita 23.10. klo 9.30 kolme sanaa'}];KK.repair(P);KK.tick(P,C);
  var k=kv(P,'#tehtävät.päivä.pienin');var v=E(P).val(k.id);A.ok(KK.isD(v)&&/-10-23$/.test(v.d),'rivijäsenen päivä mukana: '+JSON.stringify(v));
  A.strictEqual(E(P).val(kv(P,'#tehtävät.sanoja.summa').id),4+6,'sanoja summa');
  A.strictEqual(E(P).val(kv(P,'#tehtävät.nimi.jäsenet').id)!=null,true);
  A.strictEqual(E(P).val(kv(P,'#tehtävät.nimi.sanoja.summa').id),1+6,'nimi.sanoja (palikan nimi + rivijäsenen teksti)');
  // S5: kellonaika ryhmän koosteessa
  var kk=kv(P,'#tehtävät.kello.pienin');A.strictEqual(E(P).val(kk.id),9.5*3600);A.ok(KK.kaavaAika(kk.f,P),'kello.pienin näkyy kellonaikana');
  A.ok(KK.kaavaAika(kv(P,'#tehtävät.kello.suurin').f,P));A.ok(!KK.kaavaAika(kv(P,'#tehtävät.kello.summa').f,P),'summa ei');
  // tekstin osat tekstiominaisuuden perään
  A.strictEqual(E(P).val(kv(P,'@hammas.nimi.sanoja').id),1);
  A.strictEqual(E(P).val(kv(P,'@hammas.nimi.luku').id),null);
  var t=KK.addBlock(P,'teksti',{v:P.views[0].id});KK.setName(P,t.id,'Kenttä');KK.addNode(P,t.id,0,0);KK.repair(P);KK.setVal(P,t.id,'Kokous 25.10.',C);KK.tick(P,C);
  A.strictEqual(E(P).val(kv(P,'@kenttä.teksti.sanoja').id),1,'teksti (näkyvä otsikko).sanoja');A.strictEqual(E(P).val(kv(P,'@kenttä.teksti.päivä').id),null);
  var tp=E(P).val(kv(P,'@kenttä.päivä').id);A.ok(KK.isD(tp)&&/-10-25$/.test(tp.d),'arvon päivä ennallaan');})();

// S4: piirroksen nimen vaihto
(function(){var P=KK.newProject('c'),a=KK.pxUusi(P,'Seisoo',8,8),h=KK.pxUusi(P,'Hyppy',8,8);
  var b=KK.addBlock(P,'muoto',{v:P.views[0].id});KK.setName(P,b.id,'Hahmo');b.il={t:{perus:a}};KK.addNode(P,b.id,0,0);KK.repair(P);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:b.id,om:'ilme',v:'Hyppy'}),t2=KK.addBlock(P,'tee',{do:'aseta',o:b.id,om:'ilme',v:'"hyppy"'}),t3=KK.addBlock(P,'tee',{do:'aseta',o:b.id,om:'x',v:'Hyppy'});
  var k=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'@hahmo.ilme = "Hyppy"')}),k2=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'"Hyppy"')});[t,t2,t3,k,k2].forEach(function(x,i){KK.addNode(P,x.id,300,i*80);});KK.repair(P);
  var lu=yl(P,'Luku','4'),sr=yl(P,'Hyppysääntö','jos @luku > 1 niin @hahmo.ilme = "Hyppy"');A.ok(sr.sa&&!sr.yer,'sääntö: '+sr.yer);
  var n=KK.pxNimeaKaavat(P,'Hyppy','Loikka');P.px[h].n='Loikka';
  A.strictEqual(n,4,'neljä palikkaa');A.ok(/"Loikka"/.test(KK.ylTeksti(P,sr,'@')),'sääntö: '+KK.ylTeksti(P,sr,'@'));KK.tick(P,C);A.strictEqual(E(P).omiVal(b.id,'ilme'),'Loikka','sääntö asettaa uuden nimen');A.strictEqual(t.v,'Loikka');A.strictEqual(t2.v,'"Loikka"');A.strictEqual(t3.v,'Hyppy','muu kohta ennallaan');
  A.ok(/"Loikka"/.test(k.f));A.strictEqual(k2.f,'"Hyppy"','kaava ilman ilmettä ennallaan');
  A.strictEqual(KK.ilNimesta(P,t.v),h,'Aseta löytää piirroksen yhä');
  // Kuvan kuva-kohta nimellä
  var ku=KK.addBlock(P,'pkuva',{v:P.views[0].id,src:'Loikka'});KK.addNode(P,ku.id,0,0);KK.repair(P);A.strictEqual(KK.kuvaKuvat(P,null,ku)[0],'px:'+h);
  ku.src='Lento';A.strictEqual(KK.kuvaKuvat(P,null,ku)[0],'Lento','tuntematon nimi ennallaan');})();
console.log('ok');
