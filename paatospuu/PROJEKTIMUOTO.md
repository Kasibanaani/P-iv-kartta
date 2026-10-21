# Päätöspuun projektitiedosto

Tämä ohje kuvaa yksittäisen projektin tiedoston, jonka Päätöspuu vie (*Projekti → Vie projekti*) ja lisää (*Lisää projekti → Tiedostosta / Tekstistä*). Se on kirjoitettu niin, että tekoäly voi keskustelun pohjalta tehdä projektin, jonka Emil liittää appiin. Lisäys ei korvaa mitään: projekti tulee uudeksi, ja jos nimi on jo käytössä, perään tulee (2).

Koko appin varmuuskopio (*Asetukset → Vie tiedosto*) on eri asia: se sisältää kaikki projektit ja palauttaa tilan. Jos varmuuskopion antaa *Lisää projekti* -kohtaan, sen kaikki projektit lisätään uusina.

## Pienin toimiva tiedosto

```json
{
  "app": "paatospuu",
  "laji": "projekti",
  "projekti": {
    "name": "Salitreeni",
    "puut": [
      {
        "name": "Treenin valinta",
        "text": "Jalat\nSelkä\nRinta\n#Ylävartalo: selkä ja rinta\n\n=Alku avaa:\nJalat\n#Ylävartalo\n\n=Ylävartalo avaa:\nSelkä\nRinta\n\n=Toisensa poissulkevat:\nJalat\n#Ylävartalo"
      }
    ],
    "termit": [
      { "name": "Salitreeni", "yes": ["sali-", "kyykky-"], "no": ["salibandy-"] }
    ],
    "muistiinpanot": [
      { "text": "Ensimmäinen treeni ma klo 17" }
    ],
    "toistuvat": [
      { "text": "Venyttely", "mode": "every", "n": 1, "unit": "w", "start": "2026-10-26" }
    ]
  }
}
```

Tunnisteita (`id`) ei tarvitse kirjoittaa: appi lisää ne. Vain `app`, `laji` ja `projekti.name` ovat pakollisia; tyhjät listat voi jättää pois. Tekstin rivinvaihto on JSONissa `\n`.

## Puu (`puut`)

`name` on puun nimi. `text` on koko puu tekstinä, ja **säännöt ovat samassa tekstissä**. Valinnaiset kentät:

- `"flow": "prio"`: Eteneminen tärkeysjärjestyksessä (oletus: säännöt).
- `"mem": "all"`: Muisti ”kaikki mukana” (oletus: vain seuraava askel).
- `"end": "hoid"`: lopuksi Hoidettavat-muistiinpano.

### Rivit

Yksi rivi on yksi asia.

| Rivi | Merkitys |
|---|---|
| `Koira` | nappula |
| `#Eläimet: selitys` | ryhmä (ei näy käytössä nappulana) |
| `>Perustelu: teksti` | ilmoitus: käytössä näkyy vain teksti |
| `?Apu: kysymys` | apukysymys, näkyy pienenä vain sen askeleen ajan |
| `// kommentti` | ei näy missään |

Tyhjä rivi päättää lohkon.

### Sääntölohkot

Lohko alkaa `=`-rivillä ja jatkuu riveinä tyhjään riviin asti. Ensimmäisen kohteen voi kirjoittaa myös samalle riville kaksoispisteen perään.

- `=Alku avaa:`: mitä kierroksen alussa näkyy.
- `=X avaa:`: X:n valinta tuo näkyviin luetellut.
- `=X sulkee:`: X:n valinta sulkee luetellut pois (poissulku voittaa aina).
- `=X vaatii kaikki:`: X tulee näkyviin vasta, kun kaikki luetellut on valittu.
- `=X vaatii yhden:`: X tulee näkyviin, kun yksikin luetelluista on valittu.
- `=X ennen:`: X tarjotaan ennen lueteltuja (järjestys).
- `=X kääntöpuoli:`: vapaita tekstirivejä, jotka näkyvät muistiinpanon Puuttuu-osiossa, jos X jää valitsematta.
- `=Toisensa poissulkevat:`: samassa askeleessa vain yksi luetelluista voi olla valittuna.
- `=Tärkeät:`: tärkeysjärjestys ylhäältä alas (tähdet).

Ryhmään viitataan `#`-merkillä tai pelkällä nimellä. Isot kirjaimet eivät vaikuta.

### Termilohko tekstissä

`=Nimi:`-rivi, jota ei seuraa sääntösana, on termin sanalista. Alla olevat rivit tunnistavat termin, ja `!`-alkuiset rivit estävät sen.

```
=Salitreeni:
sali-
kyykky-
!salibandy-
```

## Termit (`termit`)

Puun ulkopuoliset omat termit: `{ "name": "...", "yes": [...], "no": [...] }`. Valinnaiset kentät: `"pop": true` (nousee esiin muistiinpanosta) ja `"cal": true` (näkyy kalenterissa alaotsikkona).

Sanasäännöt:
- Rivi on sana tai lause, ja se osuu kokonaisena sanana.
- Tavuviiva lopussa (`sali-`) tarkoittaa, että sanan alku riittää.
- Isot kirjaimet ja välimerkit eivät vaikuta.

## Muistiinpanot (`muistiinpanot`)

`{ "text": "..." }`. Ajankohdan voi kirjoittaa tekstiin (esim. `pe klo 14–15`, `24.10.2026`, `tiistaisin`). Valinnaiset kentät:
- `"date": "2026-10-24"`
- `"time": {"s": "14:00", "e": "15:00"}`
- `"done": "<ISO-aika>"` (kuitattu)

## Toistuvat ja muistutukset (`toistuvat`)

- Tasavälein: `{ "text", "mode": "every", "n", "unit": "d|w|m|y", "start": "VVVV-KK-PP" }`.
- Kuittauksesta: sama, mutta `"mode": "after"`.
- Jos ei tapahdu: `"mode": "trig"`, `"terms": [termi-id…]`, `"all": true|false`. Termien tunnisteet syntyvät vasta appissa, joten tämä laji kannattaa tehdä appissa.

## Mitä appi vie

Appin oma vienti sisältää lisäksi tunnisteet ja tämän tiedot:
- `cur`: avoin puu
- `termisanat`: puun termien sanat avaimella
- `tarkeat`: tähditetyt termit
- puiden kierrokset

Ne luetaan takaisin sellaisinaan. Roskakori ei kulje projektin mukana.
