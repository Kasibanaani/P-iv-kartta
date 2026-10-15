// Appi-appi 2: Liike liikuttaa suoraan valittua palikkaa, esteet (palikan tai kerroksen asetus, laatikko tai ympyrä,
// liukuminen reunaa pitkin), alueet (astuttu, poistuttu, sisällä, montako). Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||0.05;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
var P=KK.newProject('m');var vw=P.views[0].id;P.views[0].laite='puhelin';
var h=KK.addBlock(P,'muoto',{v:vw,laji:'laatikko'});h.x=100;h.y=100;h.w=40;h.h=40;
var sein=KK.addBlock(P,'muoto',{v:vw});sein.x=200;sein.y=0;sein.w=20;sein.h=400;sein.este=true;
var li=LB(P,'liike',{o:h.id,vx:'100',vy:'0'});KK.repair(P);
var E=KK.Ev(P,C);
// --- 1. Kohde: Liike siirtää palikan omaa paikkaa (asetettu x) ---
A.strictEqual(E.val(li.id),100);A.strictEqual(E.val(li.id,'y'),100);A.strictEqual(E.val(li.id,'m'),false);
run(P,0.5);E=KK.Ev(P,C);
near(E.omiNum(h.id,'x',0),150,0.01,'x kasvoi 50');A.strictEqual(h.x,100,'perusarvo ennallaan');near(E.val(li.id),150,0.01);
A.strictEqual(E.val(li.id,'m'),true);near(E.val(li.id,'nop'),100,0.01);A.strictEqual(E.val(li.id,'suu'),90);
// --- 2. Este pysäyttää: laatikko seinää vasten (x + 40 = 200) ---
var tor=laskuri(P,li,'tor');KK.repair(P);
run(P,1);E=KK.Ev(P,C);near(E.omiNum(h.id,'x',0),160,0.02,'pysähtyy seinään');A.strictEqual(E.val(li.id,'osuu'),true);A.strictEqual(E.val(tor.id),1,'törmäsi kerran');
run(P,0.5);E=KK.Ev(P,C);A.strictEqual(E.val(tor.id),1,'ei uutta törmäystä, kun painaa seinää');
// --- 3. Liukuu reunaa pitkin: vino liike seinää vasten kulkee alas ---
li.vy='100';run(P,0.5);E=KK.Ev(P,C);near(E.omiNum(h.id,'x',0),160,0.02,'pysyy seinässä');near(E.omiNum(h.id,'y',0),150,0.5,'liukui alas');
// --- 4. Pysähtyy ja osuu ei enää ---
li.vx='0';li.vy='0';run(P,0.1);E=KK.Ev(P,C);A.strictEqual(E.val(li.id,'m'),false);A.strictEqual(E.val(li.id,'osuu'),false);
// --- 5. Alkuun palauttaa perusarvoon ---
KK.liikeAlkuun(P,li.id);E=KK.Ev(P,C);A.strictEqual(E.omiNum(h.id,'x',0),100);A.strictEqual(E.omiNum(h.id,'y',0),100);
// --- 6. Ei mene läpi ohuesta esteestä isollakaan nopeudella ---
li.vx='5000';run(P,0.25,0.25);E=KK.Ev(P,C);near(E.omiNum(h.id,'x',0),160,0.02,'ei tunneloidu');
// --- 7. Este pois (ominaisuus asetettu ei) → menee läpi; piilossa ei ole este ---
KK.liikeAlkuun(P,li.id);li.vx='400';KK.setOmi(P,sein.id,'este',false);run(P,0.5);E=KK.Ev(P,C);A.ok(E.omiNum(h.id,'x',0)>250,'este pois');
KK.resetOmi(P,sein.id,'este');KK.liikeAlkuun(P,li.id);sein.nka='';var ehto=LB(P,'arvo',{v:'ei'});KK.addLink(P,N(P,ehto).id,'v',N(P,sein).id,'nk');KK.repair(P);
run(P,0.5);E=KK.Ev(P,C);A.ok(E.omiNum(h.id,'x',0)>250,'piilotettu ei ole este');ehto.v='kyllä';
// --- 8. Kerroksen este ---
KK.liikeAlkuun(P,li.id);delete sein.este;run(P,0.5);E=KK.Ev(P,C);A.ok(E.omiNum(h.id,'x',0)>250,'ei estettä');
P.views[0].kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Seinät',este:true}];sein.kr='k1';KK.repair(P);A.strictEqual(P.views[0].kr[1].este,true);
KK.liikeAlkuun(P,li.id);run(P,0.5);E=KK.Ev(P,C);near(E.omiNum(h.id,'x',0),160,0.02,'kerros on este');
// --- 9. Ympyrä: ympyrä liukuu ympyrän ohi ---
var Q=KK.newProject('y');var qv=Q.views[0].id;
var pallo=KK.addBlock(Q,'muoto',{v:qv,laji:'ympyra'});pallo.x=0;pallo.y=85;pallo.w=40;pallo.h=40;A.strictEqual(KK.osuMuoto(pallo),'ympyra');
var kivi=KK.addBlock(Q,'muoto',{v:qv,laji:'ympyra'});kivi.x=200;kivi.y=80;kivi.w=60;kivi.h=60;kivi.este=true;
var lq=LB(Q,'liike',{o:pallo.id,vx:'200',vy:'0'});KK.repair(Q);
var miny=999,maxx=0;for(var i=0;i<60;i++){T+=50;KK.frame(Q,0.05,C);var e2=KK.Ev(Q,C),px=e2.omiNum(pallo.id,'x',0)+20,py=e2.omiNum(pallo.id,'y',0)+20;
  A.ok(Math.hypot(px-230,py-110)>=50-0.05,'ei mene kiven sisään '+px+','+py);miny=Math.min(miny,py);maxx=Math.max(maxx,px);}
A.ok(maxx>300,'pääsi ohi liukumalla: '+maxx);A.ok(miny<100,'kiersi yläkautta (oli hieman ylempänä)');
// laatikko-osuma-alue ympyrälle ja osuma-alueen koko
pallo.osu='laatikko';pallo.osk=50;KK.repair(Q);A.strictEqual(KK.osuMuoto(pallo),'laatikko');
var oa=KK.osumaAlue(pallo,{x:0,y:0,w:40,h:40});A.deepStrictEqual(oa,{c:0,x:10,y:10,w:20,h:20});
pallo.osk=100;KK.repair(Q);A.strictEqual(pallo.osk,undefined);pallo.osu='vino';KK.repair(Q);A.strictEqual(pallo.osu,undefined);
// Työntö: laatikko ympyrää vasten ja ympyrä laatikon sisällä
var v=KK.osumaTyonto({c:0,x:0,y:0,w:10,h:10},{c:1,x:12,y:5,r:4});near(v.x,-2,1e-9);near(v.y,0,1e-9);
v=KK.osumaTyonto({c:1,x:5,y:2,r:1},{c:0,x:0,y:0,w:10,h:10});A.deepStrictEqual(v,{x:0,y:-3});
A.strictEqual(KK.osumaTyonto({c:0,x:0,y:0,w:10,h:10},{c:0,x:10,y:0,w:10,h:10}),null,'reunat vastakkain ei ole osuma');
// --- 10. Kaksi liikkuvaa, toinen este: ei mene päällekkäin ---
var R=KK.newProject('r');var rv=R.views[0].id;
var a1=KK.addBlock(R,'muoto',{v:rv});a1.x=0;a1.y=0;a1.w=40;a1.h=40;var a2=KK.addBlock(R,'muoto',{v:rv});a2.x=100;a2.y=0;a2.w=40;a2.h=40;a2.este=true;a1.este=true;
var l1=LB(R,'liike',{o:a1.id,vx:'100'}),l2=LB(R,'liike',{o:a2.id,vx:'-100'});KK.repair(R);
run(R,1);var er=KK.Ev(R,C);var x1=er.omiNum(a1.id,'x',0),x2=er.omiNum(a2.id,'x',0);A.ok(x2-x1>=40-0.05,'ei päällekkäin: '+x1+' '+x2);near(x1+x2,100,1,'kohtasivat keskellä');
// --- 11. Alueet ---
var S=KK.newProject('a');var sv=S.views[0].id;
var ha=KK.addBlock(S,'muoto',{v:sv});ha.x=0;ha.y=0;ha.w=20;ha.h=20;var muu=KK.addBlock(S,'muoto',{v:sv});muu.x=0;muu.y=60;muu.w=20;muu.h=20;
var al=KK.addBlock(S,'alue',{v:sv});al.x=100;al.y=-50;al.w=100;al.h=200;
var la=LB(S,'liike',{o:ha.id,vx:'100'}),lb=LB(S,'liike',{o:muu.id,vx:'100'});
var ast=laskuri(S,al,'e'),pois=laskuri(S,al,'ulos');KK.repair(S);
var es=KK.Ev(S,C);A.strictEqual(es.val(al.id),false);A.strictEqual(es.val(al.id,'n'),0);
run(S,0.8);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),false,'keskipiste x = 90 ei vielä sisällä');
run(S,0.2);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),true,'astui');A.strictEqual(es.val(al.id,'n'),2);A.strictEqual(es.val(ast.id),1,'astuttu kerran (kaksi samaan aikaan)');
A.deepStrictEqual(KK.alueTila(S,al.id).sort(),[ha.id,muu.id].sort());
run(S,1.2);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),false,'poistui');A.strictEqual(es.val(pois.id),1);
// Tunnistaa vain valitun
KK.liikeAlkuun(S,la.id);KK.liikeAlkuun(S,lb.id);al.kuka=ha.id;lb.vx='0';KK.repair(S);KK.frame(S,0,C);
run(S,1);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),true);A.strictEqual(es.val(al.id,'n'),1);
// Aseta (hyppy) tunnistetaan ilman liikettä: frame(P, 0)
la.vx='0';KK.setOmi(S,ha.id,'x',500);KK.frame(S,0,C);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),false,'hyppy ulos');
// Ellipsi: kulma ei ole sisällä
al.osu='ympyra';KK.setOmi(S,ha.id,'x',100-10+5);KK.setOmi(S,ha.id,'y',-50-10+5);KK.frame(S,0,C);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),false,'ellipsin kulma');
al.osu='laatikko';KK.frame(S,0,C);es=KK.Ev(S,C);A.strictEqual(es.val(al.id),true,'laatikon kulma');
// Kaavassa
A.strictEqual(KK.kaavaToIds(S,'{'+al.vt+'.montako}').length>0,true);
// Korjaus: kuka poistettu, kirjanpito siivotaan
KK.removeBlock(S,ha.id);KK.repair(S);A.strictEqual(al.kuka,undefined);A.deepStrictEqual(KK.alueTila(S,al.id),[]);
S.st['al:'+al.id]='rikki';KK.repair(S);A.strictEqual(S.st['al:'+al.id],undefined);
// --- 12. Vanha Liike ilman kohdetta toimii kuten ennen ---
var O=KK.newProject('o');var lo=LB(O,'liike',{vx:'10',vy:'-20',x0:5,y0:5});KK.repair(O);run(O,1);var eo=KK.Ev(O,C);
near(eo.val(lo.id),15,0.01);near(eo.val(lo.id,'y'),-15,0.01);A.strictEqual(eo.val(lo.id,'suu'),Math.round((Math.atan2(10,20)*180/Math.PI+360)%360));
// Kohde korjataan pois, jos se ei ole näkymäpalikka
lo.o='eiole';KK.repair(O);A.strictEqual(lo.o,'');
// Kytkentäkohdat
A.deepStrictEqual(KK.ports(lo).outs.map(function(o){return o.p;}),['v','y','m','osuu','nop','suu','tor']);
console.log('ok liike ja esteet');
