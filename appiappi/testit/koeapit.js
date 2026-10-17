// Koeapit C (kohdelista määrineen) ja B (kysymysappi), suunnitelma 07-toteutuspolku.md. Rakennetaan nykyisillä
// palikoilla moottorin funktioilla, jotta projekti on aina nykyistä muotoa. Testi: logiikka_57_koeapit.js.
// Projektitiedostot Emilin käyttöön: node koeapit.js <kansio> (kirjoittaa pkoeappic.json ja pkoeappib.json).
// Sisältö on keksittyä esimerkkiaineistoa, ei henkilökohtaista tietoa.
var KK=require('./moottori.js');

function mk(P){
  var tpl=[];
  function blk(k,props,x,y,g){var b=KK.addBlock(P,k,props||{});var n=KK.addNode(P,b.id,x||0,y||0,g);return {b:b,n:n};}
  function lg(k,props,x,y,g){return blk(k,props,x,y,g&&g.n?g.n.id:g);}
  function kaava(f,x,y,g){var k=lg('kaava',{},x,y,g);k.b.f=KK.kaavaToIds(P,f);return k;}
  function link(a,ap,b,bp){var l=KK.addLink(P,a.n.id,ap,b.n.id,bp);if(!l)throw new Error('nuoli '+a.b.nm+'.'+ap+' → '+b.b.nm+'.'+bp);return l;}
  function ui(k,props,v,x,y,w,h){var p=props||{};p.v=v;var b=KK.addBlock(P,k,p);b.x=x;b.y=y;if(w)b.w=w;if(h)b.h=h;if(typeof b.tx==='string'&&b.tx.indexOf('{')>=0)tpl.push(b);
    var n=KK.addNode(P,b.id,0,0);return {b:b,n:n};}
  function taulu(nm,cols,x,y){var t=lg('taulu',{nm:nm},x,y);var c={};cols.forEach(function(s){c[s[0]]=KK.addCol(t.b,s[0],s[1],s[2]);});return {b:t.b,n:t.n,c:c};}
  function rivi(T,vals){var rid=KK.tAddRow(P,T.b.id,false);Object.keys(vals).forEach(function(k){var r=KK.tEdit(P,T.b.id,false,rid,T.c[k].id,vals[k]);if(KK.isErr(r))throw new Error(k+': '+r.err);});return rid;}
  /* Ketju: vaiheet allekkain, jokainen edellisen sitten-tapahtumasta. */
  function ketju(nm,props,x,y,steps){var k=lg('ketju',Object.assign({nm:nm},props||{}),x,y);var prev=null,yy=y+50,out=[];
    steps.forEach(function(s){var st=lg(s[0],s[1],x+20,yy,k);yy+=70;if(prev)link(prev,s[2]||'e',st,'e');prev=st;out.push(st);});
    k.n.h=Math.max(200,yy-y+20);k.n.w=380;return {k:k,s:out};}
  /* Tekstien viitteet muunnetaan lopuksi, kun kaikki palikat ovat olemassa. */
  function valmis(){tpl.forEach(function(b){b.tx=KK.toIds(P,b.tx);});KK.repair(P);return P;}
  return {valmis:valmis,blk:blk,lg:lg,kaava:kaava,link:link,ui:ui,taulu:taulu,rivi:rivi,ketju:ketju};
}

/* ---------- C. Kohdelista määrineen: yksi kortti 100 riville ---------- */
var NIMET=('Omena Banaani Appelsiini Päärynä Luumu Kiivi Ananas Mango Sitruuna Lime Viinirypäle Mustikka Puolukka Mansikka Vadelma '+
  'Porkkana Peruna Sipuli Valkosipuli Kurkku Tomaatti Paprika Kesäkurpitsa Parsakaali Kukkakaali Pinaatti Salaatti Selleri Lanttu Punajuuri '+
  'Maito Piimä Jogurtti Rahka Juusto Voi Kerma Kananmuna Kaurahiutale Riisi Pasta Ohrasuurimo Jauhot Sokeri Suola Pippuri Kaneli Kardemumma '+
  'Kahvi Tee Kaakao Hunaja Hillo Ketsuppi Sinappi Majoneesi Öljy Etikka Leipä Näkkileipä Korppu Keksi Pulla Sämpylä Tortilla '+
  'Tiskiaine Pyykkijauhe Saippua Shampoo Hammastahna Hammasharja Wc-paperi Talouspaperi Roskapussi Folio Leivinpaperi Pakastepussi '+
  'Kynttilä Tulitikut Paristo Lamppu Teippi Kynä Vihko Nuppineula Kuminauha Sakset Liima Narua Ruuvi Naula Kiinnike Jatkojohto '+
  'Laastari Sideharso Kuumemittari Aurinkorasva Huulirasva Kuulokkeet Avaimenperä').split(' ');

function koeappiC(){
  var P=KK.newProject('Koeappi C: kohdelista');P.id='pkoeappic';
  P.views=[{id:'v1',n:'Lista',laite:'puhelin'},{id:'v2',n:'Toinen näkymä',laite:'puhelin'}];P.vseq=2;
  var M=mk(P),lg=M.lg,ui=M.ui,link=M.link,kaava=M.kaava;
  // Tieto: taulukko, käsiteltävä rivi, näkyvien rivien joukko
  var T=M.taulu('Kohteet',[['Nimi','teksti'],['Määrä','luku']],40,40);
  var seed=7;function rnd(n){seed=(seed*16807)%2147483647;return seed%n;}
  NIMET.slice(0,100).forEach(function(nm,i){var v={'Nimi':nm};if(i%9!==4)v['Määrä']=String(rnd(5)===0?0:rnd(12));M.rivi(T,v);});
  lg('trivi',{nm:'Kohde',tt:T.b.id,ls:'kas'},40,140);
  // Näkymä 1: lista
  ui('nayta',{nm:'Otsikko',tx:'Kohteet',koko:'l'},'v1',16,16,358,40);
  ui('nayta',{nm:'Yhteenveto',tx:'{Näkyvät.rivejä} näkyvissä · yhteensä {Kohteet.määrä.summa} kpl',koko:'s'},'v1',16,56,358,26);
  var jarj=ui('kytkin',{nm:'Eniten ensin',tx:'Eniten ensin'},'v1',16,88,172,44);
  var piil=ui('kytkin',{nm:'Piilota nollat',tx:'Piilota nollat'},'v1',198,88,176,44);
  var TS=ui('toistin',{nm:'Kortit',tsu:'sarake',kh:56,vali:6},'v1',16,142,358,520);
  var bg1=ui('muoto',{nm:'Kortin tausta',laji:'laatikko',tx:'',z:-1},'v1',16,142,358,56);
  ui('nayta',{nm:'Kortin nimi',tx:'{Kohde.nimi}',koko:'m'},'v1',26,150,150,40);
  var miinus=ui('nappi',{nm:'Miinus',tx:'−',beh:'kerta'},'v1',186,148,48,44);
  var maara=ui('nayta',{nm:'Kortin määrä',tx:'{Kohde.määrä}',koko:'l',tas:'center'},'v1',238,148,80,44);
  var plus=ui('nappi',{nm:'Plus',tx:'+',beh:'kerta'},'v1',322,148,48,44);
  KK.tstAssign(P,[bg1.b.id,P.b[Object.keys(P.b).filter(function(i){return P.b[i].nm==='Kortin nimi';})[0]].id,miinus.b.id,maara.b.id,plus.b.id]);
  var uusi=ui('teksti',{nm:'Uusi kohde',tx:'Uusi kohde',ph:'esim. Kaurajuoma'},'v1',16,672,250,84);
  var lisaaNappi=ui('nappi',{nm:'Lisää kohde',tx:'Lisää',beh:'kerta'},'v1',276,704,98,48);
  var toNakyma=ui('nappi',{nm:'Toiseen näkymään',tx:'Toinen näkymä →',beh:'kerta'},'v1',16,770,358,48);
  // Näkymä 2: sama rivi toisessa toistimessa; määrä yhteinen, rasti oma
  ui('nayta',{nm:'Otsikko 2',tx:'Sama tieto, eri näkymä',koko:'l'},'v2',16,16,358,40);
  ui('nayta',{nm:'Ohje 2',tx:'Määrä on yhteinen listan kanssa. Rasti on vain tämän näkymän oma.',koko:'s'},'v2',16,56,358,44);
  var TS2=ui('toistin',{nm:'Ruudukko',tsu:'ruudukko',kw:175,kh:96,vali:8},'v2',16,108,358,640);
  var bg2=ui('muoto',{nm:'Ruudun tausta',laji:'laatikko',tx:'',z:-1},'v2',16,108,175,96);
  var n2=ui('nayta',{nm:'Ruudun nimi',tx:'{Kohde.nimi}',koko:'s'},'v2',24,112,160,28);
  var m2=ui('nayta',{nm:'Ruudun määrä',tx:'{Kohde.määrä} kpl',koko:'l'},'v2',24,142,100,44);
  var r2=ui('ruutu',{nm:'Tarkistettu',tx:'✓'},'v2',128,146,56,40);
  KK.tstAssign(P,[bg2.b.id,n2.b.id,m2.b.id,r2.b.id]);
  var takaisin=ui('nappi',{nm:'Takaisin listaan',tx:'← Lista',beh:'kerta'},'v2',16,770,358,48);
  // Logiikka: suodatus ja järjestys käyttäjän valinnoista (VALITSE riveittäin)
  var J=lg('joukko',{nm:'Näkyvät'},420,40);link(T,'rj',J,'rv');link(J,'rj',TS,'rv');link(T,'rj',TS2,'rv');
  var su=lg('valitse',{nm:'Suodatus'},420,200);link(piil,'v',su,'c');link(kaava('kohde.määrä > 0',200,200),'v',su,'a');link(kaava('1 == 1',200,260),'v',su,'b');link(su,'v',J,'c');
  var ja=lg('valitse',{nm:'Järjestys'},420,340);link(jarj,'v',ja,'c');link(kaava('0 - kohde.määrä',200,340),'v',ja,'a');link(kaava('kohde.nimi',200,400),'v',ja,'b');link(ja,'v',J,'j');
  // Kortin painikkeet: plus lisää, miinus vähentää vain nollaan asti (Ehto ketjussa)
  var lis=lg('tee',{nm:'Lisää yksi',do:'lisaa',o:T.b.id,sk:T.c['Määrä'].id,rl:'tapahtuma',v:'1'},700,40);link(plus,'e',lis,'e');
  var V=M.ketju('Vähennä',{},700,140,[['haara',{nm:'Onko jäljellä'}],['tee',{nm:'Vähennä yksi',do:'lisaa',o:T.b.id,sk:T.c['Määrä'].id,rl:'tapahtuma',v:'-1'}]]);
  link(miinus,'e',V.k,'e');link(kaava('kohde.määrä > 0',560,190),'v',V.s[0],'c');
  // Uusi kohde: rivi ilman uutta logiikkaa, saa kortin itsestään
  var U=M.ketju('Uusi kohde',{},700,380,[['haara',{nm:'Onko nimi'}],['tee',{nm:'Lisää rivi',do:'lisaarivi',o:T.b.id,kv:{}}],['tee',{nm:'Tyhjennä kenttä',do:'tyhjenna',o:uusi.b.id}]]);
  U.s[1].b.kv[T.c['Nimi'].id]=KK.kaavaToIds(P,'uusikohde');U.s[1].b.kv[T.c['Määrä'].id]='0';
  link(lisaaNappi,'e',U.k,'e');link(kaava('uusikohde != tyhjä',560,430),'v',U.s[0],'c');
  var g1=lg('tee',{nm:'Siirry toiseen',do:'siirry',vw:'v2'},700,700);link(toNakyma,'e',g1,'e');
  var g2=lg('tee',{nm:'Siirry listaan',do:'siirry',vw:'v1'},700,780);link(takaisin,'e',g2,'e');
  return M.valmis();
}

/* ---------- B. Kysymysappi: sisältö taulukossa, vastaukset historiaan ---------- */
var KYS=[
  ['k1','Mikä on Suomen pääkaupunki?','Turku','Helsinki','Tampere','B'],
  ['k2','Montako päivää on karkausvuodessa?','365','366','364','B'],
  ['k3','Mikä planeetta on lähimpänä Aurinkoa?','Merkurius','Venus','Mars','A'],
  ['k4','Paljonko on 7 × 8?','54','56','64','B'],
  ['k5','Missä lämpötilassa vesi kiehuu merenpinnan tasolla?','90 °C','100 °C','110 °C','B'],
  ['k6','Mikä on Suomen suurin järvi?','Päijänne','Inarijärvi','Saimaa','C'],
  ['k7','Montako jalkaa hämähäkillä on?','6','8','10','B'],
  ['k8','Mikä kuukausi on vuoden lyhin?','Helmikuu','Huhtikuu','Marraskuu','A']
];
function koeappiB(){
  var P=KK.newProject('Koeappi B: kysymykset');P.id='pkoeappib';
  P.views=[{id:'v1',n:'Kysymys',laite:'puhelin'},{id:'v2',n:'Tilasto',laite:'puhelin'}];P.vseq=2;
  var M=mk(P),lg=M.lg,ui=M.ui,link=M.link,kaava=M.kaava;
  // Sisältö (lähtöaineisto) ja käyttötieto (vastaukset) erikseen
  var T=M.taulu('Kysymykset',[['Tunniste','teksti'],['Kysymys','teksti'],['A','teksti'],['B','teksti'],['C','teksti'],['Oikea','valinta',{val:['A','B','C']}]],40,40);
  KYS.forEach(function(q){M.rivi(T,{'Tunniste':q[0],'Kysymys':q[1],'A':q[2],'B':q[3],'C':q[4],'Oikea':q[5]});});
  var H=M.taulu('Vastaukset',[['Kysymys','viite',{tt:T.b.id}],['Tunniste','teksti'],['Vastaus','valinta',{val:['A','B','C']}],['Oikein','kylla'],['Aika','aika']],40,200);
  lg('trivi',{nm:'Kysymys',vt:'kysymys',tt:T.b.id,ls:'val'},40,360);
  lg('trivi',{nm:'Tilaston kysymys',vt:'k',tt:T.b.id,ls:'kas'},40,420);
  lg('trivi',{nm:'Vastaus',vt:'vastaus',tt:H.b.id,ls:'kas'},40,480);
  var valinta=lg('muisti',{nm:'Valinta',v:''},40,560);
  // Näkymä 1: valittu kysymys
  ui('nayta',{nm:'Otsikko',tx:'Kysymys {Kysymykset.valittunro} / {Kysymykset.rivejä}',koko:'s'},'v1',16,16,358,26);
  ui('nayta',{nm:'Kysymysteksti',tx:'{Kysymys.kysymys}',koko:'l'},'v1',16,48,358,110);
  var nA=ui('nappi',{nm:'Vastaus A',tx:'A: {Kysymys.a}',beh:'kerta'},'v1',16,170,358,56);
  var nB=ui('nappi',{nm:'Vastaus B',tx:'B: {Kysymys.b}',beh:'kerta'},'v1',16,236,358,56);
  var nC=ui('nappi',{nm:'Vastaus C',tx:'C: {Kysymys.c}',beh:'kerta'},'v1',16,302,358,56);
  var pal=ui('nayta',{nm:'Palaute',tx:'{Palauteteksti}',koko:'m'},'v1',16,376,358,56);
  var pis=ui('nayta',{nm:'Pisteet',tx:'Oikein {Oikeita} / {Vastaukset.rivejä} · {Osuus} %',koko:'s'},'v1',16,436,358,26);
  var alku=ui('nappi',{nm:'Alusta',tx:'Ensimmäiseen kysymykseen',beh:'kerta'},'v1',16,700,358,48);
  var toTil=ui('nappi',{nm:'Tilastoon',tx:'Tilasto →',beh:'kerta'},'v1',16,760,358,48);
  // Vastaus: Valinta = A/B/C, sitten ketju. Ketju on lukittu kaikilta muutoksilta (tila 2): se valitsee ensin seuraavan
  // kysymyksen, mutta kirjaa vastauksen silti siihen kysymykseen, joka oli näkyvissä painettaessa.
  var K=M.ketju('Vastaa',{lk:2},700,40,[['tee',{nm:'Seuraava kysymys',do:'valitserivi',o:T.b.id,rs:'seur',kierto:true}],['tee',{nm:'Kirjaa vastaus',do:'lisaarivi',o:H.b.id,kv:{}}]]);
  var kv=K.s[1].b.kv;kv[H.c['Kysymys'].id]=KK.kaavaToIds(P,'kysymys');kv[H.c['Tunniste'].id]=KK.kaavaToIds(P,'kysymys.tunniste');kv[H.c['Vastaus'].id]=KK.kaavaToIds(P,'valinta');
  kv[H.c['Oikein'].id]=KK.kaavaToIds(P,'valinta == kysymys.oikea');kv[H.c['Aika'].id]='nyt';
  [[nA,'A'],[nB,'B'],[nC,'C']].forEach(function(x,i){var a=lg('tee',{nm:'Valitse '+x[1],do:'aseta',o:valinta.b.id,v:x[1]},400,40+i*80);link(x[0],'e',a,'e');link(a,'e',K.k,'e');});
  // Palaute ja pisteet: tavalliset kaavat, ikkunat ja Kaavan tulos
  var hist=lg('joukko',{nm:'Historia'},400,340);link(H,'rj',hist,'rv');
  var pv=lg('valitse',{nm:'Palauteteksti'},400,420);link(kaava('historia.vika.oikein',200,420),'v',pv,'c');
  link(kaava('"✅ Oikein!"',200,480),'v',pv,'a');link(kaava('"❌ Väärin. Oikea oli " + historia.vika.kysymys.oikea',200,540),'v',pv,'b');
  var on=kaava('vastaukset.rivejä > 0',200,600);link(on,'v',pal,'nk');link(on,'v',pis,'nk');
  var ok=lg('ikkuna',{nm:'Oikeita',m:'cnt',riv:true},400,640);ok.n.w=300;ok.n.h=120;link(H,'rj',ok,'rv');kaava('vastaus.oikein',420,690,ok);
  lg('tulos',{nm:'Osuus'},400,800);kaava('osuus = oikeita * 100 / vastaukset.rivejä',200,800);
  // Näkymä 2: tilasto kysymyksittäin tunnisteen mukaan (säilyy, vaikka kysymyksen teksti vaihdetaan)
  ui('nayta',{nm:'Otsikko 2',tx:'Tilasto kysymyksittäin',koko:'l'},'v2',16,16,358,40);
  ui('nayta',{nm:'Ohje 2',tx:'Historia lasketaan tunnisteella. Kysymyksen tekstin voi vaihtaa, eikä tilasto nollaudu.',koko:'s'},'v2',16,56,358,44);
  var TS=ui('toistin',{nm:'Kysymyskortit',tsu:'sarake',kh:64,vali:6},'v2',16,108,358,560);
  var bg3=ui('muoto',{nm:'Kortin tausta',laji:'laatikko',tx:'',z:-1},'v2',16,108,358,64);
  var c1=ui('nayta',{nm:'Kortin kysymys',tx:'{k.tunniste}: {k.kysymys}',koko:'s'},'v2',24,112,342,28);
  var c2=ui('nayta',{nm:'Kortin tilasto',tx:'Vastattu {Vastattu} · oikein {Oikein tähän}',koko:'s'},'v2',24,140,342,24);
  KK.tstAssign(P,[bg3.b.id,c1.b.id,c2.b.id]);link(T,'rj',TS,'rv');
  var va=lg('ikkuna',{nm:'Vastattu',m:'cnt',riv:true},700,420);va.n.w=320;va.n.h=120;link(H,'rj',va,'rv');kaava('vastaus.tunniste == k.tunniste',720,470,va);
  var ot=lg('ikkuna',{nm:'Oikein tähän',m:'cnt',riv:true},700,580);ot.n.w=360;ot.n.h=220;link(H,'rj',ot,'rv');
  var sis=lg('ikkuna',{nm:'Oikein ja tämä',m:'and'},720,620,ot);sis.n.w=320;sis.n.h=160;kaava('vastaus.tunniste == k.tunniste',740,660,sis);kaava('vastaus.oikein',740,720,sis);
  var toKys=ui('nappi',{nm:'Kysymyksiin',tx:'← Kysymykset',beh:'kerta'},'v2',16,760,358,48);
  // Navigointi ja alku
  var e1=lg('tee',{nm:'Ensimmäinen kysymys',do:'valitserivi',o:T.b.id,rs:'eka'},700,300);link(alku,'e',e1,'e');
  var g1=lg('tee',{nm:'Siirry tilastoon',do:'siirry',vw:'v2'},1100,40);link(toTil,'e',g1,'e');
  var g2=lg('tee',{nm:'Siirry kysymyksiin',do:'siirry',vw:'v1'},1100,120);link(toKys,'e',g2,'e');
  KK.tSetSel(P,T.b.id,KK.tRows(P,T.b.id)[0].id);
  return M.valmis();
}

function tiedosto(P){var c=JSON.parse(JSON.stringify(P));delete c.cam;delete c.lcam;delete c._gh;
  return JSON.stringify({app:'appiappi',ver:KK.VER,savedAt:new Date().toISOString(),projekti:c},null,1)+'\n';}
module.exports={koeappiC:koeappiC,koeappiB:koeappiB,tiedosto:tiedosto};
if(require.main===module){var dir=process.argv[2]||'.',fs=require('fs');
  [koeappiC(),koeappiB()].forEach(function(P){KK.repair(P);fs.writeFileSync(dir+'/'+P.id+'.json',tiedosto(P));console.log('kirjoitettu',dir+'/'+P.id+'.json');});}
