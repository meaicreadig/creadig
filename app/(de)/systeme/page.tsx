import { SystemeRoute, systemeMetadata } from "@/app/_routes/systeme"

export const metadata = systemeMetadata("de")

export default function Page() {
  return <SystemeRoute locale="de" />
}
