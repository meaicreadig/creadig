import { HandwerkRoute, handwerkMetadata } from "@/app/_routes/branche-handwerk"

export const metadata = handwerkMetadata("en")

export default function Page() {
  return <HandwerkRoute locale="en" />
}
