import { LegalRoute, legalMetadata } from "@/app/_routes/legal"

export const metadata = legalMetadata("privacy", "de")

export default function Page() {
  return <LegalRoute kind="privacy" />
}
