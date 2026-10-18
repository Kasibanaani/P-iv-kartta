// Jonon 15b (F36, suunnitelma 20): palikan oma ruudukko, moottorin osuus. Kentät ors/orr/orn ja korjaus, portit ja
// ominaisuudet vain ruudukon kanssa, napautuksen ruutu (myös venytetty, siirretty, kierretty ja peilattu palikka), ruutu
// napautettu -tapahtuma ja sen tiedot, napautettu x/y, ohjattava sarakemäärä, osuttu ruutu törmäsi-tiedoissa, pudotusruutu
// käyttöraahauksessa, ilman ruudukkoa ennallaan, tallennus ja vanha projekti.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function E(P){return KK.Ev(P,C);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function outs(b){return KK.portsBase(b).outs.map(function(o){return o.p;});}
function run(P,s,dt){dt=dt||0.02;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
function kirjaa(P,b,port,f){var m=KK.addBlock(P,'muisti',{v:''});N(P,m);var k=KK.addBlock(P,'kaava');N(P,k);k.f=KK.kaavaToIds(P,f);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function TP(P){var t=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,t);return t;}
function R(o){return o?o.x+','+o.y:'–';}

// --- 0. Lajit, kentät, korjaus ---
A.ok(KK.ORK.muoto&&KK.ORK.pkuva&&KK.ORK.nappi&&KK.ORK.nayta,'näkymäpalikoilla oma ruudukko');
['merkki','alue','toistin','laatat','liike','muisti'].forEach(function(k){A.ok(!KK.ORK[k],k+': ei omaa ruudukkoa');});
var P=KK.newProject('or');TP(P);var kv=U(P,'pkuva',{},100,50,300,400,'Näppäimet');KK.repair(P);
A.ok(!KK.orOn(kv),'oletuksena ei ruudukkoa');['rnap','onx','ony'].forEach(function(p){A.ok(outs(kv).indexOf(p)<0,'ei porttia '+p+' ilman ruudukkoa');});
A.ok(!KK.omFind(kv,'ruudukko.sarakkeet')&&!KK.omFind(kv,'napautettux'),'ei ominaisuuksia ilman ruudukkoa');
A.strictEqual(KK.orRuutu(P,null,kv,10,10,true),null,'ilman ruudukkoa ei ruutua');
kv.ors='3,4';kv.orr='abc';kv.orn='aina';KK.repair(P);A.strictEqual(kv.ors,undefined,'virheellinen rivimäärä poistaa ruudukon');A.strictEqual(kv.orn,undefined);
kv.ors=200;kv.orr=4.4;kv.orn='joskus';KK.repair(P);A.strictEqual(kv.ors,64,'enintään 64');A.strictEqual(kv.orr,4,'kokonaisluku');A.strictEqual(kv.orn,undefined,'tuntematon näkyvyys pois');
var al=U(P,'alue',{},0,0,50,50);al.ors=3;al.orr=3;KK.repair(P);A.strictEqual(al.ors,undefined,'Alueella ei omaa ruudukkoa (sillä on kerroksen ruudukko)');
kv.ors=3;kv.orr=4;kv.orn='aina';KK.repair(P);A.ok(KK.orOn(kv));
['rnap','onx','ony'].forEach(function(p){A.ok(outs(kv).indexOf(p)>=0,'portti '+p);});
['ruudukko.sarakkeet','ruudukko.rivit','napautettux','napautettuy'].forEach(function(n){A.ok(KK.omFind(kv,n),'ominaisuus '+n);});
A.ok(KK.jkTapahtumat('pkuva').some(function(x){return x[0]==='rnap';}),'Joukon jäsentapahtumiin ruutu napautettu');
A.ok(!KK.jkTapahtumat('alue').some(function(x){return x[0]==='rnap';}),'Alueella ei');

// --- 1. Ruutu kohdasta: tasajako, venytys, kierto ja peilaus ---
A.strictEqual(R(KK.orRuutu(P,null,kv,0,0,true)),'1,1','vasen yläruutu');
A.strictEqual(R(KK.orRuutu(P,null,kv,299,399,true)),'3,4','oikea alaruutu');
A.strictEqual(R(KK.orRuutu(P,null,kv,150,150,true)),'2,2','keskeltä');
A.strictEqual(R(KK.orRuutu(P,null,kv,300,400,true)),'3,4','reuna pysyy viimeisessä');
kv.w=600;A.strictEqual(R(KK.orRuutu(P,null,kv,450,10,true)),'3,1','venytetty: ruudut levenevät');kv.w=300;
kv.kulma=180;A.strictEqual(R(KK.orRuutu(P,null,kv,10,10,true)),'3,4','kierretty 180°: vasen yläkulma on oikea alaruutu');
A.strictEqual(R(KK.orRuutu(P,null,kv,10,10,false)),'1,1','kiertämätön (törmäys) ennallaan');
kv.kulma=90;kv.w=400;kv.h=400;A.strictEqual(R(KK.orRuutu(P,null,kv,390,10,true)),'1,1','kierretty 90°: oikea yläkulma on vasen yläruutu');
kv.kulma=0;kv.w=300;kv.h=400;kv.peili=true;A.strictEqual(R(KK.orRuutu(P,null,kv,10,10,true)),'3,1','peilattu: vasen on oikea');delete kv.peili;
kv.kulma=45;kv.w=400;kv.h=400;A.strictEqual(KK.orRuutu(P,null,kv,2,2,true),null,'kierretyn sisällön ulkopuolella ei ruutua');kv.kulma=0;kv.w=300;kv.h=400;

// --- 2. Napautus: tapahtuma, tiedot, napautettu x/y, liikkuva palikka ---
var c=laskuri(P,kv,'rnap'),mx=kirjaa(P,kv,'rnap','tapahtuma.ruutux'),my=kirjaa(P,kv,'rnap','tapahtuma.ruutuy'),mp=kirjaa(P,kv,'rnap','tapahtuma.x');
var vk=KK.addBlock(P,'kaava');N(P,vk);vk.f=KK.kaavaToIds(P,'näppäimet.napautettux * 10 + näppäimet.napautettuy');KK.repair(P);
A.strictEqual(E(P).val(kv.id,'onx'),null,'ennen napautusta tyhjä');
A.ok(KK.orNapautus(P,kv.id,C,250,120));A.strictEqual(E(P).val(c.id),1,'ruutu napautettu');A.strictEqual(E(P).val(mx.id),3);A.strictEqual(E(P).val(my.id),2);A.strictEqual(E(P).val(mp.id),250,'tapahtuma.x pikseleinä');
A.strictEqual(E(P).val(vk.id),32,'kaavassa napautettux ja napautettuy');
KK.setOmi(P,kv.id,'x',700);A.ok(KK.orNapautus(P,kv.id,C,20,390));A.strictEqual(E(P).val(vk.id),14,'siirretty palikka: ruudukko kulkee mukana');
KK.setOmi(P,kv.id,'orsar',6);A.ok(KK.orNapautus(P,kv.id,C,250,10));A.strictEqual(E(P).val(mx.id),6,'ohjattu sarakemäärä');KK.resetOmi(P,kv.id,'orsar');
kv.off=true;A.ok(!KK.orNapautus(P,kv.id,C,10,10),'pois käytöstä ei napautu');delete kv.off;
var ilman=U(P,'pkuva',{},0,600,100,100);A.ok(!KK.orNapautus(P,ilman.id,C,10,10),'ilman ruudukkoa ei tapahtumaa');
// napautettavan palikan napautettu-tapahtumaan myös ruutu
kv.nap=true;var nx=kirjaa(P,kv,'nap','tapahtuma.ruutux');KK.repair(P);A.ok(KK.napautus(P,kv.id,C,110,10,false));A.strictEqual(E(P).val(nx.id),2,'napautettu-tiedoissa ruutux');

// --- 3. Törmäys: osuttu ruutu ---
var Q=KK.newProject('ot');TP(Q);var lauta=U(Q,'muoto',{},200,0,100,300,'Lauta');lauta.este=true;lauta.ors=1;lauta.orr=3;
var pallo=U(Q,'muoto',{laji:'ympyra'},0,210,40,40,'Pallo');var li=KK.addBlock(Q,'liike',{o:pallo.id});N(Q,li);li.vx='300';
var tx=kirjaa(Q,li,'tor','tapahtuma.ruutux'),ty=kirjaa(Q,li,'tor','tapahtuma.ruutuy'),tk=kirjaa(Q,li,'tor','tapahtuma.kohde');KK.repair(Q);
run(Q,1);A.strictEqual(E(Q).val(tk.id),'Lauta','törmäsi laudan');A.strictEqual(E(Q).val(tx.id),1);A.strictEqual(E(Q).val(ty.id),3,'osui alimpaan ruutuun (keskipiste y 230)');
var Q2=KK.newProject('ot2');TP(Q2);var s2=U(Q2,'muoto',{},200,0,100,300,'Seinä');s2.este=true;var p2=U(Q2,'muoto',{},0,10,40,40);var l2=KK.addBlock(Q2,'liike',{o:p2.id});N(Q2,l2);l2.vx='300';
var t2=kirjaa(Q2,l2,'tor','tapahtuma.ruutux'),k2=kirjaa(Q2,l2,'tor','tapahtuma.kohde');KK.repair(Q2);run(Q2,1);A.strictEqual(E(Q2).val(k2.id),'Seinä');A.strictEqual(E(Q2).val(t2.id),null,'ilman ruudukkoa ei ruutua');

// --- 4. Pudotus ruudukollisen palikan päälle ---
var D=KK.newProject('op');TP(D);var lt=U(D,'pkuva',{},100,100,400,400,'Lautakuva');lt.ors=4;lt.orr=4;var nap=U(D,'muoto',{},0,0,40,40,'Nappula');nap.raah=true;
var dx=kirjaa(D,nap,'rpu','tapahtuma.ruutux'),dy=kirjaa(D,nap,'rpu','tapahtuma.ruutuy'),dk=kirjaa(D,nap,'rpu','tapahtuma.kohde');KK.repair(D);
var o=KK.raahausPudotus(D,nap.id,330,130,C);A.ok(o.ok);A.strictEqual(E(D).val(dx.id),3,'keskipiste x 350 → 3. sarake');A.strictEqual(E(D).val(dy.id),1);A.strictEqual(E(D).val(dk.id),'Lautakuva','kohde = palikka, jos Aluetta ei ole');
var ala=U(D,'alue',{},90,90,420,420,'Pöytä');KK.repair(D);KK.raahausPudotus(D,nap.id,120,420,C);A.strictEqual(E(D).val(dk.id),'Pöytä','Alue pysyy kohteena');A.strictEqual(E(D).val(dx.id),1);A.strictEqual(E(D).val(dy.id),4);
KK.raahausPudotus(D,nap.id,700,700,C);A.strictEqual(E(D).val(dx.id),null,'ruudukon ulkopuolella ei ruutua');

// --- 5. Tallennus ja vanha projekti ---
var J=JSON.parse(JSON.stringify(KK.payload?KK.payload(P):{projekti:P}));var P2=J.projekti||J;KK.repair(P2);var k2b=P2.b[kv.id];A.strictEqual(k2b.ors,3);A.strictEqual(k2b.orr,4);A.strictEqual(k2b.orn,'aina');
var V=KK.newProject('vanha');var vb=U(V,'muoto',{},0,0,100,100);KK.repair(V);A.ok(!('ors' in vb)&&!('orr' in vb),'vanha palikka ennallaan');A.strictEqual(KK.VER,12,'tallennusversio pysyy 12 (valinnainen kenttä)');
console.log('ok logiikka_104_oma_ruudukko');
