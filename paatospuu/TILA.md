# Päätöspuu: tila

**Vaihe:** versio 1.14 (suunnitelman vaihe 4), odottaa Emilin kuittausta · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/paatospuu/ · **Päivitetty:** 21.10.2026

Kevyt päätöspuu-appi puhelimelle: sisältö tuodaan tekstinä, järjestys opetetaan napauttamalla, jokainen kierros tallentuu aikaleimattuna muistiinpanoksi. Päätöskartan yksinkertaisempi sisarappi (Emilin toive Päätöskartan TILA:ssa), oma tallennusmuoto.

## Valmiina (versio 1, 20.10.2026)

- **Projektit** = päätöspuut, vaihto yläpalkin nimestä.
- **Tekstikenttä** per projekti, rivi per asia: `Koira` nappula, `#Nimi: selitys` ryhmä (ei näy käytössä), `>Nimi: teksti` ilmoitus (vain teksti näkyy), ` // ` tekstin sisällä = kappaleenvaihto, `//`-rivi ohitetaan. Järjestyksellä ei väliä.
- **Opetus / Rakenna:** napautus kerran = mitä tuo näkyviin, toinen = mitä sulkee pois (yläpalkki punainen), kolmas = valmis. Alku-rivi kertoo alun vaihtoehdot (opettamattomana: kaikki, joita mikään ei tuo). Ryhmä opetetaan samoin: se avaa jäsenensä ja voi avata tai sulkea pois toisen ryhmän (poissulku sulkee myös jäsenet).
- **Opetus / Muokkaa:** rivin muokkaus ja poisto; nimen vaihto siirtää säännöt. **Toisensa poissulkevat:** ryhmittelyt, jotka harmaannuttavat saman askeleen muut.
- **Käyttö (kierros):** valinta tuo näkyviin vain siihen suoraan liitetyt. Valinnat ja poissulut muistuvat kierroksen ajan; uudelleen tuleva vaihtoehto on valmiiksi valittuna, ja sen purku vapauttaa poissulut. Saman askeleen ristiriidat harmaina. Jatka, Peru askel, Lopeta. Ilmoitukset kertyvät ruutuun kerran, erottimin.
- **Lopetus** → muistiinpano: projektin nimi, valinnat, ilmoitukset, lisähuomio, valinnainen päivämäärä, aikaleima suomalaisessa muodossa.
- **Muistiinpanot:** vapaa kirjoitus, järjestys ”Seuraavaksi tulevat” tai ”Uusimmat”, suodatus termillä. Monen päivän muistiinpano siirtyy seuraavaan päivään, kun edellinen on mennyt.
- **Termit:** nimi + tunnistavat sanat + poissulkevat sanat, sana tunnistetaan alusta (”eläi” löytää eläimen). Poissulku voittaa.
- **Päivät tekstistä:** 24.10.26, 24.10.2026, 24.10. (seuraava), tänään, huomenna, ylihuomenna, viikonpäivät (sama päivä = tänään), ensi viikolla, tällä viikolla, tässä/ensi kuussa, ”kahden viikon sisällä” (väli), ”3 päivän päästä”. Pohjana muistiinpanon **luontihetki**.
- **Asetukset:** Appipaja 2.0 -teemat, vaalea/tumma/laite. Tiedot vain laitteella; vienti tiedostona tai tekstinä ja tuonti samoin (`{app:'paatospuu', ver:1, …}`).
- Testit `sh paatospuu/testit/aja.sh`: 50 logiikkatarkistusta + selainpolku 390 ja 320 px tietokoneen Chromiumissa.

## Versio 1.1 (20.10.2026, Emilin pyyntö)

- Muistiinpanoissa kiinteä alapalkki: pieni + Uusi, järjestys (Tulevat / Uusimmat), Termit. Ei liiku vierityksen mukana.
- Kierroksen muistiinpanoon myös rivi *Ryhmät:* (kaikki kierroksen aikana aktivoituneet ryhmät). Valinnat ja ilmoitukset olivat jo mukana.

## Versio 1.2 (21.10.2026, Emilin pyyntö)

- Jokainen päätöspuun nappula, ryhmä ja ilmoitus (nimellinen; nimetön yli 40 merkin ilmoitus ei) on automaattisesti termi, johon voi liittää tunnistavia ja poissulkevia sanoja. Kaikista projekteista, sama nimi kerran; samanniminen oma termi korvaa. Sanat tallennusmuodossa kentässä `termisanat` (nimi pienillä → {yes,no}).
- Muistiinpanot ja termit ovat yhteisiä kaikille päätöspuille (oli jo näin; Emil vahvisti). Ylempää, erottavaa tasoa ei ole.
- Termisuodattimissa näkyvät omat termit aina ja automaattiset vain, jos ne osuvat johonkin muistiinpanoon.

## Versio 1.3 (21.10.2026, Emilin pyyntö)

- Kierroksen alussa valinnainen päivä. Jos päivä valitaan, sen päivän muistiinpanot (tarkka päivä tai väli, joka sisältää päivän) haetaan: niiden termit, jotka ovat tämän puun rivejä, tulevat mukaan valmiiksi. Nappulat ja ryhmät alkuaskeleen valinnoiksi (avaavat ja sulkevat pois kuten valinta, näkyvät valmiiksi valittuina), ilmoitukset ruutuun. Esikatselu kertoo määrät ennen aloitusta.
- Sama päivä on valmiina lopetuksen päivämääräkentässä, ja muistiinpanoon tulee rivit *Päivä:* ja *Päivän muistiinpanoista:*. Ilman päivää kaikki toimii kuten ennen.
- Ilmoitus tunnistuu termiksi myös tekstinsä ensimmäisestä kappaleesta (kierroksen muistiinpanossa on teksti, ei nimeä).

## Versio 1.4 (21.10.2026, Emilin pyyntö)

- Päiväväli 1.7.26–3.8.26 (myös ilman vuotta, myös vuodenvaihteen yli) = sama muistiinpano jokaisena välin päivänä. Emil vahvisti, että välit lasketaan päivän muistiinpanoihin.
- Asetus *Nappuloiden koko: Normaali / Pieni*. Pienet asettuvat vierekkäin ja vievät tarvitsemansa leveyden. Tavuviiva nappulan nimessä vaihtaa riviä saman nappulan sisällä (tavuviiva jää näkyviin); muuten niin monta riviä kuin tarvitaan.
- Opetus / Muokkaa: nuolet ↑↓ vaihtavat järjestystä (siirtää rivejä tekstikentässä).
- Uusi tyyppi **apukysymys** `?Nimi: kysymys`: opetetaan kuten ilmoitus (valinta tuo sen näkyviin), näkyy pienenä, matalan kontrastin tekstinä kiinteästi ylhäällä ilman paneelirajaa vain sen askeleen ajan; monta allekkain. Ei lokiin, ei muistiinpanoon, ei termi.
- Kalenterinäkymä: ehdotus `paatospuu/SUUNNITELMA-kalenteri.md`, odottaa Emilin hyväksyntää.

## Versio 1.5 (21.10.2026, Emilin pyyntö): ajankohtien tulkinta

- Emil vahvisti: päiväväli = jokainen välin päivä (toistuu, ei kopioita).
- Tunnistetaan: 1.7.26, 1.7.2026, 1.7., 010726, välit (1.7.26–3.8.26, myös välilyönnein), 2/27 (koko kuu), Vk42 (vain yhteen kirjoitettuna), klo13-16 / klo 13.30-16 / kello 13.16, viikonpäivät (perjantai, perjantaina = seuraava), tiistaisin ja joka tiistai (joka viikko), joka toinen/kolmas/neljäs tiistai, kuun viimeinen viikko (viimeinen täysi ma–su-viikko, joka kuu), kuun viimeiset 3pv (joka kuu), tänään/huomenna/ylihuomenna, ensi/tällä viikolla, tässä/ensi kuussa, N päivän/viikon sisällä/päästä.
- **Yhdistäminen (Emilin sääntö):** välilyönnillä peräkkäin kirjoitetut tunnistetut osat ovat yksi ajankohta ja tarkentavat toisiaan missä järjestyksessä tahansa (vk43 perjantai klo13-16 = 23.10. klo 13–16). Tunnistamaton sana, rivinvaihto tai välimerkki (pilkku ym.) sanan perässä katkaisee; erillään olevat ovat eri ajankohtia. Jos samaa osaa tulee toinen (kaksi päivämäärää, kaksi kellonaikaa), alkaa uusi ajankohta. Pelkkä kellonaika = pohjapäivä.
- Muistiinpanon kirjoitusikkunassa tunnistettu ajankohta korostuu (täyttö + alleviivaus) heti, kun sen perään tulee välilyönti tai rivinvaihto; jatkokirjoitus liittää uudet osat samaan korostukseen. Alla lista *Ajankohdat: teksti → tulkinta*. Muistiinpanoon jää Emilin oma kirjoitusmuoto.
- Toistuvat ajankohdat: järjestys ”Tulevat” käyttää seuraavaa esiintymää; päivän muistiinpanoihin (kierros päivälle) lasketaan jokainen esiintymä. Kellonaika näkyy kortissa; kalenteri käyttää sitä myöhemmin.

## Versio 1.6 (21.10.2026, Emilin pyyntö): zoomaus, yläreuna, vain Valmis

- Zoomaus estetty: viewport (maximum-scale=1, user-scalable=no), `touch-action: manipulation` (ei kaksoisnapautuszoomia), nipistyseleen esto ja tekstikentät vähintään 16 px (Safari ei zoomaa kenttään).
- Kotinäytöltä avattuna yläpalkissa 30 px (~0,8 cm) lisätilaa Dynamic Islandin sumennuksen alle. Selaimessa ennallaan.
- Muokkausikkunoissa (tekstirivi, uusi rivi, muistiinpano, termi) vain *Valmis*. Ikkunan ulkopuolelle napautus tallentaa samoin. Tyhjäksi jätetty = poistuu. Poista-, Peru- ja Kopioi-napit pois.
- Peru askel ja Lopeta ennallaan (Lopeta toimii joka askeleella).

## Versio 1.7 (21.10.2026, Emilin toive)

- Projektin ikkunassa (yläpalkin nimi) nappi *Kopioi puu*: kopioon teksti, säännöt ja toisensa poissulkevat, ei keskeneräistä kierrosta. Kopio avautuu nimellä ”Nimi (kopio)”.

## Versio 1.8 (21.10.2026, Emilin toive): termisanojen säännöt, sanahaku

- Termin sanat: yksi sana tai lause riville (pilkku ei enää erota). Isot kirjaimet ja välimerkit eivät vaikuta vertailuun (pysyvät muistiinpanossa). Sana tunnistuu kokonaisena; tavuviiva lopussa = osa riittää, myös sanan keskeltä (”eläi-” löytää kotieläimet). Tavuviiva muualla on tavallinen merkki.
- *Korvattu 1.11:ssä (sana löytyy osana mistä kohdasta tahansa).* **Muutos aiempaan:** ennen sana tunnistui alusta (”eläi” löysi eläimen). Nyt taivutukset tarvitsevat tavuviivan. Myös palikoiden nimet tunnistuvat vain kokonaisina.
- Muistiinpanoissa hakukenttä *Hae sanalla* termien yläpuolella: osa sanaa riittää. Toimii yhdessä termisuodattimen kanssa.

## Versio 1.9 (21.10.2026, Emilin toive): värit tekstikentässä

- Puun tekstikentässä rivi värittyy heti, kun se on tulkittu: nappula tavallisella värillä, ryhmä violetti, ilmoitus vihreä, apukysymys oranssinruskea, `//`-rivi harmaa, jo käytössä oleva nimi punainen aaltoviivalla. Kirjoitettava rivi värittyy vasta, kun kursorin edessä on välilyönti tai kun siirryt muualle. Ohjeen esimerkit ovat samoissa väreissä.
- Tekniikka: värikerros tekstikentän alla (sama kuin ajankohtien korostus), tekstikentän oma teksti läpinäkyvä. Termilohkoille (`=`) varattu väri tulee, kun ne rakennetaan.

## Versio 1.10 (21.10.2026, Emilin toive): ehdot eli taaksepäin opetus

- Rakenna-tilassa napautuskierto: 1. tuo näkyviin, 2. sulkee pois, 3. **ehdot** (yläpalkki turkoosi), 4. valmis. Ilmoitus ja apukysymys menevät ensimmäisellä napautuksella suoraan ehtoihin.
- Ehdoissa valitaan yläpuolelta *Yksi riittää* tai *Kaikki tarvitaan* ja napautetaan syyt. Yksi riittää = tavallinen avaa-sääntö toisesta päästä (syinä nappulat, ryhmät ja Alku). Kaikki tarvitaan = uusi `need`-sääntö (syinä nappulat): seuraus tulee askeleessa, jossa viimeinenkin syy valitaan; koko kierroksen valinnat lasketaan. Poissulku voittaa. Tilan vaihto siirtää syyt muodosta toiseen.
- Tallennus: projektiin `need:{seuraus:[syyt]}` (vanha muoto luetaan ennallaan, kenttä puuttuu = ei ehtoja). Nimen vaihto, poisto, kopiointi ja ”säännöt ilman riviä” huomioivat ehdot.
- Ei vielä: ehtojen näyttö käytössä (”miksi tämä?”), ehdon täyttyneen ryhmän näkyminen muistiinpanon Ryhmät-rivillä.

## Versio 1.11 (21.10.2026, suunnitelman vaihe 1)

- Termisana ja palikan nimi löytyvät osana mistä kohdasta sanaa tahansa (”koir” → koirien, kotikoira). Tavuviivasääntö poistui (vanha ”eläi-” toimii edelleen, viiva ohitetaan). Lyhyt nimi (esim. yksi kirjain) osuu siksi moneen sanaan.
- Muistiinpanon kirjoitusikkunassa termin laukaiseva sana alleviivataan violetilla heti, kun sana on valmis. Lista ikkunan alla: *Termit: kissalle → Kissa*.
- ma, ti, ke, to, pe, la, su tunnistuvat vain välilyönnillä kiinni muussa ajankohdan osassa (”pe klo13-16”, ”vk43 ti”), eivät yksinään.
- ”klo 14.” ja ”klo14.” lauseen lopussa tunnistuvat kellonajaksi.

## Versio 1.12 (21.10.2026, suunnitelman vaihe 2): arvojärjestys ja Hoidettavat

- Emil kuittasi vaiheen 1 ja hyväksyi suositukset: palikan nimi on termi vasta vähintään 3 kirjaimella (omat termisanat aina).
- Opetukseen tila *Järjestys*: napauta palikkaa ja sitten sitä vähemmän tärkeät (`order:{palikka:[vähemmän tärkeät]}`). Ilman sääntöä ratkaisee rivijärjestys. Alla *Tärkeysjärjestys nyt*.
- Kehän tarkistus napautushetkellä, järjestys ja kaikki tarvitaan -ehdot yhdessä: napautus hylätään, nappi värähtää ja ilmoitus näyttää ketjun (*Ei käy, tulisi kehä: A → B → A*).
- Projektin ikkunassa *Lopuksi: Polku / Hoidettavat* (`end:'hoid'`). Hoidettavat: Lopeta-ikkunassa valitsematta jääneet nappulat (ei poissuljetut) tärkeysjärjestyksessä, ylimpänä *Seuraavaksi*, ja kova ehto näkyy *jotta …*. Muistiinpanoon rivit *Kunnossa* ja *Hoidettavat*.
- Allianssiesimerkki: `/mnt/project-files/paatospuu/allianssi-esimerkki.md` (Emil korjaa).

## Versio 1.13 (21.10.2026, suunnitelman vaihe 3): muistiasetus

- Emil kuittasi vaiheen 2 ja hyväksyi oletuksen *vain seuraava askel*.
- Projektin ikkunassa *Muisti: Vain seuraava askel / Kaikki mukana* (`mem:'all'`). Kaikki mukana: jokaisen yhä voimassa olevan valinnan avaamat pysyvät tarjolla koko kierroksen, kunnes ne suljetaan pois tai niiden avaaja puretaan. Valitut näkyvät valmiiksi valittuina. Ehdot (kaikki tarvitaan) toimivat samoin molemmissa.

## Versio 1.14 (21.10.2026, suunnitelman vaihe 4): termilohkot ja Liitä termiin

- Emil kuittasi vaiheen 3 ja hyväksyi suositukset (Liitä termiin kirjoittaa termin ikkunaan; tuntematon lohkon nimi luo uuden termin).
- Puun tekstissä termilohko: `=Nimi:` ja sanat seuraavilta riveiltä (myös samalla rivillä kaksoispisteen jälkeen), `!` alussa poissulkeva, tyhjä rivi päättää. Lohkon rivit eivät ole palikoita. Saman nimen lohkot (myös eri puissa) lasketaan yhteen. Nimi osuu palikkaan, omaan termiin tai luo uuden termin (laji *tekstilohko*). Termin ikkunassa näkyy *Puun tekstistä: …* (muokataan tekstissä).
- Tekstikentässä lohkon otsikko turkoosi lihavoitu, sanarivit taustasävyllä ja ↵ lopussa, poissulkeva punainen, lohkon loppuun viiva. `//`-rivi lihavoitu väliotsikko.
- Muistiinpanossa tekstiä valitessa kentän alle tulee *Liitä ”…” termiin*: sanaa voi lyhentää, sitten napautetaan termiä tai luodaan uusi. Sana tallentuu termin ikkunan sanoihin.

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu: tekstin valinta ja Liitä termiin -nappi (iOS:n oma valintavalikko), tekstikentän värikerroksen kohdistus Safarissa (kursori, valinta, vieritys), zoomauksen esto ja yläreunan lisätila (näkyy vain kotinäytön appina), jakoikkunan tiedostovienti, päivämäärävalitsin, näppäimistö alapalkin kanssa, tekstikentän koko.
- Säännöt ovat nimissä: jos nimen vaihtaa suoraan tekstikentässä, säännöt eivät seuraa (Opetus näyttää ”Säännöt ilman riviä”). Muokkaa-tilassa vaihto seuraa.

## Seuraavaksi

- Arvio ja jatkokehitys 21.10.2026 (Claude Doc): https://claude.ai/artifact/UXJ416PaGLHh7mwufxmuaH. Suositus: iPhone-kokeilu, sitten näkyvyys (miksi tämä, termiosumat, nimen vaihto tekstikentässä, varmuuskopion muistutus), termilohkot, JA-ehdot, esiin nousevat apukysymykset.

- Emil kokeilee puhelimella. Mahdolliset seuraavat: säännöt myös tekstimuodossa (koko puu tekoälyllä), ilmoitusten kumoutuminen myöhemmin, termien opetus napauttamalla.

## Avoimet kysymykset

- Emil hyväksyi 21.10.2026 kaikki suositukset dokumentista *Päätöspuu: avoimet kysymykset* (https://claude.ai/artifact/RFMnrpTAm7fb7r9prDPz8q). Toteutus etenee vaihe kerrallaan: `SUUNNITELMA-vaiheet.md` (pelisäännöt, vaiheiden tila ja kunkin vaiheen kysymykset). Seuraavaan vaiheeseen vasta Emilin kuittauksen ja vastausten jälkeen.
- Ratkaistu: suhteellisten päivien pohja on luontihetki (17), nimi ”kierros” jää (24), päivän muistiinpanoihin lasketaan välit (Emil: ”Juu!”).
- Termin opetus on kaksi tekstikenttää (tunnistavat / poissulkevat), ei napautuskierto: vaiheet 4 ja 6 tuovat lohkot tekstiin.

## Emilin kommentit

- (tyhjä)
