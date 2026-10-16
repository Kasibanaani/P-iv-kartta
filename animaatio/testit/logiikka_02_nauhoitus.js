// Nauhoitus: näytteet → 24 ruutua sekunnissa, moniraita (vain kosketetut ruudut ja osat muuttuvat), täyttö, tasoitus ja pituus.
var t=require('./apu.js'),AM=t.AM,ok=t.ok,lahella=t.lahella;
ok(AM.FPS===24,'24 kuvaa sekunnissa');
// 2 sekunnin ele 60 näytettä sekunnissa (kuten selaimen ruudunpäivitys): x kulkee 0 → 240 tasaisesti
var nay=[];for(var i=0;i<=120;i++){var ts=i/60;nay.push({t:ts,x:ts*120,y:5,kulma:ts*45,koko:1});}
var seg=AM.ruuduiksi(nay);ok(seg.alku===0&&seg.ruudut.length===49,'2 s → ruudut 0…48 (49 kpl, viimeinen hetkellä 2,0 s): '+seg.ruudut.length);
lahella(seg.ruudut[24][0],120,1e-6,'ruutu 24 = 1 s → x 120');lahella(seg.ruudut[12][2],22.5,1e-6,'kulma välitetään');lahella(seg.ruudut[48][0],240,1e-6,'viimeinen ruutu');
// Epätasaiset näytteet: lineaarinen välitys
seg=AM.ruuduiksi([{t:0.01,x:0,y:0,kulma:0,koko:1},{t:0.2,x:100,y:0,kulma:0,koko:2}]);
ok(seg.alku===1&&seg.ruudut.length===4,'alku pyöristyy ylöspäin seuraavaan ruutuun (ruudut 1–4)');lahella(seg.ruudut[0][0],(1/24-0.01)/0.19*100,0.01,'välitys ruudussa 1');lahella(seg.ruudut[3][3],1+(4/24-0.01)/0.19,1e-3,'koko välitetään');
// Lyhyt kosketus kirjoittaa lähimmän ruudun
seg=AM.ruuduiksi([{t:0.30,x:7,y:8,kulma:9,koko:1}]);ok(seg.alku===7&&seg.ruudut.length===1&&seg.ruudut[0][0]===7,'napautus → lähin ruutu 7');
seg=AM.ruuduiksi([{t:0.0,x:1,y:1,kulma:0,koko:1},{t:0.01,x:2,y:2,kulma:0,koko:1}]);ok(seg.alku===0&&seg.ruudut.length===1,'alle ruudun mittainen kosketus');
ok(AM.ruuduiksi([]).ruudut.length===0,'tyhjä');
// Moniraita: yhdistä kirjoittaa vain kosketetut ruudut
var h=t.projekti(),P=h.P,v=h.v,k=h.k;P.ruutuja=10;P.liike[v.id]=[[1,1,1,1],[2,2,2,1],[3,3,3,1],null,null,null,null,null,null,[10,10,10,1]];
var vanhaK=null;AM.yhdista(P,v.id,{alku:2,ruudut:[[30,30,30,1],[40,40,40,1]]});
ok(P.liike[v.id][1][0]===2&&P.liike[v.id][2][0]===30&&P.liike[v.id][3][0]===40&&P.liike[v.id][9][0]===10&&P.liike[v.id][4]===null,'vain ruudut 2–3 muuttuivat');
ok(P.liike[k.id]===vanhaK||P.liike[k.id]===undefined,'toinen osa ei muuttunut');
AM.yhdista(P,v.id,{alku:8,ruudut:[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]]});ok(P.liike[v.id].length===10,'yli pituuden menevät ruudut jäävät pois');
// Täyttö: edellinen nauhoitettu, ennen ensimmäistä ensimmäinen, nauhoittamaton osa perusasennossa
P.liike[v.id]=[null,null,[5,5,5,1],null,[7,7,7,1],null,null,null,null,null];
var tt=AM.taytetty(P,v);ok(tt[0][0]===5&&tt[1][0]===5,'ennen ensimmäistä: ensimmäinen arvo');ok(tt[3][0]===5&&tt[5][0]===7&&tt[9][0]===7,'nauhoituksen jälkeen: viimeisin arvo pysyy');
var tk=AM.taytetty(P,k);ok(tk.every(function(x){return x[0]===k.perus.x&&x[2]===k.perus.kulma;}),'nauhoittamaton osa: perusasento');
// Tasoitus: tärinä vähenee, tasainen liike ja vakio säilyvät
var N=60,rnd=1;function r(){rnd=(rnd*16807)%2147483647;return rnd/2147483647-0.5;}
var tar=[];for(i=0;i<N;i++)tar.push([i*2+r()*6,100,i+r()*4,1]);
var tas=AM.tasoita(tar,50);function hajonta(a,j,f){var s=0;for(var i=5;i<N-5;i++){var e=a[i][j]-f(i);s+=e*e;}return Math.sqrt(s/(N-10));}
ok(hajonta(tas,0,function(i){return i*2;})<hajonta(tar,0,function(i){return i*2;})*0.5,'tasoitus 50 puolittaa käden tärinän');
var vak=[];for(i=0;i<20;i++)vak.push([3,4,5,1.5]);ok(AM.tasoita(vak,100).every(function(x){return Math.abs(x[0]-3)<1e-9&&Math.abs(x[3]-1.5)<1e-9;}),'vakio pysyy vakiona');
var lin=[];for(i=0;i<20;i++)lin.push([i,0,0,1]);var tl=AM.tasoita(lin,40);lahella(tl[10][0],10,1e-9,'tasainen liike säilyy keskellä');
ok(AM.tasoita(tar,0)===tar,'tasoitus 0 = raaka');
// Tasoitus ei koske raakaa nauhoitusta
h=t.projekti();P=h.P;v=h.v;P.ruutuja=N;P.liike[v.id]=tar.map(function(x){return x.slice();});v.tas=80;var A=AM.asennot(P),A0=AM.asennot(P,true);
ok(A[v.id][10][0]!==P.liike[v.id][10][0]&&A0[v.id][10][0]===P.liike[v.id][10][0],'asennot tasoitettu, raaka säilyy');
// Kulma on jatkuva: kierros 350° → 370° ei hyppää
var kier=[];for(i=0;i<10;i++)kier.push([0,0,350+i*4,1]);var kt=AM.tasoita(kier,60);ok(kt.every(function(x,i){return i===0||x[2]>kt[i-1][2];}),'kulma kasvaa yli 360° ilman hyppyä');
ok(Math.abs(AM.kulmaEro(10,350)-20)<1e-9&&Math.abs(AM.kulmaEro(350,10)+20)<1e-9,'kulmaero kiertää lyhintä tietä');
// Pituus
h=t.projekti();P=h.P;v=h.v;P.ruutuja=10;P.liike[v.id]=[[1,1,1,1],null,null,null,null,null,null,null,null,[9,9,9,1]];AM.asetaPituus(P,5);
ok(P.ruutuja===5&&P.liike[v.id].length===5,'lyhennys katkaisee');AM.asetaPituus(P,20);ok(P.ruutuja===20&&AM.taytetty(P,v)[19][0]===1,'pidennys: viimeinen arvo jatkuu');
AM.asetaPituus(P,999999);ok(P.ruutuja===AM.MAXS*24,'pituus enintään '+AM.MAXS+' s');
ok(AM.nauhoitettuja(P,v.id)===1&&AM.onLiike(P,v.id)&&!AM.onLiike(P,h.k.id),'nauhoitettujen ruutujen määrä');
AM.tyhjennaLiike(P,v.id);ok(!AM.onLiike(P,v.id),'tyhjennys');
// Lapsi seuraa vanhemman nauhoitusta, vaikka lasta ei ole nauhoitettu
h=t.projekti();P=h.P;v=h.v;k=h.k;k.vanhempi=v.id;k.perus={x:50,y:0,kulma:0,koko:1};P.ruutuja=2;P.liike[v.id]=[[256,300,0,1],[256,300,90,1]];v.tas=0;
var W1=AM.maailma(P,1),kw=AM.maailmaksi(P,k,W1);lahella(kw.x,356,1e-6,'lapsi seuraa vanhemman kiertoa (x)');lahella(kw.y,300,1e-6,'(y)');
// yli: sormen alla oleva asento korvaa nauhoituksen
var W2=AM.maailma(P,1,null,(function(){var y={};y[v.id]=[256,300,0,1];return y;})());lahella(AM.maailmaksi(P,k,W2).x,256,1e-6,'korvaava asento vaikuttaa myös lapseen');
t.loppu('logiikka_02_nauhoitus');
