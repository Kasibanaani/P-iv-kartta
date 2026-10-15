// Versio 7.2: Monta haaraa. Jokainen rivi on oma haaransa: palikka on valittu, arvo on täsmälleen tai arvo välillä.
// Ensimmäinen pätevä ratkaisee, muuten muuten-haara. Kohdat seuraavat rivejä, nimet näkyvät, poisto ja järjestys,
// päätöspuu kahdella tasolla, virhe arvossa, huomautukset, Miksi?, korjaus ja tallennus.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
var P=KK.newProject('mh');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0),lst=KK.addBlock(P,'lista');
var b1=KK.addBlock(P,'nappi',{nm:'Huono'}),b2=KK.addBlock(P,'nappi',{nm:'Ok'}),b3=KK.addBlock(P,'nappi',{nm:'Hyvä'});
var mh=KK.addBlock(P,'monihaara',{haarat:[{m:'val',o:b1.id},{m:'val',o:b2.id,nm:'Keskiverto'},{m:'val',o:b3.id}]});var nmh=KK.addNode(P,mh.id,0,40,w.id);KK.repair(P);
A.deepStrictEqual(mh.haarat.map(function(r){return r.id;}),['h1','h2','h3'],'tunnisteet');
var outs=KK.ports(mh).outs;A.deepStrictEqual(outs.map(function(p){return p.p;}),['h1','h2','h3','m']);A.strictEqual(outs[1].n,'Keskiverto');A.strictEqual(outs[3].n,'muuten');
function leaf(tx,from,port){var b=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:tx});var n=KK.addNode(P,b.id,0,200,w.id);KK.addLink(P,from.id,port,n.id,'e');return n;}
leaf('huono',nmh,'h1');leaf('ok',nmh,'h2');var nh3=leaf('hyvä',nmh,'h3');leaf('ei vastausta',nmh,'m');
A.strictEqual(KK.chainLinksFrom(P,nmh.id).length,4);
function run(){KK.chainStart(P,k.id,C);var r=KK.listRows(P,lst.id);return r[r.length-1].tx;}
A.strictEqual(run(),'ei vastausta');P.st[b2.id]=true;A.strictEqual(run(),'ok');P.st[b1.id]=true;A.strictEqual(run(),'huono','ensimmäinen pätevä ratkaisee');
A.ok(/Haara 1 \(”valittu”\) pätee ensimmäisenä/.test(KK.why(P,KK.Ev(P,C),mh.id,2).txt));
// toinen taso: hyvä → arvon mukaan
P.st[b1.id]=false;P.st[b2.id]=false;P.st[b3.id]=true;
var sl=KK.addBlock(P,'saadin',{nm:'Pisteet',start:5});var ns=KK.addNode(P,sl.id,-300,300);
var mh2=KK.addBlock(P,'monihaara',{haarat:[{m:'vali',a:'',b:'4'},{m:'vali',a:'4',b:'8'},{m:'on',a:'10'}]});var nmh2=KK.addNode(P,mh2.id,0,300,w.id);KK.repair(P);KK.addLink(P,ns.id,'v',nmh2.id,'a');
P.lg.l=P.lg.l.filter(function(l){return l.f!==nh3.id;});KK.addLink(P,nh3.id,'e',nmh2.id,'e');
leaf('alle 4',nmh2,'h1');leaf('4–8',nmh2,'h2');leaf('kymppi',nmh2,'h3');leaf('muu',nmh2,'m');
var r0=KK.listRows(P,lst.id).length;KK.chainStart(P,k.id,C);A.deepStrictEqual(KK.listRows(P,lst.id).slice(r0).map(function(r){return r.tx;}),['hyvä','4–8']);
KK.userSet(P,sl.id,10,C);r0=KK.listRows(P,lst.id).length;KK.chainStart(P,k.id,C);A.deepStrictEqual(KK.listRows(P,lst.id).slice(r0).map(function(r){return r.tx;}),['hyvä','kymppi']);
KK.userSet(P,sl.id,9,C);A.strictEqual(KK.Ev(P,C).mhRow(mh2.id).i,-1,'9 ei osu mihinkään');
KK.userSet(P,sl.id,0,C);A.strictEqual(KK.Ev(P,C).mhRow(mh2.id).id,'h1','tyhjä alaraja = rajaton');
// ilman arvoa: ei osu, muuten
var Q=KK.newProject('q');var qk=KK.addBlock(Q,'ketju'),qw=KK.addNode(Q,qk.id,0,0);var qm=KK.addBlock(Q,'monihaara',{haarat:[{m:'on',a:'1'}]});KK.addNode(Q,qm.id,0,40,qw.id);KK.repair(Q);
A.ok(KK.chainIssues(Q,qk.id,C).some(function(x){return /valitse arvo, jota haarat vertaavat/.test(x.t);}));A.strictEqual(KK.Ev(Q,C).mhRow(qm.id).i,-1);
qm.a='1';A.strictEqual(KK.Ev(Q,C).mhRow(qm.id).id,'h1','arvo kirjoitettuna');
// virhe arvossa: ketju pysähtyy selkeästi
var kv=KK.addBlock(Q,'kaava');var nkv=KK.addNode(Q,kv.id,-300,0);kv.f=KK.kaavaToIds(Q,'1 / 0');KK.addLink(Q,nkv.id,'v',KK.nodesOfBlock(Q,qm.id)[0].id,'a');
KK.chainStart(Q,qk.id,C);A.ok(/arvossa on virhe: jako nollalla/.test(Q.st[qk.id].err));
// tyhjä ja puuttuva palikka: huomautukset
var qm2=KK.addBlock(Q,'monihaara');KK.addNode(Q,qm2.id,0,100,qw.id);A.ok(KK.chainIssues(Q,qk.id,C).some(function(x){return /lisää ainakin yksi haara/.test(x.t);}));
qm2.haarat=[{m:'val',o:''}];KK.repair(Q);A.ok(KK.chainIssues(Q,qk.id,C).some(function(x){return /haara 1: valitse palikka/.test(x.t);}));
// poisto: rivin poisto poistaa sen kohdan ja viivan korjauksessa; tunnisteet eivät vaihdu
mh.haarat.splice(0,1);KK.repair(P);A.deepStrictEqual(mh.haarat.map(function(r){return r.id;}),['h2','h3']);A.ok(!P.lg.l.some(function(l){return l.f===nmh.id&&l.fp==='h1';}),'poistetun haaran viiva pois');
mh.haarat.push({m:'val',o:b1.id});KK.repair(P);A.strictEqual(mh.haarat[2].id,'h4','uusi tunniste ei käytä vanhaa');
// rikkinäinen tieto
var R=KK.newProject('r');var rm=KK.addBlock(R,'monihaara');KK.addNode(R,rm.id,0,0);rm.haarat=[null,'x',{m:'outo',a:5,o:'eiole',id:'h1'},{id:'h1',m:'vali'}];KK.repair(R);
A.deepStrictEqual(rm.haarat.map(function(r){return [r.id,r.m,r.a,r.o];}),[['h1','on','5',''],['h2','vali','','']]);
// {Nimi} rivissä ja tallennus
var J=KK.repair(JSON.parse(JSON.stringify(P)));A.deepStrictEqual(J.b[mh2.id].haarat,mh2.haarat);
A.ok((KK.deps(P).uses[mh.id]||[]).some(function(u){return u.id===b2.id&&u.how==='ehto';}));
console.log('logiikka_21_monihaara ok');
