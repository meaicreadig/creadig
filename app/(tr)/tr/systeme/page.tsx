import { SystemeRoute, systemeMetadata } from "@/app/_routes/systeme"

export const metadata = systemeMetadata("tr")

export default function Page() {
  return <SystemeRoute locale="tr" />
}
