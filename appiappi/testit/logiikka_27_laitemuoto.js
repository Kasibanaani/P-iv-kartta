// Pajakone 1: näkymän laitemuoto. Moottorin osuus: laitteet ja niiden koot, laite näkymälle,
// sisällön alareuna (vain ruudun leveydellä olevat näkymäpalikat, sijainnit ja alueet eivät laske),
// repair poistaa tuntemattoman laitteen ja säilyttää vanhan projektin ennallaan.
var KK=require('./moottori.js'),A=require('assert');

A.deepStrictEqual(KK.LAITEJ,['puhelin','puhelinv','ipad','ipadv']);
A.deepStrictEqual([KK.LAITE.puhelinv.w,KK.LAITE.puhelinv.h],[844,390]);
A.deepStrictEqual([KK.LAITE.puhelin.w,KK.LAITE.puhelin.h],[390,844]);
A.deepStrictEqual([KK.LAITE.ipad.w,KK.LAITE.ipad.h],[820,1180]);
A.deepStrictEqual([KK.LAITE.ipadv.w,KK.LAITE.ipadv.h],[1180,820]);
// Asetusten versioteksti (kartoitus 4, P13): KK.PAJA = TILA.md:n Valmiina-listan suurin Appi-appi-numero.
var tila=require('fs').readFileSync(__dirname+'/../TILA.md','utf8'),suurin=0;
tila.replace(/^- Appi-appi (\d+)(?:[a-z]*–(\d+))?/gm,function(m,a,b){suurin=Math.max(suurin,+a,+(b||0));});
A.ok(suurin>=37);A.strictEqual(KK.PAJA,String(suurin),'KK.PAJA ('+KK.PAJA+') ei vastaa TILA.md:n uusinta versiota '+suurin);

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
// Pajakone 2: rullausvauhti. Hitaampi tai lukittu palikka ei pidennä rullattavaa; repair korjaa arvon.
var R2=KK.newProject('rv'),rvw=R2.views[0].id;R2.views[0].laite='puhelin';
var bg=KK.addBlock(R2,'muoto',{v:rvw});bg.x=0;bg.y=0;bg.h=3000;bg.rv=30;
A.strictEqual(KK.laiteBottom(R2,rvw),844,'taustakuva hitaalla vauhdilla ei pidennä');
var bar=KK.addBlock(R2,'nappi',{v:rvw});bar.x=0;bar.y=790;bar.h=54;bar.rv=0;A.strictEqual(KK.laiteBottom(R2,rvw),844);
bg.rv='45,6';bar.rv=100;var ln=KK.addBlock(R2,'nappi',{v:rvw});ln.rv='x';var ng=KK.addBlock(R2,'nappi',{v:rvw});ng.rv=-5;KK.repair(R2);
A.strictEqual(bg.rv,46);A.strictEqual(bar.rv,100,'100 säilyy (ohittaa kerroksen)');A.strictEqual(ln.rv,undefined);A.strictEqual(ng.rv,0);
// Pajakone 3b: kerrokset. Pohja aina mukana, järjestys, palikan kerros, kerroksen vauhti ja palikan oma vauhti, repair.
var K3=KK.newProject('kr'),kv=K3.views[0].id;K3.views[0].laite='puhelin';
A.deepStrictEqual(KK.kerrokset(K3,kv).map(function(k){return k.id;}),['pohja']);
var p1=KK.addBlock(K3,'nappi',{v:kv});p1.x=0;p1.y=2000;p1.h=40;A.strictEqual(KK.kerrosOf(K3,p1).k.id,'pohja');A.strictEqual(KK.rvOf(K3,p1),100);
K3.views[0].kr=[{id:'k1',n:'Tausta',rv:30},{id:'pohja',n:'Pohja'},{id:'k2',n:'Palkki',rv:0}];
A.deepStrictEqual(KK.kerrokset(K3,kv).map(function(k){return k.id;}),['k1','pohja','k2'],'järjestys alhaalta ylös');
var p2=KK.addBlock(K3,'muoto',{v:kv,kr:'k1'});p2.x=0;p2.y=0;p2.h=5000;var p3=KK.addBlock(K3,'nappi',{v:kv,kr:'k2'});p3.x=0;p3.y=790;p3.h=54;
A.strictEqual(KK.kerrosOf(K3,p2).i,0);A.strictEqual(KK.kerrosOf(K3,p3).i,2);A.strictEqual(KK.rvOf(K3,p2),30);A.strictEqual(KK.rvOf(K3,p3),0);
A.strictEqual(KK.laiteBottom(K3,kv),2040,'hidas ja lukittu kerros eivät pidennä');
p3.rv=100;A.strictEqual(KK.rvOf(K3,p3),100,'palikan oma vauhti ohittaa kerroksen');delete p3.rv;
// Repair: tuplat, kelvottomat id:t ja vauhdit pois, pohja lisätään, tuntematon palikan kerros pois, pelkkä oletuspohja pois
K3.views[0].kr=[{id:'k1',n:'Tausta',rv:'25'},{id:'k1',n:'tupla'},{id:'xx'},{id:'k2',n:'Palkki',rv:0,piilo:true,lukko:'joo'},'roska'];p2.kr='k1';var p4=KK.addBlock(K3,'nappi',{v:kv,kr:'k9'});KK.repair(K3);
A.deepStrictEqual(K3.views[0].kr,[{id:'pohja',n:'Pohja'},{id:'k1',n:'Tausta',rv:25},{id:'k2',n:'Palkki',rv:0,piilo:true}]);A.strictEqual(p4.kr,undefined);A.strictEqual(p2.kr,'k1');
var K4=KK.newProject('kr2');K4.views[0].kr=[{id:'pohja',n:'Pohja'}];var p5=KK.addBlock(K4,'nappi',{v:K4.views[0].id,kr:'pohja'});KK.repair(K4);A.strictEqual(K4.views[0].kr,undefined);A.strictEqual(p5.kr,undefined);
K4.views[0].kr=[{id:'pohja',n:'Pohja',rv:0}];KK.repair(K4);A.deepStrictEqual(K4.views[0].kr,[{id:'pohja',n:'Pohja',rv:0}],'lukittu pohja säilyy');
// Tallennus
var Q3=KK.repair(JSON.parse(JSON.stringify(K3)));A.strictEqual(KK.rvOf(Q3,Q3.b[p2.id]),25);
console.log('laitemuoto ok');
