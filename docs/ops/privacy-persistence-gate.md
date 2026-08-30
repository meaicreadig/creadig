# Datenschutz-Tor vor der Lead-Persistenz

> **Authority:** Spec · Delivery Run · Stand 30.08.2026
> **Status:** **OWNER DECISION REQUIRED** — dieser Text ist vorbereitet,
> **nicht** eingebaut. `LEAD_STORE` bleibt in Produktion leer.

---

## Warum das ein Tor ist und keine Aufgabe

In der veröffentlichten Datenschutzerklärung steht heute wörtlich
(`lib/dictionary.ts`, Abschnitt „Formulare"):

> „Eine Datenbank führen wir nicht: Ihre Anfrage liegt ausschließlich in
> unserem E-Mail-Postfach."

Das ist derzeit **wahr**. Es hört in der Sekunde auf, wahr zu sein, in der
`LEAD_STORE` auf einen echten Anbieter zeigt.

Deshalb sind Datenbank-Aktivierung und Datenschutz-Änderung **eine einzige
Freigabe**, nicht zwei Aufgaben nacheinander. Wer die Reihenfolge dreht, hat
für die Dauer der Lücke eine falsche Rechtsauskunft auf der eigenen Seite —
und zwar an der Stelle, an der Besucher ihre Einwilligung erteilen.

Der Code kennt dieses Tor bereits: ohne `LEAD_STORE` speichert die Route
nichts, und der Arbeitsspeicher- wie der Datei-Adapter verweigern in
Produktion den Dienst. Es gibt also keinen Weg, versehentlich zu speichern.

---

## Was der Owner entscheiden muss

Alle vier Punkte sind **rechtliche/geschäftliche** Entscheidungen. Ich kann
sie vorbereiten, aber nicht treffen — und ich erfinde keine Rechtssicherheit.

| # | Entscheidung | Warum sie nicht ableitbar ist |
|---|---|---|
| 1 | **Verarbeiter benennen** — wer betreibt die Datenbank rechtlich? | Neon ist der technische Kandidat. Wird er über den Vercel-Marketplace bezogen, ist der Rechnungssteller nicht zwingend der Verarbeiter. Der bestehende Vercel-AVV deckt Hosting; ob er einen Datenbankdienst Dritter mitdeckt, ist **ungeprüft**. |
| 2 | **AVV/DPA unterschreiben** + Unterauftragnehmer in die Empfängerliste | Vertragsakt. |
| 3 | **Region festlegen** | Vorgesehen: `aws-eu-central-1` (Frankfurt). Muss beim Anlegen **gewählt** werden — sie ist nicht der Standard und lässt sich nachträglich nicht umstellen. |
| 4 | **Löschfrist** | 24 Monate nach letztem Kontakt ist eine Ausgangsempfehlung, **kein** Naturgesetz. Unterscheiden: Anfrage ohne Vertrag · Kunde · gesetzlich aufbewahrungspflichtige Unterlagen. Für diese Stufe genügt die Frist für **Anfragen ohne Vertrag**. |

Details und die sechs Prüffragen je Anbieter: `docs/ops/lead-store.md`.

---

## Der fertige Textbaustein

Einzubauen **gleichzeitig** mit dem Setzen von `LEAD_STORE` — nicht davor,
nicht danach. Platzhalter in `«»` füllt die Entscheidung oben.

### DE — ersetzt den Satz „Eine Datenbank führen wir nicht: …"

> Ihre Anfrage speichern wir zusätzlich in einer Datenbank, damit wir sie
> zuverlässig bearbeiten und den Bearbeitungsstand nachvollziehen können.
> Betreiber dieser Datenbank ist «Anbieter» als Auftragsverarbeiter nach
> Art. 28 DSGVO; die Daten liegen in «Region». Rechtsgrundlage ist Ihre
> Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Wir löschen Ihre Anfrage
> «Frist» nach dem letzten Kontakt, sofern kein Vertrag zustande kommt.

### TR — ersetzt den entsprechenden Satz in `dictionary.tr`

> Talebinizi ayrıca bir veritabanında saklıyoruz; böylece güvenilir biçimde
> işleyebiliyor ve hangi aşamada olduğunu takip edebiliyoruz. Bu veritabanını
> GDPR md. 28 uyarınca veri işleyen sıfatıyla «Anbieter» işletir; veriler
> «Region» bölgesinde tutulur. Hukuki dayanak, GDPR md. 6/1-a uyarınca
> verdiğiniz açık rızadır. Sözleşme kurulmadığı takdirde talebinizi son
> temastan «Frist» sonra sileriz.

### EN · AR

**Noch nicht anwendbar.** Es gibt keine englische und keine arabische Fassung
der Datenschutzerklärung, weil es diese Sprachversionen der Website nicht
gibt. Sobald sie entstehen, ist dieser Absatz Teil ihres Erstübersetzungs-
umfangs — nicht ein Nachtrag.

Der Typ erzwingt das ohnehin: `Localized<T>` verlangt einen Eintrag je
gepflegter Sprache, eine halbe Sprache lässt sich nicht bauen.

---

## Was zusätzlich zu ergänzen ist

- **Empfängerliste** in der Datenschutzerklärung: «Anbieter» neben Resend
  und Vercel aufnehmen.
- **Auskunft und Löschung**: Beides muss praktisch durchführbar sein. Heute
  liegt eine Anfrage nur im Postfach; künftig an zwei Orten. Wer löscht,
  muss **beide** treffen.

---

## Reihenfolge beim Scharfschalten

1. Entscheidungen 1–4 treffen, AVV unterschrieben
2. Datenbank in «Region» anlegen, Verbindung nur als Server-Env
3. Datenschutztexte DE + TR ersetzen · Empfängerliste ergänzen
4. **Erst jetzt** `LEAD_STORE` setzen und den Produktions-Adapter bauen
5. Echten Schreib- und Lesevorgang nachweisen

Schritt 3 vor Schritt 4. Das ist der ganze Punkt dieses Dokuments.
