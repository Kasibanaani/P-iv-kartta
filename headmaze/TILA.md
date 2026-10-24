# Headmaze: tila

**Vaihe:** kehittelyssä · **Versio:** 12 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/headmaze/ · **Päivitetty:** 24.10.2026

Mindfulnessia kieli poskessa (Headspace → Headmaze), omana appinaan (Emil 24.10.2026). Ilme: tumma tausta, sinapinkeltainen ja vähän kuvottava tehosteväri, yliiloinen aurinko ja pilvi vittuilevat puhekuplassa, sokkeloestetiikka. Ilme on tarkoituksella oma eikä Appipaja 2.0:n teemarekisteri.

## Valmiina (versio 12, 24.10.2026)

- **v9:** alapalkki takaisin (v7:n rungon venytys piilotti sen; nyt html-tausta on alapalkin värinen). Laskeutuminen leijailee eri tahdissa, kupla piilossa lennon ajan. Koanikone: ei keskitekstiä, aurinko ja pilvi laskeutuvat ja sanovat koanit kuplassa; yksi nappi, vähintään 20 s uloshengitystä per koani (yhdessä tai monessa erässä), sitten sama nappi on Seuraava.
- **v12 harhautus (Emil 24.10.):** oikea tatti oikeassa alakulmassa: vedä tähdätäksesi (katkoviiva ja rengas, matka 1,5–10 ruutua, pysähtyy seinään), irrota heittääksesi. Esine pitää osuessaan täyden äänen (9 ruutua, valkoinen rengas). Hippa, jonka valokeilaan se osuu, juoksee suoraan sinne (!); muut kuulijat lähtevät katsomaan (?). Jahtaava hippa, joka näkee pelaajan juuri nyt, ei välitä. Uusi heitto vasta, kun tatin kehä on täynnä (20 s). Kuiskausnappi siirtyi alas keskelle tattien väliin (pystyssä oikean tatin yläpuolelle).
- **v11 (Sokkelo, Emil 24.10.):** kun hippa jahtaa alle 6 ruudun päässä, oikeaan alakulmaan vilkkuu kuiskaava nappi ”en ole tässä pelissä” (näkyy vielä 1,2 s jahdin jälkeen). Painallukset lasketaan (`peli.irti` yhteensä), peliin ne eivät vaikuta. Loppuruudussa yksi kommentti 100:n kirjastosta, sävy painallusten mukaan: 0 sarkastinen, 1–2 sekoitus, 3–6 enimmäkseen vilpitön, 7+ vilpitön (`peli_irti0…3`). Otsikko ”Kiinni jäit” + nappi ”En jäänyt” → ”Pelihahmo jäi kiinni” ja ”ai niin” -repliikki (`peli_enjaanyt`, 12). Vanhat `caught`/`starved`/pallo-loppurepliikit eivät enää näy loppuruudussa.
- **v10 (Emilin sisältöpankki):** noin 430 repliikkiä tilanteittain (Minän jaksot, kasvi, uloshengityksen vaiheet, Pilvikyyti, Lajittelija, kynä, Huoli, Hiljaisuus, Tarkkailijan vaiheet, meditoija, Odotus ja ”lähes täynnä”, Sokkelon valikko, tauko, ennätys ja pallurat loppuruudussa, Tilastot ja varmuuskopio, yleiset). 80 koania ja 51 ajatusta master-tiedoissa (Erä 5 / Erä 4). Taukorepliikit ovat näkymäkohtaisia.

- **Linja (Emil 24.10.):** vitsiä ei sanota ääneen eikä harjoituksen ideaa selitetä; se näkyy auringon ja pilven toksisesta hehkutuksesta. Harjoituksissa aurinko ja pilvi puhuvat vain sen harjoituksen repliikkejä (Typerä kynä, Koanikone, Odotus tehty; muissa vielä osin yleisiä).
- **Laskeutuva aurinko ja pilvi (v7–8):** Typerässä kynässä, Odotuksessa ja Koanikoneessa ne laskeutuvat 6 sekunnissa yläreunasta napin yläpuolelle (`crewOn(slot)`), otsikkorivi piiloutuu siksi aikaa.

- **Välilehdet:** Minä · Harjoitukset · Sokkelo. Alapalkki kiinni alareunassa.
- **Harjoitukset-lista:** kasvi, sitten Uloshengitys, Pilvikyyti, Lajittelija, Typerä kynä, Ratkaistava vai elettävä, Koanikone, Hiljaisuus, Tarkkailijan jäljillä, Meditoija, Odotus. Tilastot ja tallennus linkkinä otsikon vieressä.
- **Kasvi ja uloshengityslaskuri (v4):** kaikki pohjassa pidetty aika mistä tahansa harjoituksesta kertyy (`puhallus`). Kasvi saa lehtiä sekuntien mukaan (enintään 30) ja mököttää, jos 36 tuntiin ei ole hengitetty ulos.
- **Uloshengitys:** yksi ruutu, ei vieritystä. Aika ensimmäisestä painalluksesta viimeiseen irrotukseen, suhde ulos ÷ irti. Palkki alkaa 10 s:sta ja elää käytön mukaan: keskiarvo × 1,05, nousee heti, laskee puolet erosta, rajat 2–90 s. Ei käsisäätöä.
- **Pilvikyyti (v4):** ajatus pilven alle, pilvi liikkuu vain kun nappi on pohjassa (noin 6 s ruudun yli). Ajatusta ei tallenneta.
- **Lajittelija (v4):** neljä isoa nappia (ajatus, tunne, aistimus, kehotuntemus), Valmis näyttää jakauman.
- **Odotus (v4, v8):** Zenon palkki, täyttö 1 − 2^(−t/8 s), ei koskaan 100 %. Nappi ”Päätä harjoitus” vaihtaa tekstiään joka painalluksella (10 tekstiä), vasta viimeinen ”Luovutan” päättää. Ei selittäviä huomautuksia.
- **Typerä kynä (v5, v7):** valitus → ”Huomaan ajattelevani, että …”, ”Ajattelen vieläkin” lisää kerroksen. Ruutu ei kasva: fontti pienenee 19 → 11 px, sitten laatikko vierii sisäisesti. Ohje vaihtuu joka painalluksella (14 ohjetta). Omat repliikit (alku, ensimmäinen, ~50 hehkutusta, odotus). Vain määrä ja syvin kerros tallentuvat.
- **Ratkaistava vai elettävä (v5):** huoli, sitten Ratkaistava (yksi pieni seuraava askel), Elettävä tai En tiedä (→ elettävä: yksi uloshengitys pohjassa, ”Se on edelleen tässä. Ja niin olet sinäkin.”). Tekstejä ei tallenneta, vain määrät.
- **Koanikone (v5, v7):** ei ohjetekstiä. Aluksi aurinko tai pilvi heittää piikin (”tässäpä sulle ajateltavaa”), sitten ne sanovat koanit vuorotellen puhekuplassa (koani myös isona keskellä). En tiedä, Seuraava ja Hengitä ulos -nappi. koanit upotetaan rakennusvaiheessa tiedostosta `master-tiedot/headmaze/koanit.md`.
- **Hiljaisuus (v5):** aurinko ja pilvi lupaavat minuutin hiljaisuuden ja keskeyttävät 5–12 s välein. Huomasin-laskuri, lopuksi vain huomausten määrä.
- **Tarkkailijan jäljillä (v5):** 10 ohjattua kohtaa ajastetuin tauoin (ääni, kuuleminen, esine, katsoja, ajatus, huomaaminen, hengitys). Sama polkumoottori kuin Minässä.
- **Meditoija (v5):** tyytyväinen meditoija risti-istunnassa, lepattavat kynttilät, kehä. Ajatuskuplia 2,5–4 s välein, enintään 3 kerrallaan, kukin 5–6 s. Ajatukset: tekoälyn aloituslista + `master-tiedot/headmaze/meditoijan-ajatukset.md`. Aika tallentuu, kun näkymästä poistutaan (yli 5 s).
- **Minä:** 39 kohtaa: 1–6 Emilin tekstiä, 7–39 tekoälyn käsikirjoitus ja ”tietoinen”-silmukka. Vastaukset eivät tallennu.
- **Sokkelo v6:** vihreät pallurat (6 kartalla, uusi tilalle ≥ 8 askeleen päähän) täydentävät palkkia +22 %; palkki tyhjenee Helppo 80 s / Normaali 50 s / Vaikea 30 s, nollassa peli päättyy. Pallurat näkyvät isossa näkymässä ja pikkukartassa (hipat eivät). Ääni: 0,7 + 8,3 · vauhti^2,1 ruutua (täysi juoksu 9, hiipiminen ~1). Hipat 1–5 tai 6-7 (arpa). Ennätys = kerätyt pallurat kartta:hipat:taso-kohtaisesti.
- **Sokkelo-peli:** vaakatasossa koko ruudulle, noin neljäsosa kartasta näkyvissä, pieni kartta vasemmalla ylhäällä, tatti vasemmalla alhaalla, 1–4 hippaa (oletus 2), valokeilat, ääni vauhdin mukaan, viisi karttaa, ennätykset.
- **Puhekupla:** väkänen osoittaa puhujaa. Repliikit sekaisin pussista tilanteittain.
- **Tallennus** `localStorage` avaimella `headmaze:v1`, `ver:3`: `{target,sessions[],puhallus,lastOut,laji[],pilvi:{n},odotus:{n,best,parasPct},peli:{kartta,hipat,best},muut:{kyna,kynaSyvin,ratk,elett,hilj,huom,tark,koani,entieda,medit,meditSek}}`. `muut` lisättiin v5:ssä; vanhat tiedot luetaan ja puuttuvat laskurit nollataan, joten muoto ei vaihtunut. Varmuuskopio `{app,ver,savedAt,data}`.
- **Rakennus:** koanit ja meditoijan ajatukset upotetaan `index.html`:ään rakennusvaiheessa master-tiedoista. Kun niitä muokataan siellä, appi pitää rakentaa uudelleen, jotta muutos näkyy.
- **Testit** `sh headmaze/testit/aja.sh`: logiikka nodella (hengitys, peli, harjoitukset) ja selain tietokoneen Chromiumissa (390 ja 320 px pystyssä, 844 ja 568 px vaakatasossa pelille).

## Ei tarkistettu

- Alapalkki kotinäytön appina: v7 pienensi alapalkin alatyhjää ja venyttää rungon näytön alareunaan, jos iOS jättää sen lyhyeksi. Ei kokeiltu oikealla iPhonella.
- Pallurapalkin vaikeus (80/50/30 s, +22 %) on arvaus.
- Harhautuksen arvot (20 s, 10 ruutua, ääni 9 ruutua) ovat arvauksia; kahden peukalon yhtäaikainen käyttö puhelimella kokeilematta.
- Kuiskausnapin kohta ja vilkkeen voimakkuus puhelimella; ehtiikö sitä painaa jahdin keskellä peukalolla.
- Testi ”pisinkin koani mahtuu kuplaan” 320 px:ssä on epävakaa (meni välillä läpi, välillä ei, myös ilman v11:n muutoksia).

- Oikea iPhone: pitkä painallus Safarissa, tatin tuntuma, pelin sujuvuus, kotinäytön appi, näppäimistön käytös tekstikentissä (Typerä kynä, Huoli).
- Pelin vaikeus ja arvot ovat tekoälyn arvauksia.
- Tekoälyn kirjoittamia, Emil ei ole lukenut: Minä-kohdat 7–39, Tarkkailijan jäljillä, kaikki repliikit, meditoijan aloituslista, koanit ja ajatukset (karsittaviksi).

## Seuraavaksi

- Emil kokeilee puhelimella uudet harjoitukset ja karsii koaneja ja meditoijan ajatuksia master-tiedoissa.
- Ei jonossa: Kehokartta (Emil: ei nyt).

## Avoimet kysymykset

- Palkin sääntö (keskiarvo + 5 %, alas puolet erosta): sopiiko?
- Harjoitusten järjestys listalla: tekoälyn valitsema, Emil voi määrätä oman.
- Nimi on sanaleikki tunnetusta appista: omassa käytössä ok, laajemmin mietittävä.

## Emilin kommentit

- (tyhjä)
