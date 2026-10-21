# Päätöspuu: vaiheittainen suunnitelma (Emilin hyväksymät suositukset)

Päivitetty 21.10.2026. Emil sanoi kyllä kaikkiin suosituksiin dokumentissa *Päätöspuu: avoimet kysymykset* (https://claude.ai/artifact/RFMnrpTAm7fb7r9prDPz8q). Numerot (1–25) viittaavat siihen. Hyllylle jäävät 6, 7, 8, 14, 16 ja 23.

## Pelisäännöt

1. Vaihe kerrallaan. Rakentaja tekee vaiheen, testaa (390 ja 320 px), julkaisee ja raportoi.
2. Raportin lopussa ovat **vaiheen aikana syntyneet kysymykset ja seuraavan vaiheen kysymykset**. Jokaisessa on suositus ja vähintään yksi vaihtoehto.
3. Seuraavaan vaiheeseen siirrytään vasta, kun Emil on **kuitannut vaiheen valmiiksi ja vastannut kaikkiin kysymyksiin**. Pelkkä kuittaus ilman vastauksia ei riitä: kysy uudelleen.
4. Jos Emil kokeilee iPhonella ja löytää vian, korjaus tehdään saman vaiheen sisällä ennen siirtymistä.
5. Rakentaja päivittää `paatospuu/TILA.md`:n ja merkitsee tähän tiedostoon vaiheen tilan.

## Vaiheet

| Vaihe | Sisältö (kohdat) | Koko | Tila |
| --- | --- | --- | --- |
| 1 | Termisana osana, alleviivaus, ma/ti/pe, klo-korjaus (9, 10, 18, 19) | 1 versio | Valmis (1.11), kuitattu |
| 2 | Arvojärjestys ja Hoidettavat-tulos (1, 5) | 2 versiota | Valmis (1.12), kuitattu |
| 3 | Muistiasetus: vain seuraava / kaikki mukana (4) | 1 versio | Valmis (1.13), kuitattu |
| 4 | Termilohkot tekstissä ja Liitä termiin (13, 11) | 1–2 versiota | Valmis (1.14), kuitattu |
| 5 | Apukysymykset nousevat esiin muistiinpanosta (15) | 1 versio | Valmis (1.15), kuitattu |
| 6 | Teksti ↔ appi kaksisuuntaisesti (12, 25) | 2 versiota | Valmis (1.16), kuitattu |
| 7 | Kalenteri (20, 21, 22) | 2–3 versiota | 7a valmis (1.17), odottaa Emilin kuittausta; 7b odottaa |
| 8 | Tärkeysjärjestys, kuittaus, roskakori, pitkän painalluksen valikko (Emil 21.10.2026) | 2 versiota | Odottaa |

Kohta 17 (luontihetki) on jo nyt käytössä, joten työtä ei tarvita. Kohta 24 (”kierros”) jää ennalleen. Molemmat poistetaan TILA:n avoimista kysymyksistä vaiheessa 1. Myös välit päivän muistiinpanoissa on ratkaistu (Emil: ”Juu!”).

### Vaihe 1: pienet termi- ja ajankohtakorjaukset

- **9.** Termisana löytyy osana mistä kohdasta sanaa tahansa (”koir” → koirien, kotikoira). Tavuviivasääntö poistuu. Sama koskee palikoiden nimiä automaattitermeinä. Isot kirjaimet ja välimerkit eivät edelleenkään vaikuta.
- **10.** Muistiinpanon kirjoitusikkunassa termin laukaiseva sana alleviivataan heti välilyönnin jälkeen (eri tyyli kuin ajankohdan korostus). Lista ajankohtien alla kertoo myös termiosumat: *sana → termi*.
- **18.** ma, ti, ke, to, pe, la, su tunnistetaan vain silloin, kun ne ovat välilyönnillä kiinni muussa tunnistetussa ajankohdan osassa (”pe klo13-16”, ”vk43 ti”). Yksinään ne eivät tunnistu.
- **19.** ”klo 14.” lauseen lopussa tunnistuu.
- TILA: kohdat 17, 24 ja välit pois avoimista kysymyksistä.
- **Valmis, kun:** testit läpi, uudet testit kohdille 9, 10, 18 ja 19, julkaistu.
- **Kysymykset ennen vaihetta:** ei ole.

### Vaihe 2: arvojärjestys ja Hoidettavat

- Ennen koodia: allianssiesimerkki käydään läpi mallin kanssa.
- Opetukseen tila *Järjestys*: palikka ja sitä vähemmän tärkeät. Ilman sääntöä ratkaisee rivijärjestys.
- Kehän tarkistus napautushetkellä (järjestys ja kaikki tarvitaan -ehdot yhdessä): napautus hylätään, nappi värähtää ja ilmoitus näyttää ketjun (*Ei käy: A → B → C*).
- Puun asetus *Lopuksi: Polku / Hoidettavat*. Hoidettavat: valitsematta jääneet tärkeysjärjestyksessä, ylimpänä *Seuraavaksi*. Kova ehto nostaa vaaditun ensin (*jotta A*). Muistiinpanoon tallentuvat sekä kunnossa olleet että hoidettavat.
- **Kysymykset ennen vaihetta (suositus ensin):**
  1. Kirjoitanko allianssiesimerkin valmiiksi, jota korjaat (suositus), vai kirjoitatko sen itse?
  2. Opetetaanko Järjestys-tilassa ”nämä ovat vähemmän tärkeitä” (suositus, sama suunta kuin ylhäältä alas) vai ”nämä ovat tärkeämpiä”?
  3. Näytetäänkö Hoidettavat koko listana, jossa *Seuraavaksi* on korostettuna (suositus), vai vain yksi kortti kerrallaan?

### Vaihe 3: muistiasetus

- Puun asetus *Muisti: vain seuraava askel / kaikki mukana*.
- **Kysymys:** onko oletus uudessa puussa *vain seuraava* (suositus, nykyinen käytös) vai *kaikki mukana*?

### Vaihe 4: termilohkot ja Liitä termiin

- `=Nimi:`, sanat seuraavilta riveiltä, `!` = poissulkeva, tyhjä rivi päättää. Lohkossa on taustasävy, loppuviiva ja ↵ rivin lopussa. `//`-rivi näkyy väliotsikkona.
- Muistiinpanosta maalattu sana → *Liitä termiin* kentän alla → valitse termi tai tee uusi.
- **Kysymykset:**
  1. Minne Liitä termiin kirjoittaa sanan: termin ikkunaan (suositus tässä vaiheessa) vai suoraan puun tekstiin (vasta vaiheessa 6)?
  2. Saako lohko viitata termiin, jota ei ole palikkana eikä omana terminä, jolloin se luo uuden oman termin (suositus: kyllä)?

### Vaihe 5: apukysymykset muistiinpanosta

- Termin valinta *Nousee esiin muistiinpanosta*, apukysymyksillä oletuksena päällä. Rivi *N apukysymystä* näkyy vain osumista. Kortit tarjoavat vastauksen tai *Kyllä*. Valmis lisää loppuun ”▸ Kysymys” ja vastauksen. Uudelleen avattaessa sama kohta päivittyy.
- **Kysymys:** kelpaako ”▸ Kysymys” -muoto (suositus) vai haluatko esimerkiksi lihavoidun otsikon?

### Vaihe 6: teksti ↔ appi kaksisuuntaisesti

- Säännöt, ehdot, järjestys ja termisanat tekstissä lohkoina. Napauttamalla tehty kirjoittuu lohkoon, ja tekstiin kirjoitettu toimii appissa. Appi koskee vain `=`-lohkoihin. Nimen vaihto tekstissä vaihtaa myös säännöt (25). Vanhat säännöt siirtyvät tekstiin automaattisesti.
- **Muistutus:** ota varmuuskopio ennen tätä vaihetta, koska tallennusmuoto muuttuu.
- **Kysymykset:**
  1. Sääntöjen tekstimuoto. Suositus: `=Koira avaa:`, `=Koira sulkee:`, `=Koira vaatii kaikki:` / `=Koira vaatii yhden:`, `=Koira ennen:`, ja kohteet riveittäin. Vaihtoehto: kaikki säännöt palikan omassa `=Koira:`-lohkossa alaotsikoin.
  2. Minne lohkot kirjoitetaan: palikan lohko omalla paikallaan ja uudet loppuun (suositus) vai kaikki säännöt yhteen osioon tekstin loppuun?
  3. Yhteiset termisanat omaan *Termit tekstinä* -kenttään (suositus) vai jokaisen puun tekstiin?

### Vaihe 7: kalenteri

- Pohjana `SUUNNITELMA-kalenteri.md`. Muutokset: päivänäkymän aikajana ja viikkonauha (21). Raahaus muuttaa tekstissä olevan kellonajan (22), ja kenttä tulee vain, jos tekstissä ei ole aikaa.
- 7a: aikajana, raahaus ja koon muutos (valmis 1.17). 7b: ajattomien raahaus aikajanalle ja takaisin, siirto toiselle päivälle viikkonauhan päälle, alaotsikkotermit ja *Näytä kalenterissa*.
- Emil vastasi 21.10.2026: 350 ms, 15 min, termin valinta *Näytä kalenterissa*.
- **Kysymykset:**
  1. Pitkän painalluksen kesto 350 ms (suositus) vai lyhyempi?
  2. Siirto 15 minuutin askelin (suositus) vai 5 minuutin?
  3. Mitkä termit näytetään alaotsikkoina: termin valinta *Näytä kalenterissa* (suositus) vai kaikki osuvat?
- Raahaus vaatii iPhone-kokeilun ennen kuin 7 kuitataan.

### Vaihe 8: tärkeysjärjestys, kuittaus, roskakori ja pitkän painalluksen valikko (Emilin toiveet 21.10.2026)

- **Tärkeysjärjestys kaikille palikoille ja termeille (Emil: ”pian”, ”sama järjestys kuin luettelossa”).** Termit-ikkunan luettelon järjestys on tärkeysjärjestys, ja sitä muutetaan siirtämällä rivejä. Yksi yhteinen järjestys kaikille puille.
- **Muistiinpanot tärkeysjärjestykseen:** järjestysvaihtoehto *Tärkeys*. Muistiinpano saa tärkeimmän termin paikan, johon se osuu. Tärkein voittaa.
- **Aikatermit:** *Myöhässä*, *Tänään* ja muut automaattiset termit ovat luettelossa ja järjestettävissä. Muistiinpano saa ne itsestään ajankohtansa perusteella.
- **Kuittaus:** muistiinpano siirtyy *Kuitatut*-arkistoon, joka toimii samoin kuin avoimet. Kuittauksen voi perua.
- **Poisto ilman varmistusta:** poistettu menee roskakoriin 30 päiväksi, ja sen voi palauttaa. Roskakori on Asetuksissa. Vanhemmat poistuvat itsestään.
- **Pitkä painallus muistiinpanokorttiin** avaa valikon: *Kuittaa*, *Liitä termiin*, *Poista*.
- **Kysymykset:**
  1. Mitä tehdään muistiinpanoille, jotka eivät osu yhteenkään termiin? Suositus: listan loppuun, uusin ensin. Vaihtoehto: alkuun.
  2. Mitkä aikatermit otetaan mukaan? Suositus: *Myöhässä*, *Tänään*, *Huomenna* ja *Tällä viikolla*, kukin vain tarkimpana. Vaihtoehto: vain Myöhässä ja Tänään.
  3. Mitä *Liitä termiin* valikosta tekee? Suositus: näyttää termit siruina, ja napautus lisää termin nimen muistiinpanon loppuun omalle rivilleen (`#termi`-tyyliin), jolloin se tunnistuu. Vaihtoehto: termi tallennetaan muistiinpanoon piilotettuna, eikä tekstiin tule mitään.
