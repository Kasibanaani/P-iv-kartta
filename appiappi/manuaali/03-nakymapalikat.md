# Näkymäpalikat

Näkymäpalikat ovat se, mitä appin käyttäjä näkee ja napauttaa: painikkeet, kentät, tekstit, listat, kaaviot, kuvat ja koristeet. Ne asetellaan **Näkymä**-välilehdellä. Logiikka (nuolet, kaavat, toiminnot) tehdään **Logiikka**-välilehdellä, ja sama näkymäpalikka voi näkyä siellä laatikkona, jonka kohtiin nuolet tulevat ja josta ne lähtevät.

Luku perustuu Appi-appi 31:n koodiin (commit 77461d2).

## Perusliikkeet näkymässä

**Palikan lisääminen**
- Tietokone: paletti on vasemmalla. Jos ylhäällä on valinta *Näkymä / Logiikka*, valitse **Näkymä**. Vedä palikka (esim. *Painike*) kanvaasille tai napauta sitä, jolloin se ilmestyy näkyvän alueen keskelle.
- Puhelin: napauta alareunan **＋ Palikat**. Paletti aukeaa laatikkona; napauta palikkaa tai vedä se kanvaasille. Laatikko sulkeutuu itsestään.
- Paletin ryhmät näkymässä: **Ohjaimet** (Painike, Valintaruutu, Kytkin, Säädin, Tatti, Tekstikenttä, Lukukenttä, Päivämäärä), **Näyttö** (Laatikko, Teksti, Monitori, Kuva, Ilmoitus, Lista, Aikajana, Kaavio, Kalenteri, Toistin), **Koristeet** (Laatikko, Ympyrä, Lappu, Kehys, Sijainti, Alue, Reitti, Viiva). Toistin näkyy paletissa vasta, kun projektissa on Tietotaulukko.
- Näkymän palikkaa ei voi pudottaa logiikan puolelle (appi sanoo ”Tämä palikka kuuluu näkymän puolelle.”).

**Valinta, siirto ja koko** (muokkaustilassa)
- Napauta palikkaa: se valitaan, ja sen asetukset (paneeli) avautuvat. Tietokoneella paneeli on oikealla; puhelimella napauta alareunan **Asetukset**.
- Vedä palikkaa siirtääksesi. Ruudukko kohdistaa 10 px:n välein; tietokoneella Vaihto-näppäin (⇧) ohittaa kohdistuksen. Kohdistuksen voi ottaa pois: **⚙︎ Asetukset** → *Kohdista ruudukkoon*.
- Koko: vedä palikan oikean alakulman kahvasta.
- Tietokoneella ⇧ + napautus lisää palikan monivalintaan.

**Käyttöön ja takaisin**
- Yläpalkin **🔒 Lukitse** vie näkymän käyttötilaan: palikat toimivat kuten valmiissa appissa. Nappi muuttuu muotoon **✏️ Muokkaa**, josta palataan muokkaamaan.
- Muokatessa näkymä näyttää palikoiden *perusarvot* (paneelin arvot). Logiikan ohjaamat arvot (esim. siirto, ohjattu leveys, toiminnon asettama väri) näkyvät vasta käytössä.

**Paneelin alaosan napit (näkymäpalikalla):** *Tuo eteen*, *Vie taakse*, *Monista*, *Näytä logiikassa* (tekee palikasta laatikon logiikkaan, jos sitä ei vielä ole, ja siirtyy sinne), *Tallenna presetiksi…*, *Poista palikka*.

## Kaikille näkymäpalikoille yhteistä

Tämä osa koskee kaikkia näkymäpalikoita paitsi Sijaintia ja Aluetta (niillä on vain paikka ja koko) ja Toistinta (vain *näkyy kun* ja *rivit*).

## Paneelin yhteiset osiot

Paneeli on ylhäältä alas suunnilleen tässä järjestyksessä:

| Osio | Mitä siinä on |
|---|---|
| (yläosa) | **Nimi**, **Tunnus** (viite ja joukot `#nimi`), **Lisätieto**. Nimi ei näy käyttäjälle. Viite on lyhyt nimi kaavoihin ja teksteihin (esim. `painike`); se seuraa nimeä, kunnes kirjoitat oman. Erikoispalikalla tässä on ✦-laatikko ja poikkeuksen syy. |
| **Sisältö** | Palikan oma teksti ja lajikohtaiset asetukset (katso kunkin palikan merkintä). |
| **Kun painetaan / Kun valitaan** | Pikatoiminnot (vain Painike, Valintaruutu, Kytkin). |
| **Rivin sarake** | Näkyy syöttäville ohjaimille, kun projektissa on Tietotaulukko (muokkauslomake, luku [Tieto](07-tieto.md)). |
| **Arvo, kun valittu** | Painike (ei kertapainallus), Valintaruutu, Kytkin. |
| **Näkyvyys** | Näkyy kun, harmaana kun, syy. |
| **Väri** | Väri, vaihtoväri, vaihtovärin ehto, läpinäkyvyys. |
| **Animointi** | Ilmestyy, katoaa, kesto, pehmeys, arvo vaihtuu, paikka vaihtuu (kiinni, kun mitään ei ole valittu). Ks. alla. |
| **Este ja osuma-alue** | Este, osuma-alue, massa, kimmoisuus (luku [Maailma ja liike](08-maailma-ja-liike.md)). |
| **Käyttöraahaus** | Raahattava käytössä (kiinni oletuksena). |
| **Paikka ja koko** | X, Y, Leveys, Korkeus; Näkymä (jos näkymiä on monta); laitenäkymässä *Laitteen ruudussa* -napit ja *Rullausvauhti*; *Kerros* (jos kerroksia on monta); *Monista* (N kpl alle/viereen tai ruudukoksi). |
| **Ulkoasu** | *Kopioi ulkoasu* ja *Liitä ulkoasu*: koko ja värit, samalle lajille myös tekstin koko, lihavointi, tasaus ja muoto. |
| **Ominaisuudet** | Kaikki, mihin kaava voi viitata (kiinni oletuksena, avautuu otsikosta). |
| **Miksi?** | Näkyy, kun palikan näkyvyys tai harmaus riippuu jostain. |
| (yhteydet) | Mistä palikka saa arvonsa ja missä sitä käytetään (napauta = siirry). |

## Yhteiset sisäänmenot (kohdat logiikassa)

Logiikan laatikossa jokaisella näkymäpalikalla on nämä kohdat vasemmalla. Kaikki ovat *arvo*-kohtia (eivät tapahtumia).

| Kohta | Mitä tekee |
|---|---|
| **näkyy kun** | Palikka näkyy, kun tuleva arvo pätee (kyllä). Jos nuolia on monta, kaikkien pitää päteä. Nuoli korvaa paneelin *Näkyvyys*-valinnan. |
| **harmaana kun** | Palikka on harmaa eikä käytettävissä, kun tuleva arvo pätee. Monesta nuolesta yksikin riittää. Toimii yhdessä paneelin *Harmaana*-valinnan kanssa. |
| **teksti** | Palikan näkyvä teksti tulee nuolesta (korvaa paneelin tekstin). |
| **vaihtoväri kun** | Palikka vaihtaa *vaihtoväriin*, kun tuleva arvo pätee. Korvaa paneelin *Vaihtoväri käytössä* -valinnan. |
| **siirto x** | Luku pikseleinä, joka **lisätään** palikan vaakapaikkaan. Vain käytössä. |
| **siirto y** | Sama pystysuunnassa (alas +). |

Lisäksi Ominaisuudet-osiosta voi avata ohjattavien ominaisuuksien kohtia (esim. *leveys*), katso alempana.

Arvokohta voi ottaa vastaan myös kyllä/ei-arvon mistä tahansa palikasta, jolla on arvo (esim. Valintaruutu, Vertailu, Kaava).

## Näkyvyys-osio

**Näkyy:** kolme valintaa *Aina* (oletus), *Kun pätee*, *Kun ei päde*. Kahdessa jälkimmäisessä valitse alta palikka (*Valitse palikka…*), jonka arvo ratkaisee. Nappi **ƒ Näkyy, kun kaava pätee** tekee logiikkaan Kaava-palikan, jonka tulos menee kohtaan *näkyy kun*; kirjoita kaava (esim. `vastaus = "kyllä"`). Kun kohtaan tulee nuoli, osio näyttää lähteet napautettavina siruina ja napin *ƒ Lisää ehto kaavana*.

Kun näkyvyydelle on ehto, avautuvat:
- **Kun ei näy:** *Piilossa* (oletus; ei näy, muut pysyvät paikoillaan), *Harmaana* (himmeä, ei käytettävissä), *Vain luettava* (vain ohjaimilla: näkyy tavallisena, mutta arvoa ei voi muuttaa).
- **Syy (näkyy palikan alla):** esim. ”Vastaa ensin kysymykseen 1”. Näkyy harmaan tai vain luettavan palikan alla.
- **Arvo, kun ei näy** (vain ohjaimilla): *Säilyy* (oletus), *Palautuu alkuun* (arvo nollautuu, kun palikka piiloutuu, eikä palaa), *Pois laskuista* (arvo pysyy muistissa, mutta laskuissa palikka on tyhjä, kun se ei näy).

**Harmaana:** valinta *kun pätee / kun ei päde* ja palikka (oletus *ei koskaan*). Nappi **ƒ Harmaana, kun kaava pätee**.

Jos sääntöjä on monta, rajoittavin voittaa: piilossa, sitten harmaana, sitten vain luettava. Jos palikan kerros on piilotettu käytössä, palikka on piilossa.

Muokkaustilassa piilotettu palikka näkyy haaleana, jotta sitä voi muokata.

## Animointi-osio

Miltä palikka näyttää, kun se tulee näkyviin, katoaa, vaihtaa arvoa tai siirtyy (Appi-appi F29, vaiheet 1 ja 2). Avattava osio *Väri*-osion alla; kiinni, kun mitään ei ole valittu.

- **Ilmestyy:** *Projektin oletus* (suluissa, mikä se on), *töks*, *häivytys*, *liuku ylhäältä*, *liuku alhaalta*, *liuku vasemmalta*, *liuku oikealta*, *kasvu*, *pomppu*.
- **Katoaa:** *Projektin oletus*, *Sama kuin ilmestyy* tai jokin samoista tavoista. Katoaminen on ilmestymisen peilikuva: *liuku ylhäältä* katoaa ylös.
- **Kesto (s):** tyhjä = projektin oletus (ilman oletusta 0,25 s). 0 = töks, enintään 10 s. Pilkku käy (`0,4`).
- **Pehmeys:** *Oletus*, *Pehmeä* (hidastuu loppua kohti), *Tasainen*, *Joustava* (menee hiukan yli ja palaa).
- **Arvo vaihtuu** (Appi-appi 42): *Projektin oletus*, *töks*, *ristihäivytys* (vanha sisältö häipyy, uusi tulee tilalle), *luku rullaa* (vanha liukuu pois ja uusi tulee tilalle; kasvava luku ylöspäin, pienenevä alaspäin). Vain palikoilla, jotka näyttävät arvon: Teksti, Muoto ja Monitori (kaikki kolme tapaa), Kuva, Painike ja Ilmoitus (töks ja ristihäivytys). Syötekentillä (Tekstikenttä, Lukukenttä, Säädin, Valintaruutu …) ei ole tätä kohtaa. Luku rullaa hakee suunnan ensimmäisestä luvusta tekstissä; ilman lukua se rullaa ylöspäin.
- **Paikka vaihtuu** (Appi-appi 42): *Projektin oletus*, *töks*, *liukuu*. Kun Aseta-toiminto, nuoli tai kaava siirtää palikan (`x`, `y`), palikka liukuu vanhasta kohdasta uuteen. Kaikilla näkymäpalikoilla.
- Kesto ja pehmeys ovat yhteiset kaikille neljälle.

Projektin oletus asetetaan kohdassa **⚙︎ Asetukset → Projektin animointi** (luku [Työympäristö](02-tyoymparisto.md)). Ilman oletusta ja omaa valintaa palikka on töks, kuten ennen.

Säännöt:
- **Pelkkä näyttö.** Animaatio ei muuta palikan paikkaa, kokoa, osuma-aluetta eikä mitään logiikan arvoa. `.näkyy` vaihtuu heti: piilotettu palikka ei ota napautuksia, vaikka se vielä häipyy, ja näkyviin tuleva painike toimii heti.
- **Keskeytys kääntyy:** jos palikka tulee takaisin kesken katoamisen (tai päinvastoin), animaatio kääntyy siitä kohdasta, ei hyppää.
- Ilmestyy ja katoaa koskevat näkyvyyden muutoksia: *näkyy kun* (asetus, nuoli tai kaava), käytössä piilotettu kerros ja Kerros-palikka. Ei koske harmaaksi muuttumista.
- **Paikka:** oikea paikka (`x`, `y`, osuma-alue, törmäykset) on uusi heti; vain kuva liukuu perässä. Liikkeen ohjaama palikka, käyttöraahaus, kamera ja Toistimen kortin palikat eivät liu'u.
- **Uusin voittaa:** jos arvo tai paikka vaihtuu uudestaan ennen kuin edellisestä muutoksesta on kulunut kesto, uusi näkyy heti ilman animaatiota. Siksi jatkuva muutos (Muutos ajassa, Sekuntikello, Liike) pysyy töksinä eikä puuroudu.
- Arvo vaihtuu ei animoi siirtymää muokkauksesta käyttöön eikä palikan ilmestymistä (silloin ilmestyy-tapa).
- Toistimen korttien palikat animoituvat samoin, mutta muut kortit eivät liu'u tilalle.
- Ketjun efekti (Animaatio, Teksti ilmestyy, Kuva vaihtuu) voittaa sillä kertaa: se keskeyttää palikan oman animaation, ja efektin aikana arvo ja paikka vaihtuvat töksinä.
- **Vähennä liikettä** (iPhonen asetus *Käyttöapu → Liike*): kaikki palikoiden animoinnit ovat töks. Ketjun efekteistä jää silloin vain häivytys: Animaatio-efektin liike ei näy, ja Kuva vaihtuu- ja Näkymänvaihto-efektien liuku on häivytys.
- Toimii vain käytössä (🔒 tai 🧪), ei muokatessa.

Logiikka voi ohjata näitä kuten muitakin ominaisuuksia (taulukko alla): esim. yksi Arvo *3* nuolella monen palikan kohtaan *animointi.kesto*. Tuntematon tapa (esim. `"lentää"`) on näkyvä virhe, ja palikka on silloin töks.

## Väri-osio

- **Väri** ja **Vaihtoväri:** kahdeksan värinappia. Sisäisesti värit ovat 0–7 (`hue`, `hue2`), kaavassa ja Ominaisuuksissa ne näkyvät numeroina 1–8.
- **Vaihtoväri käytössä:** *kun pätee / kun ei päde* ja palikka (oletus *ei koskaan*). Tai nuoli kohtaan *vaihtoväri kun*.
- **Läpinäkyvyys (%):** 0 = näkyy kokonaan, 100 = ei näy lainkaan (mutta on paikallaan ja painettavissa). Muokatessa palikka näkyy aina vähintään haaleana.

Värit tulevat teemasta, joten sama numero näyttää erilaiselta vaalealla ja tummalla ilmeellä. Väriä ei voi valita vapaasti (esim. heksakoodina).

## Teksti ja upotetut viitteet

Useimmilla palikoilla on tekstikenttä (*Painikkeen teksti*, *Teksti* tai *Otsikko*). Tekstiin voi upottaa toisen palikan arvon:

- `@viite`, esim. `Unta @uni h` (Appi-appi 54; viittaustavan voi vaihtaa ⚙︎ Asetuksista: `@`, `§` tai `{ }`). Viite päättyy itsestään välilyöntiin tai välimerkkiin. Käppyrät käyvät aina: `{uni}` ja palikan nimi `{Uni}`.
- `@viite.ominaisuus`, esim. `@otsikko.näkyy` tai `@lista.rivejä`: sama arvo kuin kaavassa `viite.ominaisuus`.
- Tarkat säännöt (taivutus `@uni:n`, `@@`, tuntematon sana): [Tekstiin upotetut viitteet](06-kaavat.md#tekstiin-upotetut-viitteet).
- Nappi **＋ Viittaus** kentän vieressä lisää viittauksen valikosta.
- **Suoraan palikkaan kirjoittaminen (Appi-appi 52):** muokkaustilassa kaksoisnapsauta (puhelimella napauta kahdesti) Laatikkoa, Tekstiä, Painiketta, Ilmoitusta, Valintaruutua, Kytkintä, Säädintä, Tekstikenttää, Lukukenttää, Päivämäärää, Listaa tai Aikajanaa, tai valitse palikka ja paina **Enter**. Palikan oma teksti (otsikollisissa otsikko) aukeaa kirjoitettavaksi samalla fontilla ja paikalla. Viitteet näkyvät kuten paneelissa (`Unta @unipisteet h`). `@` (tai valittu etumerkki), `{` tai nimen alku tuo samat viite-ehdotukset kuin paneelissa; kun `@` tai `{` on auki, **Enter** (tai **Tab**) ottaa ensimmäisen ehdotuksen. Kun viite on jo kirjoitettu kokonaan (ehdotus on sama kuin kirjoitettu), **Enter** tallentaa. Ohjerivillä lukee *@ tuo viitteen*. **Enter** tai napautus muualle tallentaa, **⇧Enter** tekee uuden rivin (vain Muodoissa kuten Laatikko ja Tekstissä; muissa ⇧Enter tallentaa), **Esc** peruu. Koko kirjoitus on yksi ⌘Z-askel, ja paneelin tekstikenttä päivittyy samaan (rivinvaihdollinen teksti näkyy paneelissa monirivisenä kenttänä). Lukittuna ja 🧪 Kokeile-tilassa kirjoitusta ei ole.
- **Uusi Laatikko tai Teksti** paletista (myös Ympyrä, Lappu ja Kehys, jotka ovat Muotoja) aukeaa heti kirjoitukseen: Tekstin oletusteksti on valittuna, joten kirjoittaminen korvaa sen; napautus muualle pitää sen. Esc jättää palikan ja peruu vain kirjoituksen.
- **Jos teksti tulee nuolesta tai kaavasta** (kohta *teksti*, myös **ƒ Teksti kaavasta**), kirjoitus ei avaudu. Palikan viereen tulee hetkeksi kupla *Teksti tulee nuolesta: Nimi ›* (kun lähde on Kaava: *Teksti tulee kaavasta: Nimi ›*, Appi-appi 58); sen napautus vie lähteeseen logiikkaan.
- Jos nimeä ei löydy, kentän alle tulee punainen varoitus ”⚠ Nimeä {…} ei löydy.”
- **Viitelappu muokatessa (Appi-appi 50):** palikka näyttää aina arvon (`Unta 7 h`). Muokatessa sen yläreunan yläpuolella on lisäksi pieni katkoviivainen lappu, josta näkee, mistä teksti tulee: tekstin viitteet `@unipisteet, @laatu` (kuten paneelin kentässä, valitulla viittaustavalla, sama viite vain kerran) tai nuolesta tuleva teksti *⇐ Kaavan nimi*. Valitulla palikalla lappu on nimilapun yläpuolella. Lukittuna ja 🧪 Kokeile-tilassa lappua ei ole, eikä palikka liiku lukittaessa. Tavallisella tekstillä ilman viitteitä lappua ei ole. Pois päältä: **⚙︎ Asetukset** → Muokkaus → *Näytä viitteet muokatessa*: Ei (koskee tätä selainta).
- Tekstiin ei voi kirjoittaa laskua viitteeseen (esim. `@uni * 2` näyttää arvon ja tekstin ` * 2`, `{uni * 2}` ei toimi). Laskettu teksti tehdään napilla **ƒ Teksti kaavasta**: se tekee Kaava-palikan, jonka tulos menee kohtaan *teksti*, esim. kaava `"Unta " + uni + " h"`.

Teksti ilmestyy -efekti (logiikka) voi vaihtaa Tekstin, Muodon, Ilmoituksen ja Painikkeen tekstin; uusi teksti jää voimaan, kunnes toiminto *Palauta perusarvo* poistaa sen. Nuoli kohtaan *teksti* voittaa sen.

## Yhteiset ominaisuudet (Ominaisuudet-osio)

Ominaisuudet-osio luettelee rivi kerrallaan kaiken, mihin kaava voi viitata, ja nykyisen arvon. Rivin viite (esim. `painike.leveys`) on nappi: napautus kopioi viitteen. Ohjattavilla ominaisuuksilla rivin lopussa on napit:

| Nappi | Mitä tekee |
|---|---|
| **ƒ** | Tekee Kaava-palikan, jonka tulos ohjaa tätä ominaisuutta (avaa samalla kohdan logiikassa). |
| **⇢** | Avaa ominaisuudelle kohdan palikan laatikkoon logiikassa (esim. kohta *leveys*), johon voi vetää nuolen. Jos palikkaa ei vielä ole logiikassa, se lisätään. |
| **×** | Sulkee avatun kohdan (vain jos siihen ei tule nuolta). |
| **asetettu ↺** | Näkyy, kun toiminto (Aseta, Lisää, Aseta tila, Vaihda tai käyttöraahaus) on asettanut arvon. Napautus palauttaa perusarvoon. |

Merkki **ƒ** arvon vieressä tarkoittaa, että arvo tulee nuolesta tai kaavasta. Otsikossa näkyy määrä, esim. ”2 ohjattu”, ”1 asetettu”.

**Etusija:** nuoli tai kaava kohtaan voittaa, sitten toiminnon asettama arvo, sitten paneelin perusarvo. Toiminto *Palauta perusarvo* poistaa asetetun arvon (valinnalla *Mikä palautetaan*: yksi ominaisuus tai kaikki).

Kaikilla näkymäpalikoilla (paitsi Sijainti, Alue, Toistin) on nämä:

| Kaavassa | Laji | Ohjattava | Mitä on |
|---|---|---|---|
| `.arvo` | arvo | ei | palikan arvo (vain palikoilla, joilla on arvo ulos) |
| `.näkyy` | kyllä/ei | ei (luettava) | näkyykö palikka nyt |
| `.tila` | teksti | ei | `näkyy`, `luettava`, `harmaa` tai `piilossa` |
| `.teksti` | teksti | ei | näkyvä teksti |
| `.vaihtoväri` | kyllä/ei | ei | onko vaihtoväri käytössä |
| `.x`, `.y` | luku | kyllä | paikka pikseleinä |
| `.leveys`, `.korkeus` | luku | kyllä | koko pikseleinä, vähintään 8 |
| `.väri`, `.väri2` | luku 1–8 | kyllä | väri ja vaihtovärin sävy |
| `.läpinäkyvyys` | luku 0–100 | kyllä | 0 = näkyy kokonaan |
| `.järjestys` | luku | kyllä | suurempi on päällä saman kerroksen sisällä |
| `.rullausvauhti` | luku 0–100 | kyllä | laitenäkymässä: 100 = sormen mukana, 0 = lukittu ruutuun |
| `.kierto` | luku | kyllä | kierto asteina myötäpäivään (sisältö kääntyy, paikka ja osuma-alue eivät) |
| `.peilattu` | kyllä/ei | kyllä | peilaus vaakasuunnassa |
| `.este` | kyllä/ei | kyllä | liikkuvat palikat eivät mene läpi |
| `.massa` | luku | kyllä | paino törmäyksissä |
| `.kimmoisuus` | luku 0–200 | kyllä | 0 = tömähtää, 100 = pomppaa |
| `.animointi.ilmestyy` | valinta | kyllä | kaavassa näkyvällä nimellä: `töks`, `häivytys`, `liuku ylhäältä`, `liuku alhaalta`, `liuku vasemmalta`, `liuku oikealta`, `kasvu`, `pomppu`. Ohjaus hyväksyy myös numeron 1–8 ja vanhat sisäiset nimet (`haivytys`, `ylhaalta` …) |
| `.animointi.katoaa` | valinta | kyllä | `sama kuin ilmestyy` (oletus) tai jokin ilmestymisen tavoista (numerolla 1 = sama, 2–9 tavat; ohjaus hyväksyy myös `sama`) |
| `.animointi.kesto` | luku 0–10 | kyllä | sekunteina, oletus 0,25; 0 = töks |
| `.animointi.pehmeys` | valinta | kyllä | `pehmeä` (oletus), `tasainen`, `joustava` |
| `.animointi.arvo` | valinta | kyllä | vain Teksti, Muoto, Monitori: `töks` (oletus), `ristihäivytys`, `luku rullaa` (1–3); Kuva, Painike, Ilmoitus: `töks`, `ristihäivytys` (1–2). Projektin oletus *luku rullaa* on näillä ristihäivytys |
| `.animointi.paikka` | valinta | kyllä | `töks` (oletus), `liukuu` (1–2) |
| `.ruutux`, `.ruutuy` | luku | ei (laskettu) | keskipisteen ruutu kerroksen ruudukossa (1 = ensimmäinen); tyhjä ilman ruudukkoa |

Näkyvyyttä, tilaa, tekstiä ja vaihtoväriä ei ohjata Ominaisuuksista vaan omista kohdistaan (*näkyy kun*, *harmaana kun*, *teksti*, *vaihtoväri kun*). Monet ominaisuudet hyväksyvät myös muita nimiä (esim. `vari`, `lapinakyvyys`, `kulma`).

Ominaisuuksien arvot rajataan: esim. väri 12 → 8, läpinäkyvyys −5 → 0.

## Siirto x/y ja ominaisuus x/y

Molemmat siirtävät palikkaa, mutta eri tavalla:
- **siirto x / siirto y** (nuoli kohtaan) **lisää** luvun paikkaan. Sopii esim. Liike-palikan tai Muutos ajassa -palikan tulokselle.
- **ominaisuus x / y** (Ominaisuudet, toiminto Aseta tai nuoli avattuun kohtaan) **korvaa** paikan.

Kumpikin näkyy vain käytössä; muokatessa palikka on paneelin X/Y-kohdassa.

## Käyttöraahaus (osio *Käyttöraahaus*)

Lukitussa käytössä palikkaa voi siirtää sormella tai hiirellä, kun osiossa on rasti **Raahattava käytössä**. Ei koske Sijaintia, Aluetta, Toistinta eikä Toistimen kortin palikoita.

- **Suunta:** *Vapaa*, *Vain vaaka*, *Vain pysty*.
- **Kohdista ruudun keskelle:** näkyy, kun palikan kerroksella on ruudukko.
- **Pudotus:** *Minne vain* tai *Vain alueisiin*. Vain alueisiin: näkymän Alue-palikat näkyvät raahatessa katkoviivoina ja kohdealue korostuu; muualle pudotettu palaa paikalleen.
- Alle 6 px liike on tavallinen napautus, joten raahattava painike toimii edelleen painikkeena.
- Lähellä ruudun reunaa näkymä vierii (kun rullaus on mahdollista).
- Paikka on käyttötietoa: rakenne ei muutu. Uusi paikka on *asetettu* x ja y (Ominaisuuksissa ”asetettu ↺”), joten *Palauta perusarvo* tai käyttötietojen tyhjennys palauttaa alkupaikan.

**Tapahtumat (lähtevät kohdat, vain kun raahattava on päällä):**

| Kohta | Milloin |
|---|---|
| **raahaus alkoi** | sormi on liikkunut yli 6 px |
| **pudotettu** | palikka jäi uuteen paikkaan |
| **raahaus peruttu** | pudotus hylättiin (vain alueisiin ja ei alueella), kosketus keskeytyi tai toinen sormi aloitti nipistyksen |

Tapahtuman tiedoissa (Tapahtuman tiedot -palikka, viite yleensä `tapahtuma`): `tapahtuma.kohde` (pienin Alue, jonka sisään palikan keskipiste osui, nimenä), `tapahtuma.x`, `tapahtuma.y` (uusi paikka), `tapahtuma.ruutux`, `tapahtuma.ruutuy` (jos ruudukko).

## Tapahtuma muuttui

Syöttävillä ohjaimilla on lähtevä tapahtuma **muuttui**: Säädin, Tekstikenttä, Lukukenttä, Valintaruutu, Kytkin, Päivämäärä ja Lista. (Painike, Kalenteri ja Tatti lähettävät omat tapahtumansa.)

- Lähtee vain, kun **käyttäjä** muuttaa arvoa. Logiikan Aseta tai muu toiminto ei lähetä sitä, joten *muuttui → Aseta samaan palikkaan* ei jää kiertämään.
- Lähtee vain, jos arvo todella vaihtui. Lista lähettää sen jokaisesta muutoksesta (rasti, päivämäärä, poisto, uusi rivi).
- Tekstikenttä lähettää sen vasta, kun kirjoitus päättyy: kenttä menettää kohdistuksen (puhelimella näppäimistön *Valmis*) tai painetaan Enter.
- Säädin lähettää sen jokaisesta askeleesta vedettäessä.
- Tapahtuman tiedoissa `tapahtuma.uusi` ja `tapahtuma.vanha` (ja kortissa `tapahtuma.rivi`).
- Pois käytöstä oleva palikka ei lähetä sitä.

## Arvo nuolena tapahtumakohtaan

Kun arvo (esim. Valintaruudun *arvo*) viedään nuolella tapahtumakohtaan (esim. Toiminnon *tee kun*), toiminto tehdään, kun arvo **muuttuu ei → kyllä**. Paluu kyllä → ei ei tee mitään.

## Ohjaimet

## Painike (`nappi`)
Painettava nappi. Se voi jäädä pohjaan kuin katkaisija, laskea painalluksia tai olla pohjassa vain painettaessa, ja se lähettää tapahtuman *painettu*.

- **Löytyy:** paletti, Näkymä → Ohjaimet → *Painike*.
- **Sisään:** yhteiset kohdat.
- **Ulos:**

| Kohta | Laji | Mitä |
|---|---|---|
| **on valittu** (Jää pohjaan) / **painalluksia** (Kertapainallus) / **on valittu** (Kertapainallus, arvo Kyllä ↔ ei) / **painetaan nyt** (Pohjassa vain painettaessa) | arvo | palikan arvo, katso Toiminta |
| **painettu** | tapahtuma | joka painalluksella; *Pohjassa vain painettaessa* -tilassa kun painaminen alkaa |
| **pitkä painallus** | tapahtuma | painettuna 0,5 s (vain lisätapahtumien kanssa) |
| **irrotettu** | tapahtuma | sormi nousee (vain lisätapahtumien kanssa) |
| **painalluksen kesto** | arvo | viimeisimmän painalluksen kesto sekunteina (vain lisätapahtumien kanssa) |

- **Asetukset (paneeli, osio Sisältö):**
  - **Painikkeen teksti** (oletus ”Painike”), *＋ Viittaus*, *ƒ Teksti kaavasta*.
  - **Toiminta:** *Jää pohjaan* (oletus: arvo vaihtuu kyllä ↔ ei joka painalluksella ja painike näkyy pohjassa), *Kertapainallus* (painike palautuu ylös), *Pohjassa vain painettaessa* (arvo on kyllä vain niin kauan kuin painetaan, esim. kaasu pelissä).
  - **Arvo** (vain Kertapainallus): *Painallusten määrä* (oletus: arvo kasvaa yhdellä joka painalluksella) tai *Kyllä ↔ ei* (arvo vaihtuu joka painalluksella, mutta painike ei jää pohjaan; määrä lasketaan silti).
  - **Näytä painallusten määrä painikkeessa** (vain Kertapainallus): määrä sulkeisiin tekstin perään.
  - **Pitkä painallus, irrotus ja painalluksen kesto:** lisää kolme lisäkohtaa. *Pohjassa vain painettaessa* -tilassa ne ovat aina mukana, joten valinta puuttuu.
  - **Ulkoasu:** *Painike* tai *Näkymätön kosketusalue* (ei näy käytössä mutta toimii; muokatessa katkoviiva). Aseta kuvan päälle ja paina *Tuo eteen*: kuvasta tulee painettava.
- **Kun painetaan (osio):** pikatoiminnot. Valitse *＋ Lisää toiminto…* -valikosta esim. *Aseta arvo*, *Lisää*, *Vaihda*, *Siirry*, *Näytä ilmoitus*, *Kirjaa*. Appi tekee logiikkaan Toiminto-palikan ja nuolen *painettu → tee kun* ja avaa toiminnon paneelin (yläreunassa paluunappi ‹ Painikkeen nimi). Toiminnot tehdään ylhäältä alas; × poistaa.
- **Arvo, kun valittu (osio, ei Kertapainallus):** kirjoita luku tai teksti ja paina Enter. Appi tekee VALITSE-palikan, jonka tulos on tämä arvo, kun painike on valittu (muuten tyhjä, laskuissa 0). Esim. pisteet SUMMA-ikkunaan.
- **Peliohjaimen nappi** (paneeli, osio Sisältö): *ei* (oletus) tai ohjaimen nappi (esim. *alanappi (Xbox A, PS ✕, Nintendo B, näppäin Välilyönti tai K)*) ja **Pelaaja** 1–4; pelaajalla 1 nappi toimii koneella myös näppäimistöllä. Käytössä ohjaimen nappi painaa painiketta kuin sormi: *painettu* lähtee heti napin mennessä alas, painike näkyy painettuna niin kauan kuin nappi on pohjassa, *Pohjassa vain painettaessa*, *pitkä painallus*, *irrotettu* ja kesto toimivat. Piilossa, harmaana tai muussa kuin auki olevassa näkymässä oleva painike ei reagoi. Jos usealla painikkeella on sama nappi, kaikki reagoivat (Miksi? luettelee ne). Ks. [Peliohjain](04-logiikkapalikat.md#peliohjain-pohj).
- **Ominaisuudet:** yhteiset; lisäksi `painike.painalluksia` (Kertapainallus) ja `painike.kesto` (lisätapahtumien kanssa).
- **Kaavassa:** `painike` antaa arvon: kyllä/ei tai Kertapainalluksessa määrän.
- **Aika ja tila:** arvo ja määrä ovat käyttötietoa (säilyvät, kun appi suljetaan). Toiminto *Tyhjennä* nollaa. Toiminnot *Valitse*, *Poista valinta*, *Vaihda*, *Aseta tila* muuttavat arvoa; Kertapainalluksen määrään *Valitse* lisää yhden.
- **Esimerkki:** Painike, Toiminta *Kertapainallus*, rasti *Näytä painallusten määrä painikkeessa*. Lukitse ja paina kolme kertaa: painikkeessa lukee ”Painike (3)”, `painike` = 3.
- **Toinen käyttö:** *Pohjassa vain painettaessa* + Liike-palikka: kaasu, joka toimii vain painaessa.
- **Huomio:**
  - Jos *pitkä painallus* -kohdasta lähtee nuoli, pitkä painallus korvaa tavallisen painalluksen (*painettu* ei lähde). Jos siitä ei lähde nuolta, tavallinen painallus tulee perille.
  - *Jää pohjaan* -tilassa *painettu* lähtee molempiin suuntiin. Jos haluat toiminnon vain pohjaan painettaessa, vie arvo *on valittu* toiminnon *tee kun* -kohtaan.
  - Painikkeelle ei voi antaa näppäimistön pikanäppäintä.

## Valintaruutu (`ruutu`)
Rastitettava ruutu tekstin kanssa: arvo on kyllä tai ei.

- **Löytyy:** Näkymä → Ohjaimet → *Valintaruutu*.
- **Sisään:** yhteiset.
- **Ulos:** **arvo** (kyllä/ei), **muuttui** (tapahtuma).
- **Asetukset:** **Teksti** (oletus ”Valintaruutu”).
- **Kun valitaan (osio):** pikatoiminnot kuten Painikkeella, mutta toiminnot tehdään, kun ruutu **muuttuu valituksi** (ei, kun rasti poistetaan).
- **Arvo, kun valittu (osio):** kuten Painikkeella.
- **Ominaisuudet:** yhteiset.
- **Kaavassa:** `valintaruutu` = kyllä/ei.
- **Aika ja tila:** käyttötietoa; säilyy. *Tyhjennä* palauttaa ei-valituksi.
- **Esimerkki:** Valintaruutu ”Join vettä” ja Teksti, jonka *Näkyvyys* on *Kun pätee* → Valintaruutu: teksti näkyy vain rastitettuna.
- **Huomio:** käytössä napautus mihin tahansa kohtaan ruudun korttia vaihtaa rastin. Vaihtoehtoryhmän (vain yksi valittuna) saa paletin Pikaluonnista *Vaihtoehtoryhmä…* (logiikan ikkuna, eri luku).

## Kytkin (`kytkin`)
Liukukytkin tekstin kanssa: toimii kuten Valintaruutu, eri ulkoasu.

- **Löytyy:** Näkymä → Ohjaimet → *Kytkin*.
- **Sisään / Ulos / Asetukset / osiot:** kuten Valintaruudulla (arvo kyllä/ei, muuttui; Teksti oletus ”Kytkin”; Kun valitaan; Arvo, kun valittu).
- **Kaavassa:** `kytkin` = kyllä/ei.
- **Esimerkki:** Kytkin ”Tumma ilme” ja Muoto, jonka *Vaihtoväri käytössä* on *kun pätee* → Kytkin.

## Säädin (`saadin`)
Vedettävä liukusäädin luvulle annetulla välillä.

- **Löytyy:** Näkymä → Ohjaimet → *Säädin*.
- **Sisään:** yhteiset.
- **Ulos:** **arvo** (luku), **muuttui**.
- **Asetukset:** **Otsikko** (oletus ”Säädin”), **Pienin** (0), **Suurin** (10), **Askel** (1), **Alkuarvo** (5), **Yksikkö** (esim. kg; näkyy luvun perässä). Otsikko ja nykyinen arvo näkyvät säätimen yläpuolella.
- **Ominaisuudet:** yhteiset; lisäksi ohjattavat `.pienin`, `.suurin`, `.askel`, `.alkuarvo`.
- **Kaavassa:** `säädin` = nykyinen luku.
- **Aika ja tila:** arvo on käyttötietoa. Ennen ensimmäistä liikutusta arvo on alkuarvo. *Tyhjennä* palauttaa alkuarvoon. Aseta rajataan pienimmän ja suurimman väliin.
- **Esimerkki:** katso resepti *Säädin ohjaa Monitoria*.
- **Huomio:** säädin seuraa sormea vapaasti (Appi-appi 21). Oikealla iPhonella ei tarkistettu.

## Tekstikenttä (`teksti`)
Kenttä, johon käyttäjä kirjoittaa tekstiä.

- **Löytyy:** Näkymä → Ohjaimet → *Tekstikenttä*.
- **Sisään:** yhteiset (kohta *teksti* on otsikko, ei kentän sisältö).
- **Ulos:** **arvo** (kirjoitettu teksti), **muuttui** (kun kirjoitus päättyy).
- **Asetukset:** **Otsikko** (oletus ”Tekstikenttä”), **Vihje tyhjässä kentässä**, **Rivejä** (1 = yksi rivi; yli 1 = monirivinen alue).
- **Ominaisuudet:** yhteiset; lisäksi `.vihje` (ohjattava), `.pituus` (merkkien määrä), `.tyhjä` (kyllä/ei).
- **Kaavassa:** `tekstikenttä` = teksti. Esim. `nimi.tyhjä` harmauttaa Lähetä-painikkeen.
- **Aika ja tila:** arvo päivittyy joka näppäilyllä (kaavat näkevät sen heti), mutta *muuttui* lähtee vasta lopuksi.
- **Esimerkki:** Tekstikenttä viitteellä `nimi`, Teksti ”Hei {nimi}!”.

## Lukukenttä (`luku`)
Kenttä luvulle sekä − ja + -napit.

- **Löytyy:** Näkymä → Ohjaimet → *Lukukenttä*.
- **Sisään:** yhteiset.
- **Ulos:** **arvo** (luku), **muuttui**.
- **Asetukset:** **Otsikko** (oletus ”Luku”), **Alkuarvo** (0), **Askel** (1, − ja + -nappien askel), **Pienin**, **Suurin** (tyhjä = ei rajaa), **Yksikkö** (näkyy kentän alla).
- **Ominaisuudet:** yhteiset; lisäksi ohjattavat `.alkuarvo`, `.askel`, `.pienin`, `.suurin`.
- **Kaavassa:** `luku` = nykyinen luku.
- **Aika ja tila:** käyttötietoa. Kirjoitettu arvo hyväksytään, kun kenttä menettää kohdistuksen tai painetaan Enter. Arvo rajataan pienimmän ja suurimman väliin.
- **Esimerkki:** Lukukenttä ”Askeleet”, Askel 1000, Suurin 30000.
- **Huomio:** jos kenttään kirjoitetaan jotain muuta kuin luku tai se tyhjennetään, arvoksi tulee 0 (lomakkeen kentässä tyhjä, luku [Tieto](07-tieto.md)). Kapeassa palikassa omat −/+ voivat peittää luvun.

## Tatti (`tatti`)
Ohjailutatti: nuppia vedetään sormella, ja se palaa keskelle, kun sormi nousee.

- **Löytyy:** Näkymä → Ohjaimet → *Tatti*.
- **Sisään:** yhteiset.
- **Ulos:**

| Kohta | Laji | Mitä |
|---|---|---|
| **etäisyys** | arvo | etäisyys keskeltä 0–1 |
| **vaaka** | arvo | −1…1, oikealle + |
| **pysty** | arvo | −1…1, alas + |
| **suunta** | arvo | asteina, 0 = ylös, 90 = oikealle |
| **alkaa** | tapahtuma | nuppiin tartutaan |
| **loppuu** | tapahtuma | sormi nousee |

- **Asetukset:** **Peliohjain** *ei* (oletus) / *vasen tatti* / *oikea tatti* ja **Pelaaja** 1–4: tatti seuraa peliohjaimen tattia (kuollut alue saman pelaajan Peliohjain-palikasta, muuten 0,15), nuppi liikkuu ruudulla ja *alkaa*/*loppuu* lähtevät kuten sormella. Pelaajan 1 vasen tatti liikkuu koneella myös nuolilla tai WASD:lla. Sormi voittaa, kun se koskee tattia. Piilotettu tatti seuraa silti, esim. *näkyy kun* `ohjain.yhdistetty = ei`. Ks. [Peliohjain](04-logiikkapalikat.md#peliohjain-pohj). Muuten ei omia asetuksia (paneelissa on tekstikenttä ilman otsikkoa; teksti ei näy tatissa).
- **Ominaisuudet:** yhteiset; lisäksi `.vaaka`, `.pysty`, `.suunta`, `.etäisyys`.
- **Kaavassa:** `tatti` = etäisyys.
- **Aika ja tila:** irrotettaessa kaikki arvot palaavat nollaan.
- **Esimerkki:** Liike-palikan nopeus x = `tatti.vaaka * 200` (luku [Maailma ja liike](08-maailma-ja-liike.md)). Kiihtyvä ohjaus: *etäisyys* Käyrän syötteeksi.
- **Huomio:** pysty on positiivinen alaspäin (avoin kysymys TILA.md:ssä).

## Päivämäärä (`pvm`)
Kenttä päivämäärälle ja *Tänään*-nappi.

- **Löytyy:** Näkymä → Ohjaimet → *Päivämäärä*.
- **Sisään:** yhteiset.
- **Ulos:** **arvo** (päivämäärä), **muuttui**.
- **Asetukset:** **Otsikko** (oletus ”Päivämäärä”), **Alkuarvo**: tyhjä, `tänään` tai päivämäärä, esim. `1.11.2026`.
- **Käytössä:** kirjoita esim. `24.12.2026`, `24.12.` tai `+5` (5 päivän päästä) ja paina Enter tai poistu kentästä; tai napauta **Tänään**. Kentän alla näkyy viikonpäivä, viikkonumero ja ”tänään / huomenna / 3 pv päästä”. Tunnistamaton teksti antaa ilmoituksen.
- **Ominaisuudet:** yhteiset; lisäksi lasketut `.viikko`, `.viikonpäivä` (nimi), `.päivä`, `.kuukausi`, `.vuosi`, `.päiviä` (päiviä tästä päivästä, menneet miinuksella).
- **Kaavassa:** `päivämäärä` = päivämäärä; esim. `lahja.päiviä`.
- **Aika ja tila:** käyttötietoa. Toiminto *Lisää* lisää päiviä.
- **Esimerkki:** Päivämäärä ”Seuraava kampaaja”, Teksti ”{kampaaja.päiviä} päivää”.

## Näyttö

## Teksti (`nayta`)
Näyttää tekstiä: otsikon, selityksen tai muiden palikoiden arvoja.

- **Löytyy:** Näkymä → Näyttö → *Teksti*.
- **Sisään:** yhteiset.
- **Ulos:** **arvo** = näkyvä teksti.
- **Asetukset:** **Teksti** (oletus ”Teksti”, viittaukset sallittu), **Koko** *S / M / L / XL* (oletus M), **Lihavoitu**, **Tasaus** *Vasen / Keski / Oikea*.
- **Ominaisuudet:** yhteiset; lisäksi ohjattavat `.koko` (S, M, L, XL tai 1–4), `.lihavoitu`, `.tasaus` (vasen, keski, oikea tai 1–3).
- **Esimerkki:** Teksti ”Painettu {painike} kertaa” päivittyy käytössä joka painalluksella.
- **Huomio:** käyttäjä ei voi muokata Tekstiä; syötteeseen tarvitaan Tekstikenttä.

## Ilmoitus (`ilmo`)
Huomiolaatikko (!-merkki ja teksti), joka näkyy, kun sen näkyvyysehto pätee.

- **Löytyy:** Näkymä → Näyttö → *Ilmoitus*.
- **Sisään:** yhteiset; tärkein on *näkyy kun*.
- **Ulos:** **näkyy** (kyllä/ei).
- **Asetukset:** **Ilmoituksen teksti** (oletus ”Ilmoitus”). Ehto valitaan Näkyvyys-osiosta tai nuolella kohtaan *näkyy kun*. Oletus *Aina* = näkyy aina.
- **Kaavassa:** `ilmoitus` = näkyykö.
- **Esimerkki:** Ilmoitus ”Unta alle 6 h!”, Näkyvyys: *ƒ Näkyy, kun kaava pätee*, kaava `uni < 6`.
- **Huomio:** tämä on pysyvä palikka näkymässä. Hetken näkyvä ilmoitus ruudun yläreunassa on eri asia: toiminto *Näytä ilmoitus*.

## Lista (`lista`)
Rastilista: käyttäjä lisää, rastittaa ja poistaa rivejä. Rivillä voi olla päivämäärä.

- **Löytyy:** Näkymä → Näyttö → *Lista*.
- **Sisään:** yhteiset.
- **Ulos:** **rastitettuja** (luku, palikan arvo), **rivejä** (luku), **kaikki rastitettu** (kyllä/ei; tyhjä lista = ei), **muuttui**.
- **Asetukset:** **Otsikko** (oletus ”Lista”), **Pohjarivit** (yksi rivi per rivi), **Päivämääräsarake (myöhästyneet punaisella)**, nappi **Palauta pohjariveihin**.
- **Käytössä:** napauta ruutua rastiaksesi, × poistaa rivin, alin kenttä *＋ Lisää rivi ja paina Enter*. Päivämääräsarakkeessa kirjoita päivä riville. Otsikon vieressä näkyy ”rastitettuja/rivejä”.
- **Ominaisuudet:** yhteiset; lisäksi `.rivejä`, `.rastitettuja`, `.kaikki`, `.myöhässä` (rastittamattomia, joiden päivä on mennyt), `.seuraava` (lähin tuleva päivä rastittamattomista), sekä rivit järjestysnumerolla: `lista.rivi1`, `lista.rivi1.rastitettu`, `lista.rivi1.pvm` (ylin = 1).
- **Kaavassa:** `lista` = rastitettujen määrä.
- **Aika ja tila:** rivit ovat käyttötietoa. Kun listaa on kerran käytetty, *Pohjarivien* muuttaminen ei enää näy, ennen kuin painetaan *Palauta pohjariveihin* (joka hävittää käyttäjän rivit ja rastit). Toiminto *Lisää riviksi listaan* lisää rivin logiikasta (teksti tai päivämäärä), *Tyhjennä* palauttaa pohjariveihin.
- **Esimerkki:** Lista ”Aamu” pohjariveillä Hampaat, Vesi, Venyttely; Teksti ”Valmis!” näkyy, kun `aamu.kaikki`.

## Aikajana (`aika`)
Merkinnät aikaleimoineen, uusin ylimpänä.

- **Löytyy:** Näkymä → Näyttö → *Aikajana*.
- **Sisään:** yhteiset.
- **Ulos:** **merkintöjä** (luku, arvo), **viimeisin päivä** (päivämäärä).
- **Asetukset:** **Otsikko** (oletus ”Aikajana”), **Lähde**: *Omat merkinnät (N)* (oletus) tai historiataulukko (Tietotaulukko, jossa on ajankohta-sarake). Omilla merkinnöillä napit **Tyhjennä merkinnät** ja, kun merkintöjä on, **Muunna historiaksi**.
- **Merkinnät tulevat** omilla merkinnöillä vain toiminnolla **Kirjaa** (esim. Painikkeen *Kun painetaan* → *Kirjaa*, kohde tämä aikajana, *Teksti*). Käyttäjä ei voi kirjoittaa aikajanaan suoraan eikä poistaa yksittäistä merkintää.
- **Lähde historiataulukko:** aikajana näyttää taulukon kirjaukset uusin ylimpänä: otsikkona rivin nimi (ensimmäinen tekstisarake), alla muut täytetyt kentät (*Määrä 1 · la 17.10.2026 klo 9.30 · vk 42*). Kirjaukset tulevat Kirjaa-toiminnolla taulukkoon, ja niitä muokataan taulukossa. Kirjaa-toiminnon kohteeksi ei voi valita aikajanaa, jolla on lähde. Arvot (`.merkintöjä`, `.viimeisin`, `.tänään`, `.viimeisin.teksti`, `.viimeisin.aika`) lasketaan silloin taulukon kirjauksista; päivä ja tänään päivän rajan mukaan.
- **Muunna historiaksi** (vain napista, ei koskaan itsestään): tekee uuden Tietotaulukon *‹nimi› historia* (sarakkeet Aika, Id, Teksti), kopioi merkinnät sen riveiksi, asettaa sen aikajanan lähteeksi ja vaihtaa tämän aikajanan Kirjaa-toiminnot kirjaamaan taulukkoon (Teksti muuttuu kaavaksi, esim. `"Tauko · jaksaminen " + jaksaminen`). Vanhat merkinnät jäävät aikajanaan omiksi merkinnöikseen: Lähde-valikosta *Omat merkinnät* näyttää ne taas. Kumoa perii muunnoksen.
- **Ominaisuudet:** yhteiset; lisäksi `.merkintöjä`, `.viimeisin` (päivä), `.tänään` (tänään kirjattuja), `.viimeisin.teksti`, `.viimeisin.aika` (kellonaika, esim. 7.05).
- **Kaavassa:** `aikajana` = merkintöjen määrä.
- **Esimerkki:** Painike ”Otin lääkkeen” → Kirjaa; Teksti ”Viimeksi {aikajana.viimeisin.aika}”. Rakenteinen versio: ks. [Kirjausappi](07-tieto.md#kirjausappi-mitä-otin-ja-milloin).

## Kaavio ✦ (`kaavio`)
Pylväs-, vaakapalkki- tai rengaskaavio valittujen palikoiden nykyisistä luvuista.
✦ Pelkkä esitys: ei anna arvoa ulos.

- **Löytyy:** Näkymä → Näyttö → *Kaavio*.
- **Sisään:** yhteiset.
- **Ulos:** ei mitään.
- **Asetukset:** **Otsikko** (oletus ”Kaavio”), **Laji** *Pylväät / Vaakapalkit / Rengas*, **Asteikon yläraja** (ei renkaalla; tyhjä = suurimman luvun mukaan), **Luvut**: *＋ Lisää palikka…* -valikko (palikat, joilla on arvo), × poistaa.
- **Ominaisuudet:** yhteiset; lisäksi ohjattava `.asteikko`.
- **Esimerkki:** kolme Säädintä (Uni, Liikunta, Stressi) Kaavion lukuihin.
- **Huomio:** nimet tulevat palikoiden nimistä ja värit kiinteästä järjestyksestä, ei palikoiden väreistä. Rengas laskee yhteen vain positiiviset luvut ja näyttää summan keskellä. Kaavio näyttää vain nykyhetken, ei historiaa.

## Monitori ✦ (`mittari`)
Näyttää minkä tahansa luvun reaaliajassa lukuna, palkkina, pylväänä, renkaana, kaarena tai pisteinä.
✦ Pelkkä esitys: ei anna arvoa ulos. Näytettävä arvo on ohjattava ominaisuus.

- **Löytyy:** Näkymä → Näyttö → *Monitori*.
- **Sisään:** yhteiset ja valmiiksi avattu kohta **arvo** (ominaisuus *arvo*).
- **Ulos:** ei mitään.
- **Asetukset:** **Muoto** *Luku / Palkki / Pylväs / Rengas / Kaari / Pisteet* (oletus Palkki), **Esitys** *Luku / Aika m:ss / Prosentti*, **Pienin** (0), **Suurin** (100), **Arvo (perusarvo)** (0), **Desimaalit** (tyhjä = enintään 2), **Yksikkö**, **Paksuus (%)** (ei Luku- eikä Pisteet-muodossa, 1–50, oletus 12), **Merkki** (vain Pisteet: ● ♥ ★ ■ ◆ ▲), **Luku näkyy** *Kyllä / Ei*. Otsikko on palikan teksti (paneelissa tekstikenttä ilman otsikkoa), väri palikan väri.
- **Ominaisuudet:** yhteiset; lisäksi ohjattavat `.arvo`, `.pienin`, `.suurin`, `.muoto` (nimi tai 1–6), `.esitys` (nimi tai 1–3), `.paksuus`.
- **Kaavassa:** `monitori.arvo`.
- **Esimerkki:** Sekuntikellon *kulunut* nuolella Monitorin kohtaan *arvo*, Esitys *Aika m:ss*.
- **Toinen käyttö:** elämät pisteinä: Muoto *Pisteet*, Merkki ♥, Pienin 0, Suurin 5; painike → *Lisää* → Monitori → *arvo* = −1.
- **Huomio:** Pisteitä on suurin − pienin, enintään 30. Arvo tulee nuolesta, kaavasta (Ominaisuudet → arvo → ƒ) tai toiminnoista Aseta / Lisää. Muokatessa näkyy perusarvo.

## Kuva ✦ (`pkuva`)
Näyttää kuvan (SVG-teksti, kuvatiedosto tai https-osoite) tai kuvasarjan animaationa.
✦ Pelkkä esitys: ei anna arvoa ulos.

- **Löytyy:** Näkymä → Näyttö → *Kuva*.
- **Sisään:** yhteiset sekä **kuva** (arvo: SVG-teksti tai osoite, korvaa paneelin kuvan) ja **pyörii kun** (kyllä/ei, kuvasarja pyörii).
- **Ulos:** ei mitään.
- **Asetukset:**
  - **Kuva (SVG-teksti tai osoite)**: liitä SVG-koodi (esim. tekoälyn piirtämä) tai https-osoite. Nappi **Valitse kuvatiedosto…** (PNG, JPEG, GIF, WebP tai SVG-tiedosto; tiedostosta näkyy koko kt), **Poista kuva**.
  - **Sovitus:** *Koko kuva näkyy* (oletus), *Täyttää alueen* (reunat voivat leikkautua), *Venytetään*.
  - **Kuvasarja (animaatio):** pääkuva on kuva 1. *＋ Lisää kuvatiedostoja…* tai liitä SVG/osoite kenttään ja *＋ Lisää*. Rivien ↑ ↓ muuttaa järjestystä, ✕ poistaa. Enintään 32 lisäkuvaa.
  - Kun kuvia on vähintään kaksi: **Nopeus (kuvaa sekunnissa)** (oletus 8), **Pyörii** *Ei / Aina / Kun liikkuu* (Kun liikkuu = Liike-palikka liikuttaa tätä palikkaa). Nuoli kohtaan *pyörii kun* korvaa valinnan.
  - Teksti on kuvan vaihtoehtoinen teksti (ei näy).
- **Ominaisuudet:** yhteiset; lisäksi `.kuvanopeus` (ohjattava, 0–60), `.kuvanro` (monesko kuva näkyy, 1 = pääkuva), `.pyörii`.
- **Aika ja tila:** pysähtyneenä näkyy pääkuva. Efekti *Kuva vaihtuu* vaihtaa pääkuvan, kunnes *Palauta perusarvo* palauttaa oman kuvan.
- **Esimerkki:** Kuva ja sen päällä Painike, jonka *Ulkoasu* on *Näkymätön kosketusalue* (*Tuo eteen*): kuvan kohta on painettava.
- **Toinen käyttö:** hahmon kävely: 3 kuvaa sarjassa, Pyörii *Kun liikkuu*.
- **Huomio:** muut osoitteet (esim. `javascript:`, `data:text/html`) eivät näy. Isot kuvatiedostot hidastavat tallennusta; SVG on kevyin.

## Kalenteri (`kalenteri`)
Kuukausinäkymä viikkonumeroineen. Merkitsee päivät, joilla on asioita, ja käyttäjä voi valita päivän.

- **Löytyy:** Näkymä → Näyttö → *Kalenteri*.
- **Sisään:** yhteiset.
- **Ulos:** **valittu päivä** (päivämäärä tai tyhjä), **päivä valittu** (tapahtuma).
- **Asetukset:** **Otsikko**, **Merkitse päivät**: *＋ Lisää palikka…* (Päivämäärä-palikat, Listat, Aikajanat, historiataulukot eli Tietotaulukot, joissa on ajankohta-sarake, ja logiikan palikat, joilla on arvo). Historiataulukon kirjaus merkitsee päivänsä päivän rajan mukaan, ja valitun päivän listassa se näkyy kellonaikoineen rivin nimellä, **Näytä valitun päivän asiat** (oletus päällä).
- **Käytössä:** ‹ ja › selaavat kuukausia, • palaa tähän kuuhun. Päivän napautus valitsee sen; saman päivän uusi napautus poistaa valinnan. Valitun päivän asiat näkyvät kalenterin alla. Merkityn päivän pisteen asiat näkyvät tietokoneella vihjeenä hiiren alla.
- **Ominaisuudet:** yhteiset; lisäksi `.kuukausi` (ohjattava: päivämäärä, jonka kuukausi näytetään; tyhjä = tämä kuu) ja `.valittu`.
- **Kaavassa:** `kalenteri.valittu`.
- **Aika ja tila:** valinta on käyttötietoa. *päivä valittu* lähtee vain valittaessa, ei valinnan poistuessa.
- **Esimerkki:** Lista päivämääräsarakkeella Kalenterin *Merkitse päivät* -kohtaan: listan päivät näkyvät pisteinä.

## Koristeet

## Muoto (`muoto`)
Laatikko, ympyrä, pilleri, lappu tai kehys, valinnaisesti tekstillä. Paletissa neljä valmista: *Laatikko*, *Ympyrä*, *Lappu*, *Kehys*.

- **Löytyy:** Näkymä → Koristeet.
- **Sisään:** yhteiset.
- **Ulos:** **arvo** = teksti.
- **Asetukset:** **Teksti**, **Muoto** *Laatikko / Ympyrä / Pilleri / Lappu / Kehys*, **Koko** S–XL, **Lihavoitu**. Teksti on aina keskellä.
- **Ominaisuudet:** yhteiset; lisäksi ohjattavat `.muoto` (nimi tai 1–5), `.koko`, `.lihavoitu`.
- **Esimerkki:** Laatikko taustaksi muiden palikoiden alle (*Vie taakse*), väri vaihtuu, kun ehto pätee (*Vaihtoväri käytössä*).
- **Huomio:** paletin *Viiva* on eri asia: koristeviiva kahden palikan välillä (napauta Viiva ja vedä palikasta toiseen). Se vain näyttää yhteyden, ei logiikkaa.

## Muut näkymän palikat lyhyesti

## Toistin ✦ (`toistin`)
Sama kortti jokaiselle Tietotaulukon tai Rivijoukon riville. ✦ Vain kohdat *näkyy kun* ja *rivit*, koska kortit ovat sen sisällä. Näkyy paletissa vasta, kun projektissa on Tietotaulukko. Katso luku [Tieto](07-tieto.md).

## Sijainti ✦ (`merkki`)
Piste, johon toiminto *Siirry* vie, ja näkymän alkukohta. ✦ Paikka, ei näkyvää sisältöä: ei näkyy kun -kohtia eikä käyttöraahausta. Lisätään paletin Koristeista tai kanvaasin napista **⌖ Sijainti**. Katso luku [Maailma ja liike](08-maailma-ja-liike.md).

## Alue ✦ (`alue`)
Suorakulmio tai ellipsi, joka tunnistaa, kun liikkuva palikka on sen sisällä, rajaa rullauksen ja ottaa vastaan raahauspudotuksia. ✦ Paikka, ei näkyvää sisältöä. Lisätään Koristeista tai napista **⛶ Alue**. Katso luku [Maailma ja liike](08-maailma-ja-liike.md).

## Reitti ✦ (`reitti`)
Piirretty viiva, jota pitkin Liike voi kulkea. ✦ Pelkkä esitys: ei anna arvoa ulos. Ominaisuudet `.pituus` ja `.pisteitä`. Katso luku [Maailma ja liike](08-maailma-ja-liike.md).

## Reseptit

### Painike, joka näyttää montako kertaa painettu
1. Näkymä-välilehdellä paletista *Ohjaimet* → **Painike** kanvaasille (puhelimella ensin **＋ Palikat**).
2. Paneelin *Sisältö*-osiossa: **Toiminta** → *Kertapainallus*. **Arvo** pysyy *Painallusten määrä*.
3. Nopein tapa: rasti **Näytä painallusten määrä painikkeessa**.
4. Tai erillinen teksti: paletista *Näyttö* → **Teksti**. Kirjoita sen *Teksti*-kenttään `Painettu @painike kertaa` (tai napauta *＋ Viittaus* ja valitse Painike). Tarkista Painikkeen viite paneelin *Viite*-kentästä.
5. **🔒 Lukitse** ja paina painiketta: luku kasvaa. Nollaus: lisää Painikkeelle toinen painike, jonka *Kun painetaan* → *Tyhjennä* → kohde Painike.

### Säädin ohjaa Monitoria
1. Lisää **Säädin** (Ohjaimet) ja **Monitori** (Näyttö). Aseta Säätimelle Pienin 0, Suurin 100, Alkuarvo 50.
2. Valitse Monitori. Avaa *Ominaisuudet*-osio ja paina rivin `monitori.arvo` kohdalla **ƒ**. Logiikkaan syntyy Kaava, joka on kytketty Monitorin kohtaan *arvo*.
3. Kirjoita kaavaksi Säätimen viite, esim. `säädin`.
4. Vaihtoehto ilman kaavaa: valitse Säädin → **Näytä logiikassa**; vedä logiikassa nuoli Säätimen kohdasta *arvo* Monitorin kohtaan *arvo* (Monitorin saa logiikkaan samalla napilla).
5. Monitorin paneelissa valitse **Muoto** (esim. *Rengas*) ja **Esitys** *Prosentti*.
6. Lukitse ja vedä säädintä: rengas täyttyy.

### Lisäkysymys näkyy vasta, kun ruutu on rastitettu
1. Lisää **Valintaruutu**, teksti ”Liikuitko tänään?”.
2. Lisää **Lukukenttä**, otsikko ”Minuutteja”.
3. Valitse Lukukenttä. *Näkyvyys*-osiossa valitse **Kun pätee** ja alta palikka Valintaruutu.
4. Valitse **Kun ei näy**: *Piilossa* (tai *Harmaana* ja **Syy** ”Rastita ensin”). Halutessasi **Arvo, kun ei näy** → *Pois laskuista*, jotta piilotetun kentän minuutit eivät mene laskuihin.
5. Lukitse: kenttä ilmestyy rastitettaessa.

### Lappu, jonka voi raahata vain laatikkoon
1. Lisää **Lappu** (Koristeet) ja **Alue** (Koristeet tai napista ⛶ Alue). Venytä Alue sopivaksi.
2. Valitse Lappu, avaa osio **Käyttöraahaus**, rasti **Raahattava käytössä**, **Pudotus** → *Vain alueisiin*.
3. Halutessasi ilmoitus: Logiikka-välilehdellä Lapun kohdasta *pudotettu* nuoli Toiminnon kohtaan *tee kun*, toiminto *Näytä ilmoitus*, teksti esim. `Pudotettu`.
4. Lukitse ja vedä lappu: alueen ulkopuolelle pudotettu palaa paikalleen.
5. Lapun alkupaikka palaa, kun asetettu x ja y palautetaan (Ominaisuudet → *asetettu ↺*, tai toiminto *Palauta perusarvo*).

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#näkymäpalikat).
