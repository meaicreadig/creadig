import type { ReactNode } from "react"
import { AdminLogout } from "@/components/admin/admin-logout"
import { AdminNav, type NavItem } from "@/components/admin/admin-nav"

/**
 * MP-G · G.1 — die Hülle des Control Centers.
 *
 * ---------------------------------------------------------------------------
 * KEIN THEATER — DIE NAVIGATION WÄCHST MIT DEN QUELLEN
 * MP-G §5 verbietet „zehn Coming-Soon-Menüpunkte". Der v0-Prototyp führt
 * neun weitere Punkte unter einer Überschrift „Geplant"; genau die sind
 * gestrichen. Ein Menüpunkt entsteht hier, wenn seine Datenquelle entsteht.
 *
 * Heute sind das zwei feste Punkte und ein bedingter:
 *
 *   Heute          zusammengefasste Aufmerksamkeit — Quelle: Materialstand
 *   Materialstand  die Punkte selbst — Quelle: collect()
 *   Vertrieb       NUR wenn ein Lead-Speicher eingerichtet ist
 *
 * Der dritte prüft `leadStoreConfigured()` und nicht eine Absicht. Ohne
 * Speicher gibt es die Seite nicht zu sehen — und „Heute" erklärt an der
 * Stelle, warum. Sobald `LEAD_STORE` gesetzt ist, erscheint der Punkt von
 * selbst; niemand muss daran denken.
 *
 * ---------------------------------------------------------------------------
 * DICHTER ALS DIE WEBSITE, GLEICHE SPRACHE
 * Dieselben Token, dieselbe Kanten-Grammatik, dieselben Schriften — aber
 * engere Abstände und kleinere Typografie. Die öffentliche Seite muss
 * überzeugen; diese hier muss man den ganzen Tag benutzen können.
 */

/**
 * Was noch fehlt und warum, steht in `docs/control-center/current-state.md`:
 *   Marketing  braucht Lesezugriff auf die Messwerte (heute nur schreibend)
 *   Kunden     braucht ein Kundenmodell (G.5)
 */
/*
 * GATE 4 — die Huelle fragt den Speicher NICHT mehr selbst.
 *
 * Bis hierher rief `navItems()` `leadStoreConfigured()` auf. Das war
 * bequem und hat eine Falle gestellt: `lead-store` importiert `node:fs`
 * fuer den Entwicklungs-Adapter. Solange nur Server-Seiten die Huelle
 * benutzten, fiel das nicht auf — die erste Client-Komponente
 * (`app/(admin)/error.tsx`) hat den Build sofort gebrochen:
 * „Reading from node:path is not handled".
 *
 * Jetzt reicht der Aufrufer die Antwort herein. Die Huelle bleibt damit
 * frei von Server-Abhaengigkeiten und in beiden Welten benutzbar.
 */
/**
 * Die vier Bereiche — und warum es genau diese vier sind.
 *
 * Jeder steht fuer eine Frage, die der Eigentueber im Betrieb wirklich hat:
 *
 *   Heute     — Was braucht jetzt Aufmerksamkeit?
 *   Vertrieb  — Was ist gerade in Arbeit?
 *   Kunden    — Mit wem haben wir gearbeitet?
 *   System    — Was fehlt dem Haus, und was ist gestoert?
 *
 * Die Reihenfolge folgt der Haeufigkeit, nicht der Wichtigkeit: Heute wird
 * taeglich geoeffnet, System selten.
 *
 * WAS HIER BEWUSST NICHT STEHT
 * Marketing, Produkte und Projekte. Fuer alle drei gibt es heute keine
 * operative Quelle in diesem Haus — Analytics schreibt nur, Produktstand ist
 * Material, ein Projektmodell existiert nicht. Ein Menuepunkt, hinter dem
 * nichts Gemessenes liegt, ist eine Behauptung ueber die Firma. Die
 * Navigation waechst mit den Quellen, nicht mit den Absichten.
 *
 * ---------------------------------------------------------------------------
 * WARUM VERTRIEB UND KUNDEN TROTZDEM IMMER DASTEHEN
 *
 * Bis zum 09.09.2026 hingen sie an `salesAvailable`. Das klang nach
 * derselben Regel und war eine andere — und es fiel erst im Browser auf:
 *
 *   /admin            Heute | System
 *   /admin/cockpit    Heute | System
 *   /admin/vertrieb   Heute | Vertrieb | Kunden | System
 *   /admin/kunden     Heute | Vertrieb | Kunden | System
 *   /admin/material   Heute | System
 *
 * `/admin` und `/admin/material` reichten den GEMESSENEN Wert herein,
 * `vertrieb-shell` und `kunden-shell` ein hartes `salesAvailable`. Das Menue
 * aenderte damit beim Blaettern seine Form — und von „Heute", der Seite, die
 * taeglich zuerst geoeffnet wird, waren die beiden Hauptbereiche ueberhaupt
 * nicht erreichbar. Wer sie sehen wollte, musste die Adresse kennen.
 *
 * Der Denkfehler steckte in der Regel selbst. Sie verwechselt zwei Dinge,
 * die dieses Haus sonst ueberall auseinanderhaelt:
 *
 *   „Es gibt hier keinen Vertrieb"      — eine Aussage ueber die Firma
 *   „Der Speicher ist nicht erreichbar" — ein Zustand von jetzt
 *
 * Vertrieb und Kunden sind Bereiche dieses Hauses, ob die Datenbank gerade
 * antwortet oder nicht. Ob sie antwortet, ist ein Zustand der SEITE, und die
 * sagt ihn bereits selbst („Vertrieb braucht die Datenbank"). Marketing und
 * Projekte bleiben draussen — dahinter liegt keine Quelle, nicht bloss eine
 * unerreichbare.
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Heute", hint: "Was Aufmerksamkeit braucht" },
  { href: "/admin/vertrieb", label: "Vertrieb", hint: "Anfragen, Pipeline, Beziehungen" },
  { href: "/admin/kunden", label: "Kunden", hint: "Bestand, Standorte, Historie" },
  { href: "/admin/material", label: "System", hint: "Material, Betrieb, Entscheidungen" },
]

export function AdminShell({
  title,
  lead,
  meta,
  children,
}: {
  title: string
  lead?: string
  /** Kurze Angabe rechts im Kopf — etwa der Stand der Daten. */
  meta?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <a
        href="#arbeitsflaeche"
        className="sr-only focus:not-sr-only focus:bg-background focus:text-foreground focus:border-gold focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:border focus:px-5 focus:py-3 focus:text-sm"
      >
        Zur Arbeitsfläche springen
      </a>

      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
        {/* ── Navigation ── */}
        <nav
          aria-label="Control Center"
          className="border-line bg-surface flex flex-col gap-6 border-b px-6 py-5 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:px-5 lg:py-7"
        >
          <div>
            <p className="eyebrow text-gold-text">creaDIG</p>
            <p className="text-subhead mt-1 text-base">Control Center</p>
          </div>

          <AdminNav items={NAV_ITEMS} />

          <div className="border-line mt-auto hidden border-t pt-5 lg:block">
            <AdminLogout />
          </div>
        </nav>

        {/* ── Arbeitsfläche ── */}
        <main id="arbeitsflaeche" tabIndex={-1} className="min-w-0 px-6 py-8 outline-none lg:px-10 lg:py-10">
          <header className="border-line flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b pb-6">
            <div className="min-w-0">
              <h1 className="type-h3">{title}</h1>
              {lead && (
                <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">{lead}</p>
              )}
            </div>
            {meta && <div className="text-meta text-muted-foreground shrink-0">{meta}</div>}
          </header>

          <div className="mt-8">{children}</div>

          <div className="border-line mt-12 border-t pt-6 lg:hidden">
            <AdminLogout />
          </div>
        </main>
      </div>
    </div>
  )
}
