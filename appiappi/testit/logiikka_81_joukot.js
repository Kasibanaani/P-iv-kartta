// Jonon 15c (F41, suunnitelma 25 kohdat 3.1–3.4 ja 7): joukot tageina. Tunnus-kenttä @viite #joukko, rekisteri P.jkr ja tagit
// b.jkt tunnisteina (nimen vaihto ei riko), {%id} tekstissä ja kaavassa, koosteet #x.summa ym., #x.<ominaisuus>.<kooste>,
// summa(#x) → #x.summa, kuuluu #x kun (jk_<id>), Lisää joukkoon / Poista joukosta, Toiminto kohteena #x, joukot-ominaisuus,
// kehä, poisto ja vaikutus, kopio toiseen projektiin ja presetti, tallennusversio 10 ja version 9 lukituskuva.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,18,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(m){C.last=m;},nav:function(){}};
function N(P,b,x,y){return KK.addNode(P,b.id,x||0,y||0,'');}
function E(P){return KK.Ev(P,C);}
function V(P,b){return E(P).val(b.id);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}
A.ok(KK.VER>=10,'tallennusversio vähintään 10');

// Tunnus-kentän luku
var r=KK.tunnusLue('@uni #Unipisteet #terveys #unipisteet');A.strictEqual(r.vt,'uni');A.deepStrictEqual(r.tags,['unipisteet','terveys']);A.strictEqual(r.err,'');
A.strictEqual(KK.tunnusLue('uni #a').vt,'uni','paljas sana = viite (U3)');A.strictEqual(KK.tunnusLue('§uni').vt,'uni');A.strictEqual(KK.tunnusLue('{uni} #a⚡').tags[0],'a','⚡ ohitetaan');
A.strictEqual(KK.tunnusLue('#a #b').vt,null,'ei viitettä = viite ennallaan');
A.ok(/Yksi viite/.test(KK.tunnusLue('@uni @toinen').err));A.ok(/numerolla/.test(KK.tunnusLue('@uni #1x').err));A.ok(/nimi/.test(KK.tunnusLue('#').err));

var P=KK.newProject('joukot');
var a=KK.addBlock(P,'arvo',{nm:'Pituus',v:'40'});N(P,a);
var b=KK.addBlock(P,'arvo',{nm:'Laatu',v:'30'});N(P,b);
var c=KK.addBlock(P,'arvo',{nm:'Säännöllisyys',v:'15'});N(P,c);
var t=KK.addBlock(P,'arvo',{nm:'Teksti',v:'moi'});N(P,t);
KK.repair(P);
A.strictEqual(KK.setTunnus(P,a.id,'@pituus_p #unipisteet #terveys'),'');A.strictEqual(a.vt,'pituus_p');A.strictEqual(a.vtSet,true);
A.strictEqual(KK.setTunnus(P,b.id,'#UniPisteet'),'');A.strictEqual(b.vt,'laatu','viite ennallaan, kun @ puuttuu');
A.strictEqual(KK.setTunnus(P,c.id,'saannollisyys #unipisteet'),'');A.strictEqual(c.vt,'saannollisyys');
var J=KK.jkFind(P,'unipisteet'),T=KK.jkFind(P,'terveys');A.ok(/^j\d+$/.test(J)&&/^j\d+$/.test(T)&&J!==T,'joukot rekisterissä tunnisteina');
A.deepStrictEqual(a.jkt,[J,T]);A.deepStrictEqual(b.jkt,[J]);A.deepStrictEqual(KK.jkList(P),[J,T]);
A.strictEqual(KK.tunnusTeksti(P,a,'@'),'@pituus_p #unipisteet #terveys');A.strictEqual(KK.tunnusTeksti(P,a,'{'),'pituus_p #unipisteet #terveys','{ }-tavalla viite ilman merkkiä');
A.ok(/varattu/.test(KK.tunnusVirhe(P,a.id,'@jos #x')));A.ok(/käytössä/.test(KK.tunnusVirhe(P,a.id,'@laatu')));A.strictEqual(KK.tunnusVirhe(P,a.id,'@pituus_p #uusi'),'');
A.ok(!KK.jkFind(P,'uusi'),'tarkistus ei luo joukkoa');A.ok(/Yksi viite/.test(KK.setTunnus(P,a.id,'@x @y')));A.deepStrictEqual(a.jkt,[J,T],'virhe ei muuta');
KK.repair(P);

// Kaava: #joukko = jäseniä, koosteet, polku ominaisuuteen, summa(#x) → #x.summa
function ev(s){return V(P,K(P,s));}
function tx(s){return KK.kaavaToText(P,K(P,s).f);}
A.strictEqual(ev('#unipisteet'),3);A.strictEqual(ev('#unipisteet.summa'),85);A.strictEqual(ev('#unipisteet.keskiarvo'),28.333333333);
A.strictEqual(ev('#unipisteet.suurin'),40);A.strictEqual(ev('#unipisteet.pienin'),15);A.strictEqual(ev('#unipisteet.jäseniä'),3);A.strictEqual(ev('#unipisteet.havaintoja'),3);
A.strictEqual(ev('#unipisteet.jäsenet'),'Pituus, Laatu, Säännöllisyys');A.strictEqual(ev('#unipisteet.arvot'),'40, 30, 15');A.strictEqual(ev('#unipisteet.täydellinen'),true);
A.strictEqual(ev('#UNIPISTEET.summa > 80'),true,'kirjainkoolla ei väliä');A.strictEqual(ev('jos (#unipisteet.summa > 80) "hyvä" muuten "huono"'),'hyvä');
A.ok(Math.abs(ev('(#unipisteet.summa - 5) / #unipisteet')-80/3)<1e-6,'sulut ja joukko');
A.strictEqual(KK.kaavaToIds(P,'#unipisteet.summa'),'{%'+J+'}.summa','tallennus {%id}.kooste');
A.strictEqual(tx('summa(#unipisteet) + keskiarvo( #terveys )'),'#unipisteet.summa + #terveys.keskiarvo','summa(#x) kääntyy kirjoitettaessa');
A.strictEqual(tx('"summa(#unipisteet)"'),'"summa(#unipisteet)"','lainausmerkeissä ei käänny');
// Tekstissä #joukko.kooste kaikilla viittaustavoilla; tuntematon #sana jää tekstiksi, ## = merkki
var nay=KK.addBlock(P,'nayta',{nm:'Näyttö'});KK.repair(P);
['@','§','{'].forEach(function(tp){
  nay.tx=KK.toIds(P,'Unipisteet: #unipisteet.summa (#unipisteet jäsentä) #tuntematon ##unipisteet',tp);
  A.strictEqual(nay.tx,'Unipisteet: {%'+J+'.summa} ({%'+J+'} jäsentä) #tuntematon #unipisteet',tp+': tallennus');
  A.strictEqual(E(P).text(nay.id),'Unipisteet: 85 (3 jäsentä) #tuntematon #unipisteet',tp+': arvo');
  A.strictEqual(KK.toNames(P,nay.tx,tp),'Unipisteet: #unipisteet.summa (#unipisteet jäsentä) #tuntematon ##unipisteet',tp+': näyttö');});
nay.tx=KK.toIds(P,'#unipisteetx #unipisteet:n',"@");A.strictEqual(nay.tx,'#unipisteetx {%'+J+'}:n','pidempi sana ei ole joukko');
A.strictEqual(KK.toNames(P,'{%'+J+'}a','@'),'{%unipisteet}a','perässä kirjain: aaltosulkeet');A.strictEqual(KK.toIds(P,'{%unipisteet}a','@'),'{%'+J+'}a');
A.strictEqual(KK.toIds(P,'#unipisteet'),'#unipisteet','tallennetun tekstin korjaus (ilman tapaa) ei muuta kirjaimellista #sanaa');
nay.tx=KK.toIds(P,'@pituus_p ja #terveys.jäsenet','@');A.strictEqual(E(P).text(nay.id),'40 ja Pituus');

// Nimen vaihto ei riko (A9)
var kS=K(P,'#unipisteet.summa');A.strictEqual(KK.jkNimea(P,J,'#Uni'),'');A.strictEqual(KK.jkNm(P,J),'uni');
A.strictEqual(KK.kaavaToText(P,kS.f),'#uni.summa');A.strictEqual(V(P,kS),85);A.strictEqual(KK.toNames(P,nay.tx.replace('{%'+T,'{%'+J),'@'),'@pituus_p ja #uni.jäsenet');
A.ok(/olemassa/.test(KK.jkNimea(P,J,'terveys')));A.ok(/numerolla/.test(KK.jkNimea(P,J,'1a')));KK.jkNimea(P,J,'unipisteet');

// Jäsenten ominaisuus ja kooste; tekstit ja tyhjät ohitetaan; virhe estää tuloksen
var s1=KK.addBlock(P,'saadin',{nm:'S1',start:2});var s2=KK.addBlock(P,'saadin',{nm:'S2',start:5,x:100});KK.repair(P);
KK.setTunnus(P,s1.id,'#kolikot');KK.setTunnus(P,s2.id,'#kolikot');KK.setTunnus(P,t.id,'#kolikot');var KJ=KK.jkFind(P,'kolikot');KK.repair(P);
A.strictEqual(ev('#kolikot.summa'),7,'teksti ohitetaan');A.strictEqual(ev('#kolikot.havaintoja'),3);A.strictEqual(ev('#kolikot.arvot'),'moi, 2, 5','palikoiden järjestyksessä');
var exT=ev('#kolikot.x.pienin');A.ok(KK.isErr(exT)&&/jäsenellä ”Teksti”.*vain näkymän/.test(exT.err),'puuttuva ominaisuus jäsenellä: '+(exT&&exT.err));KK.setTunnus(P,t.id,'');KK.repair(P);
s1.x=10;s2.x=30;A.strictEqual(ev('#kolikot.x.pienin'),10);A.strictEqual(ev('#kolikot.x.suurin'),30);
var ex=ev('#kolikot.x');A.ok(KK.isErr(ex)&&/valitse kooste/.test(ex.err),'polku ilman koostetta: '+(ex&&ex.err));
A.strictEqual(ev('#kolikot.leveys.summa'),s1.w+s2.w);
var ex3=ev('#eiole.summa');A.ok(KK.isErr(ex3)&&/ei joukkoa: #eiole/.test(ex3.err));A.deepStrictEqual(KK.kaavaJkMiss(K(P,'#eiole + #toinen').f),['eiole','toinen']);
var kM=K(P,'#myohemmin');A.ok(KK.isErr(V(P,kM)));var mx=KK.addBlock(P,'arvo',{nm:'Mx',v:'1'});N(P,mx);KK.setTunnus(P,mx.id,'#myohemmin');KK.repair(P);
A.strictEqual(V(P,kM),1,'tuntematon #nimi löytyy, kun joukko tehdään');
var tyh=KK.newProject('t');var tb=KK.addBlock(tyh,'arvo',{nm:'A'});N(tyh,tb);KK.setTunnus(tyh,tb.id,'#tyhja');KK.setTunnus(tyh,tb.id,'');KK.repair(tyh);
A.strictEqual(V(tyh,K(tyh,'#tyhja.summa')),0,'viimeinen jäsen pois: joukko jää, summa 0');A.strictEqual(V(tyh,K(tyh,'#tyhja')),0);A.ok(KK.isMiss(V(tyh,K(tyh,'#tyhja.keskiarvo'))));

// joukot-ominaisuus ja Tunnus
A.strictEqual(ev('pituus_p.joukot'),'unipisteet, terveys');A.strictEqual(ev('pituus_p.joukot sisältää "terveys"'),true);A.strictEqual(ev('mx.joukot'),'myohemmin');
A.ok(KK.omat(a).some(function(e){return e.n==='joukot'&&e.calc&&!e.o;}),'joukot luettava, ei ohjattava');

// Kuuluu #x kun: ehdollinen jäsenyys nuolella (kaava tai vertailu)
a.jkk=[T];KK.repair(P);A.ok(KK.port(a,'ins','jk_'+T),'kohta jk_<id>');A.strictEqual(KK.port(a,'ins','jk_'+T).j,T);
var ehto=K(P,'pituus_p > 50');var en=KK.nodesOfBlock(P,ehto.id)[0],an=KK.nodesOfBlock(P,a.id)[0];A.ok(KK.addLink(P,en.id,'v',an.id,'jk_'+T));KK.repair(P);
A.ok(KK.jkEhto(P,a.id,T));A.strictEqual(KK.tunnusTeksti(P,a,'@'),'@pituus_p #unipisteet #terveys⚡');
A.strictEqual(ev('#terveys'),0,'ehto ei päde');A.strictEqual(ev('pituus_p.joukot'),'unipisteet');a.v='60';A.strictEqual(ev('#terveys'),1,'ehto pätee');
// tagin poisto poistaa kohdan ja nuolen
KK.setTunnus(P,a.id,'@pituus_p #unipisteet');KK.repair(P);A.ok(!a.jkk&&!KK.jkEhto(P,a.id,T),'kohta ja nuoli pois tagin mukana');a.v='40';
// Kehä: jäsenyyden ehto lukee joukon koostetta
KK.setTunnus(P,b.id,'#unipisteet #kehä');var KH=KK.jkFind(P,'kehä');b.jkk=[KH];KK.repair(P);var kk=K(P,'#kehä.summa < 100');
A.ok(KK.addLink(P,KK.nodesOfBlock(P,kk.id)[0].id,'v',KK.nodesOfBlock(P,b.id)[0].id,'jk_'+KH));KK.repair(P);
var kv=ev('#kehä');A.ok(KK.isErr(kv)&&/kehä/.test(kv.err),'kehä näkyy virheenä: '+(kv&&kv.err));KK.setTunnus(P,b.id,'#unipisteet');KK.repair(P);

// Lisää joukkoon / Poista joukosta (käyttötieto) ja etusija: ohjattu > toiminto > tagi
function tee(props){var x=KK.addBlock(P,'tee',props);N(P,x);KK.repair(P);return x;}
var lis=tee({do:'joukkoon',o:t.id,jo:J}),poi=tee({do:'joukosta',o:a.id,jo:J});
A.ok(/Lisää joukkoon #unipisteet: Teksti/.test(KK.descAct(P,lis.id)),KK.descAct(P,lis.id));
KK.runAction(P,lis.id,C);A.strictEqual(ev('#unipisteet'),4);A.strictEqual(P.st['jk:'+J][t.id],true);A.ok(!t.jkt,'tagit eivät muutu');
KK.runAction(P,poi.id,C);A.strictEqual(ev('#unipisteet.jäsenet'),'Laatu, Säännöllisyys, Teksti');A.strictEqual(ev('pituus_p.joukot'),'',"poistettu jäsen");
var pal=tee({do:'palauta',o:a.id});KK.runAction(P,pal.id,C);A.strictEqual(ev('#unipisteet'),4,'Palauta perusarvo palauttaa tagin');
// Toiminto kohteena #joukko: jokaiselle jäsenelle, sitten kerran
var nl=0;var asx=tee({do:'aseta',oj:KJ,om:'x',v:'7'});A.strictEqual(asx.o,'');A.ok(/#kolikot \(jokainen jäsen\)/.test(KK.descAct(P,asx.id)),KK.descAct(P,asx.id));
var kn=tee({do:'lisaa',o:s1.id});var asn=KK.nodesOfBlock(P,asx.id)[0],knn=KK.nodesOfBlock(P,kn.id)[0];KK.addLink(P,asn.id,'e',knn.id,'e');KK.repair(P);
var ax=KK.addBlock(P,'arvo',{nm:'Ax',v:'5'});N(P,ax);ax.jkt=[KJ];KK.repair(P);
KK.runAction(P,asx.id,C);A.strictEqual(V(P,ax),5,'jäsen ilman x:ää ohitetaan');delete ax.jkt;KK.repair(P);var e2=E(P);A.strictEqual(e2.omi(s1.id,'x'),7);A.strictEqual(e2.omi(s2.id,'x'),7);A.strictEqual(V(P,s1),3,'sitten-tapahtuma kerran (Lisää 1 kerran)');
var lsx=tee({do:'lisaa',oj:KK.jkFind(P,'kolikot')});KK.runAction(P,lsx.id,C);A.strictEqual(V(P,s1),4);A.strictEqual(V(P,s2),6);
var why=KK.why(P,E(P),lsx.id,1,{});A.ok(!/Kohde puuttuu/.test(why.txt),why.txt);

// Joukon poisto: tagit pois; kaava viittaa vielä → #⚠nimi ja virhe; ei viittauksia → pois rekisteristä
var uses=KK.jkUses(P,KJ);A.ok(uses.some(function(u){return u.id===s1.id&&u.how==='tagi';})&&uses.some(function(u){return u.id===asx.id&&u.how==='toiminto';}),'vaikutuslista');
var kK=K(P,'#kolikot.summa');KK.jkPoista(P,KJ);A.ok(!s1.jkt&&!s2.jkt);A.strictEqual(KK.jkReg(P)[KJ].x,1);A.strictEqual(KK.kaavaToText(P,kK.f),'#⚠kolikot.summa');
var kv2=V(P,kK);A.ok(KK.isErr(kv2)&&/poistettu: #kolikot/.test(kv2.err));A.ok(!KK.jkFind(P,'kolikot'));
var asxR=KK.runAction(P,asx.id,C);A.ok(asxR&&/poistettu/.test(asxR.err));
var uk=KK.jkLuo(P,'kolikot');A.ok(uk&&uk!==KJ,'samanniminen uusi ei peri poistettua');
var jaa=KK.jkUses(P,KJ).map(function(u){return P.b[u.id];}).filter(Boolean);A.ok(jaa.length>=3,'viittaajia vielä');
jaa.forEach(function(x){KK.nodesOfBlock(P,x.id).forEach(function(n){KK.removeNode(P,n.id);});});KK.repair(P);A.strictEqual(KK.jkUses(P,KJ).length,0,'ei viittauksia');
A.ok(!KK.jkReg(P)[KJ],'poistettu joukko lähtee, kun viittauksia ei ole');
var tg=KK.addBlock(P,'arvo',{nm:'Tg'});N(P,tg);KK.setTunnus(P,tg.id,'#vainTagi');var TT=KK.jkFind(P,'vainTagi');A.ok(TT);KK.jkPoista(P,TT);A.ok(!tg.jkt);A.ok(!KK.jkReg(P)[TT],'joukko ilman viittauksia poistuu kokonaan');

// Kopio toiseen projektiin ja presetti: joukot nimen mukaan
var ka=K(P,'#unipisteet.summa + 1');a.jkt=[J];
var clip=KK.copyNodes(P,[KK.nodesOfBlock(P,ka.id)[0].id,KK.nodesOfBlock(P,mx.id)[0].id]);
var Q=KK.newProject('toinen');var qo=KK.addBlock(Q,'arvo',{nm:'Q'});N(Q,qo);KK.setTunnus(Q,qo.id,'#myohemmin');KK.repair(Q);var QM=KK.jkFind(Q,'myohemmin');
var made=KK.pasteNodes(Q,clip,0,0);A.strictEqual(made.length,2);var qk=null,qm=null;Object.keys(Q.b).forEach(function(i){if(Q.b[i].k==='kaava')qk=Q.b[i];if(Q.b[i].k==='arvo'&&i!==qo.id)qm=Q.b[i];});
A.strictEqual(KK.kaavaToText(Q,qk.f),'#unipisteet.summa + 1','uusi joukko luotiin nimellä');A.deepStrictEqual(qm.jkt,[QM],'olemassa oleva joukko nimen mukaan');
A.strictEqual(V(Q,qk),1,'#unipisteet toisessa projektissa: tyhjä joukko → summa 0 + 1');
var same=KK.pasteNodes(P,KK.copyNodes(P,[KK.nodesOfBlock(P,mx.id)[0].id]),10,10);var mx2=P.b[KK.nodeOf(P,same[0]).p];A.notStrictEqual(mx2.id,mx.id);A.deepStrictEqual(mx2.jkt,mx.jkt,'monistettu saa samat tagit');
var pr=KK.presetMake(P,[ka.id,b.id],[]);var Q2=KK.newProject('kolmas');var po=KK.presetPaste(Q2,pr,{});var q2b=null;po.b.forEach(function(i){if(Q2.b[i].nm==='Laatu')q2b=Q2.b[i];});
A.deepStrictEqual(q2b.jkt,[KK.jkFind(Q2,'unipisteet')],'presetti: tagit nimen mukaan');

// Tallennus ja vanha muoto: version 9 tallennus aukeaa, virheelliset kentät pois, version 9 lukituskuva jatkaa
var raw=JSON.parse(JSON.stringify(P));raw.jkr.jx={nm:'Huono nimi!'};raw.jkr.j999999={nm:'unipisteet'};raw.b[a.id].jkt=[J,'jeiole',J];raw.st['jk:jeiole']={};raw.st['jk:'+J]={b1:'x'};
var R=KK.repair(raw);A.ok(!R.jkr.jx&&!R.jkr.j999999,'virheelliset ja tuplanimet pois');A.deepStrictEqual(R.b[a.id].jkt,[J]);A.ok(!R.st['jk:jeiole']&&!R.st['jk:'+J]);A.ok(R.seq>=+J.slice(1));
var D=KK.repairData({app:'appiappi',ver:9,projects:[JSON.parse(JSON.stringify(KK.newProject('vanha')))],cur:''});A.strictEqual(D.ver,KK.VER);A.ok(!D.projects[0].jkr);
var L=KK.newProject('lukko');var lv=KK.addBlock(L,'arvo',{nm:'V',v:'2'});N(L,lv);KK.setTunnus(L,lv.id,'#pisteet');KK.repair(L);
A.ok(KK.lkSnap(L,NOW).jkr&&KK.lkSnap(L,NOW).jkr[KK.jkFind(L,'pisteet')],'lukituskuvassa joukkorekisteri');

// Keveys: tagihakemisto muistetaan ajon ajan, jäsenyys kerran arviointia kohden
var H=KK.newProject('keveys'),hs=[];for(var i=0;i<400;i++){var hb=KK.addBlock(H,'arvo',{nm:'h'+i,v:String(i%7)});N(H,hb);hs.push(hb);}
var HJ=KK.jkLuo(H,'iso');hs.forEach(function(x,i){if(i%2)x.jkt=[HJ];});KK.repair(H);var hk=K(H,'#iso.summa + #iso.keskiarvo + #iso.suurin');
var t0=Date.now();for(var r2=0;r2<200;r2++)KK.omBatch(function(){var e=KK.Ev(H,C);e.val(hk.id);});var dt=Date.now()-t0;
A.ok(dt<1500,'200 arviointia 200 jäsenen joukolla: '+dt+' ms');
var e3=KK.Ev(H,C);A.strictEqual(e3.jkJasenet(HJ),e3.jkJasenet(HJ),'sama luettelo samassa arvioinnissa');A.strictEqual(e3.jkJasenet(HJ).length,200);
KK.omBatch(function(){A.strictEqual(KK.jkIndex(H),KK.jkIndex(H),'hakemisto muistissa ajon ajan');});
console.log('logiikka_81_joukot ok ('+dt+' ms)');
