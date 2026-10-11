#!/bin/sh
# Ajaa Taitokartan testit. Käyttö: sh taitokartta/testit/aja.sh (repon juuresta).
# Vaatii: node, python3 + playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
open('tk.js','w',encoding='utf8').write(re.findall(r'<script>(.*?)</script>',s,re.S)[-1])
PY
node --check tk.js || exit 1
virheet=0
mkdir -p tulosteet
if node logiikka_sisalto.js > tulosteet/logiikka_sisalto.txt 2>&1; then echo "ok    logiikka_sisalto.js"; else echo "VIRHE logiikka_sisalto.js"; cat tulosteet/logiikka_sisalto.txt; virheet=1; fi
cd tulosteet || exit 1
if python3 ../selain_perus.py > selain_perus.txt 2>&1; then echo "ok    selain_perus.py"; else echo "VIRHE selain_perus.py"; tail -30 selain_perus.txt; virheet=1; fi
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
