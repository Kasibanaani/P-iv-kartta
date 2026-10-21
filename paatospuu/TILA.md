# Päätöspuu: tila

**Vaihe:** versio 1.2, kokeilussa · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/paatospuu/ · **Päivitetty:** 21.10.2026

Kevyt päätöspuu-appi puhelimelle: sisältö tuodaan tekstinä, järjestys opetetaan napauttamalla, jokainen kierros tallentuu aikaleimattuna muistiinpanoksi. Päätöskartan yksinkertaisempi sisarappi (Emilin toive Päätöskartan TILA:ssa), oma tallennusmuoto.

## Valmiina (versio 1, 20.10.2026)

- **Projektit** = päätöspuut, vaihto yläpalkin nimestä.
- **Tekstikenttä** per projekti, rivi per asia: `Koira` nappula, `#Nimi: selitys` ryhmä (ei näy käytössä), `>Nimi: teksti` ilmoitus (vain teksti näkyy), ` // ` tekstin sisällä = kappaleenvaihto, `//`-rivi ohitetaan. Järjestyksellä ei väliä.
- **Opetus / Rakenna:** napautus kerran = mitä tuo näkyviin, toinen = mitä sulkee pois (yläpalkki punainen), kolmas = valmis. Alku-rivi kertoo alun vaihtoehdot (opettamattomana: kaikki, joita mikään ei tuo). Ryhmä opetetaan samoin: se avaa jäsenensä ja voi avata tai sulkea pois toisen ryhmän (poissulku sulkee myös jäsenet).
- **Opetus / Muokkaa:** rivin muokkaus ja poisto; nimen vaihto siirtää säännöt. **Toisensa poissulkevat:** ryhmittelyt, jotka harmaannuttavat saman askeleen muut.
- **Käyttö (kierros):** valinta tuo näkyviin vain siihen suoraan liitetyt. Valinnat ja poissulut muistuvat kierroksen ajan; uudelleen tuleva vaihtoehto on valmiiksi valittuna, ja sen purku vapauttaa poissulut. Saman askeleen ristiriidat harmaina. Jatka, Peru askel, Lopeta. Ilmoitukset kertyvät ruutuun kerran, erottimin.
- **Lopetus** → muistiinpano: projektin nimi, valinnat, ilmoitukset, lisähuomio, valinnainen päivämäärä, aikaleima suomalaisessa muodossa.
- **Muistiinpanot:** vapaa kirjoitus, järjestys ”Seuraavaksi tulevat” tai ”Uusimmat”, suodatus termillä. Monen päivän muistiinpano siirtyy seuraavaan päivään, kun edellinen on mennyt.
- **Termit:** nimi + tunnistavat sanat + poissulkevat sanat, sana tunnistetaan alusta (”eläi” löytää eläimen). Poissulku voittaa.
- **Päivät tekstistä:** 24.10.26, 24.10.2026, 24.10. (seuraava), tänään, huomenna, ylihuomenna, viikonpäivät (sama päivä = tänään), ensi viikolla, tällä viikolla, tässä/ensi kuussa, ”kahden viikon sisällä” (väli), ”3 päivän päästä”. Pohjana muistiinpanon **luontihetki**.
- **Asetukset:** Appipaja 2.0 -teemat, vaalea/tumma/laite. Tiedot vain laitteella; vienti tiedostona tai tekstinä ja tuonti samoin (`{app:'paatospuu', ver:1, …}`).
- Testit `sh paatospuu/testit/aja.sh`: 50 logiikkatarkistusta + selainpolku 390 ja 320 px tietokoneen Chromiumissa.

## Versio 1.1 (20.10.2026, Emilin pyyntö)

- Muistiinpanoissa kiinteä alapalkki: pieni + Uusi, järjestys (Tulevat / Uusimmat), Termit. Ei liiku vierityksen mukana.
- Kierroksen muistiinpanoon myös rivi *Ryhmät:* (kaikki kierroksen aikana aktivoituneet ryhmät). Valinnat ja ilmoitukset olivat jo mukana.

## Versio 1.2 (21.10.2026, Emilin pyyntö)

- Jokainen päätöspuun nappula, ryhmä ja ilmoitus (nimellinen; nimetön yli 40 merkin ilmoitus ei) on automaattisesti termi, johon voi liittää tunnistavia ja poissulkevia sanoja. Kaikista projekteista, sama nimi kerran; samanniminen oma termi korvaa. Sanat tallennusmuodossa kentässä `termisanat` (nimi pienillä → {yes,no}).
- Muistiinpanot ja termit ovat yhteisiä kaikille päätöspuille (oli jo näin; Emil vahvisti). Ylempää, erottavaa tasoa ei ole.
- Termisuodattimissa näkyvät omat termit aina ja automaattiset vain, jos ne osuvat johonkin muistiinpanoon.

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu: jakoikkunan tiedostovienti, päivämäärävalitsin, näppäimistö alapalkin kanssa, tekstikentän koko.
- Säännöt ovat nimissä: jos nimen vaihtaa suoraan tekstikentässä, säännöt eivät seuraa (Opetus näyttää ”Säännöt ilman riviä”). Muokkaa-tilassa vaihto seuraa.

## Seuraavaksi

- Emil kokeilee puhelimella. Mahdolliset seuraavat: säännöt myös tekstimuodossa (koko puu tekoälyllä), ilmoitusten kumoutuminen myöhemmin, termien opetus napauttamalla.

## Avoimet kysymykset

- Suhteellisten päivien pohja: luontihetki (nyt) vai viimeisin muokkaus (Emilin alkuperäinen ajatus)? Muokkaus siirtäisi ”perjantaita” joka kerta.
- Kelpaako nimi ”kierros” istunnon tilalle?
- Termin opetus on nyt kaksi tekstikenttää (tunnistavat / poissulkevat) eikä napautuskierto: riittääkö?

## Emilin kommentit

- (tyhjä)
