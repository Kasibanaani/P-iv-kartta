# F27 Teksti: viitteet ilman sulkuja, tekstin tulkinta ja tagit

17.10.2026. **Emilin idea**, tekoälyn jäsentämä keskustelun pohjalta. Emil hyväksyi järjestyksen 17.10.2026 (”Joo toi on ok”). **Ei toteutettu.** Kohdat 1–2 ovat jonossa (`TILA.md`, *Jono*); kohdat 3–4 vasta F08:n ja F25:n jälkeen erillisellä päätöksellä. Merkinnät: *Emilin idea* = hänen sanomansa, *ehdotus* = tekoälyn suunnitteluratkaisu, *avoin* = päätetään ennen rakentamista. Lue ensin [periaatteet](00-periaatteet.md), [03 F15](03-kayttopinta.md) ja [05 F20](05-aika-media-ja-liitannat.md).

## Idea (Emilin idea, tiivistetty)

- Tekstiin liitetään rajattu joukko monivalintoja (tageja), jotka Emil napauttaa todeksi. Appi oppisi, mitkä sanat liittyvät mihinkin tagiin, ja ehdottaisi tageja uuteen tekstiin. Tekoäly voisi esiluokitella paljon tekstiä (esim. Notionista). Tagit osallistuisivat oman elämän tilastointiin.
- Tekstilaatikko, joka ymmärtää tekstin tietyllä tavalla: esim. tekstiparit erottimella (oppimiskortit), rivinvaihto = luettelo.
- ”Printteri”: teksti tulostaa ulos palikoita tai listan. `yöuni: 8` → palikka, jonka nimi ja viite on *yöuni* ja arvo 8 (tyhjä, jos arvoa ei ole).
- Viittaus ilman käppyräsulkuja kohdissa, joissa sana oletetaan viitteeksi.
- Uusi, olematon viite luo palikan.
- Oma kieli: tekstilaatikolle itse määritellyt säännöt (ensimmäinen sana = tietyn palikkalajin nimi, erotinmerkit, kenttien määrä), liitettynä palikkalajeihin. Tavoite: sisältöä voi tuottaa appin ulkopuolella (tekoäly, oma sanakirjasto) ja liittää sisään.

## Nykytila (tarkistettu koodista 17.10.2026, Appi-appi 19)

- Kaavat käyttävät jo lyhyttä viitettä ilman sulkuja (`uni > 7`; moottori, osio *Viite: lyhyt nimi kaavoihin*). Sulkuja `{nimi}` tarvitaan vain tekstipohjissa.
- Viitevirheet-listassa on jo ”uusi kohde” katkenneelle viitteelle (Appi-appi 11).
- Kopioi/liitä siirtää logiikan palikoita JSON-muodossa (versio 6.10); tekstirivien tulkintaa ei ole.
- Tietotaulukko, Toistin, Rivi ja Valitse rivi ovat olemassa, joten korttipakka syntyy taulukosta.
- Valintaruutu on yksittäinen kyllä/ei; monivalintaa rajatusta listasta ei ole.

## 1. Viite-ehdotukset ja palikan luonti nimestä (ehdotus, jonossa)

- **Ehdotusrivi:** tekstipohjaa tai kaavaa kirjoitettaessa nimi, joka vastaa palikan viitettä tai nimeä, näkyy ehdotuksena näppäimistön yläpuolella (kuten puhelimen sanaehdotus). Napautus muuttaa sanan viitteeksi (`{uni}` tekstipohjassa, `uni` kaavassa). Kirjoitettua tekstiä ei muuteta itsestään.
- **Kentät, jotka olettavat viitteen:** kaava ja toiminnon arvo ovat jo tällaisia. Tekstipohjassa oletus pysyy tekstinä, koska muuten tavallinen sana muuttuisi yllättäen viitteeksi.
- **Luo palikka:** kaavassa tuntematon nimi saa napin *Luo Arvo ”yöuni”*. Uusi Arvo saa nimen ja viitteen kirjoitetusta sanasta, arvo tyhjä. Sama vaihtoehto Viitevirheiden ”uusi kohde” -valintaan.
- **Kokeet:** ehdotus näkyy ja napautus tekee viitteen; tavallinen sana ei muutu; luotu palikka näkyy logiikassa ja kaava toimii heti; varattu sana (`tänään`, `nyt`) ei tarjoa luontia; kumoa poistaa luodun palikan. Puhelinleveydet 390 ja 320 px.

## 2. Tulkki eli printteri (ehdotus, jonossa; tehdään yhdessä F20:n ensimmäisen vaiheen kanssa)

**Ajatus:** sääntö on kuvio, esim. `{nimi}: {arvo}` tai `{etu} = {taka}`. Jokainen rivi luetaan kuvion mukaan. Tekstipohja (F15) tuottaa tekstiä kuviosta; tulkki lukee tekstiä samalla kuviolla. Erotin on se, mitä kuviossa kenttien välissä lukee. Kuvion kenttänimet ovat tulkin omia, joten päällekkäisyys muiden nimien kanssa ei haittaa.

**Kohteet:**
- **Taulukon riveiksi:** kuvion kentät = sarakkeet, rivi = rivi. Korttipakka: taulukko *etu*, *taka* + Toistin + Valitse rivi. Tämä on F20:n ”liimattu taulukko” omalla erottimella; CSV on sama tulkki, jonka erotin on pilkku tai sarkain.
- **Palikoiksi:** `yöuni: 8` → Arvo, nimi ja viite *yöuni*, arvo 8. Jos viite on jo olemassa, arvo päivittyy eikä tule tuplaa. Kuvion ensimmäinen kenttä voi olla *laji* (Emilin idea: ensimmäinen sana = palikkalaji), aluksi vain Arvo, Muisti ja Teksti.

**Käyttö:** tulkki on rakentajan työkalu (logiikan paletti tai taulukon ikkuna): liitä teksti, valitse kuvio ja kohde, katso esikatselu (lisätyt, muutetut, virheelliset rivit), hyväksy. Kertaluontoinen tulostus on oletus. *Avoin:* elävä tulkinta käyttöpinnan tekstikentästä (teksti muuttuu → rivit muuttuvat) myöhempänä vaiheena.

**Rajaus (ehdotus):** ei omaa kielioppia, merkkien uudelleenmäärittelyä tai sisäkkäisiä rakenteita. Kuvio + erotin + kohde kattaa kortit, listat ja peruspalikat ja pysyy luettavana. Tekoäly tuottaa liitettävää tekstiä keskustelussa; appi ei kutsu tekoälyä eikä repoon tule avaimia.

**Kokeet:** kortit `=`-erottimella; `yöuni: 8` ja `yöuni:` (tyhjä arvo); olemassa olevan viitteen päivitys; rivi ilman erotinta näkyy virheenä esikatselussa; tyhjät rivit ohitetaan; erotin arvon sisällä (vain ensimmäinen jakaa); desimaalipilkku; 200 riviä; kumoa.

## 3. Tagit-palikka (ehdotus, vasta F08:n jälkeen)

Käyttöpalikka: rajattu lista napautettavia valintoja (monivalinta) tekstin rinnalla. Tallennus taulukon riville kyllä/ei-sarakkeina, jolloin ne ovat suoraan F25:n tekijöitä. Notionin esiluokittelu: tekoäly luokittelee keskustelussa, tulos liitetään tulkilla taulukkoon. Henkilökohtainen teksti ei tule julkiseen repoon.

## 4. Sanaoppi (ehdotus, kokeena F25:n vieressä)

Ei semantiikkaa vaan sanalaskentaa: kuinka usein tagi on totta, kun teksti sisältää sanan. Suomen taivutuksen vuoksi sanoja verrataan alkuosan perusteella (esim. 5 ensimmäistä kirjainta). Ehdotukset näytetään havaintomäärän kanssa, eikä niitä merkitä todeksi itsestään. Suuntaa antava vielä parin sadan tekstin jälkeenkin; hauska kokeilu, ei luotettava luokittelija.

## 5. Suomenkielinen sääntö (idea, F30)

Emilin idea 17.10.: sääntö suomeksi (”jos …, niin …”) kirjoitustapana, joka rakentaa tavalliset palikat. Sanasto on sama kuin tulkin kuviot ja sanaoppi. Suunnitelma ja avoin kysymys: [15-logiikkapinta.md, kohta 6](15-logiikkapinta.md).

## Avoimet

- Missä tulkki asuu: logiikan paletissa omana työkalunaan vai taulukon ikkunassa? (ehdotus: molemmista sama ikkuna)
- Tallennetaanko käytetyt kuviot projektiin uudelleenkäyttöä varten? (ehdotus: kyllä, nimetty kuvio)
