import { SystemeRoute, systemeMetadata } from "@/app/_routes/systeme"

export const metadata = systemeMetadata("en")

export default function Page() {
  return <SystemeRoute locale="en" />
}
