# Omat palikat, avoimet yhdistelmät ja kokoelmat

F16–F18; käyttäjän päätökset D03/D04 sekä [ketjukohtainen päivittyminen](02-ketjujen-lukitus.md). Tämä on toteutussuunnitelma. [Periaatteet](00-periaatteet.md).

## Oma palikka (F16)

**Tarkoitus:** rakentaja tekee toimivasta palikkaryhmästä uudelleenkäytettävän rakennusosan. Se voi sisältää vain logiikkaa, vain käyttöpinnan tai molemmat. Esimerkit: työ/tauko-ajastin, pisteytettävä kysymys, määräpäiväkortti. Omaa sisältöä voi aina katsoa.

**Rakentajan polku:** valitse ryhmä → Tee oma palikka → nimeä julkiset syötteet, tulokset, ominaisuudet ja tapahtumat → tallenna kirjastoon. Esiintymän paneeli näyttää nämä samalla tavalla kuin nykyisissä palikoissa. Avaa sisältö siirtää mallin sisään. Kaavat ja Kaavan tulokset säilyvät näkyvinä siellä, eivät muutu koodikatkelmaksi.

**Mallin ja esiintymän ero:** mallilla pysyvä `templateId` ja revision tunniste; sisäisillä palikoilla pysyvät tunnisteet. Esiintymällä `instanceId`, malliviite, julkiset sidonnat ja oma käyttötieto. Sisäisen palikan täydellinen identiteetti muodostuu esiintymäpolusta ja sisäisestä id:stä. Sama sisäinen Muisti kahdessa esiintymässä ei ole yhteinen. Julkisten asetusten eri arvot eivät ole mallista irrottamista.

### Automaattinen päivitys (D03)

Yhteisen mallin hyväksytty muutos päivittää kaikki siihen sidotut esiintymät automaattisesti. Tässä ei ole aiemmin ehdotettua pakollista esiintymäkohtaista päivityshyväksyntää. Näytä vaikutusluettelo ja mitä muuttui, mutta älä muuta sovittua päivitystä manuaaliseksi version valinnaksi.

Säilytä esiintymän käyttötieto ja julkisten syötteiden sidonnat pysyvien sisäisten tunnisteiden perusteella. Älä nollaa kaikkea tai sitoa poistetun portin arvoa toiseen samannimiseen porttiin. Poistettu julkinen portti saa saman vaikutusvaroituksen ja katkenneen viitteen käsittelyn kuin muukin poisto. Rekursiivinen mallisykli on havaittava virhe, ei ikuinen laajennus.

Käynnissä olevan suorituksen uusiin vaiheisiin päivitys vaikuttaa sen oman lukitustilan mukaan: live käyttää uutta tulevaa mallia, lukitut kuvaansa. Uusi suoritus käyttää uusinta määrittelyä. Jo käynnistettyä odotusta/efektiä ei uusita.

### Yhden esiintymän irrottaminen (D04)

Valitse esiintymä → Irrota omaksi versioksi. Luo uusi mallin identiteetti ja kopio määrittelystä, pidä esiintymän käyttötieto ja ulkoiset sidonnat. Sen myöhempi sisämuokkaus ei muuta alkuperäistä mallia. Muuten sisämuokkaus on yhteisen mallin muokkaus ja vaikuttaa kaikkiin sen esiintymiin. Näytä editorissa koko ajan selkeästi, kumpaa mallia muokataan ja kuinka monta esiintymää siihen on sidottu.

Irrotus ei luo piilotettua paikallisten yliajojen kerrosta. Mahdollinen irrotetun mallin uusi nimi tai hyllyyn tallennus on tavallinen näkyvä valinta. Automaattista takaisin yhdistämistä ei luvata.

**Kokeet:** kaksi esiintymää eri muisteilla; yhteinen muutos molempiin; julkinen asetus vain yhteen; irrotus ja sen jälkeen yhteinen päivitys vaikuttaa vain yhä sidottuun; sisäisen nimen vaihto säilyttää tilan; portin poisto näyttää vaikutukset; sisäkkäiset esiintymät; live/lukittu ketju mallipäivityksessä; vienti/tuonti sisältää tarvitut määrittelyt.

## Avoimet valmiit yhdistelmät (F17)

Näiden tavoite on säästää rakentajan työtä ilman uutta rinnakkaista moottoria. Pikaluonti tuottaa tavallisia palikoita tai avattavan oman palikan.

| Tarve | Toteutus nykyisellä tai suunnitellulla yleisellä perustalla | Näkyvä hyväksymiskriteeri |
| --- | --- | --- |
| Ennätys | Muisti + SUURIN/PIENIN + Aseta. Jo nykyinen linjaus. | Huonompi tulos ei syrjäytä ennätystä. |
| Painallushetken arvo | Painettu → Aseta Muistiin lähteen arvo. | Myöhempi syötteen muutos ei muuta talteen otettua. |
| Ehdotus/vahvistus | Laskettu ehdotus ja erillinen vahvistettu Muisti/kenttä. | Ehdotuksen muutos ei itsessään kirjoita päätöstä. |
| Suunniteltu/toteutunut | Kaksi kenttää, tiedossaolo ja erotuksen Kaavan tulos. | Puuttuva toteuma ei ole nolla tai epäonnistuminen. |
| Vaiheistus | Vaiheen Muisti, ehdot, ketjut ja sallittujen siirtymien esitys. | Laiton siirtymä ei onnistu; syy näkyy. |
| Porrastettu kertymä | Kynnysten osuudet, kaavat ja ikkunakooste. | Raja-arvot ja osittain kynnyksen ylittävä määrä oikein. |
| Paras vaihtoehto | Samat laskut vaihtoehdoille, suurin/pienin sekä voittajan tunniste. | Tasatulos ja perustelut näytetään. |
| Seuraava sopiva kohde | Rivien suodatus, järjestys ja ensimmäinen. | Ei soveltuvaa kohdetta on tyhjä tulos, ei satunnainen. |
| Riippuvuudet ja kertymä | Riviyhteydet, lasten tilat, JA tai kooste; tarvittaessa yleinen järjestysalgoritmi. | Syklit havaitaan; syy aloituksen estolle näkyy. |
| Jäähyaika, paluuehto, voimassaolo | Viimeinen tapahtuma, aika ja ehdot. | Avaus tarkistaa vanhentuneet ehdot ilman taustatyölupausta. |

Jos olemassa olevista palikoista muodostettu yhdistelmä käy kohtuuttomaksi (esim. suuren riippuvuusverkon järjestäminen), uusi yleinen operaatio voi olla perusteltu. Dokumentoi tarve ja vähintään kolme sovellusta ennen kovakoodausta. Älä tee erillistä "palkkalaskuri", "kertauskorttimoottori" tai "pelin tila" -peruspalikkaa vain yhden projektin vuoksi.

## Kokoelmat ja nosto ilman palautusta (F18)

**Tarkoitus:** järjestetty joukko kohdeviitteitä, nosto ilman toistoa sekä saman määrittelyn itsenäiset yksilöt. Sovelluksia kysymykset, kohteiden kierrätys, tavarajonot ja peliesineet.

**Malli:** järjestetty lista säilyttää järjestyksen ja tarvittaessa saman kohteen useita esiintymiä; joukko säilyttää jäsenyyden ilman kaksoisjäseniä. Näitä ei sekoiteta. Operaatiot: lisää, poista, kuuluu, määrä, yhteiset jäsenet, järjestä, sekoita, ota ensimmäinen/nosta. Kokoelman jäsen on pysyvä viite tai nimenomaisesti kopioitu esiintymä.

**Arvonta:** hyödynnä nykyistä Satunnaislukua/Arpaa ja samaa injektoitavaa `ctx.rand`-lähdettä. Painojen laskenta on jatkuvaa laskentaa; varsinainen nosto on tapahtuma ja talletettu tulos. Ei palautusta -tilassa valittu jäsen poistuu nostettavasta joukosta. Tyhjä pakka antaa tyhjä/valmis-tapahtuman; uudelleensekoitus on nimenomainen asetus/toiminto, ei hiljainen oletus. Paino 0 ei valikoidu, negatiivinen paino on virhe, kaikkien painojen summa 0 on määritelty ei tulosta -tila.

**Dynaaminen esiintymä:** Luo määrittelystä tuottaa uuden id:n ja oman tilan (F16). Tuhoa esiintymä käyttää viitetarkistusta; esityksen piilottaminen ei tuhoa tietoa. Perusmallin ja esiintymän historia eroavat, vaikka nimi ja kuva ovat samat. Satunnaissiementä/nostojärjestystä voidaan tallentaa, jotta jatkaminen ei tarjoa uutta tulosta jo ratkaistuun tapahtumaan.

**Kokeet:** N nostoa käy N jäsentä kerran; jatko tallennuksesta säilyttää järjestyksen; kaksi saman mallin yksilöä säilyttävät eri tilan; joukon duplikaatti ja listan sallittu duplikaatti eroavat; nollapainot ja tyhjä lähde; kaavojen uudelleenpiirto ei arvo uudestaan. Sääntöjen ei tarvitse tietää kortista tai olennosta.
