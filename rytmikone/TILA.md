# Rytmikone: tila

**Vaihe:** vaiheet 1–2 rakennettu, kumpaakaan ei ole kokeiltu iPhonella · **Versio:** 2 (tallennusmuoto 2, avain edelleen `rytmikone:v1`) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/rytmikone/ · **Päivitetty:** 16.10.2026

Ääni → MIDI-rumpunuotit puhelimella, ja vaiheesta 2 alkaen otot voi kuunnella rumpuäänillä. Koko visio ja vaiheet 1–7: `SUUNNITELMA.md`.

## Valmiina (vaihe 1)

- **Nauhoita**: mikrofoni raakana (kaiunpoisto, kohinanpoisto ja automaattinen taso pois). Biisin lataus tiedostona: biisi soi nauhoittaessa ja nollakohta on biisin alku. Ilman biisiä esilaskenta (4 naksua) ja/tai metronomi. Tempo (myös desimaali). Seuraavan oton nuotti (GM-rumpukartan nimet) ja säädöt/esiasetus. Kalibroi hiljaisuus (2 s → portti 8 dB kohinan yläpuolelle). Tasomittari ja iskulaskuri nauhoittaessa. Näyttö pidetään päällä; appin vaihto taustalle lopettaa oton ja säilyttää sen. Enintään 10 min.
- **Oton näkymä**: voimakkuuskäyrä, iskut pystyviivoina (korkeus = velocity), portti katkoviivana, nollakohta (Alku). Lähennys ja siirto vetämällä. Säädöt muuttavat iskuja heti: kohinaportti, uudelleenlaukaisun esto, hiljaisin ja kovin isku, velocity-käyrä (3 vaihtoehtoa), Sovita velocity ottoon; lisäsäädöt hystereesi ja mittausikkuna. Siirto (viive) otoittain. Nuotti, nimi, mukana viennissä, esiasetuksen käyttö ja tallennus, poisto.
- **Otot**: projektin nimi, nuotin pituus (1/32, 1/16, 1/8), yksi raita tai oma raita per otto (MIDI-formaatti 0 tai 1), mukana-valinnat, tilasto. Vie MIDI (jakovalikko) ja Lataa .mid. Kanava 10, 480 tikkiä/neljännes, tempo ja 4/4 tiedostossa. Ennen nollakohtaa tulleet iskut jäävät pois.
- **Asetukset**: viivekalibrointi (4 + 8 naksua, 90 BPM, mediaani ja hajonta) ja viive käsin, mikrofonin testi (vasen/oikea taso, mono/stereo, raakatilan tila), esiasetusten poisto, Appipaja 2.0 -ulkoasu, varmuuskopio tiedostona ja tekstinä.
- **Projektit**: monta projektia, vaihto ja uusi yläkulman napista, poisto Otot-välilehdellä.

## Valmiina (vaihe 2, 16.10.2026)

- **Kuuntele** (Otot-välilehti): mukana olevat otot soivat nuottiensa äänillä, valinnalla *Biisin kanssa*, jos biisi on ladattu. Aika näkyy, Pysäytä. Soitto loppuu itsestään.
- **Oton näkymässä Kuuntele**: soittaa vain tämän oton (myös jos se ei ole mukana viennissä) näkyvän kohdan alusta. Punainen toistoviiva kulkee kuvassa, ja näkymä seuraa sitä. Säätöjen ja nuotin muutos kuuluu heti, kesken soiton. Oton äänen nimi näkyy napin vieressä.
- **Äänet-välilehti** (uusi, neljäs): projektin nuotit omassa järjestyksessään (▶ kuuntelee), *Muun nuotin ääni…* -valinta ja *Muut omat äänet*. Jokaisella nuotilla on GM-kartan mukainen **perusääni**, kunnes valitset oman. Ääni-ikkunassa tyyppi (Bassari, Virveli, Tomi, Hi-hat, Pelti, Taputus, Kello, Sämple), tyypin säätimet (esim. bassari: sävel, iskun korkeus, sävelen pudotus, kesto, napsu) ja voimakkuus, ▶ Kovaa / ▶ Hiljaa, Palauta perusääni. Säätimen irrotus soittaa äänen.
- **Sämplet**: wav/mp3/m4a Tiedostot-apista (enintään 15 Mt), tallentuvat selaimen tietokantaan alkuperäisinä. Lisäys ääni-ikkunasta asettaa sämplen saman tien nuotin ääneksi. Sämplellä sävel (±24 puolisävelaskelta) ja voimakkuus. Jos sämplen ääni puuttuu (esim. varmuuskopio tuotiin toiseen selaimeen), varoitus näkyy ja nuotti soi perusäänellä. Poisto palauttaa nuotit perusääneen.
- **Äänitiedosto (.wav)** (Otot → Vienti): rummut nuottien äänillä, ei biisiä, 44,1 kHz mono. Ensin *Tee rytmistä äänitiedosto*, sitten *Jaa* tai *Lataa* (kaksi napautusta, koska iPhonen jakovalikko ei aukea ilman tuoretta napautusta).
- **Tallennus**: `rytmikone:v1`, tallennusmuoto 2 lisäsi kentät `aanet` (vain itse muutetut nuottien äänet) ja `samplet` (nimet, kesto, koko). Vanha muoto 1 luetaan sellaisenaan. Sämplejen äänet ovat selaimen tietokannassa (`rytmikone` / `samplet`), eivät varmuuskopiossa.
- Testit: 70 logiikkatestiä ja 37 selaintestiä (390 px vaalea, 320 px tumma) Chromiumissa. Kaikki läpi 16.10.2026. Selaintestit renderöivät jokaisen äänityypin ja tarkistavat, että ääni kuuluu, vaimenee keston jälkeen ja hiljainen isku on hiljaisempi. Ne eivät kerro, miltä äänet kuulostavat.

## Ei tarkistettu

- **Oikealla iPhonella ei ole kokeiltu mitään**, ei vaihetta 1 eikä 2. Vaiheen 1 avoimet asiat ovat ennallaan: raakatila, AudioWorklet-kaappaus, biisi kuulokkeisiin mikrofonin ollessa auki, AirPods, lupakyselyt kotinäytön apissa.
- **Miltä äänet kuulostavat.** Tekoäly ei kuule. Perusäänet on viritetty paperilla (808-tyyliset hi-hatit, siniaaltobassari jne.), ja tasot ovat arvioita. Viritys tehdään Emilin korvilla.
- Äänetön-kytkin: soitto pyytää iOS:ltä toistotilan (`navigator.audioSession`), jonka pitäisi soida kytkimestä huolimatta uudemmissa iOS-versioissa. Ei varmistettu.
- Sämplejen tallennus Safarin tietokantaan ja säilyminen (kotinäytön apin pitäisi olla turvassa Safarin 7 päivän siivoukselta). Chromiumissa sämple säilyi uudelleenlatauksessa.
- .wav-tiedoston jako ja avaaminen iPhonella ja Logicissa.
- Pitkän oton (useita minuutteja) soiton ja .wav-tiedoston teon keveys puhelimella.

## Seuraavaksi

- Emil kokeilee iPhonella: ensin vaiheen 1 perusasiat (Asetukset → Testaa mikrofoni, otto, vienti Logiciin), sitten Otot → Kuuntele ja Äänet-välilehti. Kerro, mitkä perusäänet kuulostavat väärältä ja miten (esim. ”bassari liian pehmeä, hi-hat liian kova”), niin säädän oletukset.
- Palautteen jälkeen hionta tai vaihe 3 (stereo, kaksi nuottia samasta otosta).

## Avoimet kysymykset

- Ovatko oletukset hyviä (portti −36 dB, esto 60 ms, nuotin pituus 1/16, yksi raita)? Selviää kokeilussa.
- Tallennetaanko biisi appiin, ettei sitä tarvitse ladata joka kerta? (Nyt ei: tilaa säästyy.) Sämplejen tietokantaa voisi käyttää samaan.
- Äänet ovat nyt yhteiset kaikille projekteille (nuotti 36 kuulostaa samalta joka projektissa). Tarvitaanko projektikohtaiset äänisetit?
- Tarvitaanko biisin ja rumpujen voimakkuuden tasapainotus esikuuntelussa? (Nyt biisi soi täydellä voimakkuudella, rummut omilla voimakkuuksillaan.)
- Ideaa ei ole kirjattu `master-tiedot/IDEAT.md`:hen (16.10.2026 istunnoilla ei ollut pääsyä siihen repoon).

## Emilin kommentit

- (tyhjä)
