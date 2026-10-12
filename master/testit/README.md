# Masterin testit

Aja kaikki: `sh master/testit/aja.sh` (repon juuresta). Vaatii Noden sekä Pythonin ja Playwrightin (Chromium).

- `logiikka_*.js`: moottorin testit Nodella. Ajo poimii moottorin tiedoston `../index.html` lohkosta `<script id="engine">` tiedostoksi `moottori.js`.
- `selain_*.py`: masterin käyttö selaimessa tietokoneleveyksillä (1440 ja 1280 px, vaalea ja tumma) sekä viedyn käyttäjä-apin avaus puhelinleveydellä (390 px). `selain_03` testaa toiveet ja GitHub-tallennuksen valeGitHubia vasten (oikeaan GitHubiin ei oteta yhteyttä). Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/`.

Selaintestit epäonnistuvat automaattisesti vain, jos sivulla tapahtuu virhe tai testi ei pääse loppuun. Tulosteen sisältö pitää lukea itse, kun toimintaa on muutettu. Testit ajetaan tietokoneen Chromiumissa.
