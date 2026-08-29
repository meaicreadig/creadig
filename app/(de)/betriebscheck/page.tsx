import { BetriebscheckRoute, betriebscheckMetadata } from "@/app/_routes/betriebscheck"

export const metadata = betriebscheckMetadata("de")

export default function Page() {
  return <BetriebscheckRoute locale="de" />
}
