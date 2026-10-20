# F47 Lista, taulukko ja ryhmä: yksi rivirakenne

20.10.2026. Lähtö: Emilin sanelu 20.10. (ketju *Lista, taulukko ja ryhmät*). **Emil hyväksyi 20.10.2026 klo 21.10 Suomen aikaa** (kaikki päätökset suositusten mukaan); jonossa 42a–42h `TILA.md`:ssä. Merkinnät: **[on]** = toimii jo (versio), **[osin]** = osa toimii, **[uusi]** = ei ole.

## 0. Näin teet sen nyt (Appi-appi 102)

**Teksti, jossa on tietty sana, kuuluu ryhmään:** sääntörivillä (♛) se ei onnistu, koska sääntö ohjaa ominaisuuksia eikä jäsenyyttä. Onnistuu ryhmän säännöillä:

1. Logiikka → *Tieto* → **Joukko** (⁂). Nimeä se `koirat` (paneelin *Nimi*).
2. Paneelin *Ota mukaan*: **Laji** = Arvo (tekstiyleispalikka on Arvo) ja **Ehto** `jäsen sisältää "koira"`.
3. Jokainen tekstipalikka, jossa lukee *koira* (myös myöhemmin tehty, kirjainkoosta välittämättä), on nyt jäsen: `#koirat` = määrä, `#koirat.jäsenet` = nimet. Paneelin *Jäsenet* kertoo syyn.

Rajat nyt: Laji on pakko valita, muuten ehtoa lukeva Kaava on itsekin ehdokas ja tulee kehä. Säännön ottamat jäsenet eivät näy ryhmän ikkunassa toisintoina eivätkä `@koira`-rivinä ryhmäpalikassa (ikkuna laskee ne, alareunassa *+ n käytössä lisättyä*). Listan rivit eivät ole palikoita, joten ne eivät voi kuulua ryhmään.

## 1. Mitä on jo (koodista ja manuaalista tarkistettu)

| Emilin toive | Nyt | Uutta |
|---|---|---|
| Ryhmä yleispalikkana, jäsenet `@koira` / `#eläin` | **[on]** 93: yleispalikka on ryhmä, linkki näkyy molemmissa päissä | – |
| Ryhmän ikkuna, jäsenet toisintoina, päivittyvät molempiin suuntiin | **[on]** 94: ▾ → *Ryhmän ikkuna* tai *Kirjoita ryhmä…* `@eläin`; jäsen on sama palikka (ei kopio), joten muutos näkyy kaikkialla. 97: käytössä lisätyt lasketaan | `#eläin` kelpaa kirjoitukseksi (nyt `@eläin`); säännöllä tulleet jäsenet toisintoina |
| Teksti kuuluu ryhmään sanan perusteella | **[osin]** Joukko-palikan *Ota mukaan* -ehto (kohta 0) | kirjoitettu muoto ryhmäpalikkaan (V7) |
| Listan rivit palikoina logiikassa | **[uusi]** Listan rivit ovat käyttötietoa (`listRows`), kaavassa `lista.rivi1`, `.rivejä`, `.rastitettuja` | V3 |
| Palikalle kyllä/ei | **[on]** yleispalikka `kyllä`/`ei` tai `= @valo` (kytkimen arvo); 99: sääntö ohjaa Arvon arvoa (`jos @valo niin @väite = kyllä`) | rasti jäsenelle (V3) |
| Näkymän painike tai kytkin samana arvona | **[osin]** Kytkin ja Valintaruutu ovat kyllä/ei, kaavassa `@valo`; `kun @valo niin …` (98–101); *Tee näkymään* tekee arvolle näyttölaatikon | yleispalikka näkymässä kytkimenä = jono 37f (oma suunnitelma, ⏸) |
| Listan rivit muokattaviksi | **[uusi]** rivillä vain rasti ja × | V1 |
| Rastisarake valinnaiseksi | **[uusi]** | V2 |
| Rivillä kellonaika tms. | **[osin]** Listalla päivämääräsarake; Tietotaulukossa sarakelajit (teksti, luku, kyllä/ei, päivä, ajankohta, valinta…) | V4 |
| Nätti taulukko näkymään | **[osin]** Tietotaulukko (logiikka) + Toistin (kortit, raahausjärjestys) + taulukkoikkuna rakentajalle | V4–V5 |
| Päivämäärä tekstistä | **[osin]** pelkkä päiväys `24.12.2026` tulkitaan päiväksi; tekstin sisältä ei poimita | V6 |

## 2. Ehdotettu malli (tekoälyn ehdotus)

**Yksi rivirakenne, kolme lähdettä, yksi näyttö.** Näkymään tulee yleinen **Taulukko**-näyttö (Listan muotokieli: pyöreä kehys, rivien väliviivat). **Lista on sen esiasetus** (sarakkeet: rasti + teksti, valinnaisena päivä). Vanha Lista aukeaa sellaisenaan ja muuttuu esiasetukseksi ilman tiedon menetystä.

Rivien lähde valitaan paneelissa:

1. **Omat rivit** (nykyinen Lista): käyttäjä lisää käytössä. Käyttötietoa.
2. **Tietotaulukko**: rivit ja sarakkeet tulevat taulukosta, solun muutos kirjoittaa taulukkoon. Tämä on oikea paikka kellonajoille ja muille sarakkeille, koska Tietotaulukolla on jo lajit, koosteet ja toiminnot.
3. **Ryhmä `#eläimet`**: rivit ovat jäsenet, sarakkeet jäsenten ominaisuuksia (nimi, arvo/teksti, rasti …). Rivin muokkaus muuttaa jäsenpalikkaa ja päinvastoin, koska rivi *on* jäsen.

Perustelu: periaate *yleinen työkalu, erikoisuus esiasetuksena* (MISSIO, A8). Kolme listamaista palikkaa (Lista, taulukkonäkymä, ryhmälista) olisivat kolme opeteltavaa poikkeusta; yksi Taulukko kolmella lähteellä on yksi kyky.

**Rehellinen huono puoli:** Emilin ajatus *jokainen käytössä lisätty rivi on oma palikkansa logiikassa* tarkoittaisi, että valmiin appin rakenne kasvaa käytön aikana. Silloin lukitus, Palauta ja vienti menevät sekaisin (rakenne ≠ käyttötieto, A6/A11). Siksi ehdotus: **ryhmälistaan käytössä lisätty rivi on ryhmän rivijäsen** (käyttötietoa): se kuuluu `#eläimet`-ryhmään (määrä, `.jäsenet`, koosteet, toiminto jokaiselle jäsenelle), näkyy ryhmän ikkunassa rivinä, ja rakentaja voi napauttaa sen **Tee palikaksi**. Rakentajan itse tekemät jäsenet ovat palikoita kuten nyt. Tämä jatkaa 97:n *käytössä lisätyt* -mallia. Päätös D1.

## 3. Vaiheet (suositusjärjestys)

**V1 Listan rivit muokattaviksi** [uusi, pieni, ei tallennusmuodon muutosta]. Rivin tekstin napautus avaa saman kentän kuin alin *＋ Lisää rivi* -kenttä, ulkoasu pysyy samana (ei kehystä ennen napautusta). Enter tallentaa, Esc peruu, tyhjäksi pyyhitty rivi poistuu vasta ×:stä (ei vahingossa). Rasti ja × ennallaan. Päivämääräsarakkeen päivä samoin. Tapahtuma *muuttui*. Testi: käyttötila 1440/1280.

**V2 Rastisarake valinnaiseksi** [uusi, pieni; valinnainen kenttä]. Paneelin rasti *Rastisarake* (oletus päällä, vanhat ennallaan). Ilman rastia: `.rastitettuja` = 0, `.kaikki` = ei, ja otsikon *n/m* jää pois.

**V3 Lista ryhmästä** [uusi; tallennusmuoto laajenee]. Listan lähde `#eläimet`: rivit = ryhmän jäsenet ryhmän järjestyksessä, rivin teksti = jäsenen teksti (yleispalikan teksti tai nimi). Rivin muokkaus muuttaa palikkaa; ryhmäpalikan `@koira`-rivi näkyy listassa heti. Rasti: jäsenen uusi ominaisuus **`.rasti`** (kyllä/ei, käyttötietoa, Palauta nollaa), luettavissa `@koira.rasti` ja `#eläimet.rasti.summa`. Uusi rivi käytössä → rivijäsen (D1). Toisin päin: ryhmäpalikan ▾ **Tee listaksi näkymään** (pikaluonti, kuten *Tee näkymään*).

**V4 Taulukko-näyttö sarakkeilla** [uusi, iso; tallennusmuoto laajenee]. Näkymä → Näyttö → **Taulukko**. Sarakkeet: teksti, rasti (kyllä/ei), päivä, kellonaika, luku, valinta ja **painike** (painettu-tapahtuma, `tapahtuma.rivi` = rivi). Lähde (kohta 2). Pystyviivat valinnaisina. Lista = esiasetus (paletissa edelleen *Lista*). Kellonaika rivillä: Tietotaulukon sarakelaji *kellonaika* [uusi] samalla `klo`-arvolla kuin 101.

**V5 Taulukon oma muokkaus käytössä** [uusi]. Taulukon kulmassa väkänen ⚙ (≥ 32 px, ei reunassa, jotta sormi ei osu vahingossa). Auki: sarakkeen leveys raahaamalla, sarakkeen siirto vasemmalle/oikealle, suodatus (sarake + ehto, esim. *rasti = ei*), järjestys (sarake, nouseva/laskeva) tai **käsin**, jolloin rivit raahataan omasta kahvastaan ⋮⋮. Kiinni: rakenne lukittu, solujen toiminnot (teksti, rasti, painike) toimivat. Rakentaja päättää paneelissa, näkyykö väkänen käyttäjälle. Asetukset ovat käyttötietoa (Palauta palauttaa rakentajan asetuksiin). Järjestys ja suodatus ovat luettavissa (`taulukko.näkyviä`).

**V6 Tekstistä poimiminen** [uusi; ei uutta palikkaa]. Tekstiarvolle luettavat ominaisuudet, ei funktioita (A7): `.päivä` (ensimmäinen päivämäärä tekstissä, esim. *Hammaslääkäri 24.10. klo 14* → 24.10.), `.kello` (14.00), `.luku` (ensimmäinen luku), `.sanoja`. Toimii kaikkialla, missä teksti on: yleispalikka (`@muistutus.päivä`), Listan ja Taulukon rivi (`lista.rivi2.päivä`), ryhmän jäsen (`jäsen.päivä`). Silloin *päivämäärien ryhmä* on ryhmän sääntö `jäsen.päivä = tänään`. Teksti pysyy tekstinä; tulkinta on vain luettava ominaisuus. Vuosi puuttuessa: lähin tuleva päivä (D3).

**V7 Kirjoitettu jäsenyyssääntö ryhmäpalikkaan** [uusi; kirjoitettu muoto olemassa olevalle *Ota mukaan* -ehdolle]. Ryhmäpalikan `#koirat` kentässä omalla rivillä `kuuluu, kun jäsen sisältää "koira"`. Sama moottori kuin Joukko-palikan ehdolla, lajirajaus oletuksena yleispalikat (ei kehää). Säännöllä tulleet jäsenet näkyvät ryhmän ikkunassa toisintoina (himmeä merkki ⚡) ja paneelissa syy. Tämä on vastaus kysymykseen *miten masterpalikkaan kirjoitetaan, että teksti kuuluu ryhmään*.

**V8 Ryhmän ikkuna `#`-kirjoituksella** [osin; pieni]. Ikkunan otsikkoon kirjoitettu `#eläimet` tekee siitä ryhmän ikkunan (nyt `@eläimet` valikosta tai *Kirjoita ryhmä…*). Sanavalinta seuraa jonon 39 päätöstä (ryhmä kaikkialla).

Suositusjärjestys: **V1 → V2 → V7 → V8 → V3 → V6 → V4 → V5.** V1–V2 ovat pieniä ja parantavat nykyistä Listaa heti. V7–V8 tekevät ryhmistä näkyviä ja kirjoitettavia ilman uutta käsitettä. V3 yhdistää Listan ja ryhmän, kun D1 on päätetty. V6 on itsenäinen ja hyödyllinen kaikkialla. V4–V5 ovat suurin työ ja tarvitsevat V3:n lähdemallin; ennen niitä uusi ominaisuusryhmä → linjakkuuskartoitus.

## 4. Päätökset (Emil hyväksyi suositukset 20.10.)

- **D1** Käytössä lisätty ryhmälistan rivi: rivijäsen (käyttötietoa, *Tee palikaksi* rakentajalle) **(suositus)** vai oikea palikka (rakenne kasvaa käytössä).
- **D2** Lista Taulukon esiasetukseksi (suositus) vai Lista ja Taulukko erillisinä palikoina.
- **D3** Tekstin päivä ilman vuotta: lähin tuleva (suositus) vai kuluva vuosi.
- **D4** `.rasti` jokaiselle palikalle (suositus: vain yleispalikalle ja rivijäsenelle, muut eivät tarvitse).
- **D5** Saako loppukäyttäjä oletuksena avata taulukon väkäsen: kyllä (suositus, rakentaja voi piilottaa) vai ei.

## 5. Linjakkuus

- **A1/A8:** ei uutta listapalikkaa; Lista on Taulukon esiasetus, ryhmälista on lähde, ei laji. Pikaluonti (*Tee listaksi näkymään*) tuottaa tavallisen, avattavan Taulukon.
- **A2:** `.rasti`, `.päivä`, `.kello`, taulukon järjestys ja suodatus kirjataan `omat`-rekisteriin (luettava; `.rasti` myös asetettava ja säännöllä ohjattava).
- **A6:** rivin muokkaus ja rasti ovat käyttötietoa (hetki), taulukon lähde ja sarakkeet rakennetta. Palauta palauttaa käyttötiedon.
- **A7:** tekstin poiminta ominaisuuksina, ei funktioina; `sisältää` pysyy vertailuna.
- **A9:** ryhmälistan rivit seuraavat jäsenten pysyviä tunnisteita; jäsenen uudelleennimeäminen ei riko listaa.
- **A13:** Lista-, Taulukko- ja ryhmäkentät valinnaisia; vanha Lista aukeaa sellaisenaan.
- **Poikkeus (uusi):** käytössä lukittu taulukko, jonka oma väkänen avaa rakenteen säätöä käyttäjälle. Perustelu: käyttäjän oma näkymän säätö (kuten sarakkeen leveys) on käyttöä, ei rakentamista (MISSIO: *rakentaja päättää, mitä loppukäyttäjä saa muuttaa*).

## 6. Testit (kun hyväksytty)

V1–V2 selaintesti käyttötilassa 1440 ja 1280; V3 ja V7 logiikkatesti (jäsenyys, kaksisuuntaisuus, rivijäsenet, Palauta, tallennus ja vanha muoto) ja selaintesti; V6 logiikkatesti tekstimuodoista (päivä eri muodoissa, ei päivää, monta päivää); V4–V5 selaintesti (sarakkeet, leveys, siirto, suodatus, järjestys, kahvaraahaus, lukitus).
