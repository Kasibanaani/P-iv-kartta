# Appi-appi: tila

**Vaihe:** kokeilussa, laajennus kehitteillä · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/appiappi/ · **Päivitetty:** 17.10.2026 (Appi-appi 22; tila tiivistetty)

Kytköskartan kopio, johon tuodaan Masterin ominaisuuksia vaiheittain (puhelin- ja iPad-näkymät, maailma ja hahmon liike, myöhemmin vienti omaksi appiksi). Ristiriidoissa Kytköskartan logiikka voittaa. Suunnitelma: `SUUNNITELMA.md` ja `suunnitelmat/`; vanhempien vaiheiden päätökset `VERTAILU.md`. Toteutettujen versioiden yksityiskohdat, tallennuskentät ja kokeiluohjeet: `MUUTOKSET.md`.

## Valmiina

- Pajakone 1–4 ja Appi-appi 0–10: laitemuoto, Käyrä, asettelu, kerrokset, Kuva, Tatti, Liike; maailma ja kamera, esteet ja alueet, hahmo, kuvasarja, ruudukko, reitit ja reitinhaku, ruutuliike, kerrokset käytössä, Sekuntikello, Monitori, efektit, zoomaus (`VERTAILU.md` kohdat 5–10).
- Appi-appi 11–17 (suunnitelman P0–P3 ja F24): ominaisuusviite tekstiin ja poiston vaikutuslista (11), ketjun kolme lukitustilaa (12), Tietotaulukko ja Tapahtuman tiedot (13), Rivi, Rivijoukko ja ikkuna riveille (14), Toistin (15), muokkauslomake (16), massa, kimmoisuus ja kitka (17). Linkit ratkaisuihin: `SUUNNITELMA.md`, Toteutuma.
- Appi-appi 18–18b: muisti- ja viestilaput ja keskustelu lapussa (`suunnitelmat/10-laput.md`).
- Appi-appi 19–20: käyttöraahaus F12, korttien järjestys raahaamalla, Siirrä rivi, pudotusalueen korostus ja reunavieritys (`suunnitelmat/03-kayttopinta.md`).
- Appi-appi 21: säädin raahautuu vapaasti (Safarin pykälä kerrallaan -vika korjattu); kalenterin päivän valinta, valitun päivän asiat kalenterin alla, `kalenteri.valittu` ja tapahtuma *päivä valittu*.
- Appi-appi 22: suosikit ja presetit F26 (`suunnitelmat/04-omat-palikat-ja-kokoelmat.md`, toteutus).
- Emilin päätökset 16.10. (Appi-appi 13:n jälkeen): koosteet säilyvät taulukon ominaisuuksina (`taulu.määrä.summa`) myös P3:n ikkunakoosteiden rinnalla; Lisää rivi -kentät pysyvät kaavoina (teksti lainausmerkeissä); taulukolle ei vielä tehdä omia tapahtumia (rivi lisätty, valinta vaihtui); Lisää puuttuvaan kenttään alkaa nollasta ja Vaihda puuttuvasta antaa kyllä (nykyinen toiminta pysyy, tekoälyn suositus).
- Tallennusversio edelleen 8; vanhat projektit avautuvat ennallaan. Uudet valinnaiset kentät versioittain: `MUUTOKSET.md`, Tallennus (Appi-appi 11–16 myös juuren `README.md`).
- Testattu vain tietokoneen Chromiumissa (kosketus ja nipistys CDP:llä 390 ja 320 px, Appi-appi 11–13 tietokoneella 1440 ja 1280, Appi-appi 13–22 myös puhelinleveyksillä), ei oikealla iPhonella, iPadilla eikä Safarilla.

## Jono

Emilin päätös 17.10.2026: kaikki alla olevat linjaukset tekoälyn suositusten mukaan. Yksi työ = yksi keskustelu; seuraava alkaa, kun edellinen on viety päähaaraan ja tämä tila päivitetty. Kysymyksiä ei tarvitse kysyä uudestaan: päätökset ovat tässä. Valmis työ poistetaan jonosta ja kirjataan kohtaan Valmiina yhdellä rivillä; yksityiskohdat `MUUTOKSET.md`:hen.

**Haarat ja tarkistuspisteet (Emil 17.10.2026):** ⏸-merkitty kohta odottaa Emilin päätöstä. Jono ei pysähdy siihen: rakentaja tai vahti ilmoittaa Emilille ja jatkaa seuraavaan kohtaan, joka ei riipu odottavasta. Kohta, josta mikään jonossa ei riipu, on oma haaransa; Emil voi ottaa sen käsittelyyn milloin haluaa. Avoimista haaroista muistutetaan Emiliä säännöllisesti (ajastettu muistutus APPI-APPI-projektin ketjussa *Tilastot ja oppiminen*).

1. **Koeapit C ja B** (`suunnitelmat/07-toteutuspolku.md`) nykyisillä palikoilla: kohdelista 100 rivillä ja kysymysappi. Tallennetaan projekteiksi `master-tiedot/appiappi/` (Emil avaa *Hae uudet projektit*). Pienet puutteet korjataan samassa työssä, isot kirjataan tähän jonoon. Koeappi A tehdään vasta historian (F08) hyväksymiskokeena.
1b. **Erikoispalikan merkki ✦** (Emilin päätös 17.10., `PALIKKASAANNOT.md` osa B): palikkalajiin kenttä `erik:'syy'` rekisterin riveille, paletti ja tarkastelija näyttävät ✦:n ja syyn selkokielellä, testi pitää rekisterin ja koodin samana. Ei tallennusmuodon muutosta.
2. **Testitila F22, suppea** (`suunnitelmat/06-testit-ja-julkaisu.md`): yläpalkkiin *Kokeile*; kokeilu alkaa kopiosta nykyisistä käyttötiedoista; koko kokeilun ajan värillinen raita ja teksti ”Kokeilu”; oikeat tiedot eivät muutu. Ei tässä: kokeilun tulosten siirto oikeaan käyttöön, tallennetut kokeet.
3. **Animointi F29, vaihe 1** (`suunnitelmat/14-animointi.md`, Emilin idea ja päätökset 17.10.): näkymän palikan paneeliin osio *Animointi* (ilmestyy, katoaa, kesto, pehmeys), projektin oletus, ominaisuudet logiikkaan. Pelkkä visuaali, logiikka ei odota, vain `opacity`/`transform`, Vähennä liikettä noudatetaan. Tallennusmuoto laajenee (muistuta varmuuskopiosta).
4. **Rakenteinen historia F08** (P4:n alku, `suunnitelmat/01-tieto-ja-tapahtumat.md` kohta 7): Kirjaa-toiminto kirjoittaa tavalliseen Tietotaulukkoon, jossa automaattiset sarakkeet *aika* ja *id*; kirjausta muokataan ja poistetaan kuten taulukon riviä (ei korjaushistoriaa); vanha tekstiaikajana muunnetaan vain napista; päivän raja on projektin asetus, oletus keskiyö. Hyväksymiskokeena koeappi A.
5. **⏸ Tarkistuspiste F25** (`suunnitelmat/11-tilastot-ja-yhteydet.md`, Emil 17.10. aamulla): ei rakenneta. Kun F08 on viety, ilmoita Emilille, että F25:n avoimet kysymykset (kohta 9) ovat vuorossa, ja jatka jonon kohtaan 6. Elämäntapaväittämien koeappi ja korrelaatio vasta Emilin vastausten jälkeen.
6. **Viite-ehdotukset ja palikan luonti nimestä** (F27 kohta 1, `suunnitelmat/12-teksti.md`): ehdotusrivi viitteelle kirjoitettaessa, *Luo Arvo* tuntemattomasta nimestä.
7. **Tulkki eli printteri** (F27 kohta 2, yhdessä F20:n liimatun taulukon kanssa): teksti kuviolla taulukon riveiksi tai Arvo-palikoiksi, esikatselu ennen hyväksyntää. Tagit ja sanaoppi (kohdat 3–4) vasta F08:n ja F25:n jälkeen erikseen.
8. **Jana F28, vaihe 1** (`suunnitelmat/13-jana.md`, Emilin idea 17.10.): logiikan ikkuna, jonka leveys on alku–loppu (oletus 0–10), aika- tai arvokulku (esim. säädin), merkit portaisiin. Kohta tallennetaan arvona (Emilin päätös 17.10.); muut linjaukset tekoälyn suosituksen mukaan: hypyssä väliin jääneet laukeavat, aikajana eteenpäin ja arvojana molempiin suuntiin. Välit (alku–loppu-merkit) myöhemmin erikseen.
9. **Animointi F29, vaihe 2** (`suunnitelmat/14-animointi.md`): arvo vaihtuu (ristihäivytys, luku rullaa, uusin voittaa) ja Aseta-/nuolihyppäyksen sijainti liukuen, pelkkä visuaali. Vaihe 3 (venytys tai vana) vain kevyeksi mitattuna, ei vielä jonossa.

## Seuraavaksi

- Järjestys: Jono yllä. Kokonaiskuva ja loput paketit (P4–P7): `SUUNNITELMA.md`.
- **Tekoälyn ehdotus:** `index.html` pilkotaan osiin (build-skripti tai moduulit), jotta kontekstia kuluu vähemmän. Ei tehdä ilman Emilin lupaa.
- Emil kokeilee, uusin ensin: laput (18), massa ja törmäykset (17), lomake (16), Toistin (15), Rivi ja Rivijoukko, Tietotaulukko, ketjun lukitus, puhelimella zoomaus ja efektit. Vaiheittaiset ohjeet: `MUUTOKSET.md`, Kokeiluohjeet.
- **Emilin idea 16.10. (ensimmäinen viestilappu):** kalenteripohja: ruudukkokerros, jonka ruudut tarkoittavat päivää ja kellonaikaa, ja asiat raahataan ruutuihin. Ruudun tunnistus on jo olemassa (`ruutux`/`ruutuy` + kaava), käyttöraahaus F12 on tehty (Appi-appi 19–20). Kalenteripohjan voi siis rakentaa nykyisillä palikoilla. Tekoälyn ehdotus on tehdä se F12:n hyväksymiskokeeksi. Ei toteutusta ilman ”toteuta”.
- Myöhemmin: esimerkkiprojekti (esim. labyrintti) vain pyynnöstä.

## Avoimet kysymykset

- Viestilappujen yöajo: kellonaika (ehdotus klo 3) ja valtuutus. Tekoälyn suositus on, että yöllä toteutetaan vain napilla hyväksytyt suunnitelmat. Kysytty Emililtä 16.10.
- Appi-appi 9 (rajaus): KESKIARVO-, SUURIN- ja PIENIN-ikkunat ohittavat tyhjät arvot; ennen ne laskettiin nolliksi. Vanhan projektin keskiarvo voi siksi muuttua, jos ikkunassa on ollut tyhjiä.
- Appi-appi 9: kerroksen rullausvauhtia ja järjestystä ei voi vielä ohjata logiikasta (vain näkyy, estää, himmennys, läpinäkyvyys). Tarvitaanko?
- Appi-appi 9: efekti ketjun ulkopuolella lähettää *sitten*-tapahtuman heti, ei efektin lopussa (ketjussa odotetaan). Riittääkö?
- Appi-appi 9: Teksti ilmestyy toimii Tekstissä, Muodossa, Ilmoituksessa ja Painikkeessa; tekstikenttiin (syöte) ei.
- Siirto x/y (lisätään paikkaan) ja ominaisuus x/y (korvaa paikan) ovat molemmat käytössä: käykö kaksi tapaa?
- Tatin y on positiivinen alaspäin ja suunta 0 = ylös: käykö?
- Isot kuvatiedostot hidastavat GitHub-tallennusta; SVG on kevyin.
- Hakutaulukon ja monen haaran rivien rajoja ei voi ohjata ominaisuuksina.
- Reitinhaku koskee vain Napautus-ohjausta (myös kohde nuolesta). Tatti ja Auto eivät kierrä esteitä, eikä haettua reittiä näytetä ruudulla. Riittääkö?
- Ruutuliike: kaksi hahmoa voi astua samaan ruutuun samalla hetkellä (määränpäätä ei varata). Napautus viereiseen ruutuun ei vielä ohjaa. Tarvitaanko?
- Appi-appi 10: `ruutu.leveys` on edelleen laitteen leveys (kojelauta ei zoomaudu); näkyvä maailma on `kamera.leveys`. Käykö?
- Appi-appi 10: kun sormilla voi zoomata, napautus kohteeseen tehdään sormen noustessa eikä heti kosketuksessa (muuten nipistyksen ensimmäinen sormi lähettäisi hahmon). Tuntuuko viiveeltä?
- Appi-appi 10: Kamera-palikalla ei vielä ohjata seurattavaa, kuollutta aluetta eikä kameran paikkaa logiikasta (vain zoomaus). Koristeviiva kojelaudan palikoiden välillä ei pysy kohdallaan zoomattuna.
- Appi-appi 11: poistetun palikan nuolet ja koristeviivat poistuvat sen mukana (eivät jää roikkumaan); vaikutuslista kertoo ”nuoli poistuu”. Käykö?
- Appi-appi 11: ennen palikkaa kirjoitettu kaavan viite (`{?nimi}`) löytyy yhä automaattisesti, kun palikka tehdään, ja vanhojen projektien aiemmin poistetut kaavaviitteet samoin. Vain tästä eteenpäin poistetut eivät sitoudu samannimiseen.
- Appi-appi 11: logiikan Toiminnolla ei voi poistaa palikkaa, joten suunnitelman ”vahvistus tarvitaan” -paluuarvoa ei rakennettu. Liittäminen toisesta projektista poistaa vieraat viittaukset kuten ennen.
- Appi-appi 12: tilassa 2 toiminnon *arvo* tulee lukitushetkestä, mutta Lisää, Vaihda, Valitse ja Lisää rivi käyttävät kohteen nykyistä arvoa (muuten kaksi Lisää 1 -vaihetta tekisivät yhteensä 1 ja muiden kirjoitus hävisi). Käykö?
- Appi-appi 12: saman ketjun kahta kierrosta ei voi olla käynnissä yhtä aikaa (ketju joko ohittaa uuden käynnistyksen tai aloittaa alusta). Suorituskohtaisuus koskee eri ketjuja ja uutta kierrosta. Tarvitaanko rinnakkaisia kierroksia?
- Appi-appi 12: jos ketjun yksi haara vaihtaa tilan, rinnakkaisen haaran jo alkanut *Odota, kunnes* -ehto lukee sen jälkeen uutta tilaa (ajastimet ja efektit eivät muutu). Tapahtuman mukana kulkeva tieto (D05) tuli P2:ssa; tätä koskeva koe on testissä `logiikka_48_tapahtuma.js`.
- Appi-appi 12: lukukuva tallentuu projektiin niin kauan kuin lukittu ketju on käynnissä, eli rakenne on tallennuksessa kahdesti (kuvatiedostot eivät, ne luetaan aina nykyisinä). Ero-luettelo laskee paneelin ollessa auki kaikki arvot kahdesti: nopeutta isossa projektissa ei tarkistettu. Miksi? näyttää eron ketjun paneelissa, ei luetun palikan omassa.
- Appi-appi 13 (rajaus, ei kysymys): `tapahtuma.rivi.<sarake>` etsii sarakkeen sen viitteellä, koska taulukko selviää vasta tapahtumasta. Jos sarakkeen viite vaihdetaan, tällainen kaava antaa virheen (joka luettelee sarakkeet) ja se korjataan käsin. Taulukon omat kaavat (`taulu.valittu.…`) eivät katkea. Emil ei vielä tarvinnut tätä; korjataan, jos tulee vastaan.
- Appi-appi 14: käsiteltävä rivi on olemassa vain läpikäynnissä (joukko, ikkuna riveille, Toista riveille). Muualla Rivi on tyhjä, joten ikkunan sisällä oleva kaava näyttää kanvaasilla ”–”; oikeat riveittäiset arvot näkyvät ikkunan Miksi?-selityksessä. Riittääkö, vai pitäisikö kanvaasin näyttää esim. ensimmäisen rivin arvo?
- Appi-appi 14: jos ikkunassa riveille on monta palikkaa, kaikkien arvot kootaan yhteen (SUMMA laskee molemmat kaavat kaikilta riveiltä, MONTAKO PÄTEE laskee palikka–rivi-pareja). Tavallisesti ikkunassa on yksi kaava tai vertailu. Käykö?
- Appi-appi 14: järjestyksessä puuttuva arvo on aina viimeisenä (myös laskevassa), teksti aakkosjärjestyksessä kirjainkoosta välittämättä ja numerot luontevasti (2 ennen 10:tä).
- Appi-appi 15–16: kentän muutos ei lähetä omaa tapahtumaa (Emilin linjaus 16.10.: ei vielä; arvo kulkee nuolia pitkin ja voi laukaista ehdon nousun). *Muuttui*-tapahtuma rivin kanssa voidaan lisätä myöhemmin kaikille kentille yhtä aikaa.
- Appi-appi 16: lomakkeen kenttä ja kortin vanha sidonta eroavat kahdessa kohdassa, koska kortin piti pysyä ennallaan: tyhjennetty lukukenttä kirjoittaa lomakkeessa puuttuvan, kortissa nollan (ja kortin lukukenttä näyttää puuttuvan ”–”), ja Tyhjennä-toiminto tyhjentää lomakkeen kentän rivillä, kortin kentässä ei mitään. Yhtenäistetäänkö kortti lomakkeen mukaiseksi (tekoälyn suositus)?
- Appi-appi 16: Rivi-palikka, jonka rivi on *käsiteltävä* tai *tapahtuman*, on näkymässä kortin ulkopuolella aina ilman riviä (kenttä harmaa); paneeli kertoo sen. Lomakkeeseen sopii *valittu rivi*.
- Appi-appi 16 ei tehty: uusi rivi suoraan lomakkeesta (Lisää rivi -toiminto + Valitse rivi: viimeinen tekee sen), tallenna/peru-vaihe (muutos heti voimaan, D02), valintalista-kenttä valinta-sarakkeelle, sidonta suoraan Rivijoukon ensimmäiseen riviin.
- Appi-appi 16: kun valittu rivi vaihtuu, sidotun kentän arvo vaihtuu, ja esim. valintaruudusta lähtevä JOS-ikkuna reagoi kuin käyttäjä olisi rastinut. Käykö, vai tarvitaanko erottelu (vain käyttäjän muutos)?
- Appi-appi 16: logiikan Aseta kenttään, jolla ei ole riviä, ei kirjoita mitään eikä kerro siitä. (Hylätty rinnakkaistoteutus näytti ilmoituksen ”ei riviä, johon kirjoittaa”.) Tarvitaanko ilmoitus?
- Appi-appi 15: jäsenyys ratkeaa vain vetämällä (ja paletista pudottaessa): paneelin X/Y-kentillä tai tasaustyökaluilla siirretty palikka pysyy kortissa tai sen ulkopuolella kuten ennen. Kortin korkeus on kiinteä (ei kasva sisällön mukaan). Riittääkö?
- Appi-appi 15 ei tehty: toistin toistimen sisällä, efektit ja Tyhjennä yksittäiseen korttiin, kortin palikan oma kerros käytössä, virtualisointi (kaikki kortit piirretään; selaimessa tarkistettu 40, moottorissa 100 riviä).
- Appi-appi 17: massalliset parit ratkaistaan yksinkertaisella impulssimallilla (osuma-alue ei kierry, ei pyörimistä, ei seinän pintakitkaa). Kolari siirtää ja hidastaa autoa, mutta ei pyöritä sitä. Riittääkö?
- Appi-appi 17: kosketus pysyy samana, kun rako on alle 1 px, joten jatkuva työntö ei lähetä törmäsi-tapahtumaa joka kuvassa. Jos kappaleet irtoavat ja osuvat uudestaan, tulee uusi törmäsi.
- Appi-appi 17: kimmoisuus koskee myös massatonta seinäosumaa (pomppulevy pomppaa massattomankin pelaajan takaisin). Vanhoissa projekteissa kimmoisuus on 0, joten ne liikkuvat ennallaan.
- Appi-appi 17 ei tehty (suunnitelman rajaus): painovoima (seuraava pieni vaihe, rakentuu tönäisyn päälle), ruutuliikkeen työntö (Sokoban), Töytäise suuntaan -toiminto, yli 100 kappaleen nopeutus. Miksi?-selitys ei vielä kerro tönäisystä.
- Appi-appi 18: laput synkronoituvat GitHubiin muutoksen jälkeen (3 s viive), siis myös siirrot ja koon muutokset tekevät tallennuksen (commit master-tiedot-repoon). Riittääkö, vai tallennetaanko vain tekstin ja viivojen muutokset?
- Appi-appi 18: paikka ja koko ovat ruudun pikseleitä, joten puhelimella ja tietokoneella sama lappu on samassa kohdassa ruutua. Tarvitaanko laitekohtainen paikka?
- Appi-appi 18: lappu ei ole Kumoa-historiassa (poisto kysyy vahvistuksen). Hakasulkuviite löytää vain palikat; asetukset ja muut kohdat viivalla.

### Ei tarkistettu (testattu vain tietokoneen Chromiumissa)

- Ei tarkistettu oikealla iPhonella: nipistys oikeilla sormilla ja Safarin oma sivun zoomaus (estetty `gesturestart`-tapahtumalla ja `touch-action`illa, testattu vain Chromiumissa), valikkokerroksen suoja sormella, efektien sujuvuus Safarissa (Web Animations ja erilliset translate/scale/rotate vaativat iOS 14.1+), monitorin päivitys kuvasilmukassa ja akun kulutus käyvällä sekuntikellolla, pyyhkäisy sormella (testattu hiirellä), reitinhaun nopeus isossa maailmassa, tatti ja napautus sormella, kuvasilmukan sujuvuus ja akun kulutus jatkuvassa liikkeessä, isot kuvasarjat.
- Appi-appi 11 ei tarkistettu: Miksi?-selitys tekstin ominaisuusviitteelle, monivalintapoisto selaimessa (moottoritesti on), poisto puhelin- ja iPad-näkymän rakentajassa, ⚠-merkin sijainti hyvin pienissä palikoissa.
- Appi-appi 12 ei tarkistettu: lukitus puhelin- ja iPad-näkymän rakentajassa, pitkä lukittu odotus oikeassa käytössä (sulje ja avaa appi kesken).
- Appi-appi 13 ei tarkistettu: sarakkeen lajin vaihto ja sarakkeen poiston varoitus selaimessa (moottoritestit on), riviviitesarakkeen valinta taulukkoikkunassa, ajankohta-sarake käsin kirjoitettuna, taulukko lukitussa ketjussa käytössä (moottorikoe on), iso taulukko (satoja rivejä) ja sen nopeus, puhelin- ja iPad-näkymän rakentaja muuten kuin taulukkoikkunan mahtuminen.
- Appi-appi 14 ei tarkistettu: Rivin ja Rivijoukon paneelit puhelin- ja iPad-näkymän rakentajassa, iso taulukko (satoja tai tuhansia rivejä, 100 riviä tarkistettu) ja sen nopeus Safarissa, Toista riveille lukitussa ketjussa selaimessa (moottorikoe tiloille 0–2 on), joukon järjestyssarakkeen virhe Viitevirheet-listassa (ei näy siellä).
- Appi-appi 16 ei tarkistettu: lomake puhelin- ja iPad-näkymän rakentajassa, laitenäkymä, oikea iPhone ja Safari, lomakkeen kenttä lukitussa ketjussa (Aseta kenttään tilassa 2).
- Appi-appi 15 ei tarkistettu: toistin puhelin- ja iPad-näkymän rakentajassa, laitenäkymä (puhelinkoe tehtiin vapaalla kanvaasilla), sormella rullaus oikealla iPhonella ja Safarin `overscroll-behavior`, satojen korttien nopeus Safarissa, kortin säätimen raahaus sormella, kopioi–liitä toistimen kanssa.
- Appi-appi 17 ei tarkistettu: oikea iPhone ja Safari (sujuvuus monella kappaleella, akku), paneelit puhelin- ja iPad-näkymän rakentajassa, Auto-ohjauksen kolarit selaimessa (moottorissa massallinen Nopeus x -ohjaus), 30+ kappaleen nopeus.
- Appi-appi 18 ei tarkistettu: oikea iPhone ja Safari (sormella veto ja kirjoitus, näppäimistö lapun päällä), oikea GitHub (testattu valepalvelimella), tekoälyn vastaus oikeasta keskustelusta, monta kymmentä lappua, iPad-näkymä.
- Appi-appi 20 Ei tarkistettu: oikea iPhone ja Safarin pitkä painallus (tekstin valinta tai suurennuslasi voi kilpailla), kortin raahaus ruudukkoasettelussa (testattu allekkain), reunavieritys hitaammalla kerroksella (tarkoituksella pois), korostus rullausvauhdiltaan eri kerroksen alueille.
- Appi-appi 21 Ei tarkistettu: oikea iPhone ja Safari (säätimen korjaus testattu Safarin tapaa jäljitellen), kalenterin päivän napautus kortissa (Toistin).
- Appi-appi 22 Ei tarkistettu: oikea iPhone ja Safari (nimeäminen käyttää selaimen kysymysikkunaa), isot presetit kuvineen (selaimen muistin raja), presetti, jonka palikat ovat toistimen kortissa.

## Suunnitelmat

- **17.10.2026, F29 animointi (Emilin idea):** `suunnitelmat/14-animointi.md`, pelkkä visuaali (D14–D15). Emil hyväksyi linjaukset; vaihe 1 jonossa 3, vaihe 2 jonossa 9. Ei toteutettu.
- **17.10.2026, F28 jana:** `suunnitelmat/13-jana.md`, jonossa (vaihe 1). Ei toteutettu.
- **17.10.2026, F27 teksti (Emilin idea):** `suunnitelmat/12-teksti.md`: viite-ehdotukset ja palikan luonti nimestä, tulkki/printteri kuviolla (taulukon rivit tai palikat), Tagit-palikka ja sanaoppi. Emil hyväksyi järjestyksen; kohdat 1–2 jonossa (viite-ehdotukset, tulkki). Ei toteutettu; vain Markdown muuttui.
- **16.10.2026, F25 tilastot ja yhteydet (Emilin idea):** `suunnitelmat/11-tilastot-ja-yhteydet.md`: elämäntapaväittämät, päivätaulukko, Yhteys-palikka. Ei toteutettu. **Tauolla 17.10.:** kohdan 9 kysymykset auki, uudelleenkäsittely tarkistuspisteessä F08:n jälkeen (Jono 5).
- **16.10.2026, F24 massa ja törmäykset:** `suunnitelmat/09-massa-ja-tormaykset.md`, toteutettu Appi-appi 17.
- **17.10.2026, palikkasäännöt ja linjakkuuskartoitus 1:** `PALIKKASAANNOT.md` (rakentajan aina luettava tarkistuslista, erikoispalikoiden rekisteri) ja `kartoitukset/2026-10-17-linjakkuus.md`: linja pitää pääosin; isot löydökset L1 (syöttävät ohjaimet eivät lähetä *muuttui*-tapahtumaa) ja L2 (logiikkapalikoiden asetukset eivät näy kaavalle). Ehdotuksia, ei toteutettu. Kartoitus katsoi vain palikoiden kohdat ja ominaisuudet koodista, ei käyttöliittymää eikä testejä.
- **16.10.2026, missio ja manuaalin tehtävänanto:** `MISSIO.md` ja `suunnitelmat/08-manuaalin-tehtavananto.md`. Varsinaista manuaalia ei ole kirjoitettu.

## Emilin kommentit

- (tyhjä)

Arkisto (Pajakone-rivi, ei enää päivitetä): https://app.notion.com/3fa977255eec812f943afd1d8705083e
