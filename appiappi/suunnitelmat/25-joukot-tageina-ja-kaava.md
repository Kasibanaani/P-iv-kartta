# F41 Joukot tageina, viite @:lla ja kaavan sulut

18.10.2026 (Suomen aikaa). **Emilin ajatus** (viesti 18.10. klo 3.37): `#` sopii paremmin joukolle kuin viitteelle, koska se on asiasana muutenkin. Palikalla olisi kenttä teknisille tiedoille, johon kirjoitetaan viite ja välilyönnein yksi tai monta joukkoa (`#unipisteet`). Kaavassa joukkoa käsiteltäisiin kokonaisuutena (summa, keskiarvo, suurin, pienin). Joukko voisi määräytyä myös logiikalla, ja viitteelle keksitään uusi etumerkki. Lisäksi kaavan sulut pelkiksi suluiksi, ja *jos* niin, että ehdon sulku sulkeutuu ennen seurausta (ei Excelin `jos(ehto; a; b)`).

Merkinnät: *Emilin idea*, *ehdotus* (tekoälyn ratkaisu), ⏸ = odottaa Emilin päätöstä. **Ei toteutettu, ei jonossa.** Muuttaa hyväksyttyjä suunnitelmia [21 Palikkajoukko](21-palikkajoukko.md) (jonon 15c–15e) ja [23 Viittaustapa](23-viittaustapa.md) (jonon 12f), joten ne on merkitty jonossa ⏸ tämän päätöksen ajaksi. Lue ensin [palikkasäännöt](../PALIKKASAANNOT.md) (erityisesti A2, A3, A7, A9).

## 1. Lyhyt vastaus

| Emilin kysymys | Kanta |
|---|---|
| Voiko joukko olla `#`-tagi? | **Kyllä, ja se on parempi kuin suunnitelma 21 yksin.** `#` = joukko, `@` = yksi tietty palikka on sama sopimus kuin muualla (some, Slack, Notion), joten se on intuitiivinen myös tekoälylle ja muille ihmisille. |
| Mikä viitteen etumerkiksi? | **`@`** (suositus). Vaihtoehto `§` (Macin suomalaisessa näppäimistössä yksi nappi ilman muunninta, mutta puuttuu monesta asettelusta ja on puhelimessa piilossa). `{ }` toimii aina. |
| Viite ja joukot samaan kenttään välilyönnillä? | **Kyllä.** Kenttä *Tunnus*: `@uni #unipisteet #terveys`. Yksi `@`-sana, joukkoja rajattomasti. |
| Voiko palikka kuulua moneen joukkoon? | **Kyllä**, rajattomasti. |
| `summa(#unipisteet)` kaavassa? | **Kyllä asia, eri muoto:** `#unipisteet.summa`, `.keskiarvo`, `.suurin`, `.pienin`, `.jäseniä`. Taulukon sarakkeilla on jo täsmälleen nämä (`ostokset.määrä.summa`), eikä silloin tarvita yhtään funktiota. Juuri se pitää sulut pelkkinä sulkuina, kuten Emil haluaa. |
| Voiko joukko määräytyä logiikalla? | **Kyllä, kolmella tavalla, jotka kaikki ovat jo olemassa olevaa logiikkaa:** joukon sääntö (`jäsen.hp > 0`, suunnitelma 21), palikan `joukot`-ominaisuuden kaava, ja toiminnot *Lisää joukkoon* / *Poista joukosta*. Emilin `#(viite)`-muoto saadaan kaavalla, mutta ei Tunnus-kenttään (kohta 3.4). |
| Sulut pelkiksi suluiksi, jos ilman Excel-tyyliä? | **Kyllä.** `jos (uni > 7) "hyvä" muuten "huono"`, `a ja b`, `a tai b`, laskusulut `(sarake - 1) * 80`. Vanhat `jos(;;)`, `ja(;)`, `tai(;)` muuttuvat itsestään. |

## 2. Miksi `#` joukolle ja `@` viitteelle

- **Merkitys:** `@` osoittaa yhteen (”@Emil”), `#` niputtaa aiheen alle (”#uni”). Emilin intuitio on yleinen käytäntö, ei oikku.
- **Hinta nyt pieni:** suunnitelman 23 `#` on päätetty mutta rakentamatta (jonon 12f). Kaista B rakentaa 12d:tä nykyisellä `{ }`-muodolla, joten mitään ei tarvitse purkaa.
- **Kaavassa ero tarvitaan:** viite kirjoitetaan kaavaan paljaana (`uni`), joukko `#`:llä (`#unipisteet.summa`). Joukon nimi ja palikan viite voivat silloin olla samat ilman sekaannusta.
- **Huono puoli:** `@` on kahden napin yhdistelmä (Mac Alt+2, PC AltGr+2), kun `#` oli Shift+3. Siksi tapa jää valittavaksi (`@`, `§`, `{ }`). `#`-vaihtoehto poistuu viitteiltä.

## 3. Ehdotus

### 3.1 Tunnus-kenttä

Paneelin nykyinen *Viite*-kenttä muuttuu kentäksi **Tunnus**: `@uni #unipisteet #terveys`.

- Tasan yksi `@sana` = viite (samat merkit ja tarkistus kuin nyt, `VTRE`). Jos `@` puuttuu, viite pysyy ennallaan; kaksi `@`-sanaa → virhe *yksi viite per palikka*.
- Jokainen `#sana` = jäsenyys joukossa. Uusi nimi luo joukon heti (ei kysymystä, A11). Saman joukon tuplana kirjoittaminen ei haittaa.
- Muu teksti → virhe *kirjoita @viite tai #joukko*. Poistuminen virheellisellä tekstillä palauttaa voimassa olevan tunnuksen kuten nyt.
- Ehdotukset kuten viitteissä: `#` tuo projektin joukot, `@` palikat (`tplSug`).
- Valitulla `{ }`-tavalla kenttä näyttää viitteen ilman merkkiä (`uni #unipisteet`).
- Kanvaasin viitelappu (12c) näyttää tunnuksen sellaisenaan.

### 3.2 Joukko projektissa

- Joukot tallentuvat projektiin rekisteriksi (`P.jk`: tunniste, nimi, sääntö, säännöt jäsenille; *ehdotus*), ja jäsen tallentaa joukkojen **tunnisteet** (`b.jk:['j3']`). Joukon uudelleennimeäminen ei siis riko jäseniä eikä kaavoja (A9), kuten viite.
- **Joukko ei vaadi palikkaa.** `#unipisteet` toimii heti, kun yhdessä palikassa on se tagi. Logiikan *Joukko*-palikka (suunnitelma 21) tehdään vain, kun tarvitaan sääntöjäsenyys, säännöt jäsenille, tapahtumat tai näkyvä jäsenlista kanvaasilla. Logiikan paletissa *Tieto → Joukot* listaa projektin joukot; vedetty joukko tekee sen Joukko-palikan (yksi palikka per joukko).
- **Viimeinen jäsen pois:** joukko jää rekisteriin, kunnes se poistetaan joukkolistasta, jotta kaavat eivät katkea, kun tagi hetkeksi poistuu. Tyhjän joukon summa on 0 ja `jäseniä` 0.
- **Monistus:** kopio saa samat tagit, koska ne ovat palikan omaa tietoa (suunnitelman 21 toive toteutuu ilman erillistä sääntöä).
- Suunnitelma 21 tallensi käsin valitut jäsenet Joukkoon; tässä ne ovat jäsenessä. Sääntöjäsenyys, pois suljetut ja säännöt jäsenille pysyvät Joukossa.

### 3.3 Joukko kaavassa ja tekstissä

| Kirjoitus | Tulos |
|---|---|
| `#unipisteet` | jäsenten määrä (joukon arvo, kuten suunnitelmassa 21) |
| `#unipisteet.summa` / `.keskiarvo` / `.suurin` / `.pienin` | jäsenten arvoista; tyhjät ja tekstit ohitetaan kuten taulukon sarakkeessa |
| `#unipisteet.havaintoja`, `.puuttuvia`, `.virheitä` | kuten sarakkeen koosteet |
| `#kolikot.x.pienin` | jäsenten ominaisuuden kooste (vrt. `ostokset.määrä.summa`) |
| `#kolikot.jäsenet` | jäsenten nimet listana (kuten `rastitettu`) |
| `#unipisteet.arvot`, `#kolikot.x.arvot` | jäsenten arvot (tai ominaisuus) luettelona ”7, 3, 5” (*ehdotus* 18.10., Emilin kysymys ”jokainen erikseen outputiksi”) |
| `uni.joukot sisältää "terveys"` | palikan oma ominaisuus `joukot` |

Tekstissä sama: `Unipisteet: #unipisteet.summa`. Tuntematon `#sana` jää tekstiksi (suunnitelman 23 sääntö 5), `##` = merkki tekstinä. Kaavassa tuntematon `#sana` on virhe *ei joukkoa: sana* ja nappi *Luo joukko*.

**Emilin uniesimerkki** toimii näin: Kaavat *Pituuspisteet*, *Laatupisteet* ja *Säännöllisyyspisteet* (Tunnus `@pituus_p #unipisteet` jne.), ja kaava `unipisteet = #unipisteet.summa`. *Huomio:* tunnit, laatuluku ja säännöllisyys ovat eri asteikoilla, joten summa on mielekäs vasta, kun jokainen jäsen on ensin muutettu pisteiksi (esim. `uni / 8 * 40`). Siksi jäsenet ovat Kaavoja, eivät raakoja arvoja.

**Ehdotukset pisteen jälkeen:** kuten nyt `uni.` (manuaali 6, *Ehdotusrivi*), myös `#unipisteet.` avaa listan: `summa`, `keskiarvo`, `suurin`, `pienin`, `jäseniä`, `jäsenet`, `havaintoja` sekä jäsenten yhteiset ominaisuudet (`x`, `näkyy` …), joiden perään taas kooste. `#` yksinään avaa projektin joukot. Ulkoa ei tarvitse osata.

**Tuttu kirjoitus kääntyy:** jos kirjoittaa `summa(#unipisteet)` (tai `keskiarvo(…)`, `suurin(…)`, `pienin(…)`), kenttä muuttaa sen heti muotoon `#unipisteet.summa`, eikä anna virhettä (Emilin kysymys 18.10. klo 3.48). Funktioita ei silti synny: kääntö on kirjoitusapu.

**Ikkuna ja joukko** (Emilin kysymys 18.10.): sama laskenta, kaksi tapaa valita, keistä lasketaan. SUMMA-ikkuna valitsee *paikan* mukaan (mikä on sisällä) ja laskee yhden asian; joukko valitsee *nimen* mukaan, palikka voi olla monessa joukossa ilman kopioita, ja samaa joukkoa voi käyttää moneen (koosteet, toiminto kaikille, säännöt jäsenille). Molemmat sallitaan (A8). Ikkuna ei itsestään ole joukko, jotta palikan pudotus ikkunaan ei vie sitä huomaamatta jonkin joukon sääntöjen alle. *Ehdotus myöhemmäksi, ei vaiheissa:* ikkunan paneeliin valinta *Sisältö kuuluu joukkoon #…*, jos tarvetta tulee; Miksi? kertoo silloin ”kuuluu, koska on ikkunassa X”.

**Muutos kaikille jäsenille** (Emilin kysymys 18.10. klo 3.49), kolme reittiä:
- *Nuoli:* Joukko-palikalla on jäsenten yhteiset kohdat (näkyy kun, harmaana kun, vaihtoväri kun, siirto x/y). Nuoli Joukon kohtaan = sama ohjaus jokaiselle jäsenelle. Tämä on suunnitelman 21 kohdan 5 sääntö nuolena (sama etusija, sama tallennus).
- *Kaava:* Joukon *＋ Sääntö*: `näkyy = jäsen.y < 600`. `jäsen` on kukin jäsen vuorollaan.
- *Hetki (tapahtuma):* Toiminto, jonka kohde on `#kolikot` (Aseta, Lisää, Vaihda, Palauta), tekee muutoksen kaikille jäsenille kerralla. Vain yhdelle: jäsenen tapahtumassa kohde `tapahtuma.jäsen` (esim. *kun jäsen törmäsi* → piilota juuri se).

### 3.4 Joukko logiikasta

Kaikki kolme ovat olemassa olevia mekanismeja, eivät uutta kieltä:

1. **Joukon sääntö** (suunnitelma 21, kohta 3.2): *Ota mukaan myös* laji, näkymä/kerros, ehto `jäsen.hp > 0`. Joukko päättää, kuka kuuluu. Paras, kun sääntö koskee monta palikkaa.
2. **Ominaisuus `joukot`** (A2): jokaisella palikalla on lista `joukot`. Tunnus-kentän tagit ovat sen perusarvo. Ominaisuuden voi ohjata kaavalla kuten minkä tahansa (`jos (vaara > 5) "vaarassa" muuten "turvassa"`): tämä on Emilin `#(viite)`, mutta tavallisena ominaisuuden ohjauksena. Ohjattuna Tunnus-kenttä näyttää `#⚡` ja vihjeen *joukot tulevat kaavasta*.
3. **Toiminnot** (A6, hetki): *Lisää joukkoon* ja *Poista joukosta* ovat Lisää/Poista-toimintoja ominaisuudelle `joukot` (tai kohteena joukko). Esim. vihollinen osuu → Poista joukosta `#elossa`.

Etusija on sama kuin muualla (A3): ohjattu kaava > toiminnon asettama > perusarvo (Tunnus-kenttä). Joukon sääntö lisää jäseniä niiden päälle, pois suljettu voittaa.

- *Miksi `#(viite)` ei Tunnus-kenttään:* kenttä pysyy staattisena kuvauksena, jonka näkee yhdellä silmäyksellä; logiikka asuu siellä, missä logiikka muutenkin (kaava, toiminto, sääntö). Muuten samaan kenttään syntyisi pieni toinen kaavakieli.
- **Kehä:** jos jäsenen `joukot` riippuu joukon koosteesta (`jos (#unipisteet.summa > 80) …`), syntyy kehä; se näytetään samalla kehävirheellä kuin kaavoissa nyt.
- **Keveys:** jäsenyys lasketaan muutoksessa ja koosteet kerran kuvassa, ei jokaisessa luvussa (jonon 1p:n linjaus).

### 3.5 Kaavan sulut ja jos

**Ehdotus** (vastaa avoimeen kysymykseen 15 a ja menee Emilin toiveen mukaan pidemmälle):

| Nyt | Uusi |
|---|---|
| `jos(uni > 7; "hyvä"; "huono")` | `jos (uni > 7) "hyvä" muuten "huono"` |
| `jos(uni > 7; "hyvä")` | `jos (uni > 7) "hyvä"` (muuten tyhjä) |
| `jos(uni > 7; "a"; jos(uni > 5; "b"; "c"))` | `jos (uni > 7) "a" muuten jos (uni > 5) "b" muuten "c"` |
| `ja(a > 1; b < 2)` | `a > 1 ja b < 2` |
| `tai(a; b)` | `a tai b` |
| `(1 + 2) * 3` → virhe | `(1 + 2) * 3` = 9 |
| ikkuna SUMMA joukolle | `#joukko.summa` |

Esimerkit joukon kanssa: `#unipisteet.summa > 80` antaa kyllä tai ei ilman yhtään sulkua (riittää *näkyy kun* -kohtaan tai ikkunaan). Valinta: `jos (#unipisteet.summa > 80) "hyvä" muuten "huono"`.

⏸ *Avoin:* jos-ehdon sulut voisi korvata sanalla `niin`: `jos #unipisteet.summa > 80 niin "hyvä" muuten "huono"`. Silloin kaavassa ei tarvita sulkuja lainkaan, paitsi laskujärjestykseen. Suositus: hyväksytään molemmat (kumpikin on yksiselitteinen), kenttä säilyttää kirjoitetun muodon.

Säännöt:

1. **Sulut ovat vain ryhmittelyä.** Kaavassa ei ole yhtään funktiota. `jos`-ehdon sulut ovat pakolliset: ne rajaavat ehdon, ja sen jälkeen alkaa seuraus. Sulku ehdon perässä ei saa jäädä pois (`jos uni > 7 "hyvä"` → virhe *ehto sulkuihin: jos (ehto) seuraus muuten …*).
2. **Seuraus jatkuu `muuten`-sanaan, muuten-osa kaavan loppuun** tai sulkevaan sulkuun. Laskun keskellä jos kirjoitetaan sulkuihin: `2 * (jos (iso) 10 muuten 1)`.
3. **Järjestys:** laskut > vertailut > `ja` > `tai` > `jos`. `a tai b ja c` = `a tai (b ja c)`; sulut selventävät.
4. **Varatut sanat:** `jos`, `muuten`, `ja`, `tai` eivät enää kelpaa viitteeksi. `repair` antaa vanhalle palikalle, jonka viite on jokin niistä, uuden viitteen (`ja_2`); kaavat säilyvät, koska ne tallentavat tunnisteita.
5. **Vanhat kaavat muuttuvat itsestään:** `repair` kirjoittaa tallennetut `jos(;;)`, `ja(;)` ja `tai(;)` uuteen muotoon (sisäkkäiset mukaan lukien), ja liitetty tai tekoälyn kirjoittama vanha muoto muunnetaan kenttään kirjoitettaessa (kuten `{viite}` ymmärretään aina). Vanha muoto ei siis jää toiseksi kirjoitustavaksi.
6. Kaava pysyy tilana (A6): `jos` valitsee arvon, ei tee toimintoa.

**Tallennusmuoto:** uusi kaavateksti ei aukea vanhassa versiossa, joten tämä on muotomuutos (`VER` nousee, `repair` muuntaa). Kaistasäännön mukaan yksi kaista kerrallaan; muistuta varmuuskopiosta.

**Huonot puolet:** `muuten` on pidempi kuin `;`. Pitkä sisäkkäinen `jos … muuten jos …` on silti luettavampi kuin sulkupino. Infix `ja`/`tai` tarvitsee järjestyssäännön (kohta 3), jota funktio ei tarvinnut.

## 4. Mitä tämä muuttaa hyväksytyissä suunnitelmissa

- **23 Viittaustapa (12f):** oletus `#` → `@`; vaihtoehdot `@`, `§`, `{ }`. Muut säännöt (päättyminen, piste vain ominaisuuden edessä, `@@` = merkki tekstinä, tuntematon jää tekstiksi, tallennus `{#id}` ennallaan) pysyvät, merkki vain vaihtuu. Lisäksi tekstissä `#joukko` (kohta 3.3). ⏸
- **21 Palikkajoukko (15c–15e):** käsin valinta = tagi Tunnus-kentässä (ei pudotusta Joukon päälle eikä ruksilistaa, *ehdotus*; ruksilista voi jäädä palikan paneeliin näyttämään samaa tietoa), Joukko-palikka vapaaehtoinen, koosteet ominaisuuksina, `joukot`-ominaisuus. Kohdat 3.2 (sääntö), 3.3 (pois suljetut), 5 (säännöt jäsenille, etusija) ja 6.3 (tapahtumat, *Toista jäsenille*) pysyvät. Ikkunan *Jäsenille* tarve pienenee (koosteet ovat ominaisuuksia), mutta jää JA/TAI-koosteeseen. ⏸
- **15 a laskusulut** (⏸ jo ennestään): ratkeaa kohdalla 3.5.

## 5. Vaiheet hyväksynnän jälkeen (*ehdotus*)

1. **12f viittaustapa `@`-oletuksella** (suunnitelma 23 + kohta 4). Ei tallennusmuotoa.
2. **Kaavan sulut ja jos** (kohta 3.5). Muotomuutos. Itsenäinen, voi mennä kumman kaistan kautta tahansa.
3. **15c Joukot tageina:** Tunnus-kenttä, rekisteri `P.jk`, `b.jk`, ominaisuus `joukot`, koosteet kaavassa ja tekstissä, Toiminto kohteena joukko, Lisää joukkoon / Poista joukosta, paletin Joukot-lista. Muotomuutos. Vaatii vaiheen 1 merkin (`@`), jotta `#` on vapaa.
4. **15d Joukko-palikka ja säännöt:** sääntöjäsenyys, pois suljetut, säännöt jäsenille, Miksi?. Muotomuutos.
5. **15e Jäsenten tapahtumat ja Jäsenille** ennallaan suunnitelmasta 21.

`PALIKKASAANNOT.md` A7 päivitetään vaiheessa 2 (funktiot poistuvat, sulut ryhmittelevät, `ja`/`tai`/`jos` ovat sanoja). Manuaali: luvut 2 (Tunnus), 3 (tekstin viite), 6 (kaava kokonaan uusiksi funktio-osuudelta), 7 (joukot), hakemisto ja versio.

## 6. Päätettävät ⏸

1. `#` = joukko ja `@` = viite (suositus kyllä). Vaihtoehto: viite `§`.
2. Viite ja joukot samaan Tunnus-kenttään (suositus kyllä).
3. Koosteet ominaisuuksina `#joukko.summa`, ei funktioita (suositus kyllä).
4. Logiikan joukko: sääntö + `joukot`-ominaisuus + toiminnot, ei `#(viite)` Tunnus-kenttään (suositus kyllä).
5. Kaava: `jos (ehto) a muuten b` (ja/tai `jos ehto niin a muuten b`), `ja`, `tai`, laskusulut; vanhat muuttuvat itsestään (suositus kyllä, molemmat jos-muodot).
6. Järjestys kohdan 5 mukaan.

## Linjakkuus

- A2: `joukot` on tavallinen ominaisuus (perusarvo, kaava, toiminto). Koosteet joukon ominaisuuksina, samat nimet kuin taulukon sarakkeilla (A8: yksi opittava tapa).
- A3: etusija ennallaan; joukon sääntö suunnitelman 21 mukaan.
- A6: jäsenyyden kaava on tila, Lisää/Poista joukosta hetki.
- A7: muuttuu (Emilin päätös tarvitaan): funktiot poistuvat kokonaan, sulut vain ryhmittelyyn, koosteet ominaisuuksina eikä funktioina. Kieli kapenee eikä laajene.
- A9: joukot ja viitteet tunnisteina; nimen vaihto ei riko.
- A10: Miksi? kertoo jäsenyyden syyn (tagi, sääntö, kaava, toiminto).
- A12: jäsenyys ja koosteet moottorissa. A13: vanha muoto aukeaa ja muuntuu.
- Ei uutta erikoispalikkaa. Joukko-palikka ei ole erikoispalikka (arvo = jäsenmäärä).
