import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminField, AdminInput, AdminSelect, AdminTextarea, Pill, SectionHeader, Surface } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { datumAnzeige } from "@/lib/geschaeftszeit"
import { ladeVerkaufslage, MONATSZIEL_EUR, OFFENE_STUFEN, WAHRSCHEINLICHKEIT, type OffeneStufe, type Warnung } from "@/lib/verkaufen"
import { ladeEntwuerfe } from "@/lib/verkaufen-entwurf"
import { Sparkles } from "lucide-react"
import { dealAnlegen, entwurfErstellen } from "./actions"

export const dynamic = "force-dynamic"

const TEXTE = {
  de: {
    titel: "Heute verkaufen",
    meta: "Welcher Abschluss braucht dich jetzt",
    gewonnen: "Gewonnen diesen Monat",
    ziel: "Monatsziel",
    gewichtet: "Pipeline gewichtet",
    voll: "Pipeline voll",
    neu: "Neue Chancen (7 Tage)",
    deals: "Offene Abschlüsse",
    keineDeals: "Noch keine offene Chance. Lege unten deinen ersten Abschluss an.",
    zug: "Nächster Zug",
    dein: "Dein Schritt",
    fehlt: "Kein Schritt festgelegt",
    oeffnen: "Öffnen",
    faellig: "Heute fällig",
    keineFaellig: "Heute ist nichts fällig.",
    anlegen: "Abschluss anlegen",
    firma: "Firma / Verband",
    website: "Webseite",
    titelFeld: "Worum geht es",
    wert: "Wert in €",
    stufe: "Stufe",
    schritt: "Nächster Schritt",
    am: "Bis wann",
    notiz: "Notiz",
    speichern: "Anlegen",
    wahrscheinlich: "Wahrscheinlichkeit",
    warn: {
      "ohne-schritt": "Kein Schritt",
      ueberfaellig: "Überfällig",
      still: "Seit über 7 Tagen still",
      "ohne-wert": "Kein Wert",
    } satisfies Record<Warnung, string>,
    stufen: {
      new: "Neu",
      contacted: "Kontaktiert",
      qualified: "Qualifiziert",
      discovery: "Bedarfsgespräch",
      audit: "Betriebscheck",
      proposal: "Angebot",
      negotiation: "Verhandlung",
    } satisfies Record<OffeneStufe, string>,
    zuege: {
      new: "Kurze Mail mit konkretem Anlass, direkt einen Termin anbieten.",
      contacted: "Nach 3 Tagen nachfassen und den Terminlink mitschicken.",
      qualified: "Entscheider, Budget und Zeitpunkt klären, bevor du Zeit investierst.",
      discovery: "Abläufe aufnehmen: Wo verliert der Betrieb Zeit oder Geld? Im Gesprächsraum mitschreiben.",
      audit: "Betriebscheck auswerten und das Ergebnis als Mappe zeigen, nicht mailen.",
      proposal: "Angebot in drei Stufen zeigen und einen festen Entscheidungstermin vereinbaren.",
      negotiation: "Nicht im Preis nachgeben, sondern Umfang staffeln. Anzahlung und Startdatum festmachen.",
    } satisfies Record<OffeneStufe, string>,
  },
  tr: {
    titel: "Bugün sat",
    meta: "Hangi anlaşma şimdi seni bekliyor",
    gewonnen: "Bu ay kazanılan",
    ziel: "Aylık hedef",
    gewichtet: "Ağırlıklı pipeline",
    voll: "Toplam pipeline",
    neu: "Yeni fırsatlar (7 gün)",
    deals: "Açık anlaşmalar",
    keineDeals: "Henüz açık fırsat yok. Aşağıdan ilk anlaşmanı ekle.",
    zug: "Sıradaki hamle",
    dein: "Senin adımın",
    fehlt: "Adım belirlenmemiş",
    oeffnen: "Aç",
    faellig: "Bugün vadesi gelen",
    keineFaellig: "Bugün vadesi gelen bir şey yok.",
    anlegen: "Anlaşma ekle",
    firma: "Firma / dernek",
    website: "Web sitesi",
    titelFeld: "Konu",
    wert: "Değer (€)",
    stufe: "Aşama",
    schritt: "Sıradaki adım",
    am: "Ne zamana kadar",
    notiz: "Not",
    speichern: "Ekle",
    wahrscheinlich: "Olasılık",
    warn: {
      "ohne-schritt": "Adım yok",
      ueberfaellig: "Gecikmiş",
      still: "7 günden fazla sessiz",
      "ohne-wert": "Değer yok",
    } satisfies Record<Warnung, string>,
    stufen: {
      new: "Yeni",
      contacted: "İletişime geçildi",
      qualified: "Nitelendirildi",
      discovery: "İhtiyaç görüşmesi",
      audit: "İşletme kontrolü",
      proposal: "Teklif",
      negotiation: "Pazarlık",
    } satisfies Record<OffeneStufe, string>,
    zuege: {
      new: "Somut bir sebeple kısa bir mail at, hemen randevu öner.",
      contacted: "3 gün sonra tekrar yaz, randevu linkini ekle.",
      qualified: "Zaman harcamadan önce karar vericiyi, bütçeyi ve zamanı netleştir.",
      discovery: "Süreçleri çıkar: İşletme nerede zaman veya para kaybediyor? Görüşme odasında not al.",
      audit: "İşletme kontrolünü değerlendir, sonucu mail ile değil dosya olarak göster.",
      proposal: "Teklifi üç kademede göster ve sabit bir karar tarihi belirle.",
      negotiation: "Fiyattan inme, kapsamı kademelendir. Ön ödeme ve başlangıç tarihini netleştir.",
    } satisfies Record<OffeneStufe, string>,
  },
} as const

export async function generateMetadata() {
  const { sprache } = await adminSprachKontext()
  return { title: TEXTE[sprache === "tr" ? "tr" : "de"].titel }
}

export default async function VerkaufenPage() {
  const { sprache, intl } = await adminSprachKontext()
  const t = TEXTE[sprache === "tr" ? "tr" : "de"]
  const [lage, entwuerfe] = await Promise.all([ladeVerkaufslage(), ladeEntwuerfe()])
  const euro = (n: number) => `${n.toLocaleString(intl)} €`
  const zielAnteil = Math.min(100, Math.round((lage.gewonnenMonat / MONATSZIEL_EUR) * 100))

  return (
    <AdminShell title={t.titel} meta={<span className="block">{t.meta}</span>}>
      <div className="flex flex-col gap-6">
        <Surface>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{t.gewonnen}</span>
                <span className="font-sans text-4xl font-semibold tabular-nums text-primary">{euro(lage.gewonnenMonat)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t.ziel}: {euro(MONATSZIEL_EUR)} · {zielAnteil} %
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={zielAnteil}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.ziel}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${zielAnteil}%` }} />
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Kennzahl label={t.gewichtet} wert={euro(lage.pipelineGewichtet)} />
              <Kennzahl label={t.voll} wert={euro(lage.pipelineVoll)} />
              <Kennzahl label={t.neu} wert={String(lage.neueWoche)} />
            </dl>
          </div>
        </Surface>

        <section aria-labelledby="deals" className="flex flex-col gap-4">
          <SectionHeader id="deals" title={t.deals} count={lage.deals.length} />
          {lage.deals.length === 0 ? (
            <Surface padding="sm">
              <p className="text-sm text-muted-foreground">{t.keineDeals}</p>
            </Surface>
          ) : (
            <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {lage.deals.map((d) => (
                <li key={d.id}>
                  <Surface padding="sm" className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-sm text-muted-foreground">{d.firma ?? "—"}</span>
                        <h3 className="text-pretty font-sans text-lg font-semibold leading-snug">{d.titel}</h3>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-sans text-xl font-semibold tabular-nums text-primary">
                          {d.wert === null ? "—" : euro(d.wert)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.stufen[d.stufe]} · {Math.round(WAHRSCHEINLICHKEIT[d.stufe] * 100)} %
                        </span>
                      </div>
                    </div>

                    {d.warnungen.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {d.warnungen.map((w) => (
                          <Pill key={w} severity={w === "ueberfaellig" || w === "ohne-schritt" ? "critical" : "attention"}>
                            {t.warn[w]}
                          </Pill>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-1 rounded-2xl bg-muted p-4">
                      <span className="text-xs font-medium text-muted-foreground">{t.dein}</span>
                      <p className="text-sm leading-relaxed">
                        {d.naechsterSchritt ?? t.fehlt}
                        {d.faelligAm ? ` · ${datumAnzeige(d.faelligAm, intl)}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-primary">{t.zug}</span>
                      <p className="text-sm leading-relaxed text-muted-foreground">{t.zuege[d.stufe]}</p>
                    </div>

                    {entwuerfe[d.id] ? (
                      <details className="rounded-2xl bg-muted p-4">
                        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
                          <Sparkles className="size-4" aria-hidden />
                          Mailentwurf: {entwuerfe[d.id].betreff}
                        </summary>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{entwuerfe[d.id].text}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href={`mailto:?subject=${encodeURIComponent(entwuerfe[d.id].betreff)}&body=${encodeURIComponent(entwuerfe[d.id].text)}`}
                            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                          >
                            Prüfen & senden
                          </a>
                          <form action={entwurfErstellen}>
                            <input type="hidden" name="deal" value={d.id} />
                            <button type="submit" className="rounded-full bg-card px-4 py-2 text-sm">Neu entwerfen</button>
                          </form>
                        </div>
                      </details>
                    ) : null}

                    <div className="mt-auto flex flex-wrap gap-2">
                      <Link
                        href={`/admin/vertrieb/pipeline/${d.id}`}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      >
                        {t.oeffnen}
                      </Link>
                      {!entwuerfe[d.id] && (
                        <form action={entwurfErstellen}>
                          <input type="hidden" name="deal" value={d.id} />
                          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="size-4" aria-hidden />
                            Mail entwerfen
                          </button>
                        </form>
                      )}
                    </div>
                  </Surface>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="faellig" className="flex flex-col gap-4">
          <SectionHeader id="faellig" title={t.faellig} count={lage.faellig.length} />
          <Surface padding="sm">
            {lage.faellig.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.keineFaellig}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {lage.faellig.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/admin/gespraech?kontakt=${f.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2 hover:bg-muted"
                    >
                      <span className="text-sm font-medium">
                        {f.name}
                        {f.firma ? <span className="text-muted-foreground"> · {f.firma}</span> : null}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {f.was ?? ""} · {datumAnzeige(f.am, intl)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </section>

        <section aria-labelledby="anlegen" className="flex flex-col gap-4">
          <SectionHeader id="anlegen" title={t.anlegen} />
          <Surface>
            <form action={dealAnlegen} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdminField label={t.firma} htmlFor="deal-firma">
                <AdminInput id="deal-firma" name="firma" required maxLength={120} />
              </AdminField>
              <AdminField label={t.website} htmlFor="deal-website">
                <AdminInput id="deal-website" name="website" maxLength={200} placeholder="vi-sec.de" />
              </AdminField>
              <AdminField label={t.titelFeld} htmlFor="deal-titel">
                <AdminInput id="deal-titel" name="titel" required maxLength={160} />
              </AdminField>
              <AdminField label={t.wert} htmlFor="deal-wert">
                <AdminInput id="deal-wert" name="wert" type="number" min={0} step={100} inputMode="numeric" />
              </AdminField>
              <AdminField label={t.stufe} htmlFor="deal-stufe">
                <AdminSelect id="deal-stufe" name="stufe" defaultValue="qualified">
                  {OFFENE_STUFEN.map((s) => (
                    <option key={s} value={s}>
                      {t.stufen[s]}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField label={t.am} htmlFor="deal-am">
                <AdminInput id="deal-am" name="am" type="date" />
              </AdminField>
              <div className="md:col-span-2">
                <AdminField label={t.schritt} htmlFor="deal-schritt">
                  <AdminInput id="deal-schritt" name="schritt" maxLength={200} />
                </AdminField>
              </div>
              <div className="md:col-span-2">
                <AdminField label={t.notiz} htmlFor="deal-notiz">
                  <AdminTextarea id="deal-notiz" name="notiz" rows={3} maxLength={2000} />
                </AdminField>
              </div>
              <button
                type="submit"
                className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground md:col-span-2"
              >
                {t.speichern}
              </button>
            </form>
          </Surface>
        </section>
      </div>
    </AdminShell>
  )
}

function Kennzahl({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-sans text-xl font-semibold tabular-nums">{wert}</dd>
    </div>
  )
}
