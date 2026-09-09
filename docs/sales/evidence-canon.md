# creaDIG · Evidenz

> **Authority:** Kanon · Gate 12 · 06.09.2026
> Schliesst Etappe III (Markt & Gewinnung) ab. Baut auf `market-canon.md` (G09),
> `research-canon.md` (G10) und `contact-canon.md` (G11).
> Ausführbar in `scripts/lib/g12-kohorte.mjs`, geprüft mit `npm run evidence-drill`.

---

## 1 · Die Frage, die dieses Gate stellt

G09 bis G11 haben ein Modell gebaut und es an Fällen geprüft, die für diese
Prüfung **gebaut wurden**: `ABNAHME Ohne Person`, `ABNAHME Mehrstandort`,
`bereit.abnahme.test`. Das ist richtig — man prüft eine Regel an dem Fall, den
man dafür konstruiert.

Nur beweist es nicht, was zählt:

> Trennt diese Kette an **echten** Betrieben Wahrheit von Wunschdenken — und
> zeigt sie ehrlich, wo sie es nicht tut?

Ein Modell, das nur an selbstgebauten Fällen hält, hält an sich selbst.

**Was dieses Gate NICHT behauptet.** Es ist kein Beweis für gewonnene Kunden,
Umsatz, Antworten oder Termine. Es wurde **niemand angesprochen**. Bewiesen
wird die Kette **bis vor** die Ansprache — und dass dort ein Mensch steht.

---

## 2 · Die Kohorte — sechs echte Organisationen

Ausgewählt nicht nach Erfolgsaussicht, sondern danach, dass sie
**unterschiedliche Ergebnisse erzwingen**. Fünf verschiedene Ausgänge bei
sechs Betrieben; hätten alle sechs dasselbe ergeben, hätte die Kohorte nichts
gemessen.

| Betrieb | Ort | Rolle im Beweis |
|---|---|---|
| Wilhelm Volmer GmbH & Co. KG | Osnabrück | Handwerk mit **einem** belegten Signal |
| Osnadach | Georgsmarienhütte | Handwerk mit **drei** belegten Signalen |
| Diakonie Osnabrück Stadt und Land | Osnabrück u. a. | **kein** Handwerk, zwei Signale |
| BECHER Holzhandel · Standort Osnabrück | Osnabrück | belegter **öffentlicher Anlass** |
| Perltex AG | Luzern / Hergiswil (CH) | gleiche Passung, **nicht bedienbar** |
| ASA Ambulanter Pflegedienst | Osnabrück | **Bestandskunde**, öffentlich wiedergefunden |

Alle sechs liegen im Band Osnabrück–Bielefeld–Münsterland oder prüfen es
absichtlich gegen (Perltex). Damit testet die Kohorte zugleich die
`naehe`-Hypothese aus `market-canon.md` — sie widerlegt sie nicht und stützt
sie auch nicht: Nähe war das **Auswahlkriterium**, nicht das Ergebnis.

---

## 3 · Quellenpolitik — was abgerufen wurde und was nicht

**Abgerufen:** ausschliesslich die eigenen Websites der sechs Betriebe und
eine Pressemitteilung auf der eigenen Website ihres Absenders. Beides führt
`SOURCES` in `lib/research.ts` als maschinell zulässig.

**Nicht abgerufen:** Stellenportale, Branchenverzeichnisse, Handelsregister,
LinkedIn. Kein Personenprofil, keine Anmeldeschranke, kein CAPTCHA, keine
Nutzungsbedingung umgangen. Keine Adresse, die der Betrieb nicht selbst
öffentlich gemacht hat.

**Jede Fundstelle liegt auf der eigenen Domain des Betriebs, den sie
beschreibt** — maschinell geprüft, 0 Ausreisser. Ein Beleg über Betrieb A,
der auf Domain B liegt, wäre kein Beleg, sondern ein Gerücht mit Adresse.

### Der Riss in der Quellenpolitik — benannt, nicht geflickt

`SOURCES` beantwortet mit **einem** Feld zwei verschiedene Fragen:

- *Was ist das für eine Quelle?* (`stellenanzeige`)
- *Darf ein Programm sie abrufen?* (`automatisch: false`)

Der Grund für das `false` steht im Kanon und ist richtig: **Portale**
untersagen den maschinellen Abruf. Nur gilt er nicht für den Fall, der in
dieser Kohorte tatsächlich vorkam — die Karriereseite von Volmer liegt auf
`dachdecker-volmer.de`, der eigenen Domain des Betriebs. Sie ist eine
Stellenanzeige **und** abrufbar.

Der Beleg wurde deshalb als `website` geführt. Damit ist die Herkunft wahr und
die **Art** verloren — ausgerechnet bei der Quelle, die `research-canon.md`
die ergiebigste nennt.

**Nicht in G12 geflickt, und das mit Absicht.** Der richtige Ort ist G26, wo
maschinelles Abrufen tatsächlich gebaut wird. Ein Feld jetzt zu ergänzen, das
kein Codepfad liest, wäre genau das, was dieser Kanon verbietet: gefüllt statt
wahr. Die Schuld steht in `docs/roadmap/master-architecture.md`.

---

## 4 · Was herauskam

| Betrieb | Q | Signale | Passung | Person | Zugang | Anlass | Abbruch | Kontakt | Deckung | Entscheidung |
|---|---|---|---|---|---|---|---|---|---|---|
| Volmer | 2 | 1 | unklar | offen | offen | — | beleg-fehlt | person-unbekannt | nein | **offen** |
| Osnadach | 2 | 4 | **passend** | ja | offen | — | eingeordnet | zugang-offen | nein | **offen** |
| Diakonie | 1 | 2 | **passend** | offen | offen | — | eingeordnet | person-unbekannt | nein | **offen** |
| BECHER | 1 | 1 | unklar | ja | offen | **ja** | beleg-fehlt | zugang-offen | **ja** | **offen** |
| Perltex | 1 | 2 | **passend** | ja | offen | — | **zurückgestellt** | zugang-offen | nein | **offen** |
| ASA | 1 | 1 | unklar | offen | bestandskunde | — | beleg-fehlt | person-unbekannt | **ja** | **offen** |

*Q = Anzahl unterschiedlicher Fundstellen.*

**Die vier Sätze, die diese Tabelle beweist:**

1. **Handwerk ist nicht automatisch passend.** Volmer ist ein Meisterbetrieb
   mit Innungsmitgliedschaft — und bleibt bei *unklar*, weil genau ein
   Betriebssignal belegt ist. Ein branchenbasiertes Zielbild hätte ihn
   durchgewinkt.
2. **Die Branche filtert nicht.** Die Diakonie ist kein Gewerk und trotzdem
   *passend* — fünf eigenständige Dienste, Leistung in der Wohnung.
3. **Bedienbarkeit schlägt Passung.** Perltex hat zwei belegte Signale und eine
   belegte Person. Trotzdem: *zurückgestellt*. Wem creaDIG heute keine
   Rechnung stellen kann (G35), den spricht es nicht an — ein guter Zugang
   macht das nicht besser, er macht es teurer.
4. **Der Mensch steht noch da.** Sechs von sechs Entscheidungen sind offen.
   Zwei Fälle sind *gedeckt* — bei beiden hat trotzdem niemand entschieden,
   und kein Codepfad hätte es tun können.

**Die Handwerk-Hypothese** bekam eine faire Chance und ein geteiltes Ergebnis:
Osnadach (Handwerk, drei Signale, passend) stützt sie, Volmer (Handwerk, ein
Signal, unklar) nicht. Sie bleibt `ungeprueft` im Register — zwei Betriebe
entscheiden keine Marktfrage, und verkauft wurde an keinen von beiden. Der
Satz aus `market-canon.md` gilt unverändert: **der erste verkaufte
Handwerksbetrieb entscheidet.**

---

## 5 · Bruchstellen — wo die Kette real endete

| Typ | Fall | Warum |
|---|---|---|
| **B · Evidence** | Volmer, BECHER, ASA | zu wenige belegte Betriebssignale für ein Urteil |
| **D · Person** | Diakonie, ASA | kein Mensch öffentlich benannt |
| **E/F · Zugang + Anlass** | Osnadach | Person belegt, aber weder Weg noch Anlass |
| **G · Bedienbarkeit** | Perltex | Schweiz, Rechnungslage offen bis G35 |
| **I · Owner-Entscheidung offen** | BECHER, ASA | gedeckt, aber der Mensch hat nicht entschieden |

**A · Discovery Failure** kam nicht vor — für alle sechs gab es einen
belastbaren `discovery_why`. **C · Fit Failure** kam nicht vor: keine
Organisation war belegt *unpassend*, drei blieben *unklar*. Das ist ein
Ergebnis, keine Lücke — ein harter Ausschluss verlangt einen **Beleg**, und
„kein Betriebssignal gefunden" ist keiner. Wer Abwesenheit als Beweis nimmt,
erfindet Tatsachen.

**H · Economic Unknown** gilt für alle sechs: `kaufkraft` ist strukturell
`null`. Das Modell erfindet dort nichts (A24) — es klärt sich im Gespräch.

### Der teuerste Befund: Signale, die man nicht belegen kann

Vier der neun Betriebssignale sind über **Abwesenheit** definiert —
`kein-statusbild`, `wissen-in-koepfen`, `mehrfacherfassung`,
`wiederkehrende-handarbeit`. Von aussen ist Abwesenheit nicht beobachtbar:
Dass eine Website keine Auftragsverfolgung zeigt, belegt nicht, dass der
Betrieb keine hat.

Das erklärt die Zahl, die zuerst nach Schwäche aussieht — **drei von sechs bei
*unklar***: Es ist keine schlechte Recherche, es ist die ehrliche Grenze
öffentlicher Quellen. Die belegbaren Signale sind die **anwesenden**
(Standorte, Aussendienst, WhatsApp, eine Person in allen Kontaktwegen), und
genau die trugen alle drei *passend*-Urteile.

**Folge für G09:** Das Zwei-Signale-Kriterium bleibt. Was dazukommt, ist die
Erkenntnis, dass ein Teil des Signalkatalogs erst **im Gespräch** belegbar ist,
nicht in der Recherche. Das ist keine Modelländerung — es ist die Antwort auf
die Frage, warum ehrliche Recherche so oft bei *unklar* landet.

---

## 6 · Kennzahlen

Gemessen, nicht angestrebt. Es sind **keine Zielquoten**.

| | |
|---|---|
| Organisationen untersucht | 6 |
| davon Handwerk | 2 |
| mit belastbarem `discovery_why` | 6 |
| mit mindestens zwei belegten Signalarten | 3 |
| passend / unklar / unpassend | 3 / 3 / 0 |
| mit belegter Person-Fundstelle | 3 |
| mit Zugang | 1 |
| mit belegtem Anlass | 1 |
| mit Ansprachedeckung | 2 |
| Owner-Entscheidung offen | **6** |
| Owner-Entscheidung gesetzt | 0 |
| **automatisch erzeugte Verkaufschancen** | **0** |
| **automatisch erzeugte Werbeeinwilligungen** | **0** (kein solches Feld im ganzen Schema) |
| **Belege ohne Fundstelle akzeptiert** | **0** (vom Schema abgelehnt) |
| **Fundstellen ausserhalb der eigenen Domain** | **0** |
| System Failures gefunden | 3 |
| System Failures im Lauf behoben | 3 |

---

## 7 · Was die Realität am System gefunden hat

Drei Widersprüche, die an konstruierten Fällen nie aufgefallen sind, weil man
sie nicht konstruiert, wenn man sie nicht kennt.

### 7.1 Zwei Funktionen, eine Person, zwei Antworten

**Befund.** BECHER nennt in der Pressemitteilung eine Person mit Rolle. Trägt
man sie ohne Fundstelle ein, sagte dieselbe Detailseite gleichzeitig:

> „ist eingetragen, aber ohne Fundstelle — ein Name ohne Quelle ist eine Vermutung."
> „Eine Ansprache wäre gedeckt."

Und die Auswahl **„Kontakt vorbereiten" war freigeschaltet**, denn die
Oberfläche schaltet sie allein an der Deckung frei.

**Ursache.** Die Fundstellen-Prüfung stand nur in `kontaktLage()`.
`ansprachedeckung()` fragte daneben bloss, ob ein Personensatz *existiert*.

**Folge.** Eine Vermutung hätte einen Menschen erreichen können — genau das,
was `contact-canon.md` ausschliesst.

**Behebung.** `personBelegt()` als **eine** Antwort, benutzt von beiden.
Zusätzlich ein eigener Grund für den Fall „Anlass belegt, Person ohne
Fundstelle": *Ein Name ohne Quelle ist eine Vermutung.*

**Nachweis.** `evidence-drill` A04/A05, plus die ausdrückliche Probe, dass
beide Sätze der Seite dasselbe über dieselbe Person sagen.

### 7.2 Ein bestehender Weg ohne Menschen am Ende

**Befund.** ASA ist Bestandskunde. `ansprachedeckung()` meldete *gedeckt*,
während dieselbe Seite „Keine Person bekannt" schrieb. Beim Anlass-Weg war
diese Lücke ausdrücklich geschlossen („Ein Anlass allein erreicht niemanden") —
beim bestehenden Weg nicht.

**Ursache.** Asymmetrie zwischen den zwei Deckungswegen.

**Behebung.** Die Deckung bleibt — bei einem Bestandskunden ist der Kontakt
gerechtfertigt, das ist Kanon. Der **Grund** sagt jetzt, was fehlt:
*„Eine belegte Person ist aber noch nicht zugeordnet: vorbereitet würde der
Betrieb, nicht ein Mensch."* Die Seite hört auf, sich selbst zu widersprechen.

### 7.3 Ein Werkzeug, das das Sammeln von Belegen bestraft

**Befund.** Osnadach belegt „mehrere Standorte" aus **zwei** Fundstellen, die
dasselbe sagen. Die Seite meldete das in Rot als *„Widerspruch: zwei gültige
Belege sagen Verschiedenes"*.

**Ursache.** `widersprueche()` zählte, wie viele gültige Belege auf demselben
Signal liegen — mehr **kann** ein Programm hier nicht: Ob zwei Sätze einander
widersprechen oder bestätigen, steht in der Sprache, nicht in der Struktur.
Behauptet wurde trotzdem das Stärkere.

**Folge.** Ein Evidenzsystem, das den zweiten Beleg als Fehler anzeigt,
erzieht dazu, keinen zweiten zu suchen.

**Behebung.** `mehrfachBelegt()`. Die Meldung sagt jetzt, was gemessen wurde,
und überlässt dem Menschen, was es bedeutet. Rot ist sie nicht mehr.

### 7.4 Ein Probelauf, der beim zweiten Mal etwas anderes sagte

Kein Befund am System, sondern am neuen Werkzeug selbst — hier, weil er
dieselbe Klasse ist: Der `evidence-drill` hinterliess beim ersten Lauf Vorgänge
und Belege, die den zweiten verfälschten. Ein Werkzeug, dessen Antwort davon
abhängt, wie oft man es schon aufgerufen hat, misst nichts. Er räumt jetzt
zuerst seine **eigenen** Spuren weg — und nur die; Organisationen mit
`import_key` stammen aus dem Bestand und werden nie gelöscht.

---

## 8 · Personendaten

Drei der sechs Betriebe nennen öffentlich eine verantwortliche Person
(Impressum, Website, Presse). Für die Kette zählt an einer Person genau
dreierlei: **dass es sie gibt**, welche **Rolle** sie hat, und ob eine
**Fundstelle** sie belegt. Der Name trägt zur Prüfung nichts bei.

Deshalb steht im Repository „Person A/B/C" mit Rolle und Fundstelle. Wer den
Namen braucht, findet ihn an der Fundstelle — er muss nicht dauerhaft in einem
öffentlichen Repository mitlaufen. **Keine Mailadresse, keine Telefonnummer,
kein Personenprofil** zu einer recherchierten Person; maschinell geprüft (A21).

---

## 9 · Grenzen — was G12 nicht beweist

- **Keine kommerzielle Wirkung.** Kein Kunde, kein Umsatz, keine Antwort, kein
  Termin. Es wurde niemand angesprochen und nichts versendet.
- **Sechs Betriebe sind keine Marktaussage.** Sie beweisen, dass die Kette
  trennt — nicht, wie der Markt aussieht.
- **Drei der sechs stehen seit dem 09.09.2026 in der Produktion** (Osnadach,
  Volmer, BECHER) — siehe §12. Die anderen drei liefen nur lokal. Die
  menschliche Kontaktentscheidung ist in der Produktion weiterhin **nie**
  ausgeübt worden, und das ist kein Rückstand: `contact_decision` steht bei
  allen dreien auf `NULL`, weil kein Agent sie im Namen des Eigentümers
  treffen darf.
- **Abwesende Betriebssignale bleiben unbelegbar** (siehe §5).
- **`kaufkraft` bleibt strukturell unbekannt** bis G23.

---

## 10 · Evidenz ist kein Marketingbeleg

Die schärfste Grenze dieses Gates, und sie zeigt nach vorn zu G13:

> **Recherche-Evidenz ist kein Kundenbeleg.**

Die sechs Betriebe dieser Kohorte sind **keine creaDIG-Referenzen**. Keiner
von ihnen ist Kunde (ausser ASA — und der war es vorher). Keiner hat einer
Nennung zugestimmt. Keiner weiss, dass er recherchiert wurde.

Was hier belegt ist, belegt **eine Beobachtung über einen Betrieb** — nicht
eine Leistung von creaDIG, nicht eine Freigabe, nicht eine Empfehlung. Diese
Namen dürfen in keinem öffentlichen Text, keiner Fallstudie und keiner
Referenzliste auftauchen. G13 entscheidet über Belege **mit Freigabe**; das
ist eine andere Frage und braucht eine andere Zustimmung.

---

## 11 · Übergabe an G13 · Beleg & Freigaben

**Was real beobachtbar war.** Öffentliche Quellen tragen zuverlässig:
Standorte, Aussendienst, Kontaktwege (bis hin zu WhatsApp als Hauptkanal),
eine Person als Schnittstelle, öffentlich gemachte Veränderungen. Sie tragen
**nicht**: fehlende Systeme, Doppelerfassung, Handarbeit im Innern.

**Welche Evidenzarten belastbar waren.** Impressum und eigene Website: hoch,
sofort prüfbar. Presse: hoch für Ereignisse, mit Datum. Verzeichnisse und
Portale: nicht angefasst.

**Welche creaDIG-Fähigkeit dazu passt.** Die belegbaren Probleme sind
**Koordinations**- und **Statusprobleme** über mehrere Orte hinweg — nicht
Gestaltungsprobleme. Wer damit wirbt, wirbt an der Evidenz vorbei.

**Was G13 NICHT verwenden darf.** Kein Name aus dieser Kohorte. Keine
Beobachtung über einen fremden Betrieb als creaDIG-Beleg. Keine dieser
Organisationen als Referenz, Fallstudie oder Logo.

**Welche Belege G13 tatsächlich braucht.** Freigaben von **eigenen** Kunden —
die 19 aus dem Bestand. Der Owner-1.0-Satz gilt unverändert: **null**
freigegebene Kundenbelege, `PRODUCT_SCREENS` leer, keine Handwerks-Referenz.
G12 ändert daran nichts und hat es auch nicht versucht.

**Die reale Proof-Lücke.** creaDIG kann heute belegen, wie es Betriebe
**beurteilt**. Es kann nicht belegen, was es für sie **gebaut** hat. Das ist
G13.

---

## 12 · Der Betriebsnachweis — 09.09.2026

Production trägt `0fec317` (`dpl_4fTX8gFgHc6H2ZvXYdsXHENhCBwr`, promotet aus
der Vorschau `dpl_E91fRKoKPSjKVXWCCsoXACVKmyLZ`, kein `gitDirty`). Danach
wurden über `scripts/research-import.mjs --apply` **drei** der sechs Fälle
geschrieben. Ausgewählt nicht nach dem schönsten Ergebnis, sondern weil sie
zusammen drei verschiedene Systemzustände tragen.

| | vorher | nachher | Delta |
|---|---|---|---|
| `research_cases` | 0 | **3** | +3 |
| `research_evidence` | 0 | **9** | +9 |
| `organisations` | 29 | 32 | +3 |
| `contacts` | 13 | 15 | +2 |
| **`opportunities`** | 2 | **2** | **0** |
| **`contact_decision` gesetzt** | 0 | **0** | **0** |
| Belege ohne Fundstelle | 0 | **0** | 0 |
| recherchierte Person mit Mail/Nummer | — | **0** | — |

**Keine bestehende Organisation wurde angefasst.** Gemessen an
`updated_at`: genau drei geänderte Organisationen in zwei Stunden, alle drei
neu angelegt, keine mit `import_key` — der Kundenbestand blieb unberührt.

| Fall | Passung | Belege / Quellen | Person | Zugang | Anlass | Stop | Deckung | Entscheidung |
|---|---|---|---|---|---|---|---|---|
| **Osnadach** | passend | 5 / 2 | Inhaber · Impressum | offen | — | eingeordnet | nein | **NULL** |
| **Volmer** | unklar | 2 / 2 | keine | offen | — | beleg-fehlt | nein | **NULL** |
| **BECHER** | unklar | 2 / 1 | Geschäftsleiter · Presse | offen | **ja** | beleg-fehlt | **ja** | **NULL** |

Der wichtigste Eintrag steht in der letzten Spalte, dreimal. **BECHER ist
gedeckt** — belegter Anlass, belegte Person — und trotzdem hat niemand
entschieden. Es gibt keinen Codeweg, der es könnte. Das ist der Satz aus
Gate 11 an echten Produktionsdaten: „bereit für Kontakt" ist ein Zustand des
Wissens, ansprechen ist eine Entscheidung.

**Osnadach trägt den dritten G12-Fix an echten Daten:** `mehrere-standorte`
ist aus zwei verschiedenen Fundstellen belegt (Impressum und Startseite). Vor
dem Fix hätte die Seite das rot als „Widerspruch: zwei gültige Belege sagen
Verschiedenes" gemeldet — bei zwei Quellen, die sich decken. Jetzt steht dort
„mehrfach belegt", und was es bedeutet, liest ein Mensch.

Die beiden anderen Fixes (`personBelegt`, Bestandsweg ohne Person) kommen in
diesem Datensatz nicht vor. Sie wurden **nicht künstlich erzeugt**, nur um
sie live zu zeigen — dafür gibt es den Probelauf.

**Diese drei Fälle sind ab jetzt echter Research-Bestand**, keine Testdaten.
Sie werden nicht gelöscht.
