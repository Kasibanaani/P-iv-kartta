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

**Ei tehty tässä vaiheessa:** toistin toistimen sisällä; kortin kentän muutos ei lähetä omaa tapahtumaa (sidottu kenttä muuttaa riviä, taulukolle ei vielä tehdä tapahtumia, Emilin päätös P2:n jälkeen); sidonta vain kortissa (laajennettu Appi-appi 16:ssa, alla); efektit (Teksti ilmestyy, Kuva vaihtuu, Animaatio) ja Tyhjennä eivät kohdistu yksittäiseen korttiin; kortin palikan oma kerros ei vaikuta käytössä (kortti piirtyy toistimen kerrokseen); kortin korkeus ei kasva sisällön mukaan; kaikki kortit ovat DOMissa (ei virtualisointia, selaimessa tarkistettu 40 riviä, moottorissa 100); raahaus ja lajittelu (F12), ryhmittely ja rivien yhteydet. Puhelin- ja iPad-näkymän rakentajaa ei tarkistettu.

### Toteutus 16.10.2026 (Appi-appi 16, kentän sidonta riviin)

Jatkoa P3b:lle: tavallinenkin kenttä voidaan sitoa riviin, jolloin syntyy muokkauslomake ilman logiikkaa. Emilin päätökset ennen rakentamista (tekoälyn suositukset): **sidonta = Rivi-palikka + sarake** (ei taulukko + valittu rivi), **ilman riviä kenttä on tyhjä ja harmaa**, **muutos ei lähetä uutta tapahtumaa**. Koodi: `appiappi/index.html`, moottorin osio *P3b: toistuva kortti (F05)* (`bindKind`, `bindTarget`, `tstWrite`; arvioinnissa `bindRow`, `rowBound`, `cellAs`) ja käyttöliittymän `bindInsp`, `bindOpts`. Kokeet: `testit/logiikka_51_lomake.js`, `selain_57_lomake.py`.

**Rakentaja.** Kentän (tekstikenttä, lukukenttä, valintaruutu, kytkin, säädin, päivämäärä) paneelissa osio *Sidonta riviin* → *Arvo sarakkeesta*: valikossa jokaisen Rivi-palikan sarakkeet, esim. ”Valittu: Määrä (valittu rivi, Tehtävät)”. Osio näkyy vasta, kun projektissa on Tietotaulukko (periaate 8). Jos taulukolla ei vielä ole valitun rivin Rivi-palikkaa, nappi *＋ Rivi-palikka: valittu rivi (taulukko)* tekee sen logiikkaan ja sitoo kentän ensimmäiseen sarakkeeseen; sarakkeen voi vaihtaa valikosta. Paneeli näyttää, mikä rivi on nyt (tai ”ei riviä”). Rivin vaihtaa tavallinen logiikka, esim. painike → Valitse rivi → seuraava, tai kortin painike. Kortissa valikossa ovat lisäksi vanhat ”kortin rivi: sarake” -vaihtoehdot.

**Moottori (suunnitteluratkaisut).** Kenttään tallentuu `trv` (Rivi-palikka) ja `tsar` (sarakkeen tunniste). Rivi on Rivi-palikan rivi samassa kontekstissa kuin muuallakin: valittu rivi, tapahtuman rivi (vain tapahtuman ketjussa, esim. kortin painike → Aseta kenttään) tai käsiteltävä rivi (kortissa kortin rivi, joten Rivi-palikka *käsiteltävä* + sarake toimii kortissa kuten vanha sidonta). Vanha kortin sidonta (`tsar` ilman `trv`:tä) on ennallaan eikä sitä muunneta. Kirjoitus menee käyttötietoon kuten taulukkotoiminnoilla (D02 heti voimaan, lähtöaineisto säilyy); kirjoituskohteen valittu rivi luetaan oikeasta käyttötiedosta myös lukitussa ketjussa (kuten P2). Lukukentän ja säätimen rajat sekä lajin tarkistus kuten kortissa: väärä laji on näkyvä virhe eikä kirjoitu. Kortista pois vedetty Rivi-sidottu kenttä säilyttää sidontansa (kortin sidonta irtoaa kuten ennen).

**Ei riviä ja virheet.** Ilman riviä (ei valittua riviä, valittu rivi poistettu → valinta siirtyy seuraavaan tai tyhjenee, tapahtuman ulkopuolella) kenttä on tyhjä (teksti tyhjä, luku tyhjä, rasti pois) ja harmaa: käytössä ei muokattavissa, muokatessa haalea. Logiikan Aseta tällaiseen kenttään ei kirjoita mitään ja kertoo ilmoituksella ”ei riviä, johon kirjoittaa”. Puuttuva sarake, taulukko tai poistettu Rivi-palikka on näkyvä virhe (⚠, punainen, harmaa). Rivi-palikan poisto (D08): vaikutuslista näyttää kentät (”arvo sarakkeesta”), viite jää, kenttä näkyy Viitevirheissä, ja uuden kohteen voi valita; samanniminen uusi Rivi-palikka ei peri sitä. Sarakkeen poiston vaikutuslista näyttää nyt myös sarakkeeseen sidotut kentät (myös kortin). Näkymän Monista säilyttää sidonnan samaan Rivi-palikkaan. Miksi? kertoo sarakkeen ja Rivi-palikan sekä sen, onko riviä nyt.

**Tapahtumat.** Kentän muutos ei lähetä omaa tapahtumaa (Emilin linja: taulukolle ei vielä tehdä tapahtumia). Kentän arvon nuolet toimivat kuten tavallisella kentällä. Huomio: kun valittu rivi vaihtuu, kentän arvo vaihtuu, ja esimerkiksi valintaruudun arvosta lähtevä JOS-ikkuna reagoi siihen kuin käyttäjä olisi rastinut (koe).

**Kolme käyttötapaa (periaate 1):** tehtävälomake valittuun riviin (selainkoe: Seuraava, kirjoitus, rasti), kortin painike → Aseta lomakkeen kenttään tapahtuman rivillä (moottorikoe) ja kortin kenttä, joka näyttää valitun rivin kaikissa korteissa (moottorikoe).

**Samalla:** lukukenttä näyttää puuttuvan arvon tyhjänä eikä ”–”-merkkinä (koskee myös kortin sidottua lukukenttää).

**Ei tehty:** oma *muuttui*-tapahtuma kentälle; sidonta Rivijoukon ensimmäiseen riviin suoraan (kierto: Valitse rivi tai Rivi-palikka); vahvistettava lomake (Tallenna/Peru, D02: rakennetaan logiikalla); valintalista-kenttä valinta-sarakkeelle. Puhelin- ja iPad-näkymän rakentajaa ei tarkistettu.

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
