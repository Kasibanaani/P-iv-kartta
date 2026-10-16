// Appi-appi 8: liike ruutu kerrallaan (ohjaus Ruutu): suuntatapahtumat, jono, ruudukko ja askelpituus, esteet ja rajat,
// tatti pidettynä, pyyhkäisy, liukuminen ja hyppy, liikkuu kun, askel valmis, kääntyminen, korjaus. Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-6),(m||'')+' '+a+' ≠ '+b);}
function N(P,b){return KK.addNode(P,b.id,0,0);}
function LB(P,k,o){var b=KK.addBlock(P,k,o);N(P,b);return b;}
function run(P,s,dt){dt=dt||1/60;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function nappi(P,vw,li,su){var n=KK.addBlock(P,'nappi',{v:vw,tx:su,beh:'kerta'});KK.addLink(P,N(P,n).id,'e',KK.nodesOfBlock(P,li.id)[0].id,su);return n;}
function paina(P,n){KK.press(P,n.id,C);}
function keski(P,b){var E=KK.Ev(P,C);return [E.omiNum(b.id,'x',0)+b.w/2,E.omiNum(b.id,'y',0)+b.h/2];}

// --- 1. Kytkentäkohdat ---
var P=KK.newProject('r');var vw=P.views[0].id;P.views[0].laite='puhelin';P.views[0].kr=[{id:'pohja',n:'Pohja',rk:40}];
var h=KK.addBlock(P,'muoto',{v:vw,laji:'ympyra'});h.x=40;h.y=40;h.w=40;h.h=40;
var li=LB(P,'liike',{o:h.id,ohj:'ruutu',vm:'160'});KK.repair(P);A.strictEqual(li.ohj,'ruutu');
var pr=KK.ports(li);A.deepStrictEqual(pr.ins.map(function(x){return x.p;}),['vm','yl','al','va','oi','c','e']);
A.ok(pr.outs.some(function(x){return x.p==='ast';}),'askel valmis');A.strictEqual(KK.ruutuAskel(P,li),40,'askel = ruutu');
var ast=laskuri(P,li,'ast'),tor=laskuri(P,li,'tor');
var bo=nappi(P,vw,li,'oi'),ba=nappi(P,vw,li,'al'),bv=nappi(P,vw,li,'va'),by=nappi(P,vw,li,'yl');KK.repair(P);
// --- 2. Oikealle yksi ruutu: liukuu 160 px/s → 40 px 0,25 s:ssa, askel valmis kerran ---
paina(P,bo);A.strictEqual(P.st[li.id].rq,'oi');A.ok(KK.liikeKay(P,li.id),'kuvasilmukka käyntiin');
run(P,0.125);var c=keski(P,h);near(c[0],80,1.5,'puolivälissä');A.strictEqual(KK.Ev(P,C).val(li.id,'m'),true);near(KK.Ev(P,C).val(li.id,'nop'),160,0.01);
run(P,0.3);c=keski(P,h);A.deepStrictEqual(c,[100,60],'seuraavan ruudun keskellä');A.strictEqual(KK.Ev(P,C).val(ast.id),1);
A.strictEqual(KK.Ev(P,C).val(li.id,'m'),false);A.ok(!KK.liikeKay(P,li.id),'pysähtyi');A.strictEqual(KK.Ev(P,C).omiNum(h.id,'ruutux',0),3);
// --- 3. Jono: kaksi painallusta peräkkäin → kaksi askelta ilman pysähdystä, uusin jonossa voittaa ---
paina(P,ba);run(P,0.05);paina(P,bo);paina(P,ba);A.strictEqual(P.st[li.id].rq,'al','uusin voittaa');
run(P,0.6);A.deepStrictEqual(keski(P,h),[100,140]);A.strictEqual(KK.Ev(P,C).val(ast.id),3);
// --- 4. Este: seinä alla → ei liiku, törmäsi joka painalluksella ---
var se=KK.addBlock(P,'muoto',{v:vw});se.x=0;se.y=160;se.w=400;se.h=40;se.este=true;KK.repair(P);
paina(P,ba);run(P,0.3);A.deepStrictEqual(keski(P,h),[100,140],'seinä estää');A.strictEqual(KK.Ev(P,C).val(tor.id),1);A.strictEqual(KK.Ev(P,C).val(li.id,'osuu'),true);
paina(P,ba);run(P,0.1);A.strictEqual(KK.Ev(P,C).val(tor.id),2,'uusi yritys = uusi törmäys');
A.strictEqual(KK.Ev(P,C).val(li.id,'suu'),180,'katsoo seinää kohti');
// --- 5. Rajat: x enintään 120 (vasen yläkulma) estää askeleen ---
li.xmax='120';paina(P,bo);run(P,0.3);A.deepStrictEqual(keski(P,h),[140,140],'120 sallittu');paina(P,bo);run(P,0.3);A.deepStrictEqual(keski(P,h),[140,140],'raja estää');A.strictEqual(KK.Ev(P,C).val(tor.id),3);delete li.xmax;
// --- 6. Kohdistus: ruudun ulkopuolelta ensimmäinen askel vie ruudun keskelle ---
KK.setOmi(P,h.id,'x',113);KK.setOmi(P,h.id,'y',103);paina(P,by);run(P,0.5);A.deepStrictEqual(keski(P,h),[140,100],'kohdistui');
// --- 7. Liikkuu kun: ehto ei päde → pysähtyy kesken, jatkaa kun pätee ---
var eh=LB(P,'arvo',{v:'kyllä'});KK.addLink(P,N(P,eh).id,'v',KK.nodesOfBlock(P,li.id)[0].id,'c');KK.repair(P);
paina(P,bv);run(P,0.1);var c1=keski(P,h);eh.v='ei';run(P,0.3);A.deepStrictEqual(keski(P,h),c1,'seis');A.ok(c1[0]<140&&c1[0]>100);
eh.v='kyllä';KK.tick(P,C);paina(P,by);run(P,0.6);A.deepStrictEqual(keski(P,h),[100,60],'jatkoi ja jonossa ollut ylös');
// --- 8. Hyppy: suuri nopeus vie perille yhdessä kuvassa ---
li.vm='100000';paina(P,bo);run(P,1/60);A.deepStrictEqual(keski(P,h),[140,60],'hyppy');li.vm='160';
// --- 9. Tatti pidettynä: askel toisensa perään, törmäsi kerran pidettäessä ---
var Q=KK.newProject('t');var qv=Q.views[0].id;Q.views[0].kr=[{id:'pohja',n:'Pohja',rk:50}];
var g=KK.addBlock(Q,'muoto',{v:qv});g.x=0;g.y=0;g.w=50;g.h=50;var tj=KK.addBlock(Q,'tatti',{v:qv});
var sq=KK.addBlock(Q,'muoto',{v:qv});sq.x=250;sq.y=0;sq.w=50;sq.h=50;sq.este=true;
var lq=LB(Q,'liike',{o:g.id,ohj:'ruutu',vm:'200',tt:tj.id});var tq=laskuri(Q,lq,'tor'),aq=laskuri(Q,lq,'ast');KK.repair(Q);
KK.tattiSet(Q,tj.id,0.3,0,C,'alku');run(Q,0.5);A.deepStrictEqual(keski(Q,g),[25,25],'alle puolivälin ei liiku');
KK.tattiSet(Q,tj.id,0.9,0.2,C,'liike');run(Q,0.6);var cq=keski(Q,g);A.ok(cq[0]>=125,'kulkee askel askeleelta: '+cq);A.strictEqual(cq[1],25);
run(Q,2);A.deepStrictEqual(keski(Q,g),[225,25],'pysähtyy esteen eteen');A.strictEqual(KK.Ev(Q,C).val(tq.id),1,'törmäsi kerran pidettäessä');A.strictEqual(KK.Ev(Q,C).val(aq.id),4);
KK.tattiSet(Q,tj.id,0,0,C,'loppu');run(Q,0.2);KK.tattiSet(Q,tj.id,0.1,0.8,C,'alku');run(Q,0.1);KK.tattiSet(Q,tj.id,0,0,C,'loppu');run(Q,0.3);A.deepStrictEqual(keski(Q,g),[225,75],'alas: vallitseva suunta, askel loppuun irrotuksen jälkeen');
// --- 10. Pyyhkäisy vain valinnalla ---
A.strictEqual(KK.liikePyyhkaisy(Q,qv,'va',C),0,'ei pyyhkäisyä ilman valintaa');lq.pyy=true;KK.repair(Q);
A.strictEqual(KK.liikePyyhkaisy(Q,qv,'va',C),1);run(Q,0.3);A.deepStrictEqual(keski(Q,g),[175,75]);
A.strictEqual(KK.liikePyyhkaisy(Q,'muu','va',C),0,'toinen näkymä');
// --- 11. Ilman ruudukkoa: askel b.ra (oletus 40), kääntyminen kulkusuuntaan ---
var R=KK.newProject('a');var rv=R.views[0].id;var m=KK.addBlock(R,'muoto',{v:rv});m.x=10;m.y=10;m.w=20;m.h=20;
var lr=LB(R,'liike',{o:m.id,ohj:'ruutu',vm:'400',kaanny:'kaanny'});KK.repair(R);A.strictEqual(KK.ruutuAskel(R,lr),40);
KK.liikeRuutuKomento(R,lr.id,'al',C);run(R,0.2);A.deepStrictEqual(keski(R,m),[20,60]);A.strictEqual(KK.Ev(R,C).omiNum(m.id,'kulma',0),180,'kääntyi alas');
lr.ra='25';KK.repair(R);KK.liikeRuutuKomento(R,lr.id,'oi',C);run(R,0.2);A.deepStrictEqual(keski(R,m),[45,60]);A.strictEqual(KK.Ev(R,C).omiNum(m.id,'kulma',0),90);
A.strictEqual(KK.liikeRuutuKomento(R,lr.id,'vino',C),false,'tuntematon suunta');
// --- 12. Alkuun, korjaus ja tallennus ---
KK.liikeRuutuKomento(R,lr.id,'oi',C);run(R,0.02);var R2=JSON.parse(JSON.stringify(R));KK.repair(R2);A.strictEqual(R2.st[lr.id].rx,R.st[lr.id].rx,'askel kesken säilyy');
run(R2,0.3);A.deepStrictEqual(keski(R2,R2.b[m.id]),[70,60],'jatkuu tallennuksen jälkeen');
KK.liikeAlkuun(R,lr.id);A.deepStrictEqual(keski(R,m),[20,20]);
lr.pyy='joo';lr.ra='x';KK.repair(R);A.strictEqual(lr.pyy,undefined);A.strictEqual(lr.ra,undefined);
R.st[lr.id]={x:0,y:0,rq:'vino',rx:'a'};KK.repair(R);run(R,0.1);A.deepStrictEqual(keski(R,m),[20,20],'rikkinäinen tila ei liikuta');
lr.ohj='ruutu';li.ohj='';KK.repair(P);A.ok(!KK.ports(li).ins.some(function(x){return x.p==='yl';}),'suuntakohdat vain ruutuliikkeellä');
console.log('ok');
