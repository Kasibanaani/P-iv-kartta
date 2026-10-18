// Jonon 15d (F41/F37, suunnitelmat 25 kohdat 3.4 ja 8, 21 kohdat 3–5): Joukko-palikka (laji pjoukko). Yksi per joukko, nimi #joukko,
// ei viitettä; Ota mukaan (laji, näkymä, kerros, ehto jäsen…), Vain jos, pois suljetut (jex), säännöt jäsenille (jsr) ja nuoli
// Joukon kohtaan. Etusija (kartoitus 8, U1): Vain jos > oma kuuluu kun > Lisää/Poista joukosta > tagi tai Ota mukaan. Sekajoukko (U2),
// kiinteät kohdat (U3), elinkaari (U5), jäsen varattu, pikatiet (kartoitus 7, U6), tallennusversio 11 ja lukituskuva.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,18,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(m){C.last=m;},nav:function(){}};
function N(P,b,x,y){return KK.addNode(P,b.id,x||0,y||0,'');}
function E(P){return KK.Ev(P,C);}
function V(P,b){return E(P).val(b.id);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}
function F(P,s){return KK.kaavaToIds(P,s);}
function ev(P,s){return E(P).kaava(F(P,s));}
A.ok(KK.VER>=11,'tallennusversio vähintään 11');

var P=KK.newProject('joukko');
function M(nm,x,y,k){var b=KK.addBlock(P,k||'muoto',{nm:nm,x:x,y:y,w:40,h:40});return b;}
var m1=M('Kolikko 1',10,100),m2=M('Kolikko 2',200,700),m3=M('Kolikko 3',400,300),t1=M('Teksti',20,20,'nayta');
var arv=KK.addBlock(P,'arvo',{nm:'Pisteet',v:'3'});N(P,arv);
var J=KK.jkLuo(P,'kolikot');var pj=KK.addBlock(P,'pjoukko',{jj:J});var pjn=N(P,pj,500,0);KK.repair(P);
A.strictEqual(pj.nm,'#kolikot','nimi on joukon nimi');A.strictEqual(pj.vt,'','ei omaa viitettä');A.strictEqual(KK.jkPjOf(P,J),pj.id);
A.ok(!KK.omat(pj).some(function(e){return e.p==='joukot';}),'Joukko-palikalla ei joukot-ominaisuutta');
A.deepStrictEqual(KK.ports(pj).ins.map(function(x){return x.p;}),['nk','hk','vr','dx','dy'],'kiinteät kohdat (U3)');
A.strictEqual(V(P,pj),0,'tyhjä joukko');A.strictEqual(ev(P,'#kolikot'),0);

// Ota mukaan: laji. Myöhemmin tehty palikka liittyy heti.
pj.otl='muoto';KK.repair(P);A.strictEqual(V(P,pj),3);A.strictEqual(E(P).prop(pj.id,'jäsenet'),'Kolikko 1, Kolikko 2, Kolikko 3');
var m4=M('Kolikko 4',600,50);KK.repair(P);A.strictEqual(ev(P,'#kolikot'),4,'uusi Muoto liittyy');A.strictEqual(E(P).prop(m4.id,'joukot'),'kolikot');
A.strictEqual(E(P).jkInfo(J).why[m1.id].t,'ota');
// Ehto jäsen…: sekajoukko (U2) ei kaadu, puuttuva ominaisuus ei päde
pj.otl='';pj.otf=F(P,'jäsen.y > 200');KK.repair(P);var inf=E(P).jkInfo(J);A.ok(!KK.isErr(inf),JSON.stringify(inf));
A.deepStrictEqual(inf.ms,[m2.id,m3.id],'vain y > 200, Arvo ei päde');A.strictEqual(inf.why[arv.id].t,'otaei');A.ok(/ei ole ominaisuutta \.y/.test(inf.why[arv.id].pu),inf.why[arv.id].pu);
pj.otf=F(P,'jäsen.y > puuttuu');KK.repair(P);A.ok(KK.isErr(V(P,pj)),'katkennut viite on joukon virhe');pj.otf=F(P,'jäsen.y > 200');
// Näkymä ja kerros
P.views.push({id:'v2',n:'Toinen'});var m5=M('Muualla',0,900);m5.v='v2';pj.otl='muoto';pj.otf='';pj.otv='v2';KK.repair(P);A.deepStrictEqual(E(P).jkJasenet(J),[m5.id]);
delete pj.otv;pj.otf=F(P,'jäsen.y > 200');KK.repair(P);

// Tagi + Vain jos (rajaa kaikkia, myös tagilla tulleita) > ...
m1.jkt=[J];KK.repair(P);A.deepStrictEqual(E(P).jkJasenet(J),[m1.id,m2.id,m3.id,m5.id],'tagi lisää');
pj.vjf=F(P,'jäsen.x < 300');KK.repair(P);var i2=E(P).jkInfo(J);A.deepStrictEqual(i2.ms,[m1.id,m2.id,m5.id]);A.strictEqual(i2.why[m3.id].t,'vain','Vain jos ei päde');
var t1x=KK.addBlock(P,'arvo',{nm:'Tagattu arvo',v:'1'});N(P,t1x);t1x.jkt=[J];KK.repair(P);i2=E(P).jkInfo(J);A.ok(!KK.isErr(i2));A.strictEqual(i2.why[t1x.id].t,'vain','arvolla ei x:ää → Vain jos ei päde');
delete t1x.jkt;delete pj.vjf;KK.repair(P);
// Pois suljetut koskevat Ota mukaan -jäseniä, ei tagia
pj.jex=[m2.id,m1.id];KK.repair(P);var i3=E(P).jkInfo(J);A.deepStrictEqual(i3.ms,[m1.id,m3.id,m5.id]);A.strictEqual(i3.why[m2.id].t,'pois');
// Lisää / Poista joukosta toimii myös sääntöjoukolle (U1); kuuluu kun -nuoli voittaa toiminnon; Vain jos voittaa kaiken
function tee(props){var x=KK.addBlock(P,'tee',props);N(P,x);KK.repair(P);return x;}
var poi=tee({do:'joukosta',o:m3.id,jo:J});KK.runAction(P,poi.id,C);A.deepStrictEqual(E(P).jkJasenet(J),[m1.id,m5.id],'Poista joukosta sääntöjäsenelle');
var lis=tee({do:'joukkoon',o:m2.id,jo:J});KK.runAction(P,lis.id,C);A.deepStrictEqual(E(P).jkJasenet(J),[m1.id,m2.id,m5.id],'Lisää joukkoon voittaa pois suljetun');
var pal=tee({do:'palauta',o:m3.id});KK.runAction(P,pal.id,C);A.ok(E(P).jkJasenet(J).indexOf(m3.id)>=0,'Palauta perusarvo palaa perusjäsenyyteen');
var ei=KK.addBlock(P,'arvo',{nm:'Ei',v:'ei'});var ein=N(P,ei);m1.jkk=[J];KK.repair(P);KK.addLink(P,ein.id,'v',KK.nodesOfBlock(P,m1.id)[0]?KK.nodesOfBlock(P,m1.id)[0].id:N(P,m1).id,'jk_'+J);KK.repair(P);
A.ok(E(P).jkJasenet(J).indexOf(m1.id)<0,'oma kuuluu kun -nuoli');
pj.vjf=F(P,'jäsen.x < 100');KK.repair(P);A.ok(E(P).jkJasenet(J).indexOf(m2.id)<0,'Vain jos voittaa Lisää joukkoon');delete pj.vjf;
delete P.st['jk:'+J];delete pj.jex;KK.repair(P);

// Säännöt jäsenille: näkyy = jäsen.y < 600; oma ohjaus voittaa; jäsen ilman kohtaa ohitetaan
pj.otf='';pj.jsr=[{p:'nk',f:F(P,'jäsen.y < 600')}];KK.repair(P);var e=E(P);
A.strictEqual(e.visible(m3.id),true);A.strictEqual(e.visible(m2.id),false,'sääntö piilottaa');A.strictEqual(e.jkCtl(m2.id,'nk').how,'sääntö');
var kyl=KK.addBlock(P,'arvo',{nm:'Kyllä',v:'kyllä'});var kyn=N(P,kyl);var m2n=N(P,m2);KK.addLink(P,kyn.id,'v',m2n.id,'nk');KK.repair(P);
A.strictEqual(E(P).visible(m2.id),true,'jäsenen oma nuoli voittaa joukon säännön');
// Nuoli Joukon kohtaan = sama ohjaus kaikille (harmaana kun)
KK.addLink(P,kyn.id,'v',pjn.id,'hk');KK.repair(P);e=E(P);A.strictEqual(e.greyed(m3.id),true);A.strictEqual(e.state(m4.id),'harmaa');A.strictEqual(e.jkCtl(m3.id,'hk').how,'nuoli');
// Ominaisuus x säännöllä: etusija oma nuoli > joukko > toiminto > perusarvo
pj.jsr.push({p:'o_x',f:F(P,'jäsen.y / 10')});KK.repair(P);e=E(P);A.strictEqual(e.omi(m3.id,'x'),30);A.strictEqual(e.omSrc(m3.id,KK.omFind(m3,'x')),'joukko');
A.ok(KK.jkVoi(P,m3)&&KK.omActive(P,m3,'x'),'pikatie tietää joukon ohjauksen (U6)');A.ok(!KK.omActive(P,arv,'x'));
KK.setOmi(P,m3.id,'x',99);A.strictEqual(E(P).omi(m3.id,'x'),30,'joukon sääntö voittaa toiminnon');
A.strictEqual(KK.rectNow(P,E(P),m3).x,30,'suorakulmio käyttää joukon ohjausta');
pj.jsr.push({p:'dx',f:F(P,'5')});KK.repair(P);A.strictEqual(KK.rectNow(P,E(P),m3).x,35,'siirto x säännöstä');
// Kaksi joukkoa samaan ominaisuuteen: ensimmäinen voittaa, ristiriita näkyy
var J2=KK.jkLuo(P,'muut');var pj2=KK.addBlock(P,'pjoukko',{jj:J2,otl:'muoto',jsr:[{p:'o_x',f:F(P,'1')}]});N(P,pj2);KK.repair(P);
var c3=E(P).jkCtl(m3.id,'o_x');A.strictEqual(c3.pj,pj.id);A.deepStrictEqual(c3.muut,[pj2.id]);
// Kehä ei jumita: sääntö lukee omaa ohjattavaansa
pj2.jsr=[{p:'o_y',f:F(P,'jäsen.y + 1')}];KK.repair(P);var cy=E(P).omi(m3.id,'y');A.ok(typeof cy==='number'||KK.isErr(cy),'kehä palaa');
KK.removeBlock(P,pj2.id);KK.repair(P);A.ok(KK.jkFind(P,'muut'),'palikan poisto jättää joukon (U5)');

// jäsen on varattu: kaavassa muualla virhe, viitteeksi ei käy, vanha viite saa uuden
var kj=K(P,'jäsen.x + 1');A.ok(/vain Joukko-palikan kentissä/.test(V(P,kj).err),JSON.stringify(V(P,kj)));
A.ok(/varattu/.test(KK.setVt(P,arv.id,'jäsen')));var raw=JSON.parse(JSON.stringify(P));raw.b[arv.id].vt='jäsen';raw.b[arv.id].vtSet=true;var R=KK.repair(raw);A.notStrictEqual(R.b[arv.id].vt,'jäsen');

// Nimeäminen kummasta tahansa, joukon poisto vie palikan, toinen saman joukon palikka saa oman joukon
KK.setName(P,pj.id,'#raha');A.strictEqual(KK.jkNm(P,J),'raha');A.strictEqual(pj.nm,'#raha');KK.jkNimea(P,J,'kolikot');A.strictEqual(pj.nm,'#kolikot');
var dup=KK.addBlock(P,'pjoukko',{jj:J});N(P,dup);KK.repair(P);A.notStrictEqual(dup.jj,J);A.strictEqual(dup.nm,'#kolikot_2');
var cl=KK.copyNodes(P,[pjn.id]),made=KK.pasteNodes(P,cl,20,20);var cp=P.b[KK.nodeOf(P,made[0]).p];A.strictEqual(cp.k,'pjoukko');A.notStrictEqual(cp.jj,J);A.strictEqual(cp.jsr.length,pj.jsr.length,'kopio vie säännöt');
KK.jkPoista(P,dup.jj);A.ok(!P.b[dup.id],'joukon poisto poistaa Joukko-palikan');
var tagit=m1.jkt.slice();KK.removeBlock(P,pj.id);KK.repair(P);A.ok(KK.jkFind(P,'kolikot'));A.deepStrictEqual(m1.jkt,tagit,'tagit jäävät');A.strictEqual(E(P).visible(m2.id),true);

// Tallennus: vanha (versio 10) aukeaa, versio nousee, version 10 lukituskuva jatkaa versiona 11
var D=KK.repairData({app:'appiappi',ver:10,projects:[JSON.parse(JSON.stringify(KK.newProject('vanha')))],cur:''});A.strictEqual(D.ver,KK.VER);
var L=KK.newProject('lukko');var k=KK.addBlock(L,'ketju',{nm:'Ketju',lk:2});var wn=KK.addNode(L,k.id,0,0);var las=KK.addBlock(L,'muisti',{nm:'Laskuri'});KK.addNode(L,las.id,-400,0);
var s1=KK.addBlock(L,'ajastin',{kesto:'10',yks:'s'}),n1=KK.addNode(L,s1.id,0,60,wn.id);var s2=KK.addBlock(L,'tee',{do:'aseta',o:las.id,v:'5'}),n2=KK.addNode(L,s2.id,0,120,wn.id);KK.addLink(L,n1.id,'e',n2.id,'e');
KK.repair(L);KK.chainStart(L,k.id,C);A.strictEqual(L.st[k.id].run,true);var JL=JSON.parse(JSON.stringify(L));JL.st[k.id].snap.ver=10;
var L2=KK.repair(JL);A.strictEqual(L2.st[k.id].snap.ver,KK.VER,'version 10 lukituskuva nousi nykyiseen');A.strictEqual(L2.st[k.id].run,true,'lukittu ketju jatkaa');
var bad=KK.repair({id:'x',name:'x',seq:3,views:[{id:'v1',n:'N'}],b:{b1:{id:'b1',k:'pjoukko',nm:'#ei',jj:'j9',jsr:[{p:'zz',f:'1'},{p:'nk',f:'kyllä'},{p:'nk',f:'ei'}],jex:['b77'],otl:'eiole',otv:'v9'}},lg:{n:[{id:'n1',p:'b1',x:0,y:0,g:''}],l:[]},deco:[],st:{}});
var bb=bad.b.b1;A.ok(bad.jkr[bb.jj],'puuttuva joukko tehdään nimestä');A.strictEqual(bb.nm,'#ei_2','varattu sana ei käy nimeksi');A.deepStrictEqual(bb.jsr,[{p:'nk',f:'kyllä'}]);A.ok(!bb.jex&&!bb.otl&&!bb.otv);

// Keveys: ilman Joukko-palikkaa jkVoi on heti epätosi; 30 liikkuvaa ohjattua jäsentä mahtuu kuvaan
var H=KK.newProject('keveys'),hs=[];var HJ=KK.jkLuo(H,'kaikki');for(var i=0;i<300;i++){var hb=KK.addBlock(H,'muoto',{nm:'s'+i,x:i,y:i,w:10,h:10});hs.push(hb);if(i<30)hb.jkt=[HJ];}
KK.repair(H);A.ok(!KK.jkVoi(H,hs[0]),'ei Joukko-palikkaa = ei ohjausta');
var hp=KK.addBlock(H,'pjoukko',{jj:HJ,jsr:[{p:'nk',f:F(H,'jäsen.x < 20')},{p:'dx',f:F(H,'jäsen.y / 2')}]});N(H,hp);KK.repair(H);
A.ok(KK.jkVoi(H,hs[0])&&!KK.jkVoi(H,hs[200]),'vain ehdokkaat');
var t0=Date.now();for(var r=0;r<60;r++)KK.omBatch(function(){var he=KK.Ev(H,C);Object.keys(H.b).forEach(function(id){if(H.b[id].k==='muoto'){KK.rectNow(H,he,H.b[id]);he.visible(id);}});});
var dt=(Date.now()-t0)/60;A.ok(dt<8,'kuva '+dt.toFixed(2)+' ms');A.strictEqual(KK.rectNow(H,E(H),hs[1]).x,1+0.5,'siirto x jäsenelle');
console.log('logiikka_84_joukko_palikka ok ('+dt.toFixed(2)+' ms/kuva)');
