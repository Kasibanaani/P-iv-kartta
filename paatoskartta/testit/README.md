# Päätöskartan testit

Aja kaikki: `sh paatoskartta/testit/aja.sh` (repon juuresta). Vaatii Noden sekä Pythonin ja Playwrightin (Chromium).

## Mitä ajetaan

- `logiikka_*.js`: sääntömoottorin testit Nodella. Ajo poimii appin koodin tiedostosta `../index.html` tiedostoksi `pt.js`. Jokainen testi tulostaa lopuksi `KAIKKI OK` tai `VIRHEITÄ`.
- `selain_*.py`: käyttöliittymän testit selaimessa puhelinleveydellä (390 ja 320 px). Ne käyvät toiminnot läpi ja tulostavat appin tilan kansioon `tulosteet/`, jonne tulevat myös kuvakaappaukset.

## Miten tulos luetaan

- Logiikkatestit epäonnistuvat itse, jos jokin odotus ei täyty.
- Selaintestit epäonnistuvat automaattisesti vain, jos sivulla tapahtuu virhe tai testi ei pääse loppuun. Tulosteen sisältö pitää lukea itse, kun appin toimintaa on muutettu.
- Testit ajetaan tietokoneen Chromiumissa, ei oikealla iPhonella.

## Nimet

Numero kertoo, missä järjestyksessä testi syntyi. Loppuosa kertoo aiheen.
