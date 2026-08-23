import { TerminRoute, terminMetadata } from "@/app/_routes/termin"

export const metadata = terminMetadata("tr")

export default function Page() {
  return <TerminRoute />
}
