# Kaikki: toteutussuunnitelma

Itsenäinen ohje mille tahansa tekoälylle (Claude, ChatGPT/Codex, muu). Aiempaa keskustelua ei tarvitse muistaa. Lue ensin repon `AGENTS.md`, sitten `kaikki/TILA.md` ja tämä. Emilin päätökset on merkitty **Emil**, tekoälyn ehdotukset *ehdotus*. Ehdotus ei ole toteutuslupa; Emilin ”toteuta” on.

Päivitetty 22.11.2026 (versio 0.29). Seuraavaksi siirretään muistiinpanoikkunan tarkenteet sirun taakse (B). Lista on toteutusjärjestyksessä. Merkitse tehty kohta tänne ~~yliviivattuna~~ ja kirjaa se `TILA.md`:hen.

## Yhteiset säännöt (Kaikki)

- Appi: `kaikki/index.html` (yli 800 kt). **Älä lue kokonaan**: `python3 tyokalut/kartta.py kaikki` (osiot), `-n <funktio>` (rivi), `-f <osio>` (osion funktiot).
- `<script id="engine">` = Juuren moottori (ei DOMia), sen jälkeen käyttöliittymä. Vault-koodi osiossa *Kaikki 0.1: GitHub-vault* (`VC` välimuisti `{files:{polku:{sha,t}}, q}`, `vPull`, `vApply`, `vCollect`, `VAULT.*` moottorissa).
- Vaultin säännöt: repo `Kasibanaani/vault123`, sen `AGENTS.md` ja `ohjeet/appi.md` (mihin appi luottaa). Älä riko niitä; muutos vaultin sääntöön vaatii Emilin päätöksen ja kirjauksen `ohjeet/paatokset.md`:hen.
- Ulkoasu: Emilin appilinja (puhelin ensin, alapalkki peukalolle, ei ohjetekstejä näkymässä vaan i-napin takana, pieni ikkuna päälle, ulkopuolinen napautus sulkee, ei pomppimista, ei emojeja). Kontrasti ≥ 4,5:1 vaaleassa ja tummassa.
- Testit: `sh kaikki/testit/aja.sh` (Python + Playwright + Chromium). Uusi toiminto = uusi `kaikki/testit/selain_<versio>.py` testirepoa vasten (`fakegh.js`), puhelin 390 ja 320 px, tietokone 1440 ja 1280 px. Ei oikeaa vaultia testeissä (julkinen repo, ei henkilötietoja).
- Vienti suoraan päähaaraan, `git pull --rebase` ennen pushia. Versio: seuraava vapaa (0.8, 0.9 …) commit-viestiin ja `TILA.md`:hen.
- Kerro Emilille: testattu tietokoneen selaimessa, ei iPhonella.

## Työjono: mitä voi rakentaa ensimmäisenä versiona (Emil 22.11.2026)

**Periaate (Emil):** kaikkia kysymyksiä ei tarvitse ratkaista etukäteen. Kun kohta on tarpeeksi tarkka, tehdään **rajattu ensimmäinen versio (v1)**, jota Emil pääsee kokeilemaan, ja seuraava askel päätetään kokeilun perusteella. v1 saa ottaa käyttöön tässä ehdotetun tiedosto- tai kirjoitusmuodon (Emil hyväksyi v1-muodot kokeiltaviksi 22.11.2026); jos muotoa myöhemmin muutetaan, appi lukee aina myös vanhan muodon. Jokaisen v1:n jälkeen `TILA.md`:hen: mitä jätettiin pois ja mitä Emililtä kysytään kokeilun jälkeen.

**A0. SEURAAVAKSI: Emilin kokeilupalaute 22.11.2026 illalla (ennen muita kohtia).** Emil: ”taulukkolaskentapuoli ei toimi vielä juuri lainkaan”; muistiinpanolista ei hyödynnä koko leveyttä; tarvitaan sarakkeiden raahaus, pystyviivat, monivalinta, omat suodatusnäkymät, kompaktimpi oletusmuotoilu. Tekoälyn havainnot kuvista (1440 ja 1920 px, 22.11.): Taulukot-alue on rajattu n. 1100 px:iin keskelle, solut ovat isoja (n. 45 px), taulukko valitaan selaimen alasvetovalikosta ja napit (+ Välilehti, + Rivi, + Sarake, Vie CSV) ovat taulukon alla; rivinäkymässä ei ole sarakeviivoja, ja Valitse (0.22) on pieni erillinen nappi; yläpalkissa on 8 pientä kuvaketta. Tee nämä v2:na tässä järjestyksessä, jokainen oma versionsa ja testinsä (tietokone 1440 ja 1280 px, puhelin 390 ja 320 px):
1. ~~**Taulukot, kompakti ja koko leveys**~~ ja 2. ja 3. (taulukoiden osalta) tehty 0.30. **Taulukot, kompakti ja koko leveys:** rivit 28–30 px, fontti 13–14 px, ohuet ruudukkoviivat (`--sep`), sarakeotsikot (A, B … + nimi) ja rivinumerot jäädytettyinä, alue käyttää koko leveyden (ei 1100 px rajaa). Taulukon vaihto pienestä ikkunasta (ei natiivi select), välilehdet alareunaan Sheetsin tapaan, toiminnot otsikkorivin ⋯-valikkoon tai yläpuolen kapeaan työkaluriviin.
2. **Taulukot, solujen käyttö kuin Sheetsissä (tietokone):** solun valinta napsautuksella (korostusreuna), nuolinäppäimet, Enter = muokkaa / vahvista ja alas, Tab = oikealle, Esc = peru, kirjoittaminen aloittaa muokkauksen, Delete tyhjentää, alueen valinta vetämällä tai Shift+nuoli, ⌘C/⌘V (myös Sheetsistä ja Excelistä liitetty sarkaineroteltu teksti), ⌘Z/⇧⌘Z kumoa ja tee uudelleen. **Kaavarivi** taulukon yläpuolella näyttää valitun solun osoitteen ja kaavan, ja sitä voi muokata. Puhelimella: napautus valitsee, toinen napautus muokkaa.
3. **Sarakkeiden leveys raahattavaksi** otsikon oikeasta reunasta (sekä Taulukot että Muistion rivinäkymä); kaksoisnapsautus sovittaa sisältöön. Tallennus: taulukossa alkutietoihin `leveydet: 140, 80, 80, 100`, rivinäkymässä näkymätiedoston sarakeriville `| w=120`. Sama toteutus molempiin (yksi koodi).
4. ~~Rivinäkymän osalta tehty 0.31~~ (taulukoissa sarakkeen siirto ja viittausten päivitys yhä tekemättä). **Sarakkeiden järjestys raahaamalla otsikosta** (Taulukot: siirtää sarakkeen ja päivittää viittaukset kuten Sheets; rivinäkymä: näkymätiedoston `sarakkeet:` järjestys). Rivien ja sarakkeiden lisäys, poisto ja siirto otsikon ⋯-valikosta (Taulukot).
5. ~~**Pystyviivat**~~ tehty 0.31. **Pystyviivat** rivinäkymän sarakkeiden väliin (hienovarainen 1 px `--sep`, ei otsikkosarakkeen jäätymistä rikkoen) ja kompaktimpi rivi koneella (36 px).
6. ~~**Monivalinta näkyväksi**~~ tehty 0.31 (valittujen toimintorivi on 0.22:n alareunan rivi; Lisää tunniste -toiminto tekemättä). **Monivalinta näkyväksi:** tietokoneella valintaruutusarake rivin vasemmassa reunassa (näkyy osoitettaessa ja aina, kun jotain on valittu), Shift-napsautus valitsee välin, ⌘-napsautus lisää; valittujen toimintorivi (Arkistoi, Poista, Lisää tunniste) yläreunaan. Puhelimella nykyinen Valitse.
7. ~~Näkymämuokkain~~ tehty 0.33 (myöhemmin: sarakkeiden leveydet näkymätiedostoon, näkymän arkistointi apista). **Omat suodatusnäkymät apissa (näkymämuokkain v1, aiemmin visio D):** Näkymä-valinnan perään `+ Uusi näkymä` ja `Muokkaa`: pieni ikkuna, jossa nimi, ehdot (kansio, tunniste, kenttä = / > / < arvo; useampi = kaikki), järjestys (kenttä nouseva/laskeva, useampi) ja sarakkeet (valintaruudut, järjestys raahaamalla, näyttötapa). Tallentaa `nakymat/<tunnus>.md`:n samassa muodossa kuin tekoäly; tekoälyn ja apin näkymät ovat samoja tiedostoja.
8. **Muistio koko leveydelle:** Emil (kysely 22.11.): kapealta näyttää **rivitila koneella** (Emilin omalla näytöllä; testikuvissa Rivit täytti 1440 ja 1920 px, joten tarkista Emilin näyttö, esim. erittäin leveä tai selaimen zoom, ja sarakkeiden leveysjako: nyt otsikko vie suurimman osan ja muut sarakkeet ovat kapeita). Poista jäljellä olevat leveysrajat Muistion yläpalkeista ja korttiruudukosta (kortit useampaan sarakkeeseen leveällä näytöllä).
9. ~~Yläpalkki~~ tehty 0.32. **Emil hyväksyi (kysely 22.11.):** yläpalkin 8 kuvaketta → näkyviin vain usein käytetyt (päivitys, pikakirjaus, haku), loput yhden Valikko-napin taakse myös tietokoneella (appilinja: yksi paikka, harvinaiset Valikkoon).
Myöhemmin samaan jatkoon (v2.1): solujen muotoilu (lihavointi, tasaus, lukumuoto €, %, desimaalit, taustaväri; tallennus alkutietoihin), soluviittaus napsauttamalla kaavaa kirjoittaessa, täyttö vetämällä (kaavan kopiointi alas), jäädytettävät rivit ja sarakkeet, suodatin ja lajittelu taulukon otsikosta.

**A. Valmis v1:ksi ilman lisäkysymyksiä** (tässä järjestyksessä; merkitse tehty ~~yliviivaten~~):
1. ~~Kohta 8: kirjoitusohje apissa (perusosa).~~ Tehty 0.14.
2. ~~Kohta 7: Flow tekstinä, kokeiluna.~~ Tehty 0.15. Pysyvä muoto odottaa kokeilupalautetta.
3. ~~Kohta 6.2: mittarien tekstikirjaus ja pikakomentolinkki.~~ Tehty 0.16.
4. ~~Kohta 9: `#tunnisteet` (teksti, `tagit`, lukunäkymä, Asiasanat-suodatin ja rivinäkymä).~~ Tehty 0.17.
5. ~~Kohta 15: pikakirjaus v1 (Vaultin esiasetukset, seuranta, muistutukset, päivän kirjaukset, omat napit ja automaattiset tunnisteet).~~ Tehty 0.18–0.19.
6. ~~Kohta 15: yhteinen XY-pädi lukuarvoille.~~ Tehty 0.20. Suhteellinen tila odottaa kokeilupalautetta.
7. ~~Kohta 9: rivinäkymä leveäksi tietokoneella.~~ Tehty 0.21.
8. ~~Kohta 9: monen valinta, arkistointi ja siirto roskakoriin vahvistuksella.~~ Tehty 0.22.
9. ~~Kohta 9: oma järjestys ja kahva (tallennus `nakymat/kaikki.md`).~~ Tehty 0.23.
10. ~~Kohta 10: kentät ja kaavamoottori (perusfunktiot, muistiinpanohaku, virheet).~~ Tehty 0.24. Tiedostojen uudelleennimeämiseen liittyvä viitepäivitys lisätään samaan työvaiheeseen varsinaisen uudelleennimeämistoiminnon kanssa.
11. ~~Kohta 11: kaavat muistiinpanoissa ja rivinäkymän kaavasarakkeet.~~ Tehty 0.25.
12. ~~Kohta 12: laskentataulukko v1, tiedostopohjaiset välilehdet, solut ja viittaukset.~~ Tehty 0.26. Näkymävälilehti (muistiinpanot riveinä) v2:ssa.
13. ~~Kohta 13: ruudukon korttien v1, viisi näyttötapaa, arvot soluista ja lukitus.~~ Tehty 0.27. Vapaa sijoittelu ja solukohtaiset lukot myöhemmin kokeilun jälkeen.
14. ~~Kohta 9: Asiat → Tunnisteet -siirtymä.~~ Tehty 0.28. Emil valitsee Asiat ja appi lisää tunnisteet osuviin muistiinpanoihin.
15. ~~Kohta 14: karsintakysely Emilille.~~ Tehty 22.11. (vastaukset kohdassa 14).

**B. Pieniä jatkoja, voi tehdä välissä:** ~~rivinäkymän minigraafi ja otsikon napautuksella vaihtuva sarakejärjestys (0.29)~~, muistiinpanoikkunan jäljelle jääneet tekstinalaiset kohdat (Liitä asiasanaan, päällekkäisyys, kiinnitys) sirun ikkunaan.

**A2. Treeni-osio v1 (kysely tehty 22.11., ks. kohta 16):** rakennetaan A0:n jälkeen. Sitten karsinta kohdan 14 vastausten mukaan.

**A1b. ~~Kalenterin merkintöjen siistiminen~~ tehty 0.36.** (Emil 22.11.2026 illalla, kuva puhelimelta):
- **Aikajana (päivä):** kuittausruutu (`.evck`) ja keston raahauskahva (`.grip`) ovat päällekkäin oikeassa alakulmassa. Ruutu oikeaan yläkulmaan pieneksi (n. 18 px) ja kahva pois kulmasta: koko alareunan levyinen näkymätön kaistale (n. 8 px), jossa keskellä pieni viiva; ei osu ruutuun lyhyessäkään merkinnässä.
- **Aikajanan kellonaika:** nyt toisella rivillä ja lyhyissä merkinnöissä puoliksi piilossa alareunassa. Aikajana näyttää ajan jo vasemmalla, joten merkinnässä kellonaika vain **otsikon perässä samalla rivillä** pienellä ja himmeällä (kuten ”Kaupasta 16.15”), ja jos ei mahdu, se jätetään pois. Ei koskaan otsikon alle.
- **Viikkolista (Vk):** kuittausmerkki on liian iso ja vasemmalla. Sama pieni neliönmuotoinen ruutu kuin aikajanalla, **rivin oikeaan reunaan**. Kuitattuna sama vihreä väkänen.
- Yhtenäinen ilme: sama kuittausruutu kaikissa kalenterinäkymissä (aikajana, viikkolista, koko päivän sirut), teeman kuittausmuodon (`--r-chk`) mukaan.
- Testi: ruutu ja kahva eivät leikkaa (getBoundingClientRect) 15, 30, 45 ja 120 min merkinnöissä; kellonaika ei leikkaa merkinnän alareunaa; viikkolistan ruutu on oikeassa reunassa ja enintään 22 px.

**A1. ~~Kohta 17~~ tehty: 17.1, 17.3–17.5 0.34:ssä, 17.2 0.35:ssä. Seuraavaksi A1b (kalenterin merkinnät).** Alkuperäinen: (kuittausrivi, Toistuvat ja Listat vaultiin, seuranta kuitattuna, metatieto erilleen). Syy: Emil kuittasi saman merkinnän kahdesti, koska kuittaus ei synkannut.

**C. Kokeilu (tulos ja avoimet päätökset Emilille ennen pysyvää muotoa):** kohta 7 Flow tekstinä.

**A3. Uudet v1:t (Emil 22.11. illalla):** kohta 18 (toistuvuus kenttänä, Toistuvat-lista) ja kohta 19 (graafinäkymä, ensin paikallinen). Kohta 20 (kanvaasi) hyllyllä Emilin päätöksellä. **Emil 22.11. illalla: etusijalla kalenterin siistiminen (A1b) ja taulukot: laskentataulukon, tietokantamaisen näkymän ja kojelaudan yhteensovitus; taulukoiden on toimittava sulavasti ja vakaasti, ettei raskaus estä käyttöä.**

**D. Visio, liian epätarkka v1:ksi** (ei rakenneta ennen Emilin tarkennusta; ks. *Pohdittavat* lopussa): pikakirjausten laajempi editori tietokoneelle; toteutumien tunnistus, tilastointi ja korrelaatiot (kohta 15); kojelauta-rakentajan vapaa sijoittelu, raahattavat koot ja tyylit; kuvaajien ulkoasuasetukset; Listojen suhde vaultiin; kuvat ja liitteet; Notion-sisällön siirto.

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

### ~~6.2 Mittarien tekstikirjaus ja pikakomento~~ (tehty 0.16)

**0.16:** Kirjaa tekstinä täyttää nykyisen lomakkeen ja iOS-linkki avaa sen tarkistettavaksi. Käytä pikakomennossa ensisijaisesti `#kirjaa=`-fragmenttia. Myös `?kirjaa=` toimii. Muistiinpanon tallennuksessa yksittäinen uusi `Mittarit:`-rivi kirjataan automaattisesti, jos taulukko ja yhteys ovat valmiina. Tuodut tai odottamaan jääneet rivit voi kirjata muistiinpanon ⋯-valikosta, jolloin katselu ei aiheuta kirjoituksia. Kuitattu rivi päättyy merkkiin ✓. Ensiversiossa yksi taulukko kerrallaan.

**Emilin toive (22.11.2026):** ihmiselle helppo kirjoitusmuoto, jolla mittarit voi kirjoittaa itse puhelimella, aamuraporttina tai iOS:n pikakomennolla, suoraan appiin tai tekoälylle, ja ne menevät oikein kojelautaan. Ohje Emilille apissa, ei vain tekoälylle.
*Ehdotus (tekoäly, Emil ei vielä hyväksynyt):* **yksi muoto kaikille kolmelle reitille**:
- Muoto: `Mittarit: paino 112,4; energia 3; uni hyvä; treeni kyllä` (nimet `mittarit.json`:n `nimi` tai `id`, isot ja pienet kirjaimet samantekeviä; valinta nimellä tai numerolla; kyllä/ei; desimaalipilkku tai -piste). Päivä oletuksena tänään; alkuun voi kirjoittaa `eilen` tai `21.11.`.
- Reitti 1, kirjaus apissa: Kojelauta → Kirjaa mittarit (nykyisen mittarimäärittelyn kentät, tehty 0.13).
- Reitti 2, muistiinpanossa: rivi, joka alkaa `Mittarit:` → appi vie arvot `data/<taulukko>.csv`:hen saman päivän riville ja merkitsee rivin käsitellyksi (esim. ✓ rivin perään), ettei sitä viedä kahdesti. Toimii myös tekoälyn kirjoittamassa muistiinpanossa.
- Reitti 3, pikakomento: osoite `…/kaikki/?kirjaa=paino 112,4; energia 3` avaa appin ja kirjaa vahvistuksen jälkeen (iOS Pikakomennot: Kysy syötettä → Avaa URL).
- Ohje Emilille: Kojelaudan i-napissa ja Kirjaa-ikkunassa esimerkkirivi, joka muodostetaan `mittarit.json`:sta (pysyy aina ajan tasalla, kun mittareita lisätään). Sama muoto vaultin `ohjeet/data.md`:hen tekoälyille.
- Tuntematon nimi tai arvo: ei kirjata, vaan ilmoitus (”paino?? ei tunnistettu”). Ei arvata.

## 7. Rajatut kokeilut

**0.15:** Flow → Kokeile tekstipuuta näyttää sisennetyn luettelon haaroina ja koko puuna. Luettelossa yksi aloituskysymys, kaksi välilyöntiä tasoa kohti ja vastaukselle enintään yksi jatkokysymys tai lopputulos. Kokeilu toimii esimerkillä tai liitetyllä testitekstillä ja pysyy muistissa vain ikkunan käyttöajan. Sovitaan kokeilun jälkeen, tarvitaanko viittauksia haarojen välillä, ehtoja ja pysyvää Vault-muotoa.

Kokeile testiaineistolla ensin Flow'n lukemista sisennetystä Markdownista. Jatka pieneen Markdown-laskentataulukkoon ja yhteiseen laskentaan muistiinpanojen välillä. Kirjaa kokeilun tulokset ja avoimet päätökset. Uusi pysyvä tiedostomuoto, tiedonsiirto, merkittävä arkkitehtuuriratkaisu ja olemassa olevan osion karsiminen edellyttävät Emilin päätöstä. Toteuta kokeilu omassa haarassaan, jos julkaisu päähaaraan vakiinnuttaisi avoimen ratkaisun.

## 8. Kirjoitusohje apissa (Emil 22.11.2026; tee kohdan 6 yhteydessä tai heti sen jälkeen)

**0.14:** perusosa valmis. Opas löytyy puhelimessa Valikosta ja tietokoneella yläpalkista. Mittariesimerkki käyttää olemassa olevan lomakkeen määrittelyjä. Päivitä mittaritekstin ja pikakomennon esimerkit kohdan 6.2 toteutuksen yhteydessä.

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

## 9. Tunnisteet ja Muistion listan jatko (Emil 22.11.2026)

**Nykytila 0.17:** Muistio tunnistaa `#tunnisteet` tekstistä ja `tagit`-kentästä sekä tarjoaa tunnisterajauksen ja rivisarakkeen. Juuren Asiat ovat yhä käytössä siirtymää varten.

**Emil toivoo:**
1. Käsin tägitys: `#tunniste` tekstissä, ja tekoäly ymmärtää sen.
2. Valmiit suodatus- ja järjestysnäkymät Notionin tapaan (tunnisteiden mukaan suodatus ja järjestys), myöhemmin muokattavat apissa.
3. Sarakkeiden järjestyksen muokkaus (myöhemmin).
4. Monen valinta kerralla ja poisto (ja arkistointi) valituille.
5. Käsin raahattava järjestys, kun suodatusta tai järjestystä ei ole: pieni kahva vasemmassa reunassa, varsinkin tietokoneella.
6. Rivinäkymä leveämmäksi tietokoneella; muuta hienosäätöä myöhemmin.

**Emil hyväksyi ehdotukset 22.11.2026** (vaultin sääntö `#tunnisteista` tehty: `ohjeet/muistiinpanot.md`, kohta Tagit). Oma järjestys tallennetaan näkymätiedostoon.
**Päätös (Emil 22.11.2026): Tunniste = asiasana, yksi käsite.** Erillistä asiasanaa ei ole; tunnistetta käytetään sekä asiana että muistiinpanoja ryhmittävänä tunnisteena. Rakenteessa on vain kolme asiaa: **kansio** (aihe, yksi), **tunniste** (poikittainen teema, monta) ja **kenttä** (arvo, esim. `tila: kesken`). ”Erityinen tunniste” (henkilö, paikka) on kenttä, ei uusi laji.
- Asiat-osio → **Tunnisteet**-osio: luettelo, uudelleennimeäminen, yhdistäminen. Tunnisteet ovat tekstissä ja `tagit`-kentässä, eivät vain laitteella.
- Asioiden automaattinen tunnistus säilyy tunnisteen **valinnaisena ominaisuutena** (tunnistussanat vaultin tiedostossa, esim. `#koira` ← koira, koiran, rekku); käsin kirjoitettu ja tunnistettu näkyvät eri tyylillä.
- Asioiden lisäosat (ehdot ja päättely, tärkeysjärjestys, uusiutumisväli, listojen poiminta, Flow-linkit): karsintaan, ellei Emil käytä niitä; tarvittaessa ne tuodaan takaisin tunnisteen ominaisuuksina, ei omana käsitteenä.
- **Suunta:** tulevat toiminnot rakentuvat tunnisteiden päälle eivätkä tee omia ryhmittelyjään: Flow'n ehdot, listojen poiminta, rivinäkymän suodatus, laskenta muistiinpanojen välillä (E), taulukot (C) ja kojelauta (D) käyttävät samoja tunnisteita ja kenttiä. Kun nämä toteutetaan, Juuren vastaavat Asioihin sidotut toiminnot sulautetaan niihin.
- Siirtymä: nykyisten Asioiden nimet tarjotaan tunnisteiksi (Emil valitsee), ennen kuin Asiat-osio poistetaan. Ei hukata Emilin tietoa.

*Hyväksytty toteutus:*
- `#tunniste` (kirjaimet, numerot, väliviiva, ääkköset; ei pelkkä numero, jotta `#3` ei tule tunnisteeksi) ja alkutietojen `tagit: [a, b]` ovat **sama joukko**. Ne näkyvät Asiat-suodattimessa omana ryhmänään (*Tunnisteet*), jotta suodatuspaikkoja on yksi eikä kaksi (appilinja: yksi asia, yksi paikka). Lukunäkymässä `#tunniste` siruna, napautus suodattaa. Rivinäkymän erikoiskenttä `tunnisteet` (sirut).
- Vaultin sääntö: tekoäly ei poista Emilin `#tunnisteita`; käsitellessään se voi lisätä ne myös `tagit`-kenttään yhdenmukaisesti. Vaatii päätöksen `ohjeet/muistiinpanot.md`:hen (kohta Tagit).
- Näkymätiedoston `mista` saa ehdon `tunniste = x` (useampi = kaikki); `jarjestys` useampi avain pilkulla. Apin näkymämuokkain (suodatus, järjestys, sarakkeet raahaamalla) myöhemmin erillisenä vaiheena.
- Valintatila: rivin kahvan vieressä (tai pitkällä painalluksella puhelimella) valintaruudut, alapalkkiin ”Valittu N · Arkistoi · Poista” (poisto vahvistuksen takana, roskakoriin kuten ennen).
- Oma järjestys: Muistion järjestysvalintaan *Oma järjestys*; kahva (appilinjan `bindVt`-malli Mätsikistä) näkyy vain silloin. Järjestys tallennetaan näkymätiedostoon (`nakymat/kaikki.md`, lista tiedostonimiä), jotta se synkkaa laitteiden välillä ja tekoäly näkee sen. Vaatii päätöksen.
- Tietokoneella Muistion leveysraja (nyt n. 1100 px) pois rivinäkymästä.

## 10. Kentät ja kaavamoottori (pohja kohdille 11–14)

**Emil 22.11.2026:** muistiinpanojen tiedot pitää voida laskea yhteen tunnisteiden ja ehtojen mukaan, viitata muistiinpanoihin ja välilehtiin, Google Sheetsin yksinkertaisuudella, ei täyttä Exceliä. Suunta hyväksytty. v1 tehdään tässä kuvatulla syntaksilla (Työjono, periaate); Emil arvioi sen kokeillessa.
- **Kentän arvo muistiinpanossa** kahdella tavalla: alkutiedoissa `saldo: 120` tai tekstissä omalla rivillään `saldo: 120`. Tekstirivi luetaan **vain, jos nimi on vaultin `ohjeet/muistiinpanot.md` → Omat kentät -listassa** (tavallinen lause ei sotke laskuja). Luvussa desimaalipilkku tai -piste. Sama nimi useasti samassa muistiinpanossa = kaikki arvot (summa- ja määräfunktiot laskevat ne).
- **Kaavamoottori** moottoriosioon (`<script id="engine">`, ei DOMia, testattavissa Nodella): lauseke `=…`, luvut, tekstit lainausmerkeissä, `+ - * /`, vertailut, sulut. Funktiot ensin: `SUMMA`, `KESKIARVO`, `MÄÄRÄ`, `MIN`, `MAX`, `JOS`, `PYÖRISTÄ`, `YHDISTÄ` (teksti); myöhemmin tilastot (`KORRELAATIO`, `MEDIAANI`, `KESKIHAJONTA`). Suomenkieliset nimet, puolipiste argumenttien erottimena. Kytköskartan kaavamoottorista (`kytkoskartta/index.html`, `KK`, logiikkapalikka `kaava`) saa lainata jäsennintä.
- **Muistiinpanohaku kaavassa:** `SUMMA(kenttä; ehto; ehto…)`; ehdot `tunniste = x`, `kansio = polku`, `<kenttä> = arvo`, `<kenttä> > luku`, puuttuva ehto = kaikki muistiinpanot. Yksi muistiinpano: `[[tiedostonimi]].kenttä`.
- **Virheet näkyvinä, ei arvauksia:** tuntematon nimi `#NIMI?`, kehäviittaus `#KEHÄ`, puuttuva tiedosto `#PUUTTUU`. Tulokset lasketaan aina tuoreena; **tuloksia ei kirjoiteta tiedostoihin** (ei turhia muutoksia, ei ristiriitoja).
- **Uudelleennimeäminen:** kun appi siirtää tai nimeää tiedoston, se päivittää viittaukset `[[vanha]]` → `[[uusi]]` samassa yhteydessä (yksi commit-jono); tekoälyn ohjeeseen sama sääntö.
- Testit: logiikkatesti Nodella (`kaikki/testit/logiikka_kaava.js`): laskut, ehdot, tunnisteet, kehä, desimaalit, ääkköset.

## 11. Kaavat muistiinpanoissa ja rivinäkymässä

- Muistiinpanon tekstissä `{=KESKIARVO(uni; tunniste = uni)}` → lukunäkymässä tulos (korostettu siru), kirjoittaessa kaava näkyvissä. Kentän arvo voi olla kaava: `jaljella: =[[remontti-budjetti]].budjetti - SUMMA(hinta; tunniste = remontti)` (kokoava muistiinpano).
- Rivinäkymän näkymätiedostoon kaavasarake: `- =SUMMA(hinta; tunniste = remontti) | luku | €` tai rivikohtainen `- =hinta*1.24 | luku | €` (viittaa rivin omiin kenttiin). Näyttötavat kuten muissakin sarakkeissa.
- Vaultin `ohjeet/appi.md`: kaavojen muoto tekoälyille.

## 12. Laskentataulukko ja välilehdet

**Emil 22.11.2026:** oma laskentataulukko, välilehdet, viittaukset välilehtien ja muistiinpanojen välillä; Sheetsin yksinkertaisuus.
- **Tiedosto per välilehti**, taulukko = kansio: `taulukot/<taulukko>/<valilehti>.md` (`tyyppi: taulukko`, `nakyy: ei` ei tarvita, koska taulukko on Emilin). Sisältö tavallinen markdown-taulukko (ihminen ja tekoäly lukevat sellaisenaan); ensimmäinen rivi = sarakkeiden otsikot, sarakkeet A, B, C… ja rivit 1, 2… kuten Sheetsissä; kaavasolu alkaa `=`.
- Viittaukset: oma välilehti `B3`, `B2:B8`; toinen välilehti `[[kulut]]!B3`; muistiinpanot kuten kohdassa 10.
- Apissa uusi osio **Taulukot** (tietokone ensin): ruudukko, solun napautus muokkaa, kaava näkyy muokatessa ja tulos muuten, välilehdet alareunassa. Tallennus kuten muistiinpanoissa (vault-jono, ristiriidassa molemmat versiot säilyvät).
- **Välilehti voi olla näkymä muistiinpanoista:** alkutiedoissa `mista: tunniste = remontti` ja `sarakkeet:` kuten näkymätiedostossa → rivit tulevat muistiinpanoista (vain luku), viereen saa omia kaavasarakkeita. Näkymätiedostot (`nakymat/`) ja tämä ovat sama muoto, jotta käsitteitä ei tule kaksi.
- Vienti: välilehti CSV:nä (muualle, esim. Sheetsiin).

## 13. Taulukosta kojelaudaksi (D)

**Emil 22.11.2026:** taulukko on logiikka; sen päälle käyttäjän pinta: vapaasti sijoiteltavat, raahaamalla koon muuttavat kortit (luku, palkki min–max, liukusäädin, kytkin, nappi, kuvaaja, kuva, teksti), arvot soluista; säädin ja kytkin kirjoittavat syöttösoluun; muokkaustila ja **lukittu käyttötila** (työnhallintana ilman vahinkomuokkauksia), solukohtainen lukitus; ulkoasu säädettävissä (ei tylsintä mahdollista). Numbersin vapaus, Notionin tapa näyttää arvo muutenkin kuin tekstinä.
- Tallennus: sama taulukkokansio, tiedosto `taulukot/<taulukko>/_nakyma.md` (korttien paikat, koot, lajit, solut ja tyylit luettavana tekstinä).
- **Suunnitellaan tarkemmin ennen toteutusta** (ks. Pohdittavat): korttien tyylivalinnat, kosketus vs. hiiri, puhelimen asettelu. Riski: Appi-appin uudelleenrakentaminen Kaikin sisään; käytä samaa ruudukkoa ja näyttötapoja kuin kohdat 2 ja 12.

## 14. Juuren karsinta

**Emil 22.11.2026:** Kaikki eriytyy Juuresta; karsitaan, mitä tämä käyttötapa ei tarvitse; puhelinnäkymä riisutaan (kalenteri, uusi muistiinpano ja kuvaajat keskeisiä).
- Kysy Emililtä lista kerrallaan (kysely), mitä Juuren osia hän käyttää: Listat (kierrokset, tarkistuslistat, Viikot), Flow, Vanhat puut, Toistuvat, pikamuistiinpano, päivän napit, Asioiden lisäosat (ehdot, tärkeysjärjestys, uusiutumisväli). Karsi vain hyväksytyt; laitteella oleva tieto viedään ensin talteen (varmuuskopio) ja tarvittaessa vaultiin.
- Asiat → Tunnisteet kohdan 9 päätöksen mukaan (siirtymä: nykyiset Asiat tarjotaan tunnisteiksi).

**Emilin vastaukset (kysely 22.11.2026):**
- **Pidetään:** Listat (tarkistuslistat, kierrokset, Viikot), Flow, Toistuvat.
- **Karsitaan:** vanha Juuren pikamuistiinpano (uusi pikakirjaus korvaa sen); Vanhat puut (oli jo piilossa vanhoissa näkymissä); Asiat-osio tunnisteiden tieltä (siirtymä tehty 0.28).
- **Asioiden lisäosat tunnisteiden ominaisuuksiksi:** tärkeysjärjestys (ohjaa Muistion Tärkeys-järjestystä) ja uusiutumisväli. **Karsitaan:** ehdot ja päättely.
- Toteutus: ennen poistoa varmuuskopio ja laitteella olevan tiedon vienti; poisto omana versionaan, testit päivitetään (vanhat Juuren testit, jotka koskevat karsittua, poistetaan samassa yhteydessä ja kirjataan).

## 15. Pikakirjaus: muistutukset ja seuranta muutamalla napautuksella (Emil 22.11.2026)

**Emil:** varsinkin puhelimella helposta napista pikaikkuna, jossa omat valmiit napit. Kaksi käyttöä: **muistutus** (nappi → kalenterivalitsin, yksi tai monta päivää, ulkopuolinen napautus sulkee ja valinnat jäävät voimaan) ja **seuranta** eli jo tapahtuneen kirjaus (nappi = toteutui tänään, tai arvo pienestä valikosta ilman näppäimistöä). Kaikki tallentuu, kun ikkunasta poistutaan; tallentuu sekä tekoaika että päivä, jota kirjaus koskee. Kirjaus menee oikeassa muodossa kojelautaa, taulukoita ja laskentaa varten ja saa halutut tunnisteet. Seurannat näkyvät kalenterissa valmiiksi kuitattuina omalla tyylillään, eivät sekoitu tekemättömiin. Napit ja esiasetukset itse tehtävissä ja muokattavissa; laajempi editori tietokoneelle. Lisäksi: säännöt, millainen teksti lisää minkä tunnisteen automaattisesti.

**Nykytila (tarkistettu koodista 22.11.):** Juuren pikamuistiinpano on Listat-osiossa (`openPika`, `renderPika`, `pikaPick`): napit tulevat laitteen tarkistuslistan riveistä (`data.chk`), napautus avaa kuukausivalitsimen ja tekee muistutusmuistiinpanon. Napit ovat vain laitteella, eivät vaultissa. **Kalenterin Vk-näkymä on jo päiväkohtainen lista** (päivät allekkain, merkinnät napautettavina, kuittausympyrä 0.6), eli Emilin toivoma ”päivälista ilman kellonaikoja” on olemassa; jatkossa siihen lisätään seurantakirjausten tyyli.

**v1, ei lisäkysymyksiä (Emil hyväksyi v1-muodot kokeiltaviksi):**
- Esiasetukset vaultin tiedostossa `pohjat/pikakirjaus.md` (`pohjat/` on jo piilossa muistiinpanoista; appi näyttää tiedoston Tekoälylle-paikassa muokattavana):
  ```
  ## Seuranta
  - Treeni | kyllä | #treeni
  - Energia | 1-5
  - Paino | luku | kg
  - Mieliala | xy 0-100
  ## Muistutus
  - Kissan matolääke | #kissa
  - Laskut
  ```
  Rivi: `nimi | laji | tunnisteet tai yksikkö`. Lajit: `kyllä` (napautus = toteutui), `1-5` (tai muu väli: numeronapit), `luku` (pieni numeronäppäimistö appissa, ei laitteen näppäimistöä), `valinta: a, b, c`, `xy 0-100` (ks. alla). Muistutuksessa ei lajia.
- **Avaus:** puhelimella alapalkin `+` pitkä painallus tai oma pieni nappi alapalkissa (ei uutta osiota); tietokoneella yläpalkin nappi. Ikkuna: kaksi välilehteä Seuranta | Muistutus (viimeisin muistetaan laitteella), napit ruudukkona Emilin järjestyksessä.
- **Seuranta tallentuu:** jos nimi on `data/mittarit.json`:n mittari → arvo `data/*.csv`:hen kuten 0.13:n kirjaus; muuten rivi päivän muistiinpanoon `paivat/VVVV/VVVV-KK-PP.md` muodossa `- klo 14.32 · treeni: kylla #treeni` (kenttärivi kohdan 10 mukaan; nimi lisätään vaultin Omat kentät -listaan Emilin luvalla, kun nappi tehdään). Päivä oletuksena tänään, ikkunan yläreunan päiväsirusta voi vaihtaa (esim. eilinen).
- **Muistutus tallentuu:** yksi muistiinpano per nappi, kaikki valitut päivät tekstissä (`Kissan matolääke ma 24.11., ma 1.12. #kissa`), jolloin kalenteri näyttää jokaisen päivän omana merkintänään ja kuittaus toimii päivittäin (0.6).
- **Kalenterissa** seurantakirjaukset (päivän muistiinpanon kenttärivit ja mittarit) näkyvät Vk-näkymän päivän alla himmeänä *Kirjattu*-rivinä (esim. `Kirjattu: treeni, energia 3, paino 112,4`), valmiiksi kuitattuina, eivät kuittausympyrällisinä tehtävinä.
- **Napin teko apissa:** ikkunan lopussa `+ Uusi nappi` → kysyy Seuranta vai Muistutus, nimen, lajin ja tunnisteen napautuksin, lisää rivin `pohjat/pikakirjaus.md`:hen.
- **Automaattiset tunnisteet (säännöt):** vaultin `pohjat/tunnisteet.md`, rivit `#koira: koira, koiran, rekku`. Appi lisää osuvat tunnisteet muistiinpanon `tagit`-kenttään (ei Emilin tekstiin) tallennettaessa; näkyvät päätellyn tyylillä. Korvaa Juuren Asioiden sanatunnistuksen (kohta 9).
- Vanha Juuren pikamuistiinpano (Listat) jää, kunnes karsintakysely (kohta 14) päättää.

**v1:n jälkeen, myös tarkka (työjonossa heti pikakirjauksen perään): XY-pädi, sama kaikkialla (Emil 22.11.2026).** Yksi yhteinen lukuvalitsin pikakirjaukseen, seurantaosioihin, mittarien kirjaukseen ja myöhemmin kojelaudan säätimiin.
- **Perusmalli:** pyöristetty neliö; vaakasuunta = alempi numero, pystysuunta = ylempi numero (0–9, alhaalta ylös), eli yksi pädi = kaksi numeroa. Arvo näkyy isona sormen vieressä raahatessa; irrotus → `Peru` (vasemmalla) / `OK` (oikealla), ei sormen kohdalla.
- **Tarkkuus pienellä valitsimella pädin yläpuolella:** `0–10` (yksi vaakanauha, 11 kohtaa), `0–100` (yksi pädi), `0–1000` (pädi + yhden numeron nauha satoja varten). **Desimaalit** omalla valitsimella `,0 / ,1 / ,01`: toinen nauha (1 desimaali) tai toinen pädi (2 desimaalia). Kirjaushetkellä tila saa kulua (Emil).
- **Muistaa valinnan kontekstissa:** tarkkuus ja desimaalit tallentuvat napin esiasetukseen (`pohjat/pikakirjaus.md`, esim. `Paino | xy 0-1000 ,1 | kg`), jolloin ne ovat samat kaikilla laitteilla; valitsimen muutos päivittää rivin.
- *Ehdotus (tekoäly) lisäksi:* **suhteellinen tila** arvoille, jotka ovat yleensä lähellä edellistä (paino): pädin keskikohta = edellinen kirjattu arvo, vaakasuunta ±0,1-askeleet, pystysuunta ±1-askeleet (väli asetettavissa, esim. ±5). Valinta `suhteellinen` esiasetuksessa. Emil arvioi kokeillessa.
- Testi: Playwrightin hiiriraahaus tietokoneella; sormella vain oikealla iPhonella (kerro Emilille).

**Uni, treeni ja ravinto (Emil 22.11.2026: niiden seuranta voi siirtyä tänne ainakin osittain):**
- v1 (ei lisäkysymyksiä): päivän yhteenveto mittareina `data/paiva.csv`:hen pikakirjauksen napeilla, esim. `uni` (tunnit, luku), `unen-laatu` (1-5), `treeni` (kyllä), `treenin-kesto` (min), `ateriat` (luku) tai `ruokailo` (1-5). Uusi mittari vaultin `ohjeet/data.md`:n mukaan Emilin luvalla.
- Applen Terveys: iOS-pikakomento voi lukea unen tai treenin Terveydestä ja avata linkin `…/kaikki/?kirjaa=uni 7,5` (kohta 6.2), jolloin kirjaus tulee ilman näpyttelyä.
- Myöhemmin (visio): tarkemmat taulukot, joissa monta riviä päivässä (treenin sarjat, ateriat), ja kojelauta niille; suhde olemassa olevaan Treenikarttaan (`treenikartta/`) ja master-tiedot-ideoihin (Annoskirja, Ruokakartta, Mittarit) päätetään erikseen, ettei sama seuranta ole kahdessa appissa.

**Visio (ei v1:tä ennen tarkennusta):** tietokoneen laajempi pikakirjausten editori; tunnistus milloin jokin toteutuu tai on tietyn arvoinen ja tilastointi siitä; korrelaatiot napeissa (Päiväkartan ja Projektikartan tapaan värinä ja palkkina).

## 16. Seurantaosiot: Kaikki on kaikkien seurantojen koti (Emil 22.11.2026)

**Päätös (Emil):** treenit, uni, ravinto ja muut seurannat tulevat Kaikki-appiin. Kaikki tieto menee vaultiin, mutta jokaiselle seurannalle voi olla oma, räätälöity osio, joka palvelee järkevää tapaa kirjata ja seurata, varsinkin puhelimella. Osiot ovat vain eri näkymiä samaan vaultin dataan (kuten Muistio, Kalenteri ja Kojelauta), ja ne voi piilottaa laitekohtaisesti (0.12).

**Yhteiset säännöt seurantaosioille:**
- Data vaultin `data/`-kansioon, kuvaus `data/mittarit.json`:iin. Päivän yhteenveto `data/paiva.csv`:hen (yksi rivi päivässä); tarkemmat tiedot omiin taulukoihin, joissa voi olla monta riviä päivässä (esim. `data/treeni.csv`: `pvm, klo, liike, sarja, toistot, paino`). Vaultin `ohjeet/data.md` laajennetaan monirivisiin taulukoihin, kun ensimmäinen tehdään (nyt: ”sama päivä vain kerran”).
- Kirjaus aina myös pikakirjauksella (kohta 15) ja tekstimuodolla (6.2), jotta tekoäly ja pikakomennot voivat kirjata samaan paikkaan.
- Kojelauta osaa koota monirivisen taulukon päiväksi (summa, määrä, suurin) ennen kuvaajaa.
- Osion ulkoasu appilinjan mukaan: puhelin ensin, usein painettavat alhaalla, taulukkomalli (rivit ja sarakkeet) seurannoissa.

**Ensimmäinen seurantaosio: Treeni.** Emilin nykyinen erillinen appi on Treenikartta (`treenikartta/`, tila `treenikartta/TILA.md`). Ennen v1:tä **kysely Emilille**: mitkä Treenikartan toiminnot otetaan mukaan (liikkeet ja lihasryhmät, sarjojen kirjaus, kalenteri, lihasryhmien tiheys, ennätykset …) ja siirretäänkö Treenikartan vanha data vaultiin (Treenikartan vienti → `data/treeni.csv`, kertaluonteinen). Sen jälkeen v1 ilman lisäkysymyksiä. Treenikarttaa ei muuteta eikä poisteta tässä yhteydessä; sen tulevaisuus päätetään, kun Treeni-osio on kokeiltu.
**Emilin vastaukset (kysely 22.11.2026), v1 voidaan nyt rakentaa:** mukaan **sarjojen kirjaus** (liikelista, sarja n/x, toistot ja paino − +, painoehdotus, ”Viimeksi …”), **liikkeet ja lihasryhmät** taulukkoina ja **seuranta ja graafit** (treenipäivät 12 viikolta, viikon sarjat, arvioitu maksimi, tavoitteet palkkeina). Historia ei v1:ssä. **Vanha data siirretään** kertaluonteisesti Treenikartan varmuuskopiosta `data/treeni.csv`:hen (liikkeet ja ryhmät omaan tiedostoonsa, esim. `data/treeni-liikkeet.md` tai `.json`; muoto kirjataan `ohjeet/data.md`:hen). **Treenikartta jää rinnalle**, kunnes Treeni-osio on kokeiltu ja riittää; sitten Emil päättää. Treenikartan logiikkaa (painoehdotus Epley, jaksot, tavoitteet) saa kopioida `treenikartta/index.html`:stä.
**Data siirretty 22.11.2026:** Emilin Treenikartan varmuuskopio on vaultissa: `data/treeni.csv` (sarja per rivi: pvm, klo, treeni, liike, liike_id, sarja, kg, toistot), `data/treeni-liikkeet.json` (liikkeet, ryhmät, treenikerrat, asetukset) ja alkuperäinen `arkisto/treenikartta/`. Muoto vaultin `ohjeet/data.md`:ssä. Treeni-osio lukee ja kirjoittaa näitä.
**Muut seurannat** (uni, ravinto): ensin päivän yhteenvetomittareina pikakirjauksella (kohta 15); oma osio vasta, kun Emil kokee tarvitsevansa sitä.

## 17. Kuittaukset synkkaan ja metatieto pois tekstistä (Emil 22.11.2026)

**Emil:** kuittasi saman kalenterimerkinnän koneella ja puhelimella, koska kuittaus ei näkynyt toisella laitteella. Kuittauksen pitää mennä muistiinpanoon jonain appin ymmärtämänä merkintänä, ja sama koskee seurantakirjauksia (näkyvät kalenterissa valmiiksi kuitattuina). Appin tunnistama metatieto ei saa sekoittua tekstiin: se näytetään erillään (pienenä, piilossa avattavana), vaikka tiedostossa se on tekstinä mukana.
**Selvitetty 22.11. (Claude):** vaultin muistiinpanon kuittaus **tallentuu jo** tiedostoon alkutietojen riville `juuri: {"pts":{"2026-11-22 16:00":…}}` ja lähtee GitHubiin n. sekunnissa (kokeiltu testirepolla). Mutta **Toistuvat, Listat ja tarkistuslistat ovat vain laitteella** (`kaikki:v1`), joten niistä syntyneiden merkintöjen kuittaus ei siirry. Todennäköisin syy Emilin tapaukseen. Toinen mahdollinen syy: toisella laitteella on samasta tiedostosta lähettämätön oma muutos, jolloin haku ei korvaa sitä.
**v1, ei lisäkysymyksiä:**
1. **Luettava kuittausrivi alkutietoihin:** appi kirjoittaa kuittaukset riville `kuitattu: 2026-11-22 16:00, 2026-11-29 16:00` (päivä ja kellonaika, pilkulla erotettuna; ajaton päivä ilman kellonaikaa) ja lukee sekä tämän että vanhan `juuri`-JSONin. Ihminen ja tekoäly näkevät kuittauksen; tekoäly voi myös kuitata kirjoittamalla rivin. Vaultin `ohjeet/appi.md` ja `muistiinpanot.md` päivitetään.
2. **Emilin valinta 22.11. (kysely): sekamalli.** Toistuvat luettaviksi tiedostoiksi `toistuvat/<nimi>.md` (tekoäly voi lukea ja muokata); Listat ensin yhteen rakenteiseen tiedostoon `listat/listat.json` (luettava muoto myöhemmin). Yhdistäminen kolmisuuntaisesti tunnisteen mukaan: pohja = viimeksi synkattu versio (välimuistissa), muutos vain toisella puolella → se voittaa; molemmilla → GitHubin versio voittaa ja oma kopioidaan ristiriitakopioksi; mitään ei poisteta ilman, että poisto näkyy pohjaan verrattuna. Ennen ensimmäistä synkkaa laitteen tiedot varmuuskopioon.
   Alkuperäinen ehdotus: **Toistuvat ja Listat vaultiin** (Emil päätti pitää ne, kohta 14): toistuvat tiedostoiksi `toistuvat/<nimi>.md` (alkutiedoissa sääntö: väli, alku, tunnisteet; kuittaukset kuten kohta 1) ja tarkistuslistat `listat/<nimi>.md` (rivit `- [ ]`/`- [x]`). Laitteelle jäävät vain asetukset. Siirtymä: nykyiset viedään ensin varmuuskopioon ja sitten vaultiin.
3. **Seurantakirjaukset kalenterissa kuitattuina** (pikakirjaus, mittarit, treenit): näkyvät kalenterin päivässä *Kirjattu*-tyylillä, ei kuittausympyrää (kohta 15).
4. **Metatieto erillään tekstistä:** alkutiedot (kuitattu, tagit, omat kentät, juuri) eivät koskaan näy tekstikentässä; muistiinpanoikkunan sirun ikkunaan (0.9) *Tiedot*-osio, jossa ne näkyvät pieninä riveinä (avain · arvo) ja ovat muokattavissa. Appi kirjoittaa oman metatietonsa **vain alkutietoihin**, ei tekstiin. Tekstissä olevat appin tunnistamat rivit (`hinta: 120`, `Mittarit: …`, `#tunniste`, `{=kaava}`) jäävät tekstiin, koska Emil kirjoitti ne itse, mutta ne näytetään erottuvalla tyylillä (himmeä tasalevyinen siru), ja niiden kohdalla on valinta *Siirrä tietoihin*.
5. Synkka varmistetaan testillä, jossa kaksi laitetta jakaa saman testirepon (kuittaus laitteella A → näkyy laitteella B haun jälkeen).

## 18. Toistuvuus mille tahansa muistiinpanolle: toistuvat tehtävät listana (Emil 22.11.2026)

**Emil:** toistuvat tehtävät listan kaltaisena listana, jossa OK laukeaa uudelleen kuitattavaksi kohteelle määritetyllä tavalla. Mikä tahansa tiedosto, joka kertoo milloin se laukeaa, voisi olla tällainen kohde. Sykli nollautuu, jos asia tehdään muuna aikana. Pikamuistiinpanosta voi ohjelmoida ensimmäisen laukeamispäivän, josta kuitattaessa sykli alkaa.
**Ehdotus (tekoäly), v1 ilman lisäkysymyksiä (yksi käsite, ei erillistä Toistuvat-rakennetta):**
- Muistiinpanon kenttä `toistuu: 2 viikkoa` (luku + päivä/viikko/kuukausi/vuosi) ja valinnainen `seuraava: VVVV-KK-PP` (ensimmäinen tai seuraava laukeamispäivä). Oletuksena **kuittauksesta**: kuittaus (milloin tahansa, myös etuajassa) asettaa `seuraava` = kuittauspäivä + väli, eli sykli nollautuu; `toistuu: 2 viikkoa tasavälein` pitää kalenterirytmin.
- Kuittaus käyttää kohdan 17 `kuitattu:`-riviä; viimeisin kuittaus ratkaisee.
- **Toistuvat-lista** (Listat-osioon tai Muistion näkymäksi): kaikki muistiinpanot, joilla on `toistuu`; ensin erääntyneet (punainen), sitten tänään, sitten tulevat (himmeä, päivä näkyvissä). OK-ruutu kuittaa. Sama kohde näkyy kalenterissa `seuraava`-päivänä.
- Pikakirjauksen Muistutus-välilehdelle valinta *Toistuu* (väli napautuksin), jolloin valittu päivä on `seuraava`.
- 0.35:n `toistuvat/<nimi>.md` -tiedostot muutetaan tähän muotoon (`toistuu`, `seuraava`, kuittaukset), jolloin vanha Toistuvat-rakenne voidaan karsia. Toistuvan synnyttämiä erillisiä muistiinpanoja ei enää tarvita.
- Testi: kuittaus etuajassa siirtää seuraavan, tasavälein ei siirrä, erääntyneet ensin, kahden laitteen synkka.

## 19. Graafinäkymä (Emil 22.11.2026: ”graphic mode kuten Obsidianissa, onko raskas?”)

**Arvio:** ei raskas nykyisellä vaultilla (n. 150 muistiinpanoa; tuhansillekin kevyt omalla yksinkertaisella voimasimulaatiolla ja canvas-piirrolla ilman kirjastoja, n. 200 riviä). Koko vaultin graafi on yleensä lähinnä kaunis; **paikallinen graafi** (avoimen muistiinpanon naapurit 1–2 askeleen päähän) on käytännössä hyödyllisempi.
**v1 ilman lisäkysymyksiä:** tietokoneella osio tai Muistion näkymä *Graafi*: pisteet = muistiinpanot, viivat = `[[linkit]]` (ja valinnaisesti yhteiset tunnisteet ohuempina), väri kuka kirjoitti -värien mukaan, koko linkkien määrän mukaan; vieritys ja zoomaus, napautus avaa esikatselun, kaksoisnapautus muistiinpanon. Muistiinpanoikkunaan *Paikallinen graafi* -painike. Suodatus samoilla ehdoilla kuin näkymissä. Simulaatio pysähtyy, kun asettelu on valmis (ei kuluta akkua).

## 20. Kanvaasi: muistiinpanot kartalle ja yhteydet viivoilla (Emil 22.11.2026) — **HYLLYLLÄ (Emil 22.11.: toistaiseksi ei)**

**Emil:** pohjalle valitaan muistiinpanoja yksi kerrallaan pieniksi esikatseluikkunoiksi (napautus avaa isommin), viiva vedetään toisesta toiseen, ja viivasta syntyy linkki tiedostoihin. Viivalla laji, esim. ”tästä seuraa tämä” nuolena, joka kirjoitetaan kumpaankin tiedostoon. Työnkulkuja, joita tekoälykin voi seurata.
**Ehdotus (tekoäly), visio, vaatii Emilin päätökset ennen v1:tä:**
- Kanvaasi tiedostona avoimessa **JSON Canvas** -muodossa (`kanvaasit/<nimi>.canvas`, sama kuin Obsidianissa: solmut = tiedostot paikkoineen, reunat = viivat lajeineen), jolloin se aukeaa myös muualla.
- Viivan lajit lyhyestä listasta: *seuraa* (nuoli), *edellyttää*, *liittyy*, *ristiriidassa*. Yhteys kirjoitetaan molempien muistiinpanojen **alkutietoihin** (metatieto, ei tekstiin, kohdan 17 periaate), esim. lähteeseen `seuraava: [[b]]` ja kohteeseen `edellinen: [[a]]`; näkyy Tiedot-osiossa ja graafissa. Tekoäly lukee yhteydet alkutiedoista ja kanvaasista.
- Toteutuksessa kannattaa käyttää Kytköskartan ja Appi-appin kanvaasikoodin malleja (solmut, nuolet, zoomaus).
- Liittyy Flow'hun (kohta 7): kanvaasi voisi olla Flow'n graafinen muokkain, jolloin työnkulku on yksi käsite kahdella näkymällä. **Kysymykset Emilille:** kirjoitetaanko yhteydet alkutietoihin vai tekstin loppuun näkyväksi osioksi; mitkä viivalajit; yhdistetäänkö Flow'hun.

## Pohdittavat (ei toimintaohjetta vielä)

- **Flow tekstinä** (kohta 7 kokeilee): tarkka muoto (sisennetty luettelo vs. muu), miten haarat, ehdot (tunnisteet ja kentät) ja tulokset kirjoitetaan; vaatii Emilin päätöksen kokeilun jälkeen.
- **Kojelauta-rakentajan yksityiskohdat** (kohta 13): korttien tyylit, kosketus, puhelinasettelu.
- **Kojelaudan kuvaajien ulkoasuasetukset** (nykyinen 0.7-kojelauta).
- **Listat suhteessa vaultiin:** tehtävärivit `- [ ]` vai `projektit/`-kansio vai tunniste + kenttä `tila`.
- **Tunnistussanat:** ratkaistu v1:ksi kohdassa 15 (`pohjat/tunnisteet.md`).
- **Kuvat ja liitteet** vaultissa (Notionista irtautuminen).
- **Notion-sisällön siirto** vaultiin pala kerrallaan.
