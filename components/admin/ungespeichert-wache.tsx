"use client"

import { useEffect } from "react"

/**
 * ADM-07 · A28 — EIN UNGESPEICHERTES FORMULAR VERSCHWINDET NICHT STILL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER FALL, DEN ES BISHER NICHT GAB
 *
 * Im Admin wird getippt und dann geklickt: eine Notiz, ein nächster Schritt,
 * ein Angebotsentwurf. Wer dabei in der Seitenleiste auf einen anderen
 * Bereich klickt, verliert das Getippte — ohne Nachfrage, ohne Spur. Beim
 * zweiten Mal tippt derselbe Mensch nicht mehr in das Feld, sondern in eine
 * Notiz-App, und ab da lebt die Wahrheit ausserhalb des Systems.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM EINE WACHE FÜR ALLE STATT EINES HAKENS JE FORMULAR
 *
 * Ein Formular, das vergessen wird, ist genau das Formular, das den Schaden
 * anrichtet. Deshalb hängt die Wache am Dokument: Sie sieht jede Eingabe in
 * jedem Formular dieser Oberfläche, auch in dem, das morgen dazukommt. Ein
 * Formular, das ausdrücklich nicht bewacht werden soll (Suche, Filter),
 * sagt das mit `data-wache="aus"` — eine Ausnahme, die man schreiben muss,
 * keine, die man vergisst.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ZWEI WEGE HINAUS, ZWEI SPERREN
 *
 *   1 · Fenster schliessen / Adresse ändern → `beforeunload`. Der Browser
 *       stellt die Frage selbst; eigener Text ist dort seit Jahren nicht
 *       mehr möglich, und das ist in Ordnung.
 *   2 · Ein Link innerhalb der Oberfläche → der Browser fragt hier NICHT,
 *       weil die Seite gar nicht verlassen wird. Diese Frage stellt die
 *       Wache selbst, in der Sprache des Hauses.
 *
 * Gespeichert wird nichts automatisch: Was der Mensch nicht abgeschickt hat,
 * gehört ihm, nicht dem System.
 */
export function UngespeichertWache({ frage }: { frage: string }) {
  useEffect(() => {
    let offen = false

    const bewacht = (ziel: EventTarget | null): boolean => {
      if (!(ziel instanceof HTMLElement)) return false
      const feld = ziel.closest("input, select, textarea")
      if (!feld) return false
      /*
       * Suchfelder und Passwörter sind keine ungespeicherte Arbeit: Das eine
       * ist eine Frage an die Liste, das andere darf ohnehin nirgends liegen
       * bleiben.
       */
      const art = (feld as HTMLInputElement).type
      if (art === "search" || art === "password") return false
      const formular = feld.closest("form")
      if (!formular) return false
      return formular.dataset.wache !== "aus"
    }

    const geaendert = (e: Event) => { if (bewacht(e.target)) offen = true }
    /* Abgeschickt ist nicht mehr ungespeichert — auch wenn die Antwort noch läuft. */
    const abgeschickt = () => { offen = false }

    const beimVerlassen = (e: BeforeUnloadEvent) => {
      if (!offen) return
      e.preventDefault()
      /* Ältere Browser brauchen den Rückgabewert, neue ignorieren ihn. */
      e.returnValue = ""
    }

    const beimKlick = (e: MouseEvent) => {
      if (!offen || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const ziel = e.target instanceof HTMLElement ? e.target.closest("a[href]") : null
      if (!(ziel instanceof HTMLAnchorElement)) return
      if (ziel.target === "_blank" || ziel.hasAttribute("download")) return
      const adresse = new URL(ziel.href, window.location.href)
      if (adresse.origin !== window.location.origin) return
      if (adresse.pathname === window.location.pathname && adresse.hash) return
      if (!window.confirm(frage)) {
        e.preventDefault()
        e.stopPropagation()
      } else {
        offen = false
      }
    }

    document.addEventListener("input", geaendert, true)
    document.addEventListener("change", geaendert, true)
    document.addEventListener("submit", abgeschickt, true)
    window.addEventListener("beforeunload", beimVerlassen)
    document.addEventListener("click", beimKlick, true)
    return () => {
      document.removeEventListener("input", geaendert, true)
      document.removeEventListener("change", geaendert, true)
      document.removeEventListener("submit", abgeschickt, true)
      window.removeEventListener("beforeunload", beimVerlassen)
      document.removeEventListener("click", beimKlick, true)
    }
  }, [frage])

  return null
}
