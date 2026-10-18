# Tallennus, GitHub ja siirtäminen

Tässä luvussa kerrotaan, missä Appi-appin tiedot ovat, miten ne siirtyvät laitteelta toiselle ja miten tekoäly voi lukea ja kirjoittaa projekteja. Tiedot on tarkistettu koodista (Appi-appi 31, moottorin versio 8).

Lyhyesti:

| Missä | Mitä | Milloin |
|---|---|---|
| Selaimen muisti (tämä laite, tämä selain) | Kaikki projektit, laput, presetit, suosikit, asetukset | Itsestään jokaisen muutoksen jälkeen |
| Varmuuskopiotiedosto (oma laite, esim. iCloud Drive) | Sama kuin selaimen muistissa, ilman GitHub-avainta | Kun painat *Varmuuskopio* tai *Vie kaikki projektit* |
| GitHub, oma yksityinen repo, kansio `appiappi/` | Jokainen projekti omana tiedostonaan, laput yhtenä tiedostona | Itsestään muutosten jälkeen, jos GitHub-tallennus on päällä |

## Automaattinen tallennus selaimen muistiin

Appi-appi tallentaa kaiken itse. Tallenna-nappia selaimen muistiin ei ole eikä tarvita.

- **Milloin:** noin neljäsosasekunti jokaisen muutoksen jälkeen (palikan siirto, asetuksen muutos, käytössä painettu nappi, kirjoitettu teksti).
- **Mihin:** selaimen muistiin avaimella `appiappi.v1`. Ulkoasun valinnat ovat erikseen (`appiappi:appearance`) ja GitHub-asetukset erikseen (`appiappi:gh`).
- **Tila näkyy yläpalkissa** (vain tietokoneella; puhelimella teksti on piilossa) napin *Varmuuskopio* vasemmalla puolella:

| Teksti | Merkitys |
|---|---|
| Tallessa tässä selaimessa | Kaikki tallessa, varmuuskopiota ei ole vielä viety |
| Varmuuskopio viety 17.10.2026 | Viimeisin varmuuskopio ja sen jälkeen ei muutoksia |
| Varmuuskopio viemättä | Muutoksia viimeisen varmuuskopion jälkeen. Punaisena, jos GitHub-tallennus ei ole päällä |
| Tallennus selaimeen ei onnistu | Selaimen muisti on täynnä tai estetty. Vie varmuuskopio heti |

Jos tallennus epäonnistuu, tulee ilmoitus ”Tallennus ei onnistunut: selaimen muisti on täynnä. Vie varmuuskopio.”

**Huomio:**
- Selaimen muisti on laite- ja selainkohtainen. Puhelimen Safarin tiedot eivät näy tietokoneen selaimessa ilman varmuuskopiota tai GitHubia.
- Kotinäytön kirjanmerkistä avattu appi ja Safarin välilehti voivat iPhonessa käyttää eri muistia (ei tarkistettu).
- Jos selaimen sivustotiedot tyhjennetään, projektit katoavat. Siksi varmuuskopio tai GitHub.

## Projektit

Kaikki projektit hoidetaan yläpalkin vasemmasta reunasta: nappi, jossa lukee avoimen projektin nimi. Napautus avaa ikkunan **Projektit**.

| Toimi | Näin |
|---|---|
| Avaa toinen projekti | Napauta projektin riviä listassa. Rivillä näkyy nimi ja ”N palikkaa · N näkymää”. Avoin projekti on korostettu |
| Uusi projekti | Kirjoita kenttään *Uuden projektin nimi* ja paina **Luo** (tyhjä nimi = ”Uusi projekti”) |
| Nimeä uudelleen | Kohdassa *Tämä projekti: …* muuta nimi ja paina **Nimeä** |
| Kopio | **Monista**: tekee kopion nimellä ”… (kopio)” käyttötietoineen ja avaa sen. Kopio tallentuu GitHubiin uutena tiedostona. |
| Vie yksi projekti | **Vie tiedostona** (katso Vienti ja tuonti) |
| Nollaa käyttö | **Tyhjennä käyttötiedot** (katso seuraava osio) |
| Poista | **Poista projekti**, vahvista. Ei voi kumota |
| Sulje ikkuna | **Valmis** oikeassa yläkulmassa tai napautus ikkunan ulkopuolelle |

Kun projekteja ei ole yhtään, appi näyttää aloitusruudun: kenttä *Projektin nimi*, **Luo projekti**, **Avaa esimerkkiprojekti** ja **Tuo tiedostosta**.

**Poisto ja GitHub:** jos GitHub-tallennus on päällä, poistettu projekti jää GitHubiin. Vahvistus kertoo: ”GitHubiin tallennettu kopio säilyy, ja sen saa takaisin asetusten kohdasta Hae uudet projektit.” Appi muistaa poistetut, eikä hae niitä takaisin itsestään. Vain nappi **Hae uudet projektit** palauttaa ne.

## Rakenne ja käyttötieto

Projektissa on kaksi osaa:

- **Rakenne:** palikat, niiden asetukset ja paikat, logiikan nuolet, näkymät, kerrokset, Tietotaulukon sarakkeet ja lähtöaineisto (rivit, jotka kirjoitettiin rakentaessa).
- **Käyttötieto** (`st`): se, mitä lukitussa käytössä syntyy. Kirjoitetut tekstit, valinnat, kytkimien asennot, säätimien arvot, listojen rastit, aikajanan merkinnät, Tietotaulukon käytössä muuttuneet ja lisätyt rivit, ketjujen ajotila, liikkuvien hahmojen paikat.

**Tyhjennä käyttötiedot** (Projektit-ikkuna, kohta *Tämä projekti*) kysyy ”Tyhjennetäänkö projektin käyttötiedot? Rakenne säilyy.” ja nollaa käyttötiedot (`st` ja `mem`). Tietotaulukko palaa lähtöaineistoonsa. Rakenteeseen ei kosketa.

**Kumoa** (↶) koskee rakennetta. Käytössä syntyneet käyttötiedot eivät kuulu kumottaviin muutoksiin (Kumoa palauttaa rakenteen ja jättää käyttötiedot ennalleen).

**Asetus, joka poistaa nuolia:** kun paneelin asetus poistaa palikalta kohtia (esim. Tietotaulukon *Lähde*-polku tyhjennetään, jolloin *haettu* ja *hakuvirhe* katoavat, tai Janan *Kulku* vaihtuu, Toistimen tapa tai Ikkunan laji muuttuu), niihin menneet nuolet poistuvat ja ilmoitus kertoo: *Asetus muutti palikan kohtia, joten N nuolta poistui. Kumoa palauttaa.* Kohtaa takaisin tuova asetus ei tuo nuolia; **Kumoa** tuo.

**Kokeile** (yläpalkki, luku [Työympäristö](02-tyoymparisto.md#kokeilu--kokeile)) käyttää kopiota käyttötiedoista (`st`, `mem`), käyttönäkymän kameroista ja lukituksesta. Kaikki tallennus (selaimen muisti, GitHub, varmuuskopio, vienti) kirjoittaa kokeilun aikana oikeat arvot, joten kokeilu ei tallennu eikä jää voimaan, jos appi suljetaan kesken.

Kanvaasin vierityskohta ja zoomaus (`cam`, `lcam`) ovat laitekohtaisia: ne eivät mene GitHubiin.

## Vienti ja tuonti

Kaikki napit ovat ikkunassa **Projektit**.

### Vienti

| Nappi | Mitä tulee | Tiedoston nimi |
|---|---|---|
| **Vie tiedostona** (kohta *Tämä projekti*) | Avoin projekti käyttötietoineen | `<projektin nimi>.appiappi.json` |
| **Vie kaikki projektit** (kohta *Varmuuskopio ja tuonti*) | Kaikki: projektit, laput, presetit, suosikit, asetukset | `appiappi-varmuuskopio-vvvv-kk-pp.json` |
| **Varmuuskopio** (yläpalkki, vain tietokoneella) | Sama kuin *Vie kaikki projektit* | sama |

Tiedosto latautuu selaimen latauksiin, ja appi näyttää ”Tiedosto ladattu”. iPhonen Safarissa tiedosto menee Tiedostot-appin Lataukset-kansioon, josta sen voi siirtää iCloud Driveen (ei tarkistettu oikealla iPhonella).

GitHub-avain ei koskaan tule varmuuskopioon.

### Tuonti

| Tapa | Näin |
|---|---|
| Tiedostosta | **Tuo tiedostosta** → valitse `.json`-tiedosto (puhelimella avautuu Tiedostot-valitsin) |
| Tekstistä | Liitä teksti kenttään *…tai liitä tähän viety teksti ja paina Tuo tekstistä* ja paina **Tuo tekstistä** |
| Kytköskartasta | **Tuo Kytköskartasta**: kopioi samassa selaimessa olevat Kytköskartan projektit. Kytköskartta ei muutu, jo tuotuja ei tuoda uudelleen |

Tuonti tunnistaa nämä muodot:
- varmuuskopio (kaikki projektit), myös laput, presetit ja suosikit,
- yhden projektin vienti (*Vie tiedostona*),
- GitHub-muotoinen projektitiedosto `{app, ver, savedAt, projekti}` (esim. tekoälyn tekemä tai `master-tiedot`-reposta ladattu),
- pelkkä projekti.

Tuonti **lisää**, se ei korvaa. Jos samalla tunnisteella on jo projekti, tuotu saa uuden tunnisteen, ja molemmat jäävät. Laput, presetit ja suosikit lisätään vain, jos niitä ei vielä ole. Viimeinen tuotu projekti avautuu, ja appi kertoo ”Tuotu: N projektia”. Tuotu projekti tallentuu GitHubiin kuin uusi (vanha GitHub-kirjanpito ei kulje tiedoston mukana): jos samalla tunnisteella on jo tiedosto GitHubissa, tilanappiin tulee *GitHubissa uudempi*, ja valitset itse, kumpi jää (ks. *Uudemman version haku ja ristiriidat*).

Virheilmoitukset: ”Tekstiä ei voitu lukea. Tarkista, että se on kokonaan mukana.” (rikkinäinen tai vajaa teksti) ja ”Tekstissä ei ole projekteja.”

## GitHub-tallennus

GitHub-tallennus tallentaa projektit omaan **yksityiseen** GitHub-repoosi. Hyödyt: projektit siirtyvät toiseen selaimeen, ja tekoäly näkee ja voi muokata niitä.

### Asetukset

Yläpalkki → **⚙︎ Asetukset** (puhelimella yläpalkkia voi joutua pyyhkäisemään sivulle) → osio **GitHub-tallennus (yksityinen repo)**.

| Kenttä tai nappi | Mitä tekee |
|---|---|
| **Repo** | Omistaja ja nimi kauttaviivalla, esim. `omistaja/master-tiedot`. Myös koko github.com-osoite kelpaa |
| **Avain** | GitHubin henkilökohtainen avain (alkaa `github_pat_`). Tallessa vain tämän selaimen muistissa, kenttä on piilotettu. Välilyönnit poistetaan itsestään |
| **Tallenna automaattisesti muutosten jälkeen** | Rasti päällä oletuksena |
| **Tallenna nyt** | Tallentaa avoimen projektin heti. Kertoo polun: ”Tallennettu GitHubiin klo …: repo / appiappi/<id>.json” |
| **Hae GitHubista** | Hakee uudet projektit (ei itse poistettuja) ja avoimen projektin GitHub-version, jos se on erilainen |
| **Hae uudet projektit** | Hakee GitHubista kaikki projektit, joita tässä selaimessa ei ole, myös itse poistetut |
| **Testaa yhteys** | Tarkistaa repon, avaimen ja kirjoitusoikeuden. Varoittaa, jos repo on julkinen |
| **Poista avain** | Poistaa avaimen tästä selaimesta (näkyy vain, kun avain on tallessa) |

Kohdan alla on avattava ohje *Näin otat GitHub-tallennuksen käyttöön* (katso resepti alla).

Jos Kytköskartan, Masterin tai Pajakoneen GitHub-asetukset ovat jo samassa selaimessa, Appi-appi ottaa ne käyttöön itsestään.

### Mitä tallentuu minne

| Tieto | Tiedosto repossa |
|---|---|
| Jokainen projekti (rakenne ja käyttötiedot, ei kanvaasin vierityskohtaa) | `appiappi/<projektin tunniste>.json` |
| Kaikki laput | `appiappi/laput/laput.json` |
| Presetit, suosikit, asetukset | Eivät mene GitHubiin (vain varmuuskopioon) |
| Tietotaulukon lähde (luetaan, ei kirjoiteta) | taulukon paneelissa annettu polku, esim. `tuonnit/terveys.json` ([Lähde](07-tieto.md#lähde-rivitiedosto-githubista)) |

Tiedoston nimi on projektin tunniste (esim. `p…`), ei projektin nimi. Nimen vaihto ei siis muuta tiedostoa.

### Milloin tallentuu

- Kun rasti *Tallenna automaattisesti* on päällä: noin 2,5 sekuntia muutoksen jälkeen, yksi projekti kerrallaan. Myös silloin, kun appi siirtyy taustalle (esim. vaihdat toiseen appiin puhelimella).
- Kun rasti on pois: vain **Tallenna nyt** -napista.
- Käytössä syntyvät käyttötiedot tallentuvat samalla tavalla kuin rakenteen muutokset.

### Tila yläpalkissa

Kun GitHub-tallennus on päällä, yläpalkissa näkyy tilanappi (myös puhelimella):

| Teksti | Merkitys |
|---|---|
| GitHub: tallennetaan… | Tallennus käynnissä |
| GitHub ✓ 14.05 | Kaikki tallessa, kellonaika (hiiren alla: *GitHub: tallennettu 14.05*) |
| GitHub: tallentamatta | Muutoksia odottaa tallennusta |
| GitHub: 2 tallentamatta | Sama, kun automaattinen tallennus on pois |
| GitHub: ei vielä tallennettu | Mitään ei ole vielä tallennettu |
| GitHub: virhe | Avain, oikeus, repo tai yhteys ei toimi. Viesti näkyy asetusten GitHub-osiossa |
| GitHubissa uudempi | Ristiriita (katso alla), punaisena |

Napautus avaa asetusten GitHub-osion. Ristiriidassa napautus kysyy, mitä tehdään.

### Uudemman version haku ja ristiriidat

Appi tarkistaa GitHubista avoimen projektin, kun appi käynnistyy, kun avaat toisen projektin ja kun appi palaa taustalta näkyviin.

- **Ei omia tallentamattomia muutoksia:** uudempi GitHub-versio haetaan itsestään, ilmoitus ”Haettu GitHubista uudempi versio projektista …”. Näin tekoälyn muutokset tulevat näkyviin. Kanvaasin vierityskohta säilyy.
- **On omia tallentamattomia muutoksia:** appi ei korvaa mitään. Tilanappiin tulee *GitHubissa uudempi* ja asetuksiin viesti ”Projektista … on GitHubissa uudempi versio, esimerkiksi tekoälyn muutokset. Hae se tai tallenna omasi sen päälle.”

Ristiriidan ratkaisu: napauta tilanappia *GitHubissa uudempi*.
1. Ensimmäinen kysymys: **OK** = hae GitHubin versio (omat tallentamattomat muutokset korvautuvat; **↶ Kumoa** palauttaa ne). **Peru** = muut vaihtoehdot.
2. Toinen kysymys: **OK** = tallenna oma versio GitHubin päälle (GitHubin versio korvautuu). **Peru** = ei tehdä mitään.

Vaihtoehtoisesti: asetuksissa **Hae GitHubista** kysyy ennen korvaamista, ja **Tallenna nyt** tallentaa oman version päälle.

### Uudet projektit GitHubista

Käynnistyessä (ja kun Repo tai Avain muuttuu) appi hakee itsestään projektit, jotka ovat kansiossa `appiappi/` mutta eivät tässä selaimessa. Itse poistettuja se ei hae. Napilla **Hae uudet projektit** saa kaikki, myös poistetut. Ilmoitus: ”N projektia haettu GitHubista.” tai ”Ei uusia projekteja GitHubissa.”

Toisella laitteella jo olevaa projektia ei haeta uudelleen tällä napilla; sen uudempi versio tulee projektia avattaessa (yllä).

### Virheilmoitukset

| Ilmoitus | Syy |
|---|---|
| Täytä ensin Repo ja Avain. | Kenttä tyhjä |
| Avain ei kelpaa tai se on vanhentunut. | Väärä tai vanha avain |
| Avaimella ei ole oikeutta. Tarvitaan Contents: Read and write. | Avaimen oikeudet puuttuvat |
| Repoa ei löydy … | Repo-kenttä väärin tai avaimella ei pääsyä repoon |
| Ei yhteyttä GitHubiin … | Netti poikki tai avain kopioitu vajaana |
| Yhteys toimii, mutta repo on JULKINEN … | Vaihda repo yksityiseksi GitHubissa |

### Pajakoneen tiedot

Appi-appi oli ennen nimeltään Pajakone. Ensimmäisellä avauksella se kopioi samasta selaimesta Pajakoneen projektit ja kerran GitHubin kansiosta `pajakone/` puuttuvat projektit, jotka tallentuvat sen jälkeen kansioon `appiappi/`. Pajakoneen omat tiedot jäävät ennalleen.

## Laput ja GitHub

Muisti- ja viestilaput (📝, ✉️) eivät ole projektin osa. Ne ovat koko tallennuksen osa (selaimen muisti ja varmuuskopio), eivät mene yhden projektin vientiin.

Asetukset → osio **Muisti- ja viestilaput**:
- Yhteenveto: montako muistilappua ja viestilappua, montako odottaa tekoälyä ja montako uutta vastausta.
- **Hae vastaukset** (vain GitHub päällä): hakee tekoälyn vastaukset heti.
- **Kopioi laput tekstinä**: kopioi laput leikepöydälle (tai lataa tiedostona `appiappi-laput.json`), jotta ne voi liittää keskusteluun tekoälylle, kun GitHub ei ole käytössä.
- Lista kaikista lapuista. Rivin napautus avaa lapun projektin ja osion.

Kun GitHub-tallennus on päällä:
- Laput tallentuvat tiedostoon `appiappi/laput/laput.json` noin 3 sekuntia muutoksen jälkeen (jos automaattinen tallennus on päällä) ja kun appi siirtyy taustalle.
- Appi hakee vastaukset itse käynnistyessä, palatessa näkyviin ja 90 sekunnin välein, kun appi on auki ja viestilappuja on.
- Yhdistäminen: tekoälyn uudet viestit tulevat aina mukaan; muu tieto (teksti, paikka, koko) uudemman muokkauksen mukaan. Poistettu lappu ei palaa.
- Uusi vastaus näkyy ilmoituksena ”Tekoäly vastasi viestilappuun.” ja merkkinä ✉️-napissa.

Lappujen tuonti: *Tuo tekstistä* tai *Tuo tiedostosta* lisää puuttuvat laput, jos tekstissä on `laput`.

## Kuvatiedostot ja tallennuksen koko

Kuva-palikkaan (ja kuvasarjaan) valittu kuvatiedosto tallentuu projektin sisään. Se kulkee mukana selaimen muistissa, varmuuskopiossa ja GitHubissa.

- Yli 1,5 Mt kuvaa ei oteta: ”Kuva on liian iso (yli 1,5 Mt). Pienennä sitä tai käytä SVG:tä.”
- Yli 300 kt kuva otetaan, mutta appi varoittaa, että se hidastaa tallennusta.
- Kuvasarjassa enintään 32 kuvaa.
- Kevein vaihtoehto: SVG-teksti tai kuvan https-osoite liitettynä Kuva-palikan kenttään *Kuva (SVG-teksti tai osoite)*.
- Selaimen muistin raja on tyypillisesti muutamia megatavuja (selainkohtainen, ei tarkistettu). Kun se täyttyy, tallennus selaimeen lakkaa (tila *Tallennus selaimeen ei onnistu*).

## Esimerkkiprojekti

Esimerkkiprojekti tehdään vain pyynnöstä: Projektit → **Avaa esimerkkiprojekti** (tai aloitusruudulta). Se luo uuden projektin ”Esimerkki: viikon tehtävät” (kaksi näkymää: tehtävälista, eräpäivä, ilmoitukset, säädin, taukonappi ja aikajana sekä Yhteenveto-näkymä kaaviolla ja kalenterilla). Ilmoitus: ”Esimerkki avattu. Lukitse 🔒 ja kokeile.” Sen voi muokata tai poistaa kuten muunkin projektin. Joka painallus luo uuden kopion.

## Koeapit `master-tiedot`-repossa

Emilin yksityisessä repossa `master-tiedot` on kansiossa `appiappi/` valmiita koeappeja, esim. `pkoeappic.json` (*Koeappi C: kohdelista*) ja `pkoeappib.json` (*Koeappi B: kysymykset*). Sisältö on keksittyä esimerkkiaineistoa.

- GitHub-tallennus päällä: Asetukset → **Hae uudet projektit**, sitten Projektit → valitse koeappi → 🔒 Lukitse.
- Ilman GitHubia: lataa tiedosto reposta ja Projektit → **Tuo tiedostosta**.

## Tiedostomuoto (tekniset tiedot)

**GitHub-projektitiedosto** `appiappi/<id>.json`:

```
{
 "app": "appiappi",
 "ver": 10,
 "savedAt": "2026-10-17T08:50:02.497Z",
 "projekti": { "id": "...", "name": "...", "seq": ..., "views": [...], "vseq": ..., "b": {...}, "lg": {"n": [...], "l": [...]}, "deco": [], "st": {}, "mem": {}, "lock": false }
}
```

- `ver` on moottorin versio `KK.VER` (nyt **12**, `var VER=12` moottorin alussa). Uudet valinnaiset kentät eivät nosta versiota. Versio 12 (Appi-appi 63) lisäsi jäsenten tapahtumat: Joukko-palikan `jlj` (Jäsenten laji, palikkalaji), Toiminnon `otj:1` (kohde Tapahtuman jäsen), ikkunan `jas:true` (Jäsenille), Toista-palikan `tapa:'jasenet'`, nuolikohdat `jm` (jäsenet) ja `j_<kohta>` (jäsen …), tapahtumakuoren `jasen` sekä käynnissä olevan Toista jäsenille -toiston `lst[...] = {ms, i}`. Versio 11 -tallennus aukeaa ennallaan, myös lukittujen ketjujen lukituskuvat; vanha appi ei osaa näitä. Versio 11 (Appi-appi 62) lisäsi Joukko-palikan (laji `pjoukko`: `jj` joukon tunniste, Ota mukaan `otl` laji, `otv` näkymä, `otk` kerros, `otf` ehto, `vjf` Vain jos, `jex` pois rajatut, `jsr` säännöt `[{p, f}]`, `p` = `nk`, `hk`, `vr`, `dx`, `dy` tai `o_<ominaisuus>`) ja varasi sanan `jäsen` (ei viitteeksi). Versio 10 -tallennus aukeaa ennallaan, myös lukittujen ketjujen lukituskuvat; vanha appi ei osaa Joukko-palikkaa. Versio 10 (Appi-appi 57) lisäsi joukot: projektin `jkr` (`{tunniste: {nm}}`, poistettu mutta yhä viitattu `{nm, x:1}`), palikan `jkt` (tagit) ja `jkk` (avatut *kuuluu kun* -kohdat), Toiminnon `oj` (kohde joukko) ja `jo` (Lisää joukkoon / Poista joukosta), kaavoissa ja teksteissä `{%tunniste}` sekä käyttötiedossa `st['jk:tunniste']` (toimintojen jäsenyysmuutokset). Vanha versio 9 -tallennus aukeaa ennallaan; vanha appi ei osaa joukkoja. Versio 9 (Appi-appi 55) muutti kaavan kieltä: vanhat `jos(;;)`, `ja(;)`, `tai(;)` muunnetaan avattaessa (`repair`, myös lukittujen ketjujen lukituskuvat, presetit ja suosikit), ja varattu viite (`jos`, `muuten`, `niin`, `ja`, `tai`) saa uuden (`ja_2`). Versio 9 -kaava ei aukea oikein vanhassa appissa. Tekoäly kirjoittaa uudet kaavat uudessa muodossa (luku 6, *Jos, ja, tai*).
- Appi lukee myös tiedostot, joissa `app` on `pajakone` tai `kytkoskartta`.
- Kelpoisuus (`okProj`): `app` on jokin yllä olevista, ja `projekti` on olio, jossa on `b` ja `lg`.

**Yhden projektin vienti** (*Vie tiedostona*): `{app:'appiappi', ver:12, projects:[projekti]}`.

**Varmuuskopio** (*Vie kaikki projektit*): koko tallennus `{app, ver, projects:[…], cur, cfg, meta, laput, lapPois, lapGh, lapVer, suos, presetit}`.

**Laput:** `{app:'appiappi-laput', ver:2, savedAt, ohje, laput:[…]}`.

### Vanhan muodon korjaus

Jokainen ladattu, tuotu tai GitHubista haettu projekti kulkee korjauksen läpi (`KK.repair`, koko tallennus `KK.repairData`):
- puuttuvat perusosat lisätään (`b`, `lg`, `views`, `st`, `mem`, `cam`, …),
- palikan puuttuvat asetukset täytetään lajin oletuksilla,
- **tuntemattoman lajin palikka poistetaan** (esim. jos laji on kirjoitettu väärin tai tulee uudemmasta appista),
- viittaukset poistettuihin palikoihin siivotaan, kelvottomat arvot korjataan tai poistetaan.

Vanhat tallennukset aukeavat siis aina, mutta väärin kirjoitettu sisältö voi kadota hiljaa.

## Projektitiedoston tekeminen tekoälyn avulla

Tämä osio on tekoälylle. Säännöt tulevat repon `AGENTS.md`:n kohdasta *Projektit ja toiveet*.

**Säännöt:**
- Projektit ovat yksityisessä repossa `master-tiedot`, tiedostoina `appiappi/<id>.json`. Ne eivät koskaan tule julkiseen `P-iv-kartta`-repoon.
- Tee pyynnöstä **uusi** tiedosto uudella tunnisteella ja nykyisellä `VER`:llä. Älä muokkaa olemassa olevaa projektia ilman erillistä pyyntöä.
- Tiedoston nimi ratkaisee tunnisteen: appi asettaa `projekti.id` = tiedostonimi ilman `.json`. Pidä ne samoina. Tunnisteen muoto: pienet kirjaimet ja numerot, alkaa `p` (esim. `pkoeappic`).
- Käyttäjä saa projektin napista **Hae uudet projektit** (tai tiedostona: Tuo tiedostosta).
- Jos käyttäjällä on jo sama projekti eikä tallentamattomia muutoksia, appi hakee muokatun version itse projektia avattaessa. Jos muutoksia on, käyttäjä valitsee (ristiriita yllä).
- Ei henkilötietoja eikä avaimia tiedostoihin.

**Suositeltu tapa:** rakenna projekti moottorin funktioilla Nodessa, älä käsin JSONina. Malli: `appiappi/testit/koeapit.js`. Moottori irrotetaan tiedostoksi `appiappi/testit/moottori.js` ajamalla `sh appiappi/testit/aja.sh` (tai sama Python-pätkä sen alusta). Hyödyllisiä: `KK.newProject(nimi)`, `KK.addBlock(P, laji, asetukset)`, `KK.addNode(P, palikanId, x, y, ikkunanSolmu)`, `KK.addLink(P, mistäSolmu, kohta, mihinSolmu, kohta)`, `KK.kaavaToIds(P, kaava)` ja `KK.toIds(P, teksti)` (viitteet sisäisiksi), lopuksi `KK.repair(P)`. Tiedosto kirjoitetaan kuten `koeapit.js`:n `tiedosto()`: kopio ilman `cam`, `lcam`, `_gh`, kääreenä `{app:'appiappi', ver:KK.VER, savedAt, projekti}` (sama kuin appin `payload`).

**Projektin keskeiset kentät:**

| Kenttä | Sisältö |
|---|---|
| `id`, `name` | Tunniste ja näkyvä nimi |
| `seq`, `vseq` | Laskurit uusille palikoiden ja näkymien tunnisteille |
| `views` | Näkymät `[{id:'v1', n:'Näkymä 1', laite?, kr?, alku?…}]` |
| `b` | Palikat olioina tunnisteen mukaan: `{id, k (laji), nm (nimi), vt (viite kaavoihin), v (näkymä, näkymäpalikoilla), x, y, w, h, …lajin asetukset}` |
| `lg.n` | Logiikan solmut `{id, p (palikan id), x, y, g (ikkunan solmu tai '')}`. Sama palikka voi olla logiikassa monta kertaa |
| `lg.l` | Nuolet `{id, f (mistä solmu), fp (kohta), t (mihin solmu), tp (kohta)}` |
| `deco` | Koristeviivat |
| `st` | Käyttötieto palikan tunnisteen mukaan (uudessa projektissa `{}`) |
| `mem` | Vanha käyttötiedon kenttä, tyhjennetään yhdessä `st`:n kanssa; uusissa `{}` |
| `lock` | Avautuuko lukittuna käyttöön |
| `appearance`, `pois` | Valinnaiset: käyttönäkymän ilme, poistettujen viittauskohteiden muisti |
| `praja` | Valinnainen: päivän raja tunteina 1–12 (puuttuu = keskiyö). Kirjaushistorian päivä (F08) |
| `kuviot` | Valinnainen: tulkin tallennetut kuviot `[{nm (nimi), k (kuvio)}]`, enintään 30, nimi yksilöllinen (jonon 6) |
| `an` | Valinnainen: projektin animoinnin oletus `{i (ilmestyy), o (katoaa), k (kesto s), p (pehmeys)}`. Näkymäpalikan omat vastaavat kentät `ani`, `ano`, `ank`, `anp`. Puuttuva = töks (F29) |

Kaavat ja tekstien viitteet ovat tiedostossa sisäisessä muodossa `{#palikanId}`, ei nimillä. Tietotaulukon sarakkeet (`sar`) ja lähtörivit (`rv`) ovat rakennetta palikassa; käytössä muuttuneet rivit ovat `st`:ssä. Taulukon lähde on palikassa: `lp` (polku repossa) ja `lak` (avain: sarakkeen tunniste tai `-` = ei avainta; puuttuu = tiedoston avain); haun tila on käyttötietoa `st['hk:<taulukon id>']` = `{ok (onnistunut haku ms), at (viimeisin yritys ms), err, n}` (jonon 9). Kirjaushistorian sarakkeella on `auto:'aika'` (laji `aika`) tai `auto:'id'` (laji `teksti`, arvoa ei tallenneta riville); kumpaakin enintään yksi. Aikajanan valinnainen `lh` on historiataulukon tunniste (lähde); omat merkinnät pysyvät `st`:ssä. Peliohjain-palikassa (`pohj`) `pel` (1–4) ja `kuollut` (0–0,5); Tatin valinnainen `pad` (`vasen` tai `oikea`) ja Painikkeen `padn` (napin nimi, esim. `alanappi`), kummallakin `padp` (pelaaja, puuttuu = 1). Ohjaimen tila ei tallennu (F33).

Tarkista ennen vientiä: appin oma kelpoisuustarkistus (`okProj`) vaatii `projekti.b` ja `projekti.lg`, ja `repair` poistaa palikat, joiden laji ei ole appin lajiluettelossa.

**Laput tekoälylle:** ”Lue viestilaput” = lue `master-tiedot/appiappi/laput/laput.json`, käsittele laput, joiden `vuoro` on `"ai"`, ja lisää lapun `viestit`-listaan yksi viesti `{kuka:'ai', laji:'vastaus'|'suunnitelma'|'tehty'|'kysymys', teksti, aika}`. Tarkka työtapa: `appiappi/suunnitelmat/10-laput.md`. Lapun toive ei ole lupa rakentaa.

## Reseptit

### Varmuuskopio ennen isoa muutosta
1. Tietokoneella: paina yläpalkin **💾 Varmuuskopio** (kapeassa ikkunassa napissa on pelkkä 💾). Puhelimella: napauta yläpalkista projektin nimeä → kohdassa *Varmuuskopio ja tuonti* **Vie kaikki projektit**.
2. Tiedosto `appiappi-varmuuskopio-<päivä>.json` latautuu. Siirrä se talteen (esim. iCloud Driveen).
3. Tietokoneella yläpalkin tila muuttuu: *Varmuuskopio viety <päivä>*.
4. Palautus tarvittaessa: Projektit → **Tuo tiedostosta** → valitse tiedosto. Projektit tulevat kopioina vanhojen rinnalle (sama tunniste saa uuden), joten poista tarpeeton versio itse.

### Projekti puhelimesta tietokoneelle
**GitHubilla (suositus):** ota GitHub-tallennus käyttöön molemmissa (sama Repo ja Avain, katso seuraava resepti). Puhelimella tilanapissa lukee *GitHub ✓ …*. Tietokoneella avaa appi: uudet projektit tulevat itsestään, tai Asetukset → **Hae uudet projektit**.

**Ilman GitHubia:**
1. Puhelimella: yläpalkin projektin nimi → avaa projekti → **Vie tiedostona** (tai **Vie kaikki projektit**).
2. Siirrä tiedosto tietokoneelle (iCloud Drive, AirDrop, sähköposti).
3. Tietokoneella: Projektit → **Tuo tiedostosta** → valitse tiedosto. Vaihtoehto: avaa tiedosto tekstinä, kopioi kaikki, liitä Projektit-ikkunan tekstikenttään ja paina **Tuo tekstistä**.
4. Huom.: tämä tekee kopion. Jatkossa muokkaukset eivät siirry itsestään takaisin puhelimeen.

### GitHub-tallennuksen käyttöönotto
1. GitHubissa: oikean yläkulman **+** → **New repository**. Nimi esim. `master-tiedot`, valitse **Private** ja rasti **Add a README file** → **Create repository**. (Jos repo jo on, ohita.)
2. Avain: profiilikuva → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
3. **Repository access**: *Only select repositories* → valitse repo. **Permissions** → *Repository permissions* → **Contents: Read and write**.
4. **Generate token** ja kopioi avain (alkaa `github_pat_`).
5. Appi-appissa: **⚙︎ Asetukset** → *GitHub-tallennus (yksityinen repo)*. Liitä avain kenttään **Avain**, kirjoita **Repo**-kenttään `omistaja/repon-nimi`.
6. Paina **Testaa yhteys**. Odotettu: ”Yhteys toimii. Repo … on yksityinen.”
7. Pidä rasti *Tallenna automaattisesti muutosten jälkeen* päällä. Yläpalkkiin tulee tilanappi, joka hetken päästä näyttää *GitHub ✓* ja kellonajan.
8. Jotta tekoäly näkee projektit: anna Claude-sovellukselle pääsy repoon GitHubissa (Settings → Applications → Claude → Configure) ja kerro keskustelussa repon nimi.
9. Toinen laite: toista kohdat 5–7 samalla avaimella (avain on vain kunkin selaimen muistissa).

### Tekoälyn tekemä projekti käyttöön
1. Pyydä tekoälyä tekemään projektitiedosto `master-tiedot`-repoon.
2. Appi-appissa: **⚙︎ Asetukset** → **Hae uudet projektit**. Ilmoitus ”1 projekti haettu GitHubista.”
3. Projektit → valitse uusi projekti → 🔒 Lukitse ja kokeile.

Tämän luvun kehityshavainnot (ristiriidat ja puutteet): [Versio ja tunnetut rajat](11-versio-ja-rajat.md#tallennus).
