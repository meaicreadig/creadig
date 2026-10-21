"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { Check, Loader2 } from "lucide-react"

const EREIGNIS = "creadig:aktion-fertig"

function melde(text: string) {
  window.dispatchEvent(new CustomEvent(EREIGNIS, { detail: text }))
}

/**
 * Absende-Knopf mit spürbarer Rückmeldung: drückt sich ein, dreht während
 * der Server arbeitet und meldet danach unten rechts „erledigt“ — auch wenn
 * die Karte nach dem Neuladen verschwindet (Meldung beim Aushängen).
 *
 * `nurWenn`/`nichtWenn` unterscheiden zwei Knöpfe im selben Formular über den
 * gesendeten `status`-Wert (z. B. Freigeben vs. Verwerfen in der Mailkarte).
 */
export function AktionKnopf({
  children,
  className = "",
  laeuft = "Wird ausgeführt …",
  fertig = "Erledigt",
  name,
  value,
  formAction,
  formNoValidate,
  nurWenn,
  nichtWenn,
}: {
  children: ReactNode
  className?: string
  laeuft?: string
  fertig?: string
  name?: string
  value?: string
  formAction?: (form: FormData) => void | Promise<void>
  formNoValidate?: boolean
  nurWenn?: string
  nichtWenn?: string
}) {
  const { pending, data } = useFormStatus()
  /* Welcher Knopf gedrückt wurde, merkt sich der Knopf selbst – der mitgeschickte Wert kommt nicht in jedem Browser an. */
  const [geklickt, setGeklickt] = useState(false)
  useEffect(() => {
    if (!pending) setGeklickt(false)
  }, [pending])
  const status = data ? data.getAll("status").map(String) : []
  const ueberWert = (!nurWenn || status.includes(nurWenn)) && (!nichtWenn || !status.includes(nichtWenn))
  const meins = pending && (geklickt || (!nurWenn && !nichtWenn && ueberWert))

  const lief = useRef(false)
  const text = useRef(fertig)
  text.current = fertig

  useEffect(() => {
    if (meins) {
      lief.current = true
      return
    }
    if (lief.current) {
      lief.current = false
      melde(text.current)
    }
  }, [meins])

  useEffect(
    () => () => {
      if (lief.current) melde(text.current)
    },
    [],
  )

  return (
    <button
      type="submit"
      name={name}
      value={value}
      formAction={formAction}
      formNoValidate={formNoValidate}
      onClick={() => setGeklickt(true)}
      disabled={pending}
      aria-busy={meins || undefined}
      className={`${className} transition-transform duration-150 active:scale-95 disabled:cursor-wait ${pending && !meins ? "opacity-50" : ""}`}
    >
      {meins ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {laeuft}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/** Einmal pro Seite: zeigt die Bestätigung, die ein AktionKnopf meldet. */
export function AktionMeldung() {
  const [meldung, setMeldung] = useState<{ text: string; n: number } | null>(null)

  useEffect(() => {
    let zaehler = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const hoeren = (e: Event) => {
      zaehler += 1
      setMeldung({ text: String((e as CustomEvent).detail ?? "Erledigt"), n: zaehler })
      clearTimeout(timer)
      timer = setTimeout(() => setMeldung(null), 3500)
    }
    window.addEventListener(EREIGNIS, hoeren)
    return () => {
      window.removeEventListener(EREIGNIS, hoeren)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:justify-end sm:px-6">
      {meldung ? (
        <p
          key={meldung.n}
          className="flex animate-in items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg fade-in slide-in-from-bottom-4 duration-300"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/20">
            <Check className="size-3.5" aria-hidden="true" />
          </span>
          {meldung.text}
        </p>
      ) : null}
    </div>
  )
}
