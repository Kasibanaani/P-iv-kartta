const {rowState,setRow,rowCycle,setRec,setRel,relState,evaluate}=require('./pt.js');
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function T0(){const T={id:'t1',name:'x',oseq:9,opts:[],suf:{},req:{},rec:{},close:{},sel:[]};['ma','ti','hoito','dkt','valm'].forEach(id=>T.opts.push({id,n:id,note:''}));T.opts.push({id:'C',n:'C',note:'',c:'any'});return T;}
const step=(T,a,b)=>{const c=rowCycle(T,a).concat(['']);const cur=rowState(T,a,b);setRow(T,a,b,c[(c.indexOf(cur)+1)%c.length]);return rowState(T,a,b)+(T.rec[b]&&T.rec[b].indexOf(a)>=0?'*':'');};
let T=T0();
eq('vaihtoehdon kierrossa suosittelija on viimeisenä',rowCycle(T,'hoito'),['ps','pr','rs','rr','rc']);
eq('ehdon kierrossa ei ole suosittelijaa',rowCycle(T,'C'),['ps','pr','rs','rr']);
let seen=[];for(let i=0;i<7;i++)seen.push(step(T,'hoito','ti'));
eq('kierto: tähti näyttää, onko rivi suosittelija',seen,['ps','pr','rs','rr','rc*','','ps']);
T=T0();setRow(T,'hoito','ma','rc');eq('suosittelija tallentuu oikeaan suuntaan ja toimii käytössä',[T.rec.ma,rowState(T,'hoito','ma'),evaluate(T,['ma']).hoito.rec,evaluate(T,['ti']).hoito.rec],[['hoito'],'rc',true,false]);
eq('toiselta sivulta sama näkyy tähtenä, ei rivin merkintänä',rowState(T,'ma','hoito'),'');
eq('suosittelijasta seuraava on tyhjä',step(T,'hoito','ma'),'');
// tähdellä tehty yhdistelmä säilyy näkyvyystilojen välillä, suosittelija-tilan kautta, ja poistuu tyhjässä
T=T0();setRel(T,'dkt','valm','ps');setRec(T,'dkt','valm',true);
eq('yhdistelmä: riittävä ehto + suosittelija',[rowState(T,'valm','dkt'),T.rec.dkt],['rs',['valm']]);
seen=[];for(let i=0;i<4;i++)seen.push(step(T,'valm','dkt'));eq('yhdistelmän kierto',seen,['rr*','rc*','','ps']);
// suosittelijasta näkyvyystilaan siirryttäessä suositus ei jää roikkumaan
T=T0();setRow(T,'hoito','ma','rc');setRow(T,'hoito','ma','ps');eq('rc -> ps tyhjentää suosituksen',[rowState(T,'hoito','ma'),T.rec.ma],['ps',[]]);
// ehto voi olla suosittelija, mutta ehtoa ei voi suositella
T=T0();eq('ehto suosittelijana',[setRow(T,'hoito','C','rc'),T.rec.C],[true,['hoito']]);
eq('ehdolle ei voi merkitä suosittelijaa',[setRow(T,'C','ma','rc'),rowState(T,'C','ma')],[false,'']);
// poissulku
T=T0();setRow(T,'hoito','ma','rc');setRel(T,'hoito','ma','close');eq('poissulku poistaa suosittelijan',[rowState(T,'hoito','ma'),T.rec.ma],['close',[]]);
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');
if(!ok)process.exit(1);
