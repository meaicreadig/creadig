import { BetriebRoute, betriebMetadata } from "@/app/_routes/betrieb"

export const metadata = betriebMetadata("de")

export default function Page() {
  return <BetriebRoute locale="de" />
}
