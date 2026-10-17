// Appi-appi 28 (F30 kohta 4): jos(ehto; kyllä; muuten), ja(…; …) ja tai(…; …) kaavassa. Puolipiste-erotin, sisäkkäinen
// jos, muuten-osa valinnainen, vain valittu osa lasketaan, puuttuva ehto ei päde, yksi vertailu tasoa kohden,
// virheet selvällä suomella, Kaavan tulos ja Miksi? (kumpi osa valittiin). Pelkät sulut ovat edelleen virhe.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,17,12,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0,'');}
function V(P,b,p){return KK.Ev(P,C).val(b.id,p);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}

var P=KK.newProject('jos');
var uni=KK.addBlock(P,'saadin',{nm:'Uni',min:0,max:12,start:8});N(P,uni);
var ika=KK.addBlock(P,'luku',{nm:'Ikä'});N(P,ika);KK.repair(P);KK.userSet(P,ika.id,40,C);

// Perusmuoto, kirjainkoko, muuten-osa valinnainen
var k1=K(P,'jos(uni > 7; "hyvä"; "huono")');A.strictEqual(V(P,k1),'hyvä');
A.strictEqual(KK.kaavaToText(P,k1.f),'jos(uni > 7; "hyvä"; "huono")','teksti säilyy');
KK.userSet(P,uni.id,6,C);A.strictEqual(V(P,k1),'huono');
A.strictEqual(V(P,K(P,'JOS(uni > 7; 1)')),null,'muuten puuttuu = tyhjä');
A.strictEqual(V(P,K(P,'Jos (uni < 7; 2,5; 0)')),2.5,'isot kirjaimet, välilyönti ennen sulkua, desimaalipilkku');
A.strictEqual(V(P,K(P,'jos(uni < 7;; "x")')),null,'tyhjä kyllä-osa');
// Laskut ja vertailu jos-funktion ympärillä
A.strictEqual(V(P,K(P,'jos(uni > 7; 10; 20) + 1')),21,'lasku tuloksen päälle');
A.strictEqual(V(P,K(P,'jos(uni > 7; 10; 20) > 15')),true,'vertailu ylimmällä tasolla');
A.strictEqual(V(P,K(P,'"Uni: " + jos(uni > 7; "hyvä"; "huono")')),'Uni: huono','teksti yhteen');
// Sisäkkäinen
var k2=K(P,'jos(uni >= 8; "hyvä"; jos(uni >= 6; "ok"; "huono"))');A.strictEqual(V(P,k2),'ok');
KK.userSet(P,uni.id,4,C);A.strictEqual(V(P,k2),'huono');KK.userSet(P,uni.id,9,C);A.strictEqual(V(P,k2),'hyvä');
// Vain valittu osa lasketaan: virhe valitsematta jääneessä ei näy
A.strictEqual(V(P,K(P,'jos(uni > 7; 1; 1 / 0)')),1,'muuten-osan virhe ei haittaa');
A.ok(KK.isErr(V(P,K(P,'jos(uni < 7; 1; 1 / 0)'))),'valitun osan virhe näkyy');
A.ok(KK.isErr(V(P,K(P,'jos(1 / 0 > 1; 1; 2)'))),'ehdon virhe näkyy');
// Puuttuva ehto ei päde
A.strictEqual(V(P,K(P,'jos(tyhjä; "on"; "ei ole")')),'ei ole','tyhjä ehto ei päde');

// JA ja TAI
A.strictEqual(V(P,K(P,'ja(uni > 7; ikä < 50)')),true);A.strictEqual(V(P,K(P,'ja(uni > 7; ikä > 50)')),false);
A.strictEqual(V(P,K(P,'tai(uni < 7; ikä > 50)')),false);A.strictEqual(V(P,K(P,'TAI(uni < 7; ikä < 50; kyllä)')),true,'monta osaa');
A.strictEqual(V(P,K(P,'ja(uni)')),true,'yksi osa');
A.strictEqual(V(P,K(P,'jos(ja(uni > 7; tai(ikä < 30; ikä > 35)); "kyllä"; "ei")')),'kyllä','ja ja tai jos-funktion sisällä');
A.ok(KK.isErr(V(P,K(P,'tai(kyllä; 1 / 0)'))),'ja/tai näyttävät virheen');

// Kaavan tulos saa arvon jos-funktiosta
var tul=KK.addBlock(P,'tulos',{nm:'Arvio'});N(P,tul);var kt=K(P,'arvio = jos(uni > 7; "levännyt"; "väsynyt")');
A.strictEqual(V(P,kt),'levännyt');A.strictEqual(V(P,tul),'levännyt','kaavan tulos');

// Samanniminen palikka: ilman sulkua viite, sulun kanssa funktio
var ja=KK.addBlock(P,'luku',{nm:'Ja'});N(P,ja);KK.repair(P);A.strictEqual(ja.vt,'ja');KK.userSet(P,ja.id,5,C);
var kj=K(P,'ja > 3');A.strictEqual(kj.f,'{#'+ja.id+'} > 3');A.strictEqual(V(P,kj),true,'viite');
A.strictEqual(V(P,K(P,'ja(ja > 3; uni > 7)')),true,'funktio ja viite samassa');

// Virheet selvällä suomella
function err(s,re){var v=V(P,K(P,s));A.ok(KK.isErr(v),s);A.ok(re.test(v.err),s+' → '+v.err);}
err('(uni + 1) > 7',/sulkuja ei käytetä/);err('(uni + 1) > 7',/ikkunaan/);
err('jos(uni > 7, 1, 2)',/puolipisteellä/);A.strictEqual(V(P,K(P,'jos(uni > 7;1,2)')),1.2,'pilkku ilman välilyöntiä on desimaali');
err('jos(uni > 7; 1',/jäi auki/);err('uni + 1)',/ilman avaavaa/);err('uni; 2',/puolipiste/);
err('jos(uni > 7)',/kyllä-osan/);err('jos(uni > 7; 1; 2; 3)',/enintään kolme/);err('ja()',/tarvitsee ehdot/);
err('jos(; 1; 2)',/ehto puuttuu/);err('uni > 7 > 2',/vain yksi vertailu/);err('jos(uni > 7 > 2; 1)',/vain yksi vertailu/);
err('jos uni > 7',/sulkuihin/);

// Miksi?: kumpi osa valittiin, myös sisäkkäin
KK.userSet(P,uni.id,6,C);var E=KK.Ev(P,C),w=KK.why(P,E,k2.id,2,{});
A.ok(/Ehto ”uni >= 8” ei päde, joten jos valitsi muuten-osan/.test(w.txt),w.txt);
A.ok(/Ehto ”uni >= 6” pätee, joten jos valitsi kyllä-osan/.test(w.txt),w.txt);
A.ok(KK.Ev(P,C).josTrace(kt.id).length===1,'kaavan tulos: jäljitys');
A.deepStrictEqual(KK.Ev(P,C).josTrace(K(P,'uni + 1').id),[],'ei jos-funktiota');
console.log('ok jos, ja, tai');
