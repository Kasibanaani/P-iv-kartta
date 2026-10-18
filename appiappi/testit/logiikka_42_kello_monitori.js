// Appi-appi 9: Sekuntikello (käynnistä, pysäytä, nollaa, käy kun, kulunut, käy, aika-arvo, kuvasilmukka, tallennus ja
// appi kiinni, korjaus) ja Monitori (kohdat, arvo ominaisuutena nuolesta / kaavasta / toiminnolla, muoto ja esitys, korjaus).
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g);}
function E(P){return KK.Ev(P,C);}
function nappi(P,kohde,port){var n=KK.addBlock(P,'nappi',{v:P.views[0].id,beh:'kerta'});KK.addLink(P,N(P,n).id,'e',KK.nodesOfBlock(P,kohde.id)[0].id,port);return n;}

// --- 1. Sekuntikello: laji, kohdat, ominaisuudet ---
var P=KK.newProject('k');var k=KK.addBlock(P,'kello');N(P,k);
A.strictEqual(KK.K.kello.n,'Sekuntikello');
var pr=KK.ports(k);A.deepStrictEqual(pr.ins.map(function(x){return x.p+x.t;}),['ee','xe','ne','cv']);A.deepStrictEqual(pr.outs.map(function(x){return x.p+x.t;}),['vv','rv']);
A.deepStrictEqual(KK.omat(k).map(function(e){return e.n;}),['arvo','käy','kulunut','joukot']);
A.strictEqual(E(P).val(k.id),0,'alussa 0');A.strictEqual(E(P).val(k.id,'r'),false);
// --- 2. Käynnistä, kulu, pysäytä, jatka, nollaa ---
var go=nappi(P,k,'e'),st=nappi(P,k,'x'),nl=nappi(P,k,'n');KK.repair(P);
KK.press(P,go.id,C);A.strictEqual(E(P).val(k.id,'r'),true);T+=2500;A.strictEqual(E(P).val(k.id),2.5);A.strictEqual(E(P).prop(k.id,'kulunut'),2.5);A.strictEqual(E(P).prop(k.id,'käy'),true);
KK.press(P,go.id,C);T+=500;A.strictEqual(E(P).val(k.id),3,'uusi käynnistys ei nollaa');
KK.press(P,st.id,C);T+=10000;A.strictEqual(E(P).val(k.id),3,'pysäytetty ei kulu');A.strictEqual(E(P).val(k.id,'r'),false);
KK.press(P,go.id,C);T+=1000;A.strictEqual(E(P).val(k.id),4,'jatkaa siitä');
KK.press(P,nl.id,C);A.strictEqual(E(P).val(k.id),0);T+=1500;A.strictEqual(E(P).val(k.id),1.5,'nollaus käydessä jatkaa nollasta');
KK.press(P,st.id,C);KK.press(P,nl.id,C);T+=1500;A.strictEqual(E(P).val(k.id),0,'pysäytettynä nollaus pysyy nollassa');
// --- 3. Kuvasilmukka: käyvä kello pitää silmukan käynnissä ja KUN-ehto huomaa ajan ---
A.strictEqual(KK.frame(P,0,C),false,'seis → ei silmukkaa');KK.press(P,go.id,C);A.strictEqual(KK.frame(P,0.016,C),true,'käy → silmukka');
var vv=KK.addBlock(P,'vert',{op:'ge',b:'5'}),vn=N(P,vv);KK.addLink(P,KK.nodesOfBlock(P,k.id)[0].id,'v',vn.id,'a');
var kun=KK.addBlock(P,'kun',{}),kn=N(P,kun);KK.addLink(P,vn.id,'v',kn.id,'c');var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var tm=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,kn.id,'e',N(P,tm).id,'e');KK.repair(P);
KK.tick(P,C);for(var i=0;i<400;i++){T+=16;KK.frame(P,0.016,C);}A.ok(E(P).val(k.id)>6);A.strictEqual(E(P).val(m.id),1,'yli 5 s → tapahtuma kerran');
// --- 4. Aika-arvo: ajastimen kesto ja timeSrc sekunteina ---
A.strictEqual(E(P).timeSrc(vv.id,'a'),true,'kello on aika-arvo');
// --- 5. Käy kun: kello käy täsmälleen, kun ehto pätee ---
var Q=KK.newProject('q');var k2=KK.addBlock(Q,'kello');N(Q,k2);var kyt=KK.addBlock(Q,'kytkin',{v:Q.views[0].id});KK.addLink(Q,N(Q,kyt).id,'v',KK.nodesOfBlock(Q,k2.id)[0].id,'c');KK.repair(Q);
KK.tick(Q,C);T+=1000;A.strictEqual(E(Q).val(k2.id),0,'ehto ei päde → seis');
KK.userSet(Q,kyt.id,true,C);T+=2000;A.strictEqual(E(Q).val(k2.id),2);A.strictEqual(E(Q).val(k2.id,'r'),true);
KK.userSet(Q,kyt.id,false,C);T+=2000;A.strictEqual(E(Q).val(k2.id),2,'ehto pois → seis');
// --- 6. Tallennus ja appi kiinni: aika kuluu kellon mukaan ---
KK.userSet(Q,kyt.id,true,C);var Q2=JSON.parse(JSON.stringify(Q));T+=60000;KK.repair(Q2);A.strictEqual(E(Q2).val(k2.id),62,'minuutti kiinni = minuutti lisää');
// --- 7. Korjaus: rikkinäinen tila pois ---
Q2.st[k2.id]={run:true,acc:'x'};KK.repair(Q2);A.strictEqual(Q2.st[k2.id],undefined);A.strictEqual(E(Q2).val(k2.id),0);
Q2.st[k2.id]='rikki';KK.repair(Q2);A.strictEqual(Q2.st[k2.id],undefined);

// --- 8. Monitori: laji, kohdat, ominaisuudet ---
var M=KK.newProject('m');var vw=M.views[0].id;var mo=KK.addBlock(M,'mittari',{v:vw});
A.strictEqual(KK.K.mittari.n,'Monitori');A.strictEqual(KK.K.mittari.sub,'naytto');
var mp=KK.ports(mo);A.deepStrictEqual(mp.outs,[],'ei omaa arvo-lähtöä');A.ok(mp.ins.some(function(x){return x.p==='o_arvo';}),'arvo-kohta valmiiksi auki');
var nimet=KK.omat(mo).map(function(e){return e.n;});['arvo','pienin','suurin','muoto','esitys','paksuus','näkyy','x','väri'].forEach(function(n){A.ok(nimet.indexOf(n)>=0,n);});
var em=E(M);A.strictEqual(em.omi(mo.id,'arvo'),0);A.strictEqual(em.omi(mo.id,'suurin'),100);A.strictEqual(em.omi(mo.id,'muoto'),'palkki');A.strictEqual(em.omi(mo.id,'esitys'),'luku');A.strictEqual(em.omi(mo.id,'paksuus'),12);
// --- 9. Arvo nuolesta: sekuntikello → monitori elää ajassa ---
var k3=KK.addBlock(M,'kello');N(M,k3);var mn=N(M,mo);KK.addLink(M,KK.nodesOfBlock(M,k3.id)[0].id,'v',mn.id,'o_arvo');KK.repair(M);
KK.kelloKomento(M,k3.id,'e',C);T+=1234;A.strictEqual(E(M).omi(mo.id,'arvo'),1.234);A.strictEqual(E(M).omSrc(mo.id,KK.omFind(mo,'arvo')),'nuoli');
// Kaava monitorin arvoon ja monitorin arvo kaavassa
KK.setVt(M,mo.id,'mittari');var kf=KK.addBlock(M,'kaava',{});N(M,kf);kf.f=KK.kaavaToIds(M,'mittari.arvo * 2');A.strictEqual(E(M).val(kf.id),2.468);
// --- 10. Toiminnot: Aseta ja Lisää monitorin arvoon (ilman nuolta), muoto ja esitys valintana ---
var M2=KK.newProject('m2');var mo2=KK.addBlock(M2,'mittari',{v:M2.views[0].id,va:7});
A.strictEqual(E(M2).omi(mo2.id,'arvo'),7,'perusarvo');
var ta=KK.addBlock(M2,'tee',{do:'aseta',o:mo2.id,om:'arvo',v:'42'});N(M2,ta);KK.runAction(M2,ta.id,C,0);A.strictEqual(E(M2).omi(mo2.id,'arvo'),42);
var tl=KK.addBlock(M2,'tee',{do:'lisaa',o:mo2.id,om:'arvo',v:'-2'});N(M2,tl);KK.runAction(M2,tl.id,C,0);A.strictEqual(E(M2).omi(mo2.id,'arvo'),40);
var tmu=KK.addBlock(M2,'tee',{do:'aseta',o:mo2.id,om:'muoto',v:'4'});N(M2,tmu);KK.runAction(M2,tmu.id,C,0);A.strictEqual(E(M2).omi(mo2.id,'muoto'),'rengas','4 = rengas');
tmu.v='kaari';KK.runAction(M2,tmu.id,C,0);A.strictEqual(E(M2).omi(mo2.id,'muoto'),'kaari');
var tes=KK.addBlock(M2,'tee',{do:'aseta',o:mo2.id,om:'esitys',v:'aika'});N(M2,tes);KK.runAction(M2,tes.id,C,0);A.strictEqual(E(M2).omi(mo2.id,'esitys'),'aika');
A.ok(KK.isErr(KK.omNorm(KK.omFind(mo2,'muoto'),'kolmio')),'tuntematon muoto on virhe');
var tp=KK.addBlock(M2,'tee',{do:'aseta',o:mo2.id,om:'paksuus',v:'90'});N(M2,tp);KK.runAction(M2,tp.id,C,0);A.strictEqual(E(M2).omi(mo2.id,'paksuus'),50,'paksuus enintään 50');
// --- 11. Korjaus: tuntematon muoto ja esitys oletuksiin, näkymän tunniste säilyy ---
mo2.muoto='kolmio';mo2.esit='x';KK.repair(M2);A.strictEqual(mo2.muoto,'palkki');A.strictEqual(mo2.esit,'luku');A.strictEqual(mo2.v,M2.views[0].id);
var M3=JSON.parse(JSON.stringify(M2));KK.repair(M3);A.strictEqual(E(M3).omi(mo2.id,'arvo'),40,'asetettu arvo tallentuu');
console.log('logiikka_42_kello_monitori ok');
