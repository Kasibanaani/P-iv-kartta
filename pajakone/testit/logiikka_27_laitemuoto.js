// Pajakone 1: näkymän laitemuoto. Moottorin osuus: laitteet ja niiden koot, laite näkymälle,
// sisällön alareuna (vain ruudun leveydellä olevat näkymäpalikat, sijainnit ja alueet eivät laske),
// repair poistaa tuntemattoman laitteen ja säilyttää vanhan projektin ennallaan.
var KK=require('./moottori.js'),A=require('assert');

A.deepStrictEqual(KK.LAITEJ,['puhelin','ipad','ipadv']);
A.deepStrictEqual([KK.LAITE.puhelin.w,KK.LAITE.puhelin.h],[390,844]);
A.deepStrictEqual([KK.LAITE.ipad.w,KK.LAITE.ipad.h],[820,1180]);
A.deepStrictEqual([KK.LAITE.ipadv.w,KK.LAITE.ipadv.h],[1180,820]);
A.strictEqual(KK.PAJA,'1');

var P=KK.newProject('laite'),vw=P.views[0].id;
A.strictEqual(KK.laite(P,vw),null,'uusi näkymä on vapaa');
P.views[0].laite='puhelin';
A.deepStrictEqual(KK.laite(P,vw),{k:'puhelin',n:'Puhelin',w:390,h:844});
A.strictEqual(KK.laite(P,'eiole'),null);

// Alareuna: vähintään ruudun korkeus
A.strictEqual(KK.laiteBottom(P,vw),844);
var a=KK.addBlock(P,'nappi',{v:vw});a.x=40;a.y=100;a.h=44;
A.strictEqual(KK.laiteBottom(P,vw),844);
var b=KK.addBlock(P,'nayta',{v:vw});b.x=20;b.y=1200;b.h=40;
A.strictEqual(KK.laiteBottom(P,vw),1240,'ruudun alapuolella oleva palikka pidentää rullattavaa');
var c=KK.addBlock(P,'nappi',{v:vw});c.x=600;c.y=3000;c.h=44;
A.strictEqual(KK.laiteBottom(P,vw),1240,'kehyksen sivulla oleva palikka ei pidennä');
var m=KK.addBlock(P,'merkki',{v:vw});m.x=10;m.y=5000;
var al=KK.addBlock(P,'alue',{v:vw});al.x=0;al.y=4000;
A.strictEqual(KK.laiteBottom(P,vw),1240,'sijainnit ja alueet eivät pidennä');
var d=KK.addBlock(P,'nappi',{v:vw});d.x=-100;d.w=120;d.y=1500;d.h=50;
A.strictEqual(KK.laiteBottom(P,vw),1550,'osittain ruudulla oleva palikka pidentää');
// Toisen näkymän palikat eivät vaikuta
P.views.push({id:'v2',n:'Toinen'});P.vseq=2;
var e=KK.addBlock(P,'nappi',{v:'v2'});e.x=10;e.y=9000;
A.strictEqual(KK.laiteBottom(P,vw),1550);
A.strictEqual(KK.laiteBottom(P,'v2'),0,'vapaalla näkymällä ei alareunaa');

// Repair: tuntematon laite pois, kelvollinen säilyy
P.views[1].laite='kello';KK.repair(P);
A.strictEqual(P.views[1].laite,undefined);
A.strictEqual(P.views[0].laite,'puhelin');
// Tallennus ja palautus säilyttävät laitteen
var Q=KK.repair(JSON.parse(JSON.stringify(P)));
A.strictEqual(Q.views[0].laite,'puhelin');
// Vanha Kytköskartan projekti aukeaa ilman laitetta
var old=KK.repair(KK.newProject('vanha'));A.strictEqual(old.views[0].laite,undefined);
console.log('laitemuoto ok');
