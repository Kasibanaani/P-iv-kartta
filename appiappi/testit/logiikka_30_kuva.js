// Pajakone 3c: Kuva-palikka (laji pkuva) ja painikkeen ulkoasu Näkymätön kosketusalue. Moottorin osuus: laji, kohdat,
// turvallinen kuvan osoite (SVG-teksti data-osoitteeksi, data:image ja http(s) sellaisenaan, muu tyhjä), repair.
var KK=require('./moottori.js'),A=require('assert');
var P=KK.newProject('k');var b=KK.addBlock(P,'pkuva',{});
A.strictEqual(b.nm,'Kuva');A.strictEqual(b.sov,'contain');A.strictEqual(b.src,'');
A.deepStrictEqual(KK.ports(b).ins.map(function(p){return p.p;}),['nk','hk','tx','vr','dx','dy','src','pk']);A.deepStrictEqual(KK.ports(b).outs,[]);
A.strictEqual(KK.K.kuva.n,'Kuva vaihtuu','ketjun efekti ennallaan');
var svg='<svg viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';
A.ok(KK.kuvaUrl(svg).indexOf('data:image/svg+xml;charset=utf-8,%3Csvg')===0);
A.ok(KK.kuvaUrl('<?xml version="1.0"?><svg/>').indexOf('data:image/svg+xml')===0);
A.strictEqual(KK.kuvaUrl('data:image/png;base64,AAAA'),'data:image/png;base64,AAAA');
A.strictEqual(KK.kuvaUrl(' https://x.fi/a.png '),'https://x.fi/a.png');
['javascript:alert(1)','data:text/html,<b>','<script>alert(1)</script>','ftp://x','',null].forEach(function(x){A.strictEqual(KK.kuvaUrl(x),'',String(x));});
b.src=5;b.sov='kumma';KK.repair(P);A.strictEqual(b.src,'');A.strictEqual(b.sov,'contain');
var n=KK.addBlock(P,'nappi',{ulk:'nakymaton'});var m=KK.addBlock(P,'nappi',{ulk:'outo'});KK.repair(P);A.strictEqual(n.ulk,'nakymaton');A.strictEqual(m.ulk,undefined);
// Kuva nuolesta: arvo kulkee kohtaan src
var a=KK.addBlock(P,'arvo',{v:'https://x.fi/b.png'});var an=KK.addNode(P,a.id,0,0),bn=KK.addNode(P,b.id,300,0);A.ok(KK.addLink(P,an.id,'v',bn.id,'src'));
var C={now:function(){return new Date();}};A.strictEqual(KK.Ev(P,C).inp(b.id,'src'),'https://x.fi/b.png');
var Q=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(Q.b[b.id].k,'pkuva');
console.log('kuva ok');
