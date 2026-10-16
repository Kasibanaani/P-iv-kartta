// Versio 5.1: Kaavan tulos -palikka. Kaava ”uni = a + b” antaa arvon tulokselle, jonka viite on uni.
// == vertaa aina, tavallinen palikka vasemmalla = vertailu, ensin tehty kaava voittaa, kehä, poisto, Yhteydet ja Miksi?.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,14,9,30);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g||'');}
function V(P,b,p){return KK.Ev(P,C).val(b.id,p);}
function K(P,s){var k=KK.addBlock(P,'kaava');N(P,k);k.f=KK.kaavaToIds(P,s);KK.repair(P);return k;}

var P=KK.newProject('tulos');
var a=KK.addBlock(P,'luku',{nm:'A',start:3}),b=KK.addBlock(P,'luku',{nm:'B',start:7});
var uni=KK.addBlock(P,'tulos',{nm:'Uni',vt:'uni'});N(P,uni);
A.strictEqual(uni.vt,'uni');A.strictEqual(V(P,uni),null,'ilman kaavaa tyhjä');
A.ok(/Mikään kaava ei vielä anna arvoa/.test(KK.why(P,KK.Ev(P,C),uni.id,2).txt));
var k=K(P,'uni = a + b');A.strictEqual(k.f,'{#'+uni.id+'} = {#'+a.id+'} + {#'+b.id+'}');
A.strictEqual(V(P,uni),10,'tulos saa arvon');A.strictEqual(V(P,k),10,'kaavan oma tulos on sama arvo');
KK.userSet(P,a.id,5,C);A.strictEqual(V(P,uni),12,'päivittyy');
var k2=K(P,'uni = 3 + 7');
// toinen kaava samaan tulokseen: ensin tehty voittaa, toinen näyttää virheen
A.strictEqual(V(P,uni),12,'ensin tehty voittaa');A.ok(KK.isErr(V(P,k2))&&/saa arvonsa jo kaavasta ”Kaava”/.test(V(P,k2).err),V(P,k2).err);
A.ok(/ensin tehty voittaa/.test(KK.why(P,KK.Ev(P,C),uni.id,2).txt));
KK.removeBlock(P,k.id);A.strictEqual(V(P,uni),10,'kun ensimmäinen poistuu, toinen antaa arvon');
// == vertaa aina
var c1=K(P,'uni == 10');A.strictEqual(V(P,c1),true);A.strictEqual(V(P,K(P,'uni == 3')),false);
A.strictEqual(V(P,K(P,'10 = uni')),true,'tulos oikealla: vertailu');
// tulos toisen kaavan osana
var pis=KK.addBlock(P,'tulos',{nm:'Pisteet'});N(P,pis);A.strictEqual(pis.vt,'pisteet');
K(P,'pisteet = uni * 2');A.strictEqual(V(P,pis),20);
var ok=KK.addBlock(P,'tulos',{nm:'Ok'});N(P,ok);K(P,'ok = pisteet > 15');A.strictEqual(V(P,ok),true,'tulokseen voi tulla vertailu');
// kehä: kaava ei voi käyttää omaa tulostaan
var ke=KK.addBlock(P,'tulos',{nm:'Kehä'});N(P,ke);var kk=K(P,'kehä = kehä + 1');A.ok(KK.isErr(V(P,ke))&&/kehä/.test(V(P,ke).err));
// tavallinen palikka vasemmalla: = vertaa kuten ennen
var s=KK.addBlock(P,'saadin',{nm:'Säädin',start:5});var kv=K(P,'säädin = 5');A.strictEqual(V(P,kv),true,'säädin = 5 on vertailu');A.strictEqual(KK.Ev(P,C).targetOf(kv.id),null);
// puuttuva tulos: kaava tietää nimen, jotta tuloksen voi luoda
var km=K(P,'unet = a + 1');var pk=KK.parseKaava(km.f);A.strictEqual(pk.asgMiss,'unet');A.ok(/puuttuu: unet/.test(V(P,km).err));
var un=KK.addBlock(P,'tulos',{nm:'Unet',vt:'unet'});N(P,un);KK.repair(P);A.strictEqual(V(P,un),6,'luotu tulos löytyy ja saa arvon');
// viite on varattu: toinen palikka ei voi saada samaa viitettä
var x=KK.addBlock(P,'luku',{nm:'uni'});A.notStrictEqual(x.vt,'uni');A.ok(/käytössä palikalla ”Uni”/.test(KK.setVt(P,x.id,'uni')));
// lainausmerkeissä teksti, ei viittaus
var tx=K(P,'"uni"');A.strictEqual(V(P,tx),'uni');
var ttu=KK.addBlock(P,'tulos',{nm:'Viesti'});N(P,ttu);K(P,'viesti = "Unta " + uni + " h"');A.strictEqual(V(P,ttu),'Unta 10 h');
// Yhteydet: tulos käyttää kaavaa (antaa arvon), kaava käyttää a:ta ja b:tä
var D=KK.deps(P),own=KK.Ev(P,C).ownerOf(uni.id);
A.ok((D.uses[uni.id]||[]).some(function(q){return q.id===own&&q.how==='tulos';}),'tulos ← kaava');
A.ok(!(D.uses[own]||[]).some(function(q){return q.id===uni.id;}),'kaava ei "käytä" tulostaan');
A.ok((D.usedBy[uni.id]||[]).some(function(q){return q.how==='kaava';}),'muut kaavat käyttävät tulosta');
A.ok(/antaa arvon palikalle ”Uni”/.test(KK.why(P,KK.Ev(P,C),own,2).txt));
// tuloksen poisto (Appi-appi 11, D08): kaavoihin jää viittaus poistettuun, uusi tulos valitaan Viitevirheistä
KK.removeBlock(P,pis.id);var pk2=Object.values(P.b).filter(function(q){return q.k==='kaava'&&q.f.indexOf('{#'+pis.id+'}')>=0;});A.strictEqual(pk2.length,2,"molemmat kaavat: pisteet = … ja ok = pisteet > 15");
A.ok(KK.isErr(V(P,ok)),'riippuva tulos näyttää virheen');
var pis2=KK.addBlock(P,'tulos',{nm:'Pisteet'});N(P,pis2);KK.repair(P);A.strictEqual(V(P,pis2),null,'samanniminen ei peri');
pk2.forEach(function(q){KK.relink(P,q.id,pis.id,pis2.id);});A.strictEqual(V(P,pis2),20);A.strictEqual(V(P,ok),true);
// tulos ikkunassa ja näkymäpalikan tekstissä
var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=N(P,w);KK.nodesOfBlock(P,uni.id)[0].g=wn.id;KK.nodesOfBlock(P,pis2.id)[0].g=wn.id;KK.repair(P);A.strictEqual(V(P,w),30);
var te=KK.addBlock(P,'nayta');te.tx=KK.toIds(P,'Unta {uni} h');A.strictEqual(KK.Ev(P,C).text(te.id),'Unta 10 h');
var t2=KK.addBlock(P,'nayta');t2.tx=KK.toIds(P,'{'+x.vt+'} ja {uni}');A.strictEqual(KK.toNames(P,t2.tx),'{'+x.vt+'} ja {Uni}','nimi, joka on toisen viite, näkyy omana viitteenä');
A.strictEqual(KK.toIds(P,KK.toNames(P,t2.tx)),t2.tx,'edestakaisin ennallaan');
console.log('ok tulos');
