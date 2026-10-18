# Sävellyspaja: tila

**Vaihe:** V1 (luonnoslehtiö) rakennettu 18.10.2026, Emil ei ole vielä kokeillut · **Tallennusmuoto:** 1 (avain `savellys:v1`) · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/savellys/ · **Päivitetty:** 18.10.2026

Tietokoneelle tehty sävellystyökalu: projektit, MIDI-raidat, piano roll, yksinkertaiset syntikat ja MIDI-vienti. Ei musiikkiohjelma: soundi on luonnostelua varten. Keskeinen idea on tekoälyn pääsy projekteihin GitHubin kautta. Arvio ja vaiheistus: projektin tiedosto `savellystyokalu/arvio.md` (Claude-projektin jaettu kansio, ei repossa). Emil sanoi 18.10.2026 ”Anna mennä” arvion suositukselle (tietokone ensin, V1 luonnoslehtiö ja MIDI-vienti).

## Valmiina (V1)

- **Projektit:** uusi, avaa, nimeä, monista, poista. Tempo, tahtilaji, tahtimäärä, sävellaji (perussävel + 10 asteikkoa/moodia), muistio (myös pyynnöt tekoälylle).
- **Raidat:** lisää äänen mukaan, nimeä (kaksoisklikkaus), ääni, mykistys, soolo, voimakkuus, ⋯-valikossa kirkkaus, häntä, vie raita MIDInä, monista, siirrä, poista.
- **Äänet** (Web Audio -solmut, ei näytteitä): Matto (3 oskillaattoria, hidas nousu, kaiku), Pluck, Lead (yksiääninen, liukuu legatossa, vibrato pitkillä), Basso, Kello (FM), Rummut (bassari, virveli, taputus, hi-hat kiinni/auki, tomit, symbaali, reunalyönti, lehmänkello; GM-numerot).
- **Piano roll** (canvas): klikkaus lisää, veto siirtää, reunan veto pituus, kaksoisklikkaus poistaa, alueen valinta, Shift lisää valintaan, Alt ohittaa ruudukon. Näppäimet: ↑↓ transponoi (Shift oktaavi, Alt asteikon askel), ←→ siirto, Ctrl+C/X/V/D/A/Z, Delete, Q kvantisoi, L silmukka, välilyönti soitto. Asteikon ulkopuoliset rivit tummempia, perussävel korostettu, muiden raitojen nuotit haaleina. Rumpuraidalla rivit ovat soittimia. Työkalupalkissa valittujen voimakkuus, ♭ ♯, kvantisoi, monista, poista, kumoa/tee uudelleen.
- **Kokonaiskuva** raitojen yllä: kaikki raidat koko pituudelta, klikkaus siirtää näkymän.
- **Soitto:** aikataulutus edellä, aloituskohta tahtiviivaimesta, silmukka vetämällä viivaimesta, näkymä seuraa.
- **MIDI-vienti** tyyppi 1: tahtiraita (nimi, tempo, tahtilaji, sävellaji duurille/mollille) + raita per soitin omalla kanavallaan, rummut kanavalla 10, GM-soitin. Kaikki kerralla tai raita kerrallaan.
- **MIDI-tuonti** uudeksi projektiksi (tyypit 0 ja 1, raidat jaetaan kanavittain, ääni arvataan GM-soittimesta tai korkeudesta).
- **Tallennus:** selain itsestään, varmuuskopio tiedostona ja tekstinä, yksittäisen projektin tuonti tekstinä (`{app:'savellys', projekti:{…}}`).
- **GitHub-tallennus (tekoälyn pääsy):** kuten Kytköskartassa. Asetuksissa repo ja avain (Kytköskartan tai Masterin asetukset otetaan käyttöön samassa selaimessa). Tiedostot `savellys/<id>.json` muodossa `{app:'savellys', ver, savedAt, projekti}`. Tallentaa itsestään 2,5 s muutoksen jälkeen, hakee uudemman version ja uudet projektit avattaessa ja appiin palatessa. Julkiseen repoon ei suostu.
- **Ulkoasu** Appipaja 2.0, vaalea/tumma/laitteen mukaan. **Ohje**-dialogi.
- **Testit** `sh savellys/testit/aja.sh`: 20 moottoritestiä (korjaus, työkalut, soittojärjestys, MIDI edestakaisin, vieraan MIDIn luku) ja selaintestit 1440 px vaalea ja 1280 px tumma Chromiumissa.

## Projektin muoto (tekoälylle)

`{id, nimi, tempo, tahti:[osoittaja, nimittäjä], tahteja, savel:{juuri:0–11 (0 = C), asteikko}, silmukka:{on, a, b} (tahdit, b ei mukana), muistio, luotu, muutettu, raidat:[{id, nimi, aani: matto|pluck|lead|basso|kello|rummut, voim, kirk, hanta (0–1), mute, solo, nuotit:[{s: MIDI-sävel, a: alku, k: kesto, v: 1–127}]}]}`. Ajat tikkeinä, 480 tikkiä = neljäsosanuotti. Asteikot: duuri, molli, harmmolli, doori, fryyg, lyyd, mikso, pentad, pentam, krom. Moottorin voi ajaa nodella (`<script id="engine">`, `module.exports = SV`), esim. `SV.midi(projekti)` tai `SV.repair`. Uusi tekoälyn projekti: uusi id ja tiedosto `master-tiedot/savellys/<id>.json`.

## Ei tarkistettu

- **Miltä se kuulostaa.** Tekoäly ei kuule. Äänet on viritetty paperilla.
- Safari, iPad ja puhelin: testattu vain Chromiumissa. Puhelinkäyttöä ei ole suunniteltu (V1 on tietokoneelle).
- GitHub-tallennusta ei ole testattu oikeaa GitHubia vasten (koodi on Kytköskartan mallista).
- Vietyä MIDIä ei ole avattu oikeassa DAW:ssa; testi lukee sen takaisin omalla lukijalla.
- Raskas käyttö: paljon pitkiä mattoääniä yhtä aikaa voi kuormittaa.

## Seuraavaksi

- Emil kokeilee: tee 16 tahdin luonnos, vie MIDI omaan ohjelmaan, kerro mikä hiertää (nuottien muokkaus on tärkein).
- Emil kytkee GitHub-tallennuksen, niin tekoäly voi tehdä projekteja ja raitoja suoraan.
- V2-ehdotus (ei päätetty): työkalut moottoriin (harmonisointi, käännökset, variaatiot, sointujen tunnistus) ja tekoälyn kirjoittamat raidat. Rumpusyntikan omat äänet rumpuraidalle (sama selainmuisti samassa osoitteessa).
- Myöhemmin: arviointi ja tagit (V3), oman maun profiili (V4), mikrofonisyöttö.

## Avoimet kysymykset

- Mihin ohjelmaan MIDIt viedään? Vaikuttaa vientiasetuksiin.
- Lopullinen nimi (työnimi Sävellyspaja).

## Emilin kommentit

- (tyhjä)
