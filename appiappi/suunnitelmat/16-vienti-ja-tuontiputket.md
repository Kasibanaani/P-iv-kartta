# F31 viedyn appin asetukset ja F32 tuontiputket

17.10.2026. **Emilin ajatuksia**, tekoälyn jäsentämä ja kommentoima. **Ei toteutettu, ei rakennuslupa.** Merkinnät: *Emilin idea* = hänen sanomansa, *ehdotus* = tekoälyn suunnitteluratkaisu, *avoin* = päätetään ennen rakentamista. Lue ensin [missio](../MISSIO.md), [periaatteet](00-periaatteet.md), [06 F23](06-testit-ja-julkaisu.md#vienti-erilliseksi-käyttäjä-apiksi) ja [05 F20–F21](05-aika-media-ja-liitannat.md).

## 1. Emilin ajatukset (tiivistetty)

- Appi-appi on sekä työkalu että käyttöappi: projekteja käytetään itsessään, mutta myöhemmin niistä halutaan viedä erillisiä appeja ulos.
- Viedyn appin asetukset: tarvitaanko oma osio, jossa määritellään appikohtaiset asetukset viedyn appin käyttäjälle, kun kaikki ei saa jäädä sellaiseksi kuin Emil sen rakensi? Moni asetus (värit ym.) onnistuu jo sisäisellä logiikalla tavallisena asetusvälilehtenä.
- Saako Applen Terveydestä (esim. Apple Watchin data) tietoa web-appiin, automaattisesti tai edes napista, esimerkiksi GitHubin kautta?
- Entä Garmin (syke, uni)?
- Mitä muuta voi tuoda: Excel, Google Sheets, Notion (tuskin).
- Voivatko web-apit puhua keskenään: (a) yhteinen huone eri käyttäjille eri laitteilla, (b) oma kevyt appi hoitaa yhden asian ja Appi-appi tuo sen tiedot, ei reaaliajassa, esimerkiksi GitHubin kautta.

## 2. Lyhyt vastaus: mikä onnistuu

| Asia | Onnistuu? | Miten | Huomio |
| --- | --- | --- | --- |
| Viedyn appin omat asetukset | Kyllä | Pääosin tavallista logiikkaa; pieni Vienti-osio vain sille, mihin logiikka ei yllä (kohta 3) | F23 (vienti) puuttuu vielä kokonaan |
| Applen Terveys napista | Kyllä | Pikakomento (Shortcuts) hakee arvot ja kirjoittaa tiedoston `master-tiedot`iin | Web-appi ei itse näe Terveyttä koskaan |
| Applen Terveys automaattisesti | Osittain | Pikakomennon automaatio kellonaikaan | Lukittu puhelin estää terveystiedon luvun: ajastus aamuun, kun puhelin on käytössä |
| Koko Terveys-vienti (export.xml) | Teknisesti, ei järkevästi | Tiedosto on helposti satoja megatavuja | iPhonen selain tukehtuu; ei suositella |
| Garmin | Kyllä, kiertotietä | Garmin Connect kirjoittaa Applen Terveyteen, sieltä sama pikakomento | Garminin oma rajapinta on yrityksille; epäviralliset kirjautumiskirjastot hauraita |
| Excel | Kyllä | Kopioi solut ja liitä (F20 vaihe 1, jonon kohta 6 tulkki) tai CSV-tiedosto | |
| Google Sheets | Kyllä | Sama liimaus; tai julkaise CSV:nä verkkoon ja hae osoitteesta | Julkaistu taulukko on julkinen: ei henkilökohtaiselle tiedolle |
| Notion | Ei suoraan | Rajapinta vaatii avaimen ja välipalvelimen; kopioi teksti | Ei kannata |
| Omat apit → Appi-appi (ei reaaliaika) | Kyllä | Appi kirjoittaa JSON-tiedoston `master-tiedot`iin, Appi-appi hakee sen | Sama putki kuin terveysdatalla (kohta 5) |
| Yhteinen huone, monta käyttäjää | Mahdollista, ei nyt | Tarvitsee ulkoisen palvelun (esim. reaaliaikatietokanta tai välityspalvelin) | GitHub ei sovi: hidas, ja jokainen käyttäjä tarvitsisi oman avaimen. F21:n asia, oma päätös |

## 3. Viedyn appin asetukset (F31, ehdotus)

**Tekoälyn näkemys:** Emilin oma vaisto on oikea: käyttäjän asetukset (teema, värit, ääni päällä/pois, kieli, oletusarvot) rakennetaan **tavallisella logiikalla** asetusvälilehdeksi. Ei rinnakkaista asetusjärjestelmää, koska se olisi juuri sellainen poikkeus, jota missio varoo. Erillinen osio tarvitaan vain asioille, jotka ovat projektin ulkopuolella tai vasta vientihetkellä olemassa.

**3a. Yksi uusi ominaisuus: `appi.viety`** (ehdotus). Kyllä viedyssä apissa, ei rakentajassa ja Appi-appin omassa käytössä. Sillä rakentaja tekee eron tavallisella logiikalla: esimerkiksi oma testinappi näkyy vain, kun `appi.viety` on ei; viety appi aloittaa eri näkymästä; viedyn appin käyttäjä näkee asetusvälilehden, jota Emil ei itse tarvitse. Tämä kattaa suurimman osan ”vietynä toisin” -tarpeista ilman uusia palikoita. Ehkä myös `appi.versio` (viedyn version numero).

**3b. Vienti-osio projektin asetuksissa** (ehdotus, vain se mihin logiikka ei yllä):

- Appin nimi, kuvake ja teemaväri (kotinäytön kirjanmerkki, välilehden otsikko).
- Aloitusnäkymä ja laitemuoto (puhelin, iPad, tietokone).
- Tallennusavain: viety appi tallentaa omaan nimiavaruuteensa (F23:ssa jo vaatimus).
- Mitkä käyttötiedot mukaan: ei mitään, aloitussisältö (esim. kysymykset) vai nykyiset tiedot (F23: tietoinen valinta).
- Tiedostovienti ja -tuonti käyttäjälle päälle/pois (varmuuskopio).
- GitHub-tallennus päälle/pois. Viety appi ei koskaan saa Emilin avainta: jos tallennus on päällä, käyttäjä antaa oman avaimensa ja oman reponsa.
- Rakentajan apuvälineet pois: Miksi?, muokkaus, laput, palikoiden nimet (F23: paletti ja muokkaus jäävät pois).

**Rajat (ehdotus):** jos asian voi tehdä palikalla, se ei kuulu Vienti-osioon. Vienti-osio ei muuta logiikkaa, vain kehyksen. Sama osio kelpaa myöhemmin F23:n julkaisuun (luonnos vs. julkaistu).

**Avoin (myöhemmin, ei kysytä nyt):** viedäänkö yksi HTML-tiedosto vai oma kansio GitHub Pagesiin; saako viedyn appin käyttäjä muuttaa rakennetta lainkaan (missio: ”rakentaja päättää, mitä loppukäyttäjä saa muuttaa”); jos appi on muille kuin Emilille, AGENTS.md:n sääntö (työnantajan linja, lääkinnälliset laitteet) on tarkistettava ennen rakentamista.

**Riippuvuus:** F31 tulee vasta F23:n (vienti) kanssa tai sen jälkeen, P7:ssä. `appi.viety` on hyödytön ennen kuin vientiä on, joten sekään ei mene jonoon vielä.

## 4. Applen Terveys ja Garmin (F32, osa terveysdata)

**Tosiasiat (tarkistettu 17.10.2026):**

- Applen Terveyteen (HealthKit) pääsee vain iPhonen oma sovellus. Web-appi ei pääse, eikä Applella ole verkkorajapintaa terveystiedoille. Tähän ei ole kiertotietä selaimesta.
- **Pikakomennot**-sovelluksen toiminto *Etsi terveysnäytteitä* lukee esimerkiksi askeleet, sykkeen, leposykkeen, unen ja harjoitukset. Pikakomento voi koota niistä tekstin tai JSONin ja lähettää sen verkkoon toiminnolla *Hae URL:n sisältö* (GitHubin rajapinta: tiedoston kirjoitus).
- Automaatio (henkilökohtainen, esim. kellonaika) voi ajaa pikakomennon kysymättä. **Mutta:** lukitussa iPhonessa terveystiedot ovat salattuina, eikä pikakomento saa niitä. Yöllä klo 3 ajettu automaatio epäonnistuu siis usein. Ajastus kannattaa tehdä aamuun tai iltaan, kun puhelinta käytetään, tai ajaa pikakomento käsin (kotinäytön kuvake, yksi napautus).
- Koko Terveys-vienti (*Vie kaikki terveystiedot*) tuottaa zip-tiedoston, jossa on yksi valtava XML. Se voi olla satoja megatavuja; iPhonen Safari ei sitä mielellään jäsennä. Ei suositella.
- Kolmannen osapuolen sovelluksia (maksullisia) on, jotka vievät Terveyden datan automaattisesti verkkoon. Niiden nykytilaa ei tarkistettu, eikä niitä tarvita, jos pikakomento riittää.
- **Garmin:** Garminin virallinen Health API on yrityksille (hakemus, oma palvelin). Henkilökohtaisesti: (1) Garmin Connect -sovellus voi kirjoittaa Applen Terveyteen (ainakin askeleet, uni ja harjoitukset; syke ja muut tyypit tarkistetaan kokeella), jolloin sama pikakomento kattaa myös Garminin. (2) Garminin tilin tietovienti (zip) kestää päiviä ja on kertaluontoinen. (3) Epäviralliset kirjastot kirjautuvat Garminiin tunnuksillasi ja voisivat ajaa ajastettuna GitHub Actionsissa; ne rikkoutuvat Garminin muutoksissa ja ovat käyttöehtojen harmaalla alueella. **Suositus: reitti 1.**

**Suositeltu putki (ehdotus):**

1. Pikakomento *Terveys → GitHub*: hakee viimeiset 30 päivää päivittäin koottuna (esim. askeleet, leposyke, unen kesto, harjoitusminuutit) ja kirjoittaa ne tiedostoon `master-tiedot/tuonnit/terveys.json` (rivitiedosto, kohta 5). Joka ajo kirjoittaa koko tiedoston uudestaan: pikakomennon ei tarvitse osata lisätä vanhaan.
2. Pikakomennossa on GitHub-avain. Käytä hienojakoista (fine-grained) avainta, joka saa kirjoittaa vain `master-tiedot`-repon sisältöä. Avain on vain puhelimessa, ei repossa.
3. Appi-appi hakee tiedoston taulukkoon (kohta 6) ja yhdistää päivän mukaan, joten historia säilyy, vaikka tiedostossa on vain 30 päivää.
4. Tekoäly voi kirjoittaa pikakomennon rakennusohjeen askel askeleelta, kun Emil haluaa. Pikakomentoa ei voi viedä repon kautta valmiina; Emil kokoaa sen puhelimella.

**Yhteys F25:een:** tämä on F25:n päivätaulukon luonteva syöte (uni, syke vs. elämäntapaväittämät). F25 on tauolla, eikä tämä suunnitelma muuta sen avoimia kysymyksiä ([11](11-tilastot-ja-yhteydet.md), kohta 9). Terveysputki on hyödyllinen ilman F25:täkin (näyttö, kaavio, kirjaus).

**Yksityisyys:** terveystieto kuuluu vain yksityiseen `master-tiedot`-repoon, ei koskaan tähän julkiseen repoon, ei julkaistuun Google Sheetsiin eikä viedyn appin mukaan.

## 5. Rivitiedosto: yksi muoto kaikille lähteille (F32, ehdotus)

Terveys, Garmin, omat apit ja taulukot puhuvat samaa muotoa, jolloin Appi-appiin tarvitaan yksi tuontitoiminto, ei sovitinta per palvelu.

```json
{
  "muoto": "rivit",
  "ver": 1,
  "lahde": "terveys-pikakomento",
  "paivitetty": "2026-10-17T07:30:00+03:00",
  "avain": "paiva",
  "rivit": [
    {"paiva": "2026-10-16", "askeleet": 8412, "leposyke": 54, "uni_h": 7.2},
    {"paiva": "2026-10-17", "askeleet": 1203, "leposyke": 55, "uni_h": 6.4}
  ]
}
```

- `avain` kertoo, millä sarakkeella rivit yhdistetään (päivä, id). Ilman avainta tuonti korvaa koko sisällön.
- Arvot ovat lukuja, tekstejä, päivämääriä (`YYYY-MM-DD`) tai aikaleimoja; puuttuva arvo jätetään pois tai on `null` (F06: puuttuva ei ole nolla).
- Sama muoto kelpaa CSV:nä (otsikkorivi = sarakkeet), kun lähde on taulukko.

**Omat apit (Emilin kohta b):** kevyt erillisappi (esim. pelkkä uni- tai treenikirjaus) tallentaa näin oman tiedostonsa `master-tiedot/tuonnit/<appi>.json` samalla GitHub-tallennuksella, jota Appi-appi jo käyttää (avain selaimen muistissa, ei koodissa). Appi-appi hakee sen. Ei reaaliaikaa, ei palvelinta, ei uusia avaimia. Tämä on suoraan mahdollista. Rajoitus: GitHubin rajapinta sallii tunnissa tuhansia kutsuja, ei sekunnin välein tapahtuvaa synkkaa; ”hae, kun appi avataan tai napista” riittää.

**Yhteinen huone (Emilin kohta a):** mahdollista, mutta eri asia. Tarvitsee ulkoisen reaaliaikapalvelun (ilmaistasoja on), palvelun asetukset ja yhteysmallin (F21: ristiriidat, katkot, oikeudet). Rikkoo nykyisen linjan ”ei ulkoisia kirjastoja tai palveluja”, joten se on oma päätöksensä ja oma suunnitelmansa myöhemmin. Ei jonoon.

## 6. Appi-appin puoli: Hae rivitiedosto (F32 vaihe 1, ehdotus)

- Tietotaulukon asetus **Lähde**: tyhjä (nykyinen, käsin) tai *tiedosto master-tiedotissa* + polku. Toiminto **Hae** (logiikka: napista, appin avautuessa tai ajastimella) hakee tiedoston ja tuo rivit.
- Yhdistäminen avaimella (**Emilin päätös 17.10.2026**): uusi avain lisää rivin, sama avain päivittää tiedoston sarakkeet, appin omat sarakkeet (esim. käsin kirjattu mieliala) säilyvät, eikä tiedostosta puuttuva rivi katoa. Ilman avainta: korvaa.
- Tila ominaisuuksina: `taulu.haettu` (aika), `taulu.hakuvirhe`; tapahtumat *haettu* ja *hakuvirhe* (F20: valmis/virhe jatkaa ketjua). Piirto tai kaava ei koskaan hae verkosta.
- Uudet sarakkeet tiedostosta: esikatselu kysyy ennen kuin taulukkoon tulee uusia sarakkeita (F20: sarakkeiden kohdistus).
- Hyväksymiskoe: synteettinen terveys.json valepalvelimelta; sama tiedosto kahdesti ei kahdenna rivejä; vanha rivi säilyy; virhe ei tyhjennä taulukkoa; vanha projekti avautuu.
- Tallennusmuoto laajenee valinnaisella kentällä (taulukon lähde ja polku): muistuta varmuuskopiosta.
- Pohja on jo olemassa: GitHub-luku (*Hae uudet projektit*), Tietotaulukko, tapahtumat. Liimattu taulukko ja CSV ovat jonon kohta 6 (tulkki); tämä on saman F20:n verkkopuoli.

## 7. Linjakkuus

- Ei uutta palikkaa: Tietotaulukko saa lähteen, Toiminto saa *Hae*-lajin. Opittava uusi asia: ”taulukolla voi olla lähde”. Sama käsite kantaa terveyden, Garminin, omat apit ja myöhemmin Sheetsin.
- `appi.viety` on yksi ominaisuus, joka siirtää ”vietynä toisin” -päätökset näkyvään logiikkaan piilotetun asetuksen sijaan.
- Appi ei kutsu tekoälyä eikä kolmannen osapuolen palveluja; ainoa verkko on käyttäjän oma GitHub, kuten nyt.

## 8. Työjonoon

- **Jonossa (kohta 9):** F32 vaihe 1, *Hae rivitiedosto* (kohta 6). **Emilin päätös 17.10.2026:** yhdistetään avaimella kohdan 6 mukaisesti.
- **Ei koodia, Emil voi tehdä milloin vain:** pikakomento Terveys → GitHub (tekoäly kirjoittaa ohjeen pyynnöstä); Garmin Connectin Terveys-yhteyden päälle laitto ja kokeilu, mitkä tiedot siirtyvät.
- **Ei jonoon:** F31 (odottaa F23:a, P7), yhteinen huone (oma päätös palvelusta), Notion, koko export.xml, Garminin epäviralliset kirjastot.
