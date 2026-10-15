# Appi-appi: tila

**Vaihe:** kokeilussa, laajennus kehitteillä · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/appiappi/ · **Päivitetty:** 16.10.2026

Kytköskartan kopio, johon tuodaan Masterin ominaisuuksia vaiheittain (puhelin- ja iPad-näkymät, maailma ja hahmon liike, myöhemmin vienti omaksi appiksi). Ristiriidoissa Kytköskartan logiikka voittaa. Suunnitelma ja päätökset: `VERTAILU.md`.

## Valmiina

- Pajakone 1–4: laitemuoto, puhelinappin perusta, Käyrä, asettelutyökalut, kerrokset, Kuva, Tatti, Muutos ajassa, Liike, viitattavat ominaisuudet (`VERTAILU.md` kohdat 5–7).
- Appi-appi 0: nimenvaihto, kansio `appiappi/`, tiedot siirtyvät.
- Appi-appi 1: kamera seuraa palikkaa, kuollut alue, pehmeys, maailman rajat, rullaus kaikkiin suuntiin, parallaksi molempiin suuntiin.
- Appi-appi 2: Liike liikuttaa suoraan palikkaa, esteet (palikka tai kerros 🧱, laatikko/ympyrä, liukuu reunaa pitkin), alueet (sisällä, astuttu, poistuttu).
- Appi-appi 3: hahmo: ohjaus tatti / napautus kohteeseen / auto, huippunopeus, kiihtyminen ja jarrutus käyrällä, liukkaus, kääntyy kulkusuuntaan tai peilaa; ominaisuudet kierto ja peilattu.
- Appi-appi 4: kuvasarja-animaatio Kuva-palikkaan (kuvat, nopeus, pyörii aina / kun liikkuu / kun nuolen ehto pätee).
- Appi-appi 5: ruudukko kerroksen ominaisuutena (ruutukoko, tihennys, kohdistus, näkyvyys), napautus ruudun keskelle, Alue ruutu kerrallaan ja napautus alueeseen, ominaisuudet ruutux/ruutuy.
- Testattu vain tietokoneen Chromiumissa, ei oikealla iPhonella, iPadilla eikä Safarilla.

## Seuraavaksi

- Maailma jatkuu `VERTAILU.md` kohdan 8 järjestyksessä: seuraavaksi reitit (Emilin toive: muiden liikkuvien kulkureitit pohjaan). Liike-, törmäys- ja kameralogiikka moottoriin (`KK`).
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
