"use client"

import { useActionState, useRef } from "react"

import { assistentFragen, type AssistentAntwort } from "@/app/(finanz)/finanz/actions"

const SCHNELL = [
  "Was ist diesen Monat das Wichtigste?",
  "Kann ich mir eine Investition von 5.000 € leisten?",
  "Wie viel muss ich fürs Finanzamt zurücklegen?",
  "Wie komme ich auf 12 Monate Reichweite?",
]

export function FinanzAssistent() {
  const [zustand, senden, laeuft] = useActionState<AssistentAntwort, FormData>(assistentFragen, null)
  const formRef = useRef<HTMLFormElement>(null)
  const feldRef = useRef<HTMLTextAreaElement>(null)

  function schnell(text: string) {
    if (!feldRef.current || laeuft) return
    feldRef.current.value = text
    formRef.current?.requestSubmit()
  }

  return (
    <section aria-labelledby="assistent-titel" className="bg-card rounded-[2rem] flex flex-col gap-5 p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="assistent-titel" className="text-subhead text-lg">
          Finanzassistent
        </h2>
        <p className="type-small text-muted-foreground max-w-2xl text-pretty">
          Sieht alle Zahlen dieser Seite, rechnet mit ihnen und empfiehlt. Er entscheidet und bucht nichts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCHNELL.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => schnell(s)}
            disabled={laeuft}
            className="border-border text-muted-foreground hover:border-primary hover:text-foreground rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form ref={formRef} action={senden} className="flex flex-col gap-3">
        <label htmlFor="assistent-frage" className="sr-only">
          Frage an den Finanzassistenten
        </label>
        <textarea
          ref={feldRef}
          id="assistent-frage"
          name="frage"
          rows={2}
          maxLength={1000}
          required
          placeholder="Frag etwas – Deutsch oder Türkisch …"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-y rounded-2xl border px-3 py-2 text-base leading-relaxed focus-visible:ring-2 focus-visible:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="type-small text-muted-foreground">Enter senden · Shift+Enter neue Zeile</span>
          <button
            type="submit"
            disabled={laeuft}
            className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {laeuft ? "Denkt nach …" : "Fragen"}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {zustand && "fehler" in zustand && <p className="text-destructive text-sm">{zustand.fehler}</p>}
        {zustand && "antwort" in zustand && (
          <article className="border-primary/40 bg-background flex flex-col gap-3 rounded-2xl border p-4">
            <p className="type-small text-primary">{zustand.frage}</p>
            <div className="text-foreground text-base leading-relaxed whitespace-pre-wrap">{zustand.antwort}</div>
          </article>
        )}
      </div>
    </section>
  )
}
