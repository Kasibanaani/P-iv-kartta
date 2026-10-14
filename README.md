# Omat appit

Henkilökohtaiseen käyttöön tehtyjä selainappeja. Jokainen appi on yksi HTML-tiedosto, joka toimii ilman palvelinta. Tiedot tallentuvat käyttäjän oman selaimen muistiin, eivät tähän repoon.

## Rakenne

| Kansio | Appi | Osoite |
| --- | --- | --- |
| `/` (juuri) | Päiväkartta | https://kasibanaani.github.io/P-iv-kartta/ |
| `paatoskartta/` | Päätöskartta | https://kasibanaani.github.io/P-iv-kartta/paatoskartta/ |
| `projektikartta/` | Projektikartta | https://kasibanaani.github.io/P-iv-kartta/projektikartta/ |
| `taitokartta/` | Taitokartta | https://kasibanaani.github.io/P-iv-kartta/taitokartta/ |
| `oppikartta/` | Oppikartta | https://kasibanaani.github.io/P-iv-kartta/oppikartta/ |
| `viidakkovahti/` | Viidakkovahti | https://kasibanaani.github.io/P-iv-kartta/viidakkovahti/ |
| `master/` | Master (tietokoneelle) | https://kasibanaani.github.io/P-iv-kartta/master/ |
| `kytkoskartta/` | Kytköskartta (tietokoneelle) | https://kasibanaani.github.io/P-iv-kartta/kytkoskartta/ |

Uusi appi tulee omaan kansioonsa nimellä `index.html`. Osoite on silloin `https://kasibanaani.github.io/P-iv-kartta/<kansio>/`.

## Työtavat

- Muutokset viedään suoraan päähaaraan. GitHub Pages julkaisee ne minuutin tai parin kuluessa.
- Koodi tallennetaan tänne jo ensimmäisestä versiosta. Testit ovat appin kansiossa `testit/`.
- Testit ajetaan ennen jokaista vientiä, esimerkiksi `sh paatoskartta/testit/aja.sh`. Päiväkartan testit ovat juuren kansiossa `testit/`.
- Master on tietokoneelle tehty rakennusympäristö. Sen moottori (`<script id="engine">`) ja puhelinnäkymä (`<script id="runtime">`) kopioituvat sellaisinaan jokaiseen siitä vietyyn käyttäjä-appiin. Tyylit (paletti, muoto, pinta, fontti, tiheys, painikkeet) ovat lohkoissa `styledata` ja `stylefn`; viety appi saa niistä vain valitun tyylin. Masterin testit: `sh master/testit/aja.sh`. Toiveiden käsittely tekoälylle: `master/TOIVEET.md`.
- Kytköskartta on Masterista erillinen tietokoneappi: projekteissa on logiikkakanvaasi (palikat, ikkunat eli sulut, nuolet) ja näkymäkanvaasi, joka lukitaan käyttöön. Moottori on lohkossa `<script id="engine">` (objekti `KK`), käyttöliittymä lohkossa `<script id="ui">`. Tietomuoto: `projects[].b` palikat, `lg.n` logiikan esiintymät (`col` = tiivistetty ikkuna), `lg.l` nuolet, `deco` koristeviivat, `st` käyttötiedot. Versiosta 2 alkaen arvon valinta on VALITSE-palikka; vanhan JOS-palikan niin- ja muuten-arvot muunnetaan siihen automaattisesti (`migrateJos`). Tallennus kuten Masterissa: tiedot selaimen muistissa (`kytkoskartta.v1`), varmuuskopio tiedostona omalle laitteelle (yläpalkin Varmuuskopio), ja asetuksista päälle kytkettävä GitHub-tallennus käyttäjän yksityiseen repoon (sama kuin Masterilla, `Kasibanaani/master-tiedot`) tiedostoihin `kytkoskartta/<projektin id>.json` muodossa `{app:'kytkoskartta', ver, savedAt, projekti}`. GitHubiin menee vain rakenne: käyttötiedot `st`, `mem` ja kamerat `cam`, `lcam` jäävät selaimeen. Tekoäly voi muokata näitä tiedostoja; appi hakee uudemman version itsestään, kun omia tallentamattomia muutoksia ei ole, ja muuten näyttää valinnan. Avain on vain selaimessa (`kytkoskartta:gh`), ja Masterin asetukset otetaan käyttöön samassa selaimessa itsestään. Testit: `sh kytkoskartta/testit/aja.sh`.
- Taitokartan sisältö on kaikille käyttäjille yhteinen ja sijaitsee tiedoston `taitokartta/index.html` lohkossa `sisalto`. Käyttäjien omat valinnat pysyvät heidän selaimessaan.
- Repo on julkinen: tänne ei viedä henkilökohtaista tietoa eikä tekijänoikeuden alaista materiaalia.
- Appien tila, ideat ja tarkemmat työtavat ovat käyttäjän Notionissa sivulla Appipaja.

## Yhteinen visuaalinen ilme

Appipajan ilme 2.0 on uusien appien oletus, ellei käyttäjä pyydä muuta. Täsmälliset arvot: `design/appipaja-2.0.json`. [Notion-määrittely](https://app.notion.com/p/3f9977255eec812b992af928ba817112) ja [toteutusohje](https://app.notion.com/p/3f9977255eec81efb883e5a4ffdb7bfb). Vanhoihin appeihin ulkoasun uudistamista ehdotetaan erillisenä työvaiheena. Rakennusympäristön ja projektin käyttönäkymän teemavalinnat ovat erilliset, mutta vaihtoehdot samat.
