# Pakettipeli: tila

**Vaihe:** kokeilussa · **Versio:** 2 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/pakettipeli/ · **Päivitetty:** 24.10.2026

Kasuaali puhelinpeli Mini Motorwaysin tyyliin. Yksityisyrittäjä ajaa yhdellä autolla, valitsee keikat ja piirtää reitin napauttelemalla. Suunnitelma ja Emilin päätökset: `SUUNNITELMA.md` (versio 2 alussa, versio 1 historiana).

## Valmiina (versio 2, 24.10.2026)

- Generoitu ruutukaavakaupunki 14 × 22 (tiheämpi tieverkko kuin v1:ssä). Siinä on 12 sopimusyritystä, jotka avautuvat maineen mukaan (alussa 4), ja varikko on lähtöpaikka.
- Tarjoukset (katkoviivaruutu ja haalea rengas, harmaa voimassaolokehä), hyväksytyt (täytetty ruutu ja rengas) ja kyydissä (täytetty ympyrä määränpäässä). Keikan koko 1–6 pakettia näkyy pallona kulmassa.
- Napautus hyväksyy keikan jonon perään. *Uusi reitti* (Emil 24.10. illalla): peli hidastuu 0,25×:iin, kartta saa sinisen kehyksen ja bannerin ("Reitin rakennus · N paikkaa"), alapalkki muuttuu siniseksi ja nappi vihreäksi *Valmis ✓*. Auto ajaa vain seuraavaan pisteeseensä (harmaa katkoviiva) ja jää odottamaan. Luonnokseen voi lisätä rajattomasti paikkoja (sininen yhtenäinen viiva, numerot). *Valmis* lisää luonnoksen seuraavan pisteen perään ja täydentää puuttuvat hyväksytyt.
- Korjattu 24.10.: napit ja napautukset takkusivat, koska alapalkin teksti kirjoitettiin uudelleen joka ruudunpäivityksellä ja värit luettiin tyyleistä kymmeniä kertoja per ruutu. Nyt DOM päivittyy vain muuttuessa, ja värit ovat välimuistissa. Oikealla iPhonella ei ole varmistettu.
- Auto noutaa ja jättää automaattisesti ohittaessaan. Tyhjä auto jää paikalleen. Autossa on kyydissä/paikat ja +hyväksytyt.
- Talous: kassa, tuotto/min, kulut/min, tulos/min (päivitys kerran sekunnissa). Viisi autotasoa lainalla. Konkurssi heti, kun kassa on alle 0.
- Maine vain kasvaa ja lisää tarjouksia, yrityksiä ja keikkojen kokoa.
- *Lopeta peli*: pikakelaus 8×, lopputulos = kassa, ennätykset.
- Teema, varmuuskopio tiedostona ja tekstinä, automaattitallennus `pakettipeli:v2`. V1:n peliä ei voi jatkaa, mutta sen suurin kassa ja teema siirtyvät.
- Testit `sh pakettipeli/testit/aja.sh`.

## Ei tarkistettu

- Oikea iPhone: napautusten osuvuus, Dynamic Islandin turvaväli ja suorituskyky.
- Tasapaino vain botilla (ottaa lähimmän mahtuvan keikan, ei järjestele reittiä). Ihmisen pelissä iso auto todennäköisesti kannattaa paremmin, koska ihminen niputtaa keikkoja.
- Keikan koko on tekoälyn lisäys, jota Emil ei ole pyytänyt (perustelu suunnitelmassa).

## Seuraavaksi

- Emil pelaa v2:ta: tuntuuko yhden auton ohjaus hyvältä, ja ovatko keikkojen tahti, kulut ja tasojen hinnat kohdallaan?
- Myöhemmin: kaupunkityyppejä lisää ja karttaeditori.

## Avoimet kysymykset

- Jääkö keikan koko (useampi paketti), vai riittääkö yksi paketti per keikka?
- Pitäisikö *Uusi reitti* -tilan päättyä myös automaattisesti (esim. muutaman sekunnin kuluttua)?

## Emilin kommentit

- (tyhjä)
