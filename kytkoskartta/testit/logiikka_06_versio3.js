// Versio 3: hakutaulukko, piilotetun syötteen arvo (säilyy / palautuu alkuun / pois laskuista),
// piilotuksen tilat ja pikaluonnin tuottama rakenne (napit + VAIN YKSI -ikkuna + VALITSE + SUMMA).
var KK=require('./moottori.js'),A=require('assert');
var T=new Date(2026,9,14,9,30);var C={now:function(){return T;},toast:function(){},nav:function(){}};
function N(P,b,g){return KK.addNode(P,b.id,0,0,g||'');}
function V(P,b,p){return KK.Ev(P,C).val(b.id,p);}

// --- Hakutaulukko: välit, täsmälleen, rajattomat päät, muuten ---
var P=KK.newProject('haku');
var s=KK.addBlock(P,'saadin',{min:0,max:20,start:3}),h=KK.addBlock(P,'haku',{rivit:[
  {m:'vali',a:'',b:'5',t:'Vähän'},{m:'vali',a:'5',b:'10',t:'Kohtalaisesti'},{m:'vali',a:'10',b:'',t:'Paljon'}]});
var ns=N(P,s),nh=N(P,h);KK.addLink(P,ns.id,'v',nh.id,'a');KK.repair(P);
A.strictEqual(V(P,h),'Vähän','3 < 5');
KK.userSet(P,s.id,5,C);A.strictEqual(V(P,h),'Kohtalaisesti','5 kuuluu riville 5–alle 10 (alaraja mukaan)');
KK.userSet(P,s.id,9.99,C);A.strictEqual(V(P,h),'Kohtalaisesti');
KK.userSet(P,s.id,10,C);A.strictEqual(V(P,h),'Paljon','yläraja ei kuulu riviin');
var E=KK.Ev(P,C);A.strictEqual(E.hakuRow(h.id).i,2);
var w=KK.why(P,E,h.id,3);A.ok(/osuu riviin 3 \(vähintään 10\), joten tulos on Paljon/.test(w.txt),w.txt);
A.strictEqual(KK.hakuDesc(P,h.rivit[0]),'alle 5');A.strictEqual(KK.hakuDesc(P,h.rivit[1]),'5 – alle 10');
// järjestys ratkaisee: ensimmäinen osuva rivi voittaa
h.rivit.unshift({m:'vali',a:'',b:'',t:'Kaikki'});A.strictEqual(V(P,h),'Kaikki','tyhjä rivi osuu kaikkeen');h.rivit.shift();
// muuten ja tyhjä tulos
h.rivit=[{m:'vali',a:'0',b:'5',t:'Vähän'}];h.muuten='Paljon';A.strictEqual(V(P,h),'Paljon','muuten-arvo');
h.muuten='';A.strictEqual(V(P,h),null,'ei muuten-arvoa = tyhjä');
h.rivit=[{m:'vali',a:'10',b:'',t:''}];A.strictEqual(V(P,h),null,'osuva rivi ilman tulosta = tyhjä');
// luku tuloksena
h.rivit=[{m:'vali',a:'0',b:'',t:'2,5'}];A.strictEqual(V(P,h),2.5,'tulos voi olla luku');
// täsmälleen tekstillä ja kirjainkoko ei ratkaise
var P2=KK.newProject('teksti');var tk=KK.addBlock(P2,'teksti'),h2=KK.addBlock(P2,'haku',{rivit:[{m:'on',a:'kyllä',t:1},{m:'on',a:'Ei',t:0}],muuten:'?'});
var nt=N(P2,tk),nh2=N(P2,h2);KK.addLink(P2,nt.id,'v',nh2.id,'a');KK.repair(P2);
A.strictEqual(V(P2,h2),'?','tyhjä arvo → muuten');
KK.userSet(P2,tk.id,'Kyllä',C);A.strictEqual(V(P2,h2),1,'täsmälleen ilman kirjainkokoa, repair muutti luvun tekstiksi ja lit takaisin luvuksi');
KK.userSet(P2,tk.id,'ei',C);A.strictEqual(V(P2,h2),0);
KK.userSet(P2,tk.id,'ehkä',C);A.strictEqual(V(P2,h2),'?');
A.strictEqual(typeof h2.rivit[0].t,'string','repair tallentaa tulokset tekstinä');
// viittaus tuloksessa ja yhteyksissä
var P3=KK.newProject('viittaus');var nimi=KK.addBlock(P3,'teksti'),lu=KK.addBlock(P3,'luku',{start:7}),h3=KK.addBlock(P3,'haku',{a:{r:lu.id},rivit:[{m:'vali',a:'5',b:'',t:'Hei {#'+nimi.id+'}'}]});
N(P3,h3);KK.repair(P3);KK.userSet(P3,nimi.id,'Emil',C);A.strictEqual(V(P3,h3),'Hei Emil','{Nimi} tuloksessa ja arvo palikasta');
var D=KK.deps(P3);A.ok(D.usedBy[nimi.id].some(function(x){return x.id===h3.id;}),'tuloksen viittaus näkyy yhteyksissä');
A.ok(D.usedBy[lu.id].some(function(x){return x.id===h3.id;}),'arvon palikka näkyy yhteyksissä');
// virhe kulkee läpi
var P4=KK.newProject('virhe');var lk=KK.addBlock(P4,'lasku',{op:'div',a:1,b:0}),h4=KK.addBlock(P4,'haku',{rivit:[{m:'vali',a:'',b:'',t:'x'}]});
var nl=N(P4,lk),nh4=N(P4,h4);KK.addLink(P4,nl.id,'v',nh4.id,'a');A.ok(KK.isErr(V(P4,h4)),'virhe ei muutu hiljaa tulokseksi');
// arvo puuttuu
var P5=KK.newProject('tyhjä');var h5=KK.addBlock(P5,'haku');N(P5,h5);KK.repair(P5);A.deepStrictEqual(h5.rivit,[]);
A.ok(/Arvo puuttuu/.test(KK.why(P5,KK.Ev(P5,C),h5.id,2).txt));
// repair siivoaa rikkinäiset rivit
h5.rivit=[null,'x',{m:'outo',a:3,b:null,t:{}}];KK.repair(P5);A.deepStrictEqual(h5.rivit,[{m:'vali',a:'3',b:'',t:''}]);
A.deepStrictEqual(KK.ports(h5).ins.map(function(p){return p.p;}),['a']);A.deepStrictEqual(KK.ports(h5).outs.map(function(p){return p.p;}),['v']);

// --- Piilotetun syötteen arvo ---
var Q=KK.newProject('piilo');
var nayta=KK.addBlock(Q,'kytkin',{nm:'Näytä'}),a=KK.addBlock(Q,'luku',{start:2,nk:{m:'kun',r:nayta.id}}),b2=KK.addBlock(Q,'luku',{start:3});
var sum=KK.addBlock(Q,'ikkuna',{m:'sum'});var wn=N(Q,sum);N(Q,a,wn.id);N(Q,b2,wn.id);KK.repair(Q);KK.tick(Q,C);
KK.userSet(Q,nayta.id,true,C);KK.userSet(Q,a.id,10,C);A.strictEqual(V(Q,sum),13);
// säilyy (oletus)
KK.userSet(Q,nayta.id,false,C);A.strictEqual(V(Q,sum),13,'oletus: arvo säilyy ja on laskuissa');A.strictEqual(a.nka,undefined,'ei uutta kenttää vanhoille palikoille');
// pois laskuista
a.nka='pois';A.strictEqual(V(Q,sum),3,'piilossa = tyhjä laskuissa');A.strictEqual(Q.st[a.id],10,'arvo on silti tallessa');
KK.userSet(Q,nayta.id,true,C);A.strictEqual(V(Q,sum),13,'näkyviin tultua mukana taas');
A.ok(/Arvo ei ole mukana laskuissa/.test(KK.why(Q,(KK.userSet(Q,nayta.id,false,C),KK.Ev(Q,C)),a.id,2).txt));
// palautuu alkuun
a.nka='alku';KK.userSet(Q,nayta.id,true,C);KK.userSet(Q,a.id,10,C);A.strictEqual(V(Q,sum),13);
KK.userSet(Q,nayta.id,false,C);A.strictEqual(Q.st.hasOwnProperty(a.id),false,'piiloutuessa arvo palautuu alkuun');A.strictEqual(V(Q,sum),5,'alkuarvo 2 + 3');
KK.userSet(Q,nayta.id,true,C);A.strictEqual(V(Q,sum),5,'ei palaa entiseen, kun tulee taas näkyviin');
// palautus ketjuuntuu: JOS reagoi palautettuun arvoon samalla tick-kierroksella
var Q2=KK.newProject('ketju');var t1=[];var C2={now:C.now,nav:C.nav,toast:function(x){t1.push(x);}};
var vis=KK.addBlock(Q2,'kytkin'),rt=KK.addBlock(Q2,'ruutu',{nk:{m:'kun',r:vis.id},nka:'alku'}),jo=KK.addBlock(Q2,'jos',{muuten:true}),il=KK.addBlock(Q2,'tee',{do:'ilmoita',tx:'rasti pois'});
var nr=N(Q2,rt),nj=N(Q2,jo),ni=N(Q2,il);KK.addLink(Q2,nr.id,'v',nj.id,'c');KK.addLink(Q2,nj.id,'m',ni.id,'e');KK.repair(Q2);KK.tick(Q2,C2);
KK.userSet(Q2,vis.id,true,C2);KK.userSet(Q2,rt.id,true,C2);KK.userSet(Q2,vis.id,false,C2);
A.strictEqual(V(Q2,rt),false);A.deepStrictEqual(t1,['rasti pois'],'MUUTEN laukesi, kun piilotettu rasti palautui');
// repair: tuntemattomat arvot pois, mem-avain siivoutuu poistossa
a.nka='outo';a.nkt='hassu';KK.repair(Q);A.strictEqual(a.nka,undefined);A.strictEqual(a.nkt,'piilo');
A.ok(Q2.mem.hasOwnProperty('h'+rt.id));KK.removeBlock(Q2,rt.id);KK.tick(Q2,C2);A.ok(!Q2.mem.hasOwnProperty('h'+rt.id),'muistin avain siivoutui');
// vain luettava ja harmaa eivät muuta arvoa
var Q3=KK.newProject('luku');var ehto=KK.addBlock(Q3,'kytkin'),kk=KK.addBlock(Q3,'luku',{start:4,nk:{m:'kun',r:ehto.id},nkt:'luku',nks:'Vastaa ensin'});KK.repair(Q3);
A.strictEqual(V(Q3,kk),4);A.strictEqual(kk.nkt,'luku');A.ok(/vain luettavana/.test(KK.why(Q3,KK.Ev(Q3,C),kk.id,2).txt));

// --- Pikaluonnin rakenne: napit VAIN YKSI -ikkunassa (valinta poistaa muut) + VALITSE + SUMMA ---
var R=KK.newProject('ryhmä');
var opts=[['Vähän',1],['Kohtalaisesti',2],['Paljon',3]];
var ryh=KK.addBlock(R,'ikkuna',{m:'one',pakota:true,nm:'Mieliala'}),rn=N(R,ryh);
var su=KK.addBlock(R,'ikkuna',{m:'sum',nm:'Mieliala: pisteet'}),sn=N(R,su);
var btn=opts.map(function(o){var b=KK.addBlock(R,'nappi',{tx:o[0],beh:'pohjaan',nm:'Mieliala: '+o[0]});var bn=N(R,b,rn.id);
  var va=KK.addBlock(R,'valitse',{a:String(o[1]),b:''});var vn=N(R,va,sn.id);KK.addLink(R,bn.id,'v',vn.id,'c');return b;});
KK.repair(R);KK.tick(R,C);
A.strictEqual(V(R,ryh),false,'ei vastattu');A.strictEqual(V(R,su),0);
KK.press(R,btn[1].id,C);A.strictEqual(V(R,ryh),true,'vastaus annettu');A.strictEqual(V(R,su),2);
KK.press(R,btn[2].id,C);A.strictEqual(V(R,btn[1]),false,'valinta poisti muut');A.strictEqual(V(R,su),3);
KK.press(R,btn[2].id,C);A.strictEqual(V(R,ryh),false,'toinen painallus poistaa vastauksen');A.strictEqual(V(R,su),0);
A.strictEqual(KK.Ev(R,C).members(ryh.id).length,3,'napit ovat ryhmän jäseniä, vaikka niiden arvo menee VALITSE-palikkaan');
ryh.m='or';ryh.pakota=false;KK.press(R,btn[0].id,C);KK.press(R,btn[2].id,C);A.strictEqual(V(R,su),4,'ikkunan tyypin vaihto: valitse monta');

// --- Vanha versio 2 -projekti avautuu ennallaan ---
var O=KK.newProject('vanha');var ok=KK.addBlock(O,'kytkin'),ol=KK.addBlock(O,'luku',{start:5,nk:{m:'kun',r:ok.id},nkt:'harmaa'});
var before=JSON.stringify(O);KK.repair(O);A.strictEqual(JSON.stringify(O),before,'repair ei lisää uusia kenttiä vanhaan projektiin');
A.strictEqual(V(O,ol),5);
A.strictEqual(KK.VER,3);
console.log('ok versio 3');
