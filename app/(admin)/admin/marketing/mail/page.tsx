import Link from "next/link"
import { PenLine } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { MailVersandTabelle, type KampagnenZeile } from "@/components/admin/mail-versand-tabelle"
import { ladeAnsprache, ladeKampagnenAntworten, ladeVersandListe } from "@/lib/assistent/versand"
import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader, Surface, UnavailableNote } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { empfaenger, freieKontakte, kampagnen, type Empfaenger, type FreierKontakt, type Kampagne } from "@/lib/mailing/store"

import { antwortErhalten, antwortZuruecknehmen, empfaengerHinzufuegen, empfaengerUmschalten, kontakteUebernehmen, neueKampagne } from "./actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Mail Studio" }

const T = {
  de: {
    title: "Mail Studio",
    lead: "Jede gesendete Mail an einem Ort: an wen, was, wann – und ob eine Antwort kam. Ohne Antwort legt das System nach 5 und 9 Tagen automatisch eine Nachfass-Mail zur Freigabe an.",
    neueMail: "Neue Mail",
    gesendetTitel: "Zeitleiste · Mails & Kampagnen",
    mailsGesendet: "Gesendet (60 Tage)",
    antworten: "Antworten",
    quote: "Antwortquote",
    nachfassOffen: "Nachfassen wartet",
    aktiv: "Aktive Empfänger",
    versendet: "Versendete Kampagnen",
    oeffnung: "Öffnungsrate (ungefähr)",
    klick: "Klickrate",
    kampagnen: "Kampagnen",
    neu: "Neue Kampagne",
    keine: "Noch keine Kampagne. Lege die erste an — die KI schreibt den Entwurf aus deinen Stichpunkten.",
    entwurf: "Entwurf",
    gesendet: "Versendet",
    ohneBetreff: "Ohne Betreff",
    verteiler: "Verteiler",
    einzeln: "Adresse eintragen",
    email: "E-Mail",
    name: "Name (für die Anrede)",
    basis: "Rechtsgrundlage",
    einwilligung: "Einwilligung",
    bestandskunde: "Bestandskunde (§7 Abs. 3 UWG)",
    quelle: "Nachweis / Quelle",
    quelleHint: "z. B. Formular creadig.de, 12.10.2026",
    bestaetigt: "Ich habe eine Einwilligung oder eine Kundenbeziehung mit diesem Kontakt.",
    eintragen: "Eintragen",
    ausCrm: "Aus Kontakten übernehmen",
    keineFreien: "Alle Kontakte mit E-Mail-Adresse sind bereits im Verteiler.",
    uebernehmen: "Ausgewählte übernehmen",
    leer: "Der Verteiler ist noch leer.",
    abmelden: "Abmelden",
    aktivieren: "Wieder aktiv",
    status: { aktiv: "aktiv", abgemeldet: "abgemeldet", unzustellbar: "unzustellbar" },
    db: "Datenbank nicht erreichbar",
    dbText: "Die Tabellen für Mail-Marketing (Migration 027) fehlen oder die Verbindung ist gestört.",
  },
  tr: {
    title: "Mail Studio",
    lead: "Gönderilen her e-posta tek yerde: kime, ne, ne zaman – ve yanıt geldi mi. Yanıt gelmezse sistem 5 ve 9 gün sonra otomatik takip e-postasını onaya koyar.",
    neueMail: "Yeni e-posta",
    gesendetTitel: "Zaman çizelgesi · e-postalar ve kampanyalar",
    mailsGesendet: "Gönderilen (60 gün)",
    antworten: "Yanıtlar",
    quote: "Yanıt oranı",
    nachfassOffen: "Bekleyen takip",
    aktiv: "Aktif alıcı",
    versendet: "Gönderilen kampanya",
    oeffnung: "Açılma oranı (yaklaşık)",
    klick: "Tıklama oranı",
    kampagnen: "Kampanyalar",
    neu: "Yeni kampanya",
    keine: "Henüz kampanya yok. İlkini oluştur — yapay zekâ notlarından taslağı yazar.",
    entwurf: "Taslak",
    gesendet: "Gönderildi",
    ohneBetreff: "Konusuz",
    verteiler: "Dağıtım listesi",
    einzeln: "Adres ekle",
    email: "E-posta",
    name: "İsim (hitap için)",
    basis: "Hukuki dayanak",
    einwilligung: "Onay (izin)",
    bestandskunde: "Mevcut müşteri (UWG §7/3)",
    quelle: "Kanıt / kaynak",
    quelleHint: "örn. creadig.de formu, 12.10.2026",
    bestaetigt: "Bu kişiden onayım var veya müşteri ilişkimiz var.",
    eintragen: "Ekle",
    ausCrm: "Kişilerden aktar",
    keineFreien: "E-posta adresi olan tüm kişiler zaten listede.",
    uebernehmen: "Seçilenleri aktar",
    leer: "Liste henüz boş.",
    abmelden: "Çıkar",
    aktivieren: "Tekrar aktif",
    status: { aktiv: "aktif", abgemeldet: "çıktı", unzustellbar: "ulaşılamıyor" },
    db: "Veritabanına ulaşılamıyor",
    dbText: "E-posta pazarlama tabloları (migration 027) eksik veya bağlantı bozuk.",
  },
}

function prozent(teil: number, ganz: number): string {
  return ganz > 0 ? `${Math.round((teil / ganz) * 100)} %` : "—"
}

export default async function MailMarketingSeite() {
  const { sprache, intl } = await adminSprachKontext()
  const t = sprache === "tr" ? T.tr : T.de
  const [versandListe, ansprache, kampagnenAntworten] = await Promise.all([
    ladeVersandListe(100, { kampagnen: "ohne" }).catch(() => []),
    ladeAnsprache().catch(() => ({ gesendet: 0, beantwortet: 0, quote: null, nachfassOffen: 0 })),
    ladeKampagnenAntworten().catch(() => ({}) as Record<string, number>),
  ])
  let daten: { k: Kampagne[]; e: Empfaenger[]; f: FreierKontakt[] } | null = null
  try {
    const [k, e, f] = await Promise.all([kampagnen(), empfaenger(), freieKontakte()])
    daten = { k, e, f }
  } catch {
    daten = null
  }

  if (!daten) {
    return (
      <AdminShell title={t.title} lead={t.lead}>
        <UnavailableNote title={t.db}>{t.dbText}</UnavailableNote>
      </AdminShell>
    )
  }

  const datum = new Intl.DateTimeFormat(intl, { dateStyle: "medium", timeZone: "Europe/Berlin" })
  const versendet = daten.k.filter((k) => k.status === "versendet")
  const summeGesendet = versendet.reduce((s, k) => s + k.gesendet, 0)
  const aktive = daten.e.filter((e) => e.status === "aktiv").length

  const kampagnenZeilen: KampagnenZeile[] = daten.k.map((k) => ({
    id: k.id,
    subject: k.subject,
    preheader: k.preheader,
    datum: k.sentAt ?? k.updatedAt,
    status: k.status,
    recipientsCount: k.recipientsCount,
    gesendet: k.gesendet,
    geoeffnet: k.geoeffnet,
    geklickt: k.geklickt,
    antworten: kampagnenAntworten[k.id] ?? 0,
  }))

  const kennzahlen = [
    { label: t.mailsGesendet, wert: String(ansprache.gesendet) },
    { label: t.antworten, wert: String(ansprache.beantwortet) },
    { label: t.quote, wert: ansprache.quote === null ? "—" : `${ansprache.quote} %` },
    { label: t.nachfassOffen, wert: String(ansprache.nachfassOffen) },
  ]

  return (
    <AdminShell
      title={t.title}
      lead={t.lead}
      meta={
        <Link
          href="/admin/marketing/mail/einzel"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        >
          <PenLine className="size-4" aria-hidden="true" />
          {t.neueMail}
        </Link>
      }
    >
      <div className="flex flex-col gap-10">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kennzahlen.map((z) => (
            <Surface key={z.label} padding="sm">
              <dt className="text-meta text-muted-foreground">{z.label}</dt>
              <dd className="font-display text-primary mt-1 text-2xl font-semibold tabular-nums">{z.wert}</dd>
            </Surface>
          ))}
        </dl>

        <section aria-labelledby="gesendet" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SectionHeader id="gesendet" title={t.gesendetTitel} count={versandListe.length + daten.k.length} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {versendet.length > 0 && (
                <span className="text-meta text-muted-foreground">
                  {t.aktiv} {aktive} · {t.oeffnung} {prozent(versendet.reduce((s, k) => s + k.geoeffnet, 0), summeGesendet)} · {t.klick}{" "}
                  {prozent(versendet.reduce((s, k) => s + k.geklickt, 0), summeGesendet)}
                </span>
              )}
              <form action={neueKampagne}>
                <button className="border-primary/40 text-primary rounded-full border px-4 py-2 text-sm font-medium">{t.neu}</button>
              </form>
            </div>
          </div>
          <MailVersandTabelle zeilen={versandListe} kampagnen={kampagnenZeilen} sprache={sprache === "tr" ? "tr" : "de"} intl={intl} antwortAktion={antwortErhalten} rueckgaengigAktion={antwortZuruecknehmen} />
        </section>

        <section aria-labelledby="verteiler" className="flex flex-col gap-4">
          <SectionHeader id="verteiler" title={t.verteiler} count={`${aktive} / ${daten.e.length}`} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Surface>
              <form action={empfaengerHinzufuegen} className="flex flex-col gap-4">
                <h3 className="text-subhead text-sm">{t.einzeln}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminField label={t.email} htmlFor="m-email">
                    <AdminInput id="m-email" name="email" type="email" required autoComplete="off" />
                  </AdminField>
                  <AdminField label={t.name} htmlFor="m-name">
                    <AdminInput id="m-name" name="name" autoComplete="off" />
                  </AdminField>
                </div>
                <BasisFelder t={t} prefix="m" />
                <button className="bg-primary text-primary-foreground self-start rounded-full px-4 py-2 text-sm font-medium">{t.eintragen}</button>
              </form>
            </Surface>

            <Surface>
              <form action={kontakteUebernehmen} className="flex flex-col gap-4">
                <h3 className="text-subhead text-sm">{t.ausCrm}</h3>
                {daten.f.length === 0 ? (
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.keineFreien}</p>
                ) : (
                  <>
                    <fieldset className="border-line max-h-48 overflow-y-auto rounded-xl border">
                      <legend className="sr-only">{t.ausCrm}</legend>
                      {daten.f.map((c) => (
                        <label key={c.id} className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                          <input type="checkbox" name="kontakt" value={c.id} className="accent-[var(--gold)]" />
                          <span className="min-w-0 flex-1 truncate">
                            {c.name}
                            {c.firma ? <span className="text-muted-foreground"> · {c.firma}</span> : null}
                          </span>
                          <span className="text-meta text-muted-foreground hidden max-w-[45%] truncate sm:block">{c.email}</span>
                        </label>
                      ))}
                    </fieldset>
                    <BasisFelder t={t} prefix="c" />
                    <button className="bg-primary text-primary-foreground self-start rounded-full px-4 py-2 text-sm font-medium">{t.uebernehmen}</button>
                  </>
                )}
              </form>
            </Surface>
          </div>

          {daten.e.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t.leer}</p>
          ) : (
            <ul className="border-line divide-line flex flex-col divide-y rounded-xl border">
              {daten.e.map((e) => (
                <li key={e.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{e.name ?? e.email}</span>
                    <span className="text-meta text-muted-foreground block truncate">
                      {e.name ? `${e.email} · ` : ""}
                      {e.basis === "einwilligung" ? t.einwilligung : t.bestandskunde} · {e.source} · {datum.format(new Date(e.consentAt))}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <Pill severity={e.status === "aktiv" ? "neutral" : "critical"}>{t.status[e.status]}</Pill>
                    {e.status !== "unzustellbar" && (
                      <form action={empfaengerUmschalten}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="status" value={e.status === "aktiv" ? "abgemeldet" : "aktiv"} />
                        <button className="text-meta text-muted-foreground hover:text-foreground underline underline-offset-4">
                          {e.status === "aktiv" ? t.abmelden : t.aktivieren}
                        </button>
                      </form>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function BasisFelder({ t, prefix }: { t: (typeof T)["de"]; prefix: string }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label={t.basis} htmlFor={`${prefix}-basis`}>
          <AdminSelect id={`${prefix}-basis`} name="basis" defaultValue="einwilligung">
            <option value="einwilligung">{t.einwilligung}</option>
            <option value="bestandskunde">{t.bestandskunde}</option>
          </AdminSelect>
        </AdminField>
        <AdminField label={t.quelle} htmlFor={`${prefix}-quelle`}>
          <AdminInput id={`${prefix}-quelle`} name="quelle" required minLength={3} placeholder={t.quelleHint} />
        </AdminField>
      </div>
      <label className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed">
        <input type="checkbox" name="bestaetigt" value="1" required className="mt-1 accent-[var(--gold)]" />
        {t.bestaetigt}
      </label>
    </>
  )
}
