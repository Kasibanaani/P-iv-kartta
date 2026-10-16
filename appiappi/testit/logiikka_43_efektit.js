// Appi-appi 9: efektit myös ketjun ulkopuolella (tehdään heti, sitten lähtee heti, pois käytöstä ei tehdä), efektin
// asettama teksti (fxt) ja kuva (fxk) asetettuina arvoina: nuoli voittaa, Palauta poistaa, korjaus ja tallennus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000,FXS=[];var C={now:function(){return new Date(T);},toast:function(){},nav:function(){},fx:function(q){FXS.push(q.k+':'+q.id);return 0.5;}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g);}
function E(P){return KK.Ev(P,C);}
var P=KK.newProject('fx');var vw=P.views[0].id;
var tx=KK.addBlock(P,'nayta',{v:vw,tx:'Alku'}),nap=KK.addBlock(P,'nappi',{v:vw,beh:'kerta'});
// --- 1. Animaatio ketjun ulkopuolella: painike → Animaatio → Lisää ---
var an=KK.addBlock(P,'anim',{o:tx.id,laji:'ravistus'}),ann=N(P,an);KK.addLink(P,N(P,nap).id,'e',ann.id,'e');
var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var li=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,ann.id,'e',N(P,li).id,'e');KK.repair(P);
KK.press(P,nap.id,C);A.deepStrictEqual(FXS,['anim:'+an.id],'efekti tehtiin');A.strictEqual(E(P).val(m.id),1,'sitten heti');
an.off=true;KK.press(P,nap.id,C);A.strictEqual(FXS.length,1,'pois käytöstä ei tehdä');A.strictEqual(E(P).val(m.id),1);an.off=false;
// Ilman käyttöliittymää (ctx.fx puuttuu) sitten lähtee silti
var C2={now:C.now,toast:function(){},nav:function(){}};KK.press(P,nap.id,C2);A.strictEqual(E(P).val(m.id),2);
// Kaikki neljä efektiä toimivat ketjun ulkopuolella
['ilmesty','kuva','nvaihto'].forEach(function(k){FXS=[];var f=KK.addBlock(P,k,{o:tx.id});var fn=N(P,f);var n2=KK.addBlock(P,'nappi',{v:vw});KK.addLink(P,N(P,n2).id,'e',fn.id,'e');KK.repair(P);KK.press(P,n2.id,C);A.deepStrictEqual(FXS,[k+':'+f.id],k);});
// --- 2. Ketjussa efekti odottaa edelleen keston (ennallaan) ---
var ke=KK.addBlock(P,'ketju'),kw=KK.addNode(P,ke.id,0,0);var f2=KK.addBlock(P,'anim',{o:tx.id}),f2n=KK.addNode(P,f2.id,0,40,kw.id);var l2=KK.addBlock(P,'tee',{do:'lisaa',o:m.id}),l2n=KK.addNode(P,l2.id,0,100,kw.id);KK.addLink(P,f2n.id,'e',l2n.id,'e');KK.repair(P);
var v0=E(P).val(m.id);KK.chainStart(P,ke.id,C,null,0);A.strictEqual(E(P).val(m.id),v0,'odottaa');T+=600;KK.chainPoll(P,C);A.strictEqual(E(P).val(m.id),v0+1,'jatkui keston jälkeen');
// --- 3. Efektin asettama teksti: asetettu arvo, {viite} toimii, nuoli voittaa, Palauta poistaa ---
var lu=KK.addBlock(P,'luku',{v:vw,start:5});KK.setVt(P,lu.id,'pisteet');
P.st['fxt:'+tx.id]=KK.toIds?KK.toIds(P,'Pisteet: {pisteet}'):'Pisteet: {#'+lu.id+'}';A.strictEqual(E(P).text(tx.id),'Pisteet: 5');A.strictEqual(E(P).val(tx.id),'Pisteet: 5','näyttötekstin arvo');
var tp=KK.addBlock(P,'tee',{do:'palauta',o:tx.id});N(P,tp);KK.runAction(P,tp.id,C,0);A.strictEqual(E(P).text(tx.id),'Alku','Palauta → perusteksti');A.strictEqual(P.st['fxt:'+tx.id],undefined);
P.st['fxt:'+tx.id]='Efekti';var ar=KK.addBlock(P,'arvo',{v:'Nuoli'});KK.addLink(P,N(P,ar).id,'v',N(P,tx).id,'tx');A.strictEqual(E(P).text(tx.id),'Nuoli','nuoli voittaa');
// --- 4. Efektin asettama kuva (fxk): pääkuva vaihtuu, nuoli voittaa, Palauta poistaa ---
var ku=KK.addBlock(P,'pkuva',{v:vw,src:'<svg>A</svg>'});P.st['fxk:'+ku.id]='<svg>B</svg>';A.strictEqual(KK.kuvaKuvat(P,E(P),ku)[0],'<svg>B</svg>');
var tp2=KK.addBlock(P,'tee',{do:'palauta',o:ku.id});N(P,tp2);KK.runAction(P,tp2.id,C,0);A.strictEqual(KK.kuvaKuvat(P,E(P),ku)[0],'<svg>A</svg>');
// --- 5. Korjaus ja tallennus ---
P.st['fxk:'+ku.id]='<svg>C</svg>';P.st['fxt:bX']='x';P.st['fxk:'+tx.id]='väärä laji';P.st['fxt:'+lu.id]=5;
var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.st['fxk:'+ku.id],'<svg>C</svg>','säilyy');A.strictEqual(P2.st['fxt:bX'],undefined,'poistetun palikan');
A.strictEqual(P2.st['fxk:'+tx.id],undefined,'kuva vain Kuva-palikalle');A.strictEqual(P2.st['fxt:'+lu.id],undefined,'vain teksti');
console.log('logiikka_43_efektit ok');
