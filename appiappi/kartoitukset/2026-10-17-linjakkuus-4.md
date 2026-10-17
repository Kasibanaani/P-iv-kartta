# Linjakkuuskartoitus 4 (17.10.2026)

Vuorossa, koska kartoitus 3:n jälkeen jonosta on viety viisi kohtaa: testitila *Kokeile* (Appi-appi 33, F22, kaista B), ryhmän viite ja näkyvät virheet (34, 1k, kaista A), animointi vaihe 1 (35, F29, kaista B), rakenteinen historia (36, F08, kaista B) ja viite-ehdotukset ja Luo Arvo (37, F27 kohta 1, kaista A). Mukana myös manuaalin luvun 11 *Havainnot*, kartoitus 3:n jonoon viemättömät huomiot ja F08:n avoin kysymys päivän rajasta. Mittapuu: [PALIKKASAANNOT.md](../PALIKKASAANNOT.md) ja [MISSIO.md](../MISSIO.md). Kartoitus tuottaa löydöksiä ja ehdotuksia, ei koodimuutoksia. **Mikään alla oleva ehdotus ei ole toteutuslupa**, paitsi jonoon lisätyt kohdat 1l ja 1m (ks. loppu), jotka ovat pieniä ja selviä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran commit `1c2c926` (Appi-appi 37), 60 palikkalajia. Viiden kohdan `index.html`-muutokset luettiin (noin 430 muutettua riviä). Moottorilla Nodessa kokeiltiin: päivän raja klo 4 ja kello 2.00 (`loki.tänään`, `viimeisin.aika.päivä = tänään`, `nyt.päivä`), sarakkeen nimi *Päivä* ja `loki.päivä`, `"Tänään on " + tänään`, `jos("ei"; 1; 2)`, animoinnin valinta-ominaisuus vertailussa, Ryhmä ja samanniminen Arvo, Liikkeen nuolikohdat kaavassa.
- **Kokeilu ja käyttötiedot (K2):** taulukon käyttörivit ovat `P.st`:ssä (`tRows`), jonka kokeilu kopioi. Testi `selain_74_testitila.py` tarkistaa `taulu.vika`-kaavan kokeilussa ja sen jälkeen. Kartoitus 3:n K2 on siis kunnossa.
- **Testit:** koko sarja läpi (logiikka 69/69, selain 77/77), ks. *Koko testisarja*.
- **Manuaali:** luku 11 *Havainnot* (54 kohtaa) luettiin kokonaan; tärkeimmät tarkistettiin koodista tai moottorilla. Muita lukuja luettiin vain viiden kohdan osalta.
- **Ei katsottu:** puhelin- ja iPad-näkymän paneelit sormella, Yhteydet-osio ja nimien kokonaislista kaikkine paneeliteksteineen (kartoitus 2:n lupaus, vain palikoiden nimet käytiin läpi), oikea iPhone.

## Yleiskuva

**Linja pitää.** Viisi kohtaa ei tuonut yhtään uutta erikoispalikkaa eikä uutta sääntökieltä. Kokeilu (F22) on oikein rajattu: oikeat tiedot eivät mene mihinkään tallennukseen. Animointi (F29) on pelkkä esitys, ja sen asetukset ovat tavallisia ohjattavia ominaisuuksia (A2). Historia (F08) käyttää tavallista Tietotaulukkoa, joten Rivijoukko, Toistin ja kaavat toimivat sen kanssa ilman uutta käsitettä (A8). Luo Arvo tekee tavallisen Arvo-palikan (A8: pikaluonti tuottaa tavallista logiikkaa). Kartoitus 3:n N1, N2 ja N4 on korjattu (Appi-appi 34), ja F27-1 vei ehdotusrivin myös muihin tekstikenttiin (N7).

Kaksi löydöstä on isompia. Ensinnäkin **päivän raja ja `tänään` ovat ristiriidassa**, ja appin oma ohje neuvoo käyttämään juuri sitä yhdistelmää, joka antaa väärän tuloksen (P1). Toiseksi **valinta-ominaisuudet palauttavat kaavalle sisäisen nimen**, ja F29 toi niitä lisää (P3). Muut löydökset ovat pieniä: kaavan tekstiyhdistäminen, Toiminnon arvo-kentän puuttuva ƒ-nappi, Liikkeen nuolikohdat kaavassa, Monista ja GitHub sekä ⌘Z lukittuna.

## Löydökset

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| P1 | iso | A9, A10, missio (sama sana, sama merkitys) | **Päivän raja ja `tänään` eivät sovi yhteen, ja paneelin ohje neuvoo väärin.** Raja klo 4, kello 2.00, kirjaukset eilen klo 23 ja tänään klo 1: `loki.tänään` = 2 (historian päivä), mutta Rivijoukon ehto `kirjaus.aika.päivä = tänään` hyväksyy 0 riviä, koska `tänään` on kalenteripäivä. Taulukon paneeli (*Historian haut*) ehdottaa juuri tätä ehtoa. Kokeiltu moottorilla. `nyt.päivä` olisi luonteva korjaus, mutta se on nyt virhe (”nyt.päivä ei ole käytössä”). Rakentajan ehdotus `loki.päivä` törmää sarakkeeseen, jonka nimi on *Päivä* (`loki.päivä` tarkoittaa nyt saraketta ja antaa virheen ”valitse rivi”), ja historiataulukossa on hyvin todennäköisesti sellainen sarake. | `nyt.päivä` = nykyhetken päivä päivän rajan mukaan, samalla säännöllä kuin `kirjaus.aika.päivä` (`.päivä` ajankohdan perässä = päivä rajan mukaan). Ei uutta sanaa, eikä `tänään` muutu. Paneelin ohje ja manuaali muotoon `kirjaus.aika.päivä = nyt.päivä`. **Jonoon 1l.** |
| P2 | keski | A8, A10 | **Kokeilun raita ei kerro puhelimella, että rakenteen muutokset jäävät.** Teksti ”Rakenteen muutokset jäävät voimaan” piilotetaan alle 760 px leveydellä. Kokeilussa näkymä on lukittu, mutta lukituksen voi avata ja muokata rakennetta, ja ⌘Z (tietokoneella) kumoaa rakennetta myös lukittuna (manuaalin havainto, koodista `keydown`). | Kapeallakin raidalla lyhyt ”Rakenne muuttuu oikeasti” tai ⓘ, joka kertoo sen. ⌘Z ei toimi lukitussa näkymässä. **Jonoon 1m.** |
| P3 | keski | A2, missio (sama merkki, sama asia) | **Valinta-ominaisuus palauttaa kaavalle sisäisen nimen.** `otsikko.animointi.ilmestyy` on `"haivytys"` eikä `"häivytys"`, joten `… = "häivytys"` ei päde, mutta `… = "haivytys"` pätee. Sama koskee esim. Muodon `muoto` (`ympyra`), tasausta, kokoa ja Monitorin esitystä (9 valinta-ominaisuutta). Ohjaus nuolella hyväksyy näkyvän nimen, joten luku ja ohjaus puhuvat eri kieltä. F29 lisäsi kolme tällaista. Manuaalin havainto Kaavat 3. | Kaava lukee valinta-ominaisuuden näkyvällä nimellä (sama, jonka paneeli ja ohjaus tuntevat). Ohjaus hyväksyy molemmat kuten nyt. Rakentaja tarkistaa koeapit ja `master-tiedot`-projektit vanhan sisäisen nimen vertailusta. **Jonoon 1l.** |
| P4 | keski | A10 | **Päivämäärä + teksti hukkaa tekstin.** `"Tänään on " + tänään` antaa pelkän päivämäärän, mutta `"a" + 1` antaa `a1`. Kaavan ohje lupaa tekstin yhdistämisen `+`:lla. Manuaalin havainto Kaavat 1, kokeiltu. | Päivämäärä + teksti (kumpi tahansa järjestys) yhdistää tekstiksi päivämäärän näkyvässä muodossa. Päivämäärä + luku siirtää päivää kuten nyt. **Jonoon 1l.** |
| P5 | keski | A8 | **Toiminnon arvo ei voi tulla kaavasta yhtä helposti kuin ehto.** Ehdossa, Odota-palikassa ja näkymäpalikan tekstissä on pikaluonti *ƒ … kaavasta* (Kaava + nuoli), mutta Toiminnossa ei, vaikka sillä on arvon sisäänmeno (`v`). Lisää rivi- ja Kirjaa-kentät taas ovat kaavoja. F08:n jälkeen sama *Kirjaa* ottaa aikajanalle tekstipohjan ja taulukkoon kaavat. Manuaalin havainto Toiminnot 1. | Toiminnon paneeliin *ƒ Arvo kaavasta* (sama `addKaavaTo` kuin muualla, nuoli kohtaan *arvo*). Arvo-kenttää ei muuteta kaavaksi: se olisi kolmas kieli samaan kenttään ja tallennusmuodon muutos. **Jonoon 1m.** |
| P6 | keski | A2 | **Liikkeen nuolikohtia *edistyminen*, *kohde x*, *kohde y* ja *ei pääse* ei voi lukea kaavassa** (”tuntematon ominaisuus”), vaikka muut ulostulot (x, y, nopeus …) toimivat. Kokeiltu. Manuaalin havainto Maailma 1. | Lisätään rekisteriin (`omat`) luettavina. **Jonoon 1l.** |
| P7 | keski | A13 (tallennus kestää) | **Monista ja tuonti tiedostosta säilyttävät GitHub-kirjanpidon** (`_gh.sha`). Kopio saa uuden tunnisteen ja uuden polun, mutta ensimmäinen tallennus lähettää vanhan version tunnisteen (koodi `put(g.sha)`), ja GitHub hylkää sen. Emil näkisi silloin virheellisen ristiriidan ”GitHubissa uudempi”. Päätelty koodista, ei ajettu oikeaa GitHubia vasten. Manuaalin havainto Tallennus 1. | Monista ja tuonti nollaavat `_gh`:n (kuten *Tuo Kytköskartasta* jo tekee). Ei tallennusmuodon muutosta. **Jonoon 1m.** |
| P8 | pieni | A8 | **Vertailu-palikassa ei ole `sisältää`-valintaa** (kartoitus 3, N5; yhä ennallaan). | Valinta *sisältää* Vertailuun, sama `cmp` kuin kaavassa. Vertailun `op`-kenttään tulee uusi arvo; vanha appi ei tunne sitä, mutta tallennusmuoto ei muutu. **Jonoon 1l.** |
| P9 | pieni | A10, A11 | **Luo Arvo tekee Arvon, jota Toiminto ei voi muuttaa.** Aseta- ja Lisää-toiminnot hyväksyvät Muistin mutta eivät Arvoa (`settable`). Se on tarkoituksellista (Arvo on rakentajan asettama luku, Muisti muuttuu käytössä), mutta sitä ei kerrota missään, ja Luo Arvon jälkeen tavallinen seuraava askel on juuri ”lisää pisteisiin 1”. | Arvon paneeliin rivi ”Toiminnot eivät muuta Arvoa. Jos arvo muuttuu käytössä, käytä Muistia.” Ei uutta *Luo Muisti* -nappia ennen kuin tarve tulee vastaan. **Jonoon 1m** (pelkkä teksti). |
| P10 | pieni | missio (sama sana) | **`loki.tänään` on luku, `tänään` päivämäärä.** Sama sana kahdessa merkityksessä. Ennakkotapaus on olemassa (Aikajanan `tänään` = merkintöjä tänään), ja muoto *taulu.tänään* lukeutuu luontevasti ”kirjauksia tänään”. | Ei muutosta. Manuaalin kaavaluku sanoo eron yhdellä rivillä, kun 1l päivittää sen. |
| P11 | pieni | A8 | **Kirjaa ja Lisää rivi ovat taulukolle lähes sama toiminto.** Automaattisen Aika-sarakkeen taulukossa molemmat täyttävät ajan. Ero näkyy vain, jos taulukossa on tavallinen ajankohta-sarake (Kirjaa täyttää sen, Lisää rivi ei). | Ei muutosta: kaksi yleistä reittiä on sallittu (A8), ja nimi *Kirjaa* kertoo tarkoituksen. Paneelin ohje kertoo eron jo. |
| P12 | pieni | M3-perhe (sama sana) | **Kolme anim-sanaa:** ketjun efekti *Animaatio*, näkymäpalikan osio *Animointi* (F29) ja Kuvan *kuvasarja-animaatio*. Lisäksi efekti *Teksti ilmestyy* ja animoinnin *Ilmestyy* ovat eri asioita. Ikonit eroavat jo (✺ ja ✦ erotettiin Appi-appi 24:ssä). | Ei jonoon. Kirjataan manuaalin hakemistoon erotteluksi. Uudelleennimeäminen vasta, jos Emil hämmentyy (Emilin päätös, ei kiire). |
| P13 | pieni | A10 | **Asetusten versioteksti** sanoo ”Appi-appi 4 (entinen Pajakone …)”, koska `KK.PAJA` on `'4'`. Manuaalin havainto Tallennus 4. | Oikea versionumero. **Jonoon 1m.** |

## Manuaalin havainnot (luku 11)

Havaintoja on 54. Ne jakautuvat näin:

- **Nostettu löydöksiksi ja jonoon (8):** Kaavat 1 (P4) ja 3 (P3), Toiminnot 1 (P5), Maailma 1 (P6), Tallennus 1 (P7) ja 4 (P13), Työympäristö 1 (⌘Z, P2), Logiikka 4 (Arvo vs. Muisti, P9).
- **Kannattaa korjata, kun kyseistä paikkaa muokataan seuraavan kerran, ei omaa jonokohtaa (noin 12):** Rivijoukon rekisteristä puuttuu `vika.<sarake>` (Tieto 2); logiikan oppaan nuoliohje ei koske ketjun tapahtumia (Työympäristö 7); Arpa 2–6 paneelissa ja 2–9 moottorissa; Toista näkyy valikossa nimellä ”Toista N kertaa”; Liikkeen paletin vihje on vanhentunut (Maailma 4); ketjun palikka ketjun ulkopuolella ei varoita (vain Ajastin varoittaa: Miksi? voisi kertoa saman); tyhjä ohjaus ohittaa toiminnon asettaman arvon (Kaavat 5, etusija A3, harvinainen); *Tallenna nyt* tallentaa yhden muunkin projektin; vanhentuneet koodikommentit (efektit, `pajakone/`); Toistimen kahden osionimen sidonta (*Kortissa* / *Rivin sarake*); Tatin teksti ei näy; JOS/KUN ei laukea, jos ehto on tosi jo alussa (dokumentoitava paneeliin).
- **Tarkoituksellisia tai jo Emilin päätöksiä, ei toimenpidettä (noin 14):** taulukon tapahtumat (päätös 16.10.), ikkunoiden tyhjien ohitus, Kumoa ei palauta käyttötietoja, Kopioi/liitä vain logiikassa, Tatin y, Kamera vain zoomaus ja muut `TILA.md`:n avoimiin kysymyksiin jo kirjatut kohdat.
- **Puhelimen puutteet (4):** monivalinta vain ⇧:llä, logiikassa puhelimella ei monivalintaa (siis ei monen logiikkapalikan presettiä sormella), näkymän muokkauksessa ei nipistystä, pikakatselu vain tietokoneella. Appi-appi rakennetaan ensisijaisesti tietokoneella (`AGENTS.md`), joten nämä eivät ole jonossa. Jos Emil alkaa rakentaa puhelimella, ne nousevat ensimmäisiksi.
- **Teksti `"ei"` on ehtona tosi (Kaavat 2):** ei muuteta. Tekstin muuttaminen totuusarvoksi sen sisällön mukaan olisi taikaa, ja avainsana `ei` toimii oikein. Manuaalissa on jo varoitus.
- **Loput (noin 14)** ovat kuvauksia, joita ei ajettu selaimessa, tai pieniä kauneusvirheitä. Ne jäävät manuaalin listaan.

Havaintolistaa ei muutettu tässä kartoituksessa. 1l:n ja 1m:n rakentaja poistaa korjaamansa kohdat luvusta 11 (manuaalin oma sääntö).

## Kartoitus 3:n huomiot nyt

| # | Tila |
|---|---|
| N1, N2, N4 | Korjattu (Appi-appi 34). Ryhmän `vt` on tyhjä, ja samanniminen Arvo saa viitteen `uni` (kokeiltu). |
| N3 Muisti ja taulukko eivät näytä viimeistä kirjoittajaa | Auki. Vaatii ajonaikaisen kirjanpidon, joten se on suunniteltava erikseen. F08 ei muuttanut tätä: historiataulukko kertoo, *mitä* kirjattiin, ei *mikä toiminto*. Ei jonoon. |
| N5 Vertailu ilman `sisältää` | Auki, nyt **jonossa 1l** (P8). |
| N6 Miksi? ei kerro ja/tai-osista | Auki, ei jonoon. |
| N7 ehdotusrivi vain Kaava-palikassa | **Korjattu** (Appi-appi 37): tekstipohjat, toiminnon arvo, Hakutaulukon ja Monta haaraa -palikan rivit sekä Lisää rivi- ja Kirjaa-kentät. |
| N8 Rivi-palikalta puuttuu eka ja vika | Auki, ei jonoon. |
| K2 kokeilu ja `taulu.vika` | **Kunnossa** (testi `selain_74`, kohta 3b). |
| K3, K4 testinumerot | Kaistasääntö toimi: 74–77 ja 66–69 eivät törmänneet. README:n järjestys on yhä sekaisin (pieni). |

## F08:n avoin kysymys: päivän raja ja `tänään`

Ks. P1. Suositus on `nyt.päivä`, ei `loki.päivä` eikä `tänään`-sanan muutos:

- `tänään`-sanan muuttaminen rajan mukaiseksi vaihtaisi Päivämäärä-palikan *Tänään*-napin, kalenterin korostuksen ja jokaisen vanhan kaavan merkityksen. Se olisi rajattavan asian iso sivuvaikutus.
- `loki.päivä` (tai `taulu.päivä`) törmää sarakkeeseen *Päivä*, joka on historiataulukossa todennäköinen.
- `nyt.päivä` käyttää jo opittua sääntöä (`.päivä` ajankohdan perässä = päivä rajan mukaan) olemassa olevaan ajankohtaan (`nyt`). Opittavaa ei tule lisää, ja `kirjaus.aika.päivä = nyt.päivä` lukeutuu suoraan.

`TILA.md`:n avoin kysymys päivitetään tämän mukaiseksi, ja korjaus on jonon kohdassa 1l.

## Kaksi kaistaa

| # | Vakavuus | Löydös | Ehdotus |
|---|---|---|---|
| K5 | – | **Kaistat eivät törmänneet.** Kaista B vei kolme kohtaa, joista kaksi laajensi tallennusmuotoa (35, 36) peräkkäin samalla kaistalla. Kaista A vei kaksi kohtaa ilman muodon muutosta. Versionumerot 33–37 ja testinumerot ovat yksilöllisiä, eivätkä jonorivit kadonneet. | Ei muutosta. |
| K6 | pieni | **1l ja 1m sopivat rinnakkain:** 1l on moottorissa (kaava, rekisteri, vertailu), 1m käyttöliittymässä (paneelit, raita, näppäimet, Monista). Kumpikaan ei muuta tallennusmuotoa. Yhteinen kosketuskohta on vain manuaalin luku 11 ja `TILA.md`. | Kumpi tahansa kaista voi ottaa kumman tahansa. Jälkimmäinen työntäjä yhdistää luvun 11 poistot huolella. |

## Erikoispalikoiden rekisteri

Ei uusia rivejä: Kokeile, animointi, historia ja Luo Arvo eivät tuoneet erikoispalikkaa. Animointi puuttuu Sijainnilta ja Alueelta, mikä vastaa niiden olemassa olevaa riviä (ei näkymäpalikan yhteisiä kohtia). Toistimella on animointi, mutta yhä ilman *harmaana kun* -kohtaa (rivi ”osin korjattava”, ennallaan). Rekisteri vastaa koodia (`logiikka_58` läpi).

## Lisätty jonoon

- **1l. Kaavan sanat ja ominaisuudet yhtenäisiksi** (P1, P3, P4, P6, P8; moottori): `nyt.päivä` päivän rajan mukaan ja ohjeet muotoon `kirjaus.aika.päivä = nyt.päivä`; valinta-ominaisuus kaavassa näkyvällä nimellä; päivämäärä + teksti yhdistää tekstiksi; Liikkeen *edistyminen*, *kohde x*, *kohde y* ja *ei pääse* luettaviksi; Vertailuun *sisältää*. Ei tallennusmuodon muutosta, ei uusia käsitteitä.
- **1m. Työympäristön pienet korjaukset** (P2, P5, P7, P9, P13; käyttöliittymä): Toiminnon paneeliin *ƒ Arvo kaavasta*; Monista ja tuonti nollaavat GitHub-kirjanpidon; ⌘Z ei toimi lukittuna; kokeilun raita kertoo puhelimellakin, että rakenne muuttuu oikeasti; Arvon paneeliin ”käytä Muistia”; versioteksti oikein. Ei tallennusmuodon muutosta.

Kumpikin sopii kummalle kaistalle tahansa, ja ne voivat kulkea rinnakkain (K6). Ne tulevat jonossa ennen kohtaa 6 (Tulkki).

## Koko testisarja

`sh appiappi/testit/aja.sh` ajettiin kokonaan commitilla `1c2c926` (molempien kaistojen yhdistetty koodi): logiikka 69/69 ja selain 77/77 läpi, ei sivuvirheitä (KAIKKI OK). Vain tietokoneen Chromiumissa, ei oikealla iPhonella.

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri alkaa 1l:stä), ennen uuden toimintoryhmän suunnittelua (esim. F25 tai vienti omaksi appiksi) tai pyynnöstä. Ensi kerralla: puhelin- ja iPad-näkymän paneelit sormella, Yhteydet-osio ja paneelitekstien nimien kokonaislista (lupaus jäi kolmannen kerran), Tulkin (6) ja Janan (7) uudet käsitteet.
