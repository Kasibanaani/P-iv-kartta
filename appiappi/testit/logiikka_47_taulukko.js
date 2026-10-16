// P2: tietotaulukko (F02), puuttuva tieto ja koosteet (F06, D06), tilannekuva ja elävä riviviite (F07, D01).
// Taulukko on logiikan palikka: sarakkeet ja lähtöaineisto rakenteessa, käytössä muuttuvat rivit käyttötiedossa.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function kaava(P,f){var b=KK.addBlock(P,'kaava');KK.addNode(P,b.id,0,0);b.f=KK.kaavaToIds(P,f);return b;}
function kv(P,f){return E(P).val(kaava(P,f).id);}
function taulu(P,nm,cols){var t=KK.addBlock(P,'taulu',{nm:nm});KK.addNode(P,t.id,0,0);var c={};cols.forEach(function(x){c[x[0]]=KK.addCol(t,x[0],x[1],x[2]);});return {t:t,c:c};}
function rivi(P,T,vals){var rid=KK.tAddRow(P,T.t.id,false);Object.keys(vals).forEach(function(k){var r=KK.tEdit(P,T.t.id,false,rid,T.c[k].id,vals[k],new Date(NOW));A.ok(!KK.isErr(r),'tEdit '+k+': '+(r&&r.err));});return rid;}
function tee(P,props){var b=KK.addBlock(P,'tee',props);KK.addNode(P,b.id,0,0);return b;}
function aja(P,b){TOASTS.length=0;var r=KK.runAction(P,b.id,C,0);return r;}

// Perusta: tyhjä taulukko, sarakkeet, viitteet, varatut nimet
var P=KK.newProject('taulukko');
var T=taulu(P,'Ostokset',[['Nimi','teksti'],['Määrä','luku'],['Valmis','kylla'],['Päivä','pvm']]);
A.strictEqual(T.t.vt,'ostokset');A.deepStrictEqual(KK.tSar(T.t).map(function(c){return c.id;}),['c1','c2','c3','c4']);
A.strictEqual(T.c['Määrä'].vt,'määrä');A.strictEqual(KK.addCol(T.t,'valittu','luku').vt,'valittu2','varattu nimi saa numeron');
T.t.sar.pop();
A.strictEqual(kv(P,'ostokset.rivejä'),0,'tyhjä taulukko');A.strictEqual(kv(P,'ostokset.valittu'),null);A.strictEqual(kv(P,'ostokset.valittunro'),0);
A.strictEqual(kv(P,'ostokset.määrä.summa'),0,'tyhjä summa on 0');A.ok(KK.isMiss(kv(P,'ostokset.määrä.keskiarvo')),'tyhjä keskiarvo on tuntematon');

// Kentät lajin mukaan (D02: virhe näkyy, väärää ei kirjoiteta)
var r1=rivi(P,T,{'Nimi':'Maito','Määrä':'0','Valmis':'ei','Päivä':'16.10.2026'}),r2=rivi(P,T,{'Nimi':'Leipä','Määrä':'6'}),r3=rivi(P,T,{'Nimi':'Juusto'});
A.deepStrictEqual([r1,r2,r3],['r1','r2','r3']);
var bad=KK.tEdit(P,T.t.id,false,r3,T.c['Määrä'].id,'-',new Date(NOW));A.ok(KK.isErr(bad)&&/ei ole luku/.test(bad.err),'pelkkä miinus ei ole luku');
A.ok(!T.t.rv[2].a.hasOwnProperty('c2'),'virheellistä ei kirjoitettu');
A.ok(KK.isErr(KK.tEdit(P,T.t.id,false,r3,T.c['Valmis'].id,'ehkä',new Date(NOW))));A.ok(KK.isErr(KK.tEdit(P,T.t.id,false,r3,T.c['Päivä'].id,'huomenna kai',new Date(NOW))));
A.strictEqual(T.t.rv[0].a.c2,0,'nolla on luku');A.strictEqual(T.t.rv[0].a.c3,false,'ei on vastaus');A.deepStrictEqual(T.t.rv[0].a.c4,{d:'2026-10-16'});
A.strictEqual(kv(P,'ostokset.rivejä'),3);

// Puuttuva tieto ja koosteet (D06): 0, 6 ja tyhjä → keskiarvo 3, havaintoja 2, puuttuvia 1
A.strictEqual(kv(P,'ostokset.määrä.keskiarvo'),3,'keskiarvo 3 (ei 2)');A.strictEqual(kv(P,'ostokset.määrä.havaintoja'),2);A.strictEqual(kv(P,'ostokset.määrä.puuttuvia'),1);
A.strictEqual(kv(P,'ostokset.määrä.summa'),6);A.strictEqual(kv(P,'ostokset.määrä.suurin'),6);A.strictEqual(kv(P,'ostokset.määrä.pienin'),0);A.strictEqual(kv(P,'ostokset.määrä.täydellinen'),false);
A.strictEqual(kv(P,'ostokset.valmis.puuttuvia'),2,'vastaamaton kyllä/ei ei ole ei');A.strictEqual(kv(P,'ostokset.valmis.summa'),0);
A.deepStrictEqual(kv(P,'ostokset.päivä.suurin'),{d:'2026-10-16'});
T.c['Määrä'].vaadi=true;A.ok(KK.isMiss(kv(P,'ostokset.määrä.keskiarvo')),'täydellisyysvaatimus estää tuloksen');A.strictEqual(kv(P,'ostokset.määrä.havaintoja'),2,'kattavuus on eri ulostulo');delete T.c['Määrä'].vaadi;
A.ok(KK.isErr(kv(P,'ostokset.nimi.summa')),'tekstin summa on virhe');A.ok(KK.isErr(kv(P,'ostokset.määrä')),'pelkkä sarake neuvoo');
A.ok(/valittu\.määrä/.test(kv(P,'ostokset.määrä').err));A.ok(KK.isErr(kv(P,'ostokset.hinta.summa'))&&/sarakkeet: nimi, määrä/.test(kv(P,'ostokset.hinta.summa').err));

// Valittu rivi ja puuttuva yksittäisessä laskussa: tuntematon, ei 0
var sel=tee(P,{do:'valitserivi',o:T.t.id,rs:'vika'});aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'r3');A.ok(!KK.tUsed(P,T.t.id),'valinta ei kopioi rivejä');
A.strictEqual(kv(P,'ostokset.valittunro'),3);A.strictEqual(kv(P,'ostokset.valittu.nimi'),'Juusto');
A.ok(KK.isMiss(kv(P,'ostokset.valittu.määrä')),'puuttuva');A.ok(KK.isMiss(kv(P,'ostokset.valittu.määrä * 2')),'lasku puuttuvalla on tuntematon');
A.strictEqual(kv(P,'ostokset.valittu.määrä == tyhjä'),true);A.ok(KK.isMiss(kv(P,'ostokset.valittu.määrä > 1')),'suuruusvertailu tuntematon');
A.strictEqual(kv(P,'ostokset.valittu.määrä.tiedossa'),false);A.strictEqual(kv(P,'ostokset.valittu.nimi.tiedossa'),true);A.strictEqual(KK.fmt(kv(P,'ostokset.valittu.määrä * 2')),'–');
// Vanhojen palikoiden tyhjä ennallaan: tyhjä Arvo laskussa on 0
var av=KK.addBlock(P,'arvo',{nm:'Tyhja',v:''});KK.addNode(P,av.id,0,0);A.strictEqual(kv(P,'tyhja + 2'),2,'vanha tyhjä = 0');
// Puuttuva vanhaan ikkunaan: KESKIARVO ohittaa sen kuten tyhjän
var w=KK.addBlock(P,'ikkuna',{m:'avg'});var wn=KK.addNode(P,w.id,0,0);var k1=kaava(P,'ostokset.valittu.määrä'),k2=kaava(P,'4');KK.nodesOfBlock(P,k1.id)[0].g=wn.id;KK.nodesOfBlock(P,k2.id)[0].g=wn.id;
A.strictEqual(E(P).val(w.id),4,'vanha keskiarvo-ikkuna ohittaa puuttuvan');

// Sarakkeen nimen vaihto ei riko kaavaa: tallessa tunniste
var kk=kaava(P,'ostokset.valittu.määrä + ostokset.määrä.summa');A.ok(/\{#b\d+\}\.valittu\.c2/.test(kk.f)&&/\.c2\.summa/.test(kk.f),'tallessa sarakkeen tunniste: '+kk.f);
KK.setColName(T.t,'c2','Kpl');A.strictEqual(T.c['Määrä'].vt,'kpl');A.strictEqual(KK.kaavaToText(P,kk.f),'ostokset.valittu.kpl + ostokset.kpl.summa');
A.ok(KK.isMiss(E(P).val(kk.id)));KK.setColName(T.t,'c2','Määrä');
// Teksti: {ostokset.valittu.nimi} ja rivin nimi
var tx=KK.addBlock(P,'nayta',{tx:''});tx.tx=KK.toIds(P,'Valittu: {ostokset.valittu.nimi}, {ostokset.valittu}');A.ok(/c1/.test(tx.tx),'teksti tallessa tunnisteella');
A.strictEqual(E(P).text(tx.id),'Valittu: Juusto, Juusto');A.strictEqual(KK.toNames(P,tx.tx),'Valittu: {ostokset.valittu.nimi}, {ostokset.valittu}');

// Valitse rivi: ensimmäinen, seuraava, edellinen, viimeinen, kierto, numerolla, ei mitään
sel.rs='eka';aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'r1');sel.rs='seur';aja(P,sel);aja(P,sel);aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'r3','lopussa pysyy');
sel.kierto=true;aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'r1','kierto alkuun');sel.rs='edel';aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'r3');delete sel.kierto;
sel.rs='arvo';sel.v='2';aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'r2');sel.v='9';var er=aja(P,sel);A.ok(er.err&&/rivejä on 3/.test(er.err));A.ok(TOASTS.length===1,'virhe näkyy ilmoituksena');
sel.rs='ei';aja(P,sel);A.strictEqual(KK.tSel(P,T.t.id),'');

// Toiminnot kenttään (valittu rivi): käyttötieto kopioituu, lähtöaineisto ennallaan
sel.rs='eka';aja(P,sel);
var set=tee(P,{do:'aseta',o:T.t.id,sk:'c2',v:'5'});aja(P,set);A.ok(KK.tUsed(P,T.t.id),'ensimmäinen muutos kopioi');A.strictEqual(T.t.rv[0].a.c2,0,'lähtöaineisto ennallaan');
A.strictEqual(kv(P,'ostokset.valittu.määrä'),5);A.strictEqual(kv(P,'ostokset.määrä.summa'),11);
var add=tee(P,{do:'lisaa',o:T.t.id,sk:'c2'});aja(P,add);A.strictEqual(kv(P,'ostokset.valittu.määrä'),6);
var vh=tee(P,{do:'vaihda',o:T.t.id,sk:'c3'});aja(P,vh);A.strictEqual(kv(P,'ostokset.valittu.valmis'),true);
set.v='paljon';var e2=aja(P,set);A.ok(e2.err&&/ei ole luku/.test(e2.err));A.strictEqual(kv(P,'ostokset.valittu.määrä'),6,'väärä laji ei muuttanut');
sel.rs='vika';aja(P,sel);aja(P,add);A.strictEqual(kv(P,'ostokset.valittu.määrä'),1,'Lisää puuttuvaan alkaa nollasta');
var ty=tee(P,{do:'tyhjenna',o:T.t.id,sk:'c2'});aja(P,ty);A.ok(KK.isMiss(kv(P,'ostokset.valittu.määrä')),'tyhjennys = puuttuva');
sel.rs='ei';aja(P,sel);var e3=aja(P,set);A.ok(e3.err&&/ei ole valittua riviä/.test(e3.err),'ilman valintaa virhe');
// Lisää rivi: kentät kaavoista, valitse uusi, puuttuva jää puuttuvaksi; virhe ei lisää puolikasta riviä
var lr=tee(P,{do:'lisaarivi',o:T.t.id,vl:true,kv:{c1:KK.kaavaToIds(P,'"Kahvi"'),c2:KK.kaavaToIds(P,'2 + 1'),c4:KK.kaavaToIds(P,'tänään')}});
aja(P,lr);A.strictEqual(kv(P,'ostokset.rivejä'),4);var u1=KK.tSel(P,T.t.id);A.strictEqual(u1,'u1','käytössä lisätty rivi u1');
A.strictEqual(kv(P,'ostokset.valittu.nimi'),'Kahvi');A.strictEqual(kv(P,'ostokset.valittu.määrä'),3);A.deepStrictEqual(kv(P,'ostokset.valittu.päivä'),{d:'2026-10-16'});A.ok(KK.isMiss(kv(P,'ostokset.valittu.valmis')));
lr.kv.c2=KK.kaavaToIds(P,'"kolme"');var e4=aja(P,lr);A.ok(e4.err&&/sarake ”Määrä”/.test(e4.err));A.strictEqual(kv(P,'ostokset.rivejä'),4,'ei puolikasta riviä');
// Poista rivi: valinta siirtyy seuraavaan
sel.rs='arvo';sel.v='2';aja(P,sel);var pr=tee(P,{do:'poistarivi',o:T.t.id});aja(P,pr);A.strictEqual(kv(P,'ostokset.rivejä'),3);A.strictEqual(KK.tSel(P,T.t.id),'r3','valinta seuraavaan');
// Tyhjennä kaikki rivit; Tyhjennä käyttötiedot palauttaa lähtöaineiston
var tk=tee(P,{do:'tyhjenna',o:T.t.id});aja(P,tk);A.strictEqual(kv(P,'ostokset.rivejä'),0);A.strictEqual(T.t.rv.length,3);
P.st={};A.strictEqual(kv(P,'ostokset.rivejä'),3,'käyttötietojen tyhjennys palauttaa lähtöaineiston');

// Kuvaukset ja tarkistukset
A.strictEqual(KK.descAct(P,lr.id),'Lisää rivi → Ostokset: Nimi = "Kahvi", Määrä = "kolme", Päivä = tänään');
A.strictEqual(KK.descAct(P,set.id),'Ostokset (valittu rivi): Määrä = paljon');A.strictEqual(KK.descAct(P,sel.id),'Valitse rivi: Ostokset → 2');
var nos=tee(P,{do:'aseta',o:T.t.id});A.strictEqual(KK.tauluIssue(P,nos,T.t),'valitse sarake');var vhb=tee(P,{do:'vaihda',o:T.t.id,sk:'c2'});A.ok(/ei ole kyllä\/ei/.test(KK.tauluIssue(P,vhb,T.t)));

// Tilannekuva ja elävä viite (F07, D01): myöhemmin muuttuva hinta ei muuta vanhaa kirjausta
var Q=KK.newProject('kirjaus');
var TU=taulu(Q,'Tuotteet',[['Nimi','teksti'],['Hinta','luku']]);rivi(Q,TU,{'Nimi':'Kahvi','Hinta':'4'});rivi(Q,TU,{'Nimi':'Tee','Hinta':'3'});
var KI=taulu(Q,'Kirjaus',[['Tuote','viite',{tt:TU.t.id}],['Hinta','luku'],['Aika','aika']]);
var valT=tee(Q,{do:'valitserivi',o:TU.t.id,rs:'eka'});aja(Q,valT);
var kirj=tee(Q,{do:'lisaarivi',o:KI.t.id,vl:true,kv:{c1:KK.kaavaToIds(Q,'tuotteet.valittu'),c2:KK.kaavaToIds(Q,'tuotteet.valittu.hinta'),c3:KK.kaavaToIds(Q,'nyt')}});
A.ok(/\.valittu\.c2/.test(kirj.kv.c2));aja(Q,kirj);
A.strictEqual(kv(Q,'kirjaus.valittu.hinta'),4);A.strictEqual(kv(Q,'kirjaus.valittu.tuote.hinta'),4);A.strictEqual(kv(Q,'kirjaus.valittu.tuote.nimi'),'Kahvi');
A.strictEqual(KK.fmt(kv(Q,'kirjaus.valittu.aika')),'16.10.2026 klo 10.00');var kt=kaava(Q,'kirjaus.valittu.tuote.hinta');A.ok(/valittu\.c1\.c2/.test(kt.f),'riviviitteen kautta tunnisteet: '+kt.f);
A.strictEqual(E(Q).fmt(kv(Q,'kirjaus.valittu.tuote')),'Kahvi','rivin nimi');
var hin=tee(Q,{do:'aseta',o:TU.t.id,sk:'c2',v:'5'});aja(Q,hin);
A.strictEqual(kv(Q,'kirjaus.valittu.hinta'),4,'tilannekuva pysyy');A.strictEqual(kv(Q,'kirjaus.valittu.tuote.hinta'),5,'elävä viite muuttuu');
NOW+=60000;aja(Q,kirj);A.strictEqual(kv(Q,'kirjaus.valittu.hinta'),5,'uusi kirjaus uudella hinnalla');A.strictEqual(kv(Q,'kirjaus.hinta.summa'),9);
// vienti ja tuonti säilyttävät eron
var Q2=KK.repair(JSON.parse(JSON.stringify(Q)));A.strictEqual(kv(Q2,'kirjaus.hinta.summa'),9);var s0=Q2.st[KI.t.id];A.strictEqual(s0.rows.length,2);
A.deepStrictEqual(s0.rows[0].a.c1,{rr:TU.t.id,ri:'r1'});A.strictEqual(s0.rows[0].a.c2,4);A.ok(typeof s0.rows[0].a.c3.ms==='number');
A.strictEqual(kv(Q2,'kirjaus.valittu.tuote.hinta'),5);
// poistettuun riviin osoittava kirjaus näkyy viitevirheenä, ei puuttuvana
var valK=tee(Q,{do:'valitserivi',o:KI.t.id,rs:'eka'});aja(Q,valK);var pois=tee(Q,{do:'poistarivi',o:TU.t.id});aja(Q,valT);aja(Q,pois);
A.strictEqual(kv(Q,'tuotteet.rivejä'),1);A.ok(KK.isErr(kv(Q,'kirjaus.valittu.tuote.hinta'))&&/viitattu rivi puuttuu/.test(kv(Q,'kirjaus.valittu.tuote.hinta').err));
A.strictEqual(kv(Q,'kirjaus.valittu.hinta'),4,'kopioitu tieto säilyy');A.strictEqual(kv(Q,'kirjaus.tuote.virheitä'),2,'molemmat kirjaukset osoittivat Kahviin');A.strictEqual(kv(Q,'kirjaus.tuote.havaintoja'),0);
var e5=kv(Q,'kirjaus.tuote.suurin');A.ok(KK.isErr(e5)&&/virhe riveillä 1, 2/.test(e5.err),'kooste kertoo virheen ja rivit');
// riviviite muistiin ja vertailu
var mu=KK.addBlock(Q,'muisti',{nm:'Muisti'});KK.addNode(Q,mu.id,0,0);aja(Q,valT);var am=tee(Q,{do:'aseta',o:mu.id,v:{r:kaava(Q,'tuotteet.valittu').id}});aja(Q,am);
A.deepStrictEqual(E(Q).val(mu.id),{rr:TU.t.id,ri:'r2'});A.strictEqual(kv(Q,'muisti == tuotteet.valittu'),true);A.strictEqual(E(Q).fmt(E(Q).val(mu.id)),'Tee');

// Sarakkeen poisto: viittaukset löytyvät ennen poistoa, poiston jälkeen virhe
var R0=KK.newProject('poisto');var TP=taulu(R0,'T',[['A','luku'],['B','luku']]);rivi(R0,TP,{'A':'1','B':'2'});var kb=kaava(R0,'t.b.summa');var ta=tee(R0,{do:'aseta',o:TP.t.id,sk:'c2',v:'1'});
A.deepStrictEqual(KK.colRefs(R0,TP.t.id,'c2').sort(),[kb.id,ta.id].sort());A.deepStrictEqual(KK.colRefs(R0,TP.t.id,'c1'),[]);
KK.delCol(R0,TP.t.id,'c2');KK.repair(R0);A.ok(KK.isErr(E(R0).val(kb.id)),'poistettu sarake on virhe');A.ok(!ta.sk,'toiminnon sarake tyhjenee');A.ok(!R0.b[TP.t.id].rv[0].a.c2);

// Korjaus: rikkinäiset sarakkeet, rivit ja käyttötieto
var Z=KK.newProject('rikki');var zt=KK.addBlock(Z,'taulu',{nm:'Z'});KK.addNode(Z,zt.id,0,0);
zt.sar=[{id:'c1',nm:'A',laji:'luku',vt:'a'},{id:'c1',nm:'tupla'},{id:'x',nm:'huono'},{id:'c2',nm:'B',laji:'outo',vt:'a'},null];
zt.rv=[{id:'r1',a:{c1:'ei luku',c2:'ok',c9:1}},{id:'r1',a:{}},{id:'zz'},{id:'r2',a:{c1:7}}];Z.st[zt.id]={rows:'x',sel:5};
KK.repair(Z);A.deepStrictEqual(zt.sar.map(function(c){return c.id+':'+c.laji+':'+c.vt;}),['c1:luku:a','c2:teksti:b']);
A.deepStrictEqual(zt.rv,[{id:'r1',a:{c2:'ok'}},{id:'r2',a:{c1:7}}]);A.ok(Z.st[zt.id]===undefined,'rikkinäinen käyttötieto pois');A.strictEqual(zt.csq,2);A.strictEqual(zt.rsq,2);
var zt2=KK.addBlock(Z,'tee',{do:'aseta',o:zt.id,sk:'c9',rl:'jokin',kv:{c1:'',c9:'1'},vl:'x'});KK.addNode(Z,zt2.id,0,0);KK.repair(Z);
A.ok(zt2.sk===undefined&&zt2.rl===undefined&&zt2.kv===undefined&&zt2.vl===undefined,'toiminnon kentät korjattu');
// Kopioi ja liitä: toiminnon kohde, kenttäkaava ja riviviitteen taulukko osoittavat liitettyyn taulukkoon
var Y=KK.newProject('kopio');var YT=taulu(Y,'T',[['A','luku']]);var YU=taulu(Y,'U',[['Ref','viite',{tt:YT.t.id}]]);var yl=tee(Y,{do:'lisaarivi',o:YT.t.id,kv:{c1:KK.kaavaToIds(Y,'t.a.summa + 1')}});
var ym=KK.pasteNodes(Y,KK.copyNodes(Y,[KK.nodesOfBlock(Y,YT.t.id)[0].id,KK.nodesOfBlock(Y,YU.t.id)[0].id,KK.nodesOfBlock(Y,yl.id)[0].id]),20,20).map(function(n){return Y.b[KK.nodeOf(Y,n).p];});
var yt2=ym.filter(function(b){return b.k==='taulu'&&b.sar[0].laji==='luku';})[0],yu2=ym.filter(function(b){return b.k==='taulu'&&b.sar[0].laji==='viite';})[0],yl2=ym.filter(function(b){return b.k==='tee';})[0];
A.ok(yt2.id!==YT.t.id&&yl2.o===yt2.id&&yl2.kv.c1==='{#'+yt2.id+'}.c1.summa + 1'&&yu2.sar[0].tt===yt2.id,'liitetty osoittaa liitettyyn');
// Taulukon poisto: riviviitesarake on viittaus (vaikutuslista), ja sen jälkeen kenttä on virhe; isot kirjaimet kaavassa
A.ok(KK.refsTo(Q,[TU.t.id]).some(function(r){return r.id===KI.t.id;}),'riviviitesarake näkyy poiston vaikutuksissa');
var kq=kaava(Q,'Kirjaus.Valittu.Tuote.Hinta');A.ok(/valittu\.c1\.c2/.test(kq.f),'isot kirjaimet: tunnisteet');
KK.removeBlock(Q,TU.t.id);A.ok(KK.isErr(kv(Q,'kirjaus.valittu.tuote.nimi')));A.ok(Q.b[KI.t.id].sar[0].tt===TU.t.id&&KK.isGone(Q,TU.t.id),'poistettu taulukko muistetaan');
console.log('ok logiikka_47_taulukko');
