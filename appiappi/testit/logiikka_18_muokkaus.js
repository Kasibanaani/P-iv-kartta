// Versio 6.10: kopioi ja liitä. Ketju sisältöineen kopioituu uudeksi ketjuksi (uudet tunnisteet ja nimet, viivat mukana),
// yksittäinen tapahtuma liitetään samaan ketjuun, viittaukset kopioitujen välillä osoittavat uusiin ja muihin ennallaan,
// näkymän palikasta tulee uusi esiintymä, tavallinen ikkuna kopioituu, ja liitetty ketju toimii.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
var P=KK.newProject('kopio');var lst=KK.addBlock(P,'lista'),ru=KK.addBlock(P,'ruutu',{nm:'Ruutu'});
var k=KK.addBlock(P,'ketju',{nm:'Aamu'});k.nmSet=true;var w=KK.addNode(P,k.id,0,0);
var mu=KK.addBlock(P,'muisti',{nm:'Laskuri',v:'0'});mu.nmSet=true;var nmu=KK.addNode(P,mu.id,20,40,w.id);
var a=KK.addBlock(P,'tee',{do:'lisaa',o:mu.id}),t=KK.addBlock(P,'ajastin',{kesto:5}),h=KK.addBlock(P,'haara',{o:ru.id}),r=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Laskuri {#'+mu.id+'}'});
var na=KK.addNode(P,a.id,20,100,w.id),nt=KK.addNode(P,t.id,20,160,w.id),nh=KK.addNode(P,h.id,20,220,w.id),nr=KK.addNode(P,r.id,20,280,w.id);
KK.addLink(P,na.id,'e',nt.id,'e');KK.addLink(P,nt.id,'e',nh.id,'e');KK.addLink(P,nh.id,'e',nr.id,'e');
var nru=KK.addNode(P,ru.id,-300,0);KK.addLink(P,nru.id,'v',w.id,'e');
var nb0=Object.keys(P.b).length,nl0=P.lg.l.length;
// koko ketju
var clip=KK.copyNodes(P,[w.id]);A.strictEqual(clip.n.length,6,'ikkuna ja sen 5 solmua');A.strictEqual(clip.l.length,3,'vain sisäiset viivat');
var ids=KK.pasteNodes(P,clip,500,0);A.strictEqual(ids.length,6);
var k2=Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.k==='ketju'&&b.id!==k.id;})[0];
A.ok(k2&&k2.nm==='Aamu 2'&&k2.nmSet,'uusi nimi');A.notStrictEqual(k2.vt,k.vt);
var w2=KK.chainNode(P,k2.id);A.strictEqual(w2.x,500);A.strictEqual(KK.chainSteps(P,k2.id).length,4);
A.strictEqual(P.lg.l.filter(function(l){return KK.isChainLink(P,l);}).length,6,'viivat kopioituivat');
var mu2=Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.k==='muisti'&&b.id!==mu.id;})[0];A.strictEqual(mu2.nm,'Laskuri 2');
var a2=P.b[KK.nodeOf(P,KK.chainOrder(P,k2.id)[0]).p];A.strictEqual(a2.o,mu2.id,'kohde osoittaa kopioon');
var r2=P.b[KK.nodeOf(P,KK.chainOrder(P,k2.id)[3]).p];A.strictEqual(r2.tx,'Laskuri {#'+mu2.id+'}','viittaus tekstissä osoittaa kopioon');A.strictEqual(r2.o,lst.id,'muu viittaus ennallaan');
var h2=P.b[KK.nodeOf(P,KK.chainOrder(P,k2.id)[2]).p];A.strictEqual(h2.o,ru.id);
A.strictEqual(P.lg.l.length,nl0+3,'ulkoinen käynnistysnuoli ei kopioidu');
// liitetty ketju toimii itsenäisesti
P.st[ru.id]=true;KK.chainStart(P,k2.id,C);A.strictEqual(KK.Ev(P,C).val(mu2.id),1);A.strictEqual(KK.Ev(P,C).val(mu.id),0);NOW+=5000;KK.chainPoll(P,C);
A.deepStrictEqual(KK.listRows(P,lst.id).map(function(x){return x.tx;}),['Laskuri 1']);
// yksittäinen tapahtuma samaan ketjuun
var c1=KK.copyNodes(P,[nt.id]);var one=KK.pasteNodes(P,c1,40,40);A.strictEqual(one.length,1);A.strictEqual(KK.nodeOf(P,one[0]).g,w.id,'liitetään samaan ketjuun');
A.strictEqual(KK.chainSteps(P,k.id).length,5);
// näkymän palikasta uusi esiintymä
var c2=KK.copyNodes(P,[nru.id]);var ins=KK.pasteNodes(P,c2,0,60);A.strictEqual(KK.nodeOf(P,ins[0]).p,ru.id);A.strictEqual(KK.nodesOfBlock(P,ru.id).length,2);
// tavallinen ikkuna sisältöineen
var iw=KK.addBlock(P,'ikkuna',{m:'sum'}),iwn=KK.addNode(P,iw.id,0,600);var l1=KK.addBlock(P,'arvo',{v:'2'}),l2=KK.addBlock(P,'arvo',{v:'3'});KK.addNode(P,l1.id,10,640,iwn.id);KK.addNode(P,l2.id,10,700,iwn.id);
var c3=KK.copyNodes(P,[iwn.id]);var w3=KK.pasteNodes(P,c3,300,0);var iw2=P.b[KK.nodeOf(P,w3[0]).p];A.strictEqual(iw2.k,'ikkuna');A.strictEqual(KK.Ev(P,C).val(iw2.id),5);
// toiseen projektiin: näkymän palikat jäävät pois, logiikka tulee
var Q=KK.newProject('toinen');var q=KK.pasteNodes(Q,clip,0,0);A.strictEqual(q.length,6);A.strictEqual(Object.keys(Q.b).filter(function(i){return Q.b[i].k==='ketju';}).length,1);
var qh=Object.keys(Q.b).map(function(i){return Q.b[i];}).filter(function(b){return b.k==='haara';})[0];A.strictEqual(qh.o,'','puuttuva näkymän palikka tyhjenee');
// tyhjä leike
A.deepStrictEqual(KK.pasteNodes(P,null),[]);A.deepStrictEqual(KK.copyNodes(P,['eiole']).n,[]);
console.log('logiikka_18_muokkaus ok');
