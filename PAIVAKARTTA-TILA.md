# Päiväkartta: tila

**Vaihe:** käytössä · **Versio:** 2.0 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/ · **Päivitetty:** 15.11.2026

Henkilökohtainen päiväloki: itse lisätyt asiat napautetaan päivälle, ja appi arvioi heti, kuinka todennäköisiä muut asiat ovat tämän päivän valintojen perusteella. Koodi repon juuressa (`index.html`), testit kansiossa `testit/`.

## Valmiina

- **2.0 (15.11.2026), Emilin appilinjan mukainen uudistus** (Emil antoi luvan päättää itse):
  - Inforivi ylhäällä (päivämäärä, vk, valittujen määrä, i-ohje). Päivämäärästä aukeaa kuukausikalenteri (6 viikkoriviä, kirjatut päivät pisteellä).
  - Alapalkki: osionappi (Päivä / Yhteydet), ‹ Tänään › päivä kerrallaan, pikavienti (`paivakartta.json`, punainen pallero kun vienti jäänyt) ja Valikko.
  - Päivä: viikkonauha, asiat omassa järjestyksessä, palkki + prosentti, **nuoli ylös/alas, kun tämän päivän valinnat nostivat tai laskivat arviota ≥ 5 %-yks.** (`lift` moottorissa). Napautus päivittää napit paikallaan (ei pomppimista).
  - `+ Uusi asia` suoraan päivän listan perässä ja Valikko → Asiat -sivulla.
  - Pitkä painallus asiaan: pieni ikkuna, jossa asian luvut, sen vahvimmat yhteydet muihin asioihin, "Ei koske tätä päivää", Muokkaa ja Yhteydet.
  - Valikko: Asiat (raahaus kahvasta, nimi avaa muokkauksen ilman Tallenna-nappia, piilotus, poisto vahvistuksella), Ulkoasu (teema, vaalea/tumma, fontti, rivit/tiivis), Varmuuskopio (vienti/tuonti tiedostona ja tekstinä, tyhjennys).
  - Yhteydet: kohde valitaan alapalkista; kohteella ensin yhteydet muihin asioihin, sitten viikonpäivät. Yksittäiset, Yhdistelmät, Polku ennallaan.
  - Termi yhtenäistetty: "asia" (ennen sekaisin vaihtoehto/väite). Ohjetekstit i-napin takana.
  - Appi vaihtaa itse uuteen päivään, jos se on ollut auki yön yli.
- Tallennusmuoto ennallaan (`paivakartta:v1`, vienti `version:2`): vanhat kirjaukset ja vientitiedostot toimivat.
- Testit: `sh testit/aja.sh` = `logiikka.js` (Node: ennuste, nuoli, vähän dataa, vanha tiedosto) + `selain_perus.py` (390 ja 320 px). Selainohjeet: modern-web-guidance drag-and-drop, light-dismiss-a-dialog (closedby ei Safarissa → oma ulkopuolisen napautuksen käsittely).

## Ei tarkistettu

- Testattu tietokoneen Chromiumilla, ei oikealla iPhonella: raahaus sormella, pitkä painallus (Safarin tekstinvalinta / suurennuslasi), näppäimistö muokkausikkunassa ja iOS:n päivävalitsin alkamispäivässä.

## Seuraavaksi

- Emil kokeilee puhelimella. Mahdollinen jatko (tekoälyn ehdotus): ennusteen varmuuden näyttäminen (esim. himmeä prosentti, kun päiviä on vähän).

## Avoimet kysymykset

- Pitkä painallus avaa nyt ikkunan (ennen se merkitsi asian suoraan pois päältä). Sopiiko yksi lisänapautus?

## Emilin kommentit

- (tyhjä)

Arkisto (ei enää päivitetä): https://app.notion.com/3f6977255eec81d987bde99a1785f1e1
