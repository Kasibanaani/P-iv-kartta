# Omat appit – ohje tekoälylle

@AGENTS.md

Selainappeja, yksi `index.html` per kansio, julkaisu GitHub Pagesilla. Repo on **julkinen**: ei henkilökohtaista tietoa. Appitaulukko ja tarkat työtavat: `README.md` (iso, lue vain tarvittaessa).

## Säästä kontekstia

- **Älä lue appin `index.html`:ää kokonaan** (`appiappi/index.html` on yli 500 kt). Hae ensin kartta ja lue vain tarvittava rivialue:
  - `python3 tyokalut/kartta.py appiappi` – lohkot ja osiot rivinumeroineen
  - `python3 tyokalut/kartta.py appiappi -f Kamera` – osion funktiot
  - `python3 tyokalut/kartta.py appiappi -n save` – funktion rivi nimen perusteella
  - Kartta toimii kaikille apeille, joissa on osiokommentit (`/* ---------- Nimi ---------- */`).
- Rivit voivat olla yli 1000 merkkiä pitkiä. Käytä Grepiä ja lue kapeita alueita.
- Appin nykytila ja seuraavat askeleet: `<appi>/TILA.md`. Suunnitelma ja päätökset historioineen: `appiappi/VERTAILU.md`.
- Älä tutki muita appeja, ellei tehtävä koske niitä.

## Appi-appi (`appiappi/`)

- Lohkot: `<script id="engine">` = moottori (`KK`, ei DOMia), `<script id="ui">` = käyttöliittymä. Moottorin logiikka pysyy moottorissa, koska se kopioituu viedyille apeille.
- Testit: `sh appiappi/testit/aja.sh` (Node + Playwright). Tulostaa rivin per testi ja lopuksi `KAIKKI OK` tai `VIRHEITÄ`. Testien luettelo: `appiappi/testit/README.md`.
- Tallennusmuoto: `{app:'appiappi', ver:KK.VER, savedAt, projekti:{id,name,b,lg,st,mem,…}}`. Versio `var VER` moottorin alussa, vanhojen korjaus `repair`/`repairData`.

## Projektitiedot (yksityinen repo `Kasibanaani/master-tiedot`)

- Käyttäjän projektit: `appiappi/<projektin id>.json`. Appi lukee uudet tiedostot napista ”Hae uudet projektit” ja hakee uudemman version itse, jos käyttäjällä ei ole tallentamattomia muutoksia.
- Kun teet projektin pyynnöstä: lue ensin muoto tämän repon `main`-haaran koodista (`payload`, `okProj`, `repair`), tee **uusi** tiedosto uudella id:llä ja käytä nykyistä `VER`:iä. Älä muokkaa olemassa olevaa projektia ilman erillistä pyyntöä, koska appi voi tallentaa sen päälle.
- Projektitiedot eivät koskaan tule tähän julkiseen repoon.

## Työtapa

- Ennen vientiä: aja muutetun appin testit. Vie vain pyydetyt muutokset.
- Toinen istunto voi muokata samaa appia samaan aikaan: `git pull --rebase` ennen pushia.
- Kun työvaihe valmistuu, päivitä `<appi>/TILA.md` (lyhyesti: mitä tehtiin, mitä seuraavaksi).
