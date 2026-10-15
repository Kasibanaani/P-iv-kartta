// Ikkunat eli sulut: JA, TAI, VAIN YKSI (+ valinta poistaa muut), N, EI, SUMMA, sisäkkäisyys ja tulosjäsenet.
var KK=require('./moottori.js'),A=require('assert');var C={now:function(){return new Date(2026,9,14);}};
var P=KK.newProject('t');function W(m,extra){var b=KK.addBlock(P,'ikkuna',Object.assign({m:m},extra||{}));return [b,KK.addNode(P,b.id,0,0)];}
var a=KK.addBlock(P,'ruutu'),b=KK.addBlock(P,'ruutu'),c=KK.addBlock(P,'kytkin');
var w=W('or'),wb=w[0],wn=w[1];[a,b,c].forEach(function(x){KK.addNode(P,x.id,0,0,wn.id);});
function V(id){return KK.Ev(P,C).val(id);}
A.strictEqual(V(wb.id),false);KK.userSet(P,b.id,true,C);A.strictEqual(V(wb.id),true);
['and','one','min','max','eq','not','cnt'].forEach(function(m){wb.m=m;wb.n=1;});
wb.m='and';A.strictEqual(V(wb.id),false);KK.userSet(P,a.id,true,C);KK.userSet(P,c.id,true,C);A.strictEqual(V(wb.id),true);
wb.m='one';A.strictEqual(V(wb.id),false);wb.m='min';wb.n=2;A.strictEqual(V(wb.id),true);wb.m='max';A.strictEqual(V(wb.id),false);wb.m='eq';wb.n=3;A.strictEqual(V(wb.id),true);wb.m='not';A.strictEqual(V(wb.id),false);wb.m='cnt';A.strictEqual(V(wb.id),3);
// VAIN YKSI + valinta poistaa muut
wb.m='one';wb.pakota=true;KK.userSet(P,a.id,true,C);A.deepStrictEqual([P.st[a.id],P.st[b.id],P.st[c.id]],[true,false,false]);A.strictEqual(V(wb.id),true);
// summa ja sisäkkäisyys: (säädin ≤ 3) JA (TAI-ikkuna) – vertailuun viety säädin ei ole oma jäsenensä
var s=KK.addBlock(P,'saadin',{start:2});var outer=W('and'),ow=outer[1];var ns=KK.addNode(P,s.id,0,0,ow.id);var le=KK.addBlock(P,'vert',{op:'le',b:3});var nle=KK.addNode(P,le.id,0,0,ow.id);KK.addLink(P,ns.id,'v',nle.id,'a');
wn.g=ow.id;A.strictEqual(V(outer[0].id),true,'säädin 2 ≤ 3 ja yksi valittu');
KK.userSet(P,s.id,8,C);A.strictEqual(V(outer[0].id),false);
var sum=W('sum'),sw=sum[1];var l1=KK.addBlock(P,'luku',{start:4}),l2=KK.addBlock(P,'luku',{start:'2,5'});KK.addNode(P,l1.id,0,0,sw.id);KK.addNode(P,l2.id,0,0,sw.id);A.strictEqual(V(sum[0].id),6.5);
sum[0].m='avg';A.strictEqual(V(sum[0].id),3.25);sum[0].m='maxv';A.strictEqual(V(sum[0].id),4);
// käänteinen esiintymä (EI)
var nn=KK.addNode(P,a.id,0,0,'');var t=W('and');nn.g=t[1].id;nn.not=true;A.strictEqual(V(t[0].id),false);KK.userSet(P,a.id,false,C);A.strictEqual(V(t[0].id),true);
// sisäkkäisyyden kehä korjataan
ow.g=wn.id;KK.repair(P);A.ok(!(ow.g===wn.id&&wn.g===ow.id),'kehä purettu');
console.log('ok ikkunat');
