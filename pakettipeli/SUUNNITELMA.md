# Pakettipeli: suunnitelma

**Tila:** suunnitelma, ei rakennettu · **Päivitetty:** 24.10.2026 · **Julkaisu (tuleva):** https://kasibanaani.github.io/P-iv-kartta/pakettipeli/

Kasuaali puhelinpeli Mini Motorwaysin tyyliin. Kuvakulma on ylhäältä, ja tiet ovat valmiina. Pelaaja johtaa pakettikuljetusfirmaa: hän jakaa tilaukset autoille ja päättää, milloin firma kasvaa. Emilin päätökset on merkitty **(E)** ja tekoälyn valinnat **(T)**. T-valinnat ja luvut ovat säädettäviä oletuksia, eivät sopimus.

## 1. Ydin

- Tieverkko on valmis, eikä teitä rakenneta pelin aikana. **(E)**
- Firma aloittaa yhdellä autolla toimipaikasta. Uudet autot lähtevät toimipaikasta, ja auto, jolla ei ole tehtäviä, ajaa sinne. **(E)**
- Autot liikkuvat itse ja ajavat aina lyhintä reittiä. Pelaaja antaa vain pysähdykset ja niiden järjestyksen. **(E)**
- Taukopaikkoja ei ole. **(E)**
- Kaikki tapahtuu lennosta: ajojärjestely, vastaanottosäädin ja autojen osto. Erillistä päätösruutua ei ole. **(E)**

## 2. Näkymä (pystynäyttö) **(E)**

- Kartta vie mahdollisimman ison osan ruudusta.
- Ylimpänä on peukalon levyinen kaista, jossa ei ole sisältöä (`env(safe-area-inset-top)`, vähintään noin 44 px), koska Dynamic Islandin lähellä asiat sumentuvat.
- Sen alla on ohut infopalkki, jossa on vain luettavaa: kassa, tulos/min, maine (palkki) ja päivä.
- Kaikki painettava on alareunassa: valitun auton paneeli, *Lopeta päivä* ja valikko. Alareunassa huomioidaan kotipalkin turvaväli.
- Napautettavat kohteet ovat vähintään 44 px. Kartta on niin tiheä, että napautus osuu lähimpään kohteeseen 24 px:n säteellä, ei vain pikselintarkasti. **(T)**

## 3. Kartta ja rakennukset

- Kartta on ruudukko (v1 noin 16 × 26 ruutua pystyyn). Ruutu on tie, rakennus tai tyhjä/puisto. **(T)**
- Tavalliset talot ovat yhtä harmaata sävyä. Sopimusyritykset ovat värillisiä, joten kartasta näkee heti, mistä tilauksia voi tulla. **(E)**
- Rakennuksen koko (1×1, 2×1, 2×2, 3×2…) kertoo, kuinka paljon tilauksia sieltä tulee. Isommasta tulee enemmän, joten karttaa voi lukea etukäteen. **(E)**
- Toimipaikan sijainti vaihtelee kartoittain (reuna tai keskusta). **(E)**
- Kartat generoidaan siemenluvusta. **(E)** Kaupunkityyppejä on muutama: ruutukaava, joki ja sillat sekä mutkikas vanha keskusta. Ne tuovat eroja siihen, miten kannattaa toimia. **(T)**

## 4. Tilaukset

- Tilaus = nouto + toimitus. Tilauksella on tunnuskirjain, joka näkyy kahdessa paikassa: noutopaikassa täytetty ruutu ja toimituspaikassa ontto ruutu tai lippu. Pari on samaa väriä. **(E: kirjain kahdessa paikassa, ero näkyy; T: muoto)**
- **Spontaanit tilaukset** ilmestyvät yllättäen. **(E)**
- **Ennakkotilaukset:** talon päällä on hupeneva kehä, ja kun kehä on kulunut loppuun, paketti on noudettavissa. Ennakkotilauksen voi antaa autolle jo ennen kuin kehä on lopussa. Jos auto ehtii paikalle ennen aikaa, se odottaa. **(E: kello; T: odotussääntö)**
- **Kärsivällisyys:** noudettavissa oleva tilaus kuluttaa kelloa (kehä tilauskirjaimen ympärillä). Jos tilausta ei noudeta ajoissa, se peruuntuu ja maine laskee. Noudetulla paketilla on toimituskello. **(E: kärsivällisyys; T: kaksi kelloa)**
- Kirjaimet A–Z kiertävät, eikä samaa kirjainta ole kahdella avoimella tilauksella. **(T)**

## 5. Autot ja reitti

- **Auton merkinnät (E):** auton kohdalla näkyy kaksi lukua: kyydissä (iso) ja haettavana (pieni). Kapasiteetti v1:ssä on 4 **(T)**.
- **Ohjaus (E):** napauta ensin autoa.
  - Peli hidastuu (noin 0,25×) niin kauaksi aikaa kuin auto on valittuna. **(E: hidastuu; T: kerroin)**
  - Kartalla korostuvat auton omien pakettien määränpäät ja kaikki avoimet noudot, joita ei ole annettu millekään autolle.
  - Kun noutoa napautetaan, reitin loppuun lisätään nouto ja sen toimitus. Toimitus tulee aina noudon jälkeen. **(E)**
  - Tien kohdan napautus lisää vapaan tiepisteen, ja niistä voi rakentaa kiertotien. **(E)**
  - Alareunan paneelissa on pysähdyslista. Järjestystä voi muuttaa raahaamalla. Pysähdyksen voi poistaa ruksilla: poistettu nouto palaa avoimeksi, mutta kyydissä olevan paketin toimitusta ei voi poistaa. Tyhjän kohdan napautus poistaa valinnan. **(T)**
  - Ilman muutoksia auto hoitaa pysähdykset siinä järjestyksessä, jossa ne annettiin. **(E)**
- **Kapasiteetti (E):** tilauksen saa ottaa, vaikka se ei hyväksymishetkellä mahtuisi kyytiin. Tarkistus tehdään vasta noudolle saavuttaessa: jos auto on silloin täynnä, nouto ja sen toimitus siirtyvät listan viimeisiksi, oli siinä järkeä tai ei. Paneeli näyttää kuorman jokaisen pysähdyksen jälkeen ja punaisena sen kohdan, jossa ylitys tapahtuu. **(T: ennakkovaroitus)**
- **Lyhin reitti:** Dijkstra tieruudukossa, ja reitti lasketaan uudelleen aina, kun pysähdykset muuttuvat. Autot eivät törmää toisiinsa, eikä ruuhkaa ole. **(T)**

## 6. Raha, maine ja kaatuminen

- **Valuutta on keksitty** (ei euroja, ei realismia). **(E)**
- **Tulot:** toimitus maksaa perusmaksun ja matkan mukaisen osan. **(T)**
- **Juoksevat kulut (E):** yksi luku, johon kuuluvat palkat, huollot ja bensat. Jokainen auto lisää siihen saman verran, ja se juoksee koko ajan. Erittelyä ei ole.
- **Kassa (E):** aloituspääoma on puskuri. Tulos (tulot − juoksevat kulut) kasvattaa kassaa, ja tappiollinen kulurakenne syö sitä heti. Tappio ei kaada peliä, vasta tyhjä kassa kaataa sen.
- **Pisteet = kassa (E).** Ennätyksiä ovat suurin kassa ja pisin kestänyt peli.
- **Auton hinta (E):** kertasumma ostettaessa + oma lisäys juokseviin kuluihin. Myydessä saa osan hinnasta takaisin. Lähtöarvaukset: auto 500, kulut 10/min per auto, toimitus 15–40. **(T: luvut)**
- **Yläpalkin luvut (E), päivitys kerran sekunnissa:** tuotto/min, kulut/min, tulos/min (vihreä tai punainen) ja kassa, sekä maine palkkina. Tuotto tulee toimitus kerrallaan, joten tuotto/min on liukuva keskiarvo viimeisen peliminuutin ajalta. Muuten luku hyppisi nollan ja piikkien väliä. **(T)** Lukujen pitää mahtua 320 px:n leveyteen, joten ne näytetään lyhyesti (esim. 1,2k).
- **Maine (E):** yksi yhteinen mittari, koska maine leviää. Nopea toimitus nostaa mainetta, ja myöhästyminen tai peruuntunut tilaus laskee sitä. Kartalla välähtää, missä maine kärsi. Asteikko on 0–100, ja sillä on katto. **(T: asteikko)**
- **Maine putoaa oikeasti (T):** yksi onnistuminen nostaa mainetta vähän (+1…+3 nopeuden mukaan), mutta epäonnistuminen pudottaa sitä paljon (−8 myöhästymisestä, −12 peruuntumisesta). Maine-kerroin on jyrkkä (∝ maine², ks. 6b), joten ylikuorma korjaantuu tuntuvasti eikä vain vähän. Nollassa tilauksia ei tule lainkaan, ja maine palautuu hitaasti itsestään (noin +1/min, kunnes se on 20). **(E: lasku vähentää tilauksia ja nousu on hidas; T: luvut)**

## 6b. Tilausten vastaanotto **(E)**

- Alareunassa on hienovarainen säädin **Vastaanotto**, jota voi muuttaa lennosta. Arvo on suoraan tilaustahti, esimerkiksi 0,1 tilausta minuutissa kerrallaan. **(E: hienovarainen; T: yksikkö)**
- Erillistä kysyntämittaria ei ole. Kysyntää on aina, joten liikaa tilauksia saa ottaa koko ajan, jos haluaa. **(E)** Ainoa raja on tekninen: avoimia tilauksia voi olla kerralla enintään 26 (kirjaimet A–Z), ja se on samalla pelin äärilaita. **(T)**
- Maine kertoo, kuinka suuri osa pyydetystä tahdista toteutuu: todellinen tahti = säädin × maine-kerroin (∝ maine²). Kun maine putoaa 100:sta 70:een, tilauksia tulee puolet pyydetystä. Huono maine jarruttaa siis itsestään, vaikka säädin olisi tapissa. **(E: maine vaikuttaa tilausmääriin; T: kaava)**
- **Ylikuorma rankaisee kasvavasti (E: iso tilausmäärä = iso haitta pienellekin firmalle; T: mekanismi):**
  1. Jokainen myöhästyminen ja peruuntuminen on oma iskunsa, joten haitta kasvaa suoraan ylikuorman mukana. Jos otat kaksi kertaa sen, mitä pystyt hoitamaan, puolet tilauksista epäonnistuu, ja epäonnistuminen maksaa 4–8 onnistumista.
  2. Ruuhkavuoto: kun odottavia, autoille antamattomia tilauksia on enemmän kuin 2 × autojen määrä, maine valuu koko ajan, ja vuoto kasvaa jonon pituuden mukaan (kulmakerroin).
  3. Huono maine laskee myös hintaa: toimituksen maksu on maine-kertoimen verran pienempi (100 % = täysi, 50 % = 75 %). Ilman tätä ylikuormalle löytyisi tasapaino, jossa maine on matala mutta toimituksia yhtä paljon, eli ylikuorma ei oikeasti rankaisisi. Hinnanalennuksen kanssa matala maine on tappiollinen, ja juoksevat kulut syövät kassan.
- Tämä on riskivipu: voit nostaa tahtia ostamatta autoa ja katsoa, pärjäätkö. Jos et pärjää, maine putoaa, yläraja laskee ja kassa ehtii kärsiä.
- Säädin nollassa tarkoittaa, että uusia tilauksia ei oteta.

## 7. Päivä **(E)**

- Päätösruutua ei ole, vaan kaikki tehdään lennosta: vastaanotto säädetään ja autot ostetaan tai myydään alareunasta (peli hidastuu valikon ajaksi). **(E)**
- Päivälle ei ole ylärajaa, joten peli on yksi ikuinen päivä.
- **Lopeta päivä:** uusia tilauksia ei enää tule, ja autoille antamattomat avoimet tilaukset peruuntuvat **(T: ilman mainehaittaa)**. Järjestystä ei voi enää muuttaa, ja peli pikakelaa (noin 8×), kunnes annetut tilaukset on toimitettu tai ne myöhästyvät. Myöhästymiset rokottavat vielä mainetta, ja kulut juoksevat pikakelauksenkin ajan. Lopuksi näytetään lyhyt yhteenveto (tulos ja kassa), ja peli jatkuu samasta kohdasta aikahyppynä.

## 8. Kasvu

- Kasvu tulee vastaanottosäätimestä ja autoista, ja maine jarruttaa. Kysyntäilmoituksia tai erillistä kysynnän kasvua ei ole. **(E)**
- Rahalla ostetaan v1:ssä vain autoja. **(E: kysymys 7 jätettiin auki)**
- **Tasapainotavoite (E):** kannattavuuden lisääminen on vaikeaa mutta onnistuu hyvällä pohdinnalla. Toteutus: botti pelaa simulaatiossa eri automäärillä ja vastaanottotasoilla, ja luvut säädetään niin, että hyvin ajettu auto tuottaa ohuen voiton (noin 15–25 % tuloista), huonosti ajettu tappiota ja ylikuormitus kääntää tuloksen punaiselle. **(T)**

## 9. Ilme **(T)**

Litteä ja selkeä kuten Mini Motorwaysissa: vaalea maa, valkoiset tiet, harmaat talot, sopimusyritykset kirkkailla väreillä ja autot pieninä pyöristettyinä suorakulmioina. Ilme on oma kuten Headmazessa, mutta Appipaja 2.0:n periaatteita noudatetaan: järjestelmäfontti, kontrasti vähintään 4,5:1 ja vaalea/tumma laitteen mukaan. Piirto tehdään canvasilla, ja käyttöliittymä on HTML:ää.

## 10. Tallennus **(T)**

- Pelin tila tallentuu automaattisesti avaimella `pakettipeli:v1`, jotta peli jatkuu sovelluksen sulkemisen jälkeen: `{app:'pakettipeli', ver:1, savedAt, peli:{siemen, aika, kassa, maine, autot, tilaukset, päivä}, ennatykset}`.
- Varmuuskopio ennätyksistä ja omista kartoista (v2) tiedostona ja tekstinä.

## 11. Karttaeditori (vaihe 2) **(E)**

Pieni ruudukko. Tie piirretään sormella kuten Mini Motorwaysissa, ja rakennus valitaan alareunan valikosta (tie, talo, sopimusyritys, toimipaikka, kumi). Rakennuksen kokoa voi muuttaa, ja koko vaikuttaa tilausmäärään. Editori tarkistaa, että toimipaikasta pääsee jokaiseen yritykseen. Omat kartat tallennetaan ja niitä voi pelata.

## 12. Versiot

- **v1 (ensimmäinen pelattava):** yksi generoitu kaupunkityyppi (ruutukaava, siemen satunnainen tai annettu), spontaanit ja ennakkotilaukset, autojen ohjaus ja hidastus, kapasiteettisääntö, maine, juoksevat kulut ja kassa, vastaanottosäädin, päivän lopetus pikakelauksella, auton osto ja myynti, kaatuminen, ennätykset ja automaattitallennus.
- **v2:** kaupunkityyppejä lisää, karttaeditori ja tasapainon hiominen.
- **v3 (jos tarvitaan):** isommat autot, muut ostokset ja tasapainotus.

## 13. Testit

- Logiikka nodella: reitinhaku, kapasiteetin siirtosääntö, ennakkotilauksen odotus, maineen nousu ja lasku sekä katto, juoksevat kulut ajan mukaan, maine-kerroin, kaatuminen, päivän pikakelaus ja generaattorin yhtenäisyys (kaikki yritykset tavoitettavissa toimipaikasta).
- Selain 390 ja 320 px tietokoneen Chromiumilla: napautukset, hidastus ja paneeli.
- Tasapainotus: botti pelaa yksinkertaisella säännöllä (lähin vapaa auto) useita päiviä, ja tarkistetaan, että yhdellä autolla pärjää alussa eikä kasvu ole ilmaista.

## 14. Avoimet

- Peruuntuvatko avoimet, autoille antamattomat tilaukset päivän päättyessä ilman mainehaittaa? **(T-oletus: ilman haittaa)**
- Kapasiteetti 4, hidastus 0,25×, pikakelaus 8× ja kaikki rahaluvut ovat tekoälyn arvauksia, ja ne säädetään pelaamalla.
