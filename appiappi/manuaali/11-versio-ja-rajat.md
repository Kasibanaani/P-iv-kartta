# Versio ja tunnetut rajat

## Tarkistettu versio

- **Appi:** Appi-appi 44, tallennusversio 8 (`VER`), repo `Kasibanaani/P-iv-kartta`, kansio `appiappi/`.
- **Kirjoitettu:** 17.10.2026 koodista commitilla `77461d2` (Appi-appi 31). Ennen vientiä tarkistettiin muutos Appi-appi 32 (`f2cd3db`: Miksi? kaikille palikoille, VALITSE-palikan oma ohje) ja päivitettiin sitä koskevat kohdat. Appi-appi 33 (testitila Kokeile) lisättiin rakentajan työssä: luvut 2, 9 ja 10, koodin ja testin `selain_74_testitila.py` mukaan. Appi-appi 34 (jonon 1k: ryhmän viite, kaavan tuntematon nimi heti, Miksi?-lauseet) lisättiin rakentajan työssä: luvut 2, 4 ja 6. Appi-appi 35 (animointi vaihe 1) lisättiin rakentajan työssä: luvut 2, 3, 9 ja 10, koodin ja testien `logiikka_67_animointi.js` ja `selain_75_animointi.py` mukaan. Appi-appi 36 (rakenteinen historia F08) lisättiin rakentajan työssä: luvut 2, 3, 5, 6, 7, 9 ja 10, koodin ja testien `logiikka_68_historia.js` ja `selain_76_historia.py` mukaan; reseptin *Kirjausappi* kaavat ajettiin moottorilla. Appi-appi 37 (jonon 5: viite-ehdotukset ja Luo Arvo) lisättiin rakentajan työssä: luvut 4, 6 ja 10, koodin ja testien `logiikka_69_luo_arvo.js` ja `selain_77_viite_ehdotukset.py` mukaan. Appi-appi 38 (jonon 1l: `nyt.päivä`, valinnat näkyvällä nimellä, päivämäärä + teksti, Liikkeen kohdat kaavaan, Vertailun sisältää) lisättiin rakentajan työssä: luvut 3, 4, 6, 7, 8 ja 10, koodin ja testien `logiikka_70_kaavan_sanat.js` ja `selain_78_kaavan_sanat.py` mukaan; havainnoista poistettiin korjatut (Kaavat: päivämäärä + teksti, valintojen sisäinen arvo; Maailma: Liikkeen nuolikohdat). Appi-appi 39 (jonon 1m: ƒ Arvo kaavasta, ⌘Z lukittuna, kokeilun raita puhelimella, Arvon Muisti-ohje, Monista ja tuonti ilman vanhaa GitHub-kirjanpitoa, versioteksti) lisättiin rakentajan työssä: luvut 2, 4, 5, 9 ja 11, koodin ja testin `selain_79_tyoymparisto.py` mukaan. Appi-appi 40 (jonon 6: tulkki) lisättiin rakentajan työssä: luvut 2, 7, 9 ja 10, koodin ja testien `logiikka_71_tulkki.js` ja `selain_80_tulkki.py` mukaan; luvun 7 esimerkki (korttipakka) ajettiin selaintestissä. Appi-appi 41 (jonon 7: Jana F28 vaihe 1) lisättiin rakentajan työssä: luvut 5, 6, 7, 10 ja 11, koodin ja testien `logiikka_72_jana.js` ja `selain_81_jana.py` mukaan. Appi-appi 42 (animointi vaihe 2: arvo vaihtuu, paikka vaihtuu) lisättiin rakentajan työssä: luvut 2, 3 ja 10, koodin ja testien `logiikka_73_animointi2.js` ja `selain_82_animointi2.py` mukaan. Appi-appi 43 (jonon 9: Hae rivitiedosto, Tietotaulukon Lähde) lisättiin rakentajan työssä: luvut 5, 6, 7, 9, 10 ja 11, koodin ja testien `logiikka_74_hae.js` ja `selain_83_hae.py` mukaan; luvun 7 esimerkki (Terveys) ajettiin selaintestissä valepalvelimella. Appi-appi 44 (jonon 1n: Janan edistyminen 0–1, kierros ja valmis aina, arvojanan käynnissä) päivitettiin rakentajan työssä: luvut 5 ja 6, koodin ja testien `logiikka_75_jana_linja.js` ja `selain_84_jana_linja.py` mukaan. Muutokset tämän jälkeen: katso `TILA.md` ja `MUUTOKSET.md`.
- **Miten tarkistettiin:** jokainen luku on kirjoitettu lukemalla käyttöliittymän ja moottorin koodia (nimet suoraan koodin merkkijonoista) sekä testien kuvauksia. Kaavakielestä ajettiin noin 150 kaavaa moottorilla (Node), ja maailman ja liikkeen kaavanimet tarkistettiin samoin. Aloitusluvun esimerkki *Vesilasit* tehtiin vaihe vaiheelta oikeassa käyttöliittymässä (Chromium, 1440 px). Muiden lukujen reseptejä **ei ole ajettu** selaimessa: ne on koottu koodista.
- **Ei tarkistettu oikealla iPhonella, iPadilla eikä Safarilla.** Puhelinkäyttö on kuvattu koodista ja testeistä, jotka ajavat kosketusta tietokoneen selaimessa 390 ja 320 px leveänä. Oikean laitteen tuntuma (sormella veto, näppäimistö, Safarin oma zoomaus) on varmistamatta.
- Kohdat, joita kirjoittaja ei voinut varmistaa, on merkitty tekstiin ”(ei tarkistettu)”.

## Manuaalin ylläpito

Jokainen rakentaja päivittää manuaalin samassa työssä, kun muuttaa jotain käyttäjälle näkyvää (sääntö `AGENTS.md`:ssä ja `PALIKKASAANNOT.md`:n kohdassa A15):

1. Muuta vain muuttunut kohta: palikan merkintä palikkakaavalla (mitä tekee, löytyy, sisään, ulos, asetukset, ominaisuudet, kaavassa, aika ja tila, esimerkki, huomio).
2. Uusi palikka: merkintä oikeaan lukuun ja rivi [hakemiston](10-hakemisto.md#palikat) palikkataulukkoon; erikoispalikka ✦:llä.
3. Muuttunut nimi tai syntaksi: korjaa kaikki maininnat (`grep -rn 'vanha nimi' appiappi/manuaali/`).
4. Päivitä tämän luvun *Tarkistettu versio* -kohtaan uusin Appi-appi-numero ja mitä tarkistettiin.
5. Suunniteltu, ei vielä toteutettu: ei kuulu manuaaliin.

## Havainnot

Kirjoittaessa löytyneet ristiriidat, puutteet ja yllätykset. Nämä eivät ole käyttöohjetta vaan kehityksen muistilista: kehitysehdotuksia ei ole toteutettu, ja osa on jo `TILA.md`:n avoimissa kysymyksissä. Kun havainto korjataan, poista se tästä.

### Työympäristö

- Puhelimella alapalkin paneelinappi on nimeltään ”Asetukset: palikan nimi”, ja yläpalkissa on lisäksi ”⚙︎ Asetukset”, joka avaa aivan eri ikkunan. Sama sana kahdelle asialle voi hämätä.
- Näkymää ei voi poistaa eikä siirtää välilehtirivillä; nappia ei ole. Näkymän nimeäminen onnistuu vain kaksoisnapautuksella, eikä sitä ole todennettu oikealla iPhonella.
- Näkymän muokkauksessa ei ole kahden sormen zoomausta (vain logiikkakanvaasilla ja lukitussa laitenäkymässä). Safari voi silloin zoomata koko sivua (ei tarkistettu).
- Monivalinta vaatii ⇧-näppäimen, joten puhelimella monta palikkaa saa valittua vain kerroksen ⬚-napista (näkymä). Logiikassa puhelimella ei ole monivalintaa lainkaan; silloin myös monen palikan kopiointi ja presetin tallennus monesta logiikkapalikasta on mahdotonta sormella.
- Kopioi ja liitä on vain logiikassa; näkymäpalikoille on Monista ja presetit.
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

1. **Teksti `"ei"` on ehtona tosi.** `jos("ei"; 1; 2)` = 1, koska ei-tyhjä teksti pätee. Avainsana `ei` ilman lainausmerkkejä toimii oikein. Helppo virhe, kun Tekstikentän sisältöä käytetään ehtona.
2. **Kummallinen virheilmoitus pilkuista funktion ulkopuolella:** `1,5,2` antaa `tuntematon merkki ”1”`. Funktion sisällä sama virhe saa hyvän ilmoituksen (puolipiste).
3. **Tyhjä ohjaus ohittaa toiminnon asettaman arvon:** kun ominaisuus on ohjattu nuolella ja kaava antaa tyhjän, käytetään perusarvoa, ei toiminnon asettamaa. Ominaisuudet-osion ohjeteksti kuvaa etusijan ilman tätä poikkeusta.
4. **Ohjeen sana "tyhjä" vs. puuttuva:** kaavan ohjeteksti ei erota tyhjää (laskussa 0) ja taulukon puuttuvaa (laskussa tuntematon); ero näkyy vain tuloksissa.
5. Ei tarkistettu selaimessa tässä luvussa: ehdotusrivin ja valikoiden tarkka ulkoasu puhelimella; kuvaus perustuu koodiin. Moottorin tulokset on ajettu nodella.

### Tieto

- Taulukkoikkunan valitun rivin sarake (●/○) näkyy vain, kun käyttötietoa on ja **Käyttötieto nyt** on valittuna. Uudessa taulukossa rakentaja ei voi valita riviä ikkunasta lainkaan; ohjeteksti ei kerro tätä.
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

