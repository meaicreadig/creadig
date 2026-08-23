import { BarrierefreiheitRoute, barrierefreiheitMetadata } from "@/app/_routes/barrierefreiheit"

export const metadata = barrierefreiheitMetadata("de")

export default function Page() {
  return <BarrierefreiheitRoute locale="de" />
}
