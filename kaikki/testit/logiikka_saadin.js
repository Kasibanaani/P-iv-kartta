'use strict';
/* 0.88: säätimien tiedostomuoto (pohjat/saatimet.md), kirjausrivi, kirjoitus, päivitys ja kumous. */
const assert = require('node:assert/strict');
const {SAADIN: S, MUUTTUJA: M, parseDates} = require('./engine.js');

const file = [
  '---', 'tyyppi: pohja', 'otsikko: Säätimet', '---', '# Säätimet', '',
  '## Kahvi', '- tunnus: kahvi', '- laji: kertanappi', '- muuttuja: Kahvi (kpl)', '- arvo: 1', '- havaintotunniste: ravinto',
  '- Oma huomautus säilyy', '',
  '## Herätys', '- aikaleima: kylla', '- tapa: paivita', '- minne: [[unipaivakirja]]', '',
  '## Paino', '- muuttuja: Paino (kg)', '- aika: kysy', '- minne: oma', '',
  '## Rikki', '- tunnus: Iso Kirjain', '',
  '## Tuleva', '- tunnus: tuleva', '- laji: liukusaadin', '',
].join('\n');
const doc = S.parse(file);
assert.equal(doc.items.length, 5);
const [kahvi, heratys, paino, rikki, tuleva] = doc.items;
assert.equal(kahvi.tunnus, 'kahvi');
assert.equal(kahvi.arvo, '1');
assert.equal(kahvi.tag, 'ravinto');
assert.equal(kahvi.minne, 'paiva');
assert.equal(kahvi.aika, 'nyt');
assert.equal(kahvi.pikakirjaus, true);
assert.deepEqual(kahvi.muut, ['- Oma huomautus säilyy']);
assert.equal(heratys.tunnus, 'heratys', 'puuttuva tunnus tulee nimestä');
assert.equal(heratys.tapa, 'paivita');
assert.equal(heratys.minne, 'teksti');
assert.equal(heratys.linkki, 'unipaivakirja');
assert.equal(paino.arvo, '', 'puuttuva arvo = kysytään');
assert.equal(paino.aika, 'kysy');
assert.equal(paino.minne, 'oma');
assert.ok(rikki.virhe);
assert.match(tuleva.virhe, /liukusaadin/);
assert.equal(kahvi.virhe, '');

/* Kirjausrivit */
const now = {day: '2026-11-24', clock: '12:30', value: '', dayNote: true, id: 'qh1'};
assert.equal(S.record(kahvi, {...now, value: kahvi.arvo}), '- ((24.11.2026 klo 12.30, Kahvi (kpl) = 1, #ravinto, ^qh1))');
const line = S.record(kahvi, {...now, value: '2'});
const seen = M.parse(line, new Date(2026, 10, 24));
assert.equal(seen.length, 1);
assert.equal(seen[0].luku, 2);
assert.deepEqual(seen[0].paivat, ['2026-11-24']);
assert.equal(seen[0].kello, '12:30');
assert.equal(S.record(heratys, {...now, dayNote: false}), '- 2026-11-24 klo 12.30 · Herätys ^heratys');
assert.equal(S.record(heratys, {...now, clock: '', dayNote: true}), '- Herätys ^heratys');
assert.equal(S.record({...heratys, tapa: 'lisaa'}, now), '- klo 12.30 · Herätys');
assert.equal(S.record(paino, {...now, value: ''}), '', 'tyhjä arvo ei kelpaa');
assert.equal(S.record({...paino, teksti: 'Aamupaino'}, {...now, value: '72,4'}), '- Aamupaino ((24.11.2026 klo 12.30, Paino (kg) = 72,4, ^qh1))');
assert.equal(S.record({...paino, tapa: 'paivita'}, {...now, clock: '', value: '72,4'}), '- ((24.11.2026, Paino (kg) = 72,4, ^paino))');

/* Kalenteri ei lue säätimen aikaleimaa ajankohdaksi: rivin alku peitetään noteDates-funktiossa. */
const masked = '- 2026-11-24 klo 12.30 · Herätys'.replace(/^- \d{4}-\d\d-\d\d(?: klo \d\d\.\d\d)? · /gm, x => x.replace(/\S/g, ' '));
assert.equal(parseDates(masked, new Date(2026, 10, 24)).length, 0);

/* Kirjoitus päivän muistiinpanoon: Pikakirjaukset-osio, muu teksti säilyy */
const day = '# 2026-11-24\n\nOma teksti.\n';
let r = S.write(day, kahvi, '- A', {dayNote: true});
assert.equal(r.text, '# 2026-11-24\n\nOma teksti.\n\n## Pikakirjaukset\n\n- A\n');
assert.equal(r.before, null);
r = S.write(r.text, kahvi, '- B', {dayNote: true});
assert.equal(r.text, '# 2026-11-24\n\nOma teksti.\n\n## Pikakirjaukset\n\n- A\n- B\n');
r = S.write('', kahvi, '- C', {dayNote: true, template: '# 2026-11-25\n'});
assert.equal(r.text, '# 2026-11-25\n\n## Pikakirjaukset\n\n- C\n');
const later = '# P\n\n## Pikakirjaukset\n\n- A\n\n## Illalla\n\nTeksti\n';
assert.equal(S.write(later, kahvi, '- B', {dayNote: true}).text, '# P\n\n## Pikakirjaukset\n\n- A\n- B\n\n## Illalla\n\nTeksti\n');

/* Kirjoitus muuhun muistiinpanoon: loppuun, listan perään ilman tyhjää riviä */
assert.equal(S.write('# Uni\n\nKappale.', heratys, '- X ^heratys', {}).text, '# Uni\n\nKappale.\n\n- X ^heratys\n');
assert.equal(S.write('# Uni\n\n- vanha\n\n', kahvi, '- Y', {}).text, '# Uni\n\n- vanha\n- Y\n');

/* Päivitys korvaa oman rivin, kumous palauttaa sen */
const before = '# Uni\n\n- 2026-11-23 klo 07.00 · Herätys ^heratys\n- muu\n';
r = S.write(before, heratys, '- 2026-11-24 klo 06.45 · Herätys ^heratys', {});
assert.equal(r.text, '# Uni\n\n- 2026-11-24 klo 06.45 · Herätys ^heratys\n- muu\n');
assert.equal(r.before, '- 2026-11-23 klo 07.00 · Herätys ^heratys');
assert.equal(S.undo(r.text, r.before, '- 2026-11-24 klo 06.45 · Herätys ^heratys'), before);
const block = '- ((24.11.2026, Paino (kg) = 72, ^paino))';
r = S.write('# P\n\n' + block + '\n', {...paino, tapa: 'paivita'}, '- ((24.11.2026, Paino (kg) = 71, ^paino))', {});
assert.equal(r.before, block);
assert.equal(S.own(['- ((x = 1, ^painoindeksi))'], 'paino'), -1, 'toisen säätimen tunnus ei käy');

/* Kumous poistaa lisätyn rivin; jos rivi on jo muuttunut, ei tehdä mitään */
const added = S.write(day, kahvi, '- A', {dayNote: true}).text;
assert.equal(S.undo(added, null, '- A'), '# 2026-11-24\n\nOma teksti.\n\n## Pikakirjaukset\n\n');
assert.equal(S.undo(added, null, '- muokattu'), null);

/* Tiedoston muokkaus: uusi, muutos, ristiriita, poisto */
const fresh = S.patch('', null, {nimi: 'Kahvi', tunnus: 'kahvi', muuttuja: 'Kahvi (kpl)', arvo: '1', tapa: 'lisaa', minne: 'paiva', aika: 'nyt'});
assert.match(fresh, /^---\ntyyppi: pohja\n/);
assert.match(fresh, /\n## Kahvi\n- tunnus: kahvi\n- laji: kertanappi\n- muuttuja: Kahvi \(kpl\)\n- arvo: 1\n- tapa: lisaa\n- minne: paiva\n- aika: nyt\n$/);
assert.equal(S.parse(fresh).items[0].arvo, '1');
const edited = S.patch(file, kahvi, {...kahvi, nimi: 'Kahvi aamulla', arvo: '2'});
const again = S.parse(edited);
assert.equal(again.items.length, 5);
assert.equal(again.items[0].nimi, 'Kahvi aamulla');
assert.equal(again.items[0].arvo, '2');
assert.deepEqual(again.items[0].muut, ['- Oma huomautus säilyy']);
assert.equal(again.items[1].raw, heratys.raw, 'muut säätimet säilyvät sellaisinaan');
assert.ok(S.patch(edited, kahvi, {...kahvi, arvo: '3'}).error, 'muualla muutettu säädin');
assert.ok(S.patch(file, null, {...kahvi, raw: ''}).error, 'sama tunnus');
assert.ok(S.patch(file, null, {nimi: 'Tyhjä', tunnus: 'tyhja', tapa: 'lisaa', minne: 'paiva', aika: 'nyt'}).error, 'ei kirjoitettavaa');
const removed = S.parse(S.patch(file, heratys, null));
assert.deepEqual(removed.items.map(it => it.tunnus), ['kahvi', 'paino', 'Iso Kirjain', 'tuleva']);
assert.equal(S.patch(file, heratys, null).includes('## Paino'), true);

/* 0.96: monta muuttujaa samaan havaintoon, yksikkö ja kysyttävät arvot */
const multi = S.parse([
  '# S', '', '## Penkki', '- tunnus: penkki', '- ryhma: Treeni', '- muuttuja: paino', '- yksikko: kg', '- muuttuja: toistot',
  '- kohde: Penkki', '- tapa: lisaa', '- Oma rivi', '',
  '## Vanha järjestys', '- arvo: 2', '- muuttuja: Kahvi (kpl)', '- arvo: 3', '',
].join('\n')).items;
const [penkki, vanha] = multi;
assert.deepEqual(penkki.vars, [{nimi: 'paino', arvo: '', yksikko: 'kg'}, {nimi: 'toistot', arvo: '', yksikko: ''}]);
assert.equal(penkki.muuttuja, 'paino');
assert.equal(penkki.virhe, '');
assert.deepEqual(penkki.muut, ['- Oma rivi']);
assert.deepEqual(vanha.vars, [{nimi: 'Kahvi (kpl)', arvo: '2', yksikko: ''}], 'arvo ennen muuttujaa koskee ensimmäistä');
assert.deepEqual(vanha.muut, ['- arvo: 3'], 'toinen arvo samalle muuttujalle säilyy tuntemattomana rivinä');
assert.deepEqual(S.asked(penkki).map(a => a.nimi), ['paino', 'toistot']);
const set = S.record(penkki, {day: '2026-11-25', clock: '18:05', values: ['80', '8'], dayNote: false, id: 'qh2'});
assert.equal(set, '- ((25.11.2026 klo 18.05, Penkki: paino = 80 kg, toistot = 8, ^qh2))');
const seenSet = M.parse(set, new Date(2026, 10, 25));
assert.deepEqual(seenSet.map(o => [o.nimi, o.luku, o.kohde, o.kello]), [['paino (kg)', 80, 'Penkki', '18:05'], ['toistot', 8, 'Penkki', '18:05']]);
assert.equal(S.record(penkki, {day: '2026-11-25', clock: '', values: ['80', ''], dayNote: true, id: 'x'}), '', 'kysytty arvo puuttuu');
assert.equal(S.record({...penkki, vars: [penkki.vars[0], {nimi: 'toistot', arvo: '5', yksikko: ''}]}, {day: '2026-11-25', clock: '', values: ['82,5'], dayNote: true, id: 'x'}),
  '- ((25.11.2026, Penkki: paino = 82,5 kg, toistot = 5, ^x))', 'kiinteä arvo täydentää');
assert.equal(S.withUnit('80 kg', 'kg'), '80 kg');
assert.equal(S.withUnit('80kg', 'kg'), '80kg');
assert.equal(S.withUnit('80', ''), '80');
assert.deepEqual(S.lines(penkki), ['## Penkki', '- tunnus: penkki', '- laji: kertanappi', '- ryhma: Treeni', '- muuttuja: paino', '- yksikko: kg',
  '- muuttuja: toistot', '- kohde: Penkki', '- tapa: lisaa', '- minne: paiva', '- aika: nyt', '- Oma rivi']);
assert.ok(S.check({...penkki, vars: [{nimi: 'paino', arvo: ''}, {nimi: 'Paino', arvo: ''}]}), 'sama muuttuja kahdesti');
assert.ok(S.check({...penkki, vars: [{nimi: 'paino', arvo: '', yksikko: 'kg, g'}]}), 'yksikkö ilman pilkkua');
const roundtrip = S.parse(S.patch('', null, {...penkki, tunnus: 'penkki'})).items[0];
assert.deepEqual(roundtrip.vars, penkki.vars);
console.log('säätimet ok');
