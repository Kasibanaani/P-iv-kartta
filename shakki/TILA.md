# Shakki: tila

**Vaihe:** versio 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/shakki/ · **Päivitetty:** 28.10.2026

Pelkistetty shakki iPadille (Emilin toive 28.10.2026): litteät, geometriset nappulat, Appipaja 2.0 -ilme, botti viidellä tasolla ja harjoitustehtävät. Toimii myös puhelimella ja tietokoneella.

## Valmiina (versio 1, 28.10.2026)

- **Moottori** `<script id="engine">` (objekti `SH`, ei DOMia): 0x88-lauta, kaikki säännöt (linnoitus, ohestalyönti, korotus, matti, patti, toisto, 50 siirtoa, riittämätön materiaali), FEN, SAN, UCI. Ei ulkoisia kirjastoja.
- **Botti**: alfa-beta-haku (siirtotaulu, tappajasiirrot, lyöntihaku), arvio = materiaali + ruututaulukot + lopetusapu. Tasot `SH.LEVELS`: 1 Aloittelija (1 siirto, iso kohina, 22 % satunnaissiirtoja, mutta matin näkee), 2 Harrastaja (2, kohina), 3 Kerhopelaaja (3, pieni kohina), 4 Vahva (noin 1,2 s), 5 Mestari (noin 3 s). Avauksessa (10 ensimmäistä puolisiirtoa) tasot 4–5 vaihtelevat hieman, ettei joka peli ole sama. Botti ajetaan Web Workerissa (lähde = engine-lohkon teksti), varalla pääsäikeessä.
- **Pelaa**: botti tai kaveri samalla laitteella, oma väri (valkea, musta, arvotaan). Siirto napauttamalla tai vetämällä, pisteet laillisille siirroille, viimeinen siirto ja shakki korostettuina, korotusikkuna. Peru siirto (botin pelissä takaisin omaan vuoroon), Vihje (vahvin siirto noin 1,5 s:ssa, kehys ruutuihin), Käännä lauta, siirtolista, pelin lopun ikkuna.
- **Tehtävät**: 13 kpl ryhmissä Matti yhdellä (8), Matti kahdella (3), Voita materiaalia (2). Mattitehtävissä mikä tahansa matin pakottava siirto kelpaa (`SH.lost`), puolustaja pelaa pisimmän vastarinnan (`SH.defend`). Väärä siirto perutaan. Ratkaisu-nappi näyttää siirron, mutta ei merkitse ratkaistuksi. Lauta kääntyy siirtävän puolen mukaan.
- **Valikko** (⋯): väritila ja 10 teemaa, peli PGN:nä leikepöydälle, varmuuskopio tiedostona ja tekstinä, lyhyt ohje.
- **Tallennus** `shakki.v1`, ulkoasu `shakki:appearance`. Muoto `{app:'shakki', ver:1, savedAt, tab, peli:{fen0, uci:[], vastus:'botti'|'kaveri', taso:1–5, oma:'w'|'b'}, ratk:{tehtävän id:1}, flip}`. `repair` lukee myös puutteellisen tiedon ja pysähtyy ensimmäiseen laittomaan siirtoon.
- Kotinäytön kuvake piirretään selaimessa (ratsu teeman värillä).
- **Testit** `sh shakki/testit/aja.sh` (node + Playwright): moottori (perft viidestä asemasta, SAN, loppujen tunnistus, tasojen laillisuus ja miettimisaika, jokaisen tehtävän ratkeavuus) ja kosketuspolku 1180×820, 820×1180 ja 390×844.

## Ei tarkistettu

- Oikealla iPadilla tai iPhonella ei kokeiltu: kaikki testit ajettiin tietokoneen Chromiumissa. Erityisesti: vetosiirron tuntuma Safarissa, workerin toiminta kotinäytön kirjanmerkistä, kotinäytön kuvake (piirretään sivulla, ei tiedostona).
- Chromiumin kosketusemulaatiossa heti vedon perään (alle sekunti) tullut napautus napista ei aina laukaissut nappia. Ihmisen tahdissa toimii; iPadilla ei tarkistettu.
- Botin vahvuutta ei ole mitattu luvuilla: Mestari on arviolta seuratason harrastaja, ei Stockfish.
- Toimii verkossa, ei ilman yhteyttä (ei service workeria).

## Seuraava askel

Emil kokeilee iPadilla: tuntuma, nappuloiden ilme, tasojen vaikeus.

## Ehdotukset (tekoälyn, ei päätetty)

- Vahvempi botti: Stockfish WebAssemblyna. Vaatii poikkeuksen ”ei ulkoisia kirjastoja” -säännöstä ja on GPL-lisensoitu; oma moottori riittää luultavasti tasoille 1–4.
- Lisää tehtäviä: Lichessin avoin tehtävätietokanta (CC0) tekstinä tuotuna, esim. teemoittain ja vaikeuden mukaan.
- Lyödyt nappulat ja materiaalin ero laudan vieressä, kello, siirtojen selaus taaksepäin ilman perumista.

## Avoimet kysymykset

- Ovatko tasot sopivan porrastettuja?
- Halutaanko suomenkielinen merkintätapa (R, L, T, D, K) englantilaisen (N, B, R, Q, K) sijaan?

## Emilin kommentit
