#!/bin/sh
# Ajaa Pakettipelin testit. Käyttö: sh pakettipeli/testit/aja.sh (repon juuresta).
# Vaatii: node, python3, playwright (node) (Chromium).
cd "$(dirname "$0")" || exit 1
python3 poimi.py ../index.html pp.js || exit 1
node --check pp.js || exit 1
virheet=0
mkdir -p tulosteet
for f in logiikka_*.js; do
  if node "$f" > "tulosteet/$f.txt" 2>&1; then echo "ok    $f"; else echo "VIRHE $f"; grep -A2 FAIL "tulosteet/$f.txt"; virheet=1; fi
done
cd tulosteet || exit 1
for f in ../selain_*.js; do
  n=$(basename "$f")
  if node "$f" > "$n.txt" 2>&1; then echo "ok    $n (tuloste ja kuvat: tulosteet/)"; else echo "VIRHE $n"; grep -E "^FAIL|Error" "$n.txt" | head -20; virheet=1; fi
done
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
