// F29 vaihe 1: animointi (ilmestyy, katoaa, kesto, pehmeys) ominaisuusrekisterissä. Vain näkymän palikoilla (ei Sijainti,
// Alue eikä logiikka). Perusarvot töks / sama / 0,25 s / pehmeä; projektin oletus P.an; palikan oma voittaa; kaava lukee
// palikka.animointi.kesto; nuoli ja Aseta ohjaavat (kesto rajataan 0–10); tuntematon tapa on näkyvä virhe. Näkyvyys
// muuttuu heti (moottorissa ei ole animaatiota). Vanha projekti ilman kenttiä aukeaa, roskainen P.an siivotaan.
var KK=require('./moottori.js'),A=require('assert'),fs=require('fs');
var NOW=new Date(2026,9,17,12,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,'');return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function kv(P,f){return E(P).val(kaava(P,f).b.id);}

var P=KK.newProject('animointi'),vw=P.views[0].id;
var N=blk(P,'nappi',{v:vw,tx:'Paina'});KK.setName(P,N.b.id,'Nappi');
var T=blk(P,'nayta',{v:vw,tx:'Hei'});KK.setName(P,T.b.id,'Otsikko');
var M=blk(P,'muisti',{v:'0'});KK.setName(P,M.b.id,'Muisti');
var S=KK.addBlock(P,'merkki',{v:vw});
KK.repair(P);
// Rekisteri: näkymän palikoilla, ei logiikassa eikä Sijainnilla
function has(b,n){return KK.omat(b).some(function(e){return e.n===n;});}
['animointi.ilmestyy','animointi.katoaa','animointi.kesto','animointi.pehmeys'].forEach(function(n){A.ok(has(N.b,n),'nappi: '+n);A.ok(has(T.b,n),'teksti: '+n);A.ok(!has(M.b,n),'muisti ei: '+n);A.ok(!has(S,n),'sijainti ei: '+n);});
// Perusarvot
A.strictEqual(kv(P,'nappi.animointi.ilmestyy'),'toks');A.strictEqual(kv(P,'nappi.animointi.katoaa'),'sama');
A.strictEqual(kv(P,'nappi.animointi.kesto'),0.25);A.strictEqual(kv(P,'nappi.animointi.pehmeys'),'pehmea');
// Projektin oletus ja palikan oma
P.an={i:'haivytys',k:1};A.strictEqual(kv(P,'nappi.animointi.ilmestyy'),'haivytys');A.strictEqual(kv(P,'otsikko.animointi.kesto'),1);
N.b.ani='pomppu';N.b.ank=0.5;A.strictEqual(kv(P,'nappi.animointi.ilmestyy'),'pomppu','oma voittaa');A.strictEqual(kv(P,'nappi.animointi.kesto'),0.5);
A.strictEqual(kv(P,'otsikko.animointi.ilmestyy'),'haivytys','muut käyttävät oletusta');
// Aseta: ohjattava, kesto rajataan, nimellä ja numerolla
A.ok(KK.setOmi(P,T.b.id,'animointi.kesto',3));A.strictEqual(kv(P,'otsikko.animointi.kesto'),3);
A.ok(KK.setOmi(P,T.b.id,'animointi.kesto',25));A.strictEqual(kv(P,'otsikko.animointi.kesto'),10,'enintään 10 s');
A.ok(KK.setOmi(P,T.b.id,'animointi.ilmestyy','liuku ylhäältä'));A.strictEqual(kv(P,'otsikko.animointi.ilmestyy'),'ylhaalta');
A.ok(KK.setOmi(P,T.b.id,'animointi.ilmestyy',2));A.strictEqual(kv(P,'otsikko.animointi.ilmestyy'),'haivytys','numerolla');
A.ok(!KK.setOmi(P,T.b.id,'animointi.ilmestyy','lentää'),'tuntematon tapa ei asetu');
KK.resetOmi(P,T.b.id,'animointi.kesto');A.strictEqual(kv(P,'otsikko.animointi.kesto'),1,'Palauta: takaisin oletukseen');
// Nuoli: yksi Arvo monen palikan kestoksi
var A3=blk(P,'muisti',{v:'3'});KK.setName(P,A3.b.id,'Nopeus');
[N.b,T.b].forEach(function(b){b.ohk=(b.ohk||[]).concat(['ankesto']);A.ok(KK.addLink(P,A3.n.id,'v',KK.nodesOfBlock(P,b.id)[0].id,'o_ankesto'),'nuoli');});
A.strictEqual(kv(P,'nappi.animointi.kesto'),3);A.strictEqual(kv(P,'otsikko.animointi.kesto'),3);
// Tuntematon tapa nuolesta: näkyvä virhe
var tk=blk(P,'kaava',{},-300,300);tk.b.f='"lentää"';N.b.ohk.push('anin');KK.addLink(P,tk.n.id,'v',KK.nodesOfBlock(P,N.b.id)[0].id,'o_anin');
var ev=E(P).omi(N.b.id,'anin');A.ok(KK.isErr(ev)&&/ei ole vaihtoehto/.test(ev.err),'virhe: '+JSON.stringify(ev));
// Näkyvyys muuttuu heti (ei odota animaatiota)
var R=blk(P,'ruutu',{v:vw,tx:'Näytä'});KK.setName(P,R.b.id,'Näytä');T.b.nk={m:'kun',r:R.b.id};
A.strictEqual(kv(P,'otsikko.näkyy'),false);KK.setVal(P,R.b.id,true,C);A.strictEqual(kv(P,'otsikko.näkyy'),true,'heti');
// Tallennus: kentät säilyvät, roskainen P.an siivotaan, vanha projekti = töks
var Q=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(Q.b[N.b.id].ani,'pomppu');A.deepStrictEqual(Q.an,{i:'haivytys',k:1});
var R2=KK.repair({b:{},lg:{n:[],l:[]},an:'roska'});A.ok(!('an' in R2),'roska pois');
var R3=KK.repair({b:{},lg:{n:[],l:[]},an:{i:'',x:1,k:2}});A.deepStrictEqual(R3.an,{k:2});
var old=JSON.parse(fs.readFileSync(__dirname+'/vanha_v5_esimerkki.json','utf8'));var OP=KK.repair(old.projects?old.projects[0]:old);
var ui=Object.keys(OP.b).filter(function(i){return OP.b[i].v&&KK.omFind(OP.b[i],'animointi.ilmestyy');})[0];A.ok(ui,'vanhassa on näkymän palikka');
A.strictEqual(E(OP).prop(ui,'animointi.ilmestyy'),'toks','vanha = töks');A.ok(!OP.an&&OP.b[ui].ani===undefined,'ei uusia kenttiä itsestään');
console.log('logiikka_67_animointi ok');
