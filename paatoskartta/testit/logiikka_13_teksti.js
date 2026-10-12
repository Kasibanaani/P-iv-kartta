// Teksti (o.t): luettava ruutu, jolla on vaihtoehdon näkyvyysehdot mutta jota ei valita ja joka ei voi olla minkään ehtona.
const P=require('./pt.js');
const {evaluate,settle,unreachable,repair,setKind,setRel,setRec,setRow,rowState,rowCycle,implied,dayRecord,cleanDays,dayStats,parseTreeText,treeToText,normalize,kindMap,NOTE_MAX}=P;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function tree(){return {id:'t1',name:'T',oseq:9,opts:[
  {id:'a',n:'A',note:''},{id:'b',n:'B',note:''},
  {id:'x',n:'Aina näkyvä teksti',note:'',t:true},
  {id:'y',n:'Vaatii A:n',note:'Pitkä selitys',t:true},
  {id:'z',n:'Riittää A tai B',note:'',t:true},
  {id:'e',n:'Ehto',note:'',c:'any'},
  {id:'w',n:'Ehdon takana',note:'',t:true},
  {id:'p',n:'Portti',note:'',b:true},
  {id:'v',n:'Portin takana',note:'',t:true}],
  suf:{z:['a','b'],e:['b']},req:{y:['a'],w:['e']},rec:{},close:{},sel:[]};}
const vis=(T,sel)=>T.opts.filter(o=>o.t).map(o=>o.id+(evaluate(T,sel)[o.id].vis?'+':'-')).join(' ');

// 1 näkyvyys: samat säännöt kuin vaihtoehdolla
let T=tree();repair(T);
eq('lajit',kindMap(T),{a:'',b:'',x:'t',y:'t',z:'t',e:'c',w:'t',p:'',v:'t'});
eq('tekstin tila on aina text',T.opts.filter(o=>o.t).map(o=>evaluate(T,[])[o.id].s),['text','text','text','text','text']);
eq('alussa: vain ehdoton teksti näkyy',vis(T,[]),'x+ y- z- w- v-');
eq('A valittu: vaadittu ja riittävä täyttyvät',vis(T,['a']),'x+ y+ z+ w- v-');
eq('B valittu: riittävä täyttyy, ja B täyttää näkymättömän ehdon',vis(T,['b']),'x+ y- z+ w+ v-');
eq('pullonkaula valittu: sen takana oleva teksti näkyy',vis(T,['p']),'x+ y- z- w- v+');
eq('puuttuvat ehdot kerrotaan',evaluate(T,[]).y.need,{req:['a'],suf:[],ok:false});

// 2 tekstiä ei valita
eq('settle pudottaa tekstin valinnoista',settle(T,['a','x','y']).sel,['a']);
T.sel=['a','x'];repair(T);eq('repair poistaa tekstin tallennetuista valinnoista',T.sel,['a']);
eq('teksti ei ole pullonkaula, vaikka se olisi merkitty',(()=>{const U=tree();U.opts[2].b=true;return [implied(U).y,repair(U),U.opts[2].b];})(),[[],true,undefined]);

// 3 teksti ei voi olla minkään ehtona, suosittelijana, suositeltuna eikä poissuljettuna
T=tree();repair(T);
eq('teksti ei voi riittää toiselle',setRel(T,'x','a','ps'),false);
eq('teksti ei voi olla vaadittu toiselle',setRel(T,'x','a','pr'),false);
eq('sama toisin päin: rivi teksti, sivu vaihtoehto',[setRel(T,'a','x','rs'),setRel(T,'a','x','rr')],[false,false]);
eq('ei sovi yhteen ei käy tekstille',[setRel(T,'a','x','close'),setRel(T,'x','a','close')],[false,false]);
eq('teksti ei suosittele eikä sitä suositella',[setRec(T,'x','a',true),setRec(T,'a','x',true),setRec(T,'e','x',true)],[false,false,false]);
eq('mikään ei muuttunut',[T.suf,T.req,T.rec,T.close],[{z:['a','b'],e:['b']},{y:['a'],w:['e']},{},{}]);
eq('vaihtoehto voi olla tekstin ehto: sivu vaihtoehto, rivi teksti',[setRel(T,'b','x','pr'),T.req.x,rowState(T,'b','x'),rowState(T,'x','b')],[true,['b'],'pr','rr']);
eq('ja tekstin sivulta: rivi on tekstin riittävä ehto',[setRel(T,'x','a','rs'),T.suf.x,T.req.x],[true,['a'],['b']]);
eq('näkymätön ehto voi olla tekstin ehto',[setRel(T,'x','e','rr'),T.req.x],[true,['b','e']]);
eq('kahden tekstin välille ei voi merkitä mitään',['ps','pr','rs','rr','close'].map(s=>setRel(T,'x','y',s)),[false,false,false,false,false]);

// 4 rivien kierto opetuksessa
T=tree();repair(T);
eq('tekstin sivu, vaihtoehtorivi: vain ehdot',rowCycle(T,'x','a'),['rs','rr']);
eq('tekstin sivu, ehtorivi',rowCycle(T,'x','e'),['rs','rr']);
eq('tekstin sivu, tekstirivi: ei mitään',rowCycle(T,'x','y'),[]);
eq('tekstin sivun yleinen kierto',rowCycle(T,'x'),['rs','rr']);
eq('vaihtoehdon sivu, tekstirivi',rowCycle(T,'a','x'),['ps','pr']);
eq('ehdon sivu, tekstirivi',rowCycle(T,'e','x'),['ps','pr']);
eq('vaihtoehdon sivu, vaihtoehtorivi ennallaan',rowCycle(T,'a','b'),['ps','pr','rs','rr','rc']);
eq('ehdon sivu ennallaan',[rowCycle(T,'e'),rowCycle(T,'e','a')],[['ps','pr','rs','rr'],['ps','pr','rs','rr']]);
eq('setRow: tekstiriville ei voi asettaa suosittelijaa',[setRow(T,'a','x','rc'),T.rec],[false,{}]);
eq('setRow: tekstin sivulla vaadittu ehto',[setRow(T,'x','b','rr'),T.req.x],[true,['b']]);

// 5 repair siivoaa säännöt, joissa teksti on väärässä roolissa (esimerkiksi käsin muokattu tiedosto)
T=tree();T.suf.a=['x','b'];T.req.b=['y'];T.rec={x:['a'],a:['x','b']};T.close={a:['x'],x:['a']};
eq('repair muuttaa',repair(T),true);
eq('teksti poistui muiden ehdoista, suosituksista ja poissuluista; tekstin omat ehdot säilyivät',[T.suf.a,T.req.b,T.rec,T.close,T.req.y,T.suf.z],[['b'],[],{a:['b']},{a:[]},['a'],['a','b']]);

// 6 lajin vaihto
T=tree();repair(T);setRel(T,'a','b','ps');setRec(T,'a','b',true);setRel(T,'a','p','close');T.req.a=['b'];
setKind(T,'a','t');
eq('vaihtoehto tekstiksi: ei enää ehtona, suosittelijana eikä poissuljettuna',[kindMap(T).a,T.suf.b,T.req.y,T.suf.z,T.rec.a,T.close],['t',[],[],['b'],undefined,{p:[]}]);
eq('  omat ehdot säilyvät',T.req.a,['b']);
setKind(T,'a','');eq('takaisin vaihtoehdoksi',[kindMap(T).a,T.opts[0].t],['',undefined]);
setKind(T,'p','t');eq('pullonkaula tekstiksi: pullonkaula poistuu',[T.opts.find(o=>o.id==='p').b,implied(T).v],[undefined,[]]);
setKind(T,'e','t');eq('ehto tekstiksi: ei enää toisen tekstin ehtona, omat ehdot säilyvät',[kindMap(T).e,T.req.w,T.suf.e],['t',[],['b']]);
setKind(T,'x',true);eq('vanha kutsutapa: tosi = näkymätön ehto',[kindMap(T).x,T.opts.find(o=>o.id==='x').t],['c',undefined]);
setKind(T,'x',false);eq('vanha kutsutapa: epätosi = vaihtoehto',kindMap(T).x,'');

// 7 päiväkirjaus ja seuranta: tekstiä ei kirjata
T=tree();repair(T);
eq('päivän tilannekuvassa ei ole tekstejä',dayRecord(T,['a']),{s:['a'],p:['b','p'],r:[],c:[],u:['e']});
T.days={'2026-10-01':{s:['a','x'],p:['y','b'],r:['z'],c:[],u:['e']},'2026-10-02':{s:['x'],p:[],r:[],c:[],u:[]}};
eq('cleanDays poistaa tekstit kirjauksista ja tyhjäksi jääneen päivän',[cleanDays(T),T.days],[true,{'2026-10-01':{s:['a'],p:['b'],r:[],c:[],u:['e']}}]);
eq('seurannassa tekstillä ei ole lukuja',dayStats(T).items.x,{poss:0,sel:0,rec:0,recSel:0,seen:0,met:0});

// 8 saavutettavuus
T=tree();repair(T);eq('kaikki saavutettavissa',unreachable(T),[]);
T.close={a:['b'],b:['a']};T.req.y=['a','b'];eq('teksti, jonka vaaditut eivät sovi yhteen, ei voi näkyä',unreachable(T),['y']);

// 9 tekstimuoto tekoälylle
let r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'Tekstit',tekijat:[
  {nimi:'Aamu'},{nimi:'Ilta'},
  {nimi:'Aamun ohje',teksti:'  Juo vettä.\nAvaa ikkuna.  ',vaatii:['Aamu']},
  {nimi:'Lyhyt',teksti:''},
  {nimi:'Tosi',teksti:true,riittaa:['Aamu','Ilta']},
  {nimi:'Ei teksti',teksti:false}]}));
eq('teksti-kenttä tekee tekstin, sisältö siistitään',[r.ok,r.warnings,r.stats,r.tree.opts.map(o=>[o.n,!!o.t,o.note])],
  [true,[],{o:3,e:0,t:3,b:0,r:3,c:0},[['Aamu',false,''],['Ilta',false,''],['Aamun ohje',true,'Juo vettä.\nAvaa ikkuna.'],['Lyhyt',true,''],['Tosi',true,''],['Ei teksti',false,'']]]);
eq('ehdot tulevat mukaan',[r.tree.req,r.tree.suf],[{o3:['o1']},{o5:['o1','o2']}]);
const txt=treeToText(r.tree),back=JSON.parse(txt);
eq('kopioitu teksti: teksti-kenttä aina merkkijonona, ei huomiota',back.tekijat.slice(2,5),[{nimi:'Aamun ohje',teksti:'Juo vettä.\nAvaa ikkuna.',vaatii:['Aamu']},{nimi:'Lyhyt',teksti:''},{nimi:'Tosi',teksti:'',riittaa:['Aamu','Ilta']}]);
const r2=parseTreeText(txt);eq('edestakaisin sama puu',[r2.ok,r2.warnings,JSON.stringify([r2.tree.opts,r2.tree.suf,r2.tree.req])===JSON.stringify([r.tree.opts,r.tree.suf,r.tree.req])],[true,[],true]);
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'V',tekijat:[
  {nimi:'A',vaatii:['Ohje'],suosittelijat:['Ohje']},{nimi:'B',riittaa:['Ohje']},
  {nimi:'Ohje',teksti:'x',nakymaton:true,pullonkaula:true,suosittelijat:['A'],vaatii:['A']},
  {nimi:'Toinen',teksti:'y',vaatii:['Ohje']}],ei_sovi_yhteen:[['A','B','Ohje']]}));
eq('huomautukset tekstin vääristä rooleista',[r.ok,r.warnings.map(w=>w.replace(/\. .*$/,'.').slice(0,62))],[true,[
  '”Ohje” on teksti, joten se ei voi olla näkymätön ehto.',
  '”Ohje” on teksti, joten se ei voi olla pullonkaula.',
  '”A”: kohdassa vaatii on teksti ”Ohje”.',
  '”A”: kohdassa suosittelijat on teksti ”Ohje”.',
  '”B”: kohdassa riittaa on teksti ”Ohje”.',
  '”Ohje” on teksti, eikä sitä voi suositella.',
  '”Toinen”: kohdassa vaatii on teksti ”Ohje”.',
  '”Ohje” on teksti, eikä sitä voi merkitä yhteensopimattomaksi.']]);
eq('  jäljelle jäi vain kelvollinen',[r.tree.req,r.tree.suf,r.tree.rec,r.tree.close,r.tree.opts.map(o=>[!!o.t,!!o.c,!!o.b])],[{o3:['o1']},{},{},{o1:['o2'],o2:['o1']},[[false,false,false],[false,false,false],[true,false,false],[true,false,false]]]);
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'P',tekijat:[{nimi:'A'},{nimi:'B'},{nimi:'T',teksti:'t',vaatii:['A','B']}],ei_sovi_yhteen:[['A','B']]}));
eq('teksti, joka ei voi näkyä, saa oman huomautuksensa',r.warnings,['Nämä tekstit eivät voi tulla näkyviin millään valinnoilla: T.']);
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'Vain teksti',tekijat:[{nimi:'T',teksti:'t'}]}));
eq('pelkkä teksti: huomautus, ettei puuta voi aloittaa',r.warnings,['Alussa ei näy yhtään vaihtoehtoa, joten puuta ei voi aloittaa.']);
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'Pitkä',tekijat:[{nimi:'T',teksti:'ä'.repeat(NOTE_MAX+50)},{nimi:'A',huomio:'h'.repeat(NOTE_MAX+50)}]}));
eq('tekstin ja huomion enimmäispituus',[NOTE_MAX,r.tree.opts[0].note.length,r.tree.opts[1].note.length],[5000,5000,5000]);

// 10 varmuuskopio: laji säilyy, ja vanha tiedosto ilman tekstejä toimii ennallaan
let n=normalize({app:'paatoskartta',version:8,trees:[{id:'t1',name:'N',options:[
  {id:'o1',name:'A',note:''},{id:'o2',name:'Ohje',note:'Sisältö',text:true,cond:'any',bottleneck:true},{id:'o3',name:'B',note:''}],
  sufs:{o2:['o1'],o3:['o2']},reqs:{},recs:{o2:['o3'],o1:['o2']},closes:{o1:['o2'],o2:['o1']},days:{'2026-10-01':{s:['o1','o2'],p:[],r:[],c:[],u:[]}},sel:['o2','o1']}]});
T=n.trees[0];
eq('teksti tuodaan tekstinä ilman ehdon tai pullonkaulan merkkiä',T.opts.map(o=>[o.id,!!o.t,o.c,o.b,o.note]),[['o1',false,undefined,undefined,''],['o2',true,undefined,undefined,'Sisältö'],['o3',false,undefined,undefined,'']]);
eq('  väärät säännöt ja valinnat siivottu',[T.suf,T.rec,T.close,T.sel,T.days],[{o2:['o1'],o3:[]},{o1:[]},{o1:[]},['o1'],{'2026-10-01':{s:['o1'],p:[],r:[],c:[],u:[]}}]);
n=normalize({app:'paatoskartta',version:7,trees:[{id:'t1',name:'Vanha',options:[{id:'o1',name:'A',note:''},{id:'o2',name:'E',note:'',cond:'any',bottleneck:true}],sufs:{o2:['o1']},reqs:{},recs:{},closes:{},days:{},sel:[]}]});
eq('version 7 tiedosto ennallaan',n.trees[0].opts.map(o=>[o.id,o.t,o.c,o.b]),[['o1',undefined,undefined,undefined],['o2',undefined,'any',true]]);

console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');process.exit(ok?0:1);
