# Pakettipeli: suunnitelma

**Tila:** suunnitelma, ei rakennettu · **Päivitetty:** 24.10.2026 · **Julkaisu (tuleva):** https://kasibanaani.github.io/P-iv-kartta/pakettipeli/

Kasuaali puhelinpeli Mini Motorwaysin tyyliin. Kuvakulma on ylhäältä, ja tiet ovat valmiina. Pelaaja johtaa pakettikuljetusfirmaa: hän jakaa tilaukset autoille ja päättää, milloin firma kasvaa. Emilin päätökset on merkitty **(E)** ja tekoälyn valinnat **(T)**. T-valinnat ja luvut ovat säädettäviä oletuksia, eivät sopimus.

## 1. Ydin

- Tieverkko on valmis, eikä teitä rakenneta pelin aikana. **(E)**
- Firma aloittaa yhdellä autolla toimipaikasta. Uudet autot lähtevät toimipaikasta, ja auto, jolla ei ole tehtäviä, ajaa sinne. **(E)**
- Autot liikkuvat itse ja ajavat aina lyhintä reittiä. Pelaaja antaa vain pysähdykset ja niiden järjestyksen. **(E)**
- Taukopaikkoja ei ole. **(E)**
- Kaksi kerrosta: päivän aikana tehdään ajojärjestelyä, päivän päätösruudulla bisnespäätöksiä. **(T, Emil hyväksyi linjan)**

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

- **Tulot:** toimitus maksaa perusmaksun ja matkan mukaisen osan. **(T)**
- **Maine (E):** yksi yhteinen mittari, koska maine leviää. Nopea toimitus nostaa mainetta: kellon alkupuolella reilusti, lopussa vähän. Myöhästyminen ja peruuntunut tilaus laskevat mainetta. Mittari on 0–100, ja sillä on katto. **(T: asteikko)**
- **Maine ohjaa tilausten tahtia.** Nollassa tilauksia ei tule lainkaan, ja maine palautuu hitaasti itsestään (noin +1 / peliminuutti, kunnes se on 20). **(E: nollassa ei tilauksia ja hidas palautuminen; T: luvut)**
- **Palkat:** auto = kuski. Palkka juoksee ajan mukaan koko ajan, ei kertasummana per päivä, koska päivän pituuden päättää pelaaja. **(E: palkat; T: ajan mukaan)**
- **Kaatuminen:** peli kaatuu, kun kassa on miinuksella päivän päättyessä. Pelin aikana miinus näkyy punaisena varoituksena. **(E: kassa miinuksella kaataa; T: tarkistushetki)** Tyytymättömyys ei kaada peliä suoraan. **(E)**
- **Tavoite:** yrityksen kasvu ja tulos. **(E)** Ennätyksiä ovat paras päivän tulos, suurin kassa ja pisin putki. Pakkoa kasvaa ei ole: pienellä porukalla voi rullata kannattavasti, mutta iso tulos vaatii kasvua. **(E)**

## 7. Päivä **(E)**

- Päivä kestää niin kauan kuin pelaaja haluaa. Päivälle ei ole ylärajaa.
- **Lopeta päivä:** uusia tilauksia ei enää tule. Avoimet tilaukset, joita ei ole annettu autoille, peruuntuvat **(T: ilman mainehaittaa)**. Järjestystä ei voi enää muuttaa, ja peli pikakelaa (noin 8×), kunnes annetut tilaukset on toimitettu tai ne myöhästyvät. Myöhästymiset rokottavat vielä mainetta.
- **Päivän päätösruutu:** tulot, palkat, tulos, maine ja kysyntäilmoitukset (esimerkiksi "Kauppakeskuksen kysyntä kasvaa" tai "Uusi asiakas: Leipomo"). Täällä tehdään bisnespäätökset: osta auto (palkkaa kuski) tai myy auto (irtisano kuski). **(T: päätökset vain tällä ruudulla)**
- Seuraava päivä jatkuu samasta kohdasta, ja autot jatkavat siitä mihin jäivät.

## 8. Kasvu ja kysyntä

- Kysyntä kasvaa päivien myötä: yrityksiä tulee lisää (harmaa talo saa värin) ja olemassa olevien tahti nousee. Kasvu näkyy etukäteen päätösruudun ilmoituksina, jotta auton oston voi ajoittaa. **(E: ilmoitettu kysyntä; T: mekanismi)**
- Rahalla ostetaan v1:ssä vain autoja. Isommat autot ja muut ostokset tulevat myöhemmin, jos tarvitaan. **(E: kysymys 7 jätettiin auki)**

## 9. Ilme **(T)**

Litteä ja selkeä kuten Mini Motorwaysissa: vaalea maa, valkoiset tiet, harmaat talot, sopimusyritykset kirkkailla väreillä ja autot pieninä pyöristettyinä suorakulmioina. Ilme on oma kuten Headmazessa, mutta Appipaja 2.0:n periaatteita noudatetaan: järjestelmäfontti, kontrasti vähintään 4,5:1 ja vaalea/tumma laitteen mukaan. Piirto tehdään canvasilla, ja käyttöliittymä on HTML:ää.

## 10. Tallennus **(T)**

- Pelin tila tallentuu automaattisesti avaimella `pakettipeli:v1`, jotta peli jatkuu sovelluksen sulkemisen jälkeen: `{app:'pakettipeli', ver:1, savedAt, peli:{siemen, aika, kassa, maine, autot, tilaukset, päivä}, ennatykset}`.
- Varmuuskopio ennätyksistä ja omista kartoista (v2) tiedostona ja tekstinä.

## 11. Karttaeditori (vaihe 2) **(E)**

Pieni ruudukko. Tie piirretään sormella kuten Mini Motorwaysissa, ja rakennus valitaan alareunan valikosta (tie, talo, sopimusyritys, toimipaikka, kumi). Rakennuksen kokoa voi muuttaa, ja koko vaikuttaa tilausmäärään. Editori tarkistaa, että toimipaikasta pääsee jokaiseen yritykseen. Omat kartat tallennetaan ja niitä voi pelata.

## 12. Versiot

- **v1 (ensimmäinen pelattava):** yksi generoitu kaupunkityyppi (ruutukaava, siemen satunnainen tai annettu), spontaanit ja ennakkotilaukset, autojen ohjaus ja hidastus, kapasiteettisääntö, maine, palkat, päiväsykli päätösruutuineen, auton osto ja myynti, kaatuminen, ennätykset ja automaattitallennus.
- **v2:** kaupunkityyppejä lisää, karttaeditori ja kysyntäilmoitusten hiominen.
- **v3 (jos tarvitaan):** isommat autot, muut ostokset ja tasapainotus.

## 13. Testit

- Logiikka nodella: reitinhaku, kapasiteetin siirtosääntö, ennakkotilauksen odotus, maineen nousu ja lasku sekä katto, palkat ajan mukaan, kaatuminen, päivän pikakelaus ja generaattorin yhtenäisyys (kaikki yritykset tavoitettavissa toimipaikasta).
- Selain 390 ja 320 px tietokoneen Chromiumilla: napautukset, hidastus ja paneeli.
- Tasapainotus: botti pelaa yksinkertaisella säännöllä (lähin vapaa auto) useita päiviä, ja tarkistetaan, että yhdellä autolla pärjää alussa eikä kasvu ole ilmaista.

## 14. Avoimet

- Peruuntuvatko avoimet, autoille antamattomat tilaukset päivän päättyessä ilman mainehaittaa? **(T-oletus: ilman haittaa)**
- Kapasiteetti 4, hidastus 0,25×, pikakelaus 8× ja kaikki rahaluvut ovat tekoälyn arvauksia, ja ne säädetään pelaamalla.
