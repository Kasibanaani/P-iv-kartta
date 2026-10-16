# Appi-apin tarkoitus ja rakentamisen periaatteet

16.10.2026. Lue tämä ennen yksityiskohtaisia suunnitelmia. Emilin käyttäjälinjaukset ovat sitovia; alla nimetyt tekniset suunnitteluratkaisut ovat niiden toteutusehdotus. [Hakemisto ja päätökset](../SUUNNITELMA.md).

## Tarkoitus

Appi-appi on tietokoneella käytettävä visuaalinen rakentamisympäristö. Rakentaja tekee omia sovelluksia järjestämällä käyttöelementtejä ja yhdistämällä logiikkapalikoita. Valmis käyttöpinta voi olla puhelimella, iPadilla tai tietokoneella. Ympäristö ei ole yhden pelin, päiväkirjan, hoitomenetelmän tai muun konseptin moottori. Sovelluskohtainen sisältö ja säännöt kuuluvat rakennettuun projektiin.

## Käyttäjän linjaukset

1. **Yleiskäyttöisyys.** Lisää pienin tarkoituksenmukainen ilmaisuvoima. Kysy jokaisesta perusominaisuudesta, toimiiko sama rakennusosa ainakin kolmessa toisistaan poikkeavassa käytössä. Tulevat esiasetukset voivat tarjota erityiskäyttöä.
2. **Käyttöpinta ja logiikka erillään.** Painike on vuorovaikutus ja tapahtuman lähde, ei sisäinen sovelluskohtainen toimintolista. Logiikka saa ohjata käyttöpintaa ja käyttöpinta logiikkaa molempiin suuntiin.
3. **Nykyinen kieli säilyy.** Kaavat, Kaavan tulos, ikkunat, nuolet, ehdot, tapahtumat ja toimintoketjut ovat lähtökohta. Älä lisää toista viittauskieltä, piilotettuja sääntölauseita tai JavaScriptiä vaativaa käyttäjäpolkua.
4. **Kaava ja toiminto ovat eri asioita.** Kaava kuvaa laskettua tilaa; toiminto muuttaa käyttötietoa tapahtumahetkellä. Kaavan tulos nimeää lasketun arvon. Pelkkä näytön piirto ei suorita toimintoa eikä uutta arvontaa.
5. **Ikkunat yhdistävät.** JA/TAI, rajatut määrät ja koosteet käyttävät olemassa olevaa ikkunamallia. Älä lisää sulku-/funktiokieltä vain yhden uuden tarpeen vuoksi.
6. **Irrallisuus tekee yhdistelystä mahdollista.** Sisältö, tietolähde, laskenta, esitys, vuorovaikutus ja tallennus erotetaan siellä, missä niiden on voitava vaihtua itsenäisesti.
7. **Rakentaja näkee toiminnan.** Nykyinen arvo, sen lähde, viittaukset, virhe ja Miksi?-selitys ovat löydettävissä. Oma palikka on avattava, ei musta laatikko.
8. **Peruskäyttö pysyy kevyenä.** Näytä rivikäsittely, kontekstin valinta ja muut lisäominaisuudet vasta niitä käytettäessä. Tavallisen painikkeen lisääminen ei avaa tietokanta-asetuksia.
9. **Ei rinnakkaista toteutusta turhaan.** Ennätys syntyy Muistilla, koostelaskulla ja Aseta-toiminnolla. Valikon voi tehdä kerroksesta ja tavallisista palikoista. Mukava pikaluonti saa tuottaa tämän tavallisen logiikan.
10. **Valinnat ja järjestys ovat käyttäjän.** Sisältöä ei täytetä oikeaan projektiin pyytämättä. Älä järjestä asioita suosion mukaan. Testisisältö on synteettistä ja erillistä.

## Nykyinen tekninen malli

- `appiappi/index.html`: `<script id="engine">`, `KK`, puhdas moottori; `<script id="ui">`, käyttöliittymä. Älä siirrä laskentaa DOMiin.
- `K`, `ports`/`portsBase`, `omat`, `Ev`, kaavojen jäsennys, `fire`/`handleLink`/`runAction`, `chainStart`/`chainAdvance`/`chainPoll` ovat nykyisiä laajennuskohtia. Tarkista nimet nykykoodista, älä nojaa rivinumeroihin.
- Ominaisuuden etusija säilyy: ohjattu kaava/nuoli > toiminnon asettama > perusarvo. Yhdellä ominaisuudella yksi jatkuva ohjaus; ristiriita näkyy.
- Kaavan `tulos = a + b` kohdistuu Kaavan tulos -palikkaan; se ei ole yleinen tietokantakirjoitus. `==` on vertailu. Tavallisten palikoiden nykyistä tulkintaa ei muuteta.
- Viite on luettava nimi, tallennettu yhteys pysyvä tunniste. Uudelleennimeäminen ei riko yhteyttä. Samanniminen uusi kohde ei peri poistetun tunnistetta.
- Projektin rakenne, käyttötieto `st`, moottorin seuranta `mem` ja synkronointikirjanpito erotetaan. Uudet tietorakenteet nimetään ja versioidaan; vanhoja avaimia ei oteta uuteen merkitykseen.
- Kerros, Kamera, Monitori, Sekuntikello, efektit, kuvasarja ja reitti ovat jo nykyisiä rakennusosia. Käytä niitä; kaikki historialliset puutelistat eivät enää päde.

## Suunnitelmien tulkitseminen

Kaikissa seuraavissa esimerkeissä uusi toiminto, viite tai palikkalaji on suunniteltu, ellei se ole nimenomaisesti nykyiseksi todettu. Käyttöliittymän lopullinen sanamuoto ja kentän sisäinen avain ovat teknisiä valintoja; merkitykset, kolme lukitustilaa ja niiden julkiset numerot ovat tässä dokumentoidut.

Taulukkoa ei korvata nykyisellä Listalla, toistuvaa esitystä ei korvata käsin monistamisella, eikä omaa moduulia korvata pelkällä tiivistetyllä ikkunalla: näissä puuttuvat pysyvä kohdeidentiteetti tai yhteinen määrittely. Täsmennä oikeaa perustaa.

Jos pyydetty toteutus edellyttäisi ulkoista palvelua, uusia salaisuuksia tai merkittävää arkkitehtuurinvaihtoa, esitä konkreettinen rajaus käyttäjälle ennen riippuvaa toteutusta. Tavallisiin paikallisiin toteutusvalintoihin ei pyydetä uudelleen lupaa.

## Jokaisen vaiheen valmistumiskriteeri

Rakentaja tekee ominaisuuden ilman koodia; käyttö toimii vähintään kolmessa perustellussa sovellusesimerkissä; laskenta näkyy logiikkapinnalla; virheet ja puuttuvat viitteet näkyvät; tallennus/tuonti/migraatio säilyvät; suoritus toimii ilman rakentajan DOMia; asianmukaiset vanhat ja uudet testit läpäisevät. Testitulokset ja laiterajat raportoidaan tosina. Dokumentaation kirjoittaminen ei ole ominaisuuden toteutus.
