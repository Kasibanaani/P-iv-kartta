'use strict';
// Juuri 1.99 (Emil 29.10.2026): listarivi poimii tekstit nimellä tai asiasanoilla; kuittaus on tekstin oma; toistuva voittaa; uusiutuminen asiasanalla.
const A=require('assert'),E=require('./engine');
const T='2026-10-30',now=new Date('2026-10-30T10:00:00+02:00'),c='2026-10-20T08:00:00.000Z',at='2026-10-30T08:00:00.000Z';
const terms=[{id:'k',name:'Koira',yes:['koir'],no:[]},{id:'l',name:'Lääkäri',yes:['lääkär'],no:['ei lääkäriä']}];
const termsOf=N=>E.partTerms(terms,N.text);
const note=(id,text,x)=>Object.assign({id,created:c,edited:c,text,date:''},x||{});
let notes=[note('a','Vie koira ulos\n---\nOsta maitoa'),note('b','Soita lääkärille\n---\nTiskikone vuotaa'),note('c','Tiskikone: suodatin'),note('d','Koiran rokotus',{arch:at}),note('e','Ei lääkäriä tarvita')];
let row={id:'r',name:'Tiskikone',px:{n:1,t:['k']}};
let P=E.rowPicks(row,notes,termsOf,T,now,{},{k:0});
A.deepEqual(P.map(x=>x.nid+':'+x.pi),['a:0','b:1','c:0']);A(P.every(x=>x.st==='open'));A.deepEqual(P[0].ids,['k']);
// Poissulkeva sana estää, arkistoitu ei näy, rivin oma teksti ei näy
row={id:'r2',name:'X',nid:'c',px:{t:['l']}};A.deepEqual(E.rowPicks(row,notes,termsOf,T,now,{},{}).map(x=>x.nid),['b']);
// Kuittaus on tekstin oma: tänään kuitattu näkyy kuitattuna, aiemmin kuitattu ei näy
E.txSet(notes[0],0,true,at,T);P=E.rowPicks({name:'',px:{t:['k']}},notes,termsOf,T,now,{},{});A.equal(P[0].st,'done');A(!notes[0].done);
P=E.rowPicks({name:'',px:{t:['k']}},notes,termsOf,'2026-10-31',new Date('2026-10-31T10:00:00+02:00'),{},{});A.equal(P.length,0);
// Uusiutuminen asiasanan säännöllä: kuitattu teksti avautuu listalla, Muistiossa pysyy kuitattuna
P=E.rowPicks({name:'',px:{t:['k']}},notes,termsOf,'2026-11-07',new Date('2026-11-07T10:00:00+02:00'),{k:{ev:7,wd:[],md:[]}},{});A.equal(P[0].st,'open');A(E.partAt(notes[0],0,'2026-11-07'));
// Toistuva voittaa: yksi kohde, avoinna oleva kerta; kuittaus kuittaa sen kerran
let N=note('s','Koira trimmaukseen perjantaisin klo 8 31.12.26 asti, lisäksi 4.11. klo 9');P=E.rowPicks({name:'',px:{t:['k']}},[N],termsOf,T,now,{},{});
A.equal(P.length,1);A.equal(P[0].st,'open');A.equal(P[0].key,'2026-10-30 08:00');E.txSet(N,0,true,at,T);P=E.rowPicks({name:'',px:{t:['k']}},[N],termsOf,T,now,{},{});A.equal(P[0].st,'done');
P=E.rowPicks({name:'',px:{t:['k']}},[N],termsOf,'2026-11-02',new Date('2026-11-02T10:00:00+02:00'),{},{});A.equal(P[0].st,'wait');A.equal(P[0].next,'2026-11-06');
// Tärkeysjärjestys: tärkeimmän osuvan asiasanan mukaan
notes=[note('x','Koira ja lääkäri'),note('y','Lääkäri yksin'),note('z','Koira yksin')];
P=E.rowPicks({name:'',px:{t:['k','l']}},notes,termsOf,T,now,{},{l:0,k:1});A.deepEqual(P.map(x=>x.nid),['x','y','z']);
// Tallennus säilyttää px:n
const S={id:'k',name:'K',notes:[],terms:[],words:{},projects:[],reps:[],imp:[],trash:[],chk:[{id:'r',name:'Tiskikone',it:[],px:{n:1,t:['k']}}],grp:[],lists:[],ehdot:[]};
A.deepEqual(E.projectsFromFile(JSON.parse(JSON.stringify(E.projectFile(S,at))),T)[0].chk[0].px,{n:1,t:['k']});
console.log('1.99: poiminta nimellä ja asiasanoilla, poissulku, arkisto, tekstin kuittaus, uusiutuminen, toistuva, järjestys ja vienti OK');
