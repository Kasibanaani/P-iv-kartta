# Päätöspuu: kalenterinäkymä (ehdotus, ei rakennettu)

Päivitetty 21.10.2026. Emilin toiveet 21.10. ja tekoälyn ehdotus ensimmäiseksi versioksi. Rakennetaan vasta Emilin hyväksynnällä.

## Sovittu (Emil 21.10.2026)

- Päiväväli (1.7.26–3.8.26) = sama muistiinpano jokaisena välin päivänä: toistuu, ei jatku eikä kopioidu. Muutos näkyy kaikkina päivinä, koska muistiinpano on yksi. **Rakennettu 1.4:ssä** (tunnistus ja järjestys; kalenterissa tulee näkymään jokaisena päivänä).
- Kalenterin painopiste on raahaamisessa: **pitkä painallus siirtää**, **selvästi näkyvä kulmaväkänen muuttaa kokoa**. Kun sormi on väkäsellä tai pitkä painallus aktivoituu, merkinnän reuna muuttuu heti, ettei jää arvailun varaan. Painalluksen kesto kuten nykyapeissa (ehdotus 350 ms).
- Kalenterimerkinnät nättejä. Otsikko näkyy, kun se mahtuu.
- Tietyt termit ovat kalenterissa **alaotsikkotasoisena** aina näkyvää infoa, ja muistiinpanoja voi tarkastella niiden mukaisina ryhminä.
- Grafiikka: tarpeeksi pientä, että oleellinen mahtuu, mutta puhelimelle tehdyn näköistä.

## Ehdotus ensimmäiseksi versioksi

1. **Uusi välilehti Kalenteri** (viides). Ylhäällä viikkonauha (ma–su, pyyhkäisy vaihtaa viikkoa), alla valitun päivän aikajana klo 0–24, oletuksena vieritetty klo 7:ään. Tunti noin 48 px.
2. **Muistiinpanon kellonaika.** Uusi valinnainen kenttä *alkaa–päättyy* muistiinpanon ikkunaan. Tekstistä tunnistetaan lisäksi ”klo 14”, ”klo 14.30–15.30” ja ”14–15”. Raahaus kirjoittaa kenttiin, ja kenttä voittaa tekstin.
3. **Raahaus.**
   - Pitkä painallus (350 ms) nostaa merkinnän: varjo, paksumpi korostusreuna, kevyt suurennus. Siirto 15 minuutin askelin. Sivu ei vieritä raahauksen aikana; reunan lähellä se vierittää itse.
   - Kulmaväkänen oikeassa alakulmassa (näkyvä 14 px, kosketusalue 36 px). Kosketus muuttaa reunan heti katkoviivaksi, ja raahaus muuttaa loppuaikaa.
   - Siirto toiselle päivälle viikkonauhan päälle pudottamalla. Teksistä tunnistettu päivä (esim. ”perjantaina”) muuttuu silloin muistiinpanon päivämääräkentäksi.
   - Toistuva (päiväväli) merkintä: kellonajan muutos koskee kaikkia päiviä, koska muistiinpano on yksi.
4. **Ajattomat merkinnät (ehdotus, Emilin pyyntö).** Ei ylös liimattua palkkia. Päivän otsikkorivillä, päivämäärän vieressä, yhden rivin vaakasuunnassa vieritettävä nauha pieniä pillereitä (korkeus 26 px). Jos niitä ei ole, rivi ei vie tilaa. Napautus avaa muistiinpanon. Pillerin voi raahata pitkällä painalluksella aikajanalle, jolloin se saa kellonajan, ja aikajanalta takaisin nauhaan.
5. **Alaotsikkotermit.** Termille valinta ”Näytä kalenterissa”. Jos päivän muistiinpano osuu termiin, termin nimi näkyy pienenä alaotsikkona viikkonauhan päivän alla ja päivän otsikossa. Muistiinpanot-välilehdelle järjestysvaihtoehto *Termin mukaan* (ryhmät alaotsikkotermeistä).

## Avoimet kysymykset

- Päivä- vai viikkonäkymä aikajanana? Ehdotus: päivä, koska puhelimessa viikon aikajana jää liian kapeaksi raahattavaksi.
- Kuka voittaa, kun tekstissä on ”klo 14” ja raahaus asettaa 15: ehdotus kenttä voittaa ja teksti jää ennalleen.
- Saako kierroksen muistiinpano kellonajan aloitushetkestä automaattisesti? Ehdotus: ei, se näkyy ajattomana, jos päivä on valittu.

## Linjakkuus

- Ei uusia tallennuskenttiä ennen hyväksyntää. Hyväksynnän jälkeen muistiinpanoon `time:{s:'14:00',e:'15:00'}` ja termiin `cal:true`; vanha muoto luetaan ennallaan.
