import { ArbeitenRoute, arbeitenMetadata } from "@/app/_routes/arbeiten"

export const metadata = arbeitenMetadata("ar")

export default function Page() {
  return <ArbeitenRoute locale="ar" />
}
