// Taitokartan logiikka- ja sisältötesti. aja.sh poimii appin koodin tiedostoon tk.js ennen ajoa.
const fs=require('fs');const E=require('./tk.js');
const {readContent,evaluate,settle,idsByName,namesOf}=E;
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const txt=html.match(/<script type="application\/json" id="sisalto">([\s\S]*?)<\/script>/)[1];

// ---------- julkaistava sisältö on kelvollista ----------
const C=readContent(txt);
eq('sisältö luetaan ilman virheitä',C.errors,[]);
eq('karttoja on vähintään yksi ja versio on merkitty',[C.trees.length>0,C.versio.length>0],[true,true]);
C.trees.forEach(X=>{eq('kartta "'+X.name+'": ei huomautuksia',X.warnings,[]);
  eq('kartta "'+X.name+'": alussa näkyy jotain valittavaa',X.T.opts.some(o=>!o.c&&evaluate(X.T,[])[o.id].s==='open'),true);
  const names=X.T.opts.map(o=>o.n);eq('kartta "'+X.name+'": nimet ovat yksilöllisiä',new Set(names).size,names.length);});

// ---------- ensimmäisen kartan käyttäytyminen ----------
const X=C.trees.find(t=>t.name==='Mikä taito nyt?');eq('kartta Mikä taito nyt? on mukana',!!X,true);
const T=X.T;const st=(sel,n)=>{const ids=settle(T,idsByName(T,sel)).sel;const s=evaluate(T,ids)[idsByName(T,[n])[0]];return s.s+(s.rec?'+rec':'');};
const vis=sel=>{const ids=settle(T,idsByName(T,sel)).sel,e=evaluate(T,ids);return T.opts.filter(o=>!o.c&&(e[o.id].s==='open'||e[o.id].s==='sel')).map(o=>o.n);};
eq('alussa näkyvät vain tunteen voimakkuudet',vis([]),['Tunne ylivoimainen','Tunne voimakas mutta hallittavissa','Tunne lievä, haluan toimia viisaasti']);
eq('ylivoimainen tunne: STOP suositellaan',st(['Tunne ylivoimainen'],'STOP'),'open+rec');
eq('ylivoimainen tunne: hyödyt ja haitat näkyy ilman suositusta',st(['Tunne ylivoimainen'],'Hyödyt ja haitat'),'open');
eq('ylivoimainen tunne: muut voimakkuudet ovat poissa',[st(['Tunne ylivoimainen'],'Tunne voimakas mutta hallittavissa'),st(['Tunne ylivoimainen'],'Tunne lievä, haluan toimia viisaasti')],['excl','excl']);
eq('ongelmanratkaisu on lukittu, kunnes tosiasiat on tarkistettu ja tilanne on ratkaistavissa',st(['Tunne voimakas mutta hallittavissa'],'Ongelmanratkaisu'),'lock');
eq('ongelmanratkaisu aukeaa ja sitä suositellaan',st(['Tunne voimakas mutta hallittavissa','Tarkista tosiasiat','Tunne vastaa tosiasioita','Tilanteen voi ratkaista'],'Ongelmanratkaisu'),'open+rec');
eq('radikaali hyväksyminen suositellaan, kun tilannetta ei voi muuttaa',st(['Tunne voimakas mutta hallittavissa','Tilannetta ei voi nyt muuttaa'],'Radikaali hyväksyminen'),'open+rec');

// ---------- omat valinnat nimillä ----------
eq('nimet muuttuvat tunnuksiksi ja takaisin',namesOf(T,idsByName(T,['Tunne ylivoimainen','STOP'])),['Tunne ylivoimainen','STOP']);
eq('sisällöstä poistunut nimi putoaa pois',namesOf(T,idsByName(T,['Tunne ylivoimainen','Poistettu taito','STOP'])),['Tunne ylivoimainen','STOP']);
eq('näkymätöntä ehtoa ei voi olla valintana',idsByName(T,['Voimakkuus valittu']),[]);
eq('sama nimi kahdesti lasketaan kerran',idsByName(T,['STOP','STOP']).length,1);
eq('muu kuin lista ei kaada',idsByName(T,'STOP'),[]);
eq('valinta, jonka ehdot eivät täyty, putoaa pois latauksessa',namesOf(T,settle(T,idsByName(T,['Ongelmanratkaisu'])).sel),[]);
eq('ristiriitaisista tallennetuista valinnoista jää uusin',namesOf(T,settle(T,idsByName(T,['Tunne ylivoimainen','Tunne voimakas mutta hallittavissa'])).sel),['Tunne voimakas mutta hallittavissa']);

// ---------- virheellinen sisältö ei kaada ----------
eq('rikkinäinen teksti',readContent('{').errors.length,1);
eq('puuttuva karttalista',readContent('{"versio":"x"}').errors.length,1);
const two=readContent(JSON.stringify({versio:'t',puut:[{nimi:'A',tekijat:['x','y']},{nimi:'a',tekijat:['z']},{nimi:'B',tekijat:[]},{nimi:'C',kuvaus:' kuvaus ',tekijat:['x']}]}));
eq('sama nimi ja tyhjä kartta ohitetaan, muut jäävät',[two.trees.map(t=>t.name),two.errors.length],[['A','C'],2]);
eq('kuvaus luetaan ja siistitään',two.trees[1].desc,'kuvaus');
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');
if(!ok)process.exit(1);
