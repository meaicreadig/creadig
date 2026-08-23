import { UnternehmenRoute, unternehmenMetadata } from "@/app/_routes/unternehmen"

export const metadata = unternehmenMetadata("de")

export default function Page() {
  return <UnternehmenRoute locale="de" />
}
