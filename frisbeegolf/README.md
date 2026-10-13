# Metsärata 2.1

Itsenäinen frisbeegolf-peli, yksi HTML-tiedosto ilman ulkoisia kirjastoja.

Käyttö: https://kasibanaani.github.io/P-iv-kartta/frisbeegolf/

## Pelaaminen

Valitse Peli-välilehdellä yksi tiimin pelaaja, rata ja 1–3 omistettua kiekkoa. Aloita kierros. Etäisyys koriin näkyy aina kentän yläreunassa linnuntietä metreinä. Kierroksen kaikki heiton perussäädöt ja heittopainike mahtuvat samalle ruudulle ilman vieritystä. Yleisnavigaatio piiloutuu kierroksen ajaksi pienen ☰-painikkeen taakse. Kiekko ja rysty/fore valitaan nykyistä valintaa näyttävistä painikkeista avautuvissa valikoissa. Kartta täyttää jäljelle jäävän tilan ja on pitkällä puhelinruudulla pystysuuntainen. Kori on uuden heittopaikan mukaan suunnatussa kartassa keskellä ylhäällä; kartta pysyy lennon aikana vakaana. Zoomauspainikkeet −, + ja Sovita. Tuulinuoli kääntyy kartan mukaan; heittomalli käyttää edelleen alkuperäisiä maailmakoordinaatteja.

Suuntaa napauttamalla kenttää tai suuntasäätimellä (0° tarkoittaa suoraan koriin). Valitse kiekko, rysty/fore, kallistus (positiivinen hysse, negatiivinen antsa), korkeus ja voima. Pidä painiketta pohjassa ja irrota vihreällä alueella. Suurempi voima nopeuttaa vetoa ja kaventaa osumaikkunaa. Kämmen ja vasenkätisyys peilaavat kiekon kaaren.

Putissa pito kasvattaa etäisyyttä 0–25 metriin. Vapauta vihreän etäisyysmerkin kohdalla. Pelaajan puttitaito ja itsevarmuus vaikuttavat ajoitusikkunaan. Puttinäkymä on korin suuntaan katsova kuva; sen voi vaihtaa ylhäältä kuvattuun asetuksissa.

Tuulinuoli osoittaa mihin tuuli puhaltaa. Tuuli vaihtuu väylittäin. Puut ja pensaat ovat maisemaa eivätkä pysäytä kiekkoa (käyttäjän päätös 13.10.2026). OB-rajan ulkopuolelle päätyminen antaa yhden lisärangaistuksen ja palauttaa heittopaikan edelliselle paikalle. Heiton voi kumota kerran; myös itsevarmuus palautuu.

## Tiimi ja eteneminen

- Uusi ura alkaa Samilla, kolmella kiekolla ja 100 krediitillä.
- Kuusi kerättävää pelaajaa, kahdeksan kiekkoa, kuusi väylää ja kolme kierrosrataa.
- Yksi pelaaja pelaa koko kierroksen. Voitto on tiimin voitto. Radalla on näkyvä tavoitetulos: sitä parempi tai sama tulos on voitto.
- Voitto antaa radan palkkion, tappiokin 40 krediittiä. Rahalla rekrytoidaan pelaajia ja ostetaan kiekkoja.
- Pelaajat oppivat valmiista kierroksista (voitto 75, tappio 45 kokemusta; taso 100 pisteen välein, enintään 12 taitoparannusta). Rysty, fore, putti ja maksimimatka paranevat.
- Pelaajien vahvuudet: rysty, fore, hysse, antsa, putti, paineensieto ja palautuminen. Herkkä pelaaja menettää enemmän itseluottamusta huonosta heitosta. Hyvä suoritus ja väylänvaihto palauttavat sitä.
- Epävarmuus vaihtelee vedon tahtia ennen irrotusta. Lopputulokselle ei arvota erillistä epäonnistumista: nähty mittari ja vapautus määräävät suuntavirheen.
- Kassi lukitaan kierroksen alussa; myöhemmät hankinnat eivät muuta sitä kesken kierroksen.

## Tallennus ja vanhat tiedot

Tiedot ovat vain käyttäjän selaimen paikallisessa muistissa. Ei verkkoon lähetettyä etenemisdataa, tunnuksia tai henkilökohtaisia tietoja. JSON/tekstivienti ja -palautus sekä appi tietoineen HTML-vientinä säilyvät. V1-varmuuskopiot ja vanha paikallistallennus muunnetaan V2-muotoon; vanhoja kierroksia ei palkita jälkikäteen. Uusi GitHub-osoite ei automaattisesti lue chat-esikatselun tai tiedoston tallennusta: vie ja tuo varmuuskopio.

## Mallin rajat

Lentomalli on pelillinen, ei tarkka aerodynamiikkasimulaatio. Lentonumerot, suhteellinen tuuli, liian pieni lähtönopeus, heittokorkeus ja kallistus vaikuttavat johdonmukaisesti. Puttinäkymä on yksinkertainen perspektiivipiirros. Ratoja ei arvota, eikä vastustajatiimejä tai sarjarakennetta ole vielä. Palkkiot, vaikeustaso, itseluottamuksen muutokset ja heittotuntuma kaipaavat pelikokeilua oikealla iPhonella.

## Testit

`sh frisbeegolf/testit/aja.sh` repon juuresta. Tarvitaan Node.js ja Playwright sekä Chromium. `BROWSER_EXECUTABLE` voi osoittaa erilliseen Chromium-binaariin. Ei pelin riippuvuus.

Logiikkatesti tarkistaa tallennuksen, V1-muunnoksen, eri kätisyydet ja heittotavat, tuulen, kallistuksen, voiman, ajoituksen, oppimisen, itsevarmuuden, OB:n ja esteiden poistamisen. Selaintesti tarkistaa 390×844, 320×568, 390×664 ja 320×844 px asettelun, neljän säätimen yhtäaikaisen näkyvyyden ilman vieritystä, valikot, zoomauksen ja kameran koordinaattimuunnokset, heiton, perumisen, putin, kierrospalkkiot, rekrytoinnin, varmuuskopion ja uudelleenavaamisen. Testattu tietokoneen Chromiumissa, ei oikealla iPhonella/Safarissa.

