import { KarriereSpurARoute, karriereSpurAMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurAMetadata("ar")

export default function Page() {
  return <KarriereSpurARoute locale="ar" />
}
