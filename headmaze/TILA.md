# Headmaze: tila

**Vaihe:** kehittelyssä · **Versio:** 1 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/headmaze/ · **Päivitetty:** 24.10.2026

Mindfulnessia kieli poskessa (Headspace → Headmaze), nyt omana appinaan eikä Appi-appin projektina (Emil 24.10.2026). Ilme: tumma tausta, sinapinkeltainen ja vähän kuvottava tehosteväri, yliiloinen aurinko ja pilvi, jotka vittuilevat puhekuplassa, taustalla himmeä sokkelo. Ilme on tarkoituksella oma eikä Appipaja 2.0:n teemarekisteri.

## Valmiina (versio 1, 24.10.2026)

- **Hengitä:** iso nappi pidetään pohjassa uloshengityksen ja tyhjien keuhkojen ajan. Palkki (alku–loppu) täyttyy painalluksen aikana palkin pituudessa; tavoite on pitää nappi pohjassa koko palkin ajan ja irti-aika lyhyenä. Aika mitataan ensimmäisestä painalluksesta viimeiseen irrotukseen, joten Valmis-napilla ei ole kiire.
- **Tulos:** suhde = uloshengitykset yhteensä ÷ irti-ajat yhteensä (yksinkertainen; ulos on yksi enemmän, Emilin mukaan ei haittaa). Kesto, määrä, palkki täynnä x/n, pylväät ulos/irti.
- **Palkin piteneminen:** jos palkki täyttyi vähintään 60 %:lla uloshengityksistä (vähintään 3), palkki pitenee 5 % (vähintään 0,2 s). Ei lyhene itsestään. Alku 6 s, rajat 2–90 s, säätö Tilastoissa ± 0,5 s.
- **Tilastot:** harjoitukset, ulos-minuutit yhteensä, paras suhde, suhde harjoituksittain, harjoituksen poisto, varmuuskopio tiedostona ja tekstinä.
- **Minä:** Emilin käsikirjoitus kohdat 1–6 sanatarkasti, askel kerrallaan, ei haaroja. Vastaukset eivät tallennu (profiili on joka kerta tyhjä). Alusta.
- Tallennus `localStorage` avaimella `headmaze:v1`: `{app:'headmaze',ver:1,target,sessions:[{at,out[],inn[],target,dur,hits,next}]}`. Varmuuskopio `{app,ver,savedAt,data}`.
- Testit `sh headmaze/testit/aja.sh` (logiikka nodella, selain 390 ja 320 px tietokoneen Chromiumissa).

## Ei tarkistettu

- Oikea iPhone: pitkän painalluksen käytös Safarissa (suurennuslasi, tekstinvalinta, kotinäytön appina), värinä (iPhone ei tue `vibrate`), ajoituksen tarkkuus.
- Palkin pitenemissääntö (60 %, 5 %) on tekoälyn valinta, ei Emilin.
- Repliikit ovat tekoälyn kirjoittamia.

## Seuraavaksi

- Emil kokeilee Hengitä-harjoitusta puhelimella ja kertoo, tuntuuko palkki ja suhde oikealta.
- Minä-käsikirjoituksen jatko: tekoälyn luonnos annettu Emilille 24.10.2026 (ei appissa). Emil päättää, mitä siitä otetaan.
- Mahdollisia jatkoja: sokkelo-osio, maskotti ja uloshengityssekuntien merkitys, koanit, uramoodi (ks. `master-tiedot/IDEAT.md`).

## Avoimet kysymykset

- Palkin pitenemissääntö: sopiiko 60 % / +5 %? Pitäisikö palkin myös lyhentyä huonoina päivinä?
- Pitäisikö irti-ajalle olla oma tavoite tai näkyvä raja?
- Pitäisikö Minä-vastausten tallentua? (nyt eivät, viestin mukaisesti)
- Nimi on sanaleikki tunnetusta appista: omassa käytössä ok, laajemmin mietittävä.

## Emilin kommentit

- (tyhjä)
