"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MessageSquare, X, ArrowUp } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Turn = { role: "assistant" | "user"; text: string }

/**
 * Regelbasierter Demo-Assistent. Bewusst ohne Modell-Anbindung:
 * die Antworten sind kuratiert und in der UI als Demo gekennzeichnet.
 *
 * TODO: API — hier später einen Server-Route-Handler (`app/api/chat`) gegen
 * die Claude-API anbinden. Bis dahin blockiert der Assistent nichts: Er
 * antwortet sofort und verweist im Zweifel auf WhatsApp.
 */
function pickAnswer(input: string, t: ReturnType<typeof useLocale>["t"]) {
  const q = input.toLowerCase()
  if (/preis|kost|paket|teuer|budget|fiyat|ücret|paket|bütçe/.test(q)) return t.chat.answerPrice
  if (/meai|me ai|ki-os|betriebssystem|işletim/.test(q)) return t.chat.answerMeai
  if (/schweiz|zürich|isviçre|isviçre|ch\b|cassamea/.test(q)) return t.chat.answerSwiss
  if (/ablauf|prozess|wie lang|dauer|süre|nasıl|aşama/.test(q)) return t.chat.answerProcess
  return t.chat.answerFallback
}

export function AiAssistant() {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Kontaktsektion und Navigation können den Assistenten öffnen.
  useEffect(() => {
    function onOpen() {
      setOpen(true)
    }
    window.addEventListener("creadig:open-assistant", onOpen)
    return () => window.removeEventListener("creadig:open-assistant", onOpen)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [turns])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const ask = useCallback(
    (question: string) => {
      const text = question.trim()
      if (!text) return
      setDraft("")
      setTurns((prev) => [...prev, { role: "user", text }])
      window.setTimeout(() => {
        setTurns((prev) => [...prev, { role: "assistant", text: pickAnswer(text, t) }])
      }, 420)
    },
    [t],
  )

  return (
    <>
      {/* Auslöser */}
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="creadig-assistant"
        className="fixed right-5 bottom-5 z-50 h-auto gap-2.5 rounded-none border border-foreground/15 bg-foreground px-5 py-3.5 text-background shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45)] hover:bg-foreground/90 md:right-8 md:bottom-8"
      >
        {open ? (
          <X className="size-4" strokeWidth={1.5} data-icon="inline-start" />
        ) : (
          <MessageSquare className="size-4" strokeWidth={1.5} data-icon="inline-start" />
        )}
        <span className="eyebrow">
          {open ? t.chat.close : t.chat.open}
        </span>
      </Button>

      {/* Panel */}
      <div
        id="creadig-assistant"
        role="dialog"
        aria-modal="false"
        aria-label={t.chat.title}
        hidden={!open}
        className={cn(
          "border-line-strong bg-background fixed right-5 bottom-24 z-50 flex w-[calc(100vw-2.5rem)] max-w-[24.5rem] flex-col border shadow-[0_28px_80px_-24px_rgba(0,0,0,0.5)] md:right-8 md:bottom-28",
        )}
      >
        <div className="border-line flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <p className="text-subhead text-base">{t.chat.title}</p>
            <p className="text-muted-foreground mt-1 text-xs">{t.chat.subtitle}</p>
          </div>
          <span aria-hidden="true" className="bg-gold mt-1.5 size-1.5 rounded-full" />
        </div>

        <div ref={scrollRef} className="flex max-h-[22rem] flex-col gap-4 overflow-y-auto px-5 py-5">
          <p className="type-body text-foreground/85">{t.chat.greeting}</p>

          {turns.map((turn, i) => (
            <div
              key={i}
              className={cn(
                "type-body max-w-[88%] px-4 py-3",
                turn.role === "user"
                  ? "bg-foreground text-background self-end"
                  : "border-line-strong self-start border",
              )}
            >
              {turn.text}
            </div>
          ))}

          {turns.length === 0 && (
            <div className="mt-1 flex flex-col gap-px">
              {t.chat.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="border-line hover:border-gold hover:text-foreground text-muted-foreground border-t py-3 text-left text-sm transition-colors duration-400"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="border-line flex items-center gap-2 border-t px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            ask(draft)
          }}
        >
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.chat.placeholder}
            aria-label={t.chat.placeholder}
            className="h-auto rounded-none border-0 bg-transparent px-2 py-2.5 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!draft.trim()}
            aria-label={t.chat.send}
            className="bg-foreground text-background hover:bg-foreground/90 size-9 shrink-0 rounded-none"
          >
            <ArrowUp className="size-4" strokeWidth={1.5} />
          </Button>
        </form>

        <p className="text-muted-foreground border-line text-meta border-t px-5 py-2.5">
          {t.chat.demoNote}
        </p>
      </div>
    </>
  )
}
