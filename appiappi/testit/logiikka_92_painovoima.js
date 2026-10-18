// Jonon 16 (F35 vaihe A): painovoima Alueen ominaisuutena, Liikkeen painovoima %, maassa, alla, putoamisvauhti,
// laskeutui ja irtosi maasta, törmäsi-tietoihin puoli ja voima, kitka vain maassa, ohjaus poikittain, kiinteä askel 1/120 s.
// Moottorin osuus.
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
function kirjuri(P,li,p,kaavat){if(!Object.keys(P.b).some(function(i){return P.b[i].k==='tapaht';})){var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tp);}var prev=null,ms=[];
  kaavat.forEach(function(f){var m=LB(P,'muisti',{v:''}),k=LB(P,'kaava');k.f=KK.kaavaToIds(P,f);var s=LB(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});
    if(prev)KK.addLink(P,N(P,prev).id,'e',N(P,s).id,'e');else KK.addLink(P,N(P,li).id,p,N(P,s).id,'e');prev=s;ms.push(m);});return ms;}

// --- 0. Rekisteri, kohdat ja korjaus ---
var P=KK.newProject('r'),a=alue(P,{pv:2000}),h=hahmo(P,0,0);KK.repair(P);
['painovoima','suunta','ilmanvastus'].forEach(function(n){A.ok(KK.omFind(a,n)&&KK.omFind(a,n).o,'Alueella ohjattava '+n);});
['painovoima','maassa','alla','putoamisvauhti'].forEach(function(n){A.ok(KK.omFind(h.li,n),'Liikkeellä '+n);});
A.ok(KK.omFind(h.li,'painovoima').o,'Liikkeen painovoima ohjattava');
var outs=KK.ports(h.li).outs.map(function(o){return o.p;});['maa','alla','pvv','lask','irt'].forEach(function(p){A.ok(outs.indexOf(p)>=0,'Liikkeen kohta '+p);});
A.ok(KK.ports(LB(P,'liike',{ohj:'ruutu'})).outs.every(function(o){return o.p!=='lask';}),'ruutuliikkeellä ei laskeutui-kohtaa');
A.ok(!KK.omFind(LB(P,'liike',{ohj:'reitti'}),'maassa'),'reittiliikkeellä ei maassa');
A.strictEqual(E(P).omiNum(a.id,'ilmanvastus',-1),0,'ilmanvastus oletus 0');A.strictEqual(E(P).omiVal(a.id,'suunta'),'alas','suunta oletus alas');A.strictEqual(E(P).omiNum(h.li.id,'painovoima',-1),100,'Liikkeen painovoima oletus 100');
a.pv='2 500';a.pvs='alas';a.ilv='0';h.li.pvk='100';KK.repair(P);A.strictEqual(a.pv,2500);A.strictEqual(a.pvs,undefined,'oletussuunta ei tallennu');A.strictEqual(a.ilv,undefined);A.strictEqual(h.li.pvk,undefined);
a.pv='abc';a.pvs='vino';a.ilv='150';h.li.pvk='-5';KK.repair(P);A.strictEqual(a.pv,undefined,'virheellinen painovoima pois');A.strictEqual(a.pvs,undefined);A.strictEqual(a.ilv,100);A.strictEqual(h.li.pvk,0);
a.pv='0';a.pvs='ylos';KK.repair(P);A.strictEqual(a.pv,0,'0 säilyy (kumoaa alemman)');A.strictEqual(a.pvs,'ylos');
h.b.pv=10;KK.repair(P);A.strictEqual(h.b.pv,undefined,'painovoima vain Alueella');
A.ok(KK.jkTapahtumat('muoto').some(function(x){return x[0]==='lask';})&&KK.jkTapahtumat('muoto').some(function(x){return x[0]==='irt';}),'Joukon jäsentapahtumiin laskeutui ja irtosi');

// --- 1. Putoaminen sama 30, 60, 120 ja 144 fps (±2 %), tarkka tasaiselle kiihtyvyydelle ---
function putoa(fps){var Q=KK.newProject('f'+fps);alue(Q,{pv:2000});var q=hahmo(Q,100,0);laatikko(Q,0,600,800,40,{nm:'Lattia'});KK.repair(Q);
  var dt=1/fps,t=0,maahan=null,y05=null;for(var i=0;i<Math.round(fps*1.2);i++){T+=dt*1000;KK.frame(Q,dt,C);t+=dt;if(y05==null&&t>=0.5-1e-9)y05=Y(Q,q.b);if(maahan==null&&E(Q).val(q.li.id,'maa'))maahan=t;}
  return {y05:y05,maahan:maahan,y:Y(Q,q.b),alla:E(Q).val(q.li.id,'alla'),Q:Q,q:q};}
var r60=putoa(60);near(r60.y05,250,250*0.02,'0,5 s: ½·g·t² = 250 px');
[30,120,144].forEach(function(fps){var r=putoa(fps);near(r.y05,r60.y05,r60.y05*0.02,fps+' fps sama kuin 60 fps');near(r.maahan,r60.maahan,1/fps+1e-9,fps+' fps laskeutuu samaan aikaan');near(r.y,560,0.01,fps+' fps lattian päällä');});
near(r60.maahan,Math.sqrt(2*560/2000),0.02,'laskeutumisaika √(2h/g)');A.strictEqual(r60.y,560,'seisoo lattialla tarkasti');A.strictEqual(r60.alla,'Lattia','alla = lattia');
A.strictEqual(E(r60.Q).val(r60.q.li.id,'pvv'),0,'putoamisvauhti 0 maassa');
A.ok(!KK.frame(r60.Q,1/60,C),'kuvasilmukka pysähtyy, kun kaikki ovat maassa ja paikallaan');
var Pi=KK.newProject('i');alue(Pi,{pv:2000});var hi=hahmo(Pi,0,0);KK.repair(Pi);A.ok(KK.frame(Pi,0,C),'ilmassa oleva käynnistää kuvasilmukan');
run(Pi,0.25);near(E(Pi).val(hi.li.id,'pvv'),500,1,'putoamisvauhti g·t');A.strictEqual(E(Pi).val(hi.li.id,'maa'),false,'ilmassa ei maassa');A.strictEqual(E(Pi).val(hi.li.id,'alla'),'');

// --- 2. Laskeutui (kohde, isku, voima), maassa vain alustalla, irtosi maasta reunalta ---
P=KK.newProject('l');alue(P,{pv:2000});h=hahmo(P,0,0,{m:2});var hylly=laatikko(P,-60,200,200,20,{nm:'Hylly'});KK.repair(P);
var nL=laskuri(P,h.li,'lask'),nI=laskuri(P,h.li,'irt'),nT=laskuri(P,h.li,'tor'),kL=kirjuri(P,h.li,'lask',['tapahtuma.kohde','tapahtuma.isku','tapahtuma.voima']),kT=kirjuri(P,h.li,'tor',['tapahtuma.puoli','tapahtuma.voima']);KK.repair(P);
run(P,1);A.strictEqual(E(P).val(nL.id),1,'laskeutui kerran');A.strictEqual(E(P).val(nI.id),0,'ei irronnut');A.strictEqual(E(P).val(nT.id),1,'törmäsi kerran');
A.strictEqual(E(P).val(kL[0].id),'Hylly','laskeutui: tapahtuma.kohde');near(E(P).val(kL[1].id),Math.sqrt(2*2000*160),2000/120+1,'laskeutui: isku ≈ √(2gh) (askeleen tarkkuudella g·Δt)');
near(E(P).val(kL[2].id),E(P).val(kL[1].id)*2,0.05,'voima = (1 + 0) · isku · massa 2');
A.strictEqual(E(P).val(kT[0].id),'ylhäältä','törmäsi: puoli ylhäältä');A.strictEqual(E(P).val(h.li.id,'alla'),'Hylly');A.strictEqual(E(P).val(h.li.id,'maa'),true);
// Kävely reunan yli: irtosi maasta, putoaa
h.li.vx='200';KK.repair(P);run(P,1);A.strictEqual(E(P).val(nI.id),1,'irtosi maasta kerran');A.strictEqual(E(P).val(h.li.id,'maa'),false,'reunan yli ilmaan');A.ok(Y(P,h.b)>200,'putoaa reunalta');
// Seinään sivulta: maassa ei synny, puoli sivulta
P=KK.newProject('s');alue(P,{pv:2000});laatikko(P,-200,100,800,20,{nm:'Lattia'});laatikko(P,200,-400,20,500,{nm:'Seinä'});h=hahmo(P,0,60,{vx:300});KK.repair(P);
var kS=kirjuri(P,h.li,'tor',['tapahtuma.puoli','tapahtuma.kohde']);KK.repair(P);run(P,1.2);
A.strictEqual(E(P).val(kS[1].id),'Seinä','viimeisin törmäys seinään');A.strictEqual(E(P).val(kS[0].id),'sivulta','seinä: puoli sivulta');A.strictEqual(E(P).val(h.li.id,'alla'),'Lattia','seinä ei ole alusta');
near(X(P,h.b),160,0.01,'pysähtyi seinään');

// --- 3. Ohjaus vain poikittain, kitka vain maassa ---
P=KK.newProject('o');alue(P,{pv:2000});laatikko(P,-500,400,2000,20);h=hahmo(P,0,0,{vx:100,vy:-900});KK.repair(P);run(P,0.3);
A.ok(Y(P,h.b)>50,'nopeus y ei lennätä painovoimassa: '+Y(P,h.b));near(X(P,h.b),30,0.5,'vaakaohjaus toimii');
P=KK.newProject('k');alue(P,{pv:1000});laatikko(P,-500,1000,4000,20);h=hahmo(P,0,0,{kit:100});KK.repair(P);KK.setOmi(P,h.li.id,'vauhtix',300);
run(P,0.5);near(E(P).omiNum(h.li.id,'vauhtix',0),300,1e-6,'ilmassa kitka ei hidasta');near(X(P,h.b),150,0.01,'heittoliike: x = v·t');
run(P,1.5);A.strictEqual(E(P).omiNum(h.li.id,'vauhtix',0),0,'maassa kitka 100 pysäyttää');A.strictEqual(E(P).val(h.li.id,'maa'),true);
// Tatti: pystysuunta ei ohjaa painovoimassa
P=KK.newProject('t');alue(P,{pv:2000});laatikko(P,-500,400,2000,20);var tt=KK.addBlock(P,'tatti',{v:vw(P)});h=hahmo(P,0,300);h.li.ohj='tatti';h.li.tt=tt.id;h.li.vm=200;KK.repair(P);run(P,0.5);
P.st[tt.id]={x:1,y:-1};var y0=Y(P,h.b),x0=X(P,h.b);run(P,0.5);near(Y(P,h.b),y0,0.01,'tatti ylös ei nosta');near(X(P,h.b)-x0,200*0.5*Math.SQRT1_2,1,'vino tatti: vain poikittainen osa');P.st[tt.id]={x:1,y:0};x0=X(P,h.b);run(P,0.5);near(X(P,h.b)-x0,100,1,'tatti sivulle: täysi vauhti');

// --- 4. Käännetty painovoima (Aseta suunta ylös), Liikkeen painovoima %, päällimmäinen Alue voittaa ---
P=KK.newProject('k2');a=alue(P,{pv:2000});laatikko(P,-500,-220,2000,20,{nm:'Katto'});laatikko(P,-500,400,2000,20,{nm:'Lattia'});h=hahmo(P,0,300);KK.repair(P);run(P,1);
A.strictEqual(E(P).val(h.li.id,'alla'),'Lattia');A.ok(KK.setOmi(P,a.id,'suunta','ylös'),'Aseta suunta ylös');A.strictEqual(E(P).omiVal(a.id,'suunta'),'ylos');
run(P,1.5);near(Y(P,h.b),-200,0.01,'putosi kattoon');A.strictEqual(E(P).val(h.li.id,'alla'),'Katto','käännetty: maassa katossa');A.strictEqual(E(P).val(h.li.id,'maa'),true);
KK.setOmi(P,a.id,'suunta',3);run(P,0.3);A.ok(X(P,h.b)<-50,'suunta 3 = vasen');
function matka(pvk){var Q=KK.newProject('p'+pvk);alue(Q,{pv:2000});var q=hahmo(Q,0,0,{pvk:pvk});KK.repair(Q);run(Q,0.5);return Y(Q,q.b);}
near(matka(50),125,2,'painovoima 50 % = puolet');A.strictEqual(matka(0),0,'painovoima 0 % ei putoa');
P=KK.newProject('z');alue(P,{pv:2000});alue(P,{x:-100,y:-100,w:300,h:300,pv:0});h=hahmo(P,0,0,{vy:-100});KK.repair(P);run(P,0.5);
near(Y(P,h.b),-50,0.01,'päällimmäinen Alue (painovoima 0, tikkaat): ei painovoimaa, pystyohjaus toimii');
P=KK.newProject('z2');alue(P,{x:-100,y:-100,w:300,h:300,pv:0,z:-1});var Ab=alue(P,{pv:2000,z:5});h=hahmo(P,0,0);KK.repair(P);run(P,0.5);near(Y(P,h.b),250,5,'järjestys ratkaisee: ylempi painovoima voittaa');
// Painovoiman kääntäminen päälle Aseta-toiminnolla Alueelle, jolla ei ole perusarvoa
P=KK.newProject('a');a=alue(P);h=hahmo(P,0,0);KK.repair(P);A.strictEqual(KK.frame(P,0,C),false,'ei painovoimaa: ei liikettä');
var tee=LB(P,'tee',{do:'aseta',o:a.id,om:'painovoima',v:'1000'});KK.repair(P);KK.runAction(P,tee.id,C);A.ok(KK.frame(P,0,C),'Aseta painovoima käynnistää');run(P,0.5);near(Y(P,h.b),125,2,'Asetettu painovoima vetää');

// --- 5. Ilmanvastus: rajanopeus g / (3 · ilmanvastus/100) ---
P=KK.newProject('v');alue(P,{pv:1500,ilv:50});h=hahmo(P,0,0);KK.repair(P);run(P,4);near(E(P).val(h.li.id,'pvv'),1000,10,'rajanopeus 1500 / 1,5 (±1 %)');

// --- 6. Massallinen laatikko painovoimassa: hahmo seisoo sen päällä (alla = laatikko) ---
P=KK.newProject('m');alue(P,{pv:2000});laatikko(P,-500,400,2000,20,{nm:'Lattia'});var lb=hahmo(P,0,300,{m:5,d:80,nm:'Laatikko'});h=hahmo(P,20,100,{nm:'Pelaaja'});KK.repair(P);
var kM=kirjuri(P,h.li,'lask',['tapahtuma.kohde','tapahtuma.voima']);KK.repair(P);run(P,2);
A.strictEqual(E(P).val(lb.li.id,'alla'),'Lattia','laatikko lattialla');A.strictEqual(E(P).val(h.li.id,'alla'),'Laatikko','pelaaja laatikon päällä');A.strictEqual(E(P).val(kM[0].id),'Laatikko');
A.ok(E(P).val(kM[1].id)>0,'laskeutui laatikolle: voima impulssista '+E(P).val(kM[1].id));near(Y(P,lb.b),320,0.5,'laatikko laskeutui lattialle');near(Y(P,h.b),320-40,1.5,'pelaaja laatikon päällä');var yp=Y(P,h.b);run(P,1);near(Y(P,h.b),yp,0.5,'pino pysyy paikallaan');

// --- 7. Ilman painovoimaa ennallaan: ei kiinteää askelta, puoli ruudun suhteen ---
P=KK.newProject('e');var pa=hahmo(P,0,0,{vx:100});laatikko(P,300,-500,20,1200,{nm:'Seinä'});alue(P,{x:-50,y:-50,w:100,h:100});KK.repair(P);
T+=7;KK.frame(P,0.007,C);near(X(P,pa.b),0.7,1e-9,'ilman painovoima-Aluetta kuva on yksi askel (0,007 s → 0,7 px)');
var kE=kirjuri(P,pa.li,'tor',['tapahtuma.puoli','tapahtuma.voima']);KK.repair(P);run(P,3.5);A.strictEqual(E(P).val(kE[0].id),'vasemmalta','ilman painovoimaa: osui vasemmalta');near(E(P).val(kE[1].id),100,0.01,'massaton: voima = isku');
A.strictEqual(E(P).val(pa.li.id,'maa'),false,'ilman painovoimaa ei maassa');A.strictEqual(E(P).val(pa.li.id,'pvv'),0);

console.log('ok painovoima');
