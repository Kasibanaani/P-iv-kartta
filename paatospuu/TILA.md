# Päätöspuu: tila

**Vaihe:** versio 1.23 (vaihe 12 laukaisinmuistutukset); kaikki suunnitellut vaiheet tehty, odottaa Emilin kokeilua ja kuittausta · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/paatospuu/ · **Päivitetty:** 21.10.2026

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

## Versio 1.15 (21.10.2026, suunnitelman vaihe 5): apukysymykset nousevat esiin

- Emil kuittasi vaiheen 4 ja valitsi vastausmuodon `▸ Kysymys`.
- Puun apukysymykset (`?Nimi: Kysymys`) ovat nyt termejä: nimi ja termin ikkunan sanat tunnistavat ne muistiinpanosta. Oletuksena ne *nousevat esiin*; termin ikkunassa valinta *Ei nouse esiin / Nousee esiin muistiinpanosta* (toimii kaikille termeille).
- Muistiinpanon kentän alle tulee nappi *N apukysymystä*. Siitä aukeavat kysymyskortit: vastauskenttä ja *Kyllä*. Vastaus kirjoittuu heti tekstin loppuun muodossa `▸ Kysymys` ja vastausrivit; muutos päivittää sen ja tyhjä poistaa. Vastaus on tavallista tekstiä, joten haku ja termit näkevät sen.
- Apukysymys ei kulje kierroksen päivän yhteenvetoon termiosumana.

## Versio 1.16 (21.10.2026, suunnitelman vaihe 6): säännöt tekstissä, kaksisuuntaisesti

- Emil kuittasi vaiheen 5 ja hyväksyi suositukset (lohkomuoto, lohko paikallaan ja uudet loppuun, *Termit tekstinä* -kenttä).
- Säännöt ovat puun tekstissä lohkoina: `=Koira avaa:`, `=Koira sulkee:`, `=Koira vaatii kaikki:`, `=Koira vaatii yhden:` (jokainen rivi avaa Koiran), `=Koira ennen:` (alla olevat vähemmän tärkeitä), `=Alku avaa:` ja `=Toisensa poissulkevat:`. Kohteet riveittäin, tyhjä rivi päättää. Teksti on totuus: Valmis lukee säännöt tekstistä, ja opetuksen napautus kirjoittaa muutoksen lohkoon (olemassa oleva lohko pysyy paikallaan, uusi menee loppuun, tyhjäksi jäävä poistuu). Napautus kirjoittaa lohkon siistiin muotoon (rivi per kohde, oikea nimi).
- Tallennus: projektissa `rt:1`. Vanha tallennus kirjoitetaan tekstiin kerran avattaessa; `rules`, `need`, `order` ja `mx` tallentuvat edelleen kopiona.
- Palikan nimen vaihto tekstikentässä kirjoittaessa vie sääntö- ja termilohkojen viittaukset mukana (vain kun yksi palikkarivi muuttuu eikä uusi nimi ole jo käytössä). Muokkaa-ikkunan nimenvaihto samoin.
- Termit-ikkunassa *Termit tekstinä*: omat termit ja puiden termien sanat lohkoina. Valmis lukee takaisin; uusi nimi luo termin, poistettu lohko tyhjentää sanat (termi jää).

## Versio 1.17 (21.10.2026, suunnitelman vaihe 7a): kalenteri, aikajana ja raahaus

- Emil kuittasi vaiheen 6 ja hyväksyi kalenterin suositukset (350 ms, 15 min, termin valinta *Näytä kalenterissa* tulee 7b:ssä).
- Korjaus 1.17.1: ikkunan voi vetää alas mistä tahansa vapaasta kohdasta (ei kentästä tai napista), kun se on ylhäällä; sulkee ja tallentaa kuten Valmis.
- Uusi välilehti **Kalenteri** (alapalkissa *Muistiot*-nimi lyhennetty, jotta viisi mahtuu). Yläosa pysyy paikallaan: kuukausi ja viikko ‹ ›, *Tänään*, viikkonauha ma–su (pyyhkäisy vaihtaa viikkoa, piste = päivällä muistiinpanoja), ajattomien nauha (vaakavieritys, napautus avaa). Alla päivän aikajana 0–24, avautuu klo 7:n kohdalta, nykyhetki punaisella viivalla. Päällekkäiset rinnakkain.
- Merkintä: otsikko = ensimmäinen rivi ilman tunnistettuja ajankohtia. Lyhyt napautus avaa muistiinpanon. Pitkä painallus (350 ms) nostaa (varjo, paksu reuna), siirto 15 min askelin, reunan lähellä vierittää. Kulmaväkänen muuttaa loppuaikaa heti (katkoviiva).
- Aika kirjoittuu sinne, mistä se tuli: tekstin `klo …` korvataan (toistuvassa muistiinpanossa kaikkina päivinä), muuten kenttä. Muistiinpanon ikkunassa uusi *Kellonaika*-kenttä (alkaa–päättyy), joka näkyy vain, kun tekstissä ei ole aikaa. Tallennus: muistiinpanoon `time:{s,e}`.

## Versio 1.18 (21.10.2026, suunnitelman vaihe 8): tärkeysjärjestys, kuittaus, roskakori, valikko

- Emil hyväksyi suositukset: vaihe 8 ennen 7b:tä, osumattomat loppuun uusin ensin, aikatermit Myöhässä/Tänään/Huomenna/Tällä viikolla, Liitä termiin lisää `#Nimi`-rivin. 7b:hen: pudotus viikkonauhan päivälle muuttaa yksittäisen päivän, toistuva ei siirry.
- Termit-ikkunassa yksi luettelo *Tärkeysjärjestys* (aikatermit, omat termit, puiden termit), siirto ↑↓. Tallennus `jarjestys:[id]`; puuttuvat oletuksena perään (aikatermit, omat, puiden rivijärjestys).
- Muistiot: *Avoimet / Kuitatut* ja järjestys *Tulevat / Uusimmat / Tärkeys* paneelin yläosassa (alapalkissa vain + Uusi ja Termit). Tärkeys = tärkeimmän osuvan termin tai aikatermin paikka; tasatilanteessa aikaisempi ajankohta, sitten uusin.
- Pitkä painallus muistiinpanokorttiin: *Kuittaa / Palauta avoimeksi*, *Liitä termiin* (termisirut), *Poista*. Poisto ja tyhjäksi tyhjennetty teksti vievät roskakoriin ilman varmistusta; Asetuksissa *Roskakori* (napautus palauttaa, tyhjennys kahdella painalluksella). Yli 30 pv vanhat poistuvat avattaessa. Tallennus `done` muistiinpanossa, `roskakori:[…]`.

## Versio 1.19 (21.10.2026, suunnitelman vaihe 9): merkitykset, kääntöpuolet, tärkeät, etenevä kierros

- Emil hyväksyi suositukset (dokumentti https://claude.ai/artifact/TwhFPyZxyV1gEyrNzCr6sR): ei nuolia, pelkkä raahaus; etenevä kierros puun omasta järjestyksestä; oma tähti voittaa perinnän; kuitatut pois kalenterista ja päivän kierroksesta.
- Kuitatut muistiinpanot eivät näy kalenterissa eivätkä tule päivän kierroksen esivalinnoiksi.
- **Kääntöpuoli:** lohko `=Palikka kääntöpuoli:` ja alle tekstirivit (tallessa `P.flip`, teksti on totuus; nimen vaihto ei koske kääntöpuolen tekstiä). Kierroksen muistiinpanoon osio `Puuttuu:` ja rivit: merkitys (vaatii kaikki), jonka ehtoja tarjottiin mutta joka ei täyttynyt, sekä tarjolla ollut palikka, jota ei valittu eikä suljettu pois. Käymättömistä haaroista ei kirjata mitään. Kääntöpuolen teksti on termi (laji *kääntöpuoli*).
- **Korjaus:** Alku ei enää avaa kaikki tarvitaan -merkitystä suoraan (aiemmin opettamaton Alku avasi myös merkitysryhmän, jolloin se näkyi *Ryhmät*-rivillä täyttymättömänäkin). Täyttynyt merkitysryhmä näkyy *Ryhmät*-rivillä.
- **Tärkeät** (korvaa 1.18:n koko järjestyksen): Termit-ikkunassa *Valitse tärkeät* → tähdet napauttamalla → OK. Tärkeät ovat ylinnä numeroituina, järjestys pitkällä painalluksella ja raahaamalla; pudotus listan ulkopuolelle tai keskeytys palauttaa paikalleen. *Muut* ovat alla järjestämättä, perityn paikan saanut näyttää ”perii N. Nimi”. Tallennus `tarkeat:[id]`; 1.18:n `jarjestys` jätetään lukematta.
- **Perintä:** merkitsemätön termi saa tärkeän merkityksen paikan, jos se on sen ehto (vaatii kaikki), ryhmän jäsen tai kääntöpuoli, myös välillisesti. Oma tähti voittaa. Muistiot → Tärkeys käyttää tätä.
- **Eteneminen** (projektiasetus *Säännöt / Tärkeysjärjestys*, tallennus `flow:'prio'`): askel näyttää tärkeimmän täyttymättömän merkityksen otsikon ja ehdot puun järjestyksessä (rivit ja `ennen`). Jatka ilman valintaa ohittaa. Avaa- ja sulkee-säännöt toimivat edelleen. Askel muistaa merkityksensä (`m`), tyhjä ohitus ei näy *Valinnat*-rivillä.
- Testit: logiikka 216 ok; selainpolku 390 ja 320 px (tähdet, raahaus, pudotus ulos, napautus, etenevä kierros, Puuttuu, asetus) tietokoneen Chromiumissa.

## Versio 1.19.1 (21.10.2026, Emilin toive): Opetuksen ilme ja siirtymät

- Opetuksen työkalurivi (Tekstikenttä) on aina saman korkuinen ja pysyy ylhäällä vierittäessä. *Yksi riittää / Kaikki tarvitaan* tulee samalle riville Tekstikenttä-napin viereen omaksi parikseen, joten lista ei pompaa. Tuo- ja sulkee-vaiheessa rivillä on Valmis.
- Opetuksessa ohjeteksti ei näy jatkuvasti: yläpalkissa on i-nappi, josta ohje aukeaa. Varoitus (esim. kehä) näkyy edelleen yläpalkissa.
- Pienet siirtymät (200 ms) käytössä ja opetuksessa: rivi liukuu uuteen kohtaansa ja väri vaihtuu pehmeästi, uusi rivi häivyttyy esiin. Pois jäävät, jos laite pyytää vähemmän liikettä.

## Versio 1.19.2 (21.10.2026, Emilin toive): Muistiot ja alapalkki tiiviimmiksi

- Muistiot: rivi ”N muistiinpanoa” poistettu; lukumäärä on pelkkänä numerona yläpalkissa nimen vieressä. Avoimet/Kuitatut ja Tulevat/Uusimmat/Tärkeys pysyvät ylhäällä vierittäessä; Hae sanalla ja termisirut vierivät pois.
- Alapalkki: välilehdet 22 px (alle 360 px:n leveydellä 10 px) reunoista sisemmäs, ja tyhjää alla noin 20 px vähemmän (kotinäytön appina). Yläpalkin korkeutta ei muutettu Dynamic Islandin takia; Opetuksessa ja Muistioissa tyhjä ohjerivi jää pois.

## Versio 1.19.3 (21.10.2026, Emilin toive): tähdet Järjestyksessä, valikkonappi

- Opetus → Järjestys näyttää kaikki palikat (myös ryhmät, ilmoitukset ja apukysymykset). Rivin reunan tähti merkitsee tärkeäksi: tärkeät ylinnä numeroituina, järjestys pitkällä painalluksella ja raahaamalla; muut alla puun nykyisessä järjestyksessä. Rivin napautus tekee edelleen ennen-säännön. Tallennus puun tekstiin lohkona `=Tärkeät:` (rivit järjestyksessä), `P.imp`.
- Puun tärkeät ovat puun järjestyksessä ensin (ennen `ennen`-sääntöjä ja rivijärjestystä). Tärkeysjärjestyksessä etenevä kierros: merkitys = kaikki tarvitaan -palikka, tähdellä merkitty ryhmä (osat = jäsenet) tai tähdellä merkitty nappula (yksinään). Merkitysten aikana Alku odottaa; kun ne on käyty, Alun avaamat tulevat tarjolle säännöin.
- Tähti on sama kaikkialla: palikan tähti puussa ja sen termin tähti Termit-ikkunassa kulkevat yhdessä (järjestykset erillään, uusi tähti loppuun).
- Muistiokortin pitkä painallus korvattu pienellä ⋯-napilla oikeassa yläkulmassa (Kuittaa, Liitä termiin, Poista). Kortti on nyt div, joten napautus avaa muistiinpanon.
- Yläpalkin lukumäärä muodossa ”3 kpl”. Alapalkki nostettu puolimatkaa takaisin ylös (kotiviiva tuli esiin).
- Puun kopiointi lukee nyt säännöt tekstistä (aiemmin kopio olisi pudottanut kääntöpuoli- ja tärkeät-lohkot ensimmäisessä tallennuksessa).

## Versio 1.20 (21.10.2026, suunnitelman vaihe 10): projektit ja puut

- Emil päätti: projekti (esim. Mätsik Forest) sisältää useita puita, ja sillä on omat muistiinpanot, termit, termisanat, tärkeät ja roskakori. Puulla on omat säännöt, järjestys ja asetukset (Muisti, Eteneminen, Lopuksi). Teema ja koko ovat koko appin.
- Yläreunan nimi avaa ikkunan: ylhäällä projektit (napautus vaihtaa; *Uusi projekti, nimi tai poisto* avautuva kohta), alla nykyisen projektin puut (*Uusi puu tähän projektiin*, nimi, asetukset, Kopioi puu, Poista puu). Projektin poisto kahdella painalluksella poistaa sen puut ja muistiinpanot; viimeistä ei voi poistaa.
- Tallennusmuoto `ver:2`: `{app, ver, savedAt, kcur, kokonaisuudet:[{id,name,cur,puut,muistiinpanot,termit,termisanat,roskakori,tarkeat}], cfg}`. Versio 1 (puut ylätasolla kentässä `projektit`) luetaan yhdeksi projektiksi nimeltä *Projekti*; nimen voi vaihtaa. Varmuuskopion tuonti osaa molemmat.
- Muistiokortin ⋯-nappi on nyt kulmassa kiinni, ei vie omaa riviä.

## Versio 1.21 (21.10.2026, suunnitelman vaihe 11): toistuvat muistutukset

- Muistiot: *Avoimet / Kuitatut / Toistuvat*. Toistuvat on rekisteri: + Uusi (tai napautus olemassa olevaan) avaa ikkunan: teksti, *Toistuu: Tasavälein / Kuittauksesta*, väli valikosta (päivä, 2 ja 3 pv, viikko, 2–4 vk, kuukausi, 2, 3 ja 6 kk, vuosi, oma luku ja yksikkö) ja aloituspäivä. Tyhjä teksti tai Poista (kaksi painallusta) poistaa; jo tulleet muistiinpanot jäävät.
- Erä tulee avoimeksi muistiinpanoksi, kun on aika (tarkistetaan aina piirrettäessä): eri värinen kortti ja merkintä *toistuva*, päivämääränä eräpäivä (Tänään/Myöhässä ja kalenteri toimivat), järjestys tärkeyden mukaan. Kuittaus tallentaa kuittauspäivän; *Kuittauksesta*-tyyppi laskee seuraavan siitä. Poisto roskakoriin lasketaan kuittaukseksi, ettei toisto pysähdy.
- Rakentajan ratkaisut (Emil valtuutti): jos edellinen on kuittaamatta, uutta ei tehdä; myöhästyneistä tehdään vain viimeisin; tasavälein lasketaan aina aloituspäivästä (kuun 31. ei valu 28. päivään). Ei taustailmoituksia.
- Tallennus projektissa `toistuvat:[{id,text,mode:'every'|'after',n,unit:'d'|'w'|'m'|'y',start,lastDue?,lastDone?}]`, erä muistiinpanossa `rep`.

## Versio 1.22 (21.10.2026, suunnitelman vaihe 7b): kalenterin loppuosa

- Aikajanan merkinnän voi pitkällä painalluksella pudottaa viikkonauhan päivälle (päivä korostuu): yhden päivän ajankohta siirtyy. Tekstin päivä (esim. ”pe”) korvataan samassa kohdassa uudella päivämäärällä (1.11.2026), kellonaika säilyy; kenttäpäivä vaihtuu. Toistuva tai monen päivän merkintä ei siirry, ja yläpalkki kertoo syyn. Näkymä siirtyy uudelle päivälle.
- Ajattoman sirun voi pitkällä painalluksella raahata aikajanalle (haamu seuraa sormea): saa kellonajan kenttään, tunnin mittaisena, 15 min askelin. Aikajanan merkinnän voi pudottaa takaisin ajattomiksi yläosaan (päivän otsikko, viikkonauha-alueen ulkopuolelle ei tarvitse): tekstin kellonaika poistetaan (pelkkä kellonaika korvataan päivämäärällä, ettei päivä katoa), muuten kenttä tyhjenee. Sirun napautus avaa muistiinpanon kuten ennen.
- Termin asetus *Näytä kalenterissa* (termi-ikkunassa): termin nimi näkyy pienenä alaotsikkona viikkonauhan päivän alla (useampi: ”+N”) ja päivän otsikossa. Tallennus omassa termissä `cal:true`, puun termissä `termisanat[avain].cal`.
- Ei rakennettu: Muistioiden järjestys *Termin mukaan* (ryhmät alaotsikkotermeistä), koska neljäs järjestysvaihtoehto ei mahdu 320 px:iin; avoimena kysymyksenä.

## Versio 1.23 (21.10.2026, suunnitelman vaihe 12): muistutus, jos ei tapahdu

- Toistuvat-näkymän ikkunassa *Milloin tulee: Ajallaan / Jos ei tapahdu*. Jos ei tapahdu: teksti (omat termit antavat tärkeyden), termit valitaan siruina kaikista nykyisistä termeistä (puiden ja omat, rajauskenttä), *Jokin näistä / Kaikki samassa* (sama kuitattu muistiinpano), aika samasta valikosta (”2 viikkoon”, oma luku) ja *Seuranta alkaa*.
- Muistutus tulee avoimeksi samanvärisenä kuin toistuvat (merkintä *muistutus*), kun ajan kuluessa ei ole kuitattu muistiinpanoa, jossa ehto täyttyy. Aika lasketaan myöhäisimmästä: osuvan muistiinpanon kuittauspäivä, seurannan alku tai edellisen muistutuksen kuittaus (tai poisto). Avoin muistiinpano ei kelpaa osumaksi. Uutta ei tule, kun edellinen on auki. Rekisterikortissa ehto (”Jos ei 2 viikkoon: Salitreeni tai Kävely”) ja aikaisin tulopäivä.
- Rakentajan ratkaisut (Emil valtuutti): sama välilehti kuin toistuvilla (yksi automaattisten rekisteri, välilehti nimeltään yhä *Toistuvat*), muistutuksen oma kuittaus ei lasketa osumaksi vaan vain nollaa ajan, poistunut termi näkyy ”(poistunut termi)” eikä koskaan osu.
- Tallennus samassa listassa: `toistuvat[]` rivillä `mode:'trig', terms:[termi-id], all:true|false`. Puun termin id on `a:<kohdan id>`, joten nimen vaihto puussa irrottaa sen säännöstä.

- 1.23.1 (Emilin toive): Muistioiden järjestysvalinta (Tulevat/Uusimmat/Tärkeys) on nyt alisteinen Avoimet/Kuitatut/Toistuvat-valinnalle: ei laatikkoa, hieman sisennetty, pienempi harmaa teksti, valittuna korostusvärinen alleviivaus.

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu (1.23): termisirujen vieritys ikkunassa, rajauskenttä näppäimistön kanssa.

- Oikealla iPhonella ei kokeiltu (1.22): sirun raahaus vaakavierittyvästä nauhasta (vieritys vs. pitkä painallus), pudotus viikkonauhalle sticky-otsikon kanssa.
- Oikealla iPhonella ei kokeiltu (1.20–1.21): projektin vaihto, toistuvan ikkunan valikot (iOS:n oma valitsin).
- Oikealla iPhonella ei kokeiltu (1.19.2): alapalkin uusi korkeus kotinäytön appina (kotiviiva ei saa peittää nimiä), reunimmaisten välilehtien paikka.
- Oikealla iPhonella ei kokeiltu (1.19.1): siirtymien sujuvuus, työkalurivin pysyminen ylhäällä Safarissa.
- Oikealla iPhonella ei kokeiltu (1.19): tärkeiden raahaus (sivu ei saa vieriä mukana, iOS:n valikko ei saa aueta), tähtitila pitkällä listalla.
- Oikealla iPhonella ei kokeiltu: muistiinpanokortin pitkä painallus (iOS:n valikko ei saa aueta), järjestysnuolet pitkällä listalla, kalenterin pitkä painallus ja raahaus (sivun vieritys ei saa lähteä mukaan, iOS:n valintavalikko ei saa aueta), kulmaväkänen, viikkonauhan pyyhkäisy, apukysymyskortit näppäimistön kanssa, tekstin valinta ja Liitä termiin -nappi (iOS:n oma valintavalikko), tekstikentän värikerroksen kohdistus Safarissa (kursori, valinta, vieritys), zoomauksen esto ja yläreunan lisätila (näkyy vain kotinäytön appina), jakoikkunan tiedostovienti, päivämäärävalitsin, näppäimistö alapalkin kanssa, tekstikentän koko.
- Nimen vaihto tekstikentässä seuraa vain, kun yksi rivi muuttuu kerrallaan. Leikkaa–liitä tai usean rivin muutos ei vie viittauksia mukana (Opetus näyttää ”Säännöt ilman riviä”). Termien sanat (`termisanat`) eivät seuraa nimen vaihtoa.
- Oikealla iPhonella ei kokeiltu kursorin pysymistä, kun nimen vaihto muuttaa muita rivejä.

## Seuraavaksi

- Arvio ja jatkokehitys 21.10.2026 (Claude Doc): https://claude.ai/artifact/UXJ416PaGLHh7mwufxmuaH. Suositus: iPhone-kokeilu, sitten näkyvyys (miksi tämä, termiosumat, nimen vaihto tekstikentässä, varmuuskopion muistutus), termilohkot, JA-ehdot, esiin nousevat apukysymykset.

- Emil kokeilee puhelimella. Mahdolliset seuraavat: säännöt myös tekstimuodossa (koko puu tekoälyllä), ilmoitusten kumoutuminen myöhemmin, termien opetus napauttamalla.

## Avoimet kysymykset

- Vaihe 9 valmis: Emil valtuutti 21.10. illalla jatkamaan suositusten mukaan, joten Hoidettavat ja Puuttuu pysyvät molemmat muistiinpanossa.
- Avoin: Muistioihin järjestys *Termin mukaan*? Suositus: tehdään hakuun liittyvänä suodattimena (termisirut jo suodattavat), ei neljättä järjestystä. Vaihtoehto: korvataan Uusimmat sillä.
- Avoin: siirretäänkö puu tai muistiinpano projektista toiseen? Ei rakennettu (ehdotus: ⋯-valikkoon *Siirrä projektiin*).
- Avoin (1.23): nimetäänkö Toistuvat-välilehti uudelleen (esim. *Automaattiset*), kun siellä on nyt kaksi lajia? Suositus: ei vielä, nimi mahtuu ja on tuttu.

- Emil hyväksyi 21.10.2026 kaikki suositukset dokumentista *Päätöspuu: avoimet kysymykset* (https://claude.ai/artifact/RFMnrpTAm7fb7r9prDPz8q). Toteutus etenee vaihe kerrallaan: `SUUNNITELMA-vaiheet.md` (pelisäännöt, vaiheiden tila ja kunkin vaiheen kysymykset). Seuraavaan vaiheeseen vasta Emilin kuittauksen ja vastausten jälkeen.
- Ratkaistu: suhteellisten päivien pohja on luontihetki (17), nimi ”kierros” jää (24), päivän muistiinpanoihin lasketaan välit (Emil: ”Juu!”).
- Termin opetus on kaksi tekstikenttää (tunnistavat / poissulkevat), ei napautuskierto: vaiheet 4 ja 6 tuovat lohkot tekstiin.

## Emilin kommentit

- (tyhjä)
