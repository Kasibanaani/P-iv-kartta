# Linjakkuuskartoitus 1 (17.10.2026)

Emilin pyyntö 17.10.2026 (päätöskortti: ✦-merkki ja ensimmäinen kartoitus). Mittapuu: [PALIKKASAANNOT.md](../PALIKKASAANNOT.md) ja [MISSIO.md](../MISSIO.md). Kartoitus tuottaa löydöksiä ja ehdotuksia, ei koodimuutoksia. **Mikään alla oleva ehdotus ei ole toteutuslupa.**

## Mitä katsottiin ja mitä ei

- **Katsottiin:** kaikki 55 palikkalajia (`K`) koodista päähaaran commitissa `8252533` (Appi-appi 22). Jokaisesta ajettiin Nodella oletusasetuksilla sisäänmenot ja ulostulot (`portsBase`) sekä ominaisuusrekisteri (`omat`): mitä voi asettaa käsin, lukea kaavalla ja ohjata logiikalla. Lisäksi käyttäjälle näkyvät nimet ja periaatteiden päätökset.
- **Ei katsottu:** käyttöliittymän polkuja ja paneeleja, Miksi?- ja Yhteydet-selityksiä lajeittain, testikattavuutta lajeittain, tallennuksen korjausta eikä asetuksista riippuvia lisäkohtia (esim. painikkeen pitkä painallus, Liikkeen ohjaustavat). Manuaalia ei ole, joten nykytilakuva on vain tämä koodiote.

## Yleiskuva

Linja pitää pääosin. Näkymäpalikat jakavat saman kielen: samat yhteiset kohdat (näkyy kun, harmaana kun, teksti, vaihtoväri kun, siirto), samat ohjattavat ominaisuudet (paikka, koko, väri, läpinäkyvyys, järjestys, kierto, peilaus, este, massa, kimmoisuus) ja käyttöraahaus. Logiikkapalikoiden *käytössä*-ominaisuus on ohjattava kaikissa tapahtumapalikoissa. Tapahtuman tiedot, Rivi ja Rivijoukko käyttävät samaa `palikka.sarake`-luentaa. Ajan työkaluja on useita (Sekuntikello, Ajastin, Muutos ajassa, Odota kunnes), mikä on missiossa hyvä asia: sama asia monta yleistä reittiä.

Poikkeamat kasautuvat kahteen paikkaan: **syöttävät ohjaimet eivät kerro muutoksesta tapahtumana**, ja **logiikkapalikoiden asetukset eivät näy kaavalle**.

## Löydökset

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| L1 | iso | A4 | Säädin, Tekstikenttä, Lukukenttä, Valintaruutu, Kytkin, Päivämäärä ja Lista eivät lähetä tapahtumaa, kun arvo muuttuu. Painike, Kalenteri ja Tatti lähettävät. Muutokseen voi reagoida vain reunalla: arvon nuoli tapahtumakohtaan, JOS ja KUN laukeavat, kun arvo tai ehto muuttuu epätodesta todeksi (`tick`). Säätimen siirto arvosta 3 arvoon 4 ei siis laukaise mitään. | Yhteinen tapahtuma *muuttui* kaikille syöttäville ohjaimille. Tapahtuman tiedot (`uusi`, `vanha`, `lähde`) on jo olemassa ja sopii siihen sellaisenaan. |
| L2 | iso | A2 | Logiikkapalikoiden asetuksia ei voi lukea kaavalla: esim. `satu.min`, `ajastin.kesto`, `muutos.kesto`, `toista.kerrat`, Käyrän rajat. Ne ovat sisäänmenoja (ohjattavissa nuolella), mutta paneelissa asetettu arvo ei näy `omat`-rekisterissä. Näkymäpalikoissa vastaava toimii (`säädin.max`). | Sisäänmenon nykyinen arvo luettavaksi ominaisuudeksi `omat`-rekisteriin (`port`-kenttä on jo olemassa). |
| L3 | keski | A2, A3 | Kaksi ohjausmallia: logiikkapalikan asetus on kiinteä sisäänmeno, näkymäpalikan ominaisuus avattava kohta `o_<avain>`. Rakentajalle molemmat ovat nuoli kohtaan, joten malli on hyväksyttävä, mutta se on opittava ero. Osa asetuksista ei ole kummassakaan: Arvan haarojen määrä, Monta haaraa- ja Hakutaulukko-rivien rajat, Liikkeen rajat (xmin…ymax) ja liukuma, Ketjun *uusi käynnistys*. | Selitetään manuaalissa. Puuttuvat ohjattaviksi vain tarpeen mukaan; kirjataan rajaukseksi. |
| L4 | keski | A1 | Lähekkäiset nimet: *Ehto* (ketjun haara) ja *JOS*; *Hakutaulukko* ja *Tietotaulukko*; näyttöpalikka *Aikajana* ja tuleva *Jana* (F28). | Ei pikamuutosta. Jana F28:n suunnittelussa ratkaistava nimi; Ehto/JOS selitettävä tarkastelijassa yhdellä lauseella. |
| L5 | keski | A5 | Toistimelta puuttuvat *harmaana kun*, *vaihtoväri kun* ja siirto x/y. Teksti puuttuu tarkoituksella (kortit sisällä). | Lisätään puuttuvat kolme, jos niille on käyttöä; muuten kirjataan rajaukseksi. |
| L6 | pieni | A5 | Yhteiset ominaisuudet jaetaan myös sinne, missä ne eivät tee mitään (Reitin teksti, Kaavion massa). Yksi sääntö on yksinkertaisempi kuin monta poikkeusta, joten tämä on hyväksyttävää. | Merkityksetön kohta voisi näkyä harmaana. Ei kiirettä. |
| L7 | pieni | A4 | Kaavio, Monitori, Reitti ja Kuva eivät anna arvoa ulos. Kuvasarjalla ei ole tapahtumaa *kierros valmis*, vaikka *kuvanro* ja *pyörii* ovat luettavissa. | Kuvasarjan *kierros valmis* -tapahtuma, kun tarvitaan. |
| L8 | – | – | Kerroksen ja Kameran osittainen ohjattavuus on jo `TILA.md`:n avoimissa kysymyksissä. | Ei uutta. |

## Erikoispalikoiden arvio

Rekisteri päivitettiin: [PALIKKASAANNOT.md, Rekisteri](../PALIKKASAANNOT.md#rekisteri). Muutokset ehdokaslistaan:

- **Kuva (`pkuva`)** poistettiin: sisäinen nimi ei näy käyttäjälle, joten se ei ole poikkeus säännöstä A1.
- **Ketjun palikat (`ch`)** lisättiin lajiryhmänä: Ajastin, Ehto, Odota kunnes, Arpa, Toista, Ketjun tulos, Lopeta ketju, Monta haaraa ja efektit etenevät ketjun viivoja pitkin. Ryhmällä on omat yhteiset säännöt, joten se ei ole yksittäinen poikkeus.
- **Kaavan tulos** on poikkeus, joka on jo päätetty periaatteissa (kohta 4 ja tekninen malli).
- Muut ehdokkaat arvioitiin tarkoituksellisiksi. Toistin on osittain korjattava (L5).

## Seuraava kartoitus

PALIKKASAANNOT.md:n mukaan: ennen uuden toimintoryhmän suunnittelua, viiden valmiin jonon kohdan jälkeen tai pyynnöstä. Seuraavalla kerralla katsotaan ne kohdat, jotka nyt jäivät katsomatta: käyttöliittymän polut, Miksi? lajeittain ja testikattavuus.
