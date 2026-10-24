import "server-only"

import { legeFreigabeAn } from "@/lib/assistent/store"
import { ladeLieferAufgaben, legeLieferplanAn, nachAngebotsAntwort, planAktualisieren } from "@/lib/ausfuehrung/lieferung-hat"
import { terminMitAenderungen, UEBERGABE_STUECKE, type Aenderung } from "@/lib/lieferung"
import { neonAbfrage, tabelleFehlt } from "@/lib/neon-abfrage"

/**
 * Projektleitung — der KI-Mitarbeiter des Projektmanagements.
 *
 * Läuft täglich und führt jeden gewonnenen Auftrag durch die vier Stufen
 * aus lib/lieferung.ts (aufgesetzt → läuft → abgenommen → übergeben):
 *   · gewonnen + angenommenes Angebot, aber kein Projekt → Projekt wird angelegt
 *   · gewonnen ohne angenommenes Angebot → Aufgabe "Angebot annehmen lassen"
 *   · aufgesetzt ohne Material → Material-Anforderung (Tag 1) + Erinnerung (Tag 7)
 *   · läuft → wöchentlicher Statusbericht an den Kunden, Endspurt-Warnung ≤ 7 Tage,
 *     Eskalation bei überschrittener Frist
 *   · abgenommen → Übergabe-Aufgabe mit den fehlenden Stücken
 *   · übergeben → nach 14 Tagen Zufriedenheits-Mail (Übergang an Kundenservice)
 * Katman 4: Online angenommene Finanz-Angebote werden vorher in `offers`
 * gespiegelt (lib/ausfuehrung/lieferung-hat.ts), jedes Projekt bekommt einen
 * Lieferplan (Aufgaben, Fristen, Subunternehmer), der Wochenbericht nennt die
 * echten Aufgaben.
 * Mails sind immer Freigaben (dein Klick sendet). Jeder Fall hat einen festen
 * Schlüssel, wird also nie doppelt vorgeschlagen.
 */

type Zeile = {
  projekt_id: string | null
  state: string | null
  material_received: string | null
  changes: Aenderung[] | null
  acceptance: unknown
  handover: Record<string, unknown> | null
  projekt_seit: string | null
  projekt_stand: string | null
  chance_id: string
  titel: string
  firma: string | null
  kontakt: string | null
  email: string | null
  angebot_id: string | null
  angebot_ref: string | null
}

const TAG = 86_400_000

function heute(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())
}

function tageSeit(iso: string | null): number {
  if (!iso) return 0
  return Math.floor((Date.parse(heute()) - Date.parse(iso.slice(0, 10))) / TAG)
}

function kalenderwoche(datum: string): string {
  const d = new Date(`${datum}T00:00:00Z`)
  const tag = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - tag)
  const jahr = d.getUTCFullYear()
  const kw = Math.ceil(((d.getTime() - Date.UTC(jahr, 0, 1)) / TAG + 1) / 7)
  return `${jahr}-${String(kw).padStart(2, "0")}`
}

function datumDe(iso: string): string {
  const [j, m, t] = iso.split("-")
  return `${t}.${m}.${j}`
}

function anrede(z: Zeile): string {
  return z.kontakt ? `Guten Tag ${z.kontakt},` : "Guten Tag,"
}

const GRUSS = "\n\nFreundliche Grüße\nMuhammed Emin Akyol\ncreaDIG Solutions"

function str(v: unknown): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}

export async function projektAgentLauf(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = neonAbfrage()
  if (!q) return { ergebnis: "Projekt-Speicher nicht verbunden", anzahl: 0 }

  /* Nachholen: angenommene Finanz-Angebote ohne Spiegel (z. B. vor Katman 4 angenommen). */
  const ohneSpiegel = (await q(
    `SELECT d.id FROM fin_dokumente d
      WHERE d.art = 'angebot' AND d.status = 'angenommen' AND d.opportunity_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM offers WHERE id = 'offer-fin-' || d.id)`,
    [],
  ).catch(() => [])) as { id: string }[]
  for (const d of ohneSpiegel) await nachAngebotsAntwort(d.id)

  let roh: Record<string, unknown>[]
  try {
    roh = await q(
      `SELECT p.id AS projekt_id, p.state, p.material_received, p.changes, p.acceptance, p.handover,
              p.created_at AS projekt_seit, p.updated_at AS projekt_stand,
              o.id AS chance_id, o.title AS titel, org.name AS firma,
              c.name AS kontakt, c.email,
              COALESCE(p.offer_id, acc.id) AS angebot_id, COALESCE(po.reference, acc.reference) AS angebot_ref
         FROM opportunities o
         LEFT JOIN organisations org ON org.id = o.organisation_id
         LEFT JOIN contacts c ON c.id = o.contact_id
         LEFT JOIN projects p ON p.opportunity_id = o.id
         LEFT JOIN offers po ON po.id = p.offer_id
         LEFT JOIN LATERAL (
           SELECT id, reference FROM offers
            WHERE opportunity_id = o.id AND state = 'angenommen'
            ORDER BY updated_at DESC LIMIT 1
         ) acc ON true
        WHERE o.status = 'won' OR p.id IS NOT NULL`,
      [],
    )
  } catch (e) {
    if (tabelleFehlt(e, "projects") || tabelleFehlt(e, "offers")) return { ergebnis: "Projekt-Tabellen noch nicht angelegt", anzahl: 0 }
    throw e
  }

  const zeilen: Zeile[] = roh.map((r) => ({
    projekt_id: str(r.projekt_id),
    state: str(r.state),
    material_received: str(r.material_received),
    changes: (r.changes as Aenderung[] | null) ?? [],
    acceptance: r.acceptance,
    handover: (r.handover as Record<string, unknown> | null) ?? {},
    projekt_seit: str(r.projekt_seit),
    projekt_stand: str(r.projekt_stand),
    chance_id: String(r.chance_id),
    titel: String(r.titel ?? "Auftrag"),
    firma: str(r.firma),
    kontakt: str(r.kontakt),
    email: str(r.email),
    angebot_id: str(r.angebot_id),
    angebot_ref: str(r.angebot_ref),
  }))

  const tag = heute()
  const zaehler = { angelegt: 0, vorschlaege: 0, laufend: 0, kritisch: 0 }
  const vorschlag = async (f: Parameters<typeof legeFreigabeAn>[0]) => {
    const id = await legeFreigabeAn({ ...f, agent: "projekte" }).catch(() => null)
    if (id) zaehler.vorschlaege++
  }

  for (const z of zeilen) {
    const name = z.firma ?? z.titel
    const link = `/admin/vertrieb/pipeline/${z.chance_id}`

    if (!z.projekt_id) {
      if (z.angebot_id) {
        const neu = await q(
          `INSERT INTO projects (id, opportunity_id, offer_id, created_at, updated_at)
           VALUES ($1, $2, $3, now(), now()) ON CONFLICT DO NOTHING RETURNING id`,
          [`prj-${crypto.randomUUID().slice(0, 8)}`, z.chance_id, z.angebot_id],
        )
        if (neu.length) {
          zaehler.angelegt++
          z.projekt_id = String(neu[0].id)
          z.state = "aufgesetzt"
          z.projekt_seit = tag
        }
      } else {
        await vorschlag({
          art: "aufgabe",
          titel: `Projekt kann nicht starten: ${name}`,
          inhalt: [
            `Die Chance „${z.titel}" ist gewonnen, aber es gibt kein angenommenes Angebot.`,
            "Ohne angenommenes Angebot ist der Umfang nicht festgelegt — das Projekt wird nicht aufgesetzt.",
            "",
            `Nächster Schritt: Angebot annehmen lassen oder als angenommen markieren: ${link}`,
          ].join("\n"),
          quelle: `projekt:${z.chance_id}:ohne-angebot`,
        })
        continue
      }
    }

    const pid = z.projekt_id!
    await legeLieferplanAn(pid).catch((e) => console.error("[projekte] lieferplan", e instanceof Error ? e.message : e))

    if (z.state === "aufgesetzt") {
      zaehler.laufend++
      const alter = tageSeit(z.projekt_seit)
      const stufe = alter >= 7 ? 2 : 1
      if (z.email) {
        await vorschlag({
          art: "mail",
          titel: `${stufe === 1 ? "Material anfordern" : "Material erinnern"}: ${name}`,
          empfaenger: z.email,
          betreff: stufe === 1 ? `Projektstart ${z.titel}: was wir von Ihnen brauchen` : `Kurze Erinnerung: Material für ${z.titel}`,
          inhalt: [
            anrede(z),
            "",
            stufe === 1
              ? `vielen Dank für Ihren Auftrag${z.angebot_ref ? ` (Angebot ${z.angebot_ref})` : ""}. Damit wir starten können, brauchen wir von Ihnen:`
              : "wir stehen bereit, können aber erst beginnen, wenn das Material da ist. Es fehlt noch:",
            "",
            "• Texte und Inhalte (gern als Stichpunkte)",
            "• Logo und Bilder",
            "• Zugänge (Domain, bestehende Systeme)",
            "",
            "Mit dem Eingang des Materials beginnt unsere feste Frist: vier Wochen bis zum Livegang.",
          ].join("\n") + GRUSS + `\n---\nProjekt ${pid} · Stufe aufgesetzt seit ${alter} Tag(en).`,
          quelle: `projekt:${pid}:material:${stufe}`,
        })
      } else {
        await vorschlag({
          art: "aufgabe",
          titel: `Ansprechpartner fehlt: ${name}`,
          inhalt: `Projekt ${pid} wartet auf Material, aber am Auftrag hängt kein Kontakt mit E-Mail.\nBitte Kontakt ergänzen: ${link}`,
          quelle: `projekt:${pid}:ohne-kontakt`,
        })
      }
      continue
    }

    if (z.state === "laeuft") {
      zaehler.laufend++
      const termin = terminMitAenderungen(z.material_received, z.changes ?? [])
      const rest = termin ? -tageSeit(termin) : null
      if (rest !== null && rest < 0) {
        zaehler.kritisch++
        await vorschlag({
          art: "aufgabe",
          titel: `Frist überschritten: ${name} (${-rest} Tag(e))`,
          inhalt: [
            `Zugesagter Livetermin war der ${datumDe(termin!)}. Das Projekt ist noch nicht abgenommen.`,
            "Jetzt: Kunde informieren, Restumfang klären, neue Zusage nur mit bestätigter Änderung.",
            `Projekt öffnen: ${link}`,
          ].join("\n"),
          quelle: `projekt:${pid}:ueberfaellig`,
        })
      } else if (rest !== null && rest <= 7) {
        zaehler.kritisch++
        await vorschlag({
          art: "aufgabe",
          titel: `Endspurt: ${name} geht am ${datumDe(termin!)} live`,
          inhalt: `Noch ${rest} Tag(e). Abnahme-Termin mit dem Kunden festlegen und Übergabe vorbereiten.\n${link}`,
          quelle: `projekt:${pid}:endspurt`,
        })
      }
      if (z.email && termin && tageSeit(z.material_received) >= 5) {
        const plan = await ladeLieferAufgaben(pid)
        const fertig = plan.filter((a) => a.status === "erledigt")
        const woche = plan.filter((a) => a.status === "offen" && a.faellig && tageSeit(a.faellig) >= -7)
        const verzug = woche.filter((a) => tageSeit(a.faellig!) > 0)
        await vorschlag({
          art: "mail",
          titel: `Wochenbericht an ${name}`,
          empfaenger: z.email,
          betreff: `Projektstand ${z.titel} · KW ${kalenderwoche(tag).split("-")[1]}`,
          inhalt: [
            anrede(z),
            "",
            `kurz zum Stand Ihres Projekts: ${verzug.length ? "Wir arbeiten an einzelnen Punkten nach" : "Wir liegen im Plan"}, der Livegang ist für den ${datumDe(termin)} vorgesehen.`,
            "",
            ...(fertig.length ? ["Erledigt:", ...fertig.slice(-5).map((a) => `• ${a.titel}`), ""] : []),
            woche.length ? ["Diese Woche:", ...woche.map((a) => `• ${a.titel}`)].join("\n") : "Diese Woche: Umsetzung der vereinbarten Bereiche.",
            "Von Ihnen brauchen wir: aktuell nichts — wir melden uns, sobald die Vorschau zur Prüfung bereitsteht.",
            "",
            "Wenn sich bei Ihnen etwas geändert hat, antworten Sie einfach auf diese Mail.",
          ].join("\n") + GRUSS + `\n---\nVor dem Senden prüfen: stimmt der Stand? Noch ${rest ?? "?"} Tag(e) bis zur Frist · Lieferplan ${fertig.length}/${plan.length} erledigt${verzug.length ? ` · ${verzug.length} überfällig` : ""}.`,
          quelle: `projekt:${pid}:status:${kalenderwoche(tag)}`,
        })
      }
      continue
    }

    if (z.state === "abgenommen") {
      zaehler.laufend++
      const fehlt = UEBERGABE_STUECKE.filter((s) => !z.handover?.[s.key]).map((s) => s.label)
      await vorschlag({
        art: "aufgabe",
        titel: `Übergabe abschließen: ${name}`,
        inhalt: [
          "Der Kunde hat abgenommen. Jetzt gehört ihm alles — so steht es auf der Webseite.",
          fehlt.length ? `Noch zu übergeben: ${fehlt.join(", ")}.` : "Alle Stücke sind erfasst — Übergabe nur noch bestätigen.",
          "Danach die Schlussrechnung (50 %) in creaDIG Finanz prüfen.",
          link,
        ].join("\n"),
        quelle: `projekt:${pid}:uebergabe`,
      })
      continue
    }

    if (z.state === "uebergeben" && z.email && tageSeit(z.projekt_stand) >= 14 && tageSeit(z.projekt_stand) <= 60) {
      await vorschlag({
        art: "mail",
        titel: `Nachsorge: ${name} (14 Tage nach Übergabe)`,
        empfaenger: z.email,
        betreff: `Läuft alles rund mit ${z.titel}?`,
        inhalt: [
          anrede(z),
          "",
          "seit der Übergabe sind zwei Wochen vergangen. Läuft alles so, wie Sie es sich vorgestellt haben?",
          "Falls etwas hakt oder eine Idee dazugekommen ist, antworten Sie einfach kurz.",
          "",
          "Und wenn Sie zufrieden sind: Eine kurze Empfehlung an jemanden, dem das auch helfen würde, freut uns sehr.",
        ].join("\n") + GRUSS,
        quelle: `projekt:${pid}:nachsorge`,
      })
    }
  }

  const plan = await planAktualisieren().catch(() => ({ datiert: 0, subKarten: 0 }))
  const teile = [
    plan.datiert ? `${plan.datiert} Aufgabe(n) terminiert` : null,
    plan.subKarten ? `${plan.subKarten} Sub-Auftrag/Aufträge zur Freigabe` : null,
    zaehler.laufend ? `${zaehler.laufend} Projekt(e) in Arbeit` : null,
    zaehler.angelegt ? `${zaehler.angelegt} neu aufgesetzt` : null,
    zaehler.kritisch ? `${zaehler.kritisch} mit Frist-Druck` : null,
    zaehler.vorschlaege ? `${zaehler.vorschlaege} Vorschlag/Vorschläge zur Freigabe` : null,
  ].filter(Boolean)
  return {
    ergebnis: teile.length ? teile.join(" · ") : zeilen.length ? "Alle Projekte im Plan" : "Kein gewonnener Auftrag in Lieferung",
    anzahl: zaehler.angelegt + zaehler.vorschlaege,
  }
}
