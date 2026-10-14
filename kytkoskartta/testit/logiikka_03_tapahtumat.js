// Tapahtumat ja toiminnot: painike → toiminto → sitten, arvon nousu → toiminto, JOS NIIN/MUUTEN, KUN, Siirry, aikajana, lista, ilmoitus.
var KK=require('./moottori.js'),A=require('assert');var T=new Date(2026,9,14,9,30);var navs=[],toasts=[];
var C={now:function(){return T;},nav:function(n){navs.push(n);},toast:function(t){toasts.push(t);}};
var P=KK.newProject('t');function N(b){return KK.addNode(P,b.id,0,0);}
var btn=KK.addBlock(P,'nappi',{beh:'kerta'}),pis=KK.addBlock(P,'luku',{start:0}),aj=KK.addBlock(P,'aika');
var add=KK.addBlock(P,'tee',{do:'lisaa',o:pis.id,v:'2'}),log=KK.addBlock(P,'tee',{do:'kirjaa',o:aj.id,tx:'Pisteet {#'+pis.id+'}'});
var nb=N(btn),na=N(add),nl=N(log);KK.addLink(P,nb.id,'e',na.id,'e');KK.addLink(P,na.id,'e',nl.id,'e');
KK.tick(P,C);KK.press(P,btn.id,C);KK.press(P,btn.id,C);
A.strictEqual(P.st[pis.id],4);A.strictEqual(P.st[btn.id],2);A.strictEqual(P.st[aj.id].length,2);A.strictEqual(P.st[aj.id][1].tx,'Pisteet 4');A.strictEqual(P.st[aj.id][0].t,T.getTime());
// arvon nousu: kun pisteet ≥ 6 → ilmoitus (vain kerran nousussa)
var ge=KK.addBlock(P,'vert',{op:'ge',b:6}),il=KK.addBlock(P,'tee',{do:'ilmoita',tx:'Voitto!'});var np=N(pis),ng=N(ge),ni=N(il);KK.addLink(P,np.id,'v',ng.id,'a');KK.addLink(P,ng.id,'v',ni.id,'e');
KK.tick(P,C);A.strictEqual(toasts.length,0);KK.press(P,btn.id,C);A.deepStrictEqual(toasts,['Voitto!']);KK.press(P,btn.id,C);A.strictEqual(toasts.length,1,'ei uudelleen, kun ehto jo päti');
// JOS NIIN / MUUTEN
var sw=KK.addBlock(P,'kytkin'),j=KK.addBlock(P,'jos'),on=KK.addBlock(P,'tee',{do:'rivi',o:'',tx:'päälle'}),li=KK.addBlock(P,'lista',{rivit:'eka'});on.o=li.id;
var off=KK.addBlock(P,'tee',{do:'ilmoita',tx:'pois'});var ns=N(sw),nj=N(j),non=N(on),noff=N(off);KK.addLink(P,ns.id,'v',nj.id,'c');KK.addLink(P,nj.id,'e',non.id,'e');KK.addLink(P,nj.id,'m',noff.id,'e');
KK.tick(P,C);KK.userSet(P,sw.id,true,C);A.deepStrictEqual(KK.listRows(P,li.id).map(function(r){return r.tx;}),['eka','päälle']);KK.userSet(P,sw.id,false,C);A.strictEqual(toasts[toasts.length-1],'pois');
// KUN: tapahtuma läpi vain kun ehto pätee
var k=KK.addBlock(P,'kun'),b2=KK.addBlock(P,'nappi',{beh:'kerta'}),go=KK.addBlock(P,'tee',{do:'siirry',vw:'v1',x:100,y:200});var nk=N(k),nb2=N(b2),ngo=N(go),ns2=N(sw);
KK.addLink(P,nb2.id,'e',nk.id,'e');KK.addLink(P,ns2.id,'v',nk.id,'c');KK.addLink(P,nk.id,'e',ngo.id,'e');
KK.press(P,b2.id,C);A.strictEqual(navs.length,0);KK.userSet(P,sw.id,true,C);KK.press(P,b2.id,C);A.deepStrictEqual(navs[0],{vw:'v1',o:'',x:100,y:200});
// KUN-ikkuna
var w=KK.addBlock(P,'ikkuna',{m:'and',j:'kun'}),nw=N(w);var r1=KK.addBlock(P,'ruutu');KK.addNode(P,r1.id,0,0,nw.id);var b3=KK.addBlock(P,'nappi',{beh:'kerta'}),cnt=KK.addBlock(P,'muisti',{v:'0'}),inc=KK.addBlock(P,'tee',{do:'lisaa',o:cnt.id});
var nb3=N(b3),ninc=N(inc);KK.addLink(P,nb3.id,'e',nw.id,'e');KK.addLink(P,nw.id,'e',ninc.id,'e');
KK.press(P,b3.id,C);A.strictEqual(KK.Ev(P,C).val(cnt.id),0);KK.userSet(P,r1.id,true,C);KK.press(P,b3.id,C);KK.press(P,b3.id,C);A.strictEqual(KK.Ev(P,C).val(cnt.id),2);
// aseta arvo palikasta, tyhjennä, päivämäärään lisäys
var d=KK.addBlock(P,'pvm'),ta=KK.addBlock(P,'tanaan'),set=KK.addBlock(P,'tee',{do:'aseta',o:d.id,v:{r:ta.id}}),pl=KK.addBlock(P,'tee',{do:'lisaa',o:d.id,v:'7'});N(ta);N(set);N(pl);
KK.runAction(P,set.id,C);A.strictEqual(P.st[d.id],'2026-10-14');KK.runAction(P,pl.id,C);A.strictEqual(P.st[d.id],'2026-10-21');
var cl=KK.addBlock(P,'tee',{do:'tyhjenna',o:pis.id});N(cl);KK.runAction(P,cl.id,C);A.strictEqual(KK.Ev(P,C).val(pis.id),0);
// silmukka ei jää jumiin
var loop=KK.addBlock(P,'tee',{do:'lisaa',o:cnt.id}),nlo=N(loop);KK.addLink(P,nlo.id,'e',nlo.id,'e');KK.runAction(P,loop.id,C);
var l1=KK.addBlock(P,'tee',{do:'lisaa',o:cnt.id}),l2=KK.addBlock(P,'tee',{do:'lisaa',o:cnt.id});var n1=N(l1),n2=N(l2);KK.addLink(P,n1.id,'e',n2.id,'e');KK.addLink(P,n2.id,'e',n1.id,'e');
var before=KK.Ev(P,C).val(cnt.id);KK.runAction(P,l1.id,C);A.ok(KK.Ev(P,C).val(cnt.id)-before<=64,'syvyysraja');
console.log('ok tapahtumat');
