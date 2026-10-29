'use strict';
// Juuri 1.98 (Emil 29.10.2026): kuittaus kuuluu tekstille. N.done on johdettu, N.tx kohdistuu sisällön mukaan, arkistointi oma.
const A=require('assert'),E=require('./engine');
const T='2026-10-29',at='2026-10-29T08:00:00.000Z',c='2026-10-20T08:00:00.000Z';
const note=(text,x)=>Object.assign({id:'n',created:c,edited:c,text,date:''},x||{});
// Ajaton yksi teksti: kuittaus ja palautus
let N=note('Soita putkimiehelle');E.txSync(N,T);A(!N.done);A.deepEqual(N.tx,[]);
A(E.txSet(N,0,true,at,T));A.equal(N.done,at);A(E.txOn(N,0,T));E.txSet(N,0,false,at,T);A(!N.done);A(!E.txOn(N,0,T));
// Kaksi tekstiä: muistiinpano kuitattu vasta, kun molemmat
N=note('Soita putkimiehelle huomisesta\n---\nOsta maitoa kaupasta');E.txSet(N,0,true,at,T);A(!N.done);A(E.txOn(N,0,T));A(!E.txOn(N,1,T));
E.txSet(N,1,true,at,T);A.equal(N.done,at);
// Muokkaus: lähes sama teksti pitää kuittauksen, uusi teksti alkuun ei vie kuittausta
N=note('Soita putkimiehelle huomisesta\n---\nOsta maitoa kaupasta');E.txSet(N,0,true,at,T);
N.text='Uusi asia ensin\n---\nSoita putkimiehelle huomisesta asiasta\n---\nOsta maitoa kaupasta';E.txSync(N,T);
A.deepEqual([0,1,2].map(i=>!!E.partAt(N,i,T)),[false,true,false]);A(!N.done);
// Täysin uudelleenkirjoitettu teksti on avoin
N.text='Jotain aivan muuta\n---\nKokonaan toinen sisältö\n---\nOsta maitoa kaupasta';E.txSync(N,T);A.deepEqual([0,1,2].map(i=>!!E.partAt(N,i,T)),[false,false,false]);
// Tekstien järjestyksen vaihto: kuittaus seuraa sisältöä
N=note('Eka tehtävä tänään\n---\nToka tehtävä huomenna myöhemmin');E.txSet(N,0,true,at,T);N.text='Toka tehtävä huomenna myöhemmin\n---\nEka tehtävä tänään';E.txSync(N,T);
A(!E.partAt(N,0,T));A(E.partAt(N,1,T));
// Kerta-aika: kuittaus on kalenterin kuittaus (pts), ja kalenterin peruutus avaa tekstin
N=note('Hammaslääkäri 5.11. klo 10');E.txSet(N,0,true,at,T);A.deepEqual(Object.keys(N.pts),['2026-11-05 10:00']);A.equal(N.done,at);A.deepEqual(N.tx,[]);
delete N.pts['2026-11-05 10:00'];E.txSync(N,T);A(!N.done);
// Kalenterin kuittaus yksin tekee yhden ajan tekstistä kuitatun
N=note('Hammaslääkäri 5.11. klo 10');N.pts={'2026-11-05 10:00':at};E.txSync(N,T);A.equal(N.done,at);
// Kaksi kertaa: valmis vasta molemmista
N=note('Kokous 3.11. klo 9 ja 5.11. klo 9');N.pts={'2026-11-03 09:00':at};E.txSync(N,T);A(!N.done);N.pts['2026-11-05 09:00']=at;E.txSync(N,T);A(N.done);
// Toistuva: ympyrä kuittaa avoinna olevan kerran, teksti ei valmistu ennen loppua
N=note('Sauna perjantaisin klo 14 vk 50 saakka');E.txSet(N,0,true,at,'2026-10-30');A.deepEqual(Object.keys(N.pts),['2026-10-30 14:00']);A(!N.done);A(E.txOn(N,0,'2026-10-30'));A(!E.txOn(N,0,'2026-11-06'));
E.txSync(N,'2026-12-20');A(N.done);
// Toistuva voittaa samassa tekstissä olevan kerran
N=note('Sauna perjantaisin klo 14 vk 50 saakka, lisäksi 4.11. klo 18');N.pts={'2026-11-04 18:00':at};E.txSync(N,T);A(!N.done);
// Vanha muoto: kuitattu muistiinpano = kaikki tekstit kuitattu, ajalliselle kerralle kuittaus
N=note('Vanha asia\n---\nPalaveri 5.11. klo 12',{done:c});E.txSync(N,T);A.equal(N.done,c);A.equal(N.pts['2026-11-05 12:00'],c);A.equal(N.tx.length,1);
E.txSet(N,0,false,at,T);A(!N.done);A(E.partAt(N,1,T));
// gone: tänään kuitattu näkyy listalla päivän loppuun, arkistoitu ei koskaan
A(!E.gone(note('x',{done:'2026-10-29T10:00:00.000Z'}),T));A(E.gone(note('x',{done:'2026-10-27T10:00:00.000Z'}),T));A(E.gone(note('x',{arch:at}),T));
// Osan kaltainen muistiinpano listalle: tänään kuitattu osa ei ole poistunut
N=note('Eka\n---\nToka');E.txSet(N,0,true,'2026-10-28T08:00:00.000Z',T);A(E.partNote(N,0,T).done);A(!E.partNote(N,1,T).done);
E.txSet(N,1,true,at,T);A(!E.partNote(N,1,T).done);
// Tallennus: tx ja arkistointi ilman kuittausta säilyvät viennissä ja tuonnissa
N=note('Eka asia\n---\nToka asia',{arch:at});E.txSet(N,0,true,at,T);
const S={id:'k',name:'K',notes:[N],terms:[],words:{},projects:[],reps:[],imp:[],trash:[],chk:[],grp:[],lists:[],ehdot:[]};
const back=E.projectsFromFile(JSON.parse(JSON.stringify(E.projectFile(S,at))),T)[0].notes[0];A.equal(back.arch,at);A.deepEqual(back.tx,[{t:'Eka asia',i:0,ok:at}]);
console.log('1.98: tekstikohtainen kuittaus, kohdistus muokatessa, kalenterin yhdistyminen, toistuva, vanha muoto, arkisto ja vienti OK');
