# Mätsik Forest: tila

**Vaihe:** versio 1.14. **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/matsik/ · **Päivitetty:** 15.11.2026

Juureen (`paatospuu/`) nojaava, mutta erillinen hoitosuunnitelmien demo- ja kehittämisappi. Kaikki sisältö on kuvitteellista, ja Emil kirjoittaa sen itse. Appi ei sisällä valmista dataa. Hahmotelma ja perustelut ovat projektikansiossa (`hoitojuuri/HAHMOTELMA.md`), ei tässä julkisessa repossa.

## Versio 1.14 (15.11.2026, Emil: pikanapit = listan asiat, eläinkohtaiset välit pois, tavoitteet yhdeksi riviksi)

- **Pikanapit ovat saman listan asioita.** Valikko → Tarkistusvälit ja järjestys -taulukossa on ensimmäisenä sarake *Pika* (pyöreä ruutu, vain käynneillä ja seurannalla): ruksi tekee asiasta pikamuistiinpanon napin. Napit näkyvät listan järjestyksessä. Erillinen pikanappiluettelo (`asetukset.pikat`, Luetteloiden kortti) poistui; pikaikkunan ratas vie taulukkoon. Pikaikkunan "+ Uusi valinta" lisää asian listaan (`sisallot[].pika`); jos nimi tai listan sana osuu olemassa olevaan asiaan (esim. Kotikäynti → Lähikäynti), se merkitään pikanapiksi eikä tuplaa tule.
- Pikapäivä on edelleen kertaluontoinen tarkistus, ja sen OK aloittaa saman asian välin alusta. Pikamuistiinpano osuu nyt vain omaan asiaansa (`n.pika.it` → merkinnän `pit`, `MF.eHit`), ei toiseen asiaan, vaikka teksti sopisi siihenkin.
- Uudet oletusasiat: Reseptiuusinta, Tiimausaika, Soitto (pika, ei väliä). Lääkärin vo-käynti, Verkosto ja Hoitoneuvottelu ovat oletuksena pikanappeja.
- **Siirto kerran** (`asetukset.pikaSis`): vanhat pikanapit samoiksi listan asioiksi nimen tai listan sanojen perusteella (Lääkärin vo-aika → Lääkärin vo-käynti, Hoitoneuvottelu, Verkosto), muut uusiksi asioiksi; pikamuistiinpanot osoittavat listan asiaan. Pikanappi, jota ei tunnistettu samaksi (esim. oma "Lähiaikuisen kontakti"), tulee listaan omaksi rivikseen; turhan voi poistaa Luetteloista.
- **Eläimellä ei ole omia välejä.** Välit tulevat vain listasta ja koskevat kaikkia eläimiä (`MF.effVali`). Eläimen sivun Hoitotoimet näyttää listan asioiden seuraavat kohdat listan järjestyksessä (+ Sovi / OK), käynnit muistiosta ja muodot; välinauha, välivalinnat ja "Välit alkaen" poistuivat. Siirto kerran (`asetukset.valiYht`): asia, jolla ei ollut yhteistä väliä, sai eläinten yleisimmän oman välin. Vanha `toimet.vali` jää dataan, mutta ei vaikuta. Eläinkohtainen herja "Käyntien ja seurannan välit valitsematta" poistui.
- **Tavoitteet on yksi rivi** listassa (`o:tavoite`, väli `valit.tavoite`, 4 vk – 12 kk) ja yksi kuittaus eläintä kohden (`kuit.tavoitteet`, vain OK). Vanhat taso × taho -rivit muuttuivat yhdeksi riviksi ensimmäisen paikalle; `tavValit` ja `tavJarj` poistuivat. Tavoitekartta (taso × taho) säilyy: tyhjissä ruuduissa lukee "puuttuu", ruutukohtaiset kuittaukset poistuivat, kartan alla on rivi "Tavoitteet kunnossa? OK", jossa näkyvät alueet ilman tavoitetta. Sama OK-rivi eläinlistan Tavoitteet-ruudussa.
- Muistutus "Tarkista tavoitteet", kun tavoitteita on eikä niitä ole kuitattu välin aikana (lasketaan vanhimmasta tavoitteesta); vanhentunut OK pyytää uutta. Tavoitekohtainen "Arvioi tavoite" -muistutus poistui; jumissa, seuranta (Ei), avoin toimenpide ja "Tavoitteet puuttuvat" jäivät. Arviointikierros on yhä tavoitekortilla.
- Korjattu: vanhentuneen OK:n napautus uusii kuittauksen (aiemmin tyhjensi sen).
- Testit: `logiikka.js` (siirrot, ei toistu, pikamuistiinpano vain omaan asiaansa, tavoitteiden yksi OK ja väli, vanhat tavoiterivit) ja `selain.js` (Pika-sarake, pikanapit listan järjestyksessä, sama asia tunnistetaan, eläimen sivulla ei välivalintoja, tavoitekartan yksi OK). Kaikki ok 390, 320 ja 1280 px. Ei tarkistettu oikealla iPhonella.
- Myöhemmin, erillinen ominaisuus (Emil 15.11.): päätöspuu tavoitetasoista × henkilöiden näkökulmista. Se voi käyttää samaa suunnitelmamateriaalia (tavoitekartta), mutta tarkistuslista tulee ensin eikä tarvitse tasoja.
- Avoin: kuuluuko pikanappien ja listan asioiden lajeihin (Käynti / Seuranta) lisätä kolmas laji muille (resepti, tiimaus).

## Versio 1.13 (15.11.2026, Emil: ohjetekstit pienen i-napin taakse, sarakeotsikot jäädytetyiksi)

- Pieni i-nappi (`ib(teksti)`) siinä kohdassa, missä ohjetta tarvitaan; napautus avaa ohjeen päälle (`#infop`), ulkopuolinen napautus sulkee eikä tee muuta. Uusia ohjeita ei lisätty, vain siirrettiin olemassa olevat.
- Siirretty i:n taakse: Tarkistusvälit ja järjestys (otsikkorivi), Portaat, Luetteloiden korttien ohjeet (pikanapit, sisällöt, muodot, mittarit), Periaatteet ja mittarit, sisällön Laji, ohjauksen arvio, mittausten "Muistiinpanon rivi … kirjaa itsestään", muistiinpanon "Tallentuu itsestään", kalenterin päivän tyhjä tila, eläimen muistiinpanojen tyhjä tila, osion tyhjä tila, pikamuistiinpanon kuukausivalitsin. Poistettu ponnahdusikkunoiden "Sulje napauttamalla ulkopuolelle" -rivit.
- Jätetty ennalleen: Valikon etusivun rivien kuvaukset, tyhjät tilat ilman ohjetta ("Ei kirjauksia"), poiston varoitus "Käytössä N eläimellä", tavoitteen ohjaava kysymys.
- Tarkistusvälien sarakeotsikot (1 vk … 12 kk) ovat jäädytettyinä otsikon alla ja vierivät sivuttain taulukon mukana.
- Testit: `selain.js` (i avaa ja sulkee, ei pitkiä ohjekappaleita, otsikot jäädytetty ja synkronoitu). Kaikki ok 390, 320 ja 1280 px. Ei tarkistettu oikealla iPhonella.

## Versio 1.12 (15.11.2026, Emil: yksi lista, ei rinnakkaista järjestyssivua)

- **Valikko → Tarkistusvälit ja järjestys** on yksi lista (33 riviä): käynnit ja seuranta, tavoitteet (taso × taho) ja osiot samassa taulukossa. Rivit raahataan kahvasta mihin tahansa kohtaan, myös lajin yli. Sarakkeet 1, 2, 3, 4 vk, 2, 3, 6, 12 kk; käynneillä ja seurannoilla 1 vk – 3 kk, tavoitteilla ja osioilla 4 vk (= 1 kk) – 12 kk (muissa sarakkeissa ei ruutua). Pitkä raahaus vierittää sivua, sivuvieritys säilyy napautuksessa. Taulukosta ei voi poistaa mitään.
- **Lista on ainoa tärkeysjärjestys** (`asetukset.jarj`, avaimet `s:id`, `t:taso.taho`, `o:osio`; `MF.jarj`). Muistutukset järjestyvät rivin mukaan Nyt-kortissa, eläinlistassa, viikon listassa ja kalenterin viikkonäkymässä. Oletus: tason 1 tavoitteet, käynnit ja seuranta, tasot 2–3, osiot. "Tavoitteet puuttuvat" noudattaa ylintä tavoiteriviä.
- **Poistettu:** Valikko → Muistutusten säännöt (lajien järjestys, Kiireellinen / Tavallinen / Pois). Punainen = tason 1 tavoitteen asia tai varattava kuluvalla tai ensi viikolla, muut keltaisia; lajia ei voi enää piilottaa. Vanha `asetukset.saannot` luetaan, mutta ei vaikuta. Portaat-valinta siirtyi listan alle.
- Luetteloiden Ylös/Alas (käyntien sisällöt) vaikuttaa enää vain näyttöjärjestykseen eläimen sivulla, ei tärkeyteen.
- Testit: `logiikka.js` (oletuslista, järjestys yli lajien, vanha sääntölista ei vaikuta, uusi sisältö asettuu käyntien perään) ja `selain.js` (yksi taulukko, raahaus yli lajirajan ja listan lopusta alkuun, sivuvieritys säilyy). Kaikki ok 390, 320 ja 1280 px.
- Ei tarkistettu: raahaus sormella iPhonessa (testattu hiiritapahtumilla), etenkin automaattinen vieritys pitkässä raahauksessa.
- Avoin: tarvitaanko osioille ja tavoitteille viikkovälit (nyt lyhin 4 vk); tarvitaanko lajin piilotus takaisin.

## Versio 1.11 (15.11.2026, Emil: kalenterin napit alapalkkiin, ei pomppimista)

- Kalenterin näkymävalinta (Viikko / Päivä, tietokoneella Viikko / Aikajana) on alapalkissa nuolten ja Tänään-napin vieressä. Ylhäällä on vain yksi rivi: kuukausi, vuosi ja viikko (napautus avaa yhä kuukausivalitsimen). Yläpalkki ja alapalkki ovat täsmälleen samat molemmissa näkymissä, joten mikään ei liiku näkymää vaihtaessa.
- Kalenterissa alapalkissa ei ole Vie-nappia (ei mahdu); tekemättömän viennin punainen piste näkyy osionapissa. 320 px:n ruudulla napit lyhenevät (Vk, Pv, Nyt).
- Emilin linja: usein painettavat napit jäädytetään alareunaan, yläreunaan vain tieto.
- Testi: `selain.js` (napit alapalkissa samalla rivillä, eivät mene päällekkäin, sijainnit samat molemmissa näkymissä). Kaikki ok 390, 320 ja 1280 px. Ei tarkistettu oikealla iPhonella.

## Versio 1.10 (15.11.2026)

- Raahattava tärkeysjärjestys tarkistusvälien taulukossa. Korvattu: 1.12 (yksi lista) ja 1.14 (tavoitteet yhtenä rivinä, tavoitekohtaiset välit poistuivat).

## Versio 1.9 (15.11.2026, Emil: oletusvälit, pikapäivä tarkistettavaksi, kalenterin viikkonäkymä)

- **Valikko → Tarkistusvälit** (uusi alasivu, taulukko): asiat riveinä, välit sarakkeina, yksi valinta per rivi, uusi napautus poistaa. Nimisarake pysyy, sarakkeet vierivät kapealla ruudulla. *Käynnit ja seuranta*: 1, 2, 3, 4 vk, 2 kk, 3 kk (`asetukset.sisallot[].ov`), koskee kaikkia eläimiä. *Osioiden kuittaukset*: 1, 2, 3, 6, 12 kk (`asetukset.valit`, ennen numerokenttinä Säännöissä). Ei tekstikenttiä.
- Eläimen oma valinta ohittaa oletuksen (`toimet.vali[it]`, `'0'` = ei tällä eläimellä); `MF.effVali(a,d)`.
- **Pikamuistiinpanon päivä = tarkistettava päivä, ei varaus eikä tarkistus.** Jos pikanapin sana osuu sisältöön, jolla on väli (esim. hoitoneuvottelu), päivä näkyy tarkistettavana ("Hoitoneuvottelu tarkistettava 23.11. (3 kk)"), ja OK aloittaa välin siitä viikosta. Kuittaamaton mennyt pikapäivä siirtyy kuluvalle viikolle. Tavalliset muistion merkinnät toimivat kuten ennen (kirjattu aika = varattu).
- **Kalenterin oletus on Viikko** (valinta Viikko / Aikajana ylhäällä, muistetaan laitteessa): tänään otsikkona, sen alla *Tällä viikolla* (asiat ilman päivää + menneiden päivien kuittaamattomat pikapäivät), sitten tulevat päivät. Muilla viikoilla viikon asiat ensin, sitten päivät ma–su. Järjestys otsikon alla: kiireelliset varattavat ja tason 1 arvioinnit, muut varattavat, pikapäivät, käynnit, muut merkinnät. Kuittaus ei muuta järjestystä: kuitattu jää paikalleen himmeänä.
- Rivin napautus avaa pienen ikkunan (OK, Avaa muistiinpano / Avaa eläin), ulkopuolinen napautus sulkee. Viikon vaihto alapalkin ‹ Tänään › -napeista.
- Testit: `logiikka.js` (oletusväli, pikapäivä ketjussa, OK nollaa, myöhässä oleva, viikkonäkymän sijoittelu) ja `selain.js` (taulukko, viikkonäkymä, OK-ikkuna, rivi ei liiku). Kaikki ok 390, 320 ja 1280 px.
- Ei tarkistettu: oikealla iPhonella. Menneen päivän tavalliset merkinnät näkyvät vain Aikajanassa.

## Versio 1.8 (15.11.2026, Emil: kuukausivalitsin, monta päivää)

- Asianappi avaa heti kuukausinäkymän (vk-sarake, ma–su, aina 6 riviä, joten koko ei vaihdu kuukautta vaihtaessa; ‹ › vaihtaa kuukautta). Ei tekstikenttää eikä näppäimistöä. Napautus valitsee päivän, toinen napautus poistaa sen. OK-nappia ei ole: valinta tallentuu heti, ja ulkopuolinen napautus sulkee valitsimen.
- Yksi muistiinpano per eläin ja asia: "Kettu reseptiuusinta 9.11.2026, 16.11.2026" (`pika:{a,it,pv:[pvm…]}`). Vanhat 1.6–1.7:n `pika: true` -muistiinpanot toimivat tavallisina muistiinpanoina. Uudelleen avattaessa valitut päivät näkyvät korostettuina.
- Ikkunassa valitun eläimen päivät luettelona kiinteän korkuisessa laatikossa (ei pomppimista). Pitkä painallus luettelon riviin poistaa koko asian (Peru/Poista). Viikkolistassa ja kalenterissa jokainen päivä on oma rivinsä. Pitkä painallus viikkolistan riviin → *Poista päivä* poistaa vain sen päivän.
- Testit: `selain.js` (42 päivän ruudukko ilman kenttää, mahtuu 320 px:iin, monta päivää ja poisto, valitsin ei liiku, kuukauden vaihto, luettelo, uudelleenavaus, kalenteri, viikkolistan Poista päivä). Kaikki ok 390, 320 ja 1280 px.
- Ei tarkistettu: oikealla iPhonella (napautusten tarkkuus 38 px ruuduissa 320 px:llä).

## Versio 1.7 (15.11.2026, Emil: ei pomppimista, uusi valinta suoraan)

- Pikamuistiinpano: "valitse ensin eläin" Eläin-otsikon perässä (rivi ei katoa, napit pysyvät paikallaan). Asianappien perässä *+ Uusi valinta* (sama ulkoasu kuin + Uusi eläin): avaa samaan kohtaan saman korkuisen tekstikentän ja näppäimistön, Enter/Lisää tallentaa napin asetuksiin, päivää ei kysytä.
- Periaate (Emil): ilmestyvät ja katoavat tekstirivit eivät saa siirtää nappeja.

## Versio 1.6 (15.11.2026, Emil: pikamuistiinpano)

- **Avaus:** pieni muistiinpanonappi alapalkissa Eläimet-valitsimen vieressä (lista, muistio, valikko; kalenterissa ei mahdu, siellä merkintä pidolla) sekä eläimen sivun plus (eläin valmiiksi valittuna; aiemmin plus avasi suoraan tekstin).
- **Pikamuistiinpano-ikkuna:** eläinnapit (kaikki aktiiviset, + Uusi eläin), asianapit (oletus Reseptiuusinta, Lääkärin vo-aika, Tiimausaika, Hoitoneuvottelu, Verkosto, Soitto), *Vapaa teksti* avaa tavallisen muistiinpanon eläimen nimellä. Asianappi avaa päälle päivävalitsimen; *Tallenna* tekee muistiinpanon "Siili soitto 15.11.2026" (merkitty `pika: true`), ulkopuolinen napautus peruu tallentamatta. Ikkuna jää auki ja listaa tallennetut.
- **Ratas** otsikossa vie Valikko → Luettelot → *Pikamuistiinpanon napit* (`asetukset.pikat` [{id,n}], lisää, nimeä, järjestä, poista).
- **Poisto:** pitkä painallus pikamuistiinpanon riviin (ikkunassa tai viikkonäkymän listassa) → *Peru* vasemmalla, *Poista* oikealla. Muuten kuittaus viikon listan OK:lla kuten muutkin. Päivätyt näkyvät kalenterissa (koko päivä) ja viikkonäkymässä; jos sana osuu välin sisältöön (esim. lääkär), merkintä on varaus.
- Testit: `selain.js` (avaus, eläin valmiina, päivävalitsin ja ulkopuolinen napautus, tallennus, pitkä painallus + Peru/Poista, kalenteri, ratas). Kaikki ok 390, 320 ja 1280 px.

## Versio 1.5 (15.11.2026, Emil: viikkonäkymä eläinlistaan, "tehdään kuten suosittelet" + muistiinpanot viikon listaan)

- **Eläinlista: Viikot / Osiot** yläreunassa (oletus Viikot, valinta muistetaan laitteessa). Viikot: rivi per eläin, nimi jäädytettynä, 14 viikkoruutua kuluvasta viikosta eteenpäin (Suomen/ISO-viikkonumero, kuluva alleviivattu), vieritys sivuttain yhdessä. Ruudussa viikkonumero ja avoimien asioiden määrä. Väri: punainen = kuluvalla tai ensi viikolla varaamatta / kiireellinen, keltainen = varattavaa tai kuitattavaa, ohut reuna = vain tulevia muistiinpanoja, vihreä = kaikki varattu/kuitattu, katkoviiva = ei mitään.
- **Viikon napautus** avaa rivin alle viikon asiat kiireysjärjestyksessä: varattavat (OK = varattu tälle viikolle), kuluvalla viikolla kaikki muistutukset (kuittaukset OK/Ei, muut omalla napillaan), tulevilla viikoilla erääntyvät kuittaukset, tavoitteiden arvioinnit ja ohjauksen arvio, sekä muistiinpanojen rivit, joissa eläin ja viikon päivä (OK kuittaa rivin = kalenterin Toteutui; napautus avaa pikakatselun päällimmäiseksi). Rivien järjestys pysyy, kunnes lista suljetaan.
- **Ulkopuolinen napautus** sulkee pikakatselun tai avatun viikon/osion eikä tee muuta (koskee myös Osiot-näkymää; osion vaihto on siis kaksi napautusta).
- **Varattavat liukuvasti:** seuraava varattava viikko lasketaan viimeisestä varauksesta (muistion merkintä, mittaus tai OK): paino vk 48 + 4 vk → vk 52; myöhässä oleva siirtyy kuluvalle viikolle. Muistutus kuluvalle ja kahdelle seuraavalle viikolle ("Lähikäynti varattava vk 47 (1 vk)"), kuluva ja ensi viikko kiireellisiä. Eläimen sivulla valitun välin rivit viikoittain (vk, päivät, + Sovi, OK, Kuitattu). Muistutukset luettelon järjestyksessä.
- Tallennus: ei uusia kenttiä (OK-kuittaus `toimet.ok` avaimella "sisältö|viikon maanantai").
- Testit: `logiikka.js` (ISO-viikot, liukuva väli, viikkonäkymän asiat, erääntyvä kuittaus) ja `selain.js` (Viikot oletuksena, viikon lista, muistiinpano ja pikakatselu, ulkopuolinen napautus, järjestyksen pysyminen). Kaikki ok 390, 320 ja 1280 px.

## Versio 1.4 (15.11.2026, Emil: "syklin sijaan vaihtoehdot viikon välein … 3 kk välein")

- **Sykli korvattu väleillä.** Hoitotoimet-kortissa kuusi välinappia: 1 vk, 2 vk, 3 vk, 4 vk, 2 kk, 3 kk (tilapisteineen). Valitun välin alla kaikki sisällöt (Käynnit, Seuranta) aina näkyvissä; napautus antaa sisällölle tämän välin, uusi napautus poistaa. Jokaisella sisällöllä on yksi väli; toiseen väliin valittu näkyy himmeänä välin kanssa (esim. "Lääkärin vo-käynti 2 kk"), ja napautus siirtää sen.
- **Jaksot:** alkavat *Välit alkaen* -päivän viikon maanantaista (tyhjänä eläimen luontipäivästä) ja toistuvat. Viikkovälit tasan 7/14/21/28 vrk, kuukausivälit kalenterikuukausin.
- **Tarkistus:** appi kysyy jokaiselle jaksolle, joka on käynnissä tai alkaa kahden seuraavan täyden kalenteriviikon aikana, varausta. Varaus = muistion merkintä jakson ajalle (eläimen nimi + sisällön sana + päivä) tai mittaus. Puuttuva on muistutus "Lähikäynti sovittava (1 vk, 16.11.–22.11.)", kiireellinen jos jakso päättyy viikon sisällä. Kortissa valitun välin sisällöt näkyvät jaksoittain (viikoittainen: tämä ja 2 seuraavaa viikkoa) napeilla *+ Sovi* ja **OK** (kuittaa jakson hoidetuksi ilman merkintää; *Kuitattu* perii kuittauksen). Muiden välien puuttuvat *Muut sovittavat* -kohdassa.
- Tallennus: `ver` edelleen 1. Uudet `toimet.vali` {sisältö: v1|v2|v3|v4|k2|k3} ja `toimet.ok` {"sisältö|jakson alku": pvm}. Vanha `toimet.sykli` jää luettavaksi ja siirtyy kerran: kaikki 4 viikkoa → viikoittain, 2–3 viikkoa → 2 vk, 1 viikko → 4 vk, vain Kk 2/Kk 3 → 3 kk. "Syklin alkupäivä puuttuu" -muistutus poistui; "Käyntien ja seurannan välit valitsematta", jos mitään ei ole valittu. Listan ruutu *Sykli* → *Käynnit*.
- Testit: `logiikka.js` (jaksot, 2 viikon horisontti, kiireellisyys, varaus, peruttu, OK-kuittaus, siirto vanhasta) ja `selain.js` (välit, siirto ja poisto, jaksorivit, OK ja peruminen). Kaikki ok 390, 320 ja 1280 px. Huom: testiajo, joka osuu keskiyön yli, voi kaataa kalenteritestin (aiempi ominaisuus, ei 1.4).

## Versio 1.3 (15.11.2026, Emil: syklin vaihtoehdot näkyviin ilman muokkausnappeja)

- **Käyntisykli:** valitun laatikon (Vk 1 … Kk 3) kaikki sisällöt näkyvät aina napteina Käynnit- ja Seuranta-ryhmissä; napautus lisää tai poistaa valinnan. *Valitse sisällöt / Muuta valintoja / Valmis* poistettu. Valittujen tila (sovittava, sovittu pvm, tehty) ja *+ Sovi* näkyvät nappien alla.
- **Syklin alku** on päivämääräkenttä suoraan kortissa (ei arkkia). Käyntien muodot otsikon *Muodot*-linkistä.
- Varausten tarkistus ennallaan: kun alkupäivä on asetettu, appi laskee joka avauksella käynnissä olevat ja kahden seuraavan täyden viikon laatikot. Jokainen valittu sisältö, jolle ei löydy muistiosta merkintää laatikon ajalle (eläimen nimi + sisällön sana + päivä), on muistutus "Vk 2 (…): Lähikäynti sovittava" ja *Sovi*-nappi; kiireellinen, jos laatikko päättyy viikon sisällä. Sykli toistuu 3 kk:n välein. Ilman alkupäivää tulee vain "Syklin alkupäivä puuttuu".
- Testit: `selain.js` (valinnat näkyvissä ilman muokkausnappia, alkupäivä suoraan sivulla). Kaikki ok 390, 320 ja 1280 px.

## Versio 1.2 (14.11.2026, Emil: "niissä vain kuitataan, että kohta on ok tai ei"; "ne pitää määräajoin uudelleen kuitata")

- **Eläimen sivulla ei kirjoiteta vapaata tekstiä.** Jokainen osio on kortti, jonka kohdat kuitataan **OK / Ei** samoin kuin listan tarkistusnäkymässä (samat kohdat, sama tallennus `kuit`). Yhden kohdan osiot (Tulosyy, Kehityshistoria, Vahvuudet, Haasteet) ovat yhtenä rivinä: nimi ja napit.
  - Jäävät: päivämäärät (toimintakykyarvio, syklin alku, ohjattu), valinnat (sosiaalityön asiakkuus ja sijoitus, hoidon tarpeen kysymykset, diagnoosit luettelosta, tavoitteen tila ja seuranta, haasteen ohjaus), mittaukset, arviointikierros, käyntisykli, muistiinpanot ja kalenteri. Valinnat näkyvät kortissa *Valinnat*-rivinä, joka avaa arkin.
  - Poistettu: tekstikentät (tulosyy, esitiedot, kehitys, tilanne, koulun ja sosiaalityön tiedot, vahvuudet, hoidon tarpeen *Muuta*, tavoitteen teksti ja keinot, hoidon syyt, haasteen teksti, uusi diagnoosi arkissa, ohjauksen ja arvioinnin lisätieto) sekä tyhjien osioiden *+ Osio* -napit, *+ Haaste* ja *+ Hoidon syy*.
  - Vanha teksti näkyy pienenä harmaana kohdan alla vain luettavana; sitä ei poisteta tallennuksesta.
  - **Tavoitekartta:** ruutu näyttää kuittauksen (OK pvm / Ei pvm / Kuittaa) ja tavoitteen tilan. Avattu ruutu: *Kunnossa? OK / Ei*. Jos ruudussa ei ole tavoitetta, *+ Seuranta ja arviointi* luo tekstittömän tavoitteen (tila, seuranta, arviointikierros). Tavoitekortilta pois Syy- ja Keinot-rivit.
  - Nyt-kortin puuttuu-muistutus: *Kuittaa* vie osioon (diagnoosit, toimintakykyarvio ja sykli avaavat edelleen arkin).
- **Kaikki OK-kuittaukset vanhenevat määräajoin.** Jokaisella osiolla on oma väli (Valikko → Säännöt ja välit): tulosyy, kehitys ja tilanne 12 kk; esitiedot, koulu, sosiaalityö, vahvuudet, diagnoosit ja hoidon tarve 6 kk; haasteet, tavoitteet, mittarit ja lääkeseuranta 3 kk. 0 = ei vanhene. Vanhentunut kohta näyttää *OK pvm, kuittaa uudelleen*, ja muistutus on "Esitiedot: kuitattu 7 kk sitten" tai, jos vain osa vanhentui, "Esitiedot: 1 kohta kuitattava uudelleen". *Kaikki pitää yhä paikkansa* uusii osion kaikki OK:t. Ei ei vanhene.
- Tallennus: `ver` edelleen 1. Uudet välit tulevat vanhaan tallennukseen oletuksina.
- Testit: `logiikka.js` (vanheneminen kaikille osioille, osittain vanhentunut, väli 0, vanhan tallennuksen välit) ja `selain.js` (ei tekstikenttiä eläimen sivulla, kuittaukset osioissa ja tavoitekartassa, valinnat arkissa ilman tekstiä). Kaikki ok 390, 320 ja 1280 px.

## Versio 1.1 (14.11.2026, Emil)

- Eläinlistan ruuduissa koko sanat lyhenteiden sijaan (Tulosyy, Esitiedot, Kehitys, Tilanne, Koulu, Sosiaalityö, Vahvuudet, Diagnoosit, Hoidon tarve, Haasteet, Tavoitteet, Mittarit, Sykli, Lääkeseuranta). Ruudun leveys tekstin mukaan, vaiheotsikot seuraavat ryhmien leveyttä. Rivit pitenevät, joten myös tietokoneella vieritetään.

## Versio 1.0 (14.11.2026, Emil: "rakenna suosituksilla")

- **Listan tarkistusnäkymä:** ruudun napautus ei enää avaa eläintä, vaan osion tarkistuslistan rivin alle (rivi pysyy paikallaan; jos lista ei mahdu, rivi nousee kerran ylös). Kohdat kuitataan **OK / Ei** ilman tekstiä, uusi napautus tyhjentää, ja kuittaukseen tallentuu päivä. Saman rivin toinen ruutu vaihtaa osion, ruksi sulkee, *Avaa eläin* vie eläimen sivulle kyseiseen osioon. Rivien järjestys pysyy ennallaan niin kauan kuin osio on auki.
  - Kohdat: tavoitteet 9 (taso × lapsi/vanhemmat/työntekijä), esitiedot 5, ajankohtainen tilanne 2, koulu 3, sosiaalityö 3, hoidon tarve 4, mittarit luettelon mukaan, muut osiot yksi kohta. Käyntisykli ei ole kuitattava (täyttyy muistiosta).
  - OK kumoaa osion puuttuu-muistutuksen ja tekee ruudusta vihreän. OK vanhenee osion tarkistusvälillä (esitiedot, koulu, sosiaalityö, hoidon tarve 6 kk, tilanne 12 kk, tavoitteet 3 kk), jolloin tulee "X: kuitattu N kk sitten" ja *Pitää paikkansa* uusii kuittaukset. OK päivittää myös osion tarkistuspäivän.
  - Ei tekee muistutuksen "Ei kunnossa: Esitiedot · Perhe" (sääntö Puuttuvat tiedot, portaat eivät piilota). Ei ei vanhene.
  - Muut osion muistutukset näkyvät kohtien alla, jotta kuittaus ei siirrä nappeja.
- **Ankkuri koko appissa:** napautettu kohta pysyy samalla korkeudella, vaikka sivu piirretään uudelleen (esim. tavoitekartan ruutu, joka avaa sisällön alle). Listan sivuvieritys säilyy uudelleenpiirrossa.
- **Muokkausarkki eläimen sivulla:** painettu kohta näkyy korostettuna arkin yläpuolella, ja sivu siirtyy vain jos kohta jäisi arkin alle. Tausta himmenee vähemmän. Tavoitekartassa uuden tavoitteen teksti päivittyy ruutuun kirjoitettaessa. Kenttä saa fokuksen ilman selaimen omaa vieritystä (preventScroll).
- Tallennus: `ver` edelleen 1. Eläimellä uusi valinnainen `kuit` {kohta: {v:'ok'|'ei', pvm}}; vanha data saa tyhjän, viallinen poistuu.
- Testit: `logiikka.js` ja `selain.js` (tarkistusnäkymä, OK ja Ei, järjestyksen pysyminen, ankkuri, korostettu ruutu arkin yläpuolella). Kaikki ok 390, 320 ja 1280 px.

## Versio 0.9 (14.11.2026, Emil: luonnoksen "eläinrivit" pohjalta)

- **Eläinlista ruudukkona:** jokaisella eläimellä on nimirivi (nimi, tärkein tekemätön asia, +N) ja sen alla 14 osioruutua vaiheittain (Tul Esi Keh Til Kou Sos Vah | Dg Tar Hst | Tav Mit | Syk Lää). Kaikki rivit vierivät sivuttain yhdessä, ja nimirivi pysyy paikallaan. Ruudun väri: täytetty vihreä, tyhjä katkoviiva, vaadittu puuttuva keltainen katkoviiva, tarkista tai sovittava keltainen, kiireellinen punainen. Ensimmäisenä tehtävä ruutu on valkoisella kehyksellä.
- Järjestys ennallaan (tärkein tekemätön asia omien sääntöjen mukaan). Nimirivin napautus avaa eläimen, ruudun napautus avasi eläimen kyseiseen osioon (1.0:ssa tarkistusnäkymä).
- Pois: rajaussirut ja työjono (Emil: ei tarvita). Ohjeluonnoksen vaihepalkkia 1–4 ei tehty listaan.
- Tietokoneella ruudut mahtuvat kerralla näkyviin.
- Testit: `selain.js` lisäksi ruudut ja tilat, järjestys kahdella eläimellä, yhteinen vieritys, ruudusta osioon. Kaikki ok 390, 320 ja 1280 px.
- Luonnos: https://claude.ai/artifact/QqpDkKxSsfVrh9HAFw1Pd8

## Versio 0.8 (12.11.2026, Emil: "tee kaikki suosittelemasi muutokset")

Käytettävyyssuunnitelman (`SUUNNITELMA.md`) kaikki neljä askelta yhtenä julkaisuna. Periaate: kartta ylhäällä, valittu alla. Kyselyyn ei ollut vastauksia, joten avoimet kohdat tehtiin suositusten mukaan.

- **Eläinlista:** rivi on yksi rivi (tilaraita, nimi, tärkein muistutus, +N). Ylhäällä rajaussirut *Kaikki / Käynnit / Tavoitteet / Puuttuu / Tarkista / Ohjaus*. Laji valittuna lista on työjono kaikilta eläimiltä, ja rivillä on suoraan toimintonappi (Sovi, Arvioi, Tehty, Lisää, Pitää paikkansa, Avaa).
- **Eläimen sivu:** ylhäällä Nyt-kortti: tärkein muistutus, toimintonappi ja *Ensin, koska: …* (säännön nimi). Muut muistutukset ryhmäsiruina, napautus avaa ryhmän. Alla vaiheet 1–4 otsikkoina, joissa tilapiste ja vaiheen tärkein muistutus.
- **Lukutila:** täytetty osio näkyy tekstirivinä (enintään 4 riviä). Tyhjät osiot ovat vaiheen lopussa *+ Osio* -nappeina, ja muistutuksen osio on korostettu. Huomiot muistiosta suljettuna sivun lopussa.
- **Muokkausarkki:** rivin tai napin napautus avaa arkin, jossa on yksi kenttä kerrallaan. *‹ Edellinen / Seuraava ›* vaihtaa kentän samassa tekstikentässä, jolloin näppäimistö pysyy auki. Arkki asettuu näkyvän alueen (visualViewport) mukaan näppäimistön yläpuolelle, ja alapalkki piiloutuu näppäimistön ajaksi. Arkin sulkeminen palauttaa vierityskohdan.
- **Alapalkki eläimen sivulla:** *‹ Eläimet* · vaihenapit 1–4 tilapisteineen (seuraavat vieritystä, napautus vierittää) · plus = uusi muistiinpano eläimen nimellä. 320 px:ssä Eläimet-sana piiloutuu.
- **Tavoitekartta:** 3 × 3 (tasot riveinä, lapsi / vanhemmat / työntekijä sarakkeina), ruudussa tilaraita ja tavoitteen nimi. Napautus avaa ruudun kartan alle: tavoitekortit (Arvioi, Muokkaa, Seuranta), tasolla 2 periaatteet ja *+ X tavoite tasolle N*. Hoidon syyt siruina kartan yläpuolella.
- **Syklinauha:** kuusi laatikkoa rinnakkain tilapisteillä (täytetty vihreä = tehty, vihreä rengas = sovittu, punainen = sovittava, harmaa = myöhemmin). Valitun laatikon sisällöt alla, *+ Sovi* avaa muistiinpanon valmiilla alulla ("Kettu lähikäynti "). *Muut sovittavat* lähiviikoilta ja *Käynnit muistiosta*.
- **Mittaus muistiosta:** rivi, jossa on eläimen nimi, mittarin tai lääkeseurannan sana ja luku, kirjautuu itsestään (esim. "Kettu paino 41", "RR 112/70", "FIT 36"). Päiväys, kellonaika ja tuleva päivä eivät ole mittauksia. Arvo täyttää syklin laatikon ja näkyy rivillä merkinnällä *muistiosta*. Muistiinpanossa näkyy siru "Paino 41 · kirjattu".
- **Omat säännöt:** Valikko → Säännöt ja välit. Muistutusten järjestys omana listana (Ylös/Alas), jokainen *Kiireellinen / Tavallinen / Pois*. Oletus: tason 1 asiat, sovittava käynti jonka laatikko päättyy viikon sisällä, taso 2, muut sovittavat, taso 3, ohjaus ja haasteet, puuttuvat, vanhentuneet. *Palauta oletukset*.
- **Portaat** (oletus päällä): puuttuvista tiedoista näkyvät vain varhaisimman vaiheen puutteet. Käynnit, arvioinnit ja tavoitteiden asiat näkyvät aina.
- **Valikko alasivuina:** Tiedot, Ulkoasu ja kalenteri, Luettelot, Säännöt ja välit, Arkisto. Alasivun alapalkissa *‹ Valikko*.
- **Ulkoasu:** otsikot lähes leipätekstin kokoisia. Painettu valinta on käänteisväri, ja korostusväri on vain päätoiminnolla. Linkkinapit ovat alleviivattua tekstiä, ja poisto on hillitty, kunnes se vahvistetaan. Tietokoneella (≥ 900 px) vaiheet näkyvät kahtena sarakkeena ja ≥ 1500 px:ssä neljänä.
- **Tallennus:** `ver` edelleen 1. Uudet valinnaiset kentät `asetukset.saannot` [{id, tila}] ja `asetukset.portaat`. Vanha data saa oletukset, ja viallinen sääntölista korjautuu. Muistion mittauksia ei tallenneta erikseen, vaan ne luetaan muistiinpanoista.
- Korjattu samalla: Nyt-kortin päivitys viittasi poistettuun funktioon, ja Mittarit- ja Lääkeseuranta-lisäysnapit avasivat väärän arkin.
- Testit: `logiikka.js` (68) ja `selain.js` (86 tarkistusta kolmella leveydellä: Nyt-kortti, portaat, arkki ja Seuraava samassa kentässä, simuloitu näppäimistö, syklinauha ja Sovi, mittaus muistiosta, vaihenapit, tavoitekartta, työjono, Valikon alasivut, säännöt). 390, 320 ja 1280 px, kaikki ok.

## Versio 0.4 (9.11.2026, Emil: Mätsik-kartan muutokset 3.11.)

- **Osiot vaiheittain**: 1 Mistä lähdetään (tulosyy, esitiedot, kehityshistoria, ajankohtainen tilanne, koulu, sosiaalityö, vahvuudet), 2 Mikä on ongelma ja onko siihen apua (diagnoosit, hoidon tarve, haasteet), 3 Mihin pyritään (tavoitteet, mittarit), 4 Miten toteutetaan (hoitotoimet, lääkeseuranta).
- **Tavoitteet tasoittain ja tahoittain**: jokaisella tasolla (1 Turvallisuus ja akuutit riskit, 2 Hoitosuhde ja hoidon mahdollistaminen, 3 Elämänlaatu, toimintakyky ja kehitys) on oma laatikko lapselle, vanhemmille ja työntekijälle, ja kussakin oma *+ Tavoite*. Tavoite on yhden tahon tavoite (`taho`, `teksti`). Taho ja taso vaihdetaan avatusta tavoitteesta.
  - Vanha tavoite, jossa oli kaikkien tahojen tekstit, jaetaan korjauksessa tahoittain. Ensimmäinen säilyttää id:n ja arvioinnit, muut saavat saman tason, syyn, keinot ja tilan. Täysin tyhjä vanha tavoite muuttuu lapsen tavoitteeksi.
- **Tason 2 periaatteet ja mittarit**: valinnat (oletus CPS, FIT) eläimelle. Luettelo: Valikko → Periaatteet ja mittarit, yksi riville.
- **Tavoitteen seuranta**: Mielekäs, Oleellinen, Realistinen, Vaikuttaa kokonaisvointiin, kukin Kyllä/Osittain/Ei. Ei tuo herjan (taso 1 kiireellinen). Uusi napautus poistaa valinnan.
- **Mittarit-osio**: kirjaus tänään (tulos tai huomio), kolme viimeisintä näkyy. Luettelo Valikossa (nimi ja *Mitä mittaa*), oletus Oirekyselyt (relevanssi) ja FIT (yhteistyösuhteen laatu ja osin vaikutukset).
- **Ohjauksen arvio** Hoidon tarpeessa: onko tämä yksikkö oikea paikka lastenpsykiatrian sisällä. Napautus *Oikea yksikkö / Harkitaan muuta / Ohjataan muualle* kirjaa arvion tälle päivälle, perustelu valinnainen. Herja "Arvioi ohjaus tähän yksikköön", kun edellisestä arviosta (tai eläimen lisäyksestä) on tarkistusvälin verran. Väli Valikossa, oletus 6 kk.
- **Haasteet ilman psykiatrista hoitoa**: haaste, ohjataan (Sosiaalityö, Koulu, Somatiikka, Arjen keinot kotona, Muu) ja *Ohjattu tänään*. Herja, jos haasteelle ei ole valittu ohjausta (oma lisäys, poistettavissa).
- Tallennus: `ver` edelleen 1. Uudet valinnaiset kentät: eläimellä `haasteet`, `ohjaus`, `mittarit` {id: {arvot}}, `periaatteet`; tavoitteella `taho`, `teksti`, `seur`; asetuksissa `periaatteet`, `mittarit`, `valit.ohjaus`.
- Testit: `logiikka.js` (52) ja `selain.js` (uudet tavoitteet, seuranta, periaate, mittari, haaste, ohjauksen arvio, Valikon mittari ja periaatteet). Leveydet 390, 320 ja 1280 px, kaikki ok.

## Versio 0.3 (3.11.2026, Emil)

- **Käyntisykli** korvaa käyntitiheyden, lääkärin välin ja mittausvälit. Hoitotoimissa on syklin alkupäivä ja kuusi laatikkoa: Vk 1, Vk 2, Vk 3, Vk 4, Kk 2 ja Kk 3.
  - Sykli kestää 3 kk. Se alkaa alkupäivän viikon maanantaista ja alkaa automaattisesti alusta. Kk 2 alkaa viidennen viikon alusta ja kestää kuukauden kakkosen loppuun, ja Kk 3 kestää syklin loppuun.
  - Laatikon *Valitse* avaa valinnan (useita sallittu), joka on jaettu ryhmiin Käynnit ja Seuranta. Valinnan jälkeen laatikossa näkyy jokaisen valinnan tila: tehty, sovittu, sovittava tai myöhemmin. Käynnissä oleva laatikko on korostettu.
  - Herja tulee, jos laatikko on käynnissä tai alkaa kahden seuraavan täyden viikon aikana ja sen valinnalle ei ole sovittua tai tehtyä merkintää. Herja on kiireellinen, jos laatikko päättyy viikon sisällä.
  - Merkinnäksi kelpaa muistiinpanon rivi, jossa on eläimen nimi, aika laatikon sisällä ja valinnan tunnistussana. Peruttu ei kelpaa. Mittaus täyttyy myös Lääkeseurannan kirjauksesta.
- **Valikon muokattavat luettelot**:
  - *Käyntisyklin sisällöt*: nimi, tunnistussanat, laji (Käynti tai Seuranta) ja Seurannalle valinnainen kytkentä Lääkeseurannan kirjaukseen. Oletuksena ovat Emilin 10 sisältöä. Käynti-lajin sana tekee rivistä käynnin.
  - *Käyntien muodot*: nimi ja tunnistussanat. Oletuksena ovat Yksilö, Perhe, Koti, Puhelu ja Verkosto.
  - Rivin voi lisätä, muokata, siirtää ylös tai alas ja poistaa vahvistuksella. Poisto kertoo käyttömäärän ja poistaa rivin myös eläinten valinnoista. Tyhjä uusi rivi ei jää luetteloon.
  - Tunnistussääntö: sanan alku tai osa riittää (paino → painoa). Enintään 3 merkin sana tunnistetaan vain kokonaisena (rr, ep, lk, isä). Siksi "lääk" ei ole enää lääkärisana, koska se osui myös lääkitykseen.
- Tallennus: `asetukset.sisallot` ja `asetukset.muodot` (valinnaiset). Vanha data saa oletukset, ja `ver` on edelleen 1. Eläimellä `toimet.alku` ja `toimet.sykli` {vk1…kk3: [sisällön id]}. Vanhat kentät `tiheys`, `laakari` ja mittausvälit jäävät dataan käyttämättöminä.
- Korjattu: Lääkeseurannan esikatselurivi näyttää kirjatut mittaukset (näytti vanhoja välejä, jotka poistuivat). Laatikko käytti luokkaa `.now`, joka on kalenterin nykyhetken viiva. Tämä aiheutti päällekkäisen asettelun.
- Testit: `logiikka.js` (39) ja `selain.js` (sykli, oma sisältö Valikosta laatikkoon ja herjaksi, poisto). Leveydet 390, 320 ja 1280 px, kaikki ok.

## Versio 0.2 (3.11.2026, Emil)

- **Kalenteri Juuren mallilla.** Ylhäällä on viikkonauha ma–su (pyyhkäisy vaihtaa viikkoa) ja kuukausi otsikosta. Puhelimella näkyy valitun päivän aikajana 0–24, koneella (≥ 900 px) seitsemän saraketta. Koko päivän merkinnät ovat aikajanan alla.
  - Uusi merkintä: kosketuksella pito 0,25 s tuo vihreän viivan pyöristettynä varttiin. Viivaa voi raahata, reilu sivuveto peruu ja nosto avaa uuden muistiinpanon, jossa on valmiina esim. "ti 10.11. klo 14.00–14.30". Hiirellä napsautus tai veto.
  - Merkinnän siirto: puhelimella pitkä painallus (0,35 s), hiirellä veto, 15 min askelin. Alareunan kahva muuttaa loppuaikaa. Pudotus viikkonauhan päivälle siirtää päivän, ja pudotus Koko päivä -alueelle poistaa kellonajan. Ajaton merkintä siirtyy aikajanalle samalla tavalla.
  - Muutos kirjoitetaan muistiinpanon tekstiin: vain päivä- ja aikasanat vaihtuvat. Toteutui/Peruttu-tila seuraa merkintää.
  - Napautus avaa muistiinpanon. Käynnin Toteutui ja Peruttu ovat muistiinpanon ikkunassa ja Hoitotoimissa.
  - Asetus: uuden merkinnän oletuspituus 15/30/45/60 min, oletus 30. Tallennus `asetukset.kesto`, valinnainen.
  - Aikasanat tunnistavat nyt myös loppuajan (`klo 14–15`, `klo 14.00–14.30`).
- **Muistio tallentuu itsestään:** 1,2 s kirjoitustauon jälkeen ja kentästä poistuttaessa samaan muistiinpanoon. Kenttä tyhjenee poistuttaessa. Ikkunassa ei ole Tallenna-nappia: Valmis ja ruksi sulkevat. Tyhjäksi pyyhitty muistiinpano poistuu.
- **Alapalkki:**
  - Vasemmalla on osionappi (Eläimet, Muistio, Kalenteri, Valikko). Napautus avaa valikon alhaalta, ja pyyhkäisy vaihtaa osiota.
  - Keskellä ovat osion toiminnot:
    - Eläimet: plusnappi
    - eläin: ‹ Eläimet ja Nimi
    - Muistio: plusnappi
    - Kalenteri: ‹, Tänään ja ›
  - Oikealla on pikavienti Vie (punainen piste, kun vienti on tekemättä).
  - Yläreunassa on vain otsikko.
- **Asiakkaat → Eläimet** kaikissa näkyvissä teksteissä. Tallennusmuoto ennallaan (`asiakkaat`).
- Testit: `logiikka.js` (31) ja `selain.js` (kalenterin pito, siirto, kahva, pudotus päivälle, kuukausi, sivuveto, automaattitallennus, alapalkki). Leveydet 390 ja 320 px kosketuksella ja 1280 px hiirellä, kaikki ok.

## Versio 0.1 (2.11.2026)

- **Asiakaslista:** rivi on asiakas. Järjestyksen määrää tärkein avoin herja: ensin kiireelliset, sitten tavoitetason mukaan. Rivillä näkyy tärkein herja ja +N, tai Kunnossa ja seuraava käynti. Uusi asiakas, nimen muutos, arkistointi (palautus Valikosta) ja poisto vahvistuksella.
- **Hoitosuunnitelman osiot:** Tulosyy, Diagnoosit (Emilin oma luettelo Valikossa ja vapaa lisäys), Esitiedot, Kehityshistoria, Ajankohtainen tilanne ja toimintakykyarvion päivämäärä, Koulu, Sosiaalityö, Vahvuudet, Tavoitteet, Hoidon tarve (4 kysymystä), Hoitotoimet ja Lääkeseuranta, sekä Huomiot muistiosta.
- **Tavoitteet:** hoidon syyt ovat asiakkaan lista (haitta ja psykiatrinen taustasyy). Tavoitteella on taso (1 turvallisuus, 2 hoidon mahdollistaminen, 3 elämänlaatu), syy (tai Hoidon mahdollistaminen), lapsen, vanhempien ja työntekijän tavoitteet, keinot sekä tilanne (Alussa, Etenee, Jumissa, Saavutettu).
- **Arviointikierros:** prosessikaavio hahmotelman kohdan 3b mukaan. Yhtä mieltä -kysymykseen vastataan osapuolittain, ja vastauksista voi palata Takaisin. Toimenpiteeseen päättyvä arvio jää avoimeksi herjaksi, kunnes se merkitään tehdyksi.
- **Säännöt (herjat):**
  - Puuttuu: tulosyy, diagnoosit, vahvuudet, tavoitteet, käyntisykli (0.3), toimintakykyarvion päivämäärä.
  - Vanhentunut: Esitiedot, Koulu, Sosiaalityö, Hoidon tarve ja Hoitotoimet. Kuittaus: *Tarkistettu, pitää paikkansa*. Toimintakykyarvio vanhenee päivämääränsä mukaan.
  - Käynnit, lääkäri ja mittaukset: 0.3:sta lähtien käyntisykli (yllä). Horisontti on edelleen kaksi seuraavaa täyttä kalenteriviikkoa.
  - Tavoitteen arviointi välein, avoin toimenpide ja Jumissa-tila. Tason 1 herjat ovat kiireellisiä.
  - Tarkistusvälit muokataan Valikossa. Oletukset: esitiedot, koulu, sosiaalityö, tarve ja toimet 6 kk, tavoite 3 kk, toimintakykyarvio 12 kk.
- **Muistio:** vapaa teksti. Asiakkaan nimi (myös taivutettuna, esim. Ketulle) liittää muistiinpanon asiakkaaseen. Päiväys (10.11.), viikonpäivä, huomenna tai klo vie sen kalenteriin. Rivillä oleva käyntisana (käynti, perhekäynti, soitto, puhelu, vastaanotto, tapaaminen, neuvottelu) tekee siitä käynnin, ja sana lääkäri merkitsee lääkärin mukaan. Hoitotoimien *+ Käynti muistioon* aloittaa muistiinpanon asiakkaan nimellä.
- **Ulkoasu:** galleriasta tulevat 6 teemaa (Kuutamo, Sammalpolku, Revontuli, Puolukka-ilta, Aamu-usva, Talviuni) ja niiden eläinkuvitukset. Juuren nappimuodot (Terävä, Pehmeä, Pyöreä, Pilleri) ja järjestelmäfontit. Kuvitus voi olla Yläkaista, Kapea tai Pois. Oletus on Puolukka-ilta.
- **Tallennus:** vain laitteella, `localStorage` avain `matsik:v1`, muoto `{app:'matsik', ver:1, savedAt, data:{asiakkaat, muistio, asetukset, meta}}`. Projekteja on vain yksi. Vienti tapahtuu aina tiedostoon `Mätsik Forest.json` (iPhonella jakovalikko), ja tuonti tiedostosta tai tekstinä korvaa kaiken varoituksen kanssa. Valikossa näkyy punainen piste, jos muutokset on viety viimeksi edellisenä päivänä tai aiemmin.
- **Testit:** `sh matsik/testit/aja.sh`. `logiikka.js` sisältää 31 sääntötestiä. `selain.js` on käyttöpolku 390 ja 320 px kosketuksella ja 1280 px hiirellä.

## Ei rakennettu

- Juuren kalenterin aikaväli (näkyvä päivä, pois käytöstä olevat viikonpäivät) ja aikaehdotukset.
- Juuren sanalinkit, `---`-tekstit, toistuvuus ja asiasanat.
- Tulosyy asiasanoina.
- Arviointikaavion muokkaus asetuksissa: kaavio on nyt koodissa.
- Tason 2 tavoitteen linkki tavoitteeseen, jonka se mahdollistaa (avoin kysymys).
- Hoidon tarpeen vastauksista johdettu yksikkösuositus.
- Omat osiot.
- Suunnitelman *Myöhemmin*-kohdat (esim. pyyhkäisy vaiheiden välillä, sääntöjen omat ehdot).

## Ei tarkistettu

- Testit ajettiin tietokoneen selaimessa (Chromium, kosketus simuloituna), ei oikealla iPhonella: Safari, kotinäytön kirjanmerkki, sanelu, jakovalikko, kalenterin pito ja raahaus sekä vierityksen lukitus raahatessa.
- 1.2: korttien pituus puhelimella (eläimen sivu piteni, kun jokainen kohta on oma rivinsä) ja OK/Ei-nappien osuminen peukalolla.
- 1.0: ankkuri ja arkin yläpuolelle jäävä kohta iPhonen näppäimistön kanssa (Safari voi vierittää itse).
- 0.8: muokkausarkin asettuminen iPhonen näppäimistön yläpuolelle ja näppäimistön pysyminen auki Seuraava-napilla. Näppäimistö simuloitiin testissä vain muuttujilla, ei oikealla näppäimistöllä. Tämä on tärkein puhelimella kokeiltava asia.
- 0.8: mittauksen tunnistus muistiosta on sanapohjainen (mittarin nimen alku). Väärät osumat ovat mahdollisia, jos rivillä on mittarin sana ja jokin muu luku.
- Antiikva- ja Pyöreä-fontit näkyvät oikein vain Applen laitteilla.
- Testiselain antoi ä-kirjaimelliselle tiedostonimelle nimen "download". iPhonen jakovalikossa nimen pitäisi säilyä. Jos ei säily, nimeksi vaihdetaan `Matsik Forest.json`.
- Nimen tunnistus taivutuksista on karkea: nimen alusta otetaan kaikki paitsi kaksi viimeistä kirjainta, vähintään kolme kirjainta. Tämä voi tuottaa vääriä osumia.

## Seuraava askel

Emil kokeilee 1.2:ta puhelimella: eläimen sivun kuittaukset, tavoitekartta ilman tekstiä, listan tarkistusnäkymä ja pomppiminen. Avoimet kysymykset:
0. 1.6: pitääkö pikamuistiinpanoon voida lisätä kellonaika? 1.5: riittääkö 14 viikkoa (3 kk)? Pitääkö tulevien viikkojen ennakoidut varattavat näkyä keltaisina (nyt näkyvät)? 1.4: onko OK-kuittaus jaksolle tarpeen vai riittääkö muistion merkintä? Pitääkö 2 kk / 3 kk välin muistutus tulla jo aiemmin kuin 2 viikkoa ennen jakson alkua? 1.2: pitääkö vanhat tekstit näyttää kohtien alla vai piilottaa kokonaan? Ovatko välien oletukset oikeat? Tarvitaanko uusien diagnoosien lisäys muualta kuin Valikko → Luettelot?
1. Asettuuko arkki iPhonella näppäimistön päälle ilman pomppimista? (Kyselyn kysymys 5.)
2. Onko oletusjärjestys oikea, ja pitääkö portaiden koskea muutakin kuin puuttuvia tietoja?
3. Riittääkö mittaus muistiosta Lääkeseurannalle ja Mittareille, vai myös muille?
4. 0.4:n avoimet: syklin rytmi, muut muokattavat luettelot, tason 2 linkki, muokattava kaavioteksti, seurannan Ei herjana vai merkintänä, mittarien asteikko.

## Suunnitelmat

- **Käytettävyyssuunnitelma (12.11.2026):** `matsik/SUUNNITELMA.md`, rakennettu kokonaan versiossa 0.8. Esittelysivu ja kysely: https://claude.ai/artifact/GgmFP5UEHTVNuSGCE164Md. Jos Emil vastaa kyselyyn myöhemmin, vastaukset luetaan sivun tietokannasta ja verrataan tehtyihin ratkaisuihin.

## Emilin kommentit
