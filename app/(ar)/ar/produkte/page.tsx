import { ProdukteRoute, produkteMetadata } from "@/app/_routes/produkte"

export const metadata = produkteMetadata("ar")

export default function Page() {
  return <ProdukteRoute locale="ar" />
}
