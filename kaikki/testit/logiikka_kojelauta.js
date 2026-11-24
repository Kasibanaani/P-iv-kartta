'use strict';
const assert = require('node:assert/strict');
const {KAAVA, MUUTTUJA, VAULT, dayEntries, occKey, ptDone, txSync} = require('./engine.js');
const today = '2026-11-24';

const calendarNote = VAULT.noteOf('kalenteri/2026/arki.md', [
  '---', 'luotu: 2026-11-24', '---', '# Ensimmäinen', '24.11.2026',
  '---', 'Toinen', '24.11.2026', '---', 'Kolmas', '24.11.2026 klo 9',
  '---', 'Neljäs', '24.11.2026 klo 9', '',
].join('\n'));
const entries = dayEntries([calendarNote], today);
const keys = entries.untimed.concat(entries.timed).map(({o}) => occKey(today, o));
assert.deepEqual(keys, [today, today+'#1', today+' 09:00', today+' 09:00#1']);
calendarNote.pts = {[keys[1]]:today+'T12:00:00'};
txSync(calendarNote, today);
assert.deepEqual(keys.map(key => ptDone(calendarNote, key)), [false, true, false, false]);
const saved = VAULT.mdOf(calendarNote);
assert.match(saved, /kuitattu: 2026-11-24#1\n/);
assert.equal(VAULT.split(saved).body, VAULT.split(VAULT.mdOf({...calendarNote, pts:undefined})).body);
const reloaded = VAULT.noteOf(calendarNote.vp, saved);
assert.deepEqual(keys.map(key => ptDone(reloaded, key)), [false, true, false, false]);
delete reloaded.pts[keys[1]];
txSync(reloaded,today);
assert.equal(ptDone(reloaded, keys[1]), false);

function note(path, date, field, tag, body = '') {
  return {vp:path, created:date+'T12:00:00', vfm:['uni: '+field, 'tagit: ['+tag+']'], text:body};
}
const notes = [
  note('paivat/2026/2026-11-24.md','2026-11-23','8','arki','!!Uni: 99!!'),
  note('paivat/2026/toinen.md','2026-11-22','6,5','arki'),
  note('paivat/2026/nolla.md','2026-11-20','0','arki'),
  note('paivat/2026/tyhja.md',today,'','arki','!!Uni: 20!!'),
  note('paivat/2026/vanha.md','2026-10-01','100','arki'),
  note('paivat/2026/viikonloppu.md',today,'100','viikonloppu'),
  note('inbox/ulkopuoli.md',today,'100','arki'),
];
const fields = KAAVA.create(notes, new Set());
const settings = {muuttuja:'uni',lahde:'kentta',laske:'keskiarvo',aika:'30',tunniste:'#Arki',kansio:'paivat'};
const result = MUUTTUJA.ruutu(notes,settings,today,fields);
assert.equal(result.arvo,(8+6.5)/3);
assert.deepEqual(result.lahteet.map(x=>x.o.arvo),['8','6.5','0']);
assert.equal(result.sarja.find(x=>x.d==='2026-11-20').v,0);
assert.equal(result.sarja.find(x=>x.d==='2026-11-21').v,null);
assert.equal(result.sarja.find(x=>x.d===today).v,8);
assert.equal(MUUTTUJA.ruutu(notes,{...settings,laske:'maara'},today,fields).arvo,3);
assert.equal(MUUTTUJA.ruutu(notes,{...settings,laske:'min'},today,fields).arvo,0);
assert.equal(MUUTTUJA.ruutu(notes,{...settings,laske:'max'},today,fields).arvo,8);
assert.equal(MUUTTUJA.ruutu(notes,{...settings,laske:'viimeisin'},today,fields).arvo,8);

const legacy = {...note('paivat/2026/vanha-teksti.md',today,'','arki','uni: 6,5'),vfm:[]};
const computed = {...note('paivat/2026/kaava.md',today,'=2*4','arki'),date:'2026-11-23'};
const testNotes = [legacy,computed];
const allowed = KAAVA.create(testNotes,new Set(['uni']));
const mixed = MUUTTUJA.ruutu(testNotes,{...settings,tunniste:''},today,allowed);
assert.equal(mixed.arvo,7.25);
assert.deepEqual(mixed.lahteet.map(x=>x.o.paivat),[[today],['2026-11-23']]);
console.log('logiikka_kojelauta ok');

const fs = require('node:fs');
const vm = require('node:vm');
const {TAULUKKO} = require('./engine.js');
const ui = fs.readFileSync(require('node:path').join(__dirname, 'ui.js'), 'utf8');
const tableCode = ui.slice(ui.indexOf('var MVB_PATH='), ui.indexOf('function mvbFmt('));
const table = {TAULUKKO};
vm.runInNewContext(tableCode, table);
const legacyFile = [
  '# Ruutuni', '', '| id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  '| r1 | Uni | Uni | viimeisin | 30 | | | h | luku |', '', 'Oma huomautus.', '',
].join('\n');
const fieldRow = ['r2','Uni kentistä','uni','keskiarvo','30','','paivat','h','luku','kentta'];
const checklistRow = ['r3','','','','','arki','kalenteri','','','tarkistuslista'];
const firstSaved = table.mvbPatch(legacyFile,null,fieldRow,false);
const secondSaved = table.mvbPatch(firstSaved,null,checklistRow,false);
assert.match(firstSaved, /\| nayta \| lahde \|/);
assert.match(secondSaved, /Oma huomautus\.\n$/);
const loaded = table.mvbParse(secondSaved).rows;
assert.equal(loaded.length,3);
assert.equal(loaded[0][2],'Uni');
assert.equal(loaded[0][9],'');
assert.equal(loaded[2][9],'tarkistuslista');
assert.equal(table.mvbPatch(secondSaved,loaded[2],checklistRow,true).includes('r3'),false);
assert.match(table.mvbPatch(secondSaved,[...loaded[1].slice(0,1),'Väärä otsikko',...loaded[1].slice(2)],fieldRow,false).error,/muutettiin muualla/);
