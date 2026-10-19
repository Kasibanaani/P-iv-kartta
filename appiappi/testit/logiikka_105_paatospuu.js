// Jonon 36 (F44, suunnitelma 28): päätöspuu. Ikkunan tapa puu, siirtymät b.pus (kylkeen, myös ↔ ja silmukka), näkyvyys
// käytössä (alussa jäsenet ilman tulevaa siirtymää, sitten nykyisen seuraajat, lopussa nykyinen), oma näkyy kun lisäksi,
// vaihe, polku, askelia, tapahtumat valittu ja loppu, alkuun ja takaisin, napautettava Muoto, sisempi VAIN YKSI -ikkuna
// (itse eteenpäin), VÄHINTÄÄN-ikkuna Valmis-painikkeella (harmaana kunnes pätee, ei sisältöä), ikkunan sisältö joukosta
// (näkyy ja lasketaan, VAIN YKSI poistaa muut), Alueen asettelu Allekkain ja Ruudukko (piilossa olevat eivät vie tilaa),
// tallennus ja vanhan projektin avaus, kopio ja liitos.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(2026,9,19,12,0,0);},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function blk(P,k,props,g,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g||'');return {b:b,n:n};}
function vis(P,b){return E(P).visible(b.b.id);}
function tap(P,b){KK.press(P,b.b.id,C);}
function sy(w,a,c,kk){(w.b.pus=w.b.pus||[]).push(kk?{f:a.n.id,t:c.n.id,kk:true}:{f:a.n.id,t:c.n.id});}

var P=KK.newProject('puu'),vw=P.views[0].id;
var W=blk(P,'ikkuna',{m:'puu'});KK.setName(P,W.b.id,'Puu');
function nap(tx){var r=blk(P,'nappi',{v:vw,tx:tx,beh:'kerta'},W.n.id);KK.setName(P,r.b.id,tx);return r;}
var a=nap('A'),b=nap('B'),c=nap('C'),d=nap('D');
var irti=blk(P,'nappi',{v:vw,tx:'Irti'});
sy(W,a,b);sy(W,a,c);sy(W,c,d);sy(W,d,a); // D palaa alkuun: silmukka
KK.repair(P);
A.strictEqual(KK.WM.puu,'PÄÄTÖSPUU');A.ok(KK.isPuu(W.b));
var pr=KK.ports(W.b);A.deepStrictEqual(pr.ins.map(function(p){return p.p;}),['al','tk']);A.deepStrictEqual(pr.outs.map(function(p){return p.p;}),['v','pl','va','lo']);
// Silmukka: kaikkiin tulee siirtymä, joten alussa ensimmäinen jäsen
A.deepStrictEqual(KK.puuNakyvat(P,W.b.id),[a.n.id]);
A.ok(vis(P,a)&&!vis(P,b)&&!vis(P,c)&&!vis(P,d),'alussa vain A');A.ok(vis(P,irti),'puun ulkopuolinen ei muutu');
A.strictEqual(E(P).val(W.b.id),'','alussa vaihe tyhjä');
// Tapahtumat valittu ja loppu Muistiin laskuriksi
var M=blk(P,'muisti',{v:0}),Lo=blk(P,'muisti',{v:0});
var t1=blk(P,'tee',{do:'lisaa',o:M.b.id}),t2=blk(P,'tee',{do:'lisaa',o:Lo.b.id});
A.ok(KK.addLink(P,W.n.id,'va',t1.n.id,'e'));A.ok(KK.addLink(P,W.n.id,'lo',t2.n.id,'e'));KK.repair(P);
tap(P,a);A.ok(!vis(P,a)&&vis(P,b)&&vis(P,c)&&!vis(P,d),'A → B ja C');
A.strictEqual(E(P).val(W.b.id),'A');A.strictEqual(E(P).val(M.b.id),1,'valittu lähti');
tap(P,d);A.strictEqual(E(P).val(W.b.id),'A','piilossa oleva ei vie');A.strictEqual(E(P).val(M.b.id),1);
tap(P,c);A.ok(vis(P,d)&&!vis(P,b),'C → D');
tap(P,d);A.ok(vis(P,a)&&!vis(P,d),'D → A (silmukka)');
A.strictEqual(E(P).val(W.b.id,'pl'),'A › C › D');A.strictEqual(E(P).prop(W.b.id,'askelia'),3);
tap(P,a);tap(P,b);A.ok(vis(P,b)&&!vis(P,c),'lopussa nykyinen näkyy');A.strictEqual(E(P).val(Lo.b.id),1,'loppu lähti');
// Takaisin ja alkuun
KK.puuKomento(P,W.b.id,'tk');A.ok(vis(P,b)&&vis(P,c),'takaisin: A:n seuraajat');
var x1=blk(P,'tee',{do:'aseta'});var nb=blk(P,'nappi',{v:vw,tx:'Alkuun',beh:'kerta'});A.ok(KK.addLink(P,nb.n.id,'e',W.n.id,'al'));KK.repair(P);
tap(P,nb);A.ok(vis(P,a)&&!vis(P,b),'nuoli kohtaan alkuun');A.strictEqual(E(P).prop(W.b.id,'askelia'),0);
// Molempiin suuntiin: A ↔ B
W.b.pus[0].kk=true;KK.repair(P);A.ok(W.b.pus[0].kk===true);
tap(P,a);tap(P,b);A.ok(vis(P,a),'B → A (↔)');
// Oma näkyy kun pätee lisäksi
KK.puuKomento(P,W.b.id,'al');var hide=blk(P,'muisti',{v:false});A.ok(KK.addLink(P,hide.n.id,'v',a.n.id,'nk'));KK.repair(P);
A.ok(!vis(P,a),'oma näkyy kun ei päde');P.lg.l=P.lg.l.filter(function(l){return l.f!==hide.n.id;});KK.repair(P);A.ok(vis(P,a));
// Pois päältä: ei vie
W.b.off=true;tap(P,a);A.ok(vis(P,a)&&!vis(P,b),'pois päältä');delete W.b.off;
// Napautettava Muoto jäsenenä
KK.puuKomento(P,W.b.id,'al');
var mu=blk(P,'muoto',{v:vw,tx:'Muoto',nap:true},W.n.id);sy(W,a,mu);KK.repair(P);
tap(P,a);A.ok(vis(P,mu),'muoto näkyy');KK.napautus(P,mu.b.id,C,1,1);A.strictEqual(E(P).val(W.b.id),'Muoto','napautus vie');

// Sisempi VAIN YKSI -ikkuna: kysymys ja vaihtoehdot, itse eteenpäin
var P2=KK.newProject('kysymys'),v2=P2.views[0].id;
var T=blk(P2,'ikkuna',{m:'puu'});
var s=blk(P2,'nappi',{v:v2,tx:'Aloita',beh:'kerta'},T.n.id);
var Q=blk(P2,'ikkuna',{m:'one',pakota:true},T.n.id);KK.setName(P2,Q.b.id,'Hedelmä');
var qt=blk(P2,'nayta',{v:v2,tx:'Mikä hedelmä?'},Q.n.id),o1=blk(P2,'ruutu',{v:v2,tx:'Omena'},Q.n.id),o2=blk(P2,'ruutu',{v:v2,tx:'Päärynä'},Q.n.id);
var lop=blk(P2,'nayta',{v:v2,tx:'Kiitos'},T.n.id);
sy(T,s,Q);sy(T,Q,lop);KK.repair(P2);
A.ok(vis(P2,s)&&!vis(P2,qt)&&!vis(P2,o1),'alussa Aloita');
tap(P2,s);KK.tick(P2,C);A.ok(vis(P2,qt)&&vis(P2,o1)&&vis(P2,o2)&&!vis(P2,s),'ikkuna näkyy kokonaan');
KK.userSet(P2,o2.b.id,true,C);A.ok(vis(P2,lop)&&!vis(P2,o1),'valinta vie eteenpäin itse');
A.strictEqual(E(P2).val(T.b.id),'Päärynä','vaihe = valittu vaihtoehto');A.strictEqual(E(P2).val(T.b.id,'pl'),'Aloita › Päärynä');

// VÄHINTÄÄN 2 + Valmis
var P3=KK.newProject('valmis'),v3=P3.views[0].id;
var T3=blk(P3,'ikkuna',{m:'puu'}),Q3=blk(P3,'ikkuna',{m:'min',n:2},T3.n.id);
var r1=blk(P3,'ruutu',{v:v3,tx:'Yksi'},Q3.n.id),r2=blk(P3,'ruutu',{v:v3,tx:'Kaksi'},Q3.n.id),r3=blk(P3,'ruutu',{v:v3,tx:'Kolme'},Q3.n.id);
var ok=blk(P3,'nappi',{v:v3,tx:'Valmis',beh:'kerta'},Q3.n.id),lo3=blk(P3,'nayta',{v:v3,tx:'Loppu'},T3.n.id);
sy(T3,Q3,lo3);KK.repair(P3);
A.ok(KK.puuValmisW(P3,ok.n)&&KK.puuValmisW(P3,ok.n).id===Q3.n.id,'Valmis tunnistetaan');
A.strictEqual(E(P3).members(Q3.b.id).length,3,'Valmis ei ole sisältöä');
A.ok(vis(P3,ok)&&E(P3).greyed(ok.b.id),'Valmis harmaana');
KK.userSet(P3,r1.b.id,true,C);KK.userSet(P3,r3.b.id,true,C);A.ok(!vis(P3,lo3),'VÄHINTÄÄN ei vie itse');A.ok(!E(P3).greyed(ok.b.id));
tap(P3,ok);A.ok(vis(P3,lo3)&&!vis(P3,r1),'Valmis vie');A.strictEqual(E(P3).val(T3.b.id),'Yksi, Kolme');

// Ikkunan sisältö joukosta
var P4=KK.newProject('joukko'),v4=P4.views[0].id;
var j1=blk(P4,'ruutu',{v:v4,tx:'Kissa'}),j2=blk(P4,'ruutu',{v:v4,tx:'Koira'}),j3=blk(P4,'ruutu',{v:v4,tx:'Kala'});
KK.repair(P4);[j1,j2].forEach(function(x){A.strictEqual(KK.setTunnus(P4,x.b.id,'#elaimet'),'');});var JJ=KK.jkFind(P4,'elaimet');
var T4=blk(P4,'ikkuna',{m:'puu'}),Q4=blk(P4,'ikkuna',{m:'one',pakota:true,sj:JJ},T4.n.id);
var ext=blk(P4,'ruutu',{v:v4,tx:'Muu'},Q4.n.id),st4=blk(P4,'nappi',{v:v4,tx:'Eläin?',beh:'kerta'},T4.n.id),lo4=blk(P4,'nayta',{v:v4,tx:'Selvä'},T4.n.id);
sy(T4,st4,Q4);sy(T4,Q4,lo4);KK.repair(P4);A.strictEqual(Q4.b.sj,JJ);
A.strictEqual(E(P4).members(Q4.b.id).length,3,'joukosta 2 + vedetty 1');
A.ok(!vis(P4,j1)&&!vis(P4,j2)&&vis(P4,j3),'joukon jäsenet piilossa ennen ikkunaa, muu ennallaan');
tap(P4,st4);A.ok(vis(P4,j1)&&vis(P4,j2)&&vis(P4,ext),'joukko näkyy ikkunassa');
KK.userSet(P4,j1.b.id,true,C);A.ok(vis(P4,lo4),'joukon jäsen valitsee');
KK.puuKomento(P4,T4.b.id,'tk');KK.setVal(P4,ext.b.id,true,C);KK.press;KK.userSet(P4,j2.b.id,true,C);
A.strictEqual(E(P4).val(j1.b.id),false,'VAIN YKSI poistaa joukon muut');A.strictEqual(E(P4).val(ext.b.id),false,'ja vedetyt');
var P5=KK.newProject('ei puuta'),v5=P5.views[0].id,w5=blk(P5,'ikkuna',{m:'and',sj:JJ});KK.repair(P5);A.strictEqual(E(P5).members(w5.b.id).length,0,'tuntematon joukko: ei sisältöä');

// Alueen asettelu
var P6=KK.newProject('asettelu'),v6=P6.views[0].id;
var al=blk(P6,'alue',{v:v6,x:0,y:0,w:300,h:400,as:'pino'});
var p1=blk(P6,'nappi',{v:v6,x:40,y:200,w:100,h:40}),p2=blk(P6,'nappi',{v:v6,x:20,y:20,w:120,h:30}),p3=blk(P6,'nappi',{v:v6,x:100,y:300,w:80,h:50});
var ulko=blk(P6,'nappi',{v:v6,x:500,y:20,w:80,h:40});
var hm=blk(P6,'muisti',{v:false});KK.repair(P6);
function R(x){return KK.rectNow(P6,E(P6),x.b);}
A.deepStrictEqual(R(p2),{x:8,y:8,w:120,h:30},'ylin ensin');A.deepStrictEqual(R(p1),{x:8,y:46,w:100,h:40});A.deepStrictEqual(R(p3),{x:8,y:94,w:80,h:50});
A.deepStrictEqual(R(ulko),{x:500,y:20,w:80,h:40},'ulkopuolinen ennallaan');
A.ok(KK.addLink(P6,hm.n.id,'v',p1.n.id,'nk'));KK.repair(P6);A.deepStrictEqual(R(p3),{x:8,y:46,w:80,h:50},'piilossa ei vie tilaa');
al.b.asl='sovita';al.b.asv=10;KK.repair(P6);A.deepStrictEqual(R(p2),{x:10,y:10,w:280,h:30},'Alueen levyinen');
al.b.as='ruudukko';delete al.b.asl;KK.repair(P6);
A.deepStrictEqual(R(p2),{x:10,y:10,w:120,h:30});A.deepStrictEqual(R(p3),{x:140,y:10,w:80,h:50},'vierekkäin');
p3.b.w=200;A.deepStrictEqual(R(p3),{x:10,y:50,w:200,h:50},'rivittyy');
al.b.as='kummallinen';al.b.asv=-3;KK.repair(P6);A.ok(al.b.as===undefined&&al.b.asv===undefined,'roskat pois');A.deepStrictEqual(R(p2),{x:20,y:20,w:120,h:30});

// Tallennus, roskat ja vanha projekti
var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.deepStrictEqual(J.b[W.b.id].pus,W.b.pus,'siirtymät säilyvät');
J.b[W.b.id].pus.push({f:'eiole',t:a.n.id},{f:a.n.id,t:a.n.id},null,{f:a.n.id,t:b.n.id,kk:'x'});J.b[W.b.id].sj=5;KK.repair(J);
A.strictEqual(J.b[W.b.id].pus.length,W.b.pus.length,'roskat ja kaksoiskappale pois');A.strictEqual(J.b[W.b.id].sj,undefined);
var V=KK.newProject('vanha');var vi=blk(V,'ikkuna',{m:'and'});KK.repair(V);A.strictEqual(vi.b.pus,undefined);A.strictEqual(vi.b.sj,undefined);
J.st['puu:'+W.b.id]='rikki';A.deepStrictEqual(KK.puuNakyvat(J,W.b.id),[a.n.id],'rikkinäinen tila = alussa');
// Kopio ja liitos: siirtymät uusiin solmuihin
var clip=KK.copyNodes(P,[W.n.id]);var made=KK.pasteNodes(P,clip,0,600);var nw=null;made.forEach(function(id){var n=KK.nodeOf(P,id);if(P.b[n.p].k==='ikkuna'&&P.b[n.p].m==='puu')nw=P.b[n.p];});
A.ok(nw&&nw.id!==W.b.id&&nw.pus.length===W.b.pus.length,'kopion siirtymät');nw.pus.forEach(function(e){A.ok(made.indexOf(e.f)>=0&&made.indexOf(e.t)>=0,'uusiin solmuihin');});
console.log('ok logiikka_105_paatospuu');
