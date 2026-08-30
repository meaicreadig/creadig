import { ProdukteRoute, produkteMetadata } from "@/app/_routes/produkte"

export const metadata = produkteMetadata("en")

export default function Page() {
  return <ProdukteRoute locale="en" />
}
