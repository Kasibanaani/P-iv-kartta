# F40 Oppivat botit: etäisyys, alusta, pikakelaus ja oppiva arpa

18.10.2026. **Emilin ajatusleikki** (viestit 18.10. klo 2.59 ja 3.00 Suomen aikaa): voisiko maailmaan laittaa botin, jolla on suuntasensorit (asteluku suhteessa botin omaan pohjoiseen, ruudut ympärillä, lähellä olevat asiat nimeltä tai tyypiltä), ja joka oppisi niin, että onnistuneet kierrokset vahvistavat niissä tehtyjä valintoja ruutu- ja suuntakohtaisesti? Luuppi ajettaisiin nopeutettuna tosi monta kertaa, ja botti oppisi kiertämään zombeja tai jahtaamaan pelaajaa ilman, että sitä ohjelmoidaan suoraan. Lisäksi: koulutetut botit pelaajan vastustajina, ja eri verran oppineet botit eri vaikeustasoina.

Merkinnät: *Emilin idea* = hänen sanomansa, *ehdotus* = tekoälyn suunnitteluratkaisu, *avoin* = päätetään ennen rakentamista. **Ei toteutettu. Ei jonossa** ennen Emilin hyväksyntää. Lue ensin [periaatteet](00-periaatteet.md) ja [palikkasäännöt](../PALIKKASAANNOT.md).

## 1. Toimisiko se? Kyllä, ehdoin

Emilin kuvaama tapa on vahvistusoppimisen perusmuoto (taulukkopohjainen, ”Monte Carlo”: kierroksen lopputulos vahvistaa kierroksen valintoja). Se toimii, kun nämä ehdot täyttyvät:

1. **Botti osuu perille sattumalta edes joskus.** Pelkkä ”palkkio vasta perillä” isossa talossa ei käynnisty: satunnaiskävelijä ei ehkä löydä perille tuhannessakaan kierroksessa, eikä mitään vahvisteta. Korjaukset: (a) aloitus läheltä ja lähtöpiste siirtyy kauemmas, kun onnistumisia tulee (”opetus portaittain”); (b) välipalkkiot, esim. pieni plus uuteen huoneeseen tai lähemmäs kohdetta; (c) pieni miinus joka askeleesta, jolloin lyhyt reitti voittaa pitkän.
2. **Myös epäonnistuminen opettaa.** Jos epäonnistunut kierros vain unohdetaan, zombin luona kuoleminen ei opeta mitään: botti oppii vain siitä, mikä joskus onnistui. Miinus zombin kosketuksesta opettaa väistämään paljon nopeammin.
3. **Arvo valuu takaperin askel kerrallaan.** ”Kaikki ennen onnistumista vahvistuu yhtä paljon” vahvistaa myös turhat silmukat ja harharetket. Parempi (*ehdotus*): jokainen tilanne oppii seuraavalta tilanteelta, kuinka hyvä se on (”tästä ruudusta pohjoiseen on yleensä hyvä, koska pohjoisen ruutu on lähellä maalia”). Arvo leviää maalista taaksepäin kuin vesi. Tämä oppii myös epäonnistumisista ja kesken jääneistä kierroksista. Alan nimi: Q-oppiminen.
4. **Jakauma pysyy.** Emilin ajatus ”tekee välillä muutakin kuin oppimansa” on oikea ja välttämätön: ilman sitä botti jää ensimmäiseen kelvolliseen reittiin. Säädin *uteliaisuus*: harjoituksessa korkea, valmiilla botilla matala.
5. **Tilanne on pieni.** Taulukko oppii jokaisen tilanteen erikseen eikä tiedä, että kaksi tilannetta muistuttaa toisiaan. Jos tilanteita on miljoonia, kukin nähdään harvoin eikä mitään opita. Kohdassa 2 miten tilanne rakennetaan.

**Arvio määristä** (*päätelty*, ei mitattu): 20 × 20 ruudun talo, neljä suuntaa, kiinteä maali: satoja–muutamia tuhansia kierroksia. Lisätään yksi zombi karkeasti (missä sektorissa, lähellä vai kaukana): kymmeniä tuhansia. Kierros 100–300 askelta, joten yhteensä miljoonia askelia.

## 2. Mitä botti oppii: sijainti vai sensorit

Tilanne on se, mitä botti ”tietää” valitessaan. Rakentaja päättää sen, ja se on se osa, joka yhä ohjelmoidaan.

| Tilanne | Oppii | Ei opi |
|---|---|---|
| **Sijainti** (ruutu) | Juuri tämän talon reitit, myös umpikujat ja kiertotiet | Toista taloa; siirtynyttä maalia; zombeja, jotka liikkuvat |
| **Sensorit** (maali suunnassa 40° oikealla, seinä edessä, zombi takana vasemmalla) | Yleiset säännöt: väistä zombia, kulje maalia kohti, käänny seinän edessä. Toimii uudessakin talossa | Sokkeloa: ilman muistia botti ei tiedä, oliko jo tässä huoneessa, ja voi jumittua umpikujaan maalin vieressä |
| **Sijainti + karkea sensori** (ruutu + zombin sektori) | Talon reitit ja väistön samassa | Toista taloa |

Suositus (*ehdotus*): sensorit karkeina luokkina, ei tarkkoina lukuina. ”Zombi 37° oikealla 4,2 ruudun päässä” on liian tarkka; ”edessä oikealla, lähellä” on oppimiskelpoinen. Kahdeksan sektoria × kolme etäisyyttä (lähellä, kaukana, ei näy) = 24 tilaa per seurattava asia.

**Nimi, laji vai hyvä/huono?** Taulukko ei tiedä, että *Zombi 1* ja *Zombi 2* ovat samanlaisia, joten sensorin pitää kertoa **laji** (joukko, F41, toteutettu Appi-appi 57/62/63: `#zombit`, `#kolikot`, `#pelaaja`). Botti oppii lajin arvon itse seurauksista, joten ”hyvä” ja ”huono” -merkintää ei tarvita, ja kun uusi zombi saa tunnuksen `#zombit`, botti osaa sen heti. Pelkkä hyvä/huono-merkintä olisi tiivein mutta sama kuin kertoisi vastauksen valmiiksi; laji on rehellisempi ja yhtä pieni.

**Näköyhteys:** talossa seinän takana oleva zombi ei saa näkyä, muuten botti väistää seinän läpi. Sensorin valinta *seinät peittävät*.

## 3. Vastustajat ja vaikeustasot (Emilin idea)

- **Jahtaaja:** palkkio pelaajan kiinniotosta, pieni plus lähestymisestä. Harjoitus vaatii pelaajan, joka liikkuu ilman ihmistä, koska ihminen on miljoonaan askeleeseen liian hidas: (a) satunnainen kulkija, (b) yksinkertainen pakenija (kaava: poispäin jahtaajasta), (c) toinen oppiva botti, joka oppii pakenemaan (molemmat paranevat vuorotellen). Rehellinen riski: botti oppii voittamaan juuri sen harjoitusvastuksen. Ihmistä vastaan se voi olla yllättävän hyvä tai helposti huijattava; sen näkee vain kokeilemalla.
- **Vaikeustasot:** taulukon voi tallentaa kopioksi missä vaiheessa tahansa (100, 1 000, 10 000 kierroksen kohdalla). Huono puoli: vähän oppinut botti ei ole ”heikompi mutta järkevä” vaan sekava, osin hyvä, osin hölmö. Parempi vaikeussäädin (*ehdotus*): täysin oppinut taulukko ja pelissä säädettävä uteliaisuus (helppo = usein satunnainen valinta), reaktioviive ja sensorin kantama. Kaikki ovat tavallisia ohjattavia ominaisuuksia, joten vaikeustaso on yksi Valitse-palikka. Kopiot sopivat, jos haluaa eri luonteita.

## 4. Mitä Appi-appista puuttuu (tarkistettu 18.10.2026, Appi-appi 49; joukot lisätty Appi-appi 64:n mukaan)

Nyt olemassa ja käyttökelpoista: ruutuliike (*ylös/alas/vasen/oikea*-tapahtumat = botin neljä valintaa, `ruutux`/`ruutuy` = sijainti), Alueen *astuttu* (perillä), törmäys-tapahtumat (zombi osui), Arpa (satunnainen haara, tasajakauma), Satunnaisluku painoilla, Tietotaulukko, Kaavio, Liikkeen *alkuun*, ketjut ja Ajastin. Puuttuu:

1. **Etäisyys ja suunta (sensorin osat).** Kaava ei osaa laskea suuntaa tai etäisyyttä toiseen palikkaan (ei neliöjuurta eikä kulmafunktiota, eikä palikkasäännön 7 mukaan niitä lisätä kaavaan yhden tarpeen takia), ei löydä lähintä tietyn lajin palikkaa eikä kerro, mitä on ruudussa botin edessä. Suunta suhteessa botin omaan kulkusuuntaan puuttuu kokonaan.
2. **Koko maailma alkuun.** Liikkeen *alkuun* palauttaa yhden liikkujan, ja *Tyhjennä käyttötiedot* nollaa kaiken käsin, myös opitun. Ei toimintoa, joka palauttaa näkymän alkutilaan mutta säilyttää valitut asiat.
3. **Nopeutus.** Aikakerrointa ei ole: kaikki kulkee seinäkellon mukaan noin 60 kuvaa sekunnissa, ja moottori rajaa kuvan pituuden 0,25 sekuntiin (`frame`, törmäykset muuten hyppäisivät seinien läpi). Miljoona askelta reaaliajassa ≈ 4,6 tuntia, ja appi piirtää jokaisen. Mitattu raskaus (`kartoitukset/2026-10-18-keveys.md`): moottori 2,7–5 ms kuvalle isossa projektissa. Hyvä uutinen: moottori on DOMista vapaa (`<script id="engine">`), joten sen voi ajaa piirtämättä.
4. **Oppiva valinta.** Arvan haarat ovat aina yhtä todennäköisiä; painoa ei voi muuttaa tapahtumasta. Tietotaulukkoon voisi teoriassa käsin rakentaa arvotaulun (Hakutaulukko tilanteelle, Aseta arvo soluun, kaava parhaalle suunnalle `jos(;;)`-ketjuilla), mutta se olisi kymmenien palikoiden hirviö, joka vaatisi silti kohdat 1–3.
5. **Opitun näkyminen.** Ei tapaa nähdä, mitä botti on oppinut.

## 5. Ehdotus: viisi yleistä osaa

Jokainen on hyödyllinen ilman bottejakin (palikkasääntö 8, missio kohta 3).

### 5.1 Etäisyys ja Kohdassa: sensori rakennetaan yleisistä osista (Emilin linjaus 18.10.2026)

*Emilin kysymys:* tarvitaanko erillinen Sensori, vai onko etäisyys yleinen työkalu, josta sensori rakennetaan tarpeen mukaan (ja peleihin presetit)? *Ehdotus:* jälkimmäinen. Sensori nimeää sovelluksen, ei tekemistä (palikkasääntö 1), ja lukitsisi etäisyyden yhteen käyttöön. Siksi kaksi yleistä mittaavaa palikkaa ja sensorit presetteinä (F26).

**Etäisyys** (`etaisyys`, logiikkapalikka; mittaa kahden asian välin):
- **Asetukset:** *mistä* (palikka), *mihin* (palikka, joukko `#x` tai laji; joukolla mitataan lähimpään), *suunta suhteessa*: **maailmaan** (0 = ylös) tai **mistä-palikan kulkusuuntaan** (0 = edessä, −180…180; näin mittaus ”lukittuu hahmoon” ja kääntyy sen mukana), *mitta*: px tai ruutua (kerroksen tai palikan ruudukko), valinnainen *seinät peittävät* (esteet katkaisevat näön).
- **Ominaisuudet** (`omat`): `arvo` = etäisyys, `dx`, `dy`, `suunta`, `sektori` (4 tai 8 suuntaa, 1 = edessä tai ylös), `näkyy` (näköyhteys), joukolla `kuka` (lähimmän nimi) ja `montako` (kuinka monta joukosta mitattiin).
- **Sisään:** *mistä* ja *mihin* myös nuolella. **Ulos:** *arvo* jatkuvana, tapahtuma *muuttui*. Raja-tapahtumat (*tuli lähelle*) tehdään tavallisella Vertailulla `@zombi_väli < 100` ja sen *alkoi päteä* -tapahtumalla, ei omaa kynnystä palikkaan.
- **Muut käytöt:** kompassinuoli lähimpään kolikkoon (Monitori `@kolikkoon.suunta`), ”kuuma–kylmä”, äänen voimakkuus etäisyyden mukaan, vihollinen kääntyy pelaajaa kohti (Liikkeen kohde `@pelaajaan.suunta`), tarkistuspisteen etäisyys Autopelissä, kaavio kahden pallon etäisyydestä ajassa.

**Kohdassa** (`kohdassa`, logiikkapalikka; kertoo, mitä on tietyssä pisteessä):
- **Asetukset:** *mistä* (palikka tai ei mitään = maailma), *siirto* (eteen/sivulle px tai ruutua, kiertyy mistä-palikan kulkusuunnan mukana; tai x, y maailmassa), *mitä etsii* (kaikki, este, joukko `#x`).
- **Ominaisuudet:** `arvo` = päällimmäisen nimi tai tyhjä, `este` (kyllä/ei), `montako`, `joukot`.
- **Muut käytöt:** ruutupelin ”onko edessä seinä”, Sokoban-tarkistus ennen työntöä, voiko tähän rakentaa, napautuspisteen alla olevat palikat, robotin törmäystuntoviikset.

**Sensori-presetit** (F26, ei uutta palikkaa): *Etäisyyssensori* (Etäisyys lukittu hahmon kulkusuuntaan + Vertailu + sektori), *Näkösensori* (sama + seinät peittävät), *Tuntoviikset* (kolme Kohdassa-palikkaa: edessä, vasemmalla, oikealla). Avautuvat tavalliseksi logiikaksi.

**Keveys:** lasketaan vain, kun arvoa luetaan, kerran kuvassa; joukolla vain jäsenet.

**Miksi ei ominaisuutena jokaisella palikalla** (`@botti.etäisyys.zombi`): pareja on rajattomasti, ja asetuksille (suhteessa mihin, mitta, seinät) ei olisi paikkaa eikä Miksi?-selitystä. Palikka antaa näkyvän paikan ja nimen tulokselle, kuten Kaavan tulos.

### 5.2 Aloita alusta (toiminto)

Uusi toiminto *Aloita alusta*: valittu näkymä (tai koko projekti) palaa alkutilaan: käyttötieto pois (asetetut ominaisuudet, Liikkeet alkuun, Muistit tyhjiksi, satunnaisluvut arvotaan), rakenne ennallaan. Valinta *säilytä*: lista palikoista, joiden käyttötieto pysyy (opittu taulukko, ennätys, kierroslaskuri). Tapahtuma *alkoi alusta*. **Muut käytöt:** jokaisen pelin *Uusi peli* -nappi, Headmazen nollaus, Autopelin uusi lähtö ilman kahdeksaa *alkuun*-nuolta. Tämä on hyödyllinen heti, botteja odottamatta.

### 5.3 Pikakelaus (rakentajan työkalu ja ohjattava tila)

- Projektin työkalupalkkiin ⏩ *Kelaa*: aja näkymää piirtämättä *N kierrosta* tai *M minuuttia pelin aikaa*. Moottori kulkee kiinteällä askeleella (1/60 s) ja **näennäisellä kellolla**: Ajastimet, Sekuntikellot, ketjut ja Muutokset näkevät pelin ajan, eivät seinäkelloa. Ruutu näyttää vain edistymisen ja (valinnaisesti) Kaavion, esim. onnistumisprosentin sadan kierroksen jaksoissa.
- Kierros = väli *Aloita alusta* → seuraava *Aloita alusta*. Raja: *enintään askelia kierroksella* (Emilin ”oma kriteeri, milloin luuppi alkaa alusta”), sen jälkeen kierros katsotaan epäonnistuneeksi ja aloitetaan alusta.
- Ajo pätkissä (esim. 30 ms kerrallaan), jotta selain ei jäädy ja *Pysäytä* toimii. Myöhemmin (*avoin*) Web Workeriin, jolloin selain on vapaa ja nopeus moninkertainen; moottorin DOM-vapaus mahdollistaa sen.
- **Muut käytöt:** pelin tasapainon testaus (100 kierrosta Autopelin rataa eri renkailla), arpapelin tilastot tuhannesta pelistä, päivälaskurin testaus ”kelaa viikko eteenpäin” ilman että odotetaan.
- **Arvio nopeudesta** (*päätelty*): pieni harjoitustalo (50–100 palikkaa) jonon 1p:n kevennysten jälkeen alle 1 ms askelta kohden → 1 000–3 000 askelta sekunnissa → miljoona askelta 5–15 minuutissa. Mitataan ennen kuin luvataan.

### 5.0 Arvonta: Satunnaisluku ja Arpa yhdeksi palikaksi (Emilin idea 18.10.2026)

*Emilin kysymys:* miksi Satunnaisluku ja Arpa ovat eri työkaluja, kun molemmille pitäisi voida antaa painot? *Ehdotus:* yksi palikka, kaksi tapaa.

- **Lukuväli** (nykyinen Satunnaisluku): pienin–suurin, painot jatkuvana käyränä janalla (nykyinen jakaumaikkuna). Ulos *luku*.
- **Vaihtoehdot** (uusi): oma lista (*Kivi, Paperi, Sakset* tai *1, 2, 3, 4*), jokaisella oma paino pylväänä. Ulos *arvo* = arvottu vaihtoehto ja yksi tapahtumakohta per vaihtoehto (*Kivi arvottu* …). Ketjussa sama palikka toimii kuten nykyinen Arpa: ketju jatkuu arvotun vaihtoehdon haaraan.
- Sama jakaumaikkuna, sama ⚂ Koeheitto, samat ohjattavat painot `p1…` molemmissa. Oppiminen (5.4) liitetään tähän yhteen palikkaan.
- **Vanhat projektit:** Arpa avautuu Vaihtoehdot-tapana (vaihtoehdot 1…n, tasapainot), Satunnaisluku Lukuväli-tapana (`repair`). Tallennusmuodon muutos.
- **Linjakkuus:** yksi käsite (jakauma) kahden sijaan; hinta on, että yksi laji on sekä arvopalikka että ketjun haarapalikka, joten erikoispalikkarekisterin Arpa-rivi muuttuu (*avoin*: Emilin hyväksyntä, PALIKKASAANNOT osa B). Nimi *avoin*: säilyykö *Satunnaisluku*, vai *Arvonta*.
- Vaihtoehto, jos yhdistäminen ei kelpaa: Arpa saa saman painoikkunan, palikat pysyvät erillään.

### 5.4 Arpa oppii (Arvan laajennus, ei uusi palikka)

Arpa saa painot (kuten Satunnaisluku) ja valinnaisen osion **Oppiminen**:

- *Tilanne*: kaava, joka nimeää tilanteen tekstinä, esim. `@botti.ruutux-@botti.ruutuy` tai `@zombiin.sektori/@maaliin.sektori/@edessä.este`. Rakentaja päättää, mitä botti tietää (kohta 2).
- *Palkkio* (sisään, tapahtuma + määrä): plus tai miinus mihin tahansa hetkeen (perillä +10, zombi −10, askel −0,1). *Kierros päättyi* (sisään): viimeinen palkkio ei valu yli kierrosten.
- *Uteliaisuus* % (ohjattava; harjoitus 20 %, peli 0–5 %), *oppimisnopeus*, *kaukonäköisyys* (kuinka paljon tuleva palkkio painaa nyt; oletukset valmiina).
- **Muisti on Tietotaulukko:** rivi per tilanne, sarake per haara. Sen voi avata ja lukea (”tästä tilanteesta haara 2 arvo 7,3”), monistaa tasoksi (*Taso 1000*), tyhjentää tai vaihtaa Arvan käyttämäksi Valitse-palikalla. Ei uutta tallennuslajia opitulle.
- Botin silmukka logiikassa: Ajastin tai *askel valmis* → Arpa (oppii) → haarat 1–4 → Liikkeen *ylös/alas/vasen/oikea*. Kaikki näkyy ja on muutettavissa.
- **Muut käytöt:** sopeutuva vastustaja kivi-paperi-sakset-pelissä (tilanne = pelaajan edellinen valinta), suosittelija omassa appissa (tilanne = vuorokaudenaika, palkkio = Emil valitsi ehdotuksen), harjoitusappi, joka oppii mitkä kysymykset kannattaa toistaa.

### 5.5 Opittu näkyviin

- Tietotaulukko näyttää jo luvut. Lisäksi (*ehdotus*): kun Arvan tilanne on muotoa `x-y` ja kerroksella on ruudukko, rakentaja voi näyttää näkymässä jokaiseen ruutuun nuolen parhaaseen suuntaan ja värin arvon mukaan (pelkkä rakentajan näkymä, kuten Viitteet-katkoviivat). Botti, joka on oppinut talon, näyttää nuolikartan, jossa kaikki nuolet virtaavat maalia kohti. Tämä on yksi opettavaisimmista asioista koko ajatuksessa.
- Arvan Miksi?: *valitsi haaran 2: arvo 7,3 (muut 1,2 / −4,0 / 0,5), tilanne 12-7*; tai *arvottiin uteliaisuudesta*.

## 6. Järjestys ja paikka jonossa (*ehdotus*, Emil päättää)

| Vaihe | Sisältö | Tallennusmuoto | Riippuu |
|---|---|---|---|
| F40-0 | Arvonta: Satunnaisluku ja Arpa yhteen (5.0) | muutos (`repair` Arpa → Vaihtoehdot) | – |
| F40-1 | Aloita alusta (5.2) | laajenee (toiminnon lista *säilytä*) | – |
| F40-2a | Etäisyys kahden palikan välillä, suunta maailmaan tai kulkusuuntaan (5.1) | laajenee, uusi laji `etaisyys` | – |
| F40-2b | Etäisyys lähimpään joukosta ja näköyhteys, Kohdassa-palikka, sensoripresetit (5.1) | laajenee, uusi laji `kohdassa` | F40-2a (joukot ovat jo: Appi-appi 57, 62, 63) |
| F40-3 | Pikakelaus ja näennäinen kello (5.3) | ei | jonon 1p (kevennys), F40-1 |
| F40-4 | Arpa oppii (5.4) ja Miksi? | laajenee (Arvan valinnaiset kentät) | F40-1, F40-3 |
| F40-5 | Nuolikartta (5.5) | ei | F40-4 |

Sen jälkeen koeprojekti *Talo ja zombit* `master-tiedot/appiappi/`-kansioon (botti oppii talon, sitten zombit, sitten jahtaaja), kömpelyydet jonoon yleisinä kohtina.

Suositus jonoon: **F40-1 heti jonon 15 jälkeen** (pieni, hyödyllinen kaikille peleille), **F40-2…5 ennen 2D-vaihetta A (16)** (joukot ovat jo valmiina, Appi-appi 57, 62, 63). Perustelu: osat ovat pienempiä kuin 2D, toimivat jo nykyisessä ruutumaailmassa (Headmaze-tyyppiset talot ruutuliikkeellä) eivätkä vaadi painovoimaa. Vaihtoehto: 2D ensin, botit sen jälkeen, jos tasoloikka on Emilille tärkeämpi. Kaistat: F40-3 koskee moottorin silmukkaa kuten 1p ja 2D, joten ei samaan aikaan niiden kanssa.

## 7. Rajaukset

- Ei neuroverkkoja. Taulukko on läpinäkyvä (rakentaja näkee, mitä botti tietää), riittää ruutumaailmaan ja sopii missioon. Neuroverkko yleistäisi samankaltaisiin tilanteisiin, mutta olisi musta laatikko ja iso uusi käsite. *Avoin*, palataan jos taulukko ei riitä.
- Appi ei kutsu tekoälyä eikä ulkoisia palveluita; kaikki lasketaan selaimessa.
- Taulukko kasvaa tilanteiden mukaan: 10 000 tilannetta × 4 haaraa on pieni, miljoona ei. Arvan paneeli näyttää rivimäärän ja varoittaa, jos tilanne-kaava tuottaa liikaa rivejä (esim. tarkat koordinaatit pikseleinä).

## 8. Linjakkuus

- **Säännöt A1–A15:** Etäisyys ja Kohdassa nimetty tekemisen mukaan (mittaa, kertoo mitä pisteessä on); sensori on preset, ei palikka; Arpa säilyttää nimensä ja tekee saman asian painotettuna. Kaikki arvot `omat`-rekisteriin (A2); uteliaisuus ja kantama ohjattavia (vaikeustaso). Tapahtumat: Sensori *näki/menetti*, Arpa *palkkio/kierros päättyi* sisään, *alkoi alusta* ulos (A4). Kaava pysyy tilana: tilanne-kaava vain nimeää tilanteen, oppiminen tapahtuu Arvan arvoksi -tapahtumassa (A6). Ei uusia kaavafunktioita (A7). Opittu = Tietotaulukko, ei uutta tallennusta (A8). Miksi? molemmille (A10). Sensorin laskenta moottorissa (A12).
- **Uusi käsite:** näennäinen kello pikakelauksessa. Se on uusi asia opittavaksi, mutta näkyy vain ⏩-työkalussa; muuten aika toimii kuten ennen.
- **Erikoispalikka:** Arpa on jo ✦ (ketjun palikka). Oppiminen ei tuo uutta poikkeusta: Arpa kirjoittaa omaan Tietotaulukkoonsa käyttötietona kuten Muisti. Etäisyys ja Kohdassa ovat tavallisia logiikkapalikoita.

## 9. Avoimet kysymykset Emilille

1. Kelpaako järjestys ja paikka jonossa (kohta 6)?
2. Riittääkö Arvan laajennus, vai haluatko oman palikan nimeltä esim. *Oppija*? Suositus: Arvan laajennus (yksi käsite vähemmän).
3. Pikakelaus ensin pätkissä pääsäikeessä (helpompi), Worker myöhemmin vain jos nopeus ei riitä? Suositus: kyllä.
