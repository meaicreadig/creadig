"use client"

import { useActionState, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, Upload } from "lucide-react"

import { auslesen, hochladen } from "@/app/(finanz)/finanz/belege/actions"
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/primitives"
import { GESCHAEFTSFELDER, HAND_UPLOAD_MAX_BYTES, HAND_UPLOAD_TYPEN } from "@/lib/finanz/beleg-felder"

const ANNEHMEN = HAND_UPLOAD_TYPEN.join(",")
const MAX_MB = Math.round(HAND_UPLOAD_MAX_BYTES / 1024 / 1024)

/**
 * Beleg selbst hochladen (Phase 2) — Drag & Drop oder Handy-Kamera. Die KI
 * liest optional vor, der Mensch bestaetigt immer: kein Feld wird
 * uebernommen, ohne dass es im Formular sichtbar steht und editierbar bleibt.
 */
export function BelegUpload({ bereit, kiBereit }: { bereit: boolean; kiBereit: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dateiName, setDateiName] = useState<string | null>(null)
  const [liestAus, setLiestAus] = useState(false)
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [felder, setFelder] = useState({ datum: "", haendler: "", betrag: "", ustSatz: "19", kategorie: "", geschaeftsfeld: "", notiz: "" })
  const [ergebnis, aktion, sendetGerade] = useActionState(hochladen, null)

  if (!bereit) {
    return (
      <p className="text-muted-foreground bg-card rounded-3xl p-6 text-sm leading-relaxed shadow-sm">
        Eigener Beleg-Upload ist noch nicht eingerichtet (BLOB_READ_WRITE_TOKEN fehlt) — optionales Modul, siehe .env.example.
      </p>
    )
  }

  async function dateiGewaehlt(datei: File | undefined) {
    if (!datei) return
    setDateiName(datei.name)
    setHinweis(null)
    if (!kiBereit) return
    setLiestAus(true)
    try {
      const fd = new FormData()
      fd.set("datei", datei)
      const r = await auslesen(fd)
      if (r.ok) {
        setFelder((f) => ({
          ...f,
          datum: r.vorschlag.datum ?? f.datum,
          haendler: r.vorschlag.haendler ?? f.haendler,
          betrag: r.vorschlag.bruttoCent !== null ? (r.vorschlag.bruttoCent / 100).toFixed(2).replace(".", ",") : f.betrag,
          ustSatz: r.vorschlag.ustSatz !== null ? String(r.vorschlag.ustSatz) : f.ustSatz,
          kategorie: r.vorschlag.kategorie ?? f.kategorie,
        }))
        setHinweis("Vorschlag der KI eingetragen — bitte prüfen und bei Bedarf korrigieren.")
      } else {
        setHinweis(r.fehler)
      }
    } finally {
      setLiestAus(false)
    }
  }

  return (
    <section aria-labelledby="upload-titel" className="bg-card flex flex-col gap-5 rounded-3xl p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-1">
        <h2 id="upload-titel" className="text-xl font-semibold tracking-tight">
          Beleg hochladen
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Foto mit dem Handy oder Datei hierher ziehen — PDF, JPG, PNG oder HEIC, max. {MAX_MB} MB.
        </p>
      </div>

      <form
        action={aktion}
        onSubmit={() => setHinweis(null)}
        className="flex flex-col gap-4"
        onDrop={(e) => {
          e.preventDefault()
          const datei = e.dataTransfer.files?.[0]
          if (datei && inputRef.current) {
            const dt = new DataTransfer()
            dt.items.add(datei)
            inputRef.current.files = dt.files
            void dateiGewaehlt(datei)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <label
          htmlFor="beleg-datei"
          className="border-border bg-background hover:border-primary flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors"
        >
          <Upload className="text-muted-foreground size-6" aria-hidden />
          <span className="text-sm font-medium">{dateiName ?? "Datei auswählen, Foto aufnehmen oder hierher ziehen"}</span>
          {liestAus && (
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> KI liest den Beleg aus …
            </span>
          )}
          <input
            ref={inputRef}
            id="beleg-datei"
            name="datei"
            type="file"
            accept={ANNEHMEN}
            capture="environment"
            required
            className="sr-only"
            onChange={(e) => dateiGewaehlt(e.target.files?.[0])}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <AdminField label="Datum" htmlFor="b-datum">
            <AdminInput id="b-datum" name="datum" type="date" value={felder.datum} onChange={(e) => setFelder((f) => ({ ...f, datum: e.target.value }))} />
          </AdminField>
          <AdminField label="Händler" htmlFor="b-haendler">
            <AdminInput id="b-haendler" name="haendler" value={felder.haendler} onChange={(e) => setFelder((f) => ({ ...f, haendler: e.target.value }))} />
          </AdminField>
          <AdminField label="Betrag brutto (€)" htmlFor="b-betrag">
            <AdminInput id="b-betrag" name="betrag" inputMode="decimal" required value={felder.betrag} onChange={(e) => setFelder((f) => ({ ...f, betrag: e.target.value }))} />
          </AdminField>
          <AdminField label="USt-Satz" htmlFor="b-ust">
            <AdminSelect id="b-ust" name="ustSatz" value={felder.ustSatz} onChange={(e) => setFelder((f) => ({ ...f, ustSatz: e.target.value }))}>
              <option value="19">19 %</option>
              <option value="7">7 %</option>
              <option value="0">0 %</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Kategorie" htmlFor="b-kat">
            <AdminInput id="b-kat" name="kategorie" placeholder="z. B. Büro, Reise, Software" value={felder.kategorie} onChange={(e) => setFelder((f) => ({ ...f, kategorie: e.target.value }))} />
          </AdminField>
          <AdminField label="Geschäftsfeld (optional)" htmlFor="b-feld">
            <AdminSelect id="b-feld" name="geschaeftsfeld" value={felder.geschaeftsfeld} onChange={(e) => setFelder((f) => ({ ...f, geschaeftsfeld: e.target.value }))}>
              <option value="">— im Eingangskorb zuordnen —</option>
              {GESCHAEFTSFELDER.map((g) => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </AdminSelect>
          </AdminField>
        </div>
        <AdminField label="Notiz (optional)" htmlFor="b-notiz">
          <AdminTextarea id="b-notiz" name="notiz" rows={2} value={felder.notiz} onChange={(e) => setFelder((f) => ({ ...f, notiz: e.target.value }))} />
        </AdminField>

        {hinweis && (
          <p className="bg-secondary text-secondary-foreground flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm">
            <Sparkles className="size-4 shrink-0" aria-hidden /> {hinweis}
          </p>
        )}
        {ergebnis && !ergebnis.ok && <p className="text-destructive text-sm">{ergebnis.fehler}</p>}
        {ergebnis?.ok && (
          <p className="text-primary text-sm font-medium">
            {ergebnis.doppelt ? "Dieser Beleg liegt schon vor (gleiche Prüfsumme) — keine zweite Kopie angelegt." : "Hochgeladen."}
          </p>
        )}

        <button
          type="submit"
          disabled={sendetGerade}
          onClick={() => router.refresh()}
          className="bg-primary text-primary-foreground inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {sendetGerade ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
          {sendetGerade ? "Lädt hoch …" : "Beleg speichern"}
        </button>
      </form>
    </section>
  )
}
