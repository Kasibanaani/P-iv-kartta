# Linjakkuuskartoitus 9 (18.10.2026, Appi-appi 59–64)

Vuorossa, koska kartoitus 8:n jälkeen jonosta on viety viisi kohtaa: esiintymämerkki 2× (Appi-appi 59, jonon 24, kaista B), kartoitus 8:n korjaukset 1r (60, A), kelluva Rakennuslaatikko (61, jonon 21, B), Joukko-palikka 15d (62, A, tallennusversio 11) ja jäsenten tapahtumat 15e (63, A, tallennusversio 12). Kaista B:n näppäimistö Peliohjaimeen (Appi-appi 64, jonon 33b, F33 vaihe 4) valmistui kartoituksen aikana, ja koordinaattorin pyynnöstä se katsottiin samalla, joten kartoitus kattaa versiot **59–64** ja laskuri alkaa 64:n jälkeen. Joukkokokonaisuus (suunnitelma [25](../suunnitelmat/25-joukot-tageina-ja-kaava.md), jonon 12f–15e, Appi-appi 54–63) on nyt kokonaan rakennettu, joten se katsottiin kokonaisuutena. Mittapuu: [PALIKKASAANNOT](../PALIKKASAANNOT.md) ja [MISSIO](../MISSIO.md). Kartoitus tuottaa löydöksiä, ei koodia. **Mikään alla oleva ei ole toteutuslupa**, paitsi jonoon lisätty kohta 1s, joka korjaa jo vietyä työtä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran `f958646` (Appi-appi 63). Viiden version muutokset `index.html`:ssä kartoitus 8:n pohjasta `96814e9` (Appi-appi 58) alkaen, noin 1 200 riviä: 59 `nextInstance`, `.ninst`; 60 `jkCand`/`jkOf`, `vtPick`, `jkSugItems`, paletin *Suodatus*; 61 `RL_IT`, `rlInsert`, `rlKlik`, `rlChipDown`; 62 `repairPj`, `jkPjMap`, `jkVoi`, `jkInfoCalc`, `jkTest`, `jasenEv`, `jkCtl`, `siirtoOf`, `pjoukkoInsp`, `ownCtl`, Miksi?-haara; 63 `jkTapahtumat`, `JKTAP`, `JKTVAR`, `jkFire`, `jasIn`, `winJas`, `toistaJasenet`, Toiminnon `otj`-haara.
- **Moottorilla Nodessa kokeiltiin** (skriptit vain kartoittajan koneella, eivät repossa): kolikot nykyisillä joukoilla (kolme kolikkoa ja pelaajan Liike); `jäsen` Joukon kenttien ulkopuolella ilman Jäsenille-ikkunaa ja sen kanssa; Jäsenten lajin vaihto, kun kohdassa on nuoli; säännön ajonaikainen virhe (tuntematon nimi, jako nollalla); kaksi Joukkoa samaan kohtaan, kun logiikan järjestys ja luontijärjestys eroavat; Liikkeen törmäsi, kun jäsen on Muoto ja kun jäsen on Liike; sekajoukko (Arvo + Muoto) *Vain jos* `jäsen.y < 600` -ehdolla; joukon säännön `x` ja siirto `rectNow`issa; keveys 100–400 jäsenellä (säännöt *näkyy kun* ja *siirto x*, välimuisti `omBatch` kuten käytössä).
- **Selaimessa:** keveystesti `selain_91_keveys` muunnettuna niin, että sen 400 seinää ovat joukon jäseniä ja Joukko-palikalla on yksi sääntö (ks. S4).
- **Suunnitelmat:** 25 kokonaan, 21 kohdat 1–7 ja Linjakkuus, 19 kohdat 5 ja 7 (kolikot, Rakennuslaatikko). TILA:n avoimet kysymykset 61, 62 ja 63.
- **Manuaali:** luku 7 (*Palikoiden joukot*, *Joukko-palikka*, *Jäsenten tapahtumat*), luku 11 (*Tarkistettu versio*, sana *joukko*) ja hakusanat (Tapahtuman jäsen, Rakennuslaatikko, 2×, Jäsenten laji, Toista jäsenille, Vain jos, Suodatus) kaikista luvuista. Muita lukuja ei luettu.
- **Testit:** koko sarja, ks. *Koko testisarja*.
- **Appi-appi 64 (`32ce3fb`):** muutos luettiin kokonaan (`PADKEY`, `PADKEYN`, `nappTila`, `padYhdista`, `KB`, näppäinkuuntelijat, `padKierros`), testit `logiikka_86`, `selain_103` ajettiin erikseen 64:n päällä (ks. *Koko testisarja*).
- **Kaistat:** versionumerot 59–64 ja testinumerot (`logiikka_83`–`86`, `selain_98`–`103`) yksilöllisiä; jonon rivejä ei kadonnut (verrattu kartoitus 8:n committiin `d2fa2b2`).
- **Ei katsottu:** puhelinleveys, oikea iPhone ja Safari; Rakennuslaatikkoa eikä näppäimistöä kokeiltu käsin (vain koodi ja testit).

## Yleiskuva

**Linja pitää.** Joukot ovat sitä, mitä suunnitelma 25 lupasi: yksi `#`-sana, koosteet ominaisuuksina, kaava ilman funktioita, Joukko-palikka sääntöjen koti, tapahtumat kiinteänä listana, etusija suunnitelman 25 kohdan 8 mukaan. Rinnakkaisuus Rivijoukon kanssa on johdonmukainen (*ehto riveittäin* ↔ *Vain jos*, *Toista riveille* ↔ *Toista jäsenille*, *Riveille* ↔ *Jäsenille*), ja kartoitus 8:n pyynnöt on tehty (taulukko alempana). Paletissa on nyt vain yksi *Joukko*.

Viedyssä työssä on kolme keskitason löydöstä, jotka kaikki ovat samaa lajia: **hiljainen väärä tulos**. Joukon säännön virhe piilottaa jäsenen eikä näy missään (S1), `jäsen` on tyhjä koko projektissa, jos jossain on Jäsenille-ikkuna (S2), ja suunnitelman oma esimerkki *kun jäsen törmäsi → piilota juuri se* ei toimi, koska Liikkeen tapahtumassa jäsen on Liike eikä liikkuva palikka (S3). Lisäksi joukon säännöt maksavat noin 20 kertaa enemmän kuin tavallinen palikka (S4), mikä kannattaa korjata ennen 2D-vaiheita.

Rakennuslaatikon kolikko on kömpelö, mutta ei siksi, mitä TILA:ssa ehdotettiin: se kopioi koko logiikan jokaiselle kolikolle. Joukoilla saman saa jo nyt kolmella palikalla kolikkoa kohden ja yhteisellä logiikalla (R1).

## Löydökset: viety työ (59–63)

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus tai hiljainen väärä tulos, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| S1 | keski | A10 | **Säännön virhe katoaa hiljaa.** *Säännöt jäsenille*: `näkyy = jäsen.x > puuttuva` tai `1 / 0 > 1`. Moottori: `jkCtl` antaa virheen, `visible` tekee siitä epätoden, joten jäsen on **piilossa**; jäsenen arvo ei ole virhe, Joukko-palikan arvo on 1 (ei virhettä) ja sääntökenttä näyttää vain jäsennysvirheen (`pjFx`, `parseKaava`), ei laskun virhettä. Lisäksi `jkCtl`in `catch(er){hit=null;}` nielee poikkeukset. Oma *näkyy kun* -nuoli virheelliseltä Kaavalta näyttää virheen Kaavassa; joukon säännöllä virhettä ei näe mistään. | Säännön laskuvirhe näkyy: Joukko-palikan sääntörivin alla ⚠ ja virheen nimeämä jäsen, Joukko-palikka virheen merkillä (kuten Kaava), jäsenen paneelissa *joukon #x sääntö: virhe …* ja Miksi?. `catch` ei niele: virhe palautetaan. Puuttuva ominaisuus (`jpu`) ohittaa jäsenen kuten nyt (U2). Testi: tuntematon nimi ja jako nollalla. **Jonoon 1s.** |
| S2 | keski | A10 | **`jäsen` on tyhjä koko projektissa, jos jossain on Jäsenille-ikkuna** (15e:n valinta 4). Kokeiltu: Kaava `jäsen.x + 1` ilman ikkunaa = virhe *jäsen on käytössä vain …*; kun projektiin lisätään Jäsenille-ikkuna aivan muualle, sama Kaava = **1** ilman virhettä. Toisen paikan muutos muuttaa virheen hiljaa luvuksi. | Tyhjä vain palikalla, joka on Jäsenille-ikkunan sisällä (kanvaasi näyttää silloin ”–” kuten Riveille-ikkunassa); muualla virhe kuten ennen. **Jonoon 1s.** |
| S3 | keski | A4, A8 | **Liikkeen tapahtumat eivät tule liikkuvan palikan jäseninä** (15e:n valinta 3). Kokeiltu: (a) Muoto tagilla `#viholliset`, sen Liike törmää seinään, Joukko Jäsenten laji Liike → **0 tapahtumaa**, koska jäsen on Muoto ja tapahtuman lähettää Liike. (b) Tagi Liikkeelle → tapahtuma tulee, mutta Toiminto *Aseta näkyy = ei*, kohde *Tapahtuman jäsen* ohittaa sen **hiljaa**, koska Liikkeellä ei ole `näkyy`-ominaisuutta. Suunnitelman 25 kohdan 3.3 esimerkki *kun jäsen törmäsi → piilota juuri se* ei siis toimi, eikä manuaalin luvun 7 kohta *Liike → jäsen törmäsi* kerro, että jäseneksi pitää merkitä Liike eikä liikkuva palikka, ja 2D-vaihe D (viholliset) törmää tähän. | Liikkeen tapahtuma (törmäsi, perillä, askel valmis, päässä) lähtee **myös liikutettavan palikan** jäsentapahtumana: jäsen = Liikkeen kohde (`b.o`), `tapahtuma.lähde` = Liike. Näkymäpalikkalajien *Jäsenten laji* tuo listaan myös Liikkeen tapahtumat (mikä tahansa näkymäpalikka voi liikkua; lista pysyy kiinteänä, U3). Liike jäsenenä toimii ennallaan. Kohde *Tapahtuman jäsen*: jäsen, jolla valittua ominaisuutta ei ole, ohitetaan kuten nyt, mutta Miksi? ja ketjun info kertovat sen (*jäsenellä ”Kävely” ei ole ominaisuutta näkyy*). Manuaali luku 7 ja TILA:n valinta 3 päivitetään. **Jonoon 1s.** |
| S4 | keski | missio (keveys), suunnitelma 21 *Keveys* | **Joukon sääntö maksaa noin 20 kertaa tavallisen palikan verran.** Moottori, välimuisti kuten käytössä: 400 Muotoa ilman sääntöä 0,6 ms kuvassa (tila + paikka), samat tagilla 0,6 ms, **säännöllä 11–14 ms** (100 jäsentä 3–8 ms). Vakio `näkyy = kyllä` maksaa yhtä paljon kuin `jäsen.x > 100`, joten hinta ei tule kaavasta vaan jäsenkohtaisesta arvioinnista (`jasenEv` tekee jokaiselle jäsenelle oman arvioinnin joka kuvassa; profiilissa roskienkeruu ja `omat`-rekisterin rakentaminen). **Selain** (keveystesti `selain_91`, 400 seinää joukon jäseninä, tatti pohjassa, 1440 px): ilman sääntöä 55 kuvaa/s ja moottori 3,0 ms kuvassa; yksi sääntö *vaihtoväri kun* 44 kuvaa/s ja 7,8 ms, *näkyy kun* 39 kuvaa/s ja 12,2 ms, *siirto x* 33 kuvaa/s ja 15,3 ms (testin raja 8 ms). Ruudun ulkopuoliset seinät ohitettiin edelleen. | Säännön tulos lasketaan jäsenelle kuvaa kohden ilman uutta arviointia aina, kun mahdollista (vakio- ja nuolisääntö lasketaan kerran koko joukolle; jäsenkohtainen arviointi jakaa välimuistin). Pysyvään keveystestiin (`selain_91` tai uusi) tapaus: 400 seinää joukon jäseninä ja yksi sääntö, raja kuten nyt (vähintään 30 kuvaa/s, moottori alle 8 ms). **Jonoon 1s.** |
| S5 | pieni | A3, dokumentit | **”Ensimmäinen joukko voittaa” tarkoittaa luontijärjestystä**, mutta TILA (15d valinta 2) ja manuaali (luku 7 rivi 369) sanovat *logiikan palikkajärjestyksessä*. Kokeiltu: logiikassa ylempänä `#toka`, voittaja `#eka` (tehty ensin). Ristiriita näkyy jäsenen paneelissa (*ei ohjaa: toinen joukko*), joten A3 täyttyy. | Teksti: *ensin tehty Joukko-palikka voittaa* (TILA, manuaali, paneelin ohje). Koodia ei tarvitse muuttaa. **Jonoon 1s.** |
| S6 | pieni | A9 | **Joukkojen numerointi kahdella tavalla:** paletin Joukko tekee `#joukko`, `#joukko2`, mutta monistus ja korjaus (`repairPj`) tekevät `#nimi_2`. Sama ongelma kuin kartoitus 8:n S3 (`jos_2`/`jos2`). | Yksi tapa: kuten viitteillä (`nimi2`), koska joukon nimi ei ole varattu sana. Vanhat nimet ennallaan. Sukua jonon 25 (c):lle (nimien ja viitteiden numerointi kopiossa): kumpi tahansa ensin, sama sääntö molempiin. **Jonoon 1s.** |
| S7 | pieni | A8, A10 | **`jäsen.`-ehdotuksia ei ole** Joukko-palikan kentissä (15d:n valinta 5): kaikki muu kaavassa ehdottaa pisteen jälkeen, nämä kentät eivät. Rakentaja kirjoittaa ominaisuuden nimen ulkoa. | Ehdotusrivi kuten `#x.`:lle (1r): jäsenten yhteiset ominaisuudet ensin, sitten *vain osalla jäsenistä*; ilman jäseniä *Ota mukaan* -lajin ominaisuudet. **Jonoon 1s.** |
| S8 | pieni | B (menettely) | **Joukko merkittiin erikoispalikaksi ilman päätöstä** (`b83dff1`, Appi-appi 62): rekisterin tila *päätetty (suunnitelma 25 kohdat 3.4 ja 8)*, vaikka suunnitelmat 25 ja 21 sanovat *ei erikoispalikka*. PALIKKASAANNOT B: uusi erikoispalikka vaatii suunnitelman perustelun ja Emilin hyväksynnän. **Sisältö on silti oikein:** poikkeukset (ei omaa viitettä, yksi per joukko, kentissä sana `jäsen`) ovat todellisia ja Emil hyväksyi jokaisen erikseen (suunnitelma 25 kohdat 7.7 ja 8.5, suunnitelma 21 kohta 3). ✦ kertoo ne rehellisemmin kuin merkinnän puuttuminen. | Kartoitus arvioi poikkeuksen tarkoitukselliseksi: rekisterin tila **arvioitu (kartoitus 9)**, ja suunnitelmien 21 ja 25 Linjakkuus-rivit korjattu kertomaan ✦:stä. Tehty tässä kartoituksessa (vain teksti, `erik`-koodi ennallaan). Emil voi kumota. |
| S9 | pieni | dokumentit | **Vanhentunutta tekstiä:** suunnitelman 25 alussa *Ei toteutettu* (kaikki vaiheet viety 54–63); TILA:n *Kärki (Emil 18.10. klo 4.09)* -kappale on historiaa; manuaalin luvun 11 *Tarkistettu versio* on yksi yli 6 kt:n kappale, joka kasvaa joka versiolla (53 kahdesti, ”..”-typo), vaikka AGENTS sanoo *korvaa vanhentunut, älä kasaa historiaa*. | Suunnitelman 25 tila korjattu tässä kartoituksessa. TILA:n kärkikappale ja luvun 11 kappale tiivistetään (versio, mitä tarkistettiin viimeksi, viittaus `MUUTOKSET.md`:hen). **Jonoon 1s.** |

**Ei löydöksiä:** 64 (näppäimistö on syöte samaan Peliohjaimen tilaan kuin oikea ohjain, ei uutta palikkaa eikä kohtaa; muunnos moottorissa (`nappTila`, `padYhdista`, A12); `KeyboardEvent.code` tekee kartasta kieliriippumattoman; kuuntelu vain lukitussa käytössä projektissa, jossa on Peliohjain tai ohjaimeen sidottu Tatti tai Painike, ei tekstikentissä eikä ⌘/Ctrl/Alt-yhdistelmissä; manuaali luvut 3, 4, 10 ja 11 päivitetty). *Huomio, ei jonoon:* sellaisessa projektissa välilyönti ja Enter ovat käytössä aina ohjaimen nappeja, joten ne eivät aktivoi näppäimistöllä kohdistettua Painiketta; Emilin käytössä (hiiri ja peli) tämä ei haittaa. 59 (esiintymämerkki laskee esiintymät kerran piirtoa kohden, napautus kiertää ja keskittää, katkoviiva erottaa muut esiintymät), 60 (kartoitus 8:n S1–S4 ja W1 tehty, testit `logiikka_83`, `selain_99`), Jäsenten lajin vaihto (poistuneet nuolet kerrotaan yleisellä *Asetus muutti palikan kohtia … Kumoa palauttaa* -ilmoituksella, `lostToast`).

## Joukkokokonaisuus suunnitelmaa 25 ja palikkasääntöjä vasten

| Suunnitelma 25 | Toteuma |
|---|---|
| Tunnus `@viite #joukko`, rekisteri `P.jkr`, tagit `b.jkt`, `{%id}` | 57 ✓ |
| Koosteet `#x.summa` … `.arvot`, `.jäsenet`, `summa(#x)` kääntyy | 57 ✓ (1r: ehdotukset sekajoukossa) |
| `joukot`-ominaisuus, *kuuluu #x kun*, Lisää joukkoon / Poista joukosta | 57 ✓ (1r: virhe ei katoa) |
| Toiminto kohteena joukko | 57 ✓ |
| Joukko-palikka: Ota mukaan (laji, näkymä, kerros, ehto), Vain jos, pois suljetut | 62 ✓ |
| Etusija (kohta 8.1) ja Miksi? kertoo tason | 62 ✓ (`jkInfoCalc`, `jkSyy`) |
| Sekajoukko (8.2): puuttuva ominaisuus ei päde | 62 ✓ kokeiltu: Arvo ei jäsen, syy *jäsenellä ”A” ei ole ominaisuutta .y* |
| Säännöt jäsenille ja nuoli Joukon kohtaan | 62 ✓, mutta virhe katoaa (S1) ja hinta (S4) |
| Pikatiet tunnistavat joukon ohjauksen (kartoitus 7 U6) | 62 ✓ `jkVoi` `omActive`issa; kokeiltu `rectNow` = perus 10 → sääntö 200 + siirto 50 = 250 |
| Kiinteät kohdat ja tapahtumat (8.3) | 62–63 ✓ |
| Avaimet `jex`, `otj` (8.4) | 62–63 ✓ |
| Elinkaari (8.5) | 62 ✓ (`jkPoista` vie Joukko-palikan, `jkNimea` molemmat) |
| `tapahtuma.jäsen`, Toista jäsenille, Jäsenille | 63 ✓, mutta Liike (S3) ja `jäsen` muualla (S2) |
| `#x = …` kaavassa | ei tehty (Emilin päätös: ei vielä) |
| Ikkunan *Sisältö kuuluu joukkoon* | ei tehty (myöhempi ehdotus) |

**Palikkasäännöt Joukko-palikalle:** A1 (nimi kertoo kokoamisen) ✓, A2 (`jäseniä`, `jäsenet`; *Ota mukaan* ja *Vain jos* ovat kaavan kaltaisia määrityksiä, eivät ominaisuuksia, kuten Kaavan `f`) ✓, A3 ✓, A4 ✓, A6 ✓, A7 ✓, A8 ✓ (Rivijoukon rinnakkainen kieli), A9 ✓, **A10 ✗ (S1, S2)**, A11 ✓ (*Pois*/*Palauta* suoraan, Kumoa), A12 ✓, A13 ✓ (versiot 11 ja 12, `repairPj`, testit), A14 ✓, A15 ✓ (manuaali luku 7 päivitetty).

## 15d:n, 15e:n ja 61:n omat valinnat (TILA, avoimet kysymykset)

| Valinta | Arvio |
|---|---|
| 15d (1) *Pois* vain Ota mukaan -jäsenille, tagilla liitetty poistetaan tagista | Järkevä: tagi on palikan oma tieto, ja kaksi tapaa poistaa sama asia olisi opittava ero. |
| 15d (2) Kaksi joukkoa samaan kohtaan: ensimmäinen voittaa | Järkevä, ristiriita näkyy; sana *ensimmäinen* korjattava (S5). |
| 15d (3) Saman Joukon nuoli voittaa säännön | Järkevä: nuoli on ohjattu, sääntö oletus. |
| 15d (4) Jäsenen oma asetus = oma ohjaus | Järkevä ja A3:n mukainen. |
| 15d (5) `jäsen.`-ehdotuksia ei tehty | Kitka, korjataan (S7). |
| 15d (6) `#x = …` ei tehty | Emilin päätös. |
| 15d (7) Monistus tekee `#nimi_2` | Järkevä (yksi palikka per joukko), numerointi yhtenäistetään (S6). |
| 15d (8) Ota mukaan ilman lajia, näkymää ja ehtoa on pois päältä | Järkevä: muuten tyhjä sääntö ottaisi koko projektin. |
| 15e (1) Ei yhteistä *napautettu*-tapahtumaa ennen 14b:tä | Järkevä; 14b:n rivillä pitää mainita, että se lisätään `JKTAP`:iin (lisätty 14b:n riville). |
| 15e (2) Lajin tapahtumat kaikista asetusvaihtoehdoista | Järkevä (U3, nuolet eivät katoa). |
| 15e (3) Liikkeen tapahtumassa jäsen on Liike | **Ei järkevä yksin** (S3): liikkuvan palikan joukko ei saa tapahtumia. |
| 15e (4) `jäsen` tyhjä, jos projektissa on Jäsenille-ikkuna | **Ei järkevä** (S2): rajataan ikkunan sisälle. |
| 15e (5) Toista jäsenille ohittaa kesken poistetun | Järkevä; ero Toista riveille -toistoon on perusteltu ja kirjattu. |
| 15e (6) Tapahtuman jäsen ei Siirry- tai taulukkotoiminnoille | Järkevä. |
| 15e (7) Ikkuna ei yhtä aikaa Riveille ja Jäsenille | Järkevä (yksi läpikäynti kerrallaan). |
| 61 (1)–(3) Laatikon tila selaimessa, Pisteet viitteellä, logiikka omaan Ryhmään | Järkeviä. |
| 61 (4) Kolikko viidestä palikasta, ehdotus *poistuu käytöstä* -toiminto | Ks. R1. |

## Rakennuslaatikon kolikko (R1)

**Onko kolikko liian kömpelö?** Kyllä, kun kolikoita on monta. Yksi kolikko on Muoto, Alue, Muisti *kerätty*, kaksi Toimintoa ja Kaava (`jos kerätty niin ei muuten kyllä`) omassa Ryhmässään. 20 kolikkoa = 120 palikkaa ja 20 Ryhmää, ja jos kolikon arvoksi halutaan 5 pistettä, se muutetaan 20 Toimintoon. Tämä on juuri se *sama sääntö monelle palikalle* -ongelma, jonka joukot ratkaisevat (suunnitelma 21 kohta 1).

**Kaista B:n ehdotus *poistuu käytöstä* -toiminto** ei osu syyhyn. Piilotettu este ei jo nyt estä (`onEste` ohittaa piilossa olevan), ja jäljelle jäävä Alue ei laske uudestaan, kun *kerätty* on päällä. Uusi toiminto lisäisi opittavan poikkeuksen (toinen tapa piilottaa) eikä vähentäisi kopioitua logiikkaa.

**Joukoilla kolikko onnistuu jo nyt**, kokeiltu moottorilla (kolme kolikkoa, pelaajan Liike kulkee niiden läpi → Pisteet 3, kaikki kolikot piilossa, toista kertaa ei lasketa):

- Kolikkoa kohden: **Muoto**, **Alue** tagilla `#kolikot` ja **Kaava** Muodon *näkyy kun* -kohtaan: `kolikko_alue.joukot sisältää "kolikot"`.
- Kerran yhteisesti: **Joukko** `#kolikot` (Jäsenten laji Alue) → *jäsen astuttu* → **Poista joukosta** `#kolikot`, kohde *Tapahtuman jäsen*, ja **Lisää** Pisteet 1.
- Jäsenyys on kolikon muisti: kerätty alue ei ole enää joukossa, joten se ei lähetä tapahtumaa eikä Muoto näy. *Palauta* palauttaa kaiken.

Ehdotus (jonoon 1s): Rakennuslaatikon Kolikko tehdään näin; yhteinen osa luodaan vain ensimmäisellä kerralla, kuten Pisteet nyt (`G.muisti`). Kolikko on silloin myös manuaalin esimerkki siitä, mihin joukko kelpaa (luku 7).

*Tekoälyn ehdotus myöhemmäksi, ei jonoon:* näkymäpalikan valinnainen **osuma-anturi** (Muoto tai Kuva lähettää *astuttu*/*poistuttu* kuten Alue, piilossa ei tunnista). Silloin kolikko olisi yksi Muoto tagilla, ja Alue jäisi pois. Se on yhteisen ominaisuuden laajennus (A8) ja tallennusmuodon muutos, joten se vaatii oman suunnitelman ja Emilin hyväksynnän. 2D-vaiheen D Laattakartta tekee laattakolikot muutenkin, joten tarve kannattaa katsoa vasta sen jälkeen.

## Kartoitus 8:n pyynnöt nyt

| # | Tila |
|---|---|
| S1–S4, W1 (1r) | **Tehty** (60). |
| U1 etusija ja Miksi? | **Tehty** (62): Miksi? ja jäsenen paneeli kertovat tason. |
| U2 sekajoukko | **Tehty** (62), kokeiltu. |
| U3 kiinteät kohdat ja tapahtumat | **Tehty** (62, 63). |
| U4 avaimet `jex`, `otj` | **Tehty**. |
| U5 elinkaari | **Tehty** (62). |
| U6 suunnitelman 21 merkintä | **Tehty** (kartoitus 8). |
| Kartoitus 7 U6 pikatiet | **Tehty** (`jkVoi`), mutta hinta (S4). |

## Erikoispalikoiden rekisteri

Joukon (`pjoukko`) rivin tila *päätetty* → **arvioitu (kartoitus 9)**, ks. S8. Ei muita muutoksia.

## Koko testisarja

`sh appiappi/testit/aja.sh` commitilla `f958646` (Appi-appi 63): **kaikki 187 läpi** (logiikka 85/85, selain 102/102), ei sivuvirheitä; `selain_91_keveys` 1440 px 55 kuvaa/s, moottori 3,0 ms. Appi-appi 64:n päällä (`32ce3fb`) ajettiin uudelleen kaikki logiikkatestit (86/86), `selain_103_nappaimisto` ja `selain_91_keveys`: läpi. Muita selaintestejä ei ajettu 64:n päällä. Vain tietokoneen Chromiumissa, ei oikealla iPhonella.

## Lisätty jonoon

- **1s. Kartoitus 9:n korjaukset** (S1–S7, S9, R1), jonon kärkeen. Ei tallennusmuodon muutosta, joten se sopii toiselle kaistalle muotokohdan rinnalle. Ennen 2D-vaiheita ja 14b:tä, koska S3 ja S4 koskevat samaa joukkokoodia (`jkFire`, `jkCtl`, `JKTAP`), jota 14b ja 2D-vaiheet A–D laajentavat.
- 14b:n riville: yhteinen *napautettu* lisätään myös Joukon tapahtumiin (`JKTAP`, 15e:n valinta 1).
- Suunnitelmaan 25 tila (toteutettu 54–63) ja Linjakkuus-rivi, suunnitelmaan 21 Linjakkuus-rivi, PALIKKASAANNOT-rekisteriin tila *arvioitu* (S8).

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri 0/5, alkaa Appi-appi 64:n jälkeen viedystä), ennen uuden toimintoryhmän suunnittelua (2D-vaiheet) tai pyynnöstä. Katso silloin, että joukon säännön virhe näkyy (S1) ja että 400 jäsenen sääntö pysyy keveysrajan alla (S4).
