// Pajakone 3d: tatti, muutos ajassa, liike ja näkymäpalikan siirto (dx, dy). Moottorin osuus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function val(P,id,p){return KK.Ev(P,C).val(id,p);}
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-9),(m||'')+' '+a+' ≠ '+b);}

// --- Tatti ---
var P=KK.newProject('t');var j=KK.addBlock(P,'tatti',{});A.strictEqual(j.nm,'Tatti');
A.deepStrictEqual(KK.ports(j).outs.map(function(p){return p.p;}),['v','x','y','s','e','irti']);
A.deepStrictEqual(KK.ports(j).ins.map(function(p){return p.p;}),['nk','hk','tx','vr','dx','dy']);
A.strictEqual(val(P,j.id),0);A.strictEqual(val(P,j.id,'x'),0);
var jn=KK.addNode(P,j.id,0,0);
function counter(port,y){var m=KK.addBlock(P,'muisti',{v:'0'});KK.addNode(P,m.id,600,y);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});var tn=KK.addNode(P,t.id,300,y);A.ok(KK.addLink(P,jn.id,port,tn.id,'e'));return m;}
var mA=counter('e',0),mL=counter('irti',100);
KK.tattiSet(P,j.id,0.6,0.8,C,'alku');A.strictEqual(val(P,mA.id),1);near(val(P,j.id),1);near(val(P,j.id,'x'),0.6);near(val(P,j.id,'y'),0.8);
A.strictEqual(val(P,j.id,'s'),143,'suunta: 0 = ylös, myötäpäivään');
KK.tattiSet(P,j.id,3,0,C,'liike');near(val(P,j.id,'x'),1,1e-9,'rajataan ympyrään');A.strictEqual(val(P,j.id,'s'),90);
KK.tattiSet(P,j.id,0,-0.5,C,'liike');A.strictEqual(val(P,j.id,'s'),0);near(val(P,j.id),0.5);
KK.tattiSet(P,j.id,0.2,0.2,C,'loppu');A.strictEqual(val(P,j.id),0);A.strictEqual(val(P,mL.id),1);A.strictEqual(val(P,mA.id),1);
var kf=KK.addBlock(P,'kaava',{f:'{#'+j.id+'}.suunta'});KK.tattiSet(P,j.id,-1,0,C,'liike');A.strictEqual(val(P,kf.id),270);

// --- Muutos ajassa ---
var M=KK.newProject('m');var mu=KK.addBlock(M,'muutos',{a:10,b:20,kesto:2});var mn=KK.addNode(M,mu.id,300,0);
A.deepStrictEqual(KK.ports(mu).ins.map(function(p){return p.p;}),['e','x','a','b','k']);A.deepStrictEqual(KK.ports(mu).outs.map(function(p){return p.p;}),['v','t','r','e']);
A.strictEqual(val(M,mu.id),10,'ennen käynnistystä alku');A.strictEqual(val(M,mu.id,'r'),false);
var bt=KK.addBlock(M,'nappi',{beh:'kerta'});var bn=KK.addNode(M,bt.id,0,0);KK.addLink(M,bn.id,'e',mn.id,'e');
var vm=KK.addBlock(M,'muisti',{v:'0'});KK.addNode(M,vm.id,900,0);var tv=KK.addBlock(M,'tee',{do:'lisaa',o:vm.id});var tvn=KK.addNode(M,tv.id,600,0);KK.addLink(M,mn.id,'e',tvn.id,'e');
KK.press(M,bt.id,C);A.strictEqual(val(M,mu.id,'r'),true);A.strictEqual(val(M,mu.id),10);
T+=500;near(val(M,mu.id),12.5);near(val(M,mu.id,'t'),0.25);A.ok(KK.frame(M,0.5,C),'käynnissä');A.strictEqual(val(M,vm.id),0);
T+=1600;near(val(M,mu.id),20,1e-9,'ei yli lopun');A.strictEqual(KK.frame(M,0.5,C),true);A.strictEqual(val(M,mu.id,'r'),false);A.strictEqual(val(M,vm.id),1,'valmis kerran');
A.strictEqual(KK.frame(M,0.5,C),false,'ei enää käynnissä');A.strictEqual(val(M,vm.id),1);A.strictEqual(val(M,mu.id),20);
// Pysäytä keskelle
KK.press(M,bt.id,C);T+=1000;var px=KK.addBlock(M,'nappi',{beh:'kerta'});var pxn=KK.addNode(M,px.id,0,200);KK.addLink(M,pxn.id,'e',mn.id,'x');KK.press(M,px.id,C);
A.strictEqual(val(M,mu.id,'r'),false);near(val(M,mu.id),15);T+=5000;near(val(M,mu.id),15,1e-9,'pysähtynyt pysyy');
// Toisto ja edestakaisin
mu.toisto='toista';KK.press(M,bt.id,C);T+=2500;near(val(M,mu.id,'t'),0.25);mu.toisto='edestakaisin';T+=2000;near(val(M,mu.id,'t'),0.25,1e-9,'menossa');T+=2000;near(val(M,mu.id,'t'),0.75,1e-9,'palaamassa');
A.strictEqual(KK.frame(M,0.1,C),true);A.strictEqual(val(M,mu.id,'r'),true,'toistuva ei pääty');
// Kesto nuolesta, virhe
mu.kesto=0;A.ok(KK.isErr(val(M,mu.id))&&/yli 0/.test(val(M,mu.id).err));mu.kesto=2;
// Muutos + Käyrä: edistyminen käyrän syötteeksi
mu.toisto='kerta';var ky=KK.addBlock(M,'kayra',{xmin:0,xmax:1,ymin:0,ymax:300});ky.pw=KK.kayraPreset('kiihtyy',5);var kyn=KK.addNode(M,ky.id,600,300);KK.addLink(M,mn.id,'t',kyn.id,'a');
KK.press(M,bt.id,C);T+=1000;var y=val(M,ky.id);A.ok(y>0&&y<150,'kiihtyvä puolivälissä alle puolen: '+y);T+=1000;near(val(M,ky.id),300);

// --- Liike ---
var L=KK.newProject('l');var li=KK.addBlock(L,'liike',{x0:100,y0:50,xmin:0,xmax:390});var lin=KK.addNode(L,li.id,300,0);
/* Jonon 17: hyppää ja lopeta hyppy ennen alkuun-kohtaa. */A.deepStrictEqual(KK.ports(li).ins.map(function(p){return p.p;}),['vx','vy','c','hyp','hyx','e']);A.deepStrictEqual([val(L,li.id),val(L,li.id,'y')],[100,50]);
A.strictEqual(KK.frame(L,0.5,C),false,'ei nopeutta, ei liikettä');
li.vx=40;li.vy='-10';A.strictEqual(KK.frame(L,0.25,C),true);KK.frame(L,0.25,C);A.deepStrictEqual([val(L,li.id),val(L,li.id,'y')],[120,45]);
KK.frame(L,0.25,C);A.strictEqual(val(L,li.id),130);
li.vx=10000;KK.frame(L,0.5,C);A.strictEqual(val(L,li.id),390,'raja');
KK.frame(L,5,C);A.strictEqual(val(L,li.id,'y'),45-2.5-2.5-2.5,'dt rajataan 0,25 s');
// Liikkuu kun: ehto nuolesta
var ru=KK.addBlock(L,'ruutu',{});var run=KK.addNode(L,ru.id,0,200);KK.addLink(L,run.id,'v',lin.id,'c');var y0=val(L,li.id,'y');A.strictEqual(KK.frame(L,0.1,C),false);A.strictEqual(val(L,li.id,'y'),y0);
KK.userSet(L,ru.id,true,C);KK.frame(L,0.1,C);A.ok(val(L,li.id,'y')<y0);
// Alkuun
var rb=KK.addBlock(L,'nappi',{beh:'kerta'});var rbn=KK.addNode(L,rb.id,0,300);KK.addLink(L,rbn.id,'e',lin.id,'e');KK.press(L,rb.id,C);A.deepStrictEqual([val(L,li.id),val(L,li.id,'y')],[100,50]);
// Tatti → nopeus → liike → painikkeen siirto
var tj=KK.addBlock(L,'tatti',{});var tjn=KK.addNode(L,tj.id,-600,400);li.vx='';li.vy='';delete li.xmax;
var lk=KK.addBlock(L,'lasku',{op:'mul',b:200});var lkn=KK.addNode(L,lk.id,-300,400);KK.addLink(L,tjn.id,'x',lkn.id,'a');KK.addLink(L,lkn.id,'v',lin.id,'vx');
var hah=KK.addBlock(L,'nappi',{v:L.views[0].id});var hn=KK.addNode(L,hah.id,700,0);A.ok(KK.addLink(L,lin.id,'v',hn.id,'dx'),'siirto x');A.ok(KK.addLink(L,lin.id,'y',hn.id,'dy'));
KK.userSet(L,ru.id,true,C);KK.tattiSet(L,tj.id,0.5,0,C,'alku');KK.frame(L,0.2,C);A.strictEqual(val(L,li.id),120);
A.strictEqual(KK.Ev(L,C).inp(hah.id,'dx'),120);A.strictEqual(KK.Ev(L,C).inp(hah.id,'dy'),50);
// Repair ja tallennus
mu.toisto='outo';M.st[mu.id]='rikki';L.st[li.id]={x:'a'};KK.repair(M);KK.repair(L);A.strictEqual(mu.toisto,'kerta');A.strictEqual(M.st[mu.id],undefined);A.strictEqual(L.st[li.id],undefined);
var Q=KK.repair(JSON.parse(JSON.stringify(L)));A.strictEqual(Q.b[li.id].k,'liike');
console.log('liike ok');
