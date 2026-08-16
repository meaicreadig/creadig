# Badge-Logos (Zertifizierungen & Mitgliedschaften)

Hier liegen die **offiziellen** Logos der Stellen, bei denen creaDIG gelistet ist.
Solange eine Datei fehlt, rendert die Sektion eine saubere getypte Kachel —
**nie** ein kaputtes `<img>` und **nie** ein 404.

## Erwartete Dateien

| Datei | Stelle |
|---|---|
| `go-digital.svg` | go-digital (BMWK-Förderprogramm) |
| `bafa.svg` | Bundesamt für Wirtschaft und Ausfuhrkontrolle |
| `iuk.svg` | iuk unternehmensnetzwerk osnabrück e.v. |
| `avpq.svg` | Amtliches Verzeichnis Präqualifizierter Unternehmen |
| `agd.svg` | Allianz deutscher Designer (AGD) |

`.png` geht auch — dann in `lib/site-data.ts` die Endung entsprechend setzen.

## Aktivieren

Nach dem Ablegen in `lib/site-data.ts` beim jeweiligen Eintrag:

```ts
{ slug: "go-digital", logoPath: "/badges/go-digital.svg", … }
```

Die Kachel zeigt das Logo dann in Graustufe und blendet bei Hover die Farbe ein
(gleiche Mechanik wie die Logo-Wand).

> **Vor dem Einsatz:** Nutzungsbedingungen der jeweiligen Stelle prüfen. Logos
> nur verwenden, wo die Verwendung ausdrücklich gestattet ist.
