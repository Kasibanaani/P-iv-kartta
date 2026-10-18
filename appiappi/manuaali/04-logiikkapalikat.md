# Logiikkapalikat

Tämä luku kuvaa logiikan arvo-, ehto- ja laskupalikat. Liike kuuluu lukuun [Maailma ja liike](08-maailma-ja-liike.md). Ketju, ketjun palikat (Ajastin, Odota kunnes, Ehto, Monta haaraa, Arpa, Toista, Ketjun tulos, Lopeta ketju, efektit) ja Toiminto kuvataan luvussa [Ketjut](05-ketjut-ja-toiminnot.md). Tietotaulukko, Tapahtuman tiedot, Rivi ja Rivijoukko sekä ikkuna riveille kuvataan luvussa [Tieto](07-tieto.md). Kaavan kirjoitustapa on omassa [kaavakielen luvussa](06-kaavat.md)an.

Kuvaus vastaa koodia Appi-appi 31 (commit 77461d2).

## Miten logiikka toimii

### Missä logiikka on

- Yläpalkin välilehti **Logiikka** näyttää logiikan kanvaasin. **Rinnakkain** näyttää näkymän ja logiikan vierekkäin; silloin paletin yläreunassa valitaan **Näkymä** tai **Logiikka**.
- Paletti on tietokoneella vasemmalla. Puhelimessa se avautuu alapalkin napista **＋ Palikat**, ja paneeli (asetukset) napista **Asetukset** (napissa lukee valitun palikan nimi, esim. *Asetukset: Summa*). Paneeli suljetaan puhelimessa napista **Valmis ⌄**.
- Palikka lisätään vetämällä se paletista kanvaasille tai napauttamalla sitä paletissa. Logiikan palikat pitää pudottaa logiikan puolelle; väärälle puolelle pudotus antaa ilmoituksen *Tämä palikka kuuluu logiikan puolelle.*
- Näkymän palikka (painike, säädin, teksti…) tuodaan logiikkaan logiikan paletin kohdasta **Palikat** (hakukenttä *Etsi nimellä…*, vedä kanvaasille) tai valitsemalla palikka näkymässä ja napauttamalla paneelin nappia **Näytä logiikassa**. Sama palikka saa olla logiikassa monessa kohdassa (paneelin nappi **Lisää toinen esiintymä**), jotta nuolet pysyvät lyhyinä. Esiintymät tunnistaa viitteen perässä olevasta merkistä **2×**; sen napautus vie seuraavaan esiintymään (Appi-appi 59, ks. [luku 2](02-tyoymparisto.md)).

### Arvokohdat ja tapahtumakohdat

Jokaisella palikalla on kohtia (pistokkeita): sisääntulot vasemmassa reunassa, ulostulot oikeassa.

| Merkki | Laji | Mitä kuljettaa |
|---|---|---|
| pyöreä piste | **arvo** | Jatkuva tieto: luku, teksti, kyllä/ei tai päivämäärä. Arvo on aina olemassa ja päivittyy itsestään. |
| punainen salmiakki | **tapahtuma** | Hetki: jotain tapahtui juuri nyt (esim. *painettu*, *NIIN*, *valmis*). |

- **Nuoli tuo arvon.** Nuoli vedetään palikan oikean reunan pisteestä toisen palikan vasemman reunan pisteeseen. Hiirellä vedetään painike pohjassa, puhelimessa sormella. Kun nuoli pudotetaan palikan päälle eikä tiettyyn pisteeseen, appi valitsee kohdan itse, tai jos sopivia on monta, valikko kysyy *Mihin kohtaan?*.
- Arvokohtaan tulee yksi nuoli: uusi nuoli korvaa vanhan. Poikkeukset ovat Ikkunan *mukaan* sekä näkymäpalikoiden *näkyy kun* ja *harmaana kun*, joihin saa tulla monta. Tapahtumakohtaan saa tulla monta nuolta.
- **Tapahtumasta ei voi viedä nuolta arvokohtaan** (ilmoitus *Näitä kohtia ei voi yhdistää.*). Arvosta tapahtumakohtaan voi: tapahtuma lähtee, kun arvo **alkaa päteä** (muuttuu epätodesta todeksi).
- Nuoli irrotetaan vetämällä sitä sen kärjestä (vasemman reunan pisteestä). Valittu nuoli poistetaan paneelin napista **Poista nuoli** tai näppäimellä ⌫.
- Osa sisääntuloista on piilossa, kunnes niihin tulee nuoli (esim. KUNin *tapahtuma*, Ikkunan *mukaan*, Satunnaisluvun *pienin* ja *suurin*, Käyrän välit ja portaat). Niihin viedään nuoli pudottamalla se **palikan päälle**.
- Logiikan vasemmassa alakulmassa on nappi **Pistokkeet: näkyvät** / **Pistokkeet piilossa**. Piilotettuna nuolet näkyvät himmeinä ja toimivat; uusi nuoli pudotetaan palikan päälle.
- Vihreä nuoli tarkoittaa, että arvo pätee juuri nyt.
- Paneelin valinta **Käänteinen tässä kohdassa (EI): kyllä ↔ ei** kääntää yhden esiintymän kyllä/ei-arvon (vain tässä kohdassa kanvaasia).

### Jatkuva laskenta ja tapahtuma

- **Jatkuva laskenta**: arvopalikat (Lasku, Vertailu, Kaava, Ikkuna, VALITSE…) lasketaan uudelleen aina, kun jokin niiden lähde muuttuu. Tulos on kuin taulukkolaskennan solu: se on aina ajan tasalla, eikä sitä tarvitse käynnistää.
- **Tapahtuma** on hetki. Se lähtee esim. painalluksesta, siitä että ehto alkaa päteä (JOS, KUN, arvo → tapahtumakohta) tai siitä että Muutos ajassa on valmis. Tapahtuma ajaa siihen kytketyt toiminnot kerran.
- Ehto, joka on jo valmiiksi tosi, kun projekti avataan tai palikka tehdään, ei laukaise tapahtumaa. Tapahtuma lähtee vasta muutoksesta epätodesta todeksi.
- Tapahtumaketjun syvyys on rajattu (60 askelta), joten kierto (toiminto, joka laukaisee itsensä) ei jumita appia.

### Kyllä vai ei: mikä pätee

Kun arvoa käytetään ehtona: **ei päde** tyhjä, ei, 0, virhe ja puuttuva tieto. **Pätee** kaikki muu: kyllä, muu luku kuin 0, ei-tyhjä teksti ja päivämäärä.

Virhe on oma arvonsa (näkyy merkkinä ⚠ ja selityksenä). Se ei muutu hiljaa nollaksi.

### Ominaisuudet ja etusija

Jokaisella palikalla on **Ominaisuudet** (paneelin kokoontaitettava osio *Ominaisuudet*). Rivillä näkyy viite, esim. `uni.min` (napautus kopioi viitteen), nykyinen arvo ja napit:

- **ƒ** tekee ominaisuudelle kaavan (Kaava-palikka ja nuoli valmiiksi).
- **⇢** avaa ominaisuudelle kohdan logiikan palikkaan nuolta varten (ilmoitus *Kohta ”…” on nyt palikassa logiikassa: vie siihen nuoli.*). **×** sulkee avatun kohdan, jos siihen ei tule nuolta.
- **asetettu ↺** näkyy, kun toiminto on asettanut arvon. Napautus palauttaa perusarvon.

ƒ ja ⇢ näkyvät vain **ohjattavilla** ominaisuuksilla. Muut ovat vain luettavia (käytä kaavassa).

Ohjattavan ominaisuuden arvo ratkeaa tässä järjestyksessä:

1. **Ohjattu**: nuoli tai kaava ominaisuuden kohtaan. Pitää arvon niin kauan kuin lähde on voimassa.
2. **Toiminnon asettama**: Aseta arvo, Lisää, Aseta tila, Vaihda (kohdassa *Mitä muutetaan*). Toiminto *Palauta perusarvo* poistaa asetetun arvon.
3. **Perusarvo**: paneelin kenttä.

Muokatessa näkymä näyttää perusarvot, käytössä nykyiset.

### Käyttötieto säilyy

Käyttötietoa ovat arvot, jotka syntyvät käytössä: Muistin sisältö, arvottu satunnaisluku, sekuntikellon aika, Muutos ajassa -tila, toiminnon asettamat ominaisuudet sekä ohjainten valinnat ja tekstit. Ne tallentuvat projektiin ja säilyvät, kun appi suljetaan ja avataan. Ne nollataan kaikki kerralla: **Projekti** → *Tämä projekti* → **Tyhjennä käyttötiedot**. Rakenne (palikat, nuolet, asetukset) säilyy.

### Paneelin yhteiset osat

Logiikan palikan paneelissa on aina **Nimi**, **Tunnus** (viite ja joukot `#nimi`; viite on lyhyt nimi kaavoihin, seuraa nimeä kunnes kirjoitat oman; pienet kirjaimet, numerot ja _, ei ala numerolla) ja **Lisätieto**. Lisäksi useimmilla: *Ulkonäkö logiikassa* (Pistokkeet: kuten muut / näkyvät / piilossa), *Ominaisuudet*, *Miksi?* (osalla lajeista, ks. alla) ja *Yhteydet* (mistä palikka saa arvonsa ja missä sitä käytetään).

**Miksi?** näkyy aina, kun palikalle on selitys (Appi-appi 32 lähtien käytännössä kaikilla logiikkapalikoilla). Se kertoo, mikä osa pätee ja mikä ei, tai miksi arvo on mikä on (esim. Käyrällä ”Syöte puuttuu…”).

---

## Arvo (`arvo`)

Kiinteä arvo, jonka kirjoitat itse: luku, teksti, kyllä/ei tai päivämäärä. Arvo ei muutu käytössä.

- **Löytyy:** logiikan paletti → *Arvot* → **Arvo**. Toinen tapa (Appi-appi 37): kirjoita Kaavaan nimi, jota ei vielä ole (`yöuni > 7`), ja napauta ehdotusrivin **＋ Luo Arvo ”yöuni”**: Arvo syntyy kaavan viereen nimellä ja viitteellä `yöuni`, arvo tyhjä. Kolmas tapa (Appi-appi 69): vahvista kaava (Enter), niin alareunan kysymys *Nimeä yöuni ei ole. Tehdäänkö?* tekee saman OK:lla.
- **Sisään:** ei kohtia.
- **Ulos:** *arvo* (arvo).
- **Asetukset (paneeli):** osio *Arvo*: tekstikenttä (esim. `3`, `Valmis`, `24.12.2026`, `kyllä`); nappi **＋ Viittaus** lisää viittauksen (`@viite`) toisen palikan arvoon. **Yksikkö**: luku (oletus), sekuntia, minuuttia, tuntia, pikseliä, prosenttia.
- **Ominaisuudet:** `arvo` (luettava).
- **Kaavassa:** `viite` antaa arvon.
- **Aika ja tila:** ei käyttötietoa.
- **Esimerkki:** Arvo nimeltä *Raja*, arvo `7`. Kaavassa `uni > raja`.
- **Huomio:** Yksikkö sekuntia, minuuttia tai tuntia tekee arvosta ajan: laskuissa se on sekunteina (Arvo `2`, yksikkö minuuttia = 120). Pikseliä ja prosenttia näkyvät vain perässä. Toiminnot (Aseta arvo, Lisää) eivät voi muuttaa Arvoa; muuttuvaan arvoon käytä Muistia. Paneelissa lukee sama: ”Toiminnot eivät muuta Arvoa. Jos arvo muuttuu käytössä (esim. pisteet), käytä Muistia.”

## Muisti (`muisti`)

Säilyttää arvon, jonka toiminnot antavat (esim. pisteet tai viimeksi valittu). Arvo säilyy, kunnes toiminto muuttaa sitä.

- **Löytyy:** logiikan paletti → *Arvot* → **Muisti**.
- **Sisään:** ei kohtia. Arvo muutetaan toiminnoilla.
- **Ulos:** *arvo* (arvo).
- **Asetukset (paneeli):** **Alkuarvo** (tyhjä = tyhjä). Nappi **Palauta alkuarvoon**.
- **Ominaisuudet:** `arvo` (luettava).
- **Kaavassa:** `viite`.
- **Toiminnot, jotka muuttavat:** Aseta arvo (mikä tahansa arvo), Lisää (luku; tyhjä määrä = 1), Aseta tila, Valitse, Poista valinta, Vaihda (kyllä/ei), Tyhjennä (palauttaa alkuarvon).
- **Aika ja tila:** arvo on käyttötietoa: säilyy suljettaessa, nollautuu *Tyhjennä käyttötiedot* -napista alkuarvoon.
- **Esimerkki:** Muisti *Pisteet*, alkuarvo `0`. Painikkeen paneelissa osio *Kun painetaan* → **＋ Lisää toiminto…** → *Lisää* → Kohde *Pisteet*, Määrä `1`. Teksti-palikan tekstiksi `Pisteet: {pisteet}`.
- **Huomio:** VAIN YKSI -ikkunassa, jossa *Käytössä valinta poistaa ikkunan muut valinnat* on päällä, Muisti lasketaan valintojen joukkoon (sen kyllä voi nollautua).

## Satunnaisluku (`satu`)

Arpoo kokonaisluvun väliltä pienin–suurin (molemmat päät mukana). Luku pysyy samana, kunnes se arvotaan uudelleen.

- **Löytyy:** logiikan paletti → *Arvot* → **Satunnaisluku**.
- **Sisään:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| arvo uudelleen | tapahtuma | Arpoo uuden luvun. |
| pienin | arvo | Välin alku (piilossa, kunnes nuoli tulee). |
| suurin | arvo | Välin loppu (piilossa, kunnes nuoli tulee). |
| paino 1, paino 2 … | arvo | Vain muotoillussa jakaumassa. Piilossa, kunnes nuoli tulee. |

- **Ulos:** *luku* (arvo), *arvottu* (tapahtuma, lähtee jokaisen arvonnan jälkeen).
- **Asetukset (paneeli):** **Pienin** (oletus 1) ja **Suurin** (oletus 6): kirjoita luku tai valitse *tai palikka…*. **Jakauma**: *Tasainen* tai *Muotoiltu*. Muotoillussa pieni käyrä ja nappi **Muokkaa jakaumaa…**. Rivillä *Arvottu luku* nappi **⚂ Arvo nyt**.
- **Jakaumaikkuna** (*Muokkaa jakaumaa…*): **Painoja** 2–10, **Valmiit muodot** (Tasainen, Keskelle, Reunoille, Nousee, Laskee), käyrä, jonka pisteitä vedetään ylös ja alas (hiiri tai sormi), painokentät p1… (0–100, nuolinäppäimet ±1), *Todennäköisyydet*-pylväät ja nappi **⚂ Koeheitto 1000 kertaa**. Sulje napista **Valmis**. Paino p1 on välin pienin luku, viimeinen suurin, muut tasavälein. Painot ovat suhteellisia: summan ei tarvitse olla 100. Jos kaikki painot ovat nollassa, arvonta on tasainen. lukko (kaaviossa piste •) = paino tulee nuolesta, sitä ei voi muuttaa ikkunassa.
- **Ominaisuudet** (kaikki luettavia): `arvo`, `min` (myös `pienin`), `max` (myös `suurin`), muotoillussa `p1`, `p2` …
- **Kaavassa:** `noppa` = arvottu luku, `noppa.min`, `noppa.max`, `noppa.p1`.
- **Aika ja tila:** arvottu luku on käyttötietoa. Ennen ensimmäistä arvontaa luku on tyhjä (–). Arvonta tapahtuu vain tapahtumasta *arvo uudelleen*, toiminnosta **Arvo uudelleen** (myös ketjussa) tai paneelin napista.
- **Esimerkki:** Noppa: Satunnaisluku 1–6. Painikkeen *painettu* → Satunnaisluvun *arvo uudelleen*. Teksti `{noppa}`. Toinen käyttö: muotoiltu jakauma *Keskelle* antaa useimmin välin keskikohdan lukuja.
- **Huomio:** Desimaalivälistä otetaan kokonaisluvut (1,5–4,2 → 2–4). Jos välillä ei ole kokonaislukuja, tulee virhe eikä arvota. Painojen määrän vähentäminen poistaa poistuvien painojen nuolet (Kumoa palauttaa). Nuolesta tullut paino voi olla mikä tahansa luku; negatiivinen lasketaan nollaksi.

## Muutos ajassa (`muutos`)

Kun se käynnistetään, arvo kulkee tasaisesti alusta loppuun annetussa ajassa. Sopii pehmeisiin siirtymiin (zoomaus, liukuva luku).

- **Löytyy:** logiikan paletti → *Liike ja aika* → **Muutos ajassa**.
- **Sisään:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| alkaa | tapahtuma | Käynnistää alusta (myös kesken kulun). |
| pysäytä | tapahtuma | Pysäyttää nykyiseen kohtaan. |
| alku | arvo | Arvo alussa (oletus 0). |
| loppu | arvo | Arvo lopussa (oletus 100). |
| kesto | arvo | Kesto sekunteina (nuolesta). |

- **Ulos:** *arvo* (arvo), *edistyminen* (arvo 0–1), *käynnissä* (kyllä/ei), *valmis* (tapahtuma).
- **Asetukset (paneeli):** **Alku**, **Loppu**, **Kesto** ja **Yksikkö** (sekuntia, minuuttia, tuntia; oletus 1 sekunti). **Kun valmis**: *Pysähtyy loppuun* (oletus, lähettää *valmis*), *Alkaa alusta*, *Edestakaisin*. Tilarivi (*Käynnissä*/*Pysähdyksissä* ja prosentti) sekä napit **▶ Käynnistä kokeeksi** ja **Pysäytä**.
- **Ominaisuudet** (luettavia): `arvo`, `alku`, `loppu`, `kesto` (sekunteina), `edistyminen` (0–1), `käynnissä`, `kulunut` (sekunteina).
- **Kaavassa:** `viite`, `viite.edistyminen`, `viite.kulunut`.
- **Aika ja tila:** ennen käynnistystä arvo on alku. Pysäytetty jää siihen kohtaan; seuraava *alkaa* aloittaa alusta (jatka-toimintoa ei ole). *Valmis* lähtee vain tavassa *Pysähtyy loppuun*. Tila on käyttötietoa.
- **Esimerkki:** Painike *painettu* → Muutos ajassa *alkaa*, alku 100, loppu 200, kesto 1 s. *arvo* → Kameran kohta *zoomaus*: pehmeä lähennys.
- **Huomio:** Kulku on aina tasainen. Muodon saa viemällä *edistyminen* Käyrän syötteeksi (Käyrän x-väli 0–1). Nuolesta tuleva kesto luetaan sekunteina; Arvo yksikössä minuuttia muuttuu sekunneiksi itsestään. Kesto ei saa olla 0. Kulkeeko *valmis*-tapahtuma, jos appi on kiinni kulun loppuessa: (ei tarkistettu).

## Sekuntikello (`kello`)

Mittaa kulunutta aikaa sekunteina. Käynnistys, pysäytys ja nollaus tapahtumilla tai ehdolla.

- **Löytyy:** logiikan paletti → *Liike ja aika* → **Sekuntikello**.
- **Sisään:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| käynnistä | tapahtuma | Käynnistää (jatkaa kertynyttä aikaa). |
| pysäytä | tapahtuma | Pysäyttää; aika säilyy. |
| nollaa | tapahtuma | Nollaa. Käyvä kello jatkaa nollasta. |
| käy kun | arvo | Kello käy täsmälleen silloin, kun ehto pätee. |

- **Ulos:** *kulunut* (arvo, sekunteja), *käy* (kyllä/ei).
- **Asetukset (paneeli):** ei kenttiä. Tilarivi (*Käy*/*Seis* ja aika) ja napit **▶ Käynnistä**, **Pysäytä**, **↺ Nollaa**.
- **Ominaisuudet** (luettavia): `arvo`, `kulunut`, `käy` (myös `käynnissä`, kuten muilla aikapalikoilla: kyllä, kun kello käy; pysäytettynä ei).
- **Kaavassa:** `kello.kulunut > 60`.
- **Aika ja tila:** aika on käyttötietoa ja kuluu kellon mukaan myös, kun appi on kiinni. Käyvä kello pitää näkymän ja logiikan päivittymässä, joten esim. KUN `kello.kulunut >= 60` laukeaa ajallaan ilman napautusta, myös kun kello alkaa käydä liikkeen pysähtyessä.
- **Esimerkki:** Peliaika: Painike → *käynnistä*, toinen → *pysäytä*. *kulunut* → Monitori (esitys *Aika m:ss*).
- **Huomio:** *kulunut* on aika-arvo; Vertailu Arvoon, jonka yksikkö on minuuttia, toimii oikein (molemmat sekunteina).

## Peliohjain (`pohj`)

Xbox-, PlayStation- tai Nintendo-ohjain syötteeksi (selaimen Gamepad API). Tietokoneella myös näppäimistö on pelaajan 1 ohjain (ks. *Näppäimistö* alla). Ei näy käyttäjälle.

- **Löytyy:** logiikan paletti → *Liike ja aika* → **Peliohjain**.
- **Sisään:** ei mitään.
- **Ulos:**

| Kohta | Laji | Mitä |
|---|---|---|
| yhdistetty | arvo | kyllä/ei (palikan arvo) |
| vaaka, pysty | arvo | vasen tatti −1…1, oikealle ja alas + |
| etäisyys | arvo | vasen tatti keskeltä 0–1 |
| suunta | arvo | vasen tatti asteina, 0 = ylös |
| painettu, irrotettu | tapahtuma | mikä tahansa nappi alas / ylös; tapahtuman tiedoissa `nappi` (esim. `alanappi`) |
| yhdistyi, irtosi | tapahtuma | ohjain tuli / lähti |

- **Asetukset (paneeli):** **Pelaaja** 1–4 (oletus 1; ensimmäinen yhdistetty ohjain on pelaaja 1) ja **Kuollut alue** 0–0,5 (oletus 0,15: tatin pieni lepovärinä alle rajan on 0, yli menevä osa skaalataan 0…1). Paneelissa elävä esikatselu: yhdistetty-tila, ohjaimen nimi, painetut napit syttyvät ja tattien arvot. Esikatselu toimii myös muokatessa, mutta logiikka ei silloin reagoi ohjaimeen.
- **Napit sijainnin mukaan** (samat nimet kaikilla merkeillä):

| Appi-appi | Xbox | PlayStation | Nintendo |
|---|---|---|---|
| alanappi | A | ✕ | B |
| oikeanappi | B | ○ | A |
| vasennappi | X | □ | Y |
| ylänappi | Y | △ | X |

  Lisäksi `vasenolka`, `oikeaolka` (LB/RB, L1/R1, L/R), `vasenliipaisin`, `oikealiipaisin` (LT/RT, L2/R2, ZL/ZR; 0–1, painallus = 0,5 tai yli), `ylös`, `alas`, `vasen`, `oikea` (ristiohjain), `valikko` (Menu/Options/+), `valinta` (View/Create/−), `vasenpainallus`, `oikeapainallus` (tatin painallus).
- **Näppäimistö (Appi-appi 64):** kun näkymä on käytössä (lukittu tai Kokeile), näppäimistö on pelaajan 1 ohjain. Näppäin valitaan paikan mukaan, joten kartta on sama kaikilla näppäimistökielillä.

| Näppäin | Ohjaimessa |
|---|---|
| ↑ ↓ ← → tai W S A D | ristiohjain (`ylös`, `alas`, `vasen`, `oikea`) **ja** vasen tatti (`vaaka`, `pysty`; vino 0,71, vastakkaiset kumoavat) |
| Välilyönti tai K | alanappi |
| L / J / I | oikeanappi / vasennappi / ylänappi (IJKL samassa kuviossa kuin ohjaimen etunapit) |
| Q / E | vasenolka / oikeaolka |
| Z / C | vasenliipaisin / oikealiipaisin (1 pohjassa) |
| Enter / askelpalautin | valikko / valinta |

  Oikeaa tattia ja tattien painalluksia ei ole näppäimistöllä. `nimi` on *Näppäimistö*. Näppäimistö yhdistyy (*yhdistyi*) ensimmäisestä sen näppäimen painalluksesta ja irtoaa kuten ohjain. Jos myös oikea ohjain on pelaaja 1, kumpi tahansa käy: napit kummasta tahansa, tatti näppäimistöstä, kun sillä ohjataan. Näppäimet koskevat vain projektia, jossa on Peliohjain-palikka tai ohjaimeen kytketty Tatti tai Painike; silloin ne eivät tee muuta (välilyönti ei panoroi, nuoli ei vieritä). Tekstikenttään kirjoittaessa näppäimet menevät kenttään. Muokatessa nuolet siirtävät valittua palikkaa kuten ennen, eikä näppäimistö ole ohjain. Paneelin esikatselu näyttää vain oikean ohjaimen. Ikkunasta poistuttaessa pohjassa olevat näppäimet päästetään irti.
- **Ominaisuudet** (luettavia, ei asetettavia: arvot tulevat laitteesta): `yhdistetty`, `nimi`, `vaaka`, `pysty`, `etäisyys`, `suunta`, `oikeavaaka`, `oikeapysty` ja jokainen nappi yllä (kyllä/ei, liipaisimet luku). Muut nimet ilman pisteitä: `ylanappi`, `ylos`, `etaisyys`.
- **Kaavassa:** `ohjain.vaaka * 200` (samat nimet kuin Tatilla), `ohjain.alanappi`, `ohjain.oikealiipaisin > 0,5`.
- **Yksi nappi tapahtumaksi:** KUN-palikka ehdolla `ohjain.alanappi`, tai *painettu* → JOS `tapahtuma.nappi = "alanappi"`.
- **Aika ja tila:** toimii, kun näkymä on käytössä (lukittu tai Kokeile). Ohjaimen tila ei tallennu. Kun ohjain irtoaa, sivu menee taustalle tai näkymä avataan muokattavaksi, kaikki napit ja tatit palaavat lepoon (*irtosi*, Tatti *loppuu*).
- **Esimerkki:** Tatin paneelissa *Peliohjain: vasen tatti*, niin vanha Tatti + Liike -peli liikkuu ohjaimella ja koneella nuolinäppäimillä. Hyppypainikkeen paneelissa *Peliohjaimen nappi: alanappi*.
- **Huomio:** selain näkee ohjaimen vasta, kun sen nappia painetaan sivun ollessa auki. Kotinapin ja jakonapin ottaa laite itse. Tärinää ei ole (suunnitelman vaihe 2). Oikealla ohjaimella ja iPhonella ei ole kokeiltu (ei tarkistettu).

## Kerros ✦ (`kerros`)

Tuo näkymän kerroksen logiikkaan: näkyykö kerros käytössä, estääkö se alempien käytön, himmennys, läpinäkyvyys ja syvyys. Esim. valikko, joka avautuu painikkeesta ja estää muun käytön.

✦ Poikkeus: ohjaa näkymää logiikasta. Kaikkia kerroksen asetuksia (rullausvauhti, järjestys) ei voi ohjata.

- **Löytyy:** logiikan paletti → *Näkymä ja efektit* → **Kerros**. Toinen tapa: Näkymä-välilehden paneelin osio *Kerrokset* → kerrosrivin **kytkin** → **◧ Ohjaa logiikasta** (tekee palikan valmiiksi kerrokseen kytkettynä; jos palikka on jo, nappi on **◧ Näytä logiikassa**).
- **Sisään:** *näkyy* (arvo, ohjauskohta, auki valmiiksi uudessa palikassa). Muut ohjattavat ominaisuudet saa kohdaksi ⇢-napista.
- **Ulos:** *näkyy* (arvo).
- **Asetukset (paneeli):** **Kerros** (valitse näkymä · kerros). *Perusarvot (kerroksen asetukset)*: **näkyy käytössä**, **estää alempien käytön**, **himmennä alemmat … %**, **läpinäkyvyys … %**. Samat perusarvot muuttuvat myös kerrosrivin kytkimestä.
- **Ominaisuudet** (kaikki ohjattavia paitsi `arvo`): `näkyy` (kyllä/ei), `estää` (kyllä/ei), `himmennys` (0–100), `läpinäkyvyys` (0–100, 100 = ei näy), `syvyys` (Appi-appi 78; luku, alaraja −90, perusarvo kerrosrivin syvyys, 0 = pinnassa; vain laitenäkymässä, ks. Maailma ja liike: Syvyys).
- **Kaavassa:** `valikko.näkyy`, `valikko.himmennys`.
- **Aika ja tila:** toiminnon asettama arvo on käyttötietoa. Muokatessa kaikki kerrokset näkyvät.
- **Esimerkki:** Painike *Valikko* → osio *Kun painetaan* → **＋ Lisää toiminto…** → *Vaihda* → Kohde: Kerros-palikka → *Mitä muutetaan*: näkyy. Napautus avaa ja sulkee valikon. Toinen käyttö: kaava `peli.tauko` kohtaan *näkyy* pitää valikon näkyvissä tauon ajan.
- **Huomio:** Jos samaan kerrokseen osoittaa monta Kerros-palikkaa, ensimmäinen ratkaisee. Kun näkyvä kerros *estää*, alempien kerrosten palikoita ei voi käyttää.

## Kamera ✦ (`kamera`)

Tuo laitenäkymän zoomauksen logiikkaan ja kertoo, kuinka iso osa maailmasta näkyy.

✦ Poikkeus: ohjaa näkymää logiikasta. Vain zoomausta voi ohjata (ei seurattavaa, kameran paikkaa eikä kuollutta aluetta).

- **Löytyy:** logiikan paletti → *Näkymä ja efektit* → **Kamera**. Toinen tapa: Näkymä-välilehden paneelin osio *Maailma ja kamera* → *Zoomaus* → **⌕ Ohjaa logiikasta** (näkyy laitenäkymässä).
- **Sisään:** *zoomaus* (arvo, ohjauskohta, auki valmiiksi uudessa palikassa).
- **Ulos:** *zoomaus* (%), *näkyvä leveys*, *näkyvä korkeus* (px).
- **Asetukset (paneeli):** **Näkymä** (vain laitenäkymät eli puhelin tai iPad), **Zoomaus alussa (%)** (tyhjä = 100). Rivi kertoo, paljonko maailmasta näkyy nyt.
- **Ominaisuudet:** `zoomaus` (ohjattava, 10–1000 %), `leveys` ja `korkeus` (luettavia).
- **Kaavassa:** `kamera.zoomaus`, `kamera.leveys`.
- **Aika ja tila:** sormien tai toiminnon asettama zoomaus on käyttötietoa (kuten Aseta).
- **Esimerkki:** Painike → Aseta arvo → Kohde Kamera → *Mitä muutetaan*: zoomaus → Uusi arvo `150`. Toinen painike → *Palauta perusarvo*.
- **Huomio:** Nuoli tai kaava kohtaan *zoomaus* lukitsee sormien zoomauksen; Aseta ei lukitse. Lukittu kerros (kojelauta) ei zoomaudu. Jos näkymällä on monta Kamera-palikkaa, ensimmäinen ratkaisee (paneeli varoittaa). `ruutu.leveys` on laitteen leveys, näkyvä maailma on `kamera.leveys`.

## Käyrä (`kayra`)

Muuttaa syötteen (x) tulokseksi (y) muotoillun käyrän kautta, esim. säätimen asennon kiihtyväksi vaikutukseksi. Portaiden välissä käyrä on pehmeä eikä koskaan ylitä tai alita naapuriportaita.

- **Löytyy:** logiikan paletti → *Arvot* → **Käyrä**.
- **Sisään:** *syöte (x)* (arvo). Piilossa, kunnes nuoli tulee: *x alku*, *x loppu*, *y alku*, *y loppu*, *porras 1* … (arvoja).
- **Ulos:** *tulos (y)* (arvo).
- **Asetukset (paneeli):** **Syöte (x)**, **x-väli: alku/loppu** (oletus 0–10), **y-väli: alku/loppu** (oletus 0–100), pieni käyrä ja nappi **Muokkaa käyrää…**, **Tarkkuus**: *Tarkka*, *Kokonaisluku*, *0,1*, *0,01*.
- **Käyräikkuna** (*Muokkaa käyrää…*): **Portaita** 2–10 (oletus 5), **Valmiit muodot** (Suora, Kiihtyy, Hidastuu, S-käyrä, Kumpu, Laskee), käyrä jonka portaita vedetään, portaiden y-kentät, osio **Kokeile** (säädin, joka näyttää x → y muuttamatta oikeaa syötettä). Välit muutetaan paneelista. Sulje napista **Valmis**.
- **Ominaisuudet** (luettavia): `arvo`, `x` (syöte), `t` (kohta käyrällä 0–1, myös `kohta`), `xmin`, `xmax`, `ymin`, `ymax` (myös `xalku`, `xloppu`, `yalku`, `yloppu`), `p1` … (porras % y-välistä).
- **Kaavassa:** `vaste`, `vaste.t`, `vaste.p2`.
- **Aika ja tila:** lasketaan jatkuvasti, ei käyttötietoa.
- **Esimerkki:** Säädin 0–10 → Käyrä *syöte*, muoto *Kiihtyy*, y-väli 0–100. Säädin 5 antaa selvästi alle 50. Toinen käyttö: Muutos ajassa *edistyminen* → Käyrä (x-väli 0–1) → muotoiltu liike.
- **Huomio:** Välin ulkopuolinen syöte käyttää lähintä reunaa. Tyhjä syöte antaa tyhjän tuloksen. x-välin alku ja loppu eivät saa olla samat. Nuolesta tuleva porras voi olla yli 100 tai alle 0.

## Lasku (`lasku`)

Laskee kahden arvon yhteen, erotuksen, tulon tai osamäärän.

- **Löytyy:** logiikan paletti → *Laskut* → symbolit **+**, **−**, **×**, **÷** (kukin tekee Laskun valmiiksi tällä laskutoimituksella).
- **Sisään:** *A* (arvo), *B* (arvo).
- **Ulos:** *tulos* (arvo).
- **Asetukset (paneeli):** **Laskutoimitus** (+ − × ÷). **A** ja **B**: kirjoita luku, teksti tai päivämäärä, tai valitse *tai palikka…*. Jos kohtaan tulee nuoli, kentässä lukee *Arvo tulee nuolesta.*
- **Ominaisuudet:** `arvo`.
- **Kaavassa:** `viite`.
- **Säännöt:** tyhjä = 0. Päivämäärä + luku = päivämäärä luvun verran päiviä myöhemmin. Päivämäärä − päivämäärä = päivien määrä. Teksti + mikä tahansa liittää tekstit yhteen. Jako nollalla, päivämäärän kertominen ja kahden päivämäärän summa ovat virheitä. Puuttuva taulukkotieto tekee tuloksesta tuntemattoman.
- **Esimerkki:** ks. resepti *Laske kahden luvun summa*.

## Vertailu (`vert`)

Vertaa kahta arvoa. Tulos on kyllä tai ei.

- **Löytyy:** logiikan paletti → *Vertailut* → **=**, **≠**, **<**, **≤**, **>**, **≥**. *sisältää* valitaan paneelista (paletissa vain merkit).
- **Sisään:** *A*, *B* (arvoja).
- **Ulos:** *tulos* (kyllä/ei).
- **Asetukset (paneeli):** **Vertailu** (= ≠ < ≤ > ≥ *sisältää*), **A**, **B** (kenttä tai *tai palikka…*).
- **Ominaisuudet:** `arvo`.
- **Säännöt:** luvut lukuina, päivämäärät päivinä (teksti kuten `24.12.2026` tulkitaan päivämääräksi, kun toinen puoli on päivämäärä), tekstit aakkosjärjestyksessä kirjainkoosta välittämättä (`Kalle` = `kalle`). Tyhjä = tyhjä on kyllä; tyhjä < luku on ei.
- **Esimerkki:** Säädin → A, B = `3`, vertailu ≤. Tulos → Teksti *näkyy kun*.
- **sisältää:** löytyykö B:n teksti A:sta, kirjainkoosta välittämättä, kuten kaavan `nimi sisältää haku`. Tyhjä B pätee aina, tyhjä A ei koskaan. Kanvaasilla palikan merkki on ∋.

## Kaava (`kaava`)

Lyhyt lauseke, joka lasketaan jatkuvasti, esim. `uni > 7`, `tänään + 5` tai `jos (uni > 7) "hyvä" muuten "huono"`. Kaavakieli kuvataan omassa luvussaan.

- **Löytyy:** logiikan paletti → *Kaava* → **Kaava**. Näkymäpalikan paneelissa myös napit **ƒ Teksti kaavasta**, **ƒ Näkyy, kun kaava pätee** ja **ƒ Harmaana, kun kaava pätee**, sekä Ominaisuudet-rivin **ƒ**: ne tekevät Kaavan ja nuolen valmiiksi.
- **Sisään:** ei kohtia (viittaukset kirjoitetaan kaavaan).
- **Ulos:** *tulos* (arvo).
- **Asetukset (paneeli):** kaavakenttä, ehdotusrivi (viitteet, ominaisuudet pisteen jälkeen, `jos (`, `ja`, `tai`, `niin`, `muuten`, `sisältää`, tuntemattomalle nimelle **＋ Luo Arvo**), tulosrivi (*Nyt: …* tai virhe), napit **＋ Viite** ja **＋ Ominaisuus**. Osio *Vie tulos jatkuvasti*: nappi **Vie tulos näkymän palikkaan…** (näkyy kun, harmaana kun, vaihtoväri kun tai teksti). Osio *Kun tulos alkaa päteä (kerran)*: **＋ Lisää toiminto…**.
- **Suoraan kirjoittaminen (Appi-appi 27):** kaksoisnapautus Kaavaan tai napautus jo valittuun Kaavaan avaa kirjoituskentän palikan kohdalle. Enter tai napautus muualle tallentaa, Esc peruu; koko muokkaus on yksi Kumoa-askel. Ketjun sisällä ei toimi.
- **Venyvä Kaava (Appi-appi 27):** valitun Kaavan oikeassa alakulmassa on venytyskulma (puhelimessa hieman sisempänä). Venytetty Kaava näyttää koko kaavan rivitettynä. Kaksoisnapautus kulmaan palauttaa koon. Ketjussa ei veny.
- **Pudotus:** Kaavan voi raahata ikkunaan (ikkuna hoitaa sulut) tai näkymän palikan päälle logiikassa (teksti, näkyy kun, harmaana kun).
- **Ominaisuudet:** `arvo`.
- **Huomio:** Sana ilman lainausmerkkejä on aina viite. Sulut ryhmittelevät (`(a + 1) * 2`), ja ehto kirjoitetaan sanoin: `jos (ehto) a muuten b`, `a ja b`, `a tai b` (Appi-appi 55; vanha `jos(;;)` muuttuu itsestään). Kaavassa ei ole funktioita. Isommat yhdistelmät myös ikkunoilla. Kaava `x = …`, jossa x on Kaavan tulos -palikan viite, antaa arvon sille (ks. alla); muuten `=` vertaa.

## Kaavan tulos ✦ (`tulos`)

Nimetty arvo, jonka antaa kaava muodossa `viite = lauseke`. Tällä saa kaavalle oman nimen ja viitteen.

✦ Poikkeus: saa arvonsa vain kaavasta `tulos = …`, ei nuolesta eikä kentästä.

- **Löytyy:** logiikan paletti → *Kaava* → **Kaavan tulos**. Toinen tapa: kirjoita Kaavaan `pisteet = a + b`, jolloin paneeliin tulee nappi **＋ Luo kaavan tulos ”pisteet”**.
- **Sisään:** ei kohtia.
- **Ulos:** *arvo* (arvo).
- **Asetukset (paneeli):** näyttää kaavan, josta arvo tulee (napautus vie siihen), tai napin **ƒ Kirjoita kaava tälle**. Osio **Näkymään** → **▢ Tee näkymään** tekee arvolle näyttölaatikon näkymään ([Tee näkymään](06-kaavat.md#tee-näkymään); sama kaikilla arvollisilla logiikkapalikoilla).
- **Ominaisuudet:** `arvo`.
- **Kaavassa:** `pisteet` tulos, vertailuun `pisteet == 8`. Tekstissä `{pisteet}`.
- **Esimerkki:** Kaava `arvio = jos (uni > 7) "levännyt" muuten "väsynyt"`. Teksti `{arvio}`.
- **Huomio:** Vain yksi kaava voi antaa arvon: ensin tehty voittaa, ja paneeli varoittaa muista. Ilman kaavaa arvo on tyhjä.

## Tänään (`tanaan`)

Antaa tämän päivän päivämäärän.

- **Löytyy:** logiikan paletti → *Arvot* → **Tänään**.
- **Sisään:** ei kohtia.
- **Ulos:** *arvo* (päivämäärä).
- **Asetukset (paneeli):** vain ohjeteksti.
- **Aika ja tila:** päivittyy itsestään keskiyöllä, kun appi on auki.
- **Esimerkki:** Tänään → Lasku + 5 → päivä viiden päivän päästä. Tänään → Päivämäärän osa → Viikkonumero.
- **Huomio:** Kaavassa sama on sana `tänään` (myös `huomenna`, `eilen`), joten palikkaa ei kaavassa tarvita.

## Päivämäärän osa (`pvmosa`)

Poimii päivämäärästä yhden osan.

- **Löytyy:** logiikan paletti → *Arvot* → **Päivämäärän osa**.
- **Sisään:** *päivämäärä* (arvo).
- **Ulos:** *tulos* (arvo).
- **Asetukset (paneeli):** **Mikä osa**: Viikkonumero (oletus, suomalainen ISO), Viikonpäivä (nimi, esim. *maanantai*), Viikonpäivä numerona (maanantai 1 … sunnuntai 7), Päivä, Kuukausi, Vuosi, Päiviä tästä päivästä (menneet miinuksella). **Päivämäärä** (kenttä tai *tai palikka…*).
- **Ominaisuudet:** `arvo`.
- **Esimerkki:** Päivämäärä-ohjain → *päivämäärä*, osa *Päiviä tästä päivästä* → Vertailu < 0 → Teksti *näkyy kun* (”myöhässä”).
- **Huomio:** Jos syöte ei ole päivämäärä, tulos on tyhjä. Päivämäärä-ohjaimella on samat osat suoraan ominaisuuksina (`pvm.viikko`, `pvm.päiviä`).

## JOS (`jos`)

Kun ehto **alkaa päteä**, NIIN-toiminnot tehdään kerran. Valinnainen MUUTEN-haara tehdään, kun ehto lakkaa päteä.

- **Löytyy:** logiikan paletti → *Ehdot* → **JOS**.
- **Sisään:** *ehto* (arvo).
- **Ulos:** *pätee* (kyllä/ei, jatkuva), *NIIN* (tapahtuma), *MUUTEN* (tapahtuma, vain kun valittu).
- **Asetukset (paneeli):** **Käytössä**, **MUUTEN-haara: toiminnot, kun ehto lakkaa päteä**. Osiot *NIIN* ja *MUUTEN*: numeroitu toimintolista ja **＋ Lisää toiminto…** (tekee Toiminto-palikan ja nuolen valmiiksi; napautus riviin avaa toiminnon, × poistaa).
- **Ominaisuudet:** `arvo`, `käytössä` (ohjattava).
- **Aika ja tila:** NIIN tehdään uudelleen vasta, kun ehto on välillä lakannut päteä. Jos ehto pätee jo, kun projekti avataan, NIIN ei lähde.
- **Esimerkki:** ks. resepti *Näytä viesti vain kun ehto pätee*.
- **Huomio:** JOS ei pakota tilaa: jos haluat, että jokin näkyy *niin kauan kuin* ehto pätee, vie ehto suoraan näkymäpalikan kohtaan *näkyy kun*. Pois käytöstä oleva JOS ei lähetä tapahtumia. Kaavan `jos (…) … muuten …` on eri asia: se on VALITSE-palikka kaavana, valitsee arvon eikä tee mitään.

## VALITSE (`valitse`)

Antaa arvon A, kun ehto pätee, muuten arvon B. Ei tee mitään, vain antaa arvon.

- **Löytyy:** logiikan paletti → *Ehdot* → **VALITSE**.
- **Sisään:** *ehto*, *arvo kun pätee*, *arvo muuten* (arvoja).
- **Ulos:** *tulos* (arvo).
- **Asetukset (paneeli):** **Arvo, kun ehto pätee** (tyhjä = kyllä), **Arvo muuten** (tyhjä = ei). Kenttä tai *tai palikka…*.
- **Ominaisuudet:** `arvo`.
- **Esimerkki:** Kytkin → *ehto*, A = `Päivä`, B = `Yö` → Teksti *teksti*. Toinen käyttö: VALITSE kahden kuvan SVG-tekstin välillä → Kuva-palikan kohta *kuva*.
- **Huomio:** Sama kaavana: `jos (kytkin) "Päivä" muuten "Yö"`.

## Hakutaulukko (`haku`)

Valitsee tuloksen sen mukaan, mille riville arvo osuu (kuten taulukkolaskennan haku): esim. pisteet → arvosana.

- **Löytyy:** logiikan paletti → *Ehdot* → **Hakutaulukko**.
- **Sisään:** *arvo* (arvo).
- **Ulos:** *tulos* (arvo).
- **Asetukset (paneeli):** **Arvo** (kenttä tai *tai palikka…*). Rivit: valinta *välillä* (kentät *alkaen* ja *alle*) tai *täsmälleen* (kenttä *arvo*), **→** ja *tulos*; napit ↑ (siirrä ylemmäs) ja × (poista). **＋ Lisää rivi**. **Muuten (mikään rivi ei osu)**. Vihreä rivi osuu juuri nyt.
- **Ominaisuudet:** `arvo`, `rivi` (osuneen rivin numero, 0 = ei osunut).
- **Säännöt:** rivit käydään ylhäältä alas, ensimmäinen osuva ratkaisee. *Välillä* = vähintään alkaen ja alle ylärajan (0–5 kattaa 0…4,99). Tyhjä raja = rajaton. Tyhjä arvo menee *Muuten*-kohtaan. Tulos voi olla luku tai teksti, myös `{Nimi}`.
- **Esimerkki:** SUMMA-ikkuna → *arvo*. Rivit: välillä 0–5 → `heikko`, 5–8 → `hyvä`, välillä 8–(tyhjä) → `erinomainen`.

## KUN (`kun`)

Laukaisee tapahtuman *silloin* joko ehdon alkaessa päteä tai päästämällä tulevan tapahtuman läpi vain, jos ehto pätee juuri silloin.

- **Löytyy:** logiikan paletti → *Ehdot* → **KUN**.
- **Sisään:** *ehto* (arvo), *tapahtuma* (tapahtuma, piilossa kunnes nuoli tulee: pudota tapahtumanuoli KUNin päälle).
- **Ulos:** *silloin* (tapahtuma).
- **Asetukset (paneeli):** **Käytössä**. Osio *Silloin*: toimintolista ja **＋ Lisää toiminto…**.
- **Ominaisuudet:** `käytössä` (ohjattava).
- **Toimintatavat:**

| Kytkennät | Milloin *silloin* lähtee |
|---|---|
| vain *ehto* | kun ehto alkaa päteä (epätosi → tosi) |
| *tapahtuma* ja *ehto* | kun tapahtuma tulee ja ehto pätee juuri silloin |
| vain *tapahtuma* | aina kun tapahtuma tulee |

- **Esimerkki:** Painike *painettu* → KUN *tapahtuma*; Kytkin *Lupa* → KUN *ehto*; *silloin* → Siirry. Painallus vie eteenpäin vain, kun lupa on päällä.

## Ikkuna (`ikkuna`)

Sulku, joka yhdistää sisällään olevien palikoiden arvot yhdeksi tulokseksi: JA, TAI, laskettu summa ja muut. Ikkunoita voi laittaa sisäkkäin.

- **Löytyy:** logiikan paletti → *Ikkunat*: **JA**, **TAI**, **VAIN YKSI**, **VÄHINTÄÄN**, **ENINTÄÄN**, **TÄSMÄLLEEN**, **EI MIKÄÄN**, **MONTAKO PÄTEE**, **SUMMA**, **KESKIARVO**, **SUURIN**, **PIENIN** sekä **JOS-ikkuna** ja **KUN-ikkuna** (JA-ikkuna valmiiksi jatkolla JOS tai KUN).
- **Sisältö:** vedä palikoita ikkunan sisään (hiirellä tai sormella), myös Kaava tai toinen ikkuna. Ikkunan sisältöä ovat ne sisällä olevat palikat, joilla on arvo ja joiden arvoa **ei** viedä nuolella toiseen saman ikkunan palikkaan. Esim. Säädin → Vertailu ≤ 3 ikkunan sisällä: vain vertailun tulos lasketaan. KUN-palikat ja ketjun palikat eivät ole sisältöä. Käänteinen (EI) -valinta kääntää jäsenen arvon.
- **Sisään:** *mukaan* (arvo, piilossa kunnes nuoli tulee; monta nuolta sallittu, tuo arvoja ikkunan ulkopuolelta). KUN-jatkolla *tapahtuma*. Riveille-valinnalla *rivit*, Jäsenille-valinnalla *jäsenet* (Appi-appi 63; ks. luku [Tieto](07-tieto.md#ikkuna-jäsenille-appi-appi-63)).
- **Ulos:** *tulos* (arvo). JOS-jatkolla *NIIN* ja valinnaisesti *MUUTEN* (tapahtumia). KUN-jatkolla *läpi* (tapahtuma).
- **Asetukset (paneeli):** **Miten sisältö yhdistyy** (tavat alla). **Montako** (VÄHINTÄÄN, ENINTÄÄN, TÄSMÄLLEEN; oletus 1). **Toimii myös**: *pelkkänä tuloksena* / *JOS: tapahtumat NIIN ja MUUTEN* / *KUN: päästää tapahtuman läpi*. VAIN YKSI -tavalla **Käytössä valinta poistaa ikkunan muut valinnat**. Jatkon kanssa **Käytössä**, JOS-jatkolla **MUUTEN-haara**. Kun projektissa on Tietotaulukko: **Riveille: sisältö lasketaan jokaisella rivillä**. Palikan alla valinta **Tiivistetty: sisältö piiloon, ikkuna pieneksi** (myös ikkunan –-napista).

| Tapa | Tulos |
|---|---|
| JA | kyllä, jos kaikki sisällä pätee (tyhjä ikkuna = ei) |
| TAI | kyllä, jos yksikin pätee |
| VAIN YKSI | kyllä, jos täsmälleen yksi pätee |
| VÄHINTÄÄN | kyllä, jos päteviä on vähintään *Montako* |
| ENINTÄÄN | kyllä, jos päteviä on enintään *Montako* |
| TÄSMÄLLEEN | kyllä, jos päteviä on täsmälleen *Montako* |
| EI MIKÄÄN | kyllä, jos mikään ei päde (tyhjä ikkuna = kyllä) |
| MONTAKO PÄTEE | päteviä lukuna |
| SUMMA | lukujen summa |
| KESKIARVO | keskiarvo, tyhjät ohitetaan |
| SUURIN | suurin luku, tyhjät ohitetaan |
| PIENIN | pienin luku, tyhjät ohitetaan |

- **Jatko JOS:** NIIN lähtee, kun tulos alkaa päteä, MUUTEN kun se lakkaa (kuten JOS-palikka). Osiot *NIIN* ja *MUUTEN* ja **＋ Lisää toiminto…**.
- **Jatko KUN:** tapahtuma kohtaan *tapahtuma* pääsee läpi (*läpi*) vain, jos ikkunan tulos pätee juuri silloin. Osio *Läpi*.
- **Pakota (VAIN YKSI):** kun käyttäjä tai toiminto valitsee ikkunassa olevan kyllä/ei-palikan (valintaruutu, kytkin, pohjaan jäävä painike, Muisti), muut ikkunan valinnat poistuvat. Näin syntyy vaihtoehtoryhmä.
- **Ominaisuudet:** `arvo`, `raja` (myös `n`, vain VÄHINTÄÄN/ENINTÄÄN/TÄSMÄLLEEN, ohjattava), `pätee` (montako pätee), `jäseniä`, `käytössä` (ohjattava). Riveille lisäksi `rivejä`, `havaintoja`, `puuttuvia` (luku [Tieto](07-tieto.md)).
- **Kaavassa:** `valinnat.pätee >= 2`.
- **Esimerkki:** ks. resepti *Kolmesta valintaruudusta vähintään kaksi*.
- **Huomio:** SUMMA laskee kyllä-arvon yhdeksi ja tekstin nollaksi. KESKIARVO, SUURIN ja PIENIN laskevat kyllä/ei-arvot lukuina 1/0. Ennätys tehdään Muistilla: Muisti ja uusi tulos SUURIN-ikkunaan, ja Aseta arvo vie tuloksen takaisin Muistiin. Näkymä-paletin *Pikaluonti* → **Vaihtoehtoryhmä…** tekee napit näkymään ja niille ikkunan logiikkaan (VAIN YKSI -tavalla valinnat poistavat toisensa).

## Ryhmä ✦ (`ryhma`)

Rakentajan merkintä: kokoaa palikoita reunaviivan sisään, nimellä ja halutessa sävyllä. Ei laske mitään.

✦ Poikkeus: ei arvoa, ei kohtia eikä laskentaa. Sisältö toimii kuin ryhmää ei olisi.

- **Löytyy:** logiikan paletti → *Ikkunat* → alaotsikko *Järjestys* → **Ryhmä**.
- **Sisään / Ulos:** ei kohtia.
- **Asetukset (paneeli):** **Nimi** (kirjoitettu nimi näkyy ryhmän ylälaidassa), **Lisätieto**, **Sävy** (∅ = ei sävyä, tai yksi kahdeksasta väristä). Viite-kenttää ei ole: ryhmällä ei ole viitettä, eikä sen nimi estä muita palikoita saamasta samaa nimeä tai viitettä (ryhmä *Uni* ja Arvo *Uni* → Arvon viite on `uni`).
- **Käyttö:** vedä palikoita, ikkunoita ja ketjuja ryhmän sisään; ne liikkuvat ryhmän mukana. Koko muutetaan kulmasta, tiivistys –-napista tai valinnalla *Tiivistetty*.
- **Huomio:** Ryhmän voi laittaa vain ylimmälle tasolle tai toiseen ryhmään, ei ikkunaan eikä ketjuun. Poisto jättää sisällön paikalleen. Kopioi ja liitä vie ryhmän sisältöineen. Vanhassa projektissa (ennen jonon kohtaa 1k) ryhmällä saattoi olla viite; kaava tai teksti, joka yhä osoittaa ryhmään, näyttää `⚠ Ryhmä ei ole arvo`. Kirjoita kaavaan oikean palikan viite.

## Muualla kuvatut logiikan palikat

- **Liike**: luku [Maailma ja liike](08-maailma-ja-liike.md).
- **Ketju** ja ketjun palikat (Ajastin, Odota kunnes, Ehto, Monta haaraa, Arpa, Toista, Ketjun tulos, Lopeta ketju, Teksti ilmestyy, Kuva vaihtuu, Animaatio, Näkymänvaihto) sekä **Toiminto** (Aseta arvo, Lisää, Vaihda, Palauta perusarvo …): luku [Ketjut](05-ketjut-ja-toiminnot.md).
- **Tietotaulukko**, **Tapahtuman tiedot**, **Rivi**, **Rivijoukko** ja ikkunan valinta *Riveille*: luku [Tieto](07-tieto.md).

## Reseptit

### 1. Laske kahden luvun summa

1. Välilehti **Näkymä**: lisää paletin *Ohjaimet*-ryhmästä kaksi **Lukukenttää** ja *Näyttö*-ryhmästä **Teksti**.
2. Välilehti **Logiikka**: vedä paletin kohdasta *Palikat* molemmat Lukukentät kanvaasille.
3. Paletti → *Laskut* → **+** (puhelimessa ensin **＋ Palikat**). Valitse uusi Lasku ja kirjoita paneelin **Nimi**-kenttään `Summa` (viite muuttuu `summa`).
4. Vedä nuoli ensimmäisen Lukukentän oikean reunan pisteestä (*arvo*) Laskun kohtaan *A*, toisesta kohtaan *B*.
5. Valitse näkymässä Teksti ja kirjoita sen tekstiksi `Summa: {summa}`.
6. Kokeile: muuta lukuja (tai lukitse näkymä **Lukitse**). Teksti päivittyy heti.

Sama ilman Laskua: Kaava, jossa Lukukenttien viitteet plus-merkillä, esim. `a + b` (viite näkyy kunkin Lukukentän paneelin **Tunnus**-kentässä), ja paneelin nappi **Vie tulos näkymän palikkaan…** → Teksti → teksti.

### 2. Näytä viesti vain kun ehto pätee (JOS)

1. Näkymään **Säädin** (esim. 0–10). Logiikkaan Säädin kohdasta *Palikat*.
2. Paletti → *Vertailut* → **≥**. Vedä nuoli Säätimen *arvo* → Vertailun *A*. Kirjoita paneelin **B**-kenttään `8`.
3. Paletti → *Ehdot* → **JOS**. Vedä nuoli Vertailun *tulos* → JOSin *ehto*.
4. Valitse JOS. Paneelin osiossa *NIIN* avaa **＋ Lisää toiminto…** ja valitse **Näytä ilmoitus**. Kirjoita uuden toiminnon kenttään **Ilmoitus** `Hyvä taso!`.
5. Kokeile: kun säädin nousee 8:aan, ilmoitus näkyy kerran. Se näkyy uudelleen vasta, kun säädin on käynyt alle 8:n.

Jos viestin pitää näkyä koko ajan ehdon ollessa voimassa: vie Vertailun *tulos* suoraan Teksti-palikan kohtaan *näkyy kun* (ei JOSia).

### 3. Kolmesta valintaruudusta vähintään kaksi (Ikkuna)

1. Näkymään kolme **Valintaruutua** ja **Teksti** `Riittää!`.
2. Logiikka: paletti → *Ikkunat* → **VÄHINTÄÄN**. Paneelissa **Montako** = `2`.
3. Vedä kolme Valintaruutua kohdasta *Palikat* suoraan ikkunan sisään.
4. Vedä nuoli ikkunan *tulos* → Teksti-palikan kohta *näkyy kun* (vie Teksti ensin logiikkaan *Palikat*-listasta tai napista **Näytä logiikassa**).
5. Kokeile: Teksti näkyy, kun kaksi tai kolme ruutua on rastitettu. Valitun ikkunan *Miksi?* kertoo, mitkä pätevät.

### 4. Laskuri, joka muistaa

1. Näkymään **Painike** (Toiminta *Kertapainallus*) ja **Teksti**.
2. Logiikka: paletti → *Arvot* → **Muisti**. Nimi `Pisteet`, **Alkuarvo** `0`.
3. Valitse Painike. Paneelin osiossa *Kun painetaan* avaa **＋ Lisää toiminto…** → **Lisää**. Toiminnon paneelissa **Kohde** = Pisteet, **Määrä** `1` (tyhjä = 1).
4. Tekstin tekstiksi `Pisteet: {pisteet}`.
5. Nollaus: toinen Painike → **Tyhjennä** → Kohde Pisteet (palauttaa alkuarvon). Pisteet säilyvät, vaikka appi suljetaan.

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#logiikkapalikat).
