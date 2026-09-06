# creaDIG · Deployment-Kontrolle

> **Authority:** Ops · Owner-Beschluss 06.09.2026
> Schwester von `schema-control.md`. Dort: wer das **Schema** ändern darf.
> Hier: wer **Code auf creadig.de** bringen darf.

---

## 0 · Die Regel

> **PRODUKTIONS-DEPLOYMENT VERLANGT EINE AUSDRÜCKLICHE FREIGABE DES
> EIGENTÜMERS IM LAUFENDEN ZUG.**

Ohne diese Freigabe ist **jedem** Agenten untersagt:

- `vercel --prod` aufzurufen
- eine Vorschau zu Produktion zu befördern
- Produktion über API, CLI oder Dashboard-Automatik auszulösen
- `CREADIG_DEPLOY_PRODUCTION` selbst zu setzen
- eine Deployment-Erlaubnis aus einem abgeschlossenen Gate abzuleiten
- eine Freigabe aus einem früheren Zug wiederzuverwenden

Ohne Freigabe **erlaubt**: entwickeln · testen · lokal committen · Git-Push,
solange er nur eine Vorschau erzeugt · Vorschau-Deployments · Produktion
lesend ansehen · Migrationen und Deployment-Pakete vorbereiten.

**Der Beschluss dazu.** Eine frühere Fassung dieser Akte machte die
Gate-Freigabe davon abhängig, dass *jeder denkbare* Weg nach Produktion
strukturell unmöglich ist. Diese Regel ist **zurückgezogen**: Sie ist für
eine Vercel-Hobby-Umgebung zu stark und hätte die Programmarbeit an einer
Plattformgrenze angehalten, die mit dem Produkt nichts zu tun hat.

Die Regel oben ist eine **Anweisung an Menschen und Agenten**. Der Schutz im
Repository (Commit `b46a13f`) bleibt als zweite Verteidigungslinie — er
ersetzt die Anweisung nicht, er fängt das Versehen.

---

## 1 · Was ein Push wirklich tut

Der wichtigste Befund — und er entlastet:

**Ein Push auf `feat/system-haus-site` erzeugt eine Vorschau, keine
Produktion.** Nachgewiesen an sechs Deployments mit `repoPushedAt` und
`target: null`.

Produktion verlangt **immer** einen zweiten, ausdrücklichen Schritt. In den
letzten zwei Tagen kamen beide vor:

| Weg | Signatur in der Deployment-Liste | Wie oft |
|---|---|---|
| `vercel --prod` aus dieser Arbeitskopie | `actor: "cursor-cli"`, `gitDirty: "1"` | 4 |
| Beförderung einer Vorschau | `action: "promote"` + `originalDeploymentId` | 5 |
| Push allein | — | **0** |

Deshalb sperrt dieses Haus Pushes **nicht**. Eine Sperre gegen etwas
Harmloses erzieht nur dazu, Sperren zu umgehen.

---

## 2 · Die Wege nach Produktion — vollständig

| # | Weg | Kontrolliert? |
|---|---|---|
| 1 | `npm run deploy:production` | **ja** — verlangt `CREADIG_DEPLOY_PRODUCTION` |
| 2 | `vercel --prod` direkt getippt | **nein** — global installiertes Programm |
| 3 | Beförderung im Vercel-Dashboard | **nein** — Plattformseite |
| 4 | Beförderung über die Vercel-API | **nein** — Plattformseite |
| 5 | Git-Push | erzeugt nur Vorschau |
| 6 | GitHub Actions | **deployt nicht** (`ci.yml` führt nur Tests) |
| 7 | Deploy-Hooks in `vercel.json` | **keine** |

**Was der Befehl leistet:** Er ist der vorgesehene Weg und macht die Absicht
zur Bedingung. Er beseitigt das versehentliche Deployment aus dem gewohnten
Ablauf heraus — und genau das war der Fall, der eingetreten ist.

**Was er nicht leistet:** Wege 2 bis 4. Ein global installiertes Programm
lässt sich von hier aus nicht abfangen, und die Plattformseite gehört dem
Eigentümer. Das ist keine gelöste Sache, sondern eine benannte.

---

## 3 · Was die Plattform nicht kann — offene Governance-Schuld

Das Konto läuft auf **Hobby**. Die dort verfügbaren Schutzfunktionen —
Passwortschutz, Vercel-Authentifizierung, Trusted IPs — regeln den **Zugang
zu** Deployments, nicht ob deployt werden **darf**. Sie auf Produktion zu
setzen würde creadig.de für Besucher sperren; das wäre kein Schutz, sondern
ein Ausfall.

Aktueller Stand, gelesen: SSO aktiv für alles **ausser** eigenen Domänen —
Vorschauen geschützt, öffentliche Seite offen. Richtig so, unverändert.

**Offen und bewusst offen gelassen:**

1. Vercel Hobby kann die gewünschte Freigabegrenze über **alle** direkten
   CLI-, Dashboard- und API-Wege nicht erzwingen.
2. Direkt getipptes `vercel --prod` bleibt technisch möglich.
3. **Zweite und parallele Agentensitzungen müssen dieselbe Owner-Regel
   befolgen** — sie steht in §0 und gilt für sie genauso.
4. Ein stärkerer Plattformschutz ist später bewertbar, nicht heute nötig.

Das ist **Governance-Schuld**, kein Produkt-Blocker. Sie hält keine
Gate-Arbeit auf.

## 4 · Die Befehle

```
npm run deploy:preview       # Vorschau. Produktion unberührt.
npm run deploy:production    # bricht ohne Freigabe ab (exit 3)

CREADIG_DEPLOY_PRODUCTION=ja-ich-deploye-produktion npm run deploy:production
```

Kein `npm run deploy`, das still Produktion bedeutet. Der Name sagt das Ziel.

---

## 5 · Was ohne Freigabe erlaubt ist

**Erlaubt:** entwickeln · testen · lokal committen · Migration vorbereiten ·
Deployment-Paket vorbereiten · Produktion **lesend** ansehen (seit
`schema-control.md` folgenlos) · Vorschau-Deployment.

**Nicht erlaubt:** `deploy:production` aufrufen · eine Vorschau befördern ·
die Freigabe-Variable selbst setzen · den Schutz umgehen.

Die Freigabe ist ein Satz des Eigentümers **im laufenden Zug** — etwa
**„Production deploy freigegeben"**. Nicht abgeleitet, nicht aus einem
abgeschlossenen Gate, nicht aus einem früheren Zug übernommen. Siehe §0.

---

## 6 · Zurückrollen

Vercel hält frühere Produktions-Deployments als Rollback-Kandidaten
(`isRollbackCandidate: true`). Der Weg zurück führt über das Dashboard:
vorheriges Produktions-Deployment auswählen und befördern. Kein Code-Weg
nötig, kein Push.

**Wichtig:** Ein Rollback der Anwendung rollt **keine Migration** zurück.
Deshalb sind Migrationen additiv (`schema-control.md`) — eine neue Spalte
stört eine ältere Anwendung nicht.

---

## 7 · Zweigabdrift — nur Beobachtung

- Produktionszweig ist **`feat/system-haus-site`**.
- `main` liegt **277 Commits** zurück und enthält **keinen** Gate-Commit.

Ein Zweig namens `feat/…` als Produktionszweig ist selbstwidersprechend, und
277 Commits Abstand entstehen nicht durch eine Entscheidung. **Nichts
angefasst** — kein Merge, kein Rebase, kein Reset, kein Zweigwechsel.

**Owner-Beschluss 06.09.2026:** Die Normalisierung wird **vor Gate 09 nicht
angefasst**. Ein Zweigumbau kurz vor dem ersten Gate, das nach aussen
arbeitet, ist unnötiges Risiko. Die Drift bleibt offen und benannt.

---

## 8 · Vorfälle

| Datum | Was | Folge |
|---|---|---|
| 05.–06.09. | 8 Produktions-Deployments durch `cursor-cli` und Beförderung, keines vom Eigentümer ausgelöst | Anlass dieses Dokuments |
| 06.09. | Migration 007 über einen Anwendungsstart nach Produktion | behoben in `schema-control.md` |
| 06.09. | Beim **Testen dieses Schutzes** lief der freigegebene Zweig versehentlich durch — die Testmethode (`PATH="/nonexistent:$PATH"`) versteckt ein Programm **nicht** | Ergebnis war eine **Vorschau** (`target: null`), Produktion unverändert. Deployment `dpl_FxwaqCiYvzs352kh2QVV3LXXSKkK`, SSO-geschützt, nicht auf der Domain |

Der dritte Eintrag steht hier, weil er dieselbe Klasse ist wie die ersten
zwei: eine Handlung mit Aussenwirkung, die aus einem Ablauf herausfiel statt
aus einer Entscheidung. Ein Werkzeug, das man nur „mal testen" will, ist das
gefährlichste — man rechnet nicht damit, dass es wirkt.
