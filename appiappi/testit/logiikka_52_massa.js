// Appi-appi 17 (F24): massa, kimmoisuus ja kitka. Töytäisyvauhti (vauhti x / y) ohjauksen päällä, kitka hiiputtaa sen,
// massalliset parit vaihtavat liikemäärää, kimmoisuus pomppaa, massaton tönäisee kuin puskutraktori, törmäsi kertoo
// kohteen ja iskun. Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=2000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+': '+a+' ≠ '+b+' (±'+e+')');}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||0.02;var act=false;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;act=KK.frame(P,dt,C);}return act;}
function E(P){return KK.Ev(P,C);}
function ux(P,li){return E(P).omiNum(li.id,'vauhtix',0);}
function uy(P,li){return E(P).omiNum(li.id,'vauhtiy',0);}
function X(P,b){return E(P).omiNum(b.id,'x',0);}
/* Pallo: ympyrä, este, massa ja kimmoisuus, Liike ilman ohjausta. */
function pallo(P,x,y,o){o=o||{};var vw=P.views[0].id,b=KK.addBlock(P,'muoto',{v:vw,laji:'ympyra'});b.x=x;b.y=y;b.w=o.d||40;b.h=o.d||40;b.este=true;
  if(o.m!=null)b.mas=o.m;if(o.kim!=null)b.kim=o.kim;var li=LB(P,'liike',{o:b.id});if(o.kit!=null)li.kit=o.kit;if(o.vx!=null)li.vx=String(o.vx);return {b:b,li:li};}
function seina(P,x,o){o=o||{};var b=KK.addBlock(P,'muoto',{v:P.views[0].id});b.x=x;b.y=-500;b.w=o.w||20;b.h=1200;b.este=true;if(o.kim!=null)b.kim=o.kim;return b;}
function laskuri(P,li){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,li).id,'tor',N(P,t).id,'e');return m;}

// --- 0. Rekisteri, oletukset ja korjaus ---
var P=KK.newProject('m');var a=pallo(P,0,0,{m:1});KK.repair(P);
['massa','kimmoisuus','este'].forEach(function(n){A.ok(KK.omFind(a.b,n),'näkymäpalikalla '+n);});
['kitka','vauhtix','vauhtiy','isku','törmäyskohde','tormayskohde','vauhti x'].forEach(function(n){A.ok(KK.omFind(a.li,n),'Liikkeellä '+n);});
A.strictEqual(E(P).omiNum(a.li.id,'kitka',-1),50,'kitka oletus 50');A.strictEqual(E(P).omiNum(a.b.id,'kimmoisuus',-1),0,'kimmoisuus oletus 0');
var Ru=KK.addBlock(P,'liike',{ohj:'ruutu'});A.ok(!KK.omFind(Ru,'kitka'),'ruutuliikkeellä ei kitkaa');
a.b.mas='abc';a.b.kim='300';a.li.kit='50';KK.repair(P);A.strictEqual(a.b.mas,undefined);A.strictEqual(a.b.kim,200);A.strictEqual(a.li.kit,undefined,'oletus 50 ei tallennu');
a.b.mas='0';a.b.kim='0';a.li.kit='120';KK.repair(P);A.strictEqual(a.b.mas,undefined,'0 = ei massaa');A.strictEqual(a.b.kim,undefined);A.strictEqual(a.li.kit,100);
a.b.mas='2,5';KK.repair(P);A.strictEqual(a.b.mas,2.5);

// --- 1. Töytäisyvauhti ja kitka: Aseta, hiipuminen, kitka 0 ja 100, Palauta ---
P=KK.newProject('k');a=pallo(P,0,0,{kit:0});KK.repair(P);
A.ok(KK.setOmi(P,a.li.id,'vauhtix',300));near(ux(P,a.li),300,1e-9,'vauhti x asetettu');A.ok(!P.st['o:'+a.li.id],'ei pysyvää asetettua arvoa');
run(P,1);near(X(P,a.b),300,0.5,'kitka 0: kulki 300 px');near(ux(P,a.li),300,1e-6,'kitka 0: vauhti säilyy');near(E(P).val(a.li.id,'nop'),300,0.01,'nopeus sisältää töytäisyn');
A.strictEqual(E(P).val(a.li.id,'suu'),90,'suunta oikealle');
KK.setOmi(P,a.li.id,'vauhtix',0);A.strictEqual(ux(P,a.li),0);var x0=X(P,a.b);run(P,0.2);near(X(P,a.b),x0,1e-6,'Aseta 0 pysäyttää');
a.li.kit=100;KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',300);run(P,0.2);A.strictEqual(ux(P,a.li),0,'kitka 100: pysähtyy alle 0,2 s:ssa');
function liukuu(kit){var Q=KK.newProject('l'),q=pallo(Q,0,0,{kit:kit});KK.repair(Q);KK.setOmi(Q,q.li.id,'vauhtix',300);var act=run(Q,20);A.ok(!act,'kuvasilmukka pysähtyy (kitka '+kit+')');A.strictEqual(ux(Q,q.li),0);return X(Q,q.b);}
var l10=liukuu(10),l30=liukuu(30),l50=liukuu(50);A.ok(l10>l30&&l30>l50,'pienempi kitka liukuu pidemmälle: '+l10+' '+l30+' '+l50);
near(l50,300*300/(2*750),3,'kitka 50: 750 px/s², matka v²/2a');
KK.setOmi(P,a.li.id,'vauhtiy',-120);near(uy(P,a.li),-120,1e-9);KK.resetOmi(P,a.li.id,'vauhtiy');A.strictEqual(uy(P,a.li),0,'Palauta nollaa');
// Lisää vauhti x toiminnolla (lyönti) ja nuoli ohjaa jatkuvasti
var tee=LB(P,'tee',{do:'lisaa',o:a.li.id,om:'vauhtix',v:'250'});a.li.kit=0;KK.repair(P);KK.runAction(P,tee.id,C);KK.runAction(P,tee.id,C);near(ux(P,a.li),500,1e-9,'Lisää 250 kahdesti');
KK.liikeAlkuun(P,a.li.id);A.strictEqual(ux(P,a.li),0,'alkuun nollaa vauhdin');

// --- 2. Samat massat, kimmoisuus 100 %, keskeinen osuma: nopeudet vaihtuvat ---
P=KK.newProject('v');a=pallo(P,0,0,{m:1,kim:100,kit:0});var b=pallo(P,200,0,{m:1,kim:100,kit:0});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',300);
run(P,1.5);near(ux(P,a.li),0,3,'A pysähtyy');near(ux(P,b.li),300,3,'B jatkaa A:n nopeudella');near(uy(P,b.li),0,0.5,'ei sivuttaista');
A.ok(X(P,b.b)-X(P,a.b)>=40-0.05,'ei päällekkäin');

// --- 3. Kimmoisuus 0, B levossa: yhteinen loppunopeus mA·vA/(mA+mB) ---
P=KK.newProject('t');a=pallo(P,0,0,{m:1,kit:0});b=pallo(P,200,0,{m:3,kit:0});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',400);
run(P,1.5);near(ux(P,a.li),100,2,'A yhteinen');near(ux(P,b.li),100,2,'B yhteinen');

// --- 4. Massa 9 osuu levossa olevaan massaan 1, kimmoisuus 100 %: liikemäärä säilyy, 0,8× ja 1,8× ---
P=KK.newProject('9');a=pallo(P,0,0,{m:9,kim:100,kit:0});b=pallo(P,200,0,{m:1,kim:100,kit:0});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',300);
run(P,1);var pA=ux(P,a.li),pB=ux(P,b.li);near(9*pA+pB,2700,27,'liikemäärä säilyy');near(pA,240,3,'raskas 0,8×');near(pB,540,5,'kevyt 1,8×');
// Vino osuma ohjaa sivulle (biljardi)
P=KK.newProject('vino');a=pallo(P,0,0,{m:1,kim:100,kit:0});b=pallo(P,200,25,{m:1,kim:100,kit:0});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',300);
run(P,1.5);A.ok(uy(P,b.li)>30,'B lähtee alaviistoon: '+uy(P,b.li));A.ok(uy(P,a.li)<-30,'A kimpoaa ylös: '+uy(P,a.li));near(ux(P,a.li)+ux(P,b.li),300,3,'x-liikemäärä säilyy');

// --- 5. Seinä: kimmoisuus 80 % pallossa, 150 % seinässä; massaton pallo pomppaa myös (kimmoisuus vaikuttaa aina) ---
P=KK.newProject('s');a=pallo(P,0,0,{m:1,kim:80,kit:0});seina(P,200);KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',300);
var tr=laskuri(P,a.li);var tmu=KK.addBlock(P,'muisti',{v:''});N(P,tmu);var tpb=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tpb);var tk=KK.addBlock(P,'kaava');N(P,tk);tk.f=KK.kaavaToIds(P,'tapahtuma.kohde');
var tse=KK.addBlock(P,'tee',{do:'aseta',o:tmu.id,v:{r:tk.id}});KK.addLink(P,N(P,a.li).id,'tor',N(P,tse).id,'e');KK.repair(P);
run(P,1.5);near(ux(P,a.li),-240,1,'paluu 80 %');A.ok(X(P,a.b)<160,'kimposi takaisin');A.strictEqual(E(P).val(tr.id),1,'törmäsi kerran');
A.strictEqual(E(P).val(tmu.id),P.b[Object.keys(P.b).filter(function(i){return P.b[i].k==='muoto'&&P.b[i].h===1200;})[0]].nm,'tapahtuma.kohde = seinä');
near(E(P).omiNum(a.li.id,'isku',0),300,0.5,'isku 300');
P=KK.newProject('s2');a=pallo(P,0,0,{kit:0});seina(P,200,{kim:150});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',300);run(P,1.5);near(ux(P,a.li),-450,1,'pomppulevy 150 %, pallolla ei massaa');
// Liikkeen rajat ovat kuin seinä
P=KK.newProject('raja');a=pallo(P,0,0,{kim:100,kit:0});a.li.xmax='100';KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',200);run(P,1);near(ux(P,a.li),-200,1,'raja pomppaa');

// --- 6. Massaton hahmo (Nopeus x) ja massallinen pallo: hahmo ei hätkähdä, pallo lähtee ---
function tonaisy(kim){var Q=KK.newProject('h'),h=pallo(Q,0,0,{vx:200}),p=pallo(Q,100,0,{m:1,kim:kim,kit:0});KK.repair(Q);run(Q,0.5);
  var e=E(Q);near(e.val(h.li.id,'nop'),200,0.01,'hahmon nopeus ennallaan');near(e.omiNum(h.b.id,'x',0),100,0.5,'hahmo kulki suoraan');return ux(Q,p.li);}
near(tonaisy(0),200,1,'pallo saa hahmon nopeuden');near(tonaisy(100),400,2,'kimmoisa pallo lentää kaksinkertaisella');
// Puristus: pallo seinää vasten, massaton hahmo pysähtyy sen pintaan eikä mene päälle
P=KK.newProject('pur');var hh=pallo(P,0,0,{vx:200});var pp=pallo(P,100,0,{m:1});seina(P,160);KK.repair(P);run(P,2);
A.ok(X(P,pp.b)<=120.05,'pallo seinässä: '+X(P,pp.b));A.ok(X(P,pp.b)-X(P,hh.b)>=40-0.1,'hahmo ei mene pallon päälle: '+X(P,hh.b));

// --- 7. Kaksi massatonta liikkuvaa estettä: kuten ennen (seinät toisilleen, ei töytäisyä) ---
P=KK.newProject('vanha');a=pallo(P,0,0,{vx:100});b=pallo(P,100,0,{vx:-100});KK.repair(P);run(P,1);
A.strictEqual(ux(P,a.li),0);A.strictEqual(ux(P,b.li),0);A.ok(X(P,b.b)-X(P,a.b)>=40-0.05);near(X(P,a.b)+X(P,b.b),100,1,'kohtasivat keskellä');

// --- 8. Nopea pieni pallo ei mene toisen liikkuvan eikä ohuen seinän läpi (alivaiheet) ---
P=KK.newProject('n');a=pallo(P,0,0,{m:1,d:10,kim:100,kit:0});b=pallo(P,200,0,{m:1,d:10,kim:100,kit:0});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',2000);
run(P,0.3,0.05);A.ok(ux(P,b.li)>1900,'B sai vauhdin: '+ux(P,b.li));A.ok(X(P,a.b)<X(P,b.b),'A ei ohittanut B:tä');
P=KK.newProject('n2');a=pallo(P,0,0,{m:1,d:10,kit:0});seina(P,200,{w:2});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',2000);run(P,0.3,0.05);A.ok(X(P,a.b)<200,'ei seinän läpi');

// --- 9. Törmäsi molemmille kerran per uusi kosketus; kohde ja isku; jatkuva työntö ei lähetä joka kuvassa ---
P=KK.newProject('t9');var hah=pallo(P,0,0,{vx:100});var lt=pallo(P,100,0,{m:1,kit:50});KK.repair(P);
var c1=laskuri(P,hah.li),c2=laskuri(P,lt.li);KK.repair(P);run(P,2);
A.strictEqual(E(P).val(c1.id),1,'hahmon törmäsi kerran (työntää jatkuvasti)');A.strictEqual(E(P).val(c2.id),1,'laatikon törmäsi kerran');
var e9=E(P);A.strictEqual(e9.omiVal(lt.li.id,'törmäyskohde'),hah.b.nm);A.strictEqual(e9.omiVal(hah.li.id,'törmäyskohde'),lt.b.nm);near(e9.omiNum(lt.li.id,'isku',0),100,0.5,'isku = lähestymisnopeus');
A.ok(X(P,lt.b)>150,'hahmo työnsi laatikkoa');
// Tapahtuman tiedot: kohde ja isku kuoressa
var mk=KK.addBlock(P,'muisti',{v:''}),mi=KK.addBlock(P,'muisti',{v:'0'});N(P,mk);N(P,mi);var tp9=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tp9);
var k1=KK.addBlock(P,'kaava');N(P,k1);k1.f=KK.kaavaToIds(P,'tapahtuma.kohde');var k2=KK.addBlock(P,'kaava');N(P,k2);k2.f=KK.kaavaToIds(P,'tapahtuma.isku');
var s1=KK.addBlock(P,'tee',{do:'aseta',o:mk.id,v:{r:k1.id}}),s2=KK.addBlock(P,'tee',{do:'aseta',o:mi.id,v:{r:k2.id}});
KK.addLink(P,N(P,lt.li).id,'tor',N(P,s1).id,'e');KK.addLink(P,N(P,s1).id,'e',N(P,s2).id,'e');KK.repair(P);
KK.liikeAlkuun(P,hah.li.id);KK.liikeAlkuun(P,lt.li.id);run(P,1.5);
A.strictEqual(E(P).val(mk.id),hah.b.nm,'tapahtuma.kohde');near(E(P).val(mi.id),100,0.5,'tapahtuma.isku');

// --- 10. Painava työntää kevyttä: massa 1000 (Nopeus x 100) ja laatikko 10 ---
P=KK.newProject('r');var aut=pallo(P,0,0,{vx:100,m:1000,kit:50});var box=pallo(P,45,0,{m:10,kim:100,kit:0});KK.repair(P);
run(P,0.2);var ea=E(P);A.ok(ea.val(aut.li.id,'nop')>95,'raskas hidastuu vain vähän: '+ea.val(aut.li.id,'nop'));A.ok(ux(P,box.li)>150,'kevyt lennähti: '+ux(P,box.li));
run(P,2);A.ok(X(P,box.b)>X(P,aut.b)+40-0.1,'laatikko edellä');

// --- 11. Massa ominaisuutena (Aseta) muuttaa tuloksen kesken pelin ---
function lopputulos(mB){var Q=KK.newProject('m'),q1=pallo(Q,0,0,{m:1,kim:100,kit:0}),q2=pallo(Q,200,0,{m:1,kim:100,kit:0});KK.repair(Q);KK.setOmi(Q,q2.b.id,'massa',mB);KK.setOmi(Q,q1.li.id,'vauhtix',300);run(Q,1.5);return ux(Q,q1.li);}
near(lopputulos(1),0,3);near(lopputulos(3),-150,3,'raskaampi B: A kimpoaa takaisin');

// --- 12. Tallennus, vienti ja tuonti säilyttävät mas, kim, kit ja käyttötilan ---
P=KK.newProject('j');a=pallo(P,0,0,{m:2,kim:60,kit:20});KK.repair(P);KK.setOmi(P,a.li.id,'vauhtix',100);run(P,0.1);
var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.strictEqual(J.b[a.b.id].mas,2);A.strictEqual(J.b[a.b.id].kim,60);A.strictEqual(J.b[a.li.id].kit,20);
near(KK.Ev(J,C).omiNum(a.li.id,'vauhtix',0),ux(P,a.li),1e-9,'vauhti säilyy');

// --- 13. Piilossa oleva ei ole kappale; Reitti tönäisee kuin massaton ---
P=KK.newProject('p');a=pallo(P,0,0,{m:1,kit:0});b=pallo(P,100,0,{m:1,kit:0});b.b.nka='';var ei=LB(P,'arvo',{v:'ei'});KK.addLink(P,N(P,ei).id,'v',N(P,b.b).id,'nk');KK.repair(P);
KK.setOmi(P,a.li.id,'vauhtix',300);run(P,1);near(ux(P,a.li),300,0.5,'meni piilossa olevan läpi');A.strictEqual(ux(P,b.li),0);

// --- 14. Ohjattu hahmo, jolla on massa, lennähtää, vaikka ohjaus (Nopeus x = 0, pito täysi) pitäisi sen paikallaan ---
P=KK.newProject('kb');var hk=pallo(P,200,0,{vx:0,m:1,kit:50});var lk=pallo(P,0,0,{m:1,kim:100,kit:0});KK.repair(P);KK.setOmi(P,lk.li.id,'vauhtix',300);
run(P,1.2);A.ok(X(P,hk.b)>230,'hahmo lennähti: '+X(P,hk.b));A.strictEqual(E(P).omiNum(hk.li.id,'vauhtix',0),0,'tönäisy hiipui kitkalla');var xk=X(P,hk.b);run(P,0.5);near(X(P,hk.b),xk,1e-6,'ohjaus pitää taas paikallaan');

console.log('logiikka_52_massa ok');
