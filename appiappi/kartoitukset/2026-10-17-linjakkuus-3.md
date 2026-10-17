# Linjakkuuskartoitus 3 (17.10.2026)

Vuorossa, koska edellisen kartoituksen jälkeen jonosta on viety viisi kohtaa: `jos`/`ja`/`tai` kaavaan (Appi-appi 28, jonon 1f), Ryhmä (29, 1g), tekstihaku `sisältää` (30, 1h), Tietotaulukon `eka`/`vika` (31, 1i) sekä Miksi? kaikille ja paneelien savutesti (32, 1j). Kaista B:n testitila F22 ei ollut päähaarassa kartoituksen aikana, joten se ei ole mukana. Mittapuu: [PALIKKASAANNOT.md](../PALIKKASAANNOT.md) ja [MISSIO.md](../MISSIO.md). Kartoitus tuottaa löydöksiä ja ehdotuksia, ei koodimuutoksia. **Mikään alla oleva ehdotus ei ole toteutuslupa**, paitsi jonoon lisätty kohta 1k (ks. loppu), joka on pieni ja selvä.

## Mitä katsottiin ja mitä ei

- **Koodi:** päähaaran commit `f2cd3db` (Appi-appi 32), 60 palikkalajia (`K`). Viiden kohdan `index.html`-muutokset luettiin kokonaan (yhteensä noin 160 riviä). Moottorilla Nodessa kokeiltiin reunatapaukset: ryhmän viite kaavassa ja tekstissä, kirjoitusvirhe ja poistettu viite valitsematta jääneessä jos-osassa, `=` ja `sisältää` kirjainkoon kanssa, `jos` Toiminnon Lisää rivi -kentässä, jokaisen lajin Miksi?-teksti oletusasetuksilla.
- **Kaistat:** `TILA.md`:n ja `testit/README.md`:n muutokset commitista `834f465` (kaista B otti F22:n) commitiin `f2cd3db`.
- **Testit:** logiikkatestit 65/65 läpi; selaintestit `selain_73_paneelit` (1440 ja 390 px, 60 lajia, Miksi? näkyy 36:lla) ja `selain_70_ryhma` (1440–320 px) läpi. **Koko selainsarjaa ei ajettu** (noin 20 min); kartoitus 2 ajoi sen viimeksi.
- **Ei katsottu:** Ryhmä ja Miksi? iPad-näkymässä, puhelimen paneelit sormella (vain savutestin DOM-luku), oikea iPhone. Käyttöohje (`ohje/`) on toisen ketjun työn alla, eikä sitä luettu.

## Yleiskuva

**Linja pitää, ja kartoitus 2:n isot löydökset on korjattu.** Miksi? näkyy nyt 36 lajilla (ennen 14), VALITSE-palikan vihje on oikea, ja savutesti avaa jokaisen lajin paneelin kahdella leveydellä. `jos`/`ja`/`tai` ja `sisältää` noudattavat Emilin päätöstä (A7): toinen reitti lyhyeen ehtoon, ei uutta sulkukieltä. `sisältää` toimii samoin kuin `=`: kumpikaan ei välitä kirjainkoosta, joten tekstivertailu on yhtenäinen. `eka`/`vika` on sama sana ja sama käytös kuin Rivijoukossa, ja Valitse rivi -toiminto käyttää samoja avaimia (A8). Ryhmä on erikoispalikka, jolla on rekisteririvi ja ✦.

Yksi uusi iso löydös: **Ryhmä varaa näkymättömän viitteen**, ja kaava voi hiljaa osua siihen. Muut löydökset koskevat sitä, mitä rakentaja näkee (A10): kirjoitusvirhe voi piiloutua jos-funktion toiseen osaan, ja Miksi?-tekstien sävy vaihtelee lajista toiseen.

## Löydökset

Vakavuus: **iso** = rikkoo usein tarvittavaa sääntöä, **keski** = opittava poikkeus, **pieni** = kauneusvirhe.

| # | Vakavuus | Sääntö | Löydös | Ehdotus |
|---|---|---|---|---|
| N1 | iso | A9, A10 | **Ryhmä varaa viitteen, jota ei näe.** Ryhmälle syntyy viite nimestä (esim. *Uni* → `uni`), vaikka paneeli piilottaa Viite-kentän. Jos myöhemmin tehdään Arvo *Uni*, se saa viitteen `uni2`, ja kaava `uni > 7` osuu ryhmään: tulos on hiljaa epätosi (arvo tyhjä), ei virhettä eikä ⚠. Tekstin `{uni}` näyttää ”–”. Miksi? näyttää ”Kaava: uni > 7.”. Rakentaja ei näe syytä mistään. Kokeiltu moottorilla (Ryhmä ensin, Arvo sitten). | Ryhmä ei saa viitettä eikä vie nimeä muilta: viitteiden haku ja yksilöinti ohittavat ryhmän. Kaava tai teksti, joka silti osoittaa ryhmään (vanha projekti), on näkyvä virhe ”Ryhmä ei ole arvo”. Ei tallennusmuodon muutosta (vanha `vt` jää tallennukseen käyttämättä). **Jonoon 1k.** |
| N2 | keski | A10 | **Kirjoitusvirhe piiloutuu jos-funktion valitsematta jääneeseen osaan.** `jos(uni > 7; "hyvä"; unii)` toimii virheettä niin kauan kuin ehto pätee; virhe ”puuttuu: unii” tulee esiin vasta, kun muuten-osa valitaan (ehkä vasta käytössä). Poistettu viite näkyy oikein (⚠ ja Viitevirheet), joten kyse on vain tuntemattomasta nimestä. | Tuntematon nimi on virhe jo kirjoitettaessa, osasta riippumatta; laskun virheet (esim. jako nollalla) pysyvät laiskoina kuten nyt. **Jonoon 1k.** |
| N3 | keski | A10 (lähde) | **Miksi? puuttuu tietopalikoilta:** Arvo, Muisti, Tänään, Tietotaulukko ja Tapahtuman tiedot (ja Ryhmä, tarkoituksella). Erityisesti Muisti: rakentaja ei näe, mikä toiminto kirjoitti arvon viimeksi. Yhteydet kertoo, mistä *voi* tulla, ei mistä tuli. | Muistille ja taulukolle ”viimeksi muuttanut: Toiminto X klo 12.03” vaatii ajonaikaisen kirjanpidon, joten se on suunniteltava erikseen (ei jonoon). Arvolle ja Tänään riittää nykyinen. |
| N4 | pieni | A10 | **Miksi?-tekstien sävy vaihtelee**, nyt kun ne kaikki näkyvät. Tyhjänä JOS, VALITSE, Hakutaulukko ja Käyrä neuvovat (”vie nuoli kohtaan ”ehto””), mutta Lasku sanoo ”tyhjä + tyhjä”, Vertailu ”tyhjä = tyhjä”, Päivämäärän osa ”Viikkonumero: tyhjä” ja Toiminto ilman kohdetta pelkän ”Aseta arvo”. Rivijoukon teksti alkaa pienellä kirjaimella. | Puuttuva syöte sanotaan samalla lauseella kaikkialla (”… puuttuu: vie nuoli kohtaan …”), Toiminto ilman kohdetta: ”Valitse kohde.” **Jonoon 1k** (pelkkä teksti). |
| N5 | pieni | A8 | **Vertailu-palikassa ei ole `sisältää`-valintaa**, kaavassa on (Appi-appi 30 jätti sen tietoisesti pois). Kaksi reittiä samaan asiaan, eri ulottuvuus. | Lisätään valinta, kun Vertailu-palikkaa seuraavan kerran muokataan. Ei jonoon. |
| N6 | pieni | A10 | **Miksi? kertoo jos-funktiosta, mutta ei ja/tai-funktiosta:** `ja(uni > 7; ikä < 50)` epätosi ilman tietoa, kumpi osa ei päde. | Sama jäljitys kuin jos-funktiolle. Ei jonoon (seuraavaan kaavatyöhön). |
| N7 | pieni | A8 | **Kaavan ehdotusrivi** (viitteet, `jos(`, `sisältää`) toimii vain Kaava-palikassa ja suoraan palikkaan kirjoitettaessa. Toiminnon *Lisää rivi* -kentät ovat kaavoja (`jos` toimii niissä, kokeiltu), mutta ilman ehdotuksia. | Sama ehdotusrivi kaikkiin kaavakenttiin, kun niitä seuraavan kerran muokataan. Ei jonoon. |
| N8 | pieni | A8 | **Rivi-palikan *mikä rivi*** tuntee käsiteltävän, valitun ja tapahtuman rivin, mutta ei ensimmäistä eikä viimeistä, vaikka kaava (`taulu.vika`) ja Valitse rivi tuntevat. | Lisätään, jos koeappi tarvitsee (nyt kaava riittää). Ei jonoon. |

## Kaksi kaistaa

Kaksi rakentajaa toimi tänään ensimmäistä kertaa rinnakkain. Tähän asti ei ristiriitoja:

| # | Vakavuus | Löydös | Ehdotus |
|---|---|---|---|
| K1 | – | **Jonon rivit säilyivät.** Kaista B:n merkintä ”työn alla, kaista B” (commit `834f465`) pysyi kaista A:n kahden työnnön (31, 32) läpi; valmiit 1i ja 1j poistuivat ja kirjautuivat kohtaan Valmiina oikein. Versionumerot 31 ja 32 ovat kaista A:n, F22 ottaa seuraavan vapaan. | Ei muutosta. |
| K2 | keski | **Päällekkäinen alue odottaa F22:ta:** testitila kopioi käyttötiedot, ja Appi-appi 31:n `taulu.eka`/`vika` lukee nimenomaan käyttötietojen rivijärjestyksen (`tRows`). Jos kokeilu ei ohjaa tätä lukua kopioon, `taulu.vika` näyttää kokeilussa oikean eikä kokeilun rivin. Sama koskee jokaista käyttötietoa lukevaa kohtaa. | F22:n rakentaja: kokeilun testiin yksi `taulu.vika`-tarkistus (kokeilussa lisätty rivi on vika, oikea taulukko ennallaan). Seuraava kartoitus tarkistaa. |
| K3 | pieni | **Testitiedostojen numero varataan kirjoitushetkellä.** Kaista B aloitti ennen kuin kaista A vei `selain_73_paneelit.py`:n, joten kaksi kaistaa voi ottaa saman numeron. Git ei riitele (eri nimet), mutta luettelo ja viittaukset sekoittuvat. | Testin numero kuten versionumero: jälkimmäinen työntäjä ottaa seuraavan vapaan. Lisätty kaistasääntöön `TILA.md`:ssä. |
| K4 | pieni | `testit/README.md`:n luettelo ja `TILA.md`:n *Ei tarkistettu* -lista ovat jo sekaisin (README: 62, 69, 64, 65, 71, 72, 73, 63, 70, 68). Ei virhe, vaan rebase-jälki. | Uusi rivi lisätään numerojärjestykseen. Ei jonoon. |

## Edellisen kartoituksen löydökset nyt

| # | Tila |
|---|---|
| M1 Miksi? piilossa | Toteutettu (32): 36 lajia, toisto otsikon vihjeen kanssa karsitaan (vain Lopeta ketju). |
| M2 VALITSE-vihje | Toteutettu (32). |
| M3 sama sana kahdessa merkityksessä | Kehys → **Ryhmä** (29). ⏸ VALITSE-nimi yhä Emilin päätös; 32 piti nimen ja vihje sanoo ”sama kuin kaavan jos”. Lappu ennallaan. |
| M4 ehtojen kolme perhettä | Auki, kuuluu käyttöohjeeseen (ohjeketju työn alla). `jos`/`ja`/`tai` ja `sisältää` ovat *tila*-perhettä. |
| M5 Käytössä-ominaisuus | Auki, ei muutosta. |
| M6, M7 | Auki, ei muutosta. |
| T1, T2 | Toteutettu (32, `selain_73_paneelit.py`). |
| T3 | Savutesti kattaa 390 px. 320 px ajetaan vain uusissa lajikohtaisissa testeissä. |
| T4 | Toteutettu (README: noin 20 min). |

## Erikoispalikoiden rekisteri

Yksi uusi rivi on tullut kartoitus 2:n jälkeen: **Ryhmä** (`ryhma`, Appi-appi 29), päätetty. Rivi vastaa koodia (`erik`, testi 58). N1:n korjauksen jälkeen rivin poikkeus on täsmälleen ”ei viitettä”; rivin tekstiä ei tarvitse muuttaa (”ei arvoa, ei kohtia… ei ominaisuuksia” kattaa sen). Muut rivit ennallaan.

## Lisätty jonoon

- **1k. Ryhmän viite ja näkyvät virheet** (N1, N2, N4): ryhmä ei saa viitettä eikä vie nimeä muilta, ryhmään osoittava kaava tai teksti on näkyvä virhe; tuntematon nimi jos-funktion valitsematta jääneessä osassa on virhe jo kirjoitettaessa; Miksi?-tekstien tyhjän syötteen lause yhtenäiseksi. Ei tallennusmuodon muutosta, ei uusia käsitteitä. Sopii kummalle kaistalle tahansa (koskee kaavan jäsennystä, viitteitä ja Miksi?-tekstejä, ei F22:n aluetta).
- **Kaistasääntöön:** testitiedoston numero otetaan työntöhetkellä kuten versionumero (K3).

## Seuraava kartoitus

Viiden valmiin jonon kohdan jälkeen (laskuri alkaa F22:sta, jos se viedään tämän jälkeen), ennen uuden toimintoryhmän suunnittelua tai pyynnöstä. Ensi kerralla: F22:n testitila (K2), puhelin- ja iPad-näkymän paneelit sormella, Yhteydet-osio ja nimien kokonaislista (kartoitus 2:n lupaus, jäi yhä tekemättä), sekä koko selainsarja.
