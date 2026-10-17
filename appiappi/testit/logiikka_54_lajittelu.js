// Appi-appi 20 (F12, 2. osa): korttien järjestys. Toistimen Järjestä raahaamalla -valinta ja portti rivi siirretty,
// tstSiirra muuttaa taulukon rivijärjestystä käyttötiedossa (lähtöaineisto ennallaan, tyhjennys palauttaa) ja lähettää
// tapahtuman (rivi, vanha, uusi); vain suoraan Tietotaulukosta tulevilla riveillä. Toiminto Siirrä rivi ylös / alas
// valitulle ja tapahtuman (kortin) riville, reunat, tapahtuman tiedot, selkokielinen kuvaus ja korjaus. Pudotusalueiden lista.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,10,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0);return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+'.'+ap+' → '+b.b.nm+'.'+bp);return l;}
function taulu(P,nm,cols){var t=blk(P,'taulu',{nm:nm});var c={};cols.forEach(function(x){c[x[0]]=KK.addCol(t.b,x[0],x[1],x[2]);});return {t:t.b,n:t.n,b:t.b,c:c};}
function rivi(P,T,vals){var rid=KK.tAddRow(P,T.t.id,false);Object.keys(vals).forEach(function(k){KK.tEdit(P,T.t.id,false,rid,T.c[k].id,vals[k],new Date(NOW));});return rid;}
function ui(P,k,props,x,y){var p=props||{};p.v=P.views[0].id;var o=blk(P,k,p,0,0);o.b.x=x;o.b.y=y;return o;}
function jarj(P,T){return KK.tRows(P,T.t.id).map(function(r){return r.id;});}
function outs(b){return KK.portsBase(b).outs.map(function(o){return o.p;});}
function kirjaa(P,src,port,f){var m=blk(P,'muisti',{v:''});var t=blk(P,'tee',{do:'aseta',o:m.b.id});link(P,kaava(P,f),'v',t,'v');link(P,src,port,t,'e');return m;}

// --- 1. Toistin: valinta, portti ja lähde ---
var P=KK.newProject('laj');var T=taulu(P,'Tehtävät',[['Nimi','teksti']]);
var r1=rivi(P,T,{'Nimi':'Yksi'}),r2=rivi(P,T,{'Nimi':'Kaksi'}),r3=rivi(P,T,{'Nimi':'Kolme'}),r4=rivi(P,T,{'Nimi':'Neljä'});
var TS=ui(P,'toistin',{nm:'Kortit'},0,0);blk(P,'tapaht',{nm:'Tapahtuma'});KK.repair(P);
A.ok(outs(TS.b).indexOf('rsi')<0,'ei porttia ilman valintaa');A.ok(!KK.tstLajittuu(P,TS.b),'ei valintaa');
TS.b.tlaj=true;A.ok(outs(TS.b).indexOf('rsi')>=0,'portti rivi siirretty');A.ok(!KK.tstLajittuu(P,TS.b),'ei rivejä: ei lajittelua');
A.ok(!KK.tstSiirra(P,TS.b.id,r1,2,C),'ilman lähdettä ei siirrä');
link(P,T,'rj',TS,'rv');A.ok(KK.tstLajittuu(P,TS.b),'suoraan taulukosta');A.strictEqual(KK.tstLahde(P,TS.b.id).id,T.t.id);

// --- 2. Siirto: käyttötieto, tapahtuma ---
var cnt=blk(P,'muisti',{v:'0'});var tl=blk(P,'tee',{do:'lisaa',o:cnt.b.id});link(P,TS,'rsi',tl,'e');
var mR=kirjaa(P,TS,'rsi','tapahtuma.rivi.nimi'),mV=kirjaa(P,TS,'rsi','tapahtuma.vanha'),mU=kirjaa(P,TS,'rsi','tapahtuma.uusi');KK.repair(P);
A.ok(KK.tstSiirra(P,TS.b.id,r1,2,C),'siirretty');A.deepStrictEqual(jarj(P,T),[r2,r3,r1,r4]);
A.deepStrictEqual(T.t.rv.map(function(r){return r.id;}),[r1,r2,r3,r4],'lähtöaineisto ennallaan');
A.strictEqual(val(P,cnt.b.id),1,'tapahtuma');A.strictEqual(val(P,mR.b.id),'Yksi','tapahtuma.rivi');A.strictEqual(val(P,mV.b.id),1,'vanha paikka');A.strictEqual(val(P,mU.b.id),3,'uusi paikka');
A.deepStrictEqual(E(P).rowsIn(TS.b.id).ids,[r2,r3,r1,r4],'kortit uudessa järjestyksessä');
A.ok(!KK.tstSiirra(P,TS.b.id,r1,2,C),'sama paikka: ei tapahtumaa');A.strictEqual(val(P,cnt.b.id),1);
KK.tstSiirra(P,TS.b.id,r4,0,C);A.deepStrictEqual(jarj(P,T),[r4,r2,r3,r1],'alkuun');
KK.tstSiirra(P,TS.b.id,r2,99,C);A.deepStrictEqual(jarj(P,T),[r4,r3,r1,r2],'yli lopun = loppuun');
A.ok(!KK.tstSiirra(P,TS.b.id,'r999',0,C),'tuntematon rivi');
var j=JSON.parse(JSON.stringify(P));KK.repair(j);A.deepStrictEqual(KK.tRows(j,T.t.id).map(function(r){return r.id;}),[r4,r3,r1,r2],'säilyy tallennuksessa');
delete P.st[T.t.id];A.deepStrictEqual(jarj(P,T),[r1,r2,r3,r4],'käyttötietojen tyhjennys palauttaa');

// --- 3. Rivijoukon kautta ei lajitella ---
var J=blk(P,'joukko',{nm:'Joukko'});link(P,T,'rj',J,'rv');var TS2=ui(P,'toistin',{nm:'Kortit2',tlaj:true},0,400);link(P,J,'rj',TS2,'rv');KK.repair(P);
A.ok(!KK.tstLajittuu(P,TS2.b),'Rivijoukon kautta ei');A.ok(!KK.tstSiirra(P,TS2.b.id,r1,2,C));
TS2.b.tlaj='kyllä';KK.repair(P);A.strictEqual(TS2.b.tlaj,undefined,'korjaus: vain true');

// --- 4. Toiminto Siirrä rivi ylös / alas ---
P=KK.newProject('siirra');T=taulu(P,'Lista',[['Nimi','teksti']]);r1=rivi(P,T,{'Nimi':'A'});r2=rivi(P,T,{'Nimi':'B'});r3=rivi(P,T,{'Nimi':'C'});blk(P,'tapaht',{nm:'Tapahtuma'});
A.ok(KK.DOS.siirrarivi,'toiminto rekisterissä');
var nap=ui(P,'nappi',{nm:'Ylös'},0,0),ylos=blk(P,'tee',{do:'siirrarivi',o:T.t.id});link(P,nap,'e',ylos,'e');
var nap2=ui(P,'nappi',{nm:'Alas'},0,60),alas=blk(P,'tee',{do:'siirrarivi',o:T.t.id,rsu:'alas',rl:'tapahtuma'});link(P,nap2,'e',alas,'e');
var mU2=kirjaa(P,ylos,'e','tapahtuma.uusi');KK.repair(P);
A.ok(/Siirrä rivi ylös: Lista/.test(KK.descAct(P,ylos.b.id)),'kuvaus: '+KK.descAct(P,ylos.b.id));A.ok(/alas/.test(KK.descAct(P,alas.b.id)));
KK.press(P,nap.b.id,C);A.deepStrictEqual(jarj(P,T),[r1,r2,r3],'ei valittua riviä: ei muutosta');
KK.tSetSel(P,T.t.id,r3);KK.press(P,nap.b.id,C);A.deepStrictEqual(jarj(P,T),[r1,r3,r2],'valittu ylös');A.strictEqual(val(P,mU2.b.id),2,'tapahtuma.uusi');
KK.press(P,nap.b.id,C);KK.press(P,nap.b.id,C);A.deepStrictEqual(jarj(P,T),[r3,r1,r2],'ensimmäinen ei siirry ylemmäs');A.strictEqual(val(P,mU2.b.id),1);
A.deepStrictEqual(T.t.rv.map(function(r){return r.id;}),[r1,r2,r3],'lähtöaineisto ennallaan');
// Kortin painike: tapahtuman rivi = kortin rivi
var TS3=ui(P,'toistin',{nm:'Kortit'},200,0);link(P,T,'rj',TS3,'rv');var kp=ui(P,'nappi',{nm:'Alas kortissa',tst:TS3.b.id},210,10);
var al2=blk(P,'tee',{do:'siirrarivi',o:T.t.id,rsu:'alas',rl:'tapahtuma'});link(P,kp,'e',al2,'e');KK.repair(P);
KK.press(P,kp.b.id,KK.tstCtx(P,C,kp.b.id,r3));A.deepStrictEqual(jarj(P,T),[r1,r3,r2],'kortin rivi alas');
KK.press(P,kp.b.id,KK.tstCtx(P,C,kp.b.id,r2));A.deepStrictEqual(jarj(P,T),[r1,r3,r2],'viimeinen ei siirry alemmas');
alas.b.rsu='sivulle';KK.repair(P);A.strictEqual(alas.b.rsu,undefined,'korjaus: suunta');
A.strictEqual(KK.tauluIssue(P,ylos.b,T.t),'','ei huomautusta');

// --- 5. Pudotusalueiden lista ---
P=KK.newProject('al');var pa=ui(P,'muoto',{nm:'Pala'},0,0);pa.b.w=40;pa.b.h=40;var a1=ui(P,'alue',{nm:'Kori'},100,0);a1.b.w=80;a1.b.h=80;a1.b.muoto='ympyra';
KK.repair(P);
var ks=KK.raahausKohteet(P,pa.b,C);A.strictEqual(ks.length,1,'alue, ei palikka itse');A.strictEqual(ks[0].nm,'Kori');A.strictEqual(ks[0].x,100);A.strictEqual(ks[0].w,80);
console.log('logiikka_54_lajittelu ok');
