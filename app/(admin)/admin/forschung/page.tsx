import { FlaskConical } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AktionKnopf, AktionMeldung } from "@/components/admin/aktion-knopf"
import { AdminField, AdminInput, AdminSelect, AdminTextarea, Surface } from "@/components/admin/primitives"
import { adminSprache } from "@/lib/admin-i18n/server"
import { FORSCHUNG_PROJEKTE, FORSCHUNG_SATZ, jahresUebersicht, ladeStunden, wochenSumme } from "@/lib/agenten/forschung"

import { stundenEintragen } from "./actions"

export const metadata = { title: "Forschungszulage · Stunden" }
export const dynamic = "force-dynamic"

const PROJEKT_NAME: Record<(typeof FORSCHUNG_PROJEKTE)[number], string> = {
  fibero: "fibero",
  stammo: "stammo",
  meai: "meAI",
  "creadig-os": "creaDIG Business-OS",
  sonstiges: "Sonstiges",
}

const T = {
  de: {
    titel: "Forschungszulage · Ar-Ge-Stunden",
    lead: "Halte zeitnah fest, woran du technisch Neues entwickelst – Tätigkeit und technische Unsicherheit. Daraus entsteht der Nachweis für BSFZ und Finanzamt.",
    neu: "Stunden eintragen",
    tag: "Datum",
    projekt: "Projekt",
    stunden: "Stunden",
    taetigkeit: "Tätigkeit",
    taetigkeitHilfe: "Was hast du konkret entwickelt oder untersucht?",
    unsicherheit: "Technische Unsicherheit",
    unsicherheitHilfe: "Was war vorher unklar, ob/wie es technisch geht?",
    speichern: "Eintragen",
    woche: "Letzte 7 Tage",
    jahr: "Dieses Jahr",
    schaetzung: "Zulage (Schätzung)",
    hinweis: `Schätzung, keine Steuerberatung: ${FORSCHUNG_SATZ.eurJeStunde} €/h Eigenleistung + ${FORSCHUNG_SATZ.gemeinkosten * 100} % Gemeinkosten × ${FORSCHUNG_SATZ.foerdersatz * 100} % Fördersatz. Verbindlich sind BSFZ-Bescheinigung und Finanzamt.`,
    liste: "Einträge der letzten 8 Wochen",
    leer: "Noch keine Stunden erfasst.",
  },
  tr: {
    titel: "Ar-Ge teşviki · Ar-Ge saatleri",
    lead: "Teknik olarak yeni geliştirdiğin şeyi zamanında kaydet: ne yaptın, teknik belirsizlik neydi. BSFZ ve vergi dairesi için kanıt buradan oluşur.",
    neu: "Saat gir",
    tag: "Tarih",
    projekt: "Proje",
    stunden: "Saat",
    taetigkeit: "Faaliyet",
    taetigkeitHilfe: "Somut olarak neyi geliştirdin ya da araştırdın?",
    unsicherheit: "Teknik belirsizlik",
    unsicherheitHilfe: "Teknik olarak olup olmayacağı / nasıl olacağı neden belirsizdi?",
    speichern: "Kaydet",
    woche: "Son 7 gün",
    jahr: "Bu yıl",
    schaetzung: "Teşvik (tahmin)",
    hinweis: `Tahmindir, vergi danışmanlığı değildir: ${FORSCHUNG_SATZ.eurJeStunde} €/saat öz emek + %${FORSCHUNG_SATZ.gemeinkosten * 100} genel gider × %${FORSCHUNG_SATZ.foerdersatz * 100} teşvik oranı. Bağlayıcı olan BSFZ belgesi ve vergi dairesidir.`,
    liste: "Son 8 haftanın kayıtları",
    leer: "Henüz saat girilmedi.",
  },
} as const

export default async function Forschung({ searchParams }: { searchParams: Promise<{ meldung?: string }> }) {
  const sprache = await adminSprache()
  const t = T[sprache === "tr" ? "tr" : "de"]
  const intl = sprache === "tr" ? "tr-TR" : "de-DE"
  const [{ meldung }, eintraege, woche, jahr] = await Promise.all([searchParams, ladeStunden(8), wochenSumme(), jahresUebersicht()])
  const heute = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" })
  const zahl = (n: number) => n.toLocaleString(intl, { maximumFractionDigits: 2 })

  return (
    <AdminShell title={t.titel} lead={t.lead}>
      <AktionMeldung />
      {meldung ? <p className="rounded-2xl bg-muted px-4 py-3 text-sm">{meldung}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Surface padding="sm">
          <p className="text-meta text-muted-foreground">{t.woche}</p>
          <p className="font-display text-3xl font-semibold tabular-nums">{zahl(woche)} h</p>
        </Surface>
        <Surface padding="sm">
          <p className="text-meta text-muted-foreground">{t.jahr}</p>
          <p className="font-display text-3xl font-semibold tabular-nums">{zahl(jahr.stunden)} h</p>
        </Surface>
        <Surface padding="sm">
          <p className="text-meta text-muted-foreground">{t.schaetzung}</p>
          <p className="font-display text-3xl font-semibold tabular-nums text-primary">{jahr.schaetzungEur.toLocaleString(intl)} €</p>
        </Surface>
      </div>

      <Surface className="flex flex-col gap-5">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <FlaskConical className="size-5 text-primary" aria-hidden="true" />
          {t.neu}
        </h2>
        <form action={stundenEintragen} className="grid gap-4 sm:grid-cols-3">
          <AdminField label={t.tag} htmlFor="fs-tag">
            <AdminInput id="fs-tag" name="tag" type="date" defaultValue={heute} max={heute} required />
          </AdminField>
          <AdminField label={t.projekt} htmlFor="fs-projekt">
            <AdminSelect id="fs-projekt" name="projekt" defaultValue="fibero" required>
              {FORSCHUNG_PROJEKTE.map((p) => (
                <option key={p} value={p}>
                  {PROJEKT_NAME[p]}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t.stunden} htmlFor="fs-stunden">
            <AdminInput id="fs-stunden" name="stunden" type="number" step="0.25" min="0.25" max="16" inputMode="decimal" required />
          </AdminField>
          <AdminField label={t.taetigkeit} htmlFor="fs-taetigkeit" className="sm:col-span-3">
            <AdminTextarea id="fs-taetigkeit" name="taetigkeit" rows={2} minLength={5} maxLength={1000} placeholder={t.taetigkeitHilfe} required />
          </AdminField>
          <AdminField label={t.unsicherheit} htmlFor="fs-unsicherheit" className="sm:col-span-3">
            <AdminTextarea id="fs-unsicherheit" name="unsicherheit" rows={2} maxLength={1000} placeholder={t.unsicherheitHilfe} />
          </AdminField>
          <div className="sm:col-span-3">
            <AktionKnopf className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground" fertig={t.speichern}>
              {t.speichern}
            </AktionKnopf>
          </div>
        </form>
        <p className="text-xs text-muted-foreground">{t.hinweis}</p>
      </Surface>

      {jahr.zeilen.length ? (
        <Surface className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">{t.jahr}</h2>
          <ul className="divide-y divide-border text-sm">
            {jahr.zeilen.map((z) => (
              <li key={z.projekt} className="flex justify-between gap-4 py-2">
                <span>{PROJEKT_NAME[z.projekt]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {zahl(z.stunden)} h · ~{z.schaetzungEur.toLocaleString(intl)} €
                </span>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}

      <Surface className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">{t.liste}</h2>
        {eintraege.length ? (
          <ul className="divide-y divide-border text-sm">
            {eintraege.map((e) => (
              <li key={e.id} className="flex flex-col gap-1 py-3">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">
                    {new Date(`${e.tag}T12:00:00Z`).toLocaleDateString(intl, { day: "2-digit", month: "short" })} · {PROJEKT_NAME[e.projekt]}
                  </span>
                  <span className="tabular-nums">{zahl(e.stunden)} h</span>
                </div>
                <p className="text-muted-foreground">{e.taetigkeit}</p>
                {e.unsicherheit ? <p className="text-xs text-muted-foreground">↳ {e.unsicherheit}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t.leer}</p>
        )}
      </Surface>
    </AdminShell>
  )
}
