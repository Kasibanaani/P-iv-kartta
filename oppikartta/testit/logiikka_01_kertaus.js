// Kertauskierto: uudet kortit ja rajat, väärin menneen paluu, välien kasvu, lisäkierros, käänteinen suunta.
const E=require('./ok.js');const {newState,nextCard,applyAnswer,summary,cardsOf,addDays,OKKEY,CFG_DEF}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const D0='2026-10-11';
function deck(n){const G={id:'g1',name:'x',iseq:0,items:[]};for(let i=1;i<=n;i++)G.items.push({id:'i'+i,k:'m',q:'k'+i,c:'o'+i,w:['a','b','c'],ex:''});G.iseq=n;return G;}
function words(n){const G={id:'g1',name:'x',iseq:0,items:[]};for(let i=1;i<=n;i++)G.items.push({id:'i'+i,k:'s',a:'en'+i,b:'fi'+i,ex:''});G.iseq=n;return G;}
const cfg=Object.assign({},CFG_DEF);
// pelaa: fn(kortin id, laji) -> oikein?
function play(G,S,day,turns,fn,c){let last=null,log=[];for(let t=0;t<turns;t++){const nx=nextCard(G,S,c||cfg,day,last);if(!nx)break;const right=fn(nx.card.id,nx.kind,t);
    applyAnswer(S,nx.card.id,right?OKKEY:'a',right,day);log.push(nx.card.id+':'+nx.kind[0]+(right?'+':'-'));last=nx.card.id;}return log;}

// ---------- uudet kortit pelin omassa järjestyksessä, väärä palaa kolmen muun jälkeen ----------
let G=deck(30),S=newState();
let log=play(G,S,D0,8,(id,k,t)=>t!==0);
eq('väärin mennyt uusi kortti palaa, kun kolme muuta on näytetty',log,['i1:n-','i2:n+','i3:n+','i4:n+','i1:r+','i5:n+','i6:n+','i7:n+']);
eq('oikein mennyt nousee tasolle 1 ja tulee huomenna',[S.cards.i2.l,S.cards.i2.d,S.cards.i1.l,S.cards.i1.s],[1,addDays(D0,1),1,1]);
eq('historia: väärä vaihtoehto ja oikea',S.cards.i1.h,{a:1,[OKKEY]:1});

// ---------- päiväraja: uusia enintään 10, sen jälkeen lisäkierros jo opituilla ----------
G=deck(30);S=newState();log=play(G,S,D0,14,()=>true);
eq('kymmenen uutta, sitten lisäkierros vanhimmasta alkaen',log.slice(8),['i9:n+','i10:n+','i1:e+','i2:e+','i3:e+','i4:e+']);
eq('lisäkierroksen oikea vastaus ei muuta tasoa eikä päivää',[S.cards.i1.l,S.cards.i1.d,S.nd],[1,addDays(D0,1),10]);
eq('yhteenveto: nähty 10, ei kertattavaa, uusia ei enää tänään',summary(G,S,cfg,D0),{total:30,seen:10,due:0,open:10,learned:0,newLeft:0});
log=play(G,S,D0,2,()=>false);
eq('lisäkierroksen väärä vastaus palauttaa kortin tasolle 0',[log,S.cards.i5.l,S.cards.i5.d],[['i5:e-','i6:e-'],0,D0]);

// ---------- seuraava päivä: vuorossa olevat ensin, välit kasvavat 1, 3, 7, 16, 35 ----------
G=deck(3);S=newState();play(G,S,D0,3,()=>true);
let day=addDays(D0,1);
eq('huomenna kaikki kolme vuorossa',summary(G,S,cfg,day).due,3);
log=play(G,S,day,3,()=>true);eq('vuorossa olevat tulevat lajilla due',log,['i1:d+','i2:d+','i3:d+']);
eq('taso 2 = kolmen päivän päästä',[S.cards.i1.l,S.cards.i1.d],[2,addDays(day,3)]);
let steps=[];day=S.cards.i1.d;for(let k=0;k<5;k++){play(G,S,day,3,()=>true);steps.push(E.dayDiff(day,S.cards.i1.d));day=S.cards.i1.d;}
eq('välit kasvavat ja pysähtyvät 35 päivään',steps,[7,16,35,35,35]);
play(G,S,day,1,()=>false);eq('väärä vastaus palauttaa pitkänkin välin kortin alkuun',[S.cards.i1.l,S.cards.i1.s],[0,0]);
eq('unohtamistilasto kirjautuu välin mukaan',[S.gaps['1'],S.gaps['3'],S.gaps['7'],S.gaps['16'],S.gaps['35']],[[3,3],[3,3],[3,3],[3,3],[6,7]]);

// ---------- keskeneräisten enimmäismäärä pysäyttää uudet ----------
G=deck(40);S=newState();const c2=Object.assign({},cfg,{newPerDay:20,maxOpen:10});
log=play(G,S,D0,12,()=>true,c2);eq('kymmenen keskeneräistä: uusia ei oteta, vaikka päivärajaa on jäljellä',[log[9],log[10],S.nd],['i10:n+','i1:e+',10]);

// ---------- peli ei pysähdy: yksi kortti, tai rajat nollissa ----------
G=deck(1);S=newState();log=play(G,S,D0,3,(id,k,t)=>t>0);eq('ainoa kortti toistuu',log,['i1:n-','i1:r+','i1:e+']);
G=deck(0);S=newState();eq('tyhjä peli: ei korttia',nextCard(G,S,cfg,D0,null),null);
G=deck(12);S=newState();play(G,S,D0,10,()=>true);S.day=D0;
eq('päivän vaihtuessa uusien laskuri nollautuu',[summary(G,S,cfg,addDays(D0,1)).newLeft,nextCard(G,S,cfg,addDays(D0,1),null).kind],[2,'due']);

// ---------- sanat: kaksi korttia, käänteinen suunta vasta kun ensimmäinen on tasolla 2 ----------
G=words(4);S=newState();
eq('neljästä sanasta kahdeksan korttia',cardsOf(G).map(c=>c.id),['i1>','i1<','i2>','i2<','i3>','i3<','i4>','i4<']);
log=play(G,S,D0,6,()=>true);eq('ensin vain suunta sana -> käännös',log,['i1>:n+','i2>:n+','i3>:n+','i4>:n+','i1>:e+','i2>:e+']);
day=addDays(D0,1);log=play(G,S,day,6,()=>true);
eq('toisena päivänä kertaus pisimpään näkemättä olleesta alkaen, sitten käänteiset uusina',log,['i3>:d+','i4>:d+','i1>:d+','i2>:d+','i1<:n+','i2<:n+']);
G=words(1);eq('yksi sana ei riitä: ei vääriä vaihtoehtoja',cardsOf(G).length,0);
G=words(3);G.items[1].off=true;eq('kierrosta poistettu sana ei ole kortti eikä väärä vaihtoehto',[cardsOf(G).map(c=>c.id),E.buildQuestion(G,cardsOf(G)[0],null).opts.map(o=>o.t).sort()],[['i1>','i1<','i3>','i3<'],['fi1','fi3']]);

console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
