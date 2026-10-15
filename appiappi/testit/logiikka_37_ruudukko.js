// Appi-appi 5: ruudukko kerroksen ominaisuutena. Ruutukoko, tihennys, kohdistus, näkyvyys, napautus ruudun keskelle,
// palikan ruutux / ruutuy, Alue ruutu kerrallaan (ruutu x / y, ruutu vaihtui), napautus alueeseen, repair.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||0.02;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
function laskuri(P,b,port){var m=LB(P,'muisti',{v:'0'}),t=LB(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
var P=KK.newProject('r');var v=P.views[0],vw=v.id;
A.strictEqual(KK.ruudukko(P,vw,'pohja'),null,'ei ruudukkoa oletuksena');
v.kr=[{id:'pohja',n:'Pohja',rk:'40',rt:'2'},{id:'k1',n:'Lattia',rk:2,rkn:'vino',rkk:'x'}];KK.repair(P);
A.deepStrictEqual(v.kr,[{id:'pohja',n:'Pohja',rk:40,rt:2},{id:'k1',n:'Lattia'}],'liian pieni ruutu ja kelvottomat pois');
var g=KK.ruudukko(P,vw,'pohja');A.deepStrictEqual(g,{rk:40,rt:2,step:20,kk:true,nk:''});A.strictEqual(KK.kohdista(g,29),20);A.strictEqual(KK.kohdista(g,31),40);
A.deepStrictEqual(KK.ruutuAt(g,79,-1),{x:1,y:-1});A.deepStrictEqual(KK.ruutuKeski(g,1,2),{x:60,y:100});
v.kr[0].rkk=false;v.kr[0].rkn='aina';KK.repair(P);A.deepStrictEqual(KK.ruudukko(P,vw,'pohja'),{rk:40,rt:2,step:20,kk:false,nk:'aina'});
// Pohja, jolla on vain ruudukko, säilyy
var Q=KK.newProject('q');Q.views[0].kr=[{id:'pohja',n:'Pohja',rk:32}];KK.repair(Q);A.deepStrictEqual(Q.views[0].kr,[{id:'pohja',n:'Pohja',rk:32}]);
// --- Palikan ruutux / ruutuy ---
var h=KK.addBlock(P,'muoto',{v:vw});h.x=85;h.y=5;h.w=30;h.h=30;KK.repair(P);
var kx=LB(P,'kaava',{});kx.f=KK.kaavaToIds(P,h.vt+'.ruutux');var ky=LB(P,'kaava',{});ky.f=KK.kaavaToIds(P,h.vt+'.ruutuy');KK.repair(P);
var E=KK.Ev(P,C);A.strictEqual(E.val(kx.id),3,'keskipiste x 100 → ruutu 3');A.strictEqual(E.val(ky.id),1);
h.kr='k1';KK.repair(P);A.strictEqual(KK.Ev(P,C).val(kx.id),null,'kerroksella ei ruudukkoa');delete h.kr;
// --- Napautus osuu ruudun keskelle ---
var li=LB(P,'liike',{o:h.id,ohj:'napautus',vm:1000});KK.repair(P);
KK.liikeNapautus(P,vw,170,50,C);A.deepStrictEqual([P.st[li.id].tx,P.st[li.id].ty],[180,60],'ruudun (4, 1) keskelle');
run(P,0.5);E=KK.Ev(P,C);A.strictEqual(E.omiNum(h.id,'x',0)+15,180);A.strictEqual(E.omiNum(h.id,'y',0)+15,60);
// --- Alue ruutu kerrallaan ---
var al=KK.addBlock(P,'alue',{v:vw});al.x=120;al.y=40;al.w=160;al.h=120;al.rkr='pohja';KK.repair(P);A.strictEqual(al.rkr,'pohja');
A.deepStrictEqual(KK.ports(al).outs.map(function(o){return o.p;}),['v','n','e','ulos','nx','ny','nap','rx','ry','rv']);
var rv=laskuri(P,al,'rv'),ast=laskuri(P,al,'e');KK.repair(P);
KK.frame(P,0,C);E=KK.Ev(P,C);A.strictEqual(E.val(al.id),true,'hahmo (180, 60) alueella');A.strictEqual(E.val(al.id,'rx'),2);A.strictEqual(E.val(al.id,'ry'),1);
A.strictEqual(E.val(ast.id),1);A.strictEqual(E.val(rv.id),0,'astuessa ei ruutu vaihtui -tapahtumaa');
KK.liikeNapautus(P,vw,250,130,C);run(P,0.5);E=KK.Ev(P,C);A.strictEqual(E.val(al.id,'rx'),4);A.strictEqual(E.val(al.id,'ry'),3);A.ok(E.val(rv.id)>=1,'ruutu vaihtui');
var rk=laskuri(P,al,'rx');// kaava alueen ruudusta
var ka=LB(P,'kaava',{});ka.f=KK.kaavaToIds(P,al.vt+'.ruutux');KK.repair(P);A.strictEqual(KK.Ev(P,C).val(ka.id),4);
// poistuessa ruutu tyhjenee
KK.setOmi(P,h.id,'x',500);KK.frame(P,0,C);E=KK.Ev(P,C);A.strictEqual(E.val(al.id),false);A.strictEqual(E.val(al.id,'rx'),null);
// --- Napautus alueeseen ---
var nap=laskuri(P,al,'nap');KK.repair(P);
A.deepStrictEqual(KK.alueNapautus(P,vw,205,95,C),[al.id]);E=KK.Ev(P,C);A.strictEqual(E.val(nap.id),1);A.strictEqual(E.val(al.id,'nx'),3);A.strictEqual(E.val(al.id,'ny'),2);
A.deepStrictEqual(KK.alueNapautus(P,vw,5,5,C),[],'ohi');
delete al.rkr;KK.repair(P);KK.alueNapautus(P,vw,130,45,C);E=KK.Ev(P,C);A.strictEqual(E.val(al.id,'nx'),10,'ilman ruudukkoa pikseleinä');A.strictEqual(E.val(al.id,'ny'),5);
A.deepStrictEqual(KK.ports(al).outs.map(function(o){return o.p;}),['v','n','e','ulos','nx','ny','nap']);
// --- Repair: ruudukko pois → alueen ruutuvalinta pois ---
al.rkr='pohja';P.st['alr:'+al.id]={x:1,y:1};KK.repair(P);A.strictEqual(al.rkr,'pohja');
delete v.kr[0].rk;KK.repair(P);A.strictEqual(al.rkr,undefined);A.strictEqual(P.st['alr:'+al.id],undefined);
P.st['aln:'+al.id]='rikki';KK.repair(P);A.strictEqual(P.st['aln:'+al.id],undefined);
// Ilman ruudukkoa napautus ei kohdistu
KK.liikeNapautus(P,vw,173,51,C);A.deepStrictEqual([P.st[li.id].tx,P.st[li.id].ty],[173,51]);
console.log('ok ruudukko');
