# Masterin testit

Aja kaikki: `sh master/testit/aja.sh` (repon juuresta). Vaatii Noden sekä Pythonin ja Playwrightin (Chromium).

- `logiikka_*.js`: moottorin testit Nodella. Ajo poimii moottorin tiedoston `../index.html` lohkosta `<script id="engine">` tiedostoksi `moottori.js`.
- `logiikka_04_tyyli.js`: tyylijärjestelmä. Jokaisen paletin luettavuus (kontrasti) vaaleassa ja tummassa tilassa, palikoiden seitsemän sävyä, oma paletti 409 värillä, taustat, valmiit tyylit, vanhojen projektien korostusväri ja viedyn apin tyyli. Ajo poimii lohkot `styledata` ja `stylefn` tiedostoksi `tyyli.js`.
- `logiikka_05_kertapainallus.js`: palautuva painike, jonka yksi painallus riittää (`once`): pullonkaula ja ehdot jäävät auki, ehdon toiminto laukeaa kerran, Tyhjennä/Poista valinta/Valitse/Alusta, repair ja päiväseuranta.
- `logiikka_06_tayttymisehto.js`: täyttymisehto (oletukset ja oma), ”täyttyy”-säännöt, pullonkaulana tekstikenttä, laskun 1/0-osat, kaavaksi muunto, repair.
- `selain_*.py`: masterin käyttö selaimessa tietokoneleveyksillä (1440 ja 1280 px, vaalea ja tumma) sekä viedyn käyttäjä-apin avaus puhelinleveydellä (390 px). `selain_03` testaa toiveet ja GitHub-tallennuksen valeGitHubia vasten (oikeaan GitHubiin ei oteta yhteyttä). `selain_06` testaa Tyyli-välilehden ja viedyn apin tyylin puhelinleveyksillä 390 ja 320 px vaaleana ja tummana; kuvakaappaukset `tyyli_*.png`. `selain_07` testaa kertapainalluksen masterissa ja viedyssä apissa (390 ja 320 px), sen että valikon valinnan jälkeen uudet kentät ilmestyvät heti (selaimen oma valikko nielee hiiren irrotuksen), ja että Lisää ruudulle -palkki pysyy näkyvissä listaa vieritettäessä; kuvakaappaukset `kertapainallus_*.png`. `selain_08` testaa Kartta-välilehden: muokattavan valinta ruudukosta ja puhelimesta, suhteiden kierrot, vertailun vaihto paneelista, laskun osat, täyttymisehdon ja pullonkaulan, Kumoa ja viedyn apin; kuvakaappaukset `kartta_*.png`. Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/`.

Selaintestit epäonnistuvat automaattisesti vain, jos sivulla tapahtuu virhe tai testi ei pääse loppuun. Tulosteen sisältö pitää lukea itse, kun toimintaa on muutettu. Testit ajetaan tietokoneen Chromiumissa.
