// Jonon 15e (F37 vaihe 3, suunnitelma 21 kohta 6.3, suunnitelma 25 kohta 8 ja kartoitus 8 U3/U4): Joukon jäsenten tapahtumat
// kiinteänä listana (yhteiset + Jäsenten laji jlj), tapahtuma.jäsen, Toiminnon kohde Tapahtuman jäsen (otj), Toista jäsenille,
// ikkuna Jäsenille (jas), tallennusversio 12 ja vanhan muunto.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(m){C.last=m;},nav:function(){}};
function N(P,b,x,y,g){return KK.addNode(P,b.id,x||0,y||0,g||'');}
function E(P){return KK.Ev(P,C);}
function outs(b){return KK.ports(b).outs.map(function(o){return o.p;});}
function run(P,s,dt){dt=dt||0.05;for(var i=0;i<Math.round(s/dt);i++){T+=dt*1000;KK.frame(P,dt,C);}}
A.ok(KK.VER>=12,'tallennusversio vähintään 12');

var P=KK.newProject('jt'),vw=P.views[0].id;
var J=KK.jkLuo(P,'napit');
function nappi(nm,x,y){var b=KK.addBlock(P,'nappi',{nm:nm,x:x,y:y,beh:'kerta'});b.jkt=[J];N(P,b);return b;}
var n1=nappi('Eka',10,100),n2=nappi('Toka',10,300),n3=KK.addBlock(P,'nappi',{nm:'Ulkopuolinen',x:10,y:500,beh:'kerta'});N(P,n3);
var pj=KK.addBlock(P,'pjoukko',{jj:J}),pjn=N(P,pj,500,0);KK.repair(P);

// 1. Kiinteät tapahtumat: yhteiset aina, lajin omat Jäsenten lajista (ei hetken jäsenistä)
A.deepStrictEqual(outs(pj),['v','jm','j_mu','j_ral','j_rpu','j_rpe','j_nap','j_pitka'],'yhteiset tapahtumat ilman lajia (14b: napautettu ja pitkä painallus)');
// 1s (kartoitus 9, S3): näkymäpalikka voi liikkua, joten lajin perään tulevat myös Liikkeen tapahtumat.
pj.jlj='nappi';KK.repair(P);A.deepStrictEqual(outs(pj),['v','jm','j_mu','j_ral','j_rpu','j_rpe','j_nap','j_pitka','j_e','j_irti','j_tor','j_lask','j_irt','j_per','j_ast'],'Painikkeen tapahtumat (jonon 16: myös laskeutui ja irtosi maasta)');
A.strictEqual(KK.port(pj,'outs','j_e').n,'jäsen painettu');
var tyhja=KK.addBlock(P,'pjoukko',{jj:KK.jkLuo(P,'tyhja'),jlj:'liike'});N(P,tyhja);KK.repair(P);
A.ok(['j_tor','j_per','j_ast','j_eip'].every(function(p){return p==='j_eip'||outs(tyhja).indexOf(p)>=0;}),'Liike: törmäsi, perillä, askel valmis, myös tyhjällä joukolla: '+outs(tyhja));
A.strictEqual(E(P).val(pj.id,'jm'),'Eka, Toka','kohta jäsenet');A.strictEqual(E(P).prop(pj.id,'jäsenet'),'Eka, Toka','ominaisuus jäsenet ennallaan');

// 2. Jäsenen tapahtuma lähtee Joukosta; ulkopuolinen ei; tapahtuma.jäsen ja Tapahtuman jäsen
var las=KK.addBlock(P,'muisti',{nm:'Laskuri',v:'0'});N(P,las);
var tap=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tap);KK.repair(P);
var tl=KK.addBlock(P,'tee',{do:'lisaa',o:las.id}),tln=N(P,tl);KK.addLink(P,pjn.id,'j_e',tln.id,'e');
var mn=KK.addBlock(P,'muisti',{nm:'Kuka',v:''});N(P,mn);
var tk=KK.addBlock(P,'tee',{do:'aseta',o:mn.id,v:'{#'+tap.id+'.jäsen}'}),tkn=N(P,tk);KK.addLink(P,pjn.id,'j_e',tkn.id,'e');
var tj=KK.addBlock(P,'tee',{do:'valitse',otj:1}),tjn=N(P,tj);KK.addLink(P,pjn.id,'j_e',tjn.id,'e');KK.repair(P);
A.strictEqual(tj.otj,1);A.strictEqual(tj.o,'');
KK.press(P,n2.id,C);var e=E(P);
A.strictEqual(e.val(las.id),1,'jäsenen painallus lähti Joukosta');A.strictEqual(e.val(mn.id),'Toka','tapahtuma.jäsen = jäsenen nimi');
A.strictEqual(e.val(n2.id),2,'Tapahtuman jäsen: Valitse lisäsi painalluksen juuri sille jäsenelle');A.strictEqual(e.val(n1.id),0,'muut jäsenet ennallaan');
KK.press(P,n3.id,C);A.strictEqual(E(P).val(las.id),1,'ei-jäsen ei lähetä');
// Jäsenyys tapahtumahetkellä: Poista joukosta → ei enää
var poi=KK.addBlock(P,'tee',{do:'joukosta',o:n1.id,jo:J});N(P,poi);KK.repair(P);KK.runAction(P,poi.id,C);KK.press(P,n1.id,C);A.strictEqual(E(P).val(las.id),1,'poistettu jäsen ei lähetä');
// Ilman jäsentä: Tapahtuman jäsen on näkyvä virhe
C.last='';var r=KK.runAction(P,tj.id,C);A.ok(r&&/ei ole jäsentä/.test(r.err),JSON.stringify(r));A.ok(/ei ole jäsentä/.test(C.last));
A.ok(/tapahtuman jäsen/.test(KK.descAct(P,tj.id)),KK.descAct(P,tj.id));
// tapahtuma.jäsen.<ominaisuus> ja ilman tapahtumaa puuttuu
A.strictEqual(E(P).prop(tap.id,'jäsen'),null);
var ke=KK.Ev(P,KK.withEv(C,{id:'e1',src:n2.id,nm:'',at:T,jasen:n2.id}));A.strictEqual(ke.prop(tap.id,'jäsen'),'Toka');A.strictEqual(ke.prop(tap.id,'jäsen.y'),300);

// 3. Liikkeen törmäsi jäsenen tapahtumana (Jäsenten laji Liike), kuoren tiedot säilyvät
var Q=KK.newProject('liike');var qv=Q.views[0].id;Q.views[0].laite='puhelin';var QJ=KK.jkLuo(Q,'viholliset');
var h=KK.addBlock(Q,'muoto',{v:qv,laji:'laatikko'});h.x=100;h.y=100;h.w=40;h.h=40;
var sein=KK.addBlock(Q,'muoto',{v:qv,nm:'Seinä'});sein.x=200;sein.y=0;sein.w=20;sein.h=400;sein.este=true;
var li=KK.addBlock(Q,'liike',{o:h.id,vx:'100',vy:'0'});li.jkt=[QJ];N(Q,li);
var qp=KK.addBlock(Q,'pjoukko',{jj:QJ,jlj:'liike'}),qpn=N(Q,qp);var qm=KK.addBlock(Q,'muisti',{v:'0'});N(Q,qm);
var qt=KK.addBlock(Q,'tee',{do:'lisaa',o:qm.id});KK.addLink(Q,qpn.id,'j_tor',N(Q,qt).id,'e');
var qtap=KK.addBlock(Q,'tapaht',{nm:'Tapahtuma'});N(Q,qtap);var qk=KK.addBlock(Q,'muisti',{nm:'Kohde',v:''});N(Q,qk);
var qa=KK.addBlock(Q,'tee',{do:'aseta',o:qk.id,v:'{#'+qtap.id+'.kohde} {#'+qtap.id+'.jäsen}'});KK.addLink(Q,qpn.id,'j_tor',N(Q,qa).id,'e');KK.repair(Q);
run(Q,1.5);A.strictEqual(E(Q).val(qm.id),1,'jäsen törmäsi kerran');A.strictEqual(E(Q).val(qk.id),'Seinä '+li.nm,'kuoren kohde ja jäsen');

// 4. Toista jäsenille: jokainen jäsen kerran, Tapahtuman jäsen kohdistuu siihen
var R=KK.newProject('toista'),RJ=KK.jkLuo(R,'laatat'),ms=[];
for(var i=0;i<3;i++){var m=KK.addBlock(R,'muoto',{nm:'L'+i,x:i*100,y:0});m.jkt=[RJ];N(R,m);ms.push(m);}
var rp=KK.addBlock(R,'pjoukko',{jj:RJ}),rpn=N(R,rp);
var k=KK.addBlock(R,'ketju',{nm:'Ketju'}),wn=N(R,k);
var to=KK.addBlock(R,'toista',{tapa:'jasenet'}),ton=N(R,to,0,60,wn.id);
var ta=KK.addBlock(R,'tee',{do:'lisaa',otj:1,om:'y',v:'7'}),tan=N(R,ta,0,120,wn.id);
var rl=KK.addBlock(R,'muisti',{v:'0'});N(R,rl);var tv=KK.addBlock(R,'tee',{do:'lisaa',o:rl.id}),tvn=N(R,tv,0,180,wn.id);
KK.addLink(R,ton.id,'e',tan.id,'e');KK.addLink(R,tan.id,'e',ton.id,'e');KK.addLink(R,ton.id,'m',tvn.id,'e');KK.repair(R);
A.deepStrictEqual(KK.ports(to).ins.map(function(x){return x.p;}),['e','jm']);
A.ok(KK.chainIssues(R,k.id,C).some(function(x){return /tuo jäsenet/.test(x.t);}),'ilman nuolta näkyy ohje');
KK.addLink(R,rpn.id,'jm',ton.id,'jm');KK.repair(R);A.ok(!KK.chainIssues(R,k.id,C).some(function(x){return /jäsen/.test(x.t);}));
KK.chainStart(R,k.id,C);var er=E(R);
A.deepStrictEqual(ms.map(function(m){return er.omi(m.id,'y');}),[7,7,7],'jokaiselle jäsenelle kerran');A.strictEqual(er.val(rl.id),1,'valmis kerran');A.strictEqual(R.st[k.id].run,false);
// Kesken tallennettu Toista jäsenille -luettelo säilyy korjauksessa
var RS=JSON.parse(JSON.stringify(R));RS.st[k.id]={run:true,tk:[{n:ton.id,v:[]}],fl:{},cnt:{},lst:{}};RS.st[k.id].lst[ton.id]={ms:[ms[1].id,7],i:1,ev0:{id:'e',src:'',nm:'',at:1,jasen:ms[0].id}};
var R2=KK.repair(RS);A.deepStrictEqual(R2.st[k.id].lst[ton.id].ms,[ms[1].id]);A.strictEqual(R2.st[k.id].lst[ton.id].i,1);A.strictEqual(R2.st[k.id].lst[ton.id].ev0.jasen,ms[0].id,'kuoren jäsen säilyy');

// 5. Ikkuna Jäsenille: sisältö lasketaan jokaiselle jäsenelle
var w=KK.addBlock(R,'ikkuna',{m:'cnt',jas:true}),wnn=N(R,w,800,0);
var kv=KK.addBlock(R,'kaava');kv.f=KK.kaavaToIds(R,'jäsen.x > 50');N(R,kv,800,40,wnn.id);KK.repair(R);
A.deepStrictEqual(KK.ports(w).ins.map(function(x){return x.p;}),['in','jm']);
A.ok(KK.isErr(E(R).val(w.id))&&/tuo jäsenet/.test(E(R).val(w.id).err),'ilman nuolta ohje');
KK.addLink(R,rpn.id,'jm',wnn.id,'jm');KK.repair(R);A.strictEqual(E(R).val(w.id),2,'x > 50: L1 ja L2');
w.m='sum';kv.f=KK.kaavaToIds(R,'jäsen.x');KK.repair(R);A.strictEqual(E(R).val(w.id),300,'SUMMA jäsenten x');A.strictEqual(E(R).val(kv.id),null,'ikkunan sisällä ilman jäsentä tyhjä, ei virhettä');
w.riv=true;KK.repair(R);A.ok(!w.jas,'riveille voittaa jäsenille');

// 6. Korjaus ja tallennus
var bad=KK.repair({id:'x',name:'x',seq:9,views:[{id:'v1',n:'N'}],jkr:{j1:{nm:'a'}},b:{
  b1:{id:'b1',k:'pjoukko',nm:'#a',jj:'j1',jlj:'ryhma'},b2:{id:'b2',k:'tee',nm:'T',do:'aseta',otj:true,o:''},b3:{id:'b3',k:'tee',nm:'U',do:'aseta',otj:1,o:'b1',oj:'j1'},
  b4:{id:'b4',k:'ikkuna',nm:'I',m:'and',jas:'kyllä'},b5:{id:'b5',k:'toista',nm:'To',tapa:'jasenet'},b6:{id:'b6',k:'toista',nm:'Tx',tapa:'jotain'}},
  lg:{n:['b1','b2','b3','b4','b5','b6'].map(function(b,i){return {id:'n'+i,p:b,x:0,y:i*50,g:''};}),l:[]},deco:[],st:{}});
A.ok(!bad.b.b1.jlj&&!bad.b.b2.otj&&!bad.b.b4.jas&&!bad.b.b6.tapa,'kelvottomat poistuvat');A.strictEqual(bad.b.b3.otj,1);A.strictEqual(bad.b.b3.o,'');A.ok(!bad.b.b3.oj);A.strictEqual(bad.b.b5.tapa,'jasenet');
var D=KK.repairData({app:'appiappi',ver:11,projects:[JSON.parse(JSON.stringify(P))],cur:''});A.strictEqual(D.ver,KK.VER,'versio 11 aukeaa ja nousee');
// Version 11 lukituskuva nousee, lukittu ketju jatkaa
var L=KK.newProject('lukko');var lk=KK.addBlock(L,'ketju',{nm:'Ketju',lk:2});var lw=N(L,lk);var ll=KK.addBlock(L,'muisti',{nm:'Laskuri'});N(L,ll);
var s1=KK.addBlock(L,'ajastin',{kesto:'10',yks:'s'}),s1n=N(L,s1,0,60,lw.id);var s2=KK.addBlock(L,'tee',{do:'aseta',o:ll.id,v:'5'}),s2n=N(L,s2,0,120,lw.id);KK.addLink(L,s1n.id,'e',s2n.id,'e');
KK.repair(L);KK.chainStart(L,lk.id,C);var JL=JSON.parse(JSON.stringify(L));JL.st[lk.id].snap.ver=11;var L2=KK.repair(JL);
A.strictEqual(L2.st[lk.id].snap.ver,KK.VER);A.strictEqual(L2.st[lk.id].run,true,'lukittu ketju jatkaa');
console.log('logiikka_85_jasenten_tapahtumat ok');
