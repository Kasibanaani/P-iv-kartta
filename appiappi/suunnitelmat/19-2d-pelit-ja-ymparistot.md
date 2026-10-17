# F35 2D-pelit ja ympäristöt: painovoima, hyppy, laatat ja rakennuslaatikko

17.10.2026. **Emilin idea** (viestit 17.10. klo 23.49–23.52 Suomen aikaa): pelirakennuspalikoita visuaaliselle puolelle, seiniä laatikoista, pikseliulkoasu, laatikot paikalleen ”klik klik” Masterin mallin mukaan (muuten Masterin asioilla ei korvata mitään), 2D-tasoloikka (ponnistusvoima, liikkeen ja hypyn yhteisvaikutus lentorataan), päälle astuminen laukaisee asioita, ja oma kelluva, auki pysyvä valikko ympäristöjen rakentamiseen. Tekoälyn jäsentämä suunnitelma. Merkinnät: *ehdotus* = tekoälyn suositus; ⏸ = odottaa Emilin päätöstä. **Ei toteutettu.** [Hakemisto](../SUUNNITELMA.md), [massa ja törmäykset](09-massa-ja-tormaykset.md), [peliohjain](17-peliohjain.md), [värit](18-varit-ja-paletit.md), [animointi](14-animointi.md).

## 1. Emilin kysymys: riittääkö, että painovoima käännetään päälle?

**Melkein, ei ihan.** Painovoima on tasoloikan perusta, ja suurin osa muusta toimii sen jälkeen niin kuin nyt: esteet pysäyttävät, katto pysäyttää nousun, massa ja kimmoisuus toimivat (Appi-appi 17), kamera seuraa. Painovoimaksi riittää jatkuva kiihtyvyys töytäisyvauhtiin (`ux`, `uy`), joka on jo olemassa. Kuusi asiaa puuttuu, ja ilman niitä tasoloikka ei tunnu oikealta:

1. **Kitka syö putoamisen.** Nykyinen kitka hidastaa töytäisyvauhtia kaikkiin suuntiin (50 % = 750 px/s²). Painovoimassa kitka saa koskea vain maassa ja vain maan suuntaista liikettä; ilmassa on erillinen ilmanvastus (oletus 0).
2. **Ohjaus lentäisi.** Tatin y ohjaa nyt pystyliikettä. Painovoimassa ohjaus koskee vain painovoimaa poikittaista akselia; pystysuunta kuuluu painovoimalle.
3. **Maassa-tieto puuttuu.** Hyppy saa lähteä vain maasta, ja moni asia (laskeutuminen, päälle astuminen, putoamisvaurio) tarvitsee tiedon, milloin hahmo seisoo jonkin päällä.
4. **Hyppy.** Nyt hypyn voi tehdä toiminnolla Aseta `vauhti y` = −700, mutta se toimisi myös ilmassa. Tarvitaan Liikkeelle tapahtumakohta *hyppää*, ponnistus, lyhyt hyppy napin irrotessa ja pieni armoaika (”coyote time”), jotka tekevät pelistä reilun.
5. **Tasainen aika-askel.** Hypyn korkeus ei saa riippua näytön virkistystaajuudesta (60 Hz kone, 120 Hz iPhone). Painovoiman kappaleet lasketaan kiinteällä 1/120 s askeleella.
6. **Seinät ja tasot kevyesti.** Headmazen sokkelossa on 118 erillistä Muotoa. Toimii, mutta raskas rakentaa ja muokata. Tarvitaan laattakartta, jota maalataan klik klik (Masterin karttaeditorin malli).

Lisäksi (ei välttämätön, mutta tekee rakentamisesta mukavaa): kelluva rakennuslaatikko (kohta 7), pikseliulkoasu (kohta 6) ja tietokoneen näppäimistö syötteeksi (F33 vaihe 4, kohta 8).

**Painovoiman paikka: Alue.** Emil kysyi, voiko painovoiman kääntää ”siinä osassa kanvaasia”. Alue on juuri se: Alue-palikka saa osion *Painovoima* (voima ja suunta). Koko maailma = yksi iso Alue (esim. kameran rajojen Alue). Koska Alue on palikka, painovoima on tavallinen ominaisuus: `alue.painovoima` ja `alue.suunta` ovat kaavalla luettavia ja toiminnolla asetettavia. **Painovoiman kääntäminen on siis yksi Aseta-toiminto** (suunta: ylös), ja hahmon maassa-tieto, hyppy ja ohjaus kääntyvät mukana, koska ne lasketaan painovoiman suhteen. Tikkaat ja vesi syntyvät samasta: tikkaiden Alue = painovoima 0 (silloin tatin y taas kiipeää), veden Alue = pieni painovoima ja ilmanvastus. Päällekkäisistä Alueista päällimmäinen voittaa (*ehdotus*; summa olisi fysiikkaa, mutta ”tässä kohtaa painovoima on ylöspäin” on silloin vaikea rakentaa).

## 2. Nykytila (tarkistettu koodista 17.10.2026, Appi-appi 43)

- **Liike** (`liikeAskel`, moottori): ohjausvauhti `vx, vy` (Tatti, Napautus, Auto, Reitti, Ruutu, nuolet), liukkaus, kiihtyminen ja jarrutus; töytäisyvauhti `ux, uy` hiipuu kitkan mukaan (`3000·(kitka/100)²`). Törmäys `liikuta` + `osumaTyonto` (laatikko ja ympyrä), normaalit `osumaNormaali`. Massat parit `fysParit`, alivaiheet `fysAlivaiheet`, törmäsi-tapahtuma tiedoin `kohde`, `isku`.
- **Este**: näkymäpalikan `b.este` tai kerroksen `k.este` (kaikki kerroksen palikat). `esteet(vw)` käy läpi kaikki näkymän palikat joka kuvassa.
- **Ruudukko** on kerroksen ominaisuus (`k.rk` ruutukoko, kohdistus, `ruutux/ruutuy`). Ruutuihin ei voi maalata mitään.
- **Alue**: tunnistaa sisällä olevat (keskipiste), arvot sisällä/montako, tapahtumat *astuttu* ja *poistuttu*, ruudukolla `rx, ry`.
- **Kuva** ja **kuvasarja** (Appi-appi 4) ovat olemassa; kuvat skaalautuvat pehmeästi (ei pikselöintiä).
- **Presetit ja suosikit** (F26, Appi-appi 22) ovat olemassa: tavallisia, avattavia palikkayhdistelmiä.
- **Ei painovoimaa, ei maassa-tietoa, ei hyppyä, ei laattoja, ei käyttäjän apin näppäimistösyötettä** (näppäimistö on F33:n vaihe 4).
- **Master** (`master/index.html`, `P.maps`, ”maailmat”): ruudukko, johon maalataan *tekijöitä* (`k:'wall'|'zone'`, ruudut `cells:['x,y']`). Sivellin 1, 2×2, 3×3 tai Täyttö; ensimmäinen ruutu päättää, lisätäänkö vai poistetaanko; raahaus maalaa viivan; Pyyhi; tekijä voi olla näkymätön ja voimassa vain sääntöjen pätiessä (ovi on este, kunnes avain on valittu). Tästä otetaan **maalaustapa**, ei tietomallia.

## 3. Painovoima ja maassa (vaihe A)

**Alue → osio Painovoima** (suljettu, kunnes avataan):
- **Painovoima** px/s² (tyhjä = ei painovoimaa; tavallinen arvo 1800–2500). Paneeli näyttää eläviä lukuja: ”putoaa 100 px 0,3 s:ssa”.
- **Suunta**: alas (oletus), ylös, vasen, oikea. Myöhemmin kulma, jos tarvitaan (planeetat ym. eivät kuulu tähän).
- **Ilmanvastus %** (oletus 0): hidastaa kaikkea liikettä alueella (vesi, avaruus 0).
- Koskee Alueen tunnistamia liikkuvia (`b.kuka` tai kaikki), keskipisteen mukaan kuten nyt.

**Liike → osio Painovoima** (näkyy, kun kohde on painovoimallisella Alueella tai sitä on muutettu):
- **Painovoima %** (oletus 100; 0 = ei välitä, esim. lintu, liikkuva taso; 50 = kuu).
- **Kitka koskee vain maata** automaattisesti, kun kappale on painovoimassa (ks. kohta 1). Ylhäältä kuvatussa pelissä kaikki on maata, joten vanha käytös ei muutu.
- **Ohjaus vain poikittain** automaattisesti painovoimassa. Ohjauksen pystyosa ei katoa, vaan sen saa luettua kaavassa (`tatti.pysty`), esim. kyykkyyn tai tikkaille.

**Logiikkaan** (ominaisuusrekisteriin `omat`, säännöt A2–A4):
- Liike: **`maassa`** (kyllä/ei; seisoo jonkin päällä painovoiman suhteen), **`alla`** (sen nimi, jonka päällä seisoo: palikan nimi tai laatan laji), **`putoamisvauhti`** (px/s painovoiman suuntaan), `painovoima` (%), `ilmassa` vain jos tarpeen (= ei maassa, ei lisätä erikseen).
- Liikkeen tapahtumat: **laskeutui** (tiedot `kohde`, `isku` = putoamisvauhti osumahetkellä → putoamisvaurio) ja **irtosi maasta** (hyppy tai putoaminen reunalta).
- Alue: `painovoima`, `suunta`, `ilmanvastus` ominaisuuksina.

**Päälle astuminen** (Emil 17.10.): kolme reittiä, kaikki tavallista logiikkaa:
- *Alueelle* astuminen toimii jo (*astuttu*). Painelaatta = pieni Alue lattialla.
- *Toisen palikan päälle* laskeutuminen: Liikkeen *laskeutui*, `tapahtuma.kohde` = mihin. Vihollisen litistys: KUN pelaajan Liike laskeutui ja `tapahtuma.kohde` = vihollinen → piilota vihollinen, pomppaa (Aseta `vauhti y`).
- *Törmäsi*-tapahtumaan tieto **`tapahtuma.puoli`** (ylhäältä, alhaalta, sivulta painovoiman suhteen; ilman painovoimaa ylä/ala/vasen/oikea ruudun suhteen). Mario-sääntö: osuma sivulta = vahinko, ylhäältä = litistys. Sama tieto kertoo, että pää osui laattaan alhaalta (tiiliskivi rikki).
- *Laatalle* astuminen: vaihe D.

**Törmäämällä laukaiseminen ja osumavoima** (Emil 17.10.): *törmäsi* on jo olemassa (Appi-appi 17) tiedoin `kohde` ja `isku` (lähestymisnopeus px/s). Lisätään tietoon **`tapahtuma.voima`** = törmäyksen impulssi `j = (1 + e) · v_rel / (1/mA + 1/mB)`, eli massa × nopeudenmuutos. Moottori laskee sen jo (`fysParit`, muuttuja `jj`), joten lisäys on pari riviä. Massaton osapuoli lasketaan äärettömäksi (seinä): silloin voima = `(1 + e) · v_rel · m`. Jos kummallakaan ei ole massaa, `voima` = `isku` (massa 1). Rakentajalle: raskas ja nopea lyö kovaa, kevyt ja hidas hipaisee. Käyttö: KUN törmäsi ja `tapahtuma.voima > 500` → laatikko hajoaa, vähennä kestävyyttä `tapahtuma.voima / 100`. Sama `voima` myös *laskeutui*-tietoon (putoamisvaurio massan mukaan).

**Moottori:** painovoima lisätään `ux, uy`:hen ennen siirtoa; maassa = tämän askeleen osumanormaaleista jokin osoittaa painovoimaa vastaan (kosini > 0,7, eli enintään noin 45° kalteva; käytännössä laatikot ja ympyrät). Painovoiman kappaleet lasketaan kiinteällä askeleella 1/120 s (kertymä `acc`, enintään 8 askelta kuvassa, ettei taustalle jäänyt välilehti räjähdä). Kitka: maassa poikittainen osa hidastuu kuten nyt, ilmassa vain ilmanvastus. Kuvasilmukka pysyy käynnissä, kun painovoiman kappale ei ole maassa.

## 4. Hyppy (vaihe B)

**Liike → osio Hyppy** (avautuu, kun *hyppää*-kohtaan tulee nuoli tai osio avataan):
- **Hypyn korkeus** px (oletus 3 × kohteen korkeus). Paneeli näyttää ponnistusnopeuden: ”= ponnistus 690 px/s, ilmassa 0,7 s”. Ponnistus lasketaan `v₀ = √(2·g·h)`, joten korkeus pysyy samana, vaikka painovoimaa muutetaan. Ominaisuus **`hyppy`** (korkeus) on kaavalla ohjattava: ladattava hyppy = Sekuntikello + Kaava → `hyppy`.
- **Ilmaohjaus %** (oletus 60): kuinka paljon ohjaus vaikuttaa ilmassa. 0 = ”realistinen”: lähtövauhti ratkaisee, lentorata on puhdas paraabeli (vaakavauhti × aika, pystyssä painovoima). 100 = ohjaus kuten maassa.
- **Lyhyt hyppy** (oletus päällä): tapahtuma *lopeta hyppy* (napin irti) leikkaa nousuvauhdin 40 %:iin. Sama nappi, pitkä painallus = korkea hyppy.
- **Hyppyjä ilmassa** (oletus 0; 1 = tuplahyppy). Ominaisuus `hyppyjä jäljellä`.
- Hienosäätö (suljettuna): **armoaika** 0,1 s (hyppy käy vielä reunalta pudottua), **ennakko** 0,1 s (juuri ennen laskeutumista painettu hyppy tehdään laskeutuessa).

**Tapahtumakohdat sisään:** *hyppää*, *lopeta hyppy*. **Ulos:** *hyppäsi*. Hyppy lähtee painovoimaa vastaan, joten käännetty painovoima toimii itsestään.

**Liikkeen ja hypyn yhteisvaikutus (Emilin kysymys):** maassa juostessa kertynyt vaakavauhti (kiihtyminen, liukkaus) säilyy hypyssä, koska vaaka- ja pystyliike lasketaan erikseen; ilmaohjaus määrää, kuinka paljon sitä voi muuttaa ilmassa. Juoksuhyppy kantaa siis pidemmälle kuin paikaltaan hyppy, ilman erillistä sääntöä. Massa ei vaikuta hyppyyn (kuten oikeasti: painovoima kiihdyttää kaikkia yhtä paljon); massa vaikuttaa vain törmäyksiin.

## 5. Laatat ja maalaus klik klik (vaiheet C ja D)

**Uusi näkymäpalikka Laattakartta** (laji `laatat`, näyttö): ruudukko, johon maalataan laattoja. Yksi palikka = yksi kartta, joten sillä on näkymäpalikan yhteiset asiat (paikka, koko, näkyy kun, kerros, siirto, animointi). Taustakuvio ja kiinteä maasto voivat olla eri karttoja eri kerroksissa.

- **Ruutukoko** px (oletus 32) ja koko ruutuina (enintään 200 × 200, kuten Masterissa).
- **Laattalajit** (kartan omat, kuten Tietotaulukon sarakkeet): nimi, ilme (väri paletista 1–8 tai pikselikuva, vaihe E), **kiinteä** (este) / **läpi** / **taso** (läpäistävä alhaalta, voi seistä päällä), kimmoisuus, kitka. Oletuksena kaksi: *Seinä* (kiinteä) ja *Koriste* (läpi).
- **Maalaus** (Masterin malli): valitse kartta → työkalurivi: laattalajit, Pyyhi, sivellin 1 / 2×2 / 3×3 / Täyttö, viiva vaihto-näppäimellä. Ensimmäinen ruutu päättää, lisätäänkö vai poistetaanko; raahaus maalaa. Tietokoneella oikea painike pyyhkii ja numerot 1–9 valitsevat lajin. Yksi veto = yksi Kumoa. Esc lopettaa maalauksen.
- **Este laatoista:** kiinteät laatat ovat esteitä kuin samankokoiset laatikot, mutta moottori hakee vain liikkujan kohdalla olevat ruudut (ei käy kaikkia läpi). Vierekkäiset ruudut eivät saa nykiä (tunnettu ”sauma”-ongelma: liikkuja ei saa jäädä kiinni kahden laatan rajaan; ratkaisu ratkaistaan akseli kerrallaan). Taso on este vain ylhäältä tultaessa, ja *alas*-ohjaus (tatti alas + hyppy) pudottaa läpi.
- **Piirto:** yksi `<canvas>` per kartta, piirretään vain kun ruudut muuttuvat; kamera siirtää valmista kuvaa. Ei DOM-elementtiä per laatta.
- **Kaavaan:** `kartta.määrä.<laji>` (montako laattaa; kolikoita jäljellä), `kartta.leveys`, `kartta.korkeus` (ruutuina).

**Vaihe D: laattojen vuorovaikutus**
- Laattakartan tapahtumat **astuttu** ja **poistuttu** (kuten Alueella; vain lajeille, joilla rasti *ilmoittaa*), tiedot `laji`, `x`, `y` (ruutu), `kuka`. Kolikko, piikit, maali, portti.
- **Liikkeen `alla`** antaa laatan lajin (jää, laava, trampoliini). *Törmäsi* laattaan: `tapahtuma.kohde` = laji, `tapahtuma.puoli` kertoo, osuiko pää.
- **Toiminto Maalaa laatta** (kartta, x, y, laji tai tyhjä): rikkoutuva tiili, kerätty kolikko, ovi aukeaa. Muutos on käyttötietoa (kuten taulukon rivit), joten Palauta palauttaa kartan rakentajan maalaamaksi.

**Headmaze koetapauksena:** 119 Muotoa → yksi 15 × 15 Laattakartta (laji Seinä) ja 12 porttia → laji Portti (läpi, ilmoittaa). Portin *astuttu* + Jonon 15d *Vie palikka* = teleportti kahdella palikalla. Painovoimaa ei tarvita: laatat palvelevat myös ylhäältä kuvattuja pelejä, kalenteriruudukkoa ja pohjapiirroksia.

## 6. Pikseliulkoasu (vaihe E) ⏸

- **Pikselikuva:** pieni piirtoruudukko (8, 16 tai 32 px) laattalajin ilmeeksi ja Kuva-palikalle. Värit = projektin kahdeksan palettiväriä + läpinäkyvä, joten pikselikuvat seuraavat teemaa ja F34:n palettia. Piirto samalla siveltimellä kuin laatat. Tallennus tiiviinä merkkijonona (yksi merkki per pikseli, 16 × 16 = 256 merkkiä).
- **Näkymän asetus Pikselitarkka:** kuvat skaalautuvat teräväreunaisina (`image-rendering: pixelated`), paikat ja kamera pyöristyvät kokonaisiin maailman pikseleihin, zoomaus kokonaislukuportain. Halpa ja nopea.
- ⏸ Kysymys Emilille: tarkoittaako pikseliulkoasu **(a) omien pikselikuvien piirtämistä appissa ja terävää esitystä** (*suositus*, molemmat yllä) vai (b) vain terävää esitystä muualla tehdyille kuville? Vaihe ei estä muita.

## 7. Rakennuslaatikko: kelluva paletti (vaihe F)

Emilin toive: oma valikko, joka pysyy auki, kelluu ja siirtyy pois tieltä, ja josta poimitaan nopeasti kanvaasille.

**Toimintatapa:** kelluva ikkuna näkymäkanvaasin päällä (raahattava otsikosta, koko muutettavissa, piiloon yhdellä napilla, paikka muistetaan selaimessa). Napautus valitsee kohteen, ja **jokainen klikkaus kanvaasille lisää yhden** (klik klik), kunnes Esc tai sama nappi uudestaan. Laattalajit maalaavat. Raahaus kanvaasille toimii myös. Ruudukko kohdistaa, jos kerroksessa on ruudukko.

**Ei uutta palikkatyyppiä:** laatikon sisältö on F26:n presettejä (tavallisia, avattavia palikkoja ja logiikkaa) ja Laattakartan lajeja. Emil voi lisätä omat presettinsä laatikkoon ja poistaa valmiit. Linjakkuus A8: pikaluonti tuottaa tavallista logiikkaa.

**Ehdotettu sisältö** (kuusi hyllyä):

| Hylly | Sisältö |
|---|---|
| Rakenne | Seinälaatikko, lattia, taso (läpäistävä alhaalta), pallo, laatikko jota voi työntää (massa) |
| Laatat | valitun Laattakartan lajit + Pyyhi + siveltimet; ＋ Uusi laattakartta |
| Hahmot | Pelaaja: tasoloikka (Liike + painovoima + hyppy + tatti tai näppäimet), Pelaaja: ylhäältä (Tatti-liike), Vihollinen edestakaisin (Reitti), Seuraaja (Napautus kohteeseen hahmoon), Lentäjä (painovoima 0 %) |
| Alueet | Painovoima-alue, Vesi, Tikkaat, Painelaatta (astuttu), Maali, Aloituskohta (Sijainti), Kuolema-alue (vie aloitukseen), Kameran rajat |
| Esineet | Kolikko (katoaa, +1 pisteisiin), Avain ja ovi, Pomppulevy (kimmoisuus 150 %), Liikkuva taso (vaihe G), Portti (vie toiseen kohtaan) |
| Näkymä | Pistenäyttö (Teksti + Muisti), Elämät (Monitori), Kamera seuraa pelaajaa, Pikselitarkka päälle (vaihe E) |

Muualle kuin peleihin sama laatikko kelpaa: pohjapiirros laatoista, kalenteriruudukko, lautapelin ruudut, kaavio-tausta. Hyllyt voi nimetä uudelleen; *Omat*-hylly saa Emilin presetit.

## 8. Muut tarpeet ja rajaukset

- **Näppäimistö** (F33 vaihe 4): tietokoneella tasoloikka pelataan näppäimillä. Suositus: F33:n vaihe 4 nostetaan heti F33:n vaiheen 1 jälkeen ja ennen tämän suunnitelman vaihetta B (nuolet = ristiohjain/tatti, välilyönti = alanappi). Viedyssä iPhone-apissa ohjataan Tatilla ja Painikkeilla, ja ne toimivat jo.
- **Vaihe G, liikkuvat tasot:** maassa oleva hahmo kulkee tason mukana (`alla` on liikkuva palikka → sen siirtymä lisätään). Myöhemmin, kun vaiheet A–D ovat käytössä.
- **Ei tässä:** kaltevat pinnat ja luiskat (osuma-alue vain laatikko ja ympyrä), pyöriminen, seinähyppy ja seinässä liukuminen (helppo lisä vaiheen B päälle, kun tarve tulee), parallaksi on jo kerroksen rullausvauhti, partikkelit (efektit), äänet (F05-suunnitelma), Masterin maailmat-ominaisuuden tuonti (ei korvata mitään).
- **Suorituskyky:** painovoiman kiinteä askel vain painovoiman kappaleille; laattaeste O(liikkujan peittämät ruudut); laattapiirto vain muutoksissa; kuvasilmukka pysähtyy, kun kaikki ovat maassa ja paikallaan.

## 9. Linjakkuus (PALIKKASAANNOT)

- **A1 nimet:** Laattakartta (näyttää laattoja), Alueen Painovoima, Liikkeen Hyppy: tekemisen mukaan. Laatikon hyllyt ovat presettejä, ei palikoita.
- **A2 rekisteri:** `omat`: Alue `painovoima`, `suunta`, `ilmanvastus`; Liike `painovoima` (%), `maassa`, `alla`, `putoamisvauhti`, `hyppy`, `ilmaohjaus`, `hyppyjä jäljellä`; Laattakartta `määrä.<laji>`, `leveys`, `korkeus`. Laattalajit ja maalatut ruudut ovat rakennetta/käyttötietoa kuten taulukon sarakkeet ja rivit; niitä muutetaan toiminnolla Maalaa laatta, ei `o_`-kohdalla (syy kirjataan).
- **A3 etusija:** ennallaan (nuoli/kaava > toiminto > perusarvo).
- **A4 tapahtumat:** Liike sisään *hyppää*, *lopeta hyppy*; ulos *hyppäsi*, *laskeutui*, *irtosi maasta*; törmäsi saa tiedot `puoli` ja `voima`. Laattakartta *astuttu*, *poistuttu* kuten Alue.
- **A5:** Laattakartta on tavallinen näkymäpalikka. **A6:** Maalaa laatta on toiminto (hetki), kaava vain lukee. **A7:** ei uutta funktiota: laatan haku kaavassa ei kuulu tähän (`kartta.ruutu(x;y)` olisi uusi funktio); laatat luetaan tapahtumista ja `alla`:sta. **A8:** painovoima ja tikkaat ja vesi samasta Alueesta; laatikko = presetit. **A12:** painovoima, hyppy, laattaeste moottoriin. **A13:** uudet kentät valinnaisia, vanha projekti liikkuu täsmälleen kuten ennen (ei painovoima-Aluetta = ei painovoimaa). **A15:** manuaaliin Liike-, Alue- ja uusi Laattakartta-merkintä.
- **Erikoispalikat:** ei uusia. Kelluva laatikko on rakentajan työkalu, ei palikka.

## 10. Vaiheet, tallennus ja testit

| Vaihe | Sisältö | Tallennusmuoto | Hyväksyntä (testi) |
|---|---|---|---|
| A | Painovoima Alueelle, Liikkeen painovoima %, maassa, alla, laskeutui, irtosi, `puoli`, `voima`, kitka vain maassa, ohjaus poikittain, kiinteä askel | **laajenee** (Alue `pv`, `pvs`, `ilv`; Liike `pvk`) | putoaa oikein 30/60/120 fps (±2 %); maassa vain alustalla; käännetty painovoima; vanhat liiketestit ennallaan |
| B | Hyppy (korkeus, ilmaohjaus, lyhyt hyppy, tuplahyppy, armoaika, ennakko) | **laajenee** (Liike `hk`, `ilo`, `lh`, `hil`) | hypyn huippu = korkeus ±2 % kaikilla fps:illä; juoksuhyppy pidempi; ei hyppyä ilmassa ilman tuplahyppyä |
| C | Laattakartta, lajit, maalaus klik klik, laattaeste, taso | **laajenee** (uusi laji `laatat`, kentät `rk`, `lw`, `lh2`, `lj`, `rt` (ruudut tiiviinä)) | maalaus ja Kumoa; liikkuja ei jää saumaan; 200×200 kartta ei hidasta (kuva < 4 ms koneella); Headmaze-sokkelo laatoilla |
| D | Laattojen astuttu/poistuttu, `alla` = laji, Maalaa laatta | **laajenee** (lajin `il`, käyttötieto `lt:`) | kolikko katoaa ja laskuri kasvaa; Palauta palauttaa kartan |
| E ⏸ | Pikselikuva ja Pikselitarkka | **laajenee** (lajin/Kuvan `px`, näkymän `pxt`) | terävä esitys; kuva seuraa paletin vaihtoa |
| F | Kelluva rakennuslaatikko ja valmiit presetit | ei (presetit selaimen muistissa kuten F26) | auki pysyvä, raahattava, klik klik -lisäys, Esc |
| G | Liikkuvat tasot | ei (todennäköisesti) | hahmo kulkee tason mukana |

Avainten nimet ovat ehdotuksia; rakentaja tarkistaa, ettei avain ole jo toisessa käytössä (A13). Versio pysyy 8 kuten tähänkin asti valinnaisilla kentillä. Jokainen tallennusmuotoa laajentava vaihe pitää kaistasäännön mukaisen tallennusmuodon vuoron.

**Koeappi D (vaiheiden A–D jälkeen):** pieni tasoloikka projektina `master-tiedot/appiappi/` (40 × 12 laattaa, kolikot, piikit, maali, litistettävä vihollinen). Kitkat jonon loppuun, kuten Headmazessa.

## 11. Kysymykset Emilille

1. ⏸ Pikseliulkoasu (vaihe E): (a) omat pikselikuvat + terävä esitys (*suositus*) vai (b) vain terävä esitys?
2. Ei estä mitään: siirretäänkö 2D-vaiheet jonossa värien (F34) ja pienten korjausten edelle? *Suositus:* ei, pienet korjaukset ensin; vaihe A voi alkaa heti, kun tallennusmuodon vuoro vapautuu.
