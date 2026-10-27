'use strict';
const A=require('assert'),E=require('./engine');
const at='2026-10-27T12:00:00.000Z',later='2026-10-27T12:01:00.000Z';
function fixture(){return {terms:[{id:'job',name:'Tarkistus',wflow:'tpl',ev:7},{id:'a',name:'Alku'},{id:'b',name:'Jatko'}],words:{},projects:[],notes:[],grp:[{id:'g',name:'Vaihe',phase:1,m:['a','b'],all:1}],lists:[{id:'tpl',name:'Työnkulku',wf:1,eh:1},{id:'src',name:'Lähde',epoch:'one'}],chk:[{id:'tr',name:'Vaihe',l:'tpl',sg:'g',g:['g'],it:[{id:'a',g:1,ok:at}]},{id:'r1',l:'src',it:[{id:'job',ok:'2026-10-01T00:00:00.000Z'}]},{id:'r2',l:'src',it:[{id:'job'}]}]};}
function ctx(S){return r=>r.sg?{workflow:1,kier:1,gm:E.phaseOf(S,r.sg).m}:{ev:{job:7}};}
function start(S,id='w',r='r1'){return E.flowStart(S,'job','tpl',{r,prev:r==='r1'?'2026-10-01T00:00:00.000Z':'',epoch:'one'},id,at).list;}
function ready(S,L){S.chk.filter(r=>r.l===L.id).forEach(r=>r.it=[{id:'a',g:1,ok:at},{id:'b',g:1,ok:at}]);}
let S=fixture(),L=start(S);A(L);A.deepEqual(S.chk.find(r=>r.l==='w').it,[]);A(S.chk.find(r=>r.id==='tr').it[0].ok);
A.equal(start(S).id,'w');let L2=start(S,'w2','r2');A.equal(L2.id,'w2');A.equal(E.flowFinish(S,L,later,ctx(S),()=> 'tpl').error,'Työnkulussa on vielä kuitattavaa.');
ready(S,L);A(E.flowFinish(S,L,later,ctx(S),()=> 'tpl').credited);A.equal(S.chk.find(r=>r.id==='r1').it[0].ok,later);A(!S.chk.find(r=>r.id==='r2').it[0].ok);A(E.flowFinish(S,L,later,ctx(S),()=> 'tpl').error);
// One more cycle needs a fresh execution, retaining previous receipt until completion.
let L3=E.flowStart(S,'job','tpl',{r:'r1',prev:later,epoch:'one'},'next','2026-11-05T12:00:00Z').list;A.equal(L3.id,'next');ready(S,L3);A(E.flowFinish(S,L3,'2026-11-05T12:01:00Z',ctx(S),()=> 'tpl').credited);
// A reset, source deletion, membership removal, source deactivation or changed completion method prevents stale credit.
for(const change of [s=>s.lists.find(l=>l.id==='src').epoch='two',s=>s.chk=s.chk.filter(r=>r.id!=='r1'),s=>s.chk.find(r=>r.id==='r1').it=[],s=>{}]){
 let s=fixture(),l=start(s);ready(s,l);change(s);let c=ctx(s);if(change.toString()==='s=>{}')c=r=>r.id==='r1'?{hid:{job:1}}:ctx(s)(r);A(!E.flowFinish(s,l,later,c,()=> 'tpl').credited);
}
S=fixture();L=start(S);ready(S,L);A(!E.flowFinish(S,L,later,ctx(S),()=> 'other').credited);
// Voluntary note run never completes note or another source.
S=fixture();S.notes.push({id:'n',text:'Tarkistus'});L=E.flowStart(S,'job','tpl',{n:'n'},'vol',at).list;ready(S,L);A(!E.flowFinish(S,L,later,ctx(S),()=> 'tpl').credited);A(!S.notes[0].done);
// Nested self-reference / A -> B -> A blocked; unrelated roots can reuse a template.
S=fixture();L=start(S);let rr=S.chk.find(r=>r.l===L.id);A(E.flowStart(S,'job','tpl',{r:rr.id},'bad',at).error);
S.lists.push({id:'other',name:'Muu',wf:1});S.chk.push({id:'otherrow',l:'other',sg:'g',g:['g'],it:[]});let B=E.flowStart(S,'b','other',{r:rr.id},'B',at).list;A(B);A(E.flowStart(S,'job','tpl',{r:S.chk.find(r=>r.l===B.id).id},'bad2',at).error);
// Shared definitions live; row selection and local text frozen; template deletion doesn't prevent continuing.
S=fixture();S.notes=[{id:'n',text:'Ohje',created:at}];S.chk[0].nid='n';L=start(S);S.grp[0].m.push('job');E.phaseEnsure(S);A.equal(S.chk.find(r=>r.l===L.id).runtext,'Ohje');A.equal(S.chk.filter(r=>r.l===L.id).length,1);S.lists=S.lists.filter(l=>l.id!=='tpl');A(E.flowStart(S,'job','tpl',{},'bad',at).error);
// Backup and project import retain links, runs, epochs, local text, and receipts.
S=fixture();L=start(S);ready(S,L);E.flowFinish(S,L,later,ctx(S),()=> 'tpl');S.words={auto:{yes:[],no:[],wflow:'tpl'}};
let file=E.projectFile({...S,id:'k',name:'K',reps:[],imp:[]},at),N=E.projectsFromFile(JSON.parse(JSON.stringify(file)))[0];A.equal(N.terms[0].wflow,'tpl');A.equal(N.words.auto.wflow,'tpl');A.equal(N.lists.find(l=>l.id==='w').run.done,later);A.equal(N.lists.find(l=>l.id==='src').epoch,'one');A.equal(N.chk.find(r=>r.id==='w:0').runtext,'');
console.log('1.96: suoritusten erillisyys, jatkaminen, valmistuminen, uusinta, vanhentunut lähde, kehät ja vienti/tuonti OK');

// Completion-method changes reuse the matching new run, ignoring old unfinished runs.
S=fixture();start(S);S.lists.push({id:'other',name:'Muu',wf:1});S.chk.push({id:'otherrow',l:'other',sg:'g',g:['g'],it:[]});let src={r:'r1',prev:'2026-10-01T00:00:00.000Z',epoch:'one'};let changed=E.flowStart(S,'job','other',src,'changed',at);A.equal(E.flowStart(S,'job','other',src,'duplicate',at).list.id,changed.list.id);

// Successful nested completion credits its immediate parent, then the original source.
S=fixture();L=start(S);S.grp.push({id:'g2',name:'Alityönkulku',phase:1,m:['b'],all:1});S.lists.push({id:'sub',name:'Ali',wf:1});S.chk.push({id:'subrow',l:'sub',sg:'g2',g:['g2'],it:[]});let parentRow=S.chk.find(r=>r.l===L.id);let sub=E.flowStart(S,'a','sub',{r:parentRow.id,prev:'',epoch:''},'subrun',at).list;S.chk.find(r=>r.l===sub.id).it=[{id:'b',g:1,ok:at}];A(E.flowFinish(S,sub,later,ctx(S),()=> 'sub').credited);A(parentRow.it.some(x=>x.id==='a'&&x.ok));A(!S.chk.find(r=>r.id==='r1').it.some(x=>x.ok===later));parentRow.it.push({id:'b',g:1,ok:later});A(E.flowFinish(S,L,later,ctx(S),()=> 'tpl').credited);

// An alternative already satisfying the source row prevents crediting a superseded choice.
S=fixture();L=start(S);ready(S,L);let source=S.chk.find(r=>r.id==='r1');source.any=1;source.it.push({id:'a',ok:at});A(!E.flowFinish(S,L,later,ctx(S),()=> 'tpl').credited);
// Both tree terms and standalone term blocks retain the completion method.
let auto=E.autoTerms([{name:'Puu',text:'Nappula\n\n=Lohko:\nsana\n'}],{nappula:{wflow:'tpl'},lohko:{wflow:'tpl'}},[]);A.equal(auto.find(t=>t.id==='a:nappula').wflow,'tpl');A.equal(auto.find(t=>t.id==='x:lohko').wflow,'tpl');
