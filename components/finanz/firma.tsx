import { firmaSpeichern } from "@/app/(finanz)/finanz/auftraege/actions"
import { AdminField, AdminInput } from "@/components/admin/primitives"
import type { Firma } from "@/lib/finanz/auftraege/store"

/**
 * Firmendaten für Angebote/Rechnungen (§ 14 Abs. 4 UStG). Beide Steuerfälle
 * brauchen dieselben Felder — der Unterschied steckt im Hinweistext und
 * darin, ob die USt-IdNr. Pflicht wird (Reverse Charge, EU-B2B).
 */
export function FinanzFirma({ firma, ustPflichtig }: { firma: Firma; ustPflichtig: boolean }) {
  const vollstaendig = Boolean(firma.strasse.trim() && firma.plzOrt.trim() && firma.iban.trim() && (firma.steuernummer.trim() || firma.ustId.trim()))
  return (
    <details className="bg-card rounded-[2rem] p-5" open={!vollstaendig}>
      <summary className="text-subhead cursor-pointer text-base">Firmendaten für Angebote &amp; Rechnungen</summary>
      <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">
        {ustPflichtig
          ? "Umsatzsteuerpflichtig: Rechnungen weisen USt aus. Für Kunden mit EU-USt-IdNr. (Reverse Charge) ist deine eigene USt-IdNr. Pflicht."
          : "Kleinunternehmer nach § 19 UStG: Rechnungen weisen keine Umsatzsteuer aus. Die Steuernummer bleibt trotzdem Pflichtangabe."}
      </p>
      <form action={firmaSpeichern} className="mt-5 grid gap-4 md:grid-cols-3">
        <AdminField label="Inhaber" htmlFor="f-inhaber">
          <AdminInput id="f-inhaber" name="inhaber" required defaultValue={firma.inhaber} maxLength={160} />
        </AdminField>
        <AdminField label="Straße, Hausnummer" htmlFor="f-strasse">
          <AdminInput id="f-strasse" name="strasse" required defaultValue={firma.strasse} maxLength={160} />
        </AdminField>
        <AdminField label="PLZ, Ort" htmlFor="f-plzOrt">
          <AdminInput id="f-plzOrt" name="plzOrt" required defaultValue={firma.plzOrt} maxLength={120} placeholder="12345 Musterstadt" />
        </AdminField>
        <AdminField label="E-Mail" htmlFor="f-email">
          <AdminInput id="f-email" name="email" type="email" required defaultValue={firma.email} maxLength={200} />
        </AdminField>
        <AdminField label="Telefon" htmlFor="f-telefon">
          <AdminInput id="f-telefon" name="telefon" required defaultValue={firma.telefon} maxLength={60} />
        </AdminField>
        <AdminField label="Web" htmlFor="f-web">
          <AdminInput id="f-web" name="web" defaultValue={firma.web} maxLength={200} />
        </AdminField>
        <AdminField label="Steuernummer" htmlFor="f-steuernummer">
          <AdminInput id="f-steuernummer" name="steuernummer" defaultValue={firma.steuernummer} maxLength={30} placeholder="12/345/67890" />
        </AdminField>
        <AdminField label={ustPflichtig ? "USt-IdNr. (Pflicht bei Reverse Charge)" : "USt-IdNr. (optional)"} htmlFor="f-ustId">
          <AdminInput id="f-ustId" name="ustId" defaultValue={firma.ustId} maxLength={30} placeholder="DE123456789" />
        </AdminField>
        <AdminField label="Bank" htmlFor="f-bank">
          <AdminInput id="f-bank" name="bank" defaultValue={firma.bank} maxLength={120} />
        </AdminField>
        <AdminField label="IBAN" htmlFor="f-iban">
          <AdminInput id="f-iban" name="iban" required defaultValue={firma.iban} maxLength={34} placeholder="DE00 0000 0000 0000 0000 00" />
        </AdminField>
        <AdminField label="BIC" htmlFor="f-bic">
          <AdminInput id="f-bic" name="bic" defaultValue={firma.bic} maxLength={11} />
        </AdminField>
        <div className="flex items-end">
          <button type="submit" className="bg-gold text-background rounded-full px-4 py-2 text-sm font-medium">
            Speichern
          </button>
        </div>
      </form>
    </details>
  )
}
