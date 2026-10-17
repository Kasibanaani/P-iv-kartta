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
- **Appissa (ehdotus, ei rakennettu):** palikkalajin määrittelyyn `K` kenttä `erik:'lyhyt syy'`. Paletti ja tarkastelija näyttävät erikoispalikalle tunnuksen ✦ ja syyn selkokielellä, ja testi tarkistaa, että jokaisella `erik`-lajilla on rivi tässä rekisterissä ja päinvastoin.

### Rekisteri

Tila: **ehdokas** = havaittu koodista 17.10.2026 (`portsBase`, `omat`), ei vielä arvioitu; **hyväksytty** = poikkeus todettu tarkoitukselliseksi; **korjattava** = poikkeus on vahinko.

| Palikka (laji) | Poikkeus | Syy | Tila |
|---|---|---|---|
| Sijainti (`merkki`), Alue (`alue`) | Ei näkymäpalikan yhteisiä kohtia eikä käyttöraahausta (A5) | Merkki ja alue ovat paikkoja, eivät näkyvää sisältöä | ehdokas |
| Kaavio, Monitori, Reitti (`kaavio`, `mittari`, `reitti`) | Ei ulostuloja (A4) | Pelkkä esitys | ehdokas |
| Toistin (`toistin`) | Vain kohdat *näkyy kun* ja *rivit* (A5) | Kortit ovat sen sisällä | ehdokas |
| Kuva (`pkuva`) | Sisäinen nimi poikkeaa (A1) | `kuva` on varattu efektille *Kuva vaihtuu* | ehdokas |
| Efektit (`ilmesty`, `kuva`, `anim`, `nvaihto`) | Toimivat vain ketjussa; ketjun ulkopuolella *sitten* lähtee heti | Ketjun tapahtumia | ehdokas |
| Kaavan tulos (`tulos`) | Saa arvonsa vain kaavan `tulos = …` kautta | Nimeää lasketun arvon | ehdokas |
| Kerros, Kamera (`kerros`, `kamera`) | Logiikkapalikka, joka ohjaa näkymää; kaikkia ominaisuuksia ei voi ohjata (TILA, avoimet kysymykset) | Näkymän kerros ja zoomaus logiikkaan | ehdokas |

Ensimmäinen linjakkuuskartoitus käy rekisterin läpi ja täydentää sen.

## Suunnitelman kohta Linjakkuus

Jokaisessa uudessa suunnitelmassa on lyhyt kohta: mitkä osan A säännöt koskevat työtä, mitkä ominaisuudet tulevat `omat`-rekisteriin, mitä tapahtumia sisään ja ulos, ja tuleeko uusi erikoispalikka tai poikkeus (jos tulee, rekisteririvi ehdotuksena). Pieni korjaus ei tarvitse tätä.

## Milloin tehdään linjakkuuskartoitus

Suunnittelija huomioi linjan yhdessä suunnitelmassa, mutta ei näe, miten monta erillistä hyvää päätöstä yhdessä ajautuu sivuun. Siksi koko metsä katsotaan erikseen:

- ennen uuden toimintoryhmän suunnittelua (esim. ennen F25:tä tai vientiä omaksi appiksi),
- kun jonosta on viety viisi kohtaa edellisen kartoituksen jälkeen,
- aina kun Emil pyytää.

Kartoitus tuottaa löydökset ja ehdotukset, ei koodimuutoksia. Viimeisin kartoitus kirjataan `TILA.md`:hen. **Viimeisin: ei vielä tehty.**
