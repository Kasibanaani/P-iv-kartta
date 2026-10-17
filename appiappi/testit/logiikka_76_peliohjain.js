// F33 vaihe 1: Peliohjain (moottori). Valeohjaimen tila synteettisenä: kuollut alue, ominaisuudet ja kaavat, tapahtumat
// (yhdistyi, painettu, irti, irtosi; tiedoissa nappi), KUN ohjain.alanappi, Tatti seuraa ohjaimen tattia (sormi voittaa),
// Painike reagoi nappiin (piilossa ei, kertapainallus, pohjassa vain painettaessa, pitkä painallus), kaksi pelaajaa,
// irtoaminen palauttaa lepoon, tila ei tallennu, korjaus ja vanha projekti.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,21,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function prop(P,id,p){return E(P).prop(id,p);}
function kaava(P,f){var b=KK.addBlock(P,'kaava');KK.addNode(P,b.id,-600,0);b.f=KK.kaavaToIds(P,f);return b;}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.K[k].g==='ui'?null:KK.addNode(P,b.id,x||0,y||0);return {b:b,n:n};}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+ap+' → '+bp);return l;}
function laskuri(P,src,p,y){var m=blk(P,'muisti',{v:0},600,y),t=blk(P,'tee',{do:'lisaa',o:m.b.id,v:1},300,y);link(P,src,p,t,'e');return m.b.id;}
function napit(o){var n=[];for(var i=0;i<16;i++)n.push(0);for(var k in o)n[KK.PADN.indexOf(k)]=o[k];return n;}
function pad(P,pel,nap,tat,id){return KK.ohjainSet(P,pel,{id:id||'Xbox Wireless Controller',napit:napit(nap||{}),tatit:tat||[0,0,0,0]},C);}

var P=KK.newProject('ohjain');var vw=P.views[0].id;
var oh=blk(P,'pohj',{});KK.setName(P,oh.b.id,'Ohjain');KK.repair(P);
A.strictEqual(oh.b.vt,'ohjain');A.strictEqual(oh.b.pel,1);A.strictEqual(oh.b.kuollut,0.15);
A.deepStrictEqual(KK.portsBase(oh.b).outs.map(function(o){return o.p;}),['v','x','y','d','s','pa','ir','yh','it']);
['yhdistetty','vaaka','pysty','etäisyys','suunta','oikeavaaka','oikeapysty','nimi','alanappi','ylänappi','ylanappi','vasenliipaisin','ylös','ylos','valikko'].forEach(function(n){A.ok(KK.omFind(oh.b,n),'ominaisuus '+n);});
A.ok(!KK.omat(oh.b).some(function(e){return e.o;}),'mikään ei ole asetettava: arvot tulevat laitteesta');
// 1 Ei yhdistetty: ei, nollat, tyhjä nimi; Miksi?
A.strictEqual(val(P,oh.b.id),false);A.strictEqual(val(P,oh.b.id,'x'),0);A.strictEqual(prop(P,oh.b.id,'alanappi'),false);A.strictEqual(prop(P,oh.b.id,'nimi'),'');
A.ok(/ei ole yhdistetty/.test(KK.why(P,E(P),oh.b.id).txt));
var nYh=laskuri(P,oh,'yh',0),nPa=laskuri(P,oh,'pa',100),nIr=laskuri(P,oh,'ir',200),nIt=laskuri(P,oh,'it',300);
var tp=blk(P,'tapaht',{nm:'Tapahtuma'},0,400),viim=blk(P,'muisti',{v:''},600,400),aseta=blk(P,'tee',{do:'aseta',o:viim.b.id,v:{r:kaava(P,'tapahtuma.nappi').id}},300,400);link(P,oh,'pa',aseta,'e');
// KUN ohjain.alanappi
var kun=blk(P,'kun',{},300,500),kk=kaava(P,'ohjain.alanappi');KK.addLink(P,KK.nodesOfBlock(P,kk.id)[0].id,'v',kun.n.id,'c');var nKun=laskuri(P,kun,'e',500);
KK.repair(P);
// 2 Yhdistyy: yhdistyi kerran, kuollut alue syö lepovärinän
var r=pad(P,1,{},[0.1,-0.05,0,0]);A.ok(r.muuttui);A.strictEqual(val(P,nYh),1);A.strictEqual(val(P,oh.b.id),true);A.strictEqual(prop(P,oh.b.id,'nimi'),'Xbox Wireless Controller');
A.strictEqual(val(P,oh.b.id,'x'),0,'kuollut alue');A.strictEqual(val(P,oh.b.id,'d'),0);
pad(P,1,{},[0.1,-0.05,0,0]);A.strictEqual(val(P,nYh),1,'sama tila ei lähetä uudelleen');A.strictEqual(pad(P,1,{},[0.1,-0.05,0,0]).muuttui,false);
// 3 Tatti kuolleen alueen yli skaalautuu 0…1
pad(P,1,{},[0.575,0,0,-1]);A.strictEqual(val(P,oh.b.id,'x'),0.5);A.strictEqual(val(P,oh.b.id,'s'),90);A.strictEqual(prop(P,oh.b.id,'oikeapysty'),-1);
var kv=kaava(P,'ohjain.vaaka * 10');A.strictEqual(val(P,kv.id),5,'kaavassa samat nimet kuin Tatilla');
oh.b.kuollut=0;pad(P,1,{},[0.6,0,0,0]);A.strictEqual(val(P,oh.b.id,'x'),0.6,'kuollut alue 0');oh.b.kuollut=0.15;
// 4 Napit: painettu, nappi tiedoissa, KUN, liipaisin 0–1
pad(P,1,{alanappi:1},[0,0,0,0]);A.strictEqual(val(P,nPa),1);A.strictEqual(val(P,viim.b.id),'alanappi');A.strictEqual(prop(P,oh.b.id,'alanappi'),true);A.strictEqual(val(P,nKun),1,'KUN ohjain.alanappi');
A.ok(/painettuna alanappi/.test(KK.why(P,E(P),oh.b.id).txt));
pad(P,1,{alanappi:1,oikealiipaisin:0.3});A.strictEqual(prop(P,oh.b.id,'oikealiipaisin'),0.3);A.strictEqual(val(P,nPa),1,'puoliksi alle 0,5 ei ole painallus');
pad(P,1,{alanappi:1,oikealiipaisin:0.8});A.strictEqual(val(P,nPa),2);A.strictEqual(val(P,viim.b.id),'oikealiipaisin');
pad(P,1,{});A.strictEqual(val(P,nIr),2,'kaksi irti');A.strictEqual(val(P,nKun),1);
pad(P,1,{alanappi:1});A.strictEqual(val(P,nKun),2,'KUN laukeaa uudelleen');pad(P,1,{});
// 5 Tila ei tallennu eikä näy käyttötiedoissa
A.ok(JSON.stringify(P).indexOf('Xbox')<0,'ohjaimen tila ei ole projektissa');
// 6 Tatti seuraa ohjainta; sormi voittaa; alkaa ja loppuu
var tt=blk(P,'tatti',{v:vw});tt.b.pad='vasen';var ttn=KK.addNode(P,tt.b.id,0,700);tt.n=ttn;var nTa=laskuri(P,tt,'e',700),nTl=laskuri(P,tt,'irti',800);
var tt2=blk(P,'tatti',{v:vw});tt2.b.pad='oikea';tt2.b.padp='2';KK.repair(P);A.strictEqual(tt2.b.padp,2);
pad(P,1,{},[0.575,0,0,0]);A.strictEqual(val(P,tt.b.id,'x'),0.5);A.strictEqual(val(P,nTa),1,'alkaa');A.strictEqual(val(P,tt2.b.id),0,'pelaajan 2 tatti ei liiku');
pad(P,1,{},[0,0.575,0,0]);A.strictEqual(val(P,tt.b.id,'y'),0.5);A.strictEqual(val(P,nTa),1,'alkaa vain kerran');
pad(P,1,{},[0.05,0,0,0]);A.strictEqual(val(P,tt.b.id),0);A.strictEqual(val(P,nTl),1,'loppuu');
KK.tattiSet(P,tt.b.id,-1,0,C,'alku');var Cs=Object.create(C);Cs.sormi={};Cs.sormi[tt.b.id]=1;
KK.ohjainSet(P,1,{id:'X',napit:napit({}),tatit:[0.9,0,0,0]},Cs);A.strictEqual(val(P,tt.b.id,'x'),-1,'sormi voittaa');
KK.tattiSet(P,tt.b.id,0,0,C,'loppu');pad(P,1,{});
// 7 Painike reagoi nappiin: kertapainallus, piilossa ei, toinen näkymä ei, pohjassa vain painettaessa + kesto, pitkä painallus
var nb=blk(P,'nappi',{v:vw,beh:'kerta',padn:'ylänappi'});nb.n=KK.addNode(P,nb.b.id,0,900);var nNb=laskuri(P,nb,'e',900);
var nh=blk(P,'nappi',{v:vw,beh:'kerta',padn:'ylanappi'});nh.n=KK.addNode(P,nh.b.id,0,1000);var nNh=laskuri(P,nh,'e',1000);var ei=blk(P,'arvo',{v:'ei'},-300,1000);link(P,ei,'v',nh,'nk');KK.repair(P);A.strictEqual(nh.b.padn,'ylänappi','nimi ilman pisteitä korjautuu');
KK.ohjainSet(P,1,{id:'X',napit:napit({'ylänappi':1}),tatit:[0,0,0,0]},C);
A.strictEqual(val(P,nb.b.id),1,'painalluksia 1');A.strictEqual(val(P,nNb),1);A.strictEqual(E(P).state(nh.b.id),'piilossa');A.strictEqual(val(P,nNh),0,'piilossa ei reagoi');
A.ok(KK.padPohjassa(P,nb.b.id));A.ok(/nappiin ylänappi \(pohjassa nyt\)/.test(KK.why(P,E(P),nb.b.id).txt));
pad(P,1,{});A.ok(!KK.padPohjassa(P,nb.b.id));
var Cv=Object.create(C);Cv.vw='toinen';KK.ohjainSet(P,1,{id:'X',napit:napit({'ylänappi':1}),tatit:[0,0,0,0]},Cv);A.strictEqual(val(P,nNb),1,'toisen näkymän painike ei reagoi');pad(P,1,{});
var np=blk(P,'nappi',{v:vw,beh:'pida',padn:'valikko'});np.n=KK.addNode(P,np.b.id,0,1100);var nPi=laskuri(P,np,'pitka',1100);KK.repair(P);
pad(P,1,{valikko:1});A.strictEqual(val(P,np.b.id),true,'pohjassa');NOW+=300;pad(P,1,{valikko:1});A.strictEqual(val(P,nPi),0);
NOW+=300;pad(P,1,{valikko:1});A.strictEqual(val(P,nPi),1,'pitkä painallus');NOW+=100;pad(P,1,{valikko:1});A.strictEqual(val(P,nPi),1,'vain kerran');
NOW+=200;pad(P,1,{});A.strictEqual(val(P,np.b.id),false);A.strictEqual(val(P,np.b.id,'k'),0.9,'painalluksen kesto');
// 8 Kaksi pelaajaa: pelaajan 2 palikka ei näe pelaajaa 1
var o2=blk(P,'pohj',{pel:2});KK.setName(P,o2.b.id,'Ohjain2');KK.repair(P);
pad(P,1,{alanappi:1});A.strictEqual(prop(P,o2.b.id,'alanappi'),false);A.strictEqual(val(P,o2.b.id),false);
pad(P,2,{alanappi:1},[0,0,0.575,0],'DualSense');A.strictEqual(prop(P,o2.b.id,'nimi'),'DualSense');A.strictEqual(val(P,tt2.b.id,'x'),0.5,'pelaajan 2 oikea tatti');
// 9 Irtoaminen: irtosi, napit ja tatit lepoon, Tatti keskelle ja loppuu
pad(P,1,{},[0.9,0,0,0]);var tl0=val(P,nTl);
KK.ohjainSet(P,1,null,C);A.strictEqual(val(P,nIt),1,'irtosi');A.strictEqual(val(P,oh.b.id),false);A.strictEqual(val(P,tt.b.id),0);A.strictEqual(val(P,nTl),tl0+1,'tatti loppuu irrotessa');
KK.ohjainSet(P,2,null,C);A.strictEqual(val(P,tt2.b.id),0);
// 10 Korjaus ja vanha projekti
var Q=KK.newProject('v');var qv=Q.views[0].id,q1=KK.addBlock(Q,'pohj',{pel:9,kuollut:'2'}),q2=KK.addBlock(Q,'tatti',{v:qv,pad:'keski',padp:3}),q3=KK.addBlock(Q,'nappi',{v:qv,padn:'turbo',padp:2}),q4=KK.addBlock(Q,'nappi',{v:qv,padn:'alanappi',padp:1});
KK.repair(Q);A.strictEqual(q1.pel,1);A.strictEqual(q1.kuollut,0.5);A.ok(!('pad' in q2)&&!('padp' in q2));A.ok(!('padn' in q3)&&!('padp' in q3));A.strictEqual(q4.padn,'alanappi');A.ok(!('padp' in q4),'oletuspelaaja pois');
A.ok(!KK.padKaytossa(KK.newProject('t')));A.ok(KK.padKaytossa(Q));
console.log('ok peliohjain');
