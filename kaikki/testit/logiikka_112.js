/* Kaikki 0.112: roskakori säilyttää holvin kentät latauksessa, jotta poisto tunnistetaan uudelleenkäynnistyksen jälkeen. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ctx = {console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/engine.js', 'utf8') + ';this.normSet=normSet;', ctx);
const vfm = ['tyyppi: tieto', 'lahde: claude'];
const out = ctx.normSet({
  muistiinpanot: [{id: 'v1', text: 'Pysyy', created: '2026-11-26T10:00:00Z', vp: 'tieto/pysyy.md', vfm, vpre: '', vpost: '\n', vh: true}],
  roskakori: [
    {id: 'v2', text: 'Koe\n\nAlku.', created: '2026-11-26T10:00:00Z', deleted: '2026-11-27T08:00:00Z', vp: 'tieto/koe.md', vfm, vpre: '', vpost: '\n', vh: true},
    {id: 'n3', text: 'Laitteen oma', created: '2026-11-26T10:00:00Z', deleted: '2026-11-27T08:00:00Z'},
  ],
});
assert.equal(out.notes[0].vp, 'tieto/pysyy.md');
assert.equal(out.trash.length, 2);
assert.equal(out.trash[0].vp, 'tieto/koe.md');
assert.deepEqual(Array.from(out.trash[0].vfm), vfm);
assert.equal(out.trash[0].vh, true);
assert.equal(out.trash[0].vpost, '\n');
assert.equal(out.trash[1].vp, undefined, 'laitteen oma roskakorimuistiinpano ei saa holvin polkua');
console.log('logiikka_112 ok');
