import { KarriereSpurBRoute, karriereSpurBMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurBMetadata("ar")

export default function Page() {
  return <KarriereSpurBRoute locale="ar" />
}
