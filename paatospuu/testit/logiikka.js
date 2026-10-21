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
var dn=[{id:'1',created:'2026-10-01T10:00:00Z',text:'B ja G ja T',date:'2026-10-24'},{id:'2',created:'2026-10-01T10:00:00Z',text:'C',date:'2026-10-25'},{id:'3',created:new Date(2026,9,20).toISOString(),text:'D kahden viikon sisällä',date:''}];
var dterms=E.autoTerms([p],{},[]);
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
eq('ei termi',E.autoTerms([p],{},[]).map(function(t){return t.key;}),['a','b']);
// järjestys ja tavuviiva
eq('siirto alas',E.moveItem('A\n\nB\nC','a',1),'B\n\nA\nC');eq('siirto ylös reunalla',E.moveItem('A\nB','a',-1),'A\nB');
eq('tavuviiva',E.shownName('Kova-nälkä - iso'),'Kova-\nnälkä - iso');

// nimen vaihto ja poisto
p=P('A\nB');t(p,A,'a');t(p,'a','b');p.mx=[['a','b']];E.renameKey(p,'b','bee');eq('rename',[p.rules.a.o,p.mx],[['bee'],[['a','bee']]]);
E.removeKey(p,'bee');eq('remove',[p.rules.a,p.mx],[undefined,[]]);
p=P('A');t(p,'a','zz');eq('orvot',E.orphans(p),['zz']);E.dropOrphans(p);eq('orvot pois',E.orphans(p),[]);

// termit
var term={id:'t1',name:'eläin',yes:['kissa','koira'],no:['lelu']};
eq('kyllä',E.termOn(term,'Kissa: ruoka loppui'),true);eq('kokonainen sana',E.termOn(term,'Kissan ruoka loppui'),false);
eq('poissulku voittaa',E.termOn(term,'kissa, LELU'),false);eq('ei osumaa sanan keskeltä',E.termOn(term,'pikkukissa'),false);
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
eq('ensi viikolla',pd('ensi viikolla'),['2026-10-26..2026-11-01']);eq('kellonaika ei',pd('klo 9.30. ja 31.2.26'),[]);
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

console.log(ok+' ok, '+bad+' virhettä');process.exit(bad?1:0);
