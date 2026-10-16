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
- Appi-appi 6: reitit (Emilin toive): Reitti-palikka piirretään napauttamalla, Liike kulkee sitä kerran / edestakaisin / kierroksia, käynnistä- ja pysäytä-tapahtumat.
- Appi-appi 7 (16.10., tekoälyn ehdotus): reitinhaku. Liike → Napautus → *Kiertää esteet*: hahmo kiertää seinät lyhintä reittiä, ruudukolla ruutujen keskeltä. Jos kohteeseen ei pääse, menee lähimmäksi ja logiikkaan *ei pääse* = kyllä. Oletuksena pois, vanhat projektit ennallaan.
- Appi-appi 8 (16.10., Emilin päätös): liike ruutu kerrallaan. Liike → Ohjaus Ruutu: nuolinapit (kohdat ylös/alas/vasen/oikea), tatti pidettynä tai pyyhkäisy; hahmo liukuu ruutuun (iso nopeus = hyppy), seinä estää (törmäsi), tapahtuma askel valmis.
- Korjattu samalla: Napautus kohteeseen jäi jarrutettaessa joskus alle 0,5 px päähän kohteesta; nyt perillä = täsmälleen kohteessa (ruudun keskellä).
- Testattu vain tietokoneen Chromiumissa, ei oikealla iPhonella, iPadilla eikä Safarilla.

## Seuraavaksi

- Ehdotuksia jatkoon (tekoälyn, ei Emilin päätös), seuraavana: kerroksen näkyvyys logiikasta, sitten zoomaus käytössä, esimerkkipeli (esim. pieni labyrintti ruutuliikkeellä).
- Jonossa: kerroksen näkyvyys logiikasta, toiveet tekoälylle, pelin tuntu (efektit, ajastin, ennätys), projektin tyyli, vienti käyttäjä-appiksi.

## Avoimet kysymykset

- Kerroksen näkyvyyttä ei voi ohjata logiikasta (kerros ei ole palikka); sopisi rekisteriin.
- Siirto x/y (lisätään paikkaan) ja ominaisuus x/y (korvaa paikan) ovat molemmat käytössä: käykö kaksi tapaa?
- Tatin y on positiivinen alaspäin ja suunta 0 = ylös: käykö?
- Isot kuvatiedostot hidastavat GitHub-tallennusta; SVG on kevyin.
- Hakutaulukon ja monen haaran rivien rajoja ei voi ohjata ominaisuuksina.
- Maailma (16.10.): tekstipohja ei tue muotoa {palikka.ominaisuus} (vanha rajoitus); arvot saa näkyviin Kaavan tuloksella.
- Reitinhaku koskee vain Napautus-ohjausta (myös kohde nuolesta). Tatti ja Auto eivät kierrä esteitä, eikä haettua reittiä näytetä ruudulla. Riittääkö?
- Ruutuliike: kaksi hahmoa voi astua samaan ruutuun samalla hetkellä (määränpäätä ei varata). Napautus viereiseen ruutuun ei vielä ohjaa. Tarvitaanko?
- Ei tarkistettu oikealla iPhonella: pyyhkäisy sormella (testattu hiirellä), reitinhaun nopeus isossa maailmassa, tatti ja napautus sormella, kuvasilmukan sujuvuus ja akun kulutus jatkuvassa liikkeessä, isot kuvasarjat.

## Emilin kommentit

- (tyhjä)

Arkisto (Pajakone-rivi, ei enää päivitetä): https://app.notion.com/3fa977255eec812f943afd1d8705083e
