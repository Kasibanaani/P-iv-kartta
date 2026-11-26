/* Muistiinpanon käyttöelementit, atominen kirjaus, päiväkuvaaja ja puuttuva päivä. */
const assert = require('node:assert/strict');
const { KAAVA, MUUTTUJA } = require('./engine.js');
const today = '2026-11-26';
const provenance = { created: today + 'T12:00:00' };
const note = {
  ...provenance, vp:'inbox/uni.md',
  text:[
    '((rauha: =KYTKIN("Rauhoita ilta")))',
    '((ulkona: =VALINTA(true; false; tyhjä = "Kirjaamatta"; tallenna = "päivään")))',
    '((vesi: =ASKELLUS(min = 0; max = 8; askel = 1)))',
    '((iltarutiini: =TARKISTUSLISTA("Tiskit"; "Eväät"; tallenna = "päivään")))',
    '((paino: =LUKUKENTTÄ(min = 1; max = 500; askel = 0,5; alku = 80)))',
    '((toistot: =LUKUKENTTÄ(min = 1; max = 100; alku = 8)))',
    '((liike: =VALINTA("Penkki"; "Soutu")))',
    '((Ohje: =NÄYTÄ(rauha; "Puhelin sivuun")))',
    '((=KOKEILU()))',
    '((=PAINIKE("Kirjaa sarja"; KIRJAA(liike; "paino (kg)" = paino; toistot = toistot; "sarjapaino (kg)" = paino * toistot))))',
    '((19.11.2026; Minä: uni = 6 h))',
    '((23.11.2026; Minä: uni = 7 h))',
    '((24.11.2026; Minä: uni = 8 h))',
    '((26.11.2026; Minä: uni = 0 h))',
    '((26.11.2026; ulkona = false; ^'+KAAVA.controlToken('ulkona',today)+'))',
    MUUTTUJA.formatMany([{name:'iltarutiini',value:'["Tiskit"]',literal:true}],'',today,'',KAAVA.controlToken('iltarutiini',today)),
  ].join('\n'),
};
const preview = {note,values:new Map()};
const engine = KAAVA.create([note],new Set(),null,{today,preview});
const result = source => engine.trace(source,note).value;
const run = source => engine.run(source,note);
assert.equal(result('=rauha'),false);
assert.equal(result('=ulkona'),false);
assert.equal(result('=vesi'),0);
assert.deepEqual(result('=iltarutiini'),['Tiskit']);
assert.deepEqual(run('=MÄÄRÄ(NIMETTY("iltarutiini"))'),{value:1});
assert.deepEqual(result('=Ohje'),{hidden:true});
assert.equal(result('=SISÄLTÄÄ(iltarutiini; "Tiskit")'),true);
assert.equal(run('=viimeisin(SARJA(""; "uni (h)"))').value,0);
assert.equal(result('=KIRJAUKSET(OMA_SARJA(""; "uni (h)"); aika=TÄNÄÄN())').records.length,1);
const button = KAAVA.noteSpans(note.text).blocks.find(b=>b.control?.action).control;
assert.deepEqual(engine.action(button.action,note),{value:{subject:'Penkki',pairs:[
  {name:'paino (kg)',value:80},{name:'toistot',value:8},{name:'sarjapaino (kg)',value:640}
]}});
assert.deepEqual(engine.action('=KIRJAA("Penkki"; x = 1; x = 2)',note),{error:'#ARVO!'});
assert.deepEqual(engine.action('=KIRJAA("Penkki"; x = "")',note),{error:'#PUUTTUU'});
assert.equal(KAAVA.noteSpans('((v: =VALINTA("A"; "A")))').blocks[0].control.error.length>0,true);
const chart = result('=KUVAAJA(OMA_SARJA("Minä"; "uni (h)"); alku="23.11.2026"; loppu=TÄNÄÄN(); esitys="viiva"; liukuva=7; tavoite=7)').chart;
assert.equal(chart.points.length,4);
assert.deepEqual(chart.points.map(p=>p.value),[7,8,null,0]);
assert.equal(chart.points[0].average,6.5);
assert.equal(chart.points[2].average,7);
assert.equal(chart.goal,7);
assert.equal(chart.unit,'h');
assert.equal(chart.summary,5);
const bars = result('=KUVAAJA(SARJA(""; "uni (h)"); aika="7 päivää"; esitys="pylväät"; kooste="summa")').chart;
assert.equal(bars.summary,15);
assert.deepEqual(bars.points.map(p=>p.value),[null,null,null,7,8,null,0]);
preview.values.set('rauha',true);
preview.values.set('paino',82.5);
engine.refreshPreview();
assert.equal(result('=Ohje'),'Puhelin sivuun');
assert.equal(engine.action(button.action,note).value.pairs[2].value,660);
console.log('Uudet säätimet, kirjauskaava ja päiväkuvaaja toimivat.');
