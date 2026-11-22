# Kaikki: tila

**Vaihe:** versio 0.3 (kokeilu) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/kaikki/ · **Päivitetty:** 22.11.2026

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
- **Mikä menee GitHubiin:** vain ensimmäisen projektin muistiinpanot (myös niiden kuittaukset ja kalenteriajat). Asetukset, ulkoasu, asiasanat, Listat, Flow, puut, Toistuvat-välilehden toistuvat, tarkistuslistat ja muut projektit ovat vain laitteella (`kaikki:v1`); varmuuskopio niistä Juuren viennillä.

## Ei tarkistettu

- Oikealla iPhonella ja oikeaa GitHubia vasten ei kokeiltu (testit tietokoneen Chromiumissa ja testirepolla).
- Iso vault: välimuisti on localStoragessa (raja n. 5 Mt). Riittää tuhansille tekstimuistiinpanoille; jos raja tulee vastaan, siirto IndexedDB:hen.
- Muut kuin ensimmäinen projekti pysyvät vain laitteella.
- 0.3: minuutin automaattihaku ja päivitysnappi kokeiltu vain testirepolla; oikealla iPhonella ei kokeiltu, eikä sitä, miten Safari ajastaa haun taustalla.
- 320 px leveydellä Muistion yläpalkin Asiasanat-nappi lyhenee ("Ka…"), koska henkilö-nappi vie tilaa.
- Modern Web Guidance -hakua ei voitu ajaa (komento estettiin tässä istunnossa); uutta käyttöliittymää on vain asetusikkuna, Juuren tyyleillä.

## Seuraava askel

Emil kokeilee: avain asetuksiin, muistiinpanoja apissa ja tekoälyn kautta, kalenteri. Sen jälkeen suunnitelman mukaan (Emil 22.11.2026):
1. Kojelauta: kuvaajat vaultin `data/`-taulukoista (`data/mittarit.json` kertoo mittarit).
2. Helppo kirjaus eri asioihin (päivän mittarit palikoina).
3. Päätöspuut vaultiin tekstinä, jotta Emil voi kuvailla ja tekoäly kirjoittaa puun valmiiksi.
4. Karsinta: mitä Juuren osia Kaikki ei tarvitse.

## Avoimet kysymykset

- Mitkä Juuren osiot Kaikki pitää (Muistio ja Kalenteri varmasti; Listat, Flow, Asiat?).
- Suodatin on nyt vain Muistiossa (vaikuttaa silti kalenteriin). Tarvitaanko se myös kalenterin näkymään omana nappinaan?
- Pitäisikö Kaikki-appissa näkyä vaultin kansiot (esim. suodatus kansion mukaan), vai riittääkö Juuren haku ja asiasanat?

## Emilin kommentit
