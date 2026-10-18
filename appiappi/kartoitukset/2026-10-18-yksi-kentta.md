# Läpikäynti: yksi kenttä arvolle valikkojen sijaan (jonon 26 a)

18.10.2026, kaista A, versio 79. Vain löydökset ja ehdotukset, ei koodimuutoksia eikä tallennusmuodon muutosta. Lähde: `index.html` (`fValue`, `refOptions`, `fRefList` ja kaikki paneelien `<select>`-kohdat), Emilin viestilaput (Jana: ”yksi kenttä alulle ja yksi lopulle”; ”moni-ikkunaiset valikot, kun tekstin säännöt hoitavat saman”). Mittaus Node-moottorilla (synteettinen projekti).

**Lyhyesti:** löytyi yksi elävä vika (S1), 27 kenttäparia (ei 18 kuten lapussa luki: 18 riviä koodia, 27 kenttää), kuusi ehtokohtaa, joissa valitaan palikka valikosta tai tehdään erillinen Kaava-palikka (S3), yksi monivaiheinen kohde (Toiminnon Kohde + Mitä muutetaan, S4) ja kaksi luettelokenttää (S5). Muut valikot ovat pieniä kiinteitä joukkoja tai valitsevat palikan itsensä, ei arvoa; ne kannattaa pitää (osa P).

## S1. Vika: @viite kenttäparin tekstikentässä antaa tekstin, ei arvoa

Kenttäparin vasen kenttä hyväksyy jo nyt `@viitteen` (se on viitekenttä, `@` tuo ehdotukset), mutta moottori tekee siitä tekstipohjan (`lit` → `tpl`): arvo muotoillaan näytettäväksi tekstiksi. Mitattu (Lasku A + 1, A = Arvo 1234,5678):

| A-kenttä | Tulos | Pitäisi |
|---|---|---|
| valikosta *Alku* | 1235,5678 | ok |
| kirjoitettu `@alku` | 1235,57 | 1235,5678 (pyöristyi näyttömuotoon) |
| kirjoitettu `@alku + 5` | ”1234,57 + 51” (teksti) | 1240,5678 |
| `@pv` (päivämäärä 24.12.2026) + 5 | ”24.12.20265” (teksti) | 29.12.2026 |

Rakentaja näkee ehdotuksen, kirjoittaa viitteen ja saa hiljaa väärän luvun. Sama polku todennäköisesti Monta haaraa- ja Hakutaulukko-rivien rajoissa (`hr_i_a/b`, `mh_i_a/b`, tekstipohjia); **ei ajettu**. Korjaus kuuluu luontevasti 26 b:hen (kenttä = kaava). Jos 26 b viivästyy, pieni erillinen korjaus ilman tallennusmuotoa: kun kentässä on pelkkä yksi viite, `lit` palauttaa viitteen arvon sellaisenaan (kuten valikko).

## S2. Kenttäpari luku + ”tai palikka…” (`fValue`), 27 kenttää

| Palikka | Kentät |
|---|---|
| Jana | Alku, Loppu |
| Satunnaisluku | Pienin, Suurin |
| Käyrä | Syöte (x), x-väli alku/loppu, y-väli alku/loppu |
| Lasku | A, B |
| Vertailu | A, B |
| Päivämäärän osa | Päivämäärä |
| VALITSE | Arvo kun ehto pätee, Arvo muuten |
| Ketjun tulos | Tulos |
| Muutos ajassa | Alku, Loppu |
| Liike | Nopeus x, Nopeus y, Huippunopeus |
| Monta haaraa | Arvo, jota haarat vertaavat |
| Hakutaulukko | Arvo |
| Toiminto | Rivi (Valitse rivi, arvo), Uusi arvo, Määrä |

**Korvaaja (hyväksytty 26 b):** yksi kaavakenttä. Luku, teksti lainausmerkeissä tai ilman (kuten nyt), päivämäärä, `@viite`, `@palikka.ominaisuus`, `#joukko.kooste`, laskut ja `jos`. Nuoli voittaa kuten nyt. Vanha `{r:id}` näytetään `@viitteenä`.
**Valmis malli on jo appissa:** Toiminnon *Lisää rivi* -kentät (`kv`, luokka `kfx`) ovat kaavoja, ja moottorissa on `Ev.kaava(teksti)`. 26 b:n kannattaa käyttää samaa kenttää ja samaa tallennusta (kaava `{#id}`-muodossa), ei uutta.
**Huomio tekstille:** nyt kentässä `Valmis` on teksti, kaavassa `Valmis` olisi tuntematon viite. Ehdotus: jos kirjoitettu ei jäsenny kaavaksi eikä sisällä `@`/`#`-merkkiä, se on teksti kuten ennen (vanhat projektit ja tottumus säilyvät). Lainausmerkit tarvitaan vain, kun teksti sekoittuu laskuun.
**Varo:** Liikkeen Nopeus x/y lasketaan joka kuvassa; kaava ei saa olla hitaampi kuin nykyinen viite (keveystesti `selain_91` mittaa).

## S3. Ehto valitaan palikkana tai tehdään erillisellä Kaava-palikalla (6 kohtaa)

| Kohta | Nyt |
|---|---|
| Näkymäpalikan *Näkyy* | Aina / Kun pätee / Kun ei päde + palikkavalikko, tai ƒ-nappi tekee erillisen Kaava-palikan ja nuolen |
| *Harmaana* | kun pätee / kun ei päde -valikko + palikkavalikko + ƒ-nappi |
| *Vaihtoväri käytössä* | sama pari kuin Harmaana, ei ƒ-nappia |
| Ehto (ketju) | ”Onko tämä valittu?” palikkavalikko + ƒ Ehto kaavasta |
| Odota, kunnes | palikkavalikko + ƒ Ehto kaavasta |
| Monta haaraa, rivi ”palikka on valittu” | palikkavalikko |

Tämä on lapun ”moni-ikkunainen valikko” puhtaimmillaan: ehdon `pisteet > 3` saa vain tekemällä erillisen Kaava-palikan logiikkaan.
**Korvaaja:** valikon paikalle ehtokenttä (sama kaavakenttä), esim. `@vastattu`, `@pisteet > 3`, `#kysymykset.kaikki`. *Aina / Kun pätee / Kun ei päde* jää (kaavassa ei ole `ei`-sanaa; `x = ei` toimii, mutta segmentti on selkeämpi). ƒ-nappi jää vaihtoehdoksi, kun kaava halutaan näkyviin logiikkaan. Nuolet ja joukon säännöt voittavat kuten nyt.
**Tallennus:** laajenee (`nk`, `hk`, `vr` saavat kaavan `r`:n rinnalle; ketjun Ehto ja Odota kentän `o` rinnalle). Ei kuulu 26 b:n hyväksyttyyn `fValue`-osaan, joten **vaatii Emilin hyväksynnän**; suositus: samaan työhön, koska kenttä ja tallennus ovat samat.

## S4. Monivaiheinen kohde: Toiminto

*Aseta / Lisää / Aseta tila / Vaihda / Palauta*: Kohde-valikko (palikat, ”Tapahtuman jäsen”, joukot) → *Mitä muutetaan* -valikko (ominaisuudet) → Uusi arvo. Joukkoon/joukosta: lisäksi Joukko-valikko.
**Korvaaja (ehdotus):** yksi kohdekenttä `@pelaaja.x`, `@otsikko.läpinäkyvyys`, `#kolikot.näkyvyys`, `jäsen.x` (palikka = arvo, `.ominaisuus` = ominaisuus). Kirjoitus kertoo suoraan saman, minkä kaava jo osaa lukea, ja kaksi valikkoa poistuu. Valikko jää kentän ehdotuslistaksi.
**Huono puoli:** nykyinen valikko suodattaa vain kelpaavat kohteet (Lisää vain luvuille, Aseta tila vain kyllä/ei-palikoille). Kentässä väärä kohde näkyy virheenä vasta kirjoitettaessa. Taulukon toiminnot (Sarake, Mikä rivi) ja Siirry (Sijainti/Alue tai näkymä + X, Y) jäävät ennalleen. Iso muutos (`descAct`, Miksi?, poiston vaikutuslista, viitteiden korjaus käyttävät `b.o`/`b.om`/`b.oj`/`b.otj`-kenttiä). **Suositus: oma vaihe 26 b:n jälkeen**, Emilin hyväksynnällä.

## S5. Luettelot

- Kaavio *Luvut* (`sarjat`) ja Kalenteri *Merkitse päivät* (`lahteet`): ”＋ Lisää palikka…” -valikko ja ×-rivit.
- **Korvaaja (ehdotus):** kenttä `@a, @b, #unipisteet`. Uutta olisi `#joukko`: kaavio näyttäisi kaikki jäsenet, myös myöhemmin lisätyt. Nykyinen luettelo on kuitenkin selkeä. **Suositus: pidetään luettelo, lisätään vain mahdollisuus kirjoittaa `#joukko` luetteloon**; ei kiire, ei osa 26 b:tä.

## P. Valikko on parempi: pidetään

- **Pienet kiinteät joukot** (Emilin oma esimerkki *Kun valmis*): Toiminnon laji, Yksikkö, Laskutoimitus, Vertailu, Päivämäärän osa, Kulku, Hypyssä, Laukeaa, Kierros, Ohjaus, Monta haaraa- ja Hakutaulukko-rivin tapa, Joukon säännön ominaisuus, Jäsenten laji, ruudukon tihennys ja näkyvyys, kerroksen rullaus/syvyys, Lukitustila (kirjoittaa numeron arvokenttään, toimii yhdessä kaavakentän kanssa), Päivän raja, Sarakkeen laji ja Sarake.
- **Valitaan palikka itse, ei sen arvoa:** Liikkeen liikutettava palikka, Tatti ja Reitti, Kamera seuraa, Maailman rajat, Alkukohta, Aloitusalue, taulukkovalinnat (Rivi, viitesarake, Aikajanan lähde), Toiminnon Joukko-valikko. Kaavan merkitystä (`@x` = arvo) ei pidä venyttää tarkoittamaan palikkaa. Isoissa projekteissa (Autopelissä 36 Aluetta) valikko on pitkä; apu olisi hakukenttä valikkoon, ei kaava. Ei jonossa.
- **Toiminnot, eivät arvoja:** ＋ Lisää toiminto, Vaihda kohde (nuoli), ＋ Haarat vaihtoehtoryhmästä.

## Ehdotettu järjestys

1. **26 b** (hyväksytty): S2 kaikkiin 27 kenttään + S1 korjautuu samalla. Tallennus laajenee, vanha luetaan.
2. **S3 samaan työhön, jos Emil hyväksyy** (sama kenttä, kuusi kohtaa, tallennus laajenee).
3. S4 omana vaiheena myöhemmin (Emilin päätös).
4. S5 `#joukko` luetteloon, ei kiire.
5. Jos 26 b ei ala pian: S1 erillisenä pikkukorjauksena (ei tallennusmuotoa).

## Linjakkuus

A7 (kaava on lyhyt yhdistely, ei funktioita) ja A8 (monta yleistä reittiä hyvä, erikoisreitti epäilyttävä) puoltavat yhtä kaavakenttää: sama kirjoitustapa kuin Kaava-palikassa, Joukon säännöissä ja Lisää rivi -kentissä. A3 (etusija: nuoli > joukko > toiminto > perusarvo) ei muutu: kenttä on perusarvo. A9 (viitteet kestävät): kaava tallentuu `{#id}`-muodossa, joten uudelleennimeäminen ei riko. Ei uutta erikoispalikkaa eikä poikkeusta.

## Sauma kaista B:n kanssa

Kaista B rakentaa jonoa 18 (Laattakartta, ei vielä viety). Jos sen paneeliin tulee `fValue`-kenttiä tai palikkavalikoita arvolle, 26 b:n tekijä lisää ne tähän luetteloon ja samaan muutokseen. Muuten ei päällekkäisyyttä (tämä työ ei muuttanut koodia).
