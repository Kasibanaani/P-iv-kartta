# Linjakkuuskartoitus 2 (17.10.2026)

Vuorossa, koska edellisen kartoituksen jälkeen jonosta on viety viisi kohtaa: koeapit C ja B (Appi-appi 23), ✦-merkki (24), *muuttui* (25), logiikan asetukset kaavaan (26) ja logiikkapinnan 1. osa (27). Mittapuu: [PALIKKASAANNOT.md](../PALIKKASAANNOT.md) ja [MISSIO.md](../MISSIO.md). Kartoitus tuottaa löydöksiä ja ehdotuksia, ei koodimuutoksia. **Mikään alla oleva ehdotus ei ole toteutuslupa**, paitsi jonoon lisätty kohta (ks. loppu), joka on pieni ja selvä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran commit `0bcd516` (Appi-appi 27), 59 palikkalajia (`K`). Jokaisesta Nodella kohdat (`portsBase`), ominaisuusrekisteri (`omat`) ja moottorin Miksi?-teksti (`KK.why`) oletusasetuksilla.
- **Käyttöliittymä (uutta):** jokaisen lajin paneeli avattiin selaimessa (Chromium 1440 px) ja sen osiot luettiin; paletin kummankin puolen sisältö; vihjeet (`HINT`); Miksi?-osion näyttöehto (`whySection`).
- **Testit (uutta):** jokaisen lajin maininnat logiikka- ja selaintesteissä (tunnuksella ja suomenkielisellä nimellä); 61 logiikkatestiä ajettiin (kaikki läpi) ja koko sarja `aja.sh` (tulos alla).
- **Ei katsottu:** puhelin- ja iPad-näkymän rakentajan paneelit lajeittain (vain 1440 px), Yhteydet-osio lajeittain (näkyy vain, kun yhteyksiä on), tallennuksen korjaus, asetuksista riippuvat lisäkohdat. Ei oikeaa iPhonea. Manuaalia ei ole, joten nykytilakuva on tämä koodiote.

## Yleiskuva

**Linja pitää.** Viisi uutta kohtaa noudattavat sääntöjä: *muuttui* on sama tapahtuma seitsemällä ohjaimella (A4), logiikan asetukset luetaan kaavalla samalla `palikka.ominaisuus`-tavalla kuin näkymäpalikoissa (A2), logiikkapinnan uudet kentät ovat valinnaisia (A13), ✦-rekisteri ja koodi pysyvät testin avulla samoina (B), ja koeapit tehtiin ilman uusia palikoita (A8). Näkymäpalikoiden paneelit ovat keskenään samanmuotoiset (Sisältö, Näkyvyys, Väri, Este, Käyttöraahaus, Paikka ja koko, Ulkoasu, Ominaisuudet).

Uusi painopiste on **näkyvyys rakentajalle (A10)**: moottori osaa selittää paljon enemmän kuin paneeli näyttää. Toinen kasautuma on **nimet**: sama sana kahdessa merkityksessä (Valitse, Kehys, Lappu), ja yksi niistä aiheuttaa jo väärän ohjetekstin.

## Löydökset

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| M1 | iso | A10 | **Miksi?-osio näkyy vain 14 lajilla** (`whySection`: ikkuna, JOS, VALITSE, KUN, vertailu, lasku, päivämäärän osa, hakutaulukko, kaava, kaavan tulos, Ehto, Ajastin, Ketju, Toistin) ja näkymäpalikoilla, joilla on näkyvyysehto. Moottori kirjoittaa selityksen lisäksi 23 lajille, mutta paneeli ei näytä sitä: Satunnaisluku, Muutos ajassa, Sekuntikello, Liike, Käyrä, Tatti, Alue, Reitti, Kerros, Kamera, Odota kunnes, Monta haaraa, Arpa, Toista, Ketjun tulos, Lopeta ketju, neljä efektiä, Toiminto, Rivi ja Rivijoukko. Esim. Käyrän ”syöte 4 on 40 % x-välistä…”, Monta haaraa ”haara 2 pätee ensimmäisenä” ja Liikkeen ”liikuttaa palikkaa X” on kirjoitettu ja testattu, mutta rakentaja näkee ne vain toisen palikan selityksen alarivinä. | Näyttöehto käänteiseksi: Miksi? näkyy, kun moottorin selitys on olemassa eikä se ole sama kuin paneelin otsikon vihje. **Jonoon 1j.** |
| M2 | keski | A1, missio | **VALITSE-palikan vihje on väärä:** paletti ja paneeli näyttävät ”Muuttaa palikan valituksi.”, joka on Toiminto *Valitse* -vihje. Syy: vihjeet ovat yhdessä taulukossa, jossa palikkalaji `valitse` ja toiminto `valitse` ovat sama avain. Tämä on L4:n nimiongelma, joka on jo muuttunut virheeksi. | Korjaus: VALITSE saa oman vihjeen (”Antaa jommankumman arvon sen mukaan, päteekö ehto.”). **Jonoon 1j.** Nimen muutos on Emilin asia, ks. M3. |
| M3 | keski | A1, missio (sama sana = sama asia) | **Sama sana kahdessa merkityksessä:** *Valitse* = VALITSE-palikka (ehto → arvo) ja Toiminto *Valitse* (tee palikasta valittu). *Kehys* = näkymän koriste (Muoto: Kehys), Toistimen kortti (”kehyksen ensimmäinen kortti”) ja asettelun ”toisen palikan sisään”-kehys; jonon 1g tuo neljännen, logiikan ryhmäkehyksen. *Lappu* = näkymän koriste (Muoto: Lappu) ja rakentajan muisti- ja viestilaput. | Logiikan uusi palikka nimellä **Ryhmä** (suunnitelman otsikko on jo *Ryhmäkehys*); lisätty jonon 1g:hen tekoälyn suosituksena, Emil voi kumota. VALITSE: kun 1f tuo kaavaan `jos(ehto; a; b)`, VALITSE-palikka tekee saman asian palikkana. ⏸ Emilin päätös: pidetäänkö nimi VALITSE (ja selitetään paneelissa ”sama kuin kaavan jos”) vai nimetäänkö uudelleen (esim. *JOS-arvo*). Lappu: ei kiirettä. |
| M4 | keski | A10, missio (käsitteiden määrä) | **Ehto-käsitteitä on nyt kahdeksan**, 1f:n jälkeen yhdeksän: Vertailu, VALITSE, Hakutaulukko, (jos-kaava), JOS, JOS-ikkuna, KUN, Ehto (ketjussa), Monta haaraa, Odota kunnes. Ne jakautuvat kolmeen selkeään perheeseen, jotka noudattavat sääntöä A6: **tila** (Vertailu, VALITSE, Hakutaulukko, `jos`), **hetki** (JOS, KUN) ja **ketju** (Ehto, Monta haaraa, Odota). Linja pitää, mutta perhe ei näy missään. | Tulevaan manuaaliin perheet yhdellä taulukolla. Paneelin vihjeeseen voi lisätä perheen sanan (”tila / hetki / ketju”). Ei jonoon. |
| M5 | pieni | A4, A2 | **Käytössä-ominaisuus puuttuu neljältä tapahtumia ottavalta palikalta:** Satunnaisluku (*arvo uudelleen*), Muutos ajassa (*alkaa*, *pysäytä*), Sekuntikello (*käynnistä*, *nollaa*) ja Liike (*alkuun*). JOS, KUN, ikkunat, ketju ja kaikki ketjun palikat sen omaavat. Edellinen kartoitus sanoi ”käytössä on ohjattava kaikissa tapahtumapalikoissa”; se piti paikkansa vain tapahtumia lähettäville logiikkapalikoille. | Lisätään, kun tarvitaan. Liikkeen kohdalla pitää ensin päättää, mitä ”pois käytöstä” tarkoittaa (pysähtyy vai jatkaa ilman ohjausta). Ei jonoon. |
| M6 | pieni | A11 | **Toistin puuttuu paletista**, kunnes projektissa on Tietotaulukko, eikä paletti kerro syytä. Säännön A11 mukaista (näkyy, kun sitä voi käyttää), mutta löydettävyys kärsii. | Himmeä Toistin-sirpale ja napautuksesta ”Tarvitsee Tietotaulukon” (sama tapa kuin *Tulossa myöhemmin*). Ei kiirettä. |
| M7 | pieni | A4 | Kalenterin käyttäjän tekemä päivän vaihto lähettää *päivä valittu*, muut ohjaimet *muuttui*. Nimi kertoo tekemisen, joten hyväksyttävää. | Ei muutosta. Tarvittaessa tapahtuman tietoihin `uusi`/`vanha` kuten muuttui-tapahtumassa. |

### Testit

| # | Vakavuus | Löydös | Ehdotus |
|---|---|---|---|
| T1 | keski | **Testit vahvistavat selityksiä, joita käyttäjä ei näe** (M1): esim. `selain_37_liike.py` lukee `KK.why` -tekstin sivun koodista eikä paneelista; logiikkatestit 20, 21, 24, 26 ja 28 samoin. Testi on vihreä, vaikka rakentaja ei näe tekstiä. | 1j:n testi tarkistaa Miksi?-osion paneelista. |
| T2 | keski | **Ei yhtäkään testiä, joka avaisi kaikkien lajien paneelit.** Lajikohtaisia aukkoja: JOS ja Tänään ilman selaintestiä, Päivämäärän osa ilman selaintestiä ja yhdellä logiikkatestillä, Kaavio vain esimerkkiprojektin kautta (`selain_03`) eikä yhtään logiikkatestiä sarjoista, Monitori, Arpa, Ketjun tulos ja Lopeta ketju yhdellä testillä kumpaakin lajia. | 1j:hen kevyt savutesti: jokainen `K`-laji paletista tai `addBlock`illa, paneeli auki 1440 ja 390 px, ei sivuvirheitä, Miksi? näkyy kun selitys on. Kartoituksen apuskripti tekee jo tämän 1440:llä. |
| T3 | pieni | 37/68 selaintestiä ajaa puhelinleveydet. Vanhat Kytköskartan testit (01–30) ovat tietokoneleveyksillä. | Riittää puhelinsavutestiksi T2:n kanssa. |
| T4 | pieni | Koko sarja kestää nyt noin 20 minuuttia. README:n arvio ”noin 15 minuuttia” on vanha. | Päivitetään README:hen ajoaika; ei jonoon. |

### Testiajo 17.10.2026

- Logiikkatestit: 61/61 läpi (Node).
- Selaintestit: 68/68 läpi (Chromium, tietokone). `selain_39_appiappi` kaatui ensin, koska ajoin kopion pelkästä `appiappi/`-kansiosta: testi tarvitsee viereisen `pajakone/`-kansion (vanhan osoitteen ohjaus). Kun kansio oli mukana, testi meni läpi. Tämä on testiympäristön asia, ei vika.
- Koko sarja kesti noin 20 minuuttia (11.26–11.46), eli yli tekoälyn työkalun 10 minuutin rajan. Siksi se on ajettava taustalla.

## Edellisen kartoituksen löydökset nyt

| # | Tila |
|---|---|
| L1 *muuttui* | Toteutettu (25). |
| L2 asetukset kaavaan | Toteutettu (26). Odota kunnes -palikan *aikaraja* on ohjattava kohta `o_` (palikalla ei ole sille sisäänmenoa), mikä on säännön A2 mukaista. |
| L3 kaksi ohjausmallia | Auki, manuaaliin. Sääntö on nyt yksiselitteinen: ”onko asetuksella oma sisäänmeno”. |
| L4 lähekkäiset nimet | Auki ja laajeni: M2, M3. |
| L5 Toistimen kohdat | Auki. |
| L6, L7, L8 | Auki, ei muutosta. |

## Erikoispalikoiden rekisteri

Ei muutoksia: uusia lajeja ei ole tullut, ja kaikki ✦-lajit vastaavat rekisteriä (testi 58). Jonon 1g tuo uuden rivin (Ryhmä/Kehys) toteutuksen yhteydessä.

## Lisätty jonoon

- **1j. Miksi? kaikille ja paneelien savutesti** (M1, M2, T1, T2): Miksi?-osio näkyy aina, kun moottorilla on palikalle selitys, joka ei ole sama kuin otsikon vihje; VALITSE-palikalle oma vihje; uusi testi avaa jokaisen lajin paneelin 1440 ja 390 px ja tarkistaa, ettei sivuvirheitä tule ja että Miksi? näkyy. Ei tallennusmuodon muutosta, ei uusia käsitteitä.
- **1g:hen suositus nimestä:** *Ryhmä* eikä *Kehys* (M3).

## Seuraava kartoitus

PALIKKASAANNOT.md:n mukaan: ennen uuden toimintoryhmän suunnittelua (esim. F25 tai vienti omaksi appiksi), viiden valmiin jonon kohdan jälkeen tai pyynnöstä. Ensi kerralla: puhelin- ja iPad-näkymän paneelit lajeittain, Yhteydet-osio ja nimien kokonaislista (paletti, kohdat, ominaisuudet) yhtenä taulukkona.
