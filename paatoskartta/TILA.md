# Päätöskartta: tila

**Vaihe:** käytössä · **Versio:** 14 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/paatoskartta/ · **Päivitetty:** 15.11.2026

Päätöspuu omista vaihtoehdoista. Kaksi lajia: **yksinkertainen** (kaikki näkyvät aina, valinta korostaa suositellut) ja **monipuolinen** (säännöt tuovat näkyviin, sulkevat pois ja suosittelevat; ehdot, tekstit, pullonkaulat).

## Valmiina

- Versio 14 (15.11.2026, Emil antoi vapaat kädet parantaa Appilinjan mukaan):
  - **Yksinkertainen päätöspuu** (Emilin kommentin toive): uuden puun oletus. Ainoa sääntö on suositus; tekijäsivulla napautus merkitsee tai poistaa suosituksen (suunta: ”tämä suosittelee rivejä”). Ei poissulkua, ehtoja, tekstejä eikä pullonkauloja. Laji vaihdetaan nimen takaa (Muokkaa); monipuolisen säännöt jäävät talteen ja palaavat, kun vaihtaa takaisin. Tallennus `T.simple`, tiedostossa `simple: true`, tekstimuodossa `"yksinkertainen": true` (vientiversio 9, vanhat luetaan).
  - **Uusi vaihtoehto käytön aikana:** Käytön listan alla `+ Uusi vaihtoehto ”X” jälkeen`. Uusi menee viimeksi valitun haaraan, ja valittu suosittelee sitä (monipuolisessa lisäksi riittää tuomaan sen näkyviin). Puuta voi siis kasvattaa kulkemalla sitä. Sama tekijäsivulla: `+ Uusi vaihtoehto, jota tämä suosittelee`.
  - **Appilinja:** välilehtipalkki → alapalkki (osiovalikko vasemmalla, päivä ‹ › keskellä, pikavienti Vie oikealla ja punainen piste, kun vienti tekemättä). Ohjeet ja selityskappaleet i-napin taakse, ulkopuolinen napautus vain sulkee. Ilmoitukset ja Kumoa kelluvat alapalkin yllä. Viimeisen valinnan huomio listan alla. Yläosa 118 → 79 px. Suositus näyttää määrän (”suositus ×2”). Valitun rivin vaalea raita ei enää peitä tekstiä hetkeksi.
- Testit: 7 logiikka- ja 8 selaintestiä läpi tietokoneen Chromiumissa (390 ja 320 px), uusina `logiikka_14_yksinkertainen.js` ja `selain_14_yksinkertainen.py`. Ei testattu oikealla iPhonella.

## Ei tarkistettu

- iPhonella: näppäimistö `+ Uusi vaihtoehto` -kentässä (pysyykö auki Enterin jälkeen), alapalkin ja kelluvan ilmoituksen paikka Safarissa, pikaviennin jakovalikko alapalkista.

## Seuraavaksi

- Emil kokeilee yksinkertaista puuta ja käytön aikana lisäämistä puhelimella.
- Ehdotus (ei rakennettu): poiston vahvistus eri kohtaan Appilinjan mukaan (nyt toinen napautus samaan nappiin), järjestys raahaamalla kahvasta nuolien sijaan, muokkausikkunan Valmis-napit pois.

## Avoimet kysymykset

- Pistelaajennus (arkistossa) on yhä rakentamatta: tarvitaanko sitä, kun yksinkertainen puu on olemassa?
- Pitäisikö yksinkertaisessa puussa voida silti merkitä keskenään vaihtoehtoiset (esim. viikonpäivät)? Nyt ei, jotta laji pysyy yksinkertaisena.

## Emilin kommentit

- Kiinnostaisi uutta päätöspuuta tehdessä saada valita yksinkertaisempi päätöspuu tai sitten kaikki monimutkaisemmat mahdollisuudet sisältävä versio. Yksinkertaisempi vaihtoehto sisältäisi aina näkyvissä kaikki tekijävaihtoehdot ja ainoana ominaisuutena olisi suositusten korostuminen. Joissain päätöspuissa se nimittäin voisi olla ainut tarvittava ominaisuus. Mutta jos tämän lisääminen tekee apista muilta osin epäyhteensopivan niin voin harkita tätä myös omana appinaan. En halua vielä muita muutoksia vaan tämän rivin päivittämistä vastauksilla tähän asiaan.

Arkisto (pistelaajennuksen ja yksinkertaisen puun määrittely, ei enää päivitetä): https://app.notion.com/3f6977255eec81888418e86eb0a80af9
