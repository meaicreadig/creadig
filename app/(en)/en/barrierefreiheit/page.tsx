import { BarrierefreiheitRoute, barrierefreiheitMetadata } from "@/app/_routes/barrierefreiheit"

/** Übersetzte Adresse — die einzige im Projekt, siehe `lib/routes.ts`. */
export const metadata = barrierefreiheitMetadata("en")

export default function Page() {
  return <BarrierefreiheitRoute locale="en" />
}
