// Jonon 12f (F39/F41): viittaustapa @, § tai { }. Tallennus pysyy {#id}; tapa muuttaa vain näytön ja kirjoituksen.
// Säännöt (suunnitelma 23 kohta 2.2, @ suunnitelman 25 mukaan): alku, loppu, piste vain ominaisuuden edessä,
// tuntematon jää tekstiksi, @@ = merkki tekstinä, poistettu ⚠, sekaisin {uni} ja @uni, edestakaisin sama tallennus.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,18,9,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
var P=KK.newProject('viittaus');
var uni=KK.addBlock(P,'arvo',{nm:'Uni',v:'7'});KK.addNode(P,uni.id,0,0);
var pis=KK.addBlock(P,'arvo',{nm:'Pisteet',v:'5'});KK.addNode(P,pis.id,0,60);
var pel=KK.addBlock(P,'muoto',{nm:'Pelaaja',x:10,y:20});
var t=KK.addBlock(P,'taulu',{nm:'Kauppa'});KK.addNode(P,t.id,0,120);var sar=KK.addCol(t,'Hinta','luku');
var U='{#'+uni.id+'}',Pi='{#'+pis.id+'}';
function ids(s,c){return KK.toIds(P,s,c||'@');}
function nm(s,c){return KK.toNames(P,s,c||'@');}
// 1. Alku: vain rivin alussa tai muun kuin kirjaimen/numeron jälkeen
A.strictEqual(ids('Unta @uni h'),'Unta '+U+' h');
A.strictEqual(ids('@uni'),U);
A.strictEqual(ids('emil@uni.fi'),'emil@uni.fi','sähköposti ei muutu');
A.strictEqual(ids('(@uni)'),'('+U+')');
// 2. Kirjainkoko ei haittaa
A.strictEqual(ids('@Uni tänään'),U+' tänään');
// 3. Loppu: välimerkit, kaksoispiste taivutukseen
A.strictEqual(ids('@uni:n määrä'),U+':n määrä');
A.strictEqual(ids('@uni, @pisteet!'),U+', '+Pi+'!');
A.strictEqual(ids('a\n@uni\nb'),'a\n'+U+'\nb');
// 4. Piste vain tunnetun ominaisuuden edessä
A.strictEqual(ids('Sait @pisteet.'),'Sait '+Pi+'.');
A.strictEqual(ids('@pelaaja.x'),'{#'+pel.id+'.x}');
A.strictEqual(ids('@pisteet.Loppu'),Pi+'.Loppu','tuntematon sana pisteen jälkeen on tekstiä');
A.strictEqual(ids('@kauppa.hinta.summa'),'{#'+t.id+'.'+sar.id+'.summa}','taulukon polku sarakkeen tunnisteella');
A.strictEqual(nm('{#'+t.id+'.'+sar.id+'.summa}'),'@kauppa.hinta.summa');
// 5. Tuntematon sana jää tekstiksi, ei odottavaksi viitteeksi
A.strictEqual(ids('#kesä ja @kesä'),'#kesä ja @kesä');
A.strictEqual(ids('{kesä}'),'{kesä}','{ } jää odottamaan kuten ennen');
// 6. @@ = merkki tekstinä, kun perässä on viite
A.strictEqual(ids('@@uni'),'@uni');
A.strictEqual(nm('@uni'),'@@uni','tekstinä tallennettu @uni näytetään tuplana');
A.strictEqual(ids('@@kesä'),'@@kesä','tuplaa tarvitaan vain olemassa olevan viitteen edessä');
// 7. Poistettu kohde
var P2=KK.newProject('poisto');var a=KK.addBlock(P2,'arvo',{nm:'Pisteet',v:'5'});KK.addNode(P2,a.id,0,0);
var tx=KK.addBlock(P2,'nayta',{tx:KK.toIds(P2,'Sinulla on {pisteet}')});KK.removeBlock(P2,a.id);
A.strictEqual(KK.toNames(P2,tx.tx,'@'),'Sinulla on @⚠pisteet');A.strictEqual(KK.toIds(P2,'Sinulla on @⚠pisteet','@'),tx.tx);
// 8. {uni} ymmärretään aina, sekaisin
A.strictEqual(ids('{uni} ja @pisteet ja {Pisteet}'),U+' ja '+Pi+' ja '+Pi);
A.strictEqual(ids('{uni}a'),U+'a','käppyrillä viitteen voi liimata sanaan');
A.strictEqual(nm(U+'a'),'{uni}a','liimattu näytetään käppyröin, jotta tallennus ei muutu');
A.strictEqual(nm(U+'.Loppu'),'{uni}.Loppu');
// Näyttö: aina viite, ei nimeä; ominaisuus
var P3=KK.newProject('nimi');var v=KK.addBlock(P3,'arvo',{nm:'Unen määrä',v:'8'});KK.addNode(P3,v.id,0,0);
A.strictEqual(KK.toNames(P3,'{#'+v.id+'} h','@'),'@'+v.vt+' h');A.strictEqual(KK.toNames(P3,'{#'+v.id+'} h'),'{Unen määrä} h','{ }-tapa ennallaan');
A.strictEqual(nm('{#'+pel.id+'.x}'),'@pelaaja.x');
// §-tapa
A.strictEqual(ids('kohta§3 ja §uni','§'),'kohta§3 ja '+U);A.strictEqual(nm(U,'§'),'§uni');A.strictEqual(ids('@uni','§'),'@uni','toisen tavan merkki on tekstiä');
// Edestakaisin: toIds(toNames(x)) = x jokaisella tavalla
['Unta '+U+' h, '+Pi+'.',U+'a','@uni ja @@uni ja '+U,'emil@uni.fi '+U,'{#'+pel.id+'.x} ja {#'+pel.id+'.leveys}',U+'.Loppu','{kesä} '+U+':n','§uni '+U,'{#'+t.id+'.'+sar.id+'.summa}.',
 '{#'+pis.id+'.lentonopeus}'].forEach(function(x){['@','§','{'].forEach(function(c){A.strictEqual(KK.toIds(P,KK.toNames(P,x,c),c),x,c+' '+x+' → '+KK.toNames(P,x,c));});});
// Arvo tekstissä ennallaan
var n1=KK.addBlock(P,'nayta',{tx:ids('Unta @uni h, pisteet @pisteet.')});A.strictEqual(E(P).text(n1.id),'Unta 7 h, pisteet 5.');
// Kaava hyväksyy etumerkin ja näytetään paljain viittein
var kf=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'@uni + 3')});KK.addNode(P,kf.id,200,0);
A.strictEqual(kf.f,KK.kaavaToIds(P,'uni + 3'));A.strictEqual(E(P).val(kf.id),10);A.strictEqual(KK.kaavaToText(P,kf.f),'uni + 3');
A.strictEqual(KK.kaavaToIds(P,'§uni * 2'),KK.kaavaToIds(P,'uni * 2'));
// Moottorin kuvaukset seuraavat UI:n kertomaa tapaa; oletus { }
var ilm=KK.addBlock(P,'tee',{do:'ilmoita',tx:U+' h'});
A.strictEqual(KK.setRefTapa('@'),'@');A.ok(/@uni h/.test(KK.descAct(P,ilm.id)),KK.descAct(P,ilm.id));
KK.setRefTapa('{');A.ok(/\{Uni\} h/.test(KK.descAct(P,ilm.id)),KK.descAct(P,ilm.id));
A.strictEqual(KK.refTapa('#'),'{','# on varattu joukoille, ei viittaustapa');
console.log('ok viittaustapa');
