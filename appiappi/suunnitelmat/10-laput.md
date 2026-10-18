# Rakentajan laput: muistilappu ja viestilappu

16.10.2026, Appi-appi 18. Emilin idea ja pyyntö (”toteuta”); tekniset ratkaisut tekoälyn. Tämä on samalla tekoälyn ohje lappujen lukemiseen ja niihin vastaamiseen.

## Mitä ne ovat

- **Muistilappu** (keltainen) on Emilin oma muistiinpano. **Viestilappu** (sininen) on viesti tekoälylle: korjaus- tai kehitystoive, kysymys tai huomio Appi-appista.
- Laput ovat **rakennusympäristön** työkalu, eivät projektin palikoita: ne eivät ole logiikassa, eivät näy käyttöpinnan palikkalistassa eivätkä kulje viedyn appin mukana. Koriste-*Lappu* (Muoto-palikka) on eri asia.
- Napit 📝 ja ✉️ ovat yläpalkissa heti osiovalinnan jälkeen, samassa kohdassa kaikissa osioissa.
- Lappu kuuluu projektiin ja **osioon**, jossa se tehtiin: Näkymä, Logiikka, Rinnakkain tai Käyttö (lukittu näkymä). Muissa osioissa se ei näy. Osiossaan se kelluu kaiken päällä, myös paneelien ja asetusikkunan.
- Siirto otsikkoriviltä, koko oikean alakulman kahvasta (kuten ikkunoissa), väkänen pienentää lapun: teksti piiloon, näkyviin jää kuvake ja päivämäärä (tehty tai viimeksi muokattu, kellonaikoineen). ✕ poistaa (kysyy, jos lapussa on tekstiä).
- Värit ovat kiinteät, eivät vaihdu teeman mukana. Muoto (pyöreät kulmat, hillitty reuna ja varjo, järjestelmäfontti) seuraa Appipaja 2.0 -ilmettä.

## Keskustelu lapussa (Appi-appi 18b, 16.10.2026, Emilin toive)

- Viestilapun teksti on Emilin alkuviesti. Tekoälyn vastaukset ja Emilin jatkoviestit kertyvät sen alle keskusteluksi (tekoäly vasemmalla, Emil oikealla). Kun keskustelu on alkanut, lapun alareunassa on *Vastaa…*-kenttä ja *Lähetä* (tietokoneella ⌘↵).
- **Vuoro:** jos viimeisin viesti on Emilin (tai alkuviestiä on muokattu tekoälyn viimeisen viestin jälkeen), vuoro on tekoälyn; jos viimeisin on tekoälyn, vuoro on Emilin, eikä tekoäly reagoi siihen uudelleen. Lappu näyttää vuoron (*Tekoälyn vuoro* / *Sinun vuorosi*).
- Tekoälyn viestin laji: *vastaus*, *suunnitelma* (odottaa hyväksyntää; lapussa nappi **Hyväksy suunnitelma**, joka lisää Emilin viestin lajia *hyvaksynta*), *tehty* (muutos viety) tai *kysymys*.
- *Merkitse valmiiksi* sulkee keskustelun (ei kenenkään vuoro), *Avaa uudelleen* tai uusi viesti avaa sen.
- Vanhan muodon kenttä `vastaus`/`vastattu` muuttuu itsestään keskustelun ensimmäiseksi tekoälyn viestiksi.

## Viitteet

- **Viiva:** otsikkorivin nuolesta vedetään viiva mihin tahansa: näkymän palikkaan, logiikan palikkaan tai ikkunaan, toiseen lappuun (viestilappu muistilappuun) tai mihin tahansa käyttöliittymän kohtaan (paneelin kenttä, asetusikkunan valinta, yläpalkin nappi). Viiva seuraa kohdetta, kun kanvaasia vieritetään tai zoomataan. Jos kohde on vieritetty kehyksen ulkopuolelle, viiva on katkoviiva kehyksen reunaan. Jos kohde ei ole näkyvissä (ikkuna kiinni, toinen osio), viiva piiloutuu ja palaa, kun kohde näkyy taas.
- Viivat näkyvät lapun alareunassa siruina: napautus välähdyttää kohteen (tai siirtyy palikkaan), ✕ poistaa viivan.
- **Hakasulkuviite:** `[Palikan nimi]` tai `[viite]` tekstissä viittaa saman projektin palikkaan (kirjainkoko ei ratkaise). Löytynyt viite näkyy sirussa ”→ nimi” (napautus siirtää palikkaan), löytymätön haaleana ”[teksti] ?”. Viittaamaton hakasulkuteksti on tavallista tekstiä.

## Tallennus ja tekoäly

- Selaimessa laput ovat Appi-appin tallennuksessa (`appiappi.v1`, avain `laput`; poistettujen tunnisteet avaimessa `lapPois`) ja siksi myös varmuuskopiossa. Varmuuskopion tuonti tuo puuttuvat laput.
- **GitHubissa** kaikki laput ovat yhdessä tiedostossa `appiappi/laput/laput.json` samassa yksityisessä repossa kuin projektit (yleensä `Kasibanaani/master-tiedot`). Appi tallentaa sen itse muutosten jälkeen (automaattinen tallennus päällä), hakee sen avattaessa, kun appi tulee näkyviin ja puolentoista minuutin välein, kun viestilappuja on. Ennen tallennusta GitHubin versio luetaan ja yhdistetään, joten tekoälyn vastaus ei katoa.
- Ilman GitHub-tallennusta: Asetukset → Muisti- ja viestilaput → *Kopioi laput tekstinä* ja liitä keskusteluun.
- Asetusten osio listaa kaikki laput kaikista projekteista; rivin napautus avaa lapun projektin ja osion.

### Tiedoston muoto (`ver` 1)

```
{ "app": "appiappi-laput", "ver": 1, "savedAt": "…", "ohje": "…",
  "laput": [ {
    "id": "l…", "laji": "muisti" | "viesti", "teksti": "…",
    "luotu": ISO, "muokattu": ISO (teksti tai viivat), "paivitetty": ISO (mikä tahansa muutos, yhdistämistä varten),
    "projekti": "<projektin id = tiedosto appiappi/<id>.json>", "projektiNimi": "…",
    "osio": "nakyma" | "logiikka" | "molemmat" | "kaytto", "osioNimi": "Näkymä" …,
    "x", "y", "w", "h", "pieni": paikka ja koko ruudulla,
    "viivat": [ { "id", "kohde": {"t":"palikka","id":"<P.b-avain>","nid"?,"puoli":"u"|"l"} | {"t":"lappu","id"} | {"t":"ui","sel","txt"},
                 "fx", "fy", "kuvaus": "Palikka ”Pallo” (Muoto, Näkymä: Näkymä 1)" tai "Ikkuna ”Asetukset” → Muokkaus → Kohdista ruudukkoon → ”Ei”" } ],
    "viitteet": [ { "teksti": "[Pallo]", "palikka": {"id","nimi","viite","laji"} } | { "teksti", "loytyi": false } ],
    "viestit": [ { "id", "kuka": "ai" | "emil", "laji": "vastaus" | "suunnitelma" | "tehty" | "kysymys" | "viesti" | "hyvaksynta", "teksti", "aika": ISO } ],
    "tila": "auki" | "valmis", "luettu": ISO (Emil on nähnyt tekoälyn viestit tähän asti),
    "kiire": true (valinnainen, Appi-appi 78; puuttuu, kun lappu ei ole kiireellinen),
    "vuoro": "ai" | "emil" | "", "tilaNimi": "odottaa tekoälyä" … } ] }
```

`ver` on 2 (Appi-appi 18b). `osioNimi`, `viitteet`, `vuoro`, `tilaNimi` ja viivojen `kuvaus` lasketaan tallennettaessa tekoälyä varten; appi ei lue niitä takaisin. Viestit yhdistetään tunnisteen mukaan (kumpikin osapuoli vain lisää), joten samanaikainen muokkaus ei hävitä viestejä. Järjestys on lisäysjärjestys, ei aikaleiman.

### Tekoälyn työtapa (”lue viestilaput”)

0. **Kiireelliset ensin (Appi-appi 78, Emilin lappu 18.10.):** jokainen Appi-appi-työ, myös muu kuin ”lue viestilaput”, katsoo aluksi tiedostosta laput, joilla `kiire: true` ja `vuoro: "ai"`, ja vastaa niihin kohdan 3 mukaan ennen omaa tehtäväänsä. Vastaus ei ole rakennuslupa (kohta 4). Rakentaja ei keskeytä omaa työtään lapun toiveen vuoksi.
1. Lue `master-tiedot/appiappi/laput/laput.json`. Käsittele vain laput, joiden `vuoro` on `"ai"`. Muistilaput ovat Emilin omia, niitä luetaan vain pyydettäessä tai taustaksi.
2. Kohde selviää viivojen `kuvaus`-tekstistä ja `viitteet`-kentästä. Palikan tiedot: `master-tiedot/appiappi/<projekti>.json`, `projekti.b[<id>]`. Käyttöliittymän kohde (`t:"ui"`) on Appi-appin oma kohta, ei projektin.
3. Vastaa lisäämällä lapun `viestit`-listan loppuun yksi viesti `{"id": "a<aikaleima>", "kuka": "ai", "laji": …, "teksti": …, "aika": <nyt ISO>}` (suomeksi, tavallinen teksti, rivinvaihdot sallittu). Älä muuta muita kenttiä tai aiempia viestejä, älä poista lappuja. Vie muutos. Vastaa myös keskustelussa, jos Emil niin pyytää. Hyväksytty suunnitelma (Emilin viimeisin viesti lajia `hyvaksynta`) on toteutuslupa juuri sille suunnitelmalle.
4. Jos lappu pyytää Appi-appin muutosta, se on Emilin toive, ei vielä ”toteuta”-lupa: vastaa lajilla *suunnitelma* (mitä tekisit, rajaus, huonot puolet) ja kirjaa toive tavalliseen tapaan (`TILA.md`), ellei Emil ole pyytänyt toteuttamaan. Toteutuksen jälkeen vastaa lajilla *tehty* (mitä muuttui, mitä ei tarkistettu). Yöajon valtuutus päätetään erikseen.

## Rajaukset (Appi-appi 18)

- Paikka ja koko ovat ruudun pikseleitä: puhelimella ja tietokoneella sama lappu on samassa kohdassa, ja liian kaukana oleva siirretään ruudulle.
- Käyttöliittymän kohde tunnistetaan CSS-polulla ja näkyvällä tekstillä. Jos kohdan teksti tai paikka muuttuu paljon (esim. uusi versio järjestää paneelin), viiva voi lakata löytämästä kohdetta; kuvaus säilyy silti tekoälylle.
- Hakasulkuviite löytää vain palikoita (ei osioita, ikkunoita eikä asetuksia). Viiva hoitaa muut.
- Laput eivät ole Kumoa-historiassa; poisto kysyy vahvistuksen.
- Tekoäly ei tee uusia lappuja (vain vastaa olemassa oleviin). Appi tuo GitHubista lapun, jota sillä ei ole, joten tekoälyn uusi lappu kyllä näkyisi, mutta sitä ei ole tarkistettu eikä se kuulu työtapaan.
