// Jono 41 ja 40f: kello kaavoissa ja kirjoitettu ketju säännössä. Synteettinen sisältö.
// (a) tänään/huomenna/eilen/nyt.päivä + .viikko/.viikonpäivä/.päivä/.kuukausi/.vuosi; (b) nyt.aika ja klo-literaali laskettavina,
// näyttö h.mm; kello laukaisijana kun-rivillä; (c) Kello-esiasetus on tavallinen yleispalikka; 40f odota säännön rivien välissä.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,20,18,29,40).getTime(); // tiistai, viikko 43
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function kv(P,f){var b=KK.addBlock(P,'kaava',{});KK.addNode(P,b.id,0,0,'');b.f=KK.kaavaToIds(P,f);return E(P).val(b.id);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function kirjoita(P,y,t){KK.ylAseta(P,y,t,'@');KK.ylNimiItse(P,y,t);KK.repair(P);KK.tick(P,C);}

// --- (a) päivän sanojen ominaisuudet ---
(function(){var P=KK.newProject('k');
  A.strictEqual(kv(P,'tänään.viikko'),43);A.strictEqual(kv(P,'tänään.viikonpäivä'),'tiistai');
  A.strictEqual(kv(P,'huomenna.viikonpäivä'),'keskiviikko');A.strictEqual(kv(P,'eilen.viikonpäivä'),'maanantai');
  A.strictEqual(kv(P,'tänään.päivä'),20);A.strictEqual(kv(P,'tänään.kuukausi'),10);A.strictEqual(kv(P,'tänään.vuosi'),2026);
  A.strictEqual(kv(P,'tanaan.viikonpaiva'),'tiistai','ilman ääkkösiä');
  A.strictEqual(kv(P,'nyt.päivä.viikonpäivä'),'tiistai');A.strictEqual(kv(P,'nyt.päivä.viikko'),43);
  A.strictEqual(kv(P,'tänään.viikonpäivä = "tiistai"'),true);
  var e=kv(P,'tänään.lentää');A.ok(KK.isErr(e)&&/ei ole käytössä/.test(e.err),JSON.stringify(e));
  // vanhat ennallaan
  A.strictEqual(kv(P,'nyt'),'18.29');A.strictEqual(kv(P,'nyt.tunti'),18);A.strictEqual(kv(P,'nyt.minuutti'),29);A.strictEqual(kv(P,'nyt.sekunti'),40);
  A.ok(KK.isD(kv(P,'tänään'))&&kv(P,'tänään').d==='2026-10-20');A.strictEqual(kv(P,'tänään + 1').d,'2026-10-21');
})();

// --- (b) nyt.aika ja klo ---
(function(){var P=KK.newProject('k');
  A.strictEqual(kv(P,'nyt.aika'),18*3600+29*60,'minuutin tarkkuus');
  A.strictEqual(kv(P,'klo 18.30'),66600);A.strictEqual(kv(P,'klo 7'),25200);A.strictEqual(kv(P,'klo 7:05'),25500);A.strictEqual(kv(P,'KLO 7.30'),27000);
  A.strictEqual(kv(P,'nyt.aika >= klo 18.30'),false);A.strictEqual(kv(P,'nyt.aika < klo 18.30'),true);A.strictEqual(kv(P,'nyt.aika = klo 18.29'),true);
  A.strictEqual(kv(P,'klo 22 - nyt.aika'),3*3600+31*60);
  A.ok(KK.isErr(kv(P,'klo 25')),'yli 24 on virhe');A.ok(KK.isErr(kv(P,'klo 7.60')));
  // näyttö h.mm
  A.strictEqual(KK.kloTxt(66600),'18.30');A.strictEqual(KK.kloTxt(3*3600+31*60),'3.31');A.strictEqual(KK.kloTxt(-900),'−0.15');
  A.strictEqual(KK.kaavaAika('nyt.aika'),true);A.strictEqual(KK.kaavaAika('klo 22 - nyt.aika'),true);A.strictEqual(KK.kaavaAika('nyt.tunti'),false);A.strictEqual(KK.kaavaAika('nyt.aika > klo 7'),false);
  // kirjoitus säilyy tekstinä ja Miksi?-teksti näyttää klo
  var b=KK.addBlock(P,'kaava',{});b.f=KK.kaavaToIds(P,'nyt.aika >= klo 18.30');A.strictEqual(KK.kaavaToText(P,b.f),'nyt.aika >= klo 18.30');
  A.ok(/klo 18\.30/.test(KK.kaavaAstText(P,KK.parseKaava(b.f).ast)));
  // klo viitteenä toimii yhä, kun perässä ei ole numeroa
  var k=KK.addBlock(P,'arvo',{v:'5'});N(P,k);KK.setName(P,k.id,'Klo');KK.repair(P);A.strictEqual(kv(P,'klo + 1'),6);
  // yleispalikka: kaava, joka näyttää kellonajan, ja tekstiin upotettu
  var y=KK.addBlock(P,'arvo',{yl:1});N(P,y);kirjoita(P,y,'= klo 22 - nyt.aika');A.strictEqual(E(P).val(y.id),3*3600+31*60);
  KK.setName(P,y.id,'Jäljellä');KK.repair(P);var t=KK.addBlock(P,'arvo',{yl:1});N(P,t);kirjoita(P,t,'Aikaa: @jäljellä');A.strictEqual(E(P).val(t.id),'Aikaa: 3.31');
})();

// --- kello laukaisijana kun-rivillä ---
(function(){var P=KK.newProject('k');var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Laskuri');N(P,m);
  var s=KK.addBlock(P,'arvo',{yl:1});N(P,s);NOW=new Date(2026,9,20,18,29,40).getTime();
  kirjoita(P,s,'kun nyt.aika = klo 18.30 niin @laskuri = @laskuri + 1');A.strictEqual(KK.ylLaji(P,s),'saanto',s.yer);
  KK.tick(P,C);A.strictEqual(E(P).val(m.id),0);
  NOW+=30000;KK.tick(P,C);A.strictEqual(E(P).val(m.id),1,'klo 18.30 laukaisee');
  NOW+=30000;KK.tick(P,C);A.strictEqual(E(P).val(m.id),1,'kerran');
  // monirivinen: kaksi kellon kun-riviä
  kirjoita(P,s,'kun nyt.aika >= klo 18.31 niin @laskuri = 10\nkun nyt.aika >= klo 18.32 niin @laskuri = 20');KK.tick(P,C);
  NOW+=60000;KK.tick(P,C);A.strictEqual(E(P).val(m.id),10);NOW+=60000;KK.tick(P,C);A.strictEqual(E(P).val(m.id),20);
})();

// --- 40f: odota säännön rivien välissä ---
(function(){NOW=new Date(2026,9,20,12,0,0).getTime();var P=KK.newProject('k'),v=P.views[0].id;
  var l=KK.addBlock(P,'muoto',{v:v,laji:'laatikko',x:10,y:10,w:50,h:50,hue:0});KK.setName(P,l.id,'Lamppu');
  var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Määrä');N(P,m);
  var s=KK.addBlock(P,'arvo',{yl:1});N(P,s);KK.repair(P);
  var T='kun @määrä > 5\n@lamppu.väri = 4\nodota 5 s\n@lamppu.väri = 2\nodota 1 min\n@määrä = 0';
  kirjoita(P,s,T);A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(KK.ylLaji(P,s),'saanto');
  A.strictEqual(s.sa.k.length,1);A.strictEqual(s.sa.k[0].q.length,5);A.strictEqual(s.sa.k[0].q[1].d,5);A.strictEqual(s.sa.k[0].q[3].d,60);
  A.strictEqual(KK.ylTeksti(P,s,'@'),T,'kirjoitus takaisin');
  A.strictEqual(E(P).omi(l.id,'väri'),1);
  KK.setVal(P,m.id,7,C);KK.tick(P,C);A.strictEqual(E(P).omi(l.id,'väri'),4,'ensimmäinen teko heti');A.ok(KK.anyChainRunning(P),'ketju käynnissä');
  NOW+=3000;KK.chainPoll(P,C);A.strictEqual(E(P).omi(l.id,'väri'),4,'odottaa');
  // ei käynnisty uudelleen kesken ajon
  KK.setVal(P,m.id,0,C);KK.tick(P,C);KK.setVal(P,m.id,9,C);KK.tick(P,C);
  NOW+=2000;KK.chainPoll(P,C);A.strictEqual(E(P).omi(l.id,'väri'),2,'5 s jälkeen');
  // tallennus ja kunnostus säilyttää ajon
  var js=JSON.parse(JSON.stringify(P));KK.repair(js);A.ok(js.st['sq:'+s.id],'käynnissä oleva ketju säilyy');A.deepStrictEqual(js.b[s.id].sa,s.sa);
  NOW+=60000;KK.chainPoll(P,C);A.strictEqual(E(P).val(m.id),0,'minuutin jälkeen');A.ok(!KK.anyChainRunning(P),'ketju valmis');
  // uudelleen, kun ehto alkaa taas päteä
  KK.setVal(P,m.id,8,C);KK.tick(P,C);A.ok(KK.anyChainRunning(P));
  // muokkaus pysäyttää ajon
  kirjoita(P,s,T.replace('5 s','2 s'));A.ok(!KK.anyChainRunning(P));
  // appi kiinni: väliin jääneet tehdään järjestyksessä avattaessa
  KK.setVal(P,m.id,0,C);KK.tick(P,C);KK.setVal(P,m.id,6,C);KK.tick(P,C);NOW+=3600e3;KK.chainPoll(P,C);A.strictEqual(E(P).val(m.id),0);A.strictEqual(E(P).omi(l.id,'väri'),2);
  // kun-rivi ilman odotusta toimii kuten ennen (99), ja odota ilman kun-riviä on virhe
  kirjoita(P,s,'jos @määrä > 1 niin @lamppu.väri = 2\nodota 5 s');A.ok(/rivi 2: odota kuuluu kun-rivin/.test(s.yer||''),s.yer);
  kirjoita(P,s,'kun @määrä > 5 niin @lamppu.väri = 4\nodota 2 min\n@lamppu.väri = vaihda');A.ok(/vaihda kääntää/.test(s.yer||''),s.yer);
  kirjoita(P,s,'kun @määrä > 5 niin @lamppu.väri = 4\nodota 1,5 min\n@lamppu.väri = 3');A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(s.sa.k[0].q[0].d,90);
  A.strictEqual(KK.ylTeksti(P,s,'@'),'kun @määrä > 5 niin @lamppu.väri = 4\nodota 1,5 min\n@lamppu.väri = 3');
})();
console.log('ok logiikka_110_kello');
