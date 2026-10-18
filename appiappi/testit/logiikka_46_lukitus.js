// P1b: ketjun kolme lukitustilaa (suunnitelma 02, päätökset D05, D07, D09, D10). 0 ajantasainen, 1 lukitse ulkopuolisilta
// muutoksilta, 2 lukitse kaikilta muutoksilta. Lukitus koskee lukemista; toiminnot kirjoittavat aina oikeaan käyttötietoon.
// Tila luetaan ajantasaisena uuden vaiheen alussa, vaihto ottaa uuden kuvan. Ajotila (Toista, ajastin, odotus) ei jäädy.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function val(P,id){return KK.Ev(P,C).val(id);}
/* Ketju: vaiheet annetussa järjestyksessä yhteen jonoon. */
function mk(lk){
  var P=KK.newProject('lukitus');var k=KK.addBlock(P,'ketju',{nm:'Harjoitus'});if(lk)k.lk=lk;var w=KK.addNode(P,k.id,0,0);
  var las=KK.addBlock(P,'muisti',{nm:'Laskuri'}),lue=KK.addBlock(P,'muisti',{nm:'Lue'});KK.addNode(P,las.id,-400,0);KK.addNode(P,lue.id,-400,80);
  var y=0,prev=null;
  function step(kind,props){var b=KK.addBlock(P,kind,props||{});var n=KK.addNode(P,b.id,0,y+=60,w.id);if(prev)KK.addLink(P,prev.id,'e',n.id,'e');prev=n;return {b:b,n:n};}
  return {P:P,k:k,w:w,las:las,lue:lue,step:step,
    aseta:function(o,v){return step('tee',{do:'aseta',o:o.id,v:v});},
    ajastin:function(sek){return step('ajastin',{kesto:String(sek),yks:'s'});},
    run:function(){return KK.chainStart(P,k.id,C);},cs:function(){return P.st[k.id];}};
}
function kulu(X,ms){NOW+=ms;KK.chainPoll(X.P,C);}
function ext(X,b,v){KK.setVal(X.P,b.id,v,C);} // ulkopuolinen kirjoitus (ei ketjun vaihe)

// Rekisteri: lukitus ja lukitusnimi, perusarvo 0, kaavaviite
var X=mk();var es=KK.omat(X.k);var le=es.filter(function(e){return e.p==='lukitus';})[0];
A.ok(le&&le.o&&le.t==='luku','lukitus on ohjattava luku');A.ok(es.some(function(e){return e.p==='lukitusnimi';}));
A.deepStrictEqual(KK.LKN,['Ajantasainen','Lukitse ulkopuolisilta muutoksilta','Lukitse kaikilta muutoksilta']);A.deepStrictEqual(KK.LKID,['live','external','all']);
var E=KK.Ev(X.P,C);A.strictEqual(E.prop(X.k.id,'lukitus'),0);A.strictEqual(E.prop(X.k.id,'lukitusnimi'),'Ajantasainen');
X.k.lk=2;E=KK.Ev(X.P,C);A.strictEqual(E.prop(X.k.id,'lukitus'),2);A.strictEqual(E.prop(X.k.id,'lukitusnimi'),'Lukitse kaikilta muutoksilta');
var kv=KK.addBlock(X.P,'kaava');kv.f=KK.kaavaToIds(X.P,'harjoitus.lukitus + 1');A.strictEqual(val(X.P,kv.id),3,'kaava harjoitus.lukitus');
A.ok(!KK.ports(X.k).ins.some(function(p){return p.p==='o_lukitus';}),'ohjauskohta vain avattuna');X.k.ohk=['lukitus'];A.ok(KK.ports(X.k).ins.some(function(p){return p.p==='o_lukitus';}));

// Koe 1: lähtöarvo 2, ulkopuoli muuttaa 5:een odotuksen aikana → tila 0 lukee 5, tilat 1/2 lukevat 2
[[0,5],[1,2],[2,2]].forEach(function(c){var X=mk(c[0]);X.P.st[X.las.id]=2;X.ajastin(10);X.aseta(X.lue,{r:X.las.id});
  X.run();A.strictEqual(X.cs().lk,c[0]);A.strictEqual(!!X.cs().snap,c[0]>0,'kuva vain lukittuna');
  ext(X,X.las,5);kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),c[1],'koe 1 tila '+c[0]);A.strictEqual(val(X.P,X.las.id),5,'oikea arvo 5');A.strictEqual(X.cs().run,false);});

// Koe 2: lähtöarvo 0, ketju asettaa 1 ja lukee → tilat 0/1 lukevat 1, tila 2 lukee 0; oikea kohde 1 kaikissa
[[0,1],[1,1],[2,0]].forEach(function(c){var X=mk(c[0]);X.P.st[X.las.id]=0;X.aseta(X.las,'1');X.aseta(X.lue,{r:X.las.id});X.run();
  A.strictEqual(val(X.P,X.lue.id),c[1],'koe 2 tila '+c[0]);A.strictEqual(val(X.P,X.las.id),1,'kirjoitus oikeaan tietoon');});

// Koe 3: oma kirjoitus 1, sitten ulkoinen 7 → tila 1 lukee oman 1, tila 0 lukee 7, tila 2 lähtökuvan 0
[[0,7],[1,1],[2,0]].forEach(function(c){var X=mk(c[0]);X.P.st[X.las.id]=0;X.aseta(X.las,'1');X.ajastin(10);X.aseta(X.lue,{r:X.las.id});X.run();
  A.strictEqual(val(X.P,X.las.id),1);ext(X,X.las,7);kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),c[1],'koe 3 tila '+c[0]);A.strictEqual(val(X.P,X.las.id),7);});
// tila 1: ulkoinen muutos toiseen avaimeen ei näy, oma kerros on avaimittain
X=mk(1);var muu=KK.addBlock(X.P,'muisti',{nm:'Muu'});X.P.st[muu.id]=3;X.aseta(X.las,'1');X.ajastin(5);var lm=X.aseta(X.lue,{r:muu.id});X.run();
A.deepStrictEqual(Object.keys(X.cs().own),[X.las.id],'oma muutos tunnistetaan alkuperästä');ext(X,muu,4);kulu(X,5000);A.strictEqual(val(X.P,X.lue.id),3);
// oma kirjoitus samaan arvoon kuin ennen on silti oma (ei arvon yhtäsuuruudesta): ulkoinen muutos sen jälkeen ei näy
X=mk(1);X.P.st[X.las.id]=1;X.aseta(X.las,'1');X.ajastin(5);X.aseta(X.lue,{r:X.las.id});X.run();A.strictEqual(X.cs().own[X.las.id],undefined,'sama arvo: ei muutosta');
ext(X,X.las,9);kulu(X,5000);A.strictEqual(val(X.P,X.lue.id),1,'lukitushetken arvo');

// Koe 4: 0 → 1 ennen seuraavan vaiheen rajaa; oikea arvo silloin 5 → uusi kuva sisältää 5
X=mk(0);X.P.st[X.las.id]=2;X.ajastin(10);X.ajastin(10);X.aseta(X.lue,{r:X.las.id});X.run();A.strictEqual(X.cs().lk,0);
var lkA=KK.addBlock(X.P,'tee',{do:'aseta',o:X.k.id,om:'lukitus',v:'1'});KK.runAction(X.P,lkA.id,C,0);
A.strictEqual(X.cs().lk,0,'alkanut vaihe jatkuu entisellä tilalla');A.strictEqual(KK.chainLock(X.P,X.k.id,C).req,1,'pyydetty 1');
ext(X,X.las,5);NOW+=10000;var T1=NOW;KK.chainPoll(X.P,C);A.strictEqual(X.cs().lk,1,'vaihtui seuraavan vaiheen alussa');A.strictEqual(X.cs().snap.at,T1,'vaihtohetken kuva');
A.strictEqual(X.cs().snap.st[X.las.id],5,'kuvassa vaihtohetken 5, ei alkuperäinen 2');ext(X,X.las,9);kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),5);

// Koe 5: 1 → 2, 2 → 1 ja 2 → 0; saman tilan uudelleen asettaminen ei ota uutta kuvaa
X=mk(1);X.P.st[X.las.id]=1;X.ajastin(5);X.ajastin(5);X.ajastin(5);X.ajastin(5);X.ajastin(5);var l5=X.aseta(X.lue,{r:X.las.id});X.run();var at0=X.cs().snap.at;
function pyyda(X,m){var t=KK.addBlock(X.P,'tee',{do:'aseta',o:X.k.id,om:'lukitus',v:String(m)});KK.runAction(X.P,t.id,C,0);}
pyyda(X,1);ext(X,X.las,2);kulu(X,5000);A.strictEqual(X.cs().lk,1);A.strictEqual(X.cs().snap.at,at0,'sama tila: ei uutta kuvaa');A.strictEqual(X.cs().snap.st[X.las.id],1);
pyyda(X,2);kulu(X,5000);A.strictEqual(X.cs().lk,2);A.strictEqual(X.cs().snap.st[X.las.id],2,'1 → 2 uusi kuva');
ext(X,X.las,3);pyyda(X,1);kulu(X,5000);A.strictEqual(X.cs().lk,1);A.strictEqual(X.cs().snap.st[X.las.id],3,'2 → 1 uusi kuva');A.deepStrictEqual(X.cs().own,{},'oma kerros alkaa alusta');
pyyda(X,0);ext(X,X.las,4);kulu(X,5000);A.strictEqual(X.cs().lk,0);A.strictEqual(X.cs().snap,undefined,'avaus poistaa kuvan');ext(X,X.las,6);kulu(X,5000);A.strictEqual(val(X.P,X.lue.id),6,'avattu: ajantasainen');
// usea pyyntö saman odotuksen aikana: viimeisin ratkaisee
X=mk(0);X.ajastin(5);X.aseta(X.lue,'1');X.run();pyyda(X,2);pyyda(X,1);pyyda(X,2);kulu(X,5000);A.strictEqual(X.cs().lk,2);

// Koe 6: logiikka ohjaa lukitusta täydessä lukituksessa → ohjaus luetaan ajantasaisena, vaihto seuraavassa vaiheessa
X=mk();X.k.ohk=['lukitus'];var tila=KK.addBlock(X.P,'muisti',{nm:'Tila'}),nt=KK.addNode(X.P,tila.id,-400,200);X.P.st[tila.id]=2;
A.ok(KK.addLink(X.P,nt.id,'v',X.w.id,'o_lukitus'),'nuoli lukitukseen');X.P.st[X.las.id]=1;X.ajastin(5);X.ajastin(5);X.aseta(X.lue,{r:X.las.id});X.run();A.strictEqual(X.cs().lk,2);
A.strictEqual(KK.Ev(X.P,C).omSrc(X.k.id,KK.omFind(X.k,'lukitus')),'nuoli');
ext(X,tila,0);ext(X,X.las,8);A.strictEqual(X.cs().lk,2,'alkanut vaihe jatkuu');kulu(X,5000);A.strictEqual(X.cs().lk,0,'ohjaus luettiin ajantasaisena, vaikka kuvassa tila 2');
kulu(X,5000);A.strictEqual(val(X.P,X.lue.id),8);
// nuoli voittaa asetetun
X.P.st[tila.id]=1;pyyda(X,2);A.strictEqual(KK.lkReq(X.P,X.k.id,C),1);

// Koe 7: Toista 3 ja Ajastin kaikissa tiloissa → ohjaustila etenee ja ketju valmistuu
[0,1,2].forEach(function(m){var P=KK.newProject('toista');var k=KK.addBlock(P,'ketju',{lk:m||undefined}),w=KK.addNode(P,k.id,0,0),las=KK.addBlock(P,'muisti',{nm:'Kierrokset'}),ok=KK.addBlock(P,'muisti',{nm:'Ok'});
  var to=KK.addBlock(P,'toista',{kerrat:'3'}),inc=KK.addBlock(P,'tee',{do:'lisaa',o:las.id}),aj=KK.addBlock(P,'ajastin',{kesto:'1',yks:'s'}),fin=KK.addBlock(P,'tee',{do:'aseta',o:ok.id,v:'1'});
  var nto=KK.addNode(P,to.id,0,0,w.id),ni=KK.addNode(P,inc.id,0,60,w.id),na=KK.addNode(P,aj.id,0,120,w.id),nf=KK.addNode(P,fin.id,200,60,w.id);
  KK.addLink(P,nto.id,'e',ni.id,'e');KK.addLink(P,ni.id,'e',na.id,'e');KK.addLink(P,na.id,'e',nto.id,'e');KK.addLink(P,nto.id,'m',nf.id,'e');
  KK.chainStart(P,k.id,C);A.strictEqual(P.st[k.id].lk,m);for(var i=0;i<5;i++){NOW+=1000;KK.chainPoll(P,C);}
  A.strictEqual(P.st[k.id].run,false,'valmistui tilassa '+m);A.strictEqual(KK.Ev(P,C).val(las.id),3,'kolme kierrosta tilassa '+m+' (Lisää käyttää oikeaa arvoa)');A.strictEqual(KK.Ev(P,C).val(ok.id),1);A.strictEqual(P.st[k.id].err,'');});

// Koe 8: kaksi samanaikaista suoritusta (kaksi ketjua) eivät sekoitu; uudelleenkäynnistys alusta ottaa uuden kuvan
var P=KK.newProject('kaksi'),x=KK.addBlock(P,'muisti',{nm:'X'}),ra=KK.addBlock(P,'muisti',{nm:'A luki'}),rb=KK.addBlock(P,'muisti',{nm:'B luki'});P.st[x.id]=0;
function ketju(nm,lk,steps){var k=KK.addBlock(P,'ketju',{nm:nm,lk:lk}),w=KK.addNode(P,k.id,0,0),prev=null,y=0;steps.forEach(function(s){var b=KK.addBlock(P,s[0],s[1]);var n=KK.addNode(P,b.id,0,y+=60,w.id);if(prev)KK.addLink(P,prev.id,'e',n.id,'e');prev=n;});return k;}
var kA=ketju('A',1,[['tee',{do:'aseta',o:x.id,v:'1'}],['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:ra.id,v:{r:x.id}}]]);
var kB=ketju('B',2,[['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:rb.id,v:{r:x.id}}]]);
KK.chainStart(P,kB.id,C);KK.chainStart(P,kA.id,C);A.strictEqual(P.st[kB.id].snap.st[x.id],0);A.strictEqual(P.st[kA.id].snap.st[x.id],0);
NOW+=5000;KK.chainPoll(P,C);A.strictEqual(KK.Ev(P,C).val(ra.id),1,'A lukee oman muutoksensa');A.strictEqual(KK.Ev(P,C).val(rb.id),0,'A:n muutos on B:lle ulkopuolinen');
kB.uusi='alusta';P.st[x.id]=4;KK.chainStart(P,kB.id,C);var s1=P.st[kB.id].snap;KK.chainStart(P,kB.id,C);A.notStrictEqual(P.st[kB.id].snap,s1,'uusi suoritus, uusi kuva');A.strictEqual(P.st[kB.id].snap.st[x.id],4);

// Koe 9: rakenne muuttuu odotuksen aikana → tila 0 käyttää uutta, 1/2 lukittua; alkanut odotus ei ala alusta
[[0,'8'],[1,'5'],[2,'5']].forEach(function(c){var X=mk(c[0]);var aj=X.ajastin(10);var as=X.aseta(X.lue,'5');X.run();var u0=X.cs().tk[0].u;
  X.P.b[as.b.id].v='8';X.P.b[aj.b.id].kesto='60';KK.chainPoll(X.P,C);A.strictEqual(X.cs().tk[0].u,u0,'odotus ei ala alusta');
  kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),+c[1],'koe 9 tila '+c[0]);});
// tilassa 1/2 tuleva kytkentä tulee kuvasta: uusi vaihe lisätty kesken ei kuulu tähän suoritukseen
X=mk(2);var ajx=X.ajastin(10);X.run();var uusi=KK.addBlock(X.P,'tee',{do:'aseta',o:X.lue.id,v:'3'}),nu=KK.addNode(X.P,uusi.id,0,300,X.w.id);KK.addLink(X.P,ajx.n.id,'e',nu.id,'e');
kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),null,'lukittu rakenne');X.cs().lk=0;X.run();kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),3,'uusi suoritus käyttää uusinta');

// Koe 10: tuleva vaihe tai kohde poistetaan → selkeä virhe, ei hiljaista ohitusta tai uudelleensidontaa
X=mk(0);var aj10=X.ajastin(10);X.aseta(X.lue,'1');X.run();KK.removeNode(X.P,aj10.n.id);kulu(X,10000);
A.strictEqual(X.cs().run,false);A.ok(/poistettiin kesken/.test(X.cs().err),X.cs().err);
[0,1,2].forEach(function(m){var X=mk(m);X.ajastin(10);X.aseta(X.lue,'1');X.run();KK.removeBlock(X.P,X.lue.id);var uus=KK.addBlock(X.P,'muisti',{nm:'Lue'});kulu(X,10000);
  A.strictEqual(X.cs().run,false);A.ok(/kohde poistettu/.test(X.cs().err),'tila '+m+': '+X.cs().err);A.strictEqual(val(X.P,uus.id),null,'samanniminen ei peri');});
// lukittu: vaihe ja sen kohde poistettu (kohteella ei enää viittauksia, ei poistomuistia) → kirjoitus epäonnistuu näkyvästi
X=mk(2);X.ajastin(10);var asx=X.aseta(X.lue,'1');X.run();KK.removeNode(X.P,asx.n.id);KK.removeBlock(X.P,X.lue.id);A.ok(!KK.isGone(X.P,X.lue.id));kulu(X,10000);
A.strictEqual(X.cs().run,false);A.strictEqual(X.cs().err,'”Aseta arvo”: kohde poistettu: Lue');
// lukukuvan vanha arvo kelpaa: luettava palikka poistettu odotuksen aikana
X=mk(2);X.P.st[X.las.id]=6;X.ajastin(10);X.aseta(X.lue,{r:X.las.id});X.run();KK.removeBlock(X.P,X.las.id);kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),6,'tila 2 lukee kuvasta');
X=mk(0);X.P.st[X.las.id]=6;X.ajastin(10);X.aseta(X.lue,{r:X.las.id});X.run();KK.removeBlock(X.P,X.las.id);kulu(X,10000);A.strictEqual(val(X.P,X.lue.id),null,'tila 0: poistettu ei anna arvoa');

// Koe 11: sulje/avaa ja vienti/tuonti kesken lukitun odotuksen → kuva säilyy, tehdyt vaikutukset eivät toistu
X=mk(1);X.P.st[X.las.id]=0;X.step('tee',{do:'lisaa',o:X.las.id});X.ajastin(3600);X.aseta(X.lue,{r:X.las.id});X.run();A.strictEqual(val(X.P,X.las.id),1);
var J=JSON.stringify(X.P);A.ok(J.indexOf('"snap"')>0);var P2=KK.repair(JSON.parse(J));P2.st[X.las.id]=50;NOW+=3600000;KK.chainPoll(P2,C);
A.strictEqual(KK.Ev(P2,C).val(X.lue.id),1,'oma muutos kuvasta tallennuksen yli');A.strictEqual(KK.Ev(P2,C).val(X.las.id),50,'Lisää ei toistunut');
// kuva puuttuu tai on vanhasta versiosta → näkyvä este, ei salaa ajantasaiseksi
X=mk(2);X.ajastin(10);X.aseta(X.lue,'1');X.run();var J3=JSON.parse(JSON.stringify(X.P));delete J3.st[X.k.id].snap;var P3=KK.repair(J3);A.strictEqual(P3.st[X.k.id].lk,2);
NOW+=10000;KK.chainPoll(P3,C);A.strictEqual(P3.st[X.k.id].run,false);A.ok(/Lukituskuva puuttuu/.test(P3.st[X.k.id].err));A.strictEqual(KK.Ev(P3,C).val(X.lue.id),null);
X=mk(2);X.ajastin(10);X.run();var J4=JSON.parse(JSON.stringify(X.P));J4.st[X.k.id].snap.ver=7;var P4=KK.repair(J4);NOW+=10000;KK.chainPoll(P4,C);A.ok(/vanhasta versiosta/.test(P4.st[X.k.id].err));
// rikkinäinen tila korjataan
var J5=JSON.parse(J);J5.st[X.k.id]={run:true,tk:[{n:'x',a:1}],lk:7,snap:'roska',own:[1],par:5};var P5=KK.repair(J5);var c5=P5.st[X.k.id];A.strictEqual(c5.lk,1);A.strictEqual(c5.snap,undefined);A.deepStrictEqual(c5.own,{});A.strictEqual(c5.par,undefined);
var J6=JSON.parse(J);var kb6=Object.values(J6.b).filter(function(b){return b.k==='ketju';})[0];kb6.lk=5;A.strictEqual(KK.repair(J6).b[kb6.id].lk,undefined,'väärä perusarvo pois');kb6.lk='2';A.strictEqual(KK.repair(JSON.parse(JSON.stringify(J6))).b[kb6.id].lk,2);

// Koe 12: vanha projekti ilman lukitusominaisuutta → nykyinen käytös, oletus live
X=mk();X.ajastin(5);X.aseta(X.lue,{r:X.las.id});var old=JSON.parse(JSON.stringify(X.P));var P6=KK.repair(old);KK.chainStart(P6,X.k.id,C);
A.strictEqual(P6.st[X.k.id].lk,0);A.strictEqual(P6.st[X.k.id].snap,undefined);KK.setVal(P6,X.las.id,4,C);NOW+=5000;KK.chainPoll(P6,C);A.strictEqual(KK.Ev(P6,C).val(X.lue.id),4);

// Virheellinen numero: näkyvä virhe, ei pyöristystä
X=mk();X.k.ohk=['lukitus'];var tv=KK.addBlock(X.P,'muisti',{nm:'Tv'}),ntv=KK.addNode(X.P,tv.id,-400,200);KK.addLink(X.P,ntv.id,'v',X.w.id,'o_lukitus');X.P.st[tv.id]=1.5;X.ajastin(5);X.aseta(X.lue,"1");
A.ok(KK.chainIssues(X.P,X.k.id,C).some(function(i){return !i.info&&/lukitus: 1,5 ei ole 0, 1 tai 2/.test(i.t);}),'tarkistus kertoo ennen ajoa');
A.strictEqual(X.run(),false);A.strictEqual(X.cs().err,'Ketjun lukitus: 1,5 ei ole 0, 1 tai 2.');
X.P.st[tv.id]=1;X.run();A.strictEqual(X.cs().lk,1);X.P.st[tv.id]=3;kulu(X,5000);A.strictEqual(X.cs().run,false);A.ok(/ei ole 0, 1 tai 2/.test(X.cs().err));
X=mk();TOASTS=[];pyyda(X,3);A.ok(/ei ole 0, 1 tai 2/.test(TOASTS[0]),TOASTS[0]);A.strictEqual(X.P.st['o:'+X.k.id],undefined,'ei asetettu');
X=mk();X.step('tee',{do:'aseta',o:X.k.id,om:'lukitus',v:'-1'});X.run();A.ok(/lukitus: −?-?1 ei ole 0, 1 tai 2/.test(X.cs().err),X.cs().err);
// Lisää ja Palauta lukitukseen
X=mk(1);var lis=KK.addBlock(X.P,'tee',{do:'lisaa',o:X.k.id,om:'lukitus'});KK.runAction(X.P,lis.id,C,0);A.strictEqual(KK.lkReq(X.P,X.k.id,C),2);TOASTS=[];KK.runAction(X.P,lis.id,C,0);A.ok(TOASTS.length&&KK.lkReq(X.P,X.k.id,C)===2,'yli 2 on virhe');
var pal=KK.addBlock(X.P,'tee',{do:'palauta',o:X.k.id,om:'lukitus'});KK.runAction(X.P,pal.id,C,0);A.strictEqual(KK.lkReq(X.P,X.k.id,C),1,'Palauta → perusarvo');

// Odota kunnes lukitussa ketjussa: lukittu ehto pysyy epätotena, tapahtuma vapauttaa, Pysäytä toimii
X=mk(2);var rv=KK.addBlock(X.P,'ruutu',{nm:'Valmis'});var od=X.step('odota',{o:rv.id});X.aseta(X.lue,'1');X.run();KK.userSet(X.P,rv.id,true,C);kulu(X,1000);
A.strictEqual(X.cs().run,true,'lukitussa kuvassa ruutu ei ole valittu');A.ok(/Ketjun lukema ≠ nykyinen käyttötieto: Valmis ei \(nyt kyllä\)/.test(KK.why(X.P,KK.Ev(X.P,C),X.k.id,1).txt),KK.why(X.P,KK.Ev(X.P,C),X.k.id,1).txt);
var bt=KK.addBlock(X.P,'nappi',{beh:'kerta'}),nb=KK.addNode(X.P,bt.id,-300,0);KK.addLink(X.P,nb.id,'e',od.n.id,'x');KK.press(X.P,bt.id,C);A.strictEqual(val(X.P,X.lue.id),1,'tapahtuma vapautti');
X=mk(2);X.step('odota',{o:rv.id});X.run();KK.chainStop(X.P,X.k.id,C);A.strictEqual(X.cs().run,false);
X=mk(0);var rv0=KK.addBlock(X.P,'ruutu',{nm:'Valmis'});X.step('odota',{o:rv0.id});X.aseta(X.lue,'1');X.run();KK.userSet(X.P,rv0.id,true,C);A.strictEqual(val(X.P,X.lue.id),1,'tila 0: ehto vapauttaa heti');

// Aliketju: emon (tila 1) käynnistämän ketjun myöhemmät muutokset ovat emon omia
P=KK.newProject('ali');x=KK.addBlock(P,'muisti',{nm:'X'});var rr=KK.addBlock(P,'muisti',{nm:'R'});P.st[x.id]=0;
var kS=ketju('Ali',0,[['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:x.id,v:'1'}]]);
var kM=ketju('Emo',1,[['tee',{do:'kaynnista',o:kS.id,odota:true}],['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:rr.id,v:{r:x.id}}]]);
KK.chainStart(P,kM.id,C);A.strictEqual(P.st[kS.id].par,kM.id);NOW+=5000;KK.chainPoll(P,C);A.strictEqual(KK.Ev(P,C).val(x.id),1);A.ok(P.st[kM.id].own.hasOwnProperty(x.id),'aliketjun muutos emon omana');
KK.setVal(P,x.id,7,C);NOW+=5000;KK.chainPoll(P,C);A.strictEqual(KK.Ev(P,C).val(rr.id),1,'emo lukee aliketjun muutoksen, ei ulkoista');
// tapahtumanuolesta seuraava synkroninen toiminto on oma
X=mk(1);X.P.st[X.las.id]=0;var as1=X.aseta(X.lue,'1');var jatko=KK.addBlock(X.P,'tee',{do:'aseta',o:X.las.id,v:'5'}),nj=KK.addNode(X.P,jatko.id,-300,400);KK.addLink(X.P,as1.n.id,'e',nj.id,'e');
X.ajastin(5);var l2=KK.addBlock(X.P,'muisti',{nm:'L2'});X.aseta(l2,{r:X.las.id});X.run();A.strictEqual(val(X.P,X.las.id),5);ext(X,X.las,9);kulu(X,5000);A.strictEqual(val(X.P,l2.id),5,'jatkotoimi on oma');

// Kuvatiedostot eivät kopioidu lukukuvaan (tallennus ei kasva), vaan luetaan nykyisinä
X=mk(2);var big='data:image/png;base64,'+new Array(6001).join('A');var kuva=KK.addBlock(X.P,'pkuva',{src:big});X.ajastin(5);X.run();
var JS=JSON.stringify(X.cs().snap);A.ok(JS.length<big.length&&JS.indexOf('AAAA')<0,'kuva ei ole lukukuvassa');A.strictEqual(KK.lkView(X.P,X.k.id).b[kuva.id].src,big,'luetaan nykyisenä');
A.strictEqual(KK.lkView(X.P,X.k.id).b[X.k.id].nm,'Harjoitus');A.strictEqual(KK.lkView(X.P,X.k.id).st[X.k.id],X.cs(),'ajotila on nykyinen');

// Seuranta: pyydetty ja voimassa oleva tila, kuvan aika, erot
X=mk(1);X.P.st[X.las.id]=2;X.ajastin(10);X.run();ext(X,X.las,5);var L=KK.chainLock(X.P,X.k.id,C);A.deepStrictEqual([L.req,L.lk,L.at],[1,1,NOW]);
A.deepStrictEqual(KK.chainLockDiff(X.P,X.k.id,C).map(function(d){return [d.nm,d.lukema,d.nyt];}),[['Laskuri','2','5']]);
var wt=KK.why(X.P,KK.Ev(X.P,C),X.k.id,1).txt;A.ok(/Lukitus: Lukitse ulkopuolisilta muutoksilta \(lukukuva klo \d+\.\d\d\.\d\d\)/.test(wt),wt);A.ok(/Laskuri 2 \(nyt 5\)/.test(wt));
pyyda(X,0);A.ok(/Pyydetty tila 0 \(Ajantasainen\) tulee voimaan seuraavan vaiheen alussa/.test(KK.why(X.P,KK.Ev(X.P,C),X.k.id,1).txt));
X.k.lk=2;delete X.P.st['o:'+X.k.id];KK.chainStop(X.P,X.k.id,C);A.ok(/Lukitus: Lukitse kaikilta muutoksilta\./.test(KK.why(X.P,KK.Ev(X.P,C),X.k.id,1).txt));
console.log('ok lukitus');
