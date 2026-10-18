# Aloitus: mikä Appi-appi on ja ensimmäinen appi

## Mikä Appi-appi on

Appi-appi on selaimessa toimiva rakennusympäristö, jolla tehdään omia pieniä appeja palikoista ilman ohjelmointia. Appi on osoitteessa https://kasibanaani.github.io/P-iv-kartta/appiappi/ ja toimii puhelimella, iPadilla ja tietokoneella. Rakentaminen muistuttaa taulukkolaskentaa: palikoilla on arvoja, niihin viitataan nimellä, ja kaavat laskevat uusia arvoja. Sen päälle tulevat tapahtumat (painallus, ajastin, törmäys), toiminnot (aseta, lisää, siirry) ja liike.

Kaksi roolia kannattaa erottaa:

- **Rakentaja** tekee appia muokkaustilassa: lisää palikoita, kytkee niitä ja kirjoittaa kaavoja.
- **Käyttäjä** käyttää valmista appia lukittuna (**Lukitse**): painaa nappeja, kirjoittaa kenttiin ja näkee tulokset. Rakentaja ja käyttäjä ovat usein sama ihminen.

## Ajattelumalli lyhyesti

| Käsite | Mitä se on | Esimerkki |
|---|---|---|
| **Näkymä** | Käyttöpinta, jonka käyttäjä näkee. Näkymäpalikat (painike, säädin, teksti…) asetellaan **Näkymä**-välilehdellä. Näkymiä voi olla monta, kuin sivuja. | Säädin ja kaksi tekstiä |
| **Logiikka** | Toinen kanvaasi (**Logiikka**-välilehti), jossa palikat kytketään nuolilla ja lasketaan. Näkymän palikat voi tuoda myös logiikkaan. | Kaava, JOS, Ikkuna |
| **Arvo** | Jatkuva tieto: luku, teksti, kyllä/ei tai päivämäärä. Päivittyy itsestään kuin taulukkolaskennan solu. Logiikassa pyöreä piste. | säätimen luku 5 |
| **Tapahtuma** | Hetki: jotain tapahtui juuri nyt. Logiikassa punainen salmiakki. | *painettu*, *valmis* |
| **Viite** | Palikan lyhyt nimi kaavoissa ja teksteissä (kenttä **Tunnus**, jossa voi olla myös joukot `#nimi`): pienet kirjaimet, numerot ja _, ei ala numerolla. Seuraa palikan nimeä, kunnes kirjoitat oman. | `lasit` |
| **Kaava** | Lyhyt lauseke, joka laskee arvon toisten palikoiden arvoista. | `8 - lasit` |
| **Kaavan tulos** | Kaavalle annettu oma nimi: `jaljella = 8 - lasit`. | `{jaljella}` tekstissä |
| **Ominaisuus** | Palikan osa-arvo, jota voi lukea kaavassa ja usein myös ohjata: `viite.ominaisuus`. | `lasit.suurin`, `otsikko.näkyy` |
| **Toiminto** | Tekee muutoksen tapahtumahetkellä: Aseta arvo, Lisää, Siirry… | Nollaa-painike asettaa säätimen nollaan |
| **Käyttötieto** | Käytössä syntyvät arvot (valinnat, kirjoitukset, muistit, taulukon rivit). Säilyvät, kun appi suljetaan. Rakenne on erikseen. | säätimen nykyinen asento |

Kaksi sääntöä, jotka selittävät paljon:

1. **Kaava on tila, toiminto on hetki.** Kaava kertoo, mitä on nyt (aina ajan tasalla). Toiminto muuttaa jotain kerran, kun tapahtuma tulee.
2. **Etusija:** ohjattu (nuoli tai kaava) voittaa toiminnon asettaman arvon, ja se voittaa paneeliin kirjoitetun perusarvon.

Erikoispalikat on merkitty ✦:llä: ne poikkeavat tarkoituksella jostain yhteisestä säännöstä, ja paneeli kertoo miten.

## Ensimmäinen appi: vesilasit

Teet appin, jossa säätimellä merkitään juodut vesilasit. Teksti kertoo, montako lasia on juotu ja montako puuttuu tavoitteesta (8). Kun tavoite täyttyy, näkyy onnittelu, ja Nollaa-painike palauttaa säätimen nollaan. Opit näkymäpalikan, viitteen, kaavan, Kaavan tuloksen, ehdollisen näkyvyyden ja yhden tapahtuman.

Vaiheet on kokeiltu tietokoneen Chromiumissa 1440 px leveänä (17.10.2026, Appi-appi 31). Puhelimella sama onnistuu: paletti aukeaa alareunan napista **＋ Palikat** ja paneeli napista **Asetukset: …** (ks. [Työympäristö](02-tyoymparisto.md#puhelimella-alapalkki-ja-laatikot)).

**1. Uusi projekti.** Avaa appi. Jos projekteja ei ole, kirjoita aloitusruudun kenttään *Projektin nimi* `Vesilasit` ja paina **Luo projekti**. Muuten: yläpalkin **projektin nimi ▾** → kenttä *Uuden projektin nimi* → **Luo**. Projekti aukeaa **Näkymä**-välilehdelle muokkaustilaan.

**2. Säädin.** Paletista (vasemmalla), ryhmästä *Ohjaimet*, vedä **Säädin** kanvaasille. (Napautus paletissa tuo palikan ruudun keskelle. Kun lisäät monta, vedä ne erilleen, etteivät ne jää päällekkäin.) Säädin valitaan ja sen paneeli aukeaa oikealle. Kirjoita paneeliin:
- **Nimi**: `Lasit`. Kenttä **Tunnus** muuttuu itsestään muotoon `@lasit` (viite `lasit`).
- osio *Sisältö*: **Otsikko** `Juodut lasit`, **Suurin** `12`, **Alkuarvo** `0`.

**3. Teksti, jossa on viite.** Ryhmästä *Näyttö* vedä **Teksti** säätimen alle. Kirjoita paneelin kenttään **Teksti**: `Joit {lasit} lasia.` Aaltosulkeet hakevat toisen palikan arvon tekstiin.

**4. Kaava ja Kaavan tulos.** Vaihda yläpalkista välilehdelle **Logiikka**. Paletin ryhmästä *Kaava* lisää **Kaava**. Kirjoita paneelin kaavakenttään `jaljella = jos (lasit >= 8) 0 muuten 8 - lasit` ja paina Enter. Paneeli sanoo *⚠ puuttuu: jaljella* ja tarjoaa napin **＋ Luo kaavan tulos ”jaljella”**: paina sitä. Nyt on olemassa nimetty arvo `jaljella`, ja paneelissa lukee *Nyt: 8*. (Kaavan voi kirjoittaa myös suoraan palikkaan kaksoisnapauttamalla sitä.)

Kaava luetaan näin: jos lasit on vähintään 8, jäljellä on 0, muuten 8 miinus lasit. Ehto on suluissa, ja `muuten` aloittaa toisen vaihtoehdon. Pelkkä `jaljella = 8 - lasit` toimisi myös, mutta näyttäisi yli tavoitteen mentäessä negatiivisen luvun.

**5. Toinen teksti.** Palaa välilehdelle **Näkymä**. Lisää **Teksti** ja kirjoita: `Tavoitteeseen {jaljella} lasia.`

**6. Onnittelu, joka näkyy vain ehdolla.** Lisää kolmas **Teksti**, tekstiksi `Tavoite täynnä!`. Paneelin osiossa *Näkyvyys* paina **ƒ Näkyy, kun kaava pätee**. Appi tekee logiikkaan Kaavan, jonka tulos ohjaa tämän tekstin näkyvyyttä, ja avaa sen paneelin. Kirjoita kaavaksi `lasit >= 8` ja paina Enter. Paneelin yläreunan paluunappi (‹ ja tekstin nimi) vie takaisin tekstin paneeliin. Muokkaustilassa teksti näkyy haaleana, jotta sitä voi muokata.

**7. Painike, joka tekee toiminnon.** Ryhmästä *Ohjaimet* lisää **Painike**. Paneelissa:
- **Painikkeen teksti**: `Nollaa`.
- **Toiminta**: **Kertapainallus** (painike palautuu ylös).
- osio *Kun painetaan*: valikosta **＋ Lisää toiminto…** valitse **Aseta arvo**. Appi tekee logiikkaan Toiminto-palikan, kytkee sen painikkeen *painettu*-tapahtumaan ja avaa toiminnon paneelin.
- Toiminnon paneelissa: **Kohde** = `Lasit`, **Uusi arvo** = `0` (Enter tai siirry kentästä pois).

**8. Kokeile.** Paina yläpalkin **Lukitse**. Näkymä on nyt käyttötilassa:
- Alussa näkyy *Joit 0 lasia.* ja *Tavoitteeseen 8 lasia.*
- Vedä säädin lukuun 9: *Joit 9 lasia.*, *Tavoitteeseen 0 lasia.* ja *Tavoite täynnä!* tulee näkyviin.
- Paina **Nollaa**: säädin palaa nollaan ja onnittelu katoaa.

Paluu muokkaukseen: **Muokkaa**. Säätimen asento on käyttötietoa ja säilyy, kun appi suljetaan. Kaikki käyttötiedot nollataan *Projektit*-ikkunan napilla **Tyhjennä käyttötiedot**.

### Mitä opit ja mihin jatkaa

| Vaihe | Käsite | Lisää aiheesta |
|---|---|---|
| 2 | Näkymäpalikka, Nimi ja Viite | [Näkymäpalikat](03-nakymapalikat.md), [Työympäristö](02-tyoymparisto.md#nimi-ja-viite) |
| 3 | Viite tekstissä `{…}` | [Kaavat](06-kaavat.md) |
| 4 | Kaava, `jos (…) … muuten …`, Kaavan tulos | [Kaavat](06-kaavat.md), [Logiikkapalikat](04-logiikkapalikat.md#kaavan-tulos--tulos) |
| 6 | Ehdollinen näkyvyys | [Näkymäpalikat: Näkyvyys-osio](03-nakymapalikat.md#näkyvyys-osio) |
| 7 | Tapahtuma ja Toiminto | [Toiminnot ja ketjut](05-ketjut-ja-toiminnot.md) |
| 8 | Muokkaus ja käyttö, käyttötieto | [Työympäristö](02-tyoymparisto.md#muokkaus-ja-käyttö-lukitse), [Tallennus](09-tallennus.md) |

Seuraavaksi kannattaa kokeilla lukujen lopun reseptejä. Kaikki reseptit on koottu [hakemistoon](10-hakemisto.md#reseptit).
