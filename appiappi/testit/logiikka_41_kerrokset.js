// Appi-appi 9: kerrokset logiikasta. Kerros-palikka (näkyy, estää, himmennys, läpinäkyvyys), kerroksen omat asetukset
// perusarvona, etusija ohjattu > asetettu > perusarvo, piilotetun kerroksen palikat piilossa (myös este katoaa), muokkaus
// näkee kaikki, kaava, korjaus ja tallennus. Lisäksi ennätys tavallisilla palikoilla (Muisti + PIENIN-ikkuna + Aseta).
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g);}
function E(P){return KK.Ev(P,C);}
function mk(){var P=KK.newProject('kr');var vw=P.views[0].id;P.views[0].kr=[{id:'pohja',n:'Pohja'},{id:'k1',n:'Valikko',pk:true,es:true,him:40}];
  var alla=KK.addBlock(P,'nappi',{v:vw,tx:'Alla'}),men=KK.addBlock(P,'nappi',{v:vw,tx:'Jatka',kr:'k1'});KK.repair(P);return {P:P,vw:vw,alla:alla,men:men};}

// --- 1. Kerros-palikka: laji, kohdat ja ominaisuudet ---
var X=mk(),P=X.P;
var kb=KK.addBlock(P,'kerros',{vw:X.vw,kr:'k1'});N(P,kb);
A.strictEqual(KK.K.kerros.n,'Kerros');A.strictEqual(KK.K.kerros.g,'lg');
var pr=KK.ports(kb);A.deepStrictEqual(pr.outs.map(function(x){return x.p;}),['v']);A.deepStrictEqual(pr.ins.map(function(x){return x.p;}),['o_nakyy'],'näkyy-kohta auki valmiiksi');
A.deepStrictEqual(KK.omat(kb).map(function(e){return e.n;}),['arvo','näkyy','estää','himmennys','läpinäkyvyys','syvyys','joukot','nimi'],'jonon 17d: Kerros-palikan syvyys');
A.ok(KK.omat(kb).filter(function(e){return e.n!=='arvo'&&e.n!=='joukot'&&e.n!=='nimi';}).every(function(e){return e.o;}),'kaikki ohjattavia');
// --- 2. Perusarvo kerroksen asetuksista: piilossa käytössä, estää, himmennys ---
var ev=E(P);A.strictEqual(ev.val(kb.id),false,'pk → ei näy');A.strictEqual(ev.omi(kb.id,'estää'),true);A.strictEqual(ev.omi(kb.id,'himmennys'),40);A.strictEqual(ev.omi(kb.id,'läpinäkyvyys'),0);
A.strictEqual(ev.state(X.men.id),'piilossa','piilotetun kerroksen palikka');A.strictEqual(ev.visible(X.men.id),false);A.strictEqual(ev.prop(X.men.id,'näkyy'),false,'.näkyy kertoo kerroksen');
A.strictEqual(ev.state(X.men.id,true),'näkyy','muokatessa kerros ei piilota');A.strictEqual(ev.state(X.alla.id),'näkyy');
A.strictEqual(ev.layer(X.vw,'k1','nakyy'),false);A.strictEqual(ev.layer(X.vw,'pohja','nakyy'),true);A.strictEqual(ev.layer(X.vw,'','estaa'),false,'pohja ei estä');
// --- 3. Ilman Kerros-palikkaa kerros toimii omilla asetuksillaan ---
var Y=mk();var ey=E(Y.P);A.strictEqual(ey.state(Y.men.id),'piilossa');A.strictEqual(ey.layer(Y.vw,'k1','himmennys'),40);
Y.P.views[0].kr[1].pk=false;KK.repair(Y.P);A.strictEqual(Y.P.views[0].kr[1].pk,undefined,'pk vain true');A.strictEqual(E(Y.P).state(Y.men.id),'näkyy');
// --- 4. Toiminto Vaihda näkyy painikkeesta (asetettu), Palauta palauttaa perusarvoon ---
var av=KK.addBlock(P,'nappi',{v:X.vw,tx:'Valikko',beh:'kerta'}),tv=KK.addBlock(P,'tee',{do:'vaihda',o:kb.id,om:'nakyy'});KK.addLink(P,N(P,av).id,'e',N(P,tv).id,'e');
KK.press(P,av.id,C);ev=E(P);A.strictEqual(ev.val(kb.id),true,'avautui');A.strictEqual(ev.state(X.men.id),'näkyy');A.strictEqual(ev.omSrc(kb.id,KK.omFind(kb,'näkyy')),'asetettu');
KK.press(P,av.id,C);A.strictEqual(E(P).state(X.men.id),'piilossa','sulkeutui');KK.press(P,av.id,C);
var tp=KK.addBlock(P,'tee',{do:'palauta',o:kb.id});N(P,tp);KK.runAction(P,tp.id,C,0);A.strictEqual(E(P).val(kb.id),false,'Palauta → perusarvo');
// Aseta tila ei / on ominaisuuteen
var ts=KK.addBlock(P,'tee',{do:'tila',o:kb.id,om:'nakyy',ti:'on'});N(P,ts);KK.runAction(P,ts.id,C,0);A.strictEqual(E(P).val(kb.id),true);
ts.ti='ei';KK.runAction(P,ts.id,C,0);A.strictEqual(E(P).val(kb.id),false);
// Aseta himmennys ja läpinäkyvyys (rajat 0–100)
var th=KK.addBlock(P,'tee',{do:'aseta',o:kb.id,om:'himmennys',v:'150'});N(P,th);KK.runAction(P,th.id,C,0);A.strictEqual(E(P).layer(X.vw,'k1','himmennys'),100,'rajattu 100:aan');
var tl=KK.addBlock(P,'tee',{do:'aseta',o:kb.id,om:'lpn',v:'30'});N(P,tl);KK.runAction(P,tl.id,C,0);A.strictEqual(E(P).layer(X.vw,'k1','lpn'),30);
// --- 5. Ohjattu nuolesta voittaa asetetun (”pitää yllä”) ---
var ar=KK.addBlock(P,'kytkin',{v:X.vw,tx:'Pito'});KK.addLink(P,N(P,ar).id,'v',KK.nodesOfBlock(P,kb.id)[0].id,'o_nakyy');
ev=E(P);A.strictEqual(ev.val(kb.id),false,'kytkin pois');KK.userSet(P,ar.id,true,C);A.strictEqual(E(P).val(kb.id),true);A.strictEqual(E(P).state(X.men.id),'näkyy');
KK.press(P,av.id,C);A.strictEqual(E(P).val(kb.id),true,'Vaihda ei kumoa nuolta');KK.userSet(P,ar.id,false,C);A.strictEqual(E(P).state(X.men.id),'piilossa');
// --- 6. Kaava lukee kerrosta: valikko.näkyy ja valikko.estää ---
KK.setVt(P,kb.id,'valikko');var kf=KK.addBlock(P,'kaava',{});N(P,kf);kf.f=KK.kaavaToIds(P,'valikko.näkyy == ei');
var kv=E(P).val(kf.id);A.strictEqual(kv,true,'ei valikko.näkyy = kyllä, kun valikko ei näy');
// --- 7. Piilotetun kerroksen palikka ei ole este; kun kerros näkyy, on ---
var Z=mk();Z.P.views[0].kr[1].este=true;var se=KK.addBlock(Z.P,'muoto',{v:Z.vw,kr:'k1'});se.x=100;se.y=0;se.w=40;se.h=200;KK.repair(Z.P);
A.strictEqual(KK.onEste(Z.P,E(Z.P),se),false,'piilossa ei este');delete Z.P.views[0].kr[1].pk;A.strictEqual(KK.onEste(Z.P,E(Z.P),se),true,'näkyvä on este');
// --- 8. Muut näkymän palikat: Alue ja Sijainti eivät piiloudu kerroksen mukana ---
var Q=mk();var al=KK.addBlock(Q.P,'alue',{v:Q.vw,kr:'k1'});A.strictEqual(E(Q.P).layerShown(al),true);
// --- 9. Kerros-palikka ilman kerrosta tai tuntemattomaan kerrokseen: näkyy, ei estä ---
var kb2=KK.addBlock(P,'kerros',{});N(P,kb2);A.strictEqual(E(P).val(kb2.id),true);A.strictEqual(E(P).omi(kb2.id,'estää'),false);
kb2.kr='k9';kb2.vw=X.vw;A.strictEqual(E(P).val(kb2.id),true);
// Kaksi Kerros-palikkaa samaan kerrokseen: ensimmäinen ratkaisee
var kb3=KK.addBlock(P,'kerros',{vw:X.vw,kr:'k1'});N(P,kb3);KK.setOmi(P,kb3.id,'nakyy',true);A.strictEqual(E(P).state(X.men.id),'piilossa','ensimmäinen ratkaisee');
// --- 10. Korjaus: kelvottomat arvot pois, kerroksen pk/es/him/lp, pohjan asetukset säilyvät ---
var R=KK.newProject('r');R.views[0].kr=[{id:'pohja',n:'Pohja',es:'joo',him:'40',lp:-5}];KK.repair(R);A.deepStrictEqual(R.views[0].kr,[{id:'pohja',n:'Pohja',him:40}]);
R.views[0].kr=[{id:'pohja',n:'Pohja',pk:true,lp:250}];KK.repair(R);A.deepStrictEqual(R.views[0].kr,[{id:'pohja',n:'Pohja',pk:true,lp:100}]);
var rb=KK.addBlock(R,'kerros',{vw:5,kr:null});N(R,rb);KK.repair(R);A.strictEqual(rb.vw,'');A.strictEqual(rb.kr,'');
// --- 11. Tallennus: JSON-kierros säilyttää kerroksen asetukset ja asetetun arvon ---
KK.setOmi(P,kb.id,'estaa',false);var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);
A.strictEqual(E(P2).omi(kb.id,'estää'),false);A.strictEqual(P2.views[0].kr[1].es,true);A.strictEqual(P2.views[0].kr[1].pk,true);A.strictEqual(E(P2).state(X.men.id),'piilossa');
// --- 12. Vanha projekti ilman kerrosasetuksia ennallaan ---
var O=KK.newProject('o');var ob=KK.addBlock(O,'nappi',{v:O.views[0].id});KK.repair(O);A.strictEqual(E(O).state(ob.id),'näkyy');A.strictEqual(O.views[0].kr,undefined);

// --- 13. Ennätys tavallisilla palikoilla: Muisti (ennätys) + PIENIN-ikkuna (ennätys, tulos) + Aseta ennätys ← ikkuna ---
var G=KK.newProject('g');var tul=KK.addBlock(G,'muisti',{v:''}),enn=KK.addBlock(G,'muisti',{v:''});
var ik=KK.addBlock(G,'ikkuna',{m:'minv'}),ikn=N(G,ik);N(G,tul,ikn.id);N(G,enn,ikn.id);
var as=KK.addBlock(G,'tee',{do:'aseta',o:enn.id}),asn=N(G,as);KK.addLink(G,ikn.id,'v',asn.id,'v');
var maali=KK.addBlock(G,'nappi',{v:G.views[0].id,beh:'kerta'});KK.addLink(G,N(G,maali).id,'e',asn.id,'e');KK.repair(G);
function kierros(aika){KK.userSet(G,tul.id,aika,C);KK.press(G,maali.id,C);return E(G).val(enn.id);}
A.strictEqual(kierros(42.5),42.5,'ensimmäinen tulos on ennätys');A.strictEqual(kierros(50),42.5,'huonompi ei muuta');A.strictEqual(kierros(38),38,'parempi muuttaa');
console.log('logiikka_41_kerrokset ok');
