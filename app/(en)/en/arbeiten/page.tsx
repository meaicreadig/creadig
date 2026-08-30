import { ArbeitenRoute, arbeitenMetadata } from "@/app/_routes/arbeiten"

export const metadata = arbeitenMetadata("en")

export default function Page() {
  return <ArbeitenRoute locale="en" />
}
