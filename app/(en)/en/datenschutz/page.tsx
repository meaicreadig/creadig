import { LegalRoute, legalMetadata } from "@/app/_routes/legal"

export const metadata = legalMetadata("privacy", "tr")

export default function Page() {
  return <LegalRoute kind="privacy" />
}
