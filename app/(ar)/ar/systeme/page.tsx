import { SystemeRoute, systemeMetadata } from "@/app/_routes/systeme"

export const metadata = systemeMetadata("ar")

export default function Page() {
  return <SystemeRoute locale="ar" />
}
