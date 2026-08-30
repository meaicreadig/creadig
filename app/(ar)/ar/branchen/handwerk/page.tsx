import { HandwerkRoute, handwerkMetadata } from "@/app/_routes/branche-handwerk"

export const metadata = handwerkMetadata("ar")

export default function Page() {
  return <HandwerkRoute locale="ar" />
}
