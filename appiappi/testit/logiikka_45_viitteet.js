// Appi-appi 11 (suunnitelma P1a): F01 tekstin ominaisuusviite {palikka.ominaisuus} ja D08 viitatun kohteen poisto
// (vaikutuslista ennen poistoa, katkennut viite säilyy nimineen, Viitevirheet-lista, uusi kohde, Kumoa, tallennus,
// samanniminen uusi palikka ei peri poistettua, ketju pysähtyy näkyvään virheeseen).
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,16,9,0);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function N(P,b,x,y,g){return KK.addNode(P,b.id,x||0,y||0,g);}

// --- 1. F01: {palikka.ominaisuus} tekstissä = sama arvo kuin kaavassa ---
var P=KK.newProject('viitteet');
var pis=KK.addBlock(P,'arvo',{nm:'Pisteet',v:'5'});N(P,pis);
var ots=KK.addBlock(P,'teksti',{nm:'Otsikko'});P.st[ots.id]='Hei';A.strictEqual(E(P).val(ots.id),'Hei');
var t1=KK.addBlock(P,'nayta',{tx:''});
t1.tx=KK.toIds(P,'Pisteet: {pisteet.arvo}, otsikon pituus {otsikko.pituus}, {Otsikko}');
A.strictEqual(t1.tx,'Pisteet: {#'+pis.id+'.arvo}, otsikon pituus {#'+ots.id+'.pituus}, {#'+ots.id+'}','tallennetaan tunnisteella');
A.strictEqual(E(P).text(t1.id),'Pisteet: 5, otsikon pituus 3, Hei');
var kv=KK.addBlock(P,'kaava',{f:KK.kaavaToIds(P,'otsikko.pituus')});N(P,kv);
A.strictEqual(E(P).val(kv.id),3,'kaava antaa saman arvon');
A.strictEqual(KK.toNames(P,t1.tx),'Pisteet: {pisteet.arvo}, otsikon pituus {otsikko.pituus}, {Otsikko}','muokatessa viitteenä');
// Nimi palikan nimellä tai viitteellä, ominaisuus pienillä kirjaimilla
A.strictEqual(KK.toIds(P,'{Otsikko.Näkyy}'),'{#'+ots.id+'.näkyy}');
A.strictEqual(E(P).tpl(KK.toIds(P,'{Otsikko.Näkyy}')),'kyllä');
// Nimen vaihto ei riko viittausta
KK.setName(P,ots.id,'Pääotsikko');
A.strictEqual(E(P).text(t1.id),'Pisteet: 5, otsikon pituus 3, Hei');
A.strictEqual(KK.toNames(P,t1.tx),'Pisteet: {pisteet.arvo}, otsikon pituus {pääotsikko.pituus}, {Pääotsikko}');
// Tuntematon ominaisuus selittää itsensä, tuntematon palikka jää tekstiksi
var t2=KK.addBlock(P,'nayta',{tx:KK.toIds(P,'{pisteet.lentonopeus}')});
A.ok(/^⚠ tuntematon ominaisuus \.lentonopeus \(palikalla ”Pisteet” on: /.test(E(P).text(t2.id)),E(P).text(t2.id));
A.strictEqual(KK.toIds(P,'{kukaan.arvo}'),'{kukaan.arvo}','tuntematon palikka jää ennalleen');
// Nimi, jossa on piste, löytyy kokonaisena ennen ominaisuustulkintaa
var vp=KK.addBlock(P,'arvo',{nm:'v.2',v:'7'});N(P,vp);A.strictEqual(KK.toIds(P,'{v.2}'),'{#'+vp.id+'}');
// Yhteydet tunnistaa tekstin ominaisuusviitteen
var D=KK.deps(P);A.ok((D.usedBy[pis.id]||[]).some(function(x){return x.id===t1.id&&x.how==='teksti';}));
A.ok((D.usedBy[ots.id]||[]).some(function(x){return x.id===t1.id;}));
// Toiminnon teksti (Ilmoita) ja Arvo-palikan teksti käyttävät samaa lukijaa
var ar=KK.addBlock(P,'arvo',{v:KK.toIds(P,'{pisteet.arvo} p')});N(P,ar);A.strictEqual(E(P).val(ar.id),'5 p');

// --- 2. D08: vaikutuslista ennen poistoa ---
var P2=KK.newProject('poisto');
var a=KK.addBlock(P2,'arvo',{nm:'Pisteet',v:'2'}),an=N(P2,a);
var tx=KK.addBlock(P2,'nayta',{tx:''});tx.tx=KK.toIds(P2,'Sinulla on {pisteet} ({pisteet.arvo})');
var kf=KK.addBlock(P2,'kaava',{f:KK.kaavaToIds(P2,'pisteet + 1')}),kn=N(P2,kf,0,60);
var tee=KK.addBlock(P2,'tee',{do:'aseta',o:a.id,v:'3'}),ten=N(P2,tee,0,120);
var nap=KK.addBlock(P2,'nappi',{nk:{m:'kun',r:a.id}});
var kal=KK.addBlock(P2,'kalenteri',{lahteet:[a.id]});
var lasku=KK.addBlock(P2,'lasku',{op:'add',a:{r:a.id},b:'1'});var ln=N(P2,lasku,0,180);
var vert=KK.addBlock(P2,'vert',{}),vn=N(P2,vert,0,240);KK.addLink(P2,an.id,'v',vn.id,'a');
var irto=KK.addBlock(P2,'arvo',{nm:'Irto',v:'1'});N(P2,irto,300,0);
var rs=KK.refsTo(P2,[a.id]);
function hows(list,id){return list.filter(function(x){return x.id===id;}).map(function(x){return x.how;}).sort();}
A.deepStrictEqual(hows(rs,tx.id),['teksti']);A.deepStrictEqual(hows(rs,kf.id),['kaava']);A.deepStrictEqual(hows(rs,tee.id),['kohde']);
A.deepStrictEqual(hows(rs,nap.id),['nk']);A.deepStrictEqual(hows(rs,kal.id),['kalenteri']);A.deepStrictEqual(hows(rs,lasku.id),['arvo']);A.deepStrictEqual(hows(rs,vert.id),['nuoli']);
A.ok(rs.every(function(x){return x.to===a.id;}));
A.deepStrictEqual(KK.refsTo(P2,[irto.id]),[],'viittaamaton: ei varoitusta');
// Monivalinta: vain ulkopuolelle jäävät viittaukset
A.deepStrictEqual(KK.refsTo(P2,[a.id,tx.id,kf.id,tee.id,nap.id,kal.id,lasku.id,vert.id]),[]);
A.deepStrictEqual(KK.refsTo(P2,[a.id,tx.id]).map(function(x){return x.id;}).indexOf(tx.id),-1);

// --- 3. Poisto: katkennut viite säilyy nimineen, virhe näkyy kaikkialla ---
var ennen=JSON.stringify(P2);
KK.removeBlock(P2,a.id);
A.ok(!P2.b[a.id]);A.deepStrictEqual(P2.pois[a.id],{nm:'Pisteet',vt:'pisteet',k:'arvo'});
A.ok(KK.isGone(P2,a.id));A.strictEqual(KK.goneName(P2,a.id),'pisteet');
A.strictEqual(tx.tx,'Sinulla on {#'+a.id+'} ({#'+a.id+'.arvo})','teksti säilyttää tunnisteen');
A.strictEqual(E(P2).text(tx.id),'Sinulla on ⚠ kohde poistettu: pisteet (⚠ kohde poistettu: pisteet)');
A.strictEqual(KK.toNames(P2,tx.tx),'Sinulla on {⚠pisteet} ({⚠pisteet.arvo})');
A.strictEqual(KK.toIds(P2,KK.toNames(P2,tx.tx)),tx.tx,'muokkaus ei hävitä katkennutta viitettä');
A.strictEqual(kf.f,'{#'+a.id+'} + 1');A.strictEqual(KK.kaavaToText(P2,kf.f),'⚠pisteet + 1');A.strictEqual(KK.kaavaToIds(P2,'⚠pisteet + 1'),kf.f);
A.deepStrictEqual(E(P2).val(kf.id),{err:'kohde poistettu: pisteet'});
A.strictEqual(tee.o,a.id,'toiminnon kohde säilyy');A.deepStrictEqual(nap.nk,{m:'kun',r:a.id});A.deepStrictEqual(kal.lahteet,[a.id]);A.deepStrictEqual(lasku.a,{r:a.id});
A.deepStrictEqual(E(P2).val(lasku.id),{err:'kohde poistettu: pisteet'},'arvo-kohta kertoo poistetusta');
A.strictEqual(E(P2).visible(nap.id),true,'näkyvyysehto ilman kohdetta: näkyy kuten ennen');
A.strictEqual(P2.lg.l.length,0,'nuoli poistuu palikan mukana');
var br=KK.brokenRefs(P2);
A.deepStrictEqual(br.map(function(x){return x.id+':'+x.how;}).sort(),[tx.id+':teksti',kf.id+':kaava',tee.id+':kohde',nap.id+':nk',kal.id+':kalenteri',lasku.id+':arvo'].sort());
A.ok(br.every(function(x){return x.gone===a.id&&x.nm==='pisteet';}));
// Toiminto poistettuun kohteeseen ei tee mitään eikä luo tilaa
KK.runAction(P2,tee.id,C,0);A.strictEqual(P2.st[a.id],undefined);

// --- 4. Samanniminen uusi palikka ei peri poistetun tunnistetta ---
var a2=KK.addBlock(P2,'arvo',{nm:'Pisteet',v:'9'});N(P2,a2);A.notStrictEqual(a2.id,a.id);A.strictEqual(a2.vt,'pisteet');
KK.repair(P2);A.strictEqual(tx.tx,'Sinulla on {#'+a.id+'} ({#'+a.id+'.arvo})','korjaus ei sido samannimiseen');A.strictEqual(kf.f,'{#'+a.id+'} + 1');
A.strictEqual(KK.toIds(P2,KK.toNames(P2,tx.tx)),tx.tx,'muokkaus ei sido samannimiseen');A.strictEqual(KK.kaavaToIds(P2,KK.kaavaToText(P2,kf.f)),kf.f);
// Tavallinen kirjoitus {pisteet} osoittaa uuteen
A.strictEqual(KK.toIds(P2,'{pisteet}'),'{#'+a2.id+'}');

// --- 5. Uuden kohteen valinta (Viitevirheet-listan korjaus) ---
KK.relink(P2,tx.id,a.id,a2.id);A.strictEqual(tx.tx,'Sinulla on {#'+a2.id+'} ({#'+a2.id+'.arvo})');A.strictEqual(E(P2).text(tx.id),'Sinulla on 9 (9)');
KK.relink(P2,kf.id,a.id,a2.id);A.strictEqual(E(P2).val(kf.id),10);
KK.relink(P2,tee.id,a.id,a2.id);A.strictEqual(tee.o,a2.id);
KK.relink(P2,nap.id,a.id,a2.id);KK.relink(P2,kal.id,a.id,a2.id);KK.relink(P2,lasku.id,a.id,a2.id);A.strictEqual(E(P2).val(lasku.id),10);
A.deepStrictEqual(KK.brokenRefs(P2),[]);KK.repair(P2);A.strictEqual(P2.pois,undefined,'muistiin jäänyt nimi poistuu, kun viittauksia ei ole');

// --- 6. Kumoa palauttaa poistetun alkuperäisellä tunnisteella ---
var P3=KK.repair(JSON.parse(ennen));A.ok(P3.b[a.id]);A.strictEqual(KK.Ev(P3,C).text(tx.id),'Sinulla on 2 (2)');A.strictEqual(P3.pois,undefined);

// --- 7. Viittaamaton poisto ei jätä muistiin mitään; tallennus säilyttää katkenneet viitteet ---
KK.removeBlock(P3,irto.id);A.strictEqual(P3.pois,undefined);
KK.removeBlock(P3,a.id);var P4=KK.repair(JSON.parse(JSON.stringify(P3)));
A.deepStrictEqual(P4.pois[a.id],{nm:'Pisteet',vt:'pisteet',k:'arvo'});A.strictEqual(P4.b[tee.id].o,a.id);A.deepStrictEqual(P4.b[lasku.id].a,{r:a.id});
A.deepStrictEqual(P4.b[nap.id].nk,{m:'kun',r:a.id});A.strictEqual(KK.brokenRefs(P4).length,6);
// Rikkinäinen muisti korjataan
P4.pois={x:5,y:null};P4.pois[a.id]={nm:3};KK.repair(P4);A.deepStrictEqual(Object.keys(P4.pois),[a.id]);A.strictEqual(typeof P4.pois[a.id].nm,'string');
P4.pois='roskaa';KK.repair(P4);A.strictEqual(P4.pois,undefined);A.strictEqual(P4.b[tee.id].o,'','ilman muistia vanha siivous');

// --- 8. Vanha projekti ilman muistia: entinen siivous ennallaan ---
var P5=KK.newProject('vanha');var w=KK.addBlock(P5,'arvo',{nm:'W',v:'1'});N(P5,w);var tw=KK.addBlock(P5,'tee',{do:'aseta',o:'b999',v:'1'});N(P5,tw);
KK.repair(P5);A.strictEqual(tw.o,'','tuntematon tunniste ilman muistia siivotaan kuten ennen');
var kw=KK.addBlock(P5,'kaava',{f:'{?w} + 1'});N(P5,kw);KK.repair(P5);A.strictEqual(kw.f,'{#'+w.id+'} + 1','kirjoitettu ennen palikkaa: löytyy kuten ennen');

// --- 9. Ketju pysähtyy näkyvään virheeseen, kun tarvittava kohde on poistettu ---
var P6=KK.newProject('ketju');var lk=KK.addBlock(P6,'arvo',{nm:'Laskuri',v:'0'});N(P6,lk);
var ke=KK.addBlock(P6,'ketju'),ken=N(P6,ke,0,0);
var s1=KK.addBlock(P6,'tee',{do:'aseta',o:lk.id,v:'1'}),sn1=N(P6,s1,10,20,ken.id);
var s2=KK.addBlock(P6,'tee',{do:'ilmoita',tx:'ok'}),sn2=N(P6,s2,10,80,ken.id);KK.addLink(P6,sn1.id,'e',sn2.id,'e');
var hh=KK.addBlock(P6,'haara',{o:lk.id}),hn=N(P6,hh,200,20);
KK.removeBlock(P6,lk.id);A.strictEqual(s1.o,lk.id);
KK.chainStart(P6,ke.id,C,null,0);A.strictEqual(P6.st[ke.id].run,false);A.ok(/kohde poistettu: laskuri/.test(P6.st[ke.id].err),P6.st[ke.id].err);
A.deepStrictEqual(KK.haaraVal(P6,hh,C),{err:'kohde poistettu: laskuri'});
// Efekti, jonka kohde on poistettu: ketjun tarkistus kertoo, ketju pysähtyy virheeseen
var P8=KK.newProject('efekti');var ot8=KK.addBlock(P8,'nayta',{nm:'Otsikko8',tx:'x'});var ke8=KK.addBlock(P8,'ketju'),ken8=N(P8,ke8,0,0);
var fx8=KK.addBlock(P8,'ilmesty',{o:ot8.id}),fxn8=N(P8,fx8,10,20,ken8.id);KK.removeBlock(P8,ot8.id);A.strictEqual(fx8.o,ot8.id);
A.ok(KK.chainIssues(P8,ke8.id,C).some(function(x){return /kohde poistettu \(otsikko8\)/.test(x.t);}));
KK.chainStart(P8,ke8.id,C,null,0);A.ok(/kohde poistettu: otsikko8/.test(P8.st[ke8.id].err),P8.st[ke8.id].err);

// --- 10. Liittäminen toisesta projektista ei tuo vieraita poistettuja ---
var clip=KK.copyNodes(P2,[kn.id]);var P7=KK.newProject('toinen');KK.pasteNodes(P7,clip,0,0);A.strictEqual(P7.pois,undefined);

console.log('logiikka_45_viitteet ok');
