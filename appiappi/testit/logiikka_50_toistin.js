// P3b: toistuva kortti (F05). Toistin näyttää saman kortin jokaiselle riville (rivit nuolella kohtaan rivit). Kortin
// palikat lasketaan rivin omalla Ev:llä; kortin oma tila on rivikohtainen ('ti:<avain>@<rivi>'), sarakkeeseen sidottu
// kenttä lukee ja kirjoittaa rivin sarakkeen, ja kortin painikkeen tapahtuman rivi on kortin rivi.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g);return {b:b,n:n};}
function kaava(P,f,g){var k=blk(P,'kaava',{},-600,0,g);k.b.f=KK.kaavaToIds(P,f);return k;}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+'.'+ap+' → '+b.b.nm+'.'+bp);return l;}
function taulu(P,nm,cols){var t=blk(P,'taulu',{nm:nm});var c={};cols.forEach(function(x){c[x[0]]=KK.addCol(t.b,x[0],x[1],x[2]);});return {t:t.b,n:t.n,b:t.b,c:c};}
function rivi(P,T,vals){var rid=KK.tAddRow(P,T.t.id,false);Object.keys(vals).forEach(function(k){var r=KK.tEdit(P,T.t.id,false,rid,T.c[k].id,vals[k],new Date(NOW));A.ok(!KK.isErr(r),'tEdit '+k+': '+(r&&r.err));});return rid;}
function cell(P,T,rid,c){var r=KK.tRow(P,T.t.id,rid);return KK.cellRead(P,T.t.id,r,T.c[c]);}
function ui(P,k,props,x,y){var p=props||{};p.v=P.views[0].id;var o=blk(P,k,p,0,0);o.b.x=x;o.b.y=y;return o;}

var P=KK.newProject('toistin');
var T=taulu(P,'Tuotteet',[['Nimi','teksti'],['Määrä','luku'],['Valmis','kylla']]);
var r1=rivi(P,T,{'Nimi':'Maito','Määrä':'2'}),r2=rivi(P,T,{'Nimi':'Leipä','Määrä':'0'}),r3=rivi(P,T,{'Nimi':'Juusto'});
var kohde=blk(P,'trivi',{nm:'Kohde',tt:T.t.id});
var J=blk(P,'joukko',{nm:'Joukko'});link(P,{b:T.t,n:T.n},'rj',J,'rv');
// 1. Toistin: kohdat, oletukset, rivit nuolesta
var TS=ui(P,'toistin',{nm:'Kortit'},40,40);A.strictEqual(TS.b.tsu,'sarake');A.strictEqual(TS.b.kh,64);A.strictEqual(TS.b.kw,0);
A.deepStrictEqual(KK.portsBase(TS.b).ins.map(function(o){return o.p;}),['nk','rv']);A.deepStrictEqual(KK.portsBase(TS.b).outs.map(function(o){return o.p;}),['v']);
A.strictEqual(val(P,TS.b.id),0,'ilman rivejä 0 korttia');
link(P,J,'rj',TS,'rv');A.strictEqual(val(P,TS.b.id),3);A.strictEqual(KK.rowTable(P,TS.b.id),T.t.id);
// 2. Jäsenyys paikan mukaan: keskikohta ensimmäisessä kortissa (40,40, 340×64)
var nimi=ui(P,'nayta',{nm:'Nimi'},48,48);nimi.b.w=150;nimi.b.h=40;nimi.b.tx=KK.toIds(P,'{kohde.nimi}');
var plus=ui(P,'nappi',{nm:'Plus',tx:'+',beh:'kerta'},300,52);plus.b.w=60;plus.b.h=40;
var maara=ui(P,'luku',{nm:'Määrä kortissa'},200,44);maara.b.w=90;maara.b.h=56;
var rasti=ui(P,'ruutu',{nm:'Rasti'},150,50);rasti.b.w=40;rasti.b.h=30;
var ulko=ui(P,'nayta',{nm:'Ulkona'},40,300);
var kartta=ui(P,'tatti',{nm:'Tatti'},60,50);kartta.b.w=40;kartta.b.h=40;
A.strictEqual(KK.tstAssign(P,[nimi.b.id,plus.b.id,maara.b.id,rasti.b.id,ulko.b.id,kartta.b.id]),4,'neljä kortin palikkaa');
A.strictEqual(nimi.b.tst,TS.b.id);A.strictEqual(plus.b.tst,TS.b.id);A.strictEqual(ulko.b.tst,undefined);A.strictEqual(kartta.b.tst,undefined,'tatti ei käy korttiin');
A.deepStrictEqual(KK.tstMembers(P,TS.b.id).map(function(b){return b.nm;}).sort(),['Määrä kortissa','Nimi','Plus','Rasti']);
// Siirto pois kortista irrottaa, takaisin liittää
ulko.b.x=60;ulko.b.y=60;KK.tstAssign(P,[ulko.b.id]);A.strictEqual(ulko.b.tst,TS.b.id);ulko.b.y=300;KK.tstAssign(P,[ulko.b.id]);A.strictEqual(ulko.b.tst,undefined);
// 3. Arvot riveittäin: teksti, sitomaton luku (oma), malli ilman riviä
var ev=E(P);A.strictEqual(ev.rowEv(T.t.id,r1).text(nimi.b.id),'Maito');A.strictEqual(ev.rowEv(T.t.id,r2).text(nimi.b.id),'Leipä');A.strictEqual(ev.text(nimi.b.id),'–','malli ilman riviä: puuttuva');
A.deepStrictEqual(KK.tstRowOf(P,nimi.b.id,{rows:{}}),{tid:T.t.id,rid:'',t:TS.b.id});A.strictEqual(KK.tstRowOf(P,ulko.b.id,{}),null);
// 4. Sarakkeeseen sidottu luku: näyttää rivin määrän, kirjoittaa riville
maara.b.tsar=T.c['Määrä'].id;
A.strictEqual(ev=E(P),ev);A.strictEqual(E(P).rowEv(T.t.id,r1).val(maara.b.id),2);A.strictEqual(E(P).rowEv(T.t.id,r3).val(maara.b.id),null,'puuttuva määrä');
var c1=KK.tstCtx(P,C,maara.b.id,r1);A.strictEqual(c1.rows[T.t.id],r1);KK.userSet(P,maara.b.id,5,c1);A.strictEqual(cell(P,T,r1,'Määrä'),5,'sidottu kenttä kirjoitti riville');A.strictEqual(cell(P,T,r2,'Määrä'),0);
A.ok(KK.tUsed(P,T.t.id),'käytössä muuttuu kopio');A.strictEqual(KK.cellRead(P,T.t.id,T.t.rv[0],T.c['Määrä']),2,'lähtöaineisto säilyy');
A.ok(!Object.keys(P.st).some(function(k){return /^ti:/.test(k);}),'sidottu kenttä ei tee omaa tilaa');
// Luku rajoineen: suurin 9 rajaa myös sidotun kirjoituksen
maara.b.max=9;KK.userSet(P,maara.b.id,50,KK.tstCtx(P,C,maara.b.id,r2));A.strictEqual(cell(P,T,r2,'Määrä'),9);maara.b.max='';
// 5. Sitomaton valintaruutu: kortin oma tila, ei muiden rivien
KK.userSet(P,rasti.b.id,true,KK.tstCtx(P,C,rasti.b.id,r2));
A.strictEqual(P.st['ti:'+rasti.b.id+'@'+r2],true);A.strictEqual(E(P).rowEv(T.t.id,r2).val(rasti.b.id),true);A.strictEqual(E(P).rowEv(T.t.id,r1).val(rasti.b.id),false);A.strictEqual(val(P,rasti.b.id),false,'mallin oma arvo ennallaan');
A.ok(!P.st.hasOwnProperty(rasti.b.id));
// Ilman riviä mallin palikkaan ei kirjoiteta
KK.setVal(P,rasti.b.id,true,C);A.ok(!P.st.hasOwnProperty(rasti.b.id),'malliin ei kirjoiteta ilman riviä');
// 6. Rivijoukon ehto lukee kortin valintaruutua riveittäin
var J2=blk(P,'joukko',{nm:'Valitut'});link(P,{b:T.t,n:T.n},'rj',J2,'rv');link(P,rasti,'v',J2,'c');
A.deepStrictEqual(val(P,J2.b.id,'rj').ids,[r2],'valitut rivit kortin rastista');
// 7. Kortin painike: tapahtuman rivi ja käsiteltävä rivi ovat kortin rivi
var lisaa=blk(P,'tee',{do:'lisaa',o:T.t.id,sk:T.c['Määrä'].id,rl:'tapahtuma'});link(P,plus,'e',lisaa,'e');
var muisti=blk(P,'muisti',{nm:'Viimeksi'});var aseta=blk(P,'tee',{do:'aseta',o:muisti.b.id});link(P,kaava(P,'kohde.nimi'),'v',aseta,'v');link(P,lisaa,'e',aseta,'e');
var tapR=null,tapKr=null;var tk=blk(P,'tee',{do:'ilmoita',tx:''});link(P,plus,'e',tk,'e');
KK.press(P,plus.b.id,KK.tstCtx(P,C,plus.b.id,r2));
A.strictEqual(cell(P,T,r2,'Määrä'),10,'Lisää 1 tapahtuman rivillä (r2)');A.strictEqual(cell(P,T,r1,'Määrä'),5,'muut rivit ennallaan');A.strictEqual(val(P,muisti.b.id),'Leipä','käsiteltävä rivi ketjussa');
A.strictEqual(P.st['ti:'+plus.b.id+'@'+r2],1,'kortin oma painallusmäärä');A.ok(!P.st.hasOwnProperty(plus.b.id));
// Kaksi peräkkäistä painallusta eri korteissa
KK.press(P,plus.b.id,KK.tstCtx(P,C,plus.b.id,r1));KK.press(P,plus.b.id,KK.tstCtx(P,C,plus.b.id,r3));
A.strictEqual(cell(P,T,r1,'Määrä'),6);A.strictEqual(cell(P,T,r3,'Määrä'),1,'puuttuvaan lisääminen alkaa nollasta');A.strictEqual(cell(P,T,r2,'Määrä'),10);A.strictEqual(val(P,muisti.b.id),'Juusto');
// Kuori: tapahtuma.rivi kaavassa
blk(P,'tapaht',{nm:'Tapahtuma'});var tapK=kaava(P,'tapahtuma.rivi.nimi');var tm=blk(P,'muisti',{nm:'Tap'});var ta=blk(P,'tee',{do:'aseta',o:tm.b.id});link(P,tapK,'v',ta,'v');link(P,plus,'e',ta,'e');
KK.press(P,plus.b.id,KK.tstCtx(P,C,plus.b.id,r1));A.strictEqual(val(P,tm.b.id),'Maito','tapahtuma.rivi.nimi');
// Toiminto kortin palikkaan saman tapahtuman ketjussa kohdistuu kortin riviin
var tekstiK=ui(P,'teksti',{nm:'Huom'},60,90);tekstiK.b.h=10;KK.tstAssign(P,[tekstiK.b.id]);A.strictEqual(tekstiK.b.tst,TS.b.id);
var ah=blk(P,'tee',{do:'aseta',o:tekstiK.b.id,v:'painettu'});link(P,plus,'e',ah,'e');KK.press(P,plus.b.id,KK.tstCtx(P,C,plus.b.id,r3));
A.strictEqual(P.st['ti:'+tekstiK.b.id+'@'+r3],'painettu');A.strictEqual(E(P).rowEv(T.t.id,r1).val(tekstiK.b.id),'');
// 8. Järjestys ja suodatus: tila kulkee rivin mukana, ei järjestysnumeron
J.b.js=T.c['Määrä'].id;J.b.su='laskeva';A.deepStrictEqual(val(P,J.b.id,'rj').ids,[r2,r1,r3]);
A.strictEqual(E(P).rowEv(T.t.id,r2).val(rasti.b.id),true,'rasti seuraa riviä r2');A.strictEqual(E(P).rowEv(T.t.id,r1).val(rasti.b.id),false);
var eh=kaava(P,'kohde.määrä > 5');link(P,eh,'v',J,'c');A.deepStrictEqual(val(P,J.b.id,'rj').ids,[r2,r1]);A.strictEqual(val(P,TS.b.id),2,'suodatus: 2 korttia');
// Uusi rivi saa kortin ilman uutta logiikkaa
var u=KK.tAddRow(P,T.t.id,true);KK.tEdit(P,T.t.id,true,u,T.c['Nimi'].id,'Omena');KK.tEdit(P,T.t.id,true,u,T.c['Määrä'].id,8);
A.deepStrictEqual(val(P,J.b.id,'rj').ids,[r2,u,r1]);A.strictEqual(E(P).rowEv(T.t.id,u).text(nimi.b.id),'Omena');
// 9. Kaksi pintaa samalle riville: sidottu arvo yhteinen, oma tila erillinen
var TS2=ui(P,'toistin',{nm:'Toinen'},500,40);link(P,{b:T.t,n:T.n},'rj',TS2,'rv');
var m2=ui(P,'luku',{nm:'Määrä 2'},510,44);m2.b.w=60;m2.b.h=40;var ra2=ui(P,'ruutu',{nm:'Rasti 2'},600,50);ra2.b.w=40;ra2.b.h=30;KK.tstAssign(P,[m2.b.id,ra2.b.id]);A.strictEqual(m2.b.tst,TS2.b.id);
m2.b.tsar=T.c['Määrä'].id;A.strictEqual(E(P).rowEv(T.t.id,r2).val(m2.b.id),10);KK.userSet(P,m2.b.id,7,KK.tstCtx(P,C,m2.b.id,r2));A.strictEqual(E(P).rowEv(T.t.id,r2).val(maara.b.id),7,'toinen pinta näkee saman määrän');
A.strictEqual(E(P).rowEv(T.t.id,r2).val(ra2.b.id),false,'oma rasti erillinen');
// 10. Sidottu valintaruutu kyllä/ei-sarakkeeseen
ra2.b.tsar=T.c['Valmis'].id;KK.userSet(P,ra2.b.id,true,KK.tstCtx(P,C,ra2.b.id,r1));A.strictEqual(cell(P,T,r1,'Valmis'),true);A.strictEqual(E(P).rowEv(T.t.id,r1).val(ra2.b.id),true);
// Väärä laji: teksti lukusarakkeeseen → näkyvä virhe, ei kirjoitusta
var tx2=ui(P,'teksti',{nm:'Teksti 2'},520,80);tx2.b.h=10;KK.tstAssign(P,[tx2.b.id]);tx2.b.tsar=T.c['Määrä'].id;TOASTS.length=0;
KK.userSet(P,tx2.b.id,'paljon',KK.tstCtx(P,C,tx2.b.id,r1));A.strictEqual(cell(P,T,r1,'Määrä'),7);A.ok(TOASTS.some(function(t){return /ei ole luku/.test(t);}),TOASTS.join('|'));
// Sarake puuttuu: virhe kortissa
tx2.b.tsar='c99';A.ok(KK.isErr(E(P).rowEv(T.t.id,r1).val(tx2.b.id)));
// 11. Asettelu
var L=KK.tstLayout({tsu:'sarake',kw:0,kh:64,vali:8},3,340);A.deepStrictEqual([L.cols,L.cw,L.h,L.pos(2).y],[1,340,208,144]);
L=KK.tstLayout({tsu:'ruudukko',kw:160,kh:100,vali:8},5,340);A.deepStrictEqual([L.cols,L.w,L.h,L.pos(3).x,L.pos(3).y],[2,328,316,168,108],'ruudukko 340 px: 2 saraketta');
L=KK.tstLayout({tsu:'ruudukko',kw:160,kh:100,vali:8},5,1100);A.strictEqual(L.cols,6,'leveämpi: kaikki rinnakkain');L=KK.tstLayout({tsu:'ruudukko',kw:160,kh:100,vali:8},5,150);A.strictEqual(L.cols,1);
L=KK.tstLayout({tsu:'rivi',kw:120,kh:80,vali:10},4,300);A.deepStrictEqual([L.cols,L.w,L.pos(3).x],[4,510,390]);A.strictEqual(KK.tstLayout({tsu:'sarake',kh:64,vali:8},0,300).h,0);
// 12. Tallennus, vienti ja tuonti: kentät ja kortin tila säilyvät
var Q=JSON.parse(JSON.stringify(P));KK.repair(Q);var qm=Q.b[maara.b.id];A.strictEqual(qm.tst,TS.b.id);A.strictEqual(qm.tsar,T.c['Määrä'].id);A.strictEqual(Q.st['ti:'+rasti.b.id+'@'+r2],true);
A.strictEqual(KK.Ev(Q,C).rowEv(T.t.id,r2).val(rasti.b.id),true);A.strictEqual(Q.b[TS.b.id].tsu,'sarake');
// Repair: kelvoton laji, kenttä toistimessa, väärä asettelu, orpo tila
Q.b[TS.b.id].tsu='kummallinen';Q.b[TS.b.id].kh=-4;Q.b[TS.b.id].tst=TS2.b.id;Q.st['ti:b9999@r1']=1;Q.st['ti:roska']=1;Q.st['ti:'+maara.b.id+'@'+r1]=3;
Q.b[ulko.b.id].tst=TS.b.id;Q.b[ulko.b.id].tsar='c1';KK.repair(Q);
A.strictEqual(Q.b[TS.b.id].tsu,'sarake');A.strictEqual(Q.b[TS.b.id].kh,64);A.strictEqual(Q.b[TS.b.id].tst,undefined,'toistin ei ole toisen kortti');
A.ok(!Q.st['ti:b9999@r1']&&!Q.st['ti:roska']&&!Q.st['ti:'+maara.b.id+'@'+r1],'orvot ja sidotun kentän tila pois');
A.strictEqual(Q.b[ulko.b.id].tst,TS.b.id,'paikasta riippumatta tallennettu jäsenyys säilyy');A.strictEqual(Q.b[ulko.b.id].tsar,undefined,'tekstillä ei sidontaa');
// Rivin poisto siivoaa sen kortin tilan, ei muiden
KK.tDelRow(P,T.t.id,true,r2);KK.repair(P);A.ok(!P.st.hasOwnProperty('ti:'+rasti.b.id+'@'+r2),'poistetun rivin tila pois');A.strictEqual(P.st['ti:'+tekstiK.b.id+'@'+r3],'painettu');
A.strictEqual(val(P,TS.b.id),2);
// Toistimen poisto: palikat jäävät tavallisiksi, Kumoa (kopio) palauttaa
var undo=JSON.stringify(P);KK.removeBlock(P,TS.b.id);A.strictEqual(nimi.b.tst,undefined);A.strictEqual(maara.b.tsar,undefined);A.ok(P.b[nimi.b.id],'palikka jää');
var Pu=JSON.parse(undo);KK.repair(Pu);A.strictEqual(Pu.b[nimi.b.id].tst,TS.b.id);
// Vanha projekti ilman toistinta: ei muutoksia
var O=KK.newProject('vanha');var ob=KK.addBlock(O,'nayta',{tx:'x'});var before=JSON.stringify(O);KK.repair(O);A.strictEqual(JSON.stringify(O),before,'vanha projekti ennallaan');
// 13. Iso aineisto: 100 riviä, joka kortin arvot
var B=KK.newProject('iso');var TB=taulu(B,'Iso',[['Nimi','teksti'],['Määrä','luku']]);for(var i=0;i<100;i++)rivi(B,TB,{'Nimi':'R'+i,'Määrä':String(i)});
blk(B,'trivi',{nm:'Kohde',tt:TB.t.id});var TT=ui(B,'toistin',{nm:'T'},0,0);link(B,{b:TB.t,n:TB.n},'rj',TT,'rv');var tn=ui(B,'nayta',{},10,10);tn.b.h=20;tn.b.tx=KK.toIds(B,'{kohde.nimi}: {kohde.määrä}');
var tl=ui(B,'luku',{},200,10);tl.b.h=20;KK.tstAssign(B,[tn.b.id,tl.b.id]);tl.b.tsar=TB.c['Määrä'].id;
var t0=Date.now(),eB=KK.Ev(B,C),rs=eB.rowsIn(TT.b.id),out=rs.ids.map(function(r){var er=eB.rowEv(TB.t.id,r);return er.text(tn.b.id)+'|'+er.val(tl.b.id);});
A.strictEqual(out.length,100);A.strictEqual(out[57],'R57: 57|57');console.log('100 korttia laskettu', Date.now()-t0,'ms');A.ok(Date.now()-t0<1500);
KK.press(B,tl.b.id,C);
console.log('logiikka_50 ok');
