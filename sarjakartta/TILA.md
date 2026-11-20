# Sarjakartta: tila

**Vaihe:** ensimmäinen versio, Emil kokeilee · **Versio:** 1.1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/sarjakartta/ · **Päivitetty:** 20.11.2026

Treenikartan yksinkertaisempi sisarsovellus (Emilin idea 20.11.2026): vain sarjat ja lihasryhmät. Ei liikkeitä, painoja, toistoja eikä treenin aloitusta tai lopetusta. Tallennusavain `sarjakartta.v1`, muoto `{app:'sarjakartta',ver:1,ryhmat:[{id,nimi,kuorma,tavoite,v,arkisto?}],sarjat:[{id,t,r:{ryhmäId:1|0.5},m}],as:{tila,vari,j0,gs,viety}}`; `repair` korjaa rikkinäisen tai puuttuvan tiedon. Vienti `sarjakartta.json`.

## Valmiina (1.1, 20.11.2026: katselmus ja korjaukset Emilin pyynnöstä)

- **Jakson alku viikkonumeroina:** Asetuksissa valitaan kuluva jakso (esim. ”vk 47–48” tai ”vk 46–47”), ei enää pariton/parillinen. Syy: vuodessa 2026 on 53 viikkoa, joten tammikuussa 2027 parillisuus olisi kääntynyt ja vanha teksti olisi näyttänyt väärää, vaikka jaksot jatkuvat oikein katkeamatta.
- **Kuten edellinen:** uuden sarjan ikkunassa linkki, joka kopioi saman päivän edellisen sarjan ryhmät yhdellä napautuksella (esim. ”Kuten edellinen: Rinta, Ojentajat ½”). Piiloutuu, kun sarjaan on valittu ryhmiä.
- **Muistiinpanon korjaus:** vanhaa muistiinpanoa avattaessa koko teksti oli valittuna, joten ensimmäinen kirjain olisi pyyhkinyt sen. Nyt kursori menee tekstin loppuun.
- **Päivän vaihtuminen:** jos appi on auki yön yli tai palaa taustalta seuraavana päivänä, näkymä päivittyy itsestään uuteen päivään (ennen otsikko ja Tänään-lista jäivät edelliseen päivään).
- Napit eivät maalaa tekstiä Safarissa nopeissa napautuksissa (`user-select:none`).
- Testejä 24 × 2 = 48.

## Valmiina (1.0)

- **Treeni:** alapalkissa iso + Sarja. Se avaa pienen ikkunan, jossa kaikki lihasryhmät ovat nappeina: 1. napautus = pääasiallinen kuormitus (1 sarja), 2. = osittainen (½), 3. = pois. Ulkopuolinen napautus tallentaa ja sulkee, ei OK-nappia. Sarjalle tallentuu kellonaika ja valitut ryhmät. Kynä-nappi avaa muistiinpanokentän kursorilla; sekin tallentuu ulkopuolisesta napautuksesta. Sarjan voi avata listasta: aika ja päivä korjattavissa (myöhempi kirjaus), poisto vahvistuksella.
- Treenin näkymä on aina kuluva päivä: ylhäällä taulukko ryhmistä (Tänään, liukuva 14 pv summa/tavoite palkkina, päiviä viimeisestä kerrasta), alla päivän sarjat luettelona (numero, kello, ryhmät, ½ merkittynä, muistiinpano).
- **Jaksot:** sarakkeina kahden viikon jaksot (viikkonumerot ja päivät otsikossa), rivinä lihasryhmät, ylhäällä kaikkien ryhmien sarjat ja kuormitus. Ruudun väri = osuus tavoitteesta (täysi + lihavointi = täyttynyt). Nimisarake ja otsikkorivi jäädytetty, sarakkeet vierivät yhdessä (Juuren tarkistuslistan malli). Otsikon napautus avaa jakson viikoittain, ruudun napautus ryhmän päivittäin.
- **Graafit:** Pv (14 pv), Vk (12 vk), Kk (12 kk) alapalkissa. Pinottu palkkikaavio ryhmittäin tai yksittäinen ryhmä (suodin: Kaikki / ryhmä), Sarjat tai Kuorma, tavoite katkoviivana, palkin napautus avaa erittelyn. Yhteensä, keskiarvo, paras, tavoite. Alla ryhmien osuus näkyvässä ajassa.
- **Tavoitteet:** jokaiselle ryhmälle palkki jakson tavoitetta kohti, pystyviiva = missä pitäisi olla päivän lopussa tasaisella tahdilla, puuttuva määrä, päiviä jäljellä, viikkokohtaiset summat, liukuva 14 pv. Kokonaiskuormitus palkkina.
- **Lihasryhmät:** taulukko (rivi = ryhmä, sarake = arvo, yksi ruutu per rivi, uusi napautus poistaa). Aihe vaihtuu kulmanapista: Tavoite (täysiä sarjoja / 2 vk, 1–40) ja Kuormitus (kerroin 0,5–5). Raahaus kahvasta, + Uusi (Enter tai ulkopuolinen napautus tallentaa), nimen muutos ja poisto ikkunassa. Käytetty ryhmä arkistoituu.
- Kuormitus = sarjat × ryhmän kerroin. Osittainen sarja on aina puoli.
- Jakson alku Valikko → Asetukset (1.1: valitaan viikkonumeroina). Oletus asetetaan ensimmäisellä avauksella niin, että jakso alkaa parittomasta ISO-viikosta. Jaksot jatkuvat katkeamatta vuodenvaihteen yli.
- Valikko: Varmuuskopio (pikavienti alapalkista jakovalikkoon, tuonti tiedostosta tai tekstistä vahvistuksella, punainen pallero jos vienti puuttuu päivän vaihduttua), Asetukset, Ulkoasu (10 teemaa, vaalea/tumma/laitteen mukaan).
- Ulkoasu: Appipaja 2.0 -teemat, järjestelmäfontti, ei isoja kirjaimia, ei emojeja, ohjeet i-napin takana, alapalkki samoin joka näkymässä.
- Testit `sh sarjakartta/testit/aja.sh`: 22 skenaariota × 2 leveyttä (390 vaalea, 320 tumma) = 44 läpi tietokoneen Chromiumissa (mm. summat, jaksojen rajat, graafien palkkimäärät ja yhteensä, ulkopuolinen napautus ei mene läpi, alapalkin nappien paikat, 16 px kentät).

### Poikkeamat appilinjasta

- Lihasryhmäsuodin graafeissa ja Pv/Vk/Kk-valitsin ovat nappirivejä, eivät taulukkoja. Graafin suodin näkyy samalla ruudulla kuin kaavio.
- Ryhmävalinnan nappien napautusalue on 36–50 px, suodinnapit 34 px (44 px vaatisi kaksi riviä lisää).
- Pelkkä muistiinpano (ilman ryhmiä) tallentuu sarjana, jossa ei ole kuormitusta.

## Ei tarkistettu

- Ei oikealla iPhonella. Varmistamatta: raahaus sormella, ikkunan ja näppäimistön yhteispeli (`visualViewport`) muistiinpanokentässä, päivä- ja kellovalitsin (`type=date`, `type=time`) Safarissa, jakovalikko, taulukon sivuttaisvieritys sormella, graafien luettavuus oikealla datalla (testidata on keinotekoista).
- Modern Web Guidance -hakua ei ajettu; käytössä sticky, pointer events, SVG, `hsl()` välilyönnillä erotettuna (Safari 12.1+).

## Seuraavaksi

- Emil kokeilee ja kertoo, mikä on kömpelöä. Ideoita (ehdotuksia, ei sovittu): lihasryhmien yhteenveto viikkonäkymänä (nyt vain 2 vk), liukuva 14 pv graafina, sarjan nopea kopiointi edellisestä, tuonti Treenikartasta.

## Avoimet kysymykset

- Pitäisikö muistiinpanolle olla oma listansa/haku?
- Onko 14 päivän liukuva ikkuna oikea vai pitäisikö sen olla vaihdettavissa (7/14/28)?

## Emilin kommentit

- (tyhjä)
