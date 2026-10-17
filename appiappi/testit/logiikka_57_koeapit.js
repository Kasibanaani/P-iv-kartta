// Koeapit C ja B (suunnitelma 07-toteutuspolku.md) nykyisillä palikoilla. Projektit rakentaa koeapit.js; sama tiedosto
// kirjoittaa Emilin projektit master-tiedot-repoon. Testi tarkistaa suunnitelman valmistumiskokeet moottorissa.
var KK=require('./moottori.js'),A=require('assert'),Kp=require('./koeapit.js');
var NOW=new Date(2026,9,17,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function by(P,n){var r=Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.nm===n;});A.strictEqual(r.length,1,'palikka '+n);return r[0];}
function E(P){return KK.Ev(P,C);}
function kierros(P){var Q=JSON.parse(Kp.tiedosto(P)).projekti;KK.repair(Q);return Q;}

// ---------- C. Kohdelista määrineen ----------
var P=Kp.koeappiC(),T=by(P,'Kohteet'),J=by(P,'Näkyvät'),plus=by(P,'Plus'),mi=by(P,'Miinus');
function m(r){var x=KK.cellRead(P,T.id,KK.tRow(P,T.id,r),T.sar[1]);return KK.isMiss(x)?null:x;}
function nimi(r){return KK.tRow(P,T.id,r).a[T.sar[0].id];}
function ids(){return E(P).val(J.id,'rj').ids;}
A.strictEqual(KK.tRows(P,T.id).length,100,'100 riviä');A.strictEqual(E(P).val(by(P,'Kortit').id),100);A.strictEqual(E(P).val(by(P,'Ruudukko').id),100);
A.ok(KK.tRows(P,T.id).some(function(r){return !r.a.hasOwnProperty(T.sar[1].id);}),'osalta puuttuu määrä');
A.deepStrictEqual(KK.tstMembers(P,by(P,'Kortit').id).map(function(b){return b.nm;}).sort(),['Kortin määrä','Kortin nimi','Kortin tausta','Miinus','Plus']);
Object.keys(P.b).forEach(function(i){if(P.b[i].k==='ketju')A.deepStrictEqual(KK.chainIssues(P,i,C),[],'ketju '+P.b[i].nm);});
// Aakkosjärjestys oletuksena
var nimet=ids().map(nimi);A.strictEqual(nimet[0],'Ananas');A.deepStrictEqual(nimet.slice().sort(function(a,b){return a.localeCompare(b,'fi');}),nimet,'aakkosjärjestys');
// Kahden eri kortin plus: vain niiden rivit muuttuvat
var a=ids()[0],b=ids()[40],kaikki=KK.tRows(P,T.id).map(function(r){return m(r.id);}),a0=m(a)||0,b0=m(b)||0;
KK.press(P,plus.id,KK.tstCtx(P,C,plus.id,a));KK.press(P,plus.id,KK.tstCtx(P,C,plus.id,b));KK.press(P,plus.id,KK.tstCtx(P,C,plus.id,b));
A.strictEqual(m(a),a0+1);A.strictEqual(m(b),b0+2);
KK.tRows(P,T.id).forEach(function(r,i){if(r.id!==a&&r.id!==b)A.strictEqual(m(r.id),kaikki[i],'muut ennallaan');});
A.ok(KK.tUsed(P,T.id),'käytössä muuttuu kopio');A.strictEqual(T.rv.length,100);
// Miinus nollaan asti, ei alle
for(var i=0;i<a0+3;i++)KK.press(P,mi.id,KK.tstCtx(P,C,mi.id,a));A.strictEqual(m(a),0,'miinus pysähtyy nollaan');
var tyhja=KK.tRows(P,T.id).filter(function(r){return m(r.id)==null;})[0].id;KK.press(P,mi.id,KK.tstCtx(P,C,mi.id,tyhja));A.strictEqual(m(tyhja),null,'puuttuva ei muutu nollaksi');
KK.press(P,plus.id,KK.tstCtx(P,C,plus.id,tyhja));A.strictEqual(m(tyhja),1,'puuttuvaan plus alkaa nollasta');
// Järjestys käyttäjän valinnasta: Eniten ensin (puuttuva loppuun), takaisin aakkosiin
KK.setVal(P,by(P,'Eniten ensin').id,true,C);var js=ids().map(m);
for(i=1;i<js.length;i++)A.ok(js[i-1]==null?js[i]==null:(js[i]==null||js[i-1]>=js[i]),'laskeva määrä, puuttuvat lopussa');
A.strictEqual(js[0],Math.max.apply(null,KK.tRows(P,T.id).map(function(r){return m(r.id)||0;})));
// Suodatus: Piilota nollat (myös puuttuvat), toistin seuraa
KK.setVal(P,by(P,'Piilota nollat').id,true,C);var nz=KK.tRows(P,T.id).filter(function(r){return m(r.id)>0;}).length;
A.strictEqual(ids().length,nz);A.ok(nz<100);A.strictEqual(E(P).val(by(P,'Kortit').id),nz);A.strictEqual(E(P).val(by(P,'Ruudukko').id),100,'toinen näkymä ei suodata');
A.strictEqual(E(P).text(by(P,'Yhteenveto').id),nz+' näkyvissä · yhteensä '+KK.tRows(P,T.id).reduce(function(s,r){return s+(m(r.id)||0);},0)+' kpl');
KK.setVal(P,by(P,'Piilota nollat').id,false,C);KK.setVal(P,by(P,'Eniten ensin').id,false,C);A.strictEqual(ids().length,100);
// Uusi kohde saa kortin ilman uutta logiikkaa; tyhjä nimi ei lisää
var uk=by(P,'Uusi kohde'),ln=by(P,'Lisää kohde');KK.press(P,ln.id,C);A.strictEqual(KK.tRows(P,T.id).length,100,'tyhjä nimi ei lisää');
KK.setVal(P,uk.id,'Kaurajuoma',C);KK.press(P,ln.id,C);var rs=KK.tRows(P,T.id),u=rs[rs.length-1];
A.strictEqual(rs.length,101);A.strictEqual(nimi(u.id),'Kaurajuoma');A.strictEqual(m(u.id),0);A.strictEqual(E(P).val(uk.id),'','kenttä tyhjeni');
A.ok(ids().indexOf(u.id)>=0);A.strictEqual(E(P).rowEv(T.id,u.id).text(by(P,'Kortin nimi').id),'Kaurajuoma');A.strictEqual(E(P).val(by(P,'Ruudukko').id),101);
// Sama rivi kahdessa näkymässä: määrä yhteinen, rasti oma
var ev=E(P).rowEv(T.id,b);A.strictEqual(ev.text(by(P,'Kortin määrä').id),String(b0+2));A.strictEqual(ev.text(by(P,'Ruudun määrä').id),(b0+2)+' kpl');
var ru=by(P,'Tarkistettu');KK.userSet(P,ru.id,true,KK.tstCtx(P,C,ru.id,b));
A.strictEqual(E(P).rowEv(T.id,b).val(ru.id),true);A.strictEqual(E(P).rowEv(T.id,a).val(ru.id),false,'rasti vain tällä rivillä');A.strictEqual(m(b),b0+2,'rasti ei muuta määrää');
KK.press(P,plus.id,KK.tstCtx(P,C,plus.id,b));A.strictEqual(E(P).rowEv(T.id,b).text(by(P,'Ruudun määrä').id),(b0+3)+' kpl','toinen näkymä näkee listan muutoksen');
// Tallennus ja tuonti: kaikki säilyy, repair ei muuta
var Q=kierros(P);A.strictEqual(JSON.stringify(Q.b),JSON.stringify(JSON.parse(JSON.stringify(P.b))),'repair ei muuta rakennetta');
A.strictEqual(KK.Ev(Q,C).rowEv(T.id,b).val(ru.id),true);A.strictEqual(KK.tRows(Q,T.id).length,101);
// Käyttötietojen tyhjennys palauttaa lähtöaineiston
var R=Kp.koeappiC();A.strictEqual(KK.tRows(R,T.id).length,100);A.ok(!KK.tUsed(R,T.id));
// Nopeus: 100 kortin arvot
var t0=Date.now(),e2=E(P);ids().forEach(function(r){var er=e2.rowEv(T.id,r);er.text(by(P,'Kortin nimi').id);er.text(by(P,'Kortin määrä').id);});console.log('C: 101 korttia',Date.now()-t0,'ms');

// ---------- B. Kysymysappi ----------
var B=Kp.koeappiB(),KY=by(B,'Kysymykset'),H=by(B,'Vastaukset');
function t(n){return KK.Ev(B,C).text(by(B,n).id);}
function vastaa(x){KK.press(B,by(B,'Vastaus '+x).id,C);}
function hist(){return KK.tRows(B,H.id).map(function(r){return [r.a.c2,r.a.c3,r.a.c4,r.a.c1.ri];});}
function korttiB(r,n){return KK.Ev(B,C).rowEv(KY.id,r).text(by(B,n).id);}
Object.keys(B.b).forEach(function(i){if(B.b[i].k==='ketju')A.deepStrictEqual(KK.chainIssues(B,i,C),[],'ketju '+B.b[i].nm);});
A.strictEqual(by(B,'Vastaa').lk,2,'ketju lukittu kaikilta muutoksilta');
A.strictEqual(t('Otsikko'),'Kysymys 1 / 8');A.strictEqual(t('Kysymysteksti'),'Mikä on Suomen pääkaupunki?');A.strictEqual(t('Vastaus B'),'B: Helsinki');
// Vastaus kirjautuu painettuun kysymykseen, vaikka ketju valitsee seuraavan ensin
vastaa('B');A.strictEqual(t('Kysymysteksti'),'Montako päivää on karkausvuodessa?');A.deepStrictEqual(hist(),[['k1','B',true,'r1']]);A.strictEqual(t('Palaute'),'✅ Oikein!');
vastaa('A');A.deepStrictEqual(hist(),[['k1','B',true,'r1'],['k2','A',false,'r2']]);A.strictEqual(t('Palaute'),'❌ Väärin. Oikea oli B');A.strictEqual(t('Pisteet'),'Oikein 1 / 2 · 50 %');
A.ok(KK.tRows(B,H.id).every(function(r){return r.a.c5&&r.a.c5.ms===NOW;}),'aika kirjattu');
A.ok(!KK.tUsed(B,KY.id),'kysymykset pysyvät lähtöaineistona (valinta on käyttötietoa)');
// Kierto: viimeisen jälkeen ensimmäinen
for(i=0;i<6;i++)vastaa('C');A.strictEqual(t('Otsikko'),'Kysymys 1 / 8');A.strictEqual(hist()[7][0],'k8');A.strictEqual(t('Pisteet'),'Oikein 2 / 8 · 25 %','k6 oikein C');
// Tilasto kysymyksittäin kortissa
A.strictEqual(korttiB('r1','Kortin tilasto'),'Vastattu 1 · oikein 1');A.strictEqual(korttiB('r2','Kortin tilasto'),'Vastattu 1 · oikein 0');A.strictEqual(korttiB('r6','Kortin tilasto'),'Vastattu 1 · oikein 1');
vastaa('B');A.strictEqual(korttiB('r1','Kortin tilasto'),'Vastattu 2 · oikein 2');
// Sisältöpaketin vaihto tunnisteet säilyttäen: rakentaja muuttaa kysymyksen tekstin ja korvaa rivin uudella
KK.tEdit(B,KY.id,false,'r1',KY.sar[1].id,'Mikä kaupunki on Suomen pääkaupunki?');A.strictEqual(korttiB('r1','Kortin kysymys'),'k1: Mikä kaupunki on Suomen pääkaupunki?');
A.strictEqual(korttiB('r1','Kortin tilasto'),'Vastattu 2 · oikein 2','teksti vaihtui, historia ei');
var n9=KK.tAddRow(B,KY.id,false);[['c1','k2'],['c2','Montako päivää on tavallisessa vuodessa?'],['c3','364'],['c4','365'],['c5','366'],['c6','B']].forEach(function(x){KK.tEdit(B,KY.id,false,n9,x[0],x[1]);});
KK.tDelRow(B,KY.id,false,'r2');A.strictEqual(korttiB(n9,'Kortin tilasto'),'Vastattu 1 · oikein 0','uusi rivi samalla tunnisteella perii historian');
A.strictEqual(KK.tRows(B,H.id).length,9,'historia ei nollaudu');A.strictEqual(t('Pisteet'),'Oikein 3 / 9 · 33,33 %');
// Tallennus ja tuonti
var QB=kierros(B);A.strictEqual(KK.Ev(QB,C).text(by(QB,'Pisteet').id),t('Pisteet'));A.strictEqual(KK.tRows(QB,H.id).length,9);
// Tiedosto on tallennusmuotoa, jonka appi hakee GitHubista
var f=JSON.parse(Kp.tiedosto(Kp.koeappiB()));A.strictEqual(f.app,'appiappi');A.strictEqual(f.ver,KK.VER);A.strictEqual(f.projekti.id,'pkoeappib');A.ok(f.projekti.b&&f.projekti.lg);A.ok(!f.projekti.cam&&!f.projekti.lcam);
console.log('logiikka_57 ok');
