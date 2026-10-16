# Appi-appi: tila

**Vaihe:** kokeilussa, laajennus kehitteillä · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/appiappi/ · **Päivitetty:** 16.10.2026 (Appi-appi 13)

Kytköskartan kopio, johon tuodaan Masterin ominaisuuksia vaiheittain (puhelin- ja iPad-näkymät, maailma ja hahmon liike, myöhemmin vienti omaksi appiksi). Ristiriidoissa Kytköskartan logiikka voittaa. Suunnitelma ja päätökset: `VERTAILU.md`.

## Valmiina

- Pajakone 1–4: laitemuoto, puhelinappin perusta, Käyrä, asettelutyökalut, kerrokset, Kuva, Tatti, Muutos ajassa, Liike, viitattavat ominaisuudet (`VERTAILU.md` kohdat 5–7).
- Appi-appi 0: nimenvaihto, kansio `appiappi/`, tiedot siirtyvät.
- Appi-appi 1: kamera seuraa palikkaa, kuollut alue, pehmeys, maailman rajat, rullaus kaikkiin suuntiin, parallaksi molempiin suuntiin.
- Appi-appi 2: Liike liikuttaa suoraan palikkaa, esteet (palikka tai kerros 🧱, laatikko/ympyrä, liukuu reunaa pitkin), alueet (sisällä, astuttu, poistuttu).
- Appi-appi 3: hahmo: ohjaus tatti / napautus kohteeseen / auto, huippunopeus, kiihtyminen ja jarrutus käyrällä, liukkaus, kääntyy kulkusuuntaan tai peilaa; ominaisuudet kierto ja peilattu.
- Appi-appi 4: kuvasarja-animaatio Kuva-palikkaan (kuvat, nopeus, pyörii aina / kun liikkuu / kun nuolen ehto pätee).
- Appi-appi 5: ruudukko kerroksen ominaisuutena (ruutukoko, tihennys, kohdistus, näkyvyys), napautus ruudun keskelle, Alue ruutu kerrallaan ja napautus alueeseen, ominaisuudet ruutux/ruutuy.
- Appi-appi 6: reitit (Emilin toive): Reitti-palikka piirretään napauttamalla, Liike kulkee sitä kerran / edestakaisin / kierroksia, käynnistä- ja pysäytä-tapahtumat.
- Appi-appi 7 (16.10., tekoälyn ehdotus): reitinhaku. Liike → Napautus → *Kiertää esteet*: hahmo kiertää seinät lyhintä reittiä, ruudukolla ruutujen keskeltä. Jos kohteeseen ei pääse, menee lähimmäksi ja logiikkaan *ei pääse* = kyllä. Oletuksena pois, vanhat projektit ennallaan.
- Appi-appi 8 (16.10., Emilin päätös): liike ruutu kerrallaan. Liike → Ohjaus Ruutu: nuolinapit (kohdat ylös/alas/vasen/oikea), tatti pidettynä tai pyyhkäisy; hahmo liukuu ruutuun (iso nopeus = hyppy), seinä estää (törmäsi), tapahtuma askel valmis.
- Korjattu samalla: Napautus kohteeseen jäi jarrutettaessa joskus alle 0,5 px päähän kohteesta; nyt perillä = täsmälleen kohteessa (ruudun keskellä).
- Appi-appi 9 (16.10., Emilin päätös: yleiskäyttöiset palat): kerrokset käytössä (⚙ kerrosriviltä: näkyy käytössä, estää alempien käytön, himmennä alemmat, läpinäkyvyys; Kerros-palikka logiikkaan, jolla nuoli, kaava tai toiminto avaa, sulkee ja pitää kerroksia näkyvissä), Sekuntikello, Monitori (luku, palkki, pylväs, rengas, kaari, pisteet; luku, aika tai prosentti) ja efektit Teksti ilmestyy, Kuva vaihtuu, Animaatio ja Näkymänvaihto (myös ketjun ulkopuolella). Ennätys ei saanut omaa toimintoa: Muisti + SUURIN/PIENIN-ikkuna + Aseta riittää, ja ikkuna ohittaa nyt tyhjät.
- Appi-appi 10 (16.10., Emilin päätökset: kaikki suositukset): zoomaus käytössä. Maailma ja kamera → Zoomaus: *Sormilla* (kahden sormen nipistys, tietokoneella ⌘ + rulla), pienin ja suurin % (oletus 50–300). Kamera-palikka logiikkaan (napista *Ohjaa logiikasta* tai paletista): ominaisuus zoomaus %, lisäksi näkyvä leveys ja korkeus; nuoli, kaava, Aseta, Palauta ja Muutos ajassa (pehmeä zoomaus). Nuoli lukitsee sormet, Aseta ei. Sormet zoomaavat sormien kohdalta, seuratessa hahmo pysyy keskellä; logiikan zoomaus pitää ruudun keskikohdan. Kojelauta (lukittu kerros) ei zoomaudu. Napautus kohteeseen, alueet ja kuollut alue toimivat zoomattuna. Ilman Kamera-palikkaa sormien zoomaus palaa 100 %:iin alkukohdassa.
- Appi-appi 11 (16.10., suunnitelman P0 + P1a): **F01** tekstiin `{palikka.ominaisuus}` (esim. `{otsikko.näkyy}`, `{pisteet.arvo}`), sama arvo kuin kaavassa; ＋ Viittaus kysyy palikan jälkeen *Arvo* tai ominaisuuden; nimen vaihto ei riko. **D08** viitatun palikan poisto: Delete / Poista näyttää ensin, missä palikkaa käytetään (Peru tai Poista silti; viittaamaton poistuu heti). Poiston jälkeen viittaukset jäävät: ⚠-merkki logiikan palikassa ja näkymän palikassa, teksti ”⚠ kohde poistettu: nimi”, kaavassa `⚠nimi`, Palikat-napissa ⚠-luku ja listassa Viitevirheet. Rivistä palikkaan, jonka paneelista valitaan uusi kohde. Samanniminen uusi palikka ei peri poistettua. Ketju pysähtyy virheeseen, jos toiminnon tai ehdon kohde on poistettu. Kumoa palauttaa kaiken.
- Appi-appi 12 (16.10., suunnitelman P1b, päätökset D09–D10): **ketjun kolme lukitustilaa.** Ketjun paneeli → Tila → *Lukitus*: 0 Ajantasainen, 1 Lukitse ulkopuolisilta muutoksilta, 2 Lukitse kaikilta muutoksilta. Lukitus koskee vain lukemista: toiminnot muuttavat aina oikeaa tietoa. Tila 1 lukee lukitushetken arvot ja ketjun omat muutokset (myös sen käynnistämän aliketjun ja vaiheen tapahtumanuolista seuraavat), tila 2 vain lukitushetken arvot; lukittuna myös ketjun rakenne (vaiheet, kesto, arvot) on lukitushetken. Ominaisuudet `harjoitus.lukitus` (ohjattava: nuoli, kaava, Aseta, Lisää, Palauta) ja `harjoitus.lukitusnimi`. Ohjaus luetaan aina ajantasaisena; vaihto tulee voimaan seuraavan vaiheen alussa ja ottaa uuden kuvan siitä hetkestä, alkanut vaihe jatkuu. Muu kuin 0, 1 tai 2 on näkyvä virhe (tarkistus, ilmoitus, ketju pysähtyy). Paneeli näyttää suorituksen tilan, kuvan kellonajan ja erot ”ketju: 2 · nyt: 5”; sama Miksi?-selityksessä. Aseta → lukitus -toiminnossa nimivalikko. Toista, ajastimet, odotus ja Pysäytä toimivat kaikissa tiloissa. Kuva säilyy tallennuksen, viennin ja tuonnin yli; jos se puuttuu, ketju pysähtyy eikä jatka salaa ajantasaisena.
- Samalla: ajantasaisessa ketjussa kesken poistettu odottava vaihe pysäyttää ketjun virheeseen (ennen haara loppui hiljaa).
- Appi-appi 13 (16.10., suunnitelman P2; Emilin linjaukset: valittu ja tapahtuman rivi, oma palikka, näkyvyys viitteillä): **tietotaulukko ja tapahtuman tiedot.** Logiikan paletti → Tieto: *Tietotaulukko* (sarakkeet paneelista: teksti, luku, kyllä/ei, päivämäärä, ajankohta, valinta, riviviite; *Avaa taulukko…* = rivien muokkaus, väärä arvo punaisena eikä kirjoitettu) ja *Tapahtuman tiedot* (viite `tapahtuma`: `.uusi`, `.vanha`, `.lähde`, `.aika`, `.rivi`, `.rivi.<sarake>` …). Toiminnot *Lisää rivi* (kentät kaavoina, tilannekuva), *Valitse rivi*, *Poista rivi*; Aseta, Lisää, Vaihda ja Tyhjennä sarakkeeseen valitulla tai tapahtuman rivillä. Kaavassa `taulu.valittu.määrä`, `taulu.määrä.keskiarvo`, `.havaintoja`, `.puuttuvia`; tyhjä kenttä on puuttuva (ei 0), lasku sen kanssa tuntematon, koosteet ohittavat sen. Tapahtuman tiedot säilyvät ketjun odotusten ja sulkemisen yli; käytössä taulukko muuttaa kopiota, lähtöaineisto säilyy (Tyhjennä käyttötiedot palauttaa sen). Yksityiskohdat: `suunnitelmat/01-tieto-ja-tapahtumat.md` kohta 9.
- Emilin päätökset 16.10. (Appi-appi 13:n jälkeen): koosteet säilyvät taulukon ominaisuuksina (`taulu.määrä.summa`) myös P3:n ikkunakoosteiden rinnalla; Lisää rivi -kentät pysyvät kaavoina (teksti lainausmerkeissä); taulukolle ei vielä tehdä omia tapahtumia (rivi lisätty, valinta vaihtui); Lisää puuttuvaan kenttään alkaa nollasta ja Vaihda puuttuvasta antaa kyllä (nykyinen toiminta pysyy, tekoälyn suositus).
- Tallennus: valinnaiset kentät `pois` (Appi-appi 11), ketjun `lk` ja ajotilan `lk`, `snap`, `own`, `par` (12) sekä palikat `taulu`, `tapaht`, toiminnon `sk`, `rl`, `rs`, `kv`, `vl`, `kierto` ja ajotilan `ev` (13; README). Versio edelleen 8; vanhat projektit avautuvat ennallaan.
- Testattu vain tietokoneen Chromiumissa (kosketus ja nipistys CDP:llä 390 ja 320 px, Appi-appi 11–13 tietokoneella 1440 ja 1280, Appi-appi 13 myös puhelinleveyksillä), ei oikealla iPhonella, iPadilla eikä Safarilla.

## Seuraavaksi

- **Kehityssuunnitelma:** `SUUNNITELMA.md` ja `suunnitelmat/`; toteutuma rekisterin alla. P0 ja P1a tehty (Appi-appi 11), P1b (12), P2 (13). **Seuraava kierros: P3**, rivikohtainen laskenta, kokoelman käsittely (suodatus, järjestys, ikkunakoosteet) ja toistuva esitys (`suunnitelmat/01` kohta 3 ja `03-kayttopinta.md` F05).
- Emil kokeilee tietokoneella: Tietotaulukko (sarakkeet, Avaa taulukko…, tyhjä kenttä ja koosteet paneelissa), Lisää rivi -toiminto painikkeesta ja Teksti `{taulukko.valittu.nimi}`, Valitse rivi → seuraava, Tapahtuman tiedot ketjussa (esim. painike → ketju: Ajastin → Aseta Muisti = kaava `tapahtuma.uusi`). Aiemmat: ketjun Lukitus (esim. Ajastin → Aseta Lue = Laskuri; ▶, muuta Laskuria odotuksen aikana ja katso paneelin ero ja lopputulos tiloissa 0, 1 ja 2), ominaisuus tekstiin (＋ Viittaus), viitatun palikan poisto, Viitevirheet ja uusi kohde. Puhelimella: zoomaus sormilla (ruudun ja maailman tuntuma, kojelauta pysyy), valikko kerroksena (painike → Vaihda → kerros näkyy), Sekuntikello Monitoriin, efektit.
- Myöhemmin: esimerkkiprojekti (esim. labyrintti) vain pyynnöstä.

## Avoimet kysymykset

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
- Ei tarkistettu oikealla iPhonella: nipistys oikeilla sormilla ja Safarin oma sivun zoomaus (estetty `gesturestart`-tapahtumalla ja `touch-action`illa, testattu vain Chromiumissa), valikkokerroksen suoja sormella, efektien sujuvuus Safarissa (Web Animations ja erilliset translate/scale/rotate vaativat iOS 14.1+), monitorin päivitys kuvasilmukassa ja akun kulutus käyvällä sekuntikellolla, pyyhkäisy sormella (testattu hiirellä), reitinhaun nopeus isossa maailmassa, tatti ja napautus sormella, kuvasilmukan sujuvuus ja akun kulutus jatkuvassa liikkeessä, isot kuvasarjat.

- Appi-appi 11: poistetun palikan nuolet ja koristeviivat poistuvat sen mukana (eivät jää roikkumaan); vaikutuslista kertoo ”nuoli poistuu”. Käykö?
- Appi-appi 11: ennen palikkaa kirjoitettu kaavan viite (`{?nimi}`) löytyy yhä automaattisesti, kun palikka tehdään, ja vanhojen projektien aiemmin poistetut kaavaviitteet samoin. Vain tästä eteenpäin poistetut eivät sitoudu samannimiseen.
- Appi-appi 11: logiikan Toiminnolla ei voi poistaa palikkaa, joten suunnitelman ”vahvistus tarvitaan” -paluuarvoa ei rakennettu. Liittäminen toisesta projektista poistaa vieraat viittaukset kuten ennen.
- Appi-appi 11 ei tarkistettu: Miksi?-selitys tekstin ominaisuusviitteelle, monivalintapoisto selaimessa (moottoritesti on), poisto puhelin- ja iPad-näkymän rakentajassa, ⚠-merkin sijainti hyvin pienissä palikoissa.

- Appi-appi 12: tilassa 2 toiminnon *arvo* tulee lukitushetkestä, mutta Lisää, Vaihda, Valitse ja Lisää rivi käyttävät kohteen nykyistä arvoa (muuten kaksi Lisää 1 -vaihetta tekisivät yhteensä 1 ja muiden kirjoitus hävisi). Käykö?
- Appi-appi 12: saman ketjun kahta kierrosta ei voi olla käynnissä yhtä aikaa (ketju joko ohittaa uuden käynnistyksen tai aloittaa alusta). Suorituskohtaisuus koskee eri ketjuja ja uutta kierrosta. Tarvitaanko rinnakkaisia kierroksia?
- Appi-appi 12: jos ketjun yksi haara vaihtaa tilan, rinnakkaisen haaran jo alkanut *Odota, kunnes* -ehto lukee sen jälkeen uutta tilaa (ajastimet ja efektit eivät muutu). Tapahtuman mukana kulkevaa tietoa (D05) ei vielä ole, joten sitä koskeva koe tehdään P2:ssa.
- Appi-appi 12: lukukuva tallentuu projektiin niin kauan kuin lukittu ketju on käynnissä, eli rakenne on tallennuksessa kahdesti (kuvatiedostot eivät, ne luetaan aina nykyisinä). Ero-luettelo laskee paneelin ollessa auki kaikki arvot kahdesti: nopeutta isossa projektissa ei tarkistettu. Miksi? näyttää eron ketjun paneelissa, ei luetun palikan omassa.
- Appi-appi 12 ei tarkistettu: lukitus puhelin- ja iPad-näkymän rakentajassa, pitkä lukittu odotus oikeassa käytössä (sulje ja avaa appi kesken).

- Appi-appi 13 (rajaus, ei kysymys): `tapahtuma.rivi.<sarake>` etsii sarakkeen sen viitteellä, koska taulukko selviää vasta tapahtumasta. Jos sarakkeen viite vaihdetaan, tällainen kaava antaa virheen (joka luettelee sarakkeet) ja se korjataan käsin. Taulukon omat kaavat (`taulu.valittu.…`) eivät katkea. Emil ei vielä tarvinnut tätä; korjataan, jos tulee vastaan.
- Appi-appi 13 ei tarkistettu: sarakkeen lajin vaihto ja sarakkeen poiston varoitus selaimessa (moottoritestit on), riviviitesarakkeen valinta taulukkoikkunassa, ajankohta-sarake käsin kirjoitettuna, taulukko lukitussa ketjussa käytössä (moottorikoe on), iso taulukko (satoja rivejä) ja sen nopeus, puhelin- ja iPad-näkymän rakentaja muuten kuin taulukkoikkunan mahtuminen.

## Suunnitelmat

- **16.10.2026, missio ja manuaalin tehtävänanto:** `MISSIO.md` kokoaa Emilin kuvaaman tarkoituksen, arvot ja kehitysehdotusten arviointitavan. `suunnitelmat/08-manuaalin-tehtavananto.md` määrittelee tulevan kattavan ihmiselle ja tekoälylle sopivan manuaalin rungon, lähteet, tarkistusmenettelyn ja hyväksymiskriteerit. Varsinaista manuaalia ei tehty. Agenttien lukupolku ja yhteiset periaatteet päivitettiin. Vain Markdown-dokumentaatio muuttui; sovelluskoodia ja testejä ei muutettu eikä sovellustestejä ajettu.

## Emilin kommentit

- (tyhjä)

Arkisto (Pajakone-rivi, ei enää päivitetä): https://app.notion.com/3fa977255eec812f943afd1d8705083e


