# Hakemisto

Tästä löytää oikean kohdan nopeasti. Tekoäly: etsi ensin tehtävä alta, lue sitten linkitetty kohta ja sen viereiset rajat (*Huomio*). Jos asiaa ei löydy manuaalista, sano käyttäjälle, ettei manuaali tunne sitä, äläkä keksi painiketta.

## Tehtävähakemisto: haluan…

| Haluan… | Näin | Lue |
|---|---|---|
| aloittaa alusta | uusi projekti ja ensimmäinen appi | [Aloitus](01-aloitus.md#ensimmäinen-appi-vesilasit) |
| lisätä palikan | vedä paletista tai napauta | [Työympäristö: Paletti](02-tyoymparisto.md#palikan-lisääminen) |
| kytkeä palikat yhteen | nuoli logiikassa lähtökohdasta tulokohtaan | [Nuolen vetäminen](02-tyoymparisto.md#nuolen-vetäminen) |
| näyttää arvon tekstissä | `@viite` (tai `{viite}`) tekstikentässä | [Teksti ja upotetut viitteet](03-nakymapalikat.md#teksti-ja-upotetut-viitteet) |
| vaihtaa viittausmerkin (`@`, `§`, `{ }`) | Asetukset → Muokkaus → Viittaus tekstissä | [Tekstiin upotetut viitteet](06-kaavat.md#tekstiin-upotetut-viitteet) |
| nähdä muokatessa, mistä palikan teksti tulee | viitelappu palikan yläpuolella (Asetukset → Näytä viitteet muokatessa) | [Teksti ja upotetut viitteet](03-nakymapalikat.md#teksti-ja-upotetut-viitteet) |
| kirjoittaa tekstin suoraan näkymän palikkaan | kaksoisnapsauta palikkaa tai valitse ja paina Enter | [Teksti ja upotetut viitteet](03-nakymapalikat.md#teksti-ja-upotetut-viitteet) |
| tehdä logiikan tuloksesta näkymään palikan yhdellä napautuksella | paneelin ▢ Tee näkymään tai N | [Tee näkymään](06-kaavat.md#tee-näkymään) |
| tehdä Toiminnolle painike, Ketjulle käynnistysnappi, Muistille syöttökenttä, taulukolle Toistin tai Sekuntikellolle napit | paneelin Tee näkymään ▾ | [Tee näkymään](06-kaavat.md#tee-näkymään) |
| kirjoittaa palikan kenttään viitteen tai laskun (`@alku + 5`) | arvokenttä (Lasku, Vertailu, Toiminnon Uusi arvo, Liikkeen nopeus …) | [Arvokenttä](06-kaavat.md#arvokenttä-kaava-suoraan-paneelin-kentässä) |
| laskea jotain | Kaava tai Lasku | [Kaavat](06-kaavat.md#kaavan-syntaksi), [Lasku](04-logiikkapalikat.md#lasku-lasku) |
| muuttaa laskujärjestystä | sulut: `(sarake - 1) * 80` | [Laskutoimitukset](06-kaavat.md#laskutoimitukset) |
| tehdä arvon nimestä, jonka kirjoitin kaavaan | ehdotusrivin ＋ Luo Arvo ”nimi”, tai vahvista kaava ja vastaa kysymykseen OK | [Ehdotusrivi](06-kaavat.md#ehdotusrivi) |
| tehdä joukon (ja Joukko-palikan) kaavaan kirjoittamastani #nimestä | vahvista kaava ja vastaa *Joukkoa #x ei ole. Tehdäänkö?* OK, tai ＋ Luo joukko | [Joukko kaavassa](07-tieto.md#joukko-kaavassa) |
| muuttaa tekstin sanan viittaukseksi | kirjoita `@` tai alku ja napauta ehdotusta `@viite` | [Ehdotusrivi teksteissä](06-kaavat.md#ehdotusrivi-teksteissä-ja-toimintojen-kentissä-appi-appi-35) |
| antaa laskulle nimen | `nimi = lauseke` ja ＋ Luo kaavan tulos | [Kaavan tulos](04-logiikkapalikat.md#kaavan-tulos--tulos) |
| valita kahdesta arvosta ehdolla | `jos (ehto) a muuten b` tai VALITSE | [Jos, ja, tai](06-kaavat.md#jos-ja-tai) |
| näyttää tai piilottaa palikan ehdolla | Näkyvyys-osio tai nuoli kohtaan *näkyy kun* | [Näkyvyys-osio](03-nakymapalikat.md#näkyvyys-osio) |
| värittää projektin omilla väreillä tai vaihtaa koko paletin | Asetukset → Projektin käyttönäkymän ilme → Oma väri, Palikoiden paletti, Paikat 1–8 | [Paletti ja oma väri](03-nakymapalikat.md#paletti-ja-oma-väri-projektin-asetus) |
| pyöristää laatikon kulmat (tai tehdä terävät) | Muodon paneelin Kulmat (px), logiikassa `.kulmat` | [Muoto](03-nakymapalikat.md#muoto-muoto) |
| animoida palikan ilmestymisen tai katoamisen | Animointi-osio (palikka) tai Asetukset → Projektin animointi | [Animointi-osio](03-nakymapalikat.md#animointi-osio) |
| häivyttää tai rullata arvon vaihtuessa, liu'uttaa palikan uuteen paikkaan | Animointi-osion *Arvo vaihtuu* ja *Paikka vaihtuu* | [Animointi-osio](03-nakymapalikat.md#animointi-osio) |
| harmaannuttaa palikan | *Harmaana* tai kohta *harmaana kun* | [Näkyvyys-osio](03-nakymapalikat.md#näkyvyys-osio) |
| tehdä jotain painalluksesta | Painikkeen *Kun painetaan* → ＋ Lisää toiminto… | [Toiminto](05-ketjut-ja-toiminnot.md#toiminto-tee) |
| tehdä laatikosta, tekstistä, kuvasta tai kaaviosta painettavan (ilman Painiketta) | osio *Napautus* → *Napautettava käytössä*, tapahtuma *napautettu* | [Napautus](03-nakymapalikat.md#napautus-osio-napautus-appi-appi-68) |
| antaa palikalle oman ruudukon, jonka ruutua napautetaan, johon törmätään tai pudotetaan (näppäimistö yhtenä kuvana, liikkuva lauta) | osio *Oma ruudukko*, tapahtuma *ruutu napautettu*, `tapahtuma.ruutux/ruutuy` | [Oma ruudukko](03-nakymapalikat.md#oma-ruudukko-osio-oma-ruudukko-appi-appi-86) |
| kasvattaa laskuria | Muisti + toiminto Lisää | [Laskuri, joka muistaa](04-logiikkapalikat.md#4-laskuri-joka-muistaa) |
| yhdistää monta ehtoa | Ikkuna (JA, TAI, VÄHINTÄÄN…) tai kaavassa `a ja b`, `a tai b` | [Ikkuna](04-logiikkapalikat.md#ikkuna-ikkuna) |
| tehdä jotain ehdon alkaessa päteä | JOS (NIIN-tapahtuma) tai KUN | [JOS](04-logiikkapalikat.md#jos-jos), [KUN](04-logiikkapalikat.md#kun-kun) |
| odottaa ja tehdä vaiheittain | Ketju ja Ajastin | [Ketju](05-ketjut-ja-toiminnot.md#tapahtumaketju-ketju-ketju) |
| tehdä asioita aikataulussa (0 s, 2 s, 5 s…) tai säätimen kohdissa | Jana: Toiminnot janalle kohtiinsa | [Jana](05-ketjut-ja-toiminnot.md#jana-jana) |
| arpoa | Satunnaisluku (luku) tai Arpa (ketjun haara) | [Satunnaisluku](04-logiikkapalikat.md#satunnaisluku-satu), [Arpa](05-ketjut-ja-toiminnot.md#arpa--arpa) |
| tehdä sivuja ja siirtyä niiden välillä | näkymät, toiminto Siirry | [Näkymät](02-tyoymparisto.md#näkymät-sivut-ja-siirtyminen) |
| pitää listaa riveinä | Tietotaulukko | [Tietotaulukko](07-tieto.md#tietotaulukko-taulu) |
| hakea taulukon rivit tiedostosta GitHubista (terveys, oma appi) | Tietotaulukon Lähde, toiminto Hae tiedostosta | [Lähde](07-tieto.md#lähde-rivitiedosto-githubista) |
| tuoda tekstiä, Excelin soluja tai CSV:n taulukkoon | Tulkki… (paletti, Tieto) tai taulukkoikkunan ⇄ Liitä tekstiä… | [Tulkki](07-tieto.md#tulkki-teksti-riveiksi-tai-palikoiksi) |
| tehdä monta Arvoa kerralla tekstistä (`yöuni: 8`) | Tulkki…, Palikoiksi | [Tulkki](07-tieto.md#tulkki-teksti-riveiksi-tai-palikoiksi) |
| kirjata mitä ja milloin (historia) | Tietotaulukko → Tee kirjaushistoria, toiminto Kirjaa | [Kirjaushistoria](07-tieto.md#kirjaushistoria), [Kirjausappi](07-tieto.md#kirjausappi-mitä-otin-ja-milloin) |
| laskea päivän kirjaukset tai ajan edellisestä | `loki.tänään`, `loki.edellisestä`, Rivijoukko ehdolla `kirjaus.aika.päivä = nyt.päivä` | [Kirjaushistoria](07-tieto.md#kirjaushistoria) |
| siirtää yön kirjaukset edelliselle päivälle | Asetukset → Päivän raja | [Kirjaushistoria](07-tieto.md#kirjaushistoria) |
| muuttaa vanhan aikajanan taulukoksi | Aikajanan paneeli → Muunna historiaksi | [Aikajana](03-nakymapalikat.md#aikajana-aika) |
| näyttää jokaiselle riville kortin | Toistin | [Toistin](07-tieto.md#toistin--toistin) |
| suodattaa tai järjestää rivejä | Rivijoukko | [Rivijoukko](07-tieto.md#rivijoukko-joukko) |
| koota palikoita joukoksi ja laskea niistä (summa, keskiarvo, montako) | Tunnus-kenttään `#nimi`, kaavassa `#nimi.summa` | [Palikoiden joukot](07-tieto.md#palikoiden-joukot-nimi-appi-appi-57) |
| tehdä saman toiminnon kaikille joukon palikoille | Toiminnon Kohde: `#nimi (jokainen jäsen)` | [Toiminto kaikille jäsenille](07-tieto.md#toiminto-kaikille-jäsenille) |
| liittää palikan joukkoon vain ehdolla tai käytön aikana | ⚡ kuuluu kun; toiminnot Lisää joukkoon / Poista joukosta | [Kuuluu joukkoon kun](07-tieto.md#kuuluu-joukkoon-kun-ehdollinen-jäsenyys) |
| tehdä jotain, kun joku joukon jäsenistä painetaan, törmää tai pudotetaan | Joukko-palikan tapahtuma *jäsen …* (Jäsenten laji), Toiminnon kohde *Tapahtuman jäsen*, `tapahtuma.jäsen` | [Jäsenten tapahtumat](07-tieto.md#jäsenten-tapahtumat-appi-appi-63) |
| käydä joukon jäsenet läpi yksi kerrallaan tai laskea jäsenistä ikkunalla | Toista jäsenille, ikkuna Jäsenille (nuoli Joukko-palikan kohdasta *jäsenet*) | [Toista jäsenille](07-tieto.md#toista-jäsenille-appi-appi-63), [Ikkuna jäsenille](07-tieto.md#ikkuna-jäsenille-appi-appi-63) |
| ottaa joukkoon kaikki tietyn lajin tai näkymän palikat, rajata jäseniä ehdolla tai ohjata kaikkia jäseniä yhdellä säännöllä | Joukko-palikka: Ota mukaan, Vain jos, Säännöt jäsenille (`jäsen.x`) | [Joukko-palikka](07-tieto.md#joukko-palikka-pjoukko-appi-appi-62) |
| kerätä kolikoita tai tehdä saman asian monelle esineelle yhdellä logiikalla | rakennuslaatikon Kolikko: Alue joukossa `#kolikot`, *jäsen astuttu* → Poista joukosta (Tapahtuman jäsen) | [Jäsenten tapahtumat](07-tieto.md#jäsenten-tapahtumat-appi-appi-63) |
| nimetä tai poistaa joukon | paletti → Joukot | [Nimeä ja poista](07-tieto.md#nimeä-ja-poista-paletti) |
| laskea sarakkeen summan | `taulu.sarake.summa` tai SUMMA-ikkuna riveille | [Laske taulukon sarakkeen summa](07-tieto.md#laske-taulukon-sarakkeen-summa) |
| liikuttaa hahmoa | Liike + Tatti tai napautus | [Liike](08-maailma-ja-liike.md#liike-liike) |
| ohjata koneen näppäimistöllä (nuolet, välilyönti) | Peliohjain, pelaaja 1 | [Peliohjain](04-logiikkapalikat.md#peliohjain-pohj) |
| tunnistaa törmäyksen tai alueeseen astumisen | Este, Liikkeen *törmäsi*, Alue | [Maailma ja liike](08-maailma-ja-liike.md) |
| tehdä tasoloikan painovoiman (putoaminen, maassa, laskeutuminen, painovoiman kääntö) | Alueen osio Painovoima, Liikkeen *maassa*, *laskeutui*, `tapahtuma.puoli` | [Painovoima ja maassa](08-maailma-ja-liike.md#painovoima-ja-maassa) |
| maalata seinät, lattiat ja tasot ruudukkoon (sokkelo, tasoloikka, pohjapiirros) | Laattakartta, Maalaa | [Laattakartta](08-maailma-ja-liike.md#laattakartta-laatat) |
| tehdä liikkuvan tason tai hissin, joka kantaa päällä seisovaa | Rakennuslaatikko → Esineet → Liikkuva taso; mikä tahansa liikkuva este | [Painovoima ja maassa](08-maailma-ja-liike.md#painovoima-ja-maassa) |
| hypätä (korkeus, lyhyt hyppy, tuplahyppy, armoaika, ennakko) | Liikkeen kohta *hyppää*, osio Hyppy, tapahtuma *hyppäsi* | [Hyppy](08-maailma-ja-liike.md#hyppy) |
| tehdä syvyyttä (tausta pienempänä ja hitaampana, lähestyvä palikka) | kerrosrivin syvyys, palikan *Oma syvyys*, ominaisuudet `syvyys` ja `näkyväkoko`, Kerros-palikan `syvyys` | [Kerrokset käytössä](08-maailma-ja-liike.md#kerrokset-käytössä) |
| tehdä puhelimen muotoisen näkymän | Näkymän laite: Puhelin | [Laitemuoto](02-tyoymparisto.md#laitemuoto-vapaa-puhelin-ipad) |
| käyttää valmista appia | Lukitse | [Muokkaus ja käyttö](02-tyoymparisto.md#muokkaus-ja-käyttö-lukitse) |
| kokeilla appia niin, etteivät oikeat tiedot muutu | Kokeile | [Kokeilu](02-tyoymparisto.md#kokeilu-kokeile) |
| tallentaa ja siirtää laitteelta toiselle | automaattinen tallennus, GitHub, vienti | [Tallennus](09-tallennus.md) |
| pitää projektit vain laitteella, ei GitHubiin | Vain tällä laitteella (laite tai projekti), `?vainlaite` | [Vain tällä laitteella](09-tallennus.md#vain-tällä-laitteella-ei-githubia) |
| ottaa varmuuskopion | Varmuuskopio tai Vie kaikki projektit | [Varmuuskopio ennen isoa muutosta](09-tallennus.md#varmuuskopio-ennen-isoa-muutosta) |
| selvittää, miksi arvo on mikä on | paneelin Miksi? ja Yhteydet | [Miksi?](02-tyoymparisto.md#miksi), [Yhteydet](02-tyoymparisto.md#yhteydet) |
| kertoa tekoälylle palikasta | viestilappu | [Muisti- ja viestilaput](02-tyoymparisto.md#muisti--ja-viestilaput) |
| kumota | Kumoa (vain rakenne, ei käyttötietoja) | [Kumoa](02-tyoymparisto.md#kumoa-ja-tee-uudelleen) |
| käyttää samaa rakennetta uudestaan | suosikit, presetit, kopioi ja liitä | [Suosikit ja presetit](02-tyoymparisto.md#suosikit-ja-presetit) |
| lisätä monta samaa nopeasti (seiniä, kolikoita, hahmoja) | Rakennuslaatikko, klik klik | [Rakennuslaatikko](02-tyoymparisto.md#rakennuslaatikko) |
| aloittaa tasoloikan nopeasti (hahmo, hyppy, painovoima, vesi, tikkaat) | Rakennuslaatikko → Hahmot → Pelaaja: tasoloikka; Alueet → Painovoima-alue, Vesi, Tikkaat | [Rakennuslaatikko](02-tyoymparisto.md#rakennuslaatikko) |
| maalata laattoja rakennuslaatikosta | Rakennuslaatikko → Laatat → kartta, sitten laji | [Rakennuslaatikko](02-tyoymparisto.md#rakennuslaatikko), [Maalaus](08-maailma-ja-liike.md#maalaus) |

## Palikat

Kaikki palikkalajit. Laji on sisäinen tunniste (tallennustiedostossa `k`). ✦ = erikoispalikka.

| Palikka | Laji | Puoli | Luku |
|---|---|---|---|
| [Painike](03-nakymapalikat.md#painike-nappi) | `nappi` | Näkymä | Näkymäpalikat |
| [Valintaruutu](03-nakymapalikat.md#valintaruutu-ruutu) | `ruutu` | Näkymä | Näkymäpalikat |
| [Kytkin](03-nakymapalikat.md#kytkin-kytkin) | `kytkin` | Näkymä | Näkymäpalikat |
| [Säädin](03-nakymapalikat.md#säädin-saadin) | `saadin` | Näkymä | Näkymäpalikat |
| [Tekstikenttä](03-nakymapalikat.md#tekstikenttä-teksti) | `teksti` | Näkymä | Näkymäpalikat |
| [Lukukenttä](03-nakymapalikat.md#lukukenttä-luku) | `luku` | Näkymä | Näkymäpalikat |
| [Tatti](03-nakymapalikat.md#tatti-tatti) | `tatti` | Näkymä | Näkymäpalikat |
| [Päivämäärä](03-nakymapalikat.md#päivämäärä-pvm) | `pvm` | Näkymä | Näkymäpalikat |
| [Teksti](03-nakymapalikat.md#teksti-nayta) | `nayta` | Näkymä | Näkymäpalikat |
| [Ilmoitus](03-nakymapalikat.md#ilmoitus-ilmo) | `ilmo` | Näkymä | Näkymäpalikat |
| [Lista](03-nakymapalikat.md#lista-lista) | `lista` | Näkymä | Näkymäpalikat |
| [Aikajana](03-nakymapalikat.md#aikajana-aika) | `aika` | Näkymä | Näkymäpalikat |
| [Kaavio ✦](03-nakymapalikat.md#kaavio--kaavio) | `kaavio` | Näkymä | Näkymäpalikat |
| [Monitori ✦](03-nakymapalikat.md#monitori--mittari) | `mittari` | Näkymä | Näkymäpalikat |
| [Kuva ✦](03-nakymapalikat.md#kuva--pkuva) | `pkuva` | Näkymä | Näkymäpalikat |
| [Kalenteri](03-nakymapalikat.md#kalenteri-kalenteri) | `kalenteri` | Näkymä | Näkymäpalikat |
| [Toistin ✦](07-tieto.md#toistin--toistin) | `toistin` | Näkymä | Tieto |
| [Muoto](03-nakymapalikat.md#muoto-muoto) | `muoto` | Näkymä | Näkymäpalikat |
| [Sijainti ✦](08-maailma-ja-liike.md#sijainti--merkki) | `merkki` | Näkymä | Maailma ja liike |
| [Alue ✦](08-maailma-ja-liike.md#alue--alue) | `alue` | Näkymä | Maailma ja liike |
| [Reitti ✦](08-maailma-ja-liike.md#reitti--reitti) | `reitti` | Näkymä | Maailma ja liike |
| [Laattakartta](08-maailma-ja-liike.md#laattakartta-laatat) | `laatat` | Näkymä | Maailma ja liike |
| [Arvo](04-logiikkapalikat.md#arvo-arvo) | `arvo` | Logiikka | Logiikkapalikat |
| [Muisti](04-logiikkapalikat.md#muisti-muisti) | `muisti` | Logiikka | Logiikkapalikat |
| [Satunnaisluku](04-logiikkapalikat.md#satunnaisluku-satu) | `satu` | Logiikka | Logiikkapalikat |
| [Muutos ajassa](04-logiikkapalikat.md#muutos-ajassa-muutos) | `muutos` | Logiikka | Logiikkapalikat |
| [Sekuntikello](04-logiikkapalikat.md#sekuntikello-kello) | `kello` | Logiikka | Logiikkapalikat |
| [Peliohjain](04-logiikkapalikat.md#peliohjain-pohj) | `pohj` | Logiikka | Logiikkapalikat |
| [Kerros ✦](04-logiikkapalikat.md#kerros--kerros) | `kerros` | Logiikka | Logiikkapalikat |
| [Kamera ✦](04-logiikkapalikat.md#kamera--kamera) | `kamera` | Logiikka | Logiikkapalikat |
| [Liike](08-maailma-ja-liike.md#liike-liike) | `liike` | Logiikka | Maailma ja liike |
| [Käyrä](04-logiikkapalikat.md#käyrä-kayra) | `kayra` | Logiikka | Logiikkapalikat |
| [Lasku](04-logiikkapalikat.md#lasku-lasku) | `lasku` | Logiikka | Logiikkapalikat |
| [Vertailu](04-logiikkapalikat.md#vertailu-vert) | `vert` | Logiikka | Logiikkapalikat |
| [Kaava](04-logiikkapalikat.md#kaava-kaava) | `kaava` | Logiikka | Logiikkapalikat |
| [Kaavan tulos ✦](04-logiikkapalikat.md#kaavan-tulos--tulos) | `tulos` | Logiikka | Logiikkapalikat |
| [Tänään](04-logiikkapalikat.md#tänään-tanaan) | `tanaan` | Logiikka | Logiikkapalikat |
| [Päivämäärän osa](04-logiikkapalikat.md#päivämäärän-osa-pvmosa) | `pvmosa` | Logiikka | Logiikkapalikat |
| [JOS](04-logiikkapalikat.md#jos-jos) | `jos` | Logiikka | Logiikkapalikat |
| [VALITSE](04-logiikkapalikat.md#valitse-valitse) | `valitse` | Logiikka | Logiikkapalikat |
| [Hakutaulukko](04-logiikkapalikat.md#hakutaulukko-haku) | `haku` | Logiikka | Logiikkapalikat |
| [KUN](04-logiikkapalikat.md#kun-kun) | `kun` | Logiikka | Logiikkapalikat |
| [Ikkuna](04-logiikkapalikat.md#ikkuna-ikkuna) | `ikkuna` | Logiikka | Logiikkapalikat |
| [Ryhmä ✦](04-logiikkapalikat.md#ryhmä--ryhma) | `ryhma` | Logiikka | Logiikkapalikat |
| [Ketju](05-ketjut-ja-toiminnot.md#tapahtumaketju-ketju-ketju) | `ketju` | Logiikka | Toiminnot ja ketjut |
| [Jana](05-ketjut-ja-toiminnot.md#jana-jana) | `jana` | Logiikka | Toiminnot ja ketjut |
| [Ajastin ✦](05-ketjut-ja-toiminnot.md#ajastin--ajastin) | `ajastin` | Logiikka | Toiminnot ja ketjut |
| [Ehto ✦](05-ketjut-ja-toiminnot.md#ehto--haara) | `haara` | Logiikka | Toiminnot ja ketjut |
| [Odota, kunnes ✦](05-ketjut-ja-toiminnot.md#odota-kunnes--odota) | `odota` | Logiikka | Toiminnot ja ketjut |
| [Arpa ✦](05-ketjut-ja-toiminnot.md#arpa--arpa) | `arpa` | Logiikka | Toiminnot ja ketjut |
| [Toista ✦](05-ketjut-ja-toiminnot.md#toista--toista) | `toista` | Logiikka | Toiminnot ja ketjut |
| [Ketjun tulos ✦](05-ketjut-ja-toiminnot.md#ketjun-tulos--ktulos) | `ktulos` | Logiikka | Toiminnot ja ketjut |
| [Lopeta ketju ✦](05-ketjut-ja-toiminnot.md#lopeta-ketju--lopeta) | `lopeta` | Logiikka | Toiminnot ja ketjut |
| [Monta haaraa ✦](05-ketjut-ja-toiminnot.md#monta-haaraa--monihaara) | `monihaara` | Logiikka | Toiminnot ja ketjut |
| [Teksti ilmestyy ✦](05-ketjut-ja-toiminnot.md#efektit--teksti-ilmestyy-ilmesty-kuva-vaihtuu-kuva-animaatio-anim-näkymänvaihto-nvaihto) | `ilmesty` | Logiikka | Toiminnot ja ketjut |
| [Kuva vaihtuu ✦](05-ketjut-ja-toiminnot.md#efektit--teksti-ilmestyy-ilmesty-kuva-vaihtuu-kuva-animaatio-anim-näkymänvaihto-nvaihto) | `kuva` | Logiikka | Toiminnot ja ketjut |
| [Animaatio ✦](05-ketjut-ja-toiminnot.md#efektit--teksti-ilmestyy-ilmesty-kuva-vaihtuu-kuva-animaatio-anim-näkymänvaihto-nvaihto) | `anim` | Logiikka | Toiminnot ja ketjut |
| [Näkymänvaihto ✦](05-ketjut-ja-toiminnot.md#efektit--teksti-ilmestyy-ilmesty-kuva-vaihtuu-kuva-animaatio-anim-näkymänvaihto-nvaihto) | `nvaihto` | Logiikka | Toiminnot ja ketjut |
| [Toiminto](05-ketjut-ja-toiminnot.md#toiminto-tee) | `tee` | Logiikka | Toiminnot ja ketjut |
| [Tietotaulukko](07-tieto.md#tietotaulukko-taulu) | `taulu` | Logiikka | Tieto |
| [Tapahtuman tiedot](07-tieto.md#tapahtuman-tiedot-tapaht) | `tapaht` | Logiikka | Tieto |
| [Rivi](07-tieto.md#rivi-trivi) | `trivi` | Logiikka | Tieto |
| [Rivijoukko](07-tieto.md#rivijoukko-joukko) | `joukko` | Logiikka | Tieto |
| [Joukko ✦](07-tieto.md#joukko-palikka-pjoukko-appi-appi-62) | `pjoukko` | Logiikka | Tieto |

## Reseptit

Kokeiltavat vaiheohjeet lukujen lopussa.

- [Ensimmäinen appi: vesilasit](01-aloitus.md#ensimmäinen-appi-vesilasit) (Aloitus, kokeiltu selaimessa)
- [Kaksi palikkaa nuolella yhteen (kytkin näyttää ja piilottaa tekstin)](02-tyoymparisto.md#kaksi-palikkaa-nuolella-yhteen-kytkin-näyttää-ja-piilottaa-tekstin) (Työympäristö)
- [Uusi näkymä ja siirtyminen sinne](02-tyoymparisto.md#uusi-näkymä-ja-siirtyminen-sinne) (Työympäristö)
- [Vaihtoehtoryhmä pikaluonnilla](02-tyoymparisto.md#vaihtoehtoryhmä-pikaluonnilla) (Työympäristö)
- [Viestilappu tekoälylle palikasta](02-tyoymparisto.md#viestilappu-tekoälylle-palikasta) (Työympäristö)
- [Painike, joka näyttää montako kertaa painettu](03-nakymapalikat.md#painike-joka-näyttää-montako-kertaa-painettu) (Näkymäpalikat)
- [Säädin ohjaa Monitoria](03-nakymapalikat.md#säädin-ohjaa-monitoria) (Näkymäpalikat)
- [Lisäkysymys näkyy vasta, kun ruutu on rastitettu](03-nakymapalikat.md#lisäkysymys-näkyy-vasta-kun-ruutu-on-rastitettu) (Näkymäpalikat)
- [Lappu, jonka voi raahata vain laatikkoon](03-nakymapalikat.md#lappu-jonka-voi-raahata-vain-laatikkoon) (Näkymäpalikat)
- [Laske kahden luvun summa](04-logiikkapalikat.md#1-laske-kahden-luvun-summa) (Logiikkapalikat)
- [Näytä viesti vain kun ehto pätee (JOS)](04-logiikkapalikat.md#2-näytä-viesti-vain-kun-ehto-pätee-jos) (Logiikkapalikat)
- [Kolmesta valintaruudusta vähintään kaksi (Ikkuna)](04-logiikkapalikat.md#3-kolmesta-valintaruudusta-vähintään-kaksi-ikkuna) (Logiikkapalikat)
- [Laskuri, joka muistaa](04-logiikkapalikat.md#4-laskuri-joka-muistaa) (Logiikkapalikat)
- [Painikkeesta kasvava laskuri (Toiminto Lisää)](05-ketjut-ja-toiminnot.md#painikkeesta-kasvava-laskuri-toiminto-lisää) (Toiminnot ja ketjut)
- [Ajastettu muistutus 10 s päästä](05-ketjut-ja-toiminnot.md#ajastettu-muistutus-10-s-päästä) (Toiminnot ja ketjut)
- [Haarautuva kysymys (Ehto)](05-ketjut-ja-toiminnot.md#haarautuva-kysymys-ehto) (Toiminnot ja ketjut)
- [Odota vastausta enintään minuutti](05-ketjut-ja-toiminnot.md#odota-vastausta-enintään-minuutti) (Toiminnot ja ketjut)
- [Ehdollinen teksti jos:lla](06-kaavat.md#ehdollinen-teksti-joslla) (Kaavat)
- [Hae tekstistä sisältää-vertailulla](06-kaavat.md#hae-tekstistä-sisältää-vertailulla) (Kaavat)
- [Laskettu tulos nimellä (Kaavan tulos)](06-kaavat.md#laskettu-tulos-nimellä-kaavan-tulos) (Kaavat)
- [Väri vaihtuu kaavalla (ohjattu ominaisuus)](06-kaavat.md#väri-vaihtuu-kaavalla-ohjattu-ominaisuus) (Kaavat)
- [Ostoslista taulukolla ja toistimella](07-tieto.md#ostoslista-taulukolla-ja-toistimella) (Tieto)
- [Uuden rivin lisääminen lomakkeesta painikkeella](07-tieto.md#uuden-rivin-lisääminen-lomakkeesta-painikkeella) (Tieto)
- [Laske taulukon sarakkeen summa](07-tieto.md#laske-taulukon-sarakkeen-summa) (Tieto)
- [Näytä vain ostamattomat, eniten ensin](07-tieto.md#näytä-vain-ostamattomat-eniten-ensin) (Tieto)
- [Hahmo liikkuu tatilla ja pysähtyy seinään](08-maailma-ja-liike.md#1-hahmo-liikkuu-tatilla-ja-pysähtyy-seinään) (Maailma ja liike)
- [Napauta minne hahmo kävelee](08-maailma-ja-liike.md#2-napauta-minne-hahmo-kävelee) (Maailma ja liike)
- [Alue, johon astuminen näyttää viestin](08-maailma-ja-liike.md#3-alue-johon-astuminen-näyttää-viestin) (Maailma ja liike)
- [Lautapeli nuolinapeilla](08-maailma-ja-liike.md#4-lautapeli-nuolinapeilla) (Maailma ja liike)
- [Varmuuskopio ennen isoa muutosta](09-tallennus.md#varmuuskopio-ennen-isoa-muutosta) (Tallennus)
- [Projekti puhelimesta tietokoneelle](09-tallennus.md#projekti-puhelimesta-tietokoneelle) (Tallennus)
- [GitHub-tallennuksen käyttöönotto](09-tallennus.md#github-tallennuksen-käyttöönotto) (Tallennus)
- [Toinen laite ilman GitHubia](09-tallennus.md#toinen-laite-ilman-githubia) (Tallennus)
- [Tekoälyn tekemä projekti käyttöön](09-tallennus.md#tekoälyn-tekemä-projekti-käyttöön) (Tallennus)

## Sanasto

| Sana | Merkitys |
|---|---|
| alkuarvo, perusarvo | paneeliin kirjoitettu arvo; voimassa, kun mikään ei ohjaa tai aseta |
| arvokohta | pyöreä piste palikan reunassa: jatkuva arvo |
| esiintymä | sama palikka logiikkakanvaasilla useassa kohdassa; kaikki ovat samaa palikkaa. Viitteen perässä merkki 2×, jonka napautus vie seuraavaan esiintymään (Appi-appi 59) |
| erikoispalikka ✦ | palikka, joka poikkeaa tarkoituksella yhteisestä säännöstä; syy näkyy paneelissa |
| joukko `#nimi` | palikoiden nimetty joukko (tagi Tunnus-kentässä). Säännöt Joukko-palikalla (`pjoukko`). Eri asia kuin Rivijoukko |
| `jäsen` | Joukko-palikan kentissä ja Jäsenille-ikkunan sisällä käsiteltävä jäsen (`jäsen.x`); muualla virhe; varattu sana |
| ikkuna | logiikan laatikko, joka yhdistää sisältönsä (JA, TAI, SUMMA…); kuin sulut |
| kaava | lauseke, joka laskee arvon toisista: `uni > 7` |
| kaavan tulos | kaavan nimetty arvo: `uni = a + b` |
| kanvaasi | piirtoalue: Näkymä tai Logiikka |
| ketju | tapahtumaketju: ikkuna, jonka palikat etenevät viivoja pitkin vaihe kerrallaan |
| käyttötieto | käytössä syntyvä tieto (valinnat, tekstit, muistit, rivit); erillään rakenteesta |
| lukittu, käyttötila | Lukitse: näkymää käytetään kuin valmista appia |
| muokkaustila | Muokkaa: palikoita lisätään ja muutetaan |
| näkymä | käyttöpinnan sivu; projektissa voi olla monta |
| ominaisuus | palikan osa-arvo `viite.ominaisuus`; luettava, usein myös ohjattava |
| ohjattu | arvo tulee nuolesta tai kaavasta; voittaa toiminnon asettaman ja perusarvon |
| paletti | palikkavalikoima vasemmalla (puhelimella ＋ Palikat) |
| paneeli, tarkastelija | valitun asian asetukset oikealla (puhelimella Asetukset-laatikko) |
| pikaluonti | valmis rakenne yhdellä napilla (vaihtoehtoryhmä, kyllä/ei-kysymys) |
| preset | tallennettu palikkayhdistelmä, joka lisätään kuin palikka |
| projekti | yksi appi: näkymät, logiikka ja käyttötieto |
| päivän raja, `nyt.päivä` | kellonaika (1–6), jolloin kirjaushistorian päivä vaihtuu; `nyt.päivä` ja `aika.päivä` noudattavat sitä, `tänään` on aina kalenteripäivä |
| puuttuva tieto | taulukon tyhjä kenttä; laskussa tuntematon (eri kuin tyhjä = 0) |
| rivikonteksti | käsiteltävä rivi joukon, ikkunan riveille, Toista riveille tai kortin sisällä |
| tapahtuma, tapahtumakohta | hetki; punainen salmiakki palikan reunassa |
| toiminto | tekee muutoksen tapahtumahetkellä (Aseta, Lisää, Siirry…) |
| tulkki, kuvio | rakentajan työkalu, joka lukee liitetyn tekstin riveittäin kuviolla (`{nimi}: {arvo}`) tai taulukkona taulukon riveiksi tai palikoiksi |
| viite | palikan lyhyt nimi kaavoissa ja teksteissä |
| Miksi? | paneelin selitys siitä, miksi arvo on mikä on |
| Yhteydet | paneelin lista: mistä palikka saa arvonsa ja missä sitä käytetään |
