// F08 rakenteinen historia: Kirjaa-toiminto kirjoittaa tavalliseen Tietotaulukkoon, jossa automaattiset sarakkeet
// aika ja id. Kirjausta muokataan ja poistetaan kuten riviä. Historian haut (viimeisin, edellisestä, tänään, aika.päivä),
// päivän raja projektin asetuksena (oletus keskiyö), Aikajana ja Kalenteri samasta lähteestä, vanhan tekstiaikajanan
// muunnos vain napista. Koeappi A: kohde, määrä ja aika; tilannekuva pysyy, elävä viite muuttuu; puuttuva ei ole 0.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,12,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,'');return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function kv(P,f){return val(P,kaava(P,f).b.id);}
function aja(P,b){TOASTS.length=0;return KK.runAction(P,b.id,C,0);}
function at(y,m,d,h,mi){return new Date(y,m-1,d,h,mi||0).getTime();}

// 1. Kirjaushistoriaksi: Aika ja Id alkuun, olemassa olevat sarakkeet säilyvät
var P=KK.newProject('historia');
var tuot=blk(P,'taulu',{nm:'Tuotteet'});var tN=KK.addCol(tuot.b,'Nimi','teksti'),tH=KK.addCol(tuot.b,'Hinta','luku');
var rMaito=KK.tAddRow(P,tuot.b.id,false);KK.tEdit(P,tuot.b.id,false,rMaito,tN.id,'Maito',new Date(NOW));KK.tEdit(P,tuot.b.id,false,rMaito,tH.id,'2',new Date(NOW));
var L=blk(P,'taulu',{nm:'Loki'});var cK=KK.addCol(L.b,'Kohde','viite',{tt:tuot.b.id}),cM=KK.addCol(L.b,'Määrä','luku'),cS=KK.addCol(L.b,'Yht','luku');
A.strictEqual(KK.histCol(L.b),null,'ei vielä historiaa');
var ac=KK.histMake(L.b);A.deepStrictEqual(KK.tSar(L.b).map(function(c){return c.vt;}),['aika','id','kohde','määrä','yht']);
A.strictEqual(ac.auto,'aika');A.strictEqual(ac.laji,'aika');A.strictEqual(KK.colAuto(L.b,'id').laji,'teksti');
KK.histMake(L.b);A.strictEqual(KK.tSar(L.b).length,5,'toinen kerta ei kahdenna');KK.repair(P);
// 2. Kirjaa-toiminto: aika täyttyy, kentät kopioidaan (tilannekuva), id = rivin tunniste
var kir=blk(P,'tee',{do:'kirjaa',o:L.b.id});kir.b.kv={};kir.b.kv[cK.id]=KK.kaavaToIds(P,'tuotteet.eka');kir.b.kv[cM.id]='2';kir.b.kv[cS.id]=KK.kaavaToIds(P,'tuotteet.eka.hinta * 2');
A.strictEqual(KK.tauluIssue(P,kir.b,L.b),'');
NOW=at(2026,10,17,9,30);var r=aja(P,kir.b);A.ok(r&&r.ev&&KK.isR(r.ev.rivi),'sitten-tapahtuma kertoo rivin: '+JSON.stringify(r));
var rows=KK.tRows(P,L.b.id);A.strictEqual(rows.length,1);A.strictEqual(rows[0].a[ac.id].ms,at(2026,10,17,9,30),'aika = kirjaushetki');
A.ok(!rows[0].a.hasOwnProperty(KK.colAuto(L.b,'id').id),'id:tä ei tallenneta kenttään');
A.strictEqual(kv(P,'loki.vika.id'),rows[0].id,'id luetaan rivin tunnisteena');A.strictEqual(kv(P,'loki.vika.yht'),4);
// tilannekuva pysyy, elävä viite muuttuu (koeappi A)
KK.tEdit(P,tuot.b.id,false,rMaito,tH.id,'3',new Date(NOW));A.strictEqual(kv(P,'loki.vika.yht'),4,'tilannekuva pysyy');A.strictEqual(kv(P,'loki.vika.kohde.hinta'),3,'elävä viite muuttuu');
// puuttuva luku ei ole nolla
delete kir.b.kv[cM.id];NOW=at(2026,10,17,10,0);aja(P,kir.b);A.ok(KK.isMiss(kv(P,'loki.vika.määrä')),'tyhjä määrä puuttuu');A.strictEqual(kv(P,'loki.määrä.summa'),2);A.strictEqual(kv(P,'loki.määrä.puuttuvia'),1);
// 3. Id ei ole muokattavissa; aikaa voi korjata kuten muuta kenttää
var idc=KK.colAuto(L.b,'id');A.ok(KK.isErr(KK.tEdit(P,L.b.id,true,rows[0].id,idc.id,'x',new Date(NOW))),'id ei muokattavissa');
// 4. viimeisin = suurin aika, ei viimeinen rivi
var first=KK.tRows(P,L.b.id)[0].id,second=KK.tRows(P,L.b.id)[1].id;A.strictEqual(kv(P,'loki.viimeisin').ri,second);
KK.tEdit(P,L.b.id,true,first,ac.id,'17.10.2026 11.15',new Date(NOW));A.strictEqual(kv(P,'loki.viimeisin').ri,first,'korjattu aika tekee siitä uusimman');
A.strictEqual(kv(P,'loki.vika').ri,second,'vika on yhä taulukon viimeinen rivi');A.strictEqual(kv(P,'loki.viimeisin.yht'),4);
var kf=kaava(P,'loki.viimeisin.määrä + 1');A.ok(/viimeisin\.c\d+/.test(kf.b.f),'tallessa tunnisteena: '+kf.b.f);KK.setColName(L.b,cM.id,'Kpl');A.strictEqual(KK.kaavaToText(P,kf.b.f),'loki.viimeisin.kpl + 1');KK.setColName(L.b,cM.id,'Määrä');
// 5. edellisestä (minuutteja) ja tänään
NOW=at(2026,10,17,12,0);A.strictEqual(kv(P,'loki.edellisestä'),45);A.strictEqual(kv(P,'loki.edellisesta'),45);A.strictEqual(kv(P,'loki.tänään'),2);
// 6. Päivän raja: kirjaus klo 2.30 kuuluu oletuksena omaan päiväänsä, rajalla 4 edelliseen
var r3=KK.tAddRow(P,L.b.id,true,new Date(at(2026,10,18,2,30)));A.strictEqual(KK.tRow(P,L.b.id,r3).a[ac.id].ms,at(2026,10,18,2,30),'rakentajan rivi saa ajan');
KK.tSetSel(P,L.b.id,r3);A.deepStrictEqual(kv(P,'loki.valittu.aika.päivä'),{d:'2026-10-18'});
NOW=at(2026,10,18,3,0);A.strictEqual(kv(P,'loki.tänään'),1);
P.praja=4;KK.repair(P);A.strictEqual(P.praja,4);A.deepStrictEqual(kv(P,'loki.valittu.aika.päivä'),{d:'2026-10-17'},'raja 4: edellinen päivä');
A.strictEqual(kv(P,'loki.tänään'),3,'klo 3 on vielä 17. päivää');NOW=at(2026,10,18,5,0);A.strictEqual(kv(P,'loki.tänään'),0);
A.strictEqual(KK.histDay(P,at(2026,10,18,4,0)),'2026-10-18');
P.praja=0;KK.repair(P);A.ok(!P.hasOwnProperty('praja'),'keskiyö = ei kenttää');P.praja='x';KK.repair(P);A.ok(!P.hasOwnProperty('praja'));
// 7. Päivän rivit Rivijoukolla: kirjaus.aika.päivä = päivämäärä (sama tieto suodatettuna)
var kas=blk(P,'trivi',{nm:'Kirjaus',tt:L.b.id});var J=blk(P,'joukko',{nm:'Paiva'});A.ok(KK.addLink(P,L.n.id,'rj',J.n.id,'rv'));
var eh=kaava(P,'kirjaus.aika.päivä = tänään');A.ok(KK.addLink(P,eh.n.id,'v',J.n.id,'c'));NOW=at(2026,10,17,20,0);A.strictEqual(val(P,J.b.id),2,'päivän kirjaukset');
A.strictEqual(kv(P,'paiva.yht.summa'),10,'päivän kooste (4 + 6 uudella hinnalla)');
// 8. Lisää rivi täyttää automaattisen ajan; Kirjaa ilman aika-saraketta on näkyvä virhe
var lr=blk(P,'tee',{do:'lisaarivi',o:L.b.id});NOW=at(2026,10,17,21,0);aja(P,lr.b);A.strictEqual(KK.tRow(P,L.b.id,kv(P,'loki.vika').ri).a[ac.id].ms,NOW);
var kir2=blk(P,'tee',{do:'kirjaa',o:tuot.b.id});A.ok(/aika-saraketta/.test(KK.tauluIssue(P,kir2.b,tuot.b)));var e2=aja(P,kir2.b);A.ok(e2&&/aika-saraketta/.test(e2.err),'virhe: '+JSON.stringify(e2));A.ok(/aika-saraketta/.test(TOASTS[0]));
A.ok(KK.isErr(kv(P,'tuotteet.viimeisin'))&&/aika-saraketta/.test(kv(P,'tuotteet.viimeisin').err));
// tavallinen ajankohta-sarake käy historian ajaksi
var T2=blk(P,'taulu',{nm:'Mitat'});var m1=KK.addCol(T2.b,'Mitattu','aika');KK.addCol(T2.b,'Arvo','luku');var k3=blk(P,'tee',{do:'kirjaa',o:T2.b.id});NOW=at(2026,10,17,22,0);aja(P,k3.b);
A.strictEqual(KK.tRows(P,T2.b.id)[0].a[m1.id].ms,NOW,'ensimmäinen ajankohta-sarake');A.strictEqual(kv(P,'mitat.edellisestä'),0);
// 9. Rekisteri ja valitsin
var om=KK.omat(L.b).map(function(e){return e.n;});['viimeisin','edellisestä','tänään'].forEach(function(n){A.ok(om.indexOf(n)>=0,'rekisterissä '+n+': '+om);});
A.ok(KK.omat(tuot.b).every(function(e){return e.n!=='viimeisin';}),'ilman aikaa ei historian ominaisuuksia');
var pr=KK.tauluProps(P,L.b).map(function(x){return x[0];});['viimeisin','edellisestä','tänään','viimeisin.määrä','viimeisin.aika.päivä'].forEach(function(n){A.ok(pr.indexOf(n)>=0,'valitsimessa '+n);});
A.strictEqual(E(P).prop(L.b.id,'tänään'),E(P).calcProp(L.b.id,'tänään'));
// 10. Tallennus: kentät säilyvät, väärät karsitaan, vanha muoto aukeaa
var Q=JSON.parse(JSON.stringify(P));KK.repair(Q);A.strictEqual(KK.colAuto(Q.b[L.b.id],'aika').id,ac.id);A.strictEqual(KK.colAuto(Q.b[L.b.id],'id').id,idc.id);
Q.b[L.b.id].sar[2].auto='aika';Q.b[L.b.id].sar[3].auto='id';KK.repair(Q);A.strictEqual(Q.b[L.b.id].sar.filter(function(c){return c.auto;}).length,2,'yksi kumpaakin, väärä laji karsitaan');
var vanha=JSON.parse(JSON.stringify(P));delete vanha.praja;vanha.b[L.b.id].sar.forEach(function(c){delete c.auto;});KK.repair(vanha);A.strictEqual(KK.colAuto(vanha.b[L.b.id],'aika'),null);A.strictEqual(KK.histCol(vanha.b[L.b.id]).id,ac.id,'ilman auto-merkintää aika-sarake on yhä historian aika');

// 11. Vanhan tekstiaikajanan muunnos (vain napista) ja sama lähde Aikajanalle ja Kalenterille
var R2=KK.newProject('muunnos');var sl=blk(R2,'saadin',{nm:'Jaksaminen',v:3});var aj=blk(R2,'aika',{nm:'Tauot',v:R2.views[0].id});
var ka=blk(R2,'tee',{do:'kirjaa',o:aj.b.id,tx:KK.toIds(R2,'Tauko · jaksaminen {jaksaminen}')});
R2.st[sl.b.id]=3;NOW=at(2026,10,16,23,30);aja(R2,ka.b);NOW=at(2026,10,17,8,0);aja(R2,ka.b);A.strictEqual(R2.st[aj.b.id].length,2);A.strictEqual(R2.st[aj.b.id][0].tx,'Tauko · jaksaminen 3');
var vanhat=JSON.stringify(R2.st[aj.b.id]);A.strictEqual(val(R2,aj.b.id),2);
A.strictEqual(KK.tplToKaava('a {#b1} b {#b2.arvo}'),'"a " + {#b1} + " b " + {#b2}.arvo');A.strictEqual(KK.tplToKaava('Tauko'),'"Tauko"');A.strictEqual(KK.tplToKaava(''),'');
var mu=KK.ajMuunna(R2,aj.b.id,100,200);A.strictEqual(mu.rows,2);A.strictEqual(mu.acts,1);var HT=R2.b[mu.id];A.strictEqual(HT.nm,'Tauot historia');
A.strictEqual(JSON.stringify(R2.st[aj.b.id]),vanhat,'vanhat merkinnät säilyvät');A.strictEqual(aj.b.lh,mu.id);A.strictEqual(KK.ajLahde(R2,aj.b),mu.id);
A.strictEqual(kv(R2,'tauothistoria.eka.teksti'),'Tauko · jaksaminen 3');A.strictEqual(KK.tRows(R2,mu.id)[0].a[KK.histCol(HT).id].ms,at(2026,10,16,23,30));
A.strictEqual(ka.b.o,mu.id);A.ok(!ka.b.tx);A.strictEqual(KK.kaavaToText(R2,ka.b.kv[KK.colByName(HT,'teksti').id]),'"Tauko · jaksaminen " + jaksaminen');
R2.st[sl.b.id]=5;NOW=at(2026,10,17,9,0);aja(R2,ka.b);A.strictEqual(kv(R2,'tauothistoria.viimeisin.teksti'),'Tauko · jaksaminen 5','muunnettu Kirjaa kirjoittaa taulukkoon');
A.strictEqual(R2.st[aj.b.id].length,2,'aikajanan omat merkinnät eivät kasva');
// Aikajanan arvot lähteestä
A.strictEqual(val(R2,aj.b.id),3);A.deepStrictEqual(val(R2,aj.b.id,'last'),{d:'2026-10-17'});A.strictEqual(E(R2).prop(aj.b.id,'viimeisin.teksti'),'Tauko · jaksaminen 5');A.strictEqual(E(R2).prop(aj.b.id,'viimeisin.aika'),'9.00');
R2.praja=4;A.strictEqual(E(R2).calcProp(aj.b.id,'tänään'),2,'tänään päivän rajan mukaan (23.30 eilen ei, 8.00 ja 9.00 kyllä)');
// Lähteen poisto: vaikutuslista löytää aikajanan; korjaus pitää poistetun tunnisteen
var refs=KK.refsTo(R2,[mu.id]);A.ok(refs.some(function(x){return x.id===aj.b.id;}),'poiston vaikutuslista: aikajana '+JSON.stringify(refs));A.ok(refs.some(function(x){return x.id===ka.b.id;}),'ja Kirjaa');
var R3=JSON.parse(JSON.stringify(R2));R3.b[aj.b.id].lh='olematon';KK.repair(R3);A.ok(!R3.b[aj.b.id].lh,'väärä lähde karsitaan');
console.log('logiikka_68_historia ok');
