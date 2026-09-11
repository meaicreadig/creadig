import { AufwandsrechnerRoute, aufwandsrechnerMetadata } from "@/app/_routes/aufwandsrechner"

export const metadata = aufwandsrechnerMetadata("tr")

export default function Page() {
  return <AufwandsrechnerRoute locale="tr" />
}
