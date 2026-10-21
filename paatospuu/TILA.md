# Päätöspuu: tila

**Vaihe:** versio 1.8, kokeilussa · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/paatospuu/ · **Päivitetty:** 21.10.2026

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
- **Muutos aiempaan:** ennen sana tunnistui alusta (”eläi” löysi eläimen). Nyt taivutukset tarvitsevat tavuviivan. Myös palikoiden nimet tunnistuvat vain kokonaisina.
- Muistiinpanoissa hakukenttä *Hae sanalla* termien yläpuolella: osa sanaa riittää. Toimii yhdessä termisuodattimen kanssa.

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu: zoomauksen esto ja yläreunan lisätila (näkyy vain kotinäytön appina), jakoikkunan tiedostovienti, päivämäärävalitsin, näppäimistö alapalkin kanssa, tekstikentän koko.
- Säännöt ovat nimissä: jos nimen vaihtaa suoraan tekstikentässä, säännöt eivät seuraa (Opetus näyttää ”Säännöt ilman riviä”). Muokkaa-tilassa vaihto seuraa.

## Seuraavaksi

- Emil kokeilee puhelimella. Mahdolliset seuraavat: säännöt myös tekstimuodossa (koko puu tekoälyllä), ilmoitusten kumoutuminen myöhemmin, termien opetus napauttamalla.

## Avoimet kysymykset

- **Ehdot, järjestys ja muisti (pohdinta, ei rakennettu):** ks. `POHDINTA-ehdot.md` (myös muistiinpanosta esiin nousevat apukysymykset), sen lopussa 6 avointa kysymystä. Seuraava askel: Emilin esimerkkipuu läpi mallin kanssa ennen koodia.

- Lyhenteet (ma, ti, pe) ja ”viikko 43” välilyönnillä eivät tunnistu (Vk42 vain yhteen, Emilin päätös). Lyhenteet voisi lisätä, jos ne ovat peräkkäin muun ajankohdan kanssa.
- ”klo 14.” lauseen lopussa (piste perässä) ei tunnistu kellonajaksi.

- Päivän muistiinpanoihin lasketaan nyt myös välit (esim. ”kahden viikon sisällä”), jotka sisältävät päivän. Riittääkö vain tarkka päivä?

- Suhteellisten päivien pohja: luontihetki (nyt) vai viimeisin muokkaus (Emilin alkuperäinen ajatus)? Muokkaus siirtäisi ”perjantaita” joka kerta.
- Kelpaako nimi ”kierros” istunnon tilalle?
- Termin opetus on nyt kaksi tekstikenttää (tunnistavat / poissulkevat) eikä napautuskierto: riittääkö?

## Emilin kommentit

- (tyhjä)
