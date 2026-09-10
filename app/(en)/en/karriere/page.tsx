import { KarriereRoute, karriereMetadata } from "@/app/_routes/karriere"

export const metadata = karriereMetadata("en")

export default function Page() {
  return <KarriereRoute locale="en" />
}
