#!/bin/sh
# Ajaa Appi-appin testit. Vaatii: node, python3 + playwright (Chromium).
# Käyttö:
#   sh appiappi/testit/aja.sh                  koko sarja (aina ennen vientiä)
#   sh appiappi/testit/aja.sh painovoima 92    vain testit, joiden tiedostonimessä on jokin sanoista (kehityksen aikana)
#   sh appiappi/testit/aja.sh -v ...           näytä myös läpäisseet rivi riviltä
# Tuloste: vain kaatuneet (20 viimeistä riviä) ja yhteenveto; kaikkien tulosteet kansiossa tulosteet/.
VERBOSE=0
if [ "$1" = "-v" ]; then VERBOSE=1; shift; fi
SANAT="$*"
cd "$(dirname "$0")" || exit 1
valittu() {
  [ -z "$SANAT" ] && return 0
  for s in $SANAT; do case "$1" in *"$s"*) return 0;; esac; done
  return 1
}
ok() { [ $VERBOSE -eq 1 ] && echo "ok    $1"; ajettu=$((ajettu+1)); }
ajettu=0
kaatui=0
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
  valittu "$f" || continue
  if node "$f" > "tulosteet_$f.txt" 2>&1; then ok "$f"; else echo "VIRHE $f"; cat "tulosteet_$f.txt"; virheet=1; ajettu=$((ajettu+1)); kaatui=$((kaatui+1)); fi
done
mkdir -p tulosteet && for t in tulosteet_*.txt; do [ -e "$t" ] && mv "$t" tulosteet/; done
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
  valittu "$n" || continue
  if python3 "$f" > "$n.txt" 2>&1 && ! grep -q "errs \['" "$n.txt"; then ok "$n (ei sivuvirheitä; tuloste: tulosteet/$n.txt)"; else echo "VIRHE $n"; tail -20 "$n.txt"; virheet=1; ajettu=$((ajettu+1)); kaatui=$((kaatui+1)); fi
done
cd .. || exit 1
koko() { [ -f "$1" ] && [ "$(wc -c < "$1")" -gt "$2" ] && echo "HUOM $1 on $(( $(wc -c < "$1") / 1024 )) kt, raja $(( $2 / 1024 )) kt: karsi (vanhat osat arkistoon)."; }
koko ../TILA.md 40960
koko ../PALIKKASAANNOT.md 15360
[ $ajettu -eq 0 ] && { echo "Yksikään testi ei osunut sanoihin: $SANAT"; exit 1; }
[ -n "$SANAT" ] && echo "Osajoukko ($SANAT): aja koko sarja ennen vientiä."
[ $virheet -eq 0 ] && echo "KAIKKI OK ($ajettu testiä)" || echo "VIRHEITÄ ($kaatui/$ajettu kaatui)"
exit $virheet
