// F33 vaihe 4: näppäimistö pelaajan 1 ohjaimena (moottori). nappTila: nuolet ja WASD = ristiohjain + vasen tatti (vino
// 0,707, vastakkaiset kumoavat), IJKL ja välilyönti etunapit, olat, liipaisimet, Enter ja askelpalautin, tuntematon
// näppäin ei vaikuta. padYhdista: ohjain ja näppäimistö yhdessä. Näppäimistötila ohjainSetin läpi: Tatti + Liike ja Painike.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,18,10,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(t,n){return t.napit[KK.PADN.indexOf(n)];}
// 1 Tyhjä: kaikki lepoon, nimi Näppäimistö
var t=KK.nappTila({});A.strictEqual(t.id,'Näppäimistö');A.strictEqual(t.napit.length,16);A.ok(t.napit.every(function(v){return v===0;}));A.deepStrictEqual(t.tatit,[0,0,0,0]);
// 2 Nuolet ja WASD: ristiohjain ja vasen tatti
t=KK.nappTila({ArrowRight:1});A.strictEqual(N(t,'oikea'),1);A.deepStrictEqual(t.tatit,[1,0,0,0]);
t=KK.nappTila({KeyW:1});A.strictEqual(N(t,'ylös'),1);A.deepStrictEqual(t.tatit,[0,-1,0,0]);
t=KK.nappTila({KeyA:1,KeyS:1});A.strictEqual(N(t,'vasen'),1);A.strictEqual(N(t,'alas'),1);A.ok(Math.abs(t.tatit[0]+Math.SQRT1_2)<1e-9&&Math.abs(t.tatit[1]-Math.SQRT1_2)<1e-9,'vino');
t=KK.nappTila({ArrowLeft:1,ArrowRight:1});A.strictEqual(t.tatit[0],0,'vastakkaiset kumoavat');A.strictEqual(N(t,'vasen'),1);A.strictEqual(N(t,'oikea'),1);
t=KK.nappTila({ArrowRight:1,KeyD:1});A.strictEqual(t.tatit[0],1,'nuoli ja D yhdessä enintään 1');
// 3 Etunapit sijainnin mukaan, muut napit
var M={Space:'alanappi',KeyK:'alanappi',KeyL:'oikeanappi',KeyJ:'vasennappi',KeyI:'ylänappi',KeyQ:'vasenolka',KeyE:'oikeaolka',KeyZ:'vasenliipaisin',KeyC:'oikealiipaisin',Backspace:'valinta',Enter:'valikko'};
Object.keys(M).forEach(function(c){var o={};o[c]=1;var t=KK.nappTila(o);A.strictEqual(N(t,M[c]),1,c);A.strictEqual(t.napit.filter(function(v){return v;}).length,1,c+' vain yksi');A.deepStrictEqual(t.tatit,[0,0,0,0]);});
A.ok(KK.nappTila({KeyX:1,Tab:1,Escape:1}).napit.every(function(v){return v===0;}),'tuntematon ei vaikuta');
A.ok(KK.nappTila({Space:0}).napit.every(function(v){return v===0;}),'0 = irti');
Object.keys(KK.PADKEYN).forEach(function(n){A.ok(KK.PADN.indexOf(n)>=0,'nimi '+n);});
// 4 padYhdista
var g={id:'Xbox',napit:[0,1,0,0,0,0,0.4,0,0,0,0,0,0,0,0,0],tatit:[0.5,0.2,0.3,0]};
var y=KK.padYhdista(g,KK.nappTila({Space:1}));A.strictEqual(y.id,'Xbox');A.strictEqual(y.napit[0],1);A.strictEqual(y.napit[1],1);A.strictEqual(y.napit[6],0.4);A.deepStrictEqual(y.tatit,[0.5,0.2,0.3,0],'ohjaimen tatti, kun näppäimistö ei ohjaa');
y=KK.padYhdista(g,KK.nappTila({ArrowLeft:1}));A.deepStrictEqual(y.tatit,[-1,0.2,0.3,0],'näppäimistö voittaa akselillaan');
A.strictEqual(KK.padYhdista(null,KK.nappTila({})).id,'Näppäimistö');A.strictEqual(KK.padYhdista(g,null),g);A.strictEqual(KK.padYhdista(null,null),null);
// 5 Näppäimistötila ohjainSetin läpi: Peliohjain, Tatti + Liike, Painike
var P=KK.newProject('nappaimisto'),vw=P.views[0].id;
var oh=KK.addBlock(P,'pohj',{});KK.setName(P,oh.id,'Ohjain');KK.addNode(P,oh.id,0,0);
var tj=KK.addBlock(P,'tatti',{v:vw,pad:'vasen'});var nb=KK.addBlock(P,'nappi',{v:vw,tx:'Hyppää',beh:'kerta',padn:'alanappi'});
KK.repair(P);
var r=KK.ohjainSet(P,1,KK.nappTila({ArrowRight:1}),C);A.ok(r.muuttui);
A.strictEqual(E(P).val(oh.id),true);A.strictEqual(E(P).prop(oh.id,'nimi'),'Näppäimistö');A.strictEqual(E(P).prop(oh.id,'oikea'),true);A.strictEqual(E(P).val(oh.id,'x'),1);A.strictEqual(E(P).val(oh.id,'s'),90);
A.deepStrictEqual(P.st[tj.id],{x:1,y:0},'Tatti seuraa näppäimistöä');
KK.ohjainSet(P,1,KK.nappTila({ArrowRight:1,Space:1}),C);A.strictEqual(E(P).val(nb.id),1,'välilyönti painaa Painiketta');
KK.ohjainSet(P,1,KK.nappTila({}),C);A.deepStrictEqual(P.st[tj.id],{x:0,y:0},'irti: tatti keskelle');A.strictEqual(E(P).val(oh.id),true,'yhdistetty pysyy');
KK.ohjainSet(P,1,KK.nappTila({Space:1}),C);A.strictEqual(E(P).val(nb.id),2);
KK.ohjainSet(P,1,null,C);A.strictEqual(E(P).val(oh.id),false);
A.ok(!/Näppäimistö/.test(JSON.stringify(KK.payload?KK.payload(P):P.b)),'tila ei tallennu');
console.log('ok logiikka näppäimistö');
