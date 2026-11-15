# Treenikartta: tila

**Vaihe:** uudistettu appilinjan mukaan, Emil kokeilee · **Versio:** 2.1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/treenikartta/ · **Päivitetty:** 15.11.2026

Salitreenin kirjaus ja seuranta puhelimella. Omat liikkeet, ei valmiita. Suunnitelma ja perustelut: Claude Doc ”Salitreeniappi – speksi” (Appi-ideoita-projekti). Kehitetty ensin claude.ai-kokeiluna, siirretty repoon 31.10.2026. Tallennusavain `treenikartta.v2`, muoto `{app:'treenikartta',ver:5,liikkeet,ryhmat,treenit,auki,as}`; vanhat versiot korjaa `repair`.

## Valmiina (2.0, 15.11.2026)

Koko käyttöliittymä uudistettu Emilin appilinjan (`appilinja`-skill) mukaan, Emilin pyynnöstä ”yllätä mut, saa olla isojakin muutoksia”. Tallennusmuoto ei muuttunut (ver 5).

- **Runko:** ylhäällä yksi pieni inforivi (päivä, alkuaika, kesto; ohje i-napin takana). Alapalkissa vasemmalla osionappi (avaa pienen valikon: Treeni, Liikkeet, Lihasryhmät, Historia, Seuranta ×3), keskellä osion oma ohjain (Lopeta / + Uusi / liikevalinta), oikealla pikavienti ja Valikko. Vanha viiden välilehden palkki ja alavälilehdet poistettu.
- **Treeni:** liikelista ylhäällä (nimi, päivän sarjat tai ehdotus, päivät edellisestä, laskuri). Kirjaus jäädytettynä alhaalla alapalkin päällä: liikkeen nimi, sarja n/x, jakson tilanne, ”Viimeksi …”, Toistot − [8] +, Paino − [70] + (painoaskeleen verran), OK, päivän sarjat nappeina. Toistot ensin. Plus ja miinus eivät avaa näppäimistöä; kenttään voi yhä kirjoittaa. Sarjan nappi avaa pienen ikkunan (toistot, paino, kello, Poista sarja), joka tallentuu itsestään. Lopeta alapalkissa, vahvistus pienessä ikkunassa.
- **Liikkeet ja Lihasryhmät taulukkoina:** rivi = liike tai ryhmä, sarakkeet = arvot, yksi ruutu per rivi, toinen napautus poistaa. Aihe vaihtuu vasemman yläkulman napista (liikkeet: ideaali, min, max, sarjaa/kerta, sarjaa/jakso, jakso pv, painoaskel, pääkohde, sivukohteet; ryhmät: sarjaa/jakso, jakso pv). Nimisarake ja otsikkorivi jäädytetty, sarakkeet vierivät sivuttain. Järjestys raahaamalla kahvasta (sama järjestys Treenissä). Nimi avaa kortin: liikkeellä nimi, tavoitteet ja poisto; ryhmällä nimi, ”aseta ryhmän liikkeille” ja poisto.
- **Lisäys ja muokkaus:** + Uusi avaa pienen ikkunan, Enter tai ulkopuolinen napautus tallentaa. Ei Tallenna/Peru-rivejä: kaikki tallentuu heti. Nimi luetaan ensin tekstinä, Muuta avaa kentän.
- **Poisto:** aina pienen vahvistusikkunan takana (Peru vasemmalla, Poista oikealla, eri kohdassa kuin ensimmäinen napautus). Käytetty liike arkistoituu.
- **Valikko:** viisi riviä, jokainen oma alasivunsa (Varmuuskopio, Tuo treenejä tekstinä, Asetukset, Kaikille liikkeille, Ulkoasu), paluu ‹ Valikko vasemmasta alakulmasta. Asetukset ovat valintoja, ei kenttiä.
- **Pikavienti:** alapalkin vientinappi vie `treenikartta.json` suoraan jakovalikkoon (tai lataa). Punainen pallero, jos vientiä ei ole tehty sen jälkeen, kun päivä on vaihtunut.
- **Pienet ikkunat:** ulkopuolinen napautus sulkee eikä mene läpi. Ohjeet vain i-napin takana. Ei emojeja, kuvakkeet ohuita viivoja. Valittu vaihtoehto käänteisvärillä.
- Ennallaan: painoehdotus (Epley, ideaalitoistot), automaattinen päättyminen (2/3/4 h), tavoitteet ja ennuste, Seurannan kolme näkymää, tekstituonti ja ohje tekoälylle, 10 teemaa, 12 fonttia, iso koko.
- Testit `sh treenikartta/testit/aja.sh`: 31 skenaariota × 2 leveyttä (390 vaalea, 320 tumma) = 62 läpi tietokoneen Chromiumissa. Mukana ”napautus ei siirrä nappeja”, ulkopuolinen napautus, raahaus hiirellä, alapalkin nappien sama paikka joka osiossa.

### 2.1 (15.11.2026): graafit, Emilin pyynnöstä ("lisää helppoja graafeja, tavoitteiden lähestyminen, toteuta")

- Uusi osio **Seuranta: yleiskuva** (osiovalikossa ensimmäinen Seuranta): treenipäivien ruudukko 12 viikolta (sarake = viikko, rivi = viikonpäivä, sävy = sarjamäärä) ja samoissa sarakkeissa viikon sarjat palkkeina; luvut Tällä viikolla, Treeniä / vk, Viikkoja putkeen.
- **Tavoitteet** yleiskuvassa: jokaiselle tavoitteelle palkki lähtötasosta tavoitteeseen. Täyttö = matkasta kuljettu, pystyviiva = missä pitäisi olla tänään tasaisella tahdilla. Teksti tavoitteen toistomäärälle muunnettuna (”Nyt noin 62,5 kg × 5 · 37 %”), päiviä jäljellä, tila. Sama palkki liikkeen seurannan tavoitekortissa. Taso = kahden viimeisimmän kerran parempi maksimiarvio. Uusi valinnainen kenttä tavoitteessa: `luotu` (lähtöhetki); vanhalle tavoitteelle se asetetaan enintään 8 viikon taakse.
- **Arvioitu maksimi, 12 viikkoa**: jokaiselle liikkeelle pieni käyrä, nykyarvo ja muutos 4 viikossa. Rivin napautus avaa liikkeen seurannan.
- Liikkeen seuranta: toistojakauma palkkeina (ideaali korostettu) ja sarjat jaksoittain palkkeina tavoiteviivalla. Lihasryhmät: 6 edellistä jaksoa ja nykyinen palkkeina tavoiteviivalla.
- Selitys i-napin takana. Testejä 32 × 2 = 64.

### Poikkeamat appilinjasta

- Isot kirjaimet oletuksena päällä ja fontin valinta: Emilin oma päätös tälle appille (1.2).
- ”Aseta ryhmän liikkeille” ja ”Kaikille liikkeille” ovat yhä kenttälomakkeita esikatselunapilla: joukkomuutos korvaa monen liikkeen arvoja, joten se vaatii esikatselun eikä tallennu itsestään.
- Tavoitteen lisäys (paino, toistot, päivä) ja tekstituonti käyttävät kenttiä ja nappia: vapaa luku ja päivämäärä eivät mahdu taulukkoon.
- Taulukon ja vahvistuksen virheet näkyvät kelluvana ilmoituksena ylhäällä (ei työnnä sisältöä).
- Poisto on linkki + vahvistusikkuna, ei pitkä painallus.

## Ei tarkistettu

- 2.1: graafien luettavuus oikealla iPhonella ja oikealla datalla (testidata on tasaista); ruudukon sävyt eri teemoilla katsottu vain Metsä vaalea ja tumma.
- Testit ajettu vain tietokoneen Chromiumissa, ei oikealla iPhonella. Varmistamatta: raahaus sormella kahvasta (testattu hiirellä), kirjausrivin ja pienen ikkunan paikka näppäimistön ollessa auki (`visualViewport`), alapalkin piiloutuminen näppäimistön ajaksi, pysyykö näppäimistö auki kun OK siirtää kursorin toistoista painoon, jakovalikon ”Tallenna tiedostoihin”, kotinäytön kirjanmerkin turva-alueet.
- Fontit testattu Linuxilla, jossa Avenir/Futura/Gill Sans/DIN/Tussi korvautuvat varafontilla.
- Vanhaa 1.x-tyyliä on yhä tiedostossa käyttämättömänä (ei näy, ei siivottu).
- Modern Web Guidance -hakua ei ajettu tälle kierrokselle; käytetyt tekniikat (sticky, pointer events, visualViewport, color-mix) ovat laajasti saatavilla.

## Seuraavaksi

- Emil kokeilee 2.0:aa salilla ja kertoo, mikä toimii ja mikä ei. Vanha 1.4 löytyy tarvittaessa git-historiasta (commit 6aa75c5).
- Ohjelmamoodi: suunnitelma `treenikartta/OHJELMAMOODI.md`, odottaa Emilin vastauksia ja toteuta-lupaa.
- Mahdollisia jatkoja (ehdotuksia, ei sovittu): treenipohjat, lämmittelysarjan merkintä, varaan-toistot (RIR), kokeilujakso järjestyksen vaikutukselle.

## Avoimet kysymykset

- Painoehdotuksen logiikka (Emil palaa tähän): lasketaanko ensimmäisestä vai kaikista sarjoista, vaikuttaako varaan-luku, montako kertaa ennen laskua.

## Emilin kommentit

- (tyhjä)
