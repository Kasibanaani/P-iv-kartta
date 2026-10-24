# Pakettipeli: tila

**Vaihe:** kokeilussa · **Versio:** 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/pakettipeli/ · **Päivitetty:** 24.10.2026

Kasuaali puhelinpeli Mini Motorwaysin tyyliin: valmiit tiet ja kuljetusfirma, jossa tilaukset jaetaan autoille napauttelemalla. Suunnitelma ja Emilin päätökset ovat tiedostossa `SUUNNITELMA.md`.

## Valmiina (versio 1, 24.10.2026)

- Generoitu ruutukaavakaupunki (14 × 22, siemenestä), jossa on 9 värillistä sopimusyritystä (koko painottaa tilauksia) ja varikko keskellä tai reunalla. Uusi peli = uusi kaupunki.
- Tilaukset: nouto on täytetty ruutu ja määränpää rengas, molemmissa sama kirjain ja väri. Ennakkotilauksessa on haalea ruutu ja hupeneva harmaa kehä. Värillinen kehä on kärsivällisyys, joka muuttuu punaiseksi lopussa.
- Ohjaus: auton napautus hidastaa peliä 0,25×:iin, minkä jälkeen napautetaan noutoja tai tietä (tiepiste). Alareunan listassa ▲▼✕. Autossa näkyvät luvut kyydissä (iso) ja haussa (pieni). Täysi auto siirtää noudon listan loppuun.
- Talous: kassa, tuotto/min (viimeisen minuutin summa), kulut/min, tulos/min ja maine. Luvut päivittyvät kerran sekunnissa. Auto maksaa 500 ja +40/min, myynti +250. Alkukassa 600, ja peli loppuu, kun kassa on miinuksella.
- Maine: nopea toimitus +1…+3, myöhästyminen −8, peruuntuminen −12 ja ruuhkavuoto, kun avoimia on yli 2 × autot. Kerroin (maine/100)² tilaustahtiin, hinta 50–100 %. Nollassa palautuu +1/min 20:een asti.
- Vastaanottosäädin 0–12/min 0,1:n askelin, lennosta.
- Lopeta päivä: antamattomat tilaukset peruuntuvat ilman haittaa, loput pikakelataan 8×:lla, sitten yhteenveto ja seuraava päivä samasta kohdasta.
- Ennätykset (suurin kassa, pisin peli), teema (laite, vaalea, tumma), varmuuskopio tiedostona ja tekstinä. Automaattitallennus `pakettipeli:v1` 5 s välein ja suljettaessa.
- Testit `sh pakettipeli/testit/aja.sh`.

## Ei tarkistettu

- Oikea iPhone: napautusten osuvuus pienillä merkeillä, Dynamic Islandin turvaväli kotinäytön appina ja suorituskyky.
- Tasapaino on tarkistettu vain botilla (yksinkertainen lähin vapaa auto -sääntö). Kaikki luvut ovat tekoälyn arvauksia.
- Yhdellä kaupunkityypillä on pelattu vain koneellisesti.

## Seuraavaksi

- Emil pelaa ja kertoo, ovatko tahti, autojen nopeus, kulut ja maineen heilahtelu kohdallaan.
- v2 (suunnitelma, kohta 12): lisää kaupunkityyppejä (joki ja sillat, vanha keskusta) ja karttaeditori.

## Avoimet kysymykset

- Auton kapasiteetti (nyt 4) ja nopeus (2 ruutua/s).
- Pitäisikö järjestystä voida muuttaa raahaamalla ▲▼-nappien sijaan?

## Emilin kommentit

- (tyhjä)
