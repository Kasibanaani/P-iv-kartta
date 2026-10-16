# Aika, media, tietolähteet ja yhteiskäyttö

F10 ja F19–F21. Pitkän aikavälin toteutusehdotuksia, ei lupa kytkeä palveluja. [Hakemisto](../SUUNNITELMA.md), [tietoperusta](01-tieto-ja-tapahtumat.md).

## Aika ja jaksot (F10)

**Nykyistä:** Tänään, Päivämäärän osa, Ajastin, Odota kunnes, Muutos ajassa ja Sekuntikello. Täydennä niiden yhteistä aikamallia, älä lisää rinnakkaista peli- tai päiväkirjakelloa.

**Tarpeet:** ajankohta aikavyöhykkeineen, kulunut kesto, paikallinen kalenteripäivä, aikavälin leikkaus/pilkkominen, toistuva jakso ankkuroidusta alusta sekä viimeisin tapahtuma. Rakentaja valitsee alun, lopun ja rajat palikoista tai taulukosta. Tulokset ovat tavallisia arvoja/rivejä, joita voi käyttää kaavassa, ikkunoissa ja Kaavan tuloksessa.

**Suunnitteluratkaisut:** ajankohdat tallennetaan aikaleimana, paikallinen päivämäärä päivämääränä ja kesto sekunteina. Näyttöyksikkö ei muuta laskentayksikköä. Kalenteripäivän lisääminen ei tarkoita aina 24 tunnin lisäämistä. Aikavyöhyke on projektin/lähteen nimenomainen asetus. Aikavälin osat muodostetaan kaikissa sääntörajoissa, lajitellaan ja luokitellaan nykyisillä ehdoilla; palkat, hinnat tai pelipisteet eivät ole perusoperaation koodissa.

**Yhdistelmät:** jäähyaika = viimeinen tapahtuma + kesto, voimassaolo = alku/loppu ja vertailuikkuna, vuorottelu = ankkuroidun jakson numero + ehto, seuraava toisto = edellisen toteuman päivä + valittu kalenteriväli. Viikkovuosi huomioidaan vuoden vaihteessa; pelkkä viikkonumeron parillisuus ei ole yleinen joka toisen viikon ankkuri.

**Valmis:** keskiyö, vuodenvaihde, puuttuva loppu, nollakesto, jakson raja ja kesä-/talviajan vaihto tunnetuilla synteettisillä ajoilla. Vuoro-, varaus- ja harjoitusjakso käyttävät samaa perustaa. Todellinen ajankäsittelykirjasto/selainratkaisu valitaan ja dokumentoidaan vasta toteutuksessa tuoreen ympäristön mukaan.

**Suljettu appi:** kuluneen ajan laskeminen avattaessa ei ole sama kuin vaikutuksen suorittaminen tai ilmoituksen lähettäminen suljettuna. Nykyinen Sekuntikello voi laskea kuluneen ajan aikaleimoista; taustatyöt tarvitsevat erillisen teknisen vaiheen. Älä lupaa ilmoituksia nykyisen avoimen sivun ajastimilla.

## Media ja piirtäminen (F19)

**Nykyistä:** Kuva, kuvasarja, Reitti ja efektit. Seuraavat yleiset laajennukset ovat ääni-/videotoisto, tallentuva media sekä piirtojälki.

**Rakentaja:** lisää mediaelementti, valitse lähde, kytke käynnistä/pysäytä ja lue paikka/kesto/tila. Valmis/virhe ovat tapahtumia. Nauhoitus tai kuvaus palauttaa mediaresurssin viitteen tietoon; esitys ja tiedoston tuottaminen ovat eri tehtäviä. Laitelupien pyyntö tehdään näkyvästä käyttäjätoiminnosta, ja luvan puuttuminen on käsiteltävä tila.

**Piirtäminen:** tallenna paikalliset/suhteelliset pisteet, aikaleimat ja saatavilla oleva paine/kallistus. Sama jälki voidaan esittää kuvana, muuntaa reitiksi tai käyttää käyrän syötteenä. Piirtämisen tahdin säilyttäminen on erillinen vaihtoehto tasavauhtisesta reitistä. Äänen sävelet/soinnut voivat myöhemmin olla moduuleja yleisen ääniperustan päällä.

**Tallennus:** resurssi id:n ja metatietojen kautta, ei automaattisesti suurta base64-tiedostoa jokaiseen rivin/mallin/ketjun snapshotiin. Suunnittele vientipaketin resurssit ja offline-käyttö ennen suurten tallenteiden lisäämistä. Projektin kirjoitus ei lähetä käyttäjän mediaa julkiseen repoon.

**Valmis:** saman tiedoston monta esitystä; toiston alku/loppu/virhe; puuttuva lupa tai resurssi; kuvan koon muuttuminen ei siirrä piirroksen aluetta; resurssit säilyvät viennissä; kielletty automaattitoisto tai laitteen kyvyn puute näkyy ymmärrettävästi. Äänen tuntuma ja laitetuki tarkistetaan myös varsinaisessa kohdelaitteessa ennen laiteväitettä.

## Yhteinen tietolähde ja tuonti (F20)

**Yhteinen sopimus:** lähde antaa tyypitetyn arvon/rivijoukon, tilan (ei haettu/haetaan/valmis/virhe), päivitysajan ja virheen. Manuaalinen taulukko, tiedosto ja verkkolähde näyttävät laskennan kannalta samalta. Vanha valmis data voidaan näyttää merkinnällä vanhentunut, mutta virhe ei muutu uudeksi tyhjäksi aineistoksi.

**Hakeminen:** erillinen Toiminto käynnistää työn, valmis/virhe jatkaa ketjua. Piirto tai kaavan arviointi ei tee verkkopyyntöä. Lähetyksellä on oma komento, kuittaus ja virhe. Tapahtuman tunniste auttaa tunnistamaan saman pyynnön uudelleenyrityksen. Ulkoisia vaikutuksia ei luvata yleisesti peruttaviksi.

**Vaiheistus:** liimattu taulukko/CSV → JSON-sisältöpaketti → avoin verkkolähde → tunnistautuva liitäntä → lähetys. CSV käsittelee BOMin, lainatut ja moniriviset kentät, erottimet, desimaalipilkun sekä päivämäärämuodot. Näytä sarakkeiden kohdistus sekä lisäysten, muutosten, virheiden ja puuttuvien viitteiden esikatselu. Yhdistämisavain valitaan; näkyvä nimi ei ole piilotettu yleinen tunniste.

**Tuontilajit:** projektirakenne, sisältöpaketti ja käyttötieto ovat erilliset valinnat. Sisältöpaketti voi vaihtaa kysymykset, ohjeet tai kielen muuttamatta logiikkaa. Vaihto ei ylikirjoita henkilökohtaista etenemistä tunnisteiden säilyessä. JSON-/tekstimuutospaketti sisältää lähtöversion ja rajatut operaatiot; tarkistus näyttää lisätyt/muutetut/poistetut kohteet ennen soveltamista. Tekoälyn tuottama paketti ei ohita validointia eikä kirjoita käyttäjän puolesta suoraan oikeaan tilaan.

**Notion ja tekoäly:** myöhemmät sovittimet käyttävät samaa lähdesopimusta. Palvelun avaimia ei sisällytetä julkiseen HTML:ään, projektiin, lokiin tai snapshotiin. Palvelin-/valtuutusratkaisu ja kulut ratkaistaan konkreettisen integraation yhteydessä käyttäjän pyynnön laajuudessa. Puheentunnistus on tekstisyötteen sovitin; tuloksen hyväksyminen ja jatkotoimet pysyvät näkyvässä logiikassa.

**Muut siirrot:** kalenteritiedosto, linkkiparametrit/QR ja rajattu tekstituonti ovat samaa tarkistettua dataa käyttäviä sovittimia. Linkki ei saa suorittaa mielivaltaista koodia tai ohittaa sallittuja muutoskohteita. Ilmoitukset ja taustahaku eivät sisälly paikallisen tiedostotuonnin vaiheeseen.

**Valmis:** pilkku/puolipiste/sarkain, monirivisyys, samat tunnisteet kahdesti, väärä saraketyyppi, peruttu esikatselu, tietojen versioristiriita, verkkovirhe/viive ja kaksi vastakkaisessa järjestyksessä valmistuvaa hakua. Viimeisin tarkoitettu pyyntö ei saa ylikirjoittua vanhalla vastauksella.

## Profiilit ja jaettu tila (F21)

**Erottelu:** yhteinen määrittely/sisältö, paikallinen profiili ja profiilin käyttötieto ensin. Profiili ei ole vahvistettu käyttäjätili. Näkymän piilotus ei ole käyttöoikeus. Samalla laitteella profiilin vaihtaminen säilyttää toisen valinnat ja historian erillään kuten Oppikartassa.

**Myöhempi yhteiskäyttö:** jokainen muutos tunnistaa kohteen, tapahtuman ja lähtöversion. Palvelu tarkistaa ristiriidan; sama tapahtuma ei toistu katkon jälkeisessä lähetyksessä. Näytä ei yhteyttä, lähettämättä, lähetetään, tallennettu ja ristiriita totuudenmukaisesti. Käyttäjäroolit ja salattu/piilotettu tieto tarvitsevat oikean palvelinpuolen oikeusmallin; niitä ei toteuteta vain valikkoehdoilla.

Nykyinen GitHub-projektitallennus ei yksin ole yleinen reaaliaikainen yhteiskäyttöpalvelu. Siirtopelin suunnitelman optimistinen version tarkistus on hyödyllinen periaate, ei todistettu yleisratkaisu. Taustapalvelun valinta on erillinen toteutusvaihe.

**Valmis:** kaksi paikallista profiilia, kaksi laitteen muutosta samaan lähtöversioon, lähetys kahdesti, verkon katko ja paluu, oikeudeton muutos sekä tarkoitettu näkyvien/piilotettujen tietojen erottelu. Ensin synteettinen aineisto ja valepalvelin, sitten valtuutetun todellisen palvelun rajattu koe.
