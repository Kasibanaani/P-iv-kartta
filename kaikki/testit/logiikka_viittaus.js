/* Kaikki 0.40 (A3.3): rivien ja sarakkeiden muutos päivittää kaavojen viittaukset. */
const assert = require('node:assert/strict');
const {TAULUKKO} = require('./engine.js');
const R = TAULUKKO.remap;
const own = n => n === null || n.toLowerCase() === 'kulut';
const ins = (k, n) => i => i >= k ? i + n : i;          // lisäys kohtaan k
const del = (k, n) => i => i < k ? i : i < k + n ? -1 : i - n;
// rivin lisäys rivin 2 kohdalle (indeksi 1)
assert.equal(R('=B2*C3', own, 'row', ins(1, 1)), '=B3*C4');
assert.equal(R('=B1+B2', own, 'row', ins(1, 1)), '=B1+B3');
assert.equal(R('=SUMMA(B1:B4)', own, 'row', ins(1, 1)), '=SUMMA(B1:B5)');
assert.equal(R('=SUMMA(B1:B4)', own, 'row', ins(4, 2)), '=SUMMA(B1:B4)');
// toinen välilehti ja vieras välilehti
assert.equal(R('=[[kulut]]!B2+[[muut]]!B2', own, 'row', ins(0, 1)), '=[[kulut]]!B3+[[muut]]!B2');
assert.equal(R('=B2', n => n !== null && n === 'kulut', 'row', ins(0, 1)), '=B2', 'oma viittaus toisessa välilehdessä ei muutu');
// poisto
assert.equal(R('=SUMMA(B1:B4)', own, 'row', del(1, 2)), '=SUMMA(B1:B2)');
assert.equal(R('=B2+1', own, 'row', del(1, 1)), '=#VIITTAUS+1');
assert.equal(R('=SUMMA(B2:B3)', own, 'row', del(1, 2)), '=SUMMA(#VIITTAUS)');
// sarakkeet
assert.equal(R('=A1+C1', own, 'col', ins(1, 1)), '=A1+D1');
assert.equal(R('=SUMMA(A1:C1)', own, 'col', del(0, 1)), '=SUMMA(A1:B1)');
assert.equal(R('=AA1', own, 'col', ins(0, 1)), '=AB1');
// funktiot, merkkijonot, muistiinpanokentät ja kentän nimet eivät muutu
assert.equal(R('=JOS(B2>1;"B2";[[remontti]].hinta)', own, 'row', ins(0, 1)), '=JOS(B3>1;"B2";[[remontti]].hinta)');
assert.equal(R('=SUMMA(hinta; tunniste = remontti)', own, 'row', ins(0, 1)), '=SUMMA(hinta; tunniste = remontti)');
assert.equal(R('=LOG10(B2)', own, 'row', ins(0, 1)), '=LOG10(B3)');
// siirto: yksittäinen seuraa, alue pysyy
const swap = (a, b) => i => i === a ? b : i === b ? a : i;
assert.equal(R('=B2+SUMMA(B1:B4)', own, 'row', swap(1, 2), true), '=B3+SUMMA(B1:B4)');
// ei kaava
assert.equal(R('B2', own, 'row', ins(0, 1)), 'B2');
// tuloksen kaava laskee yhä
assert.ok(!/#KAAVA/.test(JSON.stringify(R('=SUMMA(B1:B4)*2', own, 'row', ins(1, 1)))));
console.log('ok logiikka_viittaus');
