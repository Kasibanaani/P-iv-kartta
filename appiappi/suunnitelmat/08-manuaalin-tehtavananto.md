# Tehtävänanto: Appi-apin kattava käyttö- ja toimintamanuaali

16.10.2026. Käyttäjä pyysi tässä vaiheessa **vain manuaalin tehtävänannon ja runkosuunnitelman**. Varsinaista manuaalia, ohjeistavia lukuja, kuvakaappauksia tai esimerkkiprojekteja ei tehdä tämän dokumentin perusteella ilman myöhempää toteutuspyyntöä. Tämä ei muuta sovellusta. [Missio](../MISSIO.md), [suunnitelmahakemisto](../SUUNNITELMA.md).

## 1. Tavoite ja vastaanottajat

Laadi myöhemmässä, erikseen pyydetyssä työssä erittäin tarkka, yhtenäinen suomenkielinen manuaali Appi-apin **todellisesta nykyisestä toiminnasta**. Manuaalin on palveltava kolmea käyttötapaa:

1. Ihminen oppii rakentamaan ja ymmärtää, miten palikat ja niiden väliset suhteet toimivat. Taulukkolaskennan arvot, viittaukset ja kaavat ovat hyödyllinen lähtötaso; aiempaa ohjelmointi- tai pelimoottoriosaamista ei edellytetä.
2. Sovellusta tuntematon tekoäly pystyy antamaan manuaalin perusteella täsmällistä käyttöohjausta keksimättä painikkeita tai toimintoja.
3. Kehitystä suunnitteleva ihminen tai tekoäly pystyy lukemaan manuaalin kokonaan ja arvioimaan uusien ominaisuuksien suhdetta koko toimintamalliin mission perusteella.

Rakennetun yksittäisen appin loppukäyttäjä on erillinen rooli rakentajasta. Manuaali selittää tämän eron. Kunkin projektin sisältökohtaiset käyttöohjeet eivät automaattisesti kuulu rakentamisympäristön manuaaliin.

## 2. Rajaus ja tietojen varmuus

- Valitse työn alussa tarkka lähdekoodin commit ja tarkasteltava appiversio. Muut istunnot voivat muuttaa päähaaraa; manuaalilla on oma dokumentoitu tarkistushetkensä.
- Nykytila todennetaan käyttöliittymästä, moottorista, tallennus-/tuontikäytöksestä ja testeistä. Pelkkä vanha kuvaus tai suunnitteludokumentti ei riitä.
- Kehitysehdotukset, hyväksytyt mutta toteuttamattomat päätökset ja toteutettu toiminta erotetaan. Manuaalin varsinainen ohje kuvaa toteutettua toimintaa. Tulevat asiat voivat näkyä erillisessä rajatussa osassa tilamerkinnöin, eivät nykyisinä painikkeina.
- Havaittu ristiriita kirjataan erikseen: mitä käyttöliittymä lupaa, mitä toteutus tekee ja mikä on tarkistamatta. Älä korjaa koodia tai rakenna puuttuvaa toimintoa saadaksesi ohjeen pitämään paikkansa.
- Käyttöliittymän näkyvät nimet, sijainnit ja tilat ovat täsmällisiä. Selitä ensin käyttäjän toiminta; tekniset sisäiset avaimet sijoitetaan lähdejälkeen tai tekniseen liitteeseen.
- Merkitse mitä on testattu tietokoneen selaimessa ja mitä oikealla kohdelaitteella. Esimerkiksi kosketusemulointi ei todista oikean iPhonen/Safarin tuntumaa.
- Täysi manuaali voi olla laaja. Älä korvaa sitä lyhyellä esitteellä, pelkällä toimintoluettelolla tai raakakoodin selostuksella. Kattavuus ja todennettavuus ratkaisevat, eivät ennalta määrätty sivumäärä.

## 3. Ehdotettu runko

Tämä on tulevan teoksen sisällysluettelon suunnitelma, ei valmiita manuaalilukuja.

| Osa | Sisältö ja kysymys, johon vastataan |
| --- | --- |
| A. Tarkoitus ja lukutavat | Mitä Appi-apilla tehdään, kenelle se on, rakentaja vs loppukäyttäjä, polku aloittelijalle/hakijalle/kokonaisarvioijalle. |
| B. Ensimmäinen kokonaisuus | Pieni itse rakennettava esimerkki, joka opettaa käyttöelementin, viitteen, kaavan, Kaavan tuloksen ja yhden tapahtuman. Ei laajaa erikoiskonseptia ennen periaatteita. |
| C. Työympäristö | Projektit, käyttöpinta, logiikkapinta, rinnakkainen näkymä, valinta, tarkastelija, paletti, haku, zoomaus, kerrokset ja muokkaus-/käyttötila. |
| D. Yhteinen ajattelumalli | Arvo, tietotyyppi, viite, palikan identiteetti ja esiintymä, ominaisuus, kaava, tulos, ehto, ikkuna, tapahtuma, toiminto, ketju ja pysyvä käyttötieto. |
| E. Käyttöpinnan rakentaminen | Ohjaimet, näytöt, kuvat, muodot, sijainnit ja alueet; lisääminen, koko, sijoitus, näkyvyys, käytettävyys, värit ja vuorovaikutus. |
| F. Kaavat, viittaukset ja ikkunat | Luettava viite vs tallennettu yhteys; ominaisuusviittaus; tekstiin upotus; Kaavan tulos; operaatiot, vertailu, totuusarvot ja ikkunakoosteet; syntaksin todelliset rajat. |
| G. Ominaisuuksien ohjaus | Perusarvo, toiminnolla asetettu ja jatkuvasti ohjattu; etusija, palauttaminen, luettavat/ohjattavat ominaisuudet ja ohjausristiriidat. |
| H. Tapahtumat ja ketjut | Laukeaminen vs jatkuva ehto, toimintojen järjestys, haarat, odotus, toisto, rinnakkaiset käynnistykset, ajastus, virheet, pysäytys ja jatkaminen. Lukitustilat vain siinä laajuudessa kuin ne on toteutettu. |
| I. Aika, liike ja kuva | Aikayksiköt, Ajastin, Sekuntikello, Muutos ajassa, Käyrä, Liike, Tatti, kamera, koordinaatit, ruudukko, esteet, alueet, reitit ja kuvasarjat toteutuman mukaan. |
| J. Tieto ja toistuvat rakenteet | Nykyinen Lista/Aikajana/Kaavio/Kalenteri; tietotaulukot, rivikonteksti, historia, kokoelmat ja toistuva esitys ainoastaan jos valitussa versiossa toteutettu. |
| K. Uudelleenkäyttö ja sisältö | Nykyinen kopiointi, pikaluonti ja projektien siirto; omat palikat, yhteiset mallit, irrotus ja sisältöpaketit toteutuman mukaan. |
| L. Valmis käyttökokemus | Rakenteen lukitseminen, sallitut käyttäjämuutokset, aloitus ja paluu, vakaat käyttöpinnat ja eri laitteiden esitykset. |
| M. Tallennus ja siirtäminen | Paikallinen muisti, yksityinen projektitallennus, vienti/tuonti, varmuuskopio, vanha muoto, ristiriidat, resurssit ja tiedon säilymisen rajat toteutuman mukaan. |
| N. Tutkiminen ja ongelmien ratkaisu | Miksi?, Yhteydet, ketjun seuranta, virheet, puuttuvat arvot, katkenneet viitteet, kohdennettu korjaus ja kumoamisen todellinen laajuus. |
| O. Kokonaiset soveltavat esimerkit | Eri käyttötarkoitukset samoilla periaatteilla: esim. pieni laskuri, haarautuva ohje ja ajoitettu vuorovaikutus. Näytä rakentaminen ja selitys, ei pelkkää valmista kuvaa. |
| P. Hakuteos | Palikka-, ominaisuus-, toiminto-, tapahtuma- ja syntaksiviitteet, sanasto sekä tehtäväperusteinen hakemisto. |
| Q. Versio ja tunnetut rajat | Tarkistettu commit, ajankohta, testiympäristö, tunnetut poikkeukset, avoimet havainnot, dokumentin päivityshistoria ja lähdepolut. |

Otsikot ja jako täsmentyvät toteutuksen perusteella. Älä jätä nykyistä toimintoryhmää pois vain siksi, ettei se sovi valmiiseen runkoon. Vastaavasti suunnitellun ryhmän tyhjä otsikko ei todista ominaisuuden olemassaoloa.

## 4. Jokaisen hakuteosmerkinnän tietosisältö

Palikan tai toimintokokonaisuuden merkinnässä kuvataan soveltuvin osin:

- **Nimi ja tarkoitus:** täsmällinen näkyvä nimi, ryhmä sekä mitä operaatio tekee ilman yhden sovelluskonseptin oletusta.
- **Lisääminen ja löytäminen:** työympäristön tila, polku, valinta ja tarvittavat edellytykset.
- **Arvot:** pääarvo ja osa-arvot, tietotyypit, yksiköt, oletukset, rajat sekä tyhjän ja virheellisen syötteen merkitys.
- **Sisään ja ulos:** arvot ja tapahtumat eriteltyinä. Suunta, hetki, toistuvuus ja mahdollinen tapahtumatieto.
- **Ominaisuudet:** käsin asetettavat, luettavat, logiikalla ohjattavat ja tarkoituksella rajatut; etusija ja palautus. Kaikki eivät näy heti paneelissa.
- **Aika ja tila:** jatkuva laskenta vai tapahtuma, mikä säilyy ja kuinka kauan, mitä tapahtuu avattaessa, pysäytettäessä, piilotettaessa tai siirryttäessä toiseen näkymään.
- **Kaava, viite ja Kaavan tulos:** miten samaa tietoa käytetään muualla, mikä on arvo ja mikä käyttöelementin esitys.
- **Yhteensopivuus:** mihin tämä voi kytkeytyä, milloin yhdistelmä on kielletty tai virheellinen, miten usea lähde ratkaistaan.
- **Käyttötilat:** muokkaustilan ja lukitun käytön ero, hiiri/näppäimistö/kosketus sekä todetut laiterajat.
- **Kokeilu ja selitys:** pienin toimiva esimerkki odotettuine tuloksineen, vähintään yksi poikkeava käyttötapa monikäyttöisyyden osoittamiseksi kun se on hyödyllinen, tavallinen virhekäsitys ja korjaus.
- **Lähde ja tarkistus:** määrittelyn, moottorin, UI:n ja testin lähdepolku/ankkuri sekä varmuusmerkintä. Ihmisen päätekstissä ei tarvitse toistaa kaikkia sisäisiä tunnisteita.

Kuvaa myös tärkeät **suhteet**, ei vain palikoita erillään: kaava ja Kaavan tulos, jatkuva ohjaus ja hetkellinen toiminto, ehto ja tapahtuma, palikan määrittely ja esiintymä sekä rakenteen lukitseminen ja käyttötiedon muuttaminen.

## 5. Esimerkkien ja havainnollistamisen vaatimukset

Esimerkkien tulee olla toistettavia tarkistetussa versiossa. Merkitse lähtötilanne, toimet, odotettu näkyvä tulos, arvot ja lyhyt syy. Vertaa tarvittaessa kahta läheistä toimintatapaa yhdellä muuttujalla kerrallaan. Esimerkiksi jatkuva kaavaohjaus ja painalluksesta asetettu arvo havainnollistavat eri käsitettä.

Käytä selkeitä taulukoita yhteensopivuuteen ja ominaisuuksiin; pieniä kaavioita suhteisiin; oikeasta käyttöliittymästä otettuja kuvia tarvittaessa löytämisen tueksi. Kuvien pitää sopia dokumentoituun versioon, niiden rajaus ja teksti säilyvät luettavina. Pelkkä kuvakaappaus ei korvaa toimintaperiaatteen selitystä, eikä kuvan sisäinen teksti saa olla ainoa ohje.

Laitteessa toimiva interaktiivinen esimerkki voi täydentää staattista ohjetta, mutta manuaalin ymmärrettävyys ei saa riippua sen toimivuudesta. Älä tee esimerkkien vuoksi uusia sovellusominaisuuksia. Tiedot ovat keksittyjä, ja esimerkkiprojektit toimitetaan vain pyydetyn työn laajuudessa erillisinä. Yhtä käyttöä suosiva esimerkki ei muuta palikan yleistä määritelmää.

## 6. Työvaiheet varsinaisessa manuaalitehtävässä

1. **Rajaa versio ja vastaanottajat.** Lue missio ja päätökset. Tarkista tuorein tila ja lähdekoodi; valitse dokumentoitava commit. Kirjaa mikä on jo olemassa ja mikä vasta suunnitelma.
2. **Tee kattavuusinventaario.** Kartoita palikkalajit, portit, ominaisuusrekisteri, toiminnot, ikkunat, ketjut, asetukset, projektikäytännöt, käyttötilat ja virheet. Käytä karttatyökalua ja rajattuja lähdelukuja. Koko manuaalitehtävän kattavuus vaatii lopulta koko merkityksellisen toiminnan tutkimisen.
3. **Sovita inventaario käyttäjän polkuihin.** Rakenna toimintokartta sekä käsitteiden riippuvuudet. Valitse johdonmukainen sanasto, kirjaa nykyisen käyttöliittymän poikkeavat nimitykset. Älä keksi yhdenmukaisuutta, jota sovelluksessa ei vielä ole.
4. **Kirjoita yhteiset käsitteet ja merkintäpohjat.** Varmista, että kaikki luvut käyttävät samoja termejä ja erottelevat tilan/tapahtuman, arvon/esityksen sekä määrittelyn/käyttötiedon samalla tavalla.
5. **Kirjoita käyttäjän polut ja hakuteos rinnakkain.** Jokaisella työvaiheella on selitys ja tarvittaessa linkki täsmälliseen hakuteoskohtaan. Jokainen nykyinen toimintoryhmä saa tarkoituksenmukaisen kattavuuden.
6. **Todista ohjeet kokeilemalla.** Suorita ohjeen vaiheet tarkistetussa käyttöliittymässä. Käytä koodia ja testejä merkitysten ja raja-arvojen tarkistamiseen. Kirjaa puuttuva tai virheellinen toiminto havaintona. Ota kuvat vasta oikeista käyttötilanteista.
7. **Tee erillinen kokonaiskatselmus.** Lue syntynyt manuaali kokonaan. Etsi ristiriidat, päällekkäiset käsitteet, selittämättömät poikkeukset, puuttuvat yhteydet ja epäjohdonmukaiset esimerkit. Katselmus voi tuottaa kehitysehdotuksia, jotka eivät sekoitu käyttöohjeeseen.
8. **Tarkista lähdehaarojen muutokset.** Jos toteutus on muuttunut kirjoittamisen aikana, rajaa manuaalin versio selvästi tai tarkista muuttuneet osuudet ennen toimitusta. Älä nimeä vanhaa kuvausta ajantasaiseksi vain päivämäärää muuttamalla.
9. **Toimita lähde, koottu lukumuoto ja kattavuus.** Kerro tarkistetut toiminnot, lähteet, testilaitteet ja avoimet havainnot. Päivitä agentin lukupolku manuaaliin, mutta älä muuta sovelluskoodia ilman erillistä tehtävää.

## 7. Toimitusmuoto ja ylläpidettävyys

Ehdotettu ensisijainen lähde on versionhallittu Markdown-kokonaisuus `appiappi/manuaali/`-hakemistossa: sisällysluettelo, käsiteluvut, tehtäväpolut ja hakuteos. Tämä on tuleva sijaintiehdotus; hakemistoa ei luoda tässä vaiheessa manuaaliksi.

Yhdestä lähteestä tuotetaan tarvittaessa **yksi koottu luettava tiedosto**, jonka tekoäly voi lukea kokonaiskatselmusta varten, ja ihmiselle jaettava HTML- tai PDF-lukumuoto pyydetyn toimituksen mukaan. Erillisiä käsin ylläpidettyjä saman tekstin versioita vältetään. Sisäiset linkit, vakaat ankkurit, sanasto ja tehtävähakemisto tukevat kohdennettua hakemista. Tekninen lähdejälki ja kattavuustaulukko pidetään erillään sujuvasta päätekstistä.

Jokaisessa merkittävässä toiminnallisessa muutoksessa päivitetään vaikutetut ohjeet ja esimerkit sekä merkitään tarkistettu lähdeversio. Muutospäivä ei yksin todista koko manuaalia tarkistetuksi. Osittain päivitetyn manuaalin kattavuus ja vanhentuneet osat merkitään totuudenmukaisesti.

Manuaali ei ole muuttumaton normi toteutukselle: se kuvaa todennettua toimintaa. Missio ja käyttäjän päätökset ohjaavat tarkoitusta. Jos toteutus poikkeaa niistä, se on näkyvä arvioitava ristiriita, ei manuaalissa normalisoitava uusi arvo.

## 8. Hyväksymiskriteerit

- Tarkistettu versio ja käyttöympäristö on yksilöity. Käytössä olevat ominaisuudet ja tulevat suunnitelmat eivät sekoitu.
- Toimintainventaarion jokainen olennainen kohta on ohjeistettu tai sen rajaus on näkyvästi perusteltu. Kattavuustaulukko yhdistää kohdan lukuun, lähteeseen ja tarkistukseen.
- Uusi käyttäjä pystyy seuraamaan ensimmäisen kokonaisuuden ja ymmärtämään sen periaatteet ilman ohjelmointia. Ohjeessa ei ole keksittyjä painikkeita tai ratkaisevia puuttuvia välivaiheita.
- Tekoäly pystyy löytämään täsmällisen menettelyn sekä sen rajat hakemiston avulla; kokonaiskatselmus voi lukea koko sisällön yhtenä koottuna tekstinä.
- Hakuteos kattaa myös tapahtumien ajankohdat, tilan säilymisen, ohjauksen etusijan ja virheet. Pelkkä kenttien nimilista ei täytä vaatimusta.
- Ohjeiden esimerkit on tarkistettu kuvaillulla tavalla. Tietokoneselaimen testin ja oikean laitteen havaintojen ero ilmoitetaan.
- Selitykset ja soveltavat esimerkit säilyttävät mission: monikäyttöiset osat, yhteinen logiikka, kevyt rakentaminen, vakaa käyttö ja luovan soveltamisen tukeminen.
- Linkit ja kuvat toimivat, henkilökohtaisia tietoja ei sisällytetä esimerkkiaineistoon, eikä manuaalin toimittaminen itsessään muuta sovellusta tai käyttäjän projekteja.

## Lyhyt myöhemmin käytettävä tehtäväpyyntö

> Laadi Appi-apin kattava suomenkielinen käyttö- ja toimintamanuaali `appiappi/suunnitelmat/08-manuaalin-tehtavananto.md`-tehtävänannon mukaan. Lue ensin `appiappi/MISSIO.md`, ajantasainen `TILA.md` ja päätöksiä koskevat suunnitelmat. Dokumentoi tarkasti yksilöity todellinen toteutus ja erottele tulevat asiat. Tee sekä ihmiselle opittava kokonaisuus että tekoälyn täsmälliseen ohjaukseen ja koko sovelluksen arviointiin sopiva hakuteos. Todista ohjeet käytännön kokeilla ja lähteillä, toimita kattavuus- ja versiotiedot. Älä muuta sovelluskoodia tai oikeita projekteja manuaalin tekemisen yhteydessä.
