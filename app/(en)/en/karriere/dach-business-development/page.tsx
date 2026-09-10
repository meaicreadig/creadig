import { KarriereSpurARoute, karriereSpurAMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurAMetadata("en")

export default function Page() {
  return <KarriereSpurARoute locale="en" />
}
