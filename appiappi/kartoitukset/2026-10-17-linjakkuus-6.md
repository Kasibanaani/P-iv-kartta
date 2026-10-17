# Linjakkuuskartoitus 6 (17.10.2026)

Vuorossa, koska kartoitus 5:n jälkeen jonosta on viety viisi kohtaa: Hae rivitiedosto F32 vaihe 1 (Appi-appi 43, jonon 9, kaista B), Janan nimet ja reunat 1n (44, kaista A), Peliohjain F33 vaihe 1 (45, jonon 10, kaista B), Palikat-palstan rivit (46, jonon 12, kaista B) ja yläpalkin napit (47, jonon 11, kaista A). Lisäksi katsottiin tänään jonoon tulleet suunnitelmat ennen kuin niitä rakennetaan: 18 värit ja paletit (jonon 14), 19 2D-pelit (jonon 16–22), 20 palikan oma ruudukko (15b), 21 palikkajoukko (15c–15e) sekä Headmazen (15) ja Autopelin (23) kömpelyyslistat. Mittapuu: [PALIKKASAANNOT.md](../PALIKKASAANNOT.md) ja [MISSIO.md](../MISSIO.md). Kartoitus tuottaa löydöksiä ja ehdotuksia, ei koodimuutoksia. **Mikään alla oleva ehdotus ei ole toteutuslupa**, paitsi jonoon lisätty kohta 1o (ks. loppu), joka korjaa jo vietyä työtä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran commit `a8425ca` (Appi-appi 47), 62 palikkalajia (+ Peliohjain `pohj`). Viiden kohdan `index.html`-muutokset luettiin kartoitus 5:n pohjasta `1644c37` alkaen (306 lisättyä, 47 poistettua riviä): Hae-moottori (`haeLue` … `haeIssue`) ja käyttöliittymä (`haeAlku`, `haeUudet`), Janan 1n-muutokset, Peliohjaimen moottori (`ohjainSet`, `padTatti`, `padProp`) ja kyselysilmukka (`padKierros`), Palikat-palstan rivi ja yläpalkin CSS.
- **Moottorilla Nodessa kokeiltiin:** Tietotaulukon lähteen poisto nuolen kanssa (S2), Peliohjaimen kohtien nimet, vanha `jana.osuus` (antaa virheen, kuten testi `logiikka_75` vaatii: ei löydös).
- **Koodista tarkistettiin:** tapahtumien nimet kaikilla lajeilla (`E(…)`-luettelo), Liikkeen ominaisuusrekisteri (`omat`, laji `liike`), käytössä olevat palikan kenttien avaimet suunnitelmien ehdottamia avaimia vasten (`hk`, `hil`, `lh`, `rt`, `il`, `org`), tapahtumatietojen nimet `x`, `y`, `ruutux`, `ruutuy`, `kohdex`, `napautettux`.
- **Manuaali:** luvun 4 Peliohjain, luvun 7 Lähde, luvun 5 Hae tiedostosta, luvun 6 ominaisuustaulukot, luvun 2 yläpalkki ja Palikat-lista, luvun 9 tila ja varmuuskopio, hakemiston rivit ja luvun 11 versio. Muita lukuja ei luettu.
- **Testit:** koko sarja ajettiin, ks. *Koko testisarja*. `selain_83_hae` erikseen, ks. *Testi selain_83_hae*.
- **Ei katsottu:** suunnitelma 22 (F38, jonon 12b–12d ja 14b–14c), joka tuli päähaaraan tämän kartoituksen aikana; seuraava kartoitus tai sen rakentaja tarkistaa sen samoja sääntöjä vasten. Nimien kokonaislista (kartoitus 5 lupasi; tehtiin vain tapahtumien osalta, ks. S1), käyttöpuoli puhelinleveydellä viennin näkökulmasta (siirtyy viennin F23 suunnitelmaan), oikea peliohjain ja oikea iPhone.

## Yleiskuva

**Linja pitää.** Viisi vietyä kohtaa ei tuonut uutta erikoispalikkaa, uutta sääntökieltä eikä uutta funktiota. Kartoitus 5:n jonoon viety 1n on korjattu kokonaan (44), ja sen jälkeen tehdyt kaksi isompaa työtä noudattavat sääntöjä hyvin:

- **Hae rivitiedosto** on oikein jaettu: moottori ei käytä verkkoa (A12), toiminto on hetki ja tulos tulee taulukon tapahtumina (A4, A6), tila on käyttötietoa eikä rakennetta, virhe ei muuta rivejä ja näkyy paneelissa ja ominaisuutena (A10). Esikatselu uusista sarakkeista on perusteltu kysymys (A11), koska se muuttaa taulukon rakennetta.
- **Peliohjain** käyttää samoja nimiä kuin Tatti (`vaaka`, `pysty`, `etäisyys`, `suunta`) ja Painike (`painettu`), napit on nimetty sijainnin mukaan eikä merkin mukaan (yksi opittava nimi kolmelle valmistajalle), ja Tatti ja Painike seuraavat ohjainta samaa polkua kuin sormea, eli uutta erikoisreittiä ei tullut (A8). Arvot ovat vain luettavia, ja syy on kirjattu (A2: ne tulevat laitteesta).
- **46 ja 47** ovat pelkkää esitystä; tieto siirtyi vihjeeseen, ei kadonnut. Tietokone ensin -linja (kartoitus 5) näkyy testeissä: 1440 ja 1280 px, puhelin savutestinä.

Löydökset ovat pieniä: yksi tapahtuman nimi poikkeaa sisarpalikoista (S1), asetuksen tyhjennys hävittää nuolet hiljaa nyt jo neljässä paikassa (S2), ja Autopeli toi esiin vanhemman A2-aukon Liikkeessä (S3). Suunnitelmissa on kaksi nimiongelmaa ennen kuin niitä rakennetaan: ruudun numero kulkee kolmella eri nimellä (U1), ja kolme ehdotettua tallennusavainta on jo käytössä toisessa merkityksessä (U2).

## Löydökset: viety työ (43–47)

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| S1 | keski | missio (sama asia, sama nimi), A4 | **Napin irrotus on kolmella nimellä.** Painike: *irrotettu*; Peliohjain: *irti*; Tatti: *loppuu* (koodin sisäinen kohta on kaikilla `irti`). Painike ja Peliohjaimen nappi ovat sama asia (nappi nousee), ja Painikkeen pari on *painettu* / *irrotettu*, Peliohjaimen *painettu* / *irti*. Tatin *alkaa*/*loppuu* on eri asia (veto), joten se saa jäädä. | Peliohjaimen tapahtuma nimelle **irrotettu**. Sisäinen kohta `ir` pysyy, joten nuolet säilyvät; manuaalin luku 4 ja taulukot. **Jonoon 1o.** |
| S2 | keski | A11 (rikkoutuvat yhteydet), A4 | **Tietotaulukon lähteen tyhjennys poistaa haettu- ja hakuvirhe-nuolet hiljaa,** eikä lähteen palautus tuo niitä takaisin (kokeiltu moottorilla: 1 nuoli → 0 → 0). Tämä osuu helposti: riittää, että polkukentän tyhjentää ja siirtyy pois kentästä (muutos tallentuu kentästä poistuttaessa), ennen kuin kirjoittaa uuden polun. Sama kaava kuin kartoitus 5:n R2:ssa; 44 korjasi sen vain Janan kulun vaihdolle (`blockLinks`-ilmoitus). Muut tunnetut paikat: Toistimen tapa ja Ikkunan laji. Neljäs tapaus tekee tästä yleisen säännön. | Yleinen: kun paneelin asetus muuttaa palikan kohtia ja `repair` poistaa nuolia, ilmoitus ”N nuolta poistui, Kumoa palauttaa” (Janan erityiskoodin tilalle sama yleinen tarkistus `afterInsp`issa). **Jonoon 1o.** |
| S3 | keski | A2 | **Liikkeen asetukset eivät ole rekisterissä:** kääntyvyys (`kaa`), liukkaus, kiihtyminen (`ka`) ja jarrutus (`kb`) eivät näy kaavassa eivätkä ole Aseta-toiminnon kohteita, eikä syytä ole kirjattu (vrt. kitka, joka on). Autopeli kiersi tämän kaavoilla, jotka skaalaavat ohjausta (jonon 23 d). Ei koske versioita 43–47, mutta löytyi niiden aikana rakennetusta projektista. | Asetukset rekisteriin ohjattavina (`o:1`, kuten kitka). Ei tallennusmuodon muutosta (kohdat lasketaan lajista). **Jonoon 1o** (siirretty jonon 23 d:stä). |
| S4 | keski | A6 (kaava on tila), A10 | **Kaksi tilan päivitystä puuttuu** (Headmaze, jonon 15 f ja g): Sekuntikello, joka alkaa käydä samassa kuvassa kuin viimeinen liike pysähtyy, ei herätä kuvasilmukkaa, joten `kello >= 60` -ehto laukeaa vasta seuraavasta napautuksesta; näkymän vaihto ei laske logiikkaa, joten `näkymä = "Sokkelo"` pätee vasta seuraavasta tapahtumasta. Kumpikin rikkoo periaatetta, että kaava kuvaa tilaa aina, kun se pätee. Päätelty jonorivin kuvauksesta ja koodin rakenteesta, ei ajettu uudelleen. | Vikoja, ei ominaisuuksia, joten **jonoon 1o** (siirretty jonon 15 f:stä ja g:stä). Uutta tapahtumaa *näkymä avattu* ei tehdä tässä. |
| S5 | pieni | missio (sama sana) | **`tapahtuma.uusi` tarkoittaa haussa lukumäärää.** *Muuttui*-tapahtumassa `uusi` on uusi arvo, *haettu*-tapahtumassa lisättyjen rivien määrä ja *hakuvirhe*-tapahtumassa virheteksti. Manuaali kertoo sen. | Ei jonoon. Jos tieto joskus laajenee (päivittyneet, ennallaan), nimetään se omaksi (`lisätty`). |
| S6 | pieni | A10 | **Pelaajan kuollut alue Tatille tulee saman pelaajan ensimmäisestä Peliohjain-palikasta** (`padDz`). Kahdella saman pelaajan Peliohjaimella eri arvoin Tatti noudattaa ensimmäistä, eikä sitä kerrota. Harvinainen. | Ei jonoon. Tatin Miksi? voi kertoa lähteen, kun Tattia muokataan seuraavan kerran. |
| S7 | pieni | manuaali | **Manuaali vastaa koodia** (43–47) yhtä kohtaa lukuun ottamatta: luvun 9 resepti *Varmuuskopio ennen isoa muutosta* sanoo ”paina yläpalkin **Varmuuskopio**”, mutta enintään 1360 px leveällä ikkunalla napissa on 47:stä alkaen pelkkä 💾. Luku 2 on jo oikein. | Reseptiin ”💾 Varmuuskopio”. **Jonoon 1o** (teksti). |
| S8 | pieni | A11 | **46:n vihje on vain hiirelle:** Palikat-palstan viite, näkymä ja määrä näkyvät vain hiiren alla. Tietokone ensin -linjalla oikein; puhelimella tieto jää näkemättä, mutta haku viitteellä toimii. | Ei jonoon. |

## Löydökset: tulevat suunnitelmat ennen rakentamista

| # | Vakavuus | Sääntö | Koskee | Löydös | Ehdotus |
|---|---|---|---|---|---|
| U1 | keski | A9, missio (sama asia, sama nimi) | 20 (15b), 19 vaihe D | **Ruudun numero kulkisi kolmella nimellä, ja yksi nimi saisi kaksi merkitystä.** Nyt ruutu on aina `ruutux`/`ruutuy` (kerroksen ruudukko, *pudotettu*-tiedot), ja `tapahtuma.x`/`y` on pudotuksessa **pikseleinä** palikan uusi paikka. Suunnitelma 20 ehdottaa ruudukon napautukseen `tapahtuma.x`/`y` = **ruutu** ja törmäykseen `tapahtuma.kohdex`/`kohdey` = ruutu, mutta `kohdex`/`kohdey` on jo Liikkeen kohdepiste pikseleinä (38, P6). Suunnitelma 19 vaihe D ehdottaa laatan tapahtumaan `x`, `y` (ruutu). Sama tapahtuman tieto olisi palikasta riippuen pikseli tai ruutu. | Ruutu on kaikkialla **`ruutux`/`ruutuy`** (1 = vasen yläruutu), pikselit `x`/`y`. Korjattu suunnitelmiin 19 ja 20 (merkintä *Kartoitus 6*) ja jonon 15b riville. `napautettux`/`y` (Alue) säilyy, koska sen merkitys on jo ”ruutu, jos ruudukko”. |
| U2 | keski | A13 (vanhaa avainta ei uuteen merkitykseen) | 19 vaiheet B ja C | **Kolme ehdotettua avainta on jo käytössä:** `hk` = *harmaana kun* (näkymäpalikoiden yhteinen), `hil` = Toiminnon *Ilman laukaisua* (41), `lh` = historiataulukon lähde (36); vaiheen C `rt` = Liikkeen reitti. Suunnitelma itse pyytää tarkistamaan. Lisäksi `hk:` on 43:sta alkaen käyttötiedon etuliite (haun tila). | Avaimet vaihdettiin suunnitelmaan 19 vapaisiin (`hk` → `hyk`, `lh` → `hyl`, `hil` → `hyi`; laattakartan ruudut `rt` → `lrt`). Tarkistettu koodista; rakentaja tarkistaa uudelleen ennen vientiä. |
| U3 | pieni | A3 | 21 (15d) | **Joukon sääntö on uusi etusijataso** (oma ohjaus > joukon sääntö > toiminto > perusarvo). Suunnitelma perustelee sen hyvin, mutta sääntö A3 sanoo vain ”ohjattu > toiminto > perusarvo”. | Kun 15d rakennetaan, A3:n teksti päivitetään samassa työssä. Lisätty jonon 15d riville. |
| U4 | pieni | A7 | 15 (a), 23 (f) | **Kaksi oikeaa projektia törmäsi kaavan rajaan.** Headmaze tarvitsi laskusulkuja (`(sarake - 1) * 80 + 28`), Autopeli `itseisarvo`a, `pienin`tä ja `suurin`ta (nyt `jos`-kiertotiet). `TILA.md`:n avoin kysymys sanoo: ei sulkuja ”ennen kuin tulee oikea tarve”. Tarve on nyt tullut. | **Emilin päätös.** Suositus: pelkät laskusulut sallitaan (ryhmittely ei ole uutta kieltä, vaan koulun laskujärjestys, ja virheilmoitus nykyisestä on rakentajalle yllätys); funktioita `itseisarvo`, `pienin`, `suurin` ei vielä (A7: yksi tarve kumpaakin, `jos` hoitaa, ja SUURIN/PIENIN ovat ikkunoina). ⏸ merkitty jonoon 15 (a). |
| U5 | pieni | A8 | 23 (b), 19 vaihe A, 17 | **Tatin ohjaus kahdessa suunnitelmassa:** 23 (b) tuo Tatille akselin (vaaka, pysty, kulma), ja 19 vaihe A rajaa painovoimassa ohjauksen poikittaiseksi. Ne sopivat yhteen, jos molemmat projisoivat samalla moottorin funktiolla. Lisäksi peliohjaimen tatti kirjoittaa Tatin tilan suoraan (`ohjainSet`), ei `tattiSet`in kautta, joten akseli on tehtävä molempiin reitteihin. | Kirjattu jonon 23 riville. |
| U6 | pieni | A12, kaistat | 23 (e), 19 vaihe A | **Ajoneuvofysiikka ja painovoima muuttavat samaa `liikeAskel`ia** ja tarvitsevat saman kiinteän aika-askeleen. | Ei rinnakkain eri kaistoilla; 23 (e):n suunnitelma tehdään 2D-vaiheen A kiinteän askeleen päälle. Kirjattu jonon 23 riville. |
| U7 | pieni | A8 | 23 (c), 19 kohta 8 | **Näppäimistö (F33 vaihe 4) on suositeltu kahdesti, mutta sitä ei ole jonossa.** Suunnitelma 19 suosittaa sitä ennen 2D-vaihetta B (hyppy), ja Autopeli tarvitsi sitä kahden tatin hiirikäyttöön. | Ehdotus Emilille tai koordinaattorille: F33 vaihe 4 jonoon ennen kohtaa 17. Ei lisätty jonoon (uusi ominaisuus, ei korjaus). |
| U8 | pieni | A8 | 23 (f), 18 | **Muodon täsmävärit** (asfaltti, nurmi) kuuluvat F34:ään: sen kahdeksan paikkaa voi korvata omalla värillä. Palikkakohtainen vapaa heksa olisi suunnitelma 18:n linjaa vastaan (kohta 5, A8). | Kirjattu jonon 23 riville. |
| U9 | pieni | dokumentit | 18, 19, 15 (e) | **Pientä epätarkkuutta:** suunnitelma 18 sanoo ”versio `VER` nostetaan vientihetkellä”, vaikka valinnaiset kentät eivät nosta versiota (19 ja käytäntö: versio pysyy 8); suunnitelma 19 viittaa ”Jonon 15d *Vie palikka*” -toimintoon, joka on jonon 15 (d), ei 15d (Joukko); Headmazen 15 (e) seinäruudut ovat 2D-vaiheen C Laattakartta. | Korjattu suunnitelmiin 18 ja 19 sekä jonon 15 riville. |

Suunnitelmat 18 ja 21 ovat muuten linjassa (kummassakin kohta *Linjakkuus*, ei erikoispalikkaa, ominaisuudet rekisteriin). Suunnitelma 19:n laajuus on iso mutta perusteltu: painovoima Alueen ominaisuutena tekee tikkaat, veden ja käännetyn painovoiman samasta palikasta (A8), ja rakennuslaatikko on presettejä eikä uusi palikka. Jonon 23 (a) Kameran kierto: Kamera on rekisterissä erikoispalikka (*osa ominaisuuksista ei ohjattavissa*); uusi kierto kannattaa tehdä heti luettavaksi ja ohjattavaksi (`kamera.kierto`), ettei aukko kasva.

## Kartoitus 5:n pyynnöt nyt

| # | Tila |
|---|---|
| R1–R4, R6, R10 (1n) | **Korjattu** (44). Vanha `jana.osuus` antaa näkyvän virheen (testi `logiikka_75`). |
| R5 *kohta* kahdessa merkityksessä | Ennallaan, kuten sovittiin; 44 muotoili paneelin ohjeen ilman tuplasanaa. |
| R7–R9 | Ei toimenpidettä, kuten sovittiin. |
| K7 kaistojen muotovuoro | Pidetty: 43 ja 45 merkitsivät tallennusmuodon vuoron (`607981c`, `6233740`), versionumerot 43–47 ja testinumerot (`logiikka_74`–`76`, `selain_83`–`87`) ovat yksilöllisiä, eikä jonorivejä kadonnut (TILA-historia `0ed6376`…`1ea569c`). |

## Erikoispalikoiden rekisteri

Ei uusia rivejä. Peliohjain ei ole erikoispalikka: sillä on arvo, kohdat ja tapahtumat, ja ohjauksen puuttuminen on kirjattu syy (laite). Rekisteri vastaa koodia (`logiikka_58` läpi).

## Testi selain_83_hae

Jumi 17.10. (44:n ajossa) oli kohdassa 7: `APP.saveNow()`, `pg.reload()` ja `wait_for_function("window.APP&&APP.P&&APP.P.b")`. Testi on ainoa, joka odottaa uudelleenlatauksen jälkeen ehtoa (`wait_for_function`, oletus 30 s ja tarkistus `requestAnimationFrame`illa); muut odottavat kiinteän ajan. Sivulla ei ole `beforeunload`-kysymystä (vain `saveNow`), joten lataus ei voi jäädä dialogiin.

**Jumi toistuu, ja syy löytyi.** Tämän kartoituksen koko sarjassa `selain_83_hae` jumittui taas samaan kohtaan (kaikki muut läpi). Erikseen ajettuna se jumittui 2 kertaa 8:sta. Selvitys (vain testiajossa, `localStorage.setItem` kuunneltuna):

1. Ennen latausta `APP.saveNow()` kirjoittaa projektin (noin 2 kt) selaimen muistiin.
2. Jumiutuvalla kerralla uusi sivu näkee selaimen muistin **tyhjänä** heti alussa (vain testin oma `appiappi:gh`-avain, ei `appiappi.v1`:tä). Appin `load()` saa siis tyhjän tallennuksen, eikä projektia ole (`APP.P` = null), joten odotus `APP.P.b` ei täyty koskaan.
3. Noin 0,1 s myöhemmin uusi sivu kirjoittaa tyhjän tallennuksen päälle (`ghFromPaja` → `saveQuiet`, koska GitHub on testissä päällä), joten projekti on poissa myös muistista.
4. Odotus 1 s ennen latausta ei auta (2/8 jumia). **Sama testi `http://127.0.0.1`-osoitteesta (paikallinen palvelin) meni läpi 10/10.**

Johtopäätös: vika on tiedostosta (`file://`) ajetun Chromiumin selainmuistissa uudelleenlatauksessa, ei Hae-toiminnossa eikä appin tallennuksessa. Muut lataavat testit eivät yleensä huomaa sitä, koska ne eivät kirjoita heti avautuessa; 83 kirjoittaa GitHub-yhteyden takia ja tekee tilapäisestä tyhjästä lukemisesta pysyvän. Oikealla `https`-osoitteella tätä ei pitäisi tapahtua (päätelty, ei kokeiltu Safarilla).

Ehdotus: `aja.sh` käynnistää paikallisen palvelimen (`python3 -m http.server`) ja `yhteinen.py`:n `U` osoittaa siihen, jolloin kaikki lataavat testit ovat turvassa. **Jonoon 1o** (testiympäristö, ei appin koodia). Sivuhuomio (pieni, ei jonoon): appi kirjoittaa avautuessaan tallennuksen, vaikka se luki tyhjää; oikeassa käytössä tyhjä lukeminen tarkoittaa tyhjää muistia, joten haittaa ei ole.

## Koko testisarja

`sh appiappi/testit/aja.sh` ajettiin kokonaan commitilla `1ea569c` (koodi = Appi-appi 47): logiikka 76/76 ja selain 86/87 läpi, ei sivuvirheitä; ainoa virhe `selain_83_hae` (yllä). Kesto noin 25 min. Vain tietokoneen Chromiumissa, ei oikealla iPhonella eikä peliohjaimella.

## Lisätty jonoon

- **1o. Kartoitus 6:n korjaukset** (S1, S2, S3, S4, S7): Peliohjaimen *irti* → *irrotettu*; yleinen ilmoitus asetuksesta, joka poistaa nuolia (Taulukon lähde, Toistimen tapa, Ikkunan laji, Janan kulku); Liikkeen kääntyvyys, liukkaus, kiihtyminen ja jarrutus rekisteriin (jonon 23 d); kello, ajastin ja muutos herättävät kuvasilmukan ja näkymän vaihto laskee logiikan (jonon 15 f ja g); manuaalin varmuuskopioresepti; selaintestit paikalliselta palvelimelta, ei `file://`-osoitteesta (testi 83). Ei tallennusmuodon muutosta. Kummalle kaistalle tahansa, jonon alkuun.
- Jonon riveille 15, 15b, 15d ja 23 lyhyet *Kartoitus 6* -merkinnät (U1, U3–U6, U8, U9). Suunnitelmiin 18, 19 ja 20 korjattiin nimet ja avaimet (U1, U2, U9).
- ⏸ Emilin päätös: laskusulut kaavaan (U4, jonon 15 a).

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri alkaa 1o:sta), ennen uuden toimintoryhmän suunnittelua (esim. F25, F23 vienti tai 23 e:n ajoneuvofysiikka) tai pyynnöstä. Ennen ensimmäistä tallennusmuotoa muuttavaa 2D-, Joukko- tai ruudukkovaihetta kannattaa katsoa, että U1:n ja U2:n nimet pitivät. Ensi kerralla: nimien kokonaislista (kohdat ja ominaisuudet; tapahtumat tehtiin nyt).
