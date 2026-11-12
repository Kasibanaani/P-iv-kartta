# Treenikartta: tila

**Vaihe:** ensimmäinen versio, Emil kokeilee · **Versio:** 1.4 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/treenikartta/ · **Päivitetty:** 12.11.2026

Salitreenin kirjaus ja seuranta puhelimella. Omat liikkeet, ei valmiita. Suunnitelma ja perustelut: Claude Doc ”Salitreeniappi – speksi” (Appi-ideoita-projekti). Kehitetty ensin claude.ai-kokeiluna, siirretty repoon 31.10.2026. Tallennusavain `treenikartta.v2`, muoto `{app:'treenikartta',ver:5,liikkeet,ryhmat,treenit,auki,as}`; vanhat versiot korjaa `repair`.

## Valmiina (1.0)

- Kirjaus (1.4): liike valitaan listasta → ylhäällä pysyvä kirjauspaneeli → Toistot (napauta kenttää) OK → Paino OK. OK ilman kursoria tallentaa valmiiksi täytetyt arvot. Aikaleima treenin alkuun ja jokaiseen sarjaan; sarjan kellonaika ja treenin alkuaika muokattavissa jälkikäteen.
- Lopeta treeni -nappi; ilman sitä treeni päättyy 2 h viimeisen sarjan jälkeen ja loppuajaksi tulee viimeisen sarjan aika (Asetukset: 2/3/4 h).
- Liikkeet: oma järjestys, toistot min/ideaali/max, sarjaa/kerta, sarjaa/jakso omalla jaksolla, painoaskel, pää- ja sivukohteet, tavoitteet (esim. 6 × 120 kg pvm mennessä) ja ennuste 8 viikon trendistä.
- Lihasryhmät: tavoite omalla jaksolla (esim. 14 / 10 pv), joukkoasetukset ryhmän tai kaikille liikkeille; korvattavat arvot listataan rasteilla.
- Painoehdotus tähtää ideaalitoistoihin (Epley), muuten tuplaprogressio min–max.
- Seuranta: maksimiarvio ja käyrä tavoitteineen, sarjapituus vs. ideaali, sarjat jaksoittain; lihasryhmien jakso, sarjaa/kerta, väli; Yhteydet = Pearsonin korrelaatiot kerta- ja jaksotasolla (n ≥ 5).
- Tiedot: pikanappi ”Tiedot” (vie JSON-tiedostona jakovalikon kautta tai lataa, tuo JSON-tiedostosta vahvistuksella; punainen piste, jos viennistä yli 7 pv), tekstivarmuuskopio, tekstituonti (`2026-10-28 17:05` + `Liike: 60x8x3, 62,5x7@17:12`) esikatselulla ja tuplien ohituksella, vienti tekstinä, ohje tekoälylle.
- Appipaja 2.0: 10 teemaa, vaalea/tumma/laitteen mukaan, iso koko.
- 1.1: lihasryhmät omana luettelona Lihasryhmät-välilehdellä (lisää, järjestä, nimeä, poista; nimenmuutos ja poisto päivittävät liikkeet), liikkeen pääkohde valikosta ja sivukohteet napautettavasta luettelosta. Isot ja pienet kirjaimet samanarvoisia ryhmissä, liikkeiden nimissä ja tuonnissa; vanhat tiedot yhdistetään ryhmäluetteloon. Liikkeet- ja Seuranta-välilehtien alavalinnat alareunassa.
- 1.4 (12.11.) käytettävyyskierros, Emilin pyynnöstä ilman erillistä hyväksyntää:
  - Treeni: toistot ennen painoa. Kirjausrivi (Toistot, Paino, OK) on aina näkyvissä ylhäällä pysyvässä paneelissa, + Sarja -nappia ei enää ole. Liikkeen valinta ei liikuta listaa eikä paneelia (vakiokorkeus). Päivän sarjat näkyvät paneelissa pieninä nappeina, napautus avaa muokkauksen. Kenttään napautus valitsee vanhan arvon, joten uusi luku korvaa sen.
  - Treenilista yhtenä korttina, rivi 42 px: nimi, päivän sarjat tai ehdotus ja päivät edellisestä kerrasta, sarjalaskuri. Iso otsikko ja tilakortti poistettu; alkuaika ylärivillä, kesto ja sarjamäärä alapalkissa Lopeta-napin vieressä.
  - Liikkeet: tiivis lista, rivin napautus avaa muokkauksen, + Lisää liike otsikkorivillä. Lomakkeen ohjetekstit piilossa ? Ohjeet -napin takana, Tallenna/Peru/Poista pysyvät näkyvissä alareunassa.
  - Historia: tiivis lista, rivillä treenin liikkeet; avattuna sarjat yhdellä rivillä per liike.
  - Seuranta: liike valitaan valikosta (ei nappirivistöä), Kerrat-taulukossa järjestys omana sarakkeenaan, lihasryhmäkortit tiiviimmät.
  - Asetukset: osiot avattavina riveinä (päättyminen, tuonti, varmuuskopio, ulkoasu), kaikki näkyy yhdellä ruudulla.
  - Yleinen: pienemmät otsikot, välit ja reunat; ilmoitus (toast) yläreunassa.
- 1.3 (8.11.): lepoaika poistettu kokonaan (ajastin, sarjarivit, muokkaus, ”Tehty aiemmin?”). Lopeta treeni on pieni nappi alareunassa navigaation yläpuolella, ja vahvistus tapahtuu samassa kohdassa (Jatka / Vahvista lopetus). Paino ja toistot ovat samalla rivillä, ja painon OK siirtää kursorin toistoihin piirtämättä näkymää uudelleen, jotta näyttö pomppii vähemmän.
- 1.2.2: liikelomake tallentuu itsestään, kun siirrytään toiselle välilehdelle (ennen muutos katosi hiljaa, esim. nimen korjaus ei näkynyt Treenissä). Virheellinen lomake jää auki virheilmoituksen kanssa. Peru hylkää muutokset. Lihasryhmälomaketta ei vielä tallenneta automaattisesti.
- 1.2.1: JSON-vienti on aina nimeltään `treenikartta.json`.
- 1.2: Asetukset → Ulkoasu: Isot kirjaimet (oletuksena päällä, koko appi caps-tyylillä; tallennettu teksti säilyy sellaisenaan) ja 12 fonttia (järjestelmän omia: Perus, Pyöreä, Avenir, Kapea, Futura, Gill Sans, DIN, Serif, Georgia, Tasaleveä, Kirjoitin, Tussi; ei ulkoisia).
- 1.0.1: kenttien teksti 16 px ja viewport maximum-scale=1, ettei iPhone zoomaa kenttään mennessä.
- Testit `sh treenikartta/testit/aja.sh`: 48 selainskenaariota (390 ja 320 px) läpi tietokoneen Chromiumissa.

## Ei tarkistettu

- 1.4: oikealla iPhonella varmistamatta: pysyykö näppäimistö auki, kun OK siirtää kursorin toistoista painoon; valitseeko kentän napautus vanhan arvon; pysyykö kirjauspaneeli ylhäällä (sticky) näppäimistön ollessa auki.
- 1.3: pomppimisen väheneminen oikealla iPhonella (näppäimistö pysyy auki OK:n yli?) ei ole varmistettu.
- Oikea iPhone/Safari: näppäimistön avautuminen automaattisesti kenttään, jakovalikon ”Tallenna tiedostoihin”, kotinäytön kirjanmerkki. Fontit testattu Chromiumissa Linuxilla, jossa Avenir/Futura/Gill Sans/DIN/Tussi korvautuvat varafontilla; iPhonessa niiden pitäisi näkyä oikein.
- claude.ai-kokeiluversion tiedot eivät siirry itsestään: ne pitää viedä sieltä tekstivarmuuskopiona ja tuoda tänne.

## Seuraavaksi

- Emil käyttää salilla ja kertoo, mikä kirjauksessa hidastaa.
- Ohjelmamoodi: suunnitelma `treenikartta/OHJELMAMOODI.md`, odottaa Emilin vastauksia ja toteuta-lupaa.
- Mahdollisia jatkoja (ehdotuksia, ei sovittu): treenipohjat, lämmittelysarjan merkintä, varaan-toistot (RIR), kokeilujakso järjestyksen vaikutukselle.

## Avoimet kysymykset

- Painoehdotuksen logiikka (Emil palaa tähän): lasketaanko ensimmäisestä vai kaikista sarjoista, vaikuttaako varaan-luku, montako kertaa ennen laskua.

## Emilin kommentit

- (tyhjä)
