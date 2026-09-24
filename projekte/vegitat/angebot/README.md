# Angebot Vegitat × Vegilab (A-2026-09-VEG-01)

Quellen: `angebot-v2.html` (aktuelle Fassung: Service-Modell, Richtwerte, Sicherheiten, 14 Seiten) und `angebot.html` (erste Fassung, Festpreis-Modell). Druck-CSS, A4. PDF erzeugen mit headless Chromium:

```
chrome --headless --no-pdf-header-footer --print-to-pdf=Angebot_Vegitat_Vegilab_creaDIG.pdf file://$(pwd)/angebot-v2.html
```

Vor dem Versand ausfüllen: `[Strasse Nr.]`, `[PLZ]`, `[Telefon]`, `[USt-IdNr.]` auf Deckblatt und letzter Seite.
Schriften: Poppins und Open Sans (Google Fonts, OFL) unter `fonts/`. PDFs sind per `.gitignore` ausgeschlossen.
