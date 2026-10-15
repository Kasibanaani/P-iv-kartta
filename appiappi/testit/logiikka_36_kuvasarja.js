// Appi-appi 4: kuvasarja-animaatio Kuva-palikassa. Kuvat (pääkuva + sarja), nopeus (myös ominaisuutena), pyörii aina /
// kun liikkuu / kun nuolen ehto pätee, pysähtyneenä pääkuva, kaavan .kuvanro ja .pyörii, repair.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
var S1='<svg viewBox="0 0 10 10"><rect width="10" height="10"/></svg>',S2='<svg viewBox="0 0 10 10"><circle r="5" cx="5" cy="5"/></svg>',S3='https://example.com/k3.png';
var P=KK.newProject('k');var vw=P.views[0].id;
var k=KK.addBlock(P,'pkuva',{v:vw,src:S1});A.deepStrictEqual(k.sarja,[]);A.strictEqual(k.fps,8);A.strictEqual(k.pyor,'');
k.sarja=[S2,'javascript:alert(1)',S3,7];KK.repair(P);A.deepStrictEqual(k.sarja,[S2,S3],'kelvottomat pois');
var E=KK.Ev(P,C);A.deepStrictEqual(KK.kuvaKuvat(P,E,k),[S1,S2,S3]);
// Ei pyöri oletuksena
KK.frame(P,0,C);A.strictEqual(P.st['ks:'+k.id],undefined);A.strictEqual(KK.kuvaNro(P,k,C,KK.Ev(P,C)),0);A.strictEqual(KK.frame(P,0.02,C),false,'ei kuvasilmukkaa');
// Aina: 10 kuvaa sekunnissa
k.pyor='aina';k.fps=10;A.strictEqual(KK.frame(P,0,C),true);A.deepStrictEqual(P.st['ks:'+k.id],{t0:T});
function nro(){return KK.kuvaNro(P,k,C,KK.Ev(P,C));}
A.strictEqual(nro(),0);T+=100;A.strictEqual(nro(),1);T+=150;A.strictEqual(nro(),2);T+=100;A.strictEqual(nro(),0,'alkaa alusta');
// Kaavassa
var ka=LB(P,'kaava',{});ka.f=KK.kaavaToIds(P,k.vt+'.kuvanro');var kb=LB(P,'kaava',{});kb.f=KK.kaavaToIds(P,k.vt+'.pyörii');KK.repair(P);
E=KK.Ev(P,C);A.strictEqual(E.val(ka.id),1,'kuvanro 1-alkuinen');A.strictEqual(E.val(kb.id),true);
// Nopeus ominaisuutena
T=2000000;P.st['ks:'+k.id]={t0:T};KK.setOmi(P,k.id,'fps',20);T+=100;A.strictEqual(nro(),2,'20 kuvaa/s');KK.resetOmi(P,k.id,'fps');A.strictEqual(nro(),1);
// Seis → pääkuva, tila pois
k.pyor='';KK.frame(P,0,C);A.strictEqual(P.st['ks:'+k.id],undefined);A.strictEqual(nro(),0);
// Kun liikkuu: Liike liikuttaa kuvaa
k.pyor='liikkuu';var li=LB(P,'liike',{o:k.id,vx:'0'});KK.repair(P);KK.frame(P,0.02,C);A.strictEqual(P.st['ks:'+k.id],undefined,'paikallaan ei pyöri');
li.vx='50';T+=20;KK.frame(P,0.02,C);A.ok(P.st['ks:'+k.id],'liikkuessa pyörii');A.strictEqual(KK.kuvaPyorii(P,KK.Ev(P,C),k),true);
li.vx='0';T+=20;KK.frame(P,0.02,C);T+=20;KK.frame(P,0.02,C);A.strictEqual(P.st['ks:'+k.id],undefined,'pysähtyi');
// Ehto nuolesta voittaa asetuksen
var eh=LB(P,'arvo',{v:'kyllä'});KK.addLink(P,N(P,eh).id,'v',N(P,k).id,'pk');k.pyor='';KK.repair(P);
KK.frame(P,0,C);A.ok(P.st['ks:'+k.id],'nuolen ehto pätee');eh.v='ei';KK.frame(P,0,C);A.strictEqual(P.st['ks:'+k.id],undefined);
// Pelkkä pääkuva ei pyöri
var y=KK.addBlock(P,'pkuva',{v:vw,src:S1,pyor:'aina'});KK.repair(P);KK.frame(P,0,C);A.strictEqual(P.st['ks:'+y.id],undefined);
// Repair
k.fps='abc';k.pyor='joskus';KK.repair(P);A.strictEqual(k.fps,8);A.strictEqual(k.pyor,'');k.fps=999;KK.repair(P);A.strictEqual(k.fps,60);
k.sarja='rikki';KK.repair(P);A.deepStrictEqual(k.sarja,[]);
P.st['ks:'+y.id]={t0:'x'};P.st['ks:eiole']={t0:1};KK.repair(P);A.strictEqual(P.st['ks:'+y.id],undefined);A.strictEqual(P.st['ks:eiole'],undefined);
k.sarja=[];for(var i=0;i<40;i++)k.sarja.push(S2);KK.repair(P);A.strictEqual(k.sarja.length,KK.SARJA_MAX);
// Vanha kuva ilman kenttiä
var Q=KK.newProject('q');var o=KK.addBlock(Q,'pkuva',{src:S1});delete o.sarja;delete o.fps;delete o.pyor;KK.repair(Q);A.deepStrictEqual([o.sarja,o.fps,o.pyor],[[],8,'']);
console.log('ok kuvasarja');
