import { LeistungenRoute, leistungenMetadata } from "@/app/_routes/leistungen"

export const metadata = leistungenMetadata("tr")

export default function Page() {
  return <LeistungenRoute locale="tr" />
}
