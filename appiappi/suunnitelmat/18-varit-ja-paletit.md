# F34 Vapaat värit ja paletit: mikä tahansa lähtöväri, paljon siihen sopivia paletteja

17.10.2026. **Emilin toive** (viesti 17.10. klo 23.15 Suomen aikaa): ”Käyttäjäpuolen värimaailmavaihtoehtoihin rajaton mahdollisuus ja silti mihin tahansa väreihin sopivat paletit. Suuri määrä paletteja, jotka eivät perustu tiettyyn lähtöväriin vaan täysin itse valittavaan. Ei kiire, mutta jonoon.” Tekoälyn jäsentämä suunnitelma; *ehdotus* = tekoälyn suositus. **Vaihe 1 toteutettu (Appi-appi 65, 18.10.2026, kaista B)**; vaiheet 2 ja 3 eivät. Toteutuksen poikkeamat: tavat ovat yhdessätoista (lisänä *Jaettu vastaväri*), *Sateenkaari* ei käytä lähtöväriä (alkuperäiset värit, omat paikat kyllä), paikka 1 on lähtövärin harmaa, tallennusversio pysyi (12), rakentajan virhemerkki näkymässä pysyy punaisena (`--er`) ja Kokeilu-raita siirtyi rakennusympäristön väreihin. [Hakemisto](../SUUNNITELMA.md), [palikkasäännöt](../PALIKKASAANNOT.md).

## 1. Nykytila koodissa (tarkistettu 17.10.2026, Appi-appi 42)

Kaikki värilogiikka on `appiappi/index.html`:n lohkossa `<script id="appearance">` (rivit ~956–1005, `window.APP_APPEARANCE`).

- **Teemat:** taulukko `themes`, kymmenen kiinteää teemaa (Metsä, Järvi, Luumu, Hiekka, Ruusu, Harmaa, Laguuni, Laventeli, Oliivi, Kupari). Kullakin käsin valitut kahdeksan roolin väriä vaalealle (`L`) ja tummalle (`D`): `bg, cell, label, label2, sep, accent, fill, tint`. Muut CSS-muuttujat johdetaan niistä.
- **Palikkapaletti:** kahdeksan sävyä `--h0…--h7` ja niiden haaleat pohjat `--s0…--s7` tulevat kiinteistä listoista `hueL/hueD` ja `softL/softD`, **samat kaikissa teemoissa** (Harmaa korvaa ne aksenttiharmaalla, projektinäkymässä sävyt 4 ja 6 = teeman aksentti). Palikka tallentaa vain numeron: `hue`, `hue2` (0–7, näkyy 1–8; `omIlme()` rivi ~1216, ominaisuudet `väri`, `väri2`). Samat muuttujat käyttävät kaaviot (`hues[i%8]`, ~5696–5708) ja reittiviivat (~5766–5775).
- **Rakennusympäristö:** `apply()` + `mount()`, valinta `{theme, mode}` selaimen muistissa (`appiappi:appearance`), ei projektissa.
- **Projektin käyttönäkymä:** `viewChoice(P)`, `project(P, legacy)`, `mountView()`; valinta tallentuu `P.appearance = {theme, mode}` (asetuspaneeli `renderSettings` ~8565, kutsu `APP_APPEARANCE.project` ~5216). Värivalitsimen näytteet `.sw8` (CSS ~707) näyttävät projektin sävyt `--project-h*` myös Harmaa-työkaluteemassa (`projectSamples`).
- **Valitsin:** `picker()` piirtää tilan (Laitteen mukaan / Vaalea / Tumma) ja teemakortit. Vapaata väriä (esim. heksakoodi) ei voi valita missään; manuaali sanoo saman (`manuaali/03-nakymapalikat.md`, Väri-osio).
- **Vienti:** F23 (vienti omaksi apiksi) ei ole rakennettu. Koska käyttönäkymän ilme on projektissa, se kulkee vientiin sellaisenaan. Viedyn appin käyttäjän omat asetukset ovat F31:n asia (`16-vienti-ja-tuontiputket.md`: asetukset tavallisella logiikalla).

## 2. Ajatus

Kaksi erillistä asiaa, kuten nytkin: **teema** (pinnat, teksti, korostus) ja **paletti** (palikoiden kahdeksan väriä). Kumpikin voi lähteä **mistä tahansa itse valitusta väristä**, ja appi laskee siitä sopivat sävyt sekä vaalealle että tummalle tilalle. Kiinteät teemat jäävät valmiiksi pikavalinnoiksi.

- **Oma teema:** yksi väri (selaimen värivalitsin `<input type="color">` + heksakenttä) → appi laskee kahdeksan roolia `L` ja `D` samalla kaavalla kuin nykyiset teemat on tehty: tausta ja pinnat hyvin vähäkylläisinä samassa sävyssä, teksti tummana/vaaleana, korostus valitusta väristä mutta vaaleutta säädetään, kunnes kontrasti pinnalla on vähintään 4,5:1. Halutessaan toinen väri korostukselle (taustan sävy ja korostus erikseen).
- **Paletti = tapa × lähtöväri.** Paletin tapa valitaan listasta, lähtöväri vapaasti. Jokainen tapa antaa kahdeksan sävyä mistä tahansa väristä, joten paletteja on rajattomasti, ja ne sopivat yhteen rakenteensa takia, eivät siksi, että joku on valinnut ne käsin. *Ehdotus* tavoiksi (noin kymmenen):
  - *Sateenkaari* (nykyinen, oletus: vanhat projektit näyttävät täsmälleen samalta)
  - *Vierekkäiset* (sävyt lähtövärin molemmin puolin)
  - *Vastavärit* (lähtö + vastakkainen, vaaleusportaat)
  - *Kolmikko* ja *Neliö* (tasavälein kehällä)
  - *Jaettu vastaväri*
  - *Yksi sävy* (vain vaaleus ja kylläisyys vaihtelevat)
  - *Murretut*, *Kirkkaat*, *Pastelli* (sama kehä, eri kylläisyys)
  - *Teeman mukaan* (lähtöväri = teeman korostus; paletti vaihtuu teeman mukana)
- **Rajaton:** jokaisen kahdeksasta paikasta voi lisäksi korvata omalla värillä (napautus paikkaan → värivalitsin). Korvattu paikka saa yhä automaattisesti haalean pohjan (`--s`) ja tumman tilan version.
- **Laskenta:** värit lasketaan OKLCH-väriavaruudessa (tasainen vaaleus eri sävyissä, siksi sateenkaarikin pysyy tasapainoisena), rajataan näytön väriavaruuteen, ja jokainen sävy tarkistetaan: `--h` pinnalla vähintään 3:1 (värialue ei ole tekstiä), teksti `--s`-pohjalla vähintään 4,5:1. Jos ei riitä, vaaleutta siirretään, sävyyn ei kosketa. Noin 60 riviä ilman kirjastoja `appearance`-lohkoon.
- **Kevyt:** lasketaan vain valinnan muuttuessa ja käynnistyksessä, tulos asetetaan samoihin CSS-muuttujiin kuin nyt. Piirto ja palikat eivät muutu lainkaan, joten suorituskykyyn ei vaikuta.
- **Valitsin:** teemakorttien perään kortti *Oma väri*. Paletille oma rivi: tapa (napautettavat valinnat, kunkin näytteenä kahdeksan pientä ruutua juuri valitulla lähtövärillä) + lähtöväri + kahdeksan paikkaa. Ei liukusäätimiä peruskäytössä.

## 3. Tallennus

- Palikat tallentavat yhä vain numeron 1–8: **palikoihin ei muutosta**, ja paletin vaihto värittää koko projektin kerralla (tämä on numeron hyöty, ei kannata luopua).
- **Projektin tallennusmuoto laajenee valinnaisilla kentillä**: `P.appearance.oma = '#RRGGBB'` (kun `theme === 'oma'`), `P.appearance.pal = {t:'kolmikko', c:'#RRGGBB', x:[null,'#…',…]}` (tapa, lähtöväri, korvatut paikat). Puuttuva `pal` = Sateenkaari, eli vanhat projektit pysyvät ennallaan; `repair` korjaa tuntemattoman tavan ja virheelliset heksat. Versio `VER` pysyy 8, koska kentät ovat valinnaisia (kartoitus 6).
- Rakennusympäristön valinta samoilla kentillä selaimen muistiin (`appiappi:appearance`), ei tallennusmuotoa.

## 4. Vaiheet

1. **Vaihe 1 (jonossa):** käyttönäkymän (projektin) oma teema yhdestä väristä, paletin tavat × vapaa lähtöväri ja kahdeksan paikan korvaus. Sama laskin koskee projektin ilmettä viennissä automaattisesti. Manuaaliin: Väri-osio (`03-nakymapalikat.md`), Asetukset (`02-tyoymparisto.md`), versio ja rajat (`11-versio-ja-rajat.md`). Testi: jokainen tapa × muutama lähtöväri (myös musta, valkoinen, harmaa ja hyvin kirkas keltainen) antaa kahdeksan erillistä sävyä, kontrastirajat täyttyvät vaalealla ja tummalla, vanha projekti ilman `pal`-kenttää näyttää samat värit kuin ennen, tallennus ja lataus säilyttävät valinnan.
2. **Vaihe 2 (ei jonossa):** sama valitsin rakennusympäristön ilmeelle (selaimen muisti).
3. **Myöhemmin (F31:n yhteydessä):** viedyn appin käyttäjä voi vaihtaa teeman tai paletin asetusvälilehdeltä. F31:n linjan mukaan tämä tehdään tavallisella logiikalla, esim. ominaisuudet `ilme.väri` ja `ilme.paletti` asetettaviksi toiminnolla. Ei rakenneta ennen F23:a.

## 5. Linjakkuus

- **A2/A5:** ei uutta palikkaominaisuutta: `väri` ja `väri2` pysyvät numeroina 1–8. Paletti on projektin asetus, ei palikan.
- **A8:** ei erillistä ”väripalikkaa” eikä palikkakohtaista vapaata väriä. Vapaus tulee paletista, jolloin yhteensopivuus säilyy (yksi vapaa heksa palikassa rikkoisi juuri sen, mitä Emil haluaa: värit, jotka sopivat yhteen).
- Ei poikkeusta, ei erikoispalikkaa.

## 6. Huonot puolet ja avoimet

- Laskettu teema ei ole yhtä viimeistelty kuin käsin säädetty; siksi kiinteät teemat jäävät.
- Hyvin vähäkylläinen lähtöväri (harmaa) tekee sävykehästä merkityksettömän: silloin tavat kääntyvät vaaleusportaiksi, ja valitsin kertoo sen.
- *Ehdotus*, ei kysytä erikseen: tapojen määrä noin kymmenen; lisää tulee helposti myöhemmin, koska tapa on vain kaava kehällä.
