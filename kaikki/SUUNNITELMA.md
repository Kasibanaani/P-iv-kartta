# Kaikki: toteutussuunnitelma

Itsenäinen ohje mille tahansa tekoälylle (Claude, ChatGPT/Codex, muu). Aiempaa keskustelua ei tarvitse muistaa. Lue ensin repon `AGENTS.md`, sitten `kaikki/TILA.md` ja tämä. Emilin päätökset on merkitty **Emil**, tekoälyn ehdotukset *ehdotus*. Ehdotus ei ole toteutuslupa; Emilin ”toteuta” on.

Päivitetty 24.11.2026 (0.86: kojelaudan muokkaus ja asettelu, lukittu esikatselu ja viikkoaikajanan raahaus; 0.85: ((…))-havainnot, kohteet, havaintotaulukot ja kojelaudan rajaukset; 0.84: täyttö alas Muistiossa; 0.83: valinta, monivalinta ja tila; 0.80–0.82: ＋ sarake otsikkoriviltä, yhteenvetorivi ja päiväsarake kuukausivalitsimella ja kalenteriin, jäsennys A3.2–A3.4; 0.76: suodatus ja lajittelu taulukoissa; 0.75: rivien ja sarakkeiden jäädytys; 0.74: taulukon lukumuotoilu; 0.73: Lähteet sulkeutuu ulkopuolisella napautuksella; 0.72: täyttö alas ja Pikamuistiinpanon muuttujanapit; 0.71: Tämän päivän asiat ja Muistiinpanon kenttä kojelaudalle; 0.70: automaattisten sanalinkkien kytkin projektiasetuksissa; 0.69: Muistion tekstimuuttujasarakkeet, yhteinen vieritys ja nopeusmittaus; 0.68: kaavaviitteen poiminta Taulukoissa; 0.67: yhteinen editori Taulukoiden näkymävälilehdille; 0.66: kojelaudan muuttujaruudut; 0.65: tekstimuuttujien tunnistus, näyttö, infoikkuna ja luettelo; 0.64: Muistion lajittelu usealla kentällä; 0.63: Muistion kenttien solumuokkaus ja näyttötavat, kojelaudan kenttäkortit työjonossa; 0.62: jaetut sarakeleveydet ja sovitus sisältöön; 0.61: Lehto ja Hiillos oletusilmeenä; 0.60: korjaussuunnitelman kohdat 1–3 ja kohdan 4 sarakejärjestys tehty; uudet kohdat 21–22 Emilin sanelusta). Kohdan 18 ensimmäinen kokeilu on omassa haarassaan. Lista on toteutusjärjestyksessä. Merkitse tehty kohta tänne ~~yliviivattuna~~ ja kirjaa se `TILA.md`:hen.

**Rakentajan nykyinen jatko-ohje:** tarkista ensin [uusi havaintolohkon kirjoitusasu](#01-uusi-havaintolohkon-kirjoitusasu) ja [Kojelaudan, Muistion ja kalenterin käyttöparannukset](#kojelauta-muistio-ja-kalenteri-emil-24112026), sitten [havaintomallin säätimet](#0-havaintomalli-ja-säätimet-emil-24112026), sitten [Jäsennyksestä 24.11.2026](#jäsennys-24112026-seuraavaksi-tarkennettavat-ja-lykätyt): se kertoo, mikä on seuraavana, mikä tarkennetaan ensin ja mikä on lykätty. [Tulevien ominaisuuksien toteutusjono](#tulevien-ominaisuuksien-toteutusjono) ja numeroidut kohdat kuvaavat sisällön tarkemmin.

**Ajatusten uudelleenlukeminen:** [Timanttien visio](#visio-ajatusten-risteämissä-syntyvät-timantit) ja [työjonon käyttökokeet](#10-timantin-nostaminen-löytäminen-ja-uudelleenlukeminen).

## Kojelauta, Muistio ja kalenteri (Emil 24.11.2026)

**Työjonon kärkeen.** Kojelaudan havaintoruudun, tarkistuslistan, CSV-mittarin ja taulukon kortin muokkaus kuuluu samaan tilaan. Pieni yläreunaan kiinnittyvä hammasratas avaa muokkaustilan. Ruudun hammasratas avaa suoraan sen asetukset. Plus avaa ruudun lisäyksen. Oikean ruudun editorista voi poistaa kortin. Automaattisesti luotu CSV-mittariruutu piilotetaan kojelaudalta ja voidaan palauttaa lisäysvalinnasta. Lähdeaineisto säilyy.

**0.86.** Yksi muokkaustila, ryhmitellyt asetukset ja kiinteä lomakkeen toimintorivi. Ruudun voi järjestää raahaamalla ja kokoa voi muuttaa kulmasta, sekä hiirellä että kosketuksella. Asettelun voi tehdä myös ruudun editorin Asettelu-kohdassa. Kokona käytetään ruudukon sarakeleveyksiä ja korkeusaskelia. Puhelimen ruudukko sovittaa leveyden kahteen sarakkeeseen. Järjestys, koko ja mittariruudun näkyvyys tallentuvat `data/kojelauta-asettelu.json`:iin. Havaintolohkon asetukset säilyvät `data/kojelauta.md`:ssa ja taulukkokortit oman taulukon `_nakyma.md`:ssä. Havaintoruudun Kirjaa arvo tuottaa `((…))`-lohkon. Taulukkokortin kytkin ja liukusäädin kirjoittavat edelleen valittuun taulukkosoluun.

**Muistio ja kalenteri.** Lukittu esikatselu on leveämpi tietokoneella ja sulkeutuu sivusta napauttamalla tai Escape-näppäimellä. Puhelimen rivien sisältö on pystypanoroitava. Sarakeotsikoista voi vierittää leveää taulukkoa sivuttain. Appin vieritysalueiden reunoilla estetään sivuttaisvierityksen siirtyminen selaimelle niissä eleissä, jotka selain välittää sivulle. Tarkista fyysisen iPhonen pystysuunnan pysyvyys ja Macin Safarin ohjauslevy. Viikon aikajanalla merkinnän raahausesikatselu seuraa osoitinta päivän vaihtuessa. Aikajanalle pudotus siirtää päivän ja kellonajan yhdessä, kesto ja kuittaus säilyvät. Tarkista toistuvien merkintöjen rajaus, peruminen ja ajan muokkaus yhden päivän sisällä.

## 0. Havaintomalli ja säätimet (Emil 24.11.2026)

**0.85:n havaintomalli.** Emil hyväksyi ((…))-merkinnän tekstissä, [[…]]-muistiinpanolinkit, aikavälin, valinnaisen nimetyn kohteen, useita kenttiä samassa lohkossa ja havaintoihin perustuvan tietokantanäkymän. Esimerkit: `((Uni (h): 8))` ja `((Kanan fileesuikale @2026-11-24 12:30 | Annos (g): 150 | Proteiini (g): 34,5 | #ravinto))`. Pitkän lohkon saa rivittää. Kohde ja aika ovat yhteisiä. Suoraan lohkoon merkitty tunniste koskee sen havaintoja. Nimen ja kenttien roolit pysyvät kirjoituksessa samoina, ja rivejä ja sarakkeita voi kääntää. Aika merkitään ISO-päivänä tai päivä ja kellonaika, ilman @-osaa uusi lohko on päivätön. Luku, totuusarvo ja teksti ovat mahdollisia. Lainausmerkeillä voi pakottaa tekstin tai sisällyttää erottimen. Vanha !!-muoto luetaan entisillä päiväsäännöillä. Uusi kirjoitusasu ja vanhojen kirjausten käsittely on määritelty kohdassa 0.1.

**Havainnon ja solun osoite.** Eri lohkot ovat eri kirjauksia, vaikka sisältö ja aikaleima olisivat identtiset. Apin lisäykselle annetaan syntaksiin valinnainen ^-tunnus turvallista uudelleenyritystä varten. Päivämäärä rajaa hakua. Näkymän solu sisältää osumat ja näyttää sarakkeelle valitun arvon, luettelon, määrän, summan, keskiarvon, pienimmän, suurimman tai viimeisimmän. Arvo näyttää yhden osuman tai osumien määrän. Viimeisin näyttää usean arvon osuman, jos uusin ajan tarkkuus ja ajankohta ovat samat. Muokkaa täsmällistä lähdettä avaamalla osuma. Saman lohkon useat kentät kuuluvat samaan kirjaukseen.

**0.85 tehty.** Havaintotaulukko avautuu Valikko → Havaintotaulukot. Valitse rivi kohteen, kirjauksen, päivän, viikon tai muuttujan mukaan. Lisää muuttujia ja laskuja sarake kerrallaan, tai käännä akseleita. Kohteet voi valita etukäteen ja rajata tunnisteella tai päivämäärillä. Näkymä tallentuu `data/havaintonakymat.json`:iin. Kohde- ja muuttujamääritykset ovat valinnaisia ja tallentuvat `data/havaintomaaritykset.json`:iin. Vanha nimi säilyy aliaksena, kun määritys nimetään uudelleen. Uudet Pikamuistiinpanon lisäykset ja Muistion tyhjien tekstimuuttujasolujen kirjaukset käyttävät samaa syntaksia. Vanha taulukkolaskenta, CSV-mittarit ja kenttäruudut säilyvät käytössä.

**0.85 inforuutu ja ensimmäinen säädin.** Tekstimuuttujaruudussa valitaan kohde, muuttuja, havaintotunniste, ajanjakso tai päivämääräväli, lasku ja esitystapa. Lähteet näyttävät laskun havainnot. Ruudun valinnainen *Kirjaa arvo* esitäyttää kohteen, muuttujan ja havaintotunnisteen. Se lisää uuden lohkon valittuun päivämuistiinpanoon. Tietokannan ja kojelaudan laskut käyttävät yhteistä koontia.

**Säätimet kohdan 0.1 jälkeen.** Yhdistä yleisen säädineditorin kertanappi, kytkin, liukusäädin ja XY tähän samaan kirjaustapaan. Toiminto valitsee erikseen lähdemuistiinpanon, mahdollisen kohteen, kentät ja ajan. Lisäys tekee uuden lohkon. Päivitys edellyttää täsmällisen kirjauksen tunnistetta ja kenttää, jotta liukusäädin voi muuttaa yhtä arvoa keskellä lohkon muita kenttiä. Pohjaan jäävä nappi lukee ja kumoaa oman kirjauksensa tunnisteen avulla. Erillinen edistyneempi jatko: tallenna inforuutu viittauksena samaan nimettyyn havaintohakuun kuin taulukko; lisää lähdekenttään vievät havaintolinkit ja kaavahaut, viralliset kohderyhmät, yksiköiden muunnokset ja jo luodun säädinkonfiguraation käyttö Muistiossa ja kanvaasilla. Erottele tilan viimeisin arvo kertaa kohti kirjattavasta tapahtumasta ja per päivä lasketusta koosteesta.

### 0.1 Uusi havaintolohkon kirjoitusasu

**Emilin päätös 24.11.2026. Ensimmäisiä toteutettavia töitä, ennen havaintomalliin kirjoittavien säätimien laajennusta.** Päivämäärä ensin apin muutenkin tunnistamassa muodossa, sitten pilkku, kohteen nimi, kaksoispiste ja muuttujat arvoineen. Käsin kirjoittaessa ei tarvita @-merkkiä eikä pystyviivoja. Säilytä ulommat `((…))`-sulkeet.

```text
((ti 24.11. klo 12.30, Kanan fileesuikaleet: annos = 150 g, proteiini = 34,5 g, rasva = 3 g, valmistustapa = paistettu))
```

- **Jäsennys.** Tunnista lohkon alun ajankohta samalla päivämääräjäsentimellä kuin muualla apissa. Tarkista, että koko ajankohta ennen kohdetta erottavaa pilkkua täsmää. Hyväksy jäsentimen tuntemat yhden päivän tai ajankohdan muodot samalla tarkkuudella. Vuodettoman ja suhteellisen ajan pohja on muistiinpanon luontipäivä kuten muualla apissa. Toistuva ilmaus tai aikaväli ei itsestään muodosta yksittäistä havaintoa. Ajankohta ja kohde ovat edelleen valinnaisia: `((Kanan fileesuikaleet: annos = 150 g))`, `((uni (h) = 8))`. Kellonajan kaksoispiste ei pääty kohteen erottimeksi.
- **Kentät.** Pilkku erottaa kentät, kun sen jälkeen alkaa uusi `muuttuja = arvo` -pari tai sovittu lohkon tunnisteosa. Desimaalipilkku kuuluu lukuun, ja lainattu teksti voi sisältää erottimet. Säilytä nolla, totuusarvot, tekstiarvot, puuttuva arvo, moniriviset lohkot ja aiemmat havaintotunnisteet. Määritä `#tunnisteelle` ja apin omalle `^tunnukselle` uusi yksiselitteinen kirjoitusasu samassa vaiheessa. Yhdistä arvon perässä oleva yksikkö aiemman muuttujamäärityksen yksikköön samoilla muuttujaviitteillä. Olemassa olevan muuttujan nimi, alias tai yksikkö ei saa tulkinnassa muuttua uudeksi muuttujaksi. Lukuarvojen koonnin pitää toimia myös silloin, kun yksikkö kirjoitetaan arvon perään.
- **Lukijat ensin.** Lue uusi muoto, 0.85:n `((…))`-muoto ja vanha `!!…!!` samalla havaintomallilla myös samassa muistiinpanossa ja eri muistiinpanojen yhdistelmässä. Kartoita jäsentimen kaikki kutsut ja mahdolliset erilliset merkkijonotulkinnat. Käy läpi Muistion editori ja esikatselu, muuttujaluettelo ja infoikkuna, rivisarakkeet sekä niiden lajittelu, suodatus, yhteenveto ja täyttö alas, havaintotaulukot ja tallennetut näkymät, kojelaudan inforuudut, kuvaajat ja lähteet sekä nykyiset haku- ja kaavareitit, jotka lukevat muuttujia. Varmista kalenterin, asiasanojen, linkkien ja tekstikorostusten yhteispeli: lohkon aika ei luo kalenterimenoa eivätkä lohkon tunnisteet sekoitu muistiinpanon tunnisteisiin. Koodiesimerkit pysyvät poissa havaintoaineistosta.
- **Kirjoittajat yhteen.** Kun lukutuki on valmis, ota uusi muoto käyttöön uusissa kirjauksissa samasta kirjoitusfunktiosta: Pikamuistiinpano ja sen napit, Muistion puuttuva soluarvo ja täyttö alas, kojelaudan *Kirjaa arvo* sekä myöhemmin havaintoja kirjoittavat säätimet. Muokkaus ja tyhjennys kohdistuvat oikeaan lähdelohkoon ja kenttään myös vanhassa muodossa. Säilytä saman lohkon muut kentät ja muu muistiinpanoteksti. Huomioi synkronointi, offline-jono ja tallennuksen uudelleenyritys. Päivitä apin kirjoitusohje, apin esimerkit ja Vaultin ohjeet vasta toimivan lukutuen käyttöönoton yhteydessä.
- **Nykyiset muistiinpanot.** Toimivuus ei saa edellyttää massamuunnosta. Toteutusehdotus mahdolliselle siistimiselle: erillinen palautettava muunnos varmuuskopiosta ja esikatselun kautta. Vertaa jäsenneltyä sisältöä ennen ja jälkeen. Säilytä kohteet, muuttujat, yksiköt, arvotyypit, havaintojen määrät ja järjestys, aikojen tarkkuus, tunnisteet, apin omat tunnukset ja viittaukset. Säilytä myös vanhan `!!…!!`-havainnon osiosta periytyvä aika tai päivättömyys. Ohita epäselvät tai sillä välin muuttuneet lohkot muunnoksessa. Eri identtiset kirjaukset pysyvät erillisinä.
- **Hyväksy julkaisu**, kun samasta testiaineistosta saadaan molemmilla kirjoitusasuilla samat koonnit, rajaukset ja lähdeosumat kaikilla käytössä olevilla lukureiteillä. Testaa sekamuotoinen muistiinpano, piste ja kaksoispiste kellonajassa, päivätön ja kohteeton havainto, desimaalipilkku, lainattu pilkku ja yhtäsuuruusmerkki, usea rivi, vanhan lohkon yhden kentän muokkaus ja tyhjennys, erilliset samansisältöiset kirjaukset sekä yhden tallennuksen uudelleenyritys. Avaa tallennetut näkymät tyhjällä paikallisella välimuistilla ja tarkista uusi kirjaus puhelimella ja tietokoneella.

## Jäsennys 24.11.2026: seuraavaksi, tarkennettavat ja lykätyt

**Lähde.** Jäsennys perustuu kahteen asiaan:
- Emilin kommentteihin tekoälyn käyttäjälle kirjoittamasta konseptiesittelystä (43 korttia, Emilin claude.ai-tilillä artefaktina *Kaikin tulevat ominaisuudet*, 36 kommentoitu).
- Emilin saneltuihin vastauksiin 20 avoimeen kysymykseen samana päivänä.

Jäsennys ohittaa toteutusjonon järjestyksen. Alkuperäiset kohdat (numerot suluissa) kuvaavat sisällön tarkemmin. **Toteutuslupa on edelleen Emilin ”toteuta”.** Järjestys on tekoälyn ehdotus. Versiot 0.74–0.76 tehtiin ennen kommentteja, ja niiden jatko on merkitty.

### A. Seuraavaksi: päätetty, valmis rakennettavaksi

**Työjonon kärkipäässä:** [uusi havaintolohkon kirjoitusasu ja yhteensopivuus](#01-uusi-havaintolohkon-kirjoitusasu).

1. **Taulukon lukumuodon jatko (tehty 0.77).** Emil: ”rahat, prosentit, ajan ilmaisut monipuolisesti”. Lisätään aikamuodot: `h min` (8,5 → 8 h 30 min), `mm:ss`, kesto päivinä ja päivämäärän muodot (`ma 30.11.`, `30.11.2026`). **Muoto synkataan** (Emil). Se tallennetaan välilehden tiedostoon vaultissa eikä selaimeen, ja vanha selainasetus luetaan kerran. **Taustavärejä ei tehdä** (Emil). 0.77 tallentaa muodot `lukumuodot`-alkutietoon soluosoitteen mukaan. `h min` käyttää tunteja, `mm:ss` sekunteja ja päivämäärämuodot ISO-päivää (`2026-11-30`).
2. **Näkymän oma järjestys ja lukitus (tehty 0.78).**
   - Kun lajittelua ei ole, näkymä näyttää Emilin pysyvän oman järjestyksen. Muistiossa se on `nakymat/*.md`:n Oma järjestys, taulukossa rivien järjestys. Lajittelu ei koskaan tuhoa sitä, ja *Palauta oma järjestys* tuo sen takaisin. **Varmistuskysymystä ei tule** (Emil).
   - *Lukitut näkymät:* pieni, siististi sijoitettu lukkonappi näkymän otsikkorivillä. Lukittuna rivejä voi vain avata tarkasteltavaksi: ei poistoa, lisäystä, järjestelyä tai muokkausta. Avaus palauttaa kaikki toiminnot.
   - **Lukitus synkkaa laitteiden välillä** (Emil). Laiteasetukset eivät synkkaa, mutta tämä onnistuu, koska näkymä ja välilehti ovat vaultin tiedostoja. Lukitus tallennetaan niihin riville `lukittu: kyllä`.
3. **Muistion rivinäkymä tietokannaksi (kohta 21).**
   - **Emilin päätös: sarake on muuttuja.**
     - Uusi sarake on oletuksena tekstimuuttuja, ja sarakkeen otsikko on muuttujan nimi. Soluun syötetty arvo kirjoittuu muistiinpanoon merkintänä `!!Uni (h): 8!!`. Näin samaa tietoa voi käyttää näkymissä, kojelaudassa ja tekoälyn kirjauksissa.
     - Sarakkeen laji (luku, päivä, valinta…) valitaan kuten ennenkin.
     - **Otsikkoa ei voi aluksi vaihtaa erilleen muuttujan nimestä.** Näyttönimi lisätään vasta, jos Emil tarvitsee sitä.
     - Vanhat alkutietokentät (0.63, esim. `uni: 8`) pysyvät luettavina ja muokattavina.
     - *Tekoälyn oletus tarkennukseen:* solu näyttää muistiinpanon viimeisimmän arvon. Muokkaus päivittää viimeisimmän merkinnän. Jos merkintää ei ole, uusi merkintä lisätään tekstin loppuun.
   - Järjestys:
     1. Suora kirjoitus soluun (21.1, tehty 0.79).
     2. ＋ sarake (21.2), muuttujasarakkeena (tehty 0.80).
     3. Yhteenvetorivi (21.3, tehty 0.81).
     4. Päiväsarake (21.5, tehty 0.82). *Näytä kalenterissa* on oletuksena pois.
     5. Valinta, monivalinta ja tila (21.6, tehty 0.83). **Sirut mukailevat huurteisen lasin estetiikkaa** (Emil): läpikuultava, sumennettu pinta ja hento reuna. Safarissa `-webkit-backdrop-filter`, ja kontrasti vähintään 4,5:1.
     6. Täyttö alas Muistiossa (21.4, tehty 0.84).
     7. Ehtokaavat (21.7).
     8. Linkit- ja relaatiosarake (21.8).
4. **Muistiinpanot.**
   - **Linkit kirjoitetaan `[[…]]` (Emil 24.11.2026).** Nykyinen linkkien lukeminen jatkuu. Automaattinen puuttuvan linkkikohteen luonti ja sen näkymä ovat erillinen jatkotyö. `((…))` on käytössä havainnoille kohdassa 0.
   - Muuttujamäärityksen kuvaus ja yksikkö tehty 0.85. Samankaltaisen nimen ehdotuksen laajennus kohteisiin on jatkotyötä.
   - Tunnisteiden yhdistäminen (toteutusjono 7). **Myös tekstiin kirjoitettu tunniste muuttuu**, ja esikatselu näyttää jokaisen kohdan ennen hyväksyntää (Emil).
   - **Turvallinen nimen vaihto** (toteutusjono 2). Emil: korjataan linkit, kaavat ja ruudut kerralla, kun lista on ensin näytetty.
   - Graafin yhteinen tunniste katkoviivana valinnaisena kerroksena.
   - Rinnakkaisnäkymä tietokoneella **valintana, ei oletuksena** (Emil).
   - **Muistio ei näytä oletuksena käyttötiedostoja** (Emil): pikanappien pohjat, `data/`, näkymät, kojelaudan asetukset, kaaviot ja tekoälyn ohjeet. Ne löytyvät omista osioistaan ja *Kaikki*-suodattimella. Uudet piilokansiot kirjataan vaultin `ohjeet/appi.md`:hen.
5. **Kojelaudat: pikanäkymät eri tarkoituksiin.**
   - **Useita kojelautoja** (Emil) ja vapaa asettelu (toteutusjono 3).
   - Emilin tavoite: kojelauta on pikanäkymä, jossa on sekä inforuutuja että säätimiä (kohta A6), ja jolla pääsee tekemään asioita *ilman muistiinpanoviidakkoon sukeltamista*. Säädin voi vaikuttaa saman kojelaudan tietoon tai mihin tahansa muualle.
   - *Tekoälyn näkemys:* kojelauta pysyy puhelimeen sopivana, pystyyn vierivänä ruudukkona. Kaavioiden kanvas (A8) on vapaa pohja tietokoneelle. Samat palikat (inforuutu, säädin) toimivat molemmissa, joten käsitteitä ei tule kahta.
   - Tekstiruutu.
   - Korrelaatio: näkyy ensimmäisestä parista alkaen, ja **alle 10 parista tulee pieni merkintä** (Emil).
6. **Säätimet ja toiminnot: oma editori napeille ja muille säätimille (Emil 24.11.).** Tämä korvaa pikanappien hallinnan (toteutusjono 4) ja Toiminnot-kohdan. Säädin tehdään kerran editorissa, ja sitä voi käyttää missä vain.
   - **Säätimen lajit:**
     - **kertanappi**
     - **pohjaan jäävä nappi**: päälle kytkettäessä se kirjoittaa, pois kytkettäessä se poistaa täsmälleen kirjoittamansa. Tila luetaan tekstistä: onko rivi tänään olemassa. Näin tila synkkaa, ja käsin poistettu rivi vapauttaa napin.
     - **liukusäädin**
     - **XY-pädi**, jonka X- ja Y-suunnalle määritellään kummallekin oma toimintonsa
     - myöhemmin muita.
   - **Toiminto valitaan säädinkohtaisesti:**
     - *Mitä kirjoitetaan:* teksti, muuttuja (nimi ja arvo), aikaleima tai näiden yhdistelmä.
     - *Lisää vai päivitä:* **lisää uusi rivi** joka painalluksella (iteratiivinen, esim. kahvi + aikaleima), tai **päivitä** olemassa oleva arvo tai aikaleima.
     - *Minne:*
       - Muistion rivin nappi kirjoittaa **sen rivin muistiinpanoon** (Emil).
       - Kojelaudan nappi ja pikanappi kirjoittavat oletuksena **päivän muistiinpanoon** (Emil).
       - Lisäksi kohteeksi voi valita olemassa olevan tekstin hakuvalikosta (hakukenttä, koska tekstejä on paljon), tai säädin tekee **oman muistiinpanon** vain itselleen.
       - Valittu teksti voi myöhemmin kadota. Silloin säädin kertoo siitä eikä kirjoita minnekään.
     - *Aika:*
       - **Nyt**: päivä ja kellonaika, oletus.
       - **Vain päivä.**
       - **Kysy päivä joka kerta**, kellonaika valinnainen.
       - **Kalenterissa valittu päivä.**
       - Muut tavat lisätään, kun Emil keksii tarpeen.
   - **Kumoa** (Emil): pieni ja huomattava (esim. punainen) näytön reunassa. Se ei peitä mitään eikä keskeytä tekemistä, ja sen voi jättää huomiotta. Näkyy noin 6 sekuntia. *Tekoälyn tarkennus:* vilkkumisen sijaan yksi pehmeä sykäys ilmestyessä. Jatkuva vilkkuminen häiritsee ja on saavutettavuusriski. Sykäys ohitetaan, kun liike on vähennetty.
   - **Suhteellinen XY** (toteutusjono 4) mittarikohtaisena valintana (Emil): keskellä on edellinen arvo, ja liu'utetaan vain muutos.
   - **Toteutusjärjestys:**
     1. Editori, kertanappi ja toiminnon asetukset.
     2. Käyttö kojelaudalla ja pikakirjauksessa.
     3. Muistion nappisarake.
     4. Pohjaan jäävä nappi.
     5. XY-säädin.
     6. Kaavion tuotosruutu (23.2).
   - Nykyiset pikanapit (`pohjat/pikakirjaus.md`) ja muuttujanapit (0.72) avautuvat editorissa säätiminä, ja vanha muoto pysyy luettavana.
   - Tallennusmuodon v1 valitsee rakentaja niin, että se on luettava ja tekoälyn kirjoitettavissa. Ehdotus: `pohjat/saatimet.md`. Muoto kirjataan vaultin ohjeeseen.
7. **Kalenteri, toistuvuus ja kuittaus.**
   - **Nimet** (Emil, 22.1): nykyinen Aikajana-nappi on puhelimessa pystyssä **Päivä**, vaakana **Viikko** ja tietokoneella **Viikko**. *Aikajana* jää palkkinäkymälle.
   - Aikajanan perusnäkymä palkkeina, vain luettava (22.2).
   - **Kolmitilainen kuittaus (Emil: ”just noin me se tehdään”):** yksi ruutu, ei toista. Napautus kuittaa toteutuneeksi (vihreä väkänen), toinen napautus toteutumattomaksi (ruksi, vaimea punainen) ja kolmas tyhjentää. Kalenterissa tilat erottuvat värillä ja muodolla. Toteutumaton kerta tallentuu samaan `kuitattu:`-riviin merkinnällä, esimerkiksi `2026-11-29 ei`. Vanha muoto luetaan toteutuneena. Kalenteri, kojelaudan tarkistuslista ja toistuvuus käyttävät samaa tietoa, ja tieto tilastoi toteutumista. Vaultin `ohjeet/appi.md` päivitetään.
   - **Toistuvuuden vakiinnutus** (kohta 18): rytmi valitaan muistiinpanokohtaisesti. **Oletus lasketaan kuittauksesta**, ja kiinteä rytmi on valittavissa. **Toteutumaton kuittaus siirtää seuraavan kerran**, ja tilastoon jää ”ei toteutunut” (Emil).
8. **Kaaviot: kanvas ja kaaviotiedosto (23.1).** Kaaviot ovat piilossa Muistion oletuslistasta, ja *Kaikki*-suodatin näyttää ne. **Kaavion valintoja ei muisteta sulkemisen jälkeen** (Emil, 23.2). **Kirjaus tekstiksi on valinnainen** (Emil). Ehdotuksena on kaaviokohtainen valinta *Kirjaa valitut*. Ehdolliset napit (23.2) tulevat säätimien jälkeen, koska tuotosruutu on toiminto.

### B. Tarkennetaan yhdessä ennen rakentamista

1. **Tekstit riveinä ja tekstin tunniste (Emil 24.11., uusi).** Emil ehdottaa, että näkymä voi listata muistiinpanojen lisäksi **tekstit**, eli muistiinpanon `---`-osiot. Joskus olennaista ei ole se, missä muistiinpanossa teksti on, vaan tekstiä käytetään rakenteisesti muualla. Emil kirjoittaa usein monta asiaa samaan muistiinpanoon.
   - *Tekoälyn näkemys:* hyvä ja linjakas idea. Kaikki käsittelee osioita jo yksikköinä: kalenterin ajankohdat ja kuittaukset, muuttujan osiopäivä ja kojelaudan tarkistuslista (0.71). Tekstillä ei ole omia alkutietoja, mutta **sarake on muuttuja** (A3), ja muuttuja elää tekstin sisällä. Siksi tekstirivit sopivat tietokantaan luontevasti. Näkymään tulisi valinta *Rivit: muistiinpanot / tekstit*.
   - *Tallennus:* tekoäly suosittelee, että teksti **ei** muutu omaksi tiedostokseen vaultissa. Tiedostojen määrä moninkertaistuisi, jokainen kirjoitus olisi monen tiedoston muutos, ja Emilin tapa kirjoittaa samaan muistiinpanoon rikkoutuisi. Appi voi näyttää tekstit yksikköinä ilman, että tallennus muuttuu.
   - *Avoinna:* **tekstin pysyvä tunniste.** Teksti tarvitsee nimen, joka säilyy, kun tekstiä tai sen paikkaa muutetaan. Sama tunniste tarvitaan kolmeen asiaan: säätimen kohteeksi valittuun tekstiin (A6), upotukseen (B2) ja tekstiriveihin. Se suunnitellaan siksi kerralla. Vaihtoehdot ovat tekstin ensimmäinen rivi tai otsikko (luettava, mutta hauras) ja pieni piilotunniste (kestävä, mutta näkyy tiedostossa).
2. **Upotus (23.3).** Emil: haluaa, mutta säädetään yhdessä. Riippuu tekstin tunnisteesta (B1).
3. **Kaavioiden jatko** (23:n visio: laskenta, upotukset kaaviossa, muistiinpanokortit). Emil: mietitään myöhemmin tarkemmin.

### C. Lykätty kauemmas

Ei rakenneta eikä suunnitella pidemmälle ennen kuin Emil ottaa asian esiin:
- Flow tekstinä (kohta 7)
- Listat luettavaksi tekstiksi
- Aikajanan nimetyt vaiheet (22.3)
- Riippuvuudet ja laskettu paikka (22.4–22.5)
- Toteumat, ”kuinka monena päivänä”
- Treenisarjat kojelaudalle ja Treeni-osion tulevaisuus (kytkeytyy Juuren karsintaan)
- Timanttien lukutila ja ”Mikä auttaisi tässä?” (kommentoimatta, visio ennallaan)
- Taulukon taustavärit (Emil: ei toistaiseksi)

### D. Ei erillistä ominaisuutta

- **Painoarvo** on tavallinen lukukenttä tai muuttuja, ja Muistion lajittelu (0.64) järjestää sen mukaan.
- **Uni ja ateriat** ovat Emilin omia muuttujia niin monta kertaa päivässä kuin hän haluaa, ja kojelauta laskee niistä. Emil nimeää ja määrittelee muuttujat itse.
- **Ajatuksen nosto** tehdään tunnisteella tai kentällä ja tallennetulla näkymällä. Yksittäisen virkkeen nosto pitkästä tekstistä odottaa tekstin tunnistetta ja upotusta (B1–B2).

### E. Kommentoimatta, ennallaan

- Liitteet, Notion-tuonti ja Juuren karsinta (toteutusjono 8) ovat päätöstä odottavia kokeiluja.
- Aksentti ja otsikkofontti valitaan Emilin iPhonella.

**Historiallinen yöajon tilanne 23.11.2026, ennen versiota 0.54.** Päähaaran viimeisin appiversio oli 0.51. Työympäristö katkesi juuri ennen seuraavien kahden paikallisen version julkaisua. Kohdennetut testit menivät niille läpi Chromiumissa.

- **0.52, kohta 18:** Toistuvuus muistiinpanon `toistuu`- ja `seuraava`-kentissä, kiinteän rytmin ankkuri `juuri.toistoalku`. Tarkista aikainen kuittaus ja rytmin säilyminen, kalenterimerkintä sekä synkka. Säilytä vanhan Toistuvat-listan sisältö.
- **0.53, A0.3 ja A0.7:** Jaa Muistion näkymän sarakeleveydet näkymätiedoston `| w=210`-muodossa. Säilytä aiemmat paikalliset leveydet sekä näkymätiedoston muut asetukset ja teksti. Tarkista sarakkeiden raahausjärjestys näkymämuokkaimessa, kaksoisnapsautuksella sovitus ja ristiriita, jos näkymä muuttuu GitHubissa kesken muokkauksen.

Tuolloinen palautusohje oli seuraava: aloita etsimällä, saako paikallisen työn työympäristöstä talteen. Jos sitä ei saa, jatka päähaaran versiosta 0.51 ja toteuta 0.52 ja 0.53 yllä olevan rajauksen mukaan. Aja koko testisarja ennen julkaisua. Sen jälkeen seuraava itsenäinen askel on näkymämuokkaimen usean kentän lajittelu (A0.7).

## Käytettävyyden ja vakauden korjaussuunnitelma 23.11.2026

Pohjana on päähaaran versio 0.54, commit `6bea243`. Tämä on Emilin pyytämä arvio ja ehdotus toteutusjärjestykseksi. Ennen koodausta tarkista uusimmat commitit ja A0.3/A0.7 sekä muiden rakentajien tilanne. Vanha yöajon versiomerkintä ei yksin kerro, mitä päähaarassa on. Käytä alla olevia tehtäviä alkuperäisten kohtien hyväksymistesteinä, jotta samaa ominaisuutta ei rakenneta kahdesti.

**Tarkistuksen aineisto.** Muistion rivinäkymää vieritettiin Chromiumissa 900 CSS-pikseliä sadan synteettisen muistiinpanon listassa. Tarkistettiin palkkien sijainti, osuman vastaanottava elementti ja kohdistin sarakerajan molemmin puolin. Testivaultilla läpäisivät selaintestit 08, 25, 30, 31, 36, 41, 47, 50, 51 ja 54. Ne kattavat muun muassa ZIP-viennin, kaavat, taulukkomuokkauksen, kalenterin, treenipikakirjauksen ja graafin. Alla erotetaan mitatut virheet, koodista löytyvät riskit ja vielä kokeiltavat käyttötapaukset. Fyysisen iPhonen Safari, verkkohäiriöt ja suuren aineiston vasteajat tarvitsevat omat mittauksensa.

### ~~1. Estä näkymäasetusten ylikirjoittuminen ennen editorin laajentamista~~ (tehty 0.55, testi `selain_55.py`)

Koodihavainto: `nvText(D,old)` rakentaa alkutiedot uudelleen tuntemistaan kentistä ja säilyttää vanhasta tiedostosta rungon. Käsin lisätty alkutietorivi tai sarakkeen ylimääräinen määre voi siksi kadota jo näkymän nimen vaihtuessa. `nvSaveDraft` vapauttaa yhteisen luonnoksen ennen verkkokirjoitusta. Varatun synkan ajastettu uusinta sijoittaa vanhan luonnoksen takaisin samaan muuttujaan, vaikka käyttäjä olisi jo avannut toisen näkymän. Virheilmoitus ei itsessään palauta luonnosta.

- Tee ensin kaksi testinäkymää A ja B, A:han oma alkutieto, ylimääräinen sarakemääre, kommentti ja Markdown-runko. Muuta vain A:n nimeä. Vertaa tiedostoa riveittäin. Vain nimen kuuluu muuttua. Varmista sama myös silloin, kun palvelimelle ilmestyy uusi rivi A:n ollessa auki.
- Päivitä vain käyttäjän muuttamat kentät tuoreimpaan tiedostoon. Vertaa alkuperäistä, luonnosta ja palvelimen arvoa. Yhdistä eri kenttien muutokset. Saman kentän ristiriidassa säilytä molemmat versiot ja tarjoa ratkaisu. Pidä keskeneräinen tallennus näkymän, repon ja haaran yhteydessä. Säilytä epäonnistunut luonnos uudelleenyritystä varten.
- Hyväksy vasta, kun A:n hidas tallennus, B:n samanaikainen muokkaus, yhteyskatko, uusinta ja peruminen on ajettu testivaultilla. A:n valmistuminen ei saa valita A:ta kesken B:n muokkauksen. Vain käyttäjän vahvistama sisältö saa päätyä oikeaan tiedostoon. Käytä nykyistä sulkemalla tallentamisen käytäntöä ja näytä odottava tai epäonnistunut tallennus ymmärrettävästi.

### ~~2. Sulje Muistion yläpalkin rako~~ (tehty 0.56, testi `selain_56.py`)

**Toistettu.** Leveydellä 1440 px työkalupalkin alareuna oli kohdassa 143 ja sarakeotsikon yläreuna kohdassa 147. Kaksi pikseliä otsikon yläpuolella osuma tuli vierivään otsikkosoluun. Leveyksillä 390 ja 320 vastaavat reunat olivat molemmat kohdassa 80. Muistion `.nbar` ja `.rvh` ovat erilliset sticky-elementit. Ensimmäisen yläsiirtymä muuttuu leveällä näytöllä. Toisen laskukaava vähentää aina 10 px. Vaakavieritys synkronoidaan erikseen listasta otsikkoon.

- Johda molempien yläsiirtymä yhdestä näkymän todellista sisäreunaa kuvaavasta mitasta. Seuraa palkin korkeutta myös fontin, asennon ja painikerivin muuttuessa. Säilytä otsikoiden vaakasijainti, taustan peittävyys ja ensimmäisen sarakkeen kiinnitys. Pelkkä z-indexin kasvattaminen ei sulje mitattua rakoa.
- Testaa vierityksen alussa, keskellä ja lopussa sekä vinottain vierittäen. Palkkien välissä saa olla niiden oma rajaviiva. Välin osumatesti ei saa palauttaa listariviä. Otsikon ja vastaavan solun reunojen ero enintään 1 CSS-pikseli. Toista 320/390/1280/1440 px, suurella tekstillä sekä vaalealla ja tummalla teemalla.

### ~~3. Erota lajittelu, leveyden säätö ja siirto~~ (tehty 0.57, testi `selain_57.py`)

**Toistettu.** Kansio-sarakkeen oikealla rajalla kohdistin oli 1440 ja 390 px:n näkymissä `col-resize` kohdissa −4 ja −1 px, mutta oletuskohdistin kohdissa +1 ja +4 px. `.rv-rz` ulottuu solun ulkopuolelle ja `.rvc` leikkaa ylivuodon. Otsikko-sarakkeen painike näyttää tartuntakäden, vaikka `nvHeadDrag` jättää sen paikalleen. Siirto ja leveyden säätö kuuntelevat ikkunan liikettä ja vapautusta. Kummastakin puuttuu peruutuksen käsittely.

- Aseta leveyden säätöalue rajaviivan ympärille kerrokseen, jossa viereinen solu ei peitä sitä. Näytä raja korostettuna jo osoitettaessa. Hiirellä ehdotettu tavoite on vähintään 6 px molemmille puolille. Testaa oikea osuma `elementFromPoint`-kutsulla myös vaakavierityksen jälkeen. Rajalta veto säätää vain leveyttä. Lajittelun kohdistin näkyy kiinteässä otsikossa ja tartuntakäsi vain siirrettävässä kohdassa.
- Käytä yhtä aktiivista osoitinta ja päätä eleestä vain kerran. Vapautus vahvistaa, keskeytys tai osoittimen kaappauksen menetys poistaa korostukset ja palauttaa lähtötilan. Tarkista reunan ulkopuolella vapauttaminen, väärä hiirinappi, toinen sormi ja nopea uusi veto. Vedosta ei saa seurata lajittelua.
- Puhelimella anna otsikkoriviltä vierittää taulukkoa sivulle. Tarjoa täsmälliseen säätöön myös sarakevalikko, jossa on vasemmalle/oikealle siirto, leveyden säätö ja oletusleveys. Hyödynnä `nvRenderEd`-editorin nykyisiä siirtopainikkeita ja jaa niiden järjestyslogiikka raahauksen kanssa. Samat toimet pitää voida tehdä näppäimistöllä, ja kohdistuksen pitää palata siirrettyyn otsikkoon. Pidä lajittelu yhden napautuksen toimintona.

### 4. Selvitä nimet ja asetusten tallennuspaikat käyttäjälle

- ~~Toista sarakejärjestyksen ero kahdessa selainprofiilissa, erota yhteinen ja paikallinen järjestys sekä tarjoa paluu yhteiseen.~~ Tehty 0.60. Näkymäeditori muokkaa tiedoston järjestystä. Otsikosta siirretyt sarakkeet saavat etusijan kyseisellä laitteella, kunnes käyttäjä valitsee *Käytä näkymän sarakejärjestystä*. Toistotulos on TILA-tiedostossa ja testi on `selain_60.py`.
- ~~Jaettu sarakeleveys, laitekohtainen poikkeus ja sisällön mukaan sovitus.~~ Tehty 0.62 Muistion nimetyille näkymille. Editori tallentaa yhteisen leveyden. Otsikon valikko ja leveyssäätimen kaksoisnapsautus sovittavat leveyden laitteelle. Testi `selain_62.py` kattaa kaksi laiteprofiilia ja rinnakkaiset muokkaukset.

- Erota näkymän nimi, käyttäjälle näkyvä sarakeotsikko ja aineiston kenttänimi. Tarjoa otsikon valikosta ymmärrettävä nimeämistoiminto. Näyttönimen vaihdon pitää säilyttää lajittelu, kaavat, suodatus ja lähdemuistiinpanot. Jos pysyvä näyttönimi vaatii uutta tiedostomuotoa, sovi se Emilin kanssa ensin. ~~Tarjoa sovitus sisältöön ja palautus näkymän leveyteen erillisinä toimintoina.~~ Tehty 0.62.
- Tarkista samannimiset näkymät, pitkä nimi, tyhjä nimi, keskeytetty kirjoitus ja näkymän avaaminen uudelleen. ~~Säilytä kohdistus ja pidä käsiteltävä sarake näkyvissä, kun editorin sarakelista päivittyy.~~ Tehty 0.60.

### 5. Mittaa hidastuminen käyttäjän tekemästä toimesta näkyvään tulokseen

**0.69.** Mitattu 100 ja 1 000 muistiinpanolla. Otsikot ja rivit ovat samassa vieritysalueessa. Lajittelu käyttää olemassa olevia rivejä, haku hyödyntää tekstin välimuistia ja tunnisteet sovitetaan näkyville riveille. [Tulokset](TILA.md). Suuren aineiston sarakevedon tasaisuus ja sanalinkki-indeksin samanpituisen muutoksen koe ovat vielä avoimia.

**Alkuperäiset mittauskohteet.** Ennen 0.69-versiota rivinäkymä rakentaa jokaiselle tulokselle kaikki solut. `nvHeadDrag` lukee lasketut sarakeleveydet ja kirjoittaa tyylit jokaisella liiketapahtumalla. `nvFitTags` mittaa kaikkien tunnistesolujen sirut, myös edellisessä sovituksessa piilotettuja. `render0` ajaa yhteisiä päivityksiä ennen osion piirtoa. `wlNow` käyttää osana välimuistin avainta tekstien yhteispituutta. Samanpituisen sanan vaihto on siksi kokeiltava.

1. Generoi testivaultit, joissa on 100 ja 1 000 eripituista muistiinpanoa, kuusi saraketta, pitkiä tunnisteita sekä ristiinlinkkejä. Tallenna samalla laitteella ennen ja jälkeen viisi ajoa. Mittaa näkymän avaus, hakumerkin syöttö, lajittelun valmistuminen sekä ruutujen välit kahden sekunnin raahauksessa. Erota verkon odotus käyttöliittymän työstä. Kirjaa mediaani ja hitain ajo sekä laitteen ja selaimen tiedot.
2. Lue lähtöleveydet kerran vedon alussa, päivitä viimeisin osoittimen paikka korkeintaan kerran piirrettävää ruutua kohti ja tallenna vasta vahvistuksessa. Mittaa uudelleen ennen laajempaa uudelleenrakennusta. Tavoitteena ei yhtään yli 50 ms:n pääsäietyötä tavallisen sarakevedon aikana vertailulaitteella.
3. Testaa tunnistesarake leveä → kapea → leveä → kapea. Näkyvien sirujen ja +N-luvun on joka kierroksella täsmättävä. Jos piilotetun sirun leveys on nolla, mittaa luonnollinen leveys erillään piilotustilasta ja käytä samaa mittaa koko sovituksessa. Tee sanalinkille testi, jossa vaihdetaan sana samanpituiseksi ja avataan siihen liittyvät muistiinpanot. Korjaa mahdollinen vanhentunut indeksi sisältömuutoksesta päivittyvällä avaimella.
4. Jos suurella aineistolla listan luonti jää pullonkaulaksi, vähennä ensin turhia koko listan uudelleenpiirtoja. Kokeile vasta mittausten perusteella näkyvien rivien vaiheittaista piirtoa. Säilytä hakutulos, monivalinta, näppäimistökohdistus, ensimmäinen näkyvä muistiinpano ja suhteellinen vierityskohta.

### 6. Muistiinpanon linkitys kirjoituksen aikana

**Nykyinen raja on varmennettu.** `vLinkTap` avaa lukunäkymässä tunnistetun wikilinkin. Puuttuva kohde tuottaa ilmoituksen. Aiempi keskustelu antaa seuraavan työnkulun ehdotukseksi. Toteutuspäätös on avoin.

- Käyttäjä kirjoittaa esimerkiksi `Palaan ((retken valmisteluun)) myöhemmin.` ja viimeistelee lähtömuistiinpanon. Napautus avaa olemassa olevan yksiselitteisen kohteen tai tarjoaa uuden luomista. Useita osumia erotellaan otsikolla ja kansiolla. Tarkista ennen luontia myös suodattimen piilottama kohde, jotta kaksoiskappaletta ei synny.
- Avaa uusi kohde esitäytetyllä ensimmäisellä rivillä. Anna vaihtaa otsikko. Lähteen lauseessa säilyy alkuperäinen taivutus. Käytä nykyistä wikilinkkiä ja aliastekstiä, kun todellinen tiedostopolku on tiedossa. Sovi Emilin kanssa oikotie, luontihetki ja odottavan linkin esitys. Tavallisten sulkujen, kaavojen ja aiemmin kirjoitetun tekstin on säilyttävä.
- Testaa myös paluu samaan lähtökohtaan, peruttu luonti, kaksi napautusta, yhteyskatko ja uudelleenavaus toisella laitteella. Lähtötekstin luonnos ei saa kadota kohteeseen siirryttäessä. Takaisinlinkkien ja graafin tulee löytää valmis yhteys kerran.

### 7. Muiden osioiden käytettävyyskierros

Seuraavat ovat tehtäväkohtaisia tarkistuksia. Korjaa toistuva puute ja lisää juuri sen paljastava testi. Säilytä jo toimivat reitit.

| Osio | Kokeiltava tehtävä ja hyväksymisehto |
|---|---|
| Kalenteri | Luo vartin merkintä, vieritä sen kohdalta, kuittaa, muuta kestoa ja siirrä päivää. Vain valittu toiminto toteutuu. Toista kahden päällekkäisen merkinnän, piilotetun maanantain ja kuunvaihteen kanssa. Käytä 36/54-testejä lähtötasona. |
| Taulukot | Valitse solu, avaa näppäimistö, nimeä sarake, peru ja liitä useita rivejä. Tarkista otsikon, solun ja kaavarivin kohdistus molemmissa vierityssuunnissa. Virheen tai verkkokatkon jälkeen syöte on palautettavissa. Kaavaviittaukset seuraavat hyväksyttyä rakennemuutosta. Lähtötestit 25/30/41. |
| Kojelauta, Treeni ja pikakirjaus | Avaa kirjaus tyhjästä tilanteesta, kirjoita desimaaliluku, korjaa se ja napauta tallennusta nopeasti kahdesti. Näytä kohde, yksikkö ja päivä ennen vahvistusta sekä valmis tai jonossa oleva kirjaus jälkikäteen. Samasta vahvistuksesta syntyy yksi tietorivi. Aiempi arvo säilyy peruttaessa. |
| Listat, Asiat ja Flow | Tee ja kuittaa rivi, järjestä rivejä ja siirrä kaavion kohdetta. Kokeile myös aloitusta ilman sisältöä. Tarkista näkyvä seuraava toiminto, vierityksen ja raahauksen erottuminen, peruutus sekä paluu samaan listaan. Tee kokeet olemassa olevilla rakenteilla ja kirjaa puuttuva kosketus- tai näppäimistöreitti. |
| Graafi ja takaisinlinkit | Avaa pitkän listan keskeltä takaisinlinkit ja niistä muistiinpano. Sulje päällimmäinen ikkuna ja tarkista vieritys sekä kohdistus. Graafin raahaus ei saa avata solmua. Tarkista pitkien samankaltaisten otsikoiden erottuminen myös tekstilistassa. |
| Asetukset, synkka ja vienti | Kokeile ilman yhteyttä, jonon kanssa ja synkan aikana. Tarkista, että päivityksen tila erottuu myös ilman väriä ja virheestä pääsee takaisin omaan työhön. Vie ZIP odottavan luonnoksen kanssa. Tarkista sisältö ja ettei vienti lähetä luonnosta verkkoon. |
| Yhteinen ulkoasu | Käy kunkin pääosion tyhjä tila, täysi tila ja muokkaustila läpi. Vertaa samojen toimintojen nimeä, sijaintia ja kuvaketta. Testaa vaalea ja tumma teema, suuri teksti, pitkä otsikko ja näyttönäppäimistö. Pienet ikkunat suljetaan ulkopuolelta, Esc palauttaa kohdistuksen avaajaan ja keskeneräisen syötteen kohtalo on ennakoitava. |

**Luovutus rakentajalle.** Aloita tietojen säilymisen testistä ja palkin neljän pikselin toistosta. Tee kukin korjaus omana testattavana kokonaisuutenaan. Kirjaa `TILA.md`:hen havainto, toisto, tehty muutos, ennen/jälkeen-tulos ja seuraava avoin kohta. Liitä ulkoasukorjaukseen samalla aineistolla otettu vertailukuva. Aja kohdennetut testit ja lopuksi `sh kaikki/testit/aja.sh`. Merkitse oikean iPhonen Safari- ja kosketuskokeilu erikseen. Uusi Vault-muoto, tietojen siirto ja vanhan osion poistaminen vaativat oman päätöksen.

## Yhteiset säännöt (Kaikki)

- Appi: `kaikki/index.html` (yli 800 kt). **Älä lue kokonaan**: `python3 tyokalut/kartta.py kaikki` (osiot), `-n <funktio>` (rivi), `-f <osio>` (osion funktiot).
- `<script id="engine">` = Juuren moottori (ei DOMia), sen jälkeen käyttöliittymä. Vault-koodi osiossa *Kaikki 0.1: GitHub-vault* (`VC` välimuisti `{files:{polku:{sha,t}}, q}`, `vPull`, `vApply`, `vCollect`, `VAULT.*` moottorissa).
- Vaultin säännöt: repo `Kasibanaani/vault123`, sen `AGENTS.md` ja `ohjeet/appi.md` (mihin appi luottaa). Älä riko niitä; muutos vaultin sääntöön vaatii Emilin päätöksen ja kirjauksen `ohjeet/paatokset.md`:hen.
- Ulkoasu: Emilin appilinja (puhelin ensin, alapalkki peukalolle, ei ohjetekstejä näkymässä vaan i-napin takana, pieni ikkuna päälle, ulkopuolinen napautus sulkee, ei pomppimista, ei emojeja). Kontrasti ≥ 4,5:1 vaaleassa ja tummassa.
- Testit: `sh kaikki/testit/aja.sh` (Python + Playwright + Chromium). Uusi toiminto = uusi `kaikki/testit/selain_<versio>.py` testirepoa vasten (`fakegh.js`), puhelin 390 ja 320 px, tietokone 1440 ja 1280 px. Ei oikeaa vaultia testeissä (julkinen repo, ei henkilötietoja).
- Vienti suoraan päähaaraan, `git pull --rebase` ennen pushia. Versio: seuraava vapaa (0.8, 0.9 …) commit-viestiin ja `TILA.md`:hen.
- Kerro Emilille: testattu tietokoneen selaimessa, ei iPhonella.

## Työjono: mitä voi rakentaa ensimmäisenä versiona (Emil 22.11.2026)

**Periaate (Emil):** kaikkia kysymyksiä ei tarvitse ratkaista etukäteen. Kun kohta on tarpeeksi tarkka, tehdään **rajattu ensimmäinen versio (v1)**, jota Emil pääsee kokeilemaan, ja seuraava askel päätetään kokeilun perusteella. v1 saa ottaa käyttöön tässä ehdotetun tiedosto- tai kirjoitusmuodon (Emil hyväksyi v1-muodot kokeiltaviksi 22.11.2026); jos muotoa myöhemmin muutetaan, appi lukee aina myös vanhan muodon. Jokaisen v1:n jälkeen `TILA.md`:hen: mitä jätettiin pois ja mitä Emililtä kysytään kokeilun jälkeen.

**A0. SEURAAVAKSI: Emilin kokeilupalaute 22.11.2026 illalla (ennen muita kohtia).** Emil: ”taulukkolaskentapuoli ei toimi vielä juuri lainkaan”; muistiinpanolista ei hyödynnä koko leveyttä; tarvitaan sarakkeiden raahaus, pystyviivat, monivalinta, omat suodatusnäkymät, kompaktimpi oletusmuotoilu. Tekoälyn havainnot kuvista (1440 ja 1920 px, 22.11.): Taulukot-alue on rajattu n. 1100 px:iin keskelle, solut ovat isoja (n. 45 px), taulukko valitaan selaimen alasvetovalikosta ja napit (+ Välilehti, + Rivi, + Sarake, Vie CSV) ovat taulukon alla; rivinäkymässä ei ole sarakeviivoja, ja Valitse (0.22) on pieni erillinen nappi; yläpalkissa on 8 pientä kuvaketta. Tee nämä v2:na tässä järjestyksessä, jokainen oma versionsa ja testinsä (tietokone 1440 ja 1280 px, puhelin 390 ja 320 px):
1. ~~**Taulukot, kompakti ja koko leveys**~~ ja 2. ja 3. (taulukoiden osalta) tehty 0.30. **Taulukot, kompakti ja koko leveys:** rivit 28–30 px, fontti 13–14 px, ohuet ruudukkoviivat (`--sep`), sarakeotsikot (A, B … + nimi) ja rivinumerot jäädytettyinä, alue käyttää koko leveyden (ei 1100 px rajaa). Taulukon vaihto pienestä ikkunasta (ei natiivi select), välilehdet alareunaan Sheetsin tapaan, toiminnot otsikkorivin ⋯-valikkoon tai yläpuolen kapeaan työkaluriviin.
2. **Taulukot, solujen käyttö kuin Sheetsissä (tietokone):** solun valinta napsautuksella (korostusreuna), nuolinäppäimet, Enter = muokkaa / vahvista ja alas, Tab = oikealle, Esc = peru, kirjoittaminen aloittaa muokkauksen, Delete tyhjentää, alueen valinta vetämällä tai Shift+nuoli, ⌘C/⌘V (myös Sheetsistä ja Excelistä liitetty sarkaineroteltu teksti), ⌘Z/⇧⌘Z kumoa ja tee uudelleen. **Kaavarivi** taulukon yläpuolella näyttää valitun solun osoitteen ja kaavan, ja sitä voi muokata. Puhelimella: napautus valitsee, toinen napautus muokkaa.
3. **Sarakkeiden leveys raahattavaksi** otsikon oikeasta reunasta (sekä Taulukot että Muistion rivinäkymä); kaksoisnapsautus sovittaa sisältöön. Tallennus: taulukossa alkutietoihin `leveydet: 140, 80, 80, 100`, rivinäkymässä näkymätiedoston sarakeriville `| w=120`. Sama toteutus molempiin (yksi koodi).
4. ~~**Sarakkeiden järjestys raahaamalla otsikosta**~~ tehty rivinäkymässä 0.31 ja Taulukoissa 0.43. (Taulukot: siirtää sarakkeen ja päivittää viittaukset kuten Sheets; rivinäkymä: näkymätiedoston `sarakkeet:` järjestys). Rivien ja sarakkeiden lisäys, poisto ja siirto otsikon ⋯-valikosta (Taulukot).
5. ~~**Pystyviivat**~~ tehty 0.31. **Pystyviivat** rivinäkymän sarakkeiden väliin (hienovarainen 1 px `--sep`, ei otsikkosarakkeen jäätymistä rikkoen) ja kompaktimpi rivi koneella (36 px).
6. ~~**Monivalinta näkyväksi**~~ tehty 0.31. Tietokoneen ylärivi ja Lisää tunniste tehty 0.44. **Monivalinta näkyväksi:** tietokoneella valintaruutusarake rivin vasemmassa reunassa (näkyy osoitettaessa ja aina, kun jotain on valittu), Shift-napsautus valitsee välin, ⌘-napsautus lisää; valittujen toimintorivi (Arkistoi, Poista, Lisää tunniste) yläreunaan. Puhelimella nykyinen Valitse.
7. ~~Näkymämuokkain~~ tehty 0.33 (myöhemmin: sarakkeiden leveydet näkymätiedostoon, näkymän arkistointi apista). **Omat suodatusnäkymät apissa (näkymämuokkain v1, aiemmin visio D):** Näkymä-valinnan perään `+ Uusi näkymä` ja `Muokkaa`: pieni ikkuna, jossa nimi, ehdot (kansio, tunniste, kenttä = / > / < arvo; useampi = kaikki), järjestys (kenttä nouseva/laskeva, useampi) ja sarakkeet (valintaruudut, järjestys raahaamalla, näyttötapa). Tallentaa `nakymat/<tunnus>.md`:n samassa muodossa kuin tekoäly; tekoälyn ja apin näkymät ovat samoja tiedostoja.
8. ~~**Muistio koko leveydelle**~~ tehty 0.42. Alkuperäinen palaute: Emil (kysely 22.11.): kapealta näyttää **rivitila koneella** (Emilin omalla näytöllä; testikuvissa Rivit täytti 1440 ja 1920 px, joten tarkista Emilin näyttö, esim. erittäin leveä tai selaimen zoom, ja sarakkeiden leveysjako: nyt otsikko vie suurimman osan ja muut sarakkeet ovat kapeita). Poista jäljellä olevat leveysrajat Muistion yläpalkeista ja korttiruudukosta (kortit useampaan sarakkeeseen leveällä näytöllä).
9. ~~Yläpalkki~~ tehty 0.32. **Emil hyväksyi (kysely 22.11.):** yläpalkin 8 kuvaketta → näkyviin vain usein käytetyt (päivitys, pikakirjaus, haku), loput yhden Valikko-napin taakse myös tietokoneella (appilinja: yksi paikka, harvinaiset Valikkoon).
Myöhemmin samaan jatkoon (v2.1): solujen muotoilu (lihavointi, tasaus, lukumuoto €, %, desimaalit, taustaväri; tallennus alkutietoihin), soluviittaus napsauttamalla kaavaa kirjoittaessa, täyttö vetämällä (kaavan kopiointi alas), jäädytettävät rivit ja sarakkeet, suodatin ja lajittelu taulukon otsikosta.

**A. Valmis v1:ksi ilman lisäkysymyksiä** (tässä järjestyksessä; merkitse tehty ~~yliviivaten~~):
1. ~~Kohta 8: kirjoitusohje apissa (perusosa).~~ Tehty 0.14.
2. ~~Kohta 7: Flow tekstinä, kokeiluna.~~ Tehty 0.15. Pysyvä muoto odottaa kokeilupalautetta.
3. ~~Kohta 6.2: mittarien tekstikirjaus ja pikakomentolinkki.~~ Tehty 0.16.
4. ~~Kohta 9: `#tunnisteet` (teksti, `tagit`, lukunäkymä, Asiasanat-suodatin ja rivinäkymä).~~ Tehty 0.17.
5. ~~Kohta 15: pikakirjaus v1 (Vaultin esiasetukset, seuranta, muistutukset, päivän kirjaukset, omat napit ja automaattiset tunnisteet).~~ Tehty 0.18–0.19.
6. ~~Kohta 15: yhteinen XY-pädi lukuarvoille.~~ Tehty 0.20. Suhteellinen tila odottaa kokeilupalautetta.
7. ~~Kohta 9: rivinäkymä leveäksi tietokoneella.~~ Tehty 0.21.
8. ~~Kohta 9: monen valinta, arkistointi ja siirto roskakoriin vahvistuksella.~~ Tehty 0.22.
9. ~~Kohta 9: oma järjestys ja kahva (tallennus `nakymat/kaikki.md`).~~ Tehty 0.23.
10. ~~Kohta 10: kentät ja kaavamoottori (perusfunktiot, muistiinpanohaku, virheet).~~ Tehty 0.24. Tiedostojen uudelleennimeämiseen liittyvä viitepäivitys lisätään samaan työvaiheeseen varsinaisen uudelleennimeämistoiminnon kanssa.
11. ~~Kohta 11: kaavat muistiinpanoissa ja rivinäkymän kaavasarakkeet.~~ Tehty 0.25.
12. ~~Kohta 12: laskentataulukko v1, tiedostopohjaiset välilehdet, solut ja viittaukset.~~ Tehty 0.26. Näkymävälilehti (muistiinpanot riveinä) v2:ssa.
13. ~~Kohta 13: ruudukon korttien v1, viisi näyttötapaa, arvot soluista ja lukitus.~~ Tehty 0.27. Vapaa sijoittelu ja solukohtaiset lukot myöhemmin kokeilun jälkeen.
14. ~~Kohta 9: Asiat → Tunnisteet -siirtymä.~~ Tehty 0.28. Emil valitsee Asiat ja appi lisää tunnisteet osuviin muistiinpanoihin.
15. ~~Kohta 14: karsintakysely Emilille.~~ Tehty 22.11. (vastaukset kohdassa 14).

**B. Pieniä jatkoja, voi tehdä välissä:** ~~rivinäkymän minigraafi ja otsikon napautuksella vaihtuva sarakejärjestys (0.29)~~, ~~muistiinpanoikkunan tarkenteet (Liitä asiasanaan, päällekkäisyys, kiinnitys) sirun ikkunaan (0.48)~~.

**A2. ~~Treeni-osio v1~~ (ks. kohta 16):** kirjaus, painoehdotus sekä liike- ja lihasryhmätaulukot 0.45. Seuranta ja kuvaajat 0.46. Pikakirjaus, tekstisyöte ja kalenterikooste 0.47. Kokeilupalautteen jälkeen laajempi Treeni ja monirivisen datan yhteinen Kojelauta. Sitten karsinta kohdan 14 vastausten mukaan.

**A1b. ~~Kalenterin merkintöjen siistiminen~~ tehty 0.36.** (Emil 22.11.2026 illalla, kuva puhelimelta):
- **Aikajana (päivä):** kuittausruutu (`.evck`) ja keston raahauskahva (`.grip`) ovat päällekkäin oikeassa alakulmassa. Ruutu oikeaan yläkulmaan pieneksi (n. 18 px) ja kahva pois kulmasta: koko alareunan levyinen näkymätön kaistale (n. 8 px), jossa keskellä pieni viiva; ei osu ruutuun lyhyessäkään merkinnässä.
- **Aikajanan kellonaika:** nyt toisella rivillä ja lyhyissä merkinnöissä puoliksi piilossa alareunassa. Aikajana näyttää ajan jo vasemmalla, joten merkinnässä kellonaika vain **otsikon perässä samalla rivillä** pienellä ja himmeällä (kuten ”Kaupasta 16.15”), ja jos ei mahdu, se jätetään pois. Ei koskaan otsikon alle.
- **Viikkolista (Vk):** kuittausmerkki on liian iso ja vasemmalla. Sama pieni neliönmuotoinen ruutu kuin aikajanalla, **rivin oikeaan reunaan**. Kuitattuna sama vihreä väkänen.
- Yhtenäinen ilme: sama kuittausruutu kaikissa kalenterinäkymissä (aikajana, viikkolista, koko päivän sirut), teeman kuittausmuodon (`--r-chk`) mukaan.
- Testi: ruutu ja kahva eivät leikkaa (getBoundingClientRect) 15, 30, 45 ja 120 min merkinnöissä; kellonaika ei leikkaa merkinnän alareunaa; viikkolistan ruutu on oikeassa reunassa ja enintään 22 px.

**0.54 (Emil 23.11.2026, jatkopalaute kuvalla):** Koko päivän merkinnän otsikko ja kuittaus ovat saman kortin sisällä. Eripituiset aikajanamerkinnät, viikkolista ja koko päivän kortit käyttävät samankokoista kuittausruutua. Puhelimella nuolet ovat päivärivin reunoilla ja kuukauden nimestä sen yllä aukeaa kuukausivalitsin. Viikkoa vaihtamalla valitaan maanantai tai viikon ensimmäinen näkyvä päivä. Testi `selain_54.py`.

**A1. ~~Kohta 17~~ tehty: 17.1, 17.3–17.5 0.34:ssä, 17.2 0.35:ssä. Seuraavaksi A1b (kalenterin merkinnät).** Alkuperäinen: (kuittausrivi, Toistuvat ja Listat vaultiin, seuranta kuitattuna, metatieto erilleen). Syy: Emil kuittasi saman merkinnän kahdesti, koska kuittaus ei synkannut.

**C. Kokeilu (tulos ja avoimet päätökset Emilille ennen pysyvää muotoa):** kohta 7 Flow tekstinä.

**A3. Uudet v1:t (Emil 22.11. illalla):** kohta 18 (toistuvuus kenttänä, Toistuvat-lista) ja ~~kohta 19 (paikallinen graafi)~~ tehty 0.50. Kohta 20 (kanvaasi) hyllyllä Emilin päätöksellä. **Emil 22.11. illalla: etusijalla kalenterin siistiminen (A1b) ja taulukot: laskentataulukon, tietokantamaisen näkymän ja kojelaudan yhteensovitus; taulukoiden on toimittava sulavasti ja vakaasti, ettei raskaus estä käyttöä.**
- ~~**A3.0 Taulukot nopeiksi**~~ tehty 0.37 (paikallaan päivitys, välimuisti, yli 200 rivin virtualisointi; mittaukset TILAssa).
- ~~**A3.1 Välilehti näkymänä muistiinpanoista**~~ tehty 0.38 (muistiinpanon avaus Enterillä; sarakkeiden muokkain apissa vielä puuttuu) (kohta 12, sama muoto kuin `nakymat/`): rivit muistiinpanoista vain luku -soluina, omat kaavasarakkeet viereen, kaavat viittaavat niihin kuten tavallisiin soluihin. Muistiinpanon solusta pääsee avaamaan muistiinpanon.
- ~~**A3.2 Kojelaudan kortti taulukon solusta tai alueesta**~~ tehty 0.39 (kohta 13 v1-osa: luku, palkki, minigraafi; ei vielä vapaata sijoittelua).
- ~~**A3.3 A0.4:n taulukko-osa:**~~ tehty 0.40 rivien ja sarakkeiden lisäys, poisto ja siirto otsikon valikosta, kaavaviittaukset päivittyvät. Versio 0.41 tallentaa rakenteen, välilehtien kaavaviittaukset ja korttien osoitteet yhtenä muutoksena.

**D. Alkuperäiset visiot.** Työnkulut, kokeilurajat ja jäljellä olevat päätökset ovat nyt [tulevien ominaisuuksien toteutusjonossa](#tulevien-ominaisuuksien-toteutusjono). Alkuperäinen rajaus (ei rakenneta ennen Emilin tarkennusta): pikakirjausten laajempi editori tietokoneelle; toteutumien tunnistus, tilastointi ja korrelaatiot (kohta 15); kojelauta-rakentajan vapaa sijoittelu, raahattavat koot ja tyylit; kuvaajien ulkoasuasetukset; Listojen suhde vaultiin; kuvat ja liitteet; Notion-sisällön siirto.

## ~~1. Muistiinpanoikkuna: teksti pääosaan~~ (tehty 0.9 ja viimeistely 0.48)

**Ongelma (Emil, kuva koneelta):** tekstikentän reunat näkyvät vain aktiivisena, kenttä on pieni, ja metatieto (luotu/muokattu, ”napauta tekstiä muokataksesi”, päivä- ja aikarivi, Ajankohdat) vie suurimman osan tilasta hajallaan.

**Tavoite (Emil):** selkeä, aina näkyvä ja mahdollisimman suuri tekstikenttä; metatieto pienenä yhteen paikkaan; ajankohta näkyy aina selvästi; muut tiedot napin tai laajennuksen takana. Tietokoneella ikkuna isompi.

**Toteutus (*ehdotus*, Emil ei vielä hyväksynyt yksityiskohtia):**
- Ikkuna `#nsheet`. Tekstikenttä `.hlwrap` (`#ns-hl` korostuskerros + `#ns-text`): aina näkyvä reuna (1 px `--sep`, aktiivisena korostusväri), täyttää vapaan korkeuden (flex-sarake; `noteGrow` kasvattaa nyt sisällön mukaan, säilytä vierityksen sulavuus 0.4:stä). Tietokoneella ikkuna n. 860 px leveä ja lähes ruudun korkuinen.
- Yksi pieni tietorivi tekstin yläpuolelle (`.nsmeta`, 13 px, yksi rivi, ei rivity): ajankohtasiru (seuraava ajankohta kuten kortin `.nd`, kuitattuna vihreä väkänen, useampi ”+N”) ja tarvittaessa ”Tiedot”-siru (asiasanat, linkit, päällekkäisyydet).
- Ajankohtasirun napautus: pieni ikkuna (ikkunan sisällä kuten `#ns-menu`) jossa nykyinen päivärivi `#ns-dtrow` (päivä, Päivät, kellonaika) ja Ajankohdat-luettelo (`foundInfo` → `#ns-found`). Ilman ajankohtaa siru on ”+ Päivä” (sama kuin ⋯ → Päivä ja aika).
- `#ns-stamp` (luotu/muokattu) pois näkymästä ⋯-valikon (`nsMenu`) yläriville pienellä harmaalla; vihje ”napauta tekstiä muokataksesi” pois.
- `#ns-ov`, `#ns-poprow`, `#ns-linkrow`, `#ns-linkbox` ”Tiedot”-sirun ikkunaan tai ⋯-valikkoon, ei tekstin alle.
- Lukunäkymä (`#nsheet.reading`) ja kirjoitus toimivat kuten ennen; tekstin fonttikoko `--tz` (vähintään 16 px).
**Testi:** tekstikentän korkeus ≥ 60 % ikkunan korkeudesta 390 px:llä; reuna näkyy myös ilman fokusta; ajankohtasiru näkyy kun päivä on, ja avaa ikkunan; luotu-tieto löytyy ⋯-valikosta; ei sivuttaisvieritystä; vanhat testit (`selain_06.py` käyttää `#ns-dtrow`, `#ns-more`, `#ns-found .dckv`) päivitetään vastaamaan.

## ~~2. Muistiinpanot riveinä ja sarakkeina~~ (tehty 0.10; myöhemmin: minigraafi-laji, sarakkeen järjestys otsikkoa napauttamalla, apin oma näkymämuokkain)

**Tavoite (Emil):** tietokoneella muistiinpanot allekkain riveinä kuin Notionin tietokannassa ilman sen kömpelyyksiä; otsikko vasemmalla; muutama sarake, jotka täyttyvät muistiinpanon sisällöstä, kun se on oikeassa muodossa; sarakkeella voi olla muu näyttötapa kuin teksti (minigraafi, palkki ym.); määritellyt näkymät.

**Emilin vastaukset (kysely 22.11.2026):**
- Kentät: lyhyet suomenkieliset nimet (`tila`, `arvio`, `edistys`, `hinta`, `prioriteetti`); sopimus on jo vaultin `ohjeet/muistiinpanot.md`:ssä (kohta *Omat kentät*). Uusi kenttä vain Emilin luvalla.
- Ensimmäinen näkymä: **Kaikki muistiinpanot** (otsikko, kansio, kuka kirjoitti, luotu, seuraava ajankohta), toimii ilman uusia kenttiä.
- Puhelin: **molemmilla, valittavissa** (Kortit / Rivit); puhelimella oletus Kortit, koneella Rivit. Valinta laitekohtainen.
- Näkymät: **ensin tekoäly** kirjoittaa näkymätiedostot (`nakymat/`), apin oma muokkain myöhemmin erillisenä vaiheena.

**Toteutus (*ehdotus*):**
- Sarakkeiden lähde = muistiinpanon alkutiedot (YAML-tyyliset rivit `avain: arvo`, jotka appi jo säilyttää `n.vfm`:ssä; lue `VAULT.fmGet`). Valmiit: otsikko, kansio (polusta), `tyyppi`, `lahde` (raita kuten korteissa), `luotu`, `tagit`, seuraava ajankohta. Omat kentät vapaasti (esim. `tila`, `arvio`, `edistys`).
- Näkymä on vaultin tiedosto `nakymat/<tunnus>.md` (`tyyppi: nakyma`, `nakyy: ei`), esim.:
  ```
  ---
  tyyppi: nakyma
  otsikko: Remontti
  nakyy: ei
  mista: kansio = projektit/remontti
  jarjestys: luotu laskeva
  sarakkeet:
    - tila | siru
    - hinta | luku | €
    - edistys | palkki | 0-100
    - luotu | pvm
  ---
  ```
  Ilman näkymätiedostoa oletusnäkymä: otsikko, kansio, kuka kirjoitti, luotu, ajankohta.
- Näyttötavat (yhteinen kirjasto myöhemmälle taulukolle ja kojelaudalle, funktio esim. `fmtCell(laji, arvo, asetus)`): teksti, siru, pvm, luku (+yksikkö), palkki min–max, väkänen (kyllä/ei), minigraafi (arvo pilkuilla eroteltuna listana tai `data/`-sarake).
- Asettelu appilinjan taulukkomallilla (otsikkosarake ja otsikkorivi jäädytettyinä, sarakkeet vierivät sivuttain, rivi 42 px). Valinta Muistion yläpalkissa: Kortit / Rivit (laitekohtainen, oletus Rivit ≥ 1000 px, puhelimella Kortit). Rivin napautus avaa muistiinpanon. Haku ja suodattimet toimivat kuten korteissa.
- Vaultin `ohjeet/appi.md` ja `ohjeet/muistiinpanot.md`: kenttäsopimus ja `nakymat/`-kansio (Emilin päätös).

### Rivinäkymän valinnaiset lisäsarakkeet (Emilin ehdottama 22.11.2026)

Emil haluaa nähdä, kuinka moni muistiinpano linkittää kuhunkin riviin, ja avata nimet tarvittaessa. Hän haluaa myös muistiinpanon kaikki tunnisteet sekä myöhemmin mahdollisuuden lajitella muistiinpanoja niiden yleisen painoarvon mukaan. Alla ovat ehdotukset seuraavia versioita varten. Sarakkeet valitaan tarpeen mukaan nykyisessä näkymämuokkaimessa. Työjonon etusija säilyy.

1. ~~**Takaisinlinkit**~~ tehty 0.51. Solussa näkyy niiden eri muistiinpanojen määrä, joista on linkki tähän muistiinpanoon. Esimerkiksi `7` avaa pienen päällimmäisen ikkunan, jonka otsikot avaavat kyseiset muistiinpanot. Ikkuna sulkeutuu ulkopuolelta tai Escillä. Yhdestä lähteestä tulevat useat linkit lasketaan yhdeksi ja tyhjässä solussa näkyy ajatusviiva. Määrä kuvaa kaikkia tässä Muistiossa avattavia linkittäviä muistiinpanoja, myös nykyisen taulukkosuodattimen ulkopuolella. Piilotettuja, arkistoituja, ratkaisemattomia ja itseensä osoittavia linkkejä ei lasketa. Ensimmäinen versio käyttää nykyisiä wikilinkkejä, esimerkiksi `[[muistiinpano]]` ja samaa kohteen tunnistusta kuin lukunäkymä. Lähtevät linkit voi tarvittaessa lisätä myöhemmin omaan ryhmäänsä. Rakenna taustalle yhteinen linkkihakemisto, jonka voi käyttää uudelleen paikallisessa graafissa (kohta 19). Päivitä hakemisto muistiinpanon muuttuessa tai synkatessa, jotta rivejä piirtäessä ei tarvitse käydä Vaultia läpi rivi kerrallaan.
2. ~~**Tunnisteet**~~ avattava koko lista tehty 0.51. Rivinäkymä tukee jo `tunnisteet`-saraketta, joka yhdistää tekstin `#tunnisteet` ja alkutietojen `tagit`-listan. Tarkista, että sarake löytyy nimellä *Tunnisteet* näkymämuokkaimesta ja että sama tunniste näkyy vain kerran. Ehdotus pitkille listoille: pidä solu yksirivisenä. Näytä mahtuvat tunnisteet ja `+N`, jonka kautta saa kaikki näkyviin. Tunnisteen napautus voi käyttää nykyistä Muistion tunnisterajausta.
3. **Painoarvo.** Ehdotus on myöhemmin lisättävä valinnainen, numeerinen oma kenttä. Se kuvaa, kuinka hyödyllistä muistiinpano on löytää uudelleen eri tilanteissa. Esimerkiksi huolellinen yhteenveto tai selkeästi sanoitettu, monessa yhteydessä sovellettava ajatus voi saada korkean arvon. Aihekohtainen osuvuus, tehtävän kiireellisyys ja linkkien määrä ovat eri asioita. Nykyinen omien kenttien sarake, numeerinen lajittelu ja suodatus sopivat näyttöön. Kokeiluehdotus on 1–5, jossa 1 palvelee yhtä rajattua tilannetta, 3 on uudelleenkäytettävä kooste ja 5 on poikkeuksellisen käyttökelpoinen tai kestävä kiteytys. Tyhjä tarkoittaa arvioimatonta. Kokeile asteikkoa pienellä esimerkkijoukolla ja sovi Emilin kanssa kentän nimi, kriteerit sekä se, kuka saa kirjata arvoja. Tekoäly voi ehdottaa arvoa perusteluineen. Kentän käyttöönotto ja vanhojen muistiinpanojen arviointi edellyttävät erillistä hyväksyntää (ks. kohdat 2 ja 10 sekä Vaultin Omat kentät).

**Tarkistus ennen julkaisua:** Käytä testivaultia. Testaa takaisinlinkeistä saman lähteen toistuminen, piilotetut muistiinpanot, linkin muuttuminen synkassa ja ikkunan sulkeminen. Kokeile tunnisteita kapealla näytöllä ja varmista, että yhdistetty lista on kokonaan avattavissa. Jos painoarvo otetaan käyttöön, testaa tyhjien arvojen säilyminen ja lajittelu.

## ~~3. Koko vault ZIP-tiedostona~~ (tehty 0.8; Emil 22.11.2026: haluaa napin apissa, myös puhelimella)

**Emil:** koko vaultin sisältö talteen yhdellä napilla sekä puhelimen että tietokoneen muistiin. **Aina sama tiedostonimi**, jotta uusi korvaa vanhan (iPhonen Tiedostot-appi kysyy Korvaa / Säilytä molemmat). Nimeksi *ehdotus* `Kaikki-vault.zip` (ei päivämäärää nimessä; päivä ja tiedostomäärä ZIPin sisälle tiedostoon `VARMUUSKOPIO.txt`). Tietokoneella selaimen lataus voi lisätä nimeen (1); Chromessa/Edgessä voi käyttää tallennusikkunaa (`showSaveFilePicker`), jolla valitaan vanha tiedosto korvattavaksi; Safarissa tavallinen lataus.


- Valikko → Vienti ja tuonti → ”Koko vault (ZIP)”. Sisältö: kaikki `VC.files` (vaultin `.md`, `.csv`, `.json` alle 400 kt) polkuineen + lähtemättömät omat muutokset (`VC.q`) uusimpana versiona. Nimi aina `Kaikki-vault.zip`. Puhelimella jakovalikko kuten muussa viennissä (`shareFile`) → Tallenna Tiedostoihin.
- Oma ZIP-kirjoittaja ilman kirjastoja: tallennustapa *stored* (ei pakkausta), CRC-32, UTF-8-nimet (lippu 0x0800), paikalliset otsakkeet + keskushakemisto. N. 60 riviä.
- Ilmoita, jos haku on kesken tai vault ei ole käytössä. Kerro ikkunassa, ettei mukana ole kuvia tai yli 400 kt:n tiedostoja.
**0.53:** ZIP-vienti varmuuskopioi myös paikallisen, vielä jonottamattoman muistiinpanon ja sen sisällön. Vienti ei itsessään synkronoi Vaultia. Käynnissä olevan synkronoinnin jälkeen vientiä voi yrittää uudelleen.
**Testi:** ZIP avautuu Pythonin `zipfile`-moduulilla, tiedostot ja sisällöt täsmäävät testirepoon, ääkköset nimissä ja sisällössä oikein.

## ~~4. Huoltopyynnöt tekoälylle ja Tekoälylle-paikka~~ (tehty 0.11)

**Tavoite (Emil):** ei säännöllistä laajaa huoltoa (käyttörajat); Emil pyytää napista; tekoälyn omat tiedostot taka-alalle, mutta Emilin muokattaviksi apissa.
**Emil hyväksyi 22.11.2026** ja vaultin ohjeet on jo päivitetty: (a) huolto vain pyynnöstä, (b) Emilin tekstin saa pyynnöstä jäsentää, alkuperäinen ensin `arkisto/`:on; `Lähde:`-rivi = liitetty teksti, `Tekoälylle:`-rivi = toive. Tiedosto `yllapito/pyynnot.md` sisältää osiot *Avoimet* ja *Tehdyt*.
- Vaultin tiedosto `yllapito/pyynnot.md` (`tyyppi: loki`, `nakyy: ei`), rivit `- [ ] VVVV-KK-PP · mitä · kohde` (kohde = `inbox`, `koko vault` tai `[[tiedosto]]`). Tehty: `- [x] … → tulos (kuka, pvm)`.
- Apissa: Valikko → ”Pyydä tekoälyä järjestämään” (kohde inbox / koko vault) ja muistiinpanon ⋯ → ”Pyydä tekoälyä järjestämään” (kohde tämä muistiinpano). Napautus lisää rivin; vahvistus pienenä ilmoituksena.
- Valikko → ”Tekoälylle”: lista tiedostoista, joiden laji on tekoälylle (`VAULT.kindOf` = `ohje`: `ohjeet/`, `nakyy: ei`, `tyyppi: ohje`) + `yllapito/loki.md` ja `yllapito/pyynnot.md`; avautuvat tavalliseen muistiinpanoikkunaan muokattaviksi. Henkilö-napin Tekoälylle-valinnat voidaan sen jälkeen poistaa (yksi paikka).
- Vaultin ohjeet päivitetty (`AGENTS.md`, `ohjeet/yllapito.md`, `ohjeet/sanelu.md`, `ohjeet/paatokset.md`). Toteutuksessa lisää `ohjeet/appi.md`:hen, että appi kirjoittaa `yllapito/pyynnot.md`:n *Avoimet*-otsikon alle.

## ~~5. Osiot näkyviin laitekohtaisesti~~ (tehty 0.12)

Lisää asetuksiin laitekohtainen valinta siitä, mitkä osiot näkyvät navigaatiossa. Käytä nykyistä näkyvyyttä oletuksena, jotta päivitys ei piilota käytössä olevia osioita. Piilottaminen koskee navigaatiota ja on peruttavissa samasta asetuksesta. Säilytä pääsy asetuksiin ja käsittele tilanne, jossa avoin osio piilotetaan.

## 6. Päivän mittarien kirjaus

### ~~6.1 Kojelaudan kirjauslomake~~ (tehty 0.13)

Rakenna kirjauskentät ja säätimet olemassa olevan `data/mittarit.json`-määrittelyn perusteella ja noudata vaultin `ohjeet/data.md`-ohjetta. Kirjaa vain valitut arvot ja yhdistä ne saman päivän riviin. Tarkista testivaultilla, että rinnakkainen toisen sarakkeen muutos ja aiemmat päivät säilyvät.

Tallennus lukee CSV-tiedoston tuoreen version ja muuttaa vain lomakkeessa muuttuneita kenttiä. Saman kentän rinnakkaismuutoksessa appi pyytää tarkistamaan ajantasaisen arvon. Ensiversio käyttää olemassa olevia päiväavaimisia CSV-taulukoita ja tarvitsee yhteyden tallentaessa.

### ~~6.2 Mittarien tekstikirjaus ja pikakomento~~ (tehty 0.16)

**0.16:** Kirjaa tekstinä täyttää nykyisen lomakkeen ja iOS-linkki avaa sen tarkistettavaksi. Käytä pikakomennossa ensisijaisesti `#kirjaa=`-fragmenttia. Myös `?kirjaa=` toimii. Muistiinpanon tallennuksessa yksittäinen uusi `Mittarit:`-rivi kirjataan automaattisesti, jos taulukko ja yhteys ovat valmiina. Tuodut tai odottamaan jääneet rivit voi kirjata muistiinpanon ⋯-valikosta, jolloin katselu ei aiheuta kirjoituksia. Kuitattu rivi päättyy merkkiin ✓. Ensiversiossa yksi taulukko kerrallaan.

**Emilin toive (22.11.2026):** ihmiselle helppo kirjoitusmuoto, jolla mittarit voi kirjoittaa itse puhelimella, aamuraporttina tai iOS:n pikakomennolla, suoraan appiin tai tekoälylle, ja ne menevät oikein kojelautaan. Ohje Emilille apissa, ei vain tekoälylle.
*Ehdotus (tekoäly, Emil ei vielä hyväksynyt):* **yksi muoto kaikille kolmelle reitille**:
- Muoto: `Mittarit: paino 112,4; energia 3; uni hyvä; treeni kyllä` (nimet `mittarit.json`:n `nimi` tai `id`, isot ja pienet kirjaimet samantekeviä; valinta nimellä tai numerolla; kyllä/ei; desimaalipilkku tai -piste). Päivä oletuksena tänään; alkuun voi kirjoittaa `eilen` tai `21.11.`.
- Reitti 1, kirjaus apissa: Kojelauta → Kirjaa mittarit (nykyisen mittarimäärittelyn kentät, tehty 0.13).
- Reitti 2, muistiinpanossa: rivi, joka alkaa `Mittarit:` → appi vie arvot `data/<taulukko>.csv`:hen saman päivän riville ja merkitsee rivin käsitellyksi (esim. ✓ rivin perään), ettei sitä viedä kahdesti. Toimii myös tekoälyn kirjoittamassa muistiinpanossa.
- Reitti 3, pikakomento: osoite `…/kaikki/?kirjaa=paino 112,4; energia 3` avaa appin ja kirjaa vahvistuksen jälkeen (iOS Pikakomennot: Kysy syötettä → Avaa URL).
- Ohje Emilille: Kojelaudan i-napissa ja Kirjaa-ikkunassa esimerkkirivi, joka muodostetaan `mittarit.json`:sta (pysyy aina ajan tasalla, kun mittareita lisätään). Sama muoto vaultin `ohjeet/data.md`:hen tekoälyille.
- Tuntematon nimi tai arvo: ei kirjata, vaan ilmoitus (”paino?? ei tunnistettu”). Ei arvata.

## 7. Rajatut kokeilut

**0.15:** Flow → Kokeile tekstipuuta näyttää sisennetyn luettelon haaroina ja koko puuna. Luettelossa yksi aloituskysymys, kaksi välilyöntiä tasoa kohti ja vastaukselle enintään yksi jatkokysymys tai lopputulos. Kokeilu toimii esimerkillä tai liitetyllä testitekstillä ja pysyy muistissa vain ikkunan käyttöajan. Sovitaan kokeilun jälkeen, tarvitaanko viittauksia haarojen välillä, ehtoja ja pysyvää Vault-muotoa.

Kokeile testiaineistolla ensin Flow'n lukemista sisennetystä Markdownista. Jatka pieneen Markdown-laskentataulukkoon ja yhteiseen laskentaan muistiinpanojen välillä. Kirjaa kokeilun tulokset ja avoimet päätökset. Uusi pysyvä tiedostomuoto, tiedonsiirto, merkittävä arkkitehtuuriratkaisu ja olemassa olevan osion karsiminen edellyttävät Emilin päätöstä. Toteuta kokeilu omassa haarassaan, jos julkaisu päähaaraan vakiinnuttaisi avoimen ratkaisun.

## 8. Kirjoitusohje apissa (Emil 22.11.2026; tee kohdan 6 yhteydessä tai heti sen jälkeen)

**0.14:** perusosa valmis. Opas löytyy puhelimessa Valikosta ja tietokoneella yläpalkista. Mittariesimerkki käyttää olemassa olevan lomakkeen määrittelyjä. Päivitä mittaritekstin ja pikakomennon esimerkit kohdan 6.2 toteutuksen yhteydessä.

**Emil:** apissa lyhyt, helposti löytyvä ohje ihmiselle siitä, missä muodossa tekstiä kannattaa itse kirjoittaa tai liittää, jotta appi ymmärtää sen (esim. pikakomento, joka hakee unitiedon ja kirjoittaa sen oikeaan muotoon liitettäväksi). Ohje pitää voida avata ja kopioida helposti.
*Ehdotus (tekoäly):*
- Paikka: Valikko → **Kirjoitusohje** (tietokoneella sama kuin muut Valikon kohdat). Pieni ikkuna, lyhyet kappaleet, jokaisen esimerkin vieressä **Kopioi**-nappi (leikepöydälle, `navigator.clipboard.writeText`, varalla valittava teksti).
- Sisältö, aina ajan tasalla koodista ja vaultista (ei kovakoodattuja mittareita):
  - **Mittarit:** esimerkkirivi kohdan 6 muodossa, muodostettu `data/mittarit.json`:sta (nimet, asteikot, valinnat, yksiköt).
  - **Kalenteri:** päivä ja aika tekstissä, esim. `to 26.11. klo 16–17`, `huomenna klo 9`, `joka maanantai`.
  - **Muistiinpanon kentät** rivinäkymää varten: `tila: kesken`, `arvio: 7`, `edistys: 40`, `hinta: 120` (vaultin *Omat kentät* -lista).
  - **Liitetty teksti:** `Lähde: …` alkuun, `Tekoälylle: …` toiveeksi.
  - **Linkki toiseen muistiinpanoon:** `[[tiedostonimi]]`.
- Sama ohje myös vaultiin tiedostoksi (esim. `ohjeet/kirjoitusohje.md`, `nakyy: ei`), jotta tekoäly ja pikakomennot voivat käyttää samaa muotoa; appi näyttää apin oman version.

## 9. Tunnisteet ja Muistion listan jatko (Emil 22.11.2026)

**Nykytila 0.17:** Muistio tunnistaa `#tunnisteet` tekstistä ja `tagit`-kentästä sekä tarjoaa tunnisterajauksen ja rivisarakkeen. Juuren Asiat ovat yhä käytössä siirtymää varten.

**Emil toivoo:**
1. Käsin tägitys: `#tunniste` tekstissä, ja tekoäly ymmärtää sen.
2. Valmiit suodatus- ja järjestysnäkymät Notionin tapaan (tunnisteiden mukaan suodatus ja järjestys), myöhemmin muokattavat apissa.
3. Sarakkeiden järjestyksen muokkaus (myöhemmin).
4. Monen valinta kerralla ja poisto (ja arkistointi) valituille.
5. Käsin raahattava järjestys, kun suodatusta tai järjestystä ei ole: pieni kahva vasemmassa reunassa, varsinkin tietokoneella.
6. Rivinäkymä leveämmäksi tietokoneella; muuta hienosäätöä myöhemmin.

**Emil hyväksyi ehdotukset 22.11.2026** (vaultin sääntö `#tunnisteista` tehty: `ohjeet/muistiinpanot.md`, kohta Tagit). Oma järjestys tallennetaan näkymätiedostoon.
**Päätös (Emil 22.11.2026): Tunniste = asiasana, yksi käsite.** Erillistä asiasanaa ei ole; tunnistetta käytetään sekä asiana että muistiinpanoja ryhmittävänä tunnisteena. Rakenteessa on vain kolme asiaa: **kansio** (aihe, yksi), **tunniste** (poikittainen teema, monta) ja **kenttä** (arvo, esim. `tila: kesken`). ”Erityinen tunniste” (henkilö, paikka) on kenttä, ei uusi laji.
- Asiat-osio → **Tunnisteet**-osio: luettelo, uudelleennimeäminen, yhdistäminen. Tunnisteet ovat tekstissä ja `tagit`-kentässä, eivät vain laitteella.
- Asioiden automaattinen tunnistus säilyy tunnisteen **valinnaisena ominaisuutena** (tunnistussanat vaultin tiedostossa, esim. `#koira` ← koira, koiran, rekku); käsin kirjoitettu ja tunnistettu näkyvät eri tyylillä.
- Asioiden lisäosat (ehdot ja päättely, tärkeysjärjestys, uusiutumisväli, listojen poiminta, Flow-linkit): karsintaan, ellei Emil käytä niitä; tarvittaessa ne tuodaan takaisin tunnisteen ominaisuuksina, ei omana käsitteenä.
- **Suunta:** tulevat toiminnot rakentuvat tunnisteiden päälle eivätkä tee omia ryhmittelyjään: Flow'n ehdot, listojen poiminta, rivinäkymän suodatus, laskenta muistiinpanojen välillä (E), taulukot (C) ja kojelauta (D) käyttävät samoja tunnisteita ja kenttiä. Kun nämä toteutetaan, Juuren vastaavat Asioihin sidotut toiminnot sulautetaan niihin.
- Siirtymä: nykyisten Asioiden nimet tarjotaan tunnisteiksi (Emil valitsee), ennen kuin Asiat-osio poistetaan. Ei hukata Emilin tietoa.

*Hyväksytty toteutus:*
- `#tunniste` (kirjaimet, numerot, väliviiva, ääkköset; ei pelkkä numero, jotta `#3` ei tule tunnisteeksi) ja alkutietojen `tagit: [a, b]` ovat **sama joukko**. Ne näkyvät Asiat-suodattimessa omana ryhmänään (*Tunnisteet*), jotta suodatuspaikkoja on yksi eikä kaksi (appilinja: yksi asia, yksi paikka). Lukunäkymässä `#tunniste` siruna, napautus suodattaa. Rivinäkymän erikoiskenttä `tunnisteet` (sirut).
- Vaultin sääntö: tekoäly ei poista Emilin `#tunnisteita`; käsitellessään se voi lisätä ne myös `tagit`-kenttään yhdenmukaisesti. Vaatii päätöksen `ohjeet/muistiinpanot.md`:hen (kohta Tagit).
- Näkymätiedoston `mista` saa ehdon `tunniste = x` (useampi = kaikki); `jarjestys` useampi avain pilkulla. Apin näkymämuokkain (suodatus, järjestys, sarakkeet raahaamalla) myöhemmin erillisenä vaiheena.
- Valintatila: rivin kahvan vieressä (tai pitkällä painalluksella puhelimella) valintaruudut, alapalkkiin ”Valittu N · Arkistoi · Poista” (poisto vahvistuksen takana, roskakoriin kuten ennen).
- Oma järjestys: Muistion järjestysvalintaan *Oma järjestys*; kahva (appilinjan `bindVt`-malli Mätsikistä) näkyy vain silloin. Järjestys tallennetaan näkymätiedostoon (`nakymat/kaikki.md`, lista tiedostonimiä), jotta se synkkaa laitteiden välillä ja tekoäly näkee sen. Vaatii päätöksen.
- Tietokoneella Muistion leveysraja (nyt n. 1100 px) pois rivinäkymästä.

## 10. Kentät ja kaavamoottori (pohja kohdille 11–14)

**Emil 22.11.2026:** muistiinpanojen tiedot pitää voida laskea yhteen tunnisteiden ja ehtojen mukaan, viitata muistiinpanoihin ja välilehtiin, Google Sheetsin yksinkertaisuudella, ei täyttä Exceliä. Suunta hyväksytty. v1 tehdään tässä kuvatulla syntaksilla (Työjono, periaate); Emil arvioi sen kokeillessa.
- **Kentän arvo muistiinpanossa** kahdella tavalla: alkutiedoissa `saldo: 120` tai tekstissä omalla rivillään `saldo: 120`. Tekstirivi luetaan **vain, jos nimi on vaultin `ohjeet/muistiinpanot.md` → Omat kentät -listassa** (tavallinen lause ei sotke laskuja). Luvussa desimaalipilkku tai -piste. Sama nimi useasti samassa muistiinpanossa = kaikki arvot (summa- ja määräfunktiot laskevat ne).
- **Kaavamoottori** moottoriosioon (`<script id="engine">`, ei DOMia, testattavissa Nodella): lauseke `=…`, luvut, tekstit lainausmerkeissä, `+ - * /`, vertailut, sulut. Funktiot ensin: `SUMMA`, `KESKIARVO`, `MÄÄRÄ`, `MIN`, `MAX`, `JOS`, `PYÖRISTÄ`, `YHDISTÄ` (teksti); myöhemmin tilastot (`KORRELAATIO`, `MEDIAANI`, `KESKIHAJONTA`). Suomenkieliset nimet, puolipiste argumenttien erottimena. Kytköskartan kaavamoottorista (`kytkoskartta/index.html`, `KK`, logiikkapalikka `kaava`) saa lainata jäsennintä.
- **Muistiinpanohaku kaavassa:** `SUMMA(kenttä; ehto; ehto…)`; ehdot `tunniste = x`, `kansio = polku`, `<kenttä> = arvo`, `<kenttä> > luku`, puuttuva ehto = kaikki muistiinpanot. Yksi muistiinpano: `[[tiedostonimi]].kenttä`.
- **Virheet näkyvinä, ei arvauksia:** tuntematon nimi `#NIMI?`, kehäviittaus `#KEHÄ`, puuttuva tiedosto `#PUUTTUU`. Tulokset lasketaan aina tuoreena; **tuloksia ei kirjoiteta tiedostoihin** (ei turhia muutoksia, ei ristiriitoja).
- **Uudelleennimeäminen:** kun appi siirtää tai nimeää tiedoston, se päivittää viittaukset `[[vanha]]` → `[[uusi]]` samassa yhteydessä (yksi commit-jono); tekoälyn ohjeeseen sama sääntö.
- Testit: logiikkatesti Nodella (`kaikki/testit/logiikka_kaava.js`): laskut, ehdot, tunnisteet, kehä, desimaalit, ääkköset.

## 11. Kaavat muistiinpanoissa ja rivinäkymässä

- Muistiinpanon tekstissä `{=KESKIARVO(uni; tunniste = uni)}` → lukunäkymässä tulos (korostettu siru), kirjoittaessa kaava näkyvissä. Kentän arvo voi olla kaava: `jaljella: =[[remontti-budjetti]].budjetti - SUMMA(hinta; tunniste = remontti)` (kokoava muistiinpano).
- Rivinäkymän näkymätiedostoon kaavasarake: `- =SUMMA(hinta; tunniste = remontti) | luku | €` tai rivikohtainen `- =hinta*1.24 | luku | €` (viittaa rivin omiin kenttiin). Näyttötavat kuten muissakin sarakkeissa.
- Vaultin `ohjeet/appi.md`: kaavojen muoto tekoälyille.

## 12. Laskentataulukko ja välilehdet

**Emil 22.11.2026:** oma laskentataulukko, välilehdet, viittaukset välilehtien ja muistiinpanojen välillä; Sheetsin yksinkertaisuus.
- **Tiedosto per välilehti**, taulukko = kansio: `taulukot/<taulukko>/<valilehti>.md` (`tyyppi: taulukko`, `nakyy: ei` ei tarvita, koska taulukko on Emilin). Sisältö tavallinen markdown-taulukko (ihminen ja tekoäly lukevat sellaisenaan); ensimmäinen rivi = sarakkeiden otsikot, sarakkeet A, B, C… ja rivit 1, 2… kuten Sheetsissä; kaavasolu alkaa `=`.
- Viittaukset: oma välilehti `B3`, `B2:B8`; toinen välilehti `[[kulut]]!B3`; muistiinpanot kuten kohdassa 10.
- Apissa uusi osio **Taulukot** (tietokone ensin): ruudukko, solun napautus muokkaa, kaava näkyy muokatessa ja tulos muuten, välilehdet alareunassa. Tallennus kuten muistiinpanoissa (vault-jono, ristiriidassa molemmat versiot säilyvät).
- **Välilehti voi olla näkymä muistiinpanoista:** alkutiedoissa `mista: tunniste = remontti` ja `sarakkeet:` kuten näkymätiedostossa → rivit tulevat muistiinpanoista (vain luku), viereen saa omia kaavasarakkeita. Näkymätiedostot (`nakymat/`) ja tämä ovat sama muoto, jotta käsitteitä ei tule kaksi.
- Vienti: välilehti CSV:nä (muualle, esim. Sheetsiin).

## 13. Taulukosta kojelaudaksi (D)

**Emil 22.11.2026:** taulukko on logiikka; sen päälle käyttäjän pinta: vapaasti sijoiteltavat, raahaamalla koon muuttavat kortit (luku, palkki min–max, liukusäädin, kytkin, nappi, kuvaaja, kuva, teksti), arvot soluista; säädin ja kytkin kirjoittavat syöttösoluun; muokkaustila ja **lukittu käyttötila** (työnhallintana ilman vahinkomuokkauksia), solukohtainen lukitus; ulkoasu säädettävissä (ei tylsintä mahdollista). Numbersin vapaus, Notionin tapa näyttää arvo muutenkin kuin tekstinä.
- Tallennus: sama taulukkokansio, tiedosto `taulukot/<taulukko>/_nakyma.md` (korttien paikat, koot, lajit, solut ja tyylit luettavana tekstinä).
- **Suunnitellaan tarkemmin ennen toteutusta** (ks. Pohdittavat): korttien tyylivalinnat, kosketus vs. hiiri, puhelimen asettelu. Riski: Appi-appin uudelleenrakentaminen Kaikin sisään; käytä samaa ruudukkoa ja näyttötapoja kuin kohdat 2 ja 12.

## 14. Juuren karsinta

**Emil 22.11.2026:** Kaikki eriytyy Juuresta; karsitaan, mitä tämä käyttötapa ei tarvitse; puhelinnäkymä riisutaan (kalenteri, uusi muistiinpano ja kuvaajat keskeisiä).
- Kysy Emililtä lista kerrallaan (kysely), mitä Juuren osia hän käyttää: Listat (kierrokset, tarkistuslistat, Viikot), Flow, Vanhat puut, Toistuvat, pikamuistiinpano, päivän napit, Asioiden lisäosat (ehdot, tärkeysjärjestys, uusiutumisväli). Karsi vain hyväksytyt; laitteella oleva tieto viedään ensin talteen (varmuuskopio) ja tarvittaessa vaultiin.
- Asiat → Tunnisteet kohdan 9 päätöksen mukaan (siirtymä: nykyiset Asiat tarjotaan tunnisteiksi).

**Emilin vastaukset (kysely 22.11.2026):**
- **Pidetään:** Listat (tarkistuslistat, kierrokset, Viikot), Flow, Toistuvat.
- **Karsitaan:** vanha Juuren pikamuistiinpano (uusi pikakirjaus korvaa sen); Vanhat puut (oli jo piilossa vanhoissa näkymissä); Asiat-osio tunnisteiden tieltä (siirtymä tehty 0.28).
- **Asioiden lisäosat tunnisteiden ominaisuuksiksi:** tärkeysjärjestys (ohjaa Muistion Tärkeys-järjestystä) ja uusiutumisväli. **Karsitaan:** ehdot ja päättely.
- Toteutus: ennen poistoa ota käyttöpaikassa sekä Koko appi -vienti (`Kaikki.json`) että Vaultin ZIP. JSON sisältää laitteella olevat puut ja pikamuistiinpanot, ja ZIP sisältää myös Vaultin muut tekstitiedostot. Tarkista tiedostojen aukeaminen ennen poistoa. Poisto omana versionaan, ja siihen liittyvät vanhat Juuren testit päivitetään samalla.

## 15. Pikakirjaus: muistutukset ja seuranta muutamalla napautuksella (Emil 22.11.2026)

**Emil:** varsinkin puhelimella helposta napista pikaikkuna, jossa omat valmiit napit. Kaksi käyttöä: **muistutus** (nappi → kalenterivalitsin, yksi tai monta päivää, ulkopuolinen napautus sulkee ja valinnat jäävät voimaan) ja **seuranta** eli jo tapahtuneen kirjaus (nappi = toteutui tänään, tai arvo pienestä valikosta ilman näppäimistöä). Kaikki tallentuu, kun ikkunasta poistutaan; tallentuu sekä tekoaika että päivä, jota kirjaus koskee. Kirjaus menee oikeassa muodossa kojelautaa, taulukoita ja laskentaa varten ja saa halutut tunnisteet. Seurannat näkyvät kalenterissa valmiiksi kuitattuina omalla tyylillään, eivät sekoitu tekemättömiin. Napit ja esiasetukset itse tehtävissä ja muokattavissa; laajempi editori tietokoneelle. Lisäksi: säännöt, millainen teksti lisää minkä tunnisteen automaattisesti.

**Nykytila (tarkistettu koodista 22.11.):** Juuren pikamuistiinpano on Listat-osiossa (`openPika`, `renderPika`, `pikaPick`): napit tulevat laitteen tarkistuslistan riveistä (`data.chk`), napautus avaa kuukausivalitsimen ja tekee muistutusmuistiinpanon. Napit ovat vain laitteella, eivät vaultissa. **Kalenterin Vk-näkymä on jo päiväkohtainen lista** (päivät allekkain, merkinnät napautettavina, kuittausympyrä 0.6), eli Emilin toivoma ”päivälista ilman kellonaikoja” on olemassa; jatkossa siihen lisätään seurantakirjausten tyyli.

**v1, ei lisäkysymyksiä (Emil hyväksyi v1-muodot kokeiltaviksi):**
- Esiasetukset vaultin tiedostossa `pohjat/pikakirjaus.md` (`pohjat/` on jo piilossa muistiinpanoista; appi näyttää tiedoston Tekoälylle-paikassa muokattavana):
  ```
  ## Seuranta
  - Treeni | kyllä | #treeni
  - Energia | 1-5
  - Paino | luku | kg
  - Mieliala | xy 0-100
  ## Muistutus
  - Kissan matolääke | #kissa
  - Laskut
  ```
  Rivi: `nimi | laji | tunnisteet tai yksikkö`. Lajit: `kyllä` (napautus = toteutui), `1-5` (tai muu väli: numeronapit), `luku` (pieni numeronäppäimistö appissa, ei laitteen näppäimistöä), `valinta: a, b, c`, `xy 0-100` (ks. alla). Muistutuksessa ei lajia.
- **Avaus:** puhelimella alapalkin `+` pitkä painallus tai oma pieni nappi alapalkissa (ei uutta osiota); tietokoneella yläpalkin nappi. Ikkuna: kaksi välilehteä Seuranta | Muistutus (viimeisin muistetaan laitteella), napit ruudukkona Emilin järjestyksessä.
- **Seuranta tallentuu:** jos nimi on `data/mittarit.json`:n mittari → arvo `data/*.csv`:hen kuten 0.13:n kirjaus; muuten rivi päivän muistiinpanoon `paivat/VVVV/VVVV-KK-PP.md` muodossa `- klo 14.32 · treeni: kylla #treeni` (kenttärivi kohdan 10 mukaan; nimi lisätään vaultin Omat kentät -listaan Emilin luvalla, kun nappi tehdään). Päivä oletuksena tänään, ikkunan yläreunan päiväsirusta voi vaihtaa (esim. eilinen).
- **Muistutus tallentuu:** yksi muistiinpano per nappi, kaikki valitut päivät tekstissä (`Kissan matolääke ma 24.11., ma 1.12. #kissa`), jolloin kalenteri näyttää jokaisen päivän omana merkintänään ja kuittaus toimii päivittäin (0.6).
- **Kalenterissa** seurantakirjaukset (päivän muistiinpanon kenttärivit ja mittarit) näkyvät Vk-näkymän päivän alla himmeänä *Kirjattu*-rivinä (esim. `Kirjattu: treeni, energia 3, paino 112,4`), valmiiksi kuitattuina, eivät kuittausympyrällisinä tehtävinä.
- **Napin teko apissa:** ikkunan lopussa `+ Uusi nappi` → kysyy Seuranta vai Muistutus, nimen, lajin ja tunnisteen napautuksin, lisää rivin `pohjat/pikakirjaus.md`:hen.
- **Automaattiset tunnisteet (säännöt):** vaultin `pohjat/tunnisteet.md`, rivit `#koira: koira, koiran, rekku`. Appi lisää osuvat tunnisteet muistiinpanon `tagit`-kenttään (ei Emilin tekstiin) tallennettaessa; näkyvät päätellyn tyylillä. Korvaa Juuren Asioiden sanatunnistuksen (kohta 9).
- Vanha Juuren pikamuistiinpano (Listat) jää, kunnes karsintakysely (kohta 14) päättää.

**v1:n jälkeen, myös tarkka (työjonossa heti pikakirjauksen perään): XY-pädi, sama kaikkialla (Emil 22.11.2026).** Yksi yhteinen lukuvalitsin pikakirjaukseen, seurantaosioihin, mittarien kirjaukseen ja myöhemmin kojelaudan säätimiin.
- **Perusmalli:** pyöristetty neliö; vaakasuunta = alempi numero, pystysuunta = ylempi numero (0–9, alhaalta ylös), eli yksi pädi = kaksi numeroa. Arvo näkyy isona sormen vieressä raahatessa; irrotus → `Peru` (vasemmalla) / `OK` (oikealla), ei sormen kohdalla.
- **Tarkkuus pienellä valitsimella pädin yläpuolella:** `0–10` (yksi vaakanauha, 11 kohtaa), `0–100` (yksi pädi), `0–1000` (pädi + yhden numeron nauha satoja varten). **Desimaalit** omalla valitsimella `,0 / ,1 / ,01`: toinen nauha (1 desimaali) tai toinen pädi (2 desimaalia). Kirjaushetkellä tila saa kulua (Emil).
- **Muistaa valinnan kontekstissa:** tarkkuus ja desimaalit tallentuvat napin esiasetukseen (`pohjat/pikakirjaus.md`, esim. `Paino | xy 0-1000 ,1 | kg`), jolloin ne ovat samat kaikilla laitteilla; valitsimen muutos päivittää rivin.
- *Ehdotus (tekoäly) lisäksi:* **suhteellinen tila** arvoille, jotka ovat yleensä lähellä edellistä (paino): pädin keskikohta = edellinen kirjattu arvo, vaakasuunta ±0,1-askeleet, pystysuunta ±1-askeleet (väli asetettavissa, esim. ±5). Valinta `suhteellinen` esiasetuksessa. Emil arvioi kokeillessa.
- Testi: Playwrightin hiiriraahaus tietokoneella; sormella vain oikealla iPhonella (kerro Emilille).

**Uni, treeni ja ravinto (Emil 22.11.2026: niiden seuranta voi siirtyä tänne ainakin osittain):**
- v1 (ei lisäkysymyksiä): päivän yhteenveto mittareina `data/paiva.csv`:hen pikakirjauksen napeilla, esim. `uni` (tunnit, luku), `unen-laatu` (1-5), `treeni` (kyllä), `treenin-kesto` (min), `ateriat` (luku) tai `ruokailo` (1-5). Uusi mittari vaultin `ohjeet/data.md`:n mukaan Emilin luvalla.
- Applen Terveys: iOS-pikakomento voi lukea unen tai treenin Terveydestä ja avata linkin `…/kaikki/?kirjaa=uni 7,5` (kohta 6.2), jolloin kirjaus tulee ilman näpyttelyä.
- Myöhemmin (visio): tarkemmat taulukot, joissa monta riviä päivässä (treenin sarjat, ateriat), ja kojelauta niille; suhde olemassa olevaan Treenikarttaan (`treenikartta/`) ja master-tiedot-ideoihin (Annoskirja, Ruokakartta, Mittarit) päätetään erikseen, ettei sama seuranta ole kahdessa appissa.

**Visio (ei v1:tä ennen tarkennusta):** tietokoneen laajempi pikakirjausten editori; tunnistus milloin jokin toteutuu tai on tietyn arvoinen ja tilastointi siitä; korrelaatiot napeissa (Päiväkartan ja Projektikartan tapaan värinä ja palkkina).

## 16. Seurantaosiot: Kaikki on kaikkien seurantojen koti (Emil 22.11.2026)

**Päätös (Emil):** treenit, uni, ravinto ja muut seurannat tulevat Kaikki-appiin. Kaikki tieto menee vaultiin, mutta jokaiselle seurannalle voi olla oma, räätälöity osio, joka palvelee järkevää tapaa kirjata ja seurata, varsinkin puhelimella. Osiot ovat vain eri näkymiä samaan vaultin dataan (kuten Muistio, Kalenteri ja Kojelauta), ja ne voi piilottaa laitekohtaisesti (0.12).

**Yhteiset säännöt seurantaosioille:**
- Data vaultin `data/`-kansioon, kuvaus `data/mittarit.json`:iin. Päivän yhteenveto `data/paiva.csv`:hen (yksi rivi päivässä); tarkemmat tiedot omiin taulukoihin, joissa voi olla monta riviä päivässä (esim. `data/treeni.csv`: `pvm, klo, liike, sarja, toistot, paino`). Vaultin `ohjeet/data.md` laajennetaan monirivisiin taulukoihin, kun ensimmäinen tehdään (nyt: ”sama päivä vain kerran”).
- Kirjaus aina myös pikakirjauksella (kohta 15) ja tekstimuodolla (6.2), jotta tekoäly ja pikakomennot voivat kirjata samaan paikkaan.
- Kojelauta osaa koota monirivisen taulukon päiväksi (summa, määrä, suurin) ennen kuvaajaa.
- Osion ulkoasu appilinjan mukaan: puhelin ensin, usein painettavat alhaalla, taulukkomalli (rivit ja sarakkeet) seurannoissa.

**Ensimmäinen seurantaosio: Treeni.** Emilin nykyinen erillinen appi on Treenikartta (`treenikartta/`, tila `treenikartta/TILA.md`). Ennen v1:tä **kysely Emilille**: mitkä Treenikartan toiminnot otetaan mukaan (liikkeet ja lihasryhmät, sarjojen kirjaus, kalenteri, lihasryhmien tiheys, ennätykset …) ja siirretäänkö Treenikartan vanha data vaultiin (Treenikartan vienti → `data/treeni.csv`, kertaluonteinen). Sen jälkeen v1 ilman lisäkysymyksiä. Treenikarttaa ei muuteta eikä poisteta tässä yhteydessä; sen tulevaisuus päätetään, kun Treeni-osio on kokeiltu.
**Emilin vastaukset (kysely 22.11.2026), v1 voidaan nyt rakentaa:** mukaan **sarjojen kirjaus** (liikelista, sarja n/x, toistot ja paino − +, painoehdotus, ”Viimeksi …”), **liikkeet ja lihasryhmät** taulukkoina ja **seuranta ja graafit** (treenipäivät 12 viikolta, viikon sarjat, arvioitu maksimi, tavoitteet palkkeina). Historia ei v1:ssä. **Vanha data siirretään** kertaluonteisesti Treenikartan varmuuskopiosta `data/treeni.csv`:hen (liikkeet ja ryhmät omaan tiedostoonsa, esim. `data/treeni-liikkeet.md` tai `.json`; muoto kirjataan `ohjeet/data.md`:hen). **Treenikartta jää rinnalle**, kunnes Treeni-osio on kokeiltu ja riittää; sitten Emil päättää. Treenikartan logiikkaa (painoehdotus Epley, jaksot, tavoitteet) saa kopioida `treenikartta/index.html`:stä.
**Data siirretty 22.11.2026:** Emilin Treenikartan varmuuskopio on vaultissa: `data/treeni.csv` (sarja per rivi: pvm, klo, treeni, liike, liike_id, sarja, kg, toistot), `data/treeni-liikkeet.json` (liikkeet, ryhmät, treenikerrat, asetukset) ja alkuperäinen `arkisto/treenikartta/`. Muoto vaultin `ohjeet/data.md`:ssä. Treeni-osio lukee ja kirjoittaa näitä.
**Muut seurannat** (uni, ravinto): ensin päivän yhteenvetomittareina pikakirjauksella (kohta 15); oma osio vasta, kun Emil kokee tarvitsevansa sitä.

## 17. Kuittaukset synkkaan ja metatieto pois tekstistä (Emil 22.11.2026)

**Emil:** kuittasi saman kalenterimerkinnän koneella ja puhelimella, koska kuittaus ei näkynyt toisella laitteella. Kuittauksen pitää mennä muistiinpanoon jonain appin ymmärtämänä merkintänä, ja sama koskee seurantakirjauksia (näkyvät kalenterissa valmiiksi kuitattuina). Appin tunnistama metatieto ei saa sekoittua tekstiin: se näytetään erillään (pienenä, piilossa avattavana), vaikka tiedostossa se on tekstinä mukana.
**Selvitetty 22.11. (Claude):** vaultin muistiinpanon kuittaus **tallentuu jo** tiedostoon alkutietojen riville `juuri: {"pts":{"2026-11-22 16:00":…}}` ja lähtee GitHubiin n. sekunnissa (kokeiltu testirepolla). Mutta **Toistuvat, Listat ja tarkistuslistat ovat vain laitteella** (`kaikki:v1`), joten niistä syntyneiden merkintöjen kuittaus ei siirry. Todennäköisin syy Emilin tapaukseen. Toinen mahdollinen syy: toisella laitteella on samasta tiedostosta lähettämätön oma muutos, jolloin haku ei korvaa sitä.
**v1, ei lisäkysymyksiä:**
1. **Luettava kuittausrivi alkutietoihin:** appi kirjoittaa kuittaukset riville `kuitattu: 2026-11-22 16:00, 2026-11-29 16:00` (päivä ja kellonaika, pilkulla erotettuna; ajaton päivä ilman kellonaikaa) ja lukee sekä tämän että vanhan `juuri`-JSONin. Ihminen ja tekoäly näkevät kuittauksen; tekoäly voi myös kuitata kirjoittamalla rivin. Vaultin `ohjeet/appi.md` ja `muistiinpanot.md` päivitetään.
2. **Emilin valinta 22.11. (kysely): sekamalli.** Toistuvat luettaviksi tiedostoiksi `toistuvat/<nimi>.md` (tekoäly voi lukea ja muokata); Listat ensin yhteen rakenteiseen tiedostoon `listat/listat.json` (luettava muoto myöhemmin). Yhdistäminen kolmisuuntaisesti tunnisteen mukaan: pohja = viimeksi synkattu versio (välimuistissa), muutos vain toisella puolella → se voittaa; molemmilla → GitHubin versio voittaa ja oma kopioidaan ristiriitakopioksi; mitään ei poisteta ilman, että poisto näkyy pohjaan verrattuna. Ennen ensimmäistä synkkaa laitteen tiedot varmuuskopioon.
   Alkuperäinen ehdotus: **Toistuvat ja Listat vaultiin** (Emil päätti pitää ne, kohta 14): toistuvat tiedostoiksi `toistuvat/<nimi>.md` (alkutiedoissa sääntö: väli, alku, tunnisteet; kuittaukset kuten kohta 1) ja tarkistuslistat `listat/<nimi>.md` (rivit `- [ ]`/`- [x]`). Laitteelle jäävät vain asetukset. Siirtymä: nykyiset viedään ensin varmuuskopioon ja sitten vaultiin.
3. **Seurantakirjaukset kalenterissa kuitattuina** (pikakirjaus, mittarit, treenit): näkyvät kalenterin päivässä *Kirjattu*-tyylillä, ei kuittausympyrää (kohta 15).
4. **Metatieto erillään tekstistä:** alkutiedot (kuitattu, tagit, omat kentät, juuri) eivät koskaan näy tekstikentässä; muistiinpanoikkunan sirun ikkunaan (0.9) *Tiedot*-osio, jossa ne näkyvät pieninä riveinä (avain · arvo) ja ovat muokattavissa. Appi kirjoittaa oman metatietonsa **vain alkutietoihin**, ei tekstiin. Tekstissä olevat appin tunnistamat rivit (`hinta: 120`, `Mittarit: …`, `#tunniste`, `{=kaava}`) jäävät tekstiin, koska Emil kirjoitti ne itse, mutta ne näytetään erottuvalla tyylillä (himmeä tasalevyinen siru), ja niiden kohdalla on valinta *Siirrä tietoihin*.
5. Synkka varmistetaan testillä, jossa kaksi laitetta jakaa saman testirepon (kuittaus laitteella A → näkyy laitteella B haun jälkeen).

## 18. Toistuvuus mille tahansa muistiinpanolle: toistuvat tehtävät listana (Emil 22.11.2026)

**Kokeiluvaihe tehty 0.52.** [Kokeiluhaara](https://github.com/Kasibanaani/P-iv-kartta/tree/kaikki-toistuvuuskokeilu/kaikki) tarjoaa Muistion listan, kalenterimerkinnän, kuittauksen ja toistuvan pikamuistutuksen testivaultilla. Sovittavia kohtia ovat kenttien pysyvä muoto, kuukausirytmin käsittely, kuittauksen kumoaminen sekä vanhan Toistuvat-aineiston mahdollinen siirto.

**Emil:** toistuvat tehtävät listan kaltaisena listana, jossa OK laukeaa uudelleen kuitattavaksi kohteelle määritetyllä tavalla. Mikä tahansa tiedosto, joka kertoo milloin se laukeaa, voisi olla tällainen kohde. Sykli nollautuu, jos asia tehdään muuna aikana. Pikamuistiinpanosta voi ohjelmoida ensimmäisen laukeamispäivän, josta kuitattaessa sykli alkaa.
**Ehdotus (tekoäly), v1 ilman lisäkysymyksiä (yksi käsite, ei erillistä Toistuvat-rakennetta):**
- Muistiinpanon kenttä `toistuu: 2 viikkoa` (luku + päivä/viikko/kuukausi/vuosi) ja valinnainen `seuraava: VVVV-KK-PP` (ensimmäinen tai seuraava laukeamispäivä). Oletuksena **kuittauksesta**: kuittaus (milloin tahansa, myös etuajassa) asettaa `seuraava` = kuittauspäivä + väli, eli sykli nollautuu; `toistuu: 2 viikkoa tasavälein` pitää kalenterirytmin.
- Kuittaus käyttää kohdan 17 `kuitattu:`-riviä; viimeisin kuittaus ratkaisee.
- **Toistuvat-lista** (Listat-osioon tai Muistion näkymäksi): kaikki muistiinpanot, joilla on `toistuu`; ensin erääntyneet (punainen), sitten tänään, sitten tulevat (himmeä, päivä näkyvissä). OK-ruutu kuittaa. Sama kohde näkyy kalenterissa `seuraava`-päivänä.
- Pikakirjauksen Muistutus-välilehdelle valinta *Toistuu* (väli napautuksin), jolloin valittu päivä on `seuraava`.
- 0.35:n `toistuvat/<nimi>.md` -tiedostot muutetaan tähän muotoon (`toistuu`, `seuraava`, kuittaukset), jolloin vanha Toistuvat-rakenne voidaan karsia. Toistuvan synnyttämiä erillisiä muistiinpanoja ei enää tarvita.
- Testi: kuittaus etuajassa siirtää seuraavan, tasavälein ei siirrä, erääntyneet ensin, kahden laitteen synkka.

## ~~19. Paikallinen graafinäkymä~~ (tehty 0.50) (Emil 22.11.2026: ”graphic mode kuten Obsidianissa, onko raskas?”)

**Arvio:** ei raskas nykyisellä vaultilla (n. 150 muistiinpanoa; tuhansillekin kevyt omalla yksinkertaisella voimasimulaatiolla ja canvas-piirrolla ilman kirjastoja, n. 200 riviä). Koko vaultin graafi on yleensä lähinnä kaunis; **paikallinen graafi** (avoimen muistiinpanon naapurit 1–2 askeleen päähän) on käytännössä hyödyllisempi.
**v1 ilman lisäkysymyksiä:** tietokoneella osio tai Muistion näkymä *Graafi*: pisteet = muistiinpanot, viivat = `[[linkit]]` (ja valinnaisesti yhteiset tunnisteet ohuempina), väri kuka kirjoitti -värien mukaan, koko linkkien määrän mukaan; vieritys ja zoomaus, napautus avaa esikatselun, kaksoisnapautus muistiinpanon. Muistiinpanoikkunaan *Paikallinen graafi* -painike. Suodatus samoilla ehdoilla kuin näkymissä. Simulaatio pysähtyy, kun asettelu on valmis (ei kuluta akkua).

## 20. Kanvaasi: muistiinpanot kartalle ja yhteydet viivoilla (Emil 22.11.2026) — **HYLLYLLÄ (Emil 22.11.: toistaiseksi ei); osittain herätetty 24.11.: kanvas ja ruudut kohdassa 23, muistiinpanokortit sen visiossa**

**Emil:** pohjalle valitaan muistiinpanoja yksi kerrallaan pieniksi esikatseluikkunoiksi (napautus avaa isommin), viiva vedetään toisesta toiseen, ja viivasta syntyy linkki tiedostoihin. Viivalla laji, esim. ”tästä seuraa tämä” nuolena, joka kirjoitetaan kumpaankin tiedostoon. Työnkulkuja, joita tekoälykin voi seurata.
**Ehdotus (tekoäly), visio, vaatii Emilin päätökset ennen v1:tä:**
- Kanvaasi tiedostona avoimessa **JSON Canvas** -muodossa (`kanvaasit/<nimi>.canvas`, sama kuin Obsidianissa: solmut = tiedostot paikkoineen, reunat = viivat lajeineen), jolloin se aukeaa myös muualla.
- Viivan lajit lyhyestä listasta: *seuraa* (nuoli), *edellyttää*, *liittyy*, *ristiriidassa*. Yhteys kirjoitetaan molempien muistiinpanojen **alkutietoihin** (metatieto, ei tekstiin, kohdan 17 periaate), esim. lähteeseen `seuraava: [[b]]` ja kohteeseen `edellinen: [[a]]`; näkyy Tiedot-osiossa ja graafissa. Tekoäly lukee yhteydet alkutiedoista ja kanvaasista.
- Toteutuksessa kannattaa käyttää Kytköskartan ja Appi-appin kanvaasikoodin malleja (solmut, nuolet, zoomaus).
- Liittyy Flow'hun (kohta 7): kanvaasi voisi olla Flow'n graafinen muokkain, jolloin työnkulku on yksi käsite kahdella näkymällä. **Kysymykset Emilille:** kirjoitetaanko yhteydet alkutietoihin vai tekstin loppuun näkyväksi osioksi; mitkä viivalajit; yhdistetäänkö Flow'hun.

## 21. Tietokantanäkymä: sarakkeet kirjoittavat muistiinpanoon, täyttökahva ja laskenta (Emil 23.11.2026)

**Emil 23.11.2026 (sanelu):** Muistion rivinäkymästä tehdään oikea tietokanta. Jokainen rivi on muistiinpano (sivu), koko Vault on päätietokanta ja näkymät ovat sen rajauksia. Näkymään voi tehdä uuden sarakkeen. Soluun kirjoitettu tieto menee muistiinpanoon muodossa `sarakkeen nimi: tieto`, joten se näkyy myös muissa näkymissä ja tekoäly voi lukea sen seurantaan. Arvon voi maalata allekkaisille riveille täyttökahvalla kuten Sheetsissä. Laskenta toimii sekä rivin sisällä että sarakkeessa:
- **Rivin sisällä (vaakasuunta):** sarake laskee saman muistiinpanon kenttiä.
- **Sarakkeessa (pystysuunta):** lasketaan monesta muistiinpanosta, myös usean sarakkeen välillä.

Sarakelajit:
- **Päivä:** napautus avaa pienen kuukausivalitsimen, josta voi valita yhden tai useamman päivän. Ulkopuolinen napautus sulkee valitsimen.
- **Luku**, **kaava**, **valinta**, **monivalinta** ja **tila** (status).
- **Palkki:** minimi ja maksimi määritetään sarakkeen asetuksista.

Ehtokaava näyttää solussa jotain, jos esimerkiksi otsikko sisältää tietyn sanan tai muistiinpanossa on tietty tunniste. Relaatiosarakkeesta voi avata linkitetyt muistiinpanot. Niitä ei näytetä esikatselussa, koska niitä voi olla paljon. Linkitetyn sivun voi avata, vaikka se ei kuuluisi näkymään. Tärkeintä on sujuvuus, viiveettömyys, vakaus ja nätti ulkoasu, Sheetsin tasoinen tuntuma. Ulkoasutoiveet (*Ulkoasuvaihtoehdot*) pysyvät voimassa.

**Jo olemassa, älä tee uudelleen:**
- Näkymätiedostot `nakymat/*.md` ja näkymämuokkain (0.33). Turvallinen osapäivitys (0.55).
- Sarakelajit teksti, siru, pvm, luku, palkki (asetuksena min–max) ja kyllä/ei.
- Rivikohtainen kaavasarake `- =hinta*1,24 | luku | €` ja kaavamoottori (kohdat 10–11).
- Takaisinlinkit-sarake avattavalla listalla (0.51). Tämä on jo relaatiosarakkeen tulevien linkkien puoli.
- Lajittelu, suodatus, sarakkeiden siirto ja leveys (0.57).
- Taulukot-osion muokkaus- ja täyttöreitit (kohta 12, toteutusjonon kohta 2).

**Emil 23.11.2026, tarkennus ensimmäiseen julkaisuun.** Muistiinpanon kentän kirjaaminen solusta ja sarakkeen näyttötavan valinta ovat ensisijaiset. Esimerkiksi Uni-sarakkeeseen syötetty 8 tallentuu alkuperäisen muistiinpanon alkutietoihin muodossa `uni: 8`. Sama kenttä on käytettävissä kaikissa näkymissä. Yksikkö ja näyttötapa ovat näkymän asetuksia. Kojelaudan tuleva kortti voi valita kentän `uni`, rajata aineiston ja näyttää esimerkiksi keskiarvon. Uusi tietokantalaskenta jää jatkoon.

**0.63, kohtien 21.1 ja 21.2 ensimmäinen rajaus.** Näkymäeditorissa voi lisätä kentän ja valita sarakkeelle näyttötavan. Klikkaus, napautus tai Enter kohdistetussa solussa avaa kentän pieneen ikkunaan. Tallennus päivittää yhden arvon tuoreimpaan Vault-tiedostoon. Vanha yksiselitteinen, sovittu tekstikenttä päivittyy paikallaan. Saman kentän ristiriidassa oma syöte säilyy ikkunassa ja käyttäjä valitsee peruuttamisen tai uudemman arvon korvaamisen. Uusi sarake lisätään näkymäeditorista. Suora kirjoitus ilman ikkunaa, näppäimellä eteneminen seuraavaan soluun, erillinen näyttönimi ja otsikkorivin plusnappi ovat mahdollisia jatkoja.

**Kentän ja näyttötavan sopimus**
- **Arvon paikka:** arvo kirjoitetaan muistiinpanon alkutietoihin riville `kenttä: arvo`, mikä on Vaultin nykyinen kenttäsopimus. Jos kenttä on jo tekstirivinä `kenttä: arvo` (*Omat kentät*), päivitetään tämä rivi eikä tehdä toista. Emilin oma teksti ei muutu. Hyvä puoli: tekoäly, haku ja kaikki näkymät lukevat saman tiedon. Huono puoli: alkutiedot pitenevät ja näkyvät, jos tiedoston avaa muualla kuin apissa.
- **Määrittely ja arvo erillään:** sarakkeen määrittely on näkymätiedostossa: laji, valintalista ja värit, min–max, yksikkö ja kaava. Arvo on muistiinpanossa. Kenttänimi on yhteinen kaikille näkymille, joten esimerkiksi `tila` on sama tieto kaikkialla. Jos kahdella näkymällä on samalle kentälle eri valintalista, kumpikin näyttää omansa ja tuntematon arvo näkyy harmaana siruna.
- **Laskettuja tuloksia ei kirjoiteta tiedostoihin** (kohta 10). Vain syötetty arvo tallentuu.
- **Tallennus:** muutos näkyy samassa ruudunpäivityksessä ja tallentuu taustalla Vault-jonon kautta. Usean rivin muutos, kuten täyttö tai liittäminen, tehdään yhtenä Git-puumuutoksena ja kumotaan kerralla, kuten 0.41:n rakennemuutokset.

**Valmiit työtehtävät** järjestyksessä. Jokainen on oma versionsa ja saa oman testinsä. Toteutuslupana on Emilin ”toteuta”.

**21.1 Solun muokkaus kirjoittaa muistiinpanoon (tehty 0.79).**
- **Tietokoneella:** valittu solu siirtyy muokkaustilaan Enterillä tai kirjoittamalla. Enter tallentaa, Esc peruu ja Tab siirtää seuraavaan soluun.
- **Puhelimella:** solun napautus avaa pienen ikkunan, jonka kentän laji ratkaisee: teksti, luku numeronäppäimistöllä tai päivä valitsimella.
- **Otsikko ja lukitut solut:** otsikkosolu avaa muistiinpanon kuten nyt. Kaava, kansio, kuka, luotu ja takaisinlinkit näkyvät lukittuina.

Hyväksymisehdot:
- Arvo päätyy alkutietoihin, ja tekstirivi päivittyy paikallaan.
- Muu osa tiedostosta ei muutu tavuakaan.
- Toisen laitteen samanaikainen muutos käsitellään 0.55:n kenttäkohtaisella yhdistämisellä.
- Tyhjentäminen poistaa rivin, ja desimaalipilkku säilyy.

**21.2 Uusi sarake näkymästä (tehty 0.80).** Otsikkorivin lopussa on ＋. Siitä valitaan nimi ja laji, ja sarake lisätään näkymätiedostoon. *Toteutus 0.80:* oletuksena tekstimuuttuja, vaihtoehtona alkutietokenttä; olemassa olevat nimet siruina ja samankaltaisen nimen ehdotus; oletusnäkymästä tehdään uusi näkymä. Valittavana ovat myös jo löytyneet kentät (`nvFieldNames`). Kun Emil luo kentän apissa, se on hänen lupansa uudelle kentälle (kenttäsopimus). Liittyy korjaussuunnitelman kohtaan 4 (näyttönimi ja kenttänimi erikseen). Tekstimuuttujien valinta ja uuden luonnin työnkulku ovat kojelaudan kanssa yhteiset. Katso toteutusjonon kohta 3.

**21.3 Yhteenvetorivi (pystysuunta, tehty 0.81).** Taulukon alareunassa on kiinteä rivi. Sarakevalikon kohdassa *Laske* valitaan jokin seuraavista: ei mitään, summa, keskiarvo, mediaani, min, max, määrä, täytetyt, tyhjät, % täytetty tai kyllä-osuus.
- Lasketaan näkyvät eli suodatetut rivit.
- Valinta tallennetaan näkymätiedostoon sarakkeen määreeksi `| laske=summa`.
- Kaavasarake voi viitata koko sarakkeeseen, esimerkiksi osuus `=hinta/SUMMA(hinta)`.

Hyväksymisehdot: suodatin muuttaa tulosta, luvuissa tyhjät ja tekstit ohitetaan, ja desimaalit ovat oikein.

*Toteutus 0.81:* lasku valitaan sarakevalikon kohdasta *Yhteenveto* tai yhteenvetorivin solusta. Määreen arvot ovat `summa`, `keskiarvo`, `mediaani`, `min`, `max`, `maara`, `taytetyt`, `tyhjat`, `osuus-taytetty` ja `osuus-kylla`. Rivi näkyy vain, kun jollakin sarakkeella on lasku, ja laskee näkyvät rivit (myös haun rajaamat). Näkymän kaavasarakkeen ryhmäfunktiot (`SUMMA(kenttä)` ym.) laskevat näkymän rivit, muistiinpanon tekstin kaavat koko Vaultin (tekoälyn ratkaisu, Emil vahvistaa).

**21.4 Täyttökahva (tehty 0.84).** *Toteutus:* kahva tietokoneella, valintatilan *Täytä alas …* kosketukselle ja näppäimistölle; yksi commit Git-puurajapinnalla (`vCommitFiles`), kumous yhdellä commitilla. Valitun solun oikeassa alakulmassa on hiirellä vedettävä kahva. Alas vetäessä näkyy esikatselu: korostetut solut ja niiden määrä. Vapautus kirjoittaa saman arvon kaikkiin. Kosketuksella valitaan alue ja sitten *Täytä alas*.
- Ensimmäinen versio ei arvaa sarjoja, kuten 1, 2, 3 tai peräkkäisiä päiviä.
- Koko täytön voi kumota kerralla.

Hyväksymisehdot:
- 50 riviä yhdellä vedolla tuottaa yhden commitin.
- Kumous palauttaa jokaisen tiedoston tavulleen.
- Jos yhteys katkeaa, näkyy, mitkä rivit jäivät jonoon.

**21.5 Päivä-sarake valitsimella (tehty 0.82).** Napautus avaa pienen kuukausinäkymän, jossa nykyistä Päivät-valitsinta (`dsheet`) voi käyttää pohjana. Valittavana on yksi tai useampi päivä. Ulkopuolinen napautus sulkee valitsimen ja tallentaa.
- Tallennusmuoto on `kenttä: 2026-11-30` tai useammalle päivälle `kenttä: 2026-11-30, 2026-12-02`.
- Solussa näkyy ”ma 30.11.” ja tarvittaessa ”+1”.

*Toteutus 0.82:* valitsin on muistiinpanon Päivät-napin kuukausivalitsin (`dsheet`), ja sen yläreunassa lukee sarake ja muistiinpano. Ilman muutosta sulkeminen ei kirjoita. Tietokoneella kirjoittaminen ja F2 avaavat tekstikentän (päivät pilkulla). *Näytä kalenterissa* on sarakkeen määre `| kalenteri=kylla` (sarakevalikko, näkymäeditori, ＋-ikkuna). Päivät näkyvät kalenterin Viikko-listassa, Päivä-näkymässä ja aikajanan Koko päivä -alueella vain luettavina merkintöinä, jotka avaavat muistiinpanon.

**21.6 Valinta, monivalinta ja tila (tehty 0.83).** *Toteutus:* asetus `Nimi:väri, …`, tilassa ryhmät vinoviivalla; uusi nimi listan kautta lisätään sarakkeen valintoihin; rivien siruissa lasimainen sävy ilman sumennusta, ikkunoissa sumennus.
- **Asetukset:** sarakkeessa on valintalista Emilin järjestyksessä, ja jokaisella valinnalla on väri.
- **Solu:** napautus avaa listan. Monivalinnassa on ruksit, ja kirjoittamalla voi lisätä uuden valinnan.
- **Tila:** valinta, jonka vaihtoehdot jakautuvat kolmeen ryhmään: ei aloitettu, kesken ja valmis. Myöhemmin Listat, kalenteri ja tekoäly voivat tulkita sitä.
- **Tallennusmuoto:** `tila: kesken`, monivalinnassa `aiheet: [a, b]` samaan tapaan kuin `tagit`.

**21.7 Ehdot ja muistiinpanon tiedot kaavassa.**
- Rivin muuttujat: `otsikko`, `tunnisteet`, `kansio`, `luotu` ja `ajankohta`.
- Funktiot: `SISÄLTÄÄ(teksti; "x")`, `ONTUNNISTE("x")`, `TYHJÄ(kenttä)`, `TÄNÄÄN()` ja `PÄIVIÄ(pvm1; pvm2)`.
- Esimerkki: `=JOS(SISÄLTÄÄ(otsikko; "lasku"); hinta*1,24; hinta)`.

**21.8 Linkit- ja relaatiosarake.**
- **Linkit:** takaisinlinkkien rinnalle tulee `linkit`, eli muistiinpanot, joihin rivi itse linkittää. Solussa näkyy määrä, ja napautus avaa listan. Listasta pääsee sivulle, vaikka se ei kuuluisi näkymään.
- **Relaatiokenttä:** `kenttä: [[a]], [[b]]` näkyy samalla tavalla. Sitä muokataan valitsimella, jossa haetaan otsikolla.
- Relaatio on myös kohdan 22 riippuvuuksien pohja.

**21.9 Nopeus ensin ja aina.** Ennen laajennuksia mitataan 1 000 rivillä korjaussuunnitelman kohdan 5 tapaan:
- avaus, vieritys ja solun muokkaus
- täyttö 50 riviin ja yhteenvedon päivitys.

Tavoite: muokkaus näkyy samassa ruudunpäivityksessä, verkkotallennus tapahtuu taustalla, eikä vierittäessä näy tyhjää. Keinot:
- vain näkyvät rivit piirretään
- kaava lasketaan uudelleen vain muuttuneelle riville ja siitä riippuville yhteenvedoille
- kenttähakemisto pidetään välimuistissa.

**Tarkennettavat ennen toteutusta (Emil päättää):**
- **0.63:** Kenttäavaimessa käytetään pieniä ASCII-kirjaimia, numeroita, viivoja ja alaviivoja. Uusi arvo menee alkutietoihin. Vapaasti nimettävä näyttöotsikko on jatkotyö.
- **Päivä-sarake kalenterissa:** näkyykö sen arvo kalenterissa? Ehdotus: sarakkeen asetus *Näytä kalenterissa*, oletuksena pois, jottei kalenteri täyty.
- **Myöhempää:** täyttösarjat, viittaus toisen näkymän tulokseen ja ryhmittely välisummineen.

**Kuinka lähelle taulukkolaskentaa (tekoälyn arvio).** Pitkälle, kun malli on ”yksi kaava koskee sarakkeen kaikkia rivejä”, kuten Notionissa ja Airtablessa. Se on vahvuus: kaava kirjoitetaan kerran, ja se pätee myös uusiin muistiinpanoihin itsestään.
- **Saavutettavissa:** rivikaavat, sarakkeen yhteenvedot, ehdot, suodatus ja lajittelu, ryhmittely välisummineen, kertymä järjestyksen mukaan (`KERTYMÄ(hinta)`), osuudet, päivälaskut ja täyttö.
- **Taulukot-osio ennallaan:** vapaa solulaskenta jää sinne, ja molemmat käyttävät samaa kaavamoottoria. Näkymävälilehti yhdistää ne jo nyt.
- **Ei kannata tavoitella:** yksittäisen rivin poikkeavaa kaavaa tietokannassa (se tehdään kentän arvona) eikä matriisikaavoja.
- **Rehellinen raja:** jokainen rivi on tiedosto GitHubissa. Näyttö voi olla välitön, mutta moneen tiedostoon tallentaminen vie verkossa sekunteja. Jono hoitaa sen taustalla, ja tila näkyy.
- **Hyöty tekoälylle:** seuranta-arvot ovat luettavassa muodossa alkutiedoissa.

## 22. Oikea aikajana: vaiheet palkkeina, nimetyt osiot ja riippuvuudet (Emil 23.11.2026)

**Emil 23.11.2026 (sanelu):** Kalenterin nykyinen *Aikajana* on oikeasti viikko kellonaikoineen (tietokoneella) tai yksi päivä (puhelimella). Siksi se nimetään uudelleen, ja nimi *Aikajana* varataan oikealle aikajanalle.
- **Palkit:** aikavälin omaavat asiat, kuten projekti tai sen vaihe, näkyvät allekkain vaakapalkkeina.
- **Aikaikkuna:** pituuden voi vaihtaa helposti: viikko, kuukausi, 3, 6 tai 12 kuukautta (enintään 12).
- **Riippuvuudet:** vaiheiden välille voi merkitä riippuvuuksia (B alkaa vasta, kun A on tehty), enimmäiskeston ja aikaisimman aloituksen. Riippuvuus voisi näkyä esimerkiksi viivana A:n lopusta B:n alkuun.
- **Monta aikaväliä yhdessä muistiinpanossa:** jokaisella aikavälillä on nimi, ja mieluiten tekstiin voi kirjoittaa myös sen, mitä pitää tapahtua ensin. Nimen pitäisi olla helppo merkitä, esimerkiksi etumerkillä tai kehystämällä ensimmäinen sana erikoismerkeillä. Tallennettuna nimi näkyisi osion otsikkona ja palkin nimenä.
- **Kysymys:** voiko linkki muistiinpanosta toiseen kertoa riippuvuuden suunnan ja toimia silti tavallisena linkkinä? Näin prosessikaavion voisi kirjoittaa toisiinsa linkitettyinä muistiinpanoina.

**Jo olemassa:**
- Päivämäärien jäsennys tunnistaa välit, kuten ”1.12.–15.12.”.
- Muistiinpanon voi jakaa osiin `---`-merkinnällä (Juuren monitekstinen muistiinpano).
- `##`-otsikot korostuvat (0.2).
- Wikilinkit, takaisinlinkit, paikallinen graafi (0.50) ja Flow.

**Kirjoitustapa (tekoälyn ehdotus, Emil hyväksyy):**
- **Nimetty vaihe on `##`-otsikko**, jonka alla on aikaväli. Markdown-otsikko on jo Vaultin muoto: tekoäly ja muut ohjelmat ymmärtävät sen, appi näyttää sen otsikkona, ja se on yhtä nopea kirjoittaa kuin erikoismerkki.
  ```
  # Keittiöremontti
  ## Suunnittelu
  1.12.–20.12.
  ## Purku
  aikaisintaan 7.1. · kesto 2 viikkoa
  vaatii: Suunnittelu
  ## Asennus
  vaatii: Purku, [[sahkotyot]]
  ```
  Emilin idean mukainen vaihtoehto on rivin alkuun kehystetty nimi, `[Suunnittelu] 1.12.–20.12.`, joka ei vaadi omaa riviä. Molempia voi tukea, mutta ensisijaiseksi ehdotan `##`:tä, koska se toimii myös ilman appia.
- **Riippuvuus on kenttä `vaatii:`**, samaa muotoa kuin kohdan 21 sarakkeet. Arvo voi olla saman muistiinpanon vaiheen nimi, toinen muistiinpano `[[nimi]]` tai toisen muistiinpanon vaihe `[[nimi#Vaihe]]`.
  - Arvo on tavallinen wikilinkki, joten se toimii samalla tavallisena linkkinä takaisinlinkeissä ja graafissa. Kentän nimi kertoo suunnan: tämä tarvitsee tuon ensin.
  - Uutta linkkimerkintää ei tarvita, joten Obsidian-yhteensopivuus säilyy.
  - Käänteistä suuntaa (”mahdollistaa”) ei kirjoiteta, vaan se päätellään.
- **Kesto ja rajat:** `kesto: 2 viikkoa` on enimmäiskesto ja `aikaisintaan 7.1.` aikaisin aloitus. Jos vaiheella on vain riippuvuus ja kesto, aikajana sijoittaa sen edeltäjän perään ja näyttää sen katkoviivalla.

**Valmiit työtehtävät:**

**22.1 Nimen vaihto.** Nykyinen Aikajana-nappi saa uuden nimen (ks. *Avoimet kysymykset* `TILA.md`:ssä). Pieni muutos, joka ei muuta tallennusmuotoa.

**22.2 Aikajanan perusnäkymä (vain luettava).**
- **Rivit:** kalenterin Aikajana-näkymässä rivit ovat muistiinpanoja ja niiden nimettyjä vaiheita, joilla on aikaväli (alku ≠ loppu).
- **Palkki:** nimi näkyy palkissa tai sen vieressä, jos se ei mahdu palkkiin.
- **Ohjaimet:** aikaikkuna valitaan segmentistä Viikko / Kk / 3 kk / 6 kk / 12 kk. Lisäksi on nuolet ja Tänään-nappi, ja pyyhkäisy siirtää aikaikkunaa.
- **Tänään ja avaaminen:** tämän päivän kohdalla on pystyviiva, ja palkin napautus avaa muistiinpanon.
- **Rajaus:** sama tunniste- tai näkymärajaus kuin Muistiossa.

Hyväksymisehdot:
- Vuodenvaihde ja karkausvuosi toimivat.
- 12 kuukauden ikkuna ja 400 palkkia toimivat sujuvasti.
- 320 px:n puhelimella nimisarake kapenee tai nimi siirtyy palkkiin.
- Vaalea ja tumma teema.

**22.3 Nimetyt vaiheet muistiinpanossa.** `##`-otsikko, jonka alla on aikaväli, muodostaa oman palkin. Muistiinpanon otsikko näkyy ryhmän otsikkona ja vaiheet sen alla. Lukunäkymässä vaiheen nimi korostuu ja aikaväli näkyy siruna. Testataan kolmella vaiheella, joista yhdellä ei ole päivää (sille ei tule palkkia, vaan se näkyy merkinnällä ”ei aikaa”), sekä otsikon muuttamisella.

**22.4 Riippuvuudet näkyviin.**
- **Viiva:** `vaatii:` piirtää porrasviivan ja nuolen edeltäjän lopusta seuraajan alkuun.
- **Ristiriita:** jos seuraaja alkaa ennen kuin edeltäjä loppuu, viiva ja palkin reuna näkyvät punaisina ja näytetään huomautus.
- **Kehä:** A vaatii B:tä ja B vaatii A:ta. Siitä annetaan huomautus, eikä viivaa piirretä loputtomasti.
- **Puuttuva kohde:** näkyy haaleana.

**22.5 Laskettu paikka.** Vaihe, jolla on `kesto` ja `vaatii` mutta ei päivää, sijoitetaan katkoviivalla edeltäjän perään, aikaisintaan-raja huomioiden. Päiviä ei kirjoiteta tiedostoon ennen Emilin hyväksyntää (*Kiinnitä päivät*).

**Tarkennettavat:**
- **Raahaus:** palkin siirtäminen ja venyttäminen kirjoittaisi päivät tekstiin. Se muuttaa Emilin tekstiä, joten tarvitaan päätös ja kumous.
- **Riippuvuuden piirto:** vetäminen palkista toiseen kirjoittaisi `vaatii:`-rivin.
- **Laskenta:** kriittinen polku, enimmäiskeston ylityksen varoitus ja automaattinen uudelleenaikataulutus.
- **Prosessikaavio:** näytetäänkö verkottuneet muistiinpanot paikallisessa graafissa (kohta 19) `vaatii:`-nuolina, Flow'ssa vai molemmissa?
- **Listat:** `vaatii:` voisi ohjata Listoja niin, että tehtävä näkyy vasta, kun edeltäjä on kuitattu (kohdat 7 ja 18).

## 23. Kaaviot: ruudut ja nuolet, ehdolliset napit ja upotukset (Emil 24.11.2026)

**Emilin idea.** Tietokoneella on Freeformin kaltainen vapaa kanvas. Sille tehdään ruutuja, joissa on tekstiä, ja ruudusta vedetään nuoli toiseen. Nuolen suunta merkitsee. Ruudusta voi tehdä napin. Nappi tulee käytössä näkyviin, kun siihen tulevien nuolten ehto täyttyy: ruudussa C valitaan, vaatiiko se sekä A:n että B:n vai jommankumman. Nuolen voi vetää myös ruutuun, joka ei näy, vaan kirjoittaa tekstiä muistiinpanoon tai asettaa muuttujan. Rakennelma tallentuu muistiinpanoksi, jonka voi valita esimerkiksi pikakirjauksen lähteeksi. Sama väline sopii päätöspuuhun, prosessikaavioon ilman nappeja, käsitekarttaan ja inforuutuihin. Lisäksi Emil haluaa synkronoidut upotukset: tekstiosio näkyy toisessa muistiinpanossa, ja muokkaus kummasta tahansa paikasta muuttaa samaa tekstiä. Emil voi myöhemmin jakaa vaultin usean appin kesken, jotta yksittäinen appi ei paisu.

**Emilin vastaukset 24.11.2026:**
- Ensimmäistä käyttötilannetta ei valita. Vaihtoehtoja on paljon erilaisista kirjauksista lähtien.
- Tuotos kirjoitetaan heti. Jos valinta perutaan saman käytön aikana, kirjoitettu teksti poistetaan.
- Kaavio on tiedosto vaultissa, mutta se ei kuulu päivittäiseen Muistioon. Yleisempi toive: käyttötiedostot, jotka on tehty tiettyyn käyttöön, erotetaan Muistion tavallisista muistiinpanoista. Kaiken pitää silti löytyä jostakin.
- Editori voi olla Kaikin tietokoneosio, jos se ei hidasta appia tai sen muita osioita.
- Flow: Emil ei vielä tiedä. Flow'n idea voi myöhemmin sisältyä johonkin muuhun.
- Kanvaasi kiinnostaa. Siitä voi aloittaa yhden version, jolla tehdään inforuutuja. Käsitekartat tulevat myöhemmin.

**Rajaus (tekoälyn ehdotus).** Kaavio on ehdollisten nappien, tekstien ja tekstipohjien kaavio, ei ohjelmointikieli. Siinä ei ole silmukoita, ajastuksia, ajassa eteneviä tiloja tai omia funktioita. Ero Appi-appiin: *Appi-appi tekee appeja, kaavio tekee muistiinpanoja, jotka toimivat.* Jos tarve kasvaa yli rajan, siitä tehdään Emilin hyväksymä erillinen suunnitelma.

**Linjakkuus.** Kaavio käyttää olemassa olevia rakenteita eikä tee uusia rinnakkaisia käsitteitä:
- Nuoli vastaa kohdan 22 `vaatii:`-ajatusta.
- Tuotos kirjoittaa pikakirjauksen tavalla päivän muistiinpanon `## Pikakirjaukset` -osaan.
- Muuttujat ovat tavallisia `!!nimi: arvo!!` -merkintöjä.
- Upotus on wikilinkki, joten takaisinlinkit ja haku toimivat sellaisinaan.
- Kanvaksen kosketus- ja asettelumallit tulevat Flowchartista (`FC.arrange`, `FC.routes`, pudotus ennen ja jälkeen) ja Kytköskartasta.

### 23.1 Ensimmäinen kokeilu: kaaviotiedosto ja kanvas tietokoneella

**Tavoite.** Emil tekee tietokoneella kaavion, jossa on tekstiruutuja ja nuolia, ja katsoo sitä puhelimella. Kokeilussa ei ole nappeja eikä logiikkaa. Inforuudut, prosessikaaviot ja yksinkertaiset käsitekartat toimivat jo tällä. Muoto suunnitellaan heti niin, että vaihe 23.2 lisää siihen vain kenttiä.

**Miksi kanvas ensin (muuttaa 24.11. keskustelun ehdotusta, jossa ajaja oli ensin):** Emil haluaa inforuutuja ja käsitekarttoja joka tapauksessa. Kanvas ei siis jää turhaksi, vaikka ehdolliset napit eivät tuntuisi hyviltä.

**Tiedosto (tekoälyn ratkaisu, Emil voi muuttaa ennen toteutusta).** Polku on `kaaviot/<nimi>.md`:

```
---
tyyppi: kaavio
otsikko: Illan kirjaus
kuvaus: Mitä illalla kirjataan.
luotu: 2026-11-24
lahde: emil
---
# Illan kirjaus

## Ruudut
- a | Miten päivä meni?
- b | Nukuin huonosti | tulee: a
- c | Kirjaa yöheräily | tulee: a (kyllä), b
  Toinen rivi samaan ruutuun sisennettynä.

## Asettelu
- a: 120, 80, 180
- b: 360, 40, 160
```

- **Ruudut-osa.** `- tunnus | teksti | ominaisuudet`.
  - Tunnus on lyhyt ja pysyvä. Appi tekee sen ja säilyttää sen, vaikka teksti muuttuu. Tekoäly saa keksiä omansa.
  - Teksti on yhdellä rivillä. Jatkorivit sisennetään kahdella välilyönnillä.
  - `tulee: a, b` tarkoittaa, että nuolet tulevat a:sta ja b:stä tähän ruutuun. Sulkeissa on nuolen valinnainen teksti, esimerkiksi `(kyllä)`.
  - Ominaisuus `väri: <teeman väri>` valitaan muutamasta Appipajan sävystä.
  - Rivien järjestys on lukujärjestys. Sitä käyttävät puhelimen listanäkymä ja ruudunlukija.
- **Asettelu-osa** on muotoa `x, y, leveys`. Kun rivi puuttuu, appi sijoittaa ruudun automaattisesti Flowchartin `FC.arrange`-tavalla. Silloin tekoälyn kirjoittama kaavio aukeaa ilman koordinaatteja.
- **Muu teksti säilyy.** Tiedostossa voi olla johdanto tai muistiinpanoja otsikoiden ulkopuolella. Appi ei muuta niitä. Rivin, jota appi ei tunne, appi säilyttää sellaisenaan.
- **Wikilinkit toimivat ruudun tekstissä.** `[[muistiinpano]]` avaa muistiinpanon. Tämä on halpa silta kohdan 20 muistiinpanokortteihin.
- **Piilotus.** `kaaviot/` lisätään piilokansioihin, jolloin kaaviot eivät näy Muistion oletuslistassa. Ne löytyvät Kaaviot-osiosta, Muistion suodattimen *Kaikki*-valinnalla ja wikilinkin kautta. Vaultin `ohjeet/appi.md` päivitetään toteutuksen yhteydessä.
- **Muuttujahaku ohittaa `kaaviot/`-kansion.** Ilman tätä vaiheen 23.2 tuotospohjien `!!`-merkinnät näkyisivät oikeina havaintoina kojelaudalla.

**Käyttö tietokoneella (Kaaviot-osio):**
- Lista kaavioista ja + Uusi kaavio.
- Kaksoisnapsautus tyhjään tekee uuden ruudun ja avaa kirjoituksen. Tyhjäksi jäänyt ruutu poistuu.
- Ruudun vetäminen siirtää sitä, ja ruutu asettuu magneetilla ruudukkoon.
- Nuoli syntyy, kun ruudun reunan kahvasta vedetään toiseen ruutuun. Nuolen valinta ja Delete poistavat nuolen. Kaksoisnapsautus nuoleen antaa sille tekstin.
- Kanvasta liikutetaan vetämällä ja zoomataan rullalla tai nipistämällä.
- Ctrl+Z kumoaa ja Ctrl+Shift+Z tekee uudelleen.
- Tallennus tapahtuu muutaman sekunnin viiveellä yhtenä commitina. Ristiriidan käsittely on sama kuin muistiinpanoissa: molemmat versiot säilyvät.

**Puhelin.** Kaavio aukeaa vain luettavana. Sitä voi zoomata kahdella sormella ja liikuttaa. Ruudun wikilinkki avaa muistiinpanon. Valikossa on lisäksi *Näytä listana*, joka näyttää ruudut lukujärjestyksessä ja nuolet sisennyksinä. Muokkausta puhelimella ei tehdä tässä vaiheessa.

**Keveys (Emilin ehto).** Kaikin `index.html` on noin 1,27 Mt. Kanvaskoodi ei käynnisty, ennen kuin Kaaviot-osio tai kaavio avataan. Mittaa käynnistyksen ja Muistion avauksen ajat ennen muutosta ja sen jälkeen samalla testivaultilla. Jos ero näkyy, editori tehdään erilliseksi apiksi (`kaaviot/` P-iv-kartan juureen), joka käyttää samaa tiedostomuotoa. Silloin Kaikkiin jää vain katselu.

**Hyväksy:**
- Tekoälyn käsin kirjoittama kaavio ilman Asettelu-osaa aukeaa järjestettynä.
- Kun yksi ruutu ja nuoli lisätään, tiedostoerossa näkyy vain kaksi uutta riviä ja Asettelu-rivit.
- Johdanto ja tuntematon rivi säilyvät.
- Tekstin muuttaminen ei muuta tunnusta.
- Kahden laitteen ristiriidassa molemmat versiot säilyvät.
- Kaavio ei näy Muistion oletuslistassa, mutta *Kaikki*-suodattimella näkyy.
- Muuttujaluettelo ei poimi `kaaviot/`-kansiosta mitään.
- Käynnistysmittaus on kirjattu.
- Leveydet: tietokone 1280 ja 1440 px, puhelimen katselu 390 ja 320 px.

### 23.2 Seuraava kokeilu: ehdolliset napit ja tuotos (23.1:n kokeilun jälkeen)

- **Ruudun laji** on `laji: nappi`, `laji: tuotos` tai oletuksena teksti.
- **Näkyvyys käytössä.** Ruutu, johon ei tule nuolia, näkyy aina. Muuten ruudun ehto ratkaisee:
  - `ehto: kaikki` on oletus. Kaikkien lähteiden pitää olla valittuina tai näkyvissä, jos lähde on tekstiruutu.
  - `ehto: jokin` riittää yhdellä lähteellä.
  - Ominaisuus `yksi` lähtöruudussa tekee päätöspuun kysymyksen: siitä lähtevistä napeista voi valita vain yhden, ja muut piiloutuvat (Juuren Flow'n Pois).
- **Tuotos** ei näy käytössä. Kun sen ehto täyttyy, se kirjoittaa tekstinsä heti.
  - Kohteen määrää kaavion alkutieto `kohde:`. Oletus on valitun päivän muistiinpanon `## Pikakirjaukset` kuten nykyisessä pikakirjauksessa. Kohde voi olla myös `[[muistiinpano]]`.
  - Pohjassa saa käyttää `{klo}`, `{pvm}` ja `!!nimi: arvo!!`.
  - Jos ehto lakkaa saman käyttökerran aikana, appi poistaa täsmälleen kirjoittamansa rivin. Jos riviä on sillä välin muokattu, appi ei poista sitä vaan kertoo asiasta (Emilin teksti on Emilin).
  - Käyttökerta alkaa kaavion avaamisesta käyttöön ja päättyy sen sulkemiseen. Sulkemisen jälkeen kirjoitetut rivit ovat tavallista tekstiä.
- **Kehä.** Editori estää kehän (a → b → a) ja näyttää syyn.
- **Käyttöpaikka.** Pikakirjauksessa on Kaaviot-välilehti, jossa valitaan kaavio, ja se näyttää kaavion napit puhelimelle sopivana listana, ei kanvaksena. Kanvasnäkymässä on Käytä-tila tietokoneelle.
- **Hyväksy:**
  - Kun A ja B valitaan, C tulee näkyviin. A:n peruminen piilottaa C:n ja poistaa C:n tuotoksen rivin.
  - `jokin`-ehto toimii.
  - `yksi`-kysymys toimii päätöspuuna kolmella tasolla.
  - Käsin muokattua riviä ei poisteta.
  - Sulkemisen jälkeen rivit säilyvät.
  - Tekoälyn kirjoittama kaavio toimii.
  - Leveydet: puhelin 390 ja 320 px, tietokone 1280 ja 1440 px.

### 23.3 Seuraava kokeilu: upotus, ensin vain luettava

- **Merkintä** on `![[muistiinpano#Otsikko]]` tai koko muistiinpanolle `![[muistiinpano]]`. Se on Obsidian-yhteensopiva, joten tekoälyt tuntevat sen.
- **Osio** on otsikon alla oleva teksti seuraavaan saman tai ylemmän tason otsikkoon asti.
- **Näkyminen.** Upotus näkyy lukunäkymässä kehyksessä, jossa on lähteen nimi. Napautus avaa lähteen kyseisen osion kohdalta.
- **Kehä ja syvyys.** Kehä katkaistaan, ja upotuksia voi olla sisäkkäin enintään kolme.
- **Linkkinä.** Upotus lasketaan linkiksi takaisinlinkeissä ja haussa.
- **Laskenta tapahtuu vain lähteessä.** Upotetun tekstin `!!`-muuttujat ja ajankohdat kuuluvat lähteelle. Niitä ei lasketa kahdesti kojelaudassa eikä näytetä kahdesti kalenterissa.
- **Puuttuva kohde.** Jos lähde tai otsikko puuttuu, kehyksessä lukee *Upotettavaa osiota ei löydy* ja merkintä säilyy.
- **Hyväksy:**
  - Upotus päivittyy, kun lähdettä muokataan toisella laitteella.
  - Kehä ei jumita appia.
  - Kojelaudan summa ei kasva upotuksesta.
  - Kalenterissa ei näy tuplaa.
  - Otsikon nimen muutos näyttää puuttuvan kohteen ilmoituksen.

### Visio: mietitään tarkemmin ennen toteutusta (ei toteutuslupaa)

- **Muokattava upotus.** Muokkaus upotuksessa kirjoittaa lähdetiedostoon. Avoinna ovat ristiriidat, otsikon muutoksen kestävä viittaus (lohkotunnus `^id` vai viittausten päivitys nimen muuttuessa, kuten 0.41-rakennemuutoksissa) ja se, miten Emil näkee muokkaavansa toista tiedostoa.
- **Upotus kaaviossa.** Ruutu voi näyttää muistiinpanon osion, ja valinta tuo upotuksen esiin. Näin tehdään esimerkiksi päätöspuu, joka näyttää oikean ohjeen.
- **Syöte-, muuttuja- ja kaavaruudut.** Syötteet ovat pikakirjauksen syötelajit (luku, 1–5, valinta, XY). Ruutu voi näyttää kaavan tuloksen, ja ehto voi olla kaava, esimerkiksi `uni < 6`. Näin kaavio saa laskentataulukon ominaisuudet. Kaavamoottori on sama kuin kohdissa 10–12.
- **Muistiinpanokortit kanvaasilla** (kohta 20). Ruutu on muistiinpano, ja nuoli kirjoittaa linkin alkutietoihin. Käsitekartat syntyvät näin.
- **Käyttötiedostojen erottelu yleisesti** (Emil 24.11.). Pohjat, data, näkymät, kojelaudat ja kaaviot näkyvät omissa osioissaan, eivät päivittäisessä Muistiossa. Kaikki löytyy silti yhdestä paikasta. Tämä vaatii vaultin rakennepäätöksen (`ohjeet/rakenne.md`, `ohjeet/paatokset.md`).
- **Flow'n kohtalo.** Juuren Flow (Tai, Ja, Pois, Loppu) voisi muuntua kaavioksi, koska lajit vastaavat toisiaan. Päätetään Juuren karsinnan (kohta 14) yhteydessä, kun Emil tietää, käyttääkö hän Flow'ta.
- **Nykyinen pikakirjaus kaaviona.** `pohjat/pikakirjaus.md` on käytännössä kaavio ilman nuolia. Myöhemmin sen voi yhdistää kaavioihin niin, että vanha muoto toimii edelleen.
- **Tilannekohtaiset kaaviot.** Eri tilanteisiin tehdään eri kaavio pikakirjauksen lähteeksi. Tämä seuraa 23.2:sta ilman lisätyötä, mutta valintatapa (manuaalinen vai ajan tai paikan mukaan) on auki.
- **Monta appia samalla vaultilla.** Saman osoitteen apit jakavat selaimen muistin, joten GitHub-avain voisi olla yhteinen. Ennen tätä tarkistetaan, millä avaimella Kaikki avaimen tallentaa. Jos vaultin lukija ja kaavamoottori tarvitaan useassa apissa, kopioiden erilleen ajautumisen estäminen (yhteinen tiedosto) on tekniikkalinjan muutos ja vaatii Emilin päätöksen.

**Avoimet kysymykset Emilille:**
1. Muistetaanko 23.2:ssa päivän valinnat sulkemisen jälkeen? Tekoälyn ehdotus on ei: käyttökerta päättyy sulkemiseen. **Emil 24.11.: ei muisteta.**
2. Kelpaako tiedostomuoto (`tulee:`-nuolet ja Asettelu erikseen)?
3. ~~Näkyykö kaavio Muistion haussa?~~ Emil 24.11.: kaavioiden pitää löytyä Muistiosta, jos kaiken kuuluu löytyä. Laajempi kysymys on Jäsennyksen kohdassa B6.
4. ~~Paikka jonossa~~: Jäsennys 24.11., kohta A8. 23.2 tulee säätimien ja toimintojen (A6) jälkeen.

## Visio: Ajatusten risteämissä syntyvät timantit

**Käyttäjän tavoite 23.11.2026.** Ajatusten risteämässä voi syntyä yksinkertainen ajatus, joka toimii avaimena moniin eri sovelluksiin. Siihen tiivistyy jotakin ennen kirjoitetusta, ja siitä voi lähteä moneen uuteen suuntaan. Hyvän kirjan tavoin ajatus voi antaa viidennellä lukukerralla jotain, mihin ensimmäisellä lukukerralla ei vielä ollut tarttumapintaa. Käyttäjä haluaa sekä nostaa itse tällaisia ajatuksia että kohdata niitä tilanteessa, jossa niillä on jotain annettavaa. Tavoite läpäisee Muistion, haun, näkymät, omat kirjaukset ja lukemisen ilmeen.

*Suunnitteluehdotus.* Käyttäjä voi ensin jättää ajatuksen keskeneräiseksi. Tekoäly voi myöhemmin tuoda rinnalle lähteen tai toisen ajatuksen ja sanoa yhdellä lauseella, mitä niiden kohtaaminen avaa. Lukija voi seurata perustelua, palata kohtaan ja kirjoittaa oman sovelluksensa tai eriävän tulkintansa. Seuraava holvia lukeva tekoäly löytää sekä lähtökohdan että käyttäjän jatkon. Lukija voi myös vain lukea ja poistua. Noston arvo käy parhaiten ilmi siitä, mitä ajatus auttaa myöhemmin näkemään, kysymään tai tekemään.

*Ilme ja käyttö.* Ydinajatukselle annetaan ensimmäinen katse, luettava palstan leveys ja tilaa ympärille. Lähteet avautuvat pyynnöstä. Myöhemmästä sovelluksesta pääsee takaisin siihen lauseeseen, joka sen synnytti. Puhelimella lukeminen onnistuu yhdellä kädellä, tietokoneella lähdettä voi verrata ajatukseen. Hyödynnä Hiilloksen otsikkohierarkiaa ja Lehdon väljyyttä aiemman ulkoasupalautteen mukaan. Sama rauha koskee nopeaa kirjausta: löydön esiin tuleminen ei siirrä kursoria eikä keskeytä meneillään olevaa tekemistä.

*Pidemmällä aikavälillä.* Tilannekohtainen nosto voisi perustua avoimeen kysymykseen, työskentelyn aiheeseen tai käyttäjän omaan paluutoiveeseen. Tekoäly voisi myös koota käsillä olevaan työhön sopivan näkymän samoista lähdemuistiinpanoista. Ajatuksen pitkäaikainen merkitys, sopivuus tämänhetkiseen tehtävään ja näytön vahvuus pidetään erotettavissa. Automaattisten nostojen tiheys, valintaperuste ja pysyvä tietomuoto ratkaistaan ensimmäisten käyttökokemusten perusteella.

## Ulkoasuvaihtoehdot: Lehto, Luoto ja Hiillos

Emilin pyytämät vertailuluonnokset, 23.11.2026. Sama koetehtävä kaikissa: etsi Muistion Retken valmistelu -näkymästä Reittisuunnitelma, avaa sen Varustelista-linkki ja muuta Retkibudjetin yhtä hintaa. Näillä kolmella tilanteella näkee, ohjaako ulkoasu lukemaan, siirtymään ja muokkaamaan oikeassa kohdassa. Kyse on suunnitteluvaihtoehdoista. Emil valitsee linjan tai yhdistelmän ennen julkaisua.

### Emilin ulkoasupalaute 23.11.2026

**Toteutus 0.61 (23.11.2026):** Lehto ja Hiillos on oletusilme (Emil: ”saat tehdä kaikki ulkonäkömuutokset ja viedä ne perille”). *Projekti → Ulkoasu → Ilme → Oma värisäätö* palauttaa värikoneen. Aksentit ovat: Lehto murrettu sininen #3B5B82 tai luumu #7B3F66, Hiillos koralli #F19979, laventeli #B9A6F2 tai viileä sininen #86B8EA. Otsikkofontiksi voi valita New Yorkin, Iowanin, Charterin, Didotin, Avenir Nextin tai järjestelmäfontin. Valinta näkyy täyttönä ja reunana, tänään-päivä omana reunanaan ja virhe reunaviivana. Luvut ovat tasalevyisiä. Tietokoneella muistiinpanon rivinpituus on rajattu. Rivinäkymän otsikkorivi on lämpimällä pinnalla, tyhjässä solussa näkyy ajatusviiva ja taulukon jäädytetyn osan raja erottuu. Ennestään olemassa ja ennallaan: aktiivisolun 2 px:n kehys, rivi- ja sarakeotsikon korostus, lukujen tasaus oikealle, wikilinkin alleviivaus ja sanalinkin pisteviiva, kojelaudan korostettu arvo sekä väkänen kuittauksena. Ei vielä tehty: otsikkofontti muistiinpanon ensimmäiseen riviin (vaatii kohdistustestin), Treenin seuraavan sarjan korostus ja Flow’n polun viivan paksuus. Aksentin ja fontin oletukset valitaan Emilin iPhone-kokeilun perusteella.

- **Tumma tila: Hiillos.** Erityisesti luonnoksen otsikkofontin luonne ja muotoilu miellyttävät Emiliä. Käytä Hiilloksen otsikoiden mittasuhteita, kirjainmuotoa ja typografista hierarkiaa vertailukohtana. Valitse toteutuksen tarkka fontti rinnakkaisista näytteistä. Otsikoissa saa olla luonnetta, ja leipätekstin ja taulukon fontti valitaan luettavuuden mukaan.
- **Hiilloksen aksenttivärit.** Emil haluaa tarkastella samaa tummaa teemaa useilla valittavilla aksenttiväreillä. Pidä pinnat ja typografia samoina, jotta värejä voi verrata suoraan. *Ehdotus kokeiluun:* kuvan koralli, laventeli ja viileä sininen. Näytä kullakin värillä linkki, valittu rivi, aktiivinen solu ja kohdistus samoissa kohdissa. Varmista, että virhe ja kuittaus tunnistuvat värivalinnasta riippumatta.
- **Vaalea tila: Lehdon asettelu eri fonteilla ja väreillä.** Emil pitää luonnoksen vaaleasta, väljästä asettelusta. Kuvan otsikkofontti ja vihreä väritys on rajattu pois jatkovaihtoehdoista. Säilytä lukutilan väljyys ja selkeä ryhmittely, kokeile uusia otsikkofontteja ja tee vaalea paletti ilman vihreää. *Ehdotus kokeiluun:* lämmin vaalea pinta, neutraali tumma teksti ja vaihtoehtoina murrettu sininen tai luumu.
- Tarkan fontin, aksenttivalikoiman ja oletusvärin valinta tehdään esikatselun perusteella. Edellä oleva palaute ohjaa jatkoluonnoksia. Alla oleva taulukko kuvaa alkuperäiset vertailukuvat.

| Suunta | Pinta, teksti, valinta | Muistio ja puhelin | Taulukko ja muu käyttö |
|---|---|---|---|
| **Lehto** | Luonnonvalkoinen #F6F4EA, metsämuste #19392F, salvianvärinen valintapinta #DCE9D9. Meripihka pieniin yksityiskohtiin. | Avoimen muistiinpanon otsikko laitteen antiikvalla, muu käyttöliittymä selkeällä päätteettömällä fontilla. Rivin nimen ja sisällön välillä tilaa, tunnisteet sivuosassa. | Otsikkorivi erottuu lämpimällä pintasävyllä. Aktiivisolua kiertää metsänvihreä kehys. Paras lähtökohta, jos kirjoittaminen ja pitkän tekstin lukeminen ovat etusijalla. |
| **Luoto** | Siniharmaa #EAF1F2, syvä petrooli #163944, valintapinta #D3E5E8. Kupari #9A492E pienessä aktiivisen solun merkissä. | Näkymän nimi toimii otsikkona. Ensimmäinen sarake on sävytetty, luvut oikealle tasattuina, hienot poikkiviivat auttavat seuraamaan leveää riviä. | Soluosoite, kaavarivi ja ruudukko samalla linjalla. Valitun solun reunus sekä sen rivin ja sarakkeen otsikoiden korostus kertovat muokkauskohteen. Paras lähtökohta tiheään tietokantatyöhön. |
| **Hiillos** | Grafiitti #222429, vaalea kaura #F3EBDD, lämpimän korallin värinen kohdistus #F19979. Vaimea liila täydentää tunnisteita. | Lukupinta on yhtenäinen. Linkki erottuu alleviivauksella ja kirkkaammalla tekstillä. Tietorivi avautuu pyynnöstä. | Aktiivinen sarake erottuu otsikon pienellä merkillä. Valittu alue saa hienovaraisen täytön ja aktiivinen solu selvän reunan. Soveltuu iltakäyttöön myös valitun vaalean linjan tummana parina. |

### Yhteinen asettelu ja käsittely

- **Muistion tietokantanäkymä.** Pidä näkymän valinta, haku ja rajaus samassa työkalurivissä; rajauksen käytön ilmaisee valittu arvo tai lukumäärä. Kiinnitä sarakeotsikot välittömästi palkin alle. Vahvin sarake on avattava otsikko. Linkkien lukumäärä avaa luettelon, tunnistesarake näyttää mahtuvat arvot ja +N. Numerot tasalevyisin numeromerkein ja oikealle, puuttuva tieto ajatusviivalla. Näytä lajittelusuunta nuolella ja monivalinta myös ruudulla. Pidä rivin avaaminen, kuittaus ja linkin avaaminen eri osuma-alueina.
- **Taulukot.** Hienot ruudukon rajat työalueella, voimakkaampi raja jäädytetyn osan päässä. Käytä kevyttä korostusta rivi- ja sarakeotsikoissa ja noin 2 px kehystä aktiivisolussa. Kaavan muokkauksen aikana näytä valittu viite samanvärisellä reunalla ja tekstimuotoisella osoitteella. Otsikon rajaa lähestyttäessä näkyvä viiva ja kohdistin vaihtuvat samassa kohdassa. Suurenna osuma-aluetta leventämättä jatkuvasti ruudukon viivoja. Puhelimella sarakkeen valikossa ovat myös siirto ja koon säätö.
- **Avoin muistiinpano.** Anna ensimmäisen rivin otsikolle tilaa. Rajoita pitkän tekstin rivinpituutta leveällä näytöllä, säilytä luonnollinen rivittyminen puhelimessa. Tiedot-siru kokoaa metatiedot. Wikilinkillä on jatkuva alleviivaus ja automaattisella sanalinkillä kevyt pisteviiva. Säilytä kirjoitus- ja korostuskerroksen täsmällinen kohdistus: testaa fontti, rivinvaihdot, kursori ja valinta myös suurella tekstillä ennen otsikkofontin käyttöönottoa editorissa.
- **Kalenteri, Kojelauta ja Treeni.** Valittu päivä saa saman valintapinnan kuin aktiivinen rivi ja tänään oman reunamerkkinsä. Säilytä yhtenäinen kuittausruutu ja viikonvaihtonuolet. Kojelaudassa korosta arvoa, sijoita yksikkö ja jakso sen viereen; kuvaajan puuttuva päivä näkyy aukkona. Treenissä suuri painotus seuraavaksi kirjattavalle sarjalle, edellinen tulos pienempänä vertailuna. Listoissa päättyneen kohdan kuittaus näkyy väkäsenä ja tekstinä tarvittavassa paikassa. Flow’ssa aktiivisen polun ja graafissa valitun solmun voi tunnistaa myös viivan paksuudesta.
- **Osasta toiseen.** Sama kuvake, nimi ja paikka samalle komennolle. Puhelimen usein käytetyt komennot alhaalla peukalon ulottuvilla; tietokoneella navigaatio sivulla ja aktiivisen näkymän toiminnot sen yhteydessä. Käytä rajaviivaa eri tavoin toimivien alueiden välissä, väliä saman ryhmän sisällä. Tekstinä näkyvä virhe ja uudelleenyritys ovat lähellä tallennettua kenttää. Päällimmäisestä ikkunasta palataan samaan kohtaan.
- **Teemat ja kustannus.** Sovita sävyt nykyisiin CSS-muuttujiin (--bg, --cell, --label, --sep, --accent) ja käyttäjän omiin koko- ja teema-asetuksiin. Erottele pysyvä valinta, näppäimistökohdistus ja virhe muodolla. Käytä paikallisia fontteja, olemassa olevia yksinkertaisia kuvakkeita ja tasaisia pintoja. Suunnittelukuvat ovat havainnollistuksia; varsinaiseen appiin ei tarvita taustakuvia, uusia fonttilatauksia tai piirtoa jokaisella hiiren liikkeellä. Säilytä taulukon näkyvien rivien piirto ja solun paikallinen päivitys.

### Miten vaihtoehto valitaan ja hyväksytään

Tee valitusta suunnasta ensin rajattu vertailu nykyiseen Muistion rivinäkymään, muistiinpanoon ja Taulukoihin samalla testiaineistolla. Käytä 320/390 ja 1280/1440 px:n leveyksiä. Kokeile oikealla sormella ja hiirellä: vieritä pitkää listaa, muuta sarakeleveyttä, avaa linkki, muokkaa solua, peru ja jatka samasta kohdasta. Hyväksy, kun ote seuraa kursoria tai sormea, sarakeraja ei karkaa, teksti ei hypi ja valinta erottuu sekä vaalealla että tummalla pinnalla. Tarkista tekstin kontrasti projektin tavoitteella 4,5:1 myös valitulta riviltä. Jos käsittely tuntuu nykyistä tahmeammalta, tutki ensin aiheuttiko tyylimuutos uuden koko listan piirron tai jatkuvan asettelun mittauksen. Laajenna valittu linja muihin osioihin vasta tämän kokeilun jälkeen.

## Tulevien ominaisuuksien toteutusjono

23.11.2026. Lähtötila on appiversio 0.54 ja sitä seuraava käytettävyysarvio. Alla **tarkennus** tarkoittaa tästä arvioinnista syntynyttä toteutusehdotusta. Alkuperäiset Emilin päätökset ja osioiden prioriteetit löytyvät A0–D-jonosta ja kohdista 1–20. **Valmis työtehtävä** tarkoittaa, että rajaus ja hyväksymisehto ovat riittävät rakentajalle. Toteutuslupa määräytyy alkuperäisen kohdan mukaan. **Kokeilu** käyttää testiaineistoa. **Päätös** kertoo täsmälleen, mikä estää laajemman käyttöönoton. **Hyllyllä** tarkoittaa, että rakentaja ohittaa kohdan.

### Mistä seuraava rakentaja aloittaa

**Ajantasainen etusija:** [uusi havaintolohkon kirjoitusasu ja yhteensopivuus](#01-uusi-havaintolohkon-kirjoitusasu). Alla oleva 23.11. ohje kuvaa muiden töiden etenemisjärjestystä.

1. Lue ensin uusin TILA, tarkista päähaara ja mahdollinen kokeiluhaara. Tee edeltävän vakausarvion tallennus- ja vierityskorjaukset A0:n yhteydessä. Suunnitelman alun yöajon ohje on historiallinen palautusohje: päähaarassa 0.53 on ZIP-korjaus, 0.54 kalenterikorjaus ja toistuvuuden 0.52-kokeilu omassa haarassaan. Tarkista saraketyön sisältö koodista ennen mahdollista palautusta.
2. A0:n ominaisuusketju näkymän turvallisesta osapäivityksestä taulukoiden yhteiseen näkymäeditoriin on valmis 0.67:ssä. Kaavaviittauksen poiminta (0.68), täyttö alas (0.72), laitekohtainen lukumuotoilu (0.74), jäädytys (0.75) sekä suodatus ja lajittelu näytön järjestyksenä (0.76) ovat kokeiltavissa. Jaetut lukumuodot ja aikamuodot ovat kokeiltavissa (0.77). Oma järjestys ja jaettu lukitus ovat kokeiltavissa (0.78). Muistion solun suora kirjoitus (0.79), ＋ sarake (0.80), yhteenvetorivi (0.81) päiväsarake (0.82) valinta, monivalinta ja tila (0.83) sekä täyttö alas (0.84) ovat kokeiltavissa. Seuraava askel on ehtokaavat (jäsennys 24.11., A3.7, kohta 21.7). Turvallinen nimen vaihto kuuluu jäsennyksen kohtaan A4. Etene sitten A2/A3:n kokeilupalautteen mukaan. Alla oleva numerointi ryhmittelee ominaisuuksia eikä siirrä D-visioita A0:n edelle.
3. Jokaiseen toteutuscommittiin kuuluu yksi käyttäjälle kokeiltava työnkulku. Vertaa vanhaa ja uutta testitiedostoa, kokeile keskeytys ja uudelleenavaus, tarkista sekä puhelimen että tietokoneen reitti. Tiedostoon kuvaillun ominaisuuden pitää toimia myös silloin, kun tiedoston on tehnyt tekoäly ja appi avataan tyhjällä paikallisella välimuistilla. Kirjaa TILA-tiedostoon testattu raja ja seuraava tehtävä.

### 1. Muistion näkymistä ja taulukon näkymävälilehdestä sama työväline (A0.3, A0.7, A3.1, kohdat 2 ja 12)

~~**Muistion lajittelu usealla kentällä.**~~ Tehty 0.64 (A0.7). Näkymäeditorissa voi lisätä, siirtää ja poistaa lajitteluperusteita sekä valita kunkin suunnan. Jaettu `jarjestys`-rivi tallentaa perusteet pilkuilla eroteltuna. Vanhasta yhden kentän muodosta luetaan yksi peruste. Luvut ja päivät vertautuvat arvojensa perusteella, tyhjät ovat viimeisiä ja täydet tasatulokset säilyttävät lähtöjärjestyksen. Sarakevalikosta voi palata tilapäisestä lajittelusta näkymän lajitteluun. Testi `selain_64.py` käyttää kahta selainprofiilia.

**Leveys ja järjestys.** Lue vanha laiteasetus ja näkymän sarakkeelle annettu `w=120`. Ehdotettu etusija on nimenomainen laitepoikkeus, jaettu näkymä, sitten apin oletus. Nimeä editorissa tallennuskohde. Vanhan laitteen leveyksiä saa ehdottaa jaettaviksi vasta käyttäjän valitessa tallennuksen. Sarakeotsikon tilapäinen lajittelu poistamalla palautuu näkymän koko lajittelulista. ~~Näkymävälilehden editori saa saman sarake-, ehto- ja lajitteluosion.~~ Tehty 0.67. Taulukot → ⋯ → Muokkaa näkymävälilehteä muuttaa valitun välilehden ehtoja, lajittelua ja sarakkeita sekä niiden järjestystä ja jaettua leveyttä. Tallennus kohdistuu välilehden omaan tiedostoon ja käyttää samaa osapäivitystä ja ristiriitavalintaa kuin Muistio. Muistiinpanorivin otsikko avaa alkuperäisen tiedoston ja lasketut sarakkeet käyttävät samaa kaavamoottoria. Arkistoi näkymä esikatselun jälkeen vain kyseisen määrittelytiedoston osalta. Palauta avoin näkymä oletukseen ja tarkista, viittaako jokin kortti tai välilehti arkistoitavaan kohteeseen.

**Hyväksy:** kahdessa profiilissa eri vanhat leveydet, yksi vanha lajittelu, kaksi tasatulosta, puuttuva arvo ja käsin lisätty sarakemääre. Muuta vain lajittelua. Vertaa tiedostoa, järjestystä, näppäimistökohdistusta ja vaakavieritystä. Näkymän arkistoinnin jälkeen lähdemuistiinpanot ja niiden sisältö ovat samoja. Mahdollisen uuden sarakealiaksen pysyvä muoto sovitaan erikseen.

### 2. Laskentataulukon jatko pieninä julkaisuina (A0 v2.1, kohdat 10–12)

- ~~**Viittauksen poiminta.**~~ Tehty 0.68. Kaavaa kirjoittaessa **Valitse solu** (Alt+Enter) avaa poiminnan. Solun tai alueen voi valita samalta tai toiselta välilehdeltä ja myös vieritetystä, virtualisoidusta ruudukosta. **Käytä viitettä** lisää viitteen kursorin kohdalle tai korvaa maalatun tekstin. Yläreunassa näkyy kaavan lähtösolu ja valittu viite. Puhelimella **Valitse alue** käyttää alku- ja loppusolun napautuksia. Enter hyväksyy viitteen poiminnassa ja tallentaa kaavan kaavariviltä. Esc palauttaa alkuperäisen sisällön. Testi `selain_68.py`.
- ~~**Täyttö alas.**~~ Tehty 0.72. Toteutusrajaus: valitse lähdesolu ja kohdealue, näytä esikatselu ja toteuta yhtenä kumottavana muokkauksena. Hiirellä täyttökahva, kosketuksella sama käsky aluevalikossa. Testi: solussa B2 on `=A2*2`; täytä B3:B5, viimeinen viittaa A5:een ja yksi kumous palauttaa kaikki aiemmat arvot. Käytä jäsennettyjä viittauksia. Lukuarvo, teksti ja kaava käsitellään erikseen. Tunnistamattoman viitetyypin kohdalla ilmoita rajoitus ennen kirjoitusta.
- ~~**Lukumuotojen rajattu kokeilu.**~~ Tehty 0.74. Taulukot → ⋯ → **Lukumuoto** muotoilee solun tai alueen luvuksi, euroiksi tai prosenteiksi valitulla desimaalimäärällä. Yleinen palauttaa oletusesityksen. Esimerkiksi 0,25 näkyy 25 %:na ja laskenta käyttää arvoa 0,25. Koko alue kumoutuu yhtenä toimena. Asetus tallentuu vain tähän selaimeen ja seuraa soluosoitetta. Testi `selain_74.py`.
- **Jaettu lukumuoto (tehty 0.77).** Muoto tallentuu välilehden `lukumuodot`-alkutietoon ja pysyy samassa osoitteessa rakennemuutoksissa. Aikamuodot ja vanhojen selainmuotojen siirto ovat käytössä. Lihavointi ja tasaus odottavat, taustavärit on poistettu jonosta (jäsennys 24.11., A1).
- ~~**Valittava jäädytysalue.**~~ Tehty 0.75. Taulukot → ⋯ → **Jäädytä rivit ja sarakkeet** kiinnittää ensimmäiset datarivit ja vasemman reunan sarakkeet vierityksen ajaksi. Asetus on välilehti- ja selainkohtainen. Pitkän taulukon jäädytetyt rivit säilyvät ruudukossa myös silloin, kun muiden rivien näkyvää aluetta vaihdetaan. Testi `selain_75.py`.
- ~~**Suodatus ja lajittelu.**~~ Tehty 0.76 laskentataulukon näytön järjestyksenä. Sarakevalikossa voi lajitella yhden sarakkeen ja rajata useita sarakkeita. Alkuperäiset rivinumerot, soluosoitteet, laskentajärjestys ja taulukkotiedosto säilyvät. Kopiointi ja liittäminen käyttävät näkyviä rivejä näytön järjestyksessä. **Palauta näkymä** poistaa kaikki ehdot ja lajittelun. Taulukon rakennekomennot ja täyttö alas käyttävät palautettua näkymää. Testi `selain_76.py`. Erillinen lähderivien pysyvä uudelleenjärjestely käyttäisi nykyistä rakenneoperaatiota ja sen viitepäivityksiä.
- **Nimen ja viitteiden eheys.** Näyttöotsikon vaihto on eri operaatio kuin tiedoston siirto. Kun tiedostonimen vaihto toteutetaan, laske ensin vaikutus wikilinkkeihin, aliaksiin, muistiinpanokaavoihin, välilehtiviitteisiin ja kortteihin. Päivitä tunnistetut kohteet yhtenä Git-puumuutoksena kuten 0.41:n rakennemuutoksissa. Testaa kaksi samannimistä tiedostoa eri kansioissa, lainattu esimerkkiteksti, keskeneräinen paikallinen muokkaus sekä palvelimella välissä vaihtunut versio. Epäselvä kohde näytetään ennen vientiä.

### 3. Kojelauta, jota voi käyttää yhdellä kädellä ja rakentaa tietokoneella (D, kohdat 6 ja 13)

**Toteutusrajaus, ehdotus.** Hyödynnä nykyisten taulukkokorttien reitit `boardCards`, `boardTarget`, `boardPatch` ja `boardSaveValue`. Vanhojen `taulukot/<taulukko>/_nakyma.md`-korttien pitää avautua myös uudessa työtilassa. Kokeile ensin yksi numeerinen kortti ja yksi päivän tarkistuslista samalla kojelaudalla. Laajenna sen jälkeen kuvaajavalikoimaa, ulkoasua ja asettelua erikseen testattavissa julkaisuissa.

**Kortin käyttäytyminen.** Luku, palkki ja kuvaaja lukevat solua tai aluetta; liukusäädin ja kytkin saavat muuttaa vain nimettyä kirjoitettavaa syöttösolua. Solulukko koskee myös näppäimistöä ja liittämistä taulukkoon. Käyttötilan ulkoasulukko suojaa asettelua. Tekstikortille sallitaan ensin otsikko ja sisältö; kuvakortti odottaa liitekokeilua. Napin kokeiluksi riittää yhden sovitun syöttöarvon asettaminen, kohde ja vaikutus näkyvät editorissa. Testaa suojattu solu, kaavasolu, kadonnut välilehti, kaksi ristiriitaista muutosta ja epäonnistunut tallennus. Älä korvaa `boardCards`-lukijan edellyttämää täsmällistä otsikkoriviä ilman yhteensopivaa vanhan tiedoston lukua.

~~**Muuttuja inforuudun lähteenä**~~ tehty 0.66 tekstimuuttujille: lasku viimeisin/summa/keskiarvo/pienin/suurin/määrä, rajaus aikavälillä, tunnisteella ja kansiolla, yksikkö (myös `h min`), luku tai päiväkuvaaja aukkoineen, Lähteet-lista. Tallennus `data/kojelauta.md` (`id | otsikko | muuttuja | laske | aika | tunniste | kansio | yksikko | nayta`). 0.71 lisäsi tämän editorin kenttä- ja tarkistuslistaruudut. Taulukkosolukortti on jo olemassa omassa editorissaan (0.39). Yhteinen taulukkosolun valinta, vapaa sijoittelu ja koko sekä kuvaajan tyyli ovat jatkoa.

**~~Muistiinpanokentät inforuutujen lähteenä~~ (kenttäruutu tehty 0.71).** Kortin lähteeksi voi valita vakaan kenttäavaimen kuten `uni`, laskennan tuloksen tai aiemman taulukon solun/alueen. Rajaus voi käyttää tunnistetta, kansiota ja aikaa. Valitse tulokseksi esimerkiksi viimeisin arvo, summa, keskiarvo, minimi, maksimi tai havaintojen kappalemäärä. Esimerkkikokeessa `uni: 8` ja `uni: 6,5` antavat keskiarvoksi 7,25 h ja havaintomääräksi 2. Tyhjä kenttä ohitetaan, kirjattu nolla lasketaan mukaan ja kortista voi tarkistaa, mitkä muistiinpanot muodostavat tuloksen. Kenttä ja tunniste ovat eri valintoja.

~~**Muuttujan merkintä, havainnon päivät ja tunnistus näkyviin**~~ tehty 0.65 (`MUUTTUJA` moottorissa, testit `logiikka_muuttuja.js` ja `selain_65.py`). Tekoälyn ratkaisut, jotka Emil vahvistaa: `VVVV-KK-PP` kelpaa päiväksi, merkinnän oma vuodeton päivä ei osu tulevaisuuteen, merkinnän päivät eivät tee kalenteriin ajankohtaa ja nimet yhdistyvät kirjainkoosta riippumatta. Luettelo 0.65: Valikko → Muuttujat, koottu merkinnöistä ilman omaa tiedostoa; sarakkeiden varaama muuttuja, kuvaus, laji ja yksikkö sekä samankaltaisen nimen ehdotus puuttuvat.

**Emilin päätös 23.11.2026: muuttujan merkintä tekstissä.** Käytä yhtä muotoa `!!nimi: arvo!!`. Kaksi huutomerkkiä kummassakin päässä rajaa sekä nimen että arvon. Päivättömässä muodossa ensimmäinen kaksoispiste erottaa nimen ja arvon. Päivätyssä muodossa käytetään `!!päivämäärät: muuttujan nimi: arvo!!`. Nimi saa sisältää välilyöntejä, ääkkösiä ja sulkeita. Säilytä nimen välilyönnit. Kaksoispisteen ympärillä olevat välilyönnit ohitetaan. `!!Mieliala:6!!` ja `!!Mieliala: 6!!` tunnistuvat samoin. Arvo voi olla luku tai teksti. Laskentaan otetaan vain kokonaan numeerinen arvo ja sekä desimaalipilkku että desimaalipiste kelpaavat. Tavallinen `Palaveri: tärkeä` kuuluu leipätekstiin. Nykyiset kaavat ja wikilinkit säilyttävät merkityksensä. Testaa myös tekstiarvo, jossa on toinen kaksoispiste, keskeneräinen merkintä ja koodilohkon esimerkit.

**Yhteinen muuttujaluettelo.** 0.69 toteutti Muistion ja kojelaudan yhteisen luettelon. Sarake määritellään muodossa `muuttuja("Uni") | luku | h`. Luettelo johdetaan merkinnöistä ja näkymätiedostoista. Pikamuistiinpanon napit käyttävät samaa luetteloa versiosta 0.72. Sama Vaultista luettava luettelo palvelee sarakkeita, inforuutuja, Pikamuistiinpanon nappeja ja tekoälyn kirjauksia. Muuttuja ilmestyy luetteloon, kun käyttäjä luo sitä käyttävän sarakkeen tai kun sillä tehdään ensimmäinen tekstikirjaus. Tyhjä sarake varaa muuttujan näkymässä. Muistiinpanoon kirjoitetaan merkintä vasta, kun soluun tallennetaan arvo. Muuttuja säilyy luettelossa niin kauan kuin sillä on vähintään yksi merkintä muistiinpanossa tai siihen viittaava sarake. Testaa tyhjä sarake, ensimmäinen tekstimerkintä ilman saraketta, viimeisen merkinnän poistaminen sarakkeen yhä ollessa olemassa sekä viimeisen merkinnän ja sarakkeen poistuminen. Pidä lista synkassa myös GitHubissa tehtyjen kirjausten kanssa. Listalla riittävät muuttujan nimi ja mahdollinen kuvaus, laji ja yksikkö. Tiedostopolku ja päivitystapa kirjataan Vaultin ohjeeseen toteutuksen yhteydessä.

**Muuttujan valinta kirjattaessa.** Saraketta luotaessa Emil valitsee olemassa olevan muuttujan tai luo uuden vapaalla nimellä. Samankaltaisen nimen kohdalla näytä ehdotus ja jätä valinta Emilille. Tekoäly lukee luettelon ennen kirjausta ja käyttää merkitykseltään ja yksiköltään vastaavan muuttujan täsmällistä nimeä. Lähteeltään epäselvästä mittarista sovitaan Emilin kanssa. Inforuudun vapaa näyttöotsikko säilyttää lähdesidoksen. Kun muistiinpanossa on useita havaintoja eri osioissa, muokkaus kohdistetaan valittuun havaintoon. Aiemmat rakenteiset kentät pysyvät luettavina. Varmista, ettei sama havainto tule lasketuksi kahdesti, jos sen aiempi kenttä ja uusi tekstimerkintä ovat rinnakkain.

**Emilin päätös 23.11.2026: havainnon päivät.** Käytä Kaikin päivämäärätunnistusta. `!!1.4., 2.4. ja 3.4.: Työn kuormittavuus: 9!!` kohdistaa saman arvon kaikkiin ennen ensimmäistä kaksoispistettä tunnistettuihin päiviin. Sallittuja ovat vapaamuotoiset erottimet ja täytesanat. Muuttujan nimi on kaksoispisteiden välissä. Toisen kaksoispisteen jälkeen on koko arvo, myös tekstiarvon mahdolliset kaksoispisteet. Toteutusehdotus: tekstiarvo toimii sellaisenaan ilman pakollisia lainausmerkkejä. Päiväykset voivat toistua ilmaisussa, mutta sama päivä tuottaa samasta havainnosta vain yhden pisteen.

Sovella ensin havainnon omia päivämääriä. Kun niitä ei ole, yksi osiossa tavallisessa tekstissä tunnistettu, yksiselitteinen päivämäärä koskee kaikkia kyseisen `---`-osion päivää vailla olevia havaintoja. Jos osiossa ei ole yhtään päivää tai siinä on useita eri päiviä, kyseiset havainnot säilyvät päivättöminä. Päivätön arvo näkyy lähteissä ja jää päiväkohtaisen kuvaajan ulkopuolelle. Kaikki ei avaa päivämäärävalitsinta tässä tilanteessa. Testaa yksi päivä tekstissä, oma päivä tai päivämäärälista osion päivistä riippumatta, useita päivämääriä ilman omaa päivää, saman päivän toistuminen, päivät eri osioissa sekä kuvaajan nolla ja puuttuva päivä.

**Tunnistus näkyviin (Emilin toive 23.11.2026).** Näytä tunnistetut päivämäärät, muuttujan nimi ja arvo hienovaraisella muotoilulla. Erottelun tulee toimia myös ilman väriä. Vasta merkinnän käyttäjän avaama pieni infoikkuna näyttää muuttujan nimen, arvon sekä sille tunnistetut päivät ja niiden lähteen. Päivättömän havainnon tila näkyy tässä ikkunassa. Tunnistuksen tai tekstin muokkauksen aikana infoikkuna pysyy suljettuna.

**Emilin toive 23.11.2026: rakennettava kojelauta ja inforuudut.** Käyttäjä valitsee inforuudun lähteen, rajaukset, koosteen, esitystavan ja ulkoasun. Käyttötapojen valikoimaa voi laajentaa. Tavallisen lukukortin lähde voi olla valittu muuttuja, taulukon solu tai alue, tai laskennan tulos. Valitse esimerkiksi viimeisin arvo, summa, keskiarvo, minimi, maksimi tai lukumäärä. Anna rajata tulosta esimerkiksi ajalla, tunnisteella ja kansiolla, myös usealla yhtä aikaa.

**Yksiköt ja esitystavat.** Valittavia esityksiä ovat esimerkiksi suuri luku, teksti, palkki, viiva- tai pylväskaavio, lista ja tarkistuslista. Käyttäjä voi valita tulokselle yksikön tai yksiköttömän näytön. Tarjoa vähintään tunti, minuutti ja yhdistetty tunti–minuutti sekä muita yleisiä ja omia yksiköitä. Toteutusehdotus: muunna ajan esitys vain, kun lähdeyksikkö on tiedossa. Esimerkiksi 8,5 h näkyy valittaessa 8 h 30 min. Esitystavan vaihto säilyttää lähdearvon. Kuvaajalle voi valita aikavälin, tyylin, yksikön ja värin. Puuttuva päivä näkyy aukkona ja kirjattu nolla nollana.

**Asettelu ja lukitus.** Käyttäjä sijoittelee ruutuja ja muita elementtejä vapaasti näkymään, joka vierii yhteen suuntaan. Ehdotus on näytön leveyteen rajattu, pystysuunnassa vierivä ruudukko. Muokkaustilassa korttia voi vetää paikkaan ja sen kokoa voi muuttaa kulmakahvasta. Puhelimella ruudut sovitetaan näytön leveyteen. Tarjoa myös siirtotoiminto ilman raahausta. Käyttötilaan lukittuna korttien sijainti ja koko pysyvät, ja ruudun omat toiminnot, kuten kuittaus, ovat käytettävissä. Ulkoasu, esimerkiksi otsikko, värit ja tekstin tai kuvaajan esitys, tallentuu asetteluun.

**Tarkistuslista (0.71) ja listan jatko.** Ruutu voi poimia muistiinpanoista lähdeosiot, jotka vastaavat kaikkia valittuja ehtoja, esimerkiksi päivämäärä *Tänään* ja tunniste *Arki*. Näytä osion teksti tai otsikko ja avaa lähde samasta rivistä. Kun ruudun tyyppi on tarkistuslista, osuman viereen tulee kuittauspainike. Ensimmäinen työnkulku *Tämän päivän asiat* näyttää tänään ajoitetut tekstiosiot ja niiden tilan. Valitse ruututyyppi omien ruutujen editorissa. Kansio ja tunniste ovat valinnaisia. Tarkista myös yksikäsitteinen kohdistus, jos muistiinpanossa on useita osioita tai osiossa useita ajankohtia.

**~~Yhteinen kuittaus kalenterin kanssa~~ (tehty 0.71).** Kojelaudassa kuitataan sama lähdemuistiinpanon tekstiosioon kuuluva ajankohta kuin kalenterissa. Kuittaus ja sen kumoaminen näkyvät molemmissa. Muistiinpanossa näytetään kuittaustieto kyseisen tekstiosion yhteydessä. Toteutusehdotus: käytä samaa tiedostoon tallennettua kuittaustietoa (`kuitattu:`) kuin kalenteri ja näytä tila lähdetekstin kohdalla. Varmista ensin, että tallennus erottaa eri tekstiosiot, saman päivän eri merkinnät ja toistuvan tapahtuman yksittäiset kerrat. Testaa kuittaus kojelaudalta, takaisin kalenterista, tilan näyttö lähdeosiossa sekä synkronointi kahden selainprofiilin välillä.

### 4. Pikakirjausten editori, toteumat ja suhteellinen lukupädi (D, kohdat 6, 8 ja 15)

**Tarkennus → rajattu editori.** Nykyinen salamanappi ja ”Uusi nappi” säilyvät nopeana sisäänkäyntinä. Avaa hallinta samasta ikkunasta. Näytä vasemmalla järjestys ja oikealla valitun napin nimi, laji, kohde, yksikkö, mahdolliset arvot ja tunnisteet. Puhelimella vaihdetaan luettelosta yhteen muokkauslomakkeeseen. Esikatselu näyttää saman napin kuin kirjausikkuna ja esimerkin lopullisesta kirjauksesta. Käytä `quickPresets`-lukijaa ja laajenna `quickPresetPatch` päivittämään yhtä valittua riviä tai järjestystä. Säilytä käsin kirjoitetut otsikot, kommentit ja tuntemattomat rivit. Nimen vaihdossa tarkista sidonta mittariin ja vanhaan muistutukseen, sillä nykyinen tunnistus käyttää nimeä. Jos yhteys muuttuisi, näytä se ennen tallennusta. Testaa kaksoisnimi, samanaikainen lisäys, peruminen ja uudelleenavaus toisella laitteella. Napin arkistointi ei poista kirjauksia.

**~~Pikamuistiinpanon muuttujanapit (Emil 23.11.2026).~~** Tehty 0.72. Valitse yhteisestä muuttujaluettelosta ne muuttujat, jotka haluat napeiksi Pikamuistiinpanoon. Esimerkiksi nappi *Uni* avaa arvokentän ja tallennus kirjoittaa kohdemuistiinpanoon saman merkinnän kuin käsin kirjaaminen, esimerkiksi `!!Uni (h): 8,5!!`. Nappi viittaa jo olemassa olevaan muuttujaan. Näytä valittu muistiinpano tai päivä. Tarkista, että peruminen jättää muistiinpanon koskemattomaksi ja että tallennettu arvo näkyy samassa muuttujassa myös sarakkeessa ja inforuudussa.

**Suhteellinen XY kokeiluun.** Keskipiste on saman mittarin viimeisin arvo ennen valittua päivää. Näytä sekä muutos että lopullinen arvo ennen OK:ta. Ilman vertailuarvoa avaa nykyinen absoluuttinen valitsin. Tarkista lähtöarvo 72,4 ja muutos −0,2 → 72,2, asteikon raja, irrotus ja Peru. Pysyvä asetus vasta kokeilupalautteen jälkeen. Päivitä Kirjoitusohjeen kopioitava esimerkki aina toimivan jäsentimen kautta. Pikakomennon esikatselun, käsinsyötön ja salamanapin pitää tuottaa samalla päivällä sama arvo ja yksikkö.

**Toteumat näkyviksi.** Aloita vain luku -koosteella: valitse mittari, ajanjakso ja ehto, esimerkiksi ”arvo vähintään 3”. Näytä erikseen kelvolliset päivät, ehdon täyttävät päivät ja päivät ilman kirjausta. Napauttamalla lukua saa lähdepäivät. Esimerkillä [2, 3, puuttuu, 4] tulos on 2/3 ja yksi puuttuu. Käytä ehtoa vasta käyttäjän valinnasta. **Korrelaatiokokeilu** käyttää kahden numeerisen mittarin saman päivän havaintopareja. Näytä jakso, parien määrä ja hajontakuva. Testaa täysin saman- ja vastakkaissuuntainen sarja, vakiosarja ja puuttuva pari. Vakiosarjasta ei voi laskea kerrointa. Päätä vähimmäishavaintomäärä ja värien tulkinta ennen värien tuomista varsinaisiin nappeihin. Laskentaan yksi yhteinen toteutus myös MEDIAANI-, KESKIHAJONTA- ja KORRELAATIO-kaavoille. Määrittele otos- tai populaatiokeskihajonta esimerkkituloksineen ennen funktion julkaisua.

### 5. Monta kirjausta päivässä, uni, ravinto ja Treeni (A2, kohta 16)

**Tarkennus → ensimmäinen päästä päähän toimiva kooste olemassa olevalla treenidatalla.** Valitse kojelautaan ”Sarjoja päivässä”. Lue sama `data/treeni.csv` ja sarjajoukko kuin `treSets`. Ryhmitä päivämäärällä, laske hyväksytyt sarjarivit ja anna avata saman päivän rivit. Esimerkkipäivällä kahden treenin kolme ja kaksi sarjaa tuottavat 5; seuraavan päivän yksi sarja tuottaa 1. Lisäys, korjaus ja haulla tullut muutos päivittyvät laskemalla kooste lähteestä. Tee sen jälkeen summa ja suurin arvo valitulle numeeriselle sarakkeelle. Näytä yksikkö, aikaväli sekä ero puuttuvan tiedon ja kirjatun nollan välillä. Käytä samaa päiväkoostetta kuvaajassa ja kalenterissa. Jo siirrettyä Treenikartan historiaa ei tarvitse tuoda uudestaan.

**Seuraava kokeilu:** Treenin liikenäkymästä avataan viimeisimmät sarjat päivä- ja treenikohtaisesti. Koosteesta pääsee aina lähdesarjaan. Uni ja ravinto aloitetaan nykyisistä päiväarvoista: testimittareilla desimaalitunnit sekä aterioiden määrä. Kokeile, riittääkö pikakirjaus ilman uutta osiota. Jos tarvitaan useita aterioita tai unijaksoja päivässä, tee erillisen haaran testiaineistolla päivä, jossa on kaksi tapahtumaa, yksi korjaus ja puolenyön ylittävä jakso. **Päätös:** mitä halutaan kirjata kerralla, mille päivälle yön tapahtuma kuuluu, mitä vanhaa sovellusta aineisto täydentää ja miten lähderivi tunnistetaan korjausta varten. Oikean Vaultin uudet mittarit, taulukot ja sovellusten väliset siirrot sovitaan erikseen.

### 6. Toistuvuus, Listat ja Flow (C, A3, kohdat 7, 14, 17 ja 18)

**Toistuvuus → kokeiluhaarasta hyväksyntänäyttö.** Käytä kohdan 18 nykyistä haaraa. Tee rinnakkain kaksi viikkokohdetta, joiden määräpäivä on 14. päivä. Kuittaa molemmat 12. päivänä: kuittauksesta laskettava seuraava on 19. päivä. Tasavälisen seuraava määräpäivä johdetaan alkuperäisestä rytmistä. Näytä kokeilussa erikseen, kuitataanko aikaisella suorituksella 14. päivän kerta; jos kyllä, seuraava on 21. päivä. Ehdotus kuukauden lopulle: 31.1. → 28.2. → 31.3. kiinteässä rytmissä tavallisena vuonna. Vertaa karkausvuoteen. Kumoaminen palauttaa edellisen kuittauksen ja määräpäivän; kahden laitteen kuittausten yhdistämisessä säilytä historia. Samat päivät näkyvät listassa, Muistiossa ja kalenterissa. **Päätös:** esimerkkien tulokset, pysyvät kentät ja erikseen vanhan aineiston siirto. Älä yhdistä kokeiluhaaraa vain versionumeron perusteella.

**Listat → luettava esitys ennen mahdollista muodonvaihtoa.** Nykyinen synkka käyttää kohdan 17 sekamallia. Tuota testiaineistosta Markdown-esikatselu, jossa tavalliset rivit, ryhmät, kierros ja kuittaukset erottuvat. Kokeile yhden tavallisen rivin kuittausta. Vertaa tulosta nykyiseen JSON-malliin, myös järjestyksen ja kohteen tunnisteen osalta. Tunniste + tila sopii muistiinpanoista poimittavaan listaan; tehtävärivi sopii yksinkertaiseen käsin ylläpidettyyn tarkistuslistaan. Projekti voi rajata kummankin aineistoa. **Päätös:** mitkä listat vaativat ulkoista tekstimuokkausta ja miten kierroksen tila esitetään. Pysyvä muutos edellyttää kaksisuuntaista muunnostestiä, varmuuskopiota ja erillistä siirtopäätöstä.

**Flow → tarkistettava tekstiesikatselu.** Syötä nykyiseen tekstipuukokeiluun kysymys, kaksi vastausta ja toisen alle jatkokysymys. Näytä polku valitusta vastauksesta tulokseen. Virheellisestä sisennyksestä ilmoita rivinumero ja säilytä luonnos. Seuraavassa kokeessa lisää vain yksi ehto nykyisellä tunnisteella tai kentällä ja näytä, miksi haara näkyi. Viittaukset yhteiseen haaraan kokeillaan vasta aidosta toistuvasta haarasta; testaa puuttuva kohde ja silmukka. Kirjaa Emilin valinta sisennyksestä, ehdoista ja tarpeellisista viittauksista ennen pysyvän tiedoston syntaksia. Kanvaasi (20) pysyy hyllyllä.

### 7. Tunnisteet, painoarvo ja muistiinpanojen verkosto (kohdat 1, 2, 9, 10, 14 ja 19)

- **Painoarvon löydettävyys.** Tee testinäkymä nykyisellä numeerisella kentällä ja luvun mukaan laskevalla lajittelulla. Käytä esimerkeissä arvoja 1, 3, 5 ja arvioimaton sekä kahta samalla aiheella olevaa eri painoista tekstiä. Suodata aihe ja tarkasta, että onnistunut yhteenveto löytyy ilman suurta linkkimäärää. Tyhjä säilyy arvioimattomana. Kriteerit, kentän nimi ja arvon kirjaaja ovat Emilin päätös. Mahdollinen ehdotettu arvo näytetään perusteluineen ennen hyväksyntää.
- **Tunnisteen yhdistäminen ja nimeäminen.** Tarjoa ensin esikatselu tekstin tunnisteista, alkutietojen tageista, tunnistussäännöistä sekä nimen varaan rakentuvista näkymistä ja kaavoista. Näytä muuttuvien tiedostojen määrä, yksi ennen/jälkeen-esimerkki ja mahdolliset törmäykset. Testaa kaksi vanhaa tunnistetta samassa muistiinpanossa, samanniminen tavallinen sana ja koodiesimerkki. Yhdistämisen tuloksessa on yksi tunniste. Emilin oman tekstin ja tunnisteiden muuttamiseen tarvitaan rajattu hyväksyntä. Tunnisteen tärkeysjärjestys ja uusiutumisväli ovat erillisiä ominaisuuksia. Kokeile molemmat vanhan Asiat-kohteen rinnalla ennen karsintaa.
- **Linkitys kirjoittaessa:** seuraa vakausarvion kohtaa 6, jossa ovat oikotie, lähdetekstin taivutus, uuden kohteen nimeäminen ja samannimisten kohteiden erottaminen. Paikallisen graafin ensisijainen yhteys on nimenomainen wikilinkki. Jos käyttäjä haluaa nähdä myös yhteisen tunnisteen, tee se valinnaiseksi näkymäkerrokseksi. Koe: kahdella kohteella on sama tunniste mutta ei wikilinkkiä; näyttö voi yhdistää ne katkoviivalla ja kertoa yhteisen tunnisteen, takaisinlinkkiluku pysyy nollassa. Hyödynnä samaa hakemistoa, näytä kohteet myös luettelona. Testaa tiheä tunniste ja nykyinen solmuraja ennen laajempaa graafia.
- ~~**Automaattiset sanalinkit (Emil 23.11.2026).**~~ Tehty 0.70. Projektin kytkin ohjaa pelkistä tekstiosumista syntyviä linkkejä luku- ja muokkaustilassa. Wikilinkit säilyvät käytössä. Valinta säilyy uudelleenavauksessa ja koskee valittua projektia. Testi `selain_70.py`.
- **Tietokoneen rinnakkaisnäkymä** (TILA-tiedoston ehdotus): kokeile listan ja avoimen muistiinpanon näyttämistä rinnakkain. Säilytä sama editori, haku ja valittu rivi. Avaa kolme muistiinpanoa peräkkäin, palaa linkistä takaisin, pienennä ikkuna puhelinkokoon ja palauta. Hyväksy, jos luonnos, valinta ja vieritys säilyvät eikä pieni näyttö saa ylimääräistä palkkia. Kokeilupalautteen jälkeen päätetään, onko asettelu oletus.

### 8. Liitteet, Notion-tuonti ja vanhojen toimintojen karsinta (D, kohdat 3, 4, 5 ja 14)

**Liitteet → ensimmäiseksi yksityisen testikuvan lukeminen.** Käytä testivaultissa yhtä paikallista kuvaa, ääkkösiä ja välilyönnin sisältävää polkua sekä puuttuvaa tiedostoa. Avaa kuva muistiinpanosta pyynnöstä samoilla Vault-oikeuksilla. Näytä nimi ja lataustila; puuttuvasta kohteesta pääsee takaisin tekstiin. Älä upota avainta kuvaosoitteeseen tai hae yksityistä kuvaa ulkoisen kuvapalvelun kautta. Vapauta tilapäinen kuva muistista suljettaessa. Seuraava kokeilu on yhden liitteen lisäys esikatselulla: samanniminen tiedosto, keskeytys sekä tapaus, jossa vain liite ehtii tallentua. Nykyinen ZIP kattaa sovitut tekstit eikä kaikkia binäärejä. Kokeile palautusta kuvineen erilliseen testikansioon ennen kattavamman varmuuskopion lupaamista. **Päätös:** sallitut liitelajit, kokoraja, hakemisto ja varmuuskopion kattavuus.

**Notion → palautettava koetuonti.** Lähtöaineistona keinotekoinen vientipaketti, jossa kaksi samannimistä sivua, alisivu, taulukon kenttä, sisäinen linkki ja liite. Tee ensin vain raportti: lähteen tunniste, ehdotettu Vault-polku, kenttä- ja tunnistevastaavuus, ratkaisemattomat viitteet ja aineisto, jolle ei ole vastinetta. Rakenna tunniste–polku-kartta ennen linkkien muuntamista. Tarkista otsikot, kappaleet, luettelot, linkkien näkyvät nimet ja tiedostojen lukumäärä. Sama paketti kahdesti tuottaa saman tuloksen; käyttäjän sillä välillä tekemä muutos vaatii vertailun. **Päätös:** Emil valitsee ensimmäisen oikean kokoelman, kohdekansion ja säilytystarkkuuden raportin perusteella. Tuonti on erillinen pyydettävä työ. Vaultin huolto tapahtuu edelleen pyynnöstä.

**Karsinta → korvaavuuden osoitus.** Tee testivarmuuskopiosta luettelo vanhoista puista, pikamuistiinpanoista ja käytössä olevista Asiat-lisäosista. Näytä kullekin säilytyspaikka ja toimiva jatkoreitti. Kokeile erityisesti listojen kierroksia, tunnisteiden tärkeyttä ja toistuvuutta. Testaa Koko appi -JSONin palautus toisessa selainprofiilissa sekä Vault-ZIPin tiedostot. Laitteen osion piilottaminen on palautettava välivaihe. Oikean aineiston siirto ja Juuresta periytyvän osion poisto toteutetaan vasta Emilin hyväksymässä laajuudessa.

### 9. Tietokantanäkymä ja oikea aikajana (kohdat 21 ja 22, Emil 23.11.2026)

Emilin tarkentama järjestys:
1. Ensimmäinen julkaisu: Muistion kentän muokkaus ja näyttötavat (21.1–21.2, rajaus yllä).
2. Myöhemmin korjaussuunnitelman kohta 4 (näyttönimi ja kenttänimi erikseen), koska 21.2 tarvitsee sitä.
3. Jäljellä olevat 21.1–21.2:n työnkulut, 21.5–21.6 ja 21.3–21.4, sitten 21.7–21.8. Kojelaudan kenttäkortit suunnitellaan tämän jonon kohdan 3 mukaan. Nopeus (21.9) mitataan jokaisen vaiheen yhteydessä.
4. Aikajanalta 22.1 heti, kun nimi on päätetty. Sen jälkeen 22.2–22.4 omana ketjunaan tietokannan rinnalla.

Laajennuksissa asiaan liittyvät avoimet päätökset tarkistetaan `TILA.md`:stä.

### 10. Timantin nostaminen, löytäminen ja uudelleenlukeminen

*Suunnitteluehdotus kokeiltavaksi.* Aloita yhdestä kokonaisesta lukukierroksesta. Hyödynnä kohdan 7 linkkejä ja kohdan 1 yhteisiä näkymiä. Ensimmäisen kokeen voi tehdä nykyisessä Muistiossa ennen laajaa tietokantanäkymää tai aikajanaa. Alla oleva esimerkki on keksittyä testiaineistoa.

1. **Nosta yksi ajatus ja löydä se toisella laitteella.** Tee testiholviin kaksi eri aiheista lähdettä, esimerkiksi retken varasuunnitelma ja kokouksen varahenkilö. Kokeile niistä syntyvää lausetta ”Varasuunnitelma on käyttökelpoinen vasta, kun joku tietää, milloin siihen siirrytään.” Käytä ensin nykyistä muistiinpanoa, lähdelinkkejä, tunnistetta ja tallennettua näkymää. Kokeile sekä kokonaisen muistiinpanon nostoa että yhtä virkettä pitkästä tekstistä. Jälkimmäisessä säilytä virke ja paluureitti alkuperäiseen tekstiin. Lähtötilassa mukana on myös tekoälyn perustelema ehdokas ja käyttäjän oma nosto. Lukija erottaa kummasta on kyse. **Valmis kokeiltavaksi**, kun käyttäjä löytää itse nostamansa, vielä vailla takaisinlinkkejä olevan ajatuksen tyhjällä paikallisella välimuistilla ja voi perua noston alkuperäisen tekstin säilyessä.
2. **Lue, seuraa lähdettä ja palaa.** Näytä ensin ydinlause ja sen alla lyhyt vastaus kysymykseen ”Miksi nämä kuuluvat yhteen?” Avaa lähde käyttäjän valinnasta. Säilytä palatessa ajatus, vierityskohta ja kohdistus. Tee rinnakkainen vaalea ja tumma esikatselu samalla pitkällä aineistolla. **Hyväksymiskoe:** 320 ja 390 pikselin leveydellä sekä tietokoneella lukija käy kahdessa lähteessä ja jatkaa samasta kohdasta myös suurennetulla tekstillä. Tyhjä kokoelma ja kadonnut tai arkistoitu lähde saavat ymmärrettävän esityksen.
3. **Jätä viidenneltä lukukerralta uusi sovellus.** Lukija voi liittää ajatukseen omin sanoin esimerkin, rajauksen, vastaväitteen tai käyttökokemuksen. Kokeile ensin tavallista linkitettyä muistiinpanoa ja näkyvää kirjoittajatietoa. **Hyväksymiskoe:** tekoäly ehdottaa väitettä, käyttäjä tarkentaa sitä ja uudessa istunnossa toinen lukija löytää molemmat sekä näkee, kenen sanoja kumpikin on. Kokeile keskeytystä, verkkokatkoa ja rinnakkaista muutosta. Käyttäjälle näkyy, odottaako oma jatko vielä siirtoa holviin. Pelkkä lukukerta saa päättyä ilman toimenpidettä.
4. **Anna tutun ajatuksen nousta uudessa yhteydessä.** Ensimmäinen rajattu koe on käyttäjän avaama ”Mikä auttaisi tässä?” käsillä olevan aiheen yhteydessä. Vertaa aiemmin nostettua, perustellusti aiheeseen sopivaa ajatusta ja tuoretta vähälinkkistä ehdokasta. Näytä lyhyt peruste sekä reitti lähteeseen. Salli ohitus. Kokeile myös tilanne, jossa sopivaa ehdotusta ei ole. **Hyväksymiskoe:** käyttäjä ymmärtää, miksi ajatus tuli juuri tähän, voi jatkaa työtään samasta kohdasta ja löytää ehdotuksen myöhemmin tietoisesti. Vertaa tätä omaan Timantit-näkymään ennen automaattisten pintojen laajentamista.

**Mitä kokeesta kirjataan.** Löytyikö ajatus ilman alkuperäisen keskustelun tai tiedostonimen muistamista? Mikä uusi sovellus, kysymys tai vastaesimerkki toisella lukukerralla syntyi? Missä kohdassa käyttö sotki ajatuksen kulun? Jos jatkoksi syntyy kokeilu, palaa sen tulokseen alkuperäisestä ajatuksesta. Näitä voi arvioida yhdellä kuvatulla käyttökerralla ilman pysyvää lukuseurantaa. Käyttökokeen jälkeen päätetään, mitä kannattaa nopeuttaa omalla napilla, tarvitaanko yleistä painoarvoa ja milloin appi saa ehdottaa paluuta oma-aloitteisesti.

### Päätökset kokeilun jälkeen

Vie Emilille kerrallaan sen työvaiheen tulos, jota päätös koskee: kaksi konkreettista vaihtoehtoa samalla testiaineistolla, kummankin vaikutus nykyiseen käyttötapaan ja mahdollinen vaikutus Vault-tiedostoihin. Kirjaa vastaus kyseiseen alkuperäiseen suunnitelmakohtaan. Jos päätös jää avoimeksi, jätä kokeilu nimettyyn haaraan ja jatka seuraavaa ennestään valtuutettua työtä.

## Pohdittavat (alkuperäiset avoimet kysymykset; tarkennukset yllä)

- **Flow tekstinä** (kohta 7 kokeilee): tarkka muoto (sisennetty luettelo vs. muu), miten haarat, ehdot (tunnisteet ja kentät) ja tulokset kirjoitetaan; vaatii Emilin päätöksen kokeilun jälkeen. Ks. myös kohta 23: Flow voi myöhemmin muuntua kaavioksi.
- **Kojelauta-rakentajan yksityiskohdat** (kohta 13): korttien tyylit, kosketus, puhelinasettelu.
- **Kojelaudan kuvaajien ulkoasuasetukset** (nykyinen 0.7-kojelauta).
- **Listat suhteessa vaultiin:** tehtävärivit `- [ ]` vai `projektit/`-kansio vai tunniste + kenttä `tila`.
- **Tunnistussanat:** ratkaistu v1:ksi kohdassa 15 (`pohjat/tunnisteet.md`).
- **Kuvat ja liitteet** vaultissa (Notionista irtautuminen).
- **Notion-sisällön siirto** vaultiin pala kerrallaan.
