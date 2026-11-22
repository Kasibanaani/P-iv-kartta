# Kaikki: tila

**Vaihe:** versio 0.10 (kokeilu) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/kaikki/ · **Päivitetty:** 22.11.2026

Emilin "toinen aivo" -appi. **Juuren (`paatospuu/`, versio 1.113) kopio**, johon on lisätty yhteys Emilin yksityiseen GitHub-vaultiin (`Kasibanaani/vault123`). Emil 22.11.2026: Juuren muistiinpanot ja kalenteri tehdään *tarkasti Juuren mukaan*, koska niiden käytettävyys on jo hiottu. Siksi koodi on kopio eikä uudelleen kirjoitettu. Kaikkea Juuresta ei tarvitse säilyttää: karsinta päätetään Emilin kokeilun jälkeen.

Vaultin oma ohje tekoälylle on vaultin `AGENTS.md`. Mihin appi luottaa vaultissa: vaultin `ohjeet/appi.md` (pidä ajan tasalla, kun appi muuttuu).

## Valmiina (0.1, 22.11.2026)

- Kaikki Juuren 1.113 toiminnot sellaisinaan (Muistio, Kalenteri, Listat, Flow, Asiat, projektit, vienti ja tuonti). Omat tallennusavaimet `kaikki:v1`, `kaikki:calview`, `kaikki:listview`, `kaikki:luonnos`, `kaikki:vanhat`, joten Juuren tiedot eivät sekoitu. Tallennusmuoto sama kuin Juuressa (`app:'paatospuu'`), joten Juuren varmuuskopion voi tuoda. Vientitiedosto `Kaikki.json`.
- **GitHub-vault** (Valikko → GitHub-vault, ohje i-napissa): repo + avain (fine-grained, Contents read/write). Appi tarkistaa, että repo on yksityinen.
  - **Ensimmäisen projektin** muistiinpanot = vaultin näkyvät `.md`-tiedostot. Piilossa: `ohjeet/ pohjat/ yllapito/ arkisto/ data/ liitteet/`, juuren tiedostot ja `_`- tai `.`-alkuiset nimet (`VAULT.visible`).
  - Tiedoston `# Otsikko` näkyy Juuressa ensimmäisenä rivinä ilman #:ia; alkutiedot säilyvät rivi riviltä. Juuren omat lisätiedot (kuittaus, aika, päivä, kiinnitys …) kulkevat alkutietojen rivillä `juuri: {json}`.
  - Uusi muistiinpano → `inbox/VVVV-KK-PP-HHMM-alku.md` (`tyyppi: inbox`, `lahde: emil`, otsikko päivittyy ensimmäisestä rivistä). Poistettu → siirto `arkisto/<polku>` (vaultin sääntö: ei poistoja). Juuren järjestelmäilmoitukset (`rep:'rx'`) jäävät laitteelle.
  - Haku: koko puu yhdellä pyynnöllä, sisältö vain muuttuneista (sha). Kun appi avataan tai tuodaan esiin, haetaan; kun se piilotetaan, lähetetään. Avoinna olevaa muistiinpanoa ei päivitetä kesken kirjoituksen.
  - Ristiriita (sama tiedosto muuttui GitHubissa välissä): GitHubin versio jää paikalleen, oma tallentuu viereen `…-ristiriita-HHMM.md`. Mitään ei katoa.
  - Pelkkä lukeminen ei koskaan kirjoita GitHubiin (`mdOf(noteOf(md)) === md`, testattu).
  - Valikon napissa punainen piste, jos muutoksia odottaa tai yhteydessä on virhe.
- Tallennus: välimuisti `kaikki:vault` `{files:{polku:{sha,t}}, known, q}`, asetukset `kaikki:gh` `{repo, token, branch}`.
- Testit `sh kaikki/testit/aja.sh`: Juuren moottorin logiikkatestit (491), Juuren tuoreimmat selaintestit 1.104–1.109 ja `selain_vault.py` (vaultin synkka testirepoa vasten, `fakegh.js`), 390 ja 320 px. Juuren vanhemmat selaintestit jätettiin pois, koska ne eivät mene läpi Juuressakaan (vanhentuneet 1.108:n karsinnan jälkeen).

- 0.1.1–0.1.2 (22.11.2026): avaimesta poistetaan näkymättömät merkit, yhteysvirheeseen tulee selaimen oma ilmoitus, eikä avainkenttä ole enää salasanakenttä (Safari täytti repokenttään kirjautumistiedon). Emil sai yhteyden toimimaan oikealla iPhonella.
- **0.2 (22.11.2026, Emilin pyyntö): siisti teksti ja tekoälyn muistiinpanot piiloon.**
  - Alkutiedoissa `nakyy: ei` → muistiinpano ei näy apissa (`VAULT.shown`). Jos tekoäly piilottaa jo näkyvän, se poistuu apista arkistoimatta.
  - Markdown-merkit (`#`-otsikot, `- `-luettelot, `**lihavointi**`): lukunäkymässä merkit piilossa, otsikot ja lihavoinnit lihavoituna, luettelot pisteinä; kirjoittaessa merkit haaleina ja otsikot korostusvärillä. Teksti piirtyy korostuskerroksesta (`#ns-hl`), tekstikentän teksti on läpinäkyvä, jotta merkit voidaan häivyttää (`VAULT.mdMarks`). Vaultin `#`-otsikko (ensimmäinen rivi) korostettuna.
  - Muistiinpano aukeaa oletuksena lukunäkymänä (Juuren 1.80-asetus, oletus muutettu). Otsikot listassa ja kalenterissa ilman merkkejä (`noteTitle` → `VAULT.mdPlain`).
- **0.2.1 (22.11.2026, Emilin bugiraportti):** sanalinkkien sanat katosivat ja jäljelle jäi pelkkä pisteviiva (0.2:ssa teksti alkoi piirtyä korostuskerroksesta, jossa linkit `.wl` ja asiasanalinkit `.th` olivat läpinäkyviä). Nyt teksti näkyy, ja sanalinkin viiva on ohut ja haalea (Emil: linkit säilyvät mutta hienovaraisina). Testi `selain_linkit.py` (tumma ja vaalea teema).
- **0.3 (22.11.2026, Emilin pyyntö): kuka kirjoitti -suodatin ja päivitys.**
  - Muistiossa henkilö-nappi (`#srcpick`, `srcMenu`): Kaikki sisältö / Vain omat / Omat ja yhdessä / Tekoälyn / Tekoälylle / Kaikki myös tekoälylle. Valinta `kaikki:lahde`. Laji `VAULT.kindOf`: `ohjeet/`, `nakyy: ei` tai `tyyppi: ohje` = tekoälylle (oletuksena piilossa); muuten `lahde` emil/puuttuu = oma, `emil+…` = yhdessä, muu = tekoäly. Toteutus `vApply`:n kautta (pois rajattu poistuu näkymästä arkistoimatta, kuten `nakyy: ei` ennen), joten myös kalenteri ja sanalinkit noudattavat rajausta. Kortissa pieni tunniste.
  - `> `-rivit: lukunäkymässä pieni ✦ (vaultin sääntö: `> ` = tekoälyn lisäys).
  - Päivitysnappi `.vref` yläpalkissa (puhelimella pieni nuoli oikeassa yläkulmassa): vie ja hakee heti (`vRefresh`). Automaattihaku minuutin välein, kun appi on näkyvissä eikä jonossa ole mitään.
  - Testi `selain_lahde.py`. Vaultin ohjeet päivitetty (`ohjeet/appi.md`, `ohjeet/muistiinpanot.md`, `AGENTS.md`).
- **0.4 (22.11.2026, Emilin palaute puhelimelta):**
  - Muistion yläpalkki ei enää levene: henkilö-nappi on aina pelkkä kuvake (valittuna korostettu), hakukenttä joustaa. Aiemmin valinnan nimi työnsi hakukentän ruudun yli, ja lista heilui sivuttain. `#main` ei vieri sivuttain, eikä sivu jousta reunoilla (`overscroll-behavior:none`).
  - Päivitysnappi alapalkissa pikaviennin paikalla (`#vref2`), kun vault on käytössä; pikavienti näkyy vain ilman vaultia. Yläreunan pieni nappi pois puhelimelta (tietokoneella ennallaan). Vienti ja tuonti edelleen Valikossa.
  - Muistiinpanon vieritys ei enää nyi: ilman näppäimistöä tekstikenttä kasvaa koko mittaansa (`noteGrow`), joten ikkuna vierii itse eikä tekstikerros jää jälkeen tekstikentän sisäisestä vierityksestä.
  - Kalenteri puhelimella: viikkonauha alhaalla alapalkin yläpuolella, matalampana (38 px, ilman asiasanarivejä). Ohjaimet: `‹ Kuukausi ›` ylempänä keskellä, `Tänään · Vk/Pv · päivitys` alempana.
- **0.5 (22.11.2026):** `[[linkit]]` näkyvät otsikkoina ja ovat napautettavia; korttien teksti ilman markdown-merkkejä (testi `selain_linkki.py`).
- **0.6 (22.11.2026, Emilin palaute): nopeus, tiivis Muistio, kuittaus kalenteriin, ⋯-valikko, värit ja tekstikoko.**
  - Nopeus: päivämäärien jäsennys (`parseDates`) muistissa tekstin, luontihetken ja lukitusten mukaan (`PDC`, kopio jokaiselle kutsujalle). Kalenteri jäsensi ennen jokaisen tekstin jokaiselle päivälle. Mitattu vaultin 149 muistiinpanolla, tietokoneen selain 4× hidastettuna: Muistio 2,1 → 0,7 s, Kalenteri 4,8 → 0,4–0,5 s, muistiinpanon avaus 0,7 → 0,3 s. Kortin teksti lyhennetään (`CARDLEN` 360 merkkiä), haku ilman sisäkkäistä silmukkaa.
  - Kortti: otsikko (ensimmäinen rivi lihavoituna) ja kaksi riviä, tyhjät rivit tiivistetty. Ei kuittausympyrää eikä Avoimet/Kuitatut-jakoa: Muistiossa `Muistiinpanot | Toistuvat`, kaikki arkistoimattomat samassa listassa. Arkisto ja Roskakori listan lopussa pieninä nappeina (`noteMore`).
  - Kuka kirjoitti: kortin vasemmassa reunassa raita (`::before`): oma ei raitaa, yhdessä sininen `--srcy`, tekoäly ja tekoälylle violetti `--srcai`. Sama raita kalenterin riveissä, aikajanan laatikoissa ja koko päivän merkinnöissä (`srcCls`). Selite: värit henkilö-napin valikossa. Tunnistetekstit kortissa vain ruudunlukijalle.
  - Kalenteri: kuittausympyrä merkinnän vasemmalla (viikkolista `.wck`, aikajana `.evck`, koko päivä `.uline`), `calOk` kääntää päivän kerran (`pts`) ja päivittää paikallaan; kuitattu ei himmene eikä yliviivaudu, ympyrä vihreä väkänen. Muistiinpanossa kuitattu päivä vihreällä alleviivauksella ja vaalealla taustalla (ei yliviivausta), Ajankohdat-kohdassa vihreä väkänen ilman nappia.
  - Muistiinpanoikkuna: Kuittaa, Arkistoi ja Poista sekä päivä- ja aikarivi `⋯`-napin takana (puhelimella ikkunan alapalkissa i:n vieressä, tietokoneella otsikkorivillä). Valikko on ikkunan sisällä (`#ns-menu`), ulkopuolinen napautus sulkee. Päivärivi näkyy itsestään, kun muistiinpanolla on päivä tai aika; muuten valikosta Päivä ja aika. Kalenterista avatussa valikossa OK / Kumoa kuittaus.
  - Tekstikoko: Valikko → asetukset → Tekstin koko (`cfg.tz`: Laitteen mukaan / Pieni / Normaali / Iso / Isompi). Laitteen mukaan = iPhonen Asetukset → Näyttö → Tekstin koko, luettu Safarin `-apple-system-body`-tyylistä (17 px = 1), muualla 1; luetaan uudelleen, kun appi tulee esiin. Kerroin `--tz` koskee korttien tekstiä, muistiinpanon tekstiä (kenttä vähintään 16 px) ja kalenterin viikkolistaa; muu appi kiinteillä koilla.
  - Testi `selain_06.py`. Tallennusmuoto ei muuttunut (uusi asetusavain `tz` vain laitteella).
- **0.6.1 (22.11.2026, Emilin bugiraportti):** tietokoneella ei päässyt GitHub-vaultiin, koska se oli vain Valikossa (Valikko-nappi on vain puhelimen alapalkissa). Nyt tietokoneen yläpalkissa on pilvinappi `#ghbtn` (punainen piste kuten Valikossa, kun jotain odottaa tai yhteydessä on virhe). Yhteys tehdään kerran jokaisessa selaimessa (repo ja avain selaimen muistiin). Testi `selain_0601.py` (1440, 1280, 390 px).
- **0.7 (22.11.2026, Emil: suositeltu ensimmäinen vaihe): Kojelauta.** Uusi osio Kalenterin perään (`ROLL0`, sivupalkissa tietokoneella). Lukee vaultin `data/mittarit.json` ja sen nimeämät `data/*.csv` (haku toi ne jo välimuistiin) vaultin ohjeen `ohjeet/data.md` mukaan: asteikko = pisteet ja 7 päivän keskiarvo, valinta = viiva (arvo nimellä), luku = viiva yksikön kanssa, kylla-ei = kertoja viikossa pylväinä. Sarakkeet `kaytossa: false` ja `kuvaaja: false` ohitetaan. Kortissa viimeisin arvo ja päivä; osoitus tai napautus kuvaajaan näyttää päivän arvon. Aikaväli 30 pv / 3 kk / Vuosi / Kaikki (`kaikki:dashr`, puhelimella alapalkissa, tietokoneella tahmea rivi ylhäällä). Tietokoneella kortit ruudukossa (min 360 px), puhelimella allekkain. Omat SVG-kuvaajat (`renderDash`, `dashCard`), ei kirjastoja; vain luku, mitään ei kirjoiteta. Ilman vaultia tai mittareita lyhyt viesti. Testi `selain_07.py` (390, 320, 1440, 1280 px).
- **0.8 (22.11.2026, suunnitelman kohta 3): koko vault ZIP-tiedostona.** Vienti ja tuonti → Koko vault (ZIP), näkyy kun vault on käytössä. Aina sama nimi `Kaikki-vault.zip` (uusi korvaa vanhan Tiedostoissa). Sisältö: kaikki välimuistin vaultin tekstitiedostot (`.md`, `.csv`, `.json` alle 400 kt, myös `ohjeet/`, `arkisto/`, `data/`, piilotetut) + lähtemättömät omat muutokset uusimpana; `VARMUUSKOPIO.txt` (repo, aika, määrä). Oma ZIP-kirjoittaja (`zipMake`, stored, CRC-32, UTF-8-nimet). Puhelimella jakovalikko, tietokoneen Chromessa/Edgessä tallennusikkuna (vanhan voi korvata), muuten lataus. Testi `selain_08.py` (ZIP avataan Pythonilla).
- **0.9 (22.11.2026, suunnitelman kohta 1): muistiinpanoikkunassa tila tekstille.** Tekstikenttä aina reunoin ja täyttää ikkunan (puhelimella ruudun korkeudelta, tietokoneella ikkuna 880 px leveä, kenttä 64vh). Ylärivillä yksi siru (`#ns-when`, `nsWhen`): seuraava ajankohta (kuitattuna väkänen, useampi +N), muuten Tiedot (asiasanat) tai + Päivä. Siru avaa pienen ikkunan (`#ns-datepop`): päivä- ja aikarivi sekä Ajankohdat ja asiasanat (siirretty tekstin alta). Luotu ja muokattu ⋯-valikon ylärivillä, vihje ”napauta tekstiä muokataksesi” pois. Esc sulkee ensin pikkuikkunan. Valinnan ”Liitä asiasanaan”, päällekkäisyysilmoitus ja kalenterin kohdan kiinnitys jäivät tekstin alle (näkyvät vain tilanteen mukaan). Testi `selain_09.py`, `selain_06.py` päivitetty.
- **0.10 (22.11.2026, suunnitelman kohta 2): muistiinpanot riveinä ja sarakkeina.** Kortit / Rivit -nappi (`#nviewbtn`; tietokoneella yläpalkissa, puhelimella alapalkissa Kaikki/Toistuvat-valinnan vieressä), laitekohtainen `kaikki:nmode` (oletus Rivit ≥ 1000 px, muuten Kortit). Oletusnäkymä Kaikki muistiinpanot: otsikko, kansio, kuka kirjoitti, luotu, seuraava ajankohta. Vaultin näkymätiedostot `nakymat/*.md` (`tyyppi: nakyma`; `mista`, `jarjestys`, `sarakkeet: - kenttä | laji | asetus`; lajit teksti, siru, pvm, luku, palkki, kylla-ei) näkyvät Näkymä-valinnassa (`kaikki:nview`); muoto vaultin `ohjeet/appi.md`:ssä. Appilinjan taulukkomalli: otsikkosarake ja otsikkorivi jäädytettyinä, sarakkeet vierivät sivuttain, rivi 42 px, kuka kirjoitti -raita otsikkosarakkeessa. Haku, asiasanat, henkilö-suodatin ja Muistion järjestys toimivat kuten korteissa (näkymän `jarjestys` ohittaa). Muistiinpanot/Toistuvat puhelimella lyhyesti Kaikki/Toistuvat. Vain luku. Testi `selain_10.py`.
- **Mikä menee GitHubiin:** vain ensimmäisen projektin muistiinpanot (myös niiden kuittaukset ja kalenteriajat). Asetukset, ulkoasu, asiasanat, Listat, Flow, puut, Toistuvat-välilehden toistuvat, tarkistuslistat ja muut projektit ovat vain laitteella (`kaikki:v1`); varmuuskopio niistä Juuren viennillä.

**Suunta (Emil 22.11.2026):** Kaikki eriytyy Juuresta: Juuren ominaisuuksia karsitaan, painopiste siirtyy tietokoneelle (tiedon käsittely, rivinäkymät, taulukot, kojelauta). Puhelinnäkymä riisutaan: keskeistä kalenteri, uuden muistiinpanon lisäys ja osa kuvaajista; toiminnot voivat säilyä, mutta näkymä kevenee. Pitkä projekti; mahdollinen tie ulos Notionista.

**Tarkka toteutussuunnitelma kohdille 1–4 (mille tahansa tekoälylle): `kaikki/SUUNNITELMA.md`.**

## Kerätyt toiveet (ei vielä toteutettu, Emil 22.11.2026: kerätään muutama ja toteutetaan yhdessä)

1. ~~**Muistiinpanoikkuna: teksti pääosaan**~~ tehty 0.9. **Muistiinpanoikkuna: teksti pääosaan, metatieto yhteen pieneen paikkaan.** Emilin kuva koneelta: tekstikentän rajat näkyvät vain aktiivisena, kenttä on pieni, ja luotu/muokattu-rivi, ”napauta tekstiä muokataksesi”, päivä- ja aikarivi sekä Ajankohdat vievät suurimman osan tilasta hajallaan ympäri ikkunaa. Puhelimella ongelma luultavasti korostuu.
   Ehdotus (tekoäly, ei vielä hyväksytty):
   - Tekstikenttä aina näkyvin, selkein reunoin ja täyttää kaiken vapaan korkeuden; tietokoneella ikkuna isompi (n. 860 px leveä, lähes koko korkeus).
   - Tekstin yläpuolelle yksi pieni rivi: ajankohta siruna (esim. ”su 22.11. klo 16–18”, kuitattuna vihreä väkänen; monta ajankohtaa ”+2”). Napautus avaa pienen ikkunan, jossa ajankohdat, päivän ja kellonajan muokkaus (nykyinen päivärivi) sekä Päivät.
   - Luotu ja muokattu ⋯-valikon yläriville pienellä tekstillä. Vihje ”napauta tekstiä muokataksesi” pois (appilinja: ei ohjeita näkymässä).
   - Löydetyt asiasanat, linkit ja päällekkäisyydet samaan pieneen rivin perään yhtenä ”Tiedot”-siruna tai ⋯-valikkoon, ei omina laatikoinaan tekstin alla.
   - Kaikki metatieto samassa kohdassa (tekstin yläpuolella), ei osa keskellä ja osa reunoilla.

2. ~~**Muistiinpanot riveinä ja sarakkeina**~~ tehty 0.10 (perusversio). **Muistiinpanot riveinä ja sarakkeina (tietokone ensin), Emil 22.11.2026.** Notionin tietokannan hyvä puoli ilman sen kömpelyyksiä: muistiinpanot allekkain riveinä, otsikko vasemmalla (jäädytetty), muutama sarake. Sarakkeet täyttyvät muistiinpanon omasta tiedosta, kun se on oikeassa muodossa; sarakkeella oma näyttötapa (teksti, siru, päivä, palkki min–max, minigraafi, väkänen). Määritellyt näkymät.
   Ehdotus (tekoäly): sarakkeet = muistiinpanon alkutiedot (`tyyppi`, `lahde`, `luotu`, `tagit` ja uudet omat kentät, esim. `tila: kesken`, `arvio: 7`, `edistys: 40`). Näkymä on oma tiedosto vaultissa (esim. `nakymat/<nimi>.md`: mitkä muistiinpanot, mitkä sarakkeet, millä näyttötavalla), jotta tekoäly voi tehdä ja täyttää niitä. Näyttötavat yhteiset tulevan taulukko/kojelauta-idean (D) kanssa: yksi toteutus, monta käyttöä. Vaatii vaultin ohjeisiin päätöksen kenttien nimistä.
3. ~~**Koko vault varmuuskopioksi**~~ tehty 0.8. **Koko vault varmuuskopioksi (ehdotus, tekoäly).** Nykyinen Vienti (`Kaikki.json`) sisältää apin tiedot ja näkyvien muistiinpanojen tekstit, mutta ei koko vaultia (ei `ohjeet/`, `arkisto/`, `data/`, piilotettuja). Appilla on kaikki vaultin tekstitiedostot jo välimuistissa, joten se voi tehdä yhden ZIP-tiedoston, jossa vaultin kansiot ja `.md`/`.csv`/`.json`-tiedostot sellaisinaan (avautuu millä tahansa koneella). Valikko → Vienti ja tuonti → ”Koko vault (ZIP)”. Sama onnistuu jo nyt GitHubin sivulta: Code → Download ZIP.

4. **Huoltopyynnöt tekoälylle ja tekoälyn tiedostot taka-alalle (Emil 22.11.2026).** Ei säännöllistä laajaa huoltoa (käyttörajat), vaan Emil pyytää napista. *Ehdotus (tekoäly):*
   - Apissa nappi (Valikko ja muistiinpanon ⋯): ”Pyydä tekoälyä järjestämään” → rivi vaultin tiedostoon `yllapito/pyynnot.md` (`- [ ] pvm · mitä · kohde`), esim. koko inbox, koko vault tai tämä muistiinpano. Emil voi muokata ja poistaa pyyntöjä apissa.
   - Vaultin ohjeeseen: tekoäly lukee pyynnöt aloittaessa (kuten lokin), kertoo yhdellä rivillä ”pyyntöjä odottaa N”, ja tekee ne vain, kun Emil sanoo tai kun keskustelu on huoltokeskustelu; pieni malli ei tee isoja. Nykyinen ”työn lopuksi yksi erääntynyt tehtävä” -sääntö vaihdetaan pyyntöpohjaiseksi, jos Emil haluaa.
   - Emilin tekstin jäsentely (pilkkominen muistiinpanoiksi, linkit, kuvaus, tunnisteet): nyt sääntö sallii alkutiedot, linkit ja kansion, ei tekstin muutosta. *Ehdotus:* pyynnöllä saa myös jäsentää, alkuperäinen siirtyy `arkisto/`:on, joten mitään ei katoa.
   - Tekoälyn omat tiedostot (ohjeet, loki, pyynnöt, `nakyy: ei`) omaan Valikon kohtaan ”Tekoälylle”, ei henkilö-suodattimen taakse.
   - Vaatii päätöksen vaultin ohjeisiin (`ohjeet/yllapito.md`, `ohjeet/paatokset.md`).

### Isommat ideat (Emil 22.11.2026: ”onko mahdollista?”, ei toteutuslistalla)

Kaikki alla on tekoälyn arvion mukaan mahdollista ilman ulkoisia kirjastoja. Ehdotettu järjestys: A → B → C → D.
- **Osiot laitekohtaisesti päälle/pois** (esim. kojelauta vain koneella). Helppo: asetukset ovat jo laitekohtaisia. *Ehdotus:* oletus leveyden mukaan, asetuksista voi muuttaa.
- **A. Kojelauta ja graafit (tehty 0.7, perusversio):** vaultin `data/*.csv` + `data/mittarit.json` → omat SVG-kuvaajat; leveällä näytöllä ruudukko. (Sama kuin Seuraava askel 1.)
- **B. Flow / päätöspuut tekstinä vaultiin:** *ehdotus* oma kansio (esim. `flow/`), `tyyppi: flow`, runko sisennettynä luettelona (kysymys → vastaukset → seuraava askel), jonka ihminen, tekoäly ja Kaikki lukevat sellaisenaan ja Kaikki piirtää Flow'ksi. Pohjana Juuren nykyinen ”projekti tekstinä” -muoto ja sen tekoälyohje. Vaatii vaultin ohjeisiin päätöksen (`ohjeet/paatokset.md`, `ohjeet/appi.md`).
- **C. Laskentataulukko vaultiin:** *ehdotus* `.md`-tiedosto (`tyyppi: taulukko`), jossa tavallinen markdown-taulukko; kaavasolut alkavat `=` (esim. `=SUMMA(B2:B8)`, viittaukset A1-muodossa). Tekoäly lukee sen, appi laskee, vienti CSV:nä muualle. Oma rajattu kaavakieli (perusmatikka, SUMMA, KESKIARVO, MIN, MAX, JOS, viittaukset); Kytköskartan kaavamoottorista voi lainata. Ei täyttä Excelia.
- **D. Taulukko ja kojelauta samaksi asiaksi (Emil 22.11.2026):** yksi taulukkotiedosto, jossa kaksi puolta kuten Kytköskartassa ja Appi-appissa: **logiikka** = solut ja kaavat (laskentataulukkona), **näkymä** = vapaasti sijoiteltavat ja raahaamalla koon muuttavat kortit, joista jokainen näyttää solun tai alueen valitulla tavalla (teksti, luku, palkki min–max, liukusäädin, kytkin, nappi, kuvaaja, kuva) omalla tyylillään. Säädin ja kytkin kirjoittavat arvon syöttösoluun, ja kaavat laskevat. Muokkaustila ja lukittu käyttötila (työnhallintatyökaluna ilman vahinkomuokkauksia), solukohtainen lukitus. Emil: Google Sheetsin yksinkertaisuus, Numbersin vapaa sijoittelu, Notionin tapa näyttää arvo muutenkin kuin tekstinä; ei täyttä Exceliä eikä Sheetsiä. Kaavat: peruslaskut, haku, yhdistely, JOS, myöhemmin tilastot (esim. korrelaatio). Tiedostossa myös näkymä luettavana tekstinä, jotta tekoäly voi kirjoittaa tietoja suoraan Emilin taulukkoihin. Ulkoasuasetukset kuvaajiin ja kortteihin (ei tylsintä mahdollista). Suunnitellaan erikseen.
- **E. Laskenta muistiinpanojen välillä (Emil 22.11.2026):** kokoava muistiinpano toimii kuin summasolu: laskee arvoja muista muistiinpanoista ehdoilla, ja tulos näkyy muistiinpanossa ja rivinäkymän (toive 2) sarakkeessa valitulla näyttötavalla. *Ehdotus:* arvot ovat muistiinpanojen alkutietokenttiä (esim. `hinta: 120`), kaava kokoavan muistiinpanon kentässä, esim. `yhteensa: =SUMMA(hinta; kansio = projektit/remontti; tila = maksettu)` tai yksittäinen viittaus `=[[remontti-budjetti]].budjetti - yhteensa`. Funktiot kuten taulukossa (SUMMA, KESKIARVO, MÄÄRÄ, MIN, MAX, JOS…). Tiedostoon jää kaava, appi laskee tuloksen aina tuoreena (ei kirjoita tuloksia GitHubiin: ei turhia muutoksia eikä ristiriitoja; tekoäly lukee kaavan ja osaa laskea itse). Kehäviittaus näytetään virheenä. Sama kaavamoottori kuin taulukossa (C), joten tehdään sen kanssa; edellyttää kenttien nimisopimusta (toive 2).
- **Listat ja Asiat suhteessa vaultiin:** auki (Emil ei vielä hahmota). *Ehdotus pohdittavaksi:* Asiat ↔ vaultin `tagit`, Listat ↔ `- [ ]`-tehtävärivit tai `projektit/`.

## Ei tarkistettu

- 0.6: Applen tekstikoko (`-apple-system-body`) kotinäytön kirjanmerkissä ja eri tekstikoilla; sormella kuittausympyrä, ⋯-valikko ja aikajanan pieni ympyrä (lyhyissä merkinnöissä ahdas). Nopeus mitattu vain tietokoneen hidastetulla selaimella.
- 0.6: Juuren omien monitekstisten muistiinpanojen (`---`-erotin) tekstikohtainen kuittaus ei enää näy Muistiossa; kalenterista kuittaus toimii päivittäin.

- Oikealla iPhonella ja oikeaa GitHubia vasten ei kokeiltu (testit tietokoneen Chromiumissa ja testirepolla).
- Iso vault: välimuisti on localStoragessa (raja n. 5 Mt). Riittää tuhansille tekstimuistiinpanoille; jos raja tulee vastaan, siirto IndexedDB:hen.
- Muut kuin ensimmäinen projekti pysyvät vain laitteella.
- 0.3: minuutin automaattihaku ja päivitysnappi kokeiltu vain testirepolla; oikealla iPhonella ei kokeiltu, eikä sitä, miten Safari ajastaa haun taustalla.
- Modern Web Guidance -hakua ei voitu ajaa (komento estettiin tässä istunnossa); uutta käyttöliittymää on vain asetusikkuna, Juuren tyyleillä.

## Seuraava askel

Emil kokeilee GitHub-yhteyttä tietokoneella (pilvinappi yläpalkissa, vain omalla koneella). Sen jälkeen suunnitellaan tietokoneasettelu (ehdotus: lista ja auki oleva muistiinpano rinnakkain, isompi kirjoitusalue, pikanäppäimet, kansiot tai asiasanat sivupalkkiin).


Emil kokeilee: avain asetuksiin, muistiinpanoja apissa ja tekoälyn kautta, kalenteri. Sen jälkeen suunnitelman mukaan (Emil 22.11.2026):
1. ~~Kojelauta~~ tehty 0.7 (vain katselu). Jatkossa: ulkoasuasetukset kuvaajiin, osiot laitekohtaisesti päälle/pois.
2. Helppo kirjaus eri asioihin (päivän mittarit palikoina).
3. Päätöspuut vaultiin tekstinä, jotta Emil voi kuvailla ja tekoäly kirjoittaa puun valmiiksi.
4. Karsinta: mitä Juuren osia Kaikki ei tarvitse.

## Avoimet kysymykset

- Tekstikoko koskee nyt vain muistiinpanoja ja kalenterin listaa. Laajennetaanko koko appiin (iso työ: kiinteät px-koot suhteellisiksi)?
- Testissä vaultin aineistolla Muistioon syntyi vanhoista toistuvista ajankohdista Juuren järjestelmäilmoituksia (”Järjestelmäilmoitus: toistuvuus päättyi”, vain laitteella). Näkyykö niitä Emilillä, ja karsitaanko ne Kaikki-appista?

- Mitkä Juuren osiot Kaikki pitää (Muistio ja Kalenteri varmasti; Listat, Flow, Asiat?).
- Suodatin on nyt vain Muistiossa (vaikuttaa silti kalenteriin). Tarvitaanko se myös kalenterin näkymään omana nappinaan?
- Pitäisikö Kaikki-appissa näkyä vaultin kansiot (esim. suodatus kansion mukaan), vai riittääkö Juuren haku ja asiasanat?

## Emilin kommentit
