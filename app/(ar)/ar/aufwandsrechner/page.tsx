import { AufwandsrechnerRoute, aufwandsrechnerMetadata } from "@/app/_routes/aufwandsrechner"

export const metadata = aufwandsrechnerMetadata("ar")

export default function Page() {
  return <AufwandsrechnerRoute locale="ar" />
}
