# Kaavat, viitteet ja ominaisuudet

Tämä luku on kaavojen syntaksiviite. Kaava on lyhyt lauseke, kuten `uni > 7` tai `tänään + 5`, joka laskee arvon toisten palikoiden arvoista. Kaavaan viitataan palikoihin niiden **viitteellä** (lyhyt nimi) ja palikan osiin pisteellä (`uni.näkyy`). Samaa viitettä käytetään teksteissä aaltosulkeissa (`{uni}`).

Kaikki tämän luvun esimerkkien tulokset on tarkistettu ajamalla appin moottoria (Appi-appi 31, commit 77461d2), ellei toisin mainita. Esimerkeissä oletetaan, että tänään on 17.10.2026 ja kello 9.30.

---

## Viite

Jokaisella palikalla (paitsi Ryhmällä) on **viite**: lyhyt nimi, jolla siihen viitataan kaavoissa ja teksteissä. Esimerkiksi palikan *Uni* viite on `uni`.

- **Löytyy:** valitse palikka, paneelin (tarkastelijan) yläosassa on kenttä **Viite** heti kentän **Nimi** alla. Viite näkyy myös Palikat-listan (yläpalkin **☰ Palikat**) sarakkeessa *Viite* ja Ominaisuudet-osion riveillä.
- **Säännöt:** vain pienet kirjaimet a–z, å, ä, ö, numerot ja alaviiva `_`. Ei saa alkaa numerolla. Isot kirjaimet muuttuvat pieniksi (kirjoitat `U2` → tallentuu `u2`). Muut merkit (välilyönti, viiva, é, ü) eivät kelpaa.
- **Varatut sanat** eivät kelpaa viitteeksi: `nyt`, `ruutu`, `näkymä` (`nakyma`), `tumma`, `tänään` (`tanaan`), `huomenna`, `eilen`, `kyllä` (`kylla`), `ei`, `tyhjä` (`tyhja`), `näkyy`, `harmaa`, `piilossa`, `luettava`. Sanat `jos`, `ja`, `tai` ja `sisältää` eivät ole varattuja (ks. Huomio).
- **Kaksi palikkaa ei voi jakaa samaa viitettä.**

### Automaattinen muodostus nimestä

Uusi palikka saa viitteen nimestään: nimi pienillä kirjaimilla, kaikki kelpaamattomat merkit poistetaan, enintään 24 merkkiä.

| Nimi | Viite | Miksi |
|---|---|---|
| Uni | `uni` | |
| Uni 2 | `uni2` | välilyönti pois |
| 3. kysymys | `p3kysymys` | ei saa alkaa numerolla: eteen `p` |
| Ei | `ei2` | `ei` on varattu: perään numero |
| (toinen) Uni | `uni2` | `uni` jo käytössä: perään 2, 3 … |

Jos nimestä ei jää yhtään kelpaavaa merkkiä, viite on `p` (tai `p2` …).

### Viitteen muuttaminen

1. Valitse palikka (napauta sitä näkymässä tai logiikassa).
2. Kirjoita paneelin kenttään **Viite** uusi viite.
3. Virheellinen viite näkyy punaisena ja kentän alla lukee syy. Viite ei vaihdu ennen kuin se kelpaa; jos poistut kentästä virheellisellä tekstillä, kenttään palaa voimassa oleva viite.

Virheilmoitukset:

- `”tänään” on kaavoissa varattu sana. Valitse toinen viite.`
- `Viitteessä saa olla vain kirjaimia, numeroita ja _, eikä se saa alkaa numerolla.`
- `Viite on jo käytössä palikalla ”Uni”.`

Kentän ohjeteksti kertoo tilan: *Seuraa nimeä, kunnes kirjoitat oman.* tai *Itse asetettu. Tyhjäksi = takaisin nimestä.*

- **Viite seuraa nimeä**, kunnes kirjoitat oman. Kun vaihdat nimen, viite vaihtuu mukana (Uni 2 → Unen laatu: `uni2` → `unenlaatu`).
- **Itse kirjoitettu viite pysyy**, vaikka nimi vaihtuisi.
- **Tyhjennä kenttä**, niin viite muodostuu taas nimestä ja seuraa sitä.

### Uudelleennimeäminen ei riko mitään

Kaavat ja tekstit tallentuvat sisäisesti palikan tunnisteella (`{#b4}`), ei viitteellä. Kun vaihdat palikan nimen tai viitteen, kaikki kaavat ja tekstit toimivat edelleen, ja niissä näkyy heti uusi viite. Esimerkki: kaava `unet * 2`, palikan viite vaihdetaan `yo`:ksi → kaava näkyy muodossa `yo * 2` ja antaa saman tuloksen.

Sama koskee Tietotaulukon sarakkeita: sarakkeen nimen vaihto ei riko kaavoja (`ostokset.eka.määrä`). Poikkeus: `tapahtuma.rivi.<sarake>` etsii sarakkeen viitteellä, joten sarakkeen viitteen vaihto antaa siinä virheen, joka korjataan käsin.

### Viite, jota ei vielä ole

Voit kirjoittaa kaavaan viitteen ennen kuin palikka on olemassa. Kaava näyttää virheen `⚠ puuttuu: unet`, ja logiikan Kaava-palikassa sana näkyy punaisena. Kun teet palikan, jonka viite on `unet`, kaava löytää sen itse ja alkaa toimia. (Teknisesti: tallentuu muodossa `{?unet}`.)

Sama pätee teksteihin: `{Unet}` tekstissä löytyy, kun samanniminen palikka tehdään. Siihen asti teksti näyttää `{Unet}` sellaisenaan, ja paneelissa kentän alla lukee `⚠ Nimeä {Unet} ei löydy.`

### Palikan poisto ja vaikutuslista

Kun poistat palikan (paneelin **Poista palikka** / **Poista**), jota käytetään muualla, appi kysyy ensin:

- Ikkuna **Poistetaanko?**: *”Uni” käytetään 3 kohdassa*, ja taulukko sarakkein **Palikka**, **Missä** (esim. *Näkymä: Koti*, *Logiikka*, *Ketju: Aamu*) ja **Käyttö**. Monta palikkaa poistettaessa lisäksi sarake **Poistuva**.
- Käyttö-sarakkeen sanat: *kaavassa*, *tekstissä*, *näkyvyys*, *harmaana*, *vaihtoväri*, *arvona*, *toiminnon kohde*, *ketjun ehto*, *kaaviossa*, *kalenterissa*, *antaa arvon*, *nuoli poistuu*.
- Napit **Peru** ja **Poista silti**. Rivin napautus perii poiston ja vie siihen palikkaan.
- Jos palikkaa ei käytetä missään, se poistuu heti ilman kysymystä.
- **Kumoa** palauttaa poistetun palikan samalla tunnisteella, jolloin kaikki viittaukset toimivat taas.

### Katkennut viite ja Viitevirheet

Poiston jälkeen viittaukset eivät katoa, vaan ne muistavat poistetun kohteen:

- Kaavassa poistettu viite näkyy muodossa `⚠uni` (logiikan palikassa punaisena) ja kaavan tulos on `⚠ kohde poistettu: uni`.
- Tekstissä kohta näyttää virheen `⚠ kohde poistettu: uni`.
- Yläpalkin **☰ Palikat** -napissa näkyy merkki **⚠ n** (montako katkennutta viittausta).
- Palikat-listan ylimpänä on osio **⚠ Viitevirheet (n)** sarakkein Palikka, Missä, Käyttö, Virhe (*⚠ Kohde poistettu: uni*). Rivin napautus vie palikkaan.
- Viittaavan palikan paneelissa on osio **⚠ Viitevirheet**: *⚠ Kohde poistettu: `uni`* (käytöt suluissa) ja valikko **Valitse uusi kohde…**. Kun valitset uuden kohteen, kaikki tämän palikan viittaukset poistettuun korjautuvat siihen (ilmoitus *Viittaus korjattu: …*).

**Tärkeää:** samanniminen uusi palikka ei peri poistettua. Jos poistat palikan *Uni* ja teet uuden *Uni*-palikan (viite `uni`), vanhat kaavat näyttävät yhä `⚠uni`. Korjaa joko valitsemalla uusi kohde Viitevirheistä tai kirjoittamalla kaavaan viite uudelleen (poista `⚠`-merkki ja kirjoita `uni`).

Jos muokkaat kaavaa, jossa on `⚠uni`, ja jätät merkinnän paikalleen, kaava säilyttää viittauksen poistettuun kohteeseen (Kumoa palauttaa sen yhä).

---

## Kaava (`kaava`)

Kaava-palikka laskee yhden arvon lausekkeesta. Tulos voi olla luku, teksti, kyllä/ei tai päivämäärä. Tulos päivittyy heti, kun jokin sen lähteistä muuttuu.

- **Löytyy:** Logiikka-välilehden paletti, ryhmä **Kaava** → **Kaava** (ƒ). Vedä logiikan kanvaasille tai napauta. Kaavan saa myös suoraan näkymäpalikan paneelista napeilla **ƒ Teksti kaavasta**, **ƒ Näkyy, kun kaava pätee** (tai **ƒ Lisää ehto kaavana**), **ƒ Harmaana, kun kaava pätee**, ehtopalikoiden **ƒ Ehto kaavasta** ja Ominaisuudet-osion **ƒ**-napista: appi tekee Kaava-palikan, vetää nuolen oikeaan kohtaan ja avaa kaavan kirjoitettavaksi. Paneelin yläosassa on silloin paluunappi **‹ Palikan nimi**.
- **Sisään:** ei kohtia. Arvot tulevat kaavaan kirjoitetuista viitteistä.
- **Ulos:** **tulos** (arvo).
- **Ominaisuudet:** `arvo` (sama kuin tulos).
- **Kaavassa:** `kaava` = tulos. Kaavaa voi käyttää toisessa kaavassa sen viitteellä.

### Kaavan kirjoittaminen

**Paneelissa (tietokone ja puhelin):**

1. Valitse Kaava-palikka. Paneelin osiossa **Kaava** on kirjoituskenttä (vihje *esim. uni > 7*).
2. Kirjoita kaava. Kentän alla näkyy heti tulos: **Nyt: kyllä, pätee**, **Nyt: ei päde**, **Nyt: 14** tai punainen virhe `⚠ kaava: …`. Tyhjä kenttä: *Tyhjä kaava.*
3. Kentän alla on **ehdotusrivi** (ks. alla) ja napit **＋ Viite** ja **＋ Ominaisuus**.
4. Enter ei tee uutta riviä vaan päättää kirjoituksen. Muutos tallentuu kirjoittaessa.

**Suoraan logiikan palikkaan:**

- Tietokone: kaksoisnapsauta Kaava-palikkaa logiikassa, tai napsauta jo valittua Kaava-palikkaa.
- Puhelin: kaksoisnapauta Kaava-palikkaa, tai napauta jo valittua.
- Palikan kohdalle aukeaa kirjoituskenttä, ehdotusrivi ja tulos. Alla lukee *Enter tallentaa · Esc peruu*. Napautus muualle tallentaa. Esc peruu koko muokkauksen (yksi Kumoa-askel).
- Ei toimi ketjun sisällä olevalle Kaavalle: sitä muokataan paneelissa.

**Kaava venyy:** valitun Kaavan oikeassa alakulmassa on venytyskulma. Vedä sitä, niin pitkä kaava näkyy kokonaan rivitettynä. Kaksoisnapautus kulmaan palauttaa koon.

### Vie tulos jatkuvasti

Paneelin osio **Vie tulos jatkuvasti**:

- Lista palikoista, joihin tulos jo menee (napautus vie palikkaan).
- **Vie tulos näkymän palikkaan…** → valikko *Mihin palikkaan?* → valitse palikka → *Nimi: mihin kohtaan?* → valitse kohta (esim. *näkyy kun*, *harmaana kun*, *teksti*). Appi vetää nuolen ja ilmoittaa *Tulos viety: …*.
- Logiikassa voit myös raahata Kaava-palikan toisen palikan päälle: valikko *Vie tulos: Nimi* luettelee kohdat, joihin arvon voi viedä, ja viimeisenä *Ei mitään, vain siirto*.

Tulos ohjaa kohdetta niin kauan kuin kaava pätee.

### Kun tulos alkaa päteä (kerran)

Osio **Kun tulos alkaa päteä (kerran)** ja valikko **＋ Lisää toiminto…**: toiminto tehdään kerran, kun kaava alkaa päteä (esim. Valitse kytkin). Käyttäjä voi muuttaa kohdetta sen jälkeen, eikä kaava pakota sitä takaisin. Uudelleen vasta, kun kaava on välillä lakannut päteä.

---

## Kaavan syntaksi

### Yleiset säännöt

- **Välilyönnit** saa jättää pois tai lisätä vapaasti (`uni>7` = `uni > 7`), paitsi viitteen ja pisteen väliin (`uni .näkyy` on virhe).
- **Kirjainkoko:** viitteet, avainsanat ja funktiot eivät välitä kirjainkoosta (`Uni`, `JOS(`, `Tänään` käyvät).
- **Alun `=`** ohitetaan (taulukkolaskennan tapa): `= 10 / 4` antaa 2,5.
- **Sana ilman lainausmerkkejä on aina viite** (tai avainsana). `kissa` ilman lainausmerkkejä → `⚠ puuttuu: kissa`. Teksti kirjoitetaan lainausmerkkeihin: `"kissa"`.
- **Nimi aaltosulkeissa:** `{Uni 2}` löytää palikan nimellä tai viitteellä, joten välilyönnillinen nimi käy aaltosulkeissa. Tallennettaessa se muuttuu viitteeksi (`uni2`).
- **Ääkköset ilman pisteitä** käyvät avainsanoissa: `tanaan`, `kylla`, `tyhja`, `sisaltaa`, `nakyma`, ja ominaisuuksissa (`nakyy`, `vari`).

### Luvut

| Kirjoitat | Tulkinta |
|---|---|
| `7` | luku 7 |
| `7,5` | 7,5 (pilkku on desimaalimerkki) |
| `7.5` | 7,5 (myös piste käy) |
| `1 000` | virhe: tuhaterotinta ei voi käyttää |
| `.5` | virhe `tuntematon merkki ”.”`: kirjoita `0,5` |
| `-3` tai `−3` | miinusmerkki eteen |
| `1.5.` | päivämäärä 1.5. (piste lopussa!), ks. Päivämäärät |

Tulos näytetään suomalaisittain pilkulla ja enintään kahdella desimaalilla (`1 / 3` → `0,33`), mutta laskussa käytetään tarkkaa arvoa (`10 / 3 * 3` → `10`). Negatiivinen luku näytetään merkillä `−`.

### Teksti

- Lainausmerkeissä: `"Hyvää huomenta"`. Kelpaavat `"` ja kaarevat `”` `“` (puhelimen näppäimistö).
- Lainausmerkkiä ei voi kirjoittaa tekstin sisään.
- Lainausmerkki, joka jää auki → `⚠ kaava: lainausmerkki jäi auki`.
- Teksti, joka näyttää luvulta, lasketaan lukuna: `"3" + "4"` = 7, `"10,5" + 1` = 11,5, `"5" = 5` = kyllä.

### Totuusarvot

- `kyllä` ja `ei` ovat avainsanoja (ei lainausmerkkejä). Tulos näytetään *kyllä* / *ei*.
- Laskussa kyllä = 1 ja ei = 0: `kyllä + 1` = 2, `kyllä = 1` = kyllä.
- Ei ole sanoja *tosi* tai *epätosi*.

**Mikä pätee?** Kun arvoa käytetään ehtona (jos, ja, tai, näkyy kun, ikkuna):

| Pätee (kyllä) | Ei päde (ei) |
|---|---|
| `kyllä` | `ei` |
| luku, joka ei ole 0 | 0 |
| ei-tyhjä teksti, **myös teksti `"ei"`** | tyhjä teksti `""` |
| päivämäärä | tyhjä (`tyhjä`, ei arvoa) |
| rivi | puuttuva taulukkotieto |
| | virhe |

### Laskutoimitukset

| Merkki | Merkitys | Esimerkki | Tulos |
|---|---|---|---|
| `+` | yhteenlasku tai tekstin yhdistäminen | `1 + 2` | 3 |
| `-` `−` | vähennys | `2 - 5` | −3 |
| `*` `×` | kertolasku | `3 × 4` | 12 |
| `/` `÷` `:` | jakolasku | `10 : 4` | 2,5 |

Potenssia, jakojäännöstä ja pyöristystä ei ole.

**Laskujärjestys:**

1. Etumerkki `-` (koskee heti seuraavaa arvoa): `-uni + 10` = (−uni) + 10. `2 * -3` = −6, `5 - -5` = 10.
2. Kerto- ja jakolasku vasemmalta oikealle: `10 / 2 / 5` = 1.
3. Yhteen- ja vähennyslasku vasemmalta oikealle: `1 - 2 - 3` = −4, `1 + 2 * 3` = 7.
4. Vertailu viimeisenä: `uni > 5 + 1` tarkoittaa uni > 6.

**Sulkuja ei voi käyttää laskujen ryhmittelyyn.** `(1 + 2) * 3` → `⚠ kaava: sulkuja ei käytetä kaavassa muuten kuin jos(…), ja(…) ja tai(…): laita osat ikkunaan`. Jos laskujärjestys pitää muuttaa, tee osasta oma Kaava ja viittaa siihen: Kaava *osa* = `1 + 2`, toinen kaava `osa * 3`.

### Vertailut

| Kirjoitat | Merkitys |
|---|---|
| `=` tai `==` | on yhtä kuin |
| `!=`, `<>` tai `≠` | ei ole yhtä kuin |
| `<` | pienempi kuin |
| `<=` tai `≤` | enintään |
| `>` | suurempi kuin |
| `>=` tai `≥` | vähintään |
| `sisältää` | tekstihaku (ks. alla) |

**Eivät kelpaa:** `=>` ja `=<` (virhe `odotettiin arvoa, ei merkkiä`). Kirjoita `>=` ja `<=`.

**Yksi vertailu kerrallaan.** `1 < uni < 8` ja `uni > 5 = kyllä` antavat virheen `vain yksi vertailu kerrallaan: yhdistä ja(…; …) tai tai(…; …), tai laita loput ikkunaan`. Kirjoita `ja(uni > 1; uni < 8)`. Jokaisen funktion osan sisällä saa olla oma vertailunsa.

**Miten arvoja verrataan:**

- Luvut lukuina: `10 < 9` = ei, myös `"10" < "9"` = ei (lukua muistuttava teksti on luku).
- Tekstit kirjainkoosta ja reunojen välilyönneistä välittämättä, aakkosjärjestyksessä: `"Kissa" = "kissa"` = kyllä, `"b" > "a"` = kyllä.
- Luku ja teksti tekstinä: `5 > "abc"` = ei.
- Päivämäärät ajassa: `tänään < 1.11.` = kyllä. Päivämäärää verrattaessa tekstiin teksti tulkitaan päivämääräksi, jos se käy: `tänään = "17.10.2026"` = kyllä.
- Tyhjä: `tyhjä = tyhjä` = kyllä, `tyhjä = ""` = kyllä, `tyhjä = 0` = ei. Suuruusvertailu tyhjän kanssa ei koskaan päde: `tyhjä < 5` = ei.
- Rivit verrataan vain `=` ja `≠`: sama rivi vai ei.

### Tekstihaku: sisältää

`a sisältää b` pätee, kun teksti a sisältää tekstin b.

- Kirjainkoosta ei välitetä: `nimi sisältää "MEI"` pätee nimelle *Maija Meikäläinen*.
- Tyhjä haku pätee aina: `nimi sisältää ""` = kyllä. Tämä on tarkoituksellista: tyhjä hakukenttä näyttää kaiken.
- Tyhjä tai puuttuva teksti ei sisällä mitään: `tyhjä sisältää "a"` = ei.
- Luvut käsitellään tekstinä: `uni sisältää 6` = kyllä, kun uni on 6.
- Kirjoitusasu `sisaltaa` käy.
- *Ei sisällä*: `jos(nimi sisältää "x"; ei; kyllä)`.
- `sisältää` on vertailu, joten samassa osassa ei voi olla toista vertailua.
- Sana `sisältää` on vertailu vain arvon jälkeen. Muualla se on tavallinen viite (`sisältää` yksinään → `⚠ puuttuu: sisältää`).
- Riveistä ei voi hakea: `⚠ sisältää etsii tekstistä, ei riveistä: hae sarakkeesta, esim. rivi.nimi sisältää haku`.

### Funktiot jos, ja, tai

Kaavassa on kolme funktiota. Osat erotetaan **puolipisteellä** `;`, koska pilkku on desimaalimerkki.

| Funktio | Merkitys | Esimerkki (uni = 6) | Tulos |
|---|---|---|---|
| `jos(ehto; kyllä-osa; muuten-osa)` | jos ehto pätee, kyllä-osa, muuten muuten-osa | `jos(uni > 5; "hyvä"; "huono")` | hyvä |
| `jos(ehto; kyllä-osa)` | muuten-osa puuttuu = tyhjä | `jos(uni > 7; "hyvä")` | – |
| `ja(ehto; ehto; …)` | pätee, kun kaikki pätevät | `ja(uni > 5; uni < 8)` | kyllä |
| `tai(ehto; ehto; …)` | pätee, kun yksikin pätee | `tai(uni > 7; uni < 2)` | ei |

- Funktion nimi ilman sulkuja on virhe: `jos uni > 5` → `funktion osat sulkuihin: jos(ehto; kyllä; muuten)`.
- Funktion nimen ja sulun väliin saa jättää välin: `jos (uni > 5; 1; 2)` käy.
- Sisäkkäinen jos käy: `jos(uni > 7; "levännyt"; jos(uni > 5; "ok"; "väsynyt"))`.
- Tyhjä osa on tyhjä arvo: `jos(uni > 5;; 2)` antaa tyhjän, kun ehto pätee. ja- ja tai-funktioissa tyhjät osat ohitetaan.
- `ja` ja `tai` ottavat yhden tai useamman osan: `ja(kyllä)` = kyllä, `tai(ei; ei; kyllä)` = kyllä.
- Funktion tuloksen saa verrata: `ja(uni > 5; uni < 8) = kyllä`.
- jos laskee vain valitun osan: laskuvirhe (esim. jako nollalla) valitsematta jääneessä osassa ei näy. Tuntematon nimi on kuitenkin virhe heti, osasta riippumatta: `jos(uni > 7; "hyvä"; unii)` → `⚠ puuttuu: unii`, vaikka ehto pätee. ja ja tai laskevat kaikki osat, joten virhe missä tahansa osassa näkyy.
- Puuttuva tai virheellinen ehto ei päde: jos valitsee muuten-osan (virheellinen ehto antaa virheen).
- **Ei muita funktioita.** Ei esimerkiksi summa(), pyöristä(), pituus() tai ei(). Monen arvon yhdistäminen tehdään ikkunoilla (SUMMA, KESKIARVO …), tekstin pituus ominaisuudella (`nimi.pituus`), ja *ei* kirjoitetaan `jos(ehto; ei; kyllä)` tai vertailulla `ehto = ei`.

Funktioiden virheet:

- `jos tarvitsee ehdon ja kyllä-osan: jos(ehto; kyllä; muuten), muuten-osa on valinnainen`
- `jos-funktiossa on enintään kolme osaa: jos(ehto; kyllä; muuten)`
- `jos: ehto puuttuu`
- `ja tarvitsee ehdot: ja(ehto; ehto)` (samoin tai)
- `erota osat puolipisteellä, esim. jos(uni > 7; "hyvä"; "huono"): pilkku on desimaalimerkki`
- `puolipiste erottaa funktion osat: jos(ehto; kyllä; muuten)` (puolipiste funktion ulkopuolella)
- `sulku jäi auki: lisää loppuun )`
- `sulku ) ilman avaavaa jos(, ja( tai tai(`
- `odotettiin puolipistettä tai sulkua )`

### Päivämäärät

| Kirjoitat | Merkitys |
|---|---|
| `24.12.2026` | päivämäärä |
| `24.12.26` | 24.12.2026 (kaksinumeroinen vuosi = 20xx) |
| `24.12.` | tämän vuoden 24.12. (**piste lopussa pakollinen**) |
| `tänään` (`tanaan`) | tämä päivä |
| `huomenna` | huominen |
| `eilen` | eilinen |

- Kaavassa ei voi kirjoittaa päivämäärää muodossa `2026-05-01`: se on lasku 2026 − 5 − 1 = 2020.
- Mahdoton päivä on virhe: `31.2.2026` → `⚠ kaava: ”31.2.2026” ei ole päivämäärä`.

Laskut päivämäärillä:

| Kaava | Tulos | Selitys |
|---|---|---|
| `tänään + 5` | 22.10.2026 | päiviä eteenpäin |
| `tänään - 3` | 14.10.2026 | päiviä taaksepäin |
| `24.12.2026 - tänään` | 68 | päiviä väliin (luku) |
| `tänään + tänään` | virhe | `kahta päivämäärää ei voi laskea yhteen` |
| `5 - tänään` | virhe | `luvusta ei voi vähentää päivämäärää` |
| `tänään * 2` | virhe | `päivämäärää ei voi kertoa tai jakaa` |

Päivämäärä näytetään muodossa 17.10.2026 tai 17.10.26 asetuksen mukaan (yläpalkin asetukset, osio **Päivämäärät**, kohta **Muoto**).

Päivämäärän osat (viikko, viikonpäivä, kuukausi …) saa Päivämäärä-kentän ominaisuuksina (`synt.viikko`) tai Päivämäärän osa -palikalla. `tänään.päivä` ei toimi (`tuntematon merkki ”.”`): avainsanoilla ei ole ominaisuuksia, paitsi alla luetelluilla ympäristön sanoilla.

### Ympäristön sanat: nyt, ruutu, näkymä, tumma

| Kirjoitat | Tulos | Laji |
|---|---|---|
| `nyt` tai `nyt.kello` | kellonaika tekstinä, esim. `9.30` | teksti |
| `nyt.tunti` | 0–23 | luku |
| `nyt.minuutti` | 0–59 | luku |
| `nyt.sekunti` | 0–59 | luku |
| `ruutu.leveys` | ruudun leveys pikseleinä | luku |
| `ruutu.korkeus` | ruudun korkeus pikseleinä | luku |
| `näkymä` tai `näkymä.nimi` | auki olevan näkymän nimi | teksti |
| `näkymä.numero` | auki olevan näkymän numero | luku |
| `tumma` | onko tumma teema käytössä | kyllä/ei |

Väärät muodot antavat virheen, joka luettelee oikeat: `nyt.x ei ole käytössä (nyt.kello, nyt.tunti, nyt.minuutti, nyt.sekunti)`, `ruutu: käytössä ruutu.leveys ja ruutu.korkeus`, `näkymä.x: käytössä näkymä ja näkymä.numero`, `tumma on kyllä/ei ilman ominaisuutta`.

`nyt` on kellonaika tekstinä (`9.30`), ei laskettava aika. Tunteja ja minuutteja vertaa luvuilla: `nyt.tunti >= 18`.

(Huom. Tietotaulukon *Lisää rivi* -toiminnon kentissä `nyt` tallentaa ajankohdan. Ei tarkistettu tässä luvussa tarkemmin.)

### Tilasanat

`näkyy`, `harmaa`, `luettava` ja `piilossa` ovat avainsanoja, joiden arvo on sama sana tekstinä. Niitä käytetään tilan vertailuun: `nappi.tila = harmaa`. Myös `nappi.tila = "harmaa"` käy.

### Tekstin yhdistäminen

`+` yhdistää, kun jompikumpi puoli on teksti, joka ei näytä luvulta:

| Kaava | Tulos |
|---|---|
| `"Unta " + uni + " h"` | Unta 6 h |
| `"a" + 1 + 2` | a12 (vasemmalta oikealle: "a"+1 = "a1") |
| `1 + 2 + "a"` | 3a (1+2 lasketaan ensin) |
| `"" + 1 + 2` | 3 (tyhjä teksti ei pakota tekstiksi) |
| `kyllä + " x"` | kyllä x |
| `"3" + "4"` | 7 (lukua muistuttavat tekstit lasketaan) |

Luvut yhdistyvät suomalaisessa muodossa (2,5), kyllä/ei sanoina.

**Rajoitus:** päivämäärää ei voi yhdistää tekstiin `+`-merkillä. `"Tänään on " + tänään` antaa pelkän päivämäärän 17.10.2026 ilman tekstiä, koska `+` päivämäärän kanssa tarkoittaa päivien lisäämistä. Kiertotie: kirjoita teksti näkymäpalikan tekstiin ja viittaa Tänään-palikkaan: `Tänään on {päivä}` (ks. Tekstiin upotetut viitteet).

### Tyhjä ja puuttuva arvo

Kaavassa on kaksi eri "ei arvoa" -tilaa:

**Tyhjä** (`tyhjä`, tyhjä kenttä, kirjoittamaton teksti, `jos` ilman muuten-osaa):

- Näytetään `–`.
- Laskussa kuin 0: `tyhjä + 5` = 5. Tekstiin yhdistettäessä kuin tyhjä teksti: `tyhjä + "x"` = x.
- `tyhjä = tyhjä` ja `tyhjä = ""` pätevät, `tyhjä = 0` ei. Suuruusvertailu (`<`, `>` …) ei päde.
- Ehtona ei päde.

**Puuttuva** (Tietotaulukon tyhjä kenttä, valitsematon rivi, tyhjän taulukon `eka`):

- Näytetään `–`.
- Lasku sen kanssa on tuntematon: `ostokset.eka.määrä + 1` = –.
- `= tyhjä` pätee: `ostokset.eka.määrä = tyhjä` = kyllä. `≠` vastaavasti.
- Suuruusvertailu on tuntematon (`–`), ja ehtona tuntematon ei päde: `jos(ostokset.eka.määrä > 0; "on"; "ei")` = ei.
- `.tiedossa` kertoo, onko arvo olemassa: `ostokset.eka.määrä.tiedossa` = ei.

Tarkemmin taulukoiden puuttuvasta tiedosta Tietotaulukon luvussa.

### Virheet

Virhe on oma arvonsa: se ei muutu hiljaa nollaksi tai epätodeksi, vaan näkyy palikassa punaisena merkillä `⚠`. Virhe kulkee eteenpäin: jos kaava käyttää virheellistä arvoa, sekin näyttää saman virheen. Kirjoitusvirheet alkavat sanalla `kaava:`.

Kirjoitusvirheet (kaavaa ei voi lukea):

| Virhe | Esimerkki | Korjaus |
|---|---|---|
| `tuntematon merkki ”@”` | `@`, `.5`, `uni .näkyy` | poista merkki; `0,5`; `uni.näkyy` |
| `lainausmerkki jäi auki` | `"abc` | `"abc"` |
| `kaava jäi kesken` | `5 +` | lisää arvo |
| `odotettiin arvoa, ei merkkiä` | `+ 5`, `uni => 5` | `5`, `uni >= 5` |
| `ylimääräistä kaavan lopussa` | `5 5`, `1 000`, `"a" "b"` | lisää laskumerkki |
| `sulkuja ei käytetä kaavassa muuten kuin jos(…), ja(…) ja tai(…): laita osat ikkunaan` | `(1 + 2)` | tee välikaava |
| `vain yksi vertailu kerrallaan: …` | `1 < 2 < 3` | `ja(1 < 2; 2 < 3)` |
| `funktion osa jäi tyhjäksi` | | täytä osa |
| `”31.2.2026” ei ole päivämäärä` | `31.2.2026` | oikea päivä |
| funktiovirheet | ks. Funktiot | |

Laskuvirheet (kaava luettiin, mutta arvoa ei voi laskea):

| Virhe | Syy |
|---|---|
| `puuttuu: kissa` | sanaa ei tunneta viitteeksi (unohtuivatko lainausmerkit?); näkyy heti, myös jos-funktion valitsematta jääneessä osassa |
| `Ryhmä ei ole arvo` | vanhan projektin kaava tai teksti osoittaa Ryhmään; kirjoita oikean palikan viite |
| `kohde poistettu: uni` | viitattu palikka on poistettu |
| `jako nollalla` | `uni / 0` |
| `”x” ei ole luku` | `"x" * 2` |
| `tuntematon ominaisuus .foo (palikalla ”Uni” on: arvo, näkyy, …)` | väärä ominaisuuden nimi; virhe luettelee oikeat |
| `.näkyy on vain näkymän palikoilla` | logiikkapalikalla ei ole näkymän ominaisuuksia |
| `riviä ei voi laskea: valitse sarake, esim. taulukko.valittu.määrä` | rivi laskussa |
| `rivejä ei voi verrata suuruuden mukaan` | rivi `<`-vertailussa |
| `kehä: arvo riippuu itsestään` | kaava viittaa itseensä, suoraan tai kierroksen kautta |
| `kehä: kaava lukee palikkaa, jota se itse ohjaa` | esim. kaava lukee `nappi.näkyy` ja ohjaa saman napin näkyvyyttä |
| `”summa” saa arvonsa jo kaavasta ”Kaava”` | toinen kaava yrittää antaa saman Kaavan tuloksen |

---

## Kaava `tulos = …` ja Kaavan tulos ✦ (`tulos`)

Kaava voi antaa arvonsa nimetylle **Kaavan tulos** -palikalle: kaava `summa = uni + 1` laskee `uni + 1` ja vie arvon palikalle, jonka viite on `summa`. Tulosta käytetään sen jälkeen kuin mitä tahansa arvoa: muissa kaavoissa (`summa * 2`), teksteissä (`{summa}`), ikkunoissa ja nuolilla.

✦ Erikoispalikka: saa arvonsa vain kaavasta `tulos = …`, ei nuolesta eikä kentästä.

- **Löytyy:** Logiikka-välilehden paletti, ryhmä **Kaava** → **Kaavan tulos** (⇐).
- **Sisään:** ei kohtia.
- **Ulos:** **arvo**.
- **Asetukset (paneeli):** osio **Kaavan tulos**: *Arvo tulee kaavasta:* ja nappi, joka näyttää kaavan (napautus vie kaavaan). Jos kaavaa ei ole: *Mikään kaava ei vielä anna arvoa.* ja nappi **ƒ Kirjoita kaava tälle**, joka tekee uuden Kaavan valmiiksi kirjoitetulla alulla `summa = `.
- **Ominaisuudet:** `arvo`.
- **Kaavassa:** `summa` = kaavan antama arvo. Ilman kaavaa tyhjä (`–`).

### Säännöt

- **Yksi `=` vasemmalla olevan viitteen jälkeen** antaa arvon, mutta vain jos vasemmalla on pelkkä viite (ei ominaisuutta) ja se on Kaavan tulos -palikka.
- **`==` vertaa aina:** `summa == 7` = kyllä tai ei.
- Jos vasemmalla on muu palikka, `=` on vertailu: `uni = 7` antaa kyllä tai ei. Paneeli kertoo: *Uni ei ole kaavan tulos, joten = vertaa ja tulos on kyllä tai ei. Arvon voi antaa vain Kaavan tulos -palikalle.*
- `summa.arvo = 5` on aina vertailu.
- **Vain yksi kaava voi antaa arvon.** Ensin tehty kaava voittaa. Myöhempi kaava näyttää virheen `⚠ ”summa” saa arvonsa jo kaavasta ”Kaava”`, ja Kaavan tuloksen paneelissa lukee *Myös ”Kaava 2” yrittää antaa arvon. Ensin tehty kaava voittaa.*
- Oikealla puolella saa olla mikä tahansa kaava, myös jos: `arvio = jos(uni > 7; "levännyt"; "väsynyt")`.
- Kaavan oma tulos on sama arvo, ja paneelissa näkyy **Antaa arvon:** ja nappi ⇐ Summa.

### Tuloksen luonti kaavasta

Jos kirjoitat `summa = uni + 1` eikä viitettä `summa` vielä ole, kaava näyttää `⚠ puuttuu: summa`, ja tuloksen alla on nappi **＋ Luo kaavan tulos ”summa”**. Napautus tekee Kaavan tulos -palikan (nimi *Summa*, viite `summa`) logiikkaan kaavan viereen ja kaava alkaa toimia (ilmoitus *Kaavan tulos ”summa” luotiin.*).

---

## Ominaisuusviitteet `viite.ominaisuus`

Palikan arvon lisäksi kaava voi lukea palikan **ominaisuuksia** pisteellä: `nappi.näkyy`, `otsikko.teksti`, `uni.pienin`, `lista.rivejä`.

- Ominaisuuden voi kirjoittaa sen nimellä (`uni.pienin`) tai sisäisellä avaimella (`uni.min`); molemmat toimivat. Myös ääkköset ilman pisteitä (`uni.nakyy`).
- Ilman pistettä viite antaa palikan arvon: `uni` = `uni.arvo`.
- Väärä nimi antaa virheen, joka luettelee palikan kaikki ominaisuudet: `tuntematon ominaisuus .foo (palikalla ”Uni” on: arvo, näkyy, tila, …)`.
- Polku voi olla monta osaa taulukoissa: `ostokset.valittu.nimi`, `ostokset.määrä.summa`, `ostokset.vika.määrä.tiedossa`.
- Valintaominaisuudet palauttavat sisäisen arvon: `otsikko.koko` = `m`, `otsikko.tasaus` = `left`. Vertaa koko kirjaimella (`otsikko.koko = "M"` pätee, kirjainkoolla ei väliä), mutta tasausta ei suomeksi (`otsikko.tasaus = "vasen"` ei päde). Ks. Havainnot.

### Ominaisuusrekisteri

Jokainen palikkalaji kertoo ominaisuutensa yhdessä paikassa (rekisteri, teknisesti `omat(b)`). Samasta luettelosta syntyvät:

- kaavan `viite.ominaisuus`,
- paneelin **Ominaisuudet**-osio,
- ohjattavien ominaisuuksien kohdat logiikassa,
- toimintojen **Aseta arvo**, **Lisää**, **Aseta tila**, **Vaihda** ja **Palauta perusarvo** kohdevalinta *Mitä muutetaan* / *Mikä palautetaan*,
- virheilmoitusten luettelo palikan ominaisuuksista.

Ominaisuus on joko **vain luettava** (lasketaan palikan tilasta, esim. `nimi.pituus`) tai **ohjattava** (arvo voi tulla kaavasta, nuolesta tai toiminnosta, esim. `otsikko.väri`).

### Yleiset ominaisuudet

**Kaikilla palikoilla, joilla on arvo ulos:** `arvo` (luettava) = palikan arvo.

**Kaikilla logiikan palikoilla, joilla on Käytössä-valinta** (JOS, KUN, Ikkuna, Ketju, Ajastin, Ehto, Odota kunnes, Arpa, Toista, Ketjun tulos, Lopeta ketju, Monta haaraa, efektit, Toiminto): `käytössä` (ohjattava, kyllä/ei).

**Näkymän palikoilla** (Painike, Valintaruutu, Kytkin, Säädin, Tekstikenttä, Lukukenttä, Tatti, Päivämäärä, Teksti, Ilmoitus, Lista, Aikajana, Kaavio, Monitori, Kuva, Kalenteri, Muoto, Reitti, Toistin):

| Ominaisuus | Muut kirjoitusasut | Laji | Luettava / ohjattava | Merkitys |
|---|---|---|---|---|
| `näkyy` | `nakyy` | kyllä/ei | luettava | näkyykö palikka nyt |
| `tila` | | teksti | luettava | näkyy, luettava, harmaa tai piilossa |
| `teksti` | | teksti | luettava | näkyvä teksti (otsikko, painikkeen teksti) |
| `vaihtoväri` | `vaihtovari` | kyllä/ei | luettava | onko vaihtoväri käytössä |
| `x`, `y` | | luku | ohjattava | paikka (px) |
| `leveys`, `korkeus` | `w`, `h` | luku | ohjattava | koko (px), vähintään 8 |
| `väri` | `vari` | luku | ohjattava | väri paletista 1–8 |
| `väri2` | `vari2` | luku | ohjattava | vaihtovärin sävy 1–8 |
| `läpinäkyvyys` | `lapinakyvyys`, `lpn` | luku | ohjattava | 0 = näkyy kokonaan, 100 = ei näy |
| `järjestys` | `jarjestys`, `z` | luku | ohjattava | suurempi on päällä saman kerroksen sisällä |
| `rullausvauhti` | `rv` | luku | ohjattava | 0–100, laitenäkymässä |
| `kierto` | `kulma` | luku | ohjattava | asteina myötäpäivään |
| `peilattu` | `peili` | kyllä/ei | ohjattava | peilattu vaakasuunnassa |
| `este` | | kyllä/ei | ohjattava | liikkuvat palikat eivät mene läpi |
| `massa` | | luku | ohjattava | paino törmäyksissä (≥ 0) |
| `kimmoisuus` | | luku | ohjattava | 0–200 % |
| `ruutux`, `ruutuy` | | luku | luettava | keskipisteen ruutu kerroksen ruudukossa (1 = ensimmäinen) |

Kaaviolla, Monitorilla ja Kuvalla ei ole `arvo`-ominaisuutta (ne eivät anna arvoa ulos). Tekstikentän `teksti` on sen **otsikko**, ei kirjoitettu teksti: kirjoitettu teksti on `nimi` tai `nimi.arvo`.

### Lajikohtaiset ominaisuudet

Taulukossa *L* = vain luettava, *O* = ohjattava. Suluissa muut kirjoitusasut.

**Näkymän palikat (yleisten lisäksi):**

| Palikka | Ominaisuus | L/O | Merkitys |
|---|---|---|---|
| Painike | `painalluksia` | L | painallusten määrä (vain kun Toiminta on *Kertapainallus*) |
| Painike | `kesto` | L | painalluksen kesto sekunteina (vain kun *Pitkä painallus, irrotus ja painalluksen kesto* on valittu) |
| Säädin | `pienin` (`min`), `suurin` (`max`), `askel` (`step`), `alkuarvo` (`start`) | O | säätimen rajat, askel, alkuarvo |
| Lukukenttä | `alkuarvo`, `askel`, `pienin`, `suurin` | O | tyhjä raja = rajaton |
| Tekstikenttä | `vihje` (`ph`) | O | vihje tyhjässä kentässä |
| Tekstikenttä | `pituus` | L | merkkien määrä |
| Tekstikenttä | `tyhjä` (`tyhja`) | L | onko kenttä tyhjä |
| Tatti | `vaaka` (`x`), `pysty` (`y`) | L | −1…1 (oikealle ja alas +) |
| Tatti | `suunta` (`s`) | L | asteina, 0 = ylös |
| Tatti | `etäisyys` (`etaisyys`) | L | etäisyys keskeltä 0–1 |
| Päivämäärä | `viikko`, `viikonpäivä`, `päivä`, `kuukausi`, `vuosi` | L | päivämäärän osat (viikko ISO) |
| Päivämäärä | `päiviä` (`paivia`) | L | päiviä tästä päivästä (menneet miinuksella) |
| Teksti | `koko` | O | S, M, L, XL (myös 1–4) |
| Teksti | `lihavoitu` (`lih`) | O | kyllä/ei |
| Teksti | `tasaus` (`tas`) | O | vasen, keski, oikea (myös 1–3) |
| Muoto | `muoto` (`laji`) | O | laatikko, ympyrä, pilleri, lappu, kehys (myös 1–5) |
| Muoto | `koko`, `lihavoitu` | O | kuten Tekstillä |
| Lista | `rivejä` (`riveja`, `rivit`) | L | rivien määrä |
| Lista | `rastitettuja` | L | rastitettujen määrä |
| Lista | `kaikki` | L | kaikki rastitettu |
| Lista | `myöhässä` (`myohassa`) | L | rastittamattomia, joiden päivä on mennyt |
| Lista | `seuraava` | L | lähin tuleva päivämäärä rastittamattomista |
| Lista | `rivi1`, `rivi1.rastitettu`, `rivi1.pvm` | L | yksittäinen rivi numerolla (ylin = 1) |
| Aikajana | `merkintöjä` (`merkintoja`) | L | merkintöjen määrä |
| Aikajana | `viimeisin` | L | viimeisimmän merkinnän päivä |
| Aikajana | `tänään` (`tanaan`) | L | tänään kirjattuja |
| Aikajana | `viimeisin.teksti`, `viimeisin.aika` | L | viimeisimmän merkinnän teksti ja kellonaika |
| Kaavio | `asteikko` (`ymax`) | O | asteikon yläraja |
| Monitori | `arvo` | O | näytettävä luku |
| Monitori | `pienin`, `suurin` | O | asteikon alku ja loppu |
| Monitori | `muoto` | O | luku, palkki, pylväs, rengas, kaari, pisteet (1–6) |
| Monitori | `esitys` | O | luku, aika, prosentti (1–3) |
| Monitori | `paksuus` | O | 1–50 % |
| Kuva | `kuvanopeus` (`fps`) | O | kuvasarjan nopeus 0–60 |
| Kuva | `kuvanro` | L | monesko kuva näkyy (1 = pääkuva) |
| Kuva | `pyörii` (`pyorii`) | L | pyöriikö kuvasarja |
| Kalenteri | `kuukausi` (`kk`) | O | päivämäärä, jonka kuukausi näytetään |
| Kalenteri | `valittu` | L | käytössä napautettu päivä |
| Reitti | `pituus`, `pisteitä` (`pisteita`) | L | pituus pikseleinä, pisteiden määrä |

**Paikat (ei yleisiä näkymän ominaisuuksia):**

| Palikka | Ominaisuus | L/O | Merkitys |
|---|---|---|---|
| Sijainti | `x`, `y` | O | paikka |
| Alue | `sisällä` (`sisalla`) | L | onko tunnistettava sisällä (Alueella `arvo` puuttuu, tämä korvaa sen) |
| Alue | `montako` | L | montako tunnistettavaa sisällä |
| Alue | `napautettux`, `napautettuy` | L | viimeksi napautettu ruutu tai kohta |
| Alue | `ruutux`, `ruutuy` | L | tunnistettavan ruutu alueen sisällä (vain kun ruutuasetus on päällä) |
| Alue | `x`, `y`, `leveys`, `korkeus` | O | paikka ja koko |

**Logiikan palikat:**

| Palikka | Ominaisuus | L/O | Merkitys |
|---|---|---|---|
| Arvo, Muisti, Lasku, Vertailu, Kaava, Kaavan tulos, Tänään, Päivämäärän osa, VALITSE | `arvo` | L | vain arvo |
| Satunnaisluku | `min` (`pienin`), `max` (`suurin`) | L | välin päät |
| Satunnaisluku | `p1`, `p2` … | L | painot (vain muotoillulla jakaumalla) |
| Käyrä | `x`, `t` (`kohta`), `xmin` (`xalku`), `xmax` (`xloppu`), `ymin` (`yalku`), `ymax` (`yloppu`), `p1`… | L | syöte, kohta 0–1, välit, portaat |
| Muutos ajassa | `alku`, `loppu`, `kesto`, `kulunut` | L | |
| Muutos ajassa | `edistyminen`, `käynnissä` | L | 0–1; kyllä/ei |
| Sekuntikello | `kulunut`, `käy` (`kay`) | L | sekunteina; kyllä/ei |
| Kerros | `näkyy`, `estää` | O | kyllä/ei |
| Kerros | `himmennys`, `läpinäkyvyys` | O | 0–100 |
| Kamera | `zoomaus` | O | % (100 = laitteen ruutu) |
| Kamera | `leveys`, `korkeus` | L | näkyvän maailman koko |
| Liike | `x`, `y`, `liikkuu`, `osuu`, `nopeus`, `suunta` | L | |
| Liike | `kitka` | O | 0–100 % (ei ruutuliikkeessä) |
| Liike | `vauhtix`, `vauhtiy` | O | töytäisyvauhti px/s (ei ruutuliikkeessä) |
| Liike | `isku`, `törmäyskohde` | L | viimeisin törmäys (ei ruutuliikkeessä) |
| Hakutaulukko | `rivi` | L | osuneen rivin numero (0 = ei osunut) |
| Ikkuna | `raja` (`n`) | O | N (vain vähintään, enintään, täsmälleen) |
| Ikkuna | `pätee`, `jäseniä` | L | montako pätee, montako sisällä |
| Ikkuna (riveille) | `rivejä`, `havaintoja`, `puuttuvia` | L | |
| Ketju | `tulos`, `käynnissä` | L | (Ketjulla ei ole `arvo`-ominaisuutta) |
| Ketju | `lukitus` | O | 0, 1 tai 2 (muu luku on virhe) |
| Ketju | `lukitusnimi` | L | valitun lukitustilan nimi |
| Ajastin | `jäljellä`, `käynnissä`, `kesto` | L | sekunteina |
| Odota, kunnes | `aikaraja` (`raja`) | O | |
| Arpa | `viimeisin` | L | viimeksi arvottu (0 = ei vielä) |
| Toista | `kierros`, `kerrat` | L | `kerrat` vain kun ei riveille |
| Monta haaraa | `haara`, `haaranimi` | L | ensimmäinen pätevä haara (0 = muuten) |
| Toiminto (Siirry ilman kohdetta) | `x`, `y` | O | siirtymän kohta |
| Tietotaulukko | `rivejä` (`arvo`), `valittunro`, `valittu`, `eka` (`ensimmäinen`), `vika` (`viimeinen`) | L | |
| Tietotaulukko | `valittu.<sarake>`, `eka.<sarake>`, `vika.<sarake>` | L | rivin kenttä |
| Tietotaulukko | `<sarake>.summa`, `.keskiarvo`, `.suurin`, `.pienin`, `.havaintoja`, `.puuttuvia`, `.virheitä`, `.täydellinen` | L | sarakkeen koosteet |
| Tapahtuman tiedot | `uusi` (`arvo`), `vanha`, `rivi`, `lähde`, `aika`, `päivä`, `tunniste`, `kohde`, `x`, `y`, `ruutux`, `ruutuy`, `isku`, `on`, `taulukko`, `rivi.<sarake>` | L | |
| Rivi | `rivi` (`arvo`), `nro`, `on`, `<sarake>` | L | |
| Rivijoukko | `rivejä` (`arvo`), `eka`, `vika`, `eka.<sarake>`, `vika.<sarake>`, `<sarake>.summa` … | L | |
| Ryhmä | (ei ominaisuuksia) | | viittaus antaa tyhjän |

Satunnaisluvun, Käyrän, Ajastimen, Muutoksen ja Toistan asetuksia ohjataan sisäänmenon nuolella, ei Ominaisuudet-osiosta.

Taulukoiden, rivien ja tapahtumien polut kuvataan tarkemmin Tietotaulukon luvussa. Huom: oletusnimellä tehty Tapahtuman tiedot -palikka on *Tapahtuma*, joten sen viite on `tapahtuma` (`tapahtuma.uusi`, `tapahtuma.rivi.nimi`).

### Ominaisuudet-osio paneelissa

Jokaisen palikan paneelissa on kokoontaitettava osio **Ominaisuudet** (oletuksena kiinni; napauta otsikkoa). Otsikossa näkyy merkit **n ohjattu** ja **n asetettu**.

Jokainen rivi:

- **viite.ominaisuus** napina, esim. `otsikko.väri`. Napautus kopioi viitteen leikepöydälle (*Viite kopioitu: …*).
- nykyinen arvo (virhe `⚠`, tyhjä `–`).
- merkki **ƒ** = arvo tulee nyt kaavasta tai nuolesta, tai nappi **asetettu ↺** = toiminto on asettanut arvon (napautus palauttaa perusarvon).
- ohjattavilla toimintonapit:
  - **ƒ**: arvo kaavasta. Tekee uuden Kaava-palikan, joka ohjaa tätä ominaisuutta, ja avaa sen kirjoitettavaksi.
  - **⇢**: avaa ominaisuuden kohdan palikkaan logiikassa (ilmoitus *Kohta ”väri” on nyt palikassa logiikassa: vie siihen nuoli.*). Jos palikkaa ei vielä ole logiikassa, appi lisää sen.
  - **×**: sulkee avatun kohdan (vain kun siihen ei tule nuolta).

### Ominaisuuden ohjaus ja etusija

Ohjattavan ominaisuuden arvo määräytyy järjestyksessä:

1. **Ohjattu:** nuoli tai kaava ominaisuuden kohtaan voittaa aina.
2. **Toiminnon asettama:** Aseta arvo, Lisää, Aseta tila tai Vaihda, kun kohteena on ominaisuus. Pysyy, kunnes se palautetaan tai asetetaan uudelleen.
3. **Perusarvo:** paneelin asetus.

Tarkemmin:

- Ohjattu arvo rajataan ominaisuuden rajoihin: väri 99 → 8.
- Jos ohjaava kaava antaa tyhjän, käytetään perusarvoa (ei toiminnon asettamaa).
- Jos ohjaava kaava antaa väärän lajin (teksti väriin), ominaisuus näyttää virheen (`väri ei ole luku`) ja näkymä käyttää perusarvoa.
- Valintaominaisuuteen kelpaa nimi tai järjestysnumero: `koko` = `"L"` tai `3`.
- Kaava kuvaa tilaa (*näin on, kun logiikka pätee*); toiminto on tapahtuma (*tee tämä nyt*).
- Muokatessa näkymä näyttää perusarvot, käytössä nykyiset.
- Toiminnon asettama arvo on käyttötietoa, ei rakennetta.

### Toiminnot ominaisuuteen

Toiminto-palikan paneelissa, kun **Kohde** on palikka, jolla on ohjattavia ominaisuuksia:

- **Aseta arvo**: kenttä **Mitä muutetaan** (palikan arvo tai mikä tahansa ohjattava ominaisuus).
- **Lisää**: vain lukuominaisuudet. Negatiivinen määrä vähentää.
- **Aseta tila** ja **Vaihda**: vain kyllä/ei-ominaisuudet.
- **Palauta perusarvo**: kenttä **Mikä palautetaan**, oletus *kaikki ominaisuudet*. Poistaa toimintojen asettamat arvot, jolloin perusarvo (tai kaava, jos ominaisuus on ohjattu) on taas voimassa.

---

## Tekstiin upotetut viitteet

Näkymäpalikoiden teksteihin voi upottaa toisen palikan arvon aaltosulkeilla: `Unta {uni} h` näyttää *Unta 6 h*.

**Missä toimii:** kaikkien näkymäpalikoiden tekstikentät (Painikkeen teksti, Teksti, Otsikko, Ilmoituksen teksti …), Arvo-palikan arvo, Hakutaulukon tulokset ja Muuten-kenttä, Monta haaraa -rivit, toimintojen *Kirjaa aikajanalle*, *Lisää riviksi listaan* ja *Näytä ilmoitus* tekstit sekä Teksti ilmestyy -efekti.

**Miten kirjoitetaan:**

- `{Nimi}`: palikan nimi, myös välilyönnein (`{Uni 2}`).
- `{viite}`: palikan viite (`{uni2}`).
- `{viite.ominaisuus}`: ominaisuus kuten kaavassa (`{otsikko.näkyy}`, `{lista.rivejä}`, `{ostokset.vika.nimi}`).

**Napilla:**

1. Valitse palikka, jonka tekstiä muokkaat. Napauta tekstikenttää kohtaan, johon arvo tulee.
2. Napauta kentän vieressä **＋ Viittaus**.
3. Valikko *Lisää arvo palikasta*: valitse palikka.
4. Jos palikalla on ominaisuuksia, valikko *Nimi: mitä näytetään?*: **Arvo** tai **.ominaisuus**.
5. Appi lisää `{Nimi}` tai `{viite.ominaisuus}` kursorin kohtaan.

**Säännöt:**

- Teksti tallentuu tunnisteilla, joten nimen ja viitteen vaihto ei riko sitä. Muokatessa kentässä näkyy `{Nimi}` (tai `{viite}`, jos nimi on jonkun toisen palikan viite).
- Tuntematon nimi jää tekstiin sellaisenaan (`{tuntematon}`), ja paneelissa lukee `⚠ Nimeä {tuntematon} ei löydy.` Kun samanniminen palikka tehdään, viittaus kytkeytyy.
- **Tekstissä toimivat vain palikat, eivät kaavan avainsanat:** `{tänään}` tai `{nyt}` ei näytä päivää. Tee Tänään-palikka (esim. nimi *Päivä*) ja kirjoita `Tänään on {päivä}`.
- **Laskuja ei voi kirjoittaa aaltosulkeisiin:** `{uni * 2}` ei laske. Tee Kaava ja viittaa siihen, tai tuo koko teksti kaavasta (**ƒ Teksti kaavasta**, esim. `"Unta " + uni + " h"`).
- Muotoilu: luku pilkulla ja enintään 2 desimaalilla, kyllä/ei sanoina, päivämäärä asetuksen muodossa, tyhjä `–`, virhe `⚠ …`.
- Poistettu kohde näkyy muokatessa `{⚠uni}` ja käytössä virheenä.

---

## Ehdotusrivi ja viitevalitsin

### Ehdotusrivi

Kaavaa kirjoitettaessa (paneelissa ja suoraan palikkaan) kentän alla on rivi ehdotusnappeja. Napautus lisää ehdotuksen ja korvaa jo kirjoitetun alun. Kirjoituskenttä pysyy aktiivisena.

Mitä ehdotetaan:

- **Viitteet:** kun kirjoitat sanaa, enintään 8 palikkaa, joiden viite alkaa kirjoitetulla tai joiden nimessä se esiintyy. Ensin viitteen alulla osuvat. Napissa viite ja pienellä palikan nimi. Kaava itse ja palikat ilman arvoa jäävät pois.
- **Ominaisuudet:** heti viitteen ja pisteen jälkeen (`uni.`) palikan ominaisuudet, joiden nimi alkaa kirjoitetulla, kuvauksineen. Myös `nyt.`, `ruutu.` ja `näkymä.` ehdottavat omat osansa.
- **Funktiot:** kahden kirjaimen jälkeen `jos(`, `ja(`, `tai(` (sulku mukaan) kuvauksineen.
- **sisältää:** kahden kirjaimen jälkeen (`si`), kun edellä on arvo.
- Lainausmerkkien sisällä ei ehdoteta mitään.

### Viitevalitsin: ＋ Viite ja ＋ Ominaisuus

Paneelin kaavakentän alla:

- **＋ Viite**: valikko *Lisää viite*, jossa kaikki palikat, joilla on arvo, muodossa `viite · Nimi` aakkosjärjestyksessä. Valinta lisää viitteen kursorin kohtaan.
- **＋ Ominaisuus**: jos kursorin edessä on viite (tai viite ja piste), valikko *Ominaisuus: Nimi* luettelee sen ominaisuudet (`.väri · väri paletista, 1–8`), ja valinta lisää pisteen ja nimen. Jos edessä on `nyt`, `ruutu` tai `näkymä`, niiden osat. Muuten yleinen valikko *Lisää viitteen perään*: `.arvo`, `.näkyy`, `.tila`, `.teksti`, `.vaihtoväri`.

Nämä napit ovat vain paneelissa, eivät suoraan palikkaan kirjoitettaessa (siellä on ehdotusrivi).

### Viitteet logiikassa katkoviivoina

Logiikan vasemmassa alakulmassa on nappi **Viitteet: valitulle** (napautus vaihtaa: *ei* → *valitulle* → *kaikille*). Kaavojen ja tekstien viitteet näkyvät himmeinä katkoviivanuolina palikasta toiseen. Ne ovat pelkkä näyttö: niitä ei voi valita eikä poistaa, ja ne eivät ole nuolia.

---

## Miksi?-selitys kaavalle

Kaava- ja Kaavan tulos -palikan paneelin alaosassa on osio **Miksi?**, joka kertoo, mistä arvo syntyy.

**Kaavalla:**

- Ensimmäinen rivi: *Kaava: uni > 7.* Virheen kanssa: *Kaava: … · virhe.* Tulos-kaavalla: *· antaa arvon palikalle ”Summa”* (ja jos toinen kaava omistaa tuloksen: *, mutta ensin tehty kaava ”Kaava” antaa jo arvon*). Tyhjä: *Kaava on tyhjä. Kirjoita esim. uni > 7.*
- Jokaisesta lasketusta jos-funktiosta: *Ehto ”uni > 7” pätee, joten jos valitsi kyllä-osan.* tai *… ei päde, joten jos valitsi muuten-osan.*
- Alla jokainen kaavan käyttämä palikka tai ominaisuus omalla rivillään: merkki ✓ (pätee), ✗ (ei päde), ⚠ (virhe) tai • (arvo), nimi ja nykyinen arvo. Ominaisuus näkyy muodossa *Otsikko .näkyy*. Rivin napautus vie palikkaan. Selitys menee neljä tasoa syvälle (kaavan lähteiden lähteet).

**Kaavan tuloksella:** *Arvo tulee kaavasta: summa = uni + 1.* ja kaava riveineen alla. Ilman kaavaa: *Mikään kaava ei vielä anna arvoa. Kirjoita kaavaan esim. summa = a + b.*

Rajoitus: Miksi? kertoo jos-funktion valinnan vain Kaava-palikalle.

---

## Pikaviite

Oletus: `uni` = 6 (Säädin), `nimi` = "Maija Meikäläinen" (Tekstikenttä), `otsikko` = Teksti-palikka, tänään 17.10.2026, kello 9.30.

### Arvot ja avainsanat

| Kirjoitus | Esimerkki | Tulos |
|---|---|---|
| luku | `7,5 + 1` | 8,5 |
| teksti | `"kissa"` | kissa |
| viite | `uni` | 6 |
| nimi aaltosulkeissa | `{Uni 2} + 1` | (Uni 2:n arvo + 1) |
| `kyllä` / `ei` | `kyllä + 1` | 2 |
| `tyhjä` | `tyhjä + 5` | 5 |
| `tänään` | `tänään` | 17.10.2026 |
| `huomenna` / `eilen` | `huomenna` | 18.10.2026 |
| päivämäärä | `24.12.` | 24.12.2026 |
| `nyt` | `nyt` | 9.30 |
| `nyt.tunti` / `.minuutti` / `.sekunti` | `nyt.tunti` | 9 |
| `ruutu.leveys` / `.korkeus` | `ruutu.leveys` | esim. 390 |
| `näkymä` / `näkymä.numero` | `näkymä` | esim. Koti |
| `tumma` | `tumma` | kyllä/ei |
| `näkyy`, `harmaa`, `luettava`, `piilossa` | `otsikko.tila = harmaa` | kyllä/ei |
| ominaisuus | `nimi.pituus` | 17 |

### Laskut

| Merkki | Esimerkki | Tulos |
|---|---|---|
| `+` | `1 + 2 * 3` | 7 |
| `-` `−` | `-uni + 10` | 4 |
| `*` `×` | `3 × 4` | 12 |
| `/` `÷` `:` | `10 : 4` | 2,5 |
| `+` tekstiin | `"Unta " + uni + " h"` | Unta 6 h |
| `+` päivään | `tänään + 5` | 22.10.2026 |
| `-` päivien väli | `24.12.2026 - tänään` | 68 |
| jako nollalla | `uni / 0` | ⚠ jako nollalla |

### Vertailut

| Merkki | Esimerkki | Tulos |
|---|---|---|
| `=` `==` | `uni = 6` | kyllä |
| `!=` `<>` `≠` | `uni ≠ 6` | ei |
| `<` | `uni < 6` | ei |
| `<=` `≤` | `uni <= 6` | kyllä |
| `>` | `uni > 5` | kyllä |
| `>=` `≥` | `uni >= 6` | kyllä |
| `sisältää` | `nimi sisältää "mei"` | kyllä |
| teksti | `"Kissa" = "kissa"` | kyllä |
| päivä | `tänään < 1.11.` | kyllä |
| tyhjä | `tyhjä = 0` | ei |

### Funktiot

| Funktio | Esimerkki | Tulos |
|---|---|---|
| `jos(ehto; kyllä; muuten)` | `jos(uni > 5; "hyvä"; "huono")` | hyvä |
| `jos(ehto; kyllä)` | `jos(uni > 7; "hyvä")` | – |
| sisäkkäinen jos | `jos(uni > 7; "iso"; jos(uni > 5; "keski"; "pieni"))` | keski |
| `ja(…; …)` | `ja(uni > 5; uni < 8)` | kyllä |
| `tai(…; …)` | `tai(uni > 7; uni < 2)` | ei |
| ei sisällä | `jos(nimi sisältää "x"; ei; kyllä)` | kyllä |

### Tulos ja tekstit

| Kirjoitus | Esimerkki | Tulos |
|---|---|---|
| Kaavan tulos | `summa = uni + 1` | Summa-palikka saa arvon 7 |
| vertailu tulokseen | `summa == 7` | kyllä |
| teksti | `Unta {uni} h` | Unta 6 h |
| teksti, ominaisuus | `Näkyy: {otsikko.näkyy}` | Näkyy: kyllä |

### Ei toimi

| Kirjoitus | Miksi | Tilalle |
|---|---|---|
| `(1 + 2) * 3` | ei sulkuja | välikaava |
| `1 < uni < 8` | yksi vertailu | `ja(1 < uni; uni < 8)` |
| `jos(uni > 5, 1, 2)` | pilkku | `jos(uni > 5; 1; 2)` |
| `uni => 5` | väärä merkki | `uni >= 5` |
| `1 000` | tuhaterotin | `1000` |
| `2026-05-01` | lasku | `1.5.2026` |
| `kissa` | ei lainausmerkkejä | `"kissa"` |
| `"Tänään " + tänään` | teksti katoaa | `Tänään {päivä}` tekstissä |
| `{tänään}` tekstissä | avainsana | Tänään-palikka |
| `tänään.päivä` | ei ominaisuuksia | Päivämäärän osa -palikka |

---

## Reseptit

### Ehdollinen teksti jos-funktiolla

Teksti, joka sanoo *Levännyt*, kun unta on yli 7 tuntia, muuten *Väsynyt*.

1. Näkymässä on Säädin *Uni* (viite `uni`) ja Teksti-palikka *Arvio*.
2. Valitse *Arvio*. Paneelissa tekstikentän alla napauta **ƒ Teksti kaavasta**.
3. Appi tekee Kaava-palikan ja avaa sen. Kirjoita `jos(uni > 7; "Levännyt"; "Väsynyt")`.
4. Kentän alla näkyy esim. **Nyt: Väsynyt**. Siirrä säädintä käyttönäkymässä: teksti vaihtuu.
5. Paluu Teksti-palikkaan: paneelin yläosan **‹ Arvio**.

Kolme vaihtoehtoa: `jos(uni > 7; "Levännyt"; jos(uni > 5; "Ok"; "Väsynyt"))`.

### Hae tekstistä sisältää-vertailulla

Painike näkyy vain, kun hakukenttään kirjoitettu sana löytyy otsikosta.

1. Näkymässä on Tekstikenttä *Haku* (viite `haku`) ja Painike *Kahvi*.
2. Valitse *Kahvi*. Paneelin osiossa **Näkyvyys** napauta **ƒ Näkyy, kun kaava pätee**.
3. Kirjoita kaavaan `kahvi.teksti sisältää haku`.
4. Tyhjä haku pätee aina, joten painike näkyy aluksi. Kirjoita hakuun *kah*: näkyy. Kirjoita *tee*: piiloutuu. Kirjainkoolla ei ole väliä.

Taulukon riveille sama toimii Rivijoukon ehtona: `rivi.nimi sisältää haku` (ks. Tietotaulukon luku).

### Laskettu tulos nimellä (Kaavan tulos)

1. Logiikan paletista ryhmä **Kaava** → **Kaava**. Kirjoita `yhteensä = aamu + ilta` (Lukukentät *Aamu* ja *Ilta* ovat jo olemassa).
2. Kaava näyttää `⚠ puuttuu: yhteensä` ja napin **＋ Luo kaavan tulos ”yhteensä”**. Napauta sitä.
3. Kaavan tulos *Yhteensä* ilmestyy logiikkaan. Nyt voit kirjoittaa Teksti-palikkaan `Yhteensä {yhteensä}` tai toiseen kaavaan `yhteensä > 10`.

### Väri vaihtuu kaavalla (ohjattu ominaisuus)

1. Valitse Teksti-palikka *Otsikko*. Avaa paneelin **Ominaisuudet**-osio.
2. Rivillä `otsikko.väri` napauta **ƒ**.
3. Kirjoita kaavaan `jos(uni > 7; 4; 1)`.
4. Käytössä otsikon väri on paletin väri 4, kun uni on yli 7, muuten väri 1. Ominaisuudet-osiossa rivillä näkyy **ƒ** ja otsikossa *1 ohjattu*.

---

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#kaavat).
