#!/bin/sh
# Sävellyspajan testit. Käyttö repon juuresta: sh savellys/testit/aja.sh
# Vaatii: node ja playwright (Chromium). Tulosteet ja kuvat: savellys/testit/tulosteet/
cd "$(dirname "$0")" || exit 1
virheet=0
node logiikka.js > /dev/null 2>&1 && echo "ok    logiikka.js ($(node logiikka.js | tail -1))" || { echo "VIRHE logiikka.js"; node logiikka.js | grep -A2 FAIL; virheet=1; }
mkdir -p tulosteet
if node selain.js > tulosteet/selain.txt 2>&1; then echo "ok    selain.js ($(tail -1 tulosteet/selain.txt))"; else echo "VIRHE selain.js"; grep -A3 -E "^FAIL|Error" tulosteet/selain.txt | head -40; virheet=1; fi
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
