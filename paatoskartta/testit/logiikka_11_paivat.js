const {dayRecord,dayStats,cleanDays,repair,dropOption,normalize,parseTreeText,setRel,setRec,settle}=require('./pt.js');
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
// ma, ti (vaihtoehtoiset) | P ehto pullonkaula | dkt | valm (vaatii dkt, dkt suosittelee) | hoito (ma suosittelee) | sali
function T0(){const T={id:'t1',name:'x',oseq:9,opts:[],suf:{},req:{},rec:{},close:{},days:{},sel:[]};
  [['ma'],['ti'],['P',1,1],['dkt'],['valm'],['hoito'],['sali']].forEach(a=>{const o={id:a[0],n:a[0],note:''};if(a[1])o.c='any';if(a[2])o.b=true;T.opts.push(o);});
  setRel(T,'P','ma','rs');setRel(T,'P','ti','rs');setRel(T,'ma','ti','close');setRel(T,'valm','dkt','rr');setRec(T,'dkt','valm',true);setRec(T,'ma','hoito',true);return T;}
let T=T0();
eq('tilannekuva: maanantai + dkt',dayRecord(T,['ma','dkt']),{s:['ma','dkt'],p:['ti','valm','hoito','sali'],r:['valm','hoito'],c:['P'],u:[]});
eq('vaihtoehtoinen päivä on mahdollinen, vaikka toinen valittiin; valm ei mahdollinen ilman dkt:tä',dayRecord(T,['ti']),{s:['ti'],p:['ma','dkt','hoito','sali'],r:[],c:['P'],u:[]});
eq('valittu suositeltu näkyy suositelluissa',dayRecord(T,['ma','hoito']).r,['hoito']);
eq('ilman päivää pullonkaulan takana mikään ei ole mahdollista',dayRecord(T,[]),{s:[],p:['ma','ti'],r:[],c:[],u:['P']});
// viisi päivää
T.days={'2026-10-05':dayRecord(T,['ma','hoito']),'2026-10-06':dayRecord(T,['ti','dkt','valm']),'2026-10-07':dayRecord(T,['ti']),'2026-10-12':dayRecord(T,['ma','dkt']),'2026-10-13':dayRecord(T,['ti','dkt','valm','sali'])};
let S=dayStats(T,null,null);
eq('jakso',[S.days,S.first,S.last],[5,'2026-10-05','2026-10-13']);
eq('ma: mahdollinen aina, valittu 2/5',S.items.ma,{poss:5,sel:2,rec:0,recSel:0,seen:0,met:0});
eq('valm: mahdollinen vain dkt-päivinä (3), valittu 2, suositeltu 3, valittu suositeltuna 2',S.items.valm,{poss:3,sel:2,rec:3,recSel:2,seen:0,met:0});
eq('hoito: mahdollinen 5, valittu 1; suositeltu vain maanantaisin 2, valittu suositeltuna 1',S.items.hoito,{poss:5,sel:1,rec:2,recSel:1,seen:0,met:0});
eq('ehto: olemassa 5, täyttyi 5',S.items.P,{poss:0,sel:0,rec:0,recSel:0,seen:5,met:5});
eq('jakson rajaus',[dayStats(T,'2026-10-07',null).days,dayStats(T,'2026-10-07','2026-10-12').items.ma.sel,dayStats(T,'2027-01-01',null).days],[3,1,0]);
// myöhemmin lisätty tekijä ei saa vanhoilta päiviltä "ei valittu" -merkintöjä
T.opts.push({id:'uusi',n:'uusi',note:''});S=dayStats(T,null,null);eq('uusi tekijä: ei aiempia päiviä',S.items.uusi,{poss:0,sel:0,rec:0,recSel:0,seen:0,met:0});
T.days['2026-10-14']=dayRecord(T,['ma']);eq('uusi tekijä alkaa kertyä lisäyksen jälkeen',dayStats(T,null,null).items.uusi.poss,1);
// sääntömuutos ei muuta vanhoja päiviä
setRec(T,'ma','hoito',false);eq('vanha suositus säilyy historiassa',dayStats(T,null,null).items.hoito.rec,3);
// poisto ja siivous
dropOption(T,'hoito');eq('poistettu tekijä katoaa kirjauksista, päivä säilyy',[T.days['2026-10-05'],Object.keys(T.days).length],[{s:['ma'],p:['ti','dkt','sali'],r:[],c:['P'],u:[]},6]);
dropOption(T,'ma');eq('päivä, jolta kaikki valinnat poistuivat, poistuu',[Object.keys(T.days).sort(),T.days['2026-10-12'].s],[['2026-10-06','2026-10-07','2026-10-12','2026-10-13'],['dkt']]);
let X={id:'t',name:'x',oseq:2,opts:[{id:'o1',n:'a'},{id:'o2',n:'E',c:'any'}],suf:{},req:{},rec:{},close:{},sel:[],days:{'2026-01-01':{s:['o1','o2','zz','o1'],p:'x',r:['o2'],c:['o1','o2']},'roska':{s:['o1']},'2026-01-02':{s:[]},'2026-01-03':null}};
eq('siivous: väärät tunnukset, lajit ja päivämäärät',[cleanDays(X),X.days,cleanDays(X)],[true,{'2026-01-01':{s:['o1'],p:[],r:[],c:['o2'],u:[]}},false]);
// vanha tallennus ilman päiviä ja vienti/tuonti
let old={id:'t1',name:'x',oseq:1,opts:[{id:'o1',n:'a'}],suf:{},req:{},rec:{},close:{},sel:['o1']};eq('korjaus lisää päiväkentän',[repair(old),old.days],[true,{}]);
const n=normalize({app:'paatoskartta',version:7,trees:[{id:'t1',name:'A',options:[{id:'o1',name:'a'},{id:'o2',name:'b'}],sufs:{},reqs:{},recs:{},closes:{},days:{'2026-10-10':{s:['o1'],p:['o2','o9'],r:[],c:[],u:[]}},sel:[]}]}).trees[0];
eq('tuonti: päivät mukana ja siivottuina',n.days,{'2026-10-10':{s:['o1'],p:['o2'],r:[],c:[],u:[]}});
eq('vanha varmuuskopio ilman päiviä',normalize({app:'paatoskartta',version:6,trees:[{id:'t1',name:'A',options:[{id:'o1',name:'a'}],sel:['o1']}]}).trees[0].days,{});
eq('tekstinä tuotu puu saa tyhjän päiväkirjan',parseTreeText('{"paatoskartta":"puu","nimi":"x","tekijat":["a"]}').tree.days,{});
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');
if(!ok)process.exit(1);
