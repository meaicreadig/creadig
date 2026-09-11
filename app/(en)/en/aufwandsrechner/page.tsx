import { AufwandsrechnerRoute, aufwandsrechnerMetadata } from "@/app/_routes/aufwandsrechner"

export const metadata = aufwandsrechnerMetadata("en")

export default function Page() {
  return <AufwandsrechnerRoute locale="en" />
}
