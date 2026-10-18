// Jonon 14c (F38 kohta 6): Muodon kulmat. Valinnainen b.kpy (px, 0–500), puuttuva = 16 eli entinen ulkoasu. Ominaisuus
// `kulmat` rekisterissä: kaavalla luettava, nuolella ohjattava, Aseta/Lisää/Palauta. repair: vain Muodolle, 16 pois,
// virheellinen pois, rajat. Vanha avain `kr` (kerros) ei muutu.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,18,12,0,0);},toast:function(){},nav:function(){},env:function(){return {w:390,h:844};}};
function E(P){return KK.Ev(P,C);}
function node(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function kaava(P,f){var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,-400,Math.random()*1000);k.f=KK.kaavaToIds(P,f);return k;}
function V(P,f){return E(P).val(kaava(P,f).id);}
function act(P,props){var t=KK.addBlock(P,'tee',props);node(P,t);KK.runAction(P,t.id,C,0);return t;}
var P=KK.newProject('kulmat'),vw=P.views[0].id;
// 1 Vanha Laatikko ilman kenttää: 16, kenttää ei tule
var m=KK.addBlock(P,'muoto',{v:vw,nm:'Laatikko',laji:'laatikko'});KK.repair(P);
A.strictEqual(m.kpy,undefined);A.strictEqual(V(P,'laatikko.kulmat'),16,'oletus 16 px');
var e=KK.omFind(m,'kulmat');A.ok(e&&e.o===1&&e.f==='kpy'&&e.t==='luku','kulmat rekisterissä ohjattavana');
A.strictEqual(m.kr,undefined,'kerroksen kr ennallaan');
// 2 repair: rajat ja siivous
function rep(v){var b=KK.addBlock(P,'muoto',{v:vw,laji:'laatikko'});b.kpy=v;KK.repair(P);return b.kpy;}
A.strictEqual(rep(0),0,'0 = terävä säilyy');A.strictEqual(rep(16),undefined,'16 = oletus, ei kenttää');
A.strictEqual(rep('8,4'),8);A.strictEqual(rep(-5),0);A.strictEqual(rep(9999),500);A.strictEqual(rep('pyöreä'),undefined);A.strictEqual(rep(null),undefined);
var t=KK.addBlock(P,'nayta',{v:vw});t.kpy=4;KK.repair(P);A.strictEqual(t.kpy,undefined,'vain Muodolla');
A.ok(!KK.omFind(t,'kulmat'),'Tekstillä ei kulmia');
// 3 Perusarvo kaavassa ja JSON-kierros
m.kpy=4;KK.repair(P);A.strictEqual(V(P,'laatikko.kulmat'),4);
var P2=JSON.parse(JSON.stringify(P));KK.repair(P2);A.strictEqual(P2.b[m.id].kpy,4,'kulkee tallennuksessa');
// 4 Aseta, Lisää ja Palauta
act(P,{do:'aseta',o:m.id,om:'kulmat',v:'30'});A.strictEqual(E(P).omi(m.id,'kulmat'),30,'Aseta kulmat');
act(P,{do:'lisaa',o:m.id,om:'kulmat',v:'-100'});A.strictEqual(E(P).omi(m.id,'kulmat'),0,'ei alle nollan');
A.strictEqual(m.kpy,4,'perusarvo ennallaan');
act(P,{do:'palauta',o:m.id,om:'kulmat'});A.strictEqual(E(P).omi(m.id,'kulmat'),4,'Palauta');
// 5 Ohjattu nuolella voittaa
var s=KK.addBlock(P,'saadin',{v:vw,nm:'Pyöreys',min:0,max:100,start:40});node(P,s);KK.repair(P);
m.ohk=['kulmat'];var k=kaava(P,'pyöreys / 2');A.ok(KK.addLink(P,node(P,k).id,'v',node(P,m).id,'o_kulmat'));KK.repair(P);
A.strictEqual(KK.port(m,'ins','o_kulmat').n,'kulmat');A.strictEqual(E(P).omi(m.id,'kulmat'),20,'ohjattu kaavasta');
A.strictEqual(V(P,'laatikko.kulmat'),20);
// 6 Ympyrä: arvo luettavissa, piirto ei käytä (UI), laji vaihtuu ilman että kpy katoaa
m.laji='ympyra';KK.repair(P);A.strictEqual(m.kpy,4,'laji vaihtuu, kulmat säilyvät');
console.log('ok');
