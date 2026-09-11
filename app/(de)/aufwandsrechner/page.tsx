import { AufwandsrechnerRoute, aufwandsrechnerMetadata } from "@/app/_routes/aufwandsrechner"

export const metadata = aufwandsrechnerMetadata("de")

export default function Page() {
  return <AufwandsrechnerRoute locale="de" />
}
