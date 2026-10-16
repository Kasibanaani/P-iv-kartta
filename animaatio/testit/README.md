# Animappin testit

Aja kaikki: `sh animaatio/testit/aja.sh` (vaatii Noden ja Pythonin Playwrightin Chromiumilla). Skripti poimii `index.html`:n lohkot, tarkistaa niiden syntaksin, ajaa logiikkatestit Nodella ja selaintestit Chromiumissa. Tulosteet ja kuvakaappaukset menevät kansioon `tulosteet/` (ei repossa).

## Logiikkatestit (Node, moottori `AM`)

- `logiikka_01_malli.js` – uusi projekti ja osa (sovitus lavalle), matriisit, hierarkia (lapsi seuraa kulmaa ja kokoa), maailman ja oman asennon muunnos molempiin suuntiin, osuma, vanhemman vaihto pitää osan paikallaan joka ruudussa (kehä estetään), kääntöpisteen siirto pitää kuvan paikallaan, koko liikkeen siirto, poisto (lapset isovanhemmalle), järjestys, kuvan vaihto, rikkinäisen tiedon korjaus ja `korjaaData`
- `logiikka_02_nauhoitus.js` – näytteet → 24 ruutua sekunnissa (2 s = ruudut 0–48, välitys, lyhyt kosketus), moniraita (vain kosketetut ruudut ja osat muuttuvat), täyttö (edellinen / ensimmäinen / perusasento), tasoitus (tärinä puolittuu, vakio ja tasainen liike säilyvät, raaka säilyy, kulma jatkuva), pituuden muutos, lapsi seuraa vanhemman nauhoitusta, sormen alla oleva asento
- `logiikka_03_vienti.js` – animaatiotiedoston kentät (MUOTO.md), laatikot = sama kuva Appi-appin tavalla (kulmapisteet verrataan), vienti → tuonti → vienti samana, tiedosto ilman raakaa, z-järjestys, virheelliset tiedostot, sprite sheetin asettelu iPadin rajoissa (4096 px, 16,7 Mpx), sprite-tiedot ja rajaus

## Selaintestit (Chromium)

Kosketus ja Apple Pencil simuloidaan Chromen DevTools-protokollalla (`Input.dispatchTouchEvent`, `pointerType: pen` paineella). Nauhoitustestit ohjaavat aikaa itse (`APP.testi`, `APP.kello`, `APP.askel`), joten ruutujen määrä on tarkka.

- `selain_01_rakenna.py` – tuonti tiedostoista ja SVG-tekstinä, siirto hiirellä, kääntöpisteen risti, kierto- ja kokokahva, numerokentät, kiinnitys, järjestys, piilotus, poisto, Kumoa, tallennus ja kuvat uudelleenlatauksessa; iPadilla yksi ja kaksi sormea, toinen sormi tyhjässä, lavan siirto, tiedot ⓘ-napista pystyssä (1280, 1024, 820)
- `selain_02_animoi.py` – nauhoitus 2 s = 48 ruutua, nivelosan toinen kierros moniraitana, harjoittelu, Kumoa, toisto ja silmukka, haamukuva pikseleistä, aikajana, kaksi osaa kahdella sormella, kynä, laskuri ja tarttuminen laskurin aikana, hiiren kiertokahva ja näppäimet (1024, 820, 1280)
- `selain_03_vienti.py` – animaatiotiedoston lataus, sprite sheet (PNG:n koko ja pikselit, läpinäkyvä tausta), 50 % ja rajaus, teksti, tuonti tiedostosta ja tekstinä, virheellinen tiedosto, uudelleenlataus, poisto ja kuvien siivous (1024, 1280)
- `selain_04_ilme.py` – kontrasti ≥ 4,5:1 kaikissa teemoissa vaaleana ja tummana, laitteen tumma tila, teeman vaihto ja säilyminen, ei ylivuotoa, kosketuskohteiden koko (1440, 1280, 1024, 820)

Testiselaimen oikku: Chromen kosketusemulaatiossa veto `touch-action:none`-pinnalla estää seuraavan napautuksen klikkauksen. `Kosketus.napauta` napauttaa ensin neutraaliin kohtaan. Oikealla laitteella tätä ei tarvita.
