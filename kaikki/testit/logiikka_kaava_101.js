/* Kaikki 0.101 (suunnitelman 21.7): rivin muuttujat ja ehtofunktiot kaavassa. */
const assert = require('node:assert/strict');
const {KAAVA, VAULT} = require('./engine.js');

const allowed = new Set(['hinta', 'selite']);
const note = (path, text) => VAULT.noteOf(path, text);
const lasku = note('projektit/remontti/sahkolasku.md', [
  '---', 'tyyppi: projekti', 'otsikko: Sähkölasku marraskuu', 'luotu: 2026-11-10', 'lahde: emil', 'hinta: 100', '---',
  '# Sähkölasku marraskuu', '', 'Maksettava viimeistään ma 30.11. #remontti #kulut'].join('\n'));
const piha = note('projektit/remontti/piha.md', [
  '---', 'tyyppi: projekti', 'otsikko: Piha', 'luotu: 2026-11-20', 'lahde: emil', 'hinta: 40', 'selite: kivetys', '---',
  '# Piha', '', 'Kiviä ja hiekkaa #remontti'].join('\n'));
const tyhja = note('inbox/ajatus.md', ['---', 'tyyppi: muistiinpano', 'otsikko: Ajatus', 'lahde: emil', '---', '# Ajatus', '', 'Ei mitään erikoista'].join('\n'));
const laite = {id: 'n1', text: 'Laitteen oma muistiinpano', created: '2026-11-25T10:00:00.000Z'};
const notes = [lasku, piha, tyhja, laite];
const before = JSON.stringify(notes);
const engine = KAAVA.create(notes, allowed, null, {today: '2026-11-26'});
const run = (formula, n) => engine.run(formula, n);
const check = (formula, n, expected) => assert.deepEqual(run(formula, n), expected, formula);

// Rivin muuttujat
check('=otsikko', lasku, {value: 'Sähkölasku marraskuu'});
check('=kansio', lasku, {value: 'projektit/remontti'});
check('=kansio', tyhja, {value: 'inbox'});
check('=kansio', laite, {value: 'laite'});
check('=tunnisteet', lasku, {value: 'remontti, kulut'});
check('=tunnisteet', tyhja, {value: ''});
check('=luotu', lasku, {value: '2026-11-10'});
check('=luotu', tyhja, {value: ''}, 'päivätön tuonti ei saa keksittyä luontipäivää');
check('=ajankohta', lasku, {value: '2026-11-30'});
check('=ajankohta', piha, {value: ''});

// Suunnitelman esimerkki
check('=JOS(SISÄLTÄÄ(otsikko; "lasku"); hinta*1,24; hinta)', lasku, {value: 124});
check('=JOS(SISÄLTÄÄ(otsikko; "lasku"); hinta*1,24; hinta)', piha, {value: 40});

// SISÄLTÄÄ: kirjainkoko ja ääkköset eivät ratkaise, puuttuva kenttä on tyhjä, luku pilkulla
check('=SISÄLTÄÄ(otsikko; "SÄHKÖ")', lasku, {value: true});
check('=SISÄLTÄÄ(selite; "KIVE")', piha, {value: true});
check('=SISÄLTÄÄ(selite; "KIVE")', lasku, {value: false});
check('=SISÄLTÄÄ(kansio; "remontti")', piha, {value: true});
check('=SISÄLTÄÄ(tunnisteet; "kulu")', lasku, {value: true});
check('=SISÄLTÄÄ(otsikko)', lasku, {error: '#KAAVA!'});

// ONTUNNISTE: täsmällinen tunniste, risuaita sallittu
check('=ONTUNNISTE("kulut")', lasku, {value: true});
check('=ONTUNNISTE("#Kulut")', lasku, {value: true});
check('=ONTUNNISTE("kulu")', lasku, {value: false});
check('=ONTUNNISTE("kulut")', piha, {value: false});
check('=ONTUNNISTE("")', piha, {error: '#ARVO!'});

// TYHJÄ: puuttuva, tuntematon ja rivin muuttuja
check('=TYHJÄ(selite)', lasku, {value: true});
check('=TYHJÄ(selite)', piha, {value: false});
check('=TYHJÄ(eikukaankäytä)', piha, {value: true});
check('=TYHJÄ(luotu)', tyhja, {value: true});
check('=TYHJÄ(tunnisteet)', tyhja, {value: true});
check('=TYHJÄ(hinta)', piha, {value: false});

// TÄNÄÄN ja PÄIVIÄ (pvm1 → pvm2), myös suomalainen päivä ja kesäajan yli
check('=TÄNÄÄN()', piha, {value: '2026-11-26'});
check('=TÄNÄÄN(1)', piha, {error: '#KAAVA!'});
check('=PÄIVIÄ(luotu; TÄNÄÄN())', piha, {value: 6});
check('=PÄIVIÄ(TÄNÄÄN(); ajankohta)', lasku, {value: 4});
check('=PÄIVIÄ("1.3.2026"; "1.4.2026")', piha, {value: 31});
check('=PÄIVIÄ("2026-10-24"; "2026-10-26")', piha, {value: 2});
check('=PÄIVIÄ("30.11.26"; "2026-12-01")', piha, {value: 1});
check('=PÄIVIÄ(luotu; TÄNÄÄN())', tyhja, {error: '#PUUTTUU'});
check('=PÄIVIÄ("eilen"; TÄNÄÄN())', piha, {error: '#ARVO!'});
check('=PÄIVIÄ("31.2.2026"; TÄNÄÄN())', piha, {error: '#ARVO!'});
check('=JOS(TYHJÄ(luotu); ""; PÄIVIÄ(luotu; TÄNÄÄN()))', tyhja, {value: ''});

// Päivien vertailu: ISO ja suomalainen, tekstin järjestysvertailu on yhä virhe
check('=ajankohta < "1.12.2026"', lasku, {value: true});
check('=luotu = "10.11.2026"', lasku, {value: true});
check('=JOS(ajankohta ≤ TÄNÄÄN(); "myöhässä"; "ajoissa")', lasku, {value: 'ajoissa'});
check('="b" > "a"', lasku, {error: '#ARVO!'});

// Rajaukset ryhmäfunktiossa ja viittaus toisen muistiinpanon riviarvoon
check('=SUMMA(hinta; tunnisteet = kulut)', null, {value: 100});
check('=SUMMA(hinta; luotu > "2026-11-15")', null, {value: 40});
check('=MÄÄRÄ(hinta; luotu ≤ TÄNÄÄN())', null, {value: 2});
check('=SUMMA(hinta; otsikko = piha)', null, {value: 40});
check('=PÄIVIÄ([[piha]].luotu; TÄNÄÄN())', null, {value: 6});
check('=[[sahkolasku]].otsikko', null, {value: 'Sähkölasku marraskuu'});

// Taulukon solu ei ole muistiinpanorivi: rivin muuttujia ei ole, eikä tunnistetta
check('=ONTUNNISTE("kulut")', {sheet: {}}, {value: false});
assert.equal(KAAVA.check('=JOS(SISÄLTÄÄ(otsikko; "x"); 1; 2)'), '');
assert.equal(KAAVA.check('=JOS(1;'), '#KAAVA!');
// iPhonen älylainausmerkit
check('=SISÄLTÄÄ(otsikko; ”lasku”)', lasku, {value: true});
check('=JOS(ONTUNNISTE(„kulut”); “kyllä”; ”ei”)', piha, {value: 'ei'});

assert.equal(JSON.stringify(notes), before, 'kaava ei muuta muistiinpanoja');
console.log('Rivin muuttujat, ehdot ja päivät kaavassa toimivat.');
