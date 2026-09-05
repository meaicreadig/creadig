# creaDIG · Compliance-Register

> **Was das ist.** Eine Tafel: Was sagen wir öffentlich, was tut das System
> wirklich, woher stammt die Tatsache, und was fehlt noch. Eine Zeile je Sache.
>
> **Was das nicht ist.** Keine Rechtsberatung und keine Konformitätserklärung.
> Wo eine juristische Wertung nötig ist, steht das als eigener Status da —
> nicht als Ergebnis.
>
> **Regel.** Nichts hier wird aus einem alten Dokument übernommen. Steht kein
> Beleg dabei, ist der Status *offen*, nicht *vermutlich in Ordnung*.
>
> Stand: Gate 04 · 05.09.2026 · gemessen gegen `29d83af`

---

## 1 · Geschäftsidentität

| Feld | Wert | Quelle | Status |
|---|---|---|---|
| Name | creaDIG — Muhammed Emin Akyol | `imprintDetails` | **belegt** |
| Rechtsform | Einzelunternehmen | Owner 22.08.2026 | **belegt** |
| Anschrift | ICO InnovationsCentrum, Albert-Einstein-Str. 1, 49076 Osnabrück | `imprintDetails` | **belegt** |
| Verantwortlich § 18 MStV | Muhammed Emin Akyol | Owner 22.08.2026 | **belegt** |
| E-Mail | info@creadig.de | Code + live | **belegt** |
| Telefon | +41 76 504 58 79 (CH-Mobil) | Code + live | **belegt als einzige Nummer** |
| Deutsche Rufnummer | — | — | **OWNER-TATSACHE** |
| Umsatzsteuer-Status | — | — | **OWNER-TATSACHE, wirkt auf Preise** |
| Handelsregister | nicht anwendbar (Einzelunternehmen) | — | nicht anwendbar |

**Zur Telefonnummer.** Im gesamten Repo existiert **genau eine** Nummer, und
sie ist als Schweizer Mobilnummer live. Es wird **keine veraltete deutsche
Nummer** als aktuell ausgegeben — die Suche nach `+49` findet im
ausgelieferten Code keinen Treffer. Das Impressum weist die fehlende deutsche
Nummer sichtbar als offen aus. § 5 DDG verlangt eine schnelle elektronische
Kontaktaufnahme; E-Mail plus erreichbares Telefon erfüllt das der Sache nach.
Ob eine deutsche Nummer geschäftlich gewünscht ist, ist eine Owner-Frage,
keine offene Rechtsfrage.

---

## 2 · Datenflüsse — was wirklich passiert

Gemessen zur Laufzeit am 05.09.2026, nicht aus dem Quelltext geschlossen.

| # | Fluss | Daten | Empfänger | Aufbewahrung | Offengelegt |
|---|---|---|---|---|---|
| 1 | Seitenaufruf | IP, Zeit, Ressource | Vercel | Server-Logs 30 Tage | ✓ |
| 2 | Einwilligung | Entscheidung | **niemand** — nur `localStorage` | bis der Browser geleert wird | ✓ |
| 3 | Messung (nur nach Einwilligung) | IP, Seitenpfad, sechs benannte Ereignisse | Vercel Analytics | Anbieter | ✓ **in Gate 04 präzisiert** |
| 4 | Kontakt / Termin / Betriebscheck | Name, Betrieb, E-Mail, Telefon, Nachricht | Resend (Mail) + Neon (Speicher) | 12 Monate nach letztem Kontakt | ✓ |
| 5 | Betriebscheck-Antworten | 15 Antworten, Reifegrad, Engpass | wie 4 | wie 4 | ✓ |
| 6 | Bestätigungsmail | Name, Vorgangsnummer | Resend → Absender | Postfach | ✓ |
| 7 | Admin-Sitzung | HMAC-Cookie, keine Person | nur eigener Server | 8 Stunden | intern |
| 8 | Absendegrenze | HMAC der IP, nie die IP selbst | Arbeitsspeicher | Fenster | intern |
| 9 | Sicherung | alles aus 4 und 5 | lokale Datei des Inhabers | Owner-Ablage | § 6 |

**Was NICHT passiert:** keine Cookies · keine Fremdanfrage ohne Einwilligung ·
keine Schriften von Google · keine Karten, keine Videos, keine eingebetteten
Fremdinhalte · keine Weitergabe an Werbenetze · keine automatisierte
Einzelfallentscheidung.

### Laufzeit-Messung

| | ohne Einwilligung | mit Einwilligung |
|---|---|---|
| Fremde Hosts | **keine** | `va.vercel-scripts.com` |
| Cookies | **keine** | **keine** |
| localStorage | **leer** | `creadig_consent` |
| sessionStorage | leer | leer |

Das belegt drei Aussagen der Datenschutzseite, die sonst nur Behauptungen
wären: cookiefrei, keine Verbindung zu Google Fonts, ohne Einwilligung kein
Skript.

---

## 3 · Auftragsverarbeiter

| Verarbeiter | Zweck | Sitz | Grundlage | Vertrag bestätigt? |
|---|---|---|---|---|
| Vercel Inc. | Hosting, CDN, Logs, Messung | USA | Art. 28 + SCC | **offen — Owner** |
| Resend Inc. | Zustellung der Formular-Mails | USA | Art. 28 + SCC | **offen — Owner** |
| Neon, LLC (Databricks, Inc.) | Datenbank der Anfragen (Region Frankfurt) | USA | Art. 28 + SCC | **offen — Owner** |

Der Vertragstext ist bei allen dreien öffentlich verlinkt und geprüft; was
fehlt, ist der Abschluss im jeweiligen Konto. Solange `dpaConfirmed: false`
steht, weist die Datenschutzseite das sichtbar aus — sie behauptet keinen
Vertrag, der nicht geschlossen ist.

**Meta (WhatsApp)** ist **kein** Auftragsverarbeiter: Die Seite bindet nichts
ein, sie verlinkt auf `wa.me`. Erst der Klick stellt eine Verbindung her, und
dann gelten die Bedingungen von Meta — genau so steht es auch auf der Seite.

---

## 4 · Zwecke und ihre Grenzen

| Erhoben für | Darf verwendet werden für | Darf **nicht** verwendet werden für |
|---|---|---|
| Anfrage / Termin | Bearbeitung, Rückfrage, Angebot, Vorgang im Vertrieb | Newsletter, Werbung, Zielgruppen bei Dritten, Anreicherung aus Fremdquellen |
| Betriebscheck | dieselbe Anfrage einordnen | Profilbildung über mehrere Besuche, automatische Bewertung von Personen |
| Beziehungspflege | Kontakt halten, wenn ein Geschäftsbezug besteht | Massenversand, Kaltakquise |
| Messung | Reichweite und Ladezeit der Seite | Wiedererkennung einer Person, Zusammenführung mit Anfragedaten |

**Vertrag für spätere Gates.** Ein Kontakt aus einer Anfrage trägt **keine**
Werbeeinwilligung. Wer Gate 10 (Marketing) baut, braucht dafür eine eigene,
nachweisbare Einwilligung — die vorhandenen Daten liefern sie nicht mit.
Ebenso: Wer Gate 17/18 (Automatisierung, KI) baut, führt personenbezogene
Daten nur nach eigener Prüfung in einen neuen Verarbeiter ein; die heutige
Offenlegung deckt das nicht ab.

---

## 5 · Aufbewahrung und Löschung

**Öffentliche Zusage:** Anfragen ohne Vertrag 12 Monate nach dem letzten
Kontakt; Server-Logs 30 Tage; bei Vertrag die handels- und steuerrechtlichen
Fristen (6/10 Jahre).

**Verfahren:** von Hand, vierteljährlich — so entschieden in
`docs/ops/neon-decision-pack.md` §14, mit fertiger Abfrage und der Bedingung
`sales_status <> 'won'`, die nie fehlen darf. Der Punkt steht im Materialstand
und damit in „Heute"; er verschwindet nicht, weil ein Quartal vergeht.

**Was „letzter Kontakt" heisst.** Das Modell kennt ihn nicht — es kennt
`updated_at`. Die Frist rechnet darauf, und die Abweichung geht bewusst zur
sicheren Seite: Ein bearbeiteter Vorgang wird später gelöscht, nie früher.
Das steht so auch im Decision-Pack und wird hier nicht schöngerechnet.

**Sicherungen.** Eine Löschung in der Datenbank entfernt den Datensatz nicht
rückwirkend aus älteren Sicherungsdateien. Wer eine Löschung ausführt, löscht
ältere Sicherungen mit oder vermerkt den Fall — eine sofortige Löschung aus
jeder je erstellten Sicherung gibt es nicht, und sie wird auch nicht
versprochen.

---

## 6 · Rechte der betroffenen Person

| Recht | Wie es heute erfüllt wird |
|---|---|
| Auskunft | `/admin/vertrieb/anfragen?q=<E-Mail>` findet die Anfrage; die Detailseite zeigt Beleg, Kontakt, Organisation, Vorgänge und Chronik |
| Berichtigung | Kontakt- und Organisationsdaten sind in der Oberfläche änderbar; der **Beleg** der Anfrage bleibt unverändert — er ist das, was jemand abgeschickt hat |
| Löschung | von Hand über dieselbe Suche; die Abfrage aus dem Decision-Pack nennt die Kandidaten |
| Einschränkung | über den Bearbeitungszustand (archiviert) |
| Widerspruch | formlos an info@creadig.de |
| Datenübertragbarkeit | Ausgabe aus der Detailseite; ein Ausfuhr-Knopf existiert nicht und wird bei diesem Volumen auch nicht gebraucht |
| Widerruf der Einwilligung | Cookie-Einstellungen in der Fusszeile; die Entscheidung liegt nur im Browser |
| Beschwerde | Aufsichtsbehörde, auf der Datenschutzseite genannt |

**Ehrliche Grenze:** Es gibt kein Selbstbedienungsportal. Bei dieser
Datenmenge ist die Suche in der Oberfläche der zuverlässigere Weg — ein
Portal wäre mehr Angriffsfläche als Nutzen.

---

## 7 · Was offen ist, und bei wem

| # | Sache | Art | Wirkung |
|---|---|---|---|
| 1 | Umsatzsteuer-Status | **Steuerberater** | „zzgl. 19 % USt." steht auf jedem Preis. Trifft § 19 UStG zu, ist das falsch |
| 2 | Deutsche Rufnummer | **Owner** | Impressum weist die Lücke aus; keine falsche Nummer im Umlauf |
| 3 | AV-Vertrag Vercel | **Owner, Konto** | Datenschutzseite kennzeichnet es als offen |
| 4 | AV-Vertrag Resend | **Owner, Konto** | dito |
| 5 | AV-Vertrag Databricks/Neon | **Owner, Konto** | dito |
| 6 | BFSG-Anwendbarkeit | **Rechtsprüfung** | Die Erklärung beschreibt den technischen Stand, behauptet keine Konformität |

Keine dieser sechs ist durch Programmieren lösbar. Alles, was es war, ist
erledigt.
