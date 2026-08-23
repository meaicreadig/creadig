import { ArbeitenRoute, arbeitenMetadata } from "@/app/_routes/arbeiten"

export const metadata = arbeitenMetadata("tr")

export default function Page() {
  return <ArbeitenRoute locale="tr" />
}
