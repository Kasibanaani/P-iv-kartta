# Headmaze: tila

**Vaihe:** kehittelyssä · **Versio:** 3 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/headmaze/ · **Päivitetty:** 24.10.2026

Mindfulnessia kieli poskessa (Headspace → Headmaze), omana appinaan (Emil 24.10.2026). Ilme: tumma tausta, sinapinkeltainen ja vähän kuvottava tehosteväri, yliiloinen aurinko ja pilvi vittuilevat puhekuplassa, sokkeloestetiikka. Ilme on tarkoituksella oma eikä Appipaja 2.0:n teemarekisteri.

## Valmiina (versio 3, 24.10.2026)

- **Versio 3 (Emil 24.10.):** Sokkelo vaakatasossa koko ruudulle: kierroksen aikana ei alapalkkia eikä aurinkoa ja pilveä. Ruudulla noin neljäsosa kartasta (300 ruutua), ei erillistä karttaruutua. Vasemmassa yläkulmassa pieni kartta ilman hippoja, vain haalea neliö näkyvästä kohdasta. Tatti vasemmassa alakulmassa irti kulmasta (Dynamic Island vasemmalla, turva-alue huomioitu). Taukonappi oikeassa yläkulmassa. Pystyssä pyydetään kääntämään (voi pelata silti). 1–4 hippaa.

- **Välilehdet:** Minä · Harjoitukset · Sokkelo. Alapalkki kiinni alareunassa (runko `position:fixed; inset:0`).
- **Harjoitukset → Uloshengitys:** koko näkymä mahtuu yhteen ruutuun, ei vieritystä. Ylhäällä ohje tai edellinen tulos (suhde, kesto, keskiarvot, palkki täynnä, pylväät), keskellä palkki ja ulos/irti-luvut, alhaalla iso nappi (”Aloita painamalla tästä”). Valmis oikeassa yläkulmassa. Aika ensimmäisestä painalluksesta viimeiseen irrotukseen.
- **Palkki elää käytön mukaan (Emil 24.10.):** alku 10 s, ei käsisäätöä. Seuraava palkki = harjoituksen uloshengitysten keskiarvo × 1,05; nousee heti, laskee vain puolet erosta. Rajat 2–90 s. Versio 1:n käsin säädetty palkki lasketaan uudelleen viimeisestä harjoituksesta.
- **Tilastot ja tallennus** (Harjoitukset-listalta): tilastot, harjoituksen poisto, automaattinen tallennus puhelimeen, varmuuskopio tiedostona ja tekstinä.
- **Puhekupla:** väkänen osoittaa puhujaa (aurinko vasemmalla, pilvi oikealla). 170 repliikkiä tilanteittain, sekaisin pussista: sama ei toistu ennen kuin kaikki tilanteen repliikit on nähty.
- **Minä:** 39 kohtaa. 1–6 Emilin tekstiä sanatarkasti (kohtaan 6 lisätty valinnat), 7–39 tekoälyn käsikirjoitus (Emil pyysi suoraan appiin): etsintä, jalusta, kenen ajatus, lomake uudestaan, laskeutuminen, tyhjä profiili, ja ”tietoinen”-silmukka (kuka ajatteli olevansa tietoisempi). Tauot ajastimella, sokkelotausta kirkastuu ja himmenee. Vastaukset eivät tallennu.
- **Sokkelo-peli:** loputon piilosta. Tatti (versio 3: vaakataso, ks. yllä): mitä pidemmälle, sitä kovempaa ja sitä kauemmas ääni kuuluu (pulssirenkaat). Hipat (1–4, oletus 2) sinisiä, valokeila sinappia ja terävä, seinät ääriviivoina; valokeilassa pelaaja muuttuu mustaksi. Hippa: kävely, pyrähdykset, satunnaiset pysähdykset ja ympäri katselu, uudessa huoneessa yleensä täysi kierros. Näkee → punainen ! ja juoksee pelaajan nopeudella. Hukkaa → ? ja olettaa lähimmän oviaukon pelaajan kulkusuuntaan; kaksi hippaa valitsee eri aukot; juoksu hidastuu vähitellen kävelyksi. Kuulee → ? ja juoksee äänen kohdalle (epätarkasti), sitten kävely. Valokeilan reunalla paikallaan oleva huomataan hitaammin. Viisi karttaa: Talo, Halli, Toimisto, Käytävät, Kartano. Ennätys kartta- ja hippamääräkohtaisesti.
- Tallennus `localStorage` avaimella `headmaze:v1`: `{app:'headmaze',ver:2,target,sessions:[{at,out[],inn[],target,dur,hits,next}],peli:{kartta,hipat,best:{'kartta:hipat':s}}}`. Varmuuskopio `{app,ver,savedAt,data}`.
- Testit `sh headmaze/testit/aja.sh`: logiikka (hengitys, peli) nodella, selain 390 ja 320 px tietokoneen Chromiumissa.

## Ei tarkistettu

- Oikea iPhone: pitkä painallus Safarissa (suurennuslasi, tekstinvalinta), tatin tuntuma peukalolla, pelin sujuvuus (kuvaa/s), alapalkin sijainti kotinäytön appina.
- Pelin vaikeus ja hippojen käytöksen tuntuma: arvot (nopeudet, valokeilan leveys 71° ja pituus 7 ruutua, äänen kantama 0,7–6 ruutua) ovat tekoälyn arvauksia.
- Minä-kohdat 7–39 ja kaikki repliikit ovat tekoälyn kirjoittamia; Emil ei ole lukenut niitä.

## Seuraavaksi

- Emil kokeilee puhelimella: palkin käytös, peli (vaikeus, kartat, tatti), Minä-polku.
- Mahdollisia jatkoja: lisää harjoituksia (koanit, kokemuksen erittely), maskotti ja uloshengityssekunnit, äänet, pelin vaikeustasot.

## Avoimet kysymykset

- Palkin sääntö (keskiarvo + 5 %, alas puolet erosta): sopiiko?
- Pelissä hipan ”kuuloalue” näkyy vain pelaajan pulssina; tarvitaanko vaikeustaso tai hippojen lukumäärän lisäksi muita asetuksia?
- Nimi on sanaleikki tunnetusta appista: omassa käytössä ok, laajemmin mietittävä.

## Emilin kommentit

- (tyhjä)
