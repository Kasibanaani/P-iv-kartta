// Appi-appi 27 (F30 kohdat 1–3): logiikkapinta. Pistokkeiden piilotus (yleinen P.lg.pin, palikan oma lpin voittaa,
// ketjussa aina näkyvissä), viitteet katkoviivoina (refPairs: sama tieto kuin Yhteydet, ei nuolia, ei kaavan tulosta,
// ei toiminnon kohdetta) ja venytetyn Kaavan koko solmussa (kw, kh). Korjaus siivoaa väärät arvot, vanha projekti ennallaan.
var KK=require('./moottori.js'),A=require('assert');
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0);return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava');k.b.f=KK.kaavaToIds(P,f);return k;}

var P=KK.newProject('pinta');
var uni=blk(P,'muisti',{nm:'Uni',v:'8'}),hyva=kaava(P,'uni > 7');
var ika=blk(P,'muisti',{nm:'Ikä',v:'40'});KK.repair(P);

// Pistokkeet: oletuksena näkyvät; yleinen piilotus; palikan oma voittaa kumpaankin suuntaan
A.strictEqual(KK.pinsHidden(P,hyva.n),false,'oletus: näkyvät');
P.lg.pin='h';A.strictEqual(KK.pinsHidden(P,hyva.n),true,'yleinen piilotus');
hyva.b.lpin='n';A.strictEqual(KK.pinsHidden(P,hyva.n),false,'oma näkyvät voittaa yleisen piilotuksen');
delete P.lg.pin;uni.b.lpin='h';A.strictEqual(KK.pinsHidden(P,uni.n),true,'oma piilossa voittaa yleisen');
A.strictEqual(KK.pinsHidden(P,ika.n),false,'muut ennallaan');

// Ketjussa pistokkeet näkyvät aina, myös ketjuikkunassa
P.lg.pin='h';var ch=blk(P,'ketju',{nm:'Aamu'},300,0);var aj=KK.addBlock(P,'ajastin',{kesto:1});var ajn=KK.addNode(P,aj.id,320,60,ch.n.id);aj.lpin='h';KK.repair(P);
A.strictEqual(KK.pinsHidden(P,ch.n),false,'ketjuikkuna näkyvät');A.strictEqual(KK.pinsHidden(P,ajn),false,'ketjun tapahtuma näkyvät, vaikka oma piilossa');

// Piilotus ei poista nuolia eikä estä laskentaa
var nayta=blk(P,'nayta',{nm:'Teksti'});var l=KK.addLink(P,hyva.n.id,'v',nayta.n.id,'nk');A.ok(l,'nuoli kaavasta näkyy kun -kohtaan');
hyva.b.lpin='h';KK.repair(P);A.ok(P.lg.l.some(function(x){return x.id===l.id;}),'nuoli säilyy piilotettuna');
A.strictEqual(KK.Ev(P,{now:function(){return new Date(2026,9,17);}}).val(hyva.b.id),true,'kaava laskee');

// Viitteet: kaava → uni (kaava), teksti {Ikä} → ika (teksti); nuolella yhdistetty pari ei tule katkoviivaksi
var tx=blk(P,'nayta',{nm:'Rivi'});tx.b.tx=KK.toIds(P,'Ikä {Ikä}');KK.repair(P);
var all=KK.refPairs(P,null);function has(f,t){return all.some(function(r){return r.f===f&&r.t===t;});}
A.ok(has(uni.b.id,hyva.b.id),'kaava viittaa uneen');A.ok(has(ika.b.id,tx.b.id),'teksti viittaa ikään');
var nk=KK.addLink(P,uni.n.id,'v',tx.n.id,'nk');KK.repair(P);all=KK.refPairs(P,null);
A.ok(!all.some(function(r){return r.f===uni.b.id&&r.t===tx.b.id;}),'nuoli ei tule katkoviivaksi');
// Rajaus: vain valitun palikan viitteet ja käyttäjät
var sel={};sel[hyva.b.id]=1;var vs=KK.refPairs(P,sel);
A.ok(vs.length>=1&&vs.every(function(r){return r.f===hyva.b.id||r.t===hyva.b.id;}),'valitulle: vain sen parit');
sel={};sel[uni.b.id]=1;A.ok(KK.refPairs(P,sel).some(function(r){return r.t===hyva.b.id;}),'valitulle: myös käyttäjät');
// Kaavan tulos ei tule (oma katkoviiva), toiminnon kohde ei tule
var tul=blk(P,'tulos',{nm:'Summa'});var kt=kaava(P,'summa = uni + 1');KK.repair(P);all=KK.refPairs(P,null);
A.ok(!all.some(function(r){return r.f===kt.b.id&&r.t===tul.b.id||r.f===tul.b.id&&r.t===kt.b.id;}),'kaavan tulos ei tule viitteeksi');
A.ok(all.some(function(r){return r.f===uni.b.id&&r.t===kt.b.id;}),'tuloskaavan oikea puoli tulee');
var tee=blk(P,'tee',{do:'aseta',o:ika.b.id,v:'1'});KK.repair(P);all=KK.refPairs(P,null);
A.ok(!all.some(function(r){return r.f===ika.b.id&&r.t===tee.b.id;}),'toiminnon kohde ei tule');
// Sama tieto kuin Yhteydet
var D=KK.deps(P);A.ok((D.uses[hyva.b.id]||[]).some(function(x){return x.id===uni.b.id;}),'Yhteydet näkee saman');

// Venytetty Kaava: kw ja kh säilyvät JSON-kierroksessa; väärät pois; muille palikoille ei kokoa
hyva.n.kw=260;hyva.n.kh=90;uni.n.kw=200;KK.repair(P);
A.strictEqual(hyva.n.kw,260);A.strictEqual(hyva.n.kh,90);A.strictEqual(uni.n.kw,undefined,'muun kuin kaavan koko pois');
var Q=KK.repair(JSON.parse(JSON.stringify(P)));var qn=KK.nodeOf(Q,hyva.n.id);
A.strictEqual(qn.kw,260,'leveys JSON-kierroksessa');A.strictEqual(qn.kh,90,'korkeus JSON-kierroksessa');
A.strictEqual(Q.lg.pin,'h','yleinen valinta tallentuu');A.strictEqual(Q.b[hyva.b.id].lpin,'h','oma valinta tallentuu');
hyva.n.kw='leveä';hyva.n.kh=-3;KK.repair(P);A.strictEqual(hyva.n.kw,undefined);A.strictEqual(hyva.n.kh,undefined);

// Korjaus: tuntemattomat arvot pois
P.lg.pin='x';P.lg.vit='joskus';uni.b.lpin='kyllä';KK.repair(P);
A.strictEqual(P.lg.pin,undefined);A.strictEqual(P.lg.vit,undefined);A.strictEqual(uni.b.lpin,undefined);
P.lg.vit='kaikki';KK.repair(P);A.strictEqual(P.lg.vit,'kaikki');P.lg.vit='ei';KK.repair(P);A.strictEqual(P.lg.vit,'ei');

// Vanha projekti: ei uusia kenttiä, rakenne ennallaan
var V=KK.newProject('vanha');var vk=kaava(V,'1 + 1');KK.repair(V);var before=JSON.stringify(V);KK.repair(V);
A.strictEqual(JSON.stringify(V),before,'korjaus ei lisää mitään');A.ok(!('pin' in V.lg)&&!('vit' in V.lg)&&!('kw' in vk.n),'ei uusia kenttiä');
A.strictEqual(KK.pinsHidden(V,vk.n),false,'vanhassa pistokkeet näkyvät');
console.log('logiikkapinta ok');
