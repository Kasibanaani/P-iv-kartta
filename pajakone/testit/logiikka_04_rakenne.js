// Rakenne: nuolten säännöt, poistot, repair ja vanhan/rikkinäisen tiedon lukeminen.
var KK=require('./moottori.js'),A=require('assert');
var P=KK.newProject('t');var b=KK.addBlock(P,'nappi'),t=KK.addBlock(P,'tee',{do:'valitse',o:b.id}),l=KK.addBlock(P,'lasku');
var nb=KK.addNode(P,b.id,0,0),nt=KK.addNode(P,t.id,0,0),nl=KK.addNode(P,l.id,0,0),nl2=KK.addNode(P,l.id,50,0);
A.ok(KK.addLink(P,nb.id,'v',nl.id,'a'));A.ok(KK.addLink(P,nb.id,'e',nt.id,'e'));
A.strictEqual(KK.addLink(P,nb.id,'e',nl.id,'b'),null,'tapahtuma ei arvokohtaan');
A.strictEqual(KK.addLink(P,nl.id,'v',nl2.id,'a'),null,'palikka ei itseensä');
var x=KK.addBlock(P,'luku'),nx=KK.addNode(P,x.id,0,0);KK.addLink(P,nx.id,'v',nl.id,'a');A.strictEqual(P.lg.l.filter(function(q){return q.tp==='a';}).length,1,'arvokohtaan yksi nuoli');
var w=KK.addBlock(P,'ikkuna'),nw=KK.addNode(P,w.id,0,0);A.strictEqual(KK.addNode(P,w.id,9,9),nw,'ikkunalla yksi esiintymä');
KK.addLink(P,nx.id,'v',nw.id,'in');KK.addLink(P,nb.id,'v',nw.id,'in');A.strictEqual(P.lg.l.filter(function(q){return q.tp==='in';}).length,2,'mukaan-kohtaan monta');
// solmun poisto: logiikkapalikka poistuu viimeisen esiintymän mukana, näkymäpalikka ei
KK.removeNode(P,nl.id);A.ok(P.b[l.id]);KK.removeNode(P,nl2.id);A.ok(!P.b[l.id]);KK.removeNode(P,nb.id);A.ok(P.b[b.id]);
// näkymäpalikan poisto siivoaa viittaukset
var il=KK.addBlock(P,'ilmo',{nk:{m:'kun',r:b.id}});P.deco.push({id:'d1',a:b.id,b:il.id});KK.removeBlock(P,b.id);KK.repair(P);
A.deepStrictEqual(il.nk,{m:'aina'});A.strictEqual(P.deco.length,0);A.strictEqual(P.b[t.id].o,'');
// repairData lukee roskan ja puuttuvat kentät
var D=KK.repairData({projects:[{name:'Vanha',b:{q1:{id:'q1',k:'ruutu'},q2:{id:'q2',k:'outo'}},lg:{n:[{id:'n9',p:'q1',x:0,y:0,g:'nX'}],l:[{id:'l1',f:'n9',fp:'v',t:'n404',tp:'a'}]}},null,5]});
A.strictEqual(D.projects.length,1);var Q=D.projects[0];A.ok(Q.b.q1.nm);A.ok(!Q.b.q2);A.strictEqual(Q.lg.n[0].g,'');A.strictEqual(Q.lg.l.length,0);A.strictEqual(Q.views.length,1);A.strictEqual(Q.b.q1.v,'v1');
A.strictEqual(D.cfg.df,'pp.kk.vvvv');
var D2=KK.repairData(null);A.deepStrictEqual(D2.projects,[]);
// JSON-kierros säilyttää kaiken
var R=KK.repair(JSON.parse(JSON.stringify(P)));A.deepStrictEqual(Object.keys(R.b).sort(),Object.keys(P.b).sort());
console.log('ok rakenne');
