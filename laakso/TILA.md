# Laakso

**Tila:** Ensimmäinen pelattava versio, toteutustyö valmis · **Versio:** 1.0 · **Päivä:** 31.10.2026

**Käyttö:** https://kasibanaani.github.io/P-iv-kartta/laakso/

## Toteutettu

- Yksi yhteinen laakso ja kahdeksan itsenäistä bottiyritystä: kaksi viljatilaa, metsätyöt, metsästys, karjatila, puuverstas, kaivos ja sepänpaja.
- 36 kuukautta, 1 500 kullan alkupääoma, kartta, yritysten tiedot, sijoitussalkku ja talousnäkymä. Jokaisella uudella pelillä oma satunnaissiemen.
- Sijoitus on uusien osuuksien merkintä: raha menee yrityksen kassaan. Aloitus vaatii kaluston ja puskurin. Muilla rahoittajilla rajallinen 2 400 kullan pääoma; heidän merkintänsä laimentavat omistusprosenttia.
- Raaka-aineet, palkat, kuljetukset, huolto ja poistot. Viljelyssä kuukausikulut ennen elokuun satoa. Karjatilan rehu, tauti ja lauman kasvu. Lähimetsän ja riistan kuluminen ja palautuminen.
- Yhteiset markkinavarastot, tuotannon ja kulutuksen mukaan muuttuvat hinnat, ylitarjonnan vientialennus ja niukkuuden tuontilisä. Kotitaloudet ja kauppakaravaanit ovat ulkoinen markkina; suljettua rahataloutta ei mallinneta.
- Botit aloittavat, laajentavat, säilyttävät erisuuruisia puskureita ja lopettavat kolmen rahoituskatkon jälkeen. Viljelijän laajennus arvioidaan satokaudesta, muiden kahdesta voitollisesta kuukaudesta.
- Sääjakaumat ja keskeiset yhteisriskit näkyvät ennen päätöstä. 35 kullan selvitys paljastaa pysyvän tuottavuuden muuttamatta sääketjua. Kuukausikulujen arvio ja jälkikäteen todellinen kirjanpito.
- Osingot (enintään 40 % tuloksesta puskurin salliessa), rajattu takaisinosto 12 % kirjanpitoarvoa alempaan hintaan, lopputuloksen arvostus kassasta ja poistetusta kalustosta. Kasvavaa satoa ja tulevia voittoja ei arvosteta etukäteen.
- Paikallinen tallennus `laakso.save.v1`, JSON-tiedosto- ja tekstivienti/tuonti vahvistuksella. Virheellisen tallennuksen automaattinen korvaaminen estetään. Toisen välilehden muutos estää vanhan pelitilan jatkamisen.
- Appipaja 2.0:n kaikki kymmenen teemaa ja vaalea/tumma/laitteen mukaan; puhelin ensin. Kartan värit ovat pelimaailman värejä.

## Tarkistettu

`sh laakso/testit/aja.sh`: 15 testikokonaisuutta läpi, mukana 100 satunnaissiemenen koko 36 kuukauden peli, rahoituksen ja varallisuuden kirjanpito, osingot, takaisinosto, selvityksen satunnaistilasta riippumattomuus, käynnistys, sadonkorjuu, viljelijän laajennus, realisointi ja tallennuksen jatkuminen.

Tietokoneen Chromium-selaimessa: sijoitus, selvitys, kuukausi, salkku, talous, kirjanpitotietojen näkyminen, harmaa tumma teema, tekstivienti ja vahvistettu palautus. Upotetuissa näkymissä todelliset 390/320 ja 1440/1280 px leveydet; kaikki neljä välilehteä 320 px ilman vaakaylivuotoa. Ei testattu oikealla iPhonella/Safarilla.

## Ei tarkistettu / rajat

Talouden tasapaino on alustava. Markkinat ja botit ovat pelisääntöihin perustuvia malleja, eivät kielimallibotteja. Oikean iPhonen tallennus, tiedostolataukset ja kotinäyttökäyttö on kokeiltava laitteella. Ei palvelintyötä, moninpeliä eikä offline-välimuistia.

Maa-alueiden vapaa etsintä/valinta, erillinen maanomistus, teiden rakentaminen, uudet perustettavat yritykset ja pysyvät kauppasopimukset eivät ole toteutettu. Metallin sulatus ja sepäntyöt ovat yksi ketju yhdessä yrityksessä; puu- ja metallityökalut käyttävät samaa markkinatuotetta.

## Seuraava askel

Kokeile muutama peli ja arvioi, mistä onnistuminen on pääteltävissä ja mikä tuntuu arpapeliltä. Sen perusteella talouden tasapainotus ja päätösten selitykset. Laajemmat maa-aluevalinnat ovat jatkoehdotus, eivät tämän version ominaisuus.

## Emilin kommentit

