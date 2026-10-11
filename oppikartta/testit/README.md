# Oppikartan testit

Aja kaikki: `sh oppikartta/testit/aja.sh` (repon juuresta). Vaatii Noden sekä Pythonin ja Playwrightin (Chromium).

## Mitä ajetaan

- `logiikka_01_kertaus.js`: kertauskierto. Uusien korttien rajat, väärin menneen kortin paluu, välien kasvu, lisäkierros jo opituilla korteilla ja sanojen käänteinen suunta.
- `logiikka_02_hirviot.js`: hirviöpeli. Vuorot, osuma, häviö vain väärällä vastauksella, uuden kortin vapaa virhe ja vaikeustasojen simulointi. Tuloste sisältää taulukon voittojen osuudesta eri osaamisella.
- `logiikka_03_teksti.js`: pelin sisältö tekstinä, kysymyksen rakentaminen, palkkien sääntö ja tallennusmuoto.
- `selain_01_perus.py`: koko appi selaimessa puhelinleveydellä (390 px vaaleana, 320 px tummana). Tulosteet ja kuvakaappaukset tulevat kansioon `tulosteet/`.

Ajo poimii appin koodin tiedostosta `../index.html` tiedostoksi `ok.js`.

## Miten tulos luetaan

- Jokainen testi tulostaa lopuksi `KAIKKI OK` tai `VIRHEITÄ` ja epäonnistuu itse, jos jokin odotus ei täyty tai sivulla tapahtuu virhe.
- Kuvakaappaukset pitää katsoa itse, kun ulkoasua on muutettu.
- Testit ajetaan tietokoneen Chromiumissa, ei oikealla iPhonella.
