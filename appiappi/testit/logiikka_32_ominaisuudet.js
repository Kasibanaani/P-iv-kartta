// Pajakone 4: ominaisuusrekisteri. Kaavan palikka.ominaisuus rekisteristä (myös aiemmat aukot: painikkeen kesto ja ajastimen
// jäljellä), ohjattu ominaisuus nuolella/kaavalla (o_<avain>), toiminto ominaisuuteen (Aseta, Lisää, Aseta tila, Vaihda),
// Palauta, etusija ohjattu > asetettu > perusarvo, väri 1–8, valinnat numerolla, käytössä logiikasta, säätimen ja lukukentän
// rajat, monen arvon palikat (listan rivit, aikajanan viimeisin, ikkunan raja ja pätee), ympäristön arvot, repair.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,20,30,15).getTime();
var ENV={w:390,h:844,nakyma:'Koti',nakymaNro:1,tumma:false};
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(n){C.last=n;},env:function(){return ENV;}};
function E(P){return KK.Ev(P,C);}
/* Logiikan palikat ovat olemassa vain kanvaasilla: testissä ne saavat solmun heti (paitsi ketjun palikat ja ne, joille testi tekee solmun itse). */
var _ab=KK.addBlock;KK.addBlock=function(P,k,pr){var b=_ab(P,k,pr);if(KK.K[k].g==='lg'&&!KK.K[k].ch&&['kaava','tee','ketju','ikkuna'].indexOf(k)<0)KK.addNode(P,b.id,-700,Math.random()*3000);return b;};
function kaava(P,f){var k=KK.addBlock(P,'kaava',{});KK.addNode(P,k.id,-400,Math.random()*1000);k.f=KK.kaavaToIds(P,f);return k;}
function V(P,f){return E(P).val(kaava(P,f).id);}
function node(P,b){return KK.nodesOfBlock(P,b.id)[0]||KK.addNode(P,b.id,0,Math.random()*1000);}
/* Avaa ominaisuuden ohjauskohdan ja vie siihen kaavan. */
function drive(P,b,key,f){b.ohk=(b.ohk||[]).concat([key]);var k=kaava(P,f);A.ok(KK.addLink(P,node(P,k).id,'v',node(P,b).id,'o_'+key),'nuoli kohtaan o_'+key);return k;}
function act(P,props){var t=KK.addBlock(P,'tee',props);node(P,t);KK.runAction(P,t.id,C,0);return t;}

// --- Aukot: painikkeen kesto ja ajastimen jäljellä kaavassa ---
var P=KK.newProject('omi');
var nap=KK.addBlock(P,'nappi',{nm:'Nappi',ext:true}),ket=KK.addBlock(P,'ketju'),ketn=KK.addNode(P,ket.id,0,0),aj=KK.addBlock(P,'ajastin',{nm:'Aj'});KK.addNode(P,aj.id,10,40,ketn.id);KK.repair(P);
KK.pressUp(P,nap.id,C,0.5);
A.strictEqual(V(P,'nappi.kesto'),0.5,'painalluksen kesto kaavassa');
A.strictEqual(V(P,'aj.jäljellä'),null,'ajastin ei odota: jäljellä tyhjä');
A.strictEqual(V(P,'aj.käynnissä'),false);
A.ok(/tuntematon ominaisuus \.maku \(palikalla ”Nappi” on: .*leveys/.test(V(P,'nappi.maku').err),'virhe kertoo palikan ominaisuudet');

// --- Ulkomuoto: perusarvo, ohjattu kaavalla, asetettu toiminnolla, Palauta ---
var s=KK.addBlock(P,'saadin',{nm:'Koko',min:0,max:300,start:100});var b=KK.addBlock(P,'nappi',{nm:'Pallo'});b.w=160;b.h=44;b.x=10;b.y=20;KK.repair(P);
A.strictEqual(V(P,'pallo.leveys'),160);A.strictEqual(V(P,'pallo.korkeus'),44);A.strictEqual(V(P,'pallo.x'),10);A.strictEqual(V(P,'pallo.väri'),7,'väri 1–8 (hue 6 → 7)');
A.strictEqual(V(P,'pallo.läpinäkyvyys'),0);A.strictEqual(V(P,'pallo.lapinakyvyys'),0,'nimi ilman ääkkösiä');
A.deepStrictEqual(KK.ports(b).ins.map(function(p){return p.p;}).filter(function(p){return /^o_/.test(p);}),[],'ohjauskohdat vain avattuina');
// asetettu toiminnolla
act(P,{do:'aseta',o:b.id,om:'w',v:'250'});A.strictEqual(E(P).omi(b.id,'w'),250,'Aseta leveys');A.strictEqual(E(P).omSrc(b.id,KK.omFind(b,'w')),'asetettu');
act(P,{do:'lisaa',o:b.id,om:'w',v:'-50'});A.strictEqual(E(P).omi(b.id,'w'),200,'Lisää leveyteen');
act(P,{do:'lisaa',o:b.id,om:'w',v:'-500'});A.strictEqual(E(P).omi(b.id,'w'),8,'leveys ei mene alle 8');
A.strictEqual(b.w,160,'perusarvo ennallaan');
// ohjattu voittaa asetetun
drive(P,b,'w','koko * 2');KK.repair(P);
A.ok(KK.port(b,'ins','o_w'),'avattu kohta');A.strictEqual(KK.port(b,'ins','o_w').n,'leveys');
A.strictEqual(E(P).omi(b.id,'w'),200,'kaava: säädin 100 × 2');A.strictEqual(E(P).omSrc(b.id,KK.omFind(b,'w')),'nuoli');
KK.setVal(P,s.id,150,C);A.strictEqual(E(P).omi(b.id,'w'),300,'seuraa säädintä');
A.strictEqual(V(P,'pallo.leveys'),300,'kaava lukee nykyisen arvon');
// Palauta: asetettu pois, ohjattu jää
act(P,{do:'aseta',o:b.id,om:'h',v:'90'});A.strictEqual(E(P).omi(b.id,'h'),90);
act(P,{do:'palauta',o:b.id,om:'h'});A.strictEqual(E(P).omi(b.id,'h'),44,'Palauta korkeus');
act(P,{do:'aseta',o:b.id,om:'x',v:'5'});act(P,{do:'aseta',o:b.id,om:'y',v:'6'});act(P,{do:'palauta',o:b.id});
A.strictEqual(E(P).omi(b.id,'x'),10);A.strictEqual(E(P).omi(b.id,'y'),20,'Palauta kaikki');A.strictEqual(P.st['o:'+b.id],undefined,'käyttötiedot siivottu');
A.strictEqual(E(P).omi(b.id,'w'),300,'Palauta ei koske ohjattua');
// kehä: leveys kaavasta, joka lukee omaa leveyttään
var c2=KK.addBlock(P,'nappi',{nm:'Kehä'});KK.repair(P);drive(P,c2,'w','kehä.leveys + 1');A.strictEqual(E(P).omiNum(c2.id,'w',0),160,'kehässä näkymä käyttää perusarvoa');
// väri ja hue
act(P,{do:'aseta',o:b.id,om:'vari',v:'2'});A.strictEqual(E(P).hue(b.id),1,'väri 2 → hue 1');act(P,{do:'aseta',o:b.id,om:'vari',v:'99'});A.strictEqual(E(P).hue(b.id),7,'väri rajataan 1–8');
// valinta numerolla ja nimellä
var t=KK.addBlock(P,'nayta',{nm:'Otsikko'});KK.repair(P);act(P,{do:'aseta',o:t.id,om:'koko',v:'4'});A.strictEqual(E(P).omi(t.id,'koko'),'xl');
act(P,{do:'aseta',o:t.id,om:'tas',v:'keski'});A.strictEqual(E(P).omi(t.id,'tas'),'center');act(P,{do:'aseta',o:t.id,om:'tas',v:'vino'});A.strictEqual(E(P).omi(t.id,'tas'),'center','kelvoton ei muuta');
act(P,{do:'vaihda',o:t.id,om:'lih'});A.strictEqual(E(P).omi(t.id,'lih'),true,'Vaihda kyllä/ei-ominaisuus');
act(P,{do:'tila',o:t.id,om:'lih',ti:'ei'});A.strictEqual(E(P).omi(t.id,'lih'),false,'Aseta tila ominaisuuteen');
A.strictEqual(KK.descAct(P,act(P,{do:'aseta',o:b.id,om:'w',v:'20'}).id),'Pallo.leveys = 20');
A.strictEqual(KK.descAct(P,act(P,{do:'palauta',o:b.id}).id),'Palauta Pallo: kaikki ominaisuudet perusarvoon');

// --- Käytössä logiikasta ---
var P2=KK.newProject('kaytossa');var kyt=KK.addBlock(P2,'kytkin',{nm:'Sallittu'}),lu=KK.addBlock(P2,'luku',{nm:'Pisteet'}),pn=KK.addBlock(P2,'nappi',{nm:'Lisää',beh:'kerta'});KK.repair(P2);
var tee=KK.addBlock(P2,'tee',{do:'lisaa',o:lu.id});KK.addLink(P2,node(P2,pn).id,'e',node(P2,tee).id,'e');
drive(P2,tee,'kaytossa','sallittu');
KK.press(P2,pn.id,C);A.strictEqual(E(P2).val(lu.id),0,'toiminto pois käytöstä, kun kytkin ei ole valittu');A.ok(KK.isOff(P2,tee,C));
KK.setVal(P2,kyt.id,true,C);KK.press(P2,pn.id,C);A.strictEqual(E(P2).val(lu.id),1,'käytössä, kun kytkin on valittu');

// --- Säätimen ja lukukentän rajat ---
var P3=KK.newProject('rajat');var sl=KK.addBlock(P3,'saadin',{nm:'Taso',min:0,max:10,start:8}),raja=KK.addBlock(P3,'arvo',{nm:'Katto',v:'5'});
var lk=KK.addBlock(P3,'luku',{nm:'Määrä',start:3,min:'0',max:'4'});KK.repair(P3);
A.strictEqual(E(P3).val(sl.id),8);drive(P3,sl,'max','katto');A.strictEqual(E(P3).val(sl.id),5,'arvo rajataan ohjattuun suurimpaan');
KK.setVal(P3,sl.id,9,C);A.strictEqual(P3.st[sl.id],5,'asetus rajataan ohjattuun suurimpaan');
A.strictEqual(V(P3,'taso.suurin'),5);A.strictEqual(V(P3,'taso.pienin'),0);
KK.setVal(P3,lk.id,9,C);A.strictEqual(E(P3).val(lk.id),4,'lukukentän suurin');KK.setVal(P3,lk.id,-2,C);A.strictEqual(E(P3).val(lk.id),0,'lukukentän pienin');
var lk2=KK.addBlock(P3,'luku',{nm:'Vapaa'});KK.repair(P3);KK.setVal(P3,lk2.id,-50,C);A.strictEqual(E(P3).val(lk2.id),-50,'tyhjät rajat = rajaton');

// --- Monen arvon palikat ---
var P4=KK.newProject('moni');var li=KK.addBlock(P4,'lista',{nm:'Tehtävät',rivit:'Osta maito\nSoita\nSiivoa'}),ai=KK.addBlock(P4,'aika',{nm:'Loki'});KK.repair(P4);
P4.st[li.id]={rows:[{id:'r1',tx:'Osta maito',c:true,d:''},{id:'r2',tx:'Soita',c:false,d:'2026-10-10'},{id:'r3',tx:'Siivoa',c:false,d:'2026-10-20'}]};
A.strictEqual(V(P4,'tehtävät.rivi2'),'Soita');A.strictEqual(V(P4,'tehtävät.rivi1.rastitettu'),true);A.strictEqual(V(P4,'tehtävät.rivi2.rastitettu'),false);
A.deepStrictEqual(V(P4,'tehtävät.rivi3.pvm'),{d:'2026-10-20'});A.strictEqual(V(P4,'tehtävät.rivi9'),null,'puuttuva rivi on tyhjä');
A.strictEqual(V(P4,'tehtävät.myöhässä'),1);A.deepStrictEqual(V(P4,'tehtävät.seuraava'),{d:'2026-10-20'});A.strictEqual(V(P4,'tehtävät.rivejä'),3);
P4.st[ai.id]=[{t:new Date(2026,9,14,9,0).getTime(),tx:'Eilen'},{t:new Date(2026,9,15,8,5).getTime(),tx:'Aamu'}];
A.strictEqual(V(P4,'loki.viimeisin.teksti'),'Aamu');A.strictEqual(V(P4,'loki.viimeisin.aika'),'8.05');A.strictEqual(V(P4,'loki.tänään'),1);
var iw=KK.addBlock(P4,'ikkuna',{nm:'Ehdot',m:'min',n:3}),iwn=KK.addNode(P4,iw.id,0,0);var rs=[1,2,3].map(function(i){var r=KK.addBlock(P4,'ruutu',{nm:'R'+i});KK.addNode(P4,r.id,10,i*50,iwn.id);return r;});
var pa=KK.addBlock(P4,'arvo',{nm:'Puolet',v:'2'});KK.repair(P4);P4.st[rs[0].id]=true;P4.st[rs[1].id]=true;
A.strictEqual(V(P4,'ehdot.pätee'),2);A.strictEqual(V(P4,'ehdot.jäseniä'),3);A.strictEqual(E(P4).val(iw.id),false,'vähintään 3');
drive(P4,iw,'n','puolet');A.strictEqual(E(P4).val(iw.id),true,'vähintään N, N kaavasta');A.strictEqual(V(P4,'ehdot.raja'),2);
var hk=KK.addBlock(P4,'haku',{nm:'Taulu',a:'7',rivit:[{m:'vali',a:'0',b:'5',t:'pieni'},{m:'vali',a:'5',b:'',t:'iso'}]});KK.repair(P4);A.strictEqual(V(P4,'taulu.rivi'),2,'osunut rivi');
var k4=KK.addBlock(P4,'ketju'),k4n=KK.addNode(P4,k4.id,900,0);var mh=KK.addBlock(P4,'monihaara',{nm:'Haarat',a:'3',haarat:[{id:'h1',m:'on',a:'1',nm:'yksi'},{id:'h2',m:'on',a:'3',nm:'kolme'}]});KK.addNode(P4,mh.id,910,40,k4n.id);KK.repair(P4);
A.strictEqual(V(P4,'haarat.haara'),2);A.strictEqual(V(P4,'haarat.haaranimi'),'kolme');

// --- Aika: yksiköt ja Muutos ajassa ---
var P5=KK.newProject('aika');var kes=KK.addBlock(P5,'arvo',{nm:'Kesto',v:'2',yks:'min'}),sek=KK.addBlock(P5,'arvo',{nm:'Sek',v:'3',yks:'s'});KK.repair(P5);
A.strictEqual(E(P5).val(kes.id),120,'2 min on laskuissa 120 s');A.strictEqual(E(P5).val(sek.id),3);
var mu=KK.addBlock(P5,'muutos',{nm:'Liuku',a:0,b:300,kesto:2,yks:'s'});KK.repair(P5);KK.addLink(P5,node(P5,sek).id,'v',node(P5,mu).id,'k');
KK.muutosStart(P5,mu.id,C);NOW+=1500;A.strictEqual(V(P5,'liuku.edistyminen'),0.5,'3 s kestosta 1,5 s');A.strictEqual(V(P5,'liuku.kulunut'),1.5);A.strictEqual(E(P5).val(mu.id),150);
var mu2=KK.addBlock(P5,'muutos',{nm:'Hidas',kesto:'1',yks:'min'});KK.repair(P5);KK.muutosStart(P5,mu2.id,C);NOW+=30000;A.strictEqual(V(P5,'hidas.edistyminen'),0.5,'kesto minuutteina');
var k5=KK.addBlock(P5,'ketju'),k5n=KK.addNode(P5,k5.id,0,0);var at=KK.addBlock(P5,'ajastin',{nm:'Aj',kesto:1,yks:'min'});KK.addNode(P5,at.id,10,40,k5n.id);KK.repair(P5);A.strictEqual(KK.timerMs(P5,at.id,C),60000);
KK.addLink(P5,node(P5,sek).id,'v',node(P5,at).id,'k');A.strictEqual(KK.timerMs(P5,at.id,C),3000,'aika-arvo nuolesta on sekunteja, vaikka ajastimen yksikkö on min');
var lu5=KK.addBlock(P5,'arvo',{nm:'Pelkkä',v:'2'});KK.repair(P5);var at2=KK.addBlock(P5,'ajastin',{nm:'Aj2',kesto:1,yks:'min'});KK.addNode(P5,at2.id,10,140,k5n.id);KK.repair(P5);KK.addLink(P5,node(P5,lu5).id,'v',node(P5,at2).id,'k');
A.strictEqual(KK.timerMs(P5,at2.id,C),120000,'pelkkä luku ajastimen omassa yksikössä');

// --- Kertapainallus: kyllä ↔ ei -vaihto ---
var P6=KK.newProject('vaihto');var kp=KK.addBlock(P6,'nappi',{nm:'Valo',beh:'kerta',kv:'vaihto'}),kp2=KK.addBlock(P6,'nappi',{nm:'Laskuri',beh:'kerta'});KK.repair(P6);
A.ok(KK.isBoolKind(kp));A.ok(!KK.isBoolKind(kp2));A.strictEqual(KK.ports(kp).outs[0].n,'on valittu');A.strictEqual(KK.ports(kp2).outs[0].n,'painalluksia');
A.strictEqual(E(P6).val(kp.id),false);KK.press(P6,kp.id,C);A.strictEqual(E(P6).val(kp.id),true,'ensimmäinen painallus: kyllä');
KK.press(P6,kp.id,C);A.strictEqual(E(P6).val(kp.id),false,'toinen: ei');A.strictEqual(V(P6,'valo.painalluksia'),2,'määrä lasketaan silti');
KK.press(P6,kp2.id,C);KK.press(P6,kp2.id,C);A.strictEqual(E(P6).val(kp2.id),2,'laskeva kertapainallus ennallaan');
act(P6,{do:'tila',o:kp.id,ti:'on'});A.strictEqual(E(P6).val(kp.id),true,'Aseta tila');act(P6,{do:'vaihda',o:kp.id});A.strictEqual(E(P6).val(kp.id),false,'Vaihda');
kp.kv='x';KK.repair(P6);A.strictEqual(kp.kv,undefined);A.strictEqual(P6.st['as:'+kp.id],undefined,'vaihdon tila pois, kun asetus pois');
// VAIN YKSI -ikkuna, jossa valinta poistaa muut, koskee vaihtoa
var P7=KK.newProject('yksi');var w7=KK.addBlock(P7,'ikkuna',{m:'one',pakota:true}),w7n=KK.addNode(P7,w7.id,0,0);
var v1=KK.addBlock(P7,'nappi',{beh:'kerta',kv:'vaihto'}),v2=KK.addBlock(P7,'nappi',{beh:'kerta',kv:'vaihto'});KK.addNode(P7,v1.id,10,40,w7n.id);KK.addNode(P7,v2.id,10,90,w7n.id);KK.repair(P7);
KK.press(P7,v1.id,C);KK.press(P7,v2.id,C);A.strictEqual(E(P7).val(v1.id),false,'toinen valinta poistaa ensimmäisen');A.strictEqual(E(P7).val(v2.id),true);A.strictEqual(P7.st[v1.id],1,'määrä säilyy');

// --- Ympäristö ---
A.strictEqual(V(P,'ruutu.leveys'),390);A.strictEqual(V(P,'ruutu.korkeus'),844);A.strictEqual(V(P,'näkymä'),'Koti');A.strictEqual(V(P,'näkymä.numero'),1);
A.strictEqual(V(P,'tumma'),false);A.strictEqual(V(P,'nyt.tunti'),20);A.strictEqual(V(P,'nyt.minuutti'),30);A.strictEqual(V(P,'nyt.kello'),'20.30');
A.ok(/ruutu.paksuus/.test(V(P,'ruutu.paksuus').err));
var ruutuP=KK.addBlock(P,'luku',{nm:'Ruutu'});KK.repair(P);A.strictEqual(ruutuP.vt,'ruutu2','ympäristön sanat ovat varattuja viitteinä');A.strictEqual(V(P,'ruutu2'),0);A.strictEqual(V(P,'ruutu.leveys'),390);

// --- Siirry: x ja y kaavasta ---
var P8=KK.newProject('siirry');var hx=KK.addBlock(P8,'arvo',{nm:'Hx',v:'120'});var sy=KK.addBlock(P8,'tee',{do:'siirry',x:0,y:0});node(P8,sy);KK.repair(P8);
drive(P8,sy,'x','hx + 30');KK.runAction(P8,sy.id,C,0);A.strictEqual(C.last.x,150,'siirtymän x kaavasta');A.strictEqual(C.last.y,0);

// --- Tokenit ja repair ---
A.strictEqual(KK.kaavaTokens('{#b1}.rivi2.rastitettu').t[0].p,'rivi2.rastitettu','monta pistettä');
A.deepStrictEqual(KK.kaavaTokens('ruutu.leveys').t[0],{t:'kw',w:'ruutu',p:'leveys'});
var P9=KK.newProject('repair');var rb=KK.addBlock(P9,'nappi',{});rb.ohk=['w','eiole','w','teksti'];P9.st['o:'+rb.id]={w:5,maku:1};P9.st['o:b999']={w:1};P9.st['as:'+rb.id]=true;KK.repair(P9);
A.deepStrictEqual(rb.ohk,['w'],'vain ohjattavat, kerran');A.deepStrictEqual(P9.st['o:'+rb.id],{w:5});A.strictEqual(P9.st['o:b999'],undefined);A.strictEqual(P9.st['as:'+rb.id],undefined);
console.log('ok');
