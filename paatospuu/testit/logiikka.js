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

// nimen vaihto ja poisto
p=P('A\nB');t(p,A,'a');t(p,'a','b');p.mx=[['a','b']];E.renameKey(p,'b','bee');eq('rename',[p.rules.a.o,p.mx],[['bee'],[['a','bee']]]);
E.removeKey(p,'bee');eq('remove',[p.rules.a,p.mx],[undefined,[]]);
p=P('A');t(p,'a','zz');eq('orvot',E.orphans(p),['zz']);E.dropOrphans(p);eq('orvot pois',E.orphans(p),[]);

// termit
var term={id:'t1',name:'eläin',yes:['kissa','koira'],no:['lelu']};
eq('kyllä',E.termOn(term,'Kissan ruoka loppui'),true);eq('nimi alusta',E.termOn(term,'Eläinlääkäri ensi viikolla'),true);
eq('poissulku voittaa',E.termOn(term,'kissan lelu'),false);eq('ei osumaa sanan keskeltä',E.termOn(term,'pikkukissa'),false);

// päätöspuun rivit termeinä, kaikista projekteista, sama nimi kerran
var pr=[{name:'Eka',text:'Kova nälkä\n#Täyttävät: x\n>Muistutus: katso jääkaappi\n>Tämä on pitkä ilmoitus ilman nimeä, joten siitä ei tule termiä'},{name:'Toka',text:'kova nälkä\nUlkona'}];
var at=E.autoTerms(pr,{'täyttävät':{yes:['pasta'],no:['lelu']}},[{id:'t9',name:'Ulkona',yes:[],no:[]}]);
eq('automaattiset termit',at.map(function(t){return t.id+'/'+t.kind+'/'+t.proj;}),['a:kova nälkä/b/Eka','a:täyttävät/g/Eka','a:muistutus/t/Eka']);
eq('sana liitetty ryhmään',E.noteTerms(at,'Söin pastaa ja kova nälkä'),['a:kova nälkä','a:täyttävät']);
eq('poissulku automaattiseen',E.noteTerms(at,'pasta ja lelu'),[]);
eq('termisanat talteen',E.normalizeData({app:'paatospuu',termisanat:{'x':{yes:['a'],no:[]},'y':{yes:[],no:[]}}}).words,{x:{yes:['a'],no:[]}});

// päivämäärät, pohja ti 20.10.2026
var base=new Date(2026,9,20,21,0);function pd(s){return E.parseDates(s,base).map(function(o){return o.a===o.b?o.a:o.a+'..'+o.b;});}
eq('perjantaina',pd('Soita perjantaina'),['2026-10-23']);eq('tiistaina = tänään',pd('tiistaina'),['2026-10-20']);
eq('pvm',pd('24.10.26 ja 5.11.2026'),['2026-10-24','2026-11-05']);eq('ilman vuotta',pd('1.1. ja 25.10.'),['2026-10-25','2027-01-01']);
eq('kahden viikon sisällä',pd('kahden viikon sisällä'),['2026-10-20..2026-11-03']);eq('3 päivän päästä',pd('3 päivän päästä'),['2026-10-23']);
eq('ensi viikolla',pd('ensi viikolla'),['2026-10-26..2026-11-01']);eq('kellonaika ei',pd('klo 9.30. ja 31.2.26'),[]);
eq('huomenna',pd('huomenna'),['2026-10-21']);eq('maanantaisin ei',pd('maanantaisin'),[]);

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

console.log(ok+' ok, '+bad+' virhettä');process.exit(bad?1:0);
