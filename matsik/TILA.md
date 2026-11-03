# Mätsik Forest: tila

**Vaihe:** versio 0.3. **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/matsik/ · **Päivitetty:** 3.11.2026

Juureen (`paatospuu/`) nojaava, mutta erillinen hoitosuunnitelmien demo- ja kehittämisappi. Kaikki sisältö on kuvitteellista, ja Emil kirjoittaa sen itse. Appi ei sisällä valmista dataa. Hahmotelma ja perustelut ovat projektikansiossa (`hoitojuuri/HAHMOTELMA.md`), ei tässä julkisessa repossa.

## Versio 0.3 (3.11.2026, Emil)

- **Käyntisykli** korvaa käyntitiheyden, lääkärin välin ja mittausvälit. Hoitotoimissa on syklin alkupäivä ja kuusi laatikkoa: Vk 1, Vk 2, Vk 3, Vk 4, Kk 2 ja Kk 3.
  - Sykli kestää 3 kk. Se alkaa alkupäivän viikon maanantaista ja alkaa automaattisesti alusta. Kk 2 alkaa viidennen viikon alusta ja kestää kuukauden kakkosen loppuun, ja Kk 3 kestää syklin loppuun.
  - Laatikon *Valitse* avaa valinnan (useita sallittu), joka on jaettu ryhmiin Käynnit ja Seuranta. Valinnan jälkeen laatikossa näkyy jokaisen valinnan tila: tehty, sovittu, sovittava tai myöhemmin. Käynnissä oleva laatikko on korostettu.
  - Herja tulee, jos laatikko on käynnissä tai alkaa kahden seuraavan täyden viikon aikana ja sen valinnalle ei ole sovittua tai tehtyä merkintää. Herja on kiireellinen, jos laatikko päättyy viikon sisällä.
  - Merkinnäksi kelpaa muistiinpanon rivi, jossa on eläimen nimi, aika laatikon sisällä ja valinnan tunnistussana. Peruttu ei kelpaa. Mittaus täyttyy myös Lääkeseurannan kirjauksesta.
- **Valikon muokattavat luettelot**:
  - *Käyntisyklin sisällöt*: nimi, tunnistussanat, laji (Käynti tai Seuranta) ja Seurannalle valinnainen kytkentä Lääkeseurannan kirjaukseen. Oletuksena ovat Emilin 10 sisältöä. Käynti-lajin sana tekee rivistä käynnin.
  - *Käyntien muodot*: nimi ja tunnistussanat. Oletuksena ovat Yksilö, Perhe, Koti, Puhelu ja Verkosto.
  - Rivin voi lisätä, muokata, siirtää ylös tai alas ja poistaa vahvistuksella. Poisto kertoo käyttömäärän ja poistaa rivin myös eläinten valinnoista. Tyhjä uusi rivi ei jää luetteloon.
  - Tunnistussääntö: sanan alku tai osa riittää (paino → painoa). Enintään 3 merkin sana tunnistetaan vain kokonaisena (rr, ep, lk, isä). Siksi "lääk" ei ole enää lääkärisana, koska se osui myös lääkitykseen.
- Tallennus: `asetukset.sisallot` ja `asetukset.muodot` (valinnaiset). Vanha data saa oletukset, ja `ver` on edelleen 1. Eläimellä `toimet.alku` ja `toimet.sykli` {vk1…kk3: [sisällön id]}. Vanhat kentät `tiheys`, `laakari` ja mittausvälit jäävät dataan käyttämättöminä.
- Korjattu: laatikko käytti luokkaa `.now`, joka on kalenterin nykyhetken viiva. Tämä aiheutti päällekkäisen asettelun.
- Testit: `logiikka.js` (39) ja `selain.js` (sykli, oma sisältö Valikosta laatikkoon ja herjaksi, poisto). Leveydet 390, 320 ja 1280 px, kaikki ok.

## Versio 0.2 (3.11.2026, Emil)

- **Kalenteri Juuren mallilla.** Ylhäällä on viikkonauha ma–su (pyyhkäisy vaihtaa viikkoa) ja kuukausi otsikosta. Puhelimella näkyy valitun päivän aikajana 0–24, koneella (≥ 900 px) seitsemän saraketta. Koko päivän merkinnät ovat aikajanan alla.
  - Uusi merkintä: kosketuksella pito 0,25 s tuo vihreän viivan pyöristettynä varttiin. Viivaa voi raahata, reilu sivuveto peruu ja nosto avaa uuden muistiinpanon, jossa on valmiina esim. "ti 10.11. klo 14.00–14.30". Hiirellä napsautus tai veto.
  - Merkinnän siirto: puhelimella pitkä painallus (0,35 s), hiirellä veto, 15 min askelin. Alareunan kahva muuttaa loppuaikaa. Pudotus viikkonauhan päivälle siirtää päivän, ja pudotus Koko päivä -alueelle poistaa kellonajan. Ajaton merkintä siirtyy aikajanalle samalla tavalla.
  - Muutos kirjoitetaan muistiinpanon tekstiin: vain päivä- ja aikasanat vaihtuvat. Toteutui/Peruttu-tila seuraa merkintää.
  - Napautus avaa muistiinpanon. Käynnin Toteutui ja Peruttu ovat muistiinpanon ikkunassa ja Hoitotoimissa.
  - Asetus: uuden merkinnän oletuspituus 15/30/45/60 min, oletus 30. Tallennus `asetukset.kesto`, valinnainen.
  - Aikasanat tunnistavat nyt myös loppuajan (`klo 14–15`, `klo 14.00–14.30`).
- **Muistio tallentuu itsestään:** 1,2 s kirjoitustauon jälkeen ja kentästä poistuttaessa samaan muistiinpanoon. Kenttä tyhjenee poistuttaessa. Ikkunassa ei ole Tallenna-nappia: Valmis ja ruksi sulkevat. Tyhjäksi pyyhitty muistiinpano poistuu.
- **Alapalkki:**
  - Vasemmalla on osionappi (Eläimet, Muistio, Kalenteri, Valikko). Napautus avaa valikon alhaalta, ja pyyhkäisy vaihtaa osiota.
  - Keskellä ovat osion toiminnot:
    - Eläimet: plusnappi
    - eläin: ‹ Eläimet ja Nimi
    - Muistio: plusnappi
    - Kalenteri: ‹, Tänään ja ›
  - Oikealla on pikavienti Vie (punainen piste, kun vienti on tekemättä).
  - Yläreunassa on vain otsikko.
- **Asiakkaat → Eläimet** kaikissa näkyvissä teksteissä. Tallennusmuoto ennallaan (`asiakkaat`).
- Testit: `logiikka.js` (31) ja `selain.js` (kalenterin pito, siirto, kahva, pudotus päivälle, kuukausi, sivuveto, automaattitallennus, alapalkki). Leveydet 390 ja 320 px kosketuksella ja 1280 px hiirellä, kaikki ok.

## Versio 0.1 (2.11.2026)

- **Asiakaslista:** rivi on asiakas. Järjestyksen määrää tärkein avoin herja: ensin kiireelliset, sitten tavoitetason mukaan. Rivillä näkyy tärkein herja ja +N, tai Kunnossa ja seuraava käynti. Uusi asiakas, nimen muutos, arkistointi (palautus Valikosta) ja poisto vahvistuksella.
- **Hoitosuunnitelman osiot:** Tulosyy, Diagnoosit (Emilin oma luettelo Valikossa ja vapaa lisäys), Esitiedot, Kehityshistoria, Ajankohtainen tilanne ja toimintakykyarvion päivämäärä, Koulu, Sosiaalityö, Vahvuudet, Tavoitteet, Hoidon tarve (4 kysymystä), Hoitotoimet ja Lääkeseuranta, sekä Huomiot muistiosta.
- **Tavoitteet:** hoidon syyt ovat asiakkaan lista (haitta ja psykiatrinen taustasyy). Tavoitteella on taso (1 turvallisuus, 2 hoidon mahdollistaminen, 3 elämänlaatu), syy (tai Hoidon mahdollistaminen), lapsen, vanhempien ja työntekijän tavoitteet, keinot sekä tilanne (Alussa, Etenee, Jumissa, Saavutettu).
- **Arviointikierros:** prosessikaavio hahmotelman kohdan 3b mukaan. Yhtä mieltä -kysymykseen vastataan osapuolittain, ja vastauksista voi palata Takaisin. Toimenpiteeseen päättyvä arvio jää avoimeksi herjaksi, kunnes se merkitään tehdyksi.
- **Säännöt (herjat):**
  - Puuttuu: tulosyy, diagnoosit, vahvuudet, tavoitteet, käyntisykli (0.3), toimintakykyarvion päivämäärä.
  - Vanhentunut: Esitiedot, Koulu, Sosiaalityö, Hoidon tarve ja Hoitotoimet. Kuittaus: *Tarkistettu, pitää paikkansa*. Toimintakykyarvio vanhenee päivämääränsä mukaan.
  - Käynnit, lääkäri ja mittaukset: 0.3:sta lähtien käyntisykli (yllä). Horisontti on edelleen kaksi seuraavaa täyttä kalenteriviikkoa.
  - Tavoitteen arviointi välein, avoin toimenpide ja Jumissa-tila. Tason 1 herjat ovat kiireellisiä.
  - Tarkistusvälit muokataan Valikossa. Oletukset: esitiedot, koulu, sosiaalityö, tarve ja toimet 6 kk, tavoite 3 kk, toimintakykyarvio 12 kk.
- **Muistio:** vapaa teksti. Asiakkaan nimi (myös taivutettuna, esim. Ketulle) liittää muistiinpanon asiakkaaseen. Päiväys (10.11.), viikonpäivä, huomenna tai klo vie sen kalenteriin. Rivillä oleva käyntisana (käynti, perhekäynti, soitto, puhelu, vastaanotto, tapaaminen, neuvottelu) tekee siitä käynnin, ja sana lääkäri merkitsee lääkärin mukaan. Hoitotoimien *+ Käynti muistioon* aloittaa muistiinpanon asiakkaan nimellä.
- **Ulkoasu:** galleriasta tulevat 6 teemaa (Kuutamo, Sammalpolku, Revontuli, Puolukka-ilta, Aamu-usva, Talviuni) ja niiden eläinkuvitukset. Juuren nappimuodot (Terävä, Pehmeä, Pyöreä, Pilleri) ja järjestelmäfontit. Kuvitus voi olla Yläkaista, Kapea tai Pois. Oletus on Puolukka-ilta.
- **Tallennus:** vain laitteella, `localStorage` avain `matsik:v1`, muoto `{app:'matsik', ver:1, savedAt, data:{asiakkaat, muistio, asetukset, meta}}`. Projekteja on vain yksi. Vienti tapahtuu aina tiedostoon `Mätsik Forest.json` (iPhonella jakovalikko), ja tuonti tiedostosta tai tekstinä korvaa kaiken varoituksen kanssa. Valikossa näkyy punainen piste, jos muutokset on viety viimeksi edellisenä päivänä tai aiemmin.
- **Testit:** `sh matsik/testit/aja.sh`. `logiikka.js` sisältää 31 sääntötestiä. `selain.js` on käyttöpolku 390 ja 320 px kosketuksella ja 1280 px hiirellä.

## Ei rakennettu

- Juuren kalenterin aikaväli (näkyvä päivä, pois käytöstä olevat viikonpäivät) ja aikaehdotukset.
- Juuren sanalinkit, `---`-tekstit, toistuvuus ja asiasanat.
- Tulosyy asiasanoina.
- Arviointikaavion muokkaus asetuksissa: kaavio on nyt koodissa.
- Tason 2 tavoitteen linkki tavoitteeseen, jonka se mahdollistaa (avoin kysymys).
- Hoidon tarpeen vastauksista johdettu yksikkösuositus.
- Omat osiot.

## Ei tarkistettu

- Testit ajettiin tietokoneen selaimessa (Chromium, kosketus simuloituna), ei oikealla iPhonella: Safari, kotinäytön kirjanmerkki, sanelu, jakovalikko, kalenterin pito ja raahaus sekä vierityksen lukitus raahatessa.
- Antiikva- ja Pyöreä-fontit näkyvät oikein vain Applen laitteilla.
- Testiselain antoi ä-kirjaimelliselle tiedostonimelle nimen "download". iPhonen jakovalikossa nimen pitäisi säilyä. Jos ei säily, nimeksi vaihdetaan `Matsik Forest.json`.
- Nimen tunnistus taivutuksista on karkea: nimen alusta otetaan kaikki paitsi kaksi viimeistä kirjainta, vähintään kolme kirjainta. Tämä voi tuottaa vääriä osumia.

## Seuraava askel

Emil kokeilee sykliä puhelimella. Avoimet kysymykset:
1. Onko syklin rytmi oikein: alku viikon maanantaista, Kk 2 alkaa viidennen viikon alusta, ja sykli alkaa itsestään alusta?
2. Mitä muita luetteloita tehdään muokattaviksi? Ehdokkaita ovat osallistujaroolit, koulun ja sosiaalityön tukitoimet sekä sijoitus.
3. Tarvitaanko tason 2 tavoitteeseen linkki?
4. Muokattava kaavioteksti.

## Emilin kommentit
