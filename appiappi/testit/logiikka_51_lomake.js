// Lomake (jatkoa P3b:lle): tavallinen kenttä sidotaan Rivi-palikkaan (b.trv) ja sarakkeeseen (b.tsar). Kenttä näyttää
// Rivi-palikan rivin sarakkeen ja muuttaa sitä suoraan. Ilman riviä kenttä on tyhjä ja harmaa eikä kirjoita. Kortin
// vanha sidonta (b.tsar ilman b.trv:tä) toimii ennallaan; kortissa käsiteltävä rivi on kortin rivi.
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
function bind(o,rv,c){o.b.trv=rv.b.id;o.b.tsar=c.id;return o;}

var P=KK.newProject('lomake');
var T=taulu(P,'Tuotteet',[['Nimi','teksti'],['Määrä','luku'],['Valmis','kylla'],['Pvm','pvm'],['Arvio','luku']]);
var r1=rivi(P,T,{'Nimi':'Maito','Määrä':'2','Valmis':'kyllä','Pvm':'1.10.2026','Arvio':'3'}),r2=rivi(P,T,{'Nimi':'Leipä','Määrä':'0'}),r3=rivi(P,T,{'Nimi':'Juusto'});
var V=blk(P,'trivi',{nm:'Valinta',tt:T.t.id,ls:'val'});
var fNimi=bind(ui(P,'teksti',{nm:'Nimi-kenttä'},20,20),V,T.c['Nimi']),fMaara=bind(ui(P,'luku',{nm:'Määrä-kenttä'},20,80),V,T.c['Määrä']);
var fValmis=bind(ui(P,'ruutu',{nm:'Valmis-ruutu'},20,140),V,T.c['Valmis']),fKytkin=bind(ui(P,'kytkin',{nm:'Valmis-kytkin'},20,200),V,T.c['Valmis']);
var fPvm=bind(ui(P,'pvm',{nm:'Pvm-kenttä'},20,260),V,T.c['Pvm']),fArvio=bind(ui(P,'saadin',{nm:'Arvio-säädin',min:'0',max:'5',start:'1'},20,320),V,T.c['Arvio']);
var fields=[fNimi,fMaara,fValmis,fKytkin,fPvm,fArvio];
KK.repair(P);
fields.forEach(function(f){A.strictEqual(f.b.trv,V.b.id,'repair säilyttää trv');A.ok(f.b.tsar,'repair säilyttää tsar ilman korttia');A.ok(KK.isBound(P,f.b));});

// 1. Ei valittua riviä: tyhjä ja harmaa, ei kirjoitusta
var e=E(P);
A.deepStrictEqual([e.val(fNimi.b.id),e.val(fMaara.b.id),e.val(fValmis.b.id),e.val(fKytkin.b.id),e.val(fPvm.b.id),e.val(fArvio.b.id)],['',null,false,false,null,1],'ilman riviä tyhjät arvot (säädin alkuarvossa)');
fields.forEach(function(f){A.strictEqual(e.state(f.b.id),'harmaa',f.b.nm+' harmaa');A.ok(e.noRow(f.b.id));});
KK.userSet(P,fMaara.b.id,9,C);KK.userSet(P,fNimi.b.id,'Uusi',C);
A.ok(!KK.tUsed(P,T.t.id),'ilman riviä ei kirjoiteta taulukkoon');A.ok(!P.st.hasOwnProperty(fMaara.b.id)&&!P.st.hasOwnProperty(fNimi.b.id),'eikä kentän omaan tilaan');

// 2. Valittu rivi: kentät näyttävät sen sarakkeet
KK.tSetSel(P,T.t.id,r1);e=E(P);
A.deepStrictEqual([e.val(fNimi.b.id),e.val(fMaara.b.id),e.val(fValmis.b.id),e.val(fKytkin.b.id),e.val(fPvm.b.id).d,e.val(fArvio.b.id)],['Maito',2,true,true,'2026-10-01',3]);
fields.forEach(function(f){A.strictEqual(e.state(f.b.id),'näkyy',f.b.nm+' käytössä');});
// Valinnan vaihto: samat kentät, toinen rivi (puuttuvat tyhjinä)
KK.tSetSel(P,T.t.id,r2);e=E(P);A.deepStrictEqual([e.val(fNimi.b.id),e.val(fMaara.b.id),e.val(fValmis.b.id),e.val(fPvm.b.id),e.val(fArvio.b.id)],['Leipä',0,false,null,1]);

// 3. Kirjoitus kenttään muuttaa valitun rivin saraketta (heti, D02), muut rivit ennallaan
KK.userSet(P,fMaara.b.id,7,C);A.strictEqual(cell(P,T,r2,'Määrä'),7);A.strictEqual(cell(P,T,r1,'Määrä'),2);
A.ok(KK.tUsed(P,T.t.id),'käytössä muuttuu kopio');A.strictEqual(KK.cellRead(P,T.t.id,T.t.rv[1],T.c['Määrä']),0,'lähtöaineisto säilyy');
A.ok(!P.st.hasOwnProperty(fMaara.b.id),'sidottu kenttä ei tee omaa tilaa');
KK.userSet(P,fNimi.b.id,'Ruisleipä',C);A.strictEqual(cell(P,T,r2,'Nimi'),'Ruisleipä');
KK.userSet(P,fValmis.b.id,true,C);A.strictEqual(cell(P,T,r2,'Valmis'),true);A.strictEqual(val(P,fKytkin.b.id),true,'kytkin samassa sarakkeessa näkee muutoksen');
KK.userSet(P,fPvm.b.id,KK.D('2026-12-24'),C);A.strictEqual(cell(P,T,r2,'Pvm').d,'2026-12-24');
KK.userSet(P,fArvio.b.id,8,C);A.strictEqual(cell(P,T,r2,'Arvio'),5,'säädin rajaa suurimpaan');
KK.userSet(P,fMaara.b.id,'abc',C);A.strictEqual(cell(P,T,r2,'Määrä'),7,'ei-luku ei kirjoitu');
// Tyhjä tekstikenttä = puuttuva
KK.userSet(P,fNimi.b.id,'',C);A.ok(KK.isMiss(cell(P,T,r2,'Nimi'))||cell(P,T,r2,'Nimi')==null,'tyhjä teksti = puuttuva');KK.userSet(P,fNimi.b.id,'Leipä',C);
// Valinta takaisin r1: r1:n arvot, r2:n muutokset tallessa
KK.tSetSel(P,T.t.id,r1);A.strictEqual(val(P,fMaara.b.id),2);KK.tSetSel(P,T.t.id,r2);A.strictEqual(val(P,fMaara.b.id),7);

// 4. Kaava ja toiminnot: kentän arvo kaavassa, Aseta/Lisää/Vaihda/Tyhjennä kentälle kirjoittavat riville
var k2=kaava(P,'1');k2.b.f='{#'+fMaara.b.id+'} * 2';A.strictEqual(val(P,k2.b.id),14);
var nappi=ui(P,'nappi',{nm:'Nappi',tx:'Tee'},300,20);
var aseta=blk(P,'tee',{do:'aseta',o:fMaara.b.id,v:'4'});link(P,nappi,'e',aseta,'e');KK.press(P,nappi.b.id,C);A.strictEqual(cell(P,T,r2,'Määrä'),4,'Aseta kenttään → riville');
P.lg.l=P.lg.l.filter(function(l){return l.t!==aseta.n.id;});
var lisaa=blk(P,'tee',{do:'lisaa',o:fMaara.b.id});link(P,nappi,'e',lisaa,'e');KK.press(P,nappi.b.id,C);A.strictEqual(cell(P,T,r2,'Määrä'),5,'Lisää 1 kenttään');
P.lg.l=P.lg.l.filter(function(l){return l.t!==lisaa.n.id;});
var vaihda=blk(P,'tee',{do:'vaihda',o:fValmis.b.id});link(P,nappi,'e',vaihda,'e');KK.press(P,nappi.b.id,C);A.strictEqual(cell(P,T,r2,'Valmis'),false,'Vaihda ruutu');
P.lg.l=P.lg.l.filter(function(l){return l.t!==vaihda.n.id;});
var tyhj=blk(P,'tee',{do:'tyhjenna',o:fMaara.b.id});link(P,nappi,'e',tyhj,'e');KK.press(P,nappi.b.id,C);var cm=cell(P,T,r2,'Määrä');A.ok(KK.isMiss(cm)||cm==null,'Tyhjennä kenttä → rivin kenttä puuttuva');
A.strictEqual(val(P,fMaara.b.id),null);P.lg.l=P.lg.l.filter(function(l){return l.t!==tyhj.n.id;});
KK.userSet(P,fMaara.b.id,5,C);

// 5. Ei uutta tapahtumaa: sidotun kentän kohdat samat kuin sitomattoman; kentän arvo kulkee nuolta pitkin kuten ennen
var vapaa=ui(P,'luku',{nm:'Vapaa'},300,300);
A.deepStrictEqual(JSON.stringify(KK.portsBase(fMaara.b)),JSON.stringify(KK.portsBase(vapaa.b)),'ei uusia kohtia');
var mu=blk(P,'muisti',{nm:'Muisti'});var am=blk(P,'tee',{do:'aseta',o:mu.b.id});link(P,fMaara,'v',am,'v');link(P,nappi,'e',am,'e');KK.press(P,nappi.b.id,C);A.strictEqual(val(P,mu.b.id),5,'kentän arvo nuolesta');

// 6. Rivin poisto: valittu rivi poistuu → ei riviä, kenttä harmaa
KK.tDelRow(P,T.t.id,true,r2);KK.repair(P);e=E(P);A.strictEqual(e.state(fMaara.b.id),'harmaa');A.strictEqual(e.val(fMaara.b.id),null);A.ok(!KK.isErr(e.val(fNimi.b.id)),'poistettu rivi ei ole virhe');
KK.userSet(P,fMaara.b.id,3,C);A.strictEqual(KK.tUse(P,T.t.id).rows.length,2,'ei uutta riviä');
KK.tSetSel(P,T.t.id,r3);A.strictEqual(E(P).state(fMaara.b.id),'näkyy');A.strictEqual(val(P,fMaara.b.id),null,'puuttuva määrä');KK.userSet(P,fMaara.b.id,1,C);A.strictEqual(cell(P,T,r3,'Määrä'),1);

// 7. Väärä laji ja asetusvirheet näkyvät virheinä (ei harmaana)
var fVaara=bind(ui(P,'luku',{nm:'Väärä'},20,400),V,T.c['Nimi']);A.ok(KK.isErr(val(P,fVaara.b.id)),'lukukenttä tekstisarakkeessa: virhe');
var fTx=bind(ui(P,'teksti',{nm:'Teksti määrään'},20,460),V,T.c['Määrä']);TOASTS.length=0;KK.userSet(P,fTx.b.id,'paljon',C);A.strictEqual(cell(P,T,r3,'Määrä'),1);A.ok(TOASTS.some(function(t){return /ei ole luku/.test(t);}),TOASTS.join('|'));
fTx.b.tsar='c99';A.ok(KK.isErr(val(P,fTx.b.id)),'sarake puuttuu');A.notStrictEqual(E(P).state(fTx.b.id),'harmaa');
var Vt=blk(P,'trivi',{nm:'Tyhjä',ls:'val'});var fEi=bind(ui(P,'luku',{nm:'Ei taulukkoa'},20,520),Vt,T.c['Määrä']);KK.repair(P);A.ok(KK.isErr(val(P,fEi.b.id)),'Rivi-palikalla ei taulukkoa: virhe');

// 8. Muut rivilähteet: tapahtuman rivi ketjussa, käsiteltävä rivi kortissa
var Tap=blk(P,'trivi',{nm:'TapRivi',tt:T.t.id,ls:'tap'});var fTap=bind(ui(P,'luku',{nm:'Tap-kenttä'},20,580),Tap,T.c['Määrä']);
A.strictEqual(E(P).state(fTap.b.id),'harmaa','näkymässä ei tapahtuman riviä');
var valitse=blk(P,'tee',{do:'lisaa',o:fTap.b.id});var vr=blk(P,'tee',{do:'valitserivi',o:T.t.id,rs:'eka'});link(P,vr,'e',valitse,'e');
var n2=ui(P,'nappi',{nm:'N2'},300,100);link(P,n2,'e',vr,'e');KK.press(P,n2.b.id,C);
A.strictEqual(KK.tSel(P,T.t.id),r1,'valitse ensimmäinen');A.strictEqual(cell(P,T,r1,'Määrä'),3,'Lisää kenttään tapahtuman rivillä (r1: 2 → 3)');
// Kortissa: kenttä sidottu Rivi-palikkaan (käsiteltävä) = kortin rivi; Rivi-palikka (valittu) = valittu rivi joka kortissa
var Koh=blk(P,'trivi',{nm:'Kohde',tt:T.t.id});var TS=ui(P,'toistin',{nm:'Kortit'},600,40);link(P,{b:T.t,n:T.n},'rj',TS,'rv');
var kk=ui(P,'luku',{nm:'Kortin määrä'},610,44);kk.b.w=60;kk.b.h=40;var kv=ui(P,'teksti',{nm:'Kortin valittu'},700,44);kv.b.w=60;kv.b.h=40;KK.tstAssign(P,[kk.b.id,kv.b.id]);A.strictEqual(kk.b.tst,TS.b.id);
bind(kk,Koh,T.c['Määrä']);bind(kv,V,T.c['Nimi']);KK.repair(P);e=E(P);
A.strictEqual(e.rowEv(T.t.id,r3).val(kk.b.id),1,'käsiteltävä = kortin rivi');A.strictEqual(e.rowEv(T.t.id,r3).val(kv.b.id),'Maito','valittu rivi joka kortissa');
KK.userSet(P,kk.b.id,6,KK.tstCtx(P,C,kk.b.id,r3));A.strictEqual(cell(P,T,r3,'Määrä'),6,'kortin kenttä Rivi-palikan kautta kirjoittaa kortin riville');
// Irrotus kortista: sidonta Rivi-palikkaan säilyy, vanha kortin sidonta poistuu
kv.b.y=900;KK.tstAssign(P,[kv.b.id]);A.strictEqual(kv.b.tst,undefined);A.strictEqual(kv.b.tsar,T.c['Nimi'].id,'trv-sidonta säilyy irrotettaessa');A.strictEqual(val(P,kv.b.id),'Maito');

// 9. Vanha kortin sidonta (tsar ilman trv:tä) ennallaan
var vk=ui(P,'luku',{nm:'Vanha kortti'},620,60);vk.b.w=40;vk.b.h=20;KK.tstAssign(P,[vk.b.id]);vk.b.tsar=T.c['Määrä'].id;KK.repair(P);
A.strictEqual(vk.b.trv,undefined);A.strictEqual(E(P).rowEv(T.t.id,r1).val(vk.b.id),3);KK.userSet(P,vk.b.id,4,KK.tstCtx(P,C,vk.b.id,r1));A.strictEqual(cell(P,T,r1,'Määrä'),4);
A.strictEqual(E(P).state(vk.b.id),'näkyy','vanha kortin malli ei harmaannu');
vk.b.y=900;KK.tstAssign(P,[vk.b.id]);A.strictEqual(vk.b.tsar,undefined,'vanha: irrotus poistaa sidonnan');
// Tyhjennä kortin kenttään ei muutu (ei kirjoita riviin)
// 10. Sarakkeen poiston vaikutuslista näyttää sidotut kentät (lomake ja kortti)
var cr=KK.colRefs(P,T.t.id,T.c['Määrä'].id);A.ok(cr.indexOf(fMaara.b.id)>=0&&cr.indexOf(kk.b.id)>=0,'colRefs: '+cr.join(','));A.ok(cr.indexOf(fNimi.b.id)<0);

// 11. Rivi-palikan poisto (D08): vaikutuslista, viite jää ⚠-virheeksi, uusi kohde korjaa; nimen vaihto ei riko
V.b.nm='Valittu';V.b.vt='valittu2';A.strictEqual(val(P,fNimi.b.id),'Maito','nimen vaihto ei riko');
var rf=KK.refsTo(P,[V.b.id]).filter(function(r){return r.id===fNimi.b.id;});A.strictEqual(rf.length,1,'vaikutuslistassa kenttä');
var undo=JSON.stringify(P);
KK.removeBlock(P,V.b.id);A.strictEqual(fNimi.b.trv,V.b.id,'viite jää');A.ok(KK.isErr(val(P,fNimi.b.id)),'⚠ kohde poistettu');A.notStrictEqual(E(P).state(fNimi.b.id),'harmaa');
A.ok(KK.brokenRefs(P).some(function(r){return r.id===fNimi.b.id&&r.gone===V.b.id;}),'Viitevirheet');
var V2=blk(P,'trivi',{nm:'Uusi valinta',tt:T.t.id,ls:'val'});A.ok(KK.relink(P,fNimi.b.id,V.b.id,V2.b.id));A.strictEqual(fNimi.b.trv,V2.b.id);A.strictEqual(val(P,fNimi.b.id),'Maito');
P=JSON.parse(undo);KK.repair(P);A.strictEqual(P.b[fNimi.b.id].trv,V.b.id,'Kumoa palauttaa');

// 12. Tallennus, vienti ja tuonti: trv ja tsar säilyvät, versio ennallaan; repair siivoaa kelvottomat
A.strictEqual(KK.VER,9,'tallennusversio 9 (jonon 12g)');
var Q=JSON.parse(JSON.stringify(P));KK.repair(Q);A.strictEqual(Q.b[fMaara.b.id].trv,V.b.id);A.strictEqual(Q.b[fMaara.b.id].tsar,T.c['Määrä'].id);A.strictEqual(KK.Ev(Q,C).val(fMaara.b.id),KK.Ev(P,C).val(fMaara.b.id));
Q.b[fMaara.b.id].trv=nappi.b.id;Q.b[fNimi.b.id].trv=5;Q.b[fValmis.b.id].trv='';var mb=Object.keys(Q.b).filter(function(i){return Q.b[i].k==='muisti';})[0];Q.b[mb].trv=V.b.id;Q.b[mb].tsar='c1';
KK.repair(Q);A.strictEqual(Q.b[fMaara.b.id].trv,undefined,'trv ei-Rivi-palikkaan pois');A.strictEqual(Q.b[fMaara.b.id].tsar,undefined,'ja sidonta');A.strictEqual(Q.b[fNimi.b.id].trv,undefined);A.strictEqual(Q.b[fValmis.b.id].trv,undefined);
A.strictEqual(Q.b[mb].trv,undefined,'Muisti ei ole sidottava');A.strictEqual(Q.b[mb].tsar,undefined);
// Vanha projekti ilman kenttien sidontaa ennallaan
var O=KK.newProject('vanha');var ot=KK.addBlock(O,'luku',{tx:'x'});ot.tsar='c1';KK.repair(O);A.strictEqual(ot.tsar,undefined,'vanha: tsar ilman korttia tai riviä pois kuten ennen');
var O2=KK.newProject('vanha2');KK.addBlock(O2,'teksti',{tx:'x'});var bf=JSON.stringify(O2);KK.repair(O2);A.strictEqual(JSON.stringify(O2),bf,'vanha projekti ennallaan');
console.log('logiikka_51 ok');
