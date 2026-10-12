// Versio 4: kirjaus (jokainen kerta erikseen), painalluksen kesto ja "kun irrotetaan" -toiminnot. Lisäksi arvojen säilyminen korjauksessa.
const E=require('./moottori.js');
let ok=true;function eq(l,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+l+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const P=E.newProject('K');const add=(t,n,x)=>{const o=E.newObj(P,t,'s1',n);Object.assign(o,x||{});P.objs.push(o);return o;};
const lg=add('log','Uloshengitykset'),sek=add('counter','Sekunnit',{keep:true}),tk=add('input','Muistiinpano'),sl=add('slider','Vire');
const b=add('choice','Hengitä ulos',{beh:'hold'});b.ract=[{do:'log',o:lg.id,src:'dur'},{do:'add',o:sek.id,src:'dur'}];b.act=[{do:'log',o:lg.id,src:'dur'}];
E.repair(P);
eq('uusi kirjaus: oletukset',[lg.unit,lg.dec,lg.show],['s',1,'chart']);
eq('kesto vain irrotettaessa (act-listasta src pois)',b.act,[{do:'log',o:lg.id}]);
eq('kun irrotetaan säilyy',b.ract.map(a=>a.src),['dur','dur']);
const C=E.compile(P),S={sel:[],vals:{}};
E.change(C,S,{},b.ract,null,{dur:4.2});E.change(C,S,{},b.ract,null,{dur:6.5});
eq('kaksi merkintää',S.vals[lg.id].map(x=>x.v),[4.2,6.5]);
eq('aika tallentuu',S.vals[lg.id].every(x=>typeof x.t==='number'&&x.t>1.7e12),true);
eq('sekunnit yhteensä',Math.round(S.vals[sek.id]*10)/10,10.7);
E.change(C,S,{},b.ract,null,{});eq('ilman kestoa ei kirjata',S.vals[lg.id].length,2);
E.change(C,S,{},[{do:'log',o:lg.id,v:3}],null,null);eq('kirjaa luvun',S.vals[lg.id].length,3);
const St=E.logStats(S.vals[lg.id]);eq('tilasto',[St.n,St.last,Math.round(St.avg*100)/100,St.min,St.max],[3,3,4.57,3,6.5]);
const R=E.evaluate(C,S);eq('arvo = viimeisin',R.R.value(lg.id),3);eq('tekstissä',E.fill(C,R.R,'{Uloshengitykset}'),'3 s');
eq('sääntö viimeisimmästä',R.R.holds({o:lg.id,op:'ge',v:3}),true);
S.vals[tk.id]='moi';S.vals[sl.id]=7;P.state=JSON.parse(JSON.stringify(S));E.repair(P);
eq('korjaus säilyttää arvot (laskuri, teksti, säädin, kirjaus)',[P.state.vals[sek.id]!==undefined,P.state.vals[tk.id],P.state.vals[sl.id],P.state.vals[lg.id].length],[true,'moi',7,3]);
P.state.vals[sl.id]='x';P.state.vals[lg.id+'z']=[1];E.repair(P);eq('väärät arvot siivotaan',[P.state.vals[sl.id],Object.keys(P.state.vals).length],[undefined,3]);
E.applyActs(C,S,[{do:'reset'}],{});eq('alusta: kirjaus ja muistava laskuri säilyvät, teksti tyhjenee',[S.vals[lg.id].length,S.vals[sek.id]!==undefined,S.vals[tk.id]],[3,true,undefined]);
E.applyActs(C,S,[{do:'clear',o:lg.id}],{});eq('tyhjennä kirjaus',S.vals[lg.id],undefined);
const big={sel:[],vals:{}};for(let i=0;i<5003;i++)E.applyActs(C,big,[{do:'log',o:lg.id,v:i}],{});eq('enintään 5000 merkintää',[big.vals[lg.id].length,big.vals[lg.id][0].v],[5000,3]);
eq('kirjaa-kohde vain kirjaus',E.actTargets('log'),['log']);
eq('käyttäjät: kun irrotetaan',E.usedBy(P,sek.id),[b.id]);
console.log(ok?'KAIKKI OK':'VIRHEITÄ');process.exit(ok?0:1);
