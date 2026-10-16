# Animappi: tila

**Vaihe:** versio 1 rakennettu, odottaa kokeilua iPadilla · **Versio:** 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/animaatio/ · **Päivitetty:** 16.10.2026

2D-nukketeatteri: tuodut kuvat ovat osia, jotka kiinnitetään toisiinsa. Osia liikutetaan kuin nukkea, ja liike nauhoittuu 24 ruutuna sekunnissa moniraitana. Ensisijaisesti iPad ja Apple Pencil, toimii myös tietokoneella hiirellä. Tiedostomuoto Appi-appia varten: `MUOTO.md`.

## Emilin linjaukset (16.10.2026)

- Liikuttamalla nauhoittaminen on tärkein asia: sen pitää olla ”tosi, tosi, tosi yksinkertaista” ja onnistua äärimmäisen helposti.
- Työkalut selkeitä, ei Procreaten tai Blenderin tasoisia.
- Tarkka työ saa olettaa (Apple Pencil tai hiiri), joten tarkkuutta vaativia toimintoja saa suunnitella.
- iPad ensin, mutta ei pelkästään iPadille: tietokoneella täysipainoinen.
- Mahdollisimman moni asia noudattaa samaa logiikkaa kuin Appi-appi, ja ratkaisuja saa arvioida sitä vasten.
- Animaatiot halutaan käyttöön Appi-appin apeissa (`MUOTO.md`).

## Valmiina (versio 1, 16.10.2026)

- **Rakenne Appi-appin mukaan:** vasemmalla osat (kuin paletti), keskellä lava, oikealla tarkastelija, yläpalkissa Rakenna / Animoi (kuin muokkaus / käyttö), Vie, Kumoa ja Tee uudelleen, Asetukset. Appipaja 2.0 -ilme samoilla teemoilla, vaalea, tumma ja laitteen mukaan.
- **Tuonti:** SVG ja PNG (myös JPEG, WebP, GIF:n ensimmäinen kuva) tiedostovalinnasta tai raahaamalla, useampi kerralla nimen mukaan. Lisäksi SVG-teksti liittämällä, esimerkiksi tekoälyn tekemä kuva. Yli 2048 px:n kuvat pienennetään.
- **Rakenna:** osan siirto, kiertokahva (ympyrä), kokokahva (neliö), kääntöpiste punaisena ristinä (kuva pysyy paikallaan), kiinnitys toiseen osaan (osa pysyy paikallaan, kiinnitetty osa kääntyy oletuksena nivelestä), numerokentät, järjestys, piilotus, kuvan vaihto ja poisto. Jos osalla on nauhoitus, Rakenna-tilan siirto siirtää koko liikettä.
- **Animoi:**
  - Yksi sormi, kynä tai hiiri siirtää; nivelosa kääntyy kääntöpisteensä ympäri.
  - Kaksi sormea kääntää ja muuttaa kokoa kääntöpisteen ympäri. Toinen sormi voi olla myös osan vieressä, esimerkiksi kynä osassa ja sormi vieressä. Kaksi osaa liikkuu samaan aikaan kahdella sormella.
  - Ilman nauhoitusta liike on harjoittelua ja palaa paikalleen.
- **Nauhoitus:** ● Nauhoita → laskuri 3-2-1 (laskurin aikana voi jo tarttua osaan; laskurin saa asetuksista pois) → nauhoitus alusta.
  - Ensimmäinen nauhoitus määrää pituuden (■ Lopeta). Myöhemmät nauhoitukset loppuvat animaation lopussa.
  - Vain osat ja ruudut, joihin kosketaan, muuttuvat; muut toistavat nauhoituksensa (moniraita).
  - Kumoa poistaa koko kierroksen. Pituus enintään 60 s.
- **Aikajana:** toisto, silmukka, ruutu kerrallaan, veto, osakohtaiset rivit nauhoitetuista ruuduista. Lisäksi haamukuva (edellinen ruutu himmeänä) ja tasoitus osakohtaisesti 0–100: raaka nauhoitus säilyy, joten tasoitusta voi muuttaa jälkikäteen.
- **Vienti:** animaatiotiedosto (JSON, kuvat mukana) ja sprite sheet (PNG + JSON; ruudun koko 100, 50 tai 25 %; koko lava tai vain osien alue; iPadin 4096 px:n raja). Lisäksi teksti varalla. iPadilla vienti aukeaa jakovalikkoon, muualla tiedosto ladataan. Tuonti tiedostona ja tekstinä.
- **Tallennus:** animaatiot selaimen muistissa avaimella `animappi.v1`. Kuvat ovat liian isoja sinne, joten ne ovat selaimen tietokannassa (IndexedDB `animappi`). Ilme on avaimella `animappi:appearance`. Selaimelta pyydetään pysyvää tallennusta.
- **Näppäimet:** välilyönti toistaa, R nauhoittaa, ← → ruutu kerrallaan, ⌘Z / ⇧⌘Z, Delete poistaa osan (Rakenna).
- **Testit:** 3 logiikkatestiä (260 tarkistusta) ja 4 selaintestiä läpi tietokoneen Chromiumissa leveyksillä 1440, 1280, 1024 ja 820 px. Kosketus ja kynä on simuloitu: kosketustapahtumat, kaksi sormea ja `pointerType: pen` paineella.

## Ei tarkistettu (vain oikealla iPadilla)

- Safarin oma moottori: testit ajettiin Chromiumissa.
- Apple Pencilin tuntuma, kämmenen tunnistus ja kosketuksen viive. Onko 3-2-1-laskuri sopiva?
- Kämmen: jos kämmen koskettaa näyttöä kynän ollessa osassa ja iPad ei hylkää kosketusta, appi tulkitsee sen toiseksi sormeksi (kierto ja koko). Jos näin käy, lisätään asetus ”vain kynä liikuttaa”.
- Safarin omat eleet: sivun zoomaus kahdella sormella ja reunapyyhkäisy. Ne on estetty lavalla, mutta toimivuus pitää varmistaa.
- Jakovalikko tiedostoilla (`navigator.share`). Sprite sheetissä on kaksi tiedostoa, jotka jaetaan yhdessä.
- Selaimen tietokanta (kuvat) kotinäytön kirjanmerkkinä ja viikon käyttämättömyyden jälkeen.
- Muistiraja: monta isoa PNG:tä tai pitkä animaatio isoilla ruuduilla.

## Seuraavaksi

- Emil kokeilee iPadilla: tuo kaksi kuvaa, kiinnitä, siirrä kääntöpiste, nauhoita kaksi kierrosta, vie sprite sheet.
- Ehdotettu järjestys jatkoon: v1.1 GitHub-tallennus (kuten Appi-appissa, repoon `master-tiedot`) ja PNG-sarja; v1.2 GIF ja video; v1.3 kynällä piirtäminen. Mitään näistä ei ole rakennettu.

## Suunnitelmat (Emilin idea 16.10.2026, ei rakennettu)

- **2D jatko:** kynällä piirtäminen (paineherkkä viiva, joka tasoitetaan vektoriksi), PNG-sarja, GIF ja video (MP4, jos iPadin Safari sallii).
- **3D-vaihe:**
  - Muodot kynällä: palikat (kuutio, pallo, sylinteri), pursotus (2D-muodolle paksuus) ja sorvaus (puolikas ääriviiva pyöräytetään). Lisäksi GLB/glTF-tuonti.
  - Osat nivelillä nukketeatteriperiaatteella; taipuvaa ihoa ei tehdä alussa.
  - Renderöinti sprite sheetiksi, myös monesta suunnasta (esim. 8). Tyylit kuten piirretyn näköinen varjostus ja pikselöinti. Vienti myös GLB:nä.
  - Avoin: Three.js upotettuna, poikkeus linjaan vai ilman kirjastoa. Kysytään Emililtä, kun vaihe on edessä.
- **Yhteys Appi-appiin:** vientimuoto ja ehdotetut Appi-appin muutokset tiedostossa `MUOTO.md`. Appi-appiin ei kosketa ilman erillistä pyyntöä.

## Avoimet kysymykset

- Pitääkö nauhoituksen alkaa aina alusta, vai myös aikajanan kohdasta (”punch in”)? Nyt aina alusta.
- Riittääkö 60 sekunnin enimmäispituus?
- Kun Rakenna-tilassa siirtää nauhoitettua osaa, koko liike siirtyy. Onko tämä toivottu, vai pitäisikö siirron koskea vain yhtä ruutua?
- Vienti kaikista animaatioista kerralla (varmuuskopio) puuttuu: tarvitaanko?
- 3D-vaihe ja Three.js: kysytään, kun vaihe on edessä (Emilin pyyntö).

## Löydökset

- Testiselaimen oikku (ei appin vika): kun Chromen kosketusemulaatiossa vedetään `touch-action:none`-pinnalla, seuraava napautus ei tuota klikkausta, ennen kuin napautetaan muualle. Testien apuri `Kosketus.napauta` tekee neutraalin napautuksen ensin. Tämä varmistettiin tyhjällä sivulla.

## Emilin kommentit

