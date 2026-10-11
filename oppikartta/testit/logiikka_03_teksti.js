// Pelin sisältö tekstinä, kysymyksen rakentaminen, palkkien sääntö ja tallennusmuoto.
const E=require('./ok.js');const {parseGameText,mergeItems,gameToText,buildQuestion,preBars,topIsCorrect,cardsOf,normalize,cleanCfg,OKKEY,CFG_DEF,newState,applyAnswer}=E;
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

// ---------- palkit ennen vastausta ----------
const cfg=Object.assign({},CFG_DEF),H=h=>({h});
eq('alle viisi vastausta: ei palkkeja',preBars(H({[OKKEY]:2,a:2}),cfg),false);
eq('selvä enemmistö: ei palkkeja (paljastaisi vastauksen)',[preBars(H({[OKKEY]:7,a:3}),cfg),preBars(H({a:7,[OKKEY]:3}),cfg)],[false,false]);
eq('tasainen jakauma: palkit näkyvät riippumatta siitä, kumpi on oikea',[preBars(H({[OKKEY]:3,a:2}),cfg),preBars(H({a:3,[OKKEY]:2}),cfg),preBars(H({a:3,b:3,[OKKEY]:1}),cfg)],[true,true,true]);
eq('toiseksi yleisin liian harvinainen: ei palkkeja',preBars(H({[OKKEY]:5,a:2,b:2,c:1}),cfg),false);
eq('rajat ovat asetuksia',[preBars(H({[OKKEY]:2,a:1}),Object.assign({},cfg,{preMin:3,preTop:70})),preBars(H({[OKKEY]:3,a:2}),Object.assign({},cfg,{preTop:50}))],[true,false]);
eq('korkein palkki oikea?',[topIsCorrect(H({[OKKEY]:3,a:2})),topIsCorrect(H({a:3,[OKKEY]:2})),topIsCorrect(H({}))],[true,false,false]);

// ---------- tallennusmuoto ----------
const S=newState();applyAnswer(S,'i1>','kissa',false,'2026-10-11');applyAnswer(S,'i1>',OKKEY,true,'2026-10-11');S.round={lv:'helppo',len:10,hits:1,miss:1,turn:2,seq:2,lane:0,cd:2,mons:[{id:2,d:6,v:1,x:1}],over:''};
const raw={app:'oppikartta',version:1,pseq:2,gseq:2,players:[{id:'p1',name:' Aino '},{id:'p2',name:'Toinen'},{id:'huono',name:'x'},{id:'p3',name:''}],
  games:[W,{id:'g9',name:'',items:[{id:'i1',k:'m',q:'q',c:'c',w:[]},{id:'i2',k:'s',a:'a',b:'b',off:1},{id:'i2',k:'s',a:'tupla',b:'b'},null]}],
  cur:{p:'p2',g:'eioo'},prog:{'p1|g2':S,'p9|g2':S,'p1|g9':'roska'},cfg:{tint:'vihrea',mode:'outo',newPerDay:15,maxOpen:999,preTop:'60'},meta:{lastExport:'2026-10-01',dirty:3}};
const d=normalize(JSON.parse(JSON.stringify(raw)));
eq('pelaajat: nimi siistitään, kelvottomat pois',d.players,[{id:'p1',name:'Aino'},{id:'p2',name:'Toinen'}]);
eq('pelit: kelvottomat kortit pois, laskurit säilyvät',[d.games.map(g=>g.id+':'+g.name+':'+g.items.length),d.games[1].items,d.pseq,d.gseq,d.games[0].iseq],[['g2:s:8','g9:Peli:1'],[{id:'i2',k:'s',a:'a',b:'b',ex:'',off:true}],2,9,8]);
eq('valinnat: tuntematon peli korvautuu ensimmäisellä',d.cur,{p:'p2',g:'g2'});
eq('eteneminen vain olemassa oleville pareille',[Object.keys(d.prog).sort(),d.prog['p1|g2'].cards['i1>'],d.prog['p1|g2'].round.mons,d.prog['p1|g9'].n],[['p1|g2','p1|g9'],{l:1,d:'2026-10-12',t:2,s:1,h:{kissa:1,[OKKEY]:1},a:'2026-10-11'},[{id:2,d:6,v:1,x:1}],0]);
eq('asetukset: vain sallitut arvot',d.cfg,Object.assign({},CFG_DEF,{tint:'vihrea',newPerDay:15}));
eq('tallennus kiertää muuttumatta',JSON.stringify(normalize(JSON.parse(JSON.stringify(d)))),JSON.stringify(d));
eq('vieras sisältö hylätään',[normalize(null),normalize({trees:[]}),normalize('x')],[null,null,null]);

console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
