/* Kaikki 0.26: Markdown-solut, välilehtiviitteet ja kehäviittaukset. */
const assert = require('node:assert/strict');
const {TAULUKKO} = require('./engine.js');
const sheet = (id, body, eol='\n') => TAULUKKO.parse(`taulukot/testi/${id}.md`,
  ['---','tyyppi: taulukko','otsikko: '+id,'---','# '+id,'', ...body, '', 'Lopputeksti.', ''].join(eol));
const main = sheet('menot', ['| Kuvaus | Hinta | Laskelma |','| :--- | ---: | --- |',
  '| A \\| B | 2,5 | =SUMMA(B1:B2) |', '| C | 3 | =[[tulot]]!A1 - [[budjetti]].kulu |', '| D | =C3 | =B3 |'], '\r\n');
const other = sheet('tulot', ['| A | B |','| --- | --- |','| 20 | =[[menot]]!B1 |']);
assert.ok(main && other);
assert.deepEqual(main.head, ['Kuvaus','Hinta','Laskelma']);
assert.equal(main.rows[0][0], 'A | B');
assert.equal(TAULUKKO.column(26), 'AA');
const notes = [{vp:'inbox/budjetti.md', vfm:['kulu: 2', 'yhteensa: =[[menot]]!C1'], text:''}];
const model = TAULUKKO.create([main,other], notes, new Set());
assert.deepEqual(model.value(main,0,2), {value:5.5});
assert.deepEqual(model.value(main,1,2), {value:18});
assert.deepEqual(model.value(main,2,1), {error:'#KEHÄ'});
assert.deepEqual(model.value(other,0,1), {value:2.5});
assert.deepEqual(model.formulas.value(notes[0],'yhteensa'), {value:5.5});
assert.deepEqual(model.formulas.run('=SUMMA([[menot]]!B1:B2)', notes[0]), {value:5.5});
assert.deepEqual(model.formulas.run('=[[menot]]!B8', notes[0]), {error:'#PUUTTUU'});
const next = TAULUKKO.replace(main, main.head, [['X | Y','8','']], main.divider);
assert.match(next, /X \\\| Y/);
assert.ok(next.includes('\r\nLopputeksti.\r\n'));
assert.equal(TAULUKKO.parse(main.path,next).rows[0][0], 'X | Y');
console.log('Taulukot, solut, kaavat ja säilyvä Markdown toimivat.');
