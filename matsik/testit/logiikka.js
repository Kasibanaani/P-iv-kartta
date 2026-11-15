/* Mätsik Forest 1.0: moottorin säännöt (kuittaukset OK / Ei, sääntöjen järjestys, portaat, mittaus muistiosta, aikasanat, käyntisykli, muokattavat sisällöt ja muodot, vanhentuminen, arviointi, tahojen tavoitteet ja seuranta,
   ohjauksen arvio, haasteet, mittarit, tallennus). */
const MF=require('./engine.js');let bad=0;
function want(l,c){console.log('  '+l.padEnd(58)+(c?'ok':'VIRHE'));if(!c)bad++;}
/* 1.14: välit vain yhteisestä listasta */
function setV(dd,o){dd.asetukset.sisallot.forEach(x=>{if(o[x.id]!==undefined)x.ov=o[x.id];});}
const T='2026-11-02'; /* maanantai, viikko 45 */
want('viikko 46 alkaa 9.11.',MF.week('2026-11-09')===46&&MF.monday('2026-11-12')==='2026-11-09');
want('päiväys ja klo',JSON.stringify(MF.lineDates('käynti ti 10.11. klo 14',T).map(x=>x.date))==='["2026-11-10"]'&&MF.lineTimes('ti 10.11. klo 14').length===1);
want('viikonpäivä sanana',MF.lineDates('Kettu soitto keskiviikkona',T)[0].date==='2026-11-04');
want('huomenna',MF.lineDates('huomenna',T)[0].date==='2026-11-03');
want('lyhyt viikonpäivä vain ajan kanssa',!MF.lineDates('ti on hyvä',T).length&&MF.lineDates('ti klo 9',T)[0].date==='2026-11-03');
want('vanha päiväys siirtyy seuraavaan vuoteen',MF.lineDates('5.1.',T)[0].date==='2027-01-05');
const d=MF.empty();d.asetukset.portaat=false;const k=MF.newClient('Kettu',T);const s=MF.newClient('Siili',T);d.asiakkaat.push(k,s);
want('taivutettu nimi tunnistuu',MF.mentions('Ketulle soitto',d.asiakkaat).length===1&&MF.mentions('Siilin äiti',d.asiakkaat)[0]===s);
want('vieras sana ei tunnistu',!MF.mentions('Kirje mummolle',d.asiakkaat).length);
let H=MF.herjat(k,d,T);
want('puuttuvat: tulosyy, diagnoosit, vahvuudet, tavoitteet',['tulosyy','diagnoosit','vahvuudet','tavoitteet'].every(o=>H.some(h=>h.osio===o&&h.laji==='puuttuu')));
want('1.14: ei eläinkohtaista "välit valitsematta" -herjaa',!H.some(h=>h.osio==='toimet'));
/* 1.4: välit */
k.toimet.alku='2026-11-04';setV(d,{lahi:'v1',vanh:'v2',laak:'v4',paino:'k2'});
want('jaksot: 1 vk, 3 vk ja 3 kk',(p=>p.start==='2026-11-02'&&p.end==='2026-11-08')(MF.periodAt('v1',MF.vAnchor(k),T))&&(p=>p.start==='2026-11-23'&&p.end==='2026-12-13')(MF.periodAt('v3',MF.vAnchor(k),'2026-11-25'))&&(p=>p.start==='2027-02-02'&&p.end==='2027-05-01')(MF.periodAt('k3',MF.vAnchor(k),'2027-02-10')));
H=MF.herjat(k,d,T);const sy=H.filter(h=>h.laji==='sykli');const cnt=n=>sy.filter(h=>h.teksti.startsWith(n)).length;
want('kysytään kuluvalle ja 2 seuraavalle viikolle: 1 vk 3, 2 vk 2, 4 vk 1, 2 kk 1',cnt('Lähikäynti')===3&&cnt('Lähivanhemman')===2&&cnt('Lääkärin')===1&&cnt('Paino')===1&&sy.length===7);
want('viikkonumerot ja kiire: kuluva ja ensi viikko kiireellisiä',MF.isoWeek('2026-11-02')===45&&MF.isoWeek('2027-01-01')===53&&MF.isoWeek('2027-01-04')===1&&sy.find(h=>h.teksti==='Lähikäynti varattava vk 46 (1 vk)').sev==='crit'&&sy.find(h=>h.teksti==='Lähikäynti varattava vk 47 (1 vk)').sev==='warn');
d.muistio.push({id:'a',text:'Kettu lähikäynti ke 4.11. klo 14',tila:{}},{id:'b',text:'Ketun äidille soitto 10.11.\nKettu käynti 12.11.',tila:{}});
H=MF.herjat(k,d,T);want('varaukset täyttävät viikot',!H.some(h=>/Lähikäynti varattava vk 4[56]/.test(h.teksti))&&H.some(h=>h.teksti==='Lähikäynti varattava vk 47 (1 vk)'));
d.muistio[0].tila={'2026-11-04|0':'peruttu'};H=MF.herjat(k,d,T);want('peruttu ei kelpaa',H.some(h=>h.teksti==='Lähikäynti varattava vk 45 (1 vk)'));d.muistio[0].tila={};
k.toimet.ok={'lahi|2026-11-16':T};want('OK-kuittaus = varattu tälle viikolle',!MF.herjat(k,d,T).some(h=>h.teksti.startsWith('Lähikäynti')));
{const d9=MF.empty(),k9=MF.newClient('Kettu',T);d9.asiakkaat.push(k9);setV(d9,{paino:'v4'});d9.muistio.push({id:'p',text:'Kettu paino 26.11.',tila:{}});
 const c9=MF.chain(k9,'paino','v4',MF.allEntries(d9,T),T,MF.lists(d9),MF.derivedFor(k9,d9,T));
 want('varaus nollaa välin: paino vk 48 + 4 vk → seuraava vk 52',MF.isoWeek(c9[0].w)===48&&c9[0].st==='plan'&&MF.isoWeek(c9[1].w)===52&&c9[1].st==='due');}
const T2='2026-11-16';k.seuranta.paino.arvot.push({pvm:'2026-11-24',arvo:'41'});d.muistio.push({id:'c',text:'Kettu lääkärin vo-käynti 25.11. RR',tila:{}});
{const E2=MF.allEntries(d,T2),L2=MF.lists(d),D2=MF.derivedFor(k,d,T2),cp=MF.chain(k,'paino','k2',E2,T2,L2,D2)[0],cl=MF.chain(k,'laak','v4',E2,T2,L2,D2)[0];
 want('mittaus tehty, lääkäri varattu vk 48',MF.isoWeek(cp.w)===48&&cp.st==='ok'&&MF.isoWeek(cl.w)===48&&cl.st==='plan');
 const W=MF.weekItems(k,d,T2,E2,MF.herjat(k,d,T2,E2)),wk=Object.keys(W);
 want('viikkonäkymä: 14 viikkoa, kuluvassa muistutukset, muistiinpano oikealla viikolla',wk.length===14&&wk[0]==='2026-11-16'&&W['2026-11-16'].some(x=>x.typ==='hj')&&W['2026-11-09']===undefined&&MF.weekSev(W['2026-11-16'])!=='tyh');}
{const dA=MF.empty(),kA=MF.newClient('Siili',T);dA.asiakkaat.push(kA);MF.setChk(kA,'tulosyy','ok',T);dA.muistio.push({id:'n',text:'Siili neuvottelu 20.11.',tila:{}});
 const W=MF.weekItems(kA,dA,T,MF.allEntries(dA,T),[]);
 want('erääntyvä kuittaus ja muistiinpano viikoilla',!Object.values(W).flat().some(x=>x.typ==='chk')&&W['2026-11-16'].some(x=>x.typ==='note'&&x.sev==='info'));
 dA.asetukset.valit.tulosyy=2;const W2=MF.weekItems(kA,dA,T,MF.allEntries(dA,T),[]);want('kuittaus erääntyy välin päästä (2 kk → vk 1)',W2['2026-12-28']&&W2['2026-12-28'].some(x=>x.typ==='chk'&&x.key==='tulosyy'));}
want('vanha sykli siirtyy väleiksi',JSON.stringify(MF.migrateVali({vk1:['lahi','rr'],vk2:['lahi'],vk3:['lahi'],vk4:['lahi','rr'],kk2:['neuv'],kk3:[]}))==='{"lahi":"v1","rr":"v2","neuv":"k3"}'&&MF.repair({asiakkaat:[{nimi:'V',toimet:{sykli:{vk1:['ep'],kk3:['ep']}}}]}).asiakkaat[0].toimet.vali.ep==='v4'&&MF.repair({asiakkaat:[{nimi:'V',toimet:{sykli:{vk1:['ep'],kk3:['ep']}}}]}).asetukset.sisallot.find(x=>x.id==='ep').ov==='v4');
k.esitiedot={perhe:'Äiti ja isä',u:'2026-04-01'};H=MF.herjat(k,d,T);want('esitiedot 7 kk vanha (väli 6)',H.some(h=>h.osio==='esitiedot'&&h.tark));
k.esitiedot.u=T;H=MF.herjat(k,d,T);want('tarkistettu poistaa herjan',!H.some(h=>h.osio==='esitiedot'));
const g={id:'g1',taso:1,syy:'mahd',lapsi:'Turvallinen koti',tila:'alussa',luotu:'2026-07-01',arviot:[]};k.tavoitteet.push(g);
H=MF.herjat(k,d,T);want('1.14: tavoitteet tarkistamatta välin jälkeen = yksi muistutus, ei tavoitekohtaista arviointia',H.filter(h=>h.teksti==='Tarkista tavoitteet'&&h.key==='tavoitteet').length===1&&!H.some(h=>h.laji==='arvio'));
MF.setChk(k,'tavoitteet','ok',T);want('yksi OK kuittaa kaikki tavoitteet',!MF.herjat(k,d,T).some(h=>h.osio==='tavoitteet'));
MF.saveArvio(g,[['q','a']],'Psykoedukaatio: miksi tavoite on tärkeä','',T);H=MF.herjat(k,d,T);
want('arvio kirjattu, toimenpide auki',!H.some(h=>h.laji==='arvio')&&H.some(h=>h.laji==='toimenpide'));
g.arviot[0].tehty=T;H=MF.herjat(k,d,T);want('tehty sulkee toimenpiteen',!H.some(h=>h.laji==='toimenpide'));
MF.saveArvio(g,[],'Tavoite saavutettu','',T);want('saavutettu merkitsee tavoitteen',g.tila==='saavutettu');
const L=MF.ordered(d,T);want('järjestys: kiireellinen ensin',L[0].h[0].sev==='crit'||L.length===2);
const f=JSON.parse(JSON.stringify(MF.wrap(d,'2026-11-02T10:00:00Z')));want('vientimuoto',f.app==='matsik'&&f.ver===1&&f.data.asiakkaat.length===2);
const back=MF.unwrap(f);want('tuonti palauttaa',back.asiakkaat[0].nimi==='Kettu'&&back.muistio.length===d.muistio.length);
want('vieras tiedosto hylätään',MF.unwrap({app:'paatospuu',data:{asiakkaat:[]}})===null&&MF.unwrap({x:1})===null);
const r=MF.repair({asiakkaat:[{nimi:'Vanha'}]});want('puutteellinen data korjautuu',r.asiakkaat[0].seuranta.paino.arvot.length===0&&Array.isArray(r.asiakkaat[0].tavoitteet));
/* muokattavat luettelot (0.3) */
want('vanha data saa oletussisällöt ja -muodot',r.asetukset.sisallot.length===13&&r.asetukset.muodot.length===5&&r.asetukset.sisallot.find(x=>x.id==='paino').mit==='paino');
want('lyhyt sana vain kokonaisena',MF.wordRe('ep').test('EP-oireet')&&!MF.wordRe('ep').test('epäily')&&MF.wordRe('paino').test('painoa')&&MF.wordRe('isä').test('isä soitti')&&!MF.wordRe('isä').test('isäntä'));
want('lääkitys ei ole lääkärikäynti',!MF.lists(null).byId.laak.re.test('lääkityksen vaste'));
const d2=MF.empty(),k2=MF.newClient('Kettu',T);d2.asetukset.portaat=false;d2.asiakkaat.push(k2);k2.toimet.alku=T;
d2.asetukset.sisallot.push({id:'ryhma',n:'Ryhmäkäynti',laji:'kaynti',sanat:'ryhmä',mit:''});d2.asetukset.muodot.push({id:'ulko',n:'Ulkona',sanat:'metsäkävely, ulkona'});
setV(d2,{ryhma:'v4'});let H2=MF.herjat(k2,d2,T);
want('oma sisältö herjaa nimellään',H2.some(h=>h.teksti.includes('Ryhmäkäynti varattava')));
d2.muistio.push({id:'r',text:'Kettu ryhmään to 5.11. klo 13 metsäkävely',tila:{}});H2=MF.herjat(k2,d2,T);const e2=MF.allEntries(d2,T)[0];
want('oma sisältö täyttää laatikon ja tekee käynnin',!H2.some(h=>h.laji==='sykli')&&e2.kaynti&&e2.muoto==='ulko');
d2.asetukset.sisallot.find(x=>x.id==='ryhma').sanat='ryhmäkäyn';H2=MF.herjat(k2,d2,T);
want('sanan muutos vaikuttaa heti',H2.some(h=>h.teksti.includes('Ryhmäkäynti varattava')));
d2.asetukset.sisallot=d2.asetukset.sisallot.filter(x=>x.id!=='ryhma');H2=MF.herjat(k2,d2,T);
want('poistettu sisältö ei herjaa',!H2.some(h=>h.laji==='sykli'));
const r2=MF.repair({asiakkaat:[],asetukset:{pikaSis:true,sisallot:[{id:'x',n:'X',laji:'outo',mit:'kenkä'},{id:'x',n:'tupla'},{n:'ei id'}]}});
want('viallinen luettelo korjautuu',r2.asetukset.sisallot.length===1&&r2.asetukset.sisallot[0].laji==='kaynti'&&r2.asetukset.sisallot[0].mit===''&&r2.asetukset.muodot.length===5);
/* 0.4: tahojen tavoitteet, seuranta, ohjauksen arvio, haasteet, mittarit */
const old={asiakkaat:[{id:'v',nimi:'Vanha',luotu:'2026-10-01',tavoitteet:[{id:'t1',taso:2,syy:'mahd',lapsi:'Käyn koulussa',vanh:'',tyont:'Luottamus syntyy',keinot:'Tapaamiset',tila:'etenee',tilaT:'hyvä',luotu:'2026-10-01',arviot:[{pvm:'2026-10-20',tulos:'Jatketaan'}]},
  {id:'t2',taso:1,lapsi:'',vanh:'',tyont:''}]}]};
const r3=MF.repair(old),G3=r3.asiakkaat[0].tavoitteet;
want('vanha tavoite jaetaan tahoittain',G3.length===3&&G3[0].id==='t1'&&G3[0].taho==='lapsi'&&G3[0].teksti==='Käyn koulussa'&&G3[0].arviot.length===1&&G3[1].taho==='tyont'&&G3[1].teksti==='Luottamus syntyy'&&G3[1].taso===2&&G3[1].keinot==='Tapaamiset'&&!G3[1].arviot.length);
want('tyhjä vanha tavoite = lapsen tavoite, vanhat kentät pois',G3[2].id==='t2'&&G3[2].taho==='lapsi'&&G3[2].teksti===''&&G3[0].lapsi===undefined&&G3[0].tyont===undefined);
want('uusi tavoite säilyy korjauksessa',MF.repair(JSON.parse(JSON.stringify(r3))).asiakkaat[0].tavoitteet.length===3);
want('vanha data saa periaatteet, mittarit ja ohjausvälin',JSON.stringify(r3.asetukset.periaatteet)==='["CPS","FIT"]'&&r3.asetukset.mittarit.map(m=>m.n).join()==='Oirekyselyt,FIT'&&r3.asetukset.valit.ohjaus===6&&Array.isArray(r3.asiakkaat[0].haasteet));
const d3=MF.empty(),k3=MF.newClient('Kettu','2026-11-02');d3.asiakkaat.push(k3);
k3.tavoitteet.push({id:'s1',taso:1,taho:'vanh',teksti:'Kotona on turvallista',tila:'etenee',luotu:'2026-11-02',arviot:[],seur:{miel:'k',real:'e',vointi:'e'}});
let H3=MF.herjat(k3,d3,'2026-11-03');const hs=H3.find(h=>h.laji==='seur');
want('seuranta: Ei herjaa (taso 1 = kiire)',hs&&hs.sev==='crit'&&hs.teksti==='Ei realistinen, vaikuttaa kokonaisvointiin: Kotona on turvallista'&&hs.tav==='s1');
want('ohjauksen arvio ei vielä uudelle',!H3.some(h=>h.laji==='ohjaus'));
H3=MF.herjat(k3,d3,'2027-05-02');want('ohjauksen arvio 6 kk:n päästä',H3.some(h=>h.laji==='ohjaus'&&h.osio==='tarve'));
k3.ohjaus.push({pvm:'2027-05-01',tulos:'oikea'});H3=MF.herjat(k3,d3,'2027-05-02');want('kirjattu arvio poistaa herjan',!H3.some(h=>h.laji==='ohjaus'));
d3.asetukset.valit.ohjaus=0;want('väli 0 = ei muistutusta',!MF.herjat(k3,d3,'2029-01-01').some(h=>h.laji==='ohjaus'));
k3.haasteet.push({id:'h1',teksti:'Riitely naapurin kanssa',ohjaus:''});H3=MF.herjat(k3,d3,'2027-05-02');
want('haaste ilman ohjausta herjaa',H3.some(h=>h.laji==='haaste'&&h.osio==='haasteet'));
k3.haasteet[0].ohjaus='sos';want('ohjaus valittu: ei herjaa',!MF.herjat(k3,d3,'2027-05-02').some(h=>h.laji==='haaste'));
k3.mittarit.fit={arvot:[{pvm:'2027-05-02',arvo:'36'}]};const r4=MF.repair(JSON.parse(JSON.stringify(d3)));
want('mittarit, haasteet ja ohjaus säilyvät tallennuksessa',r4.asiakkaat[0].mittarit.fit.arvot[0].arvo==='36'&&r4.asiakkaat[0].haasteet[0].ohjaus==='sos'&&r4.asiakkaat[0].ohjaus.length===1&&r4.asiakkaat[0].tavoitteet[0].seur.real==='e');
want('mittariluettelo korjautuu',MF.repair({asiakkaat:[],asetukset:{mittarit:[{id:'a',n:'A',mita:'x'},{id:'a'},{n:'ei id'}]}}).asetukset.mittarit.length===1);
/* 0.8: säännöt omassa järjestyksessä, portaat, mittaus muistiosta */
want('oletusjärjestys',MF.empty().asetukset.saannot.map(r=>r.id).join()==='t1,sykli1,t2,sykli,t3,ohj,puu,vanha'&&MF.empty().asetukset.portaat===true);
want('vanha data saa säännöt ja portaat',MF.repair({asiakkaat:[]}).asetukset.saannot.length===8&&MF.repair({asiakkaat:[]}).asetukset.portaat===true);
want('viallinen sääntölista korjautuu',MF.repair({asiakkaat:[],asetukset:{saannot:[{id:'puu',tila:'kiire'},{id:'x'},{id:'puu',tila:'pois'},{id:'t1',tila:'outo'}]}}).asetukset.saannot.map(r=>r.id+':'+r.tila).slice(0,2).join()==='puu:kiire,t1:kiire'&&MF.repair({asiakkaat:[],asetukset:{saannot:[{id:'puu'}]}}).asetukset.saannot.length===8);
const d4=MF.empty(),k4=MF.newClient('Kettu','2026-11-02');d4.asiakkaat.push(k4);
let H4=MF.herjat(k4,d4,'2026-11-02');
want('portaat: uusi eläin näkee vain vaiheen 1 puutteet',H4.length>0&&H4.every(h=>h.laji!=='puuttuu'||MF.VAIHEOSIO[h.osio]===1)&&H4.some(h=>h.osio==='tulosyy'));
d4.asetukset.portaat=false;H4=MF.herjat(k4,d4,'2026-11-02');want('portaat pois: kaikki puutteet',H4.some(h=>h.osio==='diagnoosit')&&H4.some(h=>h.osio==='tavoitteet'));
want('herjalla sääntö ja syy',H4.every(h=>h.r&&typeof h.ri==='number'&&h.rn));
k4.toimet.alku='2026-11-02';setV(d4,{lahi:'v1'});k4.tavoitteet.push({id:'q3',taso:3,taho:'lapsi',teksti:'Harrastus',tila:'etenee',luotu:'2026-11-02',arviot:[],seur:{real:'e'}});
H4=MF.herjat(k4,d4,'2026-11-02');const iS=H4.findIndex(h=>h.laji==='sykli'),iT=H4.findIndex(h=>h.tav==='q3'),iP=H4.findIndex(h=>h.laji==='puuttuu');
want('järjestys: tavoitteet, sovittava käynti, puuttuvat',iT===0&&iT<iS&&iS<iP&&H4[iS].sev==='crit'&&H4[iS].it==='lahi');
d4.asetukset.jarj=['o:tulosyy'].concat(MF.jarj(d4).filter(k=>k!=='o:tulosyy'));H4=MF.herjat(k4,d4,'2026-11-02');
want('1.12: yksi lista määrää järjestyksen yli lajirajojen (osio käynnin edelle)',H4[0].laji==='puuttuu'&&H4[0].osio==='tulosyy'&&H4[0].sev==='warn'&&H4.findIndex(h=>h.laji==='sykli')>0);
d4.asetukset.saannot=[{id:'puu',tila:'pois'},{id:'sykli1',tila:'pois'}];want('vanha lajien järjestys ja Pois eivät enää vaikuta',MF.herjat(k4,d4,'2026-11-02').map(h=>h.teksti).join()===H4.map(h=>h.teksti).join());
want('listan oletus: tavoitteet, käynnit ja seuranta, osiot',MF.jarj(MF.empty()).join().startsWith('o:tavoite,s:lahi')&&MF.jarj(MF.empty()).map(k=>k.charAt(0)).join('')==='o'+'s'.repeat(13)+'o'.repeat(14));
want('lista: 28 riviä, uusi sisältö asettuu käyntien perään, tuntematon putoaa',(()=>{const x=MF.empty();x.asetukset.jarj=['o:koulu','s:paino','huono','s:paino'];x.asetukset.sisallot.push({id:'uusi',n:'Uusi',laji:'kaynti',sanat:'',mit:''});const J=MF.jarj(x);
  return J.length===29&&J[0]==='o:koulu'&&J[1]==='s:paino'&&J.indexOf('huono')<0&&J.indexOf('s:uusi')===14&&J.filter(k=>k==='s:paino').length===1;})());
want('ordered noudattaa sääntöjä',MF.ordered(d4,'2026-11-02')[0].h[0].laji==='puuttuu');
const d5=MF.empty(),k5=MF.newClient('Kettu','2026-11-02');d5.asiakkaat.push(k5);const nt=(id,t)=>({id,text:t,tila:{},created:'2026-11-05T10:00:00Z',edited:'2026-11-05T10:00:00Z'});
want('muistio: paino ja RR',(()=>{const m=MF.measOfNote(nt('m1','Kettu paino 41\nKettu RR 112/70'),[k5],d5,'2026-11-05');return JSON.stringify(m.map(x=>[x.id,x.arvo]))==='[["paino","41"],["rr","112/70"]]';})());
want('muistio: päiväys, kellonaika ja tuleva ei ole mittaus',!MF.measOfNote(nt('m2','Kettu paino klo 14\nKettu paino 12.11.'),[k5],d5,'2026-11-05').length);
want('muistio: mittari FIT',(()=>{const m=MF.measOfNote(nt('m3','Kettu FIT 36'),[k5],d5,'2026-11-05');return m.length===1&&m[0].arvo==='36';})());
d5.muistio.push(nt('m1','Kettu paino 41'));const DM=MF.derivedFor(k5,d5,'2026-11-06');
want('johdettu arvo eläimelle',DM.mit.paino&&DM.mit.paino[0].arvo==='41'&&DM.mit.paino[0].muistio===true);
k5.toimet.alku='2026-11-02';setV(d5,{paino:'v1'});const S5=MF.periodAt('v1','2026-11-02','2026-11-06');
want('muistion mittaus täyttää laatikon',MF.itemState(k5,'paino',S5,MF.allEntries(d5,'2026-11-06'),'2026-11-06',MF.lists(d5),DM)==='ok'&&!MF.herjat(k5,d5,'2026-11-06').some(h=>h.laji==='sykli'&&h.ps==='2026-11-02'));
/* 1.0: kuittaukset OK / Ei */
const d6=MF.empty(),k6=MF.newClient('Kettu','2026-11-02');d6.asiakkaat.push(k6);const T6='2026-11-14';
want('kohdat: tavoitteet 1, esitiedot 5, tulosyy 1, mittarit luettelosta, sykli ei kuitattava',MF.chkItems('tavoitteet',d6).length===1&&MF.chkItems('esitiedot',d6).length===5&&MF.chkItems('tulosyy',d6).length===1&&MF.chkItems('mittarit',d6).length===2&&MF.chkItems('toimet',d6).length===0);
MF.setChk(k6,'tulosyy','ok',T6);let H6=MF.herjat(k6,d6,T6);want('OK kumoaa puuttuvan',!H6.some(h=>h.osio==='tulosyy'));
MF.setChk(k6,'tulosyy','ok',T6);want('sama valinta tyhjentää',!k6.kuit.tulosyy&&MF.herjat(k6,d6,T6).some(h=>h.teksti==='Tulosyy puuttuu'));
MF.setChk(k6,'esitiedot.perhe','ei',T6);H6=MF.herjat(k6,d6,T6);const e6=H6.find(h=>h.laji==='ei');
want('Ei: muistutus, ei portaiden piilottama',e6&&e6.teksti==='Ei kunnossa: Esitiedot · Perhe'&&e6.r==='puu'&&H6.some(h=>h.teksti==='Tulosyy puuttuu'));
MF.setChk(k6,'esitiedot.asuminen','ok',T6);want('OK päivittää osion tarkistuspäivän',k6.esitiedot.u===T6);
const H7=MF.herjat(k6,d6,'2027-07-01');want('OK vanhenee välin mukaan, Ei ei vanhene',H7.some(h=>h.teksti==='Esitiedot: kuitattu 7 kk sitten'&&h.tark)&&H7.some(h=>h.laji==='ei'));
MF.touchChk(k6,'esitiedot','2027-07-01');want('Pitää paikkansa uusii kuittaukset',!MF.herjat(k6,d6,'2027-07-01').some(h=>h.teksti.startsWith('Esitiedot: kuitattu')));
/* 1.2: kaikki OK-kuittaukset vanhenevat osion välin mukaan */
MF.setChk(k6,'tulosyy','ok','2026-01-01');MF.setChk(k6,'haasteet','ok','2026-11-01');
want('tulosyyn OK vanhenee (väli 12 kk) ja tulosyy pyytää uutta kuittausta',!MF.herjat(k6,d6,'2026-12-01').some(h=>h.osio==='tulosyy')&&MF.herjat(k6,d6,'2027-01-02').some(h=>h.teksti==='Tulosyy: kuitattu 12 kk sitten'&&h.tark));
want('haasteiden OK vanhenee 3 kk:ssa',MF.herjat(k6,d6,'2027-02-02').some(h=>h.osio==='haasteet'&&h.tark));
MF.setChk(k6,'esitiedot.somaattiset','ok','2027-12-01');
want('osa kohdista vanhentunut: muistutus kertoo määrän',MF.herjat(k6,d6,'2028-01-02').some(h=>h.teksti==='Esitiedot: 1 kohta kuitattava uudelleen'));
const d8=MF.empty();d8.asetukset.valit.tulosyy=0;const k8=MF.newClient('Siili','2026-01-01');d8.asiakkaat.push(k8);MF.setChk(k8,'tulosyy','ok','2020-01-01');
want('väli 0: kuittaus ei vanhene',!MF.herjat(k8,d8,'2027-01-01').some(h=>h.osio==='tulosyy'));
want('vanha tallennus saa uudet välit oletuksina',MF.repair({asiakkaat:[],asetukset:{valit:{esitiedot:4}}}).asetukset.valit.tulosyy===12&&MF.repair({asiakkaat:[],asetukset:{valit:{esitiedot:4}}}).asetukset.valit.esitiedot===4);
want('kuittaukset säilyvät ja viallinen poistuu korjauksessa',(()=>{const x=JSON.parse(JSON.stringify(d6));x.asiakkaat[0].kuit.huono={v:'x'};x.asiakkaat[0].kuit.puuttuu={v:'ok'};const r=MF.repair(x).asiakkaat[0].kuit;return r['esitiedot.perhe'].v==='ei'&&!r.huono&&!r.puuttuu;})()&&JSON.stringify(MF.repair({asiakkaat:[{nimi:'V'}]}).asiakkaat[0].kuit)==='{}');
{/* 1.9: oletusväli, pikapäivä tarkistettavana, OK nollaa välin, kalenterin viikkonäkymä */
 const T9='2026-11-11',d=MF.empty(),k=MF.newClient('Kettu','2026-09-01');d.asiakkaat.push(k);d.asetukset.sisallot.find(x=>x.id==='neuv').ov='k3';
 want('1.14: listan väli koskee eläintä, eläimen vanha oma valinta ei vaikuta',MF.effVali(k,d).neuv==='k3'&&(k.toimet.vali={neuv:'v4'},MF.effVali(k,d).neuv==='k3')&&(k.toimet.vali={neuv:'0'},MF.effVali(k,d).neuv==='k3'));
 k.toimet.vali={};d.muistio.push({id:'n1',text:'Kettu neuvottelu 2.9.2026',tila:{}});
 d.muistio.push({id:'pk',text:'Kettu hoitoneuvottelu 23.11.2026',tila:{},pika:{a:k.id,it:'neuv',pv:['2026-11-23']}});
 const ch=()=>MF.chain(k,'neuv','k3',MF.allEntries(d,T9),T9,MF.lists(d),MF.derivedFor(k,d,T9));
 let c=ch();want('pikapäivä on tarkistettava kohta ennen välin eräpäivää (ei varaus)',c[0].st==='due'&&c[0].w==='2026-11-23'&&c[0].pk&&c[0].pk.date==='2026-11-23'&&MF.herjat(k,d,T9).some(h=>h.teksti==='Hoitoneuvottelu tarkistettava 23.11. (3 kk)'));
 d.muistio[1].tila={'2026-11-23|0':'toteutui'};c=ch();
 want('OK nollaa välin pikapäivästä: seuraava 3 kk päästä',c[0].st==='ok'&&c[0].w==='2026-11-23'&&c.filter(x=>x.st==='due').every(x=>x.w>='2026-02-23'));
 d.muistio[1].tila={};c=MF.chain(k,'neuv','k3',MF.allEntries(d,'2026-11-26'),'2026-11-26',MF.lists(d),MF.derivedFor(k,d,'2026-11-26'));
 want('kuittaamaton pikapäivä ei mene itsestään tehdyksi',c[0].st==='due'&&c[0].w==='2026-11-23');
 c=MF.chain(k,'neuv','k3',MF.allEntries(d,'2026-12-02'),'2026-12-02',MF.lists(d),MF.derivedFor(k,d,'2026-12-02'));
 want('myöhässä oleva pikapäivä siirtyy kuluvalle viikolle',c[0].st==='due'&&c[0].w==='2026-11-30'&&c[0].pk.date==='2026-11-23');
 d.muistio.push({id:'n2',text:'Kettu soitto 12.11.2026 klo 10\nKettu kotikäynti 11.11.2026',tila:{}});
 const G=MF.weekAgenda(d,'2026-11-09',T9),ke=G.days.find(x=>x.d==='2026-11-11'),to=G.days.find(x=>x.d==='2026-11-12');
 want('viikkonäkymä: menneet päivät piilossa, tänään ja tulevat päivät otsikoina',G.cur&&G.days.find(x=>x.d==='2026-11-09').past&&ke.items.length===1&&to.items[0].klo.startsWith('10'));
 const G2=MF.weekAgenda(d,'2026-11-23',T9),ma=G2.days.find(x=>x.d==='2026-11-23');
 want('viikkonäkymä: pikapäivä päivänsä alla tarkistettavana, ei kahdesti',ma.items.length===1&&ma.items[0].k==='var'&&ma.items[0].pk.note==='pk'&&!G2.days.some(x=>x.items.some(i=>i.k==='e'&&i.n==='pk')));
 d.muistio[1].tila={'2026-11-23|0':'toteutui'};const G3=MF.weekAgenda(d,'2026-11-23',T9);
 want('kuitattu pysyy samassa kohdassa',G3.days.find(x=>x.d==='2026-11-23').items[0].done===true&&G3.days.find(x=>x.d==='2026-11-23').items[0].pk.note==='pk');}
{/* 1.14: tavoitteet yhtenä rivinä, pikanapit listan asioina, eläinkohtaiset välit siirtyvät listaan */
 const T='2026-11-11',d=MF.empty(),k=MF.newClient('Kettu','2026-01-01');d.asiakkaat.push(k);
 k.tavoitteet.push({id:'g1',taso:3,taho:'lapsi',teksti:'A',arviot:[],luotu:'2026-10-01',seur:{}},{id:'g2',taso:1,taho:'tyont',teksti:'B',arviot:[],luotu:'2026-10-01',seur:{}});
 const tv=t=>MF.herjat(k,d,t).filter(h=>h.osio==='tavoitteet').map(h=>h.teksti).join();
 want('tavoitteet: ei muistutusta ennen väliä (3 kk vanhimmasta)',tv(T)===''&&tv('2027-01-02')==='Tarkista tavoitteet');
 const W=MF.weekItems(k,d,T,MF.allEntries(d,T),[]);want('tavoitteiden tarkistus viikolla, jolla väli täyttyy',Object.keys(W).filter(w=>W[w].some(x=>x.typ==='chk'&&x.key==='tavoitteet')).join()==='2026-12-28');
 MF.setChk(k,'tavoitteet','ok','2027-01-02',d);want('OK poistaa, vanhentunut OK pyytää uutta',tv('2027-01-02')===''&&tv('2027-04-05')==='Tavoitteet: kuitattu 3 kk sitten');
 MF.setChk(k,'tavoitteet','ok','2027-04-05',d);want('vanhentuneen OK:n uusinta ei tyhjennä',k.kuit.tavoitteet&&k.kuit.tavoitteet.pvm==='2027-04-05'&&tv('2027-04-05')==='');
 d.asetukset.jarj=['s:lahi','t:3.lapsi','o:koulu','t:1.vanh'];const J=MF.jarj(d);
 want('vanhat tavoiterivit yhdeksi riviksi ensimmäisen paikalle',J[0]==='s:lahi'&&J.filter(x=>x==='o:tavoite').length===1&&J.indexOf('o:tavoite')>J.indexOf('s:ep')&&J.indexOf('o:tavoite')<J.indexOf('o:koulu')&&!J.some(x=>x.charAt(0)==='t'));
 const old={asiakkaat:[{id:'a1',nimi:'Kettu',toimet:{vali:{neuv:'v4',lahi:'v1'}}},{id:'a2',nimi:'Siili',toimet:{vali:{neuv:'v4',lahi:'v2'}}},{id:'a3',nimi:'Mäyrä',toimet:{vali:{lahi:'v2',rr:'0'}}}],
   muistio:[{id:'p1',text:'Kettu reseptiuusinta 20.11.2026',pika:{a:'a1',it:'resepti',pv:['2026-11-20']}},{id:'p2',text:'Kettu lääkärin vo-aika 24.11.2026',pika:{a:'a1',it:'laakari',pv:['2026-11-24']}},{id:'p3',text:'Kettu kotikäynti 25.11.2026',pika:{a:'a1',it:'kk',pv:['2026-11-25']}},{id:'p4',text:'Kettu tukihenkilö 26.11.2026',pika:{a:'a1',it:'tuki',pv:['2026-11-26']}}],
   asetukset:{sisallot:MF.defSis().filter(x=>['lahi','neuv','rr','laak','verk'].indexOf(x.id)>=0).map(x=>({id:x.id,n:x.n,laji:x.laji,sanat:x.sanat,mit:x.mit})),valit:{tavoite:2},
     pikat:[{id:'resepti',n:'Reseptiuusinta'},{id:'laakari',n:'Lääkärin vo-aika'},{id:'neuvottelu',n:'Hoitoneuvottelu'},{id:'kk',n:'Kotikäynti'},{id:'tuki',n:'Tukihenkilö'}],jarj:['t:1.lapsi','s:lahi']}};
 const r=MF.repair(JSON.parse(JSON.stringify(old))),S=r.asetukset.sisallot,P=S.filter(x=>x.pika).map(x=>x.id);
 want('vanhat pikanapit listan asioiksi: sama asia tunnistetaan, uusi lisätään',P.join()==='lahi,laak,neuv,resepti,tuki'&&S.length===7&&S.find(x=>x.id==='resepti').sanat==='resepti'&&S.find(x=>x.id==='tuki').sanat==='tukihenki'&&!('pikat' in r.asetukset));
 want('pikamuistiinpanot osoittavat listan asiaan',r.muistio.map(n=>n.pika.it).join()==='resepti,laak,lahi,tuki');
 want('eläinten yleisin oma väli siirtyy listaan, kerran',S.find(x=>x.id==='neuv').ov==='v4'&&S.find(x=>x.id==='lahi').ov==='v2'&&S.find(x=>x.id==='rr').ov===''&&r.asetukset.valiYht===true&&r.asetukset.pikaSis===true);
 r.asetukset.sisallot.find(x=>x.id==='neuv').ov='';r.asetukset.sisallot.find(x=>x.id==='resepti').pika=false;const r2=MF.repair(JSON.parse(JSON.stringify(r)));
 want('siirto ei toistu: poistettu väli ja pika pysyvät poissa',r2.asetukset.sisallot.find(x=>x.id==='neuv').ov===''&&!r2.asetukset.sisallot.find(x=>x.id==='resepti').pika&&r2.asetukset.sisallot.length===7);
 want('vanha tavoiterivi listassa → o:tavoite',MF.jarj(r)[0]==='o:tavoite'&&MF.jarj(r)[1]==='s:lahi');
 /* pikamuistiinpano osuu vain omaan asiaansa, vaikka teksti sopisi toiseenkin */
 const d2=MF.empty(),k2=MF.newClient('Kettu','2026-09-01');d2.asiakkaat.push(k2);setV(d2,{laak:'v4',lahi:'v4'});
 d2.muistio.push({id:'q',text:'Kettu lääkärin vo-käynti 19.11.2026',tila:{},pika:{a:k2.id,it:'laak',pv:['2026-11-19']}},{id:'q2',text:'Kettu käynti, lääkäri mukana 20.11.2026',tila:{},pika:{a:k2.id,it:'lahi',pv:['2026-11-20']}});
 const E2=MF.allEntries(d2,T),L2=MF.lists(d2),pl=MF.pikaPts(k2,'laak',E2,L2).map(e=>e.note).join(),pa=MF.pikaPts(k2,'lahi',E2,L2).map(e=>e.note).join();
 want('pikapäivä osuu vain valittuun asiaan',pl==='q'&&pa==='q2'&&E2[0].pit==='laak');
 const G=MF.weekAgenda(d2,'2026-11-16',T);want('viikkonäkymän pikanimi listasta',G.days.find(x=>x.d==='2026-11-19').items.some(i=>/Lääkärin vo-käynti/.test(i.lab)));}
process.exit(bad?1:0);
