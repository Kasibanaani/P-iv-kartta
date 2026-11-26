'use strict';
/* 0.99 (A6.4–A6.5): pohjaan jäävä nappi (laji pohjaan) ja XY-pädi (laji xy): tiedostomuoto, jakson tunniste, poisto, palautus ja akselit. */
const assert = require('node:assert/strict');
const {SAADIN: S, MUUTTUJA: M} = require('./engine.js');

const file = [
  '# Säätimet', '',
  '## Kahvi', '- tunnus: kahvi', '- laji: pohjaan', '- muuttuja: Kahvi (kpl)', '- arvo: 1', '',
  '## Lenkki', '- tunnus: lenkki', '- laji: pohjaan', '- teksti: Lenkki tehty', '- minne: [[treenit]]', '- aika: viikko', '',
  '## Vire', '- tunnus: vire', '- laji: xy', '- muuttuja: Vire', '- min: 0', '- max: 10', '- askel: 1', '- suhteellinen: kylla',
  '- muuttuja: Mieliala', '- yksikko: p', '- min: -5', '- max: 5', '- askel: 0,5', '- kohde: Olo', '- tapa: paivita', '',
  '## Kysyvä', '- tunnus: kysyva', '- laji: pohjaan', '- teksti: x', '- aika: kysy', '',
].join('\n');
const doc = S.parse(file);
const [kahvi, lenkki, vire, kysyva] = doc.items;
assert.equal(kahvi.laji, 'pohjaan');
assert.equal(kahvi.virhe, '');
assert.equal(vire.laji, 'xy');
assert.equal(vire.virhe, '');
assert.deepEqual(vire.vars, [
  {nimi: 'Vire', arvo: '', yksikko: '', min: '0', max: '10', askel: '1', suhteellinen: true},
  {nimi: 'Mieliala', arvo: '', yksikko: 'p', min: '-5', max: '5', askel: '0,5', suhteellinen: false},
]);
assert.deepEqual(kahvi.vars, [{nimi: 'Kahvi (kpl)', arvo: '1', yksikko: ''}], 'muilla lajeilla ei akselikenttiä');
assert.match(S.check(kysyva), /ei kysy päivää/);
assert.deepEqual(S.asked(vire), [], 'XY ei kysy arvoa: se tulee pädiltä');

/* Rivit tiedostoon ja takaisin */
const again = S.parse('# S\n\n' + S.lines(vire).join('\n') + '\n').items[0];
assert.deepEqual(again.vars, vire.vars);
assert.ok(S.lines(vire).includes('- suhteellinen: kylla'));
assert.ok(!S.lines(vire).some(l => l.startsWith('- arvo')));
assert.ok(S.lines(kahvi).includes('- laji: pohjaan'));

/* Tarkistukset */
assert.match(S.check({...vire, vars: [{nimi: 'Vire', min: '5', max: '5'}]}), /suurempi/);
assert.match(S.check({...vire, vars: [{nimi: 'Vire', min: '', max: '5'}]}), /pienin ja suurin/);
assert.match(S.check({...vire, vars: [{nimi: 'Vire', min: '0', max: '5', askel: '9'}]}), /askel/);
assert.match(S.check({...vire, vars: [{nimi: 'a', min: '0', max: '1'}, {nimi: 'b', min: '0', max: '1'}, {nimi: 'c', min: '0', max: '1'}]}), /kaksi akselia/);
assert.match(S.check({...vire, teksti: 'x'}), /vain muuttujia/);
assert.equal(S.check(vire), '');

/* Pohjaan jäävä nappi: jakson tunniste rivillä, tila tekstistä, poisto ja palautus */
const day = {day: '2026-11-26', clock: '08:15', dayNote: true};
const mk = S.mark(kahvi, day);
assert.equal(mk, 'kahvi-2026-11-26');
assert.equal(S.mark(lenkki, {day: '2026-11-26', week: '2026-W48'}), 'lenkki-2026-w48');
const line = S.record(kahvi, {...day, mark: mk, id: 'qhX'});
assert.equal(line, '- ((26.11.2026 klo 08.15; Kahvi (kpl) = 1; ^kahvi-2026-11-26))', 'jakson tunniste korvaa kertatunnuksen');
assert.equal(M.parse(line, new Date(2026, 10, 26))[0].luku, 1, 'havainto luetaan kuten ennen');
const tline = S.record(lenkki, {day: '2026-11-26', week: '2026-W48', mark: 'lenkki-2026-w48'});
assert.equal(tline, '- Lenkki tehty ^lenkki-2026-w48');
const note = '# Päivä\n\nAamu.\n\n## Pikakirjaukset\n\n- Muu rivi\n';
const on = S.write(note, kahvi, line, {dayNote: true}).text;
assert.ok(S.has(on, mk));
assert.ok(!S.has(note, mk));
assert.ok(!S.has(on, 'kahvi-2026-11-27'), 'toinen päivä ei ole päällä');
assert.ok(!S.has(on.replace('^kahvi-2026-11-26', '^kahvi-2026-11-260'), mk), 'tunnisteen pitää täsmätä kokonaan');
const off = S.remove(on, mk);
assert.equal(off.text, note, 'pois kytkeminen poistaa täsmälleen kirjoitetun rivin');
assert.equal(off.removed.length, 1);
assert.equal(S.remove(note, mk), null);
assert.equal(S.restore(off.text, off.removed, mk), on, 'Kumoa palauttaa rivin samaan kohtaan');
assert.equal(S.restore(on, off.removed, mk), on, 'palautus ei tuplaa');
/* Käsin muokattu rivi tunnisteineen poistuu silti (tunniste kertoo, että rivi on napin). Käsin poistettu rivi vapauttaa napin. */
const edited = on.replace('Kahvi (kpl) = 1', 'Kahvi (kpl) = 2');
assert.ok(S.has(edited, mk));
assert.equal(S.remove(edited, mk).text, note);
const crlf = on.replace(/\n/g, '\r\n');
assert.equal(S.remove(crlf, mk).text, note.replace(/\n/g, '\r\n'));

/* XY-akselit */
const X = S.axis(vire.vars[0]), Y = S.axis(vire.vars[1]);
assert.deepEqual([X.min, X.max, X.step, X.dec, X.rel], [0, 10, 1, 0, true]);
assert.deepEqual([Y.min, Y.max, Y.step, Y.dec, Y.unit], [-5, 5, 0.5, 1, 'p']);
const RX = S.xyRange(X, 7);
assert.deepEqual([RX.lo, RX.hi, RX.mid], [2, 12, 7], 'suhteellinen: edellinen arvo keskellä');
assert.equal(S.xyAt(X, RX, 0.5), 7);
assert.equal(S.xyAt(X, RX, 1), 10, 'rajojen yli ei mennä');
assert.equal(S.xyAt(X, RX, 0.62), 8);
const RX0 = S.xyRange(X, null);
assert.deepEqual([RX0.lo, RX0.hi, RX0.mid], [0, 10, 5], 'ilman edellistä arvoa koko väli');
const RY = S.xyRange(Y, 1.5);
assert.deepEqual([RY.lo, RY.hi, RY.mid], [-5, 5, 1.5], 'kiinteä väli, edellinen arvo aloituskohtana');
assert.equal(S.xyText(Y, S.xyAt(Y, RY, 0.26)), '-2,5');
assert.equal(S.axis({min: '0', max: '0,5'}).step, 0.01);
assert.equal(S.axis({min: '0', max: '5'}).step, 0.1);
const xyLine = S.record(vire, {day: '2026-11-26', clock: '20:00', values: ['8', S.xyText(Y, -2.5)], dayNote: true, id: 'qh1'});
assert.equal(xyLine, '- ((26.11.2026 klo 20.00; Olo: Vire = 8; Mieliala = -2,5 p; ^vire))');
const obs = M.parse(xyLine, new Date(2026, 10, 26));
assert.deepEqual(obs.map(o => [o.nimi, o.luku]), [['Vire', 8], ['Mieliala (p)', -2.5]]);
/* Päivitä-tapa korvaa oman rivin */
const n1 = S.write('# P\n', vire, xyLine, {}).text;
const n2 = S.write(n1, vire, xyLine.replace('Vire = 8', 'Vire = 6'), {}).text;
assert.equal((n2.match(/\^vire/g) || []).length, 1);
assert.ok(n2.includes('Vire = 6'));
console.log('logiikka_saadin_99 ok');
