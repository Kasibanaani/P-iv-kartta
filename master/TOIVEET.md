# Masterin toiveet tekoälylle

Master tallentaa projektien rakenteen ja toiveet käyttäjän **yksityiseen** GitHub-repoon (oletus `Kasibanaani/master-tiedot`). Tähän julkiseen repoon ei tallenneta projekteja.

## Tiedostot yksityisessä repossa

`projektit/<uid>.json`:

```json
{ "app": "master", "version": 3, "savedAt": "…", "projekti": { "name": "…", "screens": [], "objs": [], "cfg": {}, "seq": 0 } }
```

- Päiväkirjaukset (`days`) ja kokeiluvalinnat (`state`) eivät ole mukana. Avain ei ole koskaan tiedostossa.
- Objektityypit ja kentät: ks. `master/index.html`, lohko `<script id="engine">` (`ENG.TYPES`, `ENG.newObj`, `ENG.repair`).
- Kirjaus on objekti `t: "log"` (`unit`, `dec`, `show`: hidden/summary/chart). Merkinnät lisätään toiminnolla `{do:"log", o:<kirjauksen id>}`; palautuvan painikkeen `ract`-listassa ("Kun irrotetaan") toiminnolle voi antaa `src:"dur"`, jolloin arvo on painalluksen kesto sekunteina.
- Tyyli on `cfg.style`: `{preset, paletti, muoto, pinta, tausta, fontti, tiheys, painikkeet, liike}`; oma paletti on `paletti: "oma", oma: "#RRGGBB"`. Palikan oma sävy on `hue` (0–6: punainen, oranssi, keltainen, vihreä, turkoosi, sininen, violetti) ja korostus `look` (`"hero"` korostettu, `"quiet"` hiljainen). Sallitut arvot ja valmiit tyylit (`pre`) ovat lohkossa `<script id="styledata">`. Jos toive koskee ulkoasua, muuta näitä arvoja; uusi paletti lisätään koodiin, ja sen pitää läpäistä luettavuustesti (`master/testit/logiikka_04_tyyli.js`). Ilman `cfg.style`a projekti näkyy Perus-tyylillä ja paletti tulee vanhasta kentästä `cfg.tint`.
- Toive on objekti `t: "wish"`: `n` (otsikko), `body` (toive), `status` (`"auki"` / `"tehty"`), `reply` (tekoälyn vastaus), `about` (`""` = koko projekti, `"screen"` = ruutu `s`, muuten objektin id), `s` (ruutu). Toiveita ei viedä käyttäjä-appiin.

## Kun käyttäjä pyytää "käy masterin toiveet läpi"

1. Lue kaikki `projektit/*.json` – koko projekti, ei vain toiveita, koska toive voi koskea kokonaisuutta.
2. Käsittele toiveet, joiden `status` on `"auki"`: muokkaa projektin JSONia (uudet objektit: uusi id `o<seq+1>`, kasvata `seq`) tai, jos toive vaatii uutta toimintoa, masterin koodia tässä repossa.
3. Merkitse toive `status: "tehty"` ja kirjoita `reply`-kenttään lyhyt vastaus suomeksi. Jos toivetta ei voi tehdä, jätä `"auki"` ja kerro syy `reply`-kentässä.
4. Tarkista JSON (esim. aja projekti `ENG.repair`in läpi Nodella), päivitä `savedAt` ja pushaa.
5. Master hakee muutoksen automaattisesti, kun se avataan tai välilehti tulee näkyviin, jos käyttäjällä ei ole tallentamattomia muutoksia. Muuten se kysyy.
