// Jonon 14b (F38 kohta 5, suunnitelma 22): napautettava näkymäpalikka, moottorin osuus. Teksti, Muoto, Kuva, Monitori ja
// Ilmoitus: valinnainen b.nap (napautettava) ja b.npa (painuu). Tapahtumat napautettu (nap) ja pitkä painallus (pitka), tiedoissa
// tapahtuma.x ja tapahtuma.y; ominaisuus napautettava ohjattava (Aseta/Palauta). Joukon yhteinen jäsen napautettu, myös
// Painikkeelle. Vanha projekti ilman kenttiä ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function E(P){return KK.Ev(P,C);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function outs(b){return KK.ports(b).outs.map(function(o){return o.p;});}
function kirjaa(P,b,port,f){var m=KK.addBlock(P,'muisti',{v:''});N(P,m);var k=KK.addBlock(P,'kaava');N(P,k);k.f=KK.kaavaToIds(P,f);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function act(P,props){var t=KK.addBlock(P,'tee',props);N(P,t);KK.runAction(P,t.id,C,0);return t;}

// 1. Oletuksena ei napautettava, ei kohtia; lajit
var P=KK.newProject('nap');
var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tp);
var lt=U(P,'muoto',{laji:'laatikko',tx:'Paina'},100,100,200,60,'Laatikko');
A.ok(!KK.napOn(P,lt,C),'oletus ei napautettava');A.ok(outs(lt).indexOf('nap')<0&&outs(lt).indexOf('pitka')<0,'ei kohtia ilman valintaa');
A.strictEqual(KK.napautus(P,lt.id,C,5,5),false,'ei napautettava: ei tapahtumaa');
['nayta','muoto','pkuva','mittari','ilmo'].forEach(function(k){var b=U(P,k,{},-900,-900,50,50);b.nap=true;A.ok(KK.napOn(P,b,C),k+' napautettava');
  A.ok(outs(b).indexOf('nap')>=0&&outs(b).indexOf('pitka')>=0,k+' kohdat');var e=KK.omFind(b,'napautettava');A.ok(e&&e.o===1&&e.f==='nap'&&e.t==='kylla',k+' ominaisuus');});
['nappi','teksti','luku','merkki','alue','toistin','kaava'].forEach(function(k){var b=k==='kaava'?KK.addBlock(P,'kaava',{}):U(P,k,{},-900,-900,50,50);b.nap=true;
  A.ok(!KK.napOn(P,b,C),k+' ei napautettava-lajia');A.ok(!KK.omFind(b,'napautettava'),k+' ei ominaisuutta');A.ok(outs(b).indexOf('nap')<0||k==='alue',k+' ei kohtaa');});

// 2. Napautus ja pitkä painallus, tapahtuma.x ja .y
lt.nap=true;KK.repair(P);
var cN=laskuri(P,lt,'nap'),cL=laskuri(P,lt,'pitka'),mx=kirjaa(P,lt,'nap','tapahtuma.x'),my=kirjaa(P,lt,'nap','tapahtuma.y'),ml=kirjaa(P,lt,'pitka','tapahtuma.x');KK.repair(P);
A.ok(KK.napautus(P,lt.id,C,12.6,40.2),'napautus');
A.strictEqual(E(P).val(cN.id),1);A.strictEqual(E(P).val(cL.id),0);A.strictEqual(E(P).val(mx.id),13,'tapahtuma.x');A.strictEqual(E(P).val(my.id),40,'tapahtuma.y');
KK.napautus(P,lt.id,C,150,20,true);A.strictEqual(E(P).val(cL.id),1,'pitkä painallus');A.strictEqual(E(P).val(cN.id),1,'pitkä ei ole napautus');A.strictEqual(E(P).val(ml.id),150);
A.strictEqual(E(P).prop(lt.id,'napautettava'),true,'kaavassa laatikko.napautettava');

// 3. Ei käytössä (off) ei napauteta
lt.off=true;A.strictEqual(KK.napautus(P,lt.id,C,1,1),false,'pois käytöstä');lt.off=false;

// 4. Ohjattava: Aseta napautettava ei → ei tapahtumaa, Palauta → taas
act(P,{do:'aseta',o:lt.id,om:'napautettava',v:'ei'});A.ok(!KK.napOn(P,lt,C),'Aseta ei');A.strictEqual(KK.napautus(P,lt.id,C,1,1),false);A.strictEqual(E(P).val(cN.id),1);
act(P,{do:'palauta',o:lt.id,om:'napautettava'});A.ok(KK.napOn(P,lt,C),'Palauta');KK.napautus(P,lt.id,C,1,1);A.strictEqual(E(P).val(cN.id),2);
// Aseta kyllä tekee napautettavaksi palikan, jonka perusarvo on ei (nuolia ei vielä ole, mutta Joukko kuulee)
var t2=U(P,'nayta',{tx:'Ohje'},100,300,100,30,'Ohje');act(P,{do:'aseta',o:t2.id,om:'napautettava',v:'kyllä'});A.ok(KK.napOn(P,t2,C),'Aseta kyllä');

// 5. Tallennus: kentät kulkevat, vanha ilman kenttiä ennallaan
lt.npa=true;var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.b[lt.id].nap,true);A.strictEqual(P2.b[lt.id].npa,true);
var P3=KK.newProject('vanha'),vb=U(P3,'muoto',{laji:'laatikko'},0,0,100,40,'Vanha');KK.repair(P3);A.strictEqual(vb.nap,undefined);A.strictEqual(vb.npa,undefined);A.ok(!KK.napOn(P3,vb,C));
A.strictEqual(KK.VER,12,'tallennusversio ennallaan');

// 6. Joukko: jäsen napautettu yhteisenä tapahtumana, tapahtuma.jäsen; myös Painike lähettää sen
var Q=KK.newProject('jnap'),J=KK.jkLuo(Q,'kortit'),tq=KK.addBlock(Q,'tapaht',{nm:'Tapahtuma'});N(Q,tq);
var q1=U(Q,'muoto',{laji:'laatikko'},0,0,80,80,'Kortti 1'),q2=U(Q,'muoto',{laji:'laatikko'},100,0,80,80,'Kortti 2'),qb=U(Q,'nappi',{beh:'kerta'},0,200,80,40,'Nappi');
[q1,q2,qb].forEach(function(b){b.jkt=[J];N(Q,b);});q1.nap=true;q2.nap=true;
var pj=KK.addBlock(Q,'pjoukko',{jj:J});N(Q,pj);KK.repair(Q);
A.ok(outs(pj).indexOf('j_nap')>=0&&outs(pj).indexOf('j_pitka')>=0,'Joukon yhteiset: jäsen napautettu ja pitkä painallus');
var jc=laskuri(Q,pj,'j_nap'),jm=kirjaa(Q,pj,'j_nap','tapahtuma.jäsen');KK.repair(Q);
KK.napautus(Q,q2.id,C,3,3);A.strictEqual(E(Q).val(jc.id),1,'jäsenen napautus Joukosta');A.strictEqual(E(Q).val(jm.id),'Kortti 2','tapahtuma.jäsen');
KK.press(Q,qb.id,C);A.strictEqual(E(Q).val(jc.id),2,'Painikkeen painallus on myös jäsen napautettu');A.strictEqual(E(Q).val(jm.id),'Nappi');
console.log('ok logiikka napautus');
