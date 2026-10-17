// F28 Jana, vaihe 1 (Appi-appi 41): logiikan ikkuna, jonka sisällä olevat Toiminnot laukeavat kohdassaan.
// Aikajana (käynnistä, pysäytä, jatka; aikaleimasta, joten appi kiinni välillä toimii), arvojana (Säädin nuolella),
// hyppy- ja suuntasäännöt, kierros (kerran, toista, edestakaisin), alueen ulkopuolinen merkki, Aseta arvo janaan,
// jana käynnistää janan ja ketju odottaa janan valmistumista, tallennus (repair) ja vanha projekti ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,12,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function at(ms){NOW=ms;}
function E(P){return KK.Ev(P,C);}
function blk(P,k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g||'');return {b:b,n:n};}
var LOG=[];
/* Merkki: Toiminto, joka kirjaa nimensä ja tapahtuman suunnan lokiin (Aseta Muistiin kaavasta). */
function mark(P,J,nm,jk,y){if(!P._tp){P._tp=1;var tp=blk(P,'tapaht',{},-1200,0);KK.setName(P,tp.b.id,'tapahtuma');}var m=blk(P,'muisti',{v:''},-900,0);var t=blk(P,'tee',{do:'aseta',o:m.b.id,v:''},0,y||0,J.n.id);t.n.jk=jk;KK.setName(P,t.b.id,nm);
  var k=blk(P,'kaava',{},-700,0);k.b.f=KK.kaavaToIds(P,'tapahtuma.suunta * 100 + tapahtuma.uusi');KK.addLink(P,k.n.id,'v',t.n.id,'v');t.m=m;return t;}
function jana(P,props,nm){var j=blk(P,'jana',props||{},0,0);KK.setName(P,j.b.id,nm||'Jana');return j;}
function counter(P,J,port){var m=blk(P,'muisti',{v:'0'},-900,300);var t=blk(P,'tee',{do:'lisaa',o:m.b.id,v:'1'},-500,300);KK.addLink(P,J.n.id,port,t.n.id,'e');return m;}
function v(P,id){return E(P).val(id);}
/* Seuranta: kirjataan, milloin merkkien Muistit muuttuvat. */
function watch(P,marks){var s={};marks.forEach(function(t){s[t.b.id]=JSON.stringify(P.st[t.m.b.id]);});return function(){var out=[];marks.forEach(function(t){var x=JSON.stringify(P.st[t.m.b.id]);if(x!==s[t.b.id]){out.push(t.b.nm+'@'+P.st[t.m.b.id]);s[t.b.id]=x;}});return out;};}
function step(P,ms){at(NOW+ms);KK.frame(P,ms/1000,C);}

// 1. Rakenne: lajit, kohdat, ominaisuudet
var P=KK.newProject('jana');var J=jana(P);
A.ok(KK.isWin(J.b));A.strictEqual(J.n.w,480);
A.deepStrictEqual(KK.ports(J.b).ins.map(function(p){return p.p;}),['e','x','j','a','b']);
A.deepStrictEqual(KK.ports(J.b).outs.map(function(p){return p.p;}),['v','os','r','al','e']);
J.b.kierros='toista';A.deepStrictEqual(KK.ports(J.b).outs.map(function(p){return p.p;}),['v','os','r','al','ki']);J.b.kierros='kerta';
J.b.kulku='arvo';A.deepStrictEqual(KK.ports(J.b).ins.map(function(p){return p.p;}),['kd','on','a','b']);A.deepStrictEqual(KK.ports(J.b).outs.map(function(p){return p.p;}),['v','os']);J.b.kulku='aika';
A.ok(['kohta','osuus','käynnissä','alku','loppu','käytössä'].every(function(n){return KK.omat(J.b).some(function(e){return e.n===n;});}),'omat');
A.strictEqual(v(P,J.b.id),0);

// 2. Aikajana: merkit 0, 3, 3 (päällekkäin, ylempi ensin) ja 10 s; valmis lopussa
var m0=mark(P,J,'nolla',0,10),m3b=mark(P,J,'kolmeAla',3,80),m3a=mark(P,J,'kolmeYla',3,40),m10=mark(P,J,'kymmenen',10,10);
var alk=counter(P,J,'al'),val=counter(P,J,'e');
KK.repair(P);var W=watch(P,[m0,m3a,m3b,m10]);
at(new Date(2026,9,17,12,0,0).getTime());
A.ok(KK.janaStart(P,J.b.id,C,0));KK.tick(P,C);
A.deepStrictEqual(W(),['nolla@100'],'alussa oleva laukeaa käynnistyessä, suunta 1, uusi 0');
A.strictEqual(P.st[alk.b.id],1,'alkoi');
step(P,2900);A.deepStrictEqual(W(),[]);A.ok(Math.abs(v(P,J.b.id)-2.9)<1e-6);A.strictEqual(E(P).val(J.b.id,'r'),true);
step(P,200);var w3=W();A.deepStrictEqual(w3.sort(),['kolmeAla@103','kolmeYla@103']);
A.deepStrictEqual(KK.janaCross(KK.janaMarks(P,J.b.id),KK.janaSpec(P,J.b.id,C),2.9,3.1,false).map(function(m){return P.b[m.n.p].nm;}),['kolmeYla','kolmeAla'],'samassa kohdassa ylhäältä alas');
A.strictEqual(E(P).val(J.b.id,'os'),31);
step(P,6000);A.deepStrictEqual(W(),[]);step(P,1000);A.deepStrictEqual(W(),['kymmenen@110']);
A.strictEqual(P.st[val.b.id],1,'valmis');A.strictEqual(E(P).val(J.b.id,'r'),false);A.strictEqual(v(P,J.b.id),10);
step(P,5000);A.deepStrictEqual(W(),[]);A.strictEqual(P.st[val.b.id],1,'ei toista valmista');

// 3. Loppu 10 → 20 kesken: merkki 15 s on ensin ulkopuolella (ei laukea, ei katoa), sitten laukeaa
var P2=KK.newProject('j2');var J2=jana(P2);var a5=mark(P2,J2,'viisi',5),a15=mark(P2,J2,'viisitoista',15);KK.repair(P2);var W2=watch(P2,[a5,a15]);
at(new Date(2026,9,17,13,0,0).getTime());KK.janaStart(P2,J2.b.id,C,0);
step(P2,6000);A.deepStrictEqual(W2(),['viisi@105']);
A.ok(KK.janaIssues(P2,J2.b.id,C).some(function(x){return /ulkopuolella/.test(x.t);}),'huomautus alueen ulkopuolisesta');
J2.b.b=20;step(P2,6000);A.deepStrictEqual(W2(),[]);A.strictEqual(a5.n.jk,5,'kohta pysyy arvossa');A.ok(KK.nodeOf(P2,a15.n.id),'ei katoa');
step(P2,4000);A.deepStrictEqual(W2(),['viisitoista@115']);

// 4. Pysäytä ja jatka
var P3=KK.newProject('j3');var J3=jana(P3);var b4=mark(P3,J3,'nelja',4);KK.repair(P3);var W3=watch(P3,[b4]);
at(new Date(2026,9,17,14,0,0).getTime());KK.janaStart(P3,J3.b.id,C,0);step(P3,2000);KK.janaStop(P3,J3.b.id,C);
step(P3,10000);A.deepStrictEqual(W3(),[]);A.ok(Math.abs(v(P3,J3.b.id)-2)<1e-6,'pysähtyi kohtaan 2');
KK.janaJatka(P3,J3.b.id,C,0);step(P3,1500);A.deepStrictEqual(W3(),[]);step(P3,600);A.deepStrictEqual(W3(),['nelja@104']);

// 5. Appi kiinni: kello 5 min eteen, uudelleenavaus laskee kohdan ja laukaisee väliin jääneet järjestyksessä
var P4=KK.newProject('j4');var J4=jana(P4,{yks:'min',b:3});var c1=mark(P4,J4,'yksi',1),c2=mark(P4,J4,'kaksi',2),c3=mark(P4,J4,'kolme',3);var v4=counter(P4,J4,'e');KK.repair(P4);
at(new Date(2026,9,17,15,0,0).getTime());KK.janaStart(P4,J4.b.id,C,0);
var json=JSON.stringify(P4);var Q=KK.repair(JSON.parse(json)); // tallennus ja avaus
var Wq=watch(Q,[c1,c2,c3].map(function(t){return {b:Q.b[t.b.id],m:{b:Q.b[t.m.b.id]}};}));
at(NOW+5*60000);A.ok(KK.chainPoll(Q,C));A.deepStrictEqual(Wq(),['yksi@101','kaksi@102','kolme@103']);A.strictEqual(Q.st[v4.b.id],1,'valmis avattaessa');A.strictEqual(E(Q).val(J4.b.id),3);
// sama hyppy, asetus vain viimeinen
var Q2=KK.repair(JSON.parse(json));Q2.b[J4.b.id].hyppy='viimeinen';var Wq2=watch(Q2,[c1,c2,c3].map(function(t){return {b:Q2.b[t.b.id],m:{b:Q2.b[t.m.b.id]}};}));
KK.chainPoll(Q2,C);A.deepStrictEqual(Wq2(),['kolme@103']);
var Q3=KK.repair(JSON.parse(json));Q3.b[J4.b.id].hyppy='ei';var Wq3=watch(Q3,[c1,c2,c3].map(function(t){return {b:Q3.b[t.b.id],m:{b:Q3.b[t.m.b.id]}};}));
KK.chainPoll(Q3,C);A.deepStrictEqual(Wq3(),[]);A.strictEqual(Q3.st[v4.b.id],1,'valmis lähtee hypyssäkin');

// 6. Arvojana Säätimellä: hidas veto, paluu molempiin suuntiin, napautus (hyppy) järjestyksessä
var P5=KK.newProject('j5'),vw=P5.views[0].id;var S5=blk(P5,'saadin',{v:vw,min:0,max:10,step:1,start:0});var J5=jana(P5,{kulku:'arvo'});
KK.addLink(P5,S5.n.id,'v',J5.n.id,'kd');var d2=mark(P5,J5,'kaksi',2),d5=mark(P5,J5,'viisi',5),d8=mark(P5,J5,'kahdeksan',8);KK.repair(P5);KK.tick(P5,C);var W5=watch(P5,[d2,d5,d8]);
var got=[];for(var i=1;i<=9;i++){KK.userSet(P5,S5.b.id,i,C);got=got.concat(W5());}
A.deepStrictEqual(got,['kaksi@102','viisi@105','kahdeksan@108'],'hidas veto laukaisee kunkin kerran');
got=[];for(var i2=8;i2>=0;i2--){KK.userSet(P5,S5.b.id,i2,C);got=got.concat(W5());}
A.deepStrictEqual(got,['kahdeksan@-92','viisi@-95','kaksi@-98'],'paluu: molempiin suuntiin, tapahtuma.suunta = −1');
KK.userSet(P5,S5.b.id,10,C);A.deepStrictEqual(W5(),['kaksi@102','viisi@105','kahdeksan@108'],'napautus (hyppy): väliin jääneet laukeavat');
// järjestys hypyssä: janaCross
A.deepStrictEqual(KK.janaCross(KK.janaMarks(P5,J5.b.id),KK.janaSpec(P5,J5.b.id,C),0,10,false).map(function(m){return m.p;}),[2,5,8]);
A.deepStrictEqual(KK.janaCross(KK.janaMarks(P5,J5.b.id),KK.janaSpec(P5,J5.b.id,C),10,0,false).map(function(m){return m.p;}),[8,5,2]);
A.strictEqual(v(P5,J5.b.id),10);A.strictEqual(E(P5).val(J5.b.id,'os'),100);
// vain eteenpäin
J5.b.suunta='eteen';KK.userSet(P5,S5.b.id,0,C);A.deepStrictEqual(W5(),[]);
// päällä-ehto pois: kohta seuraa hiljaa
J5.b.suunta='';var K5=blk(P5,'muisti',{v:false},-900,600);KK.addLink(P5,K5.n.id,'v',J5.n.id,'on');KK.userSet(P5,S5.b.id,6,C);A.deepStrictEqual(W5(),[]);A.strictEqual(v(P5,J5.b.id),6);
P5.lg.l=P5.lg.l.filter(function(l){return l.tp!=='on';});
// hyppy viimeinen arvojanalla: 0 → 10 laukaisee vain 8
KK.userSet(P5,S5.b.id,0,C);W5();J5.b.hyppy='viimeinen';KK.userSet(P5,S5.b.id,10,C);
A.strictEqual(P5.st[d2.m.b.id],-98,'kaksi ei lauennut hypyssä (viimeinen)');A.strictEqual(P5.st[d8.m.b.id],108);

// 7. Kierros: toista (merkit 0 ja 2, pituus 4 s) ja edestakaisin molempiin suuntiin
var P6=KK.newProject('j6');var J6=jana(P6,{b:4,kierros:'toista'});var e0=mark(P6,J6,'alku',0),e2=mark(P6,J6,'kaksi',2);var ki=counter(P6,J6,'ki');KK.repair(P6);
var hits=[];var W6=watch(P6,[e0,e2]);at(new Date(2026,9,17,16,0,0).getTime());KK.janaStart(P6,J6.b.id,C,0);hits=hits.concat(W6());
for(var t6=0;t6<90;t6++){step(P6,100);var w6=W6();hits=hits.concat(w6);}
// alku laukeaa käynnistyksessä ja kierrosten 4 s ja 8 s alussa; kaksi kohdissa 2 ja 6 s
A.strictEqual(P6.st[ki.b.id],2,'kaksi kierros-tapahtumaa (4 s ja 8 s)');
A.strictEqual(E(P6).val(J6.b.id,'r'),true,'toistuva jana jatkuu');
A.ok(Math.abs(v(P6,J6.b.id)-1)<1e-6,'9 s = kohta 1');
var lap=KK.janaSpec(P6,J6.b.id,C);A.strictEqual(lap.kier,'toista');
// edestakaisin: menossa 0→4 eteen, paluu 4→0 taaksepäin (molemmat)
var P7=KK.newProject('j7');var J7=jana(P7,{b:4,kierros:'edestakaisin',suunta:'molemmat'});var f3=mark(P7,J7,'kolme',3);KK.repair(P7);var W7=watch(P7,[f3]);
at(new Date(2026,9,17,17,0,0).getTime());KK.janaStart(P7,J7.b.id,C,0);var h7=[];for(var t7=0;t7<70;t7++){step(P7,100);h7=h7.concat(W7());}
A.deepStrictEqual(h7,['kolme@103','kolme@-97']);A.ok(Math.abs(v(P7,J7.b.id)-1)<1e-6,'7 s edestakaisin = kohta 1');

// 8. Aseta arvo ja Lisää janaan: siirto laukaisee väliin jääneet, ilman laukaisua ei
var P8=KK.newProject('j8');var J8=jana(P8,{kulku:'arvo'});var g3=mark(P8,J8,'kolme',3),g6=mark(P8,J8,'kuusi',6);
var T8=blk(P8,'tee',{do:'aseta',o:J8.b.id,v:'7'},-600,500);var L8=blk(P8,'tee',{do:'lisaa',o:J8.b.id,v:'-5'},-600,600);KK.repair(P8);var W8=watch(P8,[g3,g6]);
KK.runAction(P8,T8.b.id,C,0);A.deepStrictEqual(W8(),['kolme@103','kuusi@106'],'0 → 7 laukaisee 3 ja 6');
KK.runAction(P8,L8.b.id,C,0);A.strictEqual(v(P8,J8.b.id),2);A.deepStrictEqual(W8().sort(),['kolme@-97','kuusi@-94']);
T8.b.hil=true;KK.runAction(P8,T8.b.id,C,0);A.deepStrictEqual(W8(),[],'ilman laukaisua');A.strictEqual(v(P8,J8.b.id),7);
// aikajanalla Aseta siirtää kohtaa
var P9=KK.newProject('j9');var J9=jana(P9);var h4=mark(P9,J9,'nelja',4);var T9=blk(P9,'tee',{do:'aseta',o:J9.b.id,v:'5'},-600,500);KK.repair(P9);var W9=watch(P9,[h4]);
KK.runAction(P9,T9.b.id,C,0);A.strictEqual(v(P9,J9.b.id),5);A.deepStrictEqual(W9(),['nelja@104']);

// 9. Jana käynnistää toisen janan, ketju odottaa janan valmistumista, Käynnistä/Pysäytä kelpaa janalle
var PA=KK.newProject('ja');var JA=jana(PA,{b:2},'Eka'),JB=jana(PA,{b:3},'Toka');JB.n.x=0;JB.n.y=400;
var st1=blk(PA,'tee',{do:'kaynnista',o:JB.b.id},0,0,JA.n.id);st1.n.jk=1;var k1=mark(PA,JB,'tokanKaksi',2);
var KT=blk(PA,'ketju',{},0,800);var KS=blk(PA,'tee',{do:'kaynnista',o:JA.b.id,odota:true},0,850,KT.n.id);var KM=blk(PA,'muisti',{v:'0'},-900,900);var KE=blk(PA,'tee',{do:'aseta',o:KM.b.id,v:'valmis'},0,950,KT.n.id);
KK.addLink(PA,KS.n.id,'e',KE.n.id,'e');KK.repair(PA);
A.ok(!KK.chainIssues(PA,KT.b.id,C).some(function(x){return /ei ole ketju/.test(x.t);}));
at(new Date(2026,9,17,18,0,0).getTime());KK.chainStart(PA,KT.b.id,C,null,0);
A.strictEqual(E(PA).val(JA.b.id,'r'),true,'ketju käynnisti janan');A.strictEqual(PA.st[KM.b.id],undefined,'ketju odottaa');
step(PA,1100);A.strictEqual(E(PA).val(JB.b.id,'r'),true,'jana käynnisti toisen janan kohdassa 1');
step(PA,1000);KK.chainPoll(PA,C);A.strictEqual(E(PA).val(JA.b.id,'r'),false);A.strictEqual(PA.st[KM.b.id],'valmis','ketju jatkui janan valmistuttua');
step(PA,1100);A.strictEqual(PA.st[k1.m.b.id],102,'toisen janan merkki');
var PS=blk(PA,'tee',{do:'pysayta',o:JB.b.id},-600,1200);KK.janaStart(PA,JB.b.id,C,0);KK.runAction(PA,PS.b.id,C,0);A.strictEqual(E(PA).val(JB.b.id,'r'),false);

// 10. Pois käytöstä oleva jana ei käynnisty; alku = loppu on virhe huomautuksessa
var PB=KK.newProject('jb');var JC=jana(PB,{off:true});KK.repair(PB);A.ok(!KK.janaStart(PB,JC.b.id,C,0));
JC.b.off=false;JC.b.b=0;A.ok(!KK.janaStart(PB,JC.b.id,C,0));A.ok(KK.janaIssues(PB,JC.b.id,C).some(function(x){return /samat/.test(x.t);}));

// 11. Tallennus: kohta solmussa, siivous ja vanha projekti ennallaan
var PC=KK.newProject('jc');var JD=jana(PC);var mm=mark(PC,JD,'m',3.5);var outside=blk(PC,'tee',{do:'aseta'},800,0);outside.n.jk=4;
var notMark=blk(PC,'arvo',{v:'1'},0,0,JD.n.id);notMark.n.jk=2;var jj=blk(PC,'jana',{},0,0,JD.n.id);
JD.b.kulku='outo';JD.b.hyppy='x';JD.b.kierros=5;PC.st[JD.b.id]='roska';
KK.repair(PC);
A.strictEqual(mm.n.jk,3.5);A.strictEqual(outside.n.jk,undefined,'janan ulkopuolella ei kohtaa');A.strictEqual(notMark.n.jk,undefined,'vain Toiminto tai efekti on merkki');
A.strictEqual(jj.n.g,'','jana ei ole toisen janan sisällä');
A.strictEqual(JD.b.kulku,'aika');A.strictEqual(JD.b.hyppy,'kaikki');A.strictEqual(JD.b.kierros,'kerta');A.strictEqual(PC.st[JD.b.id],undefined);
var PCc=KK.repair(JSON.parse(JSON.stringify(PC)));A.strictEqual(KK.nodeOf(PCc,mm.n.id).jk,3.5,'kohta tallentuu');
// kopio ja liittäminen säilyttävät kohdan
var clip=KK.copyNodes(PC,[JD.n.id]);var ids=KK.pasteNodes(PC,clip,40,40);A.ok(ids.some(function(id){return KK.nodeOf(PC,id).jk===3.5;}),'liitetty merkki säilyttää kohdan');
// vanha projekti ilman janaa avautuu ja tallentuu muuttumattomana
var old=require('fs').readFileSync(__dirname+'/vanha_v5_esimerkki.json','utf8');
var R1=KK.repairData(JSON.parse(old)),s1=JSON.stringify(R1),R2=KK.repairData(JSON.parse(s1));A.strictEqual(JSON.stringify(R2),s1,'vanha projekti vakaa');
A.ok(!/"jana"/.test(s1));

// Miksi?: Toiminto- ja efektimerkki kertovat janasta, efekti myös oman selityksensä
P=KK.newProject('miksi');J=jana(P,{},'Aamu');var txt=blk(P,'teksti',{tx:'Hei'},0,0);
var fx=blk(P,'ilmesty',{o:txt.b.id,tx:'Moi'},0,0,J.n.id);fx.n.jk=3;var tm=mark(P,J,'Eka',2);KK.repair(P);
var wf=KK.why(P,E(P),fx.b.id,1).txt;A.ok(/Teksti ilmestyy/.test(wf)&&/Janan ”Aamu” merkki kohdassa 3/.test(wf),wf);
A.ok(/Janan ”Aamu” merkki kohdassa 2/.test(KK.why(P,E(P),tm.b.id,1).txt));
var fx2=blk(P,'ilmesty',{},0,0);A.ok(/Valitse palikka/.test(KK.why(P,E(P),fx2.b.id,1).txt),'efekti janan ulkopuolella ennallaan');

console.log('logiikka_72_jana ok');
