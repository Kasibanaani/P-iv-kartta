# Linjakkuuskartoitus 8 (18.10.2026)

Vuorossa, koska kartoitus 7:n jälkeen jonosta on viety viisi kohtaa: muut pikaluonnit 12e (Appi-appi 53, kaista A), viite `@`:lla 12f (54, B), kaavan sulut ja jos 12g (55, A, tallennusversio 9), tekstille tilaa 13 (56, B) ja joukot tageina 15c (57, A, tallennusversio 10). Seuraavaksi tulevat Joukko-palikka 15d ja jäsenten tapahtumat 15e, joten niiden suunnitelmat (21 ja 25) tarkistettiin toteutunutta 15c:tä vasten. Mittapuu: [PALIKKASAANNOT](../PALIKKASAANNOT.md) ja [MISSIO](../MISSIO.md). Kartoitus tuottaa löydöksiä, ei koodia. **Mikään alla oleva ei ole toteutuslupa**, paitsi jonoon lisätty pieni kohta 1r, joka korjaa jo vietyä työtä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran `68e0c21` (Appi-appi 57). Viiden version muutokset `index.html`:ssä kartoitus 7:n pohjasta `c126706` alkaen (noin 800 riviä): 12e `TNV_X`/`tnvMake`, 12f `prefNames`/`prefIds`/`refShow`, 12g `KRES`/`parseExprT`/`kaavaVanha`, 13 (CSS), 15c kokonaan (`repairJk`, `jk*`, `tunnus*`, `jkJasenet`, `jkProp`, `jkOf`, `runAction`in joukkohaara, `jkSugItems`, `jkPalAct`, Toiminnon Kohde-valikko).
- **Moottorilla Nodessa kokeiltiin:** sekajoukko (Arvo, Säädin, Sekuntikello, Muoto): `#x`, `.summa`, `.arvot`, `.jäsenet`, `#x.x.summa`, `#x.käynnissä.summa`, `#x.summa.summa`; tyhjä Tunnus; joukon nimi sama kuin viite; Toiminto *Lisää* kohteena `#x` ja *Poista joukosta*; *kuuluu kun* -nuoli virheellisellä ehdolla ja kehällä, ja `joukot`-ominaisuus silloin; JOS-palikan oletusviitteet; varatut sanat Tunnuksessa (`@jäsen`, `@joukot`, `#jos`).
- **Avainten vapaus:** 15c:n uudet kentät `jkr`, `jkt`, `jkk`, `oj`, `jo` eivät olleet käytössä Appi-appi 53:ssa (A13). Ehdotetut 15d/15e-avaimet (`otj`, `jex`) ovat vapaita nyt.
- **Oikeat projektit** (`master-tiedot/appiappi/*.json`, vain luettu): viitettä `jäsen` tai `joukot` ei ole missään; Rivijoukkoja kaksi (koeappi C *Näkyvät*, koeappi B *Historia*), kummallakaan ei oletusnimeä *Joukko*.
- **Suunnitelmat:** 25 kokonaan, 21 kohdat 3–6, TILA:n avoimet kysymykset 15c:stä.
- **Manuaali:** luvut 7 (*Palikoiden joukot*), 5 (Lisää joukkoon / Poista joukosta), 2 (Tunnus), 6 (kaava, `jos` = VALITSE kaavana), hakemisto ja luku 11 haettiin sanoilla; muita lukuja ei luettu.
- **Testit:** koko sarja, ks. *Koko testisarja*.
- **Appi-appi 58 (1q, kaista B, valmistui kartoituksen aikana `96814e9`):** muutos luettiin (9 riviä) ja sekajoukko ajettiin sen moottorilla uudelleen.
- **Ei katsottu:** puhelinleveys, oikea iPhone ja Safari, 1p:n mittaukset uudelleen (pysyvä `selain_91_keveys` ajettiin sarjassa).

## Yleiskuva

**Linja pitää.** Viisi kohtaa eivät tuoneet erikoispalikkaa eivätkä funktioita; kaava kapeni (ei funktioita, sanat `jos`, `ja`, `tai`).

- **15c on linjassa suunnitelman 25 kanssa** ja noudattaa kaikkia kartoitus 7:n teknisiä sopimuksia: `{%id}`, `jkr`/`jkt`, paljas sana Tunnuksessa on viite, `joukkoon`/`joukosta` omina avaimina, `jk_<id>`, tagit eivät muutu lukitussa käytössä, `täydellinen` ja `.arvot` mukana. Nimen vaihto, poisto (`#⚠nimi`) ja Kumoa kestävät (testit `logiikka_81`, `selain_97` kohta 9). Lukituskuva nousee versiosta 9 versioon 10 ja jatkaa (12g:n opetus kantoi).
- **12f, 12g ja 13** ovat linjassa: `refShow`/`refStore` kaikkialla (K7 U10 b), lukituskuvat ja presetit muuntuvat (K7 U4), manuaali sanoo, että kaavan `jos` on VALITSE kaavana (K7 U5).
- **12e** tekee tavallisia palikoita ja nuolia, ⌘Z kumoaa (A8).

Viedyssä työssä on yksi keskitason löydös (S1, `joukot` nielee virheen) ja kolme pientä. Isompi asia on edessä: **15d:n jäsenyyden etusija ja sekajoukon säännöt** eivät ole sovittuja, ja suunnitelma 21 laskisi Joukon tapahtumat hetken jäsenistä, mikä poistaisi nuolia (U1–U3). Sanat menevät ristiin vain oletusnimessä: Rivijoukko on paletissa nimellä *Joukko* (W1), ja 15d tuo saman nimen toiselle palikalle.

## Löydökset: viety työ (53–57)

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus tai hiljainen väärä tulos, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| S1 | keski | A10 | **`joukot`-ominaisuus nielee joukon virheen hiljaa.** `jkOf` jättää virheessä olevan joukon pois ja nostaa virheen vain, jos teksti alkaa ”kehä”. *kuuluu kun* -virheet alkavat kuitenkin ”kuuluu #x kun (…)”, joten kehäkin nielaistaan. Kokeiltu: A:n *kuuluu #x kun* -ehto viittaa puuttuvaan palikkaan → `#x` = virhe, mutta B:n (tagi `#x #y`) `b.joukot` = ”y” ilman virhettä; kehällä sama. | Kun palikka on joukon ehdokas (tagi tai *Lisää joukkoon*) ja joukon jäsenyys on virheessä, `joukot` on virhe, joka nimeää joukon. Testi: virheellinen ehto ja kehä. **Jonoon 1r.** |
| S2 | pieni | A13, repo | **Appi-appi 57 vei 16 testikuvaa (1,7 Mt) julkiseen repoon** `appiappi/testit/` (`appiappi16_*`, `versio52_*`, `versio5_*`). `selain_09`, `_11` ja `_57` tallentavat kuvat nykyiseen kansioon; `aja.sh` ajaa ne `tulosteet/`-kansiossa (ignoroitu), mutta yksittäin `testit/`-kansiossa ajettuina kuvat jäävät sinne ja tulevat commitiin. | Kuvat pois (`git rm`) ja `testit/.gitignore`:en `*.png`. **Jonoon 1r.** |
| S3 | pieni | A9 | **JOS-palikan oletusviitteet `jos_2`, sitten `jos2`** (kokeiltu). Ensimmäinen näyttää toiselta, ja numerointi vaihtaa tapaa. | Varatulle pohjalle johdonmukaisesti `jos_1`, `jos_2`, … (vanhat viitteet ennallaan). **Jonoon 1r.** |
| S4 | pieni | A8, A10 | **`#x.`-ehdotukset tarjoavat minkä tahansa jäsenen ominaisuudet** (`jkSugItems` kokoaa kaikkien jäsenten ominaisuudet). Sekajoukossa (Arvo + Muoto) `x.` tarjotaan, mutta `#x.x.summa` on virhe, koska Arvolla ei ole x:ää (päätös 5: puuttuva ominaisuus on virhe). | Ehdotetaan vain kaikkien jäsenten yhteiset ominaisuudet, tai muut merkinnällä *vain osalla jäsenistä*. **Jonoon 1r.** |
| S5 | pieni | A3 | **12e:n Muisti → kenttä on yksisuuntainen:** kenttä asettaa Muistin, mutta ei päivity, kun Muisti muuttuu muualta (Palauta, toinen Toiminto). Pikaluonti näyttää kaksisuuntaiselta. Jo TILA:n avoimissa kysymyksissä. | Ei jonoon. Kun 14b (napautettava näkymäpalikka) tai seuraava F38-kohta tehdään, harkitaan kentälle tapaa ”arvo nuolesta, käyttäjä voi muuttaa” (yksi jatkuva ohjaus, A3), jota pikaluonti käyttäisi. |

**Ei uusi, korjattu:** `#x.käynnissä.summa` = 10 sekajoukossa (Arvon, Säätimen ja Muodon arvot) oli kartoitus 7:n S1. Appi-appi 58 (1q) korjasi sen: nyt tulos on virhe *jäsenellä ”A” on virhe: tuntematon ominaisuus .käynnissä*. Oikein, mutta se tekee U2:sta 15d:lle entistä tärkeämmän. TILA:n rivi ”`#x.käynnissä.summa` laskee vain käyviä” pitää paikkansa, kun kaikilla jäsenillä on `käynnissä`; sekajoukossa tulos on tämä virhe.

## Löydökset: 15d ja 15e toteutuneen 15c:n jälkeen

| # | Vakavuus | Sääntö | Koskee | Löydös | Ehdotus (kirjattu jonon riveille ja suunnitelman 25 kohtaan 8) |
|---|---|---|---|---|---|
| U1 | iso | A3 | 15d | **Jäsenyyden etusijaa ei ole sovittu, kun Joukko-palikka tulee.** 15c:ssä: *kuuluu kun* -nuoli > *Lisää/Poista joukosta* (käyttötieto) > tagi. 15d lisää kaavakentät *Ota mukaan* ja *Vain jos* sekä pois suljetut. A3 sanatarkasti (kaava > toiminto) tekisi *Ota mukaan* -säännöstä toimintoa vahvemman, jolloin suunnitelman 25 oma esimerkki ”vihollinen osuu → Poista joukosta `#elossa`” ei toimisi, jos `#elossa` on sääntöjoukko. | Järjestys: **Vain jos** (rajaa kaikkia) > jäsenen oma **kuuluu kun** -nuoli > **Lisää/Poista joukosta** (käyttötieto) > **perusjäsenyys** = tagi ∪ *Ota mukaan* − pois suljetut. *Ota mukaan* kertoo, keistä joukko koostuu, kuten tagi; siksi se on perusarvo, vaikka se on kaava. *Palauta perusarvo* palaa perusjäsenyyteen. Miksi? kertoo tason. |
| U2 | keski | A8, A10 | 15d | **Sekajoukon jäsenkohtaiset ehdot kaatuisivat kokonaan.** 15c: yhden jäsenen virheellinen *kuuluu kun* tekee koko joukosta virheen (kaikki koosteet, `#x`, Toiminto `#x`), ja jäsen ilman ominaisuutta tekee koosteesta virheen (päätös 5). Kun 15d:n *Vain jos* `jäsen.y < 600` lasketaan joukossa, jossa on Arvo, Arvon `jäsen.y` on virhe → koko joukko virheessä. | Ehdossa (*Ota mukaan*, *Vain jos*) jäsen, jolta puuttuu luettu ominaisuus, **ei päde**, kuten Rivijoukon *ehto riveittäin* (”puuttuva ei päde”), ja Miksi? kertoo sen. Muut virheet (kehä, katkennut viite) pysyvät joukon virheinä. *Säännöt jäsenille*: jäsen, jolla ei ole ohjattavaa ominaisuutta, ohitetaan, kuten 15c:n Toiminto ja suunnitelma 21 kohta 6.1. |
| U3 | keski | A9, A11 | 15d, 15e | **Joukon kohdat ja tapahtumat eivät saa riippua hetken jäsenistä.** Suunnitelma 21 kohta 6.3: tapahtumat, ”jotka jokaisella jäsenlajilla on”. Tagijoukko vaihtuu käytössä (Lisää/Poista, *kuuluu kun*) ja voi olla alussa tyhjä, joten jäsenistä lasketut kohdat katoaisivat ja veisivät nuolet mukanaan (sama ongelma kuin kartoitus 6:n ”asetus poistaa nuolia hiljaa”). | Kiinteä lista: 15d näkymäpalikan yhteiset kohdat (näkyy kun, harmaana kun, vaihtoväri kun, siirto x/y), 15e näkymäpalikoiden yhteiset tapahtumat (*jäsen napautettu* ym.) ja paneelin valinta *Jäsenten laji* lajikohtaisille (esim. Liike → *jäsen törmäsi*). Jäsen, jolla kohtaa tai tapahtumaa ei ole, ohitetaan. |
| U4 | keski | A13 | 15d, 15e | **Avaimet:** pois suljetuille ei käy `pois` (`P.pois` on poistettujen palikoiden rekisteri). 15e:n Toiminnon kohde `tapahtuma.jäsen` ei voi olla `b.o`:ssa, koska `b.o` on aina palikan tunniste ja `repairRef` poistaa tuntemattoman. | Pois suljetut Joukko-palikan kentässä esim. **`b.jex`**; 15e:n kohde erillisenä kenttänä kuten `b.oj`, esim. **`b.otj:1`** (Kohde-valikossa oma rivi *Tapahtuman jäsen*). Molemmat vapaita `68e0c21`:ssä; rakentaja tarkistaa uudelleen ennen vientiä. |
| U5 | pieni | A9, A11 | 15d | **Joukko-palikan ja joukon elinkaari sopimatta.** Mitä tapahtuu, kun palikka poistetaan tai joukko poistetaan paletista, ja voiko Joukko-palikka kuulua toiseen joukkoon? | Palikan poisto poistaa vain sen säännöt (Ota mukaan, Vain jos, säännöt, pois suljetut) vaikutuslistalla; joukko ja tagit jäävät (joukko ei vaadi palikkaa). Joukon poisto paletista poistaa myös Joukko-palikan, ja vaikutuslista kertoo sen. Nimen vaihto kummasta tahansa vaihtaa molemmat (`jkNimea`). Joukko-palikalla ei tageja eikä `joukot`-ominaisuutta (kuten Ryhmällä), joten joukkojen joukkoja ei synny. `jäsen` joukon kenttien ulkopuolella: selkeä virhe *jäsen on käytössä vain joukon säännöissä*. |
| U6 | pieni | dokumentit | 15d | **Suunnitelma 21 kuvaa yhä vanhaa käsin valintaa:** kohta 3 (pudotus Joukon päälle, ruksilista, ”viite esim. `kolikot`”), kohta 6.1 ja kohdan 6 loppu (”jäsenyys tallentuu Joukkoon, ei jäseniin”). Jonon 15d ohjaa lukemaan suunnitelman 21 kohdat 3–5, joten rakentaja voi rakentaa toteutuneen 15c:n ohi. | Suunnitelman 21 alkuun merkintä, että käsin valinta on tagi (15c, Appi-appi 57), eikä Joukko-palikalla ole omaa viitettä. Tehty tässä kartoituksessa (vain teksti). |
| U7 | – | missio | 15d | **1q ennen 15d:tä:** `jäsen.käynnissä` säännössä olisi antanut hiljaa väärän arvon. | **Ratkesi:** 1q vietiin kartoituksen aikana (Appi-appi 58). |

Muuten 15d ja 15e ovat linjassa: Joukko-palikka ei ole erikoispalikka (arvo = jäsenmäärä), sääntö on tila ja toiminto hetki (A6), U6:n pikatiet (kartoitus 7) ovat jo jonon 15d rivillä.

## Sanat: menevätkö ristiin?

| # | Vakavuus | Löydös | Ehdotus |
|---|---|---|---|
| W1 | keski | ***Joukko* on nyt kolmessa paikassa:** (a) Rivijoukko, paletissa oletusnimi *Joukko* ja viite `joukko`; (b) palikoiden joukko `#nimi`; (c) 15d tuo paletin Tieto-ryhmään Joukko-palikan Rivijoukon viereen, jolloin paletissa olisi kaksi sirua nimeltä *Joukko*. Merkitys on sinänsä sama (valittu osajoukko: rivien tai palikoiden), ja rinnakkaisuus on hyödyllistä: Rivijoukon *ehto riveittäin* ↔ Joukon *Vain jos*, *Toista riveille* ↔ *Toista jäsenille*, samat koosteet `.summa`. Ristiin menee vain Rivijoukon oletusnimi ja viite. Kaavassa `#` erottaa ne (`joukko.rivejä` vs. `#joukko`), puheessa ja paletissa ei. | Rivijoukon oletusnimeksi **Suodatus** (viite `suodatus`; A1: nimi kertoo tekemisen). Laji pysyy *Rivijoukko*, vanhat palikat ennallaan, ei tallennusmuotoa. `Rivit` hylätty, koska *rivit* on jo kohdan nimi. Emilin projektien Rivijoukoilla on omat nimet. Manuaali: luku 7 (rivit 16, 270, 285–289, 491), luku 11 (rivi 86, raja poistuu). **Jonoon 1r, ennen 15d:tä.** |
| W2 | – | **`jäsen`, `jäseniä`:** ikkunan `jäseniä` (palikat ikkunassa) ja `#x.jäseniä` tarkoittavat samaa (montako jäsentä). Rivejä ei kutsuta jäseniksi. `jäsen` on vapaa Emilin projekteissa. | Ei muutosta. 15d varaa `jäsen`:n. |
| W3 | – | **Lisää-toiminnot:** *Lisää* (luvut), *Lisää riviksi listaan*, *Lisää rivi* ja *Lisää joukkoon* alkavat samalla sanalla, mutta niillä on omat avaimet ja selkeä kohde. | Ei muutosta. |

## Kartoitus 7:n pyynnöt nyt

| # | Tila |
|---|---|
| S1, S2 (1q) | **Tehty** (58, kartoituksen aikana). |
| U1 `{%id}`, U2 avaimet, U3 Tunnus, U7 toiminnot, U8 `jk_<id>` | **Tehty** (57). |
| U4 lukituskuva ja presetit | **Tehty** (55), ja 57 nosti kuvan versioon 10 samoin. |
| U5 varattu oletusviite, VALITSE manuaalissa | **Tehty** (55); numerointi epäjohdonmukainen (S3). |
| U6 pikatiet | Ennallaan 15d:n rivillä. |
| U9 a `täydellinen`, b `.arvot` | **Tehty**. c (`jäsen` varattu) ja e (Joukko-palikan nimi) 15d:ssä. |
| U10 | **Tehty**: viitelappu näyttää joukot, `refShow` kaikkialla, A7 päivitetty. |
| Kaistat | 53–57 merkitsivät kaistan; versio- ja testinumerot yksilöllisiä (`logiikka_79`–`81`, `selain_93`–`97`); jonorivejä ei kadonnut. |

## Erikoispalikoiden rekisteri

Ei uusia rivejä. Joukko `#nimi` ei ole palikka, ja tuleva Joukko-palikka ei ole erikoispalikka.

## Koko testisarja

`sh appiappi/testit/aja.sh` commitilla `68e0c21` (Appi-appi 57): **kaikki 178 läpi** (logiikka 81/81, selain 97/97), ei sivuvirheitä. Appi-appi 58:n omaa testiä (`logiikka_82`) ei ajettu tässä sarjassa, vaan logiikkatestit ajettiin uudelleen 58:n päälle rebasen jälkeen: 82/82 läpi. Vain tietokoneen Chromiumissa, ei oikealla iPhonella.

## Lisätty jonoon

- **1r. Kartoitus 8:n korjaukset** (S1–S4, W1): `joukot` ei niele virhettä, testikuvat pois reposta, JOS-oletusviitteet `jos_1`, `jos_2`, `#x.`-ehdotukset vain yhteisistä, Rivijoukon oletusnimi *Suodatus*. Ei tallennusmuotoa. **Ennen 15d:tä**, koska S1 ja S4 koskevat samaa joukkokoodia, jota 15d laajentaa, ja W1 paletin nimeä, johon 15d tuo Joukon.
- Jonon riveille 15d ja 15e *Kartoitus 8* -merkinnät (U1–U5). Suunnitelmaan 25 kohta 8 ja suunnitelman 21 alkuun merkintä (U6).

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri 0/5; 58 katsottiin tässä, joten laskuri alkaa sitä seuraavasta), ennen uuden toimintoryhmän suunnittelua (2D-vaiheet) tai pyynnöstä. Kun 15d on viety, katso, että etusija (U1) näkyy Miksi?:ssä, että sekajoukko ei kaadu (U2) ja että 1p:n pikatiet tunnistavat joukon ohjauksen (kartoitus 7 U6).
