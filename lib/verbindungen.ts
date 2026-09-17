/**
 * ADM-04 · VERBINDUNGEN — Fähigkeit ≠ Autorisierung ≠ Profillink
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DREI EBENEN UND NICHT EIN HAKEN
 *
 * Ein LinkedIn-Profil in der Fußzeile ist kein Login. Ein Login ist noch
 * keine Datenoperation. Wer das in einer Karte zusammenzieht, schreibt
 * „verbunden“ neben einen Kanal, über den nichts fließt — und der Owner
 * wartet auf Anfragen, die nie kommen konnten.
 *
 * Deshalb trägt jeder Eintrag drei getrennte Sätze:
 *
 *   faehigkeit      Was das Haus damit TUN kann — der Geschäftssatz.
 *   autorisierung   Ob eine Erlaubnis existiert (OAuth, Schlüssel, Sitzung).
 *   profilLink      Eine Adresse. Nie eine Fähigkeit.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WOHER DER ZUSTAND KOMMT
 *
 * Aus Code und Umgebung dieser Instanz — nicht aus einer zweiten Tabelle.
 * Das ist Absicht (A9): Ein eigener Verbindungsspeicher wäre ein zweiter
 * Wahrheitsort neben der Umgebung, und beide würden auseinanderlaufen. Was
 * hier steht, ist ableitbar und damit nie veraltet.
 *
 * Abgeleitet heißt aber NICHT gemessen. „LEAD_STORE ist gesetzt“ beweist
 * nicht, dass die Datenbank antwortet. Die Messung macht die Prüfung
 * (`lib/verbindungen-pruefung.ts`), und die Oberfläche hält beides
 * auseinander.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KRITIKALITÄT IST EINGEFROREN
 *
 * `docs/admin-os/state.md` §ADM-00 (OD-2): CRITICAL ist die FÄHIGKEIT
 * „Anfrage kommt strukturiert an“ — Website-Formular und manuelle Erfassung.
 * Alles andere ist OPTIONAL und darf ehrlich `NOT_CONFIGURED` bleiben, ohne
 * das Programm zu blockieren. Eine Herabstufung von CRITICAL ist eine
 * Owner-Entscheidung mit Datum im Ledger, keine Code-Änderung.
 *
 * Der Testanbieter (A15–A18) liegt in `lib/verbindungen-fixture.ts` und
 * schreibt ausschließlich in den Arbeitsspeicher.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · ZUSTÄNDE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Sieben Zustände, und keiner heißt „unbekannt gleich aus“.
 *
 * `NOT_CONFIGURED` und `ERROR` sind verschiedene Nachrichten: das eine sagt
 * „hier wurde nie etwas eingerichtet“, das andere „es war eingerichtet und
 * antwortet nicht“. Wer beides als graues Feld zeigt, nimmt dem Owner die
 * einzige Information, aus der eine Handlung folgt.
 */
export const VERBINDUNGS_ZUSTAENDE = [
  /** Nie eingerichtet. Kein Adapter, kein Schlüssel, keine Erlaubnis. */
  "NOT_CONFIGURED",
  /** Es gibt nur eine Adresse (Profil, Terminseite). Keine Datenoperation. */
  "LINK_ONLY",
  /** Fähigkeit vorhanden und autorisiert. */
  "CONNECTED",
  /** Verbunden, aber der Anbieter meldet Störung — kein stiller Erfolg. */
  "DEGRADED",
  /** Erlaubnis wurde zurückgenommen. War verbunden, ist es nicht mehr. */
  "REVOKED",
  /** Eingerichtet, antwortet nicht. */
  "ERROR",
  /** Wartet auf eine Freigabe außerhalb dieses Hauses. */
  "BLOCKED_EXTERNAL",
] as const
export type VerbindungsZustand = (typeof VERBINDUNGS_ZUSTAENDE)[number]

/** Wie dringend der Zustand aussieht. Rein Darstellung, keine Logik. */
export function zustandSchwere(z: VerbindungsZustand): "neutral" | "attention" | "critical" {
  if (z === "CONNECTED") return "neutral"
  if (z === "ERROR" || z === "DEGRADED") return "critical"
  if (z === "REVOKED" || z === "BLOCKED_EXTERNAL") return "attention"
  return "neutral"
}

export const VERBINDUNGS_KRITIKALITAET = ["CRITICAL", "OPTIONAL"] as const
export type VerbindungsKritikalitaet = (typeof VERBINDUNGS_KRITIKALITAET)[number]

/**
 * Wozu der Kanal im Betrieb gehört. Die Gruppierung der Oberfläche folgt
 * der Arbeit, nicht dem Anbieter: Der Owner sucht „wie kommt eine Anfrage
 * herein“, nicht „welche API haben wir“.
 */
export const VERBINDUNGS_GRUPPEN = ["eingang", "ausgang", "kanal", "pruefstand"] as const
export type VerbindungsGruppe = (typeof VERBINDUNGS_GRUPPEN)[number]

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · DER EINTRAG
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Verbindungsebene = {
  /** Was das Haus damit *tun* kann — i18n-Schlüssel, kein fertiger Satz. */
  faehigkeit: string
  /** Ob eine Autorisierung existiert (OAuth, API-Schlüssel, Sitzung). */
  autorisierung: string
  /** Öffentlicher oder interner Link — kein Login. */
  profilLink: string | null
}

export type Verbindungseintrag = {
  id: VerbindungsId
  /** Maschinenwert — Anzeige über Wörterbuch, nie übersetzt gespeichert. */
  kanal: string
  gruppe: VerbindungsGruppe
  kritikalitaet: VerbindungsKritikalitaet
  zustand: VerbindungsZustand
  /**
   * Die drei Ebenen als i18n-Schlüsselpaare: `faehigkeit`/`autorisierung`
   * nennen je eine Variante („aktiv“/„fehlt“), damit der Satz in DE und TR
   * aus dem Wörterbuch kommt und nicht aus dieser Datei.
   */
  ebenen: Verbindungsebene
  /** Woher der Zustand kommt — Maschinenschlüssel, Anzeige übersetzt. */
  beleg: string
  /** Ob eine echte Prüfung möglich ist (und was sie beweisen kann). */
  pruefbar: boolean
  /** Wohin im Admin, falls es etwas zu tun gibt. */
  href: string | null
}

export const VERBINDUNGS_IDS = [
  "website-anfrage",
  "manuelle-anfrage",
  "email-ausgang",
  "email-eingang",
  "kalender",
  "whatsapp",
  "linkedin",
  "meta-instagram",
  "pruefanbieter",
] as const
export type VerbindungsId = (typeof VERBINDUNGS_IDS)[number]

type Umgebung = Record<string, string | undefined>

function gesetzt(env: Umgebung, name: string): boolean {
  return Boolean(env[name]?.trim())
}

/**
 * Ist der Prüfstand (Testanbieter) eingeschaltet?
 *
 * Zwei Sperren, nicht eine: Er braucht ein ausdrückliches `an` UND darf in
 * einer Produktionsumgebung von Vercel nicht erscheinen. Eine vergessene
 * Variable soll keinen Demo-Kanal in die echte Owner-Ansicht stellen.
 */
export function pruefstandAktiv(env: Umgebung = process.env): boolean {
  if (env.VERCEL_ENV === "production") return false
  return env.VERBINDUNG_FIXTURE?.trim() === "an"
}

/**
 * Die Handlungen am Prüfstand.
 *
 * Sie stehen hier und nicht in der Action-Datei: Ein `"use server"`-Modul
 * darf ausschliesslich asynchrone Funktionen exportieren — eine Liste dort
 * bricht den Build. Die Liste ist ausserdem die Whitelist, gegen die die
 * Action prüft; sie gehört zum Modell, nicht zur Handhabung.
 */
export const PRUEFSTAND_AKTIONEN = [
  "verbinden",
  "widerrufen",
  "ereignis",
  "ereignis-gleich",
  "anbieterfehler",
] as const
export type PruefstandAktion = (typeof PRUEFSTAND_AKTIONEN)[number]

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · DAS INVENTAR
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Der Stand des Prüfstands, wie ihn das Inventar braucht.
 *
 * Zwei Felder und nicht eines: Ein gestörter Anbieter (`DEGRADED`) hat eine
 * gültige Erlaubnis und trotzdem keine Fähigkeit. Genau diese Trennung ist
 * der Inhalt von A18 — sie darf beim Zeichnen der Karte nicht wieder
 * zusammenfallen.
 */
export type PruefstandStand = {
  zustand: VerbindungsZustand
  autorisiert: boolean
}

/**
 * Das Inventar dieser Instanz — gemessen an Code und Umgebung.
 *
 * Keine Datenbank, keine erfundenen OAuth-Scopes, keine angenommene
 * Anbieterfreigabe. Wo nichts ist, steht `NOT_CONFIGURED` mit dem Grund.
 *
 * @param pruefstand Der Stand des Testanbieters kommt aus dem Arbeitsspeicher
 *   der laufenden Instanz und wird hereingereicht — diese Funktion bleibt
 *   damit rein und in Skripten ohne Server prüfbar.
 */
export function verbindungenInventar(
  env: Umgebung = process.env,
  pruefstand: PruefstandStand = { zustand: "NOT_CONFIGURED", autorisiert: false },
): Verbindungseintrag[] {
  const leadStore = env.LEAD_STORE?.trim()
  /* Vertrieb braucht Verknüpfungen über mehrere Tabellen — nur Postgres. */
  const vertrieb = (leadStore === "neon" || leadStore === "pg-lokal") && gesetzt(env, "DATABASE_URL")
  /* Der Formularweg kommt auch ohne Vertriebstabellen an — aber nicht ohne Speicher. */
  const eingangSpeicher = Boolean(leadStore) && leadStore !== "aus"
  const resend = gesetzt(env, "RESEND_API_KEY")

  const eintraege: Verbindungseintrag[] = [
    {
      id: "website-anfrage",
      kanal: "websiteAnfrage",
      gruppe: "eingang",
      kritikalitaet: "CRITICAL",
      zustand: eingangSpeicher ? "CONNECTED" : "NOT_CONFIGURED",
      ebenen: {
        faehigkeit: eingangSpeicher ? "websiteAnfrageAktiv" : "websiteAnfrageFehlt",
        autorisierung: "websiteAnfrageAuth",
        profilLink: null,
      },
      beleg: eingangSpeicher ? "speicherEingerichtet" : "keinSpeicher",
      pruefbar: true,
      href: "/admin/vertrieb/anfragen",
    },
    {
      id: "manuelle-anfrage",
      kanal: "manuelleAnfrage",
      gruppe: "eingang",
      kritikalitaet: "CRITICAL",
      zustand: vertrieb ? "CONNECTED" : "NOT_CONFIGURED",
      ebenen: {
        faehigkeit: vertrieb ? "manuelleAnfrageAktiv" : "manuelleAnfrageFehlt",
        autorisierung: "manuelleAnfrageAuth",
        profilLink: null,
      },
      beleg: vertrieb ? "vertriebEingerichtet" : "keinVertrieb",
      pruefbar: true,
      href: "/admin/vertrieb/anfragen/neu",
    },
    {
      id: "email-eingang",
      kanal: "emailEingang",
      gruppe: "eingang",
      kritikalitaet: "OPTIONAL",
      zustand: "NOT_CONFIGURED",
      ebenen: {
        faehigkeit: "emailEingangFehlt",
        autorisierung: "keine",
        profilLink: null,
      },
      beleg: "emailEingangBeleg",
      pruefbar: false,
      href: "/admin/vertrieb/anfragen/neu",
    },
    {
      id: "email-ausgang",
      kanal: "emailAusgang",
      gruppe: "ausgang",
      kritikalitaet: "OPTIONAL",
      zustand: resend ? "CONNECTED" : "NOT_CONFIGURED",
      ebenen: {
        faehigkeit: resend ? "emailAusgangAktiv" : "emailAusgangFehlt",
        autorisierung: resend ? "emailAusgangAuth" : "keine",
        profilLink: null,
      },
      beleg: resend ? "schluesselGesetzt" : "keinSchluessel",
      pruefbar: true,
      href: null,
    },
    {
      id: "kalender",
      kanal: "kalender",
      gruppe: "kanal",
      kritikalitaet: "OPTIONAL",
      zustand: "LINK_ONLY",
      ebenen: {
        faehigkeit: "kalenderLink",
        autorisierung: "keine",
        profilLink: "/termin",
      },
      beleg: "kalenderBeleg",
      pruefbar: false,
      href: null,
    },
    {
      id: "whatsapp",
      kanal: "whatsapp",
      gruppe: "kanal",
      kritikalitaet: "OPTIONAL",
      zustand: "LINK_ONLY",
      ebenen: {
        faehigkeit: "whatsappLink",
        autorisierung: "keine",
        profilLink: "https://wa.me/41765045879",
      },
      beleg: "whatsappBeleg",
      pruefbar: false,
      href: null,
    },
    {
      id: "linkedin",
      kanal: "linkedin",
      gruppe: "kanal",
      kritikalitaet: "OPTIONAL",
      zustand: "NOT_CONFIGURED",
      ebenen: {
        faehigkeit: "linkedinFehlt",
        autorisierung: "keine",
        profilLink: null,
      },
      beleg: "linkedinBeleg",
      pruefbar: false,
      href: null,
    },
    {
      id: "meta-instagram",
      kanal: "metaInstagram",
      gruppe: "kanal",
      kritikalitaet: "OPTIONAL",
      zustand: "NOT_CONFIGURED",
      ebenen: {
        faehigkeit: "metaFehlt",
        autorisierung: "keine",
        profilLink: null,
      },
      beleg: "metaBeleg",
      pruefbar: false,
      href: null,
    },
  ]

  if (pruefstandAktiv(env)) {
    eintraege.push({
      id: "pruefanbieter",
      kanal: "pruefanbieter",
      gruppe: "pruefstand",
      kritikalitaet: "OPTIONAL",
      zustand: pruefstand.zustand,
      ebenen: {
        /*
         * Fähigkeit folgt dem Zustand, Autorisierung folgt dem Token. Bei
         * `DEGRADED` stehen sie deshalb auseinander — die Erlaubnis gilt,
         * der Kanal trägt gerade nichts. Eine Karte, die beides aus einem
         * Feld zeichnet, könnte das gar nicht sagen.
         */
        faehigkeit: pruefstand.zustand === "CONNECTED" ? "pruefanbieterAktiv" : "pruefanbieterRuht",
        autorisierung: pruefstand.autorisiert ? "pruefanbieterAuth" : "keine",
        /* Absichtlich immer null: Ein Profil-URL ist keine Fähigkeit (A18). */
        profilLink: null,
      },
      beleg: "pruefanbieterBeleg",
      pruefbar: false,
      href: null,
    })
  }

  return eintraege
}

export function verbindungEintrag(
  id: VerbindungsId,
  env: Umgebung = process.env,
  pruefstand?: PruefstandStand,
): Verbindungseintrag | null {
  return verbindungenInventar(env, pruefstand).find((e) => e.id === id) ?? null
}

/**
 * Die eine Frage, die der Owner an diese Seite hat: Kann eine Anfrage
 * ankommen?
 *
 * Nur die als CRITICAL eingefrorenen Fähigkeiten zählen. Ein nicht
 * konfigurierter LinkedIn-Kanal macht den Eingang nicht kaputt — und darf
 * deshalb auch keine Warnung auslösen, die man nach dem dritten Mal ignoriert.
 */
export function eingangsLage(eintraege: Verbindungseintrag[]): {
  kritisch: Verbindungseintrag[]
  gestoert: Verbindungseintrag[]
  offen: boolean
} {
  const kritisch = eintraege.filter((e) => e.kritikalitaet === "CRITICAL")
  const gestoert = kritisch.filter((e) => e.zustand !== "CONNECTED")
  return { kritisch, gestoert, offen: gestoert.length === 0 }
}
