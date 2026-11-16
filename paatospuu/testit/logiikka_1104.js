'use strict';
// Juuri 1.104 (Emil 15.11.2026): Mätsik Forestin lista Juureen – Viikot (asiat viikoittain välin ja pikapäivien mukaan) ja päivä tekstiin.
const A=require('assert'),E=require('./engine');
const today='2026-11-18',now=new Date(2026,10,18,12,0,0);   // keskiviikko, vk 47
A.equal(E.monOf(today),'2026-11-16');A.equal(E.monOf('2026-11-22'),'2026-11-16');A.equal(E.monOf('2026-11-23'),'2026-11-23');
A.equal(E.wkIdx('2026-11-16','2026-11-30'),2);A.equal(E.wkIdx('2026-11-16','2026-11-10'),-1);
// rivi: a kuitattu 14.11. (7 pv → 21.11. vk 47), b kuitattu 10.11. (30 pv → 10.12. vk 50), c ei koskaan, d kuitattu tänään (14 pv → 2.12. vk 49), e kuitattu ilman väliä
const r={id:'r1',created:'2026-11-01T08:00:00',it:[{id:'a',ok:new Date(2026,10,14,9).toISOString()},{id:'b',ok:new Date(2026,10,10,9).toISOString()},{id:'c'},{id:'d',ok:new Date(2026,10,18,8).toISOString()},{id:'e',ok:new Date(2026,10,1,8).toISOString()}]};
const cx={ev:{a:{ev:7,wd:[],md:[]},b:{ev:30,wd:[],md:[]},d:{ev:14,wd:[],md:[]}},mn:[]};
let W=E.wkRow(r,cx,now,today,[],14);
A.equal(W.length,14);A.equal(W[0].mon,'2026-11-16');A.equal(W[13].mon,'2027-02-15');
const ids=k=>W[k].it.map(x=>x.id+(x.ok?'+':'')+(x.due?'@'+x.due:'')).sort().join(' ');
A.equal(ids(0),'a@2026-11-21 c d+');A.equal(W[0].n,2);A.equal(W[0].d,1);A.equal(E.wkTone(W[0],0),'red');
A.equal(ids(3),'b@2026-12-10');A.equal(E.wkTone(W[3],3),'yel');
A.equal(ids(2),'d@2026-12-02');
A.equal(ids(1),'');A.equal(E.wkTone(W[1],1),'');
// myöhässä oleva (a:n kuittaus raukesi) kuluvalle viikolle myöhässä-merkillä
const r2={id:'r2',created:'2026-11-01T08:00:00',it:[{id:'a',ok:new Date(2026,10,2,9).toISOString()}]};
W=E.wkRow(r2,cx,now,today,[],14);A.equal(W[0].it.length,1);A.equal(W[0].it[0].late,'2026-11-09');
// pikapäivät: mennyt kuittaamaton kuluvalle viikolle (myöhässä), mennyt kuitattu pois, tuleva omalle viikolleen, kuitattu kuluvalla viikolla vihreäksi
W=E.wkRow({id:'r3',created:'2026-11-01',it:[]},{ev:{},mn:[]},now,today,[{it:'p',iso:'2026-11-05',done:null,nid:'n1'},{it:'p',iso:'2026-11-04',done:'x',nid:'n1'},{it:'q',iso:'2026-12-01',done:null,nid:'n2'},{it:'s',iso:'2026-11-17',done:'2026-11-17T10:00:00Z',nid:'n3'}],14);
A.deepEqual(W[0].it.map(x=>x.k+x.id+(x.late?'!':'')+(x.ok?'+':'')),['pp!','ps+']);A.equal(W[0].n,1);A.equal(W[0].d,1);
A.deepEqual(W[2].it.map(x=>x.id),['q']);
W=E.wkRow({id:'r4',created:'2026-11-01',it:[]},{ev:{},mn:[]},now,today,[{it:'s',iso:'2026-11-17',done:'x',nid:'n3'}],14);A.equal(E.wkTone(W[0],0),'ok');
// päivä tekstiin ja pois (sama sääntö kuin muistiinpanon Päivät-valitsimessa)
const base=new Date(2026,10,15);
let t=E.dayTextToggle('Kettu Lääkkeet','2026-11-20',base);A.equal(t,'Kettu Lääkkeet 20.11.2026');
t=E.dayTextToggle(t,'2026-11-27',base);A.equal(t,'Kettu Lääkkeet 20.11.2026, 27.11.2026');
A.deepEqual(Object.keys(E.dayTextDays(t,base)).sort(),['2026-11-20','2026-11-27']);
t=E.dayTextToggle(t,'2026-11-20',base);A.equal(t,'Kettu Lääkkeet 27.11.2026');
t=E.dayTextToggle(t,'2026-11-27',base);A.equal(t.trim(),'Kettu Lääkkeet');
// tallennusmuoto: pikat ja muistiinpanon pika säilyvät, vanha muoto ilman niitä toimii
const raw={app:'paatospuu',kokonaisuudet:[{id:'k1',name:'P',termit:[{id:'t1',name:'Lääkkeet',yes:[],no:[]}],pikat:['t1','t1',3],muistiinpanot:[{id:'n1',text:'Kettu Lääkkeet 20.11.2026',created:'2026-11-15T10:00:00Z',pika:{it:'t1',r:'c1'}},{id:'n2',text:'x',pika:{r:'c1'}}]}]};
const nd=E.normalizeData(raw);A.deepEqual(nd.pk,['t1']);A.deepEqual(nd.notes[0].pika,{it:'t1',r:'c1'});A.equal(nd.notes[1].pika,undefined);
const old=E.normalizeData({app:'paatospuu',kokonaisuudet:[{id:'k1',name:'P'}]});A.deepEqual(old.pk,[]);
console.log('logiikka_1104 ok');
