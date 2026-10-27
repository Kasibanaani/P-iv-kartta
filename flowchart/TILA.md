# Flowchart: tila

**Vaihe:** versio 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/flowchart/ · **Päivitetty:** 27.10.2026

Hyvin yksinkertainen flowchart-appi puhelimelle (Emilin toive 27.10.2026). Toistaiseksi oma appinsa; voidaan myöhemmin liittää toiseen appiin. Palikan ilme Juuren (paatospuu) asiasana-nappulasta ja Appipaja 2.0:sta.

## Valmiina (versio 1, 27.10.2026)

- Rajaton kanvas, palikoissa vain tekstiä.
- Napautus tyhjään, kun mitään ei ole valittuna: uusi palikka, kursori valmiina, näppäimistö auki. Kuittaus napauttamalla minne tahansa palikan ulkopuolelle. Tyhjäksi jätetty palikka poistuu.
- Napautus palikkaan valitsee sen (ei avaa tekstiä). Valittuna napautus ruudun vasemmalle puoliskolle = uusi palikka edelle (uusi → valittu), oikealle = jälkeen (valittu → uusi); viiva nuolella ja tekstikenttä auki. Alalaidassa vihjeet ‹ Edelle / Jälkeen ›.
- Kuitattu palikka jää valituksi, joten ketjua voi jatkaa suoraan (oikea, kirjoita, ulos, oikea …). Napautus valittuun palikkaan purkaa valinnan. Jos uusi palikka jää tyhjäksi, valinta palaa entiseen.
- Pitkä painallus palikkaan = muokkaus. Tietokoneella myös kaksoisnapsautus.
- Sijoittelu: uusi palikka valitun viereen samalle riville; varattu paikka → lähin vapaa ylä- tai alapuolelta. Kapeneva palikka pitää viivan puoleisen reunansa paikallaan.
- Magneetti: vedetty palikka asettuu toisen palikan keskilinjaan (alle 22 px), muuten 8 px:n ruudukkoon, eikä jää toisen päälle.
- Kanvas hakeutuu karttaan: pieni kartta pysyy kokonaan ruudussa, iso kartta peittää ruudun. Liikutus vetämällä, zoomaus kahdella sormella (0,3–2,5). Muokattava palikka pysyy näkyvissä näppäimistön yläpuolella.
- Valikko (⋯): Näytä koko kartta, vienti ja tuonti tiedostona ja tekstinä, Appipaja 2.0 -teemat ja vaalea/tumma/laitteen mukaan, lyhyt ohje, Tyhjennä kartta.
- Tallennus selaimen muistiin `flowchart.v1`, ulkoasu `flowchart:appearance`. Muoto `{app:'flowchart', ver:1, savedAt, projekti:{id, name, n:[{id,x,y,t}], l:[{a,b}]}}`; x,y = palikan keskipiste. `FC.repair` lukee myös pelkän projektin.
- Testit `sh flowchart/testit/aja.sh`: 20 moottoritarkistusta + kosketuspolku 390 ja 320 px tietokoneen Chromiumissa.

## Ei tarkistettu

- Oikealla iPhonella ei kokeiltu. Erityisesti: aukeaako näppäimistö varmasti napautuksesta ja pitkän painalluksen jälkeen, ja pysyykö muokattava palikka näppäimistön yläpuolella Safarissa.
- Kahden sormen zoomausta ei testattu automaattisesti.

## Seuraava askel

Emil kokeilee puhelimella ja kertoo, mikä tuntuu väärältä.

## Avoimet kysymykset

- Pitääkö kuitatun palikan jäädä valituksi (nyt kyllä, ketjuttamisen takia) vai pitäisikö valinnan purkautua?
- Palikan ja viivan poisto: nyt vain tyhjentämällä teksti. Tarvitaanko viivan poisto ja kahden olemassa olevan palikan yhdistäminen?
- Kumoa puuttuu.

## Emilin kommentit
