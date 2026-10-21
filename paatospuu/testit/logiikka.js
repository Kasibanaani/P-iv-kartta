// Päätöspuun moottorin testit. Ajo: sh paatospuu/testit/aja.sh
var E=require('./engine.js'),ok=0,bad=0;
function eq(name,got,exp){var g=JSON.stringify(got),e=JSON.stringify(exp);if(g===e){ok++;}else{bad++;console.log('VIRHE',name,'\n  saatiin',g,'\n  odotettu',e);}}
function P(text){return {id:'p',name:'Testi',text:text,rules:{},mx:[],session:null};}
function t(Pr,a,b,m){E.toggleRule(Pr,a,b,m||'o');}
var A=E.ALKU;

// tekstimuoto
var pt=E.parseText('Koira\n#Eläimet: kaikki eläimet\n>Perustelu: Koska näin. // Toinen kappale\n\n// kommentti\nkoira\n>Pelkkä teksti ilman nimeä');
eq('lajit',pt.items.map(function(i){return i.k+':'+i.name;}),['b:Koira','g:Eläimet','t:Perustelu','t:Pelkkä teksti ilman nimeä']);
eq('tuplanimi varoitus',pt.warnings.length,1);
eq('kappale',E.bodyText(pt.by['perustelu'].body),'Koska näin.\n\nToinen kappale');
eq('lineOf',pt.items.map(E.lineOf),['Koira','#Eläimet: kaikki eläimet','>Perustelu: Koska näin. // Toinen kappale','>Pelkkä teksti ilman nimeä']);

// opettamaton Alku: kaikki, joita mikään ei avaa
var p=P('A\nB\nC');t(p,'a','c');
var S=E.newSession(p,'2026-10-20T10:00:00Z');eq('opettamaton alku',E.sessionView(p,S).opts,['a','b']);

// valinta avaa vain suoraan liitetyt
p=P('A\nB\nC\nD\nE\n#G: ryhmä\n>T: ilmoitus A:sta');
t(p,A,'a');t(p,A,'b');t(p,'a','c');t(p,'a','g');t(p,'g','d');t(p,'g','e');t(p,'b','d');t(p,'a','t');t(p,'c','e');
S=E.newSession(p,'x');var v=E.sessionView(p,S);eq('alku',v.opts,['a','b']);eq('ei ilmoitusta alussa',S.log,[]);
var d=E.tapDraft(p,S,{p:[],d:[]},'a');eq('draft',d,{p:['a'],d:[]});
E.commitStep(p,S,d);v=E.sessionView(p,S);eq('A avaa C ja ryhmän G jäsenet',v.opts,['c','d','e']);eq('ilmoitus lokiin',S.log,['t']);
// C avaa vain E:n, ei kaikkea aiempaa
E.commitStep(p,S,{p:['c'],d:[]});eq('C avaa vain E',E.sessionView(p,S).opts,['e']);
eq('A ja C muistissa',E.sessionView(p,S).sel,['a','c']);
var u=E.undoStep(S);eq('peru askel',u,{p:['c'],d:[]});eq('peru: tarjolla taas',E.sessionView(p,S).opts,['c','d','e']);

// poissulku muistuu ja voittaa; purku vapauttaa
p=P('A\nB\nC\nD');t(p,A,'a');t(p,A,'b');t(p,'a','c');t(p,'b','c');t(p,'b','d');t(p,'a','x');E.toggleRule(p,'a','d','x');t(p,'c','a');t(p,'c','d');
S=E.newSession(p,'x');E.commitStep(p,S,{p:['a','b'],d:[]});
eq('A sulkee D:n',E.sessionView(p,S).opts,['c']);
E.commitStep(p,S,{p:['c'],d:[]});v=E.sessionView(p,S);eq('D yhä pois, A tarjolla valmiiksi valittuna',[v.opts,v.picked],[['a'],['a']]);
d=E.tapDraft(p,S,{p:[],d:[]},'a');eq('purku',d,{p:[],d:['a']});v=E.sessionView(p,S,d);eq('purku vapauttaa D:n',v.opts,['a','d']);eq('ei valittuja',v.picked,[]);

// saman askeleen ristiriidat harmaana: poissulku ja toisensa poissulkevat
p=P('A\nB\nC');t(p,A,'a');t(p,A,'b');t(p,A,'c');E.toggleRule(p,'a','b','x');p.mx=[['a','c']];
S=E.newSession(p,'x');v=E.sessionView(p,S,{p:['a'],d:[]});eq('harmaat',v.blocked,{b:'a',c:'a'});
d=E.tapDraft(p,S,{p:['a'],d:[]},'b');eq('harmaata ei voi valita',d,{p:['a'],d:[]});
E.commitStep(p,S,{p:['c'],d:[]});eq('toisensa poissulkevat eivät muistu',E.sessionView(p,S).excl,{});

// ryhmä sulkee pois toisen ryhmän ja sen jäsenet (sisäkkäiset renkaat)
p=P('A\nD\nE\nF\n#G\n#H\n#K');t(p,A,'a');t(p,'a','g');t(p,'a','k');t(p,'g','d');t(p,'g','e');t(p,'h','e');t(p,'h','f');E.toggleRule(p,'k','h','x');
S=E.newSession(p,'x');E.commitStep(p,S,{p:['a'],d:[]});v=E.sessionView(p,S);
eq('K sulkee H:n ja sen jäsenen E',v.opts,['d']);eq('excl',Object.keys(v.excl).sort(),['e','f','h']);
// ryhmä avaa toisen ryhmän
p=P('A\nD\n#G\n#H');t(p,A,'a');t(p,'a','g');t(p,'g','h');t(p,'h','d');S=E.newSession(p,'x');E.commitStep(p,S,{p:['a'],d:[]});eq('ryhmä ryhmän kautta',E.sessionView(p,S).opts,['d']);

// muistiinpano
p=P('A\nB\n>T: Perustelu.');t(p,A,'a');t(p,'a','b');t(p,'a','t');S=E.newSession(p,'x');E.commitStep(p,S,{p:['a'],d:[]});E.commitStep(p,S,{p:['b'],d:[]});
eq('muistiinpano',E.sessionNote(p,S,'Oma huomio'),'Testi\nValinnat: A → B\n\nPerustelu.\n\nOma huomio');

p=P('A\nB\nC\n#G\n#H');t(p,A,'a');t(p,'a','g');t(p,'g','h');t(p,'h','b');t(p,'b','c');S=E.newSession(p,'x');E.commitStep(p,S,{p:['a'],d:[]});E.commitStep(p,S,{p:['b'],d:[]});
eq('muistiinpanoon ryhmät',E.sessionNote(p,S,''),'Testi\nValinnat: A → B\nRyhmät: G, H');

// kierros päivälle: päivän muistiinpanojen termit valmiiksi mukaan
p=P('A\nB\nC\nD\n#G\n>T: Teksti.');t(p,A,'a');t(p,A,'b');t(p,'b','d');t(p,'g','c');E.toggleRule(p,'g','a','x');
var dn=[{id:'1',created:'2026-10-01T10:00:00Z',text:'bee, gee, tee',date:'2026-10-24'},{id:'2',created:'2026-10-01T10:00:00Z',text:'cee',date:'2026-10-25'},{id:'3',created:new Date(2026,9,20).toISOString(),text:'dee 14 päivän sisällä',date:''}];
var dterms=E.autoTerms([p],{b:{yes:['bee'],no:[]},c:{yes:['cee'],no:[]},d:{yes:['dee'],no:[]},g:{yes:['gee'],no:[]},t:{yes:['tee'],no:[]}},[]); // yksikirjaimiset nimet eivät ole termejä
eq('päivän muistiinpanot',E.notesOnDay(dn,'2026-10-24').map(function(n){return n.id;}),['1','3']);
var dc=E.dayCarry(p,dn,dterms,'2026-10-24');eq('päivän valinnat',dc,{notes:2,pre:['b','g','d'],texts:['t']});
dc.date='2026-10-24';S=E.newSession(p,'x',dc);v=E.sessionView(p,S);
eq('valmiina: G sulkee A:n, G avaa C:n, B avaa D:n, D valittuna',[v.opts,v.picked,S.log,S.date],[['b','c','d'],['b','d'],['t'],'2026-10-24']);
E.commitStep(p,S,{p:['c'],d:[]});eq('muistiinpano päivällä',E.sessionNote(p,S,''),'Testi\nPäivä: 24.10.2026\nPäivän muistiinpanoista: B, D\nValinnat: B, C, D\nRyhmät: G\n\nTeksti.');
eq('ilman päivää ennallaan',E.newSession(p,'x').steps,[{p:[A],d:[]}]);

// apukysymys: näkyy vain sen askeleen ajan, ei lokiin eikä termeihin
p=P('A\nB\n?Apu: Onko kiire?\n?Toinen kysymys');t(p,A,'a');t(p,'a','b');t(p,'a','apu');t(p,'a','toinen kysymys');
eq('apukysymyksen rivi',E.lineOf(E.parseText(p.text).by['apu']),'?Apu: Onko kiire?');
S=E.newSession(p,'x');eq('ei alussa',E.sessionView(p,S).qs,[]);E.commitStep(p,S,{p:['a'],d:[]});
eq('askeleessa',E.sessionView(p,S).qs,['apu','toinen kysymys']);eq('ei lokiin',S.log,[]);
E.commitStep(p,S,{p:['b'],d:[]});eq('katoaa seuraavassa',E.sessionView(p,S).qs,[]);
var atq=E.autoTerms([p],{},[]);eq('apukysymys on termi',atq.map(function(t){return t.key;}),['a','b','apu','toinen kysymys']);
eq('apukysymys nousee oletuksena',atq.filter(function(t){return t.pop;}).map(function(t){return t.key;}),['apu','toinen kysymys']);
// järjestys ja tavuviiva
eq('siirto alas',E.moveItem('A\n\nB\nC','a',1),'B\n\nA\nC');eq('siirto ylös reunalla',E.moveItem('A\nB','a',-1),'A\nB');
eq('tavuviiva',E.shownName('Kova-nälkä - iso'),'Kova-\nnälkä - iso');

// nimen vaihto ja poisto
p=P('A\nB');t(p,A,'a');t(p,'a','b');p.mx=[['a','b']];E.renameKey(p,'b','bee');eq('rename',[p.rules.a.o,p.mx],[['bee'],[['a','bee']]]);
E.removeKey(p,'bee');eq('remove',[p.rules.a,p.mx],[undefined,[]]);
p=P('A');t(p,'a','zz');eq('orvot',E.orphans(p),['zz']);E.dropOrphans(p);eq('orvot pois',E.orphans(p),[]);

// termit
var term={id:'t1',name:'eläin',yes:['kissa','koira'],no:['lelu']};
eq('kyllä',E.termOn(term,'Kissa: ruoka loppui'),true);eq('osa sanasta riittää',E.termOn(term,'Kissan ruoka loppui'),true);
eq('poissulku voittaa',E.termOn(term,'kissa, LELU'),false);eq('osuma sanan keskeltä',E.termOn(term,'pikkukissa'),true);eq('ei osumaa',E.termOn(term,'hevonen'),false);
var t2={id:'t2',name:'Allianssi',yes:['eläi-','onko lapsi turvassa?','koti-ikävä'],no:[]};
eq('tavuviiva = osa riittää',E.termOn(t2,'Kotieläimet ulkona'),true);eq('lause, välimerkit katoavat',E.termOn(t2,'Mietin: Onko lapsi, turvassa'),true);
eq('tavuviiva keskellä on tavallinen merkki',E.termOn(t2,'Koti ikävä'),true);eq('isot kirjaimet',E.termOn(t2,'ALLIANSSI!'),true);

// päätöspuun rivit termeinä, kaikista projekteista, sama nimi kerran
var pr=[{name:'Eka',text:'Kova nälkä\n#Täyttävät: x\n>Muistutus: katso jääkaappi\n>Tämä on pitkä ilmoitus ilman nimeä, joten siitä ei tule termiä'},{name:'Toka',text:'kova nälkä\nUlkona'}];
var at=E.autoTerms(pr,{'täyttävät':{yes:['pasta'],no:['lelu']}},[{id:'t9',name:'Ulkona',yes:[],no:[]}]);
eq('automaattiset termit',at.map(function(t){return t.id+'/'+t.kind+'/'+t.proj;}),['a:kova nälkä/b/Eka','a:täyttävät/g/Eka','a:muistutus/t/Eka']);
eq('sana liitetty ryhmään',E.noteTerms(at,'Söin pasta ja kova nälkä'),['a:kova nälkä','a:täyttävät']);
eq('ilmoitus tunnistuu tekstistään',E.noteTerms(at,'Muuta: Katso jääkaappi heti'),['a:muistutus']);
eq('poissulku automaattiseen',E.noteTerms(at,'pasta ja lelu'),[]);
eq('termisanat talteen',E.normalizeData({app:'paatospuu',termisanat:{'x':{yes:['a'],no:[]},'y':{yes:[],no:[]}}}).words,{x:{yes:['a'],no:[]}});

// päivämäärät, pohja ti 20.10.2026
var base=new Date(2026,9,20,21,0);function pd(s){return E.parseDates(s,base).map(function(o){return o.a===o.b?o.a:o.a+'..'+o.b;});}
eq('perjantaina',pd('Soita perjantaina'),['2026-10-23']);eq('tiistaina = tänään',pd('tiistaina'),['2026-10-20']);
eq('pvm',pd('24.10.26 ja 5.11.2026'),['2026-10-24','2026-11-05']);eq('ilman vuotta',pd('1.1. ja 25.10.'),['2026-10-25','2027-01-01']);
eq('kahden viikon sisällä',pd('kahden viikon sisällä'),['2026-10-20..2026-11-03']);eq('3 päivän päästä',pd('3 päivän päästä'),['2026-10-23']);
eq('ensi viikolla',pd('ensi viikolla'),['2026-10-26..2026-11-01']);eq('kellonaika ei',pd('klo 25. ja 31.2.26'),[]);
eq('päiväväli',pd('Loma 1.7.27–3.8.27 ja 5.-6. ei'),['2027-07-01..2027-08-03']);eq('väli ilman vuotta',pd('24.10.-26.10.'),['2026-10-24..2026-10-26']);eq('väli vuodenvaihde',pd('28.12.-2.1.27'),['2026-12-28..2027-01-02']);
eq('huomenna',pd('huomenna'),['2026-10-21']);
// Emilin lista 21.10.2026; pohja ti 20.10.2026
function pz(s){return E.parseDates(s,base).map(function(o){return E.dateLabel(o)+' | '+o.a+(o.rec?' toistuu':'');});}
eq('010726',pz('010726'),['ke 1.7.2026 | 2026-07-01']);
eq('1.7.26 klo13-16',pz('1.7.26 klo13-16'),['ke 1.7.2026 klo 13.00–16.00 | 2026-07-01']);
eq('2/27',pz('2/27'),['1.2.2027–28.2.2027 | 2027-02-01']);
eq('klo13-16 perjantai',pz('klo13-16 perjantai'),['pe 23.10.2026 klo 13.00–16.00 | 2026-10-23']);
eq('tiistaisin',pz('tiistaisin'),['joka ti | 2026-10-20 toistuu']);
eq('maanantaisin',pz('maanantaisin'),['joka ma | 2026-10-26 toistuu']);
var jt=E.parseDates('joka toinen tiistai',base)[0];eq('joka toinen tiistai',[E.dateLabel(jt),E.occursOn(jt,'2026-10-20'),E.occursOn(jt,'2026-10-27'),E.occursOn(jt,'2026-11-03')],['joka 2. ti',true,false,true]);
var lw=E.parseDates('kuun viimeinen viikko',base)[0];eq('kuun viimeinen viikko',[lw.a,E.occursOn(lw,'2026-10-25'),E.occursOn(lw,'2026-10-26'),E.nextOcc(lw,'2026-10-26')],['2026-10-20',true,false,'2026-11-23']);
eq('kuun viimeiset 3pv',pz('kuun viimeiset 3pv'),['kuun viimeiset 3 pv | 2026-10-29 toistuu']);
eq('Vk42 yhteen',pz('Vk42'),['18.10.2027–24.10.2027 | 2027-10-18']);eq('vk 42 erikseen ei',pz('vk 42'),[]);
eq('peräkkäin tarkentavat',pz('vk43 perjantai klo13-16'),['pe 23.10.2026 klo 13.00–16.00 | 2026-10-23']);
eq('erillään erikseen',pz('Vk43 ja sitten klo13-16'),['19.10.2026–25.10.2026 | 2026-10-19','ti 20.10.2026 klo 13.00–16.00 | 2026-10-20']);
eq('pilkku katkaisee',pz('perjantaina, klo 14'),['ti 20.10.2026 klo 14.00 | 2026-10-20','pe 23.10.2026 | 2026-10-23']);
eq('järjestys vapaa',pz('klo 9.30-11 1.7.26'),['ke 1.7.2026 klo 9.30–11.00 | 2026-07-01']);
eq('väli välilyönnein',pz('1.7.26 – 3.8.26 tiistaisin'),['joka ti 1.7.2026–3.8.2026 | 2026-07-07 toistuu']);
var cs=E.parseDates('Palaveri 1.7.26 klo13-16 tärkeä',base)[0];eq('kohta tekstissä',[cs.s,cs.e,cs.src],[9,24,'1.7.26 klo13-16']);
var rn={id:'r',created:base.toISOString(),text:'tiistaisin'};eq('toistuva järjestyksessä',E.nextDate(rn,'2026-10-21').k,'2026-10-27');
eq('toistuva päivän muistiinpanoissa',E.notesOnDay([rn],'2026-11-03').length,1);

// järjestys: monen päivän muistiinpano siirtyy seuraavaan
var notes=[{id:'n1',created:new Date(2026,9,1).toISOString(),edited:'b',text:'5.10.26 ja 30.10.26',date:''},
 {id:'n2',created:new Date(2026,9,1).toISOString(),edited:'c',text:'ei päivää',date:''},
 {id:'n3',created:new Date(2026,9,1).toISOString(),edited:'a',text:'mitään',date:'2026-10-22'}];
eq('seuraavaksi',E.sortNotes(notes,'next','2026-10-20').map(function(n){return n.id;}),['n3','n1','n2']);
eq('n1 seuraava',E.nextDate(notes[0],'2026-10-20').k,'2026-10-30');
eq('uusimmat',E.sortNotes(notes,'new','2026-10-20').map(function(n){return n.id;}),['n2','n1','n3']);

// tallennusmuoto
var o={app:'paatospuu',ver:1,cur:'p1',projektit:[{id:'p1',name:'X',text:'A',rules:{a:{o:['b'],x:[]}},mx:[['a','b'],['c']],session:{start:'s',steps:[['__alku'],['a']],log:[],logAt:[0]}}],muistiinpanot:[{id:'n',created:'c',text:'t',date:'bad'}],termit:[{id:'t',name:' x ',yes:['a',3]}]};
var n=E.normalizeData(o);eq('normalize',[n.projects[0].mx,n.projects[0].session.steps,n.notes[0].date,n.terms[0]],[[['a','b']],[{p:['__alku'],d:[]},{p:['a'],d:[]}],'',{id:'t',name:'x',yes:['a'],no:[]}]);
eq('väärä appi',E.normalizeData({app:'muu'}),null);
eq('aikaleima',E.stamp(new Date(2026,9,20,21,5).toISOString()),'20.10.2026 klo 21.05');

// ehdot: kaikki tarvitaan (taaksepäin opetettu)
var q={text:'A\nB\nC\nX\n>Viesti: hei',rules:{'__alku':{o:['a','b','c'],x:[]},'a':{o:['c'],x:[]}},mx:[]},qt=E.parseText(q.text);
E.setNeedMode(q,qt,'x',true);E.toggleNeed(q,'x','a');E.toggleNeed(q,'x','b');E.setNeedMode(q,qt,'viesti',true);E.toggleNeed(q,'viesti','a');E.toggleNeed(q,'viesti','b');
var Q=E.newSession(q,'x');E.commitStep(q,Q,{p:['a'],d:[]});eq('yksi syy ei riitä',E.sessionView(q,Q).opts,['c']);
Q=E.newSession(q,'x');E.commitStep(q,Q,{p:['a','b'],d:[]});var qv=E.sessionView(q,Q);eq('kaikki syyt: tulee',qv.opts,['c','x']);eq('ilmoitus ehdolla',qv.texts,['viesti']);
Q=E.newSession(q,'x');E.commitStep(q,Q,{p:['a'],d:[]});E.commitStep(q,Q,{p:['c'],d:[]});eq('aiempi valinta ei vielä riitä',E.sessionView(q,Q).opts,[]);
var q2={text:'A\nB\nX',rules:{'__alku':{o:['a'],x:[]},'a':{o:['b'],x:[]}},mx:[]};E.setNeedMode(q2,E.parseText(q2.text),'x',true);E.toggleNeed(q2,'x','a');E.toggleNeed(q2,'x','b');
Q=E.newSession(q2,'x');E.commitStep(q2,Q,{p:['a'],d:[]});E.commitStep(q2,Q,{p:['b'],d:[]});eq('kierroksen muisti laskee',E.sessionView(q2,Q).opts,['x']);
q.rules.b={o:[],x:['x']};Q=E.newSession(q,'x');E.commitStep(q,Q,{p:['a','b'],d:[]});eq('poissulku voittaa ehdon',E.sessionView(q,Q).opts,['c']);delete q.rules.b;
E.setNeedMode(q,qt,'x',false);eq('kaikki -> yksi riittää',[E.needOf(q,'x'),E.ruleState(q,'a','x'),E.ruleState(q,'b','x')],[[],'o','o']);
E.setNeedMode(q,qt,'x',true);eq('yksi -> kaikki',[E.needOf(q,'x'),E.ruleState(q,'a','x')],[['a','b'],'']);
E.renameKey(q,'a','aa');eq('nimen vaihto ehdossa',E.needOf(q,'x'),['aa','b']);E.removeKey(q,'b');eq('poisto ehdosta',E.needOf(q,'x'),['aa']);
eq('ehdot tallessa',E.normalizeData({app:'paatospuu',projektit:[{id:'p',name:'n',text:'',need:{x:['a'],y:[]}}]}).projects[0].need,{x:['a']});

// vaihe 1: termiosumien kohdat, ma–su vain muun osan vieressä, klo 14.
var th=E.termHits([{id:'e',name:'Eläimet',yes:['koir'],no:[]},{id:'k',name:'Kala',yes:[],no:['lelu']}],'Kaksi koirien, Eläimet! ja kotikoira.');
eq('termiosumat sanoina',th.map(function(h){return h.id+':'+h.s+'-'+h.e;}),['e:6-13','e:15-22','e:27-36']);
eq('poissuljettu ei osu',E.termHits([{id:'k',name:'Kala',yes:[],no:['lelu']}],'kala ja lelu'),[]);
var B=new Date(2026,9,21);
eq('pe yksin ei tunnistu',E.parseDates('Menen pe kauppaan',B).length,0);
var pd=E.parseDates('pe klo13-16',B);eq('pe klo13-16',[pd.length,pd[0]&&pd[0].R,pd[0]&&pd[0].time],[1,['2026-10-23','2026-10-23'],{s:'13:00',e:'16:00'}]);
pd=E.parseDates('vk43 ti',B);eq('vk43 ti',[pd.length,pd[0]&&pd[0].a],[1,'2026-10-20']);
pd=E.parseDates('ma ti',B);eq('kaksi lyhennettä yksin ei',pd.length,0);
pd=E.parseDates('Tavataan klo 14.',B);eq('klo 14. lauseen lopussa',pd.length&&pd[0].time,{s:'14:00',e:''});
pd=E.parseDates('Tavataan klo14.',B);eq('klo14.',pd.length&&pd[0].time,{s:'14:00',e:''});

// vaihe 2: lyhyt nimi, arvojärjestys, kehä, hoidettavat
eq('lyhyt nimi ei termi',E.noteTerms(E.autoTerms([{name:'x',text:'Ui\nUinti'}],{},[]),'Kävin uimassa uinti'),['a:uinti']);
var o={text:'A\nB\nC\nD',rules:{},mx:[]},ot=E.parseText(o.text);
eq('rivijärjestys',E.priorityList(o,ot,['d','b','a']),['a','b','d']);
E.toggleOrder(o,'c','a');E.toggleOrder(o,'b','c');eq('järjestys voittaa rivin',E.priorityList(o,ot,['a','b','c','d']),['b','c','a','d']);
eq('kehä hylätään',E.toggleOrder(o,'a','b'),['a','b','c','a']);eq('kehä ei tallennu',E.orderOf(o,'a'),[]);
o.need={d:['a']};eq('ehto mukana kehässä',E.cycleIf(o,'d','b'),['d','b','c','a','d']);
eq('ehto nostaa vaaditun',E.priorityList(o,ot,['d','a']),['a','d']);
var hp={text:'Kunnossa\nA\nB\nC',rules:{},mx:[],need:{b:['c']},order:{a:['b']},end:'hoid'},HS=E.newSession(hp,'x');E.commitStep(hp,HS,{p:['kunnossa'],d:[]});
eq('hoidettavat',E.hoidettavat(hp,HS),[{id:'a',jotta:[]},{id:'c',jotta:['b']},{id:'b',jotta:[]}]);
eq('hoidettavat muistiinpanossa',E.sessionNote(hp,HS,'').split('\n').slice(2),['Kunnossa: Kunnossa','Hoidettavat: 1. A, 2. C (jotta B), 3. B']);
eq('järjestys tallessa',E.normalizeData({app:'paatospuu',projektit:[{id:'p',name:'n',text:'',order:{a:['b']},end:'hoid'}]}).projects[0].order,{a:['b']});

// vaihe 3: muisti
var mp={text:'A\nB\nC\nD',rules:{'__alku':{o:['a','b'],x:[]},'a':{o:['c'],x:[]},'c':{o:['d'],x:[]}},mx:[]},MS=E.newSession(mp,'x');
E.commitStep(mp,MS,{p:['a'],d:[]});E.commitStep(mp,MS,{p:['c'],d:[]});eq('vain seuraava',E.sessionView(mp,MS).opts,['d']);
mp.mem='all';eq('kaikki mukana',E.sessionView(mp,MS).opts,['a','b','c','d']);
eq('kaikki mukana: valitut valmiina',E.sessionView(mp,MS).picked,['a','c']);
MS.steps[1].d=[];MS.steps.push({p:['d'],d:['a']});eq('purettu avaaja vie sen avaamat (C:n valinta jää voimaan)',E.sessionView(mp,MS).opts,['a','b','d']);
eq('muisti tallessa',E.normalizeData({app:'paatospuu',projektit:[{id:'p',name:'n',text:'',mem:'all'}]}).projects[0].mem,'all');

// vaihe 4: termilohkot
var tx='Koira\n=Koira:\nhauva\n!pehmo\n\nKissa\n=Eläimet: lemmik\nkoir\n\n\n=Koira:\nrakki';
eq('lohkon rivit eivät ole palikoita',E.parseText(tx).items.map(function(i){return i.id;}),['koira','kissa']);
eq('rivien lajit',E.lineKinds(tx).map(function(l){return l.k;}),['','xh','xw','xn','','','xh','xw','','','xh','xw']);
var bt=E.blockTerms([{name:'P',text:tx}]);eq('lohkot yhteen',[bt['koira'].yes,bt['koira'].no,bt['eläimet'].yes],[['hauva','rakki'],['pehmo'],['lemmik','koir']]);
var at2=E.autoTerms([{name:'P',text:tx}],{},[]);eq('uusi termi lohkosta',at2.map(function(t){return t.id+'/'+t.kind;}),['a:koira/b','a:kissa/b','x:eläimet/x']);
eq('lohkosana osuu',E.noteTerms(at2,'Hauvan kanssa ulos'),['a:koira']);eq('lohkon poissulku',E.noteTerms(at2,'hauva ja pehmolelu'),[]);
eq('lohko omaan termiin',E.noteTerms(E.withText([{id:'t',name:'Eläimet',yes:[],no:[]}],[{name:'P',text:tx}]),'koirat'),['t']);

// apukysymykset muistiinpanossa
var qt=E.autoTerms([{name:'P',text:'?Lemmikki: Onko lemmikki kotona?\nKissa'}],{},[]);
eq('nouseva kysymys',E.popTerms(qt,'Lemmikki pääsi ulos').map(function(t){return t.ask;}),['Onko lemmikki kotona?']);
eq('ei osumaa',E.popTerms(qt,'Kissa söi'),[]);
var nt=E.setAnswer('Muistiinpano','Onko?','Kyllä');eq('vastaus lisätään',nt,'Muistiinpano\n\n▸ Onko?\nKyllä');
eq('vastaus luetaan',E.getAnswer(nt,'Onko?'),'Kyllä');
eq('vastaus päivittyy',E.setAnswer(nt,'Onko?','Ei\nehkä'),'Muistiinpano\n\n▸ Onko?\nEi\nehkä');
var n2=E.setAnswer(nt,'Toinen?','Joo');eq('kaksi osiota',E.getAnswer(n2,'Toinen?')+'|'+E.getAnswer(n2,'Onko?'),'Joo|Kyllä');
eq('tyhjä poistaa',E.setAnswer(n2,'Onko?',''),'Muistiinpano\n\n▸ Toinen?\nJoo');
eq('puuttuva vastaus',E.getAnswer('Teksti','Onko?'),null);

// säännöt tekstissä (1.16)
var rt='Kissa\nKoira\nRuoka\n#Eläimet: kaikki\n\n=Alku avaa:\nKissa\nKoira\n\n=Kissa avaa: Ruoka\n\n=Koira sulkee:\nRuoka\n\n=Ruoka vaatii kaikki:\nKissa\nKoira\n\n=Kissa ennen:\nKoira\n\n=Toisensa poissulkevat:\nKissa\nKoira';
var RM=E.rulesOf(rt);
eq('lohkot eivät ole palikoita',E.parseText(rt).items.map(function(i){return i.id;}),['kissa','koira','ruoka','eläimet']);
eq('avaa ja alku',[RM.rules[E.ALKU].o,RM.rules.kissa.o],[['kissa','koira'],['ruoka']]);
eq('sulkee',RM.rules.koira.x,['ruoka']);eq('vaatii kaikki',RM.need,{ruoka:['kissa','koira']});eq('ennen',RM.order,{kissa:['koira']});eq('toisensa poissulkevat',RM.mx,[['kissa','koira']]);
eq('vaatii yhden',E.rulesOf('A\nB\nC\n\n=C vaatii yhden:\nA\nB').rules,{a:{o:['c'],x:[]},b:{o:['c'],x:[]}});
eq('ryhmä merkillä',E.rulesOf('#G: x\nA\n\n=Alku avaa:\n#G').rules[E.ALKU].o,['g']);
var RP={text:rt};E.rulesFromText(RP);eq('ilman muutosta teksti ei muutu',E.rulesToText(RP).text,rt);eq('kirjoitus ja luku samat',E.canonR(E.rulesOf(E.writeRules(rt,RP))),E.canonR(RP));
E.toggleRule(RP,'kissa','koira','o');E.rulesToText(RP);eq('napautus lohkoon paikallaan',RP.text.indexOf('=Kissa avaa: Ruoka')<0&&RP.text.indexOf('=Kissa avaa:\nRuoka\nKoira\n\n=Koira sulkee:')>0,true);
E.toggleRule(RP,'ruoka','kissa','x');E.rulesToText(RP);eq('uusi lohko loppuun',RP.text.slice(-22),'\n\n=Ruoka sulkee:\nKissa');
E.toggleRule(RP,'koira','ruoka','x');E.rulesToText(RP);eq('tyhjä lohko poistuu',RP.text.indexOf('Koira sulkee')<0&&RP.text.indexOf('\n\n\n')<0,true);
eq('kierros tekstin säännöillä',(function(){var P2={text:rt};E.rulesFromText(P2);var S=E.newSession(P2,'x');return E.sessionView(P2,S).opts;})(),['kissa','koira']);
var rp1={text:'A\nB\n\n=C vaatii yhden:\nA'};E.rulesFromText(rp1);rp1.text='A\nB\nC\n\n=C vaatii yhden:\nA';E.toggleRule(rp1,'b','c','o');E.rulesToText(rp1);eq('vaatii yhden pysyy muodossaan',rp1.text,'A\nB\nC\n\n=C vaatii yhden:\nA\nB');
var rp2={text:'A\nB\nC'};E.rulesFromText(rp2);E.setNeedMode(rp2,E.parseText(rp2.text),'c',true);E.rulesToText(rp2);eq('kaikki tarvitaan ilman syitä',rp2.text,'A\nB\nC\n\n=C vaatii kaikki:');
E.toggleNeed(rp2,'c','a');E.rulesToText(rp2);eq('syy lisätään',rp2.text,'A\nB\nC\n\n=C vaatii kaikki:\nA');eq('luetaan takaisin',E.rulesOf(rp2.text).need,{c:['a']});
eq('nimen vaihto tekstissä',E.renameInText('Kissa\n\n=Kissa avaa: Koira\n\n=Alku avaa:\nKissa\n\n=Kissa:\nmirri','kissa','Mirri'),'Kissa\n\n=Mirri avaa: Koira\n\n=Alku avaa:\nMirri\n\n=Mirri:\nmirri');
eq('kirjoittaessa vaihto',E.renameLive('Kissa\nKoira\n\n=Alku avaa:\nKissa','Kissat\nKoira\n\n=Alku avaa:\nKissa'),'Kissat\nKoira\n\n=Alku avaa:\nKissat');
eq('ei vaihtoa jos nimi on jo',E.renameLive('Kissa\nKoira\n\n=Alku avaa:\nKissa','Koira\nKoira\n\n=Alku avaa:\nKissa'),null);
eq('ei vaihtoa uudella rivillä',E.renameLive('Kissa\n','Kissa\nK'),null);
var old={app:'paatospuu',ver:1,projektit:[{id:'p1',name:'P',text:'Kissa\nKoira',rules:{__alku:{o:['kissa'],x:[]},kissa:{o:['koira'],x:[]}},mx:[]}]};
var nd=E.normalizeData(old);eq('vanha tallennus tekstiin',nd.projects[0].text,'Kissa\nKoira\n\n=Alku avaa:\nKissa\n\n=Kissa avaa:\nKoira');eq('rt',nd.projects[0].rt,1);
var nd2=E.normalizeData({app:'paatospuu',ver:1,projektit:[{id:'p1',name:'P',rt:1,text:'Kissa\nKoira\n\n=Kissa avaa: Koira',rules:{}}]});eq('uusi tallennus tekstistä',nd2.projects[0].rules,{kissa:{o:['koira'],x:[]}});
eq('termilohko ei sääntö',E.blocksOf(rt).length,0);
// termit tekstinä
var D={terms:[{id:'t1',name:'Eläin',yes:['koir'],no:['pehmo']}],words:{kissa:{yes:['mirri'],no:[]},apu:{yes:[],no:[],pop:false}}};
var tt=E.termsToText(D.terms,D.words,{kissa:'Kissa'});eq('termit tekstiksi',tt,'=Eläin:\nkoir\n!pehmo\n\n=Kissa:\nmirri');
E.termsFromText('=Eläin:\nkoir\nhauva\n\n=Kissa:\nmirri\n!leijona\n\n=Uusi:\nsana',D,{kissa:'Kissa',koira:'Koira'});
eq('oma termi päivittyy',D.terms[0].yes,['koir','hauva']);eq('palikan sanat',D.words.kissa,{yes:['mirri'],no:['leijona']});eq('pop säilyy',D.words.apu,{yes:[],no:[],pop:false});
eq('uusi termi',D.terms.length===2&&D.terms[1].name==='Uusi'&&D.terms[1].yes[0]==='sana',true);
E.termsFromText('=Uusi:\nsana',D,{kissa:'Kissa'});eq('puuttuva lohko tyhjentää',[D.terms[0].yes,D.words.kissa],[[],undefined]);

// kalenteri (1.17)
var cn=[{id:'a',created:'2026-10-20T08:00:00Z',text:'Palaveri 22.10.2026 klo 14–15.30\nmuuta',date:''},{id:'b',created:'2026-10-20T08:00:00Z',text:'Soita 22.10.2026 klo 14.30.',date:''},
  {id:'c',created:'2026-10-20T08:00:00Z',text:'Ajaton',date:'2026-10-22'},{id:'d',created:'2026-10-20T08:00:00Z',text:'Kentästä',date:'2026-10-22',time:{s:'09:00',e:''}}];
var de=E.dayEntries(cn,'2026-10-22');
eq('aikajanalla',de.timed.map(function(x){return [x.n.id,x.s,x.e,x.col,x.cols];}),[['d',540,600,0,1],['a',840,930,0,2],['b',870,930,1,2]]);
eq('ajattomat',de.untimed.map(function(x){return x.n.id;}),['c']);
E.moveEntry(de.timed[1],900,990,false);eq('siirto tekstiin',cn[0].text,'Palaveri 22.10.2026 klo 15–16.30\nmuuta');
E.moveEntry(de.timed[2],885,945,true);eq('avoin pysyy, piste säilyy',cn[1].text,'Soita 22.10.2026 klo 14.45.');
E.moveEntry(de.timed[0],600,660,false);eq('siirto kenttään',cn[3].time,{s:'10:00',e:'11:00'});
eq('kenttä ei korvaa tekstin aikaa',E.noteDates({text:'klo 8',created:'2026-10-20T08:00:00Z',time:{s:'09:00',e:''}})[0].time.s,'08:00');
eq('normalisointi säilyttää ajan',E.normalizeData({app:'paatospuu',muistiinpanot:[{id:'x',text:'t',time:{s:'09:15',e:'bad'}}]}).notes[0].time,{s:'09:15',e:''});

// tärkeysjärjestys, aikatermit, roskakori (1.18)
var TD='2026-10-21',mk=function(t,c){return {id:t,created:c||'2026-10-01T08:00:00Z',edited:c||'2026-10-01T08:00:00Z',text:t,date:''};};
eq('aikatermit',['Asia 21.10.2026','Asia 22.10.2026','Asia 24.10.2026','Asia 1.11.2026','Asia 5.10.2026','Ei aikaa'].map(function(t){return E.timeTermOf(mk(t),TD);}),['z:today','z:tomorrow','z:week',null,'z:late',null]);
eq('täysi järjestys',E.fullOrder(['c','x','a'],['a','b','c']),['c','a','b']);
eq('siirto järjestyksessä',E.moveInOrder(['c','a'],['a','b','c'],'b',-1),['c','b','a']);eq('reunalla ei siirry',E.moveInOrder([],['a','b'],'a',-1),['a','b']);
var pn=[mk('x','2026-10-02T08:00:00Z'),mk('y','2026-10-03T08:00:00Z'),mk('z','2026-10-04T08:00:00Z'),mk('w','2026-10-05T08:00:00Z')],rk={x:2,y:0,z:Infinity,w:Infinity};
eq('tärkeysjärjestys, osumattomat loppuun uusin ensin',E.prioSort(pn,function(n){return rk[n.id];},TD).map(function(n){return n.id;}),['y','x','w','z']);
eq('roskakori 30 pv',E.purgeTrash([{deleted:'2026-09-01T00:00:00Z'},{deleted:'2026-10-01T00:00:00Z'}],new Date('2026-10-21T00:00:00Z').getTime()).length,1);
var nd3=E.normalizeData({app:'paatospuu',muistiinpanot:[{id:'a',text:'t',done:'2026-10-21T10:00:00Z'}],roskakori:[{id:'b',text:'u',deleted:'2026-10-21T10:00:00Z'},{id:'c',text:'v'}],jarjestys:['z:late',3],tarkeat:['z:late',3,'a:x','z:late']});
eq('kuittaus, roskakori ja tärkeät tallessa',[nd3.notes[0].done,nd3.trash.map(function(n){return n.id;}),nd3.imp,nd3.order],['2026-10-21T10:00:00Z',['b'],['z:late','a:x'],undefined]);

// merkitykset, kääntöpuolet, tärkeät ja etenevä kierros (1.19)
eq('kuitattu ei päivässä',E.notesOnDay([{id:'a',text:'Asia 21.10.2026',created:'2026-10-01T08:00:00Z'},{id:'b',text:'Asia 21.10.2026',created:'2026-10-01T08:00:00Z',done:'x'}],'2026-10-21').map(function(n){return n.id;}),['a']);
var MT='#Turvallisuus: Turvallisuus on varmistettu\n#Allianssi: Allianssi on kunnossa\nAjantasainen turvasuunnitelma\nKriisikontaktit sovittu\nAllianssi vanhemman kanssa\nAllianssi lapsen kanssa\n\n=Turvallisuus vaatii kaikki:\nAjantasainen turvasuunnitelma\nKriisikontaktit sovittu\n\n=Allianssi vaatii kaikki:\nAllianssi vanhemman kanssa\nAllianssi lapsen kanssa\n\n=Ajantasainen turvasuunnitelma kääntöpuoli:\nTurvasuunnitelma puuttuu\n\n=Turvallisuus kääntöpuoli:\nTurvallisuutta ei ole varmistettu';
var MP={id:'m',name:'Testi',text:MT,rt:1};E.rulesFromText(MP);
eq('kääntöpuoli luettu',MP.flip,{'ajantasainen turvasuunnitelma':['Turvasuunnitelma puuttuu'],turvallisuus:['Turvallisuutta ei ole varmistettu']});
eq('kääntöpuoli ei ole sääntö',[MP.rules,E.parseText(MT).items.length],[{},6]);
eq('kääntöpuoli: rulesToText ei muuta',E.rulesToText(JSON.parse(JSON.stringify(MP))).text,MT);
var MP2=JSON.parse(JSON.stringify(MP));MP2.flip={'kriisikontaktit sovittu':['Kriisikontaktit puuttuvat']};MP2.text=E.writeRules(MT,MP2);eq('kääntöpuolen kirjoitus',E.rulesOf(MP2.text).flip,{'kriisikontaktit sovittu':['Kriisikontaktit puuttuvat']});
eq('nimen vaihto ei koske kääntöpuolen tekstiä',E.renameInText('A\n\n=A kääntöpuoli:\nA puuttuu\nA','a','B'),'A\n\n=B kääntöpuoli:\nA puuttuu\nA');
var MS=E.newSession(MP,'x');eq('Alku ei avaa merkitystä',E.sessionView(MP,MS).opts.length,4);
E.commitStep(MP,MS,{p:['kriisikontaktit sovittu','allianssi vanhemman kanssa','allianssi lapsen kanssa'],d:[]});
eq('täyttynyt merkitys ryhmänä, Puuttuu',E.sessionNote(MP,MS).split('\n').slice(2),['Ryhmät: Allianssi','Puuttuu:','Turvallisuutta ei ole varmistettu','Turvasuunnitelma puuttuu']);
MP.flow='prio';var PS=E.newSession(MP,'x'),pv=E.sessionView(MP,PS);eq('etenevä: ensin tärkein merkitys',[pv.cur,pv.opts],['turvallisuus',['ajantasainen turvasuunnitelma','kriisikontaktit sovittu']]);
E.commitStep(MP,PS,{p:['kriisikontaktit sovittu'],d:[]});pv=E.sessionView(MP,PS);eq('etenevä: seuraava merkitys',[pv.cur,pv.opts],['allianssi',['allianssi vanhemman kanssa','allianssi lapsen kanssa']]);
E.commitStep(MP,PS,{p:['allianssi vanhemman kanssa','allianssi lapsen kanssa'],d:[]});
eq('etenevä: muistiinpano kuten dokumentissa',E.sessionNote(MP,PS).split('\n').slice(1),['Valinnat: Kriisikontaktit sovittu → Allianssi vanhemman kanssa, Allianssi lapsen kanssa','Ryhmät: Allianssi','Puuttuu:','Turvallisuutta ei ole varmistettu','Turvasuunnitelma puuttuu']);
var PS2=E.newSession(MP,'x');eq('ohitus: Jatka ilman valintaa',[E.commitStep(MP,PS2,{p:[],d:[]}),E.sessionView(MP,PS2).cur,PS2.steps[1]],[true,'allianssi',{p:[],d:[],m:'turvallisuus'}]);
eq('ohitus ei tyhjää polkuun',E.sessionNote(MP,PS2).indexOf('Valinnat')<0,true);
eq('ohitettu kirjaa kääntöpuolet',E.flipMissing(MP,PS2),['Turvallisuutta ei ole varmistettu','Turvasuunnitelma puuttuu']);
var BP={id:'b',name:'B',text:'A\nB\n\n=Alku avaa:\nA\n\n=A avaa:\nB\n\n=B kääntöpuoli:\nB puuttuu',rt:1};E.rulesFromText(BP);var BS=E.newSession(BP,'x');
eq('ei kääntöpuolta haarasta, jossa ei käyty',E.flipMissing(BP,BS),[]);E.commitStep(BP,BS,{p:['a'],d:[]});eq('tarjolla ollut, valitsematta',E.flipMissing(BP,BS),['B puuttuu']);
eq('valittu ei kirjaa kääntöpuolta',(E.commitStep(BP,BS,{p:['b'],d:[]}),E.flipMissing(BP,BS)),[]);
eq('askeleen merkitys tallessa',E.normalizeData({app:'paatospuu',projektit:[{id:'p',name:'n',text:'A',rt:1,flow:'prio',session:{start:'x',steps:[{p:['__alku'],d:[]},{p:[],d:[],m:'a'},{p:[],d:[]}]}}]}).projects[0].session.steps,[{p:['__alku'],d:[]},{p:[],d:[],m:'a'}]);
eq('eteneminen tallessa',E.normalizeData({app:'paatospuu',projektit:[{id:'p',name:'n',text:'A',rt:1,flow:'prio'}]}).projects[0].flow,'prio');
var AT2=E.autoTerms([MP],{},[]);eq('kääntöpuoli on termi',AT2.filter(function(t){return t.kind==='k';}).map(function(t){return t.id;}),['k:turvasuunnitelma puuttuu','k:turvallisuutta ei ole varmistettu']);
var RK=E.impRanks(['a:turvallisuus','a:allianssi'],AT2,[MP]);
eq('perintä: ehto, kääntöpuoli ja ehdon kääntöpuoli',[RK['a:turvallisuus'],RK['a:kriisikontaktit sovittu'],RK['k:turvasuunnitelma puuttuu'],RK['k:turvallisuutta ei ole varmistettu'],RK['a:allianssi lapsen kanssa'],RK['a:x']],[0,0,0,0,1,undefined]);
RK=E.impRanks(['a:turvallisuus','a:kriisikontaktit sovittu'].reverse(),AT2,[MP]);eq('oma merkintä voittaa',[RK['a:kriisikontaktit sovittu'],RK['a:turvallisuus'],RK['a:ajantasainen turvasuunnitelma']],[0,1,1]);
RK=E.impRanks(['a:allianssi','a:turvallisuus','a:kriisikontaktit sovittu'],AT2,[MP]);eq('oma merkintä voittaa myös alempana',RK['a:kriisikontaktit sovittu'],2);
var IT='A\n#G: ryhmä\nB\nC\nD\n\n=G avaa:\nC\nD\n\n=Alku avaa:\nA\nB\nG\n\n=Tärkeät:\nG\nB';var IP={id:'i',name:'I',text:IT,rt:1};E.rulesFromText(IP);
eq('tärkeät tekstistä',IP.imp,['g','b']);eq('tärkeät ensin puun järjestyksessä',E.priorityList(IP,E.parseText(IT),['a','b','c','d','g']),['g','b','a','c','d']);
IP.imp=['b'];E.rulesToText(IP);eq('tärkeät kirjoitetaan tekstiin',/=Tärkeät:\nB$/.test(IP.text),true);IP.imp=[];E.rulesToText(IP);eq('tyhjä tärkeät-lohko poistuu',IP.text.indexOf('Tärkeät')<0,true);
eq('nimen vaihto tärkeissä',E.renameInText(IT,'b','Bee').split('\n').slice(-1)[0],'Bee');
IP.text=IT;E.rulesFromText(IP);IP.flow='prio';var IS=E.newSession(IP,'x'),iv=E.sessionView(IP,IS);eq('tärkeä ryhmä: jäsenet ensin',[iv.cur,iv.opts],['g',['c','d']]);
E.commitStep(IP,IS,{p:['c'],d:[]});iv=E.sessionView(IP,IS);eq('sitten tähdellä merkitty nappula',[iv.cur,iv.opts],['b',['b']]);
E.commitStep(IP,IS,{p:[],d:[]});iv=E.sessionView(IP,IS);eq('lopuksi Alun avaamat säännöin',[iv.cur,iv.opts],[null,['a','b','c','d']]);
// projektit ja puut (vaihe 10)
var V1={app:'paatospuu',ver:1,cur:'p',projektit:[{id:'p',name:'Puu',text:'A',rt:1}],muistiinpanot:[{id:'n',text:'x'}],termit:[{id:'t',name:'T'}],tarkeat:['t'],cfg:{mode:'dark'}},N1=E.normalizeData(V1);
eq('versio 1 yhdeksi projektiksi',[N1.K.length,N1.K[0].name,N1.k,N1.projects[0].id,N1.notes.length,N1.terms.length,N1.imp,N1.cfg.mode],[1,'Projekti','k1','p',1,1,['t'],'dark']);
var V2={app:'paatospuu',ver:2,kcur:'b',kokonaisuudet:[{id:'a',name:'Oma',puut:[{id:'p',name:'Puu',text:'A',rt:1}],muistiinpanot:[{id:'n',text:'x'}]},{id:'b',name:'Mätsik Forest',cur:'q',puut:[{id:'q',name:'Arvio',text:'B',rt:1,flow:'prio'},{id:'r',name:'Toinen',text:'C',rt:1}],muistiinpanot:[],termit:[{id:'u',name:'U'}]},{id:'a',name:'tupla'}]};
var N2=E.normalizeData(V2);eq('versio 2: projektit ja aktiivinen',[N2.K.map(function(k){return k.name;}),N2.k,N2.cur,N2.projects.map(function(P){return P.id;}),N2.notes.length,N2.terms[0].id,N2.projects[0].flow],[['Oma','Mätsik Forest'],'b','q',['q','r'],0,'u','prio']);
eq('tuntematon kcur: ensimmäinen',E.normalizeData({app:'paatospuu',kokonaisuudet:[{id:'a',name:'A'}],kcur:'x'}).k,'a');
// toistuvat (vaihe 11)
eq('yksiköt',[E.addUnit('2026-01-31',1,'m'),E.addUnit('2026-10-21',2,'w'),E.addUnit('2024-02-29',1,'y'),E.addUnit('2026-12-30',3,'d')],['2026-02-28','2026-11-04','2025-02-28','2027-01-02']);
var RM={id:'m',text:'Kk',mode:'every',n:1,unit:'m',start:'2026-01-31'};var mm=E.repsDue([RM],[],'2026-04-30','t');eq('kuukausi ei valu',[mm[0].date,E.repNext(RM)],['2026-04-30','2026-05-31']);
var RE={id:'a',text:'Tarkista',mode:'every',n:3,unit:'d',start:'2026-10-10'},m1=E.repsDue([RE],[],'2026-10-21','t');
eq('tasavälein: vain viimeisin myöhästynyt',[m1.length,m1[0].date,m1[0].rep,m1[0].text],[1,'2026-10-19','a','Tarkista']);
eq('ei uutta, kun edellinen auki',E.repsDue([RE],m1,'2026-10-25','t').length,0);m1[0].done='x';eq('seuraava kuittauksen jälkeen',E.repsDue([RE],m1,'2026-10-25','t')[0].date,'2026-10-25');
var RA={id:'b',text:'Y',mode:'after',n:5,unit:'d',start:'2026-10-21'},m2=E.repsDue([RA],[],'2026-10-21','t');eq('kuittauksesta: ensimmäinen aloituspäivänä',m2[0].date,'2026-10-21');
m2[0].done='x';eq('odottaa kuittauspäivää',E.repsDue([RA],m2,'2026-10-30','t').length,0);E.repSignOff([RA],m2[0],'2026-10-22');
eq('kuittauksesta laskettuna',[E.repsDue([RA],m2,'2026-10-26','t').length,E.repsDue([RA],m2,'2026-10-27','t')[0].date],[0,'2026-10-27']);
eq('nimet',[E.repLabel({mode:'every',n:1,unit:'w'}),E.repLabel({mode:'every',n:2,unit:'d'}),E.repLabel({mode:'after',n:5,unit:'d'}),E.repLabel({mode:'after',n:1,unit:'m'})],['Joka viikko','2 päivää välein','5 päivää kuittauksesta','1 kuukausi kuittauksesta']);
var NR=E.normalizeData({app:'paatospuu',kokonaisuudet:[{id:'a',name:'A',toistuvat:[{id:'r',text:'X',mode:'after',n:'5',unit:'w',start:'2026-10-21',lastDone:'2026-10-22'},{id:'s',text:'Y'}],muistiinpanot:[{id:'n',text:'X',rep:'r'}]}]});
eq('toistuvat tallessa',[NR.reps.length,NR.reps[0].n,NR.reps[0].mode,NR.reps[0].lastDone,NR.notes[0].rep],[1,5,'after','2026-10-22','r']);
eq('raahaus kohtaan',[E.moveToIdx(['a','b','c'],'c',0),E.moveToIdx(['a','b','c'],'a',2),E.moveToIdx(['a','b','c'],'b',1)],[['c','a','b'],['b','c','a'],['a','b','c']]);

console.log(ok+' ok, '+bad+' virhettä');process.exit(bad?1:0);
