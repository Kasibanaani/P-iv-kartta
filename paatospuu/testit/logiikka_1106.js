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
// 1.109 Flow: 1.106-muodon muunnos ruutupareiksi
let T=E.stNorm([{id:'s1',name:' Aamu ',f:[{id:'f1',n:'Herätys'},{id:'f2',n:'Kahvi'},{id:'f3',n:'Tee'},{id:'f4',n:'Lähde'},{id:'f1',n:'tupla'}],a:['f1','zz'],to:{f1:['f2','f3','f1'],f2:['f4'],f3:['f4'],zz:['f1']},e:['f4'],p:['f1','f9']},{id:'s1'},null]);
A.equal(T.length,1);const t=T[0];A.equal(t.name,'Aamu');A.equal(t.f.length,4);
A.deepEqual(t.r.map(x=>[x.ty,x.c,x.e]),[['a',['f1'],[]],['tai',['f1'],['f2','f3']],['tai',['f2'],['f4']],['tai',['f3'],['f4']],['end',['f4'],[]]]);A.deepEqual(t.p,['f1']);
A.deepEqual(E.stVis(t,[]).vis,['f1']);A.deepEqual(E.stVis(t,['f1']).vis,['f1','f2','f3']);A.deepEqual(E.stVis(t,['f1','f2']).vis,['f1','f2','f3','f4']);
A.ok(!E.stDone(t,['f1','f2']));A.ok(E.stDone(t,['f1','f2','f4']));
// peruminen: Kahvin peruminen piilottaa Lähteen (Tee ei valittu) ja pudottaa sen valinnan
A.deepEqual(E.stPick(t,['f1','f2','f4'],'f2'),['f1']);A.deepEqual(E.stPick(t,['f1','f2','f3','f4'],'f2'),['f1','f3','f4']);
// Ja, Poissulkevat (voittaa), Lopetus
const u=E.stNorm([{id:'u',name:'K',f:[{id:'a',n:'A'},{id:'b',n:'B'},{id:'c',n:'C'},{id:'d',n:'D'}],r:[{id:'r0',ty:'a',e:['a','b']},{id:'r1',ty:'ja',c:['a','b'],e:['c']},{id:'r2',ty:'x',c:['a','b'],e:['d']},{id:'r3',ty:'tai',c:['c'],e:['d']},{id:'r4',ty:'end',c:['d']}]}])[0];
A.deepEqual(u.r[0].c,['a','b']);A.deepEqual(u.r[0].e,[]);A.equal(u.r[0].lg,'tai');A.equal(u.r[4].lg,'tai');
A.deepEqual(u.r[2].e,['d']);  // 1.111: poissulkevilla voi olla seurauksia
A.deepEqual(E.stVis(u,['a']).vis,['a','d']);A.deepEqual(E.stPick(u,['a'],'b'),['b']);A.deepEqual(E.stVis(u,['b']).vis,['b','d']);
u.r[2].ty='tai';u.r[2].c=['zz'];A.deepEqual(E.stVis(u,['a','b']).vis,['a','b','c']);A.deepEqual(E.stVis(u,['a','b','c']).vis,['a','b','c','d']);A.ok(E.stDone(u,['a','b','c','d']));
A.equal(E.stPath(u,['a','b','c']),'A → B → C');A.equal(E.stItem(u,'b').id,'b');A.equal(E.stItem(u,' Uusi ').id,'f5');A.equal(u.f.length,5);
E.stDel(u,'c');A.deepEqual(u.r[1].e,[]);A.deepEqual(u.r[3].c,[]);
// 1.111: aloitus lajeineen (Pois: vain yksi; Ja: seuraukset kun kaikki), lopetus Ja
const w=E.stNorm([{id:'w',name:'W',f:[{id:'a',n:'A'},{id:'b',n:'B'},{id:'c',n:'C'}],r:[{id:'r0',ty:'a',lg:'x',c:['a','b'],e:['c']},{id:'r1',ty:'end',lg:'ja',c:['a','c']}]}])[0];
A.equal(w.r[0].lg,'x');A.deepEqual(w.r[0].c,['a','b']);A.deepEqual(E.stVis(w,[]).vis,['a','b']);A.deepEqual(E.stPick(w,['a'],'b'),['b']);A.deepEqual(E.stVis(w,['a']).vis,['a','c']);
A.ok(!E.stDone(w,['a']));A.ok(E.stDone(w,['a','c']));
w.r[0].lg='ja';A.deepEqual(E.stVis(w,['a']).vis,['a','b']);A.deepEqual(E.stVis(w,['a','b']).vis,['a','b','c']);
w.r[1].lg='tai';A.ok(E.stDone(w,['a']));
// flow-data
A.deepEqual(E.flNorm({m:{t1:'s1',t2:5},run:{'r|t1':{s:['a',1],d:'x'},bad:3}}),{m:{t1:'s1'},run:{'r|t1':{s:['a'],d:'x'}}});A.equal(E.flOut({m:{},run:{}}),undefined);
console.log('logiikka_1106 ok');
// 1.112: ylin pari on aloitus, miniotsikko, vaihtoehtojen lähde
{const E2=require('./engine.js');const z=E2.stNorm([{id:'z',name:'Z',f:[{id:'a',n:'A'},{id:'b',n:'B'},{id:'c',n:'C'}],r:[{id:'r0',ty:'a',lg:'tai',c:['a'],e:['b']},{id:'r1',ty:'x',c:['b','c'],e:['c'],h:' Otsikko '},{id:'r2',ty:'end',lg:'ja',c:['c']}]}])[0];
require('assert').equal(z.r[1].h,'Otsikko');require('assert').deepEqual(E2.stVis(z,['a']).src,{a:'',b:'r0'});
z.r=[z.r[1],z.r[0],z.r[2]];E2.stTop(z);require('assert').deepEqual(z.r.map(x=>[x.ty,x.lg]),[['a','x'],['tai',undefined],['end','ja']]);
z.r=[z.r[2],z.r[1],z.r[0]];E2.stTop(z);require('assert').deepEqual(z.r.map(x=>[x.ty,x.lg]),[['a','tai'],['tai',undefined],['x',undefined]]);console.log('logiikka 1.112 ok');}
