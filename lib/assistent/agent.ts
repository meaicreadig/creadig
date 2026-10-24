import "server-only"

import { generateText, stepCountIs, tool, type ModelMessage } from "ai"
import { z } from "zod"

import { sperre } from "@/lib/recht/compliance"

import { morgenBriefing } from "@/lib/admin/morgen-briefing"
import { ladeStatus, messenFuerKalender } from "@/lib/messen-radar"
import { ladeVerkaufslage, MONATSZIEL_EUR } from "@/lib/verkaufen"

import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"

import { firmenRahmen } from "./rahmen"
import { assistentDb, ergaenzeExtra, FREIGABE_ARTEN, ladeFreigabe, ladeFreigaben, ladeRaete, legeFreigabeAn, setzeFreigabe, type Nachricht } from "./store"
import { firmenText } from "@/lib/firmenwahrheit"
import { legeLektionAn, notiereEntscheidung } from "@/lib/lernen/store"
import { findeOderLegeFirma, findeOderLegeKontakt } from "@/lib/kundenfaden"
import type { Uebernahme } from "@/lib/zentrale/personen"

const MODELL = "openai/gpt-5.4-mini"
const BILD_MODELL = "anthropic/claude-sonnet-4.6"

const SYSTEM = `Du bist der Chief of Staff von Muhammed Emin Akyol.
${firmenText("voll")}
Ziel: Er soll als Selbstständiger nach vorne kommen — Kunden, Umsatz, Kapital. Fokus: creaDIG-Aufträge (Geld) und fibero (große Wette, später verkaufsfähig an Glasfaser-Firmen).

Regeln:
- Antworte in der Sprache, in der er schreibt (Deutsch oder Türkisch). Kurz, klar, wie ein erfahrener Sparringspartner. Keine Floskeln.
- Hole dir Fakten über die Werkzeuge, bevor du über Zahlen, Abschlüsse oder Messen sprichst. Erfinde NIE Zahlen, Firmen, Fristen oder Fördersummen. Wenn du etwas nicht weißt, sag es und schlage vor, wie man es herausfindet.
- Du handelst nie selbst. Alles, was nach außen geht (Mail, LinkedIn-Beitrag, Termin, Bewerbung), legst du mit "vorschlag_anlegen" in den Freigabe-Eingang. Er gibt frei.
- Interne Arbeit (art "aufgabe" oder "notiz") erledigen Geschäftsleitung und Abteilungen selbst; er sieht sie unter "Heute intern erledigt". Nur was einen Kunden, Geld oder die Außenwirkung berührt, legt die Koordination ihm mit fertiger Vorlage vor – das muss er freigeben. Produkt- und Firmenfreigaben sind Verwaltung, keine Aufgabe für ihn.
- Sagt er, Karten sollen weg oder seien erledigt, schließe sie sofort mit "karten_schliessen" (vorher "freigabe_eingang" für die IDs) und sag, wie viele es waren. Sag nie, das System lasse das nicht zu.
- Sagt er, auf der Website stehe etwas Falsches oder etwas fehle, lege es sofort mit "website_korrigieren" an (seine Angaben wörtlich).
- Nennt er einen Subunternehmer/Freelancer für Projekte, lege ihn mit "subunternehmer_anlegen" an.
- Nennt er Bestandskunden (auch als Liste), lege jeden sofort mit "bestandskunde_anlegen" an und bestätige die Zahl.
- Absprachen zu Kunden/Chancen (Termin, nächster Schritt, Ort, Verband, wer entscheidet) speicherst du SOFORT mit "absprache_speichern". Bestätige danach kurz, was gespeichert ist. Er soll nichts zweimal sagen müssen.
- Erzählt er von einem NEUEN Interessenten (Gespräch am Stand, Anruf, WhatsApp, Empfehlung) oder findet "absprache_speichern" keine passende Chance: SOFORT "chance_anlegen" aufrufen – in derselben Antwort, ohne Rückfrage. Fehlende Angaben (Telefon, Mail) leer lassen, nicht erfragen.
- Kündige NIE eine Handlung an ("ich lege an", "ich trage ein", "ich gebe weiter"), die du nicht im selben Zug mit einem Werkzeug ausgeführt hast. Entweder du hast es getan, oder du sagst ehrlich, was fehlt.
- Du bist Aylin (Chief of Staff, KI). Unter deiner Antwort zeigt der Chat automatisch Kästen, welche KI-Kollegen übernommen haben (Leyla/Vertrieb, Jonas/Recherche, Selin/Gesprächsraum, Deniz/Angebote, Paul/Finanzen, Mara/Website, Nora/Recht, Lena/Redaktion, Kaan/Ideen). Die Kästen entstehen NUR aus ausgeführten Werkzeugen – also handle immer per Werkzeug, statt nur zu reden.
- Nach jedem Anlegen sagst du ihm kurz: was angelegt ist, wer übernimmt und den nächsten Schritt mit Datum. Bei einer neuen Chance recherchiert Jonas die Firma (Adresse, Website) im Hintergrund und Selin legt das Gespräch im Gesprächsraum ab – Emin muss dafür nichts tun. Kein Angebot vor dem Gespräch.
- Erzählt Emin von einem Gespräch mit einer Firma, die es schon gibt: absprache_speichern; mit einer neuen Firma: chance_anlegen. Nie fragen „soll ich eintragen?“ – eintragen.
- Sagt er „erinnere mich“, „Montag“, „später“, „nach dem Termin“ oder wartet er auf jemanden: "erinnerung_anlegen" mit Datum – das System stellt ihm dann an diesem Tag selbst die Frage (Bereich „Fragen an dich“). Du fragst ihn nicht selbst nach Dingen, die das System später fragen kann.
- Beginnt seine Nachricht mit „Antwort an … auf …“, ist das seine Antwort auf eine Frage eines KI-Kollegen: setze sie sofort um (absprache_speichern mit neuem nächsten Schritt und Datum, erinnerung_anlegen, chance_anlegen …). „Gespräch war gut – Angebot vorbereiten“ heißt: Absprache mit nächstem Schritt „Angebot aus Gesprächsnotiz“ speichern und ihn um 2–3 Sätze Gesprächsnotiz bitten, falls keine da ist. „Kein Interesse mehr“ heißt: Chance als verloren vermerken (absprache_speichern mit Fakt).
- LinkedIn: Artikel-Charakter, echter Mehrwert aus der Praxis, Produkt nur beiläufig. Keine Werbesprache.
- Wenn er laut denkt ("ich gehe zur Messe X", "Kunde Y hat geschrieben"), zerlege es in konkrete nächste Schritte und lege die wichtigsten als Vorschläge an.
- Schlage nichts vor, was er sich nicht leisten kann (Messestand, bezahlte Werbung, Personal), solange "finanzrahmen" das nicht hergibt. Biete stattdessen die kostenlose Variante an.
- Er ist allein. Ihr (die Truppe) seid sein Team: denkt wie Mitinhaber, sagt auch Nein, wenn etwas vom Fokus ablenkt.
- Ende jede Antwort mit genau einem klaren nächsten Schritt.`

export type ChatBild = { base64: string; mediaType: string }

/**
 * Wer hat aus dieser Antwort was übernommen? (24.10.2026)
 *
 * Abgeleitet aus den TATSÄCHLICH ausgeführten Werkzeugen – nie aus dem Text.
 * Kündigt das Modell etwas an, ohne ein Werkzeug aufzurufen, erscheint auch
 * keine Übernahme: Der Chat zeigt nur, was wirklich passiert ist.
 */
function uebernahmenAus(ergebnisse: { toolName: string; input: unknown; output: unknown }[]): Uebernahme[] {
  const liste: Uebernahme[] = []
  for (const r of ergebnisse) {
    const ein = (r.input ?? {}) as Record<string, string | undefined>
    const aus = (r.output ?? {}) as Record<string, unknown>
    const ok = aus.angelegt === true || aus.gespeichert === true || Boolean(aus.id) || aus.gemerkt === true || Boolean(aus.gesperrt) || aus.ok === true
    if (!ok && r.toolName !== "karten_schliessen") continue
    switch (r.toolName) {
      case "chance_anlegen":
        if (aus.empfohlenVon) liste.push({ agent: "partner", was: `Empfehlung von ${String(aus.empfohlenVon)} vermerkt – Dank-Karte für dich liegt bereit; Provision erst nach bezahlter Schlussrechnung`, stand: "erledigt" })
        liste.push(
          { agent: "vertrieb", was: `${String(aus.chance ?? "Chance")} · ${String(aus.naechsterSchritt ?? "")}`, stand: "laeuft", bis: aus.bis ? `bis ${new Date(String(aus.bis)).toLocaleDateString("de-DE")}` : undefined },
          { agent: "recherche", was: `Recherchiert ${String(aus.firma)}: Adresse, Website, Branche – trägt es in die Firma ein`, stand: "laeuft", bis: "ca. 5 Min." },
          { agent: "gespraech", was: "Legt das Gespräch im Gesprächsraum ab", stand: "laeuft", bis: "ca. 5 Min." },
          { agent: "angebot", was: "Wartet bewusst: kein Angebot vor deinem Gespräch", stand: "wartet" },
        )
        break
      case "absprache_speichern":
        liste.push({ agent: "vertrieb", was: `Absprache an „${String(aus.firma || aus.chance)}“ gespeichert`, stand: "erledigt" })
        break
      case "erinnerung_anlegen":
        liste.push({ agent: "koordinator", was: `Fragt dich am ${new Date(String(aus.ab)).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}: ${String(ein.frage ?? "")}`, stand: "wartet", bis: new Date(String(aus.ab)).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" }) })
        break
      case "bestandskunde_anlegen":
        liste.push({ agent: "kundenbetreuung", was: `${String(aus.firma)} als ${String(aus.als)} geführt – meldet sich zur Pflege`, stand: "erledigt" })
        break
      case "subunternehmer_anlegen":
        liste.push({ agent: "projekte", was: `Subunternehmer ${ein.name ?? ""} im Team`, stand: "erledigt" })
        break
      case "website_korrigieren":
        liste.push({ agent: "webseite", was: "Korrektur aufgenommen – wird als Code-Änderung umgesetzt", stand: "laeuft", bis: "nächster Prüflauf" })
        break
      case "widerspruch_eintragen":
        liste.push({ agent: "recht", was: `${ein.adresse ?? "Adresse"} gesperrt – wird nie wieder angeschrieben`, stand: "erledigt" })
        break
      case "regel_merken":
        liste.push({ agent: "gedaechtnis", was: "Regel gemerkt – gilt ab dem nächsten Entwurf", stand: "erledigt" })
        break
      case "karten_schliessen":
        liste.push({ agent: "assistent", was: `Karten geschlossen (${Number(aus.erledigt ?? 0) + Number(aus.abgelegtOhneVersand ?? 0)})`, stand: "erledigt" })
        break
      case "vorschlag_anlegen": {
        const art = ein.art ?? ""
        const agent = art === "linkedin" ? "redaktion" : art === "kapital" ? "kapital" : art === "mail" || art === "termin" || art === "brief" ? "vertrieb" : "assistent"
        liste.push({ agent, was: `Vorschlag „${ein.titel ?? ""}“ liegt zur Freigabe bereit`, stand: "wartet", bis: "deine Freigabe" })
        break
      }
    }
  }
  return liste
}

export async function antworte(verlauf: Nachricht[], bild?: ChatBild, seite?: string | null): Promise<{ text: string; uebernahmen: Uebernahme[] }> {
  const tools = {
    widerspruch_eintragen: tool({
      description:
        "Trägt eine E-Mail-Adresse oder Domain dauerhaft in die Sperrliste ein (Widerspruch, Absage, Spam-Drohung). Danach geht nie wieder eine Mail dorthin.",
      inputSchema: z.object({
        adresse: z.string().describe("E-Mail-Adresse oder Domain, z. B. info@firma.de oder firma.de"),
        grund: z.string().describe("Kurz, z. B. 'Kein Interesse, droht mit rechtlichen Schritten'"),
      }),
      execute: async ({ adresse, grund }) => {
        const id = await sperre(adresse, grund, "chat")
        return id ? { gesperrt: adresse } : { fehler: "Adresse ungültig oder Datenbank nicht erreichbar" }
      },
    }),
    verkaufslage: tool({
      description: "Offene Abschlüsse (Pipeline), Monatsziel, Warnungen und fällige Rückrufe.",
      inputSchema: z.object({}),
      execute: async () => {
        const l = await ladeVerkaufslage()
        return { monatszielEur: MONATSZIEL_EUR, ...l }
      },
    }),
    finanzrahmen: tool({
      description: "Frei verfügbares Geld, Reichweite und Ausgaben-Spielraum. Vor JEDEM Vorschlag, der Geld kostet, aufrufen.",
      inputSchema: z.object({}),
      execute: async () => {
        const rahmen = await firmenRahmen()
        await protokolliereFaden(await assistentDb().catch(() => null), "finanz", "assistent", "Chat liest Finanzrahmen")
        return rahmen
      },
    }),
    geschaeftsleitung: tool({
      description: "Letzte Wochensitzung der KI-Geschäftsleitung: Beschlüsse, verworfene Ideen, Rückfrage und Emins Antwort.",
      inputSchema: z.object({}),
      execute: async () => (await ladeRaete(1))[0] ?? null,
    }),
    tageslage: tool({
      description: "Heutiges Morgenbriefing des Admin: Lage und die drei wichtigsten Schritte.",
      inputSchema: z.object({}),
      execute: async () => morgenBriefing("de"),
    }),
    messen: tool({
      description: "Messen, bei denen er 'teilnehmen' gewählt hat, plus seine Bewertungen (interessant/uninteressant).",
      inputSchema: z.object({}),
      execute: async () => ({ teilnahme: await messenFuerKalender(), bewertungen: await ladeStatus() }),
    }),
    freigabe_eingang: tool({
      description: "Was bereits im Freigabe-Eingang liegt (um Doppelungen zu vermeiden).",
      inputSchema: z.object({}),
      execute: async () =>
        (await ladeFreigaben()).filter((f) => f.status === "offen").map((f) => ({ id: f.id, art: f.art, agent: f.agent, titel: f.titel })),
    }),
    karten_schliessen: tool({
      description:
        "Schließt Karten im Freigabe-Eingang, wenn Emin das sagt (\"erledigt\", \"weg damit\", \"alle bisherigen schließen\"). Interne Karten (aufgabe/notiz) gelten danach als erledigt; Mail, Brief, LinkedIn, Termin, Kapital und Löschen werden NICHT ausgeführt, sondern nur abgelegt (verworfen). Nur auf ausdrücklichen Wunsch von Emin aufrufen.",
      inputSchema: z.object({
        ids: z.array(z.string().min(4).max(40)).max(60).optional().describe("IDs aus freigabe_eingang"),
        alleInternen: z.boolean().optional().describe("true = alle offenen internen Karten (aufgabe/notiz) schließen"),
        grund: z.string().min(3).max(300),
      }),
      execute: async ({ ids, alleInternen, grund }) => {
        const offen = (await ladeFreigaben()).filter((f) => f.status === "offen")
        const ziel = new Set([...(ids ?? []), ...(alleInternen ? offen.filter((f) => f.art === "aufgabe" || f.art === "notiz").map((f) => f.id) : [])])
        let erledigt = 0
        let abgelegt = 0
        for (const id of ziel) {
          const f = await ladeFreigabe(id)
          if (!f || f.status !== "offen") continue
          const intern = f.art === "aufgabe" || f.art === "notiz"
          await ergaenzeExtra(id, { koordination: { abteilung: "emin", ergebnis: `Emin im Chat: ${grund}`, auftragId: "chat", automatisch: true } })
          await setzeFreigabe(id, intern ? "freigegeben" : "verworfen")
          /* Katman 5: auch im Chat geschlossene Karten zählen als Emins Entscheidung (Ziel gesperrt, keine Regel aus dem Sammelsatz). */
          if (!intern) await notiereEntscheidung(f, { entscheidung: "verworfen", grund: grund.slice(0, 80) }).catch(() => null)
          if (intern) erledigt++
          else abgelegt++
        }
        return { erledigt, abgelegtOhneVersand: abgelegt }
      },
    }),
    regel_merken: tool({
      description:
        "Schreibt eine Regel ins Firmengedächtnis, wenn Emin sagt, wie etwas künftig sein soll (\"nie wieder Verbände anschreiben\", \"LinkedIn-Posts kürzer\", \"merk dir …\"). Die Regel geht ab sofort in jeden Entwurf des genannten Agenten (oder aller mit '*'). Emins Worte möglichst wörtlich übernehmen.",
      inputSchema: z.object({
        agent: z.string().min(1).max(40).describe("Agent-Schlüssel (z. B. jaeger, vertrieb, redaktion, marketing) oder '*' für alle"),
        regel: z.string().min(6).max(400),
        art: z.enum(["verbot", "gebot", "stil"]),
      }),
      execute: async ({ agent, regel, art }) => {
        await legeLektionAn({ geltung: agent.trim().toLowerCase(), regel, art, quelle: "emin" })
        return { gemerkt: true, gilt: agent === "*" ? "alle Agenten" : agent, ab: "nächster Entwurf" }
      },
    }),
    vorschlag_anlegen: tool({
      description:
        "Legt einen fertigen Vorschlag in den Freigabe-Eingang: Mail-Entwurf, Aufgabe, Termin, LinkedIn-Beitrag, Kapital-/Förderchance oder Notiz. Inhalt vollständig ausformulieren.",
      inputSchema: z.object({
        art: z.enum(FREIGABE_ARTEN),
        titel: z.string().min(3).max(160),
        inhalt: z.string().min(3).max(6000),
        empfaenger: z.string().max(200).optional().describe("Nur bei Mail: E-Mail-Adresse, falls bekannt"),
        betreff: z.string().max(200).optional().describe("Nur bei Mail"),
      }),
      execute: async (v) => ({ id: await legeFreigabeAn(v), angelegt: true }),
    }),
    website_korrigieren: tool({
      description:
        "Emin meldet, dass auf creadig.de etwas falsch, veraltet oder nicht vorhanden ist (falscher Name, eigenes Projekt als Kunde, fehlendes Produkt, fehlende Seite). Legt einen fertigen Code-Auftrag an; daraus baut die Kod-Hattı einen Pull Request, den Emin nur noch merged. Firmenfakten gehören in lib/firmenwahrheit.ts UND auf die betroffenen Seiten.",
      inputSchema: z.object({
        titel: z.string().min(5).max(120).describe("Kurz, z. B. 'meaqam ist Eigenbetrieb, kein Kundenwerk'"),
        richtig: z.string().min(10).max(2000).describe("Was stimmt – Emins Angaben wörtlich und vollständig, nichts dazuerfinden"),
        wo: z.string().max(400).optional().describe("Seiten oder Bereiche, falls genannt, z. B. /arbeiten, /produkte"),
      }),
      execute: async (v) => {
        const id = await legeFreigabeAn({
          art: "aufgabe",
          titel: `Website korrigieren: ${v.titel}`,
          inhalt: `Angabe des Inhabers (Chat, ${new Date().toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}):\n${v.richtig}${v.wo ? `\nBetroffen: ${v.wo}` : ""}\n\n— Auftrag für Claude Code —\nKorrigiere creadig.de nach der Angabe des Inhabers oben. Zuerst lib/firmenwahrheit.ts (einzige Firmenquelle) anpassen, dann jede Seite und alle Sprachen (de/tr/en/ar), die davon betroffen sind (lib/site-data.ts, lib/dictionary.ts). Keine Angaben erfinden, die oben nicht stehen; fehlt etwas, im PR nennen.`,
          quelle: `website-korrektur:${Date.now()}`,
          agent: "webseite",
          extra: { code: true, warum: "Korrektur des Inhabers – wird zum Pull Request." },
        })
        if (id) await setzeFreigabe(id, "freigegeben")
        return id ? { angelegt: true, hinweis: "Liegt im Code-Backlog; mit GITHUB_TOKEN wird daraus automatisch ein PR." } : { angelegt: false }
      },
    }),
    subunternehmer_anlegen: tool({
      description:
        "Legt einen Subunternehmer (Freelancer, Partneragentur) für die Projektlieferung an. Aufrufen, sobald Emin einen nennt. Der Lieferplan teilt ihm danach passende Aufgaben zu; der Auftrag an ihn geht nur als Mail-Freigabe raus.",
      inputSchema: z.object({
        name: z.string().min(2).max(120),
        email: z.string().email().max(200).optional(),
        kompetenzen: z.array(z.enum(["design", "entwicklung", "text", "barrierefreiheit", "konzept"])).min(1),
        tagessatzEur: z.number().int().min(0).max(5000).optional(),
        notiz: z.string().max(600).optional(),
      }),
      execute: async (v) => {
        const { legeSubAn } = await import("@/lib/ausfuehrung/lieferung-hat")
        const id = await legeSubAn(v)
        return id ? { angelegt: true, id } : { angelegt: false, grund: "keine Datenbank" }
      },
    }),
    bestandskunde_anlegen: tool({
      description:
        "Legt einen Bestandskunden (oder ehemaligen Kunden) im System an bzw. markiert eine vorhandene Firma als Kunde – mit Leistung, Wert und Datum des letzten Projekts. Aufrufen, sobald Emin Kunden nennt oder eine Kundenliste schickt; je Kunde ein Aufruf. Daraus arbeiten Kundenbetreuung und Partner-Agent.",
      inputSchema: z.object({
        firma: z.string().min(2).max(160),
        ehemalig: z.boolean().optional().describe("true = ehemaliger Kunde"),
        website: z.string().max(200).optional(),
        ort: z.string().max(120).optional(),
        ansprechpartner: z.string().max(120).optional(),
        email: z.string().email().max(200).optional(),
        leistung: z.string().max(200).optional().describe("Was er gekauft hat, z. B. 'Website-Relaunch' oder 'fibero-Lizenz'"),
        wertEur: z.number().int().min(0).max(10_000_000).optional(),
        datum: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).optional().describe("Letztes Projekt, JJJJ-MM oder JJJJ-MM-TT"),
        notiz: z.string().max(600).optional(),
      }),
      execute: async (v) => {
        const q = await assistentDb()
        if (!q) return { gespeichert: false, grund: "keine Datenbank" }
        const org = await findeOderLegeFirma(q, { name: v.firma.trim(), website: v.website ?? null, city: v.ort ?? null })
        const stempel = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeZone: "Europe/Berlin" }).format(new Date())
        const notiz = [v.leistung ? `Kunde: ${v.leistung}${v.wertEur ? ` (${v.wertEur} €)` : ""}${v.datum ? `, ${v.datum}` : ""}` : "", v.notiz ?? ""].filter(Boolean).join(" · ")
        await q(
          `UPDATE organisations SET lifecycle = $2, updated_at = now(),
             note = CASE WHEN $3::text = '' THEN note ELSE concat_ws(E'\n', nullif(note,''), $3::text) END
           WHERE id = $1`,
          [org.id, v.ehemalig ? "ehemaliger-kunde" : "kunde", notiz ? `${stempel} (Chat): ${notiz}` : ""],
        )
        let kontaktId: string | null = null
        if (v.email) kontaktId = (await findeOderLegeKontakt(q, { email: v.email, name: v.ansprechpartner ?? null, firma: v.firma, website: v.website ?? null }).catch(() => null))?.kontaktId ?? null
        if (v.leistung) {
          /* Gewonnener Auftrag mit dem echten Datum – zählt so nicht als „diesen Monat gewonnen". */
          const am = v.datum ? (v.datum.length === 7 ? `${v.datum}-15` : v.datum) : null
          await q(
            `INSERT INTO opportunities (id, organisation_id, contact_id, title, status, source, note, estimated_value, created_at, updated_at)
             SELECT $1, $2, $3, $4, 'won', 'bestand', $5, $6, coalesce($7::date, now() - interval '1 year'), coalesce($7::date, now() - interval '1 year')
              WHERE NOT EXISTS (SELECT 1 FROM opportunities WHERE organisation_id = $2 AND lower(title) = lower($4))`,
            [`opp-${crypto.randomUUID().slice(0, 8)}`, org.id, kontaktId, v.leistung, `Bestandskunde, im Chat erfasst ${stempel}`, v.wertEur ?? null, am],
          )
        }
        return { gespeichert: true, firma: org.name, neu: org.neu, als: v.ehemalig ? "ehemaliger Kunde" : "Kunde" }
      },
    }),
    chance_anlegen: tool({
      description:
        "Legt einen NEUEN Interessenten als Chance an (Firma, Ansprechpartner, Bedarf, wie kennengelernt, nächster Schritt) und übergibt ihn an den Vertrieb: Chronik, Gesprächsvorbehalt (kein Angebot vor dem Termin), Auftrag 'Termin nachhalten', Motor-Ereignis. Gibt es bei der Firma schon eine offene Chance, wird sie ergänzt. Aufrufen, sobald Emin von einem neuen Kontakt/Lead erzählt.",
      inputSchema: z.object({
        firma: z.string().min(2).max(160),
        ort: z.string().max(120).optional(),
        website: z.string().max(200).optional(),
        ansprechpartner: z.string().max(120).optional(),
        telefon: z.string().max(60).optional(),
        email: z.string().email().max(200).optional(),
        bedarf: z.string().min(3).max(400).describe("Was der Interessent will, in seinen Worten"),
        wieKennengelernt: z.string().min(3).max(400).describe("z. B. 'Standgespräch 10 Min. am 24.10.'"),
        bisherGetan: z.string().max(300).optional().describe("z. B. 'WhatsApp mit Terminvorschlag geschickt'"),
        naechsterSchritt: z.string().max(300).optional(),
        datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Bis wann der nächste Schritt, JJJJ-MM-TT; ohne Angabe in 3 Tagen"),
        empfohlenVon: z.string().max(160).optional().describe("Wer hat den Kontakt empfohlen (Kunde, Steuerberater, Verband, Partner)? Nur wenn Emin es sagt."),
        provisionProzent: z.number().min(0).max(30).optional().describe("Vereinbarte Tippgeber-Provision in %, nur wenn Emin es nennt"),
      }),
      execute: async (v) => {
        const q = await assistentDb()
        if (!q) return { angelegt: false, grund: "keine Datenbank" }
        const { legeChanceAn } = await import("./chance")
        const r = await legeChanceAn(q, v)
        await protokolliereFaden(q, "assistent", "vertrieb", `Neue Chance: ${r.firma}`).catch(() => null)
        return r
      },
    }),
    erinnerung_anlegen: tool({
      description:
        "Legt eine Frage an Emin ab, die ihm das System an einem bestimmten Tag stellt (Bereich „Fragen an dich“, mit Antwortknöpfen). Für „erinnere mich Montag“, „frag mich nach dem Termin“, „ich warte auf Antwort von X“.",
      inputSchema: z.object({
        datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Tag, an dem gefragt wird, JJJJ-MM-TT"),
        frage: z.string().min(5).max(200).describe("Kurze Frage an Emin, z. B. „Murat Başer: Hast du ihn gesehen – wie geht es weiter?“"),
        kontext: z.string().max(400).optional().describe("Ein Satz, worum es geht"),
        optionen: z.array(z.string().min(2).max(60)).max(4).optional().describe("2–4 Antwortknöpfe"),
        suche: z.string().max(120).optional().describe("Firma/Chance, falls es um eine Chance geht"),
      }),
      execute: async (v) => {
        const q = await assistentDb()
        let bezug: string | null = null
        if (q && v.suche) {
          const t = (await q(
            `SELECT o.id FROM opportunities o LEFT JOIN organisations g ON g.id = o.organisation_id
              WHERE o.status NOT IN ('won','lost') AND (g.name ILIKE $1 OR o.title ILIKE $1) ORDER BY o.updated_at DESC LIMIT 2`,
            [`%${v.suche.replace(/[%_]/g, "")}%`],
          )) as { id: string }[]
          if (t.length === 1) bezug = `opportunity:${t[0].id}`
        }
        const ab = new Date(`${v.datum}T07:00:00+01:00`)
        const { stelleFrage } = await import("@/lib/assistent/fragen")
        const id = await stelleFrage({
          agent: "koordinator",
          frage: v.frage,
          kontext: v.kontext ?? null,
          optionen: v.optionen?.length ? v.optionen : ["Erledigt", "Noch nicht – in 3 Tagen erinnern", "Hat sich erledigt"],
          bezug,
          quelle: `erinnerung:${v.datum}:${v.frage.slice(0, 60)}`,
          ab,
        })
        return id ? { angelegt: true, id, ab: ab.toISOString() } : { angelegt: false, grund: "Diese Erinnerung gibt es schon" }
      },
    }),
    absprache_speichern: tool({
      description:
        "Speichert, was Emin zu einer offenen Chance gesagt hat (nächster Schritt, Datum, Fakten wie Ort/Verband/Ansprechpartner) direkt an der Chance. IMMER aufrufen, sobald er etwas zu einem Kunden/Deal festlegt – Morgenbriefing, Vertrieb und Agenten lesen genau das.",
      inputSchema: z.object({
        suche: z.string().min(2).max(120).describe("Firmenname oder Stichwort der Chance"),
        naechsterSchritt: z.string().min(3).max(300).optional(),
        datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Datum des nächsten Schritts, JJJJ-MM-TT"),
        fakten: z.string().min(3).max(600).optional().describe("Neue Fakten, werden an die Notiz angehängt"),
      }),
      execute: async (v) => {
        const q = await assistentDb()
        if (!q) return { gespeichert: false, grund: "keine Datenbank" }
        const muster = `%${v.suche.replace(/[%_]/g, "")}%`
        const treffer = await q(
          `SELECT o.id, o.title, coalesce(g.name,'') AS firma FROM opportunities o
             LEFT JOIN organisations g ON g.id = o.organisation_id
            WHERE o.status NOT IN ('won','lost','excluded') AND (g.name ILIKE $1 OR o.title ILIKE $1)
            ORDER BY o.updated_at DESC LIMIT 2`,
          [muster],
        )
        if (treffer.length !== 1)
          return { gespeichert: false, grund: treffer.length ? "mehrdeutig – genauer fragen" : "keine passende offene Chance – jetzt chance_anlegen aufrufen", treffer }
        const id = String(treffer[0].id)
        const stempel = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeZone: "Europe/Berlin" }).format(new Date())
        await q(
          `UPDATE opportunities SET
             next_action = coalesce($2, next_action),
             next_action_at = coalesce($3::date, next_action_at),
             note = CASE WHEN $4::text IS NULL THEN note ELSE concat_ws(E'\n', nullif(note,''), $4::text) END,
             updated_at = now()
           WHERE id = $1`,
          [id, v.naechsterSchritt ?? null, v.datum ?? null, v.fakten ? `${stempel}: ${v.fakten}` : null],
        )
        await q(`DELETE FROM admin_briefing WHERE tag = (now() AT TIME ZONE 'Europe/Berlin')::date`, []).catch(() => null)
        return { gespeichert: true, chance: treffer[0].title, firma: treffer[0].firma }
      },
    }),
  }

  const heute = new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeZone: "Europe/Berlin" }).format(new Date())

  const nachrichten: ModelMessage[] = verlauf.slice(-16).map((m) => ({ role: m.rolle, content: m.text }))
  const letzte = nachrichten.at(-1)
  if (bild && letzte?.role === "user") {
    nachrichten[nachrichten.length - 1] = {
      role: "user",
      content: [
        { type: "text", text: String(letzte.content) },
        { type: "file", data: Buffer.from(bild.base64, "base64"), mediaType: bild.mediaType },
      ],
    }
  }

  const { text, steps } = await generateText({
    /* Bilder (Screenshots von Mails, Briefen, Belegen) liest Sonnet am zuverlässigsten – nur dann, sonst das günstige Modell. */
    model: bild ? BILD_MODELL : MODELL,
    system: `${SYSTEM}\n\nHeute ist ${heute}.${seite ? `\n\nEmin schreibt gerade von dieser Admin-Seite: ${seite} Bezieht er sich mit „hier“, „diese Firma“, „dazu“ oder ohne Namen auf etwas, ist DAS gemeint – nutze den Namen für die Werkzeuge (suche).` : ""}${bild ? `\n\nEr hat ein Bild angehängt. Lies es genau. Ist es eine Kundenantwort oder Mail: 1) ordne sie mit "absprache_speichern" der Firma zu, 2) bei Absage/Widerspruch/Spam-Drohung sofort "widerspruch_eintragen" (dann wird diese Adresse nie wieder angeschrieben) und sag ehrlich, was rechtlich daraus folgt, 3) leite ab, was Marketing/Vertrieb daraus lernt.` : ""}`,
    messages: nachrichten,
    tools,
    stopWhen: stepCountIs(6),
    maxOutputTokens: 2500,
  })
  const uebernahmen = uebernahmenAus(steps.flatMap((st) => st.toolResults.map((t) => ({ toolName: t.toolName, input: t.input, output: t.output }))))
  return { text: text.trim() || (uebernahmen.length ? "Erledigt – siehe unten, wer übernommen hat." : "Ich habe nichts angelegt."), uebernahmen }
}
