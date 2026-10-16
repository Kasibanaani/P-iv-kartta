// Versio 6.8: ehto ketjussa. Ketju haarautuu sen mukaan, onko palikka valittu (kyllä-haara) vai ei ole valittu (ei-haara).
// Ehto nuolesta (kaava), ehto ajastimen jälkeen tarkistetaan vasta silloin, ehto kehässä (toista kunnes), puuttuva ehto,
// virhe ehdossa, pois käytöstä oleva ehto, Miksi? ja Yhteydet.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function mk(){var P=KK.newProject('e');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista'),r=KK.addBlock(P,'ruutu',{nm:'Valmis'});
  var h=KK.addBlock(P,'haara',{o:r.id});var nh=KK.addNode(P,h.id,0,40,w.id);
  var y=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'kyllä'}),n=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'ei'});
  var ny=KK.addNode(P,y.id,0,120,w.id),nn=KK.addNode(P,n.id,200,120,w.id);KK.addLink(P,nh.id,'e',ny.id,'e');KK.addLink(P,nh.id,'m',nn.id,'e');
  return {P:P,k:k,w:w,lst:lst,r:r,h:h,nh:nh};}
function rows(X){return KK.listRows(X.P,X.lst.id).map(function(r){return r.tx;});}
var pr=KK.ports({k:'haara'});A.deepStrictEqual(pr.outs.map(function(p){return p.n;}),['kyllä','ei']);A.strictEqual(KK.K.haara.n,'Ehto');
var X=mk();KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['ei'],'ei ole valittu → ei-haara');
X.P.st[X.r.id]=true;KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['ei','kyllä'],'on valittu → kyllä-haara');
var E=KK.Ev(X.P,C);A.ok(/onko ”Valmis” valittu: nyt pätee, joten ketju jatkaa kyllä-haaraan/.test(KK.why(X.P,E,X.h.id,2).txt));
A.ok((KK.deps(X.P).uses[X.h.id]||[]).some(function(u){return u.id===X.r.id&&u.how==='ehto';}),'Yhteydet: ketjun ehto');
// ehto nuolesta: kaava
X=mk();var sl=KK.addBlock(X.P,'saadin',{nm:'Taso',start:3});var kv=KK.addBlock(X.P,'kaava');var nk=KK.addNode(X.P,kv.id,-300,40);kv.f=KK.kaavaToIds(X.P,'taso > 5');KK.addLink(X.P,nk.id,'v',X.nh.id,'c');
KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['ei']);KK.userSet(X.P,sl.id,8,C);KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['ei','kyllä'],'nuoli voittaa valitun palikan');
// ehto tarkistetaan vasta, kun ketju tulee siihen (ajastimen jälkeen)
X=mk();var t=KK.addBlock(X.P,'ajastin',{kesto:10});var nt=KK.addNode(X.P,t.id,0,0,X.w.id);KK.addLink(X.P,nt.id,'e',X.nh.id,'e');
KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),[]);X.P.st[X.r.id]=true;NOW+=10000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),['kyllä'],'tilanne ajastimen jälkeen ratkaisee');
// toista kunnes: ei-haara → ajastin → takaisin ehtoon
X=mk();var P=X.P;var eiN=P.lg.l.filter(function(l){return l.f===X.nh.id&&l.fp==='m';})[0].t;KK.removeNode(P,eiN);var t2=KK.addBlock(P,'ajastin',{kesto:5}),nt2=KK.addNode(P,t2.id,200,120,X.w.id);KK.addLink(P,X.nh.id,'m',nt2.id,'e');KK.addLink(P,nt2.id,'e',X.nh.id,'e');
KK.chainStart(P,X.k.id,C);A.strictEqual(P.st[X.k.id].run,true);NOW+=5000;KK.chainPoll(P,C);A.deepStrictEqual(rows(X),[]);
P.st[X.r.id]=true;NOW+=5000;KK.chainPoll(P,C);A.deepStrictEqual(rows(X),['kyllä'],'toistaa, kunnes valittu');A.strictEqual(P.st[X.k.id].run,false);
A.ok(!KK.chainIssues(P,X.k.id,C).some(function(x){return /Kehä ilman/.test(x.t);}),'ehdon kehä ajastimen kautta on kunnossa');
// puuttuva ehto: huomautus ja selkeä pysähdys
X=mk();X.h.o='';var is=KK.chainIssues(X.P,X.k.id,C).map(function(x){return x.t;}).join('|');A.ok(/valitse palikka, jota ehto tarkistaa/.test(is));
KK.chainStart(X.P,X.k.id,C);A.ok(/valitse, mitä ehto tarkistaa/.test(X.P.st[X.k.id].err));
// virhe ehdossa
X=mk();var kb=KK.addBlock(X.P,'kaava');var nkb=KK.addNode(X.P,kb.id,-300,40);kb.f=KK.kaavaToIds(X.P,'1 / 0');KK.addLink(X.P,nkb.id,'v',X.nh.id,'c');
KK.chainStart(X.P,X.k.id,C);A.ok(/ehdossa on virhe: jako nollalla/.test(X.P.st[X.k.id].err));
// pois käytöstä: jatkaa kyllä-haaraan
X=mk();X.h.off=true;KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['kyllä']);
// kumpikaan haara ei jatku: tieto
X=mk();X.P.lg.l=X.P.lg.l.filter(function(l){return l.f!==X.nh.id;});A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(x){return x.info&&/kumpikaan haara/.test(x.t);}));
// tallennus
X=mk();var J=KK.repair(JSON.parse(JSON.stringify(X.P)));A.strictEqual(J.b[X.h.id].o,X.r.id);J.b[X.r.id]&&KK.removeBlock(J,X.r.id);A.strictEqual(J.b[X.h.id].o,X.r.id,'poistettu kohde jää näkyväksi virheeksi (D08)');A.ok(KK.isErr(KK.haaraVal(J,J.b[X.h.id],C)));
console.log('logiikka_16_ehto ok');
