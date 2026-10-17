# Käyttöpinta: esitys, vuorovaikutus ja asettelu

F05, F09, F11–F15. Kaikki laskenta käyttää [01:n](01-tieto-ja-tapahtumat.md) tietoa ja nykyistä moottoria. [Periaatteet](00-periaatteet.md). Näiden kohtien toteutusjärjestys on ehdotus.

## Toistuva käyttöelementti (F05)

**Tarkoitus:** yksi suunniteltu kortti tai palikkaryhmä kaikille lähteen riveille. Sovelluksia: kohdelista määrineen, kysymykset vaihtoehtoineen, tapahtumien selaus. Tämä ei ole Monista N kpl: aineiston muuttuessa esitysten määrä muuttuu itsestään.

**Rakentaja:** valitse käyttöpinnan ryhmä → Toista riveille → valitse taulukko/suodatettu kokoelma. Avaa yhden esimerkkirivin esikatselu. Sido nimi, kuva ja arvot Rivi-lähteen ominaisuuksiin; kytke painikkeiden tapahtumat tavalliseen logiikkaan. Valitse sarake/rivi/ruudukko, väli ja kohteen koko. Mallin sisällä voi käyttää samoja kaavoja ja Kaavan tuloksia kuin muuallakin.

**Moottori:** malli ja aineisto ovat eri asioita. Esiintymän identiteetti on toistimen id + rivin id + sisäisen palikan id; järjestysnumero ei ole tunniste. Muuttuva rivijoukko ei luo pysyviä käsin monistettuja palikoita `P.b`:hen jokaisella piirrolla. Esitys voi olla virtuaalinen, mutta sen arvojen ja tapahtumien konteksti on moottorissa, ei DOM-attribuutissa piilotettu ainoa tieto. Rivin uudelleenjärjestys ei hävitä syötteen kohdistusta tai siirrä keskeneräistä muokkausta toiseen riviin.

**Tila:** tiedon kenttä on yhteinen kaikille samaa riviä näyttäville esityksille. Esityksen oma väliaikainen tila (esim. avattu lisätieto) on esiintymäkohtainen. Valinta tai muu sovelluksessa merkityksellinen tila määritellään logiikassa. Poistunut rivi ei jätä tapahtumaa vahingossa kohdistumaan seuraavaan.

**Kokeet:** yksi 100 rivin korttimalli; uusi rivi ilmestyy; poisto ja suodatus; järjestä kesken kentän muokkauksen; kaksi samaa riviä näyttävää pintaa; kaksi samanaikaista painallusta eri riveillä; kaikki kohdistuvat oikeisiin tunnisteisiin. Puhelimella yksi ja tietokoneella monta saraketta ilman logiikan kopiointia.

### Toteutus 16.10.2026 (Appi-appi 15, P3b)

Emilin linjaukset ennen rakentamista: kortin malli tehdään **uudella Toistin-palikalla** (näkymän kehys, rivit nuolella kuten Rivijoukossa), ja kortin kenttä voidaan **sitoa sarakkeeseen**. Koodi: `appiappi/index.html`, moottorin osio *P3b: toistuva kortti (F05)* ja käyttöliittymän osio *P3b: toistin (F05)*. Kokeet: `testit/logiikka_50_toistin.js`, `selain_56_toistin.py`.

**Rakentaja.** Paletti → Näyttö → *Toistin* (näkyy, kun projektissa on Tietotaulukko). Logiikassa nuoli Tietotaulukon tai Rivijoukon kohdasta *rivit* Toistimen kohtaan *rivit*. Palikat vedetään katkoviivalla merkittyyn ensimmäiseen korttiin: niistä tulee kortin malli. Muokatessa malli näyttää ensimmäisen rivin arvot, ja muut kortit näkyvät haaleina (enintään 60). Toistimen paneelista *Kortit*: allekkain, vierekkäin tai ruudukko; kortin leveys (0 = toistimen leveys), korkeus ja väli. Ruudukossa sarakkeita on niin monta kuin toistimen leveyteen mahtuu, joten puhelimella yksi ja leveällä näytöllä monta ilman logiikan kopiointia. Kortin tekstit lukevat riviä tavallisen Rivi-palikan kautta (`{kohde.nimi}`); paneelin napista tehdään puuttuva Rivi-palikka. Kortin palikan paneelin osio *Kortissa*: *Arvo sarakkeesta* (kentät), *Valitse toistin*, *Irrota kortista*.

**Moottori (suunnitteluratkaisut).** Kortin malli = saman näkymän palikat, joilla `tst` = toistimen tunniste; jäsenyys päätetään pudotus- ja siirtohetkellä palikan keskikohdan mukaan ja tallennetaan, joten myöhempi koon muutos ei irrota. Paikka kortissa = palikan paikka miinus toistimen kulma. Palikoita ei monisteta `P.b`:hen: esiintymä on toistin + rivi + palikka, ja sen arvot lasketaan rivin omalla `Ev`:llä (`ctx.rows`). Kortin oma tila (sitomaton kenttä, valintaruutu, painallukset) on käyttötiedossa avaimella `ti:<avain>@<rivi>`, joten järjestyksen muutos tai poisto ei siirrä tilaa toiselle riville; rivin poisto siivoaa sen tilan. Sidottu kenttä (`tsar`) lukee ja kirjoittaa kortin rivin sarakkeen (käyttötieto, kuten taulukkotoiminnot; D02 heti voimaan), joten sama rivi näyttää saman arvon kaikilla pinnoilla; väärä laji on näkyvä virhe eikä kirjoitu. Kortin painike lähettää tapahtuman, jonka `rivi` ja käsiteltävä rivi (`kr`) ovat kortin rivi: *tapahtuman rivillä* -toiminnot, Rivi-palikka ja `tapahtuma.rivi` toimivat ilman uutta käsitettä, ja saman tapahtuman ketjussa kortin palikkaan kohdistuva toiminto osuu kortin riviin. Sitomattoman kortin palikan arvo on luettavissa riveittäin, esimerkiksi Rivijoukon ehto *kortin rasti* antaa valitut rivit. Mallin palikalla ilman riviä ei ole omaa tilaa (siihen ei kirjoiteta).

**Käyttö.** Kortit vierivät kehyksen sisällä (sormi, rulla); rullaus ei liikuta kameraa eikä napautus kortteihin lähetä hahmoa. Kortit avainnetaan rivin tunnisteella ja sijoitetaan absoluuttisesti, joten järjestyksen vaihto kesken kirjoituksen ei vie kohdistusta eikä keskeneräistä tekstiä toiselle riville (koe). Korttiin käyvät Painike, Valintaruutu, Kytkin, Säädin, Tekstikenttä, Lukukenttä, Päivämäärä, Teksti, Monitori, Kuva ja Muoto; sidottavissa ovat kentät, valintaruutu, kytkin ja säädin.

**Kolme käyttötapaa (periaate 1):** ostoslista nimi–määrä–plus (selainkoe), kortin rasti → Rivijoukon valitut rivit (moottorikoe) ja kaksi pintaa samalle riville, yhteinen määrä mutta omat rastit (moottorikoe).

**Ei tehty tässä vaiheessa:** toistin toistimen sisällä; kortin kentän muutos ei lähetä omaa tapahtumaa (sidottu kenttä muuttaa riviä, taulukolle ei vielä tehdä tapahtumia, Emilin päätös P2:n jälkeen); sidonta vain kortissa (tehty myöhemmin: Appi-appi 16, alla); efektit (Teksti ilmestyy, Kuva vaihtuu, Animaatio) ja Tyhjennä eivät kohdistu yksittäiseen korttiin; kortin palikan oma kerros ei vaikuta käytössä (kortti piirtyy toistimen kerrokseen); kortin korkeus ei kasva sisällön mukaan; kaikki kortit ovat DOMissa (ei virtualisointia, selaimessa tarkistettu 40 riviä, moottorissa 100); raahaus ja lajittelu (F12), ryhmittely ja rivien yhteydet. Puhelin- ja iPad-näkymän rakentajaa ei tarkistettu.

### Toteutus 16.10.2026 (Appi-appi 16): kentän sidonta riviin (muokkauslomake)

Emilin linjaukset ennen rakentamista (16.10.2026, kaikki tekoälyn suositukset): **kenttä sidotaan Rivi-palikkaan ja sarakkeeseen** (ei uutta käsitettä, kortin sidonta on tämän erikoistapaus); **ilman riviä kenttä on tyhjä ja harmaa**; **muutos ei lähetä uutta tapahtumaa** (taulukolle ei vielä tehdä omia tapahtumia). Koodi: moottorin osio *P3b: toistuva kortti (F05)* (`isBound`, `tstWrite`) ja `Ev`:n `bndRow`, `noRow`, `tstBound`; käyttöliittymässä `bindFields`, `bindInsp`. Kokeet: `testit/logiikka_51_lomake.js`, `selain_57_lomake.py`.

**Rakentaja.** Kentän (Tekstikenttä, Lukukenttä, Valintaruutu, Kytkin, Säädin, Päivämäärä) paneelissa osio *Rivin sarake*, kun projektissa on Tietotaulukko: *Rivi* (Rivi-palikat nimen, taulukon ja rivilähteen kanssa) ja *Arvo sarakkeesta*. Napista *＋ Rivi-palikka valittuun riviin* syntyy logiikkaan Rivi-palikka *Valinta* (ensimmäisen taulukon valittu rivi), ja kenttä sidotaan siihen; sarake valitaan vielä. Paneeli näyttää nykyisen rivin tai ”ei riviä”. Rivin valinta tehdään tavallisesti: Valitse rivi -toiminto (seuraava, edellinen, kortin painikkeesta *tapahtuman rivi*). Kortin kentän paneelissa sama Rivi-valinta, oletus *kortin rivi* (vanha sidonta).

**Moottori (suunnitteluratkaisut).** Kentän valinnainen `trv` = Rivi-palikan tunniste, `tsar` = sarake. Rivi ratkaistaan Rivi-palikalla kentän kontekstissa (`triviRow`): valittu rivi kaikkialla, käsiteltävä rivi kortissa (= kortin rivi) ja läpikäynnissä, tapahtuman rivi tapahtuman ketjussa. Lukeminen ja kirjoittaminen kulkevat samaa reittiä kuin kortissa (`tstBound`, `tstWrite`, D02 heti voimaan, käyttötieto kopiona, lähtöaineisto säilyy). Ilman riviä (ei valittua riviä, rivi poistettu) arvo on tyhjä kuten kortin mallilla ilman riviä, tila on *harmaa* (himmeä, ei käytettävissä) eikä mitään kirjoiteta. Asetusvirheet (sarake puuttuu, Rivi-palikalla ei taulukkoa, Rivi-palikka poistettu, väärä laji) ovat näkyviä virheitä eivätkä harmaannu. Rivi-palikan poisto: vaikutuslista, viite jää (⚠, Viitevirheet), uusi kohde valittavissa (`trv` kuuluu viiteavaimiin). Sarakkeen poiston vaikutuslista näyttää nyt sidotut kentät (myös kortin). Toiminnot kentälle (Aseta, Lisää, Vaihda) kirjoittavat riville; *Tyhjennä* tyhjentää lomakkeen kentän rivillä (puuttuva). Lomakkeen tyhjä lukukenttä näkyy tyhjänä (ei ”–”) ja tyhjennetty kirjoittaa puuttuvan, ei nollaa. Kenttä irrotettuna kortista säilyttää Rivi-palikkasidonnan; vanha kortin sidonta (`tsar` ilman `trv`:tä) poistuu irrotettaessa kuten ennen. Kentällä ei ole uusia kohtia eikä tapahtumia; arvo kulkee nuolia pitkin ja voi laukaista ehdon nousun kuten tavallinen kenttä. Samalla korjattu: sidottu lukukenttä tekstisarakkeessa on näkyvä virhe (ennen tyhjä NaN).

**Kolme käyttötapaa (periaate 1):** muokkauslomake kortista valittuun riviin (selainkoe), puhelimen selauslomake Seuraava-painikkeella (selainkoe) ja kortin kenttä, joka näyttää valitun rivin jokaisessa kortissa tai kortin rivin Rivi-palikan kautta (moottorikoe); lisäksi tapahtuman rivi ketjussa (moottorikoe).

**Ei tehty / vanha ennallaan:** kortin kentän tyhjennys kirjoittaa edelleen nollan ja kortin Tyhjennä ei kohdistu riviin (Emilin vaatimus: vanha kortin sidonta toimii ennallaan; yhtenäistys on TILAn avoin kysymys); uusi rivi lomakkeesta (Lisää rivi -toiminto tekee sen, valinta uuteen riviin ei ole automaattinen); lomakkeen tallennus/peru-vaihe (D02: muutos heti voimaan; vahvistus rakennetaan logiikalla, esim. kentät sitomattomina ja Lisää rivi / Aseta sarakkeeseen). Puhelin- ja iPad-näkymän rakentajaa ei tarkistettu.

## Aikasarjat ja vertailut (F09)

**Rakentaja:** nykyinen Kaavio saa aineistolähteen, x- ja y-kentän, valinnaisen sarjaryhmän ja näkyvän aikavälin. Nykyiset yksittäisten palikkojen kaaviot säilyvät. Monitori näyttää edelleen yhtä arvoa. Viiva/piste/pylväs ovat esityksiä, eivät laskentamalleja.

**Logiikka:** suodatus ja ryhmittely tehdään lähteelle, liukuva keskiarvo/muutos/trendi lasketaan erillisessä yleisessä sarjakäsittelyssä ja tulos annetaan Kaavioon. Keskiarvo havainnoista N ja aikavälistä N päivää ovat eri valintoja. Puuttuva havainto ei tuota nollapistettä. Aineiston kattavuus ja laskentatapa ovat saatavissa ominaisuuksina.

**Yhteysvertailu:** ensimmäinen yleinen versio vertailee valittua lukua riveillä, joilla ehto pätee/ei päde, ja näyttää havaintomäärät. Päiväkartan nykyinen ennustemalli ei muutu suoraan yleiseksi ennustuspalikaksi. Samanaikaisuus ei tarkoita syytä. Pisteen/ryhmän napautus antaa lähderivien tunnisteet tapahtumassa, ei erillistä muokkauslogiikkaa kaavioon.

**Kokeet:** epätasaiset aikavälit, puuttuva ja nolla, sama päivä useasti, negatiiviset luvut, kaksi sarjaa, tyhjä lähde, napautuksen oikea rivi, luettava esitys 320 px ja 1440 px. Tunnettu numeerinen sarja todistaa laskun, ei vain kuvakaappaus.

## Kerrokset, ryhmät ja paneelit (F11)

**Nykyistä:** Kerros-palikka ohjaa näkyvyyttä, alempien käytön estoa, himmennystä ja läpinäkyvyyttä. Käytä sitä ponnahdusikkunaan, sivupaneeliin ja valikkoon. Älä luo uutta valikkokohtaista toimintolistaa.

**Täydennykset:** ryhmän oma rajaus/leikkaus, oma vieritys, kiinnitys ruutuun tai kohteeseen, sisällön mukaan kasvava koko. Kerroksen järjestyksen/rullausvauhdin logiikkaohjaus lisätään nykyiseen rekisteriin vain tarpeen mukaan. Avattu/suljettu/taustan napautus ovat vuorovaikutustapahtumia, joiden seuraukset rakennetaan ulkopuolelle. Modal-pinnan kosketus- ja näppäimistöfokuksen rajaus on sen käyttöominaisuus.

**Kokeet:** valikko näyttää tavalliset painikkeet; taustan painike ei laukea suojan läpi; piilotus, paluu ja fokus; kerros ei muodosta omaa riippumatonta näkyvyysmoottoria. Peliä tai lomaketta estävä ehto näkyy logiikassa. Testaa nykyiset Alue/Sijainti-poikkeukset ennen muutosta; älä muuta niiden semantiikkaa vahingossa.

## Käyttöraahaus ja kosketusmuodot (F12)

**Rakentaja:** näkymäpalikan valinnainen käytössä raahattava ominaisuus sekä akseli, rajat, kohdistus ja hyväksyttävät pudotusalueet. Säilytä muokkausraahaus erillään. Alueen muoto: laatikko, ympyrä, myöhemmin monikulmio/vapaa kuvapolku. Kuvan toimintoalueet sidotaan kuvan paikallisiin/suhteellisiin koordinaatteihin.

**Ulostulot:** alku, sijainti/siirtymä, loppu, peruttu ja pudotuksen kohde. Tapahtumassa liikkujan ja kohteen tunnisteet sekä koordinaatit. Sovellussääntö (järjestä, luokittele, siirrä tietorivi, hylkää) on ketjussa. Painalluksen, raahauksen, vierityksen ja nipistyksen keskinäinen etusija on yleinen vuorovaikutussääntö, ei pelikohtainen poikkeus.

**Tekniikka:** säilytä tartuntakohdan siirtymä (Viidakkovahdin periaate), pointer capture/cancel, maailman/ruudun/kuvan koordinaattimuunnos nykyisen kameran ja parallaksin kautta. Zoomattuna tapahtuman koordinaatit ovat dokumentoidusti valitussa koordinaatistossa. Älä tulkitse pudotettua kuvaa automaattisesti esteeksi tai peliesineeksi.

**Kokeet:** kohde ei hyppää sormen keskelle; peruutettu kosketus; zoomattu kamera ja lukittu kojelauta; muodon ulkopuolinen napautus; toistuvan rivikortin siirto; lajittelu myös painikkeilla/näppäimistöllä, kun raahaus ei ole mahdollinen.

### Toteutus 16.10.2026 (Appi-appi 19): käyttöraahaus, ensimmäinen osa

Emil antoi luvan tehdä F12:n. Tekniset ratkaisut ovat tekoälyn.

- Näkymäpalikan paneelissa on osio *Käyttöraahaus*. Valinnat: **Raahattava käytössä** (`raah`), **Suunta** (Vapaa / Vain vaaka / Vain pysty, `rax` = `x`|`y`), **Kohdista ruudun keskelle** (`rko`, näkyy vain, kun kerroksella on ruudukko) ja **Pudotus** (Minne vain / Vain alueisiin, `rpa` = `alue`). Merkki, Alue, Toistin ja kortin palikat eivät ole raahattavia.
- Muokkausraahaus on ennallaan. Käyttöraahaus toimii vain lukittuna.
- Palikka seuraa osoitinta tartuntakohdasta. Alle 6 px liike on tavallinen napautus, joten raahattava painike painuu yhä, eikä raahaus paina sitä.
- Liike lasketaan palikan oman ruutumittakaavan kautta, joten zoomaus ja kojelauta eivät vääristä sitä.
- Toinen sormi (nipistys) tai keskeytynyt kosketus perii raahauksen.
- **Paikka on käyttötietoa:** pudotus asettaa toiminnon tason x:n ja y:n (`setOmi`). Rakenne ei muutu, ja käyttötietojen tyhjennys palauttaa alkupaikan.
- **Moottori ratkaisee pudotuksen** (`raahausPaikka`, `raahausPudotus`, `raahausPeruttu` ja `raahausAlku` KK:ssa):
  - Suunta lukitsee akselin.
  - Ruudukossa keskipiste kohdistetaan ruudun keskelle.
  - Kohde on pienin Alue, jonka sisään keskipiste osuu (laatikko tai ympyrä).
  - Jos pudotus menee vain alueisiin ja alueen ulkopuolelle, palikka palaa paikalleen.
- **Portit ja tapahtuman tiedot:**
  - Tapahtumat *raahaus alkoi*, *pudotettu* ja *raahaus peruttu*.
  - Tapahtuman tiedoissa uudet kentät `tapahtuma.x`, `.y`, `.ruutux` ja `.ruutuy` (ruudut 1:stä alkaen) sekä `tapahtuma.kohde` (Alueen nimi).
  - Sovellussääntö (luokittelu, tietorivin siirto) rakennetaan ketjussa näiden varaan.

**Ei tehty tässä osassa:**
- jatkuva *sijainti*-tapahtuma raahauksen aikana
- kuvan toimintoalueet ja monikulmio- tai vapaamuotoinen alue
- rivikortin siirto ja lajittelu sekä lajittelu painikkeilla tai näppäimistöllä
- raahausrajat (min/max) muuten kuin Alueiden kautta
- vieritys reunalle raahattaessa
- pudotuskohteen korostus raahauksen aikana

**Ei tarkistettu:**
- oikea iPhone ja Safari
- pitkä painallus raahattavassa painikkeessa
- raahaus liikkuvalla (Liike) palikalla

### Toteutus 17.10.2026 (Appi-appi 20): käyttöraahaus, toinen osa

Emilin päätökset 16.10.: korttien raahaus ja lajittelu ensin; pudotusalue korostuu; reunavieritys; järjestys taulukon rivijärjestykseen käyttötietona; ilman raahausta toiminnot Siirrä rivi ylös / alas.

- **Korttien järjestys:** Toistimen valinta *Järjestä raahaamalla* (`tlaj`). Toimii, kun rivit tulevat nuolella suoraan Tietotaulukosta (`tstLahde`); Rivijoukon järjestys on sen oma, joten sen kautta ei lajitella (paneeli kertoo). Moottorin `tstSiirra` siirtää rivin taulukon käyttötiedon (`tUse`) kohtaan ja lähettää toistimen tapahtuman *rivi siirretty* (`rsi`): `tapahtuma.rivi`, `.vanha`, `.uusi` (1 = ensimmäinen). Lähtöaineisto ei muutu; käyttötietojen tyhjennys palauttaa järjestyksen.
- **Etusija kortissa:** hiirellä yli 6 px veto aloittaa raahauksen; sormella pitkä painallus (0,35 s) ennen liikettä, muuten pyyhkäisy vierittää korttien kehystä tavalliseen tapaan. Kentät ja säätimet eivät aloita raahausta; painike painuu napautuksella eikä raahattaessa. Uusi paikka = lähin korttipaikka kortin keskipisteestä; katkoviiva näyttää sen.
- **Ilman raahausta:** toiminto *Siirrä rivi* (`siirrarivi`, suunta `rsu` ylös/alas, rivi valittu tai tapahtuman). Rivi vaihtaa paikkaa viereisen kanssa, reunalla ei siirry; sitten-tapahtumassa vanha ja uusi paikka.
- **Korostus:** *Vain alueisiin* -raahauksessa saman näkymän Alueet piirretään katkoviivoina (`raahausKohteet`), ja alue, johon pudotus osuisi, korostuu. Muulla pudotuksella ei korostusta.
- **Reunavieritys:** osoitin alle 40 px kehyksen reunasta rullaa kameraa (vauhti kasvaa reunaa kohti), kun näkymää saa rullata (`canPanUI`) ja palikka on tavallisella kerroksella; kameran rajat huomioidaan mittaamalla todellinen siirtymä. Kortin raahaus vierittää korttien kehystä samoin.

**Ei tehty:** sijainti-tapahtuma raahauksen aikana, kuvan toimintoalueet ja muotoillut alueet, lajittelu näppäimistöllä, korttien raahaus toistimesta toiseen, pudotus korttiin (Alue kortin sisällä).

**Ei tarkistettu:** oikea iPhone ja Safari (pitkä painallus voi kilpailla tekstin valinnan kanssa), ruudukkoasettelu (testattu allekkain), korostus hitaamman kerroksen alueille.

## Suhteellinen ja mukautuva asettelu (F13)

**Rakentaja:** ryhmäkohtainen Vapaa/Rivi/Sarake/Ruudukko. Näytä vain valitun tavan asetukset: väli, reunus, tasaus, rivitys, min/max-koko ja sisällön mukaan kasvaminen. Vapaa kanvaasi pysyy ensiluokkaisena; nykyiset kertaluonteiset tasaus- ja monistustyökalut säilyvät.

**Malli:** ryhmällä paikallinen koordinaatisto. Laskettu sijainti erotetaan perusarvosta ja logiikan ohjaamasta paikasta. Sama ominaisuus ei saa kahta yhtä vahvaa ohjausta: asettelun laskema arvo esitetään lähteenä, ja ohituksen etusija on näkyvä. Tietokone-/puhelinesitys voivat näyttää saman tiedon eri rakenteella; erillisiä tietokopioita ei synny.

**Kokeet:** pitkä nimi, tyhjä ja 100 rivin lähde, näytön koon vaihto, ruudukon sarakkeiden muutos, asetteluryhmän siirtäminen, lapsen ominaisuusohjaus. Ennen toteutusta valitse dokumentoidusti yksi selkeä etusijamalli ja testaa se; älä lisää asettelu- ja kaavaohjausta piilossa rinnakkain.

## Arvo ja esitystapa (F14)

Monitori on jo yleinen numeron/palkin/renkaan jne. näyttö, Sekuntikello antaa ajan. Älä rakenna uutta ajastinnäyttömoottoria. Täydennä nykyisiä ohjaimia valinnaisella esityksellä: lukuarvo säätimenä tai numeropainikkeina, muokattava plus/miinus, arvon yksikkö ja päiden selitteet.

Kalenterin päivän, taulukon rivin ja kuvaajan pisteen valinta antaa tunnisteen tapahtumana. Valinta ei itse vaihda näkymää tai kirjoita lokia. Näkyvyys, käytettävyys, valinta ja suosituskorostus ovat erillisiä ominaisuuksia, kuten Päätöskartan periaatteessa. Älä tuo Päätöskartan omaa sääntömoottoria Appi-apin sisälle.

**Kokeet:** kaksi esitystä samasta arvosta pysyy synkronissa; asteikolla nolla ja vastaamaton eroavat; Monitori ei arvo uudelleen tai tee kirjausta piirrossa; kalenterivalinta ei siirry näkymään ilman kytkettyä logiikkaa.

## Tekstipohja ja koosteet (F15)

**Rakentaja:** tekstipohjaan samasta valitsimesta kenttä/ominaisuus; numeron desimaalit/yksikkö, päivämäärä- ja aikamuoto, rivinvaihto. Ehdollinen osa saa ehdon tavallisesta kaavasta/ikkunasta. Toistuva tekstiosa käyttää samaa rivikontekstia kuin käyttöpinnan toisto.

**Esimerkki:** otsikko + valitun kohteen kentät + tämän päivän tapahtumien rivit + summa. Sama laskettu teksti voidaan näyttää ruudulla ja antaa nykyiselle/yleiselle Kopioi-toiminnolle. Sisältöä ei lähetetä automaattisesti minnekään.

**Tekniikka:** ei `eval`:ia tai erillistä ohjelmointikieltä. Viitteet ovat rakenteisia ja näkyvät riippuvuus-/virhetarkistuksessa. Muotoilu ei muuta laskenta-arvoa. Käyttäjän teksti escapetaan näyttökontekstissa; HTML ei suoritu syötteenä. Katkennut viite näytetään virheenä eikä häviä tyhjäksi tekstiksi.

**Kokeet:** ominaisuusviite, nimenvaihto, puuttuva viite, ehdollinen/toistuva osa, suomalainen desimaali, aikamuoto ja rivinvaihdot sekä sama kooste näytöllä ja leikepöydällä. Testaa myös käyttöympäristön kopiointivirheen palautepolku.
