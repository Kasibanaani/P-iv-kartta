const fs=require('fs');const {parseTreeText,treeToText,evaluate,settle,normalize,implied}=require('./pt.js');
let ok=true;function eq(label,a,b){const p=JSON.stringify(a)===JSON.stringify(b);if(!p)ok=false;console.log((p?'ok  ':'FAIL')+' '+label+(p?'':'\n   sain   '+JSON.stringify(a)+'\n   odotin '+JSON.stringify(b)));}
const guide=JSON.parse(fs.readFileSync(__dirname+'/../index.html','utf8').match(/var AI_GUIDE=("(?:[^"\\]|\\.)*");/)[1]);
// aloitusviestin esimerkki on itse kelvollinen ja toimii kuvatulla tavalla
let r=parseTreeText(guide);eq('esimerkki aloitusviestistä: kelpaa ilman huomautuksia',[r.ok,r.warnings,r.stats],[true,[],{o:5,e:1,t:1,b:1,r:7,c:2}]);
let T=r.tree;const id=n=>T.opts.find(o=>o.n===n).id;const vis=sel=>T.opts.filter(o=>!o.c).map(o=>{const x=evaluate(T,sel.map(id))[o.id];return x.s==='sel'?o.n+'*':(x.s==='open'?o.n+(x.rec?'!':''):null);}).filter(Boolean);
eq('alussa vain päivät',vis([]),['Maanantai','Tiistai']);
eq('maanantai: muut näkyviin, hoitosuunnitelma korostettuna',vis(['Maanantai']),['Maanantai*','DKT-tiimi','Hoitosuunnitelmien tarkistus!']);
eq('tiistai + DKT: valmistautuminen korostettuna, hoitosuunnitelma neutraali',vis(['Tiistai','DKT-tiimi']),['Tiistai*','DKT-tiimi*','Valmistaudu tiimiin!','Hoitosuunnitelmien tarkistus']);
eq('huomio ja nimi tulevat mukaan',[T.name,T.opts[4].note],['Työpäivä','Käy läpi asialista 15 minuuttia ennen.']);
// edestakaisin: teksti -> puu -> teksti -> puu
const t2=parseTreeText(treeToText(T));eq('kopioitu teksti tuottaa saman puun',[t2.ok,t2.warnings,JSON.stringify([t2.tree.opts,t2.tree.suf,t2.tree.req,t2.tree.rec,t2.tree.close])===JSON.stringify([T.opts,T.suf,T.req,T.rec,T.close])],[true,[],true]);
eq('kopioidussa tekstissä ryhmät tiiviisti',JSON.parse(treeToText(T)).ei_sovi_yhteen,[['Maanantai','Tiistai']]);
// kolmen ryhmä ja erillinen pari
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'X',tekijat:['a','b','c','d','e'],ei_sovi_yhteen:[['a','b','c'],['d','e']]}));
eq('tekijät pelkkinä niminä, ryhmät säilyvät',[r.ok,JSON.parse(treeToText(r.tree)).ei_sovi_yhteen,r.tree.close.o1],[true,[['a','b','c'],['d','e']],['o2','o3']]);
// sietokyky: koodilohko, ympäröivä teksti, kaarevat lainausmerkit, loppupilkku, isot ja pienet kirjaimet
const raw='Tässä on puu:\n```json\n{\n “paatoskartta”: “puu”, “nimi”: “Testi”,\n “tekijat”: [ {“nimi”: “Alku”}, {“nimi”: “Jatko”, “vaatii”: [“alku ”],}, ],\n}\n```\nKerro, jos haluat muutoksia.';
r=parseTreeText(raw);eq('muotoilun läpi kulkenut teksti',[r.ok,r.tree&&r.tree.name,r.tree&&r.tree.req,r.warnings],[true,'Testi',{o2:['o1']},[]]);
r=parseTreeText('{"paatoskartta":"puu","nimi":"L","tekijat":[{"nimi":"Sanoo ”näin”","huomio":"rivi 1\\nrivi 2"}]}');
eq('lainausmerkit nimen sisällä ja rivinvaihto huomiossa säilyvät',[r.ok,r.tree.opts[0].n,r.tree.opts[0].note],[true,'Sanoo ”näin”','rivi 1\nrivi 2']);
// virheet ja huomautukset
eq('ei puuta',parseTreeText('hei vaan').ok,false);
eq('tyhjä lista',parseTreeText('{"paatoskartta":"puu","tekijat":[]}').error,'Päätöspuusta puuttuu tekijöiden lista ("tekijat").');
r=parseTreeText('{"paatoskartta":"puu","tekijat":[{"nimi":"A"},{"nimi":"a"}]}');eq('sama nimi kahdesti on virhe',[r.ok,/kahdesti: a/.test(r.error)],[false,true]);
r=parseTreeText(JSON.stringify({app:'paatoskartta',version:6,trees:[{id:'t1',name:'A',options:[]}]}));eq('varmuuskopio tunnistetaan',[r.ok,r.kind,/koko varmuuskopio \(1 päätöspuuta\)/.test(r.error)],[false,'backup',true]);
eq('yksittäinen puu ei kelpaa varmuuskopioksi',normalize(JSON.parse(treeToText(T))),null);
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'V',tekijat:[{nimi:'A',vaatii:['Olematon','A','B'],riittaa:['B']},{nimi:'B'},{nimi:'E',nakymaton:true,suosittelijat:['A']},{nimi:'F',vaatii:['E']},{nimi:'G',vaatii:['A','B']}],ei_sovi_yhteen:[['A','B','E']]}));
eq('huomautukset: mitä ohitettiin ja mikä ei toimi',[r.ok,r.warnings.map(w=>w.slice(0,24))],[true,
 ['”A”: kohdassa vaatii on ','”A” viittaa itseensä koh','”A”: sama tekijä on sekä','”E” on näkymätön ehto, e','”E” on näkymätön ehto, e','”A” ja ”B” eivät sovi yh','Nämä näkymättömät ehdot ','Näitä vaihtoehtoja ei vo']]);
eq('kelvolliset osat jäävät: G vaatii A:n ja B:n, jotka eivät sovi yhteen',[r.tree.req.o5,r.warnings[7].indexOf('G')>0],[['o1','o2'],true]);
r=parseTreeText(JSON.stringify({paatoskartta:'puu',nimi:'V',tekijat:[{nimi:'A',vaatii:['B']},{nimi:'B',vaatii:['A']}]}));eq('puu, jota ei voi aloittaa',r.warnings.some(w=>/Alussa ei näy/.test(w)),true);
console.log(ok?'\nKAIKKI OK':'\nVIRHEITÄ');
if(!ok)process.exit(1);
