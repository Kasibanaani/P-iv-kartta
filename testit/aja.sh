#!/bin/sh
# Ajaa Päiväkartan testit. Käyttö: sh testit/aja.sh (repon juuresta). Vaatii: python3 + playwright (Chromium).
cd "$(dirname "$0")" || exit 1
python3 selain_perus.py
