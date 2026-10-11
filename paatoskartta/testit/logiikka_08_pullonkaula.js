const {evaluate,settle,unreachable,normalize,condMet,setRel,setRec,implied,reqAll}=require('./pt.js');
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
// järjestys: ma, ti, P (ehto, pullonkaula), dkt, valm, B (vaihtoehto, pullonkaula), sali, ilta
function T0(){const T={id:'t1',name:'x',oseq:9,opts:[],suf:{},req:{},rec:{},close:{},sel:[]};
  [['ma'],['ti'],['P','any',1],['dkt'],['valm'],['B',0,1],['sali'],['ilta']].forEach(a=>{const o={id:a[0],n:a[0],note:''};if(a[1])o.c='any';if(a[2])o.b=true;T.opts.push(o);});
  setRel(T,'P','ma','rs');setRel(T,'P','ti','rs');setRel(T,'ma','ti','close');return T;}
const e=(T,sel)=>T.opts.filter(o=>!o.c).map(o=>{const x=evaluate(T,sel)[o.id];return o.id+':'+x.s+(x.rec?'+rec':'');}).join(' ');
let T=T0();
eq('edeltävät pullonkaulat',[implied(T).ma,implied(T).dkt,implied(T).B,implied(T).sali],[[],['P'],['P'],['P','B']]);
eq('alussa vain ennen pullonkaulaa olevat',e(T,[]),'ma:open ti:open dkt:lock valm:lock B:lock sali:lock ilta:lock');
eq('ehtopullonkaula täyttyy: seuraavat neutraaleina, toisen pullonkaulan taakse jäävät lukossa',e(T,['ma']),'ma:sel ti:excl dkt:open valm:open B:open sali:lock ilta:lock');
eq('vaihtoehtopullonkaula ei riitä näkyvänä, vaan vasta valittuna',[e(T,['ma','dkt']),e(T,['ma','B'])],['ma:sel ti:excl dkt:sel valm:open B:open sali:lock ilta:lock','ma:sel ti:excl dkt:open valm:open B:sel sali:open ilta:open']);
eq('puuttuvissa näkyy pullonkaula',evaluate(T,['ma']).sali.need,{req:['B'],suf:[],ok:false});
// omat ehdot pätevät edelleen pullonkaulan lisäksi
setRel(T,'dkt','valm','ps');setRec(T,'dkt','valm',true);
eq('oma ehto + pullonkaula',[evaluate(T,['ma']).valm.s,evaluate(T,['ma','dkt']).valm,evaluate(T,['dkt']).valm.s],['lock',{s:'open',start:false,rec:true},'lock']);
// polku: pullonkaulan poistuminen pudottaa kaiken sen jälkeisen
let r=settle(T,['ma','dkt','B','sali']);eq('kaikki täyttyy',r.sel,['ma','dkt','B','sali']);
r=settle(T,['ma','dkt','sali']);eq('B pois: sen takana oleva putoaa',[r.sel,r.removed.map(x=>x.id)],[['ma','dkt'],['sali']]);
r=settle(T,['dkt','B','sali']);eq('päivä pois: kaikki putoaa',r.sel,[]);
eq('päivän vaihto säilyttää',settle(T,['ma','dkt','B','sali','ti']).sel,['dkt','B','sali','ti']);
// järjestys ratkaisee
T=T0();const iB=T.opts.findIndex(o=>o.id==='B'),iS=T.opts.findIndex(o=>o.id==='sali');[T.opts[iB],T.opts[iS]]=[T.opts[iS],T.opts[iB]];
eq('sali siirretty B:n eteen: ei enää B:n takana',[implied(T).sali,evaluate(T,['ma']).sali.s,evaluate(T,['ma']).ilta.s],[['P'],'open','lock']);
// ei pullonkauloja: ei vaikutusta
T=T0();T.opts.forEach(o=>delete o.b);eq('ilman pullonkauloja kaikki näkyy',e(T,[]),'ma:open ti:open dkt:open valm:open B:open sali:open ilta:open');
// ehto pullonkaulan takana vaatii senkin
T=T0();T.opts.push({id:'C',n:'C',note:'',c:'any'});setRel(T,'C','sali','rs');T.opts.push({id:'x',n:'x',note:''});setRel(T,'x','C','rr');
eq('myöhempi ehto ei täyty ennen pullonkauloja',[!!condMet(T,['sali']).C,!!condMet(T,['ma','B','sali']).C,evaluate(T,['ma','B','sali']).x.s],[false,true,'open']);
// täyttäjät pullonkaulaehdon jälkeen = umpikuja, josta varoitetaan
T=T0();const iP=T.opts.findIndex(o=>o.id==='P');const P=T.opts.splice(iP,1)[0];T.opts.unshift(P);
eq('ehtopullonkaula ennen omia täyttäjiään ei voi täyttyä',[unreachable(T).length,evaluate(T,[]).ma.s],[8,'lock']);
T=T0();eq('oikeassa järjestyksessä kaikki saavutettavissa',unreachable(T),[]);
// vienti ja tuonti
const n=normalize({app:'paatoskartta',version:6,trees:[{id:'t1',name:'A',options:[{id:'o1',name:'a'},{id:'o2',name:'b',bottleneck:true},{id:'o3',name:'c'}],sufs:{},reqs:{},recs:{},closes:{},sel:['o3','o1']}]}).trees[0];
eq('tuonti: pullonkaula säilyy ja polku siivotaan',[n.opts.map(o=>!!o.b),n.sel,reqAll(n,'o3')],[[false,true,false],['o1'],['o2']]);
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');
if(!ok)process.exit(1);
