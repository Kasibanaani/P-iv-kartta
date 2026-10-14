// Versio 6.3: ajastin. Kesto sekunnista vuorokausiin (myös desimaalit ja nuolesta), aikaleima tallentuu, haara odottaa,
// ketju jatkuu kun aika on kulunut, myös appin "sulkemisen" (JSON-kierros) yli. Kiinni jääneet ajat kurotaan kiinni
// aikajanalla, mutta toistuva ajastin ei tee kiinni jääneitä kierroksia. Rinnakkaiset haarat omissa tahdeissaan.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function adv(s){NOW+=s*1000;}
function mk(){var P=KK.newProject('aj');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista');return {P:P,k:k,w:w,lst:lst};}
function row(X,tx,y){var s=KK.addBlock(X.P,'tee',{do:'rivi',o:X.lst.id,tx:tx});return KK.addNode(X.P,s.id,0,y,X.w.id);}
function tim(X,kesto,yks,y,x){var t=KK.addBlock(X.P,'ajastin',{kesto:kesto,yks:yks||'s'});return KK.addNode(X.P,t.id,x||0,y,X.w.id);}
function L(X,a,b,p){return KK.addLink(X.P,a.id,p||'e',b.id,'e');}
function rows(X){return KK.listRows(X.P,X.lst.id).map(function(r){return r.tx;});}

// kestot ja yksiköt
var X=mk(),P=X.P;var t1=tim(X,10,'s',0);var tb=P.b[t1.p];
A.ok(KK.isStep(tb));A.strictEqual(KK.timerMs(P,tb.id,C),10000);
tb.yks='min';tb.kesto='1,5';A.strictEqual(KK.timerMs(P,tb.id,C),90000);
tb.yks='h';tb.kesto=2;A.strictEqual(KK.timerMs(P,tb.id,C),7200000);
tb.yks='vrk';tb.kesto=3;A.strictEqual(KK.timerMs(P,tb.id,C),3*864e5);
tb.kesto=0;A.ok(KK.isErr(KK.timerMs(P,tb.id,C)));tb.kesto='abc';A.ok(/ei ole luku/.test(KK.timerMs(P,tb.id,C).err));
A.strictEqual(KK.fmtDur(90000),'1 min 30 s');A.strictEqual(KK.fmtDur(7200000),'2 h');A.strictEqual(KK.fmtDur(3*864e5+3600000),'3 vrk 1 h');A.strictEqual(KK.fmtDur(12000),'12 s');
A.strictEqual(KK.fmtLeft(7000),'0:07');A.strictEqual(KK.fmtLeft(3723000),'1:02:03');A.strictEqual(KK.fmtLeft(2*864e5+3*3600000),'2 vrk 3 h');
A.strictEqual(KK.fmtLeft(6100),'0:07','pyöristys ylöspäin');
tb.yks='jotain';KK.repair(P);A.strictEqual(tb.yks,'s');

// A → ajastin 10 s → B
X=mk();P=X.P;var a=row(X,'A',0),t=tim(X,10,'s',60),b=row(X,'B',120);L(X,a,t);L(X,t,b);
var T0=NOW;KK.chainStart(P,X.k.id,C);
A.deepStrictEqual(rows(X),['A']);var cs=P.st[X.k.id];A.strictEqual(cs.run,true);A.strictEqual(cs.tk.length,1);
A.strictEqual(cs.tk[0].s,T0,'aikaleima tallentui');A.strictEqual(cs.tk[0].u,T0+10000);
var E=KK.Ev(P,C);A.strictEqual(E.val(t.p),true);A.strictEqual(E.val(t.p,'j'),10);A.strictEqual(E.val(X.k.id),true);
A.ok(/Jäljellä 0:10/.test(KK.why(P,E,t.p,1).txt));
adv(4);A.strictEqual(KK.chainPoll(P,C),false,'ei muutosta ennen aikaa');A.strictEqual(KK.Ev(P,C).val(t.p,'j'),6);A.deepStrictEqual(rows(X),['A']);
adv(6);A.strictEqual(KK.chainPoll(P,C),true);A.deepStrictEqual(rows(X),['A','B']);A.strictEqual(P.st[X.k.id].run,false);
A.strictEqual(KK.Ev(P,C).val(t.p),false);A.strictEqual(KK.Ev(P,C).val(t.p,'j'),null);

// sulkemisen yli: tila on käyttötiedoissa, JSON-kierros, avataan myöhemmin
X=mk();P=X.P;a=row(X,'A',0);t=tim(X,2,'h',60);b=row(X,'B',120);L(X,a,t);L(X,t,b);
KK.chainStart(P,X.k.id,C);var saved=JSON.stringify(P);
adv(3600);var P2=KK.repair(JSON.parse(saved));A.strictEqual(KK.chainPoll(P2,C),false,'tunnin päästä vielä odottaa');
adv(3*3600);var P3=KK.repair(JSON.parse(saved));A.strictEqual(KK.chainPoll(P3,C),true,'avattaessa aika on kulunut');
A.deepStrictEqual(KK.listRows(P3,X.lst.id).map(function(r){return r.tx;}),['A','B']);

// kurotaan kiinni: 1 h → 1 h → C, appi kiinni 3 h: molemmat ajastimet ovat jo kuluneet
X=mk();P=X.P;var t2=tim(X,1,'h',0),t3=tim(X,1,'h',60),c=row(X,'C',120);L(X,t2,t3);L(X,t3,c);
T0=NOW;KK.chainStart(P,X.k.id,C);adv(3*3600);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['C']);A.strictEqual(P.st[X.k.id].run,false);
// aikajanalla: toinen ajastin alkoi ensimmäisen loputtua (ei vasta avattaessa)
X=mk();P=X.P;t2=tim(X,1,'h',0);t3=tim(X,1,'h',60);c=row(X,'C',120);L(X,t2,t3);L(X,t3,c);
T0=NOW;KK.chainStart(P,X.k.id,C);adv(5400);KK.chainPoll(P,C);cs=P.st[X.k.id];
A.strictEqual(cs.tk.length,1);A.strictEqual(cs.tk[0].s,T0+3600000,'toinen alkoi ensimmäisen loputtua');A.strictEqual(cs.tk[0].u,T0+7200000);

// toistuva ajastin (kehä): kiinni jääneitä kierroksia ei tehdä
X=mk();P=X.P;a=row(X,'tik',0);t=tim(X,10,'s',60);L(X,a,t);L(X,t,a);
KK.chainStart(P,X.k.id,C);A.deepStrictEqual(rows(X),['tik']);
adv(10);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['tik','tik'],'kehä ajastimen kanssa toimii');
adv(3600);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['tik','tik','tik'],'tunnin tauon jälkeen yksi kierros, ei 360');
cs=P.st[X.k.id];A.strictEqual(cs.run,true);A.strictEqual(cs.tk[0].u,NOW+10000,'seuraava kierros alkaa nyt');

// rinnakkaiset haarat omissa tahdeissaan
X=mk();P=X.P;a=row(X,'alku',0);var f5=tim(X,5,'s',60,0),f10=tim(X,10,'s',60,200),b1=row(X,'5 s',120),b2=row(X,'10 s',120);
L(X,a,f5);L(X,a,f10);L(X,f5,b1);L(X,f10,b2);var done=0;var dn=KK.addBlock(P,'tee',{do:'ilmoita',tx:'valmis'}),nd=KK.addNode(P,dn.id,500,0);KK.addLink(P,X.w.id,'e',nd.id,'e');
var C2={now:C.now,toast:function(){done++;},nav:function(){}};
KK.chainStart(P,X.k.id,C2);A.strictEqual(P.st[X.k.id].tk.length,2);
adv(5);KK.chainPoll(P,C2);A.deepStrictEqual(rows(X),['alku','5 s']);A.strictEqual(P.st[X.k.id].run,true);A.strictEqual(done,0);
adv(5);KK.chainPoll(P,C2);A.deepStrictEqual(rows(X),['alku','5 s','10 s']);A.strictEqual(P.st[X.k.id].run,false);A.strictEqual(done,1,'valmis vasta viimeisen haaran jälkeen');

// kesto nuolesta
X=mk();P=X.P;t=tim(X,99,'s',0);b=row(X,'B',60);L(X,t,b);var sl=KK.addBlock(P,'saadin',{start:3}),ns=KK.addNode(P,sl.id,-300,0);KK.addLink(P,ns.id,'v',t.id,'k');
T0=NOW;KK.chainStart(P,X.k.id,C);A.strictEqual(P.st[X.k.id].tk[0].u,T0+3000);

// virheellinen kesto pysäyttää ketjun selkeällä viestillä
X=mk();P=X.P;t=tim(X,0,'s',0);KK.chainStart(P,X.k.id,C);A.strictEqual(P.st[X.k.id].run,false);A.ok(/kesto on nolla/.test(P.st[X.k.id].err));

// pysäytys kesken odotuksen
X=mk();P=X.P;t=tim(X,10,'min',0);b=row(X,'B',60);L(X,t,b);KK.chainStart(P,X.k.id,C);KK.chainStop(P,X.k.id,C);adv(900);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),[]);
// ketju pois päältä kesken odotuksen: pysähtyy tarkistuksessa
X=mk();P=X.P;t=tim(X,10,'s',0);b=row(X,'B',60);L(X,t,b);KK.chainStart(P,X.k.id,C);X.k.off=true;adv(20);KK.chainPoll(P,C);A.deepStrictEqual(rows(X),[]);A.strictEqual(P.st[X.k.id].run,false);
// ajastin ketjun ulkopuolella ei tee mitään, Miksi? kertoo sen
X=mk();P=X.P;var ta=KK.addBlock(P,'ajastin'),tn=KK.addNode(P,ta.id,500,500);A.ok(/toimii ketjun sisällä/.test(KK.why(P,KK.Ev(P,C),ta.id,1).txt));
console.log('logiikka_12_ajastin ok');
