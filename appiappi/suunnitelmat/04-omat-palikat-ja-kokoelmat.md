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

## Suosikit ja presetit (F26, Emilin idea 16.10.2026)

Emil hyväksyi 16.10.2026 tekoälyn suositukset (D11–D13). Toteutettu 17.10.2026 (Appi-appi 22), ks. kohta Toteutus.

### Suosikit (D11)

Palikkavalikon ylimpänä ryhmä **Suosikit**, jos siinä on yksikin palikka; tyhjänä sitä ei näytetä, joten peruskäyttö ei muutu. Palikan saa suosikiksi tähdellä (valikossa palikan rivillä) ja pois samasta tähdestä. Koskee sekä logiikka- että käyttöpuolen palikoita, myös tulevia presettejä.

- Emil valitsee suosikit itse. Ei automaattista "eniten käytetyt" -listaa (ei suosituimmuusjärjestystä). Järjestys on lisäysjärjestys; siirto ylös/alas tarvittaessa myöhemmin.
- Suosikit eivät kuulu projektiin: ne pätevät kaikissa projekteissa. Tallennus selaimen muistiin omalla versioidulla avaimella, mukana varmuuskopiossa (vienti/tuonti).
- Poistettu tai tuntematon palikkalaji suosikeissa ohitetaan hiljaa, ei virhettä.

### Presetit (D12, D13)

**Tarkoitus:** mikä tahansa valittu palikkajoukko, logiikka ja käyttöpinta yhdessä tai erikseen, tallennetaan nimettynä presettinä hyllyyn ja liitetään mihin tahansa projektiin. Ei kokorajaa. Presetti ei ole projekti eikä kuulu projektiin.

**Polku:** valitse palikat → *Tallenna presetiksi* → nimi. Palikkavalikossa ryhmä **Presetit** (kuten suosikit, näkyy vain kun hyllyssä on jotain). Napautus liittää presetin nykyiseen projektiin. Hyllyssä: nimeä uudelleen, poista (vahvistus), korvaa nykyisellä valinnalla.

**Irtokopio (D12):** liittämisen jälkeen palikat ovat tavallisia palikoita, joita voi muokata vapaasti. Presetin myöhempi muutos ei koske jo liitettyjä kopioita. Ylläpidettävä, päivittyvä malli on eri asia: Oma palikka (F16, D03/D04). Myöhemmin voi tulla toiminto *Tee presetistä oma palikka*, ei nyt.

**Perusta:** nykyinen kopiointi ja liittäminen (`copyNodes`/`pasteNodes`, osio *Kopiointi ja liittäminen*). Presetti on käytännössä nimetty, pysyvä leike. Puuttuu:

1. **Käyttöpuolen palikat toiseen projektiin.** Nyt liitettäessä toisesta projektista käyttöpuolen palikat jäävät pois (ne liitetään vain samaan projektiin samaan palikkaan). Presetti luo ne uusina: uudet tunnisteet, nimet ja asettelu, ja niiden väliset sekä logiikan viittaukset osoittavat uusiin. Sijainti: nykyiseen näkymään/sivulle, alkuperäiset suhteelliset paikat säilyttäen.
2. **Ulkoiset viittaukset.** Viittaus palikkaan, joka ei ole presetissä, katkeaa (nykyinen toisen projektin sääntö). Liittämisen jälkeen näytetään lista *Kytke nämä*: mikä palikka ja mikä kohta viittasi minkä nimiseen puuttuvaan. Katkenneet viitteet näkyvät kuten D08:ssa. Ei arvata samannimistä kohdetta automaattisesti.
3. **Nimet:** samannimiset nimetään automaattisesti uudelleen (nykyinen `uniqueName`).
4. **Resurssit:** kuvat ja muu presetin palikoiden tarvitsema sisältö kulkee presetin mukana.
5. **Hylly:** tallentuu mukana palikoiden lajit ja tallennusversio; liitettäessä vanha muoto korjataan samalla `repair`-polulla kuin projektit.

**Säilytys (D13):** selaimen muisti omalla versioidulla avaimella (ei projektin sisällä) ja mukana varmuuskopiossa sekä erillisenä vientinä/tuontina tiedostona. Ei `master-tiedot`-tallennusta tässä vaiheessa.

**Käyttötieto:** presetti tallentaa rakenteen ja asetukset, ei käyttötietoa (muistien arvot, taulukon rivit). Sisältö (esim. taulukon valmiit rivit) ei kulje oletuksena mukana, mutta sen voi valita mukaan (Emilin päätös 17.10.2026).

**Kokeet:** suosikin lisäys/poisto säilyy uudelleenavauksessa ja näkyy toisessa projektissa; tyhjä suosikki-/presettiryhmä ei näy; presetti, jossa logiikkaa ja käyttöpintaa, toiseen projektiin, kaikki viittaukset osoittavat uusiin ja käyttö toimii; ulkoinen viittaus näkyy *Kytke nämä* -listassa eikä sitoudu samannimiseen; kaksi liitäntää samaan projektiin ovat toisistaan riippumattomia; presetin muutos ei muuta aiemmin liitettyä; varmuuskopio sisältää hyllyn ja suosikit; vanha varmuuskopio ilman niitä latautuu; puhelinleveydet 390 ja 320 px.

### Toteutus 17.10.2026 (Appi-appi 22)

Koodi: moottorin osio *F26: presetit* (`presetSet`, `presetNeeds`, `presetMake`, `presetPaste`) ja käyttöliittymän osio *F26: suosikit ja presetit*. Kokeet: `testit/logiikka_56_presetit.js`, `testit/selain_63_presetit.py`.

Ratkaisut ja poikkeamat suunnitelmasta:

- **Tallennuspaikka:** `Dt.suos` ja `Dt.presetit` koko tallennuksessa projektien rinnalla (sama selaimen avain kuin projekteilla ja lapuilla), ei erillistä avainta. Projektien ulkopuolella, varmuuskopiossa mukana, ei GitHubiin. Vanha tallennus ilman niitä kelpaa (`repairData`).
- **Tähti:** ei tähteä jokaisessa sirussa, vaan muokkaustila *Valitse suosikit*, jossa sirut saavat ☆/★-merkin. Peruskäyttö ei muutu. Suosikit näkyvät omalla puolellaan (näkymän palikat Näkymä-paletissa, logiikan Logiikka-paletissa), koska palikka pudotetaan aina oman lajinsa kanvaasille. Suosikiksi kelpaavat paletin lajisirut (ei projektin omia palikoita eikä Pikaluontia).
- **Joukko:** valinta näkymästä, logiikasta tai yksittäinen palikka. Mukaan tulevat myös palikan kaikki logiikan solmut ja ikkunan sisältö. Tallennusikkuna listaa ulkopuoliset viittaukset ja nuolet; *＋ Ota mukaan* lisää palikan joukkoon. Näkymää ja logiikkaa ei voi monivalita yhtä aikaa, joten yhdistelmä kootaan ikkunan *Ota mukaan* -napeilla.
- **Ulkoiset viittaukset:** liitettäessä uudet tunnisteet poistettujen muistiin (`P.pois`), joten ne näkyvät D08:n tapaan katkenneina, ja *Kytke nämä* -lista vie palikkaan, jonka Viitevirheet-kohdasta valitaan kohde. Nuolet ulos eivät siirry, ne luetellaan. Merkkijonoarvot, jotka eivät ole palikoiden tunnisteita (esim. käyrän valmismuoto), säilyvät.
- **Sisältö:** taulukon nykyiset rivit tallentuvat lähtöaineistoksi, muistin arvo käyttötiedoksi; riviviitteet osoittavat uusiin, ulkopuoliset pudotetaan. Muu käyttötieto (listat, aikajana, painallukset, kortin tila) ei siirry.
- **Paikka:** näkymän palikat säilyttävät keskinäiset paikkansa, nykyiseen näkymään ja aktiiviseen kerrokseen, päällimmäisiksi; logiikka näkyvän alueen vasempaan yläneljännekseen tai, jos logiikka ei ole näkyvissä, olemassa olevan alle. Kumoa poistaa liitetyt palikat.
- **Ei tehty:** raahaus paletista (vain napautus), suosikkien järjestäminen, esikatselu, GitHub/`master-tiedot`, *Tee presetistä oma palikka*.
