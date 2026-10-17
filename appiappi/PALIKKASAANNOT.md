# Appi-appi: palikkasäännöt ja erikoispalikat

17.10.2026. **Jokainen rakentaja lukee tämän aina**, ennen kuin lisää tai muuttaa palikkaa, toimintoa tai ominaisuutta. Tämä on [MISSIO.md](MISSIO.md):n ja [periaatteiden](suunnitelmat/00-periaatteet.md) tiivis, mekaaninen muoto: mitä jokaisen palikan pitää tehdä. Miksi-kysymykset ovat missiossa.

## Lukujärjestys

| Kuka, milloin | Lukee |
|---|---|
| Rakentaja, rajattu työ (palikka, korjaus, jonon kohta) | Tämä + `TILA.md` + työn oma suunnitelma. Missio vain, jos työ tuo uuden käsitteen tai poikkeaa alla olevista säännöistä. |
| Suunnittelija, uusi suunnitelma | Missio + periaatteet + tämä. Suunnitelmaan kohta **Linjakkuus** (ks. alla). |
| Linjakkuuskartoitus (koko metsä) | Missio kokonaan + nykytilakuva koodista (manuaali, kun sellainen on) + tämä. Milloin: ks. loppu. |

## A. Jokaisen palikan säännöt

Rakentaja käy listan läpi omaa työtään vasten. Jos jokin kohta ei toteudu, se on joko korjattava tai kirjattava poikkeukseksi (osa B).

1. **Nimi kertoo tekemisen**, ei sovellusta: näyttää, vertaa, muistaa, valitsee, odottaa, liikuttaa, tuottaa tapahtuman. Sovelluskohtainen merkitys syntyy sisällöstä ja kytkennöistä.
2. **Ominaisuudet yhteen rekisteriin.** Jokainen rakentajalle merkityksellinen arvo kirjataan `omat(b)`:hen. Silloin se on samalla kertaa käsin asetettava (perusarvo), kaavalla luettava (`palikka.ominaisuus`), logiikalla ohjattava (`o:1` → kohta `o_<avain>`) ja Aseta-, Lisää- ja Palauta-toimintojen kohde. Jos jokin jää ohjattavuuden ulkopuolelle, syy kirjataan.
3. **Sama etusija kaikkialla:** ohjattu (nuoli tai kaava) > toiminnon asettama > perusarvo. Yhdellä ominaisuudella on yksi jatkuva ohjaus, ja ristiriita näkyy.
4. **Tapahtumat sisään ja ulos.** Kun palikalla on aikaa, tilaa tai vuorovaikutusta, se lähettää tapahtumat (alkoi, valmis, painettu, törmäsi…) ja ottaa ohjauksen tapahtumina (käynnistä, pysäytä, nollaa, alkuun). Jatkuvat arvot ovat arvokohtia, hetket tapahtumakohtia.
5. **Näkymäpalikka on yhteistä kieltä:** yhteiset kohdat (näkyy kun, harmaana kun, teksti, vaihtoväri kun, siirto x/y), yhteiset ominaisuudet (tila, paikka, koko, ilme) ja käyttöraahaus. Painike on vuorovaikutus ja tapahtuman lähde, ei sisäinen toimintolista.
6. **Kaava on tila, toiminto on hetki.** Kaava kuvaa, mitä on, kun logiikka pätee; toiminto muuttaa käyttötietoa tapahtumahetkellä. Piirto ei koskaan suorita toimintoa eikä arvo uudelleen.
7. **Yhdistely ikkunoilla.** JA/TAI, määrät ja koosteet käyttävät ikkunaa. Ei uutta sulku-, funktio- tai sääntökieltä yhden tarpeen takia.
8. **Monta yleistä reittiä on hyvä, yksi erikoisreitti epäilyttävä.** Jos saman asian voi tehdä usealla yleiskäyttöisellä tavalla, hyvä. Uutta erikoistyökalua ei tehdä, jos nykyinen yhdistelmä, pikaluonti tai yhteisen ominaisuuden laajennus riittää. Pikaluonti ja preset tuottavat tavallista, avattavaa logiikkaa.
9. **Viitteet kestävät.** Viite on luettava nimi, yhteys pysyvä tunniste. Uudelleennimeäminen ei riko; poisto näyttää vaikutuslistan.
10. **Rakentaja näkee toiminnan.** Arvo, lähde, Yhteydet, Miksi?-selitys sekä tyhjä, epätosi, virhe ja katkennut viite näkyvät kuten muillakin palikoilla.
11. **Kevyt rakentaa, vakaa käyttää.** Palautettava teko tapahtuu suoraan ilman vahvistusta; varoitus vain todellisesta tiedonmenetyksestä tai rikkoutuvista yhteyksistä. Lisäasetukset näkyvät vasta, kun niitä käytetään.
12. **Moottori ilman DOMia.** Laskenta, liike, törmäys ja kamera ovat moottorissa (`<script id="engine">`), koska moottori kopioituu viedyille apeille.
13. **Tallennus kestää.** Uudet kentät nimetään ja ovat valinnaisia; vanha muoto aukeaa (`repair`); vanhaa avainta ei oteta uuteen merkitykseen.
14. **Testi.** Uusi palikka tai toiminto saa oman testinsä; testisisältö on synteettistä.

## B. Erikoispalikat

**Erikoispalikka** on palikka, joka poikkeaa tarkoituksella jostain osan A säännöstä. Niitä saa olla, mutta ne eivät saa olla piilossa.

- **Dokumentissa:** jokaisella erikoispalikalla on rivi alla olevassa rekisterissä: mistä säännöstä se poikkeaa ja miksi. Uusi erikoispalikka tai uusi poikkeus vaatii suunnitelman perustelun ja Emilin hyväksynnän; rakentaja ei tee poikkeusta omin päin, vaan kirjaa kysymyksen `TILA.md`:hen.
- **Appissa (jonossa, kohta 1b; ei vielä rakennettu):** palikkalajin määrittelyyn `K` kenttä `erik:'lyhyt syy'`. Paletti ja tarkastelija näyttävät erikoispalikalle tunnuksen ✦ ja syyn selkokielellä, ja testi tarkistaa, että jokaisella `erik`-lajilla on rivi tässä rekisterissä ja päinvastoin.

### Rekisteri

Tila: **ehdokas** = havaittu, arvioimatta; **arvioitu** = kartoitus pitää poikkeusta tarkoituksellisena (Emil voi kumota); **päätetty** = Emilin tai periaatteiden päätös; **korjattava** = poikkeus on vahinko. Arvio: [linjakkuuskartoitus 1](kartoitukset/2026-10-17-linjakkuus.md).

| Palikka (laji) | Poikkeus | Syy | Tila |
|---|---|---|---|
| Ketjun palikat (`ch`: Ajastin, Ehto, Odota kunnes, Arpa, Toista, Ketjun tulos, Lopeta ketju, Monta haaraa, efektit) | Lajiryhmä: etenevät ketjun viivoja pitkin. Efekti ketjun ulkopuolella lähettää *sitten* heti. | Tapahtumaketju (versio 6) | arvioitu |
| Kaavan tulos (`tulos`) | Saa arvonsa vain kaavan `tulos = …` kautta | Nimeää lasketun arvon | päätetty (periaatteet 4) |
| Sijainti (`merkki`), Alue (`alue`) | Ei näkymäpalikan yhteisiä kohtia eikä käyttöraahausta (A5) | Paikkoja, ei näkyvää sisältöä | arvioitu |
| Kaavio, Monitori, Reitti, Kuva (`kaavio`, `mittari`, `reitti`, `pkuva`) | Ei arvoa ulos (A4) | Pelkkä esitys; Monitorin arvo on ohjattava ominaisuus | arvioitu |
| Toistin (`toistin`) | Vain kohdat *näkyy kun* ja *rivit* (A5) | Kortit ovat sen sisällä. Harmaana, vaihtoväri ja siirto puuttuvat ilman syytä (L5). | osin korjattava |
| Kerros, Kamera (`kerros`, `kamera`) | Logiikkapalikka ohjaa näkymää; osa ominaisuuksista ei ohjattavissa | Näkymän kerros ja zoomaus logiikkaan; laajuus `TILA.md`:n avoimissa kysymyksissä | arvioitu |

## Suunnitelman kohta Linjakkuus

Jokaisessa uudessa suunnitelmassa on lyhyt kohta: mitkä osan A säännöt koskevat työtä, mitkä ominaisuudet tulevat `omat`-rekisteriin, mitä tapahtumia sisään ja ulos, ja tuleeko uusi erikoispalikka tai poikkeus (jos tulee, rekisteririvi ehdotuksena). Pieni korjaus ei tarvitse tätä.

## Milloin tehdään linjakkuuskartoitus

Suunnittelija huomioi linjan yhdessä suunnitelmassa, mutta ei näe, miten monta erillistä hyvää päätöstä yhdessä ajautuu sivuun. Siksi koko metsä katsotaan erikseen:

- ennen uuden toimintoryhmän suunnittelua (esim. ennen F25:tä tai vientiä omaksi appiksi),
- kun jonosta on viety viisi kohtaa edellisen kartoituksen jälkeen,
- aina kun Emil pyytää.

Kartoitus tuottaa löydökset ja ehdotukset, ei koodimuutoksia. Viimeisin kartoitus kirjataan `TILA.md`:hen. **Viimeisin:** [17.10.2026](kartoitukset/2026-10-17-linjakkuus.md).
