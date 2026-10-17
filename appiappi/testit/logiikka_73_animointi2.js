// F29 vaihe 2: animointi.arvo (arvo vaihtuu) ja animointi.paikka (paikka vaihtuu) ominaisuusrekisterissä. Arvo vaihtuu vain
// arvon näyttävillä palikoilla (Teksti, Muoto, Monitori: töks, ristihäivytys, luku rullaa; Kuva, Painike, Ilmoitus: töks,
// ristihäivytys), ei syötekentillä. Paikka vaihtuu kaikilla näkymän palikoilla. Projektin oletus P.an.v ja P.an.m; luku
// rullaa on oletuksena ristihäivytys palikoilla, joissa sitä ei ole. Aseta ja nuoli ohjaavat. Vanha projekti = töks.
var KK=require('./moottori.js'),A=require('assert'),fs=require('fs');
var C={now:function(){return new Date(2026,9,17,12,0,0);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function blk(P,k,props,nm){var b=KK.addBlock(P,k,props||{});KK.addNode(P,b.id,0,0,'');if(nm)KK.setName(P,b.id,nm);return b;}
function kv(P,f){var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,-600,0,'');k.f=KK.kaavaToIds(P,f);return E(P).val(k.id);}
function has(b,n){return KK.omat(b).some(function(e){return e.n===n;});}
function opts(b){var e=KK.omFind(b,'animointi.arvo');return e?e.opt.map(function(o){return o[0];}).join(','):null;}

var P=KK.newProject('animointi2'),vw=P.views[0].id;
var T=blk(P,'nayta',{v:vw,tx:'5'},'Pisteet'),Mu=blk(P,'muoto',{v:vw},'Laatikko'),Mi=blk(P,'mittari',{v:vw},'Mittari');
var Ku=blk(P,'pkuva',{v:vw},'Kuva'),N=blk(P,'nappi',{v:vw,tx:'Paina'},'Nappi'),Il=blk(P,'ilmo',{v:vw,tx:'Huom'},'Ilmo');
var Tk=blk(P,'teksti',{v:vw},'Kentta'),R=blk(P,'ruutu',{v:vw,tx:'R'},'Rasti'),Sa=blk(P,'saadin',{v:vw},'Saadin');
var Mm=blk(P,'muisti',{v:'0'},'Muisti'),Si=KK.addBlock(P,'merkki',{v:vw});
KK.repair(P);
// Rekisteri
[T,Mu,Mi].forEach(function(b){A.strictEqual(opts(b),'toks,ristihaivytys,rullaa',b.k);});
[Ku,N,Il].forEach(function(b){A.strictEqual(opts(b),'toks,ristihaivytys',b.k);});
[Tk,R,Sa,Mm,Si].forEach(function(b){A.ok(!has(b,'animointi.arvo'),'ei arvoa: '+b.k);});
[T,Mu,Mi,Ku,N,Il,Tk,R,Sa].forEach(function(b){A.ok(has(b,'animointi.paikka'),'paikka: '+b.k);});
A.ok(!has(Mm,'animointi.paikka')&&!has(Si,'animointi.paikka'),'ei logiikalla eikä Sijainnilla');
// Perusarvot töks, näkyvällä nimellä
A.strictEqual(kv(P,'pisteet.animointi.arvo'),'töks');A.strictEqual(kv(P,'pisteet.animointi.paikka'),'töks');A.strictEqual(kv(P,'kuva.animointi.arvo'),'töks');
// Projektin oletus; luku rullaa on kuvalla ristihäivytys
P.an={v:'rullaa',m:'liukuu'};
A.strictEqual(kv(P,'pisteet.animointi.arvo'),'luku rullaa');A.strictEqual(kv(P,'kuva.animointi.arvo'),'ristihäivytys');A.strictEqual(kv(P,'nappi.animointi.paikka'),'liukuu');
// Palikan oma voittaa
T.anv='ristihaivytys';Ku.anm='toks';A.strictEqual(kv(P,'pisteet.animointi.arvo'),'ristihäivytys');A.strictEqual(kv(P,'kuva.animointi.paikka'),'töks');
// Aseta: nimellä ja numerolla; luku rullaa ei käy kuvalle
A.ok(KK.setOmi(P,Mi.id,'animointi.arvo','luku rullaa'));A.strictEqual(kv(P,'mittari.animointi.arvo'),'luku rullaa');
A.ok(KK.setOmi(P,Mi.id,'animointi.arvo',2));A.strictEqual(kv(P,'mittari.animointi.arvo'),'ristihäivytys','numerolla');
A.ok(!KK.setOmi(P,Ku.id,'animointi.arvo','luku rullaa'),'kuvalle ei rullaa');
A.ok(KK.setOmi(P,R.id,'animointi.paikka','liukuu'));A.strictEqual(kv(P,'rasti.animointi.paikka'),'liukuu');
KK.resetOmi(P,R.id,'animointi.paikka');A.strictEqual(kv(P,'rasti.animointi.paikka'),'liukuu','Palauta: projektin oletus');
// Nuoli
var Ar=blk(P,'kaava',{},'Tapa');Ar.f='"liukuu"';N.ohk=['anpaikka'];A.ok(KK.addLink(P,KK.nodesOfBlock(P,Ar.id)[0].id,'v',KK.nodesOfBlock(P,N.id)[0].id,'o_anpaikka'),'nuoli');
P.an={};A.strictEqual(kv(P,'nappi.animointi.paikka'),'liukuu','nuolesta');
// Tallennus: v ja m säilyvät, tuntemattomat pois; vanha projekti töks
var R3=KK.repair({b:{},lg:{n:[],l:[]},an:{v:'rullaa',m:'liukuu',z:1,i:''}});A.deepStrictEqual(R3.an,{v:'rullaa',m:'liukuu'});
P.an={v:'rullaa'};var Q=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(Q.b[T.id].anv,'ristihaivytys');A.deepStrictEqual(Q.an,{v:'rullaa'});
var old=JSON.parse(fs.readFileSync(__dirname+'/vanha_v5_esimerkki.json','utf8'));var OP=KK.repair(old.projects?old.projects[0]:old);
var ui=Object.keys(OP.b).filter(function(i){return KK.omFind(OP.b[i],'animointi.paikka');})[0];A.ok(ui,'vanhassa on näkymän palikka');
A.strictEqual(E(OP).prop(ui,'animointi.paikka'),'töks','vanha = töks');A.ok(OP.b[ui].anm===undefined&&OP.b[ui].anv===undefined,'ei uusia kenttiä itsestään');
console.log('logiikka_73_animointi2 ok');
