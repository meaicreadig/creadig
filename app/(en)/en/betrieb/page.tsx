import { BetriebRoute, betriebMetadata } from "@/app/_routes/betrieb"

export const metadata = betriebMetadata("en")

export default function Page() {
  return <BetriebRoute locale="en" />
}
