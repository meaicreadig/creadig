# Legacy → System-Haus · Redirect-Karte

> **Authority:** Spec · Delivery Run · Stand 30.08.2026
> **Gilt für:** den späteren Cutover von `creadig.de` auf die neue Seite.
> **Status heute:** die drei Regeln sind **im Code aktiv** (`next.config.ts`),
> greifen aber erst, wenn die neue Anwendung unter `creadig.de` läuft.
> **Kein Cutover in diesem Lauf.**

---

## Die vollständige Karte

Die alte Seite hat **genau drei** HTML-Adressen ausgeliefert. Alle drei sind
abgedeckt.

| Alt | Neu | Art | Warum |
|-----|-----|-----|-------|
| `/index.html` | `/` | 308 | Startseite |
| `/termin.html` | `/termin` | 308 | Terminstrecke; existiert neu als eigene Route |
| `/meai_intro.html` | `/produkte/meai` | 308 | meAI-Vorstellung; die neue Produktwelt ist der inhaltliche Nachfolger |

Alle drei sind **permanent** (308). Das ist die richtige Wahl: die alten
Adressen kommen nicht zurück, und ein 308 vererbt die Bewertung der alten
Adresse an die neue. Ein temporärer 307 würde beides offen lassen.

---

## Ausgesetzte Adressen (Gate 13)

Nicht Teil des Legacy-Cutovers, sondern eine Folge der Freigabelage.

| Adresse | Ziel | Art | Warum |
|---|---|---|---|
| `/arbeiten/nv-swiss` | `/arbeiten` | **307** | keine hinterlegte Freigabe |
| `/arbeiten/maqam` | `/arbeiten` | **307** | keine hinterlegte Freigabe |
| `/arbeiten/bir-damla-hayir` | `/arbeiten` | **307** | keine hinterlegte Freigabe |
| dieselben unter `/tr`, `/en`, `/ar` | `/<locale>/arbeiten` | **307** | dito |

Diese drei Seiten waren öffentlich und indexierbar; die Überschrift **war** der
Kundenname, ausgewiesen als „Kundenwerk". Seit Gate 13 erscheinen sie nicht
mehr, weil keine schriftliche Freigabe hinterlegt ist
(`docs/ops/proof-kinds.md`).

**307 und nicht 308 — das ist hier der ganze Punkt.** Ein 308 sagt „diese
Adresse kommt nicht zurück". Genau das wäre gelogen: Sobald eine Freigabe
vorliegt, ist die Seite wieder da. Die Adresse ist **ausgesetzt, nicht
aufgegeben** — und ein 308 stünde dann im Browser-Cache und würde sie weiter
verstecken. Bei den drei Legacy-Adressen oben ist 308 richtig, weil die alte
Seite tatsächlich nicht zurückkommt. Derselbe Mechanismus, zwei verschiedene
Aussagen.

Ziel ist die Werkschau, **nicht** eine erfundene Ersatzseite. Der Besucher
sieht, was creaDIG gebaut hat — und nichts über ein fremdes Unternehmen, das
dem nicht zugestimmt hat.

**Zwei Wächter halten das zusammen**, weil die Liste in `next.config.ts` von
Hand gepflegt wird und damit an einer zweiten Stelle steht:

- Das **Freigabe-Gate** (`postbuild`) vergleicht beide Seiten und bricht den
  Build, wenn eine freigegebene Arbeit hier noch umgeleitet wird — sonst wäre
  die Seite da und unerreichbar.
- Der **Smoke-Test** ruft alle drei Adressen wirklich auf. Eine
  Weiterleitungsregel mit einem Tippfehler im Muster greift still nicht: Der
  Build bleibt grün, die Adresse liefert 404, und niemand merkt es.

---

## Was bewusst KEINE Regel bekommt

**Die Anker der alten Startseite.**

Die alte Seite war ein One-Pager. Ihre Navigation zeigte auf
`#leistungen` · `#pakete` · `#meai` · `#ueber-uns` · `#kontakt` · `#top`.

Ein Anker wird vom Browser **nie an den Server geschickt**. `creadig.de/#pakete`
ist für den Server `creadig.de/`. Es kann dafür also keine Weiterleitung geben
— nicht weil wir sie vergessen hätten, sondern weil der Server das Fragment
nicht sieht.

Wer einen alten Anker-Link öffnet, landet auf der neuen Startseite. Das ist
das bestmögliche Verhalten. Die neue Seite hat für jeden dieser Anker ein
eigenes Ziel in der Navigation (`/leistungen`, `/produkte`, `/unternehmen`,
`/kontakt`), sodass der Weg von dort aus einen Klick lang ist.

**Sprachadressen.**

Die alte Seite kannte DE/EN/TR/AR/RU — aber in `localStorage`
(`creadig_lang`), **nicht in der Adresse**. Es existiert keine indexierte
`/en/`- oder `/ar/`-Adresse der alten Seite, die man umbiegen könnte.

Das hat eine angenehme Folge für den Cutover: die neue Spracharchitektur
(`/tr/`, später `/en/`, `/ar/`) kollidiert mit **nichts**. Es gibt keine
Altlast, nur neue Adressen.

Und eine unangenehme: alte Sprachwahl-Bookmarks lassen sich nicht
übersetzen. Ein Besucher, der die alte Seite auf Arabisch gelesen hat,
kommt auf der deutschen Startseite an. Solange AR nicht live ist, ist das
ohnehin der einzige mögliche Zustand.

---

## Prüfung vor dem Cutover

Erst wenn die neue Anwendung unter `creadig.de` läuft, sind diese Regeln
beobachtbar. Dann zu prüfen:

- [ ] alle drei Regeln liefern **308**, nicht 200 und nicht 404
- [ ] keine Kette (alt → neu → neu)
- [ ] keine Schleife
- [ ] `/meai_intro.html` landet auf einer Seite, die es wirklich gibt
- [ ] `www.creadig.de/index.html` verhält sich wie der Apex
      (Achtung: `www` läuft über Cloudflare — eigener Cache, eigenes
      Verhalten, siehe `legacy-current-state.md`)

---

## Rollback

Wenn nach dem Cutover etwas schiefgeht, ist der Weg zurück in
`legacy-archive-plan.md` dokumentiert: Domain zurück auf das
Legacy-Production-Deployment. Die Weiterleitungen verschwinden dann mit der
neuen Anwendung — sie leben in deren `next.config.ts`, nicht in der Domain.
