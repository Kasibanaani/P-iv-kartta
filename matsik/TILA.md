# Mätsik Forest: tila

**Vaihe:** versio 0.8. **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/matsik/ · **Päivitetty:** 12.11.2026

Juureen (`paatospuu/`) nojaava, mutta erillinen hoitosuunnitelmien demo- ja kehittämisappi. Kaikki sisältö on kuvitteellista, ja Emil kirjoittaa sen itse. Appi ei sisällä valmista dataa. Hahmotelma ja perustelut ovat projektikansiossa (`hoitojuuri/HAHMOTELMA.md`), ei tässä julkisessa repossa.

## Versio 0.8 (12.11.2026, Emil: "tee kaikki suosittelemasi muutokset")

Käytettävyyssuunnitelman (`SUUNNITELMA.md`) kaikki neljä askelta yhtenä julkaisuna. Periaate: kartta ylhäällä, valittu alla. Kyselyyn ei ollut vastauksia, joten avoimet kohdat tehtiin suositusten mukaan.

- **Eläinlista:** rivi on yksi rivi (tilaraita, nimi, tärkein muistutus, +N). Ylhäällä rajaussirut *Kaikki / Käynnit / Tavoitteet / Puuttuu / Tarkista / Ohjaus*. Laji valittuna lista on työjono kaikilta eläimiltä, ja rivillä on suoraan toimintonappi (Sovi, Arvioi, Tehty, Lisää, Pitää paikkansa, Avaa).
- **Eläimen sivu:** ylhäällä Nyt-kortti: tärkein muistutus, toimintonappi ja *Ensin, koska: …* (säännön nimi). Muut muistutukset ryhmäsiruina, napautus avaa ryhmän. Alla vaiheet 1–4 otsikkoina, joissa tilapiste ja vaiheen tärkein muistutus.
- **Lukutila:** täytetty osio näkyy tekstirivinä (enintään 4 riviä). Tyhjät osiot ovat vaiheen lopussa *+ Osio* -nappeina, ja muistutuksen osio on korostettu. Huomiot muistiosta suljettuna sivun lopussa.
- **Muokkausarkki:** rivin tai napin napautus avaa arkin, jossa on yksi kenttä kerrallaan. *‹ Edellinen / Seuraava ›* vaihtaa kentän samassa tekstikentässä, jolloin näppäimistö pysyy auki. Arkki asettuu näkyvän alueen (visualViewport) mukaan näppäimistön yläpuolelle, ja alapalkki piiloutuu näppäimistön ajaksi. Arkin sulkeminen palauttaa vierityskohdan.
- **Alapalkki eläimen sivulla:** *‹ Eläimet* · vaihenapit 1–4 tilapisteineen (seuraavat vieritystä, napautus vierittää) · plus = uusi muistiinpano eläimen nimellä. 320 px:ssä Eläimet-sana piiloutuu.
- **Tavoitekartta:** 3 × 3 (tasot riveinä, lapsi / vanhemmat / työntekijä sarakkeina), ruudussa tilaraita ja tavoitteen nimi. Napautus avaa ruudun kartan alle: tavoitekortit (Arvioi, Muokkaa, Seuranta), tasolla 2 periaatteet ja *+ X tavoite tasolle N*. Hoidon syyt siruina kartan yläpuolella.
- **Syklinauha:** kuusi laatikkoa rinnakkain tilapisteillä (täytetty vihreä = tehty, vihreä rengas = sovittu, punainen = sovittava, harmaa = myöhemmin). Valitun laatikon sisällöt alla, *+ Sovi* avaa muistiinpanon valmiilla alulla ("Kettu lähikäynti "). *Muut sovittavat* lähiviikoilta ja *Käynnit muistiosta*.
- **Mittaus muistiosta:** rivi, jossa on eläimen nimi, mittarin tai lääkeseurannan sana ja luku, kirjautuu itsestään (esim. "Kettu paino 41", "RR 112/70", "FIT 36"). Päiväys, kellonaika ja tuleva päivä eivät ole mittauksia. Arvo täyttää syklin laatikon ja näkyy rivillä merkinnällä *muistiosta*. Muistiinpanossa näkyy siru "Paino 41 · kirjattu".
- **Omat säännöt:** Valikko → Säännöt ja välit. Muistutusten järjestys omana listana (Ylös/Alas), jokainen *Kiireellinen / Tavallinen / Pois*. Oletus: tason 1 asiat, sovittava käynti jonka laatikko päättyy viikon sisällä, taso 2, muut sovittavat, taso 3, ohjaus ja haasteet, puuttuvat, vanhentuneet. *Palauta oletukset*.
- **Portaat** (oletus päällä): puuttuvista tiedoista näkyvät vain varhaisimman vaiheen puutteet. Käynnit, arvioinnit ja tavoitteiden asiat näkyvät aina.
- **Valikko alasivuina:** Tiedot, Ulkoasu ja kalenteri, Luettelot, Säännöt ja välit, Arkisto. Alasivun alapalkissa *‹ Valikko*.
- **Ulkoasu:** otsikot lähes leipätekstin kokoisia. Painettu valinta on käänteisväri, ja korostusväri on vain päätoiminnolla. Linkkinapit ovat alleviivattua tekstiä, ja poisto on hillitty, kunnes se vahvistetaan. Tietokoneella (≥ 900 px) vaiheet näkyvät kahtena sarakkeena ja ≥ 1500 px:ssä neljänä.
- **Tallennus:** `ver` edelleen 1. Uudet valinnaiset kentät `asetukset.saannot` [{id, tila}] ja `asetukset.portaat`. Vanha data saa oletukset, ja viallinen sääntölista korjautuu. Muistion mittauksia ei tallenneta erikseen, vaan ne luetaan muistiinpanoista.
- Korjattu samalla: Nyt-kortin päivitys viittasi poistettuun funktioon, ja Mittarit- ja Lääkeseuranta-lisäysnapit avasivat väärän arkin.
- Testit: `logiikka.js` (68) ja `selain.js` (86 tarkistusta kolmella leveydellä: Nyt-kortti, portaat, arkki ja Seuraava samassa kentässä, simuloitu näppäimistö, syklinauha ja Sovi, mittaus muistiosta, vaihenapit, tavoitekartta, työjono, Valikon alasivut, säännöt). 390, 320 ja 1280 px, kaikki ok.

## Versio 0.4 (9.11.2026, Emil: Mätsik-kartan muutokset 3.11.)

- **Osiot vaiheittain**: 1 Mistä lähdetään (tulosyy, esitiedot, kehityshistoria, ajankohtainen tilanne, koulu, sosiaalityö, vahvuudet), 2 Mikä on ongelma ja onko siihen apua (diagnoosit, hoidon tarve, haasteet), 3 Mihin pyritään (tavoitteet, mittarit), 4 Miten toteutetaan (hoitotoimet, lääkeseuranta).
- **Tavoitteet tasoittain ja tahoittain**: jokaisella tasolla (1 Turvallisuus ja akuutit riskit, 2 Hoitosuhde ja hoidon mahdollistaminen, 3 Elämänlaatu, toimintakyky ja kehitys) on oma laatikko lapselle, vanhemmille ja työntekijälle, ja kussakin oma *+ Tavoite*. Tavoite on yhden tahon tavoite (`taho`, `teksti`). Taho ja taso vaihdetaan avatusta tavoitteesta.
  - Vanha tavoite, jossa oli kaikkien tahojen tekstit, jaetaan korjauksessa tahoittain. Ensimmäinen säilyttää id:n ja arvioinnit, muut saavat saman tason, syyn, keinot ja tilan. Täysin tyhjä vanha tavoite muuttuu lapsen tavoitteeksi.
- **Tason 2 periaatteet ja mittarit**: valinnat (oletus CPS, FIT) eläimelle. Luettelo: Valikko → Periaatteet ja mittarit, yksi riville.
- **Tavoitteen seuranta**: Mielekäs, Oleellinen, Realistinen, Vaikuttaa kokonaisvointiin, kukin Kyllä/Osittain/Ei. Ei tuo herjan (taso 1 kiireellinen). Uusi napautus poistaa valinnan.
- **Mittarit-osio**: kirjaus tänään (tulos tai huomio), kolme viimeisintä näkyy. Luettelo Valikossa (nimi ja *Mitä mittaa*), oletus Oirekyselyt (relevanssi) ja FIT (yhteistyösuhteen laatu ja osin vaikutukset).
- **Ohjauksen arvio** Hoidon tarpeessa: onko tämä yksikkö oikea paikka lastenpsykiatrian sisällä. Napautus *Oikea yksikkö / Harkitaan muuta / Ohjataan muualle* kirjaa arvion tälle päivälle, perustelu valinnainen. Herja "Arvioi ohjaus tähän yksikköön", kun edellisestä arviosta (tai eläimen lisäyksestä) on tarkistusvälin verran. Väli Valikossa, oletus 6 kk.
- **Haasteet ilman psykiatrista hoitoa**: haaste, ohjataan (Sosiaalityö, Koulu, Somatiikka, Arjen keinot kotona, Muu) ja *Ohjattu tänään*. Herja, jos haasteelle ei ole valittu ohjausta (oma lisäys, poistettavissa).
- Tallennus: `ver` edelleen 1. Uudet valinnaiset kentät: eläimellä `haasteet`, `ohjaus`, `mittarit` {id: {arvot}}, `periaatteet`; tavoitteella `taho`, `teksti`, `seur`; asetuksissa `periaatteet`, `mittarit`, `valit.ohjaus`.
- Testit: `logiikka.js` (52) ja `selain.js` (uudet tavoitteet, seuranta, periaate, mittari, haaste, ohjauksen arvio, Valikon mittari ja periaatteet). Leveydet 390, 320 ja 1280 px, kaikki ok.

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
- Korjattu: Lääkeseurannan esikatselurivi näyttää kirjatut mittaukset (näytti vanhoja välejä, jotka poistuivat). Laatikko käytti luokkaa `.now`, joka on kalenterin nykyhetken viiva. Tämä aiheutti päällekkäisen asettelun.
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
- Suunnitelman *Myöhemmin*-kohdat (esim. pyyhkäisy vaiheiden välillä, sääntöjen omat ehdot).

## Ei tarkistettu

- Testit ajettiin tietokoneen selaimessa (Chromium, kosketus simuloituna), ei oikealla iPhonella: Safari, kotinäytön kirjanmerkki, sanelu, jakovalikko, kalenterin pito ja raahaus sekä vierityksen lukitus raahatessa.
- 0.8: muokkausarkin asettuminen iPhonen näppäimistön yläpuolelle ja näppäimistön pysyminen auki Seuraava-napilla. Näppäimistö simuloitiin testissä vain muuttujilla, ei oikealla näppäimistöllä. Tämä on tärkein puhelimella kokeiltava asia.
- 0.8: mittauksen tunnistus muistiosta on sanapohjainen (mittarin nimen alku). Väärät osumat ovat mahdollisia, jos rivillä on mittarin sana ja jokin muu luku.
- Antiikva- ja Pyöreä-fontit näkyvät oikein vain Applen laitteilla.
- Testiselain antoi ä-kirjaimelliselle tiedostonimelle nimen "download". iPhonen jakovalikossa nimen pitäisi säilyä. Jos ei säily, nimeksi vaihdetaan `Matsik Forest.json`.
- Nimen tunnistus taivutuksista on karkea: nimen alusta otetaan kaikki paitsi kaksi viimeistä kirjainta, vähintään kolme kirjainta. Tämä voi tuottaa vääriä osumia.

## Seuraava askel

Emil kokeilee 0.8:aa puhelimella, erityisesti kirjoittamista arkissa (näppäimistö, Seuraava, Valmis) ja Nyt-korttia. Avoimet kysymykset:
1. Asettuuko arkki iPhonella näppäimistön päälle ilman pomppimista? (Kyselyn kysymys 5.)
2. Onko oletusjärjestys oikea, ja pitääkö portaiden koskea muutakin kuin puuttuvia tietoja?
3. Riittääkö mittaus muistiosta Lääkeseurannalle ja Mittareille, vai myös muille?
4. 0.4:n avoimet: syklin rytmi, muut muokattavat luettelot, tason 2 linkki, muokattava kaavioteksti, seurannan Ei herjana vai merkintänä, mittarien asteikko.

## Suunnitelmat

- **Käytettävyyssuunnitelma (12.11.2026):** `matsik/SUUNNITELMA.md`, rakennettu kokonaan versiossa 0.8. Esittelysivu ja kysely: https://claude.ai/artifact/GgmFP5UEHTVNuSGCE164Md. Jos Emil vastaa kyselyyn myöhemmin, vastaukset luetaan sivun tietokannasta ja verrataan tehtyihin ratkaisuihin.

## Emilin kommentit
