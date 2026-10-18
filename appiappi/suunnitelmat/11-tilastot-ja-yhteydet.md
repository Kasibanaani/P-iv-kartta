# F25 Tilastot ja yhteydet: mikä liittyy mihinkin ajan yli

16.10.2026. **Emilin idea**, tekoälyn jäsentämä keskustelun pohjalta. **Ei toteutettu. Tauolla (Emil 17.10.2026):** korrelaatiopuolta ei tehdä vielä; Emil miettii kohdan 9 kysymyksiä, ja suunnitelma käsitellään uudelleen tarkistuspisteessä (kohta 10). Suunnitelma ei ole rakentamislupa; Emil päättää vaiheet erikseen. Merkinnät: *Emilin idea / vastaus* = hänen sanomansa, *ehdotus* = tekoälyn suunnitteluratkaisu, *avoin* = päätetään ennen rakentamista (kohta 9). Lue ensin [periaatteet](00-periaatteet.md), [01 kohta 7 (F08)](01-tieto-ja-tapahtumat.md) ja [03 F09](03-kayttopinta.md).

## 1. Idea (Emilin idea, tiivistetty)

Appi-appiin laskentapalikoita, joilla päivästä toiseen tehdyistä kirjauksista alkaa hahmottua asioiden välisiä yhteyksiä, muun muassa korrelaationa. Kirjaus voi syntyä painikkeilla, raahaamalla asioita ruudukolle tai millä tahansa muulla tavalla. Kiinnostaa myös yhden tekijän yhteys tekijäryhmään: esimerkiksi A:n yhteys siihen, että B ja C esiintyvät yhdessä. Tavoite on, että appissa voi tapahtua *oppimista*.

Ensimmäinen esimerkki: **elämäntapaväittämät.** Pitkä lista elämäntapatekijöitä, joita painellaan sen mukaan, mitkä pätevät minäkin päivänä. Lisäksi asteikkoja ja luokkiin jakautuvia arvoja (esim. uni huono/ok/hyvä) ja niiden luokkien yhteydet.

## 2. Emilin vastaukset (16.10.2026)

- Tekijät: kyllä/ei, mutta myös asteikkoja ja luokkia.
- Tulos sekä käyttäjälle näkyväksi että logiikan käyttöön; ei rajata toiseen.
- Yksikkö: sekä "oli totta tänä päivänä" että "monestiko päivässä".
- Viive (A tänään vs. B eilen) kiinnostaa.
- Tapahtumajärjestys kiinnostaa, mutta hyöty on epävarma.
- Ehdollinen vertailu (menetelmä 1) hyvä. Osittaiskorrelaatio (menetelmä 6) jäi epäselväksi, joten se tulee myöhemmin.

## 3. Nykytila (tarkistettu dokumenteista ja koodista 16.10.2026, Appi-appi 19)

- **On:** Tietotaulukko (sarakelajit mm. luku, kyllä/ei, päivämäärä, ajankohta, valinta), Rivijoukko (suodatus ehdolla, järjestys), koosteet summa/keskiarvo/suurin/pienin/määrä puuttuvat eriteltyinä (D06), tapahtuman tiedot (D05), käyttöraahauksen pudotus ruudun koordinaatteineen (`ruutux`, `ruutuy`), Kaavio- ja Kalenteri-palikat yksittäisille palikoille.
- **Ei ole:** Kirjaa-toiminto ja rakenteinen historia (F08), rivejä ottava Kaavio ja sarjakäsittely (F09), mikään tilastollinen yhteyslaskenta. F09:n suunnitelmassa on jo siemen: "vertaa lukua riveillä, joilla ehto pätee ja joilla ei, ja näytä havaintomäärät".

## 4. Tietomalli (ehdotus)

1. **Raakakirjaus** (F08): jokainen painallus, raahaus tai syöte tallentaa rivin, jossa on ajankohta kellonaikoineen, tekijä ja arvo. Raakakirjaukset säilyvät, jolloin laskentatapaa voi muuttaa myöhemmin ja järjestys (kohta 6) voidaan johtaa jälkikäteen.
2. **Päivätaulukko:** rivi per päivä, sarake per tekijä. Päivän arvo on kooste raakakirjauksista: kyllä/ei = esiintyikö, määrä = montako kertaa, asteikko = viimeisin tai keskiarvo, luokka = viimeisin. Koostetapa on sarakkeen valinta.
3. **Tekijän laji:** kyllä/ei, asteikko (esim. 1–5), luokka, määrä tai luku. Laji ratkaisee mittarin (kohta 5); rakentajan ei tarvitse tuntea menetelmien nimiä.
4. **Yhdistelmätekijä** on tavallinen kaavasarake, esim. `B ja C`. Se on vastaus kysymykseen "A vs. B ja C yhdessä" ilman uutta käsitettä.
5. **Puuttuva päivä ei ole "ei".** Painamaton kyllä/ei-tekijä tarkoittaa "ei", vain jos päivä on merkitty kirjatuksi (esim. "päivä käyty läpi"). Muuten päivä on puuttuva, eikä sitä lasketa (D06). *Avoin:* miten päivä merkitään kirjatuksi.

## 5. Yhteys-palikka (ehdotus)

Logiikan palikka *Yhteys*. Sisään: päivätaulukko tai rivijoukko, tekijä A, tekijä B (voi olla yhdistelmä) ja **viive** 0 / 1 / 2 / … päivää (B:tä siirretään taaksepäin: A tänään vs. B eilen). Ulos ominaisuuksina:

| Ominaisuus | Sisältö |
| --- | --- |
| `vertailu` | A:n keskiarvo tai osuus päivinä, joina B pätee, ja päivinä, joina ei (menetelmä 1) |
| `voimakkuus` | −1…1 (tai 0…1 luokille); mittari lajien mukaan, alla |
| `havaintoja`, `puuttuvia` | montako päivää laskettiin, montako ohitettiin |
| `luotettavuus` | sanallinen: liian vähän / suuntaa antava / kohtuullinen (ehdotus: alle 10 parillista päivää tai alle 3 päivää kummassakin ryhmässä = liian vähän) |
| `kuvaus` | luettava lause, esim. "Kun B ja C, A 3/4 päivästä; muuten 5/20. Havaintoja 24." |

Mittarit lajeittain: kaksi lukua tai asteikkoa → Pearson (asteikoille vaihtoehtona Spearman); kaksi kyllä/ei → phi ja nosto ("A on kolme kertaa todennäköisempi, kun B"); luokka mukana → ristiintaulukko ja Cramérin V. Tulos on tavallinen ominaisuus, joten sen voi näyttää tekstissä tai Monitorissa ja käyttää ehdoissa.

Laskenta kuuluu moottoriin (`KK`), esitys erikseen (periaate 6). Ristiintaulukko on oma esitys samasta laskennasta.

## 6. Tapahtumajärjestys (ehdotus, myöhemmin)

Koska raakakirjaus säilyttää kellonajan, järjestyksen voi johtaa uudeksi päivän tekijäksi: "A ennen B tänään: kyllä/ei/ei molempia". Se korreloi kuten muutkin, joten uutta menetelmää ei tarvita. Ensimmäisessä vaiheessa riittää, ettei aikaa heitetä pois.

## 7. Myöhemmät laajennukset (ehdotus, ei ensimmäiseen vaiheeseen)

- **Kaikkien parien näkymä (louhinta):** appi laskee kaikki parit ja yhdistelmät ja nostaa vahvimmat esiin lämpökarttana tai listana. Monivertailun varoitus näkyy aina: 30 tekijästä syntyy 435 paria, joista noin 20 näyttää "merkittävältä" pelkällä sattumalla.
- **Ennen ja jälkeen:** vertailu ennen ja jälkeen valitun päivän (esim. "aloitin X:n").
- **Osittaiskorrelaatio:** A vs. B, kun C vakioidaan ("johtuuko hyvä uni joogasta vai viikonlopusta"). Vaatii paljon päiviä.
- **Trendi ja liukuva keskiarvo:** F09:ssä jo.

## 8. Rehellisyys esityksessä (ehdotus, kaikissa vaiheissa)

Havaintomäärä näkyy aina tuloksen vieressä. Samanaikaisuus ei ole syy, ja luettava kuvaus sanoo "esiintyi yhdessä", ei "aiheuttaa". Vähäisen aineiston tulos merkitään, ei piiloteta.

## 9. Avoimet kysymykset (vastattu 18.10.2026, kohta 1 tarkentuu koeapissa)

Emil 17.10.2026 aamulla: kysymykset jäävät auki, ja ne käydään läpi uudelleen tarkistuspisteessä. Tämä korvaa 17.10. yöllä kirjatun "suositusten mukaan" -päätöksen tämän suunnitelman osalta. Tekoälyn suositukset säilyvät ehdotuksina:

1. Miten päivä merkitään kirjatuksi, jotta painamaton tarkoittaa "ei" eikä "puuttuu" (kohta 4.5)? *Ehdotus:* päivä on kirjattu, kun sille on ensimmäinen kirjaus; ilman kirjauksia päivä puuttuu.
2. Mikä on päivän raja, kun valvotaan yli puolenyön? *Ehdotus:* projektin asetus, oletus keskiyö. Huom.: F08 rakentaa tämän asetuksen joka tapauksessa (`TILA.md`, Jono), joten tässä kysytään vain F25:n käyttämä oletus.
3. Käyvätkö luotettavuusrajat (kohta 5)? *Ehdotus:* alle 10 parillista päivää tai alle 3 päivää kummassakin ryhmässä = liian vähän.
4. Tehdäänkö elämäntapaväittämistä ensin koeappi nykyisillä palikoilla? *Ehdotus:* kyllä, heti F08:n jälkeen.

**Emilin vastaukset 18.10.2026:**

1. *Päivä kirjattu:* Emil ei ole varma, miltä tämä näyttää käytännössä. Jos tarvitaan oma toiminto, se on yksi nappi ”tämä päivä on kirjattu”, jonka jälkeen puuttuvat kirjaukset tarkoittavat ”ei”. Muuten logiikka. *Tekoälyn ehdotus:* päivä on kirjattu, kun sillä on mikä tahansa kirjaus TAI nappia on painettu. Nappi tehdään nykyisillä palikoilla (Painike, toiminto Kirjaa historiataulukkoon ”Päivät”), ei uutta palikkaa. Lopullinen muoto ratkaistaan koeapissa (kohta 4), kun Emil näkee sen käytössä.
2. *Päivän raja:* keskiyö. Muu raja tekee asiasta sekavan. F08:n asetus (`P.praja`) on jo olemassa; sen poisto Asetuksista on avoin kysymys Emilille.
3. *Luotettavuusraja:* 3 päivää. Tulkinta (tekoäly, vahvistamatta): vähintään 3 päivää kummassakin ryhmässä, ja ehdotettu 10 parillisen päivän raja jää pois.
4. *Koeappi:* kyllä, tehdään elämäntapaväittämien koeappi nykyisillä palikoilla.

Emil voi lisätä tähän uusia kysymyksiä tai vastata milloin vain; vastaus kirjataan tähän päivämäärän kanssa.

## 10. Toteutusjärjestys (ehdotus)

Riippumaton osa etenee jonossa ilman tätä suunnitelmaa: F08 rakenteinen historia on jonossa omana kohtanaan (`TILA.md`, Jono), koska sitä tarvitaan muuhunkin. Kaikki sen jälkeinen odottaa tarkistuspistettä.

**Tarkistuspiste (Emil 17.10.2026):** kun F08 on viety päähaaraan, tätä suunnitelmaa ei rakenneta automaattisesti. Rakentaja tai jonon vahti ilmoittaa Emilille, että F25 on vuorossa uudelleenkäsittelyyn, ja liittää kohdan 9 kysymykset. Jono jatkaa sillä välin seuraavaan kohtaan, joka ei riipu F25:stä. Vasta Emilin vastausten jälkeen kohdat 2–5 alla saavat toteutusluvan.

1. F08 rakenteinen historia: raakakirjaus kellonaikoineen ([01](01-tieto-ja-tapahtumat.md) kohta 7).
2. Päivätaulukko raakakirjauksista: koostetapa sarakkeittain ja puuttuvan päivän sääntö.
3. F09 aikasarjat, ehdollinen vertailu ([03](03-kayttopinta.md)).
4. Yhteys-palikka: mittarit lajeittain, viive, yhdistelmätekijä, luotettavuus ja kuvaus.
5. Myöhemmin: järjestystekijä, kaikkien parien näkymä, ennen/jälkeen, osittaiskorrelaatio.

**Kokeet (ehdotus):** tunnetuista sarjoista lasketut arvot (esim. täysin riippuvat sarjat r = 1, riippumattomat ≈ 0, käsin laskettu phi), puuttuva päivä ei muutu nollaksi, viive 1 siirtää oikein kuukauden ja vuoden vaihteessa, sama tekijä monta kertaa päivässä, tyhjä ja yhden päivän aineisto, vanha projekti aukeaa ennallaan. Puhelin 390 ja 320 px, tietokone 1440 px.
