import { collect } from "@/lib/material-status"
import type { VertriebStore } from "@/lib/vertrieb"

/**
 * Was heute Aufmerksamkeit braucht — aus allen Quellen, die es wirklich gibt.
 *
 * ===========================================================================
 * WARUM ES DIESE DATEI GIBT
 * Die Fähigkeit fehlte nie. `VertriebSummary` rechnet seit Vertrieb 1.0 die
 * sieben Kennzahlen, die Anfrage-Inbox kennt ihre neuen Eingänge, und der
 * Materialstand weiss, welche Betriebspunkte offen sind und welche
 * Entscheidungen beim Eigentümer liegen.
 *
 * Was fehlte, war die VERBINDUNG. „Heute" war eine synchrone Komponente — sie
 * konnte gar nichts abfragen, was eine Datenbank braucht. Übrig blieb, was
 * ohne Warten zu haben war: Materialzahlen und ein Satz darüber, dass ein
 * Lead-Speicher eingerichtet sei.
 *
 * „Ein Lead-Speicher ist eingerichtet" ist eine Aussage über den Bauzustand
 * der Software. Wer ein Unternehmen führt, braucht eine Aussage über das
 * Unternehmen.
 *
 * ---------------------------------------------------------------------------
 * KEINE NEUE DOMÄNE
 * Hier entsteht kein zweites Modell und keine einzige neue Tabelle. Diese
 * Datei liest ausschliesslich, was schon existiert, und ordnet es. Jede Zeile
 * hat einen Datensatz dahinter, zu dem man springen kann — eine Übersicht,
 * aus der man nicht herauskommt, ist ein Poster.
 */

/* ========================================================================== *
 * DIE RANGFOLGE
 * ========================================================================== */

/**
 * Acht Ränge, begründet — nicht acht Zahlen, die gut aussehen.
 *
 * (Bis 03.09.2026 waren es sieben; der achte, „Schritt ohne Termin", kam
 * dazu, weil genau diese Vorgänge vorher aus jeder Ansicht fielen.)
 *
 * Die Reihenfolge folgt dem Schaden, den Nichtstun anrichtet:
 *
 *   Ein Betriebsblocker kostet ALLE künftigen Anfragen — der Weg selbst ist
 *   gestört. Deshalb ganz oben, auch wenn er selten auftritt.
 *
 *   Überfällig kostet Vertrauen, das schon zugesagt war. Heute fällig kostet
 *   es erst, wenn der Tag vorbei ist.
 *
 *   Eine neue Anfrage ist der teuerste verpassbare Moment: Wer schreibt,
 *   wartet gerade — und fragt sonst woanders.
 *
 *   Eine offene Chance ohne nächsten Schritt verfällt lautlos. Sie steht
 *   unter der neuen Anfrage, weil dort niemand aktiv wartet.
 *
 *   Beziehungspflege und Eigentümer-Entscheidungen haben keinen Termin, den
 *   jemand von aussen setzt. Sie gehören auf die Liste, aber nach unten.
 */
export const ATTENTION_RANKS = [
  "betriebsblocker",
  "ueberfaellig",
  "heute-faellig",
  "neue-anfrage",
  "schritt-ohne-termin",
  "ohne-schritt",
  "beziehung-faellig",
  "entscheidung",
] as const

export type AttentionRank = (typeof ATTENTION_RANKS)[number]

export const ATTENTION_LABELS: Record<AttentionRank, string> = {
  betriebsblocker: "Betrieb gestört",
  ueberfaellig: "Überfällig",
  "heute-faellig": "Heute fällig",
  "neue-anfrage": "Neue Anfrage",
  "schritt-ohne-termin": "Schritt ohne Termin",
  "ohne-schritt": "Ohne nächsten Schritt",
  "beziehung-faellig": "Kontaktpflege fällig",
  entscheidung: "Ihre Entscheidung",
}

export type AttentionItem = {
  /** Stabil je Datensatz — die Grundlage der Dublettensperre. */
  id: string
  rank: AttentionRank
  title: string
  detail: string | null
  /** Wohin der Klick führt. Auf den Datensatz, nicht auf eine Liste. */
  href: string
  /** Fälligkeit als ISO-Datum, wenn es eine gibt. Nie geschätzt. */
  due: string | null
}

export type AttentionBoard = {
  items: AttentionItem[]
  counts: Record<AttentionRank, number>
  /**
   * Ob der Vertriebsteil gemessen werden konnte. `false` heisst NICHT
   * „nichts los" — es heisst „nicht gemessen", und die Oberfläche sagt das.
   */
  salesMeasured: boolean
  /** Material ausserhalb von Betrieb und Entscheidungen — als Zahl. */
  materialRest: number
  materialOpen: number
  materialDone: number
}

/**
 * Aus dem Owner-Satz eines Materialpunkts die HANDLUNG machen.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHT `detail`
 * `detail` beschreibt den ZUSTAND, und es tut das gruendlich — beim Punkt
 * „Domain gesetzt" stehen dort drei Zeilen ueber kanonische Adressen, Sitemap
 * und OG-Bilder. Das ist im Materialstand richtig und auf einer Liste, die man
 * ueberfliegt, falsch: Wer morgens „Heute" oeffnet, will wissen, was zu tun
 * ist, nicht was der Code sonst noch damit macht.
 *
 * `owner` sagt genau das, und zwar bereits gepflegt: „Domain in Vercel
 * verbinden und den Wert setzen". Die Beschreibung bleibt einen Klick
 * entfernt im Materialstand stehen — sie geht nicht verloren, sie steht nur
 * nicht mehr im Weg.
 *
 * ---------------------------------------------------------------------------
 * WARUM DAS PRAEFIX WEG MUSS
 * Jeder Owner-Satz beginnt mit „Owner: ". Im Materialstand trennt das den
 * Zustand von der Zustaendigkeit. Hier ist ohnehin alles Owner-Sache — das
 * Wort waere auf jeder zweiten Zeile dasselbe und traegt nichts.
 */
function ownerAction(owner: string): string | null {
  const text = owner.replace(/^\s*Owner:\s*/, "").trim()
  return text.length > 0 ? text : null
}

/* ========================================================================== *
 * DIE ERHEBUNG
 * ========================================================================== */

/**
 * Alles zusammentragen.
 *
 * ---------------------------------------------------------------------------
 * WARUM DER VERTRIEBSTEIL IN EINEM `try` STEHT
 * Der Materialstand braucht keine Datenbank, der Vertrieb schon. Fällt sie
 * aus, soll die Seite trotzdem sagen, was sie weiss — und beim Rest ehrlich
 * „nicht gemessen" melden statt einer Null. Eine Null ist eine Messung; hier
 * läge keine vor.
 *
 * ---------------------------------------------------------------------------
 * WARUM NICHTS DOPPELT VORKOMMEN KANN
 * Jeder Vorgang wird GENAU EINMAL eingeordnet, an seinem eigenen Zustand:
 * Ein Vorgang ohne nächsten Schritt hat kein Datum und kann deshalb nicht
 * überfällig sein; einer mit Datum hat einen Schritt. Die Fälle schliessen
 * sich gegenseitig aus, und `id` fängt ab, was trotzdem zweimal käme.
 */
export async function collectAttention(store: VertriebStore | null): Promise<AttentionBoard> {
  const { open, done } = collect()
  const items: AttentionItem[] = []

  /* ── 1 · Betrieb ────────────────────────────────────────────────────────
     Der Materialstand erhebt diese Punkte bereits gegen die Wirklichkeit
     (gesetzte Umgebung, erreichbare Dienste). Sie hier erneut zu messen wäre
     eine zweite Wahrheit über denselben Zustand. */
  for (const item of open.filter((i) => i.group === "betrieb")) {
    items.push({
      id: `betrieb:${item.label}`,
      rank: "betriebsblocker",
      title: item.label,
      detail: ownerAction(item.owner),
      href: "/admin/material",
      due: null,
    })
  }

  let salesMeasured = false

  if (store) {
    try {
      const [summary, neue, pflege] = await Promise.all([
        store.summary(),
        store.listEnquiries({ handling: "neu", limit: 12 }),
        store.listContacts({ bucket: "pflege-faellig", limit: 12 }),
      ])
      salesMeasured = true

      const today = new Date().toISOString().slice(0, 10)

      /* ── 2/3/5 · Vorgänge ───────────────────────────────────────────────
         `summary().attention` liefert die Vorgänge, die einen Schritt
         schulden. Eingeteilt wird hier am Zustand des einzelnen Vorgangs,
         nicht an seiner Position in der Liste. */
      for (const o of summary.attention) {
        /* Ein Vorgang mit Schritt und Datum in der Zukunft schuldet heute
           nichts — er gehört auf keine Aufmerksamkeitsliste. */
        if (o.nextAction !== null && o.nextActionAt !== null && o.nextActionAt > today) continue

        /*
         * Vier Zustaende, nicht drei — und der vierte ist der, der lange
         * fehlte: Ein Vorgang KANN einen Schritt haben, ohne einen Termin
         * dafuer zu haben. Ihn zu „Ohne naechsten Schritt" zu zaehlen waere
         * falsch (er hat einen), ihn wegzulassen war schlimmer (er
         * verschwand). Er steht deshalb unter eigenem Namen, direkt vor den
         * Vorgaengen, die gar keinen Schritt haben.
         */
        const rank: AttentionRank =
          o.nextAction === null
            ? "ohne-schritt"
            : o.nextActionAt === null
              ? "schritt-ohne-termin"
              : o.nextActionAt < today
                ? "ueberfaellig"
                : "heute-faellig"

        const kontext = [o.organisationName, o.contactName].filter(Boolean).join(" · ")

        items.push({
          id: `opportunity:${o.id}`,
          rank,
          title: o.title,
          detail: o.nextAction ?? (kontext || null),
          href: `/admin/vertrieb/pipeline/${o.id}`,
          due: o.nextActionAt,
        })
      }

      /* ── 4 · Neue Anfragen ─────────────────────────────────────────────── */
      for (const e of neue.rows) {
        items.push({
          id: `lead:${e.id}`,
          rank: "neue-anfrage",
          title: e.organisationName ?? e.business ?? e.name,
          detail: `Über ${e.source} · ${e.reference}`,
          href: `/admin/vertrieb/anfragen/${e.id}`,
          due: null,
        })
      }

      /* ── 6 · Beziehungspflege ──────────────────────────────────────────── */
      for (const c of pflege.rows) {
        items.push({
          id: `contact:${c.id}`,
          rank: "beziehung-faellig",
          title: c.name,
          detail: c.nextTouch,
          href: `/admin/vertrieb/beziehungen/${c.id}`,
          due: c.nextTouchAt,
        })
      }
    } catch {
      /* `salesMeasured` bleibt false. Die Oberfläche sagt das ausdrücklich —
         sie zeigt keine leere Pipeline, denn das wäre eine Aussage über das
         Geschäft statt über die Technik. */
      salesMeasured = false
    }
  }

  /* ── 7 · Entscheidungen des Eigentümers ─────────────────────────────────
     Sie stehen im Materialstand, weil sie Arbeit genauso zuverlässig
     blockieren wie ein fehlendes Bild — nur fällt eine offene Entscheidung
     niemandem auf, weil sie nirgends als Lücke sichtbar wird. Genau deshalb
     gehört sie hierher. */
  for (const item of open.filter((i) => i.group === "entscheidungen")) {
    items.push({
      id: `entscheidung:${item.label}`,
      rank: "entscheidung",
      title: item.label,
      detail: ownerAction(item.owner),
      href: "/admin/material",
      due: null,
    })
  }

  /* Das übrige Material erscheint NICHT Punkt für Punkt. Es sind Dutzende,
     und sie würden alles darüber erdrücken. Es erscheint als Zahl mit einem
     Weg dorthin; gearbeitet wird im Materialstand. */
  const materialRest = open.filter(
    (i) => i.group !== "betrieb" && i.group !== "entscheidungen",
  ).length

  const seen = new Set<string>()
  const sorted = items
    .filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)))
    .sort((a, b) => {
      const rang = ATTENTION_RANKS.indexOf(a.rank) - ATTENTION_RANKS.indexOf(b.rank)
      if (rang !== 0) return rang
      /* Innerhalb eines Rangs: das älteste Versprechen zuerst. */
      if (a.due && b.due) return a.due.localeCompare(b.due)
      if (a.due) return -1
      if (b.due) return 1
      return a.title.localeCompare(b.title, "de")
    })

  const counts = Object.fromEntries(
    ATTENTION_RANKS.map((rank) => [rank, sorted.filter((i) => i.rank === rank).length]),
  ) as Record<AttentionRank, number>

  return {
    items: sorted,
    counts,
    salesMeasured,
    materialRest,
    materialOpen: open.length,
    materialDone: done.length,
  }
}
