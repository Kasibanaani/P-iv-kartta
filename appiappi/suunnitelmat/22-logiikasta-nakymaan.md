# F38 Logiikasta näkymään: peruspalikka, suora kirjoitus ja pikaluonti

18.10.2026 (Suomen aikaa). **Emilin toive** (viesti 18.10. klo 1.50): työnkulku, jossa rakennetaan ensin kaavat ja niiden tulokset logiikkaan, ja sitten yhdellä napautuksella ”printataan” tuloksesta näkymään peruspalikka, jonka tekstinä on viite tulokseen. Logiikkaan jäädään, pieni välähdys kertoo, että palikka tehtiin. Lisäksi: tekstiä kirjoitetaan suoraan näkymän palikkaan (Apple Freeformin tapaan, Appi-appin omalla ilmeellä), muokatessa palikassa näkyy sekä viite että arvo, peruspalikan muotoa voi säätää muuttamatta muuta, ja sama peruspalikka voi olla pelkkä teksti, painike tai tyhjä laatikko ja raahattava.

Suunnittelija kirjoitti tämän. **Kohta 2 toteutettu** (Appi-appi 48, jonon 12b; manuaali luku 6 *Tee näkymään*), **kohta 3 toteutettu** (Appi-appi 50, jonon 12c; manuaali luku 3 *Teksti ja upotetut viitteet*: lappu näyttää viitteet paneelin tapaan `{Nimi}`, asetus Kyllä/Ei-valintana); **kohta 4 toteutettu** (Appi-appi 52, jonon 12d; manuaali luku 3 *Teksti ja upotetut viitteet*: myös muut Muodot ja otsikolliset ohjaimet, kosketuksella kaksi napautusta, Enter/Tab ottaa ehdotuksen); muut kohdat ei toteutettu, jonon 12e ja 14b–14c (`TILA.md`). Toteutuksen tarkennukset kohdassa 2: pikanäppäin **N**; Laatikko 200 × 60; laitenäkymässä vasen reuna 20 px; Monitori-vaihtoehto tekee nuolen, joten Monitori tulee logiikkaan; Ilmoitus käyttää Näkyvyys-osion *Näkyy kun* -viitettä (ei nuolta, ei logiikkaan).

## 1. Miten se toimii nyt (koodista tarkistettu, Appi-appi 47)

- **Peruspalikka on jo olemassa: Muoto** (`muoto`, paletin *Koristeet → Laatikko / Ympyrä / Lappu / Kehys*). Laatikko on juuri se pyöristetty suorakulmio (`.w-shape`, kulmat 16 px), teksti keskellä ja rivittyy. Muodon laji (*Laatikko, Ympyrä, Pilleri, Lappu, Kehys*) vaihtuu jo paneelista ja logiikasta (`muoto.muoto`) ilman, että muu muuttuu. Kulmien pyöristystä ei voi säätää. Pelkkä teksti ilman laatikkoa on eri palikka, **Teksti** (`nayta`).
- **Teksti ei ole oma objektinsa.** Se on palikan oma kenttä (`tx`). Siihen voi kirjoittaa tavallista tekstiä, upottaa viitteitä (`Unta {uni} h`; sisäisesti `{#id}`, joten uudelleennimeäminen ei riko) tai molempia. Lisäksi nuoli logiikasta kohtaan *teksti* (tai paneelin *ƒ Teksti kaavasta*) korvaa koko tekstin (`text()` moottorissa: nuoli > efektin teksti > oma teksti). Eli Emilin arvaus *sekä että* on oikein: kirjoitettu teksti on palikan sisältöä, viite tuo toisen palikan arvon.
- **Suoraan palikkaan ei voi kirjoittaa** näkymässä. Teksti muokataan vain oikean reunan paneelista. (Logiikan Kaavassa suora kirjoitus on jo: kaksoisnapautus, Appi-appi 27, `kaavaEdit`.)
- **Muokatessa palikka näyttää arvon, ei viitettä.** Näkymä laskee tekstin samalla tavalla muokatessa ja lukittuna (`ueInner` → `E.text`), joten `{unipisteet}` näkyy muokatessakin pelkkänä lukuna. Viitteen näkee vain paneelista.
- **Logiikasta näkymään on jo puolikas:** Kaavan ja ketjun paneelissa on *Vie tulos näkymän palikkaan…*, ja logiikassa palikan voi pudottaa toisen päälle (*Vie tulos: …*). Molemmat vaativat, että näkymän palikka on jo tehty. **Uutta palikkaa logiikasta ei voi tehdä.** Kaavan tulos -palikan (`tulos`) paneelissa ei ole edes *Vie tulos* -nappia (pudotus toisen palikan päälle toimii).
- **Painike vs. laatikko:** Muoto ei ota napautuksia (ei tapahtumia). Painettava laatikko syntyy nyt vain kiertotiellä: Painike, ulkoasu *Näkymätön kosketusalue*, laatikon päälle. Painikkeen muotoa ei voi vaihtaa.
- **Raahattavuus on jo kaikilla:** osio *Käyttöraahaus* (F12, Appi-appi 19–20) koskee myös Muotoa ja Tekstiä.

## 2. Tee näkymään (jonon 12b, ei tallennusmuotoa)

Arvollisen logiikkapalikan (Kaavan tulos, Kaava, Arvo, Muisti, Lasku, Vertailu, Ikkuna, Satunnaisluku, Sekuntikello, ketjun tulos …; yhteinen ehto `hasValue`) paneeliin nappi **▢ Tee näkymään** ja logiikan kanvaasille pikanäppäin (valitulle tai monivalinnalle; rakentaja valitsee vapaan näppäimen ja kirjaa sen manuaaliin).

- **Yksi napautus, ei kysymystä:** tekee näkymään **Laatikon** (Muoto, laji laatikko), jonka teksti on `{viite}`. Nimi = lähteen nimi + ” · näyttö”, viite = lähteen viite + `_n` (`uniqueVt`, ei törmää). Molemmat vaihdettavissa kuten aina.
- **Minne:** näkymään, joka oli viimeksi auki Näkymä-välilehdellä, vasempaan reunaan alimman palikan alle (ruudukkoon kohdistettuna). Monivalinta tekee palikat allekkain valintajärjestyksessä. Laitenäkymässä laitteen ruudun sisään, jos tilaa on, muuten sen alle.
- **Logiikkaan jäädään.** Lähdepalikan viereen välähtää pieni kupla *▢ Näkymään: Unipisteet · näyttö ›* (noin 1,5 s, ei peitä mitään pysyvästi); kuplan napautus vie palikan kohdalle näkymään. Rinnakkain-tilassa palikka näkyy heti viereisessä näkymässä.
- **Vaihtoehdot vain tarvittaessa:** napin vieressä ▾ avaa valikon, jossa on vain lähteeseen sopivat: *Laatikko tekstillä* (oletus), *Pelkkä teksti* (Teksti-palikka), *Monitori* (kun arvo on luku; nuoli kohtaan *arvo*), *Ilmoitus, joka näkyy kun tämä pätee* (kun arvo on kyllä/ei; nuoli kohtaan *näkyy kun*). Pääklikkaus ei siis koskaan kysy; kysyminen on ▾:n takana.
- Uusi palikka ei tule logiikan kanvaasille (viite riittää, Yhteydet näyttää sen). Yksi ⌘Z kumoaa.
- Manuaali: luku 6 *Vie tulos jatkuvasti* -kohdan viereen, luku 4 Kaavan tulos, hakemisto.

## 3. Viite näkyy muokatessa (jonon 12c, ei tallennusmuotoa)

- **Muokatessa** palikka, jonka teksti sisältää viitteitä tai saa tekstinsä nuolesta, näyttää arvon kuten nyt **ja lisäksi** pienen himmeän lapun palikan yläreunan yläpuolella: `{unipisteet}` (useampi viite pilkuin), nuolesta tuleva teksti muodossa *⇐ Nimi*. Arvo pysyy paikallaan, joten lukitus ei hyppää asettelua.
- **Lukittuna ja 🧪 Kokeile -tilassa** lappua ei ole: vain arvo.
- Koskee kaikkia näkymäpalikoita, joilla on tekstikenttä (Laatikko, Teksti, Painike, Ilmoitus, otsikolliset ohjaimet).
- ⚙︎ Asetuksiin rasti *Näytä viitteet muokatessa* (päällä oletuksena), tallennetaan selaimen asetuksiin, ei projektiin.

## 4. Suora kirjoitus palikkaan (jonon 12d, ei tallennusmuotoa)

- **Kaksoisnapautus** (tai Enter valitussa) Laatikossa, Tekstissä, Painikkeessa, Ilmoituksessa ja otsikollisissa ohjaimissa avaa kirjoituksen palikan omaan tekstiin, samalla fontilla ja paikalla. Kirjoittaessa viitteet näkyvät muodossa `{unipisteet}`. `{` tai nimen alku tuo samat viite-ehdotukset kuin paneelissa (F27, Appi-appi 37).
- Enter tai napautus muualle tallentaa, ⇧Enter = uusi rivi (Laatikko ja Teksti), Esc peruu. Yksi ⌘Z kumoaa. Paneelin kenttä päivittyy samaan.
- **Uusi Laatikko tai Teksti** (paletista) avautuu heti kirjoitukseen oletusteksti valittuna: kirjoittaminen korvaa sen, napautus muualle pitää sen (Freeformin tapa).
- Jos teksti tulee nuolesta tai kaavasta, kirjoitus ei avaudu; palikan viereen tulee *Teksti tulee kaavasta: Nimi ›* (napautus vie logiikkaan).
- Paletti: **Laatikko** myös *Näyttö*-ryhmän ensimmäiseksi (Koristeissa pysyy), koska siitä tulee peruspalikka eikä vain koriste.
- Testit 1440 ja 1280 px; 390 px vain, ettei hajoa (rakennuspuoli, tietokone ensin).

## 5. Napautettava näkymäpalikka (jonon 14b, tallennusmuoto laajenee)

Laatikosta painike ilman kiertotietä. Yleinen ominaisuus (A5, A8), ei uusi palikka:

- Teksti-, Muoto-, Kuva-, Monitori- ja Ilmoitus-palikoille osio **Napautus** (kiinni oletuksena, kuten Käyttöraahaus): rasti *Napautettava käytössä*, valinnainen *Painuu painettaessa* (lyhyt painuma, sama kuin Painikkeella).
- Tapahtumat ulos: **napautettu**, **pitkä painallus** (0,5 s), sama kuin Painikkeella; tiedoissa `tapahtuma.x`, `tapahtuma.y` (kohta palikassa). Logiikan pikatoiminnot *Kun painetaan* kuten Painikkeella.
- Raahattava + napautettava toimii kuten Painikkeella nyt: alle 6 px liike on napautus.
- Painike säilyy palikkana, jolla on tila (jää pohjaan, laskuri, pohjassa vain painettaessa, peliohjaimen nappi). Laatikko on painike ilman tilaa.
- **Tallennusmuoto:** valinnainen palikan kenttä (ehdotus `nap: {on, pai}`); puuttuva = ei napautettava. Versio pysyy 8.
- Kuvan manuaalin vinkki (Painike kuvan päälle) korvataan tällä.

## 6. Muodon säätö ilman muita muutoksia (jonon 14c, tallennusmuoto laajenee)

- Muodolle **Kulmat** (0 = terävä … pyöreä; oletus = nykyinen 16 px, joten vanhat näyttävät samalta), ominaisuus `muoto.kulmat` ohjattavaksi (A2). Ympyrä ja Pilleri eivät käytä sitä.
- Muodon laji vaihtuu jo nyt (kohta 1); tähän ei tule uusia lajeja ilman pyyntöä.
- Ei Painikkeelle eikä Tekstille: kohdan 5 jälkeen peruspalikka on Laatikko, jonka muoto on säädettävä. Painikkeen ulkoasun muutos kuuluu 20b:n Ilmeeseen (Piirros), joka toimii näiden päällä: Piirros korvaa pohjan ja reunan, Kulmat ja laji jäävät tavalliseen ilmeeseen.
- **Tallennusmuoto:** valinnainen `kr` (pikseleinä); puuttuva = 16.

## 7. Muut pikaluonnit logiikasta näkymään (tekoälyn ehdotuksia, Emil hyväksyi 18.10., jonon 12e)

Sama periaate (A8: pikaluonti tuottaa tavallista, avattavaa logiikkaa) koskee muitakin. Emil hyväksyi kaikki 18.10.; ne tulevat ▾-valikkoon kohdan 2 jatkoksi (jonon 12e, 12b:n jälkeen):

- **Toiminto → Painike:** tee näkymään painike, jonka *painettu* → *tee kun*.
- **Ketju → Käynnistysnappi** (painettu → käynnistä); **Satunnaisluku → Arvo uudelleen -nappi**.
- **Arvo tai Muisti → Syöttökenttä:** Lukukenttä, Tekstikenttä, Säädin tai Kytkin, jonka *muuttui* asettaa arvon.
- **Tietotaulukko tai Rivijoukko → Toistin, Lista tai Kaavio**; **Sekuntikello → Monitori + Käynnistä/Pysäytä**.
- Vastasuunta on jo olemassa: *Näytä logiikassa*, *Kun painetaan*, *ƒ Teksti kaavasta*, *ƒ Näkyy, kun kaava pätee*.

## Linjakkuus

- A5: kohdat 3–5 ovat näkymäpalikoiden yhteisiä (lappu, suora kirjoitus, Napautus-osio), ei lajikohtaisia poikkeuksia. A8: Tee näkymään on pikaluonti, joka tekee tavallisen Muodon ja tavallisen viitteen, ei uutta palikkaa. A9: viite `{#id}`, kestää uudelleennimeämisen. A2: `muoto.kulmat` rekisteriin; napautettavuus luettavaksi (`palikka.napautettava`). A4: *napautettu*, *pitkä painallus* samoilla nimillä kuin Painikkeella ja Alueella. A11: ei vahvistuksia, ⌘Z kumoaa. A13: kentät `nap`, `kr` valinnaisia.
- Ei uutta erikoispalikkaa eikä poikkeusta.
- Päällekkäisyys: 20b Ilme (Piirros) ja F34 värit toimivat näiden päällä; 15b oma ruudukko käyttää samaa napautusta (ruutu napautettu) ja kannattaa rakentaa 14b:n tapahtumien päälle, jos 14b tulee ensin.

## Testit

12b: tuloksesta Laatikko oikeaan näkymään, teksti `{viite}` näyttää arvon, viite yksilöllinen, logiikka-välilehti pysyy, monivalinta allekkain, ▾-vaihtoehdot vain sopiville, ⌘Z. 12c: lappu muokatessa, ei lukittuna eikä kokeilussa, asettelu ei hyppää. 12d: kirjoitus, ehdotus `{`, Esc, ⇧Enter, nuolesta tuleva teksti ei avaa kirjoitusta, uusi Laatikko kirjoitukseen. 14b: napautettu ja pitkä painallus, raahaus + napautus, vanha projekti ennallaan. 14c: kulmat, ohjaus logiikasta, vanha Laatikko näyttää samalta.
