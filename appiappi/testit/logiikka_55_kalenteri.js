// Appi-appi 21: kalenterin päivän valinta. Valittu päivä on käyttötietoa (st[id] = 'vvvv-kk-pp'), arvo ja ominaisuus
// valittu, tapahtuma päivä valittu (tapahtuma.uusi = päivä), sama päivä uudelleen poistaa valinnan ilman tapahtumaa.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id){return E(P).val(id);}
function kaava(P,f){var b=KK.addBlock(P,'kaava');KK.addNode(P,b.id,-600,0);b.f=KK.kaavaToIds(P,f);return b;}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0);return {b:b,n:n};}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+' → '+b.b.nm);return l;}
function pv(v){return v&&v.d;}

var P=KK.newProject('kalenteri');var vw=P.views[0].id;
var cal=blk(P,'kalenteri',{v:vw});A.strictEqual(cal.b.vt,'kalenteri');
A.deepStrictEqual(KK.portsBase(cal.b).outs.map(function(o){return o.p+':'+o.t;}),['v:v','e:e']);
A.ok(KK.omFind(cal.b,'valittu'),'ominaisuus valittu');A.ok(KK.omFind(cal.b,'kuukausi'),'kuukausi säilyy');
A.strictEqual(val(P,cal.b.id),null,'alussa ei valintaa');
var kv=kaava(P,'kalenteri.valittu');A.strictEqual(val(P,kv.id),null);

// Tapahtuma päivä valittu → Lisää laskuriin ja Aseta muisti = tapahtuma.uusi
blk(P,'tapaht',{nm:'Tapahtuma'});
var lask=blk(P,'muisti',{nm:'Laskuri',v:'0'}),muisti=blk(P,'muisti',{nm:'Päivä'});
var t1=blk(P,'tee',{do:'lisaa',o:lask.b.id}),t2=blk(P,'tee',{do:'aseta',o:muisti.b.id,v:{r:kaava(P,'tapahtuma.uusi').id}});
link(P,cal,'e',t1,'e');link(P,t1,'e',t2,'e');
KK.repair(P);
KK.kalenteriValitse(P,cal.b.id,'2026-10-14',C);
A.strictEqual(pv(val(P,cal.b.id)),'2026-10-14');A.strictEqual(P.st[cal.b.id],'2026-10-14','käyttötieto');
A.strictEqual(pv(val(P,kv.id)),'2026-10-14','kaava kalenteri.valittu');
A.strictEqual(val(P,lask.b.id),1,'päivä valittu');A.strictEqual(pv(val(P,muisti.b.id)),'2026-10-14','tapahtuma.uusi');
// toinen päivä
KK.kalenteriValitse(P,cal.b.id,'2026-10-20',C);A.strictEqual(pv(val(P,cal.b.id)),'2026-10-20');A.strictEqual(val(P,lask.b.id),2);
// sama päivä uudelleen: valinta pois, ei tapahtumaa
KK.kalenteriValitse(P,cal.b.id,'2026-10-20',C);A.strictEqual(val(P,cal.b.id),null,'valinta pois');A.strictEqual(val(P,lask.b.id),2,'poisto ei ole päivä valittu');
A.strictEqual(val(P,kv.id),null);

// Nuoli valittu päivä → toisen palikan arvo (pvm-kenttä seuraa)
var vrt=kaava(P,'kalenteri.valittu = 14.10.2026');KK.kalenteriValitse(P,cal.b.id,'2026-10-14',C);A.strictEqual(val(P,vrt.id),true,'vertailu päivämäärään');

// Aseta toiminto kalenteriin (myös tyhjennys)
KK.setVal(P,cal.b.id,KK.D('2026-11-01'),C);A.strictEqual(pv(val(P,cal.b.id)),'2026-11-01');
KK.setVal(P,cal.b.id,null,C);A.strictEqual(val(P,cal.b.id),null);
KK.setVal(P,cal.b.id,'3.12.2026',C);A.strictEqual(pv(val(P,cal.b.id)),'2026-12-03','teksti päivämääräksi');

// JSON-kierros ja korjaus säilyttävät valinnan; väärä laji ei tee mitään
var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(pv(val(P2,cal.b.id)),'2026-12-03');
var l0=val(P2,lask.b.id);KK.kalenteriValitse(P2,lask.b.id,'2026-10-01',C);A.strictEqual(val(P2,lask.b.id),l0,'ei kalenteri');

// Vanha kalenteri ilman käyttötietoa: ei valintaa, kuukausi-ominaisuus ennallaan
var P3=KK.newProject('vanha');var c3=blk(P3,'kalenteri',{v:P3.views[0].id});delete P3.st[c3.b.id];KK.repair(P3);
A.strictEqual(val(P3,c3.b.id),null);A.deepStrictEqual(c3.b.lahteet,[]);
console.log('logiikka_55_kalenteri ok');
