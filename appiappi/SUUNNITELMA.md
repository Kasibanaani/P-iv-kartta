# Appi-appi: itsenäinen kehityssuunnitelma

Päiväys 16.10.2026. Tämä suunnitelma ja sen alidokumentit kirjoitettiin Emilin pyynnöstä keskustelun, Appipajan ideakirjaston ja erillisappien lähdekoodin perusteella. **Tässä työssä muutettiin vain dokumentaatiota.** Suunnitelman ominaisuudet eivät ole tällä perusteella toteutettuja. Suunnitelma ei ole yleinen rakennuslupa.

## Aloita tästä ilman aiempaa projektimuistia

1. Lue repon `AGENTS.md`, tämän appin [missio](MISSIO.md), `TILA.md` ja [periaatteet](suunnitelmat/00-periaatteet.md).
2. Katso alla olevasta rekisteristä pyydetyn työn tunniste ja lue sen tarkka dokumentti.
3. Lue [toteutuspolku](suunnitelmat/07-toteutuspolku.md). Tarkista tarvittava nykykoodi karttatyökalulla ja nykyiset testit. Älä oleta dokumentoidun puutteen olevan yhä puute.
4. Toteuta vain käyttäjän pyytämä vaihe. Tee tavalliset tekniset valinnat itse näiden periaatteiden mukaan; kysy vain, jos ratkaisu muuttaisi päätettyä toimintaa tai uutta merkittävää käyttäjävalintaa ei voi johtaa ohjeista.
5. Tarkista hyväksymiskriteerit, vanhat projektit, vienti/tuonti sekä sopivat selainleveydet. Päivitä todellinen tila, ei pelkkää tavoitetta.

## Missio ja tuleva manuaali (16.10.2026)

[MISSIO.md](MISSIO.md) kokoaa käyttäjän tarkoituksen, legovertauksen, johdonmukaisen rakennuskielen, kevyen rakentamisen ja vakaan loppukäytön sekä antaa kehitysehdotuksille arviointitavan. Se ei lisää ominaisuuksia eikä muuta aiempia täsmällisiä päätöksiä. [Manuaalin tehtävänanto](suunnitelmat/08-manuaalin-tehtavananto.md) suunnittelee tulevan kattavan ihmiselle ja tekoälylle sopivan ohjeen. **Varsinaista manuaalia ei ole tässä työssä kirjoitettu.** Rajattu korjaustyö ja kokonaisuutta arvioiva suunnittelutyö käyttävät lähteitä eri laajuudella; tehtävänanto määrittelee kummankin lukutavan.

## Aineisto ja nykytilan tarkistus

- Repo `Kasibanaani/P-iv-kartta`, Appi-appi `appiappi/`. Toteutus on yksi HTML-tiedosto, jossa `KK`-moottori ja käyttöliittymä ovat omissa skripteissään. Moottorissa `VER`, `repair` ja `repairData` vastaavat tallennuksen yhteensopivuudesta.
- Tarkistushetken päähaara: `ba7c69cc8574e87db1dd5f132006f2b9ac363197`; Appi-appi 10; moottorin tallennusversio tarkistetussa koodissa 8. Nämä ovat eri numerointeja. Hae aina tuore versio ennen toteutusta.
- Appi-appi 9–10 on jo tuonut Kerros- ja Kamera-palikat, kerrosten näkyvyyden ja kosketussuojan, Sekuntikellon, Monitorin, efektit ja käyttözoomauksen. Älä rakenna rinnakkaisia vastineita aiemman ideointitekstin perusteella. Tekstien ominaisuusviittaukset on yhä mainittu puutteeksi `TILA.md`:ssä.
- Varsinainen lähdekoodikatselmus kattoi Päiväkartan, Projektikartan, Päätöskartan, Taitokartan, Oppikartan, Viidakkovahdin ja Frisbeegolfin. Vanhojen Master-appin ja Kytköskartan lähdekoodi ja projektit jätettiin tämän suunnitelman ulkopuolelle käyttäjän rajauksen mukaan. Niiden historiaan viittaava vanha dokumentaatio ei ole lupa tutkia tai muuttaa niitä tämän tehtävän vuoksi.
- Notion: [Appipaja](https://app.notion.com/3f6977255eec819ba9b3fe8b4ebb9532), [Appit ja ideat](https://app.notion.com/a9de63adeede43d095bb15f49e9b5f3a), [Ideakirjasto](https://app.notion.com/169978f59d954fccb5ac672612831bfb). Katselmuksessa 158 ideariviä ja 23 rajaukseen kuuluvaa projektiriviä. Nämä linkit ovat alkuperätietoa; alidokumenttien pitää riittää toteutukseen ilman Notionia.

## Päätökset ja niiden asema

**Käyttäjän päätös** tarkoittaa alla nimenomaisesti vahvistettua toimintaa. **Suunnitteluratkaisu** on agentin näiden ehtojen sisällä tekemä konkreettinen tekninen ratkaisu. **Ehdotus** on kehityskohde tai priorisointi, ei väite käyttäjän hyväksymästä toteutusjärjestyksestä tai rakennusluvasta.

| Tunnus | Käyttäjän päätös 16.10.2026 | Tarkka ohje |
| --- | --- | --- |
| D01 | Tallennettu kirjaus säilyttää oletuksena tallennushetken tiedot; rakentaja voi käyttää myös ajantasaista viittausta. | 01, tilannekuvat |
| D02 | Muokkaukset tulevat oletuksena heti voimaan. Erillinen vahvistaminen rakennetaan logiikalla. | 01, muokkaus |
| D03 | Oman palikan yhteisen mallin päivitys päivittyy automaattisesti sen esiintymiin. | 04, malli |
| D04 | Esiintymän voi irrottaa omaksi versiokseen; muuten sisälogiikan muokkaus koskee yhteistä mallia. | 04, irrotus |
| D05 | Tapahtuman mukana kulkeva tieto pysyy tapahtumahetken mukaisena. Tavallinen viittaus lukee ajantasaista arvoa ajantasaisessa ketjussa; lukitustilat täsmentävät tätä. | 01 ja 02 |
| D06 | Koostelaskut lasketaan annetuista arvoista, puuttuvien määrä näytetään; täydellisiä tietoja voi vaatia. | 01, puuttuvat |
| D07 | Virhe ei peru ketjun jo onnistuneita muutoksia. Kaikki tai ei mitään -kokonaisuus on erikseen määriteltävä ominaisuus. | 02, virheet |
| D08 | Viitatun kohteen poistosta varoitetaan, viittaavat kohdat näytetään ja poiston voi perua tai hyväksyä. Jäljelle jäävät katkenneet viitteet näkyvät värillä ja muulla selkeällä merkinnällä. | 01, poistaminen |
| D09 | Ketjussa kolme tilaa: ei lukitusta, ulkopuolisten muutosten lukitus, kaikkien muutosten lukitus. Asetusta voi ohjata logiikalla. | 02, tilat 0–2 |
| D10 | Tilan vaihto vaikuttaa seuraavasta alkavasta vaiheesta ja lukitus ottaa vaihtohetken tilanteen. Jo alkanut vaihe jatkuu. | 02, vaihtaminen |

D09–D10 korvaavat tässä keskustelussa aiemmin ehdotetun kahden tilan ratkaisun ja ehdotuksen, että jokainen käynnissä oleva ketju aina päättyisi vanhalla logiikalla. D08 korvaa ehdotuksen, että poistaminen tarkoittaisi oletuksena pakollista arkistointia. D02 korvaa ehdotetun oletusvahvistuksen.

## Kaikkien 23 kehitysidean rekisteri

Numerot vastaavat alkuperäistä ideointikokonaisuutta. Tila on tarkistushetken suunnittelutila, ei lupaus työn aloittamisesta. Tarkista toteutuma aina uudestaan.

| ID | Kokonaisuus | Nykytilan huomio ja tavoite | Suunnitelma |
| --- | --- | --- | --- |
| F01 | Yhtenäiset ominaisuusviitteet | Rekisteri jo on; tekstipohjien ominaisuudet ja jäljellä olevat aukot täydennetään. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F02 | Tietotaulukko | Uusi yleinen tietorakenne; ei nykyisen Listan uudelleennimeäminen. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F03 | Tämä rivi ja kokoelman käsittely | Sama kaava ja ikkunalogiikka riveille, suodatus, järjestys, haut ja yhteydet. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F04 | Tapahtuman tiedot | Kohde ja tapahtumahetken arvot erikseen ajantasaisista viittauksista. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F05 | Toistuva käyttöelementti | Yksi suunniteltu käyttöryhmä muuttuvan rivijoukon kaikille jäsenille. | [03](suunnitelmat/03-kayttopinta.md) |
| F06 | Puuttuva tieto | Puuttuva, nolla, ei ja viitevirhe erotetaan; vanha logiikka säilyy. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F07 | Sisältö, käyttötieto ja tilannekuvat | Heti vaikuttava muokkaus, tallennushetken kopio ja elävä viite. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F08 | Rakenteinen kirjaushistoria | Aikajana on esitys, historia tietoa; sama tieto moniin näyttöihin. | [01](suunnitelmat/01-tieto-ja-tapahtumat.md) |
| F09 | Aikasarjat ja vertailut | Kaavio ottaa rivejä; laskenta erillään esityksestä. | [03](suunnitelmat/03-kayttopinta.md) |
| F10 | Ajankohdat, aikavälit ja jaksot | Täydennetään nykyisiä päivämäärä- ja aikapalikoita. | [05](suunnitelmat/05-aika-media-ja-liitannat.md) |
| F11 | Kerrokset ja avautuvat paneelit | Kerros-ohjaus jo tehty; täydentävät ryhmä-, leikkaus- ja sijoitusominaisuudet. | [03](suunnitelmat/03-kayttopinta.md) |
| F12 | Käyttöraahaus ja kosketusmuodot | Erillään muokkausraahauksesta; alueen merkitys logiikassa. | [03](suunnitelmat/03-kayttopinta.md) |
| F13 | Suhteellinen ja mukautuva asettelu | Vapaa kanvaasi säilyy; ryhmän rivi/sarake/ruudukko valinnainen. | [03](suunnitelmat/03-kayttopinta.md) |
| F14 | Arvo ja sen esitys | Monitori ja Sekuntikello jo ovat; kenttäesitysten ja valintatapahtumien täydennykset. | [03](suunnitelmat/03-kayttopinta.md) |
| F15 | Tekstin muodostaminen | Sama viitelukija, muotoilu, ehdolliset osat ja koosteet. | [03](suunnitelmat/03-kayttopinta.md) |
| F16 | Omat palikat | Avattava malli, esiintymäkohtainen tila, automaattiset päivitykset ja irrotus. | [04](suunnitelmat/04-omat-palikat-ja-kokoelmat.md) |
| F17 | Avoimet valmiit yhdistelmät | Ennätys, vaiheistus, vahvistus jne. nykyisten palikoiden yhdistelminä. | [04](suunnitelmat/04-omat-palikat-ja-kokoelmat.md) |
| F18 | Kokoelmat, nostot ja esiintymät | Joukot/listat, nosto ilman palautusta ja dynaamiset kohteet. | [04](suunnitelmat/04-omat-palikat-ja-kokoelmat.md) |
| F19 | Media ja piirtäminen | Kuva/kuvasarja/reitti jo ovat; ääni, video ja tallentuva syöte myöhemmin. | [05](suunnitelmat/05-aika-media-ja-liitannat.md) |
| F20 | Tietolähteet ja tuonti | Ensin paikallinen taulukko/CSV/JSON, sitten verkko ja lähetys. | [05](suunnitelmat/05-aika-media-ja-liitannat.md) |
| F21 | Profiilit ja yhteiskäyttö | Paikallinen tietotilan erottelu ennen jaettuja verkkomuutoksia. | [05](suunnitelmat/05-aika-media-ja-liitannat.md) |
| F22 | Testitila ja käytön kumoaminen | Nykyinen rakenteen Kumoa ei ole käyttökumoaminen. | [06](suunnitelmat/06-testit-ja-julkaisu.md) |
| F23 | Luonnos, julkaisu ja käyttäjä-appivienti | Sama moottori; julkaistu rakenne erikseen luonnoksesta ja käyttötiedosta. | [06](suunnitelmat/06-testit-ja-julkaisu.md) |
| F24 | Massa, kimmoisuus ja kitka (Emilin idea 16.10.2026, lisätty rekisteriin myöhemmin) | Törmäys ei nyt siirrä vauhtia eikä este liiku. Massa ja kimmoisuus esineelle, kitka ja töytäisyvauhti Liikkeelle; vanhat projektit ennallaan. Toteutettu Appi-appi 17 (16.10.2026). | [09](suunnitelmat/09-massa-ja-tormaykset.md) |

Ketjujen kolme lukitustilaa ovat lisäksi käyttäjän päätetty täsmennys, joka koskee kaikkia näitä ominaisuuksia: [02-ketjujen-lukitus.md](suunnitelmat/02-ketjujen-lukitus.md).

## Toteutuma

- **P0 (16.10.2026, Appi-appi 11):** nykytila tarkistettu ennen P1a:ta. Tekstipohjat eivät tukeneet `{palikka.ominaisuus}`-muotoa; poisto siivosi viittaukset hiljaa (kaava muuttui puuttuvaksi ja sitoutui samannimiseen uuteen palikkaan). Moottorin tallennusversio edelleen 8.
- **P1a (16.10.2026, Appi-appi 11):** F01 tekstien ominaisuusviite ja D08 poiston vaikutuslista, katkenneiden viitteiden säilytys, Viitevirheet-lista ja uuden kohteen valinta toteutettu. Rajaukset ja tarkistamatta jääneet: `TILA.md`.
- **P1b (16.10.2026, Appi-appi 12):** D09/D10 ketjun kolme lukitustilaa, suorituskohtainen lukukuva ja omat muutokset, vaihto seuraavan vaiheen alussa, näkyvä virhe ja seuranta toteutettu. Tekniset ratkaisut ja poikkeamat: [02, kohta 9](suunnitelmat/02-ketjujen-lukitus.md#9-toteutus-16102026-appi-appi-12); rajaukset `TILA.md`.
- **P2 (16.10.2026, Appi-appi 13):** F02 tietotaulukko, F04 tapahtuman tiedot (D05), F06 puuttuva tieto ja koosteet (D06) sekä F07 tilannekuva ja elävä riviviite (D01). Emilin linjaukset: valittu rivi ja tapahtuman rivi (Rivi-lähde P3:ssa), Tapahtuman tiedot omana palikkana, käyttönäkymässä viitteillä. Ratkaisut ja rajaukset: [01, kohta 9](suunnitelmat/01-tieto-ja-tapahtumat.md#9-toteutus-16102026-appi-appi-13-p2).
- **P3a (16.10.2026, Appi-appi 14):** F03 Rivi-lähde (käsiteltävä, valittu tai tapahtuman rivi), rivikohtainen laskenta omalla välimuistilla, Rivijoukko (suodatus, järjestys, enintään N, ensimmäinen ja viimeinen osuma, koosteet), ikkuna riveille (D06) ja Toista riveille. Emilin linjaukset: P3 pilkotaan, kooste riveistä ikkunalla. Ratkaisut ja rajaukset: [01, kohta 10](suunnitelmat/01-tieto-ja-tapahtumat.md#10-toteutus-16102026-appi-appi-14-p3a).
- **P3b (16.10.2026, Appi-appi 15):** F05 toistuva kortti: Toistin-palikka (rivit nuolesta, kortin malli vetämällä ensimmäiseen korttiin, allekkain/vierekkäin/ruudukko), kortin palikat rivin omalla laskennalla, kortin oma tila riveittäin, kentän sidonta sarakkeeseen ja kortin painikkeen tapahtuma kortin rivillä. Emilin linjaukset: uusi Toistin-palikka, sido sarakkeeseen. Ratkaisut ja rajaukset: [03, F05 toteutus](suunnitelmat/03-kayttopinta.md#toteutus-16102026-appi-appi-15-p3b).
- **P3b-täydennys (16.10.2026, Appi-appi 16):** kentän sidonta riviin (muokkauslomake): tavallinen kenttä sidotaan Rivi-palikkaan ja sarakkeeseen, ilman riviä tyhjä ja harmaa, muutos ei lähetä uutta tapahtumaa. Kortin vanha sidonta on erikoistapaus ja toimii ennallaan. Emilin linjaukset: Rivi-palikka + sarake, tyhjä ja harmaa, ei uutta tapahtumaa. Ratkaisut ja rajaukset: [03, Appi-appi 16](suunnitelmat/03-kayttopinta.md#toteutus-16102026-appi-appi-16-kentän-sidonta-riviin-muokkauslomake).
- **F24 (16.10.2026, Appi-appi 17):** massa, kimmoisuus, kitka ja tönäisy, massalliset törmäykset, törmäsi-tapahtuman kohde ja isku. Ratkaisut: [09, kohta 12](suunnitelmat/09-massa-ja-tormaykset.md#12-toteutus-16102026-appi-appi-17).
- Ryhmittely, rivien yhteydet (vanhempi–lapsi) ja P4 sekä myöhemmät: ei toteutettu.

## Ehdotettu järjestys

P0 nykytilan ja yhteensopivuuden tarkistus → P1 viitteet, poistodiagnostiikka ja ketjun arviointikonteksti → P2 tietotaulukko ja tapahtumat → P3 rivikäsittely ja toistuva käyttöryhmä → P4 historia, aika ja koosteet → P5 omat palikat sekä testitila → P6 laajempi käyttöpinta ja media → P7 liitännät, yhteiskäyttö ja julkaisu.

Järjestys on agentin ehdotus. Pyydetty pienempi ominaisuus voidaan toteuttaa aiemmin, jos riippuvuudet ja yhteensopivuus sen sallivat. Älä tee taustapalvelua, integraatiotunnuksia, testiprojekteja tai julkaisua vain siksi, että ne mainitaan tässä pitkän aikavälin suunnitelmassa.

