import { KontaktRoute, kontaktMetadata } from "@/app/_routes/kontakt"

export const metadata = kontaktMetadata("tr")

export default function Page() {
  return <KontaktRoute locale="tr" />
}
