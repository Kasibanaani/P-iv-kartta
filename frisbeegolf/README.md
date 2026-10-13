# Metsärata 2.3

Itsenäinen frisbeegolf-peli, yksi HTML-tiedosto ilman ulkoisia kirjastoja.

Käyttö: https://kasibanaani.github.io/P-iv-kartta/frisbeegolf/

## Pelaaminen

Valitse Peli-välilehdellä yksi tiimin pelaaja, rata ja 1–3 omistettua kiekkoa. Aloita kierros. Etäisyys koriin näkyy kartalla selkeästi linnuntietä metreinä yhdessä tuulinuolen ja tuulen nopeuden kanssa. Kierroksen kaikki heiton perussäädöt ja heittopainike mahtuvat samalle ruudulle ilman vieritystä. Yleisnavigaatio piiloutuu kierroksen ajaksi pienen ☰-painikkeen taakse. Kiekko ja rysty/fore valitaan nykyistä valintaa näyttävistä painikkeista avautuvissa valikoissa. Kartta täyttää jäljelle jäävän tilan ja on pitkällä puhelinruudulla pystysuuntainen. Kori on uuden heittopaikan mukaan suunnatussa kartassa keskellä ylhäällä; kartta pysyy lennon aikana vakaana. Zoomauspainikkeet −, + ja Sovita. Tuulinuoli kääntyy kartan mukaan; heittomalli käyttää edelleen alkuperäisiä maailmakoordinaatteja.

Suuntaa ainoastaan napauttamalla kenttää. Valitse kiekko ja rysty/fore rauhassa. Napauta Aloita ja käytä samaa painiketta koko sarjassa:

1. **Korkeus:** 5–45° edestakaisin. Napautus lukitsee lähtökulman; pieni kulmakuva näyttää sen.
2. **Kallistus:** −35° antsa / +35° hysse edestakaisin, alussa 0°. Napautus lukitsee kulman.
3. **Voima:** 15–100 % nousee ja palaa suoraan alkuun. Napautus lukitsee voiman ja käynnistää välittömästi irrotuksen.
4. **Irrotus:** yksi veto alusta loppuun. Napauta Irrota vihreällä alueella. Liian aikainen tai myöhäinen napautus aiheuttaa suuntavirheen. Suurempi voima nopeuttaa vetoa ja kaventaa osumaikkunaa. Päädyssä mittari pysyy paikallaan odottaen napautusta.

Vaiheet käynnistyvät suoraan edellisen lukituksesta. Mittari ja painike pysyvät samassa paikassa. Pohjassa pitämistä tai sormen noston ajoittamista ei tarvita. Korkeuden, kallistuksen ja voiman toistokierroksista ei tule rangaistusta. Keskeytä palauttaa valmisteluun ilman heittoa. Myös sovelluksen siirtäminen taustalle keskeyttää sarjan. Suunta, kiekko, valikot ja zoomaus lukitaan sarjan ajaksi. Ohjeet ja viimeisen heiton palaute avautuvat i-painikkeesta. Heittopainike on edelleen 104×44 px ja leveä mittari 15 px korkea.

Putissa on kaksi vaihetta: nousevasta ja alkuun palaavasta mittarista lukitaan 0–25 metrin matka, sitten ajoitetaan irrotus. Matkan vihreä merkki vastaa korietäisyyttä; pelaajan taito ja itsevarmuus vaikuttavat toleranssiin ja irrotuksen ajoitukseen. Putin korkeutta ja kallistusta ei lukita, koska nykyinen puttimalli ei käytä niitä. Puttinäkymä on korin suuntaan katsova kuva; sen voi vaihtaa ylhäältä kuvattuun asetuksissa.

## Ratojen ilme

Kuusi väylää saavat omat maisemansa: kasteinen sammalmetsä, vaalea koivukuja, kivinen havukaarre, saniaispolku, kukkiva niitty ja kettupolku lämpimine lehtisävyineen. Kiviä, kantoja, saniaisia, kaatuneita koivuoksia, havuja, kukkia ja lehtiä sekä kapea kulunut polku. Pienet 20 metrin välein olevat etäisyysmerkit auttavat hahmottamaan väylää. Yksityiskohdat generoidaan pysyvästi väylän perusteella maailmakoordinaatteihin: zoomaus ja kartan kääntyminen eivät siirrä niitä. Putin perspektiivissä näkyy väylän oma metsä-/niittyreuna. Maisema ei muuta heiton fysiikkaa tai lisää esteosumia.

Tuulinuoli osoittaa mihin tuuli puhaltaa. Tuuli vaihtuu väylittäin. Puut ja pensaat ovat maisemaa eivätkä pysäytä kiekkoa (käyttäjän päätös 13.10.2026). OB-rajan ulkopuolelle päätyminen antaa yhden lisärangaistuksen ja palauttaa heittopaikan edelliselle paikalle. Heiton voi kumota kerran; myös itsevarmuus palautuu.

## Tiimi ja eteneminen

- Uusi ura alkaa Samilla, kolmella kiekolla ja 100 krediitillä.
- Kuusi kerättävää pelaajaa, kahdeksan kiekkoa, kuusi väylää ja kolme kierrosrataa.
- Yksi pelaaja pelaa koko kierroksen. Voitto on tiimin voitto. Radalla on näkyvä tavoitetulos: sitä parempi tai sama tulos on voitto.
- Voitto antaa radan palkkion, tappiokin 40 krediittiä. Rahalla rekrytoidaan pelaajia ja ostetaan kiekkoja.
- Pelaajat oppivat valmiista kierroksista (voitto 75, tappio 45 kokemusta; taso 100 pisteen välein, enintään 12 taitoparannusta). Rysty, fore, putti ja maksimimatka paranevat.
- Pelaajien vahvuudet: rysty, fore, hysse, antsa, putti, paineensieto ja palautuminen. Herkkä pelaaja menettää enemmän itseluottamusta huonosta heitosta. Hyvä suoritus ja väylänvaihto palauttavat sitä.
- Epävarmuus vaihtelee vedon tahtia ennen irrotusta. Lopputulokselle ei arvota erillistä epäonnistumista: nähty mittari ja irrotuksen napautus määräävät suuntavirheen.
- Kassi lukitaan kierroksen alussa; myöhemmät hankinnat eivät muuta sitä kesken kierroksen.

## Tallennus ja vanhat tiedot

Tiedot ovat vain käyttäjän selaimen paikallisessa muistissa. Ei verkkoon lähetettyä etenemisdataa, tunnuksia tai henkilökohtaisia tietoja. JSON/tekstivienti ja -palautus sekä appi tietoineen HTML-vientinä säilyvät. V1-varmuuskopiot ja vanha paikallistallennus muunnetaan V2-muotoon; vanhoja kierroksia ei palkita jälkikäteen. Uusi GitHub-osoite ei automaattisesti lue chat-esikatselun tai tiedoston tallennusta: vie ja tuo varmuuskopio.

## Mallin rajat

Lentomalli on pelillinen, ei tarkka aerodynamiikkasimulaatio. Lentonumerot, suhteellinen tuuli, liian pieni lähtönopeus, heittokorkeus ja kallistus vaikuttavat johdonmukaisesti. Puttinäkymä on yksinkertainen perspektiivipiirros. Ratoja ei arvota, eikä vastustajatiimejä tai sarjarakennetta ole vielä. Palkkiot, vaikeustaso, itseluottamuksen muutokset ja heittotuntuma kaipaavat pelikokeilua oikealla iPhonella.

## Testit

`sh frisbeegolf/testit/aja.sh` repon juuresta. Tarvitaan Node.js ja Playwright sekä Chromium. `BROWSER_EXECUTABLE` voi osoittaa erilliseen Chromium-binaariin. Ei pelin riippuvuus.

Logiikkatesti tarkistaa tallennuksen, V1-muunnoksen, eri kätisyydet ja heittotavat, tuulen, kallistuksen, voiman, ajoituksen, oppimisen, itsevarmuuden, OB:n ja esteiden poistamisen. Selaintesti tarkistaa 390×844, 320×568, 390×664 ja 320×844 px asettelun, yhden mittarin ja napautuspainikkeen näkyvyyden ilman vieritystä, neljän vaiheen välittömän etenemisen ja lukittujen arvojen välittymisen, aidot simuloidut kosketusnapautukset, pitkä painallus ei etene itsestään, näppäimistön toistopainallus, keskeytys ja taustalle siirtyminen, kartalta suuntaamisen, maisemien pysyvyyden, putin kaksi vaihetta sekä kierroksen etenemisen, perumisen, palkkiot, tallennukset ja uudelleenavaamisen. Testattu tietokoneen Chromiumissa, ei oikealla iPhonella/Safarissa.

## Myöhemmin pohdittavaa

Tilanteeseen sopivien heittokommenttien laaja valikoima ja mahdollinen putin korkeuden lukitus ovat käyttäjän jatkoideoita. Versio 2.3 toteuttaa napautussarjan ja maisemayksityiskohdat; kommenttivalikoimaa tai putin korkeuden lukitusta ei toteuteta. Vaiheiden useista kierroksista ei anneta rangaistusta.
