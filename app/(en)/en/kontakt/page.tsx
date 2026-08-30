import { KontaktRoute, kontaktMetadata } from "@/app/_routes/kontakt"

export const metadata = kontaktMetadata("en")

export default function Page() {
  return <KontaktRoute locale="en" />
}
