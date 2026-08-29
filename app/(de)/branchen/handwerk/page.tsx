import { HandwerkRoute, handwerkMetadata } from "@/app/_routes/branche-handwerk"

export const metadata = handwerkMetadata("de")

export default function Page() {
  return <HandwerkRoute locale="de" />
}
