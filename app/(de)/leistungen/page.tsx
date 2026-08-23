import { LeistungenRoute, leistungenMetadata } from "@/app/_routes/leistungen"

export const metadata = leistungenMetadata("de")

export default function Page() {
  return <LeistungenRoute locale="de" />
}
