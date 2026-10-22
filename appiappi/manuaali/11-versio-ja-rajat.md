# Versio ja tunnetut rajat

## Tarkistettu versio

- **Appi:** Appi-appi 115, tallennusversio 12 (`VER`), repo `Kasibanaani/P-iv-kartta`, kansio `appiappi/`.
- **Kirjoitettu:** 17.10.2026 koodista commitilla `77461d2` (Appi-appi 31). Sen jälkeen jokainen rakentaja on päivittänyt muuttuneet kohdat samassa työssä; versiokohtaiset tiedot ja mitä kussakin tarkistettiin ovat `appiappi/MUUTOKSET.md`:ssä. **Viimeksi tarkistettu:** linjakkuuskartoitus 15 (22.10.2026, Appi-appi 115). Appi-appi 90:stä lähtien rakentajat eivät päivitä manuaalia, vaan kirjoittavat *Manuaaliin:*-rivin `MUUTOKSET.md`:hen, ja joka 10. kohdan kartoitus päivittää manuaalin kerralla; manuaali voi siis olla enintään kymmenen versiota jäljessä. Kartoitus 13 kokosi versiot 91–94; kartoitus 14 versiot 95–105 (luku 2: paletin Näkymässä, pistokkeet, auki olevan yleispalikan siirto, Kumoa, Rakennuslaatikko; luku 3: Lista, etusija, Laattakartta; luku 4: Sääntö ♛, nimi itsestään, Kello ja Päivä, ryhmän luku ja ikkuna; luku 5: Maalaa laatta; luku 6: `nyt.aika`, `klo`, päivän osat; luku 7: tapahtuman `laji` ja `kuka`; luku 8: Laatat pelissä, kamera; luku 10). Kartoitus 15 versiot 106–115 (luku 2: Rakennuslaatikon Kuolema-alue, Avain ja ovi, Portti, pelaaja, ＋ Piirrä uusi palikka, hyllyn nimi; luku 3: osio Ilme, `.nimi`, `.ilme`, Kuvan Piirros, Lista ryhmästä, rivijäsen, Tee palikaksi; luku 4: Kello `= nyt.aika`, `kuuluu, kun`, `.rasti`, ryhmän ikkuna `#`-kirjoituksella ja ⚡-toisinnot; luku 6: tekstin osat, `nimi`; luku 7: `tapahtuma.kohde = @x.nimi`; luku 8: Piirtoikkuna ja piirroskirjasto, Pikselitarkka, laattalajin piirros ja nimenvaihto; luku 9: uudet kentät; luku 10).
- **Miten tarkistettiin:** jokainen luku on kirjoitettu lukemalla käyttöliittymän ja moottorin koodia (nimet suoraan koodin merkkijonoista) sekä testien kuvauksia. Kaavakielestä ajettiin noin 150 kaavaa moottorilla (Node), ja maailman ja liikkeen kaavanimet tarkistettiin samoin. Aloitusluvun esimerkki *Vesilasit* tehtiin vaihe vaiheelta oikeassa käyttöliittymässä (Chromium, 1440 px). Muiden lukujen reseptejä **ei ole ajettu** selaimessa: ne on koottu koodista.
- **Ei tarkistettu oikealla iPhonella, iPadilla eikä Safarilla.** Puhelinkäyttö on kuvattu koodista ja testeistä, jotka ajavat kosketusta tietokoneen selaimessa 390 ja 320 px leveänä. Oikean laitteen tuntuma (sormella veto, näppäimistö, Safarin oma zoomaus) on varmistamatta.
- Kohdat, joita kirjoittaja ei voinut varmistaa, on merkitty tekstiin ”(ei tarkistettu)”.

## Koko ja keveys

Mitattu Appi-appi 51 (jonon 1p, 18.10.2026) pilvikoneen Chromiumissa 1440 px, ei Emilin tietokoneella: luvut ovat suuntaa, suhteet pätevät. Raportti `kartoitukset/2026-10-18-keveys.md`.

- **Lukitussa käytössä ruudun ulkopuoliset palikat eivät maksa piirrossa.** Palikka piirretään, kun se tulee näkyviin. Siksi iso maailma (satoja seiniä) pysyy sujuvana, kunhan ruudulla kerralla näkyy kohtuullinen määrä. Headmaze + 750 seinää (886 näkymäpalikkaa): 41 kuvaa/s (ennen 7).
- **Paikallaan pysyvä palikka on halpa este.** Palikka, jonka paikkaa ja kokoa ei ohjata (nuoli, kaava, Aseta tai Liike), luetaan suoraan; törmäys tarkistetaan vain liikkujan lähellä olevista esteistä. Ohjatut palikat lasketaan joka kuvassa.
- **Kaikki näkyvissä olevat palikat piirretään joka kuvassa,** kun jokin liikkuu. Satoja palikoita yhtä aikaa ruudulla hidastaa. Muokatessa näkymä piirretään aina kokonaan.
- **Logiikka-välilehti käytön aikana** (Rinnakkain) päivittyy 200 ms välein, ja vain muuttuneet palikat piirretään uudelleen.
- Lataus 0,3 s ja muisti 10–35 Mt Headmazen kokoisella projektilla; tiedoston koko ei ole ongelma.
- Pysyvä testi `testit/selain_91_keveys.py` (tekoprojekti: 400 seinää, tatti, seuraava kamera, ~130 logiikkapalikkaa) pitää rajat: vähintään 30 kuvaa/s, moottori alle 8 ms kuvassa, logiikan uudelleenpiirto alle 15 ms.
- **Joukon säännöt** (Appi-appi 66): sääntö ilman `jäsen`-sanaa ja nuoli Joukko-palikan kohtaan lasketaan kerran koko joukolle, `jäsen`-sääntö jäsentä kohden samassa laskennassa. *Näkyy kun* -sääntö ei pakota paikan täyttä laskentaa. Mitattu: 400 seinää joukon jäseninä, säännöt *näkyy kun* ja *siirto x* (`jäsen.x`, `jäsen.y`): moottori 10,6 → 5,1 ms kuvassa (ilman sääntöjä 1,6–2 ms), 59 kuvaa/s. Sama tapaus on pysyvässä keveystestissä, rajana 4,5 × saman ajon moottoriaika ilman sääntöjä (suhteellinen, koska testikoneet eroavat: hitaammalla koneella samat säännöt mitattiin 9–12 ms).

## Manuaalin ylläpito

Rakentaja ei muokkaa manuaalia (Emil 19.10.2026; `AGENTS.md` ja `PALIKKASAANNOT.md` A15), vaan kirjoittaa `MUUTOKSET.md`:hen versionsa alle rivin *Manuaaliin:* (mitä lisätään, muutetaan tai poistetaan, missä luvussa). Joka 10. jonon kohdan linjakkuuskartoitus kokoaa rivit ja päivittää manuaalin kerralla:

1. Muuta vain muuttunut kohta: palikan merkintä palikkakaavalla (mitä tekee, löytyy, sisään, ulos, asetukset, ominaisuudet, kaavassa, aika ja tila, esimerkki, huomio).
2. Uusi palikka: merkintä oikeaan lukuun ja rivi [hakemiston](10-hakemisto.md#palikat) palikkataulukkoon; erikoispalikka ✦:llä.
3. Muuttunut nimi tai syntaksi: korjaa kaikki maininnat (`grep -rn 'vanha nimi' appiappi/manuaali/`).
4. Päivitä tämän luvun *Tarkistettu versio* -kohtaan uusin Appi-appi-numero ja kartoitus. **Korvaa edellinen, älä lisää perään.**
5. Suunniteltu, ei vielä toteutettu: ei kuulu manuaaliin.

## Havainnot

Kirjoittaessa löytyneet ristiriidat, puutteet ja yllätykset. Nämä eivät ole käyttöohjetta vaan kehityksen muistilista: kehitysehdotuksia ei ole toteutettu, ja osa on jo `TILA.md`:n avoimissa kysymyksissä. Kun havainto korjataan, poista se tästä.

### Työympäristö

- Puhelimella alapalkin paneelinappi on nimeltään ”Asetukset: palikan nimi”, ja yläpalkissa on lisäksi ”Asetukset”, joka avaa aivan eri ikkunan. Sama sana kahdelle asialle voi hämätä.
- Näkymää ei voi poistaa eikä siirtää välilehtirivillä; nappia ei ole. Näkymän nimeäminen onnistuu vain kaksoisnapautuksella, eikä sitä ole todennettu oikealla iPhonella.
- Näkymän muokkauksessa ei ole kahden sormen zoomausta (vain logiikkakanvaasilla ja lukitussa laitenäkymässä). Safari voi silloin zoomata koko sivua (ei tarkistettu).
- Monivalinta vaatii ⇧-näppäimen, joten puhelimella monta palikkaa saa valittua vain kerroksen ⬚-napista (näkymä). Logiikassa puhelimella ei ole monivalintaa lainkaan; silloin myös monen palikan kopiointi ja presetin tallennus monesta logiikkapalikasta on mahdotonta sormella.
- Kopioi ja liitä näkymässä ei vie palikoiden logiikkaa mukanaan (vain näkymäpalikat); logiikan saa mukaan presetillä.
- Logiikan paletin ohje sanoo ”Vedä nuoli palikan oikeasta reunasta toisen vasempaan reunaan”, mutta ketjun tapahtumissa kohdat ovat ylä- ja alareunassa.
- Kumoa ei palauta käyttötietoja; *Tyhjennä käyttötiedot* on siksi lopullinen (varmistuskysymys kertoo vain, että rakenne säilyy).
- Lukitussa käytössä näkymävälilehdet näkyvät aina, kun näkymiä on vähintään kaksi; niitä ei voi piilottaa appin käyttäjältä (ei tiedetä, onko tarkoituksellista).
- Pikakatselu ja paletin vihjeet ovat vain tietokoneella; puhelimella palikan tarkoituksen näkee vasta, kun se on lisätty (logiikkapalikoilla paneelissa).

### Näkymäpalikat

- Tatin, Kuvan ja Monitorin paneelissa tekstikenttä on ilman otsikkoa (tekstin otsikkoluettelossa ei ole näitä lajeja). Tatissa teksti ei näy missään, vaikka kenttä ja kohta *teksti* ovat olemassa.
- Tatilla on kohdat *harmaana kun*, *teksti* ja *vaihtoväri kun*, mutta piirto ei näytä tekstiä. Vaihtovärin ja harmauden vaikutusta tattiin ei tarkistettu.
- Kaavio ei käytä Luvut-palikoiden värejä eikä paneelissa voi antaa sarjalle omaa nimeä, vaikka tietorakenteessa on kenttä nimelle (`sarjat[].n`).
- PALIKKASAANNOT.md:n mukaan Toistimelta puuttuvat *harmaana kun*, *vaihtoväri kun* ja siirto ilman syytä (L5, ”osin korjattava”).
- Muokkaustilassa piilotettu palikka näkyy haaleana, mutta harmaan palikan himmennys näkyy myös muokatessa (CSS). Ei tarkistettu, miltä tämä näyttää kaikilla lajeilla.
- Puhelimen paletin vihjettä (✦-syy) ei näe; syy näkyy vasta paneelissa (TILA.md).
- Kaikki käyttöliittymäkuvaukset on luettu koodista ja testiluettelosta; mitään ei ajettu tätä lukua varten, eikä mitään ole tarkistettu oikealla iPhonella.

### Logiikkapalikat

- JOS, KUN (ilman tapahtumanuolta), JOS-ikkuna ja nuoli arvosta tapahtumakohtaan eivät laukea, jos ehto on jo tosi heti alussa (avaus, uusi palikka). Tämä on koodin mukainen, mutta käyttäjälle ehkä yllättävää; paneelien ohjeteksteissä sitä ei mainita.
- SUMMA-ikkuna laskee tekstin hiljaa nollaksi ja kyllän ykköseksi; Lasku taas antaa tekstistä tekstiliitoksen tai virheen. Ero ei näy paneelissa.
- JA-ikkuna ilman sisältöä on *ei*, EI MIKÄÄN ilman sisältöä *kyllä*. Ei mainita paneelissa.
- Yleispalikka (Appi-appi 90): pelkkä sana (`valmis`) on tekstiä, vaikka samanniminen viite olisi olemassa; viitteeksi se tulee `@`:lla. Kelvollinen lasku ilman `=`-merkkiä (`15 + 15`) on kaava kuten paneelin arvokentissä. Ketjun sisällä kirjoitusosa ei aukea palikan kohdalle (paneeli toimii). Pelkkä `@nimi` tai `#nimi` omalla rivillä on jäsenlinkki (Appi-appi 93); arvo yksinään luetaan `= @nimi`. Nimi tulee kirjoituksesta (Appi-appi 97, luku 4).
- **Sääntö ja `=`:** `@b = 3` yksinään on vertailu (Kaava), `jos … niin @b = 3` ja `kun … niin @b = 3` asettavat (Sääntö). Lajimerkki ♛ ja *→ B* palikassa kertovat, kumpi on kyseessä.
- **Kartoitus 15 (korjataan, jono 1z):** ryhmälistan rivi, jonka jäsen laskee kaavalla, on muokattavissa ja muokkaus korvaa kaavan pysyvästi; Arvo-jäsenen muokkaus käytössä on rakenteen muutos (Palauta ei palauta). Jäsenen ilman `.rastia` rasti ja muokkaus eivät tee mitään eivätkä kerro miksi; säännön ohjaama rasti ei kerro ♛:tä. Rivijäsenellä ei ole tekstin osia koosteissa (`#x.päivä.pienin` ohittaa sen). `#x.kello.pienin` näkyy sekunteina. Piirroksen nimen vaihto ei päivitä `ilme`-kaavoja. `@x.nimi.sanoja` on virhe, vaikka `.päivä.viikonpäivä` ketjuuntuu.
- Päätöspuu (Appi-appi 88): siirtymä vedetään pisteestä ◦ eikä pistokkeesta, ja ↔ on vain päätöspuussa (hyväksytty poikkeus, suunnitelma 28). Käytössä lista järjestyy palikoiden paikan mukaan (ylhäältä alas), ei siirtymien järjestyksen: järjestys muutetaan siirtämällä nappia muokatessa. Eri vaihtoehdosta eri suuntaan (siirtymä suoraan kysymyksen vaihtoehdosta) ei ole rakennettu.
- Muutos ajassa: ei tarkistettu, lähteekö *valmis*, jos kulku loppuu appin ollessa kiinni (moottori huomaa sen todennäköisesti seuraavassa kuvassa avattaessa).
- Avoimet kysymykset TILA.md:stä, jotka koskevat tätä lukua: pelkät sulut kaavassa (ei sallittu), KESKIARVO/SUURIN/PIENIN ohittavat tyhjät (vanhan projektin keskiarvo voi muuttua), kerroksen rullausvauhtia ja järjestystä ei voi ohjata, Kameralla vain zoomaus.

### Toiminnot ja ketjut

- **Pois käytöstä oleva haarautuva vaihe:** moottori ohittaa sen jatkamalla kohdasta *e*. Ehdossa se on *kyllä*-haara (pois käytöstä oleva Ehto vie aina kyllä-haaraan), Toistassa *kierros*. Arvalla ja Monta haaraa -palikalla *e*-lähtöä ei ole, joten haara päättyy. Paneelin huomautus sanoo vain ”ketju jatkuu sen ohi”. Luettu koodista, ei testattu.
- **Arpa:** paneeli tarjoaa 2–6 vaihtoehtoa, moottori hyväksyy 2–9 (esim. tuodusta projektista).
- **Ketjun palikat ketjun ulkopuolella:** vain Ajastimen paneeli varoittaa (”Ajastin toimii ketjun sisällä”). Ehto, Odota, Arpa, Toista, Monta haaraa, Ketjun tulos ja Lopeta ketju eivät tee ketjun ulkopuolella mitään; varoitusta niistä ei löytynyt (ei tarkistettu selaimessa).
- **Näytä ilmoitus** tyhjällä tekstillä ja ilman arvoa näyttää koodin mukaan ”–” (ei tarkistettu selaimessa).
- Koodikommentti palikkamäärittelyssä sanoo efektien olevan ”tulevia, toteutus myöhemmin”, mutta kaikki neljä on toteutettu ja ne ovat paletissa (lista *Tulossa myöhemmin* on tyhjä). Vanhentunut kommentti, ei näy käyttäjälle.
- Ketjun paneelin valikossa Toista näkyy nimellä ”Toista N kertaa”, vaikka palikalla on myös tapa *riveille*.

### Kaavat

1. **Teksti `"ei"` on ehtona tosi.** `jos ("ei") 1 muuten 2` = 1, koska ei-tyhjä teksti pätee. Avainsana `ei` ilman lainausmerkkejä toimii oikein. Helppo virhe, kun Tekstikentän sisältöä käytetään ehtona.
2. **Pilkku desimaalina ja erottimena:** `1,5,2` ja `jos (a) 1, 2` antavat ohjeen *pilkku on desimaalimerkki*; `2,5` on luku. Ennen Appi-appi 55:tä virhe oli funktion ulkopuolella *tuntematon merkki*.
3. **Tyhjä ohjaus ohittaa toiminnon asettaman arvon:** kun ominaisuus on ohjattu nuolella ja kaava antaa tyhjän, käytetään perusarvoa, ei toiminnon asettamaa. Ominaisuudet-osion ohjeteksti kuvaa etusijan ilman tätä poikkeusta.
4. **Ohjeen sana "tyhjä" vs. puuttuva:** kaavan ohjeteksti ei erota tyhjää (laskussa 0) ja taulukon puuttuvaa (laskussa tuntematon); ero näkyy vain tuloksissa.
5. **Arvokentän kaksoispiste (Appi-appi 83):** arvokenttään kirjoitettu `Pisteet: @pisteet` on kaava, jossa kaksoispiste on jako (tulos näkyy kentän alla, esim. `= 1`). Teksti arvon kanssa: `"Pisteet: " + @pisteet`. Vanhat tallennetut tekstit viitteineen pysyvät tekstinä.
6. Ei tarkistettu selaimessa tässä luvussa: ehdotusrivin ja valikoiden tarkka ulkoasu puhelimella; kuvaus perustuu koodiin. Moottorin tulokset on ajettu nodella.

### Tieto

- Taulukkoikkunan valitun rivin sarake (●/○) näkyy vain, kun käyttötietoa on ja **Käyttötieto nyt** on valittuna. Uudessa taulukossa rakentaja ei voi valita riviä ikkunasta lainkaan; ohjeteksti ei kerro tätä.
- Sana *joukko*: Rivijoukon oletusnimi on Appi-appi 60:stä *Suodatus* (viite `suodatus`), joten paletissa *Joukko* tarkoittaa vain palikoiden joukkoja `#nimi`. Vanhoilla Rivijoukoilla voi yhä olla nimi *Joukko* ja viite `joukko`; kaavassa `#` erottaa ne.
- Rivijoukon paneelin ja ominaisuusrekisterin (`joukkoProps`) listassa on vain `eka.<sarake>`, mutta kaava hyväksyy myös `joukko.vika.<sarake>`. Tietotaulukon rekisterissä molemmat ovat.
- Toistimen paneelin `Toistin`-help puhuu "kentän voi sitoa sarakkeeseen kentän paneelista"; kortin palikan paneelissa osion nimi on **Kortissa**, tavallisen kentän **Rivin sarake**. Kaksi eri osionimeä samalle sidonnalle.
- MUUTOKSET (Appi-appi 21) mainitsee "kalenterin päivän napautus kortissa (Toistin)", mutta Kalenteri ei ole korttiin kelpaavien palikoiden listalla (`TST_OK`), joten se ei liity kortin malliin. (ei tarkistettu selaimessa)
- Taulukolla ei ole omia tapahtumia rivien muutoksille (rivi lisätty, valinta vaihtui): Emilin päätös 16.10., ei puute. Lähteen haun tapahtumat haettu ja hakuvirhe ovat jonon 9 suunnitelman mukaisia.

### Maailma ja liike

- **Alkukohta laitenäkymässä:** Sijainnin paneelissa näkyy valintaruutu **Näkymän alkukohta** myös laitenäkymässä, mutta laitenäkymä aukeaa aina laitteen ruudun alusta (`goStart` ohittaa alkukohdan). Laitenäkymän asetuksissa ei ole Alkukohta-valikkoa.
- **Alueen ohjeteksti:** Alueen paneelin ohje mainitsee vain vapaan näkymän rullauksen **Alueen sisällä**; laitenäkymässä vastaava on **Maailman rajat** (Maailma ja kamera), jota ohje ei mainitse.
- **Paletin vihje vanhentunut:** Liike-palikan paletin vihje neuvoo viemään x:n ja y:n kohtiin siirto x ja siirto y, vaikka nykyinen pääreitti on **Liikutettava palikka** (jolla esteet, alueet ja törmäykset toimivat).
- Ei tarkistettu: liikkeen eteneminen muokkaustilassa (koodi ei estä kuvasilmukkaa muokatessa, mutta muokkaus näyttää perusarvot). Käyttäjälle kerrotaan: kokeile lukittuna.
- TILA.md:n avoimet kysymykset tästä alueesta: Tatin y positiivinen alaspäin; siirto x/y ja ominaisuus x/y rinnakkain; reitinhaku vain Napautukselle eikä reittiä näytetä; ruutuliikkeessä ruutua ei varata eikä napautus viereiseen ruutuun ohjaa; `ruutu.leveys` vs `kamera.leveys`; napautus sormen noustessa kun zoomaus on päällä; Kamera-palikka ohjaa vain zoomausta; kerroksen rullausvauhtia ja järjestystä ei ohjata logiikasta; massan impulssimalli yksinkertainen (ei pyörimistä); kimmoisuus myös massattomalle seinäosumalle; painovoimaa ei ole.

### Tallennus

- **Tallenna nyt automaattisen tallennuksen ollessa pois** tallentaa avoimen projektin ja sen jälkeen yhden muun tallentamattoman projektin (koodi kutsuu `ghFlush` kerran onnistumisen jälkeen). Ohjeteksti puhuu vain avoimesta projektista. Pieni epäjohdonmukaisuus.
- Koodin kommentti GitHub-osion alussa puhuu kansiosta `pajakone/<id>.json`, mutta todellinen kansio on `appiappi/` (`GHDIR='appiappi'`). Vain kommentti on vanhentunut.
- `mem`-kenttää ei käytetä koodissa muualla kuin luonnissa, korjauksessa ja tyhjennyksessä; se näyttää vanhalta jäänteeltä (ei tarkistettu tarkemmin).
- Yhden projektin vienti (`projects:[…]`) ja GitHub-tiedosto (`projekti:{…}`) ovat eri muotoisia. Molemmat tuodaan oikein, mutta tekoälyn kannattaa kirjoittaa aina GitHub-muoto.

