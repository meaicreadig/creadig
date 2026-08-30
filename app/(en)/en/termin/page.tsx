import { TerminRoute, terminMetadata } from "@/app/_routes/termin"

export const metadata = terminMetadata("en")

export default function Page() {
  return <TerminRoute />
}
