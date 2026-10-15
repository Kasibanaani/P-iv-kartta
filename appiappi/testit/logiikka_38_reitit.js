// Appi-appi 6: reitit. Reitti-palikka (pisteet, suljettu), Liikkeen ohjaus Reitti: kerran / edestakaisin / kierroksia,
// käynnistä ja pysäytä -tapahtumat, alkaa heti, liikkuu kun, edistyminen, päässä, kiihtyminen, kääntyminen, reitin siirto,
// alueet ja esteet reitillä kulkevan kanssa, repair.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||0.02;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
function laskuri(P,b,port){var m=LB(P,'muisti',{v:'0'}),t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function uusi(o){var P=KK.newProject('r');var vw=P.views[0].id;var rt=KK.addBlock(P,'reitti',{v:vw});rt.x=0;rt.y=0;rt.pts=[[0,0],[100,0],[100,100]];rt.w=100;rt.h=100;
  var h=KK.addBlock(P,'muoto',{v:vw});h.x=500;h.y=500;h.w=20;h.h=20;var li=LB(P,'liike',{o:h.id,ohj:'reitti',rt:rt.id,vm:100});for(var k in (o||{}))li[k]=o[k];KK.repair(P);
  return {P:P,rt:rt,h:h,li:li,vw:vw};}
function C2(o){var e=KK.Ev(o.P,C);return [e.omiNum(o.h.id,'x',0)+10,e.omiNum(o.h.id,'y',0)+10];}
// --- Geometria ---
var o=uusi();A.deepStrictEqual(o.rt.pts,[[0,0],[100,0],[100,100]]);A.deepStrictEqual(KK.ports(o.rt).outs,[]);
var ro=KK.reittiOsat(KK.reittiPisteet(o.P,KK.Ev(o.P,C),o.rt),false);A.strictEqual(ro.L,200);A.deepStrictEqual([KK.reittiKohta(ro,150).x,KK.reittiKohta(ro,150).y],[100,50]);
A.strictEqual(KK.reittiOsat(KK.reittiPisteet(o.P,null,o.rt),true).L,200+Math.hypot(100,100),'suljettu');
var kp=LB(o.P,'kaava',{});kp.f=KK.kaavaToIds(o.P,o.rt.vt+'.pituus');KK.repair(o.P);A.strictEqual(KK.Ev(o.P,C).val(kp.id),200);
A.deepStrictEqual(KK.ports(o.li).ins.map(function(x){return x.p;}),['vm','c','e','go','stop']);
A.deepStrictEqual(KK.ports(o.li).outs.map(function(x){return x.p;}),['v','y','m','osuu','nop','suu','tor','ed','per']);
// --- Kerran: alkuun reitin alkuun, kulkee, pysähtyy päähän ---
var per=laskuri(o.P,o.li,'per');KK.repair(o.P);
A.strictEqual(KK.frame(o.P,0,C),true,'haluaa liikkua');A.deepStrictEqual(C2(o),[0,0],'keskipiste reitin alussa');
run(o.P,1);near(C2(o)[0],100,0.5);near(C2(o)[1],0,0.5);near(KK.Ev(o.P,C).val(o.li.id,'ed'),0.5,0.01);A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'suu'),90);
run(o.P,0.5);near(C2(o)[1],50,0.5,'kääntyi alas');A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'suu'),180);
run(o.P,1);A.deepStrictEqual(C2(o),[100,100],'päässä');A.strictEqual(KK.Ev(o.P,C).val(per.id),1);A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'m'),false);A.strictEqual(KK.liikeKay(o.P,o.li.id),false,'silmukka voi pysähtyä');
run(o.P,0.5);A.strictEqual(KK.Ev(o.P,C).val(per.id),1,'ei uudelleen');
// Käynnistä päässä → alusta uudelleen
KK.liikeRun(o.P,o.li.id,true,C);run(o.P,0.5);near(C2(o)[0],50,0.5);near(C2(o)[1],0,0.5);
// Pysäytä ja jatka
KK.liikeRun(o.P,o.li.id,false,C);var c1=C2(o);run(o.P,0.5);A.deepStrictEqual(C2(o),c1,'pysäytetty');A.strictEqual(KK.liikeKay(o.P,o.li.id),false);
KK.liikeRun(o.P,o.li.id,true,C);run(o.P,0.2);near(C2(o)[0],c1[0]+20,0.5,'jatkaa samasta kohdasta');
// Tapahtumat nuolista
var Q=uusi({rta:false});var go=LB(Q.P,'nappi',{});var nap=KK.addBlock(Q.P,'nappi',{v:Q.vw,beh:'kerta'});
KK.addLink(Q.P,N(Q.P,nap).id,'e',N(Q.P,Q.li).id,'go');KK.repair(Q.P);A.strictEqual(Q.li.rta,false);
run(Q.P,0.5);A.strictEqual(KK.Ev(Q.P,C).val(Q.li.id,'m'),false,'ei ala heti');KK.press(Q.P,nap.id,C);run(Q.P,0.5);near(C2(Q)[0],50,0.6,'käynnistyi painikkeesta');
// Alkuun säilyttää käynnissä-tilan
KK.liikeAlkuun(Q.P,Q.li.id);A.strictEqual(Q.P.st[Q.li.id].run,true);run(Q.P,0.3);near(C2(Q)[0],30,0.6);
// Liikkuu kun -ehto
var eh=LB(Q.P,'arvo',{v:'ei'});KK.addLink(Q.P,N(Q.P,eh).id,'v',N(Q.P,Q.li).id,'c');KK.repair(Q.P);var c2=C2(Q);run(Q.P,0.3);A.deepStrictEqual(C2(Q),c2);eh.v='kyllä';run(Q.P,0.3);A.ok(C2(Q)[0]>c2[0]+20);
// --- Edestakaisin ---
o=uusi({rtt:'edestakaisin',vm:200});per=laskuri(o.P,o.li,'per');KK.repair(o.P);run(o.P,1.25);var c=C2(o);near(c[0],100,1,'tuli takaisin');near(c[1],50,4.5);A.strictEqual(KK.Ev(o.P,C).val(per.id),1);
run(o.P,0.75);near(C2(o)[0],0,4.5);A.strictEqual(KK.Ev(o.P,C).val(per.id),2,'alussa käännös');A.ok(KK.liikeKay(o.P,o.li.id),'jatkuu');
// --- Kierroksia suljetulla reitillä ---
o=uusi({rtt:'kierros',vm:100});o.rt.kier=true;per=laskuri(o.P,o.li,'per');KK.repair(o.P);var L=200+Math.hypot(100,100);
run(o.P,L/100+0.5);A.strictEqual(KK.Ev(o.P,C).val(per.id),1,'kierros täynnä');near(C2(o)[0],50,1);near(C2(o)[1],0,1);
// --- Kiihtyminen ---
o=uusi({ka:1});run(o.P,0.5);near(KK.Ev(o.P,C).val(o.li.id,'nop'),50,3,'kiihtyy');
// --- Kääntyy kulkusuuntaan ---
o=uusi({kaanny:'kaanny'});run(o.P,0.5);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),90);run(o.P,1);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),180);
// --- Reitti siirtyy palikan mukana ---
o=uusi();o.rt.x=50;run(o.P,0.5);near(C2(o)[0],100,0.5,'reitin alku 50 + 50');
// --- Alue tunnistaa reitillä kulkevan, ja se on este muille ---
o=uusi({vm:100});var al=KK.addBlock(o.P,'alue',{v:o.vw});al.x=40;al.y=-20;al.w=40;al.h=40;var ast=laskuri(o.P,al,'e');KK.repair(o.P);
run(o.P,0.5);A.strictEqual(KK.Ev(o.P,C).val(ast.id),1,'alue tunnisti');
o.h.este=true;var pel=KK.addBlock(o.P,'muoto',{v:o.vw});pel.x=200;pel.y=-10;pel.w=20;pel.h=20;var lp=LB(o.P,'liike',{o:pel.id,vx:'-100'});KK.repair(o.P);
run(o.P,0.6);var e=KK.Ev(o.P,C);A.ok(e.omiNum(pel.id,'x',0)>=e.omiNum(o.h.id,'x',0)+20-0.1||e.omiNum(o.h.id,'y',0)>=10-0.1,'pelaaja ei mene läpi');
// --- Repair ---
o=uusi();o.rt.pts=[[0,0],'x',[NaN,1],[5,5]];o.rt.kier='kyllä';o.rt.nak='joo';o.li.rtt='vino';o.li.rta=true;KK.repair(o.P);
A.deepStrictEqual([o.rt.pts,o.rt.kier,o.rt.nak,o.li.rtt,o.li.rta],[[[0,0],[5,5]],false,'',undefined,undefined]);
KK.removeBlock(o.P,o.rt.id);KK.repair(o.P);A.strictEqual(o.li.rt,'');run(o.P,0.2);
console.log('ok reitit');
