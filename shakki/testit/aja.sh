#!/bin/sh
# Ajaa Shakin testit. Käyttö: sh shakki/testit/aja.sh
# Vaatii: node ja Playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
open('engine.js','w',encoding='utf8').write(re.search(r'<script id="engine">(.*?)</script>',s,re.S).group(1)+'\nmodule.exports=SH;\n')
open('ui.js','w',encoding='utf8').write(re.search(r'<script id="ui">(.*?)</script>',s,re.S).group(1))
PY
node --check engine.js && node --check ui.js || exit 1
virheet=0
for f in logiikka.js selain_*.js; do
  [ -f "$f" ] || continue
  if node "$f"; then echo "ok    $f"; else echo "VIRHE $f"; virheet=1; fi
done
rm -f engine.js ui.js
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
