# Kundenlogos

Hier liegen die **echten** Logos der freigegebenen Kunden — und nur die.

## So legst du eins ab

Datei nach diesem Muster benennen und in diesen Ordner legen:

| Kunde | Dateiname |
|---|---|
| NV SWISS | `nvswiss.svg` (oder `nv-swiss.svg`) |
| maqam | `maqam.svg` |
| Bir Damla Hayır | `bir-damla-hayir.png` |

Erlaubte Formate: `.svg` (bevorzugt), `.png`, `.webp`, `.avif`, `.jpg`.

Danach einmal `npm run build` — der `prebuild`-Hook liest den Ordner und die
Kachel tauscht ihr Monogramm gegen das echte Logo. **Kein Code-Eingriff nötig.**

## Was hier NICHT hingehört

Logos ohne schriftliche Freigabe des Kunden. Solange nichts hier liegt, zeigt
die Seite ein sauberes Monogramm (`NV`, `mq`) — nie ein kaputtes `<img>` und
nie ein fremdes Logo, das niemand freigegeben hat.
