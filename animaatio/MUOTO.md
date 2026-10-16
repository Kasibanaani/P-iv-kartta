# Animappin tiedostomuodot

Tämä kuvaa Animappin (kansio `animaatio/`) viennit niin, että muut apit, ensisijaisesti Appi-appi, voivat lukea ne. Muoto on versioitu: `ver` kasvaa vain, kun vanha lukija ei enää ymmärtäisi tiedostoa oikein. Lukijan pitää ohittaa tuntemattomat kentät. Animappi lukee aina vanhemmat versiot.

Viennit:

| Tiedosto | Sisältö | Käyttö |
| --- | --- | --- |
| `<nimi>.animappi.json` | animaatiotiedosto: kuvat, osat, hierarkia, liike jokaisessa ruudussa | työn tallennus ja tuonti takaisin, Appi-appin tuleva animaatiopalikka |
| `<nimi>-sprite.png` + `<nimi>-sprite.json` | kaikki ruudut yhdessä läpinäkyvässä kuvassa + ruututiedot | pelit, Appi-appin Kuva-palikka (ehdotus alla) |

## Yhteiset sopimukset

- **24 ruutua sekunnissa**, aina (`fps: 24`). Ruutu `f` näkyy hetkellä `f / 24` s.
- **Koordinaatit** lavan pikseleinä, origo vasemmassa yläkulmassa, **y kasvaa alaspäin** (kuten Appi-appissa ja canvasissa).
- **Kulma** asteina **myötäpäivään** (kuten Appi-appin ominaisuus `kulma`/kierto). Kulma on jatkuva: kaksi kierrosta on 720, ei 0. Näin välitys ruutujen välillä ei hyppää.
- **Koko** kertoimena: 1 = kuvan oma pikselikoko.
- Luvut on pyöristetty: paikat ja kulmat 2 desimaaliin, koko 4 desimaaliin.

## Animaatiotiedosto (`muoto: "animappi"`, `ver: 1`)

```json
{
  "muoto": "animappi", "ver": 1, "nimi": "Ukko",
  "fps": 24, "ruutuja": 48, "kesto": 2, "silmukka": true,
  "lava": { "w": 512, "h": 512, "tausta": "valkoinen" },
  "kuvat": {
    "k1": { "laji": "svg", "w": 120, "h": 200, "nimi": "vartalo", "data": "<svg …>…</svg>" },
    "k2": { "laji": "png", "w": 30,  "h": 120, "nimi": "käsi",    "data": "data:image/png;base64,…" }
  },
  "osat": [
    { "id": "o1", "nimi": "Vartalo", "kuva": "k1", "vanhempi": null, "kp": [60, 100], "z": 0,
      "liikkuu": "vapaa", "tas": 30, "piilo": false, "perus": { "x": 256, "y": 300, "kulma": 0, "koko": 1 } },
    { "id": "o2", "nimi": "Käsi", "kuva": "k2", "vanhempi": "o1", "kp": [15, 10], "z": 1,
      "liikkuu": "nivel", "tas": 30, "piilo": false, "perus": { "x": 100, "y": 30, "kulma": 0, "koko": 1 } }
  ],
  "liike":    { "o1": { "x": [256, …], "y": [300, …], "kulma": [0, …], "koko": [1, …] }, "o2": { … } },
  "laatikot": { "o1": { "x": [196, …], "y": [200, …], "w": [120, …], "h": [200, …], "kulma": [0, …] }, "o2": { … } },
  "raaka":    { "o1": [[256, 300, 0, 1], null, …] },
  "tallennettu": "2026-10-16T12:00:00.000Z"
}
```

### Kentät

| Kenttä | Merkitys |
| --- | --- |
| `ruutuja` | ruutujen määrä. Jokaisessa `liike`- ja `laatikot`-listassa on täsmälleen näin monta arvoa. |
| `kesto` | sekunteina (`ruutuja / 24`), vain tiedoksi. |
| `silmukka` | toistetaanko alusta lopun jälkeen. |
| `lava` | lavan koko pikseleinä. `tausta` (`valkoinen`, `shakki`, `tumma`) koskee vain Animappin näkymää; viennit ovat läpinäkyviä. |
| `kuvat[id]` | `laji` = `svg`, `png`, `jpeg` tai `webp`; `w`, `h` = kuvan koko pikseleinä; `data` = SVG-teksti (laji `svg`) tai `data:image/…`-osoite. Isot bittikarttakuvat on pienennetty enintään 2048 px:iin. |
| `osat[]` | piirtojärjestyksessä: ensimmäinen takana. `z` = sama järjestys numerona (0 = takimmainen). |
| `osat[].vanhempi` | osan `id` tai `null` (osa on suoraan lavalla). Ei kehiä. |
| `osat[].kp` | **kääntöpiste** kuvan omina pikseleinä (vasen yläkulma = 0, 0). Osa kääntyy ja skaalautuu tämän pisteen ympäri. |
| `osat[].liikkuu` | Animappin ohjaustapa: `vapaa` tai `nivel` (kääntyy vain kääntöpisteensä ympäri). Lukijalle vain tiedoksi. |
| `osat[].tas` | tasoitus 0–100, joka on jo laskettu `liike`- ja `laatikot`-arvoihin. |
| `osat[].piilo` | piilotettu osa ei näy viennissä. Lukijan kannattaa jättää se piirtämättä. |
| `osat[].perus` | asento, kun osaa ei ole nauhoitettu (`x`, `y`, `kulma`, `koko` kuten `liike`). |
| `liike[osa]` | osan **oma** asento jokaisessa ruudussa vanhemman koordinaatistossa, täytettynä ja tasoitettuna (ks. alla). |
| `laatikot[osa]` | sama asento **lavalla** Appi-appin Kuva-palikan muodossa (ks. alla). Hierarkia ja kääntöpiste on jo laskettu mukaan. |
| `raaka[osa]` | Animappin oma nauhoitus: ruuduittain `[x, y, kulma, koko]` tai `null` (ruutua ei nauhoitettu). Vain nauhoitetut osat. Tällä Animappi jatkaa työtä tuonnin jälkeen. Muut lukijat voivat ohittaa sen. |

### `liike`: osan oma asento

`x`, `y` on kääntöpisteen paikka: juuriosalla lavan pikseleinä, lapsiosalla **vanhemman kuvan pikseleinä** (esim. olkapää vartalokuvan kohdassa 100, 30). Osan muunnos lavalle:

```
M(osa) = M(vanhempi) · T(x, y) · R(kulma) · S(koko) · T(−kp.x, −kp.y)        (juuriosalla M(vanhempi) = identiteetti)
```

Kuva piirretään muunnoksella `M(osa)` kohtaan (0, 0) kokoon `w × h`. Kulma ja koko lavalla: vanhempien kulmat lasketaan yhteen ja koot kerrotaan keskenään.

Täyttö: ruutu, jota ei nauhoitettu, saa lähimmän aiemman nauhoitetun arvon. Jos sellaista ei ole, se saa ensimmäisen myöhemmän, ja jos osaa ei nauhoitettu lainkaan, `perus`-asennon. Tasoitus (Gaussin suodin, enintään 4 ruudun sigma) on jo laskettu mukaan.

### `laatikot`: valmiina Appi-appia varten

Appi-appin Kuva-palikalla on `x`, `y` (vasen yläkulma), `leveys`, `korkeus` ja `kierto` keskipisteen ympäri. `laatikot` antaa nämä suoraan jokaiselle osalle jokaisessa ruudussa: kuvan keskipiste lavalla on (`x + w/2`, `y + h/2`), ja kuva kiertyy sen ympäri kulman `kulma` verran. Kun kuva piirretään näillä arvoilla ilman kuvasuhteen muutosta (Appi-appin sovitus `fill` tai `contain`, kuvasuhde on sama), tulos on täsmälleen sama kuin Animappissa. Kääntöpistettä ja hierarkiaa ei tarvitse laskea.

Tämä on testattu: `testit/logiikka_03_vienti.js` vertaa laatikoiden kulmapisteitä Animappin omaan muunnokseen joka seitsemännessä ruudussa.

## Sprite sheet (`muoto: "animappi-sprite"`, `ver: 1`)

PNG, jossa ruudut ovat tasavälisessä ruudukossa rivi kerrallaan vasemmalta oikealle, sekä JSON:

```json
{
  "muoto": "animappi-sprite", "ver": 1, "nimi": "Ukko", "kuva": "Ukko-sprite.png",
  "fps": 24, "ruutuja": 48, "kesto": 2, "silmukka": true,
  "ruutu": { "w": 256, "h": 256 }, "sarakkeet": 7, "rivit": 7, "koko": { "w": 1792, "h": 1792 },
  "rajaus": { "x": 0, "y": 0, "w": 512, "h": 512 }, "mittakaava": 0.5, "lavanAlku": [0, 0],
  "ruudut": [ { "x": 0, "y": 0, "w": 256, "h": 256 }, { "x": 256, "y": 0, "w": 256, "h": 256 }, … ]
}
```

- `ruudut[f]` = ruudun `f` paikka PNG:ssä (sama kuin `sarakkeet`-laskusta saatava, valmiiksi laskettuna).
- `rajaus` = mikä osa lavasta on ruudussa (lavan pikseleinä): koko lava tai vain osien yhteinen alue kaikissa ruuduissa.
- `mittakaava` = ruudun pikseli / lavan pikseli. `lavanAlku` = lavan pisteen (0, 0) paikka ruudun sisällä. Lavan piste (X, Y) on ruudussa kohdassa `lavanAlku + mittakaava · (X, Y)`. Tällä hahmon voi kohdistaa samaan kohtaan, vaikka rajaus vaihtelee.
- Arkki mahtuu iPadin Safarin rajoihin: enintään 4096 px kumpaankin suuntaan ja 16,7 megapikseliä. Tarvittaessa Animappi pienentää ruutuja (näkyy `mittakaava`-kentässä).

## Muuttaminen myöhemmin

- Uudet valinnaiset kentät eivät nosta versiota.
- Jos kentän merkitys muuttuu, `ver` nousee, ja Animappin `korjaa`/`tuonti` muuntaa vanhan muodon.
- 3D-vaihe (myöhemmin) tuo todennäköisesti oman `muoto`-arvon. Sen sprite sheet voi käyttää tätä samaa sprite-muotoa (esim. yksi arkki per suunta).

---

## Ehdotukset Appi-appiin (ei toteutettu)

Nämä ovat tekoälyn ehdotuksia. Appi-appiin ei koskettu tässä työssä. Ne arvioidaan Appi-appin omaa `MISSIO.md`:tä vasten ennen rakentamista.

**Huomio lähtötiedoista:** Appi-appissa on jo kääntökulma. Ominaisuus `kulma` (näkyy nimellä kierto, vaihe ”Appi-appi 3”) kääntää näkymäpalikkaa asteina myötäpäivään **keskipisteen ympäri**. Siitä puuttuu kääntöpiste ja osien hierarkia. Juuri siksi `laatikot` on laskettu valmiiksi: Appi-appi ei tarvitse kumpaakaan toistaakseen animaation.

1. **Animaatio-palikka (logiikka), lukee `laatikot`.** Ehdotettu toiminta:
   - Palikka saa animaatiotiedoston (tuonti tiedostona tai tekstinä, kuten Kuva-palikan kuvat) ja luo jokaisesta osasta Kuva-palikan samaan näkymään tai käyttää valittuja. Kuvaksi tulee `kuvat[…].data`, järjestys `z`:n mukaan.
   - Animaatio sijoittuu palikan paikkaan: lavan piste (0, 0) on palikan vasen yläkulma, ja palikan koko skaalaa lavan.
   - Ominaisuudet: `toistaa` (kyllä/ei), `ruutu` (1–`ruutuja`), `nopeus` (% tai kertoimena), `silmukka`. Tapahtuma: `valmis`. Toiminnot: Toista, Pysäytä, Alkuun.
   - Ruudun vaihtuessa palikka kirjoittaa osien Kuva-palikoille `x`, `y`, `leveys`, `korkeus` ja `kulma` asetettuina arvoina (`P.st['o:'+id]`), jolloin nuoli voittaa ja Palauta palauttaa, kuten Liike-palikassa.
   - Huono puoli: 24 ruutua sekunnissa × monta osaa kulkee nykyisen ominaisuuslogiikan kautta. Jos se on raskasta, piirto kannattaa tehdä suoraan näkymän piirrossa ilman tilan tallennusta joka ruudussa.
2. **Sprite sheet Kuva-palikkaan.** Valinnainen kenttä `arkki = {w, h, sarakkeet, ruutuja}` (tai koko sprite-JSON), jolloin Kuva-palikka näyttää kuvasta yhden ruudun. Nykyinen kuvasarja toimii, mutta siihen mahtuu enintään 32 kuvaa (`SARJA_MAX`). Se on 24 fps:llä vain 1,3 sekuntia, ja jokainen kuva on oma tiedostonsa. Sprite sheet on yksi kuva, ja sen voi jakaa myös peleihin.
3. **Valinnainen kääntöpiste näkymäpalikkaan** (`kp`, osuus leveydestä ja korkeudesta, oletus keskellä). Ei tarvita animaatioiden toistoon (laatikot riittävät), mutta se tekisi Appi-appin omasta kierrosta luontevamman (esim. viisari, joka kääntyy päästään).
4. **Säilytys.** Animaatiotiedostossa on kuvat mukana, joten se voi olla iso. GitHubin contents-rajapinta palauttaa sisällön suoraan vain alle 1 Mt:n tiedostoille. Jos animaatioita tallennetaan `master-tiedot`-repoon, isommat pitää lukea raw- tai blob-rajapinnalla. Vaihtoehto: kuvat erillisinä tiedostoina ja animaatiotiedostossa vain viittaukset (vaatisi uuden valinnaisen kentän, esim. `kuvat[…].osoite`).
5. **Hierarkia Appi-appiin** (lapsipalikka seuraa vanhempaa) olisi iso muutos koko näkymämalliin. Sitä ei ehdoteta animaatioiden takia, koska `laatikot` korvaa sen.
