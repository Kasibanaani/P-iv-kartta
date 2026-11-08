# Ohjelmamoodi: suunnitelma (ei rakennettu)

Emilin idea 8.11.2026. Tila: **ehdotus, odottaa Emilin hyväksyntää.** Tätä ei ole toteutettu.

## Mitä Emil näkee

- Moodi kytketään päälle Liikkeet → Kaikki liikkeet. Kun se on pois päältä, appi toimii kuten nyt.
- Jokaisen liikkeen kortissa Treeni-näkymässä on valmiina kaksi riviä:
  - Sarja 1: esim. 80 kg × 10
  - Sarja 2: esim. 80 kg × 9
- Jokaisella rivillä on kolme nappia: **Tehty**, **Vajaa** ja **Ohita**.
  - Tehty kirjaa sarjan suosituksen mukaisena ja aikaleiman kuten nyt.
  - Vajaa avaa toistokentän, jossa kursori on valmiina. Siihen kirjoitetaan todellinen määrä ja painetaan OK. Kenttään voi kirjoittaa myös suositusta suuremman luvun.
  - Ohita jättää sarjan kirjaamatta, eikä se vaikuta seuraavaan suositukseen.
- Painoa voi muuttaa napauttamalla sitä. Tätä tarvitaan, jos teline on varattu tai jos Emil haluaa kokeilla eri painoa.
- Kolmannen ja sitä seuraavat sarjat kirjataan + Sarja -napilla kuten nyt.
- Appi ei tarvitse tietoa siitä, mitä liikkeitä Emil tekee tänään. Molempien sarjojen suositukset ovat aina valmiina jokaiselle liikkeelle.

## Logiikka

Logiikka on tuplaprogressio liikkeen omalla toistoalueella (min–max), sarjat 1 ja 2.

1. **Lähtökohta** on liikkeen viimeisin kerta, jolloin sarja 1 on kirjattu.
2. **Eteneminen:**
   - Jos sarja 1 meni vähintään suositellut toistot, seuraava suositus on +1 toisto samalla painolla.
   - Jos toistot ylittäisivät liikkeen maksimin, paino nousee yhdellä painoaskeleella. Toistomäärä lasketaan uudelle painolle maksimiarviosta (Epley) ja rajataan alueelle min–max. Käytännössä se osuu lähelle minimiä.
3. **Vajaa sarja:**
   - Jos sarja 1 jää alle suosituksen, seuraavalla kerralla toistetaan sama tavoite.
   - Jos sarja jää kahdesti peräkkäin alle minimin, paino laskee yhdellä askeleella.
4. **Sarja 2:**
   - Paino on sama kuin sarjassa 1.
   - Toistot ovat sarjan 1 toistot miinus ero. Oletusero on 1 toisto.
   - Ero opitaan Emilin omasta historiasta: mediaani siitä, paljonko sarja 2 on jäänyt sarjasta 1 samalla painolla viimeisten kuuden kerran aikana.
   - Liikkeen asetuksissa eron voi lukita käsin.
5. **Tauko:** laskenta perustuu päiviin liikkeen edellisestä kerrasta.
   - 0–10 pv: normaali eteneminen.
   - 11–21 pv: ei nousua. Suositus on sama kuin viimeksi tehty.
   - 22–42 pv: paino noin −5 %, pyöristettynä painoaskeleeseen.
   - Yli 42 pv: paino noin −10 %.
   - Tauon vaikutus näkyy kortissa yhdellä rivillä, esim. ”Tauko 18 pv: ei nousua tällä kertaa”.

## Mihin logiikka perustuu

Tämä osio kertoo, mikä kohta on tutkimusta ja mikä oma arvio.

- **Toistojen ja painon nostaminen ovat yhtä hyviä kasvun ärsykkeitä.** Plotkin ym. 2022 (PeerJ) vertasivat painon nostamista toistojen lisäämiseen. Kahdeksan viikon jälkeen lihaskasvu ja voima olivat käytännössä samat. Tuplaprogressio yhdistää molemmat. https://peerj.com/articles/14142
- **Toistot laskevat sarjasta toiseen samalla painolla.** Esimerkiksi Willardson & Burkett 2006 havaitsivat, että raskailla painoilla toistoja katoaa sarjojen välillä vielä 3 minuutin levolla. Ero on sitä pienempi, mitä pidempi lepo on. Oletus ”noin yksi toisto vähemmän” on siis kohtuullinen lähtöarvo. Ero opitaan Emilin omasta datasta, koska se riippuu liikkeestä, levosta ja ihmisestä. https://read.qxmd.com/read/16686571/
- **Lyhyt tauko ei juuri vie voimaa.** Bosquet ym. 2013 (meta-analyysi, Scand J Med Sci Sports) havaitsivat, että maksimivoima säilyy treenatuilla yleensä noin 3 viikkoa ja laskee sen jälkeen. Hwang ym. 2017 eivät havainneet voiman tai lihaksen paksuuden laskua kolmen viikon tauon jälkeen. Ogasawara ym. 2013 havaitsivat, että toistuvat kolmen viikon tauot eivät heikentäneet pitkän aikavälin tuloksia. https://zendy.io/title/10.1111/sms.12047 · https://pubmed.ncbi.nlm.nih.gov/21771261/
- **Taukojen tarkat rajat ja prosentit ovat oma arvioni.** Tutkimukset näyttävät suunnan: 2–3 viikkoa ei juuri pudota voimaa, mutta silloin ei kannata odottaa nousuakaan. Niistä ei voi lukea suoraan lukuja, kuten ”22 päivää = −5 %”. Rajat ovat asetuksia, joita Emil voi säätää.
- **Maksimiarvio (Epley) on arvio.** Se on tarkimmillaan alle kymmenen toiston sarjoissa. Siksi sitä käytetään vain painonnostohetkellä uuden toistomäärän arvioimiseen, ei päätöksen pohjana.

## Huonot puolet ja riskit

- ”Tehty” ei kerro, oliko sarjassa varaa. Jos Emil olisi jaksanut kolme toistoa lisää, nousu etenee varmuuden vuoksi yhden toiston kerrallaan. Se on hitaampaa, mutta turvallista. Vaihtoehto: Vajaa-kenttään saa kirjoittaa myös suuremman luvun, jolloin appi hyppää suoraan.
- Suositus perustuu vain kahteen ensimmäiseen sarjaan. Jos Emil vaihtelee järjestystä paljon ja liike on joskus treenin ensimmäinen ja joskus viimeinen, suositus heiluu. Järjestysanalyysi voi myöhemmin kertoa, kuinka paljon.
- Kahden peräkkäisen vajaan jälkeinen pudotus on yksinkertainen sääntö. Se ei erota huonoa päivää todellisesta jumista.

## Avoimet kysymykset Emilille

1. Pitääkö Ohita-napin näkyä, vai riittääkö, että sarjan jättää koskematta? Ehdotus: ei Ohita-nappia, koska koskematon sarja on jo ohitettu.
2. Suositellaanko sarjalle 2 aina samaa painoa kuin sarjalle 1? Ehdotus: kyllä.
3. Pitääkö tauon rajojen (10 / 21 / 42 pv) näkyä asetuksissa vai vain toimia taustalla?
4. Onko moodi päällä kaikille liikkeille, vai voiko sen kytkeä liikekohtaisesti? Ehdotus: liikekohtaisesti, oletuksena kaikille.

## Linjakkuus

- Moodi on laajennus: kun se on pois päältä, peruskäyttö ei muutu.
- Suositus käyttää nykyisiä liikeasetuksia (min, ideaali, max, painoaskel). Uusia kenttiä tulee yksi: sarjan 2 ero.
- Kirjattu sarja tallentuu samaan muotoon kuin nyt. Tallennusmuoto ei muutu, paitsi liikkeen uusi valinnainen kenttä.
