# Tieto: taulukot, rivit ja toistuvat kortit

Tämä luku kertoo, miten Appi-appissa pidetään tietoa riveinä ja sarakkeina (kuin taulukkolaskennassa), miten rivejä luetaan kaavoissa, suodatetaan ja järjestetään, ja miten jokaiselle riville näytetään oma kortti näkymässä.

Palikat lyhyesti:

| Palikka | Missä | Mihin |
|---|---|---|
| Tietotaulukko (`taulu`) | Logiikka → Tieto | Rivit ja sarakkeet. Toiminnot muuttavat rivejä. |
| Tapahtuman tiedot (`tapaht`) | Logiikka → Tieto | Mitä tapahtuma toi mukanaan: uusi ja vanha arvo, rivi, aika. |
| Rivi (`trivi`) | Logiikka → Tieto | Nimetty lähde yhdelle riville (käsiteltävä, valittu tai tapahtuman). |
| Rivijoukko (`joukko`) | Logiikka → Tieto | Suodattaa ja järjestää rivejä muuttamatta niitä. |
| Toistin ✦ (`toistin`) | Näkymä → Näyttö | Sama kortti jokaiselle riville. |
| Joukko `#nimi` | Tunnus-kenttä, paletti → Joukot | Kokoaa palikoita: `#kolikot.summa`, toiminto kaikille jäsenille. |
| Joukko-palikka ✦ (`pjoukko`) | Logiikka → Tieto, paletti → Joukot ⁂ | Joukon säännöt: Ota mukaan, Vain jos, säännöt jäsenille (Appi-appi 62). |

Paletin Tieto-ryhmässä palikat ovat oletusnimillä **Taulukko**, **Tapahtuma**, **Kohde** ja **Suodatus** (Rivijoukko, Appi-appi 60; ennen *Joukko*, eri asia kuin [palikoiden joukot `#nimi`](#palikoiden-joukot-nimi-appi-appi-57)), joten viitteet kaavoihin ovat aluksi `taulukko`, `tapahtuma`, `kohde` ja `suodatus`. Vanhat Rivijoukot pitävät nimensä. Nimen voi vaihtaa paneelin yläosasta; viite seuraa nimeä, ellei sitä ole kirjoitettu itse kenttään **Viite**. Tämän luvun esimerkeissä taulukon nimi on *Ostokset* (viite `ostokset`) ja sarakkeet *Nimi* (`nimi`), *Määrä* (`määrä`) ja *Hinta* (`hinta`).

Peruskäsitteet:

- **Lähtöaineisto** on rakentajan kirjoittamat rivit. Se on osa rakennetta.
- **Käyttötieto** on rivit sellaisina kuin ne ovat käytön jälkeen. Ensimmäinen muutos käytössä (toiminto, raahaus, sidottu kenttä) kopioi lähtöaineiston käyttötiedoksi, ja siitä eteenpäin muutokset menevät kopioon. Lähtöaineisto säilyy. **Palauta lähtöaineistoon** tai projektin **Tyhjennä käyttötiedot** palauttaa sen.
- **Valittu rivi** on taulukon yksi rivi kerrallaan (tai ei mitään). Se on käyttötietoa.
- **Riviviite** on arvo, joka osoittaa yhteen riviin (esim. `ostokset.valittu`). Sen kautta luetaan rivin tiedot aina ajantasaisina. Rivi tunnistetaan sisäisellä tunnisteella, ei rivinumerolla, joten järjestyksen muutos ei sekoita viitteitä.
- **Puuttuva tieto** on tyhjä kenttä. Se ei ole 0 eikä ei (ks. oma kohta alempana).

---

## Tietotaulukko (`taulu`)
Taulukko, jossa on nimetyt sarakkeet ja rivejä. Kaavat lukevat sen rivejä ja koosteita, ja toiminnot lisäävät, valitsevat, muuttavat, siirtävät ja poistavat rivejä.

- **Löytyy:** Logiikka-välilehti, paletin ryhmä **Tieto** → **Tietotaulukko** (⊞). Tietokoneella vedä tai napauta palettia vasemmalla; puhelimella alapalkin **＋ Palikat**.
- **Sisään:** ei kohtia.
- **Ulos:**

| Kohta | Laji | Mitä antaa |
|---|---|---|
| rivejä | arvo | rivien määrä |
| valitun rivin nro | arvo | valitun rivin numero (0 = ei valittua) |
| rivit | arvo (rivijoukko) | kaikki rivit. Viedään nuolella Rivijoukon, Toistimen, ikkunan (Riveille) tai Toista riveille -palikan kohtaan **rivit**. |
| haettu | tapahtuma | vain kun taulukolla on lähde: haku onnistui ([Lähde](#lähde-rivitiedosto-githubista)). Tapahtuman `uusi` = lisättyjen rivien määrä. |
| hakuvirhe | tapahtuma | vain kun taulukolla on lähde: haku epäonnistui. Tapahtuman `uusi` = virheteksti. |

- **Asetukset (paneeli):** paneeli avautuu, kun palikka valitaan (puhelimella alapalkin **Asetukset**).
  - Osio **Sarakkeet**: jokaisella sarakkeella rivi, jossa nimikenttä, lajivalikko, ↑ ja ↓ (järjestys) ja × (poisto). Alla rivi *Kaavassa `ostokset.valittu.määrä`, `ostokset.määrä.summa` · viite [kenttä]*: viitteen voi kirjoittaa itse. Lajin mukaan lisäkentät:
    - *valinta*: vaihtoehdot pilkulla (esim. `pieni, iso`).
    - *riviviite*: **— minkä taulukon rivi? —** -valikko.
    - *luku*: yksikkö (valinnainen, esim. kg).
    - luku, kyllä/ei, päivämäärä ja ajankohta: valintaruutu **Koosteet vaativat täydelliset tiedot (yksikin puuttuva → tuntematon)**.
    - Painike **＋ Sarake** lisää sarakkeen nimellä *Sarake N* (laji teksti) ja vie kohdistuksen nimeen.
  - Osio **Rivit**: rivien määrä (käyttötieto vai lähtöaineisto), valittu rivi, painikkeet **Avaa taulukko…** ja (kun käyttötietoa on) **Palauta lähtöaineistoon**.
  - Osio **Kirjaushistoria**: nappi **Tee kirjaushistoria** lisää alkuun sarakkeet Aika ja Id (ks. [Kirjaushistoria](#kirjaushistoria)). Kun ne ovat, osio kertoo Kirjaa-toiminnosta, ja osio **Historian haut** näyttää kaavamuodot ja päivän rajan. Automaattisella sarakkeella ei ole lajivalikkoa vaan teksti *ajankohta · automaattinen* tai *tunniste · automaattinen*.
  - Osio **Lähde**: kenttä **Tiedosto** (polku GitHub-repossa, esim. `tuonnit/terveys.json`). Kun polku on, lisäksi **Avain**, **⤓ Hae nyt** ja viimeisimmän haun tila (ks. [Lähde](#lähde-rivitiedosto-githubista)).
  - Osio **Koosteet**: sarakkeittain täytetyt, puuttuvat ja virheet; luku- ja kyllä/ei-sarakkeille summa ja keskiarvo.
  - Osio **Käyttö logiikassa**: muistilista toiminnoista ja kaavamuodoista.
- **Sarakelajit:**

| Laji (valikossa) | Mitä kenttään käy | Huom. |
|---|---|---|
| teksti | mikä tahansa teksti | |
| luku | luku, esim. `2` tai `1,5` | pelkkä `−` tai teksti on virhe |
| kyllä/ei | valikko –, kyllä, ei | |
| päivämäärä | `pp.kk.vvvv` | |
| ajankohta | `16.10.2026 9.30`, pelkkä `9.30` (tänään) tai `nyt` | |
| valinta | yksi sarakkeen vaihtoehdoista | |
| riviviite | toisen taulukon rivi valikosta | lukee rivin ajantasaiset tiedot |

  Lajin vaihto muuntaa olemassa olevat arvot. Jos osa ei sovi uuteen lajiin, appi kysyy *N arvoa ei sovi lajiin ... ja poistuu. Jatketaanko?* Kun vaihdetaan valintaan, vaihtoehdot kerätään sarakkeen nykyisistä teksteistä.

- **Taulukkoikkuna (Avaa taulukko…):** leveä ikkuna, jossa rivit ja sarakkeet. Kentän muutos tulee heti voimaan. Väärän lajin arvoa ei kirjoiteta: kenttä muuttuu punaiseksi ja alla lukee *⚠ ... (ei kirjoitettu)*.
  - Jokaisella rivillä ↑ ja ↓ (siirto) ja × (poisto). Alhaalla **＋ Rivi** (näkyy, kun sarakkeita on), **⇄ Liitä tekstiä…** ([Tulkki](#tulkki-teksti-riveiksi-tai-palikoiksi); vain lähtöaineiston puolella) ja käyttötiedon ollessa **Palauta lähtöaineistoon**.
  - Kun käyttötietoa on, ylhäällä valinta **Lähtöaineisto (N)** / **Käyttötieto nyt (N)**. Valitsemasi puoli on se, jota muokkaat.
  - Valitun rivin sarake ●/○ näkyy vain **Käyttötieto nyt** -puolella. Napautus valitsee rivin, uusi napautus poistaa valinnan.
  - Sulje painikkeella **Valmis**.
- **Kaavassa:** (sarakkeen kohdalla sen viite, esim. `määrä`)

| Kaava | Antaa |
|---|---|
| `ostokset.rivejä` | rivien määrä |
| `ostokset.valittu` | valittu rivi (riviviite), tyhjä jos ei valittua |
| `ostokset.valittunro` | valitun rivin numero (0 = ei valittua) |
| `ostokset.valittu.määrä` | valitun rivin Määrä |
| `ostokset.eka`, `ostokset.vika` | ensimmäinen ja viimeinen rivi (riviviite). Myös `ensimmäinen` ja `viimeinen`. |
| `ostokset.eka.nimi`, `ostokset.vika.määrä` | ensimmäisen tai viimeisen rivin sarake |
| `ostokset.määrä.summa` | summa (puuttuvat ohitetaan) |
| `.keskiarvo`, `.suurin`, `.pienin` | keskiarvo, suurin, pienin. Suurin ja pienin toimivat myös päivämäärille ja ajankohdille. |
| `.havaintoja`, `.puuttuvia`, `.virheitä` | montako täytetty, puuttuu, virheellistä |
| `.täydellinen` | kyllä, jos sarakkeessa ei ole puuttuvia eikä virheitä |
| `ostokset.valittu.määrä.tiedossa` | kyllä/ei: onko kenttä täytetty |
| `kirjaus.valittu.tuote.hinta` | riviviitesarakkeen (*Tuote*) kautta toisen taulukon sarake |
| `loki.viimeisin`, `loki.viimeisin.määrä` | uusin kirjaus (suurin ajankohta) ja sen sarake; vain kun taulukossa on ajankohta-sarake ([Kirjaushistoria](#kirjaushistoria)) |
| `loki.edellisestä`, `loki.tänään` | minuutteja uusimmasta kirjauksesta; kirjauksia tänään päivän rajan mukaan |
| `loki.valittu.aika.päivä` | ajankohdan päivä päivän rajan mukaan (myös päivämäärälle: sama päivä) |
| `terveys.haettu`, `terveys.hakuvirhe` | viimeisimmän onnistuneen haun ajankohta (puuttuu, jos ei vielä haettu) ja viimeisimmän haun virhe (tyhjä = onnistui); vain kun taulukolla on lähde |

  Tekstissä samat aaltosulkeissa, esim. `Valittu: {ostokset.valittu.nimi}`. Pelkkä `ostokset.määrä` on virhe, joka ehdottaa `ostokset.valittu.määrä`, `ostokset.eka.määrä` tai `ostokset.määrä.summa`. Summa ja keskiarvo vain luku- ja kyllä/ei-sarakkeille (kyllä = 1, ei = 0).
- **Ominaisuudet:** rekisterissä (paneelin Ominaisuudet ja viitevalitsin) näkyvät `rivejä`, `valittu`, `valittunro`, `eka`, `vika`, `valittu.<sarake>`, `eka.<sarake>`, `vika.<sarake>` ja koosteet; ajankohta-sarakkeen kanssa lisäksi `viimeisin`, `edellisestä`, `tänään` ja `viimeisin.<sarake>`; lähteen kanssa `haettu` ja `hakuvirhe`. Ne ovat luettavia, eivät ohjattavia.
- **Aika ja tila:** lähtöaineisto on rakennetta; käyttötieto ja valittu rivi säilyvät tallennettuna, kunnes ne palautetaan. Taulukolla ei ole omia tapahtumia rivien muutoksille (esim. "rivi lisätty"): tapahtuma lähtee toiminnon **sitten**-kohdasta. Ainoat taulukon tapahtumat ovat lähteen haun **haettu** ja **hakuvirhe**.
- **Esimerkki:** Tee Tietotaulukko, nimeä *Ostokset*, lisää sarakkeet Nimi (teksti) ja Määrä (luku). **Avaa taulukko…** → **＋ Rivi** kolmesti, kirjoita Maito 2, Leipä 1, Omena (määrä tyhjä). Tee Kaava `ostokset.määrä.summa`: tulos 3. `ostokset.määrä.puuttuvia` = 1. `ostokset.vika.nimi` = Omena.
  - Toisenlainen käyttö: taulukko *Kirjaus*, jossa riviviitesarake *Tuote* taulukkoon *Tuotteet*. `kirjaus.valittu.tuote.hinta` näyttää aina tuotteen nykyisen hinnan.
- **Huomio:**
  - Sarakkeen nimen voi vaihtaa vapaasti: kaavat tallentuvat sarakkeen sisäisellä tunnisteella eivätkä katkea. Poikkeus: `tapahtuma.rivi.<sarake>` etsii sarakkeen viitteellä (ks. Tapahtuman tiedot).
  - **Sarakkeen poisto** (× sarakkeen rivillä): jos kentissä on tietoa tai saraketta käytetään, appi kysyy *Poistetaanko sarake ”Määrä”? N kentän tieto poistuu. Saraketta käytetään: ... Niihin jää virhe ”sarake puuttuu”, kunnes korjaat ne.* Luettelossa ovat kaavat, toiminnot, Rivin ja Rivijoukon kaavat, joukon järjestyssarake sekä sarakkeeseen sidotut kentät (lomake ja kortti). Poiston jälkeen ilmoitus *Sarake poistettu. Korjattavaa: ...*. Toiminnon sarakevalinta tyhjenee.
  - Taulukkoikkunan muutokset lähtöaineistoon voi kumota (↶ Kumoa); käyttötiedon muutoksia ei kumota.
  - Uudessa taulukossa (ei käyttötietoa) taulukkoikkunassa ei voi valita riviä. Rivi valitaan toiminnolla **Valitse rivi** tai kortista.
  - Koosteet ovat taulukon ominaisuuksia. Riveittäin laskettu kooste (esim. määrä × hinta yhteensä) tehdään ikkunalla **Riveille** (ks. alla).

---

## Kirjaushistoria
Historia on tavallinen Tietotaulukko, jonka rivit ovat kirjauksia: mitä, kuinka paljon ja milloin. Sama taulukko käy listaksi (Toistin), Aikajanalle, Kalenteriin ja koosteisiin.

- **Tee kirjaushistoria:** taulukon paneelin osio **Kirjaushistoria** → **Tee kirjaushistoria**, tai Kirjaa-toiminnon paneelin **Tee taulukosta kirjaushistoria**. Alkuun tulee kaksi automaattista saraketta:
  - **Aika** (ajankohta): täyttyy kirjaushetkellä, kun Kirjaa- tai Lisää rivi -toiminnon aika-kenttä on tyhjä, ja kun rakentaja lisää rivin taulukkoikkunassa. Aikaa voi korjata kuten muuta kenttää.
  - **Id** (tunniste): rivin pysyvä tunniste (`u1`, `u2` …; rakennusrivit `r1` …). Ei muokattavissa; taulukkoikkunassa harmaana tekstinä. Kaavassa `loki.vika.id`.
  Toinen painallus ei kahdenna sarakkeita. Sarakkeet voi nimetä uudelleen ja poistaa kuten muutkin.
- **Kirjaa:** toiminto **Kirjaa**, kohde taulukko. Kentät kuten Lisää rivi (kaavoja; arvot kopioidaan kirjaushetkellä, tilannekuva). Kirjaa toimii myös taulukkoon, jossa on tavallinen ajankohta-sarake: ensimmäinen ajankohta-sarake saa kirjaushetken. Ilman ajankohta-saraketta Kirjaa antaa virheen.
- **Muokkaus ja poisto:** kirjaus on tavallinen rivi. Sitä muokataan taulukkoikkunassa, lomakkeella tai toiminnoilla ja poistetaan Poista rivi -toiminnolla. Korjaus- tai poistohistoriaa ei pidetä.
- **Historian haut (kaavassa):**

| Kaava | Antaa |
|---|---|
| `loki.viimeisin` | uusin kirjaus (riviviite): suurin aika, ei taulukon viimeinen rivi. Tyhjässä taulukossa tyhjä. |
| `loki.viimeisin.määrä` | uusimman kirjauksen sarake |
| `loki.edellisestä` | kokonaisia minuutteja uusimmasta kirjauksesta (tyhjässä taulukossa puuttuu) |
| `loki.tänään` | kirjauksia tänään päivän rajan mukaan |
| `kirjaus.aika.päivä` | Rivi-palikan (käsiteltävä rivi) kirjauksen päivä päivän rajan mukaan; myös `loki.valittu.aika.päivä` |
| `nyt.päivä` | tämä päivä päivän rajan mukaan (vertailuun: `kirjaus.aika.päivä = nyt.päivä`) |

  Aikavälin rivit, määrä aikavälillä ja viimeisin ehdolla tehdään **Rivijoukolla**: ehto riveittäin esim. `kirjaus.aika.päivä = nyt.päivä` tai `kirjaus.aika >= kalenteri` (Rivi-palikka *Kirjaus*, käsiteltävä rivi), järjestys Aika-sarakkeen mukaan laskevasti ja *enintään 1* antaa viimeisimmän ehdolla (`joukko.eka`). Määrä: `joukko.rivejä`, summa `joukko.määrä.summa`. Ilman ajankohta-saraketta `viimeisin`, `edellisestä` ja `tänään` ovat virhe *ei ole aika-saraketta*.
- **Päivän raja:** ⚙︎ Asetukset → Päivämäärät → *Päivän raja (tämä projekti)*: keskiyö (oletus) tai klo 1.00–6.00. Rajalla 4 klo 2.30 tehty kirjaus kuuluu edelliseen päivään: `aika.päivä`, `loki.tänään`, Kalenterin merkinnät ja Aikajanan *tänään* noudattavat rajaa. `nyt.päivä` on tämä päivä samalla rajalla, joten vertaa kirjauksia siihen: `kirjaus.aika.päivä = nyt.päivä`. Kaavan `tänään` on aina kalenteripäivä (Päivämäärä-palikan *Tänään*, kalenterin korostus), joten klo 0–4 välillä `kirjaus.aika.päivä = tänään` ei osu eiliseen yöhön. Ilman rajaa molemmat ovat sama päivä. Taulukon paneelin osio *Historian haut* neuvoo saman.
- **Samasta lähteestä:** Aikajanan **Lähde** ja Kalenterin **Merkitse päivät** hyväksyvät historiataulukon; Toistin näyttää rivit kortteina; koosteet ja Rivijoukko laskevat samoista riveistä. Mitään ei kopioida, joten yksi kirjaus näkyy kaikissa kerran.
- **Vanha tekstiaikajana:** Aikajanan paneelin **Muunna historiaksi** (ks. [Aikajana](03-nakymapalikat.md#aikajana-aika)). Muunnos tehdään vain napista.

---

## Tulkki: teksti riveiksi tai palikoiksi

Appi-appi 40 (jonon 6, F27 kohta 2). Rakentajan työkalu, ei palikka: liität tekstiä, ja jokaisesta rivistä tulee taulukon rivi tai palikka. Esikatselu näyttää ensin, mitä tapahtuu; mitään ei muutu ennen **Hyväksy**-napautusta. Kertaluontoinen: liitetty teksti ei jää projektiin.

- **Löytyy:** Logiikan paletti, ryhmä **Tieto** → **Tulkki…** (⇄). Taulukkoikkunasta **⇄ Liitä tekstiä…**: silloin kohde on valmiiksi se taulukko, kuvio `{etu} = {taka}`, ja hyväksynnän jälkeen palataan taulukkoikkunaan.
- **Teksti on:**
  - **Rivejä kuviolla:** kuvio on tekstiä, jossa kentät ovat aaltosuluissa, esim. `{nimi}: {arvo}` tai `{etu} = {taka}`. Kenttien välissä oleva teksti on erotin (kenttien väliin on pakko kirjoittaa jotain). Rivillä vain erottimen **ensimmäinen** kohta jakaa, joten viimeinen kenttä saa loput (`klo: 9:30` → nimi *klo*, arvo *9:30*). Välit erottimen ympärillä eivät ratkaise (`yöuni:8` käy). Kuvion alku- ja loppuosan pitää löytyä riviltä (`- {etu} ({taka})`). Pelkkä väli kuviossa (`{a} {b}`) jakaa mistä tahansa määrästä välejä. Valmiit kuviot napeissa: *nimi: arvo*, *etu = taka*, *laji nimi: arvo*.
  - **Taulukko (Excel, Sheets, CSV):** erotin **Arvaa** (sarkain, jos ensimmäisellä rivillä on sarkain, muuten yleisempi puolipisteestä ja pilkusta), **Sarkain**, **Pilkku** tai **Puolipiste**. Excelistä ja Sheetsistä kopioidut solut tulevat sarkaimella. Lainausmerkeissä oleva kenttä voi sisältää erottimen, rivinvaihdon ja `""` (lainausmerkki). Ruksi **Ensimmäinen rivi on otsikot** (oletus): otsikot ovat kenttien nimet; ilman sitä kentät ovat *Sarake 1*, *Sarake 2* …
  - **Avaa tiedosto…** lukee tekstitiedoston kenttään (`.csv`- ja `.tsv`-tiedosto vaihtaa tavaksi Taulukko).
- **Mihin: Taulukon riveiksi.** Valitse taulukko tai **＋ Uusi taulukko** (nimi kentästä, oletus *Taulukko*; uusi taulukko tulee logiikkaan muiden alle).
  - Kentät yhdistetään sarakkeisiin nimen tai viitteen perusteella (kirjainkoko ei ratkaise). Puuttuvasta kentästä tulee uusi sarake; esikatselu kertoo sen nimen ja lajin. Laji päätellään arvoista: luku (myös desimaalipilkku), kyllä/ei, päivämäärä (`1.10.2026` tai `2026-10-01`) tai teksti.
  - Arvot muutetaan sarakkeen lajiin kuten taulukkoikkunassa. Väärän lajin arvo tekee rivistä virheen, joka ohitetaan.
  - **Yhdistä avaimella** (oletus ei): ilman avainta kaikki rivit lisätään uusina. Avaimella rivi, jolla on sama avain, päivittyy ja muut lisätään; tyhjä kenttä liitetyssä tekstissä ei pyyhi olemassa olevaa arvoa, ja taulukon omat sarakkeet ja rivit säilyvät. Saman avaimen toinen rivi samassa tekstissä päivittää ensimmäisen. Kirjaushistorian *Id*-sarake kelpaa avaimeksi (vain olemassa olevat rivit; tuntematon tunniste on virhe).
  - Rivit menevät **lähtöaineistoon**. Jos taulukolla on käyttötietoa, esikatselu sanoo, että uudet rivit näkyvät käytössä vasta, kun palautat lähtöaineistoon. Kirjaushistorian automaattinen *Aika* täyttyy lisäyshetkellä, kun teksti ei anna sitä.
- **Mihin: Palikoiksi.** Kenttä `{nimi}` on pakollinen, `{arvo}` valinnainen (puuttuu = tyhjä) ja `{laji}` valinnainen (`arvo`, `muisti` tai `teksti`). Ilman lajia käytetään valintaa **Laji** (Arvo, Muisti, Teksti; oletus Arvo). Muut kentät ohitetaan, ja esikatselu kertoo ne.
  - `yöuni: 8` → Arvo, nimi ja viite *yöuni*, arvo 8. `yöuni:` → Arvo, arvo tyhjä.
  - Arvo ja Muisti tulevat logiikkaan muiden alle, Teksti (näkymäpalikka) nykyiseen näkymään. Arvon kenttään menee teksti sellaisenaan (Muistille alkuarvo, Tekstille teksti).
  - Sama nimi (tai viite) päivittää olemassa olevan Arvon, Muistin tai Tekstin eikä tee tuplaa; kirjainkoko ei ratkaise. Virhe, jos nimi on jo muulla palikalla tai rivin laji on eri kuin olemassa olevan. Samassa tekstissä myöhempi rivi voittaa.
  - Kaava, joka odotti tuntematonta nimeä (`yöuni * 2`), sitoutuu luotuun palikkaan ja toimii heti.
- **Esikatselu:** yhteenveto (*N uutta · N muuttuu · N ennallaan · N virhettä (ohitetaan) · N tyhjää riviä ohitetaan*) ja jokainen rivi numeroineen ja tilansa kanssa: **uusi**, **muuttuu**, **ennallaan** tai **virhe** syineen (esim. *erotinta ”=” ei löydy*, *nimi puuttuu*, *lainausmerkki jää auki*, *kenttiä on enemmän kuin otsikoita*). Tyhjät rivit ohitetaan. Yli 200 riviä: loput lasketaan mutta ei listata. **Hyväksy (N)** on harmaana, kun mitään ei muutu.
- **Kumoa:** hyväksyntä on yksi ↶ Kumoa -askel (luodut palikat, taulukko, rivit ja uudet sarakkeet).
- **Tallennetut kuviot:** **Tallenna kuvio…** kysyy nimen ja tallentaa kuvion projektiin; se näkyy napiksi ★ nimi (× poistaa). Sama nimi korvaa vanhan. Enintään 30.
- **Rajat:** ei omaa kielioppia, sisäkkäisiä rakenteita eikä elävää tulkintaa (teksti muuttuu → rivit muuttuvat). Palikoiksi vain Arvo, Muisti ja Teksti. Appi ei kutsu tekoälyä: tekoäly voi tuottaa liitettävän tekstin keskustelussa.
- **Esimerkki (korttipakka):** Tulkki… → Rivejä kuviolla, kuvio `{etu} = {taka}`, Taulukon riveiksi, ＋ Uusi taulukko nimellä *Kortit*, teksti `kissa = cat` ja `koira = dog` omille riveilleen → Hyväksy (2). Syntyy taulukko *Kortit* (sarakkeet etu ja taka), jolle Toistin ja toiminto Valitse rivi tekevät korttipakan.

## Lähde: rivitiedosto GitHubista

Jonon 9 (F32 vaihe 1). Tietotaulukko voi hakea rivinsä tiedostosta, joka on samassa GitHub-repossa kuin projektit (esim. `master-tiedot`). Tiedoston voi kirjoittaa iPhonen pikakomento (terveystiedot), toinen oma appi tai tekoäly. Haku yhdistää rivit taulukon **käyttötietoon**; lähtöaineisto ei muutu.

- **Löytyy:** Tietotaulukon paneeli, osio **Lähde**.
  - **Tiedosto:** polku repossa, esim. `tuonnit/terveys.json`. Alun `/` jätetään pois. Tyhjä = ei lähdettä. Kun polku on, taulukko saa tapahtumat **haettu** ja **hakuvirhe** sekä ominaisuudet `haettu` ja `hakuvirhe`.
  - **Avain:** *tiedoston avaimen mukaan* (oletus: tiedoston kenttä `avain`), jokin taulukon sarake tai *ei avainta: korvaa rivit*. Id-saraketta ei voi valita.
  - **⤓ Hae nyt** hakee heti. Jos tiedostossa on kenttiä, joita taulukossa ei ole, ensin kysytään **Uusia sarakkeita tiedostosta**: rasti ja laji (arvattu arvoista: luku, kyllä/ei, ajankohta, päivämäärä tai teksti) jokaiselle, sitten **Lisää sarakkeet ja hae**, **Hae ilman niitä** tai **Peru**. Sarakkeiden lisäyksen voi kumota (↶ Kumoa); haettuja rivejä ei.
  - Tila: *Haettu 17.10.2026 klo 7.30. N uutta, N päivittyi, N ennallaan* (ja tarvittaessa *N arvoa ei sopinut sarakkeeseen*, *N riviä ilman avainta ohitettiin*), virhe punaisella aikoineen, ja kentät, joita taulukossa ei ole. Ilman GitHub-asetuksia: *GitHub-yhteys puuttuu*.
- **Logiikassa:** toiminto **Hae tiedostosta**, kohteena taulukko ([Toiminnot](05-ketjut-ja-toiminnot.md)). Sen *sitten* lähtee heti, kun haku alkaa; tulos tulee taulukon tapahtumina **haettu** tai **hakuvirhe**. Haku käynnistyy painikkeesta, ajastimesta tai ketjusta, joka käynnistyy, kun projekti avataan. Piirto tai kaava ei koskaan hae.
- **Tiedoston muoto:** rivitiedosto (JSON), pelkkä rivilista tai CSV (otsikkorivi = kenttien nimet).

```
{"muoto": "rivit", "ver": 1, "lahde": "terveys-pikakomento", "paivitetty": "2026-10-17T07:30:00+03:00",
 "avain": "paiva",
 "rivit": [{"paiva": "2026-10-16", "askeleet": 8412, "leposyke": 54},
           {"paiva": "2026-10-17", "askeleet": 1203, "leposyke": null}]}
```

  Kentät yhdistetään sarakkeisiin nimen tai viitteen perusteella (kirjainkoko ei ratkaise); tuntemattomat ohitetaan. Arvot muutetaan sarakkeen lajiin kuten taulukkoikkunassa; ISO-aikaleima (`2026-10-16T23:10:00+03:00`) käy ajankohdaksi ja päivämääräksi. `null` ja tyhjä = puuttuva tieto.
- **Yhdistäminen avaimella:** sama avain päivittää rivin tiedoston sarakkeet, uusi avain lisää rivin. Appin omat sarakkeet (esim. käsin kirjattu mieliala) ja rivit, joita tiedostossa ei enää ole, säilyvät. Tyhjä arvo ei pyyhi. Sama tiedosto kahdesti ei tee tuplia. Rivi ilman avainta ja väärän lajin arvo ohitetaan ja lasketaan tilaan.
- **Ilman avainta:** jokainen haku **korvaa** käyttötiedon rivit tiedoston riveillä (myös appin omat rivit poistuvat).
- **Virhe** (tiedostoa ei löydy, ei JSONia, ei rivejä, avainta ei ole, yksikään kenttä ei vastaa saraketta, GitHub-virhe) ei muuta rivejä. `hakuvirhe` kertoo syyn, `haettu` jää edellisen onnistuneen haun ajaksi.
- **Aika ja tila:** haun tila on käyttötietoa (tallentuu, Kokeilussa kokeilun kopioon). Sama taulukko ei hae kahdesti yhtä aikaa. Haku tehdään vain, kun appi on auki. Yli 1 Mt:n tiedosto haetaan erikseen (ei tarkistettu oikealla GitHubilla).
- **Esimerkki:** taulukko *Terveys*, sarakkeet paiva (päivämäärä) ja Mieliala (teksti). Lähde `tuonnit/terveys.json` → ⤓ Hae nyt → kysely ehdottaa sarakkeita askeleet ja leposyke (luku) → Lisää sarakkeet ja hae. Kirjoita Mielialaan käsin, hae huomenna uudelleen: mieliala säilyy, uusi päivä tulee riviksi. Painike + toiminto *Hae tiedostosta* hakee käytössä; Teksti `Haettu {terveys.haettu}`.

## Puuttuva tieto
Tyhjä kenttä on tallessa puuttuvana. Se näkyy merkkinä `–`.

- Se ei ole 0 eikä ei. Lasku sen kanssa on tuntematon (`ostokset.valittu.määrä * 2` on tyhjä, vertailu `> 1` ei päde).
- Koosteet (`.summa`, `.keskiarvo` …) ohittavat puuttuvat ja kertovat niiden määrän (`.puuttuvia`). Jos sarakkeessa on valittu **Koosteet vaativat täydelliset tiedot**, yksikin puuttuva tekee summasta ja keskiarvosta tuntemattoman.
- Kaikkien kenttien puuttuessa summa ja keskiarvo ovat tyhjiä; aivan tyhjän taulukon summa on 0.
- Virheellinen kenttä (esim. riviviite poistettuun riviin) estää koosteen ja näkyy virheenä rivinumeroineen.
- `.tiedossa` kertoo, onko kenttä täytetty.
- Toiminto **Lisää** puuttuvaan kenttään alkaa nollasta (päivämäärässä tästä päivästä), **Vaihda** puuttuvasta antaa kyllä.
- Lisää rivi -toiminnon tyhjä kenttä = puuttuu.
- Vanhojen palikoiden (Arvo, Muisti …) tyhjä toimii ennallaan; puuttuva on taulukon käsite.

---

## Rivikonteksti: milloin rivi on olemassa

Kolme tapaa osoittaa "tämä rivi":

| Rivi | Olemassa milloin | Mistä tulee |
|---|---|---|
| **valittu rivi** | aina, kun taulukossa on valinta | Valitse rivi -toiminto, taulukkoikkunan ●, Lisää rivi + **Valitse uusi rivi** |
| **tapahtuman rivi** | vain tapahtuman ketjussa: toiminnon tai ketjun käynnistäneessä tapahtumassa | Lisää rivi, Valitse rivi, Poista rivi, Siirrä rivi ja sarakkeeseen kirjoittava toiminto (sitten-tapahtuma); kortin painike; Toista riveille -kierros; toistimen **rivi siirretty** |
| **käsiteltävä rivi** | vain kun jokin käy rivejä läpi | Rivijoukon ehto ja järjestys, ikkuna **Riveille**, **Toista riveille** -kierros, Toistimen kortti |

Käsiteltävä rivi on siis olemassa vain:
1. Rivijoukon **ehto riveittäin**- ja **järjestä arvon mukaan** -kohtiin tulevassa laskennassa (jokaiselle riville erikseen).
2. Ikkunan sisällä, kun ikkunassa on **Riveille** päällä.
3. Toista riveille -palikan **kierros**-haarassa (kulkee tapahtuman mukana myös ajastimen ja odotuksen yli).
4. Toistimen kortin palikoissa (kortin rivi).

Muualla, esim. näkymän tavallisessa tekstissä tai logiikan kanvaasilla ikkunan ulkopuolella, käsiteltävää riviä ei ole: Rivi-palikka on tyhjä (`–`) ja sidottu kenttä harmaa. Ikkunan sisällä oleva kaava näyttää kanvaasilla `–`; oikeat riveittäiset arvot näkyvät ikkunan **Miksi?**-selityksessä. Jokainen rivi lasketaan erikseen, joten saman kaavan eri rivien tulokset eivät sekoitu.

---

## Tapahtuman tiedot (`tapaht`)
Antaa tiedot tapahtumasta, joka käynnisti toiminnon tai ketjun. Tiedot ovat tapahtumahetken mukaisia ja pysyvät samoina ketjun odotusten yli, vaikka arvot muuttuisivat.

- **Löytyy:** Logiikka → **Tieto** → **Tapahtuman tiedot** (✉), oletusnimi *Tapahtuma*, viite `tapahtuma`.
- **Ulos:** uusi (arvo), vanha (arvo), rivi (riviviite).
- **Asetukset (paneeli):** ei kenttiä, vain ohje.
- **Kaavassa:**

| Kaava | Antaa |
|---|---|
| `tapahtuma.uusi` (myös `.arvo`) | arvo tapahtumahetkellä |
| `tapahtuma.vanha` | arvo ennen tapahtumaa |
| `tapahtuma.rivi` | taulukon rivi (riviviite) |
| `tapahtuma.rivi.määrä` | sen rivin kenttä nyt |
| `tapahtuma.taulukko` | rivin taulukon nimi |
| `tapahtuma.lähde` | palikan nimi, josta tapahtuma lähti |
| `tapahtuma.aika`, `tapahtuma.päivä` | kellonaika (h.mm) ja päivä |
| `tapahtuma.tunniste`, `tapahtuma.on` | tunniste ja onko tapahtumaa |
| `tapahtuma.kohde`, `.isku`, `.puoli`, `.voima`, `.x`, `.y`, `.ruutux`, `.ruutuy` | törmäyksen, laskeutumisen ja napautuksen tiedot (muut luvut) |
| `tapahtuma.nappi` | Peliohjaimen *painettu* ja *irrotettu*: napin nimi, esim. `alanappi` |
| `tapahtuma.jäsen`, `tapahtuma.jäsen.<ominaisuus>` | Joukon *jäsen …* -tapahtuma ja Toista jäsenille -kierros: jäsenen nimi ja sen ominaisuus nyt ([Jäsenten tapahtumat](#jäsenten-tapahtumat-appi-appi-63)) |
| `tapahtuma.suunta` | janan merkissä 1 eteenpäin, −1 taaksepäin ([Jana](05-ketjut-ja-toiminnot.md#jana-jana)); `tapahtuma.uusi` on silloin merkin kohta |

- **Aika ja tila:** tiedot tallentuvat ketjun ajoon ja säilyvät odotusten ja appin sulkemisen yli. Ketjun käynnistämä aliketju perii tapahtuman.
- **Esimerkki:** Painike → Lisää rivi (Ostokset) → sitten → Näytä ilmoitus, tekstinä `Lisättiin {tapahtuma.rivi.nimi}`.
  - Valitse rivi -toiminnon jälkeen `tapahtuma.vanha` ja `tapahtuma.uusi` ovat valinta ennen ja jälkeen; Siirrä rivin jälkeen ne ovat rivin paikka (1 = ensimmäinen).
- **Huomio:** tapahtuman ulkopuolella (esim. näkymän tekstissä) arvot ovat tyhjiä. `tapahtuma.rivi.<sarake>` etsii sarakkeen sen **viitteellä**, koska taulukko selviää vasta tapahtumasta: jos sarakkeen viite vaihtuu, kaava antaa virheen (joka luettelee sarakkeet) ja se korjataan käsin (TILA.md, Appi-appi 13).

---

## Rivi (`trivi`)
Nimetty lähde yhdelle taulukon riville. Sarakkeet ovat sen ominaisuuksia, joten `kohde.määrä * kohde.hinta` laskee kullakin rivillä oman tuloksensa.

- **Löytyy:** Logiikka → **Tieto** → **Rivi** (▤), oletusnimi *Kohde*, viite `kohde`. Pikanapit: Toistimen paneelin **＋ Rivi-palikka kortin riville** (tekee *Kohde*-palikan, käsiteltävä rivi) ja kentän paneelin **＋ Rivi-palikka valittuun riviin** (tekee *Valinta*-palikan, valittu rivi).
- **Ulos:** rivi (riviviite).
- **Asetukset (paneeli):** osio **Rivi**:
  - **Taulukko**: valikko **— minkä taulukon rivi? —**.
  - **Mikä rivi**: **käsiteltävä rivi** (oletus), **valittu rivi**, **tapahtuman rivi**.
  - **Nyt:** näyttää, mikä rivi on juuri nyt (tai *ei riviä*).
- **Kaavassa:** `kohde.nimi`, `kohde.määrä` (sarakkeet), `kohde.nro` (rivin numero, 0 = ei riviä), `kohde.on` (onko riviä), `kohde.rivi` (riviviite), `kohde.määrä.tiedossa`. Tekstissä `{kohde.nimi}`.
- **Aika ja tila:** ei omaa tilaa. Arvo riippuu kontekstista (ks. Rivikonteksti).
- **Esimerkki:** Rivi *Kohde* (Ostokset, käsiteltävä rivi) ja Kaava `kohde.määrä * kohde.hinta` ikkunassa **SUMMA**, **Riveille** päällä, rivit nuolella Ostoksista: tulos on ostosten yhteishinta.
  - Toisenlainen käyttö: Rivi *Valinta* (valittu rivi), näkymän tekstissä `{valinta.nimi}`.
- **Huomio:** käsiteltävä ja tapahtuman rivi ovat näkymässä kortin ulkopuolella aina tyhjiä. Lomakkeeseen sopii valittu rivi. Jos rivi on poistettu, arvo on virhe *rivi on poistettu*.

---

## Rivijoukko (`joukko`)
Suodattaa ja järjestää taulukon rivejä muuttamatta niitä. Tulos on joukko samoja rivejä (ei kopioita).

- **Löytyy:** Logiikka → **Tieto** → **Rivijoukko** (☷), oletusnimi *Suodatus*, viite `suodatus` (Appi-appi 60; ennen *Joukko*, vanhat palikat ennallaan).
- **Sisään:**

| Kohta | Laji | Mitä tekee |
|---|---|---|
| rivit | arvo | nuoli Tietotaulukon tai toisen Rivijoukon kohdasta **rivit** (pakollinen) |
| ehto riveittäin | arvo | lasketaan jokaisella rivillä; rivi pääsee joukkoon, kun ehto pätee (puuttuva ei päde) |
| järjestä arvon mukaan | arvo | lasketaan jokaisella rivillä, järjestää sen mukaan |

- **Ulos:** rivejä (määrä), rivit (viedään eteenpäin).
- **Asetukset (paneeli):** osio **Rivijoukko**:
  - **Järjestys**: *lähteen järjestys* (tai *arvon mukaan*, jos järjestä-nuoli on) tai sarake. Sarake voittaa järjestä-nuolen.
  - **Suunta** (kun järjestys on): **nouseva (pienin ensin)** / **laskeva (suurin ensin)**. Tasatilanteessa lähteen järjestys säilyy, puuttuva arvo on aina lopussa.
  - **Enintään**: esim. 3 = kolme ensimmäistä järjestyksen jälkeen. Tyhjä = kaikki.
  - **Tulos:** montako riviä ja ensimmäisten nimet.
- **Kaavassa:** `suodatus.rivejä`, `suodatus.eka`, `suodatus.vika`, `suodatus.eka.nimi`, `suodatus.vika.nimi`, `suodatus.määrä.summa` (ja muut koosteet kuten taulukolla, vain suodatettujen rivien).
- **Aika ja tila:** lasketaan aina uudelleen. Ei tallenna mitään.
- **Esimerkki:** Ostokset → rivit → Suodatus. Kaava `kohde.määrä > 0` (kohde = Rivi, käsiteltävä rivi) nuolella kohtaan **ehto riveittäin**. Järjestys: Nimi. `suodatus.rivejä` kertoo, montako ostosta on jäljellä.
  - Toisenlainen käyttö: järjestys Määrä, laskeva, Enintään 1: `suodatus.eka.nimi` on suurin määrä.
- **Huomio:** joukko, jonka ehto lukee joukkoa itseään, antaa virheen *kehä*. Järjestä-nuolella eniten ensin: anna arvoksi esim. `0 - kohde.määrä`.

---

## Palikoiden joukot `#nimi` (Appi-appi 57)

Joukko kokoaa palikoita yhden nimen alle, esim. kaikki kolikot tai kaikki unen pisteet. Palikka liitetään joukkoon tagilla, ja kaava laskee joukon jäsenistä koosteen (`#kolikot.summa`). Toiminto voi kohdistua kaikkiin jäseniin kerralla. Joukko itsessään ei ole palikka; sille voi tehdä yhden **Joukko-palikan** (alla), joka ottaa jäseniä mukaan säännöllä ja ohjaa niitä. Älä sekoita **Rivijoukkoon** (yllä), joka suodattaa taulukon rivejä.

- **Löytyy:** valitse palikka, paneelin kenttä **Tunnus** (Nimen alla). Projektin joukot listataan Logiikka-välilehden paletissa ryhmässä **Joukot** (näkyy, kun projektissa on joukkoja).
- **Liitä palikka joukkoon:** kirjoita Tunnukseen viitteen perään `#nimi`, esim. `@uni #unipisteet #terveys`, ja paina Enter (tai napauta muualle). Joukkoja voi olla rajattomasti. Uusi nimi luo joukon heti. Kun kirjoitat `#`, kentän alle tulevat projektin joukot ehdotuksina; uudesta nimestä lukee *uusi joukko syntyy, kun vahvistat kentän*.
- **Poista palikka joukosta:** pyyhi `#nimi` Tunnuksesta ja vahvista.
- **Nimen säännöt:** kuten viitteellä (pienet kirjaimet, å, ä, ö, numerot, `_`, ei ala numerolla). Isot kirjaimet muuttuvat pieniksi. Kaksi joukkoa ei voi jakaa nimeä. Joukon nimi saa olla sama kuin jonkin palikan viite (`#uni` ja `uni` ovat eri asioita).
- **Kuka voi kuulua:** mikä tahansa palikka paitsi Ryhmä. Myös Kaava, Ikkuna ja näkymän palikat.
- **Paneelissa jäsenyydet:** Tunnuksen alla rivi jokaiselle joukolle: `#nimi` ja syy, miksi palikka on nyt jäsen tai ei ole: *jäsen (tagi)*, *jäsen nyt: ehto pätee*, *ei jäsen nyt: ehto ei päde*, *jäsen: Lisää joukkoon -toiminto* tai *ei jäsen: Poista joukosta -toiminto*. Kehys on korostettu, kun palikka on jäsen nyt.

### Kuuluu joukkoon kun (ehdollinen jäsenyys)

1. Valitse palikka. Napauta jäsenyysrivin nappia **⚡ kuuluu kun**.
2. Palikkaan tulee logiikassa kohta **kuuluu #nimi kun**, ja Tunnuksessa joukon perään tulee `⚡` (`@uni #terveys⚡`).
3. Vie kohtaan nuoli (esim. Kaava `uni > 7` tai Vertailu). Palikka on jäsen vain, kun nuolen arvo pätee. Useampi nuoli: kaikkien pitää päteä.
4. Ilman nuolta jäsenyys on tagin mukainen. Nappi uudelleen sulkee kohdan ja poistaa sen nuolet.

Ehdossa ei ole omaa kaavakenttää: ehto tehdään tavallisilla palikoilla nuolella. Ehto, joka lukee saman joukon koostetta, antaa virheen *kehä*.

### Joukko kaavassa

| Kirjoitus | Tulos |
|---|---|
| `#kolikot` | montako jäsentä (sama kuin `#kolikot.jäseniä`) |
| `#kolikot.summa` | jäsenten arvot yhteen |
| `#kolikot.keskiarvo`, `.suurin`, `.pienin` | jäsenten arvoista |
| `#kolikot.jäsenet` | jäsenten nimet pilkulla erotettuna, esim. *Eka, Toka* |
| `#kolikot.arvot` | jäsenten arvot luettelona |
| `#kolikot.havaintoja`, `.puuttuvia`, `.virheitä`, `.täydellinen` | kuten taulukon sarakkeella |
| `#kolikot.x.pienin` | jäsenten ominaisuus `x`, siitä kooste (mikä tahansa jäsenten ominaisuus, esim. `.leveys.summa`, `.näkyy.summa`) |
| `palikka.joukot` | palikan joukot nyt, nimet pilkulla (luettava ominaisuus kaikilla paitsi Ryhmällä), esim. `uni.joukot sisältää "terveys"`. Jos joukko, johon palikka voisi kuulua (tagi, *Lisää joukkoon* tai oma *kuuluu kun* -nuoli), on virheessä, `joukot` on virhe *joukko #x on virheessä: …* (Appi-appi 60; ennen joukko jäi hiljaa pois). Kehä näkyy kaikille. |

- **Ehdotukset:** `#` ehdottaa joukkojen nimiä (ja jäsenmäärää), `#nimi.` koosteita ja jäsenten ominaisuuksia: ensin kaikkien jäsenten yhteiset, sitten muut merkinnällä *vain osalla jäsenistä (1/2), muuten kooste on virhe* (Appi-appi 60).
- **Kääntyy itse:** `summa(#kolikot)` muuttuu kirjoittaessa muotoon `#kolikot.summa` (samoin `keskiarvo`, `suurin`, `pienin`, `jäseniä`, `jäsenet`, `arvot` ja muut koosteet).
- **Mitkä arvot lasketaan:** luvut; kyllä = 1 ja ei = 0. Teksti ja tyhjä ohitetaan (näkyvät määrissä *havaintoja* ja *puuttuvia*). Päivämäärille `.suurin` ja `.pienin`, kun lukuja ei ole. Yksikin virhe jäsenessä tekee koosteesta virheen (paitsi `.virheitä`).
- **Tyhjä joukko:** `.summa` = 0, `#x` = 0, `.keskiarvo`, `.suurin` ja `.pienin` puuttuvat.
- **Jäsen ilman ominaisuutta:** `#kolikot.x.summa`, kun jollain jäsenellä ei ole `x`:ää, on virhe, joka nimeää jäsenen.
- **Pelkkä ominaisuus ilman koostetta** (`#kolikot.x`) on virhe *valitse kooste*.
- **Järjestys:** jäsenet logiikan palikkajärjestyksessä (`.jäsenet`, `.arvot`).
- **Tuntematon joukko:** `#uusi.summa` antaa virheen *ei joukkoa: #uusi*. Kun vahvistat kaavan, alareunaan tulee kysymys *Joukkoa #uusi ei ole. Tehdäänkö? OK / Peruuta*; OK tekee joukon ja sen **Joukko-palikan** kaavan viereen (yksi Kumoa poistaa molemmat). Ehdotusrivin nappi **＋ Luo joukko #uusi** tekee saman (Appi-appi 69; ennen nappi teki pelkän joukon). Jos joukko tehdään myöhemmin (Tunnuksesta), kaava kytkeytyy siihen. Tunnus-kentän uusi `#nimi` tekee edelleen pelkän joukon ilman Joukko-palikkaa, koska tagi itse on jäsenyys.
- `#x = …` (kaava asettaa jäseniä) **ei ole tehty**.

### Joukko tekstissä

Näkymän teksteissä `#kolikot.summa` toimii kuten kaavassa: `Kolikoita #kolikot, yhteensä #kolikot.summa`. Kirjaimeen liimattuna `{%kolikot}a` (kuten `{uni}a`). `##` on merkki tekstinä, kun perässä on olemassa olevan joukon nimi: `##kolikot` näkyy käytössä `#kolikot`. Muu `#` (`#1`, `#tuntematon`) pysyy sellaisenaan. Tuntematon `#sana` jää tavalliseksi tekstiksi, eikä joukko luo itseään tekstistä; ehdotusrivillä on **＋ Luo joukko**. Tämä toimii kaikilla viittaustavoilla (`@`, `§`, `{ }`).

### Toiminto kaikille jäsenille

Toiminnon **Kohde**-valikossa on ryhmä *Joukko (jokainen jäsen)*: `#kolikot (jokainen jäsen)`. Toiminto tehdään jokaiselle jäsenelle, joka on jäsen toimintohetkellä, ja *sitten* lähtee kerran, kun kaikki on tehty. Kanvaasilla lause on esim. `#kolikot (jokainen jäsen) + 1`.

- **Mitä muutetaan**: jäsenten ominaisuudet (kaikkien jäsenten ominaisuudet yhdessä listassa). Jäsen, jolla valittua ominaisuutta ei ole, ohitetaan.
- Jäsenen oma arvo muuttuu vain lajeilla, joille toiminto muutenkin käy (esim. Aseta arvo Muistiin, ei Arvo-palikkaan).
- Toiminto ei koske itseään, vaikka kuuluisi joukkoon.
- Poistettu joukko: Kohde näyttää `#⚠nimi (poistettu)`, ja toiminto antaa virheen.

**Lisää joukkoon** ja **Poista joukosta** ovat toimintolajeja: kenttä **Joukko** ja **Kohde** (mikä tahansa palikka paitsi Ryhmä, myös toinen joukko). Ne muuttavat jäsenyyttä käytön ajan: tagi ei muutu, ja Tunnus näyttää edelleen rakentajan tagit. *Palauta perusarvo* (kaikki ominaisuudet) palauttaa jäsenyyden tagin mukaiseksi. Jos palikalla on *kuuluu kun* -nuoli, nuoli ratkaisee eikä toiminto vaikuta.

### Joukko-palikka (`pjoukko`, Appi-appi 62)

Joukko-palikka on joukon säännöt logiikassa: kuka otetaan mukaan ilman tagia, kuka rajataan pois ja mitä jäsenille tehdään jatkuvasti. Jokaisella joukolla on enintään yksi Joukko-palikka. Sen nimi on joukon nimi (`#hahmot`), eikä sillä ole omaa viitettä: kaavassa joukkoon viitataan `#hahmot`.

- **Löytyy:** Logiikka → **Tieto** → **Joukko** (⁂) tekee uuden joukon (`#joukko`, `#joukko2` …) ja sen palikan. Paletin ryhmässä **Joukot** napin **⁂** napautus tekee olemassa olevalle joukolle Joukko-palikan tai siirtyy siihen.
- **Sisään:** *näkyy kun*, *harmaana kun*, *vaihtoväri kun*, *siirto x*, *siirto y* (kiinteät). Nuoli Joukko-palikan kohtaan ohjaa saman kohdan kaikilla jäsenillä yhdellä arvolla. Jäsen, jolla kohtaa ei ole (esim. logiikkapalikka), ohitetaan.
- **Ulos:** *jäseniä* (luku), *jäsenet* (nimet; nuolena Toista jäsenille ja ikkunaan Jäsenille, Appi-appi 63) ja tapahtumat *jäsen …* (ks. [Jäsenten tapahtumat](#jäsenten-tapahtumat-appi-appi-63)).
- **Paneeli:**
  - **Nimi**: joukon nimi ilman `#`:ä. Vaihto nimeää joukon (kuten paletin Nimeä).
  - **Ota mukaan**: **Laji** (esim. Muoto), **Näkymä**, **Kerros** (kun näkymässä on kerroksia) ja **Ehto**. Jäseneksi tulee jokainen palikka, joka täyttää kaikki valitut, myös myöhemmin lisätyt. Ilman valintoja Ota mukaan on pois päältä.
  - **Vain jos**: ehto, joka rajaa kaikkia jäseniä (tagit, Lisää joukkoon, Ota mukaan, kuuluu kun).
  - **Jäsenet**: jokainen ehdokas ja syy (*tagi*, *Ota mukaan*, *Ota mukaan -ehto ei päde*, *Vain jos ei päde*, *rajattu pois* …). Napautus nimeen siirtyy palikkaan. **Pois** rajaa Ota mukaan -jäsenen pois, **Palauta** ottaa takaisin.
  - **Säännöt jäsenille**: **＋ Sääntö**, valitse kohta (näkyy kun, harmaana kun, vaihtoväri kun, siirto x/y tai Ota mukaan -lajin ohjattava ominaisuus, esim. *x*) ja kirjoita kaava. Sääntö, jossa on `jäsen`, lasketaan jokaiselle jäsenelle erikseen; sääntö ilman `jäsen`-sanaa (esim. `kyllä` tai `peli.käynnissä`) lasketaan kerran koko joukolle. Yksi sääntö per kohta; **×** poistaa. **Laskun virhe** (esim. tuntematon nimi tai jako nollalla) näkyy säännön alla: *⚠ jäsen ”Eka”: …* (ensimmäinen jäsen, jolla virhe on). Virheellinen sääntö ohjaa jäsentä kuten virheellinen oma nuoli: *näkyy kun* piilottaa, siirto ei siirrä (Appi-appi 66).
  - **Ehdotukset:** kirjoita `jäsen.`, niin ehdotusrivi näyttää jäsenten ominaisuudet: ensin kaikkien jäsenten yhteiset, sitten *vain osalla jäsenistä*. Ilman jäseniä ehdotukset tulevat Ota mukaan -lajista (Appi-appi 66).
- **`jäsen` kaavassa:** Ehto-, Vain jos- ja sääntökentissä `jäsen` on käsiteltävä palikka: `jäsen.x > 100`, `jäsen.näkyy`, `jäsen` (arvo). Jos jäsenellä ei ole ominaisuutta, ehto ei päde ja sääntö ohitetaan sen kohdalla (ei virhettä). Muualla `jäsen` on virhe, eikä se kelpaa viitteeksi. Poikkeus on Jäsenille-ikkunan sisällä oleva palikka: siinä `jäsen` on ikkunan käsittelemä jäsen, ja kanvaasilla se näyttää ”–”. `jäsen` ei kulje viitteen kautta: sääntö `apu > 0`, jossa Kaava *apu* on `jäsen.x`, on virhe, koska *apu* on ikkunan ulkopuolella (Appi-appi 66; ennen jokin Jäsenille-ikkuna missä tahansa teki ulkopuolisesta `jäsen`-kaavasta hiljaa tyhjän).
- **Ominaisuudet:** `#hahmot` ja `#hahmot.jäseniä` (määrä), `#hahmot.jäsenet` (nimet). Koosteet kuten joukolla yleensä.
- **Arvo:** jäsenten määrä. Jos jokin sääntö tai nuoli Joukko-palikan kohtaan antaa jollekin jäsenelle virheen, arvo on virhe (*sääntö näkyy kun, jäsen ”Eka”: …*) ja palikka näkyy virheenä kuten Kaava (Appi-appi 66).
- **Etusija jäsenyydessä:** *Vain jos* > palikan oma *kuuluu kun* -nuoli > Lisää joukkoon / Poista joukosta > tagi tai Ota mukaan.
- **Etusija ohjauksessa:** jäsenen oma nuoli tai oma asetus (esim. paneelin *Näkyy*-ehto) > Joukko-palikan nuoli > Joukko-palikan sääntö > toiminnon asettama > perusarvo. Jos kaksi joukkoa ohjaa samaa kohtaa, ensin tehty Joukko-palikka voittaa. Jäsenen paneelin jäsenyysrivi kertoo, mitä joukko ohjaa (*ohjaa: näkyy kun*), mikä jää ohjaamatta ja säännön virheen (*⚠ joukon #x sääntö (näkyy kun): virhe: …*). Ominaisuudet-osiossa joukon ohjaama arvo on merkitty ⁂.
- **Korostus:** kun Joukko-palikka on valittuna, jäsenet saavat pisteviivareunan näkymässä ja logiikassa. Logiikassa palikan alla näkyvät ensimmäiset jäsenet siruina; napautus siirtyy jäseneen.
- **Miksi?:** luettelee ehdokkaat ja syyt (enintään 12) ja säännön virheet. Jäsenen Miksi? kertoo, mikä joukko ohjaa sen kohtaa ja millä arvolla tai virheellä (*Joukko #seinat ohjaa kohtaa ”näkyy kun” (sääntö jäsenille): ⚠ virhe: …*).
- **Poisto:** Joukko-palikan poisto poistaa vain säännöt; joukko ja tagit jäävät. Joukon poisto paletista poistaa myös sen Joukko-palikan.
- **Kopiointi:** monistettaessa saman projektin sisällä syntyy uusi joukko (`#hahmot2`, kuten viitteillä; lopussa oleva numero kasvaa: `#joukko2` → `#joukko3`; Appi-appi 62–64 tekivät `#hahmot_2`, ja vanhat nimet säilyvät), koska joukolla voi olla vain yksi palikka. Toiseen projektiin liitettäessä pois rajatut (*Pois*) jäävät pois.
- **Huomio:** sääntö, joka lukee ominaisuutta, jota se itse ohjaa (esim. *näkyy kun* `jäsen.näkyy`), antaa virheen *kehä*. `#x = …` (kaava asettaa jäsenille) ei ole tehty; käytä sääntöä.
- **Esimerkki:** Ota mukaan, Laji *Muoto*, Näkymä *Pelikenttä*; Vain jos `jäsen.x > 0`; sääntö *näkyy kun* `jäsen.x < 800`. Kaava `#joukko` kertoo, montako muotoa on ruudulla.

### Jäsenten tapahtumat (Appi-appi 63)

Joukko-palikasta lähtee tapahtuma aina, kun joku sen jäsenistä lähettää saman tapahtuman. Yksi nuoli riittää kaikille kolikoille, vihollisille tai napeille, myös myöhemmin lisätyille.

- **Kohdat (kiinteät, eivät riipu hetken jäsenistä):** aina *jäsen muuttui*, *jäsen raahaus alkoi*, *jäsen pudotettu*, *jäsen raahaus peruttu*, *jäsen napautettu* ja *jäsen pitkä painallus* (näkymäpalikoiden yhteiset; *jäsen napautettu* lähtee napautettavasta palikasta, Alueen napautuksesta ja myös Painikkeen painalluksesta, Appi-appi 68). Kaikilta kolmelta tulevat samat tiedot `tapahtuma.x` ja `tapahtuma.y` (kohta palikassa tai Alueessa px; ruudukollisella Alueella myös `tapahtuma.ruutux`/`.ruutuy`; Painikkeelta tyhjä, kun sitä painetaan näppäimistöllä tai ohjaimella), ja Alue lähettää sen ilman omaa nuoltakin (Appi-appi 70). *Jäsen pitkä painallus* korvaa jäsenen tavallisen napautuksen tai painalluksen vain tämän joukon jäsenillä. Paneelin osio **Jäsenten tapahtumat** → **Jäsenten laji** lisää lajin omat tapahtumat kaikkine asetusvaihtoehtoineen, esim. *Painike* → *jäsen painettu*, *jäsen pitkä painallus*, *jäsen irrotettu*; *Liike* → *jäsen törmäsi*, *jäsen perillä*, *jäsen askel valmis*; näkymäpalikkalajit (esim. *Muoto*, *Kuva*, *Painike*) → lajin omien lisäksi samat Liikkeen tapahtumat, koska mikä tahansa näkymäpalikka voi liikkua (Appi-appi 66); *Alue* → *jäsen astuttu*, *jäsen poistuttu*, *jäsen napautettu*. Oletus *Vain yhteiset*. Lajin vaihto poistaa nuolet kohdista, joita uudella lajilla ei ole.
- **Kuka lähettää:** jäsen tapahtumahetkellä (tagi, Ota mukaan, Lisää joukkoon …). Jäsen, jolla tapahtumaa ei ole, ei lähetä sitä. **Liikkeen tapahtumat** (törmäsi, perillä, askel valmis, päässä) lähtevät sekä Liikkeen että sen liikuttaman palikan jäsentapahtumina: kun vihollinen (Muoto) on joukossa `#viholliset` ja sen Liike törmää, Joukko-palikasta lähtee *jäsen törmäsi*, jäsen on Muoto ja `tapahtuma.lähde` on Liike (Appi-appi 66; ennen vain Liike-jäsen lähetti). Liike jäsenenä toimii ennallaan.
- **Tapahtuman tiedot:** jäsenen oma tapahtuma sellaisenaan (esim. `tapahtuma.kohde` ja `tapahtuma.isku` törmäyksessä) ja lisäksi `tapahtuma.jäsen` (jäsenen nimi) ja `tapahtuma.jäsen.<ominaisuus>` (esim. `tapahtuma.jäsen.x`). Ilman jäsentä `tapahtuma.jäsen` on tyhjä.
- **Toiminnon kohde Tapahtuman jäsen:** Toiminnon **Kohde**-valikon rivi *Tapahtuman jäsen* (lajeille, jotka käyvät myös joukolle): toiminto kohdistuu siihen jäseneen, jonka tapahtuma sen käynnisti (*jäsen …* -tapahtuma tai Toista jäsenille -kierros). **Mitä muutetaan** listaa projektin joukkojen jäsenten ominaisuudet; jäsen, jolla valittua ominaisuutta ei ole, ohitetaan, ja Toiminnon Miksi? sekä ketjun info kertovat sen (*Viimeksi ohitettu: jäsenellä ”Kävely” ei ole ominaisuutta väri*, Appi-appi 66). Ilman jäsentä toiminto näyttää virheen *tapahtumalla ei ole jäsentä*.
- **Esimerkki (napit):** Painikkeet Tunnuksella `#napit`. Joukko-palikka `#napit`, Jäsenten laji *Painike*. Nuoli *jäsen painettu* → Toiminto **Lisää** → *Pisteet* ja toinen nuoli → Toiminto **Aseta arvo**, Kohde *Tapahtuman jäsen*, Mitä muutetaan *väri*, arvo `3`. Painettu nappi vaihtaa väriä ja piste tulee. Ikkuna MONTAKO PÄTEE, **Jäsenille**, sisällä Kaava `jäsen.väri = 3` kertoo, montako on painettu.
- **Esimerkki (kolikot, rakennuslaatikon Kolikko):** jokaisella kolikolla on Muoto, Alue Tunnuksella `#kolikot` ja Kaava `kolikkoalue.joukot sisältää "kolikot"` Muodon *näkyy kun* -kohtaan. Yhteinen osa tehdään kerran: Joukko-palikka `#kolikot`, Jäsenten laji *Alue*, nuolet *jäsen astuttu* → **Poista joukosta** `#kolikot`, Kohde *Tapahtuman jäsen*, ja → **Lisää** *Pisteet* 1. Jäsenyys on kolikon muisti: kerätty alue ei ole enää joukossa, joten se ei lähetä tapahtumaa uudestaan eikä sen Muoto näy. Uusi kolikko tarvitsee vain kolme palikkaa, ja pistemäärän muutos tehdään yhteen Toimintoon. *Palauta perusarvo* tuo kaikki kolikot takaisin.

### Nimeä ja poista (paletti)

Logiikan paletin ryhmä **Joukot**: jokaisella joukolla jäsenmäärä nyt ja napit:

- **Nimeä**: uusi nimi. Kaavat, tekstit ja toiminnot näyttävät heti uuden nimen (ne tallentuvat tunnisteella).
- **Poista**: vahvistus kertoo, monelta palikalta tagi lähtee ja montako kaavaa, tekstiä tai toimintoa viittaa joukkoon. Viittaukset jäävät näkyviin muodossa `#⚠nimi` ja antavat virheen *joukko poistettu*. Samanniminen uusi joukko ei peri niitä. Kumoa palauttaa.

### Kopiointi ja tallennus

- **Monista, kopioi ja liitä:** tagit seuraavat. Toiseen projektiin liitettäessä joukot yhdistyvät nimen mukaan, ja puuttuva joukko luodaan. Sama koskee presettejä.
- **Tallennus:** projektin joukot (`jkr`), palikan tagit ja avatut *kuuluu kun* -kohdat ovat rakennetta. Toimintojen tekemät jäsenyysmuutokset ovat käyttötietoa. Joukko-palikka (`pjoukko`: `jj`, `otl`, `otv`, `otk`, `otf`, `vjf`, `jex`, `jsr`, `jlj`) on rakennetta, samoin Toiminnon `otj`, ikkunan `jas` ja Toista-palikan `tapa:'jasenet'`. Tallennusversio 12 (Appi-appi 63; Joukko-palikka tuli versiossa 11, joukot versiossa 10); vanhat tallennukset aukeavat ennallaan.
- **Keveys:** jäsenyys lasketaan kerran arviointia kohden, ja tagihakemisto muistetaan ajon ajan.

---

## Ikkuna riveille
Tavallinen ikkuna (Logiikka → Ikkunat), jossa valinta **Riveille: sisältö lasketaan jokaisella rivillä**. Valinta näkyy ikkunan paneelissa vasta, kun projektissa on Tietotaulukko.

- Kun valinta on päällä, ikkunaan tulee kohta **rivit**: vie siihen nuoli taulukon tai Rivijoukon kohdasta rivit.
- Ikkunan sisällä olevat palikat lasketaan jokaisella rivillä (Rivi-palikka, käsiteltävä rivi) ja tulokset yhdistetään valitulla tavalla: SUMMA, KESKIARVO, SUURIN, PIENIN, MONTAKO PÄTEE, JA, TAI …
- Puuttuvat ohitetaan; paneeli näyttää *tiedossa* ja *puuttuu*. Valinta **Vaatii täydelliset tiedot (yksikin puuttuva → tuntematon)** SUMMA-, KESKIARVO-, SUURIN- ja PIENIN-ikkunoille.
- Kaavassa ikkunan `.rivejä`, `.havaintoja`, `.puuttuvia`.
- Huomio: jos ikkunassa on monta palikkaa, kaikkien arvot kootaan yhteen (SUMMA laskee molemmat kaavat kaikilta riveiltä). Tavallisesti ikkunaan laitetaan yksi kaava tai vertailu (avoin kysymys TILA.md:ssä).

## Ikkuna jäsenille (Appi-appi 63)
Sama kuin Riveille, mutta joukon jäsenille: ikkunan paneelissa **Jäsenille: sisältö lasketaan jokaiselle joukon jäsenelle** (näkyy, kun projektissa on joukkoja; Riveille voittaa, jos molemmat).

- Ikkunaan tulee kohta **jäsenet**: vie siihen nuoli Joukko-palikan kohdasta *jäsenet*.
- Ikkunan sisällä `jäsen` on käsiteltävä jäsen: Kaava `jäsen.y > 400` MONTAKO PÄTEE -ikkunassa kertoo, montako jäsentä on alhaalla; `jäsen.leveys` SUMMA-ikkunassa laskee leveydet yhteen. Ikkunan ulkopuolella (esim. kaavan oma arvo kanvaasilla) `jäsen` on tyhjä.
- Paneeli näyttää jäsenet; Miksi? kertoo jäsenten määrän tai virheen (esim. *jäsen ”Laatta 2”: …*).

## Toista jäsenille (Appi-appi 63)
Ketjun **Toista**-palikan valinta **jäsenille** (näkyy, kun projektissa on joukkoja).

- Kohta *kerrat* vaihtuu kohdaksi **jäsenet**: nuoli Joukko-palikan kohdasta *jäsenet*.
- Ketju kulkee **kierros**-haaraan kerran jokaiselle jäsenelle ja lopuksi **valmis**-haaraan. Vedä kierros-haaran viimeisestä tapahtumasta viiva takaisin Toista-palikkaan.
- Jäsenet otetaan talteen, kun toisto alkaa. Kierroksella `tapahtuma.jäsen` on käsiteltävä jäsen ja Toiminnon kohde **Tapahtuman jäsen** kohdistuu siihen. Kesken poistettu jäsen ohitetaan.
- Ero Toimintoon, jonka kohde on `#joukko (jokainen jäsen)`: Toista jäsenille voi tehdä jäsenkohtaisen sarjan (esim. siirto, odota 0,2 s, seuraava).

## Toista riveille
Ketjun **Toista**-palikan paneelissa valinta **Toista**: **N kertaa** / **riveille** (näkyy, kun projektissa on Tietotaulukko).

- Riveille-tavassa kohta *kerrat* vaihtuu kohdaksi **rivit**: nuoli taulukosta tai Rivijoukosta.
- Ketju kulkee **kierros**-haaraan kerran jokaiselle riville ja lopuksi **valmis**-haaraan. Vedä kierros-haaran viimeisestä tapahtumasta viiva takaisin Toista-palikkaan.
- Rivit otetaan talteen, kun toisto alkaa. Kierroksella rivi on **tapahtuman rivi** (esim. Aseta arvo, Mikä rivi: Tapahtuman rivi) ja Rivi-palikan **käsiteltävä rivi**.
- Jos käsittelemätön rivi poistetaan kesken, ketju pysähtyy virheeseen.

---

## Toistin ✦ (`toistin`)
Näkymän kehys, joka näyttää saman kortin jokaiselle riville. Kortin malli tehdään kerran; rivin lisäys tai poisto lisää tai poistaa kortin itsestään.

✦ Poikkeus: vain kohdat **näkyy kun** ja **rivit**, koska kortit ovat sen sisällä.

- **Löytyy:** Näkymä-välilehti, paletin ryhmä **Näyttö** → **Toistin** (⧉). Näkyy paletissa vasta, kun projektissa on Tietotaulukko.
- **Sisään:** näkyy kun (arvo), rivit (arvo: nuoli Tietotaulukon tai Rivijoukon kohdasta rivit). Nuoli vedetään Logiikka-välilehdellä; paneelin **Näytä logiikassa** vie toistimeen.
- **Ulos:** kortteja (arvo: korttien määrä). Kun **Järjestä raahaamalla** on päällä: tapahtuma **rivi siirretty**.
- **Asetukset (paneeli):** osio **Toistin**:
  - **Kortteja** N (taulukko ...) ja **Kortin malli** (mallin palikoiden nimet).
  - **Kortit**: **allekkain** (oletus, vierii pystyyn), **vierekkäin** (vierii sivuttain), **ruudukko** (niin monta rinnakkain kuin leveyteen mahtuu).
  - **Järjestä raahaamalla** (ks. alla).
  - **Kortin leveys** (0 = toistimen leveys), **Kortin korkeus** (oletus 64), **Väli** (oletus 8).
  - **＋ Rivi-palikka kortin riville** (näkyy, jos taulukolle ei vielä ole käsiteltävän rivin Rivi-palikkaa).
- **Kortin palikat (malli):** vedä palikka katkoviivalla merkittyyn **ensimmäiseen korttiin**. Palikka kuuluu malliin, kun sen keskikohta on ensimmäisen kortin sisällä. Muokatessa malli näyttää ensimmäisen rivin arvot ja muut kortit näkyvät haaleina (enintään 60). Toistinta siirrettäessä malli tulee mukana. Palikka irtoaa, kun sen vetää pois kortista, tai paneelin osion **Kortissa** painikkeella **Irrota kortista**. **Valitse toistin** valitsee kehyksen.
  - Korttiin käyvät: Painike, Valintaruutu, Kytkin, Säädin, Tekstikenttä, Lukukenttä, Päivämäärä, Teksti, Monitori, Kuva ja Muoto. Muut (esim. Lista, Kalenteri, Tatti, toinen Toistin) eivät liity malliin.
  - Kortin tekstit ja kaavat lukevat kortin riviä Rivi-palikan (käsiteltävä rivi) kautta, esim. `{kohde.nimi}`.
  - Kortin painike lähettää tapahtuman, jonka rivi on kortin rivi: taulukkotoiminnossa valitse **Mikä rivi: Tapahtuman rivi**.
  - Kenttä (Tekstikenttä, Lukukenttä, Valintaruutu, Kytkin, Säädin, Päivämäärä) sidotaan sarakkeeseen kentän paneelin osiosta **Kortissa**: **Rivi** = *kortin rivi*, **Arvo sarakkeesta** = sarake. Sidottu kenttä näyttää ja muuttaa rivin saraketta suoraan; sama rivi näyttää saman arvon kaikkialla. Sitomaton kenttä tai rasti on kortin oma (rivikohtainen) arvo.
- **Korttien järjestys raahaamalla:** paneelissa **Järjestä raahaamalla**. Lukitussa näkymässä korttia raahataan uuteen paikkaan: hiirellä vetämällä, sormella pitkällä painalluksella (noin 0,35 s), joten tavallinen pyyhkäisy vierittää yhä kortteja. Taulukon rivijärjestys muuttuu käyttötiedossa (lähtöaineisto säilyy). Toimii vain, kun rivit tulevat nuolella **suoraan Tietotaulukosta**; Rivijoukon kanssa paneeli kertoo, ettei järjestys muutu. Tapahtumassa **rivi siirretty**: `tapahtuma.rivi`, `tapahtuma.vanha` ja `tapahtuma.uusi` (paikka, 1 = ensimmäinen).
- **Kaavassa:** toistimen arvo on korttien määrä.
- **Aika ja tila:** kortin oma tila (sitomaton kenttä, rasti, painallukset) on käyttötietoa rivikohtaisesti; rivin poisto poistaa sen. Rivin järjestyksen muutos ei siirrä tilaa toiselle riville.
- **Esimerkki:** ks. resepti *Ostoslista taulukolla ja toistimella*.
  - Toisenlainen käyttö: kaksi toistinta eri näkymissä samoista riveistä (toinen ruudukkona): sidottu määrä on yhteinen, sitomaton rasti kummankin oma.
- **Huomio:**
  - Toistin toistimen sisällä, efektit ja Tyhjennä yksittäiseen korttiin, kortin palikan oma kerros eivät ole mahdollisia (TILA.md, Appi-appi 15 ei tehty). Kaikki kortit piirretään (ei virtualisointia); selaimessa kokeiltu 40, moottorissa 100 riviä.
  - Kortin lukukenttä ja lomakkeen lukukenttä eroavat: tyhjennetty lukukenttä kirjoittaa kortissa nollan, lomakkeessa puuttuvan; Tyhjennä-toiminto ei tyhjennä kortin kenttää (avoin kysymys TILA.md:ssä).
  - Kapeassa kortissa Lukukentän omat −/+ voivat peittää luvun; näytä määrä silloin Tekstinä.

---

## Muokkauslomake (kenttä sidottuna riviin)
Tavallinen kenttä missä tahansa näkymässä voidaan sitoa taulukon riviin, jolloin se näyttää ja muuttaa rivin saraketta (Appi-appi 16).

- **Missä:** Tekstikentän, Lukukentän, Valintaruudun, Kytkimen, Säätimen tai Päivämäärän paneelissa osio **Rivin sarake** (näkyy, kun projektissa on Tietotaulukko).
- **Kentät:** **Rivi** (*ei sidottu* tai Rivi-palikka listasta, esim. *Valinta (Ostokset · valittu rivi)*) ja **Arvo sarakkeesta** (sarake). Painike **＋ Rivi-palikka valittuun riviin** tekee Rivi-palikan *Valinta* (ensimmäisen taulukon valittu rivi) ja sitoo siihen; valitse vielä sarake.
- **Toiminta:** kenttä näyttää rivin sarakkeen ja muutos kirjoittaa riville heti (käyttötietoon). Rivi vaihdetaan tavallisella **Valitse rivi** -toiminnolla (esim. kortin painike → Tapahtuman rivi, tai Seuraava). Ilman riviä (ei valittua, rivi poistettu) kenttä on tyhjä ja harmaa eikä kirjoita.
- Logiikan Aseta, Lisää, Vaihda ja Tyhjennä kenttään kirjoittavat riville.
- Rivin vaihtuminen ei ole käyttäjän muutos: kentän tapahtuma **muuttui** lähtee vain käyttäjän muutoksesta.
- **Rajat:** ei uutta riviä suoraan lomakkeesta (tee Lisää rivi -toiminnolla, ks. resepti), ei tallenna/peru-vaihetta (muutos heti voimaan), ei valintalistaa valinta-sarakkeelle, ei sidontaa suoraan Rivijoukon ensimmäiseen riviin. Aseta kenttään, jolla ei ole riviä, ei kirjoita mitään eikä kerro siitä. Käsiteltävän tai tapahtuman rivin Rivi-palikka on lomakkeessa aina harmaa.

---

## Rivitoiminnot (lyhyesti)
Toiminto-palikka (Logiikka, tai painikkeen paneelin **Kun painetaan** → **＋ Lisää toiminto…**), **Kohde** = Tietotaulukko. Täysi toimintojen taulukko on ketjuluvussa.

| Toiminto | Paneelin kentät | Mitä tekee | Sitten-tapahtuma |
|---|---|---|---|
| **Kirjaa** | kuten Lisää rivi (ei Id-kenttää); aika-kenttä tyhjänä = nyt | lisää kirjauksen loppuun ja täyttää ajan ([Kirjaushistoria](#kirjaushistoria)). Taulukossa oltava ajankohta-sarake. | rivi = uusi kirjaus |
| **Lisää rivi** | kenttä jokaiselle sarakkeelle (kaavoja), **Valitse uusi rivi** | lisää rivin loppuun; arvot lasketaan lisäyshetkellä (tilannekuva). Teksti lainausmerkeissä `"Maito"`, `tänään`, `nyt`, viite palikkaan, `tapahtuma.uusi`. Virheellinen kenttä → riviä ei lisätä, virhe näkyy ilmoituksena. | rivi = uusi rivi |
| **Valitse rivi** | **Mikä rivi**: ensimmäinen, seuraava (oletus), edellinen, viimeinen, tapahtuman rivi, arvosta (numero tai rivi), ei mitään. Seuraavalla ja edellisellä **Lopusta alkuun (ja alusta loppuun)**. Arvosta: kenttä **Rivi** tai nuoli kohtaan arvo. | vaihtaa valitun rivin | rivi = valittu; vanha ja uusi = valinta ennen ja jälkeen |
| **Poista rivi** | **Mikä rivi**: Valittu rivi / Tapahtuman rivi | poistaa rivin; jos se oli valittu, valinta siirtyy seuraavaan | rivi = poistettu |
| **Siirrä rivi** | **Mikä rivi**, **Suunta**: Ylös / Alas | vaihtaa paikkaa viereisen kanssa; reunalla ei siirry | vanha ja uusi = paikka |
| **Aseta arvo**, **Lisää**, **Vaihda**, **Tyhjennä** | **Sarake**, **Mikä rivi** (+ Uusi arvo / Määrä) | muuttaa yhden kentän. Lisää: luku- tai päivämääräsarake. Vaihda: kyllä/ei-sarake. Tyhjennä ilman saraketta (*kaikki rivit*) tyhjentää koko taulukon. | rivi, vanha, uusi |

Valittu rivi -tilassa toiminto antaa virheen, jos valittua riviä ei ole. Kortin painikkeessa käytä aina **Tapahtuman rivi**.

---

## Lista ja Aikajana suhteessa taulukkoon
Lista (Näkymä → Näyttö → **Lista**) ja Aikajana (**Aikajana**) ovat vanhempia, yksinkertaisia näyttöjä, eivät Tietotaulukoita.

- **Lisää riviksi listaan** lisää Listaan tekstirivin, **Kirjaa** lisää Aikajanalle merkinnän aikaleimalla. Molemmissa kenttä **Teksti**, jossa `@viite` toimii.
- Kaavassa Listalla esim. `lista.rivi2`, `lista.rivi2.rastitettu`, `lista.rivi2.pvm`, Aikajanalla `aikajana.viimeisin.teksti` ja `.viimeisin.aika` (viite palikan mukaan).
- Listan ja Aikajanan rivit eivät käy Rivijoukon, Toistimen, ikkunan Riveille tai Toista riveille -palikan **rivit**-kohtaan (virhe: *tuo nuoli Tietotaulukosta tai Rivijoukosta*). Sarakkeita, koosteita tai riviviitteitä niillä ei ole.
- Kun tarvitset sarakkeita, laskentaa tai kortteja, käytä Tietotaulukkoa: Kirjaa kirjoittaa myös taulukkoon ([Kirjaushistoria](#kirjaushistoria)), ja vanhan aikajanan voi muuntaa napista **Muunna historiaksi**. Aikajana voi näyttää historiataulukkoa (Lähde).

---

## Reseptit

### Kirjausappi: mitä otin ja milloin
1. Logiikkaan Tietotaulukko *Loki*, sarakkeet Kohde (teksti) ja Määrä (luku). Paneelin **Tee kirjaushistoria**: alkuun Aika ja Id.
2. Näkymään Painike *Kahvi*. *Kun painetaan* → ＋ Lisää toiminto… → **Kirjaa**, kohde Loki. Kentät: Kohde `"Kahvi"`, Määrä `1`, Aika tyhjä.
3. Teksti: `Tänään {loki.tänään}, viimeksi {loki.viimeisin.kohde} ({loki.edellisestä} min sitten)`.
4. Aikajana, Lähde *Loki*: kirjaukset uusin ylimpänä. Kalenteri, Merkitse päivät *Loki*: päivät pisteinä, päivän napautus listaa kirjaukset kellonaikoineen.
5. Päivän kooste: Rivi *Kirjaus* (taulukko Loki), Rivijoukko *Päivä* (rivit Lokista, ehto Kaava `kirjaus.aika.päivä = nyt.päivä`), teksti `{päivä.määrä.summa} kpl tänään`. Älä nimeä joukkoa *Tänään*: `tänään` on kaavan avainsana.
6. Väärä kirjaus: avaa taulukko ja korjaa tai poista rivi. Tyhjä määrä on puuttuva, ei 0: summa ohittaa sen.
- Tilannekuva vs. elävä: jos Kohde on riviviite tuotetaulukkoon ja kirjaukseen kopioidaan hinta, `loki.viimeisin.hinta` pysyy kirjaushetken hintana ja `loki.viimeisin.tuote.hinta` seuraa nykyistä.

### Ostoslista taulukolla ja toistimella
1. **Logiikka**-välilehti → paletti **Tieto** → **Tietotaulukko**. Paneelissa nimeksi *Ostokset*.
2. **＋ Sarake** kahdesti: ensimmäinen *Nimi* (teksti), toinen *Määrä*, laji **luku**.
3. **Avaa taulukko…** → **＋ Rivi** ja kirjoita esim. Maito 2, Leipä 1. **Valmis**.
4. **Näkymä**-välilehti → paletti **Näyttö** → **Toistin**. Paneelissa **Kortit: allekkain**, kortin korkeus esim. 56.
5. Logiikka-välilehdellä vedä nuoli Ostokset-palikan kohdasta **rivit** Toistimen kohtaan **rivit** (veto kohdan pisteestä toisen kohdan pisteeseen; nuolen teko tarkemmin logiikkaluvussa). Kortteja on nyt 2.
6. Valitse Toistin ja paina paneelista **＋ Rivi-palikka kortin riville**: logiikkaan tulee *Kohde*.
7. Näkymässä vedä **Teksti** katkoviivalla merkittyyn ensimmäiseen korttiin ja kirjoita tekstiksi `{kohde.nimi}: {kohde.määrä}`. Muut kortit näyttävät haaleina omat rivinsä.
8. Vedä korttiin **Painike**, teksti `+`. Painikkeen paneelissa **Kun painetaan** → **＋ Lisää toiminto…** → **Lisää**. Toiminnon paneelissa **Kohde**: Ostokset, **Sarake**: Määrä, **Mikä rivi**: Tapahtuman rivi, Määrä tyhjä (= 1).
9. **🔒 Lukitse** ja paina jonkin kortin `+`: vain sen rivin määrä kasvaa.

### Uuden rivin lisääminen lomakkeesta painikkeella
1. Näkymään **Tekstikenttä**, nimi *Uusi* (viite `uusi`), ja **Painike** tekstillä *Lisää*.
2. Painikkeen paneeli → **Kun painetaan** → **＋ Lisää toiminto…** → **Lisää rivi**. **Kohde**: Ostokset.
3. Sarakkeen *Nimi* kenttään `uusi`, sarakkeen *Määrä* kenttään `1`. Valitse halutessasi **Valitse uusi rivi**.
4. Toiminnon paneelin **Sitten** → **＋ Lisää toiminto…** → **Tyhjennä**, **Kohde**: Uusi (kenttä tyhjenee lisäyksen jälkeen).
5. Lukitse, kirjoita kenttään *Kahvi* ja paina *Lisää*: taulukkoon tulee rivi ja Toistimeen kortti. Tyhjän nimen estämiseksi tee lisäys ketjuna, jossa ensin **Ehto** (nimi ei tyhjä) ja vasta sitten Lisää rivi, ks. ketjuluku (näin tehty koeappi C:ssä).
6. Lomake samaan riviin: lisää toinen Tekstikenttä, paneelin **Rivin sarake** → **＋ Rivi-palikka valittuun riviin**, **Arvo sarakkeesta**: Nimi. Koska **Valitse uusi rivi** on päällä, kenttä näyttää juuri lisätyn rivin, ja sitä voi korjata.

### Laske taulukon sarakkeen summa
1. Logiikkaan **Kaava** ja kirjoita `ostokset.määrä.summa`. Tulos näkyy palikassa.
2. Näkymään Teksti `Yhteensä {ostokset.määrä.summa} kpl`.
3. Montako puuttuu: `ostokset.määrä.puuttuvia`. Jos haluat tyhjän tuloksen aina kun jokin puuttuu, valitse sarakkeen kohdalla **Koosteet vaativat täydelliset tiedot**.
4. Riveittäin laskettu summa (määrä × hinta): Logiikka → Ikkunat → ikkuna, **Miten sisältö yhdistyy**: SUMMA, valitse **Riveille**, nuoli Ostokset → rivit ikkunan kohtaan **rivit**, ikkunan sisään Kaava `kohde.määrä * kohde.hinta` (Kohde = Rivi, käsiteltävä rivi). Ikkunan tulos on yhteishinta.

### Näytä vain ostamattomat, eniten ensin
1. Logiikka → **Tieto** → **Rivijoukko** (nimi *Suodatus*). Nuoli Ostokset → **rivit** → Suodatus **rivit**.
2. Kaava `kohde.määrä > 0` nuolella Suodatuksen kohtaan **ehto riveittäin**.
3. Suodatuksen paneelissa **Järjestys**: Määrä, **Suunta**: laskeva.
4. Vie Toistimen rivit nuolella Suodatuksesta (ei suoraan taulukosta). Huom: silloin **Järjestä raahaamalla** ei muuta järjestystä.

---

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#tieto).
