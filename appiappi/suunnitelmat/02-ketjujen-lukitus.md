# Ketjujen kolme lukitustilaa

16.10.2026. **Käyttäjän päätökset D05, D07, D09 ja D10.** Numeroiden ja viitteiden ratkaisut alla on tehty Emilin delegoimalla harkinnalla. Tämä dokumentti määrittelee tulevan ominaisuuden, ei väitä sitä toteutetuksi. [Hakemisto](../SUUNNITELMA.md).

## 1. Käyttäjän tarkoitus

Ketjun tuleviin vaiheisiin pitää voida vaikuttaa kesken suorituksen, esimerkiksi toisen toiminnon tai käyttäjän syötteen kautta. Haluttaessa ketju suojataan ulkopuolisilta muutoksilta tai sekä ulkoisilta että omilta muutoksilta. Tämä on Ketju-ikkunan ominaisuus, ei kolme rinnakkaista ketjulajia eikä pelikohtainen toimintatapa.

## 2. Julkinen ominaisuus ja kolme arvoa

| Numero | Käyttöliittymän nimi | Vakaa sisäinen tunnus | Lukujen, ehtojen ja tulevien vaiheiden lukeminen |
| --- | --- | --- | --- |
| 0 | Ajantasainen | live | Käytä kunkin alkavan vaiheen ajantasaista rakennetta ja arvoja. Sekä ulkopuoliset että ketjun omat muutokset vaikuttavat. |
| 1 | Lukitse ulkopuolisilta muutoksilta | external | Lukitushetken lähtötilanne sekä tämän suorituksen omat myöhemmät muutokset. Ulkopuoliset muutokset eivät muuta luettua tilannetta. |
| 2 | Lukitse kaikilta muutoksilta | all | Lukitushetken lähtötilanne. Myöskään ketjun omat muutokset eivät muuta sen myöhempien lukujen lähdetilannetta. |

**Suunnitteluratkaisu:** nimet ovat valikossa, julkinen ohjattava lukuominaisuus on `lukitus` (0, 1, 2). Sisäinen vakaa enum voi olla yllä oleva tunnus; tallennus ja muunnokset säilyttävät yksiselitteisen vastaavuuden. Luettava `lukitusnimi` näyttää valinnan. Älä käytä nykyistä yleistä `.tila`-ominaisuutta tähän uuteen merkitykseen. Nimivalikon valinnasta voi luoda nykyisen Arvo-palikan numerolla, joten numerot eivät vaadi muistamista.

Ominaisuusrekisteristä syntyvät Ketjun Ominaisuudet-osio, kaavaviite `harjoitus.lukitus`, valinnainen nuolikohta sekä Toiminto → Aseta/Lisää/Palauta -kohteet. Esimerkiksi Arvo 1 tai Kaavan tulos, jonka luku on 1, voi ohjata lukitusta. Muutos tehdään nykyisellä Toiminnolla kohteeseen lukitus; kaava ei kirjoita ketjua salaa.

Etusija on nykyinen ohjattu > asetettu > perusarvo. Oletus uusissa ketjuissa 0. Vanhojen puuttuvan kentän tulkinta sovitetaan olemassa olevaan live-käytökseen ja varmistetaan migraatiotesteillä. Muu kuin kokonaisluku 0–2 on näkyvä ohjausvirhe; ei pyöristämistä tai hiljaista vaihtoa. Perusarvoon palauttaminen ei peru jo tehtyjä toimintoja.

## 3. Lukeminen ja tekeminen erotetaan

**Lukitus koskee arvioinnin lähdettä, ei vaikutusten peruuttamista tai estämistä.** Kaikki kolme tilaa voivat suorittaa Toimintoja, jotka muuttavat oikeaa käyttötietoa. Tila 2 ei ole testitila eikä kuiva suoritus.

Lukittu ketju, jonka laskuri on alussa 0:

1. Aseta laskuriin 1.
2. Lue laskuri.

Tilassa 0 ja 1 jälkimmäinen luku on 1. Tilassa 2 jälkimmäinen luku on 0, vaikka yhteisen laskurin todellinen arvo on jo 1. Seuraava Aseta-toiminto voi siis käyttää alkuperäistä laskettua arvoa ja kirjoittaa sen: näytä Miksi?-selityksessä erot "ketjun lukema" ja "nykyinen käyttötieto". Älä korjaa tarkoituksellista täyttä lukitusta jälkikäteen osittaiseksi.

Tilan 1 omat muutokset tunnistetaan `runId`-alkuperällä, eivät arvon yhtäsuuruudesta. Saman suorituksen syystä syntyneet synkroniset jatkotoimet ja sen nimenomaisesti käynnistämät aliketjut kantavat tätä alkuperää. Muu käyttäjäsyöte, riippumaton ajastettu suoritus, toinen ketjun käynnistys, verkkopäivitys ja rakentajan mallimuutos ovat ulkopuolisia. Aliketjulla on oma suoritus, tapahtuma ja lukitustila; se raportoi vaikutustensa syy-yhteyden emolle. Yhteisen tilan muutoksia ei luokitella omiksi vain siksi, että ne kohdistuvat samaan palikkaan.

Tilan 1 arviointikuva = lukitushetken kuva + oman suorituksen kenttäkohtaiset kirjoitukset. Jos ulkoinen kirjoitus tapahtuu oman kirjoituksen jälkeen, se ei syrjäytä tämän suorituksen omaa lukemaa. Yhteinen käyttötieto silti päivittyy tavallisten toimintojen järjestyksessä. Tila ei ole lukko, joka estäisi muita käyttäjiä kirjoittamasta.

## 4. Milloin tila vaihtuu (D10)

Lukitusasetuksen ohjaus arvioidaan **aina ajantasaisesta ohjauskanavasta**, vaikka itse ketju olisi lukittu. Muuten logiikka ei voisi avata täyttä lukitusta. Tämä poikkeus kuuluu ominaisuuden tarkoitukseen ja näkyy tarkastelijassa.

1. Käynnistyksessä valitse perusarvon/ohjauksen tila. Jos 1 tai 2, ota aloitushetken kuva.
2. Jo alkanut vaihe säilyttää aloituksessa ratkaistut parametrit. Esim. aloitettu 30 sekunnin odotus ei vaihdu 5 sekunniksi ulkopuolisen muutoksen vuoksi.
3. Seuraavan vaiheen aloitusrajalla lue pyydetty tila. Jos se eroaa tämän suorituksen voimassa olevasta tilasta, vaihda silloin.
4. Siirtyminen 0 → 1 tai 2 ottaa **vaihtohetken**, ei ketjun alkuhetken, tilanteen. 1 → 2 ja 2 → 1 ottavat myös uuden vaihtohetken kuvan ja aloittavat oman muutoskerroksen siitä. 1/2 → 0 poistaa lukitun lukukuvan tulevilta vaiheilta.
5. Saman tilan jatkuva syöttäminen ei ota joka askeleella uutta kuvaa. Vain todellinen tilanvaihto tekee sen. Erillinen "uusi lukituskuva" -toiminto on myöhempi mahdollinen ehdotus, ei ensimmäisen version vaatimus.
6. Useat asetuksen muutokset saman odotuksen aikana: seuraava vaihe käyttää rajalla voimassa olevaa viimeisintä pyyntöä. Seuranta näyttää sekä pyydetyn että suorituskohtaisesti voimassa olevan tilan.

Suunnitteluratkaisu: kuva ja tila ovat **suorituskohtaisia**, eivät Ketju-palikan yksi yhteinen muuttuva snapshot. Kahden samanaikaisen suorituksen lukitushetket voivat olla erilaiset.

## 5. Mitä lukitaan ja mitä ei

Lukittuun arviointikuvaan kuuluvat tarvittavat palikkamäärittelyt, kaavat, tulevien vaiheiden kytkennät, moduuliversiot, ominaisuudet, rivit ja tavallisesti luettavat arvot. Ensimmäinen toteutus voi käyttää serialisoitavaa rajattua projektikuvaa; myöhemmin riippuvuuksista rajattua kuvaa. Jos kaikkia tulevia riippuvuuksia ei voi luotettavasti löytää, älä ota puutteellista kuvaa optimoinnin vuoksi.

Suorituksen **ohjaustila ei jäädy**: nykyinen vaihe, haarojen eteneminen, Toista-laskuri, valmistuminen, virheet, peruutus, ulkoinen Pysäytä-komento, jatkamiseen tarvittavat signaalit ja odotuksen määräaikaa tarkistava ajastuskello toimivat edelleen. Muuten Toista tai Ajastin ei koskaan valmistuisi. Rakentajan kaavassa lukema kellon palikka voi olla lukitun lähdearvon osa; moottorin määräajan eteneminen on eri asia.

Tapahtuman talteen otettu kuori säilyy muuttumattomana kaikissa tiloissa (D05). Lukitus ei kirjoita historiaa uudelleen. Ulkoiset sivuvaikutukset (ääni, näkymään siirtyminen, verkkolähetys) tapahtuvat oikeasti; niitä ei toisteta arvioinnissa eikä luvata peruttaviksi.

Odota kunnes -vaiheen tapahtumasignaali voi vapauttaa odotuksen. Lukittuun dataan perustuva ehto voi pysyä epätotena ulkopuolisesta muutoksesta huolimatta: tämä on valitun lukituksen seuraus, joka näytetään selitteessä. Lukituspyyntö otetaan käyttöön seuraavassa vaiheessa, ei jo alkaneen odotuksen sisäistä sääntöä uudelleenkirjoittamalla. Pysäytä säilyy aina mahdollisena. Älä lupaa ajantasaisen ehto-odotuksen ja täysin lukitun arvon yhtäaikaista samaa merkitystä.

## 6. Mallin ja rakenteen päivitykset kesken ketjun

Tilassa 0 tuleva vaihe käyttää ajantasaista määrittelyä myös silloin, kun yhteinen oma palikka on päivittynyt. Jo alkanut efekti/odotus ei käynnisty uudelleen. Seuraavalle vaiheelle siirtyminen ratkaisee reitin ajantasaisesta rakenteesta; jos käynnissä olleen vaiheen rakennetta on muutettu, pidä sen jo aloitettu työ vakaana ja käsittele seuraava kytkentä rajalla. Säilytä vaiheiden pysyvät tunnisteet mallin päivityksessä.

Tiloissa 1/2 tuleva rakenne tulee lukituskuvasta; ulkopuolinen mallin muokkaus ei muuta sitä. Tämä on tietoinen ketjuasetus, ei yhteisten mallien automaattisen päivityksen peruminen. Uusi suoritus käyttää aina uusinta mallia ja omaa lukitustilaansa.

Jos ajantasaisen suorituksen tarvitsema tuleva vaihe tai kohde on poistettu, pysähdy selkeään viitevirheeseen; älä hypähdä mielivaltaisesti yli tai kytke samannimiseen. Lukukuvan vanhaa arvoa voi käyttää, mutta kirjoitus oikeasti poistettuun yhteiseen kohteeseen epäonnistuu. Viitteen poiston ennakkovaroitus ja projektin virhelista toimivat [01:n](01-tieto-ja-tapahtumat.md) mukaisesti.

## 7. Virheet, rinnakkaisuus ja tallennus

D07: jo onnistuneet muutokset jäävät voimaan kaikissa tiloissa. Virhe ilmoitetaan suorituskohtaisesti vaiheineen ja viimeisine onnistuneine toimintoineen. Kaikki tai ei mitään -paketti on erillinen ominaisuus; lukitus ei tee ketjusta transaktiota.

Tallennuksessa erotetaan ketjun perusasetus, asetettu ominaisuus, pyydetty tila, suorituskohtainen voimassa oleva tila, lukitushetki, serialisoitava kuva, omat muutosarvot, nykyinen vaihe/odotus ja muuttumaton tapahtuma. Älä tallenna DOMia, funktioita tai token-salaisuuksia lukituskuvaan. Vienti/tuonti ja sulkemisen jälkeinen jatkaminen eivät ota hiljaa uutta lähtötilannetta eivätkä suorita jo tehtyjä vaikutuksia uudelleen.

Jos kuva puuttuu tai tallennusversio on yhteensopimaton, älä vaihda salaa ajantasaiseksi. Näytä jatkamisen este ja anna pysäyttää/aloittaa uusi suoritus. Rinnakkaishaarat kuuluvat samaan suoritusalkuperään; aidosti riippumattomat käynnistykset ovat erillisiä.

## 8. Hyväksymiskokeet

| Koe | Odotus |
| --- | --- |
| Lähtöarvo 2, ulkopuoli muuttaa 5:een odotuksen aikana | Seuraavan vaiheen tavallinen luku: tila 0 = 5; tilat 1/2 = 2. Tapahtumatieto = 2 kaikissa. |
| Lähtöarvo 0, sama ketju asettaa 1 ja lukee | Tilat 0/1 lukevat 1, tila 2 lukee 0; oikea kohde on 1 kaikissa. |
| Oma kirjoitus 1 ja sen jälkeen ulkoinen 7 | Tila 1 lukee oman kerroksen 1, tila 0 lukee 7; tila 2 lukee lähtökuvan. |
| 0 → 1 ennen seuraavan vaiheen rajaa, oikea arvo silloin 5 | Uusi lukituskuva sisältää 5, ei alkuperäistä 2:ta. |
| 1 → 2, 2 → 1 ja 2 → 0 | Uusi kuva vain todellisessa lukittuun tilaan vaihdossa; avaus palauttaa tulevat luvut ajantasaisiksi. |
| Logiikka ohjaa lukitusta täydessä lukituksessa | Ohjaus luetaan ajantasaisena; vaihto tapahtuu seuraavassa vaiheessa. |
| Toista 3 ja Ajastin kaikissa tiloissa | Ohjaustila etenee ja ketju valmistuu; lukitus ei luo ikuista toistoa. |
| Kaksi saman ketjun samanaikaista suoritusta | Omat tapahtumat, kuvat, tilat ja etenemiset eivät sekoitu. |
| Yhteinen moduuli päivittyy odotuksen aikana | Tila 0 käyttää tulevassa vaiheessa uutta, 1/2 lukittua määrittelyä; odotus ei ala uudestaan. |
| Tuleva vaihe tai kohde poistetaan | Live-suoritus näyttää puuttuvan kohteen virheen; ei hiljaista ohitusta tai uudelleensidontaa. |
| Sulje/avaa ja vienti/tuonti kesken lukitun odotuksen | Kuva ja tapahtuma säilyvät; jo tehdyt vaikutukset eivät toistu. |
| Vanha projekti ilman lukitusominaisuutta | Nykyiset ketjut ja testit säilyvät, oletus live. |

Selaimessa varmista valikon nimet ja numerot, Ominaisuudet, nuoli/kaava/Aseta/Palauta, virheellinen numero, suorituskohtainen selite ja näppäimistökäyttö. Moottorikokeet käyttävät valekelloa ja määrättyjä tapahtumia.

## 9. Toteutus 16.10.2026 (Appi-appi 12)

Toteutettu kohdat 1–8 seuraavin teknisin ratkaisuin. Koodi: `appiappi/index.html`, moottorin osio *P1b: ketjun kolme lukitustilaa* (`lkReq`, `lkSnap`, `lkView`, `lkOwners`, `lkRecord`, `chainLock`, `chainLockDiff`) sekä `chainStart`, `chainAdvance`, `stepRun` ja `runAction`. Kokeet: `testit/logiikka_46_lukitus.js` (taulukon 12 koetta) ja `testit/selain_53_lukitus.py`.

- Perusarvo ketjun kentässä `lk` (1 tai 2; puuttuva = 0). Ominaisuus `lukitus` on tarkka luku (rekisterin `ex`): muu kuin 0, 1 tai 2 on virhe, ei rajausta. Virhe näkyy tarkistuksessa, Aseta-toiminnon ilmoituksena ja ketjun pysähdyksenä (käynnistys tai seuraavan vaiheen raja).
- Lukunäkymä on projektin kopio, jonka `b`, `lg` ja `st` tulevat kuvasta (tilassa 1 lisäksi `own`) ja ketjujen ajotila nykyisestä. Kaikki vaiheen luvut (ehto, kesto, aikaraja, Toista-kerrat, toiminnon arvo, tulos) ja tulevien vaiheiden kytkennät luetaan siitä; kirjoitus ja tapahtumanuolet ovat aina nykyiseen projektiin.
- Omat muutokset tunnistetaan alkuperästä: vaiheen aikana (myös sen tapahtumanuolten jatkotoimissa) muuttuneet käyttötiedon avaimet sekä aliketjun (`par`, `parN`) myöhemmät muutokset. Arvoa ei verrata alkuperään.
- Suunnitteluratkaisu, joka tarkentaa kohtaa 3: kohteen oma nykyinen arvo Lisää-, Vaihda-, Valitse- ja Lisää rivi -toiminnoissa luetaan oikeasta käyttötiedosta, jotta muiden kirjoitus ei häviä eikä kahdesta Lisää 1:stä tule 1. Toiminnon annettu arvo tulee lukukuvasta.
- Isot `data:`-kuvatiedostot eivät kopioidu kuvaan (merkki, luetaan nykyisinä), jottei tallennus kasva.
- Ajantasaisessa suorituksessa kesken poistettu odottava vaihe on virhe. Jo poistettua tulevaa vaihetta ei voi tunnistaa, koska sen kytkentäkin poistuu; poiston vaikutuslista (P1a) varoittaa etukäteen.
- Rajaukset: saman ketjun kaksi samanaikaista kierrosta ei ole mahdollista nykyisessä appissa (koe 8 tehtiin kahdella ketjulla ja uudelleenkäynnistyksellä). Rinnakkaisen haaran alkanut ehto-odotus lukee tilanvaihdon jälkeen uutta tilaa. Tapahtumatieto (D05) tehtiin P2:ssa (Appi-appi 13), ja taulukon sarake ”Tapahtumatieto” on koettu `testit/logiikka_48_tapahtuma.js`:ssä: tapahtuman arvo pysyy kaikissa tiloissa, tavallinen viittaus jäätyy tiloissa 1 ja 2. Kaikki tai ei mitään -paketti ei kuulu tähän.
