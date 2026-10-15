// Appi-appi 5.1: maailma ja kamera (moottorin osuus): rullaus kaikkiin suuntiin, kameran rajat, seuranta, kuollut alue, pehmeys.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(1000000);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
var P=KK.newProject('k');var v=P.views[0];var vw=v.id;
var h=KK.addBlock(P,'muoto',{v:vw,x:180,y:400,w:40,h:40});
var puu=KK.addBlock(P,'muoto',{v:vw,x:-300,y:-200,w:100,h:100});
var maa=KK.addBlock(P,'alue',{v:vw,x:-1000,y:-1000,w:3000,h:3000});
// Ilman laitetta ei ole maailmaa eikä kameraa.
A.strictEqual(KK.lrul(P,vw),'');v.kam={o:h.id};A.strictEqual(KK.kamera(P,vw),null);A.strictEqual(KK.kameraRajat(P,vw,C),null);
v.laite='puhelin';
// Kamera: oletukset 30 % ja 40 %, seuranta tarkoittaa kaikkiin suuntiin.
var k=KK.kamera(P,vw);A.deepStrictEqual(k,{o:h.id,ka:30,pe:40,ra:''});A.strictEqual(KK.lrul(P,vw),'kaikki');
A.strictEqual(KK.kameraRajat(P,vw,C),null,'seuratessa ilman rajaa maailma jatkuu');
// Rullaus ilman kameraa
delete v.kam;A.strictEqual(KK.lrul(P,vw),'');v.lrul='kaikki';A.strictEqual(KK.lrul(P,vw),'kaikki');
var r=KK.kameraRajat(P,vw,C);A.deepStrictEqual(r,{x0:-1000,y0:-1000,x1:2000,y1:2000},'palikoiden mukaan (myös alue)');
maa.v='muu';r=KK.kameraRajat(P,vw,C);A.deepStrictEqual(r,{x0:-300,y0:-200,x1:390,y1:844});maa.v=vw;
// Lukittu kerros (rv 0) ei kasvata rajoja
var pal=KK.addBlock(P,'nappi',{v:vw,x:5000,y:5000,w:100,h:40,rv:0});r=KK.kameraRajat(P,vw,C);A.strictEqual(r.x1,2000);
// Rajaus: ruutu ei mene rajojen yli, pienempi suunta keskitetään
var scr={w:390,h:844};maa.v='muu';
var c=KK.kameraRajaa(P,vw,{x:-999,y:-999},scr,C);A.deepStrictEqual(c,{x:-300,y:-200});c=KK.kameraRajaa(P,vw,{x:-999,y:50},scr,C);A.deepStrictEqual(c,{x:-300,y:0});
c=KK.kameraRajaa(P,vw,{x:999,y:999},scr,C);A.deepStrictEqual(c,{x:0,y:0},'oikea ja ala reuna');
c=KK.kameraRajaa(P,vw,{x:-100,y:-100},{w:2000,h:100},C);near(c.x,-300-(2000-690)/2);A.strictEqual(c.y,-100);
maa.v=vw;
// Seuranta: heti kohdalle (dt null)
v.kam={o:h.id,ka:0,pe:0};delete v.lrul;
c=KK.kameraSeuraa(P,vw,{x:0,y:0},scr,null,C);A.deepStrictEqual(c,{x:200-195,y:420-422});
// Kuollut alue 50 %: säde = 0,5 × 390 / 2 = 97,5 px
v.kam={o:h.id,ka:50,pe:0};var cam={x:200-195,y:420-422};
h.x+=60;c=KK.kameraSeuraa(P,vw,cam,scr,0.016,C);A.deepStrictEqual(c,cam,'kuolleen alueen sisällä kamera ei liiku');
h.x+=100;c=KK.kameraSeuraa(P,vw,cam,scr,0.016,C);near(c.x,cam.x+160-97.5,0.01,'reunalla kamera lähtee mukaan');A.strictEqual(c.y,cam.y);
// Viistoon: keskipiste pysyy ympyrän kehällä
cam={x:0,y:0};h.x=195+300-20;h.y=422+400-20;c=KK.kameraSeuraa(P,vw,cam,scr,0.016,C);
var cx=c.x+195,cy=c.y+422;near(Math.hypot(495-cx,822-cy),97.5,0.02,'kehällä');near((495-cx)/(822-cy),300/400,0.001,'suunta säilyy');
// Pehmeys: kiinniotto vie aikaa ja on monotoninen
v.kam={o:h.id,ka:0,pe:100};cam={x:0,y:0};h.x=1000-20;h.y=422-20;
var c1=KK.kameraSeuraa(P,vw,cam,scr,0.1,C),c2=KK.kameraSeuraa(P,vw,c1,scr,0.1,C);
A.ok(c1.x>0&&c1.x<805&&c2.x>c1.x&&c2.x<805,'liukuu kohti: '+c1.x+' '+c2.x);
var cc=cam;for(var i=0;i<200;i++)cc=KK.kameraSeuraa(P,vw,cc,scr,0.05,C);near(cc.x,805,0.5,'asettuu lopulta');
// Rajat seuratessa: alue
v.kam={o:h.id,ka:0,pe:0,ra:maa.id};h.x=-990;h.y=-990;c=KK.kameraSeuraa(P,vw,{x:0,y:0},scr,null,C);A.deepStrictEqual(c,{x:-1000,y:-1000},'kamera ei näytä alueen ulkopuolta');
A.deepStrictEqual(KK.kameraRajat(P,vw,C),{x0:-1000,y0:-1000,x1:2000,y1:2000});
// Seurattava ohjattu ominaisuudella (Pajakone 4) tai siirrolla: kamera seuraa nykyistä paikkaa
P.st['o:'+h.id]={x:700,y:300};c=KK.kameraSeuraa(P,vw,{x:0,y:0},scr,null,C);A.deepStrictEqual(c,{x:720-195,y:320-422});delete P.st['o:'+h.id];
// Korjaus: rikkinäiset kentät pois, poistettu seurattava ja väärä raja pois
v.kam={o:'eiole',ka:'abc',pe:250,ra:h.id};v.lrul='vino';KK.repair(P);A.deepStrictEqual(v.kam,{pe:100});A.strictEqual(v.lrul,undefined);
v.kam={o:h.id,ka:'35'};KK.repair(P);A.deepStrictEqual(v.kam,{o:h.id,ka:35});
v.kam=[1];KK.repair(P);A.strictEqual(v.kam,undefined);
// Vanha projekti ilman kenttiä: pystyrullaus ennallaan
var Q=KK.newProject('q');Q.views[0].laite='puhelin';A.strictEqual(KK.lrul(Q,Q.views[0].id),'');A.strictEqual(KK.kamera(Q,Q.views[0].id),null);
// JSON-kierros
v.kam={o:h.id,ka:35};var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.deepStrictEqual(J.views[0].kam,{o:h.id,ka:35});
console.log('ok kamera');
