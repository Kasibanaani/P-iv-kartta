# Rakentajan laput: muistilappu ja viestilappu

16.10.2026, Appi-appi 18. Emilin idea ja pyyntö (”toteuta”); tekniset ratkaisut tekoälyn. Tämä on samalla tekoälyn ohje lappujen lukemiseen ja niihin vastaamiseen.

## Mitä ne ovat

- **Muistilappu** (keltainen) on Emilin oma muistiinpano. **Viestilappu** (sininen) on viesti tekoälylle: korjaus- tai kehitystoive, kysymys tai huomio Appi-appista.
- Laput ovat **rakennusympäristön** työkalu, eivät projektin palikoita: ne eivät ole logiikassa, eivät näy käyttöpinnan palikkalistassa eivätkä kulje viedyn appin mukana. Koriste-*Lappu* (Muoto-palikka) on eri asia.
- Napit 📝 ja ✉️ ovat yläpalkissa heti osiovalinnan jälkeen, samassa kohdassa kaikissa osioissa.
- Lappu kuuluu projektiin ja **osioon**, jossa se tehtiin: Näkymä, Logiikka, Rinnakkain tai Käyttö (lukittu näkymä). Muissa osioissa se ei näy. Osiossaan se kelluu kaiken päällä, myös paneelien ja asetusikkunan.
- Siirto otsikkoriviltä, koko oikean alakulman kahvasta (kuten ikkunoissa), väkänen pienentää lapun: teksti piiloon, näkyviin jää kuvake ja päivämäärä (tehty tai viimeksi muokattu, kellonaikoineen). ✕ poistaa (kysyy, jos lapussa on tekstiä).
- Värit ovat kiinteät, eivät vaihdu teeman mukana. Muoto (pyöreät kulmat, hillitty reuna ja varjo, järjestelmäfontti) seuraa Appipaja 2.0 -ilmettä.

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
    "vastaus": "…", "vastattu": ISO, "luettu": ISO } ] }
```

`osioNimi`, `viitteet` ja viivojen `kuvaus` lasketaan tallennettaessa tekoälyä varten; appi ei lue niitä takaisin.

### Tekoälyn työtapa (”lue viestilaput”)

1. Lue `master-tiedot/appiappi/laput/laput.json`. Viestilaput (`laji: "viesti"`) ilman `vastaus`-kenttää ovat avoimia; muistilaput ovat Emilin omia, niitä luetaan vain pyydettäessä tai taustaksi.
2. Kohde selviää viivojen `kuvaus`-tekstistä ja `viitteet`-kentästä. Palikan tiedot: `master-tiedot/appiappi/<projekti>.json`, `projekti.b[<id>]`. Käyttöliittymän kohde (`t:"ui"`) on Appi-appin oma kohta, ei projektin.
3. Vastaa kirjoittamalla lappuun **vain** `vastaus` (suomeksi, tavallinen teksti, rivinvaihdot sallittu) ja `vastattu` (ISO-aika). Älä muuta muita kenttiä, älä poista lappuja. Vie muutos. Vastaa myös keskustelussa, jos Emil niin pyytää.
4. Jos lappu pyytää Appi-appin muutosta, se on Emilin toive, ei vielä ”toteuta”-lupa: kirjaa se tavalliseen tapaan (`TILA.md`, `IDEAT.md` tai suunnitelma) ja kysy, ellei Emil ole pyytänyt toteuttamaan.

## Rajaukset (Appi-appi 18)

- Paikka ja koko ovat ruudun pikseleitä: puhelimella ja tietokoneella sama lappu on samassa kohdassa, ja liian kaukana oleva siirretään ruudulle.
- Käyttöliittymän kohde tunnistetaan CSS-polulla ja näkyvällä tekstillä. Jos kohdan teksti tai paikka muuttuu paljon (esim. uusi versio järjestää paneelin), viiva voi lakata löytämästä kohdetta; kuvaus säilyy silti tekoälylle.
- Hakasulkuviite löytää vain palikoita (ei osioita, ikkunoita eikä asetuksia). Viiva hoitaa muut.
- Laput eivät ole Kumoa-historiassa; poisto kysyy vahvistuksen.
- Tekoäly ei voi tehdä uutta lappua appiin (vain vastata olemassa olevaan). Appi tuo GitHubista lapun, jota sillä ei ole, joten tekoälyn uusi lappu kyllä näkyisi, mutta sitä ei ole tarkistettu eikä se kuulu työtapaan.
