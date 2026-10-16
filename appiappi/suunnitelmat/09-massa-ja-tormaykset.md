# F24 Massa, kimmoisuus ja kitka: törmäykset, jotka vaikuttavat

16.10.2026. **Emilin idea**, tekoälyn jäsentämä toteutusvalmiiksi. **Toteutettu Appi-appi 17:ssä** (kohta 12: ratkaisut ja poikkeamat). Merkinnät: *Emilin idea* = hänen sanomansa, *ehdotus* = tekoälyn suunnitteluratkaisu, *avoin* = Emil päättää ennen rakentamista (kohta 10). Lue ensin [periaatteet](00-periaatteet.md) ja [MISSIO](../MISSIO.md).

## 1. Idea (Emilin idea, tiivistetty)

Esineet reagoivat toisiinsa, kun ne osuvat yhteen. Kitkan lisäksi esineelle annetaan **massa**. Massa, kitka ja osumanopeus yhdessä tuottavat melko realistisen reaktion: palloa voi lyödä, autot kolaroivat ja kolari vaikuttaa kumpaankin. Koskee sekä pelattavia hahmoja että passiivisesti maailmassa olevia asioita. Käyttö peleissä laajasti.

## 2. Nykytila (tarkistettu koodista 16.10.2026, Appi-appi 15)

- **Liike** liikuttaa näkymäpalikkaa (`liikeAskel`, `frame`). Ohjaus: nopeus x/y nuolesta, Tatti, Napautus kohteeseen, Auto, Reitti, Ruutu kerrallaan. Nopeus on käyttötilassa `st[liike].vx/vy`.
- **Este** on näkymäpalikan (`b.este`) tai kerroksen asetus. Osuma-alue laatikko tai ympyrä (`osumaAlue`), ei kierry palikan mukana (Emilin päätös).
- **Törmäys** (`liikuta`, `osumaTyonto`): liikkuja työnnetään irti esteestä lyhintä reittiä, esteeseen päin oleva nopeus häviää, joten se liukuu reunaa pitkin. **Este ei koskaan liiku törmäyksestä.** Kaksi liikkuvaa estettä kohtelevat toisiaan seininä. Ei pomppua, ei massaa, ei liikemäärän siirtoa.
- **Liukkaus %** (`b.liuk`) on ohjauksen viive: todellinen nopeus seuraa haluttua (100 % = 1,5 s). Se ei ole kitka vapaalle liikkeelle: ilman ohjausta nopeus on heti nolla.
- Logiikkaan: *osuu esteeseen*, *törmäsi* (tapahtuma `tor`), *nopeus*, *suunta*. Ei tietoa siitä, mihin osui eikä kuinka kovaa.
- Reitti-ohjaus kulkee kiskoilla eikä törmää, mutta voi olla este muille (Emilin päätös).

## 3. Ydinajatus (ehdotus)

Kolme uutta lukua ja yksi uusi vauhti:

| Mikä | Kenen | Merkitys arkikielellä | Oletus |
| --- | --- | --- | --- |
| **Massa** | näkymäpalikan (esineen) | kuinka painava. Vain suhteilla on väliä: 1 ja 3 toimii kuten 10 ja 30. | tyhjä = ei massaa = toimii kuten nyt |
| **Kimmoisuus %** | näkymäpalikan | 0 = tömähtää, 100 = pomppaa täydellä vauhdilla, yli 100 = pomppulevy (flipperi) | 0 |
| **Kitka %** | Liikkeen | kuinka nopeasti törmäyksestä tai töytäisystä saatu vauhti hiipuu. 0 = liukuu ikuisesti (ilmakiekko), 100 = pysähtyy heti | 50 |
| **Töytäisyvauhti** | Liikkeen käyttötila | ohjauksen päälle tuleva toinen vauhti, jonka törmäys tai logiikka antaa | 0 |

Liikkuja kulkee **ohjausvauhdin + töytäisyvauhdin** verran. Ohjaus (tatti, auto, napautus) toimii täsmälleen kuten nyt; törmäys ei sotke ohjausta vaan antaa erillisen tönäisyn, joka hiipuu kitkan mukaan. Siksi myös tatilla ohjattu hahmo lennähtää, kun raskas auto osuu, eikä ohjaus kumoa sitä heti. Ilman ohjausta oleva Liike (pallo, laatikko, kiekko) liikkuu pelkällä töytäisyvauhdilla. **Uutta ohjaustapaa ei tarvita:** paneeli sanoo ”Ei ohjausta: liikkuu vain törmäyksistä ja töytäisyistä”.

Törmäyksen tulos: liikemäärä säilyy ja kimmoisuus kertoo, paljonko vauhtia palaa. Sääntö rakentajalle: **kevyt lentää, painava tuskin hätkähtää, samanpainoiset jakavat.** Pomppu tapahtuu osumakohdan suuntaan, joten vino osuma ohjaa palloa sivulle (biljardi toimii ympyröillä).

**Miksi massa esineelle eikä Liikkeelle:** massa ja kimmoisuus ovat sen asian ominaisuuksia, joka osuu (kuten osuma-alue ja este, jotka ovat jo palikan asetuksia). Liike on moottori: miten asia liikkuu ja miten maa jarruttaa (kitka). Seinä voi olla kimmoisa ilman Liikettä. Sama jako pitää tutun mallin: palikan Este ja osuma-alue -osio kertoo, millainen esine on törmätessä.

**Miksi kitka erikseen nykyisestä liukkaudesta:** liukkaus kertoo, miten ohjaus tarttuu (hahmo kiihtyy ja kääntyy viiveellä), kitka kertoo, miten vapaa vauhti hiipuu. Jos ne yhdistäisi, nykyisten projektien liukkaus 0 % tarkoittaisi, ettei hahmoa voi koskaan tönäistä, ja pallo pysähtyisi heti, ellei sille laita liukkautta. Huono puoli: kaksi samantuntuista asetusta. Paneelin ohjeteksti erottaa ne (”Liukkaus: ohjauksen pito · Kitka: miten tönäisy hiipuu”). Avoin kysymys 2.

### Massaton osapuoli: taaksepäin yhteensopiva ”puskutraktori”

| Osuja A | Kohde B | Mitä tapahtuu |
| --- | --- | --- |
| ei massaa | seinä tai mikä tahansa este ilman massaa | **kuten nyt**: A liukuu reunaa pitkin |
| massa | seinä (este ilman Liikettä) | A pomppaa kimmoisuuden mukaan, seinä paikallaan |
| ei massaa (esim. hahmo) | massa (pallo) | A ei itse hätkähdä (kuin ääretön massa), B saa vauhdin A:n vauhdin ja kimmoisuuden mukaan |
| massa | massa | molemmat reagoivat massojen suhteessa |
| Reitti-ohjaus | massa | Reitti kulkee kiskoillaan kuten nyt ja tönäisee B:tä kuin massaton |

Vanhoissa projekteissa ei ole massaa missään, joten mikään ei muutu. Palloa voi potkaista antamalla massan vain pallolle.

Massa palikalla, jolla ei ole Liikettä: esine ei voi liikkua (kuten seinä). Paneeli sanoo sen ja tarjoaa napin **＋ Liike** (pikaluonti: tavallinen Liike-palikka ilman ohjausta, kohteena tämä palikka). Ei piilotettua liikettä.

Pari törmää, kun ainakin toinen on este (sama sääntö kuin nyt: liikkuja osuu esteeseen). Vaikutukset vaihdetaan, kun ainakin toisella on massa.

## 4. Rakentajan näkymä (ehdotus)

**Näkymäpalikan paneeli → Este ja osuma-alue** (nykyinen osio laajenee; näkyy, kun palikka on este tai jonkin Liikkeen kohde):
- Este, Osuma-alue, Koko % (nykyiset)
- **Massa** (tyhjä tai luku > 0). Ohje: ”Tyhjä: ei reagoi törmäyksiin, mutta tönäisee massallisia.”
- **Kimmoisuus %** (0–200)

**Liike-paneeli → uusi osio Törmäykset** (suljettuna, kunnes avataan; ei monimutkaista peruskäyttöä):
- **Kitka %** ja elävä esimerkki: ”kitka 50 %: 300 px/s → pysähtyy 0,4 s:ssa, liukuu 60 px” (ymmärrys ilman kaavoja).
- Teksti, jos kohteella ei ole massaa: ”Kohteella ei ole massaa: törmäykset eivät tönäise sitä.” ja linkki palikan osioon.

**Logiikka (uudet arvot, ominaisuudet ja tapahtuman tiedot):**
- Liike-palikan uudet ulostulot: **isku** (viimeisimmän osuman voimakkuus = lähestymisnopeus px/s osumasuunnassa) ja **osui palikkaan** (viimeisin kohde, nimenä).
- *Törmäsi* lähtee jokaisesta **uudesta kosketuksesta** (myös massallisten välillä) molempien Liikkeille, ei joka kuvassa jatkuvassa työnnössä.
- Tapahtuman tiedot (P2:n kuori `{id, src, nm, at, …}`) saa törmäsi-tapahtumassa kentät **kohde** ja **isku**: `tapahtuma.kohde`, `tapahtuma.isku`. Käyttö: ”jos isku > 400 → vähennä kestävyyttä”, ”jos kohde on maali…”.
- Ominaisuudet ominaisuusrekisteriin, tavallinen etusija (nuoli/kaava > toiminto > perusarvo):
  - näkymäpalikalle `massa`, `kimmoisuus` (esim. voimaesine: `massa = 1 + pisteet`)
  - Liikkeelle `kitka`, **`vauhti x`**, **`vauhti y`** (töytäisyvauhti). Aseta, Lisää ja Palauta toimivat: **lyönti = Lisää vauhti x**, pysäytys = Aseta 0. Uutta Töytäise-toimintoa ei tarvita v1:ssä. Tatin suuntaan ampuminen: Lisää `vauhti x` = `tatti.x * 800` ja vastaavasti y.

## 5. Laskenta moottorissa (toteuttajalle)

Kaikki `<script id="engine">`-osaan (vietävä moottori), uusi osio ”Appi-appi N: massa ja törmäykset”. Tarkista nimet nykykoodista, älä nojaa rivinumeroihin.

**Käyttötila Liikkeelle:** `ux`, `uy` (töytäisyvauhti px/s), `kos` (tunnisteet, joihin kosketetaan nyt; törmäsi-reunan tunnistus pareittain), `isku`, `osk` (viimeisin kohde). Valinnaisia: puuttuva = 0 / tyhjä.

**Yhden kuvan kulku `frame`ssa:**
1. Jokainen Liike laskee ohjausnopeuden `vx, vy` kuten nyt (kaikki nykyinen ennallaan, myös liukkaus, kiihtyminen, auto, napautus).
2. Töytäisyvauhti hiipuu kitkan mukaan: vakiohidastuvuus `d = 3000 · (kitka/100)² px/s²` (oikean liukukitkan malli: nopea liukuu pidemmälle). Esim. 50 % → 750 px/s², 20 % → 120, 10 % → 30, 0 → ei hidastu. Alle 1 px/s → 0. Tarkat luvut saa virittää; hyväksymiskriteerit ratkaisevat.
3. Siirto seiniä vastaan: `liikuta` matkalla `(vx+ux, vy+uy)·dt`. `liikuta` palauttaa lisäksi osumien normaalit. **Seiniksi** lasketaan este ilman Liikettä, kerroksen este ja liikkuvat esteet parissa, jossa kummallakaan ei ole massaa (nykyinen käytös). Massalliset parit ratkaistaan kohdassa 4, joten ne jätetään `esteet()`-listasta pois.
   - Seinään osuessa, jos liikkujalla on massa: töytäisyvauhdin ja ohjausvauhdin seinään päin oleva osa `v_n` nollataan kuten nyt, ja töytäisyvauhtiin lisätään pomppu `−e · v_n · n`, `e = max(kimmoisuus A, kimmoisuus seinä) / 100`. Massattomalla nykyinen käytös. Liikkeen rajat (xmin…ymax) toimivat kuin seinä, kimmoisuutena liikkujan oma.
4. Massalliset parit: kaikki liikkuvien kohteiden parit, joiden osuma-alueet ovat päällekkäin, ainakin toinen este ja ainakin toisella massa. `inv = 1/massa`, massaton tai Reitti = 0.
   - `n` = `osumaTyonto(A,B)`-vektorin suunta. `v_rel = (vA+uA − vB−uB) · n`. Jos lähestyvät: `j = −(1+e) · v_rel / (invA+invB)`, `uA += j·invA·n`, `uB −= j·invB·n`, `e` kuten yllä.
   - Päällekkäisyys korjataan jakamalla työntö `inv`-suhteessa: painava työntää kevyttä, samanpainoiset puskevat tasan. Ohjausvauhtia ei nollata parissa, jotta hahmo tai auto voi työntää laatikkoa jatkuvasti.
   - Iteroi 4 kierrosta (kuten `liikuta`). **Alivaiheet:** jos nopein kappale kulkee kuvassa yli puolet pienimmästä osuma-alueesta, kuva jaetaan alivaiheisiin (enintään 16), ettei pieni nopea pallo mene toisen läpi.
   - Auto: `sf` lasketaan toteutuneesta liikkeestä kuten nyt (kolari hidastaa autoa).
5. Tapahtumat: uusi pari kosketuksessa → törmäsi molemmille, kuoreen `kohde`, `isku = |v_rel|`. `isku` ja `osk` tallennetaan.
6. `liikeKay` huomioi töytäisyvauhdin (kuvasilmukka käy, kunnes kaikki ovat pysähtyneet). Kääntyvä hahmo kääntyy kokonaisvauhdin suuntaan, auto edelleen ohjauksen suuntaan.

**Ruutu kerrallaan** ei käytä massaa v1:ssä (askel on hyppy ruutuun); massa näkyy paneelissa harmaana: ”ei vaikuta ruutuliikkeessä”. Toimii esteenä kuten nyt.

**Suorituskyky:** parit O(n²). 30 liikkuvaa = 435 paria kuvassa, riittää. Yli 100 kappaletta vaatisi ruudukkohajautuksen (ei v1).

## 6. Tallennus

- Näkymäpalikka: `mas` (massa, puuttuva = ei massaa), `kim` (kimmoisuus %, puuttuva = 0). Liike: `kit` (kitka %, puuttuva = 50). Käyttötila: `ux`, `uy`, `kos`, `isku`, `osk`. Tarkista, ettei avaimia ole jo käytössä toisessa merkityksessä.
- Kaikki valinnaisia, `VER` pysyy 8 (kuten Appi-appi 11–15), `repair` sietää puuttuvat. Vanhat projektit liikkuvat täsmälleen kuten ennen. Muistuta Emiliä varmuuskopiosta silti.
- README:n tallennuskenttäluettelo ja `TILA.md` päivitetään.

## 7. Monikäyttöisyys: esimerkit

1. **Pallopeli (jalkapallo, ilmakiekko):** hahmo Tatilla (ei massaa tai massa 70), pallo Muoto-ympyrä + Liike ilman ohjausta, massa 0,5, kimmoisuus 70 %, kitka 30 %. Reunat esteitä. Maali = Alue → *astuttu* → Lisää 1 pisteisiin ja Aseta pallon vauhti 0, siirto keskelle.
2. **Törmäilyautot / kolaripeli:** kaksi Auto-ohjattua, massat 1000 ja 1500, kimmoisuus 30 %. Törmäsi → Tapahtuman tiedot → jos `tapahtuma.isku > 300` → Vähennä kestävyyttä; Monitori näyttää kestävyyden. Raskas auto työntää kevyttä.
3. **Biljardi, curling, kuulapeli:** kiekot ilman ohjausta, kitka 10 %. ”Vedä ja päästä”: Tatin *irti* → Lisää valkoisen `vauhti x` = `−tatti.x * 900` (huom: `tattiSet` nollaa tatin ennen *irti*-tapahtumaa, joten suunta pitää ottaa talteen Muistiin tatin liikkuessa, tai toteutuksessa *irti*-tapahtuman tietoihin lisätään tatin viimeinen x ja y: `tapahtuma.vanha`). Kaikki pysähtyneet = JA-ikkuna *liikkuu*-arvoista → vuoro vaihtuu.
4. **Flipperi tai pomppupeli:** pomppulevyt esteinä ilman Liikettä, kimmoisuus 150 %, pallo kitka 0.
5. **Muu kuin peli:** fysiikan havainnollistus (kaksi kärryä, massat liukusäätimistä, Monitori näyttää liikemäärät ennen ja jälkeen) tai leikkisä valikko, jonka ikonit tönäisevät toisiaan.

## 8. Hyväksymiskriteerit ja testit

Uusi moottoritesti `testit/logiikka_51_massa.js` (tai seuraava vapaa numero) ja luettelo `testit/README.md`:hen:

1. Vanhat liiketestit (31, 34, 35, 38–40, 44) läpi muuttamatta: ilman massaa liike on sama kuin ennen.
2. Samat massat, kimmoisuus 100 %, keskeinen osuma: nopeudet vaihtuvat (±1 %).
3. Kimmoisuus 0, B levossa: yhteinen loppunopeus `mA·vA/(mA+mB)` (±2 %).
4. Massa 9 osuu levossa olevaan massaan 1, kimmoisuus 100 %: liikemäärä säilyy (±1 %), kevyt saa 1,8-kertaisen nopeuden ja raskas jatkaa 0,8-kertaisella.
5. Seinä ja kimmoisuus 80 %: paluunopeus 80 %; seinä 150 %: nopeampi kuin tullessa.
6. Massaton hahmo ja massallinen pallo: hahmon nopeus ei muutu, pallo lähtee.
7. Kitka 0: vauhti säilyy; 100: 300 px/s:sta pysähtyy alle 0,2 s:ssa; 10 % liukuu pidemmälle kuin 30 %.
8. Nopea pieni pallo (2000 px/s, halkaisija 10 px) ei mene toisen liikkuvan eikä ohuen seinän läpi.
9. Törmäsi lähtee kerran per uusi kosketus molempien Liikkeille; `tapahtuma.kohde` ja `tapahtuma.isku` oikein; jatkuva työntö ei lähetä joka kuvassa.
10. Painava työntää kevyttä: Auto 1000 ja laatikko 10 → laatikko liikkuu, auto hidastuu vähän.
11. Lisää `vauhti x` 300 → liikkuu ja hiipuu; Aseta 0 pysäyttää; Palauta toimii.
12. `massa` kaavasta muuttaa törmäyksen tulosta kesken pelin.
13. Tallennus, vienti ja tuonti säilyttävät `mas`, `kim`, `kit`; vanha projekti avautuu.
14. Kuvasilmukka pysähtyy, kun kaikki ovat pysähtyneet.

Selain: paneelit 1440 ja 1280 px; pelattava koe (esim. pallopeli) käyttönäkymässä 390 ja 320 px. Raportoi: ei oikealla iPhonella (sujuvuus Safarissa, akku).

## 9. Rajaukset: ei tässä vaiheessa

- **Painovoima** (sivulta kuvatut tasohyppelyt): luonteva jatko, kerroksen tai Liikkeen ”painovoima px/s²” = jatkuva töytäisy alaspäin + arvo *seisoo maassa*. Rakentuu suoraan töytäisyvauhdin päälle.
- Pyöriminen ja kierre (osuma-alue ei kierry; kolari siirtää ja hidastaa, mutta ei pyöritä autoa).
- Muodon mukainen osuma-alue (vain laatikko ja ympyrä).
- Ruutuliikkeen työntö (Sokoban: laatikko siirtyy ruudun).
- Pinnan kitka seinää pitkin liukuessa (v1: liukuu reunaa kitkatta kuten nyt).
- Jouset, nivelet, köydet.
- Töytäise suuntaan -toiminto (kulma + voima, massa huomioiden); v1:ssä Lisää vauhti riittää.

## 10. Kysymykset ja Emilin päätös

**Emilin päätös 16.10.2026:** toteutetaan suositusten mukaan (kohdat 1–5 alla: kyllä, kyllä, kyllä 0–200 %, painovoima perään omana vaiheenaan, massaton = puskutraktori). Toteutus odottaa, kunnes toinen samaan aikaan käynnissä ollut rakentaja (Appi-appi 16) on valmis; Emil antaa merkin.

1. Massa ja kimmoisuus esineelle (Este-osio), kitka Liikkeelle? *Suositus: kyllä.*
2. Kitka erillinen nykyisestä liukkaudesta? *Suositus: kyllä* (perustelu kohdassa 3).
3. Kimmoisuus yli 100 % sallittu (pomppulevy)? *Suositus: kyllä, 0–200 %.*
4. Painovoima samaan vaiheeseen vai heti perään omana pienenä vaiheenaan? *Suositus: perään.*
5. Massaton hahmo = puskutraktori (tönäisee, ei hätkähdä)? *Suositus: kyllä.* Hahmon saa horjumaan antamalla sille massan.

## 11. Mittakaava ja toteutusjärjestys

Yksi Appi-appi-vaihe. Arvio: moottoriin 150–250 riviä, paneeleihin noin 60, uusi testitiedosto. Ei riipu P4:stä eikä muista suunnitelman vaiheista; koskee `frame`a ja `liikeAskel`ia, joten ei samaan aikaan toisen niitä muokkaavan rakentajan kanssa.

Järjestys toteuttajalle, testit jokaisen jälkeen: (a) töytäisyvauhti, kitka ja ominaisuudet `vauhti x/y` (ei vielä törmäyksiä) → (b) pomppu seinästä → (c) massalliset parit, työntö ja alivaiheet → (d) törmäsi, isku ja tapahtuman tiedot → (e) paneelit, ohjetekstit ja ＋ Liike → (f) esimerkkiprojekti vain pyynnöstä.

## 12. Toteutus 16.10.2026 (Appi-appi 17)

Toteutettu kohtien 3–8 mukaan Emilin hyväksymin suosituksin (kohta 10). Testit: `testit/logiikka_52_massa.js` (numero 51 oli jo käytössä) ja `testit/selain_58_massa.py`. Kaikki vanhat testit ajettu.

**Tekniset ratkaisut ja poikkeamat suunnitelmasta:**
- Kimmoisuus vaikuttaa seinäosumassa myös ilman massaa (pomppulevy pomppaa massattomankin takaisin). Vanhoissa projekteissa kimmoisuus on 0, joten ne liikkuvat ennallaan. Yksi sääntö: *kimmoisuus vaikuttaa aina, massa vain kahden liikkuvan välillä.*
- `isku` ja `törmäyskohde` ovat Liikkeen ominaisuuksia (kaava, Ominaisuudet-osio), eivät uusia kytkentäkohtia, jottei jokainen Liike-palikka täyty kohdista. Seinäosumakin antaa kohteen ja iskun.
- `vauhtix`/`vauhtiy` kirjoittavat suoraan Liikkeen käyttötilaan (Aseta, Lisää, Palauta), eivät pysyvään asetettuun arvoon, koska tönäisy hiipuu. Nuoli tai kaava kohtaan vauhtix ohjaa sitä jatkuvasti (kitka ei silloin hiiputa).
- Kosketus pysyy samana, kun rako on alle 1 px; uusi törmäsi vaatii oikean päällekkäisyyden. Näin jatkuva työntö ei lähetä tapahtumaa joka kuvassa.
- Puristus: jos massallinen on seinää vasten, massaton tönäisijä pysähtyy sen pintaan (ei mene päälle).
- Alivaiheet: `ceil(2 · suurin nopeus · dt / (0,5 · pienin osuma-alue))`, enintään 16, vain kun projektissa on massallinen kappale.
- Paikka kirjoitetaan apurilla `paikkaAseta` (kuvan alun ominaisuus + siirtymä), joten sama palikka voi liikkua kuvassa monta kertaa (alivaiheet, parin korjaus). Yhden siirron kuvassa tulos on sama kuin ennen.
- Kääntyvä hahmo kääntyy ohjauksen suuntaan; ilman ohjausvauhtia (pallo) kokonaisvauhdin suuntaan.
- Paneelit: palikan Este ja osuma-alue -osioon Massa ja Kimmoisuus; ＋ Liike tekee Liikkeen ilman ohjausta. Liikkeen Törmäykset-osio on suljettava, ja se aukeaa itsestään, kun kitkaa on muutettu tai kohteella on massa.

**Ei tehty:** kohdan 9 rajaukset; kohdan 7 esimerkin 3 tatin suunta *irti*-hetkellä (tatti nollautuu ennen tapahtumaa) jäi ennalleen; Miksi?-selitys ei vielä kerro tönäisystä; esimerkkiprojekti (vain pyynnöstä).

