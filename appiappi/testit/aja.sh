#!/bin/sh
# Ajaa Appi-appin testit. Käyttö: sh appiappi/testit/aja.sh
# Vaatii: node, python3 + playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 - <<'PY' || exit 1
import re
s=open('../index.html',encoding='utf8').read()
open('moottori.js','w',encoding='utf8').write(re.search(r'<script id="engine">(.*?)</script>',s,re.S).group(1))
open('ui.js','w',encoding='utf8').write(re.search(r'<script id="ui">(.*?)</script>',s,re.S).group(1))
PY
node --check moottori.js || exit 1
node --check ui.js || exit 1
virheet=0
for f in logiikka_*.js; do
  if node "$f" > "tulosteet_$f.txt" 2>&1; then echo "ok    $f"; else echo "VIRHE $f"; cat "tulosteet_$f.txt"; virheet=1; fi
done
mkdir -p tulosteet && mv tulosteet_*.txt tulosteet/
# Jonon 1o: selaintestit paikalliselta palvelimelta (ei file://), ks. yhteinen.py.
PORTTI=$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1]);s.close()")
python3 -m http.server "$PORTTI" --bind 127.0.0.1 --directory ../.. >/dev/null 2>&1 &
PALVELIN=$!
trap 'kill $PALVELIN 2>/dev/null' EXIT
for i in 1 2 3 4 5 6 7 8 9 10; do python3 -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:$PORTTI/appiappi/index.html')" 2>/dev/null && break; sleep 0.3; done
export APPI_URL="http://127.0.0.1:$PORTTI"
cd tulosteet || exit 1
for f in ../selain_*.py; do
  n=$(basename "$f")
  if python3 "$f" > "$n.txt" 2>&1 && ! grep -q "errs \['" "$n.txt"; then echo "ok    $n (ei sivuvirheitä; tuloste: tulosteet/$n.txt)"; else echo "VIRHE $n"; tail -20 "$n.txt"; virheet=1; fi
done
[ $virheet -eq 0 ] && echo "KAIKKI OK" || echo "VIRHEITÄ"
exit $virheet
