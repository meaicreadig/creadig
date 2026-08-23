import { ArbeitenRoute, arbeitenMetadata } from "@/app/_routes/arbeiten"

export const metadata = arbeitenMetadata("de")

export default function Page() {
  return <ArbeitenRoute locale="de" />
}
