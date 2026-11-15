// Yksinkertainen puu (T.simple) ja uusi vaihtoehto edellisen perään (addNext).
const P=require('./pt.js');
const {evaluate,settle,unreachable,repair,dayRecord,parseTreeText,treeToText,normalize,addNext,setRec}=P;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function tree(){return {id:'t1',name:'T',simple:true,oseq:5,opts:[
  {id:'o1',n:'Kotona',note:''},{id:'o2',n:'Ulkona',note:''},{id:'o3',n:'Elokuva',note:''},{id:'o4',n:'Lenkki',note:''},
  {id:'o5',n:'Ehto',note:'',c:'any'}],
  suf:{o3:['o1'],o5:['o1']},req:{o4:['o2']},rec:{o1:['o3'],o2:['o4','o3']},close:{o1:['o2'],o2:['o1']},sel:[]};}
const st=(T,sel)=>{const e=evaluate(T,sel);return T.opts.map(o=>o.id+':'+e[o.id].s+(e[o.id].rec?'*'+e[o.id].recBy.length:''));};
let T=tree();
eq('alussa kaikki vaihtoehdot auki, ehto ei vaikuta',st(T,[]),['o1:open','o2:open','o3:open','o4:open','o5:cond']);
eq('valinta korostaa suositellut',st(T,['o1']),['o1:sel','o2:open','o3:open*1','o4:open','o5:cond']);
eq('kaksi suosittelijaa lasketaan',st(T,['o1','o2']),['o1:sel','o2:sel','o3:open*2','o4:open*1','o5:cond']);
eq('poissulku ei vaikuta: molemmat pysyvät',settle(T,['o1','o2']),{sel:['o1','o2'],removed:[]});
eq('ehto ja tuplat siivotaan',settle(T,['o1','o5','o1']).sel,['o1']);
eq('kaikki saavutettavia',unreachable(T),[]);
eq('päiväkirjaus',dayRecord(T,['o2']),{s:['o2'],p:['o1','o3','o4'],r:['o3','o4'],c:[],u:[]});
const M=tree();delete M.simple;
eq('monipuolisena samat säännöt toimivat ennallaan',st(M,['o2']).slice(0,4),['o1:excl','o2:sel','o3:lock*1','o4:open*1']);
// addNext
T=tree();let r=addNext(T,'  Sauna  ','o4');
eq('uusi seuraava lenkin perään',[r.opt.n,T.opts.map(o=>o.id).join(','),T.rec.o4,T.suf[r.opt.id]],['Sauna','o1,o2,o3,o4,o6,o5',[r.opt.id],undefined]);
eq('sama nimi torjutaan',addNext(T,'sauna','o1'),{err:'dup'});
eq('tyhjä torjutaan',addNext(T,'  ','o1'),{err:'empty'});
r=addNext(T,'Kirja','o1');
eq('kotona-haaran viimeisen (Elokuva) perään',T.opts.map(o=>o.n).slice(0,4),['Kotona','Ulkona','Elokuva','Kirja']);
r=addNext(T,'Ilman edellistä',null);
eq('ilman edellistä listan loppuun',T.opts[T.opts.length-1].n,'Ilman edellistä');
const F=tree();delete F.simple;r=addNext(F,'Kahvila','o2');
eq('monipuolisessa uusi tulee näkyviin ja korostuu',[F.suf[r.opt.id],evaluate(F,['o2'])[r.opt.id].s,evaluate(F,['o2'])[r.opt.id].rec,evaluate(F,[])[r.opt.id].s],[['o2'],'open',true,'lock']);
eq('tunnus ei törmää olemassa olevaan',addNext({id:'t',name:'x',oseq:0,opts:[{id:'o3',n:'A',note:''}],suf:{},req:{},rec:{},close:{},sel:[]},'B',null).opt.id,'o4');
// tallennus ja tekstimuoto
const N=normalize({app:'paatoskartta',version:9,trees:[{id:'t1',name:'Y',simple:true,options:[{id:'o1',name:'A',note:''},{id:'o2',name:'B',note:''}],sufs:{},reqs:{},recs:{o1:['o2']},closes:{},days:{},sel:[]},{id:'t2',name:'M',options:[{id:'o1',name:'A',note:''}]}]});
eq('tiedostosta simple säilyy, vanhassa ei ole',[N.trees[0].simple,N.trees[1].simple],[true,undefined]);
let x={id:'t',name:'x',simple:'joo',opts:[],suf:{},req:{},rec:{},close:{},sel:[]};repair(x);
eq('väärä simple-arvo poistuu',x.simple,undefined);
let p=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'Ilta',yksinkertainen:true,tekijat:[{nimi:'Kotona'},{nimi:'Elokuva',suosittelijat:['Kotona']}]}));
eq('tekstinä tuotu yksinkertainen',[p.ok,p.tree.simple,p.warnings,p.tree.rec],[true,true,[],{o1:['o2']}]);
eq('tekstiksi ja takaisin',JSON.parse(treeToText(p.tree)).yksinkertainen,true);
p=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'Ilta',yksinkertainen:true,tekijat:[{nimi:'A'},{nimi:'B',vaatii:['A']}]}));
eq('ylimääräisistä säännöistä huomautus',p.warnings.length,1);
eq('monipuolisen tekstissä ei kenttää',JSON.parse(treeToText(M)).yksinkertainen,undefined);
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');process.exit(ok?0:1);
