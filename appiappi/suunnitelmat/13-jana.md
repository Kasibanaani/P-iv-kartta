# F28 Jana: logiikan ikkuna, jossa paikka vasemmalta oikealle on arvo

17.10.2026. **Emilin idea**, tekoälyn jäsentämä. Rakennetaan jonossa (`TILA.md`, *Jono*) tekoälyn suositusten mukaan; Emil voi muuttaa linjauksia ennen rakentamista. **Ei toteutettu.** [Hakemisto](../SUUNNITELMA.md), [ketjun lukitus](02-ketjujen-lukitus.md), [aika](05-aika-media-ja-liitannat.md).

## Idea (Emilin idea, tiivistetty)

- Logiikkaan uusi ikkuna, Tapahtumaketjun sukulainen: **Jana**. Ikkunaa venytetään kuten muita ikkunoita; sen leveys (lähes reunasta reunaan) on janan 0–100 %.
- Alku- ja loppuarvo asetetaan (oletus 0 ja 10), myös logiikasta.
- Jana voi olla **aikajana** (sekunnit, minuutit, tunnit, päivät): mikä tahansa laukaisija käynnistää sen, ja kulkiessaan se laukaisee matkan varrelle pannut asiat.
- Jana voi kulkea myös **arvon mukaan**, esim. liukusäätimen: säädintä raahatessa matkan varrella olevat asiat laukeavat. Silloin jana on jatkuvasti päällä tai logiikka kytkee sen.
- Ikkunaan raahattu palikka loksahtaa portaaseen (esim. ”7 s”), ja raahatessa luku näkyy ikkunassa. Pystysuunnassa samaan kohtaan mahtuu monta asiaa: yhtäaikaisuus ja limittäisyys.
- Jana voi käynnistää toisia janoja (ja ketjuja). Ketjuilla saa saman aikaan, mutta jana on usein havainnollisempi.

## Nykytila (tarkistettu koodista 17.10.2026, Appi-appi 21)

- **Tapahtumaketju** on ikkuna (laji `ketju`), jonka sisällä tapahtumapalikat ovat vaiheita ja ketjun viivat järjestys. Ajoitus on suhteellista: *Ajastin 3 s* odottaa edellisestä. Rinnakkaisuus vaatii *Monta haaraa* -palikan. Käynnistä/Pysäytä ketju ja odotus toimivat.
- **Muutos ajassa** antaa arvon, joka kulkee ajassa alusta loppuun (käynnistä/pysäytä), **Sekuntikello** kuluneen ajan, **Käyrä** muuntaa arvon toiseksi. Arvo-palikan yksiköt s, min, h; aika lasketaan sekunteina.
- **Säädin** lähettää arvon logiikkaan koko vedon ajan (Appi-appi 21).
- **Alue** (näkymässä) antaa *sisällä*, *astuttu*, *poistuttu*: sama ajatus kuin janan väli, mutta kaksiulotteisena paikkana.
- Käyttäjän puolella on jo palikka **Aikajana** (päiväkirjan merkinnät). Siksi uusi ikkuna on nimeltään **Jana**, ei Aikajana.
- Ei ole: absoluuttista kohtaa, johon toiminto sidotaan, eikä yleistä tapaa laukaista toimintoja arvon ylittäessä rajan muuten kuin yksi KUN-ehto kerrallaan.

## Arvio

**Hyvää.** Jana ratkaisee kaksi oikeaa aukkoa yhdellä mallilla: (1) ajoitus absoluuttisina kohtina ja rinnakkain ilman haarapalikoita, (2) monta kynnystä samalle arvolle, joka nyt vaatii yhden KUN-ehdon per raja. Sama ikkuna palvelee animaatiota, peliä, ohjattua harjoitusta ja säätimen portaita. Toteutus nojaa olemassa oleviin osiin: ikkuna, tapahtumapalikat, aikayksiköt, Käynnistä/Pysäytä.

**Päällekkäistä.** Aikajanan saa jo ketjulla ja ajastimilla, ja säädinkynnykset KUN-ehdoilla. Jana ei korvaa niitä; se on toinen tapa esittää sama. Ketju jää tarkoitukseen ”tämä, sitten tuo, odota kunnes”, jana tarkoitukseen ”tässä kohdassa tapahtuu tämä”. Rakentajalle ei tule kahta moottoria: janan merkit ajetaan samalla toimintojen suorituksella kuin ketjun vaiheet.

**Sudenkuopat** (ratkaisut alla):
1. Mitä merkille tapahtuu, kun alkua tai loppua muutetaan tai ikkunaa venytetään.
2. Hypyt: säädintä napautetaan tai jana siirretään suoraan kohtaan, jolloin moni merkki ohitetaan kerralla.
3. Taaksepäin kulku: laukeaako merkki uudestaan, kun säädin palaa.
4. Appi kiinni tai taustalla: tunteja tai päiviä kestävä aikajana ei kulje sivun ajastimilla.
5. Merkki täsmälleen alussa tai lopussa ja toisto kierroksina.
6. Puhelinleveydellä kapea ikkuna: portaat pitää pystyä osumaan sormella.

## Ratkaisut (tekoälyn suositus)

**Ikkuna.** Uusi ikkunalaji `jana`. Asetukset: *alku*, *loppu* (oletus 0 ja 10, nuolella tai kaavalla ohjattavissa), *yksikkö* (ei mitään, s, min, h, päivä), *porras* (oletus 1 yksikkö), *kulku* (Aika / Arvo). Ikkunassa näkyy asteikko ja portaiden viivat, kulkiessa pystyviiva nykyisessä kohdassa.

**Merkit.** Janaan raahattu tapahtumapalikka (samat kuin ketjussa: Aseta, Lisää, Käynnistä/Pysäytä ketju tai jana, efektit jne.) on merkki. Sen **vasen reuna** on sen kohta. Raahatessa kohta loksahtaa portaaseen ja luku (”7 s”) näkyy palikan yläpuolella. Pystysijainti on vapaa: samassa kohdassa voi olla monta merkkiä, ja ne ajetaan ylhäältä alas. Paneelissa kohdan voi kirjoittaa myös numerona (puhelimella tarkempi kuin raahaus).

**Sudenkuoppa 1, kohta tallennetaan arvona.** Merkki ”7 s” pysyy 7 sekunnissa, vaikka loppu muuttuu 10:stä 20:een; se vain siirtyy kuvassa vasemmalle. Ikkunan venytys ei muuta arvoja. Jos merkki jää alueen ulkopuolelle, se näkyy reunassa haaleana (”12 s, alueen ulkopuolella”) eikä laukea; sitä ei poisteta. **Emilin päätös 17.10.2026: arvossa.** Kohta suhteena (tempo) voi tulla myöhemmin lisävalinnaksi (vaihe 3).

**Sudenkuoppa 2, hypyt.** Kun kohta muuttuu, laukaistaan kaikki merkit, jotka jäivät vanhan ja uuden kohdan väliin, kohtajärjestyksessä (samaan kohtaan ylhäältä alas). Asetus *Hypyssä*: laukaise väliin jääneet (oletus) / vain viimeinen / ei mitään. Rakentajan toiminto *Siirrä janan kohta* (ilman laukaisua tai laukaisten) on erikseen.

**Sudenkuoppa 3, suunta.** Asetus *Laukeaa*: eteenpäin (oletus aikajanalla) / molempiin suuntiin (oletus arvojanalla). Merkki laukeaa uudestaan vasta, kun kohta on käynyt sen toisella puolella. Toiminto saa tapahtuman tiedoissa suunnan (`tapahtuma.suunta` = 1 tai −1), jolloin ”taaksepäin kumoa” saadaan Ehdolla.

**Sudenkuoppa 4, aika.** Aikajanan kohta lasketaan käynnistyshetken aikaleimasta (kuten Sekuntikello), ei laskemalla ruutuja. Kun appi avataan uudelleen, kohta on oikein ja väliin jääneet merkit laukeavat hyppysäännön mukaan. Appi ei tee mitään suljettuna eikä lähetä ilmoituksia (05: *Suljettu appi*). Tämä kerrotaan paneelissa, kun yksikkö on h tai päivä.

**Sudenkuoppa 5, reunat ja toisto.** Merkki alussa laukeaa käynnistyessä. *Kierros*: kerran (oletus) / toista / edestakaisin (kuten Reitti). Toistossa merkit virittyvät uudestaan kierroksen alussa, ja jana lähettää *kierros*-tapahtuman. Lopussa *valmis*.

**Sudenkuoppa 6, puhelin.** Porras ei ole koskaan kapeampi kuin noin 12 px ruudulla: jos on, asteikko näyttää harvemmat viivat, mutta loksahdus käyttää silti porrasta, ja tarkka kohta kirjoitetaan paneeliin.

**Janan liitännät.** Sisään: *käynnistä*, *pysäytä*, *jatka*, *kohta* (Arvo-kulussa nuoli tähän, esim. säätimestä), *päällä* (Arvo-kulussa; ilman nuolta aina päällä), *alku*, *loppu*. Ulos ja ominaisuuksina: `jana.kohta`, `jana.osuus` (0–100 %), `jana.käynnissä`; tapahtumat *alkoi*, *valmis*, *kierros*. Toiminnot Käynnistä, Pysäytä ja Siirrä kohta hyväksyvät janan kohteeksi, joten jana käynnistää janoja ja ketjuja, ja ketju janoja (myös odottaen valmistumista).

**Mitä ei tehdä ensimmäisessä vaiheessa.** Jana ei ole ketjun sisällä eikä ketju janan sisällä (sisäkkäiset ikkunat). Ei lukitustiloja (D09/D10): merkit lukevat ajantasaiset arvot. Ei nopeutta/tempoa, ei käyrää ajan muotoon (Muutos ajassa ja Käyrä hoitavat sen), ei Animappin tuontia.

## Vaiheet

1. **Pistemerkit (jonossa).** Ikkuna, alku/loppu/yksikkö/porras, Aika- ja Arvo-kulku, merkit loksahtavat ja näyttävät luvun, hyppy- ja suuntasäännöt, kierros, liitännät ja tapahtumat, Käynnistä/Pysäytä/Siirrä kohta janalle, aikaleimaan perustuva kohta, tallennus ja Miksi?-selitys (”laukesi, koska kohta ohitti 7 s”).
2. **Välit (myöhemmin, erillinen lupa).** Väli-merkki, jolla on alku ja loppu (venytetään leveäksi): *sisällä* (kyllä/ei), *alkoi* ja *päättyi*. Tämä on Emilin ”limittäisyys” täydessä muodossaan: esim. säätimen alue 30–60 tai efekti, joka kestää 3–7 s. Toimii kuten Alue, yhdessä ulottuvuudessa.
3. **Myöhemmin, ehdotus.** Kohta suhteena (tempo), nopeus-sisääntulo, Animappin animaation kesto janaan (`MUOTO.md`: 24 ruutua/s, `kesto`).

## Tallennus

Uusi palikkalaji `jana` (`alku`, `loppu`, `yks`, `porras`, `kulku`, `hyppy`, `suunta`, `kierros`) ja merkin kohta `jk` merkkipalikan solmussa. Lisäys on valinnainen: vanhat projektit avautuvat ennallaan, `VER` nousee vain, jos rakentaja toteaa sen tarpeelliseksi. Ajotila (`kohta`, käynnistysaika, viritetyt merkit) käyttötietona kuten Sekuntikellossa.

## Kokeet (vaihe 1)

- Merkit 0, 3, 3 (kaksi päällekkäin) ja 10 s: laukeavat oikeina hetkinä, päällekkäiset ylhäältä alas, *valmis* lopussa.
- Loppu 10 → 20 kesken: merkit pysyvät arvoissaan; alueen ulkopuolinen ei laukea eikä katoa.
- Säädin Arvo-kulussa: hidas veto laukaisee jokaisen merkin kerran; napautus raidalle hyppää ja laukaisee väliin jääneet järjestyksessä; paluu laukaisee molempiin suuntiin -asetuksella ja `tapahtuma.suunta` = −1.
- Jana käynnistää toisen janan ja ketju odottaa janan valmistumista.
- Simuloitu sulkeminen: kello siirretään 5 min eteen, uudelleenavaus laskee kohdan ja laukaisee väliin jääneet.
- Raahaus loksahtaa portaaseen ja näyttää luvun; 390 ja 320 px sekä 1440 ja 1280 px.
- Vanha projekti ilman janaa avautuu ja tallentuu muuttumattomana.
