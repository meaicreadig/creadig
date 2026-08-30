import { BetriebscheckRoute, betriebscheckMetadata } from "@/app/_routes/betriebscheck"

export const metadata = betriebscheckMetadata("ar")

export default function Page() {
  return <BetriebscheckRoute locale="ar" />
}
