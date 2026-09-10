import { KarriereSpurBRoute, karriereSpurBMetadata } from "@/app/_routes/karriere"

export const metadata = karriereSpurBMetadata("de")

export default function Page() {
  return <KarriereSpurBRoute locale="de" />
}
