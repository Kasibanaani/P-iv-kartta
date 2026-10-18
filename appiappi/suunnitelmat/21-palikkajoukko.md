# F37 Palikkajoukko: yksi sääntö monelle palikalle

> ⏸ **18.10.2026: muutosehdotus odottaa Emilin päätöstä,** ks. [25 Joukot tageina, viite @:lla ja kaavan sulut](25-joukot-tageina-ja-kaava.md). Älä rakenna tätä ennen päätöstä.

18.10.2026. **Emilin kysymys** (viesti 18.10. klo 0.09 Suomen aikaa): miten logiikkapuolella palikat napataan ryhmäksi niin, että kaavassa ryhmän nimi tarkoittaa jokaista jäsentä vuorollaan (”ryhmä1 = palikka2 + palikka3”)? Onko se ikkunaominaisuus? Miten jäsenyyttä hallitaan käsin ja säännöllä, myös myöhemmin tehtävien palikoiden osalta? Merkinnät: *Emilin idea* = hänen sanomansa, *ehdotus* = tekoälyn suunnitteluratkaisu, *avoin* = päätetään ennen rakentamista. **Emil hyväksyi suositukset 18.10.2026** (nimi Joukko, paikkamerkki `jäsen`, kaikki muut ehdotukset) ja siirsi F37:n jonossa 2D-pelien edelle. **Ei toteutettu.** Lue ensin [periaatteet](00-periaatteet.md) ja [palikkasäännöt](../PALIKKASAANNOT.md).

## 1. Miten nyt (Appi-appi 43)

- **Ryhmä** (Appi-appi 29) on pelkkä rakentajan kehys: kokoaa, nimeää ja liikuttaa sisältöä, mutta moottori ei näe sitä. Sillä ei ole viitettä eikä arvoa (manuaali 04, *Ryhmä*).
- **Ikkuna** on sulku: sen sisällä olevat arvot yhdistyvät **yhdeksi** tulokseksi (JA, TAI, SUMMA…). Sama palikka voi olla monessa ikkunassa, koska sille voi tehdä toisen esiintymän (⌘D).
- **Sama sääntö monelle palikalle ei onnistu.** Jos kahdeksan kolikkoa piiloutuu samalla ehdolla, jokaiselle kirjoitetaan oma *näkyy kun* -kaava tai ketjuun kahdeksan Toimintoa. Ainoa ”jokaiselle”-rakenne on riveillä: Rivijoukko (ehto riveittäin), Rivi (käsiteltävä rivi), ikkunan *Riveille*, *Toista riveille* ja Toistin.

## 2. Onko tämä ikkunaominaisuus?

**Ei.** Ikkuna kokoaa monesta yhden (*kooste*). Emilin ryhmä tekee yhdestä säännöstä monta (*jokaiselle*). Kaavassa `ryhmä1.x + 10` antaisi kahdeksan eri tulosta, eikä tavallisella Kaavalla ole kahdeksaa paikkaa niille. Siksi ”jokaiselle” toimii vain siellä, missä jokaisella jäsenellä on oma kohde tulokselle:

| Mitä | Esimerkki | Mihin tulos menee |
|---|---|---|
| jäsenen ominaisuus säännöstä | `näkyy = jäsen.y < 600` | jokaisen jäsenen omaan ominaisuuteen |
| toiminto joukolle | Aseta arvo → kohde *Kolikot* → näkyy = ei | jokaiseen jäseneen |
| jäsenen tapahtuma | *kun jäsen törmäsi* → Lisää pisteet | yksi tapahtuma, `tapahtuma.jäsen` kertoo kuka |
| kooste | ikkuna SUMMA *Jäsenille*, `kolikot.jäseniä` | yhdeksi arvoksi (ikkunan vanha tehtävä) |

Pelkkä joukon nimi tavallisessa kaavassa antaa virheen ”⚠ Joukossa on monta palikkaa: käytä jäsenten sääntöä tai ikkunaa Jäsenille”, ellei kyse ole joukon omasta ominaisuudesta (`kolikot.jäseniä`).

**Toisinnot ikkunan sisään automaattisesti: ei** (*ehdotus*). Kun sääntö ottaa mukaan 40 vihollista, kanvaasille ilmestyisi 40 esiintymää; palikka, joka kuuluu kolmeen joukkoon, näkyisi kolmesti, ja nuolten merkitys hämärtyisi (mihin esiintymään nuoli tulee?). Jäsenyys näytetään sen sijaan (kohta 4) korostuksena ja listana.

## 3. Ehdotus: uusi palikka Joukko (`joukko`)

Logiikan paletti → *Tieto* (Rivijoukon viereen; rinnakkainen nimi, A1, A9). Nimi, viite (esim. `kolikot`) ja arvo = jäsenten määrä, joten se ei ole erikoispalikka.

**Jäsenyys**, kaksi tapaa, jotka summautuvat:
1. **Käsin valitut.** Vedä palikan esiintymä Joukon päälle → palikka liittyy (esiintymä palaa paikalleen, ei siirry). Tai Joukon paneelissa *＋ Lisää jäsen…*, tai minkä tahansa palikan paneelissa uusi osio **Joukot**: ruksit ☑ Kolikot ☐ Viholliset. Tallentuu palikan tunnisteina, joten nimen vaihto ei riko (A9).
2. **Säännöllä.** Joukon paneelissa *Ota mukaan myös*: **laji** (esim. kaikki Kuvat, kaikki Painikkeet), valinnaisesti **näkymä** tai **kerros**, ja valinnaisesti **ehto** jäsenkohtaisena kaavana (`jäsen.nimi sisältää "kolikko"`, `jäsen.y > 300`). Sääntö lasketaan jatkuvasti, joten myöhemmin tehtävä tai monistettu palikka kuuluu joukkoon heti, kun ehto täyttyy, ja putoaa pois, kun lakkaa täyttymästä.
3. **Pois käsin.** Säännöllä tullut jäsen voidaan sulkea pois (*Ei tätä*), jotta yksi poikkeus ei vaadi sääntöön lisäehtoa.

**Monistus:** käsin valitun jäsenen kopio (Monista, ⌘D näkymässä, preset) kuuluu samoihin joukkoihin (*ehdotus*: näin ”tee kolikko, monista kymmenen” toimii ilman sääntöä).

**`jäsen`** on käsiteltävä palikka, kuten Rivi on käsiteltävä rivi: se on olemassa vain joukon sääntöjen, *Jäsenille*-ikkunan, *Toista jäsenille* -kierroksen ja jäsenen tapahtuman aikana. Emil ehdotti, että ryhmän oma nimi seisoisi jäsenen paikalla (`ryhmä1.x`). *Ehdotus:* sana `jäsen`, koska `kolikot.jäseniä` (joukon oma ominaisuus) ja `kolikot.x` (jokaisen jäsenen x) näyttäisivät samalta mutta tarkoittaisivat eri asiaa. Emil hyväksyi 18.10.

## 4. Miltä se näyttää

- Joukko-palikka on tavallisen palikan kokoinen, ja siinä näkyy enintään viisi jäsentä siruina (*Kolikko 1, Kolikko 2, … +6*). Sirun napautus vie jäseneen. Ei kopioita.
- Kun Joukko on valittuna, sen jäsenet korostuvat kanvaasilla molemmilla puolilla (näkymä ja logiikka), kuten Viitteet-katkoviivat.
- Paneeli: Jäsenyys (käsin valitut, sääntö, pois suljetut), **Säännöt** (kohta 5), Ominaisuudet, Yhteydet, Miksi? (miksi juuri nämä ovat jäseniä: ”käsin valittu” / ”laji Kuva ja ehto pätee” / ”suljettu pois”).
- Jäsenen paneelissa osio *Joukot* sekä ominaisuuden kohdalla merkki, jos joukon sääntö ohjaa sitä.

## 5. Säännöt jäsenille

Joukon paneelissa *＋ Sääntö*: ominaisuus (yhteiset ensin: näkyy, harmaana, vaihtoväri, siirto x/y, läpinäkyvyys; sitten lajien yhteiset) ja kaava, esim. `näkyy = ei jäsen.kerätty`. Sääntö on tila, ei hetki (A6).

**Etusija** (A3): jäsenen oma nuoli tai kaava > joukon sääntö > toiminnon asettama > perusarvo. Joukon sääntö on siis ”ohjattu”, mutta jäsenen oma ohjaus voittaa, ja ristiriita näkyy jäsenen paneelissa (*Joukon Kolikot sääntö ohitettu: oma kaava*). Kaksi joukkoa, jotka ohjaavat samaa ominaisuutta samassa palikassa: ensimmäinen joukko kanvaasin järjestyksessä voittaa ja ristiriita näkyy molemmissa.

## 6. Vaiheet

1. **Joukko ja jäsenyys** (jonon 15c): palikka, käsin valinta (pudotus, paneeli, Joukot-osio), sääntö laji + näkymä/kerros + ehto, pois suljetut, monistus, sirut ja korostus, ominaisuudet `jäseniä`, `jäsenet` (nimet listana kuten `rastitettu`), Toiminto kohteena Joukko (Aseta arvo, Lisää, Aseta tila, Palauta perusarvo, Vaihda: tehdään jokaiselle jäsenelle, jolla on kyseinen ominaisuus; muut ohitetaan hiljaa ja Miksi? kertoo). Testi: käsin, säännöllä, myöhemmin tehty palikka liittyy, poisto ja uudelleennimeäminen, toiminto kohdistuu kaikkiin.
2. **Säännöt jäsenille** (jonon 15d): kohta 5, etusija ja ristiriidan näyttö.
3. **Jäsenille ja jäsenten tapahtumat** (jonon 15e): ikkunan valinta *Jäsenille* (kohta *jäsenet* nuolella Joukosta, kuten *rivit*), ketjun *Toista jäsenille*, Joukon tapahtumat *jäsen …* niille tapahtumille, jotka jokaisella jäsenlajilla on (esim. kaikilla näkymäpalikoilla yhteinen *napautettu*, Liikkeellä *törmäsi*), tiedot `tapahtuma.jäsen`. Tästä hyötyy 2D-suunnitelman ([19](19-2d-pelit-ja-ymparistot.md)) vaihe D (kolikot ja viholliset).

**Tallennusmuoto laajenee** jokaisessa vaiheessa (uusi laji `joukko` kentin jäsenet, sääntö, pois suljetut ja säännöt; jäsenyys tallentuu Joukkoon, ei jäseniin). Vanha projekti aukeaa ennallaan. Kaistasäännön mukaan muotomuutos yksi kaista kerrallaan; muistuta varmuuskopiosta.

Nykyinen **Ryhmä** säilyy ennallaan kehyksenä. *Ehdotus, ei jonossa:* Ryhmän paneeliin myöhemmin nappi *Tee sisällöstä joukko* (käsin valitut = ryhmän sisällä olevat).

## 7. Päätökset ja avoimet

- **Nimi:** *Joukko* (suositus; Rivijoukon pari, Ryhmä on jo kehys) vai Ryhmä? **Päätetty: Joukko** (Emil 18.10.).
- **Paikkamerkki kaavassa:** `jäsen` (suositus, kohta 3) vai joukon oma nimi? **Päätetty: `jäsen`** (Emil 18.10.).
- Ajonaikana syntyviä palikoita (esim. ammukset) ei vielä ole; jos ne tulevat, säännöllä tehty jäsenyys kattaa ne ilman muutoksia.

## Linjakkuus

- A1, A9: nimi kertoo tekemisen ja on Rivijoukon pari; viite ja tunnisteet kestävät.
- A2: joukon tiedot rekisteriin (`jäseniä`, `jäsenet`); jäsenen ominaisuudet pysyvät jäsenen omissa.
- A3: joukon sääntö on uusi etusijataso jäsenen oman ohjauksen ja toiminnon väliin; ristiriita näkyy.
- A6: sääntö on tila, toiminto hetki.
- A7: ei uutta funktiota eikä sulkuja; kooste tehdään ikkunalla (*Jäsenille*, kuten *Riveille*).
- A8: rivien ”jokaiselle” ja palikoiden ”jokaiselle” toimivat samalla kaavalla (käsiteltävä rivi / `jäsen`), eli yksi opittava periaate, ei kahta.
- A10: Miksi? kertoo jäsenyyden syyn. A12: jäsenyyden ja sääntöjen laskenta moottorissa, koska se kulkee vietyyn appiin.
- Ei erikoispalikkaa: Joukolla on arvo (jäsenten määrä), kohdat ja tapahtumat.
