# F36 Palikan oma ruudukko: kosketuskohdat, jotka kulkevat palikan mukana

17.10.2026. **Emilin idea** (viestit 17.10. klo 23.55 ja 0.01 Suomen aikaa): maailman ruudukko toimii kosketuskohtana missä ruudussa vain; myös palikalla tai objektilla pitäisi voida olla oma, siinä kiinni pysyvä ruudukko, vaikka palikka liikkuu. Yleinen ominaisuus, ei 2D-pelien osa. Tekoälyn jäsentämä. **Ei toteutettu.** [Hakemisto](../SUUNNITELMA.md).

**Emilin kysymys 17.10.:** maailman ruudukko toimii kosketuskohtana missä ruudussa vain; saako liikkuvalle palikalle oman, siinä kiinni pysyvän ruudukon? **Nyt ei.** Ruudukko on kerroksen ominaisuus ja ankkuroitu kanvaasin kohtaan (0, 0) (`ruudukko`, `alueRuutu`). Alue osaa kertoa napautetun ruudun, mutta vain kerroksen ruudukossa, eikä Aluetta voi kiinnittää liikkuvaan palikkaan. Ilman ruudukkoa Alue antaa napautuksen pikseleinä kulmastaan, mikä on lähin nykyinen kiertotie.

**Ehdotus: jokaisen näkymäpalikan yhteinen osio Oma ruudukko** (A5: yhteinen ominaisuus, ei uusi palikka):
- **Sarakkeet × rivit** (esim. 3 × 3), ruudut jakavat palikan koon tasan. Ruudukko kulkee, kasvaa ja kiertyy palikan mukana, koska se lasketaan palikan omasta suorakulmiosta (kierretyssä palikassa napautus muunnetaan palikan koordinaatteihin). Näkyy: muokatessa (oletus) / aina / ei.
- **Napautus:** palikka lähettää tapahtuman **ruutu napautettu**, tiedot `tapahtuma.x`, `tapahtuma.y` (1 = vasen yläruutu), ja ominaisuudet `napautettux`, `napautettuy` (samat nimet kuin Alueella).
- **Kosketus muilta:** kun liikkuja törmää ruudukolliseen palikkaan, *törmäsi*-tietoihin (ja myöhemmin 2D-suunnitelman *laskeutui*-tietoihin) tulee `tapahtuma.kohdex`, `tapahtuma.kohdey`: mihin kohteen ruutuun osui (osumakohta lasketaan kiertämättömästä osuma-alueesta, koska osuma-alue ei kierry).
- **Pudotus:** käyttöraahauksessa (F12) palikan päälle pudotettu tietää ruudun (`tapahtuma.x/y` pudotuksessa): lautapeli, liikkuva inventaario, kalenteripohja.
- 2D-suunnitelman ([19](19-2d-pelit-ja-ymparistot.md)) Laattakartan ruudukko noudattaa samaa sääntöä, mutta tämä ei riipu siitä.

Käyttöesimerkit: numeronäppäimistö yhtenä Kuvana (3 × 4 ruutua), lautapelin lauta, joka liukuu paikalleen, kartta- tai pohjapiirroskuva, jonka huoneita napautetaan, liikkuvan kohteen eri osat (pää, keho, jalat = 1 × 3).

Linjakkuus: nimet `napautettux/y` kuten Alueella (A9), ominaisuudet `ruudukko.sarakkeet`, `ruudukko.rivit` rekisteriin (A2), tapahtuma *ruutu napautettu* (A4). Ei erikoispalikkaa. **Tallennusmuoto laajenee** (valinnainen palikan kenttä, ehdotus `org: {s, r, n}`).

## Testit

Ruutu oikein liikkuvassa, venytetyssä ja kierretyssä palikassa; napautus antaa oikean ruudun 1440 ja 1280 px sekä käyttönäkymässä 390 px; osuttu ruutu törmäyksessä; pudotusruutu käyttöraahauksessa; ilman ruudukkoa palikka toimii täsmälleen ennallaan; tallennus ja vanha projekti.
