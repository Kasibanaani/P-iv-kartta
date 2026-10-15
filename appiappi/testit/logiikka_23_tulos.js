// Versio 7.4: ketjun tulos ja Lopeta ketju. Päätöspuun jokainen haara päättyy omaan tulokseensa; tulos näkyy ketjun
// kohdasta tulos, kaavassa viite.tulos ja nuolella näkymän tekstiin. Tulos tyhjenee uudessa käynnistyksessä. Lopeta ketju
// lopettaa rinnakkaiset haarat ja antaa valmis-tapahtuman. Tulos tallentuu, rikkinäinen poistetaan.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,15,10,0,0).getTime();var C={now:function(){return new Date(NOW);},toast:function(){},nav:function(){}};
var P=KK.newProject('t');var k=KK.addBlock(P,'ketju',{nm:'Päätös'}),w=KK.addNode(P,k.id,0,0);A.strictEqual(k.vt,'päätös');
var uni=KK.addBlock(P,'saadin',{nm:'Uni',start:6});var nu=KK.addNode(P,uni.id,-300,0);
var mh=KK.addBlock(P,'monihaara',{haarat:[{m:'vali',a:'',b:'5'},{m:'vali',a:'5',b:'8'}]});var nmh=KK.addNode(P,mh.id,0,40,w.id);KK.repair(P);KK.addLink(P,nu.id,'v',nmh.id,'a');
function res(v,port,x){var b=KK.addBlock(P,'ktulos',{v:v});var n=KK.addNode(P,b.id,x,120,w.id);KK.addLink(P,nmh.id,port,n.id,'e');return n;}
res('Väsynyt','h1',0);res('Ok','h2',260);var pir=res('','m',520);
var ar=KK.addBlock(P,'arvo',{v:'Pirteä',nm:'Pirteä teksti'});KK.addNode(P,ar.id,600,300);P.b[pir.p].v={r:ar.id};
A.strictEqual(KK.Ev(P,C).val(k.id,'t'),null,'ei tulosta ennen ajoa');
KK.chainStart(P,k.id,C);var E=KK.Ev(P,C);A.strictEqual(E.val(k.id,'t'),'Ok');A.strictEqual(E.val(k.id),false,'arvo on edelleen käynnissä');
A.ok(/Tulos: Ok/.test(KK.why(P,E,k.id,1).txt));
KK.userSet(P,uni.id,3,C);KK.chainStart(P,k.id,C);A.strictEqual(KK.Ev(P,C).val(k.id,'t'),'Väsynyt');
KK.userSet(P,uni.id,9,C);KK.chainStart(P,k.id,C);A.strictEqual(KK.Ev(P,C).val(k.id,'t'),'Pirteä','tulos toisen palikan arvosta');
// kaava ja nuoli näkymään
var kv=KK.addBlock(P,'kaava');KK.addNode(P,kv.id,800,0);kv.f=KK.kaavaToIds(P,'"Olo: " + päätös.tulos');A.strictEqual(KK.Ev(P,C).val(kv.id),'Olo: Pirteä');
var kv2=KK.addBlock(P,'kaava');KK.addNode(P,kv2.id,800,60);kv2.f=KK.kaavaToIds(P,'päätös.käynnissä');A.strictEqual(KK.Ev(P,C).val(kv2.id),false);
var tx=KK.addBlock(P,'nayta',{tx:''});var ntx=KK.addNode(P,tx.id,800,200);KK.addLink(P,w.id,'t',ntx.id,'tx');A.strictEqual(KK.Ev(P,C).text(tx.id),'Pirteä');
// tulos tyhjenee uudessa käynnistyksessä ja täyttyy ajastimen jälkeen
var Q=KK.newProject('q');var kq=KK.addBlock(Q,'ketju'),wq=KK.addNode(Q,kq.id,0,0);var tq=KK.addBlock(Q,'ajastin',{kesto:5}),rq=KK.addBlock(Q,'ktulos',{v:'42'});
var ntq=KK.addNode(Q,tq.id,0,40,wq.id),nrq=KK.addNode(Q,rq.id,0,100,wq.id);KK.addLink(Q,ntq.id,'e',nrq.id,'e');
KK.chainStart(Q,kq.id,C);NOW+=5000;KK.chainPoll(Q,C);A.strictEqual(KK.Ev(Q,C).val(kq.id,'t'),42,'luku säilyy lukuna');
KK.chainStart(Q,kq.id,C);A.strictEqual(KK.Ev(Q,C).val(kq.id,'t'),null,'uusi kierros tyhjentää');
// tulos nuolesta ja päivämäärä
var dq=KK.addBlock(Q,'tanaan');var nd=KK.addNode(Q,dq.id,-300,100);KK.addLink(Q,nd.id,'v',nrq.id,'v');NOW+=5000;KK.chainPoll(Q,C);A.deepStrictEqual(KK.Ev(Q,C).val(kq.id,'t'),{d:'2026-10-15'});
// virhe tuloksessa pysäyttää selkeästi
var ev=KK.addBlock(Q,'kaava');var nev=KK.addNode(Q,ev.id,-300,200);ev.f='1 / 0';P.lg&&0;
Q.lg.l=Q.lg.l.filter(function(l){return !(l.t===nrq.id&&l.tp==='v');});KK.addLink(Q,nev.id,'v',nrq.id,'v');KK.chainStart(Q,kq.id,C);NOW+=5000;KK.chainPoll(Q,C);A.ok(/tulos: jako nollalla/.test(Q.st[kq.id].err));
// Lopeta ketju: kaksi rinnakkaista haaraa, nopeampi lopettaa
var R=KK.newProject('r');var kr=KK.addBlock(R,'ketju'),wr=KK.addNode(R,kr.id,0,0),lst=KK.addBlock(R,'lista');
function S(props,x,y){var b=KK.addBlock(R,props.k,props);return KK.addNode(R,b.id,x,y,wr.id);}
var al=S({k:'tee',do:'rivi',o:lst.id,tx:'alku'},0,0),f1=S({k:'ajastin',kesto:5},0,60),f2=S({k:'ajastin',kesto:30},200,60),w1=S({k:'ktulos',v:'nopea'},0,120),lp=S({k:'lopeta'},0,180),w2=S({k:'tee',do:'rivi',o:lst.id,tx:'hidas'},200,120);
[[al,f1],[al,f2],[f1,w1],[w1,lp],[f2,w2]].forEach(function(x){KK.addLink(R,x[0].id,'e',x[1].id,'e');});
var dn=0;var dd=KK.addBlock(R,'tee',{do:'ilmoita',tx:'valmis'});KK.addLink(R,wr.id,'e',KK.addNode(R,dd.id,600,0).id,'e');var CR={now:C.now,toast:function(){dn++;},nav:function(){}};
KK.chainStart(R,kr.id,CR);A.strictEqual(R.st[kr.id].tk.length,2);NOW+=5000;KK.chainPoll(R,CR);
A.strictEqual(R.st[kr.id].run,false);A.strictEqual(R.st[kr.id].tk.length,0);A.strictEqual(dn,1,'valmis-tapahtuma');A.strictEqual(KK.Ev(R,CR).val(kr.id,'t'),'nopea');A.ok(!R.st[kr.id].stop,'lopetus ei ole pysäytys');
NOW+=60000;KK.chainPoll(R,CR);A.deepStrictEqual(KK.listRows(R,lst.id).map(function(r){return r.tx;}),['alku'],'hidas haara ei jatkunut');
A.ok(/Lopettaa koko ketjun/.test(KK.why(R,KK.Ev(R,CR),R.b[lp.p].id,1).txt));
// tallennus ja korjaus
var J=KK.repair(JSON.parse(JSON.stringify(P)));A.strictEqual(KK.Ev(J,C).val(k.id,'t'),'Pirteä');
J.st[k.id].tulos={rikki:1};KK.repair(J);A.strictEqual(J.st[k.id].tulos,undefined);
// kopio: Ketjun tulos -palikka viittaa kopioituun arvoon
var cl=KK.copyNodes(P,[w.id]);var ids=KK.pasteNodes(P,cl,0,600);A.ok(ids.length>=5);
console.log('logiikka_23_tulos ok');
