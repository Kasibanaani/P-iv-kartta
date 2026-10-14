// Versio 6.4: toimintopalikat ketjussa. Aseta arvo (luku, teksti, päivämäärä, toisen palikan arvo, {Nimi}, nuolesta) ja
// Aseta tila (on valittu / ei ole valittu) ketjun alussa ja välissä, VAIN YKSI -ikkunan valinta poistaa muut, ajastimen jälkeen,
// kuvaukset selkokielellä, väärä kohde ei tee mitään, ja Aseta tila toimii myös tavallisena toimintona ketjun ulkopuolella.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
var P=KK.newProject('aseta');var k=KK.addBlock(P,'ketju'),w=KK.addNode(P,k.id,0,0);
var lu=KK.addBlock(P,'luku',{nm:'Pisteet',start:0}),tx=KK.addBlock(P,'teksti',{nm:'Viesti'}),pv=KK.addBlock(P,'pvm',{nm:'Päivä'}),
    ru=KK.addBlock(P,'ruutu',{nm:'Tehty'}),ky=KK.addBlock(P,'kytkin',{nm:'Valo'}),np=KK.addBlock(P,'nappi',{nm:'Pohja'}),mu=KK.addBlock(P,'muisti',{nm:'Muisti'}),sl=KK.addBlock(P,'saadin',{nm:'Taso',start:4});
var y=0;function st(props){var b=KK.addBlock(P,'tee',props);var n=KK.addNode(P,b.id,0,(y+=60),w.id);return n;}
var s1=st({do:'tila',o:ru.id,ti:'on'}),s2=st({do:'tila',o:ky.id,ti:'ei'}),s3=st({do:'aseta',o:lu.id,v:'7'}),s4=st({do:'aseta',o:tx.id,v:'Pisteet: {#'+lu.id+'}'}),
    s5=st({do:'aseta',o:pv.id,v:'24.12.2026'}),s6=st({do:'aseta',o:mu.id,v:{r:sl.id}}),s7=st({do:'tila',o:np.id});
[s1,s2,s3,s4,s5,s6].forEach(function(n,i,arr){KK.addLink(P,n.id,'e',[s2,s3,s4,s5,s6,s7][i].id,'e');});
P.st[ky.id]=true;KK.addNode(P,mu.id,-300,0);
A.strictEqual(P.b[s7.p].ti,undefined);KK.repair(P);A.strictEqual(P.b[s7.p].ti,'on','tila oletuksena on valittu');
A.strictEqual(KK.descAct(P,s1.p),'Tehty: on valittu');A.strictEqual(KK.descAct(P,s2.p),'Valo: ei ole valittu');A.strictEqual(KK.descAct(P,s3.p),'Pisteet = 7');
A.strictEqual(KK.baseName('tee',{do:'tila'}),'Aseta tila');
KK.chainStart(P,k.id,C);var E=KK.Ev(P,C);
A.strictEqual(E.val(ru.id),true,'aseta tila: on valittu');A.strictEqual(E.val(ky.id),false,'aseta tila: ei ole valittu');
A.strictEqual(E.val(lu.id),7);A.strictEqual(E.val(tx.id),'Pisteet: 7','{Nimi} saa jo asetetun arvon');
A.deepStrictEqual(E.val(pv.id),{d:'2026-12-24'});A.strictEqual(E.val(mu.id),4,'toisen palikan arvo');A.strictEqual(E.val(np.id),true);
// ketjun alussa asetetaan, ajastimen jälkeen asetetaan uudestaan
var P2=KK.newProject('alku');var k2=KK.addBlock(P2,'ketju'),w2=KK.addNode(P2,k2.id,0,0);var r2=KK.addBlock(P2,'ruutu'),l2=KK.addBlock(P2,'luku');
var a1=KK.addBlock(P2,'tee',{do:'tila',o:r2.id,ti:'on'}),a2=KK.addBlock(P2,'tee',{do:'aseta',o:l2.id,v:'1'}),t=KK.addBlock(P2,'ajastin',{kesto:5}),a3=KK.addBlock(P2,'tee',{do:'tila',o:r2.id,ti:'ei'}),a4=KK.addBlock(P2,'tee',{do:'aseta',o:l2.id,v:'2'});
var ns=[a1,a2,t,a3,a4].map(function(b,i){return KK.addNode(P2,b.id,0,i*60,w2.id);});for(var i=0;i<4;i++)KK.addLink(P2,ns[i].id,'e',ns[i+1].id,'e');
KK.chainStart(P2,k2.id,C);A.strictEqual(KK.Ev(P2,C).val(r2.id),true);A.strictEqual(KK.Ev(P2,C).val(l2.id),1);
NOW+=5000;KK.chainPoll(P2,C);A.strictEqual(KK.Ev(P2,C).val(r2.id),false);A.strictEqual(KK.Ev(P2,C).val(l2.id),2);
// VAIN YKSI, jossa valinta poistaa muut: Aseta tila noudattaa sitä
var P3=KK.newProject('yksi');var b1=KK.addBlock(P3,'nappi'),b2=KK.addBlock(P3,'nappi');var iw=KK.addBlock(P3,'ikkuna',{m:'one',pakota:true}),iwn=KK.addNode(P3,iw.id,0,0);
KK.addNode(P3,b1.id,10,40,iwn.id);KK.addNode(P3,b2.id,10,90,iwn.id);P3.st[b1.id]=true;
var k3=KK.addBlock(P3,'ketju'),w3=KK.addNode(P3,k3.id,400,0);var tt=KK.addBlock(P3,'tee',{do:'tila',o:b2.id,ti:'on'});KK.addNode(P3,tt.id,410,40,w3.id);
KK.chainStart(P3,k3.id,C);A.strictEqual(P3.st[b2.id],true);A.strictEqual(P3.st[b1.id],false,'toinen poistui');
// väärä kohde: Aseta tila luvulle ei tee mitään eikä riko ketjua
var P4=KK.newProject('vaara');var k4=KK.addBlock(P4,'ketju'),w4=KK.addNode(P4,k4.id,0,0);var lk=KK.addBlock(P4,'luku',{start:3});var v1=KK.addBlock(P4,'tee',{do:'tila',o:lk.id}),v2=KK.addBlock(P4,'tee',{do:'aseta',o:'',v:'1'});
var vn1=KK.addNode(P4,v1.id,0,40,w4.id),vn2=KK.addNode(P4,v2.id,0,100,w4.id);KK.addLink(P4,vn1.id,'e',vn2.id,'e');
KK.chainStart(P4,k4.id,C);A.strictEqual(KK.Ev(P4,C).val(lk.id),3);A.strictEqual(P4.st[k4.id].run,false);A.strictEqual(P4.st[k4.id].err,'');
// Aseta tila tavallisena toimintona painikkeesta (ketjun ulkopuolella)
var P5=KK.newProject('ulko');var pb=KK.addBlock(P5,'nappi',{beh:'kerta'}),rr=KK.addBlock(P5,'ruutu');var ta=KK.addBlock(P5,'tee',{do:'tila',o:rr.id,ti:'on'});
KK.addLink(P5,KK.addNode(P5,pb.id,0,0).id,'e',KK.addNode(P5,ta.id,200,0).id,'e');KK.press(P5,pb.id,C);A.strictEqual(P5.st[rr.id],true);
// vanha projekti: tuntematon toiminto säilyy koskemattomana
var P6=KK.newProject('vanha');var od=KK.addBlock(P6,'tee',{do:'aseta'});od.do='outo';KK.addNode(P6,od.id,0,0);KK.repair(P6);A.strictEqual(od.do,'outo');
console.log('logiikka_13_aseta ok');
