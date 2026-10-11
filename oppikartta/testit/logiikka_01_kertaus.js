// Kertauskierto: usein ja harvoin kerrattavat, uuden kortin tulo vapautuvalle paikalle, väärän vastauksen pudotus, lisäkierros, käänteinen suunta.
const E=require('./ok.js');const {newState,nextCard,applyAnswer,summary,cardsOf,addDays,dayDiff,isOpen,OKKEY,CFG_DEF}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function check(label,cond,extra){if(!cond)ok=false;console.log((cond?'ok  ':'FAIL')+' '+label+(extra?'  '+extra:''));}
function rngOf(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const D0='2026-10-11';
function deck(n){const G={id:'g1',name:'x',iseq:n,items:[]};for(let i=1;i<=n;i++)G.items.push({id:'i'+i,k:'m',q:'k'+i,c:'o'+i,w:['a','b','c'],ex:''});return G;}
function words(n){const G={id:'g1',name:'x',iseq:n,items:[]};for(let i=1;i<=n;i++)G.items.push({id:'i'+i,k:'s',a:'en'+i,b:'fi'+i,ex:''});return G;}
const cfg=Object.assign({},CFG_DEF);
// pelaa: fn(kortin id, laji, vuoro) -> oikein?
function play(G,S,day,turns,fn,c){let last=null,log=[];for(let t=0;t<turns;t++){const nx=nextCard(G,S,c||cfg,day,last);if(!nx)break;const right=fn(nx.card.id,nx.kind,t);
    applyAnswer(S,nx.card.id,right?OKKEY:'a',right,day,nx.kind);log.push(nx.card.id+':'+nx.kind[0]+(right?'+':'-'));last=nx.card.id;}return log;}
const lv=(S,id)=>S.cards[id].l+(S.cards[id].q?'q':'');

// ---------- uusi kortti, väärän paluu, kolme oikeaa peräkkäin vie harvoin kerrattavaksi ----------
let G=deck(30),S=newState();
let log=play(G,S,D0,8,(id,k,t)=>t!==0);
eq('väärin mennyt uusi kortti palaa, kun kolme muuta on näytetty',log,['i1:n-','i2:n+','i3:n+','i4:n+','i1:r+','i5:n+','i6:n+','i7:n+']);
eq('tasot: uusi oikein = 1, väärän jälkeen oikein = 1',[lv(S,'i2'),lv(S,'i1'),S.cards.i1.s],['1','1',1]);
eq('historia: väärä vaihtoehto ja oikea',S.cards.i1.h,{a:1,[OKKEY]:1});
G=deck(30);S=newState();log=play(G,S,D0,40,()=>true);
eq('kahdeksan korttia kiertää: i1 tulee vastaan joka kahdeksas vuoro, kunnes se on opittu',log.map((x,i)=>x.startsWith('i1:')?i:-1).filter(i=>i>=0),[0,8,16]);
eq('kun i1 on opittu, tilalle tulee heti uusi kortti',log.slice(15,19),['i8:o+','i1:o+','i9:n+','i2:o+']);
eq('kolmannen oikean jälkeen kortti on harvoin kerrattava ja vuorossa huomenna',[lv(S,'i1'),isOpen(S.cards.i1),S.cards.i1.d],['3',false,addDays(D0,1)]);

// ---------- usein kerrattavia on enintään raja: uusi tulee vasta, kun paikka vapautuu ----------
G=deck(60);S=newState();let maxOpen=0,seenAt=[],over=0;
{let last=null;const r=rngOf(3);for(let t=0;t<400;t++){const nx=nextCard(G,S,cfg,D0,last);const right=nx.kind==='new'?false:r()<0.75;const before=summary(G,S,D0);
    if(nx.kind==='new'&&before.open>=cfg.maxOpen)over++;
    applyAnswer(S,nx.card.id,right?OKKEY:'a',right,D0,nx.kind);last=nx.card.id;maxOpen=Math.max(maxOpen,summary(G,S,D0).open);if(t%100===99)seenAt.push(summary(G,S,D0).seen);}}
const sm=summary(G,S,D0);
check('uusia kortteja tulee koko ajan lisää sitä mukaa kuin vanhoja opitaan',seenAt[0]>8&&seenAt[1]>seenAt[0]&&seenAt[2]>seenAt[1]&&seenAt[3]>seenAt[2],'nähty 100 vuoron välein: '+seenAt.join(', '));
check('uusi kortti otetaan vain, kun opeteltavia on alle rajan',over===0&&sm.rare>20,'opettelussa enimmillään '+maxOpen+', lopussa '+JSON.stringify(sm));
// pelkät virheet: uusia ei tule rajan yli
G=deck(60);S=newState();play(G,S,D0,100,()=>false);
eq('pelkillä virheillä kierrossa pysyy neljä korttia: väärin mennyt palaa aina ennen uutta',[summary(G,S,D0).seen,summary(G,S,D0).open],[4,4]);
const c5=Object.assign({},cfg,{maxOpen:5});G=deck(60);S=newState();play(G,S,D0,10,()=>true,c5);const S8=newState();play(G,S8,D0,10,()=>true);
eq('raja on asetus: kymmenen virheettömän vuoron jälkeen nähty 5 tai 8 korttia',[summary(G,S,D0).seen,summary(G,S8,D0).seen],[5,8]);

// ---------- väärä vastaus pudottaa kaksi tasoa ja tuo kortin pian uudestaan ----------
G=deck(30);S=newState();play(G,S,D0,40,()=>true);
let day=addDays(D0,1);
eq('seuraavana päivänä harvoin kerrattavat ovat vuorossa, tänään eivät',[summary(G,S,day).due,summary(G,S,D0).due,summary(G,S,day).rare],[9,0,9]);
// viedään i1 tasolle 5 (7 päivää) ja vastataan väärin
day=D0;for(let k=0;k<2;k++){day=S.cards.i1.d;applyAnswer(S,'i1',OKKEY,true,day,'due');}
eq('harvoin kerrattavan välit kasvavat: 1, 3, 7 päivää',[lv(S,'i1'),dayDiff(day,S.cards.i1.d)],['5',7]);
day=S.cards.i1.d;applyAnswer(S,'i1','a',false,day,'due');
eq('väärä vastaus: kaksi tasoa alas ja pian uudestaan',[lv(S,'i1'),isOpen(S.cards.i1)],['3q',true]);
applyAnswer(S,'i1',OKKEY,true,day,'retry');eq('oikea vastaus sen jälkeen: taso ylös, takaisin harvoin kerrattavaksi',[lv(S,'i1'),isOpen(S.cards.i1),dayDiff(day,S.cards.i1.d)],['4',false,3]);
applyAnswer(S,'i1','a',false,day,'due');applyAnswer(S,'i1','b',false,day,'retry');eq('kaksi virhettä peräkkäin: kortti on taas usein kerrattava',[lv(S,'i1'),isOpen(S.cards.i1)],['0q',true]);
applyAnswer(S,'i1','b',false,day,'retry');eq('taso ei mene alle nollan',lv(S,'i1'),'0q');
// tasot nousevat enintään 35 päivän väliin
S=newState();applyAnswer(S,'x',OKKEY,true,D0,'new');for(let k=0;k<9;k++)applyAnswer(S,'x',OKKEY,true,D0,'due');
eq('ylin taso on 7 = 35 päivää',[lv(S,'x'),dayDiff(D0,S.cards.x.d)],['7',35]);

// ---------- lisäkierros: kun mikään ei ole vuorossa eikä uusia ole, harvoin kerrattavat täyttävät ----------
G=deck(3);S=newState();log=play(G,S,D0,14,()=>true);
eq('seuraavana päivänä vuorossa oleva tulee ennen lisäkierrosta',nextCard(G,S,cfg,addDays(D0,1),null).kind,'due');
eq('pieni peli: kaikki kolme nousevat harvoin kerrattaviksi, vaikka välit eivät täyty',[summary(G,S,D0).rare,log.slice(-3).map(x=>x.slice(-2))],[3,['e+','e+','e+']]);
const before=JSON.stringify(S.cards.i1.l)+S.cards.i1.d;play(G,S,D0,3,()=>true);
eq('lisäkierroksen oikea vastaus ei muuta tasoa eikä päivää',JSON.stringify(S.cards.i1.l)+S.cards.i1.d,before);
log=play(G,S,D0,1,()=>false);eq('lisäkierroksen väärä vastaus pudottaa kortin takaisin opetteluun',[log[0].slice(-2),summary(G,S,D0).open],['e-',1]);
G=deck(1);S=newState();log=play(G,S,D0,5,(id,k,t)=>t>0);eq('ainoa kortti toistuu',log,['i1:n-','i1:r+','i1:o+','i1:o+','i1:e+']);
G=deck(0);S=newState();eq('tyhjä peli: ei korttia',nextCard(G,S,cfg,D0,null),null);
// sama kortti ei tule kahdesti peräkkäin
G=deck(5);S=newState();{let last=null,rep=0;const r=rngOf(8);for(let t=0;t<300;t++){const nx=nextCard(G,S,cfg,D0,last);if(nx.card.id===last)rep++;const right=r()<0.6;applyAnswer(S,nx.card.id,right?OKKEY:'a',right,D0,nx.kind);last=nx.card.id;}
  eq('sama kortti ei tule kahdesti peräkkäin',rep,0);}
eq('unohtamistilasto kirjautuu',Object.keys(S.gaps),['0']);

// ---------- sanat: kaksi korttia, käänteinen suunta vasta kun ensimmäinen on harvoin kerrattava ----------
G=words(4);S=newState();
eq('neljästä sanasta kahdeksan korttia',cardsOf(G).map(c=>c.id),['i1>','i1<','i2>','i2<','i3>','i3<','i4>','i4<']);
log=play(G,S,D0,4,()=>true);eq('ensin vain suunta sana -> käännös',log,['i1>:n+','i2>:n+','i3>:n+','i4>:n+']);
log=play(G,S,D0,40,()=>true);const firstRev=log.findIndex(x=>x.includes('<'));
check('käänteinen suunta tulee uutena vasta, kun ensimmäinen suunta on harvoin kerrattava',firstRev>0&&log[firstRev]==='i1<:n+'&&!isOpen(S.cards['i1>']),log.slice(0,firstRev+1).join(' '));
G=words(1);eq('yksi sana ei riitä: ei vääriä vaihtoehtoja',cardsOf(G).length,0);
G=words(3);G.items[1].off=true;eq('kierrosta poistettu sana ei ole kortti eikä väärä vaihtoehto',[cardsOf(G).map(c=>c.id),E.buildQuestion(G,cardsOf(G)[0],null).opts.map(o=>o.t).sort()],[['i1>','i1<','i3>','i3<'],['fi1','fi3']]);

console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
