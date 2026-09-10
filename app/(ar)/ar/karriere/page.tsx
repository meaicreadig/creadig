import { KarriereRoute, karriereMetadata } from "@/app/_routes/karriere"

export const metadata = karriereMetadata("ar")

export default function Page() {
  return <KarriereRoute locale="ar" />
}
