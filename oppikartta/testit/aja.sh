#!/bin/sh
# Ajaa Oppikartan testit. Käyttö: sh oppikartta/testit/aja.sh (repon juuresta).
# Vaatii: node, python3 + playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
open('ok.js','w',encoding='utf8').write(re.findall(r'<script>(.*?)</script>',s,re.S)[-1])
PY
node --check ok.js || exit 1
virheet=0
mkdir -p tulosteet
for f in logiikka_*.js; do
  if node "$f" > "tulosteet/$f.txt" 2>&1; then echo "ok    $f"; else echo "VIRHE $f"; grep -A2 FAIL "tulosteet/$f.txt"; virheet=1; fi
done
cd tulosteet || exit 1
for f in ../selain_*.py; do
  n=$(basename "$f")
  if python3 "$f" > "$n.txt" 2>&1; then echo "ok    $n (tuloste ja kuvat: tulosteet/)"; else echo "VIRHE $n"; grep -E "^FAIL|Error|errs" "$n.txt" | head -20; virheet=1; fi
done
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
