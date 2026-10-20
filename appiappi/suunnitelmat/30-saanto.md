# F46 Sääntö: yleispalikka ohjaa toista palikkaa ilman nuolta

20.10.2026. **Emilin ajatus** (ketju *Superyksinkertainen Appi-appi*, 20.10. klo 1.40–1.55 Suomen aikaa): ”masterpalikka”, jonka kaava ei määrää vain omaa arvoaan vaan asettaa muiden palikoiden asioita kauempaa (*jos eläimiä on yli 5, janan jakauma on tällainen*), sekä sama kertalaukaisuna (triggeri) ilman erillistä triggeripalikkaa. Emil pyysi tekemään heti; tekoälyn ehdotukset (`jos` = voimassa, `kun` = kerran, nimi *Sääntö*, ensin tehty voittaa, ♛) Emil näki ennen rakentamista. **Vaihe 1 toteutettu Appi-appi 98** (`MUUTOKSET.md`). Tausta: `/mnt/project-files/appiappi/superyksinkertainen.md` (projektin tiedostot). [Hakemisto](../SUUNNITELMA.md), [yleispalikka](29-yleispalikka.md).

## 1. Mitä oli ennen

- JOS-palikka on **hetki**: NIIN tehdään kerran ehdon alkaessa päteä; mikään ei palauta tilaa (manuaali 4, JOS). Tilaa pitää voimassa vain nuoli tai kaava kohteen omaan kohtaan (*näkyy kun*, `o_<avain>`) tai Joukko-palikan sääntö jäsenille.
- Joukon ohjaus (`jkCtl`) on jo yleinen kerros kaikille ohjattaville ominaisuuksille ja kohdille *näkyy kun*, *harmaana kun*, *vaihtoväri kun*: sääntö kytkettiin samaan kerrokseen, joten piirto, Miksi? ja paneelit näkevät sen ilman uutta reittiä.

## 2. Vaihe 1 (toteutettu 98)

- **Yleispalikan laji Sääntö ♛.** Kirjoitus `jos ehto niin @kohde.ominaisuus = arvo [muuten arvo2]` = voimassa niin kauan kuin ehto pätee; kun ehto lakkaa, kohde palaa omaan arvoonsa (myös toiminnon asettamaan). Lukittuna Sääntö-lajiksi myös `@kohde.ominaisuus = kaava` (aina voimassa).
- **Kertalaukaisu:** `kun ehto niin @kohde.ominaisuus = arvo`, `@kohde = arvo` (namiskan tai Muistin arvo), `= vaihda` (kyllä ↔ ei), `= käynnistä` / `= pysäytä` (ketju tai Jana). Tehdään, kun ehto alkaa päteä (kuten KUN; ei avattaessa). Palikka saa tapahtumakohdan *silloin*; pelkkä `kun ehto` on vain tapahtuma.
- **Etusija (A3 täydentyy):** oma nuoli tai kaava > **sääntö** > joukon ohjaus > toiminnon asettama > perusarvo. Kaksi voimassa olevaa sääntöä samaan kohtaan: ensin tehty voittaa (kuten Joukko-palikat), ristiriita näkyy molempien säännön tilassa, kohteen paneelissa ja Miksi?:ssä.
- **Näkyvyys:** palikassa `kohde.ominaisuus` (kun-säännöllä `kun → kohde`), kirjoitusosassa ja paneelissa tila (*Voimassa*, *Ei voimassa*, *Ristiriita*, *Väistyy*), kohteen paneelissa ♛-rivit ja *Siirry*, Ominaisuudet-osiossa ♛. Kehä (sääntö lukee ohjaamaansa) on virhe. Virheellinen kirjoitus säilyy ja on punainen, virhe luettelee kohteen ohjattavat ominaisuudet.
- **Tallennus:** yleispalikka on sisäisesti Kaava (`b.f` = säännön arvo nyt, tyhjä = ei voimassa; kun-säännöllä ehto) ja `b.sa = {r, p, pr, kerta?, vh?, c, v, m?, raw?}`. Valinnainen kenttä, vanha appi näkee Kaavan. Versio pysyy 12.

## 2b. Vaihe 2: monta riviä (toteutettu 99, jonon 40e)

- **Jos-rivit = vaiheet.** Monirivisessä säännössä jokainen rivi on oma lauseensa (erotin = rivinvaihto). Jos-rivit ja ehdottomat `@kohde = …` -rivit ohjaavat samaa kohdetta järjestyksessä: kohteen viittaus rivillä tarkoittaa edellisen rivin tulosta, ensimmäisellä rivillä kohteen omaa arvoa (ilman sääntöä). Rivi, jonka ehto ei päde (eikä sillä ole muuten-osaa), jää väliin. Tulos on voimassa niin kauan kuin yksikin rivi tehtiin. Esim. `@valmius = @uni * 1` / `@valmius = @valmius - @kuormitus / 10` / `jos @stressi > 5 niin @valmius = @valmius * 0,8`.
- **Haarat ilman sulkuja (Emil 20.10.):** rinnakkaiset jos-rivit, joiden ehdot sulkevat toisensa pois, toimivat haaroina. Yksi palikka ohjaa jos-riveillä yhtä kohdetta; toisen kohteen vaiheet omaan palikkaansa.
- **Arvon ja Muistin arvo:** jos-sääntö ohjaa nyt myös Arvon ja Muistin arvoa (`@valmius = …`, kohta `v`). Muistin tallennettu arvo säilyy ja palaa esiin, kun sääntö lakkaa.
- **Monta kun-riviä:** jokainen kun-rivi laukeaa itse, kun sen ehto alkaa päteä, ja saa ohjata mitä tahansa kohdetta. Jos- ja kun-rivit voivat olla samassa palikassa. Ketju syntyy ehdoista, esim. `kun @määrä > 5 niin @kello = käynnistä` / `kun @kello > 3 niin @lamppu.väri = 4`.
- **Sekuntikello:** `= käynnistä`, `= pysäytä` ja `= nollaa`.
- **Näkyvyys:** tila näyttää rivit (*Rivit: 1 ✓, 2 ✓, 3 –*) ja kun-rivien määrän; palikassa `→ Kohde · 3 vaihetta · kun ×2`. Oma viittaus ei enää ole kehä; kehä toisen palikan kautta on yhä virhe.
- **Tallennus:** `b.sa.s = [{i rivi, c?, v, m?}]` (vaiheet) ja `b.sa.k = [{i, c, r?, p?, pr?, v? | vh?}]` (kun-rivit); pelkillä kun-riveillä `sa = {kerta:1, k}`. Valinnaisia kenttiä, versio pysyy 12.

## 2c. Seuraava ehdotus: kirjoitettu tapahtumaketju (ei tehty, odottaa Emiliä)

Ehdotus (tekoäly): ketju samaan palikkaan ilman ehtojen kirjoittamista, esim. `kun @nappi niin @lamppu.väri = 4` / `odota 5 s` / `@lamppu.väri = 1` / `odota 2 s` / `@ajo = käynnistä`. Rivit tehdään järjestyksessä, `odota` pitää taukoa (sama aikamoottori kuin Ketju-palikalla, joten vienti toimii). Yksi suora ketju, ei haaroja; tekoäly voi kirjoittaa sen tekstinä. Avoimet: käynnistyykö ketju uudestaan kesken ajon (ehdotus: ei, kuten Ketju), ja näkyykö eteneminen palikassa (ehdotus: rivin ✓). Kirjattu jonoon 40f ⏸.

## 3. Myöhemmin (ei tehty)

- 40b: piilotus ja näyttäminen kerralla (`kun … niin @x.näkyy = ei`): tarvitsee asetetun näkyvyyden (K10:n avoin suunnitelma).
- 40c: säännön kohteeksi nuolikohdat (Janan asetukset kuten jakauma, kesto; animaation käynnistys), joita nyt ohjataan vain nuolella (A2).
- 40d: ehdotusrivi tarjoaa kohteen ohjattavat ominaisuudet ja arvot (nyt virheilmoitus luettelee ne); ♛-merkki näkymän kanvaasille hallitun palikan kulmaan; namiskan lukko, kun sääntö ohjaa sen arvoa.
- Jos-vaiheet usealle kohteelle samassa palikassa (nyt kun-rivit saavat, jos-rivit eivät).

## 4. Linjakkuus

- **A2** sääntö ohjaa vain `omat`-rekisterin ohjattavia ominaisuuksia (`o:1`) ja yhteisiä kohtia; ei uutta ominaisuutta. **A3** etusija kirjattu yllä; yksi jatkuva ohjaus, ristiriita näkyy. **A6** `jos` on tila, `kun` hetki, sama ero kuin kaavan `jos` ja KUN-palikalla. **A7** ei uutta sääntökieltä: ehto ja arvo ovat tavallisia kaavoja, uutta on vain `niin @kohde = …` ja sanat `vaihda`, `käynnistä`, `pysäytä`. **A8** yksi yleinen reitti korvaa JOS + Toiminto + MUUTEN -rakennelman. **A9** kohde on tunniste (`sa.r`), uudelleennimeäminen näkyy. **A10** tila, ristiriita ja Miksi?. **A12** laskenta ja laukaisu moottorissa. **A13** valinnainen kenttä. **A14** testit `logiikka_108_saanto.js`, `selain_135_saanto.py`. **40e:** ei uutta sanaa; rivinvaihto erottaa lauseet kuten yleispalikan muissakin lajeissa, oma viittaus = edellinen tulos (sama ajatus kuin Muistin `@laskuri = @laskuri + 1`).
- **Ei erikoispalikkaa:** Sääntö on yleispalikan laji. Uusi poikkeus: ohjaus ilman nuolta tai omaa kohtaa (kuten Joukko-palikan sääntö jäsenille, jolla on jo hyväksytty vastaava poikkeus).
