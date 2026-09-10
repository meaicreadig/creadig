import { KarriereSpurARoute, karriereSpurAMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurAMetadata("tr")

export default function Page() {
  return <KarriereSpurARoute locale="tr" />
}
