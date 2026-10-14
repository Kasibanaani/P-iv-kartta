# Kytköskartan testit

Aja kaikki: `sh kytkoskartta/testit/aja.sh` (vaatii Noden ja Pythonin Playwrightin Chromiumilla).

Skripti poimii `index.html`:n lohkot `engine` (moottori) ja `ui` (käyttöliittymä) tiedostoiksi `moottori.js` ja `ui.js`, tarkistaa niiden syntaksin ja ajaa testit.

## Logiikkatestit (Node)

- `logiikka_01_arvot_ja_paivat.js` – luvut, tekstit, päivämäärät (pp.kk.vvvv ja pp.kk.vv), viikkonumerot, laskut ja vertailut, mallipohjat `{Nimi}`, JOS-arvo
- `logiikka_02_ikkunat.js` – JA, TAI, VAIN YKSI (valinta poistaa muut), N, EI, MONTAKO, SUMMA, KESKIARVO, SUURIN, sisäkkäisyys, käänteinen esiintymä
- `logiikka_03_tapahtumat.js` – painike → toiminto → sitten, arvon nousu, JOS NIIN/MUUTEN, KUN, KUN-ikkuna, Siirry, aikajana, lista, ilmoitus, silmukkasuoja
- `logiikka_04_rakenne.js` – nuolten säännöt, poistot, repair ja rikkinäisen tiedon lukeminen

## Selaintestit (Chromium, tietokoneleveys 1440 ja 1280 px)

- `selain_01_nakyma.py` – palikat paletista, siirto ja koko, nimi, näkyvyysehto, vaihtoväri, lukitus ja käyttö, näkymät, koristeviiva, kumoa, tallennus
- `selain_02_logiikka.py` – nuolen veto, valikko palikan päälle pudotettaessa, ikkuna, ikkunan tyyppi, toiminto, nuolen irrotus, elävät arvot
- `selain_03_esimerkki_ja_tallennus.py` – esimerkkiprojekti, Siirry näkymien välillä, kaavio, kalenteri, tumma tila, päivämäärämuoto, vienti ja tuonti

Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/`. Testit ajetaan tietokoneselaimessa, eivät oikealla iPadilla.
