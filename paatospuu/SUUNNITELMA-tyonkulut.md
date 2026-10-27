# Juuren työnkulut — toteutus ja jatko

Päivitetty 27.10.2026. Emilin keskustelussa hyväksymä suunta. Toteutuslupa annettu ensimmäiselle järkevälle kokonaisuudelle; tässä erotetaan toteutettu ja vielä tekemätön. Älä sekoita erilliseen flowchart-appiin.

## Toteutettu 1.94

- Uusissa kierroslistoissa työnkulku oletuksena. Vanhoissa valittavissa Listat → listan valitsin → Työnkulku.
- Asiasanan esiintymä: perustila näkyy toimimattomana, ehdot aktivoivat kuittausta odottavaksi, kuittaus merkitsee tehdyksi. Ehto ei lisää puuttuvia jäseniä listalle.
- Rivin kaikki = kaikki aktiiviset kohteet. Yksi = yksi aktiivinen kuittaus riittää. Kokonaan perustilainen vaihe ei estä valmistumista eikä sitä kirjata tehdyksi.
- Työnkulun kuittaus sallitaan vain, kun rivit eivät vaadi enää käsittelyä. Tarkistus myös itse lopetustoiminnossa. Osion vaihto säilyttää keskeneräisen, kuittaus tallentaa yhteenvedon ja aloittaa uuden kierroksen kuten vanha Lopeta. Kumoa palauttaa.
- Kuittauksesta peruutettu lähde poistaa jälkiseurauksen aktiivisuuden; aiempi kuittaus säilyy tallessa ja tulee takaisin, jos sama ehto aktivoituu uudestaan samalla kierroksella.
- Ryhmän jäsenet näkyvät työnkulkurivillä myös silloin, kun jäsen on muullakin rivillä. Ryhmäehdon Kaikki huomioi vain aktiiviset, listassa olevat jäsenet. Pelkkä perustila ei laukaise ryhmäehtoa.
- Osiovalikko vasemman alakulman napin lähellä, pyyhkäisy säilyy. Järjestys suoraan valittavaksi.
- Asiasanakortin Tunnistus-osiossa suora uuden saapuvan tai lähtevän ehdon luonti; lähtevän syyksi tulee valittu asiasana.
- Ehdot ja ryhmät edelleen projektikohtaisia, suoritukset listakohtaisia; ei appin yhteiseksi tehtyä siirtoa.

## Seuraava kokonaisuus: yhteiset vaiheet (ei rakennettu)

1. Rivi on yhteisen ryhmän esiintymä; uusi rivi luo ryhmän pankkiin. Pankki näyttää avattavilta listariveiltä.
2. Ryhmän nimi, jäsenet ja valmistuminen ovat yhteisiä; rivin kuittaukset paikallisia.
3. Suppea ja laaja lista voivat valita osittain samoja vaiheita. Muokkaus näyttää käytössä olevat listat. Tee oma versio irrottaa ryhmän.
4. Ensin täsmennetään kesken olevan suorituksen suhde muuttuvaan ryhmäpohjaan sekä yhden asiasanan kuittauksen jakaminen saman kierroksen riveillä. Vanhaa tallennusta ei saa hukata. Älä korvaa nykyisiä ryhmiä suoraan migraatiota suunnittelematta.

## Sen jälkeen: työnkulku kuittaustapana (ei rakennettu)

- Asiasanaan voi liittää yhteisen työnkulkupohjan. Tekstin aihe voi avata sen vapaaehtoisesti, tarkistuslistassa suoritus voi olla kuittauksen vaatimus.
- Jokainen käynnistys sidotaan omaan lähtökohteeseen. Keskeneräiset säilyvät. Valmis suoritus kuittaa vain lähtökohteen kyseisen kerran.
- Varmistetaan toistuvan tarkistuksen uusiutuminen, keskeytys, lähdekohteen poisto, pohjan muutos ja sisäkkäisten työnkulkujen kehät.

## Tekstikohtaiset tehtävät (ei rakennettu)

- Liitä asiasana ja aktivoi kuitattavaksi ovat eri seurauksia. Pelkkä aihe ei luo tehtävää.
- Kuittaus kohdistuu tiettyyn tekstiosaan ja asiasanan esiintymään. Näkymät jakavat saman kuittauksen.
- Ajaton tärkeysjärjestys; tarvittaessa samaan näkymään ajallisten tarkistusten kanssa.
- Kuitattu ei avaudu jokaisessa jäsennyksessä uudelleen. Tekstin muokkauksen identiteetti, erottimien muutos ja uuden tarkistuskerran synty on suunniteltava ennen tallennusmuutosta.

## Muut keskustelun ehdotukset (ei rakennettu)

- Miksi tämä näkyy -tilannekohtainen selitys; tekstin tulkinnan koonti; ehtojen kokeilutila.
- Toistuvuuden yhteinen esitys; kuittaustekstien tarkennus eri kuittauslajeille.
- Näkyvät vaihtoehdot pitkille painalluksille; asiasanan lisäys napista; tekstiosan lisäys ja rajojen korostus.
- Toimintojen muotokielen yhtenäistäminen ja punaisen seuraava-teko-korostuksen arviointi.
- Projektien yhdistetty näkymä pysyy erillisenä sivupolkuna.
