const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const box={module:{exports:{}}};vm.runInNewContext(html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1],box);const E=box.module.exports;
const now=new Date('2026-10-27T10:00:00Z'),stamp='2026-10-27T09:00:00Z';
const rows=[{id:'r1',it:[{id:'a'}]},{id:'r2',it:[{id:'b'},{id:'c'}]}];
const rules=[{k:['a'],on:['b','missing'],off:[]},{k:['absent'],on:['c'],off:[]}];
function contexts(){const base=()=>({kier:1,workflow:true});const k=E.chkCond(rules,rows,base,now,{workflow:true});return r=>Object.assign(base(),k);}
let cx=contexts();assert.equal(E.chkView(rows[1],cx(rows[1]),now).length,2);assert(E.chkView(rows[1],cx(rows[1]),now).every(v=>v.base));
assert.equal(E.chkOpenN(rows[1],now,cx(rows[1])),0);assert.equal(E.chkDone(rows[1],now,cx(rows[1])),true);assert.equal(E.workflowReady(rows,now,cx),false);
rows[0].it[0].ok=stamp;cx=contexts();assert.equal(E.chkOpenN(rows[1],now,cx(rows[1])),1);assert.equal(E.workflowReady(rows,now,cx),false);assert.equal(rows[1].it.length,2);
rows[1].it[0].ok=stamp;cx=contexts();assert.equal(E.workflowReady(rows,now,cx),true);
delete rows[0].it[0].ok;cx=contexts();assert.equal(E.chkView(rows[1],cx(rows[1]),now)[0].ok,false);assert.equal(E.workflowReady(rows,now,cx),false);
rows[0].it[0].ok=stamp;cx=contexts();assert.equal(E.workflowReady(rows,now,cx),true);
const empty=[{id:'skip',it:[{id:'b'}]}];let k=E.chkCond(rules,empty,()=>({workflow:true}),now,{workflow:true});assert.equal(E.workflowReady(empty,now,()=>Object.assign({workflow:true},k)),true);
assert.equal(E.chkView(rows[1],{hid:{c:1}},now).length,1); // legacy hiding
const N=E.normalizeData({app:'paatospuu',ver:1,puut:[],muistiinpanot:[],listat:[{id:'l',name:'Test',wf:1,eh:1}]});assert.equal(N.lists[0].wf,1);
assert(E.grpHit({g:{m:['b','c'],all:1}},{b:1},{b:1}).g);
assert(!E.grpHit({g:{m:['b','c'],all:1}},{},{ }).g);
assert(!E.grpHit({g:{m:['b','c'],all:1}},{b:1},{b:1,c:1}).g);
assert(E.chkDone({id:'any',any:1,it:[{id:'a',ok:stamp},{id:'b'}]},now,{workflow:true}));
assert(!E.chkDone({id:'all',it:[{id:'a',ok:stamp},{id:'b'}]},now,{workflow:true}));
console.log('1.94: dormant / active / done, missing targets, undo, skip, legacy and persistence OK');
