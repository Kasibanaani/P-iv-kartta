# Käyttöpinta: esitys, vuorovaikutus ja asettelu

F05, F09, F11–F15. Kaikki laskenta käyttää [01:n](01-tieto-ja-tapahtumat.md) tietoa ja nykyistä moottoria. [Periaatteet](00-periaatteet.md). Näiden kohtien toteutusjärjestys on ehdotus.

## Toistuva käyttöelementti (F05)

**Tarkoitus:** yksi suunniteltu kortti tai palikkaryhmä kaikille lähteen riveille. Sovelluksia: kohdelista määrineen, kysymykset vaihtoehtoineen, tapahtumien selaus. Tämä ei ole Monista N kpl: aineiston muuttuessa esitysten määrä muuttuu itsestään.

**Rakentaja:** valitse käyttöpinnan ryhmä → Toista riveille → valitse taulukko/suodatettu kokoelma. Avaa yhden esimerkkirivin esikatselu. Sido nimi, kuva ja arvot Rivi-lähteen ominaisuuksiin; kytke painikkeiden tapahtumat tavalliseen logiikkaan. Valitse sarake/rivi/ruudukko, väli ja kohteen koko. Mallin sisällä voi käyttää samoja kaavoja ja Kaavan tuloksia kuin muuallakin.

**Moottori:** malli ja aineisto ovat eri asioita. Esiintymän identiteetti on toistimen id + rivin id + sisäisen palikan id; järjestysnumero ei ole tunniste. Muuttuva rivijoukko ei luo pysyviä käsin monistettuja palikoita `P.b`:hen jokaisella piirrolla. Esitys voi olla virtuaalinen, mutta sen arvojen ja tapahtumien konteksti on moottorissa, ei DOM-attribuutissa piilotettu ainoa tieto. Rivin uudelleenjärjestys ei hävitä syötteen kohdistusta tai siirrä keskeneräistä muokkausta toiseen riviin.

**Tila:** tiedon kenttä on yhteinen kaikille samaa riviä näyttäville esityksille. Esityksen oma väliaikainen tila (esim. avattu lisätieto) on esiintymäkohtainen. Valinta tai muu sovelluksessa merkityksellinen tila määritellään logiikassa. Poistunut rivi ei jätä tapahtumaa vahingossa kohdistumaan seuraavaan.

**Kokeet:** yksi 100 rivin korttimalli; uusi rivi ilmestyy; poisto ja suodatus; järjestä kesken kentän muokkauksen; kaksi samaa riviä näyttävää pintaa; kaksi samanaikaista painallusta eri riveillä; kaikki kohdistuvat oikeisiin tunnisteisiin. Puhelimella yksi ja tietokoneella monta saraketta ilman logiikan kopiointia.

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
