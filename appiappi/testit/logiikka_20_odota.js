// Versio 7.1: Odota, kunnes. Haara odottaa, kunnes palikka on valittu, ehto nuolesta pätee tai kohtaan tapahtuma tulee
// nuoli. Jatkuu heti, jos ehto jo pätee. Käytön aikana muutos vapauttaa heti (tick), muuten tarkistus sekunnin välein.
// Aikaraja vie aika loppui -haaraan. Toisen haaran tapahtuma samalla hetkellä vapauttaa odottavan haaran.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function mk(props){var P=KK.newProject('o');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista'),r=KK.addBlock(P,'ruutu',{nm:'Valmis'});
  var o=KK.addBlock(P,'odota',Object.assign({o:r.id},props||{}));var no=KK.addNode(P,o.id,0,40,w.id);
  var a=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'jatkui'}),na=KK.addNode(P,a.id,0,120,w.id);KK.addLink(P,no.id,'e',na.id,'e');
  return {P:P,k:k,w:w,lst:lst,r:r,o:o,no:no};}
function rows(X){return KK.listRows(X.P,X.lst.id).map(function(r){return r.tx;});}
A.strictEqual(KK.K.odota.n,'Odota, kunnes');A.ok(KK.isStep({k:'odota'}));
A.deepStrictEqual(KK.ports({k:'odota'}).outs.map(function(p){return p.n;}),['jatkuu']);
A.deepStrictEqual(KK.ports({k:'odota',raja:5}).outs.map(function(p){return p.n;}),['jatkuu','aika loppui']);
A.deepStrictEqual(KK.ports({k:'odota'}).ins.map(function(p){return p.p;}),['e','c','x']);
// odottaa, kunnes valittu; tick vapauttaa heti
var X=mk();KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),[]);A.strictEqual(X.P.st[X.k.id].run,true);A.strictEqual(X.P.st[X.k.id].tk[0].hd,1);
A.ok(/Odottaa, kunnes ”Valmis” on valittu/.test(KK.why(X.P,KK.Ev(X.P,C),X.o.id,1).txt));
NOW+=60000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),[],'odottaa edelleen');
KK.userSet(X.P,X.r.id,true,C);A.deepStrictEqual(rows(X),['jatkui'],'käyttäjän valinta vapautti heti');A.strictEqual(X.P.st[X.k.id].run,false);
// jo valittu: jatkuu heti
X=mk();X.P.st[X.r.id]=true;KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),['jatkui']);
// sekunnin tarkistus (ilman tickiä): ehto muuttuu suoraan tilassa
X=mk();KK.chainStart(X.P,X.k.id,C);X.P.st[X.r.id]=true;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),['jatkui']);
// ehto nuolesta: kaava
X=mk({o:''});var sl=KK.addBlock(X.P,'saadin',{nm:'Taso',start:1});var kv=KK.addBlock(X.P,'kaava');var nk=KK.addNode(X.P,kv.id,-300,40);kv.f=KK.kaavaToIds(X.P,'taso >= 5');KK.addLink(X.P,nk.id,'v',X.no.id,'c');
KK.chainStart(X.P,X.k.id,C);KK.userSet(X.P,sl.id,3,C);A.deepStrictEqual(rows(X),[]);KK.userSet(X.P,sl.id,6,C);A.deepStrictEqual(rows(X),['jatkui']);
// tapahtuma nuolesta: painike painettu odotuksen aikana
X=mk({o:''});var bt=KK.addBlock(X.P,'nappi',{beh:'kerta'}),nb=KK.addNode(X.P,bt.id,-300,0);var lx=KK.addLink(X.P,nb.id,'e',X.no.id,'x');A.ok(lx&&!KK.isChainLink(X.P,lx));
KK.press(X.P,bt.id,C);A.strictEqual(X.P.st[X.k.id],undefined,'painallus ennen odotusta ei käynnistä ketjua');
KK.chainStart(X.P,X.k.id,C);A.deepStrictEqual(rows(X),[],'aiempi painallus ei vapauta');KK.press(X.P,bt.id,C);A.deepStrictEqual(rows(X),['jatkui']);
// aikaraja: aika loppui -haara
X=mk({raja:10,yks:'s'});var b2=KK.addBlock(X.P,'tee',{do:'rivi',o:X.lst.id,tx:'aika loppui'}),nb2=KK.addNode(X.P,b2.id,200,120,X.w.id);KK.addLink(X.P,X.no.id,'m',nb2.id,'e');
var T0=NOW;KK.chainStart(X.P,X.k.id,C);A.strictEqual(X.P.st[X.k.id].tk[0].u,T0+10000);A.strictEqual(KK.Ev(X.P,C).timerLeft(X.o.id),10000,'aikarajaa jäljellä');
NOW+=5000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),[]);NOW+=5000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),['aika loppui']);
X=mk({raja:10,yks:'s'});KK.addLink(X.P,X.no.id,'m',KK.addNode(X.P,KK.addBlock(X.P,'tee',{do:'rivi',o:X.lst.id,tx:'aika loppui'}).id,200,120,X.w.id).id,'e');
KK.chainStart(X.P,X.k.id,C);NOW+=3000;KK.userSet(X.P,X.r.id,true,C);NOW+=20000;KK.chainPoll(X.P,C);A.deepStrictEqual(rows(X),['jatkui'],'ehto ennen aikarajaa');
// appi kiinni yli aikarajan: ehto tarkistetaan ensin
X=mk({raja:1,yks:'h'});KK.chainStart(X.P,X.k.id,C);var J=JSON.stringify(X.P);NOW+=7200000;var P2=KK.repair(JSON.parse(J));P2.st[X.r.id]=true;KK.chainPoll(P2,C);
A.deepStrictEqual(KK.listRows(P2,X.lst.id).map(function(r){return r.tx;}),['jatkui']);A.strictEqual(P2.st[X.k.id].tk.length,0);
// toinen haara samalla hetkellä vapauttaa: A odottaa tapahtumaa, B tekee merkin
var P=KK.newProject('synk');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista');
function st(tx,x,y){var b=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:tx});return KK.addNode(P,b.id,x,y,w.id);}
var alku=st('alku',0,0),od=KK.addBlock(P,'odota'),nod=KK.addNode(P,od.id,0,60,w.id),aj=st('A jatkui',0,120),bm=st('B merkki',200,60);
KK.addLink(P,alku.id,'e',nod.id,'e');KK.addLink(P,alku.id,'e',bm.id,'e');KK.addLink(P,nod.id,'e',aj.id,'e');KK.addLink(P,bm.id,'e',nod.id,'x');
KK.chainStart(P,k.id,C);A.deepStrictEqual(KK.listRows(P,lst.id).map(function(r){return r.tx;}),['alku','B merkki','A jatkui']);A.strictEqual(P.st[k.id].run,false);
// odotus kehässä: toistuva tarkistus ei ole kehävirhe
var Q=KK.newProject('kehä');var kq=KK.addBlock(Q,'ketju'),wq=KK.addNode(Q,kq.id,0,0),rq=KK.addBlock(Q,'ruutu');var cnt=KK.addBlock(Q,'muisti',{v:'0'});KK.addNode(Q,cnt.id,0,600);
var inc=KK.addBlock(Q,'tee',{do:'lisaa',o:cnt.id}),off=KK.addBlock(Q,'tee',{do:'tila',o:rq.id,ti:'ei'}),oq=KK.addBlock(Q,'odota',{o:rq.id});
var ni=KK.addNode(Q,inc.id,0,0,wq.id),nf=KK.addNode(Q,off.id,0,60,wq.id),noq=KK.addNode(Q,oq.id,0,120,wq.id);KK.addLink(Q,ni.id,'e',nf.id,'e');KK.addLink(Q,nf.id,'e',noq.id,'e');KK.addLink(Q,noq.id,'e',ni.id,'e');
A.ok(!KK.chainIssues(Q,kq.id,C).some(function(x){return /Kehä ilman/.test(x.t);}));
KK.chainStart(Q,kq.id,C);A.strictEqual(KK.Ev(Q,C).val(cnt.id),1);KK.userSet(Q,rq.id,true,C);A.strictEqual(KK.Ev(Q,C).val(cnt.id),2,'yksi kierros per valinta');KK.userSet(Q,rq.id,true,C);A.strictEqual(KK.Ev(Q,C).val(cnt.id),3);
A.strictEqual(Q.st[kq.id].run,true);A.strictEqual(Q.st[kq.id].err,'');
// odotus, jonka ehto pätee aina, kehässä ilman muuta odotusta: pysäytetään
Q.st[rq.id]=true;var off2=Q.b[off.id];off2.ti='on';KK.chainStop(Q,kq.id,C);KK.chainStart(Q,kq.id,C);A.strictEqual(Q.st[kq.id].run,false);A.ok(/kehää/.test(Q.st[kq.id].err));
// ei mitään odotettavaa: huomautus ja pysähdys
X=mk({o:''});A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(x){return !x.info&&/valitse, mitä odotetaan/.test(x.t);}));KK.chainStart(X.P,X.k.id,C);A.ok(/valitse, mitä odotetaan/.test(X.P.st[X.k.id].err));
// virheellinen aikaraja
X=mk({raja:'abc'});A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(x){return /aikaraja ei ole luku/.test(x.t);}));
// pysäytys kesken odotuksen ja tallennus
X=mk();KK.chainStart(X.P,X.k.id,C);var J2=KK.repair(JSON.parse(JSON.stringify(X.P)));A.strictEqual(J2.st[X.k.id].tk[0].hd,1);KK.chainStop(X.P,X.k.id,C);KK.userSet(X.P,X.r.id,true,C);A.deepStrictEqual(rows(X),[]);
console.log('logiikka_20_odota ok');
