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

Uusi appi tulee omaan kansioonsa nimellä `index.html`. Osoite on silloin `https://kasibanaani.github.io/P-iv-kartta/<kansio>/`.

## Työtavat

- Muutokset viedään suoraan päähaaraan. GitHub Pages julkaisee ne minuutin tai parin kuluessa.
- Koodi tallennetaan tänne jo ensimmäisestä versiosta. Testit ovat appin kansiossa `testit/`.
- Testit ajetaan ennen jokaista vientiä, esimerkiksi `sh paatoskartta/testit/aja.sh`. Päiväkartan testit ovat juuren kansiossa `testit/`.
- Master on tietokoneelle tehty rakennusympäristö. Sen moottori (`<script id="engine">`) ja puhelinnäkymä (`<script id="runtime">`) kopioituvat sellaisinaan jokaiseen siitä vietyyn käyttäjä-appiin. Masterin testit: `sh master/testit/aja.sh`. Toiveiden käsittely tekoälylle: `master/TOIVEET.md`.
- Taitokartan sisältö on kaikille käyttäjille yhteinen ja sijaitsee tiedoston `taitokartta/index.html` lohkossa `sisalto`. Käyttäjien omat valinnat pysyvät heidän selaimessaan.
- Repo on julkinen: tänne ei viedä henkilökohtaista tietoa eikä tekijänoikeuden alaista materiaalia.
- Appien tila, ideat ja tarkemmat työtavat ovat käyttäjän Notionissa sivulla Appipaja.
