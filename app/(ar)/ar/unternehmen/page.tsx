import { UnternehmenRoute, unternehmenMetadata } from "@/app/_routes/unternehmen"

export const metadata = unternehmenMetadata("ar")

export default function Page() {
  return <UnternehmenRoute locale="ar" />
}
