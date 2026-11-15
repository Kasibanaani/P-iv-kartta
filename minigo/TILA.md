# Mini-Go: tila

**Vaihe:** versio 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/minigo/ · **Päivitetty:** 15.11.2026

Go lasten kanssa pelattavaksi samalla laitteella (puhelin, iPad). Emilin toive 15.11.2026: oikeat säännöt, pienet laudat ja useita aidosti erilaisia ulkoasuja, ei pelkkiä värivaihtoehtoja.

## Valmiina (versio 1, 15.11.2026)

- **Moottori** `<script id="engine">` (objekti `GO`, ei DOMia): kaappaus, itsemurhan kielto, ko (yksinkertainen: asema ei saa palata edellisen siirron alla olleeksi), passit, alueen laskenta (omat elävät kivet + omien ympäröimä tyhjä + komi), kuolleiden kivien merkintä ryhmittäin, tasoitus tähtipisteisiin (valkea aloittaa), atarit vihjettä varten. Laudat 5, 7, 9 käyttöliittymässä; moottori osaa myös 13 ja 19 (`GO.ALL`), joten ne ovat myöhemmin pelkkä lisäys listaan `GO.SIZES`.
- **Pelimuodot:** Kaappaus-Go (ensimmäinen 1/3/5 kiveä kaapannut voittaa; oletus ensimmäisellä avauksella) ja Go (kaksi passia → kuolleiden merkintä napauttamalla → Laske tulos; Jatka peliä perää viimeisen passin). Komi 0 / 0,5 / 3,5 / 5,5 / 7, tasoitus laudan mukaan (5×5: 2, 7×7: 2–4, 9×9: 2–5).
- **Peli:** kivi napautuksella (sormen alla näkyy haamukivi, jota voi liu'uttaa ennen irrotusta), kiven napautus näyttää ryhmän vapaudet, itsemurha ja ko kerrotaan tekstinä ja lauta heilahtaa, atari-vihje (kivet + viimeinen vapaus), Peru (myös pelin päätyttyä), tulosikkuna ja juhlasade.
- **Ulkoasut** (✦-nappi, vaihtuu heti): jokaisella oma lauta, kivet, fontti, napit, merkit, asettumis- ja kaappausliike sekä ääni (WebAudio, ei äänitiedostoja). Pelaajien nimet vaihtuvat ulkoasun mukana.
  1. **Kaya**: kultainen puulauta syykuvioineen ja paksuine reunoineen, liuskekivi ja simpukankuori juovineen, antiikva, puinen napsahdus.
  2. **Tussi**: riisipaperi, siveltimellä vedetyt epätasaiset viivat, mustetahrat (Muste) ja siveltimen ensō-renkaat (Rengas), jotka piirtyvät paikalleen, punainen hanko-leima vuoron merkkinä.
  3. **Mustikkamaa**: lapsille; Mustikoilla ja Pilvillä on kasvot, ne räpyttävät, katsovat viimeistä siirtoa, säikähtävät atarissa (kulmat, hikipisara, heilunta), nukkuvat kuolleina ja pomppaavat pois kaapattuina.
  4. **Yötaivas**: tähtikartta, hehkuvat viivat, Planeetat kehärenkain ja Kuut kraattereineen, viimeisen siirron signaalirengas, kaapattu imeytyy pisteeseen.
  5. **Riso**: kaksivärinen painojälki, rasteripisteet, viivojen kohdistusvirhe, leimasinliike, kohdistusmerkki viimeisenä siirtona.
- **Asetukset** (⋯): äänet, atari-vihje, Vastakkain (ylempi pelaajakortti ylösalaisin, kun iPad on pöydällä välissä), säännöt lyhyesti, varmuuskopio tiedostona ja tekstinä.
- **Asettelu:** puhelin pystyssä (pelaajakortit laudan ylä- ja alapuolella), iPad/leveä vaaka (sivupalkki + lauta). Valintaikkunat nousevat alhaalta.
- **Tallennus** `minigo.v1`: `{app:'minigo', ver:1, savedAt, asetukset:{teema, aani, vihje, vastakkain}, peli:{cfg:{n, mode:'go'|'kaappaus', komi, handicap, target}, moves:[piste tai -1 = passi], dead:[pisteet], phase:'peli'|'laske'|'ohi'}}`. `GO.repairGame` pelaa siirrot alusta ja pysähtyy ensimmäiseen laittomaan.
- **Testit** `sh minigo/testit/aja.sh`: moottori (säännöt, ko, laskenta, kuolleet, tasoitus, korjaus, 200 satunnaispeliä) ja kosketuspolku 390×844, 320×568, 820×1180 ja 1180×820 (kaikki ulkoasut).
- Selainohje: Modern Web Guidance `light-dismiss-a-dialog` (dialog + closedby, Safarille varakeino).

## Ei tarkistettu

- Oikealla iPhonella tai iPadilla ei kokeiltu: testit ja kuvat tietokoneen Chromiumissa. Erityisesti Safarissa: SVG-suodattimet (puun syy, musteen reunat, hehku) ja niiden nopeus, ensō-renkaan piirtymisanimaatio, `mix-blend-mode` Riso-ulkoasussa, äänen käynnistyminen ensimmäisestä kosketuksesta, kotinäytön kuvake.
- Fontit: iOS:n Iowan Old Style, Hiragino Mincho, SF Rounded, Avenir Next ja Futura eivät ole testikoneessa, joten kuvissa näkyi varafontti.
- Ääniä ei kuunneltu.

## Seuraava askel

Emil ja lapset kokeilevat: mikä ulkoasu toimii, onko Kaappaus-Go hyvä aloitus, ovatko kivet tarpeeksi isoja sormelle 9×9:llä puhelimessa.

## Ehdotukset (tekoälyn, ei päätetty)

- Kuolleiden kivien automaattinen arvaus laskentaan (nyt merkitään itse).
- Botti harjoitteluun (helppo 5×5- ja 7×7-laudoille), 13×13 ja 19×19 valintoihin.
- Siirtojen selaus jälkikäteen ja pelin tallennus SGF-muodossa.

## Avoimet kysymykset

- Pitäisikö ulkoasuilla olla myös vaalea/tumma-valinta? Nyt jokainen ulkoasu on oma kokonaisuutensa (esim. Yötaivas aina tumma), joten Appipaja 2.0:n tilavalinta jätettiin pois tarkoituksella.

## Emilin kommentit
