# F29 Animointi: näkymän palikan oma tapa ilmestyä, kadota ja muuttua

17.10.2026. **Emilin idea**, tekoälyn jäsentämä. Emil hyväksyi 17.10. kaikki alla olevat linjaukset tekoälyn suositusten mukaan ja pyysi vaiheet jonoon (`TILA.md`, *Jono*). **Vaihe 1 toteutettu (Appi-appi 35, 17.10.2026); vaiheet 2–3 ei.** [Hakemisto](../SUUNNITELMA.md), [käyttöpinta](03-kayttopinta.md), [aika ja Animappi](05-aika-media-ja-liitannat.md), [Jana](13-jana.md).

## Idea (Emilin idea, tiivistetty)

- Jokaisella näkymän palikalla (palikka, tekstin pohja, teksti, kuva, mikä tahansa) on sama **animointivalikko**: *tapa* ja *nopeus*, järkevät oletukset.
- Se koskee näkyviin tuloa, piiloon menoa ja arvon vaihtumista (töks, häivytys vanhasta uuteen …).
- Säädöt ovat palikan sisällä, mutta logiikka voi ohjata niitä: esim. yksi Arvo 3 s viitataan monen palikan nopeudeksi.
- Vaihtoehdot ovat samat palikasta toiseen, jotta sääntö on toistuva ja intuitiivinen.

## Emilin päätökset 17.10.2026

1. **Keveys ensin.** Mikään animointiominaisuus ei saa tehdä appista raskasta käyttää. Aito liikeblur jätetään kokonaan pois. Kevyt korvike (venytys tai vana) tehdään vain, jos se pysyy kevyenä; muuten sekin jää pois.
2. **Pelkkä visuaali.** Animointi ei vaikuta palikan sijaintiin, ruutuun, kokoon, törmäyksiin, alueisiin eikä mihinkään logiikan arvoon. Oikea tila muuttuu heti; animaatio vain näyttää muutoksen.
3. **Logiikka ei odota animaatiota.** Kun palikka piilotetaan, `näkyy` on heti *ei* ja palikka lakkaa ottamasta napautuksia, vaikka se vielä häipyy. Kun palikka tuodaan näkyviin, `näkyy` on heti *kyllä* ja painike toimii heti, vaikka se on vielä tulossa esiin.
4. **Keskeytys kääntyy.** Jos suunta vaihtuu kesken (tulee takaisin kesken häivytyksen), animaatio kääntyy nykyisestä kohdasta eikä hyppää. Animaatio ei koskaan kirjoita oikeaa sijaintia (sama periaate kuin F12:n raahauskorjauksessa).
5. **Jatkuva liike rajataan pois.** Liike, hahmo, reitti, kamera, zoomaus, raahaus ja Muutos ajassa eivät saa palikan animointia. Animointi koskee vain hyppäyksiä: näkyvyys, Aseta, nuolen tai kaavan vaihtama arvo.
6. **Nopeat arvot: uusin voittaa.** Jos arvo vaihtuu uudestaan kesken animaation, uusin arvo näytetään heti (tai uusi animaatio alkaa nykyisestä kuvasta). Arvon vaihtumisen oletus on töks, joten Sekuntikello ja Monitori eivät puuroudu.
7. **Muiden palikoiden liukuminen tilalle** (esim. Toistimen kortti katoaa ja muut siirtyvät) jätetään toistaiseksi pois, koska se on raskaampi.
8. **Efektit säilyvät.** Palikan asetus on oletus sille, miltä muutos näyttää; ketjun efekti (Teksti ilmestyy, Kuva vaihtuu, Animaatio, Näkymänvaihto) on kertaluonteinen poikkeus ja voittaa sillä kertaa.
9. **iPhonen *Vähennä liikettä* -asetusta noudatetaan:** silloin kaikki palikan animoinnit ovat töks (tai korkeintaan lyhyt häivytys).

## Nykytila (tarkistettu koodista 17.10.2026, Appi-appi 22)

- Näkyvyys lasketaan moottorissa yhdessä kohdassa: `visible(id)` (kerroksen näkyvyys `layerShown`, nuolet `inl[id+'|nk']`, palikan oma `nk`-asetus). Tila `piilossa`/`harmaa`/`luettava` tulee `state(id)`:stä. Hyvä lähtökohta: animointi tarvitsee vain tiedon, että `visible` vaihtui.
- Käyttönäkymän piirto `renderUIStage` käyttää samoja elementtejä uudelleen, kun järjestys pysyy (`existing`-kartta), mutta tyhjentää kaiken, kun järjestys muuttuu. Katoamisanimaatio vaatii, että elementti ei katoa kesken; rakentajan tarkistettava.
- Ketjun efektit (`Ketjun efektit`, `fxEl`, `fxAfter`) käyttävät jo selaimen `el.animate`-rajapintaa (Web Animations). Animaatio-efektin lajit: pomppu, ravistus, sykintä, liuku. Teksti ilmestyy: kirjain, sana, häivytys. Kuva vaihtuu: häivytys. Näkymänvaihto: liuku.
- `prefers-reduced-motion` on käytössä kahdessa CSS-kohdassa (maailman siirtymä, ketjun palkit), ei vielä efekteissä.
- Ei ole: palikkakohtaista tapaa ilmestyä tai kadota, eikä animointia arvon vaihtuessa.

## Ratkaisut (tekoälyn suositus, Emil hyväksyi)

**Paneeli.** Jokaisen näkymän palikan paneelissa osio *Animointi* (suljettu, kun mitään ei ole valittu, ettei peruskäyttö monimutkaistu):

- *Ilmestyy*: töks · häivytys · liuku (ylhäältä, alhaalta, vasemmalta, oikealta) · kasvu · pomppu
- *Katoaa*: samat vaihtoehdot; oletus *sama kuin ilmestyy*
- *Kesto*: sekunteina, oletus 0,25 s
- *Pehmeys*: pehmeä (oletus) · tasainen · joustava
- Vaihe 2 lisää: *Arvo vaihtuu*: töks (oletus) · ristihäivytys · luku rullaa (vain luvuille)

Samat nimet ja vaihtoehdot kaikissa palikoissa. Palikka, jolle tapa ei sovi (esim. luku rullaa tekstille), ei näytä sitä vaihtoehtoa, mutta ei myöskään keksi omaa.

**Projektin oletus.** Asetuksissa *Animointi*: projektin oletustapa ja -kesto. Palikka käyttää oletusta, kunnes sille valitaan oma. Vanhoilla projekteilla oletus on töks, joten mikään ei muutu itsestään.

**Logiikka.** Viitattavat ominaisuudet (ohjattavat: nuoli, kaava, Aseta, Palauta): `animointi.kesto`, `animointi.ilmestyy`, `animointi.katoaa` (vaihe 2: `animointi.arvo`). Tapa on teksti tai valinta (esim. `"häivytys"`); tuntematon tapa on näkyvä virhe ja palikka käyttää töksiä. Yksi Arvo 3 s nuolella moneen palikkaan riittää ryhmän yhteiseen nopeuteen; erillistä ryhmäsäätöä ei tehdä.

**Tekniikka (keveys).**
- Vain `opacity` ja `transform` (siirto, skaalaus). Ne piirtää näytönohjain, joten kymmenetkin palikat pysyvät kevyinä. Ei `filter: blur`, ei koon (`width`/`height`) eikä asettelun animointia.
- Animaatio on pelkkä kerros oikean elementin päällä: oikea sijainti ja koko asetetaan heti, animaatio kulkee `transform`-poikkeamana kohti nollaa.
- Piiloon menevä palikka saa `pointer-events:none` heti; elementti poistetaan tai piilotetaan vasta animaation lopussa.
- Kesto rajataan 0–10 s:iin; 0 = töks.
- Ei omaa ajastinsilmukkaa: selaimen animaatio (Web Animations tai CSS-siirtymä), ei `requestAnimationFrame`-kierrosta per palikka.

**Tallennus.** Uusi valinnainen kenttä palikkaan (esim. `an:{in,out,arvo,kesto,pehmeys}`) ja projektiin (`P.an`). Puuttuva kenttä = töks. Vanha muoto luetaan ennallaan; tallennusmuodon muutos, joten rakentaja muistuttaa varmuuskopiosta.

**Viety appi.** Animointi on käyttöliittymää (`#ui`), joten se kulkee viedyn appin mukana sinne, missä käyttönäkymä kulkee. Moottoriin tulee vain ominaisuuksien arvot.

## Vaiheet

1. **Vaihe 1: ilmestyminen ja katoaminen** (toteutettu Appi-appi 35: kentät `ani`, `ano`, `ank`, `anp`, projektin `an`; Toistimen korttien palikat tulivat ilmaiseksi; efekteihin Vähennä liikettä). Paneelin osio *Animointi* (ilmestyy, katoaa, kesto, pehmeys), projektin oletus, ominaisuudet logiikkaan, Vähennä liikettä, keskeytys kääntyy. Koskee näkyvyyden muutoksia (palikan näkyvyysasetus, nuoli, kerroksen näkyvyys, Kerros-palikka).
   - Testit: piilotus asettaa `näkyy`=ei heti ja napautus ei osu häipyvään palikkaan; näkyviin tuleva ottaa napautuksen heti; keskeytys ei hyppää; oikea sijainti ei muutu animaation aikana; ominaisuus `animointi.kesto` nuolesta toimii; vanha projekti ilman kenttää = töks; 390 ja 320 px.
   - Ei tässä: arvon vaihtuminen, sijainnin hyppäys, venytys, muiden liukuminen, Toistimen kortit (ellei tule ilmaiseksi).
2. **Vaihe 2: arvon vaihtuminen ja sijainnin hyppäys** (jonossa, myöhemmin). *Arvo vaihtuu*: ristihäivytys (teksti, kuva, luku), luku rullaa; uusin voittaa. Aseta- tai nuolihyppäyksen sijainnin muutos liukuen (visuaalinen, oikea sijainti heti; ei koske Liikettä, raahausta eikä kameraa). Tarkista suhde Kuva vaihtuu- ja Teksti ilmestyy -efekteihin: efekti voittaa sillä kertaa.
3. **Vaihe 3: venytys tai vana, kokeiluna** (ehdotus, ei vielä jonossa). Kevyt liikevaikutelma sijainnin hyppäykseen: venytys kulkusuuntaan (`transform` scale) tai 2–3 haalean kopion vana. Rakennetaan vain, jos mittaus vanhalla iPhonella (tai tietokoneen hidastetulla suorittimella) näyttää, että 20 palikkaa pysyy sulavana. Muuten jätetään pois (päätös 1).
4. **Myöhemmin, ehdotus.** Muiden palikoiden liukuminen tilalle (Toistin, pinot), jos sen saa kevyeksi. Animointi Janan (F28) merkeistä ohjattuna tulee ilmaiseksi ominaisuuksien kautta.

## Suhde muihin

- **Efektit:** ks. päätös 8. Efektien oma *Vähennä liikettä* -tuki kannattaa lisätä vaiheessa 1 samalla, jos se on pieni.
- **Jana (F28):** Jana kertoo *milloin*, palikan animointi *miltä se näyttää*. Ei päällekkäisyyttä.
- **Animappi (`../../animaatio/MUOTO.md`):** Animappi tekee sisällön animaatiota (ruudut, kuvasarja); tämä on siirtymiä. Eri asiat, ei yhteistä muotoa.
- **Muutos ajassa ja Käyrä:** jatkuva arvon muutos jää niille. *Pehmeys*-vaihtoehdot voidaan myöhemmin korvata Käyrä-palikalla, jos Emil haluaa oman muodon; nyt ei.
- **Teemat (Appipaja 2.0):** animointi ei muuta värejä eikä kontrastia.

## Avoimet kysymykset

Ei avoimia: Emil hyväksyi linjaukset 17.10.2026. Vaiheen 3 rakentaminen riippuu mittauksesta.
