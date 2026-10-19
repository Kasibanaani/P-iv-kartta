# F45 Yleispalikka ja yleisikkuna: kirjoitus päättää palikan

19.10.2026. **Emilin ajatus** (viesti 19.10. klo 13.23 Suomen aikaa, lisäys 13.24): arvoa sisältävät palikat (teksti, valmis arvo, viite, `#ryhmä`, kaava, kaavan tulos) yhdeksi palikaksi, joka avautuu kaavapalikan tapaan suoraan kirjoitettavaksi ja päättelee lajinsa kirjoitetusta. Valikko näyttää vain kirjoitukseen sopivat lajit; ristiriita = punainen. Ikkunatyypit yhdeksi ikkunaksi, jonka tarkoitus valitaan sen omasta valikosta. Myöhemmin sama säätimille ja triggereille. Jos yhdistämisessä on riski, uudet tulevat vanhojen rinnalle ja **paletin yläreunaan**. Emil pyysi jonon kärkeen ja työn alle heti. Tekoälyn jäsentämä suunnitelma; ⏸ = odottaa Emilin päätöstä. **Vaihe 1 (37a) toteutettu Appi-appi 90, vaihe 2 (37b) Appi-appi 91** (`MUUTOKSET.md`); poikkeama: kirjoitusosassa kenttä on ylimpänä ja laji, nimi ja viite sen alla, jotta toinen napautus osuu kenttään eikä valikkoon. [Hakemisto](../SUUNNITELMA.md), [joukot tageina](25-joukot-tageina-ja-kaava.md), [päätöspuu](28-paatospuu.md).

## 1. Kartoitus: mitä on nyt (koodista, Appi-appi 88)

Tämä kartoitus korvaa uuden ominaisuusryhmän esikartoituksen.

- **Arvopalikat logiikassa:** Arvo (`arvo`, kiinteä, kenttä `v`, tekstiin `@viite`), Muisti (`muisti`, muuttuu toiminnoilla), Kaava (`kaava`, kenttä `f`, suoraan kirjoitettava ja venyvä), Kaavan tulos ✦ (`tulos`, saa arvon kaavasta `x = …`). **Kaikilla neljällä on yksi ulostulo, sama kohta `v`**, joten laji voi vaihtua ilman että yksikään nuoli katkeaa. Lasku ja Vertailu ovat kaksikenttäisiä kaavoja (kohdat A ja B), Satunnaisluku, Käyrä ym. tekevät jotain muuta kuin pitävät arvoa.
- **Päättely on jo olemassa:** paneelin arvokentät (Appi-appi 83) päättävät kirjoituksesta, onko se kaava vai teksti: kaava, jos siinä on `@`, `#` tai se jäsentyy ilman tuntematonta nimeä (`3 * 4`, `tänään + 5`); muuten teksti. Kaava hyväksyy jo nyt alkuun `=`-merkin (ohittaa sen).
- **Joukko kaavassa:** `#x` yksinään = jäsenten määrä, `#x.summa`, `.keskiarvo`, `.suurin`, `.pienin`, `.jäseniä`, `.jäsenet`, `.arvot` (luettelo) jne.
- **Ikkuna on jo puoliksi yleisikkuna:** yksi laji `ikkuna`, otsikossa valikko *Miten sisältö yhdistyy* (JA, TAI … SUMMA, PÄÄTÖSPUU). JOS- ja KUN-ikkuna ovat sama laji (kenttä `j`), Jäsenille ja Riveille samoin; paletissa ne ovat silti 15 eri sirua. Ketju ja Jana ovat omia lajejaan.

## 2. Emilin oletukset: mikä pitää, mikä ei

- **”Kaavan tulos on se, joka viittaa toiseen kaavaan” ei pidä.** `@kaava1` toisessa palikassa on tavallinen **viite**: se lukee kaava1:n arvon ja näyttää 30. Juuri niin kuin Emil kuvasi, ja toimii jo. Kaavan tulos ✦ on päinvastainen: kaava *työntää* arvon nimetylle palikalle (`summa = a + b`). Yleispalikassa sitä ei tarvita, koska palikalla itsellään on nimi ja viite: kirjoita `= a + b` palikkaan *Summa*, ja muut lukevat `@summa`. Kaavan tulos jää vanhoille projekteille.
- **`=` vai `@`:** molemmat, eri merkityksessä. `=` alussa = *laske tämä* (kuten taulukkolaskennassa). `@nimi` = *toisen palikan arvo*. Pelkkä `@kaava1` riittää ilman `=`-merkkiä.
- **Teksti ja tulokset sekaisin:** käy jo nyt ilman lainausmerkkejä: `Pisteet: @pisteet / @maksimi` on teksti, johon tulevat arvot. Lainausmerkkejä tarvitaan vain, jos haluat laskun näköisen tekstin (`"15 + 15"`) tai yhdistät tekstiä laskuun `= "Yhteensä " + (@a + @b)`.
- **Monta palikkaa samalle `#ryhmä`lle:** kyllä. Jokainen on oma lukunsa ryhmästä (yksi summa, toinen määrä). Joukko-palikka (säännöt jäsenille) on eri asia ja niitä on edelleen yksi per ryhmä.
- **Venytys sivulle:** Kaava venyy jo molempiin suuntiin palikkana, mutta kirjoituskenttä kasvaa vain alas. Yleispalikassa kirjoituskenttä seuraa palikan kokoa ja venyy kulmasta kumpaankin suuntaan.
- **Riski ja ratkaisu:** vanhojen korvaaminen kerralla olisi iso (Arvoon ja Kaavaan viitataan koodissa ~130 kohdassa, ja 7 projektia käyttää niitä). Siksi Emilin varasuunnitelma: **uudet palikat rinnalle, paletin yläreunaan.** Koska yleispalikka on sisäisesti Arvo, Muisti tai Kaava, kaikki vanha (kaavat, uudelleennimeäminen, poisto, Yhteydet, Miksi?, vienti) toimii sille sellaisenaan.

## 3. Vaihe 1: Yleispalikka (jonon 37a)

- **Paletti:** logiikan paletin ylimpänä osio **Yleiset**: *Yleispalikka* (myöhemmin *Yleisikkuna*). Vanhat sirut pysyvät paikallaan.
- **Ulkonäkö pienenä:** kuten Kaava, hieman isompi: lajimerkki (T, •, @, ƒ, #, ▣), nimi palikassa, viite keltaisena yläpuolella, arvo oikealla. Tulos näkyy, ei kaavaa (kaava näkyy auki).
- **Auki:** napautus valitun palikan keskelle tai kaksoisnapautus avaa palikan kohdalle kirjoitusosan: **lajivalikko**, **nimi** ja **viite** (muutettavissa siinä), iso **kirjoituskenttä**, ehdotusrivi ja tulos. Enter tallentaa (Shift+Enter uusi rivi), Esc peruu, napautus muualle tallentaa ja pienentää. Kentän kulmasta venytys sivulle ja alas; koko jää palikalle.
- **Lajin päättely** (sama sääntö kuin arvokentissä, yksi sääntö koko appissa):

| Kirjoitettu | Laji | Sisäisesti |
|---|---|---|
| tyhjä | tyhjä | Arvo |
| `7`, `24.12.2026`, `kyllä` | Arvo (myös: Muisti, Teksti, Kaava) | Arvo |
| `Valmis`, `Hei @nimi` | Teksti (myös: Muisti, jos ei viitettä) | Arvo (mallipohja) |
| `@kaava1`, `@pelaaja.x` | Viite (myös: Kaava) | Kaava |
| `#ryhmä1`, `#ryhmä1.summa` | Ryhmä (myös: Kaava) | Kaava |
| `= 15 + 15`, `uni > 7`, `@a + 5` | Kaava (myös: Teksti) | Kaava |

- **Lajivalikko** näyttää vain kirjoitukseen sopivat lajit; valittu laji lukitaan (`ty`). Lukittu laji, johon kirjoitus ei sovi, tekee palikasta punaisen ja kertoo miksi (*Tämä ei näytä kaavalta: tuntematon nimi ”hei”*). Ilman lukitusta laji seuraa kirjoitusta.
- **Muisti** on laji, jonka arvo muuttuu käytössä (toiminnot Aseta ja Lisää); kirjoitus on alkuarvo. Arvo ei muutu käytössä, kuten nyt.
- **Ryhmä:** palikan alle valikko *Mitä ryhmästä*: määrä, summa, keskiarvo, suurin, pienin, luettelo (arvot), nimet. Valinta kirjoittaa kaavaan `#ryhmä1.summa`; kirjoitus ja valikko ovat sama asia.
- **Tallennusmuoto laajenee:** palikalle valinnaiset `yl:1` (yleispalikka) ja `ty` (lukittu laji). Vanha appi näkee sen tavallisena Arvona, Muistina tai Kaavana. Versio pysyy 12.

## 4. Vaihe 2: Yleisikkuna (jonon 37b)

- Paletin *Yleiset*-osioon **Yleisikkuna**. Otsikon valikossa kaksi osaa: **Tarkoitus** (Ehto, JOS, KUN, Päätöspuu, Jäsenille, Riveille) ja **Miten sisältö yhdistyy** (JA, TAI, … SUMMA). Tarkoitus antaa ikkunalle värin (KUN punainen, päätöspuu sininen jne.).
- Ei uutta lajia eikä tallennusmuotoa: kaikki nämä ovat jo Ikkunan kenttiä (`j`, `m`, `riv`, jäsenille). Työ on valikko, värit ja paletti.
- Ketju ja Jana ovat omia lajejaan; niiden siirto samaan valikkoon on vaihe 37e.

## 5. Vaihe 3: Ryhmä ikkunan sisällä (jonon 37c)

- Ryhmä-yleispalikka ikkunassa on yksi arvo kuten muutkin (summa, määrä…), joten SUMMA-ikkuna kahdesta ryhmästä laskee *ryhmien summien summan* ja MONTAKO PÄTEE *montako ryhmää täyttää ehdon* ilman uutta sääntöä. Tämä toimii heti vaiheen 1 jälkeen.
- Uutta on valinta **jokainen jäsen erikseen**: ryhmäpalikka tuo jäsenensä ikkunan sisällöksi (sama kuin nykyinen *Sisältö myös joukosta*), jolloin JA tarkoittaa ”kaikki jäsenet”, SUMMA ”kaikkien jäsenten summa” ja päätöspuussa jäsenet ovat napit. Emilin vaihtoehto ”ryhmäpalikka muuttuu ikkunassa ryhmäikkunaksi” hylätään: palikka pysyy palikkana, valinta kertoo tavan.

- **Emil 19.10. (kumoaa yllä olevan hylkäyksen osittain):** ikkunan yläreunaan voi kirjoittaa `@eläin`, jolloin ikkuna on ryhmän ikkuna ja jokainen jäsen ilmestyy sen sisään palikkana rinnakkaisena esiintymänä. Jäsenyyden muutos näkyy heti. Päätös (Emil 19.10.): esiintymän poisto ikkunasta poistaa palikan ryhmästä ja viittauksen toisesta päästä; palikka säilyy. Rakennetaan kohdan 9 (ryhmä on palikka) jälkeen.

## 6. Myöhemmin

- **37d ⏸ Vanhat yleispalikoiksi** (Emilin kokeilun jälkeen): vanhat Arvot, Muistit ja Kaavat saavat `yl:1` itsestään, Kaavan tulos muunnetaan (kaava siirtyy tulospalikkaan), paletista poistuvat erilliset sirut. Ei tehdä ennen kuin Emil sanoo, että yleispalikka toimii.
- **37e ⏸ Ketju ja Jana yleisikkunan tarkoituksiksi** (lajit vaihtuvat, kohdat eroavat: oma suunnitelma).
- **37f ⏸ Säätimet ja triggerit** samalla periaatteella (Emil: myöhemmin): yksi *Ohjain*-palikka, jonka tarkoitus (painike, kytkin, säädin…) valitaan. Oma suunnitelma.

## 9. Ryhmä on palikka, linkki kahteen suuntaan (Emilin ajatus 19.10., ehdotus, odottaa hyväksyntää)

Emilin kokeilu 90–91 jälkeen: ryhmä erillisenä #-tunnisteena (suunnitelma 25) ei näy missään palikkana, ja tekstikentän `#eläin` (= lukee ryhmää) sekoittuu jäsenyyteen.

- **Ryhmä = yleispalikka, jonka kentässä on pelkkiä viittauksia** (`@koira @kissa @kilpikonna`). Kooste-valikko (määrä, summa, arvot, jäsenet…) kuten nyt. Viittaukset + tekstiä = tekstipalikka. Yksi viittaus = viite.
- **Yksi linkki, kaksi näkymää:** `#eläin` Koiran kentässä ⇔ `@koira` Eläimen kentässä. Kirjoitus kumpaan tahansa päähän luo linkin, poisto kummasta tahansa poistaa sen. Palikka voi kuulua moneen ryhmään (myös ryhmäpalikka ryhmään).
- **Nimi itsestään:** tekstin ensimmäinen sana; kaavasta Kaava, Kaava 2…; ryhmästä sen nimi. Nimi muutettavissa. **Viite = nimi yhteen kirjoitettuna pienellä** (yksikäsitteistetty numerolla), ei omaa kenttää.
- `=` ei käy viittausmerkiksi (= alussa on kaava). `@` jää, viittaukset näytetään kentässä nimilappuina.
- Tallennusmuoto: nykyiset `jk`-ryhmät muunnetaan ryhmä-yleispalikoiksi (`repair`), vanha muoto luetaan aina. Varmuuskopio ennen.
- **Emil 19.10. jatko:** sama nimi kahdella etumerkillä: `@eläin` = palikka (sen arvo), `#eläin` = ryhmä (jäsenet). Ehdotus: jäsenyys tehdään vain ryhmän puolelta (`@koira` Eläimen kenttään); jäsenen ruutuun tulee merkintä *kuuluu: eläin*, poistettavissa. `#` kirjoituksessa tarkoittaa aina ryhmän lukemista, ei jäsenyyttä (muuten sekaannus palaa).
- **Tarkennus 19.10. (Emilin kysymys neutraalista linkistä):** ryhmä ei ole laji: mikä tahansa palikka luetaan ryhmänä kirjoittamalla `#nimi`. Linkki näkyy ja muokkautuu molemmista päistä (Koiralla `@eläin` = kuuluu, Eläimellä `@koira` = jäsen), mutta muistaa suunnan, koska sisäkkäisissä ryhmissä (Eläin kuuluu Eläviin olentoihin) suunnaton linkki laskisi isomman ryhmän jäseneksi. `@` tekstin tai kaavan sisällä on lukemista, ei linkki.
- **Etumerkki kertoo suunnan (Emil 19.10., korvaa yllä olevan "vain ryhmän puolelta"):** kentässä pelkkänä: `#eläin` = tämä kuuluu eläimeen (eläimen kenttään ilmestyy `@koira`); `@koira` = koira on tämän jäsen (koiran kenttään ilmestyy `#eläin`); `~kissa` = neutraali "liittyy", näkyy molemmissa, ei ryhmään eikä laskuihin (kysytty Emililtä, tarvitaanko). Ryhmän lukeminen tekstin tai kaavan sisällä (`Eläimiä: #eläin`, `= #eläin.summa`); pelkkä `#eläin` kentässä on jäsenyys.
- **Monta arvoa yhdessä kentässä (Emilin ajatus):** ehdotus ei. Kentän osat värikoodataan lajin mukaan (teksti, viittaus, jäsen, kaava), mutta palikalla on yksi arvo. `#eläin.summa` laskee jäsenten luvut ja ohittaa tekstit. Oma lasku = oma palikka.
- Heti (ei tallennusmuotoa): nimi ja tyyppi muokkausruudun ja paneelin yläreunaan, tyypin valinta appin omina napautettavina valintoina (ei selaimen pudotusvalikkoa).

## 7. Linjakkuus

- **A1** nimi: *Yleispalikka* on Emilin sana; laji näkyy merkkinä ja valikossa. **A2** ominaisuudet ennallaan (`arvo`). **A6** kaava on tila: laji ei muuta tätä. **A8** yksi yleinen reitti korvaa kuusi sirua: tämä on säännön suunta. **A9** viite ja nimi säilyvät lajin vaihtuessa. **A13** uudet kentät valinnaisia, vanha aukeaa. **A14** testi: päättely, lajin vaihto nuolet säilyttäen, lukitus ja punainen, ryhmän kooste, kirjoitusosa selaimessa.
- **Ei uutta erikoispalikkaa.** Kaavan tulos ✦ jää rekisteriin vanhoja varten.
- Pienempi poikkeama: lajivalikon Teksti-laji luvulle (`15` tekstinä) tallentuu kaavaksi `"15"`, koska Arvo lukee `15`:n luvuksi.

## 8. Päätökset

Tekoäly päätti (Emil voi muuttaa): kohdan 2 merkitykset `=` ja `@`; Muisti lajina; ryhmän koosteet valikosta; vanhat rinnalle (Emilin varasuunnitelma). Avoinna vain 37d:n ajankohta (kokeilun jälkeen).
