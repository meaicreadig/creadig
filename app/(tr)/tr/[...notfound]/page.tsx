import { notFound } from "next/navigation"

/** BF-3 — das türkische Gegenstück: alles unter `/tr/…`, das es nicht gibt. */
export default function CatchAll() {
  notFound()
}
