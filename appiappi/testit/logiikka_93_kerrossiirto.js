// Jonon 17b: napautus ja pudotus hitaassa kerroksessa. Moottorin KK.rvMuunnos on sama muunnos, jolla käyttöliittymä piirtää
// rullausvauhdin (parallaksin) ja lukitun kerroksen; Alueen ja Liikkeen napautus sekä käyttöraahauksen pudotus muuntavat sormen
// kohdan sillä palikan kerrokseen. Ilman näkymän kameraa (nk) kaikki ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var C={now:function(){return new Date(3000000);},toast:function(){},nav:function(){}};
function N(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
function E(P){return KK.Ev(P,C);}
function U(P,k,o,x,y,w,h,nm){o=o||{};o.v=P.views[0].id;var b=KK.addBlock(P,k,o);b.x=x;b.y=y;b.w=w;b.h=h;if(nm)KK.setName(P,b.id,nm);return b;}
function laskuri(P,b,port){var m=KK.addBlock(P,'muisti',{v:'0'});N(P,m);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function kirjaa(P,b,port,f){var m=KK.addBlock(P,'muisti',{v:''});N(P,m);var k=KK.addBlock(P,'kaava');N(P,k);k.f=KK.kaavaToIds(P,f);
  var t=KK.addBlock(P,'tee',{do:'aseta',o:m.id,v:{r:k.id}});KK.addLink(P,N(P,b).id,port,N(P,t).id,'e');return m;}
function near(a,b,m){A.ok(Math.abs(a-b)<1e-9,(m||'')+' '+a+' ≠ '+b);}

// 1. Muunnos: ei kameraa tai täysi vauhti = ei siirtoa; rv 50 siirtää puolet kameran liikkeestä; lukittu kerros zoomattuna
var nk={x:-200,y:-100,z:1,zf:1,w:390,h:844};
A.deepStrictEqual(KK.rvMuunnos(50,null),{s:1,x:0,y:0});A.deepStrictEqual(KK.rvMuunnos(100,nk),{s:1,x:0,y:0});
var m=KK.rvMuunnos(50,nk);near(m.s,1);near(m.x,100);near(m.y,50);
m=KK.rvMuunnos(0,nk);near(m.x,200,'lukittu ilman zoomia pysyy ruudussa');near(m.y,100);
var nz={x:-40,y:-20,z:2,zf:2,w:400,h:800};m=KK.rvMuunnos(0,nz);near(m.s,0.5,'lukittu zoomattuna ei kasva');near(m.x,20);near(m.y,10);
m=KK.rvMuunnos(50,nz);near(m.s,1);near(m.x,(20+100-200)*0.5,'zoomattuna ruudun keskeltä');

// 2. Alue hitaassa kerroksessa: napautus osuu siihen, missä Alue näkyy
var P=KK.newProject('ks');P.views[0].kr=[{id:'k1',n:'Tausta',rv:50},{id:'pohja',n:'Pohja'},{id:'k2',n:'Palkki',rv:0}];
var tp=KK.addBlock(P,'tapaht',{nm:'Tapahtuma'});N(P,tp);
var al=U(P,'alue',{kr:'k1'},0,0,100,100,'Hidas');var cA=laskuri(P,al,'nap');KK.repair(P);
var mx=kirjaa(P,al,'nap','tapahtuma.x');KK.repair(P);
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,150,50,C,nk),[al.id],'osuu näkyvään kohtaan (100–200)');
A.strictEqual(E(P).val(cA.id),1);A.strictEqual(E(P).val(mx.id),50,'tapahtuma.x alueen kulmasta näkyvässä paikassa');
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,50,50,C,nk),[],'siirtämätön paikka ei enää osu');
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,50,50,C),[al.id],'ilman kameraa ennallaan');
// ohjattu rullausvauhti voittaa, kuten piirrossa
al.kr='';al.rv=100;KK.repair(P);A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,50,50,C,nk),[al.id],'täysi vauhti: ei siirtoa');al.kr='k1';delete al.rv;KK.repair(P);
// lukittu kerros zoomattuna
var lk=U(P,'alue',{kr:'k2'},10,10,40,40,'Lukittu');KK.repair(P);
A.deepStrictEqual(KK.alueNapautus(P,P.views[0].id,20+15,10+15,C,nz),[lk.id],'lukittu zoomattuna: (35,25) → kerroksessa (30,30)');

// 3. Liike napautukseen: kohde hitaassa kerroksessa menee sinne, mihin napautettiin
var h=U(P,'muoto',{kr:'k1'},0,300,20,20,'Hahmo'),li=KK.addBlock(P,'liike',{o:h.id,ohj:'napautus',vm:1000});N(P,li);KK.repair(P);
A.strictEqual(KK.liikeNapautus(P,P.views[0].id,300,200,C,nk),1);var st=P.st[li.id];near(st.tx,200);near(st.ty,150);
KK.liikeNapautus(P,P.views[0].id,300,200,C);st=P.st[li.id];near(st.tx,300,'ilman kameraa ennallaan');near(st.ty,200);
// kerroksen ruudukko: ruutu lasketaan kerroksen koordinaateista
P.views[0].kr[0].rk=40;KK.repair(P);KK.liikeNapautus(P,P.views[0].id,305,205,C,nk);st=P.st[li.id];near(st.tx,220,'ruudun keskelle kerroksessa');near(st.ty,140);delete P.views[0].kr[0].rk;KK.repair(P);

// 4. Käyttöraahaus: palikka täydellä vauhdilla, Alue hitaassa kerroksessa
var r=U(P,'muoto',{},500,500,20,20,'Kortti');r.raah=true;r.rpa='alue';KK.repair(P);
var o=KK.raahausPaikka(P,r,130,80,C,nk);A.ok(o.ok&&o.alue&&o.alue.id===al.id,'pudotus näkyvään Alueeseen');
o=KK.raahausPaikka(P,r,130,80,C);A.ok(!o.ok,'ilman kameraa ennallaan (Alue 0–100)');
var ks=KK.raahausKohteet(P,r,C,nk).filter(function(q){return q.id===al.id;})[0];near(ks.x,100,'korostus näkyvässä paikassa');near(ks.y,50);near(ks.w,100);
ks=KK.raahausKohteet(P,r,C,nz).filter(function(q){return q.id===lk.id;})[0];near(ks.x,25);near(ks.w,20,'lukitun korostus pienenee kuten piirto');
o=KK.raahausPudotus(P,r.id,130,80,C,nk);A.ok(o.ok);near(E(P).omiNum(r.id,'x',0),130,'paikka palikan omassa kerroksessa');
console.log('ok logiikka_93_kerrossiirto');
