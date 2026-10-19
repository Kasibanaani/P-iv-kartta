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

## 3. Myöhemmin (ei tehty)

- 40b: piilotus ja näyttäminen kerralla (`kun … niin @x.näkyy = ei`): tarvitsee asetetun näkyvyyden (K10:n avoin suunnitelma).
- 40c: säännön kohteeksi nuolikohdat (Janan asetukset kuten jakauma, kesto; animaation käynnistys), joita nyt ohjataan vain nuolella (A2).
- 40d: ehdotusrivi tarjoaa kohteen ohjattavat ominaisuudet ja arvot (nyt virheilmoitus luettelee ne); ♛-merkki näkymän kanvaasille hallitun palikan kulmaan; namiskan lukko, kun sääntö ohjaa sen arvoa.
- Monta kohdetta yhdessä säännössä (rivi = osa, ks. superyksinkertainen-arvio).

## 4. Linjakkuus

- **A2** sääntö ohjaa vain `omat`-rekisterin ohjattavia ominaisuuksia (`o:1`) ja yhteisiä kohtia; ei uutta ominaisuutta. **A3** etusija kirjattu yllä; yksi jatkuva ohjaus, ristiriita näkyy. **A6** `jos` on tila, `kun` hetki, sama ero kuin kaavan `jos` ja KUN-palikalla. **A7** ei uutta sääntökieltä: ehto ja arvo ovat tavallisia kaavoja, uutta on vain `niin @kohde = …` ja sanat `vaihda`, `käynnistä`, `pysäytä`. **A8** yksi yleinen reitti korvaa JOS + Toiminto + MUUTEN -rakennelman. **A9** kohde on tunniste (`sa.r`), uudelleennimeäminen näkyy. **A10** tila, ristiriita ja Miksi?. **A12** laskenta ja laukaisu moottorissa. **A13** valinnainen kenttä. **A14** testit `logiikka_108_saanto.js`, `selain_135_saanto.py`.
- **Ei erikoispalikkaa:** Sääntö on yleispalikan laji. Uusi poikkeus: ohjaus ilman nuolta tai omaa kohtaa (kuten Joukko-palikan sääntö jäsenille, jolla on jo hyväksytty vastaava poikkeus).
