import { BetriebRoute, betriebMetadata } from "@/app/_routes/betrieb"

export const metadata = betriebMetadata("ar")

export default function Page() {
  return <BetriebRoute locale="ar" />
}
