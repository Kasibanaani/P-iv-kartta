# Laakson tarkistukset

Aja repon juuresta `sh laakso/testit/aja.sh`. Ei riippuvuuksia: Node.js lukee moottorin suoraan tuotannon HTML:stä, joten testissä ei ole erillistä kopiota pelilogiikasta. `--report` tulostaa lisäksi muutaman sijoitustavan esimerkkitulokset siemenellä 42; niitä ei pidä tulkita tasapainon todistukseksi.

15 testikokonaisuutta. Viimeinen pelaa 100 eri laaksoa loppuun ja tarkastaa tallennuksen sekä taloudelliset invariantit joka kuukaudelta. Molemmat JavaScript-lohkot tarkistetaan jäsentyviksi.

Selaintarkistukset 31.10.2026: tietokoneen Chromium, puhelimen levyiset upotukset 390/320 px ja tietokoneen 1440/1280 px. Sivun kaikki neljä näkymää, kartan yrityksen valinta, selvitys, sijoitus, kuukauden eteneminen, salkku, harmaa tumma teema, tekstivienti ja vahvistettu tekstipalautus. Tarkistettu, ettei 320 px näkymissä ole vaakaylivuotoa. Ei oikean iPhonen/Safarin testiä; tiedoston lataus ja palautus tiedostovalitsimella jäivät laitteella varmistettaviksi.

Toista UI-testi omalla uudella pelillä: tutki yritys, sijoita 100–250 kultaa, etene kuukausi, tarkista salkku ja kirjanpito, vie tekstivarmuuskopio ja palauta se. Varmista, että sama kuukausi, käteinen ja omistus palaavat. Testaa vasta sitten uusi peli ja vahvista poistaminen.
