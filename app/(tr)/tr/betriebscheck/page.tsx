import { BetriebscheckRoute, betriebscheckMetadata } from "@/app/_routes/betriebscheck"

export const metadata = betriebscheckMetadata("tr")

export default function Page() {
  return <BetriebscheckRoute locale="tr" />
}
