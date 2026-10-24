# Headmaze: tila

**Vaihe:** kehittelyssä · **Versio:** 5 · **Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/headmaze/ · **Päivitetty:** 24.10.2026

Mindfulnessia kieli poskessa (Headspace → Headmaze), omana appinaan (Emil 24.10.2026). Ilme: tumma tausta, sinapinkeltainen ja vähän kuvottava tehosteväri, yliiloinen aurinko ja pilvi vittuilevat puhekuplassa, sokkeloestetiikka. Ilme on tarkoituksella oma eikä Appipaja 2.0:n teemarekisteri.

## Valmiina (versio 5, 24.10.2026)

- **Välilehdet:** Minä · Harjoitukset · Sokkelo. Alapalkki kiinni alareunassa.
- **Harjoitukset-lista:** kasvi, sitten Uloshengitys, Pilvikyyti, Lajittelija, Typerä kynä, Ratkaistava vai elettävä, Koanikone, Hiljaisuus, Tarkkailijan jäljillä, Meditoija, Odotus. Tilastot ja tallennus linkkinä otsikon vieressä.
- **Kasvi ja uloshengityslaskuri (v4):** kaikki pohjassa pidetty aika mistä tahansa harjoituksesta kertyy (`puhallus`). Kasvi saa lehtiä sekuntien mukaan (enintään 30) ja mököttää, jos 36 tuntiin ei ole hengitetty ulos.
- **Uloshengitys:** yksi ruutu, ei vieritystä. Aika ensimmäisestä painalluksesta viimeiseen irrotukseen, suhde ulos ÷ irti. Palkki alkaa 10 s:sta ja elää käytön mukaan: keskiarvo × 1,05, nousee heti, laskee puolet erosta, rajat 2–90 s. Ei käsisäätöä.
- **Pilvikyyti (v4):** ajatus pilven alle, pilvi liikkuu vain kun nappi on pohjassa (noin 6 s ruudun yli). Ajatusta ei tallenneta.
- **Lajittelija (v4):** neljä isoa nappia (ajatus, tunne, aistimus, kehotuntemus), Valmis näyttää jakauman.
- **Odotus (v4):** Zenon palkki, täyttö 1 − 2^(−t/8 s), prosentit tarkkoina merkkijonoina, ei koskaan 100 %. Puolentoista minuutin jälkeen huomautus odottamisesta.
- **Typerä kynä (v5):** valitus → ”Huomaan ajattelevani, että …”, Vielä kerran lisää kerroksen. Vain määrä ja syvin kerros tallentuvat.
- **Ratkaistava vai elettävä (v5):** huoli, sitten Ratkaistava (yksi pieni seuraava askel), Elettävä tai En tiedä (→ elettävä: yksi uloshengitys pohjassa, ”Se on edelleen tässä. Ja niin olet sinäkin.”). Tekstejä ei tallenneta, vain määrät.
- **Koanikone (v5):** yksi koani kerrallaan pussista (ei toistoa ennen kuin kaikki nähty), En tiedä, Seuraava ja Hengitä ulos -nappi (kertyy laskuriin). koanit upotetaan rakennusvaiheessa tiedostosta `master-tiedot/headmaze/koanit.md`.
- **Hiljaisuus (v5):** aurinko ja pilvi lupaavat minuutin hiljaisuuden ja keskeyttävät 5–12 s välein. Huomasin-laskuri, lopuksi yhteenveto.
- **Tarkkailijan jäljillä (v5):** 10 ohjattua kohtaa ajastetuin tauoin (ääni, kuuleminen, esine, katsoja, ajatus, huomaaminen, hengitys). Sama polkumoottori kuin Minässä.
- **Meditoija (v5):** tyytyväinen meditoija risti-istunnassa, lepattavat kynttilät, kehä. Ajatuskuplia 2,5–4 s välein, enintään 3 kerrallaan, kukin 5–6 s. Ajatukset: tekoälyn aloituslista + `master-tiedot/headmaze/meditoijan-ajatukset.md`. Aika tallentuu, kun näkymästä poistutaan (yli 5 s).
- **Minä:** 39 kohtaa: 1–6 Emilin tekstiä, 7–39 tekoälyn käsikirjoitus ja ”tietoinen”-silmukka. Vastaukset eivät tallennu.
- **Sokkelo-peli:** vaakatasossa koko ruudulle, noin neljäsosa kartasta näkyvissä, pieni kartta vasemmalla ylhäällä, tatti vasemmalla alhaalla, 1–4 hippaa (oletus 2), valokeilat, ääni vauhdin mukaan, viisi karttaa, ennätykset.
- **Puhekupla:** väkänen osoittaa puhujaa. Repliikit sekaisin pussista tilanteittain.
- **Tallennus** `localStorage` avaimella `headmaze:v1`, `ver:3`: `{target,sessions[],puhallus,lastOut,laji[],pilvi:{n},odotus:{n,best,parasPct},peli:{kartta,hipat,best},muut:{kyna,kynaSyvin,ratk,elett,hilj,huom,tark,koani,entieda,medit,meditSek}}`. `muut` lisättiin v5:ssä; vanhat tiedot luetaan ja puuttuvat laskurit nollataan, joten muoto ei vaihtunut. Varmuuskopio `{app,ver,savedAt,data}`.
- **Rakennus:** koanit ja meditoijan ajatukset upotetaan `index.html`:ään rakennusvaiheessa master-tiedoista. Kun niitä muokataan siellä, appi pitää rakentaa uudelleen, jotta muutos näkyy.
- **Testit** `sh headmaze/testit/aja.sh`: logiikka nodella (hengitys, peli, harjoitukset) ja selain tietokoneen Chromiumissa (390 ja 320 px pystyssä, 844 ja 568 px vaakatasossa pelille).

## Ei tarkistettu

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
