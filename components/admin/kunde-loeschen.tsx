"use client"

import { Trash2 } from "lucide-react"

import { kundeLoeschen } from "@/app/(admin)/admin/kunden/actions"

export function KundeLoeschen({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={kundeLoeschen}
      onSubmit={(e) => {
        if (!window.confirm(`„${name}“ wirklich löschen? Kontakte bleiben erhalten, nur die Firmenzuordnung entfällt.`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`${name} löschen`}
        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </form>
  )
}
