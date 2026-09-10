import { KarriereRoute, karriereMetadata } from "@/app/_routes/karriere"

export const metadata = karriereMetadata("de")

export default function Page() {
  return <KarriereRoute locale="de" />
}
