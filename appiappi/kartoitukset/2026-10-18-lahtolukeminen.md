# Lähtölukeminen 18.10.2026 (Appi-appi 71)

Emilin kysymys: kallistuuko tuntityö käyttörajalla mitattuna, kun appi kasvaa? Tämä mittaa, mitä rakentajaketju lukee ennen kuin pääsee töihin, ja miten se on kasvanut. Ei koodimuutoksia; ehdotukset Jonon kohdissa 30–34.

**Mitattu:** tiedostokoot (tavuina) nykyisessä päähaarassa ja git-historiassa versioittain, kymmenen viimeisimmän version commitin muutetut tiedostot, logiikkatestien tuloste. **Ei mitattu:** todellista käyttörajan kulutusta eikä sitä, mitä rakentajat oikeasti lukivat (keskusteluja ei näe). Token-luvut ovat arvioita: suomenkielinen teksti noin 3,5 tavua per token. Selaintestejä ei ajettu tässä ympäristössä (Playwright puuttuu); niiden tuloste on laskettu `aja.sh`:n tulostusmuodosta.

## Mitä ohjeet vaativat luettavaksi

| Luettava | Kuka | Koko nyt | ≈ tokenia |
|---|---|---|---|
| `AGENTS.md` (latautuu itsestään) | kaikki | 10,5 kt | 3 000 |
| `appiappi/TILA.md` | rakentaja aina | **89,5 kt** | **26 000** |
| `appiappi/PALIKKASAANNOT.md` | rakentaja aina | 10,8 kt | 3 000 |
| työn oma suunnitelma | rakentaja | tyypillisesti 15–28 kt | 4 000–8 000 |
| manuaalin muuttuvat luvut + `10-hakemisto` + `11-versio` | rakentaja (päivittää) | luku 28–67 kt; yksi muutos koskee 4–7 lukua | 0–85 000 |
| `MUUTOKSET.md`, `testit/README.md` | rakentaja lisää rivin | 135 kt, 84 kt | (jos luetaan kokonaan 62 000) |
| koko manuaali + `MISSIO.md` | linjakkuuskartoitus | 456 kt + 13 kt | 134 000 |

**Pienin ohjeiden mukainen lähtö** (AGENTS + TILA + säännöt + suunnitelma): noin 130 kt ≈ 37 000 tokenia. TILA on siitä kaksi kolmasosaa.

**Manuaali on suurin riski.** Esim. Appi-appi 71 muutti seitsemää manuaalitiedostoa, useimpia 1–2 rivillä. Jos rakentaja lukee jokaisen luvun kokonaan, se on 292 kt ≈ 83 000 tokenia kahden rivin muutoksiin. Ohjeet eivät kiellä sitä, eikä manuaalille ole `kartta.py`:n kaltaista otsikkokarttaa.

**TILA:n sisältö** (89,5 kt): Valmiina 28,8 kt (sama tieto on tarkempana `MUUTOKSET.md`:ssä), Jono 17,0 kt (sisältää tehtyjä osia), Avoimet kysymykset 14,7 kt, Ei tarkistettu 13,1 kt (versiokohtaisia rivejä), Suunnitelmat 8,7 kt, Seuraavaksi 6,4 kt (puolet vanhoja kartoitusilmoituksia).

## Koodi ja testit

- `index.html` 1 270 kt, 11 222 riviä (moottori 486 kt, käyttöliittymä 650 kt, tyylit 94 kt). `kartta.py`:n kartta on 4,8 kt. Rivejä yli 500 merkkiä 65, yli 1000 merkkiä 11, joten rivialueen luku pysyy kohtuullisena.
- Tyypillinen versio muuttaa `index.html`:ää 20–165 rivillä (viimeiset 10 versiota). Muutos kohdistuu 1–3 osioon, jotka kartta löytää.
- Testejä 202 (logiikka 92, selain 110). Vihreä ajo tulostaa noin 203 riviä ≈ 13 kt ≈ 3 500 tokenia; kaatunut testi lisää 20 riviä kustakin. Logiikkatestit vievät 21 s ja tulostavat yhteensä 2 kt. Koko sarja vie noin 20 minuuttia, joten se ajetaan taustalla. `aja.sh` ei osaa ajaa osajoukkoa.

## Kasvu

| Versio (aika) | TILA | MUUTOKSET | manuaali | index.html | testejä |
|---|---|---|---|---|---|
| 23 (17.10. 09) | 22 kt | 26 kt | – | 909 kt | 121 |
| 35 (17.10. 15) | 31 kt | 63 kt | 348 kt | 952 kt | 142 |
| 47 (17.10. 22) | 50 kt | 78 kt | 389 kt | 1 075 kt | 163 |
| 59 (18.10. 05) | 72 kt | 102 kt | 422 kt | 1 158 kt | 182 |
| 71 (18.10. 13) | 90 kt | 135 kt | 456 kt | 1 270 kt | 202 |

Versiota kohden (47→71): TILA +1,6 kt, manuaali +2,8 kt, `index.html` +8 kt, testejä +1,6. **TILA kasvaa joka versiolla, vaikka sen pitäisi pysyä lyhyenä**, koska Valmiina-, Seuraavaksi- ja Ei tarkistettu -osioihin lisätään rivi, mutta mitään ei poisteta. Samalla vauhdilla TILA on versiossa 100 noin 135 kt ≈ 39 000 tokenia.

Miksi tämä painaa: kerran luettu teksti kulkee mukana keskustelun jokaisessa myöhemmässä vaiheessa, joten iso lähtölukeminen kallistaa koko ketjun, ei vain alkua. Välimuisti halventaa toistoa, mutta ei poista sitä (päätelmä, ei mitattu).

## Karsintaehdotukset ja säästöarvio

| Jono | Ehdotus | Säästö per rakentajaketju | Hinta |
|---|---|---|---|
| 30 | **TILA laihaksi:** Valmiina yhdeksi riviksi (viittaus `MUUTOKSET.md`:hen), versiokohtaiset *Ei tarkistettu* ja vanhat kartoitusrivit versioiden omiin `MUUTOKSET`-merkintöihin, Jonosta tehdyt osat pois, vastatut kysymykset arkistoon. Raja 30 kt `AGENTS.md`:n *Lopeta näin* -kohtaan. | ~60 kt ≈ 17 000 tokenia nyt, kasvu pysähtyy | yksi dokumenttityö, ei koodia |
| 31 | **Manuaalin otsikkokartta:** `kartta.py` listaa manuaalin otsikot rivinumeroin ja koon; ohjeeseen ”lue vain muuttuva otsikko, hakemistosta rivi, versiosta alku; `MUUTOKSET` ja `testit/README` vain lisätään, ei lueta kokonaan”. | 0–250 kt ≈ 0–70 000 tokenia (riippuu siitä, luetaanko nyt kokonaisia lukuja) | pieni työkalumuutos + ohjerivi |
| 32 | **Kohdennetut testit:** `sh aja.sh painovoima` ajaa vain nimeen osuvat testit; kehityksen aikana ajetaan ne, koko sarja kerran ennen vientiä (ei löysennä mitään). | 20 min → 1–3 min per kehityskierros; jokainen vältetty koko ajo ≈ 3 500 tokenia | pieni muutos `aja.sh`:hon |
| 33 | **Vihreä tuloste tiiviiksi:** `aja.sh` tulostaa vain kaatuneet ja yhteenvedon (”202/202 ok”), lisäksi varoituksen, jos TILA ylittää 30 kt tai `PALIKKASAANNOT` 15 kt. | ~13 kt → <1 kt per koko ajo ≈ 3 500 tokenia | pieni |
| 34 | **⏸ Kartoituksen luku kohdennetuksi:** kartoitus lukee manuaalista vain edellisen kartoituksen jälkeen muuttuneet kohdat (`git diff`), koko manuaalin joka kolmas kerta tai kokonaiskatselmuksessa. Muuttaa `PALIKKASAANNOT.md`:n lukujärjestystä, joten odottaa Emilin päätöstä. | ~300 kt ≈ 85 000 tokenia kahdessa kartoituksessa kolmesta | laadun riski: kokonaislinja nähdään harvemmin |

**Ei ehdoteta nyt: `index.html`:n pilkkominen** (TILA:n vanha tekoälyn ehdotus). Kartta, osiot ja `-n`-haku pitävät koodin luvun jo pienenä; pilkkominen vaatisi koontiskriptin, muuttaisi vientiä ja testien poimintaa ja säästäisi vähemmän kuin kohdat 30 ja 31. Palataan, jos tyypillinen muutos alkaa vaatia useita tuhansia rivejä.

**Yhteensä:** kohdat 30–33 pudottavat rakentajan pakollisen lähdön noin 37 000 tokenista noin 20 000:een ja pysäyttävät sen kasvun, jolloin tuntityön hinta pysyy suunnilleen vakiona. Tehtävien koko pysyy samana nykyisellä yksi kohta = yksi ketju -säännöllä.
