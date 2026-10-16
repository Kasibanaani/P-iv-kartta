# Kokeileminen, kumoaminen ja julkaiseminen

F22–F23. Ehdotettu toteutus, ei lupaus jo olemassa olevasta ominaisuudesta. [Periaatteet](00-periaatteet.md), [suunnitelman hakemisto](../SUUNNITELMA.md).

## Testitila erillään oikeasta käytöstä (F22)

**Nykytilan ero:** rakenteen nykyinen Kumoa säilyttää käyttötiedot eikä ole käytön peruutus. Ketjun nykyinen kokeilu voi tehdä oikeita muutoksia. Nämä toiminnot eivät muutu testitilaksi vain nimeä vaihtamalla.

**Rakentajan polku:** Kokeile projektia → kopioi käyttötiedot kokeeseen tai aloita puhtaasta → käytä painikkeita/ketjuja → poistu kokeesta. Näytä testitila jatkuvasti. Oikean käytön tiedot eivät muutu, eikä testitila synkronoidu oikeina kirjauksina. Kokeilusta oikeaan käyttöön siirrettävät arvot olisivat erillinen näkyvä toiminto, eivät poistumisen oletus.

**Moottori:** erillinen kokeen tilasäilö; sama `KK` ja samat arviointitoiminnot. Kello, satunnaisuus ja ulkoisten vaikutusten adapterit injektoidaan. Testikelloa voi siirtää, satunnaissiementä pitää samana ja suoritusta edistää vaihe kerrallaan. Vain näkymän esittämiseen liittyvät tapahtumat piirretään; verkkolähetys tai muu todellinen ulkoinen vaikutus kirjataan kokeen lokiin ja korvataan oletuksena valesovittimella.

**Suoritusnäkymä:** nykyinen vaihe, tapahtuman tiedot, rivikonteksti, lukitustila, lukitushetki, ketjun lukema ja oikean/kokeen tilan nykyinen arvo sekä vaiheen muutokset. Ristiriita tai katkennut viite avaa oikean kohdan. Kaikkien kolmen lukitustilan erot on voitava havaita ilman koodia.

**Tallennettu koe:** valitse lähtötilanne, syötteet/tapahtumat ja tarkistettavat tulokset. Odotetut tulokset ovat valittujen Kaavan tulosten, kenttien, tapahtumien tai ketjun lopputilan arvoja. Tallenna testiin tarvittava määrittelyversio, kellon hetket ja siemen. Älä kopioi henkilökohtaista koko projektia julkiseen testitiedostoon.

**Kokeet:** kokeilun kirjaus ei näy oikeassa historiassa; sama lähtö, aika ja siemen antavat saman tuloksen; projektin sulkeminen ei jätä testitilaa seuraavan oikean käytön tiedoksi; ulkoinen palvelu ei saa testiviestiä; tallennettu koe löytää väärän rivin päivityksen eikä vain peilaa toteutusta.

## Käytön kumoaminen

**Tarkoitus:** käyttäjä voi perua sovelluksessa tehdyn rajatun paikallisen toiminnon, kuten yhden kirjauksen tai usean kentän hyväksytyn muutospaketin. Tämä on erillinen toiminto rakentajan rakenteen Kumoa/Toista-toiminnoista.

**Malli:** toiminnon tunniste, kohteet, aiemmat ja uudet paikalliset arvot sekä tieto ulkoisista vaikutuksista. Palauta vain kohteet, jotka kumottava toiminto muutti. Jos joku muu on ehtinyt muuttaa samaa kohdetta, näytä ristiriita; älä pyyhi myöhempää työtä huomaamatta. Kumoaminen tuottaa oman jäljitettävän muutoksen.

**Kaikki tai ei mitään -paketti:** D07:n mukaan tavallinen ketju säilyttää jo onnistuneet muutokset virheessä. Rakentaja voi tulevassa erillisessä muutospaketissa kerätä paikalliset kirjoitukset, tarkistaa ne ja soveltaa ne yhtenä kokonaisuutena. Tämä ei sisälly automaattisesti ketjun lukitukseen. Odottavat verkkotoimet, sähköpostit tai toistetut äänet eivät kuulu yleiseen paikalliseen peruutuslupaukseen.

**Kokeet:** monen kentän kirjaus ja sen peruminen; toinen käyttäjämuutos samaan kenttään; poistettujen tunnisteiden palautus; kaksi peräkkäistä kumoamista; virhe ennen paketin soveltamista ei tee osamuutosta. Tavallinen ketju säilyttää D07:n mukaisen toiminnan.

## Luonnos ja julkaistu versio (F23)

**Rakentaja:** nykyisestä käyttöversiosta luonnos, esikatselu/testit, julkaise määrittely. Julkaistu versio pysyy käytössä luonnostelun ajan. Näytä versio ja julkaisun vaikutukset käyttötiedon rakenteeseen.

Määrittelyn julkaisu ei ole käyttötietojen tuonti. Käyttäjän kirjaukset ja esiintymätilat liitetään versioituihin pysyviin tunnisteisiin; tarvittava migraatio tarkistetaan ennen vaihtoa. Oman palikan D03-automaattipäivitys koskee yhteistä mallia saman projektiversion sisällä. Julkaistu käyttäjäversio ei päivity julkaisemattomasta luonnoksesta; sen mallien uusi määrittely tulee julkaistun version päivityksessä. Tämä erotus ei luo salaista manuaalista esiintymäkohtaista päivitysporttia.

**Kokeet:** luonnoksen muokkaus ei muuta julkaistua toimintaa; julkaisu säilyttää käyttötiedot; vanha varmuuskopio voidaan lukea; epäonnistunut migraatio jättää aiemman käyttöversion toimivaksi. Verkossa olevan julkaisun nouto ja laitteessa olevan sisällön tuoreus erotetaan.

## Vienti erilliseksi käyttäjä-apiksi

**Rakentaja:** Vie käyttäjä-appi → valitse rakenne ja haluttu aloitussisältö; käyttötietojen mukaanotto oma tietoinen valinta → tarkista → tiedosto/paketti. Vienti ei itsessään julkaise verkkoon.

**Tekniikka:** sama moottori ja tarpeelliset käyttöpinnan esittäjät, ei toista uudelleenkirjoitettua sääntömoottoria. Rakentajan paletti ja muokkaustyökalut jäävät pois. Paketti sisältää tarvitut moduulimäärittelyt ja resurssit sekä versiot. Avain-/tunnustietoja, yksityistä projektikirjanpitoa tai tarpeettomia käyttötilannekuvia ei kopioida mukaan. Itsestään tallentuvat tiedot käyttävät erillistä nimiavaruutta.

**Aloitus ja jatkuvuus:** valittu aloitusnäkymä, ymmärrettävä tyhjä tila, paluu, keskeneräisen jatkaminen ja todellinen tallennusilmaisin. Näiden säännöt ovat projektin tavallista logiikkaa; vienti ei lisää sovelluskohtaista aloitusprosessia piilossa.

**Kokeet:** sama synteettinen projekti rakentajassa ja viedyssä versiossa tuottaa samat tulokset; kolme ketjutilaa; rivit, tapahtumat ja omat palikat; resurssien mukanaolo; erillinen tallennusavain; puuttuva verkkoyhteys; puhelin- ja tietokoneleveydet. Vientiprojekti ei tarvitse rakentajan DOMia tai sen globaaleja funktioita. Julkaisu tehdään erillisen käyttäjäpyynnön laajuudessa.

## Yhteinen testauslinja

Noudata `AGENTS.md`:n olemassa olevia testikäytäntöjä. Moottorin muutokselle tarkoituksenmukaiset Node-testit, vaikutetun käyttöpinnan selaintestit ja vanhojen projektien yhteensopivuus. Käytä nykyisiä testiapureita; älä luo erillistä moottorikopiota testejä varten. Kohdennettu testaus ensin, pakollinen appin koko sarja ennen koodin vientiä. Dokumentaatiomuutoksessa tarkista linkit, kattavuus ja diffi; älä väitä sovellustestien ajamisesta.

Raportoi todellinen testiympäristö ja rajat. Tietokoneen Chromiumin kosketusemulointi ei ole oikea iPhone/Safari-testi. Varmuuskopiosta muistutetaan ennen käyttötietojen tallennusmuotoa muuttavaa toteutusta.
