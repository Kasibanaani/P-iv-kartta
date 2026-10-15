// Pajakone 2: Käyrä. Syöte x → tulos y muotoillun käyrän kautta. x- ja y-väli, 2–10 porrasta (% y-välistä),
// pehmeä käyrä ilman yli- ja alitusta, tarkka tulos tai pyöristys, välin ulkopuolinen syöte reunaan, käänteiset välit,
// syöte ja portaat nuolesta, kaavan .x .t .p1, Miksi?, valmiit muodot, portaiden määrän muutos, repair ja tallennus.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,15,18,0,0);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-9),(m||'')+' '+a+' ≠ '+b);}
function mk(props){var P=KK.newProject('k');var b=KK.addBlock(P,'kayra',props||{});var n=KK.addNode(P,b.id,0,0);return {P:P,b:b,n:n};}
function val(X){return KK.Ev(X.P,C).val(X.b.id);}

// Laji, oletukset ja kohdat
var X=mk();A.strictEqual(X.b.nm,'Käyrä');A.strictEqual(X.b.vt,'käyrä');
A.deepStrictEqual([X.b.xmin,X.b.xmax,X.b.ymin,X.b.ymax,X.b.pn],[0,10,0,100,5]);A.deepStrictEqual(X.b.pw,[0,25,50,75,100]);
A.deepStrictEqual(KK.ports(X.b).ins.map(function(p){return p.p;}),['a','xmin','xmax','ymin','ymax','p1','p2','p3','p4','p5']);
A.deepStrictEqual(KK.ports(X.b).outs.map(function(p){return p.p+':'+p.t;}),['v:v']);
A.strictEqual(val(X),null,'ilman syötettä ei tulosta');
A.ok(/Syöte puuttuu/.test(KK.why(X.P,KK.Ev(X.P,C),X.b.id,1).txt));

// Suora käyrä: lineaarinen ja tarkka
X.b.a=5;near(val(X),50);X.b.a=2.5;near(val(X),25);X.b.a=7.3;near(val(X),73);
// Välin ulkopuolella reunat
X.b.a=-4;A.strictEqual(val(X),0);X.b.a=40;A.strictEqual(val(X),100);
// Kiihtyvä: hidas alku, nopea loppu, kulkee portaiden kautta tarkasti
X.b.pw=KK.kayraPreset('kiihtyy',5);A.strictEqual(X.b.pw[0],0);A.strictEqual(X.b.pw[4],100);
X.b.a=2.5;near(val(X),X.b.pw[1]);X.b.a=5;near(val(X),X.b.pw[2]);A.ok(val(X)<30,'puolivälissä alle 30');
var prev=-1;for(var x=0;x<=10;x+=0.25){X.b.a=x;var y=val(X);A.ok(y>=prev-1e-9,'nouseva '+x);prev=y;}
// Ei ylitystä: kumpu nousee ja laskee, huippu tasan 100
X.b.pw=KK.kayraPreset('kumpu',5);var mx=-1;for(x=0;x<=10;x+=0.05){X.b.a=x;mx=Math.max(mx,val(X));}near(mx,100,1e-6,'kumpu ei ylitä huippua');
// Tasainen osuus pysyy tasaisena
X.b.pn=4;X.b.pw=[20,20,80,80];X.b.a=0;near(val(X),20);X.b.a=10/3*0.5;near(val(X),20,1e-9,'tasainen väli');X.b.a=10;near(val(X),80);
// Kaksi porrasta = suora
X.b.pn=2;X.b.pw=[0,100];KK.repair(X.P);X.b.a=3;near(val(X),30);

// Välit: y-väli, käänteinen y, käänteinen x, desimaali-x
X.b.ymin=-1;X.b.ymax=1;X.b.a=5;near(val(X),0);X.b.a=10;near(val(X),1);
X.b.ymin=200;X.b.ymax=0;X.b.a=2.5;near(val(X),150,1e-9,'laskeva y-väli');
X.b.ymin=0;X.b.ymax=100;X.b.xmin=10;X.b.xmax=0;X.b.a=2.5;near(val(X),75,1e-9,'käänteinen x-väli');
X.b.xmin='0,5';X.b.xmax='1,5';X.b.a='1';near(val(X),50);
X.b.xmin=3;X.b.xmax=3;A.ok(KK.isErr(val(X))&&/samat/.test(val(X).err));
X.b.xmin=0;X.b.xmax='paljon';A.ok(/x loppu ei ole luku/.test(val(X).err));X.b.xmax=10;
X.b.a='kissa';A.ok(/syöte ei ole luku/.test(val(X).err));X.b.a=true;near(val(X),10,1e-9,'kyllä = 1');

// Tarkkuus
X.b.pn=5;X.b.pw=KK.kayraPreset('kiihtyy',5);X.b.a=3.3;var exact=val(X);A.ok(Math.abs(exact-Math.round(exact))>1e-6);
X.b.dec=0;A.strictEqual(val(X),Math.round(exact));X.b.dec=1;near(val(X),Math.round(exact*10)/10);X.b.dec='';near(val(X),exact);

// Syöte säätimestä nuolella, portaat nuolesta (myös yli 100), välin pää palikasta
var Y=mk();var sl=KK.addBlock(Y.P,'saadin',{min:0,max:10,start:5});var sn=KK.addNode(Y.P,sl.id,-300,0);
A.ok(KK.addLink(Y.P,sn.id,'v',Y.n.id,'a'));near(val(Y),50,1e-9,'syöte nuolesta');
KK.setVal(Y.P,sl.id,10,C);near(val(Y),100);KK.setVal(Y.P,sl.id,0,C);near(val(Y),0);
var ar=KK.addBlock(Y.P,'arvo',{v:'150'});var an=KK.addNode(Y.P,ar.id,-300,200);A.ok(KK.addLink(Y.P,an.id,'v',Y.n.id,'p5'));
var sp=KK.kayraSpec(Y.P,Y.b.id,C);A.deepStrictEqual(sp.lk,[false,false,false,false,true]);A.strictEqual(sp.w[4],150);
KK.setVal(Y.P,sl.id,10,C);near(val(Y),150,1e-9,'porras nuolesta yli 100');
var lk=KK.addBlock(Y.P,'luku',{start:20});Y.b.xmax={r:lk.id};KK.setVal(Y.P,sl.id,10,C);var sp2=KK.kayraSpec(Y.P,Y.b.id,C);A.strictEqual(sp2.x1,20,'x loppu palikasta');near(sp2.t,0.5);

// Kaava: .x, .t, .p1, .ymax ja tulos
var kf=KK.addBlock(Y.P,'kaava',{f:'{#'+Y.b.id+'}.x'});var E=KK.Ev(Y.P,C);A.strictEqual(E.val(kf.id),10);
kf.f='{#'+Y.b.id+'}.t';near(KK.Ev(Y.P,C).val(kf.id),0.5);
kf.f='{#'+Y.b.id+'}.p5';A.strictEqual(KK.Ev(Y.P,C).val(kf.id),150);
kf.f='{#'+Y.b.id+'}.p9';A.ok(KK.isErr(KK.Ev(Y.P,C).val(kf.id)));
kf.f='{#'+Y.b.id+'}.ymax';A.strictEqual(KK.Ev(Y.P,C).val(kf.id),100);
kf.f='{#'+Y.b.id+'} * 2';near(KK.Ev(Y.P,C).val(kf.id),val(Y)*2);
// Miksi?
var w=KK.why(Y.P,KK.Ev(Y.P,C),Y.b.id,2);A.ok(/Syöte 10 on 50 % x-välistä 0–20/.test(w.txt),w.txt);A.ok(w.kids.length>=2,'syötteen ja portaan lähteet');

// Portaiden määrän muutos säilyttää muodon; repair korjaa
var Z=mk();Z.b.pw=KK.kayraPreset('s',5);var before=[];for(var i=0;i<=10;i++){Z.b.a=i;before.push(val(Z));}
Z.b.pw=KK.kayraResize(Z.b.pw,9);Z.b.pn=9;KK.repair(Z.P);for(i=0;i<=10;i++){Z.b.a=i;near(val(Z),before[i],4,'muoto säilyy '+i);}
Z.b.pn=99;Z.b.pw=['x',-5,'50,5'];Z.b.dec=7;Z.b.ymin=null;KK.repair(Z.P);
A.strictEqual(Z.b.pn,10);A.strictEqual(Z.b.pw.length,10);A.strictEqual(Z.b.pw[0],0);A.strictEqual(Z.b.pw[1],0);A.strictEqual(Z.b.pw[2],50.5);A.strictEqual(Z.b.dec,'');A.strictEqual(Z.b.ymin,0);
// Portaan nuoli poistuu, kun portaita vähennetään
Y.b.pn=3;Y.b.pw=KK.kayraResize(Y.b.pw,3);KK.repair(Y.P);A.ok(!Y.P.lg.l.some(function(l){return l.tp==='p5';}),'p5-nuoli pois');
// Tallennus ja palautus
var Q=KK.repair(JSON.parse(JSON.stringify(Y.P)));A.strictEqual(Q.b[Y.b.id].k,'kayra');KK.setVal(Q,sl.id,5,C);A.ok(typeof KK.Ev(Q,C).val(Y.b.id)==='number');
// Valmiit muodot
A.deepStrictEqual(Object.keys(KK.KAYRA_PRESETS),['suora','kiihtyy','hidastuu','s','kumpu','laskee']);
A.deepStrictEqual(KK.kayraPreset('suora',3),[0,50,100]);A.deepStrictEqual(KK.kayraPreset('laskee',3),[100,50,0]);A.deepStrictEqual(KK.kayraPreset('kumpu',3),[0,100,0]);
// Satunnaisluvun käyrä ennallaan (nollaraja säilyy)
A.strictEqual(KK.satuCurve([0,0,100],0.2),Math.max(0,KK.curveAt([0,0,100],0.2)));
console.log('käyrä ok');
