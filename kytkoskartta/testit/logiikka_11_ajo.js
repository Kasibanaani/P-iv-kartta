// Versio 6.2: ketju käynnistyy ja etenee. Käynnistys tapahtumasta (painike) ja tuloksesta (arvo alkaa päteä),
// eteneminen palikka kerrallaan viivoja pitkin, haarat rinnakkain, valmis-tapahtuma, uudelleenkäynnistys (ohita / alusta),
// pysäytys, nuoli ulkoa ketjun keskelle, pois käytöstä oleva tapahtuma ohitetaan, ulos lähtevät viivat ja vanha logiikka ennallaan.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,15,9,0);var toasts=[];var C={now:function(){return T;},toast:function(t){toasts.push(t);},nav:function(){}};
var P=KK.newProject('ajo');
var k=KK.addBlock(P,'ketju',{nm:'Aamu'}),wn=KK.addNode(P,k.id,0,0);
var lst=KK.addBlock(P,'lista'),btn=KK.addBlock(P,'nappi',{beh:'kerta'}),nb=KK.addNode(P,btn.id,-300,0);
function step(tx,y,x){var s=KK.addBlock(P,'tee',{do:'rivi',o:lst.id,tx:tx});var n=KK.addNode(P,s.id,x||20,y,wn.id);return n;}
function rows(){return KK.listRows(P,lst.id).map(function(r){return r.tx;});}
var a=step('A',40),b=step('B',100),c=step('C',160);
KK.addLink(P,a.id,'e',b.id,'e');KK.addLink(P,b.id,'e',c.id,'e');
KK.addLink(P,nb.id,'e',wn.id,'e');
// valmis-tapahtuma: ketju on valmis → ilmoitus
var done=KK.addBlock(P,'tee',{do:'ilmoita',tx:'valmis'}),nd=KK.addNode(P,done.id,500,0);KK.addLink(P,wn.id,'e',nd.id,'e');
KK.tick(P,C);
A.deepStrictEqual(rows(),[],'ei käynnisty itsestään');
KK.press(P,btn.id,C);
A.deepStrictEqual(rows(),['A','B','C'],'etenee järjestyksessä palikka kerrallaan');
A.strictEqual(P.st[k.id].run,false);A.strictEqual(P.st[k.id].n,1);A.deepStrictEqual(toasts,['valmis']);
A.ok(P.st[k.id].fl[a.id]===T.getTime()&&P.st[k.id].fl[c.id]===T.getTime(),'seuranta: milloin kukin tehtiin');
// haarat: B → C ja B → D rinnakkain
var d=step('D',160,200);KK.addLink(P,b.id,'e',d.id,'e');
KK.press(P,btn.id,C);A.deepStrictEqual(rows().slice(3),['A','B','C','D'],'kaksi haaraa samaan aikaan');
A.strictEqual(toasts.length,2,'valmis kerran, kun kaikki haarat ovat loppuneet');
// käynnistys tuloksesta: vertailu alkaa päteä → ketju käynnistyy (vain nousussa)
var sl=KK.addBlock(P,'saadin',{start:2}),ge=KK.addBlock(P,'vert',{op:'ge',b:5});var ns=KK.addNode(P,sl.id,-500,200),ng=KK.addNode(P,ge.id,-300,200);
KK.addLink(P,ns.id,'v',ng.id,'a');KK.addLink(P,ng.id,'v',wn.id,'e');KK.tick(P,C);
var n0=P.st[k.id].n;KK.userSet(P,sl.id,6,C);A.strictEqual(P.st[k.id].n,n0+1,'tulos laukaisi');KK.userSet(P,sl.id,7,C);A.strictEqual(P.st[k.id].n,n0+1,'ei uudelleen, kun ehto jo päti');
KK.userSet(P,sl.id,1,C);KK.userSet(P,sl.id,9,C);A.strictEqual(P.st[k.id].n,n0+2,'uudelleen, kun ehto välillä lakkasi');
// pois käytöstä oleva tapahtuma ohitetaan, ketju jatkuu sen ohi
var bb=P.b[KK.nodeOf(P,b.id).p];bb.off=true;var r0=rows().length;KK.press(P,btn.id,C);A.deepStrictEqual(rows().slice(r0),['A','C','D']);bb.off=false;
// nuoli ulkoa ketjun keskelle: ketju alkaa siitä
var b2=KK.addBlock(P,'nappi',{beh:'kerta'}),nb2=KK.addNode(P,b2.id,-300,400);KK.addLink(P,nb2.id,'e',c.id,'e');
r0=rows().length;KK.press(P,b2.id,C);A.deepStrictEqual(rows().slice(r0),['C'],'alkaa nuolen kohdasta');
// tapahtumasta ulos lähtevä viiva: tehdään heti tapahtuman jälkeen
var out=KK.addBlock(P,'tee',{do:'ilmoita',tx:'ulos'}),no=KK.addNode(P,out.id,400,100);KK.addLink(P,a.id,'e',no.id,'e');
toasts=[];KK.press(P,btn.id,C);A.deepStrictEqual(toasts,['ulos','valmis']);
// pysäytys: nuoli kohtaan pysäytä
var stop=KK.addBlock(P,'nappi',{beh:'kerta'}),nst=KK.addNode(P,stop.id,-300,600);KK.addLink(P,nst.id,'e',wn.id,'x');
P.st[k.id]={run:true,n:9,tk:[{n:b.id,a:T.getTime(),u:T.getTime()+60000,v:[]}],fl:{}};KK.press(P,stop.id,C);
A.strictEqual(P.st[k.id].run,false);A.strictEqual(P.st[k.id].tk.length,0);A.strictEqual(P.st[k.id].stop,true);
// uudelleen käynnistys kesken: ohita (oletus) ja alusta
P.st[k.id]={run:true,n:9,tk:[{n:b.id,a:T.getTime(),u:T.getTime()+60000,v:[]}],fl:{}};
r0=rows().length;KK.press(P,btn.id,C);A.strictEqual(rows().length,r0,'ohita: käynnissä olevaa ei aloiteta alusta');A.strictEqual(P.st[k.id].n,9);
k.uusi='alusta';KK.press(P,btn.id,C);A.strictEqual(P.st[k.id].n,10);A.deepStrictEqual(rows().slice(r0),['A','B','C','D'],'alusta: aloitetaan alusta');
k.uusi='ohita';
// ketju pois päältä: ei käynnisty
k.off=true;r0=rows().length;KK.press(P,btn.id,C);A.strictEqual(rows().length,r0);k.off=false;
// tyhjä ketju ja ketju ilman alkua: selkeä virhe
var k2=KK.addBlock(P,'ketju'),w2=KK.addNode(P,k2.id,0,900);A.strictEqual(KK.chainStart(P,k2.id,C),false);A.ok(/tyhjä/.test(P.st[k2.id].err));
var x1=KK.addBlock(P,'tee',{do:'ilmoita',tx:'1'}),x2=KK.addBlock(P,'tee',{do:'ilmoita',tx:'2'});var nx1=KK.addNode(P,x1.id,0,940,w2.id),nx2=KK.addNode(P,x2.id,0,1000,w2.id);
KK.addLink(P,nx1.id,'e',nx2.id,'e');KK.addLink(P,nx2.id,'e',nx1.id,'e');
A.strictEqual(KK.chainStart(P,k2.id,C),false);A.ok(/ei ole alkua/.test(P.st[k2.id].err));
// arvo käynnissä ja Miksi?
A.strictEqual(KK.Ev(P,C).val(k.id),false);P.st[k.id]={run:true,n:1,tk:[{n:a.id,a:0,u:T.getTime()+1000,v:[]}],fl:{}};A.strictEqual(KK.Ev(P,C).val(k.id),true);
A.ok(/käynnissä: 1 haara/.test(KK.why(P,KK.Ev(P,C),k.id,1).txt));
var info=KK.chainInfo(P,k.id,C);A.strictEqual(info.tk[0].left,1000);A.ok(KK.anyChainRunning(P));
// poistettu tapahtuma: haara katoaa siististi
KK.removeNode(P,a.id);KK.chainAdvance(P,k.id,C,0);A.strictEqual(P.st[k.id].run,false);
// toiminto ketjun ulkopuolella toimii kuten ennen (sitten ajetaan heti)
var q=KK.newProject('vanha'),qb=KK.addBlock(q,'nappi',{beh:'kerta'}),ql=KK.addBlock(q,'lista');var t1=KK.addBlock(q,'tee',{do:'rivi',o:ql.id,tx:'1'}),t2=KK.addBlock(q,'tee',{do:'rivi',o:ql.id,tx:'2'});
var qn=KK.addNode(q,qb.id,0,0),q1=KK.addNode(q,t1.id,200,0),q2=KK.addNode(q,t2.id,400,0);KK.addLink(q,qn.id,'e',q1.id,'e');KK.addLink(q,q1.id,'e',q2.id,'e');
KK.press(q,qb.id,C);A.deepStrictEqual(KK.listRows(q,ql.id).map(function(r){return r.tx;}),['1','2']);A.ok(!KK.anyChainRunning(q));
console.log('logiikka_11_ajo ok');
