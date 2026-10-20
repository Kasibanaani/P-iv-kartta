#!/bin/sh
# Ajaa Päätöspuun testit. Käyttö: sh paatospuu/testit/aja.sh
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
if node logiikka.js; then echo "ok    logiikka.js"; else echo "VIRHE logiikka.js"; virheet=1; fi
for f in selain_*.py; do
  [ -f "$f" ] || continue
  if python3 "$f"; then echo "ok    $f"; else echo "VIRHE $f"; virheet=1; fi
done
rm -f engine.js ui.js
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
