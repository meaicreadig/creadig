import { UnternehmenRoute, unternehmenMetadata } from "@/app/_routes/unternehmen"

export const metadata = unternehmenMetadata("tr")

export default function Page() {
  return <UnternehmenRoute locale="tr" />
}
