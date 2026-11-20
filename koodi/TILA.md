# Koodi: tila

**Vaihe:** versio 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/koodi/ · **Päivitetty:** 20.11.2026

Yksin pelattava koodinmurtopeli, jossa on täsmälleen Mastermindin logiikka. Ulkoasu on oma: litteä, tasavärinen ja pelkistetty. Emilin toive 20.11.2026. Nimi on Koodi, koska ”Mastermind” on tavaramerkki ja repo on julkinen.

## Valmiina (versio 1, 20.11.2026)

- **Moottori** `<script id="engine">` (objekti `KOODI`, ei DOMia): vastausmerkit `score` (täysi = oikea väri oikealla paikalla, rengas = oikea väri väärällä paikalla; toistuvat värit lasketaan kuten alkuperäisessä), salainen koodi toistoilla tai ilman, arvaus, voitto ja tappio, tilastot, tallennuksen korjaus `repair` (peli pelataan alusta ja pysähtyy ensimmäiseen laittomaan riviin).
- **Tilat:** Klassinen 4 paikkaa · 6 väriä · 10 riviä (oletus) ja Super 5 · 8 · 12. Värit voivat toistua (oletus päällä).
- **Peli:** värin napautus täyttää valitun paikan, ja valinta siirtyy seuraavaan tyhjään paikkaan. Paikan napautus valitsee sen, ja valitun paikan napautus tyhjentää sen. Ilman toistoja sama väri siirtyy uuteen paikkaan. Aiemman rivin napautus kopioi sen nykyiselle riville. Napit Tyhjennä ja Tarkista. Koodi paljastuu pelin lopussa, ja loppuikkunassa näkyvät tilastot ja rivijakauma. Näppäimistöllä 1–8, askelpalautin ja Enter.
- **Asetukset** (⋯): tila, toistot, ulkoasu (laitteen mukaan / vaalea / tumma), merkit nappuloissa (jokaisella värillä oma kuvio, apu värien erottamiseen), säännöt, tilastot, varmuuskopio tiedostona ja tekstinä. Jos tilaa vaihtaa kesken pelin, muutos tulee voimaan uudessa pelissä (nappi ”Aloita uusi peli nyt”).
- **Uusi peli** (↻) kysyy varmistuksen, jos peli on kesken. Keskeytettyä peliä ei lasketa tilastoihin.
- **Ilme:** Appipaja 2.0, teema Harmaa (neutraali tausta värikkäille nappuloille), iOS-järjestelmävärit, ikkunat nousevat alhaalta. Animaatiot (nappulan pomppaus, merkkien ilmestyminen, koodin kääntö) jäävät pois, jos laitteessa on vähennetty liike.
- **Tallennus** `koodi.v1`: `{app:'koodi', ver:1, savedAt, asetukset:{tila, toisto, symbolit, ulko}, peli:{cfg:{mode, n, k, rows, toisto}, secret, guesses, cur, done}, tilastot:{klassinen, super: {pelit, voitot, putki, paras, jakauma}}}`.
- **Testit** `sh koodi/testit/aja.sh`: moottori (tunnetut tapaukset, 5000 satunnaista vertailua suoraviivaiseen laskentaan, korjaus) ja kosketuspolku 390×844 vaalea ja 320×568 tumma (asettelu, koko peli, voitto, tappio, tilastot, asetukset, tallennus, varmuuskopio).
- Selainohje: Modern Web Guidance `dark-mode` (color-scheme-meta ja `:root`).

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu: testit ja kuvat tietokoneen Chromiumissa. Erityisesti Safarissa: `dialog`-ikkunat ja taustan napautus, `100dvh` ja turva-alueet kotinäytön appina, kotinäytön kuvake (piirretään canvasilla).
- Superissa 320×568-ruudulla nappulat ovat pienet (noin 20 px). Pelattavissa, mutta ahdas.

## Seuraava askel

Emil kokeilee puhelimella: tuntuuko napautus luontevalta, ovatko värit ja merkit selkeitä, onko Super liian ahdas.

## Ehdotukset (tekoälyn, ei päätetty)

- Vihje: näytä, mitkä värit on jo suljettu pois aiempien rivien perusteella.
- Päivän koodi: sama koodi kaikille joka päivä.

## Avoimet kysymykset

- Ei avoimia.

## Emilin kommentit
