// Versio 8: Satunnaisluku. Kokonaisluku väliltä pienin–suurin, pysyy samana kunnes arvotaan uudelleen (tapahtuma kohtaan
// arvo uudelleen, toiminto Arvo uudelleen, myös ketjussa, arvon nousu). Jakauma tasainen tai muotoiltu: 2–10 suhteellista
// painoa, pehmeä käyrä, todennäköisyydet lasketaan itse. Painot nuolesta (lukitut), kaavassa viite, viite.min, viite.max,
// viite.p1…; korjaus, tallennus ja vanhan projektin muuttumattomuus.
var KK=require('./moottori.js'),A=require('assert');
var RV=0;var C={now:function(){return new Date(2026,9,15,12,0,0);},toast:function(){},nav:function(){},rand:function(){return RV;}};
function near(a,b,e,m){A.ok(Math.abs(a-b)<=(e||1e-9),(m||'')+' '+a+' ≠ '+b);}
function mk(props){var P=KK.newProject('s');var b=KK.addBlock(P,'satu',props||{});var n=KK.addNode(P,b.id,0,0);return {P:P,b:b,n:n};}
function dist(X){return KK.satuDist(KK.satuSpec(X.P,X.b.id,C));}

// Laji, oletukset, kohdat
A.ok(KK.VER>=8);
var X=mk();A.strictEqual(X.b.nm,'Satunnaisluku');A.strictEqual(X.b.vt,'satunnaisluku');A.strictEqual(X.b.jak,'tasa');A.strictEqual(X.b.min,1);A.strictEqual(X.b.max,6);
A.deepStrictEqual(KK.ports(X.b).ins.map(function(p){return p.p;}),['e','min','max']);A.deepStrictEqual(KK.ports(X.b).outs.map(function(p){return p.p+':'+p.t;}),['v:v','e:e']);
A.deepStrictEqual(KK.ports({k:'satu',jak:'muoto',pn:3}).ins.map(function(p){return p.p;}),['e','min','max','p1','p2','p3']);
A.strictEqual(KK.ports({k:'satu',jak:'muoto',pn:3}).ins[3].n,'paino 1');
A.strictEqual(KK.satuN({pn:'15'}),10);A.strictEqual(KK.satuN({pn:1}),2);A.strictEqual(KK.satuN({}),5);
A.strictEqual(KK.Ev(X.P,C).val(X.b.id),null,'ei vielä arvottu');
A.ok(/Ei vielä arvottu/.test(KK.why(X.P,KK.Ev(X.P,C),X.b.id,1).txt));

// Tasainen arvonta arpaluvulla: 1–6 kuin noppa, arvo pysyy samana
[[0,1],[0.1667,2],[0.5,4],[0.9999,6]].forEach(function(c){RV=c[0];A.strictEqual(KK.satuRoll(X.P,X.b.id,C),c[1],'tasainen '+c[0]);A.strictEqual(KK.Ev(X.P,C).val(X.b.id),c[1]);});
RV=0;KK.tick(X.P,C);A.strictEqual(KK.Ev(X.P,C).val(X.b.id),6,'tick ei arvo uudelleen');
var d=dist(X);A.strictEqual(d.items.length,6);A.ok(d.flat&&d.exact);d.items.forEach(function(it){near(it.p,1/6);});
// Tasainen Math.randomilla
var C2={now:C.now};var cnt={};for(var i=0;i<6000;i++){var v=KK.satuRoll(X.P,X.b.id,C2);cnt[v]=(cnt[v]||0)+1;}
A.deepStrictEqual(Object.keys(cnt).map(Number).sort(),[1,2,3,4,5,6]);Object.keys(cnt).forEach(function(k){A.ok(cnt[k]>800&&cnt[k]<1200,JSON.stringify(cnt));});

// Väli: tekstinä, desimaalit, väärin päin, yksi luku, ei kokonaislukuja, puuttuu, ei luku, toisesta palikasta, nuolesta
X.b.min='2,5';X.b.max='5';var sp=KK.satuSpec(X.P,X.b.id,C);A.strictEqual(sp.lo,3);A.strictEqual(sp.hi,5);A.strictEqual(sp.cnt,3);
X.b.min=10;X.b.max=7;sp=KK.satuSpec(X.P,X.b.id,C);A.deepStrictEqual([sp.lo,sp.hi],[7,10],'väärin päin käännetään');
X.b.min=-3;X.b.max=-3;RV=0.7;A.strictEqual(KK.satuRoll(X.P,X.b.id,C),-3,'yksi luku');
X.b.min='1,2';X.b.max='1,8';A.ok(/ei ole kokonaislukuja/.test(KK.satuSpec(X.P,X.b.id,C).err));
var keep=X.P.st[X.b.id];var r=KK.satuRoll(X.P,X.b.id,C);A.ok(KK.isErr(r));A.strictEqual(X.P.st[X.b.id],keep,'virheellinen väli ei arvo');
X.b.min='';X.b.max=6;A.ok(/pienin puuttuu/.test(KK.satuSpec(X.P,X.b.id,C).err));X.b.min='paljon';A.ok(/pienin ei ole luku/.test(KK.satuSpec(X.P,X.b.id,C).err));
A.ok(/Väli tai painot/.test(KK.why(X.P,KK.Ev(X.P,C),X.b.id,1).txt));
var lk=KK.addBlock(X.P,'luku',{start:20});X.b.min=1;X.b.max={r:lk.id};A.strictEqual(KK.satuSpec(X.P,X.b.id,C).hi,20,'suurin palikasta');
X.b.max=6;var sl=KK.addBlock(X.P,'saadin',{min:0,max:100,start:3});var sn=KK.addNode(X.P,sl.id,-300,0);A.ok(KK.addLink(X.P,sn.id,'v',X.n.id,'max'));A.strictEqual(KK.satuSpec(X.P,X.b.id,C).hi,3,'suurin nuolesta');
X.P.lg.l=X.P.lg.l.filter(function(l){return l.tp!=='max';});

// Muotoiltu: painot = luvut, suhteelliset painot, nollat
X=mk({jak:'muoto',pn:6,pw:[10,10,10,10,10,50]});d=dist(X);A.ok(!d.flat);[0.1,0.1,0.1,0.1,0.1,0.5].forEach(function(p,i){near(d.items[i].p,p,1e-12,'paino '+(i+1));});
X.b.pw=[1,1,1,1,1,5];d=dist(X);near(d.items[5].p,0.5,1e-12,'suhteelliset');
X.b.pw=[0,0,0,0,0,100];d=dist(X);near(d.items[5].p,1,1e-12);RV=0;A.strictEqual(KK.satuRoll(X.P,X.b.id,C),6);RV=0.999;A.strictEqual(KK.satuRoll(X.P,X.b.id,C),6);
X.b.pw=[0,0,0,0,0,0];var sz=KK.satuSpec(X.P,X.b.id,C);A.ok(sz.zero);d=KK.satuDist(sz);A.ok(d.flat);near(d.items[0].p,1/6);A.ok(/nollassa/.test(KK.why(X.P,KK.Ev(X.P,C),X.b.id,1).txt));
X.b.pw=[10,10,10,10,10,50];var c6={};for(i=0;i<6000;i++){v=KK.satuRoll(X.P,X.b.id,C2);c6[v]=(c6[v]||0)+1;}A.ok(c6[6]>2700&&c6[6]<3300&&c6[1]>450&&c6[1]<750,JSON.stringify(c6));
A.strictEqual(KK.satuTop(dist(X)),'6 (50 %)');A.ok(/Todennäköisin: 6 \(50 %\)/.test(KK.why(X.P,KK.Ev(X.P,C),X.b.id,1).txt));
// Arpaluku osuu oikeaan lukuun kertymässä
X.b.pw=[10,10,10,10,10,50];[[0,1],[0.0999,1],[0.1,2],[0.45,5],[0.4999,5],[0.5,6]].forEach(function(c){RV=c[0];A.strictEqual(KK.satuRoll(X.P,X.b.id,C),c[1],'kertymä '+c[0]);});

// Käyrä: ei koskaan alle nollan eikä naapuripisteiden yli, kulkee pisteiden kautta
for(var t=0;t<200;t++){var n=2+t%9,w=[];for(var j=0;j<n;j++)w.push(Math.round(Math.random()*100)*(Math.random()<0.3?0:1));
  for(j=0;j<n;j++)near(KK.satuCurve(w,n<2?0:j/(n-1)),w[j],1e-9,'pisteen kautta');
  for(var q=0;q<=100;q++){var x=q/100,y=KK.satuCurve(w,x),seg=Math.min(n-2,Math.floor(x*(n-1)+1e-12));A.ok(y>=0,'ei alle nollan');A.ok(y<=Math.max(w[seg],w[seg+1])+1e-9&&y>=Math.min(w[seg],w[seg+1])-1e-9,'naapurien välissä '+JSON.stringify(w)+' '+x+' '+y);}}
// Pehmeä: 5 painoa välillä 1–9 (keskikohdat käyrältä)
X=mk({jak:'muoto',pn:5,pw:[0,100,0,100,0],min:1,max:9});d=dist(X);near(d.items[0].p,0);near(d.items[2].p,d.items[6].p,1e-12,'symmetrinen');A.ok(d.items[1].p>0&&d.items[1].p<d.items[2].p,'pehmeä nousu');near(d.items[4].p,0,1e-12,'keskellä nolla');

// Painojen määrän muutos säilyttää muodon, valmiit muodot
A.deepStrictEqual(KK.satuResize([10,40,100,40,10],3),[10,100,10]);A.deepStrictEqual(KK.satuResize([10,40,100,40,10],5),[10,40,100,40,10]);var r9=KK.satuResize([10,40,100,40,10],9);A.strictEqual(r9.length,9);A.strictEqual(r9[4],100);A.strictEqual(r9[0],10);A.strictEqual(r9[2],40);
A.deepStrictEqual(KK.satuPreset('tasa',4),[50,50,50,50]);var pk=KK.satuPreset('keski',5);A.ok(pk[2]===100&&pk[0]<pk[1]&&pk[0]===pk[4]);var pr=KK.satuPreset('reunat',5);A.ok(pr[0]===100&&pr[2]<pr[1]);
A.deepStrictEqual(KK.satuPreset('nousee',4),[10,40,70,100]);A.deepStrictEqual(KK.satuPreset('laskee',2),[100,10]);A.deepStrictEqual(Object.keys(KK.SATU_PRESETS),['tasa','keski','reunat','nousee','laskee']);

// Iso väli: lohkot, arvonta pysyy välillä, tasainen ilman lohkoja
X=mk({min:1,max:1000000,jak:'muoto',pn:3,pw:[0,100,0]});d=dist(X);A.ok(!d.exact);A.strictEqual(d.items.length,400);A.strictEqual(d.items[0].a,1);A.strictEqual(d.items[399].b,1000000);
var sum=0;d.items.forEach(function(it){sum+=it.p;});near(sum,1,1e-9);
for(i=0;i<500;i++){RV=Math.random();v=KK.satuRoll(X.P,X.b.id,C);A.ok(v>=1&&v<=1000000&&v===Math.round(v));}
X.b.jak='tasa';RV=0.5;A.strictEqual(KK.satuRoll(X.P,X.b.id,C),500001);

// Painot nuolesta: kaava ohjaa painoa, lukittu, virhe, negatiivinen = 0
X=mk({jak:'muoto',pn:6,pw:[10,10,10,10,10,10]});var kv=KK.addBlock(X.P,'kaava',{f:'5 * 10'});var kn=KK.addNode(X.P,kv.id,-300,0);
A.ok(KK.addLink(X.P,kn.id,'v',X.n.id,'p6'),'nuoli painoon');sp=KK.satuSpec(X.P,X.b.id,C);A.deepStrictEqual(sp.lk,[false,false,false,false,false,true]);A.strictEqual(sp.w[5],50);near(dist(X).items[5].p,0.5,1e-12);
kv.f='-20';A.strictEqual(KK.satuSpec(X.P,X.b.id,C).w[5],0,'negatiivinen = 0');
kv.f='"paljon"';A.ok(/paino 6 ei ole luku/.test(KK.satuSpec(X.P,X.b.id,C).err));kv.f='250';A.strictEqual(KK.satuSpec(X.P,X.b.id,C).w[5],250,'logiikasta yli 100 käy');near(dist(X).items[5].p,250/300,1e-12);
A.ok(KK.why(X.P,KK.Ev(X.P,C),X.b.id,2).kids.some(function(k){return k.id===kv.id;}),'Miksi? näyttää painon lähteen');
// Painojen määrä pienenee: nuoli poistuu, viittaus näkyy virheenä
var kf=KK.addBlock(X.P,'kaava',{});KK.addNode(X.P,kf.id,-300,200);kf.f=KK.kaavaToIds(X.P,'satunnaisluku.p6');A.strictEqual(KK.Ev(X.P,C).val(kf.id),250);
X.b.pn=5;X.b.pw=KK.satuResize(X.b.pw,5);KK.repair(X.P);A.ok(!X.P.lg.l.some(function(l){return l.tp==='p6';}),'nuoli kadonneeseen painoon poistui');
A.ok(/painoja on 5/.test(KK.Ev(X.P,C).val(kf.id).err));
// Tasainen: painoja ei ole
X.b.jak='tasa';KK.repair(X.P);A.ok(/jakauma on tasainen/.test(KK.Ev(X.P,C).val(kf.id).err));

// Kaavassa: viite = luku, .min, .max, .p1, viite numerolla, tekstinä takaisin
X=mk({jak:'muoto',pn:3,pw:[20,30,40],min:2,max:8});KK.setVt(X.P,X.b.id,'noppa');RV=0;KK.satuRoll(X.P,X.b.id,C);
function kaava(f){var k=KK.addBlock(X.P,'kaava',{});KK.addNode(X.P,k.id,-300,0);k.f=KK.kaavaToIds(X.P,f);return k;}
var k1=kaava('noppa + noppa.max');A.strictEqual(KK.Ev(X.P,C).val(k1.id),2+8);A.strictEqual(KK.kaavaToText(X.P,k1.f),'noppa + noppa.max');
A.strictEqual(KK.Ev(X.P,C).val(kaava('noppa.min').id),2);A.strictEqual(KK.Ev(X.P,C).val(kaava('noppa.p2 + noppa.p3').id),70);A.strictEqual(KK.Ev(X.P,C).val(kaava('noppa.arvo').id),2);
A.strictEqual(KK.Ev(X.P,C).val(kaava('noppa.pienin').id),2);A.strictEqual(KK.Ev(X.P,C).val(kaava('noppa.suurin').id),8);
A.ok(/tuntematon ominaisuus/.test(KK.Ev(X.P,C).val(kaava('noppa.p').id).err));A.ok(/painoja on 3/.test(KK.Ev(X.P,C).val(kaava('noppa.p0').id).err));
var k2=kaava('noppa.p1 > 10');A.strictEqual(KK.Ev(X.P,C).val(k2.id),true);
A.strictEqual(KK.kaavaTokens('{#b1}.p12').t[0].p,'p12','pisteen jälkeen numero mukaan');A.strictEqual(KK.kaavaTokens('{#b1}.näkyy').t[0].p,'näkyy');
// Yhteydet: kaava käyttää satunnaislukua, väli toisesta palikasta näkyy
var D=KK.deps(X.P);A.ok((D.usedBy[X.b.id]||[]).some(function(u){return u.id===k1.id&&u.how==='kaava';}));

// Arvonta tapahtumasta: painike → arvo uudelleen, arvottu → toiminto
X=mk();var lst=KK.addBlock(X.P,'lista');var bt=KK.addBlock(X.P,'nappi',{beh:'kerta'});var bn=KK.addNode(X.P,bt.id,-300,0);
A.strictEqual(KK.ports(X.b).ins.filter(function(q){return KK.canLink(X.P,bn.id,'e',X.n.id,q.p);}).map(function(q){return q.p;}).join(),'e','tapahtumanuoli vain kohtaan arvo uudelleen');
KK.addLink(X.P,bn.id,'e',X.n.id,'e');var rw=KK.addBlock(X.P,'tee',{do:'rivi',o:lst.id,tx:'Heitto {#'+X.b.id+'}'});var rn=KK.addNode(X.P,rw.id,300,0);KK.addLink(X.P,X.n.id,'e',rn.id,'e');
RV=0.99;KK.press(X.P,bt.id,C);A.deepStrictEqual(KK.listRows(X.P,lst.id).map(function(r){return r.tx;}),['Heitto 6']);RV=0;KK.press(X.P,bt.id,C);A.deepStrictEqual(KK.listRows(X.P,lst.id).map(function(r){return r.tx;}),['Heitto 6','Heitto 1']);
// Arvon nousu (kytkin) arpoo
var ky=KK.addBlock(X.P,'kytkin');var kyn=KK.addNode(X.P,ky.id,-300,100);KK.addLink(X.P,kyn.id,'v',X.n.id,'e');KK.tick(X.P,C);RV=0.5;KK.userSet(X.P,ky.id,true,C);A.strictEqual(KK.Ev(X.P,C).val(X.b.id),4,'nousu arpoo');
RV=0;KK.userSet(X.P,ky.id,true,C);A.strictEqual(KK.Ev(X.P,C).val(X.b.id),4,'pysyvä tila ei arvo uudelleen');

// Toiminto Arvo uudelleen: tavallisena ja ketjussa, kuvaus, huomautukset
A.strictEqual(KK.DOS.arvonta,'Arvo uudelleen');var ta=KK.addBlock(X.P,'tee',{do:'arvonta',o:X.b.id});A.strictEqual(ta.nm,'Arvo uudelleen');A.strictEqual(KK.descAct(X.P,ta.id),'Arvo uudelleen: Satunnaisluku');
RV=0.2;KK.runAction(X.P,ta.id,C);A.strictEqual(KK.Ev(X.P,C).val(X.b.id),2);A.strictEqual(KK.listRows(X.P,lst.id).slice(-1)[0].tx,'Heitto 2','arvottu-tapahtuma lähti toiminnosta');
var kt=KK.addBlock(X.P,'ketju'),kw=KK.addNode(X.P,kt.id,0,400);var s1=KK.addBlock(X.P,'tee',{do:'arvonta',o:X.b.id}),s1n=KK.addNode(X.P,s1.id,0,0,kw.id);
var s2=KK.addBlock(X.P,'tee',{do:'aseta',o:'',v:''});var mu=KK.addBlock(X.P,'muisti');s2.o=mu.id;s2.v={r:X.b.id};var s2n=KK.addNode(X.P,s2.id,0,60,kw.id);KK.addLink(X.P,s1n.id,'e',s2n.id,'e');
A.ok(!KK.chainIssues(X.P,kt.id,C).some(function(x){return !x.info;}));RV=0.7;KK.chainStart(X.P,kt.id,C);A.strictEqual(KK.Ev(X.P,C).val(mu.id),5,'ketjussa arvottu ja käytetty heti');
s1.o=lst.id;A.ok(KK.chainIssues(X.P,kt.id,C).some(function(x){return /ei ole satunnaisluku/.test(x.t);}));s1.o='';A.ok(KK.chainIssues(X.P,kt.id,C).some(function(x){return /valitse kohde/.test(x.t);}));
s1.o=X.b.id;X.b.min='x';A.ok(KK.chainIssues(X.P,kt.id,C).some(function(x){return /satunnaisluvussa .* on virhe/.test(x.t);}));X.b.min=1;
// Väärä kohde ei tee mitään
var tb2=KK.addBlock(X.P,'tee',{do:'arvonta',o:lst.id});KK.runAction(X.P,tb2.id,C);
// Ei kehää: arvottu → arvo uudelleen samaan palikkaan pysähtyy syvyysrajaan
var X2=mk();var a2=KK.addNode(X2.P,X2.b.id,200,0);KK.addLink(X2.P,X2.n.id,'e',a2.id,'e');KK.satuRoll(X2.P,X2.b.id,C);A.ok(typeof X2.P.st[X2.b.id]==='number');

// Korjaus ja tallennus
var bad=mk();bad.b.jak='outo';bad.b.pn='15';bad.b.pw=['20','x',150,-5];bad.b.min={r:'eiole'};bad.b.max=null;bad.P.st[bad.b.id]='kuusi';KK.repair(bad.P);
A.strictEqual(bad.b.jak,'tasa');A.strictEqual(bad.b.pn,10);A.deepStrictEqual(bad.b.pw,[20,50,100,0,50,50,50,50,50,50]);A.strictEqual(bad.b.min,'');A.strictEqual(bad.b.max,'');A.ok(!bad.P.st.hasOwnProperty(bad.b.id));
var noDefaults={id:'b9',k:'satu',nm:'Noppa',vt:'noppa'};var P5=KK.newProject('v');P5.b.b9=noDefaults;P5.lg.n.push({id:'n9',p:'b9',x:0,y:0,g:''});KK.repair(P5);A.strictEqual(P5.b.b9.max,6);A.deepStrictEqual(P5.b.b9.pw,[50,50,50,50,50]);
X=mk({jak:'muoto',pn:4,pw:[5,10,20,40],min:0,max:30});RV=0.8;KK.satuRoll(X.P,X.b.id,C);var J=JSON.parse(JSON.stringify({app:'kytkoskartta',ver:KK.VER,projects:[X.P]}));var Dt=KK.repairData(J);var P2=Dt.projects[0];
A.deepStrictEqual(P2.b[X.b.id].pw,[5,10,20,40]);A.strictEqual(KK.Ev(P2,C).val(X.b.id),KK.Ev(X.P,C).val(X.b.id),'arvottu luku säilyy tallennuksessa');A.strictEqual(Dt.ver,8);
// Kopioi ja liitä
var cp=KK.copyNodes(X.P,[X.n.id]);var made=KK.pasteNodes(X.P,cp,40,40);var nb=Object.keys(X.P.b).filter(function(i){return i!==X.b.id&&X.P.b[i].k==='satu';});A.strictEqual(nb.length,1);A.deepStrictEqual(X.P.b[nb[0]].pw,[5,10,20,40]);A.notStrictEqual(X.P.b[nb[0]].vt,X.b.vt);
// Vanha projekti ilman satunnaislukua ennallaan
var old=JSON.parse(require('fs').readFileSync(__dirname+'/vanha_v5_esimerkki.json','utf8'));var before=JSON.stringify(old.projects?old.projects[0].b:old.b);var Dt2=KK.repairData(JSON.parse(JSON.stringify(old)));
A.ok(!Object.keys(Dt2.projects[0].b).some(function(i){return Dt2.projects[0].b[i].k==='satu';}));
console.log('ok logiikka_26_satunnaisluku');
