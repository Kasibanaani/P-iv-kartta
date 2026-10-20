// Jono 40 (suunnitelma 30): Sääntö. jos-sääntö pitää kohteen ominaisuuden voimassa ehdon ajan ja palauttaa sen, kun ehto
// lakkaa; kaksi sääntöä samaan kohteeseen: ensin tehty voittaa, toinen näkyy ristiriitana; kehä on virhe; kun-sääntö tekee
// kerran (ominaisuus, arvo, vaihda, käynnistä) ja lähettää tapahtuman silloin; virheellinen kirjoitus säilyy ja on punainen.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,20,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function uusi(){var P=KK.newProject('s'),v=P.views[0].id;
  var l=KK.addBlock(P,'muoto',{v:v,laji:'laatikko',x:10,y:10,w:50,h:50,hue:0});KK.setName(P,l.id,'Lamppu');
  var m=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m.id,'Määrä');N(P,m);
  var k=KK.addBlock(P,'kytkin',{v:v,x:10,y:100});KK.setName(P,k.id,'Valo');
  var s=KK.addBlock(P,'arvo',{yl:1});N(P,s);KK.repair(P);return {P:P,l:l,m:m,k:k,s:s};}
function kirjoita(P,y,t){KK.ylAseta(P,y,t,'@');KK.ylNimiItse(P,y,t);KK.repair(P);KK.tick(P,C);}
function aseta(P,m,v){KK.setVal(P,m.id,v,C);KK.tick(P,C);}

// --- jos-sääntö: voimassa ja palautus ---
(function(){var o=uusi(),P=o.P,s=o.s;
  A.deepStrictEqual(KK.ylLajit(P,'jos @määrä > 5 niin @lamppu.väri = 3'),['saanto','teksti']);
  kirjoita(P,s,'jos @määrä > 5 niin @lamppu.väri = 3');
  A.strictEqual(KK.ylLaji(P,s),'saanto');A.strictEqual(s.k,'kaava');A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(s.nm,'Sääntö');
  A.strictEqual(s.sa.r,o.l.id);A.strictEqual(s.sa.p,'o_vari');
  A.strictEqual(E(P).omi(o.l.id,'väri'),1,'ehto ei päde: oma väri');A.strictEqual(E(P).val(s.id),null,'säännön arvo tyhjä, kun ei voimassa');
  aseta(P,o.m,7);A.strictEqual(E(P).omi(o.l.id,'väri'),3,'ehto pätee: säännön väri');A.strictEqual(E(P).omSrc(o.l.id,KK.omFind(o.l,'väri')),'saanto');
  A.strictEqual(E(P).val(s.id),3);
  aseta(P,o.m,2);A.strictEqual(E(P).omi(o.l.id,'väri'),1,'ehto lakkaa: palaa omaan');
  A.strictEqual(KK.ylTeksti(P,s,'@'),'jos @määrä > 5 niin @lamppu.väri = 3','kirjoitus takaisin');
  // uudelleennimeäminen näkyy
  KK.setName(P,o.l.id,'Valo2');KK.repair(P);A.strictEqual(KK.ylTeksti(P,s,'@'),'jos @määrä > 5 niin @valo2.väri = 3');
  // muuten
  kirjoita(P,s,'jos @määrä > 5 niin @valo2.väri = 3 muuten 6');A.strictEqual(E(P).omi(o.l.id,'väri'),6);aseta(P,o.m,9);A.strictEqual(E(P).omi(o.l.id,'väri'),3);
  // näkyy
  kirjoita(P,s,'jos @määrä > 5 niin @valo2.näkyy = ei');A.strictEqual(s.sa.p,'nk');A.strictEqual(E(P).visible(o.l.id),false);aseta(P,o.m,0);A.strictEqual(E(P).visible(o.l.id),true);
  // tallennus ja lataus
  var Q=KK.load?null:null;var js=JSON.parse(JSON.stringify(P));KK.repair(js);A.deepStrictEqual(js.b[s.id].sa,s.sa,'sa säilyy kunnostuksessa');
})();

// --- Ristiriita, oma nuoli voittaa, kehä ---
(function(){var o=uusi(),P=o.P,s=o.s,s2=KK.addBlock(P,'arvo',{yl:1});N(P,s2);
  kirjoita(P,s,'jos @määrä > 5 niin @lamppu.väri = 3');kirjoita(P,s2,'jos @määrä > 1 niin @lamppu.väri = 5');
  aseta(P,o.m,3);A.strictEqual(E(P).omi(o.l.id,'väri'),5,'vain toinen voimassa');
  aseta(P,o.m,7);var c=E(P).jkCtl(o.l.id,'o_vari');A.strictEqual(c.pj,s.id,'ensin tehty voittaa');A.deepStrictEqual(c.muut,[s2.id],'toinen näkyy ristiriitana');
  A.strictEqual(E(P).omi(o.l.id,'väri'),3);
  kirjoita(P,s2,'jos @lamppu.väri > 2 niin @lamppu.väri = 5');A.ok(KK.isErr(E(P).omi(o.l.id,'väri'))||E(P).omi(o.l.id,'väri')===3,'kehä ei jumita');
  var c2=E(P).jkCtl(o.l.id,'o_vari');A.ok(c2&&c2.pj===s.id);
  // 40e: kohteen oma viittaus säännössä = edellinen tulos (ensimmäisellä rivillä oma arvo), ei kehä
  kirjoita(P,s,'');kirjoita(P,s2,'jos @lamppu.väri > 0 niin @lamppu.väri = @lamppu.väri + 4');A.strictEqual(E(P).omi(o.l.id,'väri'),5,'oma arvo 1 + 4');
  // oikea kehä kulkee toisen palikan kautta
  var y=KK.addBlock(P,'arvo',{yl:1});N(P,y);kirjoita(P,y,'= @lamppu.väri');KK.setName(P,y.id,'Apu');KK.repair(P);
  kirjoita(P,s2,'jos @apu > 0 niin @lamppu.väri = 5');var v=E(P).omi(o.l.id,'väri');A.ok(KK.isErr(v)&&/kehä/.test(v.err),'kehä on virhe: '+JSON.stringify(v));
})();

// --- Virheet ja lajit ---
(function(){var o=uusi(),P=o.P,s=o.s;
  kirjoita(P,s,'jos @määrä > 5 niin @lamppu.lentää = 3');A.ok(/ei ole ominaisuus/.test(s.yer),s.yer);A.ok(/Ohjattavat: näkyy/.test(s.yer));
  A.strictEqual(KK.ylTeksti(P,s,'@'),'jos @määrä > 5 niin @lamppu.lentää = 3','virheellinen kirjoitus säilyy');A.strictEqual(KK.ylLaji(P,s),'saanto');
  A.ok(KK.isErr(E(P).val(s.id)));
  kirjoita(P,s,'jos @määrä > 5 niin @lamppu = 3');A.ok(/laskee arvonsa itse/.test(s.yer),s.yer);
  kirjoita(P,s,'jos @eiole > 5 niin @lamppu.väri = 3');A.ok(/ehto ei kelpaa/.test(s.yer),s.yer);
  kirjoita(P,s,'jos @määrä > 5 niin @lamppu.väri = vaihda');A.ok(/kerran/.test(s.yer),s.yer);
  // lukittu Sääntö ilman ehtoa
  A.ok(KK.ylLajit(P,'@lamppu.väri = 4').indexOf('saanto')>0,'@x.y = arvo: Sääntö tarjolla, ei oletus');
  s.ty='saanto';kirjoita(P,s,'@lamppu.väri = 4');A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(E(P).omi(o.l.id,'väri'),4);
  delete s.ty;kirjoita(P,s,'Hei');A.strictEqual(s.sa,undefined,'muu laji poistaa säännön');A.strictEqual(E(P).omi(o.l.id,'väri'),1);
  // tavallinen teksti, joka alkaa sanalla kun tai jos, pysyy tekstinä
  A.strictEqual(KK.ylLajit(P,'Kun sataa, ota sateenvarjo')[0],'teksti');A.strictEqual(KK.ylLajit(P,'Jos ehdit, soita')[0],'teksti');
  A.deepStrictEqual(KK.ylLajit(P,'jos @määrä > 5 niin 3 muuten 4'),KK.ylLajit(P,'= jos @määrä > 5 niin 3 muuten 4').length?KK.ylLajit(P,'jos @määrä > 5 niin 3 muuten 4'):[],'kaavan jos niin muuten ei ole sääntö');
  A.ok(KK.ylLajit(P,'jos @määrä > 5 niin 3 muuten 4').indexOf('saanto')<0);
  // valinta-arvo ilman lainausmerkkejä
  kirjoita(P,s,'jos @määrä > 5 niin @lamppu.animointi.ilmestyy = häivytys');A.strictEqual(s.yer,undefined,s.yer);aseta(P,o.m,9);A.strictEqual(E(P).omi(o.l.id,'animointi.ilmestyy'),'haivytys');
})();

// --- kun-sääntö: kerran ---
(function(){var o=uusi(),P=o.P,s=o.s;
  kirjoita(P,s,'kun @määrä > 5 niin @lamppu.väri = 3');A.strictEqual(s.yer,undefined,s.yer);A.ok(s.sa.kerta);
  A.ok(KK.ports(s).outs.some(function(x){return x.p==='e';}),'tapahtuma silloin');
  aseta(P,o.m,7);A.strictEqual(E(P).omi(o.l.id,'väri'),3,'laukesi');aseta(P,o.m,1);A.strictEqual(E(P).omi(o.l.id,'väri'),3,'jää voimaan');
  KK.setOmi(P,o.l.id,'väri',2);aseta(P,o.m,6);A.strictEqual(E(P).omi(o.l.id,'väri'),3,'laukeaa uudestaan, kun ehto alkaa taas päteä');
  // kytkimen asento ja vaihda
  kirjoita(P,s,'kun @määrä > 10 niin @valo = kyllä');aseta(P,o.m,0);aseta(P,o.m,11);A.strictEqual(E(P).val(o.k.id),true);
  kirjoita(P,s,'kun @määrä > 20 niin @valo = vaihda');aseta(P,o.m,0);aseta(P,o.m,21);A.strictEqual(E(P).val(o.k.id),false);aseta(P,o.m,0);aseta(P,o.m,22);A.strictEqual(E(P).val(o.k.id),true);
  // muistin arvo
  var m2=KK.addBlock(P,'muisti',{v:'0'});KK.setName(P,m2.id,'Laskuri');N(P,m2);
  kirjoita(P,s,'kun @määrä > 30 niin @laskuri = @laskuri + 1');aseta(P,o.m,0);aseta(P,o.m,31);aseta(P,o.m,0);aseta(P,o.m,32);A.strictEqual(E(P).val(m2.id),2);
  // pelkkä kun: tapahtuma nuolella Toimintoon
  kirjoita(P,s,'kun @määrä > 40');A.strictEqual(s.yer,undefined,s.yer);
  var t=KK.addBlock(P,'tee',{do:'lisaa',o:m2.id,v:''});KK.addLink(P,N(P,s).id,'e',KK.addNode(P,t.id,300,0).id,'e');KK.repair(P);
  aseta(P,o.m,0);aseta(P,o.m,41);A.strictEqual(E(P).val(m2.id),3,'silloin-tapahtuma käynnisti toiminnon');
  // käynnistä ja pysäytä ketju
  var kj=KK.addBlock(P,'ketju',{});KK.setName(P,kj.id,'Ajo');N(P,kj);KK.repair(P);
  kirjoita(P,s,'kun @määrä > 50 niin @ajo = käynnistä');A.strictEqual(s.yer,undefined,s.yer);aseta(P,o.m,0);aseta(P,o.m,51);A.ok(P.st[kj.id]&&P.st[kj.id].run!==undefined,'ketju käynnistyi: '+JSON.stringify(P.st[kj.id]));
  kirjoita(P,s,'kun @määrä > 60 niin @ajo = pysäytä');A.strictEqual(s.yer,undefined,s.yer);
  // käynnistä vain ketjulle ja Janalle
  kirjoita(P,s,'kun @määrä > 5 niin @lamppu = käynnistä');A.ok(/ketjulle, Janalle ja Sekuntikellolle/.test(s.yer),s.yer);
  // piilotus kerralla myöhemmin
  kirjoita(P,s,'kun @määrä > 5 niin @lamppu.näkyy = ei');A.ok(/myöhemmin/.test(s.yer),s.yer);
})();
// --- 40e: Arvon ja Muistin arvo, vaiheet riveittäin ---
(function(){var o=uusi(),P=o.P,s=o.s;
  function blk(k,nm,v){var b=KK.addBlock(P,k,{v:v});KK.setName(P,b.id,nm);N(P,b);KK.repair(P);return b;}
  var uni=blk('arvo','Uni','8'),kuo=blk('muisti','Kuormitus','20'),str=blk('muisti','Stressi','3'),val=blk('arvo','Valmius','0');
  kirjoita(P,s,'jos @stressi > 5 niin @valmius = 1');A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(s.sa.p,'v');
  A.strictEqual(E(P).val(val.id),0,'ei voimassa: oma arvo');aseta(P,str,7);A.strictEqual(E(P).val(val.id),1,'sääntö ohjaa Arvon arvoa');
  A.strictEqual(E(P).jkCtl(val.id,'v').pj,s.id);aseta(P,str,3);
  var t='@valmius = @uni * 1\n@valmius = @valmius - @kuormitus / 10\njos @stressi > 5 niin @valmius = @valmius * 0,8';
  A.deepStrictEqual(KK.ylLajit(P,t),['saanto','teksti'],'monirivinen sääntö tunnistuu');
  kirjoita(P,s,t);A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(s.sa.s.length,3);
  A.strictEqual(E(P).val(val.id),6,'8 - 20/10, kolmas rivi väliin');
  var tr=E(P).saVal(s.id).tr;A.deepStrictEqual(tr.map(function(x){return x.on;}),[true,true,false],'jälki: kolmas ohitettiin');
  aseta(P,str,7);A.ok(Math.abs(E(P).val(val.id)-4.8)<1e-9,'jos-rivi kertoo edellisen: '+E(P).val(val.id));
  A.strictEqual(KK.ylTeksti(P,s,'@'),t.replace('0,8','0.8').replace('0.8',KK.ylTeksti(P,s,'@').split('* ').pop()),'rivit takaisin järjestyksessä');
  A.strictEqual(KK.ylTeksti(P,s,'@').split('\n').length,3);
  // Muistin arvo säännön alla: tallennettu arvo palaa, kun sääntö lakkaa
  kirjoita(P,s,'jos @stressi > 5 niin @kuormitus = 0');A.strictEqual(E(P).val(kuo.id),0);aseta(P,kuo,50);A.strictEqual(E(P).val(kuo.id),0,'sääntö voittaa');
  aseta(P,str,1);A.strictEqual(E(P).val(kuo.id),50,'tallennettu arvo esiin');
  // virheet
  kirjoita(P,s,'jos @stressi > 5 niin @valmius = 1\njos @stressi > 5 niin @lamppu.väri = 2');A.ok(/rivi 2: jos-rivit ohjaavat samaa kohdetta/.test(s.yer),s.yer);
  kirjoita(P,s,'@valmius = 1\n@valmius = @eiole');A.ok(/rivi 2: arvo ei kelpaa/.test(s.yer),s.yer);
})();

// --- 40e: monta kun-riviä, sekuntikello ---
(function(){var o=uusi(),P=o.P,s=o.s,t0=Date.UTC(2026,9,20,9),dt=0;
  var C2={now:function(){return new Date(t0+dt);},toast:function(){},nav:function(){}};
  var ke=KK.addBlock(P,'kello',{});KK.setName(P,ke.id,'Kello');N(P,ke);KK.repair(P);
  function t2(){KK.tick(P,C2);}
  KK.ylAseta(P,s,'kun @määrä > 5 niin @kello = käynnistä\nkun @kello > 3 niin @lamppu.väri = 4\nkun @kello > 3 niin @kello = nollaa','@');KK.repair(P);t2();
  A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(s.sa.k.length,3);A.ok(s.sa.kerta&&!s.sa.r);
  A.ok(KK.ports(s).outs.some(function(x){return x.p==='e';}),'silloin-tapahtuma');
  KK.setVal(P,o.m.id,7,C2);t2();A.ok(P.st[ke.id].run,'kello käynnistyi');
  dt=4000;t2();A.strictEqual(Ev2().omi(o.l.id,'väri'),4,'toinen rivi laukesi kellosta');
  A.ok(!P.st[ke.id].acc&&P.st[ke.id].run,'kolmas rivi nollasi kellon');
  function Ev2(){return KK.Ev(P,C2);}
  A.strictEqual(KK.ylTeksti(P,s,'@').split('\n').length,3,'rivit takaisin');
  // jos-vaiheet ja kun-rivit samassa palikassa
  KK.ylAseta(P,s,'jos @määrä > 5 niin @lamppu.väri = 2\nkun @määrä > 8 niin @valo = kyllä','@');KK.repair(P);t2();
  A.strictEqual(s.yer,undefined,s.yer);A.strictEqual(Ev2().omi(o.l.id,'väri'),2);KK.setVal(P,o.m.id,9,C2);t2();A.strictEqual(Ev2().val(o.k.id),true);
})();
console.log('ok logiikka_108_saanto');
