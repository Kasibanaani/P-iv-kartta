// Jono 1i: Tietotaulukolle taulu.eka, taulu.vika ja taulu.vika.<sarake> kuten Rivijoukolla (palikkasääntö A8).
// Rivit taulukon omassa järjestyksessä, käyttötiedot voittavat rakennusrivit, tyhjä taulukko = puuttuu,
// sarakkeen nimen vaihto ei riko kaavaa, ominaisuusrekisteri ja viitevalitsin tuntevat ne. Rivijoukko-kiertotie toimii edelleen.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,12,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,'');return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function kv(P,f){return val(P,kaava(P,f).b.id);}

var P=KK.newProject('taulu-eka');
var T=blk(P,'taulu',{nm:'Ostokset'});var cN=KK.addCol(T.b,'Nimi','teksti'),cM=KK.addCol(T.b,'Määrä','luku');KK.repair(P);
// Tyhjä taulukko: rivi puuttuu, kenttä puuttuu, tiedossa = ei, väärä sarake on virhe
A.strictEqual(kv(P,'ostokset.eka'),null,'tyhjä: ei riviä');
A.strictEqual(kv(P,'ostokset.vika.nimi.tiedossa'),false);
var tyh=kv(P,'ostokset.vika.määrä');A.ok(tyh==null||KK.isMiss(tyh),'tyhjä: puuttuu, ei virhe: '+JSON.stringify(tyh));
var vs=kv(P,'ostokset.eka.hinta');A.ok(KK.isErr(vs)&&/ei ole saraketta/.test(vs.err),'tyhjässäkin väärä sarake on virhe: '+JSON.stringify(vs));
// Rakennusrivit
function row(use,n,m){var r=KK.tAddRow(P,T.b.id,use);KK.tEdit(P,T.b.id,use,r,cN.id,n,new Date(NOW));if(m!=null)KK.tEdit(P,T.b.id,use,r,cM.id,m,new Date(NOW));return r;}
var r1=row(false,'Maito',2),r2=row(false,'Leipä',1),r3=row(false,'Omena',6);
A.strictEqual(kv(P,'ostokset.eka.nimi'),'Maito');A.strictEqual(kv(P,'ostokset.vika.nimi'),'Omena');
A.strictEqual(kv(P,'ostokset.vika.määrä'),6);A.strictEqual(kv(P,'ostokset.eka.määrä + ostokset.vika.määrä'),8);
A.strictEqual(kv(P,'ostokset.ensimmäinen.nimi'),'Maito','pitkä nimi käy');A.strictEqual(kv(P,'ostokset.viimeinen.nimi'),'Omena');
var ref=kv(P,'ostokset.vika');A.ok(KK.isR(ref)&&ref.rr===T.b.id&&ref.ri===r3,'riviviite: '+JSON.stringify(ref));
A.strictEqual(kv(P,'ostokset.eka.nimi.tiedossa'),true);
// Järjestys taulukon oman järjestyksen mukaan
KK.tMoveRow(P,T.b.id,false,r3,-1);A.strictEqual(kv(P,'ostokset.vika.nimi'),'Leipä','siirto muuttaa viimeisen');
KK.tDelRow(P,T.b.id,false,r1);A.strictEqual(kv(P,'ostokset.eka.nimi'),'Omena','poisto muuttaa ensimmäisen');
// Käyttötiedot (Lisää rivi käytössä) voittavat rakennusrivit
KK.tUse(P,T.b.id);var u=row(true,'Kahvi',3);A.strictEqual(kv(P,'ostokset.vika.nimi'),'Kahvi','käytössä lisätty rivi on viimeinen');
// Valittu ei muutu
KK.tSetSel(P,T.b.id,r3);A.strictEqual(kv(P,'ostokset.valittu.nimi'),'Omena');A.strictEqual(kv(P,'ostokset.vika.nimi'),'Kahvi');
// Tallennus tunnisteina, sarakkeen nimen vaihto ei riko
var k=kaava(P,'ostokset.vika.määrä * 2');A.ok(/\.vika\.c\d+/.test(k.b.f),'tunnisteina: '+k.b.f);
KK.setColName(T.b,cM.id,'Kpl');A.strictEqual(KK.kaavaToText(P,k.b.f),'ostokset.vika.kpl * 2');A.strictEqual(val(P,k.b.id),6);
// Virheviesti ilman riviä ehdottaa myös ekaa
var ev=kv(P,'ostokset.nimi');A.ok(KK.isErr(ev)&&/ostokset\.eka\.nimi/.test(ev.err),'vihje: '+JSON.stringify(ev));
// Rekisteri ja viitevalitsin
var om=KK.omat(T.b).map(function(e){return e.n;});A.ok(om.indexOf('eka')>=0&&om.indexOf('vika')>=0,'rekisterissä: '+om.join(','));
var pr=KK.tauluProps(P,T.b).map(function(x){return x[0];});['eka','vika','eka.nimi','vika.kpl'].forEach(function(n){A.ok(pr.indexOf(n)>=0,'valitsimessa '+n+': '+pr.join(','));});
// Rivijoukko-kiertotie toimii edelleen ja antaa saman
var J=blk(P,'joukko',{nm:'Kaikki'});A.ok(KK.addLink(P,T.n.id,'rj',J.n.id,'rv'));KK.repair(P);
A.strictEqual(kv(P,'kaikki.vika.nimi'),kv(P,'ostokset.vika.nimi'));A.strictEqual(kv(P,'kaikki.eka.nimi'),'Omena');
console.log('logiikka_65_taulu_eka ok');
