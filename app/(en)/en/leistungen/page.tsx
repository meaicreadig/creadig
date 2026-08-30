import { LeistungenRoute, leistungenMetadata } from "@/app/_routes/leistungen"

export const metadata = leistungenMetadata("en")

export default function Page() {
  return <LeistungenRoute locale="en" />
}
