# Pikseli: tila

**Vaihe:** versio 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/pikseli/ · **Päivitetty:** 23.11.2026

Pikselikuvien piirto puhelimella. Emilin idea 23.11.2026 (`master-tiedot/IDEAT.md`, Pikselitaide). Nimi Pikseli on työnimi.

## Valmiina (versio 1, 23.11.2026)

- **Piirto sormella:** napautus maalaa pikselin. Veto piirtää yhtenäisen viivan. Jos veto tai napautus alkaa pikselistä, joka on jo valittua väriä, se pyyhkii (sama sääntö päälle ja pois, ei erillistä pyyhekumia). Vain yksi sormi kerrallaan piirtää. Piirtoalueella Safarin eleet (nipistys, tuplanapautus, pitkä painallus) on estetty.
- **Ohjaimet pelikonemaisesti alareunassa:** vasemmalla tatti (portaaton, kuollut alue keskellä, nopeus kasvaa käyrästi etäisyyden mukaan, vauhti ruudun mukaan, joten tuntuma on sama joka zoomauksella; irrotus pysäyttää). Oikealla pystysäädin zoomaukselle (ylös = lähemmäs, keskikohta pysyy). Keskellä Kumoa, Uudelleen, Ämpäri ja Valikko. Jos sormi on kuvalla ja tatti liikuttaa näkymää, viiva jatkuu sormen alle.
- **Näkymä:** zoomaus koko kuvasta noin 72 pisteen pikseleihin. Ruudun pikselikoko on aina kokonaisluku (terävät reunat). Mahtuva kuva pysyy keskellä, isomman reunan yli pääsee neljänneksen ruudusta. Sijaintikartta oikeassa yläkulmassa, kun kuva ei mahdu ruudulle. Ruudukko piirtäessä (pois asetuksista).
- **Ämpäri:** täyttää yhtenäisen samanvärisen alueen (ei vinottain). Saman värin alueeseen napautus tyhjentää sen (sama päälle/pois-sääntö).
- **Paletit:** pohjaväri valitaan laitteen värivalitsimella, ja siitä lasketaan OKLCH-värimallissa neljä 8 värin palettia: Sävyportaat (tummasta vaaleaan, varjot kiertyvät kohti sinivioletti ja valot kohti keltaista), Vastaväri, Vierekkäiset ja Kolmikko. Pohjaväri on aina mukana. Palettirivin 9. ruutu = kaikki värit (laitteen värivalitsin); valitun oman värin napautus avaa valitsimen, muuten se valitsee oman värin. Paletin vaihto pitää valitun värin samalla paikalla rivissä.
- **Kuvat (galleria):** uusi kuva yhdellä napautuksella koossa 16, 24, 32, 48 tai 64 (neliö). Nimi, vaihto ja poisto vahvistuksella (Peru vasemmalla, Poista oikealla). Kumoa-historia on vain avoinna olevalle kuvalle eikä säily uudelleenavauksessa.
- **Jako PNG:nä:** koko Alkup. (1:1), Pieni ≈ 512, Keski ≈ 1024, Iso ≈ 2048 px. Vain kokonaislukusuurennos, joten jokainen pikseli on täsmälleen yhtä monta kuvapistettä; tarkka koko näkyy napissa. Tausta läpinäkyvä, valkoinen tai musta. Jaa kuva avaa iOS:n jakovalikon (kuva tehdään valmiiksi, jotta jako tapahtuu napautuksen sisällä); jos jako ei ole tuettu, tiedosto ladataan. Tiedostonimi `<nimi>-<leveys>x<korkeus>.png`.
- **Tallennus** `pikseli.v1`: `{app:'pikseli', ver:1, savedAt, asetukset:{ulko, ruudukko, pohja, laji, vari, vapaa, vienti:{koko, tausta}}, valittu, teokset:[{id, nimi, w, h, cols:[hex], px:[0 = läpinäkyvä, k = cols[k-1]], luotu, muokattu}]}`. Korjaus `PIX.repair`. Varmuuskopio tiedostona ja tekstinä (Asetukset).
- **Ilme:** Appipaja 2.0, teema Harmaa (neutraali ympäristö ei vääristä värejä), vaalea/tumma/laitteen mukaan. Kuvake pikselisydän.
- **Rakenne:** `<script id="engine">` = `PIX` (ei DOMia: piirto, viiva, täyttö, paletit, vienti, korjaus), `<script id="ui">` = `PUI`.
- **Testit** `sh pikseli/testit/aja.sh`: moottori (korjaus, viiva 300 satunnaista, täyttö, OKLCH edestakaisin 400 väriä, paletit 60 pohjavärillä, vientikoot) ja kosketuspolku 390×844 vaalea ja 320×568 tumma (asettelu, napit eivät liiku, oikea kosketusveto, pyyhintä, kumoa, ämpäri, säädin, tatti ja sen nopeuskäyrä, reunat, zoomattu osuma, paletit, oma väri, PNG:n jokainen kuvapiste, galleria, poisto, tallennus, varmuuskopio).
- Selainohje: Modern Web Guidance `form-factor-adaptation` (kosketuskohteet, turva-alueet).

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu: testit ja kuvat tietokoneen Chromiumissa (kosketus emuloitu). Erityisesti Safarissa: tatin ja säätimen tuntuma, kahden peukalon yhtäaikainen käyttö, estävätkö eleiden estot sivun zoomauksen ja tekstinvalinnan, värivalitsimen avautuminen palettiruudusta, jakovalikko kotinäytön appina, `dialog`-ikkunat.
- Tatin nopeus (huippu 950 pistettä/s) ja kuollut alue (12 %) ovat arvauksia.
- 320 px leveällä nappien tekstit piilotetaan (vain kuvakkeet).

## Seuraava askel

Emil kokeilee puhelimella: tatin ja zoomauksen tuntuma, piirto peukalolla, paletit ja jako (WhatsApp tiedostona vs. kuvana).

## Ehdotukset (tekoälyn, ei päätetty)

- Peilauspiirto (symmetria) toiseen versioon.
- Tarkkuustila: tatilla liikkuva kursori ja piirtonappi.
- Omien palettien tallennus ja kuvan koon muutos jälkikäteen.
- Suorakaiteen muotoiset kuvat.

## Avoimet kysymykset

- Nimi (Pikseli on työnimi).

## Emilin kommentit
