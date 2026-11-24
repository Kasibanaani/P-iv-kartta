'use strict';
const assert = require('node:assert/strict');
const {MUUTTUJA: M, observationMatrix} = require('./engine.js');

const today = '2026-11-24';
const unit = 'Annos (g)';
const subject = 'Fileesuikale';
const line = '((Fileesuikale @2026-11-24 | Annos (g): 150 | Rasia auki: false | #ravinto))';
const half = '((Fileesuikale @2026-11-24 09:15 | Annos (g): 75))';
const notes = [
  {text: '# Ruoat\n#paiva\n' + line + '\n' + line},
  {text: '((Fileesuikale @2026-11-23 | Annos (g): 100))\n' + half},
  {text: '((Lohi @2026-11-24 | Annos (g): 20))'},
  {text: '24.11.2026\n((Fileesuikale\n | Proteiini (g): 23\n | Annos (g): 200\n | Selite: "A | B"))'},
  {text: 'Esimerkki `((Uni (h): 99))`.\n((Uni (h): 8))'},
];
const obs = M.parse(notes[0].text);
assert.equal(obs.length, 4);
assert.notEqual(obs[0].s, obs[2].s);
assert.equal(obs[0].block, obs[1].block);
assert.equal(obs[1].totuus, false);
assert.deepEqual(obs[0].tagit, ['ravinto']);
assert.equal(M.parse(notes[3].text)[2].arvo, 'A | B');
assert.deepEqual(M.parse(notes[3].text)[0].paivat, []);
assert.equal(M.parse(notes[4].text)[0].luku, 8);
assert.equal(M.parse('((Fileesuikale @2026-02-30 | Annos (g): 99))').length, 0);
assert.equal(M.parse('((Fileesuikale @2026-11-24 25:00 | Annos (g): 99))').length, 0);
assert.deepEqual(M.parse('((@2026-11-23,2026-11-24 | Uni: 8))')[0].paivat, ['2026-11-23','2026-11-24']);
assert.equal(M.parse(M.format('Valinta | oma', 'A | B', subject, today, 'ravinto', 'qh1'))[0].block.id, 'qh1');
assert(!M.mask(line).includes(today));

const spec = {kohde:subject, muuttuja:unit, alku:today, loppu:today, havaintotunniste:'ravinto'};
assert.equal(M.ruutu(notes, {...spec,laske:'maara'}, today).arvo, 2);
assert.equal(M.ruutu(notes, {...spec,laske:'summa'}, today).arvo, 300);
assert.equal(M.ruutu(notes, {...spec,laske:'keskiarvo'}, today).arvo, 150);
assert.equal(M.ruutu(notes, {...spec,laske:'luettelo'}, today).arvo, '150, 150');
assert.equal(M.ruutu(notes, {...spec,laske:'viimeisin'}, today).arvo, '2 arvoa');
assert.equal(M.ruutu(notes, {...spec,laske:'maara',tunniste:'ravinto'}, today).arvo, 0);
assert.equal(M.ruutu(notes, {...spec,laske:'viimeisin',havaintotunniste:''}, today).arvo, 75);

const config = {rowAxis:'kohde',colAxis:'valitut',subjects:[subject,'Kana'],start:today,end:today,tag:'ravinto',
  columns:[{name:unit,mode:'arvo'},{name:unit,mode:'summa'}]};
let model = observationMatrix(notes, config);
assert.deepEqual(model.rows.map(x=>x[1].label), [subject,'Kana']);
assert.equal(model.rows[0][1].cells.get(0).length, 2);
assert.equal(M.summary(model.rows[0][1].cells.get(1), 'summa'), 300);
assert.equal(model.rows[1][1].cells.size, 0);
model = observationMatrix(notes, {...config,rowAxis:'kirjaus'});
assert.equal(model.rows.length, 2);
model = observationMatrix(notes, {...config,rowAxis:'muuttuja',colAxis:'kohde',mode:'maara'});
assert.equal(model.rows.find(x=>x[1].label===unit)[1].cells.get('fileesuikale').length, 2);

const resolve = (kind, name) => {
  if (kind === 'subjects' && [subject, 'Broileri'].includes(name)) return {key:'def-ruoka',name:'Broileri'};
  return {key:M.key(name),name};
};
model = observationMatrix(notes, {...config,subjects:['Broileri']}, resolve);
assert.equal(model.rows[0][1].cells.get(0).length, 2);
assert.equal(M.ruutu(notes,{...spec,kohde:'Broileri',laske:'maara'},today,null,resolve).arvo,2);
console.log('Havaintolohkot, samat aikaleimat, suodatus, pivotointi ja nimitunnisteet toimivat.');
