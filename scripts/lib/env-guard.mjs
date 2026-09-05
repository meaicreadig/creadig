/**
 * Der Schutz zwischen Werkzeug und Produktion.
 *
 * ===========================================================================
 * WARUM ES DIESE DATEI GIBT
 * Bis hierher stand im Betriebshandbuch der Satz „Abnahmelaeufe laufen
 * ausschliesslich mit LEAD_STORE=file". Das ist eine Bitte, kein Schutz. Ein
 * einziges vergessenes Terminalfenster mit einer echten DATABASE_URL, und ein
 * Abnahmelauf schreibt in die Produktionsdatenbank — genau dann, wenn man in
 * Eile ist.
 *
 * Disziplin ist kein Schutzmechanismus. Ein Schutzmechanismus sagt NEIN, auch
 * wenn man sich sicher ist.
 *
 * ---------------------------------------------------------------------------
 * DIE REGEL: IM ZWEIFEL NEIN
 * Die Erkennung stuetzt sich nicht auf EIN Merkmal — ein einzelner
 * Zeichenkettenvergleich ist so lange richtig, bis jemand einen Hostnamen
 * aendert. Gesammelt werden mehrere; findet sich eines, das nach Produktion
 * aussieht, ist die Antwort nein.
 *
 * Und: Fehlt jede Angabe, ist die Antwort ebenfalls nein. Eine unbekannte
 * Datenbank wie eine sichere zu behandeln waere genau die Annahme, gegen die
 * dieser Schutz gebaut ist.
 *
 * ---------------------------------------------------------------------------
 * WAS HIER NICHT PASSIERT
 * Kein Geheimnis wird ausgegeben. Die Verbindungszeichenfolge wird zerlegt,
 * geprueft und verworfen; nach aussen geht hoechstens der Hostname ohne
 * Zugangsdaten.
 *
 * Der laufende Betrieb wird NICHT angefasst. Dieser Schutz gilt Werkzeugen —
 * Sicherung, Rueckspielung, Abnahme, Sonden. Die Anwendung selbst muss in
 * Produktion natuerlich auf die Produktionsdatenbank schreiben.
 */

export function environmentKind() {
  const signale = []
  if (process.env.VERCEL_ENV) signale.push(`VERCEL_ENV=${process.env.VERCEL_ENV}`)
  if (process.env.NODE_ENV) signale.push(`NODE_ENV=${process.env.NODE_ENV}`)
  if (process.env.CI) signale.push("CI")
  if (process.env.CREADIG_ENV) signale.push(`CREADIG_ENV=${process.env.CREADIG_ENV}`)

  const vercel = process.env.VERCEL_ENV
  if (vercel === "production") return { kind: "production", why: "VERCEL_ENV=production", signale }
  if (vercel === "preview") return { kind: "preview", why: "VERCEL_ENV=preview", signale }
  if (vercel === "development") return { kind: "local", why: "VERCEL_ENV=development", signale }

  const eigen = process.env.CREADIG_ENV
  if (eigen === "production") return { kind: "production", why: "CREADIG_ENV=production", signale }
  if (eigen === "preview") return { kind: "preview", why: "CREADIG_ENV=preview", signale }
  if (eigen === "local") return { kind: "local", why: "CREADIG_ENV=local", signale }

  /*
   * Ohne Plattform-Angabe: NODE_ENV=production heisst „gebauter Stand", nicht
   * zwingend Produktion — `next start` setzt es lokal auch. Deshalb gilt es
   * hier als UNBEKANNT und nicht als sicher.
   */
  if (process.env.NODE_ENV === "production") {
    return { kind: "unknown", why: "NODE_ENV=production ohne Plattform-Angabe", signale }
  }
  if (process.env.NODE_ENV === "development") return { kind: "local", why: "NODE_ENV=development", signale }
  return { kind: "unknown", why: "keine Umgebungsmerkmale gefunden", signale }
}

/**
 * Sieht diese Datenbank nach Produktion aus?
 *
 * Geprueft wird der Ort, nicht der Inhalt. Ein verwaltetes Ziel ist im
 * Zweifel echt; nur was nachweislich lokal liegt UND einen als Wegwerf
 * gekennzeichneten Namen traegt, gilt als unbedenklich.
 */
export function databaseKind(url) {
  if (!url || !String(url).trim()) return { kind: "missing", host: "—", db: "—" }
  let u
  try {
    u = new URL(url)
  } catch {
    return { kind: "unparsable", host: "—", db: "—" }
  }
  const host = u.hostname
  const db = u.pathname.replace(/^\//, "") || "—"
  const lokal = ["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(host)

  const verwaltet =
    /(^|\.)neon\.tech$|(^|\.)neon\.build$|\.vercel-storage\.com$|rds\.amazonaws\.com$|(^|\.)supabase\.co$|(^|\.)render\.com$/i.test(host)
  if (verwaltet) return { kind: "managed", host, db }
  if (!lokal) return { kind: "remote", host, db }

  const wegwerf = /^(g\d+_|probe|test|tmp|drill|cc_|abnahme)/i.test(db)
  return { kind: wegwerf ? "disposable" : "local", host, db }
}

const UEBERSCHREIBUNG = "ich-weiss-was-ich-tue"

/**
 * Der Torwaechter. Wirft, wenn ein Werkzeug an einem Ort laufen wuerde, an
 * dem es nicht laufen darf.
 */
export function requireSafeTarget(url, { zweck = "dieses Werkzeug", erlaubt = ["disposable", "local"] } = {}) {
  const env = environmentKind()
  const db = databaseKind(url)

  const grund = []

  /*
   * Die Art der DATENBANK entscheidet zuerst, nicht die Umgebung.
   *
   * Eine Wegwerf-Datenbank auf localhost kann keine echten Daten enthalten —
   * dort ist selbst ein Lauf mit NODE_ENV=production harmlos. Wuerde die
   * Umgebungspruefung auch diesen Fall sperren, waere das Werkzeug in einer
   * gewoehnlichen Kommandozeile unbenutzbar, und der erste Griff waere die
   * Ueberschreibung. Ein Schutz, den man taeglich umgeht, schuetzt nichts.
   *
   * Umgekehrt gilt die Umgebungspruefung mit voller Haerte, sobald das Ziel
   * ueberhaupt echt sein KOENNTE — verwaltet, fremd, fehlend, unlesbar.
   */
  if (!erlaubt.includes(db.kind)) grund.push(`Datenbank-Art "${db.kind}" ist fuer ${zweck} nicht freigegeben`)

  const zielKoennteEchtSein = db.kind !== "disposable"
  if (zielKoennteEchtSein) {
    if (env.kind === "production") grund.push(`Umgebung sieht nach Produktion aus (${env.why})`)
    if (env.kind === "unknown") grund.push(`Umgebung unbestimmt (${env.why}) und Ziel nicht als Wegwerf erkennbar`)
  }

  if (grund.length === 0) return { ok: true, env, db }

  if (process.env.CREADIG_ALLOW_UNSAFE_DB === UEBERSCHREIBUNG) {
    console.warn(`[schutz] UEBERSCHRIEBEN — ${zweck} laeuft trotz: ${grund.join(" · ")}`)
    console.warn(`[schutz] Ziel: ${db.host}/${db.db} · Umgebung: ${env.kind}`)
    return { ok: true, env, db, ueberschrieben: true }
  }

  const fehler = new Error(
    `\nABGEBROCHEN — ${zweck} darf hier nicht laufen.\n\n` +
      grund.map((g) => `  · ${g}`).join("\n") +
      `\n\n  Ziel:     ${db.host}/${db.db}\n` +
      `  Umgebung: ${env.kind} (${env.why})\n` +
      `  Merkmale: ${env.signale.length ? env.signale.join(", ") : "keine"}\n\n` +
      `  Erlaubt: ${erlaubt.join(", ")}. Eine Wegwerf-Datenbank erkennt der\n` +
      `  Schutz am Namen: g1_…, probe…, test…, tmp…, drill…, cc_…, abnahme…\n` +
      `  auf localhost.\n\n` +
      `  Eine bewusste Ausnahme ist keine Einstellung:\n` +
      `      CREADIG_ALLOW_UNSAFE_DB=${UEBERSCHREIBUNG}\n`,
  )
  fehler.creadigGuard = true
  throw fehler
}
