// Jonon 1r (kartoitus 8, S1 ja S3): joukot-ominaisuus ei niele joukon virhettä (virheellinen kuuluu kun -ehto ja kehä),
// ja varatun sanan oletusviitteet ovat johdonmukaisesti jos_1, jos_2, … (myös nimestä ”Jos 2”). Vanhat viitteet ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,18,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(m){C.last=m;},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0,'');}
function V(P,b){return KK.Ev(P,C).val(b.id);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}
function link(P,from,to,port){A.ok(KK.addLink(P,KK.nodesOfBlock(P,from.id)[0].id,'v',KK.nodesOfBlock(P,to.id)[0].id,port));KK.repair(P);}

// S1: virheellinen kuuluu kun -ehto
var P=KK.newProject('1r');
var a=KK.addBlock(P,'arvo',{nm:'A',v:'1'});N(P,a);var b=KK.addBlock(P,'arvo',{nm:'B',v:'2'});N(P,b);
var c=KK.addBlock(P,'arvo',{nm:'C',v:'3'});N(P,c);var d=KK.addBlock(P,'arvo',{nm:'D',v:'4'});N(P,d);KK.repair(P);
A.strictEqual(KK.setTunnus(P,a.id,'@a #x'),'');A.strictEqual(KK.setTunnus(P,b.id,'@b #x #y'),'');A.strictEqual(KK.setTunnus(P,c.id,'@c #y'),'');
var X=KK.jkFind(P,'x');a.jkk=[X];KK.repair(P);
var eh=K(P,'puuttuva > 1');link(P,eh,a,'jk_'+X);
function ev(s){return V(P,K(P,s));}
A.ok(KK.isErr(ev('#x')),'joukko virheessä');
var bj=ev('b.joukot');A.ok(KK.isErr(bj),'b.joukot on virhe, ei hiljaa ”y”: '+JSON.stringify(bj));A.ok(/#x/.test(bj.err)&&/virheessä/.test(bj.err),bj.err);
A.ok(KK.isErr(ev('a.joukot')),'ehdon omistaja näkee virheen');
A.strictEqual(ev('c.joukot'),'y','ei ehdokas: muut joukot näkyvät');A.strictEqual(ev('d.joukot'),'','ei joukkoja');
// Lisää joukkoon tekee ehdokkaan
P.st['jk:'+X]={};P.st['jk:'+X][d.id]=true;A.ok(KK.isErr(ev('d.joukot')),'Lisää joukkoon -jäsen näkee virheen');delete P.st['jk:'+X];
// korjattu ehto: virhe poistuu
eh.f=KK.kaavaToIds(P,'c > 1');KK.repair(P);A.strictEqual(ev('b.joukot'),'x, y');A.strictEqual(ev('a.joukot'),'x');

// S1: kehä (ehto lukee saman joukon)
eh.f=KK.kaavaToIds(P,'#x.summa < 100');KK.repair(P);
var kv=ev('#x');A.ok(KK.isErr(kv)&&/kehä/.test(kv.err),'kehä: '+JSON.stringify(kv));
var bk=ev('b.joukot');A.ok(KK.isErr(bk)&&/#x/.test(bk.err),'kehä ei katoa: '+JSON.stringify(bk));
A.ok(KK.isErr(ev('c.joukot')),'kehä näkyy kaikille kuten ennen');

// S3: varatun sanan oletusviitteet
var Q=KK.newProject('vt');var j1=KK.addBlock(Q,'jos'),j2=KK.addBlock(Q,'jos'),j3=KK.addBlock(Q,'jos');
A.deepStrictEqual([j1.vt,j2.vt,j3.vt],['jos_1','jos_2','jos_3'],'JOS-palikat: '+[j1.vt,j2.vt,j3.vt]);
var ja=KK.addBlock(Q,'luku',{nm:'Ja'});A.strictEqual(ja.vt,'ja_1');
var u1=KK.addBlock(Q,'arvo',{nm:'Uni'}),u2=KK.addBlock(Q,'arvo',{nm:'Uni'});A.deepStrictEqual([u1.vt,u2.vt],['uni','uni2'],'muut pohjat ennallaan');
// vanha jos_2 / jos2 säilyy
var R=KK.newProject('vanha');var o1=KK.addBlock(R,'jos');o1.vt='jos_2';o1.vtSet=true;var o2=KK.addBlock(R,'jos');o2.vt='jos2';N(R,o1);N(R,o2);KK.repair(R);
A.strictEqual(R.b[o1.id].vt,'jos_2');A.strictEqual(R.b[o2.id].vt,'jos2','vanha viite ennallaan');
var o3=KK.addBlock(R,'jos');A.strictEqual(o3.nm,'JOS 3');A.strictEqual(o3.vt,'jos_3','numero nimen mukaan');
console.log('logiikka_83_korjaukset_1r ok');
