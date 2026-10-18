// Jonon 1u (kartoitus 10, S1–S4): Joukon yhteinen jäsen napautettu ja pitkä painallus samoin kaikilta lähteiltä, moottorin osuus.
// tapKaytossa = oma nuoli tai jäsenyys Joukossa, jonka j_<p>-kohdasta lähtee nuoli. Alueen napautus antaa tapahtuma.x/.y (px)
// ja ruudukolla tapahtuma.ruutux/.ruutuy; Painike antaa kosketuksen kohdan, jos käyttöliittymä sen tuo. Kaavio napautettava.
var KK=require('./moottori.js'),A=require('assert');
var T=3000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function E(P){return KK.Ev(P,C);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function outs(b){return KK.ports(b).outs.map(function(o){return o.p;});}
function kirjaa(P,b,port,f){var m=KK.addBlock(P,'muisti',{v:''});N(P,m);var k=KK.addBlock(P,'kaava');N(P,k);k.f=KK.kaavaToIds(P,f);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}

// 1. (S1, S2) Alue vain Joukon kautta: käytössä, napautus lähettää jäsen napautettu, tapahtuma.x/.y pikseleinä
var Q=KK.newProject('alue'),vw=Q.views[0].id,J=KK.jkLuo(Q,'paikat'),tq=KK.addBlock(Q,'tapaht',{nm:'Tapahtuma'});N(Q,tq);
var al=U(Q,'alue',{},100,50,200,100,'Kenttä'),mu=U(Q,'muoto',{laji:'laatikko'},400,0,80,80,'Kortti'),ul=U(Q,'alue',{},600,50,100,100,'Ulkona');
al.jkt=[J];mu.jkt=[J];mu.nap=true;var pj=KK.addBlock(Q,'pjoukko',{jj:J});N(Q,pj);N(Q,al);N(Q,mu);N(Q,ul);KK.repair(Q);
A.ok(!KK.tapKaytossa(Q,al.id,'nap',C),'ei nuolta: ei käytössä');
var jc=laskuri(Q,pj,'j_nap'),jx=kirjaa(Q,pj,'j_nap','tapahtuma.x'),jy=kirjaa(Q,pj,'j_nap','tapahtuma.y'),jm=kirjaa(Q,pj,'j_nap','tapahtuma.jäsen');KK.repair(Q);
A.ok(KK.tapKaytossa(Q,al.id,'nap',C),'Alue Joukon jäsenenä: käytössä');A.ok(KK.tapKaytossa(Q,mu.id,'nap',C),'Muoto Joukon jäsenenä');
A.ok(!KK.tapKaytossa(Q,ul.id,'nap',C),'joukon ulkopuolinen Alue: ei käytössä');A.ok(!KK.tapKaytossa(Q,al.id,'pitka',C),'toinen tapahtuma ei käytössä');
A.deepStrictEqual(KK.alueNapautus(Q,vw,130.4,90.6,C),[al.id]);
A.strictEqual(E(Q).val(jc.id),1,'Alueen napautus Joukosta');A.strictEqual(E(Q).val(jx.id),30,'tapahtuma.x px');A.strictEqual(E(Q).val(jy.id),41,'tapahtuma.y px');A.strictEqual(E(Q).val(jm.id),'Kenttä');
A.strictEqual(E(Q).val(al.id,'nx'),30,'napautettux ennallaan');
KK.napautus(Q,mu.id,C,12,7);A.strictEqual(E(Q).val(jc.id),2);A.strictEqual(E(Q).val(jx.id),12,'sama tieto napautettavalta');
// oma nuoli ilman joukkoa toimii ennallaan; joukosta poistettu ei ole käytössä
var oc=laskuri(Q,ul,'nap'),ox=kirjaa(Q,ul,'nap','tapahtuma.x');KK.repair(Q);A.ok(KK.tapKaytossa(Q,ul.id,'nap',C));KK.alueNapautus(Q,vw,650,60,C);A.strictEqual(E(Q).val(oc.id),1);A.strictEqual(E(Q).val(ox.id),50);
al.jkt=[];KK.repair(Q);A.ok(!KK.tapKaytossa(Q,al.id,'nap',C),'joukosta poistettu ei käytössä');al.jkt=[J];KK.repair(Q);A.ok(KK.tapKaytossa(Q,al.id,'nap',C));

// 2. (S2) ruudukollinen Alue: tapahtuma.x/.y px ja tapahtuma.ruutux/.ruutuy
Q.views[0].kr=[{id:'pohja',n:'Pohja',rk:40}];al.rkr='pohja';al.x=120;al.y=40;KK.repair(Q);
var rx=kirjaa(Q,pj,'j_nap','tapahtuma.ruutux'),ry=kirjaa(Q,pj,'j_nap','tapahtuma.ruutuy');KK.repair(Q);
KK.alueNapautus(Q,vw,205,95,C);A.strictEqual(E(Q).val(rx.id),3,'tapahtuma.ruutux');A.strictEqual(E(Q).val(ry.id),2,'tapahtuma.ruutuy');
A.strictEqual(E(Q).val(jx.id),85,'tapahtuma.x yhä px');A.strictEqual(E(Q).val(al.id,'nx'),3,'napautettux ruutuina ennallaan');

// 3. (S2) Painike: kohta tapahtuman tietoihin, jos annettu; ilman kohtaa tyhjä
var nb=U(Q,'nappi',{beh:'kerta'},0,300,100,40,'Nappi');nb.jkt=[J];N(Q,nb);var px=kirjaa(Q,nb,'e','tapahtuma.x');KK.repair(Q);
KK.press(Q,nb.id,C,20.4,10);A.strictEqual(E(Q).val(px.id),20,'Painikkeen painettu: tapahtuma.x');A.strictEqual(E(Q).val(jx.id),20,'jäsen napautettu Painikkeelta: kohta');A.strictEqual(E(Q).val(jm.id),'Nappi');
KK.press(Q,nb.id,C);A.strictEqual(E(Q).val(jx.id),null,'näppäimistöltä tai ohjaimelta kohta tyhjä');
var pd=U(Q,'nappi',{beh:'pida'},0,400,100,40,'Pida');pd.jkt=[J];N(Q,pd);KK.repair(Q);KK.pressDown(Q,pd.id,C,7,8);A.strictEqual(E(Q).val(jx.id),7,'pohjassa vain painettaessa: kohta');KK.pressUp(Q,pd.id,C,0.1);

// 4. (S3) pitkä painallus: sama sääntö Painikkeelle ja napautettavalle, ei koko projektin laajuisesti
var R=KK.newProject('pitka'),J2=KK.jkLuo(R,'a'),J3=KK.jkLuo(R,'b');
var m1=U(R,'muoto',{laji:'laatikko'},0,0,80,80,'Sisällä'),m2=U(R,'muoto',{laji:'laatikko'},100,0,80,80,'Ulkona'),pb=U(R,'nappi',{beh:'kerta',ext:true},0,200,80,40,'Pnappi');
m1.nap=true;m2.nap=true;m1.jkt=[J2];pb.jkt=[J2];m2.jkt=[J3];[m1,m2,pb].forEach(function(b){N(R,b);});
var p2=KK.addBlock(R,'pjoukko',{jj:J2});N(R,p2);var p3=KK.addBlock(R,'pjoukko',{jj:J3});N(R,p3);KK.repair(R);
[m1,m2,pb].forEach(function(b){A.ok(!KK.tapKaytossa(R,b.id,'pitka',C),b.nm+': ei käytössä aluksi');});
laskuri(R,p2,'j_pitka');KK.repair(R);
A.ok(KK.tapKaytossa(R,m1.id,'pitka',C),'napautettava Joukon kautta');A.ok(KK.tapKaytossa(R,pb.id,'pitka',C),'Painike Joukon kautta');
A.ok(!KK.tapKaytossa(R,m2.id,'pitka',C),'toisen joukon jäsen: ei käytössä (ennen koko projekti)');
laskuri(R,m2,'pitka');KK.repair(R);A.ok(KK.tapKaytossa(R,m2.id,'pitka',C),'oma nuoli');

// 5. (S4) Kaavio napautettava
var kv=U(R,'kaavio',{},300,300,200,120,'Kaavio');A.ok(!!KK.NAPK.kaavio,'Kaavio NAPK:ssa');A.ok(outs(kv).indexOf('nap')<0,'ilman valintaa ei kohtia');
kv.nap=true;A.ok(KK.napOn(R,kv,C));A.ok(outs(kv).indexOf('nap')>=0&&outs(kv).indexOf('pitka')>=0,'Kaavion kohdat');var kc=laskuri(R,kv,'nap');KK.repair(R);
A.ok(KK.omFind(kv,'napautettava'),'ominaisuus');KK.napautus(R,kv.id,C,1,1);A.strictEqual(E(R).val(kc.id),1,'Kaavion napautus');
A.strictEqual(KK.VER,12,'tallennusversio ennallaan');
console.log('ok logiikka korjaukset 1u');
