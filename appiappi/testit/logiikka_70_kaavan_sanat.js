// Jonon 1l (linjakkuuskartoitus 4: P1, P3, P4, P6, P8): kaavan sanat ja ominaisuudet yhtenäisiksi. Synteettinen sisältö.
// nyt.päivä noudattaa päivän rajaa (tänään on kalenteripäivä); valinta-ominaisuus kaavassa näkyvällä nimellä, ohjaus
// hyväksyy molemmat; päivämäärä + teksti yhdistää tekstiksi; Liikkeen kohde x/y, ei pääse ja edistyminen kaavaan;
// Vertailu-palikan sisältää.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,17,2,0,0).getTime();
var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function E(P,c){return KK.Ev(P,c||C);}
function blk(P,k,props,x,y){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,'');return {b:b,n:n};}
function kaava(P,f){var k=blk(P,'kaava',{},-600,0);k.b.f=KK.kaavaToIds(P,f);return k;}
function kv(P,f,c){return E(P,c).val(kaava(P,f).b.id);}
function at(y,m,d,h,mi){return new Date(y,m-1,d,h,mi||0).getTime();}

// 1. P1: nyt.päivä päivän rajan mukaan, tänään ennallaan
var P=KK.newProject('sanat');
A.deepStrictEqual(kv(P,'nyt.päivä'),{d:'2026-10-17'},'ilman rajaa = kalenteripäivä');
A.deepStrictEqual(kv(P,'nyt.paiva'),{d:'2026-10-17'},'ilman ääkkösiä');
var L=blk(P,'taulu',{nm:'Loki'});KK.histMake(L.b);var ac=KK.histCol(L.b);KK.addCol(L.b,'Päivä','teksti');KK.repair(P);
KK.tAddRow(P,L.b.id,true,new Date(at(2026,10,15,12,0)));KK.tAddRow(P,L.b.id,true,new Date(at(2026,10,16,23,0)));KK.tAddRow(P,L.b.id,true,new Date(at(2026,10,17,1,0)));
P.praja=4;KK.repair(P);
A.deepStrictEqual(kv(P,'nyt.päivä'),{d:'2026-10-16'},'raja 4, kello 2.00: vielä eilinen');
A.deepStrictEqual(kv(P,'tänään'),{d:'2026-10-17'},'tänään on yhä kalenteripäivä');
A.strictEqual(kv(P,'loki.tänään'),2,'loki.tänään rajan mukaan (23.00 ja 1.00)');
A.ok(KK.isErr(kv(P,'loki.päivä')),'loki.päivä on sarake, ei päivän sana');
// Rivijoukko: kirjaus.aika.päivä = nyt.päivä löytää samat kaksi kirjausta kuin loki.tänään
var kir=blk(P,'trivi',{nm:'Kirjaus',tt:L.b.id});
var J=blk(P,'joukko',{nm:'Yön kirjaukset'});A.ok(KK.addLink(P,L.n.id,'rj',J.n.id,'rv'));
var ehto=kaava(P,'kirjaus.aika.päivä = nyt.päivä');A.ok(KK.addLink(P,ehto.n.id,'v',J.n.id,'c'));
var rs=E(P).val(J.b.id,'rj');A.ok(KK.isRS(rs),'joukko: '+JSON.stringify(rs));A.strictEqual(E(P).val(J.b.id),2,'nyt.päivä: kaksi kirjausta');
ehto.b.f=KK.kaavaToIds(P,'kirjaus.aika.päivä = tänään');A.strictEqual(E(P).val(J.b.id),0,'tänään (kalenteripäivä) ei löydä yön kirjauksia');
NOW=at(2026,10,17,9,0);A.deepStrictEqual(kv(P,'nyt.päivä'),{d:'2026-10-17'},'rajan jälkeen tämä päivä');
var nv=kv(P,'nyt.huomenna');A.ok(KK.isErr(nv)&&/nyt\.päivä/.test(nv.err),'virhe luettelee nyt.päivän: '+JSON.stringify(nv));

// 2. P3: valinta-ominaisuus kaavassa näkyvällä nimellä, ohjaus hyväksyy molemmat, piirto saa sisäisen avaimen
var Q=KK.newProject('valinnat'),vw=Q.views[0].id;
var T=blk(Q,'nayta',{v:vw,tx:'Hei',tas:'center',koko:'s'});KK.setName(Q,T.b.id,'Otsikko');
var M=blk(Q,'muoto',{v:vw,laji:'ympyra'});KK.setName(Q,M.b.id,'Pallo');
var Mi=blk(Q,'mittari',{v:vw,muoto:'pylvas',esit:'pros'});KK.setName(Q,Mi.b.id,'Mittari');
var N=blk(Q,'nappi',{v:vw,tx:'Paina',ani:'haivytys',anp:'joustava'});KK.setName(Q,N.b.id,'Nappi');KK.repair(Q);
A.strictEqual(kv(Q,'otsikko.tasaus'),'keski');A.strictEqual(kv(Q,'otsikko.koko'),'S');
A.strictEqual(kv(Q,'pallo.muoto'),'ympyrä');A.strictEqual(kv(Q,'mittari.muoto'),'pylväs');A.strictEqual(kv(Q,'mittari.esitys'),'prosentti');
A.strictEqual(kv(Q,'nappi.animointi.ilmestyy'),'häivytys');A.strictEqual(kv(Q,'nappi.animointi.pehmeys'),'joustava');
A.strictEqual(kv(Q,'nappi.animointi.ilmestyy = "häivytys"'),true,'vertailu näkyvällä nimellä');
A.strictEqual(kv(Q,'pallo.muoto = "Ympyrä"'),true,'kirjainkoolla ei väliä');A.strictEqual(kv(Q,'otsikko.koko = "s"'),true);
A.strictEqual(kv(Q,'"Muoto: " + pallo.muoto'),'Muoto: ympyrä');
A.strictEqual(E(Q).omiVal(M.b.id,'laji'),'ympyra','piirto saa yhä sisäisen avaimen');A.strictEqual(E(Q).omiVal(T.b.id,'tas'),'center');
A.ok(KK.setOmi(Q,M.b.id,'muoto','pilleri'));A.strictEqual(kv(Q,'pallo.muoto'),'pilleri');
A.ok(KK.setOmi(Q,M.b.id,'muoto','ympyrä'),'näkyvä nimi');A.ok(KK.setOmi(Q,M.b.id,'muoto','ympyra'),'vanha sisäinen nimi');A.strictEqual(kv(Q,'pallo.muoto'),'ympyrä');
A.ok(KK.setOmi(Q,T.b.id,'tasaus','right'));A.strictEqual(kv(Q,'otsikko.tasaus'),'oikea');
// Kaavan näkyvä nimi kelpaa toisen palikan ohjaukseen (nuoli kohtaan o_laji)
var M2=blk(Q,'muoto',{v:vw,laji:'laatikko'});KK.setName(Q,M2.b.id,'Toinen');M2.b.ohk=['laji'];
var kk=kaava(Q,'pallo.muoto');A.ok(KK.addLink(Q,kk.n.id,'v',M2.n.id,'o_laji'),'nuoli');
A.strictEqual(E(Q).omiVal(M2.b.id,'laji'),'ympyra','ohjaus näkyvällä nimellä');A.strictEqual(kv(Q,'toinen.muoto'),'ympyrä');

// 3. P4: päivämäärä + teksti yhdistää tekstiksi, päivämäärä + luku siirtää päivää
NOW=at(2026,10,17,12,0);
A.strictEqual(kv(P,'"Tänään on " + tänään'),'Tänään on 17.10.2026');
A.strictEqual(kv(P,'tänään + " oli hyvä"'),'17.10.2026 oli hyvä');
A.strictEqual(kv(P,'"Tänään on " + tänään',{now:C.now,toast:C.toast,nav:C.nav,df:'pp.kk.vv'}),'Tänään on 17.10.26','projektin päivämäärämuoto');
A.deepStrictEqual(kv(P,'tänään + 1'),{d:'2026-10-18'},'luku siirtää päivää');A.deepStrictEqual(kv(P,'tänään + "2"'),{d:'2026-10-19'},'numeroteksti siirtää yhä');
A.strictEqual(kv(P,'"a" + 1'),'a1');
var la=blk(P,'lasku',{op:'add',a:'Päivä: ',b:''});la.b.b={r:KK.addBlock(P,'tanaan',{}).id};KK.addNode(P,la.b.b.r,0,0,'');
var lv=E(P).val(la.b.id);A.ok(typeof lv==='string'&&/^Päivä: ?17\.10\.2026$/.test(lv),'Laskutoimitus samoin: '+JSON.stringify(lv));

// 4. P6: Liikkeen kohde x, kohde y, ei pääse ja edistyminen kaavassa
var R=KK.newProject('liike'),rv=R.views[0].id;R.views[0].laite='puhelin';
var h=blk(R,'muoto',{v:rv,laji:'laatikko'}).b;h.x=100;h.y=100;h.w=40;h.h=40;
var li=blk(R,'liike',{o:h.id,ohj:'napautus',vm:'300'}).b;KK.setName(R,li.id,'Liike');KK.repair(R);
A.ok(KK.isErr(kv(R,'liike.eipääse')),'ei pääse vain reitinhaulla, kuten nuolikohta');
KK.liikeNapautus(R,rv,320,300,C);KK.frame(R,1/60,C);
A.strictEqual(kv(R,'liike.kohdex'),E(R).val(li.id,'kx'));A.strictEqual(kv(R,'liike.kohdey'),E(R).val(li.id,'ky'));A.strictEqual(kv(R,'liike.kohdex'),320);
li.kie=true;KK.repair(R);A.strictEqual(kv(R,'liike.eipääse'),E(R).val(li.id,'eip'));A.strictEqual(kv(R,'liike.eipaase'),E(R).val(li.id,'eip'));
li.ohj='reitti';KK.repair(R);A.ok(KK.omFind(li,'edistyminen'),'reitillä edistyminen');A.ok(!KK.omFind(li,'kohdex'),'reitillä ei kohdetta');
A.deepStrictEqual(kv(R,'liike.edistyminen'),E(R).val(li.id,'ed'));

// 5. P8: Vertailu-palikan sisältää
var V=blk(P,'vert',{op:'has',a:'Banaanikakku',b:'KAKKU'});A.strictEqual(E(P).val(V.b.id),true,'sisältää, kirjainkoolla ei väliä');
V.b.b='pulla';A.strictEqual(E(P).val(V.b.id),false);V.b.b='';A.strictEqual(E(P).val(V.b.id),true,'tyhjä haku pätee kuten kaavassa');
A.strictEqual(KK.CMPS.has,'sisältää');
var Vq=JSON.parse(JSON.stringify(P));KK.repair(Vq);A.strictEqual(Vq.b[V.b.id].op,'has','korjaus säilyttää valinnan');
console.log('logiikka_70_kaavan_sanat ok');
