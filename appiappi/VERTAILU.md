# Master ja Kytköskartta: erot ja yhdistämisen suunnitelma

Kirjoitettu 15.10.2026 Pajakoneen aloittamisen yhteydessä. Lähteet: `master/index.html` (versio 17), `master/TOIVEET.md`, `kytkoskartta/index.html` (versio 8) ja apien Notion-rivit.

**Emilin linjaus 15.10.2026:** Pajakone on uusi appi, joka tehdään Kytköskartan kopiona, ja siihen tuodaan Masterin ominaisuuksia järkevässä järjestyksessä. Master ja Kytköskartta jäävät toistaiseksi ennalleen. Kun appien logiikka on ristiriidassa, **Kytköskartan logiikka voittaa**. Masterista saa ottaa inspiraatiota myös myöhemmin. Vienti erilliseksi käyttäjä-appiksi ei ole vielä ajankohtainen. Masterin projekteja (Headmaze, Duunipeli) ei tarvitse siirtää; ne voi rakentaa uudelleen.

## 1. Yhteinen pohja

Molemmissa on projekteja, joissa on käyttäjälle näkyvä puoli ja logiikkapuoli. Logiikka rakennetaan palikoista, ikkunoista (sulut: JA, TAI, VAIN YKSI, VÄHINTÄÄN N, EI), JOS- ja KUN-palikoista, toiminnoista ja nuolista. Kummassakin on Miksi?-selitys, Kumoa, GitHub-tallennus yksityiseen repoon (`Kasibanaani/master-tiedot`) ja Appipajan ilme 2.0 teemoineen. Kytköskartan logiikkakanvaasi on samaa sukua Masterin Ketjut-kanvaasin kanssa, ja JOS ja KUN tarkoittavat molemmissa samaa (Emilin päätös 14.10.2026).

## 2. Vain Kytköskartassa (tulee Pajakoneeseen sellaisenaan)

- Vapaa näkymäkanvaasi (Freeform-tyyli), monta näkymää, sijainnit, alueet, alkukohta ja rullauksen rajaus.
- Kaava ja viite (`{viite}`), Kaavan tulos, VALITSE, Hakutaulukko, Päivämäärän osa, Tänään.
- Tapahtumaketju kaikkine palikoineen: ajastin (kesto ja kellonaika), Ehto, Odota kunnes, Monta haaraa, Arpa, Toista, Ketjun tulos, Lopeta ketju, Käynnistä ja Pysäytä ketju, avautuessa käynnistyvä ketju.
- Satunnaisluku muotoiltavalla jakaumalla.
- Näkymäpalikat: lista, aikajana, kaavio, kalenteri, päivämääräkenttä, lukukenttä, ilmoitus, koristeet.
- Rinnakkain-näkymä, Yhteydet, ☰ Palikat -taulukko, pikakatselu, monivalinta ja tasaus, kopioi ja liitä, pikaluonti, Tee uudelleen, puhelinasettelu alle 760 px.

## 3. Vain Masterissa (ehdokkaat tuotaviksi)

| Masterin ominaisuus | Kytköskartassa nyt | Ehdotus Pajakoneeseen |
| --- | --- | --- |
| Puhelinsimulaatio: projekti rakennetaan puhelimen ruudussa | Vapaa kanvaasi ilman laitetta | **Tehty (Pajakone 1):** näkymän laite Vapaa / Puhelin / iPad pysty / iPad vaaka |
| Ruudut ja puhelimen alapalkki, alapalkista piilotetut näkymät, Palaa takaisin | Näkymät välilehtinä yläreunassa, Siirry näkymään | **Emil 15.10.2026: ei valmista alapalkkia.** Palkki tehdään tavallisista palikoista (painikkeet + Siirry, myöhemmin kuva kosketusalueineen). **Tehty (Pajakone 2):** rullausvauhti (palikka lukittu ruutuun tai hitaampi tausta) ja toiminto Palaa takaisin |
| Maailmat: ruudukkokartta, esteet, alueet (astu, pysähdy, kosketus), hahmon liike ja nopeus, kamera ja zoomaus, SVG-pohjakuva ja kerrokset, kosketettavat muodot, hahmon siirto | Ei vastinetta | Maailma-palikka näkymään. Alueet ja esteet ovat palikoita, joilla on tapahtumat (astuttu, poistuttu) ja arvo (hahmo on alueella), joten ne kytketään nuolilla kuten painikkeet. Kaksi vaihetta: ensin kartta, hahmo ja alueet, sitten kuvat, kerrokset ja kamera |
| Painikkeen pitkä painallus, irrotus (myös painalluksen kesto), palautuva painike, ”yksi painallus riittää” | Painike: jää pohjaan tai kertapainallus, tapahtuma painettu | **Tehty (Pajakone 2):** pitkä painallus, irrotettu, painalluksen kesto ja käytös Pohjassa vain painettaessa |
| Toiveet tekoälylle (lappu projektiin, ruutuun tai palikkaan, GitHubissa, Toiveet-välilehti) | Ei vastinetta | Tuodaan: toive palikkaan tai näkymään, tekoäly käsittelee ne GitHubista |
| Päiväkohtaiset tiedot (`cfg.days`: jokaisella päivällä oma tila ja päivänvaihto) ja Seuranta-välilehti | Aikajana ja kalenteri, ei päiväkohtaista tilaa | Myöhemmin, jos tarvitaan Päiväkartan kaltaisia projekteja |
| Projektin tyyli: valmiit tyylit, paletit, muoto, pinta, fontti, tiheys, painikkeiden ja liikkeen tyyli, palikan korostus | Käyttönäkymän teema ja palikoiden värit | Myöhemmin: projektin muoto, fontti ja tiheys samaan teemavalintaan |
| Vienti erilliseksi käyttäjä-appiksi (HTML) | Ei vastinetta | Myöhemmin (Emil: ei vielä). Moottori on jo omassa lohkossaan, joten vienti onnistuu samalla tavalla kuin Masterissa |
| Ajastin-palikka näkyvänä (sekuntikello tai aikaraja, luku tai palkki, toistuva tapahtuma) | Ajastin vain ketjussa | Harkitaan: näkymään ajastin, joka käynnistetään ja pysäytetään toiminnoilla. Ketju kattaa jo osan |
| Laskuri (+ ja −, rajat) | Lukukenttä, Muisti, Lisää-toiminto | Riittää todennäköisesti. Tarvittaessa lukukenttään + ja − -napit |
| Minipelit: sade ja kohdelista | Ei vastinetta | Ei tuoda sellaisinaan. Samat pelit rakennetaan maailmalla, ketjuilla ja satunnaisluvulla. Inspiraatioksi |
| Toiminnon todennäköisyys (p %), ennätys (best), satunnainen valinta (pick) | Arpa, Satunnaisluku | Ennätys on pieni ja hyödyllinen (”aseta, jos suurempi”). Muut hoituvat Arvalla ja Satunnaisluvulla |
| Kartta-välilehti (suhteet taulukkona), Ketjut Lista-näkymä, Arvot-taulukko | Logiikkakanvaasi, ☰ Palikat | Ei tuoda: kanvaasi ja ☰ Palikat korvaavat |
| Esimerkkiprojektien kirjasto (16 projektia) | Yksi esimerkkiprojekti | Ei tuoda. Projektit voi rakentaa uudelleen tarvittaessa |

## 4. Ristiriidat ja ratkaisut (Kytköskartta voittaa)

| Asia | Master | Kytköskartta = Pajakone |
| --- | --- | --- |
| Ehdot | Ehto-palikka sääntölistoineen (`req`, `suf`) | Ikkunat ja nuolet |
| Mitä painalluksesta seuraa | Palikan omat toimintolistat (`act`, `lact`, `ract`…) | Nappi on vain nappi; seuraukset ovat erillisiä toimintopalikoita nuolilla |
| Laukaisin ja lippu | Omat palikkalajit | Muisti, painike (kertapainallus) ja KUN. Maailman alueen ”hahmo on alueella” korvaa laukaisimen `inside`-tilan |
| Viittaus | `[Nimi]` kaavassa, `{Nimi}` tekstissä, `{r: id}` lukukentässä | Viite `{viite}` kaikkialla, kaava- ja tulos-palikat |
| Asettelu | Virta (allekkain, leveys %) tai vapaa sijainti | Vapaa sijainti. Laitteen kehys antaa raamit |
| Navigaatio | Ruudut + alapalkki, näkymät, Palaa takaisin | Näkymät + Siirry. Alapalkki ja Palaa takaisin tuodaan puhelinnäkymiin (vaihe 2) |
| Tallennus | `master:v1`, GitHub `projektit/` | Pajakoneella omat: `pajakone.v1`, GitHub `pajakone/` |

## 5. Etenemisjärjestys

1. **Pajakone 1 (tehty 15.10.2026):** kopio Kytköskartasta omilla tallennusavaimilla, tuonti Kytköskartasta samasta selaimesta, näkymän laitemuoto (Vapaa, Puhelin, iPad pysty, iPad vaaka).
2. **Puhelinappin perusta (tehty 15.10.2026, Pajakone 2):** valmiin alapalkin sijaan rullausvauhti (lukittu ruutuun / hitaampi), Puhelin vaaka, Palaa takaisin, painikkeen pitkä painallus, irrotus, kesto ja Pohjassa vain painettaessa, Ruudun keskelle, Monista N kpl. Lisäksi Emilin idea **Käyrä-palikka** (syöte → tulos muotoillun käyrän kautta).
3. **Toiveet tekoälylle** palikkaan ja näkymään (GitHubiin, tekoäly käsittelee).
4. **Maailma 1:** maailma-palikka, ruudukko, esteet, alueet tapahtumineen, hahmo, ohjaus napauttamalla, nuolinäppäimillä ja sormella, hahmon siirto toiminnolla.
5. **Maailma 2:** SVG-pohjakuva ja kerrokset, kosketettavat muodot, kamera ja zoomaus, hahmon nopeus palikasta.
6. **Pelin tuntu:** ketjun efektit (teksti ilmestyy, kuva vaihtuu, animaatio, näkymänvaihto), näkyvä ajastin, ennätys.
7. **Projektin tyyli** Masterin tyylijärjestelmästä.
8. **Vienti** erilliseksi käyttäjä-appiksi.

Järjestystä voi muuttaa. Vaiheet 2 ja 3 ovat pieniä, maailma on iso.

## 6. Emilin jatkotoiveet (15.10.2026)

- **Asettelutyökaluja paljon lisää:** palikat nopeasti oikean kokoisiksi ja tarkasti halutun alueen (esim. puhelinruudun) keskelle, tasaiset välit helposti, yhtenäisen näköiset kopiot.
- **Kerrokset:** näkymässä kerroksia, esim. ruutuun lukittu päällyskerros, ja kerroksille oma rullausvauhti (taustakerros liikkuu hitaammin kuin sormi, syvyysvaikutelma). Asiat voivat mennä toistensa ali. Pajakone 2:n rullausvauhti on tämän ensimmäinen pala palikkakohtaisena.
- **Kuva kosketusalueineen** (kuten Masterin maailman kosketettavat muodot), esim. alapalkki kuvana.
- **Käyrä laajemmin:** käyrä animaatioihin (muutos ajassa) ja tulevaan ohjailutattiin (kauempana keskeltä = kiihtyvä vaikutus).

**Tehty 15.10.2026 illalla (Pajakone 3):** 3a asettelutyökalut, 3b kerrokset (nimi, järjestys, rullausvauhti, piilotus ja lukitus muokatessa), 3c Kuva-palikka ja näkymätön kosketusalue, 3d Tatti, Muutos ajassa, Liike ja näkymäpalikan siirto logiikasta. Käyrä animaatioon: Muutos ajassa -palikan edistyminen Käyrän syötteeksi. Seuraavana etenemisjärjestyksessä: toiveet tekoälylle ja Maailma (esteet, alueet, törmäykset).

## 7. Pajakone 4: viitattavat ominaisuudet (15.10.2026)

Emilin päätös: jokainen palikan arvo ja ominaisuus saa viitteen, jotta sitä voi lukea ja ohjata samalla logiikalla. Kaava on tila (”näin on, kun logiikka pätee”), toiminto tapahtuma (”tee tämä nyt”). Etusija: ohjattu (kaava tai nuoli) > asetettu (toiminto) > perusarvo; Palauta poistaa asetetun. Muokatessa näkymä näyttää perusarvot.

- **Rekisteri** (`omat(b)` moottorissa) on ainoa paikka, jossa palikkalajin ominaisuudet luetellaan. Siitä syntyvät kaavan `palikka.ominaisuus`, ohjauskohdat `o_<avain>` (vain avatut, kenttä `b.ohk`), tarkastelijan Ominaisuudet-osio, toimintojen kohteet (`tee.om`) ja virheen luettelo. Uusi ominaisuus lisätään vain rekisteriin (ja näkymän piirtoon, jos se vaikuttaa ulkonäköön).
- **Asetetut arvot** ovat käyttötietoa: `P.st['o:'+id]`. Kertapainalluksen kyllä/ei: `P.st['as:'+id]` (asetus `kv: 'vaihto'`). Arvan viimeisin: `P.st['arpa:'+id]`.
- **Aika:** Arvo-palikan yksikkö (`yks`: s, min, h, px, %). Aika on laskuissa sekunteina ja näkyy omassa yksikössään. Ajastin ja odotuksen aikaraja tulkitsevat aika-arvon nuolesta sekunteina, pelkän luvun omassa yksikössään. Muutos ajassa sai kestolle yksikön ja `.kulunut` (s): Käyrän syöte = kulunut, x-väli 0 – kesto → liike omalla kiihtyvyyskäyrällä.
- **Ympäristö kaavassa:** `ruutu.leveys`, `ruutu.korkeus`, `näkymä`, `näkymä.numero`, `nyt` (kello), `nyt.tunti`, `nyt.minuutti`, `nyt.sekunti`, `tumma`. Sanat ovat varattuja viitteinä.
- **Kyllä vihreä, ei sininen** (muuttujat `--kyl`, `--ein`), koska punainen kuuluu ketjuille ja oranssi viitteille.


## 8. Appi-appi: maailma (16.10.2026 alkaen)

Emilin päätös 15.10.2026: Clauden maailmaehdotus toteutetaan järjestyksessä. Kanvaasi on maailma, erillistä maailmaikkunaa ei tehdä. Liike-, törmäys- ja kameralogiikka on moottorissa (`KK`), ei käyttöliittymässä, jotta se toimii myöhemmin myös viedyssä apissa.

- **Vaihe 0 (nimenvaihto):** Pajakone → Appi-appi, kansio `appiappi/`, tiedot siirtyvät samasta selaimesta ja GitHubista.
- **Vaihe 1 (kamera ja maailmanäkymä):** näkymän asetuksissa Maailma ja kamera: rullaus pystyyn / kaikkiin suuntiin / ei, kamera seuraa palikkaa, kuollut alue ympyränä (% ruudusta), pehmeys, maailman rajat Alue-palikasta. Kerrosten rullausvauhti molempiin suuntiin, lukittu kerros on kojelauta. Muokatessa kuollut alue näkyy katkoviivaympyränä laitteen kehyksessä.
