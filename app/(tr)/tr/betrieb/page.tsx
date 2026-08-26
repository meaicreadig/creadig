import { BetriebRoute, betriebMetadata } from "@/app/_routes/betrieb"

export const metadata = betriebMetadata("tr")

export default function Page() {
  return <BetriebRoute locale="tr" />
}
