// Jonon 12g (F41, suunnitelma 25 kohta 3.5 ja 7.8): kaavassa ei funktioita. Sulut ryhmittelevät, jos (ehto) a muuten b ja
// jos ehto niin a muuten b, muuten jos ketjuttuu, a ja b, a tai b (laskut > vertailut > ja > tai > jos). Vanhat jos(;;),
// ja(;), tai(;) muuttuvat kirjoitettaessa ja repairissa (palikat, Toiminnon kentät, lukituskuvat, presetit, suosikit);
// tallennusversio 9; varatut sanat eivät kelpaa viitteeksi (ja → ja_2); version 8 lukituskuva jatkaa.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,18,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
function N(P,b){return KK.addNode(P,b.id,0,0,'');}
function V(P,b){return KK.Ev(P,C).val(b.id);}
function K(P,s){var k=KK.addBlock(P,'kaava');k.f=KK.kaavaToIds(P,s);N(P,k);KK.repair(P);return k;}
A.ok(KK.VER>=9,'tallennusversio vähintään 9');

var P=KK.newProject('sulut');
var uni=KK.addBlock(P,'saadin',{nm:'Uni',min:0,max:12,start:8});N(P,uni);
var sar=KK.addBlock(P,'luku',{nm:'Sarake'});N(P,sar);KK.repair(P);KK.userSet(P,sar.id,3,C);
function ev(s){return V(P,K(P,s));}
function txt(s){return KK.kaavaToText(P,K(P,s).f);}
function err(s,re){var v=ev(s);A.ok(KK.isErr(v),s+' pitäisi olla virhe');A.ok(re.test(v.err),s+' → '+v.err);}

// Laskusulut (Headmaze 15 a)
A.strictEqual(ev('(sarake - 1) * 80 + 28'),188);A.strictEqual(ev('(1 + 2) * 3'),9);A.strictEqual(ev('((1 + 2) * (3 - 1)) / 2'),3);
A.strictEqual(ev('-(sarake + 1)'),-4);A.strictEqual(ev('(uni > 7)'),true);
// jos kahdella tavalla, kirjoitettu muoto säilyy
A.strictEqual(ev('jos (uni > 7) "hyvä" muuten "huono"'),'hyvä');A.strictEqual(ev('jos uni > 7 niin "hyvä" muuten "huono"'),'hyvä');
A.strictEqual(txt('jos uni > 7 niin "hyvä" muuten "huono"'),'jos uni > 7 niin "hyvä" muuten "huono"','niin-muoto säilyy');
A.strictEqual(txt('jos (uni > 7) "hyvä" muuten "huono"'),'jos (uni > 7) "hyvä" muuten "huono"','sulkumuoto säilyy');
A.strictEqual(ev('JOS (uni < 7) 1'),null,'muuten-osa valinnainen, isot kirjaimet');
A.strictEqual(ev('jos (uni > 9) "a" muuten jos (uni > 5) "b" muuten "c"'),'b','muuten jos ketjuttuu');
A.strictEqual(ev('jos (sarake + 1) * 2 > 7 niin 1 muuten 2'),1,'sulku ehdon alussa, niin perässä');
A.strictEqual(ev('jos (uni > 7) (sarake - 1) * 2 muuten 0'),4,'sulku seurauksessa');
A.strictEqual(ev('jos (uni > 7) -1 muuten 2'),-1);
A.strictEqual(ev('2 * (jos (uni > 7) 10 muuten 1)'),20,'laskun keskellä sulkuihin');
A.strictEqual(ev('jos (jos (uni > 1) kyllä muuten ei) "x"'),'x','jos ehdossa');
A.strictEqual(ev('jos (uni > 7) jos (sarake > 5) "a" muuten "b" muuten "c"'),'b','sisäkkäinen kyllä-osassa: muuten kuuluu lähimmälle');
// Vain valittu osa lasketaan
A.strictEqual(ev('jos (uni > 7) 1 muuten 1 / 0'),1);A.ok(KK.isErr(ev('jos (uni < 7) 1 muuten 1 / 0')));
// ja, tai ja järjestys
A.strictEqual(ev('uni > 7 ja sarake < 5'),true);A.strictEqual(ev('uni > 7 ja sarake > 5'),false);
A.strictEqual(ev('uni < 7 tai sarake > 5'),false);A.strictEqual(ev('uni < 7 tai sarake < 5 tai kyllä'),true);
A.strictEqual(ev('kyllä tai ei ja ei'),true,'ja ennen tai: kyllä tai (ei ja ei)');A.strictEqual(ev('(kyllä tai ei) ja ei'),false,'sulut muuttavat järjestyksen');
A.strictEqual(ev('jos (uni > 7 ja (sarake < 2 tai sarake > 2)) "kyllä" muuten "ei"'),'kyllä');
A.strictEqual(ev('uni + 1 > 8 ja sarake * 2 = 6'),true,'laskut ennen vertailua ennen ja');
A.ok(KK.isErr(ev('kyllä tai 1 / 0')),'ja/tai näyttävät virheen');
// Kaavan tulos
var tul=KK.addBlock(P,'tulos',{nm:'Arvio'});N(P,tul);var kt=K(P,'arvio = jos (uni > 7) "levännyt" muuten "väsynyt"');
A.strictEqual(V(P,kt),'levännyt');A.strictEqual(V(P,tul),'levännyt');
var tul2=KK.addBlock(P,'tulos',{nm:'Leveys'});N(P,tul2);var kt2=K(P,'leveys = (sarake + 1) * 2');A.strictEqual(V(P,tul2),8,'kaavan tulos: sulut');
// Virheet selvällä suomella
err('(uni + 1',/sulku jäi auki/);err('uni + 1)',/ilman avaavaa/);err('()',/tyhjät sulut/);err('(uni +)',/ennen sulkua/);
err('jos uni > 7 "x"',/sulkuihin tai niin/);err('jos (uni > 7)',/kyllä-osa puuttuu/);err('jos (uni > 7) 1 muuten',/muuten-osa jäi tyhjäksi/);
err('2 * jos (uni > 7) 1',/sulkuihin: 2 \* \(jos/);err('muuten 1',/muuten ilman jos/);err('niin 1',/niin kuuluu/);err('ja uni',/molemmille puolille/);
err('uni > 7 ja',/kesken/);err('uni > 5 > 2',/vain yksi vertailu/);err('uni; 2',/puolipistettä ei käytetä/);err('uni > 7, 1',/desimaalimerkki/);
// Miksi?: kumpi osa valittiin, ehto tekstinä (sulut vain tarvittaessa)
var km=K(P,'jos (uni > 9) "a" muuten jos ((sarake + 1) * 2 > 7 ja uni > 1) "b" muuten "c"');var w=KK.why(P,KK.Ev(P,C),km.id,2,{});
A.ok(/Ehto ”uni > 9” ei päde, joten jos valitsi muuten-osan/.test(w.txt),w.txt);
A.ok(/Ehto ”\(sarake \+ 1\) × 2 > 7 ja uni > 1” pätee/.test(w.txt),w.txt);

// Vanha muoto → uusi (tallennettuna ja kirjoitettuna)
var VA=[['jos(uni > 7; "hyvä"; "huono")','jos (uni > 7) "hyvä" muuten "huono"'],['Jos (uni < 7; 2,5; 0)','jos (uni < 7) 2,5 muuten 0'],
 ['jos(uni < 7;; "x")','jos (uni < 7) tyhjä muuten "x"'],['jos(uni > 7; 1)','jos (uni > 7) 1'],['jos(uni > 7; 1;)','jos (uni > 7) 1'],
 ['jos(uni > 7; 10; 20) + 1','(jos (uni > 7) 10 muuten 20) + 1'],['"Uni: " + jos(uni > 7; "a"; "b")','"Uni: " + (jos (uni > 7) "a" muuten "b")'],
 ['jos(uni >= 8; "a"; jos(uni >= 6; "b"; "c"))','jos (uni >= 8) "a" muuten jos (uni >= 6) "b" muuten "c"'],
 ['jos(uni > 1; jos(uni > 2; "a"; "b"); "c")','jos (uni > 1) (jos (uni > 2) "a" muuten "b") muuten "c"'],
 ['jos(ja(uni > 7; tai(uni < 3; uni > 5)); "k"; "e")','jos (uni > 7 ja (uni < 3 tai uni > 5)) "k" muuten "e"'],
 ['tai(ja(uni > 1; uni < 9); uni = 0)','uni > 1 ja uni < 9 tai uni = 0'],['TAI(uni < 7; uni < 50; kyllä)','uni < 7 tai uni < 50 tai kyllä'],
 ['ja(uni)','uni ja kyllä'],['tai(uni)','uni tai ei'],['ja(uni > 1; uni < 9) = kyllä','(uni > 1 ja uni < 9) = kyllä'],
 ['jos(uni > 7; "a;b"; "c")','jos (uni > 7) "a;b" muuten "c"'],['arvio = jos(uni > 7; 1; 2)','arvio = jos (uni > 7) 1 muuten 2'],
 ['"a;b" + 1','"a;b" + 1'],['jos (uni > 7) 1 muuten 2','jos (uni > 7) 1 muuten 2'],['jos(uni > 7; 1','jos(uni > 7; 1']];
VA.forEach(function(x){A.strictEqual(KK.kaavaVanha(x[0]),x[1],x[0]);});
A.strictEqual(KK.kaavaVanha('{#a1} > 1 ja ({#a2} tai {#a3})'),'{#a1} > 1 ja ({#a2} tai {#a3})','uusi muoto ennallaan');
A.strictEqual(KK.kaavaVanha('jos({#a1}.ja > 1; {#a2}; ja({#a3}; {#a4}))'),'jos ({#a1}.ja > 1) {#a2} muuten {#a3} ja {#a4}','tunnisteet ja ominaisuus .ja');
// Arvo säilyy muunnoksessa
[['jos(uni > 7; 10; 20) + 1',11],['jos(uni >= 8; "a"; jos(uni >= 6; "b"; "c"))','a'],['ja(uni)',true],['tai(tyhjä)',false],['jos(tyhjä; 1; 2)',2],
 ['jos(uni < 7;; "x")','x'],['jos(ja(uni > 7; tai(uni < 3; uni > 5)); "k"; "e")','k']].forEach(function(x){A.strictEqual(ev(x[0]),x[1],x[0]);});

// Varatut sanat: viitteeksi ei kelpaa, vanha viite vaihtuu (kaavat säilyvät, koska ne tallentavat tunnisteen)
['jos','ja','tai','muuten','niin'].forEach(function(w){A.ok(!KK.validVt(w),w+' varattu');A.ok(KK.KW[w]);});
var Q=KK.newProject('varattu');var jb=KK.addBlock(Q,'jos');A.strictEqual(jb.vt,'jos_2','JOS-palikan oletusviite ei ole varattu sana');
var jb2=KK.addBlock(Q,'jos');A.ok(KK.validVt(jb2.vt)&&jb2.vt!==jb.vt,'toinen JOS: '+jb2.vt);

// Repair: versio 8 -tallennus vanhoilla kaavoilla ja varatuilla viitteillä
var R=KK.newProject('vanha');var a=KK.addBlock(R,'luku',{nm:'Ja'});var t=KK.addBlock(R,'luku',{nm:'Tai'});N(R,a);N(R,t);
var kv=KK.addBlock(R,'kaava');N(R,kv);var tb=KK.addBlock(R,'taulu',{nm:'T'});N(R,tb);var col=KK.addCol(tb,'A','luku');
var tee=KK.addBlock(R,'tee',{do:'lisaarivi',o:tb.id});N(R,tee);KK.repair(R);
var J=JSON.parse(JSON.stringify(R));J.b[a.id].vt='ja';J.b[t.id].vt='tai';
J.b[kv.id].f='jos(ja({#'+a.id+'} > 1; tai({#'+t.id+'} = 0; {#'+t.id+'} > 5)); "on"; "ei")';J.b[tee.id].kv={};J.b[tee.id].kv[col.id]='tai({#'+a.id+'}; 0)';
var Dt=KK.repairData({app:'appiappi',ver:8,projects:[J],cur:J.id,presetit:[{id:'pr1',nm:'P',ver:8,pv:1,b:{x1:{id:'x1',k:'kaava',nm:'K',vt:'k',f:'jos(1 > 0; "a"; "b")'}},n:[],l:[]}],
  suos:[{k:'kaava',p:{f:'ja(1; 2)'},l:'K',i:'ƒ',h:0}]});
A.strictEqual(Dt.ver,KK.VER);var R2=Dt.projects[0];
A.strictEqual(R2.b[a.id].vt,'ja_2','varattu viite vaihtuu');A.strictEqual(R2.b[t.id].vt,'tai_2');
A.strictEqual(R2.b[kv.id].f,'jos ({#'+a.id+'} > 1 ja ({#'+t.id+'} = 0 tai {#'+t.id+'} > 5)) "on" muuten "ei"','kaava muuntui');
A.strictEqual(KK.kaavaToText(R2,R2.b[kv.id].f),'jos (ja_2 > 1 ja (tai_2 = 0 tai tai_2 > 5)) "on" muuten "ei"','näkyy uusilla viitteillä');
KK.userSet(R2,a.id,3,C);A.strictEqual(V(R2,R2.b[kv.id]),'on');
A.strictEqual(R2.b[tee.id].kv[col.id],'{#'+a.id+'} tai 0','Toiminnon kenttä muuntui');
A.strictEqual(Dt.presetit[0].b.x1.f,'jos (1 > 0) "a" muuten "b"','presetti muuntui');A.strictEqual(Dt.presetit[0].ver,KK.VER);
A.strictEqual(Dt.suos[0].p.f,'1 ja 2','suosikki muuntui');
var once=JSON.stringify(R2);KK.repair(R2);A.strictEqual(JSON.stringify(R2),once,'repair on vakaa');

// Lukittu ketju, jonka kuva on versiosta 8 ja vanhalla kaavalla, jatkaa (kartoitus 7, U4)
var L=KK.newProject('lukko');var k=KK.addBlock(L,'ketju',{nm:'Ketju',lk:2});var wn=KK.addNode(L,k.id,0,0);
var las=KK.addBlock(L,'muisti',{nm:'Laskuri'}),lue=KK.addBlock(L,'muisti',{nm:'Lue'});KK.addNode(L,las.id,-400,0);KK.addNode(L,lue.id,-400,80);
var lk=KK.addBlock(L,'kaava',{nm:'Valinta'});KK.addNode(L,lk.id,-400,160);lk.f=KK.kaavaToIds(L,'jos (laskuri > 5) 100 muuten 200');
var s1=KK.addBlock(L,'ajastin',{kesto:'10',yks:'s'}),n1=KK.addNode(L,s1.id,0,60,wn.id);
var s2=KK.addBlock(L,'tee',{do:'aseta',o:lue.id,v:{r:lk.id}}),n2=KK.addNode(L,s2.id,0,120,wn.id);KK.addLink(L,n1.id,'e',n2.id,'e');
KK.repair(L);L.st[las.id]=0;KK.chainStart(L,k.id,C);A.strictEqual(L.st[k.id].run,true);
var JL=JSON.parse(JSON.stringify(L));var sn=JL.st[k.id].snap;A.strictEqual(sn.ver,KK.VER);sn.ver=8;sn.b[lk.id].f='jos({#'+las.id+'} > 5; 100; 200)';JL.b[lk.id].f=sn.b[lk.id].f;
var L2=KK.repair(JL);A.strictEqual(L2.st[k.id].snap.ver,KK.VER,'kuva nousi nykyiseen versioon');A.strictEqual(L2.st[k.id].snap.b[lk.id].f,'jos ({#'+las.id+'} > 5) 100 muuten 200');
L2.st[las.id]=50;NOW+=10000;KK.chainPoll(L2,C);A.ok(!L2.st[k.id].err,'ei virhettä: '+L2.st[k.id].err);A.strictEqual(KK.Ev(L2,C).val(lue.id),200,'luki kuvasta (laskuri oli 0)');

console.log('ok kaavan sulut ja jos');
