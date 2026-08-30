import { TerminRoute, terminMetadata } from "@/app/_routes/termin"

export const metadata = terminMetadata("ar")

export default function Page() {
  return <TerminRoute />
}
