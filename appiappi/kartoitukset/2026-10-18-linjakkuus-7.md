# Linjakkuuskartoitus 7 (18.10.2026)

Vuorossa, koska kartoitus 6:n jälkeen jonosta on viety viisi kohtaa: Tee näkymään 12b (Appi-appi 48, kaista B), kartoitus 6:n korjaukset 1o (49, kaista A), viitelappu muokatessa 12c (50, B), kevennys 1p (51, A) ja suora kirjoitus palikkaan 12d (52, B). Lisäksi seuraavaksi alkaa uusi toimintoryhmä F41 (12f `@`-viite, 12g kaavan sulut ja jos, 15c–15e joukot tageina; [suunnitelma 25](../suunnitelmat/25-joukot-tageina-ja-kaava.md), Emil hyväksyi), joten se tarkistettiin [palikkasääntöjä](../PALIKKASAANNOT.md) ja nykyistä koodia vasten ennen rakentamista. Mittapuu: PALIKKASAANNOT ja [MISSIO](../MISSIO.md). Kartoitus tuottaa löydöksiä, ei koodia. **Mikään alla oleva ei ole toteutuslupa**, paitsi jonoon lisätty pieni kohta 1q, joka korjaa jo vietyä työtä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran `c126706` (Appi-appi 52). Viiden version `index.html`-muutokset luettiin kartoitus 6:n pohjasta `1ea569c` alkaen (noin 380 lisättyä riviä): `tnv*` (12b), `vlapHTML` (12c), `omBatch`, `rectNow`, `liikuta`, `esteet`, `cullOut`, `lelsPatch`, `growCtx` (1p), `tEdit*`, `refShow`/`refStore` (12d), 1o:n `aikaKay`, `repairL`/`lostToast` ja Liikkeen rekisteri.
- **Moottorilla Nodessa kokeiltiin:** kaikkien lajien kohtien ja ominaisuuksien nimet (kartoitus 6:n lupaama nimien kokonaislista), yleissanojen `käynnissä`, `rastitettuja`, `merkintöjä`, `tulos` tulkinta eri lajeilla (S1), Sekuntikellon `käynnissä` ennen käyntiä, käydessä ja pysäytettynä, JOS-palikan oletusviite.
- **Koodista suunnitelma 25:tä vasten:** palikan tunnisteet (`uid` → `p…`), tekstin ja kaavan tallennusmuoto (`TPLRE`, `kaavaToIds`, `kaavaTokens`, `parseExprT`), lajiavaimet (`K`), toimintojen lajit (`DOS`), kooste-sanat (`TAGG`), ominaisuussanat (`PROPS`), ketjun lukituskuva (`lkSnap`, `lkOk`), presettien tallennus (`Dt.presetit`), `n.jk` (Janan merkki).
- **Oikeat projektit** (`master-tiedot/appiappi/*.json`, vain luettu): varattuja viitteitä (`jos`, `muuten`, `niin`, `ja`, `tai`, `jäsen`) ei ole yhdessäkään; vanhoja `jos(`/`ja(`/`tai(`-kaavoja Autopelissä 23 ja Headmazessa 4. Rakennusskriptit `rakennus/autopeli.js` ja `headmaze.js` kirjoittavat vanhaa muotoa.
- **Manuaali:** luvut 3 (*Teksti ja upotetut viitteet*), 6 (*Tee näkymään*), 8 (Liikkeen uudet ominaisuudet), 2 (Asetukset), hakemisto ja luku 11. Muita lukuja ei luettu.
- **Testit:** koko sarja, ks. *Koko testisarja*.
- **Ei katsottu:** 12e (kaista A rakentaa nyt), käyttöpuoli puhelinleveydellä, oikea iPhone ja Safari, 1p:n mittaukset uudelleen (pysyvä `selain_91_keveys` ajettiin sarjassa).

## Yleiskuva

**Linja pitää.** Viisi vietyä kohtaa eivät tuoneet uutta erikoispalikkaa, uutta sääntökieltä eikä funktiota.

- **12b Tee näkymään** on oikea pikaluonti (A8): se tekee tavallisen Laatikon, viitteen `{#id}` ja tarvittaessa tavallisen nuolen, ja kaikki on avattavaa ja kumottavaa yhdellä ⌘Z:lla.
- **12c ja 12d** ovat näkymäpalikoiden yhteisiä (A5), eivät lajikohtaisia; nuolesta tuleva teksti ei avaudu kirjoitukseen vaan kertoo lähteen (A10). 12d valmisteli 12f:n (`refShow`/`refStore`).
- **1o** korjasi kartoitus 6:n S1–S4 ja S7 kokonaan; yleinen ”N nuolta poistui, Kumoa palauttaa” korvasi Janan erikoiskoodin (A11).
- **1p** on rakenteeltaan siisti: muisti on ajon mittainen (`omBatch`), eikä mitätöintiä tarvita, ja jokainen pikatie palaa hitaaseen reittiin, kun palikkaa ohjataan. Tämä on juuri se kohta, johon joukkojen ohjaus osuu (U6).

Löydöksiä viedyssä työssä on kaksi pientä (S1, S2). Suunnitelma 25 on linjassa periaatteiltaan, mutta siitä puuttuu muutama tekninen sopimus, jotka törmäävät nykyiseen koodiin (U1–U5). Ne on kirjattu jonon riveille ja suunnitelmaan, jotta rakentaja ei keksi niitä lennossa.

## Löydökset: viety työ (48–52) ja vanhempi koodi

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus tai hiljainen väärä tulos, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| S1 | keski | A10, missio (sama sana, sama merkitys) | **Yleissanat antavat hiljaa väärän arvon.** Kun palikalla ei ole ominaisuutta, kaava kokeilee yleissanaa (`PROPS`): `käynnissä`, `rastitettuja` ja `merkintöjä` → kohta `v`, `tulos` → kohta `t`. Kohta `v` on lähes jokaisen palikan arvo, joten kokeiltu moottorilla: `uni.käynnissä` = 7 (Säätimen arvo), `paino.rastitettuja` = 80, `liike.käynnissä` = x, `taulu.käynnissä` = rivejä, `muutos.tulos` = edistyminen. **Sekuntikello:** `kello.käynnissä` = kulunut aika, eli 5 s käynnin ja pysäytyksen jälkeen `kello.käynnissä` = 5 (tosi), vaikka kello on pysähdyksissä; kaikilla muilla aikapalikoilla (Muutos, Ketju, Jana, Ajastin) `käynnissä` on kyllä/ei. Virhettä ei tule. Vanha (ennen 48:aa), mutta osuu suoraan 15c:hen, jossa `#x.<ominaisuus>.<kooste>` ja `jäsen.<ominaisuus>` luetaan sekalaisilta lajeilta. | Yleissana kelpaa vain, kun palikan kohta oikeasti on sen niminen; muuten tavallinen virhe *tuntematon ominaisuus*. Sekuntikellon `käy` saa rinnakkaisnimen `käynnissä`. **Jonoon 1q.** |
| S2 | pieni | A10 | **Kupla sanoo ”kaavasta”, vaikka teksti tulee nuolesta.** 12d:n kupla on aina *Teksti tulee kaavasta: Nimi*, myös kun nuoli tulee Säätimestä tai Tekstikentästä; vihje ja 12c:n lappu (*⇐ Nimi*) sanovat oikein ”nuolesta”. | Kuplaan *Teksti tulee nuolesta: Nimi ›* (manuaalin luku 3 samoin). **Jonoon 1q** (teksti). |
| S3 | pieni | A5 | **Suora kirjoitus puuttuu otsikollisista esityksistä:** Monitori, Kaavio ja Kalenteri näyttävät otsikon (`tx`), mutta eivät avaudu kaksoisnapsautuksella (`TEDK`). Muut otsikolliset avautuvat. | Ei jonoon; kun 14b (napautettava näkymäpalikka) tehdään, sama rakentaja voi lisätä ne `TEDK`:hon. |
| S4 | pieni | A11 | **Tee näkymään -valikon vaihtoehdot riippuvat hetken arvosta:** Monitori tarjotaan vain, kun arvo on juuri nyt luku, Ilmoitus vain, kun kyllä/ei. Tyhjä Arvo tai virheellinen kaava ei tarjoa niitä. Manuaali kertoo tämän. | Ei jonoon. |
| S5 | pieni | keveys | **12d laskee ja piirtää koko näkymän ja logiikan joka näppäimellä** (`tEditInput` → `tick`, `renderStage`). Tallennus on viivästetty, joten se ei ole ongelma; muokkaustila piirtää yhä kaiken (1p jätti sen). Ei mitattu. | Ei jonoon. Jos kirjoitus tuntuu isossa projektissa nykivältä, piirto vain kirjoitettavalle palikalle. |

Nimien kokonaislista (kartoitus 6 lupasi): kohtien ja ominaisuuksien nimet ajettiin kaikista 62 lajista. S1:n lisäksi ei uutta: Satunnaisluvun `min`/`max` ymmärtää myös `pienin`/`suurin`; Peliohjaimen *irrotettu* on nyt Painikkeen pari; Tatin *loppuu* on sovitusti eri asia (veto); Alueen `montako` ja ikkunan `jäseniä` laskevat eri asiaa (liikkujat alueella / palikat ikkunassa), joten eri sanat ovat perusteltuja.

## Löydökset: suunnitelma 25 ja nykyinen koodi

| # | Vakavuus | Sääntö | Koskee | Löydös | Ehdotus (kirjattu) |
|---|---|---|---|---|---|
| U1 | iso | A9, A13 | 15c | **Joukkoviitteen tallennusmuotoa ei ole sovittu.** Suunnitelma sanoo, että jäsen tallentaa joukon tunnisteen, mutta ei sitä, miten tekstin `#unipisteet.summa`, kaavan `#x`, Toiminnon kohde `#kolikot` ja Joukko-palikan kentät tallentuvat. Palikkaviite on `{#id}` (`TPLRE`, `kaavaTokens`), joten `{#j3}` tulkittaisiin poistetuksi palikaksi: `toNames` näyttäisi tyhjää, `refsIn`, viitelappu, poiston vaikutuslista ja `heal` käsittelisivät sitä palikkana. | Oma merkki: **`{%id}` ja `{%id.kooste}`** tekstissä ja kaavassa, Toiminnon kohteessa sama tunniste. Joukon poisto näyttää vaikutuslistan kuten palikan poisto (A9). Suunnitelmaan 25 ja jonon 15c riville. |
| U2 | iso | A13 | 15c, 15d | **Kolme ehdotettua avainta on jo käytössä.** Suunnitelma 21 nimeää uuden palikan lajiksi **`joukko`**, joka on jo **Rivijoukko** (`K.joukko`). `b.jk` on vapaa palikalla, mutta `jk` on jo solmun kenttä (Janan merkin kohta `n.jk`, kopio- ja liitoskoodi käsittelee sitä). | Laji **`pjoukko`**, palikan tagit **`b.jkt`**, rekisteri **`P.jkr`** (tarkistettu vapaiksi `c126706`:ssa). Rakentaja tarkistaa uudelleen ennen vientiä. Korjattu suunnitelmiin 21 ja 25 sekä jonon riveille. |
| U3 | keski | A11, sisäinen ristiriita | 15c | **Tunnus-kentän sääntö kumoaa itsensä.** Kohta 3.1: muu kuin `@`- tai `#`-sana on virhe, mutta `{ }`-tavalla kenttä näyttää viitteen ilman merkkiä (`uni #unipisteet`); sama teksti takaisin annettuna olisi virhe. Lisäksi nykyinen tapa kirjoittaa kenttään pelkkä viite lakkaisi toimimasta. | **Yksi paljas sana tai `@sana` = viite** kaikilla tavoilla; näyttö valitun tavan mukaan. Virhe vain, jos viitteitä on kaksi tai teksti ei ole sanoja. Suunnitelmaan 25. |
| U4 | keski | A13 (vanha muoto aukeaa) | 12g | **Ensimmäinen todellinen versionvaihto (`VER` 8 → 9) pysäyttää lukitut ketjut.** Lukituskuva tallentaa `ver:VER` ja kopion palikoista (`lkSnap`); `lkOk` hylkää eri version kuvan, joten käynnissä oleva lukittu ketju pysähtyy virheeseen *Lukituskuva … vanhasta versiosta*. Kuvan kopio sisältää myös vanhat `jos(;;)`-kaavat. Samoin **presetit** (`Dt.presetit`, F26) ovat projektien ulkopuolella, eikä `repair` muunna niiden kaavoja. Kaavoja on Kaavan `f`:n lisäksi Toiminnon kentissä (`b.kv`). | 12g:n `repair` muuntaa kaavat projektin palikoissa (`f`, `kv`), lukituskuvissa ja preseteissä ja nostaa kuvan version, jotta lukittu ketju jatkaa. Testi: lukittu ketju vanhalla versiolla jatkaa. Jonon 12g riville. |
| U5 | keski | A9, missio | 12g | **JOS-palikan oletusviite on `jos`** (toinen `jos2`). Kun `jos` varataan, jokainen uusi JOS-palikka ja vanhoissa projekteissa ensimmäinen JOS saa uuden viitteen. Emilin tallennetuissa projekteissa ei ole yhtään varattua viitettä (tarkistettu), mutta selaimen omissa voi olla. Lisäksi sanat menevät ristiin: kaavan `jos (ehto) a muuten b` on **VALITSE-palikan** asia (arvo), kun taas **JOS-palikka** antaa *pätee*-arvon ja *NIIN*-tapahtuman (hetki); kaavan `niin` ei ole tapahtuma. | Varattu sana ei kelpaa oletusviitteeksi (`uniqueVt` ohittaa sen; JOS saa esim. `ehto`). Manuaalin luku 6 sanoo suoraan: kaavan `jos` = VALITSE-palikka kaavana. Avoimeen kortin kysymykseen (VALITSE → JOS-arvo) suositus pysyy: **pidä VALITSE**, koska JOS-nimi olisi nyt kolmessa merkityksessä. Vanhan muodon tunnistus `;`-merkistä, ei sulun paikasta: testissä on jo `Jos (uni < 7; 2,5; 0)`. Jonon 12g riville. |
| U6 | keski | A3, keveys (1p) | 15d | **1p:n pikatiet ohittaisivat joukon ohjauksen.** `rectNow`, kuvan `rect`, `fysKim` ja käytön `cullOut` lukevat palikan omat luvut suoraan, jos palikalla itsellään ei ole ohjausta (`omActiveAny`, `linked(id,'dx'/'dy')`). Suunnitelma 25 tuo kaksi uutta ohjausta, jotka eivät näy palikassa itsessään: nuoli Joukon kohtaan (siirto x/y kaikille) ja joukon sääntö (`x = …`). Silloin jäsen piirtyisi ja törmäisi vanhaan paikkaan, ja ruudun ulkopuolinen jäsen jäisi piirtämättä. Suunnitelma 21:n keveysosio sanoo periaatteen, mutta ei paikkoja. | Yksi moottorin apu ”ohjaako jokin tätä palikkaa” (oma ohjaus, joukon sääntö, nuoli Joukon kohtaan), jota kaikki neljä pikatietä kysyvät. Testi: 30 liikkuvaa jäsentä, joiden siirtoa ohjataan Joukosta. Jonon 15d riville. |
| U7 | keski | A6, A13 | 15c | **”Lisää joukkoon / Poista joukosta” ei ole olemassa olevia toimintoja.** *Lisää* (`lisaa`) on lukujen lisäys (Emilin päätös 16.10.: puuttuva alkaa nollasta), eikä yleistä *Poista*-toimintoa ole: avain `poista` on *Poista valinta* (Valintaruutu). Listan lisäys Lisää-toiminnolla olisi sille uusi merkitys. | Kaksi uutta toimintoa omilla avaimilla (`joukkoon`, `joukosta`), kohde palikka tai `tapahtuma.jäsen`, parametrina joukko. Suunnitelmaan 25 ja jonon 15c riville. |
| U8 | pieni | A9, keveys | 15c | **Tagin kohta *kuuluu #x kun*:** kohta syntyy tagista, joten sen avain pitää johtaa joukon tunnisteesta (`jk_<id>`), ei nimestä, jotta joukon uudelleennimeäminen ei poista nuolia. Kohdat lasketaan palikan kentistä; 1p muistaa ne lukitussa käytössä koko silmukan ajan, joten tagit (`b.jkt`) eivät saa muuttua käytössä. Käytön jäsenyysmuutokset (toiminnot, ehdot) kuuluvat käyttötietoon (`P.st`). | Jonon 15c riville. |
| U9 | pieni | A8, missio | 15c, 15d | **Sanat:** (a) taulukon koosteissa on myös `täydellinen` (`TAGG`), suunnitelmasta se puuttuu; sama sanalista kuin sarakkeilla. (b) `.arvot` on uusi ja vain joukoilla; jos se osoittautuu hyväksi, sama sarakkeille myöhemmin. (c) `jäsen` varataan 15d:ssä kuten 12g:n sanat. (d) Suunnitelma 21:n esimerkki `näkyy = ei jäsen.kerätty` olettaa kieltosanan, jota kaavassa ei ole (`ei` on arvo); oikein `jäsen.kerätty = ei`. (e) Joukko-palikan nimi **on** joukon nimi (yksi lähde, nimen vaihto vaihtaa kummankin); Joukko-palikalla ei ole omaa `@`-viitettä, kaavassa aina `#nimi`. | Suunnitelmiin 21 ja 25. |
| U10 | pieni | dokumentit | 12f, 12g, 15c | (a) Kohta 3.1 sanoo, että 12c:n lappu näyttää *tunnuksen*; lappu näyttää tekstin **lähteet** (upotetut viitteet tai nuolen), ei palikan omaa tunnusta. Tarkoitettu: lappu näyttää viitteet valitulla tavalla (`@uni`) ja joukot (`#unipisteet.summa`). (b) 12d:n `refShow`/`refStore` on käytössä vain suorassa kirjoituksessa; muut 21 `KK.toNames`- ja 7 `KK.toIds`-kutsua (paneeli, Miksi?, ketjun askeleet, ＋ Viittaus) kulkevat yhä suoraan. 12d:n Enter-sääntö (ehdotus otetaan, jos `{` on auki) ja ohje *{ tuo viitteen* ovat `{`-kohtaisia. (c) A7:n teksti päivitetään 12g:ssä; 15c lisää siihen joukkojen koosteet ominaisuuksina (kuten sarakkeilla). | Suunnitelmaan 25 ja jonon 12f riville. |

Muuten suunnitelma 25 on linjassa: `@` ja `#` erottuvat (A9), koosteet ovat ominaisuuksia samoilla sanoilla kuin sarakkeilla eikä funktioita (A7, A8), jäsenyyden kaava on tila ja toiminto hetki (A6), Joukko-palikka ei ole erikoispalikka. Kaava kapenee: funktiot poistuvat, ja `ja`/`tai`/`jos` ovat sanoja. Kehävirhe joukon koosteen ja jäsenyyden välillä on huomioitu.

## Kartoitus 6:n pyynnöt nyt

| # | Tila |
|---|---|
| S1–S4, S7 (1o) | **Korjattu** (49). |
| S5, S6, S8 | Ennallaan, kuten sovittiin. |
| U1 (`ruutux`/`ruutuy`), U2 (avaimet) | Suunnitelmissa 19 ja 20 ennallaan; ei rakennettu vielä. Ennen 15b:tä ja 2D-vaiheita B–C rakentaja tarkistaa avaimet uudelleen. |
| U4 (laskusulut) | Emil hyväksyi (12g). |
| Kaistat | 48–52 merkitsivät kaistan, versio- ja testinumerot ovat yksilöllisiä (`selain_88`–`92`, `logiikka_77`–`78`), eikä jonorivejä kadonnut. |

## Erikoispalikoiden rekisteri

Ei uusia rivejä. Uudet toiminnot (12b, 12d) ovat pikaluonteja ja muokkaustapoja, eivät palikoita. Joukko-palikka (15d) ei ole erikoispalikka.

## Koko testisarja

`sh appiappi/testit/aja.sh` commitilla `c126706` (koodi = Appi-appi 52): logiikka 78/78 läpi. Selaintestit ajossa tätä kirjoitettaessa; tulos päivitetään tähän. Vain tietokoneen Chromiumissa, ei oikealla iPhonella.

## Lisätty jonoon

- **1q. Kartoitus 7:n korjaukset** (S1, S2): yleissanat vain oikealle kohdalle, Sekuntikellon `käynnissä`, kuplan teksti. Ei tallennusmuotoa. Ennen 15c:tä, kummalle kaistalle tahansa; sopii toiselle kaistalle 12g:n aikana (eri funktiot: `prop`, ei jäsennin).
- Jonon riveille 12f, 12g, 15c ja 15d lyhyet *Kartoitus 7* -merkinnät (U1–U10). Suunnitelmiin 21 ja 25 kohta *Kartoitus 7*.

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri alkaa 12e:stä), ennen uuden toimintoryhmän suunnittelua tai pyynnöstä. Kun 15c on viety, kannattaa katsoa, että joukkoviitteiden tallennus (U1) kesti uudelleennimeämisen, poiston ja Kumoa-askeleen, ja että 1p:n pikatiet (U6) tunnistavat joukon ohjauksen ennen 2D-vaiheita.
