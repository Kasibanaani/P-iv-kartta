// Jonon 17 (F35 vaihe B): hyppy. Liikkeen hyppää / lopeta hyppy / hyppäsi, korkeus (ponnistus √(2gh)), ilmaohjaus,
// lyhyt hyppy, hyppyjä ilmassa, armoaika ja ennakko. Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=2000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+': '+a+' ≠ '+b+' (±'+e+')');}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;var act=false,n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;act=KK.frame(P,dt,C);}return act;}
function E(P){return KK.Ev(P,C);}
function Y(P,b){return E(P).omiNum(b.id,'y',0);}
function X(P,b){return E(P).omiNum(b.id,'x',0);}
function vw(P){return P.views[0].id;}
function alue(P,o){o=o||{};var a=KK.addBlock(P,'alue',{v:vw(P)});a.x=o.x!=null?o.x:-2000;a.y=o.y!=null?o.y:-2000;a.w=o.w||6000;a.h=o.h||6000;if(o.pv!==undefined)a.pv=o.pv;if(o.pvs)a.pvs=o.pvs;if(o.ilv!=null)a.ilv=o.ilv;if(o.z!=null)a.z=o.z;return a;}
function laatikko(P,x,y,w,h,o){o=o||{};var b=KK.addBlock(P,'muoto',{v:vw(P)});b.x=x;b.y=y;b.w=w;b.h=h;b.este=true;if(o.m!=null)b.mas=o.m;if(o.kim!=null)b.kim=o.kim;if(o.nm)b.nm=o.nm;return b;}
function hahmo(P,x,y,o){o=o||{};var b=laatikko(P,x,y,o.d||40,o.d||40,o);var li=LB(P,'liike',{o:b.id});if(o.vx!=null)li.vx=String(o.vx);if(o.vy!=null)li.vy=String(o.vy);if(o.pvk!=null)li.pvk=o.pvk;if(o.kit!=null)li.kit=o.kit;return {b:b,li:li};}
function laskuri(P,li,p){var m=LB(P,'muisti',{v:'0'});var t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,li).id,p,N(P,t).id,'e');return m;}
/* Tapahtuman tiedot muistiin: kirjuri(P, li, 'tor', ['tapahtuma.puoli', …]) → muistit samassa järjestyksessä. */
function hyp(P,li){A.ok(KK.liikeHyppyKomento(P,li.id,'hyp'),'hyppää otettiin vastaan');}
function irti(P,li){return KK.liikeHyppyKomento(P,li.id,'hyx');}
/* Huippu: pienin y hypyn aikana, askel kerrallaan. */
function huippu(P,b,s,dt){dt=dt||1/60;var m=Infinity,n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;KK.frame(P,dt,C);m=Math.min(m,Y(P,b));}return m;}
function kentta(o){o=o||{};var P=KK.newProject('h'+Math.random());alue(P,{pv:o.g||2000});laatikko(P,-2000,600,6000,40,{nm:'Lattia'});var q=hahmo(P,o.x||0,560,o);
  ['hyk','ilo','hyi','hya','hye','hylp'].forEach(function(k){if(o[k]!==undefined)q.li[k]=o[k];});KK.repair(P);run(P,0.3);A.strictEqual(E(P).val(q.li.id,'maa'),true,'alussa maassa');return {P:P,q:q};}

// --- 0. Kohdat, rekisteri ja korjaus ---
var k=kentta(),li=k.q.li,pr=KK.ports(li);
A.ok(pr.ins.some(function(o){return o.p==='hyp'&&o.t==='e';})&&pr.ins.some(function(o){return o.p==='hyx'&&o.t==='e';}),'kohdat hyppää ja lopeta hyppy');
A.ok(pr.outs.some(function(o){return o.p==='hys'&&o.t==='e';}),'tapahtuma hyppäsi');
A.ok(KK.ports(LB(k.P,'liike',{ohj:'ruutu'})).ins.every(function(o){return o.p!=='hyp';}),'ruutuliikkeellä ei hyppää');
['hyppy','ilmaohjaus','lyhythyppy','ilmahypyt','armoaika','ennakko'].forEach(function(n){var e=KK.omFind(li,n);A.ok(e&&e.o,'ohjattava '+n);});
A.ok(KK.omFind(li,'hyppyjäljellä'),'luettava hyppyjäljellä');
A.strictEqual(E(k.P).omiNum(li.id,'ilmaohjaus',-1),100);A.strictEqual(E(k.P).omiVal(li.id,'lyhythyppy'),true);A.strictEqual(E(k.P).omiNum(li.id,'ilmahypyt',-1),0);
A.strictEqual(E(k.P).omiNum(li.id,'armoaika',-1),0.1);A.strictEqual(E(k.P).omiNum(li.id,'ennakko',-1),0.1);
li.hyk='120';li.ilo='100';li.hyi='1,6';li.hya='9';li.hye='abc';li.hylp=false;KK.repair(k.P);
A.strictEqual(li.hyk,120);A.strictEqual(li.ilo,undefined,'oletus ei tallennu');A.strictEqual(li.hyi,2,'kokonaisluku');A.strictEqual(li.hya,2,'yläraja');A.strictEqual(li.hye,undefined);A.strictEqual(li.hylp,undefined);
k.q.b.hyk=5;KK.repair(k.P);A.strictEqual(k.q.b.hyk,undefined,'hypyn kentät vain Liikkeellä');
A.ok(KK.jkTapahtumat('muoto').some(function(x){return x[0]==='hys';}),'Joukon jäsentapahtumiin hyppäsi');
A.strictEqual(E(k.P).omiNum(li.id,'hyppyjäljellä',-1),3,'maassa 1 + ilmahypyt 2');

// --- 1. Huippu = korkeus ±2 % kaikilla fps:illä, myös eri painovoimalla ---
[[30,2000],[60,2000],[120,2000],[144,2000],[60,800],[60,4000]].forEach(function(c){var r=kentta({g:c[1],hyk:150});hyp(r.P,r.q.li);var m=huippu(r.P,r.q.b,1.5,1/c[0]);
  near(560-m,150,3,c[0]+' fps, g '+c[1]+': huippu 150 px');A.strictEqual(E(r.P).val(r.q.li.id,'maa'),true,'laskeutui takaisin');near(Y(r.P,r.q.b),560,0.01,'takaisin lattialle');});
// Oletuskorkeus 3 × korkeus
var r=kentta({d:30});laatikko(r.P,-2000,600,6000,40);hyp(r.P,r.q.li);near(570-huippu(r.P,r.q.b,1),90,2,'oletus 3 × 30 px');
// Ominaisuus hyppy ohjattavana (Aseta): korkeus muuttuu
r=kentta();A.ok(KK.setOmi(r.P,r.q.li.id,'hyppy',60));hyp(r.P,r.q.li);near(560-huippu(r.P,r.q.b,1),60,2,'Aseta hyppy 60');

// --- 2. hyppäsi-tapahtuma, ei hyppyä ilmassa ilman tuplahyppyä, tuplahyppy ---
r=kentta({hyk:100});var nH=laskuri(r.P,r.q.li,'hys');KK.repair(r.P);hyp(r.P,r.q.li);run(r.P,0.15);A.strictEqual(E(r.P).val(nH.id),1,'hyppäsi kerran');
A.strictEqual(E(r.P).omiNum(r.q.li.id,'hyppyjäljellä',-1),0,'ilmassa ei hyppyjä');var y1=Y(r.P,r.q.b);hyp(r.P,r.q.li);run(r.P,0.02);A.strictEqual(E(r.P).val(nH.id),1,'ei hyppyä ilmassa');
run(r.P,1.5);A.strictEqual(E(r.P).val(nH.id),1,'ennakko vanheni ilmassa: ei hyppyä laskeutuessa');
r=kentta({hyk:100,hyi:1});nH=laskuri(r.P,r.q.li,'hys');KK.repair(r.P);hyp(r.P,r.q.li);run(r.P,0.15);A.strictEqual(E(r.P).omiNum(r.q.li.id,'hyppyjäljellä',-1),1,'tuplahyppy jäljellä');
var yA=Y(r.P,r.q.b);hyp(r.P,r.q.li);var mA2=huippu(r.P,r.q.b,1);A.strictEqual(E(r.P).val(nH.id),2,'tuplahyppy');near(yA-mA2,100,3,'ilmahyppy nousee korkeuden verran ilmasta');
A.strictEqual(E(r.P).omiNum(r.q.li.id,'hyppyjäljellä',-1),2,'maassa taas 1 + 1');hyp(r.P,r.q.li);run(r.P,0.1);hyp(r.P,r.q.li);run(r.P,0.1);hyp(r.P,r.q.li);run(r.P,0.05);A.strictEqual(E(r.P).val(nH.id),4,'kolmas painallus ilmassa ei hyppää');

// --- 3. Lyhyt hyppy: lopeta hyppy leikkaa nousun 40 %:iin; pois päältä ei leikkaa ---
function lyhyt(o,t){var q=kentta(o);hyp(q.P,q.q.li);var m1=huippu(q.P,q.q.b,t);irti(q.P,q.q.li);return 560-Math.min(m1,huippu(q.P,q.q.b,1.2));}
var pitka=(function(){var q=kentta({hyk:200});hyp(q.P,q.q.li);return 560-huippu(q.P,q.q.b,1.2);})();near(pitka,200,4);
var ly=lyhyt({hyk:200},0.05);A.ok(ly<pitka*0.6&&ly>20,'lyhyt hyppy matalampi: '+ly);
near(lyhyt({hyk:200,hylp:true},0.05),pitka,4,'lyhyt hyppy pois: täysi korkeus');
near(lyhyt({hyk:200},0.6),pitka,4,'irti huipun jälkeen: ei vaikutusta');
r=kentta();A.strictEqual(irti(r.P,r.q.li),false,'lopeta hyppy maassa ei tee mitään');

// --- 4. Juoksuhyppy pidempi; ilmaohjaus 0 = lähtövauhti ratkaisee, 100 = kuten maassa ---
function loikka(o,vx){var q=kentta(o);q.q.li.vx=String(vx);KK.repair(q.P);run(q.P,0.3);var x0=X(q.P,q.q.b);hyp(q.P,q.q.li);run(q.P,0.02);for(var i=0;i<300&&!E(q.P).val(q.q.li.id,'maa');i++)run(q.P,1/120,1/120);return X(q.P,q.q.b)-x0;}
var lj=loikka({hyk:120},300),lp=loikka({hyk:120},50);A.ok(lj>2*lp,'juoksuhyppy pidempi: '+lj+' > '+lp);
function ilma(ilo){var q=kentta({hyk:150,ilo:ilo});q.q.li.vx='300';KK.repair(q.P);run(q.P,0.3);hyp(q.P,q.q.li);run(q.P,0.05);q.q.li.vx='0';KK.repair(q.P);var x0=X(q.P,q.q.b);run(q.P,0.3);return X(q.P,q.q.b)-x0;}
var i0=ilma(0),i60=ilma(60),i100=ilma(100);near(i0,90,1,'ilmaohjaus 0: vauhti säilyy (300 × 0,3)');A.ok(Math.abs(i100)<1,'ilmaohjaus 100: pysähtyy heti ('+i100+')');A.ok(i60>5&&i60<i0,'ilmaohjaus 60 välissä: '+i60);

// --- 5. Armoaika ja ennakko ---
function reuna(hya,odota){var P=KK.newProject('a'+Math.random());alue(P,{pv:2000});laatikko(P,-400,600,400,40);var q=hahmo(P,-60,560,{vx:200});q.li.hyk=100;if(hya!=null)q.li.hya=hya;var n=laskuri(P,q.li,'hys');KK.repair(P);run(P,0.05,1/120);A.strictEqual(E(P).val(q.li.id,'maa'),true);
  for(var i=0;i<400&&E(P).val(q.li.id,'maa')!==false;i++)run(P,1/120,1/120);if(odota)run(P,odota,1/120);hyp(P,q.li);run(P,0.02,1/120);return E(P).val(n.id);}
A.strictEqual(reuna(null,0.05),1,'armoaika 0,1: hyppy 0,05 s reunan jälkeen');A.strictEqual(reuna(null,0.2),0,'armoaika ohi');A.strictEqual(reuna(0,0.02),0,'armoaika 0');
// ennakko suoraan: paina hetki ennen laskeutumista
function ennakkoKoe(hye,ennen){var q=kentta({hyk:100});if(hye!=null){q.q.li.hye=hye;}var n=laskuri(q.P,q.q.li,'hys');KK.repair(q.P);hyp(q.P,q.q.li);run(q.P,0.05,1/120);
  var aika=2*Math.sqrt(2*100/2000)-0.05;run(q.P,aika-ennen,1/120);A.strictEqual(E(q.P).val(q.q.li.id,'maa'),false,'vielä ilmassa');hyp(q.P,q.q.li);run(q.P,ennen+0.05,1/120);return E(q.P).val(n.id);}
A.strictEqual(ennakkoKoe(null,0.05),2,'ennakko 0,1: 0,05 s ennen laskeutumista painettu hyppää laskeutuessa');A.strictEqual(ennakkoKoe(null,0.25),1,'0,25 s ennen: liian aikaisin');A.strictEqual(ennakkoKoe(0,0.05),1,'ennakko 0');

// --- 6. Käännetty painovoima: hyppy lähtee alas; ei painovoimaa: ei hyppyä ---
var P=KK.newProject('k');var a=alue(P,{pv:2000,pvs:'ylos'});laatikko(P,-500,-40,2000,40,{nm:'Katto'});var q=hahmo(P,0,100);q.li.hyk=120;KK.repair(P);run(P,1);near(Y(P,q.b),0,0.01,'katossa');
hyp(P,q.li);var my=-Infinity;for(var i=0;i<120;i++){run(P,1/120,1/120);my=Math.max(my,Y(P,q.b));}near(my,120,3,'käännetty: hyppy alaspäin 120 px');
P=KK.newProject('e');q=hahmo(P,0,0);KK.repair(P);hyp(P,q.li);run(P,0.5);A.strictEqual(Y(P,q.b),0,'ilman painovoimaa hyppy ei liikuta');
A.strictEqual(E(P).omiNum(q.li.id,'hyppyjäljellä',-1),0,'ilman painovoimaa 0 hyppyä');

// --- 7. Painike (Pohjassa vain painettaessa): painettu → hyppää, irrotettu → lopeta hyppy ---
function nappiHyppy(pito){var q=kentta({hyk:200});var pa=KK.addBlock(q.P,'nappi',{v:vw(q.P),beh:'pida'});N(q.P,pa);KK.addLink(q.P,N(q.P,pa).id,'e',N(q.P,q.q.li).id,'hyp');KK.addLink(q.P,N(q.P,pa).id,'irti',N(q.P,q.q.li).id,'hyx');KK.repair(q.P);
  KK.pressDown(q.P,pa.id,C);var m=huippu(q.P,q.q.b,pito);KK.pressUp(q.P,pa.id,C,pito);return 560-Math.min(m,huippu(q.P,q.q.b,1.2));}
near(nappiHyppy(0.6),200,4,'pitkä painallus: täysi hyppy');A.ok(nappiHyppy(0.05)<100,'napautus: lyhyt hyppy');

console.log('ok hyppy');
