// Versio 6.5: tulevien tapahtumien (efektien) rakenne. Teksti ilmestyy, Kuva vaihtuu, Animaatio ja Näkymänvaihto:
// lajit, kentät ja kohdat ovat valmiina. Ilman käyttöliittymän efektiä ketju jatkuu ohi. Kun käyttöliittymä
// (ctx.fx) osaa efektin, se saa tapahtuman tiedot, ja ketju odottaa efektin keston. Virhe efektissä ei riko ketjua.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
['ilmesty','kuva','anim','nvaihto'].forEach(function(k){
  A.ok(KK.K[k]&&KK.K[k].fx&&KK.isStep({k:k}),k);A.ok(KK.FXK[k]);
  var pr=KK.ports({k:k});A.deepStrictEqual(pr.ins.map(function(p){return p.p+p.t;}),['ee']);A.deepStrictEqual(pr.outs.map(function(p){return p.p+p.t;}),['ee']);
  A.strictEqual(KK.K[k].d.odota,true);A.ok(KK.K[k].d.kesto>0);});
A.strictEqual(KK.K.ilmesty.n,'Teksti ilmestyy');A.strictEqual(KK.K.kuva.n,'Kuva vaihtuu');A.strictEqual(KK.K.anim.n,'Animaatio');A.strictEqual(KK.K.nvaihto.n,'Näkymänvaihto');
function mk(){var P=KK.newProject('fx');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista');
  var a=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'ennen'}),f=KK.addBlock(P,'ilmesty',{tx:'Hei',kesto:2}),b=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'jälkeen'});
  var na=KK.addNode(P,a.id,0,40,w.id),nf=KK.addNode(P,f.id,0,100,w.id),nb=KK.addNode(P,b.id,0,160,w.id);KK.addLink(P,na.id,'e',nf.id,'e');KK.addLink(P,nf.id,'e',nb.id,'e');
  return {P:P,k:k,f:f,lst:lst};}
function rows(X){return KK.listRows(X.P,X.lst.id).map(function(r){return r.tx;});}
// ilman efektiä: ohitetaan
var X=mk();KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['ennen','jälkeen']);A.strictEqual(X.P.st[X.k.id].run,false);
A.ok(/Valitse palikka/.test(KK.why(X.P,KK.Ev(X.P,C),X.f.id,1).txt),'Appi-appi 9: efekti ilman kohdetta pyytää valitsemaan palikan');
// efekti osaa: saa tiedot ja ketju odottaa
X=mk();var got=[];var CF={now:C.now,toast:C.toast,nav:C.nav,fx:function(q){got.push([q.k,q.id,q.b.tx,!!q.P]);return q.b.kesto;}};
KK.chainStart(X.P,X.k.id,CF);A.deepStrictEqual(got,[['ilmesty',X.f.id,'Hei',true]]);A.deepStrictEqual(rows(X),['ennen']);A.strictEqual(X.P.st[X.k.id].run,true);
NOW+=1000;KK.chainPoll(X.P,CF);A.deepStrictEqual(rows(X),['ennen']);A.strictEqual(got.length,1,'efektiä ei tehdä uudelleen odottaessa');
NOW+=1000;KK.chainPoll(X.P,CF);A.deepStrictEqual(rows(X),['ennen','jälkeen']);
// odota pois päältä: efekti tehdään, ketju jatkuu heti
X=mk();X.f.odota=false;got=[];KK.chainStart(X.P,X.k.id,CF);A.strictEqual(got.length,1);A.deepStrictEqual(rows(X),['ennen','jälkeen']);
// virhe efektissä: ketju jatkuu
X=mk();KK.chainStart(X.P,X.k.id,{now:C.now,fx:function(){throw new Error('rikki');}});A.deepStrictEqual(rows(X),['ennen','jälkeen']);
// tallennus: kentät säilyvät, korjaus täydentää puuttuvat
X=mk();var J=KK.repair(JSON.parse(JSON.stringify(X.P)));A.strictEqual(J.b[X.f.id].tx,'Hei');A.strictEqual(J.b[X.f.id].tapa,'kirjain');
delete J.b[X.f.id].odota;delete J.b[X.f.id].kesto;KK.repair(J);A.strictEqual(J.b[X.f.id].odota,true);A.strictEqual(J.b[X.f.id].kesto,1);
var n=KK.addBlock(J,'nvaihto');A.strictEqual(n.siirtyma,'liuku');A.strictEqual(n.vw,'');
console.log('logiikka_14_tulevat ok');
