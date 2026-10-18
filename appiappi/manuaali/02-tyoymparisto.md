# Työympäristö

Tämä luku kertoo, millä työkaluilla Appi-appissa rakennetaan: yläpalkki, projektit, asetukset, välilehdet, paletti, kanvaasit, nuolet, paneeli, kopiointi, kumoaminen, poisto, suosikit, presetit, pikaluonti, laput ja näppäimet. Yksittäisten palikoiden kohdat ja asetukset ovat palikkalukujen hakuteoksessa.

Kuvaus perustuu koodiin (Appi-appi 31, commit 77461d2). Puhelimen kosketusta on testattu tietokoneen selaimessa kapealla ikkunalla (390 ja 320 px), ei oikealla iPhonella.

## Näytön osat

| Osa | Missä | Mitä siinä on |
|---|---|---|
| Yläpalkki | ylhäällä | Projekti ▾, välilehdet, laput, tila, Varmuuskopio, Palikat, Kumoa, Kokeile, Lukitse, Asetukset |
| Paletti | vasemmalla (puhelimella laatikko) | palikat, joita lisätään kanvaasille |
| Kanvaasi | keskellä | Näkymä (käyttöpinta) tai Logiikka tai molemmat rinnakkain |
| Paneeli (tarkastelija) | oikealla (puhelimella alhaalta nouseva laatikko) | valitun palikan, nuolen tai näkymän asetukset |
| Ikkunat (arkit) | keskelle avautuva laatikko | Projektit, Asetukset, Palikat-lista, Pikaluonti, presetit, poiston vahvistus |
| Laput | kelluvat kaiken päällä | muisti- ja viestilaput |

Ikkunan saa kiinni sen otsikon napista (*Valmis* tai *Peru*) tai napauttamalla ikkunan ulkopuolelle. Esc sulkee myös.

## Aloitusruutu

Kun yhtään projektia ei ole, näkyy aloitusruutu: kenttä *Projektin nimi* ja napit **Luo projekti**, **Avaa esimerkkiprojekti** ja **Tuo tiedostosta**. Enter nimikentässä tekee saman kuin Luo projekti. Ilman nimeä projekti saa nimen ”Ensimmäinen projekti”.

## Yläpalkki

Vasemmalta oikealle:

| Nappi | Mitä tekee |
|---|---|
| **projektin nimi ▾** | avaa ikkunan *Projektit* |
| **Näkymä / Logiikka / Rinnakkain** | välilehdet (ks. Välilehdet) |
| **Muistilappu** | uusi muistilappu itselle |
| **Viestilappu** | uusi viestilappu tekoälylle; punainen piste = lapussa on uusi vastaus |
| tilateksti | esim. ”Tallessa tässä selaimessa”, ”Varmuuskopio viemättä”, ”Varmuuskopio viety pp.kk.vvvv” tai ”Tallennus selaimeen ei onnistu” |
| GitHub-tila | näkyy, kun GitHub-tallennus on päällä, esim. ”GitHub ✓ 22.24”; pitkä selitys hiiren alla (luku [Tallennus](09-tallennus.md#tila-yläpalkissa)) |
| **Varmuuskopio** | lataa kaikki projektit tiedostoksi omalle laitteelle |
| **Palikat** | kaikki palikat taulukkona; perässä ⚠ ja luku, jos viittauksia poistettuun on |
| **Kumoa** ja **Tee uudelleen** | kumoa ja tee uudelleen |
| **Kokeile** / **Lopeta kokeilu** | kokeilu kopiolla käyttötiedoista, oikeat tiedot eivät muutu (ks. Kokeilu) |
| **Lukitse** / **Muokkaa** | vaihtaa käyttöpinnan muokkauksen ja käytön välillä |
| **Asetukset** | avaa ikkunan *Asetukset* |

Napeissa on yksiväriset viivakuvakkeet, jotka ovat napin tekstin värisiä ja seuraavat siksi teemaa (Appi-appi 80): muistilappu, puhekupla (viestilappu), alas osoittava nuoli (varmuuskopio), lista, kaarinuolet (kumoa ja tee uudelleen), koeputki (kokeile) ja neliö (lopeta kokeilu), lukko (lukitse) ja kynä (muokkaa) sekä liukusäätimet (asetukset). Samat kuvakkeet ovat lapuissa ja kerrosriveillä (ks. Kerrokset). Palikoiden omat kuvakkeet ovat ennallaan.

Kumoa ja Tee uudelleen piiloutuvat, kun Näkymä-välilehti on lukittu. Lukitse-nappi näkyy vain, kun käyttöpinta on näkyvissä (Näkymä tai Rinnakkain).

**Tietokoneella yläpalkin napit eivät koskaan rivity.** Kun ikkuna on enintään 1800 px leveä, lapunapeissa on pelkkä kuvake. Enintään 1360 px leveällä ikkunalla myös napeista Varmuuskopio, Palikat, Kumoa, Kokeile, Lukitse ja Asetukset jää pelkkä kuvake; nimi näkyy, kun hiiri on napin päällä. Projektin nimi lyhenee kolmeen pisteeseen ensimmäisenä (vähintään noin 90 px näkyy). Enintään 1020 px leveällä ikkunalla tilateksti piiloutuu, ja jos tila silti loppuu, palkki rullaa sivuttain kuten puhelimella.

**Puhelimella (ruutu enintään 760 px leveä)** yläpalkki rullaa sivuttain, ja siitä puuttuvat Rinnakkain-välilehti, Varmuuskopio, Palikat ja tilateksti. Lapunapeissa näkyy pelkkä kuvake. Varmuuskopion saa silti Projektit-ikkunan napista *Vie kaikki projektit*.

## Projektit

Avaa **projektin nimi ▾** yläpalkin vasemmasta reunasta. Ikkunassa *Projektit*:

- **Projektilista**: jokaisella rivillä nimi sekä näkymäpalikoiden ja näkymien määrä. Napauta riviä: projekti avautuu. Kumoa-historia tyhjenee projektia vaihdettaessa.
- **Uusi projekti**: kirjoita kenttään *Uuden projektin nimi* ja paina **Luo**. Ilman nimeä tulee ”Uusi projekti”. Uusi projekti aukeaa Näkymä-välilehdelle.
- **Tämä projekti: nimi**:
  - **Nimeä**: kirjoita uusi nimi kenttään ja paina Nimeä.
  - **Monista**: tekee kopion nimellä ”nimi (kopio)” ja avaa sen. Kopio tallentuu GitHubiin omaksi uudeksi tiedostokseen.
  - **Vie tiedostona**: lataa tämän projektin tiedostoksi (`nimi.appiappi.json`).
  - **Tyhjennä käyttötiedot**: kysyy varmistuksen ja tyhjentää kirjoitetut tekstit, valinnat, listojen rivit ja aikajanan merkinnät. Rakenne säilyy. Kumoa ei palauta käyttötietoja.
  - **Poista projekti**: kysyy varmistuksen ja poistaa pysyvästi. Jos GitHub-tallennus on päällä, GitHubin kopio säilyy, ja sen saa takaisin asetusten napista *Hae uudet projektit*.
- **Varmuuskopio ja tuonti**: **Vie kaikki projektit**, **Tuo tiedostosta**, **Tuo Kytköskartasta** (saman selaimen Kytköskartan projektit kopioina), **Avaa esimerkkiprojekti**, sekä tekstikenttä ja **Tuo tekstistä** (liitä viety teksti). Tuonti lukee myös laput, presetit ja suosikit, jos niitä on tiedostossa. Tarkemmin luvussa [Tallennus](09-tallennus.md).

## Asetukset

**Asetukset** yläpalkin oikeasta reunasta. Osiot:

| Osio | Valinnat |
|---|---|
| Rakennusympäristön ilme | *Vaalea ja tumma tila*: Laitteen mukaan, Vaalea, Tumma. *Väriteema*: Metsä, Järvi, Luumu, Hiekka, Ruusu, Harmaa, Laguuni, Laventeli, Oliivi, Kupari. Koskee kaikkia projekteja tässä selaimessa. |
| Projektin käyttönäkymän ilme | samat valinnat, mutta vain tälle projektille; kulkee projektin mukana. Lisäksi **Oma väri** (teema mistä tahansa väristä), **Palikoiden paletti** (tapa × lähtöväri) ja **Paikat 1–8** (oma väri paikalle, ↺ palauttaa); ks. [Paletti ja oma väri](03-nakymapalikat.md#paletti-ja-oma-väri-projektin-asetus). Kumoa peruu. |
| Projektin animointi | *Ilmestyy*, *Katoaa*, *Kesto (s)*, *Pehmeys*, *Arvo vaihtuu*, *Paikka vaihtuu*: tämän projektin näkymäpalikoiden oletus, kun palikalle ei ole valittu omaa (luku [Näkymäpalikat](03-nakymapalikat.md), Animointi-osio). Tyhjä = töks. Kulkee projektin mukana. |
| Päivämäärät | *Muoto*: pp.kk.vvvv tai pp.kk.vv; *Päivän raja (tämä projekti)*: keskiyö (oletus) tai klo 1.00–6.00. Raja koskee kirjaushistoriaa ([Tieto](07-tieto.md#kirjaushistoria)). |
| Muokkaus | *Kohdista ruudukkoon*: Kyllä / Ei (10 px:n ruudukko raahattaessa). *Viittaus tekstissä* (Appi-appi 54): `@` (oletus) / `§` / `{ }`, millä merkillä toisen palikan arvo kirjoitetaan tekstiin, ks. [Tekstiin upotetut viitteet](06-kaavat.md#tekstiin-upotetut-viitteet). *Näytä viitteet muokatessa*: Kyllä (oletus) / Ei, ks. [viitelappu](03-nakymapalikat.md#teksti-ja-upotetut-viitteet). Koskee tätä selainta, ei kulje projektin mukana. |
| Muisti- ja viestilaput | lappujen määrät, lista, *Hae vastaukset*, *Kopioi laput tekstinä* (ks. Laput) |
| GitHub-tallennus | Repo, Avain, automaattinen tallennus, *Tallenna nyt*, *Hae GitHubista*, *Hae uudet projektit*, *Testaa yhteys* (luku [Tallennus](09-tallennus.md)) |

Alimpana näkyy versio: Appi-appi-numero ja tallennusmuodon versio, esim. ”Appi-appi 39 (entinen Pajakone, tallennusmuoto 9, …)”.

## Välilehdet: Näkymä, Logiikka ja Rinnakkain

- **Näkymä**: käyttöpinnan kanvaasi. Tähän asetellaan se, mitä appin käyttäjä näkee: painikkeet, säätimet, tekstit, listat, kuvat ja koristeet.
- **Logiikka**: logiikkakanvaasi. Tässä palikat kytketään nuolilla, kirjoitetaan kaavat, tehdään ikkunat ja ketjut.
- **Rinnakkain**: molemmat kanvaasit vierekkäin (Näkymä vasemmalla, Logiikka oikealla). Jakoa muutetaan vetämällä välissä olevaa pystypalkkia. Valittu palikka korostuu molemmilla puolilla (näkymässä katkoviivakehys). Paletin yläreunassa on silloin valinta **Näkymä / Logiikka**: kumman puolen palikat paletti näyttää. Paletti vaihtuu myös itsestään sen puolen mukaan, jota viimeksi napautit.

Rinnakkain ei ole puhelimella (välilehti piilossa alle 761 px leveydellä).

## Muokkaus ja käyttö (Lukitse)

Käyttöpinnalla on kaksi tilaa:

- **Muokkaus** (oletus): palikoita lisätään, siirretään ja muutetaan. Näkyy viivaimet, koordinaatit vasemmassa alakulmassa ja palikoiden nimilaput. Ohjaimet eivät reagoi napautukseen, vaan napautus valitsee.
- **Käyttö**: paina **Lukitse**. Palikat ovat paikallaan ja niitä käytetään kuin valmista appia: painikkeet painuvat, säätimet liikkuvat, kentät ottavat tekstiä. Nappi muuttuu muotoon **Muokkaa**, josta palataan muokkaukseen.

Lukitus on projektin tila ja tallentuu. Näkymä-välilehdellä lukittuna paletti, paneeli, Kumoa ja puhelimen alapalkki piiloutuvat. Rinnakkain-tilassa lukitus koskee vain näkymän puolta: näkymää käytetään, ja logiikkaa voi samalla muokata ja seurata (paletti näyttää silloin logiikan palikat). Logiikka-välilehdellä lukitus ei näy.

Lukitessa näkymä siirtyy alkukohtaansa, jos sellainen on valittu (ks. Näkymät).

## Kokeilu (Kokeile)

Kokeilussa appia käytetään oikeasti, mutta kopiolla käyttötiedoista: oikeat tiedot eivät muutu (Appi-appi 33).

- **Aloitus:** yläpalkin **Kokeile**. Kokeilu alkaa kopiosta projektin nykyisistä käyttötiedoista (kirjoitetut tekstit, valinnat, laskurit, taulukon rivit, ketjujen ajotila). Näkymä lukittuu käyttöön, ja Logiikka-välilehdeltä siirrytään Näkymään.
- **Koko kokeilun ajan** yläpalkin alla on oranssi raita: **Kokeilu** – *Oikeat tiedot eivät muutu. Rakenteen muutokset jäävät voimaan.* ja nappi **Lopeta**. Kapealla näytöllä (puhelin) raidassa lukee lyhyesti *Vain rakenne tallentuu ⓘ*. Raidan tekstin napautus kertoo ilmoituksena, mitä kokeilu palauttaa ja mikä jää voimaan. Yläpalkin nappi on silloin **Lopeta kokeilu**.
- **Kokeilussa** painikkeet, kentät, ketjut, taulukot ja kaavat toimivat tavallisesti (myös `taulu.eka` ja `taulu.vika` lukevat kokeilun rivejä). **Muokkaa** ja **Lukitse** toimivat kokeilun sisällä.
- **Lopetus:** raidan **Lopeta** tai **Lopeta kokeilu**. Oikeat käyttötiedot palaavat, samoin lukitus ja välilehti, jotka olivat ennen kokeilua. Toisen projektin avaus lopettaa kokeilun samalla tavalla.
- **Mikä ei muutu:** selaimen muistiin, GitHubiin, varmuuskopioon, projektin vientiin ja Kopioi-toiminnon kopioon menevät aina oikeat käyttötiedot. Jos appi suljetaan kesken kokeilun, kokeilu häviää.
- **Mikä jää:** rakenteen muutokset (palikat, nimet, asetukset, nuolet) kokeilun aikana ovat oikeita muutoksia.
- **Ei ole:** kokeilun tulosten siirto oikeaan käyttöön, aloitus tyhjästä, tallennetut kokeet, testikello ja suoritus vaihe kerrallaan.

## Näkymät (sivut) ja siirtyminen

Projektissa voi olla monta näkymää, kuin sivuja. Näkymien välilehdet ovat käyttöpinnan kanvaasin yläreunassa.

- **Uusi näkymä**: muokkaustilassa napauta välilehtirivin lopun **＋**. Uusi näkymä saa nimen ”Näkymä 2”, ”Näkymä 3” ja niin edelleen ja aukeaa heti.
- **Vaihda näkymää**: napauta välilehteä.
- **Nimeä näkymä**: muokkaustilassa kaksoisnapauta (tietokoneella kaksoisnapsauta) välilehteä, kirjoita nimi, Enter tallentaa, Esc peruu. Puhelimella kaksoisnapautusta ei ole testattu oikealla laitteella (ei tarkistettu).
- **Palikan siirto toiseen näkymään**: valitse palikka, paneelin osiosta *Paikka ja koko* kenttä **Näkymä** (näkyy, kun näkymiä on vähintään kaksi).
- Näkymää **ei voi poistaa eikä järjestää uudelleen**: siihen ei ole nappia.

Käytössä (lukittuna) välilehdet näkyvät, kun näkymiä on vähintään kaksi, joten appin käyttäjä voi vaihtaa näkymää niistä. Yhdellä näkymällä välilehtiriviä ei näy.

**Siirtyminen logiikasta**: toiminto **Siirry** vie käyttönäkymän toiseen näkymään, sijaintiin, alueeseen tai palikan kohdalle, ja **Palaa takaisin** palaa sinne, mistä viimeksi siirryttiin. Siirry-toiminnon paneelissa: *Kohde (sijainti, alue tai palikka)*, jos kohdetta ei valita (”— ei, käytä näkymää ja kohtaa —”) niin *Näkymä* ja kohta *X*, *Y*, sekä *Siirtymä*: Vierien tai Heti. Takaisin-historia on vain tämän käyttökerran ajan, ja välilehden vaihto käsin tyhjentää sen. Toiminnon voi tehdä painikkeen paneelista pikatoimintona (ks. Reseptit).

**Näkymän asetukset**: kun mitään ei ole valittuna, Näkymä-puolen paneeli näyttää näkymän asetukset: *Näkymän laite*, vapaassa näkymässä *Näkymän sijainti ja rullaus* (Alkukohta, Rullaus käytössä: Vapaa / Alueen sisällä / Ei rullausta, Aloitusalue), laitenäkymässä *Maailma ja kamera*, sekä *Kerrokset*. Napauta tyhjää kohtaa kanvaasilla, niin valinta poistuu ja asetukset tulevat näkyviin.

**Sijainti ja alue muokatessa**: kanvaasin oikean alakulman napit **⌖ Sijainti** (lisää sijaintimerkin nykyisen ruudun keskelle) ja **⛶ Alue** (lisää alueen ruudun kokoisena) näkyvät vain muokkaustilassa. Valitun sijainnin ympärillä katkoviivakehys näyttää, mitä käytössä näkyy siirryttäessä.

## Laitemuoto (Vapaa, puhelin, iPad)

Näkymän paneelin osiossa *Näkymän laite (nimi)* valinta **Laite**:

| Valinta | Koko (pikseliä) |
|---|---|
| Vapaa | rajaton kanvaasi |
| Puhelin | 390 × 844 |
| Puhelin vaaka | 844 × 390 |
| iPad pysty | 820 × 1180 |
| iPad vaaka | 1180 × 820 |

Laitenäkymässä laitteen ruutu näkyy muokatessa kehyksenä kanvaasin vasemmassa yläkulmassa (kohta 0, 0), ja kehyksen ulkopuolelle jäävät palikat eivät näy käytössä. **Näytä koko ruutu** sovittaa kehyksen näkyviin. Lukittuna näkymä on laitteen muotoinen: tietokoneella kehyksenä keskellä, kapealla ruudulla (oikea puhelin) koko ruudun kokoisena. Laitenäkymässä paneeliin tulevat lisäksi napit *Laitteen ruudussa* (Ruudun keskelle, Täysi leveys, reunoihin) ja *Rullausvauhti*. Rullaus, kamera ja zoomaus ovat osiossa *Maailma ja kamera* (palikkaluvut Kamera ja Kerros).

## Puhelimella: alapalkki ja laatikot

Alle 761 px leveällä ruudulla paletti ja paneeli ovat piilossa, ja kanvaasin alareunassa on alapalkki:

- **＋ Palikat** avaa paletin vasemmalta liukuvana laatikkona.
- Toinen nappi avaa paneelin alhaalta nousevana laatikkona. Sen teksti on **Ohjeet**, kun mitään ei ole valittu, **Asetukset: palikan nimi**, kun palikka on valittu, ja **Asetukset: N valittu** monivalinnassa.
- Paneelin yläreunan **Valmis ⌄** sulkee laatikon. Kanvaasin napautus sulkee molemmat laatikot.

Alapalkki piiloutuu, kun laatikko on auki tai Näkymä on lukittu. Pikakatselu-laatikkoa ei ole puhelimella.

## Paletti

Paletti näyttää vain sen puolen palikat, joka on auki: Näkymä-välilehdellä näkymäpalikat, Logiikka-välilehdellä logiikkapalikat (Rinnakkain-tilassa valinta paletin yläreunassa).

**Näkymän paletti**, ryhmät:

| Ryhmä | Sisältö |
|---|---|
| Suosikit, Presetit | omat valinnat, jos niitä on (ks. Suosikit ja presetit) |
| Ohjaimet | Painike, Valintaruutu, Kytkin, Säädin, Tatti, Tekstikenttä, Lukukenttä, Päivämäärä |
| Näyttö | Laatikko (sama kuin Koristeiden Laatikko, peruspalikka tekstille), Teksti, Monitori, Kuva, Ilmoitus, Lista, Aikajana, Kaavio, Kalenteri, Toistin (Toistin näkyy vasta, kun projektissa on Tietotaulukko) |
| Koristeet | Laatikko, Ympyrä, Lappu, Kehys, Sijainti, Alue, Reitti ja työkalu **Viiva** |
| Pikaluonti | Vaihtoehtoryhmä…, Kyllä/ei-kysymys…, **Rakennuslaatikko** (avaa tai sulkee kelluvan laatikon, ks. [Rakennuslaatikko](#rakennuslaatikko)) |

**Logiikan paletti**, ryhmät:

| Ryhmä | Sisältö |
|---|---|
| Palikat | hakukenttä *Etsi nimellä…* ja lista projektin näkymäpalikoista ja nimetyistä logiikkapalikoista (ks. alla) |
| Kaava | Kaava, Kaavan tulos |
| Arvot | Arvo, Muisti, Satunnaisluku, Käyrä, Tänään, Päivämäärän osa |
| Tieto | Tietotaulukko, Tapahtuman tiedot, Rivi, Rivijoukko, Joukko (⁂, [Joukko-palikka](07-tieto.md#joukko-palikka-pjoukko-appi-appi-62)) ja työkalu **Tulkki…** (teksti, Excelin solut tai CSV taulukon riveiksi tai palikoiksi; ks. [Tulkki](07-tieto.md#tulkki-teksti-riveiksi-tai-palikoiksi)) |
| Laskut | laskumerkit |
| Vertailut | vertailumerkit |
| Ikkunat | JA, TAI ja muut ikkunat, JOS-ikkuna, KUN-ikkuna; alaryhmä *Järjestys*: Ryhmä |
| Ketju | Ketju; alaryhmät *Odotus* (Ajastin, Odota, kunnes), *Haarat* (Ehto, Monta haaraa, Arpa, Toista), *Tekemiset* (Aseta arvo, Aseta tila, Käynnistä ketju, Pysäytä ketju, Ketjun tulos, Lopeta ketju) ja projektin ketjujen lista |
| Ehdot | JOS, VALITSE, KUN, Hakutaulukko |
| Liike ja aika | Muutos ajassa, Liike, Sekuntikello, Peliohjain |
| Näkymä ja efektit | Kerros, Kamera, Teksti ilmestyy, Kuva vaihtuu, Animaatio, Näkymänvaihto |
| Toiminnot | kaikki toiminnot: Aseta arvo, Aseta tila, Lisää, Valitse, Poista valinta, Vaihda, Tyhjennä, Siirry, Palaa takaisin, Kirjaa, Lisää riviksi listaan, Näytä ilmoitus, Käynnistä ketju, Pysäytä ketju, Arvo uudelleen, Palauta perusarvo, Lisää rivi, Poista rivi, Valitse rivi, Siirrä rivi |

**Haku**: logiikan paletin kenttä *Etsi nimellä…* suodattaa vain Palikat-listaa (projektin omat palikat nimen tai viitteen mukaan). Palikkalajeja ei voi hakea; ne etsitään ryhmistä.

**Palikat-lista (logiikka)**: näkymän palikat (paitsi sijainnit) ja nimetyt logiikkapalikat sekä muistit, arvot, tulokset, satunnaisluvut ja käyrät. Rivillä näkyy kuvake ja nimi yhdellä rivillä; pitkä nimi katkeaa kolmeen pisteeseen. Viite, näkymän nimi tai ”logiikka” ja montako kertaa palikka on jo logiikkakanvaasilla (esim. ”univiime · logiikka · 2×”) näkyvät vihjeessä, kun hiiri on rivin päällä. Kanvaasilla viite näkyy palikan yläpuolella kuten ennenkin. Ylimpänä ovat valittu palikka ja kolme viimeksi tehtyä näkymän palikkaa (uusin ensin), sitten muut näkymän palikat ja logiikkapalikat aakkosissa (Appi-appi 74). **Näkymän palikka saadaan logiikkaan vain tästä listasta** (tai paneelin napista *Näytä logiikassa* tai valitun palikan ⇢-napista). Sama palikka saa olla logiikassa monessa kohdassa: jokainen veto tekee uuden **esiintymän**. Ikkunasta voi olla vain yksi esiintymä, joten ikkunan veto vain valitsee sen.

### Palikan lisääminen

- **Vetämällä** (hiiri tai sormi): tartu palikkaan paletissa ja pudota kanvaasille. Palikka tulee pudotuskohtaan. Puhelimella paletti sulkeutuu heti, kun veto alkaa, joten pudotuskohta näkyy.
- **Napauttamalla**: palikka tulee kanvaasin keskelle (pienellä satunnaisella siirrolla). Puhelimella paletti sulkeutuu.
- Uusi palikka on heti valittuna, ja sen asetukset näkyvät paneelissa.
- Näkymäpalikka tulee valittuun kerrokseen (●-merkki *Kerrokset*-osiossa). Kohdistus ruudukkoon on päällä, jos asetus on Kyllä.
- Väärälle puolelle pudotus ei onnistu: ilmoitus ”Tämä palikka kuuluu logiikan puolelle” tai ”…näkymän puolelle”.

Logiikassa lisäksi:

- **Ikkunan päälle** pudotettu palikka menee ikkunan sisään (ikkuna korostuu katkoviivalla vedon aikana).
- **Toisen palikan päälle** pudotettu palikka kysyy valikossa *Vie tulos: nimi*, mihin kohtaan sen arvo viedään, tai *Ei mitään, vain siirto*. Valinta tekee nuolen.
- **Ketjuun**: ketjun tapahtuma pudotetaan ketjuikkunaan. Kun ketju tai sen tapahtuma on valittuna, tapahtuman napautus paletissa lisää sen suoraan ketjuun.

### ✦-merkki ja vihjeet

- Erikoispalikan perässä on paletissa pieni **✦**. Vihjeteksti (vie hiiri palikan päälle) kertoo palikan tarkoituksen ja ✦-palikalla poikkeuksen: ”✦ Erikoispalikka: …”. Sama teksti on palikan paneelin otsikon alla laatikossa ”✦ Erikoispalikka.”.
- Paletin palikoiden vihjeet näkyvät tietokoneella hiiren alla (selaimen vihjeruutu). Puhelimella vihjettä ei näe ennen lisäämistä; logiikkapalikan vihje näkyy paneelissa otsikon alla.

### Pikakatselu

Tietokoneella kanvaasin kulmassa on pieni kiinteä laatikko. Kun hiiri on palikan päällä, siinä näkyy nimi, viite, laji (✦ erikoispalikalla) ja palikan *Lisätieto*, tai sen puuttuessa logiikkapalikan vihje. Tyhjänä: ”Vie hiiri palikan päälle: …”. Puhelimella pikakatselua ei ole.

## Kanvaasin perusliikkeet

### Valinta

- **Napauta palikkaa**: se valitaan, ja paneeli näyttää sen asetukset.
- **Napauta tyhjää**: valinta poistuu (ja kanvaasi lähtee rullaamaan, jos vedät).
- **Esc**: poistaa valinnan ja lopettaa työkalun (esim. Viiva).
- **Kaksoisnapsautus tai Enter** näkymän tekstilliseen palikkaan (Laatikko, Teksti, Painike, otsikolliset ohjaimet): teksti kirjoitetaan suoraan palikkaan, ks. [suora kirjoitus](03-nakymapalikat.md#teksti-ja-upotetut-viitteet).

### Monivalinta (vain näppäimistöllä)

- **⇧-napsautus** palikkaan lisää sen valintaan tai poistaa sen.
- **⇧ + veto tyhjästä kohdasta** piirtää valintalaatikon. Näkymässä valitaan laatikkoon osuvat palikat (ei piilotettujen tai lukittujen kerrosten palikoita). Logiikassa tavallinen palikka valitaan, kun se osuu laatikkoon, mutta ikkuna vain, kun se on kokonaan laatikon sisällä.
- Monivalinta on aina samalta puolelta: joko näkymän tai logiikan palikoita.
- Puhelimella ⇧-näppäintä ei ole. Näkymässä kerroksen kaikki palikat saa valittua *Kerrokset*-osion napista **⬚** (Valitse kerroksen palikat). Muuta monivalintaa sormella ei ole.

Monivalinnan paneelissa: *Tasaa* (Vasen, Keskelle, Oikea, Ylös, Keskelle, Alas), *Jaa tasaisesti* (Vaakasuunnassa, Pystysuunnassa; vähintään kolme), näkymässä lisäksi *Toisen palikan sisään* (viimeksi valittu on kehys), laitenäkymässä *Laitteen ruudussa*, *Ulkoasu* (Liitä ulkoasu kaikkiin) ja *Koko* (Sama leveys, Sama korkeus viimeksi valitun mukaan), sekä napit **⧉ Kopioi** ja **Liitä** (logiikka), **Tallenna presetiksi…** ja **Poista valitut**.

### Siirto ja koko

- **Siirto**: vedä palikkaa. Monivalinnassa minkä tahansa valitun veto siirtää kaikkia. Logiikassa ikkunan veto siirtää sen sisällön mukana.
- **Koko**: näkymässä vedä palikan oikeaa alakulmaa. Logiikassa ikkunan, ketjun ja ryhmän kulmassa on venytyskahva; Kaava-palikkaa voi venyttää valittuna oikeasta alakulmasta (kaksoisnapautus kahvaan palauttaa koon). Venytyskahvat (Appi-appi 77): näkymän palikan kulmassa neliö, logiikan ikkunoissa, palikoissa ja lapuissa kaksi vinoviivaa. Osuma-alue on noin 20 × 20 px, osoitin muuttuu vinonuoleksi, ja osoittimen alla sekä vedon ajan kahva paksunee korostusvärillä. Lyhyen palikan oikea kohta on kahvan päällä, joten nuolen veto kohdasta toimii yhä.
- **Kohdistus**: asetus *Kohdista ruudukkoon* (Asetukset → Muokkaus) kohdistaa näkymän palikat 10 px:n välein tai kerroksen ruudukkoon. **⇧ pohjassa** raahatessa ohittaa kohdistuksen. Logiikassa kohdistusta ei ole.
- **Tarkka paikka**: näkymäpalikan paneelin osio *Paikka ja koko*: X, Y, Leveys, Korkeus.
- **Nuolinäppäimet** siirtävät valittua näkymäpalikkaa (tai monivalintaa) 1 px, **⇧ + nuoli** 10 px.
- **Järjestys päällekkäin**: näkymäpalikan paneelissa **Tuo eteen** ja **Vie taakse**, kerroksen vaihto kentästä *Kerros*.

### Monistus ja asettelu (näkymä)

Näkymäpalikan paneelissa:

- **Monista**: kopio 20 px viereen. Sama ⌘D, joka monistaa myös monivalinnan kerralla.
- *Paikka ja koko* → **Monista**: N kpl, väli px, **Alle** tai **Viereen**; tai *Ruudukko* rivit × sarakkeet → **Monista ruudukoksi**. Kopiot saavat omat nimet.
- *Ulkoasu* → **Kopioi ulkoasu** ja **Liitä ulkoasu** (koko ja värit; samalle lajille myös tekstin koko, lihavointi, tasaus ja muoto).

### Zoomaus ja rullaus

Kanvaasin oikeassa alakulmassa: **−** (loitonna), **100 %** (palaa 100 %:iin; näyttää nykyisen zoomauksen), **+** (lähennä) ja **⤢** (sovita kaikki näkyviin). Zoomaus 20–300 %.

| Toimi | Tietokone | Puhelin |
|---|---|---|
| Rullaa kanvaasia | vedä tyhjästä, rulla tai ohjauslevy, välilyönti + veto, hiiren keskinappi | vedä yhdellä sormella tyhjästä kohdasta |
| Zoomaa | ⌘ tai Ctrl + rulla, ohjauslevyn nipistys, − / + | logiikassa kahden sormen nipistys; näkymän muokkauksessa vain − / + -napit |

Näkymän muokkaustilassa kahden sormen zoomausta ei ole koodissa (vain logiikkakanvaasilla ja lukitussa laitenäkymässä, jos *Zoomaus: Sormilla* on päällä). Kanvaasin vierityskohta ja zoomaus jäävät tähän selaimeen eivätkä siirry GitHubiin (luku [Tallennus](09-tallennus.md)).

### Koristeviiva (näkymä)

Näkymän palettiin **Viiva** (Koristeet-ryhmässä): napauta sitä, sitten vedä palikasta toiseen. Ylhäällä näkyy ohje ”Vedä viiva palikasta toiseen · Esc lopettaa”. Viiva vain näyttää yhteyden eikä vaikuta logiikkaan. Valitse viiva napauttamalla: paneelissa *Tyyli* (Viiva, Nuoli, Katkoviiva, Katkonuoli), *Väri* ja **Poista viiva**.

## Logiikkakanvaasi

Jokaisessa logiikkapalikassa näkyy kuvake, otsikko, arvosiru (nykyinen arvo: kyllä vihreänä, ei sinisenä, virhe ⚠) ja kulmassa **viite**. Näkymäpalikan esiintymä on himmeä, kun palikka ei juuri nyt näy käyttöpinnalla. Jos sama palikka on logiikassa useassa kohdassa, viitteen perässä on merkki **2×** (tai 3×…) jokaisessa esiintymässä (Appi-appi 59). Merkin napautus valitsee saman palikan seuraavan esiintymän ja siirtää kanvaasin siihen; toistuva napautus kiertää kaikki läpi. Kun esiintymä on valittuna, saman palikan muut esiintymät saavat katkoviivareunan. Ikkunasta on aina yksi esiintymä, joten sille ei tule merkkiä.

- **Ikkuna** (JA, TAI ym.): palikat sen sisällä ovat kuin sulkeissa. Otsikon **tyyppi ▾** -napista valikko *Miten sisältö yhdistyy* vaihtaa tyypin. MIN-, MAX- ja =-ikkunassa on lukukenttä N. **–** tiivistää ikkunan pieneksi (sisältö piiloon, nuolet ikkunan reunaan), **⤢** tai kaksoisnapautus avaa. Palikka viedään ikkunaan vetämällä se ikkunan päälle ja pois vetämällä ulos.
- **Ketju** (⛓ KETJU, punainen reuna): otsikossa kytkin päälle ja pois, **▶** käynnistää kokeeksi ja **■** pysäyttää. Ketjun tapahtumissa kohdat ovat ylä- ja alareunassa. Uusi tapahtuma kytkeytyy itsestään edelliseen, jos loppuja on tasan yksi. Tarkemmin ketjuluvussa.
- **Ryhmä**: reunaviiva ja nimi, ei laske mitään. Sisältö liikkuu ryhmän mukana.
- **Kaava**: napauta valittua Kaavaa uudelleen (tai kaksoisnapauta), niin kaavan voi kirjoittaa suoraan palikkaan. Enter tallentaa, Esc peruu.
- Kaksoisnapautus muuhun palikkaan vie kohdistuksen paneelin *Nimi*-kenttään.

## Nuolet (kytkennät)

Nuoli vie arvon tai tapahtuman palikasta toiseen. Nuolet tehdään vain Logiikka-kanvaasilla.

### Kohdat (pistokkeet)

- **Tulokohdat** ovat palikan **vasemmassa** reunassa, **lähtökohdat oikeassa** reunassa. Ketjun tapahtumassa tulot ovat yläreunassa ja lähdöt alareunassa.
- **Pyöreä pallo** = **arvo** (luku, teksti, kyllä/ei, päivämäärä). Harmaa reuna.
- **Punainen salmiakki** (vino neliö) = **tapahtuma** (esim. painettu, muuttui, NIIN, sitten).
- Kohdan nimi näkyy pienenä tekstinä, kun hiiri on palikan päällä, kun palikka on valittu tai kun nuolta vedetään. Puhelimella nimet näkyvät valitussa palikassa ja vedon aikana.
- Osa tulokohdista on valinnaisia ja piilossa, kunnes niihin tulee nuoli: esim. näkymäpalikan *näkyy kun*, *harmaana kun*, *teksti*, *vaihtoväri kun*, *siirto x* ja *siirto y*. Niihin viedään nuoli pudottamalla se palikan päälle (alla).

### Nuolen vetäminen

1. Tartu **lähtökohtaan** (oikean reunan pallo tai salmiakki). Tietokoneella osoitin muuttuu ristiksi kohdan päällä; kohta suurenee.
2. Vedä. Katkoviiva seuraa osoitinta, ja tulokohta, jonka päällä olet, korostuu.
3. Pudota joko:
   - **tulokohdan päälle**: nuoli syntyy siihen kohtaan; tai
   - **palikan päälle** (ei kohtaan): jos sopivia kohtia on yksi, nuoli syntyy siihen; jos monta, valikko *Mihin kohtaan?* listaa ne, myös piilossa olevat valinnaiset kohdat. Jos yksikään ei sovi: ”Tähän palikkaan ei voi viedä tätä nuolta.”
4. Tyhjään pudotettu veto ei tee mitään.

Tulokohdasta ei voi aloittaa uutta nuolta: siitä vetäminen irrottaa olemassa olevan nuolen (alla). Tyhjästä tulokohdasta tulee ohje ”Vedä nuoli palikan oikeasta reunasta tähän kohtaan.”

Puhelimella sama sormella: kohtien kosketusalue ulottuu palikan ulkopuolelle (vasemman reunan kohdat vasemmalle, oikean oikealle), jotta palikan napautus ja siirto toimivat edelleen. Ketjun tapahtumat ovat sormella korkeampia.

**Säännöt:**

| Mistä | Mihin | Tulos |
|---|---|---|
| arvo | arvokohta | arvo virtaa |
| arvo | tapahtumakohta | sallittu: tapahtuma lähtee, kun arvo alkaa päteä |
| tapahtuma | tapahtumakohta | tapahtuma ajaa kohteen heti |
| tapahtuma | arvokohta | ei sallittu: ”Näitä kohtia ei voi yhdistää.” |
| palikka | sama palikka (myös toinen esiintymä) | ei sallittu |

Arvokohtaan mahtuu yksi nuoli: uusi korvaa vanhan. Poikkeukset: *näkyy kun*, *harmaana kun* ja ikkunan kohta *mukaan* ottavat monta nuolta (näkyvyydessä rajoittavin voittaa). Tapahtumakohtaan voi tulla monta nuolta.

Myös palikan siirto toisen päälle tarjoaa nuolta: kun raahaat palikan, jonka arvon voi viedä, toisen palikan päälle, kohde korostuu ja pudotuksessa valikko *Vie tulos: nimi* kysyy kohdan.

### Nuolten ulkonäkö

| Viiva | Merkitys |
|---|---|
| harmaa, yhtenäinen | arvonuoli |
| vihreä, paksumpi | arvonuoli, jonka arvo pätee juuri nyt |
| punainen katkoviiva | tapahtumanuoli |
| punainen yhtenäinen | ketjun viiva (liikkuva katkoviiva, kun ketju etenee siinä) |
| harmaa katkoviiva | kaavasta sen tulokseen |
| himmeä pisteviiva | viite (kaava tai teksti lukee toista palikkaa), ei nuoli |

Kun palikka on valittu, sen nuolet korostuvat ja muut himmenevät.

### Nuolen poisto ja siirto

- **Napauta nuolta**: se valitaan, ja paneeli näyttää *Nuoli* (tai *Ketjun viiva*) ja mistä mihin se kulkee. Paina **Poista nuoli**, tai ⌫ / Delete.
- **Siirrä nuolen kärkeä**: tartu tulokohtaan, jossa nuoli päättyy, ja vedä. Nuoli irtoaa ja jatkuu lähteestään: pudota toiseen kohtaan, tai tyhjään, jolloin nuoli poistuu.
- Ketjun viivalla paneelissa myös **Vaihda kohde…** ja **Vaihda lähtö…**.
- Palikan poisto poistaa sen nuolet.

### Pistokkeet ja viitteet -asetukset

Logiikkakanvaasin vasemmassa alakulmassa (puhelimella hieman ylempänä, allekkain) on kaksi nappia:

- **Pistokkeet: näkyvät** / **Pistokkeet piilossa**: piilottaa pallot ja salmiakit kaikista palikoista. Nuolet säilyvät, näkyvät himmeinä ja toimivat. Piilotettuun palikkaan nuoli viedään pudottamalla se palikan päälle (valikko kysyy kohdan).
  Kun palikan pistokkeet ovat piilossa, sen teksti mahtuu kahdelle riville ja palikka saa olla leveämpi (enintään noin 320 px, näkyvillä pistokkeilla 240 px ja yksi rivi). Vielä pidempi teksti katkeaa kolmeen pisteeseen. Ketjun vaiheet, ikkunat ja venytetty Kaava pysyvät ennallaan.
- **Viitteet: ei / valitulle / kaikille**: napautus kiertää vaihtoehdot. Viitteet ovat himmeitä pisteviivoja kaavasta tai tekstistä palikkaan, johon se viittaa. *Valitulle* (oletus) näyttää vain valitun palikan viitteet. Pelkkä näyttö: viivaa ei voi valita.

Palikkakohtainen valinta: logiikkapalikan paneelin osio *Ulkonäkö logiikassa* → **Pistokkeet**: *Kuten muut*, *Näkyvät* tai *Piilossa*, ja nappi **Sama kaikille tämän lajin palikoille**. Palikan oma valinta voittaa yleisen. Ketjussa ja ketjuikkunassa pistokkeet näkyvät aina. Nämä valinnat tallentuvat projektiin, mutta eivät mene Kumoa-historiaan.

## Paneeli (tarkastelija)

Paneeli näyttää sen, mikä on valittuna:

- **ei mitään**: Näkymä-puolella näkymän asetukset ja ohje, Logiikka-puolella ohje
- **palikka**: palikan asetukset (alla)
- **monivalinta**: tasaus ja yhteiset napit (ks. Monivalinta)
- **nuoli**: nuolen tiedot ja Poista nuoli
- **koristeviiva**: tyyli, väri, Poista viiva

**Valikot paneelissa (Appi-appi 80):** pudotusvalikoissa on oma nuoli oikeassa reunassa ja pehmeät kulmat vaaleassa ja tummassa teemassa. Lyhyt kiinteä valinta (2–4 lyhyttä vaihtoehtoa, esim. Muutos ajassa → *Yksikkö*: sekuntia, minuuttia, tuntia; Tatti → *Peliohjain*: ei, vasen tatti, oikea tatti) on napautettavina segmentteinä kuten muutkin lyhyet valinnat. Valikoiksi jäävät pitkät ja vaihtuvat luettelot (palikat, sarakkeet, kerrokset) sekä valinnat, joilla on oma erikoiskäsittely.

### Palikan paneelin rakenne

Ylhäältä alas:

1. Mahdollinen paluunappi **‹ nimi** (kun pikatoiminto tai kaava vei toiseen palikkaan; vie takaisin).
2. Otsikko: kuvake, nimi, laji ja nykyinen arvo (”nyt: …”).
3. Erikoispalikalla laatikko **✦ Erikoispalikka.** ja syy. Logiikkapalikalla vihjeteksti.
4. **Nimi**, **Tunnus** (viite ja joukot; ei Ryhmällä), joukkojen jäsenyysrivit ja **Lisätieto** (vapaa selitys, näkyy pikakatselussa, ei vaikuta mihinkään).
5. **⚠ Viitevirheet**, jos palikka viittaa poistettuun (ks. Poisto).
6. Lajin omat osiot. Näkymäpalikoilla tavallisesti *Sisältö*, pikatoiminnot (*Kun painetaan*, *Kun valitaan*, *Kun napautetaan*), *Arvo, kun valittu*, *Näkyvyys*, *Väri*, *Animointi*, *Napautus*, *Käyttöraahaus*, *Paikka ja koko* ja *Ulkoasu*. Logiikkapalikoilla lajin asetukset ja *Ulkonäkö logiikassa*.
7. **Ominaisuudet** (avattava osio): kaikki, mihin kaava voi viitata, viitteineen. Napauta viitettä: se kopioituu. Ohjattavilla ominaisuuksilla napit ƒ (arvo kaavasta), ⇢ (kohta logiikkaan nuolta varten), × (sulje kohta) ja *asetettu ↺* (palauta). Yksityiskohdat ominaisuusluvussa.
8. **Miksi?** (kun palikalle on selitys, ks. alla) ja **Yhteydet**.
9. Napit, esim. näkymäpalikalla **Tuo eteen**, **Vie taakse**, **Monista**, **Näytä logiikassa**, **Tallenna presetiksi…**, **Poista palikka**; logiikkapalikalla **Lisää toinen esiintymä**, **⧉ Kopioi**, **Liitä**, **Tallenna presetiksi…**, **Poista** tai **Poista tämä esiintymä**. Kun näkymäpalikka on valittu logiikassa: **Lisää toinen esiintymä**, **Poista logiikasta**, **Näytä näkymässä**, **Tallenna presetiksi…**.
10. Logiikan esiintymällä valintaruutu **Käänteinen tässä kohdassa (EI): kyllä ↔ ei** (vain tämä esiintymä kääntyy, palikkaan tulee merkki EI) ja ikkunalla **Tiivistetty**.

**Näytä logiikassa** (näkymäpalikan paneelissa, tai valitun palikan kehyksen oikeassa yläkulmassa oleva pieni **⇢**-nappi, ei Reitillä, Appi-appi 74) vaihtaa Logiikka-välilehdelle (Rinnakkain-tilassa pysyy) ja tekee palikasta esiintymän logiikkaan, jos sitä ei vielä ole. **Näytä näkymässä** vie takaisin palikan kohdalle. Rinnakkain-tilassa ⇢-napista voi myös **vetää** logiikan puolelle: pudotuskohtaan tulee palikan esiintymä (toinen esiintymä, jos palikka on jo logiikassa). Logiikkaan ei tule mitään itsestään.

Muutokset paneelissa tulevat voimaan heti kirjoittaessa. Yhden kentän muokkaus on yksi Kumoa-askel.

### Nimi ja viite

- **Nimi** kertoo, mikä palikka on. Se ei näy appin käyttäjälle, ellei sitä laiteta tekstiin. Nimet ovat projektissa yksilöllisiä: jos nimi on jo käytössä, Appi-appi lisää perään numeron.
- **Viite** on lyhyt nimi kaavoihin ja teksteihin: kaavassa esim. `uni > 7`, tekstissä `@uni` (tai valitulla viittaustavalla `§uni` / `{uni}`). Viite näkyy logiikkapalikan kulmassa ja näkymäpalikan nimilapussa muokatessa.
- Viite kirjoitetaan kenttään **Tunnus** (Appi-appi 57; ennen *Viite*). Kentässä on viite ja palikan joukot: `@uni #unipisteet #terveys` (`{ }`-tavalla `uni #unipisteet`). Viite ilman merkkiä kelpaa (`uni #pisteet`).
- Viite **seuraa nimeä**, kunnes kirjoitat oman. Oma viite: kirjoita Tunnukseen. Viite tallentuu jo kirjoittaessa; joukot, kun painat Enter tai napautat muualle. Kokonaan tyhjä kenttä palauttaa viitteen nimestä ja poistaa joukot. Pelkät joukot (`#pisteet`) eivät muuta viitettä.
- **Joukot** (`#nimi`, rajattomasti): uusi nimi luo joukon. `#`:n jälkeen kentän alla ehdotetaan projektin joukkoja. Kentän alla on rivi jokaiselle joukolle: syy jäsenyyteen ja nappi **⚡ kuuluu kun**. Ks. [Palikoiden joukot](07-tieto.md#palikoiden-joukot-nimi-appi-appi-57).
- Yksi viite per palikka: kaksi sanaa ilman `#`:ä antaa virheen.
- Viitteen säännöt: pienet kirjaimet (myös å, ä, ö), numerot ja `_`, ei ala numerolla, ei varattu sana (esim. `nyt`, `ruutu`, `tänään`, `kyllä`, `ei`, `tyhjä`, `näkyy`) eikä toisen palikan viite. Virheestä tulee punainen teksti kentän alle, eikä viite muutu.
- **Nimen tai viitteen vaihto ei riko kaavoja eikä tekstejä**: ne tallentuvat sisäisesti palikan tunnisteella ja näyttävät aina nykyisen viitteen.

### Yhteydet

Osio *Yhteydet* näkyy, kun palikka käyttää jotakin tai sitä käytetään jossakin:

- **Käyttää**: palikat, joista tämä saa arvonsa.
- **Käytetään**: palikat, jotka käyttävät tätä.

Jokaisessa sirussa on palikan nimi ja tapa, esim. *nuoli*, *kaavassa*, *tekstissä*, *näkyvyys*, *harmaana*, *vaihtoväri*, *arvona*, *toiminnon kohde*, *ketjun ehto*, *antaa arvon*, *kaaviossa*, *kalenterissa*. Napauta sirua: siirryt siihen palikkaan (logiikassa sen esiintymään, näkymässä sen kohdalle).

### Miksi?

Osio *Miksi?* selittää, miksi palikan arvo on mikä on: yläteksti ja puu osista, joissa ✓ = pätee, ✗ = ei päde, ⚠ = virhe, • = arvo. Rivin napautus vie siihen palikkaan. Osio näkyy aina, kun palikalle on selitys (Appi-appi 32): käytännössä kaikilla logiikkapalikoilla, myös esim. Käyrällä, Satunnaisluvulla, Liikkeellä, Kerroksella, Kameralla, ketjun palikoilla, Toiminnolla, Rivillä ja Rivijoukolla, sekä näkymän Tatilla, Alueella ja Reitillä. Muilla näkymäpalikoilla osio näkyy vain, kun niiden näkyvyys tai harmaus tulee säännöstä. Puuttuva syöte sanotaan joka palikassa samalla lauseella, esim. ”Ehto puuttuu: vie nuoli kohtaan ”ehto”.”, ”B puuttuu: vie nuoli kohtaan ”B” tai kirjoita arvo.” (Lasku, Vertailu), ”Päivämäärä puuttuu: …” (Päivämäärän osa), ”Rivit puuttuvat: …” (Rivijoukko); Toiminto ilman kohdetta: ”Kohde puuttuu: valitse kohde paneelin kohdasta ”Kohde”.” Jos selitys olisi sama kuin otsikon alla oleva ohje (nyt vain Lopeta ketju), osio jätetään pois. Kun ikkuna on valittuna, sen sisällön kyllä/ei-palikat korostuvat logiikassa vihreänä (pätee) ja punaisena (ei päde).

### Palikat-lista

**Palikat** (yläpalkki, ei puhelimella) avaa taulukon kaikista palikoista: Nimi, Viite, Laji, Nyt, Missä, Logiikassa (esiintymiä), Käytetään (kuinka monessa kohdassa). Hakukenttä *Etsi nimellä tai lajilla…*. Napauta riviä: siirryt palikkaan. Jos viittauksia poistettuun on, ylimpänä on taulukko *⚠ Viitevirheet*.

## Kopioi ja liitä, monista

- **Logiikassa**: valitse palikka tai monta, paina **⧉ Kopioi** paneelissa (tai ⌘C / Ctrl+C), sitten **Liitä** (tai ⌘V). Kopio sisältää valitut palikat, ikkunan tai ketjun koko sisällön ja niiden väliset nuolet. Liitetyt logiikkapalikat ovat uusia (uudet nimet ja viitteet), ja viittaukset kopioitujen välillä osoittavat uusiin. Näkymäpalikasta liitetään vain uusi esiintymä samaan palikkaan. Jokainen liitos siirtyy 40 px edellisestä.
- Leikepöytä on Appi-appin oma ja säilyy vain, kun sivu on auki. Toiseen projektiin voi liittää: silloin viittaukset muihin kuin kopioituihin palikoihin poistuvat, ja toisen projektin näkymäpalikat jäävät pois.
- **Näkymässä** (Appi-appi 74): valitse palikka tai monta (⇧-napsautus), ⌘C / Ctrl+C ja ⌘V. Liitetyt palikat ovat uusia: samat asetukset, omat nimet ja viitteet. Viittaukset kopioitujen palikoiden välillä (esim. Tekstin `{Painike.tila}` tai *näkyy kun* -nuoli kopioituun) osoittavat uusiin, muut ennallaan. Logiikkaan ei tule esiintymiä. Toiseen projektiin liitettäessä viittaukset kopioimattomiin palikoihin tyhjenevät: esim. Alueen **Tunnistaa** palautuu *kuka tahansa* ja Kalenterin vieraat lähteet poistuvat, ja liitoksen ilmoitus kertoo sen (”Tunnistaa palautui: kuka tahansa”; Appi-appi 75). Samaan näkymään liitos siirtyy 20 px edellisestä; toiseen näkymään liitetään samaan kohtaan, ja kerros, jota siellä ei ole, vaihtuu Pohjaksi. ⌘D monistaa valitun palikan tai koko monivalinnan 20 px viereen.
- Rinnakkain-tilassa ⌘V liittää sinne, mistä viimeksi kopioitiin (näkymä tai logiikka).
- **Numerointi** (kopio, liitos, monistus): lopussa oleva numero kasvaa, ”Arvo 1” → ”Arvo 2” (ennen ”Arvo 1 2”), viite samoin `arvo1` → `arvo2`. Itse asetettu viite numeroituu samalla tavalla.
- ⌘D logiikassa tekee valitusta palikasta toisen esiintymän (ei ikkunalle eikä ketjun tapahtumalle). Sama: paneelin **Lisää toinen esiintymä**.

## Kumoa ja tee uudelleen

- **Kumoa** (⌘Z / Ctrl+Z) ja **Tee uudelleen** (⇧⌘Z tai ⌘Y). Ilman kumottavaa tulee ”Ei kumottavaa”.
- Lukitulla Näkymä-välilehdellä (myös kokeilussa) Kumoa ei toimi: napit ovat piilossa, eivätkä ⌘Z ja ⌘Y tee mitään.
- Kumoa koskee **rakennetta**: palikat, nuolet, asetukset, paikat, näkymät. Se ei palauta käyttötietoja (kirjoitetut tekstit, valinnat, listojen rivit), eikä Pistokkeet- ja Viitteet-valintoja.
- Historiassa on enintään 80 askelta. Uusi muutos tyhjentää Tee uudelleen -historian. Projektin vaihto tyhjentää molemmat. Kumoaminen poistaa valinnan.
- Kumoa palauttaa myös poistetun palikan viittauksineen.

## Poisto ja vaikutuslista

**Miten poistetaan**: valitse ja paina paneelin poistonappia, tai ⌫ / Delete. Monivalinnassa **Poista valitut**.

| Valittuna | Nappi | Mitä poistuu |
|---|---|---|
| näkymäpalikka (näkymässä) | Poista palikka | palikka ja sen kaikki esiintymät ja nuolet |
| logiikkapalikka, jolla yksi esiintymä | Poista | palikka |
| logiikkapalikka, jolla monta esiintymää | Poista tämä esiintymä | vain tämä esiintymä |
| näkymäpalikka logiikassa | Poista logiikasta | vain esiintymä; palikka jää näkymään |
| ikkuna tai ryhmä | Poista | ikkuna; sisällön palikat jäävät kanvaasille |
| nuoli | Poista nuoli | nuoli |

**Vaikutuslista**: jos poistettavaa palikkaa käytetään muualla (kaavassa, tekstissä, näkyvyydessä, toiminnon kohteena, nuolella…), aukeaa ikkuna **Poistetaanko?**: ”nimi käytetään N kohdassa” ja taulukko (Palikka, Missä, Käyttö; monessa poistossa myös Poistuva). Napit **Peru** ja **Poista silti**. Rivin napautus perii poiston ja vie siihen palikkaan. Jos palikkaa ei käytetä missään, se poistuu heti ilman kysymystä.

**Poiston jälkeen** viittaukset jäävät näkyviin virheinä: logiikan ja näkymän palikassa punainen ⚠-merkki, kaavassa `⚠nimi`, teksti ”⚠ Kohde poistettu”, Palikat -napissa ⚠ ja luku, ja Palikat-listassa *⚠ Viitevirheet*. **Korjaus**: siirry palikkaan (rivistä), ja sen paneelin osiossa *⚠ Viitevirheet* valitse **Valitse uusi kohde…** -listasta korvaava palikka; kaikki sen viittaukset poistettuun korjautuvat. Samanniminen uusi palikka ei peri poistettua. Kumoa palauttaa kaiken. Nuolet poistuvat palikan mukana eivätkä palaa korjauksessa.

## Suosikit ja presetit

Suosikit ja presetit ovat kaikissa projekteissa. Ne tallentuvat tähän selaimeen ja kulkevat varmuuskopiossa (Vie kaikki projektit), mutta eivät GitHubiin.

### Suosikit

1. Paletin alaosassa **☆ Valitse suosikit** (näkyy, kun tämän puolen suosikit ovat tyhjät). Muuten Suosikit-ryhmän otsikon **muokkaa**.
2. Ylhäällä lukee ”Napauta palikkaa: ☆ lisää suosikkeihin, ★ poistaa.” Napauta palikoita.
3. **Valmis**.

Suosikit-ryhmä näkyy paletin ylimpänä, omalla puolellaan (näkymän palikat Näkymä-paletissa, logiikan Logiikka-paletissa). Järjestys on lisäysjärjestys.

### Presetit

Presetti on nimetty kopio palikkajoukosta, jonka voi liittää mihin tahansa projektiin.

- **Tallenna**: valitse palikat (näkymästä, logiikasta tai molemmista), paneelissa **Tallenna presetiksi…**. Ikkunassa *Nimi*, lista mukana olevista palikoista ja *Viittaa näihin, jotka eivät ole mukana* (napilla **＋ Ota mukaan**). Valinta *Ota mukaan sisältö: taulukoiden nykyiset rivit ja muistien arvot*. Paina **Tallenna**. Palikan kaikki esiintymät ja ikkunan sisältö tulevat mukaan itsestään.
- **Liitä**: paletin ryhmässä *Presetit* napauta presettiä. Palikoista tulee tavallisia, itsenäisiä palikoita (presetin myöhempi muutos ei muuta niitä). Näkymäpalikat tulevat näkyvän alueen vasempaan yläosaan valittuun kerrokseen. Jos presetti viittasi palikoihin, jotka eivät olleet mukana, aukeaa ikkuna **Kytke nämä**: rivit vievät palikkaan, jonka Viitevirheet-osiosta valitaan kohde. Ulkopuolelle menneet nuolet eivät siirry.
- **Hylly**: ryhmän otsikon **hylly** (tai paletin alaosan **❖ Presetit**, kun presettejä ei ole). Jokaisella presetillä **Liitä**, **Nimeä**, **Korvaa valinnalla** (kun jotain on valittu), **Vie tiedostoksi** ja **Poista**. Alhaalla **Tuo presetti tiedostosta**.
- Lukittuna presettiä ei voi liittää.

## Pikaluonti

Näkymän paletin ryhmä *Pikaluonti* tekee valmiin ryhmän tavallisista palikoista: valinnat näkymään ja niitä yhdistävän ikkunan logiikkaan. Uutta palikkalajia ei synny.

**Vaihtoehtoryhmä…**: *Ryhmän nimi*, *Vaihtoehdot* (yksi per rivi; luvun voi lisätä muodossa `Paljon = 3`), *Miten valitaan* (Valitse yksi, Valitse monta, Vähintään N, Enintään N; N omaan kenttään), *Palikka* (Painike, Valintaruutu), *Asettelu* (Allekkain, Rinnakkain) ja *Nimi otsikoksi näkymään*. **Luo** (tai ⌘Enter). Valitse yksi tekee VAIN YKSI -ikkunan, jossa valinta poistaa muut; Valitse monta tekee TAI-ikkunan. Jos vaihtoehdoilla on luvut, jokaisesta tulee VALITSE-palikka ja niistä SUMMA-ikkuna.

**Kyllä/ei-kysymys…**: *Kysymys*, *Kyllä-painike*, *Ei-painike*, *Asettelu* ja *Kysymys tekstinä näkymään*. Syntyy kysymysteksti, kaksi painiketta ja VAIN YKSI -ikkuna. Saman painikkeen uusi painallus poistaa vastauksen.

Luodut palikat ovat valittuina, ja niitä muokataan kuten muita. Kumoa peruu koko luonnin.

## Rakennuslaatikko

Auki pysyvä, kelluva laatikko näkymäkanvaasin päällä (Appi-appi 61). Siitä poimitaan valmiita kohteita nopeasti kanvaasille: valitse kohde ja klikkaa näkymää, jokainen klikkaus lisää yhden (klik klik). Laatikko on rakentajan työkalu, ei palikka: kaikki, mitä siitä tulee, on tavallisia palikoita.

**Kädenliikkeet:**

- **Avaa ja sulje:** Näkymä-välilehden paletti → *Pikaluonti* → **Rakennuslaatikko** (sama sirun napautus sulkee). Laatikon otsikon **✕** piilottaa sen. Laatikko näkyy vain muokatessa Näkymä- tai Rinnakkain-välilehdellä; lukittuna ja Logiikka-välilehdellä se on piilossa ja palaa, kun palaat muokkaamaan.
- **Siirrä:** vedä otsikosta (*Rakennuslaatikko*). **Koko:** vedä oikeasta alakulmasta.
- **Hyllyt:** välilehdet **Rakenne**, **Laatat** (Appi-appi 84), **Hahmot**, **Alueet**, **Esineet**, **Näkymä** ja **Omat**.
- **Klik klik:** napauta kohdetta (se korostuu ja osoitin muuttuu ristiksi näkymän päällä). Jokainen klikkaus näkymään lisää yhden niin, että pääpalikan keskipiste tulee klikkauskohtaan. Lopeta **Esc**:llä tai napauttamalla samaa kohdetta uudestaan. Ruudukko kohdistaa kuten paletista lisätessä.
- **Raahaus:** vedä kohde laatikosta kanvaasille: lisää yhden pudotuskohtaan.
- **Kumoa** (⌘Z) peruu yhden lisäyksen kerrallaan.
- **Laatat-hylly maalaa** (Appi-appi 84): kartan kohteiden alla rivi *Maalaa: kartan nimi* ja kartan lajit sekä **Pyyhi**. Kartta on se, jota maalataan, tai valittu kartta, tai näkymän ensimmäinen. Lajin napautus aloittaa tavallisen maalauksen tällä lajilla (näkymän alalaitaan työkalurivi, ks. [Maalaus](08-maailma-ja-liike.md#maalaus)); saman lajin napautus lopettaa. Ilman karttaa hylly neuvoo lisäämään sellaisen.
- Lisätty pääpalikka jää valituksi. Logiikka menee Logiikka-kanvaasin alaosaan omaan Ryhmäänsä (nimetty pääpalikan mukaan), joten monta lisäystä ei kasaa palikoita päällekkäin.
- **muokkaa** (otsikossa): valmiin kohteen **✕** piilottaa sen tästä laatikosta, piilotetun **↺** palauttaa; **valmis** lopettaa. Palikoihin tämä ei koske.
- Laatikon paikka, koko, valittu hylly, auki/kiinni ja piilotetut kohteet muistetaan **tässä selaimessa** (ei projektissa, ei varmuuskopiossa eikä GitHubissa).

**Valmiit kohteet:**

| Hylly | Kohde | Mitä syntyy |
|---|---|---|
| Rakenne | Seinä | Laatikko 40 × 160, **Este** |
| Rakenne | Lattia | Laatikko 400 × 32, Este |
| Rakenne | Pallo | Ympyrä 40 × 40, Este, massa 1, kimmoisuus 80 %, ja Liike ilman ohjausta (lennähtää törmäyksestä) |
| Rakenne | Työnnettävä laatikko | Laatikko 60 × 60, Este, massa 3, ja Liike ilman ohjausta (liukuu työnnettäessä, kitka pysäyttää) |
| Laatat | Laattakartta | Tyhjä Laattakartta 16 × 10 ruutua (ruutu 32 px), lajit Seinä ja Koriste kuten paletista |
| Laatat | Tasoloikkakartta | Tyhjä Laattakartta 30 × 16 ruutua, lajit **Seinä** (kiinteä), **Taso** (läpi alhaalta), **Pomppu** (kiinteä, kimmoisuus 150 %) ja **Koriste** (läpi) |
| Hahmot | Pelaaja: tatti | Ympyrä *Pelaaja* 48 × 48, Tatti sen alla ja Liike (ohjaus Tatti, 200 px/s). Isossa maailmassa siirrä tatti lukittuun kerrokseen ([Kerrokset käytössä](08-maailma-ja-liike.md#kerrokset-käytössä)). |
| Hahmot | Pelaaja: napautus | Ympyrä *Pelaaja* ja Liike (ohjaus Napautus, Kiertää esteet, 200 px/s) |
| Hahmot | Pelaaja: tasoloikka | Laatikko *Pelaaja* 40 × 56, Tatti (*Peliohjain: vasen tatti*) ja Painike *Hyppää* (Pohjassa vain painettaessa, *Peliohjaimen nappi: alanappi*), Liike (ohjaus Tatti, 240 px/s, Hypyn korkeus 160, Ilmaohjaus 60 %) ja nuolet *painettu* → **hyppää**, *irrotettu* → **lopeta hyppy**. Koneella lukittuna nuolet tai A/D kävelevät ja välilyönti hyppää. Jos näkymässä ei vielä ole painovoima-Aluetta, tulee Alue *Painovoima* 1200 × 800 (2000 px/s²) hahmon ympärille. Lattia: Rakenne- tai Laatat-hylly. |
| Hahmot | Lentäjä | Ympyrä *Lentäjä* ja Tatti (peliohjaimen vasen tatti), Liike (ohjaus Tatti, 200 px/s, **Painovoima 0 %**): lentää painovoima-Alueella kaikkiin suuntiin |
| Hahmot | Vihollinen edestakaisin | Ympyrä *Vihollinen* (Este), Reitti 240 px sen keskeltä oikealle ja Liike (ohjaus Reitti, Edestakaisin, 120 px/s). Reitin pisteitä voi siirtää. |
| Alueet | Alue | Alue 200 × 160 |
| Alueet | Painovoima-alue | Alue *Painovoima* 1200 × 800, painovoima 2000 px/s² alas ([Painovoima ja maassa](08-maailma-ja-liike.md#painovoima-ja-maassa)) |
| Alueet | Vesi | Laatikko *Vesi* 320 × 160 ja sen päälle Alue *Vesi: alue*, painovoima 400 ja ilmanvastus 60 %: hahmo vajoaa hitaasti |
| Alueet | Tikkaat | Laatikko *Tikkaat* 48 × 240 ja sen päälle Alue *Tikkaat: alue*, painovoima 0: tatti ylös ja alas liikuttaa taas |
| Alueet | Maali | Alue *Maali* 120 × 120 ja Ilmoitus ”Maali!”, jonka *näkyy kun* tulee Maalin *sisällä*-kohdasta |
| Alueet | Aloituskohta | Sijainti *Aloitus* |
| Esineet | Kolikko | Ympyrä *Kolikko* 28 × 28, Alue sen ympärillä Tunnuksella `#kolikot` ja Kaava `kolikkoalue.joukot sisältää "kolikot"` → kolikon *näkyy kun*. Ensimmäinen kolikko tekee lisäksi yhteisen osan Ryhmään *Kolikot*: Joukko-palikka `#kolikot` (Jäsenten laji Alue), *jäsen astuttu* → Poista joukosta (Tapahtuman jäsen) ja Lisää Pisteet 1. Seuraavat kolikot liittyvät samaan Ryhmään. Kolikko katoaa, kun liikkuvan keskipiste tulee sen alueelle (Appi-appi 66, [Jäsenten tapahtumat](07-tieto.md#jäsenten-tapahtumat-appi-appi-63)). |
| Esineet | Liikkuva taso | Laatikko *Liikkuva taso* 160 × 20 (Este), Reitti 240 px sen keskeltä oikealle ja Liike (ohjaus Reitti, Edestakaisin, 80 px/s). Painovoimassa päällä seisova kulkee mukana ([Painovoima ja maassa](08-maailma-ja-liike.md#painovoima-ja-maassa), Appi-appi 82). |
| Esineet | Pomppulevy | Laatikko 120 × 24, Este, kimmoisuus 150 % |
| Näkymä | Pistenäyttö | Teksti ”Pisteet: @pisteet” |
| Näkymä | Elämät | Monitori *Elämänäyttö* (muoto pisteet, ♥, 0–5) ja Muisti *Elämät* (alkuarvo 3) nuolella sen arvoon. Vähennä toiminnolla Lisää, määrä −1. |
| Omat | omat presetit | kuten paletin Presetit-ryhmä ([Presetit](#presetit)): näkymäpalikoiden keskikohta tulee klikkauskohtaan. Napit **＋ Valinta presetiksi** ja **Presetit…** (hylly). |

**Pisteet ja Elämät yhteisinä:** Kolikko ja Pistenäyttö käyttävät Muistia, jonka viite on `pisteet`, ja Elämät Muistia, jonka viite on `elämät`. Jos sellaista ei vielä ole, se tehdään (ilmoitus kertoo: ”Uusi logiikkaan: Pisteet”). Jos on, kohde käyttää sitä: Kolikot-Ryhmään tulee Pisteistä uusi esiintymä (2×), ei uutta muistia. Haku on vain viitteellä; samanniminen muulla viitteellä ei kelpaa.

**Vesi ja Tikkaat päällimmäisinä:** painovoimassa päällimmäinen Alue ratkaisee, joten laatikko asettaa Veden ja Tikkaiden Alueen näkymän painovoima-Alueiden päälle (muut Alueet menevät pohjalle kuten ennen). Laatikon Muoto menee pohjalle, joten hahmo näkyy sen edessä.

**Rajat:** Laatat-hyllyssä ei ole siveltimiä (ne ovat maalauksen työkalurivillä) eikä omia laattoja; Painelaatta, Kuolema-alue ja Kameran rajat, Avain ja ovi sekä Portti puuttuvat (laattojen *astuttu* tulee vaiheessa D, palikan vienti kohtaan jonon 15 (d)); Pikselitarkka tulee vaiheessa E1. Kamera ei ala seurata pelaajaa itsestään: valitse se näkymän osiosta *Maailma ja kamera*. Hyllyjä ei voi nimetä uudelleen eikä omia lisätä; omat kohteet tehdään presetteinä (Omat-hylly). Kolikko ei palaa itsestään: kerätyt palaavat joukkoon *Palauta perusarvo*- tai Tyhjennä käyttötiedot -napista tai toiminnolla Lisää joukkoon. Appi-appi 61–64 teki kolikolle oman Muistin *Kolikko: kerätty*; vanhat kolikot toimivat ennallaan.

## Kerrokset (lyhyesti)

Näkymän asetusten osio *Kerrokset (näkymän nimi)* (napauta tyhjää näkymäkanvaasilla): kerroslista ylimmästä alimpaan. Rivillä **○/●** (kerros, johon uudet palikat tulevat), nimi, palikoiden määrä, **rasti** (poista kerros; palikat siirtyvät pohjalle), sekä napit **katkoviivaneliö** (valitse kerroksen palikat), **silmä** (piilota muokatessa), **lukko** (lukitse muokatessa: palikkaan ei voi tarttua), **tiiliseinä** (este), **▦** (ruudukko), **kytkin** (käytön asetukset), **↑ ↓** (järjestys); laitenäkymässä myös rullausvauhti- ja syvyysvalikko (syvä kerros näkyy muokatessa pienempänä, ks. luku 8). Alhaalla **＋ Uusi kerros**. Silmä ja lukko koskevat vain muokkausta. Tarkemmin Kerros-palikan luvussa.

## Muisti- ja viestilaput

Laput ovat rakentajan omia muistiinpanoja (muistilappu) ja tekoälylle osoitettuja viestejä (viestilappu). Ne eivät kuulu appin logiikkaan, eivät näy käyttäjälle eivätkä kulje viedyn appin mukana. Lappu kuuluu projektiin ja siihen osioon, jossa se tehtiin (Näkymä, Logiikka, Rinnakkain tai lukittu käyttö), ja näkyy vain siellä.

**Tee lappu**: yläpalkin **Muistilappu** tai **Viestilappu**. Lappu ilmestyy oikeaan yläosaan, ja kirjoituskohta on valmiina.

**Lapun osat ja liikkeet:**

| Osa | Mitä tekee |
|---|---|
| otsikkorivi | vedä siirtääksesi; näyttää kuvakkeen ja päivämäärän (vihjeessä tehty ja muokattu) |
| **salama (Kiire)** | merkitsee lapun kiireelliseksi: salama täyttyy ja lapun reuna muuttuu oranssinpunaiseksi; uudelleen poistaa. Tekoäly katsoo jokaisen Appi-appi-työn alussa kiireelliset viestilaput, joiden vuoro on sen, ja vastaa niihin (vastaus ei ole rakennuslupa). Ei muuta vuoroa |
| **↗ (viivanappi)** | vedä siitä viiva palikkaan, logiikan ikkunaan, toiseen lappuun tai mihin tahansa käyttöliittymän kohtaan (myös avoimen asetusikkunan kenttään) |
| **väkänen** | pienentää lapun (teksti piiloon, päivämäärä näkyy); uudelleen avaa |
| **✕** | poistaa lapun (kysyy varmistuksen, jos tekstiä on; ei palaudu) |
| tekstikenttä | vapaa teksti. `[palikan nimi]` tai `[viite]` hakasuluissa viittaa palikkaan |
| alapalkin sirut | **→ nimi** siirtyy viitattuun palikkaan; **⤴ kohde** välähdyttää viivan kohteen (tai vie palikkaan); **✕** poistaa viivan; `[nimi] ?` = palikkaa ei löydy |
| oikea alakulma | vedä muuttaaksesi kokoa |

**Näytä kaikki / Piilota kaikki** (Appi-appi 79): kummankin lappunapin vieressä on silmänappi, kun tässä osiossa on sen lajin lappuja. Silmä piilottaa kaikki sen lajin laput (kaikissa projekteissa ja osioissa); napissa näkyy sitten yliviivattu silmä ja tämän osion piilotettujen määrä, esim. *(3)*. Napautus näyttää ne taas. Uusi lappu näkyy aina, vaikka laji olisi piilossa. Valinta on tämän selaimen asetus: se säilyy uudelleenlatauksessa, mutta ei tallennu projektiin, varmuuskopioon eikä GitHubiin, eikä se poista lappuja. Piilotetun viestilapun uusi vastaus näkyy silti punaisena pisteenä Viestilappu-napissa.

Viivat seuraavat kohdetta, kun kanvaasia rullataan. Jos kohde on näkyvän alueen ulkopuolella, viiva on katkoviiva reunaan asti.

**Viestilapun keskustelu**: kirjoitettu teksti on alkuviesti. Lapun alaosa kertoo vuoron: *Tekoälyn vuoro* tai *Sinun vuorosi*. Tekoäly vastaa vain, kun pyydät keskustelussa ”lue viestilaput”, ja vain jos GitHub-tallennus on päällä (laput tallentuvat tiedostoon `appiappi/laput/laput.json`). Vastaukset näkyvät lapussa viestiketjuna (Tekoäly / Sinä). Vastaa kenttään *Vastaa…* ja paina **Lähetä**. Tekoälyn suunnitelman alla on nappi **Hyväksy suunnitelma**. **Merkitse valmiiksi** sulkee keskustelun (**Avaa uudelleen** avaa). Uusi vastaus näkyy punaisena pisteenä Viestilappu-napissa ja merkkinä *Vastaus* lapun otsikossa. Appi hakee vastauksia itse puolentoista minuutin välein, kun viestilappuja on.

**Asetusten osio Muisti- ja viestilaput**: lappujen määrät, **Hae vastaukset** (GitHub päällä), **Kopioi laput tekstinä** (ilman GitHubia: liitä keskusteluun) ja lista kaikista lapuista. Rivin napautus avaa lapun projektin ja osion ja välähdyttää lappua.

Lappu ei ole toteutuslupa: tekoäly voi vastata suunnitelmalla, joka odottaa hyväksyntää.

## Näppäinoikotiet

Tietokoneella. ⌘ = Macin Command, Windowsissa Ctrl. Oikotiet eivät toimi, kun kirjoitat kenttään (paitsi kentän omat Enter ja Esc).

| Näppäin | Toiminto | Missä |
|---|---|---|
| ⌘Z | Kumoa | kaikkialla paitsi lukitulla Näkymä-välilehdellä |
| ⇧⌘Z tai ⌘Y | Tee uudelleen | kaikkialla paitsi lukitulla Näkymä-välilehdellä |
| ⌘C | Kopioi valitut | Logiikka, Näkymä ja Rinnakkain |
| ⌘V | Liitä | Logiikka, Näkymä ja Rinnakkain (sinne, mistä viimeksi kopioitiin) |
| ⌘D | Monista (näkymä, myös monivalinta) tai toinen esiintymä (logiikka) | valittu palikka |
| N | Tee näkymään: valitusta (tai valituista) logiikkapalikasta oletus (arvosta näyttölaatikko, Toiminnosta Painike, Ketjusta Käynnistysnappi) viimeksi auki olleeseen näkymään ([Tee näkymään](06-kaavat.md#tee-näkymään)) | Logiikka ja Rinnakkain |
| ⌫ tai Delete | Poista valittu (palikka, esiintymä, nuoli, koristeviiva) tai valitut | muokatessa |
| Nuolinäppäimet | Siirrä valittua näkymäpalikkaa 1 px | näkymän muokkaus |
| ⇧ + nuoli | Siirrä 10 px | näkymän muokkaus |
| Esc | Lopeta rakennuslaatikon klik klik (ensin), muuten poista valinta, lopeta työkalu, sulje valikko ja ikkuna | kaikkialla |
| ⇧ + napsautus | Lisää valintaan tai poista valinnasta | kanvaasit |
| ⇧ + veto tyhjästä | Valintalaatikko | kanvaasit |
| ⇧ raahatessa | Ohita kohdistus ruudukkoon | näkymän muokkaus, reitin pisteet |
| välilyönti + veto, keskinappi | Rullaa kanvaasia | kanvaasit |
| ⌘ + rulla | Zoomaa | kanvaasit |
| Enter / Esc | Tallenna / peru | kaavan kirjoitus palikkaan, näkymän nimeäminen |
| ⌘Enter | Luo | Pikaluonti-ikkuna |

Lukitulla Näkymä-välilehdellä poisto, monistus ja nuolinäppäimet eivät toimi.

## Reseptit

### Kaksi palikkaa nuolella yhteen (kytkin näyttää ja piilottaa tekstin)

1. **Näkymä**-välilehti. Paletin ryhmästä *Ohjaimet* vedä **Kytkin** kanvaasille. Ryhmästä *Näyttö* vedä **Teksti**.
2. Vaihda **Logiikka**-välilehdelle. Paletin ylimmässä ryhmässä *Palikat* näkyvät Kytkin ja Teksti. Vedä molemmat logiikkakanvaasille vierekkäin, Kytkin vasemmalle.
3. Tartu Kytkimen **oikean reunan pyöreään palloon** (*arvo*). Vedä Tekstin päälle ja päästä irti palikan keskelle.
4. Valikko *Mihin kohtaan?* aukeaa. Valitse **näkyy kun**. Harmaa nuoli syntyy.
5. Vaihda **Näkymä**-välilehdelle ja paina **Lukitse**. Napauta kytkintä: teksti tulee näkyviin ja katoaa. Logiikassa nuoli on vihreä, kun kytkin on päällä.

Puhelimella samoin: **＋ Palikat** avaa paletin, veto sormella. Nuolen poisto: napauta nuolta ja paneelin **Poista nuoli**.

### Uusi näkymä ja siirtyminen sinne

1. **Näkymä**-välilehti, muokkaustila. Napauta näkymävälilehtien lopun **＋**: syntyy ”Näkymä 2”. Lisää sinne vaikka Teksti. Kaksoisnapauta välilehteä ja nimeä se.
2. Napauta välilehteä *Näkymä 1*. Vedä **Painike** kanvaasille ja valitse se.
3. Paneelin osiossa **Kun painetaan** valitse listasta **＋ Lisää toiminto…** → **Siirry**. Paneeli siirtyy uuteen Siirry-toimintoon (ylhäällä paluunappi ‹ Painike).
4. Jätä *Kohde (sijainti, alue tai palikka)* arvoon ”— ei, käytä näkymää ja kohtaa —” ja valitse **Näkymä**: Näkymä 2. *Siirtymä*: Vierien tai Heti.
5. Takaisin-painike: Näkymä 2:een Painike, *Kun painetaan* → **Palaa takaisin**.
6. **Lukitse** ja paina painiketta.

### Vaihtoehtoryhmä pikaluonnilla

1. **Näkymä**-välilehti. Paletin alaosan ryhmästä *Pikaluonti* napauta **Vaihtoehtoryhmä…**.
2. *Ryhmän nimi*: Mieliala. *Vaihtoehdot* riveittäin: `Hyvä = 3`, `Ok = 2`, `Huono = 1`.
3. *Miten valitaan*: Valitse yksi. *Palikka*: Painike. *Asettelu*: Allekkain. Paina **Luo**.
4. Näkymään tulee otsikko ja kolme painiketta, logiikkaan VAIN YKSI -ikkuna ja pisteiden SUMMA-ikkuna. Pisteet saa tekstiin viitteellä (katso SUMMA-ikkunan viite sen kulmasta), esim. `{mielialapisteet}` (viite muodostuu nimestä ”Mieliala: pisteet”).

### Viestilappu tekoälylle palikasta

1. Avaa osio, jota viesti koskee (esim. Logiikka).
2. Paina yläpalkin **Viestilappu**. Kirjoita viesti; palikkaan voi viitata hakasuluilla, esim. `[Mieliala]`.
3. Vedä lapun otsikon **↗**-napista viiva palikkaan, jota viesti koskee.
4. Pienennä lappu väkäsestä, jos se on tiellä.
5. Pyydä keskustelussa ”lue viestilaput” (GitHub-tallennus päällä). Vastaus ilmestyy lappuun ja Viestilappu-napissa näkyy punainen piste.

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#työympäristö).
