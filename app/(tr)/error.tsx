"use client"

import { useEffect } from "react"
import { StatusPageBody } from "@/components/pages/status-page-body"
import { dictionary } from "@/lib/dictionary"

/** BF-3 — das türkische Gegenstück zu `app/(de)/error.tsx`. */
const copy = dictionary.tr.errorPages.serverError

export default function TrError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[error] tuerkischer Baum:", error.digest ?? error.message)
  }, [error])

  return (
    <StatusPageBody
      locale="tr"
      eyebrow={copy.eyebrow}
      title={copy.title}
      lead={copy.lead}
      action={{ label: copy.retry, onClick: reset }}
    />
  )
}
