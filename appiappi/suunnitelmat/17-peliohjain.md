# F33 Peliohjain: Xbox-, PlayStation- ja Nintendo-ohjain Appi-appin syötteeksi

17.10.2026. **Emilin idea** (viesti 17.10. klo 16.58): ”Tuki ohjaimelle, kuten Xbox, PlayStation tai Nintendo.” Tekoälyn jäsentämä suunnitelma. Merkinnät: *ehdotus* = tekoälyn suositus; ⏸ = odottaa Emilin päätöstä. **Ei toteutettu.** [Hakemisto](../SUUNNITELMA.md), [käyttöpinta](03-kayttopinta.md), [palikkasäännöt](../PALIKKASAANNOT.md).

## 1. Mitä iPhone oikeasti tukee (selvitetty 17.10.2026)

Selaimen **Gamepad API** on Safarissa ollut iOS 10.3:sta asti. iPhone yhdistää ohjaimen Bluetoothilla (Asetukset → Bluetooth), ja Safari näkee sen Applen GameController-kehyksen kautta.

| Asia | Tilanne iPhonella | Varmuus |
|---|---|---|
| Xbox One S / Series -ohjain | Toimii (iOS 13 / 14.5 alkaen) | varma |
| PlayStation DualShock 4 / DualSense | Toimii (iOS 13 / 14.5 alkaen) | varma |
| Nintendo Switch Pro ja Joy-Con-pari | Toimii (iOS 16 alkaen); Joy-Conit yhdistetään pariksi iOS:n asetuksissa | varma |
| MFi-ohjaimet (esim. Backbone, Razer Kishi) | Toimivat | varma |
| Kotinäytön kirjanmerkki (web-appi) | Toimii kuten Safarissa. iOS 14:n beetassa oli vika, joka korjattiin (WebKit-vika 214336). | varma |
| Ohjain näkyy vasta ensimmäisestä napinpainalluksesta | **Kyllä.** Selain ei paljasta ohjainta ennen kuin käyttäjä painaa nappia sivun ollessa auki (sormenjälkisuoja). Appi ei voi tietää ohjaimesta etukäteen. | varma |
| Nappien järjestys | Kaikki ohjaimet tulevat samaan vakiokarttaan (`standard`): neljä etunappia sijainnin mukaan, olkanapit, liipaisimet 0–1, kaksi tattia −1…1, ristiohjain, valikko- ja valintanappi, tattien painallus. | varma |
| Kotinappi (Xbox-, PS-, Home-nappi) ja jako/kaappausnappi | iOS käyttää ne itse; appi ei saa niitä. | todennäköinen, tarkistetaan |
| Nintendon A/B ja X/Y | Nintendolla kirjaimet ovat ristissä Xboxiin nähden. Vakiokartta käyttää sijaintia, joten **alanappi** on Xboxin A, PlayStationin ✕ ja Nintendon B. Pitää tarkistaa oikealla ohjaimella. | tarkistettava |
| Ohjaimen tärinä | Safari 17 (iOS 17) toi `vibrationActuator`-rajapinnan (dual-rumble). WebKitin toteutus on testattu macOS:llä Xbox-ohjaimella; iPhonesta ei löytynyt varmistusta. Safarissa `effects`-luetteloa ei ole, joten tuki tunnistetaan pelkästä `vibrationActuator`-kentästä. | **epävarma iPhonella** |
| Puhelimen oma värinä (`navigator.vibrate`) | Ei toimi iPhonen Safarissa. | varma |
| Tapahtumat | Safari lähettää `gamepadconnected`/`gamepaddisconnected`, mutta nappien tila **luetaan kyselemällä** (`navigator.getGamepads()`) joka kuvassa. Taustalla tai lukitulla näytöllä mitään ei tule. | varma |
| HTTPS | Vaaditaan; GitHub Pages on HTTPS. | varma |

Lähteet: MDN Gamepad API ja `GamepadHapticActuator`; WebKit-blogi *WebKit Features in Safari 17.0* (vibrationActuator, dual-rumble); WebKit-commit c7f1532 (tärinä GameController-kehyksellä, testattu macOS 13:lla); WebKit Bugzilla 214336 (web-appi kotinäytöltä); SDL:n Safari-korjaukset (`effects` puuttuu Safarista); Applen ohjaintuki iOS 13 / 14.5 / 16 (uutiset). Mitään ei ole kokeiltu oikealla iPhonella ja ohjaimella.

## 2. Nykytila koodissa (tarkistettu 17.10.2026, Appi-appi 32)

- Appi-appissa ei ole mitään ohjain- eikä näppäimistösyötettä käyttäjän apeille. `keydown`-kuuntelijat koskevat vain kenttiä ja rakentajan pikanäppäimiä.
- **Tatti** (`tatti`, näkymä, ohjain): moottorin `tattiSet(P,id,x,y,ctx,vaihe)` kirjoittaa `P.st[id]={x,y}` ja lähettää *alkaa*/*loppuu*. Ulos: etäisyys, vaaka, pysty, suunta, alkaa, loppuu.
- **Liike** lukee Tattia ohjauksella *tatti* (`b.tt` = Tatti-palikan id, vain laji `tatti`).
- **Painike** lähettää *painettu*-tapahtuman napautuksesta.
- **KUN**-ikkuna laukeaa, kun ehto alkaa päteä, joten `ohjain.alanappi`-tyyppinen ominaisuus riittää yksittäisen napin tapahtumaksi ilman uusia kohtia.
- Kuvasilmukka (`frame`) pyörii vain, kun jotain liikkuu.

## 3. Ratkaisu: yksi uusi palikka ja kaksi kytköstä vanhoihin

Periaate A8: monta yleistä reittiä on hyvä. Ohjain tuodaan sisään kolmea reittiä, jotka kaikki tuottavat tavallista logiikkaa.

### 3.1 Peliohjain-palikka (logiikka, uusi laji `pohj`)

- Logiikan palikka kuten Sekuntikello. Ei näy käyttäjälle. Asetukset: **pelaaja** 1–4 (oletus 1; monta ohjainta = monta palikkaa) ja **kuollut alue** 0–0,5 (oletus 0,15; tatin pieni lepovärinä ei liikuta mitään).
- **Ominaisuudet** (`omat`-rekisteriin, kaavalla luettavia, ei asetettavia, koska ne tulevat laitteesta; syy kirjataan A2:n mukaan):
  - `yhdistetty` (kyllä/ei), `nimi` (ohjaimen oma nimi, esim. ”Xbox Wireless Controller”)
  - vasen tatti: `vaaka`, `pysty` (−1…1, oikealle ja alas +), `etäisyys` (0…1), `suunta` (asteina, 0 = ylös). **Samat nimet kuin Tatilla**, joten Tatin kaavat siirtyvät sellaisinaan.
  - oikea tatti: `oikeavaaka`, `oikeapysty`
  - etunapit sijainnin mukaan: `alanappi`, `oikeanappi`, `vasennappi`, `ylänappi` (kyllä/ei). Paneelissa merkkien taulukko:

    | Appi-appi | Xbox | PlayStation | Nintendo |
    |---|---|---|---|
    | alanappi | A | ✕ | B |
    | oikeanappi | B | ○ | A |
    | vasennappi | X | □ | Y |
    | ylänappi | Y | △ | X |

  - `vasenolka`, `oikeaolka` (kyllä/ei), `vasenliipaisin`, `oikealiipaisin` (0…1, puoliksi painettu = 0,5)
  - ristiohjain: `ylös`, `alas`, `vasen`, `oikea` (kyllä/ei)
  - `valikko`, `valinta` (Start/Options/+ ja Back/Share/−), `vasenpainallus`, `oikeapainallus` (tatin painallus)
- **Kohdat ulos:** arvokohdat vaaka, pysty, etäisyys, suunta ja yhdistetty (yleisimmät, nuolella vedettävät). Tapahtumakohdat: **painettu** ja **irti** (tapahtuman tiedoissa `nappi` = yllä oleva nimi), **yhdistyi** ja **irtosi**. Yksittäinen nappi: KUN `ohjain.alanappi`, tai painettu + JOS `tapahtuma.nappi = "alanappi"`.
- **Ohjaus sisään:** ei mitään vaiheessa 1 (tärinä vaiheessa 2).
- **Miksi?** kertoo: ”Ohjainta ei ole yhdistetty. Yhdistä ohjain iPhonen Bluetooth-asetuksista ja paina mitä tahansa nappia, kun appi on auki.” tai ”Pelaaja 1: Xbox Wireless Controller, painettuna alanappi.”
- **Paneelissa** elävä esikatselu: yhdistetty-tila ja painetut napit syttyvät, jotta rakentaja näkee heti, mikä nappi on mikä.

### 3.2 Tatti seuraa ohjainta (asetus vanhaan palikkaan)

- Tatin paneeliin valinta **Peliohjain: ei / vasen tatti / oikea tatti** ja pelaaja (oletus ei, vanha toiminta ennallaan).
- Kun ohjaimen tatti liikkuu kuolleen alueen yli, Tatin arvot tulevat ohjaimesta (moottorin sama `tattiSet`), nuppi liikkuu ruudulla, ja *alkaa*/*loppuu* lähtevät kuten sormella. Sormi voittaa, kun se koskee Tattia.
- Hyöty: **jokainen nykyinen Tatti + Liike -peli toimii ohjaimella yhdellä valinnalla**, Liikkeeseen ei tarvitse koskea. Ruudun tatin voi piilottaa ohjaimen ajaksi: *näkyy kun* `ohjain.yhdistetty = ei`. Piilotettu Tatti seuraa ohjainta silti.

### 3.3 Painike reagoi ohjaimen nappiin (asetus vanhaan palikkaan)

- Painikkeen paneeliin valinta **Peliohjaimen nappi: ei / alanappi / … / valikko** ja pelaaja.
- Napin painallus on sama kuin napautus: painettu-tapahtuma, painalluksen ilme ja käytös (*pohjaan* jne.). Piilossa tai harmaana oleva painike ei reagoi, kuten sormellakaan. Jos monella näkyvällä painikkeella on sama nappi, kaikki reagoivat (rakentaja näkee sen Miksi?-selityksestä).
- Hyöty: valikot ja kysymysapit toimivat ohjaimella ilman uutta logiikkaa.

## 4. Tekniikka

- **Moottori (DOMiton, kopioituu viedylle apille):** `KK.ohjainSet(P,pelaaja,tila,ctx)`, jossa `tila` = `{id,napit:[0…1],tatit:[x,y,x2,y2]}` tai `null` (irti). Moottori soveltaa kuolleen alueen, vertaa edelliseen, päivittää Peliohjain-palikoiden tilan (`P.st[id]`, käyttötietoa, ei tallenneta rakenteeseen), kutsuu Tatille `tattiSet` ja painikkeille saman polun kuin napautus, lähettää tapahtumat ja tekee `tick`in **vain jos jokin muuttui**.
- **Käyttöliittymä:** kuuntelee `gamepadconnected`/`gamepaddisconnected`. Kyselysilmukka (`requestAnimationFrame`) käy **vain**, kun (a) ollaan käyttötilassa tai lukitussa näkymässä, (b) projektissa on Peliohjain-palikka tai ohjaimeen kytketty Tatti/Painike ja (c) ohjain on yhdistetty. Silmukka pysähtyy, kun sivu menee taustalle (`visibilitychange`). Näin appi ilman ohjainta ei kuluta mitään.
- Kun ohjain irtoaa, kaikki napit ja tatit palautuvat lepoon (Tatti keskelle, *loppuu* lähtee), jottei hahmo jää kävelemään.
- Kevyt: yksi `getGamepads()` kuvaa kohden ja vertailu kahdeksaantoista lukuun. Ei kirjastoja.
- **Vienti (F23):** viedyn appin pitää ottaa kyselysilmukka mukaan. Kirjataan F23:n suunnitelmaan, kun vienti rakennetaan.

## 5. Vaiheet

1. **Vaihe 1 (jonoon):** Peliohjain-palikka (3.1), Tatti seuraa ohjainta (3.2), Painike reagoi nappiin (3.3), paneelin esikatselu, Miksi?, testit. Moninpeli 1–4 mukana alusta (pelaaja-asetus), koska se on halpa.
2. **Vaihe 2, tärinä:** toiminto **Täristä** (kohde Peliohjain, kesto s, voima 0–1, valinnainen heikko/vahva). Jos laite ei tue (`vibrationActuator` puuttuu), ei tee mitään ja Miksi? sanoo ”tämä laite ei tue ohjaimen tärinää”. Rakennetaan vasta, kun vaihe 1 on kokeiltu oikealla iPhonella ja ohjaimella, koska iPhonen tuki on epävarma.
3. **Vaihe 3 (ehdotus), valikossa liikkuminen:** ristiohjain siirtää näkyvää kehystä painikkeiden välillä ja alanappi painaa, ilman että rakentaja kytkee jokaisen painikkeen erikseen. Projektin asetus, oletus pois.
4. **Vaihe 4 (ehdotus), näppäimistö:** iPadin näppäimistö ja tietokone samaan Peliohjain-palikkaan (nuolet = ristiohjain, välilyönti = alanappi …). Samalla rakentaja voi kokeilla ohjainlogiikkaa ilman ohjainta.

## 6. Linjakkuus

- **A1:** nimi kertoo, mistä syöte tulee (vrt. Tatti, Säädin). Ei pelikohtaista palikkaa (”hyppää”, ”ammu”); merkitys syntyy kytkennöistä.
- **A2:** kaikki napit ja tatit `omat`-rekisteriin, kaavalla luettavia. Ei asetettavia eikä ohjattavia, koska arvo tulee laitteesta, kuten Tatin vaaka/pysty. Syy kirjataan paneelin vihjeeseen.
- **A4:** tapahtumat painettu, irti, yhdistyi, irtosi; tiedoissa `nappi`.
- **A5:** ei koske, koska Peliohjain ei ole näkymäpalikka. Tatin ja Painikkeen yhteiset kohdat pysyvät ennallaan.
- **A8:** ei uutta liikemallia eikä erillistä ”ohjainpainiketta”: Tatti ja Painike saavat yhden lisäasetuksen, kaikki muu on tavallista logiikkaa.
- **A10:** Miksi?, paneelin elävä esikatselu ja yhdistetty-ominaisuus.
- **A12:** syötteen käsittely moottorissa, vain lukeminen `navigator.getGamepads()` on käyttöliittymässä.
- **A13:** tallennukseen uusi laji `pohj` (kentät `pel`, `kuollut`) ja valinnaiset kentät Tatille (`pad`, `padp`) ja Painikkeelle (`padn`, `padp`). Versio ennallaan; vanhat projektit avautuvat ennallaan. Tallennusmuoto laajenee, joten muistutetaan varmuuskopiosta, ja työ tehdään kaistalla, jolla ei samaan aikaan ole muuta tallennusmuodon muutosta.
- **A14:** moottoritesti (`ohjainSet` synteettisellä tilalla: kuollut alue, tapahtumat, irtoaminen, Tatti ja Painike, kaksi pelaajaa) ja selaintesti, jossa `navigator.getGamepads` korvataan valeohjaimella 390 ja 320 px leveydellä.
- **Erikoispalikka?** Ei. Peliohjain on tavallinen logiikan syötepalikka (vrt. Tänään, Sekuntikello). Ei ✦-merkkiä eikä rekisteririviä.

## 7. Mitä ei voi tarkistaa ilman Emiliä

- Kaikki vaiheen 1 testit ajetaan tietokoneen Chromiumissa valeohjaimella. Oikeaa ohjainta ja iPhonea ei voi kokeilla tekoälyn koneella.
- Tarkistettava oikealla iPhonella ja ohjaimella: yhdistäminen ja ensimmäinen painallus, Nintendon nappijärjestys, kotinäytön web-appi, viive, akunkulutus ja se, ottaako iOS jonkin napin itselleen.

## 8. Avoimet kysymykset

- ⏸ **Mikä ohjain Emilillä on käytössä** (Xbox, PlayStation, Nintendo vai ei vielä mitään)? Vaihe 1 ei odota vastausta, mutta kokeiluohje ja tärinävaihe (2) tehdään sen mukaan.
- Ehdotus, ei kysymys: nappien nimet sijainnin mukaan (alanappi jne.), koska ne ovat samat kaikilla merkeillä. Jos Emil haluaa Xboxin kirjaimet (A, B, X, Y), muutos on pieni.
