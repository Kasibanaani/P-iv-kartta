// Appi-appi 10: zoomaus käytössä (moottorin osuus). Näkymän asetus v.zm (sormilla, pienin, suurin), Kamera-palikka
// (zoomaus %, näkyvä leveys ja korkeus), etusija nuoli > asetettu (toiminto tai sormet) > perusarvo, nuoli lukitsee sormet,
// ensimmäinen Kamera-palikka ratkaisee, vain laitenäkymässä, Muutos ajassa pehmeään zoomaukseen, kaava, korjaus, tallennus.
var KK=require('./moottori.js'),A=require('assert');
var T=1000000;var C={now:function(){return new Date(T);},toast:function(){},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0);}
function E(P){return KK.Ev(P,C);}
var P=KK.newProject('z'),v=P.views[0],vw=v.id;

// --- 1. Näkymän asetus: vain laitenäkymässä, oletus pois ja 50–300 % ---
A.strictEqual(KK.zoomAsetus(P,vw),null,'vapaalla kanvaasilla ei zoomausasetusta');
v.laite='puhelin';A.deepStrictEqual(KK.zoomAsetus(P,vw),{s:false,min:50,max:300});
v.zm={s:true,min:'80',max:250};A.deepStrictEqual(KK.zoomAsetus(P,vw),{s:true,min:80,max:250});
v.zm={s:true,min:400,max:20};A.deepStrictEqual(KK.zoomAsetus(P,vw),{s:true,min:20,max:400},'väärin päin käännetään');
v.zm={s:'kyllä',min:1,max:99999};A.deepStrictEqual(KK.zoomAsetus(P,vw),{s:false,min:10,max:1000},'vain true kelpaa, rajat 10–1000');
// Ilman Kamera-palikkaa: käyttöliittymän (sormien) zoomaus
A.strictEqual(KK.kameraBlk(P,vw),null);A.strictEqual(KK.zoomNyt(P,vw,C),100);A.strictEqual(KK.zoomNyt(P,vw,C,150),150);A.strictEqual(KK.zoomNyt(P,vw,C,5000),1000);
A.strictEqual(KK.zoomNyt(P,vw,C,'abc'),100);A.strictEqual(KK.zoomAseta(P,vw,200,C),null,'ilman palikkaa käyttöliittymä pitää arvon');A.strictEqual(KK.zoomLukittu(P,vw,C),false);

// --- 2. Kamera-palikka: laji, kohdat, ominaisuudet ---
var kb=KK.addBlock(P,'kamera',{vw:vw});var kn=N(P,kb);
A.strictEqual(KK.K.kamera.n,'Kamera');A.strictEqual(KK.K.kamera.g,'lg');
var pr=KK.ports(kb);A.deepStrictEqual(pr.outs.map(function(x){return x.p;}),['v','lev','kor']);A.deepStrictEqual(pr.ins.map(function(x){return x.p;}),['o_zoomaus'],'zoomaus-kohta auki valmiiksi');
A.deepStrictEqual(KK.omat(kb).map(function(e){return e.n;}),['zoomaus','leveys','korkeus','joukot']);
A.strictEqual(KK.kameraBlk(P,vw),kb.id);
var ev=E(P);A.strictEqual(ev.val(kb.id),100,'perusarvo 100');A.strictEqual(ev.val(kb.id,'lev'),390);A.strictEqual(ev.val(kb.id,'kor'),844);
A.strictEqual(KK.zoomNyt(P,vw,C,250),100,'palikan kanssa sormien ui-arvo ei vaikuta');
kb.zm='200';A.strictEqual(E(P).val(kb.id),200,'perusarvo palikasta');A.strictEqual(E(P).val(kb.id,'lev'),195);A.strictEqual(E(P).val(kb.id,'kor'),422);
kb.zm=150;A.strictEqual(E(P).val(kb.id,'lev'),260);
delete kb.zm;

// --- 3. Sormet asettavat arvon (kuten Aseta), Palauta palauttaa ---
A.strictEqual(KK.zoomAseta(P,vw,175.04,C),true);A.strictEqual(KK.zoomNyt(P,vw,C),175,'pyöristys 0,1:een');A.deepStrictEqual(P.st['o:'+kb.id],{zoomaus:175});
A.strictEqual(E(P).omSrc(kb.id,KK.omFind(kb,'zoomaus')),'asetettu');
var tp=KK.addBlock(P,'tee',{do:'palauta',o:kb.id});N(P,tp);KK.runAction(P,tp.id,C,0);A.strictEqual(KK.zoomNyt(P,vw,C),100,'Palauta → perusarvo');
// Aseta toiminnolla: arvo, kaava, rajat 10–1000
var ta=KK.addBlock(P,'tee',{do:'aseta',o:kb.id,om:'zoomaus',v:'250'});N(P,ta);KK.runAction(P,ta.id,C,0);A.strictEqual(KK.zoomNyt(P,vw,C),250);
ta.v='5000';KK.runAction(P,ta.id,C,0);A.strictEqual(KK.zoomNyt(P,vw,C),1000,'yläraja');ta.v='1';KK.runAction(P,ta.id,C,0);A.strictEqual(KK.zoomNyt(P,vw,C),10,'alaraja');
// Kaava lukee zoomauksen, leveyden ja korkeuden
ta.v='200';KK.runAction(P,ta.id,C,0);
var ka=KK.addBlock(P,'kaava',{f:'{#'+kb.id+'}.zoomaus + {#'+kb.id+'}.leveys + {#'+kb.id+'}.korkeus'});N(P,ka);A.strictEqual(E(P).val(ka.id),200+195+422);
var kv=KK.addBlock(P,'kaava',{f:kb.vt+'.zoomaus * 2'});kv.f=KK.kaavaToIds(P,kv.f);N(P,kv);A.strictEqual(E(P).val(kv.id),400,'viitteellä '+kb.vt);

// --- 4. Nuoli ohjaa ja lukitsee sormet ---
var sa=KK.addBlock(P,'saadin',{v:vw,min:50,max:400,start:120});var san=N(P,sa);KK.addLink(P,san.id,'v',kn.id,'o_zoomaus');
A.strictEqual(KK.zoomLukittu(P,vw,C),true);A.strictEqual(KK.zoomNyt(P,vw,C),120,'nuoli voittaa asetetun');
A.strictEqual(KK.zoomAseta(P,vw,300,C),false,'sormet eivät ohita nuolta');A.strictEqual(KK.zoomNyt(P,vw,C),120);
KK.userSet(P,sa.id,330,C);A.strictEqual(KK.zoomNyt(P,vw,C),330);
// Nuoli virheestä → perusarvo / asetettu ei kaadu
P.lg.l=P.lg.l.filter(function(l){return l.t!==kn.id;});A.strictEqual(KK.zoomLukittu(P,vw,C),false);A.strictEqual(KK.zoomNyt(P,vw,C),200,'nuoli pois → asetettu jää');

// --- 5. Muutos ajassa pehmeään zoomaukseen ---
var mu=KK.addBlock(P,'muutos',{a:100,b:300,kesto:2});var mun=N(P,mu);KK.addLink(P,mun.id,'v',kn.id,'o_zoomaus');
A.strictEqual(KK.zoomNyt(P,vw,C),100,'ennen alkua alkuarvo');
var go=KK.addBlock(P,'nappi',{v:vw,tx:'Lähennä',beh:'kerta'});KK.addLink(P,N(P,go).id,'e',mun.id,'e');KK.press(P,go.id,C);
T+=1000;KK.frame(P,1,C);A.strictEqual(KK.zoomNyt(P,vw,C),200,'puolivälissä');T+=1500;KK.frame(P,1.5,C);A.strictEqual(KK.zoomNyt(P,vw,C),300,'perillä');
P.lg.l=P.lg.l.filter(function(l){return l.t!==kn.id;});

// --- 6. Ensimmäinen Kamera-palikka ratkaisee; väärä näkymä ja vapaa näkymä ---
var k2=KK.addBlock(P,'kamera',{vw:vw,zm:400});N(P,k2);A.strictEqual(KK.kameraBlk(P,vw),kb.id);A.strictEqual(KK.zoomNyt(P,vw,C),200);
A.ok(/toinen Kamera-palikka/.test(KK.why(P,E(P),k2.id).txt));A.ok(/Zoomaus 200 %/.test(KK.why(P,E(P),kb.id).txt),KK.why(P,E(P),kb.id).txt);
var tv=KK.addBlock(P,'tee',{do:'palauta',o:kb.id});N(P,tv);KK.runAction(P,tv.id,C,0);A.ok(/perusarvo/.test(KK.why(P,E(P),kb.id).txt));
KK.removeBlock(P,kb.id);A.strictEqual(KK.kameraBlk(P,vw),k2.id,'poiston jälkeen seuraava');A.strictEqual(KK.zoomNyt(P,vw,C),400);
P.views.push({id:'v9',n:'Vapaa'});var k3=KK.addBlock(P,'kamera',{vw:'v9',zm:300});A.strictEqual(KK.zoomNyt(P,'v9',C),100,'vapaalla kanvaasilla aina 100');
A.strictEqual(E(P).val(k3.id,'lev'),null);A.ok(/ei ole laitenäkymä/.test(KK.why(P,E(P),k3.id).txt));
var k4=KK.addBlock(P,'kamera',{});A.ok(/Valitse näkymä/.test(KK.why(P,E(P),k4.id).txt));A.strictEqual(KK.kameraBlk(P,''),null,'tyhjä näkymä ei osoita mihinkään');

// --- 7. Korjaus ja tallennus ---
v.zm={s:true,min:'60',max:'x',muu:1};k2.zm='abc';k3.vw=5;KK.repair(P);
A.deepStrictEqual(v.zm,{s:true,min:60});A.strictEqual(k2.zm,undefined);A.strictEqual(k3.vw,'');
v.zm={s:false};KK.repair(P);A.strictEqual(v.zm,undefined,'tyhjä asetus pois');v.zm=[1];KK.repair(P);A.strictEqual(v.zm,undefined);
v.zm={s:true,max:5000};k2.zm=2500;KK.repair(P);A.deepStrictEqual(v.zm,{s:true,max:1000});A.strictEqual(k2.zm,1000);
var J=JSON.parse(JSON.stringify(P));KK.repair(J);A.deepStrictEqual(J.views[0].zm,{s:true,max:1000});A.strictEqual(KK.zoomNyt(J,vw,C),1000);
// Vanha projekti ilman kenttiä: zoomaus 100, sormet pois
var Q=KK.newProject('q');Q.views[0].laite='puhelin';KK.repair(Q);A.strictEqual(Q.views[0].zm,undefined);A.strictEqual(KK.zoomNyt(Q,Q.views[0].id,C),100);A.strictEqual(KK.zoomAsetus(Q,Q.views[0].id).s,false);
console.log('ok zoomaus');
