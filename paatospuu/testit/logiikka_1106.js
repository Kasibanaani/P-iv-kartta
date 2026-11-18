'use strict';
// Juuri 1.106 (Emil 18.11.2026): päivän napit (ennuste, myös kahden tekijän yhdistelmä suhteessa kolmanteen) ja yksinkertainen Päätöspuu.
const A=require('assert'),E=require('./engine');
// Tallennusmuoto
let v=E.pvNorm({napit:['a','b','a',3],alkaen:{a:'2026-10-01',b:'huono'},paivat:{'2026-10-02':['a','a'],'x':['a'],'2026-10-03':[]}});
A.deepEqual(v,{on:['a','b'],c:{a:'2026-10-01'},d:{'2026-10-02':['a']}});
A.equal(E.pvOut({on:[],c:{},d:{}}),undefined);A.deepEqual(E.pvNorm(E.pvOut(v)),v);A.deepEqual(E.pvNorm(null),{on:[],c:{},d:{}});
A.equal(E.pvWd('2026-11-16'),'w:0');A.equal(E.pvWd('2026-11-22'),'w:6');
// Liian vähän päiviä
v={on:['a','b','c'],c:{},d:{'2026-10-01':['a'],'2026-10-02':['b']}};A.equal(E.pvP(v,'2026-11-18',[],'a'),null);
// Valinta ja poisto
E.pvToggle(v,'2026-11-18','a');A.deepEqual(v.d['2026-11-18'],['a']);E.pvToggle(v,'2026-11-18','a');A.ok(!v.d['2026-11-18']);
E.pvSet(v,'d',true,'2026-11-18');A.equal(v.c.d,'2026-11-18');A.ok(v.on.indexOf('d')>=0);E.pvSet(v,'d',false,'2026-11-18');A.ok(v.on.indexOf('d')<0);
// Yhdistelmä: c toteutuu vain, kun a JA b ovat molemmat (ei kummankaan kanssa yksin). 40 päivää, viikonpäivät vaihtelevat.
v={on:['a','b','c','x'],c:{},d:{}};
const d0=new Date(2026,6,1);
for(let i=0;i<48;i++){const dt=new Date(d0.getTime()+i*864e5),iso=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  const k=i%4,L=['x'];if(k===0)L.push('a','b','c');else if(k===1)L.push('a');else if(k===2)L.push('b');v.d[iso]=L;}
const day='2026-11-18',pab=E.pvP(v,day,['a','b'],'c'),pa=E.pvP(v,day,['a'],'c'),pb=E.pvP(v,day,['b'],'c'),p0=E.pvP(v,day,[],'c');
A.ok(pab>0.7,'a+b nostaa c:n: '+pab);A.ok(pa<0.6&&pb<0.6,'yksin ei: '+pa+' '+pb);A.ok(pab>pa+0.2&&pab>pb+0.2);A.ok(p0>0.1&&p0<0.45,'perustaso '+p0);
// Tämän päivän valinnat eivät ole omassa laskennassaan
v.d[day]=['a','b'];A.equal(E.pvP(v,day,['a','b'],'c'),pab);delete v.d[day];
// Nuoli
const L=E.pvLift(v,day,['a','b'],'c');A.equal(L.dir,1);A.equal(E.pvLift(v,day,[],'c').dir,0);
// Alkamispäivä: ennen sitä olevat päivät eivät ole mukana
v.c.c='2026-11-01';A.equal(E.pvP(v,day,['a','b'],'c'),null);
// Päätöspuu
let T=E.stNorm([{id:'s1',name:' Aamu ',f:[{id:'f1',n:'Herätys'},{id:'f2',n:'Kahvi'},{id:'f3',n:'Tee'},{id:'f4',n:'Lähde'},{id:'f1',n:'tupla'}],a:['f1','zz'],to:{f1:['f2','f3','f1'],f2:['f4'],f3:['f4'],zz:['f1']},e:['f4'],p:['f1','f9']},{id:'s1'},null]);
A.equal(T.length,1);const t=T[0];A.equal(t.name,'Aamu');A.equal(t.f.length,4);A.deepEqual(t.a,['f1']);A.deepEqual(t.to,{f1:['f2','f3'],f2:['f4'],f3:['f4']});A.deepEqual(t.p,['f1']);
A.deepEqual(E.stNext(t,[]),['f1']);A.deepEqual(E.stNext(t,['f1']),['f2','f3']);A.deepEqual(E.stNext(t,['f1','f2']),['f4']);
A.ok(!E.stDone(t,['f1','f2']));A.ok(E.stDone(t,['f1','f2','f4']));A.deepEqual(E.stNext(t,['f1','f2','f4']),[]);
t.p=['f1','f2','f4'];E.stDel(t,'f2');A.deepEqual(t.to,{f1:['f3'],f3:['f4']});A.deepEqual(t.p,['f1']);A.equal(t.f.length,3);
E.stDel(t,'f1');A.deepEqual(t.a,[]);A.deepEqual(t.p,[]);
console.log('logiikka_1106 ok');
