// Versio 7.3: ketju käynnistää ja pysäyttää toisen ketjun. Toiminnot Käynnistä ketju (valinnainen odotus valmistumiseen)
// ja Pysäytä ketju, myös painikkeesta. Rinnakkainen käynnistys, odotus ajastimen yli ja sulkemisen yli, pysäytetty ei
// jätä odottamaan, itsensä käynnistys ja toisiaan odottavat ketjut huomataan, valmis-nuoli toimii edelleen.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
A.strictEqual(KK.DOS.kaynnista,'Käynnistä ketju');A.strictEqual(KK.DOS.pysayta,'Pysäytä ketju');
var P=KK.newProject('kk');var lst=KK.addBlock(P,'lista');function rows(){return KK.listRows(P,lst.id).map(function(r){return r.tx;});}
function chain(nm,y){var k=KK.addBlock(P,'ketju',{nm:nm});var w=KK.addNode(P,k.id,0,y);return {k:k,w:w,y:y,last:null};}
function step(c,props){var b=KK.addBlock(P,props.k||'tee',props);delete b.k2;var n=KK.addNode(P,b.id,10,c.y+40+(c.n=(c.n||0)+1)*60,c.w.id);if(c.last)KK.addLink(P,c.last.id,'e',n.id,'e');c.last=n;return n;}
function row(c,tx){return step(c,{do:'rivi',o:lst.id,tx:tx});}
var A1=chain('Pää',0),B1=chain('Ali',500);
row(A1,'A alku');var st=step(A1,{do:'kaynnista',o:B1.k.id,odota:true});row(A1,'A loppu');
row(B1,'B alku');var t=KK.addBlock(P,'ajastin',{kesto:10});var nt=KK.addNode(P,t.id,10,700,B1.w.id);KK.addLink(P,B1.last.id,'e',nt.id,'e');B1.last=nt;row(B1,'B loppu');
A.strictEqual(KK.descAct(P,st.p),'Käynnistä ketju: Ali ja odota');
KK.chainStart(P,A1.k.id,C);A.deepStrictEqual(rows(),['A alku','B alku']);A.strictEqual(P.st[A1.k.id].run,true);A.strictEqual(P.st[B1.k.id].run,true);
A.ok(KK.chainIssues(P,B1.k.id,C).every(function(x){return !/Mikään ei vielä käynnistä/.test(x.t);}),'toinen ketju laskee käynnistäjäksi');
NOW+=10000;KK.chainPoll(P,C);A.deepStrictEqual(rows(),['A alku','B alku','B loppu','A loppu'],'A jatkoi, kun B oli valmis');A.strictEqual(P.st[A1.k.id].run,false);
// sulkemisen yli
KK.chainStart(P,A1.k.id,C);var J=JSON.stringify(P);NOW+=60000;var P2=KK.repair(JSON.parse(J));KK.chainPoll(P2,C);
var r2=KK.listRows(P2,lst.id).map(function(r){return r.tx;});A.deepStrictEqual(r2.slice(-2),['B loppu','A loppu'],'avattaessa molemmat jatkuvat');KK.chainStop(P,A1.k.id,C);KK.chainStop(P,B1.k.id,C);
// ilman odotusta: rinnakkain
P.b[st.p].odota=false;var r0=rows().length;KK.chainStart(P,A1.k.id,C);A.deepStrictEqual(rows().slice(r0),['A alku','B alku','A loppu']);A.strictEqual(P.st[A1.k.id].run,false);A.strictEqual(P.st[B1.k.id].run,true);
// pysäytys toisesta ketjusta: odottava jatkaa, kun pysäytetty
P.b[st.p].odota=true;KK.chainStop(P,B1.k.id,C);r0=rows().length;KK.chainStart(P,A1.k.id,C);A.strictEqual(P.st[A1.k.id].run,true);
var C1=chain('Lopetus',1000);step(C1,{do:'pysayta',o:B1.k.id});A.strictEqual(KK.descAct(P,C1.last.p),'Pysäytä ketju: Ali');
KK.chainStart(P,C1.k.id,C);A.strictEqual(P.st[B1.k.id].run,false);A.strictEqual(P.st[B1.k.id].stop,true);
KK.tick(P,C);A.deepStrictEqual(rows().slice(r0),['A alku','B alku','A loppu'],'pysäytetty ei jätä odottamaan');
// painike käynnistää ketjun (pikatoiminto)
var btn=KK.addBlock(P,'nappi',{beh:'kerta'});var nb=KK.addNode(P,btn.id,-400,0);var ka=KK.addBlock(P,'tee',{do:'kaynnista',o:B1.k.id});KK.addLink(P,nb.id,'e',KK.addNode(P,ka.id,-200,0).id,'e');
KK.press(P,btn.id,C);A.strictEqual(P.st[B1.k.id].run,true);KK.chainStop(P,B1.k.id,C);
// odotus kohteeseen, joka on pois päältä: jatkaa heti
B1.k.off=true;r0=rows().length;KK.chainStart(P,A1.k.id,C);A.deepStrictEqual(rows().slice(r0),['A alku','A loppu']);
A.ok(KK.chainIssues(P,A1.k.id,C).some(function(x){return x.info&&/on pois päältä/.test(x.t);}));B1.k.off=false;
// itsensä käynnistys: huomautus, ei jumia
var S1=chain('Itse',1500);row(S1,'s');step(S1,{do:'kaynnista',o:S1.k.id,odota:true});row(S1,'s loppu');
A.ok(KK.chainIssues(P,S1.k.id,C).some(function(x){return !x.info&&/ei voi käynnistää itseään/.test(x.t);}));
r0=rows().length;KK.chainStart(P,S1.k.id,C);A.deepStrictEqual(rows().slice(r0),['s','s loppu']);A.strictEqual(P.st[S1.k.id].run,false);
// toisiaan odottavat ketjut: huomautus
var X1=chain('X',2000),Y1=chain('Y',2500);var sx=step(X1,{do:'kaynnista',o:Y1.k.id,odota:true});var sy=step(Y1,{do:'kaynnista',o:X1.k.id,odota:true});
A.ok(KK.chainIssues(P,X1.k.id,C).some(function(x){return /odottavat toisiaan: X → Y → X/.test(x.t);}));
// väärä kohde
var Z1=chain('Z',3000);step(Z1,{do:'kaynnista',o:lst.id});A.ok(KK.chainIssues(P,Z1.k.id,C).some(function(x){return /ei ole ketju/.test(x.t);}));
// valmis-nuoli ketjusta toiseen toimii yhä
var V1=chain('V1',3500),V2=chain('V2',4000);row(V1,'v1');row(V2,'v2');KK.addLink(P,V1.w.id,'e',V2.w.id,'e');r0=rows().length;KK.chainStart(P,V1.k.id,C);A.deepStrictEqual(rows().slice(r0),['v1','v2']);
console.log('logiikka_22_ketjusta_ketjuun ok');
