import { ProdukteRoute, produkteMetadata } from "@/app/_routes/produkte"

export const metadata = produkteMetadata("de")

export default function Page() {
  return <ProdukteRoute locale="de" />
}
