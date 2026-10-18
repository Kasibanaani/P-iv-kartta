// Jonon 26 b (kartoitus 26 a S1–S2): kenttäparin arvo yhtenä kaavakenttänä. Tulkinta (luku, teksti, päivämäärä, kaava),
// laskenta (@alku + 5 ei enää liitä tekstiä), vanha {r} ja mallipohja, kunnostus, Liikkeen nopeus kaavasta, Yhteydet,
// poiston vaikutuslista, uudelleenkohdistus, kopiointi, kuvaus ja Miksi?.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function E(P){return KK.Ev(P,C);}
function nm(P,b,n){KK.setName(P,b.id,n);return b;}

// --- Tulkinta: mitä kirjoitettu tallentaa ---
(function(){var P=KK.newProject('t');var al=nm(P,LB(P,'arvo',{v:'1234,5678'}),'Alku');
  var AK=function(s){return KK.arvoKentta(P,s);};
  A.strictEqual(AK(''),'');A.strictEqual(AK('   '),'');
  A.strictEqual(AK('5'),'5','luku kuten ennen');A.strictEqual(AK('-2,5'),'-2,5');
  A.strictEqual(AK('Valmis'),'Valmis','tuntematon sana on teksti kuten ennen');A.strictEqual(AK('Hei maailma'),'Hei maailma');
  A.strictEqual(AK('24.12.2026'),'24.12.2026','päivämäärä kuten ennen');A.strictEqual(AK('kyllä'),'kyllä');A.strictEqual(AK('tänään'),'tänään');
  A.deepStrictEqual(AK('3 * 4'),{f:'3 * 4'},'lasku on kaava');A.deepStrictEqual(AK('"Maito"'),{f:'"Maito"'});
  A.deepStrictEqual(AK('@alku + 5'),{f:'{#'+al.id+'} + 5'},'@viite');A.deepStrictEqual(AK('@alku'),{f:'{#'+al.id+'}'});
  A.deepStrictEqual(AK('tänään + 5'),{f:'tänään + 5'});A.deepStrictEqual(AK('alku * 2'),{f:'{#'+al.id+'} * 2'},'paljas viite kuten kaavassa');
  var x=AK('@tuntematon');A.ok(KK.isFx(x),'@ tekee kaavan, vaikka nimi on tuntematon');A.ok(KK.isErr(E(P).kaava(x.f)),'ja virhe näkyy');
  A.deepStrictEqual(AK('"Kohta #1"'),{f:'"Kohta #1"'},'# lainausmerkeissä on tekstiä');A.strictEqual(AK('Kohta 1'),'Kohta 1','teksti ja luku ilman merkkejä on teksti');
  A.deepStrictEqual(Object.keys(KK.FVAL).sort(),['haku','jana','kayra','lasku','liike','monihaara','muutos','pvmosa','satu','tee','valitse','vert','ktulos'].sort());
})();

// --- Laskenta: kartoituksen S1-taulukko ---
(function(){var P=KK.newProject('l');var al=nm(P,LB(P,'arvo',{v:'1234,5678'}),'Alku'),pv=nm(P,LB(P,'arvo',{v:'24.12.2026'}),'Pv');
  var la=LB(P,'lasku',{op:'add',a:{r:al.id},b:'1'});A.strictEqual(E(P).val(la.id),1235.5678,'valikon viite');
  la.a='{#'+al.id+'}';A.strictEqual(E(P).val(la.id),1235.5678,'vanha kirjoitettu yksi viite on arvo, ei pyöristetty teksti');
  la.a=KK.arvoKentta(P,'@alku + 5');la.b='1';A.strictEqual(E(P).val(la.id),1240.5678,'@alku + 5 lasketaan');
  la.a=KK.arvoKentta(P,'@pv + 5');la.b='0';var d=E(P).val(la.id);A.ok(KK.isD(d),'päivämäärä + luku');A.strictEqual(KK.fmt(d,'pp.kk.vvvv'),'29.12.2026');
  la.a=KK.arvoKentta(P,'jos (@alku > 1000) 1 muuten 2');la.b='1';A.strictEqual(E(P).val(la.id),2,'jos kentässä');
  la.a={f:''};la.b='3';A.strictEqual(E(P).has(la.id,'a'),false,'tyhjä kaava on tyhjä');
  // VALITSE, Satunnaisluvun väli ja Ketjun tulos lukevat saman kentän
  var va=LB(P,'valitse',{a:KK.arvoKentta(P,'@alku * 2'),b:'ei'});var ok=LB(P,'arvo',{v:'kyllä'});KK.addLink(P,N(P,ok).id,'v',N(P,va).id,'c');
  A.strictEqual(E(P).val(va.id),2469.1356);
  var sa=LB(P,'satu',{min:KK.arvoKentta(P,'2 + 1'),max:KK.arvoKentta(P,'3')});KK.repair(P);
  A.strictEqual(E(P).has(sa.id,'min'),true);A.strictEqual(E(P).inp(sa.id,'min'),3);
})();

// --- Kunnostus ja tallennus: vanha muoto aukeaa, mallipohja kaavaksi vain kun se on laskua ---
(function(){var P=KK.newProject('r');var al=nm(P,LB(P,'arvo',{v:'10'}),'Alku'),bb=nm(P,LB(P,'arvo',{v:'2'}),'Bee');
  var l1=LB(P,'lasku',{op:'add',a:'{#'+al.id+'} + 5',b:'0'}),l2=LB(P,'tee',{do:'aseta',o:al.id,v:'Pisteet: {#'+al.id+'}'}),l3=LB(P,'lasku',{op:'add',a:'{#'+al.id+'}',b:'1'}),
      l4=LB(P,'lasku',{op:'add',a:'({#'+al.id+'} - {#'+bb.id+'}) * 2',b:'0'}),l5=LB(P,'lasku',{op:'add',a:{r:bb.id},b:'Valmis'}),tx=LB(P,'teksti',{tx:'{#'+al.id+'} + 5'});
  KK.repair(P);
  A.deepStrictEqual(l1.a,{f:'{#'+al.id+'} + 5'},'@alku + 5 kaavaksi');A.strictEqual(E(P).val(l1.id),15);
  A.strictEqual(l2.v,'Pisteet: {#'+al.id+'}','teksti viitteineen pysyy tekstinä (kaksoispiste ei ole jako)');
  A.strictEqual(l3.a,'{#'+al.id+'}','yksi viite pysyy ennallaan');A.strictEqual(E(P).val(l3.id),11);
  A.deepStrictEqual(l4.a,{f:'({#'+al.id+'} - {#'+bb.id+'}) * 2'});A.strictEqual(E(P).val(l4.id),16);
  A.deepStrictEqual(l5.a,{r:bb.id});A.strictEqual(l5.b,'Valmis');A.strictEqual(tx.tx,'{#'+al.id+'} + 5','muut kuin kenttäparit ennallaan');
  var s1=JSON.stringify(P.b);KK.repair(P);A.strictEqual(JSON.stringify(P.b),s1,'toinen kunnostus ei muuta');
  var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.deepStrictEqual(J.b[l1.id].a,l1.a);A.strictEqual(E(J).val(l4.id),16,'JSON-kierros');
  // Jana: kaava ei palaudu oletukseen
  var ja=LB(P,'jana',{a:{f:'{#'+bb.id+'} * 3'},b:'100'});KK.repair(P);A.deepStrictEqual(ja.a,{f:'{#'+bb.id+'} * 3'});
})();

// --- Liike: nopeus kaavasta joka kuvassa ---
(function(){var P=KK.newProject('m');var vw=P.views[0].id;var h=KK.addBlock(P,'muoto',{v:vw});h.x=0;h.y=0;h.w=20;h.h=20;
  var sp=nm(P,LB(P,'arvo',{v:'50'}),'Vauhti');var li=LB(P,'liike',{o:h.id});li.vx=KK.arvoKentta(P,'@vauhti * 2');li.vy='0';KK.repair(P);
  for(var i=0;i<60;i++){T+=1000/60;KK.frame(P,1/60,C);}
  var x=E(P).omiNum(h.id,'x',0);A.ok(Math.abs(x-100)<3,'100 px/s sekunnissa: '+x);})();

// --- Yhteydet, poisto, uudelleenkohdistus, kopiointi, kuvaus ja Miksi? ---
(function(){var P=KK.newProject('y');var al=nm(P,LB(P,'arvo',{v:'4'}),'Alku'),uu=nm(P,LB(P,'arvo',{v:'9'}),'Uusi'),me=nm(P,LB(P,'muisti',{v:'0'}),'Pisteet');
  var la=nm(P,LB(P,'lasku',{op:'add',a:KK.arvoKentta(P,'@alku + 5'),b:'0'}),'Summa');
  var d=KK.deps(P);A.ok((d.uses[la.id]||[]).some(function(u){return u.id===al.id&&u.how==='arvo';}),'Yhteydet: kaavan viite');
  A.ok(KK.refsTo(P,[al.id]).some(function(r){return r.id===la.id;}),'poisto näyttää vaikutuksen');
  var te=LB(P,'tee',{do:'aseta',o:me.id,v:KK.arvoKentta(P,'@alku * 2')});A.strictEqual(KK.descAct(P,te.id),'Pisteet = alku * 2');
  var w=KK.why(P,E(P),la.id,3,{});A.ok(JSON.stringify(w).indexOf('Alku')>=0,'Miksi? näyttää kaavan viitteen');
  KK.retarget(P,al.id,uu.id);A.deepStrictEqual(la.a,{f:'{#'+uu.id+'} + 5'},'uudelleenkohdistus');A.strictEqual(E(P).val(la.id),14);
  var clip=KK.copyNodes(P,[N(P,la).id,N(P,uu).id]);var ids=KK.pasteNodes(P,clip,300,0);var nb=ids.map(function(i){return P.b[KK.nodeOf(P,i).p];});
  var nl=nb.filter(function(b){return b.k==='lasku';})[0],nu=nb.filter(function(b){return b.k==='arvo';})[0];
  A.deepStrictEqual(nl.a,{f:'{#'+nu.id+'} + 5'},'kopio osoittaa kopioituun');A.notStrictEqual(nl.a,la.a,'ei jaettu olio');
  var c2=KK.copyNodes(P,[N(P,la).id]);var Q=KK.newProject('toinen');var i2=KK.pasteNodes(Q,c2,0,0);var ql=Q.b[KK.nodeOf(Q,i2[0]).p];
  A.ok(KK.isFx(ql.a)&&ql.a.f.indexOf('{#'+uu.id)<0,'toiseen projektiin vieras viite katkeaa: '+JSON.stringify(ql.a));
  KK.removeBlock(P,uu.id);KK.repair(P);A.ok(KK.isErr(E(P).val(la.id)),'poistettu viite on virhe');
})();
console.log('logiikka_101_arvokentta ok');
