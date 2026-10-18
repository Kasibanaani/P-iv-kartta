// Appi-appi 84: painovoimassa maassa levossa oleva Liike lähtee liikkeelle silmukan alusta (frame dt 0 ei ota askelta, mutta
// ohjauksen antama vauhti pitää silmukan käynnissä): tatti (näppäimistö tai peliohjain kirjoittaa Tatin tilan), Nopeus x ja
// Auton kaasu. Ilman ohjausta levossa oleva ei pidä silmukkaa käynnissä. Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=2000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function run(P,s,dt){dt=dt||1/60;var act=false,n=Math.round(s/dt);for(var i=0;i<n;i++){T+=dt*1000;act=KK.frame(P,dt,C);}return act;}
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,0);}
function maailma(o){var P=KK.newProject('l'),v=P.views[0].id,a=KK.addBlock(P,'alue',{v:v});a.x=-2000;a.y=-2000;a.w=6000;a.h=6000;a.pv=2000;
  var f=KK.addBlock(P,'muoto',{v:v});f.x=-1000;f.y=100;f.w=3000;f.h=40;f.este=true;
  var h=KK.addBlock(P,'muoto',{v:v});h.x=0;h.y=40;h.w=40;h.h=60;h.este=true;
  var li=KK.addBlock(P,'liike',o(h,v,P));li.o=h.id;N(P,li);KK.repair(P);return {P:P,h:h,li:li};}
function X(W){return KK.Ev(W.P,C).omiNum(W.h.id,'x',0);}
// 1 tatti
var W=maailma(function(h,v,P){var t=KK.addBlock(P,'tatti',{v:v});t.x=0;t.y=300;W_t=t;return {ohj:'tatti',tt:t.id,vm:200};}),W_t;
run(W.P,1);A.equal(KK.Ev(W.P,C).val(W.li.id,'maa'),true,'maassa');A.equal(KK.frame(W.P,0,C),false,'levossa silmukka pysähtyy');
W.P.st[W_t.id]={x:1,y:0};A.equal(KK.frame(W.P,0,C),true,'tatti sivulle: silmukka jatkuu dt 0 -kuvasta');
var x0=X(W);run(W.P,0.5);A.ok(X(W)-x0>80,'kävelee tatilla: '+x0+' → '+X(W));
// 2 Nopeus x kaavasta (esim. ohjain.vaaka * 200)
var vx='0';W=maailma(function(){return {vx:'0'};});run(W.P,1);A.equal(KK.frame(W.P,0,C),false,'Nopeus x 0: pysähtyy');
W.li.vx='150';A.equal(KK.frame(W.P,0,C),true,'Nopeus x 150: jatkuu');x0=X(W);run(W.P,0.5);A.ok(X(W)-x0>50,'kulkee');
// 3 ilman painovoimaa ennallaan (askel aina)
console.log('ok logiikka_101');
