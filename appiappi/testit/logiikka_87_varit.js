// F34 vaihe 1 (jonon 14): käyttönäkymän oma teema ja paletti tallennuksessa. repair/repairAp: puuttuva = ennallaan,
// oma heksa isoiksi, virheellinen pois, teema 'oma' ilman väriä pois, tuntematon tapa → Sateenkaari, paikat 8 kpl,
// pelkkä Sateenkaari ilman omia paikkoja = ei kenttää. Tavat samat kuin valitsimessa (appearance-lohkon TAVAT).
var KK=require('./moottori.js'),A=require('assert'),fs=require('fs');
function R(ap){var P={b:{},lg:{n:[],l:[]},views:[{id:'v1',n:'Näkymä'}]};if(ap!==undefined)P.appearance=ap;KK.repair(P);return P.appearance;}
// 1 Vanha projekti ilman kenttiä
A.strictEqual(R(undefined),undefined);
A.deepStrictEqual(R({theme:'lake',mode:'dark'}),{theme:'lake',mode:'dark'});
// 2 Oma teema
A.deepStrictEqual(R({theme:'oma',oma:'#3a7ca5'}),{theme:'oma',oma:'#3A7CA5'});
A.deepStrictEqual(R({theme:'oma',oma:'sininen'}),{});
A.deepStrictEqual(R({theme:'oma'}),{});
A.deepStrictEqual(R({theme:'forest',oma:'#112233'}),{theme:'forest',oma:'#112233'},'oma väri säilyy, vaikka teema vaihtui');
// 3 Paletti
A.deepStrictEqual(R({pal:{t:'kolmikko',c:'#ff0000'}}),{pal:{t:'kolmikko',c:'#FF0000'}});
A.deepStrictEqual(R({pal:{t:'outo',c:'#ff0000'}}),{},'tuntematon tapa → Sateenkaari, ei omia paikkoja → pois');
A.deepStrictEqual(R({pal:{t:'outo',x:['#ff0000']}}),{pal:{t:'sateenkaari',x:['#FF0000',null,null,null,null,null,null,null]}});
A.deepStrictEqual(R({pal:{t:'yksi',c:'xx',x:[null,'#00ff00',3,'#12345',null,null,null,null,'#ffffff']}}),{pal:{t:'yksi',x:[null,'#00FF00',null,null,null,null,null,null]}});
A.deepStrictEqual(R({pal:{t:'nelio',x:[null,null]}}),{pal:{t:'nelio'}});
A.deepStrictEqual(R({pal:'kolmikko'}),{});
A.strictEqual(R([1,2]),undefined);A.strictEqual(R(null),undefined);
// 4 Korjattu kelpaa uudelleen sellaisenaan (idempotentti) ja kulkee JSONina
var a={theme:'oma',oma:'#ABCDEF',mode:'light',pal:{t:'teema',x:[null,null,null,'#010203',null,null,null,null]}};
A.deepStrictEqual(R(JSON.parse(JSON.stringify(a))),a);
// 5 Tavat moottorissa = valitsimen tavat
var html=fs.readFileSync(__dirname+'/../index.html','utf8'),m=html.match(/var TAVAT=\[(.*?)\];\n/);A.ok(m,'TAVAT löytyy');
var ids=m[1].match(/\['([a-z]+)'/g).map(function(x){return x.slice(2,-1);});
A.deepStrictEqual(ids,KK.PALTAVAT);A.strictEqual(ids[0],'sateenkaari');A.ok(ids.length>=10);
console.log('ok logiikka_87_varit',ids.length,'tapaa');
