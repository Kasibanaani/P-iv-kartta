// Appi-appi 19 (F12): käyttöraahaus, moottorin osuus. Raahattava-ominaisuus ja portit, pudotus kirjoittaa käyttötietoon
// (rakenne ei muutu), suunta (vain vaaka / vain pysty), kohdistus ruudun keskelle, pudotus vain alueisiin (muualle =
// peruttu, palikka ei liiku), tapahtumat raahaus alkoi / pudotettu / raahaus peruttu ja tapahtuman tiedot kohde, x, y,
// ruutux ja ruutuy. Merkki, Alue, Toistin ja kortin palikka eivät ole raahattavia.
var KK=require('./moottori.js'),A=require('assert');
var T=2000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function E(P){return KK.Ev(P,C);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function outs(b){return KK.portsBase(b).outs.map(function(o){return o.p;});}
/* Kirjaa tapahtuman: laskuri ja kaavan arvo muistiin, kun palikan portti laukeaa. */
function kirjaa(P,b,port,f){var m=KK.addBlock(P,'muisti',{v:''});N(P,m);var k=KK.addBlock(P,'kaava');N(P,k);k.f=KK.kaavaToIds(P,f);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}

// --- 0. Ominaisuus ja portit ---
var P=KK.newProject('r');var pa=U(P,'muoto',{laji:'ympyra'},100,100,40,40,'Pala');var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tp);
A.ok(!KK.raahattava(P,pa),'oletuksena ei raahattava');A.ok(outs(pa).indexOf('rpu')<0,'ei portteja ilman valintaa');
pa.raah=true;A.ok(KK.raahattava(P,pa),'raahattava');['ral','rpu','rpe'].forEach(function(p){A.ok(outs(pa).indexOf(p)>=0,'portti '+p);});
var nap=U(P,'nappi',{},10,10,80,40,'Nappi');nap.raah=true;A.ok(KK.raahattava(P,nap),'painike voi olla raahattava');A.ok(outs(nap).indexOf('e')>=0&&outs(nap).indexOf('rpu')>=0,'painikkeella sekä painettu että pudotettu');
['merkki','alue','toistin'].forEach(function(k){var b=U(P,k,{},-900,-900,50,50);b.raah=true;A.ok(!KK.raahattava(P,b),k+' ei raahattava');A.ok(outs(b).indexOf('rpu')<0,k+' ei portteja');});
var lo=KK.addBlock(P,'liike',{});lo.raah=true;A.ok(!KK.raahattava(P,lo),'logiikkapalikka ei raahattava');
var tst=U(P,'toistin',{},0,300,300,200,'Kortit');var kj=U(P,'teksti',{},10,310,100,30,'Kortin teksti');kj.tst=tst.id;kj.raah=true;A.ok(!KK.raahattava(P,kj),'kortin palikka ei raahattava');
['x','y','ruutux','ruutuy','kohde'].forEach(function(n){A.ok(KK.omFind(tp,n),'tapahtuma.'+n);});

// --- 1. Vapaa pudotus: käyttötieto, rakenne ennallaan, tapahtumat ---
KK.repair(P);
var cAl=laskuri(P,pa,'ral'),cPu=laskuri(P,pa,'rpu'),cPe=laskuri(P,pa,'rpe'),mx=kirjaa(P,pa,'rpu','tapahtuma.x'),my=kirjaa(P,pa,'rpu','tapahtuma.y'),mk=kirjaa(P,pa,'rpu','tapahtuma.kohde');KK.repair(P);
A.ok(KK.raahausAlku(P,pa.id,C));A.strictEqual(E(P).val(cAl.id),1,'raahaus alkoi');
var o=KK.raahausPudotus(P,pa.id,212.4,57,C);A.ok(o&&o.ok,'hyväksytty');
A.strictEqual(E(P).omiNum(pa.id,'x',0),212.4);A.strictEqual(E(P).omiNum(pa.id,'y',0),57);A.strictEqual(pa.x,100,'rakenne ennallaan');A.strictEqual(pa.y,100);
A.strictEqual(E(P).val(cPu.id),1,'pudotettu');A.strictEqual(E(P).val(cPe.id),0);A.strictEqual(E(P).val(mx.id),212.4,'tapahtuma.x');A.strictEqual(E(P).val(my.id),57,'tapahtuma.y');
A.ok(E(P).val(mk.id)==null||E(P).val(mk.id)==='','ei aluetta: kohde tyhjä');
KK.raahausPeruttu(P,pa.id,C);A.strictEqual(E(P).val(cPe.id),1,'peruttu');A.strictEqual(E(P).omiNum(pa.id,'x',0),212.4,'peruttu ei siirrä');
KK.resetOmi(P,pa.id);A.strictEqual(E(P).omiNum(pa.id,'x',0),100,'käyttötietojen tyhjennys palauttaa alkupaikan');

// --- 2. Suunta ---
pa.rax='x';o=KK.raahausPudotus(P,pa.id,150,400,C);A.strictEqual(o.y,100,'vain vaaka: y pysyy');A.strictEqual(E(P).omiNum(pa.id,'x',0),150);
pa.rax='y';o=KK.raahausPudotus(P,pa.id,300,30,C);A.strictEqual(o.x,150,'vain pysty: x pysyy');A.strictEqual(o.y,30);delete pa.rax;

// --- 3. Ruudukko: kohdistus ruudun keskelle ja tapahtuma.ruutux/ruutuy ---
P.views[0].kr=[{id:'pohja',n:'Pohja',rk:50}];var rx=kirjaa(P,pa,'rpu','tapahtuma.ruutux'),ry=kirjaa(P,pa,'rpu','tapahtuma.ruutuy');KK.repair(P);
o=KK.raahausPudotus(P,pa.id,118,61,C);A.strictEqual(o.x,118,'ilman kohdistusta vapaa');A.strictEqual(E(P).val(rx.id),3,'keskipiste 138 → ruutu 3');A.strictEqual(E(P).val(ry.id),2,'keskipiste 81 → ruutu 2');
pa.rko=true;o=KK.raahausPudotus(P,pa.id,118,61,C);A.strictEqual(o.x,105,'ruudun 3 keskelle (125 − 20)');A.strictEqual(o.y,55,'ruudun 2 keskelle (75 − 20)');
A.strictEqual(E(P).omiNum(pa.id,'x',0),105);A.strictEqual(E(P).val(rx.id),3);
pa.rax='x';o=KK.raahausPudotus(P,pa.id,118,61,C);A.strictEqual(o.y,55,'kohdistus ei liikuta lukittua akselia');A.strictEqual(o.x,105);delete pa.rax;delete pa.rko;P.views[0].kr=[];

// --- 4. Pudotus vain alueisiin; pienin osuva alue on kohde ---
var iso=U(P,'alue',{},300,0,300,300,'Pöytä'),pie=U(P,'alue',{},350,50,100,100,'Kori');KK.repair(P);
pa.rpa='alue';var x0=E(P).omiNum(pa.id,'x',0),y0=E(P).omiNum(pa.id,'y',0),pe0=E(P).val(cPe.id),pu0=E(P).val(cPu.id);
o=KK.raahausPudotus(P,pa.id,10,10,C);A.ok(!o.ok,'alueen ulkopuolelle ei');A.strictEqual(E(P).omiNum(pa.id,'x',0),x0,'ei liikkunut');A.strictEqual(E(P).omiNum(pa.id,'y',0),y0);
A.strictEqual(E(P).val(cPe.id),pe0+1,'hylätty pudotus = raahaus peruttu');A.strictEqual(E(P).val(cPu.id),pu0);
o=KK.raahausPudotus(P,pa.id,380,80,C);A.ok(o.ok);A.strictEqual(E(P).val(mk.id),'Kori','pienin alue');
o=KK.raahausPudotus(P,pa.id,520,220,C);A.ok(o.ok);A.strictEqual(E(P).val(mk.id),'Pöytä','iso alue');
pa.rpa='';o=KK.raahausPudotus(P,pa.id,700,700,C);A.ok(o.ok,'minne vain');A.ok(E(P).val(mk.id)==null||E(P).val(mk.id)==='','ei aluetta: '+E(P).val(mk.id));

console.log('logiikka_53_raahaus ok');
