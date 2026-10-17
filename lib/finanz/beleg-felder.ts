/**
 * Reine Daten, kein "server-only" — darf auch ein Client-Component
 * importieren (components/finanz/belege/upload.tsx). lib/finanz/belege.ts
 * reexportiert dieselben Namen fuer den Server-Code, der schon darauf zeigt.
 */
export const GESCHAEFTSFELDER = [
  { key: "glasfaser", label: "Glasfaser-Dienstleistung" },
  { key: "it", label: "IT-Dienstleistung" },
  { key: "software", label: "Software-Abo" },
  { key: "ecommerce", label: "E-Commerce" },
  { key: "privat", label: "Privat / nicht betrieblich" },
  { key: "sonstiges", label: "Sonstiges" },
] as const

export type Geschaeftsfeld = (typeof GESCHAEFTSFELDER)[number]["key"]
export const istGeschaeftsfeld = (v: string): v is Geschaeftsfeld => GESCHAEFTSFELDER.some((g) => g.key === v)

export const HAND_UPLOAD_MAX_BYTES = 20 * 1024 * 1024
export const HAND_UPLOAD_TYPEN = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/xml",
  "text/xml",
] as const
