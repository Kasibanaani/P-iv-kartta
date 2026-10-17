// Jonon 9 (F32 vaihe 1): Hae rivitiedosto (moottori). Synteettinen sisältö, ei oikeaa terveysdataa.
// Rivitiedosto, rivilista ja CSV; avaimella yhdistäminen (sama tiedosto kahdesti ei kahdenna, vanha rivi ja appin oma
// sarake säilyvät, tyhjä ei pyyhi); ilman avainta korvaa; virhe ei muuta rivejä; tapahtumat ja ominaisuudet; toiminto
// Hae pyytää käyttöliittymää; korjaus ja vanha projekti.
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,17,12,0),calls=[],toasts=[];
var C={now:function(){return T;},toast:function(t){toasts.push(t);},nav:function(){},hae:function(P,id){calls.push(id);}};
function V(P,id,p){return KK.Ev(P,C).val(id,p);}
function O(P,id,p){return KK.Ev(P,C).prop(id,p);}
var P=KK.newProject('hae');
var tb=KK.addBlock(P,'taulu',{});KK.setName(P,tb.id,'Terveys');KK.addNode(P,tb.id,0,0,'');
var cP=KK.addCol(tb,'paiva','pvm'),cA=KK.addCol(tb,'askeleet','luku'),cS=KK.addCol(tb,'leposyke','luku'),cM=KK.addCol(tb,'Mieliala','teksti');
KK.repair(P);
// 1 Ilman lähdettä: ei tapahtumia eikä ominaisuuksia
A.ok(!KK.port(tb,'outs','hok'),'ei haettu-tapahtumaa ilman lähdettä');
A.ok(!KK.tauluProps(P,tb).some(function(x){return x[0]==='haettu';}));
tb.lp='/tuonnit/terveys.json';KK.repair(P);A.strictEqual(tb.lp,'tuonnit/terveys.json','alun kauttaviiva pois');
A.ok(KK.port(tb,'outs','hok')&&KK.port(tb,'outs','hvi'),'tapahtumat haettu ja hakuvirhe');
A.ok(KK.tauluProps(P,tb).some(function(x){return x[0]==='hakuvirhe';}));
A.ok(KK.isMiss(O(P,tb.id,'haettu')),'ei vielä haettu = puuttuu');A.strictEqual(O(P,tb.id,'hakuvirhe'),'');

// 2 Rivitiedosto avaimella; tapahtuma haettu laskee
var lk=KK.addBlock(P,'muisti',{nm:'haut',v:0});KK.addNode(P,lk.id,300,0,'');var te=KK.addBlock(P,'tee',{do:'lisaa',o:lk.id});KK.addNode(P,te.id,200,0,'');
KK.addLink(P,KK.nodesOfBlock(P,tb.id)[0].id,'hok',KK.nodesOfBlock(P,te.id)[0].id,'e');
var lv=KK.addBlock(P,'muisti',{nm:'virheet',v:0});KK.addNode(P,lv.id,300,100,'');var tv=KK.addBlock(P,'tee',{do:'lisaa',o:lv.id});KK.addNode(P,tv.id,200,100,'');
KK.addLink(P,KK.nodesOfBlock(P,tb.id)[0].id,'hvi',KK.nodesOfBlock(P,tv.id)[0].id,'e');KK.repair(P);
var f1=JSON.stringify({muoto:'rivit',ver:1,lahde:'testi',avain:'paiva',rivit:[{paiva:'2026-10-16',askeleet:8412,leposyke:54,uni_h:7.2},{paiva:'2026-10-17',askeleet:1203,leposyke:null}]});
var r1=KK.haeSovella(P,tb.id,f1,C);A.deepStrictEqual([r1.n.u,r1.n.m,r1.n.s],[2,0,0]);A.deepStrictEqual(r1.n.o,['uni_h'],'tuntematon kenttä ohitetaan ja kerrotaan');
A.strictEqual(O(P,tb.id,'rivejä'),2);A.strictEqual(V(P,lk.id),1,'haettu-tapahtuma');A.strictEqual(tb.rv.length,0,'lähtöaineisto ennallaan: haku on käyttötietoa');
var rows=KK.tRows(P,tb.id);A.strictEqual(rows[0].a[cP.id].d,'2026-10-16');A.strictEqual(rows[0].a[cA.id],8412);A.ok(!(cS.id in rows[1].a),'null = puuttuu');
A.ok(KK.isAt(O(P,tb.id,'haettu')));A.strictEqual(O(P,tb.id,'haettu').ms,T.getTime());
// Appin oma sarake käsin, sitten sama tiedosto uudelleen: ei tuplia, oma sarake säilyy
rows[0].a[cM.id]='hyvä';
var r2=KK.haeSovella(P,tb.id,f1,C);A.deepStrictEqual([r2.n.u,r2.n.m,r2.n.s],[0,0,2],'sama tiedosto kahdesti ei kahdenna');
A.strictEqual(KK.tRows(P,tb.id)[0].a[cM.id],'hyvä','appin oma sarake säilyy');A.strictEqual(V(P,lk.id),2);
// Seuraava päivä: 16. puuttuu tiedostosta (säilyy), 17. päivittyy, tyhjä leposyke ei pyyhi, 18. uusi
var f2=JSON.stringify({muoto:'rivit',avain:'paiva',rivit:[{paiva:'2026-10-17',askeleet:9050,leposyke:55},{paiva:'2026-10-18',askeleet:300,leposyke:''}]});
var r3=KK.haeSovella(P,tb.id,f2,C);A.deepStrictEqual([r3.n.u,r3.n.m],[1,1]);
rows=KK.tRows(P,tb.id);A.strictEqual(rows.length,3,'vanha rivi säilyy');A.strictEqual(rows[1].a[cA.id],9050);A.strictEqual(rows[1].a[cS.id],55);
var f3=JSON.stringify({avain:'paiva',rivit:[{paiva:'2026-10-17',leposyke:null}]});KK.haeSovella(P,tb.id,f3,C);A.strictEqual(KK.tRows(P,tb.id)[1].a[cS.id],55,'tyhjä ei pyyhi');
A.strictEqual(O(P,tb.id,'askeleet.summa'),8412+9050+300,'kooste lukee haetut');

// 3 Virheet: rivit ennallaan, hakuvirhe ja tapahtuma
var ennen=JSON.stringify(KK.tRows(P,tb.id));
['','ei json {','{"x":1}','{"avain":"pvm","rivit":[{"pvm":"2026-10-01","askeleet":1}]}','{"rivit":[{"foo":1}]}'].forEach(function(t,i){
  var r=KK.haeSovella(P,tb.id,t,C);A.ok(r.err,'virhe '+i);A.strictEqual(JSON.stringify(KK.tRows(P,tb.id)),ennen,'virhe ei muuta rivejä '+i);});
A.strictEqual(V(P,lv.id),5,'hakuvirhe-tapahtuma');A.ok(/sarakkeita/.test(O(P,tb.id,'hakuvirhe')),O(P,tb.id,'hakuvirhe'));
A.strictEqual(O(P,tb.id,'haettu').ms,T.getTime(),'haettu = viimeisin onnistunut');
KK.haeSovella(P,tb.id,f1,C);A.strictEqual(O(P,tb.id,'hakuvirhe'),'','onnistunut haku nollaa virheen');
// Väärän lajin arvo ohitetaan, rivi ilman avainta ohitetaan
var r4=KK.haeSovella(P,tb.id,JSON.stringify({avain:'paiva',rivit:[{paiva:'2026-10-19',askeleet:'paljon'},{askeleet:5}]}),C);
A.deepStrictEqual([r4.n.u,r4.n.v,r4.n.k],[1,1,1]);

// 4 Avain paneelista: sarake voittaa tiedoston, '-' korvaa
tb.lak=cA.id;KK.repair(P);A.strictEqual(tb.lak,cA.id);
var r5=KK.haeSovella(P,tb.id,JSON.stringify({avain:'paiva',rivit:[{askeleet:300,Mieliala:'väsy'}]}),C);A.strictEqual(r5.kanta,cA.id);A.strictEqual(r5.n.m,1);
tb.lak='-';var r6=KK.haeSovella(P,tb.id,'paiva,askeleet\n2026-10-20,10\n\n2026-10-21,"1 200"\n',C);
A.deepStrictEqual(KK.tRows(P,tb.id).map(function(r){return [r.a[cP.id].d,r.a[cA.id]];}),[['2026-10-20',10],['2026-10-21',1200]],'ilman avainta CSV korvaa');A.strictEqual(r6.n.u,2);
tb.lak='c99';KK.repair(P);A.ok(!('lak' in tb),'poistettu sarake avaimena korjataan pois');
// Rivilista ja ISO-aikaleima ajankohdaksi
var t2=KK.addBlock(P,'taulu',{lp:'tuonnit/uni.json'});KK.addNode(P,t2.id,0,300,'');var cAi=KK.addCol(t2,'alku','aika'),cD=KK.addCol(t2,'pv','pvm');KK.repair(P);
KK.haeSovella(P,t2.id,'[{"alku":"2026-10-16T23:10:00+03:00","pv":"2026-10-17T07:00:00+03:00"}]',C);
var rr=KK.tRows(P,t2.id)[0];A.strictEqual(rr.a[cAi.id].ms,Date.parse('2026-10-16T23:10:00+03:00'));A.ok(KK.isD(rr.a[cD.id]));
// Katsaus: uudet sarakkeet lajeineen, ei muutoksia
var s0=JSON.stringify(P),ks=KK.haeKatsaus(P,t2.id,JSON.stringify({rivit:[{alku:'2026-10-16T22:00',uni_h:7.5,ok:true,huom:'x',syke:'54'}]}));A.strictEqual(JSON.stringify(P),s0);
A.deepStrictEqual(ks.uudet,[{nm:'uni_h',laji:'luku'},{nm:'ok',laji:'kylla'},{nm:'huom',laji:'teksti'},{nm:'syke',laji:'luku'}]);
A.strictEqual(KK.haeLaji(['2026-10-16T22:00']),'aika');

// 5 Toiminto Hae: pyyntö käyttöliittymälle, sitten heti; ilman lähdettä virhe; ilman käyttöliittymää virhe
var h=KK.addBlock(P,'tee',{do:'hae',o:tb.id});KK.addNode(P,h.id,0,600,'');KK.repair(P);
A.strictEqual(KK.tauluIssue(P,h,tb),'');KK.runAction(P,h.id,C,0);A.deepStrictEqual(calls,[tb.id]);
A.ok(/Hae tiedostosta → Terveys \(tuonnit\/terveys.json\)/.test(KK.descAct(P,h.id)),KK.descAct(P,h.id));
var t3=KK.addBlock(P,'taulu',{});KK.addNode(P,t3.id,0,700,'');var h3=KK.addBlock(P,'tee',{do:'hae',o:t3.id});KK.addNode(P,h3.id,0,750,'');KK.repair(P);
A.ok(/lähdettä/.test(KK.tauluIssue(P,h3,t3)));var e3=KK.runAction(P,h3.id,C,0);A.ok(e3&&/lähdettä/.test(e3.err));A.strictEqual(calls.length,1);
var e4=KK.runAction(P,h.id,{now:C.now,toast:function(){}},0);A.ok(e4&&/auki olevassa/.test(e4.err));
var h5=KK.addBlock(P,'tee',{do:'hae',o:lk.id});KK.addNode(P,h5.id,0,800,'');KK.repair(P);var e5=KK.runAction(P,h5.id,C,0);A.ok(e5&&/ei ole Tietotaulukko/.test(e5.err));
A.ok(KK.DOS.hae==='Hae tiedostosta');

// 6 Korjaus: roskat pois, tila säilyy, vanha projekti ennallaan
P.st['hk:'+tb.id].roska=1;P.st['hk:'+tb.id].n.o=['a',5];P.st['hk:zz']={ok:1};P.st['hk:'+lk.id]={ok:1};t2.lp='   ';KK.repair(P);
A.ok(!('roska' in P.st['hk:'+tb.id]));A.ok(P.st['hk:'+tb.id].ok>0);A.ok(P.st['hk:'+tb.id].n.o.every(function(x){return typeof x==='string';}));
A.ok(!('hk:zz' in P.st));A.ok(!('hk:'+lk.id in P.st),'vain taulukolle');A.ok(!('lp' in t2),'tyhjä lähde pois');
var vanha=KK.newProject('vanha'),vt=KK.addBlock(vanha,'taulu',{});KK.addNode(vanha,vt.id,0,0,'');KK.addCol(vt,'a','teksti');KK.repair(vanha);var vs=JSON.stringify(vanha.b);
KK.repair(vanha);A.strictEqual(JSON.stringify(vanha.b),vs,'vanha taulukko ennallaan');A.ok(!('lp' in vt)&&!('lak' in vt));
// Taulukon poisto vie tilan
t2.lp='tuonnit/uni.json';KK.haeSovella(P,t2.id,'[{"alku":"2026-10-16T23:10"}]',C);A.ok(P.st['hk:'+t2.id]);
delete P.b[t2.id];KK.repair(P);A.ok(!('hk:'+t2.id in P.st),'taulukon poisto vie haun tilan');
console.log('ok: hae rivitiedosto');
