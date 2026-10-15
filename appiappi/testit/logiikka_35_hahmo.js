// Appi-appi 3: hahmon liike moottorissa. Ohjaustavat tatti, napautus kohteeseen ja auto (kaasu + ohjaus), huippunopeus,
// kiihtyminen ja jarrutus (suora, valmis muoto tai oma Käyrä), liukkaus, kääntyminen kulkusuuntaan ja peilaus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||0.02;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
function laskuri(P,b,port){var m=LB(P,'muisti',{v:'0'}),t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function uusi(){var P=KK.newProject('h');var vw=P.views[0].id;var h=KK.addBlock(P,'muoto',{v:vw});h.x=1000;h.y=1000;h.w=40;h.h=40;
  var tj=KK.addBlock(P,'tatti',{v:vw});var li=LB(P,'liike',{o:h.id,ohj:'tatti',tt:tj.id,vm:200});KK.repair(P);return {P:P,h:h,tj:tj,li:li,vw:vw};}
function X(o){return KK.Ev(o.P,C).omiNum(o.h.id,'x',0);}function Y(o){return KK.Ev(o.P,C).omiNum(o.h.id,'y',0);}
function nop(o){return KK.Ev(o.P,C).val(o.li.id,'nop');}
// --- 1. Tatti, heti huippunopeuteen ---
var o=uusi();A.deepStrictEqual(KK.ports(o.li).ins.map(function(x){return x.p;}),['vm','c','e']);
o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.5);near(X(o),1100,0.5,'200 px/s');near(nop(o),200,0.01);
o.P.st[o.tj.id]={x:0.5,y:0};run(o.P,0.1);near(nop(o),100,0.01,'puolikas tatti = puolet');
o.P.st[o.tj.id]={x:0,y:0};run(o.P,0.1);A.strictEqual(nop(o),0,'pysähtyy heti');A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'m'),false);
// --- 2. Kiihtyminen 1 s suoraan ---
o=uusi();o.li.ka=1;o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.5);near(nop(o),100,3,'puolessa sekunnissa puolet');run(o.P,0.6);near(nop(o),200,0.01,'huipussa');
// Jarrutus 0,5 s: hidastuu ja liikkuu vielä
o.li.kb=0.5;o.P.st[o.tj.id]={x:0,y:0};var x0=X(o);run(o.P,0.25);near(nop(o),100,4,'jarruttaa');A.ok(X(o)>x0+30,'liukuu jarruttaessa');run(o.P,0.4);A.strictEqual(nop(o),0);
A.strictEqual(KK.liikeKay(o.P,o.li.id),false,'pysähtynyt');
// --- 3. Muoto: kiihtyy (hidas alku) ja oma Käyrä (nopea alku) ---
o=uusi();o.li.ka=1;o.li.km='kiihtyy';o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.5);var k1=nop(o);A.ok(k1<70&&k1>20,'kiihtyy: '+k1);
o=uusi();var ky=LB(o.P,'kayra',{pn:5,pw:[0,90,100,100,100]});o.li.ka=1;o.li.km=ky.id;KK.repair(o.P);A.strictEqual(o.li.km,ky.id);
o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.26);A.ok(nop(o)>150,'oma käyrä, nopea alku: '+nop(o));
A.strictEqual(KK.muotoInv(null,0.3),0.3);var f=KK.liikeMuoto(o.P,o.li);near(f(KK.muotoInv(f,0.5)),0.5,1e-4);
// --- 4. Liukkaus: tatti irti, vauhti hiipuu hitaasti ---
o=uusi();o.li.liuk=100;o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.5);A.ok(nop(o)<70,'liukkaalla lähtö on hidas: '+nop(o));run(o.P,6);A.ok(nop(o)>190,'saavuttaa huipun liukkaallakin');
var v0=nop(o);o.P.st[o.tj.id]={x:0,y:0};run(o.P,0.5);near(nop(o),v0*Math.exp(-0.5/1.5),3,'hiipuu');A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'m'),true);
// Liukkaus ja seinä: painaminen ei kerrytä vauhtia seinää kohti
var se=KK.addBlock(o.P,'muoto',{v:o.vw});se.x=X(o)+60;se.y=0;se.w=20;se.h=3000;se.este=true;KK.repair(o.P);
o.P.st[o.tj.id]={x:1,y:0};run(o.P,2);near(X(o),se.x-40,0.05,'seinässä');var v=KK.Ev(o.P,C).val(o.li.id,'nop');A.ok(v<1,'ei vauhtia seinään: '+v);
o.P.st[o.tj.id]={x:0,y:0};run(o.P,0.5);near(X(o),se.x-40,0.05,'ei pomppaa');
// --- 5. Kääntyy kulkusuuntaan ---
o=uusi();o.li.kaanny='kaanny';o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),90,'oikealle 90');
o.P.st[o.tj.id]={x:0,y:1};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),180,'alas 180');
o.P.st[o.tj.id]={x:-1,y:0};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),-90,'vasemmalle −90');
o.li.ks='oikea';o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),0,'kuva katsoo oikealle');
o.P.st[o.tj.id]={x:0,y:0};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiNum(o.h.id,'kulma',0),0,'pysähtyessä suunta säilyy');
A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'suu'),90,'suunta säilyy arvona');
// Peilaus
o=uusi();o.li.kaanny='peili';o.P.st[o.tj.id]={x:-1,y:0};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiVal(o.h.id,'peili'),true,'vasemmalle peilattu');
o.P.st[o.tj.id]={x:0,y:-1};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiVal(o.h.id,'peili'),true,'ylös: ei muutu');
o.P.st[o.tj.id]={x:1,y:0};run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiVal(o.h.id,'peili'),false,'oikealle ei');
o.li.ks='vasen';run(o.P,0.1);A.strictEqual(KK.Ev(o.P,C).omiVal(o.h.id,'peili'),true,'vasemmalle katsova kuva');
// --- 6. Napautus kohteeseen ---
o=uusi();o.li.ohj='napautus';o.li.vm=400;var per=laskuri(o.P,o.li,'per');KK.repair(o.P);
A.deepStrictEqual(KK.ports(o.li).ins.map(function(x){return x.p;}),['vm','tx','ty','c','e']);
A.strictEqual(KK.liikeNapautus(o.P,o.vw,1320,1020,C),1);var E=KK.Ev(o.P,C);A.strictEqual(E.val(o.li.id,'kx'),1320);A.strictEqual(E.val(o.li.id,'ky'),1020);
run(o.P,0.5);near(X(o),1200,8,'puolivälissä');run(o.P,0.4);E=KK.Ev(o.P,C);A.strictEqual(X(o),1300,'keskipiste kohdassa');A.strictEqual(Y(o),1000);
A.strictEqual(E.val(per.id),1,'perillä kerran');A.strictEqual(E.val(o.li.id,'kx'),null);A.strictEqual(KK.liikeKay(o.P,o.li.id),false);
// jarrutuksella ei mene ohi
o.li.ka=0.3;o.li.kb=0.3;KK.liikeNapautus(o.P,o.vw,1020,1320,C);var prev=1e9,ok=true;for(var i=0;i<150;i++){T+=20;KK.frame(o.P,0.02,C);var d=Math.hypot(X(o)+20-1020,Y(o)+20-1320);if(d>prev+1e-6)ok=false;prev=d;}
A.ok(ok,'lähestyy koko ajan');near(prev,0,0.5,'perillä');A.strictEqual(KK.Ev(o.P,C).val(per.id),2);
// kohde nuolesta
var ax=LB(o.P,'arvo',{v:'1500'}),ay=LB(o.P,'arvo',{v:'1020'});KK.addLink(o.P,N(o.P,ax).id,'v',N(o.P,o.li).id,'tx');KK.addLink(o.P,N(o.P,ay).id,'v',N(o.P,o.li).id,'ty');KK.repair(o.P);
A.strictEqual(KK.liikeNapautus(o.P,o.vw,0,0,C),0,'nuolesta ohjattu ei kuuntele napautusta');run(o.P,2);near(X(o),1480,0.5);near(Y(o),1000,0.5);
// --- 7. Auto: kaasu ja ohjaus nuolesta ---
o=uusi();o.li.ohj='auto';o.li.tt='';o.li.vm=200;o.li.kaa=180;var kaa=LB(o.P,'arvo',{v:'1'}),ohj=LB(o.P,'arvo',{v:'0'});
KK.addLink(o.P,N(o.P,kaa).id,'v',N(o.P,o.li).id,'kaa');KK.addLink(o.P,N(o.P,ohj).id,'v',N(o.P,o.li).id,'ohj');KK.repair(o.P);
A.deepStrictEqual(KK.ports(o.li).ins.map(function(x){return x.p;}),['vm','kaa','ohj','c','e']);
run(o.P,0.5);near(Y(o),900,0.5,'ajaa ylös');near(X(o),1000,0.01);A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'suu'),0);
ohj.v='1';run(o.P,0.5);var su=KK.Ev(o.P,C).val(o.li.id,'suu');near(su,90,1,'kääntyy 180°/s');
ohj.v='0';run(o.P,0.5);A.ok(X(o)>1090,'ajaa oikealle');
// Peruutus: ensin jarrutus nollaan, sitten taakse puolella vauhdilla
kaa.v='-1';run(o.P,0.1);near(nop(o),100,0.5);A.ok(KK.Ev(o.P,C).val(o.li.id,'suu')===90,'keula pysyy');var xx=X(o);run(o.P,0.5);near(X(o),xx-50,1,'peruuttaa');
// Ei käänny paikallaan
kaa.v='0';run(o.P,0.1);ohj.v='1';run(o.P,0.5);A.strictEqual(KK.Ev(o.P,C).val(o.li.id,'suu'),90,'ei käänny paikallaan');
// Liukkaus: käännöksessä nopeus jää jälkeen keulasta (sivuluisu)
o=uusi();o.li.ohj='auto';o.li.liuk=60;o.li.vm=300;o.li.kaa=360;o.P.st[o.tj.id]={x:0,y:-1};run(o.P,2);
o.P.st[o.tj.id]={x:1,y:-1};run(o.P,0.2);var st=o.P.st[o.li.id],vs=(Math.atan2(st.vx,-st.vy)*180/Math.PI+360)%360;A.ok(st.h-vs>10,'luisuu: keula '+st.h+' nopeus '+vs);
// --- 8. Korjaus ---
o.li.ohj='lentokone';o.li.ks='vino';o.li.kaanny='x';o.li.km='eiole';o.li.liuk='300';o.li.tt='eiole';KK.repair(o.P);
A.deepStrictEqual([o.li.ohj,o.li.ks,o.li.kaanny,o.li.km,o.li.liuk,o.li.tt],['','','','',100,'']);
o.h.kulma='abc';o.h.peili='kyllä';KK.repair(o.P);A.strictEqual(o.h.kulma,undefined);A.strictEqual(o.h.peili,undefined);
// Kierto ja peilaus ovat ominaisuuksia kaikilla näkymäpalikoilla
A.ok(KK.omFind(o.h,'kierto')&&KK.omFind(o.h,'peilattu'));
console.log('ok hahmo');
