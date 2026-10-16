// Versio 6.6: viilaus. Huomautukset ennen ajoa (tyhjä, ei käynnistäjää, pois päältä, kehä, kehä ilman ajastinta,
// puuttuva tai väärä kohde, virheellinen kesto, pois käytöstä, tulossa), ikuisen silmukan esto (kehä ilman ajastinta,
// ketjut käynnistävät toisiaan, ketju käynnistää itsensä alusta, tick-silmukka), ja ajastimelliset kehät sallitaan.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,9,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function texts(P,k){return KK.chainIssues(P,k.id,C).map(function(x){return (x.info?'i ':'! ')+x.t;});}
var P=KK.newProject('v');var k=KK.addBlock(P,'ketju',{nm:'K'}),w=KK.addNode(P,k.id,0,0);
var t=texts(P,k);A.ok(/tyhjä/.test(t[0])&&t[0][0]==='i');
var lu=KK.addBlock(P,'luku',{nm:'Luku'});
var s1=KK.addBlock(P,'tee',{do:'aseta',nm:'Eka'}),s2=KK.addBlock(P,'tee',{do:'tila',o:lu.id,nm:'Toka'}),tm=KK.addBlock(P,'ajastin',{kesto:0,nm:'Odota'});
var n1=KK.addNode(P,s1.id,0,40,w.id),n2=KK.addNode(P,s2.id,0,100,w.id),nt=KK.addNode(P,tm.id,0,160,w.id);KK.addLink(P,n1.id,'e',n2.id,'e');KK.addLink(P,n2.id,'e',nt.id,'e');
t=texts(P,k).join('\n');
A.ok(/i Mikään ei vielä käynnistä/.test(t));A.ok(/! ”Eka”: valitse kohde/.test(t));A.ok(/! ”Toka”: kohde ”Luku” ei ole valittava/.test(t));A.ok(/! ”Odota”: kesto on nolla/.test(t));
var b=KK.addBlock(P,'nappi',{beh:'kerta'}),nb=KK.addNode(P,b.id,-300,0);KK.addLink(P,nb.id,'e',w.id,'e');
t=texts(P,k).join('\n');A.ok(!/Mikään ei vielä käynnistä/.test(t),'käynnistäjä löytyi');
s1.off=true;k.off=true;t=texts(P,k).join('\n');A.ok(/i ”Eka” on pois käytöstä/.test(t));A.ok(/i Ketju on pois päältä/.test(t));s1.off=false;k.off=false;
// kehä ilman ajastinta löytyy ennen ajoa, ajastimen kautta kulkeva kehä on kunnossa
var P2=KK.newProject('kehä');var k2=KK.addBlock(P2,'ketju'),w2=KK.addNode(P2,k2.id,0,0);
function S(P,w,nm,y,k){var b=KK.addBlock(P,k||'tee',k?{nm:nm}:{do:'ilmoita',tx:nm,nm:nm});return KK.addNode(P,b.id,0,y,w.id);}
var a=S(P2,w2,'A',40),bb=S(P2,w2,'B',100),c=S(P2,w2,'C',160);KK.addLink(P2,a.id,'e',bb.id,'e');KK.addLink(P2,bb.id,'e',c.id,'e');KK.addLink(P2,c.id,'e',bb.id,'e');
t=texts(P2,k2).join('\n');A.ok(/! Kehä ilman ajastinta: B → C → B/.test(t),t);
KK.chainStart(P2,k2.id,C);A.strictEqual(P2.st[k2.id].run,false);A.ok(/kehää ilman ajastinta/.test(P2.st[k2.id].err));
var P3=KK.newProject('kehä ok');var k3=KK.addBlock(P3,'ketju'),w3=KK.addNode(P3,k3.id,0,0);var x=S(P3,w3,'X',40),tt=S(P3,w3,'T',100,'ajastin');KK.addLink(P3,x.id,'e',tt.id,'e');KK.addLink(P3,tt.id,'e',x.id,'e');
t=texts(P3,k3).join('\n');A.ok(!/Kehä ilman/.test(t));A.ok(/i Ketju on kehä/.test(t));
KK.chainStart(P3,k3.id,C);A.strictEqual(P3.st[k3.id].run,true,'toistuva ketju ajastimella on sallittu');
// efektin kohde puuttuu (ennen Appi-appi 9: tulossa-tieto)
var P4=KK.newProject('fx');var k4=KK.addBlock(P4,'ketju'),w4=KK.addNode(P4,k4.id,0,0);S(P4,w4,'Liike',40,'anim');A.ok(/”Liike”: valitse palikka, jolle efekti tehdään/.test(texts(P4,k4).join('\n')),'Appi-appi 9: efektin kohde puuttuu');
// kaksi ketjua käynnistävät toisensa heti (valmis → käynnistä): ei jää jumiin
var P5=KK.newProject('pingis');var ka=KK.addBlock(P5,'ketju'),wa=KK.addNode(P5,ka.id,0,0),kb=KK.addBlock(P5,'ketju'),wb=KK.addNode(P5,kb.id,500,0);
var cnt=KK.addBlock(P5,'muisti',{v:'0'});KK.addNode(P5,cnt.id,0,600);
[wa,wb].forEach(function(ww){var s=KK.addBlock(P5,'tee',{do:'lisaa',o:cnt.id});KK.addNode(P5,s.id,ww.x+10,40,ww.id);});
KK.addLink(P5,wa.id,'e',wb.id,'e');KK.addLink(P5,wb.id,'e',wa.id,'e');
KK.chainStart(P5,ka.id,C);var v=KK.Ev(P5,C).val(cnt.id);A.ok(v>=2&&v<=4,'pysähtyy: '+v);A.ok(!KK.anyChainRunning(P5));
// ketju käynnistää itsensä alusta omasta tapahtumastaan: ei ikuista kierrettä
var P6=KK.newProject('itse');var k6=KK.addBlock(P6,'ketju',{uusi:'alusta'}),w6=KK.addNode(P6,k6.id,0,0);var c6=KK.addBlock(P6,'muisti',{v:'0'});KK.addNode(P6,c6.id,0,600);
var i1=KK.addBlock(P6,'tee',{do:'lisaa',o:c6.id});var ni1=KK.addNode(P6,i1.id,10,40,w6.id);var out=KK.addBlock(P6,'tee',{do:'aseta',o:c6.id,v:{r:c6.id}}),no=KK.addNode(P6,out.id,300,40);
KK.addLink(P6,ni1.id,'e',w6.id,'e');KK.chainStart(P6,k6.id,C);A.strictEqual(KK.Ev(P6,C).val(c6.id),1,'oma käynnistys kesken ajon ohitetaan');
// tick-silmukka: ketju vaihtaa ruudun, ruutu käynnistää ketjun → pysyy rajoissa
var P7=KK.newProject('tick');var k7=KK.addBlock(P7,'ketju'),w7=KK.addNode(P7,k7.id,0,0);var r7=KK.addBlock(P7,'ruutu');var nr=KK.addNode(P7,r7.id,-300,0);
var v7=KK.addBlock(P7,'tee',{do:'vaihda',o:r7.id});KK.addNode(P7,v7.id,10,40,w7.id);KK.addLink(P7,nr.id,'v',w7.id,'e');KK.tick(P7,C);
KK.userSet(P7,r7.id,true,C);A.ok(P7.st[k7.id].n<=13,'kierroksia rajallisesti: '+P7.st[k7.id].n);
// valtava haarautuminen pysäytetään hätäjarrulla, ei kaadu
var P8=KK.newProject('haarat');var k8=KK.addBlock(P8,'ketju'),w8=KK.addNode(P8,k8.id,0,0);var prev=[S(P8,w8,'0',0)];
for(var lv=1;lv<=12;lv++){var nx=[S(P8,w8,'a'+lv,lv*60),S(P8,w8,'b'+lv,lv*60)];prev.forEach(function(p){nx.forEach(function(q){KK.addLink(P8,p.id,'e',q.id,'e');});});prev=nx;}
KK.chainStart(P8,k8.id,C);A.strictEqual(P8.st[k8.id].run,false);A.ok(/yli/.test(P8.st[k8.id].err),P8.st[k8.id].err);
console.log('logiikka_15_viilaus ok');
