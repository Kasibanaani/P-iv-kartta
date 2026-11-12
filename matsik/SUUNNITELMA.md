# Mätsik Forest: käytettävyyssuunnitelma (12.11.2026)

**Tila: ehdotus, ei rakennettu.** Emil ei ole vielä hyväksynyt tätä. Älä rakenna ennen kuin Emil sanoo "toteuta" ja nimeää askeleen. Emilin vastaukset kyselyyn ovat suunnitelmasivun tietokannassa (kokoelma `vastaukset`, dokumentit `k1`–`k7`, kentät `ok` ja `teksti`): https://claude.ai/artifact/GgmFP5UEHTVNuSGCE164Md. Lue ne ennen rakentamista ja päivitä tämän tiedoston kohta *Emilin vastaukset*.

Suunnitelma koskee vain käyttöä ja ulkoasua. Osiot, säännöt, herjojen logiikka ja tallennettu tieto pysyvät ennallaan, ellei askeleessa toisin sanota.

## Miksi

Appin tarkoitus (Emil 12.11.): hoitosuunnitelman kokonaiskuva helposti käytettävässä muodossa, päätöspuumaisesti aina esillä se mikä on Emilin omien sääntöjen mukaan tärkeää, ja tietojen päivitys selkeästi ja mukavasti puhelimella.

Mitattu 0.4:stä ruudulla 390 × 760 px (Chromium, ei oikea iPhone), kuvitteellinen eläin jolla 5 tavoitetta ja sykli:

| Asia | Nyt |
|---|---|
| Eläimen sivu, kaikki osiot kiinni | 1643 px = 2,6 ruutua |
| Huomioitavaa-kortti | 556 px, 11 samanarvoista riviä, joista 5 sykliä |
| Tavoitteet-osio auki, tavoitteet kiinni | 1373 px |
| Avattu tavoite | 966 px |
| Hoitotoimet auki | 1030 px |
| Valikko | 3464 px |
| Eläinrivi listassa | 67–86 px, 6,5 eläintä ruudulla |

Muut havainnot:
- Kentät ovat aina auki lomakkeena, myös tyhjät (62 px laatikko).
- Alapalkissa eläimen sivulla ovat Nimi ja Vie. Muistiinpanon lisäys eläimelle on Hoitotoimien pohjalla.
- Korostusväri tarkoittaa viittä asiaa: päätoiminto, valittu segmentti, tekstilinkki, poisto ja kiireellinen herja.
- `render()` piirtää koko `#app`:n uudelleen jokaisesta segmenttinapautuksesta. Se vie kohdistuksen ja sulkee näppäimistön.
- Ikkunat (`.sheet`) ovat `position:fixed; inset:0` ja sisältö alareunassa. Koodissa ei ole `visualViewport`-käsittelyä, joten iPhonella ikkunan alaosa jää todennäköisesti näppäimistön alle. Ei varmistettu oikealla laitteella (kysymys 5).

## Periaatteet

1. **Kartta ylhäällä, valittu alla.** Puhelimen vastine rinnakkaisille sarakkeille: tiivis yleiskuva pysyy näkyvissä ja vain yksi kohta on kerrallaan auki.
2. **Luku ensin, muokkaus napautuksella.** Sisältö näkyy tekstinä. Lomake aukeaa vain sille kentälle, jota muokataan.
3. **Yksi päätoiminto näkymässä.** Täytetty nappi on varattu sille. Tilat näkyvät viivoina ja pisteinä.
4. **Peukalon alla se mitä tarvitaan jatkuvasti.** Harvinaiset toiminnot otsikon tai Valikon takana.
5. Ei pitkiä painalluksia, ei emojeja, ei Tallenna-nappia, poisto vahvistuksen takana eri kohdassa (Juuren linjat).

## Askel 1 (0.5): tila ja selkeys

Ei muuta tallennusmuotoa.

1. **Nyt-kortti** korvaa Huomioitavaa-kortin (`herjaCard`). Näyttää herjalistan ensimmäisen rivin toimintonappeineen. Muut herjat ryhmitellään lajeittain pieniksi napeiksi: Käynnit (laji `sykli`), Tavoitteet (`arvio`, `toimenpide`, `jumissa`, `seur`), Puuttuu (`puuttuu`), Tarkista (`vanha`), Ohjaus (`ohjaus`, `haaste`). Napin napautus avaa ryhmän rivit kortin sisään, toinen napautus sulkee. Tavoite: kortti enintään noin 100 px, kun ryhmät ovat kiinni.
2. **Eläinrivi** (`.row`) yhdelle riville, korkeus 44 px: tilaviiva (herjan `sev`), nimi, tärkein herja katkaistuna, `+N`. Kirjainlaatikko `.mono` pois.
3. **Rajaus eläinlistan yläreunassa**: Kaikki, Käynnit, Arviot, Puuttuu, Tarkista (määrät mukana). Rajattuna lista näyttää kyseisen lajin herjat kaikilta eläimiltä peräkkäin, eläimen nimi rivin alussa, ja rivin toiminto toimii suoraan (Arvioi, Tarkistettu, Avaa). Valinta muistetaan vain istunnon ajan.
4. **Alapalkki eläimen sivulla**: vasemmalla `‹ Eläimet` (suora paluu), keskellä neljä vaihenappia `1 2 3 4`, joissa on tilapiste (pahin `sev` vaiheen osioiden herjoista, muuten ok, tyhjä jos vaiheessa ei ole sisältöä), oikealla täytetty `+` (avaa muistiinpanon, jossa eläimen nimi valmiina, nykyinen `openNew`). Vaihenappi vierittää vaiheen otsikkoon (`.grp.vaihe`). Nimi-ikkuna aukeaa otsikon `h1` napautuksesta. Vie-nappi pois eläimen sivulta, vientipiste näkyy `‹ Eläimet` -napissa.
5. **Nappi-ilmeet**: `.btn.pri` vain yksi per näkymä tai kortti. `.btn.link` ja `+ Tavoite`, `Valitse` ym. tekstilinkit `var(--fg)`-värillä alleviivattuna, ei korostusvärillä. Poista-linkit `var(--muted)`, vahvistusnappi säilyy.
6. **Valikko alasivuiksi**: etusivulla viisi riviä (Tiedot, Ulkoasu, Luettelot, Säännöt ja välit, Arkisto), kukin avaa oman näkymänsä ja alapalkissa `‹ Valikko`. Sisältö siirretään sellaisenaan.
7. Kuvituskaista pois eläimen sivulta. Otsikot 17 px lihavoituna.

Testit: Nyt-kortin korkeus alle 160 px 11 herjalla, ryhmän avaus, rajaus ja toiminto rajatusta listasta, vaihenappi vierittää, plus avaa muistiinpanon nimellä, Valikon alasivut, ei vaakavieritystä 390 ja 320.

## Askel 2 (0.6): lukutila ja muokkausarkki

Ei muuta tallennusmuotoa. Iso askel: tee omissa commiteissa kohdat 1–2 ja 3–5.

1. **Näppäimistön tunnistus** yhteen paikkaan: `visualViewport`-kuuntelija (`resize`, `scroll`) asettaa `document.documentElement`iin muuttujat `--vvh` (näkyvä korkeus) ja `--kb` (näppäimistön korkeus = `innerHeight - vv.height - vv.offsetTop`, vähintään 0) ja luokan `kb`, kun `--kb` > 120 px. `.sheet` käyttää `height:var(--vvh)` ja `top:vv.offsetTop`, `.pn` `max-height:calc(var(--vvh) - 8px)`. Luokalla `kb` alapalkki `#bar` on piilossa. Varatapa ilman `visualViewport`ia: nykyinen käytös.
2. **Muokkausarkki** (`sheet.k==='edit'`): otsikko "Osio · Kenttä" ja "2 / 5", yksi kenttä (textarea, input, date tai segmentit), alarivi `‹ Edellinen`, `Seuraava ›`, `Valmis`. Edellinen ja Seuraava vaihtavat kentän sisällön ilman että arkki tai näppäimistö sulkeutuu (sama textarea-elementti säilyy, vain arvo ja `data-b` vaihtuvat; kohdistus pysyy). Tallennus `setPath`illa kuten nyt. Valmis sulkee ja palauttaa `window.scrollY`n arvoon ennen avausta.
3. **Lukutila osioihin**: `vAsiakas` näyttää osion kentät riveinä (nimi 84 px harmaana, arvo enintään 2 riviä, napautus avaa muokkausarkin siihen kenttään). Tyhjät kentät ja tyhjät osiot kootaan vaiheen loppuun lisäysnapeiksi (`+ Koulu`), jotka avaavat arkin. `<details>`-haitarit poistuvat tavallisista osioista; erikoisosiot (tavoitteet, toimet, seuranta, mittarit, haasteet) säilyvät avattavina tähän askeleeseen asti.
4. **Tarkistettu, pitää paikkansa** myös osion riville, kun osiolla on `vanha`-herja.
5. **Kohdennettu päivitys**: segmentti- ja monivalintanapautus päivittää vain oman `.seg`insä `aria-pressed`-tilat ja `refreshHerjat()`, ei koko `render()`iä, silloin kun rakenne ei muutu.

Testit: arkin avaus kentästä, Seuraava säilyttää kohdistuksen (`document.activeElement` sama elementti), Valmis palauttaa vierityksen, tyhjät nappeina, simuloitu `visualViewport`-muutos asettaa `--kb`:n ja piilottaa palkin. Kirjaa TILA.md:hen: oikean iPhonen kokeilu on Emilin tehtävä ennen askelta 3.

## Askel 3 (0.7): kartat sarakkeiden tilalle

Ei muuta tallennusmuotoa.

1. **Tavoitekartta**: ruudukko `54px repeat(3,1fr)`, rivit tasot 1–3, sarakkeet Lapsi, Vanhemmat, Työntekijä. Ruudussa ensimmäisen tavoitteen alku (enintään 3 riviä, 11–12 px), tilaviiva (pahin tila) ja määrä jos useita; tyhjä ruutu on katkoviivainen `+`. Valittu ruutu (`openCell`) näyttää kartan alla otsikon "2 Hoitosuhde · Lapsi", ruudun tavoitteet kortteina (nimi, tila, syy, seurannan Ei-kohdat, napit Arvioi, Muokkaa, Seuranta) ja `+ Tavoite`. Tasolla 2 otsikkorivillä periaatteet. Hoidon syyt yhtenä nappirivinä kartan yläpuolella. Tavoitteen kentät muokataan askeleen 2 arkissa.
2. **Syklinauha**: kuusi laatikkoa yhdellä rivillä (nimi ja tilapisteet), nykyinen korostettu. Valitun laatikon sisältö alla rivinä per valinta: tila ja `+ Sovi` (avaa muistiinpanon "Nimi sisällön-nimi "). Alla Tulossa-lista kahden viikon horisontista. Valintojen muokkaus nykyisellä `slotedit`-näkymällä linkistä "Muuta valintoja".
3. **Leveä ruutu (≥ 900 px)**: `.app` leveys 1200 px, vaiheet 1–4 neljänä sarakkeena, Nyt-kortti koko leveydellä yllä. Alapalkin vaihenapit piiloon.

## Askel 4 (0.8): omat säännöt

Lisää `asetukset.saannot` (valinnainen, vanha data saa oletuksen). Muistuta varmuuskopiosta.

1. **Säännöt-sivu** Valikossa: rivi per herjalaji, järjestys Ylös/Alas-napeilla (kuten `listCard`), kiireellisyys (Kiireellinen, Tavallinen, Pois). `herjat()` lajittelee `saannot`-järjestyksen mukaan. Oletusjärjestys: taso 1 tavoitteen asiat, viikon sisällä päättyvän laatikon sykli, taso 2, muu sykli, taso 3, ohjaus ja haaste, puuttuu vaihejärjestyksessä, vanha.
2. **Portaat** (jos Emil hyväksyy, kysymys 3): `puuttuu`-herjoista näytetään vain varhaisimman vaiheen puutteet.
3. **Selite**: Nyt-kortin pääasian alla pienellä "Miksi ensin: taso 1, arvio 4 kk myöhässä".
4. **Muistiosta mittaukseen** (jos Emil hyväksyy, kysymys 6): rivi, jossa on eläimen nimi, mittarin tai Lääkeseurannan mitan tunnistussana ja luku, kirjaa arvon rivin päivälle. Kirjaus on johdettu (lasketaan muistiosta kuten käynnit), ei kopioida dataan.

## Myöhemmin

Tason 2 tavoitteen linkki, arviointikaavion muokkaus, muut muokattavat luettelot, esittelynäkymä demoihin.

## Päätetty ilman kysymistä (Emil voi perua)

- Puhelin on mittatikku, koneen sarakkeet vasta askeleessa 3.
- Teemat ja kuvitus säilyvät, kuvitus vain listassa.
- Eläimen sivun vasen alanappi on suora paluu; osionvaihto listan kautta tai nappia pyyhkäisemällä.
- Poisto muokkausarkin lopussa tavallisena nappina, vahvistus eri kohdassa.

## Emilin vastaukset

Ei vielä luettu (12.11.2026).
