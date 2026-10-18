# F39 Viittaustapa: etumerkki käppyräsulkujen tilalle

> ⏸ **18.10.2026: muutosehdotus odottaa Emilin päätöstä,** ks. [25 Joukot tageina, viite @:lla ja kaavan sulut](25-joukot-tageina-ja-kaava.md). Älä rakenna tätä ennen päätöstä.

18.10.2026 (Suomen aikaa). **Emilin toive** (viestit 18.10. klo 2.17 ja 2.19): tekstiin viitataan nyt `{viite}`-muodossa, ja käppyräsulut ovat ikäviä kirjoittaa (Macin suomalaisessa näppäimistössä `{` = Shift+Alt+8, ja merkki tarvitaan molemmin puolin). Toive: yksi helposti kirjoitettava etumerkki aloittaa viitteen, ja viite päättyy itsestään (välilyönti, rivinvaihto). Viittaustapa valittavaksi asetuksista, ja vanhat viitteet muuttuvat uudelle tavalle itsestään. Kysymys: haittaako etumerkki kaavassa, kun viitteen perässä jatkuu kaava?

Suunnittelija kirjoitti tämän; **ei toteutettu**. Jonon kohta 12f (`TILA.md`).

## 1. Miten se toimii nyt (koodista tarkistettu, Appi-appi 47)

- **Tallennus on jo tunnisteina.** Tekstipohjat (`tx`, Arvon `v`, Haun ja Monihaaran rivit, VALITSE `qv`, Muistin alkuarvo, Ilmesty-efektin teksti) tallentavat viitteen muodossa `{#b12}` tai `{#b12.ominaisuus}` (`TPLRE`, lohko *Mallipohjat*, ~2723). `{viite}` on vain muokkausnäkymä: `toNames` muuttaa tunnisteet näkyviksi, `toIds` takaisin. Ratkeamaton `{nimi}` jää tekstiin ja korjautuu, kun palikka tehdään (`repair` → `heal`, ~2581).
- **Muokatessa näytetään nimi tai viite:** `toNames` näyttää `{Nimi}` (voi sisältää välilyöntejä ja isoja kirjaimia), ellei nimi ole toisen palikan viite; silloin `{viite}`. Ominaisuuden kanssa aina `{viite.ominaisuus}`. Poistettu kohde näkyy `{⚠viite}`.
- **Viitteen merkit:** `VTRE = /^[a-zåäö_][a-z0-9åäö_]*$/`: pienet kirjaimet (myös å, ä, ö), numerot ja `_`, ei ala numerolla, ei välilyöntejä eikä pisteitä. Ominaisuuspolku jatkuu pisteellä (`TPROP`: `pelaaja.x`, `kalenteri.valittu`, suunnitelmissa `jäsen.y`, `tapahtuma.voima`).
- **Kaavassa ei tarvita merkkiä lainkaan.** Kaava kirjoitetaan jo paljain viittein (`uni > 7`, `pisteet + 1`, `pelaaja.x`); sulut `{uni}` ovat sallittu vaihtoehto (`kaavaToIds`, ~2768). Viite päättyy välilyöntiin, laskumerkkiin tai sulkuun. Siksi Emilin kaavahuoli ei koske nykyistä kaavaa, eikä etumerkki muuta sitä.
- **Viite-ehdotukset** (F27, Appi-appi 37, `tplSug` ~8238): tekstikentässä `{` tai vähintään kaksi kirjainta nimen alkua tuo ehdotukset, ja valinta kirjoittaa `{viite}`. *＋ Viittaus* -nappi (~8594) lisää kohdistimen kohdalle.
- **Muut kohdat, joissa viite näkyy käyttäjälle:** toiminnon kuvaus selkokielellä (`descAct`, ~4743), Miksi? (~4786), logiikan palikoiden tekstit (~6324, ~6352), ketjun askeleet (~8031). Kaikki kulkevat `toNames`in kautta.
- **Suunnitteilla:** 12b *Tee näkymään* kirjoittaa Laatikon tekstiksi `{#id}` (sisäinen muoto, ei riipu tästä), 12c näyttää lapussa `{viite}`, 12d avaa suoran kirjoituksen, jossa `{` tuo ehdotukset.

## 2. Ehdotus

### 2.1 Viittaustapa on rakentajan selainasetus

Asetuksiin (sama paikka kuin rakennusympäristön ilme, lohko `<script id="appearance">`, tallennus selaimeen kuten teema) valinta **Viittaus tekstissä**:

| Tapa | Kirjoitetaan | Näppäimet (suomalainen asettelu) |
| --- | --- | --- |
| `#` (oletus, Emilin päätös 18.10.) | `Unta #uni h` | Shift+3 sekä Macissa että PC:ssä |
| `@` | `Unta @uni h` | Alt+2 (Mac), AltGr+2 (PC) |
| `§` | `Unta §uni h` | Yksi nappi (Escin alla) vain suomalaisella ISO-näppäimistöllä; puhelimessa hankala |
| `{ }` | `Unta {uni} h` | Nykyinen tapa |

- **Miksi selainasetus eikä projektin:** tallennus on tunnisteina, joten tapa vaikuttaa vain siihen, miltä teksti näyttää ja miten se kirjoitetaan muokatessa. Se koskee kaikkia projekteja kuten teema. Projektitiedosto, master-tiedot ja tekoälyn kirjoittamat projektit eivät muutu.
- **Vanhat viitteet muuttuvat itsestään:** vaihto näyttää heti kaikki tekstit uudella tavalla, koska `toNames` piirtää ne tunnisteista. Tallennusmuoto ei muutu, eikä varmuuskopiota tarvita.
- **`{viite}` ymmärretään aina** kirjoitettaessa ja tuotaessa, valitusta tavasta riippumatta: vanhat ohjeet, liitetty teksti ja tekoälyn kirjoittama `{nimi}` toimivat, ja käppyräsuluilla voi liimata viitteen sanaan (`{uni}a`).

### 2.2 Etumerkkiviitteen säännöt (tekstipohjat)

1. **Alku:** etumerkki aloittaa viitteen vain rivin alussa tai merkin jälkeen, joka ei ole kirjain, numero tai `_`. Siksi `emil@posti.fi`, `C#` ja `kohta§3` eivät muutu.
2. **Viite:** etumerkin jälkeen pisin `[A-Za-zÅÄÖåäö_][A-Za-z0-9ÅÄÖåäö_]*`, haku kirjainkoosta riippumatta (`#Uni` = `uni`, joten virkkeen alku toimii).
3. **Loppu:** ensimmäinen merkki, joka ei kuulu viitteeseen: välilyönti, rivinvaihto, pilkku, kaksoispiste, puolipiste, `!`, `?`, sulut, lainausmerkit, viiva, tekstin loppu. Taivutus kaksoispisteellä: `#uni:n`, tai liimaus `{uni}a`.
4. **Piste:** jatkaa viitettä vain, jos sen perässä on kirjain ja yhdistelmä on palikan tunnettu ominaisuus (ominaisuusrekisteri, sama tarkistus kuin `pathConv`). Muuten piste on välimerkki: `Sait #pisteet.` ja `#pelaaja.x` toimivat molemmat.
5. **Tuntematon sana** (`#kesä`, eikä palikkaa jonka viite on `kesä`) jää tavalliseksi tekstiksi, eikä sitä tallenneta odottavaksi viitteeksi (ei `heal`-korjausta myöhemmin, jottei aihetunniste muutu arvoksi yllättäen). Kenttä näyttää ehdotusrivillä *#kesä: ei palikkaa* ja napin *Luo Arvo* (F27:n `luoArvo`). Odottava viite kirjoitetaan tarvittaessa `{kesä}`.
6. **Etumerkki tekstinä:** tuplana (`##uni` näkyy käytössä `#uni`). Tarvitaan vain, kun perässä on olemassa oleva viite.
7. **Poistettu kohde:** näkyy `#⚠viite` ja palaa tallennettaessa samaan tunnisteeseen kuten nyt `{⚠viite}`.
8. **Näyttö muokatessa:** etumerkkitavalla näytetään aina **viite** (`#uni`), ei nimeä, koska nimessä voi olla välilyöntejä. `{ }`-tavalla kuten nyt.

### 2.3 Kaava

Ei muutosta kirjoitustapaan: viitteet paljaina kuten nyt. Lisäksi kaava hyväksyy valitun etumerkin viitteen edessä ja ohittaa sen (`#uni + 3` = `uni + 3`), jotta tekstistä tuttu tapa ei anna virhettä ”tuntematon merkki”. Kaava näytetään aina paljain viittein.

### 2.4 Ehdotukset ja kirjoitus

- `tplSug`: valittu etumerkki (tai `{`) avaa ehdotukset; valinta kirjoittaa `#uni` (perään ei lisätä mitään). Enter tai Tab hyväksyy ensimmäisen ehdotuksen, Esc sulkee.
- *＋ Viittaus* -nappi lisää valitulla tavalla.
- 12c (lappu) ja 12d (suora kirjoitus) käyttävät samaa apufunktiota, joka antaa viitteen näyttömuodon. Kumpi tahansa rakennetaan ensin, myöhempi ottaa apufunktion käyttöön; 12d:n ”`{` tuo ehdotukset” tarkoittaa ”valittu etumerkki tai `{` tuo ehdotukset”.

### 2.5 Toteutuksen paikka

- Moottori (`KK`): `toNames(P,s,tapa)` ja `toIds(P,s,tapa)` saavat valinnaisen tavan (oletus `{ }`, joten testit ja viety appi ennallaan); etumerkkijäsennys omaan funktioon. Moottori ei lue selaimen asetusta.
- UI: yksi apu `refStyle()` lukee asetuksen ja välittää sen kaikkiin `KK.toNames`/`KK.toIds`-kutsuihin (lista kohdassa 1) ja `tplSug`iin.
- Ei tallennusmuodon muutosta, ei versionvaihtoa (`VER` pysyy).

## 3. Huonot puolet ja riskit

- Taivutus vaatii kaksoispisteen tai sulut (`#uni:n`), suomessa luonteva mutta opittava.
- Tekstissä aidosti käytetty `#sana`, jonka nimistä palikka on olemassa, muuttuu viitteeksi; tuplamerkki kiertää. Emilin omassa käytössä harvinainen.
- `§` puuttuu yhdysvaltalaisesta asettelusta ja on puhelimessa piilossa, siksi ei oletukseksi.
- Kaksi tapaa ymmärretään yhtä aikaa (etumerkki ja `{ }`): pieni lisä jäsennykseen, mutta estää vanhojen ohjeiden ja tuotujen tekstien rikkoutumisen.

## 4. Linjakkuus

- A9 (viite `{#id}` sisäisesti, kestää uudelleennimeämisen) pysyy: muuttuu vain näyttö- ja kirjoitusmuoto.
- Ei uutta palikkaa, ei erikoispalikkaa, ei poikkeusta palikkasääntöihin. Asetus on rakennusympäristön, ei projektin.
- Kaava ja teksti lähenevät: kummassakin viite kirjoitetaan ilman sulkevaa merkkiä.

## 5. Testit ja manuaali

- Moottoritesti: jäsennys sääntöjen 1–7 mukaan (`emil@x.fi`, `C#`, `#Uni`, `#uni:n`, `Sait #pisteet.`, `#pelaaja.x`, `##uni`, `#kesä` tuntematon, `#⚠poistettu`, sekaisin `{uni}` ja `#uni`), edestakaisin `toIds(toNames(x)) = x` jokaisella tavalla.
- Kaava: `#uni + 3` = `uni + 3`.
- Selaintesti 1440 ja 1280 px: tavan vaihto Asetuksista näyttää olemassa olevan tekstin uudella tavalla, ehdotukset avautuvat etumerkistä, valinta säilyy uudelleenlatauksessa, vanha projekti ei muutu tiedostona.
- Manuaali: luku 3 (tekstin viitteet), luku 6 (kaava hyväksyy etumerkin), luku 2 (Asetukset), hakemisto ja versio.

## 6. Päätös

- **Oletusetumerkki `#`** (Emil valitsi kortilta 18.10. klo 2.22). `@`, `§` ja `{ }` valittavissa asetuksista.
