# F42 Syvyys: kerroksen ja palikan etäisyys, josta parallaksi ja koko seuraavat

18.10.2026. **Emilin idea** (viesti 18.10. klo 10.56 Suomen aikaa): kerroksille syvyys (etäisyys näytön pinnasta), joka ohjaa suoraan parallaksia rullatessa; kauemmas työnnetty kerros pienenee; myös yksittäiselle objektille oma syvyys; kaikki säädettävissä logiikalla ja tapahtumilla; ei saa raskauttaa. Tekoälyn jäsentämä suunnitelma. Merkinnät: *ehdotus* = tekoälyn suositus; ⏸ = odottaa Emilin päätöstä. **Emil hyväksyi 18.10.2026** (kohdan 10 kysymykset 1–4, 6 ja 7 suositusten mukaan). Jonossa 17b (napautuskorjaus, ei muotomuutosta), 17c (vaihe 1), 17d (vaihe 2); vaiheet 3–4 ⏸ (17e). **Toteutettu: 17b (Appi-appi 72), vaihe 1 (Appi-appi 76, 17c) ja vaihe 2 (Appi-appi 78, 17d).** [Hakemisto](../SUUNNITELMA.md), [2D-pelit](19-2d-pelit-ja-ymparistot.md), [palikan ruudukko](20-palikan-ruudukko.md), [animointi](14-animointi.md).

## 1. Mitä nyt on (tarkistettu koodista 18.10.2026, Appi-appi 63)

- **Kerrokset** (`v.kr`, moottorin osio *Kerrokset*): piirtojärjestys (kerros, sitten palikan `z`), muokkauksen 👁 ja 🔒, este 🧱, ruudukko ▦, käytön ⚙ (näkyy, estää alempien käytön, himmennys, läpinäkyvyys).
- **Parallaksi on jo olemassa rullausvauhtina** (`rv` 0–100, kerroksella ja palikalla; `rvOf`). Se on pelkkä *liike*: hidas kerros liikkuu osan kameran liikkeestä, mutta ei pienene. Palikan oma `rullausvauhti` on ohjattava ominaisuus (nuoli, kaava, Aseta); kerroksen vauhtia ei voi ohjata logiikasta (avoin kysymys TILA:ssa).
- Toteutus: käyttöliittymä siirtää jokaista palikkaa CSS-siirrolla (`applyRV`), moottori ei tiedä siitä. Lukittu kerros (`rv:0`, kojelauta) ei myöskään zoomaudu.
- **Kosketus** käytössä kulkee selaimen oman osumatestin kautta: piirretty palikka ottaa kosketuksen siitä, missä se näkyy, myös siirrettynä. Alimpaankin kerrokseen pääsee, kun mikään sen päällä ei peitä kohtaa eikä ylempi kerros *estä alempien käytön*.
- **Puute (löytö):** Alueen ja Liikkeen napautus (`alueNapautus`, `liikeNapautus`) muuntaa sormen kohdan maailmaan ilman rullausvauhtia. Hitaassa kerroksessa oleva Alue ottaa napautuksen siitä kohdasta, missä se olisi täydellä vauhdilla. Sama koskee esteitä ja törmäyksiä: moottori laskee ne siirtämättömistä paikoista. Syvyys korjaa tämän samalla (kohta 4). **Korjattu Appi-appi 72:ssa (jonon 17b)** napautukselle ja pudotukselle yhdellä moottorin muunnoksella `rvMuunnos`; esteet ja törmäykset ennallaan.

## 2. Vastaukset Emilin kysymyksiin

1. **Voiko kerrokselle antaa syvyyden, josta parallaksi ja koko seuraavat?** Kyllä. Yksi luku riittää: syvyys. Siitä lasketaan sekä rullausvauhti että koko samalla kaavalla, joten ne eivät voi olla ristiriidassa.
2. **Pieneneekö kaikki, kun kerroksen työntää kauemmas?** Kyllä, kaikki kerroksen palikat pienenevät ruudun keskikohtaa kohti ja liikkuvat hitaammin. Emilin päätelmä on oikea: jos jokin ei saa pienentyä, se kuuluu toiseen kerrokseen. Jos halutaan parallaksi ilman pienenemistä, se on nykyinen rullausvauhti, joka säilyy ennallaan. Siis: **rullausvauhti = vain liike, syvyys = liike ja koko.** Erillistä ”älä pienennä” -valintaa ei tehdä (se olisi rullausvauhti toisella nimellä).
3. **Toimiiko kosketus alimpaan kerrokseen asti?** Kyllä, kuten nyt: palikka ottaa kosketuksen siitä, missä se näkyy ja sen kokoisena kuin se näkyy. Pienentynyt taustan nappi on pieni myös sormelle. Alue, Liikkeen napautus, kerroksen ja palikan ruudukko sekä käyttöraahaus muunnetaan kerroksen omiin koordinaatteihin (kohta 4).
4. **Voiko yksittäisellä objektilla olla oma syvyys ilman omaa kerrosta?** Kyllä, samalla tavalla kuin palikalla on jo oma rullausvauhti. Palikka kuuluu edelleen kerrokseen (se ratkaisee piirtojärjestyksen ja kerroksen asetukset), mutta sen oma syvyys ohittaa kerroksen syvyyden. Käytännössä: lähestyvä asia on yksi palikka, jonka syvyys pienenee logiikalla; sille ei tehdä omaa kerrosta. ”Objekti ilman kerrosta” ei ole tarpeen: jokainen palikka on jossain kerroksessa (vähintään Pohja), ja oma syvyys tekee siitä etäisyydeltään vapaan.
5. **Ovatko syvyydet säädettävissä logiikalla?** Kyllä: palikan ja kerroksen `syvyys` on ohjattava ominaisuus kuten muutkin (nuoli, kaava, Aseta-toiminto, Muutos ajassa, Joukon sääntö, animointi). Kerroksen syvyys ohjataan Kerros-palikasta.
6. **Raskauttaako tämä?** Ei merkittävästi, jos se tehdään kuten rullausvauhti nyt: syvyys muuttaa vain palikan piirtomuunnosta (siirto + mittakaava), jonka selain laskee näytönohjaimella ilman uudelleenasettelua. Kuluja on kolme, ja ne hoidetaan (kohta 6). Heti raskasta olisi vain sumeus syvyyden mukaan, joten sitä ei tehdä oletukseksi.

## 3. Malli: yksi luku, yksi kaava

**Syvyys** on luku. 0 = näytön pinnassa (kuten nyt). Isompi = kauempana.

`koko = 100 / (1 + syvyys / 100)` %, ja **rullausvauhti = sama prosentti.** Tämä on oikea perspektiivi: kaksi kertaa kauempana oleva näkyy puolet pienempänä ja liikkuu puolet hitaammin.

| syvyys | koko ja rullausvauhti |
|---|---|
| −50 (etuala) | 200 % |
| 0 (pinta) | 100 % |
| 100 | 50 % |
| 300 | 25 % |
| 900 | 10 % |

- **Negatiivinen syvyys** (alaraja −90) = lähempänä kuin pinta: etualan oksat, jotka liikkuvat sormea nopeammin ja näkyvät isompina. *Ehdotus:* sallitaan, koska se on sama kaava.
- **Katoamispiste on ruudun keskikohta.** Syvä kerros pienenee keskikohtaa kohti. Nykyinen rullausvauhti pysyy ennallaan (sen kiintopiste on ruudun vasen yläkulma), jotta vanhat projektit eivät muutu.
- **Lukittu ruutuun (kojelauta) ei ole syvyys.** Se pysyy rullausvauhdin valintana: ei liiku, ei pienene, ei zoomaudu.
- **Zoomaus** (Kamera-palikka tai sormet) suurentaa kaikkia syvyyksiä samassa suhteessa (kuin objektiivin polttoväli). Kameran liike syvyyssuunnassa on eri asia, ⏸ vaihe 3.
- **Kerroksen asetus on joko rullausvauhti tai syvyys**, ei molempia: kerrosrivin nykyinen rullausvauhti-valikko laajenee: *sormen mukana / 75 / 50 / 25 % / lukittu* + *syvyys: pinnassa / 100 / 300 / 900 / oma*. Palikalla sama: *kerroksen mukaan* tai oma rullausvauhti tai oma syvyys. Etusija: palikan oma (kumpi tahansa) ennen kerroksen.
- Toimii laitenäkymässä kuten rullausvauhti nyt (kamera tarvitaan). Muissa näkymissä syvyys ei tee mitään, ja paneeli kertoo sen.

## 4. Mitä kaikki näkevät ja tekevät

### 4.1 Rakentaja (muokkaus)

- Kerrosrivillä syvyysvalikko (kohta 3). Rivillä näkyy pieni merkintä, esim. *syvyys 300 · 25 %*.
- **Muokatessa näkyy syvyys** (*ehdotus*): syvä kerros näytetään kuten se näkyy käytössä alkuhetkellä (kamera laitteen kehyksen kohdalla), pienennettynä kehyksen keskikohtaa kohti. Muokkauskanvaasin vierittäminen ei liikuta kerroksia toisiinsa nähden (ei parallaksia muokatessa, jotta asettelu pysyy rauhallisena). Raahaus, koon muutos ja valintalaatikko toimivat kerroksen omissa koordinaateissa. ⏸ Vaihtoehto: muokatessa litteä kuten nyt rullausvauhdilla, ja nappi *Näytä syvyys*.
- **Kun syvyyttä muutetaan jälkikäteen**, sisältö pienenee (Emilin linja). ⏸ Lisänappi *Säilytä näkyvä koko*: syvyyttä muutettaessa appi suurentaa kerroksen palikoiden paikat ja koot niin, että alkukuva näyttää samalta mutta parallaksi muuttuu. Kertaluonteinen muokkaus, Kumoa toimii. *Ehdotus:* tehdään vaiheessa 1, koska taustan syvyyden hakeminen on muuten raskasta käsityötä.
- Palikan paneelin *Paikka ja koko* -osion Rullausvauhti-valinta saa rinnalleen *Oma syvyys*.

### 4.2 Logiikka

- Ominaisuus **`syvyys`** (luku, ohjattava) kaikille näkymäpalikoille rekisteriin `PROPS` (A2). Perusarvo = palikan oma, muuten kerroksen.
- Lukuominaisuus **`näkyväkoko`** (%, ei ohjattava): `100 / (1 + syvyys/100)`, kaavoja varten (esim. ääni hiljenee, vauhti hidastuu, pisteet kaukaisesta osumasta). Nimi ⏸.
- **Kerros-palikka** saa ominaisuuden `syvyys` (ohjattava), joten kerroksen voi tuoda lähemmäs logiikalla. Kerroksen rullausvauhti jää ohjaamatta (nykyinen avoin kysymys ratkeaa syvyyden kautta).
- Syvyys on tavallinen luku, joten peli voi käyttää sitä mihin tahansa kaavan kautta. Uusia tapahtumia ei tehdä. *Ehdotus:* ei tapahtumaa ”ohitti pinnan”; KUN-ehto `syvyys < 0` riittää.

### 4.3 Käyttäjä (käyttö)

- Rullatessa ja kameran seuratessa syvät kerrokset liikkuvat hitaammin ja ovat pienempiä, etuala nopeammin ja isompana.
- Kosketus: palikka ottaa kosketuksen näkyvästä kohdastaan ja koostaan, alimpaan kerrokseen asti. **Korjaus samalla:** Alueen ja Liikkeen napautus, kerroksen ruudukon ja palikan oman ruudukon (F36) ruutu sekä käyttöraahauksen pudotus muunnetaan sormen kohdasta kyseisen kerroksen tai palikan omiin koordinaatteihin (käänteinen siirto ja mittakaava). Tämä korjaa myös nykyisen rullausvauhtikerroksen napautuksen (kohta 1, puute).

### 4.4 Piirtojärjestys

- Kerros ratkaisee ensin (Emilin oma järjestys), sitten **saman kerroksen sisällä syvempi taakse**, sitten `z`. Koska kaikilla kerroksen palikoilla on oletuksena sama syvyys, nykyiset projektit eivät muutu.
- Seuraus: kauempaa lähestyvä palikka tulee oman kerroksensa muiden palikoiden eteen ohittaessaan ne, mutta ei ylemmän kerroksen eteen. Jos sen pitää ohittaa kaikki, se laitetaan ylimpään kerrokseen, jonka edessä sen pitää voida näkyä. ⏸ Vaihtoehto: kerrosvalinta *Järjestä kerrokset syvyyden mukaan* (kerrosjärjestys seuraa syvyyksiä). *Ehdotus:* ei, koska se veisi Emilin oman järjestyksen.

### 4.5 Törmäykset ja esteet

- Moottori ei laske 3D:tä. **Esteet, törmäykset ja Alueen sisällä-olo lasketaan kunkin palikan kerroksen omissa koordinaateissa**, kuten nyt. Syvä taustakerros ei ole este, ellei sitä laiteta esteeksi.
- Paneeli varoittaa, jos esteeksi merkityn kerroksen tai palikan syvyys eroaa liikkujan syvyydestä (”este on eri syvyydellä kuin Pelaaja: törmäys tapahtuu eri kohdassa kuin näkyy”).
- Jos peli haluaa törmäyksen vain lähes samalla syvyydellä (esim. lähestyvä este osuu vasta pinnassa), se tehdään kaavalla *törmäsi*-tapahtuman ehdossa, esim. `jos @este.syvyys < 10`. Ei uutta sääntöä.

## 5. Vaiheet (*ehdotus*)

| Vaihe | Sisältö | Tallennusmuoto | Hyväksymiskoe |
|---|---|---|---|
| 1 | (Napautuksen muunnos tehdään ensin omana kohtana 17b, ei muotomuutosta.) Kerroksen syvyys: valikko, koko ja rullaus kaavasta, muokkausnäkymä alkuhetkestä, *Säilytä näkyvä koko*, kosketuksen ja napautuksen muunnos (myös nykyinen rullausvauhti), kerroksen ruudukon piirto syvyydessä, karsinta syvyydelle | **laajenee**: kerroksen `sy` (luku) | kolmen kerroksen tausta (900, 300, pinta) vierittyy oikein; Alueen napautus syvässä kerroksessa osuu näkyvään kohtaan; zoomaus ja kojelauta ennallaan; vanha projekti näyttää täsmälleen samalta |
| 2 | Palikan oma syvyys, ominaisuudet `syvyys` ja `näkyväkoko`, Kerros-palikan `syvyys`, järjestys kerroksen sisällä | **laajenee**: palikan `sy`, Kerros-palikan ohjauskohta | palikka lähestyy Muutos ajassa -palikalla 900 → 0 ja ohittaa saman kerroksen palikat; kosketus seuraa kokoa; Joukon sääntö syvyydelle |
| 3 ⏸ | Kameran syvyys (kamera liikkuu eteenpäin: lähellä oleva kasvaa nopeammin kuin kaukainen; kameran taakse jäävä piiloon) | **laajenee**: Kamera-palikan `syvyys` | lentäminen tähtikentän läpi |
| 4 ⏸ | Ilmaperspektiivi: himmennys tai värin haalistuminen syvyyden mukaan (kevyt, läpinäkyvyys ja värin sekoitus; ei sumeutta oletuksena) | laajenee: kerroksen valinta | ei hidasta 60 kuvaa/s Headmazessa |

Jokainen vaihe on erillinen jonokohta ja muuttaa tallennusmuotoa, joten se rakennetaan kaksikaistaisessa työssä yksi kerrallaan muiden muotomuutosten kanssa (TILA:n kaistasääntö). Varmuuskopio ennen.

## 6. Keveys

- **Piirto:** sama kuin rullausvauhti nyt: yksi `transform` per palikka kuvaa kohti, ei asettelua. Mittakaava lisää vain `scale`-osan.
- **Karsinta:** nyt hidasta kerrosta ei karsita (`cullOut` ohittaa `rv < 100` -palikat). Syvyydellä karsinta lasketaan kerroksen näkyvästä ikkunasta (ruutu jaettuna koolla), joten syvät kerrokset karsitaan kuten pinta. Ilman tätä iso syvä tausta hidastaisi.
- **Järjestys:** kerroksen sisäinen järjestys lajitellaan uudelleen vain, kun jonkin palikan syvyys muuttui niin, että järjestys vaihtuu, ei joka kuvassa.
- **Moottori:** syvyyttä ei arvioida joka kuvassa, ellei sitä ohjata (jonon 1p:n nopea polku: perusarvoissaan oleva palikka luetaan suoraan).
- **Ei oletuksena:** sumeus (`filter: blur`) on raskas puhelimessa; jos sitä halutaan, se on vaiheen 4 erillinen valinta.
- Mittaus `testit/mittaa_keveys.py`: Headmaze ja +750 seinää kolmen syvyyskerroksen kanssa; raja sama kuin `selain_91_keveys` (vähintään 30 kuvaa/s).

## 7. Suhde muihin suunnitelmiin

- **[19 2D-pelit](19-2d-pelit-ja-ymparistot.md):** suunnitelma sanoo ”parallaksi on jo kerroksen rullausvauhti”. Syvyys on sen luonteva jatko tasoloikan taustoille (vuoret 900, puut 300, pelikenttä pinnassa). Laattakartta (vaihe C) voi olla syvässä kerroksessa koristeena; laattaeste kuuluu samalle syvyydelle kuin pelaaja (kohta 4.5). Pikselitarkka (vaihe E) syvässä kerroksessa: mittakaava ei ole kokonaisluku, joten pikselit ovat epätasaisia; *ehdotus:* syvässä kerroksessa Pikselitarkka pyöristää mittakaavan lähimpään 1/n:ään tai siitä varoitetaan. Painovoima ja hyppy eivät riipu syvyydestä. Riippumaton: kumpi tahansa voidaan rakentaa ensin.
- **[20 palikan ruudukko](20-palikan-ruudukko.md):** palikan oma ruudukko kulkee jo palikan mukana; syvyydessä se pienenee palikan mukana. Napautettu ruutu lasketaan samasta käänteismuunnoksesta kuin kohdan 4.3 kosketus. Jos 15b rakennetaan ensin, syvyyden vaihe 1 lisää siihen muunnoksen; jos syvyys ensin, 15b käyttää valmista muunnosta.
- **[14 animointi](14-animointi.md):** syvyys on tavallinen ohjattava luku, joten animointi ja Muutos ajassa toimivat sille ilman erityiskohtaa.
- **23 Autopeli (a) kameran kierto:** syvyys ja kierto ovat yhdistettävissä (kierto ensin, sitten syvyysmittakaava keskikohdasta), mutta ne muuttavat samaa `applyRV`-kohtaa: ei rinnakkain eri kaistoilla.
- **F23 vienti:** syvyys on moottorin ja käyttöliittymän yhteistä tietoa kuten rullausvauhti; viety appi saa sen sellaisenaan.

## 8. Rajaukset

Ei 3D-mallinnusta, ei kallistusta eikä perspektiivivääristymää (palikka pysyy litteänä kuvana, joka vain pienenee), ei valaistusta eikä varjoja, ei törmäyksiä syvyyssuunnassa (kohta 4.5), ei syvyyttä muissa kuin laitenäkymissä.

## 9. Linjakkuus

- **A5 yhteinen ominaisuus, ei uusi palikka:** syvyys on kerroksen ja jokaisen näkymäpalikan ominaisuus, kuten rullausvauhti nyt. Ei erikoispalikkaa, ei rekisteririviä `PALIKKASAANNOT.md`:hen.
- **A2 ominaisuusrekisteri:** `syvyys` (ohjattava), `näkyväkoko` (vain luku). Kerros-palikan poikkeus (✦) laajenee yhdellä ohjattavalla kohdalla.
- **Yksi opittava sääntö:** syvyys antaa sekä koon että liikkeen samasta kaavasta. Rullausvauhti säilyy erillisenä ”vain liike” -valintana, koska vanhat projektit käyttävät sitä ja kojelauta tarvitsee sen.
- **Ei uutta poikkeusta kosketukseen:** kosketus noudattaa näkyvää kohtaa, kuten nyt näkyvässä palikassa.

## 10. Avoimet kysymykset Emilille

**Emil 18.10.: hyväksyn.** Kysymykset 1–4, 6 ja 7 ratkaistu ehdotusten mukaan (muokatessa alkuhetken kuva; *Säilytä näkyvä koko* vaiheessa 1; etuala sallittu, alaraja −90; kerros ensin, sen sisällä syvyys; jonossa ennen 2D-vaihetta C; nimi `näkyväkoko`). Kysymys 5 (vaiheet 3–4) odottaa yhä.

1. ⏸ Muokatessa: näkyykö syvyys alkuhetken kuvana (*ehdotus*) vai litteänä ja napista *Näytä syvyys*?
2. ⏸ *Säilytä näkyvä koko* -nappi syvyyttä muutettaessa: tehdäänkö vaiheessa 1 (*ehdotus* kyllä)?
3. ⏸ Sallitaanko negatiivinen syvyys eli etuala (*ehdotus* kyllä, alaraja −90)?
4. ⏸ Piirtojärjestys: kerros ensin ja sen sisällä syvyys (*ehdotus*), vai valinta, jolla kerrokset järjestyvät syvyyden mukaan?
5. ⏸ Vaiheet 3 (kameran syvyys) ja 4 (ilmaperspektiivi): tehdäänkö, ja milloin?
6. ⏸ Jonon paikka: *ehdotus* vaiheet 1–2 jonon nykyisten muotomuutosten perään, ennen 2D-vaihetta C (laattakartta), jotta tasoloikan taustat saavat syvyyden suoraan.
7. ⏸ Lukuominaisuuden nimi: `näkyväkoko` vai jokin muu?

## 11. Jatkoluonnos: syvyys kolmantena akselina (Emilin kysymys 18.10. klo 14.30, **ei hyväksytty, ei jonossa**)

**Kysymys:** voiko syvyydestä tulla oikea kolmas akseli, jolla on painovoima ja liikeradat? Esimerkkinä frisbeegolf: sama väylä ylhäältä karttana ja samaan aikaan heittäjän silmin, ilman 3D-grafiikkaa. Pelkkä 3D-laskenta kertoisi, missä ja minkä kokoisena kukin asia näkyy.

**Vastaus: onnistuu, eikä matka ole pitkä.** Tämä on niin sanottua kuvakorttien 3D:tä (1990-luvun alun pelien tapa): jokainen asia on litteä kuva, jolla on paikka (x, korkeus, matka), ja se piirretään oikeaan kohtaan oikean kokoisena. Kohdan 3 kaava on jo oikea perspektiivi. Kun maan taso on ruudun keskikohdan alapuolella, kauempana oleva asia siirtyy kohti horisonttia ja pienenee juuri niin kuin pitääkin. Vaiheet 1–3 tekevät siis jo kuvan. Kolme asiaa puuttuu:

1. **Liike syvyyssuunnassa (vaihe 5).** Liikkeelle syvyysnopeus `us` ja sille vastus. Painovoima on 2D-suunnitelman vaihe A (Alueen ominaisuus, suunta alas), ja se toimii sellaisenaan: silmistä katsottuna ruudun pystyakseli on korkeus. Maa on Alue tai raja korkeudelle 0. Palikalle tulee **paksuus syvyydessä**, ja törmäys tapahtuu vain, kun myös syvyydet ovat päällekkäin. Silloin kiekko ohittaa puun, joka on samassa ruudun kohdassa mutta eri matkalla.
2. **Kamera, jolla on paikka ja suunta (vaihe 6).** Kamera-palikalle paikka (x, korkeus, matka) ja kääntö vaakatasossa. Palikka, jolle valitaan *paikka maailmassa*, piirretään kameran läpi: ruudun kohta ja koko lasketaan kameraan nähden, kameran taakse jäävä piilotetaan ja järjestys tulee etäisyydestä. Muut palikat (kojelauta, napit) pysyvät litteinä kuten nyt.
3. **Kaksi näkymää samasta maailmasta (vaihe 7).** Sama maailma ylhäältä: toinen kamera, joka katsoo suoraan alas (x ja matka → ruutu). ⏸ Kaksi tapaa: (a) **jo nyt kaavoilla**, jolloin kartan merkin x = `@kiekko.x` ja y = `@kiekko.syvyys / 10`, eli kartta on nukke, joka seuraa samoja arvoja; (b) yleinen ominaisuus, jossa näkymä voi näyttää toisen näkymän maailman omalla kamerallaan. *Ehdotus:* ensin (a) koeapissa, (b) vasta jos (a) osoittautuu kömpelöksi. Rata rakennetaan karttanäkymässä (puut ja kori paikoilleen ylhäältä), ja silmistä katsottu näkymä lasketaan siitä. Näin 3D-maailmaa ei tarvitse muokata 3D:nä.

**Frisbee itse on preset, ei moottorin erikoisuus** (yleiskäyttöisyysperiaate). Lento (nosto, vastus, kaartuminen ja loppukaarto vauhdin mukaan) rakennetaan kaavoilla ja Muutos ajassa -palikoilla Liikkeen syvyys- ja sivunopeuteen. Kallistus näkyy niin, että kiekko on ellipsi, jonka korkeus ja kierto tulevat kallistuksesta kaavalla. Kaikki tämä on jo olemassa.

**Raskaus:** ei ongelma tällaisessa pelissä. Jokainen maailmaan sijoitettu palikka vaatii kuvaa kohti muutaman kertolaskun ja yhden piirtomuunnoksen, ja järjestys lajitellaan etäisyyden mukaan. Satoja palikoita mahtuu 60 kuvaan sekunnissa. Raskaaksi menisi vasta se, mitä ei tehdä: maaston mäet ja kuopat, varjot, valaistus, peittävät seinät ja kallistuva kamera.

**Rajat rehellisesti:** maa on tasainen (mäet olisivat oma suuri työnsä), asiat ovat aina kameraan päin käännettyjä kuvia (puun voi kiertää, mutta se näyttää joka suunnasta samalta), eikä isoja seiniä tai taloja voi kulkea sisältä. Frisbeegolfiin ja moneen pallopeliin tämä riittää, mutta 3D-räiskintään ei.

**Järjestys (*ehdotus*):** vaiheet 5–7 vasta jonon 17d:n ja 2D-vaiheen A (painovoima) jälkeen, koska ne rakentuvat molempien päälle. Ennen rakentamista tämä tarvitsee oman suunnitelman (kamerasuunta, maailmapaikan tallennus, kartan vaihtoehto a/b) ja Emilin hyväksynnän. Koeappi on frisbeegolfväylä projektina master-tiedotiin.

## Testit

Moottori: koko ja rullausvauhti syvyydestä (−50, 0, 100, 300, 900), etusija palikka > kerros ja syvyys/rullausvauhti, `syvyys` ohjattavana (nuoli, kaava, Aseta, Muutos ajassa, Joukon sääntö), `näkyväkoko`, Kerros-palikan `syvyys`, tallennus ja vanhan projektin avaus, kerroksen sisäinen järjestys. Selain (1440 ja 1280 px, käyttönäkymä 390 px): kolmen syvyyskerroksen vieritys ja kameran seuranta, zoomaus, kojelauta ennallaan, napautus syvän kerroksen palikkaan ja Alueeseen osuu näkyvään kohtaan, ruudukon ruutu syvyydessä, käyttöraahaus syvässä kerroksessa, muokkausnäkymän raahaus syvässä kerroksessa, *Säilytä näkyvä koko* ja Kumoa, vanha rullausvauhtiprojekti piirtyy täsmälleen ennallaan, keveysraja.
