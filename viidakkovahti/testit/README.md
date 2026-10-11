# Viidakkovahdin testit

Aja kaikki: `sh viidakkovahti/testit/aja.sh` (repon juuresta). Vaatii Noden sekä Pythonin ja Playwrightin (Chromium).

## Mitä ajetaan

- `logiikka_01_peli.js`: pelin säännöt. Kartan arvonta, vihollisten kulku ja esteiden kierto, banaani, vesimeloni, myyrän kolot, elämät, vaikeustasot, pelaajien pisteet ja tallennusmuoto. Tuloste sisältää myös suuntaa antavan simulaation siitä, kuinka kauan tasaiseen tahtiin napauttava pelaaja kestää kullakin vaikeustasolla.
- `selain_01_perus.py`: koko peli selaimessa puhelinkoossa (390 px, 320 px tummana ja 430 x 932 px). Aikaa siirretään sivun testikoukulla `__vv.advance`, jottei tarvitse odottaa. Tulosteet ja kuvakaappaukset tulevat kansioon `tulosteet/`.

Ajo poimii pelin koodin tiedostosta `../index.html` tiedostoksi `vv.js`.

## Miten tulos luetaan

- Jokainen testi tulostaa lopuksi `KAIKKI OK` tai `VIRHEITÄ` ja epäonnistuu itse, jos jokin odotus ei täyty tai sivulla tapahtuu virhe.
- Kuvakaappaukset pitää katsoa itse, kun ulkoasua on muutettu.
- Testit ajetaan tietokoneen Chromiumissa, ei oikealla iPhonella. Pelin tuntumaa ja sopivaa vaikeutta ne eivät kerro.
