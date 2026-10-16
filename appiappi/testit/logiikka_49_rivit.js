// P3a: rivi, rivikohtainen laskenta ja rivijoukko (F03). Rivi-palikka on tavallinen nimetty lähde (kohde.määrä);
// käsiteltävä rivi tulee Rivijoukon, ikkunan riveille tai Toista riveille -läpikäynnistä. Rivijoukko suodattaa ja
// järjestää rivien tunnisteita muuttamatta rivejä. Ikkuna riveille laskee sisältönsä jokaisella rivillä (D06).
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id,p){return E(P).val(id,p);}
function blk(P,k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g);return {b:b,n:n};}
function kaava(P,f,g){var k=blk(P,'kaava',{},-600,0,g);k.b.f=KK.kaavaToIds(P,f);return k;}
function kv(P,f){return val(P,kaava(P,f).b.id);}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+'.'+ap+' → '+b.b.nm+'.'+bp);return l;}
function taulu(P,nm,cols){var t=blk(P,'taulu',{nm:nm});var c={};cols.forEach(function(x){c[x[0]]=KK.addCol(t.b,x[0],x[1],x[2]);});return {t:t.b,n:t.n,b:t.b,c:c};}
function rivi(P,T,vals){var rid=KK.tAddRow(P,T.t.id,false);Object.keys(vals).forEach(function(k){var r=KK.tEdit(P,T.t.id,false,rid,T.c[k].id,vals[k],new Date(NOW));A.ok(!KK.isErr(r),'tEdit '+k+': '+(r&&r.err));});return rid;}
function ids(rs){A.ok(KK.isRS(rs),'joukko: '+JSON.stringify(rs));return rs.ids.join(',');}
function inWin(P,w,x){x.n.g=w.n.id;return x;}

// Perusta: tuotteet, Rivi kohde (käsiteltävä), kaava kohde.määrä × kohde.hinta
var P=KK.newProject('rivit');
var T=taulu(P,'Tuotteet',[['Nimi','teksti'],['Määrä','luku'],['Hinta','luku'],['Ryhmä','teksti']]);
var r1=rivi(P,T,{'Nimi':'Maito','Määrä':'2','Hinta':'1,5','Ryhmä':'b'}),r2=rivi(P,T,{'Nimi':'Leipä','Määrä':'0','Hinta':'3','Ryhmä':'a'}),
    r3=rivi(P,T,{'Nimi':'Juusto','Hinta':'6','Ryhmä':'b'}),r4=rivi(P,T,{'Nimi':'Omena','Määrä':'6','Hinta':'0,5','Ryhmä':'a'});
var kohde=blk(P,'trivi',{nm:'Kohde',tt:T.t.id});A.strictEqual(kohde.b.vt,'kohde');A.strictEqual(kohde.b.ls,'kas','oletus: käsiteltävä rivi');
A.deepStrictEqual(KK.portsBase(kohde.b).outs.map(function(o){return o.p;}),['v']);A.deepStrictEqual(KK.portsBase(T.t).outs.map(function(o){return o.p;}),['v','nro','rj']);
['rivi','nro','on'].forEach(function(n){A.ok(KK.omFind(kohde.b,n),'Rivin ominaisuus '+n);});
var kust=kaava(P,'kohde.määrä * kohde.hinta');A.ok(/\{#b\d+\}\.c2 \* \{#b\d+\}\.c3/.test(kust.b.f),'tallessa sarakkeiden tunnisteet: '+kust.b.f);
A.strictEqual(KK.kaavaToText(P,kust.b.f),'kohde.määrä * kohde.hinta');
// Käsittelyn ulkopuolella ei riviä: puuttuva, ei 0; tuntematon sarake selittää
A.strictEqual(val(P,kohde.b.id),null);A.ok(KK.isMiss(val(P,kust.b.id)),'ilman riviä tuntematon');A.strictEqual(kv(P,'kohde.on'),false);A.strictEqual(kv(P,'kohde.nro'),0);
var bad=kv(P,'kohde.paino');A.ok(KK.isErr(bad)&&/sarakkeet: nimi, määrä, hinta, ryhmä/.test(bad.err),'tuntematon sarake: '+(bad&&bad.err));
// Rivikohtainen arviointi: oma Ev joka riville, välimuisti ei sekoitu
var ev=E(P);A.strictEqual(ev.rowEv(T.t.id,r1).val(kust.b.id),3);A.strictEqual(ev.rowEv(T.t.id,r4).val(kust.b.id),3);A.strictEqual(ev.rowEv(T.t.id,r2).val(kust.b.id),0);
A.ok(KK.isMiss(ev.rowEv(T.t.id,r3).val(kust.b.id)),'puuttuva määrä → tuntematon');A.strictEqual(ev.rowEv(T.t.id,r1).prop(kohde.b.id,'nimi'),'Maito');A.strictEqual(ev.rowEv(T.t.id,r3).prop(kohde.b.id,'nro'),3);
A.ok(KK.isMiss(ev.val(kust.b.id)),'ulompi välimuisti ennallaan');
// Valittu ja tapahtuman rivi
var kval=blk(P,'trivi',{nm:'Valittu',tt:T.t.id,ls:'val'});A.strictEqual(val(P,kval.b.id),null);KK.tSetSel(P,T.t.id,r2);A.strictEqual(kv(P,'valittu.nimi'),'Leipä');A.strictEqual(kv(P,'valittu.nro'),2);
var ktap=blk(P,'trivi',{nm:'Tap',tt:T.t.id,ls:'tap'});var cE=KK.withEv(C,{id:'e1',src:'',nm:'',at:NOW,rivi:KK.RR(T.t.id,r4)});A.strictEqual(KK.Ev(P,cE).prop(ktap.b.id,'nimi'),'Omena');A.strictEqual(val(P,ktap.b.id),null);
// Teksti {kohde.nimi}
var tx=blk(P,'nayta',{tx:'',v:P.views[0].id});tx.b.tx=KK.toIds(P,'{kohde.nimi}: {kohde.määrä}');A.ok(/c1/.test(tx.b.tx)&&/c2/.test(tx.b.tx));A.strictEqual(E(P).rowEv(T.t.id,r1).text(tx.b.id),'Maito: 2');A.strictEqual(KK.toNames(P,tx.b.tx),'{kohde.nimi}: {kohde.määrä}');
// Taulukon poisto: Rivi kertoo
var kt=blk(P,'trivi',{nm:'Tyhja'});A.ok(KK.isErr(val(P,kt.b.id))&&/valitse rivin taulukko/.test(val(P,kt.b.id).err));

// Rivijoukko: rivit nuolesta, ehto riveittäin, järjestys sarakkeen tai arvon mukaan
var J=blk(P,'joukko',{nm:'Joukko'});A.deepStrictEqual(KK.portsBase(J.b).ins.map(function(o){return o.p;}),['rv','c','j']);
A.ok(KK.isErr(val(P,J.b.id))&&/tuo rivit/.test(val(P,J.b.id).err),'ilman rivejä neuvoo');
link(P,{b:T.t,n:T.n},'rj',J,'rv');A.strictEqual(val(P,J.b.id),4,'kaikki rivit');A.strictEqual(ids(val(P,J.b.id,'rj')),[r1,r2,r3,r4].join(','));A.strictEqual(KK.fmt(val(P,J.b.id,'rj')),'4 riviä');
var eh=kaava(P,'kohde.määrä > 0');link(P,eh,'v',J,'c');A.strictEqual(ids(val(P,J.b.id,'rj')),[r1,r4].join(','),'ehto: määrä > 0 (puuttuva ei päde)');
A.strictEqual(kv(P,'joukko.rivejä'),2);A.strictEqual(kv(P,'joukko.eka.nimi'),'Maito');A.strictEqual(kv(P,'joukko.vika.nimi'),'Omena');A.ok(KK.isR(kv(P,'joukko.eka')));
A.strictEqual(kv(P,'joukko.määrä.summa'),8,'kooste joukon riveistä');A.strictEqual(kv(P,'joukko.hinta.keskiarvo'),1);
J.b.js=T.c['Hinta'].id;A.strictEqual(ids(val(P,J.b.id,'rj')),[r4,r1].join(','),'järjestys hinnan mukaan nousevasti');J.b.su='laskeva';A.strictEqual(ids(val(P,J.b.id,'rj')),[r1,r4].join(','));
A.deepStrictEqual(KK.tRows(P,T.t.id).map(function(r){return r.id;}),[r1,r2,r3,r4],'suodatus ja järjestys eivät muuta rivejä');A.ok(!KK.tUsed(P,T.t.id),'ei käyttötietoa');
// Ilman ehtoa: puuttuva loppuun molempiin suuntiin, tasatilanteessa lähteen järjestys
P.lg.l=P.lg.l.filter(function(l){return !(l.t===J.n.id&&l.tp==='c');});J.b.js=T.c['Määrä'].id;J.b.su='nouseva';A.strictEqual(ids(val(P,J.b.id,'rj')),[r2,r1,r4,r3].join(','),'puuttuva viimeisenä');
J.b.su='laskeva';A.strictEqual(ids(val(P,J.b.id,'rj')),[r4,r1,r2,r3].join(','),'puuttuva viimeisenä myös laskevasti');
J.b.js=T.c['Ryhmä'].id;J.b.su='nouseva';A.strictEqual(ids(val(P,J.b.id,'rj')),[r2,r4,r1,r3].join(','),'tasatilanne: alkuperäinen järjestys');
J.b.max='2';A.strictEqual(ids(val(P,J.b.id,'rj')),[r2,r4].join(','),'enintään 2');J.b.max='';
// Järjestys lasketun arvon mukaan (kohta j): kustannus riveittäin
J.b.js='';link(P,kust,'v',J,'j');J.b.su='laskeva';A.strictEqual(ids(val(P,J.b.id,'rj')),[r1,r4,r2,r3].join(','),'kustannus 3, 3, 0, tuntematon');
// Joukosta joukko: järjestys säilyy toisen avaimen tasatilanteessa (kaksi avainta peräkkäin)
var J2=blk(P,'joukko',{nm:'Ryhmittain',js:T.c['Ryhmä'].id});link(P,J,'rj',J2,'rv');A.strictEqual(ids(val(P,J2.b.id,'rj')),[r4,r2,r1,r3].join(','),'ryhmä, sitten kustannus laskevasti');
A.strictEqual(KK.rowTable(P,J2.b.id),T.t.id);
// Polut joukolle: tallessa tunnisteet, nimen vaihto ei riko
var jk=kaava(P,'ryhmittain.eka.nimi + ryhmittain.määrä.summa');A.ok(/\.eka\.c1/.test(jk.b.f)&&/\.c2\.summa/.test(jk.b.f),jk.b.f);A.strictEqual(val(P,jk.b.id),'Omena8');
KK.setColName(T.t,'c1','Tuote');A.strictEqual(KK.kaavaToText(P,jk.b.f),'ryhmittain.eka.tuote + ryhmittain.määrä.summa');A.strictEqual(KK.kaavaToText(P,kust.b.f),'kohde.määrä * kohde.hinta');
A.strictEqual(val(P,jk.b.id),'Omena8','uudelleennimetty sarake toimii');KK.setColName(T.t,'c1','Nimi');
// Kehä: joukon ehto lukee joukkoa itseään
var J3=blk(P,'joukko',{nm:'Kehajoukko'});link(P,{b:T.t,n:T.n},'rj',J3,'rv');var ek=kaava(P,'kehajoukko.rivejä > 1');link(P,ek,'v',J3,'c');var j3=val(P,J3.b.id);A.ok(KK.isErr(j3)&&/kehä/.test(j3.err),'kehä näkyy: '+JSON.stringify(j3));

// Ikkuna riveille: SUMMA, KESKIARVO (D06), MONTAKO PÄTEE, JA; virheen rivi
var W=blk(P,'ikkuna',{m:'sum',riv:true});A.ok(KK.portsBase(W.b).ins.some(function(o){return o.p==='rv';}),'rivit-kohta');var W0=blk(P,'ikkuna',{m:'sum'});A.ok(!KK.portsBase(W0.b).ins.some(function(o){return o.p==='rv';}),'tavallisessa ikkunassa ei');
inWin(P,W,kaava(P,'kohde.määrä * kohde.hinta'));A.ok(KK.isErr(val(P,W.b.id))&&/tuo rivit/.test(val(P,W.b.id).err));
link(P,{b:T.t,n:T.n},'rj',W,'rv');A.strictEqual(val(P,W.b.id),6,'3 + 0 + 3, puuttuva ohitetaan');
A.strictEqual(E(P).prop(W.b.id,'rivejä'),4);A.strictEqual(E(P).prop(W.b.id,'havaintoja'),3);A.strictEqual(E(P).prop(W.b.id,'puuttuvia'),1);
W.b.vaadi=true;A.ok(KK.isMiss(val(P,W.b.id)),'täydellisyysvaatimus');delete W.b.vaadi;
var WA=blk(P,'ikkuna',{m:'avg',riv:true});inWin(P,WA,kaava(P,'kohde.määrä'));link(P,{b:T.t,n:T.n},'rj',WA,'rv');A.strictEqual(val(P,WA.b.id),2.666666667,'keskiarvo 2, 0, 6 (tyhjä ohi)');
var WC=blk(P,'ikkuna',{m:'cnt',riv:true});inWin(P,WC,kaava(P,'kohde.hinta >= 1,5'));link(P,{b:T.t,n:T.n},'rj',WC,'rv');A.strictEqual(val(P,WC.b.id),3,'montako riviä pätee');
var WJ=blk(P,'ikkuna',{m:'and',riv:true});inWin(P,WJ,kaava(P,'kohde.hinta > 0'));link(P,{b:T.t,n:T.n},'rj',WJ,'rv');A.strictEqual(val(P,WJ.b.id),true,'kaikilla riveillä');
// Joukon riveille: vain suodatetut (määrä > 0)
var Jp=blk(P,'joukko',{nm:'Positiiviset'});link(P,{b:T.t,n:T.n},'rj',Jp,'rv');link(P,kaava(P,'kohde.määrä > 0'),'v',Jp,'c');
var WP=blk(P,'ikkuna',{m:'sum',riv:true});inWin(P,WP,kaava(P,'kohde.määrä'));link(P,Jp,'rj',WP,'rv');A.strictEqual(val(P,WP.b.id),8);
// Kaavan tulos riveittäin: omistava kaava ikkunan ulkopuolella, tulos ikkunassa
var tul=blk(P,'tulos',{nm:'Kustannus'});var tk=kaava(P,'kustannus = kohde.määrä * kohde.hinta');var WT=blk(P,'ikkuna',{m:'maxv',riv:true});inWin(P,WT,tul);link(P,{b:T.t,n:T.n},'rj',WT,'rv');
A.strictEqual(val(P,WT.b.id),3,'suurin kustannus riveistä');A.ok(KK.isMiss(val(P,tul.b.id)),'tulos ilman riviä tuntematon');
// Tyhjä ja kokonaan puuttuva aineisto
var T2=taulu(P,'Tyhja',[['Luku','luku']]);var kr2=blk(P,'trivi',{nm:'K2',tt:T2.t.id});var WE=blk(P,'ikkuna',{m:'sum',riv:true});inWin(P,WE,kaava(P,'k2.luku'));link(P,{b:T2.t,n:T2.n},'rj',WE,'rv');
A.strictEqual(val(P,WE.b.id),0,'tyhjä summa 0');rivi(P,T2,{});A.ok(KK.isMiss(val(P,WE.b.id)),'kokonaan puuttuva: tuntematon');
// Virhe rivillä: viite poistettuun riviin
var T3=taulu(P,'Kirjaus',[['Tuote','viite',{tt:T.t.id}],['Kpl','luku']]);var k1=rivi(P,T3,{'Kpl':'1'});var k2=rivi(P,T3,{'Kpl':'2'});
KK.tEdit(P,T3.t.id,false,k1,T3.c['Tuote'].id,KK.RR(T.t.id,r1),new Date(NOW));KK.tEdit(P,T3.t.id,false,k2,T3.c['Tuote'].id,KK.RR(T.t.id,'r99'),new Date(NOW));
var kk=blk(P,'trivi',{nm:'Kirj',tt:T3.t.id});var WV=blk(P,'ikkuna',{m:'sum',riv:true});inWin(P,WV,kaava(P,'kirj.kpl * kirj.tuote.hinta'));link(P,{b:T3.t,n:T3.n},'rj',WV,'rv');
var wv=val(P,WV.b.id);A.ok(KK.isErr(wv)&&/rivi 2/.test(wv.err)&&/viitattu rivi puuttuu/.test(wv.err),'puuttuva riviviite tunnistetaan: '+JSON.stringify(wv));
// Vanha ikkuna ennallaan: tyhjä summa on 0
var WO=blk(P,'ikkuna',{m:'sum'});inWin(P,WO,kaava(P,'kohde.määrä'));A.ok(!KK.isErr(val(P,WO.b.id)));

// Sarakkeen poisto: Rivin kaavat ja joukon järjestys luetellaan
var refs=KK.colRefs(P,T.t.id,T.c['Määrä'].id);A.ok(refs.indexOf(kust.b.id)>=0,'Rivin kaava');A.ok(refs.indexOf(jk.b.id)>=0,'joukon kooste');
var refR=KK.colRefs(P,T.t.id,T.c['Ryhmä'].id);A.ok(refR.indexOf(J2.b.id)>=0,'joukon järjestys');

// 100 riviä: yksi lasku
var P2=KK.newProject('sata');var S=taulu(P2,'Sata',[['N','luku'],['H','luku']]);for(var i=1;i<=100;i++)rivi(P2,S,{'N':String(i),'H':'2'});
blk(P2,'trivi',{nm:'R',tt:S.t.id});var W2=blk(P2,'ikkuna',{m:'sum',riv:true});inWin(P2,W2,kaava(P2,'r.n * r.h'));link(P2,{b:S.t,n:S.n},'rj',W2,'rv');
var t0=Date.now();A.strictEqual(val(P2,W2.b.id),10100,'2 × (1 + … + 100)');var J4=blk(P2,'joukko',{nm:'Isot',js:S.c['N'].id,su:'laskeva',max:3});link(P2,{b:S.t,n:S.n},'rj',J4,'rv');link(P2,kaava(P2,'r.n * r.h > 150'),'v',J4,'c');
A.strictEqual(val(P2,J4.b.id),3);A.strictEqual(kv(P2,'isot.eka.n'),100);var ms=Date.now()-t0;A.ok(ms<2000,'100 riviä nopeasti ('+ms+' ms)');

// Toista riveille ketjussa: joukon rivit aloitushetkellä, kierroksen rivi = tapahtuman ja käsiteltävä rivi
function ketjuToista(P,src,body,after){var k=blk(P,'ketju',{nm:'Kay'});var to=blk(P,'toista',{tapa:'rivit'},0,60,k.n.id);A.deepStrictEqual(KK.portsBase(to.b).ins.map(function(o){return o.p;}),['e','rv']);
  link(P,src,'rj',to,'rv');var prev=to,y=120,bs=[];body.forEach(function(s){var b=blk(P,s[0],s[1],0,y+=60,k.n.id);link(P,prev,prev===to?'e':'e',b,'e');prev=b;bs.push(b);});link(P,prev,'e',to,'e');
  var af=null;if(after){af=blk(P,after[0],after[1],260,120,k.n.id);link(P,to,'m',af,'e');}return {k:k,to:to,bs:bs,af:af};}
var P3=KK.newProject('toista');var U=taulu(P3,'Tehtavat',[['Nimi','teksti'],['Kpl','luku'],['Valmis','kylla']]);
var u1=rivi(P3,U,{'Nimi':'A','Kpl':'1','Valmis':'kyllä'}),u2=rivi(P3,U,{'Nimi':'B','Kpl':'5'}),u3=rivi(P3,U,{'Nimi':'C','Kpl':'2','Valmis':'kyllä'});
blk(P3,'trivi',{nm:'Kohde',tt:U.t.id});var Jv=blk(P3,'joukko',{nm:'Valmiit'});link(P3,{b:U.t,n:U.n},'rj',Jv,'rv');link(P3,kaava(P3,'kohde.valmis'),'v',Jv,'c');
var loki=blk(P3,'muisti',{nm:'Loki',v:''}),tapm=blk(P3,'tapaht',{nm:'Tapahtuma'});
var KT=ketjuToista(P3,Jv,[['tee',{do:'lisaa',o:U.t.id,sk:U.c['Kpl'].id,rl:'tapahtuma',v:'10'}],['tee',{do:'aseta',o:loki.b.id,v:{r:kaava(P3,'loki + kohde.nimi + kohde.kpl').b.id}}]],['tee',{do:'aseta',o:loki.b.id,v:{r:kaava(P3,'loki + "|" + tapahtuma.lähde').b.id}}]);
A.ok(!KK.chainIssues(P3,KT.k.b.id,C).some(function(x){return !x.info;}),'ei virheitä: '+JSON.stringify(KK.chainIssues(P3,KT.k.b.id,C)));
KK.chainStart(P3,KT.k.b.id,C,null,0);A.strictEqual(val(P3,loki.b.id),'A11C12|Kay','vain valmiit rivit, kohde = käsiteltävä rivi myös toiminnon jälkeen; valmis jatkaa ketjun tapahtumalla');
A.deepStrictEqual(KK.tRows(P3,U.t.id).map(function(r){return r.a.c2;}),[11,5,12],'toiminto tapahtuman rivillä');A.ok(!P3.st[KT.k.b.id].run);A.ok(!P3.st[KT.k.b.id].lst||!Object.keys(P3.st[KT.k.b.id].lst).length,'luettelo siivottu');
// Odotus kierroksella: rivi säilyy tallennuksen ja tuonnin yli
var P4=KK.newProject('odotus');var V=taulu(P4,'Rivit',[['Nimi','teksti']]);['x','y'].forEach(function(n){rivi(P4,V,{'Nimi':n});});blk(P4,'trivi',{nm:'Kohde',tt:V.t.id});var lk4=blk(P4,'muisti',{nm:'Loki',v:''});
var KT4=ketjuToista(P4,{b:V.t,n:V.n},[['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:lk4.b.id,v:{r:kaava(P4,'loki + kohde.nimi').b.id}}]]);
KK.chainStart(P4,KT4.k.b.id,C,null,0);A.strictEqual(E(P4).prop(KT4.to.b.id,'kierros'),1);var cs4=P4.st[KT4.k.b.id];A.deepStrictEqual(cs4.tk[0].ev.kr,(function(){var o={};o[V.t.id]='r1';return o;})());
var P4b=JSON.parse(JSON.stringify(P4));KK.repair(P4b);A.deepStrictEqual(P4b.st[KT4.k.b.id].lst,P4.st[KT4.k.b.id].lst,'luettelo säilyy');A.ok(P4b.st[KT4.k.b.id].tk[0].ev.kr,'käsiteltävä rivi säilyy kuoressa');
NOW+=5000;KK.chainPoll(P4b,C);A.strictEqual(val(P4b,lk4.b.id),'x');NOW+=5000;KK.chainPoll(P4b,C);A.strictEqual(val(P4b,lk4.b.id),'xy');A.ok(!P4b.st[KT4.k.b.id].run);
// Kesken poistettu käsittelemätön rivi: näkyvä virhe
KK.chainStart(P4,KT4.k.b.id,C,null,0);KK.tDelRow(P4,V.t.id,true,'r2');NOW+=5000;KK.chainPoll(P4,C);var cs5=P4.st[KT4.k.b.id];A.ok(!cs5.run&&/poistettiin kesken toiston/.test(cs5.err),'virhe: '+cs5.err);
// Ilman rivejä: tarkistus kertoo
var P5=KK.newProject('ilman');var k5=blk(P5,'ketju',{nm:'K'});var t5=blk(P5,'toista',{tapa:'rivit'},0,60,k5.n.id);A.ok(KK.chainIssues(P5,k5.b.id,C).some(function(x){return !x.info&&/tuo rivit/.test(x.t);}));

// Korjaus ja tallennus: väärät arvot oletuksiksi, vanha muoto ennallaan
var P6=KK.newProject('korjaus');var T6=taulu(P6,'T',[['A','luku']]);var q=blk(P6,'trivi',{tt:T6.t.id,ls:'outo'}),q2=blk(P6,'trivi',{tt:'b999'}),qj=blk(P6,'joukko',{su:'sivulle',js:5,max:'-3'}),qw=blk(P6,'ikkuna',{riv:'kyllä',vaadi:1}),qt=blk(P6,'toista',{tapa:'muu'});
KK.repair(P6);A.strictEqual(q.b.ls,'kas');A.strictEqual(q2.b.tt,'');A.strictEqual(qj.b.su,'nouseva');A.strictEqual(qj.b.js,'');A.strictEqual(qj.b.max,'');A.ok(!('riv' in qw.b)&&!('vaadi' in qw.b));A.ok(!('tapa' in qt.b));
var qj2=blk(P6,'joukko',{max:'2,7'});KK.repair(P6);A.strictEqual(qj2.b.max,2);
// Rivit-nuoli poistuu, jos ikkuna ei enää ole riveille
var qw2=blk(P6,'ikkuna',{riv:true});link(P6,{b:T6.t,n:T6.n},'rj',qw2,'rv');delete qw2.b.riv;KK.repair(P6);A.ok(!P6.lg.l.some(function(l){return l.t===qw2.n.id&&l.tp==='rv';}));
A.deepStrictEqual(KK.repairEvObj({id:'e',at:1,kr:{b1:'r1',b2:3}}).kr,{b1:'r1'});
// Tuonti: tallennus säilyttää rakenteen
var P7=JSON.parse(JSON.stringify(P));KK.repair(P7);A.strictEqual(val(P7,W.b.id),6);A.strictEqual(ids(val(P7,J2.b.id,'rj')),[r4,r2,r1,r3].join(','));
// Lukittu ketju: rivien arvot lukukuvasta (ulkoinen muutos 2 → 7 odotuksen aikana näkyy vain tilassa 0: 1 + 7; tilassa 1 oma Loki näkyy: 1 + 2; tilassa 2 ei: 0 + 2)
[[0,'8'],[1,'3'],[2,'2']].forEach(function(x){var P=KK.newProject('lk');var L=taulu(P,'L',[['A','luku']]);rivi(P,L,{'A':'1'});rivi(P,L,{'A':'2'});blk(P,'trivi',{nm:'Kohde',tt:L.t.id});var m=blk(P,'muisti',{nm:'Loki',v:''});
  var KL=ketjuToista(P,{b:L.t,n:L.n},[['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:m.b.id,v:{r:kaava(P,'loki + kohde.a').b.id}}]]);if(x[0])KL.k.b.lk=x[0];
  KK.chainStart(P,KL.k.b.id,C,null,0);KK.tEdit(P,L.t.id,true,'r2',L.c['A'].id,'7');NOW+=5000;KK.chainPoll(P,C);NOW+=5000;KK.chainPoll(P,C);
  A.strictEqual(KK.fmt(val(P,m.b.id)),x[1],'lukitus '+x[0]);A.ok(!P.st[KL.k.b.id].run&&!P.st[KL.k.b.id].err);});
console.log('logiikka_49_rivit ok');
