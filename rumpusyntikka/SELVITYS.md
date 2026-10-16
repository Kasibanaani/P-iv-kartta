# DFAM softana: päästäänkö lähelle?

16.10.2026 · Vain selvitys, mitään ei ole rakennettu.

## Lyhyesti

**Kyllä, rakenteeltaan ja käyttölogiikaltaan päästään käytännössä 1:1.** DFAM on yksinkertainen ja hyvin dokumentoitu laite: julkinen käyttöohje kuvaa jokaisen potikan, kytkimen ja 24 patch-pisteen. Siinä ei ole valikoita, muistia eikä piilotoimintoja.

**Soundissa päästään "samaan perheeseen", ei identtiseen.** Se, mikä tekee DFAMista DFAMin, on analogin luonne: oskillaattoreiden epätäydellisyys, Moog-ladder-suotimen yliohjaus, verhokäyrien muoto ja potikoiden kulku. Näistä ei ole julkisia numeroita, joten ne mallinnetaan tunnetuilla menetelmillä ja viritetään korvalla. Oma arvio: tutut DFAM-soundit (pudottava bassari, metalliset FM-kilkatukset, kohinasuodinräminä, sekvenssin pitch-kuviot) saadaan tunnistettaviksi. Vierekkäin A/B-kuunneltuna harjaantunut korva erottaa eron, varsinkin äärimmäisillä asetuksilla.

Todisteeksi, että tämä on tehtävissä: Behringer teki DFAMista lähes suoran laitekloonin (Edge), ja Rainbow Circuit julkaisi 2025 DFAMin innoittaman softasyntikan Motherly (tekijän mukaan ei emulaatio). Valmista avointa DFAM-emulaatiota en löytänyt.

## Mitä DFAMissa on

Lähteet: Moogin käyttöohje (lainauksina hakutuloksista; suora lataus oli tästä ympäristöstä estetty), Sound On Sound ja muut arviot. Kohdat, joita en saanut tarkistettua suoraan ohjeesta, on merkitty *(tarkistettava)*.

### Äänipolku

```
VCO 1 ─┬──────────────► MIKSERI ──► LADDER-SUODIN ──► VCA ──► ulos
       │ FM 1→2            ▲         (LP / HP)        ▲
VCO 2 ─┘ (+ hard sync)     │            ▲             │
KOHINA / ULKOINEN ÄÄNI ────┘   kohina → cutoff     VCA-verhokäyrä
                                VCF-verhokäyrä
VCO-verhokäyrä → molempien VCO:iden sävelkorkeus (oma määrä kummallekin)
```

**Oskillaattorit (2 kpl)**
- VCO 1 ja VCO 2 FREQUENCY: laaja alue, matalasta kuuluvasta korkeaan *(tarkka alue tarkistettava)*.
- Aaltomuoto kytkimellä kummallekin: kolmio tai kantti.
- VCO 1 EG AMOUNT ja VCO 2 EG AMOUNT: kaksisuuntainen määrä, jolla VCO-verhokäyrä vie säveltä. Ohjeen mukaan tämä on "ero hassun äänen ja jyräävän bassarin välillä".
- 1→2 FM AMOUNT: VCO 1 moduloi VCO 2:n taajuutta. Tästä metalliset ja kelloiset äänet.
- HARD SYNC: VCO 2 lukittuu VCO 1:n vaiheeseen. Jos VCO 2 on VCO 1:tä matalammalla, ääntä tulee vähän tai ei ollenkaan.
- SEQ PITCH MOD -kytkin: sekvenssin sävel menee VCO 1&2:lle, pois, tai vain VCO 2:lle.

**Mikseri:** VCO 1, VCO 2 ja NOISE / EXT LEVEL. Kohinan tilalle voi kytkeä ulkoisen äänen. Tasojen nostaminen ajaa suodinta yliohjaukselle, mikä on iso osa soundia.

**Suodin:** Moogin 4-napainen ladder, kytkin alipäästö / ylipäästö. CUTOFF, RESONANCE (itseoskilloi), VCF EG AMOUNT kaksisuuntainen (vasemmalla laskee cutoffia kummassakin tilassa), VCF DECAY, NOISE / VCF MOD (kohina moduloi cutoffia äänitaajuudella: rosoinen, lo-fi-räminä).

**VCA:** VCA EG -kytkin FAST / SLOW (iskun nopeus), VCA DECAY, VOLUME.

**Verhokäyrät (3 kpl):** VCO, VCF ja VCA. Jokainen on käytännössä "isku + vaimeneminen": nopea kiinteä isku ja säädettävä decay. Vain VCA:lla on kaksi iskun nopeutta.

### Sekvensseri

- 8 askelta, kaksi riviä potikoita: PITCH 1–8 ja VELOCITY 1–8.
- Askeleen velocity skaalaa **kaikkien kolmen verhokäyrän** voimakkuutta. Hiljainen askel on siis myös lyhyempi sävelpudotukseltaan ja tummempi, ei vain hiljaisempi. Tämä on tärkeä osa soittotuntumaa.
- TEMPO-potikka (portaaton), RUN/STOP, ADVANCE/CLOCK (siirtää askelta), TRIGGER (laukaisee äänen).
- Ulkoinen kello ADV/CLOCK-tuloon ohittaa oman tempon: tästä klassiset DFAM-temput, kuten kaksi DFAMia toistensa kellona ja askelmäärän lyhentäminen *(tarkemmat käytökset, esim. resetointi ja askelpituuden lyhennys, tarkistettava ohjeesta)*.

### Patch bay (24 pistettä: 15 tuloa, 9 lähtöä)

- **Tulot:** TRIGGER, VCA CV, VELOCITY, VCA DECAY, EXT AUDIO, VCF DECAY, NOISE LEVEL, VCO DECAY, VCF MOD, VCO 1 CV, 1→2 FM AMT, VCO 2 CV, TEMPO, RUN/STOP, ADV/CLOCK.
- **Lähdöt:** VCA, VCA EG, VCF EG, VCO EG, VCO 1, VCO 2, TRIGGER, VELOCITY, PITCH.
- Ilman kaapeleita kaikki on valmiiksi kytketty (normalisoitu) peruskäyttöön. Kaapeli katkaisee normaalikytkennän. Tyypillisiä temppuja: VCO EG → VCA CV, PITCH → 1→2 FM AMT (FM-määrä askeleittain), VELOCITY → VCF DECAY, VCO-lähtö toisen tuloksi äänitaajuusmodulaatioon.

## Mitä softaan pitää tehdä, että päästään lähelle

Tärkeysjärjestyksessä, eli mistä soundi eniten riippuu:

1. **Ladder-suodin, joka saturoituu.** Selaimen valmis suodin ei kelpaa. Tehdään oma (tunnettu digitaalinen malli, esim. Huovilaisen tai "zero-delay feedback" -ladder) tanh-yliohjauksella ja ylipäästötilalla. Tämä on koko projektin vaikein ja tärkein osa.
2. **Verhokäyrien muoto ja nopeus.** Analoginen eksponentiaalinen vaimeneminen, napsahtava isku. Pitch-pudotus on DFAM-bassarin ydin. Velocity skaalaa kaikkia kolmea.
3. **FM ja sync ilman digitaalista säröä.** Kolmio ja kantti kaistarajattuina (polyBLEP) ja 2x ylinäytteistys, jotta FM- ja sync-äänet eivät sirise väärin.
4. **Analogin epätäydellisyys pienesti:** oskillaattoreiden pieni vaeltelu, epäsymmetrinen kolmio, mikserin pehmeä yliohjaus. Liian puhdas kuulostaa muovilta, liika kuulostaa rikkinäiseltä.
5. **Potikoiden kulku.** Missä kohtaa potikkaa "se kohta" on. Tämä tehdään korvalla ja demovideoita vertaamalla.
6. **Sekvensseri ja patch bay näytteen tarkkuudella.** Kaikki (sekvensseri, verhokäyrät, kaapelit) pyörii yhdessä AudioWorkletissa, jolloin tempon modulointi kaapelilla ja äänitaajuiset kytkennät toimivat kuten laitteessa.

Teknisesti tämä on selaimelle kevyt: yksi ääni, kaksi oskillaattoria. Tietokone ja iPad jaksavat helposti.

## Mitä ei saada tai mikä jää riskiksi

- **Identtinen soundi.** Ei kytkentäkaavioita (en löytänyt julkisia), ei mittauksia. Soundi on approksimaatio.
- **Tekoäly ei kuule.** Viritys tehdään kierroksina: sinä kuuntelet ja kuvailet, minä säädän. Jos sinulla on oikea DFAM tai pääsy sellaiseen, vertailu nopeutuu valtavasti (sama asetus molemmista, kuunnellaan rinnakkain). Muuten vertailukohtana ovat demovideot ja muistisi.
- **iPadin Safari ei tue Web MIDIä.** Appi ei voi iPadilla lähettää eikä vastaanottaa MIDIä suoraan Logiciin tai ohjaimelta. Tietokoneen Chromessa voi. Kiertotie: vienti äänitiedostona (.wav) ja sekvenssin vienti MIDI-tiedostona.
- **Kynäkäyttö** on helppo: potikat pystyvedolla, kaapelit vetämällä pisteestä toiseen. Apple Pencilin painetta voi käyttää (esim. TRIGGER-napin velocity), jos haluat.
- **Nimi ja ulkoasu:** repo on julkinen, joten ei Moogin nimeä, logoa eikä paneelin kopiota. Toiminnallisuuden mallintaminen on sallittua. Tämä on jo Rytmikoneen suunnitelmassa.

## Suositus: oma appi, ei Rytmikoneeseen

Suosittelen **omaa appia** (työnimi esim. `rumpusyntikka/`).

Miksi:
- **Eri laite ja eri käyttöliittymä.** Rytmikone on puhelinappi, jossa on välilehdet ja isot napit. DFAM-syntikka on yksi iso paneeli vaakasuunnassa, kymmeniä potikoita ja kaapeleita, tietokoneelle ja iPadille. Niitä ei saa samaan näkymään järkevästi.
- **Rytmikoneen oma riski on jo laajuus** (seitsemän vaihetta, "puoli DAW:ta"). DFAM siihen lisäisi juuri sitä monimutkaisuutta, jota suunnitelma varoo.
- **DFAM on itsenäinen soitin.** Sitä soitetaan sekvensserillä ja potikoilla, ei oton jälkikäsittelynä.

Miten ne silti yhdistyvät: äänimoottori kirjoitetaan erilliseksi lohkoksi, jonka voi myöhemmin kopioida Rytmikoneeseen yhdeksi äänityypiksi ("DFAM-ääni" nuotin äänenä, eli Rytmikoneen vaihe 4 kutistuu kytkennäksi). Äänen asetukset siirtyvät tekstinä tai tiedostona.

Huono puoli: kaksi appia ja kopioitu moottorikoodi, joka pitää pitää samana käsin.

## Sinulta tarvitaan ennen rakentamista

1. Oma appi vai Rytmikoneeseen? (suositus: **oma appi**)
2. Onko sinulla oikea DFAM tai pääsy sellaiseen vertailua varten? (kyllä / ei)
3. Kumpi ensin: tietokone vai iPad kynällä? (suositus: **iPad**, koska kynä ja kosketus ovat isompi suunnittelukysymys; tietokone toimii samalla pohjalla)

## Lähteet

- [Moog DFAM, valmistajan sivu](https://www.moogmusic.com/synthesizers/dfam/)
- [DFAM-käyttöohje (Moog, PDF)](https://cdn.inmusicbrands.com/Moog/DFAM/DFAM_Manual.pdf) ja [peili](https://media.justmusic.de/shop/assets/handbuch/9179362_DFAM_Manual.pdf), [ManualsLib](https://www.manualslib.com/manual/1351954/Moog-Drummer-From-Another-Mother.html)
- [Sound On Sound: Moog DFAM](https://www.soundonsound.com/reviews/moog-dfam), [Moinsound-arvio](https://moinsound.wordpress.com/2018/03/19/review-moog-dfam/), [Recordcase-arvio](https://www.recordcase.de/en/moog-dfam-review)
- [Patch-pisteet (Reverb-ilmoitus)](https://reverb.com/item/9158019-moog-dfam-drummer-from-another-mother), [ModularGrid](https://modulargrid.net/e/moog-music-inc-dfam-drummer-from-another-mother)
- [Rainbow Circuit Motherly (Synth Anatomy)](https://synthanatomy.com/2025/06/rainbow-circuit-motherly-percussion-synth-is-a-love-letter-to-the-moog-dfam.html)
- [Moogin foorumi: velocity-jännitteet](https://forum.moogmusic.com/viewtopic.php?p=187415), [ModWiggler: lisää CV:tä DFAMiin](https://www.modwiggler.com/forum/viewtopic.php?t=229298)
