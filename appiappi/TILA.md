# Appi-appi: tila

**Vaihe:** kokeilussa, laajennus kehitteillä · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/appiappi/ · **Päivitetty:** 16.10.2026

Kytköskartan kopio, johon tuodaan Masterin ominaisuuksia vaiheittain (puhelin- ja iPad-näkymät, maailma ja hahmon liike, myöhemmin vienti omaksi appiksi). Ristiriidoissa Kytköskartan logiikka voittaa. Suunnitelma ja päätökset: `VERTAILU.md`.

## Valmiina

- Pajakone 1–4: laitemuoto, puhelinappin perusta, Käyrä, asettelutyökalut, kerrokset, Kuva, Tatti, Muutos ajassa, Liike, viitattavat ominaisuudet (`VERTAILU.md` kohdat 5–7).
- Appi-appi 0: nimenvaihto, kansio `appiappi/`.
- Appi-appi 1: kamera seuraa palikkaa, kuollut alue, pehmeys, maailman rajat, rullaus kaikkiin suuntiin, parallaksi.
- Appi-appi 2: Liike liikuttaa suoraan palikkaa, esteet (palikka tai kerros, laatikko tai ympyrä, liukuu reunaa pitkin), alueet (astuttu, poistuttu, sisällä).
- Testattu vain tietokoneen Chromiumissa, ei oikealla iPhonella, iPadilla eikä Safarilla.

## Seuraavaksi

- Maailma jatkuu `VERTAILU.md` kohdan 8 järjestyksessä. Liike-, törmäys- ja kameralogiikka moottoriin (`KK`).
- Jonossa: kerroksen näkyvyys logiikasta, toiveet tekoälylle, pelin tuntu (efektit, ajastin, ennätys), projektin tyyli, vienti käyttäjä-appiksi.

## Avoimet kysymykset

- Kerroksen näkyvyyttä ei voi ohjata logiikasta (kerros ei ole palikka); sopisi rekisteriin.
- Siirto x/y (lisätään paikkaan) ja ominaisuus x/y (korvaa paikan) ovat molemmat käytössä: käykö kaksi tapaa?
- Tatin y on positiivinen alaspäin ja suunta 0 = ylös: käykö?
- Isot kuvatiedostot hidastavat GitHub-tallennusta; SVG on kevyin.
- Hakutaulukon ja monen haaran rivien rajoja ei voi ohjata ominaisuuksina.

## Emilin kommentit

- (tyhjä)

Arkisto (Pajakone-rivi, ei enää päivitetä): https://app.notion.com/3fa977255eec812f943afd1d8705083e
