# Rytmikone: visio ja vaiheistus

Työnimi Rytmikone (kansio `rytmikone/`). **Tila: pelkkä suunnitelma, koodia ei ole.** Laadittu 16.10.2026 Emilin kanssa käydyn pohdinnan pohjalta.

## Ajatus

Emil kuuntelee kuulokkeilla biisiä ja rummuttaa tai beatboxaa sen tahtiin. Appi nauhoittaa äänen, tekee voimakkuuden ylityksistä MIDI-nuotteja (velocity voimakkuudesta), ja nuotit viedään MIDI-tiedostona Logic Prohon. Myöhemmin appi voi myös soittaa itse: rumpuäänet, DFAM-henkinen rumpusyntikka, potikoilla säädettävä syntikka ja XY-kosketusohjain.

## Emilin päätökset (16.10.2026)

- Ääni-input ei ole koskaan reaaliaikainen: ensin nauhoitus, sitten nuotit. Viive ei siksi haittaa tunnistusta.
- Rumpu- ja sävelkorkeustila ovat erillisiä, ja Emil valitsee tilan itse. Appi ei koskaan yritä arvata, onko ääni sävel vai rumpu.
- Ensimmäisenä rakennetaan ääni → rumpunuotit, koska vastaavaa työkalua Emilillä ei ole.
- Myöhemmät vaiheet ovat visio, eivät lupa rakentaa. Jokainen vaihe aloitetaan erikseen, kun edellinen tuntuu hyvältä.
- Puhelin ensin (iPhone, Safari). Tavoite on Logic Pro tietokoneella.

## Periaatteet (tekoälyn ehdotus)

- *Nauhoita*-näkymä on etusivu ja pysyy yhtä helppona vaiheesta riippumatta. Äänet, syntikka ja XY ovat omilla välilehdillään, joihin ei tarvitse koskea.
- Ääni ei lähde puhelimesta mihinkään. Repo on julkinen, joten mitään äänitettyä ei tule tänne.
- Sisältö on Emilin omaa: omat sämplet ja omat esiasetukset nimineen. Syntetisoitujen rumpujen perusääni on toiminto, ei valmiiksi täytettyä sisältöä (avoin kysymys alla).
- Yksi `index.html`, ei ulkoisia kirjastoja. MIDI-tiedosto, sävelentunnistus ja suodinmallit kirjoitetaan itse.

## Vaihe 1: ääni → rumpunuotit

**Nauhoitus**
- Mikrofoni pyydetään raakana: kaiunpoisto, kohinanpoisto ja automaattinen tasonsäätö pois (`echoCancellation`, `noiseSuppression`, `autoGainControl` = false). Muuten iPhone tasoittaa voimakkuuserot ja velocity menee pilalle.
- Ääni otetaan talteen kokonaisena puskurina, ja tunnistus tehdään siitä jälkikäteen näytteen tarkkuudella.
- Nauhoituksen aikana näkyy tasomittari ja (suuntaa antavasti) syttyvät iskut.

**Tunnistus ja säätö jälkikäteen**
- Aaltomuoto, jonka päällä iskut pystyviivoina. Viivat päivittyvät heti säädintä liikuttaessa, joten samasta otosta voi kokeilla eri asetuksia.
- Säätimet: kohinaportti (dB), herkkyysalue (dB-arvo, joka on velocity 1, ja dB-arvo, joka on 127), uudelleenlaukaisun esto (ms, esim. 60), velocity-käyrä.
- Iskun velocity = huippu lyhyessä ikkunassa ylityksen jälkeen. Portissa on hystereesi: uusi isku vasta, kun taso on käynyt alempana.
- *Kalibroi hiljaisuus*: 2 s huoneen kohinaa, ja portti asetetaan sen yläpuolelle.
- Esiasetukset omilla nimillä (esim. mikrofoni tai paikka). Valmiita ei ole.

**Otot ja nuotit**
- Jokaiselle otolle valitaan MIDI-nuotti (General MIDI -rumpukartan nimet apuna, esim. 36 bassari, 38 virveli, 42 hi-hat).
- Otot tehdään kerroksittain (ensin bassari, sitten virveli jne.), ja ne viedään samaan tiedostoon.
- Rumpunuotin pituus on kiinteä (avoin kysymys).

**Biisin tahtiin**
- Suositus: biisi ladataan appiin tiedostona, ja appi soittaa sen nauhoituksen aikana. Silloin MIDIn alku = biisin alku.
- Valinnainen tempo-kenttä: MIDIn tempo asetetaan biisin tempoksi, jolloin nuotit osuvat Logicin tahtiruudukkoon. Ilman tempoa ajoitus säilyy sekunteina (oletustempolla).
- **Viivekalibrointi**: appi soittaa naksuja, Emil taputtaa 8 kertaa, ja appi mittaa keskimääräisen myöhästymisen ja vähentää sen jatkossa. Bluetooth-kuulokkeilla viive on 150–250 ms, joten ilman tätä kaikki on myöhässä.
- Ilman biisiä: valinnainen esilaskenta ja metronomi.

**Vienti ja tallennus**
- Standard MIDI File (`.mid`), tempo-merkintä, rumpukanava 10. Lataus Tiedostot-appiin tai jakovalikko.
- Asetukset ja otot (nuotit) selaimen muistiin versioidulla avaimella, vienti ja tuonti tiedostona. Äänen tallennus (selaimen tietokanta) on avoin kysymys.
- **Kanavamittari diagnostiikkana**: näyttää vasemman ja oikean kanavan tason erikseen. Tällä selvitetään halvalla jo vaiheessa 1, antaako iPhonen Safari stereoäänen (ks. vaihe 3).

**Testit**
- Tunnistus synteettisillä äänipuskureilla: tunnetut iskut → oikeat ajat ja velocityt, portti, uudelleenlaukaisun esto, hystereesi.
- MIDI-tiedoston tavut ja delta-ajat. Käyttöliittymä 390 ja 320 px.
- Oikealla iPhonella ensimmäiseksi: mikrofonin raakatila, toimiiko biisin soitto samalla kun mikrofoni on auki, AirPodsien mikrofonin vaihtuminen, lupakyselyt kotinäytön apissa ja näytön lukittuminen kesken oton.

## Vaihe 2: esikuuntelu ja rumpuäänet

- Otto soi appissa (biisin kanssa tai ilman) ennen vientiä.
- Syntetisoidut rummut: bassari (siniaalto, nopeasti putoava sävel), virveli (sävel + suodatettu kohina), hi-hat (kirkas kohina tai 808-tyyliset kanttiaallot). Säädettävät parametrit.
- Omat sämplet (wav/mp3) Tiedostot-appista selaimen tietokantaan, ja jokaiselle nuotille oma ääni.
- Mahdollinen lisä: valmiin rytmin vienti äänitiedostona (WAV).

## Vaihe 3: kaksi kanavaa (stereo)

Vasen kanava → nuotti A ja oikea → nuotti B samassa otossa, eli kaksi rumpuääntä kerralla yhdelle MIDI-raidalle.

- Tunnistus ajetaan kummallekin kanavalle erikseen.
- **Vuoto**: stereomikki kuulee iskun molemmilla kanavilla, toisella hiljempaa. Jos isku löytyy molemmilta kanavilta muutaman millisekunnin sisällä, se kuuluu kovemmalle, kun ero on vähintään *kanavaero*-säätimen verran (dB). Muuten valitaan asetuksen mukaan: kovempi tai molemmat.
- **Laitteisto**: iPhonen oma mikrofoni on selaimessa todennäköisesti mono, joten tarvitaan ulkoinen stereomikki tai äänikortti. Paras erottelu saadaan kahdella erillisellä mikrofonilla tai kahdella kontaktimikrofonilla (pietso) eri pinnoilla, esim. pöydän vasen ja oikea pää.
- **Suurin epävarmuus**: Safari voi summata äänen monoksi, vaikka laite antaisi stereoa. Vaiheen 1 kanavamittari selvittää tämän. Jos iPhone ei anna stereoa, vaihe toimii varmemmin tietokoneella Chromessa ja äänikortilla (siellä kaiunpoisto pitää olla pois, koska se pakottaa monon).
- Laajennusmahdollisuus: monikanavainen äänikortti → nuotti per kanava, jos selain antaa kanavat.

## Vaihe 4: DFAM-henkinen rumpusyntikka

- Rakenne: kaksi oskillaattoria (kolmio/kantti), niiden välinen FM, kohina, Moog-tyyppinen ladder-suodin (resonanssi, itseoskillointi, yliohjaus), laskevat verhokäyrät sävelelle, suotimelle ja voimakkuudelle, 8 askeleen sekvensseri (sävel ja velocity askeleittain).
- Suodin kirjoitetaan itse (AudioWorklet), koska selaimen valmis suodin ei kuulosta Moogilta. Tunnettuja digitaalisia malleja on, esim. Huovilaisen malli.
- Tavoite on DFAM-henkinen, ei identtinen. Sävyn virittää Emil korvillaan, koska tekoäly ei kuule. Viritys tehdään kierroksina: Emil kuuntelee ja kuvailee, tekoäly säätää.
- Julkinen repo: ei Moogin nimeä appissa eikä Moogin sämplejä. Arkkitehtuurin mallintaminen on sallittua.
- Ääni toimii vaiheen 2 rumpuäänenä ja voi soittaa otosta tehtyjä nuotteja.

## Vaihe 5: sävelkorkeustila

- Valittava tila ottoa varten. Yksi sävel kerrallaan (hyräily, vihellys, laulu), ei sointuja.
- Tunnistus esim. YIN-menetelmällä. Voimakkuus päättää nuotin alun, lopun ja velocityn, sävelkorkeus päättää nuotin. Sävel mitataan alun jälkeen (30–80 ms), ei iskun alusta.
- Pyöristys puolisävelaskeleeseen, valinnainen sävellaji, ääniala oktaavivirheiden estoon, katkaisuherkkyys (sävelen vaihtuessa kesken äänen) ja vibraton vakautus.
- Esikuuntelu syntikalla, vienti MIDInä.

## Vaihe 6: potikkasyntikka

- Oskillaattorit (sini, kantti, saha, kolmio, oma aaltomuoto), suotimet (myös vaiheen 4 ladder), verhokäyrät, LFO:t, viive, kaiku, särö. Monisoittoinen.
- Potikat sivuina (Oskillaattorit / Suodin / Verhokäyrät / Efektit). Potikkaa käännetään vetämällä sormea pystysuunnassa.
- Soittaa vaiheen 5 melodioita ja tuotuja MIDI-nuotteja.

## Vaihe 7: XY-kosketusohjain

- X ja Y kytketään mihin tahansa syntikan parametriin (esim. X = suotimen taajuus ja Y = resonanssi), myös monikosketuksella.
- Kosketuksesta ääneen noin 20–40 ms, eli käytännössä välitön.
- XY-liikkeet tallennetaan melodian soidessa ja viedään samaan MIDI-tiedostoon CC-viesteinä. Logic lukee ne automaationa.
- Rajoitus: iPhonen Safari ei lähetä MIDIä livenä ulos (ei Web MIDI -tukea). Appin oman syntikan ohjaus ja tiedostovienti toimivat.

## Tekniset huomiot

- iPhonen äänetön-kytkin voi vaientaa selaimen äänen. Uudemmissa iOS-versioissa sen voi kiertää (`navigator.audioSession`). Äänen saa käyntiin vasta ensimmäisellä napautuksella.
- Näytön lukittuminen katkaisee oton: pidetään näyttö päällä (Wake Lock) ja varoitetaan.
- Mikrofoni ja kaiutin yhtä aikaa: aina kuulokkeet, ettei mikrofoni kuule biisiä tai syntikkaa.
- Testattavissa koneellisesti: tunnistus, MIDI-tiedosto ja käyttöliittymä. Ei testattavissa: miltä kuulostaa ja miten iPhonen mikrofoni käyttäytyy.

## Avoimet kysymykset

- Lopullinen nimi (työnimi Rytmikone).
- Tallennetaanko äänitys vai vain nuotit? Äänitys vie tilaa, mutta sillä voi säätää myöhemmin uudelleen.
- Viedäänkö kerroksittaiset otot yhdelle raidalle (rumpukanava) vai jokainen omalle raidalleen? Ehkä valinta.
- Rumpunuotin pituus: kiinteä (esim. 1/16) vai äänen pituus.
- Toimiiko biisin soitto Musiikki- tai Spotify-appista samalla, kun Safari nauhoittaa, vai ladataanko biisi aina appiin?
- Ovatko syntetisoitujen rumpujen perusäänet sallittu oletus, vai aloitetaanko tyhjästä?

## Riskit

- Laajuus: seitsemän vaihetta on puoli DAW:ta. Jokainen vaihe on oltava käyttökelpoinen yksinään, ja Nauhoita-näkymä pysyy yksinkertaisena.
- iPhonen äänikäyttäytyminen selaimessa (raakatila, stereo, taustasoitto) varmistuu vasta oikealla laitteella.
