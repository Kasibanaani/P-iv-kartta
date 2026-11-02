#!/bin/sh
# Ajaa Mätsik Forestin testit. Käyttö: sh matsik/testit/aja.sh
# Vaatii: node, python3 + playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
open('engine.js','w',encoding='utf8').write(re.search(r'<script id="engine">(.*?)</script>',s,re.S).group(1))
open('ui.js','w',encoding='utf8').write(re.search(r'<script id="ui">(.*?)</script>',s,re.S).group(1))
PY
node --check engine.js && node --check ui.js || exit 1
virheet=0
for f in logiikka*.js; do
  if node "$f"; then echo "ok    $f"; else echo "VIRHE $f"; virheet=1; fi
done
for f in selain*.js; do
  if node "$f"; then echo "ok    $f"; else echo "VIRHE $f"; virheet=1; fi
done
rm -f engine.js ui.js
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
