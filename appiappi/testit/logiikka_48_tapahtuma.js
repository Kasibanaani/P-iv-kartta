// P2: tapahtuman mukana kulkeva tieto (F04, D05). Kuori {id, src, nm, at, vanha, uusi, rivi} syntyy tapahtumahetkellä,
// kulkee tapahtumanuolia pitkin ja säilyy ketjun suorituksessa ja haarassa odotusten yli. Tavallinen viittaus lukee
// ajantasaista arvoa (ajantasaisessa ketjussa), tapahtuman tieto pysyy tapahtumahetken mukaisena.
var KK=require('./moottori.js'),A=require('assert');
var NOW=new Date(2026,9,16,10,0,0).getTime(),TOASTS=[];
var C={now:function(){return new Date(NOW);},toast:function(t){TOASTS.push(t);},nav:function(){}};
function E(P){return KK.Ev(P,C);}
function val(P,id){return E(P).val(id);}
function kaava(P,f){var b=KK.addBlock(P,'kaava');KK.addNode(P,b.id,-600,0);b.f=KK.kaavaToIds(P,f);return b;}
function blk(P,k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g);return {b:b,n:n};}
function link(P,a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);A.ok(l,'nuoli '+a.b.nm+' → '+b.b.nm);return l;}
/* Ketju vaiheineen: steps = [[laji, props], …] peräkkäin. */
function ketju(P,nm,steps,lk){var k=blk(P,'ketju',{nm:nm});if(lk)k.b.lk=lk;var y=0,prev=null,out=[];
  steps.forEach(function(s){var st=blk(P,s[0],s[1],0,y+=60,k.n.id);if(prev)link(P,prev,'e',st,'e');prev=st;out.push(st);});return {k:k,s:out};}
function kulu(P,ms){NOW+=ms;KK.chainPoll(P,C);}

// Tapahtuman tiedot -palikka: viite tapahtuma, ominaisuudet; tapahtuman ulkopuolella tyhjä
var P=KK.newProject('tapahtuma');var tp=blk(P,'tapaht',{nm:'Tapahtuma'});A.strictEqual(tp.b.vt,'tapahtuma');
A.deepStrictEqual(KK.portsBase(tp.b).outs.map(function(o){return o.p;}),['v','vanha','rivi']);
['uusi','vanha','rivi','lähde','aika','päivä','tunniste','on','taulukko'].forEach(function(n){A.ok(KK.omFind(tp.b,n),'ominaisuus '+n);});
A.strictEqual(val(P,kaava(P,'tapahtuma.uusi').id),null);A.strictEqual(val(P,kaava(P,'tapahtuma.on').id),false,'ulkopuolella ei tapahtumaa');

// Painike → Toiminto: tapahtuma.uusi, vanha, lähde, aika; vanha on arvo ennen painallusta
var nap=blk(P,'nappi',{nm:'Plus',beh:'kerta',v:P.views[0].id});var lue=blk(P,'muisti',{nm:'Lue'});var lahde=blk(P,'muisti',{nm:'Lahde'});var vanha=blk(P,'muisti',{nm:'Vanha'});
var a1=blk(P,'tee',{do:'aseta',o:lue.b.id,v:{r:kaava(P,'tapahtuma.uusi').id}});var a2=blk(P,'tee',{do:'aseta',o:lahde.b.id,v:{r:kaava(P,'tapahtuma.lähde + " " + tapahtuma.aika').id}});
var a3=blk(P,'tee',{do:'aseta',o:vanha.b.id,v:{r:kaava(P,'tapahtuma.vanha').id}});
link(P,nap,'e',a1,'e');link(P,a1,'e',a2,'e');link(P,a2,'e',a3,'e');
KK.press(P,nap.b.id,C);A.strictEqual(val(P,lue.b.id),1);A.strictEqual(val(P,lahde.b.id),'Plus 10.00');A.strictEqual(val(P,vanha.b.id),0,'vanha = ennen painallusta');
KK.press(P,nap.b.id,C);A.strictEqual(val(P,lue.b.id),2);A.strictEqual(val(P,vanha.b.id),1);

// Kenttä muuttuu → arvon nousu käynnistää ketjun. D05: painallushetken 2 jää tapahtumaan, kenttä muuttuu 5:ksi odotuksen aikana.
function d05(lk){
  var P=KK.newProject('d05');blk(P,'tapaht',{nm:'Tapahtuma'});var maara=blk(P,'luku',{nm:'Maara',v:P.views[0].id,start:0});
  var tA=blk(P,'muisti',{nm:'TapA'}),tB=blk(P,'muisti',{nm:'NytB'});
  var K=ketju(P,'Odotus',[['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'aseta',o:tA.b.id,v:{r:kaava(P,'tapahtuma.uusi').id}}],['tee',{do:'aseta',o:tB.b.id,v:{r:kaava(P,'maara').id}}]],lk);
  link(P,maara,'v',K.k,'e');
  KK.tick(P,C);KK.userSet(P,maara.b.id,2,C);var cs=P.st[K.k.b.id];A.ok(cs&&cs.run,'ketju käynnistyi');A.strictEqual(cs.ev.uusi,2);A.strictEqual(cs.ev.vanha,0);A.strictEqual(cs.ev.src,maara.b.id);
  KK.userSet(P,maara.b.id,5,C);A.strictEqual(P.st[K.k.b.id].n,1,'nousu vain kerran');
  kulu(P,5000);return {a:val(P,tA.b.id),b:val(P,tB.b.id)};}
var r0=d05(0);A.deepStrictEqual(r0,{a:2,b:5},'ajantasainen: tapahtuma 2, viittaus 5');
var r2=d05(2);A.deepStrictEqual(r2,{a:2,b:2},'lukitus 2 jäädyttää tavallisen viittauksen, tapahtuma ennallaan');
var r1=d05(1);A.deepStrictEqual(r1,{a:2,b:2},'lukitus 1: ulkopuolinen muutos ei näy');

// Taulukkoon: valinta → käynnistää ketjun; ketju odottaa ja lisää tapahtuman riville. Kaksi samanaikaista suoritusta.
var Q=KK.newProject('rivit');blk(Q,'tapaht',{nm:'Tapahtuma'});
var T=blk(Q,'taulu',{nm:'Kohteet'});var cN=KK.addCol(T.b,'Nimi','teksti'),cM=KK.addCol(T.b,'Määrä','luku');
['A','B'].forEach(function(nm){var r=KK.tAddRow(Q,T.b.id,false);KK.tEdit(Q,T.b.id,false,r,cN.id,nm);KK.tEdit(Q,T.b.id,false,r,cM.id,'0');});
function plusKetju(nm){return ketju(Q,nm,[['ajastin',{kesto:'5',yks:'s'}],['tee',{do:'lisaa',o:T.b.id,sk:cM.id,rl:'tapahtuma'}]]);}
var K1=plusKetju('Plus1'),K2=plusKetju('Plus2');
var v1=blk(Q,'tee',{do:'valitserivi',o:T.b.id,rs:'eka'}),v2=blk(Q,'tee',{do:'valitserivi',o:T.b.id,rs:'vika'});
link(Q,v1,'e',K1.k,'e');link(Q,v2,'e',K2.k,'e');
KK.runAction(Q,v1.b.id,C,0);NOW+=1000;KK.runAction(Q,v2.b.id,C,0);
A.deepStrictEqual(Q.st[K1.k.b.id].ev.rivi,{rr:T.b.id,ri:'r1'});A.deepStrictEqual(Q.st[K2.k.b.id].ev.rivi,{rr:T.b.id,ri:'r2'});
A.strictEqual(Q.st[K1.k.b.id].ev.src,v1.b.id,'lähde on toiminto');A.strictEqual(KK.tSel(Q,T.b.id),'r2','valinta ehti vaihtua');
// Vienti ja tuonti kesken odotuksen (appi suljettu): kuoret säilyvät
Q=KK.repair(JSON.parse(JSON.stringify(Q)));
kulu(Q,4000);var m1=KK.Ev(Q,C);var qm=kaava(Q,'kohteet.määrä.summa');A.strictEqual(val(Q,qm.id),1,'ensimmäinen valmis');
kulu(Q,1000);var rows=KK.tRows(Q,T.b.id);A.strictEqual(rows[0].a[cM.id],1,'A sai oman lisäyksensä');A.strictEqual(rows[1].a[cM.id],1,'B sai oman lisäyksensä (ei A:lle kahta)');
A.strictEqual(Q.st[K1.k.b.id].run,false);A.strictEqual(Q.st[K2.k.b.id].run,false);
// Rivien järjestyksen muutos ei muuta kohdetta (tunniste, ei rivinumero)
var K3=plusKetju('Plus3');var v3=blk(Q,'tee',{do:'valitserivi',o:T.b.id,rs:'eka'});link(Q,v3,'e',K3.k,'e');KK.runAction(Q,v3.b.id,C,0);
KK.tMoveRow(Q,T.b.id,true,'r1',1);A.strictEqual(KK.tRows(Q,T.b.id)[1].id,'r1');kulu(Q,5000);A.strictEqual(KK.tRow(Q,T.b.id,'r1').a[cM.id],2,'oikea rivi vaikka järjestys muuttui');

// Lisää rivi → sitten → Aseta kenttä tapahtuman riville (ilman ketjua ja ketjussa). Tunniste säilyy jatkotapahtumissa.
var R=KK.newProject('jatko');var tpR=blk(R,'tapaht',{nm:'Tapahtuma'});var TR=blk(R,'taulu',{nm:'Loki'});var lN=KK.addCol(TR.b,'Teksti','teksti'),lA=KK.addCol(TR.b,'Kerta','luku');
var nap2=blk(R,'nappi',{nm:'Kirjaa',beh:'kerta',v:R.views[0].id});var lis=blk(R,'tee',{do:'lisaarivi',o:TR.b.id,kv:{}});lis.b.kv[lN.id]=KK.kaavaToIds(R,'"Uusi"');
var set=blk(R,'tee',{do:'aseta',o:TR.b.id,sk:lA.id,rl:'tapahtuma',v:{r:kaava(R,'kirjaa').id}});var tun=blk(R,'muisti',{nm:'Tun'});var ts=blk(R,'tee',{do:'aseta',o:tun.b.id,v:{r:kaava(R,'tapahtuma.tunniste').id}});
link(R,nap2,'e',lis,'e');link(R,lis,'e',set,'e');link(R,set,'e',ts,'e');
KK.press(R,nap2.b.id,C);KK.press(R,nap2.b.id,C);var lr=KK.tRows(R,TR.b.id);A.strictEqual(lr.length,2);A.deepStrictEqual(lr.map(function(r){return r.a[lA.id];}),[1,2],'kumpikin painallus omalle rivilleen');
var t1=val(R,tun.b.id);A.ok(/^e/.test(t1));KK.press(R,nap2.b.id,C);A.notStrictEqual(val(R,tun.b.id),t1,'uusi painallus, uusi tunniste');
// ketjussa: Lisää rivi -vaiheen jälkeen haaran tapahtuman rivi on uusi rivi, myös odotuksen yli
var KR=ketju(R,'Kirjausketju',[['tee',{do:'lisaarivi',o:TR.b.id,kv:{}}],['ajastin',{kesto:'2',yks:'s'}],['tee',{do:'aseta',o:TR.b.id,sk:lA.id,rl:'tapahtuma',v:'99'}]]);
KR.s[0].b.kv[lN.id]=KK.kaavaToIds(R,'tapahtuma.lähde');KK.chainStart(R,KR.k.b.id,C);var tk=R.st[KR.k.b.id].tk[0];A.deepStrictEqual(tk.ev.rivi,{rr:TR.b.id,ri:'u4'},'haaran kuori odotuksessa');
kulu(R,2000);var u4=KK.tRow(R,TR.b.id,'u4');A.strictEqual(u4.a[lA.id],99);A.strictEqual(u4.a[lN.id],'Kirjausketju','ketjun ▶: lähde on ketju');

// Aliketju perii tapahtuman; tapahtuman rivin kenttä luetaan nyt (rivi.<sarake>) ja vanha/uusi talteen otettuna
var S=KK.newProject('ali');blk(S,'tapaht',{nm:'Tapahtuma'});var TS=blk(S,'taulu',{nm:'T'});var sN=KK.addCol(TS.b,'Nimi','teksti');var sr=KK.tAddRow(S,TS.b.id,false);KK.tEdit(S,TS.b.id,false,sr,sN.id,'Eka');
var out=blk(S,'muisti',{nm:'Out'});var ALI=ketju(S,'Ali',[['tee',{do:'aseta',o:out.b.id,v:{r:kaava(S,'tapahtuma.rivi.nimi + "/" + tapahtuma.taulukko').id}}]]);
var EMO=ketju(S,'Emo',[['tee',{do:'valitserivi',o:TS.b.id,rs:'eka'}],['ajastin',{kesto:'1',yks:'s'}],['tee',{do:'kaynnista',o:ALI.k.b.id,odota:true}]]);
KK.chainStart(S,EMO.k.b.id,C);var ren=blk(S,'tee',{do:'aseta',o:TS.b.id,sk:sN.id,v:'Muutettu'});KK.runAction(S,ren.b.id,C,0);kulu(S,1000);
A.strictEqual(val(S,out.b.id),'Muutettu/T','aliketju perii rivin; kenttä luetaan nyt');
// Ketjun valmis-tapahtuma kantaa suorituksen tapahtuman
var vo=blk(S,'muisti',{nm:'Valmis'});var va=blk(S,'tee',{do:'aseta',o:vo.b.id,v:{r:kaava(S,'tapahtuma.lähde').id}});link(S,EMO.k,'e',va,'e');
KK.chainStart(S,EMO.k.b.id,C);kulu(S,1000);A.strictEqual(val(S,vo.b.id),'Emo','valmis-tapahtuma: suorituksen tapahtuma');

// Korjaus: rikkinäinen kuori poistetaan, kelvollinen säilyy
var Z=KK.newProject('z');var zk=ketju(Z,'Z',[['ajastin',{kesto:'5',yks:'s'}]]);KK.chainStart(Z,zk.k.b.id,C);var zcs=Z.st[zk.k.b.id];
zcs.tk[0].ev={id:5};zcs.ev.uusi={outo:1};KK.repair(Z);A.ok(zcs.tk[0].ev===undefined);A.ok(zcs.ev&&zcs.ev.uusi===undefined&&typeof zcs.ev.id==='string');
console.log('ok logiikka_48_tapahtuma');
