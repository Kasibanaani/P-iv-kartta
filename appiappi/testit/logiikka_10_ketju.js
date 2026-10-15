// Versio 6.1: tapahtumaketjun pohja. Ketju on ikkuna (laji ketju), sen sisällä olevat toiminnot ovat tapahtumia,
// ja niiden väliset tapahtumaviivat ovat ketjun viivoja. Rakenne, alut, järjestys, korjaus ja vanhan projektin säilyminen.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,15,9,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};

var P=KK.newProject('ketju');
var k=KK.addBlock(P,'ketju');A.strictEqual(k.nm,'Ketju');A.strictEqual(k.uusi,'ohita');A.ok(KK.isWin(k));A.ok(!KK.isStep(k));
var wn=KK.addNode(P,k.id,100,100);A.strictEqual(wn.w,340);A.strictEqual(wn.h,200);
A.strictEqual(KK.addNode(P,k.id,0,0),wn,'ketjulla on vain yksi esiintymä kuten ikkunalla');
var pr=KK.ports(k);A.deepStrictEqual(pr.ins.map(function(p){return p.p+':'+p.t;}),['e:e','x:e']);A.deepStrictEqual(pr.outs.map(function(p){return p.p+':'+p.t;}),['v:v','t:v','e:e'],'versio 7.4: tulos-kohta');

var r=KK.addBlock(P,'ruutu'),s1=KK.addBlock(P,'tee',{do:'valitse',o:r.id}),s2=KK.addBlock(P,'tee',{do:'aseta',o:'',v:'3'}),s3=KK.addBlock(P,'tee',{do:'ilmoita',tx:'hei'});
var n1=KK.addNode(P,s1.id,120,150,wn.id),n2=KK.addNode(P,s2.id,120,230,wn.id),n3=KK.addNode(P,s3.id,300,230,wn.id);
A.ok(KK.isStep(s1));A.strictEqual(KK.chainOfNode(P,n1),k);
var l12=KK.addLink(P,n1.id,'e',n2.id,'e'),l13=KK.addLink(P,n1.id,'e',n3.id,'e');
A.ok(KK.isChainLink(P,l12)&&KK.isChainLink(P,l13),'viivat ketjun sisällä ovat ketjun viivoja');
A.deepStrictEqual(KK.chainSteps(P,k.id).map(function(n){return n.id;}),[n1.id,n2.id,n3.id]);
A.deepStrictEqual(KK.chainStarts(P,k.id).map(function(n){return n.id;}),[n1.id],'alku on palikka, johon ei tule viivaa');
A.deepStrictEqual(KK.chainOrder(P,k.id),[n1.id,n2.id,n3.id]);
A.strictEqual(KK.chainLinksFrom(P,n1.id,'e').length,2,'samasta palikasta voi lähteä monta haaraa');

// Ketjun viivoja ei ajeta heti tavallisena tapahtumanuolena (ketju etenee omassa tahdissaan, versio 6.2).
var btn=KK.addBlock(P,'nappi',{beh:'kerta'}),nb=KK.addNode(P,btn.id,0,0);
var out=KK.addBlock(P,'tee',{do:'valitse',o:r.id}),no=KK.addNode(P,out.id,0,80);
KK.fire(P,s1.id,'e',C,0);A.strictEqual(P.st[r.id],undefined,'fire ei kulje ketjun viivaa pitkin');
// Viiva ketjusta ulos ei ole ketjun viiva, ja se ajetaan tavallisesti.
var lo=KK.addLink(P,n2.id,'e',no.id,'e');A.ok(!KK.isChainLink(P,lo));
KK.fire(P,s2.id,'e',C,0);A.strictEqual(P.st[r.id],true,'ketjusta ulos lähtevä viiva toimii kuten ennen');
delete P.st[r.id];

// Tapahtuma ketjun ulkopuolella on tavallinen toiminto: sen viivat ajetaan heti kuten ennen.
var o1=KK.addBlock(P,'tee',{do:'valitse',o:r.id}),o2=KK.addBlock(P,'tee',{do:'ilmoita',tx:'x'});var on1=KK.addNode(P,o1.id,600,0),on2=KK.addNode(P,o2.id,600,80);
var lx=KK.addLink(P,on1.id,'e',on2.id,'e');A.ok(!KK.isChainLink(P,lx));A.strictEqual(KK.chainOfNode(P,on1),null);

// Ikkunan (sulkujen) sisältö ei laske ketjun tapahtumia arvoiksi.
var iw=KK.addBlock(P,'ikkuna',{m:'and'}),iwn=KK.addNode(P,iw.id,0,400);KK.addNode(P,s1.id,10,420,iwn.id);
A.strictEqual(KK.Ev(P,C).members(iw.id).length,0);
KK.removeNode(P,KK.nodesOfBlock(P,s1.id)[1].id);

// Ketjun arvo: käynnissä (versio 6.2 käynnistää). Nyt ei ole.
A.strictEqual(KK.Ev(P,C).val(k.id),false);

// Ketjua ei voi laittaa toisen ketjun sisään: korjaus vie sen ulos.
var k2=KK.addBlock(P,'ketju'),wn2=KK.addNode(P,k2.id,200,200,wn.id);KK.repair(P);A.strictEqual(wn2.g,'','ketju ei ole toisen ketjun sisällä');
// Ketju saa olla tavallisen ikkunan sisällä (sen arvo käynnissä on silloin mukana).
wn2.g=iwn.id;KK.repair(P);A.strictEqual(wn2.g,iwn.id);
var m=KK.Ev(P,C).members(iw.id);A.deepStrictEqual(m.map(function(x){return x.p;}),[k2.id]);

// Ketjun sisällä olevat palikat säilyvät korjauksessa (g osoittaa ketjuun).
KK.repair(P);A.strictEqual(n1.g,wn.id);A.strictEqual(n2.g,wn.id);
// Rikkinäinen ajotila poistetaan, kelvollinen siivotaan.
P.st[k.id]='rikki';KK.repair(P);A.strictEqual(P.st[k.id],undefined);
P.st[k.id]={run:true,tk:[{n:n2.id,v:'x',u:'y'},5,null]};KK.repair(P);
A.deepStrictEqual(P.st[k.id].tk,[{n:n2.id,v:[]}]);A.strictEqual(P.st[k.id].run,true);
P.st[k.id]={run:true,tk:[]};KK.repair(P);A.strictEqual(P.st[k.id].run,false,'käynnissä ilman haaroja = ei käynnissä');
k.uusi='jotain';KK.repair(P);A.strictEqual(k.uusi,'ohita');

// JSON-kierros: ketju säilyy sellaisenaan.
var J=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(J.b[k.id].k,'ketju');A.strictEqual(KK.chainSteps(J,k.id).length,3);
A.strictEqual(J.lg.l.filter(function(l){return KK.isChainLink(J,l);}).length,2);

// Vanha projekti ilman ketjuja aukeaa ennallaan.
var old=KK.newProject('vanha');var a=KK.addBlock(old,'luku',{start:2}),w=KK.addBlock(old,'ikkuna',{m:'sum'});var ow=KK.addNode(old,w.id,0,0);KK.addNode(old,a.id,10,40,ow.id);
var before=JSON.stringify(old);KK.repair(old);A.strictEqual(JSON.stringify(old),before,'vanha projekti ei muutu');
A.strictEqual(KK.Ev(old,C).val(w.id),2);
var Dt=KK.repairData({app:'kytkoskartta',ver:5,projects:[JSON.parse(before)],cur:''});A.strictEqual(Dt.ver,KK.VER);A.ok(KK.VER>=6);A.strictEqual(Dt.projects.length,1);
console.log('logiikka_10_ketju ok');
