# F44 Päätöspuu: napit nuolilla, seuraava taso näkyviin

19.10.2026. **Emilin ajatus** (viesti 19.10. klo 10.22 Suomen aikaa): logiikassa nopea tapa tehdä päätöspuu. Tekstipalikat ovat käyttäjäpuolella painettavia nappeja; nuoli tarkoittaa vain ”tämän painallus tuo näkyviin seuraavat”. Nuoli kiinni palikan kylkeen ilman pistokkeen etsimistä, mihin suuntaan tahansa tai molempiin, joten silmukat ja palaavat haarat onnistuvat ilman kopioita. Nuoli voi mennä myös sisempään ikkunaan, jossa on kysymys, vaihtoehdot ja asetus montako valitaan; kun valinta on tehty (tai *Valmis* painettu), puu etenee. Napit ovat tavallisia palikoita: tekstin tilalle viite, lisää logiikkaa vapaasti. Käyttäjätilassa (myös puhelimella) näkyvät napit asettuvat siististi listaksi itsestään. Tekoälyn jäsentämä suunnitelma. Merkinnät: *ehdotus* = tekoälyn suositus; ⏸ = odottaa Emilin päätöstä. **Hyväksytty 19.10.2026 klo 11.01 Suomen aikaa (vaiheet 1–4, jonon kärkeen), toteutettu Appi-appi 88.** Toteuma ja poikkeamat: kohta 9 ja `MUUTOKSET.md`. [Hakemisto](../SUUNNITELMA.md), [aukot ja paikat](27-aukot-ja-paikat.md), [logiikasta näkymään](22-logiikasta-nakymaan.md).

## 1. Miten se toimii nyt (manuaalista tarkistettu, Appi-appi 86)

- **Puu onnistuu, mutta hitaasti.** Tapa 1: Muisti *taso*, jokaisen napin *painettu* → Aseta arvo *taso*, ja jokaiselle napille *näkyy kun* -kaava (`taso = "A"`). Tapa 2: Ketju + Ehto/Monta haaraa (luku 5, resepti *Haarautuva kysymys*), joka antaa vastauksen mutta ei tuo nappeja näkyviin. Molemmissa yksi haara = 2–3 palikkaa ja kaava. Näkyvyyttä ei voi asettaa toiminnolla (K10:n ehdotus, ⏸).
- **Pistokkeen etsiminen on jo osin poissa:** nuolen voi pudottaa palikan päälle, jolloin appi valitsee kohdan (luku 4); *Pistokkeet piilossa* piilottaa pisteet. Nuoli kulkee silti aina oikealta vasemmalle eikä ole kaksisuuntainen.
- **Vaihtoehtoryhmä on jo:** Ikkunan VAIN YKSI / TÄSMÄLLEEN / VÄHINTÄÄN laskee valinnat, ja *Pikaluonti → Vaihtoehtoryhmä…* tekee napit ja ikkunan kerralla. Tämä on valmis pohja kohdan 3 sisemmälle ikkunalle.
- **Siisti lista puuttuu:** vapaasti aseteltu sisältö ei rivity uudelleen (suunnitelma 27 kohta 6). Piilotettu palikka jättää aukon. Allekkain asettuu vain Toistimen kortti.

## 2. Ehdotus: Ikkunan uusi tapa *PÄÄTÖSPUU*

Ei uutta palikkaa. Ikkuna on jo yleinen sulku, jonka tapa valitaan (JA, TAI, VAIN YKSI…, jatkoina JOS ja KUN); Emilin toive ”yleinen ikkuna, jonka toiminnon voi valita” on siis jo nykytila. Päätöspuu on yksi tapa lisää: logiikan paletti → *Ikkunat* → **PÄÄTÖSPUU**.

- **Jäsenet:** ikkunan sisällä olevat napautettavat näkymäpalikat (Painike, Muoto, Teksti napautettavana) ja sisemmät ikkunat. Jäsenet ovat tavallisia palikoita: teksti, `{viite}`, kaava, väri ja muu logiikka toimivat kuten aina.
- **Nuoli jäsenestä jäseneen = siirtymä.** Jäsenen napautus näyttää ne jäsenet, joihin siitä lähtee nuoli, ja piilottaa muut. Nuoli kiinnittyy kylkeen (lähin reuna), ei pistokkeeseen; paneelissa **Suunta: → / ← / ↔**. Silmukka ja paluu (”takaisin alkuun”) ovat pelkkiä nuolia.
- **Alku:** jäsenet, joihin ei tule nuolta päätöspuun sisältä. Jos kaikkiin tulee (silmukka), ensimmäinen tehty on alku; paneelissa *Aloita tästä*.
- **Näkyvyys yhdistyy:** jäsen näkyy, kun päätöspuu näyttää sen **ja** sen oma *näkyy kun* pätee (sama sääntö kuin monella nuolella nyt).
- **Ominaisuudet:** `vaihe` (nykyinen jäsen), `polku` (valinnat tekstinä, esim. `Väsynyt › Lepää`), `askelia`. Ohjattavat toiminnolla Aseta arvo: `vaihe`; lisäksi Mitä muutetaan **alkuun** ja **takaisin**.
- **Tapahtumat ulos:** *valittu* (jokainen napautus, `tapahtuma.valinta`) ja *loppu* (jäsen, josta ei lähde nuolta). Näistä ketjut ja Ketjun tulos jatkavat tavalliseen tapaan.
- **Käyttötieto:** `vaihe` ja `polku` tallentuvat kuten Muisti ja nollautuvat *Tyhjennä käyttötiedot* -napista.

## 3. Sisempi ikkuna kysymykseksi

- Nuoli päätöspuun jäsenestä **sisempään ikkunaan** (tapa VAIN YKSI, TÄSMÄLLEEN, VÄHINTÄÄN tai ENINTÄÄN) näyttää koko ikkunan sisällön: kysymys-Teksti ja vaihtoehdot.
- **Eteneminen:** VAIN YKSI ja TÄSMÄLLEEN etenevät itsestään, kun valintoja on *Montako*. VÄHINTÄÄN ja ENINTÄÄN tarvitsevat **Valmis**-napin: ikkunaan tehdään sellainen valmiiksi (tavallinen Painike, jäsen), joka on harmaana, kunnes ikkunan tulos pätee.
- **Mihin seuraavaksi:** nuoli sisemmästä ikkunasta seuraavaan jäseneen. *Ehdotus myöhemmäksi:* eri vaihtoehdosta eri suuntaan (nuoli suoraan vaihtoehdosta), jolloin moni valinta etenee kaikkiin valittuihin suuntiin.
- Vaihtoehtojen pois sulkeminen on jo Ikkunan omaa (VAIN YKSI + *valinta poistaa muut*); mitään uutta sääntöä ei tarvita.

## 4. Nopea tekeminen logiikassa

- **＋ Uusi päätöspuu** (logiikan paletti → *Pikaluonti*, kuten näkymän *Vaihtoehtoryhmä…*): tekee PÄÄTÖSPUU-ikkunan logiikkaan ja sille oman Alueen näkymään (kohta 5).
- **Kirjoita ja Enter:** kaksoisnapautus tyhjään kohtaan päätöspuun sisällä → kirjoita teksti → syntyy Painike (näkymään puun Alueelle ja logiikkaan esiintymä). Enter tekee seuraavan saman tason napin, Tab napin, johon valmiiksi nuoli edellisestä. Tekstin tilalle saa kirjoittaa `@viite` kuten Tekstiin (suunnitelma 22).
- **Nuoli kylkeen:** päätöspuun sisällä veto mistä kohtaa palikkaa tahansa toisen palikan päälle. Valikkoa *Mihin kohtaan?* ei tule, koska nuolella on vain yksi merkitys. Muut nuolet (teksti, näkyy kun…) tehdään pistokkeista kuten nyt.
- **Kiire siistiksi:** ⌘D, ⌘C/⌘V ja ⇢ toimivat jäsenille sellaisenaan.

## 5. Siisti lista käyttäjätilassa

- **Alueen asettelu: Vapaa / Allekkain / Ruudukko** (uusi yleinen valinta Alueelle, ei vain päätöspuulle). Allekkain ja Ruudukko asettavat Alueen **näkyvät** palikat järjestyksessä, piilossa olevat eivät jätä aukkoa. Järjestys: päätöspuussa nuolten järjestys, muuten palikoiden järjestys Alueessa (vedä uuteen kohtaan).
- Yhdessä suunnitelman 27 Aukon kanssa (*pystyyn, leveys sovitettu*) tämä on puhelimen lista, joka vierii alas. Ilman Aukkoa Alue näkyy paikallaan ruudulla.
- *Ehdotus:* oletuksena edellinen taso piiloon ja polku pienenä rivinä yläreunaan (`polku`), josta napautus palaa.

## 6. Mitä ei tehdä

- Ei uutta nuolilajia koko logiikkaan: kylkinuoli ja ↔ vain PÄÄTÖSPUU-ikkunan sisällä. Jos Emil haluaa myöhemmin kylkinuolet kaikkialle, se on oma päätöksensä.
- Ei omaa vaihtoehtolistapalikkaa: napit ovat Painikkeita ja Muotoja, lista on Alueen asettelu.
- Logiikan muut nuolet eivät muutu. Emilin arvio, että nuolet jäävät jatkossa lähinnä tapahtumaketjuihin, ei vaadi tässä mitään.

## 7. Vaiheet (ehdotus)

| Vaihe | Sisältö | Tallennusmuoto |
|---|---|---|
| 1 | PÄÄTÖSPUU-tapa moottoriin: jäsenet, siirtymät, alku, näkyvyys, `vaihe`/`polku`, *valittu*/*loppu*, alkuun/takaisin | laajenee (tapa, nuolen suunta, käyttötieto) |
| 2 | Alueen asettelu Allekkain/Ruudukko (näkyvät vain) | laajenee (Alueen asettelu) |
| 3 | Sisempi ikkuna kysymyksenä, Valmis-nappi | ei (käyttää olemassa olevia) |
| 4 | Pikaluonti, kirjoita ja Enter/Tab, kylkinuoli, ↔ | ei |

Vaihe 2 on hyödyllinen yksinään ja sopii ennen suunnitelman 27 vaihetta 2 (Aukko).

## 8. Kysymykset (Emil vastasi 19.10.)

1. **Nimi:** *Päätöspuu* (ehdotus; ikkunan tapana *PÄÄTÖSPUU*). Logiikassa *ikkuna* on oikea sana, koska kyse on Ikkunasta; suunnitelma 27 vältti sanaa vain näkymän puolella. *Pikaikkuna* ei kerro, mitä se tekee.
2. **Edellinen taso:** piiloon ja polkurivi ylös (ehdotus) vai jää näkyviin harmaana?
3. **Sisempi ikkuna:** itse eteneminen VAIN YKSI/TÄSMÄLLEEN ja Valmis muille (ehdotus)?
4. **Asettelu Alueelle yleisenä** (ehdotus) vai vain päätöspuun Alueelle?
5. Hyväksytäänkö vaiheet 1–4 jonoon (kohta 36)?

**Vastaukset:** vaiheet hyväksytty ja jonon kärkeen. Emil kysyi, tarvitaanko tapaa ollenkaan, kun sisemmät JOS-ikkunat jo toimivat: ulompi ikkuna tarvitsee tavan (vain se tietää, mikä näkyy), sisemmät ovat tavallisia ikkunoita. Emilin lisäys: ikkunan sisällöksi joukko (`#ryhmä`), jonka jäsenet näkyvät omana rivinään ja ovat tasavertaisia sisään vedettyjen kanssa; tehty yleisenä Ikkunan valintana *Sisältö myös joukosta*. Kohdat 2–4: ehdotukset, paitsi polkuriviä ei tehty valmiiksi (Tekstillä `{nimi.polku}`).

## 9. Toteuma (Appi-appi 88)

- Kentät: `pus` (siirtymät), `pusa` (alussa näkyvät, valinnainen), `pual` (Alue uusille napeille), `sj` (joukko), Alueen `as`/`asl`/`asv`. Nimet eivät ole `sy`/`pal`, koska `sy` on jo syvyys (A13).
- Kylkinuoli toteutui pisteenä ◦ jäsenen kulmassa: palikan veto siirtää palikkaa, joten veto ”mistä kohtaa tahansa” ei ollut mahdollinen. Pudotus mihin kohtaan tahansa kohdetta, ei valikkoa.
- Alku: automaattinen sääntö ja paneelin *Alussa näkyvät*; pikaluonti valitsee ylimmän tason, jos silmukka vie johonkin niistä (muuten silmukka piilottaisi juuren).
- Listan järjestys on palikoiden paikka (ylhäältä alas, vasemmalta oikealle), ei siirtymien järjestys: yksinkertaisempi ja sama kaikille Alueille.
- Ei tehty: eri vaihtoehdosta eri suuntaan, valmis polkurivi.
- Appi-appi 89 (Emilin palaute): *Alkaa: aloitusnapista* + kohta *lopeta*, **＋ Aloitusnappi**, logiikan paletin **Painike** (näkymäpalikka logiikasta, puun sisään pudotettuna puun Alueelle).

## 10. Näkymän palikat logiikassa oletuksena (Emil hyväksyi 19.10., toteutettu Appi-appi 95)

Emilin toive: näkymän napit näkyisivät logiikassa valmiiksi, vähän sivussa, jonkinlaisina palikoina. Nyt näkymän palikka tulee logiikkaan vasta, kun se vedetään paletin listasta (esiintymä).
- *Ehdotus:* logiikan kanvaasin vasempaan reunaan sarake **Näkymässä** (näkymä kerrallaan): ne näkymän palikat, joilla ei vielä ole esiintymää, pieninä nimilappuina. Veto sarakkeesta kanvaasille tai ikkunaan tekee esiintymän. Ei tallennu (laskettu), ei muuta logiikkaa eikä vie tilaa, kun kaikki on käytössä. Kiinni/auki kuten paletti.
- *Vaihtoehto:* jokainen uusi näkymäpalikka saa esiintymän itse logiikan reunaan. Huono puoli: logiikka täyttyy palikoista, joilla ei ole logiikkaa (otsikot, kuvat, koristeet).
- Pistokkeet: piilotus on jo (logiikan vasen alakulma, ketjussa näkyvät aina). Kysymys: uusiin projekteihin piilossa oletuksena?
- *Toteutus (95):* sarake on logiikan **paletin ylin osio** *Näkymässä*, ei kanvaasin oma kaista: kaistana se vei 1280 px:n näytöllä paneelin kanssa kanvaasista kolmanneksen. Pistokkeet (Emil 19.10. *oletuksena aina piilossa*): oletus on *osoitettaessa*, eli piilossa, kunnes hiiri on palikan päällä tai palikka on valittu; *piilossa* ja *aina* valittavissa.

## Linjakkuus

- Uusi Ikkunan tapa, ei uusi palikka. Ikkunassa nuoli jäsenestä toiseen on jo erikoismerkityksinen (jäsen ei ole sisältöä), joten siirtymänuoli sopii samaan kohtaan.
- **Poikkeus, Emil hyväksyi 19.10. (PALIKKASAANNOT):** siirtymäpiste ◦ ja ↔ vain PÄÄTÖSPUU-ikkunassa. Perustelu: siellä nuolella on vain yksi merkitys.
- Alueen asettelu on yleinen palikan ominaisuus, ei päätöspuun erikoisuus.
- Sanat: *Päätöspuu*, *siirtymä*, *vaihe*, *polku*. Ei sanaa *haara*, joka on jo Ehdon ja Monta haaraa -palikoiden sana.
