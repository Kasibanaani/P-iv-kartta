# Kytköskartan testit

Aja kaikki: `sh kytkoskartta/testit/aja.sh` (vaatii Noden ja Pythonin Playwrightin Chromiumilla).

Skripti poimii `index.html`:n lohkot `engine` (moottori) ja `ui` (käyttöliittymä) tiedostoiksi `moottori.js` ja `ui.js`, tarkistaa niiden syntaksin ja ajaa testit.

## Logiikkatestit (Node)

- `logiikka_01_arvot_ja_paivat.js` – luvut, tekstit, päivämäärät (pp.kk.vvvv ja pp.kk.vv), viikkonumerot, laskut ja vertailut, mallipohjat `{Nimi}`, JOS-arvo
- `logiikka_02_ikkunat.js` – JA, TAI, VAIN YKSI (valinta poistaa muut), N, EI, MONTAKO, SUMMA, KESKIARVO, SUURIN, sisäkkäisyys, käänteinen esiintymä
- `logiikka_03_tapahtumat.js` – painike → toiminto → sitten, arvon nousu, JOS NIIN/MUUTEN, KUN, KUN-ikkuna, Siirry, aikajana, lista, ilmoitus, silmukkasuoja
- `logiikka_04_rakenne.js` – nuolten säännöt, poistot, repair ja rikkinäisen tiedon lukeminen
- `logiikka_06_versio3.js` – hakutaulukko (välit, täsmälleen, rajattomat päät, järjestys, muuten, {Nimi} tuloksessa, virhe läpi, repair), piilotetun syötteen arvo (säilyy / palautuu alkuun / pois laskuista, ketjuuntuva JOS), vain luettava ja syy, pikaluonnin rakenne (napit VAIN YKSI -ikkunassa + VALITSE + SUMMA) ja vanhan projektin muuttumattomuus
- `logiikka_07_sijainnit.js` – versio 4: Sijainti- ja Alue-palikat (nimet, ei kytkentäkohtia), Siirry heti / vierien (vanha viesti ennallaan), näkymän `alku`, `rul`, `alue` ja niiden korjaus, rikkinäiset `kk`, `zz`, `tapa`, poistetun sijainnin tai alueen viittaus, vanhan paikkamerkin säilyminen
- `logiikka_08_kaava.js` – versio 5: viite (nimestä, tuplat, varatut sanat, oma viite pysyy, repair), kaava (vertailu, laskujärjestys, päivämäärät, tekstit, selkokieliset virheet, sulut ja kaksi vertailua estetty), poistetun palikan viittaus puuttuvaksi ja takaisin, kaava ikkunassa ja Miksi?, kaava napin tekstiin, {viite} tekstissä, ominaisuudet .näkyy/.tila/.teksti/.rivejä, monta näkyy kun -nuolta, harmaana kun, rajoittavin voittaa, kehä virheenä, kerran-toiminto ja vanhan projektin viitteet
- `logiikka_09_tulos.js` – versio 5.1: Kaavan tulos (uni = a + b), ensin tehty kaava voittaa, == vertaa, tavallinen palikka vasemmalla = vertailu, tulos toisen kaavan osana, kehä, puuttuva tulos ja sen luonti, varattu viite, lainausmerkit tekstinä, Yhteydet, poisto ja palautus, tulos ikkunassa ja tekstissä, {viite} ennen nimeä
- `logiikka_10_ketju.js` – versio 6.1: ketjuikkuna (laji `ketju`, yksi esiintymä, koko), tapahtumat sisällä, ketjun viivat (`isChainLink`), alut ja järjestys, haarat, fire ei kulje ketjun viivaa, ulos lähtevä viiva toimii, ikkunan jäsenet, ketju ei toisen ketjun sisällä mutta saa olla ikkunassa, ajotilan korjaus, JSON-kierros ja vanhan projektin muuttumattomuus
- `logiikka_05_versio2.js` – VALITSE, vanhan JOS-palikan (niin- ja muuten-arvo) muunto JOS + VALITSE -pariksi, käytössä / pois käytöstä, virheet näkyviin (jako nollalla, kehä, teksti luvun paikalla), yhteydet, toimintojen kuvaukset, Miksi?, ikkunan tiivistys

## Selaintestit (Chromium, tietokoneleveys 1440 ja 1280 px)

- `selain_01_nakyma.py` – palikat paletista, siirto ja koko, nimi, näkyvyysehto, vaihtoväri, lukitus ja käyttö, näkymät, koristeviiva, kumoa, tallennus
- `selain_02_logiikka.py` – nuolen veto, valikko palikan päälle pudotettaessa, ikkuna, ikkunan tyyppi, toiminto, nuolen irrotus, elävät arvot
- `selain_03_esimerkki_ja_tallennus.py` – esimerkkiprojekti, Siirry näkymien välillä, kaavio, kalenteri, tumma tila, päivämäärämuoto, vienti ja tuonti
- `selain_07_versio3.py` – pikaluonti (vaihtoehtoryhmä lukuineen ja kyllä/ei-kysymys), käyttö lukittuna, pikatoiminto ”Arvo, kun valittu”, hakutaulukko paletista ja paneelista (osuva rivi, Miksi?, rivin laji ja järjestys), vain luettava kenttä syineen ja pois laskuista, Kumoa ja Vie taakse; kuvakaappaukset `versio3_*.png`
- `selain_08_sijainnit.py` – versio 4: ⌖ Sijainti -nappi (keskipiste, zoomaus, kehys, Kumoa), alkukohta (lukitus ja uudelleenavaus), Ei rullausta (veto, rulla ja ⌘-zoomaus estetty, zoomausnapit piilossa), ⛶ Alue -nappi käyttönäkymän kokoisena, Alueen sisällä (reunat pitävät joka suuntaan, pieni alue keskellä myös vedossa), Siirry heti / vierien, toisen alueen sijainti vaihtaa rajauksen ja takaisin, sijainnit ja alueet piilossa käytössä, paneelin Kohta ruudulla, Zoomaus ja Päivitä tähän ruutuun; kuvakaappaukset `versio4_*.png`
- `selain_09_kaava.py` – versio 5: viite paneelissa (seuraa nimeä, tupla estetään, oma viite), ƒ Näkyy kun kaava pätee (ehdotukset, elävä tulos, Miksi?, Kumoa), käyttö lukittuna, ƒ Teksti kaavasta arvo-palikasta, {viite} tekstissä, Harmaana-asetus ja rajoittavin voittaa, kaava paletista palikan päälle ja siirtona palikan päälle (valikko kysyy kohdan), kaava ikkunassa, sulkuvirhe, viitteet logiikan kulmissa, palikkalistan Viite-sarake, tallennus ja uudelleenavaus; kuvakaappaukset `versio5_*.png`
- `selain_10_tulos.py` – versio 5.1: ”＋ Luo kaavan tulos” -nappi, katkoviiva kaavasta tulokseen, tuloksen paneeli ja Kirjoita kaava tälle, tulos toisessa kaavassa ja tekstissä, toinen kaava samaan tulokseen näyttää virheen, == vertaa, käyttö lukittuna; kuvakaappaukset `versio51_*.png`
- `selain_11_pikakatselu.py` – versio 5.2: viite joka logiikan palikassa ja ikkunassa viitevärillä (vaalea ja tumma), kaavan viitteet värillä, pikakatselu vakiopaikalla logiikassa ja näkymän muokkaustilassa (nimi, viite, laji, lisätieto; laatikon koko ei muutu), Lisätieto-kenttä; kuvakaappaukset `versio52_*.png`
- `selain_12_ketju.py` – versio 6.1: ketju paletista (punainen reuna myös valittuna), tapahtumat sisään ja automaattinen viiva edelliseen, punainen viiva, pystysuuntaiset kohdat, lisäys paneelista loppuun, siirto sisältöineen, koon muutos, keskimmäisen poisto (ketju pysyy yhtenäisenä), Kumoa, tavallinen ikkuna ja nuoli ennallaan, tallennus ja uudelleenavaus; kuvakaappaukset `versio6_*.png`
- `selain_04_versio2.py` – pikatoiminnot painikkeen asetuksista, Rinnakkain-näkymä ja valinnan korostus molemmilla puolilla, Miksi? ja Yhteydet, ikkunan tiivistys, monivalinta (⇧-napsautus ja alue), tasaus ja tasavälit, käytössä / pois, virhe palikassa, palikkalista

Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/`. Testit ajetaan tietokoneselaimessa, eivät oikealla iPadilla.

## Yhteinen ilme ja kaksi valintaa (14.10.2026)

Asetuksissa on rakennusympäristön ja projektin käyttönäkymän erilliset valinnat, molemmissa samat kymmenen teemaa ja vaalea/tumma/laitteen mukaan. Työkalujen teema tallentuu erikseen selaimeen, käyttönäkymän teema projektin `appearance`-kenttään (kopio ja vienti säilyttävät sen).

`selain_05_ilme.py` tarkistaa 20 ympäristön ja 20 käyttönäkymän teema/tila-yhdistelmää, kontrastit, samaa teemarekisteriä, valintojen erillisyyden, tietojen ja palikoiden värien säilymisen, tallennuksen, laitteen tilan seuraamisen, nykyiset asetukset, 390/320 px sekä estyneen ja rikkinäisen selaintallennuksen.
`selain_06_github_ja_varmuuskopio.py` korvaa GitHubin valepalvelimella (oikeaan repoon ei kosketa) ja tarkistaa: Varmuuskopio-napin lataus ja tila, Masterin GitHub-asetusten käyttöönotto, automaattinen tallennus muutoksesta, myös käyttötiedoista (ei kameroista), tekoälyn muutoksen haku itsestään, ristiriidan valinta, projektien haku käyttötietoineen uuteen selaimeen, poistetun projektin pysyminen poissa ja ettei avain päädy varmuuskopioon.
