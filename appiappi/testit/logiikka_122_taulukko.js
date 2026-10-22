// Jono 42g (suunnitelma 31 V4, D2): Taulukko-näyttö = Lista sarakkeilla. Esiasetus (vanha Lista) ennallaan, sarakkeiden avaus,
// omien rivien solut (luku, kello, valinta, pvm, rasti), Tietotaulukko lähteenä (lukee ja kirjoittaa, kellonaika-laji), ryhmä
// lähteenä (jäsenen ominaisuudet sarakkeina), painike-sarake (tapahtuma painettu, uusi/rivi/jäsen), rivi<N>.<sarake>, repair.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,22,12);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b,x,y){return KK.addNode(P,b.id,x||0,y||Math.random()*900);}
function lv(P){var e=E(P);return {jk:e.jkJasenet,val:e.val,omi:e.omi,prop:e.prop,df:'pp.kk.vvvv'};}
// 1. Esiasetus
(function(){var P=KK.newProject('a'),li=KK.addBlock(P,'lista',{v:P.views[0].id,rivit:'Maito\nLeipä',pvmsar:true});KK.repair(P);
  A.ok(!KK.lsTaulu(P,li),'vanha Lista ei ole taulukko');A.deepStrictEqual(KK.lsSar(P,li).map(function(c){return c.laji+':'+c.lk;}),['rasti:c','teksti:tx','pvm:d']);
  li.rasti=false;A.deepStrictEqual(KK.lsSar(P,li).map(function(c){return c.laji;}),['teksti','pvm']);li.rasti=true;
  KK.lsAseta(P,li.id,'r1','_c',true,C);KK.tick(P,C);A.strictEqual(E(P).val(li.id),1,'esiasetuksen rasti');
  // sarakkeiden avaus säilyttää rivit ja rastit
  var c=KK.lsAddSar(P,li,'luku','Hinta');KK.repair(P);A.ok(KK.lsTaulu(P,li));A.deepStrictEqual(li.sar.map(function(x){return x.laji+':'+x.lk;}),['rasti:c','teksti:tx','pvm:d','luku:']);
  KK.tick(P,C);A.strictEqual(E(P).val(li.id),1,'rasti säilyy');A.strictEqual(E(P).val(li.id,'n'),2);
  A.strictEqual(KK.lsAseta(P,li.id,'r2',c.id,'2,50',C),'');A.strictEqual(E(P).prop(li.id,'rivi2.hinta'),2.5,'luku solussa, rivi2.hinta');
  A.ok(/ei ole luku/.test(KK.lsAseta(P,li.id,'r2',c.id,'paljon',C)),'väärä laji virheenä');
  var k=KK.lsAddSar(P,li,'kello','Alkaa');KK.lsAseta(P,li.id,'r1',k.id,'14.30',C);A.strictEqual(E(P).prop(li.id,'rivi1.alkaa'),14.5*3600);
  var v=KK.lsAddSar(P,li,'valinta','Koko');v.val=['pieni','iso'];KK.repair(P);A.strictEqual(KK.lsAseta(P,li.id,'r1',v.id,'ISO',C),'');A.strictEqual(E(P).prop(li.id,'rivi1.koko'),'iso');A.ok(KK.lsAseta(P,li.id,'r1',v.id,'jättiläinen',C));
  A.strictEqual(KK.lsAseta(P,li.id,'r1',li.sar[2].id,'24.10.',C),'');A.strictEqual(KK.listRows(P,li.id)[0].d,'2026-10-24','pvm-sarake kirjoittaa d:hen');
  // rasti pois sarakkeista → ei rastitettuja
  var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.b[li.id].sar.length,6);A.strictEqual(KK.listRows(P2,li.id)[1].s[c.id],2.5,'solu tallessa');
  li.sar=li.sar.filter(function(x){return x.laji!=='rasti';});KK.repair(P);KK.tick(P,C);A.strictEqual(E(P).val(li.id),0);
  // vanha rivien kopio (Lisää rivi -toiminto) säilyttää solut
  var t=KK.addBlock(P,'tee',{do:'rivi',o:li.id,tx:'Juusto'});N(P,t);KK.repair(P);KK.runAction(P,t.id,C);var rs=KK.listRows(P,li.id);A.strictEqual(rs.length,3);A.strictEqual(rs[1].s[c.id],2.5,'solu säilyy rivin lisäyksessä');
  // repair siivoaa
  var B=JSON.parse(JSON.stringify(P));B.b[li.id].sar.push({id:'zz',laji:'teksti'},{id:'c99',laji:'outo'});B.b[li.id].pvv='kyllä';B.b[li.id].tl='b999';B.st[li.id].rows[0].s={x:{}};KK.repair(B);
  A.strictEqual(B.b[li.id].sar.length,5);A.ok(!('pvv' in B.b[li.id])&&!('tl' in B.b[li.id]));})();
// 2. Tietotaulukko lähteenä, kellonaika-laji
(function(){var P=KK.newProject('b'),t=KK.addBlock(P,'taulu',{});N(P,t);KK.setName(P,t.id,'Tehtävät');var cn=KK.addCol(t,'Nimi','teksti'),ck=KK.addCol(t,'Klo','kello'),cd=KK.addCol(t,'Tehty','kylla');
  t.rv=[{id:'r1',a:{}},{id:'r2',a:{}}];t.rv[0].a[cn.id]='Soita';t.rv[0].a[ck.id]=9*3600;t.rv[1].a[cn.id]='Kirjoita';KK.repair(P);A.strictEqual(t.rv[0].a[ck.id],32400,'kello säilyy repairissa');
  A.strictEqual(KK.sarNorm(P,ck,'klo 14.15',C.now()),14.25*3600);A.ok(KK.isErr(KK.sarNorm(P,ck,'aamulla',C.now())));
  var li=KK.addBlock(P,'lista',{v:P.views[0].id,tl:t.id});N(P,li);KK.repair(P);KK.tick(P,C);
  A.ok(KK.lsTaulu(P,li));A.deepStrictEqual(KK.lsSar(P,li).map(function(c){return c.laji+':'+c.lk;}),['teksti:'+cn.id,'kello:'+ck.id,'rasti:'+cd.id]);
  A.strictEqual(E(P).val(li.id,'n'),2);A.strictEqual(E(P).prop(li.id,'rivi1.teksti'),'Soita');A.strictEqual(E(P).prop(li.id,'rivi1.klo'),32400);
  A.strictEqual(KK.lsAseta(P,li.id,'r2','t'+cd.id,true,C),'');KK.tick(P,C);A.strictEqual(E(P).val(li.id),1,'rasti kirjoittaa taulukkoon');A.strictEqual(KK.tRow(P,t.id,'r2').a[cd.id],true);
  A.ok(/kellonaika/.test(KK.lsAseta(P,li.id,'r2','t'+ck.id,'joskus',C)));
  P.st={};KK.tick(P,C);A.strictEqual(E(P).val(li.id),0,'Palauta');
  delete P.b[t.id];KK.repair(P);A.ok(!li.tl,'poistettu taulukko → lähde pois');})();
// 3. Ryhmä lähteenä: jäsenen ominaisuudet
(function(){var P=KK.newProject('c');function yl(nm,tx){var b=KK.addBlock(P,'arvo',{yl:1});N(P,b);KK.setName(P,b.id,nm);KK.ylAseta(P,b,tx,'@');KK.ylLinkit(P,b,tx);KK.repair(P);return b;}
  var g=yl('Menot',''),h=yl('Hammas','Hammaslääkäri 24.10. klo 14\n#menot');var J=KK.ylOma(P,g);P.st['jkr:'+J]=[{id:'q1',tx:'Kampaaja 25.10. klo 9'}];
  var li=KK.addBlock(P,'lista',{v:P.views[0].id,ryh:J});N(P,li);KK.repair(P);var c=KK.lsAddSar(P,li,'kello','Klo');KK.repair(P);A.strictEqual(c.lk,'kello');
  var rows=KK.listNyt(P,li.id,lv(P));A.deepStrictEqual(rows.map(function(r){return KK.lsSolu(P,li,r,c,lv(P),C.now());}),[14*3600,9*3600],'jäsen ja rivijäsen');
  A.ok(!KK.lsMuokattavaSolu(P,li,rows[0],c),'ryhmän johdettu sarake on lukusarake');A.ok(KK.lsMuokattavaSolu(P,li,rows[0],li.sar[1]),'teksti muokattava');})();
// 4. Painike-sarake
(function(){var P=KK.newProject('d'),li=KK.addBlock(P,'lista',{v:P.views[0].id,rivit:'Eka\nToka'});var ln=N(P,li);KK.repair(P);var pb=KK.lsAddSar(P,li,'painike','Valitse');KK.repair(P);
  A.ok(KK.ports(li).outs.some(function(o){return o.p==='pain';}),'kohta painettu');
  var m=KK.addBlock(P,'muisti',{v:''});N(P,m);var tp=KK.addBlock(P,'tapaht');N(P,tp);var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:'{#'+tp.id+'.uusi}'});var tn=N(P,t);KK.addLink(P,ln.id,'pain',tn.id,'e');KK.repair(P);
  KK.lsPainike(P,li.id,'r2',C);KK.tick(P,C);A.strictEqual(E(P).val(m.id),'Toka','tapahtuma.uusi = rivin teksti');
  li.sar=li.sar.filter(function(c){return c.laji!=='painike';});KK.repair(P);A.ok(!KK.ports(li).outs.some(function(o){return o.p==='pain';}));})();
console.log('ok');
