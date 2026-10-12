# Masterin testit

Aja kaikki: `sh master/testit/aja.sh` (repon juuresta). Vaatii Noden sekä Pythonin ja Playwrightin (Chromium).

- `logiikka_*.js`: moottorin testit Nodella. Ajo poimii moottorin tiedoston `../index.html` lohkosta `<script id="engine">` tiedostoksi `moottori.js`.
- `logiikka_04_tyyli.js`: tyylijärjestelmä. Jokaisen paletin luettavuus (kontrasti) vaaleassa ja tummassa tilassa, palikoiden seitsemän sävyä, oma paletti 409 värillä, taustat, valmiit tyylit, vanhojen projektien korostusväri ja viedyn apin tyyli. Ajo poimii lohkot `styledata` ja `stylefn` tiedostoksi `tyyli.js`.
- `selain_*.py`: masterin käyttö selaimessa tietokoneleveyksillä (1440 ja 1280 px, vaalea ja tumma) sekä viedyn käyttäjä-apin avaus puhelinleveydellä (390 px). `selain_03` testaa toiveet ja GitHub-tallennuksen valeGitHubia vasten (oikeaan GitHubiin ei oteta yhteyttä). `selain_06` testaa Tyyli-välilehden ja viedyn apin tyylin puhelinleveyksillä 390 ja 320 px vaaleana ja tummana; kuvakaappaukset `tyyli_*.png`. Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/`.

Selaintestit epäonnistuvat automaattisesti vain, jos sivulla tapahtuu virhe tai testi ei pääse loppuun. Tulosteen sisältö pitää lukea itse, kun toimintaa on muutettu. Testit ajetaan tietokoneen Chromiumissa.
