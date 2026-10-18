# F43 Aukot ja paikat: avattava valikko on katse toiseen kohtaan samaa kanvaasia

18.10.2026. **Emilin ajatus** (viesti 18.10. klo 11.42 Suomen aikaa): käyttäjäpuolella avautuva ”alasvetovalikko”, joka ei ole vain vaihtoehtolista vaan oma minikanvaasi (vapaa asettelu, vieritys); se voisi olla toinen sijainti samalla loputtomalla kanvaasilla, kuten välilehdetkin voisivat olla; alueen vierityksen rajaus helposti (ikkunan leveys, vapaa, ruudun koko); syvyyden suhde rajaan; mitä muita vaihtoehtoja on. Tekoälyn jäsentämä suunnitelma. Merkinnät: *ehdotus* = tekoälyn suositus; ⏸ = odottaa Emilin päätöstä. **Emil hyväksyi 18.10.2026** (kohdan 10 kysymykset 1–5 suositusten mukaan). Jonossa 22b–22e (vaiheet 1–4); vaihe 5 ⏸. **Ei toteutettu.** [Hakemisto](../SUUNNITELMA.md), [syvyys](26-syvyys.md), [käyttöpinta F11](03-kayttopinta.md), [palikan ruudukko](20-palikan-ruudukko.md).

## 1. Mitä nyt on (tarkistettu koodista ja manuaalista 18.10.2026, Appi-appi 64)

- **Näkymä** (välilehti) on oma kanvaasinsa: omat koordinaatit ja oma laite. Palikka kuuluu yhteen näkymään. Käytössä välilehtirivi näkyy, kun näkymiä on vähintään kaksi.
- **Emilin malli on vapaassa näkymässä jo melkein olemassa:** Alue-palikat ovat ”huoneita” samalla kanvaasilla. *Rullaus käytössä: Alueen sisällä* rajaa vierityksen alueeseen, ja *Siirry* alueeseen vaihtaa rajauksen siihen (`navTo` → `setArea`). Palaa takaisin palaa edelliseen.
- **Laitenäkymässä ei:** maailman raja on yksi kiinteä Alue (`v.kam.ra`, `kameraRajat`). Siirry alueeseen siirtää ruudun, mutta raja ei vaihdu (koodin perusteella; ei kokeiltu selaimessa).
- **Päälle avautuva valikko** tehdään nyt kerroksella: valikon palikat omaan kerrokseen, jonka *näkyy käytössä* ja *estää alempien käytön* ohjataan Kerros-palikalla (manuaali luku 4, esimerkki *Valikko*). Valikon sisältö on siis samassa kohdassa kanvaasia kuin sen pitää näkyä, eikä sillä ole omaa vieritystä.
- **Toistin** on ainoa palikka, jolla on oma vieritettävä kehys ja sisältö, joka on määritelty kerran (kortin malli) ja näytetään monta kertaa (rivit). Kortti ei hyväksy kaikkia palikoita (ei Listaa, Kalenteria, Tattia, toista Toistinta).
- Suunnitelma 03 (F11) linjasi jo: ponnahdusikkunat Kerroksella, täydennyksinä oma rajaus, oma vieritys, kiinnitys ruutuun tai kohteeseen, sisällön mukaan kasvava koko; avattu, suljettu ja taustan napautus ovat tapahtumia, joiden seuraukset rakennetaan logiikalla. Ei rakennettu.

## 2. Vastaukset Emilin kysymyksiin

1. **Onko avattava valikko toinen paikka samalla kanvaasilla?** Kyllä, ja se on hyvä malli. *Ehdotus:* uusi näkymäpalikka **Aukko** (nimi ⏸), joka näyttää jonkin Alueen sisällön omassa kehyksessään. Valikon sisältö rakennetaan tavallisesti johonkin kohtaan kanvaasia Alueen sisään, ja Aukko on katse sinne. Sama Alue voidaan avata monesta paikasta. Ei kopioita: aukossa ovat samat palikat, sama tila ja samat viitteet.
2. **Ovatko välilehdet paikkoja samalla kanvaasilla?** Ajatus on johdonmukainen, ja vapaa näkymä toimii jo niin. Yhdistävä sääntö: **Alue on paikka; ruutu ja Aukko ovat katseita paikkaan, samoilla vieritysvalinnoilla.** Nykyisiä näkymiä ei *ehdotuksen* mukaan muuteta yhdeksi kanvaasiksi: näkymä kantaa myös laitteen muodon, ja muunnos rikkoisi vanhat projektit ilman uutta ilmaisuvoimaa. Näkymä = oma laite tai täysin erillinen sivu; Alue = paikka saman maailman sisällä. Puuttuvat palat ovat pieniä: laitenäkymän raja vaihtuu Siirry-toiminnossa (vaihe 1) ja ⏸ Alue voi näkyä välilehtenä (vaihe 5).
3. **Vierityksen rajaus helposti.** Alueen paneeliin pikanapit ja Aukolle sekä ruudulle samat kolme vieritystapaa (kohta 3.2). Tärkein oletus: *pystyyn, leveys sovitettu*, eli valikko asettuu ikkunan levyiseksi ja vierii alas.
4. **Syvyys ja raja.** Emil päätteli oikein: raja koskee pintaa (kameraa), ja syvempi kerros tarvitsee isomman alueen, muuten tausta loppuu kesken. Kohta 3.4 antaa kaavan; appi laskee sen itse ja näyttää muokatessa kerroksen tarvitseman alueen katkoviivana. Rakentaja ei aseta jokaiselle kerrokselle omaa rajaa.
5. **Muut vaihtoehdot kuin ”paikka kanvaasilla”?** Kyllä, ja ne yhdistyvät (kohta 4): kerros päällä (on jo), siirtyminen paikkaan (on jo), sisältö riveistä Toistimella (on jo, mahtuu Aukkoon) ja sama sisältö eri tiedolla valinnan mukaan (on jo kaavoilla). Kaikkea ei tarvitse sijoittaa kanvaasille käsin: Aukon sisällä voi olla Toistin, jolloin valikon kohdat tulevat taulukosta, Rivijoukosta tai (myöhemmin) joukosta ja asettelu on kortin malli. Lista tai ruudukko on Toistimen oma asetus, ei Aukon erillinen tila.
6. **Voiko vapaa asettelu sovittua ikkunan leveyteen?** Vain mittakaavalla. Vapaasti aseteltu sisältö ei rivity uudelleen (se olisi eri asettelumalli). Aukko joko pienentää tai suurentaa sisällön leveyteen sopivaksi tai vierii. Uudelleen rivittyvä sisältö on Toistimen *ruudukko*.

## 3. Malli

### 3.1 Aukko (näkymäpalikka, *ehdotus*)

- **Näyttää:** valikosta Alue (tästä tai toisesta näkymästä). Nimi ⏸: *Aukko*. Vaihtoehdot *Kurkistus*, *Näyttöalue*. Sanaa *ikkuna* ei käytetä, koska logiikan ikkuna tarkoittaa jo muuta (missio: sama sana, sama asia).
- Kaikki näkymäpalikan yhteinen kieli (A5): näkyy kun, harmaana kun, siirto x/y, paikka, koko, ilme, animointi (esim. liukuu alas avautuessa). Avaaminen ja sulkeminen ovat siis tavallista *näkyy kun* -ohjausta tai Vaihda-toiminto. Ei uutta avaa/sulje-järjestelmää.
- **Sisältö toimii aukossa** kuten paikallaan: painikkeet, kentät, Toistin ja Kalenteri ottavat kosketuksen, kaavat lukevat niitä normaalisti.
- **Alueen valinta *Vain aukossa*** (oletus päällä, kun Alue valitaan aukolle): Alueen palikat eivät näy omalla paikallaan käytössä, eivätkä ne kasvata maailman rajoja. Muokatessa ne näkyvät paikallaan normaalisti.
- **Yksi paikka kerrallaan:** sama Alue näkyy yhdessä aukossa kerrallaan (sama palikka ei voi olla kahdessa kohdassa ruutua). Jos kaksi aukkoa avaa saman Alueen, uudemmin avautunut näyttää sen ja toinen näyttää tyhjän. ⏸ Vaihtoehto: kopioina kuten kaksi Toistinta (sidottu tieto yhteinen, oma tila erikseen); *ehdotus* ei, koska tila jakautuisi vaikeasti ymmärrettävästi.
- **Muokatessa** Aukko näyttää sisällön elävänä esikatseluna. Kaksoisnapautus tai paneelin **✎ Muokkaa sisältöä** vie muokkauskanvaasin Alueen kohdalle; **← Takaisin aukkoon** palaa.
- **Ominaisuudet** (A2, `omat`): `alue` (ohjattava: Aseta-toiminnolla aukko näyttää toisen Alueen, jolloin aukon sisällä voi olla välilehtiä), `vieritysx`, `vieritysy` (ohjattavia, Aseta 0 = alkuun), `auki` (vain luku: näkyy ja sisältö piirretty).
- **Tapahtumat ulos** (A4): *avautui*, *sulkeutui*, *napautettu ulkopuolelta* (tausta), *vieritetty loppuun*. **Sisään:** *vieritä alkuun*. Taustan napautus ei sulje mitään itse; sulkeminen rakennetaan logiikalla tai presetillä (F11:n linja).
- **Kiinnitys** (osio *Paikka ja koko*): *paikallaan* (oletus), *palikan alle / viereen* (valitaan palikka; aukko seuraa sitä ja pysyy ruudun sisällä), *ruudun keskelle*, *alareunasta*. Lukittuun kerrokseen (kojelauta) laitettu aukko ei vierity maailman mukana.

### 3.2 Yhteiset vieritystavat ruudulle ja Aukolle

Sama valikko kahdessa paikassa (laitenäkymän *Maailma ja kamera* ja Aukon paneeli), jotta opitaan kerran:

| Valinta | Mitä tekee | Ruudulla nyt |
|---|---|---|
| **Pystyyn, leveys sovitettu** (Aukon oletus) | Alueen leveys skaalataan aukon leveyteen, vieritys vain alas | lähin: *Pystyyn* (ilman skaalausta, koska laite on jo oikean levyinen) |
| **Kaikkiin suuntiin** | 1:1, vieritys Alueen reunoihin asti | *Kaikkiin suuntiin* |
| **Koko alue näkyy** | skaalataan niin, että koko Alue mahtuu, ei vieritystä | ei ole; uusi valinta myös ruudulle |
| **Ei vieritystä** | 1:1, Alueen vasen yläkulma | *Ei rullausta* |

- Vanhat valinnat säilyvät nimineen ja toimintoineen; *Koko alue näkyy* tulee lisäksi. Kamera seuraa -tila pysyy ruudun omana.
- Zoomaus sormilla aukossa: ⏸ *ehdotus* ei ensimmäiseen vaiheeseen.

### 3.3 Alueen pikakoot (rakentaja)

Alueen paneeliin *Paikka ja koko* -osioon napit, jotka asettavat koon kertaluonteisesti (Kumoa toimii):

- **Ruudun kokoinen** (laitteen koko; vapaassa näkymässä nykyinen ruutu),
- **Ruudun levyinen** (korkeus ennallaan),
- **Aukon kokoinen** (näkyy, kun jokin Aukko näyttää tätä Aluetta),
- valinta **Korkeus: sisällön mukaan** (pysyvä): Alue kasvaa alaspäin niin pitkäksi kuin sen palikat ulottuvat. Vierivä valikko ei tarvitse käsin venyttämistä, kun sisältöä lisätään.

### 3.4 Syvyys ja raja

Raja on pinnan raja: kamera tai aukon vieritys pysähtyy Alueen reunoihin. Syvyydellä `s = 100/(1+syvyys/100)` % ([suunnitelma 26](26-syvyys.md)) kerros näyttää ruudulle leveyden `ruutu / s` ja liikkuu vierityksen verran omissa koordinaateissaan, joten kerros tarvitsee leveyden

`tarve = (alue − ruutu) + ruutu / s` (sama korkeudelle).

Esimerkki: ruutu 390, Alue 1000 leveä. Pinta tarvitsee 1000. Syvyys 100 (s = 50 %): 610 + 780 = 1390. Syvyys 300 (25 %): 610 + 1560 = 2170. Etuala (syvyys −50, 200 %): 610 + 195 = 805.

- Appi laskee tämän itse. Muokatessa valitun syvän kerroksen kohdalla näkyy katkoviivakehys *Tämän kerroksen tarvitsema alue*; jos taustapalikat eivät täytä sitä, paneeli huomauttaa ”tausta loppuu vierittäessä oikealla 240 px” (*ehdotus*).
- Pikanappi **Täytä kerroksen alue** venyttää valitun taustapalikan (Kuva, Laatikko) kehykseen. Kumoa toimii.
- Aukon *Pystyyn, leveys sovitettu* skaalaa koko aukon sisällön, ja syvyys toimii sen sisällä suhteessa aukon vieritykseen (sama kaava, ruutu = aukon koko).
- Ei erillistä rajaa jokaiselle kerrokselle: yksi Alue, muut lasketaan siitä.

## 4. Vaihtoehdot avattavalle sisällölle

| Tapa | Missä sisältö on | Hyvä | Huono | Tila |
|---|---|---|---|---|
| A. Kerros päälle | samassa kohdassa, omassa kerroksessa | ei uutta opittavaa, kevyin | ei omaa vieritystä; sisältö vie tilaa siitä kohdasta kanvaasia; ei avaudu napautetun kohdan viereen | on (Kerros-palikka) |
| B. Siirry paikkaan | toinen Alue, koko ruutu vaihtuu | ”sivu” tai ”huone”, Palaa takaisin | koko ruutu vaihtuu, alla oleva ei näy | on (vapaa näkymä); laitenäkymän raja vaihe 1 |
| C. Aukko paikkaan | toinen Alue, näkyy kehyksessä päällä | vapaa asettelu, oma vieritys, avautuu mihin vain, sama sisältö monesta paikasta | uusi palikka opittavaksi; yksi paikka kerrallaan | *ehdotus* (vaiheet 2–3) |
| D. Sisältö riveistä | taulukko, Rivijoukko | kohdat tulevat tiedosta, kortin asettelu vapaa, lista tai ruudukko valmiina | kortin malli ei hyväksy kaikkia palikoita | on (Toistin), mahtuu Aukkoon C |
| E. Sama sisältö, eri tieto | yksi Alue, jonka kaavat lukevat valintaa | kalenterin päivä avaa ”päivän valikon”, joka näyttää juuri sen päivän asiat; ei kopioita | vaatii kaavan tai Rivijoukon ehdon | on (`kalenteri.valittu`, Rivijoukon ehto) |

**Kalenteriesimerkki** (C + D + E): Alue *Päivä* sisältää otsikon `@kalenteri.valittu`, Toistimen, jonka rivit tulevat Rivijoukosta ehdolla `kirjaus.aika.päivä = kalenteri.valittu`, ja Painikkeen *Lisää*. Aukko näyttää Alueen *Päivä*, kiinnitys *Kalenterin alle*, näkyy kun `kalenteri.valittu` ei ole tyhjä. *Napautettu ulkopuolelta* → Tyhjennä kalenteri. Kaikki palikat ovat tavallisia, eikä kalenteriin tarvita valikkokohtaista asetusta.

*Ehdotus:* rakennetaan C, koska se on ainoa, joka tuo uutta ilmaisuvoimaa (oma vieritys ja vapaa sisältö mihin tahansa kohtaan avautuen); A, B, D ja E ovat jo olemassa ja yhdistyvät siihen. Erillistä lista- tai alasvetovalikkopalikkaa ei tehdä: tavallinen vaihtoehtolista on jo Lista-palikka, ja rikas lista on Toistin aukossa.

**Pikaluonti ja presetit** (A8, tavallista avattavaa logiikkaa):

- **＋ Avattava valikko** painikkeen paneelista: tekee Alueen (*Vain aukossa*, korkeus sisällön mukaan, ruudun levyinen) kanvaasille tyhjään kohtaan, Aukon painikkeen alle, Muistin *auki*, painikkeelle Vaihda-toiminnon ja *napautettu ulkopuolelta* → Aseta auki = ei. Kaikki näkyy ja on muokattavissa.
- **＋ Alareunasta nouseva paneeli** ja **＋ Ponnahdus keskelle** samalla tavalla, kiinnitys eri.

## 5. Vaiheet (*ehdotus*)

| Vaihe | Sisältö | Tallennusmuoto | Hyväksymiskoe |
|---|---|---|---|
| 1 | Alueen pikakoot ja *Korkeus: sisällön mukaan*; laitenäkymässä Siirry alueeseen vaihtaa myös rajan; *Koko alue näkyy* ruudulle | **laajenee**: Alueen `kork:'sis'`, näkymän uusi `lrul`-arvo | kaksi Aluetta laitenäkymässä, Siirry vaihtaa rajan ja Palaa takaisin palauttaa; sisällön mukaan kasvava Alue kasvaa, kun palikka lisätään alle; vanha projekti ennallaan |
| 2 | Aukko: Näyttää-Alue, *Vain aukossa*, vieritystavat, elävä esikatselu, ✎ Muokkaa sisältöä, ominaisuudet ja tapahtumat, kosketus aukon sisällä, karsinta aukon kehykseen | **laajenee**: uusi laji, Alueen `va` | painike avaa vierivän aukon; sen sisällä Painike, Säädin ja Toistin toimivat; sama Alue kahdesta painikkeesta; vieritys alkuun Aseta-toiminnolla; 60 kuvaa/s Headmazessa suljetulla ja avoimella aukolla |
| 3 | Kiinnitys palikkaan, ruudun keskelle ja alareunasta, pysyy ruudun sisällä; presetit *Avattava valikko*, *Alareunasta nouseva paneeli*, *Ponnahdus keskelle* | laajenee: Aukon kiinnitys | kalenteriesimerkki kohdasta 4 rakentuu ilman käsin kirjoitettua logiikkaa presetistä; aukko ruudun reunalla siirtyy näkyviin |
| 4 | Syvyys aukossa ja ruudulla: kerroksen tarvitsema alue katkoviivana, ”tausta loppuu” -huomautus, *Täytä kerroksen alue* | ei muutosta | kolmen syvyyskerroksen tausta: huomautus oikein, täytön jälkeen ei reunaa näkyvissä; vaatii F42 vaiheen 1 |
| 5 ⏸ | Alue välilehtenä: Alueen valinta *Näkyy välilehtenä*; käytön välilehtirivi näyttää näkymät ja nämä Alueet, napautus = Siirry | laajenee: Alueen `vt` | vapaa ja laitenäkymä: kolme Aluetta välilehtinä, Palaa takaisin toimii |

Vaiheet 1–3 muuttavat tallennusmuotoa, joten ne rakennetaan kaksikaistaisessa työssä yksi kerrallaan muiden muotomuutosten kanssa. Vaihe 4 vaatii syvyyden (jonon 17c).

## 6. Keveys

- Aukon sisältö piirretään vain, kun aukko näkyy. Suljettu aukko ei maksa mitään; *Vain aukossa* -Alueen palikoita ei piirretä paikallaan käytössä.
- Avoin aukko: yksi leikkaava kehys ja yksi siirto (`transform`) vieritykselle; sisällön palikat piirretään kuten ennenkin, karsittuna aukon näkyvään osaan (sama `cullOut`-periaate kuin ruudulla).
- Ei kopioita: palikat ovat yksi kerta muistissa ja moottorissa. Moottori ei tiedä aukoista (näkymän esitystä), paitsi `alue`- ja vieritysominaisuuksien arvot, joten viety appi saa ne sellaisinaan.
- Mittaus `testit/mittaa_keveys.py`: Headmaze + avoin aukko, jossa 200 palikkaa; raja sama kuin `selain_91_keveys`.

## 7. Suhde muihin suunnitelmiin

- **[03 F11](03-kayttopinta.md):** tämä toteuttaa sen täydennykset (oma rajaus ja vieritys, kiinnitys, sisällön mukaan kasvava koko, avattu/suljettu/taustan napautus tapahtumina) yhdellä palikalla Ryhmän sijaan. Kerros jää ponnahdusten kevyeksi tavaksi.
- **[26 syvyys](26-syvyys.md):** kohta 3.4 on sen jatko; syvyyden kaava ja kosketuksen muunnos ovat samat aukossa. Napautuksen muunnos (jonon 17b) pitää tehdä myös aukon vieritykselle ja mittakaavalle.
- **[20 palikan ruudukko](20-palikan-ruudukko.md):** aukon sisällä ruudukon ruutu lasketaan samasta käänteismuunnoksesta.
- **Toistin:** ei muutu. *Ehdotus myöhemmäksi:* Toistimen rivit myös joukosta (TILA:n avoin kysymys yleisestä rivilähteestä); silloin valikon kohdat voivat olla palikoita, ei vain taulukon rivejä.
- **19 2D-pelit:** tasoloikan taukovalikko ja inventaario ovat Aukko-presettejä kojelautakerroksessa.

## 8. Rajaukset

Ei uudelleen rivittyvää vapaata asettelua (Toistimen ruudukko tekee sen), ei saman Alueen kahta yhtäaikaista näyttöä (kohta 3.1), ei aukkoa aukon sisällä ensimmäisissä vaiheissa (⏸ myöhemmin; vaatii syklin eston), ei näkymien yhdistämistä yhdeksi kanvaasiksi, ei sormien zoomausta aukossa vaiheissa 1–3.

## 9. Linjakkuus

- **A5:** Aukko on tavallinen näkymäpalikka kaikkine yhteisine kohtineen. Avaaminen on *näkyy kun*, ei oma toimintolista (F11).
- **A2:** `alue`, `vieritysx`, `vieritysy` ohjattavia; `auki` vain luku.
- **A4:** tapahtumat *avautui*, *sulkeutui*, *napautettu ulkopuolelta*, *vieritetty loppuun*; sisään *vieritä alkuun*.
- **A8:** valikot, paneelit ja ponnahdukset ovat presettejä tavallisista palikoista.
- **Yksi opittava sääntö:** Alue on paikka; ruutu ja Aukko katsovat paikkaan samoilla vieritystavoilla. Rakentaja oppii vieritystavat kerran.
- **Erikoispalikka:** Aukko ei poikkea osan A säännöistä, joten ei rekisteririviä. Alueen nykyinen ✦-rivi ei muutu; *Vain aukossa* on Alueen asetus.

## 10. Avoimet kysymykset Emilille

**Emil 18.10.: hyväksyn.** Kaikki ratkaistu ehdotusten mukaan: Aukko rakennetaan, vaiheet 1–4 jonoon 2D-vaiheiden ja syvyyden jälkeen (22b–22e); nimi *Aukko*; sama Alue yhdessä aukossa kerrallaan; näkymät säilyvät erillisinä, vaihe 5 ei jonossa (⏸); oletusvieritys *pystyyn, leveys sovitettu*.

1. ⏸ Rakennetaanko Aukko (tapa C) ja missä järjestyksessä vaiheet 1–4 (*ehdotus*: jonoon 2D-vaiheiden ja syvyyden 17c–17d jälkeen, vaihe 4 syvyyden jälkeen)?
2. ⏸ Nimi: *Aukko*, *Kurkistus*, *Näyttöalue* vai muu?
3. ⏸ Sama Alue kahdessa aukossa: yksi kerrallaan (*ehdotus*) vai kopioina?
4. ⏸ Säilyvätkö näkymät erillisinä kanvaasseina (*ehdotus* kyllä), ja tehdäänkö vaihe 5 (Alue välilehtenä)?
5. ⏸ Aukon oletusvieritys *Pystyyn, leveys sovitettu* (*ehdotus*) vai *Kaikkiin suuntiin*?

## Testit

Moottori: Aukon ominaisuudet ja tapahtumat, `alue` Aseta-toiminnolla, tallennus ja vanhan projektin avaus, Alueen sisällön mukaan kasvava korkeus, syvyyskerroksen tarvitseman alueen kaava (ruutu 390, Alue 1000, syvyys −50/0/100/300). Selain (1440 ja 1280 px, käyttönäkymä 390 ja 320 px): avaus ja sulku, vieritys ja sen rajat, kosketus aukon sisällä (Painike, Säädin, Toistin, Kalenteri), napautus ulkopuolelta, kiinnitys palikan alle ja ruudun reunalla, *Vain aukossa* piilottaa paikallaan, Siirry alueeseen laitenäkymässä vaihtaa rajan, preset *Avattava valikko*, keveysraja.
