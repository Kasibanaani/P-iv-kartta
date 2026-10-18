// Appi-appi 29 (F30 kohta 5): Ryhmä. Pelkkä rakentajan merkintä: ei arvoa, ei kohtia, ei ominaisuuksia eikä laskentaa.
// Sisältö toimii kuin ryhmää ei olisi; ryhmä on vain ylimmällä tasolla tai toisessa ryhmässä. Poisto jättää sisällön.
var KK=require('./moottori.js'),A=require('assert');var C={now:function(){return new Date(2026,9,17);}};
var P=KK.newProject('ryhmä');
function V(id){return KK.Ev(P,C).val(id);}
var r=KK.addBlock(P,'ryhma',{}),rn=KK.addNode(P,r.id,0,0);
A.strictEqual(r.nm,'Ryhmä');A.ok(KK.isWin(r),'ryhmä on säiliö');A.strictEqual(rn.w,300);A.strictEqual(rn.h,180);
A.deepStrictEqual(KK.ports(r),{ins:[],outs:[]},'ei kohtia');A.deepStrictEqual(KK.omat(r),[],'ei ominaisuuksia');
A.ok(KK.K.ryhma.erik&&/laskentaa/.test(KK.K.ryhma.erik),'erikoispalikka ja syy');A.strictEqual(V(r.id),null,'ei arvoa');
A.strictEqual(KK.addNode(P,r.id,50,50),rn,'yksi esiintymä kuten ikkunalla');

// JA-ikkuna ja sen sisältö ryhmän sisällä toimivat ennallaan
var w=KK.addBlock(P,'ikkuna',{m:'and'}),wn=KK.addNode(P,w.id,10,40,rn.id);
var a=KK.addBlock(P,'ruutu'),b=KK.addBlock(P,'ruutu');KK.addNode(P,a.id,20,80,wn.id);KK.addNode(P,b.id,20,120,wn.id);
A.strictEqual(V(w.id),false);KK.userSet(P,a.id,true,C);KK.userSet(P,b.id,true,C);A.strictEqual(V(w.id),true,'ikkuna laskee ryhmässä');
// Ryhmän suorat jäsenet eivät ole minkään ikkunan jäseniä: ulkopuolinen ikkuna ei näe niitä
var c=KK.addBlock(P,'ruutu');KK.addNode(P,c.id,200,40,rn.id);A.strictEqual(V(w.id),true,'ryhmän muu sisältö ei vaikuta ikkunaan');
// Kaava ryhmän sisällä laskee kuten muualla
var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,200,80,rn.id);k.f=KK.kaavaToIds(P,'jos('+c.vt+'; 1; 2)');KK.repair(P);
A.strictEqual(V(k.id),2);KK.userSet(P,c.id,true,C);A.strictEqual(V(k.id),1,'kaava ryhmässä');

// Ketju ryhmän sisällä: vaiheet kuuluvat edelleen ketjuun
var ch=KK.addBlock(P,'ketju',{nm:'Aamu'}),chn=KK.addNode(P,ch.id,0,200,rn.id);
var aj=KK.addBlock(P,'ajastin',{kesto:1}),ajn=KK.addNode(P,aj.id,20,240,chn.id);
A.strictEqual(KK.chainOfNode(P,ajn),ch,'vaihe kuuluu ketjuun ryhmässäkin');
// Ketjun palikka suoraan ryhmässä ei ole ketjussa
var aj2=KK.addBlock(P,'ajastin',{kesto:1}),aj2n=KK.addNode(P,aj2.id,220,240,rn.id);A.strictEqual(KK.chainOfNode(P,aj2n),null);

// Ryhmä toisessa ryhmässä käy; ikkunan tai ketjun sisällä ei (korjaus siirtää ylimmälle tasolle)
var r2=KK.addBlock(P,'ryhma',{nm:'Sisä'}),r2n=KK.addNode(P,r2.id,5,5,rn.id);KK.repair(P);A.strictEqual(r2n.g,rn.id,'ryhmä ryhmässä');
var r3=KK.addBlock(P,'ryhma',{}),r3n=KK.addNode(P,r3.id,30,60,wn.id);KK.repair(P);A.strictEqual(r3n.g,'','ryhmä ikkunasta pois');
var r4=KK.addBlock(P,'ryhma',{}),r4n=KK.addNode(P,r4.id,30,260,chn.id);KK.repair(P);A.strictEqual(r4n.g,'','ryhmä ketjusta pois');
A.strictEqual(V(w.id),true,'ikkuna ennallaan korjauksen jälkeen');

// Sävy: 0–7 säilyy JSON-kierroksessa, väärä pois; vanhat projektit ennallaan (ei uusia pakollisia kenttiä)
r.sav=3;r2.sav=9;r3.sav='x';r4.sav=-1;KK.repair(P);
A.strictEqual(r.sav,3);A.ok(!('sav' in r2)&&!('sav' in r3)&&!('sav' in r4),'väärä sävy pois');
var Q=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(Q.b[r.id].sav,3);A.strictEqual(KK.nodeOf(Q,wn.id).g,rn.id,'jäsenyys säilyy');
A.strictEqual(KK.VER,9,'tallennusversio 9 (jonon 12g)');

// Kopioi ja liitä: ryhmä sisältöineen
var clip=KK.copyNodes(P,[rn.id]);A.ok(clip.n.length>=8,'ryhmä ja sen sisältö: '+clip.n.length);
var ids=KK.pasteNodes(P,clip,600,0);A.strictEqual(ids.length,clip.n.length);
var nr=ids.map(function(id){return KK.nodeOf(P,id);}).filter(function(n){return P.b[n.p].k==='ryhma'&&!n.g;})[0];A.ok(nr,'liitetty ryhmä ylimmällä tasolla');
A.ok(ids.some(function(id){return KK.nodeOf(P,id).g===nr.id;}),'liitetty sisältö uudessa ryhmässä');

// Poisto jättää sisällön: suorat jäsenet siirtyvät ryhmän paikalle (ylimmälle tasolle tai ylempään ryhmään)
KK.removeBlock(P,r2.id);KK.removeBlock(P,r.id);
A.ok(!P.b[r.id],'ryhmä poistettu');A.strictEqual(wn.g,'','ikkuna jäi');A.strictEqual(chn.g,'','ketju jäi');A.ok(P.b[c.id]&&P.b[k.id],'palikat jäivät');
A.strictEqual(V(w.id),true,'ikkuna laskee edelleen');A.strictEqual(KK.chainOfNode(P,ajn),ch,'ketju ennallaan');
console.log('ok ryhmä');
