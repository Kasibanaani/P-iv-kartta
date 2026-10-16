# Omat appit – ohje tekoälylle

Emil kehittää tekoälyn kanssa omia selainappeja. Hän ei koodaa itse: tekoäly suunnittelee, rakentaa, testaa ja julkaisee. Koodi, tila ja ohjeet ovat tässä repossa; henkilökohtaiset tiedot ja ideat yksityisessä repossa `Kasibanaani/master-tiedot`. Notion on vain arkisto: älä lue tai päivitä sitä, ellei Emil erikseen pyydä.

## Aloita näin (joka kerta, pyytämättä)

1. Selvitä, mitä appia työ koskee (taulukko: `README.md`, kohta Rakenne).
2. Lue appin `TILA.md` (Päiväkartalla `PAIVAKARTTA-TILA.md` juuressa). **Jos sitä ei ole, luo se** samalla pohjalla kuin muissa apeissa.
3. Lue vain tarvittava koodi kartan avulla (alla). Älä tutki muita appeja, ellei tehtävä koske niitä.
4. Uusi appi-idea tai idean käsittely: `IDEAT.md` repossa `master-tiedot`.

## Lopeta näin (joka työvaiheen jälkeen, pyytämättä)

- Päivitä appin `TILA.md`: päivämäärä, mitä tehtiin, mitä ei tarkistettu, seuraava askel, avoimet kysymykset. Pidä se lyhyenä: korvaa vanhentunut, älä kasaa historiaa. Älä muuta osiota *Emilin kommentit*.
- Uusi Emilin idea → `master-tiedot/IDEAT.md`. Tekoälyn omat ehdotukset merkitään ehdotuksiksi.
- Kirjaa vain se, mikä on totta: ”ei rakennettu” ja ”ei tarkistettu” sanotaan suoraan.

## Säästä kontekstia

- **Älä lue appin `index.html`:ää kokonaan** (isoimmat yli 500 kt, rivit voivat olla yli 1000 merkkiä):
  - `python3 tyokalut/kartta.py appiappi` – lohkot ja osiot rivinumeroineen
  - `python3 tyokalut/kartta.py appiappi -f Kamera` – osion funktiot
  - `python3 tyokalut/kartta.py appiappi -n save` – funktion rivi nimen perusteella
- `README.md` on iso: lue vain tarvittava kohta.

## Keskustelu

- Suomeksi, ytimekkäästi, mutta vastaa jokaiseen kysymykseen. Emil sanelee, joten viestit ovat pitkiä ja polveilevia.
- Arkikieli: kerro, mitä Emil näkee ja tekee puhelimella.
- ”Pohdi”, ”älä vielä toteuta”, ”mitä mieltä olet” = vain keskustelu. ”Toteuta” = rakenna, testaa ja vie. Epäselvässä tilanteessa älä rakenna: kerro, mitä tekisit, ja kirjaa kysymys `TILA.md`:hen.
- Sano oma näkemys ja huonot puolet.

## Rinnakkaiset keskustelut (roolit)

Emil voi pitää useita keskusteluja auki yhtä aikaa. Oletus ei muutu: ilman roolisanaa olet **rakentaja**. Yksi sana Emilin ensimmäisessä viestissä vaihtaa roolin:

- **rakentaja**: muokkaa appin koodia (`index.html`), ajaa testit, vie päähaaraan. Vain yksi rakentaja per appi kerrallaan.
- **suunnittelija**: kirjoittaa vain suunnitelma- ja ohjetiedostoja (`.md`). Ei koske `index.html`:ään eikä testeihin. Kirjaa päätökset ja avoimet kysymykset suunnitelmaan.
- **testaaja**: kirjoittaa uusia testejä (`testit/`) ja etsii bugeja lukemalla ja ajamalla. Ei korjaa appia itse, vaan raportoi löydökset Emilille (ne kirjataan suunnitelmaan tai `TILA.md`:n *Löydökset*-alaotsikkoon).
- **sisältö**: työskentelee vain `master-tiedot`-repossa (projektit, toiveet, idean kirjaus). Ei koske tähän repoon.

Rakentajan tarkistus ennen koodin muokkausta, pyytämättä:

1. `git fetch origin main` ja `git log origin/main --since="3 hours ago" -- <appin kansio>`.
2. Jos kansioon on tullut commiteja tuoreeltaan, toinen rakentaja on todennäköisesti kesken. Pysähdy ja kysy Emililtä: odotetaanko, vaihdetaanko rooli (esim. suunnittelija) vai jatketaanko silti.
3. Muuten jatka. Tee `git pull --rebase` ennen jokaista pushia.

Muut säännöt:

- Muu kuin rakentaja ei päivitä appin `TILA.md`:n päätilaa, vain oman alaotsikkonsa (*Suunnitelmat*, *Löydökset*), jottei tule konfliktia.
- Jos tehtävä ei sovi rooliin (esim. suunnittelijalta pyydetään koodia), sano se ja ehdota, että Emil antaa sen rakentajalle.
- Sanat ovat sopimus, ei lukko: epäselvässä tilanteessa kysy.

## Appien tyyli

- Puhelin ensin (iPhone, Safari, kotinäytön kirjanmerkki). Poikkeukset: Master, Kytköskartta ja Appi-appi rakennetaan tietokoneella.
- Napautettavat valinnat; käyttönäkymä yksinkertainen, syvempi tieto omissa välilehdissään. Ei suosituimmuusjärjestystä: Emilin oma järjestys.
- Sisältö on Emilin omaa: mitään ei täytetä valmiiksi. Isompi sisältö tuodaan tekstinä tekoälyn avulla.
- Laajennus ei saa monimutkaistaa peruskäyttöä.
- **Yhteinen ilme (Appipaja 2.0)** on uusien appien oletus; täsmälliset arvot `design/appipaja-2.0.json`. Peittävät pinnat, järjestelmäfontti, pehmeät kulmat, hillityt reunat ja varjot. Sama teemarekisteri ja vaalea/tumma/laitteen mukaan sekä rakennusympäristölle että projektin näkymälle, valinnat erikseen. Tekstin kontrasti vähintään 4,5:1. Vanhan appin ulkoasun uudistus ehdotetaan erillisenä vaiheena.

## Tekniikka

- Yksi `index.html` per kansio, tyylit ja koodi samassa, ei ulkoisia kirjastoja. Julkaisu GitHub Pagesilla: `https://kasibanaani.github.io/P-iv-kartta/<kansio>/`.
- Tiedot selaimen muistissa versioidulla avaimella. Vanha tallennusmuoto pitää aina osata lukea. Vienti ja tuonti tiedostona, varalla tekstinä.
- Repo on **julkinen**: ei henkilökohtaista tietoa, ei tekijänoikeuden alaista materiaalia, ei GitHub-avaimia.
- Appit ovat Emilin omaan käyttöön, ei tunnistettavia potilastietoja. Jos appi on tarkoitettu muille (esim. potilaille), ota ennen rakentamista esiin työnantajan linja ja lääkinnällisten laitteiden sääntely.

## Testaus ja vienti

- Aja muutetun appin testit ennen vientiä: `sh <kansio>/testit/aja.sh` (Päiväkartta: `sh testit/aja.sh`). Uusi toiminto saa oman testinsä. Puhelinapit leveyksillä 390 ja 320 px, tietokoneapit 1440 ja 1280 px.
- Vie suoraan päähaaraan (Emilin päätös 11.10.2026). Toinen istunto voi muokata samaa repoa: `git pull --rebase` ennen pushia. Vie vain pyydetyt muutokset, älä muuta muita appeja.
- Kerro aina: testit ajettiin tietokoneen selaimessa, ei oikealla iPhonella, ja mitä jäi siksi varmistamatta. Julkaisu näkyy minuutin parin päästä; appi kannattaa sulkea kokonaan ja avata uudelleen.
- Muistuta varmuuskopiosta ennen muutosta, joka koskee tallennusmuotoa.

## Appi-appi (`appiappi/`)

- Lue ensin `appiappi/MISSIO.md`: se kertoo appin tarkoituksen ja kehitysehdotusten arviointiperusteet. Erota rakentajan suora, helposti muutettava työskentely valmiin käyttöpinnan vakaudesta. Laaja palikkavalikoima on sallittu; vähennä opittavia poikkeuksia, älä hyödyllistä ilmaisuvoimaa vain palikoiden määrän vuoksi.
- Työskentelyn laajuus: rajattu korjaus/toteutus käyttää tehtävän tarvitsemia manuaali- ja suunnitelmaosia. Käyttäjän pyytämä kokonaiskatselmus tai uuden toimintojen ryhmän suunnittelu edellyttää koko ajantasaisen manuaalin sekä mission ja keskeisten päätösten lukemista. Jos manuaalia ei vielä ole, kokoa vastaava kattava nykytilakuva; suunnitelma ei todista toteutumaa. Manuaalin tuleva tehtävänanto on `appiappi/suunnitelmat/08-manuaalin-tehtavananto.md`; se ei ole vielä manuaali eikä käsky kirjoittaa sitä oma-aloitteisesti.
- Ennen Appi-appin suunnittelu- tai toteutustyötä lue `appiappi/TILA.md`, `appiappi/SUUNNITELMA.md` ja `appiappi/suunnitelmat/00-periaatteet.md`, sitten vain kyseisen työn tarkka suunnitelma. Hakemisto erottaa käyttäjän päätökset, toteuttamattomat ehdotukset ja jo olemassa olevat ominaisuudet. Dokumentit ovat itsenäinen ohje: aiempaa keskustelua tai Notionia ei tarvitse muistaa. Suunnitelman olemassaolo ei yksin ole lupa rakentaa kaikkia vaiheita. Uusimmat 16.10.2026 ketju- ja viitepäätökset ovat hakemiston kautta löytyvissä suunnitelmissa; `VERTAILU.md` säilyy vanhempien vaiheiden historiana.
- `<script id="engine">` = moottori (`KK`, ei DOMia; liike-, törmäys- ja kameralogiikka kuuluvat tänne, koska moottori kopioituu viedyille apeille), `<script id="ui">` = käyttöliittymä.
- Testit: `sh appiappi/testit/aja.sh`, luettelo `appiappi/testit/README.md`. Suunnitelma ja päätökset: `appiappi/VERTAILU.md`.
- Tallennusmuoto: `{app:'appiappi', ver:KK.VER, savedAt, projekti:{id,name,b,lg,st,mem,…}}`; versio `var VER` moottorin alussa, vanhojen korjaus `repair`/`repairData`.

## Projektit ja toiveet (`master-tiedot`)

- Appi-appin projektit: `master-tiedot/appiappi/<id>.json`. Appi lukee uudet napista ”Hae uudet projektit” ja hakee uudemman version itse, jos käyttäjällä ei ole tallentamattomia muutoksia. Tee pyynnöstä **uusi** tiedosto uudella id:llä nykyisellä `VER`:llä (muoto koodista: `payload`, `okProj`, `repair`). Älä muokkaa olemassa olevaa projektia ilman erillistä pyyntöä.
- Appi-appin muisti- ja viestilaput: `master-tiedot/appiappi/laput/laput.json`. ”Lue viestilaput”: lue avoimet viestilaput (`laji:"viesti"` ilman `vastaus`-kenttää), vastaa kirjoittamalla vain `vastaus` ja `vastattu`, pushaa ja vastaa myös keskustelussa. Muoto ja työtapa: `appiappi/suunnitelmat/10-laput.md`. Lapun toive ei ole toteutuslupa.
- Masterin projektit `master-tiedot/projektit/<tunniste>.json`. ”Käy masterin toiveet läpi”: lue `master/TOIVEET.md` ja projektit kokonaan, käsittele avoimet toiveet (`t:"wish"`), merkitse tehdyksi ja kirjoita `reply` suomeksi, pushaa. Raportoi jokaisesta toiveesta.
- Projektitiedot eivät koskaan tule tähän julkiseen repoon.


