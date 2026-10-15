// Versio 7.5: Arpa ja Toista. Arpa jatkaa yhteen 2–9 vaihtoehdosta (testissä arpaluku ctx.rand), jakauma tasainen,
// puuttuva haara on tieto. Toista N kertaa: kierros-haara N kertaa (myös ilman ajastinta ja ajastimen kanssa), sitten
// valmis; laskuri alkaa alusta käynnistyksessä ja valmiin jälkeen; N nuolesta; 0 kierrosta; virheet; sisäkkäiset toistot.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,10,0,0).getTime();var RV=0;var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){},rand:function(){return RV;}};
function mk(){var P=KK.newProject('a');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista');return {P:P,k:k,w:w,lst:lst};}
function S(X,props,x,y){var b=KK.addBlock(X.P,props.k,props);return KK.addNode(X.P,b.id,x||0,y||0,X.w.id);}
function L(X,a,b,p){return KK.addLink(X.P,a.id,p||'e',b.id,'e');}
function rows(X){return KK.listRows(X.P,X.lst.id).map(function(r){return r.tx;});}
// Arpa
A.deepStrictEqual(KK.ports({k:'arpa'}).outs.map(function(p){return p.p;}),['a1','a2']);A.deepStrictEqual(KK.ports({k:'arpa',n:6}).outs.map(function(p){return p.n;}),['1','2','3','4','5','6']);
A.strictEqual(KK.arpaN({n:'15'}),9);A.strictEqual(KK.arpaN({n:'x'}),2);A.strictEqual(KK.arpaN({n:1}),2);
var X=mk();var ar=S(X,{k:'arpa',n:3});['yksi','kaksi','kolme'].forEach(function(t,i){L(X,ar,S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:t},i*260,80),'a'+(i+1));});
[[0,'yksi'],[0.34,'kaksi'],[0.999,'kolme'],[0.5,'kaksi']].forEach(function(c){RV=c[0];KK.chainStart(X.P,X.k.id,C);A.strictEqual(rows(X).slice(-1)[0],c[1],'arpa '+c[0]);});
// tasainen jakauma Math.randomilla
var cnt={};var C2={now:C.now,toast:C.toast,nav:C.nav};for(var i=0;i<600;i++){KK.chainStart(X.P,X.k.id,C2);var t=rows(X).slice(-1)[0];cnt[t]=(cnt[t]||0)+1;}
A.ok(cnt.yksi>120&&cnt.kaksi>120&&cnt.kolme>120,JSON.stringify(cnt));
X.P.b[ar.p].n=4;KK.repair(X.P);A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(x){return x.info&&/vaihtoehto 4 ei jatku/.test(x.t);}));
RV=0.9;var r0=rows(X).length;KK.chainStart(X.P,X.k.id,C);A.strictEqual(rows(X).length,r0,'arvottu haara ilman jatkoa päättyy');A.strictEqual(X.P.st[X.k.id].run,false);
X.P.b[ar.p].n=2;KK.repair(X.P);A.ok(!X.P.lg.l.some(function(l){return l.f===ar.id&&l.fp==='a3';}),'poistuneen vaihtoehdon viiva pois');
// Toista ilman ajastinta: 3 kierrosta
X=mk();var al=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'alku'}),to=S(X,{k:'toista',kerrat:3},0,60),bo=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'kierros'},0,120),lo=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'loppu'},260,120);
L(X,al,to);L(X,to,bo,'e');L(X,bo,to);L(X,to,lo,'m');
A.ok(!KK.chainIssues(X.P,X.k.id,C).some(function(x){return !x.info;}),'ei virheitä: toistokehä on sallittu');
KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['alku','kierros','kierros','kierros','loppu']);A.strictEqual(X.P.st[X.k.id].run,false);
KK.chainStart(X.P,X.k.id,C);A.strictEqual(rows(X).filter(function(r){return r==='kierros';}).length,6,'laskuri alkoi alusta');
A.ok(/kierros-haaraan 3 kertaa/.test(KK.why(X.P,KK.Ev(X.P,C),to.p,1).txt));
// 0 kierrosta: suoraan valmis
X.P.b[to.p].kerrat=0;var r1=rows(X).length;KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X).slice(r1),['alku','loppu']);
// N nuolesta
var sl=KK.addBlock(X.P,'saadin',{start:2});KK.addLink(X.P,KK.addNode(X.P,sl.id,-300,60).id,'v',to.id,'k');r1=rows(X).length;KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X).slice(r1),['alku','kierros','kierros','loppu']);
// virheet
X.P.lg.l=X.P.lg.l.filter(function(l){return !(l.t===to.id&&l.tp==='k');});X.P.b[to.p].kerrat='paljon';A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(x){return /ei ole luku/.test(x.t);}));
KK.chainStart(X.P,X.k.id,C);A.ok(/ei ole luku/.test(X.P.st[X.k.id].err));X.P.b[to.p].kerrat=5000;A.ok(/yli 1000/.test(KK.chainIssues(X.P,X.k.id,C).map(function(x){return x.t;}).join()));
// Toista ajastimen kanssa: 2 × (rivi, odota 10 s)
X=mk();to=S(X,{k:'toista',kerrat:2}),bo=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'k'},0,60);var tm=S(X,{k:'ajastin',kesto:10},0,120);lo=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'valmis'},260,60);
L(X,to,bo,'e');L(X,bo,tm);L(X,tm,to);L(X,to,lo,'m');
KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['k']);A.strictEqual(X.P.st[X.k.id].cnt[to.id],1);
NOW+=10000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),['k','k']);NOW+=10000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),['k','k','valmis']);
var J=KK.repair(JSON.parse(JSON.stringify(X.P)));A.ok(J.st[X.k.id].cnt===undefined||typeof J.st[X.k.id].cnt==='object');
// sisäkkäiset toistot: 2 × 3
X=mk();var o1=S(X,{k:'toista',kerrat:2}),o2=S(X,{k:'toista',kerrat:3},0,60),bb=S(X,{k:'tee',do:'rivi',o:X.lst.id,tx:'x'},0,120);
L(X,o1,o2,'e');L(X,o2,bb,'e');L(X,bb,o2);L(X,o2,o1,'m');KK.chainStart(X.P,X.k.id,C);A.strictEqual(rows(X).length,6);A.strictEqual(X.P.st[X.k.id].err,'');
// toisto ilman kierroksen jatkoa: tieto
X=mk();S(X,{k:'toista'});A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(x){return x.info&&/kierros-haara ei jatku/.test(x.t);}));
console.log('logiikka_24_arpa_toista ok');
