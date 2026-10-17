"use client"

import { useActionState, useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { mahnungEntwerfen } from "@/app/(finanz)/finanz/auftraege/actions"
import { AdminInput } from "@/components/admin/primitives"

/**
 * Persönlicher KI-Mahnungsentwurf (nicht die feste Mahnstufen-Vorlage, siehe
 * mahnungEntwerfen()) — für schwierige Einzelfälle, wo ein persönlicher Ton
 * mehr bringt als die Standard-Vorlage. Wird nie automatisch verschickt: der
 * Entwurf landet editierbar hier, Muhammed kopiert und verschickt ihn selbst.
 */
export function MahnEntwurf({ id }: { id: string }) {
  const [ergebnis, aktion, sendetGerade] = useActionState(mahnungEntwerfen, null)
  const [text, setText] = useState("")
  const [kopiert, setKopiert] = useState(false)

  useEffect(() => {
    if (ergebnis && "entwurf" in ergebnis) setText(ergebnis.entwurf)
  }, [ergebnis])

  return (
    <details className="bg-background rounded-3xl px-4 py-3">
      <summary className="text-muted-foreground cursor-pointer py-1 text-sm">KI-Entwurf für eine persönliche Nachricht …</summary>
      <form action={aktion} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Notiz (optional) — z. B. „Kunde bat telefonisch um Aufschub&rdquo;
          <AdminInput name="notiz" placeholder="optional" className="w-full" />
        </label>
        <button disabled={sendetGerade} className="bg-secondary text-secondary-foreground self-start rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60">
          {sendetGerade ? "Entwirft …" : "Entwurf erstellen"}
        </button>
      </form>
      {ergebnis && "fehler" in ergebnis && <p className="text-destructive mt-2 text-xs">{ergebnis.fehler}</p>}
      {text && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="border-border bg-card text-foreground w-full resize-y rounded-2xl border px-3 py-2 text-sm leading-relaxed"
          />
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(text)
              setKopiert(true)
              setTimeout(() => setKopiert(false), 2000)
            }}
            className="bg-primary text-primary-foreground inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            {kopiert ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
            {kopiert ? "Kopiert" : "Entwurf kopieren"}
          </button>
          <p className="text-muted-foreground text-xs">
            Nur ein Entwurf — nichts wurde verschickt. Bearbeite ihn frei und verschicke ihn selbst, z. B. per Mail oder WhatsApp.
          </p>
        </div>
      )}
    </details>
  )
}
