import { LegalRoute, legalMetadata } from "@/app/_routes/legal"

export const metadata = legalMetadata("imprint", "tr")

export default function Page() {
  return <LegalRoute kind="imprint" />
}
