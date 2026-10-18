// Jonon 17c (F42 vaihe 1, suunnitelma 26): kerroksen syvyys sy. Koko ja rullausvauhti samasta kaavasta 100/(1+sy/100) %,
// katoamispiste ruudun keskikohta. Palikan oma rullausvauhti ohittaa kerroksen syvyyden. Napautus, pudotus ja korostus
// muunnetaan syvyyden mukaan; vanha rullausvauhti ennallaan; tallennus ja vanhan projektin avaus.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(3000000);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function near(a,b,m){A.ok(Math.abs(a-b)<1e-9,(m||'')+' '+a+' ≠ '+b);}

// 1. Koko syvyydestä
[[-50,2],[0,1],[100,0.5],[300,0.25],[900,0.1]].forEach(function(c){near(KK.syKoko(c[0]),c[1],'syvyys '+c[0]);});
near(KK.syKoko(-200),10,'alaraja −90');A.strictEqual(KK.syNorm('-200'),-90);A.strictEqual(KK.syNorm('300,5'),300.5);A.strictEqual(KK.syNorm('x'),null);
// 2. Muunnos: ruudun keskikohta on kiintopiste, liike = sama prosentti
var nk={x:-200,y:-100,z:1,zf:1,w:400,h:800};       // ruudun keskikohta maailmassa (400, 500)
var m=KK.syMuunnos(300,nk);near(m.s,0.25);near(m.x,400*0.75);near(m.y,500*0.75);
A.deepStrictEqual(KK.syMuunnos(300,null),{s:1,x:0,y:0},'ilman kameraa ei mitään');A.deepStrictEqual(KK.syMuunnos(0,nk),{s:1,x:0,y:0});
// kameran liike d: syvä kohta liikkuu ruudulla d·koko
var p=50,a=p*m.s+m.x-(-nk.x),nk2={x:-300,y:-100,z:1,zf:1,w:400,h:800},m2=KK.syMuunnos(300,nk2),b2=p*m2.s+m2.x-(-nk2.x);near(a-b2,100*0.25,'parallaksi 25 %');
// zoomaus suurentaa kaikkia syvyyksiä samassa suhteessa: kohta ruudulla = (W - kamera)·z
var nz={x:-400,y:-200,z:2,zf:1,w:400,h:800},mz=KK.syMuunnos(100,nz),scr=function(q,n,mm){return (q*mm.s+mm.x)*n.z+n.x;};
near(scr(300,nz,mz)-scr(200,nz,mz),100*0.5*2,'zoomattuna väli kasvaa z:n verran');
// muokatessa (ed): kehyksen keskikohta, rullausvauhti ei siirrä
var ed={ed:1,cx:195,cy:422};m=KK.syMuunnos(100,ed);near(m.s,0.5);near(m.x,97.5);near(m.y,211);A.deepStrictEqual(KK.rvMuunnos(50,ed),{s:1,x:0,y:0});

// 3. Kerros ja palikka
var P=KK.newProject('sy');P.views[0].kr=[{id:'k1',n:'Vuoret',sy:900},{id:'k2',n:'Puut',sy:300,rv:50},{id:'pohja',n:'Pohja'},{id:'k3',n:'Palkki',rv:0}];
KK.repair(P);var ks=P.views[0].kr;A.strictEqual(ks[1].sy,300);A.strictEqual(ks[1].rv,undefined,'kerroksella joko syvyys tai vauhti');
P.views[0].kr.push({id:'k4',n:'Etu',sy:-500});KK.repair(P);A.strictEqual(P.views[0].kr[4].sy,-90,'alaraja tallessa');P.views[0].kr.pop();
var v=U(P,'alue',{kr:'k1'},300,400,200,100,'Kaukana'),t=U(P,'muoto',{kr:'k2'},0,0,40,40,'Puu'),pa=U(P,'muoto',{},0,0,40,40,'Pinta');KK.repair(P);
var E=KK.Ev(P,C);A.strictEqual(KK.syOf(P,v,E),900);A.strictEqual(KK.syOf(P,pa,E),0);A.ok(!KK.pinnalla(P,v)&&KK.pinnalla(P,pa));
m=KK.palikkaMuunnos(P,E,v,nk);near(m.s,0.1);
// oma rullausvauhti ohittaa syvyyden
t.rv=100;KK.repair(P);A.strictEqual(KK.syOf(P,t,KK.Ev(P,C)),0);A.deepStrictEqual(KK.palikkaMuunnos(P,KK.Ev(P,C),t,nk),{s:1,x:0,y:0});A.ok(KK.pinnalla(P,t));delete t.rv;KK.repair(P);
// asetettu rullausvauhti (toiminto) ohittaa myös
P.st['o:'+t.id]={rv:50};A.strictEqual(KK.syOf(P,t,KK.Ev(P,C)),0,'asetettu vauhti voittaa');delete P.st['o:'+t.id];
// kerroksen muunnos: lukittu ja vauhti ennallaan
A.deepStrictEqual(KK.kerrosMuunnos(P,P.views[0].id,'k3',nk),KK.rvMuunnos(0,nk));near(KK.kerrosMuunnos(P,P.views[0].id,'k2',nk).s,0.25);

// 4. Napautus osuu näkyvään kohtaan: Alue (300,400,200,100) syvyydessä 900 → näkyy (400 + (300−400)·0,1, 500 + (400−500)·0,1) = (390, 490), koko 20 × 10
var cA=KK.addBlock(P,'muisti',{v:'0'});N(P,cA);var tee=KK.addBlock(P,'tee',{do:'lisaa',o:cA.id});KK.addLink(P,N(P,v).id,'nap',N(P,tee).id,'e');KK.repair(P);
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,395,495,C,nk),[v.id],'näkyvä kohta osuu');
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,350,450,C,nk),[],'siirtämätön paikka ei');
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,350,450,C),[v.id],'ilman kameraa ennallaan');
// Liike napautukseen: kohde syvässä kerroksessa menee kohtaan, joka näkyy napautetussa
var li=KK.addBlock(P,'liike',{o:t.id,ohj:'napautus',vm:1000});N(P,li);KK.repair(P);KK.liikeNapautus(P,P.views[0].id,410,520,C,nk);var st=P.st[li.id];
near(st.tx*0.25+400*0.75,410,'x näkyy napautetussa');near(st.ty*0.25+500*0.75,520);
// pudotus ja korostus
var r=U(P,'muoto',{},500,500,20,20,'Kortti');r.raah=true;r.rpa='alue';KK.repair(P);
var o=KK.raahausPaikka(P,r,385,485,C,nk);A.ok(o.ok&&o.alue&&o.alue.id===v.id,'pudotus näkyvään syvään Alueeseen');
var kh=KK.raahausKohteet(P,r,C,nk).filter(function(q){return q.id===v.id;})[0];near(kh.x,390);near(kh.y,490);near(kh.w,20);near(kh.h,10);

// 5. Vanha projekti ja tallennus: ilman sy:tä rullausvauhti täsmälleen ennallaan
var Q=KK.newProject('vanha');Q.views[0].kr=[{id:'k1',n:'Tausta',rv:50},{id:'pohja',n:'Pohja'}];var qb=U(Q,'muoto',{kr:'k1'},10,10,20,20,'T');KK.repair(Q);
A.deepStrictEqual(KK.palikkaMuunnos(Q,KK.Ev(Q,C),qb,nk),KK.rvMuunnos(50,nk));A.strictEqual(Q.views[0].kr[0].sy,undefined);
var J=JSON.parse(JSON.stringify(KK.payload?KK.payload(P):{projekti:P}));var P2=J.projekti||J;KK.repair(P2);A.strictEqual(P2.views[0].kr[0].sy,900,'tallennus säilyttää syvyyden');
// sisällön alareuna ei laske syviä palikoita
A.ok(KK.pinnalla(P,pa)&&!KK.pinnalla(P,t));
console.log('ok logiikka_97_syvyys');
