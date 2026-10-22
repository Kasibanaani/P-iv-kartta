// Jono 42e3 (suunnitelma 31 V3, D1; kartoitus 15 S3 b): rivijäsenet (käytössä lisätyt) ryhmän ikkunassa ja Jäsenille-laskennassa:
// ryhmän ikkunan arvo, Jäsenille-ikkuna (jäsen = rivijäsen, jäsen.rasti, jäsen.päivä), Toista jäsenille + Tapahtuman jäsen,
// Toiminto jokaiselle jäsenelle (.rasti, arvo), ohitus, tapahtuma.jäsen, rjNimi.
var KK=require('./moottori.js'),A=require('assert');
var T=Date.UTC(2026,9,22,9);var C={now:function(){return new Date(T);},toast:function(m){C.last=m;},nav:function(){}};
function N(P,b,x,y,g){return KK.addNode(P,b.id,x||0,y||0,g||'');}
function E(P){return KK.Ev(P,C);}
function yl(P,nm,t,y){var b=KK.addBlock(P,'arvo',{yl:1});N(P,b,0,y||0);KK.setName(P,b.id,nm);KK.ylAseta(P,b,t,'@');KK.ylLinkit(P,b,t);KK.repair(P);return b;}
var P=KK.newProject('rj');var g=yl(P,'Luvut','',0),a=yl(P,'A','4\n#luvut',80),b=yl(P,'B','6\n#luvut',160);var J=KK.ylOma(P,g);
P.st['jkr:'+J]=[{id:'q1',tx:'10'},{id:'q2',tx:'Soita 24.10.',c:true}];KK.repair(P);KK.tick(P,C);
A.strictEqual(KK.rjNimi(P,'q2'),'Soita 24.10.');A.strictEqual(KK.rjNimi(P,a.id),'A');A.deepStrictEqual(KK.rjEtsi(P,'q1').j,J);A.strictEqual(KK.rjEtsi(P,'q9'),null);
// 1. Ryhmän ikkuna: arvo laskee rivijäsenet
var w=KK.addBlock(P,'ikkuna',{m:'sum'});var wn=N(P,w,600,0);wn.w=300;wn.h=240;w.wr=g.id;KK.repair(P);KK.wrSync(P,w,wn);KK.repair(P);KK.tick(P,C);
A.strictEqual(E(P).val(w.id),20,'4 + 6 + 10 (teksti ei luku)');
// 2. Jäsenille-ikkuna Joukko-palikasta
var pj=KK.addBlock(P,'pjoukko',{jj:J}),pjn=N(P,pj,0,400);
var wj=KK.addBlock(P,'ikkuna',{m:'cnt',jas:true}),wjn=N(P,wj,900,0);var kv=KK.addBlock(P,'kaava');kv.f=KK.kaavaToIds(P,'jäsen.rasti');N(P,kv,900,40,wjn.id);
KK.addLink(P,pjn.id,'jm',wjn.id,'jm');KK.repair(P);KK.tick(P,C);
A.deepStrictEqual(E(P).jasIn(wj.id),[a.id,b.id,'q1','q2'],'jäsenet + rivijäsenet');A.strictEqual(E(P).val(wj.id),1,'yksi rastitettu (rivijäsen)');
kv.f=KK.kaavaToIds(P,'jäsen.päivä.kuukausi = 10');KK.repair(P);KK.tick(P,C);A.strictEqual(E(P).val(wj.id),1,'rivijäsenen päivä jäsen-kaavassa');
kv.f=KK.kaavaToIds(P,'jäsen.kuu');KK.repair(P);KK.tick(P,C);var ve=E(P).val(wj.id);A.ok(KK.isErr(ve)&&/ei ole ominaisuutta|tuntematon/.test(ve.err),'tuntematon ominaisuus virheenä: '+JSON.stringify(ve));
// 3. Toiminto jokaiselle jäsenelle: .rasti kaikille, myös rivijäsenille
var t=KK.addBlock(P,'tee',{do:'aseta',oj:J,om:'rasti',v:'kyllä'}),tn=N(P,t,0,600);KK.repair(P);KK.runAction(P,t.id,C);KK.tick(P,C);
A.deepStrictEqual(KK.jkRivit(P,J).map(function(q){return q.c===true;}),[true,true]);A.strictEqual(E(P).prop(a.id,'rasti'),true);
var t2=KK.addBlock(P,'tee',{do:'vaihda',oj:J,om:'rasti'});N(P,t2,0,660);KK.repair(P);KK.runAction(P,t2.id,C);
A.deepStrictEqual(KK.jkRivit(P,J).map(function(q){return q.c===true;}),[false,false],'vaihda');
// arvo (Aseta ilman ominaisuutta) rivijäsenelle muuttaa tekstin; x ohitetaan
var t3=KK.addBlock(P,'tee',{do:'aseta',oj:J,om:'x',v:'5'});N(P,t3,0,720);KK.repair(P);KK.runAction(P,t3.id,C);A.deepStrictEqual(KK.jkRivit(P,J).map(function(q){return q.tx;}),['10','Soita 24.10.'],'x ohitetaan');
// 4. Toista jäsenille + Tapahtuman jäsen
var k=KK.addBlock(P,'ketju',{nm:'Ketju'}),kn=N(P,k,0,800);var to=KK.addBlock(P,'toista',{tapa:'jasenet'}),ton=N(P,to,0,60,kn.id);
var ta=KK.addBlock(P,'tee',{do:'aseta',otj:1,om:'rasti',v:'kyllä'}),tan=N(P,ta,0,120,kn.id);
var lk=KK.addBlock(P,'muisti',{v:'0'});N(P,lk,400,800);var tl=KK.addBlock(P,'tee',{do:'lisaa',o:lk.id}),tln=N(P,tl,0,180,kn.id);
KK.addLink(P,ton.id,'e',tan.id,'e');KK.addLink(P,tan.id,'e',tln.id,'e');KK.addLink(P,tln.id,'e',ton.id,'e');KK.addLink(P,pjn.id,'jm',ton.id,'jm');KK.repair(P);
KK.chainStart(P,k.id,C);var e=E(P);
A.strictEqual(e.val(lk.id),4,'kierros jokaiselle: 2 palikkaa + 2 rivijäsentä');A.deepStrictEqual(KK.jkRivit(P,J).map(function(q){return q.c===true;}),[true,true],'Tapahtuman jäsen = rivijäsen');
A.strictEqual(e.prop(b.id,'rasti'),true);
// Tapahtuman jäsen ilman ominaisuutta: ohitus kirjataan
var ta2=KK.addBlock(P,'tee',{do:'aseta',otj:1,om:'x',v:'1'});N(P,ta2,0,900);KK.repair(P);KK.runAction(P,ta2.id,{now:C.now,toast:C.toast,nav:C.nav,tev:{id:'e',src:'',nm:'',at:1,jasen:'q1'}});
A.ok(KK.JK_OHI[ta2.id]&&KK.JK_OHI[ta2.id].m==='10','ohitettu rivijäsen kirjataan');
// arvo Tapahtuman jäsenelle
var ta3=KK.addBlock(P,'tee',{do:'aseta',otj:1,v:'Soitettu'});N(P,ta3,0,960);KK.repair(P);KK.runAction(P,ta3.id,{now:C.now,toast:C.toast,nav:C.nav,tev:{id:'e',src:'',nm:'',at:1,jasen:'q2'}});
A.strictEqual(KK.jkRivit(P,J)[1].tx,'Soitettu');A.strictEqual(KK.jkRivit(P,J)[1].c,true,'rasti säilyy');
// Palauta poistaa rivijäsenet
P.st={};KK.tick(P,C);A.deepStrictEqual(E(P).jasIn(wj.id),[a.id,b.id]);A.strictEqual(E(P).val(w.id),10);
console.log('ok');
