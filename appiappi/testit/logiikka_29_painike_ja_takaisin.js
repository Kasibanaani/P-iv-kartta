// Pajakone 2: painikkeen lisätapahtumat (pitkä painallus, irrotettu, painalluksen kesto), käytös ”pohjassa vain
// painettaessa” ja toiminto Palaa takaisin. Moottorin osuus: kohdat, arvot, tapahtumat nuolia pitkin, repair.
var KK=require('./moottori.js'),A=require('assert');
var navs=[];var C={now:function(){return new Date(2026,9,15,18,0,0);},toast:function(){},nav:function(n){navs.push(n);}};
function val(P,id,p){return KK.Ev(P,C).val(id,p);}
function outs(b){return KK.ports(b).outs.map(function(p){return p.p;});}

// Kohdat: lisätapahtumat vain asetuksella ext tai käytöksellä pida
var P=KK.newProject('p');var b=KK.addBlock(P,'nappi',{});
A.strictEqual(b.beh,'pohjaan');A.deepStrictEqual(outs(b),['v','e']);
b.ext=true;A.deepStrictEqual(outs(b),['v','e','pitka','irti','k']);
A.strictEqual(KK.ports(b).outs[2].n,'pitkä painallus');A.strictEqual(KK.ports(b).outs[4].t,'v');
var h=KK.addBlock(P,'nappi',{beh:'pida'});A.deepStrictEqual(outs(h),['v','e','pitka','irti','k']);A.strictEqual(KK.ports(h).outs[0].n,'painetaan nyt');
A.ok(KK.isBoolKind(h));A.ok(KK.napExt(h));A.ok(!KK.napExt(KK.addBlock(P,'nappi',{beh:'kerta'})));

// Tapahtumat nuolia pitkin: laskurit muisteihin
var bn=KK.addNode(P,b.id,0,0),hn=KK.addNode(P,h.id,0,200);
function counter(nm,from,port,y){var m=KK.addBlock(P,'muisti',{v:'0'});var mn=KK.addNode(P,m.id,600,y);var t=KK.addBlock(P,'tee',{do:'lisaa',o:m.id});var tn=KK.addNode(P,t.id,300,y);A.ok(KK.addLink(P,from,port,tn.id,'e'),nm);return m;}
var mE=counter('painettu',bn.id,'e',0),mL=counter('pitkä',bn.id,'pitka',60),mI=counter('irti',bn.id,'irti',120);
KK.press(P,b.id,C);A.strictEqual(val(P,mE.id),1);A.strictEqual(val(P,b.id),true,'jää pohjaan ennallaan');
KK.pressLong(P,b.id,C);A.strictEqual(val(P,mL.id),1);A.strictEqual(val(P,mE.id),1,'pitkä ei ole painallus');
KK.pressUp(P,b.id,C,0.734);A.strictEqual(val(P,mI.id),1);A.strictEqual(val(P,b.id,'k'),0.734,'kesto sekunteina');A.strictEqual(val(P,b.id),true,'irrotus ei muuta pohjaan-painiketta');
KK.pressUp(P,b.id,C,-3);A.strictEqual(val(P,b.id,'k'),0);
A.ok(KK.hasOut(P,b.id,'pitka'));A.ok(!KK.hasOut(P,h.id,'pitka'));
// Kesto kaavassa ja nuolella
var kv=KK.addBlock(P,'kaava',{f:'{#'+b.id+'}'});A.strictEqual(val(P,kv.id),true);

// Pohjassa vain painettaessa: arvo on valittu painamisen ajan
var hE=counter('h painettu',hn.id,'e',300),hI=counter('h irti',hn.id,'irti',360);
A.strictEqual(val(P,h.id),false);
KK.pressDown(P,h.id,C);A.strictEqual(val(P,h.id),true);A.strictEqual(val(P,hE.id),1);
KK.pressUp(P,h.id,C,1.5);A.strictEqual(val(P,h.id),false);A.strictEqual(val(P,hI.id),1);A.strictEqual(val(P,h.id,'k'),1.5);
KK.press(P,h.id,C);A.strictEqual(val(P,h.id),false,'näppäimistöllä painettaessa vain tapahtuma');A.strictEqual(val(P,hE.id),2);
// pressDown ei koske muihin käytöksiin
KK.pressDown(P,b.id,C);A.strictEqual(val(P,mE.id),1);
// JOS reagoi painamisen alkuun ja loppuun (arvon nousu ja lasku)
var j=KK.addBlock(P,'jos',{muuten:true});var jn=KK.addNode(P,j.id,300,500);A.ok(KK.addLink(P,hn.id,'v',jn.id,'c'));
var mJ=KK.addBlock(P,'muisti',{v:''});KK.addNode(P,mJ.id,900,500);
var t1=KK.addBlock(P,'tee',{do:'aseta',o:mJ.id,v:'kaasu'});var t1n=KK.addNode(P,t1.id,600,480);KK.addLink(P,jn.id,'e',t1n.id,'e');
var t2=KK.addBlock(P,'tee',{do:'aseta',o:mJ.id,v:'vapaa'});var t2n=KK.addNode(P,t2.id,600,540);KK.addLink(P,jn.id,'m',t2n.id,'e');
KK.tick(P,C);KK.pressDown(P,h.id,C);A.strictEqual(val(P,mJ.id),'kaasu');KK.pressUp(P,h.id,C,0.2);A.strictEqual(val(P,mJ.id),'vapaa');

// Repair: tuntematon käytös → pohjaan, ext vain true; ext pois → lisäkohtien nuolet poistuvat
var x=KK.addBlock(P,'nappi',{beh:'joskus',ext:'kyllä'});KK.repair(P);A.strictEqual(x.beh,'pohjaan');A.strictEqual(x.ext,undefined);
delete b.ext;KK.repair(P);A.ok(!P.lg.l.some(function(l){return l.f===bn.id&&(l.fp==='pitka'||l.fp==='irti');})&&P.lg.l.some(function(l){return l.f===hn.id&&l.fp==='irti';}),'vain b:n lisänuolet pois');
// Tallennus
var Q=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(Q.b[h.id].beh,'pida');

// Palaa takaisin: toiminto pyytää käyttöliittymältä paluuta
A.strictEqual(KK.DOS.takaisin,'Palaa takaisin');
var tb=KK.addBlock(P,'tee',{do:'takaisin'});var tbn=KK.addNode(P,tb.id,300,700);
var bk=KK.addBlock(P,'nappi',{beh:'kerta'});var bkn=KK.addNode(P,bk.id,0,700);KK.addLink(P,bkn.id,'e',tbn.id,'e');
navs=[];KK.press(P,bk.id,C);A.deepStrictEqual(navs,[{takaisin:true,heti:false}]);
tb.tapa='heti';navs=[];KK.press(P,bk.id,C);A.deepStrictEqual(navs,[{takaisin:true,heti:true}]);
A.ok(/Palaa takaisin/.test(KK.descAct(P,tb.id)));
console.log('painike ja takaisin ok');
