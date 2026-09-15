"use client"

import type { ReactNode } from "react"
import { useLocale } from "@/components/locale-provider"
import { PROOF_KINDS, type ProofKind } from "@/lib/proof"

/**
 * DAS ARTEFAKT — wie ein echter Beleg auf dieser Seite gezeigt wird.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DAS PROBLEM, DAS ES LOEST
 *
 * Gemessen am 15.09.2026 ueber achtzehn oeffentliche Routen: neun Artefakte
 * insgesamt, und zwoelf Routen ganz ohne. Auf `/produkte` lagen vier echte
 * Produktaufnahmen — ohne Rahmen, ohne Bildunterschrift, ohne ein Wort
 * dazu, was sie belegen. Ein Bild ohne diese Angabe ist kein Beleg; es ist
 * Dekoration, die zufaellig echt ist.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * VIER FRAGEN, DIE JEDES ARTEFAKT BEANTWORTET
 *
 *   1 · Was ist das?            `was`
 *   2 · Warum steht es hier?    der Ort, an dem es steht
 *   3 · Was belegt es?          `rang` — die Beleg-Art
 *   4 · Was belegt es NICHT?    `grenze`, sonst aus dem Kanon
 *
 * Die vierte ist die, die sonst fehlt. Sie steht deshalb nicht im
 * Kleingedruckten, sondern in derselben Bildunterschrift wie die dritte.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE RANGFOLGE IST NICHT NEU ERFUNDEN
 *
 * Die drei oberen Raenge sind woertlich `PROOF_KINDS` aus `lib/proof.ts`,
 * also `docs/ops/proof-kinds.md` in ausfuehrbarer Form. Sie werden hier
 * BENUTZT und nicht nachgebaut — ein zweiter Beleg-Kanon waere genau die
 * Sorte Dopplung, an der Wahrheit auseinanderlaeuft.
 *
 * Zwei Raenge kommen dazu, und sie stehen ausdruecklich UNTER den dreien:
 *
 *   `eigenpruefung`  Wir haben uns selbst geprueft. Nachvollziehbar, aber
 *                    niemand ausser uns hat es bestaetigt.
 *   `modell`         Eine Rechnung oder Zeichnung. Belegt eine Struktur,
 *                    kein Ergebnis.
 *
 * Sie sind Darstellungs-Raenge, keine Beleg-Arten. Deshalb stehen sie nicht
 * in `PROOF_KINDS`: Dort steht, was ein Dritter bestaetigen muss — und bei
 * diesen beiden gibt es keinen Dritten.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER NICHT PASSIERT
 *
 * Kein leerer Rahmen, kein „demnaechst", keine Geraete-Attrappe. Wo kein
 * echtes Material liegt, steht dieses Bauteil gar nicht — und die Seite
 * sagt in Worten, warum. Ein Rahmen um nichts ist ein Versprechen ohne
 * Deckung.
 */

/** Die drei Beleg-Arten aus dem Kanon, plus zwei Darstellungs-Raenge darunter. */
export type ArtefaktRang = ProofKind | "eigenpruefung" | "modell"

/**
 * Die Rangfolge, in der ein Dritter Belege gewichtet.
 *
 * Kleiner ist staerker. Sie wird nicht angezeigt — sie sorgt dafuer, dass
 * ein Modell nie aussieht wie ein Kundenergebnis.
 */
export const ARTEFAKT_RANG: Record<ArtefaktRang, number> = {
  kundenergebnis: 1,
  kundenprojekt: 2,
  "eigenes-produkt": 3,
  eigenpruefung: 4,
  modell: 5,
}

export function Artefakt({
  rang,
  was,
  grenze,
  quelle,
  children,
  randlos = false,
}: {
  rang: ArtefaktRang
  /** Was ist das? Ein Satz, in der Sprache der Seite. */
  was: string
  /** Was belegt es NICHT? Fehlt der Satz, traegt ihn der Kanon. */
  grenze?: string
  /** Woher es stammt und wann — eine Tatsache ohne Datum verfaellt leise. */
  quelle?: string
  children: ReactNode
  /** Fuer Inhalte, die ihren eigenen Rahmen mitbringen (z. B. eine Rechnung). */
  randlos?: boolean
}) {
  const { t } = useLocale()
  const copy = t.artefakt

  const kanon = rang in PROOF_KINDS ? PROOF_KINDS[rang as ProofKind] : null
  const grenzText = grenze ?? kanon?.belegtNicht ?? null

  return (
    <figure className="w-full">
      <div
        className={
          randlos
            ? ""
            : "border-line bg-surface elevation-1 relative w-full overflow-hidden rounded-lg border"
        }
      >
        {children}
      </div>

      {/*
        Die Bildunterschrift ist der eigentliche Beleg.

        Sie steht UNTER dem Artefakt und nicht darueber: Erst sieht der Leser,
        was es gibt, dann liest er, was es ist und was es nicht ist. Umgekehrt
        entwertet die Einschraenkung den Beleg, bevor er gewirkt hat.
      */}
      <figcaption className="mt-4 flex flex-col gap-2">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="eyebrow text-gold-text">{copy.rangLabel[rang]}</span>
          <span className="type-small text-foreground/85 text-pretty">{was}</span>
        </span>

        {grenzText && (
          <span className="text-meta text-muted-foreground text-pretty">
            {copy.grenzeLabel} {grenzText}
          </span>
        )}

        {quelle && <span className="text-meta text-muted-foreground">{quelle}</span>}
      </figcaption>
    </figure>
  )
}
