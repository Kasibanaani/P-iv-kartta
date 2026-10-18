# Toiminnot ja tapahtumaketjut

Tämä luku kertoo, miten appi saadaan *tekemään* jotain: Toiminto muuttaa arvoa, tilaa, näkymää tai taulukkoa, kun siihen tulee tapahtuma. Tapahtumaketju (Ketju) on ikkuna, jonka sisällä toiminnot ja odotukset etenevät järjestyksessä viivoja pitkin, myös ajan yli.

Kaksi perusasiaa koko luvun taustalla:

- **Arvo** on tila (”näin on nyt”), esim. säätimen luku tai valintaruudun kyllä/ei. **Tapahtuma** on hetki (”nyt tapahtui”), esim. *painettu*, *NIIN*, *silloin*, *muuttui*, *valmis*.
- Toiminto tehdään vain tapahtumasta. Kaava tai nuoli ei tee toimintoa itsestään, ellei sen arvo vaihdu epätodesta todeksi (ks. Laukaisu).

---

## Toiminto (`tee`)

Toiminto tekee yhden muutoksen kerran, kun siihen tulee tapahtuma. Sen jälkeen se lähettää tapahtuman *sitten*, josta voi jatkaa seuraavaan toimintoon.

- **Löytyy:** Logiikka-välilehti → paletti (puhelimessa alareunan **＋ Palikat**) → ryhmä **Toiminnot** (kaikki 20 lajia omina siruinaan, ikoni ▶). Neljä yleisintä (Aseta arvo, Aseta tila, Käynnistä ketju, Pysäytä ketju) on myös kohdassa **Ketju → Tekemiset**.
  - Pikatie ilman logiikkakanvaasia: valitse näkymän Painike, avaa paneeli ja osio **Kun painetaan** → valikko **＋ Lisää toiminto…** → valitse laji. Appi luo Toiminto-palikan ja nuolen logiikkaan itse. Samanlainen valikko on Valintaruudun ja Kytkimen osiossa **Kun valitaan**, JOS-palikan osioissa **NIIN** ja **MUUTEN**, KUN-palikan osiossa **Silloin**, ikkunan osioissa **NIIN**, **MUUTEN** ja **Läpi**, Kaavan osiossa **Kun tulos alkaa päteä (kerran)** sekä toisen Toiminnon osiossa **Sitten**.
- **Sisään:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| tee kun | tapahtuma | Toiminto tehdään, kun tähän tulee tapahtuma. Jos tähän tuodaan arvo, toiminto tehdään, kun arvo muuttuu epätodesta todeksi. |
| arvo | arvo | Uusi arvo tai määrä nuolesta. Voittaa paneelin kentän. |

- **Ulos:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| sitten | tapahtuma | Lähtee heti, kun toiminto on tehty. Ketjun sisällä tämä on ketjun viiva seuraavaan vaiheeseen. |

- **Asetukset (paneeli), osio Toiminto:**
  - **Käytössä** (rasti). Pois käytöstä oleva toiminto ei tee mitään (ketjussa ketju jatkaa sen ohi).
  - **Toiminto**: valikko, josta lajin voi vaihtaa jälkikäteen.
  - **Kohde**: valikko, johon tulee vain lajille sopivat palikat (Siirry-lajilla otsikko on *Kohde (sijainti, alue tai palikka)*). Rivi *Tapahtuman jäsen* kohdistaa toiminnon jäseneen, jonka tapahtuma sen käynnisti ([Jäsenten tapahtumat](07-tieto.md#jäsenten-tapahtumat-appi-appi-63), Appi-appi 63). Ryhmässä *Joukko (jokainen jäsen)* projektin joukot: toiminto tehdään jokaiselle jäsenelle ja *sitten* lähtee kerran ([Toiminto kaikille jäsenille](07-tieto.md#toiminto-kaikille-jäsenille), Appi-appi 57). Kohteena joukko käy lajeille Aseta arvo, Aseta tila, Lisää, Valitse, Poista valinta, Vaihda, Tyhjennä, Käynnistä ketju, Pysäytä ketju, Palauta perusarvo, Lisää joukkoon ja Poista joukosta.
  - **Mitä muutetaan** (Aseta arvo, Lisää, Aseta tila, Vaihda) tai **Mikä palautetaan** (Palauta perusarvo): näkyy, kun kohteella on ohjattavia ominaisuuksia. Oletus on kohteen oma arvo tai tila; muut rivit ovat ominaisuuksia (esim. leveys, näkyy).
  - Lajin omat kentät (taulukko alla).
  - Ohje paneelin alareunassa: ”Toiminto tehdään, kun siihen tulee tapahtuma (esim. painettu, NIIN, silloin) tai kun siihen tuleva arvo alkaa päteä.”
  - Ketjun ulkopuolella lisäksi osio **Sitten** ja valikko **＋ Lisää toiminto…** seuraavalle toiminnolle.
- **Arvo-kenttä (Uusi arvo, Määrä, Rivi):** yksi kaavakenttä *luku, teksti tai @viite*, esim. `5`, `Valmis`, `@pisteet + 1` ([arvokenttä](06-kaavat.md#arvokenttä-kaava-suoraan-paneelin-kentässä)).
  - Kenttään kelpaa luku (`3`, `1,5`, `-2`), teksti, `kyllä` / `ei`, päivämäärä (`24.12.2026`, `tänään`, `huomenna`, `eilen`) ja teksti, jossa on viittauksia (`@uni`, ks. [Tekstiin upotetut viitteet](06-kaavat.md#tekstiin-upotetut-viitteet)).
  - Valikosta valittu palikka antaa arvonsa toimintohetkellä.
  - **Kenttä ei ole kaava.** Laskettu arvo (esim. `pisteet * 2`) tehdään Kaava-palikalla, jonka nuoli tulee Toiminnon kohtaan *arvo*. Nopein tapa on kentän alla oleva nappi **ƒ Arvo kaavasta** (Appi-appi 39): se tekee Kaavan, vetää nuolen kohtaan *arvo* ja avaa kaavan kirjoitettavaksi. Silloin paneelissa lukee ”Arvo tulee nuolesta.”, eikä nappia enää näy.
  - Poikkeus: **Lisää rivi** -toiminnon sarakekentät ovat oikeita kaavoja (ks. taulukko).
- **Ominaisuudet:** `käytössä` (ohjattava: toiminnon voi kytkeä pois kaavalla tai nuolella). Siirry-toiminnolla ilman kohdetta myös `x` ja `y` (ohjattavat).
- **Aika ja tila:** toiminto ei muista mitään itse. Se kirjoittaa kohteen käyttötietoon, joka säilyy tallennuksessa. Kumoa ei peru toimintojen tekemiä muutoksia (Kumoa koskee rakennetta).

### Toimintolajit

Alla *tyhjä* tarkoittaa, että kenttä on tyhjä eikä kohtaan *arvo* tule nuolta. Virhearvoa (⚠) ei kirjoiteta koskaan: kohde jää ennalleen.

| Toiminto | Mitä tekee | Kohteeksi käy | Kentät | Tyhjä tai kelvoton arvo |
|---|---|---|---|---|
| **Aseta arvo** | Asettaa kohteen arvoksi annetun arvon. | Painike, Valintaruutu, Kytkin, Säädin, Tekstikenttä, Lukukenttä, Päivämäärä, Kalenteri, Muisti; Tietotaulukko (sarake); minkä tahansa palikan ohjattava ominaisuus; Ketjun `lukitus`; Jana (siirtää kohdan, rasti **Ilman laukaisua**). | **Uusi arvo**. Taulukolle **Sarake** ja **Mikä rivi**. Ketjun lukitukselle lisäksi valikko **Lukitustila**. | Tyhjä tyhjentää: Tekstikenttä tyhjäksi, Valintaruutu ja Kytkin *ei*, Säädin ja Lukukenttä 0, Päivämäärä tyhjäksi, Muisti tyhjäksi, taulukon kenttä puuttuvaksi. Säädin ja Lukukenttä rajataan omaan min–max-väliinsä. |
| **Aseta tila** | Tekee kohteesta valitun tai ei-valitun. | Valittavat: Painike (ei kertapainallus määränä), Valintaruutu, Kytkin, Muisti; kyllä/ei-ominaisuus. | **Tila**: *on valittu* (oletus) / *ei ole valittu*. | Ei arvokenttää. |
| **Lisää** | Lisää kohteen nykyiseen arvoon määrän. | Säädin, Lukukenttä, Muisti, Päivämäärä, kertapainallus (painallusten määrä); taulukon luku- tai päivämääräsarake; luku-ominaisuus; Jana (siirtää kohtaa). | **Määrä**. | Tyhjä = 1. Negatiivinen vähentää. Kelvoton määrä = 0. Päivämäärään lisätään päiviä (tyhjä päivämäärä lasketaan tästä päivästä). Puuttuvaan taulukon kenttään lisätään kuin nollaan. |
| **Valitse** | Tekee kohteesta valitun. Kertapainalluksella lisää yhden painalluksen. | Valittavat palikat ja Painike. | Ei kenttiä. | – |
| **Poista valinta** | Tekee kohteesta ei-valitun. | Valittavat palikat. | Ei kenttiä. | – |
| **Vaihda** | Vaihtaa kyllä ↔ ei. | Valittavat palikat; taulukon kyllä/ei-sarake (puuttuva → kyllä); kyllä/ei-ominaisuus. | Taulukolle Sarake ja Mikä rivi. | – |
| **Tyhjennä** | Palauttaa kohteen alkutilaan (poistaa käyttötiedon). | Asetettavat palikat, Lista, Aikajana; Tietotaulukko. | Taulukolle **Sarake**: tyhjä valinta = *kaikki rivit (tyhjennä taulukko)*. | – |
| **Siirry** | Vie käyttönäkymän toiseen kohtaan tai näkymään. | Sijainti, Alue tai mikä tahansa näkymän palikka. Kohteen voi jättää valitsematta. | **Kohde**; ilman kohdetta **Näkymä** (*tämä näkymä* tai muu) ja **X**, **Y** (kohta tulee näytön vasempaan yläkulmaan). **Siirtymä**: *Vierien* (noin puoli sekuntia) / *Heti*. | Ilman kohdetta X ja Y ovat 0. |
| **Palaa takaisin** | Palaa näkymään ja kohtaan, josta viimeksi siirryttiin Siirry-toiminnolla. | Ei kohdetta. | **Siirtymä**. | Jos aiempaa siirtoa ei ole, mitään ei tapahdu. |
| **Kirjaa** | Aikajanalle: merkintä aikaleiman kanssa. Tietotaulukkoon: uusi rivi, jonka aika on kirjaushetki ([kirjaushistoria](07-tieto.md#kirjaushistoria)). | Aikajana (omat merkinnät); Tietotaulukko, jossa on ajankohta-sarake. | Aikajanalle **Teksti** (`@viite` toimii). Taulukkoon kenttä jokaiselle sarakkeelle kuten Lisää rivi (ei Id:tä); aika-kentän ohje *(tyhjä = nyt)*. Ilman aika-saraketta nappi **Tee taulukosta kirjaushistoria**. | Aikajana: tyhjä teksti → arvo nuolesta. Taulukko ilman ajankohta-saraketta: virhe *ei ole aika-saraketta*, riviä ei lisätä. Sitten-tapahtuman rivi = uusi kirjaus. |
| **Lisää riviksi listaan** | Lisää Listaan uuden rivin. | Lista. | **Teksti**. | Tyhjä teksti: arvo nuolesta; muuten ”Uusi rivi”. Jos arvo on päivämäärä, se tulee rivin päivämääräksi. |
| **Näytä ilmoitus** | Näyttää hetken ilmoituksen näytön yläreunassa. | Ei kohdetta. | **Ilmoitus** (`@viite` toimii). | Tyhjä teksti: näytetään arvo nuolesta (ilman sitä ”–”, ei tarkistettu selaimessa). |
| **Käynnistä ketju** | Käynnistää ketjun tai [janan](#jana-jana) alusta. | Ketju, Jana. | **Odota, että ketju on valmis** (rasti, toimii vain ketjun sisällä). | – |
| **Pysäytä ketju** | Pysäyttää ketjun kaikki haarat tai janan. Pysäytetty ketju ei anna valmis-tapahtumaa. | Ketju, Jana. | – | – |
| **Arvo uudelleen** | Arpoo Satunnaisluvulle uuden luvun. Satunnaisluvun *arvottu*-tapahtuma lähtee heti. | Satunnaisluku. | – | – |
| **Palauta perusarvo** | Poistaa toimintojen asettamat ominaisuusarvot, jolloin perusarvo (tai kaava, jos ominaisuus on ohjattu) on taas voimassa. Palauttaa myös efektien jättämän tekstin ja kuvan. | Palikka, jolla on ominaisuuksia. | **Mikä palautetaan**: *kaikki ominaisuudet* tai yksi. | – |
| **Lisää rivi** | Lisää Tietotaulukkoon rivin. | Tietotaulukko. | Kenttä jokaiselle sarakkeelle: **kaava** (`3`, `"Maito"`, `tänään`, `nyt`, `tapahtuma.uusi`, viite). **Valitse uusi rivi** (rasti). | Tyhjä kenttä = puuttuu. Jos jokin kenttä on virheellinen, riviä ei lisätä. Sitten-tapahtuman rivi on uusi rivi. |
| **Poista rivi** | Poistaa rivin. | Tietotaulukko. | **Mikä rivi**: *Valittu rivi* / *Tapahtuman rivi*. | Jos poistettu oli valittu, valinta siirtyy seuraavaan. Ilman riviä: virhe. |
| **Valitse rivi** | Vaihtaa taulukon valitun rivin. | Tietotaulukko. | **Mikä rivi**: ensimmäinen, seuraava, edellinen, viimeinen, tapahtuman rivi, arvosta (numero tai rivi), ei mitään. Seuraavalle ja edelliselle **Lopusta alkuun (ja alusta loppuun)**. | Arvosta: tyhjä = ei valintaa; liian iso numero = virhe. |
| **Siirrä rivi** | Vaihtaa rivin paikkaa viereisen kanssa. | Tietotaulukko. | **Mikä rivi**, **Suunta**: *Ylös* / *Alas*. | Ensimmäinen ei siirry ylemmäs eikä viimeinen alemmas. |
| **Lisää joukkoon** (Appi-appi 57) | Kohde kuuluu joukkoon käytön ajan, vaikka sillä ei ole tagia. | Mikä tahansa palikka paitsi Ryhmä; myös joukko (jokainen jäsen). | **Joukko**. | Ilman joukkoa ei tee mitään. Tagi ei muutu; *Palauta perusarvo* (kaikki) palauttaa. *kuuluu kun* -nuoli voittaa. |
| **Poista joukosta** (Appi-appi 57) | Kohde ei kuulu joukkoon käytön ajan, vaikka sillä on tagi. | Kuten yllä. | **Joukko**. | Kuten yllä. |
| **Hae tiedostosta** | Hakee taulukon lähdetiedoston GitHubista ja yhdistää rivit ([Lähde](07-tieto.md#lähde-rivitiedosto-githubista)). | Tietotaulukko, jolla on lähde. | ei asetuksia (lähde ja avain taulukon paneelissa). | *Sitten* heti, kun haku alkaa; tulos taulukon tapahtumina haettu ja hakuvirhe. Ilman lähdettä tai muuhun kohteeseen: virhe. |

Taulukkotoiminnot kuvataan tarkemmin tietotaulukon luvussa. Niiden virhe (esim. ”taulukossa ei ole valittua riviä”) näkyy ilmoituksena ketjun ulkopuolella ja pysäyttää ketjun ketjun sisällä.

**Toiminnon kuvaus selkokielellä.** Kanvaasilla, osioiden luetteloissa ja ketjun vaiheluettelossa toiminto näytetään lauseena, esim. `Pisteet + 1`, `Valmis: on valittu`, `Siirry → Aloitus (heti)`, `Käynnistä ketju: Aamu ja odota`, `Nappi.leveys = 200`, `Palauta Otsikko: kaikki ominaisuudet perusarvoon`. Pois käytöstä olevan eteen tulee ”(pois käytöstä)”.

### Laukaisu: mistä tapahtuma tulee

Vedä nuoli tapahtumakohdasta Toiminnon kohtaan **tee kun**. Tapahtumakohtia ovat esimerkiksi:

- Painike: *painettu* (lisäasetuksella *pitkä painallus*, *irrotettu*); syöttävät ohjaimet: *muuttui*; Kalenteri: *päivä valittu*; Tatti: *alkaa*, *loppuu*; Alue: *astuttu*, *poistuttu*, *napautettu*.
- JOS: *NIIN*, *MUUTEN*; KUN: *silloin*; JOS- ja KUN-ikkuna: *NIIN*, *MUUTEN*, *läpi*.
- Toisen Toiminnon *sitten*, Ketjun *valmis*, Satunnaisluvun *arvottu*, Muutos ajassa *valmis*, Liikkeen *törmäsi* ja *perillä*.

**Arvo tapahtumakohtaan.** Jos *tee kun* -kohtaan tuodaan arvo (esim. Valintaruudun *arvo* tai Kaavan *tulos*), toiminto tehdään kerran joka kerta, kun arvo muuttuu epätodesta todeksi. Se ei toistu niin kauan kuin arvo pysyy totena.

**KUN ja JOS lyhyesti** (tarkemmin logiikkaluvussa): JOS lähettää *NIIN*, kun ehto alkaa päteä, ja *MUUTEN*, kun se lakkaa. KUN ilman tapahtumanuolta laukeaa, kun ehto alkaa päteä; tapahtumanuolen kanssa se päästää tapahtuman läpi vain, jos ehto pätee juuri silloin. Kummankin ulostulo viedään Toimintoon tai Ketjun *käynnistä*-kohtaan.

**Sitten-ketjutus ilman Ketjua.** Toiminto → *sitten* → Toiminto tekee molemmat samalla hetkellä peräkkäin. Odotusta ei voi lisätä tähän; siihen tarvitaan Ketju.

**Rajat:**

- Toiminto ei voi kirjoittaa Arvo-, Kaava-, Lasku-, Tänään- tai muuhun laskettuun palikkaan. Muuttuvalle luvulle käytä Muistia tai Lukukenttää.
- Logiikan Aseta ei lähetä kohteen *muuttui*-tapahtumaa (vain käyttäjän muutos lähettää), joten *muuttui* → Aseta samaan ei kierrä.
- Silmukkasuoja: hyvin pitkä tapahtumien sarja samalla hetkellä katkaistaan (yli 60 peräkkäistä).

---

## Tapahtumaketju: Ketju (`ketju`)

Ketju on punareunainen ikkuna (otsikossa ⛓ KETJU). Sen sisälle vedetyt ketjun palikat ovat vaiheita, ja niiden väliset punaiset viivat ovat ketjun reitti. Kun ketju käynnistyy, se tekee alkuvaiheen, jatkaa viivaa pitkin seuraavaan ja niin edelleen. Odottava vaihe (esim. Ajastin) pysäyttää vain oman haaransa, kunnes aika on kulunut.

- **Löytyy:** Logiikka → paletti → **Ketju** → **Ketju**. Alla alaotsikot **Odotus** (Ajastin, Odota, kunnes), **Haarat** (Ehto, Monta haaraa, Arpa, Toista), **Tekemiset** (Aseta arvo, Aseta tila, Käynnistä ketju, Pysäytä ketju, Ketjun tulos, Lopeta ketju) ja lista **Ketjut tässä projektissa**. Efektit ovat ryhmässä **Näkymä ja efektit**, muut toiminnot ryhmässä **Toiminnot**.
- **Sisään:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| käynnistä | tapahtuma | Käynnistää ketjun alusta. Arvo tähän käynnistää, kun arvo alkaa päteä. |
| pysäytä | tapahtuma | Pysäyttää kaikki haarat (ei valmis-tapahtumaa). |

- **Ulos:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| käynnissä | arvo | kyllä, kun jokin haara on menossa. |
| tulos | arvo | Viimeisimmän Ketjun tulos -vaiheen arvo. |
| valmis | tapahtuma | Lähtee, kun viimeinenkin haara on päässyt loppuun (myös Lopeta ketju). |

- **Asetukset (paneeli):** napauta ketjun otsikkoa (puhelimessa sen jälkeen **Asetukset**). Osiot:
  - **Tila**: tilarivi (*Ei ole vielä käynnistynyt*, *Käynnissä · 2 haaraa menossa* ja lista *Nyt menossa*, *Valmis · käynnistynyt 3 kertaa*, *Pysäytetty*, *Pysähtyi* + syy, *Pois päältä*). Nappi **▶ Käynnistä nyt** / **■ Pysäytä**. Rastit **Ketju päällä** ja **Käynnisty, kun projekti avataan**. Valinta **Jos ketju käynnistyy uudelleen kesken**: *Jatkaa ennallaan* (oletus, uusi käynnistys ohitetaan) / *Aloittaa alusta* (menossa oleva kierros keskeytyy ja ketju alkaa alusta). Valikko **Lukitus** (ks. alla).
  - **Tulos**: *Nyt: …*, nuolet tuloksesta muihin ja nappi **Vie tulos näkymän palikkaan…**.
  - **Tapahtumat järjestyksessä**: numeroitu luettelo vaiheista (napautus vie vaiheeseen, × poistaa), valikot **＋ Lisää tapahtuma loppuun…** ja **＋ Lisää tapahtuma alkuun…**, sekä huomautukset (⚠ virhe, ℹ︎ tieto).
- **Otsikkorivi kanvaasilla:** nimi ja viite, tila (*käynnissä* ja mitä odotetaan, esim. ”Odota · 0:42”, tai *⚠ pysähtyi*), virheiden määrä ⚠ N, kytkin päälle/pois, **▶** (käynnistä kokeeksi) tai **■** (pysäytä), sekä **–** / **⤢** (tiivistä / avaa).
- **Ominaisuudet:** `tulos`, `käynnissä`, `lukitus` (ohjattava, 0–2), `lukitusnimi`, `käytössä` (ohjattava).
- **Kaavassa:** `aamu` = käynnissä (kyllä/ei), `aamu.tulos`, `aamu.käynnissä`, `aamu.lukitus`, `aamu.lukitusnimi`.
- **Aika ja tila:** ketjun ajotila (missä haarat ovat, ajastimien aloitusajat, Toista-laskurit, tulos) tallentuu projektiin ja jatkuu, kun appi avataan uudelleen. Tulos tyhjenee, kun ketju käynnistyy uudelleen. ▶ on kokeilua varten, mutta vaiheet tehdään oikeasti: arvot ja tilat muuttuvat. Kumoa ei peru niitä; projektien **Tyhjennä käyttötiedot** palauttaa.

### Ketjun rakentaminen

1. Vedä **Ketju** paletista logiikkakanvaasille (puhelimessa: **＋ Palikat** → napauta **Ketju**). Suurenna tarvittaessa oikeasta alakulmasta.
2. Lisää vaiheita jollakin tavalla:
   - **Vedä** ketjun palikka paletista ketjuikkunan sisään. Jos ketjussa on tasan yksi loppupää, uusi vaihe kytkeytyy siihen automaattisesti (ilmoitus ”Yhdistetty: … → …”).
   - **Napauta** paletin sirua, kun ketju tai sen vaihe on valittuna: vaihe lisätään ketjun loppuun tai valitun perään (”Lisätty ketjuun …”). Tämä on puhelimella helpoin tapa.
   - **Paneelista**: ketjun osion *Tapahtumat järjestyksessä* valikoista, tai valitun vaiheen osion **Paikka ketjussa** valikosta **＋ Jatka tästä uudella tapahtumalla…** (haarautuvalla vaiheella **＋ Jatka haaraan ”kyllä”…** jne.).
3. Viivat: ketjun vaiheessa saapumiskohta on **yläreunassa** ja lähtökohdat **alareunassa** (pistokkeet näkyvät ketjussa aina). Vedä lähtökohdasta toisen vaiheen yläreunaan, hiirellä tai sormella. Valittu viiva: paneelissa **Vaihda kohde…**, **Vaihda lähtö…**, **Poista viiva**; myös kärjen raahaus toiseen kohtaan ja ⌫.
4. Kytke käynnistäjä: vedä nuoli esim. Painikkeen *painettu*-kohdasta ketjun **käynnistä**-kohtaan. Kokeile ▶:llä.

Vaiheen poisto keskeltä (× luettelossa tai ⌫) kytkee edellisen ja seuraavan yhteen, jotta ketju pysyy yhtenäisenä.

**Mistä ketju alkaa.** Alkuvaiheita ovat vaiheet, joihin ei tule ketjun viivaa; jokaisesta lähtee oma haara. Jos jokaiseen vaiheeseen tulee viiva (kehä), ketju alkaa ylimmästä. Nuoli ulkoa suoraan ketjun vaiheen saapumiskohtaan käynnistää ketjun siitä vaiheesta.

**Huomautukset ennen ajoa** (paneeli ja otsikon ⚠): esim. ”Ketju on tyhjä…”, ”Mikään ei vielä käynnistä ketjua…”, ”Kehä ilman ajastinta: A → B → A…”, ”valitse kohde”, ”ketju ei voi käynnistää itseään”, ”Ketjut odottavat toisiaan…”, haara joka ei jatku mihinkään.

---

## Jana (`jana`)

Jana on ikkuna, jonka leveys on alku–loppu (esim. 0–10 s). Sisään vedetyt Toiminnot ja efektit ovat **merkkejä**: kukin tehdään, kun janan kohta ohittaa sen. Jana kulkee joko ajassa (käynnistä, pysäytä, jatka) tai arvon mukaan (esim. Säätimestä). Toteutettu Appi-appi 41:ssä (F28 vaihe 1, `suunnitelmat/13-jana.md`); ei erikoispalikka.

- **Löytyy:** Logiikka → paletti → **Ketju** → siru **Jana** (Ketju-sirun vieressä). Uusi jana on 480 × 150.
- **Merkki:** Toiminto (`tee`) tai efekti janan sisällä. Palikan **vasen reuna** on sen kohta. Raahatessa palikka loksahtaa portaaseen ja kohta näkyy sen yllä; pudotettu merkki saa kohdan, ja sen nimilappu näkyy merkin yllä. Samaan kohtaan mahtuu monta allekkain; ylin tehdään ensin. Tarkan kohdan voi kirjoittaa merkin paneeliin (**Kohta janalla**), mikä on puhelimella tarkempaa kuin raahaus. Muut palikat ja ikkunat eivät mene janaan, ja jana voi olla vain logiikan päätasolla tai Ryhmässä.
- **Ulkoasu:** otsikossa ⟼ JANA, nimi, tila (*käynnissä*, kohta yksikköineen, *pois päältä*) ja ▶/■-nappi (aikajanalla). Asteikossa viiva joka portaalla (tiheä harvenee) ja luvut; kulkeva kohta näkyy pystyviivana. Laukeava merkki välähtää. Alueen ulkopuolelle jäänyt merkki näyttää ”· ulkopuolella” eikä laukea (sitä ei poisteta). Jana kasvaa vain alaspäin, kun merkkejä tulee lisää. Tiivistys kuten muissa ikkunoissa.

**Pistokkeet**

| Kulku | Sisään | Ulos |
|---|---|---|
| Aika | **käynnistä** (alusta), **pysäytä**, **jatka** (pysähtyneestä kohdasta), **alku**, **loppu** | **kohta**, **edistyminen**, **käynnissä**, **alkoi**, **kierros**, **valmis** |
| Arvo | **kohta** (esim. Säädin), **päällä**, **alku**, **loppu** | **kohta**, **edistyminen** |

Aikajanalla on aina sekä *kierros* että *valmis*, joten Kierroksen vaihto ei poista nuolia: *valmis* lähtee vain Kerran-janalta, kun se pääsee loppuun, ja *kierros* vain toistuvalta janalta. Kulun vaihto Aika ↔ Arvo poistaa nuolet kohdista, joita toisella kululla ei ole (esim. *käynnistä*, *valmis*); ilmoitus kertoo määrän, ja Kumoa palauttaa ne.

**Paneeli (osio Jana)**

- **Kulku**: *Aika* (oletus) / *Arvo*. Aikajanan kohta lasketaan käynnistyshetkestä, joten se on oikein myös, kun appi avataan uudelleen. Arvojanan asema tulee nuolesta (sisäänmeno *kohta*) tai Aseta arvo -toiminnosta.
- **Alku**, **Loppu** (oletus 0 ja 10; voi tulla nuolesta, luku). Loppu voi olla pienempi kuin alku (jana kulkee taaksepäin).
- **Yksikkö**: ei yksikköä, sekuntia (oletus), minuuttia, tuntia, vuorokautta. Aikajanalla ilman yksikköä yksi askel on sekunti. Tunti- ja vuorokausijanalla ohje muistuttaa, ettei appi tee mitään suljettuna eikä lähetä ilmoituksia.
- **Porras** (oletus 1): merkit loksahtavat sen välein. Nolla tai kelvoton = 1.
- **Hypyssä**: *Väliin jääneet* (oletus) / *Vain viimeinen* / *Ei mitään*. Hyppy = kohta muuttuu kerralla yli portaan (napautus säätimen raidalle, Aseta arvo) tai appi oli välillä kiinni (aikajanalla yli sekunnin tauko). Tavallisessa kulussa merkit tehdään aina järjestyksessä.
- **Laukeaa**: *Oletus* (aikajanalla eteenpäin, arvojanalla molempiin) / *Eteenpäin* / *Molempiin suuntiin*. Merkki laukeaa uudestaan vasta, kun kohta on käynyt sen toisella puolella.
- **Kierros** (vain aika): *Kerran* (pysähtyy loppuun, tapahtuma *valmis*) / *Toista* (lopusta alkuun, tapahtuma *kierros*) / *Edestakaisin* (alusta loppuun ja takaisin, *kierros* kummassakin päässä). Toistuva jana kulkee, kunnes se pysäytetään, eikä sen *valmis* laukea; ohje kertoo tämän.
- Tilarivi (*Käynnissä*, *Pysähdyksissä*, *Kohta nyt* · edistyminen prosentteina, ja kohta), aikajanalla napit **▶ Käynnistä alusta**, **⏵ Jatka**, **Pysäytä**, huomautukset (alku ja loppu samat, tyhjä jana, merkkejä alueen ulkopuolella, arvojanalla ei nuolta).
- Yleiset: nimi, viite, **Pois käytöstä** (pois päältä oleva aikajana pysähtyy).

**Kaavassa** (viite esim. `jana`): `jana.kohta` (myös pelkkä `jana`), `jana.edistyminen` (0–1, kuten Muutos ajassa ja Liikkeen reitti; vie se suoraan Käyrään, jonka x-väli on 0–1), `jana.käynnissä` (arvojanalla aina *ei*), `jana.alku`, `jana.loppu`. Merkkinä olevan Toiminnon kaavassa `tapahtuma.uusi` on merkin kohta ja `tapahtuma.suunta` on 1 eteenpäin ja −1 taaksepäin (tarvitsee Tapahtuman tiedot -palikan, kuten muutkin tapahtumakentät).

**Toiminnot janalle:** **Käynnistä** ja **Pysäytä** käyvät janalle kuten ketjulle (”Käynnistä jana”); ketjun sisällä rasti **Odota** odottaa, että jana on valmis. Toistuva jana ei valmistu itsestään, joten ketjun huomautus kertoo, ettei Odota pääty, ellei janaa pysäytetä. **Aseta arvo** siirtää janan kohdan ja **Lisää** siirtää sitä määrän verran; kohdan ohittamat merkit laukeavat hyppysäännön mukaan. Rasti **Ilman laukaisua** siirtää kohdan laukaisematta mitään. Jana voi käynnistää toisen janan merkillä.

**Asetukset ovat rakennetta, eivät ominaisuuksia:** porras, yksikkö, kulku, hypyssä, laukeaa ja kierros valitaan paneelista, eikä niitä voi lukea kaavassa tai ohjata logiikalla. Alku ja loppu ovat luettavia ja ohjattavia, koska niillä on oma sisäänmeno.

**Miksi?** janasta kertoo kohdan ja tilan; merkistä, minkä janan merkki se on ja milloin se viimeksi laukesi.

**Rajat:** merkki tehdään vain, kun appi on auki (kun appi avataan, väliin jääneet hyppysäännön mukaan). Yksi jana ei voi käynnistää itseään loputtomasti (syvyysraja). Jana ei ole aikajana-palikka (kirjaukset); nimet ovat eri.

---

## Ketjun palikat ✦

Kaikki alla olevat palikat ovat erikoispalikoita ✦ (`ch`). **Poikkeus:** ne etenevät ketjun viivoja pitkin vaihe kerrallaan eivätkä toimi kuten tavallinen tapahtumapalikka. Ketjun ulkopuolella vain **Toiminto** ja neljä **efektiä** toimivat (efekti tehdään heti ja *sitten* lähtee heti). Ajastin, Odota, Ehto, Arpa, Toista, Monta haaraa, Ketjun tulos ja Lopeta ketju eivät tee mitään ketjun ulkopuolella. Kaikilla on rasti **Käytössä**; pois käytöstä oleva vaihe ohitetaan ja ketju jatkaa ensimmäisestä lähtökohdasta (ks. Havainnot).

Valitun vaiheen paneelin lopussa on aina osio **Paikka ketjussa**: *Tullaan* (mistä viivat tulevat; ”Tämä on ketjun alku.”), *Jatketaan* tai *Haara: …* (mihin jatketaan; ”Ketju päättyy tähän.”), ja jatkovalikot.

### Ajastin ✦ (`ajastin`)
Pysäyttää haaran tietyksi ajaksi tai tiettyyn kellonaikaan asti.

- **Löytyy:** Ketju → Odotus → **Ajastin**.
- **Sisään:** *alkaa* (tapahtuma, ketjun viiva), *kesto* (arvo).
- **Ulos:** *kulunut* (tapahtuma), *käynnissä* (arvo), *jäljellä* (arvo, sekunteina).
- **Asetukset (paneeli):** **Odotetaan**: *Tietty aika* / *Kellonaikaan*.
  - Tietty aika: **Kesto** (oletus 10, desimaalit sallittu, esim. 1,5) ja yksikkö *sekuntia / minuuttia / tuntia / vuorokautta* (oletus sekuntia). Jos kesto tulee nuolesta, yksikkö koskee sitä; aika-arvo (Arvo-palikka yksikössä s/min/h, ajastimen *jäljellä*, Sekuntikellon *kulunut*) luetaan sekunteina.
  - Kellonaikaan: **Kellonaika** muodossa `7.00`, `7:00` tai `7`. Jos kello on jo ohi, odotetaan seuraavaan päivään.
  - Paneeli näyttää käynnissä olevasta: aloitus- ja valmisaika sekä *Jäljellä*.
- **Ominaisuudet:** `jäljellä`, `käynnissä`, `käytössä`.
- **Aika ja tila:** aloitusaika tallentuu. Kun appi avataan ja aika on jo kulunut, ketju jatkuu heti. Peräkkäiset ajastimet lasketaan alkuperäisistä ajoista, joten suora ketju ehtii loppuun. Kehässä (silmukassa) kiinni jääneitä kierroksia ei tehdä jälkikäteen: kierros alkaa avaushetkestä.
- **Virheet:** ”kesto ei ole luku”, ”kesto on nolla”, ”kesto on yli 10 vuotta”, ”kirjoita kellonaika, esim. 7.00”. Virhe pysäyttää ketjun.
- **Huomio:** ketjun ulkopuolella paneeli sanoo ”Ajastin toimii ketjun sisällä. Vedä se ketjuikkunaan.”

### Ehto ✦ (`haara`)
Haarautuu kahteen suuntaan: kyllä tai ei, sillä hetkellä kun ketju tulee tähän.

- **Löytyy:** Ketju → Haarat → **Ehto**.
- **Sisään:** *tarkista* (tapahtuma), *ehto* (arvo).
- **Ulos:** *kyllä*, *ei* (tapahtumat; ei-haaran viiva on katkoviiva).
- **Asetukset:** **Onko tämä valittu?** (palikka) tai nappi **ƒ Ehto kaavasta** (luo Kaavan ja nuolen kohtaan *ehto*). Luvulle ja tekstille kyllä = siinä on jotain (ei nolla eikä tyhjä). Paneeli näyttää *Nyt: kyllä-haara / ei-haara*. **Miksi?** selittää.
- **Huomio:** ehto tarkistetaan vasta, kun ketju tulee tähän (esim. ajastimen jälkeen). ”Toista, kunnes” tehdään kehällä: Ehdon ei-haara → Ajastin → takaisin Ehtoon.

### Odota, kunnes ✦ (`odota`)
Pysäyttää haaran, kunnes ehto pätee tai tapahtuma tulee, valinnaisesti aikarajalla.

- **Löytyy:** Ketju → Odotus → **Odota, kunnes**.
- **Sisään:** *alkaa* (ketjun viiva), *ehto* (arvo), *tapahtuma* (tapahtuma: tavallinen nuoli, esim. Painike *painettu*).
- **Ulos:** *jatkuu*; jos aikaraja on annettu, myös *aika loppui*.
- **Asetukset:** **Odota, kunnes tämä on valittu** (palikka) tai **ƒ Ehto kaavasta**; tapahtumanuolen voi pudottaa palikan päälle ja valita ”tapahtuma”. **Aikaraja (valinnainen)** + yksikkö (sekuntia / minuuttia / tuntia / vuorokautta, oletus minuuttia); tyhjä tai 0 = ei rajaa. Odottaessa paneelissa *Odottaa nyt*, alkuaika ja aikarajan loppu.
- **Ominaisuudet:** `aikaraja` (ohjattava), `käytössä`.
- **Aika ja tila:** jos ehto pätee jo, kun ketju tulee tähän, se jatkaa heti. Tapahtuma, joka tulee kun mikään haara ei odota, ei tee mitään. Appi suljettuna: avattaessa ehto tarkistetaan ensin, sitten aikaraja.

### Arpa ✦ (`arpa`)
Jatkaa yhteen satunnaiseen haaraan.

- **Löytyy:** Ketju → Haarat → **Arpa**.
- **Sisään:** *arvo* (tapahtuma). **Ulos:** *1*, *2*, … (yksi tapahtumakohta per vaihtoehto).
- **Asetukset:** **Vaihtoehtoja** 2–6 (oletus 2). Kaikilla sama todennäköisyys; 6 on kuin noppa.
- **Huomio:** jos arvottu vaihtoehto ei jatku mihinkään, se haara päättyy (huomautus kertoo).

### Toista ✦ (`toista`)
Kulkee *kierros*-haaraan annetun määrän kertoja tai kerran jokaiselle taulukon riville, sitten *valmis*-haaraan.

- **Löytyy:** Ketju → Haarat → **Toista**.
- **Sisään:** *alkaa*; tavalla N kertaa *kerrat* (arvo), tavalla riveille *rivit* (rivijoukko), tavalla jäsenille *jäsenet* (nuoli Joukko-palikasta, Appi-appi 63).
- **Ulos:** *kierros*, *valmis*.
- **Asetukset:** **Toista**: *N kertaa* / *riveille* (näkyy, kun projektissa on Tietotaulukko) / *jäsenille* (näkyy, kun projektissa on joukkoja; [Toista jäsenille](07-tieto.md#toista-jäsenille-appi-appi-63)). **Montako kertaa** (oletus 3, 0–1000). Riveille: tuo nuoli Tietotaulukon tai Rivijoukon *rivit*-kohdasta; kierroksella käsiteltävä rivi on *tapahtuman rivi*.
- **Ominaisuudet:** `kierros` (monesko menossa, 0 = ei), `kerrat`.
- **Tärkeää:** vedä kierros-haaran viimeisestä vaiheesta viiva **takaisin Toista-palikkaan**, muuten kierros ei toistu. Laskuri alkaa alusta joka käynnistyksellä ja valmis-haaran jälkeen. Kanvaasilla näkyy *2/3*.
- Riveille: rivit otetaan talteen toiston alussa; jos käsittelemätön rivi poistetaan kesken, ketju pysähtyy virheeseen.

### Ketjun tulos ✦ (`ktulos`)
Antaa ketjulle tuloksen, esim. päätöspuun vastauksen.

- **Sisään:** *alkaa*, *arvo*. **Ulos:** *sitten*.
- **Asetukset:** **Tulos** (arvokenttä: luku, teksti, päivämäärä, `@viite` tai kaava) tai nuoli kohtaan *arvo*.
- **Kaavassa:** tulos luetaan ketjusta: `paatos.tulos`.
- Ketju muistaa tuloksen, kunnes se käynnistyy uudelleen.

### Lopeta ketju ✦ (`lopeta`)
Lopettaa koko ketjun heti, myös muut menossa olevat haarat. Ketju on silloin **valmis**: valmis-tapahtuma lähtee ja tulos säilyy. Hyödyllinen, kun rinnakkaisista haaroista ensimmäinen ratkaisee. Sisään *alkaa*, ei ulostuloa.

### Monta haaraa ✦ (`monihaara`)
Oma haara joka vaihtoehdolle; ensimmäinen pätevä rivi ratkaisee.

- **Sisään:** *tarkista*, *arvo*. **Ulos:** yksi kohta per haara (nimenä haaran nimi tai ehto) ja *muuten*.
- **Asetukset:** **＋ Lisää haara**; rivin laji *palikka on valittu* / *arvo on* / *arvo välillä* (alkaen, alle); valinnainen haaran nimi; ↑ ja ×. **＋ Haarat vaihtoehtoryhmästä…** tekee haaran jokaiselle ikkunan painikkeelle tai valintaruudulle. **Arvo, jota haarat vertaavat** (arvokenttä tai nuoli). Paneeli näyttää osuvan haaran.

### Efektit ✦: Teksti ilmestyy (`ilmesty`), Kuva vaihtuu (`kuva`), Animaatio (`anim`), Näkymänvaihto (`nvaihto`)
Näkyviä muutoksia käyttönäkymään. Kaikilla sisään *alkaa*, ulos *sitten*, kenttä **Kesto (s)** ja ketjussa rasti **Ketju odottaa efektin loppuun** (oletus päällä). Ketjun ulkopuolella efekti tehdään heti ja *sitten* lähtee heti.

- **Löytyy:** Logiikka → paletti → **Näkymä ja efektit**.

| Efekti | Kentät (oletus) | Huomio |
|---|---|---|
| **Teksti ilmestyy** | **Palikka**, **Teksti** (tyhjä = palikan nykyinen teksti, `@viite` toimii), **Tapa**: Kirjain kerrallaan / Sana kerrallaan / Häivyttäen; kesto 1 s. | Toimii Tekstissä, Muodossa, Ilmoituksessa ja Painikkeessa. Teksti jää palikkaan, kunnes Palauta perusarvo poistaa sen. |
| **Kuva vaihtuu** | **Kuva-palikka**, **Uusi kuva** (SVG-koodi tai https-osoite, tai **Valitse kuvatiedosto…**; tyhjä = oma kuva), **Siirtymä**: Häivyttäen / Liukuen / Heti; kesto 0,5 s. | Uusi kuva jää voimaan, kunnes Palauta perusarvo. |
| **Animaatio** | **Palikka**, **Liike**: Pomppu, Ravistus, Sykintä, Heilahdus, Pyörähdys, Välähdys, Ilmestyy; kesto 0,6 s. | Palikka palaa samaan kohtaan: paikka ei muutu. |
| **Näkymänvaihto** | **Näkymä** tai **tai sijainti** (sijainti voittaa), **Siirtymä**: Liukuu vasemmalle / oikealle / ylös / alas, Häivyttäen, Heti; kesto 0,4 s. | Kuten Siirry, mutta siirtymäefektillä. Palaa takaisin toimii. |

Kesto on enintään 3600 s. Ilman valittua kohdetta efekti ohitetaan ja ketju jatkaa (huomautus ”valitse palikka, jolle efekti tehdään”).

---

## Ketjun kolme lukitustilaa

Lukitus ratkaisee, mitä arvoja ketju **lukee**, kun sen ajo kestää (esim. ajastimen yli) ja käyttäjä tai toinen ketju muuttaa arvoja välillä. **Kirjoitus ei muutu koskaan:** toiminnot muuttavat aina oikeaa tietoa kaikissa tiloissa.

| Tila | Nimi appissa | Mitä ketju lukee |
|---|---|---|
| 0 | Ajantasainen (oletus) | Joka vaiheessa nykyiset arvot. Sekä muiden että ketjun omat muutokset vaikuttavat. |
| 1 | Lukitse ulkopuolisilta muutoksilta | Lukitushetken arvot ja omat muutoksensa. Käyttäjän ja muiden ketjujen myöhemmät muutokset eivät vaikuta. Omiksi lasketaan myös vaiheen tapahtumanuolista seuraavat muutokset ja ketjun käynnistämien aliketjujen muutokset. |
| 2 | Lukitse kaikilta muutoksilta | Vain lukitushetken arvot, ei edes omia muutoksiaan. |

Esimerkki: luku on 2, ketju käynnistyy ja odottaa ajastimessa, käyttäjä muuttaa luvun 5:ksi. Ajastimen jälkeen ketju lukee: tila 0 → 5, tilat 1 ja 2 → 2. Toinen esimerkki: ketju asettaa itse luvuksi 1 (alussa 0) ja lukee sen heti: tilat 0 ja 1 → 1, tila 2 → 0.

**Paneelissa:** ketjun paneeli → **Tila** → valikko **Lukitus** (*0 – Ajantasainen*, *1 – Lukitse ulkopuolisilta muutoksilta*, *2 – Lukitse kaikilta muutoksilta*). Valikon alla ohje valitusta tilasta. Ajon aikana:

- ”Tässä suorituksessa: 1 – …, lukukuva klo 7.05.12, omia muutoksia 2.”
- Jos lukitusta pyydetään vaihtamaan kesken: ”Pyydetty … tulee voimaan seuraavan vaiheen alussa.”
- Laatikko **Ketjun lukema ≠ nykyinen käyttötieto**: palikat, joiden arvo ketjulle eroaa nykyisestä, esim. ”Luku ketju: 2 · nyt: 5”. Sama tieto on **Miksi?**-osiossa.
- Jos kaava, nuoli tai toiminto ohjaa lukitusta, paneeli kertoo sen; ohjaus voittaa valikon.

**Milloin tila otetaan:** käynnistyksessä. Kesken ajon tila luetaan uudelleen jokaisen uuden vaiheen alussa; vaihto ottaa uuden lukukuvan vaihtohetkestä. Alkanut vaihe (esim. menossa oleva ajastin) jatkuu.

**Ohjaus logiikasta:** kaavassa `ketju.lukitus`; ominaisuuden voi avata ohjattavaksi Ominaisuudet-osiosta (⇢ tai ƒ), tai Aseta arvo → Kohde: ketju → **Mitä muutetaan: lukitus** → **Lukitustila**. Muu arvo kuin 0, 1 tai 2 on virhe: ketju ei käynnisty, kesken ajon se pysähtyy, ja virhe näkyy paneelissa, huomautuksissa ja ilmoituksena. Lisää-toiminto lukitukseen tarkistetaan samoin.

**Rajat:** lukitus ei jäädytä ketjujen omaa ajotilaa (vaihe, odotus, Toista-laskuri, tulos, käynnissä). Kohteen oma nykyinen arvo luetaan aina oikeasta tiedosta Lisää-, Vaihda- ja Lisää rivi -toiminnoissa, jottei muiden kirjoitus häviä. Jos lukukuva puuttuu tai on vanhasta versiosta, ketju pysähtyy (”Käynnistä se uudelleen”).

---

## Ketjun ajo

**Rinnakkaiset haarat.** Jos samasta lähtökohdasta lähtee monta viivaa, haara jakautuu ja osat etenevät samaan aikaan. Ajastin pysäyttää vain oman haaransa. Ketju on valmis, kun viimeinenkin haara on päässyt loppuun; Lopeta ketju päättää kaikki heti.

**Käynnistys kesken ajon.** Asetus *Jos ketju käynnistyy uudelleen kesken* ratkaisee: *Jatkaa ennallaan* ohittaa uuden käynnistyksen, *Aloittaa alusta* keskeyttää ja aloittaa uudelleen.

**Ketjusta ketjuun.** Käynnistä ketju -vaihe ilman rastia käynnistää toisen ketjun ja jatkaa heti (rinnakkain). Rastilla **Odota, että ketju on valmis** haara odottaa, kunnes toinen ketju on valmis tai pysähtyy (otsikossa ”Odottaa: Ali valmis”). Ketju ei voi käynnistää itseään, eivätkä kaksi ketjua voi odottaa toisiaan.

**Hätäjarrut:** kehä ilman Ajastinta, Odota, kunnes -palikkaa tai Toistaa pysäytetään heti; samoin yli 5000 vaihetta samalla hetkellä tai yli 2000 haaraa yhtä aikaa. Kesken poistettu odottava vaihe tai kohde pysäyttää ketjun virheeseen. Virheestä tulee ilmoitus ”⚠ Ketju ”…”: …” kerran.

**Pois päältä.** Kytkin otsikossa, rasti **Ketju päällä** tai paletin lista *Ketjut tässä projektissa*. Pois päältä laitettu ketju pysähtyy heti eikä käynnisty. Takaisin päälle laitettu ei käynnisty itsestään.

### Ketjut etenevät, kun appi on auki

- Appi tarkistaa odottavat ketjut, kun se avataan, kun se tulee taas näkyviin (esim. palaat Safariin) ja sekunnin välein käytön aikana. Tarkistus koskee kaikkia projekteja, ei vain avointa.
- **Kun appi on kiinni, mitään ei tapahdu taustalla:** ei ilmoitusta, ei ääntä. Ketju jatkuu siitä, kun appi avataan seuraavan kerran; jos ajastimen aika on jo kulunut, se jatkuu heti avattaessa.
- **Käynnisty, kun projekti avataan:** ketju käynnistyy kerran aina, kun projekti avataan (myös kun appi käynnistyy siihen).

### Päivä vaihtuu

Appi tarkistaa noin 30 sekunnin välein, onko päivämäärä vaihtunut. Jos on, kaikki lasketaan uudelleen: Tänään-palikka ja siitä riippuvat JOS- ja KUN-palikat voivat laueta. Kaavat, joissa on `nyt`, päivittyvät sekunnin välein.

### Seuranta ja Miksi?

- **Kanvaasilla:** menossa oleva vaihe korostuu, ajastimessa ⏳ jäljellä oleva aika ja edistymispalkki, Toistassa *kierros/kerrat*, tehty vaihe välähtää. Ketjun otsikossa *käynnissä* ja mitä nyt odotetaan.
- **Ketjun paneeli → Tila:** *Käynnistyi klo …. Nyt menossa:* ja luettelo haaroista jäljellä olevine aikoineen tai ”odottaa”.
- **Vaiheen paneeli:** Ajastimessa *Käynnissä: alkoi klo …, valmis klo …* ja *Jäljellä*; Odota, kunnes -palikassa *Odottaa nyt*.
- **Miksi?** (ketju, Ehto, Ajastin): selkokielinen syy, esim. ”Ketju on käynnissä: 2 haaraa menossa.”, ”Tarkistaa Väsynyt: nyt pätee, joten ketju jatkaa kyllä-haaraan.”, ”Odottaa 10 s. Jäljellä 0:04.” Lukitussa ketjussa myös lukitustila ja erot.

---

## Reseptit

### Painikkeesta kasvava laskuri (Toiminto Lisää)
1. Näkymä-välilehti: lisää paletista **Painike** ja **Lukukenttä** (tai logiikkaan **Muisti** ja näkymään Teksti, joka näyttää sen).
2. Napauta Painiketta. Paneelissa (puhelimessa **Asetukset**) osio **Kun painetaan** → **＋ Lisää toiminto…** → **Lisää**.
3. Uuden toiminnon paneelissa: **Kohde** = Lukukenttä. Jätä **Määrä** tyhjäksi (= 1).
4. Paina yläpalkista **Lukitse** ja painele Painiketta: luku kasvaa yhdellä. Vähentävälle painikkeelle Määrä `-1`.

### Ajastettu muistutus 10 s päästä
1. Logiikka-välilehti: vedä **Ketju** kanvaasille. Anna nimi paneelissa (esim. Muistutus).
2. Ketju valittuna napauta paletista **Ketju → Odotus → Ajastin** (lisätään ketjuun; oletus 10 sekuntia).
3. Ajastin valittuna napauta **Toiminnot → Näytä ilmoitus**. Kirjoita kenttään **Ilmoitus** esim. `Juo vettä`.
4. Vedä nuoli näkymän Painikkeen kohdasta *painettu* ketjun kohtaan **käynnistä** (tai kokeile otsikon **▶**:llä).
5. Lukitse ja paina: 10 sekunnin päästä ilmoitus näkyy. Huom: vain jos appi on silloin auki; muuten ilmoitus tulee, kun appi avataan.

### Haarautuva kysymys (Ehto)
1. Näkymään **Kytkin** ”Väsynyt?” ja **Teksti** vastaukselle sekä **Painike** ”Kysy”.
2. Logiikkaan **Ketju** (nimi Päätös). Ketju valittuna napauta **Ketju → Haarat → Ehto**. Ehdon paneelissa **Onko tämä valittu?** = Väsynyt?.
3. Ehdon osiossa **Paikka ketjussa**: **＋ Jatka haaraan ”kyllä”…** → **Ketjun tulos (päätöspuun vastaus)**, Tulos `Lepää`. Valitse Ehto uudelleen ja **＋ Jatka haaraan ”ei”…** → Ketjun tulos, Tulos `Jatka`.
4. Ketjun paneeli → **Tulos** → **Vie tulos näkymän palikkaan…** → valitse Teksti. (Tai Tekstin kaavaksi `paatos.tulos`.)
5. Vedä nuoli Painikkeen *painettu* → ketjun **käynnistä**. Lukitse, valitse kytkin ja paina Kysy.

### Odota vastausta enintään minuutti
1. Ketjuun **Odota, kunnes**: **Odota, kunnes tämä on valittu** = Valintaruutu ”Tehty”, **Aikaraja** `1`, yksikkö *minuuttia*.
2. *jatkuu*-haaraan Näytä ilmoitus ”Hienoa!”, *aika loppui* -haaraan Näytä ilmoitus ”Aika loppui”.
3. Käynnistä ketju ja rastita tai jätä rastittamatta.

---

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#toiminnot-ja-ketjut).
