import { KarriereSpurARoute, karriereSpurAMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurAMetadata("de")

export default function Page() {
  return <KarriereSpurARoute locale="de" />
}
