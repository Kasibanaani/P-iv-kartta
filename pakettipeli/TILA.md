# Pakettipeli: tila

**Vaihe:** kokeilussa · **Versio:** 2 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/pakettipeli/ · **Päivitetty:** 24.10.2026

Kasuaali puhelinpeli Mini Motorwaysin tyyliin. Yksityisyrittäjä ajaa yhdellä autolla, valitsee keikat ja tekee reitin napauttelemalla. Suunnitelma ja Emilin päätökset: `SUUNNITELMA.md` (osio *Versio 2* alussa, v1 historiana).

## Valmiina (versio 2, 24.10.2026)

- Generoitu ruutukaavakaupunki 14 × 22, tiheä tieverkko. 12 sopimusyritystä avautuu maineen mukaan (alussa 5). Varikko on lähtöpaikka.
- **Ohjaus (Emil 24.10. klo 19):** ei erillistä tilaa eikä hidastusta. Jokainen napautus lisää paikan reitin perään, enintään 10 (sininen viiva, numerot). Tarjouksen napautus hyväksyy ja lisää noudon. Mitään ei lisätä automaattisesti. *Nollaa reitti* jättää nykyisen kohteen; sen jälkeen auto jää odottamaan. Täysi reitti ja sama paikka peräkkäin kerrotaan ilmoituksella.
- Merkit: tarjous = katkoviivaruutu kirjaimella ja haalea rengas kohteessa. Hyväksytty = kirjaimeton nouto ↑ (tumma ruutu), kohde ↓ (rengas), kyydissä olevan kohde täytetty ↓; pallo kertoo pakettimäärän.
- Tarjontaa on enemmän kuin ehtii hoitaa: 10 tarjousta/min ja enintään 6 auki alussa, maine nostaa (15/min, 14 auki). Korjattu bugi: tarjoukset loppuivat, koska tahti oli 1 per 40 s ja epäonnistunut arvonta hukkasi vuoron.
- Korjattu 24.10. illalla: napautukset osuivat väärään kohtaan, kun kartan koko muuttui ilman ikkunan koon muutosta (esim. alapalkin napin teksti rivittyi uudelleen tai iPhonen turvavälit asettuivat latauksen jälkeen). Nyt kartan koko tarkistetaan joka ruudunpäivityksellä. Samalla talon napautus valitsee aina sormen alla olevan talon oven, vaikka tie tai naapuritalon merkki olisi lähellä.
- Auto noutaa ja jättää ohittaessaan. Autossa luku kyydissä/paikat ja +noudettavana. Alapalkissa: kyydissä · nouto · reitti n/10.
- Talous: kassa, tuotto/min (minuutin keskiarvo), kulut/min, tulos/min. Viisi autotasoa lainalla (kulut 24/32/42/52/64 per min). Keikan maksu on (3 + 0,45 × matka) × paketit, keikan koko 1–8 pakettia maineen mukaan. Konkurssi heti, kun kassa on alle 0.
- *Lopeta peli*: pikakelaus 8×, hyväksytyt ajetaan loppuun (reitti täydennetään vain tässä), kassa on tulos.
- Teema, varmuuskopio tiedostona ja tekstinä, automaattitallennus `pakettipeli:v2`. Tallennusmuoto ei muuttunut tässä vaiheessa.
- Testit `sh pakettipeli/testit/aja.sh` (moottori nodella, selain 390 ja 320 px).

## Ei tarkistettu

- Oikea iPhone: oliko kartan koon muutos juuri Emilin näkemän väärän osuman syy (toistettu vain tietokoneella), napautusten osuvuus tiheässä kartassa, Dynamic Islandin turvaväli ja suorituskyky. Testit ajettiin tietokoneen Chromiumilla.
- Tasapaino vain botilla, joka ottaa kaiken minkä mahtuu ja järjestää reitin itse. Botilla alussa noin +45/min, isolla maineella pieni auto noin +75/min ja kuorma-auto noin +100/min. Ihmisen tulos jää todennäköisesti pienemmäksi.
- Näkyykö 6–14 avointa tarjousta kartalla selkeästi vai tuleeko sotkua.

## Seuraavaksi

- Emil pelaa: toimiiko suora napautus ilman tilaa, riittääkö 10 paikkaa, ja onko tarjouksia sopivasti yli?
- Myöhemmin: kaupunkityyppejä lisää ja karttaeditori.

## Avoimet kysymykset

- Jääkö keikan koko (useampi paketti), vai riittääkö yksi paketti per keikka?
- Pitäisikö napautuksella voida poistaa viimeinen paikka (nyt vain *Nollaa reitti*)?

## Emilin kommentit

- (tyhjä)
