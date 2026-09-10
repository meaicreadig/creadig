import { KarriereSpurBRoute, karriereSpurBMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurBMetadata("en")

export default function Page() {
  return <KarriereSpurBRoute locale="en" />
}
