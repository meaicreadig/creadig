import { KarriereRoute, karriereMetadata } from "@/app/_routes/karriere"

export const metadata = karriereMetadata("tr")

export default function Page() {
  return <KarriereRoute locale="tr" />
}
