// Jonon 1s (kartoitus 9): joukkojen korjaukset. S1 säännön laskuvirhe näkyy (Joukko-palikan arvo, virheet, Miksi?), S2 jäsen vain
// Joukko-palikan kentissä ja Jäsenille-ikkunan sisällä, S3 Liikkeen tapahtumat liikutettavan palikan jäsentapahtumina ja ohitettu
// jäsen näkyy, S4 keveys (400 jäsentä säännöllä, pikatie = täysi laskenta), S6 joukkojen numerointi, R1 kolikko joukolla.
var KK=require('./moottori.js'),A=require('assert');
var T=2000000;var C={now:function(){return new Date(T);},toast:function(m){C.last=m;},nav:function(){}};
function N(P,b,x,y,g){return KK.addNode(P,b.id,x||0,y||0,g||'');}
function E(P){return KK.Ev(P,C);}
function F(P,s){return KK.kaavaToIds(P,s);}
function run(P,s,dt){dt=dt||0.05;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}

// --- S1: säännön laskuvirhe ei katoa hiljaa ---
var P=KK.newProject('s1'),vw=P.views[0].id,J=KK.jkLuo(P,'seinat');
var m1=KK.addBlock(P,'muoto',{v:vw,nm:'Eka',x:10,y:10,w:40,h:40}),m2=KK.addBlock(P,'muoto',{v:vw,nm:'Toka',x:200,y:10,w:40,h:40});m1.jkt=[J];m2.jkt=[J];
var pj=KK.addBlock(P,'pjoukko',{jj:J});N(P,pj);KK.repair(P);
pj.jsr=[{p:'nk',f:F(P,'jäsen.x > 100')}];KK.repair(P);var e=E(P);
A.strictEqual(e.visible(m1.id),false);A.strictEqual(e.visible(m2.id),true);A.strictEqual(e.val(pj.id),2,'ilman virhettä arvo = jäseniä');
A.deepStrictEqual(e.jkSaantoVirheet(pj.id),{});
// tuntematon nimi: virhe näkyy Joukko-palikassa, sääntökohtaisesti ja jäsenen Miksi?:ssä
pj.jsr=[{p:'nk',f:F(P,'jäsen.x > puuttuva')}];KK.repair(P);e=E(P);
A.ok(KK.isErr(e.val(pj.id))&&/sääntö näkyy kun, jäsen ”Eka”/.test(e.val(pj.id).err),JSON.stringify(e.val(pj.id)));
var sv=e.jkSaantoVirheet(pj.id);A.strictEqual(sv.nk.id,m1.id);A.ok(sv.nk.err.length>0);
A.ok(KK.isErr(e.jkCtl(m1.id,'nk').v),'jäsenen ohjaus on virhe, ei epätosi');A.strictEqual(e.visible(m1.id),false,'virheellinen ohjaus piilottaa kuten virheellinen oma nuoli');
var w1=KK.why(P,e,m1.id);A.ok(/Joukko #seinat ohjaa kohtaa ”näkyy kun”.*⚠ virhe/.test(w1.txt),w1.txt);
var wp=KK.why(P,e,pj.id);A.ok(/⚠ sääntö näkyy kun: jäsenellä ”Eka”/.test(wp.txt),wp.txt);A.ok(wp.err,'Miksi? näyttää Joukko-palikan virheen');
// jako nollalla ilman jäsen-sanaa (lasketaan kerran koko joukolle): virhe kaikille, ei piilota hiljaa
pj.jsr=[{p:'nk',f:F(P,'1 / 0 > 1')}];KK.repair(P);e=E(P);
A.ok(KK.isErr(e.val(pj.id)),'jako nollalla näkyy');A.ok(KK.isErr(e.jkCtl(m2.id,'nk').v));
// siirron virhe: arvo virhe, ei siirtoa
pj.jsr=[{p:'dx',f:F(P,'jäsen.x / 0')}];KK.repair(P);e=E(P);A.ok(KK.isErr(e.val(pj.id))&&/siirto x/.test(e.val(pj.id).err));
A.strictEqual(KK.rectNow(P,e,m1).x,10,'virheellinen siirto ei siirrä');
// puuttuva ominaisuus ohittaa jäsenen kuten ennen (U2), ei virhe
var ar=KK.addBlock(P,'arvo',{nm:'Luku',v:'3'});ar.jkt=[J];pj.jsr=[{p:'o_x',f:F(P,'jäsen.y + 5')}];KK.repair(P);e=E(P);
A.deepStrictEqual(e.jkSaantoVirheet(pj.id),{},'Arvolla ei ole x:ää: ohitetaan');A.strictEqual(e.omi(m1.id,'x'),15);

// --- S2: jäsen vain Joukko-palikan kentissä ja Jäsenille-ikkunan sisällä ---
var kv=KK.addBlock(P,'kaava');kv.f=F(P,'jäsen.x + 1');N(P,kv);KK.repair(P);
A.ok(KK.isErr(E(P).val(kv.id))&&/vain Joukko-palikan kentissä/.test(E(P).val(kv.id).err));
var w=KK.addBlock(P,'ikkuna',{m:'sum',jas:true}),wn=N(P,w,800,0);var kin=KK.addBlock(P,'kaava');kin.f=F(P,'jäsen.x');N(P,kin,800,40,wn.id);KK.repair(P);
A.ok(KK.isErr(E(P).val(kv.id)),'Jäsenille-ikkuna muualla ei tee ulkopuolisesta kaavasta tyhjää');
A.strictEqual(E(P).val(kin.id),null,'ikkunan sisällä ilman jäsentä tyhjä');
ar.jkt=[];pj.jsr=[];var pjn=KK.nodesOfBlock(P,pj.id)[0];KK.addLink(P,pjn.id,'jm',wn.id,'jm');KK.repair(P);A.strictEqual(E(P).val(w.id),210,'ikkuna laskee jäsenille (x 10 + 200)');
// sääntö, joka lukee ulkopuolista kaavaa, jossa on jäsen: virhe (jäsen ei kulje viitteen kautta)
pj.jsr=[{p:'nk',f:F(P,kv.vt+' > 0')}];KK.repair(P);e=E(P);A.ok(KK.isErr(e.jkCtl(m1.id,'nk').v),'viitattu kaava ei saa jäsentä');
pj.jsr=[];KK.repair(P);

// --- S3: Liikkeen tapahtuma liikutettavan palikan jäsentapahtumana ---
var Q=KK.newProject('s3'),qv=Q.views[0].id;Q.views[0].laite='puhelin';var QJ=KK.jkLuo(Q,'viholliset');
var h=KK.addBlock(Q,'muoto',{v:qv,nm:'Vihu',laji:'laatikko'});h.x=100;h.y=100;h.w=40;h.h=40;h.jkt=[QJ];
var sein=KK.addBlock(Q,'muoto',{v:qv,nm:'Seinä'});sein.x=200;sein.y=0;sein.w=20;sein.h=400;sein.este=true;
var li=KK.addBlock(Q,'liike',{o:h.id,vx:'100',vy:'0',nm:'Kävely'});N(Q,li);
var qp=KK.addBlock(Q,'pjoukko',{jj:QJ,jlj:'muoto'}),qpn=N(Q,qp);KK.repair(Q);
var qo=KK.ports(qp).outs.map(function(o){return o.p;});A.ok(['j_tor','j_per','j_ast'].every(function(p){return qo.indexOf(p)>=0;}),'Muodon jäsenillä Liikkeen tapahtumat: '+qo);
var qm=KK.addBlock(Q,'muisti',{v:'0'});N(Q,qm);var qt=KK.addBlock(Q,'tee',{do:'lisaa',o:qm.id});KK.addLink(Q,qpn.id,'j_tor',N(Q,qt).id,'e');
var qtap=KK.addBlock(Q,'tapaht',{nm:'Tapahtuma'});N(Q,qtap);var qk=KK.addBlock(Q,'muisti',{nm:'Kuka',v:''});N(Q,qk);
var qa=KK.addBlock(Q,'tee',{do:'aseta',o:qk.id,v:'{#'+qtap.id+'.jäsen} {#'+qtap.id+'.lähde}'});KK.addLink(Q,qpn.id,'j_tor',N(Q,qa).id,'e');
var qv2=KK.addBlock(Q,'tee',{do:'aseta',otj:1,om:'vari',v:'5'});KK.addLink(Q,qpn.id,'j_tor',N(Q,qv2).id,'e');KK.repair(Q);
run(Q,1.5);var qe=E(Q);A.strictEqual(qe.val(qm.id),1,'liikkuvan palikan jäsen törmäsi kerran');A.strictEqual(qe.val(qk.id),'Vihu Kävely','jäsen = liikutettava, lähde = Liike');
A.strictEqual(qe.omi(h.id,'vari'),5,'Tapahtuman jäsen osui liikutettavaan');A.ok(!KK.JK_OHI[qv2.id]);
// Liike jäsenenä: tapahtuma tulee ennallaan, mutta ominaisuus puuttuu → ohitus näkyy Miksi?:ssä
var Q2=KK.newProject('s3b'),q2v=Q2.views[0].id;Q2.views[0].laite='puhelin';var Q2J=KK.jkLuo(Q2,'liikkeet');
var h2=KK.addBlock(Q2,'muoto',{v:q2v,nm:'Vihu'});h2.x=100;h2.y=100;h2.w=40;h2.h=40;var s2=KK.addBlock(Q2,'muoto',{v:q2v});s2.x=200;s2.y=0;s2.w=20;s2.h=400;s2.este=true;
var l2=KK.addBlock(Q2,'liike',{o:h2.id,vx:'100',vy:'0',nm:'Kävely'});l2.jkt=[Q2J];N(Q2,l2);
var q2p=KK.addBlock(Q2,'pjoukko',{jj:Q2J,jlj:'liike'}),q2pn=N(Q2,q2p);var q2t=KK.addBlock(Q2,'tee',{do:'aseta',otj:1,om:'vari',v:'5'});KK.addLink(Q2,q2pn.id,'j_tor',N(Q2,q2t).id,'e');KK.repair(Q2);
run(Q2,1.5);A.deepStrictEqual(KK.JK_OHI[q2t.id],{m:'Kävely',om:'vari'});
var wq=KK.why(Q2,E(Q2),q2t.id);A.ok(/ohitettu: jäsenellä ”Kävely” ei ole ominaisuutta vari/.test(wq.txt),wq.txt);

// --- S4: keveys: 400 jäsentä ja yksi sääntö ---
function proj(rule,p){var R=KK.newProject('k'),rv=R.views[0].id,RJ=KK.jkLuo(R,'seinat');
  for(var i=0;i<400;i++){var b=KK.addBlock(R,'muoto',{v:rv,x:(i%20)*50,y:Math.floor(i/20)*50,w:40,h:40});b.jkt=[RJ];}
  if(rule){var rp=KK.addBlock(R,'pjoukko',{jj:RJ});N(R,rp);rp.jsr=[{p:p,f:F(R,rule)}];}KK.repair(R);return R;}
function aika(R){var m=new Map(),ids=Object.keys(R.b).filter(function(i){return R.b[i].k==='muoto';}),c=0;
  function f(){var ev=KK.Ev(R,C);c=0;ids.forEach(function(id){if(ev.state(id)==='näkyy')c++;KK.rectNow(R,ev,R.b[id]);});}
  for(var w0=0;w0<10;w0++)KK.omBatch(f,m);var t0=Date.now();for(var k=0;k<60;k++)KK.omBatch(f,m);return {ms:(Date.now()-t0)/60,c:c};}
var a0=aika(proj(null)),a1=aika(proj('jäsen.x > 100','nk')),a2=aika(proj('kyllä','nk')),a3=aika(proj('jäsen.y / 10','dx'));
A.strictEqual(a1.c,340);A.strictEqual(a2.c,400);
console.log('keveys ms/kuva: ilman '+a0.ms.toFixed(2)+', näkyy jäsen '+a1.ms.toFixed(2)+', näkyy vakio '+a2.ms.toFixed(2)+', siirto '+a3.ms.toFixed(2));
A.ok(a1.ms<8&&a2.ms<8&&a3.ms<8,'400 jäsenen sääntö alle 8 ms kuvassa');
// pikatie = täysi laskenta, kun joukko ohjaa siirtoa tai näkyvyyttä
var R3=proj('jäsen.y / 10','dx'),e3=E(R3);Object.keys(R3.b).filter(function(i){return R3.b[i].k==='muoto';}).slice(0,60).forEach(function(i){A.deepStrictEqual(KK.rectNow(R3,e3,R3.b[i]),KK.rectNow0(R3,e3,R3.b[i]));});
var R4=proj('jäsen.x > 100','nk'),e4=E(R4);Object.keys(R4.b).filter(function(i){return R4.b[i].k==='muoto';}).slice(0,30).forEach(function(i){A.deepStrictEqual(KK.rectNow(R4,e4,R4.b[i]),KK.rectNow0(R4,e4,R4.b[i]));});

// --- S6: numerointi kuten viitteillä ---
var S=KK.newProject('s6');A.strictEqual(KK.jkPick(S,'joukko'),'joukko');KK.jkLuo(S,'joukko');A.strictEqual(KK.jkPick(S,'joukko'),'joukko2');
KK.jkLuo(S,'joukko2');A.strictEqual(KK.jkPick(S,'joukko2'),'joukko3','lopussa oleva numero kasvaa');A.strictEqual(KK.jkPick(S,'jos'),'jos2','varattu sana ohitetaan');
var sj=KK.jkLuo(S,'viholliset'),sp=KK.addBlock(S,'pjoukko',{jj:sj});N(S,sp);KK.repair(S);var sp2=KK.addBlock(S,'pjoukko',{jj:sj});N(S,sp2);KK.repair(S);
A.strictEqual(sp2.nm,'#viholliset2','kopio saa #nimi2');

// --- R1: kolikko joukolla (rakennuslaatikon rakenne) ---
var G=KK.newProject('kolikot'),gv=G.views[0].id;G.views[0].laite='puhelin';var GJ=KK.jkLuo(G,'kolikot');
var pis=KK.addBlock(G,'muisti',{nm:'Pisteet',v:0});N(G,pis);
var gp=KK.addBlock(G,'pjoukko',{jj:GJ,jlj:'alue'}),gpn=N(G,gp);KK.repair(G);
var gpo=KK.addBlock(G,'tee',{do:'joukosta',otj:1,jo:GJ}),gli=KK.addBlock(G,'tee',{do:'lisaa',o:pis.id,v:'1'});
KK.addLink(G,gpn.id,'j_e',N(G,gpo).id,'e');KK.addLink(G,gpn.id,'j_e',N(G,gli).id,'e');
var kol=[];for(var i=0;i<3;i++){var k=KK.addBlock(G,'muoto',{v:gv,nm:'Kolikko',laji:'ympyra'});k.x=200+i*100;k.y=100;k.w=28;k.h=28;
  var al=KK.addBlock(G,'alue',{v:gv,nm:'Kolikko: alue',osu:'ympyra'});al.x=k.x-10;al.y=k.y-10;al.w=48;al.h=48;al.jkt=[GJ];
  var kf=KK.addBlock(G,'kaava');kf.f=F(G,al.vt+'.joukot sisältää "kolikot"');KK.addLink(G,N(G,kf).id,'v',N(G,k).id,'nk');kol.push(k);}
var pel=KK.addBlock(G,'muoto',{v:gv,nm:'Pelaaja'});pel.x=60;pel.y=104;pel.w=20;pel.h=20;var pl=KK.addBlock(G,'liike',{o:pel.id,vx:'300',vy:'0'});N(G,pl);KK.repair(G);KK.tick(G,C);
A.deepStrictEqual(kol.map(function(k){return E(G).visible(k.id);}),[true,true,true]);
run(G,1.6);var ge=E(G);A.strictEqual(ge.val(pis.id),3,'kolme kolikkoa kerätty');A.deepStrictEqual(kol.map(function(k){return ge.visible(k.id);}),[false,false,false]);
var pl2=KK.addBlock(G,'liike',{o:pel.id,vx:'-300',vy:'0'});N(G,pl2);pl.vx='0';KK.repair(G);run(G,1.2);A.strictEqual(E(G).val(pis.id),3,'kerättyä ei lasketa uudestaan');
console.log('logiikka_88_korjaukset_1s ok');
