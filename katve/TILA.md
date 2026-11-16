# Katve: tila

**Vaihe:** ensimmäinen pelattava versio · **Versio:** 1.0 · **Päivitetty:** 16.11.2026
**Käyttölinkki:** https://kasibanaani.github.io/P-iv-kartta/katve/

## Valmiina

- Vaakasuuntainen, ylhäältä kuvattu zombipako kahdella tatilla. Analoginen liike kuluttaa voimia kävelyvauhdin ylityttyä. Väsynyt hahmo pystyy kävelemään. Oikean tatin irrotus ampuu yhden laukauksen ja panoksia riittää. Myös näppäimistö ja hiiri käyvät.
- Yksi käsin rakennettu kaupunginosa, jossa on teitä, metsäisiä kiertoreittejä, huoneita ja suljettavia ovia. Kolme tavaranhaku- ja toimitustehtävää, tallentuvat tarkistuspisteet ja vapaa tutkiminen kampanjan jälkeen.
- Hitaasti vaeltavat, näkevät ja kuulevat zombit, vaihtelevat laumat, eri vaikeustasot ja ovien murtaminen. Seinät peittävät näköyhteyden ja vaimentavat ääntä. Ovet ja suojat pysäyttävät laukaukset.
- Kotinäytön web-appi ja offline-kuori. Tyylissä Appipaja 2.0:n teemat, vaalea/tumma/laitteen mukaan ja pelialueen oma väritys. Tallennusavain `katve:v1`, varmuuskopio tiedostona tai tekstinä.

## Testaus

- `node katve/testit/engine.cjs`: liike, väsymys, törmäykset, ovet, tunnistus, laumat ja kolmen tehtävän reitit.
- Selaimessa tarkistettu työpöytäpeli ja 320/390 px:n näkymät. Selaintestikomento Playwright-ympäristössä on `sh katve/testit/aja.sh`.
- Selainohjeet: Modern Web Guidance, *drag* ja *form-factor-adaptation*.

## Ei tarkistettu

- Oikean iPhonen Safari ja kotinäytön asennus, fyysisten tattien tuntuma ja pitkän pelisession suorituskyky. Vaikeustasot ja voimat ovat ensimmäinen toteutettu säätö.
- Vapaa tutkiminen käyttää samaa rajattua karttaa. Turvapaikkojen rakentaminen ja ryhmän komentaminen ovat jatkoideoita.

## Seuraavaksi

- Kokeile puhelimella, tuntuuko rauhallinen liike ja väsyminen luontevalta, sekä löytyvätkö ovet kiireessä. Päivitä seuraavassa julkaisussa myös `sw.js`:n välimuistin versio, kun offline-kuori muuttuu.

## Emilin kommentit

- (tyhjä)
