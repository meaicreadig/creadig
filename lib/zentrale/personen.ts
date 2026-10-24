/**
 * Gesichter des KI-Teams im Chat (24.10.2026).
 *
 * Emin: „Wer zuständig ist, soll im Chat sichtbar übernehmen – mit Namen,
 * Abteilung und was er gerade tut.“ Jeder Agent bekommt einen festen Vornamen.
 * Es sind KI-Mitarbeiter – die Oberfläche kennzeichnet sie immer als „KI“
 * (siehe KI-Team-Regel: nur Emin ist ein echter Mensch).
 */

export type Person = { name: string; rolle: { de: string; tr: string } }

export const PERSONEN: Record<string, Person> = {
  assistent: { name: "Aylin", rolle: { de: "Chief of Staff", tr: "Genel Koordinatör" } },
  koordinator: { name: "Aylin", rolle: { de: "Chief of Staff", tr: "Genel Koordinatör" } },
  vertrieb: { name: "Leyla", rolle: { de: "Vertrieb", tr: "Satış" } },
  recherche: { name: "Jonas", rolle: { de: "Recherche", tr: "Araştırma" } },
  gespraech: { name: "Selin", rolle: { de: "Gesprächsraum", tr: "Görüşme Kaydı" } },
  kundenbetreuung: { name: "Selin", rolle: { de: "Kundenbetreuung", tr: "Müşteri İlişkileri" } },
  kundenservice: { name: "Mert", rolle: { de: "Kundenservice", tr: "Müşteri Hizmetleri" } },
  angebot: { name: "Deniz", rolle: { de: "Angebote", tr: "Teklifler" } },
  finanz: { name: "Paul", rolle: { de: "Finanzen", tr: "Finans" } },
  forderungen: { name: "Paul", rolle: { de: "Finanzen", tr: "Finans" } },
  projekte: { name: "Emre", rolle: { de: "Projektleitung", tr: "Proje Yönetimi" } },
  webseite: { name: "Mara", rolle: { de: "Website", tr: "Web Sitesi" } },
  entwicklung: { name: "Mara", rolle: { de: "Entwicklung", tr: "Geliştirme" } },
  recht: { name: "Nora", rolle: { de: "Recht & Compliance", tr: "Hukuk ve Uyum" } },
  redaktion: { name: "Lena", rolle: { de: "Redaktion", tr: "Editörlük" } },
  marketing: { name: "Lena", rolle: { de: "Marketing", tr: "Pazarlama" } },
  jaeger: { name: "Tarık", rolle: { de: "Neukunden", tr: "Yeni Müşteri" } },
  partner: { name: "Tarık", rolle: { de: "Partner", tr: "Ortaklıklar" } },
  kapital: { name: "Yusuf", rolle: { de: "Kapital & Förderung", tr: "Sermaye ve Teşvik" } },
  golf: { name: "Yusuf", rolle: { de: "Golf-Radar", tr: "Körfez Radarı" } },
  international: { name: "Yusuf", rolle: { de: "International", tr: "Uluslararası" } },
  gedaechtnis: { name: "Aylin", rolle: { de: "Firmengedächtnis", tr: "Şirket Hafızası" } },
  ideen: { name: "Kaan", rolle: { de: "Ideenwerkstatt", tr: "Fikir Atölyesi" } },
  controller: { name: "Kaan", rolle: { de: "Ergebnis-Controller", tr: "Sonuç Kontrolü" } },
  teftis: { name: "Teoman", rolle: { de: "Teftiş (Revision)", tr: "Teftiş Kurulu" } },
}

export const personVon = (agent: string): Person => PERSONEN[agent] ?? { name: "Aylin", rolle: { de: "Chief of Staff", tr: "Genel Koordinatör" } }

/** Eine sichtbare Übernahme im Chat: wer, was, Stand. */
export type Uebernahme = {
  agent: string
  was: string
  stand: "erledigt" | "laeuft" | "wartet"
  /** z. B. „ca. 5 Min.“ oder „bis 27.10.“ */
  bis?: string
}
