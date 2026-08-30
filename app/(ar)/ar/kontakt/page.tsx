import { KontaktRoute, kontaktMetadata } from "@/app/_routes/kontakt"

export const metadata = kontaktMetadata("ar")

export default function Page() {
  return <KontaktRoute locale="ar" />
}
