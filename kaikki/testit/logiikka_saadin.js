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
console.log('säätimet ok');
