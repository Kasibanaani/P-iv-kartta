# Sivut: tila

**Versio 0.4** · **28.11.2026** · [Avaa Sivut](https://kasibanaani.github.io/P-iv-kartta/sivut/)

- **0.4.** Tietokannan välilehdet, haku ja suodatin ovat samassa palkissa. Puhelimella tietokannan palkki, muistiinpanojen haku, muokkaus, uuden muistiinpanon luonti, elementin lisäys ja ⋯ ovat alhaalla. Hakurivi ja muokkaustilan työkalut liikkuvat tarvittaessa näppäimistön yläpuolelle. Pikaopas säilyy otsikkopalkissa.
- Päällimmäinen ikkuna, sivuvalikko, toimintovalikko tai pudotusvalikko sulkeutuu napauttamalla ulkopuolelle. Sama napautus ei käynnistä taustalla olevan näkymän toimintoa.
- **0.3.** Hiillos ja Lehto käyttävät Lehdon kirjasinta. Kummallekin teemalle on kuusi aksenttia, joista valitaan oma väri laitteen muistiin. Ruudun pinta voi käyttää erillistä aksenttia. Navigaatiossa, valikoissa ja ikkunoissa on himmeä huurrelasi. Palkit, kentät, painikkeet ja näkymäotsikot käyttävät yhteisiä mittoja.
- i avaa haettavan pikaoppaan kaikissa näkymissä. Kirjoitustilan + lisää valitun elementin sivun tai datamuistiinpanon Markdown-tekstiin kohdistimen kohdalle. Oppaan ja lisäyksen 24 mallia tulevat samasta luettelosta. Toistuville nimetyille ruuduille annetaan yksilöllinen nimi.
- Teeman, suodattimien, ruudun muotoilun ja VALINTA-säätimen valikoilla on sama ilme. Vaihtoehtoa voi hakea kirjoittamalla tai liikkumalla nuolilla. Tavallinen valitsin toimii vanhemman selaimen varalla. Vaakavieritys säilyy vieritettävän alueen sisällä, historiaan karkaavaa elettä rajoitetaan reunalla.
- Korjattu tallentuvan liukusäätimen alkuarvo sitä käyttävissä kaavoissa, tekstin tallennus otsikon ollessa hetkellisesti tyhjä sekä palkin maksimin näkyvyys.
- Yläreuna ja sovelluksen pohja pysyvät paikallaan. Näppäimistön kohdalla pienennetään tekstikenttää ja avointa ikkunaa. Muokkaus- ja käyttötilan vaihto palaa tekstin samaan kohtaan. Puhelimen kentät ovat vähintään 16 px ja näkymä käyttää Kaikin zoomausasetusta.

- Omassa koko näytön käyttöliittymässä sivut, vapaasti kirjoitettavat datamuistiinpanot sekä havaintojen, kohteiden ja muuttujien tietokanta. Sivuvalikko on alhaalla vasemmalla. Asettelu ja Vault löytyvät ⋯-valikosta.
- Kaikin 0.118:n Markdown-havainnot, kaavakieli, lähdeviittaukset ja säätimet. Kaavaruudut näyttävät luvun, palkin, viiva- tai pylväskuvaajan, ehdollisen tekstin tai havaintolistan. Asettelu tallettuu sivun mukana ja ruutukoko voi erota puhelimella ja tietokoneella. Kokeilutila, kirjaus ja viimeisen kirjauksen kumoaminen ovat käytettävissä.
- Vault on `Kasibanaani/vault123`. Appi hakee omat sivut ja datamuistiinpanot sekä kaavoissa suoraan viitatut tiedostot. Muualta se poimii kaavat ja havainnot valituista tiedostoista ja kansioista. Ensimmäisellä hakukerralla hyödynnetään mahdollisuuksien mukaan samalla selaimella olevaa Kaikin välimuistia. Tallennus käyttää paikallista jonoa ja GitHubin tiedostoversion tarkistusta.
- Tiedostot ovat Markdownia `sivut/`- ja `sivudata/`-kansioissa. Lähdevalinnat ovat `data/sivut-lahteet.json`-tiedostossa. Vanhan Vault-muistiinpanon voi ottaa sivuksi samasta tiedostosta.
- Tarkistettu Chromiumilla ja WebKitillä 320, 390, 1280 ja 1440 px leveydellä. Testeissä myös työkalurivin sijoittelu, ikkunoiden sulkeminen hiirellä ja emuloidulla kosketuksella, sisäkkäiset valikot ja taustan painikkeiden suojaus. Seuraava käyttökokeilu on oikean iPhonen näppäimistö, Macin fyysisen kosketuslevyn historiaele ja synkronointi omalla GitHub-avaimella.
- Päivä- ja nyt-painikkeet käytettävissä. Kaikin valmiisiin säätimiin sidotut kalenteriajan valitsimet kuuluvat Kaikki-appiin.

## Emilin kommentit
