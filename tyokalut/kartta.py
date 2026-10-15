#!/usr/bin/env python3
"""Tulostaa appin index.html:n kartan rivinumeroineen, ettei koko tiedostoa tarvitse lukea.

Käyttö (repon juuresta):
  python3 tyokalut/kartta.py appiappi             lohkot ja osiot
  python3 tyokalut/kartta.py appiappi -f          lisäksi funktiot osioittain
  python3 tyokalut/kartta.py appiappi -f Kamera   funktiot vain osioista, joiden nimessä on "Kamera"
  python3 tyokalut/kartta.py appiappi -n save     funktiot, joiden nimessä on "save"

Kartta luetaan aina tiedostosta, joten rivinumerot ovat ajan tasalla. Osiot tunnistetaan
kommenteista /* ---------- Nimi ---------- */ ja /* ===== NIMI ===== */.
"""
import os, re, sys

LOHKO = re.compile(r'<(script|style)\b([^>]*)>|</(script|style)>')
OSIO = re.compile(r'^\s*/\*\s*-{3,}\s*(.*?)\s*(?:-{3,}\s*(?:\*/)?)?\s*$')
ISO_OSIO = re.compile(r'^\s*/\*\s*={5,}\s*$')
FUNKTIO = re.compile(r'^\s{0,2}(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^\s{0,2}(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>)')


def lue(polku):
    if os.path.isdir(polku):
        polku = os.path.join(polku, 'index.html')
    with open(polku, encoding='utf8') as t:
        return polku, t.read().split('\n')


def kartta(rivit):
    lohkot, osiot, funktiot = [], [], []
    auki = None
    for i, r in enumerate(rivit, 1):
        for m in LOHKO.finditer(r):
            if m.group(1):
                tunnus = re.search(r'id="([^"]+)"', m.group(2) or '')
                auki = (m.group(1) + (' #' + tunnus.group(1) if tunnus else ''), i)
            elif auki:
                lohkot.append((auki[0], auki[1], i))
                auki = None
        if ISO_OSIO.match(r) and i < len(rivit):
            osiot.append((i, rivit[i].strip(), True))
            continue
        m = OSIO.match(r)
        if m and m.group(1):
            osiot.append((i, m.group(1).rstrip('-* /').strip(), False))
            continue
        m = FUNKTIO.match(r)
        if m:
            funktiot.append((i, m.group(1) or m.group(2)))
    return lohkot, osiot, funktiot


def osion_loppu(osiot, k, lohkot, rivimaara):
    alku = osiot[k][0]
    loppu = osiot[k + 1][0] - 1 if k + 1 < len(osiot) else rivimaara
    for _, la, ll in lohkot:
        if la <= alku <= ll:
            loppu = min(loppu, ll)
    return loppu


def main(argv):
    if not argv or argv[0] in ('-?', '--help'):
        print(__doc__.strip())
        return 0
    polku, rivit = lue(argv[0])
    lohkot, osiot, funktiot = kartta(rivit)
    if len(argv) > 1 and argv[1] == '-n':
        sana = (argv[2] if len(argv) > 2 else '').lower()
        for i, n in funktiot:
            if sana in n.lower():
                print(f'{i:>6}  {n}')
        return 0
    nayta_f = len(argv) > 1 and argv[1] == '-f'
    suodin = (argv[2] if len(argv) > 2 else '').lower() if nayta_f else ''
    print(f'{polku}: {len(rivit)} riviä, {sum(len(r) + 1 for r in rivit) // 1024} kt')
    print('Lohkot:')
    for nimi, a, l in lohkot:
        if l - a > 2:
            print(f'  {a}-{l}  <{nimi}>')
    print('Osiot (rivit alku-loppu):')
    for k, (i, nimi, iso) in enumerate(osiot):
        loppu = osion_loppu(osiot, k, lohkot, len(rivit))
        if suodin and suodin not in nimi.lower():
            continue
        print(f'{"" if iso else "  "}{i}-{loppu}  {nimi.upper() if iso else nimi}')
        if nayta_f:
            nimet = [n for j, n in funktiot if i < j <= loppu]
            if nimet:
                print('      ' + ', '.join(nimet))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
