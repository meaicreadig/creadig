"use client"

import { useEffect } from "react"
import { merkeErstkontakt } from "@/lib/herkunft-client"

export function HerkunftMerker() {
  useEffect(() => {
    merkeErstkontakt()
  }, [])
  return null
}
