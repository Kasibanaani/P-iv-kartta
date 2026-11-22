# Kaikki: tila

**Vaihe:** versio 0.6 (kokeilu) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/kaikki/ · **Päivitetty:** 22.11.2026

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
- **Mikä menee GitHubiin:** vain ensimmäisen projektin muistiinpanot (myös niiden kuittaukset ja kalenteriajat). Asetukset, ulkoasu, asiasanat, Listat, Flow, puut, Toistuvat-välilehden toistuvat, tarkistuslistat ja muut projektit ovat vain laitteella (`kaikki:v1`); varmuuskopio niistä Juuren viennillä.

## Ei tarkistettu

- 0.6: Applen tekstikoko (`-apple-system-body`) kotinäytön kirjanmerkissä ja eri tekstikoilla; sormella kuittausympyrä, ⋯-valikko ja aikajanan pieni ympyrä (lyhyissä merkinnöissä ahdas). Nopeus mitattu vain tietokoneen hidastetulla selaimella.
- 0.6: Juuren omien monitekstisten muistiinpanojen (`---`-erotin) tekstikohtainen kuittaus ei enää näy Muistiossa; kalenterista kuittaus toimii päivittäin.

- Oikealla iPhonella ja oikeaa GitHubia vasten ei kokeiltu (testit tietokoneen Chromiumissa ja testirepolla).
- Iso vault: välimuisti on localStoragessa (raja n. 5 Mt). Riittää tuhansille tekstimuistiinpanoille; jos raja tulee vastaan, siirto IndexedDB:hen.
- Muut kuin ensimmäinen projekti pysyvät vain laitteella.
- 0.3: minuutin automaattihaku ja päivitysnappi kokeiltu vain testirepolla; oikealla iPhonella ei kokeiltu, eikä sitä, miten Safari ajastaa haun taustalla.
- Modern Web Guidance -hakua ei voitu ajaa (komento estettiin tässä istunnossa); uutta käyttöliittymää on vain asetusikkuna, Juuren tyyleillä.

## Seuraava askel

Emil kokeilee: avain asetuksiin, muistiinpanoja apissa ja tekoälyn kautta, kalenteri. Sen jälkeen suunnitelman mukaan (Emil 22.11.2026):
1. Kojelauta: kuvaajat vaultin `data/`-taulukoista (`data/mittarit.json` kertoo mittarit).
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
