#!/bin/sh
# Ajaa Animappin testit. Käyttö: sh animaatio/testit/aja.sh
# Vaatii: node, python3 + playwright (Chromium). Selaintestit tallentavat kuvakaappaukset ja tulosteet kansioon tulosteet/.
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
for lohko,tied in (('engine','moottori.js'),('ui','tulosteet_ui.js'),('appearance','tulosteet_ilme.js')):
    open(tied,'w',encoding='utf8').write(re.search(r'<script id="%s">(.*?)</script>'%lohko,s,re.S).group(1))
PY
virheet=0
for f in moottori.js tulosteet_ui.js tulosteet_ilme.js; do node --check "$f" || virheet=1; done
rm -f tulosteet_ui.js tulosteet_ilme.js
mkdir -p tulosteet
for f in logiikka_*.js; do
  if node "$f" > "tulosteet/$f.txt" 2>&1; then echo "ok    $f ($(tail -1 tulosteet/$f.txt))"; else echo "VIRHE $f"; cat "tulosteet/$f.txt"; virheet=1; fi
done
for f in selain_*.py; do
  if (cd tulosteet && python3 "../$f" > "$f.txt" 2>&1) && tail -1 "tulosteet/$f.txt" | grep -q '^ok$'; then echo "ok    $f"; else echo "VIRHE $f"; tail -20 "tulosteet/$f.txt"; virheet=1; fi
done
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
