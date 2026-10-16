// Tietomalli: uusi projekti, osat, korjaus, matriisit, hierarkia, kääntöpiste, vanhemman vaihto, poisto ja järjestys.
var t=require('./apu.js'),AM=t.AM,ok=t.ok,lahella=t.lahella;
var P=AM.uusiProjekti('  Ukko ');
ok(P.nimi==='Ukko'&&P.lava.w===512&&P.lava.h===512&&P.ruutuja===0&&P.silmukka===true,'uusi projekti: nimi, lava 512 × 512, avoin pituus, silmukka');
ok(AM.uusiProjekti('').nimi==='Uusi animaatio','tyhjä nimi');
var kid=AM.lisaaKuva(P,{laji:'png',w:2000,h:1000,nimi:'iso'}),o=AM.uusiOsa(P,kid,'Iso');
lahella(o.perus.koko,0.6*512/2000,1e-4,'iso kuva sovitetaan 60 %:iin lavasta');ok(o.kp[0]===1000&&o.kp[1]===500,'kääntöpiste keskellä');
ok(o.liikkuu==='vapaa'&&o.tas===30&&o.vanhempi===null,'oletukset: vapaa, tasoitus 30, lavalla');
var k2=AM.lisaaKuva(P,{laji:'svg',w:50,h:50}),o2=AM.uusiOsa(P,k2,'');lahella(o2.perus.koko,1,0,'pieni kuva omassa koossaan');ok(o2.nimi==='Osa 2','nimetön osa saa numeron');

// Matriisit
var M=AM.matriisi(100,50,90,2,[10,0]);var p=AM.piste(M,10,0);lahella(p[0],100,1e-9,'kääntöpiste menee kohtaan x');lahella(p[1],50,1e-9,'kääntöpiste menee kohtaan y');
p=AM.piste(M,20,0);lahella(p[0],100,1e-9,'90° myötäpäivään: +x kääntyy alas (x)');lahella(p[1],70,1e-9,'90° myötäpäivään: +x kääntyy alas (y), koko 2');
var Mi=AM.kaanteinen(M),q=AM.piste(Mi,p[0],p[1]);lahella(q[0],20,1e-9,'käänteismatriisi x');lahella(q[1],0,1e-9,'käänteismatriisi y');

// Hierarkia: käsi kiinni vartalossa
var h=t.projekti(),Q=h.P,v=h.v,k=h.k;
k.vanhempi=v.id;k.perus={x:50,y:20,kulma:0,koko:1};
var W=AM.maailma(Q,0);var kw=AM.maailmaksi(Q,k,W);
lahella(kw.x,256,1e-9,'lapsen kääntöpiste vanhemman kuvan kohdassa (50,20) → maailma x');lahella(kw.y,220,1e-9,'… maailma y');
v.perus.kulma=90;W=AM.maailma(Q,0);kw=AM.maailmaksi(Q,k,W);
lahella(kw.x,336,1e-9,'vanhempi kääntyy 90°: lapsi kiertää vanhemman kääntöpisteen ympäri (x)');lahella(kw.y,300,1e-9,'… (y)');lahella(kw.kulma,90,1e-9,'lapsen kulma maailmassa = vanhemman kulma + oma');
v.perus.koko=2;W=AM.maailma(Q,0);kw=AM.maailmaksi(Q,k,W);lahella(kw.koko,2,1e-9,'koko kertautuu');lahella(kw.x,416,1e-9,'vanhemman koko venyttää kiinnityskohdan');
// paikalliseksi on maailmaksi-funktion käänteinen
var back=AM.paikalliseksi(Q,k,W,kw);lahella(back[0],50,1e-9,'paikalliseksi x');lahella(back[1],20,1e-9,'paikalliseksi y');lahella(back[2],0,1e-9,'paikalliseksi kulma');lahella(back[3],1,1e-9,'paikalliseksi koko');
// osuma
ok(!!AM.osuma(Q,v,W,256,300),'osuma kääntöpisteeseen');ok(!AM.osuma(Q,v,W,10,10),'ohi osuma');

// Vanhemman vaihto pitää osan paikallaan joka ruudussa
h=t.projekti();Q=h.P;v=h.v;k=h.k;Q.ruutuja=3;Q.liike[v.id]=[[256,300,0,1],[260,300,30,1],[270,310,60,1.5]];Q.liike[k.id]=[[300,200,10,1],null,[320,210,20,1]];
var ennen=[0,1,2].map(function(f){var W=AM.maailma(Q,f,AM.asennot(Q,true));return AM.maailmaksi(Q,k,W);});
ok(AM.vaihdaVanhempi(Q,k.id,v.id,0),'vanhemman vaihto onnistuu');ok(k.vanhempi===v.id,'vanhempi asetettu');
var jalk=[0,1,2].map(function(f){var W=AM.maailma(Q,f,AM.asennot(Q,true));return AM.maailmaksi(Q,k,W);});
[0,2].forEach(function(f){lahella(jalk[f].x,ennen[f].x,0.02,'ruutu '+f+': x säilyy');lahella(jalk[f].y,ennen[f].y,0.02,'ruutu '+f+': y säilyy');lahella(jalk[f].kulma,ennen[f].kulma,0.02,'ruutu '+f+': kulma säilyy');lahella(jalk[f].koko,ennen[f].koko,1e-3,'ruutu '+f+': koko säilyy');});
ok(Q.liike[k.id][1]===null,'nauhoittamaton ruutu pysyy nauhoittamattomana');
ok(!AM.vaihdaVanhempi(Q,v.id,k.id,0),'kehä estetään: vanhempaa ei voi kiinnittää lapseensa');ok(!AM.vaihdaVanhempi(Q,k.id,k.id,0),'itseensä ei voi kiinnittää');
ok(AM.vaihdaVanhempi(Q,k.id,null,0)&&k.vanhempi===null,'irrotus lavalle');
var irti=AM.maailmaksi(Q,k,AM.maailma(Q,2,AM.asennot(Q,true)));lahella(irti.x,ennen[2].x,0.02,'irrotettu pysyy paikallaan');

// Kääntöpisteen siirto: kuva pysyy paikallaan
h=t.projekti();Q=h.P;v=h.v;v.perus={x:200,y:200,kulma:37,koko:1.3};Q.ruutuja=2;Q.liike[v.id]=[[210,190,10,1],[220,180,50,0.8]];
function kulmat(f){var W=AM.maailma(Q,f,AM.asennot(Q,true));return AM.kulmat(Q,v,W);}
var k0=[0,1].map(kulmat);var perusEnnen=AM.kulmat(Q,v,AM.maailma(AM.korjaa(AM.clone(Object.assign({},Q,{liike:{}}))),0));
AM.asetaKp(Q,v.id,[0,0]);ok(v.kp[0]===0&&v.kp[1]===0,'kääntöpiste vaihtui');
var k1=[0,1].map(kulmat);[0,1].forEach(function(f){for(var i=0;i<4;i++){lahella(k1[f][i][0],k0[f][i][0],0.02,'kuva paikallaan ruudussa '+f+' kulma '+i+' x');lahella(k1[f][i][1],k0[f][i][1],0.02,'… y');}});
var Q2=AM.clone(Q);Q2.liike={};var perusJalk=AM.kulmat(Q2,AM.osa(Q2,v.id),AM.maailma(Q2,0));lahella(perusJalk[2][0],perusEnnen[2][0],0.02,'perusasento pysyy paikallaan');

// siirra: koko liike ja perusasento
h=t.projekti();Q=h.P;v=h.v;Q.ruutuja=2;Q.liike[v.id]=[[10,10,0,1],null];AM.siirra(Q,v.id,{x:5,y:-2,kulma:10,koko:2});
ok(Q.liike[v.id][0][0]===15&&Q.liike[v.id][0][1]===8&&Q.liike[v.id][0][2]===10&&Q.liike[v.id][0][3]===2&&Q.liike[v.id][1]===null,'siirrä: nauhoitettu ruutu siirtyy, tyhjä pysyy tyhjänä');
ok(v.perus.x===261&&v.perus.y===298&&v.perus.kulma===10&&v.perus.koko===2,'siirrä: perusasento siirtyy');

// Poisto: lapsi kiinnittyy poistetun vanhempaan ja pysyy paikallaan
h=t.projekti();Q=h.P;v=h.v;k=h.k;var k3=AM.lisaaKuva(Q,{laji:'svg',w:10,h:10}),s=AM.uusiOsa(Q,k3,'Sormi');
k.vanhempi=v.id;k.perus={x:50,y:20,kulma:30,koko:1};s.vanhempi=k.id;s.perus={x:20,y:120,kulma:10,koko:1};v.perus.kulma=15;
var sEnnen=AM.maailmaksi(Q,s,AM.maailma(Q,0));AM.poistaOsa(Q,k.id,0);
ok(!AM.osa(Q,k.id)&&s.vanhempi===v.id,'poisto: lapsenlapsi kiinnittyy isovanhempaan');var sJalk=AM.maailmaksi(Q,s,AM.maailma(Q,0));lahella(sJalk.x,sEnnen.x,0.02,'poisto: lapsi paikallaan x');lahella(sJalk.kulma,sEnnen.kulma,0.02,'poisto: kulma säilyy');
ok(!Q.kuvat[k.kuva],'poistetun osan kuva siivotaan');

// Järjestys
h=t.projekti();Q=h.P;var a=AM.uusiOsa(Q,Q.osat[0].kuva,'C');ok(Q.osat.map(function(o){return o.nimi;}).join()==='Vartalo,Käsi,C','uusi osa eteen');
AM.siirraJarjestys(Q,a.id,'taakse');ok(Q.osat[0].id===a.id,'vie taakse');AM.siirraJarjestys(Q,a.id,'eteen');ok(Q.osat[2].id===a.id,'tuo eteen');ok(!AM.siirraJarjestys(Q,a.id,'eteen'),'jo edessä');

// Kuvan vaihto skaalaa kääntöpisteen ja lasten kiinnityksen
h=t.projekti();Q=h.P;v=h.v;k=h.k;k.vanhempi=v.id;k.perus={x:50,y:20,kulma:0,koko:1};var uk=AM.lisaaKuva(Q,{laji:'png',w:200,h:400});AM.vaihdaKuva(Q,v.id,uk);
ok(v.kuva===uk&&v.kp[0]===100&&v.kp[1]===200,'vaihda kuva: kääntöpiste skaalautuu');ok(k.perus.x===100&&k.perus.y===40,'vaihda kuva: lapsen kiinnitys skaalautuu');

// Korjaus: rikkinäinen tieto
var R=AM.korjaa({nimi:'',lava:{w:'abc',h:99999,tausta:'pinkki'},ruutuja:-5,silmukka:false,kuvat:{a:{laji:'bmp',w:-3,h:'40'},b:null},
  osat:[null,{id:'x',kuva:'a',vanhempi:'y',kp:'z',perus:{koko:-1}},{id:'y',kuva:'a',vanhempi:'x'},{id:'x',kuva:'puuttuu'}],liike:{x:[[1,2,3,4],[1,2,'a',4],null,[1,2,3,0]],eiOle:[[1,1,1,1]]},roska:1});
ok(R.nimi==='Animaatio'&&R.lava.w===512&&R.lava.h===4096&&R.lava.tausta==='valkoinen','korjaus: nimi ja lava');ok(R.silmukka===false,'silmukka false säilyy');
ok(R.kuvat.a.laji==='png'&&R.kuvat.a.w===1&&R.kuvat.a.h===40&&!R.kuvat.b,'korjaus: kuvat');
ok(R.osat.length===3&&R.osat[2].id!=='x','korjaus: tuplatunniste saa uuden');
var vx=AM.osa(R,'x'),vy=AM.osa(R,'y');ok(!(vx.vanhempi==='y'&&vy.vanhempi==='x'),'korjaus: kehä katkaistaan');
ok(vx.perus.koko===1&&vx.kp.length===2,'korjaus: koko ja kääntöpiste');
ok(R.liike.x.length===4&&R.liike.x[0].join()==='1,2,3,4'&&R.liike.x[1]===null&&R.liike.x[3]===null&&!R.liike.eiOle,'korjaus: rikkinäiset ruudut tyhjiksi, tuntematon osa pois');
ok(R.ruutuja===4,'korjaus: pituus nauhoituksesta, kun pituus puuttuu');ok(!('roska' in R),'korjaus: tuntemattomat kentät pois');
ok(AM.korjaa(null).osat.length===0,'korjaus: null');
var D=AM.korjaaData({projektit:[{id:'a1',nimi:'A'},{id:'a1',nimi:'B'},'x'],cur:'eiole',cfg:{tila:'animoi',haamu:false}});
ok(D.projektit.length===2&&D.projektit[0].id!==D.projektit[1].id,'korjaaData: tuplatunniste');ok(D.cur===D.projektit[0].id,'korjaaData: nykyinen');ok(D.cfg.tila==='animoi'&&D.cfg.haamu===false&&D.cfg.laskuri===true,'korjaaData: asetukset');
ok(AM.korjaaData(null).projektit.length===0&&AM.korjaaData(null).cur===null,'korjaaData: tyhjä');
t.loppu('logiikka_01_malli');
