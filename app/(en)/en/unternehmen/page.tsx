import { UnternehmenRoute, unternehmenMetadata } from "@/app/_routes/unternehmen"

export const metadata = unternehmenMetadata("en")

export default function Page() {
  return <UnternehmenRoute locale="en" />
}
