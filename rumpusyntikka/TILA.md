# Rumpusyntikka: tila

**Vaihe:** ensimmäinen versio rakennettu, Emil kokeillut: toimii alustavasti (17.10.2026) · **Tallennusmuoto:** 1 (avain `rumpusyntikka:v1`) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/rumpusyntikka/ · **Päivitetty:** 17.10.2026

Tietokoneelle tehty kahden oskillaattorin rumpusyntikka, jonka rakenne, säätimet, sekvensseri ja 24 pisteen patch bay noudattavat Moog DFAMia. Taustaselvitys ja lähteet: `SELVITYS.md`. Emilin päätökset 16.10.2026: oma appi (ei Rytmikoneeseen), tietokone ensin, vertailu-DFAMia ei ole.

## Valmiina

- **Paneeli** (yksi näkymä, 1280 px leveälle mahtuu ilman vieritystä): Oskillaattorit (VCO DECAY, SEQ PITCH MOD, VCO 1/2 EG AMOUNT, FREQUENCY, WAVE, 1→2 FM AMOUNT, HARD SYNC), Mikseri (VCO 1, NOISE / EXT, VCO 2), Suodin (LP/HP, CUTOFF, RESONANCE, VCF EG AMOUNT, VCF DECAY, NOISE / VCF MOD), VCA (FAST/SLOW, VCA DECAY, VOLUME), Sekvensseri (TEMPO, RUN/STOP, ADVANCE, TRIGGER, 8 × PITCH ja VELOCITY, askelvalot). Paneelin nimet englanniksi kuten laitteessa, jotta ohjevideoita voi seurata; muu suomeksi.
- **Patch bay**: 15 tuloa ja 9 lähtöä laitteen järjestyksessä. Kaapeli vedetään pistokkeesta toiseen, tuloon mahtuu yksi, kaapelin klikkaus tai veto tulosta tyhjään poistaa. Pistokkeen päällä näkyy, mitä se tekee.
- **Potikat**: veto ylös/alas (Shift = tarkka), rulla, nuolinäppäimet, kaksoisklikkaus palauttaa. Yläpalkissa arvo yksiköissä (Hz ja nuotti, oktaavit, kesto, askelta/s).
- **Pikanäppäimet**: välilyönti RUN/STOP, T TRIGGER, A ADVANCE.
- **Omat äänet**: tallenna nimellä, päivitä, avaa, poista, alkuasetus. Nykyiset säädöt tallentuvat itsestään.
- **Esimerkit** (Omat äänet -valikossa, `RS.ESIMERKIT` moottorissa): Bassari, Virveli, Hi-hat, FM-kello, Rytmikuvio. Lähtökohtia, ei tallenneta omiin ääniin ennen kuin Emil tallentaa. Viritetty paperilla, ei kuunneltu.
- **Tunnetut reseptit** (samassa valikossa, `RS.RESEPTIT`, 17.10.2026): Perusbassari, Elektrobassari, Bassari ja virveli (PITCH → NOISE LEVEL), Ristimodulaatiobassari (VCO 2 → VCF MOD), Metallinen hi-hat, Shaker, Tomikuvio, Sync-zap, Acid-basso, Svengi (PITCH → TEMPO). Koottu ohjekirjan sanallisista ohjeista (esim. VCO 1 klo 10–11, VCO 1 EG klo 3) ja tunnetuista tempuista; asennot kirjoitettu kellotauluna `klo(h)`/`kb(h)`. Oikeiden patch-kirjojen asentoja ei saatu: ne ovat kuvina PDF:issä, joihin tästä ympäristöstä ei pääse. Sama asento ei takaa samaa ääntä, koska potikoiden alueet ovat arvioita.
- **Tallenna ääni**: sekvenssi alusta 1–16 kierrosta + häntä .wav-tiedostoksi (48 kHz mono).
- **Varmuuskopio** tiedostona ja tekstinä, **Ulkoasu** (Appipaja 2.0 -teemat, vaalea/tumma/laitteen mukaan), **Ohje**.
- **Moottori** (`<script id="engine">`, objekti `RS`, ei DOMia): pyörii AudioWorkletissa (varalla ScriptProcessor). 4x ylinäytteistys, kaistarajattu kantti (polyBLEP), eksponentiaalinen FM, hard sync, 4-napainen ladder tanh-yliohjauksella ja HP-tilalla, kolme isku+vaimeneminen-verhokäyrää, velocity skaalaa kaikki kolme, sekvensseri ja kaapelit näytteen tarkkuudella. Muunnokset potikasta suureeksi: `RS.vcoHz`, `cutHz`, `egOct`, `vcfOct`, `decayS`, `fmOct`, `stepRate`.
- **Tallennusmuoto 1**: `{app:'rumpusyntikka', ver:1, nyky, nimi, omaId, muutettu, omat:[{id, nm, patch, t}]}`, ääni `patch = {p:{säädin: arvo}, pitch:[8], vel:[8], cab:[[lähtö, tulo]]}`. Korjaus `RS.repair` ja `repairData`.
- **Testit** `sh rumpusyntikka/testit/aja.sh`: 25 moottoritestiä (mm. sävelpudotus, SEQ PITCH MOD -asennot, FM, sync, suodin, itseoskillointi, kaapelit, ei NaN:ia satunnaissäädöillä) ja 36 selaintestiä (1440 px vaalea, 1280 px tumma) Chromiumissa. Kaikki läpi 16.10.2026.

## Ei tarkistettu

- **Miltä se kuulostaa.** Tekoäly ei kuule. Testit mittaavat vain, että sävel putoaa, suodin suodattaa jne. Potikoiden alueet ja kulku (esim. VCO-taajuus 4 Hz – 8 kHz, verhokäyrän sävelsiirto enintään ±7 oktaavia, vaimeneminen 2,5 ms – 1,8 s aikavakio, sekvenssin sävel ±2,5 oktaavia, FM ±5 oktaavia) ovat arvioita, eivät mittauksia oikeasta laitteesta.
- Approksimaatioita, joista ei ole varmaa tietoa: FM:n laji (tehty eksponentiaalisena), RUN/STOP-tulo (nouseva reuna vaihtaa tilaa), VCA CV ja VELOCITY -tulot korvaavat sisäisen kytkennän, VCF MOD -tulo kulkee NOISE / VCF MOD -potikan kautta. Tarkista DFAMin ohjekirjasta, jos jokin tuntuu väärältä.
- Safari ja iPad: testattu vain Chromiumissa. Kynäkäyttöä ei ole suunniteltu.
- Kuormitus oikealla koneella: testikoneella moottori vie noin 5 % yhdestä ytimestä.
- Ei MIDIä (ei Web MIDI -tulona eikä MIDI-tiedostona).

## Seuraavaksi

- Emil kuuntelee reseptit (erityisesti Perusbassari, jonka asennot ovat suoraan ohjekirjasta) ja vertaa muistiin ja demovideoihin. Kerro, mikä kuulostaa väärältä ja missä potikan kohdassa (esim. ”bassari liian pehmeä, sävelpudotus liian hidas, FM liian kiltti”), niin säädän alueita ja käyriä. Viritys tehdään kierroksina.
- Mahdollisia jatkoja (ehdotuksia, ei päätetty): Web MIDI -tulo (tietokoneen Chrome), sekvenssin vienti MIDI-tiedostona, livetallennus säätöliikkeineen, iPad- ja kynäversio, moottorin kopiointi Rytmikoneen äänityypiksi.

## Avoimet kysymykset

- Lopullinen nimi (työnimi Rumpusyntikka).

## Emilin kommentit

- (tyhjä)
