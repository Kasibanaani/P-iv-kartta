// Appi-appi 30 (jonon 1h): tekstihaku kaavassa, a sisältää b. Kirjainkoosta välittämättä, tyhjä haku pätee aina,
// puuttuva teksti ei päde. Sana on vertailu vain arvon jälkeen; muuten se on tavallinen viite. Toimii jos(…)-,
// ja(…)- ja tai(…)-funktioissa ja Rivijoukon ehtona (koeappi C:n hakukenttä), rivistä tulee selvä virhe.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,12,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,'');return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function kv(P,f){return val(P,kaava(P,f).b.id);}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli');return l;}

var P=KK.newProject('sisaltaa');
var nimi=blk(P,'muisti',{nm:'Nimi',v:'Mustikkapiirakka'}),haku=blk(P,'muisti',{nm:'Haku',v:'PIIRA'});KK.repair(P);
// Perus, kirjainkoko, ä/ö, teksti säilyy
var k1=kaava(P,'nimi sisältää haku');A.strictEqual(val(P,k1.b.id),true,'isot kirjaimet haussa');
A.strictEqual(KK.kaavaToText(P,k1.b.f),'nimi sisältää haku','teksti säilyy');
A.ok(/\{#b\d+\} sisältää \{#b\d+\}/.test(k1.b.f),'tallessa tunnisteet: '+k1.b.f);
A.strictEqual(kv(P,'nimi SISÄLTÄÄ "mustikka"'),true,'sana isoilla');
A.strictEqual(kv(P,'nimi sisaltaa "kka"'),true,'ilman pisteitä');
A.strictEqual(kv(P,'nimi sisältää "puolukka"'),false);
A.strictEqual(kv(P,'"Äitienpäivä" sisältää "PÄIVÄ"'),true,'ä/ö kirjainkoosta välittämättä');
A.strictEqual(kv(P,'nimi sisältää "  piira "'),true,'haun reunojen välilyönnit eivät haittaa');
A.strictEqual(kv(P,'nimi sisältää "a p"'),false,'välilyönti haun keskellä on osa hakua');
// Tyhjä haku pätee aina, puuttuva teksti ei päde
A.strictEqual(kv(P,'nimi sisältää ""'),true,'tyhjä haku');A.strictEqual(kv(P,'nimi sisältää tyhjä'),true);
KK.userSet(P,haku.b.id,'',C);A.strictEqual(val(P,k1.b.id),true,'tyhjä hakukenttä näyttää kaiken');
var tyh=blk(P,'muisti',{nm:'Tyhjä teksti'});KK.repair(P);
A.strictEqual(kv(P,'tyhjäteksti sisältää "a"'),false,'tyhjä teksti ei päde');
A.strictEqual(kv(P,'tyhjä sisältää "a"'),false);
A.strictEqual(kv(P,'tyhjäteksti sisältää ""'),true,'tyhjä haku pätee tyhjäänkin');
// Luvut ja kyllä/ei tekstinä
A.strictEqual(kv(P,'2,5 sisältää ","'),true,'luku suomalaisena tekstinä');A.strictEqual(kv(P,'kyllä sisältää "ky"'),true);
// Funktioiden sisällä ja ympärillä
KK.userSet(P,haku.b.id,'mustikka',C);
A.strictEqual(kv(P,'jos(nimi sisältää haku; "löytyi"; "ei")'),'löytyi');
A.strictEqual(kv(P,'ja(nimi sisältää "musti"; nimi sisältää "kka")'),true);
A.strictEqual(kv(P,'tai(nimi sisältää "x"; nimi sisältää "y")'),false);
A.strictEqual(kv(P,'jos(nimi sisältää "x"; ei; kyllä)'),true,'ei sisällä -kiertotie');
A.strictEqual(kv(P,'nimi + "!" sisältää "a!"'),true,'lasku ennen vertailua');
var two=kv(P,'nimi sisältää "a" sisältää "b"');A.ok(KK.isErr(two)&&/vain yksi vertailu/.test(two.err),'kaksi vertailua: '+(two&&two.err));
// Sana ilman arvoa edellä on viite; samanniminen palikka toimii omalla paikallaan
var s=blk(P,'muisti',{nm:'Sisältää',v:'hei'});KK.repair(P);A.strictEqual(s.b.vt,'sisältää');
A.strictEqual(kv(P,'sisältää'),'hei','palikka nimeltä sisältää');A.strictEqual(kv(P,'sisältää sisältää "e"'),true);
var bad=kv(P,'sisältää "a"');A.ok(KK.isErr(bad),'pelkkä sana ja teksti on virhe');
// Rivijoukon ehto: kohde.nimi sisältää haku
var T=blk(P,'taulu',{nm:'Kohteet'});var cN=KK.addCol(T.b,'Nimi','teksti');
function row(v){var r=KK.tAddRow(P,T.b.id,false);if(v!=null)KK.tEdit(P,T.b.id,false,r,cN.id,v,new Date(NOW));return r;}
var r1=row('Kauppa'),r2=row('Apteekki'),r3=row(null),r4=row('kirjasto');
var kohde=blk(P,'trivi',{nm:'Kohde',tt:T.b.id});var J=blk(P,'joukko',{nm:'Löydetyt'});link(P,T,'rj',J,'rv');
var eh=kaava(P,'kohde.nimi sisältää haku');link(P,eh,'v',J,'c');KK.repair(P);
KK.userSet(P,haku.b.id,'K',C);A.strictEqual(val(P,J.b.id,'rj').ids.join(','),[r1,r2,r4].join(','),'k löytää kolme, tyhjä rivi ei');
KK.userSet(P,haku.b.id,'KAU',C);A.strictEqual(val(P,J.b.id,'rj').ids.join(','),r1);
KK.userSet(P,haku.b.id,'',C);A.strictEqual(val(P,J.b.id,'rj').ids.join(','),[r1,r2,r3,r4].join(','),'tyhjä haku: kaikki rivit');
var rr=kv(P,"löydetyt.eka sisältää \"a\"");A.ok(KK.isErr(rr)&&/sarakkeesta/.test(rr.err),"rivi ei ole tekstiä: "+JSON.stringify(rr));
console.log('logiikka_64_sisaltaa ok');
