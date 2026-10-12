#!/bin/sh
# Ajaa masterin testit. Käyttö: sh master/testit/aja.sh
# Vaatii: node, python3 + playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
open('moottori.js','w',encoding='utf8').write(re.search(r'<script id="engine">(.*?)</script>',s,re.S).group(1))
open('tyyli.js','w',encoding='utf8').write(''.join(re.search(r'<script id="'+k+'">(.*?)</script>',s,re.S).group(1) for k in ('styledata','stylefn')))
PY
node --check moottori.js || exit 1
node --check tyyli.js || exit 1
virheet=0
for f in logiikka_*.js; do
  if node "$f" > "tulosteet_$f.txt" 2>&1; then echo "ok    $f"; else echo "VIRHE $f"; virheet=1; fi
done
mkdir -p tulosteet && mv tulosteet_*.txt tulosteet/
cd tulosteet || exit 1
for f in ../selain_*.py; do
  n=$(basename "$f")
  if python3 "$f" > "$n.txt" 2>&1 && ! grep -q "errs \['" "$n.txt"; then echo "ok    $n (ei sivuvirheitä; tuloste: tulosteet/$n.txt)"; else echo "VIRHE $n"; virheet=1; fi
done
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
