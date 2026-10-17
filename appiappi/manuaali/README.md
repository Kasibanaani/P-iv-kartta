# Appi-appin käyttömanuaali

Tämä on Appi-appin käyttö- ja toimintamanuaali ihmiselle ja tekoälylle. Se kuvaa vain sitä, mikä appissa on nyt toteutettu (Appi-appi 32, 17.10.2026). Suunnitelmat ovat kansiossa `../suunnitelmat/`, eivät tässä.

Appi: https://kasibanaani.github.io/P-iv-kartta/appiappi/

## Luvut

| Luku | Mitä siinä on |
|---|---|
| [1. Aloitus](01-aloitus.md) | Mikä Appi-appi on, ajattelumalli ja ensimmäinen appi askel askeleelta |
| [2. Työympäristö](02-tyoymparisto.md) | Yläpalkki, projektit, asetukset, välilehdet, paletti, kanvaasit, nuolet, paneeli, kumoa, poisto, suosikit, presetit, pikaluonti, laput, näppäimet |
| [3. Näkymäpalikat](03-nakymapalikat.md) | Kaikille yhteiset osiot ja kohdat sekä jokainen näkymän palikka (Painike, Säädin, Teksti, Lista, Kalenteri, Monitori…) |
| [4. Logiikkapalikat](04-logiikkapalikat.md) | Miten logiikka toimii sekä Arvo, Muisti, Kaava, Kaavan tulos, JOS, VALITSE, KUN, Ikkuna, Käyrä, Satunnaisluku… |
| [5. Toiminnot ja ketjut](05-ketjut-ja-toiminnot.md) | Toiminto ja kaikki toimintolajit, tapahtumaketju ja sen palikat, lukitustilat, ajo |
| [6. Kaavat, viitteet ja ominaisuudet](06-kaavat.md) | Kaavakieli kokonaan, viitteet, ominaisuusrekisteri, etusija ja pikaviite |
| [7. Tieto](07-tieto.md) | Tietotaulukko, Tapahtuman tiedot, Rivi, Rivijoukko, Toistin, lomake |
| [8. Maailma ja liike](08-maailma-ja-liike.md) | Laitemuoto, maailma ja kamera, Liike, Tatti, esteet, Alue, Reitti, ruudukko, massa |
| [9. Tallennus](09-tallennus.md) | Selaimen muisti, projektit, vienti ja tuonti, GitHub, laput, tiedostomuoto tekoälylle |
| [10. Hakemisto](10-hakemisto.md) | Tehtävähakemisto (”haluan…”), kaikki palikat, reseptit ja sanasto |
| [11. Versio ja tunnetut rajat](11-versio-ja-rajat.md) | Tarkistettu versio, mitä on testattu, ylläpito-ohje ja kehityshavainnot |

## Miten luetaan

- **Uusi rakentaja:** lue luku 1 ja tee esimerkki. Jatka luvun 2 alusta ja kokeile reseptejä.
- **Haet tiettyä asiaa:** [Hakemisto](10-hakemisto.md) → tehtävä tai palikka.
- **Tekoäly, joka neuvoo käyttäjää:** lue tämä sivu ja [Hakemisto](10-hakemisto.md), sitten tarvittava luku. Jokainen palikka on kuvattu samalla kaavalla: *Löytyy* (mistä paletin kohdasta), *Sisään* ja *Ulos* (kohdat logiikassa), *Asetukset* (paneelin kentät), *Ominaisuudet* ja *Kaavassa* (miten arvoa luetaan), *Aika ja tila*, *Esimerkki*, *Huomio* (rajat). Käytä painikkeiden ja kenttien nimiä täsmälleen manuaalin mukaan. Jos manuaali ei tunne jotain, sano se äläkä keksi. Kerro tarvittaessa, miten sama tehdään puhelimella: paletti on napin **＋ Palikat** takana ja paneeli napin **Asetukset: …** takana.
- **Kehityksen suunnittelija:** lue koko manuaali, `../MISSIO.md` ja [Versio ja tunnetut rajat](11-versio-ja-rajat.md#havainnot).

## Merkinnät

- **Lihavoitu** = näkyvä painike, välilehti tai valinta, kuten **🔒 Lukitse**. *Kursiivi* = kohdan, osion tai kentän nimi, kuten *näkyy kun*.
- `koodi` = kaava, viite tai teksti, jonka kirjoitat sellaisenaan, kuten `uni > 7`.
- ✦ = erikoispalikka: poikkeaa tarkoituksella yhteisestä säännöstä (luettelo ja syyt `../PALIKKASAANNOT.md`).
- Sulkeissa oleva sisäinen nimi, kuten (`nappi`), on palikan laji tallennustiedostossa. Käyttäjä ei näe sitä.
- ”(ei tarkistettu)” = kirjoittaja ei voinut varmistaa kohtaa.
