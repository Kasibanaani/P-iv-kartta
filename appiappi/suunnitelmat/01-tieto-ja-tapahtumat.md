# Tieto, viitteet ja tapahtumat

Katettava kokonaisuus F01–F04, F06–F08 sekä päätökset D01, D02, D05, D06 ja D08. Ehdotettu tietomalli ei ole nykyinen tallennusmuoto. [Periaatteet](00-periaatteet.md), [ketjujen lukitus](02-ketjujen-lukitus.md).

## 1. Yhtenäinen viite ja ominaisuus (F01)

**Tarkoitus:** sama arvo löytyy riippumatta siitä, käytetäänkö sitä kaavassa, tekstissä, nuolessa tai toiminnossa. Rakentaja valitsee kohteen ja sen ominaisuuden samasta valitsimesta. Esimerkki: kaavassa `ajastin.jäljellä`, tekstissä `{ajastin.jäljellä}` ja ominaisuusohjauksessa sama lähde.

**Toteutus:** laajenna nykyistä `omat`-rekisteriä ja viiteresolveria. Säilytä nimet ihmiselle ja tunnisteet tallennukseen. Jäsennä tekstin viite sekä ominaisuus rakenteiseksi yhteydeksi; älä luo erillistä heikosti yhteensopivaa regex-kieltä. Kerros ja Kamera löytyvät nykyisten palikoidensa kautta. Monen arvon, tulevien rivien ja lähteen tilan ominaisuudet käyttävät samaa rekisteriperiaatetta.

**Valmis:** nimen vaihto säilyttää toiminnan kaikissa neljässä käyttökohdassa; tekstin ominaisuus näyttää saman arvon kuin kaava; puuttuva kohde tai ominaisuus antaa selityksen; Yhteydet tunnistaa kaikki viittauspaikat.

## 2. Tietotaulukko (F02)

**Rakentajan toiminta:** lisää logiikkapuolelle Tietotaulukko, avaa sen sisältöikkuna, lisää sarakkeet ja rivit. Sarakkeiden lajit: teksti, luku, kyllä/ei, päivämäärä, ajankohta, valinta, riviviite; kuva/tiedosto tulee mediaosuuden myötä. Tyhjää taulukkoa voi käyttää ilman tietyn konseptin oletussarakkeita.

**Tietomalli, suunnitteluratkaisu:** taulukolla `id`; sarakkeella `id`, näkyvä nimi, viite, laji ja valinnainen yksikkö; rivillä `id` ja arvot saraketunnisteiden mukaan. Järjestys on oma lista, ei tunniste. Viite kohdistuu taulukko-, rivi- ja tarvittaessa saraketunnisteeseen. Älä käytä rivinumeroa avaimena. Määrittely ja lähtöaineisto erotetaan käytössä muuttuvista riveistä ja laskennallisista sarakkeista.

**Logiikka:** Toiminto saa kohteiksi lisää rivi, aseta kenttä, poista rivi ja muut yleiset taulukko-operaatiot. UI lähettää muutoskomennon moottorille. Nykyinen `tulos = ...` ei kirjoita taulukkoon: kirjoitus on tapahtumasta suoritettava Toiminto. Muutostoiminto palauttaa luodun/muuttuneen rivin tunnisteen tapahtuman tiedoissa.

**Muokkaus D02:** hyväksytty kenttämuutos tulee heti voimaan, ilman pakollista Tallenna-painiketta. Tekstikentän hetkellistä keskeneräistä lukua (esim. pelkkä miinusmerkki) ei kirjoiteta numerona; syötteen editointipuskuri ei muuta semanttista oletusta. Virhe näkyy kentässä. Erillinen hyväksyttävä lomake rakentuu luonnosarvoista, vahvistuspainikkeesta ja nykyisistä toimintoketjuista, ei taulukkoon piilotetusta prosessista.

**Käyttöpinta:** taulukon ylläpitoikkuna on rakentamista varten. Varsinaiseen käyttäjä-appiin rivit esitetään F05:n korteilla tai yleisellä listalla/taulukolla; niillä ei ole omaa liiketoimintalogiikkaa.

**Valmis:** sama perusta kattaa nimikkeet määrineen, kysymykset ja mittaukset. Nimeäminen, järjestäminen, tyhjä taulukko, vienti/tuonti ja vanhan projektin avaaminen eivät sekoita arvoja. Satunnaisesti generoituja uusia tunnisteita ei vaihdeta jokaisessa piirrossa.

## 3. Rivikonteksti ja kokoelman käsittely (F03)

**Rakentajan toiminta:** lisää Rivi-lähde, anna sille tavallinen viite (esim. `kohde`) ja valitse taulukko sekä rivin lähde: valittu rivi, tapahtuman kohde tai käsittelyn nykyinen rivi. Sarakkeet näkyvät tämän lähteen ominaisuuksina. Kaava `kustannus = kohde.maara × kohde.hinta` antaa arvon tavalliselle Kaavan tulokselle.

**Konteksti:** arvioinnin konteksti sisältää rivin ja esiintymän identiteetin. Saman laskennan välimuisti on eroteltava kontekstin mukaan; eri rivien tulokset eivät saa käyttää toistensa memoarvoja. Miksi? näyttää, minkä rivin laskua tarkastellaan. Viite `kohde` on tavallinen nimetty lähde, ei uusi kaikkialle varattu avainsana.

**Suodatus:** syöte on rivijoukko; ehto on nykyinen kaava tai ikkuna, joka arvioidaan jokaiselle riville. Tuloksena joukko samoja tunnisteita, ei kopioita. **Järjestys:** ominaisuus ja suunta; tasatilanteessa alkuperäinen käyttäjän järjestys säilyy. **Haku:** tunniste tai kenttäosuma, ei osumaa näkyy tyhjänä; monen osuman valintasääntö näytetään. Aliashaku ja kirjoitusvirheen sieto ovat myöhempiä, erikseen valittavia hakutapoja.

**Koosteet:** käytä nykyisten SUMMA/KESKIARVO/SUURIN/PIENIN/määrä-ikkunoiden käsitteitä myös kokoelmalle valitusta ominaisuudesta. Sovita portti ja arvolaji rekisteriin; älä muuta vanhan yksittäisistä palikoista koostuvan ikkunan merkitystä. Ryhmittely palauttaa ryhmän avaimen ja jäsenet. Rivien yhteydet ovat tunnisteita, joiden yli voi hakea ja koota (myös vanhempi–lapsi-kertymä); ei tietojen automaattista kopiointia.

**Toisto:** laajenna nykyistä Toista-toimintaa tarvittaessa valittujen rivien läpikäyntiin. Ensimmäinen toteutus käy läpi aloitushetkellä valitun tunnistelistan järjestyksessä; poistunut rivi tuottaa näkyvän käsittelyvirheen. Tämä on erillään jokaisen askeleen arvojen lukituksesta. Rinnakkaiset työt ja kaikkien valmistumisen odottaminen lisätään myöhemmin samaan suoritusten malliin, ei epämääräisenä tapahtumaviivojen ajoituksena.

**Valmis:** 100 rivin yksi lasku; suodatus ja järjestys eivät muuta rivejä; yksi puuttuva riviviite tunnistetaan; sama lasku kahdelle riville samanaikaisesti ei sekoitu; uudelleennimetty sarake toimii.

## 4. Tapahtuman mukana kulkeva tieto (F04, D05)

**Rakentajan toiminta:** ketjussa Tapahtuman tiedot -lähde tarjoaa tavallisen viitevalitsimen kautta lähteen, kohteen, rivin, vanhan/uuden arvon ja ajan. Yksi Lisää-ketju voi palvella kaikkia rivejä. Painikkeessa on vain tapahtuman ja esitettävän kohteen kytkentä.

**Suunnitteluratkaisu:** muuttumaton tapahtumakuori `{eventId, sourceId, targetRef, rowRef, instancePath, at, before, after, data}`; kentät ovat valinnaisia tapahtuman mukaan. Kopioi tapahtuman arvot tapahtumahetkellä, älä pidä osoitinta muuttuvaan käyttöliittymäobjektiin. Kohdeviite on identiteetti, ei lupaus kaikkien kohdetietojen jäädyttämisestä. Tapahtuman talteen otettu arvo ja viitteen avulla myöhemmin luettu arvo erotetaan valitsimessa.

Jokainen ketjun suoritus/haara säilyttää oman kuorensa odotusten yli. Toinen painallus ei korvaa ensimmäisen tietoja. Oletusarvoisesti aliketju perii laukaisseen tapahtuman tiedot; uuden tapahtuman luonti on nimenomainen toiminto. Arvon muuttaminen ilman tapahtumaketjua ei itsessään kirjoita tapahtumakuoreen uudelleen.

**Esimerkki:** painallushetken määrä 2 jää `tapahtuma.uusi`-kenttään. Kenttä muuttuu odotuksen aikana 5:een. Ajantasainen tavallinen viittaus näkee 5, tapahtumatieto edelleen 2. Ketjun lukitus voi jäädyttää tavallisenkin viittauksen, mutta ei muuta tapahtuman historiaa.

**Valmis:** kaksi päällekkäistä painallusta, odotukset ja aliketju säilyttävät oikeat kohteet; toistuvan kortin järjestäminen ei muuta kohdetta; tapahtumadata toimii ilman DOMia; sama `eventId` voidaan tunnistaa ulkoisen työn uudelleenyrityksessä.

## 5. Puuttuva tieto, virhe ja koostaminen (F06, D06)

Uudessa tyypitetyssä datassa erotetaan tyhjä, 0, false ja virhe. Älä sovella nykyistä `num(null) = 0`-käytöstä huomaamatta uusiin sarakkeisiin. Älä muuta vanhojen projektien totuus-/lukutulkintaa yleisellä korjauksella.

- Kentällä on tiedossa-ominaisuus. Puuttuva luku ei ole nolla; vastaamaton kyllä/ei ei ole kielteinen vastaus.
- Yksittäisen uuden laskun puuttuva pakollinen operandi tuottaa tuntemattoman tuloksen; ei näennäistä lukua.
- Kooste ohittaa puuttuvat ja kertoo kelvollisten sekä puuttuvien määrät (D06). Tyhjä summa on 0 kelvollista/0 yhteensä -selitteellä; täysin puuttuvan ei-tyhjän aineiston tulos on tuntematon. Tyhjä keskiarvo/pienin/suurin on tuntematon.
- Virheellinen viite tai lasku ei ole pelkkä puuttuva havainto: kooste kertoo virheen ja kohteet eikä näytä virheetöntä kokonaistulosta. Rakentaja voi nimenomaisella suodatuksella käsitellä virheellisiä pois.
- Täydelliset tiedot -ehto on erikseen valittava: yksikin puuttuva estää tuloksen. Koosteen luku ja tiedon kattavuus ovat eri ulostuloja.

**Valmis:** keskiarvo arvoista 0, 6 ja tyhjä on 3, havaintoja 2, puuttuvia 1; ei 2. Väärään tunnisteeseen viittaava kolmas rivi näkyy viitevirheenä. Täydellisyysvaatimus estää tuloksen. Vanhojen ikkunatestien odotukset säilyvät.

## 6. Määrittely, käyttötieto ja tilannekuva (F07, D01)

**Määrittely** kertoo rakenteen ja lähtösisällön. **Käyttötieto** on käyttäjän valinnat, kirjatut rivit ja eteneminen. **Tilannekuva** kopioi valitut kentät määrätyllä tapahtumahetkellä.

Tallennettaessa kirjaus valitut tietokentät kopioidaan oletuksena (D01). Valitsimessa on erikseen ajantasainen riviviite. Kirjaus voi sisältää sekä tilannekuvan että alkuperäviitteen; ne eivät ole sama kenttä eikä taustalla tapahtuvaa kaksoistallennusta piiloteta. Esimerkiksi myöhemmin muuttuva nimikkeen hinta ei muuta vanhaa kirjattua summaa.

Nykyinen Muisti + Aseta riittää yhden luvun talteenottoon. Laajempi Tallenna tilannekuva -toiminto voi kopioida valitun rivin/kenttäjoukon kerralla. Puuttuvat/virheelliset arvot tarkistetaan ennen kokonaisuuden kirjoittamista. Lukittu ennuste, suunniteltu/toteutunut ja vaihtoehtokokeilu tehdään tämän perustan ja tavallisten kaavojen avulla.

Tilannekuva ei ole turvallisuus- tai muuttumattomuustodistus. Jos projekti tarvitsee muutoshistorian tai tarkistussumman, se on erillinen näkyvä ominaisuus.

**Valmis:** hinnan muutos muuttaa elävää viitettä mutta ei aiempaa kopioitua kirjausta; uuden kirjauksen arvo on uusi hinta; vienti/tuonti säilyttää eron; kumoaminen ei jätä puolikasta kirjausta.

## 7. Rakenteinen historia (F08)

Kirjaa-toiminto lisää rakenteisen rivin (id, ajankohta, kohdeviite, laji ja valitut kentät). Aikajana, kalenteri, kaavio ja tekstikooste ovat saman aineiston esityksiä. Nykyisen tekstiaikajanan muoto säilyy; muunnos rakenteiseen historiaan on nimenomainen eikä pakollinen.

Historiahaut: viimeisin, viimeisin ehdolla, määrä aikavälillä, aikavälin rivit ja aika edellisestä. Menneet raakakirjaukset säilytetään, joten laskentatapa voi muuttua ilman historian hävittämistä. Korjaus- ja poistohistoria ovat projektille valittavia sääntöjä, ei jokaisen käyttöelementin piilotettua toimintaa.

**Valmis:** yhdestä lähteestä lista, aikajana ja päivän kooste; päivämäärävalinta suodattaa samaa tietoa; yhteiskäyttö ei kahdenna samaa tapahtumaa.

## 8. Viitatun kohteen poistaminen (D08)

**Käyttäjän päätös:** poisto sallitaan myös viitattuun kohteeseen, kun vaikutukset on näytetty ja käyttäjä jatkaa. Pakollista arkistointia ei lisätä poistamisen tilalle. Arkistointi voi olla erillinen toiminto.

### Rakentajan suora poistopolku

1. Laske saapuvat viittaukset: kaavat ja Kaavan tulokset, tekstit, ominaisuusohjaukset, toimintokohteet, ketjujen kohteet, taulukon riviyhteydet, moduulien näkyvät sidonnat ja esitysten lähteet.
2. Jos viittauksia on, näytä määrä ja luettelo paikoista nimineen: näkymä/ketju/palikka/rivi/kenttä, käyttötapa ja siirry katsomaan. Monivalintapoistossa laske lopputilanteen riippuvuudet, älä varoita vain yhdessä poistuvien kohteiden keskinäisistä viitteistä.
3. Tarjoa Peru ja Poista silti. Peruminen säilyttää datan sekä viitteet täsmälleen ennallaan. Varoitukseton poisto on mahdollinen, jos ulkopuolelle jääviä viittauksia ei ole.
4. Hyväksytty poisto säilyttää viittaavissa kohdissa puuttuvan tunnisteen ja viimeksi tunnetun nimen diagnostisena tietona. Älä korjaa viitettä automaattisesti toiselle kohteelle.
5. Näytä katkennut kohta varoitusmerkillä, erottuvalla teemaan sopivalla virhevärillä ja tekstillä "Kohde poistettu"; väri ei ole ainoa merkki. Kaavassa/tekstissä/arvonäytössä virhe pysyy luettavana. Projektin Viitevirheet-lista löytää kaikki paikat, avaa ne ja tarjoaa uuden kohteen valinnan.
6. Kaavan tai viitteen korjaus käyttää samaa valitsinta. Undo voi palauttaa poistetun kohteen alkuperäisellä tunnisteella ja korjata yhteydet.

### Semanttiset erot ja suoritukset

- Arvon tyhjentäminen: kenttä/kohde on olemassa, tulos on tyhjä. Ei katkennut viite.
- Kohteen/rivin/sarakkeen poistaminen: identiteetti puuttuu, viite on virhe. Vanhan tilannekuvan kopioidut tiedot säilyvät, mutta sen mahdollinen alkuperäviite voi katketa.
- Rakenteen tarkistus ei saa "siivota" puuttuvaa tunnistetta niin, että virheen sijainti katoaa. Vanhojen tallennusten korjaus ja tietoinen poisto erotetaan.
- Ajantasainen ketju pysähtyy näkyvään virheeseen, jos seuraava tarvittava kohde poistuu. Jo lukittuun kuvaan tallennettu lukuarvo ei muutu kadonneeksi vain siksi, että ulkopuolinen lähde poistuu; oikeasti poistettuun yhteiseen kohteeseen kirjoittaminen kuitenkin epäonnistuu.
- Ohjelmallinen poisto ei saa avata piilotettua modal-dialogia moottorista. Suunnitteluratkaisu: Toiminto tarkistaa viittaukset ja palauttaa "vahvistus tarvitaan" sekä vaikutuslistan, ellei rakentaja ole nimenomaisesti sallinut poistoa viitteistä huolimatta. Tarvittava vahvistus voidaan rakentaa tavallisella käyttöliittymällä ja logiikalla. Käyttäjän suoran ylläpitopoiston dialogi käyttää samaa vaikutuslaskentaa.

**Valmis:** viitattu ja viittaamaton poisto, peru, jatka, monivalinta, tekstin ominaisuusviite, puuttuva taulukkosarake, Undo, vienti/tuonti sekä uusi samanniminen kohde. Kaikki puuttuvat viitteet löytyvät ilman pelkkään väriin turvautumista.

## 9. Toteutus 16.10.2026 (Appi-appi 13, P2)

Toteutettu F02, F04, F06 ja F07 tässä laajuudessa. Emilin linjaukset ennen rakentamista: rivi osoitetaan valittuna rivinä tai tapahtuman rivinä (Rivi-lähde ja rivikohtainen laskenta jäävät P3:een); tapahtuman tiedot luetaan omasta Tapahtuman tiedot -palikasta (viite, oletus `tapahtuma`), ei varatusta sanasta; käyttönäkymässä taulukko näkyy P2:ssa viitteillä (Teksti, Monitori), koko rivijoukon esitys tulee P3:ssa. Koodi: `appiappi/index.html`, moottorin osio *P2: tietotaulukko, tapahtuman tiedot, puuttuva tieto ja tilannekuvat* ja käyttöliittymän osio *P2: tietotaulukko ja tapahtuman tiedot*. Kokeet: `testit/logiikka_47_taulukko.js`, `logiikka_48_tapahtuma.js`, `selain_54_taulukko.py`.

**Tietotaulukko (F02).** Logiikan palikka `taulu`. Sarakkeen tunniste `c1`, `c2` … ei vaihdu; näkyvä nimi ja viite (seuraa nimeä, ellei asetettu itse; varatut: valittu, valittunro, rivejä, tiedossa, koosteiden nimet). Lajit teksti, luku, kyllä/ei, päivämäärä, ajankohta, valinta (vaihtoehdot), riviviite (kohdetaulukko). Lähtöaineisto `rv` on rakennetta (Kumoa koskee sitä); käyttötieto `st[id]` syntyy ensimmäisestä muutoksesta kopiona, käytössä lisätyt rivit `u1` … Valittu rivi on käyttötietoa. Rakentajan taulukkoikkuna näyttää lähtöaineiston ja, kun käyttötieto on syntynyt, sen erikseen (Palauta lähtöaineistoon). Kenttämuutos tulee heti voimaan (D02); väärän lajin arvoa (myös pelkkä miinusmerkki) ei kirjoiteta, kenttä näkyy punaisena ja syy tekstinä. Sarakkeen lajin vaihto muuntaa arvot ja varoittaa, jos osa ei sovi; sarakkeen poisto kertoo täytetyt kentät ja viittaavat palikat.

**Kaavassa:** `taulu.rivejä`, `taulu.valittu` (riviviite), `taulu.valittunro`, `taulu.valittu.<sarake>`, riviviitteen kautta `taulu.valittu.<viite>.<sarake>`, lopuksi `.tiedossa`; koosteet `taulu.<sarake>.summa | keskiarvo | suurin | pienin | havaintoja | puuttuvia | virheitä | täydellinen`. Tallennettu kaava ja teksti käyttävät sarakkeen tunnistetta, joten nimen vaihto ei riko niitä. Koosteet ovat taulukon ominaisuuksia; ikkunamalliin kokoelman koosteet tuodaan P3:ssa (kohta 3).

**Toiminnot:** Lisää rivi (kentät kaavoina, arvot lasketaan lisäyshetkellä; yksikin virheellinen kenttä → riviä ei lisätä), Valitse rivi (ensimmäinen, seuraava, edellinen, viimeinen, valinnainen kierto, tapahtuman rivi, numerolla tai riviviitteellä, ei mitään), Poista rivi (valittu tai tapahtuman; valinta siirtyy seuraavaan) sekä Aseta arvo, Lisää, Vaihda ja Tyhjennä sarakkeeseen valitulla tai tapahtuman rivillä. Tyhjennä ilman saraketta tyhjentää rivit. Suunnitteluratkaisut: Lisää puuttuvaan alkaa nollasta ja Vaihda puuttuvasta antaa kyllä (toiminto on nimenomainen kirjoitus); lukitussa ketjussa kohteena oleva valittu rivi ja kentän nykyinen arvo luetaan oikeasta käyttötiedosta, toiminnon arvo lukukuvasta (kuten P1b:ssä). Taulukkotoiminnon sitten-tapahtuman rivi on muuttunut rivi.

**Tapahtuman tiedot (F04, D05).** Jokainen tapahtuma saa kuoren `{id, src, nm, at, vanha?, uusi?, rivi?}`: painallus (vanha ja uusi arvo), kentän muutos (vanha ja uusi, kun muutos laukaisee arvon nousun), muu tapahtuma (lähde ja uusi arvo). Kuori kulkee tapahtumanuolia pitkin, tallentuu ketjun suoritukseen (`cs.ev`) ja haaraan (`t.ev`) ja säilyy odotusten, sulkemisen ja viennin yli. Aliketju perii sen. Ketjun valmis-tapahtuma kantaa suorituksen kuoren. Taulukkotoiminnon jatkotapahtuma: uusi lähde, rivi, vanha ja uusi; tunniste ja aika ovat alkuperäisen tapahtuman (sama `eventId` tunnistettavissa). Palikan ominaisuudet: `uusi`, `vanha`, `rivi`, `rivi.<sarake>` (luetaan nyt), `lähde`, `aika`, `päivä`, `tunniste`, `on`, `taulukko`. Tapahtuman ulkopuolella (esim. näkymän teksti) tyhjä. Ketjun lukitus ei muuta kuorta.

**Puuttuva tieto (F06, D06).** Taulukon puuttuva kenttä on kaavassa oma arvonsa: lasku sen kanssa on tuntematon (–), `== tyhjä` pätee, suuruusvertailu on tuntematon, kyllä/ei-ehdossa ei pädä. Koosteet ohittavat puuttuvat; tyhjä summa 0, muuten kokonaan puuttuva tai tyhjä keskiarvo/suurin/pienin tuntematon; virheellinen rivi (esim. poistettuun riviin osoittava viite) estää koosteen ja kertoo rivit; sarakkeen *Koosteet vaativat täydelliset tiedot* tekee yhdestä puuttuvasta tuntemattoman. Vanhojen palikoiden tyhjä (Arvo, Muisti, Lukukenttä) on ennallaan, ja vanha KESKIARVO-ikkuna ohittaa puuttuvan kuten tyhjän.

**Tilannekuva (F07, D01).** Lisää rivi -toiminnon kentät ovat tilannekuva: arvo kopioidaan lisäyshetkellä. Riviviitesarake on elävä viite: `kirjaus.valittu.tuote.hinta` lukee tuotteen nykyisen hinnan, `kirjaus.valittu.hinta` kirjaushetken. Erillistä Tallenna tilannekuva -toimintoa ei tehty (Lisää rivi kattaa kentät kerralla).

**Ei tehty tässä vaiheessa:** Rivi-lähde, rivikohtainen laskenta, suodatus, järjestys ja kokoelman ikkunakoosteet (P3); toistuva esitys (F05, P3); rakenteinen historia (F08, P4); uuden tapahtuman luonti nimenomaisena toimintona; Listan tai kaavion lähteeksi taulukko; riviviitteen kentät Muistista (`muisti.nimi`). Saman ketjun kahta kierrosta ei edelleenkään voi olla käynnissä yhtä aikaa (P1b:n rajaus), joten kaksi samanaikaista suoritusta koetaan kahdella ketjulla. `tapahtuma.rivi.<sarake>` luetaan sarakkeen viitteellä (taulukko selviää vasta tapahtumasta), joten sarakkeen viitteen vaihto katkaisee sen; virhe kertoo sarakkeet. Viitevirheet-lista ei vielä näytä poistettuja sarakkeita (kaava näyttää virheen).
