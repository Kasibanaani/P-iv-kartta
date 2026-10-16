// Vienti ja tuonti (MUOTO.md): animaatiotiedosto, Appi-appin laatikot, sprite sheetin asettelu ja tiedot.
var t=require('./apu.js'),AM=t.AM,ok=t.ok,lahella=t.lahella;
var h=t.projekti(),P=h.P,v=h.v,k=h.k;k.vanhempi=v.id;k.liikkuu='nivel';k.perus={x:50,y:20,kulma:0,koko:1};P.ruutuja=48;v.tas=0;k.tas=0;
var lv=[],lk=[];for(var f=0;f<48;f++){lv.push(f%2?null:[256+f,300,f*2,AM.pyor(1+f/100,4)]);lk.push(f<24?[50,20,f*3,1]:null);}P.liike[v.id]=lv;P.liike[k.id]=lk;
var data={};data[v.kuva]='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"/>';data[k.kuva]='data:image/png;base64,AAAA';
var o=AM.vienti(P,data);
ok(o.muoto==='animappi'&&o.ver===1&&o.fps===24&&o.ruutuja===48&&o.kesto===2&&o.silmukka===true,'otsikkotiedot');
ok(o.lava.w===512&&o.lava.h===512,'lava');ok(Object.keys(o.kuvat).length===2&&o.kuvat[v.kuva].data===data[v.kuva]&&o.kuvat[k.kuva].laji==='png'&&o.kuvat[k.kuva].w===40,'kuvat datoineen');
ok(o.osat.length===2&&o.osat[0].z===0&&o.osat[1].vanhempi===v.id&&o.osat[1].kp.join()==='20,10'&&o.osat[1].liikkuu==='nivel','osat: järjestys, vanhempi, kääntöpiste');
['x','y','kulma','koko'].forEach(function(c){ok(o.liike[v.id][c].length===48&&o.liike[k.id][c].length===48,'liike.'+c+' joka ruudussa');});
ok(o.liike[v.id].x[1]===256,'täytetty: nauhoittamaton ruutu saa edellisen arvon');ok(o.liike[k.id].kulma[30]===69,'nauhoituksen jälkeen viimeinen arvo');
ok(o.raaka[v.id][1]===null&&o.raaka[v.id][2][0]===258,'raaka nauhoitus mukana (tyhjät ruudut null)');
// Laatikot: Appi-appin Kuva-palikka (vasen yläkulma, leveys, korkeus, kierto keskipisteen ympäri) = sama kuva
for(f=0;f<48;f+=7){var W=AM.maailma(P,f,AM.asennot(P));[v,k].forEach(function(os){var b={x:o.laatikot[os.id].x[f],y:o.laatikot[os.id].y[f],w:o.laatikot[os.id].w[f],h:o.laatikot[os.id].h[f],kulma:o.laatikot[os.id].kulma[f]};
  var cx=b.x+b.w/2,cy=b.y+b.h/2,r=b.kulma*Math.PI/180,c=Math.cos(r),s=Math.sin(r);function rot(x,y){var dx=x-cx,dy=y-cy;return [cx+c*dx-s*dy,cy+s*dx+c*dy];}
  var odot=AM.kulmat(P,os,W),saatu=[rot(b.x,b.y),rot(b.x+b.w,b.y),rot(b.x+b.w,b.y+b.h),rot(b.x,b.y+b.h)];
  for(var i=0;i<4;i++){lahella(saatu[i][0],odot[i][0],0.05,'laatikko '+os.nimi+' ruutu '+f+' kulma '+i+' x');lahella(saatu[i][1],odot[i][1],0.05,'… y');}});}
// Tuonti: sama animaatio takaisin
var r=AM.tuonti(JSON.stringify(o));ok(!r.virhe,'tuonti onnistuu');var Q=r.P;
ok(Q.nimi===P.nimi&&Q.ruutuja===48&&Q.osat.length===2&&Q.id!==P.id,'tuonti: nimi, pituus, osat, uusi tunniste');
ok(Q.osat[0].kuva!==v.kuva&&Q.kuvat[Q.osat[0].kuva].w===100&&r.data[Q.osat[0].kuva]===data[v.kuva],'tuonti: kuvat uusilla tunnisteilla, data mukana');
ok(JSON.stringify(Q.liike[v.id])===JSON.stringify(P.liike[v.id])&&JSON.stringify(Q.liike[k.id])===JSON.stringify(P.liike[k.id]),'tuonti: raaka nauhoitus sellaisenaan');
ok(Q.osat[1].vanhempi===v.id&&Q.osat[1].liikkuu==='nivel'&&Q.osat[1].tas===0,'tuonti: vanhempi, liikkuu, tasoitus');
var o2=AM.vienti(Q,r.data);ok(JSON.stringify(o2.liike)===JSON.stringify(o.liike)&&JSON.stringify(o2.laatikot)===JSON.stringify(o.laatikot),'vienti → tuonti → vienti: liike ja laatikot samat');
// Tiedosto ilman raakaa (esim. tekoälyn tekemä): liike luetaan nauhoitukseksi
var ilman=JSON.parse(JSON.stringify(o));delete ilman.raaka;r=AM.tuonti(ilman);ok(!r.virhe&&r.P.liike[v.id].length===48&&r.P.liike[v.id][1][0]===256,'ilman raakaa: liike → nauhoitus');
// z-järjestys
var z=JSON.parse(JSON.stringify(o));z.osat.reverse();r=AM.tuonti(z);ok(r.P.osat[0].id===v.id,'osat järjestetään z:n mukaan');
// Virheet
ok(AM.tuonti('{rikki').virhe&&AM.tuonti({muoto:'muu'}).virhe&&AM.tuonti(null).virhe,'virheellinen tiedosto');
var uudempi=JSON.parse(JSON.stringify(o));uudempi.ver=99;ok(!!AM.tuonti(uudempi).varoitus,'uudemman version varoitus');
// Tyhjä animaatio: yksi ruutu
var E=AM.uusiProjekti('Tyhjä');var oe=AM.vienti(E,{});ok(oe.ruutuja===1&&oe.osat.length===0,'tyhjä animaatio');ok(AM.tuonti(oe).P.ruutuja===0,'tyhjän tuonti: pituus avoin');
// Sprite sheetin asettelu
var L=AM.arkki(48,256,256);ok(L&&L.sarakkeet*L.rivit>=48&&L.W<=4096&&L.H<=4096&&L.mittakaava===1&&L.w===256,'48 × 256 px mahtuu sellaisenaan: '+JSON.stringify(L));
ok(Math.abs(L.W-L.H)<=256*2,'arkki on lähes neliö');
L=AM.arkki(1440,512,512);ok(L&&L.W<=4096&&L.H<=4096&&L.W*L.H<=16777216&&L.mittakaava<1&&L.sarakkeet*L.rivit>=1440,'60 s × 512 px pienennetään rajaan: '+JSON.stringify(L));
L=AM.arkki(1,5000,100);ok(L&&L.w<=4096,'yksi leveä ruutu pienennetään');ok(AM.arkki(3,10,10).sarakkeet===2,'pieni määrä: 2 saraketta');
var info=AM.arkkiTiedot(P,{sarakkeet:7,rivit:7,w:100,h:50,W:700,H:350},{x:-10,y:20,w:200,h:100},0.5,'a.png');
ok(info.muoto==='animappi-sprite'&&info.ruudut.length===48&&info.ruudut[8].x===100&&info.ruudut[8].y===50&&info.ruutu.w===100&&info.kuva==='a.png','sprite-tiedot: ruutujen paikat');
ok(info.lavanAlku[0]===5&&info.lavanAlku[1]===-10&&info.mittakaava===0.5,'lavan origo ruudussa');
// Rajat
var R=AM.rajat(P);ok(R.w>0&&R.h>0&&R.x<256&&R.y<300,'osien alue: '+JSON.stringify(R));
t.loppu('logiikka_03_vienti');
