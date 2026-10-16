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
- **Vaihe 2 (liike, esteet, alueet):** Liike-palikka liikuttaa suoraan valittua palikkaa (Liikutettava palikka). Este on palikan asetus (Este ja osuma-alue -osio: este, osuma-alue laatikko / ympyrä / muodon mukaan, koko %) tai kerroksen asetus (🧱). Liikkuva liukuu esteen reunaa pitkin eikä mene ohuen esteen läpi suurellakaan nopeudella. Liike kertoo logiikalle liikkuu, osuu esteeseen, nopeus, suunta ja törmäsi. Alue tunnistaa valitun palikan tai kaikki liikkuvat: sisällä, montako sisällä, astuttu, poistuttu. Muokatessa osuma-alueet näkyvät katkoviivana.
- **Vaihe 3 (hahmo):** Liikkeen ohjaus: Nopeus x, y (kuten ennen) / Tatti / Napautus kohteeseen / Auto (kaasu + ohjaus, tatista tai nuolista). Huippunopeus. Vauhti-osio: kiihtyminen ja jarrutus sekunteina, vauhdin muoto (suora, kiihtyy, hidastuu, S tai oma Käyrä-palikka) ja liukkaus %. Emilin kysymykseen liukkaudesta ja kiihtyvyydestä vastattiin näin: ne ovat Liikkeen asetuksia, ja muodon voi antaa Käyrä-palikalla. Hahmo-osio: kääntyy kulkusuuntaan tai peilaa sivuttain, kuvan oma suunta. Kierto ja peilaus ovat nyt kaikkien näkymäpalikoiden ominaisuuksia (myös kaavasta).
- **Vaihe 4 (kuvasarja):** Kuva-palikan paneelissa Kuvasarja (animaatio): kuvat järjestyksessä (pääkuva = kuva 1), lisäys kuvatiedostoina (monta kerralla, nimen mukaan järjestykseen) tai SVG-tekstinä, ↑↓ ja ✕, nopeus kuvaa sekunnissa (myös logiikasta) ja Pyörii: ei / aina / kun liikkuu, tai nuoli kohtaan pyörii kun. Muokatessa 🎞-merkki.
- **Vaihe 5 (ruudukko):** ruudukko on kerroksen ominaisuus (kerrosrivin ▦): ruutukoko, tihennys (kohdistus ½, ⅓ tai ¼ ruutuun), näkyy muokatessa / aina / ei, kohdistus päälle/pois. Palikat kohdistuvat kerroksensa ruudukkoon raahatessa ja kokoa muutettaessa. Napautus kohteeseen osuu ruudun keskelle. Ruutukohtaiset alueet: Alue → Ruutu kerrallaan kertoo tunnistettavan ruudun (ruutu x, ruutu y, ruutu vaihtui) ja napautetun ruudun (napautettu x, y ja tapahtuma napautettu). Palikoilla luettavat ominaisuudet ruutux ja ruutuy.
- **Vaihe 6 (reitit, Emilin lisätoive):** Koristeet → Reitti: piirretään napauttamalla pisteet kanvaasille (ruudukko kohdistaa), pisteitä voi vetää ja kaksoisnapautus poistaa; suljettu tai avoin, näkyy käytössä tai ei. Liikkeen ohjaus Reitti: kerran / edestakaisin / kierroksia, alkaa heti tai vasta käynnistä-tapahtumasta, pysäytä-tapahtuma ja liikkuu kun -ehto, joten logiikka ja tapahtumaketjut voivat käynnistää ja pysäyttää autonomiset liikkujat. Logiikkaan edistyminen ja päässä. Samalla korjattiin: painikkeet saavat napautuksen myös silloin, kun jokin liikkuu koko ajan.
- **Vaihe 7 (reitinhaku, tekoälyn ehdotus):** Liikkeen ohjaus Napautus → valinta *Kiertää esteet* (oletuksena pois, joten vanhat projektit liikkuvat kuten ennen). Reitti haetaan ruudukossa (A*) liikkujan osuma-alueen kokoisena ja oikaistaan suoriksi osiksi; kerroksen ruudukon kanssa solmut ovat ruutujen keskellä. Jos kohteeseen ei pääse, hahmo kulkee lähimpään kohtaan, johon pääsee, ja logiikkaan tulee *ei pääse* = kyllä. Haku uudelleen, kun kohde vaihtuu tai hahmo törmää (liikkuvat esteet). Moottorissa (`reittiHae`), joten toimii myös viedyssä apissa.
- **Vaihe 8 (ruutu kerrallaan, Emilin päätös 16.10.2026: kaikki kolme ohjaustapaa, hahmo liukuu):** Liikkeen ohjaus Ruutu. Askel = kerroksen ruutu (keskipiste ruutujen keskeltä), ilman ruudukkoa oma askelpituus. Suunta nuolinapeista (kohdat ylös, alas, vasen, oikea), tatista (pidettäessä askel toisensa perään) tai pyyhkäisystä (valinta Pyyhkäisy ohjaa). Kesken askeleen tullut suunta odottaa vuoroaan. Este tai raja estää askeleen (törmäsi), tapahtuma askel valmis. Liukuu huippunopeudella; iso nopeus = hyppy.
- **Emilin päätökset 16.10.2026:** osuma-alue ei kierry palikan mukana (kääntyvälle hahmolle ympyrä), ja reitillä kulkeva liikkuu kiskoilla eikä törmää esteisiin, mutta voi itse olla este muille. Molemmat käyvät sellaisinaan.

## 9. Appi-appi 9: yleiskäyttöiset palat (16.10.2026)

Emilin linjaus 16.10.2026: ominaisuudet mahdollisimman yleiskäyttöisiksi, ei pelisidonnaisia, jottei synny päällekkäisiä tapoja tehdä samaa.

- **Kerrokset käytössä:** kerroksella on asetukset *näkyy käytössä*, *estää alempien käytön*, *himmennä alemmat* ja *läpinäkyvyys* (kerrosrivin ⚙, kentät `pk`, `es`, `him`, `lp`). Logiikkaan **Kerros-palikka** (`kerros`, kentät `vw`, `kr`), jonka ominaisuudet ovat samat; perusarvo on kerroksen asetus, ja etusija on tavallinen (nuoli tai kaava > toiminto > perusarvo). Piilotetun kerroksen palikat ovat piilossa (myös esteinä ja kaavan `.näkyy`), mutta muokatessa kaikki näkyvät. Ylin näkyvä kerros, joka estää tai himmentää, saa alleen suojan, joka ottaa kosketukset. Alue ja Sijainti eivät piiloudu kerroksen mukana.
- **Ennätys:** ei omaa toimintoa. Tehdään Muistilla, SUURIN- tai PIENIN-ikkunalla ja Aseta-toiminnolla. Keskiarvo, suurin ja pienin ohittavat nyt tyhjät arvot, joten tyhjästä alkava pienin aika toimii.
- **Sekuntikello** (`kello`): kulunut aika sekunteina, tapahtumat käynnistä / pysäytä / nollaa ja ehto *käy kun*. Tila `st[id] = {run, t0, acc}`; aika kuluu kellon mukaan myös, kun appi on kiinni. Kulunut on aika-arvo (ajastimen kesto sekunteina).
- **Monitori** (`mittari`): yleinen reaaliaikainen näyttö mille tahansa luvulle. Muodot luku, palkki, pylväs, rengas, kaari ja pisteet; esitys luku, aika (m:ss) tai prosentti; pienin, suurin, desimaalit, yksikkö, paksuus, merkki ja luku näkyy. Arvo on ominaisuus (perusarvo `va`, kohta `o_arvo` auki valmiiksi), joten sen voi antaa nuolella, kaavalla tai toiminnolla.
- **Efektit** Teksti ilmestyy, Kuva vaihtuu, Animaatio ja Näkymänvaihto ovat käytössä ketjussa ja ketjun ulkopuolella (nuoli kohtaan *alkaa*). Ketjussa seuraava odottaa efektin loppuun, ulkopuolella *sitten* lähtee heti. Efektin teksti ja kuva jäävät voimaan asetettuina arvoina (`st['fxt:'+id]`, `st['fxk:'+id]`), Palauta perusarvo poistaa ne. Animaatio ja siirtymä ovat pelkkää näyttöä (Web Animations, erilliset `translate`/`scale`/`rotate`-ominaisuudet, eivät sotke palikan kiertoa).

## 10. Appi-appi 10: zoomaus käytössä (16.10.2026)

Emilin päätökset 16.10.2026 (kaikki tekoälyn suositukset): sormien zoomaus keskittyy sormien väliin, mutta seuratessa seurattava pysyy keskellä; lukittu kerros (kojelauta) ei zoomaudu; näkymässä vaikuttaa yksi Kamera-palikka (ensimmäinen); nuoli tai kaava lukitsee sormet, Aseta ei.

- **Näkymän asetus** (Maailma ja kamera → Zoomaus, kenttä `v.zm = {s, min, max}`): *Sormilla* päälle/pois (oletus pois), pienin ja suurin %, oletus 50–300 %. 100 % = laitteen ruutu. Tietokoneella ⌘/Ctrl + rulla tai ohjauslevyn nipistys. Kun sormilla voi zoomata, napautus maailmaan tehdään vasta sormen noustessa (ei nipistyksen jälkeen), jottei nipistyksen ensimmäinen sormi lähetä hahmoa.
- **Kamera-palikka** (`kamera`, kentät `vw`, `zm` = zoomaus alussa): ominaisuus *zoomaus* % (kohta `o_zoomaus` auki valmiiksi, rajat 10–1000), lähdöt *näkyvä leveys* ja *näkyvä korkeus* (laitteen koko / zoomaus). Etusija tavallinen: nuoli tai kaava > toiminnon tai sormien asettama (`st['o:'+id].zoomaus`) > perusarvo. Pehmeä zoomaus: Muutos ajassa → zoomaus. Ilman Kamera-palikkaa sormien zoomaus on käyttöliittymän tietoa (`P.cam[vw].zm`) ja palaa 100 %:iin alkukohdassa.
- **Muunnokset:** kameran mittakaava = laitteen sovitus × zoomaus, joten napautus kohteeseen, ruutu- ja aluenapautus, kuollut alue ja maailman rajat toimivat maailman koordinaateissa. Logiikan zoomaus pitää ruudun keskikohdan paikallaan. Pystyrullauksessa zoomattuna voi rullata myös vaakaan laitteen leveydellä; ilman rullausta ruutu zoomautuu keskeltä. Parallaksi lasketaan zoomattuna ruudun keskeltä (100 %:ssa kuten ennen). `ruutu.leveys` on edelleen laitteen leveys, koska kojelauta ei zoomaudu; näkyvä maailma on `kamera.leveys`.
- Moottorissa `zoomAsetus`, `kameraBlk`, `zoomNyt`, `zoomLukittu`, `zoomAseta`; kojelaudan vastaskaalaus ja nipistys ovat käyttöliittymää.
