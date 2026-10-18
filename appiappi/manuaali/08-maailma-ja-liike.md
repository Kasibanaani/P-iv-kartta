# Maailma, liike ja pelit

Tämä luku kertoo, miten näkymästä tehdään puhelimen tai iPadin muotoinen ruutu, miten ruudusta tulee isompi maailma, jota kamera seuraa, ja miten palikat liikkuvat, törmäävät ja tunnistavat paikkoja. Näillä rakennetaan pelejä ja muita appeja, joissa jokin liikkuu.

Tärkeät perussäännöt ennen yksityiskohtia:

- Liike näkyy vain **lukitussa käytössä**. Lukitse näkymä yläpalkin napista **Lukitse** (nappi muuttuu muotoon **Muokkaa**, josta palataan muokkaukseen). Muokatessa palikat näkyvät perusarvoissaan, eli paikassa, johon ne on aseteltu.
- Liike kirjoittaa palikan paikan **käyttötietoon** (ominaisuudet x ja y toiminnon tasolla, kuten Aseta-toiminto). Palikan perusarvo eli aseteltu paikka ei muutu. Tapahtuma **alkuun** tai nappi **↺ Alkuun** palauttaa perusarvoon.
- Koordinaatit ovat pikseleitä kanvaasin kohdasta (0, 0). x kasvaa oikealle, y kasvaa **alaspäin**. Suunta asteina: 0 = ylös, 90 = oikealle, 180 = alas, 270 = vasemmalle.
- Paikka tarkoittaa palikan vasenta yläkulmaa. Törmäyksissä, alueissa, reiteillä ja napautuksessa käytetään palikan **keskipistettä**.

Kädenliikkeet, jotka toistuvat:

- **Palikan lisäys:** tietokoneella vasemmasta paletista vedetään palikka kanvaasille (tai napautetaan, jolloin se tulee kanvaasin keskelle). Puhelimella paletti avautuu napista **＋ Palikat**.
- **Paneeli:** palikan asetukset näkyvät oikealla, kun palikka on valittuna. Puhelimella paneeli avautuu napista **Asetukset**.
- **Näkymän asetukset** (laite, maailma ja kamera, kerrokset): Näkymä-välilehdellä napautetaan kanvaasin tyhjää kohtaa, jolloin mitään ei ole valittuna. Samat osiot näkyvät myös Sijainti- ja Alue-palikan paneelissa.
- **Nuoli:** Logiikka-välilehdellä vedetään palikan oikean reunan pisteestä toisen palikan vasemman reunan pisteeseen. Pyöreä piste on arvo, punainen salmiakki on tapahtuma.

---

## Laitemuoto

Näkymälle valitaan laite, jolloin se on puhelimen tai iPadin ruudun kokoinen. Maailma, kamera, rullausvauhti ja zoomaus toimivat vain laitenäkymässä.

**Kädenliikkeet:** Näkymä-välilehti → napauta kanvaasin tyhjää kohtaa → paneelin osio **Näkymän laite (näkymän nimi)** → kohta **Laite**, vaihtoehdot:

| Valinta | Ruutu (leveys × korkeus) |
|---|---|
| Vapaa | ei laitetta, vapaa kanvaasi |
| Puhelin | 390 × 844 |
| Puhelin vaaka | 844 × 390 |
| iPad pysty | 820 × 1180 |
| iPad vaaka | 1180 × 820 |

- Muokatessa laitteen ruutu näkyy kanvaasilla kehyksenä kohdassa (0, 0). Nappi **Näytä koko ruutu** sovittaa kehyksen näkyviin.
- Lukittuna näkymä näkyy laitteen muotoisena: tietokoneella kehyksenä keskellä ruutua, kapealla ruudulla (oikea puhelin) koko alueen kokoisena.
- Laitenäkymässä palikan paneelin osiossa **Paikka ja koko** on lisäksi **Laitteen ruudussa** -napit (↔ Ruudun keskelle, ↕ Ruudun keskelle, ⟷ Täysi leveys, ⇤ Vasempaan reunaan, Oikeaan reunaan ⇥, ⤒ Yläreunaan, ⤓ Alareunaan) ja **Rullausvauhti** (ks. Kerrokset käytössä).
- Oletuksena (rullaus **Pystyyn**) käyttäjä rullaa vain alaspäin, ja vain jos palikoita on ruudun alareunan alapuolella. Kehyksen sivuille jäävät palikat eivät näy käytössä.
- Tekninen: `v.laite` = `puhelin` | `puhelinv` | `ipad` | `ipadv`.

## Sijainnit, alkukohta ja rajaus (vapaa näkymä)

Vapaassa näkymässä (ei laitetta) käyttäjä voi oletuksena rullata ja zoomata vapaasti. Näkymän asetuksissa on silloin osio **Näkymän sijainti ja rullaus**:

- **Alkukohta:** valikosta Sijainti-palikka. Lukittu näkymä aukeaa siitä, kun appi avataan, kun painetaan Lukitse ja kun näkymään vaihdetaan välilehdeltä.
- **Rullaus käytössä:** **Vapaa** (rullaus ja zoomaus vapaasti), **Alueen sisällä** (rullaus vain Alue-palikan reunoihin asti), **Ei rullausta** (ruutu liikkuu vain Siirry-toiminnoilla; ei myöskään zoomausta).
- **Aloitusalue** (näkyy, kun valittu Alueen sisällä): mistä alueesta aloitetaan. Oletus on alkukohdan alue tai ensimmäinen alue.
- Alueita voi olla monta, ”huoneina”. Siirry-toiminto alueeseen tai alueen sisällä olevaan sijaintiin vaihtaa rajauksen siihen alueeseen. Aluetta pienempi ruutu pysyy keskellä.

Laitenäkymässä näitä ei ole: siellä vastaavat asiat ovat osiossa **Maailma ja kamera** (alla).

## Sijainti ✦ (`merkki`)
✦ Poikkeus: paikka ilman näkyvää sisältöä, joten sillä ei ole näkyy kun -kohtia eikä käyttöraahausta.

Sijainti on merkitty kohta näkymässä. Siihen siirrytään Siirry-toiminnolla (esim. painikkeesta tai ketjusta), ja se voi olla näkymän alkukohta. Se ei näy käytössä.

- **Löytyy:** Näkymä-välilehti, paletti **Koristeet → Sijainti**. Nopeammin: aseta ruutu haluttuun kohtaan ja paina kanvaasin alareunan nappia **⌖ Sijainti** (näkyy vain muokatessa). Silloin sijainti tulee ruudun keskelle ja tallentaa nykyisen zoomauksen.
- **Sisään / Ulos:** ei kohtia logiikkaan.
- **Asetukset (paneeli), osio Sisältö:**
  - **Kohta ruudulla:** **Keskelle** (piste tulee ruudun keskelle; isommalla tai pienemmällä näytöllä reunoja tulee tai lähtee tasaisesti) tai **Vasempaan yläkulmaan** (piste tulee vasempaan yläkulmaan pienellä reunuksella).
  - **Zoomaus siirryttäessä:** **Tallennettu (x %)** palauttaa tallennetun zoomauksen, **Ennallaan** jättää käyttäjän zoomauksen. Kun valitset Tallennettu ilman tallennettua arvoa, nykyinen zoomaus tallentuu.
  - **Näkymän alkukohta** (valintaruutu): sama kuin näkymän asetus Alkukohta.
  - Napit **Päivitä tähän ruutuun** (siirtää sijainnin nykyisen ruudun mukaiseksi) ja **Kokeile siirtymää**.
  - Kun sijainti on valittuna, katkoviivakehys näyttää, mitä käytössä näkyy siirryttäessä.
- **Asetukset, osio Paikka ja koko:** X ja Y (ja Näkymä, jos näkymiä on monta).
- **Ominaisuudet:** `x` ja `y` (luettavia ja ohjattavia).
- **Kaavassa:** `sijainti.x`, `sijainti.y`. Pelkkä `sijainti` ei anna arvoa.
- **Esimerkki:** Vapaassa näkymässä rullaa ruutu ohjeosion kohdalle, paina ⌖ Sijainti, anna nimeksi Ohje. Tee painike ja sille Siirry-toiminto, kohde Ohje. Lukitse ja paina painiketta: ruutu siirtyy ohjeeseen.
- **Huomio:** Laitenäkymässä alkukohta ei vaikuta (näkymä aukeaa aina laitteen ruudun alusta), vaikka valintaruutu näkyy (ks. Havainnot). Siirry sijaintiin toimii laitenäkymässäkin rullausrajojen sisällä.

---

## Maailma ja kamera

Laitenäkymästä voi tehdä ruutua isomman maailman, jota rullataan kaikkiin suuntiin tai jota kamera seuraa.

**Kädenliikkeet:** valitse ensin näkymälle laite. Napauta kanvaasin tyhjää kohtaa → paneelin osio **Maailma ja kamera (näkymän nimi)**.

- **Rullaus käytössä:**
  - **Pystyyn** (oletus): rullaus vain alaspäin, jos palikoita on ruudun alapuolella.
  - **Kaikkiin suuntiin**: käyttäjä rullaa sormella (tai hiirellä) maailmaa joka suuntaan palikoiden reunoille asti tai valitun alueen reunoille.
  - **Ei rullausta**: ruutu pysyy paikallaan.
  - Kun kamera seuraa, valinta on aina Kaikkiin suuntiin, eikä muita voi valita.
- **Kamera seuraa:** valikosta näkymän palikka (yleensä hahmo). Kamera pitää sen ruudulla, kun se liikkuu. Sormella ei silloin rullata, joten napautukset jäävät pelille.
- **Kuollut alue** (näkyy, kun kamera seuraa): 0–100 %, oletus 30. Ympyrä ruudun keskellä, jonka sisällä seurattava saa liikkua ilman, että kamera liikkuu. 0 = seurattava pysyy aina keskellä, 50 = saa kulkea puoliväliin reunaa kohti. Muokatessa ympyrä näkyy laitteen kehyksessä katkoviivana.
- **Pehmeys** (näkyy, kun kamera seuraa): 0–100 %, oletus 40. 0 = kamera on heti perässä, 100 = ottaa kiinni hitaasti ja liukuen.
- **Maailman rajat** (näkyy, kun kamera seuraa tai rullaus on Kaikkiin suuntiin): valikosta Alue-palikka. Kamera ei näytä alueen ulkopuolta. Oletus: seuratessa **ei rajaa** (maailma jatkuu loputtomiin), rullatessa **palikoiden mukaan** (laitteen ruutu ja kaikki sormen mukana rullautuvat palikat). Jos raja on ruutua pienempi, se keskitetään.
- **Zoomaus:** ks. Zoomaus alempana.

**Maailman koko:** erillistä kokoasetusta ei ole. Maailma on niin iso kuin sen palikat (rullatessa) tai rajaksi valittu Alue. Palikoita voi asetella kehyksen ulkopuolelle mihin suuntaan tahansa.

**Kojelauta:** palikat, joiden pitää pysyä ruudulla (tatti, pisteet, napit), laitetaan kerrokseen, jonka rullausvauhti on **lukittu**, ja asetellaan kehyksen sisään (ks. Kerrokset käytössä).

- Tekninen: `v.lrul` (puuttuu = pystyyn, `kaikki`, `ei`), `v.kam = {o, ka, pe, ra}`. Kameran paikka on vain selaimen tietoa (ei tallennu projektiin).

## Zoomaus

Laitenäkymässä käyttäjä voi zoomata sormilla, ja logiikka voi zoomata Kamera-palikalla.

**Kädenliikkeet:** näkymän asetukset → **Maailma ja kamera** → kohta **Zoomaus**:

- **Sormilla (kahden sormen nipistys)** (valintaruutu, oletus pois). Tietokoneella ⌘ (tai Ctrl) + rulla tai ohjauslevyn nipistys.
- **Pienin (%)** ja **Suurin (%)** (näkyvät, kun Sormilla on päällä): oletus 50 ja 300, sallittu 10–1000. 100 % = laitteen ruutu.
- Nappi **⌕ Ohjaa logiikasta** tekee Logiikkaan Kamera-palikan (tai siirtyy olemassa olevaan, jolloin nappi on **⌕ Näytä logiikassa (nimi)**).

Toiminta:

- Sormet zoomaavat sormien kohdalta. Kun kamera seuraa, seurattava pysyy keskellä. Rullaus Ei rullausta: ruutu zoomautuu keskeltä.
- **Lukittu** kerros (kojelauta) ei zoomaudu.
- Kun sormilla voi zoomata, napautus maailmaan (napautus kohteeseen, alueen napautus) tehdään vasta, kun sormi nousee, eikä jos kosketuksesta tuli nipistys tai sormi liikkui yli 10 px.
- Ilman Kamera-palikkaa sormien zoomaus palaa 100 %:iin, kun näkymä aukeaa alkuunsa.
- Jos nuoli tai kaava ohjaa Kamera-palikan zoomausta, sormilla ei voi zoomata.

**Kamera-palikka** (`kamera`, ✦, logiikkapalikka; paletti **Näkymä ja efektit → Kamera**): valitaan **Näkymä** (vain laitenäkymät) ja **Zoomaus alussa (%)** (tyhjä = 100). Ominaisuus `zoomaus` on ohjattava (nuoli, kaava, Aseta, Palauta, esim. Muutos ajassa 100 → 200 pehmeään lähennykseen). Ulos: **zoomaus**, **näkyvä leveys**, **näkyvä korkeus**; kaavassa `kamera.zoomaus`, `kamera.leveys`, `kamera.korkeus`. Jos samalla näkymällä on kaksi Kamera-palikkaa, ensimmäinen ratkaisee. Kamera-palikalla ei voi ohjata seurattavaa, kuollutta aluetta eikä kameran paikkaa. Tarkempi kuvaus: logiikkapalikoiden luku.

Muokatessa kanvaasin alareunan napit **−**, **100 %** ja **+** zoomaavat vain rakennusnäkymää, eivät käyttöä.

## Kerrokset käytössä

Kerrokset (Pajakone 3b) ratkaisevat piirtojärjestyksen. Tässä luvussa tärkeät kerrosten ominaisuudet ovat rullausvauhti tai syvyys, este, ruudukko ja käyttöasetukset.

**Kädenliikkeet:** näkymän asetukset → osio **Kerrokset (näkymän nimi)**. Jokaisella kerrosrivillä on nimi, palikkamäärä ja napit:

| Nappi | Mitä tekee |
|---|---|
| ○ / ● | valitsee kerroksen, johon uudet palikat tulevat |
| rullausvauhti- ja syvyysvalikko (vain laitenäkymässä) | **sormen mukana**; rullausvauhti **75 %**, **50 %**, **25 %**, **lukittu**; syvyys **syvyys 100**, **syvyys 300**, **syvyys 900**, **oma syvyys…** |
| ⬚ | valitsee kerroksen kaikki palikat |
| silmä | piilottaa kerroksen muokatessa (ei vaikuta käyttöön) |
| lukko | lukitsee kerroksen muokatessa (palikoihin ei voi tarttua) |
| tiiliseinä | kerroksen palikat ovat esteitä liikkuville |
| ▦ | ruudukko kerrokselle (ks. Ruudukko) |
| kytkin | käyttöasetukset: **näkyy käytössä**, **estää alempien käytön**, **himmennä alemmat %**, **läpinäkyvyys %** ja nappi **◧ Ohjaa logiikasta** (tekee Kerros-palikan) |
| ↑ ↓ | järjestys (ylin kerros on muiden päällä) |
| ✕ | poistaa kerroksen (palikat siirtyvät pohjalle) |

Uusi kerros: nappi **＋ Uusi kerros**. Palikan kerroksen voi vaihtaa sen paneelin osiosta Paikka ja koko, kohta **Kerros**.

- **Rullausvauhti:** 100 = palikka liikkuu sormen (tai kameran) mukana, 0 = **lukittu** ruutuun (kojelauta, alapalkki), välissä hitaampi (kaukainen tausta, syvyysvaikutelma). Toimii molempiin suuntiin. Palikan oma **Rullausvauhti** paneelin osiossa Paikka ja koko (**Kerroksen mukaan**, **Sormen mukana**, **50 %**, **25 %**, **Lukittu ruutuun**, tai kenttä **Oma vauhti %**) ohittaa kerroksen vauhdin. Rullausvauhti toimii vain lukitussa laitenäkymässä.
- **Syvyys** (Appi-appi 76): kerroksen etäisyys ruudun pinnasta. Yksi luku antaa sekä koon että rullausvauhdin: `100 / (1 + syvyys / 100)` %, eli syvyys 100 = puolet, 300 = neljännes, 900 = kymmenesosa; negatiivinen (alaraja −90) on etuala, joka näkyy isompana ja liikkuu sormea nopeammin (−50 = kaksinkertainen). Syvä kerros pienenee ruudun keskikohtaa kohti, joten kolmen kerroksen tausta (esim. vuoret 900, puut 300, pelikenttä pinnassa) vierittyy oikeassa perspektiivissä. Zoomaus suurentaa kaikkia syvyyksiä samassa suhteessa. Kerroksella on joko rullausvauhti tai syvyys: valikon toinen valinta poistaa toisen. Kun syvyys on valittu, rivin alle tulee kenttä **Syvyys** (oma luku, näyttää koon prosentteina) ja valinta **säilytä näkyvä koko**: kun se on päällä ja syvyyttä muutetaan, kerroksen palikoiden paikat ja koot muuttuvat niin, että alkuhetken kuva pysyy samana ja vain parallaksi muuttuu (tekstin koko S–XL ei muutu; Kumoa toimii). Valinta on vain tämän istunnon apu, ei tallennu.
  - **Muokatessa** syvä kerros näkyy alkuhetken kuvana: pienennettynä laitteen kehyksen keskikohtaa kohti, kuten käytössä kameran ollessa kehyksen kohdalla. Muokkauskanvaasin vieritys ei liikuta kerroksia toisiinsa nähden. Raahaus, koon muutos ja valintalaatikko toimivat kerroksen omissa koordinaateissa (palikka pysyy osoittimen alla; paneelin X ja Y ovat kerroksen lukuja). *Ruudun keskelle* -napit toimivat syvässäkin kerroksessa; reunanapit sijoittavat kerroksen koordinaateissa.
  - **Palikan oma rullausvauhti** (paneeli tai logiikka) ohittaa kerroksen syvyyden: palikka liikkuu omalla vauhdillaan täydessä koossa. Paneelin *Kerroksen mukaan* kertoo kerroksen syvyyden.
  - **Palikan oma syvyys** (Appi-appi 78, jonon 17d): paneelin osiossa *Paikka ja koko* kenttä **Oma syvyys** (tyhjä = kerroksen mukaan, 0 = pinnassa, negatiivinen = etuala). Se ohittaa kerroksen syvyyden ja rullausvauhdin; palikalla on joko oma rullausvauhti tai oma syvyys (toisen valinta poistaa toisen). Palikka kuuluu yhä kerrokseensa: lähestyvä asia on yksi palikka, jonka syvyys pienenee logiikalla.
  - **Logiikka ohjaa syvyyttä:** näkymäpalikan ominaisuus `syvyys` on ohjattava (nuoli tai kaava kohtaan *syvyys*, Aseta, Lisää, Palauta, Muutos ajassa, Joukon sääntö); perusarvo on palikan oma, muuten kerroksen. Lukuominaisuus `näkyväkoko` kertoo syvyyden antaman koon ja vauhdin prosentteina (100 = pinnassa, 25 = syvyys 300), esim. ääni tai pisteet etäisyyden mukaan. Kerros-palikan `syvyys` tuo koko kerroksen lähemmäs tai kauemmas.
  - **Järjestys:** kerros ratkaisee ensin, sitten saman kerroksen sisällä syvempi on takana, sitten *järjestys* (z). Kauempaa lähestyvä palikka tulee kerroksensa muiden eteen ohittaessaan ne, mutta ei ylemmän kerroksen eteen.
  - Napautus, Napautus-liike, käytössä näkyvä ruudukko ja käyttöraahauksen pudotus osuvat siihen, missä syvä palikka näkyy (sama muunnos kuin piirrossa). Syvä palikka ottaa kosketuksen näkyvästä koostaan: pieni taustan nappi on pieni myös sormelle.
  - **Esteet ja törmäykset** lasketaan kerroksen omissa koordinaateissa, ei siellä, missä syvä palikka näkyy. Siksi kerrosrivi varoittaa, kun esteeksi merkitty kerros (tai sen palikka) on eri syvyydellä kuin jokin liikkuja: *Este on eri syvyydellä kuin …: törmäys tapahtuu eri kohdassa kuin näkyy.*
  - Syvä kerros ei kasvata rullattavaa aluetta (sisällön alareuna ja kameran rajat lasketaan pinnan palikoista), ja kaukana ruudun ulkopuolella olevat syvät palikat jätetään piirtämättä kuten pinnan palikat.
  - Rajat: syvyys toimii vain laitenäkymässä (muissa näkymissä valikkoa ja kenttää ei ole). Alueella ja Sijainnilla ei ole omaa syvyyttä (ne seuraavat kerrosta). Muokatessa näkyy perusarvo (palikan oma tai kerroksen), ei logiikan ohjaamaa. Kameran syvyys ja ilmaperspektiivi odottavat päätöstä.
- **Napautus ja pudotus osuvat siihen, missä palikka näkyy** (Appi-appi 72): hitaan tai lukitun kerroksen Alue ottaa napautuksen näkyvästä kohdastaan (myös zoomattuna), Napautus-liike vie hitaan kerroksen palikan napautettuun kohtaan (ruudukolla sen kerroksen ruudun keskelle), käytössä näkyvä kerroksen ruudukko siirtyy kerroksen mukana, ja käyttöraahattu palikka putoaa Alueeseen, jonka päällä se näkyy, vaikka ne olisivat eri vauhtisilla kerroksilla. Logiikan *siirto x / y* ei vaikuta osumaan. **Raja:** esteet ja törmäykset lasketaan yhä siirtämättömistä paikoista, joten eri vauhtisilla kerroksilla olevat palikat eivät törmää siellä, missä ne näkyvät.
- **Estää alempien käytön:** kun kerros näkyy ja estää, alempien kerrosten palikoita ei voi käyttää (esim. valikko tai taukoruutu).
- Logiikka voi ohjata kerroksen näkyvyyttä, estämistä, himmennystä, läpinäkyvyyttä ja syvyyttä (Kerros-palikka, ks. logiikkapalikoiden luku). Kerroksen rullausvauhtia ja kerrosten järjestystä ei voi ohjata logiikasta.

---

## Liike (`liike`)

Liike siirtää näkymän palikkaa ajan kuluessa: nopeuden, tatin, napautuksen, auton ohjauksen, piirretyn reitin tai ruutu kerrallaan -askelten mukaan. Esteet pysäyttävät liikkeen, alueet tunnistavat sen, ja massa ja kimmoisuus antavat törmäyksille fysiikan.

- **Löytyy:** Logiikka-välilehti, paletti **Liike ja aika → Liike**. Myös palikan paneelin osiosta **Este ja osuma-alue** napilla **＋ Liike**, kun palikalla on massa mutta ei liikettä (tekee Liikkeen, jonka kohde on tämä palikka).

### Ohjaustavat

Valitaan paneelin osiossa **Liike**, kohta **Ohjaus**:

| Valinta | Mitä tapahtuu | Tekninen `b.ohj` |
|---|---|---|
| **Nopeus x, y** | nopeus x ja y (px/s) kentästä tai nuolesta | `''` |
| **Tatti** | kulkee tatin suuntaan; mitä kauempana keskeltä, sitä kovempaa (enintään huippunopeus) | `tatti` |
| **Napautus** | kulkee lukitussa näkymässä napautettuun kohtaan (rengas näyttää kohteen) | `napautus` |
| **Auto** | kaasu vie keulan suuntaan, ohjaus kääntää | `auto` |
| **Reitti** | kulkee piirrettyä Reittiä pitkin | `reitti` |
| **Ruutu** | siirtyy ruudun kerrallaan (lautapeli) | `ruutu` |

### Sisään

| Kohta | Laji | Milloin | Mitä tekee |
|---|---|---|---|
| nopeus x | arvo | Nopeus x, y | px/s, positiivinen = oikealle |
| nopeus y | arvo | Nopeus x, y | px/s, positiivinen = alas |
| huippunopeus | arvo | muut ohjaustavat | px/s, oletus 200 (myös kenttä) |
| kohde x, kohde y | arvo | Napautus | kohde nuolesta (palikan keskipiste menee tähän); kun nuoli on, napautus ei ohjaa tätä Liikettä |
| kaasu | arvo | Auto | −1…1 (negatiivinen = jarru ja peruutus) |
| ohjaus | arvo | Auto | −1…1 (negatiivinen = vasemmalle) |
| ylös, alas, vasen, oikea | tapahtuma | Ruutu | yksi askel siihen suuntaan |
| liikkuu kun | arvo | kaikki | liike pysähtyy, kun ehto ei päde |
| hyppää | tapahtuma | ei Reitti eikä Ruutu | hyppy painovoimaa vastaan (ks. Hyppy) |
| lopeta hyppy | tapahtuma | ei Reitti eikä Ruutu | leikkaa nousun (lyhyt hyppy), esim. Painikkeen irrotettu |
| alkuun | tapahtuma | kaikki | palauttaa alkupaikkaan, nopeus nollaan |
| käynnistä, pysäytä | tapahtuma | Reitti | reitillä kulku käyntiin ja seis |

Lisäksi Ominaisuudet-osiosta voi avata ohjattavat kohdat `kitka`, `vauhtix`, `vauhtiy`, `kiihtyminen`, `jarrutus`, `liukkaus` ja (Auto) `kääntyvyys` (ks. Ominaisuudet).

### Ulos

| Kohta | Laji | Milloin | Mitä antaa |
|---|---|---|---|
| x, y | arvo | kaikki | paikka (kohteen vasen yläkulma) |
| liikkuu | arvo | kaikki | kyllä, kun liikkuu nyt |
| osuu esteeseen | arvo | kaikki | kyllä, kun este pysäyttää tai ohjaa liikettä |
| nopeus | arvo | kaikki | nopeus px/s (sisältää tönäisyn) |
| suunta | arvo | kaikki | kulkusuunta asteina, 0 = ylös, 90 = oikealle (Autolla keulan suunta) |
| törmäsi | tapahtuma | kaikki | uusi osuma esteeseen, rajaan tai toiseen kappaleeseen |
| maassa | arvo | ei Reitti eikä Ruutu | kyllä, kun seisoo jonkin päällä painovoiman suhteen (ks. Painovoima ja maassa) |
| alla | arvo | ei Reitti eikä Ruutu | sen palikan nimi, jonka päällä seisoo (tyhjä = ilmassa tai Liikkeen rajan päällä) |
| putoamisvauhti | arvo | ei Reitti eikä Ruutu | vauhti painovoiman suuntaan px/s (nouseva negatiivinen, ilman painovoimaa 0) |
| laskeutui | tapahtuma | ei Reitti eikä Ruutu | tuli maahan; tiedoissa `tapahtuma.kohde`, `.isku` (putoamisvauhti osumahetkellä) ja `.voima` |
| irtosi maasta | tapahtuma | ei Reitti eikä Ruutu | lähti maasta (hyppy tai putoaminen reunalta) |
| hyppäsi | tapahtuma | ei Reitti eikä Ruutu | hyppy lähti (myös ilmahyppy) |
| kohde x, kohde y | arvo | Napautus | nykyinen kohde (tyhjä, kun ei kohdetta) |
| perillä | tapahtuma | Napautus | keskipiste on kohteessa |
| ei pääse | arvo | Napautus + Kiertää esteet | kyllä, kun kohteeseen ei ole reittiä |
| askel valmis | tapahtuma | Ruutu | askel ruutuun valmis |
| edistyminen | arvo | Reitti | 0–1 reitin alusta loppuun |
| päässä | tapahtuma | Reitti | reitin pää (Kerran), kääntöpiste (Edestakaisin) tai kierros täynnä (Kierroksia) |

### Asetukset (paneeli)

**Osio Liike**

- **Liikutettava palikka:** valikosta näkymän palikka (ei Sijainti eikä Alue). Liike siirtää sitä suoraan, esteet ja alueet toimivat, ja alkupaikka on palikan oma paikka. Vaihtoehto **ei kohdetta (vain arvot x ja y)**: Liike laskee vain paikan x, y, jonka voi viedä nuolella näkymäpalikan kohtiin **siirto x** ja **siirto y** (siirto lisätään palikan paikkaan). Ilman kohdetta esteet, alueet ja törmäykset eivät toimi.
- **Ohjaus:** kuten taulukossa yllä.
- **Nopeus x (px/s)** ja **Nopeus y (px/s)** (Nopeus x, y): luku tai kaava kenttään ([arvokenttä](06-kaavat.md#arvokenttä-kaava-suoraan-paneelin-kentässä), esim. `@tatti.vaaka * 200`), tai nuoli kohtaan.
- **Huippunopeus (px/s)** (muut ohjaustavat): oletus 200. Ruudussa se on liukumisnopeus; iso luku (esim. 10000) hyppää suoraan ruutuun.
- **Tatti** (Tatti, Auto ja Ruutu): valikosta näkymän Tatti. Jos tattia ei ole, ohje käskee lisäämään sen (Ohjaimet → Tatti).
- **Kiertää esteet** (Napautus, kun liikutettava palikka on valittu): ks. Reitinhaku.
- **Kääntyvyys (°/s)** (Auto): oletus 180. Montako astetta auto kääntyy sekunnissa täydellä vauhdilla. Ohjattava (`kääntyvyys`).
- **Reitti**, **Kulku** ja **Alkaa heti, kun näkymä on käytössä** (Reitti): ks. Liike reittiä pitkin.
- **Askel (px)**, **Tatti** ja **Pyyhkäisy ohjaa** (Ruutu): ks. Liike ruutu kerrallaan.

**Osio Vauhti** (ei Ruudussa). Kentät ovat perusarvoja: `kiihtyminen`, `jarrutus` ja `liukkaus` ovat ohjattavia ominaisuuksia (nuoli, kaava, Aseta, Lisää, Palauta), esim. tallin renkaat: **Aseta** → Liike → `liukkaus` 60.

- **Kiihtyminen (s):** aika paikaltaan huippunopeuteen. Tyhjä tai 0 = heti. Enintään 60 s.
- **Jarrutus (s):** aika huippunopeudesta pysähdyksiin. Tyhjä tai 0 = heti. Napautuksessa ja kerran kulkevalla reitillä jarrutus alkaa ajoissa ennen kohdetta.
- **Vauhdin muoto:** **Suora**, **Kiihtyy (hidas alku)**, **Hidastuu (nopea alku)**, **S-käyrä** tai **Käyrä: nimi** (Käyrä-palikan portaat ovat vauhti prosentteina huipusta ajan kuluessa).
- **Liukkaus (%):** 0 = pito täysi. Liukkaalla todellinen nopeus seuraa haluttua viiveellä (100 % ≈ 1,5 s): vauhti säilyy ja suunnan muutos kestää (jää, avaruus). Autolla se näkyy sivuluisuna.

**Osio Törmäykset** (avattava, ei Ruudussa): ks. Massa, kimmoisuus ja kitka.

**Osio Hahmo** (vain kun liikutettava palikka on valittu)

- **Kääntyminen:** **Ei**, **Kulkusuuntaan** (palikka kiertyy kulkusuuntaan; osuma-alue ei kierry, joten ympyrä sopii parhaiten), **Peilaa sivuttain** (kuva peilautuu, kun suunta vaihtuu vasemman ja oikean välillä; sivulta kuvattu hahmo).
- **Kuva katsoo:** mihin suuntaan palikan kuva on piirretty. Kulkusuuntaan: Ylös (oletus), Oikealle, Alas, Vasemmalle. Peilaa: Oikealle (oletus) tai Vasemmalle.
- Kääntyminen kirjoittaa kohteen ominaisuudet `kierto` ja `peilattu`.

**Osio Rajat ja paikka**

- **Alku x**, **Alku y** (vain ilman kohdetta): aloituspaikka.
- **x vähintään**, **x enintään**, **y vähintään**, **y enintään**: valinnaiset rajat palikan vasemmalle yläkulmalle. Raja pysäyttää kuin seinä (Ruudussa raja estää askeleen, ja kimmoisalla palikalla raja pomppaa).
- Rivi **Paikka** näyttää nykyisen x, y ja napin **↺ Alkuun**.

### Ominaisuudet

Kaikki luettavia kaavassa (`liike.avain`); ohjattavat merkitty.

| Ominaisuus | Mitä |
|---|---|
| `x`, `y` (myös `arvo` = x) | paikka |
| `liikkuu` | kyllä, kun liikkuu nyt |
| `osuu` | kyllä, kun este pysäyttää tai ohjaa |
| `nopeus` | px/s |
| `suunta` | asteina |
| `kitka` (ohjattava, ei Ruudussa) | 0–100 %, oletus 50 |
| `kiihtyminen`, `jarrutus` (ohjattavia, ei Ruudussa) | sekunteina 0–60, oletus 0 = heti; perusarvo osiosta Vauhti |
| `liukkaus` (ohjattava, ei Ruudussa eikä Reitissä) | 0–100 %, oletus 0 |
| `kääntyvyys` (ohjattava, Auto; myös `kaantyvyys`) | °/s, oletus 180 |
| `vauhtix`, `vauhtiy` (ohjattavia, ei Ruudussa; myös `vauhti x`, `vauhti y`) | töytäisyvauhti px/s |
| `isku` (ei Ruudussa) | viimeisimmän törmäyksen voimakkuus px/s |
| `törmäyskohde` (ei Ruudussa) | palikka, johon viimeksi törmäsi (nimi) |
| `painovoima` (ohjattava, ei Reitissä eikä Ruudussa) | kuinka paljon Alueen painovoima vetää, %: 100 = sellaisenaan (oletus), 50 = kuu, 0 = ei välitä |
| `maassa`, `alla`, `putoamisvauhti` (ei Reitissä eikä Ruudussa) | kuten kohdat yllä |
| `hyppy` (ohjattava, ei Reitissä eikä Ruudussa) | hypyn korkeus px; tyhjä = 3 × liikutettavan korkeus |
| `ilmaohjaus` (ohjattava) | 0–100 %, oletus 100 = ohjaus ilmassa kuten maassa |
| `lyhythyppy` (ohjattava, kyllä/ei; myös `lyhyt hyppy`) | oletus kyllä: *lopeta hyppy* leikkaa nousun |
| `ilmahypyt` (ohjattava; myös `hyppyjä ilmassa`) | lisähyppyjä ilmassa, oletus 0, 1 = tuplahyppy |
| `armoaika`, `ennakko` (ohjattavia) | sekunteina 0–2, oletus 0,1 |
| `hyppyjäljellä` (myös `hyppyja jaljella`) | montako hyppyä voi tehdä nyt: maassa 1 + ilmahypyt, ilmassa jäljellä olevat ilmahypyt |
| `kohdex`, `kohdey` (Napautus; myös `kohde x`, `kohde y` ominaisuusvalikossa) | nykyinen kohde |
| `eipääse` (Napautus + Kiertää esteet; myös `eipaase`) | kyllä, kun kohteeseen ei ole reittiä |
| `edistyminen` (Reitti) | 0–1 reitin alusta loppuun |

Nämä neljä ovat kaavassa vain silloin, kun vastaava nuolikohta on (sama ohjaustapa ja asetus); muuten *tuntematon ominaisuus*.

### Kaavassa

`liike` antaa x:n. Esim. `liike.nopeus > 100`, `liike.suunta`, `liike.isku`, `liike.kohdex`, `liike.edistyminen >= 0,5`.

### Aika ja tila

- Paikka, nopeus ja muu liikkeen tila ovat käyttötietoa: ne säilyvät, kun appi suljetaan, ja tallentuvat noin kahden sekunnin välein liikkeen aikana.
- Liike etenee vain, kun appi on auki (kuvasilmukka). Kuvan pituus on enintään 0,25 s, joten tauon jälkeen hahmo ei hyppää.
- **alkuun** (tai ↺ Alkuun): kohde palaa perusarvoonsa (asetettu x ja y poistuu), nopeus nollautuu. Reitillä käynnissä/pysäytetty-tila säilyy.
- **törmäsi** lähtee kerran osuman alkaessa, ei joka kuvassa, kun palikka painaa seinää. Painovoimassa se lähtee kerran jokaisesta uudesta kohteesta (ks. Painovoima ja maassa).

### Esimerkki

Lähtötilanne: puhelinnäkymässä Ympyrä *Pallo* (40 × 40) ja oikealla Laatikko *Seinä*, jonka paneelissa on rasti **Este: liikkuvat palikat eivät mene läpi**. Logiikkaan Liike, **Liikutettava palikka** Pallo, Ohjaus **Nopeus x, y**, Nopeus x 100. Lukitse: pallo kulkee oikealle 100 px sekunnissa ja pysähtyy seinään; **osuu esteeseen** on kyllä ja **törmäsi** lähti kerran. Jos lisäät Nopeus y 100, pallo liukuu seinää pitkin alas.

Toisenlainen käyttö: Liike ilman kohdetta, Nopeus x 50. Vie nuoli **x** → Teksti-palikan **siirto x**. Teksti valuu oikealle (siirto lisätään sen omaan paikkaan, esteitä ei huomioida).

### Huomio

- Liike ei näy muokatessa. Lukitse kokeillaksesi.
- Yksi Liike liikuttaa yhtä palikkaa. Usealle hahmolle tehdään useampi Liike.
- Reitinhaku koskee vain Napautusta; Tatti ja Auto eivät kierrä esteitä.
- Liike ilman ohjausta (Nopeus x, y tyhjänä) liikkuu vain törmäyksistä ja töytäisyistä (pallo, kiekko).

---

## Ohjaustapojen yksityiskohdat

### Tatti ja liike

Tatti (`tatti`, paletti **Ohjaimet → Tatti**, oletus 160 × 160) on näkymän ohjain. Lukitussa näkymässä nuppia vedetään sormella tai hiirellä, ja se palaa keskelle, kun sormi nousee.

- **Ulos:** **etäisyys** keskeltä 0…1, **vaaka** −1…1 (oikealle +), **pysty** −1…1 (**alas +**), **suunta** asteina (0 = ylös, 90 = oikealle), tapahtumat **alkaa** (sormi painaa) ja **loppuu** (sormi nousee).
- **Kaavassa:** `tatti.vaaka`, `tatti.pysty`, `tatti.suunta`, `tatti.etäisyys` (myös `etaisyys`), `tatti` = etäisyys.
- Tatin ja liikkeen yhdistäminen, neljä tapaa:
  1. Liike, Ohjaus **Tatti**, kohta **Tatti** = tämä tatti. Huippunopeus kerrotaan tatin etäisyydellä.
  2. Liike, Ohjaus **Auto**: tatti ylös = kaasu, alas = jarru ja peruutus, sivulle = ohjaus.
  3. Liike, Ohjaus **Ruutu**: kun tattia pitää yli puolivälin, hahmo astuu ruudun toisensa perään sinne, mihin tatti osoittaa eniten.
  4. Liike, Ohjaus **Nopeus x, y**: Kaava `tatti.vaaka * 200` nopeus x:ään ja `tatti.pysty * 200` nopeus y:hyn. Kiihtyvä ohjaus: etäisyys tai vaaka Käyrän syötteeksi.
- Tatti kannattaa laittaa kerrokseen, jonka rullausvauhti on lukittu, jotta se pysyy ruudulla maailman liikkuessa.

### Napautus kohteeseen

- Lukitussa näkymässä napautus maailmaan (ei painikkeeseen, kenttään tai tattiin) asettaa kaikkien näkymän Napautus-liikkeiden kohteen. Palikan keskipiste kulkee kohteeseen; rengas näyttää kohteen.
- Jos liikutettavan palikan kerroksella on ruudukko, kohde osuu napautetun ruudun keskelle.
- Kun näkymässä on Napautus-liike, yhden sormen veto ei rullaa.
- **perillä** lähtee, kun keskipiste on alle 0,5 px:n päässä kohteesta. Sen jälkeen kohde tyhjenee.
- Ilman Kiertää esteet -valintaa palikka kulkee suoraan kohti ja jää esteen taakse (liukuu reunaa pitkin).

### Auto

- Kaasu −1…1 ja ohjaus −1…1 tulevat Tatista (kun nuolia kaasuun ja ohjaukseen ei ole) tai nuolista (esim. painikkeista Kaavan kautta).
- Keula alkaa ylöspäin. Peruutus on puolella vauhdilla. Suunnanvaihdossa jarrutetaan ensin nollaan. Paikallaan auto ei käänny.

---

## Esteet ja osuma-alue

Este on näkymäpalikka, jonka läpi liikkuvat palikat eivät mene. Liikkuja liukuu esteen reunaa pitkin.

**Kädenliikkeet:** valitse näkymäpalikka → paneelin osio **Este ja osuma-alue**:

- **Este: liikkuvat palikat eivät mene läpi** (valintaruutu). Tai koko kerros: Kerrokset-osiossa kerrosrivin **tiiliseinä**. Tai logiikasta: ominaisuus `este` (avaa Ominaisuudet-osiosta ohjattavaksi; silloin se ohittaa oman ja kerroksen asetuksen).
- Kun palikka on este tai sitä liikuttaa Liike, näkyvät lisäksi:
  - **Osuma-alue:** **Muodon mukaan** (ympyrän muotoinen Muoto = ympyrä, muu = laatikko), **Laatikko**, **Ympyrä**. Ympyrän säde = puolet lyhyemmästä sivusta.
  - **Osuma-alueen koko (%):** 100 = palikan kokoinen, sallittu 10–200, keskitettynä. Pienempi on armollisempi hahmolle, jonka kuvassa on tyhjää reunoilla. Muokatessa osuma-alue näkyy katkoviivana.
  - **Massa** ja **Kimmoisuus (%)**: ks. alla.

Säännöt:

- Piilossa oleva palikka ei ole este.
- Liike jaetaan pieniin askeliin, joten nopeakaan liikkuja ei mene ohuen esteen läpi.
- Kun este pysäyttää, Liikkeen **osuu esteeseen** = kyllä ja **törmäsi** lähtee.
- Sijainti ja Alue eivät voi olla esteitä.
- Tekninen: `b.este`, kerroksen `k.este`, `b.osu`, `b.osk`.

## Massa, kimmoisuus ja kitka

Massa ja kimmoisuus ovat näkymäpalikan ominaisuuksia, kitka on Liikkeen ominaisuus. Niillä törmäykset tönäisevät: kevyt lentää, painava työntää, kimmoisa pomppaa.

**Kädenliikkeet:**

- Näkymäpalikan paneeli → **Este ja osuma-alue** → **Massa** (tyhjä = ei massaa) ja **Kimmoisuus (%)** (0–200, oletus 0).
- Liikkeen paneeli → avattava osio **Törmäykset** → **Kitka (%)** (0–100, oletus 50). Osio aukeaa itsestään, kun kitkaa on muutettu tai kohteella on massa. Se näyttää esimerkin (esim. ”300 px/s → pysähtyy … s:ssa, liukuu … px”) ja nykyisen tönäisyn ja viimeisimmän iskun.

Säännöt:

- **Massa:** vain suhteilla on väliä (1 ja 3 toimii kuten 10 ja 30). Massaton palikka ei reagoi törmäyksiin, mutta tönäisee massallisia (kuin puskutraktori). Kaksi massatonta toimii toisilleen seininä kuten ennen.
- Massallinen pari ratkaistaan, kun molemmat ovat samassa näkymässä, ainakin toinen on este ja ainakin toisella on massa.
- Massallinen palikka ilman Liikettä ei voi liikkua törmäyksestä. Paneeli varoittaa ja tarjoaa napin **＋ Liike**.
- **Kimmoisuus:** 0 = tömähtää, 100 = pomppaa täysin, yli 100 = pomppulevy. Toimii myös ilman massaa (seinät ja Liikkeen rajat). Parin suurempi kimmoisuus ratkaisee.
- **Tönäisy (töytäisyvauhti)** tulee ohjauksen päälle, joten ohjattukin hahmo lennähtää. **Kitka** hiiputtaa sitä: 0 = ei koskaan, 100 = heti.
- **Liukkaus ≠ kitka:** liukkaus = miten ohjaus tarttuu, kitka = miten tönäisy hiipuu.
- Lyönti tai potku: toiminto **Lisää** → Liike → `vauhtix` (esim. 300 tai kaava `tatti.vaaka * 800`). **Aseta** 0 pysäyttää. **Palauta** poistaa asetetun. Nuoli kohtaan vauhtix tai vauhtiy ohjaa tönäisyä jatkuvasti (silloin kitka ei hiiputa).
- **törmäsi** lähtee jokaisesta uudesta kosketuksesta molempien Liikkeille. Tapahtuman tiedoissa `tapahtuma.kohde` ja `tapahtuma.isku` (lähestymisnopeus). Liikkeellä `isku` ja `törmäyskohde`.
- Reitillä kulkeva on kiskoilla: se tönäisee muita kuin massaton eikä itse hätkähdä. Ruutuliikkeessä massa ei vaikuta.
- Rajat: osuma-alue ei kierry, ei pyörimistä, ei seinän pintakitkaa. Painovoima: ks. seuraava osio.

## Painovoima ja maassa

Painovoima on **Alueen** ominaisuus (jonon 16, 2D-pelien vaihe A): alue vetää liikkuvia, joiden keskipiste on sen sisällä. Koko maailma = yksi iso Alue; tikkaat, vesi ja avaruus ovat pienempiä Alueita sen päällä.

**Kädenliikkeet:**

1. Alueen paneeli → avattava osio **Painovoima** → **Painovoima (px/s²)**, esim. 2000 (tavallinen 1800–2500). Tyhjä = alue ei koske painovoimaan. Paneeli näyttää, kuinka nopeasti putoaa (”putoaa 100 px 0,32 s:ssa”). Osio on auki, kun painovoima on annettu.
2. **Suunta:** Alas (oletus), Ylös, Vasen tai Oikea.
3. **Ilmanvastus (%)** (oletus 0): hiiputtaa putoamista ja töytäisyä alueella. Putoamisvauhti lähestyy rajaa painovoima / (3 × ilmanvastus/100), esim. 1500 ja 50 % → noin 1000 px/s. Vesi = pieni painovoima ja ilmanvastus.
4. Liikkeen paneeliin tulee osio **Painovoima**, kun kohteen näkymässä on painovoima-Alue tai Liikkeen painovoimaa on muutettu: **Painovoima (%)** (100 = sellaisenaan, 50 = kuu, 0 = ei välitä, esim. lintu tai liikkuva taso) ja rivi **Nyt** (maassa ja minkä päällä, tai ilmassa, ja putoamisvauhti).

**Säännöt:**

- Koskee Liikkeen kohteita (ohjaukset Nopeus x, y, Tatti, Napautus ja Auto; ei Reittiä eikä Ruutua). Alueen **Tunnistaa**-valinta rajaa, ketä se vetää.
- **Päällekkäisistä Alueista päällimmäinen ratkaisee** (kerros, sitten järjestys, sitten myöhemmin lisätty). Painovoima 0 päällimmäisellä alueella = ei painovoimaa siinä kohdassa, vaikka alempi vetää (tikkaat: pystyohjaus toimii taas).
- **Ohjaus vain poikittain:** painovoimassa ohjauksen pystyosa ei liikuta (Nopeus y, tatti ylös); pystysuunta kuuluu painovoimalle. Vino tatti antaa poikittaisen osansa. Tatin pystyasento on yhä luettavissa (`tatti.pysty`), esim. kyykkyyn.
- **Kitka vain maassa** ja vain maan suuntaiseen töytäisyyn; ilmassa vain ilmanvastus. Heitetty esine lentää siis paraabelin.
- **Maassa** = jokin askeleen osumista tulee painovoimaa vastaan (enintään noin 45° kalteva pinta; käytännössä laatikon tai ympyrän päällä). Myös Liikkeen raja (esim. y enintään) on maa, silloin `alla` on tyhjä. Toisen kappaleen (massallinen laatikko omalla Liikkeellään) päällä seisominen toimii.
- **laskeutui** lähtee, kun kappale tulee maahan, ja **irtosi maasta**, kun se lähtee maasta, myös kun se poistuu painovoima-Alueelta tai painovoima asetetaan tyhjäksi (silloin `maassa` = ei; Appi-appi 75). Tiedoissa `tapahtuma.kohde` (alusta), `tapahtuma.isku` (putoamisvauhti osumahetkellä, askeleen tarkkuudella) ja `tapahtuma.voima` (massallisella (1 + kimmoisuus) × isku × massa, massattomalla = isku; toisen kappaleen päällä impulssi).
- **Painovoimassa törmäsi lähtee kohteittain:** maassa kävelevä saa törmäsi-tapahtuman myös, kun osuu seinään tai viholliseen (ilman painovoimaa törmäsi lähtee kuten ennen, kun osuminen alkaa). **Alustan vaihtuminen ei ole törmäys** (Appi-appi 75): kun maassa kävelevä siirtyy laatalta toiselle (lattia monesta Muodosta), törmäsi ei lähde; vaihdosta kertoo `alla`. Laskeutuminen, seinä ja katto lähettävät törmäsin kuten ennen.
- **Törmäsi-tietoihin `tapahtuma.puoli` ja `tapahtuma.voima`:** painovoimassa puoli on *ylhäältä* (osui päältä, esim. litistys), *alhaalta* (pää osui) tai *sivulta*; ilman painovoimaa *ylhäältä*, *alhaalta*, *vasemmalta* tai *oikealta* ruudun suhteen. Voima = impulssi (massa × vauhdin muutos; ilman massaa = isku).
- **Painovoiman kääntö:** toiminto **Aseta** → Alue → `suunta` (ylös), tai **Aseta** → `painovoima`. Hahmon maassa-tieto ja ohjaus kääntyvät mukana. Suunta kaavassa ja toiminnossa: `alas`, `ylös`, `vasen`, `oikea` tai 1–4.
- **Hyppy:** Liikkeen kohta **hyppää** (ks. Hyppy alla). Vanha kiertotie **Aseta** → `vauhtiy` toimii yhä.
- **Tasainen aika:** kun projektissa on painovoima-Alue, liike lasketaan kiinteinä 1/120 s:n askelina, joten putoaminen ja lentorata ovat samat 30, 60 ja 120 Hz:n näytöllä. Yhdessä kuvassa on enintään 8 askelta: alle 15 kuvaa sekunnissa peli hidastuu eikä hyppää. Ilman painovoima-Aluetta liike lasketaan kuten ennen.
- **Liikkuva taso kantaa** (jonon 22, Appi-appi 82): maassa oleva kulkee alustansa mukana, liikkui alusta millä tavalla tahansa (oma Liike, Reitti, Muutos ajassa, kaava tai toiminto). Nouseva taso nostaa ja laskeva laskee ilman *irtosi maasta* -tapahtumaa; alustan oma Liike ei törmää päällä seisovaan, joten hissi ei pysähdy matkustajaansa. Oma kävely lisätään tason liikkeeseen. Este pysäyttää kannon (seinä tason vieressä työntää matkustajan pois tasolta). Hyppy irrottaa, ja ilmassa ei kanneta. Valmis taso: rakennuslaatikon Esineet → **Liikkuva taso**. Tason Liikkeelle Painovoima 0 %, jos se on painovoima-Alueella eikä kulje Reittiä.
- Kuvasilmukka pysähtyy, kun kaikki ovat maassa ja paikallaan, ja käy, kun jokin on ilmassa.

**Ominaisuudet:** Alueella `painovoima`, `suunta` ja `ilmanvastus` (kaikki ohjattavia), Liikkeellä `painovoima` (%), `maassa`, `alla`, `putoamisvauhti` ja hypyn ominaisuudet (ks. Hyppy).

**Esimerkki:** Näkymään Alue *Maailma* (koko näkymä, Painovoima 2000), sen alareunaan Laatikko *Lattia* (Este) ja ylös Laatikko *Pelaaja* (Este). Logiikkaan Liike, Liikutettava palikka Pelaaja, Ohjaus Tatti. Lukitse: pelaaja putoaa lattialle, `liike.maassa` = kyllä, `liike.alla` = Lattia. Hyppy: ks. seuraava osio.

**Rajat:** ei kaltevia pintoja (osuma-alue on laatikko tai ympyrä). Liikkuvalta tasolta hypätessä tason vauhti ei siirry hyppyyn, eikä katon ja tason väliin jäävä litisty (taso menee sisään).

## Hyppy

Liike hyppää painovoimaa vastaan (jonon 17, 2D-pelien vaihe B). Toimii vain painovoima-Alueella (ilman painovoimaa *hyppää* ei tee mitään), Ohjauksella Nopeus x, y, Tatti, Napautus tai Auto (ei Reitti eikä Ruutu).

1. Vedä nuoli kohtaan **hyppää**, esim. Painikkeesta, jonka toiminta on *Pohjassa vain painettaessa* (painettu → hyppää, irrotettu → **lopeta hyppy**), Peliohjaimen napista tai näppäimestä.
2. Liikkeen paneelin osio **Hyppy** (Painovoima-osion alla; auki, kun *hyppää*- tai *lopeta hyppy* -kohtaan on nuoli tai asetuksia on muutettu). Jos nuoli on, mutta näkymässä ei ole painovoima-Aluetta, osio näkyy yksinään ja kertoo ensimmäisellä rivillä **Painovoima puuttuu: lisää Alueelle painovoima** (Appi-appi 75):
   - **Hypyn korkeus (px)**: tyhjä = 3 × liikutettavan korkeus. Paneeli näyttää ponnistuksen ja ilma-ajan (”= ponnistus 800 px/s, ilmassa 0,8 s”). Ponnistus lasketaan √(2 × painovoima × korkeus), joten korkeus pysyy samana, vaikka painovoimaa muutetaan.
   - **Ilmaohjaus (%)** (oletus 100): 100 = ohjaus ilmassa kuten maassa, 60 = tasoloikkamainen, 0 = lähtövauhti ratkaisee (puhdas lentorata). Koskee myös reunalta putoamista.
   - **Lyhyt hyppy** (oletus päällä): *lopeta hyppy* nousun aikana leikkaa nousuvauhdin 40 %:iin. Lyhyt painallus = matala hyppy, pitkä = täysi.
   - **Hyppyjä ilmassa** (oletus 0; 1 = tuplahyppy). Ilmahyppy nousee korkeuden verran siitä kohdasta.
   - **Armoaika (s)** (oletus 0,1): reunalta pudonnut voi vielä hypätä maasta. **Ennakko (s)** (oletus 0,1): juuri ennen laskeutumista painettu hyppy tehdään laskeutuessa.
   - Rivi **Nyt**: hyppyjä jäljellä.
3. Tapahtuma **hyppäsi** lähtee jokaisesta hypystä; *irtosi maasta* lähtee kuten ennen.

- Vaakavauhti säilyy hypyssä, joten juoksuhyppy kantaa pidemmälle kuin paikaltaan hyppy. Massa ei vaikuta hyppyyn.
- Käännetty painovoima: hyppy lähtee aina painovoimaa vastaan (katossa alaspäin).
- Hyppy korvaa painovoiman suuntaisen vauhdin (putoava ilmahyppy ei kumoudu putoamisvauhtiin).
- **Ladattava hyppy:** Sekuntikello + Kaava → ominaisuus `hyppy` (ohjattava), tai **Aseta** → `hyppy`.

**Esimerkki:** Painovoima-osion esimerkin päälle Painike *Hyppää* (Pohjassa vain painettaessa), nuolet *painettu* → Liikkeen **hyppää** ja *irrotettu* → **lopeta hyppy**, Hypyn korkeus 160. Lukitse ja paina: pelaaja nousee 160 px; napauta lyhyesti: matala hyppy.

**Rajat:** ei seinähyppyä eikä seinässä liukumista; ilmaohjaus koskee ohjausvauhtia (ei töytäisyvauhtia); *hyppää* ilman painovoimaa ei tee mitään.

---

## Alue ✦ (`alue`)
✦ Poikkeus: paikka ilman näkyvää sisältöä, joten sillä ei ole näkyy kun -kohtia eikä käyttöraahausta.

Alue on näkymättömä suorakulmio tai ellipsi, joka tietää, kun liikkuva palikka on sen sisällä, ja ottaa vastaan napautuksia. Se toimii myös maailman rajana, vapaan näkymän rullausrajana ja raahauksen pudotuskohtana.

- **Löytyy:** Näkymä-välilehti, paletti **Koristeet → Alue** (oletus 640 × 420). Nopeammin: kanvaasin alareunan nappi **⛶ Alue** (vain muokatessa) tekee käyttönäkymän ruudun kokoisen alueen tähän kohtaan. Kokoa muutetaan kulmasta.
- **Sisään:** ei kohtia.
- **Ulos:**

| Kohta | Laji | Mitä |
|---|---|---|
| sisällä | arvo | kyllä, kun tunnistettava on sisällä |
| montako sisällä | arvo | montako tunnistettavaa on sisällä |
| astuttu | tapahtuma | joku tunnistettava tuli sisään |
| poistuttu | tapahtuma | joku tunnistettava lähti |
| napautettu x, napautettu y | arvo | viimeksi napautettu kohta: px alueen vasemmasta yläkulmasta, tai ruutu (kun Ruutu kerrallaan) |
| napautettu | tapahtuma | aluetta napautettiin lukitussa näkymässä. Tiedoissa `tapahtuma.x` ja `tapahtuma.y` (px alueen vasemmasta yläkulmasta, kuten napautettavalla) ja Ruutu kerrallaan -alueella `tapahtuma.ruutux` ja `tapahtuma.ruutuy` (Appi-appi 70) |
| ruutu x, ruutu y | arvo | vain kun Ruutu kerrallaan: tunnistettavan ruutu alueen sisällä (1 = vasen yläruutu) |
| ruutu vaihtui | tapahtuma | vain kun Ruutu kerrallaan: tunnistettava siirtyi toiseen ruutuun alueen sisällä |

- **Asetukset (paneeli), osio Sisältö:**
  - **Tunnistaa:** **kaikki liikkuvat (Liike-palikoiden kohteet)** (oletus) tai yksi saman näkymän palikka.
  - **Muoto:** **Suorakulmio** tai **Ellipsi**.
  - **Ruutu kerrallaan:** **ei (koko alue)** tai kerroksen ruudukko (listassa vain kerrokset, joilla on ruudukko).
  - Rivi **Sisällä nyt** näyttää, kuka on sisällä.
- **Asetukset, osio Paikka ja koko:** X, Y, Leveys, Korkeus.
- **Asetukset, osio Painovoima** (avattava): **Painovoima (px/s²)**, **Suunta**, **Ilmanvastus (%)**; ks. Painovoima ja maassa.
- **Ominaisuudet:** `sisällä` (myös `sisalla`), `montako`, `napautettux`, `napautettuy`, `ruutux` ja `ruutuy` (vain Ruutu kerrallaan), `painovoima`, `suunta`, `ilmanvastus` (ohjattavia), `x`, `y`, `leveys`, `korkeus` (paikka ja koko ohjattavia).
- **Kaavassa:** `alue.sisällä` ja `alue` (sama). Esim. `aarre.montako > 0`.
- **Aika ja tila:**
  - Sisällä = tunnistettavan **keskipiste** on alueen sisällä.
  - Tunnistus tehdään liikkeen kuvasilmukassa, eli kun jokin liikkuu lukitussa näkymässä.
  - **astuttu** ja **poistuttu** lähtevät sillä hetkellä, kun joku tulee tai lähtee. Jos sisällä on jo joku ja toinen tulee, astuttu lähtee uudelleen.
  - Napautus kirjataan vain, jos kohdista **napautettu**, **napautettu x** tai **napautettu y** lähtee nuoli tai Alue on sellaisen Joukon jäsen, jonka kohdasta *jäsen napautettu* lähtee nuoli (Appi-appi 70; ennen joukon nuoli ei riittänyt ilman Alueen omaa nuolta). Silloin yhden sormen veto ei rullaa näkymää.
- **Esimerkki:** ks. resepti ”Alue, johon astuminen näyttää viestin”.
- **Huomio:**
  - Ei näy käytössä. Muokatessa se näkyy kehyksenä nimineen.
  - Ilman Liikettä alue ei tunnista mitään, ellei Tunnistaa-kohtaan ole valittu palikkaa (ja silloinkin vain, kun kuvasilmukka käy).
  - Alue ei ole este. Seinäksi tehdään Muoto tai muu palikka, jolla on Este.
  - Painovoima-Alue vaikuttaa aina, kun kuvasilmukka käy, myös silloin, kun kukaan ei astu sisään tai ulos.
  - Sama Alue voi olla Maailman rajat (laitenäkymä), Alueen sisällä -rajaus (vapaa näkymä), Siirry-toiminnon kohde ja käyttöraahauksen pudotuskohde.

---

## Reitti ✦ (`reitti`)
✦ Poikkeus: pelkkä esitys, ei anna arvoa ulos logiikkaan.

Reitti on pisteistä piirretty viiva, jota pitkin Liike voi kulkea. Se voi näkyä käytössä katkoviivana tai olla näkymätön.

- **Löytyy:** Näkymä-välilehti, paletti **Koristeet → Reitti**. Uusi reitti on vaakaviiva, jossa on kaksi pistettä 240 px:n päässä toisistaan.
- **Sisään / Ulos:** ei kohtia (kulkija on Liike).
- **Asetukset (paneeli), osio Sisältö:**
  - Rivi **Reitti: N pistettä**.
  - **＋ Jatka reittiä**: aloittaa piirron, uudet pisteet tulevat loppuun. Nappi muuttuu muotoon **● Piirretään…**; uusi napautus lopettaa.
  - **✎ Piirrä uudelleen**: tyhjentää pisteet ja aloittaa piirron.
  - **Suljettu reitti (viimeisestä takaisin alkuun)** (valintaruutu).
  - **Näkyy käytössä:** **Ei** tai **Katkoviivana**.
  - Rivi kertoo kulkijat, tai että kulkija on Liike, jonka ohjaus on Reitti.
- **Ominaisuudet:** `pituus` (px), `pisteitä` (myös `pisteita`), lisäksi näkymäpalikan tavalliset (paikka, koko, väri ym.).
- **Kaavassa:** `reitti.pituus`, `reitti.pisteitä`.

### Pisteiden muokkaus

Pisteet näkyvät ja muokkautuvat vain muokatessa.

1. Valitse Reitti ja paina **＋ Jatka reittiä** tai **✎ Piirrä uudelleen**.
2. Napauta kanvaasia piste kerrallaan järjestyksessä. Pisteet kohdistuvat ruudukkoon (kerroksen ruudukkoon, jos sellainen on, muuten 10 px:n välein). Tietokoneella ⇧ pohjassa ilman kohdistusta.
3. Lopeta napilla **Valmis** kanvaasin vihjepalkissa (tai paneelin napilla ● Piirretään…).
4. **Siirrä pistettä:** vedä sitä (hiirellä tai sormella).
5. **Poista piste:** kaksoisnapauta tai kaksoisnapsauta sitä. Reitissä on oltava vähintään kaksi pistettä.
6. Täytetty, isompi piste on reitin **alku**.

Reitissä voi olla enintään 200 pistettä. Palikka on pisteiden rajaama laatikko: jos piste viedään yli reunan, laatikon kulma siirtyy. Koko reitin voi siirtää vetämällä palikkaa.

### Liike reittiä pitkin

Liikkeen paneeli, Ohjaus **Reitti**:

- **Reitti:** valikosta Reitti-palikka.
- **Kulku:** **Kerran** (pysähtyy päähän; käynnistä lähtee päästä uudelleen alusta), **Edestakaisin** (kääntyy päissä), **Kierroksia** (päästä takaisin alkuun; suljettu reitti jatkuu sujuvasti, avoin hyppää alkuun).
- **Alkaa heti, kun näkymä on käytössä** (oletus päällä). Pois päältä: kulku alkaa vasta **käynnistä**-tapahtumasta.
- Vauhti kuten muillakin (huippunopeus, kiihtyminen, jarrutus, muoto).
- Liikutettavan palikan **keskipiste** kulkee reitillä. Ensimmäisessä kuvassa palikka siirtyy reitin kohtaan.
- Reitillä kulkeva **ei törmää** (se on kiskoilla), mutta voi itse olla este muille.
- Logiikkaan **edistyminen** 0–1 ja tapahtuma **päässä**.

---

## Laattakartta (`laatat`)

Laattakartta on ruudukko, johon maalataan laattoja klik klik: seinät, lattiat, tasot ja koristeet. Yksi palikka on yksi kartta, joten sillä on näkymäpalikan tavalliset asiat (paikka, kerros, näkyy kun, siirto, animointi). Kiinteät laatat ovat esteitä kuten Este-palikat, mutta moottori hakee vain liikkujan kohdalla olevat ruudut, joten iso kartta ei hidasta. Appi-appi 81 (2D-pelien vaihe C).

- **Löytyy:** Näkymä-välilehti, paletti **Koristeet → Laattakartta**. Uusi kartta on 16 × 10 ruutua, ruutukoko 32 px, lajit *Seinä* (kiinteä, väri 1) ja *Koriste* (läpi, väri 5).
- **Sisään:** näkymäpalikan yhteiset kohdat (näkyy kun, harmaana kun, vaihtoväri kun, siirto x/y). **Ulos:** **laattoja** (maalattujen laattojen määrä).
- **Asetukset (paneeli), osio Sisältö:**
  - **Maalaa**: aloittaa maalauksen (nappi muuttuu muotoon **● Maalataan…**, uusi napautus lopettaa).
  - **Ruutukoko px** (4–256), **Sarakkeet** ja **Rivit** (1–200). Palikan koko on sarakkeet × ruutukoko. Kulman venytys ja *Paikka ja koko* -kentät pyöristyvät kokonaisiin ruutuihin; pois jääneet laatat poistuvat (Kumoa palauttaa).
  - **Laattalajit:** jokaisella nimi, laattojen määrä, tapa **kiinteä** / **läpi** / **taso**, väri paletista 1–8 ja (kiinteällä ja tasolla) **Kimmoisuus %** (0 = tömähtää, 100 = pomppaa, yli 100 = pomppulevy). **×** poistaa lajin ja pyyhkii sen laatat. **＋ Uusi laji** (enintään 35).
- **Ominaisuudet:** `sarakkeet`, `rivit`, `ruutukoko` (luettavia), `määrä` (kaikki laatat), `määrä.<lajin nimi>`, lisäksi näkymäpalikan tavalliset (näkyy, paikka, koko, väri ym.). Laattakartalla ei ole omaa `este`-, `massa`- eikä `kimmoisuus`-ominaisuutta: ne ovat lajeilla. `leveys` ja `korkeus` ovat pikseleinä kuten muillakin.
- **Kaavassa:** `@kartta.määrä.seinä`, `@kartta.määrä` (lajin nimi pienellä, ä ja ö käyvät myös a:na ja o:na, välilyönti = `_`), `@kartta.sarakkeet`.

### Maalaus

1. Valitse kartta ja paina **Maalaa**. Näkymän alalaitaan tulee työkalurivi: lajit, **⌫ Pyyhi**, siveltimet **1**, **2×2**, **3×3** ja **Täyttö** sekä **Valmis**.
2. Napauta tai vedä kartalla. **Ensimmäinen ruutu päättää:** jos se on jo valittua lajia, veto pyyhkii, muuten maalaa.
3. Tietokoneella **oikea painike pyyhkii**, numerot **1–9** valitsevat lajin ja **⇧ + napautus** vetää suoran viivan edellisestä ruudusta.
4. **Täyttö** täyttää yhtenäisen samanlaisen alueen (tyhjän tai saman lajin) valitulla lajilla.
5. Yksi veto tai täyttö on yksi **Kumoa**. **Esc** tai **Valmis** lopettaa. Napautus kartan ulkopuolelle valitsee ja rullaa kuten ennen.

### Laattojen tavat

- **Kiinteä:** este liikkuville palikoille (Liikkeen kohteet), kaikilla ohjaustavoilla. Liikkuja liukuu reunaa pitkin; vierekkäisten laattojen sauma ei pysäytä eikä lähetä uutta *törmäsi*-tapahtumaa. Reitinhaku (Napautus, *Kiertää esteet*) ja Ruutu kerrallaan -liike näkevät kiinteät laatat. *Törmäsi*-tietojen `tapahtuma.kohde` ja Liikkeen `alla` = kartan nimi.
- **Läpi:** koriste, ei estä.
- **Taso:** läpi alhaalta ja sivulta, mutta päälle voi pudota ja sen päällä voi seistä (hyppy tason läpi ylös). Ylös = ruudun ylös myös käännetyssä painovoimassa. Ruutu kerrallaan -liikkeelle ja reitinhaulle taso ei ole este.
- Piilossa oleva kartta ei estä.

Huomio: alas painamalla tason läpi pudottaminen, laatan lajin tunnistus (*astuttu*, `alla` = laji), Maalaa laatta -toiminto ja laatan oma kitka eivät ole vielä tehty (vaihe D). Tekninen: `rk`, `lw`, `lh2`, `lj` (`c`, `n`, `hue`, `t`, `kim`), `lrt` (rivit merkkijonoina, `.` = tyhjä).

## Reitinhaku esteiden ohi

Napautus-liike voi kiertää esteet lyhintä reittiä.

**Kädenliikkeet:** Liikkeen paneeli → Ohjaus **Napautus** → valitse Liikutettava palikka → rasti **Kiertää esteet**.

- Reitti haetaan, kun kohde vaihtuu, ja uudelleen, kun palikka törmää (enintään kahdesti sekunnissa). Kohde voi tulla myös nuolesta (kohde x, kohde y).
- Ruudukon kanssa reitti kulkee ruutujen keskeltä. Ilman ruudukkoa hakuverkon väli on puolet osuma-alueen lyhyemmästä sivusta (4–64 px).
- Jos kohteeseen ei pääse, palikka kulkee niin lähelle kuin pääsee, ja **ei pääse** = kyllä.
- Haettua reittiä ei näytetä ruudulla.
- Haku ulottuu enintään kaksinkertaisen matkan (vähintään 400 px) päähän lähdöstä ja kohteesta; hyvin isossa maailmassa hakuverkkoa harvennetaan.
- Tatti, Auto, Reitti ja Ruutu eivät kierrä esteitä.

---

## Ruudukko kerroksen ominaisuutena

Kerrokselle voi antaa ruudukon. Silloin palikat kohdistuvat ruutuihin, napautus kohteeseen osuu ruudun keskelle, ruutuliike kulkee ruuduittain ja Alue voi kertoa ruudun.

**Kädenliikkeet:** näkymän asetukset → Kerrokset → kerrosrivin **▦** (uusi ruudukko on 40 px). Kerrosrivin alle tulee rivi:

- **ruutukoko** (px, vähintään 4),
- **tihennys:** **koko ruutu**, **½ ruutua**, **⅓ ruutua**, **¼ ruutua** (kohdistus ruudun osiin),
- **näkyy muokatessa** / **näkyy aina** (myös käytössä) / **ei näy**,
- **kohdista** (valintaruutu, oletus päällä): palikat kohdistuvat ruudukkoon raahatessa.

Uusi ▦-napautus poistaa ruudukon. Ruudut alkavat kanvaasin kohdasta (0, 0).

Mitä ruudukko vaikuttaa:

- Kaikilla kerroksen näkymäpalikoilla luettavat ominaisuudet `ruutux` ja `ruutuy`: keskipisteen ruutu (1 = ensimmäinen). Ilman ruudukkoa ne ovat tyhjiä.
- Napautus kohteeseen osuu ruudun keskelle, jos liikkuvan palikan kerroksella on ruudukko.
- Ruutuliikkeen askel on ruudun kokoinen.
- Reitinhaku kulkee ruutujen keskeltä.
- Alue, jonka **Ruutu kerrallaan** on tämä kerros, kertoo ruudun x, y ja ruudun vaihtumisen.
- Reitin pisteet ja käyttöraahauksen pudotus voivat kohdistua ruutuihin.

## Liike ruutu kerrallaan

Liikkeen Ohjaus **Ruutu**: kohde siirtyy ruudun kerrallaan ja liukuu ruutuun huippunopeudella (lautapeli, labyrintti).

**Asetukset (osio Liike):**

- **Huippunopeus (px/s):** liukumisen nopeus. Iso luku (esim. 10000) = hyppää suoraan ruutuun.
- **Askel (px):** tyhjä = 40. Jos kohteen kerroksella on ruudukko, kentän tilalla lukee ”Askel = kerroksen ruutu (N px)”, ja hahmo kulkee ruutujen keskeltä (ensimmäinen askel kohdistaa).
- **Tatti** (valinnainen): kun tattia pitää yli puolivälin, hahmo astuu ruudun toisensa perään vallitsevaan suuntaan.
- **Pyyhkäisy ohjaa** (valintaruutu): lukitussa näkymässä pyyhkäisy (vähintään 24 px alle 0,8 sekunnissa) antaa suunnan. Lyhyempi kosketus on tavallinen napautus.
- Nuolinapit: vedä painikkeen **painettu**-tapahtumasta nuoli Liikkeen kohtaan **ylös**, **alas**, **vasen** tai **oikea**.

**Säännöt:**

- Määränpää tarkistetaan ennen askelta: jos siellä on este tai Liikkeen raja, hahmo ei liiku, **törmäsi** lähtee ja **osuu esteeseen** on kyllä seuraavaan onnistuneeseen askeleeseen asti. Pidetyllä tatilla törmäsi lähtee vain kerran samaan suuntaan.
- Kesken askeleen tullut suunta odottaa jonossa (yksi suunta, uusin voittaa).
- Askeleen lopussa **askel valmis**.
- **liikkuu kun** pysäyttää paikalleen; askel jatkuu, kun ehto taas pätee.
- Ruudussa ei ole osioita Vauhti eikä Törmäykset; massa ja kitka eivät vaikuta.
- Rajat: kaksi hahmoa voi astua samaan ruutuun samalla hetkellä (ruutua ei varata). Napautus viereiseen ruutuun ei ohjaa ruutuliikettä.

---

## Kuvasarja hahmolle

Kuva-palikalle (`pkuva`) voi antaa kuvasarjan, joka pyörii esimerkiksi kävellessä.

**Kädenliikkeet:** valitse Kuva-palikka → paneelin osio Sisältö → **Kuvasarja (animaatio)**:

- Lista kuvista: kuva 1 on **pääkuva (näkyy pysähtyneenä)**. Muilla riveillä napit ↑ (aiemmaksi), ↓ (myöhemmäksi), ✕ (poista sarjasta).
- **＋ Lisää kuvatiedostoja…** (voi valita monta), tai liitä tekstikenttään SVG-koodi tai https-osoite ja paina **＋ Lisää**.
- Sarjassa enintään 32 kuvaa pääkuvan lisäksi.
- Kun kuvia on vähintään kaksi:
  - **Nopeus (kuvaa sekunnissa):** oletus 8, enintään 60 (esim. 6–10 kävelyyn). Ominaisuus `kuvanopeus` on ohjattava (esim. juoksussa nopeammin).
  - **Pyörii:** **Ei**, **Aina**, **Kun liikkuu** (pyörii, kun Liike liikuttaa tätä palikkaa; pysähtyneenä näkyy pääkuva). Muu ehto: nuoli kohtaan **pyörii kun** (esim. painike pohjassa); silloin valinta korvautuu tekstillä.
- Kävelevä hahmo: Kuva-palikka + kuvasarja + Pyörii **Kun liikkuu** + Liike, jonka Liikutettava palikka on tämä Kuva, ja Hahmo-osiossa **Peilaa sivuttain** tai **Kulkusuuntaan**.
- Kuva-palikka itse on kuvattu näyttöpalikoiden luvussa.

---

## Reseptit

### 1. Hahmo liikkuu tatilla ja pysähtyy seinään

1. Näkymä-välilehti: napauta kanvaasin tyhjää kohtaa → **Näkymän laite** → **Puhelin**.
2. Paletista **Koristeet → Ympyrä** kehyksen sisään, nimeksi *Hahmo*.
3. **Koristeet → Laatikko** hahmon viereen, nimeksi *Seinä*. Seinän paneelissa osio **Este ja osuma-alue** → rasti **Este: liikkuvat palikat eivät mene läpi**.
4. Kerrokset-osiossa **＋ Uusi kerros**, nimeksi *Kojelauta*, rullausvauhti **lukittu**. Kun Kojelauta on valittuna (●), lisää **Ohjaimet → Tatti** ruudun alaosaan.
5. Logiikka-välilehti: paletista **Liike ja aika → Liike**. Paneelissa **Liikutettava palikka** = Hahmo, **Ohjaus** = **Tatti**, **Tatti** = tatti, **Huippunopeus** esim. 200.
6. Paina **Lukitse** ja vedä tatin nuppia: hahmo kulkee siihen suuntaan ja pysähtyy seinään (liukuu sen reunaa pitkin, jos vedät vinoon).
7. Halutessasi: Liikkeen **Vauhti** → Kiihtyminen 0,3 ja Jarrutus 0,3 pehmentää. ↺ Alkuun (paneelissa) palauttaa hahmon.

### 2. Napauta minne hahmo kävelee

1. Laitenäkymä kuten edellä. Hahmoksi Kuva-palikka (**Näyttö → Kuva**), jolle kuvasarja ja **Pyörii: Kun liikkuu** (valinnainen).
2. Lisää seiniä (Laatikko + **Este**) tai tee seinille oma kerros ja paina sen rivillä **tiiliseinää**.
3. Logiikkaan **Liike**: **Liikutettava palikka** = hahmo, **Ohjaus** = **Napautus**, rasti **Kiertää esteet**. Hahmo-osiossa **Kääntyminen** = **Peilaa sivuttain**.
4. Lukitse ja napauta jotain kohtaa maailmasta: rengas merkitsee kohteen, ja hahmo kävelee sinne seinät kiertäen. Perillä lähtee tapahtuma **perillä**.
5. Ruudukkopeliin: anna hahmon kerrokselle ruudukko (**▦**), niin napautus vie ruudun keskelle.
6. Iso maailma: **Maailma ja kamera** → **Kamera seuraa** = hahmo; tee iso Alue koko maailman ympärille ja valitse se **Maailman rajat** -kohtaan.

### 3. Alue, johon astuminen näyttää viestin

1. Tee hahmolle liike (resepti 1 tai 2).
2. Näkymässä **Koristeet → Alue** (tai alareunan **⛶ Alue**) ja muuta se kulmasta oikean kokoiseksi, nimeksi *Aarre*. Paneelissa **Tunnistaa** = hahmo (tai jätä kaikki liikkuvat).
3. Lisää **Näyttö → Ilmoitus**, teksti esim. ”Löysit aarteen!”.
4. Logiikka-välilehdellä vedä nuoli Aarteen kohdasta **sisällä** Ilmoituksen kohtaan **näkyy kun**.
5. Lukitse ja kuljeta hahmo alueelle: ilmoitus näkyy niin kauan kuin hahmon keskipiste on alueella.
6. Kertaluonteinen versio: vedä nuoli Aarteen tapahtumasta **astuttu** esim. Teksti ilmestyy -efektin kohtaan alkaa tai laskurin Lisää-toimintoon. Poistuminen: **poistuttu**.

### 4. Lautapeli nuolinapeilla

1. Laitenäkymä. Kerrokselle *Pohja* ruudukko **▦**, ruutukoko esim. 48, **näkyy aina**.
2. Hahmo ja seinäpalikat (Este) ruutuihin; kohdistus asettaa ne ruudukkoon.
3. Neljä Painiketta (Ylös, Alas, Vasen, Oikea) lukittuun kerrokseen.
4. Logiikkaan **Liike**: Liikutettava palikka = hahmo, Ohjaus **Ruutu**, Huippunopeus esim. 400. Halutessasi rasti **Pyyhkäisy ohjaa**.
5. Vedä jokaisen painikkeen **painettu** → Liikkeen **ylös** / **alas** / **vasen** / **oikea**.
6. Lukitse ja paina nuolinappeja: hahmo liukuu ruutu kerrallaan, seinä estää (törmäsi). Hahmon ruutu: `hahmo.ruutux`, `hahmo.ruutuy`.

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#maailma-ja-liike).
