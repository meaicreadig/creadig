import { TerminRoute, terminMetadata } from "@/app/_routes/termin"

export const metadata = terminMetadata("de")

export default function Page() {
  return <TerminRoute />
}
