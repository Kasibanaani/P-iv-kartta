// Pelin sisältö tekstinä, kysymyksen rakentaminen ja tallennusmuoto (myös ensimmäisen version tallennuksen muunnos).
const E=require('./ok.js');const {parseGameText,mergeItems,gameToText,buildQuestion,cardsOf,normalize,cleanCfg,OKKEY,CFG_DEF,newState,applyAnswer,isOpen}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
function rngOf(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ---------- tekstin luku ----------
let r=parseGameText('Tässä peli:\n```json\n{"oppikartta":"peli","nimi":"Testi","sanat":[["dog","koira","The dog."],["cat","kissa"],["x",""],"roska"],"kortit":[{"kysymys":"1+1?","oikea":"2","vaarat":["3","2","4","3"],"selitys":"Yhteenlasku.","selitykset":{"3":"Yksi liikaa."}},{"kysymys":"ei vääriä","oikea":"a"}]}\n```');
eq('JSON koodilohkosta: nimi, sanat, kortit',[r.ok,r.name,r.items.length,r.skipped],[true,'Testi',3,3]);
eq('sana',r.items[0],{k:'s',a:'dog',b:'koira',ex:'The dog.'});
eq('kortti: tuplat ja oikean kanssa sama väärä karsitaan',r.items[2],{k:'m',q:'1+1?',c:'2',w:['3','4'],ex:'Yhteenlasku.',exw:{'3':'Yksi liikaa.'}});
r=parseGameText('{“nimi”: “Lainausmerkit”, “sanat”: [[“dog”, “koira”],],}');eq('kaarevat lainausmerkit ja ylimääräiset pilkut',[r.ok,r.name,r.items.length],[true,'Lainausmerkit',1]);
r=parseGameText('[["dog","koira","x"],["cat","kissa"]]');eq('pelkkä sanalista',[r.ok,r.items.map(i=>i.a)],[true,['dog','cat']]);
r=parseGameText('Nimi: Omat sanat\ndog ; koira ; The dog; it barks.\ncat\tkissa\nbird | lintu\nyksin\n');
eq('rivit: puolipiste, sarkain ja pystyviiva',[r.ok,r.name,r.items.map(i=>i.a+'='+i.b+'/'+i.ex),r.skipped],[true,'Omat sanat',['dog=koira/The dog; it barks.','cat=kissa/','bird=lintu/'],1]);
eq('tyhjä tai sopimaton teksti',[parseGameText('').ok,parseGameText('moi vaan').ok,parseGameText('{"foo":1}').ok],[false,false,false]);
eq('varmuuskopio ei ole peli',parseGameText('{"app":"oppikartta","games":[],"players":[]}').error.slice(0,24),'Tämä on koko varmuuskopi');
eq('englanninkieliset avaimet käyvät myös',parseGameText('{"name":"N","words":[{"word":"a","translation":"b","example":"c"}],"cards":[{"question":"q","correct":"x","wrong":["y"]}]}').items.length,2);

// ---------- lisääminen peliin: sama kortti päivittyy ja säilyttää tunnisteensa ----------
const G={id:'g1',name:'Testi',iseq:0,items:[]};
let m=mergeItems(G,parseGameText('{"sanat":[["dog","koira","Vanha."],["cat","kissa"]],"kortit":[{"kysymys":"1+1?","oikea":"2","vaarat":["3"]}]}').items);
eq('ensimmäinen tuonti',[m,G.items.map(i=>i.id)],[{added:3,addedW:2,addedM:1,updated:0,same:0},['i1','i2','i3']]);
m=mergeItems(G,parseGameText('{"sanat":[["Dog","Koira","Uusi."],["cat","kissa"],["bird","lintu"]],"kortit":[{"kysymys":"1+1?","oikea":"2","vaarat":["3","4"]}]}').items);
eq('toinen tuonti: kaksi päivittyy, yksi sama, yksi uusi',[m,G.items.map(i=>i.id),G.items[0].ex,G.items[2].w],[{added:1,addedW:1,addedM:0,updated:2,same:1},['i1','i2','i3','i4'],'Uusi.',['3','4']]);
const back=parseGameText(gameToText(G));
eq('peli tekstinä ja takaisin',[back.name,back.items.length,mergeItems(G,back.items)],['Testi',4,{added:0,addedW:0,addedM:0,updated:0,same:4}]);

// ---------- kysymyksen rakentaminen ----------
const W={id:'g2',name:'s',iseq:8,items:[['dog','koira'],['cat','kissa'],['bird','lintu'],['fish','kala'],['horse','hevonen'],['cow','lehmä'],['bank','pankki'],['bank','penkka']].map((p,i)=>({id:'i'+(i+1),k:'s',a:p[0],b:p[1],ex:''}))};
const cs=cardsOf(W),rng=rngOf(5);
let q=buildQuestion(W,cs[0],null,rng);
eq('neljä vaihtoehtoa, yksi oikea, ei tuplia',[q.prompt,q.opts.length,q.opts.filter(o=>o.ok).map(o=>o.t),new Set(q.opts.map(o=>o.t)).size],['dog',4,['koira'],4]);
eq('käänteinen suunta kysyy alkuperäistä sanaa',[buildQuestion(W,cs[1],null,rng).prompt,buildQuestion(W,cs[1],null,rng).opts.find(o=>o.ok).t],['koira','dog']);
let leak=0;for(let i=0;i<300;i++){const o=buildQuestion(W,cs.find(c=>c.id==='i7>'),null,rng).opts.map(x=>x.t);if(o.includes('penkka'))leak++;}
eq('saman sanan toinen käännös ei ole väärä vaihtoehto',leak,0);
leak=0;for(let i=0;i<300;i++){const o=buildQuestion(W,cs.find(c=>c.id==='i1<'),null,rng).opts.map(x=>x.t);if(o.filter(t=>t==='bank').length>1)leak++;}
eq('sama teksti ei tule vaihtoehdoksi kahdesti',leak,0);
// aiemmin valittu väärä tulee aina mukaan
let miss=0;const st={l:0,d:'2026-10-11',t:1,s:0,h:{'kala':2,'lehmä':1}};for(let i=0;i<200;i++){const o=buildQuestion(W,cs[0],st,rng).opts.map(x=>x.t);if(!o.includes('kala')||!o.includes('lehmä'))miss++;}
eq('aiemmin valitut väärät vaihtoehdot palaavat samaan korttiin',miss,0);
const M={id:'g3',name:'m',iseq:1,items:[{id:'i1',k:'m',q:'q',c:'oikea',w:['a','b','c','d','e'],ex:''}]};
q=buildQuestion(M,cardsOf(M)[0],{h:{'e':1}},rng);eq('monivalinta: enintään kolme väärää, valittu väärä mukana',[q.opts.length,q.opts.some(o=>o.t==='e'),q.opts.filter(o=>o.ok).length],[4,true,1]);

// ---------- tallennusmuoto ----------
const S=newState();applyAnswer(S,'i1>','kissa',false,'2026-10-11','new');applyAnswer(S,'i1>',OKKEY,true,'2026-10-11','retry');S.round={lv:'helppo',len:10,hits:1,miss:1,turn:2,seq:2,lane:0,cd:2,mons:[{id:2,d:6,v:1,x:1}],over:''};
const raw={app:'oppikartta',version:2,v:2,pseq:2,gseq:2,players:[{id:'p1',name:' Aino '},{id:'p2',name:'Toinen'},{id:'huono',name:'x'},{id:'p3',name:''}],
  games:[W,{id:'g9',name:'',items:[{id:'i1',k:'m',q:'q',c:'c',w:[]},{id:'i2',k:'s',a:'a',b:'b',off:1},{id:'i2',k:'s',a:'tupla',b:'b'},null]}],
  cur:{p:'p2',g:'eioo'},prog:{'p1|g2':S,'p9|g2':S,'p1|g9':'roska'},cfg:{tint:'vihrea',mode:'outo',maxOpen:12,show:'2000',newPerDay:15,preTop:60},meta:{lastExport:'2026-10-01',dirty:3}};
const d=normalize(JSON.parse(JSON.stringify(raw)));
eq('pelaajat: nimi siistitään, kelvottomat pois',d.players,[{id:'p1',name:'Aino'},{id:'p2',name:'Toinen'}]);
eq('pelit: kelvottomat kortit pois, laskurit säilyvät',[d.games.map(g=>g.id+':'+g.name+':'+g.items.length),d.games[1].items,d.pseq,d.gseq,d.games[0].iseq],[['g2:s:8','g9:Peli:1'],[{id:'i2',k:'s',a:'a',b:'b',ex:'',off:true}],2,9,8]);
eq('valinnat: tuntematon peli korvautuu ensimmäisellä',d.cur,{p:'p2',g:'g2'});
eq('eteneminen vain olemassa oleville pareille',[Object.keys(d.prog).sort(),d.prog['p1|g2'].cards['i1>'],d.prog['p1|g2'].round.mons,d.prog['p1|g9'].n],[['p1|g2','p1|g9'],{l:1,d:'2026-10-11',t:2,s:1,h:{kissa:1,[OKKEY]:1},a:'2026-10-11'},[{id:2,d:6,v:1,x:1}],0]);
eq('asetukset: vain sallitut arvot, vanhat asetukset putoavat pois',d.cfg,Object.assign({},CFG_DEF,{tint:'vihrea',maxOpen:12,show:2000}));
eq('tallennus kiertää muuttumatta',JSON.stringify(normalize(JSON.parse(JSON.stringify(d)))),JSON.stringify(d));
eq('vieras sisältö hylätään',[normalize(null),normalize({trees:[]}),normalize('x')],[null,null,null]);
// ensimmäisen version tallennus: tasot 0–5 olivat päivävälejä, taso 0 kesken oleva kortti
const v1={v:1,pseq:1,gseq:2,players:[{id:'p1',name:'Aino'}],games:[W],cur:{p:'p1',g:'g2'},cfg:{tint:'oranssi',mode:'auto',newPerDay:10,maxOpen:20,preMin:5,preTop:60,preSecond:30},meta:{lastExport:null,dirty:4},
  prog:{'p1|g2':{n:14,day:'2026-10-11',nd:10,lv:'vaikea',len:20,st:{r:2,w:1,p:17},pre:[1,1],gaps:{'0':[5,7]},round:null,
    cards:{'i1>':{l:1,d:'2026-10-12',t:9,s:2,h:{[OKKEY]:2},a:'2026-10-11'},'i2>':{l:0,d:'2026-10-11',t:14,s:0,h:{koira:1},a:'2026-10-11'},'i3>':{l:5,d:'2026-11-20',t:3,s:6,h:{[OKKEY]:6}},'i4>':{l:3,d:'2026-10-15',t:4,s:3,h:{[OKKEY]:3}}}}}};
const m1=normalize(JSON.parse(JSON.stringify(v1))),C=m1.prog['p1|g2'].cards;
eq('vanha tallennus: päivävälit siirtyvät harvoin kerrattaviksi samalla päivällä',[m1.v,C['i1>'].l,C['i1>'].d,C['i3>'].l,C['i3>'].d,C['i4>'].l,isOpen(C['i1>'])],[2,3,'2026-10-12',7,'2026-11-20',5,false]);
eq('vanha tallennus: kesken ollut kortti tulee pian uudestaan',[C['i2>'].l,C['i2>'].q,isOpen(C['i2>'])],[0,1,true]);
eq('vanha tallennus: eteneminen säilyy ja aiempi väriteema säilyy',[m1.prog['p1|g2'].n,m1.prog['p1|g2'].st,m1.prog['p1|g2'].lv,m1.prog['p1|g2'].len,m1.prog['p1|g2'].gaps,m1.cfg],[14,{r:2,w:1,p:17},'vaikea',20,{'0':[5,7]},Object.assign({},CFG_DEF,{tint:'oranssi'})]);
eq('muunnos tehdään vain kerran',JSON.stringify(normalize(JSON.parse(JSON.stringify(m1)))),JSON.stringify(m1));
eq('ensimmäisen version varmuuskopio (version: 1) muunnetaan samoin',normalize(Object.assign({app:'oppikartta',version:1},JSON.parse(JSON.stringify(v1)),{v:undefined})).prog['p1|g2'].cards['i1>'].l,3);

console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
