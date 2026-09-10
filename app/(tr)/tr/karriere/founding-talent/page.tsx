import { KarriereSpurBRoute, karriereSpurBMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurBMetadata("tr")

export default function Page() {
  return <KarriereSpurBRoute locale="tr" />
}
