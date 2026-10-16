# Toteutuspolku ja lähtökoodin löytäminen

16.10.2026. Agentin priorisointiehdotus, ei koko listan rakennuslupa. Kaikki vaiheet edellyttävät käyttäjän tehtävän laajuuden mukaista toteutuspyyntöä. [Hakemisto](../SUUNNITELMA.md).

## Työpaketit ja riippuvuudet

| Paketti | Rajaus | Riippuu | Konkreettinen valmistumiskoe |
| --- | --- | --- | --- |
| P0 | Nykytilan ja vanhojen muotojen tarkistus, lähteiden reititys | Ei uusia ominaisuuksia | Nykyiset palikkalajit ja aiemmat testit tunnistettu; vanhoja jo tehtyjä 9–10-ominaisuuksia ei suunnitella uudelleen. |
| P1a | F01 yhteinen ominaisuusviite ja D08 poistodiagnostiikka | P0 | Sama ominaisuus kaavaan/tekstiin/toimintoon; viitatun poiston peru ja jatka; virhelista ja korjaus. |
| P1b | D09/D10 ketjun arviointikonteksti ja kolme lukitustilaa | P0; viiteperusta | 02-dokumentin testitaulukko; kellon ja etenemisen ohjaus ei jäädy. |
| P2 | F02, F04, F06, F07 tietotaulukko, tapahtumat, puuttuva tieto ja tilannekuvat | P1:n ratkaisut | Yksi ketju muuttaa tapahtuman osoittamaa riviä; kaksi samanaikaista suoritusta; tallennushetken ja elävän tiedon ero. |
| P3 | F03 ja F05 rivikohtainen laskenta, kokoelman käsittely ja toistuva esitys | P2 | Alla olevat kolme erilaista koetoteutusta samoista palikoista. |
| P4 | F08–F10 ja F15 historia, aikasarjat, aika ja kooste | P2/P3 | Yksi rakenteinen aineisto listaan, kalenteriin, kuvaajaan ja kopioitavaan tekstiin; aikarajat oikein. |
| P5 | F16–F18 ja F22 omat palikat, kokoelmat ja testitila | P1–P3; P4 tarpeen mukaan | Yhteisen mallin automaattipäivitys, irrotus, oma tila, toistettava koe ja käyttökumoaminen. |
| P6 | F11–F14 ja F19 käyttöpinnan täydennykset/media | Osa voi alkaa aiemmin; toistuvat F05:n jälkeen | Valikko, kosketuskuva ja lajittelu käyttävät samoja arvoja/tapahtumia; koordinaatit zoomauksessa oikein. |
| P7 | F20–F21 ja F23 tuonti, liitännät, profiilit, yhteiskäyttö ja vienti | Paikallinen perusta ensin | Esikatseltu tuonti, ristiriitakoe, sama toiminta viedyssä apissa. Ulkoiset palvelut erillinen vaihe. |

P1b ei edellytä koko tietotaulukon valmistumista: tee arviointikonteksti ensin nykyisille arvoille ja lisää rivikonteksti samaan malliin P2:ssa. P5:n testitilan suppea turvallinen käyttötietokopio kannattaa tuoda aikaisemmin, jos se tekee uusien toimintojen kokeilemisesta turvallista. Koko järjestelmää ei tarvitse rakentaa kerralla; jokainen vaihe jättää nykyisen appin toimivaksi.

## Kolme koetoteutusta yleiskäyttöisyyden osoittamiseen

Nämä ovat synteettisiä testitapauksia, eivät oikeaan käyttäjäprojektiin oma-aloitteisesti lisättäviä esiasetuksia.

### A. Kirjausappi

Yksi kenttäryhmä ja Lisää-tapahtuma tuottavat historian rivin: kohde, määrä ja aika. Kirjaus on heti muokattavissa. Sama aineisto listassa ja päivärajauksessa. Muuta kohteen perustietoa myöhemmin: tilannekuvakenttä pysyy, elävä viite muuttuu. Puuttuva luku ei ole nolla. Osoittaa F02/F04/F06–F08.

### B. Kysymysappi

Kysymykset ja vaihtoehdot taulukossa; yksi käyttöpinta näyttää valitun kysymyksen. Vastaustapahtuma säilyttää kohteensa, vaikka seuraava kysymys ehtii näkyä. Lasku ja palaute tavallisilla kaavoilla, ikkunoilla ja Kaavan tuloksilla. Vaihda sisältöpaketti tunnisteet säilyttäen: historia ei nollaudu. Osoittaa F03/F04/F05 ja sisältö–käyttötieto-erottelun.

### C. Kohdelista määrineen

Yksi kortti nimi–määrä–miinus–plus toistetaan 100 riville. Järjestä ja suodata, paina kahden eri kortin plus-painiketta; oikeat määrät muuttuvat. Uusi rivi saa esityksen ilman uutta käsin tehtyä logiikkaa. Näytä samaa riviä kahdessa näkymässä, yhteinen määrä mutta omat esitystilat. Osoittaa F02–F05.

## Mistä nykykoodia etsitään

Käytä repon `tyokalut/kartta.py`-työkalua. Älä lue valtavaa `index.html`:ää kokonaan eikä tutki ulkopuolelle rajattuja appeja. Alla nimet ovat lähtökohtia, jotka on tarkistettava tuoreesta koodista.

| Asia | Nykyinen laajennuskohta |
| --- | --- |
| Palikkalajit ja liitännät | `K`, `ports`, `portsBase` |
| Ominaisuus ja ohjaus | `omat`, `omFind`, `omBase`, `omActive`, `setOmi`, `resetOmi` |
| Kaava ja viitteet | `kaavaToIds`, `kaavaToText`, `parseKaava`, `Ev`, `prop`, `tpl`, `deps`, `why` |
| Tapahtumat ja muutokset | `fire`, `handleLink`, `runAction`, `press`, `userSet` |
| Ketjut ja jatkaminen | `chainStart`, `chainAdvance`, `chainPoll`, `chainSignal`, `stepRun`, `chainInfo` |
| Nykyinen Listan tieto | `listRows`, Listan käyttöliittymä ja toimintojen rivinlisäys; ei sellaisenaan uusi tietotaulukko |
| Nykyiset näytöt | `chartSVG`, `calHTML`, `timelineHTML`, `listHTML`, Monitorin esittäjä |
| Oma tila ja tallennus | `newProject`, `repair`, `repairData`, `payload`, `okProj`, `save`, vienti/tuonti |
| Rakenteen kumoaminen | `snap`, `pushUndo`, `restore`, `undo`, `redo`; käyttötieto ei nykyisin palaudu |
| Nykyinen laite-/maailmaesityksen perusta | Kerros/Kamera, koordinaattimuunnokset ja käyttözoom; käytä nykyisiä eikä rinnakkaisia |

Testihakemiston `README.md` kertoo nykyiset testit. Erityisen tärkeitä olemassa olevia käsitteitä: Kaavan tulos, ominaisuusohjaus, tapahtumaketju, odotus, tallennus ja vanhat projektiesimerkit. Uuden toiminnon testin lisäksi säilytä näiden merkitykset.

## Mitä muista apeista hyödynnetään

| Lähde repossa | Tarkastettu periaate | Soveltamistapa |
| --- | --- | --- |
| `index.html` ja `PAIVAKARTTA-TILA.md` | Päiväkartan havainnon kelpoisuus ja yhdessä esiintyminen (`buildMatrix`, `computeStats`, `assoc`) | Erottele puuttuva havainto ja ei-toteutunut. Näytä havaintomäärät. Älä yleistä ennustetta ilman sen oletuksia. |
| `projektikartta/index.html` | Yhteiset tekijät, projektikohtainen tila | Malli ja kohdekohtainen käyttötieto erikseen. |
| `paatoskartta/index.html` | `evaluate`, `settle`, `dayRecord`: valinta, näkyvyys, sallittavuus ja suositus erillään | Käyttöpinnan tilat ja muutoksen perustelu. Älä kopioi sen sääntömoottoria nykyisen rinnalle. |
| `taitokartta/index.html` | `readContent`, sisältölohko ja paikalliset valinnat | Vaihdettava sisältö ja käyttäjän oma tila erikseen. Sen nimipohjainen valintojen säilytys ei korvaa uuden perustan pysyviä tunnisteita. |
| `oppikartta/index.html` | `nextCard`, `applyAnswer`, `newState`, `buildQuestion` | Kohdekohtainen historia, rajattu aktiivijoukko ja sääntöperusteinen seuraavan valinta. Nämä ovat yleisillä palikoilla tehtäviä projekteja. |
| `viidakkovahti/index.html` | `stepGame`, `fire`, `dragTo`, siemenellinen satunnaisuus ja tapahtumalista | Esiintymät, tartuntakohta, moottorin tapahtumat ja toistettavat kokeet. |
| `frisbeegolf/index.html` ja sen `README.md` | `meterFraction`, `advanceSequence`, `undoShot`, `sceneryFor` | Painallushetken talteenotto, vaiheistus, käytön kumoaminen ja vakaat määritykset. Älä tuo frisbeen lentomallia perusominaisuudeksi. |

Notionin muista appisuunnitelmista poimitut yleiset tarpeet on sisällytetty dokumentteihin: treenilokin rivit ja raakatieto; mittareiden aikasarja; ennustelokin tilannekuva ja tuntematon; ruokakirjan alias-/hakutarve; kehokartan suhteelliset kosketuskoordinaatit; sointukuuntelun media ja nosto ilman palautusta; aikavälilaskurin pilkkominen; yhteiskäytön version tarkistus; kuvitettujen kokemusten kerrokset, liike ja esitys. Nämä ovat suunnitelmia, eivät todisteita jo toimivasta koodista.

## Toteutuksen raportointi

Kerro mitä pyydetystä kokonaisuudesta valmistui, mitkä päätökset toteutettiin, mitkä tekniset ratkaisut valitsit ja mitkä kokeet oikeasti ajoit. Erota seuraava ehdotus valmiista ominaisuudesta. Päivitä `TILA.md` lyhyesti ja suunnitelmarekisterin toteutuma tarvittaessa. Älä päivitä Notionia tai yksityisiä projektitiedostoja oma-aloitteisesti tämän dokumentaation perusteella.
