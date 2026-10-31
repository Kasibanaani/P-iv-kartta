'use strict';
// Juuri 1.100 (Emil 31.10.2026): rivien järjestys huomioi rivin poimimat tekstit.
const A=require('assert'),E=require('./engine');
const T='2026-10-30',now=new Date('2026-10-30T10:00:00+02:00');
const rows=[{id:'a',name:'A',it:[]},{id:'b',name:'B',it:[]},{id:'c',name:'C',it:[]}];
const ord=pk=>E.chkSort(rows,{k:0,l:1},T,now,null,pk).map(r=>r.id);
// Ilman tekstejä alkuperäinen järjestys
A.deepEqual(ord({}),['a','b','c']);A.deepEqual(ord(),['a','b','c']);
// Avoin teksti nostaa rivin; tärkeämpi asiasana ensin
A.deepEqual(ord({c:[{st:'open',rank:1,sort:'2026-10-20'}]}),['c','a','b']);
A.deepEqual(ord({b:[{st:'open',rank:1,sort:''}],c:[{st:'open',rank:0,sort:''}]}),['c','b','a']);
// Tasatilanteessa varhaisempi päivä ensin; tänään kuitattu ei nosta
A.deepEqual(ord({b:[{st:'open',rank:0,sort:'2026-10-29'}],c:[{st:'open',rank:0,sort:'2026-10-25'}]}),['c','b','a']);
A.deepEqual(ord({c:[{st:'done',rank:0,sort:''}]}),['a','b','c']);
// Odottava toistuva: lähin seuraava päivä ensin odottavien joukossa
A.deepEqual(ord({b:[{st:'wait',rank:0,next:'2026-11-06'}],c:[{st:'wait',rank:0,next:'2026-11-02'}]}),['c','b','a']);
console.log('1.100: rivien järjestys avoimista ja odottavista teksteistä OK');
