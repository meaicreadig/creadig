# Commercial Completion

Der Lauf nach Website 2.0 (Gates 00–09). Nicht mehr die Frage, ob die Seite gut
ist — die Frage, ob sie **wahr** ist.

| Dokument | Inhalt |
|---|---|
| [Phase 0 Rest](./phase-0-rest.md) | Die sechzehn Befunde des Live-Reaudits: reproduziert, im Code verortet, klassifiziert |
| [Phase 1](./phase-1-truth.md) | Wahrheit, Risiko und Integrität der öffentlichen Aussage — was gefixt wurde, was bleibt und warum |

**Grundsatz:** `ÖFFENTLICHE AUSSAGE = HEUTIGE WAHRHEIT`. Wo die Seite mehr
behauptet als gilt, wird die Behauptung kleiner gemacht — nie die Wahrheit größer.

**Wahrheitsquelle:** `https://creadig.de` ist der aktuell promotete Live-Stand
und damit das Produkt. Nicht die Vorschau, nicht der Branch.

**Maschinell gesichert:** `scripts/check-commercial-truth.mjs` (Gate 35 von 35 im
`postbuild`) liest das gebaute HTML und hält sieben dieser Befunde fest.

Phase 2 ist nicht begonnen.
