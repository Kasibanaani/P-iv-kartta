# Mätsik Forest: tila

**Vaihe:** versio 0.1, ensimmäinen toimiva versio. **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/matsik/ · **Päivitetty:** 2.11.2026

Juureen (`paatospuu/`) nojaava, mutta erillinen hoitosuunnitelmien demo- ja kehittämisappi. Kaikki sisältö on kuvitteellista, ja Emil kirjoittaa sen itse. Appi ei sisällä valmista dataa. Hahmotelma ja perustelut ovat projektikansiossa (`hoitojuuri/HAHMOTELMA.md`), ei tässä julkisessa repossa.

## Versio 0.1 (2.11.2026)

- **Asiakaslista:** rivi on asiakas. Järjestyksen määrää tärkein avoin herja: ensin kiireelliset, sitten tavoitetason mukaan. Rivillä näkyy tärkein herja ja +N, tai Kunnossa ja seuraava käynti. Uusi asiakas, nimen muutos, arkistointi (palautus Valikosta) ja poisto vahvistuksella.
- **Hoitosuunnitelman osiot:** Tulosyy, Diagnoosit (Emilin oma luettelo Valikossa ja vapaa lisäys), Esitiedot, Kehityshistoria, Ajankohtainen tilanne ja toimintakykyarvion päivämäärä, Koulu, Sosiaalityö, Vahvuudet, Tavoitteet, Hoidon tarve (4 kysymystä), Hoitotoimet ja Lääkeseuranta, sekä Huomiot muistiosta.
- **Tavoitteet:** hoidon syyt ovat asiakkaan lista (haitta ja psykiatrinen taustasyy). Tavoitteella on taso (1 turvallisuus, 2 hoidon mahdollistaminen, 3 elämänlaatu), syy (tai Hoidon mahdollistaminen), lapsen, vanhempien ja työntekijän tavoitteet, keinot sekä tilanne (Alussa, Etenee, Jumissa, Saavutettu).
- **Arviointikierros:** prosessikaavio hahmotelman kohdan 3b mukaan. Yhtä mieltä -kysymykseen vastataan osapuolittain, ja vastauksista voi palata Takaisin. Toimenpiteeseen päättyvä arvio jää avoimeksi herjaksi, kunnes se merkitään tehdyksi.
- **Säännöt (herjat):**
  - Puuttuu: tulosyy, diagnoosit, vahvuudet, tavoitteet, käyntitiheys, toimintakykyarvion päivämäärä.
  - Vanhentunut: Esitiedot, Koulu, Sosiaalityö, Hoidon tarve ja Hoitotoimet. Kuittaus: *Tarkistettu, pitää paikkansa*. Toimintakykyarvio vanhenee päivämääränsä mukaan.
  - Käynnit (Emil 2.11.): kaksi seuraavaa täyttä kalenteriviikkoa. 1/vk ja 2/vk vaativat viikkokohtaisesti, 2/kk vähintään yhden ikkunaan, 1/kk ja harvemmin seuraavan sovitun käynnin. Peruttu käynti ei kelpaa.
  - Lääkäri vähintään 1/kk, 1/3 kk tai 1/6 kk: herja, jos lääkärikäyntiä ei ole sovittu ennen erääntymistä ja erääntyminen on 4 viikon sisällä.
  - Mittaukset (paino, pituus, RR, pulssi, neurologiset oireet): oma väli, kirjaus arvon kanssa.
  - Tavoitteen arviointi välein, avoin toimenpide ja Jumissa-tila. Tason 1 herjat ovat kiireellisiä.
  - Tarkistusvälit muokataan Valikossa. Oletukset: esitiedot, koulu, sosiaalityö, tarve ja toimet 6 kk, tavoite 3 kk, toimintakykyarvio 12 kk.
- **Muistio:** vapaa teksti. Asiakkaan nimi (myös taivutettuna, esim. Ketulle) liittää muistiinpanon asiakkaaseen. Päiväys (10.11.), viikonpäivä, huomenna tai klo vie sen kalenteriin. Rivillä oleva käyntisana (käynti, perhekäynti, soitto, puhelu, vastaanotto, tapaaminen, neuvottelu) tekee siitä käynnin, ja sana lääkäri merkitsee lääkärin mukaan. Hoitotoimien *+ Käynti muistioon* aloittaa muistiinpanon asiakkaan nimellä.
- **Kalenteri:** viikkolista (edellinen viikko ja 4 tulevaa, sen jälkeen Myöhemmin). Menneelle käynnille Toteutui tai Peruttu, ja Kumoa.
- **Ulkoasu:** galleriasta tulevat 6 teemaa (Kuutamo, Sammalpolku, Revontuli, Puolukka-ilta, Aamu-usva, Talviuni) ja niiden eläinkuvitukset. Juuren nappimuodot (Terävä, Pehmeä, Pyöreä, Pilleri) ja järjestelmäfontit. Kuvitus voi olla Yläkaista, Kapea tai Pois. Oletus on Puolukka-ilta.
- **Tallennus:** vain laitteella, `localStorage` avain `matsik:v1`, muoto `{app:'matsik', ver:1, savedAt, data:{asiakkaat, muistio, asetukset, meta}}`. Projekteja on vain yksi. Vienti tapahtuu aina tiedostoon `Mätsik Forest.json` (iPhonella jakovalikko), ja tuonti tiedostosta tai tekstinä korvaa kaiken varoituksen kanssa. Valikossa näkyy punainen piste, jos muutokset on viety viimeksi edellisenä päivänä tai aiemmin.
- **Testit:** `sh matsik/testit/aja.sh`. `logiikka.js` sisältää 31 sääntötestiä. `selain.js` on käyttöpolku 390 ja 320 px kosketuksella ja 1280 px hiirellä.

## Ei rakennettu

- Juuren aikaruudukkokalenteri (pito ja viiva, raahaus): tilalla on viikkolista.
- Juuren sanalinkit, `---`-tekstit, toistuvuus ja asiasanat.
- Tulosyy asiasanoina.
- Arviointikaavion muokkaus asetuksissa: kaavio on nyt koodissa.
- Tason 2 tavoitteen linkki tavoitteeseen, jonka se mahdollistaa (avoin kysymys).
- Hoidon tarpeen vastauksista johdettu yksikkösuositus.
- Omat osiot.

## Ei tarkistettu

- Testit ajettiin tietokoneen selaimessa (Chromium), ei oikealla iPhonella: Safari, kotinäytön kirjanmerkki, sanelu ja jakovalikko.
- Antiikva- ja Pyöreä-fontit näkyvät oikein vain Applen laitteilla.
- Testiselain antoi ä-kirjaimelliselle tiedostonimelle nimen "download". iPhonen jakovalikossa nimen pitäisi säilyä. Jos ei säily, nimeksi vaihdetaan `Matsik Forest.json`.
- Nimen tunnistus taivutuksista on karkea: nimen alusta otetaan kaikki paitsi kaksi viimeistä kirjainta, vähintään kolme kirjainta. Tämä voi tuottaa vääriä osumia.

## Seuraava askel

Emil kokeilee puhelimella omilla kuvitteellisilla asiakkaillaan. Avoimet kysymykset:
1. Harva käyntitiheys: onko "seuraava käynti sovittu" oikea sääntö?
2. Tarvitaanko tason 2 tavoitteeseen linkki?
3. Muokattava kaavioteksti.
4. Kalenterin aikaruudukko Juuresta.

## Emilin kommentit
