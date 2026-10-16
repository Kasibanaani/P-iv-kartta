# Rytmikone: tila

**Vaihe:** vaihe 1 rakennettu, kokeiltava iPhonella · **Versio:** 1 (tallennusmuoto 1) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/rytmikone/ · **Päivitetty:** 16.10.2026

Ääni → MIDI-rumpunuotit puhelimella. Koko visio ja vaiheet 1–7: `SUUNNITELMA.md`.

## Valmiina (vaihe 1)

- **Nauhoita**: mikrofoni raakana (kaiunpoisto, kohinanpoisto ja automaattinen taso pois). Biisin lataus tiedostona: biisi soi nauhoittaessa ja nollakohta on biisin alku. Ilman biisiä esilaskenta (4 naksua) ja/tai metronomi. Tempo (myös desimaali). Seuraavan oton nuotti (GM-rumpukartan nimet) ja säädöt/esiasetus. Kalibroi hiljaisuus (2 s → portti 8 dB kohinan yläpuolelle). Tasomittari ja iskulaskuri nauhoittaessa. Näyttö pidetään päällä; appin vaihto taustalle lopettaa oton ja säilyttää sen. Enintään 10 min.
- **Oton näkymä**: voimakkuuskäyrä, iskut pystyviivoina (korkeus = velocity), portti katkoviivana, nollakohta (Alku). Lähennys ja siirto vetämällä. Säädöt muuttavat iskuja heti: kohinaportti, uudelleenlaukaisun esto, hiljaisin ja kovin isku, velocity-käyrä (3 vaihtoehtoa), Sovita velocity ottoon; lisäsäädöt hystereesi ja mittausikkuna. Siirto (viive) otoittain. Nuotti, nimi, mukana viennissä, esiasetuksen käyttö ja tallennus, poisto.
- **Otot**: projektin nimi, nuotin pituus (1/32, 1/16, 1/8), yksi raita tai oma raita per otto (MIDI-formaatti 0 tai 1), mukana-valinnat, tilasto. Vie MIDI (jakovalikko) ja Lataa .mid. Kanava 10, 480 tikkiä/neljännes, tempo ja 4/4 tiedostossa. Ennen nollakohtaa tulleet iskut jäävät pois.
- **Asetukset**: viivekalibrointi (4 + 8 naksua, 90 BPM, mediaani ja hajonta) ja viive käsin, mikrofonin testi (vasen/oikea taso, mono/stereo, raakatilan tila), esiasetusten poisto, Appipaja 2.0 -ulkoasu, varmuuskopio tiedostona ja tekstinä.
- **Projektit**: monta projektia, vaihto ja uusi yläkulman napista, poisto Otot-välilehdellä.
- **Tallennus**: `rytmikone:v1` (ulkoasu `rytmikone:appearance`). Ääntä ei tallenneta, vain voimakkuuskäyrä (1 tavu / 2,7 ms ≈ 0,5 kt/s), joten säätöjä voi muuttaa myöhemmin. Biisiä ei tallenneta: se ladataan uudelleen, kun appi avataan.
- Testit: 52 logiikkatestiä ja 25 selaintestiä (390 px vaalea, 320 px tumma) Chromiumissa valemikrofonilla, jolle syötettiin tunnetut iskut. Kaikki läpi 16.10.2026.

## Ei tarkistettu

- **Oikealla iPhonella ei ole kokeiltu mitään.** Erityisesti: noudattaako Safari raakatilaa (Mikrofonin testi näyttää sen), toimiiko AudioWorklet-kaappaus (varalla vanhempi tapa), soiko biisi kuulokkeisiin samalla kun mikrofoni on auki, AirPodsien mikrofonin vaihtuminen, lupakyselyt kotinäytön apissa, äänetön-kytkimen vaikutus naksuihin ja biisiin.
- Viivekalibroinnin tarkkuus oikealla taputuksella (testissä valemikki ei taputa naksujen tahtiin).
- MIDI-tiedoston avaaminen Logic Prossa: tiedoston rakenne on testattu, Logicia ei.
- Jakovalikon (Vie MIDI) toiminta iPhonella; varalla Lataa .mid.

## Seuraavaksi

- Emil kokeilee iPhonella: ensin Asetukset → Testaa mikrofoni, sitten Kalibroi hiljaisuus ja muutama otto ilman biisiä, sitten viivekalibrointi kuulokkeilla ja otto biisin tahtiin. Vienti Logiciin.
- Palautteen jälkeen hionta tai vaihe 2 (esikuuntelu ja rumpuäänet).

## Avoimet kysymykset

- Ovatko oletukset hyviä (portti −36 dB, esto 60 ms, nuotin pituus 1/16, yksi raita)? Selviää kokeilussa.
- Tallennetaanko biisi appiin, ettei sitä tarvitse ladata joka kerta? (Nyt ei: tilaa säästyy.)
- Ideaa ei ole kirjattu `master-tiedot/IDEAT.md`:hen (16.10.2026 istunnolla ei ollut pääsyä siihen repoon).

## Emilin kommentit

- (tyhjä)
