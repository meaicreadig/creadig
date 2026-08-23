import { KontaktRoute, kontaktMetadata } from "@/app/_routes/kontakt"

export const metadata = kontaktMetadata("de")

export default function Page() {
  return <KontaktRoute locale="de" />
}
