// Versio 5: viite (lyhyt nimi), kaavapalikka, ominaisuudet kaavassa (.näkyy, .tila, .teksti),
// harmaana kun -kohta ja sääntö ”rajoittavin voittaa”, kaava tekstin kohtaan, {viite} tekstissä.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,14,9,30);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g||'');}
function V(P,b,p){return KK.Ev(P,C).val(b.id,p);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}

// --- Viite ---
var P=KK.newProject('viite');
var uni=KK.addBlock(P,'saadin',{nm:'Uni',min:0,max:12,start:6});
A.strictEqual(uni.vt,'uni','viite tulee nimestä');
var uni2=KK.addBlock(P,'saadin',{nm:'Uni 2'});A.strictEqual(uni2.vt,'uni2','välilyönti pois');
var p3=KK.addBlock(P,'luku',{nm:'3. kysymys'});A.strictEqual(p3.vt,'p3kysymys','ei ala numerolla');
var ei=KK.addBlock(P,'kytkin',{nm:'Ei'});A.strictEqual(ei.vt,'ei2','varattu sana ei kelpaa viitteeksi');
KK.setName(P,uni2.id,'Unen laatu');A.strictEqual(uni2.vt,'unenlaatu','viite seuraa nimeä');
A.strictEqual(KK.setVt(P,uni2.id,'u2'),'');A.strictEqual(uni2.vt,'u2');A.strictEqual(uni2.vtSet,true);
KK.setName(P,uni2.id,'Laatu');A.strictEqual(uni2.vt,'u2','itse asetettu viite pysyy, vaikka nimi vaihtuu');
A.ok(/käytössä palikalla ”Uni”/.test(KK.setVt(P,uni2.id,'uni')),'tupla estetään');A.strictEqual(uni2.vt,'u2');
A.ok(/varattu/.test(KK.setVt(P,uni2.id,'tänään')));A.ok(/vain kirjaimia/.test(KK.setVt(P,uni2.id,'2x')));
A.strictEqual(KK.setVt(P,uni2.id,''),'');A.strictEqual(uni2.vt,'laatu','tyhjä = takaisin nimestä');A.ok(!uni2.vtSet);
A.strictEqual(KK.setVt(P,uni2.id,'U2'),'');A.strictEqual(uni2.vt,'u2','pienet kirjaimet');
// repair: tupla ja puuttuva korjataan, ensimmäinen säilyy
uni2.vt='uni';delete p3.vt;KK.repair(P);A.strictEqual(uni.vt,'uni');A.strictEqual(uni2.vt,'laatu');A.strictEqual(p3.vt,'p3kysymys');
KK.setVt(P,uni2.id,'u2');

// --- Kaava: vertailu, lasku, päivämäärä, teksti ---
var k1=K(P,'uni > 7');A.strictEqual(k1.f,'{#'+uni.id+'} > 7','viite tallentuu tunnisteena');
A.strictEqual(KK.kaavaToText(P,k1.f),'uni > 7');A.strictEqual(V(P,k1),false);
KK.userSet(P,uni.id,8,C);A.strictEqual(V(P,k1),true,'uni 8 > 7');
var k2=K(P,'uni + u2 * 2');KK.userSet(P,uni2.id,3,C);A.strictEqual(V(P,k2),14,'kertolasku ensin');
A.strictEqual(V(P,K(P,'= 10 / 4')),2.5,'alun = sallitaan');A.strictEqual(V(P,K(P,'7,5 - 0.5')),7,'pilkku ja piste desimaaleina');
A.strictEqual(V(P,K(P,'-uni + 10')),2);A.strictEqual(V(P,K(P,'10 : 4')),2.5,'kaksoispiste jakona');
A.deepStrictEqual(V(P,K(P,'tänään + 5')),{d:'2026-10-19'});
A.strictEqual(V(P,K(P,'24.12.2026 - tänään')),71,'päiviä jouluun');
A.strictEqual(V(P,K(P,'tänään < 1.11.')),true,'lyhyt päivämäärä tältä vuodelta');
A.strictEqual(V(P,K(P,'"Unta " + uni + " h"')),'Unta 8 h','tekstit yhteen');
A.strictEqual(V(P,K(P,'uni ≥ 8')),true);A.strictEqual(V(P,K(P,'uni != 8')),false);A.strictEqual(V(P,K(P,'uni <> 7')),true);
A.strictEqual(V(P,K(P,'')),null,'tyhjä kaava = tyhjä');
// virheet selvällä suomella
function err(s,re){var v=V(P,K(P,s));A.ok(KK.isErr(v),s);A.ok(re.test(v.err),s+' → '+v.err);}
err('(uni + 1) > 7',/sulkuja ei käytetä/);err('uni > 7 > 2',/vain yksi vertailu/);err('uni >',/kesken/);err('uni 7',/ylimääräistä/);
err('unni > 7',/puuttuu: unni/);err('"auki',/lainausmerkki/);err('uni # 2',/tuntematon merkki/);err('uni / 0',/jako nollalla/);
err('uni.maku',/tuntematon ominaisuus/);err('k1x.näkyy',/puuttuu/);

// --- Poisto ja palautuminen: viittaus muuttuu puuttuvaksi ja löytyy taas samalla viitteellä ---
var Q=KK.newProject('poisto');var u=KK.addBlock(Q,'luku',{nm:'Uni',start:9});var kq=K(Q,'uni > 7');A.strictEqual(V(Q,kq),true);
KK.removeBlock(Q,u.id);A.strictEqual(kq.f,'{?uni} > 7');A.ok(/puuttuu: uni/.test(V(Q,kq).err));A.strictEqual(KK.kaavaToText(Q,kq.f),'uni > 7');
var u3=KK.addBlock(Q,'luku',{nm:'Uni',start:5});KK.repair(Q);A.strictEqual(kq.f,'{#'+u3.id+'} > 7','sama viite löytyy taas');A.strictEqual(V(Q,kq),false);
kq.f='{#b999} > 1';KK.repair(Q);A.strictEqual(kq.f,'{?} > 1','tuntematon tunniste');A.ok(KK.isErr(V(Q,kq)));
// nimen ja viitteen vaihto ei riko kaavaa
kq.f=KK.kaavaToIds(Q,'uni + 1');KK.setVt(Q,u3.id,'u');A.strictEqual(KK.kaavaToText(Q,kq.f),'u + 1');A.strictEqual(V(Q,kq),6);
// {Nimi} kaavassa: nimi, jossa on välilyönti
var lk=KK.addBlock(Q,'luku',{nm:'Lasten uni',start:10});kq.f=KK.kaavaToIds(Q,'{Lasten uni} - u');A.strictEqual(V(Q,kq),5);

// --- Kaava ikkunassa: ikkuna hoitaa sulut ---
var W=KK.newProject('ikkuna');var s1=KK.addBlock(W,'saadin',{nm:'Uni',start:8}),s2=KK.addBlock(W,'saadin',{nm:'Liike',start:2});
var ja=KK.addBlock(W,'ikkuna',{m:'and'});var wn=N(W,ja);
var ka=KK.addBlock(W,'kaava',{f:''});N(W,ka,wn.id);ka.f=KK.kaavaToIds(W,'uni > 7');
var kb=KK.addBlock(W,'kaava',{f:''});N(W,kb,wn.id);kb.f=KK.kaavaToIds(W,'liike >= 3');KK.repair(W);
A.strictEqual(V(W,ja),false,'liike 2');KK.userSet(W,s2.id,3,C);A.strictEqual(V(W,ja),true,'molemmat pätevät');
A.strictEqual(KK.Ev(W,C).members(ja.id).length,2);
var wy=KK.why(W,KK.Ev(W,C),ja.id,3);A.ok(wy.kids.some(function(k){return k.id===ka.id&&/Kaava: uni > 7/.test(k.txt);}),'Miksi? näyttää kaavan');
A.ok(KK.why(W,KK.Ev(W,C),ka.id,2).kids.some(function(k){return k.id===s1.id;}),'Miksi? kaavan lähteet');
var D=KK.deps(W);A.ok(D.usedBy[s1.id].some(function(x){return x.id===ka.id&&x.how==='kaava';}),'Yhteydet: kaavassa');

// --- Kaava napin tekstiin ja {viite} tekstissä ---
var X=KK.newProject('teksti');var kev=KK.addBlock(X,'arvo',{nm:'Kuinka kevyt päivä valitaan',v:'Kevyt päivä',vt:'kevyt'});N(X,kev);
A.strictEqual(kev.vt,'kevyt');
var nap=KK.addBlock(X,'nappi',{tx:'Vanha'});var nn=N(X,nap);var kx=KK.addBlock(X,'kaava');var kn=N(X,kx);kx.f=KK.kaavaToIds(X,'kevyt');
A.ok(KK.addLink(X,kn.id,'v',nn.id,'tx'));KK.repair(X);A.strictEqual(KK.Ev(X,C).text(nap.id),'Kevyt päivä','kaavan tulos on napin teksti');
var ot=KK.addBlock(X,'nayta');ot.tx=KK.toIds(X,'Tänään: {kevyt}');A.strictEqual(KK.Ev(X,C).text(ot.id),'Tänään: Kevyt päivä','{viite} tekstissä');
A.strictEqual(KK.toNames(X,ot.tx),'Tänään: {Kuinka kevyt päivä valitaan}','muokatessa näkyy nimi');

// --- Tilat: näkyy, tila, teksti kaavassa; monta näkyy kun -nuolta; harmaana kun; rajoittavin voittaa ---
var S=KK.newProject('tila');var a=KK.addBlock(S,'kytkin',{nm:'A'}),bb=KK.addBlock(S,'kytkin',{nm:'B'}),c=KK.addBlock(S,'kytkin',{nm:'C'});
var tgt=KK.addBlock(S,'nappi',{nm:'Kohde',tx:'Jatka'});var na=N(S,a),nb=N(S,bb),nc=N(S,c),nt=N(S,tgt);
KK.addLink(S,na.id,'v',nt.id,'nk');KK.addLink(S,nb.id,'v',nt.id,'nk');
A.strictEqual(S.lg.l.filter(function(l){return l.tp==='nk';}).length,2,'kaksi näkyy kun -nuolta jää voimaan');
KK.repair(S);var E=function(){return KK.Ev(S,C);};
A.strictEqual(E().visible(tgt.id),false);KK.userSet(S,a.id,true,C);A.strictEqual(E().visible(tgt.id),false,'vain toinen pätee');
KK.userSet(S,bb.id,true,C);A.strictEqual(E().visible(tgt.id),true,'kaikki pätevät');A.strictEqual(E().state(tgt.id),'näkyy');
KK.addLink(S,nc.id,'v',nt.id,'hk');KK.userSet(S,c.id,true,C);A.strictEqual(E().state(tgt.id),'harmaa','harmaana kun pätee');
A.ok(/Harmaana, kun C pätee/.test(KK.why(S,E(),tgt.id,2).txt));
KK.userSet(S,a.id,false,C);A.strictEqual(E().state(tgt.id),'piilossa','piilossa voittaa harmaan');
tgt.nkt='luku';A.strictEqual(E().state(tgt.id),'harmaa','harmaa voittaa vain luettavan');
KK.userSet(S,c.id,false,C);A.strictEqual(E().state(tgt.id),'luettava');tgt.nkt='harmaa';A.strictEqual(E().state(tgt.id),'harmaa');
// harmaana-asetus ilman nuolta
var ss=KK.addBlock(S,'luku',{nm:'Syöte',hk:{m:'kun',r:a.id}});A.strictEqual(E().state(ss.id),'näkyy');KK.userSet(S,a.id,true,C);A.strictEqual(E().state(ss.id),'harmaa');
ss.hk.m='eikun';A.strictEqual(E().state(ss.id),'näkyy');ss.hk={m:'kun',r:'b999'};KK.repair(S);A.strictEqual(ss.hk,undefined,'poistettu viittaus siivoutuu');
// ominaisuudet kaavassa
A.strictEqual(V(S,K(S,'kohde.näkyy')),true);A.strictEqual(V(S,K(S,'kohde.tila = näkyy')),true);
KK.userSet(S,c.id,true,C);A.strictEqual(V(S,K(S,'kohde.tila')),'harmaa');A.strictEqual(V(S,K(S,'kohde.tila = harmaa')),true);
A.strictEqual(V(S,K(S,'kohde.teksti + "!"')),'Jatka!');A.strictEqual(V(S,K(S,'a.arvo = kyllä')),true);A.strictEqual(V(S,K(S,'a = kyllä')),true);
var li=KK.addBlock(S,'lista',{rivit:'x\ny\nz'});KK.setVt(S,li.id,'lista');A.strictEqual(V(S,K(S,'lista.rivejä')),3);A.strictEqual(V(S,K(S,'lista.kaikki')),false);
var lg=KK.addBlock(S,'arvo',{nm:'Luku',v:3});N(S,lg);A.ok(/vain näkymän palikoilla/.test(V(S,K(S,'luku.näkyy')).err));
// kehä: kaava, joka lukee palikan näkyvyyttä ja ohjaa sitä, ei jäädy
var Z=KK.newProject('kehä');var zb=KK.addBlock(Z,'nappi',{nm:'Z'});var zn=N(Z,zb);var zk=KK.addBlock(Z,'kaava');var zkn=N(Z,zk);zk.f=KK.kaavaToIds(Z,'z.näkyy');
KK.addLink(Z,zkn.id,'v',zn.id,'nk');KK.repair(Z);KK.tick(Z,C);var zv=V(Z,zk);A.ok(KK.isErr(zv)&&/kehä/.test(zv.err),'kehä näkyy virheenä');A.strictEqual(KK.Ev(Z,C).visible(zb.id),false);

// --- Kerran vai jatkuvasti: kaava → toiminto valitsee kytkimen kerran, käyttäjä voi muuttaa sen jälkeen ---
var O=KK.newProject('kerran');var su=KK.addBlock(O,'saadin',{nm:'Uni',start:5}),kt=KK.addBlock(O,'kytkin',{nm:'Kevyt päivä'});
var ko=KK.addBlock(O,'kaava'),te=KK.addBlock(O,'tee',{do:'valitse',o:kt.id});var kon=N(O,ko),ten=N(O,te);ko.f=KK.kaavaToIds(O,'uni < 6');
KK.addLink(O,kon.id,'v',ten.id,'e');KK.repair(O);KK.tick(O,C);
A.strictEqual(V(O,kt),false,'avaaminen ei laukaise');KK.userSet(O,su.id,7,C);KK.userSet(O,su.id,4,C);A.strictEqual(V(O,kt),true,'kun alkaa päteä: valitaan kerran');
KK.userSet(O,kt.id,false,C);A.strictEqual(V(O,kt),false,'käyttäjä voi painaa pois');KK.userSet(O,su.id,3,C);A.strictEqual(V(O,kt),false,'ei valita uudelleen, ennen kuin ehto on välillä lakannut');
KK.userSet(O,su.id,8,C);KK.userSet(O,su.id,2,C);A.strictEqual(V(O,kt),true,'uusi alku valitsee taas');

// --- Vanha projekti saa viitteet, eikä muuta muutu ---
var old=KK.newProject('vanha');var ob=KK.addBlock(old,'kytkin',{nm:'Näytä'});delete ob.vt;var on=N(old,ob);var before=JSON.stringify(old);
KK.repair(old);A.strictEqual(ob.vt,'näytä','vanha palikka saa viitteen');delete ob.vt;A.strictEqual(JSON.stringify(old),before,'muu ennallaan');
A.ok(KK.VER>=5);
console.log('ok kaava');
