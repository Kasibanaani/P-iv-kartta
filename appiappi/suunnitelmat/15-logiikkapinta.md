# F30 Logiikkapinnan näkymä ja kaavan laajennus

17.10.2026. **Emilin idea** (viesti 17.10. klo 9.06), tekoälyn jäsentämä. Merkinnät: *Emilin linjaus* = hänen sanansa, *ehdotus* = tekoälyn suositus, jonka Emilin jonopäätös kattaa, ellei kohtaa ole merkitty ⏸. Ei toteutettu.

## Emilin linjaukset

1. Monta tapaa tehdä sama asia säilyy, ja uuden tavan saa luoda matalalla kynnyksellä. Käytössä vakiintuneet tavat voivat jättää muut **näkyvistä**, mutta mikään toiminto ei poistu eikä lakkaa toimimasta.
2. Koskee nyt **logiikkapuolta**. Tapahtumaketjujen viivat pysyvät aina.
3. Kaikki nykyiset toiminnot jäävät, jotta Emil ehtii oppia, mitä käyttää. Poistoa voi pyytää myöhemmin.
4. Näkymäasetuksen on oltava selvästi näkyvissä, ja käyttöliittymä ei saa näyttää monimutkaisemmalta.
5. Kaavaan JOS Excelin tapaan, ilman pakollista `=`-merkkiä alussa. Ei korvaa ikkunoita eikä mitään muuta.
6. Suomenkielinen sääntö on tulevaisuuden idea.

## Nykytila (tarkistettu koodista 17.10.2026)

- Kaavasta sen Kaavan tulokseen piirtyy jo himmeä katkoviiva (`drawLinks`, luokka `asg`). Muihin kaavan viittaamiin palikoihin ei piirry mitään.
- Logiikan ikkunoita voi venyttää. Tavallista palikkaa, myös Kaavaa, ei voi.
- Kaava alkaa suoraan ilman `=`-merkkiä (`uni > 7`). `tulos = a + b` kirjoittaa Kaavan tulokseen.
- Kaava hylkää tarkoituksella sulut ja sallii yhden vertailun: ”sulkuja ei käytetä kaavassa: laita osat ikkunaan” (periaatteet, kohta 5).
- Logiikkapuolella ei ole pelkkää visuaalista ryhmää. Rakentajan laput (Appi-appi 18) ovat muistiinpanoja, eivät kehyksiä.

## 1. Pistokkeet piiloon (jonossa)

- Logiikkakanvaasin kulmassa on pieni valinta **Pistokkeet: näkyvät / piilossa**. Kun pistokkeet ovat piilossa, valinta näkyy korostettuna (”Pistokkeet piilossa”), joten tila ei unohdu. Napautus vaihtaa tilan takaisin.
- **Palikan oma asetus** voittaa yleisen: *Pistokkeet: kuten muut / näkyvät / piilossa* (tarkastelijassa, Ulkonäkö). Näin Kaava voi olla ilman ja JOS-ikkuna pistokkeiden kanssa. *Ehdotus:* ei lajikohtaista asetustaulukkoa, koska se olisi raskas. Palikan asetukseen tulee nappi *Sama kaikille tämän lajin palikoille*.
- Piilotus ei poista mitään. Jo vedetyt nuolet näkyvät himmeinä ja toimivat. Sisäänmenon voi yhä antaa tarkastelijassa viitteellä tai arvona *(nykyinen tapa, tarkistetaan rakennettaessa joka lajille)*. Uutta nuolta ei voi vetää piilotetusta pistokkeesta, ja vetäminen alkaa taas, kun pistokkeet näytetään.
- Ketjun sisällä pistokkeet näkyvät aina (linjaus 2).
- Tallennus: valinnainen kenttä projektin logiikkanäkymälle ja palikalle. Vanha projekti näyttää pistokkeet kuten ennen. Muistuta varmuuskopiosta.

## 2. Viitteet himmeinä katkoviivoina (jonossa)

- Sama kulman valikko: **Viitteet: ei / valitulle / kaikille**. *Ehdotus:* oletus on *valitulle*. Valitun palikan kaavan viittaamat palikat ja sitä käyttävät palikat saavat himmeän katkonuolen. Se on kevyt ja kertoo vastauksen ”mistä tämä tulee”.
- Kaava → Kaavan tulos -katkoviiva piirtyy aina kuten nyt (Emil haluaa tämän nimenomaan).
- Katkoviiva on pelkkä näyttö. Sitä ei voi valita, poistaa eikä tallentaa, ja se lasketaan samasta tiedosta kuin Yhteydet-osio.
- Ero näkyy heti: itse piirretty nuoli on vahva ja yhtenäinen, automaattinen viite on himmeä ja katkoviivainen.

## 3. Kaava venyy ja sitä kirjoitetaan suoraan (jonossa)

- Kaavapalikkaa voi venyttää kulmasta kuten ikkunaa. Palikka näyttää koko kaavan rivitettynä, ja kun pistokkeet ovat piilossa, tila menee tekstille.
- Kaksoisnapautus (tai napautus valitussa palikassa) avaa kirjoituksen suoraan palikkaan. Samat viite-ehdotukset ja virheilmoitukset kuin tarkastelijassa. Enter tai napautus muualle tallentaa, Esc peruu.
- Koko tallentuu palikan solmuun (valinnainen leveys ja korkeus).

## 4. JOS kaavaan (jonossa; muuttaa periaatetta 5)

- Muoto suomalaisen Excelin tapaan: `jos(uni > 7; "hyvä"; "huono")`. Erotin on puolipiste, koska pilkku on desimaalimerkki. Pienet ja isot kirjaimet käyvät. Muuten-osa on valinnainen (puuttuva = tyhjä).
- Sisäkkäinen JOS käy. JOS:n sisällä on oma vertailunsa, joten yhden vertailun raja koskee jatkossa vain kaavan ylintä tasoa.
- *Ehdotus:* samalla `ja(…; …)` ja `tai(…; …)`, koska ilman niitä ensimmäinen JOS ohjaa käyttäjän taas ikkunaan. Muita funktioita ei tule ilman erillistä pyyntöä.
- Periaatteiden kohta 5 täsmennetään: ikkunat ovat edelleen yhdistelyn päätapa, mutta kaavan funktiot JOS, JA ja TAI ovat Emilin hyväksymä toinen reitti. Selitykset (Miksi?) näyttävät, kumpi haara valittiin.
- Kaava pysyy tilana: `jos` valitsee arvon, se ei tee toimintoa. Tapahtumat ja toiminnot kuuluvat edelleen JOS-ikkunalle ja Toiminnolle.

## 5. Ryhmäkehys (jonossa)

- Uusi logiikkapuolen palikka **Kehys**: ei logiikkaa, ei pistokkeita, ei arvoa. Vain reunaviiva, valinnainen nimi ja valinnainen kevyt sävy. Läpinäkyvyys on oletuksena täysi, tai sävyn voi valita valmiista vaaleista paletin väreistä.
- Kehyksen sisään raahattu palikka liikkuu kehyksen mukana kuten ikkunassa, mutta kehys ei vaikuta laskentaan.
- **Erikoispalikka** (PALIKKASAANNOT, osa B): ei arvoa eikä tapahtumia, koska se on rakentajan merkintä kuten lappu. Rekisteriin tulee rivi toteutuksen yhteydessä.

## 6. Suomenkielinen sääntö (idea, ei jonossa)

*Ehdotus:* tästä ei tehdä omaa mustaa laatikkoa, jonka sisällä suomi tulkitaan joka kerta. Sen sijaan se on **kirjoitustapa**: rakentaja kirjoittaa `jos uni on yli 7, niin näytä ”hyvä”`, ja appi rakentaa siitä tavalliset palikat (Kaava, JOS-ikkuna, Toiminto), jotka voi avata ja muuttaa. Tämä on sama periaate kuin pikaluonnissa (palikkasäännöt A8) ja F27:n tulkissa. Sanasto (”yli” = `>`, ”näytä” = Aseta teksti) olisi muokattava taulukko, eli sama asia kuin F27:n sanaoppi ja kuviot. Appi ei kutsu tekoälyä, joten kieli on rajattu ja ennustettava, ei vapaata puhetta.

## Avoimet kysymykset

- ⏸ **Suomenkielinen sääntö:** tehdäänkö kirjoitustapana, joka rakentaa tavalliset palikat (suositus), vai omana palikkana, joka tulkitsee lauseen joka kerta? Suunnitellaan F27:n tulkin jälkeen.
- **Paletin piilotus:** halutaanko myös, että paletista voi piilottaa palikkalajeja, joita ei käytä (”Näytä paletissa”)? Piilotettu laji toimisi projekteissa edelleen. Ei jonossa ennen Emilin vastausta.
- Ehdotus kohdassa 4: tulevatko JA ja TAI samalla kuin JOS? (oletus kyllä, Emil voi kumota)

## Linjakkuus

- A2/A5: pistokkeiden ja viitteiden asetukset ovat näkymäasetuksia, eivät palikan ominaisuuksia, joten niitä ei ohjata logiikalla.
- A7: JOS, JA ja TAI kaavassa poikkeavat ”vain ikkunat” -säännöstä Emilin nimenomaisella päätöksellä. PALIKKASAANNOT A7 päivitetään toteutuksen yhteydessä.
- A8: monta reittiä samaan asiaan säilyy, eikä mitään poisteta.
- B: Kehys on uusi erikoispalikka.
