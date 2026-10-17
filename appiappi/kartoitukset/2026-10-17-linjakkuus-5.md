# Linjakkuuskartoitus 5 (17.10.2026)

Vuorossa, koska kartoitus 4:n jälkeen jonosta on viety viisi kohtaa: kaavan sanat yhtenäisiksi (Appi-appi 38, jonon 1l, kaista A), työympäristön pienet korjaukset (39, 1m, kaista B), Tulkki eli printteri (40, jonon 6, kaista A), Jana F28 vaihe 1 (41, jonon 7, kaista B) ja animointi F29 vaihe 2 (42, jonon 8, kaista A). Mittapuu: [PALIKKASAANNOT.md](../PALIKKASAANNOT.md) ja [MISSIO.md](../MISSIO.md). Kartoitus tuottaa löydöksiä ja ehdotuksia, ei koodimuutoksia. **Mikään alla oleva ehdotus ei ole toteutuslupa**, paitsi jonoon lisätty kohta 1n (ks. loppu), joka on pieni ja selvä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran commit `1644c37` (Appi-appi 42), 61 palikkalajia. Viiden kohdan `index.html`-muutokset luettiin kartoitus 4:n commitista `1c2c926` alkaen (noin 710 muutettua riviä), erityisesti Janan moottoriosa (`janaSpec` … `janaIssues`), Janan kohdat ja rekisteri, Tulkin moottori ja ikkuna sekä animoinnin vaihe 2 (`anHtml`, `anPos`).
- **Moottorilla Nodessa kokeiltiin:** Janan ominaisuudet kaavassa (`kohta`, `osuus`, `käynnissä`, `alku`, `loppu` ja asetukset), `muutos.edistyminen` vertailuksi, Kierroksen vaihto nuolen kanssa, arvojanan `käynnissä`, animoinnin valinta-ominaisuudet kaavassa (`animointi.arvo`, `.paikka`, `.ilmestyy`), `"Tänään on " + tänään`, `tänään + " oli"`, `tänään + 1`, `nyt.päivä` päivän rajalla, Liikkeen `kohdex`.
- **Kartoitus 4:n pyynnöt** käytiin läpi kohta kohdalta (ks. oma osio).
- **Testit:** koko sarja ajettiin, ks. *Koko testisarja*.
- **Manuaali:** luvun 5 Jana-merkintä, luvun 7 Tulkki, hakemiston rivit, luvun 11 versio ja Havainnot luettiin; muita lukuja vain viiden kohdan osalta.
- **Ei katsottu:** paneelitekstien nimien kokonaislista (R5 aloitti). Puhelin- ja iPad-näkymän paneelit sormella jäivät pois tarkoituksella, ks. *Tietokone ensin*. Yhteydet-osiosta katsottiin vain, miten Jana näkyy siinä (ks. R5). Ei oikeaa iPhonea.

## Yleiskuva

**Linja pitää.** Viisi kohtaa ei tuonut uutta erikoispalikkaa eikä uutta sääntökieltä. Kartoitus 4:n kymmenen jonoon vietyä kohtaa on korjattu, ja 42 noudatti heti P3:n sääntöä: uudet valinta-ominaisuudet (`animointi.arvo`, `animointi.paikka`) näkyvät kaavassa näkyvällä nimellä (`luku rullaa`, `liukuu`).

- **Tulkki** on oikein rajattu työkalu (A8): se tuottaa tavallisia Arvo-, Muisti- ja Teksti-palikoita ja taulukon rivejä, esikatselu ennen hyväksyntää, ja hyväksyntä on yksi Kumoa-askel. Esikatselu on perusteltu vahvistus (A11), koska yhdistäminen avaimella muuttaa olemassa olevia rivejä.
- **Jana** on Ketjun sisar: ikkuna, jonka sisällä tavalliset Toiminnot ja efektit laukeavat. Se käyttää olemassa olevia osia (Käynnistä, Pysäytä, Aseta arvo, Lisää, Odota, Tapahtuman tiedot), ottaa nuolen arvon etusijalle (A3), selittää merkin Miksi?-osiossa ja efekti merkkinä noudattaa jo opittua sääntöä (*sitten* heti ketjun ulkopuolella). Erikoispalikaksi sitä ei tarvitse merkitä, koska Ketjukaan ei ole: poikkeus koskee ketjun jäseniä, ja janan merkit ovat tavallisia Toimintoja.
- **Animointi vaihe 2** on pelkkä esitys kuten vaihe 1, sen asetukset ovat tavallisia ohjattavia ominaisuuksia (A2), ja uusin muutos voittaa, joten jatkuva muutos ei puuroudu.

Löydökset ovat pieniä ja koskevat pääosin Janaa: sama asia on eri nimellä ja asteikolla kuin sisarpalikoissa (R1), asetuksen vaihto hävittää nuolen hiljaa (R2), ja kaksi reunatapausta näyttää väärää tai ei mitään (R3, R4).

## Löydökset

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| R1 | keski | missio (sama asia, sama nimi), A2 | **Janan `osuus` on 0–100, sisarpalikoiden `edistyminen` 0–1.** Muutos ajassa ja Liikkeen reitti antavat edistymisen nimellä *edistyminen* asteikolla 0–1 (ja paneelin ohje neuvoo viemään sen Käyrään, jonka x-väli on 0–1). Jana antaa saman asian nimellä *osuus* prosentteina. Rakentaja, joka on oppinut yhden, kirjoittaa toiselle väärän nimen tai saa satakertaisen luvun. Kokeiltu moottorilla. | Janalle ulostulo ja ominaisuus **`edistyminen` (0–1)** kuten muilla; `osuus` pois. Paneelin tilarivi saa näyttää prosentit. Koeapeissa ja `master-tiedot`-projekteissa ei ole janaa (tarkistettu: `pkoeappib.json`:n *Osuus* on oma Kaavan tulos), joten mikään ei rikkoudu. **Jonoon 1n.** |
| R2 | keski | A11 (rikkoutuvat yhteydet), A4 | **Kierroksen vaihto hävittää nuolen hiljaa.** Kerran-janalla on kohta *valmis*, Toista- ja Edestakaisin-janalla sen tilalla *kierros*. Kun Kierros vaihdetaan, `repair` poistaa nuolen kohdasta, jota ei enää ole, eikä paluu Kerran-asetukseen palauta sitä (kokeiltu moottorilla: nuoli *valmis* → Toiminto katosi). Sama koskee kulun vaihtoa Aika → Arvo (käynnistä, pysäytä, jatka, alkoi, käynnissä). Kumoa palauttaa, mutta mikään ei kerro, että nuoli lähti. Sisarpalikat tekevät toisin: Toista-palikalla on aina sekä *kierros* että *valmis*, ja Muutos ajassa pitää *valmis*-kohdan toistollakin. | Janalla aina sekä *kierros* että *valmis* (valmis lähtee, kun Kerran-jana pääsee loppuun; toistuvalla janalla se ei laukea, ja paneeli kertoo sen). Kulun vaihdossa ilmoitus ”N nuolta poistui, Kumoa palauttaa”, jos nuolia poistui. **Jonoon 1n.** Yleinen sääntö (mikä tahansa asetus, joka poistaa kohdan) ei jonoon: sama on Toistan tavassa ja Ikkunan lajissa jo ennestään, ja ne ovat harvinaisempia. |
| R3 | pieni | A10 | **Arvojanan `jana.käynnissä` näyttää kohdan.** Ominaisuus on olemassa vain aikajanalla, mutta moottori (`val`, laji `jana`) palauttaa kohdan kaikille tuntemattomille osille. Aikajanalle kirjoitettu kaava näyttää kulun vaihdon jälkeen esim. 7 (kohta) eikä virhettä. Kokeiltu moottorilla. | `käynnissä` on aina olemassa ja arvojanalla *ei* (jana ei kulje ajassa). Silloin rekisteri on sama molemmilla kuluilla. **Jonoon 1n.** |
| R4 | pieni | A10 | **Ketjun *Odota* toistuvalle janalle ei pääty koskaan.** Käynnistä + Odota odottaa, kunnes jana ei ole käynnissä; Toista- tai Edestakaisin-jana ei pysähdy itsestään. Varoitusta ei ole (vastaava info on jo arvojanalle, `chainIssues`). Päätelty koodista (`stepRun`), ei ajettu. | Ketjun huomautuksiin info-rivi: ”jana ”X” toistuu, joten Odota ei pääty, ellei sitä pysäytetä”. **Jonoon 1n.** |
| R5 | pieni | missio (sama sana) | **”Kohta” kahdessa merkityksessä.** Koko appissa *kohta* on nuolen pää (”vie nuoli kohtaan *arvo*”). Janalla se on myös janan asema: paneelin ohje sanoo ”Arvojanan kohta tulee nuolesta kohtaan ”kohta””. Muutos ajassa kutsuu samaa ulostuloa nimellä *arvo*, ja `jana.arvo` toimii jo aliaksena. | **Emilin päätös, ei jonoon.** Vaihtoehto: janan ulostulo ja sisäänmeno nimellä *arvo* kuten Muutos ajassa, `kohta` jää kaavaan aliakseksi, merkin paneelin *Kohta janalla* ennallaan. Suositus: ei vielä; odotetaan, hämmentyykö Emil (sama linja kuin P12). Ohjeteksti voidaan silti muotoilla ilman tuplasanaa, kun 1n muokkaa Janan paneelia. |
| R6 | pieni | A2 | **Janan asetuksia ei voi lukea eikä ohjata:** porras, yksikkö, kulku, hypyssä, laukeaa ja kierros (”tuntematon ominaisuus”). Muutos ajassa tekee samoin (toisto ei ole rekisterissä), ja A2 vaatii vain, että syy kirjataan. Syytä ei ole kirjattu. | Ei muutosta koodiin. Manuaalin Jana-merkintään rivi: asetukset ovat rakennetta, eivät arvoja; alku ja loppu ovat ohjattavia, koska niillä on sisäänmeno. **Jonoon 1n** (pelkkä teksti). |
| R7 | pieni | missio (sama merkki) | **Tulkin kuvion `{nimi}` on kenttä, tekstipohjan `{nimi}` viite.** Suunnitelma 12 perustelee tämän (kuvio on tekstipohjan käänteinen; taulukkoon kenttä osuu sarakkeeseen nimellä, eli merkitys on sama suunta toisin päin), ja manuaali kertoo kenttänimet. | Ei muutosta. |
| R8 | pieni | A8, P12-perhe | **Kuvan *Arvo vaihtuu: ristihäivytys* ja ketjun efekti *Kuva vaihtuu*** näyttävät samalta. Kaksi yleistä reittiä on sallittu (A8), ja 42 antaa efektin voittaa. Anim-sanoja on nyt neljä: efekti *Animaatio*, osio *Animointi*, *kuvasarja-animaatio* ja *Kuva vaihtuu*. | Ei jonoon. Hakemiston erottelu (P12) täydennetään, kun joku muokkaa sitä seuraavan kerran. |
| R9 | pieni | A12 | **Animointi asuu käyttöliittymässä,** ei moottorissa. Se on oikein (pelkkä esitys, D14), mutta A12:n perustelu on, että moottori kopioituu viedyille apeille. Vienti (F23) ei siis saa animointia mukaan pelkällä moottorilla. | Ei jonoon. Kirjataan, kun vientiä (F23) suunnitellaan: viety appi tarvitsee myös `anUpd`-, `anHtml`- ja `anPos`-osat. |
| R10 | pieni | dokumentit | **`MUUTOKSET.md` on paisunut toistosta.** *Kokeiluohjeet*-kappaleessa Appi-appi 23–32 ohjeet ovat kolmeen kertaan (syntyi Appi-appi 33:n rebasessa, `c11e295`); kappale on noin 22 kt yhdellä rivillä, ja jokainen rakentaja lukee sen. *Tallennus*-yhteenvedosta puuttuvat 40:n `kuviot` ja 42:n `anv`, `anm`, `an.v`, `an.m`. Versiot ovat sekajärjestyksessä (40, 42, 37, 38, 39, 41, 32 …). `TILA.md`:n *Valmiina* samoin (40 ennen 38:aa). | Siivous: toistot pois, puuttuvat kentät yhteenvetoon, uusin ensin. Pelkkä Markdown. **Jonoon 1n.** |

## Kartoitus 4:n pyynnöt nyt

| # | Tila |
|---|---|
| P1 päivän raja ja `tänään` | **Korjattu** (38). `nyt.päivä` = 2026-10-16 kello 2.00 rajalla 4, `tänään` yhä kalenteripäivä; taulukon ohje ja manuaali neuvovat `kirjaus.aika.päivä = nyt.päivä` (kokeiltu, testi `logiikka_70`). |
| P3 valinta-ominaisuuden sisäinen nimi | **Korjattu** (38), ja 42 noudatti sääntöä uusissa ominaisuuksissa (kokeiltu: `luku rullaa`, `häivytys`). |
| P4 päivämäärä + teksti | **Korjattu** (38): `"Tänään on " + tänään` = *Tänään on 17.10.2026*, `tänään + 1` siirtää päivää (kokeiltu). |
| P6 Liikkeen nuolikohdat kaavassa | **Korjattu** (38) samoilla ehdoilla kuin nuolikohdat (`kohdex` Napautuksella, `edistyminen` vain Reitillä). |
| P8 Vertailun *sisältää* | **Korjattu** (38). |
| P2, P5, P7, P9, P13 | **Korjattu** (39): raita *Vain rakenne tallentuu ⓘ*, *ƒ Arvo kaavasta*, Monista ja tuonti nollaavat `_gh`, Arvon paneelin Muisti-ohje, versioteksti (`KK.PAJA` = 42, testi `logiikka_27` pitää sen `TILA.md`:n mukaisena). |
| P10, P11, P12 | Ei toimenpidettä, kuten sovittiin. P12 jatkuu R8:ssa. |
| Manuaalin Havainnot | 38 ja 39 poistivat korjaamansa kohdat. 40–42 eivät lisänneet uusia havaintoja; tämän kartoituksen löydöksiä ei viety havaintolistaan (ne ovat tässä ja jonossa). |

## Tietokone ensin (Emil 17.10. klo 23.01 Suomen aikaa)

Emil tarkensi kartoituksen aikana: Appi-appia käytetään yleensä tietokoneella. Puhelin on mahdollinen mutta toissijainen, ja viedyt apit voidaan optimoida iPhonelle. Tämän kartoituksen löydökset arvioitiin rakennuspuolella tietokoneen kannalta; mikään R1–R10 ei riipu puhelimesta. Mitä tämä muuttaa:

- **Säännöt ovat jo oikein.** `AGENTS.md` (*Appien tyyli*): ”Master, Kytköskartta ja Appi-appi rakennetaan tietokoneella.” `MISSIO.md` ja `PALIKKASAANNOT.md` eivät oleta puhelinta.
- **Käytäntö on liukunut puhelimen suuntaan.** Appi-appi 13:sta alkaen jokainen selaintesti ajaa rakennuspuolen myös 390 ja 320 px leveänä, ja jokainen `TILA.md`:n *Ei tarkistettu* -rivi alkaa ”oikea iPhone ja Safari”. Jonon kohta 13 sanoo suoraan ”logiikka rakennetaan myös puhelimella” ja vaatii testin 390 ja 320 px leveydellä. Kartoitukset 2–5 ovat lisäksi luvanneet katsoa puhelin- ja iPad-näkymän paneelit sormella.
- **Ehdotus:** rakennuspuolen uudet testit 1440 ja 1280 px (tietokoneappien sääntö `AGENTS.md`:n *Testaus ja vienti* -kohdassa); nykyinen savutesti (`selain_73`, paneelit 390 px) pitää huolen, ettei puhelin hajoa. Käyttöpuoli (lukittu näkymä, laitenäkymä ja tuleva viety appi) testataan edelleen 390 ja 320 px: se on se osa, joka päätyy iPhonelle. Kohdan 13 testileveys korjattiin tämän mukaiseksi (1440 ja 1280, puhelimella vain ettei hajoa). *Ei tarkistettu oikealla iPhonella* koskee jatkossa käyttöpuolta, ei rakentamista.
- **Kartoitus 4:n puhelinpuutteet** (monivalinta vain ⇧:llä, ei nipistystä näkymän muokkauksessa, pikakatselu vain tietokoneella) pysyvät pois jonosta, nyt perustellummin.
- **Viennin kannalta merkitsevät:** animoinnin `translate` vaatii iOS 14.1+ (42) ja animointi asuu käyttöliittymässä (R9); Janan merkkien laukaisu vain auki olevassa apissa (41). Nämä kuuluvat viennin (F23) suunnitelmaan, eivät rakennuspuolen korjauksiin.

## Kaksi kaistaa

| # | Vakavuus | Löydös | Ehdotus |
|---|---|---|---|
| K7 | pieni | **Tallennusmuodon vuoro ohitettiin kerran, ilman haittaa.** Kaista B merkitsi Janan ”tallennusmuodon vuoro” klo 17.58 (UTC), ja kaista A vei Tulkin klo 18.10, vaikka siinä oli uusi valinnainen projektikenttä `kuviot`. Tulkin työmerkintä (17.33) ei kertonut muodon muutoksesta. Kentät eivät törmänneet, Jana rebeissattiin ja testit menivät läpi, mutta `TILA.md`:n lause ”vietiin ennen kaistan B Janaa, joten vuorot eivät mene päällekkäin” ei pidä paikkaansa. Versionumerot 38–42 ja testinumerot (`logiikka_70`–`73`, `selain_78`–`82`) ovat yksilöllisiä, eikä jonorivejä kadonnut. | Sääntö ennallaan. Muistutus rakentajille: jos työ osoittautuu muodon muutokseksi kesken, työmerkintä päivitetään ennen vientiä. `TILA.md`:n lause korjataan 1n:n yhteydessä. |

## Erikoispalikoiden rekisteri

Ei uusia rivejä. Jana ei ole erikoispalikka (ks. Yleiskuva), Tulkki on työkalu eikä palikka, ja animointi on näkymäpalikan yhteinen osio. Rekisteri vastaa koodia (`logiikka_58` läpi).

## Lisätty jonoon

- **1n. Janan nimet ja reunat linjaan, muutosloki siistiksi** (R1, R2, R3, R4, R6, R10, K7): Janan `osuus` → `edistyminen` 0–1; Janalla aina sekä *kierros* että *valmis*; kulun vaihto kertoo poistuneista nuolista; arvojanan `käynnissä` = ei; ketjun info-rivi Odota-toistuvalle janalle; manuaaliin asetusten syy; `MUUTOKSET.md`:n toistot pois ja tallennusyhteenveto täydeksi. Ei tallennusmuodon muutosta (kohdat lasketaan lajista, nuolet säilyvät). Sopii kummalle kaistalle tahansa; tulee jonossa ennen kohtaa 9.

## Koko testisarja

`sh appiappi/testit/aja.sh` ajettiin kokonaan commitilla `1644c37`: logiikka 73/73 ja selain 82/82 läpi, ei sivuvirheitä (KAIKKI OK). Vain tietokoneen Chromiumissa, ei oikealla iPhonella.

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri alkaa 1n:stä), ennen uuden toimintoryhmän suunnittelua (esim. F25, F32 tai vienti omaksi appiksi) tai pyynnöstä. Ensi kerralla: nimien kokonaislista (R5 aloitti), käyttöpuoli puhelinleveydellä viennin näkökulmasta, Peliohjain ja Hae rivitiedosto, jos ne on viety.
