# Kaikki: toteutussuunnitelma

Itsenäinen ohje mille tahansa tekoälylle (Claude, ChatGPT/Codex, muu). Aiempaa keskustelua ei tarvitse muistaa. Lue ensin repon `AGENTS.md`, sitten `kaikki/TILA.md` ja tämä. Emilin päätökset on merkitty **Emil**, tekoälyn ehdotukset *ehdotus*. Ehdotus ei ole toteutuslupa; Emilin ”toteuta” on.

Päivitetty 22.11.2026 (versio 0.13). Seuraavaksi on kohdan 8 kirjoitusohjeen perusosa ja sen jälkeen kohdan 7 Flow-kokeilu. Lista on toteutusjärjestyksessä. Merkitse tehty kohta tänne ~~yliviivattuna~~ ja kirjaa se `TILA.md`:hen.

## Yhteiset säännöt (Kaikki)

- Appi: `kaikki/index.html` (yli 800 kt). **Älä lue kokonaan**: `python3 tyokalut/kartta.py kaikki` (osiot), `-n <funktio>` (rivi), `-f <osio>` (osion funktiot).
- `<script id="engine">` = Juuren moottori (ei DOMia), sen jälkeen käyttöliittymä. Vault-koodi osiossa *Kaikki 0.1: GitHub-vault* (`VC` välimuisti `{files:{polku:{sha,t}}, q}`, `vPull`, `vApply`, `vCollect`, `VAULT.*` moottorissa).
- Vaultin säännöt: repo `Kasibanaani/vault123`, sen `AGENTS.md` ja `ohjeet/appi.md` (mihin appi luottaa). Älä riko niitä; muutos vaultin sääntöön vaatii Emilin päätöksen ja kirjauksen `ohjeet/paatokset.md`:hen.
- Ulkoasu: Emilin appilinja (puhelin ensin, alapalkki peukalolle, ei ohjetekstejä näkymässä vaan i-napin takana, pieni ikkuna päälle, ulkopuolinen napautus sulkee, ei pomppimista, ei emojeja). Kontrasti ≥ 4,5:1 vaaleassa ja tummassa.
- Testit: `sh kaikki/testit/aja.sh` (Python + Playwright + Chromium). Uusi toiminto = uusi `kaikki/testit/selain_<versio>.py` testirepoa vasten (`fakegh.js`), puhelin 390 ja 320 px, tietokone 1440 ja 1280 px. Ei oikeaa vaultia testeissä (julkinen repo, ei henkilötietoja).
- Vienti suoraan päähaaraan, `git pull --rebase` ennen pushia. Versio: seuraava vapaa (0.8, 0.9 …) commit-viestiin ja `TILA.md`:hen.
- Kerro Emilille: testattu tietokoneen selaimessa, ei iPhonella.

## ~~1. Muistiinpanoikkuna: teksti pääosaan~~ (tehty 0.9, ks. TILA; jäljellä: Liitä asiasanaan, päällekkäisyys ja kiinnitys yhä tekstin alla tilanteen mukaan)

**Ongelma (Emil, kuva koneelta):** tekstikentän reunat näkyvät vain aktiivisena, kenttä on pieni, ja metatieto (luotu/muokattu, ”napauta tekstiä muokataksesi”, päivä- ja aikarivi, Ajankohdat) vie suurimman osan tilasta hajallaan.

**Tavoite (Emil):** selkeä, aina näkyvä ja mahdollisimman suuri tekstikenttä; metatieto pienenä yhteen paikkaan; ajankohta näkyy aina selvästi; muut tiedot napin tai laajennuksen takana. Tietokoneella ikkuna isompi.

**Toteutus (*ehdotus*, Emil ei vielä hyväksynyt yksityiskohtia):**
- Ikkuna `#nsheet`. Tekstikenttä `.hlwrap` (`#ns-hl` korostuskerros + `#ns-text`): aina näkyvä reuna (1 px `--sep`, aktiivisena korostusväri), täyttää vapaan korkeuden (flex-sarake; `noteGrow` kasvattaa nyt sisällön mukaan, säilytä vierityksen sulavuus 0.4:stä). Tietokoneella ikkuna n. 860 px leveä ja lähes ruudun korkuinen.
- Yksi pieni tietorivi tekstin yläpuolelle (`.nsmeta`, 13 px, yksi rivi, ei rivity): ajankohtasiru (seuraava ajankohta kuten kortin `.nd`, kuitattuna vihreä väkänen, useampi ”+N”) ja tarvittaessa ”Tiedot”-siru (asiasanat, linkit, päällekkäisyydet).
- Ajankohtasirun napautus: pieni ikkuna (ikkunan sisällä kuten `#ns-menu`) jossa nykyinen päivärivi `#ns-dtrow` (päivä, Päivät, kellonaika) ja Ajankohdat-luettelo (`foundInfo` → `#ns-found`). Ilman ajankohtaa siru on ”+ Päivä” (sama kuin ⋯ → Päivä ja aika).
- `#ns-stamp` (luotu/muokattu) pois näkymästä ⋯-valikon (`nsMenu`) yläriville pienellä harmaalla; vihje ”napauta tekstiä muokataksesi” pois.
- `#ns-ov`, `#ns-poprow`, `#ns-linkrow`, `#ns-linkbox` ”Tiedot”-sirun ikkunaan tai ⋯-valikkoon, ei tekstin alle.
- Lukunäkymä (`#nsheet.reading`) ja kirjoitus toimivat kuten ennen; tekstin fonttikoko `--tz` (vähintään 16 px).
**Testi:** tekstikentän korkeus ≥ 60 % ikkunan korkeudesta 390 px:llä; reuna näkyy myös ilman fokusta; ajankohtasiru näkyy kun päivä on, ja avaa ikkunan; luotu-tieto löytyy ⋯-valikosta; ei sivuttaisvieritystä; vanhat testit (`selain_06.py` käyttää `#ns-dtrow`, `#ns-more`, `#ns-found .dckv`) päivitetään vastaamaan.

## ~~2. Muistiinpanot riveinä ja sarakkeina~~ (tehty 0.10; myöhemmin: minigraafi-laji, sarakkeen järjestys otsikkoa napauttamalla, apin oma näkymämuokkain)

**Tavoite (Emil):** tietokoneella muistiinpanot allekkain riveinä kuin Notionin tietokannassa ilman sen kömpelyyksiä; otsikko vasemmalla; muutama sarake, jotka täyttyvät muistiinpanon sisällöstä, kun se on oikeassa muodossa; sarakkeella voi olla muu näyttötapa kuin teksti (minigraafi, palkki ym.); määritellyt näkymät.

**Emilin vastaukset (kysely 22.11.2026):**
- Kentät: lyhyet suomenkieliset nimet (`tila`, `arvio`, `edistys`, `hinta`, `prioriteetti`); sopimus on jo vaultin `ohjeet/muistiinpanot.md`:ssä (kohta *Omat kentät*). Uusi kenttä vain Emilin luvalla.
- Ensimmäinen näkymä: **Kaikki muistiinpanot** (otsikko, kansio, kuka kirjoitti, luotu, seuraava ajankohta), toimii ilman uusia kenttiä.
- Puhelin: **molemmilla, valittavissa** (Kortit / Rivit); puhelimella oletus Kortit, koneella Rivit. Valinta laitekohtainen.
- Näkymät: **ensin tekoäly** kirjoittaa näkymätiedostot (`nakymat/`), apin oma muokkain myöhemmin erillisenä vaiheena.

**Toteutus (*ehdotus*):**
- Sarakkeiden lähde = muistiinpanon alkutiedot (YAML-tyyliset rivit `avain: arvo`, jotka appi jo säilyttää `n.vfm`:ssä; lue `VAULT.fmGet`). Valmiit: otsikko, kansio (polusta), `tyyppi`, `lahde` (raita kuten korteissa), `luotu`, `tagit`, seuraava ajankohta. Omat kentät vapaasti (esim. `tila`, `arvio`, `edistys`).
- Näkymä on vaultin tiedosto `nakymat/<tunnus>.md` (`tyyppi: nakyma`, `nakyy: ei`), esim.:
  ```
  ---
  tyyppi: nakyma
  otsikko: Remontti
  nakyy: ei
  mista: kansio = projektit/remontti
  jarjestys: luotu laskeva
  sarakkeet:
    - tila | siru
    - hinta | luku | €
    - edistys | palkki | 0-100
    - luotu | pvm
  ---
  ```
  Ilman näkymätiedostoa oletusnäkymä: otsikko, kansio, kuka kirjoitti, luotu, ajankohta.
- Näyttötavat (yhteinen kirjasto myöhemmälle taulukolle ja kojelaudalle, funktio esim. `fmtCell(laji, arvo, asetus)`): teksti, siru, pvm, luku (+yksikkö), palkki min–max, väkänen (kyllä/ei), minigraafi (arvo pilkuilla eroteltuna listana tai `data/`-sarake).
- Asettelu appilinjan taulukkomallilla (otsikkosarake ja otsikkorivi jäädytettyinä, sarakkeet vierivät sivuttain, rivi 42 px). Valinta Muistion yläpalkissa: Kortit / Rivit (laitekohtainen, oletus Rivit ≥ 1000 px, puhelimella Kortit). Rivin napautus avaa muistiinpanon. Haku ja suodattimet toimivat kuten korteissa.
- Vaultin `ohjeet/appi.md` ja `ohjeet/muistiinpanot.md`: kenttäsopimus ja `nakymat/`-kansio (Emilin päätös).

## ~~3. Koko vault ZIP-tiedostona~~ (tehty 0.8; Emil 22.11.2026: haluaa napin apissa, myös puhelimella)

**Emil:** koko vaultin sisältö talteen yhdellä napilla sekä puhelimen että tietokoneen muistiin. **Aina sama tiedostonimi**, jotta uusi korvaa vanhan (iPhonen Tiedostot-appi kysyy Korvaa / Säilytä molemmat). Nimeksi *ehdotus* `Kaikki-vault.zip` (ei päivämäärää nimessä; päivä ja tiedostomäärä ZIPin sisälle tiedostoon `VARMUUSKOPIO.txt`). Tietokoneella selaimen lataus voi lisätä nimeen (1); Chromessa/Edgessä voi käyttää tallennusikkunaa (`showSaveFilePicker`), jolla valitaan vanha tiedosto korvattavaksi; Safarissa tavallinen lataus.


- Valikko → Vienti ja tuonti → ”Koko vault (ZIP)”. Sisältö: kaikki `VC.files` (vaultin `.md`, `.csv`, `.json` alle 400 kt) polkuineen + lähtemättömät omat muutokset (`VC.q`) uusimpana versiona. Nimi aina `Kaikki-vault.zip`. Puhelimella jakovalikko kuten muussa viennissä (`shareFile`) → Tallenna Tiedostoihin.
- Oma ZIP-kirjoittaja ilman kirjastoja: tallennustapa *stored* (ei pakkausta), CRC-32, UTF-8-nimet (lippu 0x0800), paikalliset otsakkeet + keskushakemisto. N. 60 riviä.
- Ilmoita, jos haku on kesken tai vault ei ole käytössä. Kerro ikkunassa, ettei mukana ole kuvia tai yli 400 kt:n tiedostoja.
**Testi:** ZIP avautuu Pythonin `zipfile`-moduulilla, tiedostot ja sisällöt täsmäävät testirepoon, ääkköset nimissä ja sisällössä oikein.

## ~~4. Huoltopyynnöt tekoälylle ja Tekoälylle-paikka~~ (tehty 0.11)

**Tavoite (Emil):** ei säännöllistä laajaa huoltoa (käyttörajat); Emil pyytää napista; tekoälyn omat tiedostot taka-alalle, mutta Emilin muokattaviksi apissa.
**Emil hyväksyi 22.11.2026** ja vaultin ohjeet on jo päivitetty: (a) huolto vain pyynnöstä, (b) Emilin tekstin saa pyynnöstä jäsentää, alkuperäinen ensin `arkisto/`:on; `Lähde:`-rivi = liitetty teksti, `Tekoälylle:`-rivi = toive. Tiedosto `yllapito/pyynnot.md` sisältää osiot *Avoimet* ja *Tehdyt*.
- Vaultin tiedosto `yllapito/pyynnot.md` (`tyyppi: loki`, `nakyy: ei`), rivit `- [ ] VVVV-KK-PP · mitä · kohde` (kohde = `inbox`, `koko vault` tai `[[tiedosto]]`). Tehty: `- [x] … → tulos (kuka, pvm)`.
- Apissa: Valikko → ”Pyydä tekoälyä järjestämään” (kohde inbox / koko vault) ja muistiinpanon ⋯ → ”Pyydä tekoälyä järjestämään” (kohde tämä muistiinpano). Napautus lisää rivin; vahvistus pienenä ilmoituksena.
- Valikko → ”Tekoälylle”: lista tiedostoista, joiden laji on tekoälylle (`VAULT.kindOf` = `ohje`: `ohjeet/`, `nakyy: ei`, `tyyppi: ohje`) + `yllapito/loki.md` ja `yllapito/pyynnot.md`; avautuvat tavalliseen muistiinpanoikkunaan muokattaviksi. Henkilö-napin Tekoälylle-valinnat voidaan sen jälkeen poistaa (yksi paikka).
- Vaultin ohjeet päivitetty (`AGENTS.md`, `ohjeet/yllapito.md`, `ohjeet/sanelu.md`, `ohjeet/paatokset.md`). Toteutuksessa lisää `ohjeet/appi.md`:hen, että appi kirjoittaa `yllapito/pyynnot.md`:n *Avoimet*-otsikon alle.

## ~~5. Osiot näkyviin laitekohtaisesti~~ (tehty 0.12)

Lisää asetuksiin laitekohtainen valinta siitä, mitkä osiot näkyvät navigaatiossa. Käytä nykyistä näkyvyyttä oletuksena, jotta päivitys ei piilota käytössä olevia osioita. Piilottaminen koskee navigaatiota ja on peruttavissa samasta asetuksesta. Säilytä pääsy asetuksiin ja käsittele tilanne, jossa avoin osio piilotetaan.

## 6. Päivän mittarien kirjaus

### ~~6.1 Kojelaudan kirjauslomake~~ (tehty 0.13)

Rakenna kirjauskentät ja säätimet olemassa olevan `data/mittarit.json`-määrittelyn perusteella ja noudata vaultin `ohjeet/data.md`-ohjetta. Kirjaa vain valitut arvot ja yhdistä ne saman päivän riviin. Tarkista testivaultilla, että rinnakkainen toisen sarakkeen muutos ja aiemmat päivät säilyvät.

Tallennus lukee CSV-tiedoston tuoreen version ja muuttaa vain lomakkeessa muuttuneita kenttiä. Saman kentän rinnakkaismuutoksessa appi pyytää tarkistamaan ajantasaisen arvon. Ensiversio käyttää olemassa olevia päiväavaimisia CSV-taulukoita ja tarvitsee yhteyden tallentaessa.

### 6.2 Mittarien tekstikirjaus ja pikakomento

**Emilin toive (22.11.2026):** ihmiselle helppo kirjoitusmuoto, jolla mittarit voi kirjoittaa itse puhelimella, aamuraporttina tai iOS:n pikakomennolla, suoraan appiin tai tekoälylle, ja ne menevät oikein kojelautaan. Ohje Emilille apissa, ei vain tekoälylle.
*Ehdotus (tekoäly, Emil ei vielä hyväksynyt):* **yksi muoto kaikille kolmelle reitille**:
- Muoto: `Mittarit: paino 112,4; energia 3; uni hyvä; treeni kyllä` (nimet `mittarit.json`:n `nimi` tai `id`, isot ja pienet kirjaimet samantekeviä; valinta nimellä tai numerolla; kyllä/ei; desimaalipilkku tai -piste). Päivä oletuksena tänään; alkuun voi kirjoittaa `eilen` tai `21.11.`.
- Reitti 1, kirjaus apissa: Kojelauta → Kirjaa mittarit (nykyisen mittarimäärittelyn kentät, tehty 0.13).
- Reitti 2, muistiinpanossa: rivi, joka alkaa `Mittarit:` → appi vie arvot `data/<taulukko>.csv`:hen saman päivän riville ja merkitsee rivin käsitellyksi (esim. ✓ rivin perään), ettei sitä viedä kahdesti. Toimii myös tekoälyn kirjoittamassa muistiinpanossa.
- Reitti 3, pikakomento: osoite `…/kaikki/?kirjaa=paino 112,4; energia 3` avaa appin ja kirjaa vahvistuksen jälkeen (iOS Pikakomennot: Kysy syötettä → Avaa URL).
- Ohje Emilille: Kojelaudan i-napissa ja Kirjaa-ikkunassa esimerkkirivi, joka muodostetaan `mittarit.json`:sta (pysyy aina ajan tasalla, kun mittareita lisätään). Sama muoto vaultin `ohjeet/data.md`:hen tekoälyille.
- Tuntematon nimi tai arvo: ei kirjata, vaan ilmoitus (”paino?? ei tunnistettu”). Ei arvata.

## 7. Rajatut kokeilut

Kokeile testiaineistolla ensin Flow'n lukemista sisennetystä Markdownista. Jatka pieneen Markdown-laskentataulukkoon ja yhteiseen laskentaan muistiinpanojen välillä. Kirjaa kokeilun tulokset ja avoimet päätökset. Uusi pysyvä tiedostomuoto, tiedonsiirto, merkittävä arkkitehtuuriratkaisu ja olemassa olevan osion karsiminen edellyttävät Emilin päätöstä. Toteuta kokeilu omassa haarassaan, jos julkaisu päähaaraan vakiinnuttaisi avoimen ratkaisun.

## 8. Kirjoitusohje apissa (Emil 22.11.2026; tee kohdan 6 yhteydessä tai heti sen jälkeen)

**Emil:** apissa lyhyt, helposti löytyvä ohje ihmiselle siitä, missä muodossa tekstiä kannattaa itse kirjoittaa tai liittää, jotta appi ymmärtää sen (esim. pikakomento, joka hakee unitiedon ja kirjoittaa sen oikeaan muotoon liitettäväksi). Ohje pitää voida avata ja kopioida helposti.
*Ehdotus (tekoäly):*
- Paikka: Valikko → **Kirjoitusohje** (tietokoneella sama kuin muut Valikon kohdat). Pieni ikkuna, lyhyet kappaleet, jokaisen esimerkin vieressä **Kopioi**-nappi (leikepöydälle, `navigator.clipboard.writeText`, varalla valittava teksti).
- Sisältö, aina ajan tasalla koodista ja vaultista (ei kovakoodattuja mittareita):
  - **Mittarit:** esimerkkirivi kohdan 6 muodossa, muodostettu `data/mittarit.json`:sta (nimet, asteikot, valinnat, yksiköt).
  - **Kalenteri:** päivä ja aika tekstissä, esim. `to 26.11. klo 16–17`, `huomenna klo 9`, `joka maanantai`.
  - **Muistiinpanon kentät** rivinäkymää varten: `tila: kesken`, `arvio: 7`, `edistys: 40`, `hinta: 120` (vaultin *Omat kentät* -lista).
  - **Liitetty teksti:** `Lähde: …` alkuun, `Tekoälylle: …` toiveeksi.
  - **Linkki toiseen muistiinpanoon:** `[[tiedostonimi]]`.
- Sama ohje myös vaultiin tiedostoksi (esim. `ohjeet/kirjoitusohje.md`, `nakyy: ei`), jotta tekoäly ja pikakomennot voivat käyttää samaa muotoa; appi näyttää apin oman version.

## Myöhemmin tarkennettavat ideat

Kojelaudan ulkoasuasetukset, taulukon ja kojelaudan yhdistäminen (D) sekä Listojen ja Asioiden suhde vaultiin on kuvattu `TILA.md`:n kohdassa *Isommat ideat*. Hyödynnä kokeilujen tulokset, kun niitä tarkennetaan.
