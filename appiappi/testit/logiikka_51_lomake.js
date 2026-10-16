// Appi-appi 16: kentän sidonta riviin (muokkauslomake). Kenttä (tekstikenttä, lukukenttä, valintaruutu, kytkin, säädin,
// päivämäärä) sidotaan Rivi-palikkaan (b.trv) + sarakkeeseen (b.tsar): valittu, tapahtuman tai käsiteltävä rivi. Ilman
// riviä kenttä on tyhjä ja harmaa eikä kirjoita; poistettu Rivi-palikka tai sarake on näkyvä virhe. Kortin vanha sidonta
// (tsar ilman trv) toimii ennallaan, ja kortissa käsiteltävä rivi on kortin rivi. Muutos ei lähetä omaa tapahtumaa.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g);return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+'.'+ap+' → '+b.b.nm+'.'+bp);return l;}
function taulu(P,nm,cols){var t=blk(P,'taulu',{nm:nm});var c={};cols.forEach(function(x){c[x[0]]=KK.addCol(t.b,x[0],x[1],x[2]);});return {t:t.b,n:t.n,b:t.b,c:c};}
function rivi(P,T,vals){var rid=KK.tAddRow(P,T.t.id,false);Object.keys(vals).forEach(function(k){var r=KK.tEdit(P,T.t.id,false,rid,T.c[k].id,vals[k],new Date(NOW));A.ok(!KK.isErr(r),'tEdit '+k+': '+(r&&r.err));});return rid;}
function cell(P,T,rid,c){var r=KK.tRow(P,T.t.id,rid);return KK.cellRead(P,T.t.id,r,T.c[c]);}
function ui(P,k,props,x,y){var p=props||{};p.v=P.views[0].id;var o=blk(P,k,p,0,0);o.b.x=x;o.b.y=y;return o;}
function sido(f,R,T,c){f.b.trv=R.b.id;f.b.tsar=T.c[c].id;}

var P=KK.newProject('lomake');
var T=taulu(P,'Tehtävät',[['Nimi','teksti'],['Määrä','luku'],['Valmis','kylla'],['Päivä','pvm']]);
var r1=rivi(P,T,{'Nimi':'Pyykit','Määrä':'2','Valmis':'kyllä','Päivä':'16.10.2026'}),r2=rivi(P,T,{'Nimi':'Kauppa','Määrä':'5'}),r3=rivi(P,T,{'Nimi':'Posti'});
var VAL=blk(P,'trivi',{nm:'Valittu',tt:T.t.id,ls:'val'});
var fNimi=ui(P,'teksti',{nm:'Nimikenttä'},20,20),fMaara=ui(P,'luku',{nm:'Määräkenttä'},20,80),fValmis=ui(P,'ruutu',{nm:'Valmis-ruutu'},20,140),
    fKyt=ui(P,'kytkin',{nm:'Valmis-kytkin'},20,200),fSaa=ui(P,'saadin',{nm:'Määrä-säädin'},20,260),fPv=ui(P,'pvm',{nm:'Päiväkenttä'},20,320);
// 1. Sitomaton kenttä toimii kuten ennen; sidonta Rivi-palikkaan
A.strictEqual(KK.bindKind(P,fNimi.b),'');KK.userSet(P,fNimi.b.id,'oma',C);A.strictEqual(P.st[fNimi.b.id],'oma');A.strictEqual(val(P,fNimi.b.id),'oma');delete P.st[fNimi.b.id];
sido(fNimi,VAL,T,'Nimi');sido(fMaara,VAL,T,'Määrä');sido(fValmis,VAL,T,'Valmis');sido(fKyt,VAL,T,'Valmis');sido(fSaa,VAL,T,'Määrä');sido(fPv,VAL,T,'Päivä');
[fNimi,fMaara,fValmis,fKyt,fSaa,fPv].forEach(function(f){A.strictEqual(KK.bindKind(P,f.b),'rivi',f.b.nm);});
// 2. Ei valittua riviä: tyhjä ja harmaa, ei kirjoitusta
var ev=E(P);A.strictEqual(KK.tSel(P,T.t.id),'');
A.deepStrictEqual([ev.val(fNimi.b.id),ev.val(fMaara.b.id),ev.val(fValmis.b.id),ev.val(fKyt.b.id),ev.val(fPv.b.id)],['',null,false,false,null],'tyhjät arvot');
[fNimi,fMaara,fValmis,fKyt,fSaa,fPv].forEach(function(f){A.strictEqual(ev.state(f.b.id),'harmaa',f.b.nm+' harmaa');});
A.strictEqual(ev.bindRow(fNimi.b.id),null);A.strictEqual(KK.bindTarget(P,fNimi.b,C),null);
TOASTS.length=0;var stBefore=JSON.stringify(P.st);KK.setVal(P,fNimi.b.id,'Uusi',C);
A.strictEqual(JSON.stringify(P.st),stBefore,'ilman riviä ei kirjoiteta mihinkään');A.ok(TOASTS.some(function(t){return /ei riviä/.test(t);}),TOASTS.join('|'));
A.ok(!KK.tUsed(P,T.t.id),'ei käyttötietoa');
// 3. Valittu rivi: kentät näyttävät rivin arvot
KK.tSetSel(P,T.t.id,r1);ev=E(P);
A.deepStrictEqual([ev.val(fNimi.b.id),ev.val(fMaara.b.id),ev.val(fValmis.b.id),ev.val(fKyt.b.id),ev.val(fSaa.b.id)],['Pyykit',2,true,true,2]);
A.ok(KK.isD(ev.val(fPv.b.id))&&ev.val(fPv.b.id).d==='2026-10-16','päivämäärä');A.strictEqual(ev.state(fNimi.b.id),'näkyy','rivi on: ei harmaa');
A.deepStrictEqual(KK.bindTarget(P,fNimi.b,C),{tid:T.t.id,rid:r1});
// Kaava lukee kentän arvon tavalliseen tapaan
var tupla=kaava(P,'Määräkenttä * 2');A.strictEqual(val(P,tupla.b.id),4);
// 4. Käyttäjän muutos kirjoittaa valitulle riville heti (käyttötieto, lähtöaineisto säilyy)
KK.userSet(P,fNimi.b.id,'Pyykit ja lakanat',C);KK.userSet(P,fMaara.b.id,7,C);KK.userSet(P,fValmis.b.id,false,C);KK.userSet(P,fPv.b.id,'17.10.2026',C);
A.strictEqual(cell(P,T,r1,'Nimi'),'Pyykit ja lakanat');A.strictEqual(cell(P,T,r1,'Määrä'),7);A.strictEqual(cell(P,T,r1,'Valmis'),false);A.strictEqual(cell(P,T,r1,'Päivä').d,'2026-10-17');
A.ok(KK.tUsed(P,T.t.id),'käytössä muuttuu kopio');A.strictEqual(KK.cellRead(P,T.t.id,T.t.rv[0],T.c['Nimi']),'Pyykit','lähtöaineisto säilyy');
A.ok(!P.st.hasOwnProperty(fNimi.b.id)&&!P.st.hasOwnProperty(fMaara.b.id),'sidottu kenttä ei tee omaa tilaa');
A.strictEqual(cell(P,T,r2,'Nimi'),'Kauppa','muut rivit ennallaan');A.strictEqual(val(P,tupla.b.id),14);
// Säädin ja lukukenttä rajaavat kirjoituksen
fSaa.b.max=10;KK.userSet(P,fSaa.b.id,50,C);A.strictEqual(cell(P,T,r1,'Määrä'),10,'säätimen yläraja');
fMaara.b.min=0;KK.userSet(P,fMaara.b.id,-3,C);A.strictEqual(cell(P,T,r1,'Määrä'),0,'lukukentän alaraja');fMaara.b.min='';
// Väärä laji: näkyvä virhe, ei kirjoitusta
var fVaara=ui(P,'teksti',{nm:'Teksti määrään'},300,20);sido(fVaara,VAL,T,'Määrä');TOASTS.length=0;KK.userSet(P,fVaara.b.id,'paljon',C);
A.strictEqual(cell(P,T,r1,'Määrä'),0);A.ok(TOASTS.some(function(t){return /ei ole luku/.test(t);}),TOASTS.join('|'));
// Tyhjennys: tyhjä teksti = puuttuva kenttä
KK.userSet(P,fVaara.b.id,'',C);A.ok(KK.isMiss(cell(P,T,r1,'Määrä'))||cell(P,T,r1,'Määrä')==null,'tyhjennetty');A.strictEqual(val(P,fMaara.b.id),null);KK.userSet(P,fMaara.b.id,3,C);
// 5. Valinnan vaihto: kentät seuraavat riviä, edellinen rivi säilyy
var sel=blk(P,'tee',{do:'valitserivi',o:T.t.id,rs:'seur'});KK.runAction(P,sel.b.id,C,0);A.strictEqual(KK.tSel(P,T.t.id),r2);
ev=E(P);A.deepStrictEqual([ev.val(fNimi.b.id),ev.val(fMaara.b.id),ev.val(fValmis.b.id)],['Kauppa',5,false]);
KK.userSet(P,fMaara.b.id,6,C);A.strictEqual(cell(P,T,r2,'Määrä'),6);A.strictEqual(cell(P,T,r1,'Määrä'),3,'edellinen rivi säilyy');
// 6. Logiikan Aseta sidottuun kenttään kirjoittaa valitulle riville
var aset=blk(P,'tee',{do:'aseta',o:fNimi.b.id,v:'Kauppa (ruoka)'});KK.runAction(P,aset.b.id,C,0);A.strictEqual(cell(P,T,r2,'Nimi'),'Kauppa (ruoka)');
// 7. Ei omaa tapahtumaa: kentän arvon nuoli toimii kuten tavallisella kentällä (myös valinnan vaihtuessa)
var lask=blk(P,'muisti',{nm:'Laskuri'});var nosta=blk(P,'tee',{do:'lisaa',o:lask.b.id,v:1});var jos=blk(P,'ikkuna',{m:'and',j:'jos'});
link(P,fValmis,'v',jos,'in');link(P,jos,'e',nosta,'e');KK.tick(P,C);var l0=KK.num(val(P,lask.b.id))||0;
KK.userSet(P,fValmis.b.id,true,C);A.strictEqual(cell(P,T,r2,'Valmis'),true);A.strictEqual(KK.num(val(P,lask.b.id)),l0+1,'rastitus nostaa (tavallinen arvon nuoli)');
KK.userSet(P,fNimi.b.id,'Kauppa',C);A.strictEqual(KK.num(val(P,lask.b.id)),l0+1,'tekstin muutos ei lähetä tapahtumaa');
KK.tSetSel(P,T.t.id,r3);KK.tick(P,C);A.strictEqual(val(P,fValmis.b.id),false);KK.tSetSel(P,T.t.id,r1);KK.tick(P,C);
A.strictEqual(val(P,fValmis.b.id),false);KK.tSetSel(P,T.t.id,r2);KK.tick(P,C);A.strictEqual(KK.num(val(P,lask.b.id)),l0+2,'valinnan vaihto riville, jolla rasti, näkyy arvon nousuna');
// 8. Valitun rivin poisto: valinta siirtyy seuraavaan; ilman rivejä kenttä tyhjä ja harmaa
var pois=blk(P,'tee',{do:'poistarivi',o:T.t.id});KK.runAction(P,pois.b.id,C,0);A.strictEqual(KK.tSel(P,T.t.id),r3);A.strictEqual(val(P,fNimi.b.id),'Posti');
KK.tSetSel(P,T.t.id,'');A.strictEqual(E(P).state(fNimi.b.id),'harmaa');
// 9. Tapahtuman rivi: kortin painike → Aseta lomakkeen kenttään (Rivi tapahtuman rivi) kirjoittaa kortin riville
var TAP=blk(P,'trivi',{nm:'Tapahtuman',tt:T.t.id,ls:'tap'});var fTap=ui(P,'luku',{nm:'Tap-määrä'},300,300);sido(fTap,TAP,T,'Määrä');
A.strictEqual(val(P,fTap.b.id),null,'tapahtuman ulkopuolella ei riviä');A.strictEqual(E(P).state(fTap.b.id),'harmaa');
var TS=ui(P,'toistin',{nm:'Kortit'},600,40);link(P,{b:T.t,n:T.n},'rj',TS,'rv');var nap=ui(P,'nappi',{nm:'Nolla',tx:'0',beh:'kerta'},610,48);nap.b.w=40;nap.b.h=40;
KK.tstAssign(P,[nap.b.id]);A.strictEqual(nap.b.tst,TS.b.id);var a0=blk(P,'tee',{do:'aseta',o:fTap.b.id,v:42});link(P,nap,'e',a0,'e');
KK.press(P,nap.b.id,KK.tstCtx(P,C,nap.b.id,r1));A.strictEqual(cell(P,T,r1,'Määrä'),42,'tapahtuman rivi = kortin rivi');A.ok(KK.isMiss(cell(P,T,r3,'Määrä')),'r3 ennallaan');
// 10. Kortissa: vanha sidonta (tsar ilman trv) ennallaan; trv valittuun riviin näyttää valitun rivin kaikissa korteissa
var kM=ui(P,'luku',{nm:'Kortin määrä'},660,44);kM.b.w=60;kM.b.h=40;var kV=ui(P,'teksti',{nm:'Kortin valittu'},730,44);kV.b.w=80;kV.b.h=40;KK.tstAssign(P,[kM.b.id,kV.b.id]);
kM.b.tsar=T.c['Määrä'].id;A.strictEqual(KK.bindKind(P,kM.b),'kortti');A.strictEqual(E(P).rowEv(T.t.id,r1).val(kM.b.id),42);A.strictEqual(E(P).rowEv(T.t.id,r3).val(kM.b.id),null);
sido(kV,VAL,T,'Nimi');A.strictEqual(KK.bindKind(P,kV.b),'rivi');KK.tSetSel(P,T.t.id,r3);
A.strictEqual(E(P).rowEv(T.t.id,r1).val(kV.b.id),'Posti');A.strictEqual(E(P).rowEv(T.t.id,r3).val(kV.b.id),'Posti','valittu rivi kaikissa korteissa');
// Rivi-palikka käsiteltävä rivi kortissa = kortin rivi (sama kuin vanha sidonta)
var KAS=blk(P,'trivi',{nm:'Kohde',tt:T.t.id});var kK=ui(P,'luku',{nm:'Kortin määrä 2'},660,90);kK.b.w=60;kK.b.h=10;KK.tstAssign(P,[kK.b.id]);sido(kK,KAS,T,'Määrä');
A.strictEqual(E(P).rowEv(T.t.id,r1).val(kK.b.id),42);KK.userSet(P,kK.b.id,8,KK.tstCtx(P,C,kK.b.id,r3));A.strictEqual(cell(P,T,r3,'Määrä'),8);A.strictEqual(E(P).rowEv(T.t.id,r3).val(kM.b.id),8,'sama arvo kummallakin tavalla');
// Kortista pois siirretty Rivi-sidottu kenttä säilyttää sidonnan, vanha kortin sidonta irtoaa
kV.b.y=600;kM.b.y=600;KK.tstAssign(P,[kV.b.id,kM.b.id]);A.strictEqual(kV.b.tst,undefined);A.strictEqual(kV.b.trv,VAL.b.id);A.strictEqual(kV.b.tsar,T.c['Nimi'].id);
A.strictEqual(kM.b.tsar,undefined,'kortin sidonta irtoaa kortista');A.strictEqual(val(P,kV.b.id),'Posti');
// 11. Viitteet (D08): Rivi-palikan poisto näyttää sidotut kentät, jättää virheen ja korjautuu uudella kohteella
var refs=KK.refsTo(P,[VAL.b.id]).filter(function(r){return r.how==='sidonta';}).map(function(r){return r.id;}).sort();
A.deepStrictEqual(refs,[fNimi.b.id,fMaara.b.id,fValmis.b.id,fKyt.b.id,fSaa.b.id,fPv.b.id,fVaara.b.id,kV.b.id].sort(),'vaikutuslista');
var und=JSON.stringify(P);KK.removeBlock(P,VAL.b.id);A.strictEqual(fNimi.b.trv,VAL.b.id,'viite jää');var ve=val(P,fNimi.b.id);A.ok(KK.isErr(ve)&&/poistettu/.test(ve.err),ve&&ve.err);
A.strictEqual(E(P).state(fNimi.b.id),'harmaa');A.ok(KK.brokenRefs(P).some(function(x){return x.id===fNimi.b.id&&x.how==='sidonta';}),'Viitevirheet');
TOASTS.length=0;KK.setVal(P,fNimi.b.id,'x',C);A.ok(TOASTS.some(function(t){return /poistettu/.test(t);}),TOASTS.join('|'));
var VAL2=blk(P,'trivi',{nm:'Valittu',tt:T.t.id,ls:'val'});A.strictEqual(val(P,fNimi.b.id).err!==undefined,true,'samanniminen ei peri');
A.ok(KK.relink(P,fNimi.b.id,VAL.b.id,VAL2.b.id));A.strictEqual(val(P,fNimi.b.id),'Posti','uusi kohde');
var Pu=JSON.parse(und);KK.repair(Pu);A.strictEqual(KK.Ev(Pu,C).val(fMaara.b.id),8,'Kumoa palauttaa');
// Sarakkeen poisto: vaikutuslista ja virhe
A.ok(KK.colRefs(P,T.t.id,T.c['Määrä'].id).indexOf(fTap.b.id)>=0,'sarakkeen vaikutuslistassa sidottu kenttä');
A.ok(KK.colRefs(P,T.t.id,T.c['Määrä'].id).indexOf(kK.b.id)>=0);fTap.b.tsar='c99';A.ok(/sarake puuttuu/.test(val(P,fTap.b.id).err));fTap.b.tsar=T.c['Määrä'].id;
// Miksi?
var w=KK.why(P,E(P),fNimi.b.id);A.ok(/Arvo sarakkeesta ”Nimi”/.test(w.txt),w.txt);A.ok(w.kids.some(function(k){return k.id===VAL2.b.id;}));
KK.tSetSel(P,T.t.id,'');w=KK.why(P,E(P),fNimi.b.id);A.ok(/ei riviä/.test(w.txt)&&/harmaana/.test(w.txt),w.txt);
// 12. Tallennus: versio ennallaan, kentät säilyvät, repair siivoaa kelvottomat
A.strictEqual(KK.VER,8,'tallennusversio ennallaan');
var Q=JSON.parse(JSON.stringify(P));KK.repair(Q);A.strictEqual(Q.b[fNimi.b.id].trv,VAL2.b.id);A.strictEqual(Q.b[fMaara.b.id].tsar,T.c['Määrä'].id);A.strictEqual(Q.b[fMaara.b.id].trv,VAL.b.id,'poistettu kohde säilyy viitteenä');
Q.b[fNimi.b.id].trv=T.t.id;Q.b[fKyt.b.id].trv=12;Q.b[fSaa.b.id].tsar=undefined;var nayta=ui(Q,'nayta',{nm:'Näyttö'},0,0);nayta.b.trv=VAL2.b.id;nayta.b.tsar='c1';
var vapaa=ui(Q,'luku',{nm:'Vapaa'},0,700);vapaa.b.tsar='c1';KK.repair(Q);
A.deepStrictEqual([Q.b[fNimi.b.id].trv,Q.b[fNimi.b.id].tsar],[undefined,undefined],'trv ei Rivi-palikka → sidonta pois');A.strictEqual(Q.b[fKyt.b.id].trv,undefined);
A.strictEqual(Q.b[fSaa.b.id].trv,undefined,'trv ilman saraketta pois');A.deepStrictEqual([nayta.b.trv,nayta.b.tsar],[undefined,undefined],'Teksti-palikkaa ei sidota');
A.strictEqual(vapaa.b.tsar,undefined,'tsar ilman korttia ja Rivi-palikkaa pois (kuten ennen)');
// Vanha projekti ilman sidontaa: ei muutoksia
var O=KK.newProject('vanha');var oT=taulu(O,'T',[['A','teksti']]);var ol=KK.addBlock(O,'luku',{v:O.views[0].id});ol.tsar='c1';KK.repair(O);A.strictEqual(ol.tsar,undefined);var before=JSON.stringify(O);KK.repair(O);A.strictEqual(JSON.stringify(O),before,'vanha projekti ennallaan');
console.log('logiikka_51_lomake: kaikki kunnossa');
