// Versio 6.11: tallennus. Versiolla 5.2 tallennettu kartta (vanha_v5_esimerkki.json) aukeaa: arvot ja tilat ovat samat kuin
// vanhalla moottorilla (vanha_v5_arvot.json), rakenne ei muutu korjauksessa, ja siihen voi lisätä ketjun.
// Ketjut ja niiden ajotila säilyvät JSON-kierroksessa (selaimen muisti, varmuuskopio, GitHub-tiedosto).
var KK=require('./moottori.js'),A=require('assert');
var old=require('./vanha_v5_esimerkki.json'),want=require('./vanha_v5_arvot.json');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
var Dt=KK.repairData(JSON.parse(JSON.stringify(old)));A.strictEqual(Dt.ver,KK.VER);A.ok(KK.VER>=6);var P=Dt.projects[0];
var E=KK.Ev(P,C);Object.keys(want).forEach(function(id){var b=P.b[id];A.ok(b,'palikka säilyi '+id);var pr=KK.ports(b);
  /* Appi-appi 21: kalenterilla on nyt arvo (valittu päivä); vanhassa tallennuksessa valintaa ei ole, joten se on tyhjä. */
  A.strictEqual(pr.outs.some(function(p){return p.p==='v';})?E.fmt(E.val(id)):null,b.k==='kalenteri'&&want[id].v===null?'–':want[id].v,'arvo '+want[id].nm);
  A.strictEqual(KK.K[b.k].g==='ui'?E.state(id):null,want[id].tila,'tila '+want[id].nm);});
A.strictEqual(Object.keys(P.b).length,Object.keys(want).length,'ei uusia eikä kadonneita palikoita');
var o0=JSON.parse(JSON.stringify(old.projects[0]));var r1=KK.repair(JSON.parse(JSON.stringify(o0)));
['b','lg','deco','views','st','mem'].forEach(function(k){A.deepStrictEqual(r1[k],o0[k],'korjaus ei muuta kohtaa '+k);});
A.strictEqual(KK.chainList(P).length,0);
// vanhaan karttaan ketju
var lst=Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.k==='lista';})[0];
var k=KK.addBlock(P,'ketju',{nm:'Muistutus'}),w=KK.addNode(P,k.id,0,900);var t=KK.addBlock(P,'ajastin',{kesto:2,yks:'h'}),r=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:'Muista tauko'});
var nt=KK.addNode(P,t.id,10,940,w.id),nr=KK.addNode(P,r.id,10,1000,w.id);KK.addLink(P,nt.id,'e',nr.id,'e');
var btn=Object.keys(P.b).map(function(i){return P.b[i];}).filter(function(b){return b.nm==='Taukonappi';})[0];KK.addLink(P,KK.nodesOfBlock(P,btn.id)[0].id,'e',w.id,'e');
KK.press(P,btn.id,C);A.strictEqual(P.st[k.id].run,true);var rows0=KK.listRows(P,lst.id).length;
// tallennus selaimeen / varmuuskopioon / GitHubiin = JSON-kierros
var saved=JSON.stringify({app:'kytkoskartta',ver:KK.VER,projects:[P],cur:P.id,cfg:Dt.cfg});
NOW+=3*3600000;var D2=KK.repairData(JSON.parse(saved));var P2=D2.projects[0];
A.strictEqual(P2.st[k.id].run,true,'ajotila säilyi');A.strictEqual(P2.st[k.id].tk[0].u,P.st[k.id].tk[0].u,'aikaleima säilyi');
KK.chainPoll(P2,C);A.strictEqual(KK.listRows(P2,lst.id).length,rows0+1,'jatkui avattaessa');A.strictEqual(P2.st[k.id].run,false);
// GitHub-tiedoston muoto {app, ver, savedAt, projekti}
var gh=JSON.parse(JSON.stringify({app:'kytkoskartta',ver:KK.VER,savedAt:'x',projekti:P}));var P3=KK.repair(gh.projekti);A.strictEqual(P3.b[k.id].k,'ketju');A.strictEqual(KK.chainSteps(P3,k.id).length,2);
// vanha versio avaa uuden tallennuksen? Ei tavoite, mutta uuden tiedot eivät riko korjausta, vaikka laji puuttuisi:
var X=JSON.parse(saved);delete X.projects[0].b[t.id].kesto;delete X.projects[0].b[k.id].uusi;var P4=KK.repairData(X).projects[0];A.strictEqual(P4.b[t.id].kesto,10);A.strictEqual(P4.b[k.id].uusi,'ohita');
console.log('logiikka_19_tallennus ok');
