# Kytköskartan testit

Aja kaikki: `sh kytkoskartta/testit/aja.sh` (vaatii Noden ja Pythonin Playwrightin Chromiumilla).

Skripti poimii `index.html`:n lohkot `engine` (moottori) ja `ui` (käyttöliittymä) tiedostoiksi `moottori.js` ja `ui.js`, tarkistaa niiden syntaksin ja ajaa testit.

## Logiikkatestit (Node)

- `logiikka_01_arvot_ja_paivat.js` – luvut, tekstit, päivämäärät (pp.kk.vvvv ja pp.kk.vv), viikkonumerot, laskut ja vertailut, mallipohjat `{Nimi}`, JOS-arvo
- `logiikka_02_ikkunat.js` – JA, TAI, VAIN YKSI (valinta poistaa muut), N, EI, MONTAKO, SUMMA, KESKIARVO, SUURIN, sisäkkäisyys, käänteinen esiintymä
- `logiikka_03_tapahtumat.js` – painike → toiminto → sitten, arvon nousu, JOS NIIN/MUUTEN, KUN, KUN-ikkuna, Siirry, aikajana, lista, ilmoitus, silmukkasuoja
- `logiikka_04_rakenne.js` – nuolten säännöt, poistot, repair ja rikkinäisen tiedon lukeminen
- `logiikka_05_versio2.js` – VALITSE, vanhan JOS-palikan (niin- ja muuten-arvo) muunto JOS + VALITSE -pariksi, käytössä / pois käytöstä, virheet näkyviin (jako nollalla, kehä, teksti luvun paikalla), yhteydet, toimintojen kuvaukset, Miksi?, ikkunan tiivistys

## Selaintestit (Chromium, tietokoneleveys 1440 ja 1280 px)

- `selain_01_nakyma.py` – palikat paletista, siirto ja koko, nimi, näkyvyysehto, vaihtoväri, lukitus ja käyttö, näkymät, koristeviiva, kumoa, tallennus
- `selain_02_logiikka.py` – nuolen veto, valikko palikan päälle pudotettaessa, ikkuna, ikkunan tyyppi, toiminto, nuolen irrotus, elävät arvot
- `selain_03_esimerkki_ja_tallennus.py` – esimerkkiprojekti, Siirry näkymien välillä, kaavio, kalenteri, tumma tila, päivämäärämuoto, vienti ja tuonti
- `selain_04_versio2.py` – pikatoiminnot painikkeen asetuksista, Rinnakkain-näkymä ja valinnan korostus molemmilla puolilla, Miksi? ja Yhteydet, ikkunan tiivistys, monivalinta (⇧-napsautus ja alue), tasaus ja tasavälit, käytössä / pois, virhe palikassa, palikkalista

Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/`. Testit ajetaan tietokoneselaimessa, eivät oikealla iPadilla.

## Yhteinen ilme ja kaksi valintaa (14.10.2026)

Asetuksissa on rakennusympäristön ja projektin käyttönäkymän erilliset valinnat, molemmissa samat kymmenen teemaa ja vaalea/tumma/laitteen mukaan. Työkalujen teema tallentuu erikseen selaimeen, käyttönäkymän teema projektin `appearance`-kenttään (kopio ja vienti säilyttävät sen).

`selain_05_ilme.py` tarkistaa 20 ympäristön ja 20 käyttönäkymän teema/tila-yhdistelmää, kontrastit, samaa teemarekisteriä, valintojen erillisyyden, tietojen ja palikoiden värien säilymisen, tallennuksen, laitteen tilan seuraamisen, nykyiset asetukset, 390/320 px sekä estyneen ja rikkinäisen selaintallennuksen.
`selain_06_github_ja_varmuuskopio.py` korvaa GitHubin valepalvelimella (oikeaan repoon ei kosketa) ja tarkistaa: Varmuuskopio-napin lataus ja tila, Masterin GitHub-asetusten käyttöönotto, automaattinen tallennus muutoksesta, myös käyttötiedoista (ei kameroista), tekoälyn muutoksen haku itsestään, ristiriidan valinta, projektien haku käyttötietoineen uuteen selaimeen, poistetun projektin pysyminen poissa ja ettei avain päädy varmuuskopioon.
