import { LegalRoute, legalMetadata } from "@/app/_routes/legal"

export const metadata = legalMetadata("imprint", "de")

export default function Page() {
  return <LegalRoute kind="imprint" />
}
