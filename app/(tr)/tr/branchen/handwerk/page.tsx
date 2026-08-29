import { HandwerkRoute, handwerkMetadata } from "@/app/_routes/branche-handwerk"

export const metadata = handwerkMetadata("tr")

export default function Page() {
  return <HandwerkRoute locale="tr" />
}
