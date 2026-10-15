// Arvot, laskut, vertailut, päivämäärät ja viikkonumerot.
var KK=require('./moottori.js'),A=require('assert');
var now=function(){return new Date(2026,9,14,12,0);},C={now:now};
A.strictEqual(KK.isoWeek('2026-10-14'),42);A.strictEqual(KK.isoWeek('2026-01-01'),1);A.strictEqual(KK.isoWeek('2027-01-01'),53);A.strictEqual(KK.isoWeek('2024-12-30'),1);
A.strictEqual(KK.fmtDate('2026-10-14','pp.kk.vvvv'),'14.10.2026');A.strictEqual(KK.fmtDate('2026-10-14','pp.kk.vv'),'14.10.26');
A.strictEqual(KK.parseDate('24.12.',now()),'2026-12-24');A.strictEqual(KK.parseDate('1.2.27',now()),'2027-02-01');A.strictEqual(KK.parseDate('+5',now()),'2026-10-19');
A.strictEqual(KK.parseDate('31.2.2026',now()),null);A.strictEqual(KK.parseDate('tänään',now()),'2026-10-14');A.strictEqual(KK.addDays('2026-03-28',2),'2026-03-30');
A.strictEqual(KK.diffDays('2026-11-01','2026-10-14'),18);
A.deepStrictEqual(KK.calc('add',KK.D('2026-10-14'),5),KK.D('2026-10-19'));A.strictEqual(KK.calc('sub',KK.D('2026-10-20'),KK.D('2026-10-14')),6);
A.strictEqual(KK.calc('add','Hei ','maailma'),'Hei maailma');A.deepStrictEqual(KK.calc('div',1,0),{err:'jako nollalla'});A.strictEqual(KK.calc('mul','2,5',2),5);A.strictEqual(KK.calc('add',0.1,0.2),0.3);
A.strictEqual(KK.cmp('lt',2,3),true);A.strictEqual(KK.cmp('eq','Kyllä ','kyllä'),true);A.strictEqual(KK.cmp('lt',KK.D('2026-10-14'),'20.10.2026',now()),true);A.strictEqual(KK.cmp('lt',null,3),false);A.strictEqual(KK.cmp('eq',null,''),true);
A.strictEqual(KK.fmt(true),'kyllä');A.strictEqual(KK.fmt(3.456),'3,46');A.strictEqual(KK.fmt(-2),'−2');A.strictEqual(KK.fmt(null),'–');
A.strictEqual(KK.datePart('vkp',KK.D('2026-10-14')),'keskiviikko');A.strictEqual(KK.datePart('ero',KK.D('2026-10-19'),now()),5);
// palikat ja nuolet: Tänään + 5, viikkonumero
var P=KK.newProject('t');var t=KK.addBlock(P,'tanaan'),l=KK.addBlock(P,'lasku',{op:'add',b:'5'}),o=KK.addBlock(P,'pvmosa',{part:'vk'});
var nt=KK.addNode(P,t.id,0,0),nl=KK.addNode(P,l.id,100,0),no=KK.addNode(P,o.id,200,0);
KK.addLink(P,nt.id,'v',nl.id,'a');KK.addLink(P,nl.id,'v',no.id,'a');
var E=KK.Ev(P,C);A.strictEqual(E.fmt(E.val(l.id)),'19.10.2026');A.strictEqual(E.val(o.id),43);
// kirjoitettu arvo viittauksella {r}
var s=KK.addBlock(P,'saadin',{start:4});var v=KK.addBlock(P,'vert',{op:'le',a:{r:s.id},b:'4'});KK.addNode(P,v.id,0,0);
A.strictEqual(KK.Ev(P,C).val(v.id),true);KK.userSet(P,s.id,9,C);A.strictEqual(KK.Ev(P,C).val(v.id),false);
KK.userSet(P,s.id,99,C);A.strictEqual(P.st[s.id],10,'säädin rajataan');
// mallipohja: nimet ↔ tunnisteet
var tx=KK.addBlock(P,'nayta',{tx:'Viikko {#'+o.id+'}'});A.strictEqual(KK.Ev(P,C).text(tx.id),'Viikko 43');
A.strictEqual(KK.toNames(P,tx.tx),'Viikko {'+o.nm+'}');A.strictEqual(KK.toIds(P,'Viikko {'+o.nm+'} {ei ole}'),'Viikko {#'+o.id+'} {ei ole}');
o.nm='Vk';A.strictEqual(KK.toNames(P,tx.tx),'Viikko {Vk}','nimen vaihto ei riko viittausta');
// VALITSE valitsee arvon (versiossa 1 tämä oli JOS-palikan tehtävä)
var j=KK.addBlock(P,'valitse',{a:'Iso',b:'Pieni'});var nj=KK.addNode(P,j.id,0,0);var ns=KK.addNode(P,s.id,0,0);var g=KK.addBlock(P,'vert',{op:'gt',b:5});var ng=KK.addNode(P,g.id,0,0);
KK.addLink(P,ns.id,'v',ng.id,'a');KK.addLink(P,ng.id,'v',nj.id,'c');A.strictEqual(KK.Ev(P,C).val(j.id),'Iso');KK.userSet(P,s.id,2,C);A.strictEqual(KK.Ev(P,C).val(j.id),'Pieni');
console.log('ok arvot ja päivät');
