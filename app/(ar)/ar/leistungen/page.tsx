import { LeistungenRoute, leistungenMetadata } from "@/app/_routes/leistungen"

export const metadata = leistungenMetadata("ar")

export default function Page() {
  return <LeistungenRoute locale="ar" />
}
