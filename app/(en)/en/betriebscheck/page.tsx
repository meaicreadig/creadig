import { BetriebscheckRoute, betriebscheckMetadata } from "@/app/_routes/betriebscheck"

export const metadata = betriebscheckMetadata("en")

export default function Page() {
  return <BetriebscheckRoute locale="en" />
}
